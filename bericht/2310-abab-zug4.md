# Bericht 2310 ABAB Zug 4 452972a6 (gemessen als laufzeit-gleicher Baum 435f54f4) gegen main 3528f2d0: nicht langsamer — Hieb-Latenz gleich, Wiese Ego 4+4 gleich

GTX 1060, `--echt` 1920×1080, Regler voll.
- **A** = n2010-b2b (main 3528f2d0).
- **B** = n2010-b2a (435f54f4 = V18.546.72 = main + halten-gesetz a666a615).
- **452972a6 = 435f54f4 + CI-Zeiten:** nur `.github/workflows/check.yml` und `spec/ci/ci-zeiten.json` ändern sich, die Laufzeit ist byte-gleich. Die Zeile gilt darum für 452972a6.
- **Instrument:** die Werkbank aus B; beide Bäume sauber.
- **Ablauf:** Start nach dem echt-Lauf 39894056907 an 435f54f4 (05:32). Der echt-Lauf 39897642057 an 452972a6 hatte zwischen zwei Boots Vorfahrt (05:56–06:13).
- **Urteil je Größe:** Δ ≤ max(2σ gepoolt, Auflösung).

## Zellen

| Zelle | Größe | A | B | Urteil |
|---|---|---|---|---|
| Wiese Ego steht (4+4) | fps · Frame p95 · CPU-Takt p95 · Belegung p95 | 77,5 · 16,8 · 4,3 · 6,09 | 76,7 · 16,8 · 4,5 · 6,40 | gleich (2σ 1,0 · 0 · 0,4 · 0,53) |
| | gpu-bank · GPU-Durchsatz p50 | 12,99 (12,57 · 12,10 · 12,94 · 14,35) · 12,95 | 13,50 (13,07 · 14,14 · 14,16 · 12,64) · 13,10 | gleich (2σ 1,75 · 0,29) |
| | Befehle · Dreiecke p95 · VRAM | 38 · 291k · 108,5 | 38 · 292k · 108,4 | gleich |
| Wiese Ego geht (4+4) | fps · Frame p95 · CPU-Takt p95 · Belegung p95 | 61,6 · 25,1 · 18,1 · 21,6 | 61,3 · 25,1 · 18,5 · 22,0 | gleich (2σ 0,7 · 0,1 · 0,7 · 0,68) |
| | Befehle · Dreiecke p95 · VRAM | 53 · 394k · 112,4 | 53 · 395k · 112,1 | gleich |
| Genesis Third steht | Frame p95 · CPU-Takt p95 · gpu-bank · Belegung p95 | 16,8 · 6,0 · 11,46 · 7,87 | 16,8 · 5,7 · 11,46 · 7,35 | gleich |
| | Befehle · Dreiecke p95 · VRAM | 78 · 356,9k · 113,8 | 78 · 356,9k · 113,8 | gleich |
| Hieb-Latenz (Wiese Ego, `latenz --verb hieb --proben 30`) | p50 · p95 · max ms | 11,1 / 6,6 · 39,2 / 19,9 · 62,4 / 25,2 | 10,7 / 10,3 · 32,1 / 31,0 · 47,2 / 35,5 | gleich |
| | Hit-Stop je Boot (Bilder) | 1 / 9 | 9 / 1 | gleich |

- **Wiese Ego:**
  - Nach 2+2 schlugen fps (−0,7) und gpu-bank (+1,27) an. Darum lief die Zelle auf 4+4.
  - Die gpu-bank ist an beiden Seiten bimodal: die erste Bank nach dem Einschwingen, A4 14,35, B2/B3 14,1. Damit sind beide Größen gleich.
  - CPU-Takt p95 und Belegung p95 liegen bei B an allen 4 Paaren um +0,3–0,4 ms höher, gehend wie stehend. Das bleibt innerhalb von 2σ, ein Term ist nicht trennbar.
  - halten-gesetz ändert nur `stamm/kampf.js` (+ `koerper-fahrt.js` 6 Zeilen), kein Render-Byte.
- **Hieb:**
  - Die Latenz-Linse urteilt ROT an A1 und B2: je ein Hit-Stop von nur 1 Bild, an beiden Seiten gleich oft.
  - Das Maximum 62,4 ms > 50 fällt an A1, nicht an B.
  - Eine Zelle mit Treffer am Ziel (Hit-Stop aus Masse × Schneide × Tempo) kennt die Werkbank nicht. Gemessen ist die Latenz bis zur ersten Regung samt der Hit-Stop-Zahl der Linse.

## Urteil
**nicht langsamer.**

Zeile in `zug/abab.txt`: `452972a618d58ba02c65c633b31588fcbda60d9e nicht-langsamer 2310-abab-zug4`.

Roh: `bericht/2310-abab-zug4/`
- `gehen/`: je Boot `*-steht.txt`, `*-geht-1.txt`, `*-bank.txt`; dazu `auswertung-gehen-<zelle>.md|json`.
- `hieb/`: je Boot `*-latenz.json` mit allen 30 Proben, `*-steht.txt`.
- `serie.sh`, `warte-echt.sh`, `fortschritt.log`.
- OMEN `p3/n2210/zug4/`.

**Status ZWISCHENSTAND + Übergabe:**
- Zug 4 gemessen, die Zeile steht; landen per `zug.sh landen` liegt beim Koordinator.
- Als Nächstes die Messschuld GTX M39 und M37 am gelandeten Kopf, Bericht `bericht/2310-messschuld-gtx-3528.md`.
- M42 entfällt mit Namen: `diag-tier-gang` misst den Schlupf am CPU-Skelett (`_tierBaum`), die Satz-Tiere gehen über gebackene Phasen-Bänder im GPU-Puffer (`_tierSatzGang`); die Linse müsste das Band-Gesetz nachrechnen. Kein schneller Zusatz.
