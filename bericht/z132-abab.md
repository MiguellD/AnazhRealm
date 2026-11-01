# z132-abab — ABAB 25ac4c0c gegen 20d09a04: nicht-langsamer

GTX 1060, `--echt` 1920×1080, Regler voll, Messplatz-Dienst (zug/messplatz.md). A = 20d09a043dcfba9257879da204d5aa73570a764b, B = 25ac4c0c485570ed887cffb7f175d430264f86bf, Instrument aus B. Je Zelle 2+2, verlängert auf 4+4 nur bei Kern-Anschlag oder einer Größe zwischen 1σ und 2σ. Urteil je Größe Δ ≤ max(2σ gepoolt, Auflösung).

| Zelle | n A+B | Gang | Größe | A | B | Δ B − A | 2σ | Urteil |
|---|---|---|---|---|---|---|---|---|
| w-ego | 4+4 | steht | fps | 58.92 | 58 | -0.92 | 1.43 | nicht langsamer |
| w-ego | 4+4 | steht | Frame p95 ms | 20.95 | 24.98 | 4.02 | 6.53 | nicht langsamer (1σ–2σ) |
| w-ego | 4+4 | steht | CPU-Takt p95 ms | 6.17 | 6.03 | -0.15 | 1.02 | nicht langsamer |
| w-ego | 4+4 | steht | GPU je Bild ms (gpu-bank) | 16.37 | 16.54 | 0.17 | 0.55 | nicht langsamer |
| w-ego | 4+4 | steht | Belegung p95 ms | 9.39 | 9.42 | 0.04 | 1.15 | nicht langsamer |
| w-ego | 4+4 | geht | fps | 45.1 | 42.73 | -2.38 | 4.14 | nicht langsamer |
| w-ego | 4+4 | geht | Frame p95 ms | 33.32 | 33.38 | 0.05 | 0.1 | nicht langsamer (1σ–2σ) |
| w-ego | 4+4 | geht | CPU-Takt p95 ms | 27.18 | 29.05 | 1.88 | 4.06 | nicht langsamer |
| w-ego | 4+4 | geht | Belegung p95 ms | 28.88 | 30.34 | 1.45 | 3.09 | nicht langsamer |
| w-ego | 4+4 | Zählung | steht Befehle | 43 | 43 | 0 | – | – |
| w-ego | 4+4 | Zählung | steht Dreiecke p95 | 318215 | 314509 | -3706 | – | – |
| w-ego | 4+4 | Zählung | steht VRAM MB | 119.7 | 120.47 | 0.78 | – | – |
| w-ego | 4+4 | Zählung | geht Befehle | 59 | 59 | 0 | – | – |
| w-ego | 4+4 | Zählung | geht Dreiecke p95 | 416130 | 413695 | -2435 | – | – |
| w-ego | 4+4 | Zählung | geht VRAM MB | 125.63 | 126.25 | 0.63 | – | – |
| **w-ego** | 4+4 | | **Urteil** | | | | | **nicht-langsamer** |
| stadt | 4+4 | steht | fps | 64.85 | 64.38 | -0.47 | 4.38 | nicht langsamer |
| stadt | 4+4 | steht | Frame p95 ms | 25 | 25.05 | 0.05 | 0.08 | nicht langsamer (1σ–2σ) |
| stadt | 4+4 | steht | CPU-Takt p95 ms | 11.93 | 11.82 | -0.1 | 2.83 | nicht langsamer |
| stadt | 4+4 | steht | Belegung p95 ms | 18.85 | 18.41 | -0.43 | 2.51 | nicht langsamer |
| stadt | 4+4 | geht | fps | 29.98 | 28.2 | -1.78 | 5.13 | nicht langsamer |
| stadt | 4+4 | geht | Frame p95 ms | 60.35 | 62.52 | 2.17 | 9.01 | nicht langsamer |
| stadt | 4+4 | geht | CPU-Takt p95 ms | 50.77 | 55.5 | 4.73 | 7.88 | nicht langsamer (1σ–2σ) |
| stadt | 4+4 | geht | Belegung p95 ms | 57.25 | 62.49 | 5.24 | 7.09 | nicht langsamer |
| stadt | 4+4 | Zählung | steht Befehle | 63.5 | 62.75 | -0.75 | – | – |
| stadt | 4+4 | Zählung | steht Dreiecke p95 | 1302840 | 1275543 | -27297 | – | – |
| stadt | 4+4 | Zählung | steht VRAM MB | 195.52 | 189.9 | -5.63 | – | – |
| stadt | 4+4 | Zählung | geht Befehle | 93.5 | 97 | 3.5 | – | – |
| stadt | 4+4 | Zählung | geht Dreiecke p95 | 1450021 | 1432794 | -17228 | – | – |
| stadt | 4+4 | Zählung | geht VRAM MB | 200.77 | 215.43 | 14.65 | – | – |
| **stadt** | 4+4 | | **Urteil** | | | | | **nicht-langsamer** |

Instrument je Boot: 20d09a043 (stadt-A1, stadt-A2, stadt-A3, stadt-A4, stadt-B1, stadt-B2, stadt-B3, stadt-B4, w-ego-A1, w-ego-A2, w-ego-A3, w-ego-A4, w-ego-B1, w-ego-B2, w-ego-B3, w-ego-B4)

Roh: `bericht/z132-abab/`.
