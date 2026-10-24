# z16b-abab — ABAB 3046bc79 gegen 3d2b3276: LANGSAMER

GTX 1060, `--echt` 1920×1080, Regler voll, Messplatz-Dienst (zug/messplatz.md). A = 3d2b3276b43471f4f38f8859a3c92ed62ca15abc, B = 3046bc79f6863760692afe9ce161798215cbd8cb, Instrument aus B. Je Zelle 2+2, verlängert auf 4+4 nur bei Kern-Anschlag oder einer Größe zwischen 1σ und 2σ. Urteil je Größe Δ ≤ max(2σ gepoolt, Auflösung).

| Zelle | n A+B | Gang | Größe | A | B | Δ B − A | 2σ | Urteil |
|---|---|---|---|---|---|---|---|---|
| w-ego | 4+4 | steht | fps | 74.78 | 74.17 | -0.6 | 1.73 | nicht langsamer |
| w-ego | 4+4 | steht | Frame p95 ms | 16.8 | 16.8 | 0 | 0 | nicht langsamer |
| w-ego | 4+4 | steht | CPU-Takt p95 ms | 4.13 | 4.25 | 0.13 | 0.25 | nicht langsamer |
| w-ego | 4+4 | steht | GPU je Bild ms (gpu-bank) | 13.21 | 13.11 | -0.1 | 0.62 | nicht langsamer |
| w-ego | 4+4 | steht | Belegung p95 ms | 5.92 | 5.98 | 0.07 | 0.27 | nicht langsamer |
| w-ego | 4+4 | geht | fps | 59.05 | 59.02 | -0.02 | 1.24 | nicht langsamer |
| w-ego | 4+4 | geht | Frame p95 ms | 25.1 | 25.1 | 0 | 0 | nicht langsamer |
| w-ego | 4+4 | geht | CPU-Takt p95 ms | 18.75 | 18.52 | -0.23 | 1.11 | nicht langsamer |
| w-ego | 4+4 | geht | Belegung p95 ms | 22.53 | 22.7 | 0.17 | 0.78 | nicht langsamer |
| w-ego | 4+4 | Zählung | steht Befehle | 38 | 38 | 0 | – | – |
| w-ego | 4+4 | Zählung | steht Dreiecke p95 | 263985 | 264029 | 44.5 | – | – |
| w-ego | 4+4 | Zählung | steht VRAM MB | 107.8 | 107.72 | -0.08 | – | – |
| w-ego | 4+4 | Zählung | geht Befehle | 55 | 55 | 0 | – | – |
| w-ego | 4+4 | Zählung | geht Dreiecke p95 | 379759 | 379132 | -626.5 | – | – |
| w-ego | 4+4 | Zählung | geht VRAM MB | 111.6 | 111.53 | -0.07 | – | – |
| **w-ego** | 4+4 | | **Urteil** | | | | | **nicht-langsamer** |
| d-ego | 2+2 | steht | fps | 75 | 75.15 | 0.15 | 0.22 | nicht langsamer |
| d-ego | 2+2 | steht | Frame p95 ms | 16.8 | 16.8 | 0 | 0 | nicht langsamer |
| d-ego | 2+2 | steht | CPU-Takt p95 ms | 5.8 | 5.4 | -0.4 | 0.4 | nicht langsamer |
| d-ego | 2+2 | steht | GPU je Bild ms (gpu-bank) | 12.75 | 12.78 | 0.03 | 0.45 | nicht langsamer |
| d-ego | 2+2 | steht | Belegung p95 ms | 7.77 | 7.19 | -0.58 | 0.76 | nicht langsamer |
| d-ego | 2+2 | Zählung | steht Befehle | 59 | 59 | 0 | – | – |
| d-ego | 2+2 | Zählung | steht Dreiecke p95 | 441647 | 441528 | -119 | – | – |
| d-ego | 2+2 | Zählung | steht VRAM MB | 111.8 | 111.8 | 0 | – | – |
| **d-ego** | 2+2 | | **Urteil** | | | | | **nicht-langsamer** |
| stadt | 4+4 | steht | fps | 76.92 | 72.67 | -4.25 | 0.81 | LANGSAMER |
| stadt | 4+4 | steht | Frame p95 ms | 16.8 | 16.85 | 0.05 | 0.08 | nicht langsamer (1σ–2σ) |
| stadt | 4+4 | steht | CPU-Takt p95 ms | 8.88 | 9.03 | 0.15 | 0.84 | nicht langsamer |
| stadt | 4+4 | steht | Belegung p95 ms | 13.1 | 13.38 | 0.28 | 1.05 | nicht langsamer |
| stadt | 4+4 | geht | fps | 36.25 | 37.1 | 0.85 | 1.66 | nicht langsamer |
| stadt | 4+4 | geht | Frame p95 ms | 56.25 | 50.05 | -6.2 | 5.8 | nicht langsamer |
| stadt | 4+4 | geht | CPU-Takt p95 ms | 48.28 | 44.88 | -3.4 | 3.94 | nicht langsamer |
| stadt | 4+4 | geht | Belegung p95 ms | 55.89 | 52.1 | -3.8 | 4.82 | nicht langsamer |
| stadt | 4+4 | Zählung | steht Befehle | 57 | 58.5 | 1.5 | – | – |
| stadt | 4+4 | Zählung | steht Dreiecke p95 | 1297645 | 1327637 | 29992 | – | – |
| stadt | 4+4 | Zählung | steht VRAM MB | 154.1 | 157.4 | 3.3 | – | – |
| stadt | 4+4 | Zählung | geht Befehle | 78 | 77.75 | -0.25 | – | – |
| stadt | 4+4 | Zählung | geht Dreiecke p95 | 1974039 | 1963134 | -10905 | – | – |
| stadt | 4+4 | Zählung | geht VRAM MB | 194.27 | 191.45 | -2.82 | – | – |
| **stadt** | 4+4 | | **Urteil** | | | | | **LANGSAMER** |

Instrument je Boot: 3d2b3276b (d-ego-A1, d-ego-A2, d-ego-B1, d-ego-B2, stadt-A1, stadt-A2, stadt-A3, stadt-A4, stadt-B1, stadt-B2, stadt-B3, stadt-B4, w-ego-A1, w-ego-A2, w-ego-A3, w-ego-A4, w-ego-B1, w-ego-B2, w-ego-B3, w-ego-B4)

Roh: `bericht/z16b-abab/`.
