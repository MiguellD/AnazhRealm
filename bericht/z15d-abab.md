# z15d-abab — ABAB 3d2b3276 gegen 056330d8: LANGSAMER

GTX 1060, `--echt` 1920×1080, Regler voll, Messplatz-Dienst (zug/messplatz.md). A = 056330d8a70fcdc617df8c3ff62ec174c5d33995, B = 3d2b3276b43471f4f38f8859a3c92ed62ca15abc, Instrument aus B. Je Zelle 2+2, verlängert auf 4+4 nur bei Kern-Anschlag oder einer Größe zwischen 1σ und 2σ. Urteil je Größe Δ ≤ max(2σ gepoolt, Auflösung).

| Zelle | n A+B | Gang | Größe | A | B | Δ B − A | 2σ | Urteil |
|---|---|---|---|---|---|---|---|---|
| w-ego | 2+2 | steht | fps | 76.1 | 75.4 | -0.7 | 1.61 | nicht langsamer |
| w-ego | 2+2 | steht | Frame p95 ms | 16.8 | 16.8 | 0 | 0 | nicht langsamer |
| w-ego | 2+2 | steht | CPU-Takt p95 ms | 3.9 | 3.9 | 0 | 0.57 | nicht langsamer |
| w-ego | 2+2 | steht | GPU je Bild ms (gpu-bank) | 12.98 | 13.02 | 0.04 | 0.88 | nicht langsamer |
| w-ego | 2+2 | steht | Belegung p95 ms | 5.57 | 5.68 | 0.11 | 0.58 | nicht langsamer |
| w-ego | 2+2 | geht | fps | 61.1 | 60.4 | -0.7 | 1.65 | nicht langsamer |
| w-ego | 2+2 | geht | Frame p95 ms | 25.1 | 25.1 | 0 | 0 | nicht langsamer |
| w-ego | 2+2 | geht | CPU-Takt p95 ms | 17.1 | 17.55 | 0.45 | 1.32 | nicht langsamer |
| w-ego | 2+2 | geht | Belegung p95 ms | 21.16 | 21.86 | 0.7 | 1.36 | nicht langsamer |
| w-ego | 2+2 | Zählung | steht Befehle | 38 | 38 | 0 | – | – |
| w-ego | 2+2 | Zählung | steht Dreiecke p95 | 263934 | 264032 | 98 | – | – |
| w-ego | 2+2 | Zählung | steht VRAM MB | 107.75 | 107.7 | -0.05 | – | – |
| w-ego | 2+2 | Zählung | geht Befehle | 55 | 55 | 0 | – | – |
| w-ego | 2+2 | Zählung | geht Dreiecke p95 | 377576 | 376253 | -1323 | – | – |
| w-ego | 2+2 | Zählung | geht VRAM MB | 111.8 | 111.5 | -0.3 | – | – |
| **w-ego** | 2+2 | | **Urteil** | | | | | **nicht-langsamer** |
| d-ego | 2+2 | steht | fps | 74.45 | 75.35 | 0.9 | 1.92 | nicht langsamer |
| d-ego | 2+2 | steht | Frame p95 ms | 16.8 | 16.8 | 0 | 0 | nicht langsamer |
| d-ego | 2+2 | steht | CPU-Takt p95 ms | 5.5 | 5.2 | -0.3 | 1.17 | nicht langsamer |
| d-ego | 2+2 | steht | GPU je Bild ms (gpu-bank) | 12.36 | 12.29 | -0.07 | 0.27 | nicht langsamer |
| d-ego | 2+2 | steht | Belegung p95 ms | 7.21 | 6.96 | -0.26 | 1.39 | nicht langsamer |
| d-ego | 2+2 | Zählung | steht Befehle | 60 | 59 | -1 | – | – |
| d-ego | 2+2 | Zählung | steht Dreiecke p95 | 449377 | 435821 | -13556 | – | – |
| d-ego | 2+2 | Zählung | steht VRAM MB | 113 | 112.1 | -0.9 | – | – |
| **d-ego** | 2+2 | | **Urteil** | | | | | **nicht-langsamer** |
| stadt | 4+4 | steht | fps | 78.65 | 77.65 | -1 | 1.47 | nicht langsamer |
| stadt | 4+4 | steht | Frame p95 ms | 16.77 | 16.82 | 0.05 | 0.1 | nicht langsamer (1σ–2σ) |
| stadt | 4+4 | steht | CPU-Takt p95 ms | 6.9 | 8.4 | 1.5 | 1.22 | LANGSAMER |
| stadt | 4+4 | steht | Belegung p95 ms | 10.21 | 12.4 | 2.19 | 1.48 | LANGSAMER |
| stadt | 4+4 | geht | fps | 39.55 | 36.45 | -3.1 | 2.67 | LANGSAMER |
| stadt | 4+4 | geht | Frame p95 ms | 47.9 | 56.2 | 8.3 | 8.27 | LANGSAMER |
| stadt | 4+4 | geht | CPU-Takt p95 ms | 41.08 | 48.2 | 7.13 | 3.92 | LANGSAMER |
| stadt | 4+4 | geht | Belegung p95 ms | 47.06 | 54.77 | 7.71 | 4.87 | LANGSAMER |
| stadt | 4+4 | Zählung | steht Befehle | 44 | 55.75 | 11.75 | – | – |
| stadt | 4+4 | Zählung | steht Dreiecke p95 | 1168692 | 1278003 | 109311 | – | – |
| stadt | 4+4 | Zählung | steht VRAM MB | 148.6 | 156.13 | 7.53 | – | – |
| stadt | 4+4 | Zählung | geht Befehle | 75 | 78 | 3 | – | – |
| stadt | 4+4 | Zählung | geht Dreiecke p95 | 1972795 | 1971340 | -1455 | – | – |
| stadt | 4+4 | Zählung | geht VRAM MB | 195.4 | 203.9 | 8.5 | – | – |
| **stadt** | 4+4 | | **Urteil** | | | | | **LANGSAMER** |

Instrument je Boot: 056330d8a (d-ego-A1, d-ego-A2, d-ego-B1, d-ego-B2, stadt-A1, stadt-A2, stadt-A3, stadt-A4, stadt-B1, stadt-B2, stadt-B3, stadt-B4, w-ego-A1, w-ego-A2, w-ego-B1, w-ego-B2)

Roh: `bericht/z15d-abab/`.
