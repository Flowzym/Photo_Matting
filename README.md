# CV-Photo Studio (MVP)

Offline-fähige Web-App zur Bearbeitung von Lebenslauffotos: Upload, Zuschneiden (inkl. rund), Freistellen (U²-Net), Hintergrund (Farbe/Verlauf/Muster), Export.

## Quickstart (Bolt / lokal)

```bash
npm install
npm run sync:ort   # kopiert onnxruntime-web Bundles nach public/ort
npm run dev
```

Falls die ORT-Dateien in `public/ort/` fehlen, schlägt die Inferenz fehl. Die Sync-Task legt die 6 Dateien an.

## Modelle

- `public/models/u2netp.onnx` (✓)  
- `public/models/modnet.onnx` (✓)

> Wenn diese Dateien Platzhalter sind, bitte durch echte Modelle (typ. ~5–7 MB) ersetzen.

## Wichtige Pfade

- **ORT Bundles:** `public/ort/*` (wird via `npm run sync:ort` befüllt)
- **Service Worker:** `public/sw.js` (Precache gängiger Assets)
- **COOP/COEP:** in `vite.config.ts` gesetzt; bei fehlender Isolation fällt ORT auf 1 Thread zurück.

## Features (MVP)

- Upload: PNG/JPG/WebP, EXIF-Korrektur, Downscale auf max 2048px
- Cropper: Presets 1:1, 3:4, 4:3, 2:3, frei; Rund-Preview
- Freistellen: U²-Net (u2netp.onnx, 320×320), Worker-basiert
- Hintergrund: Farbe, Verlauf, Muster (CSS-basiert)
- Export: PNG (transparent) / JPG (Qualität 0.9), Größen: original/1024/2048
- Diagnostics: ORT-File-Check (HEAD), COI-Anzeige

## Lizenzhinweise

- onnxruntime-web unter MS-Lizenz – Bundles werden aus `node_modules` nach `public/ort` kopiert (vendored).
