# z102-abab — ABAB 5e9a3bcc gegen 5443e695: LANGSAMER

GTX 1060, `--echt` 1920×1080, Regler voll, Messplatz-Dienst (zug/messplatz.md). A = 5443e695a11fe753c3f8160920fbe6423e8fef5a, B = 5e9a3bccf80eebcbb57c78c3ba4f7411e1dfcdbf, Instrument aus B. Je Zelle 2+2, verlängert auf 4+4 nur bei Kern-Anschlag oder einer Größe zwischen 1σ und 2σ. Urteil je Größe Δ ≤ max(2σ gepoolt, Auflösung).

| Zelle | n A+B | Gang | Größe | A | B | Δ B − A | 2σ | Urteil |
|---|---|---|---|---|---|---|---|---|
| stadt | 4+4 | steht | fps | 66.7 | 66.2 | -0.5 | 3.15 | nicht langsamer |
| stadt | 4+4 | steht | Frame p95 ms | 24.98 | 25 | 0.02 | 0.07 | nicht langsamer |
| stadt | 4+4 | steht | CPU-Takt p95 ms | 11 | 11.35 | 0.35 | 1.09 | nicht langsamer |
| stadt | 4+4 | steht | Belegung p95 ms | 17.39 | 18.21 | 0.82 | 1.91 | nicht langsamer |
| stadt | 4+4 | geht | fps | 35.85 | 33.45 | -2.4 | 5.08 | nicht langsamer |
| stadt | 4+4 | geht | Frame p95 ms | 52.08 | 56.22 | 4.15 | 12.64 | nicht langsamer |
| stadt | 4+4 | geht | CPU-Takt p95 ms | 45.45 | 49.17 | 3.72 | 8.74 | nicht langsamer |
| stadt | 4+4 | geht | Belegung p95 ms | 51.8 | 54.71 | 2.92 | 7.8 | nicht langsamer |
| stadt | 4+4 | Zählung | steht Befehle | 62 | 62 | 0 | – | – |
| stadt | 4+4 | Zählung | steht Dreiecke p95 | 1298556 | 1293699 | -4857 | – | – |
| stadt | 4+4 | Zählung | steht VRAM MB | 187.22 | 185.88 | -1.35 | – | – |
| stadt | 4+4 | Zählung | geht Befehle | 92 | 95 | 3 | – | – |
| stadt | 4+4 | Zählung | geht Dreiecke p95 | 1430806 | 1444247 | 13441 | – | – |
| stadt | 4+4 | Zählung | geht VRAM MB | 200.45 | 217.1 | 16.65 | – | – |
| **stadt** | 4+4 | | **Urteil** | | | | | **nicht-langsamer** |
| w-ego | 4+4 | steht | fps | 66.2 | 66.32 | 0.13 | 1.7 | nicht langsamer |
| w-ego | 4+4 | steht | Frame p95 ms | 16.8 | 16.8 | 0 | 0 | nicht langsamer |
| w-ego | 4+4 | steht | CPU-Takt p95 ms | 5.5 | 5.82 | 0.32 | 0.31 | LANGSAMER |
| w-ego | 4+4 | steht | GPU je Bild ms (gpu-bank) | 14.57 | 14.54 | -0.04 | 0.4 | nicht langsamer |
| w-ego | 4+4 | steht | Belegung p95 ms | 8.04 | 8.55 | 0.51 | 0.6 | nicht langsamer |
| w-ego | 4+4 | geht | fps | 55.33 | 55.5 | 0.17 | 1.38 | nicht langsamer |
| w-ego | 4+4 | geht | Frame p95 ms | 25.1 | 25.1 | 0 | 0 | nicht langsamer |
| w-ego | 4+4 | geht | CPU-Takt p95 ms | 18.3 | 18.5 | 0.2 | 1.92 | nicht langsamer |
| w-ego | 4+4 | geht | Belegung p95 ms | 22.74 | 22.81 | 0.07 | 1.07 | nicht langsamer |
| w-ego | 4+4 | Zählung | steht Befehle | 41 | 41 | 0 | – | – |
| w-ego | 4+4 | Zählung | steht Dreiecke p95 | 257243 | 261919 | 4676 | – | – |
| w-ego | 4+4 | Zählung | steht VRAM MB | 117.57 | 117.63 | 0.05 | – | – |
| w-ego | 4+4 | Zählung | geht Befehle | 58 | 58 | 0 | – | – |
| w-ego | 4+4 | Zählung | geht Dreiecke p95 | 380387 | 384847 | 4461 | – | – |
| w-ego | 4+4 | Zählung | geht VRAM MB | 122.2 | 122.32 | 0.12 | – | – |
| **w-ego** | 4+4 | | **Urteil** | | | | | **LANGSAMER** |

Instrument je Boot: 5443e695a (stadt-A1, stadt-A2, stadt-A3, stadt-A4, stadt-B1, stadt-B2, stadt-B3, stadt-B4, w-ego-A1, w-ego-A2, w-ego-A3, w-ego-A4, w-ego-B1, w-ego-B2, w-ego-B3, w-ego-B4)

Roh: `bericht/z102-abab/`.
