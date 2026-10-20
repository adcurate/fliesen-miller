export const site = {
  name: "Fliesen Miller",
  owner: "Maverik Miller",
  phone: "04471 / 70 840 73",
  phoneHref: "tel:+4944717084073",
  email: "info@fliesen-miller.de",
  street: "Anne-Frank-Ring 5",
  city: "49661 Cloppenburg",
  url: "https://adcurate.github.io/fliesen-miller",
  instagram: "https://www.instagram.com/fliesenmillerclp/",
};
export const cities = [
  { name: "Cloppenburg", slug: "cloppenburg", note: "Unser Zuhause. Ihr Fliesenleger vor Ort.", intro: "Wir verlegen Fliesen in Cloppenburg und Umgebung – zuverlässig, ordentlich und ohne Überraschungen. Ob Neubau, Sanierung oder Reparatur.", local: "Direkt in Cloppenburg ansässig – kurze Wege und persönliche Abstimmung.", title: "Fliesenleger in Cloppenburg – sauber ausgeführt" },
  { name: "Vechta", slug: "vechta", note: "Präzise Verlegung. Verlässliche Absprachen.", intro: "Sie brauchen einen Fliesenleger in Vechta, der mitdenkt, pünktlich ist und am Ende ein sauberes Ergebnis abliefert? Wir verlegen Fliesen für private Bauherren und Sanierer – vom Standardbad bis zur Großformatfliese.", local: "Unser Betrieb sitzt in Cloppenburg. Wir sind regelmäßig in Vechta und der umliegenden Region im Einsatz.", title: "Fliesenleger in Vechta – präzise Verlegung, zuverlässige Termine" },
  { name: "Bremen", slug: "bremen", note: "Handwerk aus dem Oldenburger Münsterland.", intro: "Sie suchen einen Fliesenleger in Bremen, der nicht nur verlegt, sondern auch mitdenkt? Wir kommen aus Cloppenburg und bringen die gleiche Sorgfalt mit, die unsere Kunden vor Ort schätzen – egal ob Neubau, Altbausanierung oder Einzelreparatur.", local: "Von unserem Standort in Cloppenburg aus sind wir regelmäßig in Bremen im Einsatz. Die Anfahrt planen wir mit ein.", title: "Fliesenleger in Bremen – Qualität aus dem Oldenburger Münsterland" },
  { name: "Osnabrück", slug: "osnabrueck", note: "Handwerkliche Präzision für Ihr Zuhause.", intro: "Sie möchten in Osnabrück Fliesen verlegen lassen und suchen jemanden, der gut arbeitet und verbindlich ist? Wir übernehmen Projekte jeder Größe: vom neuen Gäste-WC bis zur kompletten Badsanierung mit Großformat.", local: "Von unserem Standort in Cloppenburg sind wir regelmäßig in Osnabrück und der Region unterwegs.", title: "Fliesenleger in Osnabrück – handwerkliche Präzision" },
];
export const projectLabels: Record<string, string> = { neubau: "Neubau / Eigenheim", sanierung: "Sanierung", reparatur: "Reparatur", premium: "Premium-Anfrage" };
export const areaLabels: Record<string, string> = { bad: "Badezimmer", boden: "Boden", kueche: "Küche", mehrere: "Mehrere Bereiche", sonstiges: "Sonstiges" };
export const sizeLabels: Record<string, string> = {"klein": "Klein (bis ca. 10 m²)", "mittel": "Mittel (10–30 m²)", "gross": "Groß (über 30 m²)", "unsicher": "Noch unsicher"};
export const timeLabels: Record<string, string> = { asap: "So schnell wie möglich", "1-3": "In 1–3 Monaten", "3-6": "In 3–6 Monaten", spaeter: "Später / noch offen" };
export const statusLabels: Record<string, string> = { neu: "Neu", in_bearbeitung: "In Bearbeitung", angebot: "Angebot erstellt", abgeschlossen: "Abgeschlossen", archiviert: "Archiviert" };

export const values: [string, string][] = [
  ["Saubere Baustelle", "Am Ende des Tages ist Ihre Wohnung sauber."],
  ["Verlässliche Termine", "Wenn wir Donnerstag sagen, meinen wir Donnerstag."],
  ["Klare Absprachen", "Sie wissen vorher, was es kostet und wie lange es dauert."],
  ["Strukturierter Ablauf", "Aufmaß, Angebot, Termin, Ausführung – alles geplant."],
];
export const processSteps = [
  ["Ihre Idee", "Sagen Sie uns, was Sie vorhaben. Online, telefonisch oder per E-Mail."],
  ["Erste Abstimmung", "Wir klären die wichtigsten Fragen und besprechen Ihr Projekt."],
  ["Aufmaß vor Ort", "Wir schauen uns die Gegebenheiten an und nehmen Maß."],
  ["Angebot & Planung", "Sie erhalten ein nachvollziehbares Angebot und einen abgestimmten Termin."],
  ["Saubere Umsetzung", "Wir verlegen sorgfältig und übergeben Ihr fertiges Projekt."],
];
