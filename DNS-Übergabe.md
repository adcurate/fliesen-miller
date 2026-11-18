# DNS-Übergabe für fliesen-miller.de

Diese Übersicht gilt für die Website auf Cloudflare Workers und das weiterhin bei one.com gehostete E-Mail-Postfach. Stand der öffentlichen DNS-Abfrage: 18.11.2026.

## Aktuell veröffentlichte Mail-Einträge

Die Domain verwendet derzeit `ns01.one.com` und `ns02.one.com`. Vor einer Änderung die vollständige DNS-Zone im one.com Control Panel sichern; öffentliche Abfragen zeigen nicht zwingend alle vorhandenen Einträge.

Folgende E-Mail-Einträge sind derzeit öffentlich sichtbar und müssen in der neuen DNS-Zone erhalten bleiben:

| Typ | Name | Wert | Priorität |
| --- | --- | --- | --- |
| MX | `@` | `mx1.mailpod16-cph3.g1i.one.com` | 10 |
| MX | `@` | `mx2.mailpod16-cph3.g1i.one.com` | 10 |
| MX | `@` | `mx3.mailpod16-cph3.g1i.one.com` | 10 |
| MX | `@` | `mx4.mailpod16-cph3.g1i.one.com` | 10 |
| TXT | `@` | `v=spf1 include:_custspf.one.com ~all` | – |
| TXT | `_dmarc` | `v=DMARC1; p=reject` | – |

Für DKIM benötigt one.com bei externen Nameservern zwei domainbezogene CNAME-Einträge. Die exakten Namen und Ziele sind öffentlich nicht sichtbar. one.com Support muss sie für `fliesen-miller.de` bereitstellen. Nicht raten oder Werte einer anderen Domain verwenden.

## Wechsel zu Cloudflare

1. In Cloudflare eine aktive DNS-Zone für `fliesen-miller.de` anlegen und die von Cloudflare angezeigten zwei Nameserver notieren.
2. In der Cloudflare-Zone alle bisherigen DNS-Einträge übernehmen. Besonders die obigen MX-, SPF- und DMARC-Einträge sowie die zwei DKIM-CNAME-Einträge von one.com erhalten. Mail-Einträge auf **DNS only** belassen.
3. Erst nach vollständiger Übernahme die Nameserver bei one.com auf genau die zwei von Cloudflare zugewiesenen Werte umstellen. Die bisherigen MX-Einträge nicht löschen oder durch einen generischen Mailserver ersetzen.
4. Sobald Cloudflare die Zone als aktiv meldet, den bereitgestellten Worker `fliesen-miller-website` mit `fliesen-miller.de` verbinden. Cloudflare erzeugt dabei den Website-DNS-Eintrag und das TLS-Zertifikat.
5. Nach DNS-Propagation prüfen: Website unter `https://fliesen-miller.de`, Empfang an `info@fliesen-miller.de`, SPF/DKIM/DMARC sowie Funnel-Testmail mit Kontaktangaben und Anhängen.

## Was vor dem DNS-Wechsel noch bereitgestellt werden muss

- Cloudflare-Zone im Adcurate-Konto und die von Cloudflare zugewiesenen Nameserver.
- Deployment des Workers sowie das Verknüpfen der Custom Domain.
- Die SMTP-Zugangsdaten des aktiven one.com-Postfachs als verschlüsseltes Cloudflare-Secret. Das Passwort nicht in GitHub oder in diese Datei eintragen.
- Zwei DKIM-CNAME-Werte von one.com Support.

Der Worker versendet Funnel-Anfragen direkt über one.com SMTP an `info@fliesen-miller.de`. Die Website speichert keine Anfragen in einer Kundendatenbank. Die bestehenden Website-DNS-Einträge aus dem one.com-Export müssen zusätzlich übernommen werden, soweit sie weiter gebraucht werden.

## Offizielle Hilfe

- [one.com: DKIM bei externen Nameservern](https://help.one.com/hc/en-us/articles/37404026110609-Can-I-use-DKIM-for-my-one-com-email-accounts)
- [one.com: DNS-Einstellungen verwalten](https://help.one.com/hc/en-us/articles/115005595925-Manage-your-DNS-settings)
- [Cloudflare: Custom Domains für Workers](https://developers.cloudflare.com/workers/configuration/routing/custom-domains/)

