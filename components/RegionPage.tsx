import type { CSSProperties } from "react";
import { Truck, Clock, Shield, MessageSquare, Eye, House, Paintbrush, Wrench, Grid2X2, Gem } from "lucide-react";
import source from "@/content/source.json";
import originals from "@/content/region-original-audit.json";
import { cities, site } from "@/lib/site";
import { Icon } from "./Icons";
import { FAQ } from "./Shared";
import { FunnelSection } from "./Funnel";

type SourceNode = { tag?: string; children?: unknown; className?: string; href?: string; to?: string };
function isNode(value: unknown): value is SourceNode { return !!value && typeof value === "object" && !Array.isArray(value); }
function flatten(value: unknown): unknown[] { return Array.isArray(value) ? value.flatMap(flatten) : value == null ? [] : [value]; }
function children(value: unknown): unknown[] { return isNode(value) ? flatten(value.children) : Array.isArray(value) ? flatten(value) : []; }
function find(value: unknown, tag: string): SourceNode[] { return [...(isNode(value) && value.tag === tag ? [value] : []), ...children(value).flatMap(child => find(child, tag))]; }
function text(value: unknown): string { return typeof value === "string" || typeof value === "number" ? String(value) : children(value).map(text).join(""); }
function heading(value: unknown) { return text(find(value, "h2")[0]); }
function cards(value: unknown) { return find(value, "div").filter(node => children(node).some(child => isNode(child) && child.tag === "h3")); }
function links(value: unknown) { return [...find(value, "L"), ...find(value, "a")].filter(node => node.to || node.href); }
function label(node: SourceNode | undefined) { return node ? text(node).trim() : ""; }
function isImageFirst(value: unknown) { const split = find(value, "div").find(node => node.className?.includes("lg:grid-cols-2")); return !!split && find(children(split)[0], "img").length > 0; }

function CheckList({ items }: { items: string[] }) {
  if (!items.length) return null;
  return <ul className="region-check-list">{items.map(item => <li key={item}><Icon name="check" /><span>{item.replace(/^\s*✓\s*/, "")}</span></li>)}</ul>;
}

export function RegionPage({ slug }: { slug: string }) {
  const city = cities.find(city => city.slug === slug)!;
  const route = `/fliesenleger-${slug}`;
  const tree = source.pages.find(page => page.route === route)!.tree;
  const sections = children(find(tree, "main")[0]);
  const original = originals.find(page => page.url.endsWith(route))!;
  const hero = sections[0];
  const heroParagraphs = find(hero, "p");
  const overview = sections[1];
  const premium = sections[2];
  const values = sections[3];
  const gallery = sections[4];
  const process = sections[5];
  const coverage = sections[6];
  const closing = sections[9];
  const serviceCards = cards(overview);
  const valueCards = cards(values);
  const processCards = cards(process);
  const valueIcons = valueCards.length === 4 ? [Truck, Clock, MessageSquare, Shield] : [Truck, Clock, Shield, MessageSquare, Eye];
  const serviceIcons = slug === "cloppenburg" ? [Grid2X2, Gem, Wrench] : [House, Paintbrush, Wrench];
  const premiumTitle = heading(premium);
  const premiumParagraphs = find(premium, "p").filter(node => !node.className?.includes("text-primary"));
  const coverageParagraphs = find(coverage, "p");
  const galleryCaptions = find(gallery, "p").slice(1);
  const closingButton = find(closing, "Button")[0];
  const phoneLink = links(hero).find(node => node.href?.startsWith("tel:"));

  function image(section: number, index = 0, eager = false) {
    const asset = original.sections[section].images[index];
    if (!asset) return null;
    return <div className="region-image"><img src={`/media/regions/${asset.src.split("/").at(-1)}`} alt={asset.alt} width="1280" height="720" loading={eager ? "eager" : "lazy"} fetchPriority={eager ? "high" : undefined} /></div>;
  }

  const coverageCopy = <div className="region-copy"><h2>{heading(coverage)}</h2>{coverageParagraphs.slice(0, 1).map((p, i) => <p key={i}>{text(p)}</p>)}<div className="region-area-links">{links(coverage).map(node => <a key={node.to || node.href} href={node.to || node.href}><Icon name="pin" />{label(node)}</a>)}{coverageParagraphs.slice(1).map((p, i) => <p key={i}><Icon name="pin" />{text(p)}</p>)}</div></div>;
  const premiumCopy = <div className="region-copy"><p className="region-kicker">PREMIUM</p><h2 aria-label={premiumTitle}>{premiumTitle.replace(/^Premium[–-]/, "")}</h2>{premiumParagraphs.map((p, i) => <p key={i}>{text(p)}</p>)}<CheckList items={find(premium, "li").map(node => text(node).trim())} /></div>;

  return <div className={`region-page region-${slug}`}>
    <section className="section region-hero"><div className="container region-split"><div className="region-hero-copy"><p className="region-kicker">{text(heroParagraphs[0])}</p><h1>{text(find(hero, "h1")[0])}</h1>{heroParagraphs.slice(1).map((p, i) => <p className={i === 0 ? "region-intro" : "region-local-note"} key={i}>{text(p)}</p>)}<div className="hero-buttons"><a className="button inquiry-button" href="#anfrage">{text(find(hero, "Button")[0])}</a><a className="button button-outline" href={site.phoneHref}>{label(phoneLink) || "Anrufen"}<Icon name="phone" /></a></div></div>{image(0, 0, true)}</div></section>

    <section className="section region-services" id="leistungen"><div className="container"><div className="region-section-heading"><h2>{heading(overview)}</h2><p>{text(find(overview, "p")[0])}</p></div><div className="region-service-grid">{serviceCards.map((node, i) => {
      const Mark = serviceIcons[i];
      return <article className="region-service-card" key={text(find(node, "h3")[0])}><Mark className="region-service-icon" aria-hidden="true" /><h3>{text(find(node, "h3")[0])}</h3><p>{text(find(node, "p")[0])}</p><CheckList items={find(node, "li").map(item => text(item).trim())} />{links(node).map(link => <a className="text-link" key={link.to || link.href} href={link.to || link.href}>{label(link)}</a>)}</article>;
    })}</div></div></section>

    <section className="section region-premium" id="premium"><div className="container region-split">{isImageFirst(premium) ? <>{image(2)}{premiumCopy}</> : <>{premiumCopy}{image(2)}</>}</div></section>

    <section className="section region-values"><div className="container"><div className="region-section-heading centered"><h2>{heading(values)}</h2>{find(values, "p").length > valueCards.length && <p>{text(find(values, "p")[0])}</p>}</div><div className="region-values-grid" style={{ "--region-columns": valueCards.length } as CSSProperties}>{valueCards.map((node, i) => {
      const Mark = valueIcons[i];
      return <article key={text(find(node, "h3")[0])}><Mark className="region-value-icon" aria-hidden="true" /><h3>{text(find(node, "h3")[0])}</h3><p>{text(find(node, "p")[0])}</p></article>;
    })}</div></div></section>

    <section className="section region-projects"><div className="container"><div className="region-section-heading centered"><h2>{heading(gallery)}</h2><p>{text(find(gallery, "p")[0])}</p></div><div className="region-project-grid">{original.sections[4].images.map((asset, i) => <figure key={asset.alt}>{image(4, i)}<figcaption>{text(galleryCaptions[i])}</figcaption></figure>)}</div></div></section>

    <section className="section region-process"><div className="container"><div className="region-section-heading centered"><h2>{heading(process)}</h2><p>{text(find(process, "p")[0])}</p></div><ol className="region-step-grid">{processCards.map((node, i) => <li key={text(find(node, "h3")[0])}><span className="region-step-number">{i + 1}</span><h3>{text(find(node, "h3")[0])}</h3><p>{text(find(node, "p")[0])}</p></li>)}</ol></div></section>

    <section className="section region-coverage"><div className={`container ${original.sections[6].images.length ? "region-split" : "region-coverage-copy"}`}>{original.sections[6].images.length ? isImageFirst(coverage) ? <>{image(6)}{coverageCopy}</> : <>{coverageCopy}{image(6)}</> : coverageCopy}</div></section>
    <FunnelSection initialCity={city.name} />
    <FAQ />
    <section className="section region-closing"><div className="container"><h2>{heading(closing)}</h2>{find(closing, "p").map((p, i) => <p key={i}>{text(p)}</p>)}<div className="region-closing-actions"><a className="button inquiry-button" href="#anfrage">{text(closingButton) || "Projekt anfragen"}</a>{links(closing).filter(node => node.href?.startsWith("tel:")).map(node => <a className="text-link" href={node.href} key={node.href}><Icon name="phone" />{label(node)}</a>)}</div></div></section>
  </div>;
}
