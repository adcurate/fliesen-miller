import { areaLabels, projectLabels, sizeLabels, timeLabels, site } from "@/lib/site";
import { getRuntimeConfig } from "@/lib/runtime-config";
import { sendWithOneCom } from "@/lib/one-com-smtp";

type InquiryRecord = {
  id: string;
  name: string;
  phone: string;
  email: string;
  city: string;
  project_type: string;
  area: string;
  multi_areas: string;
  multi_areas_description: string;
  size: string;
  timeframe: string;
  details: string;
  source_page: string;
  created_at: string;
};

export type InquiryAttachment = { filename: string; size: number; content_type: string; bytes: Uint8Array };
type NotificationRuntime = ReturnType<typeof getRuntimeConfig>;

type NotificationStatus = "sent" | "failed" | "not_configured";
const multiAreaLabels: Record<string, string> = {
  bad: "Badezimmer",
  kueche: "Küche",
  wohnbereich: "Wohnbereich",
  flur: "Flur / Eingangsbereich",
  technik: "Technikraum / HWR",
  terrasse: "Terrasse / Außenbereich",
  gewerbe: "Gewerbe / Sonstiges",
};

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, character => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;",
  })[character]!);
}

function valueLabel(labels: Record<string, string>, value: string) {
  return labels[value] || value || "Nicht angegeben";
}

function areasFor(inquiry: InquiryRecord) {
  if (inquiry.area !== "mehrere") return valueLabel(areaLabels, inquiry.area);
  try {
    const selected = JSON.parse(inquiry.multi_areas) as unknown;
    if (Array.isArray(selected)) {
      const labels = selected.filter((item): item is string => typeof item === "string").map(item => multiAreaLabels[item] || item);
      if (labels.length) return labels.join(", ");
    }
  } catch {
    // Keep the saved request readable if older or malformed data is encountered.
  }
  return valueLabel(areaLabels, inquiry.area);
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("de-DE", {
    dateStyle: "long", timeStyle: "short", timeZone: "Europe/Berlin",
  }).format(date);
}

function emailContent(inquiry: InquiryRecord, attachments: InquiryAttachment[], siteUrl: string) {
  const reference = `FM-${inquiry.id.slice(0, 8).toUpperCase()}`;
  const logoUrl = new URL("/media/logo.webp", siteUrl).toString();
  const project = valueLabel(projectLabels, inquiry.project_type);
  const area = areasFor(inquiry);
  const size = valueLabel(sizeLabels, inquiry.size);
  const timeframe = valueLabel(timeLabels, inquiry.timeframe);
  const rows: [string, string][] = [
    ["Projektart", project],
    ["Bereich", area],
    ["Größe", size],
    ["Zeitraum", timeframe],
    ["Projektort", inquiry.city || "Nicht angegeben"],
  ];
  const contacts: [string, string][] = [["Name", inquiry.name]];
  if (inquiry.phone) contacts.push(["Telefon", inquiry.phone]);
  if (inquiry.email) contacts.push(["E-Mail", inquiry.email]);

  const htmlRows = rows.map(([label, value]) => `<tr>
    <td bgcolor="#191c16" style="padding:11px 14px;border-bottom:1px solid #34392f;color:#a5a99e;font:12px/1.5 Arial,Helvetica,sans-serif;vertical-align:top;width:34%;background-color:#191c16">${escapeHtml(label)}</td>
    <td bgcolor="#191c16" style="padding:11px 14px;border-bottom:1px solid #34392f;color:#f0f1ed;font:13px/1.6 Arial,Helvetica,sans-serif;overflow-wrap:anywhere;background-color:#191c16">${escapeHtml(value)}</td>
  </tr>`).join("");
  const safePhone = inquiry.phone.replace(/[^\d+]/g, "");
  const responseUrl = inquiry.email
    ? `mailto:${inquiry.email}?subject=${encodeURIComponent(`Ihre Projektanfrage bei Fliesen Miller (${reference})`)}`
    : `tel:${safePhone}`;
  const responseLabel = inquiry.email ? "Per E-Mail antworten" : "Interessenten anrufen";
  const htmlContactRows = contacts.map(([label, value]) => {
    const linkedValue = label === "Telefon"
      ? `<a href="tel:${escapeHtml(safePhone)}" style="color:#8cc53f;text-decoration:none">${escapeHtml(value)}</a>`
      : label === "E-Mail"
        ? `<a href="mailto:${escapeHtml(inquiry.email)}" style="color:#8cc53f;text-decoration:none">${escapeHtml(value)}</a>`
        : escapeHtml(value);
    return `<tr><td bgcolor="#171a14" style="padding:10px 14px;border-top:1px solid #34392f;color:#a5a99e;font:12px/1.5 Arial,Helvetica,sans-serif;vertical-align:top;width:34%;background-color:#171a14">${escapeHtml(label)}</td><td bgcolor="#171a14" style="padding:10px 14px;border-top:1px solid #34392f;color:#f0f1ed;font:13px/1.6 Arial,Helvetica,sans-serif;overflow-wrap:anywhere;background-color:#171a14">${linkedValue}</td></tr>`;
  }).join("");
  const contactHtml = `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" bgcolor="#171a14" style="width:100%;margin-top:22px;border:1px solid #34392f;border-radius:6px;background-color:#171a14"><tr><td colspan="2" bgcolor="#171a14" style="padding:14px 14px 10px;color:#8cc53f;font:600 11px/1.5 Arial,Helvetica,sans-serif;letter-spacing:.08em;text-transform:uppercase;background-color:#171a14">Kontaktinformationen</td></tr>${htmlContactRows}</table>`;
  const filesHtml = attachments.length
    ? `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" bgcolor="#171a14" style="width:100%;margin-top:22px;border:1px solid #34392f;border-radius:6px;background-color:#171a14"><tr><td bgcolor="#171a14" style="padding:16px 18px;background-color:#171a14">
        <div style="color:#f0f1ed;font:600 13px/1.5 Arial,Helvetica,sans-serif;margin-bottom:8px">Dateien (${attachments.length})</div>
        <ul style="margin:0;padding-left:18px;color:#c4c8bd;font:12px/1.8 Arial,Helvetica,sans-serif">${attachments.map(file => `<li>${escapeHtml(file.filename)} · ${(file.size / 1024 / 1024).toFixed(2)} MB</li>`).join("")}</ul>
        <p style="margin:10px 0 0;color:#a5a99e;font:11px/1.6 Arial,Helvetica,sans-serif">Die Dateien sind dieser E-Mail direkt angehängt.</p>
      </td></tr></table>`
    : "";
  const descriptionHtml = inquiry.multi_areas_description || inquiry.details
    ? `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" bgcolor="#171a14" style="width:100%;margin-top:22px;border:1px solid #34392f;border-radius:6px;background-color:#171a14"><tr><td bgcolor="#171a14" style="padding:16px 18px;background-color:#171a14">
        <div style="color:#8cc53f;font:600 11px/1.5 Arial,Helvetica,sans-serif;letter-spacing:.08em;text-transform:uppercase;margin-bottom:8px">Projektbeschreibung</div>
        ${inquiry.multi_areas_description ? `<p style="margin:0 0 10px;color:#f0f1ed;font:13px/1.7 Arial,Helvetica,sans-serif;white-space:pre-wrap;overflow-wrap:anywhere">${escapeHtml(inquiry.multi_areas_description)}</p>` : ""}
        ${inquiry.details ? `<p style="margin:0;color:#f0f1ed;font:13px/1.7 Arial,Helvetica,sans-serif;white-space:pre-wrap;overflow-wrap:anywhere">${escapeHtml(inquiry.details)}</p>` : ""}
      </td></tr></table>`
    : "";
  const preheader = `${inquiry.name} · ${project} · ${inquiry.city || "Ort offen"} · ${reference}`;
  const html = `<!doctype html><html lang="de"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Neue Projektanfrage</title></head>
  <body bgcolor="#ffffff" style="margin:0;padding:0;background-color:#ffffff;color:#11140f;font-family:Arial,Helvetica,sans-serif">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent">${escapeHtml(preheader)}</div>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" bgcolor="#ffffff" style="background-color:#ffffff;width:100%"><tr><td align="center" bgcolor="#ffffff" style="padding:28px 12px;background-color:#ffffff">
      <table role="presentation" width="620" cellspacing="0" cellpadding="0" border="0" bgcolor="#191c16" style="width:100%;max-width:620px;border:1px solid #30352b;background-color:#191c16;border-radius:8px;overflow:hidden">
        <tr><td height="5" bgcolor="#8cc53f" style="height:5px;background-color:#8cc53f;font-size:0;line-height:0">&nbsp;</td></tr>
        <tr><td bgcolor="#191c16" style="padding:24px 28px;border-bottom:1px solid #30352b;background-color:#191c16">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" bgcolor="#191c16" style="background-color:#191c16"><tr>
            <td><img src="${escapeHtml(logoUrl)}" width="142" alt="Fliesen Miller" style="display:block;width:142px;max-width:100%;height:auto;border:0"></td>
            <td align="right" style="color:#a5a99e;font:10px/1.5 Arial,Helvetica,sans-serif;letter-spacing:.08em;text-transform:uppercase">Projektanfrage<br><span style="color:#8cc53f">${escapeHtml(reference)}</span></td>
          </tr></table>
        </td></tr>
        <tr><td bgcolor="#191c16" style="padding:30px 28px 12px;background-color:#191c16">
          <div style="color:#8cc53f;font:600 10px/1.5 Arial,Helvetica,sans-serif;letter-spacing:.12em;text-transform:uppercase">Neue Anfrage · ${escapeHtml(formatDate(inquiry.created_at))}</div>
          <h1 style="margin:8px 0 10px;color:#f0f1ed;font:700 27px/1.2 Arial,Helvetica,sans-serif;letter-spacing:-.03em">${escapeHtml(inquiry.name)}</h1>
          <p style="margin:0;color:#a5a99e;font:13px/1.7 Arial,Helvetica,sans-serif">${escapeHtml(project)}${inquiry.city ? ` · ${escapeHtml(inquiry.city)}` : ""}</p>
        </td></tr>
        <tr><td bgcolor="#191c16" style="padding:16px 28px 4px;background-color:#191c16"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" bgcolor="#191c16" style="border:1px solid #34392f;border-radius:6px;overflow:hidden;background-color:#191c16">${htmlRows}</table></td></tr>
        <tr><td bgcolor="#191c16" style="padding:0 28px;background-color:#191c16">${contactHtml}</td></tr>
        <tr><td bgcolor="#191c16" style="padding:0 28px 22px;background-color:#191c16">${descriptionHtml}${filesHtml}</td></tr>
        <tr><td align="center" bgcolor="#191c16" style="padding:8px 28px 30px;background-color:#191c16">
          <table role="presentation" cellspacing="0" cellpadding="0" border="0"><tr><td align="center" bgcolor="#8cc53f" style="border-radius:4px;background-color:#8cc53f;padding:13px 22px"><a href="${escapeHtml(responseUrl)}" style="color:#11140f;font:700 12px/1.3 Arial,Helvetica,sans-serif;text-decoration:none">${responseLabel}</a></td></tr></table>
          <p style="margin:13px 0 0;color:#8e9486;font:10px/1.6 Arial,Helvetica,sans-serif">Antworten Sie direkt auf die Anfrage oder rufen Sie zurück.</p>
        </td></tr>
        <tr><td bgcolor="#191c16" style="padding:18px 28px;border-top:1px solid #30352b;color:#a5a99e;font:11px/1.8 Arial,Helvetica,sans-serif;background-color:#191c16">
          Fliesen Miller · ${escapeHtml(site.city)}<br>${escapeHtml(site.street)}<br><a href="tel:${escapeHtml(site.phoneHref.slice(4))}" style="color:#cbd1c3;text-decoration:none">${escapeHtml(site.phone)}</a> · <a href="mailto:${escapeHtml(site.email)}" style="color:#cbd1c3;text-decoration:none">${escapeHtml(site.email)}</a>
        </td></tr>
      </table>
    </td></tr></table>
  </body></html>`;
  const text = [
    "FLIESEN MILLER — NEUE PROJEKTANFRAGE",
    `${reference} · ${formatDate(inquiry.created_at)}`,
    "",
    "KONTAKTINFORMATIONEN",
    ...contacts.map(([label, value]) => `${label}: ${value}`),
    "",
    "PROJEKT",
    ...rows.map(([label, value]) => `${label}: ${value}`),
    inquiry.multi_areas_description ? `\nBeschreibung der Bereiche:\n${inquiry.multi_areas_description}` : "",
    inquiry.details ? `\nWeitere Beschreibung:\n${inquiry.details}` : "",
    attachments.length ? `\nDateien (${attachments.length}) sind dieser E-Mail direkt angehängt:\n${attachments.map(file => `• ${file.filename} (${(file.size / 1024 / 1024).toFixed(2)} MB)`).join("\n")}` : "",
    inquiry.email ? `\nDirekt antworten: ${inquiry.email}` : `\nTelefonisch erreichen: ${inquiry.phone}`,
    `\nFliesen Miller · ${site.street}, ${site.city} · ${site.phone} · ${site.email}`,
  ].filter(Boolean).join("\n");
  return { reference, project, city: inquiry.city, html, text };
}

export async function sendInquiryNotification(inquiry: InquiryRecord, attachments: InquiryAttachment[]): Promise<NotificationStatus> {
  const runtime = getRuntimeConfig();
  const username = runtime.SMTP_USERNAME?.trim();
  const password = runtime.SMTP_PASSWORD;
  if (!username || !password) return "not_configured";

  const recipients = (runtime.INQUIRY_EMAIL_TO || site.email).split(",").map(address => address.trim()).filter(Boolean);
  if (!recipients.length) return "not_configured";
  const siteUrl = (runtime.SITE_URL || site.url).replace(/\/$/, "");
  const content = emailContent(inquiry, attachments, siteUrl);
  const customerName = inquiry.name.replace(/[\r\n\u0000-\u001f]/g, " ").trim().slice(0, 100);
  const subject = `Neue Projektanfrage · ${customerName} · ${content.reference}`;
  const from = runtime.INQUIRY_EMAIL_FROM?.trim() || `Fliesen Miller <${username}>`;
  const fromMatch = from.match(/<([^<>]+)>/);
  const mailbox = fromMatch?.[1]?.trim() || from;

  try {
    await sendWithOneCom({
      username,
      password,
      from: mailbox,
      to: recipients,
      subject,
      html: content.html,
      text: content.text,
      replyTo: inquiry.email || undefined,
      attachments: attachments.map(file => ({ filename: file.filename, contentType: file.content_type, bytes: file.bytes })),
    });
    return "sent";
  } catch (error) {
    console.error("one.com inquiry email delivery failed", inquiry.id, error instanceof Error ? error.name : "unknown");
    return "failed";
  }
}
