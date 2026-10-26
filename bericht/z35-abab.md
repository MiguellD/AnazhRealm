# z35-abab — ABAB 8dff8f15 gegen 83df2052: LANGSAMER

GTX 1060, `--echt` 1920×1080, Regler voll, Messplatz-Dienst (zug/messplatz.md). A = 83df2052d84b370158b28048ca90fb5f5f2ab30f, B = 8dff8f1545ebe3abd917982789cd8f008d250224, Instrument aus B. Je Zelle 2+2, verlängert auf 4+4 nur bei Kern-Anschlag oder einer Größe zwischen 1σ und 2σ. Urteil je Größe Δ ≤ max(2σ gepoolt, Auflösung).

| Zelle | n A+B | Gang | Größe | A | B | Δ B − A | 2σ | Urteil |
|---|---|---|---|---|---|---|---|---|
| w-ego | 4+4 | steht | fps | 75.15 | 75.38 | 0.23 | 2.39 | nicht langsamer |
| w-ego | 4+4 | steht | Frame p95 ms | 16.8 | 16.8 | 0 | 0 | nicht langsamer |
| w-ego | 4+4 | steht | CPU-Takt p95 ms | 4.75 | 4.35 | -0.4 | 1.54 | nicht langsamer |
| w-ego | 4+4 | steht | GPU je Bild ms (gpu-bank) | 12.94 | 12.95 | 0 | 1.19 | nicht langsamer |
| w-ego | 4+4 | steht | Belegung p95 ms | 6.74 | 6.23 | -0.51 | 1.93 | nicht langsamer |
| w-ego | 4+4 | geht | fps | 59.15 | 59 | -0.15 | 4.38 | nicht langsamer |
| w-ego | 4+4 | geht | Frame p95 ms | 25.1 | 25.1 | 0 | 0 | nicht langsamer |
| w-ego | 4+4 | geht | CPU-Takt p95 ms | 19.67 | 20.25 | 0.58 | 4.17 | nicht langsamer |
| w-ego | 4+4 | geht | Belegung p95 ms | 22.57 | 22.86 | 0.28 | 2.54 | nicht langsamer |
| w-ego | 4+4 | Zählung | steht Befehle | 39 | 39 | 0 | – | – |
| w-ego | 4+4 | Zählung | steht Dreiecke p95 | 268057 | 268063 | 6.5 | – | – |
| w-ego | 4+4 | Zählung | steht VRAM MB | 106.48 | 106.42 | -0.05 | – | – |
| w-ego | 4+4 | Zählung | geht Befehle | 56 | 56 | 0 | – | – |
| w-ego | 4+4 | Zählung | geht Dreiecke p95 | 384039 | 388062 | 4023 | – | – |
| w-ego | 4+4 | Zählung | geht VRAM MB | 110.28 | 110.22 | -0.05 | – | – |
| **w-ego** | 4+4 | | **Urteil** | | | | | **nicht-langsamer** |
| d-ego | 2+2 | steht | fps | 74.15 | 74.55 | 0.4 | 1.3 | nicht langsamer |
| d-ego | 2+2 | steht | Frame p95 ms | 16.8 | 16.8 | 0 | 0 | nicht langsamer |
| d-ego | 2+2 | steht | CPU-Takt p95 ms | 4.9 | 5 | 0.1 | 0.72 | nicht langsamer |
| d-ego | 2+2 | steht | GPU je Bild ms (gpu-bank) | 13.04 | 12.62 | -0.43 | 0.44 | nicht langsamer |
| d-ego | 2+2 | steht | Belegung p95 ms | 6.77 | 6.97 | 0.21 | 0.91 | nicht langsamer |
| d-ego | 2+2 | Zählung | steht Befehle | 50 | 50 | 0 | – | – |
| d-ego | 2+2 | Zählung | steht Dreiecke p95 | 358220 | 358203 | -17 | – | – |
| d-ego | 2+2 | Zählung | steht VRAM MB | 106.85 | 106.55 | -0.3 | – | – |
| **d-ego** | 2+2 | | **Urteil** | | | | | **nicht-langsamer** |
| stadt | 4+4 | steht | fps | 51.18 | 52.52 | 1.35 | 5.92 | nicht langsamer |
| stadt | 4+4 | steht | Frame p95 ms | 37.5 | 35.42 | -2.08 | 8.93 | nicht langsamer |
| stadt | 4+4 | steht | CPU-Takt p95 ms | 31.07 | 29.7 | -1.38 | 5.82 | nicht langsamer |
| stadt | 4+4 | steht | Belegung p95 ms | 36.76 | 35.48 | -1.28 | 6.47 | nicht langsamer |
| stadt | 4+4 | geht | fps | 25.02 | 23.68 | -1.35 | 1.57 | nicht langsamer |
| stadt | 4+4 | geht | Frame p95 ms | 93.73 | 108.4 | 14.67 | 11.21 | LANGSAMER |
| stadt | 4+4 | geht | CPU-Takt p95 ms | 83.93 | 98.53 | 14.6 | 9.19 | LANGSAMER |
| stadt | 4+4 | geht | Belegung p95 ms | 91.1 | 108.21 | 17.11 | 10.07 | LANGSAMER |
| stadt | 4+4 | Zählung | steht Befehle | 42.5 | 42.75 | 0.25 | – | – |
| stadt | 4+4 | Zählung | steht Dreiecke p95 | 381441 | 382807 | 1367 | – | – |
| stadt | 4+4 | Zählung | steht VRAM MB | 122.92 | 120.95 | -1.97 | – | – |
| stadt | 4+4 | Zählung | geht Befehle | 77 | 77.75 | 0.75 | – | – |
| stadt | 4+4 | Zählung | geht Dreiecke p95 | 1896045 | 1890209 | -5836 | – | – |
| stadt | 4+4 | Zählung | geht VRAM MB | 197.53 | 180.1 | -17.43 | – | – |
| **stadt** | 4+4 | | **Urteil** | | | | | **LANGSAMER** |

Instrument je Boot: 83df2052d (d-ego-A1, d-ego-A2, d-ego-B1, d-ego-B2, stadt-A1, stadt-A2, stadt-A3, stadt-A4, stadt-B1, stadt-B2, stadt-B3, stadt-B4, w-ego-A1, w-ego-A2, w-ego-A3, w-ego-A4, w-ego-B1, w-ego-B2, w-ego-B3, w-ego-B4)

Roh: `bericht/z35-abab/`.
