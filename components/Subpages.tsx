import { createElement, Fragment, type ReactNode } from "react";
import source from "@/content/source.json";
import { PageHero, CTA, LinkArrow, ContactSection, Regions, FAQ, Values, LocationSection } from "./Shared";
import { Icon } from "./Icons";
import { WorkGallery } from "./WorkGallery";
import { FunnelSection } from "./Funnel";
import { GoogleReviews } from "./GoogleReviews";
export { RegionPage as CityPage } from "./RegionPage";
type Node = string | number | null | { tag?:string; children?:Node|Node[]; className?:string; to?:string; href?:string; alt?:string; [key:string]:unknown };
const children = (node:Node):Node[] => node && typeof node==="object" ? Array.isArray(node.children)?node.children:node.children==null?[]:[node.children] : [];
function findAll(node:Node,tag:string):Exclude<Node,string|number|null>[] { if(!node||typeof node!=="object")return[];return [...(node.tag===tag?[node]:[]),...children(node).flatMap(n=>findAll(n,tag))]; }
function text(node:Node):string {if(typeof node==="string"||typeof node==="number")return String(node);return children(node).map(text).join("");}
function mainOf(route:string) { return findAll(source.pages.find(p=>p.route===route)?.tree as Node,"main")[0]; }

function RichSource({node,legal=false,imageIndex=3,requestHref="/#anfrage",initialCity="",omitServiceRelatedLinks=false}:{node:Node;legal?:boolean;imageIndex?:number;requestHref?:string;initialCity?:string;omitServiceRelatedLinks?:boolean}) {
  let images=imageIndex;
  function render(n:Node,key:number|string=0):ReactNode {
    if(n==null)return null;if(typeof n==="string"||typeof n==="number")return n;
    const tag=n.tag||"div";const ch=children(n);
    if(omitServiceRelatedLinks&&tag==="div"&&["/ueber-uns","/reparatur","/fliesenleger-cloppenburg"].every(href=>ch.some(child=>child&&typeof child==="object"&&(child.to===href||child.href===href))))return null;
    if(["SEO","Header","Footer"].includes(tag))return null;
    if(tag==="InquiryFunnel")return <FunnelSection key={key} initialCity={initialCity} />;
    if(tag==="FAQ")return <FAQ key={key} />;
    if(tag==="h1")return null;
    if(!legal&&tag==="p"&&n.className?.includes("text-primary"))return null;
    if(!legal&&tag==="div"&&n.className?.includes("rounded-full")&&/^\d{1,2}$/.test(text(n).trim()))return null;
    if(tag==="img") {const id=String((images++%14)+1).padStart(2,"0");return <img key={key} className="source-image" src={`/media/gallery-${id}.webp`} alt={n.alt||"Einblick in die Fliesenarbeiten von Fliesen Miller"} width="1200" height="900" loading="lazy" />;}
    if(tag==="Button") {const a=ch.find(x=>x&&typeof x==="object"&&(x.href||x.to));let href=a&&typeof a==="object"?String(a.href||a.to):requestHref;if(href==="/#anfrage"||href==="#anfrage"||href==="/anfrage")href=requestHref;return <a key={key} className={`button ${n.variant==="outline"?"button-outline":""} ${href.includes("anfrage")?"inquiry-button":""}`} href={href}>{(a?children(a):ch).map((c,i)=>render(c,i))}{!href.includes("anfrage")&&<Icon name="arrowUp" />}</a>;}
    if(n.href||n.to) {let href=String(n.href||n.to);if(href==="/#anfrage"||href==="#anfrage"||href==="/anfrage")href=requestHref;return <a key={key} className={href.startsWith("tel:")?"text-link":"source-link"} href={href}>{ch.map((c,i)=>render(c,i))}</a>;}
    if(tag==="a"&&!n.href&&!n.to)return null;
    if(!["Fragment","main","section","div","h2","h3","h4","p","ul","ol","li","dl","dt","dd","br","strong","em","span","address"].includes(tag))return ch.length?<Fragment key={key}>{ch.map((c,i)=>render(c,i))}</Fragment>:null;
    if(tag==="Fragment"||tag==="main")return <Fragment key={key}>{ch.map((c,i)=>render(c,i))}</Fragment>;
    if(tag==="br")return <br key={key}/>;
    let cls="";
    if(tag==="section")cls=legal?"":"section source-section";
    if(tag==="div"){
      if(n.className?.includes("container-narrow"))cls=legal?"":"container";
      else if(n.className?.includes("flex")&&ch.some(c=>c&&typeof c==="object"&&(c.tag==="Button"||c.to)))cls="source-actions";
      else if(n.className?.includes("grid")&&n.className.includes("lg:grid-cols-2"))cls="source-split";
      else if(n.className?.includes("grid"))cls="source-grid";
      else if(ch.some(c=>c&&typeof c==="object"&&["h2","h3"].includes(c.tag||"")))cls="source-item";
      else if(n.className?.includes("space-y"))cls="source-stack";
    }
    if(tag==="p" && n.className?.includes("text-center"))cls="source-lead";
    const isTechnical=legal&&tag==="div"&&ch.some(c=>c&&typeof c==="object"&&c.tag==="h2"&&text(c).startsWith("4. Technische Dienstleister"));
    if(isTechnical)return <section key={key}><h2>4. Technische Dienstleister und Vorschau</h2><p>Diese statische Vorschau wird auf GitHub Pages bereitgestellt. Beim Aufruf verarbeitet GitHub technische Zugriffsdaten. Weitere Informationen finden Sie in der <a href="https://docs.github.com/de/site-policy/privacy-policies/github-general-privacy-statement" target="_blank" rel="noopener noreferrer">Datenschutzerklärung von GitHub</a>.</p><p>Das Anfrageformular dient ausschließlich zur Ansicht. Es versendet und speichert keine Anfragen oder Dateianhänge auf einem Server. Eingaben und ausgewählte Dateien verbleiben bis zum Schließen oder Neuladen im Arbeitsspeicher Ihres Browsers. Eine Anfrageverwaltung ist nicht Bestandteil dieser Vorschau.</p><p>Die Standortkarte wird erst nach einem Klick auf „Karte laden“ von Google Maps eingebunden. Dabei erhält Google insbesondere Ihre IP-Adresse und technische Browserdaten. Mit „Standortkarte schließen“ lässt sich die Einbettung wieder entfernen. Weitere Informationen finden Sie in der <a href="https://policies.google.com/privacy?hl=de" target="_blank" rel="noopener noreferrer">Datenschutzerklärung von Google</a>.</p></section>;
    return createElement(tag,{key,...(cls?{className:cls}:{})},ch.map((c,i)=>render(c,i)));
  }
  return <>{render(node)}</>;
}
function sourceHero(route:string){const first=children(mainOf(route))[0];const paragraphs=findAll(first,"p");return {title:text(findAll(first,"h1")[0]),eyebrow:text(paragraphs.find(p=>p.className?.includes("text-primary"))||null),paragraphs:paragraphs.filter(p=>!p.className?.includes("text-primary"))};}
export function ServicesPage(){
  const page=source.pages.find(p=>p.route==="/leistungen")!;const articles=findAll(page.tree as Node,"article");
  const anchorIds=["fliesenverlegung","badezimmer","bodenfliesen","kuechenfliesen","grossformat","mosaik","gehrung","sanierung"];
  const indexLabels=["Verlegung","Badezimmer","Boden","Küche","Großformat","Mosaik","Gehrung","Sanierung"];
  return <div className="services-page"><PageHero compact eyebrow="Leistungen" title="Fliesen- und Plattenarbeiten" intro="Für Bad, Boden und Küche – von der klassischen Verlegung bis zu Großformat und Sanierung." /><nav className="service-index" aria-label="Leistungen auf dieser Seite"><div className="container">{articles.map((article,i)=><a href={`#${anchorIds[i]}`} key={i} aria-label={text(findAll(article,"h2")[0])}>{indexLabels[i]}</a>)}</div></nav><section className="section service-details service-details-text"><div className="container service-cards-grid">{articles.map((article,i)=>{const title=text(findAll(article,"h2")[0]);const description=text(findAll(article,"p")[0]);const definitions=findAll(article,"dl")[0];return <article id={anchorIds[i]} className="service-detail service-detail-text" key={title}><h2>{title}</h2><div className="service-detail-copy"><p className="large-copy">{description}</p><RichSource node={definitions} /><LinkArrow className="service-inquiry-link" href={`/anfrage${i===4||i===6?"?projekt=premium":i===7?"?projekt=sanierung":""}`}>Projekt anfragen</LinkArrow></div></article>;})}</div></section><RichSource node={children(mainOf("/leistungen")).at(-1)||null} omitServiceRelatedLinks /></div>;
}
export function RepairPage(){
  const sections=children(mainOf("/reparatur"));const hero=sourceHero("/reparatur");
  return <><PageHero eyebrow={hero.eyebrow} title="Fliesenreparatur & Versicherung" intro={text(hero.paragraphs[0])} phoneLabel="Jetzt anrufen: 04471 / 70 840 73" back /><div className="repair-source">{sections.slice(1).map((section,i)=><RichSource node={section} key={i} requestHref="/anfrage?projekt=reparatur" />)}</div></>;
}
export function AboutPage(){
  const sections=children(mainOf("/ueber-uns"));const hero=sourceHero("/ueber-uns");
  const aboutValues=findAll(sections[1],"h3").map((heading,i):[string,string]=>[text(heading),text(findAll(sections[1],"p")[i])]);
  return <div className="about-page"><PageHero eyebrow={hero.eyebrow} title="Fliesen Miller aus Cloppenburg" intro="Fliesen- und Plattenarbeiten für private und gewerbliche Projekte. Vom klassischen Bodenformat bis zur XXL-Fliese mit Gehrungsschnitt." /><section className="section about-story-section"><div className="container about-story"><div>{hero.paragraphs.slice(1).map((p,i)=><p className={i===0?"large-copy":""} key={i}>{text(p)}</p>)}</div></div></section><Values title="Wofür wir stehen" items={aboutValues} icons={["qualityPrecision","qualityClean","qualityAgreement","qualityProcess"]} /><GoogleReviews /><LocationSection /></div>;
}
export function LegalPage({slug}:{slug:string}){
  const route=`/${slug}`;const page=source.pages.find(p=>p.route===route)!;
  const titles:Record<string,string>={impressum:"Impressum",datenschutz:"Datenschutzerklärung",agb:"Allgemeine Geschäftsbedingungen"};
  return <section className="section legal-page"><div className="container legal-layout"><aside><a href="/">← Zur Startseite</a><nav aria-label="Rechtliche Informationen">{["impressum","datenschutz","agb"].map(key=><a key={key} href={`/${key}`} aria-current={key===slug?"page":undefined}>{titles[key]}</a>)}</nav></aside><article className="legal-content"><h1>{titles[slug]}</h1><RichSource node={mainOf(route)} legal /></article></div></section>;
}
export function ReferencePage(){return <><PageHero compact eyebrow="Referenzen" title="Arbeitsgalerie" intro="Bäder, Böden und Fliesendetails aus unseren Projekten." /><WorkGallery standalone /><CTA /></>;}
export function ContactPage(){return <><PageHero compact eyebrow="Erreichbarkeit" title="Kontakt" intro="" /><ContactSection /><Regions /><CTA /></>;}
