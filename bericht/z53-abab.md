# z53-abab — ABAB f1faa046 gegen 9fa32207: nicht-langsamer

GTX 1060, `--echt` 1920×1080, Regler voll, Messplatz-Dienst (zug/messplatz.md). A = 9fa32207625dc4dfcfdf50e895b05c5226825ea6, B = f1faa0467fd4b3b63bcae3524c1e06ae18dcb2cb, Instrument aus B. Je Zelle 2+2, verlängert auf 4+4 nur bei Kern-Anschlag oder einer Größe zwischen 1σ und 2σ. Urteil je Größe Δ ≤ max(2σ gepoolt, Auflösung).

| Zelle | n A+B | Gang | Größe | A | B | Δ B − A | 2σ | Urteil |
|---|---|---|---|---|---|---|---|---|
| w-ego | 4+4 | steht | fps | 76.78 | 77 | 0.22 | 1.82 | nicht langsamer |
| w-ego | 4+4 | steht | Frame p95 ms | 16.8 | 16.8 | 0 | 0 | nicht langsamer |
| w-ego | 4+4 | steht | CPU-Takt p95 ms | 3.83 | 3.9 | 0.07 | 0.24 | nicht langsamer |
| w-ego | 4+4 | steht | GPU je Bild ms (gpu-bank) | 12.63 | 12.3 | -0.33 | 0.54 | nicht langsamer |
| w-ego | 4+4 | steht | Belegung p95 ms | 5.53 | 5.64 | 0.11 | 0.22 | nicht langsamer |
| w-ego | 4+4 | geht | fps | 60.8 | 61.55 | 0.75 | 2.42 | nicht langsamer |
| w-ego | 4+4 | geht | Frame p95 ms | 25.1 | 25.1 | 0 | 0 | nicht langsamer |
| w-ego | 4+4 | geht | CPU-Takt p95 ms | 18.32 | 17.7 | -0.63 | 2.65 | nicht langsamer |
| w-ego | 4+4 | geht | Belegung p95 ms | 21.65 | 21.23 | -0.42 | 1.62 | nicht langsamer |
| w-ego | 4+4 | Zählung | steht Befehle | 39 | 39 | 0 | – | – |
| w-ego | 4+4 | Zählung | steht Dreiecke p95 | 264243 | 264246 | 2.5 | – | – |
| w-ego | 4+4 | Zählung | steht VRAM MB | 107.85 | 107.85 | 0 | – | – |
| w-ego | 4+4 | Zählung | geht Befehle | 56 | 56 | 0 | – | – |
| w-ego | 4+4 | Zählung | geht Dreiecke p95 | 378515 | 378166 | -349.5 | – | – |
| w-ego | 4+4 | Zählung | geht VRAM MB | 111.63 | 111.75 | 0.13 | – | – |
| **w-ego** | 4+4 | | **Urteil** | | | | | **nicht-langsamer** |
| d-ego | 4+4 | steht | fps | 74.38 | 74.65 | 0.28 | 2.58 | nicht langsamer |
| d-ego | 4+4 | steht | Frame p95 ms | 16.8 | 16.8 | 0 | 0 | nicht langsamer |
| d-ego | 4+4 | steht | CPU-Takt p95 ms | 4.67 | 4.83 | 0.15 | 0.19 | nicht langsamer (1σ–2σ) |
| d-ego | 4+4 | steht | GPU je Bild ms (gpu-bank) | 12.63 | 12.58 | -0.05 | 0.4 | nicht langsamer |
| d-ego | 4+4 | steht | Belegung p95 ms | 6.64 | 6.79 | 0.15 | 0.36 | nicht langsamer |
| d-ego | 4+4 | Zählung | steht Befehle | 50 | 50 | 0 | – | – |
| d-ego | 4+4 | Zählung | steht Dreiecke p95 | 360806 | 365470 | 4664 | – | – |
| d-ego | 4+4 | Zählung | steht VRAM MB | 107.43 | 107 | -0.43 | – | – |
| **d-ego** | 4+4 | | **Urteil** | | | | | **nicht-langsamer** |
| stadt | 2+2 | steht | fps | 78.7 | 78.6 | -0.1 | 0.2 | nicht langsamer |
| stadt | 2+2 | steht | Frame p95 ms | 16.8 | 16.8 | 0 | 0 | nicht langsamer |
| stadt | 2+2 | steht | CPU-Takt p95 ms | 7 | 6.9 | -0.1 | 0.45 | nicht langsamer |
| stadt | 2+2 | steht | Belegung p95 ms | 10.71 | 10.57 | -0.14 | 0.46 | nicht langsamer |
| stadt | 2+2 | geht | fps | 45.35 | 45.4 | 0.05 | 1.8 | nicht langsamer |
| stadt | 2+2 | geht | Frame p95 ms | 41.55 | 41.55 | 0 | 0.14 | nicht langsamer |
| stadt | 2+2 | geht | CPU-Takt p95 ms | 34.9 | 35.8 | 0.9 | 3.23 | nicht langsamer |
| stadt | 2+2 | geht | Belegung p95 ms | 37.38 | 38.07 | 0.69 | 3.57 | nicht langsamer |
| stadt | 2+2 | Zählung | steht Befehle | 57 | 57 | 0 | – | – |
| stadt | 2+2 | Zählung | steht Dreiecke p95 | 1234506 | 1235254 | 748 | – | – |
| stadt | 2+2 | Zählung | steht VRAM MB | 173.95 | 173.7 | -0.25 | – | – |
| stadt | 2+2 | Zählung | geht Befehle | 78 | 78 | 0 | – | – |
| stadt | 2+2 | Zählung | geht Dreiecke p95 | 1410140 | 1409963 | -176.5 | – | – |
| stadt | 2+2 | Zählung | geht VRAM MB | 174.15 | 173.45 | -0.7 | – | – |
| **stadt** | 2+2 | | **Urteil** | | | | | **nicht-langsamer** |

Instrument je Boot: 9fa322076 (d-ego-A1, d-ego-A2, d-ego-A3, d-ego-A4, d-ego-B1, d-ego-B2, d-ego-B3, d-ego-B4, stadt-A1, stadt-A2, stadt-B1, stadt-B2, w-ego-A1, w-ego-A2, w-ego-A3, w-ego-A4, w-ego-B1, w-ego-B2, w-ego-B3, w-ego-B4)

Roh: `bericht/z53-abab/`.
