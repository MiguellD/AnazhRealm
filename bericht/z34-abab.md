# z34-abab — ABAB d43cb61c gegen 8f1802b1: nicht-langsamer

GTX 1060, `--echt` 1920×1080, Regler voll, Messplatz-Dienst (zug/messplatz.md). A = 8f1802b18fe68b09fb660793b198ec7c51c58a9d, B = d43cb61c78fdf982d2f43378ecef3f11ea2e2a0b, Instrument aus B. Je Zelle 2+2, verlängert auf 4+4 nur bei Kern-Anschlag oder einer Größe zwischen 1σ und 2σ. Urteil je Größe Δ ≤ max(2σ gepoolt, Auflösung).

| Zelle | n A+B | Gang | Größe | A | B | Δ B − A | 2σ | Urteil |
|---|---|---|---|---|---|---|---|---|
| w-ego | 2+2 | steht | fps | 75.2 | 77 | 1.8 | 2.21 | nicht langsamer |
| w-ego | 2+2 | steht | Frame p95 ms | 16.8 | 16.8 | 0 | 0 | nicht langsamer |
| w-ego | 2+2 | steht | CPU-Takt p95 ms | 3.8 | 3.7 | -0.1 | 0 | nicht langsamer |
| w-ego | 2+2 | steht | GPU je Bild ms (gpu-bank) | 12.91 | 12.73 | -0.17 | 0.42 | nicht langsamer |
| w-ego | 2+2 | steht | Belegung p95 ms | 5.61 | 5.3 | -0.31 | 0.23 | nicht langsamer |
| w-ego | 2+2 | geht | fps | 61.05 | 60.85 | -0.2 | 0.76 | nicht langsamer |
| w-ego | 2+2 | geht | Frame p95 ms | 25.1 | 25.05 | -0.05 | 0.1 | nicht langsamer |
| w-ego | 2+2 | geht | CPU-Takt p95 ms | 17.7 | 17.85 | 0.15 | 0.5 | nicht langsamer |
| w-ego | 2+2 | geht | Belegung p95 ms | 21.45 | 21.43 | -0.02 | 0.63 | nicht langsamer |
| w-ego | 2+2 | Zählung | steht Befehle | 38 | 38 | 0 | – | – |
| w-ego | 2+2 | Zählung | steht Dreiecke p95 | 263937 | 264030 | 93 | – | – |
| w-ego | 2+2 | Zählung | steht VRAM MB | 107.8 | 107.7 | -0.1 | – | – |
| w-ego | 2+2 | Zählung | geht Befehle | 55 | 55 | 0 | – | – |
| w-ego | 2+2 | Zählung | geht Dreiecke p95 | 377142 | 377543 | 401.5 | – | – |
| w-ego | 2+2 | Zählung | geht VRAM MB | 111.7 | 111.4 | -0.3 | – | – |
| **w-ego** | 2+2 | | **Urteil** | | | | | **nicht-langsamer** |
| d-ego | 4+4 | steht | fps | 73.3 | 73.3 | 0 | 0.6 | nicht langsamer |
| d-ego | 4+4 | steht | Frame p95 ms | 16.8 | 16.8 | 0 | 0 | nicht langsamer |
| d-ego | 4+4 | steht | CPU-Takt p95 ms | 4.85 | 5.05 | 0.2 | 0.2 | nicht langsamer (1σ–2σ) |
| d-ego | 4+4 | steht | GPU je Bild ms (gpu-bank) | 12.98 | 12.84 | -0.14 | 0.31 | nicht langsamer |
| d-ego | 4+4 | steht | Belegung p95 ms | 6.76 | 6.97 | 0.21 | 0.25 | nicht langsamer |
| d-ego | 4+4 | Zählung | steht Befehle | 49 | 49 | 0 | – | – |
| d-ego | 4+4 | Zählung | steht Dreiecke p95 | 356131 | 359625 | 3494 | – | – |
| d-ego | 4+4 | Zählung | steht VRAM MB | 107.15 | 106.45 | -0.7 | – | – |
| **d-ego** | 4+4 | | **Urteil** | | | | | **nicht-langsamer** |
| stadt | 2+2 | steht | fps | 45.2 | 45.8 | 0.6 | 2.15 | nicht langsamer |
| stadt | 2+2 | steht | Frame p95 ms | 25.1 | 25 | -0.1 | 0 | nicht langsamer |
| stadt | 2+2 | steht | CPU-Takt p95 ms | 17.85 | 16.7 | -1.15 | 1.2 | nicht langsamer |
| stadt | 2+2 | steht | Belegung p95 ms | 26.21 | 23.03 | -3.18 | 2 | nicht langsamer |
| stadt | 2+2 | geht | fps | 24.7 | 24.55 | -0.15 | 2.22 | nicht langsamer |
| stadt | 2+2 | geht | Frame p95 ms | 95.85 | 95.75 | -0.1 | 11.74 | nicht langsamer |
| stadt | 2+2 | geht | CPU-Takt p95 ms | 90.9 | 88.3 | -2.6 | 1.84 | nicht langsamer |
| stadt | 2+2 | geht | Belegung p95 ms | 98.68 | 94.03 | -4.65 | 6.19 | nicht langsamer |
| stadt | 2+2 | Zählung | steht Befehle | 42 | 42 | 0 | – | – |
| stadt | 2+2 | Zählung | steht Dreiecke p95 | 379659 | 379537 | -121.5 | – | – |
| stadt | 2+2 | Zählung | steht VRAM MB | 121.95 | 121.8 | -0.15 | – | – |
| stadt | 2+2 | Zählung | geht Befehle | 76.5 | 75.5 | -1 | – | – |
| stadt | 2+2 | Zählung | geht Dreiecke p95 | 1861980 | 1896993 | 35013 | – | – |
| stadt | 2+2 | Zählung | geht VRAM MB | 205.05 | 187.05 | -18 | – | – |
| **stadt** | 2+2 | | **Urteil** | | | | | **nicht-langsamer** |

Instrument je Boot: 8f1802b18 (d-ego-A1, d-ego-A2, d-ego-A3, d-ego-A4, d-ego-B1, d-ego-B2, d-ego-B3, d-ego-B4, stadt-A1, stadt-A2, stadt-B1, stadt-B2, w-ego-A1, w-ego-A2, w-ego-B1, w-ego-B2)

Roh: `bericht/z34-abab/`.
