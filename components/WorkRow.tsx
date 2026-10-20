"use client";

import { useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";

export type WorkPhoto = { id: string; alt: string; src: string; thumbnail: string; compactThumbnail: string; width: number; height: number; index: number };

/** Only the visible strip plus two buffer photos is mounted, rather than two full galleries. */
export function WorkRow({ photos, reverse, onOpen }: { photos: WorkPhoto[]; reverse: boolean; onOpen: (index: number) => void }) {
  const row = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const [count, setCount] = useState(6);
  const [offset, setOffset] = useState(0);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const measure = () => {
      const card = track.current?.firstElementChild;
      if (!card || !row.current || !track.current) return;
      const stride = card.getBoundingClientRect().width + parseFloat(getComputedStyle(track.current).columnGap);
      setCount(Math.ceil(row.current.clientWidth / stride) + 2);
    };
    measure();
    const observer = new ResizeObserver(measure);
    const visibility = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting));
    if (row.current) observer.observe(row.current);
    if (row.current) visibility.observe(row.current);
    return () => { observer.disconnect(); visibility.disconnect(); };
  }, []);
  return <div className="work-row" ref={row} data-in-view={inView} aria-hidden="true"><div ref={track} className={`work-track ${reverse ? "moves-right" : "moves-left"}`} onAnimationIteration={event => {
    if (event.target !== event.currentTarget) return;
    // Commit the one-card rotation before the next paint so the looping seam stays invisible.
    flushSync(() => setOffset(value => (value + (reverse ? -1 : 1) + photos.length) % photos.length));
  }}>{Array.from({ length: count }, (_, slot) => {
    const photo = photos[(offset + slot) % photos.length];
    return <button className="work-photo" type="button" key={`${photo.id}-${Math.floor(slot / photos.length)}`} tabIndex={-1} onClick={() => onOpen(photo.index)}><img src={photo.thumbnail} srcSet={`${photo.compactThumbnail} 320w, ${photo.thumbnail} 640w`} sizes="(max-width:767px) 240px, 320px" alt="" width="640" height="480" loading="lazy" decoding="async" draggable={false} /></button>;
  })}</div></div>;
}
