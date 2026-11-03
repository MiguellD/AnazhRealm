# z164-abab — ABAB 95d7bba1 gegen c5a9a2f5: nicht-langsamer

GTX 1060, `--echt` 1920×1080, Regler voll, Messplatz-Dienst (zug/messplatz.md). A = c5a9a2f565f517a92cbf8ada22cebe9c4df5023d, B = 95d7bba1c91eeea0a0abca9373b6ed53ee6e0adf, Instrument aus B. Je Zelle 2+2, verlängert auf 4+4 nur bei Kern-Anschlag oder einer Größe zwischen 1σ und 2σ. Urteil je Größe Δ ≤ max(2σ gepoolt, Auflösung).

| Zelle | n A+B | Gang | Größe | A | B | Δ B − A | 2σ | Urteil |
|---|---|---|---|---|---|---|---|---|
| w-ego | 4+4 | steht | fps | 57.92 | 57.35 | -0.58 | 1.26 | nicht langsamer |
| w-ego | 4+4 | steht | Frame p95 ms | 23.2 | 25.02 | 1.82 | 5.09 | nicht langsamer |
| w-ego | 4+4 | steht | CPU-Takt p95 ms | 7.75 | 7.75 | 0 | 2.38 | nicht langsamer |
| w-ego | 4+4 | steht | GPU je Bild ms (gpu-bank) | 16.15 | 16.31 | 0.16 | 0.44 | nicht langsamer |
| w-ego | 4+4 | steht | Belegung p95 ms | 12.86 | 12.8 | -0.06 | 4.09 | nicht langsamer |
| w-ego | 4+4 | geht | fps | 48.77 | 48.88 | 0.1 | 3.5 | nicht langsamer |
| w-ego | 4+4 | geht | Frame p95 ms | 28.78 | 32.75 | 3.97 | 6.16 | nicht langsamer (1σ–2σ) |
| w-ego | 4+4 | geht | CPU-Takt p95 ms | 23.22 | 23.1 | -0.12 | 3.9 | nicht langsamer |
| w-ego | 4+4 | geht | Belegung p95 ms | 27.07 | 27.23 | 0.16 | 2.22 | nicht langsamer |
| w-ego | 4+4 | Zählung | steht Befehle | 44 | 44 | 0 | – | – |
| w-ego | 4+4 | Zählung | steht Dreiecke p95 | 312415 | 310161 | -2254 | – | – |
| w-ego | 4+4 | Zählung | steht VRAM MB | 120.5 | 119.85 | -0.65 | – | – |
| w-ego | 4+4 | Zählung | geht Befehle | 60 | 60 | 0 | – | – |
| w-ego | 4+4 | Zählung | geht Dreiecke p95 | 411770 | 410199 | -1571 | – | – |
| w-ego | 4+4 | Zählung | geht VRAM MB | 126.15 | 125.47 | -0.68 | – | – |
| **w-ego** | 4+4 | | **Urteil** | | | | | **nicht-langsamer** |
| stadt | 4+4 | steht | fps | 67.33 | 65.45 | -1.88 | 4.64 | nicht langsamer |
| stadt | 4+4 | steht | Frame p95 ms | 25 | 25.02 | 0.02 | 0.07 | nicht langsamer |
| stadt | 4+4 | steht | CPU-Takt p95 ms | 10.78 | 13.35 | 2.57 | 6.96 | nicht langsamer |
| stadt | 4+4 | steht | Belegung p95 ms | 17.02 | 18.75 | 1.72 | 3.94 | nicht langsamer |
| stadt | 4+4 | geht | fps | 32.7 | 30.7 | -2 | 5.14 | nicht langsamer |
| stadt | 4+4 | geht | Frame p95 ms | 58.28 | 60.38 | 2.1 | 5.87 | nicht langsamer |
| stadt | 4+4 | geht | CPU-Takt p95 ms | 48.4 | 52.52 | 4.13 | 8.72 | nicht langsamer |
| stadt | 4+4 | geht | Belegung p95 ms | 55.75 | 58.56 | 2.81 | 7.53 | nicht langsamer |
| stadt | 4+4 | Zählung | steht Befehle | 64 | 64.5 | 0.5 | – | – |
| stadt | 4+4 | Zählung | steht Dreiecke p95 | 1281129 | 1288652 | 7522 | – | – |
| stadt | 4+4 | Zählung | steht VRAM MB | 191.02 | 190.95 | -0.07 | – | – |
| stadt | 4+4 | Zählung | geht Befehle | 95.25 | 95.75 | 0.5 | – | – |
| stadt | 4+4 | Zählung | geht Dreiecke p95 | 1378458 | 1380902 | 2444 | – | – |
| stadt | 4+4 | Zählung | geht VRAM MB | 209.2 | 196.82 | -12.38 | – | – |
| **stadt** | 4+4 | | **Urteil** | | | | | **nicht-langsamer** |

Instrument je Boot: c5a9a2f56 (stadt-A1, stadt-A2, stadt-A3, stadt-A4, stadt-B1, stadt-B2, stadt-B3, stadt-B4, w-ego-A1, w-ego-A2, w-ego-A3, w-ego-A4, w-ego-B1, w-ego-B2, w-ego-B3, w-ego-B4)

Roh: `bericht/z164-abab/`.
