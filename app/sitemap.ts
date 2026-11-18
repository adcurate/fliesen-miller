import type { MetadataRoute } from "next";
import { absoluteUrl, seoPages } from "@/lib/seo";
export default function sitemap():MetadataRoute.Sitemap{return seoPages.filter(page=>page.indexable).map(page=>({url:absoluteUrl(page.path)}));}
