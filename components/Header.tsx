"use client";
import { useState, useEffect, useRef } from "react";
import { usePathname } from "@/preview/navigation";
import { cities, site } from "@/lib/site";
import { Icon } from "./Icons";
export function Header() {
  const [open, setOpen] = useState(false);
  const path = usePathname();
  const menuRef = useRef<HTMLButtonElement>(null);
  useEffect(() => { setOpen(false); }, [path]);
  useEffect(() => {
    if (!open) return;
    const escape = (event: KeyboardEvent) => { if (event.key === "Escape") { setOpen(false); menuRef.current?.focus(); } };
    document.addEventListener("keydown", escape);
    return () => document.removeEventListener("keydown", escape);
  }, [open]);
  const link = (href: string, label: string) => <a href={href} onClick={() => setOpen(false)} aria-current={path === href ? "page" : undefined}>{label}</a>;
  return <><a className="skip-link" href="#main">Zum Inhalt springen</a>
    <header className="site-header"><div className="header-inner">
      <a href="/" className="brand" aria-label="Fliesen Miller – Startseite"><img src="/media/logo.webp" alt="Fliesen Miller" width="170" height="64" /></a>
      <nav id="main-nav" className={open ? "main-nav is-open" : "main-nav"} aria-label="Hauptnavigation">
        {link(path === "/" ? "#leistungen" : "/leistungen", "Leistungen")}{link(path === "/" ? "#premium" : "/premium", "Premium")}{link(path === "/" ? "#projekte" : "/referenzen", "Referenzen")}{link("/reparatur", "Reparatur")}{link("/ueber-uns", "Über uns")}
        <details className="nav-dropdown"><summary>Einsatzgebiete <Icon name="chevron" /></summary><div><a href="/einsatzgebiete" onClick={() => setOpen(false)}>Alle Einsatzgebiete<Icon name="arrowUp" /></a>{cities.map(c => <a key={c.slug} href={`/fliesenleger-${c.slug}`} onClick={() => setOpen(false)}>{c.name}<Icon name="arrowUp" /></a>)}</div></details>
        {link("/kontakt", "Kontakt")}
        <a href={site.phoneHref} className="mobile-nav-phone"><Icon name="phone" />{site.phone}</a>
      </nav>
      <div className="header-actions"><a className="desktop-header-phone" href={site.phoneHref}><Icon name="phone" />{site.phone}</a><a href="/anfrage" className="button button-small inquiry-button">Projekt anfragen</a><button ref={menuRef} className="menu-toggle" aria-label={open ? "Menü schließen" : "Menü öffnen"} aria-expanded={open} aria-controls="main-nav" onClick={() => setOpen(!open)}><Icon name={open ? "close" : "menu"} /></button></div>
    </div></header></>;
}
