# z47z48-abab — ABAB cd34e72b gegen 42973786: nicht-langsamer

GTX 1060, `--echt` 1920×1080, Regler voll, Messplatz-Dienst (zug/messplatz.md). A = 429737862d4acc40e8d0e1b67215a8be997ff397, B = cd34e72b7180e1596ba105b70ccff93d7ed1d4e0, Instrument aus B. Je Zelle 2+2, verlängert auf 4+4 nur bei Kern-Anschlag oder einer Größe zwischen 1σ und 2σ. Urteil je Größe Δ ≤ max(2σ gepoolt, Auflösung).

| Zelle | n A+B | Gang | Größe | A | B | Δ B − A | 2σ | Urteil |
|---|---|---|---|---|---|---|---|---|
| w-ego | 2+2 | steht | fps | 76.85 | 77.6 | 0.75 | 1 | nicht langsamer |
| w-ego | 2+2 | steht | Frame p95 ms | 16.8 | 16.8 | 0 | 0 | nicht langsamer |
| w-ego | 2+2 | steht | CPU-Takt p95 ms | 3.9 | 3.85 | -0.05 | 0.22 | nicht langsamer |
| w-ego | 2+2 | steht | GPU je Bild ms (gpu-bank) | 12.46 | 12.28 | -0.18 | 0.28 | nicht langsamer |
| w-ego | 2+2 | steht | Belegung p95 ms | 5.67 | 5.54 | -0.12 | 0.21 | nicht langsamer |
| w-ego | 2+2 | geht | fps | 61.55 | 61.8 | 0.25 | 0.64 | nicht langsamer |
| w-ego | 2+2 | geht | Frame p95 ms | 25.1 | 25.1 | 0 | 0 | nicht langsamer |
| w-ego | 2+2 | geht | CPU-Takt p95 ms | 17.7 | 17.5 | -0.2 | 0.89 | nicht langsamer |
| w-ego | 2+2 | geht | Belegung p95 ms | 21.11 | 21.16 | 0.05 | 0.55 | nicht langsamer |
| w-ego | 2+2 | Zählung | steht Befehle | 39 | 39 | 0 | – | – |
| w-ego | 2+2 | Zählung | steht Dreiecke p95 | 264241 | 264243 | 2 | – | – |
| w-ego | 2+2 | Zählung | steht VRAM MB | 107.75 | 107.85 | 0.1 | – | – |
| w-ego | 2+2 | Zählung | geht Befehle | 56 | 56 | 0 | – | – |
| w-ego | 2+2 | Zählung | geht Dreiecke p95 | 377363 | 378411 | 1048 | – | – |
| w-ego | 2+2 | Zählung | geht VRAM MB | 111.55 | 111.75 | 0.2 | – | – |
| **w-ego** | 2+2 | | **Urteil** | | | | | **nicht-langsamer** |
| d-ego | 4+4 | steht | fps | 73.93 | 75.08 | 1.15 | 3.05 | nicht langsamer |
| d-ego | 4+4 | steht | Frame p95 ms | 16.8 | 16.8 | 0 | 0 | nicht langsamer |
| d-ego | 4+4 | steht | CPU-Takt p95 ms | 4.7 | 4.72 | 0.02 | 0.64 | nicht langsamer |
| d-ego | 4+4 | steht | GPU je Bild ms (gpu-bank) | 12.91 | 12.6 | -0.3 | 0.83 | nicht langsamer |
| d-ego | 4+4 | steht | Belegung p95 ms | 6.6 | 6.68 | 0.08 | 0.71 | nicht langsamer |
| d-ego | 4+4 | Zählung | steht Befehle | 50 | 50 | 0 | – | – |
| d-ego | 4+4 | Zählung | steht Dreiecke p95 | 359079 | 360865 | 1786 | – | – |
| d-ego | 4+4 | Zählung | steht VRAM MB | 107.73 | 107.1 | -0.63 | – | – |
| **d-ego** | 4+4 | | **Urteil** | | | | | **nicht-langsamer** |
| stadt | 4+4 | steht | fps | 78.42 | 78.55 | 0.13 | 0.45 | nicht langsamer |
| stadt | 4+4 | steht | Frame p95 ms | 16.8 | 16.8 | 0 | 0 | nicht langsamer |
| stadt | 4+4 | steht | CPU-Takt p95 ms | 7.15 | 7.02 | -0.13 | 0.67 | nicht langsamer |
| stadt | 4+4 | steht | Belegung p95 ms | 10.86 | 10.76 | -0.1 | 0.95 | nicht langsamer |
| stadt | 4+4 | geht | fps | 45.15 | 44.75 | -0.4 | 2.71 | nicht langsamer |
| stadt | 4+4 | geht | Frame p95 ms | 37.52 | 39.58 | 2.05 | 8.84 | nicht langsamer |
| stadt | 4+4 | geht | CPU-Takt p95 ms | 35.32 | 36.15 | 0.83 | 2.93 | nicht langsamer |
| stadt | 4+4 | geht | Belegung p95 ms | 37.93 | 38.49 | 0.56 | 3.57 | nicht langsamer |
| stadt | 4+4 | Zählung | steht Befehle | 57 | 57 | 0 | – | – |
| stadt | 4+4 | Zählung | steht Dreiecke p95 | 1235838 | 1234390 | -1448 | – | – |
| stadt | 4+4 | Zählung | steht VRAM MB | 172.15 | 175.38 | 3.22 | – | – |
| stadt | 4+4 | Zählung | geht Befehle | 78 | 78 | 0 | – | – |
| stadt | 4+4 | Zählung | geht Dreiecke p95 | 1407328 | 1407640 | 311.75 | – | – |
| stadt | 4+4 | Zählung | geht VRAM MB | 171.9 | 170.78 | -1.13 | – | – |
| **stadt** | 4+4 | | **Urteil** | | | | | **nicht-langsamer** |

Instrument je Boot: 429737862 (d-ego-A1, d-ego-A2, d-ego-A3, d-ego-A4, d-ego-B1, d-ego-B2, d-ego-B3, d-ego-B4, stadt-A1, stadt-A2, stadt-A3, stadt-A4, stadt-B1, stadt-B2, stadt-B3, stadt-B4, w-ego-A1, w-ego-A2, w-ego-B1, w-ego-B2)

Roh: `bericht/z47z48-abab/`.
