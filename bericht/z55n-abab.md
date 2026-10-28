# z55n-abab — ABAB a03b7b06 gegen 19606f2e: LANGSAMER

GTX 1060, `--echt` 1920×1080, Regler voll, Messplatz-Dienst (zug/messplatz.md). A = 19606f2ee8492be703fb6aff52d4e48c9279919f, B = a03b7b0626826d1dd47c21a85bdcf123ecae6e39, Instrument aus B. Je Zelle 2+2, verlängert auf 4+4 nur bei Kern-Anschlag oder einer Größe zwischen 1σ und 2σ. Urteil je Größe Δ ≤ max(2σ gepoolt, Auflösung).

| Zelle | n A+B | Gang | Größe | A | B | Δ B − A | 2σ | Urteil |
|---|---|---|---|---|---|---|---|---|
| w-ego | 2+2 | steht | fps | 75.15 | 74.8 | -0.35 | 1.8 | nicht langsamer |
| w-ego | 2+2 | steht | Frame p95 ms | 16.8 | 16.8 | 0 | 0 | nicht langsamer |
| w-ego | 2+2 | steht | CPU-Takt p95 ms | 4.65 | 4.6 | -0.05 | 0.22 | nicht langsamer |
| w-ego | 2+2 | steht | GPU je Bild ms (gpu-bank) | 12.79 | 12.86 | 0.07 | 0.69 | nicht langsamer |
| w-ego | 2+2 | steht | Belegung p95 ms | 6.67 | 6.61 | -0.07 | 0.24 | nicht langsamer |
| w-ego | 2+2 | geht | fps | 59.2 | 59.35 | 0.15 | 0.5 | nicht langsamer |
| w-ego | 2+2 | geht | Frame p95 ms | 25.1 | 25.1 | 0 | 0 | nicht langsamer |
| w-ego | 2+2 | geht | CPU-Takt p95 ms | 19.25 | 18.75 | -0.5 | 1.21 | nicht langsamer |
| w-ego | 2+2 | geht | Belegung p95 ms | 22.17 | 21.68 | -0.49 | 0.42 | nicht langsamer |
| w-ego | 2+2 | Zählung | steht Befehle | 39 | 39 | 0 | – | – |
| w-ego | 2+2 | Zählung | steht Dreiecke p95 | 264242 | 264243 | 1 | – | – |
| w-ego | 2+2 | Zählung | steht VRAM MB | 107.8 | 107.8 | 0 | – | – |
| w-ego | 2+2 | Zählung | geht Befehle | 56 | 56.5 | 0.5 | – | – |
| w-ego | 2+2 | Zählung | geht Dreiecke p95 | 379490 | 383431 | 3942 | – | – |
| w-ego | 2+2 | Zählung | geht VRAM MB | 111.5 | 111.75 | 0.25 | – | – |
| **w-ego** | 2+2 | | **Urteil** | | | | | **nicht-langsamer** |
| d-ego | 4+4 | steht | fps | 72.7 | 72.85 | 0.15 | 1.96 | nicht langsamer |
| d-ego | 4+4 | steht | Frame p95 ms | 16.8 | 16.8 | 0 | 0 | nicht langsamer |
| d-ego | 4+4 | steht | CPU-Takt p95 ms | 5.45 | 5.7 | 0.25 | 0.22 | LANGSAMER |
| d-ego | 4+4 | steht | GPU je Bild ms (gpu-bank) | 13.02 | 13.1 | 0.08 | 0.79 | nicht langsamer |
| d-ego | 4+4 | steht | Belegung p95 ms | 7.69 | 7.95 | 0.26 | 0.3 | nicht langsamer |
| d-ego | 4+4 | Zählung | steht Befehle | 50 | 51 | 1 | – | – |
| d-ego | 4+4 | Zählung | steht Dreiecke p95 | 357971 | 364226 | 6255 | – | – |
| d-ego | 4+4 | Zählung | steht VRAM MB | 107.2 | 106.9 | -0.3 | – | – |
| **d-ego** | 4+4 | | **Urteil** | | | | | **LANGSAMER** |
| stadt | 2+2 | steht | fps | 77.2 | 77.55 | 0.35 | 0.64 | nicht langsamer |
| stadt | 2+2 | steht | Frame p95 ms | 16.8 | 16.8 | 0 | 0 | nicht langsamer |
| stadt | 2+2 | steht | CPU-Takt p95 ms | 8 | 8.15 | 0.15 | 0.54 | nicht langsamer |
| stadt | 2+2 | steht | Belegung p95 ms | 12.29 | 12.57 | 0.28 | 0.31 | nicht langsamer |
| stadt | 2+2 | geht | fps | 42.55 | 42.85 | 0.3 | 0.71 | nicht langsamer |
| stadt | 2+2 | geht | Frame p95 ms | 41.7 | 41.7 | 0 | 0 | nicht langsamer |
| stadt | 2+2 | geht | CPU-Takt p95 ms | 39.6 | 38.35 | -1.25 | 2.31 | nicht langsamer |
| stadt | 2+2 | geht | Belegung p95 ms | 42.55 | 40.67 | -1.87 | 1.25 | nicht langsamer |
| stadt | 2+2 | Zählung | steht Befehle | 57 | 58 | 1 | – | – |
| stadt | 2+2 | Zählung | steht Dreiecke p95 | 1234576 | 1237210 | 2634 | – | – |
| stadt | 2+2 | Zählung | steht VRAM MB | 174.1 | 173.25 | -0.85 | – | – |
| stadt | 2+2 | Zählung | geht Befehle | 78 | 78 | 0 | – | – |
| stadt | 2+2 | Zählung | geht Dreiecke p95 | 1403986 | 1401908 | -2077 | – | – |
| stadt | 2+2 | Zählung | geht VRAM MB | 173.7 | 173.35 | -0.35 | – | – |
| **stadt** | 2+2 | | **Urteil** | | | | | **nicht-langsamer** |

Instrument je Boot: 19606f2ee (d-ego-A1, d-ego-A2, d-ego-A3, d-ego-A4, d-ego-B1, d-ego-B2, d-ego-B3, d-ego-B4, stadt-A1, stadt-A2, stadt-B1, stadt-B2, w-ego-A1, w-ego-A2, w-ego-B1, w-ego-B2)

Roh: `bericht/z55n-abab/`.
