import { readFileSync } from "node:fs";
export const pages = JSON.parse(readFileSync(new URL("../content/seo-pages.json", import.meta.url), "utf8"));
export const routes = pages.filter(page => page.path !== "/").map(page => page.path.slice(1));
