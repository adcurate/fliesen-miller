"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import photos from "@/content/work-gallery.json";
import { Icon } from "./Icons";

export function WorkGallery({ standalone = false }: { standalone?: boolean }) {
  const [paused, setPaused] = useState(false);
  const [overview, setOverview] = useState(false);
  const [active, setActive] = useState<number | null>(null);
  const [reduced, setReduced] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const opener = useRef<HTMLButtonElement | null>(null);
  const overviewButton = useRef<HTMLButtonElement>(null);
  const rows = Array.from({ length: 4 }, (_, row) => photos.map((photo, index) => ({ ...photo, index })).filter((_, index) => index % 4 === row));

  useEffect(() => {
    const media = matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(media.matches);
    update(); media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (active === null) return;
    const panel = dialog.current;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panel?.showModal();
    return () => { panel?.close(); document.body.style.overflow = previousOverflow; };
  }, [active === null]);

  function open(index: number, trigger: HTMLButtonElement, duplicate = false) {
    opener.current = duplicate ? overviewButton.current : trigger;
    setActive(index);
  }
  function close() {
    dialog.current?.close(); setActive(null);
    opener.current?.focus({ preventScroll: true });
  }
  function change(direction: number) {
    setActive(index => index === null ? null : (index + direction + photos.length) % photos.length);
  }

  return <section className="section work-gallery" id="projekte" aria-labelledby="work-gallery-title" data-paused={paused || overview || active !== null}>
    <div className="container work-gallery-heading"><div><h2 id="work-gallery-title">{standalone ? "Fliesenarbeiten im Detail" : "Arbeitsgalerie"}</h2><p>Bäder, Böden und saubere Details – Einblicke in unsere Arbeit.</p></div><div className="work-gallery-actions"><button type="button" className="work-motion-toggle" aria-pressed={paused || overview || reduced} disabled={reduced} onClick={() => { if (overview) { setOverview(false); setPaused(false); } else setPaused(value => !value); }}>{reduced ? "Ohne automatische Bewegung" : paused || overview ? "Bewegung starten" : "Bewegung pausieren"}<span aria-hidden="true">{paused || overview || reduced ? "▶" : "Ⅱ"}</span></button>{!standalone && <a className="text-link" href="/referenzen">Alle Arbeiten ansehen<Icon name="arrowUp" /></a>}</div></div>

    <div className="work-marquees" aria-label="Arbeitsfotos in vier gegenläufigen Reihen">{rows.map((row, rowIndex) => <div className="work-row" key={rowIndex}><div className={`work-track ${rowIndex % 2 === 0 ? "moves-right" : "moves-left"}`} style={{ "--work-duration": `${row.length * 9}s` } as CSSProperties}>{[false, true].map(duplicate => <div className={`work-photo-group ${duplicate ? "work-photo-duplicate" : ""}`} key={String(duplicate)} aria-hidden={duplicate || undefined}>{row.map((photo, position) => <button className="work-photo" type="button" key={photo.id} tabIndex={-1} aria-label={`${photo.alt} – vergrößern`} onClick={event => open(photo.index, event.currentTarget, duplicate)}><img src={photo.thumbnail} alt="" width={photo.width} height={photo.height} loading={position < 2 ? "eager" : "lazy"} decoding="async" /><span className="work-photo-expand" aria-hidden="true"><Icon name="arrowUp" /></span></button>)}</div>)}</div></div>)}</div>

    <div className="container work-gallery-footer"><button ref={overviewButton} type="button" className="text-link work-overview-toggle" aria-expanded={overview} aria-controls="work-overview" onClick={() => setOverview(value => !value)}>{overview ? "Bildübersicht schließen" : `Alle ${photos.length} Fotos als Übersicht anzeigen`}<Icon name="chevron" /></button><a href="https://www.google.com/maps?cid=6472827481252018042" target="_blank" rel="noopener noreferrer" className="work-google-link">Fliesen Miller auf Google Maps<Icon name="arrowUp" /></a></div>
    {overview && <div id="work-overview" className="container work-overview"><div className="work-overview-grid">{photos.map((photo, index) => <button className="work-photo" type="button" key={photo.id} aria-label={`${photo.alt} – vergrößern`} onClick={event => open(index, event.currentTarget)}><img src={photo.thumbnail} alt={photo.alt} width={photo.width} height={photo.height} loading="lazy" decoding="async" /><span className="work-photo-expand" aria-hidden="true"><Icon name="arrowUp" /></span></button>)}</div></div>}

    <dialog ref={dialog} className="work-lightbox" aria-label="Arbeitsfoto in Großansicht" onCancel={event => { event.preventDefault(); close(); }} onClick={event => { if (event.target === dialog.current) close(); }} onKeyDown={event => { if (event.key === "ArrowRight") { event.preventDefault(); change(1); } if (event.key === "ArrowLeft") { event.preventDefault(); change(-1); } }}>
      {active !== null && <div className="work-lightbox-content"><button type="button" className="lightbox-close" onClick={close} autoFocus aria-label="Bildansicht schließen"><Icon name="close" /></button><img src={photos[active].src} alt={photos[active].alt} width={photos[active].width} height={photos[active].height} /><div className="work-lightbox-footer"><p aria-live="polite">Bild {active + 1} von {photos.length}</p><div><button type="button" onClick={() => change(-1)} aria-label="Vorheriges Arbeitsfoto">←</button><button type="button" onClick={() => change(1)} aria-label="Nächstes Arbeitsfoto">→</button></div></div></div>}
    </dialog>
  </section>;
}
