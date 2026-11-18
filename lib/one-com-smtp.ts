import { connect } from "cloudflare:sockets";

const encoder = new TextEncoder();

function timeout<T>(promise: Promise<T>, description: string, milliseconds = 12000): Promise<T> {
  let timer: ReturnType<typeof setTimeout>;
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => {
      timer = setTimeout(() => reject(new Error(`${description} timed out`)), milliseconds);
    }),
  ]).finally(() => clearTimeout(timer!));
}

function toBase64(value: string | Uint8Array) {
  const bytes = typeof value === "string" ? encoder.encode(value) : value;
  let binary = "";
  for (let offset = 0; offset < bytes.length; offset += 0x4000) {
    binary += String.fromCharCode(...bytes.subarray(offset, offset + 0x4000));
  }
  return btoa(binary);
}

function encodedHeader(value: string) {
  const words: string[] = [];
  let chunk = "";
  for (const character of value) {
    const candidate = chunk + character;
    if (chunk && toBase64(candidate).length > 56) {
      words.push(`=?UTF-8?B?${toBase64(chunk)}?=`);
      chunk = character;
    } else {
      chunk = candidate;
    }
  }
  if (chunk) words.push(`=?UTF-8?B?${toBase64(chunk)}?=`);
  return words.join("\r\n ");
}

function base64Lines(value: string) {
  const encoded = toBase64(value);
  const lines: string[] = [];
  for (let offset = 0; offset < encoded.length; offset += 76) lines.push(encoded.slice(offset, offset + 76));
  return lines.join("\r\n");
}

function dotStuff(value: string) {
  return value.replace(/\r?\n/g, "\r\n").replace(/(^|\r\n)\./g, "$1..");
}

function safeMailbox(value: string) {
  const mailbox = value.trim();
  if (!/^[^\s<>\r\n@]+@[^\s<>\r\n@]+\.[^\s<>\r\n@]+$/.test(mailbox)) {
    throw new Error("Invalid SMTP mailbox configuration");
  }
  return mailbox;
}

class SmtpSession {
  private socket: Socket;
  private reader: ReadableStreamDefaultReader<Uint8Array>;
  private writer: WritableStreamDefaultWriter<Uint8Array>;
  private buffer = "";
  private decoder = new TextDecoder();

  constructor(socket: Socket) {
    this.socket = socket;
    this.reader = socket.readable.getReader();
    this.writer = socket.writable.getWriter();
  }

  async readReply() {
    const lines: string[] = [];
    while (true) {
      let lineEnd = this.buffer.indexOf("\r\n");
      while (lineEnd < 0) {
        const part = await timeout(this.reader.read(), "SMTP server response");
        if (part.done) throw new Error("SMTP connection closed unexpectedly");
        this.buffer += this.decoder.decode(part.value, { stream: true });
        lineEnd = this.buffer.indexOf("\r\n");
      }

      const line = this.buffer.slice(0, lineEnd);
      this.buffer = this.buffer.slice(lineEnd + 2);
      lines.push(line);
      if (/^\d{3} /.test(line)) break;
      if (!/^\d{3}-/.test(line)) throw new Error("Invalid SMTP response");
    }

    const code = Number(lines.at(-1)?.slice(0, 3));
    return { code, lines };
  }

  async command(command: string, expected: number[]) {
    await this.write(`${command}\r\n`);
    const reply = await this.readReply();
    if (!expected.includes(reply.code)) throw new Error(`SMTP server returned ${reply.code}`);
    return reply;
  }

  async write(value: string | Uint8Array) {
    await timeout(this.writer.write(typeof value === "string" ? encoder.encode(value) : value), "SMTP data");
  }

  async startTls() {
    this.reader.releaseLock();
    this.writer.releaseLock();
    this.socket = this.socket.startTls();
    this.reader = this.socket.readable.getReader();
    this.writer = this.socket.writable.getWriter();
    this.buffer = "";
    this.decoder = new TextDecoder();
  }

  async close() {
    try { this.reader.releaseLock(); } catch { /* already released during STARTTLS */ }
    try { this.writer.releaseLock(); } catch { /* already released during STARTTLS */ }
    try { await this.socket.close(); } catch { /* the peer may already have closed */ }
  }
}

export type OneComMessage = {
  username: string;
  password: string;
  from: string;
  to: string[];
  subject: string;
  text: string;
  html: string;
  replyTo?: string;
  attachments?: Array<{ filename: string; contentType: string; bytes: Uint8Array }>;
};

export async function sendWithOneCom(message: OneComMessage) {
  const username = safeMailbox(message.username);
  const from = safeMailbox(message.from);
  const recipients = message.to.map(safeMailbox);
  if (!recipients.length || from.toLowerCase() !== username.toLowerCase()) {
    throw new Error("SMTP sender must match the authenticated one.com mailbox");
  }
  if (!message.password) throw new Error("Missing one.com SMTP password");

  const socket = connect({ hostname: "send.one.com", port: 587 }, { secureTransport: "starttls", allowHalfOpen: true });
  await timeout(socket.opened, "SMTP connection");
  const session = new SmtpSession(socket);

  try {
    const greeting = await session.readReply();
    if (greeting.code !== 220) throw new Error(`SMTP server returned ${greeting.code}`);
    await session.command("EHLO fliesen-miller.de", [250]);
    await session.command("STARTTLS", [220]);
    await session.startTls();
    await session.command("EHLO fliesen-miller.de", [250]);
    await session.command("AUTH LOGIN", [334]);
    await session.command(toBase64(username), [334]);
    await session.command(toBase64(message.password), [235]);
    await session.command(`MAIL FROM:<${from}>`, [250]);
    for (const recipient of recipients) {
      await session.command(`RCPT TO:<${recipient}>`, [250, 251]);
    }
    await session.command("DATA", [354]);

    const boundary = `fliesen-miller-${crypto.randomUUID()}`;
    const fromHeader = `Fliesen Miller <${from}>`;
    const headers = [
      `From: ${fromHeader}`,
      `To: ${recipients.join(", ")}`,
      `Subject: ${encodedHeader(message.subject)}`,
      `Date: ${new Date().toUTCString()}`,
      `Message-ID: <${crypto.randomUUID()}@fliesen-miller.de>`,
      ...(message.replyTo ? [`Reply-To: ${safeMailbox(message.replyTo)}`] : []),
      "MIME-Version: 1.0",
      ...(message.attachments?.length
        ? [`Content-Type: multipart/mixed; boundary="${boundary}"`]
        : [`Content-Type: multipart/alternative; boundary="${boundary}"`]),
    ];
    const alternativeBoundary = `${boundary}-alternative`;
    const bodyStart = [
      ...headers,
      "",
      ...(message.attachments?.length ? [
        `--${boundary}`,
        `Content-Type: multipart/alternative; boundary="${alternativeBoundary}"`,
        "",
      ] : []),
      `--${message.attachments?.length ? alternativeBoundary : boundary}`,
      "Content-Type: text/plain; charset=UTF-8",
      "Content-Transfer-Encoding: base64",
      "",
      base64Lines(message.text),
      `--${message.attachments?.length ? alternativeBoundary : boundary}`,
      "Content-Type: text/html; charset=UTF-8",
      "Content-Transfer-Encoding: base64",
      "",
      base64Lines(message.html),
      `--${message.attachments?.length ? alternativeBoundary : boundary}--`,
      ...(message.attachments?.length ? [""] : []),
    ].join("\r\n");
    await session.write(dotStuff(bodyStart) + "\r\n");

    for (const attachment of message.attachments || []) {
      const type = ["image/jpeg", "image/png", "image/webp", "application/pdf"].includes(attachment.contentType)
        ? attachment.contentType
        : "application/octet-stream";
      const fallbackName = attachment.filename.replace(/[^\x20-\x7e]/g, "_").replace(/["\\]/g, "_");
      const encodedName = encodeURIComponent(attachment.filename).replace(/[!'()*]/g, character => `%${character.charCodeAt(0).toString(16).toUpperCase()}`);
      await session.write([
        `--${boundary}`,
        `Content-Type: ${type}; name="${fallbackName}"`,
        `Content-Disposition: attachment; filename="${fallbackName}"; filename*=UTF-8''${encodedName}`,
        "Content-Transfer-Encoding: base64",
        "",
      ].join("\r\n") + "\r\n");

      for (let offset = 0; offset < attachment.bytes.length; offset += 57) {
        await session.write(`${toBase64(attachment.bytes.subarray(offset, offset + 57))}\r\n`);
      }
      await session.write("\r\n");
    }

    if (message.attachments?.length) await session.write(`--${boundary}--\r\n`);
    await session.write(".\r\n");
    const accepted = await session.readReply();
    if (accepted.code !== 250) throw new Error(`SMTP server returned ${accepted.code}`);
    try { await session.command("QUIT", [221]); } catch { /* delivery was already accepted */ }
    return accepted;
  } finally {
    await session.close();
  }
}
