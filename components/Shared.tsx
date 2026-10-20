import { Header } from "./Header";
import { Footer } from "./Footer";
import { CookiePanel } from "./CookiePanel";
import { Icon } from "./Icons";
import { EmailComposer } from "./EmailComposer";
import { LocationMap } from "./LocationMap";
import { OriginalFAQ } from "./OriginalMotion";
import { cities, site, values } from "@/lib/site";
import source from "@/content/source.json";

export function Shell({ children }: { children: React.ReactNode }) { return <div id="top"><Header /><main id="main">{children}</main><Footer /><CookiePanel /></div>; }
export function LinkArrow({ href, children, className = "" }: { href: string; children: React.ReactNode; className?: string }) { return <a href={href} className={`text-link ${className}`}>{children}<Icon name="arrowUp" /></a>; }
export function PageHero({ title, intro, eyebrow, image, compact = false, requestLabel, requestHref = "/#anfrage", phoneLabel, back = false }: { title: string; intro: string; eyebrow: string; image?: string; compact?: boolean; requestLabel?:string; requestHref?:string; phoneLabel?:string; back?:boolean }) {
  return <section className={`page-hero ${compact ? "compact" : ""} ${!image ? "page-hero-text" : ""}`}><div className="container page-hero-grid"><div>{back&&<a className="text-link back-home" href="/">← Zurück zur Startseite</a>}<h1>{title}</h1>{intro&&<p className="hero-intro">{intro}</p>}<div className="hero-buttons">{requestLabel&&<a href={requestHref} className="button inquiry-button">{requestLabel}</a>}{phoneLabel&&<a href={site.phoneHref} className={requestLabel?"button button-outline":"button"}>{phoneLabel}<Icon name="phone" /></a>}</div></div>{!compact && image && <div className="page-hero-image"><img src={`/media/${image}.webp`} alt="Fliesenarbeit von Fliesen Miller" width="1280" height="960" fetchPriority="high" /></div>}</div></section>;
}
export function CTA({ title = "Projekt besprechen", text = "Rufen Sie uns an oder nutzen Sie unser Anfrageformular.", requestLabel = "Angebot anfragen", phoneLabel = "Anrufen: 04471 / 70 840 73" }: { title?: string; text?: string; requestLabel?:string; phoneLabel?:string }) {
  return <section className="cta-section"><div className="container cta-grid"><div><h2>{title}</h2><p>{text}</p></div><div className="cta-actions"><a href={site.phoneHref} className="button">{phoneLabel}<Icon name="phone" /></a><a className="button button-outline inquiry-button" href="/#anfrage">{requestLabel}</a></div></div></section>;
}
export function Values({ title = "So arbeiten wir", items = values, icons = ["qualityClean","qualityCalendar","qualityAgreement","qualityProcess"] }: { title?: string; items?: ReadonlyArray<readonly [string,string]>; icons?: readonly string[] }) {
  return <section className="section values-section"><div className="container"><div className="section-heading"><div><h2>{title}</h2></div></div><div className="values-grid">{items.map(([heading, description],i) => <article key={heading}><Icon name={icons[i]} className="value-icon" /><h3>{heading}</h3><p>{description}</p></article>)}</div></div></section>;
}
export function Regions() { return <section className="section regions" id="einsatzgebiete"><div className="container region-grid"><div><h2>Einsatzgebiete</h2></div><div className="region-list">{cities.map((c) => <a href={`/fliesenleger-${c.slug}`} key={c.slug}><span>Fliesenleger {c.name}</span><Icon name="arrowUp" /></a>)}</div></div></section>; }
export function FAQ() { return <section className="section faq-section" id="faq"><div className="container faq-grid"><div><h2>Häufige Fragen</h2></div><OriginalFAQ items={source.faq} /></div></section>; }
function ContactCards() { return <div className="contact-cards"><a className="contact-card" href={site.phoneHref} aria-label={`Anrufen: ${site.phone}`}><Icon name="phone" /><span>{site.phone}</span></a><EmailComposer /><a className="contact-card" href="https://www.google.com/maps/search/?api=1&query=Anne-Frank-Ring+5%2C+49661+Cloppenburg" target="_blank" rel="noopener noreferrer" aria-label={`Standort: ${site.street}, ${site.city}`}><Icon name="pin" /><span>{site.street}<br />{site.city}</span></a></div>; }
export function ContactSection() { return <section className="section contact-section" id="kontakt"><div className="container compact-contact"><h2>Kontakt</h2><ContactCards /></div></section>; }
export function LocationSection() {
  return <section className="section location-section" id="kontakt"><div className="container"><h2>Kontakt &amp; Standort</h2><div className="location-grid"><div className="location-details"><ContactCards /><div className="location-actions"><a className="button inquiry-button" href="/#anfrage">Projekt besprechen</a><LinkArrow href="https://www.google.com/maps/dir/?api=1&destination=Anne-Frank-Ring+5%2C+49661+Cloppenburg">Route planen</LinkArrow><LinkArrow href="/leistungen">Leistungen ansehen</LinkArrow></div></div><LocationMap /></div></div></section>;
}
