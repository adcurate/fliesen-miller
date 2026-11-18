import assert from "node:assert/strict";
import fs from "node:fs";
const base=process.env.TEST_ORIGIN||"http://127.0.0.1:5173";
const source=JSON.parse(fs.readFileSync("content/source.json","utf8"));
const routes=["/",...source.pages.map(p=>p.route),"/referenzen","/kontakt","/anfrage"];
const pages=new Map();let links=0;
for(const route of routes){const response=await fetch(base+route);assert.equal(response.status,200,`${route} must return 200`);const html=await response.text();assert.equal((html.match(/<h1(?:\s|>)/g)||[]).length,1,`${route} needs exactly one h1`);assert.match(html,/<footer/);assert.match(html,/Datenschutz-Einstellungen/);assert.doesNotMatch(html,/Starter Project|Your site is taking shape|Lorem ipsum/);pages.set(route,html);}
const visited=new Set();
for(const [route,html] of pages)assert.doesNotMatch(html.replace(/<script[\s\S]*?<\/script>/g,""),/<a\b[^>]*>(?:(?!<\/a>)[\s\S])*?<a\b/,`Nested anchors on ${route}`);
for(const [route,html] of pages){for(const match of html.matchAll(/<a\b[^>]*\bhref="([^"]+)"/g)){const href=match[1].replaceAll("&amp;","&");if(!href.startsWith("/")&&!href.startsWith("#"))continue;const u=new URL(href,base+route);if(u.pathname.startsWith("/api/"))continue;links++;if(u.hash&&pages.has(u.pathname)){const target=decodeURIComponent(u.hash.slice(1));assert.ok(pages.get(u.pathname).includes(`id="${target}"`),`Missing anchor ${href} on ${route}`);}if(!visited.has(u.pathname)){visited.add(u.pathname);const response=await fetch(base+u.pathname);assert.equal(response.status,200,`Broken link ${href} from ${route}`);}}}
for(const page of source.pages){if(page.route!=="/leistungen")continue;for(const heading of page.headings.filter(h=>h.level===2).slice(0,8))assert.ok(pages.get(page.route).includes(heading.text.replaceAll("&","&amp;")),`Missing service: ${heading.text}`);}
const notFound=await fetch(base+"/diese-seite-existiert-nicht");assert.equal(notFound.status,404,"Missing routes must return 404");
console.log(`${routes.length} pages, ${links} internal links, all service headings, anchors and 404 verified.`);
