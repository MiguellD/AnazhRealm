# z54n-abab — ABAB 19606f2e gegen f1faa046: nicht-langsamer

GTX 1060, `--echt` 1920×1080, Regler voll, Messplatz-Dienst (zug/messplatz.md). A = f1faa0467fd4b3b63bcae3524c1e06ae18dcb2cb, B = 19606f2ee8492be703fb6aff52d4e48c9279919f, Instrument aus B. Je Zelle 2+2, verlängert auf 4+4 nur bei Kern-Anschlag oder einer Größe zwischen 1σ und 2σ. Urteil je Größe Δ ≤ max(2σ gepoolt, Auflösung).

| Zelle | n A+B | Gang | Größe | A | B | Δ B − A | 2σ | Urteil |
|---|---|---|---|---|---|---|---|---|
| w-ego | 4+4 | steht | fps | 75 | 75.75 | 0.75 | 1.04 | nicht langsamer |
| w-ego | 4+4 | steht | Frame p95 ms | 16.8 | 16.8 | 0 | 0 | nicht langsamer |
| w-ego | 4+4 | steht | CPU-Takt p95 ms | 4.45 | 4.42 | -0.03 | 0.43 | nicht langsamer |
| w-ego | 4+4 | steht | GPU je Bild ms (gpu-bank) | 12.64 | 12.52 | -0.12 | 0.39 | nicht langsamer |
| w-ego | 4+4 | steht | Belegung p95 ms | 6.34 | 6.32 | -0.03 | 0.56 | nicht langsamer |
| w-ego | 4+4 | geht | fps | 58.23 | 61.05 | 2.83 | 3.94 | nicht langsamer |
| w-ego | 4+4 | geht | Frame p95 ms | 25.1 | 25.08 | -0.02 | 0.07 | nicht langsamer |
| w-ego | 4+4 | geht | CPU-Takt p95 ms | 20.3 | 17.4 | -2.9 | 3.74 | nicht langsamer |
| w-ego | 4+4 | geht | Belegung p95 ms | 23.01 | 21.34 | -1.67 | 2.34 | nicht langsamer |
| w-ego | 4+4 | Zählung | steht Befehle | 39 | 39 | 0 | – | – |
| w-ego | 4+4 | Zählung | steht Dreiecke p95 | 264246 | 264246 | 0 | – | – |
| w-ego | 4+4 | Zählung | steht VRAM MB | 107.83 | 107.85 | 0.03 | – | – |
| w-ego | 4+4 | Zählung | geht Befehle | 56 | 56 | 0 | – | – |
| w-ego | 4+4 | Zählung | geht Dreiecke p95 | 381092 | 378438 | -2654 | – | – |
| w-ego | 4+4 | Zählung | geht VRAM MB | 111.57 | 111.63 | 0.05 | – | – |
| **w-ego** | 4+4 | | **Urteil** | | | | | **nicht-langsamer** |
| d-ego | 4+4 | steht | fps | 73.42 | 74.28 | 0.85 | 2.18 | nicht langsamer |
| d-ego | 4+4 | steht | Frame p95 ms | 16.8 | 16.8 | 0 | 0 | nicht langsamer |
| d-ego | 4+4 | steht | CPU-Takt p95 ms | 5.25 | 5.22 | -0.03 | 0.66 | nicht langsamer |
| d-ego | 4+4 | steht | GPU je Bild ms (gpu-bank) | 12.97 | 12.64 | -0.33 | 0.41 | nicht langsamer |
| d-ego | 4+4 | steht | Belegung p95 ms | 7.31 | 7.24 | -0.07 | 0.77 | nicht langsamer |
| d-ego | 4+4 | Zählung | steht Befehle | 50 | 50 | 0 | – | – |
| d-ego | 4+4 | Zählung | steht Dreiecke p95 | 362585 | 358593 | -3992 | – | – |
| d-ego | 4+4 | Zählung | steht VRAM MB | 106.95 | 106.5 | -0.45 | – | – |
| **d-ego** | 4+4 | | **Urteil** | | | | | **nicht-langsamer** |
| stadt | 2+2 | steht | fps | 76 | 78.1 | 2.1 | 3.42 | nicht langsamer |
| stadt | 2+2 | steht | Frame p95 ms | 16.8 | 16.8 | 0 | 0 | nicht langsamer |
| stadt | 2+2 | steht | CPU-Takt p95 ms | 9.45 | 7.5 | -1.95 | 3.26 | nicht langsamer |
| stadt | 2+2 | steht | Belegung p95 ms | 14.13 | 11.51 | -2.62 | 5.05 | nicht langsamer |
| stadt | 2+2 | geht | fps | 39.4 | 45.35 | 5.95 | 13.2 | nicht langsamer |
| stadt | 2+2 | geht | Frame p95 ms | 45.9 | 41.55 | -4.35 | 25 | nicht langsamer |
| stadt | 2+2 | geht | CPU-Takt p95 ms | 44.2 | 34.35 | -9.85 | 20.51 | nicht langsamer |
| stadt | 2+2 | geht | Belegung p95 ms | 47.73 | 37.68 | -10.05 | 23.93 | nicht langsamer |
| stadt | 2+2 | Zählung | steht Befehle | 57 | 57 | 0 | – | – |
| stadt | 2+2 | Zählung | steht Dreiecke p95 | 1235254 | 1234692 | -562 | – | – |
| stadt | 2+2 | Zählung | steht VRAM MB | 175.45 | 174.8 | -0.65 | – | – |
| stadt | 2+2 | Zählung | geht Befehle | 78 | 78 | 0 | – | – |
| stadt | 2+2 | Zählung | geht Dreiecke p95 | 1399620 | 1406720 | 7101 | – | – |
| stadt | 2+2 | Zählung | geht VRAM MB | 175.25 | 174.2 | -1.05 | – | – |
| **stadt** | 2+2 | | **Urteil** | | | | | **nicht-langsamer** |

Instrument je Boot: f1faa0467 (d-ego-A1, d-ego-A2, d-ego-A3, d-ego-A4, d-ego-B1, d-ego-B2, d-ego-B3, d-ego-B4, stadt-A1, stadt-A2, stadt-B1, stadt-B2, w-ego-A1, w-ego-A2, w-ego-A3, w-ego-A4, w-ego-B1, w-ego-B2, w-ego-B3, w-ego-B4)

Roh: `bericht/z54n-abab/`.
