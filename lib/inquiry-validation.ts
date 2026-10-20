export const MAX_FILE_SIZE = 10 * 1024 * 1024;
export const MAX_TOTAL_SIZE = 30 * 1024 * 1024;
export const MAX_FILES = 6;
export const projectTypes = ["neubau", "sanierung", "reparatur", "premium"];
export const areas = ["bad", "boden", "kueche", "mehrere", "sonstiges"];
export const multiAreas = ["bad", "kueche", "wohnbereich", "flur", "technik", "terrasse", "gewerbe"];
export const sizes = ["klein", "mittel", "gross", "unsicher"];
export const timeframes = ["asap", "1-3", "3-6", "spaeter"];
export type InquiryInput = {
  projectType: string; area: string; multiAreas: string[]; multiAreasDescription: string;
  size: string; timeframe: string; details: string; name: string; phone: string;
  email: string; city: string; sourcePage: string; attribution: Record<string, string>;
  attributionConsent: boolean; idempotencyKey: string; startedAt: number; website: string;
};
export function validPhone(value: string) { return /^\d{6,20}$/.test(value.replace(/[\s+\-\/()]/g, "")); }
export function validEmail(value: string) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value) && value.length <= 254; }
export function validateContact(data: { name: string; phone: string; email: string }) {
  if (!data.name.trim()) return "Bitte geben Sie Ihren Namen an.";
  if (data.name.trim().length > 120) return "Bitte kürzen Sie Ihren Namen auf 120 Zeichen.";
  if (!data.phone.trim() && !data.email.trim()) return "Bitte geben Sie eine Telefonnummer oder E-Mail-Adresse an.";
  if (data.phone.trim() && !validPhone(data.phone)) return "Bitte prüfen Sie Ihre Telefonnummer (mindestens sechs Ziffern).";
  if (data.email.trim() && !validEmail(data.email.trim())) return "Bitte geben Sie eine gültige E-Mail-Adresse an.";
  return "";
}
export function validateInquiry(input: unknown): { data?: InquiryInput; error?: string } {
  if (!input || typeof input !== "object") return { error: "Die Anfrage ist unvollständig." };
  const raw = input as Record<string, unknown>;
  const string = (key: string, max: number) => typeof raw[key] === "string" ? (raw[key] as string).replace(/\u0000/g, "").trim().slice(0,max) : "";
  const data: InquiryInput = {
    projectType:string("projectType",40),area:string("area",40),multiAreas:Array.isArray(raw.multiAreas) ? [...new Set(raw.multiAreas.filter((x):x is string => typeof x==="string"))] : [],
    multiAreasDescription:string("multiAreasDescription",2000),size:string("size",40),timeframe:string("timeframe",40),details:string("details",5000),
    name:string("name",121),phone:string("phone",80),email:string("email",255),city:string("city",120),sourcePage:string("sourcePage",250),
    attribution:{},attributionConsent:raw.attributionConsent===true,idempotencyKey:string("idempotencyKey",80),startedAt:Number(raw.startedAt),website:string("website",500),
  };
  if (!projectTypes.includes(data.projectType) || !areas.includes(data.area) || !sizes.includes(data.size) || !timeframes.includes(data.timeframe)) return { error:"Bitte vervollständigen Sie die Angaben zu Ihrem Projekt." };
  if (data.area==="mehrere" && (!data.multiAreas.length || data.multiAreas.some(x=>!multiAreas.includes(x)))) return { error:"Bitte wählen Sie die betroffenen Bereiche aus." };
  if (data.area!=="mehrere") { data.multiAreas=[]; data.multiAreasDescription=""; }
  const error = validateContact(data); if (error) return { error };
  if (!/^[0-9a-f-]{36}$/i.test(data.idempotencyKey)) return { error:"Bitte laden Sie das Formular neu und versuchen Sie es erneut." };
  if (!data.sourcePage.startsWith("/") || data.sourcePage.startsWith("//")) data.sourcePage="/anfrage";
  if (data.attributionConsent && raw.attribution && typeof raw.attribution === "object") {
    for (const key of ["utm_source","utm_medium","utm_campaign","utm_term","utm_content","landing_page","referrer"]) {
      const value=(raw.attribution as Record<string,unknown>)[key];
      if (typeof value==="string") data.attribution[key]=value.slice(0,200);
    }
  }
  return {data};
}
export function validateFileList(files: { name: string; type: string; size: number }[]): string {
  if (files.length>MAX_FILES) return `Bitte wählen Sie höchstens ${MAX_FILES} Dateien aus.`;
  for (const file of files) {
    if (!file.size) return `Die Datei „${file.name}“ ist leer.`;
    if (file.size>MAX_FILE_SIZE) return `„${file.name}“ ist größer als 10 MB.`;
    if (!["image/jpeg","image/png","image/webp","application/pdf"].includes(file.type)) return `„${file.name}“ hat ein nicht unterstütztes Format. Bitte verwenden Sie JPG, PNG, WebP oder PDF.`;
  }
  if (files.reduce((sum,f)=>sum+f.size,0)>MAX_TOTAL_SIZE) return "Ihre Dateien dürfen zusammen höchstens 30 MB groß sein.";
  return "";
}
