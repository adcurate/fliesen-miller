"use client";

import { useEffect, useRef, useState } from "react";
import photos from "@/content/work-gallery.json";
import { galleryTitle, galleryIntro } from "@/lib/gallery";
import { Icon } from "./Icons";
import { WorkRow } from "./WorkRow";

const indexedPhotos = photos.map((photo, index) => ({ ...photo, index }));
const rows = Array.from({ length: 4 }, (_, row) => indexedPhotos.filter((_, index) => index % 4 === row));

export function WorkGallery({ standalone = false }: { standalone?: boolean }) {
  const [overview, setOverview] = useState(false);
  const [active, setActive] = useState<number | null>(null);
  const [inView, setInView] = useState(false);
  const [visible, setVisible] = useState(true);
  const section = useRef<HTMLElement>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const opener = useRef<HTMLButtonElement | null>(null);
  const overviewButton = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting));
    if (section.current) observer.observe(section.current);
    const updateVisibility = () => setVisible(document.visibilityState === "visible");
    updateVisibility(); document.addEventListener("visibilitychange", updateVisibility);
    return () => { observer.disconnect(); document.removeEventListener("visibilitychange", updateVisibility); };
  }, []);
  useEffect(() => {
    if (active === null) return;
    const panel = dialog.current;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panel?.showModal();
    return () => { panel?.close(); document.body.style.overflow = previousOverflow; };
  }, [active === null]);

  function open(index: number, trigger?: HTMLButtonElement) {
    opener.current = trigger || overviewButton.current;
    setActive(index);
  }
  function close() {
    dialog.current?.close(); setActive(null);
    opener.current?.focus({ preventScroll: true });
  }
  function change(direction: number) {
    setActive(index => index === null ? null : (index + direction + photos.length) % photos.length);
  }

  return <section ref={section} className={`section work-gallery ${standalone ? "work-gallery-standalone" : ""}`} id="projekte" aria-label={standalone ? galleryTitle : undefined} aria-labelledby={standalone ? undefined : "work-gallery-title"} data-running={inView && visible && !overview && active === null}>
    {!standalone && <div className="container work-gallery-heading"><div><h2 id="work-gallery-title">{galleryTitle}</h2><p>{galleryIntro}</p></div><a className="text-link" href="/referenzen">Alle Arbeiten ansehen<Icon name="arrowUp" /></a></div>}
    {!overview && <div className="work-marquees" aria-label="Arbeitsfotos in vier gegenläufigen Reihen">{rows.map((row, index) => <WorkRow key={index} photos={row} reverse={index % 2 === 0} onOpen={index => open(index)} />)}</div>}
    <noscript><div className="container work-overview-grid">{photos.map(photo => <a key={photo.id} className="work-photo" href={photo.src}><img src={photo.thumbnail} alt={photo.alt} width="640" height="480" loading="lazy" /></a>)}</div></noscript>
    <div className="container work-gallery-footer"><button ref={overviewButton} type="button" className="text-link work-overview-toggle" aria-expanded={overview} aria-controls="work-overview" onClick={() => setOverview(value => !value)}>{overview ? "Zur bewegten Galerie" : `Alle ${photos.length} Fotos als Übersicht anzeigen`}<Icon name="chevron" /></button><a href="https://www.google.com/maps?cid=6472827481252018042" target="_blank" rel="noopener noreferrer" className="work-google-link">Fliesen Miller auf Google Maps<Icon name="arrowUp" /></a></div>
    {overview && <div id="work-overview" className="container work-overview"><div className="work-overview-grid">{photos.map((photo, index) => <button className="work-photo" type="button" key={photo.id} aria-label={`${photo.alt} – vergrößern`} onClick={event => open(index, event.currentTarget)}><img src={photo.thumbnail} srcSet={`${photo.compactThumbnail} 320w, ${photo.thumbnail} 640w`} sizes="(max-width:639px) 90vw, (max-width:1080px) 30vw, 320px" alt={photo.alt} width="640" height="480" loading="lazy" decoding="async" /><span className="work-photo-expand" aria-hidden="true"><Icon name="arrowUp" /></span></button>)}</div></div>}
    <dialog ref={dialog} className="work-lightbox" aria-label="Arbeitsfoto in Großansicht" onCancel={event => { event.preventDefault(); close(); }} onClick={event => { if (event.target === dialog.current) close(); }} onKeyDown={event => { if (event.key === "ArrowRight") { event.preventDefault(); change(1); } if (event.key === "ArrowLeft") { event.preventDefault(); change(-1); } }}>
      {active !== null && <div className="work-lightbox-content"><button type="button" className="lightbox-close" onClick={close} autoFocus aria-label="Bildansicht schließen"><Icon name="close" /></button><img src={photos[active].src} alt={photos[active].alt} width={photos[active].width} height={photos[active].height} decoding="async" /><div className="work-lightbox-footer"><p aria-live="polite">Bild {active + 1} von {photos.length}</p><div><button type="button" onClick={() => change(-1)} aria-label="Vorheriges Arbeitsfoto">←</button><button type="button" onClick={() => change(1)} aria-label="Nächstes Arbeitsfoto">→</button></div></div></div>}
    </dialog>
  </section>;
}
