# z49z50b-abab — ABAB 6db2602c gegen cd34e72b: nicht-langsamer

GTX 1060, `--echt` 1920×1080, Regler voll, Messplatz-Dienst (zug/messplatz.md). A = cd34e72b7180e1596ba105b70ccff93d7ed1d4e0, B = 6db2602c6ea8c3a2ae5e75e6309f7a6196b03c3a, Instrument aus B. Je Zelle 2+2, verlängert auf 4+4 nur bei Kern-Anschlag oder einer Größe zwischen 1σ und 2σ. Urteil je Größe Δ ≤ max(2σ gepoolt, Auflösung).

| Zelle | n A+B | Gang | Größe | A | B | Δ B − A | 2σ | Urteil |
|---|---|---|---|---|---|---|---|---|
| w-ego | 2+2 | steht | fps | 77.35 | 77.05 | -0.3 | 1.86 | nicht langsamer |
| w-ego | 2+2 | steht | Frame p95 ms | 16.8 | 16.8 | 0 | 0 | nicht langsamer |
| w-ego | 2+2 | steht | CPU-Takt p95 ms | 4.05 | 3.85 | -0.2 | 0.71 | nicht langsamer |
| w-ego | 2+2 | steht | GPU je Bild ms (gpu-bank) | 12.44 | 12.34 | -0.1 | 0.41 | nicht langsamer |
| w-ego | 2+2 | steht | Belegung p95 ms | 5.69 | 5.43 | -0.26 | 0.8 | nicht langsamer |
| w-ego | 2+2 | geht | fps | 61.3 | 61.4 | 0.1 | 1.9 | nicht langsamer |
| w-ego | 2+2 | geht | Frame p95 ms | 25.1 | 25.1 | 0 | 0 | nicht langsamer |
| w-ego | 2+2 | geht | CPU-Takt p95 ms | 18.15 | 17.2 | -0.95 | 0.5 | nicht langsamer |
| w-ego | 2+2 | geht | Belegung p95 ms | 21.55 | 21.55 | 0 | 1 | nicht langsamer |
| w-ego | 2+2 | Zählung | steht Befehle | 39 | 39 | 0 | – | – |
| w-ego | 2+2 | Zählung | steht Dreiecke p95 | 264243 | 264247 | 4 | – | – |
| w-ego | 2+2 | Zählung | steht VRAM MB | 107.85 | 107.9 | 0.05 | – | – |
| w-ego | 2+2 | Zählung | geht Befehle | 56 | 56 | 0 | – | – |
| w-ego | 2+2 | Zählung | geht Dreiecke p95 | 377153 | 376917 | -236 | – | – |
| w-ego | 2+2 | Zählung | geht VRAM MB | 111.45 | 111.5 | 0.05 | – | – |
| **w-ego** | 2+2 | | **Urteil** | | | | | **nicht-langsamer** |
| d-ego | 2+2 | steht | fps | 74.3 | 73.8 | -0.5 | 1.97 | nicht langsamer |
| d-ego | 2+2 | steht | Frame p95 ms | 16.8 | 16.8 | 0 | 0 | nicht langsamer |
| d-ego | 2+2 | steht | CPU-Takt p95 ms | 4.75 | 4.7 | -0.05 | 0.22 | nicht langsamer |
| d-ego | 2+2 | steht | GPU je Bild ms (gpu-bank) | 13.32 | 12.86 | -0.47 | 0.35 | nicht langsamer |
| d-ego | 2+2 | steht | Belegung p95 ms | 6.76 | 6.64 | -0.12 | 0.38 | nicht langsamer |
| d-ego | 2+2 | Zählung | steht Befehle | 50 | 50 | 0 | – | – |
| d-ego | 2+2 | Zählung | steht Dreiecke p95 | 363740 | 364892 | 1152 | – | – |
| d-ego | 2+2 | Zählung | steht VRAM MB | 106.9 | 107.25 | 0.35 | – | – |
| **d-ego** | 2+2 | | **Urteil** | | | | | **nicht-langsamer** |
| stadt | 4+4 | steht | fps | 78.72 | 78.45 | -0.27 | 0.9 | nicht langsamer |
| stadt | 4+4 | steht | Frame p95 ms | 16.8 | 16.8 | 0 | 0 | nicht langsamer |
| stadt | 4+4 | steht | CPU-Takt p95 ms | 6.88 | 7.08 | 0.2 | 0.61 | nicht langsamer |
| stadt | 4+4 | steht | Belegung p95 ms | 10.48 | 10.77 | 0.29 | 0.69 | nicht langsamer |
| stadt | 4+4 | geht | fps | 45.1 | 45.2 | 0.1 | 2.42 | nicht langsamer |
| stadt | 4+4 | geht | Frame p95 ms | 41.63 | 39.55 | -2.08 | 5.8 | nicht langsamer |
| stadt | 4+4 | geht | CPU-Takt p95 ms | 35.65 | 35.83 | 0.17 | 2.45 | nicht langsamer |
| stadt | 4+4 | geht | Belegung p95 ms | 38.66 | 38.28 | -0.38 | 2.28 | nicht langsamer |
| stadt | 4+4 | Zählung | steht Befehle | 57 | 57 | 0 | – | – |
| stadt | 4+4 | Zählung | steht Dreiecke p95 | 1235021 | 1234928 | -93 | – | – |
| stadt | 4+4 | Zählung | steht VRAM MB | 174.45 | 173.57 | -0.88 | – | – |
| stadt | 4+4 | Zählung | geht Befehle | 78 | 78 | 0 | – | – |
| stadt | 4+4 | Zählung | geht Dreiecke p95 | 1404355 | 1407271 | 2916 | – | – |
| stadt | 4+4 | Zählung | geht VRAM MB | 174.22 | 173.3 | -0.93 | – | – |
| **stadt** | 4+4 | | **Urteil** | | | | | **nicht-langsamer** |

Instrument je Boot: cd34e72b7 (d-ego-A1, d-ego-A2, d-ego-B1, d-ego-B2, stadt-A1, stadt-A2, stadt-A3, stadt-A4, stadt-B1, stadt-B2, stadt-B3, stadt-B4, w-ego-A1, w-ego-A2, w-ego-B1, w-ego-B2)

Roh: `bericht/z49z50b-abab/`.
