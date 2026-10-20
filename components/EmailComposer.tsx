"use client";

import { useEffect, useId, useRef, useState } from "react";
import { site } from "@/lib/site";
import { Icon } from "./Icons";

const recipient = encodeURIComponent(site.email);
const providers = [
  { name: "Gmail", logo: "gmail", href: `https://mail.google.com/mail/?view=cm&fs=1&to=${recipient}` },
  { name: "Outlook / Hotmail", logo: "outlook", href: `https://outlook.live.com/mail/0/deeplink/compose?to=${recipient}` },
  { name: "Microsoft 365", logo: "microsoft-365", href: `https://outlook.office.com/mail/deeplink/compose?to=${recipient}` },
  { name: "Yahoo Mail", logo: "yahoo", href: `https://compose.mail.yahoo.com/?to=${recipient}` },
];

export function EmailComposer() {
  const [open, setOpen] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    if (!open) return;
    const panel = dialog.current;
    const previousOverflow = document.body.style.overflow;
    panel?.showModal();
    document.body.style.overflow = "hidden";
    return () => {
      panel?.close();
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  return <>
    <button type="button" className="contact-card" aria-label={`E-Mail: ${site.email}`} aria-haspopup="dialog" onClick={() => setOpen(true)}>
      <Icon name="mail" /><span>{site.email}</span>
    </button>
    <dialog ref={dialog} className="email-dialog" aria-labelledby={titleId} onCancel={() => setOpen(false)} onClose={() => setOpen(false)} onClick={event => { if (event.target === event.currentTarget) setOpen(false); }}>
      <div className="email-dialog-content">
        <button type="button" className="email-dialog-close" aria-label="E-Mail-Auswahl schließen" onClick={() => setOpen(false)}><span aria-hidden="true">×</span></button>
        <h2 id={titleId}>E-Mail schreiben</h2>
        <p>An {site.email}</p>
        <nav className="email-providers" aria-label="E-Mail-Anbieter auswählen">
          {providers.map(provider => <a key={provider.name} href={provider.href} target="_blank" rel="noopener noreferrer" onClick={() => setOpen(false)}><span className="email-provider-label"><img className="email-provider-logo" src={`/media/providers/${provider.logo}.svg`} alt="" width="28" height="28" />{provider.name}</span><Icon name="arrowUp" /></a>)}
          <a href={`mailto:${site.email}`} onClick={() => setOpen(false)}><span className="email-provider-label"><Icon name="mail" className="email-provider-logo" />Standard-Mail-App</span><Icon name="arrowUp" /></a>
        </nav>
      </div>
    </dialog>
  </>;
}
