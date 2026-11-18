import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";
const root = path.resolve(import.meta.dirname, "..");
const assets = path.resolve(root, "../research/assets");
const publicMedia = path.join(root, "public/media");
fs.mkdirSync(publicMedia, { recursive: true });
const manifest = JSON.parse(fs.readFileSync(path.join(assets, "manifest.json"), "utf8"));
const images = manifest.filter(item => /^gallery-/.test(item.filename));
await Promise.all(images.map(async (item, i) => {
  const id = `gallery-${String(i + 1).padStart(2,"0")}`;
  const input = path.join(assets, item.filename);
  await sharp(input).resize({ width: 1600, withoutEnlargement: true }).webp({ quality: 84 }).toFile(path.join(publicMedia, `${id}.webp`));
  await sharp(input).resize({ width: 650, withoutEnlargement: true }).webp({ quality: 79 }).toFile(path.join(publicMedia, `${id}-small.webp`));
}));
await sharp(path.join(assets,"logo.png")).trim({ threshold: 30 }).resize({ width: 400 }).webp({ quality: 90 }).toFile(path.join(publicMedia, "logo.webp"));
await sharp(path.join(assets,"favicon.png")).resize(64,64).png().toFile(path.join(root,"public/favicon.png"));
fs.copyFileSync(path.join(assets,"gehrungsschnitt.mp4"),path.join(publicMedia,"gehrungsschnitt.mp4"));
const gallery = images.map((item,i) => ({ id: `gallery-${String(i+1).padStart(2,"0")}`, title: item.title, alt: item.verified_visual_alt || item.alt, width: item.width, height: item.height, category: i===3 ? "boden" : i>=7 ? "bad" : "premium" }));
fs.writeFileSync(path.join(root,"content/gallery.json"),JSON.stringify(gallery,null,2));
const original = JSON.parse(fs.readFileSync(path.join(root,"content/source.json"),"utf8"));
const clean = value => {
  if (Array.isArray(value)) return value.map(clean);
  if (value && typeof value === "object") return Object.fromEntries(Object.entries(value).filter(([key]) => !["sourceCode","jsonLd"].includes(key)).map(([key,v]) => [key,clean(v)]));
  return value;
};
fs.writeFileSync(path.join(root,"content/source.json"),JSON.stringify(clean(original),null,2));
console.log(`Prepared ${images.length} optimized project images, logo, video and content.`);
