# z36-abab — ABAB eeaff9d6 gegen 8dff8f15: LANGSAMER

GTX 1060, `--echt` 1920×1080, Regler voll, Messplatz-Dienst (zug/messplatz.md). A = 8dff8f1545ebe3abd917982789cd8f008d250224, B = eeaff9d6dad7df61e5ace3466fe84375e9496045, Instrument aus B. Je Zelle 2+2, verlängert auf 4+4 nur bei Kern-Anschlag oder einer Größe zwischen 1σ und 2σ. Urteil je Größe Δ ≤ max(2σ gepoolt, Auflösung).

| Zelle | n A+B | Gang | Größe | A | B | Δ B − A | 2σ | Urteil |
|---|---|---|---|---|---|---|---|---|
| w-ego | 4+4 | steht | fps | 75.3 | 75.13 | -0.17 | 1.5 | nicht langsamer |
| w-ego | 4+4 | steht | Frame p95 ms | 16.8 | 16.8 | 0 | 0 | nicht langsamer |
| w-ego | 4+4 | steht | CPU-Takt p95 ms | 4.28 | 4.58 | 0.3 | 0.4 | nicht langsamer (1σ–2σ) |
| w-ego | 4+4 | steht | GPU je Bild ms (gpu-bank) | 12.96 | 12.68 | -0.27 | 0.42 | nicht langsamer |
| w-ego | 4+4 | steht | Belegung p95 ms | 6.12 | 6.47 | 0.36 | 0.31 | LANGSAMER |
| w-ego | 4+4 | geht | fps | 59.15 | 58.9 | -0.25 | 1.02 | nicht langsamer |
| w-ego | 4+4 | geht | Frame p95 ms | 25.08 | 25.1 | 0.02 | 0.07 | nicht langsamer |
| w-ego | 4+4 | geht | CPU-Takt p95 ms | 19.13 | 19.52 | 0.4 | 1.03 | nicht langsamer |
| w-ego | 4+4 | geht | Belegung p95 ms | 22.05 | 22.62 | 0.57 | 0.67 | nicht langsamer |
| w-ego | 4+4 | Zählung | steht Befehle | 39 | 39 | 0 | – | – |
| w-ego | 4+4 | Zählung | steht Dreiecke p95 | 264498 | 264618 | 120 | – | – |
| w-ego | 4+4 | Zählung | steht VRAM MB | 107.83 | 107.8 | -0.03 | – | – |
| w-ego | 4+4 | Zählung | geht Befehle | 56 | 56 | 0 | – | – |
| w-ego | 4+4 | Zählung | geht Dreiecke p95 | 381683 | 381378 | -304.5 | – | – |
| w-ego | 4+4 | Zählung | geht VRAM MB | 111.85 | 111.55 | -0.3 | – | – |
| **w-ego** | 4+4 | | **Urteil** | | | | | **LANGSAMER** |
| d-ego | 2+2 | steht | fps | 72.55 | 72.55 | 0 | 2.02 | nicht langsamer |
| d-ego | 2+2 | steht | Frame p95 ms | 16.8 | 16.8 | 0 | 0 | nicht langsamer |
| d-ego | 2+2 | steht | CPU-Takt p95 ms | 5.25 | 5.2 | -0.05 | 0.22 | nicht langsamer |
| d-ego | 2+2 | steht | GPU je Bild ms (gpu-bank) | 13.17 | 13.13 | -0.04 | 0.32 | nicht langsamer |
| d-ego | 2+2 | steht | Belegung p95 ms | 7.47 | 7.47 | 0 | 0.37 | nicht langsamer |
| d-ego | 2+2 | Zählung | steht Befehle | 50 | 50 | 0 | – | – |
| d-ego | 2+2 | Zählung | steht Dreiecke p95 | 356967 | 358199 | 1232 | – | – |
| d-ego | 2+2 | Zählung | steht VRAM MB | 106.15 | 106.6 | 0.45 | – | – |
| **d-ego** | 2+2 | | **Urteil** | | | | | **nicht-langsamer** |
| stadt | 2+2 | steht | fps | 48.15 | 50.55 | 2.4 | 0.99 | nicht langsamer |
| stadt | 2+2 | steht | Frame p95 ms | 37.55 | 33.45 | -4.1 | 8.3 | nicht langsamer |
| stadt | 2+2 | steht | CPU-Takt p95 ms | 32.2 | 30.4 | -1.8 | 3.3 | nicht langsamer |
| stadt | 2+2 | steht | Belegung p95 ms | 38.83 | 35.7 | -3.13 | 4.77 | nicht langsamer |
| stadt | 2+2 | geht | fps | 20.5 | 21.1 | 0.6 | 0.82 | nicht langsamer |
| stadt | 2+2 | geht | Frame p95 ms | 116.8 | 116.7 | -0.1 | 0.2 | nicht langsamer |
| stadt | 2+2 | geht | CPU-Takt p95 ms | 108.55 | 109.8 | 1.25 | 3.07 | nicht langsamer |
| stadt | 2+2 | geht | Belegung p95 ms | 120.62 | 117.84 | -2.77 | 9.42 | nicht langsamer |
| stadt | 2+2 | Zählung | steht Befehle | 43 | 43 | 0 | – | – |
| stadt | 2+2 | Zählung | steht Dreiecke p95 | 382276 | 382056 | -219.5 | – | – |
| stadt | 2+2 | Zählung | steht VRAM MB | 120.5 | 122.4 | 1.9 | – | – |
| stadt | 2+2 | Zählung | geht Befehle | 76 | 77 | 1 | – | – |
| stadt | 2+2 | Zählung | geht Dreiecke p95 | 1897078 | 1675756 | -221322 | – | – |
| stadt | 2+2 | Zählung | geht VRAM MB | 147.4 | 186.8 | 39.4 | – | – |
| **stadt** | 2+2 | | **Urteil** | | | | | **nicht-langsamer** |

Instrument je Boot: 8dff8f154 (d-ego-A1, d-ego-A2, d-ego-B1, d-ego-B2, stadt-A1, stadt-A2, stadt-B1, stadt-B2, w-ego-A1, w-ego-A2, w-ego-A3, w-ego-A4, w-ego-B1, w-ego-B2, w-ego-B3, w-ego-B4)

Roh: `bericht/z36-abab/`.
