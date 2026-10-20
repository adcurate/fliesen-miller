"use client";

import { useState } from "react";
import { Icon } from "./Icons";
import { site } from "@/lib/site";

export function LocationMap() {
  const [loaded, setLoaded] = useState(false);
  const address = `${site.street}, ${site.city}`;
  return <div className="location-map">
    {loaded ? <>
      <iframe title={`Standort Fliesen Miller: ${address}`} src={`https://maps.google.com/maps?q=${encodeURIComponent(address)}&z=16&output=embed`} referrerPolicy="no-referrer" allowFullScreen />
      <button type="button" className="map-close" onClick={() => setLoaded(false)} aria-label="Standortkarte schließen">×</button>
    </> : <div className="map-preview">
      <Icon name="map" className="map-preview-icon" />
      <h3>Hier finden Sie uns</h3>
      <p>{site.street}<br />{site.city}</p>
      <button type="button" className="button" onClick={() => setLoaded(true)}>Karte laden<Icon name="pin" /></button>
      <p className="map-privacy">Beim Laden werden Daten an Google übermittelt. <a href="https://policies.google.com/privacy?hl=de" target="_blank" rel="noopener noreferrer">Datenschutz</a></p>
    </div>}
  </div>;
}
