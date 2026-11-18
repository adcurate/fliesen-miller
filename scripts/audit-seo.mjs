import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const pages = JSON.parse(await readFile(new URL("../content/seo-pages.json", import.meta.url), "utf8"));
const origin = process.env.TEST_ORIGIN || "http://127.0.0.1:5173";
const canonicalOrigin = (process.env.SITE_URL || "https://fliesen-miller-neu.franceska-kroll.chatgpt.site").replace(/\/$/, "");
const index = process.env.SEO_INDEXING_ENABLED === "true";
const titles = new Set(), descriptions = new Set();
for (const page of pages) {
  const response = await fetch(origin + page.path);
  assert.equal(response.status, 200, page.path);
  const html = (await response.text()).replace(/<script\b[^>]*>[\s\S]*?<\/script>/g, tag => /type="application\/ld\+json"/.test(tag.slice(0, tag.indexOf(">"))) ? tag : "");
  const title = html.match(/<title>(.*?)<\/title>/)?.[1];
  const description = html.match(/<meta[^>]*name="description"[^>]*content="([^"]+)"/)?.[1];
  assert.ok(title && !titles.has(title), `Missing or duplicate title on ${page.path}`);
  assert.ok(description && !descriptions.has(description), `Missing or duplicate description on ${page.path}`);
  titles.add(title); descriptions.add(description);
  assert.equal((html.match(/<h1(?:\s|>)/g) || []).length, 1, page.path);
  const canonical = html.match(/<link[^>]*rel="canonical"[^>]*href="([^"]+)"/)?.[1];
  assert.ok(canonical, `Missing canonical on ${page.path}`);
  assert.equal(new URL(canonical).href, new URL(canonicalOrigin + page.path).href, page.path);
  const socialUrl = html.match(/property="og:url"[^>]*content="([^"]+)"/)?.[1];
  assert.ok(socialUrl, `Missing social URL on ${page.path}`);
  assert.equal(new URL(socialUrl).href, new URL(canonical).href, page.path);
  const robots = html.match(/name="robots"[^>]*content="([^"]+)"/)?.[1];
  assert.ok(robots?.includes(index && page.indexable ? "index, follow" : "noindex, follow"), `${page.path}: ${robots}`);
  assert.match(html, /<html[^>]*lang="de"/, page.path);
  assert.equal((html.match(/rel="canonical"/g) || []).length, 1, page.path);
  const schemas = [...html.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)].map(match => JSON.parse(match[1]));
  assert.equal(schemas.length, 1, `Expected one JSON-LD graph on ${page.path}`);
  const graph = schemas[0]["@graph"];
  const business = graph.find(node => node["@type"] === "HomeAndConstructionBusiness");
  const website = graph.find(node => node["@type"] === "WebSite");
  const webpage = graph.find(node => node.url && new URL(node.url).href === new URL(canonical).href && node["@id"].endsWith("#webpage"));
  assert.equal(business["@id"], `${canonicalOrigin}/#business`);
  assert.equal(business.telephone, "+4944717084073");
  assert.deepEqual(business.address, { "@type": "PostalAddress", streetAddress: "Anne-Frank-Ring 5", addressLocality: "Cloppenburg", postalCode: "49661", addressCountry: "DE" });
  assert.equal(website.publisher["@id"], business["@id"]);
  assert.equal(webpage.isPartOf["@id"], website["@id"]);
  assert.equal(webpage.about["@id"], business["@id"]);
  assert.equal(webpage.name, page.title);
  assert.equal(webpage.description, page.description);
  assert.equal(webpage.inLanguage, "de-DE");
  assert.equal(webpage["@type"], page.path === "/kontakt" ? "ContactPage" : page.path === "/ueber-uns" ? "AboutPage" : ["/referenzen", "/einsatzgebiete"].includes(page.path) ? "CollectionPage" : "WebPage");
  assert.ok(!business.aggregateRating && !business.review, "No self-serving review markup");
}
const sitemap = await (await fetch(origin + "/sitemap.xml")).text();
for (const page of pages) assert.equal(sitemap.includes(`<loc>${canonicalOrigin}${page.path}</loc>`), page.indexable, page.path);
assert.doesNotMatch(sitemap, /#/);
const robots = await (await fetch(origin + "/robots.txt")).text();
assert.ok(robots.includes(index ? "Allow: /" : "Disallow: /"));
if (index) assert.ok(robots.includes(`${canonicalOrigin}/sitemap.xml`));
for (const path of ["/diese-seite-existiert-nicht", "/unknown/nested", "/admin", "/unsubscribe"]) {
  const response = await fetch(origin + path);
  assert.equal(response.status, 404, path);
  const html = (await response.text()).replace(/<script\b[^>]*>[\s\S]*?<\/script>/g, tag => /type="application\/ld\+json"/.test(tag.slice(0, tag.indexOf(">"))) ? tag : "");
  assert.match(html, /noindex/, path);
  assert.doesNotMatch(html, /rel="canonical"|property="og:url"|application\/ld\+json/, path);
  assert.doesNotMatch(html, /<title>Fliesenleger Cloppenburg/, path);
}
for (const path of ["/media/logo.webp", "/media/gallery-06.webp"]) {
  const response = await fetch(origin + path);
  assert.equal(response.status, 200, path);
  assert.match(response.headers.get("content-type"), /^image\//, path);
  await response.body.cancel();
}
console.log(`${pages.length} pages: metadata, canonical URLs, linked business/website/page graphs, image resources, robots, sitemap and 404 metadata verified.`);
