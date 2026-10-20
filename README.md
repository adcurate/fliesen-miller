# Fliesen Miller – Website-Vorschau

Statische, durchklickbare Vorschau der neuen Website mit Startseite, Leistungen, Referenzen, Über uns und den vier unterschiedlichen Einsatzgebieten.

Geplanter Website-Link: **https://adcurate.github.io/fliesen-miller/**

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

Der aktuell verwendete GitHub-Tarif unterstützt Pages für dieses private Repository nicht. Das Repository muss dafür nach ausdrücklicher Freigabe öffentlich werden oder der GitHub-Tarif muss private Pages unterstützen. Anschließend unter **Settings → Pages → Build and deployment → Source: GitHub Actions** wählen und den Workflow „Website-Vorschau auf GitHub Pages“ starten. Künftige Änderungen an `main` veröffentlichen die Vorschau automatisch.

Der Workflow prüft auch im privaten Repository den Build; die Veröffentlichung wird dort übersprungen.

## Umfang

Das Formular lässt sich bis zum letzten Schritt ansehen. **Der Versand ist deaktiviert**; Eingaben und Dateien werden nicht an einen Server übertragen. Die Vorschau enthält keine Anfrageverwaltung, Datenbank, Anmeldedaten oder Server-API. Die bestehende Website und ihre Anfrageverwaltung werden dadurch nicht geändert.

Telefon- und E-Mail-Links öffnen auf Wunsch die jeweilige Anwendung. Die Standortkarte wird erst auf Klick eingebunden. Bilder, Logos, Schriften und Video liegen lokal im Repository. Hinweise zu den übernommenen öffentlichen Medien stehen in `content/asset-sources.json` und `content/provider-logo-sources.json`.

Diese Vorschau ist mit `noindex` gekennzeichnet; das ist kein Zugriffsschutz. Bei einer Veröffentlichung sind die Website und der Quellcode öffentlich abrufbar. Die Inhalte bleiben Eigentum ihrer jeweiligen Rechteinhaber; es wird keine allgemeine Nutzungslizenz eingeräumt.
