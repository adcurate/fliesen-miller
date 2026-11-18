import type { Metadata } from "next";
import pages from "@/content/seo-pages.json";
import { site } from "./site";
import { getRuntimeConfig } from "@/lib/runtime-config";

// Enable indexing only when the final, publicly accessible website is launched.
const runtime = getRuntimeConfig();
export const seoOrigin = (runtime.SITE_URL || site.url).replace(/\/$/, "");
export const indexingEnabled = runtime.SEO_INDEXING_ENABLED === "true";
export const seoPages = pages;
export const absoluteUrl = (path: string) => `${seoOrigin}${path === "/" ? "/" : path}`;

// Clear inherited homepage URLs on non-content routes and error responses.
export function privateMetadata(title: string): Metadata {
  return { title: { absolute: title }, description: null,
    robots: { index: false, follow: false }, alternates: { canonical: null },
    openGraph: null, twitter: null };
}

export function pageMetadata(path: string): Metadata {
  const page = pages.find(page => page.path === path);
  if (!page) return privateMetadata("Seite nicht gefunden | Fliesen Miller");
  const image = { url: absoluteUrl("/media/gallery-06.webp"), width: 1600, height: 1200, alt: "Fliesenarbeiten von Fliesen Miller" };
  return {
    title: { absolute: page.title }, description: page.description,
    alternates: { canonical: absoluteUrl(path) },
    robots: { index: indexingEnabled && page.indexable, follow: true },
    openGraph: { title: page.title, description: page.description, url: absoluteUrl(path), siteName: site.name, locale: "de_DE", type: "website", images: [image] },
    twitter: { card: "summary_large_image", title: page.title, description: page.description, images: [image] },
  };
}
