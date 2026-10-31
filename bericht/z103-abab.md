# z103-abab — ABAB cd88897e gegen 5e9a3bcc: nicht-langsamer

GTX 1060, `--echt` 1920×1080, Regler voll, Messplatz-Dienst (zug/messplatz.md). A = 5e9a3bccf80eebcbb57c78c3ba4f7411e1dfcdbf, B = cd88897ec24349d848564108127d7bd81475b7ef, Instrument aus B. Je Zelle 2+2, verlängert auf 4+4 nur bei Kern-Anschlag oder einer Größe zwischen 1σ und 2σ. Urteil je Größe Δ ≤ max(2σ gepoolt, Auflösung).

| Zelle | n A+B | Gang | Größe | A | B | Δ B − A | 2σ | Urteil |
|---|---|---|---|---|---|---|---|---|
| stadt | 4+4 | steht | fps | 66.7 | 66.45 | -0.25 | 2.03 | nicht langsamer |
| stadt | 4+4 | steht | Frame p95 ms | 25 | 25 | 0 | 0 | nicht langsamer |
| stadt | 4+4 | steht | CPU-Takt p95 ms | 11.18 | 11.45 | 0.27 | 0.73 | nicht langsamer |
| stadt | 4+4 | steht | Belegung p95 ms | 18.13 | 18.35 | 0.22 | 1.36 | nicht langsamer |
| stadt | 4+4 | geht | fps | 33.65 | 33.63 | -0.02 | 3.44 | nicht langsamer |
| stadt | 4+4 | geht | Frame p95 ms | 54.23 | 56.25 | 2.02 | 8.89 | nicht langsamer |
| stadt | 4+4 | geht | CPU-Takt p95 ms | 49.68 | 49.35 | -0.32 | 4.67 | nicht langsamer |
| stadt | 4+4 | geht | Belegung p95 ms | 55.76 | 57.51 | 1.75 | 7.21 | nicht langsamer |
| stadt | 4+4 | Zählung | steht Befehle | 61.75 | 61.5 | -0.25 | – | – |
| stadt | 4+4 | Zählung | steht Dreiecke p95 | 1294179 | 1290007 | -4172 | – | – |
| stadt | 4+4 | Zählung | steht VRAM MB | 188.32 | 189.15 | 0.82 | – | – |
| stadt | 4+4 | Zählung | geht Befehle | 95.75 | 85 | -10.75 | – | – |
| stadt | 4+4 | Zählung | geht Dreiecke p95 | 1454994 | 1389368 | -65626 | – | – |
| stadt | 4+4 | Zählung | geht VRAM MB | 200.75 | 202.55 | 1.8 | – | – |
| **stadt** | 4+4 | | **Urteil** | | | | | **nicht-langsamer** |
| w-ego | 4+4 | steht | fps | 66.6 | 65.25 | -1.35 | 1.55 | nicht langsamer |
| w-ego | 4+4 | steht | Frame p95 ms | 16.8 | 16.8 | 0 | 0 | nicht langsamer |
| w-ego | 4+4 | steht | CPU-Takt p95 ms | 5.72 | 5.8 | 0.08 | 0.24 | nicht langsamer |
| w-ego | 4+4 | steht | GPU je Bild ms (gpu-bank) | 14.58 | 14.84 | 0.26 | 0.3 | nicht langsamer (1σ–2σ) |
| w-ego | 4+4 | steht | Belegung p95 ms | 8.46 | 8.62 | 0.16 | 0.29 | nicht langsamer |
| w-ego | 4+4 | geht | fps | 55.15 | 55.02 | -0.13 | 1.03 | nicht langsamer |
| w-ego | 4+4 | geht | Frame p95 ms | 25.13 | 25.13 | 0 | 0.1 | nicht langsamer |
| w-ego | 4+4 | geht | CPU-Takt p95 ms | 18.68 | 18.48 | -0.2 | 1.31 | nicht langsamer |
| w-ego | 4+4 | geht | Belegung p95 ms | 22.99 | 23.18 | 0.19 | 0.86 | nicht langsamer |
| w-ego | 4+4 | Zählung | steht Befehle | 41 | 41 | 0 | – | – |
| w-ego | 4+4 | Zählung | steht Dreiecke p95 | 262003 | 262031 | 27.75 | – | – |
| w-ego | 4+4 | Zählung | steht VRAM MB | 117.7 | 117.65 | -0.05 | – | – |
| w-ego | 4+4 | Zählung | geht Befehle | 58 | 58 | 0 | – | – |
| w-ego | 4+4 | Zählung | geht Dreiecke p95 | 389743 | 387020 | -2723 | – | – |
| w-ego | 4+4 | Zählung | geht VRAM MB | 122.17 | 122.28 | 0.1 | – | – |
| **w-ego** | 4+4 | | **Urteil** | | | | | **nicht-langsamer** |

Instrument je Boot: 5e9a3bccf (stadt-A1, stadt-A2, stadt-A3, stadt-A4, stadt-B1, stadt-B2, stadt-B3, stadt-B4, w-ego-A1, w-ego-A2, w-ego-A3, w-ego-A4, w-ego-B1, w-ego-B2, w-ego-B3, w-ego-B4)

Roh: `bericht/z103-abab/`.
