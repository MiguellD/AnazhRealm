# z110-abab — ABAB 90878cc6 gegen c5ee9059: nicht-langsamer

GTX 1060, `--echt` 1920×1080, Regler voll, Messplatz-Dienst (zug/messplatz.md). A = c5ee90599f8011050efd4bc687dd1b956b3dc877, B = 90878cc61494378c8994488059a3578ed2bdef80, Instrument aus B. Je Zelle 2+2, verlängert auf 4+4 nur bei Kern-Anschlag oder einer Größe zwischen 1σ und 2σ. Urteil je Größe Δ ≤ max(2σ gepoolt, Auflösung).

| Zelle | n A+B | Gang | Größe | A | B | Δ B − A | 2σ | Urteil |
|---|---|---|---|---|---|---|---|---|
| w-ego | 4+4 | steht | fps | 65.5 | 66 | 0.5 | 1.64 | nicht langsamer |
| w-ego | 4+4 | steht | Frame p95 ms | 16.8 | 16.8 | 0 | 0 | nicht langsamer |
| w-ego | 4+4 | steht | CPU-Takt p95 ms | 6.05 | 6.02 | -0.03 | 0.25 | nicht langsamer |
| w-ego | 4+4 | steht | GPU je Bild ms (gpu-bank) | 14.75 | 14.57 | -0.18 | 0.45 | nicht langsamer |
| w-ego | 4+4 | steht | Belegung p95 ms | 9.01 | 9.05 | 0.05 | 0.47 | nicht langsamer |
| w-ego | 4+4 | geht | fps | 54.15 | 53.7 | -0.45 | 1.02 | nicht langsamer |
| w-ego | 4+4 | geht | Frame p95 ms | 27.18 | 25.25 | -1.92 | 5.69 | nicht langsamer |
| w-ego | 4+4 | geht | CPU-Takt p95 ms | 19.73 | 20.15 | 0.42 | 0.94 | nicht langsamer |
| w-ego | 4+4 | geht | Belegung p95 ms | 23.78 | 24.24 | 0.46 | 0.92 | nicht langsamer |
| w-ego | 4+4 | Zählung | steht Befehle | 41 | 41 | 0 | – | – |
| w-ego | 4+4 | Zählung | steht Dreiecke p95 | 261967 | 261847 | -119.5 | – | – |
| w-ego | 4+4 | Zählung | steht VRAM MB | 117.65 | 117.65 | 0 | – | – |
| w-ego | 4+4 | Zählung | geht Befehle | 58 | 58 | 0 | – | – |
| w-ego | 4+4 | Zählung | geht Dreiecke p95 | 387320 | 386905 | -414.25 | – | – |
| w-ego | 4+4 | Zählung | geht VRAM MB | 122.22 | 122.25 | 0.03 | – | – |
| **w-ego** | 4+4 | | **Urteil** | | | | | **nicht-langsamer** |
| stadt | 4+4 | steht | fps | 65.3 | 64.82 | -0.48 | 1.09 | nicht langsamer |
| stadt | 4+4 | steht | Frame p95 ms | 25 | 25 | 0 | 0 | nicht langsamer |
| stadt | 4+4 | steht | CPU-Takt p95 ms | 11.7 | 12.1 | 0.4 | 0.43 | nicht langsamer (1σ–2σ) |
| stadt | 4+4 | steht | Belegung p95 ms | 19.06 | 19.26 | 0.2 | 0.81 | nicht langsamer |
| stadt | 4+4 | geht | fps | 31.6 | 32 | 0.4 | 3.51 | nicht langsamer |
| stadt | 4+4 | geht | Frame p95 ms | 62.5 | 58.35 | -4.15 | 11.79 | nicht langsamer |
| stadt | 4+4 | geht | CPU-Takt p95 ms | 53.13 | 52.28 | -0.85 | 5.76 | nicht langsamer |
| stadt | 4+4 | geht | Belegung p95 ms | 62.06 | 58.72 | -3.34 | 8.92 | nicht langsamer |
| stadt | 4+4 | Zählung | steht Befehle | 61.75 | 62.5 | 0.75 | – | – |
| stadt | 4+4 | Zählung | steht Dreiecke p95 | 1290840 | 1294153 | 3313 | – | – |
| stadt | 4+4 | Zählung | steht VRAM MB | 189.13 | 188.23 | -0.9 | – | – |
| stadt | 4+4 | Zählung | geht Befehle | 89 | 91.5 | 2.5 | – | – |
| stadt | 4+4 | Zählung | geht Dreiecke p95 | 1407897 | 1437391 | 29493 | – | – |
| stadt | 4+4 | Zählung | geht VRAM MB | 221.07 | 218.15 | -2.93 | – | – |
| **stadt** | 4+4 | | **Urteil** | | | | | **nicht-langsamer** |

Instrument je Boot: c5ee90599 (stadt-A1, stadt-A2, stadt-A3, stadt-A4, stadt-B1, stadt-B2, stadt-B3, stadt-B4, w-ego-A1, w-ego-A2, w-ego-A3, w-ego-A4, w-ego-B1, w-ego-B2, w-ego-B3, w-ego-B4)

Roh: `bericht/z110-abab/`.
