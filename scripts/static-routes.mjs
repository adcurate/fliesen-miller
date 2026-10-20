import { mkdir, readFile, writeFile } from "node:fs/promises";
import { createServer } from "vite";
import { pages } from "../preview/routes.mjs";

const template = await readFile(new URL("../dist/index.html", import.meta.url), "utf8");
// Keep the public demonstration out of search until the final domain is launched.
const origin = (process.env.SITE_URL || "https://adcurate.github.io/fliesen-miller").replace(/\/$/, "");
const indexingEnabled = process.env.SEO_INDEXING_ENABLED === "true";
// Only page URLs use trailing slashes; image URLs must resolve to the actual file.
const url = path => origin + (path === "/" || path.split("/").at(-1).includes(".") ? path : `${path}/`);
const escape = value => String(value).replace(/[&<>"']/g, ch => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[ch]);
const server = await createServer({ server: { middlewareMode: true }, appType: "custom" });
try {
  const { render } = await server.ssrLoadModule("/preview/render.tsx");
  const { structuredData, serializeStructuredData } = await server.ssrLoadModule("/lib/structured-data.ts");
  const missing = { path: "/404", title: "Seite nicht gefunden | Fliesen Miller", description: "Unter dieser Adresse ist keine Seite vorhanden.", indexable: false };
  for (const page of [...pages, missing]) {
    const canonical = page === missing ? "" : `<link rel="canonical" href="${escape(url(page.path))}" />`;
    const image = `${origin}/media/gallery-06.webp`;
    const head = `${canonical}
      <meta property="og:type" content="website" />
      <meta property="og:locale" content="de_DE" />
      <meta property="og:site_name" content="Fliesen Miller" />
      <meta property="og:title" content="${escape(page.title)}" />
      <meta property="og:description" content="${escape(page.description)}" />
      ${page === missing ? "" : `<meta property="og:url" content="${escape(url(page.path))}" />`}
      <meta property="og:image" content="${escape(image)}" />
      <meta property="og:image:width" content="1600" />
      <meta property="og:image:height" content="1200" />
      <meta property="og:image:alt" content="Fliesenarbeiten von Fliesen Miller" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content="${escape(page.title)}" />
      <meta name="twitter:description" content="${escape(page.description)}" />
      <meta name="twitter:image" content="${escape(image)}" />
      <meta name="twitter:image:alt" content="Fliesenarbeiten von Fliesen Miller" />`;
    const data = structuredData(page.path, url);
    const schema = data ? `<script type="application/ld+json">${serializeStructuredData(data)}</script>` : "";
    const html = template
      .replace(/<title>.*?<\/title>/, () => `<title>${escape(page.title)}</title>`)
      .replace(/<meta name="description"[^>]*>/, () => `<meta name="description" content="${escape(page.description)}" />`)
      .replace(/<meta name="robots"[^>]*>/, () => `<meta name="robots" content="${indexingEnabled && page.indexable ? "index" : "noindex"}, follow" />`)
      .replace("</head>", () => head + schema + "</head>")
      .replace('<div id="root"></div>', () => `<div id="root" data-rendered-path="${page.path}">${render(page.path)}</div>`);
    const target = page === missing ? new URL("../dist/404.html", import.meta.url) : new URL(`../dist/${page.path === "/" ? "" : page.path.slice(1) + "/"}index.html`, import.meta.url);
    await mkdir(new URL(".", target), { recursive: true });
    await writeFile(target, html);
  }
  const locations = pages.filter(page => page.indexable).map(page => `  <url><loc>${escape(url(page.path))}</loc></url>`).join("\n");
  await writeFile(new URL("../dist/sitemap.xml", import.meta.url), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${locations}\n</urlset>\n`);
  await writeFile(new URL("../dist/robots.txt", import.meta.url), indexingEnabled ? `User-agent: *\nAllow: /\nSitemap: ${origin}/sitemap.xml\n` : "User-agent: *\nDisallow: /\n");
  await writeFile(new URL("../dist/.nojekyll", import.meta.url), "");
  console.log(`Prerendered ${pages.length} complete HTML pages, a 404 page, sitemap.xml and robots.txt. Indexing: ${indexingEnabled ? "enabled" : "preview disabled"}.`);
} finally {
  await server.close();
}
