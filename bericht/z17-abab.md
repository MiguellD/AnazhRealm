# z17-abab — ABAB 6f8a2c66 gegen 3046bc79: LANGSAMER

GTX 1060, `--echt` 1920×1080, Regler voll, Messplatz-Dienst (zug/messplatz.md). A = 3046bc79f6863760692afe9ce161798215cbd8cb, B = 6f8a2c6638623a037f69bf110358f36b68b343d6, Instrument aus B. Je Zelle 2+2, verlängert auf 4+4 nur bei Kern-Anschlag oder einer Größe zwischen 1σ und 2σ. Urteil je Größe Δ ≤ max(2σ gepoolt, Auflösung).

| Zelle | n A+B | Gang | Größe | A | B | Δ B − A | 2σ | Urteil |
|---|---|---|---|---|---|---|---|---|
| w-ego | 4+4 | steht | fps | 74.57 | 74.68 | 0.1 | 1.77 | nicht langsamer |
| w-ego | 4+4 | steht | Frame p95 ms | 16.8 | 16.8 | 0 | 0 | nicht langsamer |
| w-ego | 4+4 | steht | CPU-Takt p95 ms | 4.03 | 3.95 | -0.08 | 0.59 | nicht langsamer |
| w-ego | 4+4 | steht | GPU je Bild ms (gpu-bank) | 13.02 | 13.03 | 0.01 | 0.71 | nicht langsamer |
| w-ego | 4+4 | steht | Belegung p95 ms | 5.74 | 5.76 | 0.02 | 0.65 | nicht langsamer |
| w-ego | 4+4 | geht | fps | 59.53 | 59.8 | 0.27 | 2.29 | nicht langsamer |
| w-ego | 4+4 | geht | Frame p95 ms | 25.1 | 25.1 | 0 | 0 | nicht langsamer |
| w-ego | 4+4 | geht | CPU-Takt p95 ms | 18.2 | 18.18 | -0.02 | 1.81 | nicht langsamer |
| w-ego | 4+4 | geht | Belegung p95 ms | 22.33 | 22.18 | -0.14 | 1.61 | nicht langsamer |
| w-ego | 4+4 | Zählung | steht Befehle | 38 | 38 | 0 | – | – |
| w-ego | 4+4 | Zählung | steht Dreiecke p95 | 263980 | 264029 | 48.5 | – | – |
| w-ego | 4+4 | Zählung | steht VRAM MB | 107.85 | 107.75 | -0.1 | – | – |
| w-ego | 4+4 | Zählung | geht Befehle | 55 | 55 | 0 | – | – |
| w-ego | 4+4 | Zählung | geht Dreiecke p95 | 378729 | 377999 | -730.5 | – | – |
| w-ego | 4+4 | Zählung | geht VRAM MB | 111.72 | 111.55 | -0.17 | – | – |
| **w-ego** | 4+4 | | **Urteil** | | | | | **nicht-langsamer** |
| d-ego | 2+2 | steht | fps | 74.6 | 77.05 | 2.45 | 0.54 | nicht langsamer |
| d-ego | 2+2 | steht | Frame p95 ms | 16.8 | 16.8 | 0 | 0 | nicht langsamer |
| d-ego | 2+2 | steht | CPU-Takt p95 ms | 5.4 | 5 | -0.4 | 0.82 | nicht langsamer |
| d-ego | 2+2 | steht | GPU je Bild ms (gpu-bank) | 12.67 | 11.98 | -0.69 | 0.81 | nicht langsamer |
| d-ego | 2+2 | steht | Belegung p95 ms | 7.23 | 6.83 | -0.41 | 0.9 | nicht langsamer |
| d-ego | 2+2 | Zählung | steht Befehle | 59 | 59 | 0 | – | – |
| d-ego | 2+2 | Zählung | steht Dreiecke p95 | 447389 | 446322 | -1067 | – | – |
| d-ego | 2+2 | Zählung | steht VRAM MB | 113.65 | 111.7 | -1.95 | – | – |
| **d-ego** | 2+2 | | **Urteil** | | | | | **nicht-langsamer** |
| stadt | 4+4 | steht | fps | 75 | 74.42 | -0.58 | 2.13 | nicht langsamer |
| stadt | 4+4 | steht | Frame p95 ms | 16.82 | 16.82 | 0 | 0.1 | nicht langsamer |
| stadt | 4+4 | steht | CPU-Takt p95 ms | 7.57 | 8.1 | 0.53 | 1.65 | nicht langsamer |
| stadt | 4+4 | steht | Belegung p95 ms | 11.8 | 12.38 | 0.58 | 2.56 | nicht langsamer |
| stadt | 4+4 | geht | fps | 39.78 | 37.52 | -2.25 | 3.37 | nicht langsamer |
| stadt | 4+4 | geht | Frame p95 ms | 49.98 | 52.1 | 2.12 | 5.85 | nicht langsamer |
| stadt | 4+4 | geht | CPU-Takt p95 ms | 41.73 | 45.6 | 3.87 | 3.7 | LANGSAMER |
| stadt | 4+4 | geht | Belegung p95 ms | 48.21 | 52.19 | 3.98 | 4.7 | nicht langsamer |
| stadt | 4+4 | Zählung | steht Befehle | 53.75 | 53 | -0.75 | – | – |
| stadt | 4+4 | Zählung | steht Dreiecke p95 | 1288854 | 1269224 | -19630 | – | – |
| stadt | 4+4 | Zählung | steht VRAM MB | 159.43 | 158.42 | -1 | – | – |
| stadt | 4+4 | Zählung | geht Befehle | 77.25 | 77.5 | 0.25 | – | – |
| stadt | 4+4 | Zählung | geht Dreiecke p95 | 1956209 | 1962229 | 6020 | – | – |
| stadt | 4+4 | Zählung | geht VRAM MB | 194.97 | 192.8 | -2.17 | – | – |
| **stadt** | 4+4 | | **Urteil** | | | | | **LANGSAMER** |

Instrument je Boot: 3046bc79f (d-ego-A1, d-ego-A2, d-ego-B1, d-ego-B2, stadt-A1, stadt-A2, stadt-A3, stadt-A4, stadt-B1, stadt-B2, stadt-B3, stadt-B4, w-ego-A1, w-ego-A2, w-ego-A3, w-ego-A4, w-ego-B1, w-ego-B2, w-ego-B3, w-ego-B4)

Roh: `bericht/z17-abab/`.
