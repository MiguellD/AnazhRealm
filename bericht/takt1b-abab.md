# takt1b-abab — ABAB 206b395a gegen 79c0fae2: nicht-langsamer

GTX 1060, `--echt` 1920×1080, Regler voll, Messplatz-Dienst (zug/messplatz.md). A = 79c0fae296ec982fe5ad2673a85157eb9f7ea313, B = 206b395ac2b71fd9afe4b2b8b68d38dbc07659f9, Instrument aus B. Je Zelle 2+2, verlängert auf 4+4 nur bei Kern-Anschlag oder einer Größe zwischen 1σ und 2σ. Urteil je Größe Δ ≤ max(2σ gepoolt, Auflösung).

| Zelle | n A+B | Gang | Größe | A | B | Δ B − A | 2σ | Urteil |
|---|---|---|---|---|---|---|---|---|
| w-ego | 4+4 | steht | fps | 74.77 | 74.45 | -0.32 | 1.61 | nicht langsamer |
| w-ego | 4+4 | steht | Frame p95 ms | 16.8 | 16.8 | 0 | 0 | nicht langsamer |
| w-ego | 4+4 | steht | CPU-Takt p95 ms | 4.22 | 4.38 | 0.15 | 0.3 | nicht langsamer (1σ–2σ) |
| w-ego | 4+4 | steht | GPU je Bild ms (gpu-bank) | 12.95 | 13.34 | 0.4 | 0.44 | nicht langsamer (1σ–2σ) |
| w-ego | 4+4 | steht | Belegung p95 ms | 6.08 | 6.24 | 0.17 | 0.37 | nicht langsamer |
| w-ego | 4+4 | geht | fps | 59 | 59.17 | 0.17 | 1.14 | nicht langsamer |
| w-ego | 4+4 | geht | Frame p95 ms | 25.1 | 25.1 | 0 | 0 | nicht langsamer |
| w-ego | 4+4 | geht | CPU-Takt p95 ms | 18.9 | 18.88 | -0.02 | 0.49 | nicht langsamer |
| w-ego | 4+4 | geht | Belegung p95 ms | 22.44 | 22.41 | -0.03 | 0.36 | nicht langsamer |
| w-ego | 4+4 | Zählung | steht Befehle | 38 | 38 | 0 | – | – |
| w-ego | 4+4 | Zählung | steht Dreiecke p95 | 263984 | 263983 | -1.5 | – | – |
| w-ego | 4+4 | Zählung | steht VRAM MB | 107.75 | 107.85 | 0.1 | – | – |
| w-ego | 4+4 | Zählung | geht Befehle | 55 | 55 | 0 | – | – |
| w-ego | 4+4 | Zählung | geht Dreiecke p95 | 379486 | 378155 | -1330 | – | – |
| w-ego | 4+4 | Zählung | geht VRAM MB | 111.55 | 111.7 | 0.15 | – | – |
| **w-ego** | 4+4 | | **Urteil** | | | | | **nicht-langsamer** |
| g-third | 2+2 | steht | fps | 79.6 | 79.6 | 0 | 0.2 | nicht langsamer |
| g-third | 2+2 | steht | Frame p95 ms | 16.75 | 16.7 | -0.05 | 0.1 | nicht langsamer |
| g-third | 2+2 | steht | CPU-Takt p95 ms | 5.9 | 5.95 | 0.05 | 0.41 | nicht langsamer |
| g-third | 2+2 | steht | GPU je Bild ms (gpu-bank) | 11.83 | 11.87 | 0.04 | 0.62 | nicht langsamer |
| g-third | 2+2 | steht | Belegung p95 ms | 7.82 | 7.74 | -0.08 | 0.71 | nicht langsamer |
| g-third | 2+2 | Zählung | steht Befehle | 79 | 79 | 0 | – | – |
| g-third | 2+2 | Zählung | steht Dreiecke p95 | 338875 | 338875 | 0 | – | – |
| g-third | 2+2 | Zählung | steht VRAM MB | 113.55 | 113.5 | -0.05 | – | – |
| **g-third** | 2+2 | | **Urteil** | | | | | **nicht-langsamer** |
| d-ego | 4+4 | steht | fps | 74.95 | 75.28 | 0.33 | 0.74 | nicht langsamer |
| d-ego | 4+4 | steht | Frame p95 ms | 16.8 | 16.8 | 0 | 0 | nicht langsamer |
| d-ego | 4+4 | steht | CPU-Takt p95 ms | 5.75 | 5.48 | -0.27 | 0.34 | nicht langsamer |
| d-ego | 4+4 | steht | GPU je Bild ms (gpu-bank) | 12.89 | 12.94 | 0.05 | 0.36 | nicht langsamer |
| d-ego | 4+4 | steht | Belegung p95 ms | 7.7 | 7.28 | -0.42 | 0.4 | nicht langsamer |
| d-ego | 4+4 | Zählung | steht Befehle | 59 | 59 | 0 | – | – |
| d-ego | 4+4 | Zählung | steht Dreiecke p95 | 439332 | 439403 | 70.75 | – | – |
| d-ego | 4+4 | Zählung | steht VRAM MB | 112.72 | 111.02 | -1.7 | – | – |
| **d-ego** | 4+4 | | **Urteil** | | | | | **nicht-langsamer** |
| stadt | 2+2 | steht | fps | 72.35 | 74.1 | 1.75 | 1.8 | nicht langsamer |
| stadt | 2+2 | steht | Frame p95 ms | 16.85 | 16.85 | 0 | 0.14 | nicht langsamer |
| stadt | 2+2 | steht | CPU-Takt p95 ms | 9 | 7.7 | -1.3 | 1.08 | nicht langsamer |
| stadt | 2+2 | steht | Belegung p95 ms | 13.41 | 11 | -2.41 | 1.65 | nicht langsamer |
| stadt | 2+2 | geht | fps | 35.95 | 37.65 | 1.7 | 3.54 | nicht langsamer |
| stadt | 2+2 | geht | Frame p95 ms | 54.2 | 50.05 | -4.15 | 8.4 | nicht langsamer |
| stadt | 2+2 | geht | CPU-Takt p95 ms | 47.05 | 44.8 | -2.25 | 6.69 | nicht langsamer |
| stadt | 2+2 | geht | Belegung p95 ms | 53.61 | 51.35 | -2.26 | 6.78 | nicht langsamer |
| stadt | 2+2 | Zählung | steht Befehle | 59.5 | 54 | -5.5 | – | – |
| stadt | 2+2 | Zählung | steht Dreiecke p95 | 1335535 | 1273814 | -61721 | – | – |
| stadt | 2+2 | Zählung | steht VRAM MB | 155.9 | 157.2 | 1.3 | – | – |
| stadt | 2+2 | Zählung | geht Befehle | 78.5 | 78 | -0.5 | – | – |
| stadt | 2+2 | Zählung | geht Dreiecke p95 | 1981301 | 1978455 | -2846 | – | – |
| stadt | 2+2 | Zählung | geht VRAM MB | 197.2 | 198.2 | 1 | – | – |
| **stadt** | 2+2 | | **Urteil** | | | | | **nicht-langsamer** |

Instrument je Boot: 79c0fae29 (d-ego-A1, d-ego-A2, d-ego-A3, d-ego-A4, d-ego-B1, d-ego-B2, d-ego-B3, d-ego-B4, g-third-A1, g-third-A2, g-third-B1, g-third-B2, stadt-A1, stadt-A2, stadt-B1, stadt-B2, w-ego-A1, w-ego-A2, w-ego-A3, w-ego-A4, w-ego-B1, w-ego-B2, w-ego-B3, w-ego-B4)

Roh: `bericht/takt1b-abab/`.
