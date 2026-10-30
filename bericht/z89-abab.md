# z89-abab — ABAB e9ebd232 gegen 379e5f56: LANGSAMER

GTX 1060, `--echt` 1920×1080, Regler voll, Messplatz-Dienst (zug/messplatz.md). A = 379e5f56ca38fd462a546925d5af562b716d5015, B = e9ebd232eef40f22a7f5f5136c981f2334470b33, Instrument aus B. Je Zelle 2+2, verlängert auf 4+4 nur bei Kern-Anschlag oder einer Größe zwischen 1σ und 2σ. Urteil je Größe Δ ≤ max(2σ gepoolt, Auflösung).

| Zelle | n A+B | Gang | Größe | A | B | Δ B − A | 2σ | Urteil |
|---|---|---|---|---|---|---|---|---|
| stadt | 4+4 | steht | fps | 68.33 | 66.13 | -2.2 | 2.79 | nicht langsamer |
| stadt | 4+4 | steht | Frame p95 ms | 24.98 | 25 | 0.02 | 0.07 | nicht langsamer |
| stadt | 4+4 | steht | CPU-Takt p95 ms | 11.28 | 11.6 | 0.32 | 2.23 | nicht langsamer |
| stadt | 4+4 | steht | Belegung p95 ms | 17.74 | 18.5 | 0.76 | 2.81 | nicht langsamer |
| stadt | 4+4 | geht | fps | 33.92 | 31.4 | -2.52 | 5.05 | nicht langsamer |
| stadt | 4+4 | geht | Frame p95 ms | 56.25 | 64.53 | 8.27 | 12.56 | nicht langsamer (1σ–2σ) |
| stadt | 4+4 | geht | CPU-Takt p95 ms | 49.52 | 54.58 | 5.05 | 10.72 | nicht langsamer |
| stadt | 4+4 | geht | Belegung p95 ms | 55.33 | 61.69 | 6.36 | 10.7 | nicht langsamer |
| stadt | 4+4 | Zählung | steht Befehle | 60.5 | 62.5 | 2 | – | – |
| stadt | 4+4 | Zählung | steht Dreiecke p95 | 1281833 | 1291577 | 9744 | – | – |
| stadt | 4+4 | Zählung | steht VRAM MB | 180.57 | 182.07 | 1.5 | – | – |
| stadt | 4+4 | Zählung | geht Befehle | 84.25 | 85 | 0.75 | – | – |
| stadt | 4+4 | Zählung | geht Dreiecke p95 | 1383397 | 1383524 | 127.5 | – | – |
| stadt | 4+4 | Zählung | geht VRAM MB | 202.15 | 227.52 | 25.37 | – | – |
| **stadt** | 4+4 | | **Urteil** | | | | | **nicht-langsamer** |
| w-ego | 4+4 | steht | fps | 69.15 | 65.83 | -3.33 | 1.56 | LANGSAMER |
| w-ego | 4+4 | steht | Frame p95 ms | 16.8 | 16.8 | 0 | 0 | nicht langsamer |
| w-ego | 4+4 | steht | CPU-Takt p95 ms | 5.45 | 5.65 | 0.2 | 0.31 | nicht langsamer (1σ–2σ) |
| w-ego | 4+4 | steht | GPU je Bild ms (gpu-bank) | 14.04 | 14.66 | 0.62 | 0.52 | LANGSAMER |
| w-ego | 4+4 | steht | Belegung p95 ms | 8.06 | 8.37 | 0.3 | 0.25 | LANGSAMER |
| w-ego | 4+4 | geht | fps | 56.8 | 55.02 | -1.77 | 0.6 | LANGSAMER |
| w-ego | 4+4 | geht | Frame p95 ms | 25.1 | 25.2 | 0.1 | 0.12 | nicht langsamer (1σ–2σ) |
| w-ego | 4+4 | geht | CPU-Takt p95 ms | 18.4 | 18.77 | 0.38 | 0.68 | nicht langsamer (1σ–2σ) |
| w-ego | 4+4 | geht | Belegung p95 ms | 22.36 | 22.98 | 0.62 | 0.44 | LANGSAMER |
| w-ego | 4+4 | Zählung | steht Befehle | 40 | 41 | 1 | – | – |
| w-ego | 4+4 | Zählung | steht Dreiecke p95 | 261300 | 261447 | 147.25 | – | – |
| w-ego | 4+4 | Zählung | steht VRAM MB | 112.83 | 117.57 | 4.75 | – | – |
| w-ego | 4+4 | Zählung | geht Befehle | 57 | 58 | 1 | – | – |
| w-ego | 4+4 | Zählung | geht Dreiecke p95 | 376691 | 383802 | 7111 | – | – |
| w-ego | 4+4 | Zählung | geht VRAM MB | 116.42 | 122.28 | 5.85 | – | – |
| **w-ego** | 4+4 | | **Urteil** | | | | | **LANGSAMER** |

Instrument je Boot: 379e5f56c (stadt-A1, stadt-A2, stadt-A3, stadt-A4, stadt-B1, stadt-B2, stadt-B3, stadt-B4, w-ego-A1, w-ego-A2, w-ego-A3, w-ego-A4, w-ego-B1, w-ego-B2, w-ego-B3, w-ego-B4)

Roh: `bericht/z89-abab/`.
