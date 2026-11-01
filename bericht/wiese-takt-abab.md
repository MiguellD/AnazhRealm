# wiese-takt-abab — ABAB 0be0cbe6 gegen 25ac4c0c: nicht-langsamer

GTX 1060, `--echt` 1920×1080, Regler voll, Messplatz-Dienst (zug/messplatz.md). A = 25ac4c0c485570ed887cffb7f175d430264f86bf, B = 0be0cbe61cfe627673cda07e23990c01d1ccb9f2, Instrument aus B. Je Zelle 2+2, verlängert auf 4+4 nur bei Kern-Anschlag oder einer Größe zwischen 1σ und 2σ. Urteil je Größe Δ ≤ max(2σ gepoolt, Auflösung).

| Zelle | n A+B | Gang | Größe | A | B | Δ B − A | 2σ | Urteil |
|---|---|---|---|---|---|---|---|---|
| w-ego | 4+4 | steht | fps | 58.75 | 58.08 | -0.67 | 1.81 | nicht langsamer |
| w-ego | 4+4 | steht | Frame p95 ms | 20.98 | 22.98 | 2 | 8.72 | nicht langsamer |
| w-ego | 4+4 | steht | CPU-Takt p95 ms | 6.2 | 6.17 | -0.03 | 0.41 | nicht langsamer |
| w-ego | 4+4 | steht | GPU je Bild ms (gpu-bank) | 16.34 | 16.55 | 0.21 | 0.5 | nicht langsamer |
| w-ego | 4+4 | steht | Belegung p95 ms | 9.3 | 9.53 | 0.23 | 0.93 | nicht langsamer |
| w-ego | 4+4 | geht | fps | 44.43 | 47.8 | 3.37 | 3.24 | nicht langsamer |
| w-ego | 4+4 | geht | Frame p95 ms | 33.35 | 33.27 | -0.07 | 0.11 | nicht langsamer |
| w-ego | 4+4 | geht | CPU-Takt p95 ms | 27.92 | 23.93 | -4 | 3.53 | nicht langsamer |
| w-ego | 4+4 | geht | Belegung p95 ms | 29.71 | 27.31 | -2.4 | 2.32 | nicht langsamer |
| w-ego | 4+4 | Zählung | steht Befehle | 43 | 43 | 0 | – | – |
| w-ego | 4+4 | Zählung | steht Dreiecke p95 | 311908 | 314558 | 2650 | – | – |
| w-ego | 4+4 | Zählung | steht VRAM MB | 119.88 | 119.15 | -0.72 | – | – |
| w-ego | 4+4 | Zählung | geht Befehle | 59 | 59 | 0 | – | – |
| w-ego | 4+4 | Zählung | geht Dreiecke p95 | 409082 | 414004 | 4922 | – | – |
| w-ego | 4+4 | Zählung | geht VRAM MB | 125.9 | 124.8 | -1.1 | – | – |
| **w-ego** | 4+4 | | **Urteil** | | | | | **nicht-langsamer** |
| stadt | 4+4 | steht | fps | 64.53 | 63.7 | -0.83 | 2.2 | nicht langsamer |
| stadt | 4+4 | steht | Frame p95 ms | 25 | 25 | 0 | 0 | nicht langsamer |
| stadt | 4+4 | steht | CPU-Takt p95 ms | 11.45 | 11.88 | 0.43 | 0.69 | nicht langsamer (1σ–2σ) |
| stadt | 4+4 | steht | Belegung p95 ms | 18.2 | 18.45 | 0.25 | 0.73 | nicht langsamer |
| stadt | 4+4 | geht | fps | 27.85 | 28.47 | 0.62 | 2.2 | nicht langsamer |
| stadt | 4+4 | geht | Frame p95 ms | 62.5 | 62.52 | 0.02 | 9.5 | nicht langsamer |
| stadt | 4+4 | geht | CPU-Takt p95 ms | 55.35 | 56.48 | 1.13 | 6.6 | nicht langsamer |
| stadt | 4+4 | geht | Belegung p95 ms | 62.36 | 62.98 | 0.61 | 6.36 | nicht langsamer |
| stadt | 4+4 | Zählung | steht Befehle | 63 | 63 | 0 | – | – |
| stadt | 4+4 | Zählung | steht Dreiecke p95 | 1276440 | 1276275 | -165.25 | – | – |
| stadt | 4+4 | Zählung | steht VRAM MB | 193.68 | 192.25 | -1.43 | – | – |
| stadt | 4+4 | Zählung | geht Befehle | 97.5 | 97.25 | -0.25 | – | – |
| stadt | 4+4 | Zählung | geht Dreiecke p95 | 1437617 | 1440466 | 2850 | – | – |
| stadt | 4+4 | Zählung | geht VRAM MB | 203.13 | 209.15 | 6.03 | – | – |
| **stadt** | 4+4 | | **Urteil** | | | | | **nicht-langsamer** |

Instrument je Boot: 25ac4c0c4 (stadt-A1, stadt-A2, stadt-A3, stadt-A4, stadt-B1, stadt-B2, stadt-B3, stadt-B4, w-ego-A1, w-ego-A2, w-ego-A3, w-ego-A4, w-ego-B1, w-ego-B2, w-ego-B3, w-ego-B4)

Roh: `bericht/wiese-takt-abab/`.
