# nw2628-abab — ABAB 4a5f5e2c gegen 206b395a: nicht-langsamer

GTX 1060, `--echt` 1920×1080, Regler voll, Messplatz-Dienst (zug/messplatz.md). A = 206b395ac2b71fd9afe4b2b8b68d38dbc07659f9, B = 4a5f5e2c9ab02618feccdf8b9f1a03942bcc9301, Instrument aus B. Je Zelle 2+2, verlängert auf 4+4 nur bei Kern-Anschlag oder einer Größe zwischen 1σ und 2σ. Urteil je Größe Δ ≤ max(2σ gepoolt, Auflösung).

| Zelle | n A+B | Gang | Größe | A | B | Δ B − A | 2σ | Urteil |
|---|---|---|---|---|---|---|---|---|
| w-ego | 4+4 | steht | fps | 74.13 | 74.5 | 0.38 | 1.05 | nicht langsamer |
| w-ego | 4+4 | steht | Frame p95 ms | 16.8 | 16.8 | 0 | 0 | nicht langsamer |
| w-ego | 4+4 | steht | CPU-Takt p95 ms | 4.5 | 4.42 | -0.08 | 0.37 | nicht langsamer |
| w-ego | 4+4 | steht | GPU je Bild ms (gpu-bank) | 13.48 | 12.98 | -0.5 | 1.22 | nicht langsamer |
| w-ego | 4+4 | steht | Belegung p95 ms | 6.32 | 6.22 | -0.1 | 0.29 | nicht langsamer |
| w-ego | 4+4 | geht | fps | 57.93 | 59.13 | 1.2 | 2.52 | nicht langsamer |
| w-ego | 4+4 | geht | Frame p95 ms | 25.1 | 25.1 | 0 | 0 | nicht langsamer |
| w-ego | 4+4 | geht | CPU-Takt p95 ms | 20.42 | 18.9 | -1.52 | 3.55 | nicht langsamer |
| w-ego | 4+4 | geht | Belegung p95 ms | 23.41 | 22.52 | -0.9 | 2.29 | nicht langsamer |
| w-ego | 4+4 | Zählung | steht Befehle | 38 | 38 | 0 | – | – |
| w-ego | 4+4 | Zählung | steht Dreiecke p95 | 263982 | 263980 | -2.5 | – | – |
| w-ego | 4+4 | Zählung | steht VRAM MB | 107.75 | 107.77 | 0.02 | – | – |
| w-ego | 4+4 | Zählung | geht Befehle | 55 | 55 | 0 | – | – |
| w-ego | 4+4 | Zählung | geht Dreiecke p95 | 379861 | 380022 | 160.25 | – | – |
| w-ego | 4+4 | Zählung | geht VRAM MB | 111.5 | 111.58 | 0.08 | – | – |
| **w-ego** | 4+4 | | **Urteil** | | | | | **nicht-langsamer** |
| g-third | 4+4 | steht | fps | 79.63 | 79.65 | 0.03 | 0.23 | nicht langsamer |
| g-third | 4+4 | steht | Frame p95 ms | 16.7 | 16.7 | 0 | 0 | nicht langsamer |
| g-third | 4+4 | steht | CPU-Takt p95 ms | 6.08 | 6.13 | 0.05 | 0.53 | nicht langsamer |
| g-third | 4+4 | steht | GPU je Bild ms (gpu-bank) | 11.71 | 11.91 | 0.2 | 0.24 | nicht langsamer (1σ–2σ) |
| g-third | 4+4 | steht | Belegung p95 ms | 7.78 | 7.89 | 0.1 | 0.47 | nicht langsamer |
| g-third | 4+4 | Zählung | steht Befehle | 79 | 79 | 0 | – | – |
| g-third | 4+4 | Zählung | steht Dreiecke p95 | 338872 | 338981 | 109 | – | – |
| g-third | 4+4 | Zählung | steht VRAM MB | 113.63 | 113.5 | -0.13 | – | – |
| **g-third** | 4+4 | | **Urteil** | | | | | **nicht-langsamer** |
| d-ego | 4+4 | steht | fps | 75.07 | 74.5 | -0.57 | 0.62 | nicht langsamer |
| d-ego | 4+4 | steht | Frame p95 ms | 16.8 | 16.8 | 0 | 0 | nicht langsamer |
| d-ego | 4+4 | steht | CPU-Takt p95 ms | 5.72 | 5.77 | 0.05 | 0.47 | nicht langsamer |
| d-ego | 4+4 | steht | GPU je Bild ms (gpu-bank) | 12.51 | 12.63 | 0.12 | 0.29 | nicht langsamer |
| d-ego | 4+4 | steht | Belegung p95 ms | 7.45 | 7.58 | 0.13 | 0.25 | nicht langsamer |
| d-ego | 4+4 | Zählung | steht Befehle | 59 | 59 | 0 | – | – |
| d-ego | 4+4 | Zählung | steht Dreiecke p95 | 439879 | 440543 | 664 | – | – |
| d-ego | 4+4 | Zählung | steht VRAM MB | 111.25 | 112.72 | 1.47 | – | – |
| **d-ego** | 4+4 | | **Urteil** | | | | | **nicht-langsamer** |
| stadt | 4+4 | steht | fps | 73.47 | 73.48 | 0 | 2.88 | nicht langsamer |
| stadt | 4+4 | steht | Frame p95 ms | 16.8 | 16.8 | 0 | 0 | nicht langsamer |
| stadt | 4+4 | steht | CPU-Takt p95 ms | 8.13 | 8.15 | 0.03 | 0.97 | nicht langsamer |
| stadt | 4+4 | steht | Belegung p95 ms | 11.98 | 12.05 | 0.07 | 1.69 | nicht langsamer |
| stadt | 4+4 | geht | fps | 32.7 | 34 | 1.3 | 8.5 | nicht langsamer |
| stadt | 4+4 | geht | Frame p95 ms | 64.63 | 60.35 | -4.28 | 35.6 | nicht langsamer |
| stadt | 4+4 | geht | CPU-Takt p95 ms | 54.1 | 49.8 | -4.3 | 21.23 | nicht langsamer |
| stadt | 4+4 | geht | Belegung p95 ms | 64.96 | 59.16 | -5.8 | 27.12 | nicht langsamer |
| stadt | 4+4 | Zählung | steht Befehle | 55.5 | 55.75 | 0.25 | – | – |
| stadt | 4+4 | Zählung | steht Dreiecke p95 | 1296992 | 1295129 | -1863 | – | – |
| stadt | 4+4 | Zählung | steht VRAM MB | 155.47 | 153.8 | -1.67 | – | – |
| stadt | 4+4 | Zählung | geht Befehle | 77.75 | 77.25 | -0.5 | – | – |
| stadt | 4+4 | Zählung | geht Dreiecke p95 | 1973157 | 1981283 | 8126 | – | – |
| stadt | 4+4 | Zählung | geht VRAM MB | 201.58 | 197.35 | -4.22 | – | – |
| **stadt** | 4+4 | | **Urteil** | | | | | **nicht-langsamer** |

Instrument je Boot: 206b395ac (d-ego-A1, d-ego-A2, d-ego-A3, d-ego-A4, d-ego-B1, d-ego-B2, d-ego-B3, d-ego-B4, g-third-A1, g-third-A2, g-third-A3, g-third-A4, g-third-B1, g-third-B2, g-third-B3, g-third-B4, stadt-A1, stadt-A2, stadt-A3, stadt-A4, stadt-B1, stadt-B2, stadt-B3, stadt-B4, w-ego-A1, w-ego-A2, w-ego-A3, w-ego-A4, w-ego-B1, w-ego-B2, w-ego-B3, w-ego-B4)

Roh: `bericht/nw2628-abab/`.
