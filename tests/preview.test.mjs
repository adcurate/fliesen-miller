import test from "node:test";
import assert from "node:assert/strict";
import { readFile, readdir, access } from "node:fs/promises";
import ts from "typescript";
import { routes, pages } from "../preview/routes.mjs";

const root = new URL("../", import.meta.url);
const read = path => readFile(new URL(path, root), "utf8");
const source = (await read("preview/urls.ts")).replaceAll("import.meta.env.BASE_URL", JSON.stringify("/fliesen-miller/"));
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText;
const { previewUrl, localProps } = await import(`data:text/javascript;base64,${Buffer.from(compiled).toString("base64")}`);

test("project URLs preserve hashes, queries, external compose links and protocol links", () => {
  assert.equal(previewUrl("/"), "/fliesen-miller/");
  assert.equal(previewUrl("/leistungen#bodenfliesen"), "/fliesen-miller/leistungen/#bodenfliesen");
  assert.equal(previewUrl("/anfrage?ort=Bremen"), "/fliesen-miller/anfrage/?ort=Bremen");
  assert.equal(previewUrl("/fliesen-miller/media/logo.webp"), "/fliesen-miller/media/logo.webp");
  for (const value of ["#anfrage", "mailto:info@fliesen-miller.de", "tel:+4944717084073", "https://mail.google.com/mail/?view=cm", "//example.com/image.png", "blob:example"]) assert.equal(previewUrl(value), value);
  assert.deepEqual(localProps("img", { src: "/media/logo.webp", alt: "Logo" }), { src: "/fliesen-miller/media/logo.webp", alt: "Logo" });
  const componentProps = { href: "/leistungen" };
  assert.equal(localProps(() => null, componentProps), componentProps);
});

test("every supported route has a static entry point and base-aware build assets", async () => {
  for (const path of ["index.html", "404.html", ...routes.map(route => `${route}/index.html`)]) {
    const html = await read(`dist/${path}`);
    assert.match(html, /name="robots" content="noindex, follow"/);
    const paths = [...html.matchAll(/(?:src|href)="(\/[^"#]+)"/g)].map(match => match[1]).filter(path => /\.[a-z0-9]+$/.test(path));
    assert.ok(paths.length >= 3);
    for (const asset of paths) {
      assert.ok(asset.startsWith("/fliesen-miller/"), `${path}: ${asset}`);
      await access(new URL(`dist/${asset.slice("/fliesen-miller/".length)}`, root));
    }
  }
  const cssFiles = (await readdir(new URL("dist/assets/", root))).filter(file => file.endsWith(".css"));
  for (const file of cssFiles) {
    const css = await read(`dist/assets/${file}`);
    const fonts = [...css.matchAll(/url\(["']?(\/[^)'"\s]+)["']?\)/g)].map(match => match[1]);
    for (const font of fonts) {
      assert.ok(font.startsWith("/fliesen-miller/"), font);
      await access(new URL(`dist/${font.slice("/fliesen-miller/".length)}`, root));
    }
  }
});

test("each URL delivers its own content, metadata and canonical without JavaScript", async () => {
  const titles = new Set(), descriptions = new Set();
  const knownPaths = new Set(pages.map(page => page.path));
  for (const page of pages) {
    const html = await read(`dist/${page.path === "/" ? "" : page.path.slice(1) + "/"}index.html`);
    const title = html.match(/<title>(.*?)<\/title>/)[1];
    const description = html.match(/name="description" content="([^"]+)"/)[1];
    assert.ok(!titles.has(title), `Duplicate title: ${title}`);
    assert.ok(!descriptions.has(description), `Duplicate description: ${description}`);
    titles.add(title); descriptions.add(description);
    assert.equal((html.match(/<h1(?:\s|>)/g) || []).length, 1, page.path);
    assert.match(html, /<main id="main">[\s\S]+<\/main>/);
    const expected = `https://adcurate.github.io/fliesen-miller${page.path === "/" ? "/" : page.path + "/"}`;
    assert.equal(html.match(/rel="canonical" href="([^"]+)"/)[1], expected);
    assert.equal(html.match(/property="og:url" content="([^"]+)"/)[1], expected);
    for (const [, href] of html.matchAll(/<a\b[^>]*href="([^"]+)"/g)) {
      if (!href.startsWith("/fliesen-miller/")) continue;
      const url = new URL(href, "https://adcurate.github.io");
      const path = url.pathname.slice("/fliesen-miller".length).replace(/\/$/, "") || "/";
      assert.ok(knownPaths.has(path), `Broken page link ${href} in ${page.path}`);
      if (url.hash) {
        const target = await read(`dist/${path === "/" ? "" : path.slice(1) + "/"}index.html`);
        assert.ok(target.includes(`id="${decodeURIComponent(url.hash.slice(1))}"`), `Missing anchor ${href}`);
      }
    }
  }
  const missing = await read("dist/404.html");
  assert.match(missing, /<h1>Seite nicht gefunden<\/h1>/);
  assert.doesNotMatch(missing, /rel="canonical"/);
  const sitemap = await read("dist/sitemap.xml");
  assert.equal((sitemap.match(/<loc>/g) || []).length, pages.filter(page => page.indexable).length);
  for (const page of pages) assert.equal(sitemap.includes(`/${page.path.slice(1)}/</loc>`), page.path !== "/" && page.indexable, page.path);
  assert.doesNotMatch(sitemap, /#|admin|unsubscribe|impressum|datenschutz|\/agb/);
  assert.match(await read("dist/robots.txt"), /Disallow: \//);
});

test("preview has no inquiry transport or admin implementation", async () => {
  const funnel = await read("components/Funnel.tsx");
  assert.doesNotMatch(funnel, /fetch\s*\(|XMLHttpRequest|sendBeacon|\/api\/|setSuccess|new FormData/);
  assert.match(funnel, /Versand in Vorschau deaktiviert/);
  assert.match(funnel, /disabled=\{!valid\|\|busy\|\|current==="kontakt"\}/);
  assert.ok(!(await readdir(new URL("components/", root))).some(name => /Admin|Unsubscribe/.test(name)));
  const scripts = (await readdir(new URL("dist/assets/", root))).filter(file => file.endsWith(".js"));
  for (const file of scripts) assert.doesNotMatch(await read(`dist/assets/${file}`), /\/api\/(?:admin|inquiries)|\.chatgpt\.site\/api/);
});
