# z32-abab — ABAB 83df2052 gegen d43cb61c: LANGSAMER

GTX 1060, `--echt` 1920×1080, Regler voll, Messplatz-Dienst (zug/messplatz.md). A = d43cb61c78fdf982d2f43378ecef3f11ea2e2a0b, B = 83df2052d84b370158b28048ca90fb5f5f2ab30f, Instrument aus B. Je Zelle 2+2, verlängert auf 4+4 nur bei Kern-Anschlag oder einer Größe zwischen 1σ und 2σ. Urteil je Größe Δ ≤ max(2σ gepoolt, Auflösung).

| Zelle | n A+B | Gang | Größe | A | B | Δ B − A | 2σ | Urteil |
|---|---|---|---|---|---|---|---|---|
| w-ego | 4+4 | steht | fps | 74.92 | 74.7 | -0.22 | 1.5 | nicht langsamer |
| w-ego | 4+4 | steht | Frame p95 ms | 16.8 | 16.8 | 0 | 0 | nicht langsamer |
| w-ego | 4+4 | steht | CPU-Takt p95 ms | 4.45 | 4.38 | -0.08 | 0.38 | nicht langsamer |
| w-ego | 4+4 | steht | GPU je Bild ms (gpu-bank) | 12.86 | 12.92 | 0.06 | 0.5 | nicht langsamer |
| w-ego | 4+4 | steht | Belegung p95 ms | 6.29 | 6.31 | 0.02 | 0.43 | nicht langsamer |
| w-ego | 4+4 | geht | fps | 58.48 | 58.75 | 0.27 | 1.6 | nicht langsamer |
| w-ego | 4+4 | geht | Frame p95 ms | 25.05 | 25.1 | 0.05 | 0.08 | nicht langsamer (1σ–2σ) |
| w-ego | 4+4 | geht | CPU-Takt p95 ms | 20.15 | 19.68 | -0.48 | 2.47 | nicht langsamer |
| w-ego | 4+4 | geht | Belegung p95 ms | 23.02 | 22.59 | -0.43 | 1.24 | nicht langsamer |
| w-ego | 4+4 | Zählung | steht Befehle | 38 | 39 | 1 | – | – |
| w-ego | 4+4 | Zählung | steht Dreiecke p95 | 265515 | 264608 | -906.5 | – | – |
| w-ego | 4+4 | Zählung | steht VRAM MB | 107.08 | 107.8 | 0.73 | – | – |
| w-ego | 4+4 | Zählung | geht Befehle | 55 | 56 | 1 | – | – |
| w-ego | 4+4 | Zählung | geht Dreiecke p95 | 384320 | 382725 | -1594 | – | – |
| w-ego | 4+4 | Zählung | geht VRAM MB | 111 | 111.6 | 0.6 | – | – |
| **w-ego** | 4+4 | | **Urteil** | | | | | **nicht-langsamer** |
| d-ego | 4+4 | steht | fps | 72.75 | 73.55 | 0.8 | 2.44 | nicht langsamer |
| d-ego | 4+4 | steht | Frame p95 ms | 16.8 | 16.8 | 0 | 0 | nicht langsamer |
| d-ego | 4+4 | steht | CPU-Takt p95 ms | 5.05 | 5 | -0.05 | 0.18 | nicht langsamer |
| d-ego | 4+4 | steht | GPU je Bild ms (gpu-bank) | 13.14 | 12.96 | -0.18 | 0.8 | nicht langsamer |
| d-ego | 4+4 | steht | Belegung p95 ms | 7.07 | 7.02 | -0.04 | 0.31 | nicht langsamer |
| d-ego | 4+4 | Zählung | steht Befehle | 49 | 50 | 1 | – | – |
| d-ego | 4+4 | Zählung | steht Dreiecke p95 | 357377 | 356952 | -425 | – | – |
| d-ego | 4+4 | Zählung | steht VRAM MB | 107 | 107.05 | 0.05 | – | – |
| **d-ego** | 4+4 | | **Urteil** | | | | | **nicht-langsamer** |
| stadt | 4+4 | steht | fps | 47.27 | 49.53 | 2.25 | 3.61 | nicht langsamer |
| stadt | 4+4 | steht | Frame p95 ms | 25 | 37.53 | 12.53 | 6.74 | LANGSAMER |
| stadt | 4+4 | steht | CPU-Takt p95 ms | 15.88 | 31.58 | 15.7 | 2.74 | LANGSAMER |
| stadt | 4+4 | steht | Belegung p95 ms | 21.95 | 37.52 | 15.56 | 3.6 | LANGSAMER |
| stadt | 4+4 | geht | fps | 25.33 | 25 | -0.33 | 2.2 | nicht langsamer |
| stadt | 4+4 | geht | Frame p95 ms | 95.85 | 97.92 | 2.08 | 8.97 | nicht langsamer |
| stadt | 4+4 | geht | CPU-Takt p95 ms | 89.28 | 90.08 | 0.8 | 12.05 | nicht langsamer |
| stadt | 4+4 | geht | Belegung p95 ms | 95.93 | 98.36 | 2.44 | 12.22 | nicht langsamer |
| stadt | 4+4 | Zählung | steht Befehle | 41.75 | 42.75 | 1 | – | – |
| stadt | 4+4 | Zählung | steht Dreiecke p95 | 379572 | 381561 | 1989 | – | – |
| stadt | 4+4 | Zählung | steht VRAM MB | 121.95 | 121.17 | -0.78 | – | – |
| stadt | 4+4 | Zählung | geht Befehle | 76.5 | 77 | 0.5 | – | – |
| stadt | 4+4 | Zählung | geht Dreiecke p95 | 1896213 | 1898678 | 2465 | – | – |
| stadt | 4+4 | Zählung | geht VRAM MB | 195.75 | 216.1 | 20.35 | – | – |
| **stadt** | 4+4 | | **Urteil** | | | | | **LANGSAMER** |

Instrument je Boot: d43cb61c7 (d-ego-A1, d-ego-A2, d-ego-A3, d-ego-A4, d-ego-B1, d-ego-B2, d-ego-B3, d-ego-B4, stadt-A1, stadt-A2, stadt-A3, stadt-A4, stadt-B1, stadt-B2, stadt-B3, stadt-B4, w-ego-A1, w-ego-A2, w-ego-A3, w-ego-A4, w-ego-B1, w-ego-B2, w-ego-B3, w-ego-B4)

Roh: `bericht/z32-abab/`.
