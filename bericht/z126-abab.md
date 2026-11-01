# z126-abab — ABAB e0f42f9d gegen 9e40c93c: nicht-langsamer

GTX 1060, `--echt` 1920×1080, Regler voll, Messplatz-Dienst (zug/messplatz.md). A = 9e40c93c35c13e0c3ca6bf23542256a8b3aba94e, B = e0f42f9ded85356026b589e9e434144f933a98f1, Instrument aus B. Je Zelle 2+2, verlängert auf 4+4 nur bei Kern-Anschlag oder einer Größe zwischen 1σ und 2σ. Urteil je Größe Δ ≤ max(2σ gepoolt, Auflösung).

| Zelle | n A+B | Gang | Größe | A | B | Δ B − A | 2σ | Urteil |
|---|---|---|---|---|---|---|---|---|
| w-ego | 4+4 | steht | fps | 49.23 | 62.55 | 13.32 | 0.69 | nicht langsamer |
| w-ego | 4+4 | steht | Frame p95 ms | 25.13 | 16.82 | -8.3 | 0.1 | nicht langsamer |
| w-ego | 4+4 | steht | CPU-Takt p95 ms | 5.35 | 5.75 | 0.4 | 0.73 | nicht langsamer (1σ–2σ) |
| w-ego | 4+4 | steht | GPU je Bild ms (gpu-bank) | 19.52 | 15.18 | -4.34 | 0.23 | nicht langsamer |
| w-ego | 4+4 | steht | Belegung p95 ms | 9.18 | 8.65 | -0.53 | 0.9 | nicht langsamer |
| w-ego | 4+4 | geht | fps | 44.83 | 53.12 | 8.3 | 1.2 | nicht langsamer |
| w-ego | 4+4 | geht | Frame p95 ms | 33.4 | 29.3 | -4.1 | 6.53 | nicht langsamer |
| w-ego | 4+4 | geht | CPU-Takt p95 ms | 18.7 | 19.6 | 0.9 | 1.17 | nicht langsamer (1σ–2σ) |
| w-ego | 4+4 | geht | Belegung p95 ms | 26.61 | 24.13 | -2.48 | 0.68 | nicht langsamer |
| w-ego | 4+4 | Zählung | steht Befehle | 43 | 43 | 0 | – | – |
| w-ego | 4+4 | Zählung | steht Dreiecke p95 | 298245 | 300594 | 2349 | – | – |
| w-ego | 4+4 | Zählung | steht VRAM MB | 119.15 | 119.22 | 0.08 | – | – |
| w-ego | 4+4 | Zählung | geht Befehle | 59.25 | 58.5 | -0.75 | – | – |
| w-ego | 4+4 | Zählung | geht Dreiecke p95 | 404622 | 401991 | -2630 | – | – |
| w-ego | 4+4 | Zählung | geht VRAM MB | 124.95 | 125.07 | 0.12 | – | – |
| **w-ego** | 4+4 | | **Urteil** | | | | | **nicht-langsamer** |
| stadt | 2+2 | steht | fps | 58.45 | 66.1 | 7.65 | 0.36 | nicht langsamer |
| stadt | 2+2 | steht | Frame p95 ms | 25 | 25 | 0 | 0 | nicht langsamer |
| stadt | 2+2 | steht | CPU-Takt p95 ms | 11.15 | 11.05 | -0.1 | 0.51 | nicht langsamer |
| stadt | 2+2 | steht | Belegung p95 ms | 18.03 | 18.16 | 0.13 | 0.86 | nicht langsamer |
| stadt | 2+2 | geht | fps | 35.45 | 35.95 | 0.5 | 1.14 | nicht langsamer |
| stadt | 2+2 | geht | Frame p95 ms | 50 | 50 | 0 | 0 | nicht langsamer |
| stadt | 2+2 | geht | CPU-Takt p95 ms | 43.15 | 42.8 | -0.35 | 2.18 | nicht langsamer |
| stadt | 2+2 | geht | Belegung p95 ms | 48.38 | 50.08 | 1.7 | 3.59 | nicht langsamer |
| stadt | 2+2 | Zählung | steht Befehle | 64 | 63.5 | -0.5 | – | – |
| stadt | 2+2 | Zählung | steht Dreiecke p95 | 1315214 | 1302853 | -12360 | – | – |
| stadt | 2+2 | Zählung | steht VRAM MB | 194 | 194.2 | 0.2 | – | – |
| stadt | 2+2 | Zählung | geht Befehle | 92.5 | 93.5 | 1 | – | – |
| stadt | 2+2 | Zählung | geht Dreiecke p95 | 1439835 | 1452889 | 13055 | – | – |
| stadt | 2+2 | Zählung | geht VRAM MB | 194.35 | 213 | 18.65 | – | – |
| **stadt** | 2+2 | | **Urteil** | | | | | **nicht-langsamer** |

Instrument je Boot: 9e40c93c3 (stadt-A1, stadt-A2, stadt-B1, stadt-B2, w-ego-A1, w-ego-A2, w-ego-A3, w-ego-A4, w-ego-B1, w-ego-B2, w-ego-B3, w-ego-B4)

Roh: `bericht/z126-abab/`.
