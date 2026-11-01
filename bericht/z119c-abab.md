# z119c-abab — ABAB 4b13478b gegen c351b318: LANGSAMER

GTX 1060, `--echt` 1920×1080, Regler voll, Messplatz-Dienst (zug/messplatz.md). A = c351b31853a3c5439a73e62238f7d90e421c4050, B = 4b13478b5ca245925c8a2ca4fe700b33d4e72959, Instrument aus B. Je Zelle 2+2, verlängert auf 4+4 nur bei Kern-Anschlag oder einer Größe zwischen 1σ und 2σ. Urteil je Größe Δ ≤ max(2σ gepoolt, Auflösung).

| Zelle | n A+B | Gang | Größe | A | B | Δ B − A | 2σ | Urteil |
|---|---|---|---|---|---|---|---|---|
| w-ego | 4+4 | steht | fps | 49.2 | 48.65 | -0.55 | 1.76 | nicht langsamer |
| w-ego | 4+4 | steht | Frame p95 ms | 25.13 | 25.1 | -0.02 | 0.07 | nicht langsamer |
| w-ego | 4+4 | steht | CPU-Takt p95 ms | 5.25 | 5.88 | 0.63 | 0.99 | nicht langsamer (1σ–2σ) |
| w-ego | 4+4 | steht | GPU je Bild ms (gpu-bank) | 19.57 | 19.8 | 0.24 | 0.86 | nicht langsamer |
| w-ego | 4+4 | steht | Belegung p95 ms | 9.5 | 9.98 | 0.48 | 1.38 | nicht langsamer |
| w-ego | 4+4 | geht | fps | 44.45 | 43.95 | -0.5 | 1.37 | nicht langsamer |
| w-ego | 4+4 | geht | Frame p95 ms | 33.38 | 33.4 | 0.02 | 0.07 | nicht langsamer |
| w-ego | 4+4 | geht | CPU-Takt p95 ms | 17.95 | 19.27 | 1.32 | 1.6 | nicht langsamer (1σ–2σ) |
| w-ego | 4+4 | geht | Belegung p95 ms | 26.82 | 27.25 | 0.43 | 1.26 | nicht langsamer |
| w-ego | 4+4 | Zählung | steht Befehle | 43 | 43 | 0 | – | – |
| w-ego | 4+4 | Zählung | steht Dreiecke p95 | 301674 | 301684 | 10 | – | – |
| w-ego | 4+4 | Zählung | steht VRAM MB | 119.1 | 119.03 | -0.07 | – | – |
| w-ego | 4+4 | Zählung | geht Befehle | 59.25 | 59 | -0.25 | – | – |
| w-ego | 4+4 | Zählung | geht Dreiecke p95 | 407554 | 405504 | -2050 | – | – |
| w-ego | 4+4 | Zählung | geht VRAM MB | 126.67 | 126.68 | 0 | – | – |
| **w-ego** | 4+4 | | **Urteil** | | | | | **nicht-langsamer** |
| stadt | 4+4 | steht | fps | 58.8 | 58.4 | -0.4 | 0.5 | nicht langsamer |
| stadt | 4+4 | steht | Frame p95 ms | 25 | 25.05 | 0.05 | 0.14 | nicht langsamer |
| stadt | 4+4 | steht | CPU-Takt p95 ms | 9.88 | 10.95 | 1.07 | 0.76 | LANGSAMER |
| stadt | 4+4 | steht | Belegung p95 ms | 16.48 | 18.08 | 1.59 | 1.32 | LANGSAMER |
| stadt | 4+4 | geht | fps | 35.55 | 33.95 | -1.6 | 1.83 | nicht langsamer |
| stadt | 4+4 | geht | Frame p95 ms | 50.05 | 52.13 | 2.08 | 11.07 | nicht langsamer |
| stadt | 4+4 | geht | CPU-Takt p95 ms | 44.22 | 45.57 | 1.35 | 4.72 | nicht langsamer |
| stadt | 4+4 | geht | Belegung p95 ms | 50.8 | 52.86 | 2.06 | 7.26 | nicht langsamer |
| stadt | 4+4 | Zählung | steht Befehle | 64 | 64 | 0 | – | – |
| stadt | 4+4 | Zählung | steht Dreiecke p95 | 1297308 | 1308947 | 11639 | – | – |
| stadt | 4+4 | Zählung | steht VRAM MB | 188.88 | 195.73 | 6.85 | – | – |
| stadt | 4+4 | Zählung | geht Befehle | 93.5 | 94 | 0.5 | – | – |
| stadt | 4+4 | Zählung | geht Dreiecke p95 | 1446860 | 1457713 | 10853 | – | – |
| stadt | 4+4 | Zählung | geht VRAM MB | 209.3 | 205.4 | -3.9 | – | – |
| **stadt** | 4+4 | | **Urteil** | | | | | **LANGSAMER** |

Instrument je Boot: c351b3185 (stadt-A1, stadt-A2, stadt-A3, stadt-A4, stadt-B1, stadt-B2, stadt-B3, stadt-B4, w-ego-A1, w-ego-A2, w-ego-A3, w-ego-A4, w-ego-B1, w-ego-B2, w-ego-B3, w-ego-B4)

Roh: `bericht/z119c-abab/`.
