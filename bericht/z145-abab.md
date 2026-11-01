# z145-abab — ABAB 28dd7a47 gegen baf9d828: nicht-langsamer

GTX 1060, `--echt` 1920×1080, Regler voll, Messplatz-Dienst (zug/messplatz.md). A = baf9d8280b0aa08441b436e9f93f6e17b221a7cc, B = 28dd7a472451a64540c2fe70c8c58548ff37788c, Instrument aus B. Je Zelle 2+2, verlängert auf 4+4 nur bei Kern-Anschlag oder einer Größe zwischen 1σ und 2σ. Urteil je Größe Δ ≤ max(2σ gepoolt, Auflösung).

| Zelle | n A+B | Gang | Größe | A | B | Δ B − A | 2σ | Urteil |
|---|---|---|---|---|---|---|---|---|
| w-ego | 4+4 | steht | fps | 58.62 | 58.35 | -0.27 | 1.53 | nicht langsamer |
| w-ego | 4+4 | steht | Frame p95 ms | 20.98 | 22.98 | 2 | 8.72 | nicht langsamer |
| w-ego | 4+4 | steht | CPU-Takt p95 ms | 7.43 | 7 | -0.43 | 1.19 | nicht langsamer |
| w-ego | 4+4 | steht | GPU je Bild ms (gpu-bank) | 15.93 | 16.02 | 0.09 | 0.39 | nicht langsamer |
| w-ego | 4+4 | steht | Belegung p95 ms | 12.05 | 11.57 | -0.48 | 2.01 | nicht langsamer |
| w-ego | 4+4 | geht | fps | 49.45 | 50.15 | 0.7 | 1.49 | nicht langsamer |
| w-ego | 4+4 | geht | Frame p95 ms | 33.3 | 32.13 | -1.17 | 3.32 | nicht langsamer |
| w-ego | 4+4 | geht | CPU-Takt p95 ms | 22.15 | 21.43 | -0.72 | 2.21 | nicht langsamer |
| w-ego | 4+4 | geht | Belegung p95 ms | 26.82 | 26.26 | -0.56 | 1.38 | nicht langsamer |
| w-ego | 4+4 | Zählung | steht Befehle | 43 | 43 | 0 | – | – |
| w-ego | 4+4 | Zählung | steht Dreiecke p95 | 312869 | 315202 | 2333 | – | – |
| w-ego | 4+4 | Zählung | steht VRAM MB | 120.48 | 121.17 | 0.7 | – | – |
| w-ego | 4+4 | Zählung | geht Befehle | 59 | 59 | 0 | – | – |
| w-ego | 4+4 | Zählung | geht Dreiecke p95 | 411171 | 414208 | 3036 | – | – |
| w-ego | 4+4 | Zählung | geht VRAM MB | 126.22 | 126.88 | 0.65 | – | – |
| **w-ego** | 4+4 | | **Urteil** | | | | | **nicht-langsamer** |
| stadt | 2+2 | steht | fps | 66.5 | 66.2 | -0.3 | 1.26 | nicht langsamer |
| stadt | 2+2 | steht | Frame p95 ms | 24.95 | 25 | 0.05 | 0.1 | nicht langsamer |
| stadt | 2+2 | steht | CPU-Takt p95 ms | 11.5 | 11.1 | -0.4 | 0.57 | nicht langsamer |
| stadt | 2+2 | steht | Belegung p95 ms | 17.9 | 17.55 | -0.35 | 1 | nicht langsamer |
| stadt | 2+2 | geht | fps | 32 | 33.25 | 1.25 | 1.12 | nicht langsamer |
| stadt | 2+2 | geht | Frame p95 ms | 58.35 | 50.05 | -8.3 | 0.14 | nicht langsamer |
| stadt | 2+2 | geht | CPU-Takt p95 ms | 51.6 | 45.1 | -6.5 | 3.22 | nicht langsamer |
| stadt | 2+2 | geht | Belegung p95 ms | 58.73 | 50.3 | -8.43 | 5.21 | nicht langsamer |
| stadt | 2+2 | Zählung | steht Befehle | 62 | 63 | 1 | – | – |
| stadt | 2+2 | Zählung | steht Dreiecke p95 | 1261705 | 1273341 | 11636 | – | – |
| stadt | 2+2 | Zählung | steht VRAM MB | 189.7 | 191 | 1.3 | – | – |
| stadt | 2+2 | Zählung | geht Befehle | 96.5 | 96.5 | 0 | – | – |
| stadt | 2+2 | Zählung | geht Dreiecke p95 | 1436781 | 1438800 | 2019 | – | – |
| stadt | 2+2 | Zählung | geht VRAM MB | 194.7 | 209.45 | 14.75 | – | – |
| **stadt** | 2+2 | | **Urteil** | | | | | **nicht-langsamer** |

Instrument je Boot: baf9d8280 (stadt-A1, stadt-A2, stadt-B1, stadt-B2, w-ego-A1, w-ego-A2, w-ego-A3, w-ego-A4, w-ego-B1, w-ego-B2, w-ego-B3, w-ego-B4)

Roh: `bericht/z145-abab/`.
