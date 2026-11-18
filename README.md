# Fliesen Miller

Vollständige Neugestaltung der öffentlichen Website in der ursprünglichen Farbwelt. Responsive, serverseitig gerendert, mit lokal gebündelten Bildern und Schriften. Anfragen werden direkt per E-Mail über one.com versendet; die Website speichert keine Kundendaten.

## Starten

Node.js ab 22.13 und npm werden benötigt.

```sh
npm ci
npm run dev
```

Die lokale Vorschau läuft auf `http://127.0.0.1:5173/`. Für den lokalen E-Mail-Versand `.dev.vars.example` nach `.dev.vars` kopieren und die SMTP-Zugangsdaten eines one.com-Postfachs eintragen.

## Seiten

- `/` – Leistungen, Premium-Video, Referenzen, Über uns, Arbeitsweise, vollständiger Anfrage-Funnel, 14 FAQ, Einsatzgebiete und Kontakt.
- `/leistungen` – alle acht Leistungsbereiche mit Einsatzbereichen, Nutzen und regionalen Informationen.
- `/reparatur`, `/ueber-uns` – sämtliche bisherigen Fach- und Unternehmensinformationen.
- `/fliesenleger-cloppenburg`, `/fliesenleger-vechta`, `/fliesenleger-bremen`, `/fliesenleger-osnabrueck` – eigenständige regionale Seiten mit den jeweiligen Originaltexten, Bildpositionen, Leistungslisten, Werten, fünf Ablaufschritten und regionalen Verknüpfungen. Die Leistungslisten haben keine Bilder und sind linksbündig; Listenpunkte tragen grüne Haken.
- `/referenzen`, `/kontakt`, `/anfrage` – zusätzliche direkte Ziele für Galerie, Kontakt und Funnel.
- `/impressum`, `/datenschutz`, `/agb` – vollständige Rechtsseiten. Die technischen Dienstleister in der Datenschutzerklärung sind an die neue Architektur angepasst. Der bereits auf der Originalseite vorhandene vorläufige AGB-Hinweis bleibt erhalten.
- Unbekannte URLs liefern eine eigene 404-Seite mit HTTP-Status 404.

Alle bisherigen Footer-Ziele und Startseitenanker bleiben erreichbar. Der Footer öffnet die Datenschutzauswahl erneut. Instagram wird über einen externen Link geöffnet. Die Google-Maps-Karte auf „Über uns“ wird erst nach einem ausdrücklichen Klick geladen und lässt sich wieder schließen. Die E-Mail-Auswahl öffnet vorbereitete Verfassen-Links; die Anbieterlogos werden lokal geladen.

## Anfrageformular und E-Mail

`POST /api/inquiries` nimmt das mehrstufige Formular als `multipart/form-data` entgegen. Der Funnel umfasst sechs Schritte, bei mehreren Bereichen sieben. Name und eine gültige Telefonnummer und/oder E-Mail-Adresse sind erforderlich. Bilder und PDF-Dateien sind optional (maximal sechs Dateien, 10 MB je Datei, insgesamt 30 MB).

Die serverseitige Prüfung kontrolliert Auswahlwerte, Kontaktdaten, Dateigrößen und tatsächliche Dateisignaturen. Fremde Origins, Honeypot-Eingaben und übermäßige Übertragungsfrequenz werden zurückgewiesen. Anfragedaten und Dateien werden nicht in einer Kundendatenbank gespeichert.

Nach dem Absenden werden die Formularangaben direkt an `info@fliesen-miller.de` geschickt. Ausgewählte Dateien sind echte E-Mail-Anhänge, nicht bloß Dateinamen oder Links.

Der Cloudflare Worker sendet die Nachricht über `send.one.com` mit STARTTLS auf Port 587. `SMTP_USERNAME` und `SMTP_PASSWORD` sind ein aktives one.com-Postfach; die Absenderadresse muss diesem Postfach entsprechen. `INQUIRY_EMAIL_TO` ist standardmäßig `info@fliesen-miller.de`. Die bestehende Mailbox und ihr Empfang bleiben bei one.com.

Die E-Mail nutzt die dunkle Farbwelt, den grünen Akzent und das Website-Logo. Nur der Anfragecontainer ist dunkel; der äußere E-Mail-Hintergrund bleibt weiß. Antworten gehen an die vom Interessenten angegebene E-Mail-Adresse. one.com erlaubt E-Mails bis 70 MB; der Funnel begrenzt die Rohdateien auf insgesamt 30 MB. Die empfangende Mailbox muss die Nachricht ebenfalls annehmen können.

## Tests

```sh
npm run typecheck
npm test
npm run check:links
npm run build
```

`check:links` prüft öffentliche Routen, interne Verknüpfungen und Anker, Leistungsüberschriften, einzelne H1-Überschriften und 404-Status.

Die Browserprüfung umfasst die öffentlichen Seiten bei tatsächlichen CSS-Breiten von 320, 768, 1024 und 1440 Pixeln sowie Menü, Galeriefilter, Bilddialog, Consent-Reopener und den Sieben-Schritte-Zweig bis vor das Absenden.

## Quellen und Veröffentlichung

`content/source.json` dokumentiert den öffentlich sichtbaren Originalinhalt. `content/asset-sources.json` enthält Medienquellen und geprüfte Bildbeschreibungen. Die 14 Galeriebilder und das Originalvideo stammen aus der bisherigen Website. Instagram lieferte ohne Anmeldung keine öffentlich abrufbaren Beitragsbilder.

`content/region-original-audit.json` hält den erneuten Abgleich aller vier Original-Ortsseiten fest. Deren zugehörige Originalbilder liegen lokal in `public/media/regions/`. Der regionale Renderer erhält auch verschachtelte Ortsverlinkungen und übernimmt die unterschiedlichen Inhalte je Stadt. Der eigene Funnel bleibt derselbe wie auf der Startseite.

Die Website und ihr Anfrage-Endpunkt laufen als Cloudflare Worker. Vor dem ersten Deployment `SMTP_USERNAME`, `SMTP_PASSWORD`, `INQUIRY_EMAIL_TO`, `INQUIRY_EMAIL_FROM`, `SITE_URL` und `SEO_INDEXING_ENABLED` in den Worker-Einstellungen setzen; das Mailbox-Passwort als Geheimnis hinterlegen. Danach mit `npm run deploy` veröffentlichen. Es ist kein Supabase-Projekt erforderlich.

Die neue Site wird zunächst privat bereitgestellt. `robots.txt` und Metadaten verhindern die Indexierung der privaten Neufassung. Die Originaldomain wird durch dieses Projekt nicht verändert.

Die Hauptdomain wird nach erfolgreichem Worker-Deployment in Cloudflare am Worker unter **Settings → Domains & Routes → Add → Custom Domain** verbunden. Die one.com-Mailbox bleibt unverändert. Vor Domain- oder Nameserveränderungen bestehende MX-, SPF- und DKIM-Einträge sichern, damit der E-Mail-Empfang bei one.com nicht unterbrochen wird. Für den Start bleibt `SEO_INDEXING_ENABLED=false`; erst nach Prüfung der öffentlichen Domain wird `SITE_URL=https://fliesen-miller.de` gesetzt und die Indexierung aktiviert.

## Seitenadressen und SEO

`content/seo-pages.json` definiert 17 öffentliche Inhaltsseiten mit eindeutigen Titeln und Beschreibungen. Premium, Referenzen, Kontakt, Anfrage, FAQ und die Einsatzgebietsübersicht haben direkte URLs. Die vier regionalen Adressen bleiben erhalten. Abschnittsanker dienen weiterhin als Sprungmarken innerhalb einer Seite. Canonicals und Social-Media-URLs werden zentral über `lib/seo.ts` erzeugt; die Sitemap enthält 14 für die Suche vorgesehene Seiten und keine rechtlichen Seiten.

Für den endgültigen Start `SITE_URL` auf die öffentlich erreichbare Hauptdomain setzen, beispielsweise `https://fliesen-miller.de`, und `SEO_INDEXING_ENABLED=true` aktivieren. Zusätzlich muss die Site ohne Anmeldeschranke erreichbar sein. Danach Canonicals, HTTP-Status, `robots.txt` und Sitemap auf dieser Domain prüfen und die Sitemap in Google Search Console einreichen. Geänderte alte URLs benötigen beim Domainumzug passende serverseitige 301-Weiterleitungen. Die geschützte Vorschau bleibt bis dahin auf `noindex`.

`npm run check:seo` prüft sämtliche 17 Seiten, Titel, Beschreibungen, Canonicals, Social-URLs, Sitemap, Robots-Regeln und den 404-Status. Für einen lokalen Server kann `TEST_ORIGIN` gesetzt werden. Der Prüfer verwendet dieselben `SITE_URL`- und `SEO_INDEXING_ENABLED`-Einstellungen wie der Server.

Alle 17 Inhaltsseiten liefern außerdem einen serverseitigen JSON-LD-Graphen mit demselben Betrieb in Cloppenburg, der Website und der jeweiligen Inhaltsseite. Kontakt und Über uns sind als `ContactPage` bzw. `AboutPage` ausgezeichnet. Die regionalen Seiten verweisen auf denselben Betrieb; es werden keine weiteren Niederlassungen oder Bewertungssterne behauptet. Bilder, Logo und URLs folgen der konfigurierten Hauptdomain. Fehlerseiten einschließlich unbekannter Unterpfade erhalten `noindex` und erben keine Canonical- oder Social-URLs der Startseite. Der SEO-Prüfer kontrolliert auch diese Beziehungen und die Bildressourcen.

## Galerie und Navigation

Die Arbeitsgalerie enthält 47 Fotos; die Logo-Collage ist entfernt. Vier gegenläufige Reihen rendern jeweils nur die sichtbaren Bilder mit zwei Reservebildern. Die Animation rotiert nach jedem Bildabstand, pausiert pro Reihe außerhalb des Viewports sowie bei einem ausgeblendeten Browser-Tab und berücksichtigt reduzierte Bewegung. Die vollständige statische Übersicht ersetzt die bewegten Reihen. 320-/640-Pixel-Vorschauen werden passend zum Display geladen, große Bilder erst im Bilddialog. Die öffentlichen Google-Quellen bleiben separat in `content/google-work-photo-sources.json`; der Browser erhält nur die benötigten Bilddaten.

`InPageNavigation` erhält die echten Seitenlinks für Suchmaschinen, fängt aber normale Klicks innerhalb derselben Seite ab. Erneute Klicks auf eine Seitenadresse scrollen nach oben; Sprungmarken scrollen zum passenden Abschnitt. „Projekt anfragen“ nutzt einen bereits eingebetteten Funnel. Andere Seiten, neue Formularparameter, neue Tabs, Downloads und externe Links behalten ihre normale Navigation. Premium und Referenzen verwenden denselben Funnel wie die Startseite.

Die Google-Bewertungen werden lokal in Google-Farben dargestellt. Logo und G-Symbol stammen von Googles öffentlichem Markenserver; es wird kein externes Bewertungs-Widget oder Tracking-Skript geladen. Datenstand und Quellenlink bleiben sichtbar.
