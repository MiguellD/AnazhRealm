# z77-abab — ABAB 715754fc gegen 98ef98bb: nicht-langsamer

GTX 1060, `--echt` 1920×1080, Regler voll, Messplatz-Dienst (zug/messplatz.md). A = 98ef98bb5eac304c23b97c2c8d1e6dd6ebb6ff7f, B = 715754fc0cff89917d8ee933ba23e208bfdd54fb, Instrument aus B. Je Zelle 2+2, verlängert auf 4+4 nur bei Kern-Anschlag oder einer Größe zwischen 1σ und 2σ. Urteil je Größe Δ ≤ max(2σ gepoolt, Auflösung).

| Zelle | n A+B | Gang | Größe | A | B | Δ B − A | 2σ | Urteil |
|---|---|---|---|---|---|---|---|---|
| stadt | 4+4 | steht | fps | 78.6 | 78.53 | -0.08 | 1.25 | nicht langsamer |
| stadt | 4+4 | steht | Frame p95 ms | 16.8 | 16.8 | 0 | 0 | nicht langsamer |
| stadt | 4+4 | steht | CPU-Takt p95 ms | 7.85 | 7.65 | -0.2 | 1.19 | nicht langsamer |
| stadt | 4+4 | steht | Belegung p95 ms | 12.08 | 11.54 | -0.55 | 1.69 | nicht langsamer |
| stadt | 4+4 | geht | fps | 44.55 | 42.35 | -2.2 | 5.63 | nicht langsamer |
| stadt | 4+4 | geht | Frame p95 ms | 37.5 | 41.68 | 4.18 | 6.7 | nicht langsamer (1σ–2σ) |
| stadt | 4+4 | geht | CPU-Takt p95 ms | 34.2 | 38.55 | 4.35 | 5.11 | nicht langsamer (1σ–2σ) |
| stadt | 4+4 | geht | Belegung p95 ms | 37.02 | 41.33 | 4.31 | 5.22 | nicht langsamer |
| stadt | 4+4 | Zählung | steht Befehle | 58.25 | 58.75 | 0.5 | – | – |
| stadt | 4+4 | Zählung | steht Dreiecke p95 | 1247691 | 1246135 | -1556 | – | – |
| stadt | 4+4 | Zählung | steht VRAM MB | 172.82 | 172.75 | -0.07 | – | – |
| stadt | 4+4 | Zählung | geht Befehle | 74.25 | 76 | 1.75 | – | – |
| stadt | 4+4 | Zählung | geht Dreiecke p95 | 1351661 | 1367068 | 15408 | – | – |
| stadt | 4+4 | Zählung | geht VRAM MB | 172.25 | 170.78 | -1.47 | – | – |
| **stadt** | 4+4 | | **Urteil** | | | | | **nicht-langsamer** |
| w-ego | 4+4 | steht | fps | 75.52 | 75.38 | -0.15 | 1.95 | nicht langsamer |
| w-ego | 4+4 | steht | Frame p95 ms | 16.8 | 16.8 | 0 | 0 | nicht langsamer |
| w-ego | 4+4 | steht | CPU-Takt p95 ms | 4.47 | 4.53 | 0.05 | 0.71 | nicht langsamer |
| w-ego | 4+4 | steht | GPU je Bild ms (gpu-bank) | 12.79 | 12.76 | -0.02 | 0.71 | nicht langsamer |
| w-ego | 4+4 | steht | Belegung p95 ms | 6.43 | 6.46 | 0.04 | 0.78 | nicht langsamer |
| w-ego | 4+4 | geht | fps | 60.37 | 59.7 | -0.67 | 1.2 | nicht langsamer |
| w-ego | 4+4 | geht | Frame p95 ms | 25.08 | 25.08 | 0 | 0.1 | nicht langsamer |
| w-ego | 4+4 | geht | CPU-Takt p95 ms | 17.68 | 18.63 | 0.95 | 1.23 | nicht langsamer (1σ–2σ) |
| w-ego | 4+4 | geht | Belegung p95 ms | 21.56 | 22.13 | 0.57 | 0.98 | nicht langsamer |
| w-ego | 4+4 | Zählung | steht Befehle | 39 | 39 | 0 | – | – |
| w-ego | 4+4 | Zählung | steht Dreiecke p95 | 264244 | 264543 | 299.75 | – | – |
| w-ego | 4+4 | Zählung | steht VRAM MB | 108.28 | 108.35 | 0.07 | – | – |
| w-ego | 4+4 | Zählung | geht Befehle | 57 | 57 | 0 | – | – |
| w-ego | 4+4 | Zählung | geht Dreiecke p95 | 381707 | 382925 | 1218 | – | – |
| w-ego | 4+4 | Zählung | geht VRAM MB | 112.13 | 112.13 | 0 | – | – |
| **w-ego** | 4+4 | | **Urteil** | | | | | **nicht-langsamer** |

Instrument je Boot: 98ef98bb5 (stadt-A1, stadt-A2, stadt-A3, stadt-A4, stadt-B1, stadt-B2, stadt-B3, stadt-B4, w-ego-A1, w-ego-A2, w-ego-A3, w-ego-A4, w-ego-B1, w-ego-B2, w-ego-B3, w-ego-B4)

Roh: `bericht/z77-abab/`.
