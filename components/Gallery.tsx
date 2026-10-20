"use client";
import { useEffect, useRef, useState } from "react";
import gallery from "@/content/gallery.json";
import { Icon } from "./Icons";
import { site } from "@/lib/site";
export function Gallery({ preview = false }: { preview?: boolean }) {
  const [filter,setFilter] = useState("alle");
  const [active,setActive] = useState<number | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const opener = useRef<HTMLButtonElement | null>(null);
  const items = preview ? [gallery[0], gallery[4], gallery[3]] : gallery.filter(g => filter==="alle" || g.category===filter || (filter==="bad" && g.category==="premium"));
  useEffect(() => { if (active===null) return; dialog.current?.showModal(); }, [active]);
  const close = () => { dialog.current?.close(); setActive(null); opener.current?.focus(); };
  const change = (direction:number) => setActive(prev => prev===null ? null : (prev + direction + items.length)%items.length);
  return <div className={preview ? "gallery-preview" : "gallery-full"}>
    {!preview && <div className="gallery-toolbar"><div className="gallery-filters" aria-label="Projekte filtern">{[["alle","Alle Projekte"],["bad","Bäder"],["premium","Großformat & Details"],["boden","Böden"]].map(([id,label]) => <button key={id} aria-pressed={filter===id} className={filter===id ? "active" : ""} onClick={() => setFilter(id)}>{label}</button>)}</div></div>}
    <div className="gallery-grid">{items.map((g,i) => <figure key={g.id}><button className="gallery-open" aria-label={`Bild vergrößern: ${g.alt}`} onClick={e => { opener.current=e.currentTarget; setActive(i); }}><img src={`/media/${g.id}${preview ? "" : "-small"}.webp`} alt={g.alt} width={g.width} height={g.height} loading="lazy" /><span className="gallery-expand"><Icon name="arrowUp" /></span></button></figure>)}</div>
    {!preview && <p className="gallery-social">Mehr Einblicke und aktuelle Projekte finden Sie auf <a href={site.instagram} target="_blank" rel="noopener noreferrer">Instagram <Icon name="arrowUp" /></a>.</p>}
    <dialog ref={dialog} className="lightbox" aria-label="Projektbild in Großansicht" onCancel={e=>{e.preventDefault();close();}} onClick={e=>{if(e.target===dialog.current)close();}} onKeyDown={e=>{if(e.key==="ArrowRight")change(1);if(e.key==="ArrowLeft")change(-1);}}>
      {active!==null && items[active] && <div className="lightbox-content"><button className="lightbox-close" onClick={close} autoFocus aria-label="Bildansicht schließen"><Icon name="close" /></button><img src={`/media/${items[active].id}.webp`} alt={items[active].alt} width={items[active].width} height={items[active].height} /><div className="lightbox-bottom"><p>{items[active].alt}</p><button onClick={()=>change(-1)} aria-label="Vorheriges Bild">←</button><button onClick={()=>change(1)} aria-label="Nächstes Bild">→</button></div></div>}
    </dialog>
  </div>;
}
