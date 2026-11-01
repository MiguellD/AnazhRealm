# z125-abab — ABAB 9e40c93c gegen eeb5d2bf: nicht-langsamer

GTX 1060, `--echt` 1920×1080, Regler voll, Messplatz-Dienst (zug/messplatz.md). A = eeb5d2bfbcdae181388a990d13c434cd67b923a0, B = 9e40c93c35c13e0c3ca6bf23542256a8b3aba94e, Instrument aus B. Je Zelle 2+2, verlängert auf 4+4 nur bei Kern-Anschlag oder einer Größe zwischen 1σ und 2σ. Urteil je Größe Δ ≤ max(2σ gepoolt, Auflösung).

| Zelle | n A+B | Gang | Größe | A | B | Δ B − A | 2σ | Urteil |
|---|---|---|---|---|---|---|---|---|
| w-ego | 4+4 | steht | fps | 49.17 | 48.65 | -0.52 | 1.44 | nicht langsamer |
| w-ego | 4+4 | steht | Frame p95 ms | 25.15 | 25.1 | -0.05 | 0.08 | nicht langsamer |
| w-ego | 4+4 | steht | CPU-Takt p95 ms | 5.73 | 6.05 | 0.33 | 1.57 | nicht langsamer |
| w-ego | 4+4 | steht | GPU je Bild ms (gpu-bank) | 19.59 | 19.87 | 0.29 | 0.72 | nicht langsamer |
| w-ego | 4+4 | steht | Belegung p95 ms | 9.97 | 10.48 | 0.51 | 2.88 | nicht langsamer |
| w-ego | 4+4 | geht | fps | 44.68 | 43.43 | -1.25 | 1.99 | nicht langsamer |
| w-ego | 4+4 | geht | Frame p95 ms | 33.4 | 33.4 | 0 | 0 | nicht langsamer |
| w-ego | 4+4 | geht | CPU-Takt p95 ms | 18.32 | 21.43 | 3.1 | 5.71 | nicht langsamer (1σ–2σ) |
| w-ego | 4+4 | geht | Belegung p95 ms | 26.65 | 28.45 | 1.8 | 3.3 | nicht langsamer |
| w-ego | 4+4 | Zählung | steht Befehle | 43 | 43 | 0 | – | – |
| w-ego | 4+4 | Zählung | steht Dreiecke p95 | 299655 | 299004 | -651 | – | – |
| w-ego | 4+4 | Zählung | steht VRAM MB | 119.28 | 119.08 | -0.2 | – | – |
| w-ego | 4+4 | Zählung | geht Befehle | 59.25 | 59 | -0.25 | – | – |
| w-ego | 4+4 | Zählung | geht Dreiecke p95 | 404633 | 403167 | -1466 | – | – |
| w-ego | 4+4 | Zählung | geht VRAM MB | 124.93 | 124.78 | -0.15 | – | – |
| **w-ego** | 4+4 | | **Urteil** | | | | | **nicht-langsamer** |
| stadt | 4+4 | steht | fps | 58.47 | 58.15 | -0.32 | 0.49 | nicht langsamer |
| stadt | 4+4 | steht | Frame p95 ms | 25 | 25.08 | 0.08 | 0.07 | nicht langsamer |
| stadt | 4+4 | steht | CPU-Takt p95 ms | 10.85 | 10.85 | 0 | 0.35 | nicht langsamer |
| stadt | 4+4 | steht | Belegung p95 ms | 17.83 | 18.01 | 0.18 | 0.69 | nicht langsamer |
| stadt | 4+4 | geht | fps | 34.42 | 34.3 | -0.13 | 1.25 | nicht langsamer |
| stadt | 4+4 | geht | Frame p95 ms | 50 | 50 | 0 | 0 | nicht langsamer |
| stadt | 4+4 | geht | CPU-Takt p95 ms | 44.03 | 43.38 | -0.65 | 2.05 | nicht langsamer |
| stadt | 4+4 | geht | Belegung p95 ms | 49.16 | 48.42 | -0.74 | 2.45 | nicht langsamer |
| stadt | 4+4 | Zählung | steht Befehle | 64 | 64 | 0 | – | – |
| stadt | 4+4 | Zählung | steht Dreiecke p95 | 1305740 | 1308004 | 2265 | – | – |
| stadt | 4+4 | Zählung | steht VRAM MB | 195.02 | 195.22 | 0.2 | – | – |
| stadt | 4+4 | Zählung | geht Befehle | 93.75 | 92.75 | -1 | – | – |
| stadt | 4+4 | Zählung | geht Dreiecke p95 | 1449733 | 1441155 | -8578 | – | – |
| stadt | 4+4 | Zählung | geht VRAM MB | 203.85 | 194.4 | -9.45 | – | – |
| **stadt** | 4+4 | | **Urteil** | | | | | **nicht-langsamer** |

Instrument je Boot: eeb5d2bfb (stadt-A1, stadt-A2, stadt-A3, stadt-A4, stadt-B1, stadt-B2, stadt-B3, stadt-B4, w-ego-A1, w-ego-A2, w-ego-A3, w-ego-A4, w-ego-B1, w-ego-B2, w-ego-B3, w-ego-B4)

Roh: `bericht/z125-abab/`.
