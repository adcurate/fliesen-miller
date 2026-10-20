import { Icon } from "./Icons";

export type ServiceCardItem = {
  label: string;
  icon: string;
  text: string;
  link: string;
  details?: string[];
};

const homeServices: ServiceCardItem[] = [
  { label: "Standard", icon: "tile", text: "Bäder, Böden und Küchen – sauber verlegt und zuverlässig umgesetzt.", link: "/leistungen" },
  { label: "Premium", icon: "diamond", text: "Großformat, saubere Übergänge und hochwertige Details für ein ruhiges Gesamtbild.", link: "#premium" },
  { label: "Reparatur", icon: "repair", text: "Einzelne Fliese oder Schaden – wir kümmern uns darum.", link: "/reparatur" },
];

export function ServiceOverview({ title = "Unsere Leistungen", intro = "", items = homeServices, id = "leistungen" }: { title?: string; intro?: string; items?: ServiceCardItem[]; id?: string }) {
  return <section className="section services-overview" id={id}><div className="container"><div className="section-heading"><div><h2>{title}</h2>{intro && <p className="services-overview-intro">{intro}</p>}</div></div><div className="original-services">{items.map(row => <a className="original-service" href={row.link} key={row.label}><div className="original-service-copy"><h3 className="service-title"><Icon name={row.icon} className="service-title-icon" />{row.label}</h3><p>{row.text}</p>{row.details && row.details.length > 0 && <ul className="service-card-details">{row.details.map(detail => <li key={detail}>{detail}</li>)}</ul>}<span className="text-link">Mehr erfahren<Icon name="arrowUp" /></span></div></a>)}</div></div></section>;
}
