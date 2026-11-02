# z156-abab — ABAB 6d6a8336 gegen ab884210: nicht-langsamer

GTX 1060, `--echt` 1920×1080, Regler voll, Messplatz-Dienst (zug/messplatz.md). A = ab884210027d810411fe8e16f57192bb336d2af8, B = 6d6a8336a11149456ca4edcab3c9c550a6b11f01, Instrument aus B. Je Zelle 2+2, verlängert auf 4+4 nur bei Kern-Anschlag oder einer Größe zwischen 1σ und 2σ. Urteil je Größe Δ ≤ max(2σ gepoolt, Auflösung).

| Zelle | n A+B | Gang | Größe | A | B | Δ B − A | 2σ | Urteil |
|---|---|---|---|---|---|---|---|---|
| w-ego | 2+2 | steht | fps | 57.5 | 58.1 | 0.6 | 0.4 | nicht langsamer |
| w-ego | 2+2 | steht | Frame p95 ms | 25.05 | 25 | -0.05 | 0.1 | nicht langsamer |
| w-ego | 2+2 | steht | CPU-Takt p95 ms | 6.95 | 6.9 | -0.05 | 0.61 | nicht langsamer |
| w-ego | 2+2 | steht | GPU je Bild ms (gpu-bank) | 16.38 | 16.27 | -0.11 | 0.31 | nicht langsamer |
| w-ego | 2+2 | steht | Belegung p95 ms | 11.75 | 11.53 | -0.22 | 1.01 | nicht langsamer |
| w-ego | 2+2 | geht | fps | 50.25 | 50.6 | 0.35 | 1.04 | nicht langsamer |
| w-ego | 2+2 | geht | Frame p95 ms | 29.45 | 29.3 | -0.15 | 11.1 | nicht langsamer |
| w-ego | 2+2 | geht | CPU-Takt p95 ms | 21.75 | 20.8 | -0.95 | 0.3 | nicht langsamer |
| w-ego | 2+2 | geht | Belegung p95 ms | 26.31 | 25.78 | -0.53 | 0.84 | nicht langsamer |
| w-ego | 2+2 | Zählung | steht Befehle | 43 | 43 | 0 | – | – |
| w-ego | 2+2 | Zählung | steht Dreiecke p95 | 316853 | 316756 | -97.5 | – | – |
| w-ego | 2+2 | Zählung | steht VRAM MB | 121.75 | 121.7 | -0.05 | – | – |
| w-ego | 2+2 | Zählung | geht Befehle | 59 | 59 | 0 | – | – |
| w-ego | 2+2 | Zählung | geht Dreiecke p95 | 416941 | 416950 | 9.5 | – | – |
| w-ego | 2+2 | Zählung | geht VRAM MB | 127.35 | 127.45 | 0.1 | – | – |
| **w-ego** | 2+2 | | **Urteil** | | | | | **nicht-langsamer** |
| stadt | 4+4 | steht | fps | 68.95 | 67.85 | -1.1 | 1.4 | nicht langsamer |
| stadt | 4+4 | steht | Frame p95 ms | 19.02 | 22.92 | 3.9 | 7.87 | nicht langsamer |
| stadt | 4+4 | steht | CPU-Takt p95 ms | 10.07 | 10.5 | 0.43 | 1.04 | nicht langsamer |
| stadt | 4+4 | steht | Belegung p95 ms | 15.58 | 16.2 | 0.62 | 1.52 | nicht langsamer |
| stadt | 4+4 | geht | fps | 35.67 | 35.2 | -0.47 | 2.76 | nicht langsamer |
| stadt | 4+4 | geht | Frame p95 ms | 49.95 | 49.95 | 0 | 0.16 | nicht langsamer |
| stadt | 4+4 | geht | CPU-Takt p95 ms | 42.7 | 43.37 | 0.67 | 2.91 | nicht langsamer |
| stadt | 4+4 | geht | Belegung p95 ms | 47.61 | 48.39 | 0.78 | 3.76 | nicht langsamer |
| stadt | 4+4 | Zählung | steht Befehle | 62.75 | 63 | 0.25 | – | – |
| stadt | 4+4 | Zählung | steht Dreiecke p95 | 1280535 | 1281950 | 1416 | – | – |
| stadt | 4+4 | Zählung | steht VRAM MB | 190.22 | 192.03 | 1.8 | – | – |
| stadt | 4+4 | Zählung | geht Befehle | 96.25 | 96.75 | 0.5 | – | – |
| stadt | 4+4 | Zählung | geht Dreiecke p95 | 1433788 | 1436650 | 2863 | – | – |
| stadt | 4+4 | Zählung | geht VRAM MB | 209.5 | 194.6 | -14.9 | – | – |
| **stadt** | 4+4 | | **Urteil** | | | | | **nicht-langsamer** |

Instrument je Boot: ab8842100 (stadt-A1, stadt-A2, stadt-A3, stadt-A4, stadt-B1, stadt-B2, stadt-B3, stadt-B4, w-ego-A1, w-ego-A2, w-ego-B1, w-ego-B2)

Roh: `bericht/z156-abab/`.
