# takt19-abab — ABAB b3f9ae95 gegen 9e92be45: nicht-langsamer

GTX 1060, `--echt` 1920×1080, Regler voll, Messplatz-Dienst (zug/messplatz.md). A = 9e92be45bfe89c1137b0dffc6e0e479e70a4a6ec, B = b3f9ae95d3bf1188285b135c757b074a12ee3f22, Instrument aus B. Je Zelle 2+2, verlängert auf 4+4 nur bei Kern-Anschlag oder einer Größe zwischen 1σ und 2σ. Urteil je Größe Δ ≤ max(2σ gepoolt, Auflösung).

| Zelle | n A+B | Gang | Größe | A | B | Δ B − A | 2σ | Urteil |
|---|---|---|---|---|---|---|---|---|
| w-ego | 4+4 | steht | fps | 75.33 | 74.82 | -0.5 | 1.23 | nicht langsamer |
| w-ego | 4+4 | steht | Frame p95 ms | 16.78 | 16.8 | 0.02 | 0.07 | nicht langsamer |
| w-ego | 4+4 | steht | CPU-Takt p95 ms | 4.88 | 4.85 | -0.03 | 0.65 | nicht langsamer |
| w-ego | 4+4 | steht | GPU je Bild ms (gpu-bank) | 13.15 | 12.84 | -0.31 | 0.62 | nicht langsamer |
| w-ego | 4+4 | steht | Belegung p95 ms | 6.91 | 6.9 | -0.01 | 1 | nicht langsamer |
| w-ego | 4+4 | geht | fps | 58.9 | 58.98 | 0.08 | 2.16 | nicht langsamer |
| w-ego | 4+4 | geht | Frame p95 ms | 25.08 | 25.02 | -0.05 | 0.1 | nicht langsamer |
| w-ego | 4+4 | geht | CPU-Takt p95 ms | 19.77 | 19.35 | -0.42 | 2.1 | nicht langsamer |
| w-ego | 4+4 | geht | Belegung p95 ms | 22.51 | 22.28 | -0.23 | 1.15 | nicht langsamer |
| w-ego | 4+4 | Zählung | steht Befehle | 39 | 39 | 0 | – | – |
| w-ego | 4+4 | Zählung | steht Dreiecke p95 | 264242 | 264246 | 3.75 | – | – |
| w-ego | 4+4 | Zählung | steht VRAM MB | 107.8 | 107.8 | 0 | – | – |
| w-ego | 4+4 | Zählung | geht Befehle | 56.5 | 57 | 0.5 | – | – |
| w-ego | 4+4 | Zählung | geht Dreiecke p95 | 381453 | 382146 | 692.5 | – | – |
| w-ego | 4+4 | Zählung | geht VRAM MB | 111.63 | 111.75 | 0.13 | – | – |
| **w-ego** | 4+4 | | **Urteil** | | | | | **nicht-langsamer** |
| d-ego | 2+2 | steht | fps | 74.15 | 73.45 | -0.7 | 1.75 | nicht langsamer |
| d-ego | 2+2 | steht | Frame p95 ms | 16.8 | 16.8 | 0 | 0 | nicht langsamer |
| d-ego | 2+2 | steht | CPU-Takt p95 ms | 5.45 | 5.15 | -0.3 | 0.14 | nicht langsamer |
| d-ego | 2+2 | steht | GPU je Bild ms (gpu-bank) | 13.09 | 13.05 | -0.04 | 0.24 | nicht langsamer |
| d-ego | 2+2 | steht | Belegung p95 ms | 7.58 | 7.32 | -0.26 | 0.17 | nicht langsamer |
| d-ego | 2+2 | Zählung | steht Befehle | 50.5 | 51 | 0.5 | – | – |
| d-ego | 2+2 | Zählung | steht Dreiecke p95 | 366582 | 294571 | -72011 | – | – |
| d-ego | 2+2 | Zählung | steht VRAM MB | 106.9 | 105.85 | -1.05 | – | – |
| **d-ego** | 2+2 | | **Urteil** | | | | | **nicht-langsamer** |
| stadt | 2+2 | steht | fps | 77.1 | 79.4 | 2.3 | 0.85 | nicht langsamer |
| stadt | 2+2 | steht | Frame p95 ms | 16.75 | 16.7 | -0.05 | 0.1 | nicht langsamer |
| stadt | 2+2 | steht | CPU-Takt p95 ms | 8.45 | 6.35 | -2.1 | 1.53 | nicht langsamer |
| stadt | 2+2 | steht | Belegung p95 ms | 12.87 | 9.46 | -3.41 | 2.15 | nicht langsamer |
| stadt | 2+2 | geht | fps | 42.8 | 56.15 | 13.35 | 15.13 | nicht langsamer |
| stadt | 2+2 | geht | Frame p95 ms | 41.7 | 29.2 | -12.5 | 11.6 | nicht langsamer |
| stadt | 2+2 | geht | CPU-Takt p95 ms | 38.6 | 25.45 | -13.15 | 9.76 | nicht langsamer |
| stadt | 2+2 | geht | Belegung p95 ms | 43.69 | 27.07 | -16.61 | 9.55 | nicht langsamer |
| stadt | 2+2 | Zählung | steht Befehle | 58 | 53 | -5 | – | – |
| stadt | 2+2 | Zählung | steht Dreiecke p95 | 1239054 | 602414 | -636640 | – | – |
| stadt | 2+2 | Zählung | steht VRAM MB | 174.25 | 167.35 | -6.9 | – | – |
| stadt | 1+2 | Zählung | geht Befehle | 78 | 54 | -24 | – | – |
| stadt | 1+2 | Zählung | geht Dreiecke p95 | 1394219 | 586895 | -807324 | – | – |
| stadt | 1+2 | Zählung | geht VRAM MB | 175.3 | 161.1 | -14.2 | – | – |
| **stadt** | 2+2 | | **Urteil** | | | | | **nicht-langsamer** |

Instrument je Boot: 9e92be45b (d-ego-A1, d-ego-A2, d-ego-B1, d-ego-B2, stadt-A1, stadt-A2, stadt-B1, stadt-B2, w-ego-A1, w-ego-A2, w-ego-A3, w-ego-A4, w-ego-B1, w-ego-B2, w-ego-B3, w-ego-B4)

Roh: `bericht/takt19-abab/`.
