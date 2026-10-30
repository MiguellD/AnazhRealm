# z87-abab — ABAB 379e5f56 gegen 6b3da705: LANGSAMER

GTX 1060, `--echt` 1920×1080, Regler voll, Messplatz-Dienst (zug/messplatz.md). A = 6b3da705074d6eacd348a192aecbaeb8d2592495, B = 379e5f56ca38fd462a546925d5af562b716d5015, Instrument aus B. Je Zelle 2+2, verlängert auf 4+4 nur bei Kern-Anschlag oder einer Größe zwischen 1σ und 2σ. Urteil je Größe Δ ≤ max(2σ gepoolt, Auflösung).

| Zelle | n A+B | Gang | Größe | A | B | Δ B − A | 2σ | Urteil |
|---|---|---|---|---|---|---|---|---|
| stadt | 4+4 | steht | fps | 69.17 | 68.63 | -0.55 | 2.44 | nicht langsamer |
| stadt | 4+4 | steht | Frame p95 ms | 23.05 | 24.95 | 1.9 | 5.42 | nicht langsamer |
| stadt | 4+4 | steht | CPU-Takt p95 ms | 10.45 | 10.88 | 0.43 | 0.77 | nicht langsamer (1σ–2σ) |
| stadt | 4+4 | steht | Belegung p95 ms | 16.82 | 17.66 | 0.84 | 2.11 | nicht langsamer |
| stadt | 4+4 | geht | fps | 37.1 | 34.58 | -2.52 | 1.74 | LANGSAMER |
| stadt | 4+4 | geht | Frame p95 ms | 45.9 | 56.23 | 10.33 | 8.84 | LANGSAMER |
| stadt | 4+4 | geht | CPU-Takt p95 ms | 43.55 | 48.62 | 5.07 | 4.22 | LANGSAMER |
| stadt | 4+4 | geht | Belegung p95 ms | 47.12 | 53.89 | 6.78 | 4.43 | LANGSAMER |
| stadt | 4+4 | Zählung | steht Befehle | 64.25 | 61.25 | -3 | – | – |
| stadt | 4+4 | Zählung | steht Dreiecke p95 | 1308043 | 1291543 | -16500 | – | – |
| stadt | 4+4 | Zählung | steht VRAM MB | 176.02 | 178.72 | 2.7 | – | – |
| stadt | 4+4 | Zählung | geht Befehle | 78.25 | 83.25 | 5 | – | – |
| stadt | 4+4 | Zählung | geht Dreiecke p95 | 1376541 | 1366626 | -9915 | – | – |
| stadt | 4+4 | Zählung | geht VRAM MB | 175.87 | 179.57 | 3.7 | – | – |
| **stadt** | 4+4 | | **Urteil** | | | | | **LANGSAMER** |
| w-ego | 4+4 | steht | fps | 70.55 | 70.25 | -0.3 | 1.34 | nicht langsamer |
| w-ego | 4+4 | steht | Frame p95 ms | 16.8 | 16.8 | 0 | 0 | nicht langsamer |
| w-ego | 4+4 | steht | CPU-Takt p95 ms | 5.58 | 5.7 | 0.12 | 0.21 | nicht langsamer (1σ–2σ) |
| w-ego | 4+4 | steht | GPU je Bild ms (gpu-bank) | 13.75 | 13.72 | -0.04 | 0.32 | nicht langsamer |
| w-ego | 4+4 | steht | Belegung p95 ms | 8.03 | 8.16 | 0.12 | 0.21 | nicht langsamer |
| w-ego | 4+4 | geht | fps | 56.58 | 57.08 | 0.5 | 0.74 | nicht langsamer |
| w-ego | 4+4 | geht | Frame p95 ms | 25.1 | 25.1 | 0 | 0 | nicht langsamer |
| w-ego | 4+4 | geht | CPU-Takt p95 ms | 19.77 | 18.72 | -1.05 | 0.67 | nicht langsamer |
| w-ego | 4+4 | geht | Belegung p95 ms | 23.31 | 22.59 | -0.73 | 0.58 | nicht langsamer |
| w-ego | 4+4 | Zählung | steht Befehle | 40 | 40 | 0 | – | – |
| w-ego | 4+4 | Zählung | steht Dreiecke p95 | 261311 | 261388 | 77.5 | – | – |
| w-ego | 4+4 | Zählung | steht VRAM MB | 112.4 | 112.78 | 0.38 | – | – |
| w-ego | 4+4 | Zählung | geht Befehle | 57 | 57 | 0 | – | – |
| w-ego | 4+4 | Zählung | geht Dreiecke p95 | 377097 | 375034 | -2063 | – | – |
| w-ego | 4+4 | Zählung | geht VRAM MB | 115.93 | 116.38 | 0.45 | – | – |
| **w-ego** | 4+4 | | **Urteil** | | | | | **nicht-langsamer** |

Instrument je Boot: 6b3da7050 (stadt-A1, stadt-A2, stadt-A3, stadt-A4, stadt-B1, stadt-B2, stadt-B3, stadt-B4, w-ego-A1, w-ego-A2, w-ego-A3, w-ego-A4, w-ego-B1, w-ego-B2, w-ego-B3, w-ego-B4)

Roh: `bericht/z87-abab/`.
