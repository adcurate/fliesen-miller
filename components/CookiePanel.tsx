"use client";
import { useEffect, useState } from "react";
import { Icon } from "./Icons";
import source from "@/content/source.json";
export const consentKey = "fm-consent-v1";
export const attributionKey = "fm-attribution-v1";
export function rememberAttribution() {
  try {
    if (localStorage.getItem(consentKey) !== "accepted") return;
    if (sessionStorage.getItem(attributionKey)) return;
    const params = new URLSearchParams(location.search);
    const data: Record<string, string> = { landing_page: location.pathname };
    ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"].forEach(key => { const value = params.get(key); if (value) data[key] = value.slice(0, 200); });
    if (document.referrer) { try { const u = new URL(document.referrer); if (u.host !== location.host) data.referrer = u.hostname; } catch { /* malformed referrers have no attribution */ } }
    sessionStorage.setItem(attributionKey, JSON.stringify(data));
  } catch { /* privacy mode: functionality does not depend on storage */ }
}
export function CookiePanel() {
  const [visible, setVisible] = useState(false);
  const [settings, setSettings] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  useEffect(() => {
    try { setVisible(!localStorage.getItem(consentKey)); rememberAttribution(); } catch { setVisible(true); }
    const reopen = () => { try { setAnalytics(localStorage.getItem(consentKey) === "accepted"); } catch { setAnalytics(false); } setSettings(true); setVisible(true); };
    window.addEventListener("fm-consent-open", reopen);
    return () => window.removeEventListener("fm-consent-open", reopen);
  }, []);
  function save(accepted: boolean) {
    try { localStorage.setItem(consentKey, accepted ? "accepted" : "rejected"); if (accepted) rememberAttribution(); else sessionStorage.removeItem(attributionKey); } catch { /* still respect the choice for this view */ }
    setVisible(false); setSettings(false);
  }
  if (!visible) return null;
  return <aside className="cookie-panel" aria-label="Datenschutz-Einstellungen"><div className="cookie-heading"><Icon name="tile" /><strong>Datenschutz-Einstellungen</strong></div>
    <p>Diese Vorschau speichert Ihre Datenschutz-Auswahl im Browser. Mit Ihrer Einwilligung werden Herkunftsangaben nur für die Dauer dieses Besuchs lokal gespeichert. Es werden keine Anfragen oder Analysedaten an einen Server versendet. Ihre Auswahl können Sie jederzeit im Footer ändern.</p>
    {settings && <div className="consent-options"><label><input type="checkbox" checked readOnly disabled /> Notwendig <small>Immer aktiv</small></label><label><input type="checkbox" checked={analytics} onChange={e => setAnalytics(e.target.checked)} /> Herkunftsanalyse (Kampagnen-/Herkunftsdaten)</label></div>}
    <a href="/datenschutz" className="text-link small">Mehr zum Datenschutz<Icon name="arrowUp" /></a>
    <div className="cookie-actions"><button className="button" onClick={() => save(true)}>Alle akzeptieren</button><button className="button button-outline" onClick={() => save(false)}>Alle ablehnen</button>{settings ? <button className="cookie-settings" onClick={() => save(analytics)}>Auswahl speichern</button> : <button className="cookie-settings" onClick={() => setSettings(true)}>Einstellungen</button>}</div>
  </aside>;
}
export function ConsentButton() { return <button className="footer-consent" onClick={() => window.dispatchEvent(new Event("fm-consent-open"))}>Datenschutz-Einstellungen</button>; }
