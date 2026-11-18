import { Shell } from "@/components/Shared";
import { Icon } from "@/components/Icons";
import { privateMetadata } from "@/lib/seo";
export const metadata = privateMetadata("Seite nicht gefunden | Fliesen Miller");
export default function NotFound(){return <Shell><section className="section not-found"><div className="container"><h1>Diese Seite<br />passt nicht ins Bild.</h1><p>Die Seite wurde verschoben oder existiert nicht. Auf der Startseite finden Sie alle Leistungen und den Weg zu Ihrem Projekt.</p><a className="button" href="/">Zur Startseite<Icon name="arrow" /></a><a className="text-link" href="/anfrage">Direkt zur Projektanfrage<Icon name="arrowUp" /></a></div></section></Shell>;}
