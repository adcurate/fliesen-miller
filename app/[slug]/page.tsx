import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Shell } from "@/components/Shared";
import { ServicesPage,CityPage,RepairPage,AboutPage,LegalPage,ReferencePage,ContactPage } from "@/components/Subpages";
import { FunnelSection } from "@/components/Funnel";
import { PremiumPage, RegionsPage, FAQPage } from "@/components/LandingPages";
import { pageMetadata } from "@/lib/seo";
import { StructuredData } from "@/components/StructuredData";
import { cities } from "@/lib/site";
export async function generateMetadata({params}:{params:Promise<{slug:string}>}):Promise<Metadata>{const{slug}=await params;return pageMetadata(`/${slug}`);}
export default async function Page({params}:{params:Promise<{slug:string}>}){const{slug}=await params;let content;
  if(slug==="leistungen")content=<ServicesPage />;
  else if(slug==="premium")content=<PremiumPage />;
  else if(slug==="einsatzgebiete")content=<RegionsPage />;
  else if(slug==="faq")content=<FAQPage />;
  else if(slug==="reparatur")content=<RepairPage />;
  else if(slug==="ueber-uns")content=<AboutPage />;
  else if(["impressum","datenschutz","agb"].includes(slug))content=<LegalPage slug={slug} />;
  else if(slug==="referenzen")content=<ReferencePage />;
  else if(slug==="kontakt")content=<ContactPage />;
  else if(slug==="anfrage")content=<FunnelSection standalone />;
  else if(slug.startsWith("fliesenleger-")&&cities.some(c=>c.slug===slug.slice(13)))content=<CityPage slug={slug.slice(13)} />;
  else notFound();
  return <Shell><StructuredData path={`/${slug}`} />{content}</Shell>;
}
