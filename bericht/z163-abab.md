# z163-abab — ABAB c5a9a2f5 gegen 10770eb5: nicht-langsamer

GTX 1060, `--echt` 1920×1080, Regler voll, Messplatz-Dienst (zug/messplatz.md). A = 10770eb5698e05aef55914ee1b08907fb4b285a6, B = c5a9a2f565f517a92cbf8ada22cebe9c4df5023d, Instrument aus B. Je Zelle 2+2, verlängert auf 4+4 nur bei Kern-Anschlag oder einer Größe zwischen 1σ und 2σ. Urteil je Größe Δ ≤ max(2σ gepoolt, Auflösung).

| Zelle | n A+B | Gang | Größe | A | B | Δ B − A | 2σ | Urteil |
|---|---|---|---|---|---|---|---|---|
| w-ego | 4+4 | steht | fps | 58.43 | 58.42 | 0 | 1.7 | nicht langsamer |
| w-ego | 4+4 | steht | Frame p95 ms | 22.92 | 20.98 | -1.95 | 8.69 | nicht langsamer |
| w-ego | 4+4 | steht | CPU-Takt p95 ms | 7.58 | 7.25 | -0.33 | 1.01 | nicht langsamer |
| w-ego | 4+4 | steht | GPU je Bild ms (gpu-bank) | 16.15 | 16.07 | -0.08 | 0.69 | nicht langsamer |
| w-ego | 4+4 | steht | Belegung p95 ms | 13.07 | 12.13 | -0.94 | 1.72 | nicht langsamer |
| w-ego | 4+4 | geht | fps | 49.5 | 49.2 | -0.3 | 0.86 | nicht langsamer |
| w-ego | 4+4 | geht | Frame p95 ms | 33.3 | 31.35 | -1.95 | 5.52 | nicht langsamer |
| w-ego | 4+4 | geht | CPU-Takt p95 ms | 21.8 | 22.2 | 0.4 | 1.18 | nicht langsamer |
| w-ego | 4+4 | geht | Belegung p95 ms | 26.62 | 26.85 | 0.23 | 0.56 | nicht langsamer |
| w-ego | 4+4 | Zählung | steht Befehle | 44 | 44 | 0 | – | – |
| w-ego | 4+4 | Zählung | steht Dreiecke p95 | 316941 | 310147 | -6794 | – | – |
| w-ego | 4+4 | Zählung | steht VRAM MB | 121.55 | 119.75 | -1.8 | – | – |
| w-ego | 4+4 | Zählung | geht Befehle | 60 | 60 | 0 | – | – |
| w-ego | 4+4 | Zählung | geht Dreiecke p95 | 416984 | 410061 | -6923 | – | – |
| w-ego | 4+4 | Zählung | geht VRAM MB | 127.67 | 125.5 | -2.17 | – | – |
| **w-ego** | 4+4 | | **Urteil** | | | | | **nicht-langsamer** |
| stadt | 4+4 | steht | fps | 66.1 | 65.15 | -0.95 | 1.63 | nicht langsamer |
| stadt | 4+4 | steht | Frame p95 ms | 25.05 | 25.08 | 0.03 | 0.11 | nicht langsamer |
| stadt | 4+4 | steht | CPU-Takt p95 ms | 10.78 | 11.47 | 0.7 | 1.19 | nicht langsamer (1σ–2σ) |
| stadt | 4+4 | steht | Belegung p95 ms | 17.67 | 18.52 | 0.85 | 1.36 | nicht langsamer |
| stadt | 4+4 | geht | fps | 26.82 | 32.7 | 5.88 | 1.23 | nicht langsamer |
| stadt | 4+4 | geht | Frame p95 ms | 56.25 | 54.2 | -2.05 | 8.8 | nicht langsamer |
| stadt | 4+4 | geht | CPU-Takt p95 ms | 49.2 | 48.65 | -0.55 | 2.03 | nicht langsamer |
| stadt | 4+4 | geht | Belegung p95 ms | 54.26 | 54.18 | -0.08 | 3.01 | nicht langsamer |
| stadt | 4+4 | Zählung | steht Befehle | 63.5 | 64.75 | 1.25 | – | – |
| stadt | 4+4 | Zählung | steht Dreiecke p95 | 1292653 | 1294013 | 1361 | – | – |
| stadt | 4+4 | Zählung | steht VRAM MB | 190.05 | 189.67 | -0.38 | – | – |
| stadt | 4+4 | Zählung | geht Befehle | 86.5 | 95.25 | 8.75 | – | – |
| stadt | 4+4 | Zählung | geht Dreiecke p95 | 1350519 | 1380166 | 29646 | – | – |
| stadt | 4+4 | Zählung | geht VRAM MB | 200.7 | 209.68 | 8.98 | – | – |
| **stadt** | 4+4 | | **Urteil** | | | | | **nicht-langsamer** |

Instrument je Boot: 10770eb56 (stadt-A1, stadt-A2, stadt-A3, stadt-A4, stadt-B1, stadt-B2, stadt-B3, stadt-B4, w-ego-A1, w-ego-A2, w-ego-A3, w-ego-A4, w-ego-B1, w-ego-B2, w-ego-B3, w-ego-B4)

Roh: `bericht/z163-abab/`.
