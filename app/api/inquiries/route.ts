import { env } from "cloudflare:workers";
import { json, sameOrigin } from "@/lib/http";
import { validateInquiry, validateFileList, MAX_TOTAL_SIZE } from "@/lib/inquiry-validation";
import { sendInquiryNotification, type InquiryAttachment } from "@/lib/inquiry-email";
import { hasMailConfig } from "@/lib/runtime-config";

function matchesType(bytes: Uint8Array, type: string) {
  if (type === "image/jpeg") return bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255;
  if (type === "image/png") return [137, 80, 78, 71, 13, 10, 26, 10].every((value, index) => bytes[index] === value);
  if (type === "application/pdf") return new TextDecoder().decode(bytes.slice(0, 5)) === "%PDF-";
  if (type === "image/webp") return new TextDecoder().decode(bytes.slice(0, 4)) === "RIFF" && new TextDecoder().decode(bytes.slice(8, 12)) === "WEBP";
  return false;
}

const localRateBuckets = new Map<string, { startedAt: number; count: number }>();

async function exceedsRateLimit(request: Request) {
  const address = request.headers.get("cf-connecting-ip")
    || request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    || "local-preview";
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(address));
  const key = Array.from(new Uint8Array(digest), value => value.toString(16).padStart(2, "0")).join("");
  const limiter = env.INQUIRY_LIMITER;

  if (limiter) {
    const result = await limiter.limit({ key });
    return !result.success;
  }
  if (!import.meta.env.DEV) return true;

  const now = Date.now();
  const bucket = localRateBuckets.get(key);
  if (!bucket || now - bucket.startedAt >= 60_000) {
    localRateBuckets.set(key, { startedAt: now, count: 1 });
    return false;
  }
  bucket.count += 1;
  return bucket.count > 3;
}

export async function POST(request: Request) {
  if (!sameOrigin(request)) return json({ error: "Diese Anfrage ist nicht zulässig." }, 403);
  if (!hasMailConfig()) return json({ error: "Das Anfrageformular ist momentan nicht erreichbar. Bitte kontaktieren Sie uns telefonisch." }, 503);
  if (Number(request.headers.get("content-length")) > MAX_TOTAL_SIZE + 1024 * 1024) return json({ error: "Ihre Dateien sind zusammen zu groß (maximal 30 MB)." }, 413);
  if (!request.headers.get("content-type")?.startsWith("multipart/form-data")) return json({ error: "Das Anfrageformat ist ungültig." }, 415);

  try {
    const form = await request.formData();
    const raw = form.get("payload");
    if (typeof raw !== "string" || raw.length > 16000) return json({ error: "Die Anfrage ist unvollständig oder zu lang." }, 400);
    let parsed: unknown;
    try { parsed = JSON.parse(raw); } catch { return json({ error: "Die Anfrage konnte nicht gelesen werden." }, 400); }
    const checked = validateInquiry(parsed);
    if (checked.error || !checked.data) return json({ error: checked.error }, 400);
    const data = checked.data;
    if (data.website) return json({ id: data.idempotencyKey });
    if (!Number.isFinite(data.startedAt) || Date.now() - data.startedAt < 1500 || data.startedAt > Date.now() + 30000) {
      return json({ error: "Bitte prüfen Sie Ihre Angaben und versuchen Sie es erneut." }, 400);
    }
    if (await exceedsRateLimit(request)) return json({ error: "Sie haben gerade mehrere Anfragen gesendet. Bitte versuchen Sie es später erneut oder rufen Sie uns an." }, 429);

    const files = form.getAll("files").filter((file): file is File => typeof file !== "string");
    const fileError = validateFileList(files);
    if (fileError) return json({ error: fileError }, 400);

    const attachments: InquiryAttachment[] = [];
    for (const file of files) {
      const bytes = new Uint8Array(await file.arrayBuffer());
      if (!matchesType(bytes, file.type)) return json({ error: `„${file.name}“ ist keine gültige JPG-, PNG-, WebP- oder PDF-Datei.` }, 400);
      const filename = file.name.replace(/[\\/\r\n\u0000-\u001f]/g, "_").slice(0, 140) || "Datei";
      attachments.push({ filename, content_type: file.type, size: file.size, bytes });
    }

    const id = crypto.randomUUID();
    const inquiry = {
      id,
      name: data.name,
      phone: data.phone,
      email: data.email,
      city: data.city,
      project_type: data.projectType,
      area: data.area,
      multi_areas: JSON.stringify(data.multiAreas),
      multi_areas_description: data.multiAreasDescription,
      size: data.size,
      timeframe: data.timeframe,
      details: data.details,
      source_page: data.sourcePage,
      attribution: JSON.stringify(data.attribution),
      created_at: new Date().toISOString(),
    };

    const result = await sendInquiryNotification(inquiry, attachments);
    if (result === "not_configured") return json({ error: "Der E-Mail-Versand ist noch nicht eingerichtet. Bitte versuchen Sie es später erneut oder rufen Sie uns an." }, 503);
    if (result !== "sent") return json({ error: "Ihre Anfrage konnte gerade nicht per E-Mail versendet werden. Ihre Angaben bleiben im Formular. Bitte versuchen Sie es erneut oder rufen Sie uns an." }, 502);
    return json({ id }, 201);
  } catch (error) {
    console.error("Funnel email delivery failed", error instanceof Error ? error.name : "unknown");
    return json({ error: "Ihre Anfrage konnte gerade nicht per E-Mail versendet werden. Ihre Angaben bleiben im Formular. Bitte versuchen Sie es erneut oder rufen Sie uns an." }, 502);
  }
}
