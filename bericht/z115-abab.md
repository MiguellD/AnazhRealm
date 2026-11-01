# z115-abab — ABAB b895650c gegen 808464ca: nicht-langsamer

GTX 1060, `--echt` 1920×1080, Regler voll, Messplatz-Dienst (zug/messplatz.md). A = 808464cab1d7998c1378ff2de415a2288db87053, B = b895650c7dc2e303a3299ed17b04c6350d002437, Instrument aus B. Je Zelle 2+2, verlängert auf 4+4 nur bei Kern-Anschlag oder einer Größe zwischen 1σ und 2σ. Urteil je Größe Δ ≤ max(2σ gepoolt, Auflösung).

| Zelle | n A+B | Gang | Größe | A | B | Δ B − A | 2σ | Urteil |
|---|---|---|---|---|---|---|---|---|
| w-ego | 4+4 | steht | fps | 48.18 | 47.9 | -0.28 | 1.24 | nicht langsamer |
| w-ego | 4+4 | steht | Frame p95 ms | 25.1 | 25.1 | 0 | 0 | nicht langsamer |
| w-ego | 4+4 | steht | CPU-Takt p95 ms | 6.2 | 6.33 | 0.13 | 0.44 | nicht langsamer |
| w-ego | 4+4 | steht | GPU je Bild ms (gpu-bank) | 19.95 | 20.09 | 0.14 | 0.49 | nicht langsamer |
| w-ego | 4+4 | steht | Belegung p95 ms | 11.32 | 11.43 | 0.11 | 0.96 | nicht langsamer |
| w-ego | 4+4 | geht | fps | 42.83 | 42.7 | -0.13 | 0.6 | nicht langsamer |
| w-ego | 4+4 | geht | Frame p95 ms | 33.4 | 33.4 | 0 | 0 | nicht langsamer |
| w-ego | 4+4 | geht | CPU-Takt p95 ms | 21.27 | 21.73 | 0.45 | 1.38 | nicht langsamer |
| w-ego | 4+4 | geht | Belegung p95 ms | 29.39 | 29.28 | -0.11 | 0.7 | nicht langsamer |
| w-ego | 4+4 | Zählung | steht Befehle | 43 | 43 | 0 | – | – |
| w-ego | 4+4 | Zählung | steht Dreiecke p95 | 300695 | 301633 | 938.5 | – | – |
| w-ego | 4+4 | Zählung | steht VRAM MB | 119.03 | 119.12 | 0.1 | – | – |
| w-ego | 4+4 | Zählung | geht Befehle | 59 | 59 | 0 | – | – |
| w-ego | 4+4 | Zählung | geht Dreiecke p95 | 405934 | 406131 | 197.25 | – | – |
| w-ego | 4+4 | Zählung | geht VRAM MB | 127.15 | 127.15 | 0 | – | – |
| **w-ego** | 4+4 | | **Urteil** | | | | | **nicht-langsamer** |
| stadt | 4+4 | steht | fps | 56.8 | 56.5 | -0.3 | 0.98 | nicht langsamer |
| stadt | 4+4 | steht | Frame p95 ms | 25.1 | 25.1 | 0 | 0 | nicht langsamer |
| stadt | 4+4 | steht | CPU-Takt p95 ms | 11.8 | 12.1 | 0.3 | 1.39 | nicht langsamer |
| stadt | 4+4 | steht | Belegung p95 ms | 19.48 | 20.15 | 0.66 | 1.54 | nicht langsamer |
| stadt | 4+4 | geht | fps | 29.85 | 29.32 | -0.53 | 4.97 | nicht langsamer |
| stadt | 4+4 | geht | Frame p95 ms | 62.53 | 62.53 | 0 | 9.64 | nicht langsamer |
| stadt | 4+4 | geht | CPU-Takt p95 ms | 54.33 | 57.03 | 2.7 | 9.46 | nicht langsamer |
| stadt | 4+4 | geht | Belegung p95 ms | 62.49 | 64.82 | 2.33 | 9.11 | nicht langsamer |
| stadt | 4+4 | Zählung | steht Befehle | 64.5 | 64 | -0.5 | – | – |
| stadt | 4+4 | Zählung | steht Dreiecke p95 | 1294456 | 1301917 | 7462 | – | – |
| stadt | 4+4 | Zählung | steht VRAM MB | 192.2 | 192.65 | 0.45 | – | – |
| stadt | 4+4 | Zählung | geht Befehle | 94.75 | 95.25 | 0.5 | – | – |
| stadt | 4+4 | Zählung | geht Dreiecke p95 | 1454200 | 1456451 | 2251 | – | – |
| stadt | 4+4 | Zählung | geht VRAM MB | 235.52 | 227.05 | -8.47 | – | – |
| **stadt** | 4+4 | | **Urteil** | | | | | **nicht-langsamer** |

Instrument je Boot: 808464cab (stadt-A1, stadt-A2, stadt-A3, stadt-A4, stadt-B1, stadt-B2, stadt-B3, stadt-B4, w-ego-A1, w-ego-A2, w-ego-A3, w-ego-A4, w-ego-B1, w-ego-B2, w-ego-B3, w-ego-B4)

Roh: `bericht/z115-abab/`.
