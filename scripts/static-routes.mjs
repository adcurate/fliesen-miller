import { mkdir, readFile, writeFile } from "node:fs/promises";
import { routes } from "../preview/routes.mjs";

const html = await readFile(new URL("../dist/index.html", import.meta.url), "utf8");
for (const route of routes) {
  const directory = new URL(`../dist/${route}/`, import.meta.url);
  await mkdir(directory, { recursive: true });
  await writeFile(new URL("index.html", directory), html);
}
await writeFile(new URL("../dist/404.html", import.meta.url), html);
await writeFile(new URL("../dist/.nojekyll", import.meta.url), "");
console.log(`Created ${routes.length + 1} static page entry points and a 404 page.`);
