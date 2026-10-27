# z44b-abab — ABAB 5b8603c1 gegen 607d0c73: nicht-langsamer

GTX 1060, `--echt` 1920×1080, Regler voll, Messplatz-Dienst (zug/messplatz.md). A = 607d0c73a2b98fdc1c2dbc06a961563bad73ce2a, B = 5b8603c181cc376edb37dc1f31ec09e8859d2fb5, Instrument aus B. Je Zelle 2+2, verlängert auf 4+4 nur bei Kern-Anschlag oder einer Größe zwischen 1σ und 2σ. Urteil je Größe Δ ≤ max(2σ gepoolt, Auflösung).

| Zelle | n A+B | Gang | Größe | A | B | Δ B − A | 2σ | Urteil |
|---|---|---|---|---|---|---|---|---|
| w-ego | 4+4 | steht | fps | 75.32 | 75.15 | -0.17 | 2.17 | nicht langsamer |
| w-ego | 4+4 | steht | Frame p95 ms | 16.8 | 16.8 | 0 | 0 | nicht langsamer |
| w-ego | 4+4 | steht | CPU-Takt p95 ms | 4.4 | 4.2 | -0.2 | 0.43 | nicht langsamer |
| w-ego | 4+4 | steht | GPU je Bild ms (gpu-bank) | 13.07 | 13.04 | -0.02 | 0.95 | nicht langsamer |
| w-ego | 4+4 | steht | Belegung p95 ms | 6.22 | 6.08 | -0.14 | 0.7 | nicht langsamer |
| w-ego | 4+4 | geht | fps | 60.25 | 59.83 | -0.42 | 2.96 | nicht langsamer |
| w-ego | 4+4 | geht | Frame p95 ms | 25.02 | 25.08 | 0.05 | 0.1 | nicht langsamer (1σ–2σ) |
| w-ego | 4+4 | geht | CPU-Takt p95 ms | 18.38 | 18.95 | 0.57 | 2.72 | nicht langsamer |
| w-ego | 4+4 | geht | Belegung p95 ms | 22.02 | 22.07 | 0.05 | 1.98 | nicht langsamer |
| w-ego | 4+4 | Zählung | steht Befehle | 39 | 39 | 0 | – | – |
| w-ego | 4+4 | Zählung | steht Dreiecke p95 | 264245 | 264249 | 4 | – | – |
| w-ego | 4+4 | Zählung | steht VRAM MB | 107.8 | 107.8 | 0 | – | – |
| w-ego | 4+4 | Zählung | geht Befehle | 56 | 56 | 0 | – | – |
| w-ego | 4+4 | Zählung | geht Dreiecke p95 | 379068 | 379255 | 187 | – | – |
| w-ego | 4+4 | Zählung | geht VRAM MB | 111.55 | 111.67 | 0.12 | – | – |
| **w-ego** | 4+4 | | **Urteil** | | | | | **nicht-langsamer** |
| d-ego | 4+4 | steht | fps | 72.9 | 72.75 | -0.15 | 2.29 | nicht langsamer |
| d-ego | 4+4 | steht | Frame p95 ms | 16.8 | 16.8 | 0 | 0 | nicht langsamer |
| d-ego | 4+4 | steht | CPU-Takt p95 ms | 5.63 | 5.65 | 0.03 | 0.86 | nicht langsamer |
| d-ego | 4+4 | steht | GPU je Bild ms (gpu-bank) | 13.02 | 13.17 | 0.15 | 0.68 | nicht langsamer |
| d-ego | 4+4 | steht | Belegung p95 ms | 7.92 | 7.95 | 0.03 | 1.43 | nicht langsamer |
| d-ego | 4+4 | Zählung | steht Befehle | 50 | 50 | 0 | – | – |
| d-ego | 4+4 | Zählung | steht Dreiecke p95 | 361433 | 360225 | -1207 | – | – |
| d-ego | 4+4 | Zählung | steht VRAM MB | 106.92 | 107.3 | 0.38 | – | – |
| **d-ego** | 4+4 | | **Urteil** | | | | | **nicht-langsamer** |
| stadt | 2+2 | steht | fps | 76.05 | 76.5 | 0.45 | 3.36 | nicht langsamer |
| stadt | 2+2 | steht | Frame p95 ms | 16.75 | 16.8 | 0.05 | 0.1 | nicht langsamer |
| stadt | 2+2 | steht | CPU-Takt p95 ms | 8.7 | 8.5 | -0.2 | 2.44 | nicht langsamer |
| stadt | 2+2 | steht | Belegung p95 ms | 13.36 | 12.87 | -0.49 | 3.45 | nicht langsamer |
| stadt | 2+2 | geht | fps | 37.45 | 36.85 | -0.6 | 6.54 | nicht langsamer |
| stadt | 2+2 | geht | Frame p95 ms | 49.95 | 49.95 | 0 | 0.14 | nicht langsamer |
| stadt | 2+2 | geht | CPU-Takt p95 ms | 45.15 | 45.1 | -0.05 | 7.3 | nicht langsamer |
| stadt | 2+2 | geht | Belegung p95 ms | 48.7 | 49.86 | 1.16 | 6.81 | nicht langsamer |
| stadt | 2+2 | Zählung | steht Befehle | 57.5 | 57 | -0.5 | – | – |
| stadt | 2+2 | Zählung | steht Dreiecke p95 | 1234658 | 1235350 | 692 | – | – |
| stadt | 2+2 | Zählung | steht VRAM MB | 171.45 | 172.25 | 0.8 | – | – |
| stadt | 2+2 | Zählung | geht Befehle | 78.5 | 78 | -0.5 | – | – |
| stadt | 2+2 | Zählung | geht Dreiecke p95 | 1394826 | 1396761 | 1935 | – | – |
| stadt | 2+2 | Zählung | geht VRAM MB | 175.6 | 175.1 | -0.5 | – | – |
| **stadt** | 2+2 | | **Urteil** | | | | | **nicht-langsamer** |

Instrument je Boot: 607d0c73a (d-ego-A1, d-ego-A2, d-ego-A3, d-ego-A4, d-ego-B1, d-ego-B2, d-ego-B3, d-ego-B4, stadt-A1, stadt-A2, stadt-B1, stadt-B2, w-ego-A1, w-ego-A2, w-ego-A3, w-ego-A4, w-ego-B1, w-ego-B2, w-ego-B3, w-ego-B4)

Roh: `bericht/z44b-abab/`.
