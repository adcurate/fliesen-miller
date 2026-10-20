import { useEffect } from "react";
import { Shell, Values, Regions, FAQ, ContactSection } from "@/components/Shared";
import { Hero, ServiceOverview, Premium, Projects } from "@/components/HomeSections";
import { ServicesPage, CityPage, RepairPage, AboutPage, LegalPage, ReferencePage, ContactPage } from "@/components/Subpages";
import { FunnelSection } from "@/components/Funnel";
import { GoogleReviews } from "@/components/GoogleReviews";
import { PathContext } from "@/preview/navigation";
import { PremiumPage, RegionsPage, FAQPage } from "@/components/LandingPages";
import { cities } from "@/lib/site";

export function App({ path }: { path: string }) {
  const slug = path.slice(1);
  useEffect(() => {
    // Hash targets exist after client rendering, including on a direct deep link.
    if (location.hash) {
      const target = document.getElementById(decodeURIComponent(location.hash.slice(1)));
      target?.scrollIntoView();
    }
  }, [slug]);
  let content;
  if (path === "/") content = <><Hero /><ServiceOverview /><Premium /><Projects /><GoogleReviews /><Values /><FunnelSection /><FAQ /><ContactSection /><Regions /></>;
  else if (slug === "leistungen") content = <ServicesPage />;
  else if (slug === "premium") content = <PremiumPage />;
  else if (slug === "einsatzgebiete") content = <RegionsPage />;
  else if (slug === "faq") content = <FAQPage />;
  else if (slug === "reparatur") content = <RepairPage />;
  else if (slug === "ueber-uns") content = <AboutPage />;
  else if (["impressum", "datenschutz", "agb"].includes(slug)) content = <LegalPage slug={slug} />;
  else if (slug === "referenzen") content = <ReferencePage />;
  else if (slug === "kontakt") content = <ContactPage />;
  else if (slug === "anfrage") content = <FunnelSection standalone />;
  else if (slug.startsWith("fliesenleger-") && cities.some(c => c.slug === slug.slice(13))) content = <CityPage slug={slug.slice(13)} />;
  else content = <section className="section not-found"><div className="container"><h1>Seite nicht gefunden</h1><p>Unter dieser Adresse ist keine Seite vorhanden.</p><a href="/" className="button">Zur Startseite</a></div></section>;
  return <PathContext.Provider value={path}><Shell>{content}</Shell></PathContext.Provider>;
}

