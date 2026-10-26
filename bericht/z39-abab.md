# z39-abab — ABAB f85ddf35 gegen b2c6c627: nicht-langsamer

GTX 1060, `--echt` 1920×1080, Regler voll, Messplatz-Dienst (zug/messplatz.md). A = b2c6c627e6526265fcdc5178b987515ae06f2584, B = f85ddf35bd377c89a1df293a1e5e00498a695650, Instrument aus B. Je Zelle 2+2, verlängert auf 4+4 nur bei Kern-Anschlag oder einer Größe zwischen 1σ und 2σ. Urteil je Größe Δ ≤ max(2σ gepoolt, Auflösung).

| Zelle | n A+B | Gang | Größe | A | B | Δ B − A | 2σ | Urteil |
|---|---|---|---|---|---|---|---|---|
| w-ego | 4+4 | steht | fps | 75.3 | 74.4 | -0.9 | 1.34 | nicht langsamer |
| w-ego | 4+4 | steht | Frame p95 ms | 16.8 | 16.8 | 0 | 0 | nicht langsamer |
| w-ego | 4+4 | steht | CPU-Takt p95 ms | 4.3 | 4.6 | 0.3 | 0.4 | nicht langsamer (1σ–2σ) |
| w-ego | 4+4 | steht | GPU je Bild ms (gpu-bank) | 12.81 | 12.87 | 0.07 | 0.32 | nicht langsamer |
| w-ego | 4+4 | steht | Belegung p95 ms | 6.22 | 6.53 | 0.3 | 0.55 | nicht langsamer |
| w-ego | 4+4 | geht | fps | 59.92 | 57.98 | -1.95 | 4.61 | nicht langsamer |
| w-ego | 4+4 | geht | Frame p95 ms | 25.1 | 25.1 | 0 | 0 | nicht langsamer |
| w-ego | 4+4 | geht | CPU-Takt p95 ms | 18.75 | 20.15 | 1.4 | 3.21 | nicht langsamer |
| w-ego | 4+4 | geht | Belegung p95 ms | 22.12 | 22.99 | 0.87 | 2.29 | nicht langsamer |
| w-ego | 4+4 | Zählung | steht Befehle | 39 | 39 | 0 | – | – |
| w-ego | 4+4 | Zählung | steht Dreiecke p95 | 264235 | 264245 | 9.5 | – | – |
| w-ego | 4+4 | Zählung | steht VRAM MB | 107.88 | 107.82 | -0.05 | – | – |
| w-ego | 4+4 | Zählung | geht Befehle | 56 | 56 | 0 | – | – |
| w-ego | 4+4 | Zählung | geht Dreiecke p95 | 377101 | 379950 | 2849 | – | – |
| w-ego | 4+4 | Zählung | geht VRAM MB | 111.97 | 111.6 | -0.38 | – | – |
| **w-ego** | 4+4 | | **Urteil** | | | | | **nicht-langsamer** |
| d-ego | 4+4 | steht | fps | 73.85 | 72.6 | -1.25 | 1.79 | nicht langsamer |
| d-ego | 4+4 | steht | Frame p95 ms | 16.8 | 16.8 | 0 | 0 | nicht langsamer |
| d-ego | 4+4 | steht | CPU-Takt p95 ms | 5.05 | 5.2 | 0.15 | 0.36 | nicht langsamer |
| d-ego | 4+4 | steht | GPU je Bild ms (gpu-bank) | 12.89 | 13.15 | 0.26 | 0.46 | nicht langsamer (1σ–2σ) |
| d-ego | 4+4 | steht | Belegung p95 ms | 7.09 | 7.2 | 0.11 | 0.32 | nicht langsamer |
| d-ego | 4+4 | Zählung | steht Befehle | 50 | 50 | 0 | – | – |
| d-ego | 4+4 | Zählung | steht Dreiecke p95 | 356951 | 358190 | 1240 | – | – |
| d-ego | 4+4 | Zählung | steht VRAM MB | 106.77 | 106.68 | -0.1 | – | – |
| **d-ego** | 4+4 | | **Urteil** | | | | | **nicht-langsamer** |
| stadt | 2+2 | steht | fps | 77.75 | 78 | 0.25 | 0.5 | nicht langsamer |
| stadt | 2+2 | steht | Frame p95 ms | 16.8 | 16.8 | 0 | 0 | nicht langsamer |
| stadt | 2+2 | steht | CPU-Takt p95 ms | 7.6 | 7.45 | -0.15 | 0.41 | nicht langsamer |
| stadt | 2+2 | steht | Belegung p95 ms | 11.6 | 11.37 | -0.23 | 0.3 | nicht langsamer |
| stadt | 2+2 | geht | fps | 42.25 | 42.85 | 0.6 | 1.3 | nicht langsamer |
| stadt | 2+2 | geht | Frame p95 ms | 41.7 | 41.7 | 0 | 0 | nicht langsamer |
| stadt | 2+2 | geht | CPU-Takt p95 ms | 39.4 | 37.95 | -1.45 | 1.94 | nicht langsamer |
| stadt | 2+2 | geht | Belegung p95 ms | 41.84 | 40.39 | -1.45 | 2.8 | nicht langsamer |
| stadt | 2+2 | Zählung | steht Befehle | 57 | 57.5 | 0.5 | – | – |
| stadt | 2+2 | Zählung | steht Dreiecke p95 | 1235648 | 1240662 | 5014 | – | – |
| stadt | 2+2 | Zählung | steht VRAM MB | 172.6 | 174 | 1.4 | – | – |
| stadt | 2+2 | Zählung | geht Befehle | 78.5 | 78 | -0.5 | – | – |
| stadt | 2+2 | Zählung | geht Dreiecke p95 | 1404267 | 1401557 | -2709 | – | – |
| stadt | 2+2 | Zählung | geht VRAM MB | 174.1 | 174.25 | 0.15 | – | – |
| **stadt** | 2+2 | | **Urteil** | | | | | **nicht-langsamer** |

Instrument je Boot: b2c6c627e (d-ego-A1, d-ego-A2, d-ego-A3, d-ego-A4, d-ego-B1, d-ego-B2, d-ego-B3, d-ego-B4, stadt-A1, stadt-A2, stadt-B1, stadt-B2, w-ego-A1, w-ego-A2, w-ego-A3, w-ego-A4, w-ego-B1, w-ego-B2, w-ego-B3, w-ego-B4)

Roh: `bericht/z39-abab/`.
