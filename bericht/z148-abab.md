# z148-abab — ABAB ab884210 gegen 28dd7a47: nicht-langsamer

GTX 1060, `--echt` 1920×1080, Regler voll, Messplatz-Dienst (zug/messplatz.md). A = 28dd7a472451a64540c2fe70c8c58548ff37788c, B = ab884210027d810411fe8e16f57192bb336d2af8, Instrument aus B. Je Zelle 2+2, verlängert auf 4+4 nur bei Kern-Anschlag oder einer Größe zwischen 1σ und 2σ. Urteil je Größe Δ ≤ max(2σ gepoolt, Auflösung).

| Zelle | n A+B | Gang | Größe | A | B | Δ B − A | 2σ | Urteil |
|---|---|---|---|---|---|---|---|---|
| w-ego | 4+4 | steht | fps | 58.43 | 58.1 | -0.33 | 0.51 | nicht langsamer |
| w-ego | 4+4 | steht | Frame p95 ms | 24.98 | 25 | 0.02 | 0.07 | nicht langsamer |
| w-ego | 4+4 | steht | CPU-Takt p95 ms | 6.78 | 7.2 | 0.42 | 0.73 | nicht langsamer (1σ–2σ) |
| w-ego | 4+4 | steht | GPU je Bild ms (gpu-bank) | 16.02 | 16.12 | 0.1 | 0.28 | nicht langsamer |
| w-ego | 4+4 | steht | Belegung p95 ms | 10.99 | 11.56 | 0.56 | 1.24 | nicht langsamer |
| w-ego | 4+4 | geht | fps | 50.65 | 50.68 | 0.03 | 1.26 | nicht langsamer |
| w-ego | 4+4 | geht | Frame p95 ms | 31.27 | 33.3 | 2.02 | 5.73 | nicht langsamer |
| w-ego | 4+4 | geht | CPU-Takt p95 ms | 21.18 | 21 | -0.18 | 1.98 | nicht langsamer |
| w-ego | 4+4 | geht | Belegung p95 ms | 25.91 | 25.75 | -0.16 | 1.04 | nicht langsamer |
| w-ego | 4+4 | Zählung | steht Befehle | 43 | 43 | 0 | – | – |
| w-ego | 4+4 | Zählung | steht Dreiecke p95 | 312149 | 314404 | 2255 | – | – |
| w-ego | 4+4 | Zählung | steht VRAM MB | 120.5 | 121.03 | 0.53 | – | – |
| w-ego | 4+4 | Zählung | geht Befehle | 59 | 59 | 0 | – | – |
| w-ego | 4+4 | Zählung | geht Dreiecke p95 | 412039 | 413010 | 971.25 | – | – |
| w-ego | 4+4 | Zählung | geht VRAM MB | 126.13 | 126.8 | 0.67 | – | – |
| **w-ego** | 4+4 | | **Urteil** | | | | | **nicht-langsamer** |
| stadt | 2+2 | steht | fps | 67.35 | 67.9 | 0.55 | 1.36 | nicht langsamer |
| stadt | 2+2 | steht | Frame p95 ms | 24.95 | 24.95 | 0 | 0.14 | nicht langsamer |
| stadt | 2+2 | steht | CPU-Takt p95 ms | 10.45 | 10.25 | -0.2 | 0.91 | nicht langsamer |
| stadt | 2+2 | steht | Belegung p95 ms | 16.24 | 16.15 | -0.09 | 1.49 | nicht langsamer |
| stadt | 2+2 | geht | fps | 32.75 | 36 | 3.25 | 1.97 | nicht langsamer |
| stadt | 2+2 | geht | Frame p95 ms | 54.2 | 49.95 | -4.25 | 8.2 | nicht langsamer |
| stadt | 2+2 | geht | CPU-Takt p95 ms | 47.25 | 42.45 | -4.8 | 1.5 | nicht langsamer |
| stadt | 2+2 | geht | Belegung p95 ms | 54.48 | 46.65 | -7.83 | 1.8 | nicht langsamer |
| stadt | 2+2 | Zählung | steht Befehle | 63.5 | 62.5 | -1 | – | – |
| stadt | 2+2 | Zählung | steht Dreiecke p95 | 1283970 | 1279934 | -4036 | – | – |
| stadt | 2+2 | Zählung | steht VRAM MB | 194.8 | 193.35 | -1.45 | – | – |
| stadt | 2+2 | Zählung | geht Befehle | 97 | 96.5 | -0.5 | – | – |
| stadt | 2+2 | Zählung | geht Dreiecke p95 | 1435345 | 1434736 | -609.5 | – | – |
| stadt | 2+2 | Zählung | geht VRAM MB | 230.7 | 213.15 | -17.55 | – | – |
| **stadt** | 2+2 | | **Urteil** | | | | | **nicht-langsamer** |

Instrument je Boot: 28dd7a472 (stadt-A1, stadt-A2, stadt-B1, stadt-B2, w-ego-A1, w-ego-A2, w-ego-A3, w-ego-A4, w-ego-B1, w-ego-B2, w-ego-B3, w-ego-B4)

Roh: `bericht/z148-abab/`.
