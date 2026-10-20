import { useEffect } from "react";
import { createRoot } from "react-dom/client";
import { Shell, Values, Regions, FAQ, ContactSection } from "@/components/Shared";
import { Hero, ServiceOverview, Premium, Projects } from "@/components/HomeSections";
import { ServicesPage, CityPage, RepairPage, AboutPage, LegalPage, ReferencePage, ContactPage } from "@/components/Subpages";
import { FunnelSection } from "@/components/Funnel";
import { usePathname } from "@/preview/navigation";
import { cities } from "@/lib/site";
import "./styles.css";

function App() {
  const path = usePathname();
  const slug = path.slice(1);
  const titles: Record<string, string> = { leistungen: "Leistungen", reparatur: "Reparatur & Versicherung", "ueber-uns": "Über uns", impressum: "Impressum", datenschutz: "Datenschutz", agb: "AGB", referenzen: "Referenzen", kontakt: "Kontakt", anfrage: "Projekt anfragen" };
  useEffect(() => {
    const city = cities.find(c => slug === `fliesenleger-${c.slug}`);
    document.title = `${city ? `Fliesenleger in ${city.name}` : titles[slug] || "Fliesen Miller"} – Vorschau`;
    // Hash targets exist after client rendering, including on a direct deep link.
    if (location.hash) {
      const target = document.getElementById(decodeURIComponent(location.hash.slice(1)));
      target?.scrollIntoView();
    }
  }, [slug]);
  let content;
  if (path === "/") content = <><Hero /><ServiceOverview /><Premium /><Projects /><Values /><FunnelSection /><FAQ /><ContactSection /><Regions /></>;
  else if (slug === "leistungen") content = <ServicesPage />;
  else if (slug === "reparatur") content = <RepairPage />;
  else if (slug === "ueber-uns") content = <AboutPage />;
  else if (["impressum", "datenschutz", "agb"].includes(slug)) content = <LegalPage slug={slug} />;
  else if (slug === "referenzen") content = <ReferencePage />;
  else if (slug === "kontakt") content = <ContactPage />;
  else if (slug === "anfrage") content = <FunnelSection standalone />;
  else if (slug.startsWith("fliesenleger-") && cities.some(c => c.slug === slug.slice(13))) content = <CityPage slug={slug.slice(13)} />;
  else content = <section className="section not-found"><div className="container"><h1>Seite nicht gefunden</h1><p>Diese Seite ist nicht Teil der Vorschau.</p><a href="/" className="button">Zur Startseite</a></div></section>;
  return <Shell>{content}</Shell>;
}

createRoot(document.getElementById("root")!).render(<App />);
