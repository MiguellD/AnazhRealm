# z40z43-abab — ABAB 607d0c73 gegen f85ddf35: nicht-langsamer

GTX 1060, `--echt` 1920×1080, Regler voll, Messplatz-Dienst (zug/messplatz.md). A = f85ddf35bd377c89a1df293a1e5e00498a695650, B = 607d0c73a2b98fdc1c2dbc06a961563bad73ce2a, Instrument aus B. Je Zelle 2+2, verlängert auf 4+4 nur bei Kern-Anschlag oder einer Größe zwischen 1σ und 2σ. Urteil je Größe Δ ≤ max(2σ gepoolt, Auflösung).

| Zelle | n A+B | Gang | Größe | A | B | Δ B − A | 2σ | Urteil |
|---|---|---|---|---|---|---|---|---|
| w-ego | 4+4 | steht | fps | 76.35 | 76.3 | -0.05 | 2.01 | nicht langsamer |
| w-ego | 4+4 | steht | Frame p95 ms | 16.8 | 16.8 | 0 | 0 | nicht langsamer |
| w-ego | 4+4 | steht | CPU-Takt p95 ms | 4.02 | 4 | -0.02 | 0.63 | nicht langsamer |
| w-ego | 4+4 | steht | GPU je Bild ms (gpu-bank) | 12.57 | 12.63 | 0.06 | 0.51 | nicht langsamer |
| w-ego | 4+4 | steht | Belegung p95 ms | 5.75 | 5.78 | 0.03 | 0.66 | nicht langsamer |
| w-ego | 4+4 | geht | fps | 61.15 | 60.88 | -0.27 | 1.71 | nicht langsamer |
| w-ego | 4+4 | geht | Frame p95 ms | 25.08 | 25.08 | 0 | 0.1 | nicht langsamer |
| w-ego | 4+4 | geht | CPU-Takt p95 ms | 17.7 | 18.13 | 0.43 | 1.17 | nicht langsamer |
| w-ego | 4+4 | geht | Belegung p95 ms | 21.59 | 21.47 | -0.11 | 0.87 | nicht langsamer |
| w-ego | 4+4 | Zählung | steht Befehle | 39 | 39 | 0 | – | – |
| w-ego | 4+4 | Zählung | steht Dreiecke p95 | 264239 | 264245 | 5.5 | – | – |
| w-ego | 4+4 | Zählung | steht VRAM MB | 107.75 | 107.8 | 0.05 | – | – |
| w-ego | 4+4 | Zählung | geht Befehle | 56 | 56 | 0 | – | – |
| w-ego | 4+4 | Zählung | geht Dreiecke p95 | 378990 | 378814 | -176.5 | – | – |
| w-ego | 4+4 | Zählung | geht VRAM MB | 111.63 | 111.75 | 0.13 | – | – |
| **w-ego** | 4+4 | | **Urteil** | | | | | **nicht-langsamer** |
| d-ego | 4+4 | steht | fps | 74.05 | 74.9 | 0.85 | 2.18 | nicht langsamer |
| d-ego | 4+4 | steht | Frame p95 ms | 16.8 | 16.8 | 0 | 0 | nicht langsamer |
| d-ego | 4+4 | steht | CPU-Takt p95 ms | 4.72 | 4.67 | -0.05 | 0.22 | nicht langsamer |
| d-ego | 4+4 | steht | GPU je Bild ms (gpu-bank) | 12.84 | 12.78 | -0.06 | 0.66 | nicht langsamer |
| d-ego | 4+4 | steht | Belegung p95 ms | 6.53 | 6.46 | -0.07 | 0.25 | nicht langsamer |
| d-ego | 4+4 | Zählung | steht Befehle | 50 | 50 | 0 | – | – |
| d-ego | 4+4 | Zählung | steht Dreiecke p95 | 356957 | 364310 | 7353 | – | – |
| d-ego | 4+4 | Zählung | steht VRAM MB | 107.43 | 107.28 | -0.15 | – | – |
| **d-ego** | 4+4 | | **Urteil** | | | | | **nicht-langsamer** |
| stadt | 2+2 | steht | fps | 78.8 | 78.75 | -0.05 | 0.1 | nicht langsamer |
| stadt | 2+2 | steht | Frame p95 ms | 16.8 | 16.8 | 0 | 0 | nicht langsamer |
| stadt | 2+2 | steht | CPU-Takt p95 ms | 6.8 | 6.75 | -0.05 | 0.22 | nicht langsamer |
| stadt | 2+2 | steht | Belegung p95 ms | 10.38 | 10.34 | -0.04 | 0.42 | nicht langsamer |
| stadt | 2+2 | geht | fps | 46.15 | 47.15 | 1 | 1.03 | nicht langsamer |
| stadt | 2+2 | geht | Frame p95 ms | 37.5 | 33.45 | -4.05 | 8.2 | nicht langsamer |
| stadt | 2+2 | geht | CPU-Takt p95 ms | 34.7 | 34.05 | -0.65 | 1.99 | nicht langsamer |
| stadt | 2+2 | geht | Belegung p95 ms | 37.1 | 35.59 | -1.51 | 1.33 | nicht langsamer |
| stadt | 2+2 | Zählung | steht Befehle | 57 | 57 | 0 | – | – |
| stadt | 2+2 | Zählung | steht Dreiecke p95 | 1235820 | 1234486 | -1334 | – | – |
| stadt | 2+2 | Zählung | steht VRAM MB | 174.5 | 168.55 | -5.95 | – | – |
| stadt | 2+2 | Zählung | geht Befehle | 78 | 78 | 0 | – | – |
| stadt | 2+2 | Zählung | geht Dreiecke p95 | 1404525 | 1406270 | 1745 | – | – |
| stadt | 2+2 | Zählung | geht VRAM MB | 174.15 | 172.5 | -1.65 | – | – |
| **stadt** | 2+2 | | **Urteil** | | | | | **nicht-langsamer** |

Instrument je Boot: f85ddf35b (d-ego-A1, d-ego-A2, d-ego-A3, d-ego-A4, d-ego-B1, d-ego-B2, d-ego-B3, d-ego-B4, stadt-A1, stadt-A2, stadt-B1, stadt-B2, w-ego-A1, w-ego-A2, w-ego-A3, w-ego-A4, w-ego-B1, w-ego-B2, w-ego-B3, w-ego-B4)

Roh: `bericht/z40z43-abab/`.
