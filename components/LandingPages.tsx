import { PageHero, CTA, FAQ, Values } from "./Shared";
import { Premium } from "./HomeSections";
import { cities } from "@/lib/site";
import { Icon } from "./Icons";

export function PremiumPage() {
  return <><PageHero compact eyebrow="Premium" title="Großformatfliesen & Gehrungsschnitte" intro="Große Flächen und präzise Details für Bad, Boden und Küche. Wir besprechen mit Ihnen, welches Format und welche Ausführung zu Ihrem Projekt passen." requestLabel="Premium-Projekt anfragen" requestHref="/anfrage?projekt=premium" /><Premium /><section className="section"><div className="container service-cards-grid"><article className="service-detail service-detail-text"><h2>Großformat bis 320 cm</h2><p>Große Fliesen schaffen ein ruhiges Gesamtbild mit wenigen Fugen. Wir verlegen Großformate an Wand und Boden und stimmen die Aufteilung auf die vorhandenen Flächen ab.</p><a className="text-link service-inquiry-link" href="/leistungen#grossformat">Mehr zur Großformatverlegung<Icon name="arrowUp" /></a></article><article className="service-detail service-detail-text"><h2>Präzise Kanten auf Gehrung</h2><p>Mit 45°-Gehrungsschnitten entstehen saubere Außenecken ohne sichtbare Profilschienen. Das eignet sich beispielsweise für Duschnischen, Ablagen und Wandvorsprünge.</p><a className="text-link service-inquiry-link" href="/leistungen#gehrung">Mehr zu Gehrungsschnitten<Icon name="arrowUp" /></a></article></div></section><Values /><CTA title="Ihr Premium-Projekt" text="Besprechen wir Format, Untergrund und die Details Ihres Vorhabens." /></>;
}

export function RegionsPage() {
  return <><PageHero compact eyebrow="Einsatzgebiete" title="Fliesenarbeiten in Ihrer Region" intro="Unser Betrieb sitzt in Cloppenburg. Wir übernehmen Fliesenarbeiten vor Ort und sind auch in Vechta, Bremen, Osnabrück und der umliegenden Region unterwegs." /><section className="section"><div className="container service-cards-grid">{cities.map(city => <article className="service-detail service-detail-text" key={city.slug}><h2>Fliesenleger {city.name}</h2><p>{city.intro}</p><p>{city.local}</p><a className="text-link service-inquiry-link" href={`/fliesenleger-${city.slug}`}>Leistungen in {city.name}<Icon name="arrowUp" /></a></article>)}</div></section><CTA /></>;
}

export function FAQPage() {
  return <><PageHero compact eyebrow="Fragen & Antworten" title="Häufige Fragen zu unseren Fliesenarbeiten" intro="Hier finden Sie Antworten zu Leistungen, Ausführung und Versicherungsschäden. Für die Details Ihres eigenen Projekts sprechen Sie uns gerne direkt an." /><FAQ /><CTA /></>;
}
