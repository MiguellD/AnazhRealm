# nw3031-abab — ABAB 8f1802b1 gegen 4a5f5e2c: LANGSAMER

GTX 1060, `--echt` 1920×1080, Regler voll, Messplatz-Dienst (zug/messplatz.md). A = 4a5f5e2c9ab02618feccdf8b9f1a03942bcc9301, B = 8f1802b18fe68b09fb660793b198ec7c51c58a9d, Instrument aus B. Je Zelle 2+2, verlängert auf 4+4 nur bei Kern-Anschlag oder einer Größe zwischen 1σ und 2σ. Urteil je Größe Δ ≤ max(2σ gepoolt, Auflösung).

| Zelle | n A+B | Gang | Größe | A | B | Δ B − A | 2σ | Urteil |
|---|---|---|---|---|---|---|---|---|
| w-ego | 4+4 | steht | fps | 75.43 | 76.05 | 0.62 | 1.23 | nicht langsamer |
| w-ego | 4+4 | steht | Frame p95 ms | 16.8 | 16.8 | 0 | 0 | nicht langsamer |
| w-ego | 4+4 | steht | CPU-Takt p95 ms | 4.05 | 4.08 | 0.03 | 0.41 | nicht langsamer |
| w-ego | 4+4 | steht | GPU je Bild ms (gpu-bank) | 12.87 | 12.98 | 0.12 | 0.69 | nicht langsamer |
| w-ego | 4+4 | steht | Belegung p95 ms | 5.86 | 5.87 | 0.01 | 0.47 | nicht langsamer |
| w-ego | 4+4 | geht | fps | 60.17 | 60.8 | 0.63 | 1.95 | nicht langsamer |
| w-ego | 4+4 | geht | Frame p95 ms | 25.1 | 25.08 | -0.02 | 0.07 | nicht langsamer |
| w-ego | 4+4 | geht | CPU-Takt p95 ms | 17.68 | 17.93 | 0.25 | 1.53 | nicht langsamer |
| w-ego | 4+4 | geht | Belegung p95 ms | 22.09 | 21.34 | -0.75 | 1.42 | nicht langsamer |
| w-ego | 4+4 | Zählung | steht Befehle | 38 | 38 | 0 | – | – |
| w-ego | 4+4 | Zählung | steht Dreiecke p95 | 263936 | 263841 | -95 | – | – |
| w-ego | 4+4 | Zählung | steht VRAM MB | 107.8 | 107.85 | 0.05 | – | – |
| w-ego | 4+4 | Zählung | geht Befehle | 55 | 55 | 0 | – | – |
| w-ego | 4+4 | Zählung | geht Dreiecke p95 | 378352 | 377818 | -534 | – | – |
| w-ego | 4+4 | Zählung | geht VRAM MB | 111.78 | 111.58 | -0.2 | – | – |
| **w-ego** | 4+4 | | **Urteil** | | | | | **nicht-langsamer** |
| g-third | 2+2 | steht | fps | 79.25 | 79.75 | 0.5 | 1.33 | nicht langsamer |
| g-third | 2+2 | steht | Frame p95 ms | 16.7 | 16.7 | 0 | 0 | nicht langsamer |
| g-third | 2+2 | steht | CPU-Takt p95 ms | 6.45 | 6.5 | 0.05 | 2.44 | nicht langsamer |
| g-third | 2+2 | steht | GPU je Bild ms (gpu-bank) | 12.11 | 11.79 | -0.31 | 0.3 | nicht langsamer |
| g-third | 2+2 | steht | Belegung p95 ms | 8.61 | 8.46 | -0.15 | 3.66 | nicht langsamer |
| g-third | 2+2 | Zählung | steht Befehle | 79 | 79 | 0 | – | – |
| g-third | 2+2 | Zählung | steht Dreiecke p95 | 338873 | 338879 | 6 | – | – |
| g-third | 2+2 | Zählung | steht VRAM MB | 113.55 | 112.2 | -1.35 | – | – |
| **g-third** | 2+2 | | **Urteil** | | | | | **nicht-langsamer** |
| d-ego | 2+2 | steht | fps | 77.2 | 75.1 | -2.1 | 3.54 | nicht langsamer |
| d-ego | 2+2 | steht | Frame p95 ms | 16.8 | 16.8 | 0 | 0 | nicht langsamer |
| d-ego | 2+2 | steht | CPU-Takt p95 ms | 5.45 | 4.6 | -0.85 | 0.98 | nicht langsamer |
| d-ego | 2+2 | steht | GPU je Bild ms (gpu-bank) | 12.45 | 12.88 | 0.43 | 0.93 | nicht langsamer |
| d-ego | 2+2 | steht | Belegung p95 ms | 7.37 | 6.33 | -1.03 | 1.39 | nicht langsamer |
| d-ego | 2+2 | Zählung | steht Befehle | 59 | 49 | -10 | – | – |
| d-ego | 2+2 | Zählung | steht Dreiecke p95 | 439341 | 356133 | -83208 | – | – |
| d-ego | 2+2 | Zählung | steht VRAM MB | 111.7 | 107.3 | -4.4 | – | – |
| **d-ego** | 2+2 | | **Urteil** | | | | | **nicht-langsamer** |
| stadt | 4+4 | steht | fps | 75.73 | 49.83 | -25.9 | 4.41 | LANGSAMER |
| stadt | 4+4 | steht | Frame p95 ms | 16.8 | 21.07 | 4.27 | 6.41 | nicht langsamer (1σ–2σ) |
| stadt | 4+4 | steht | CPU-Takt p95 ms | 7.05 | 15.17 | 8.13 | 1.61 | LANGSAMER |
| stadt | 4+4 | steht | Belegung p95 ms | 10.51 | 20.38 | 9.88 | 1.81 | LANGSAMER |
| stadt | 4+4 | geht | fps | 40.38 | 28.1 | -12.28 | 4.75 | LANGSAMER |
| stadt | 4+4 | geht | Frame p95 ms | 47.9 | 89.57 | 41.67 | 12.78 | LANGSAMER |
| stadt | 4+4 | geht | CPU-Takt p95 ms | 40.82 | 80.8 | 39.98 | 15.57 | LANGSAMER |
| stadt | 4+4 | geht | Belegung p95 ms | 46.74 | 90.77 | 44.02 | 17.38 | LANGSAMER |
| stadt | 4+4 | Zählung | steht Befehle | 53.5 | 41.5 | -12 | – | – |
| stadt | 4+4 | Zählung | steht Dreiecke p95 | 1300049 | 381541 | -918508 | – | – |
| stadt | 4+4 | Zählung | steht VRAM MB | 156.32 | 120.95 | -35.37 | – | – |
| stadt | 4+4 | Zählung | geht Befehle | 77.75 | 75.75 | -2 | – | – |
| stadt | 4+4 | Zählung | geht Dreiecke p95 | 1970811 | 1911872 | -58939 | – | – |
| stadt | 4+4 | Zählung | geht VRAM MB | 195.88 | 236.25 | 40.38 | – | – |
| **stadt** | 4+4 | | **Urteil** | | | | | **LANGSAMER** |

Instrument je Boot: 4a5f5e2c9 (d-ego-A1, d-ego-A2, d-ego-B1, d-ego-B2, g-third-A1, g-third-A2, g-third-B1, g-third-B2, stadt-A1, stadt-A2, stadt-A3, stadt-A4, stadt-B1, stadt-B2, stadt-B3, stadt-B4, w-ego-A1, w-ego-A2, w-ego-A3, w-ego-A4, w-ego-B1, w-ego-B2, w-ego-B3, w-ego-B4)

Roh: `bericht/nw3031-abab/`.
