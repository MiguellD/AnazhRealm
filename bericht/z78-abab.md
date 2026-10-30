# z78-abab — ABAB 73bdf938 gegen 715754fc: LANGSAMER

GTX 1060, `--echt` 1920×1080, Regler voll, Messplatz-Dienst (zug/messplatz.md). A = 715754fc0cff89917d8ee933ba23e208bfdd54fb, B = 73bdf9388f22f5c1789e0da5b0c63b6121b045c8, Instrument aus B. Je Zelle 2+2, verlängert auf 4+4 nur bei Kern-Anschlag oder einer Größe zwischen 1σ und 2σ. Urteil je Größe Δ ≤ max(2σ gepoolt, Auflösung).

| Zelle | n A+B | Gang | Größe | A | B | Δ B − A | 2σ | Urteil |
|---|---|---|---|---|---|---|---|---|
| stadt | 4+4 | steht | fps | 77.88 | 73.8 | -4.08 | 1.22 | LANGSAMER |
| stadt | 4+4 | steht | Frame p95 ms | 16.8 | 16.85 | 0.05 | 0.08 | nicht langsamer (1σ–2σ) |
| stadt | 4+4 | steht | CPU-Takt p95 ms | 7.73 | 10.22 | 2.5 | 0.49 | LANGSAMER |
| stadt | 4+4 | steht | Belegung p95 ms | 11.93 | 15.52 | 3.59 | 0.62 | LANGSAMER |
| stadt | 4+4 | geht | fps | 41.33 | 31.63 | -9.7 | 4.56 | LANGSAMER |
| stadt | 4+4 | geht | Frame p95 ms | 45.75 | 62.45 | 16.7 | 13.6 | LANGSAMER |
| stadt | 4+4 | geht | CPU-Takt p95 ms | 39.63 | 54.72 | 15.1 | 12.55 | LANGSAMER |
| stadt | 4+4 | geht | Belegung p95 ms | 43.54 | 60.54 | 17 | 14.73 | LANGSAMER |
| stadt | 4+4 | Zählung | steht Befehle | 58.75 | 56 | -2.75 | – | – |
| stadt | 4+4 | Zählung | steht Dreiecke p95 | 1246109 | 1237477 | -8632 | – | – |
| stadt | 4+4 | Zählung | steht VRAM MB | 173 | 175.2 | 2.2 | – | – |
| stadt | 4+4 | Zählung | geht Befehle | 76 | 89.5 | 13.5 | – | – |
| stadt | 4+4 | Zählung | geht Dreiecke p95 | 1367329 | 1450741 | 83413 | – | – |
| stadt | 4+4 | Zählung | geht VRAM MB | 169.57 | 173.15 | 3.58 | – | – |
| **stadt** | 4+4 | | **Urteil** | | | | | **LANGSAMER** |
| w-ego | 2+2 | steht | fps | 73.4 | 75.4 | 2 | 0.57 | nicht langsamer |
| w-ego | 2+2 | steht | Frame p95 ms | 16.8 | 16.8 | 0 | 0 | nicht langsamer |
| w-ego | 2+2 | steht | CPU-Takt p95 ms | 4.7 | 4.75 | 0.05 | 0.1 | nicht langsamer |
| w-ego | 2+2 | steht | GPU je Bild ms (gpu-bank) | 13.13 | 12.98 | -0.14 | 0.56 | nicht langsamer |
| w-ego | 2+2 | steht | Belegung p95 ms | 6.78 | 6.84 | 0.06 | 0.06 | nicht langsamer |
| w-ego | 2+2 | geht | fps | 58.35 | 58.95 | 0.6 | 0.32 | nicht langsamer |
| w-ego | 2+2 | geht | Frame p95 ms | 25.1 | 25.1 | 0 | 0 | nicht langsamer |
| w-ego | 2+2 | geht | CPU-Takt p95 ms | 19.55 | 19.2 | -0.35 | 0.41 | nicht langsamer |
| w-ego | 2+2 | geht | Belegung p95 ms | 23.2 | 22.47 | -0.73 | 0.47 | nicht langsamer |
| w-ego | 2+2 | Zählung | steht Befehle | 39 | 39 | 0 | – | – |
| w-ego | 2+2 | Zählung | steht Dreiecke p95 | 264553 | 264260 | -293 | – | – |
| w-ego | 2+2 | Zählung | steht VRAM MB | 108.5 | 108.35 | -0.15 | – | – |
| w-ego | 2+2 | Zählung | geht Befehle | 57 | 57 | 0 | – | – |
| w-ego | 2+2 | Zählung | geht Dreiecke p95 | 382518 | 382317 | -200.5 | – | – |
| w-ego | 2+2 | Zählung | geht VRAM MB | 112.15 | 112.25 | 0.1 | – | – |
| **w-ego** | 2+2 | | **Urteil** | | | | | **nicht-langsamer** |

Instrument je Boot: 715754fc0 (stadt-A1, stadt-A2, stadt-A3, stadt-A4, stadt-B1, stadt-B2, stadt-B3, stadt-B4, w-ego-A1, w-ego-A2, w-ego-B1, w-ego-B2)

Roh: `bericht/z78-abab/`.
