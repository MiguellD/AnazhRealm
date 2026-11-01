# z128-abab — ABAB 20d09a04 gegen e0f42f9d: LANGSAMER

GTX 1060, `--echt` 1920×1080, Regler voll, Messplatz-Dienst (zug/messplatz.md). A = e0f42f9ded85356026b589e9e434144f933a98f1, B = 20d09a043dcfba9257879da204d5aa73570a764b, Instrument aus B. Je Zelle 2+2, verlängert auf 4+4 nur bei Kern-Anschlag oder einer Größe zwischen 1σ und 2σ. Urteil je Größe Δ ≤ max(2σ gepoolt, Auflösung).

| Zelle | n A+B | Gang | Größe | A | B | Δ B − A | 2σ | Urteil |
|---|---|---|---|---|---|---|---|---|
| w-ego | 4+4 | steht | fps | 62.25 | 58.65 | -3.6 | 0.97 | LANGSAMER |
| w-ego | 4+4 | steht | Frame p95 ms | 16.8 | 21.05 | 4.25 | 6.45 | nicht langsamer (1σ–2σ) |
| w-ego | 4+4 | steht | CPU-Takt p95 ms | 5.83 | 5.55 | -0.28 | 1.17 | nicht langsamer |
| w-ego | 4+4 | steht | GPU je Bild ms (gpu-bank) | 15.18 | 16.16 | 0.98 | 0.3 | LANGSAMER |
| w-ego | 4+4 | steht | Belegung p95 ms | 8.66 | 8.74 | 0.08 | 1.53 | nicht langsamer |
| w-ego | 4+4 | geht | fps | 54.1 | 45.15 | -8.95 | 3.18 | LANGSAMER |
| w-ego | 4+4 | geht | Frame p95 ms | 27.2 | 33.3 | 6.1 | 5.66 | LANGSAMER |
| w-ego | 4+4 | geht | CPU-Takt p95 ms | 18.67 | 27.23 | 8.55 | 3.09 | LANGSAMER |
| w-ego | 4+4 | geht | Belegung p95 ms | 23.66 | 28.94 | 5.28 | 2.1 | LANGSAMER |
| w-ego | 4+4 | Zählung | steht Befehle | 43 | 43 | 0 | – | – |
| w-ego | 4+4 | Zählung | steht Dreiecke p95 | 299003 | 315224 | 16220 | – | – |
| w-ego | 4+4 | Zählung | steht VRAM MB | 119.18 | 119.1 | -0.08 | – | – |
| w-ego | 4+4 | Zählung | geht Befehle | 58.5 | 59 | 0.5 | – | – |
| w-ego | 4+4 | Zählung | geht Dreiecke p95 | 402379 | 414747 | 12368 | – | – |
| w-ego | 4+4 | Zählung | geht VRAM MB | 124.85 | 124.88 | 0.02 | – | – |
| **w-ego** | 4+4 | | **Urteil** | | | | | **LANGSAMER** |
| stadt | 4+4 | steht | fps | 66.22 | 65.35 | -0.88 | 1.2 | nicht langsamer |
| stadt | 4+4 | steht | Frame p95 ms | 25 | 25.02 | 0.02 | 0.07 | nicht langsamer |
| stadt | 4+4 | steht | CPU-Takt p95 ms | 11.03 | 11.43 | 0.4 | 0.72 | nicht langsamer (1σ–2σ) |
| stadt | 4+4 | steht | Belegung p95 ms | 18.02 | 18.53 | 0.51 | 1.16 | nicht langsamer |
| stadt | 4+4 | geht | fps | 34.85 | 30.6 | -4.25 | 2.86 | LANGSAMER |
| stadt | 4+4 | geht | Frame p95 ms | 52.1 | 54.23 | 2.13 | 8.92 | nicht langsamer |
| stadt | 4+4 | geht | CPU-Takt p95 ms | 45.07 | 49.53 | 4.45 | 5.56 | nicht langsamer (1σ–2σ) |
| stadt | 4+4 | geht | Belegung p95 ms | 51.91 | 55.57 | 3.66 | 7.3 | nicht langsamer |
| stadt | 4+4 | Zählung | steht Befehle | 63.5 | 64 | 0.5 | – | – |
| stadt | 4+4 | Zählung | steht Dreiecke p95 | 1301705 | 1304288 | 2583 | – | – |
| stadt | 4+4 | Zählung | steht VRAM MB | 193 | 193.63 | 0.63 | – | – |
| stadt | 4+4 | Zählung | geht Befehle | 94.25 | 93.25 | -1 | – | – |
| stadt | 4+4 | Zählung | geht Dreiecke p95 | 1459609 | 1450917 | -8692 | – | – |
| stadt | 4+4 | Zählung | geht VRAM MB | 194.3 | 199.4 | 5.1 | – | – |
| **stadt** | 4+4 | | **Urteil** | | | | | **LANGSAMER** |

Instrument je Boot: e0f42f9de (stadt-A1, stadt-A2, stadt-A3, stadt-A4, stadt-B1, stadt-B2, stadt-B3, stadt-B4, w-ego-A1, w-ego-A2, w-ego-A3, w-ego-A4, w-ego-B1, w-ego-B2, w-ego-B3, w-ego-B4)

Roh: `bericht/z128-abab/`.
