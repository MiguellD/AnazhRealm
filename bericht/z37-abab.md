# z37-abab — ABAB 9ceeca71 gegen eeaff9d6: nicht-langsamer

GTX 1060, `--echt` 1920×1080, Regler voll, Messplatz-Dienst (zug/messplatz.md). A = eeaff9d6dad7df61e5ace3466fe84375e9496045, B = 9ceeca7169d4980549974ce81a608cacd3ac471f, Instrument aus B. Je Zelle 2+2, verlängert auf 4+4 nur bei Kern-Anschlag oder einer Größe zwischen 1σ und 2σ. Urteil je Größe Δ ≤ max(2σ gepoolt, Auflösung).

| Zelle | n A+B | Gang | Größe | A | B | Δ B − A | 2σ | Urteil |
|---|---|---|---|---|---|---|---|---|
| w-ego | 2+2 | steht | fps | 75.9 | 75.45 | -0.45 | 1.9 | nicht langsamer |
| w-ego | 2+2 | steht | Frame p95 ms | 16.8 | 16.8 | 0 | 0 | nicht langsamer |
| w-ego | 2+2 | steht | CPU-Takt p95 ms | 4.3 | 4.3 | 0 | 0.2 | nicht langsamer |
| w-ego | 2+2 | steht | GPU je Bild ms (gpu-bank) | 12.63 | 12.65 | 0.02 | 0.36 | nicht langsamer |
| w-ego | 2+2 | steht | Belegung p95 ms | 6.27 | 6.17 | -0.1 | 0.32 | nicht langsamer |
| w-ego | 2+2 | geht | fps | 59.55 | 59.85 | 0.3 | 1.58 | nicht langsamer |
| w-ego | 2+2 | geht | Frame p95 ms | 25.05 | 25.05 | 0 | 0.14 | nicht langsamer |
| w-ego | 2+2 | geht | CPU-Takt p95 ms | 18.95 | 18.7 | -0.25 | 1.25 | nicht langsamer |
| w-ego | 2+2 | geht | Belegung p95 ms | 22.03 | 21.97 | -0.06 | 1.09 | nicht langsamer |
| w-ego | 2+2 | Zählung | steht Befehle | 39 | 39 | 0 | – | – |
| w-ego | 2+2 | Zählung | steht Dreiecke p95 | 264601 | 264250 | -351 | – | – |
| w-ego | 2+2 | Zählung | steht VRAM MB | 107.8 | 107.8 | 0 | – | – |
| w-ego | 2+2 | Zählung | geht Befehle | 56 | 56 | 0 | – | – |
| w-ego | 2+2 | Zählung | geht Dreiecke p95 | 379022 | 379568 | 546 | – | – |
| w-ego | 2+2 | Zählung | geht VRAM MB | 111.6 | 111.85 | 0.25 | – | – |
| **w-ego** | 2+2 | | **Urteil** | | | | | **nicht-langsamer** |
| d-ego | 4+4 | steht | fps | 74.3 | 73.53 | -0.77 | 1.01 | nicht langsamer |
| d-ego | 4+4 | steht | Frame p95 ms | 16.8 | 16.8 | 0 | 0 | nicht langsamer |
| d-ego | 4+4 | steht | CPU-Takt p95 ms | 5.03 | 5.13 | 0.1 | 0.19 | nicht langsamer (1σ–2σ) |
| d-ego | 4+4 | steht | GPU je Bild ms (gpu-bank) | 12.89 | 12.87 | -0.03 | 0.48 | nicht langsamer |
| d-ego | 4+4 | steht | Belegung p95 ms | 6.99 | 7.18 | 0.19 | 0.31 | nicht langsamer |
| d-ego | 4+4 | Zählung | steht Befehle | 50 | 50 | 0 | – | – |
| d-ego | 4+4 | Zählung | steht Dreiecke p95 | 358193 | 363432 | 5239 | – | – |
| d-ego | 4+4 | Zählung | steht VRAM MB | 106.65 | 106.25 | -0.4 | – | – |
| **d-ego** | 4+4 | | **Urteil** | | | | | **nicht-langsamer** |
| stadt | 2+2 | steht | fps | 76.7 | 77.95 | 1.25 | 0.61 | nicht langsamer |
| stadt | 2+2 | steht | Frame p95 ms | 16.8 | 16.8 | 0 | 0 | nicht langsamer |
| stadt | 2+2 | steht | CPU-Takt p95 ms | 7.3 | 7.5 | 0.2 | 0.4 | nicht langsamer |
| stadt | 2+2 | steht | Belegung p95 ms | 11.32 | 11.2 | -0.13 | 0.56 | nicht langsamer |
| stadt | 2+2 | geht | fps | 41.4 | 43.7 | 2.3 | 2.16 | nicht langsamer |
| stadt | 2+2 | geht | Frame p95 ms | 41.7 | 41.65 | -0.05 | 0.1 | nicht langsamer |
| stadt | 2+2 | geht | CPU-Takt p95 ms | 39.4 | 37.8 | -1.6 | 2.55 | nicht langsamer |
| stadt | 2+2 | geht | Belegung p95 ms | 42.27 | 40.39 | -1.88 | 3.97 | nicht langsamer |
| stadt | 2+2 | Zählung | steht Befehle | 57 | 57 | 0 | – | – |
| stadt | 2+2 | Zählung | steht Dreiecke p95 | 1236488 | 1235648 | -840 | – | – |
| stadt | 2+2 | Zählung | steht VRAM MB | 173.15 | 173.4 | 0.25 | – | – |
| stadt | 2+2 | Zählung | geht Befehle | 78 | 78 | 0 | – | – |
| stadt | 2+2 | Zählung | geht Dreiecke p95 | 1400442 | 1401147 | 705 | – | – |
| stadt | 2+2 | Zählung | geht VRAM MB | 173.05 | 173.3 | 0.25 | – | – |
| **stadt** | 2+2 | | **Urteil** | | | | | **nicht-langsamer** |

Instrument je Boot: eeaff9d6d (d-ego-A1, d-ego-A2, d-ego-A3, d-ego-A4, d-ego-B1, d-ego-B2, d-ego-B3, d-ego-B4, stadt-A1, stadt-A2, stadt-B1, stadt-B2, w-ego-A1, w-ego-A2, w-ego-B1, w-ego-B2)

Roh: `bericht/z37-abab/`.
