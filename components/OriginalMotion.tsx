"use client";
import { useEffect, useRef, useState } from "react";
import images from "@/content/gallery.json";
import { Icon } from "./Icons";

export function TypingWord() {
  const [word,setWord]=useState("");
  useEffect(()=>{
    const media=window.matchMedia("(prefers-reduced-motion: reduce)");
    let timer:ReturnType<typeof setTimeout>;let index=0,count=0,deleting=false;
    const words=["Fliesen","Platten","Mosaik"];
    function tick(){
      if(media.matches){setWord(words[0]);return;}
      const current=words[index];count+=deleting?-1:1;setWord(current.slice(0,count));
      let delay=deleting?80:120+Math.random()*60;
      if(count===current.length&&!deleting){deleting=true;delay=1800;}
      else if(count===0&&deleting){deleting=false;index=(index+1)%words.length;delay=400;}
      timer=setTimeout(tick,delay);
    }
    function restart(){clearTimeout(timer);index=0;count=0;deleting=false;if(media.matches)setWord(words[0]);else{setWord("");timer=setTimeout(tick,120);}}
    restart();media.addEventListener("change",restart);return()=>{clearTimeout(timer);media.removeEventListener("change",restart);};
  },[]);
  return <><span className="sr-only">Fliesen, Platten und Mosaik</span><span className="typing-word" aria-hidden="true">{word}<span className="typing-caret">|</span></span></>;
}
export function PremiumVideo(){
  const ref=useRef<HTMLVideoElement>(null);const [paused,setPaused]=useState(false);const userPaused=useRef(false);
  useEffect(()=>{
    const video=ref.current;if(!video)return;
    const media=window.matchMedia("(prefers-reduced-motion: reduce)");let visible=false;
    function sync(){if(!video)return;if(visible&&document.visibilityState==="visible"&&!userPaused.current&&!media.matches)void video.play().catch(()=>{});else video.pause();}
    function load(){if(!video||video.getAttribute("src"))return;video.src=import.meta.env.BASE_URL+"media/gehrungsschnitt.mp4";video.preload="auto";video.load();}
    function metadata(){if(video)video.playbackRate=.85;sync();}
    function fade(){if(video)video.style.opacity=String(Math.min(1,Math.max(0,video.duration-video.currentTime)));}
    const loader=typeof IntersectionObserver!=="undefined"?new IntersectionObserver(entries=>{if(entries.some(e=>e.isIntersecting)){load();loader?.disconnect();}},{rootMargin:"300px 0px"}):null;
    const observer=typeof IntersectionObserver!=="undefined"?new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;sync();},{threshold:.1}):null;
    if(loader)loader.observe(video);else load();if(observer)observer.observe(video);else visible=true;
    const state=()=>setPaused(video.paused);
    video.addEventListener("loadedmetadata",metadata);video.addEventListener("timeupdate",fade);video.addEventListener("play",state);video.addEventListener("pause",state);document.addEventListener("visibilitychange",sync);media.addEventListener("change",sync);
    return()=>{loader?.disconnect();observer?.disconnect();video.pause();video.removeEventListener("loadedmetadata",metadata);video.removeEventListener("timeupdate",fade);video.removeEventListener("play",state);video.removeEventListener("pause",state);document.removeEventListener("visibilitychange",sync);media.removeEventListener("change",sync);};
  },[]);
  return <><video ref={ref} muted loop playsInline preload="none" poster="/media/gallery-09.webp" width="960" height="1200" aria-label="Präzise Gehrungsschnitte von Fliesen Miller" /><button className="media-keyboard-control" type="button" aria-label={paused?"Video abspielen":"Video pausieren"} onClick={()=>{const video=ref.current;if(!video)return;userPaused.current=!video.paused;if(video.paused)void video.play().catch(()=>{});else video.pause();}}>{paused?"Video abspielen":"Video pausieren"}</button></>;
}
export function ReferenceCarousel(){
  const [index,setIndex]=useState(0);const [paused,setPaused]=useState(false);const [expanded,setExpanded]=useState(false);const [reduced,setReduced]=useState(false);const lock=useRef(0);const close=useRef<HTMLButtonElement>(null);const opener=useRef<HTMLButtonElement>(null);
  useEffect(()=>{const media=matchMedia("(prefers-reduced-motion: reduce)");const change=()=>setReduced(media.matches);change();media.addEventListener("change",change);return()=>media.removeEventListener("change",change);},[]);
  useEffect(()=>{if(paused||reduced||expanded)return;const timer=setInterval(()=>{if(document.visibilityState==="visible")setIndex(i=>(i+1)%images.length);},5000);return()=>clearInterval(timer);},[paused,reduced,expanded]);
  useEffect(()=>{if(!expanded)return;const before=document.body.style.overflow;document.body.style.overflow="hidden";close.current?.focus();const key=(e:KeyboardEvent)=>{if(e.key==="Escape")setExpanded(false);if(e.key==="ArrowRight")setIndex(i=>(i+1)%images.length);if(e.key==="ArrowLeft")setIndex(i=>(i-1+images.length)%images.length);if(e.key==="Tab"){e.preventDefault();close.current?.focus();}};document.addEventListener("keydown",key);return()=>{document.body.style.overflow=before;document.removeEventListener("keydown",key);opener.current?.focus();};},[expanded]);
  function select(i:number){if(Date.now()<lock.current)return;lock.current=Date.now()+700;setIndex(i);}
  return <div className="reference-carousel" aria-roledescription="Karussell" aria-label="Referenzen"><div className="reference-stage"><button ref={opener} className="reference-open" type="button" aria-label={`${images[index].alt} – vergrößern`} onClick={()=>setExpanded(true)}>{images.map((photo,i)=><img key={photo.id} src={`/media/${photo.id}.webp`} alt={i===index?photo.alt:""} width={photo.width} height={photo.height} loading={i<2?"eager":"lazy"} className={i===index?"active":""} aria-hidden={i!==index} />)}</button></div><div className="reference-thumbs">{images.map((photo,i)=><button type="button" key={photo.id} className={i===index?"active":""} aria-label={`Referenz ${i+1}: ${photo.alt}`} aria-current={i===index?"true":undefined} onClick={()=>select(i)}><img src={`/media/${photo.id}-small.webp`} alt="" width="90" height="70" loading="lazy" /></button>)}</div><button type="button" className="media-keyboard-control" aria-pressed={paused} onClick={()=>setPaused(!paused)}>{paused?"Bildwechsel fortsetzen":"Bildwechsel pausieren"}</button><div className="reference-dots">{images.map((photo,i)=><button type="button" key={photo.id} aria-label={`Referenz ${i+1} anzeigen`} aria-current={i===index?"true":undefined} onClick={()=>select(i)} />)}</div>{expanded&&<div className="reference-lightbox" role="dialog" aria-modal="true" aria-label="Vergrößerte Referenz" onClick={()=>setExpanded(false)}><button type="button" ref={close} className="lightbox-close" aria-label="Bild schließen" onClick={()=>setExpanded(false)}><Icon name="close" /></button><img src={`/media/${images[index].id}.webp`} alt={images[index].alt} width={images[index].width} height={images[index].height} /></div>}</div>;
}
export function OriginalFAQ({items}:{items:{id:string;question:string;answer:string}[]}){
  const [open,setOpen]=useState<string|null>(null);
  return <div className="faq-list">{items.map((faq)=><div className={`faq-item ${open===faq.id?"is-open":""}`} key={faq.id}><h3><button type="button" aria-expanded={open===faq.id} aria-controls={`answer-${faq.id}`} onClick={()=>setOpen(open===faq.id?null:faq.id)}>{faq.question}<span className="plus" aria-hidden="true">+</span></button></h3><div className="faq-answer" id={`answer-${faq.id}`} inert={open!==faq.id}><div><p>{faq.answer}</p></div></div></div>)}</div>;
}
