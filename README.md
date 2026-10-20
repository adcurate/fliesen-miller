# Fliesen Miller – Website-Vorschau

Statische, durchklickbare Vorschau der neuen Website mit Startseite, Leistungen, Referenzen, Über uns und den vier unterschiedlichen Einsatzgebieten.

Website-Link: **https://adcurate.github.io/fliesen-miller/**

## Vorschau starten

Node.js ab 22.13 installieren, danach:

```sh
npm ci
npm run dev
```

Die lokale Adresse ist `http://127.0.0.1:5173/fliesen-miller/`.

```sh
npm run build
npm run check
npm run preview
```

`dist/` enthält die vollständige statische Website. Jede Unterseite hat eine eigene HTML-Einstiegsdatei, sodass auch Direktlinks und Neuladen auf GitHub Pages funktionieren. Der Basis-Pfad ist in `vite.config.ts` festgelegt.

## Auf GitHub Pages veröffentlichen

Das Repository ist mit ausdrücklicher Freigabe öffentlich, und GitHub Pages verwendet **GitHub Actions** als Quelle. Änderungen an `main` veröffentlichen die Vorschau nach erfolgreichem Build und Prüfung automatisch. Bei Bedarf lässt sich der Workflow „Website-Vorschau auf GitHub Pages“ auch unter **Actions → Run workflow** starten.

Falls das Repository später wieder privat wird, überspringt der Workflow die Veröffentlichung. Der Build wird weiterhin geprüft.

## Umfang

Das Formular lässt sich bis zum letzten Schritt ansehen. **Der Versand ist deaktiviert**; Eingaben und Dateien werden nicht an einen Server übertragen. Die Vorschau enthält keine Anfrageverwaltung, Datenbank, Anmeldedaten oder Server-API. Die bestehende Website und ihre Anfrageverwaltung werden dadurch nicht geändert.

Telefon- und E-Mail-Links öffnen auf Wunsch die jeweilige Anwendung. Die Standortkarte wird erst auf Klick eingebunden. Bilder, Logos, Schriften und Video liegen lokal im Repository. Hinweise zu den übernommenen öffentlichen Medien stehen in `content/asset-sources.json` und `content/provider-logo-sources.json`.

Diese Vorschau ist mit `noindex` gekennzeichnet; das ist kein Zugriffsschutz. Bei einer Veröffentlichung sind die Website und der Quellcode öffentlich abrufbar. Die Inhalte bleiben Eigentum ihrer jeweiligen Rechteinhaber; es wird keine allgemeine Nutzungslizenz eingeräumt.

## Seitenadressen und SEO

Die 17 Seiten stehen zentral in `content/seo-pages.json`. Jede URL liefert vollständig gerendertes HTML mit eigenem Titel, Beschreibung, Canonical und Social-Media-Metadaten. Die vier regionalen URLs bleiben unverändert. Abschnittsanker bleiben als Sprungmarken erhalten. Die Sitemap enthält die 14 für die Suche vorgesehenen Seiten.

Die GitHub-Demo bleibt bis zum endgültigen Start auf `noindex`. Für den Produktionsstart:

1. `SITE_URL` auf die öffentlich erreichbare Hauptadresse setzen, beispielsweise `https://fliesen-miller.de`.
2. `SEO_INDEXING_ENABLED=true` setzen und neu bauen. Dadurch werden die Inhaltsseiten und `robots.txt` für Suchmaschinen freigegeben.
3. Beim Hosting unter der Domainwurzel den Vite-Basispfad auf `/` ändern; beim GitHub-Projektlink bleibt er `/fliesen-miller/`.
4. Die HTTP-Antworten, Canonicals, Sitemap und `robots.txt` auf der Hauptdomain prüfen. Geänderte alte URLs serverseitig mit 301 auf die passenden neuen Seiten weiterleiten.
5. Die Sitemap in Google Search Console einreichen. Google entscheidet über Indexierung und Rankings.

Die geschützte Sites-Version muss für eine Indexierung ebenfalls öffentlich erreichbar sein. Der Formularversand ist in dieser statischen GitHub-Demo weiterhin deaktiviert.
