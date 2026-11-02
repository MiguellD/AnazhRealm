# z158-abab — ABAB 6a571e3b gegen 6d6a8336: LANGSAMER

GTX 1060, `--echt` 1920×1080, Regler voll, Messplatz-Dienst (zug/messplatz.md). A = 6d6a8336a11149456ca4edcab3c9c550a6b11f01, B = 6a571e3b98934cbc73b85e217f7fa69b080d415a, Instrument aus B. Je Zelle 2+2, verlängert auf 4+4 nur bei Kern-Anschlag oder einer Größe zwischen 1σ und 2σ. Urteil je Größe Δ ≤ max(2σ gepoolt, Auflösung).

| Zelle | n A+B | Gang | Größe | A | B | Δ B − A | 2σ | Urteil |
|---|---|---|---|---|---|---|---|---|
| w-ego | 4+4 | steht | fps | 58.35 | 57.88 | -0.47 | 1.52 | nicht langsamer |
| w-ego | 4+4 | steht | Frame p95 ms | 23.2 | 23.02 | -0.18 | 7.63 | nicht langsamer |
| w-ego | 4+4 | steht | CPU-Takt p95 ms | 7.2 | 7.15 | -0.05 | 0.73 | nicht langsamer |
| w-ego | 4+4 | steht | GPU je Bild ms (gpu-bank) | 16.02 | 16.09 | 0.08 | 0.45 | nicht langsamer |
| w-ego | 4+4 | steht | Belegung p95 ms | 11.99 | 12.02 | 0.04 | 1.32 | nicht langsamer |
| w-ego | 4+4 | geht | fps | 50.08 | 49.6 | -0.48 | 0.55 | nicht langsamer |
| w-ego | 4+4 | geht | Frame p95 ms | 33.15 | 31.2 | -1.95 | 5.67 | nicht langsamer |
| w-ego | 4+4 | geht | CPU-Takt p95 ms | 21.88 | 22.48 | 0.6 | 1.03 | nicht langsamer (1σ–2σ) |
| w-ego | 4+4 | geht | Belegung p95 ms | 26.09 | 26.5 | 0.41 | 0.88 | nicht langsamer |
| w-ego | 4+4 | Zählung | steht Befehle | 43 | 43 | 0 | – | – |
| w-ego | 4+4 | Zählung | steht Dreiecke p95 | 316661 | 311948 | -4713 | – | – |
| w-ego | 4+4 | Zählung | steht VRAM MB | 121.72 | 120.32 | -1.4 | – | – |
| w-ego | 4+4 | Zählung | geht Befehle | 59 | 59 | 0 | – | – |
| w-ego | 4+4 | Zählung | geht Dreiecke p95 | 417026 | 411202 | -5824 | – | – |
| w-ego | 4+4 | Zählung | geht VRAM MB | 127.45 | 126.35 | -1.1 | – | – |
| **w-ego** | 4+4 | | **Urteil** | | | | | **nicht-langsamer** |
| stadt | 4+4 | steht | fps | 68.25 | 67.15 | -1.1 | 1.51 | nicht langsamer |
| stadt | 4+4 | steht | Frame p95 ms | 22.95 | 25 | 2.05 | 5.61 | nicht langsamer |
| stadt | 4+4 | steht | CPU-Takt p95 ms | 10.23 | 10.85 | 0.62 | 0.84 | nicht langsamer (1σ–2σ) |
| stadt | 4+4 | steht | Belegung p95 ms | 16.06 | 16.96 | 0.9 | 1.57 | nicht langsamer |
| stadt | 4+4 | geht | fps | 34.6 | 27.48 | -7.12 | 1.53 | LANGSAMER |
| stadt | 4+4 | geht | Frame p95 ms | 50.02 | 54.17 | 4.15 | 6.66 | nicht langsamer (1σ–2σ) |
| stadt | 4+4 | geht | CPU-Takt p95 ms | 44.13 | 47.45 | 3.32 | 2.62 | LANGSAMER |
| stadt | 4+4 | geht | Belegung p95 ms | 50.41 | 54.02 | 3.62 | 5.3 | nicht langsamer |
| stadt | 4+4 | Zählung | steht Befehle | 62.75 | 63 | 0.25 | – | – |
| stadt | 4+4 | Zählung | steht Dreiecke p95 | 1277716 | 1304505 | 26789 | – | – |
| stadt | 4+4 | Zählung | steht VRAM MB | 191.72 | 189.8 | -1.93 | – | – |
| stadt | 4+4 | Zählung | geht Befehle | 96 | 84 | -12 | – | – |
| stadt | 4+4 | Zählung | geht Dreiecke p95 | 1432123 | 1345354 | -86769 | – | – |
| stadt | 4+4 | Zählung | geht VRAM MB | 203.53 | 215.07 | 11.55 | – | – |
| **stadt** | 4+4 | | **Urteil** | | | | | **LANGSAMER** |

Instrument je Boot: 6d6a8336a (stadt-A1, stadt-A2, stadt-A3, stadt-A4, stadt-B1, stadt-B2, stadt-B3, stadt-B4, w-ego-A1, w-ego-A2, w-ego-A3, w-ego-A4, w-ego-B1, w-ego-B2, w-ego-B3, w-ego-B4)

Roh: `bericht/z158-abab/`.
