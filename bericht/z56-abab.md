# z56-abab — ABAB 9e92be45 gegen a03b7b06: nicht-langsamer

GTX 1060, `--echt` 1920×1080, Regler voll, Messplatz-Dienst (zug/messplatz.md). A = a03b7b0626826d1dd47c21a85bdcf123ecae6e39, B = 9e92be45bfe89c1137b0dffc6e0e479e70a4a6ec, Instrument aus B. Je Zelle 2+2, verlängert auf 4+4 nur bei Kern-Anschlag oder einer Größe zwischen 1σ und 2σ. Urteil je Größe Δ ≤ max(2σ gepoolt, Auflösung).

| Zelle | n A+B | Gang | Größe | A | B | Δ B − A | 2σ | Urteil |
|---|---|---|---|---|---|---|---|---|
| w-ego | 4+4 | steht | fps | 76.03 | 75.7 | -0.33 | 2.18 | nicht langsamer |
| w-ego | 4+4 | steht | Frame p95 ms | 16.8 | 16.8 | 0 | 0 | nicht langsamer |
| w-ego | 4+4 | steht | CPU-Takt p95 ms | 4.5 | 4.4 | -0.1 | 0.42 | nicht langsamer |
| w-ego | 4+4 | steht | GPU je Bild ms (gpu-bank) | 12.47 | 12.63 | 0.15 | 0.52 | nicht langsamer |
| w-ego | 4+4 | steht | Belegung p95 ms | 6.33 | 6.3 | -0.03 | 0.64 | nicht langsamer |
| w-ego | 4+4 | geht | fps | 60.8 | 60.63 | -0.17 | 1.7 | nicht langsamer |
| w-ego | 4+4 | geht | Frame p95 ms | 25.1 | 25.05 | -0.05 | 0.08 | nicht langsamer |
| w-ego | 4+4 | geht | CPU-Takt p95 ms | 17.82 | 17.68 | -0.15 | 1.28 | nicht langsamer |
| w-ego | 4+4 | geht | Belegung p95 ms | 21.5 | 21.38 | -0.11 | 0.82 | nicht langsamer |
| w-ego | 4+4 | Zählung | steht Befehle | 39 | 39 | 0 | – | – |
| w-ego | 4+4 | Zählung | steht Dreiecke p95 | 264240 | 264250 | 10.5 | – | – |
| w-ego | 4+4 | Zählung | steht VRAM MB | 107.85 | 107.82 | -0.03 | – | – |
| w-ego | 4+4 | Zählung | geht Befehle | 56.25 | 56.5 | 0.25 | – | – |
| w-ego | 4+4 | Zählung | geht Dreiecke p95 | 381028 | 382762 | 1734 | – | – |
| w-ego | 4+4 | Zählung | geht VRAM MB | 111.72 | 111.82 | 0.1 | – | – |
| **w-ego** | 4+4 | | **Urteil** | | | | | **nicht-langsamer** |
| d-ego | 4+4 | steht | fps | 74.3 | 73.95 | -0.35 | 2.09 | nicht langsamer |
| d-ego | 4+4 | steht | Frame p95 ms | 16.8 | 16.8 | 0 | 0 | nicht langsamer |
| d-ego | 4+4 | steht | CPU-Takt p95 ms | 5.25 | 5.38 | 0.13 | 0.58 | nicht langsamer |
| d-ego | 4+4 | steht | GPU je Bild ms (gpu-bank) | 12.85 | 12.92 | 0.07 | 0.45 | nicht langsamer |
| d-ego | 4+4 | steht | Belegung p95 ms | 7.46 | 7.55 | 0.1 | 0.7 | nicht langsamer |
| d-ego | 4+4 | Zählung | steht Befehle | 51 | 50.75 | -0.25 | – | – |
| d-ego | 4+4 | Zählung | steht Dreiecke p95 | 363779 | 368252 | 4474 | – | – |
| d-ego | 4+4 | Zählung | steht VRAM MB | 106.78 | 107.05 | 0.27 | – | – |
| **d-ego** | 4+4 | | **Urteil** | | | | | **nicht-langsamer** |
| stadt | 4+4 | steht | fps | 78.3 | 78 | -0.3 | 1.27 | nicht langsamer |
| stadt | 4+4 | steht | Frame p95 ms | 16.8 | 16.8 | 0 | 0 | nicht langsamer |
| stadt | 4+4 | steht | CPU-Takt p95 ms | 7.52 | 7.55 | 0.03 | 0.93 | nicht langsamer |
| stadt | 4+4 | steht | Belegung p95 ms | 11.4 | 11.53 | 0.13 | 1.23 | nicht langsamer |
| stadt | 4+4 | geht | fps | 47.23 | 46.63 | -0.6 | 2.98 | nicht langsamer |
| stadt | 4+4 | geht | Frame p95 ms | 35.43 | 35.48 | 0.05 | 8.13 | nicht langsamer |
| stadt | 4+4 | geht | CPU-Takt p95 ms | 33.2 | 33.58 | 0.38 | 2.4 | nicht langsamer |
| stadt | 4+4 | geht | Belegung p95 ms | 35.61 | 36.03 | 0.42 | 2.69 | nicht langsamer |
| stadt | 4+4 | Zählung | steht Befehle | 58 | 58 | 0 | – | – |
| stadt | 4+4 | Zählung | steht Dreiecke p95 | 1237854 | 1237758 | -96 | – | – |
| stadt | 4+4 | Zählung | steht VRAM MB | 173.88 | 173.68 | -0.2 | – | – |
| stadt | 4+4 | Zählung | geht Befehle | 78 | 78 | 0 | – | – |
| stadt | 4+4 | Zählung | geht Dreiecke p95 | 1405463 | 1406443 | 979.5 | – | – |
| stadt | 4+4 | Zählung | geht VRAM MB | 173.6 | 173.6 | 0 | – | – |
| **stadt** | 4+4 | | **Urteil** | | | | | **nicht-langsamer** |

Instrument je Boot: a03b7b062 (d-ego-A1, d-ego-A2, d-ego-A3, d-ego-A4, d-ego-B1, d-ego-B2, d-ego-B3, d-ego-B4, stadt-A1, stadt-A2, stadt-A3, stadt-A4, stadt-B1, stadt-B2, stadt-B3, stadt-B4, w-ego-A1, w-ego-A2, w-ego-A3, w-ego-A4, w-ego-B1, w-ego-B2, w-ego-B3, w-ego-B4)

Roh: `bericht/z56-abab/`.
