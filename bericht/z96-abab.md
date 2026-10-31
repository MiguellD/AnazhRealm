# z96-abab — ABAB f1a654f1 gegen 8075fc03: nicht-langsamer

GTX 1060, `--echt` 1920×1080, Regler voll, Messplatz-Dienst (zug/messplatz.md). A = 8075fc036a9534b7ef772fc42dd4a19502c38aeb, B = f1a654f175f05fd66c1b3e08715101bdce10e21f, Instrument aus B. Je Zelle 2+2, verlängert auf 4+4 nur bei Kern-Anschlag oder einer Größe zwischen 1σ und 2σ. Urteil je Größe Δ ≤ max(2σ gepoolt, Auflösung).

| Zelle | n A+B | Gang | Größe | A | B | Δ B − A | 2σ | Urteil |
|---|---|---|---|---|---|---|---|---|
| stadt | 2+2 | steht | fps | 64.65 | 65.7 | 1.05 | 5.1 | nicht langsamer |
| stadt | 2+2 | steht | Frame p95 ms | 25 | 25.05 | 0.05 | 0.1 | nicht langsamer |
| stadt | 2+2 | steht | CPU-Takt p95 ms | 14.5 | 12.25 | -2.25 | 6.77 | nicht langsamer |
| stadt | 2+2 | steht | Belegung p95 ms | 19.89 | 19.38 | -0.51 | 3.55 | nicht langsamer |
| stadt | 2+2 | geht | fps | 26.25 | 27.2 | 0.95 | 12.26 | nicht langsamer |
| stadt | 2+2 | geht | Frame p95 ms | 70.9 | 70.85 | -0.05 | 26.53 | nicht langsamer |
| stadt | 2+2 | geht | CPU-Takt p95 ms | 68.8 | 59.5 | -9.3 | 30.58 | nicht langsamer |
| stadt | 2+2 | geht | Belegung p95 ms | 74.06 | 68.38 | -5.68 | 35.02 | nicht langsamer |
| stadt | 2+2 | Zählung | steht Befehle | 59.5 | 59 | -0.5 | – | – |
| stadt | 2+2 | Zählung | steht Dreiecke p95 | 1267141 | 1252147 | -14993 | – | – |
| stadt | 2+2 | Zählung | steht VRAM MB | 189.95 | 189.6 | -0.35 | – | – |
| stadt | 2+2 | Zählung | geht Befehle | 82 | 96 | 14 | – | – |
| stadt | 2+2 | Zählung | geht Dreiecke p95 | 1372368 | 1433196 | 60828 | – | – |
| stadt | 2+2 | Zählung | geht VRAM MB | 205.95 | 222.4 | 16.45 | – | – |
| **stadt** | 2+2 | | **Urteil** | | | | | **nicht-langsamer** |
| w-ego | 4+4 | steht | fps | 66.17 | 65.8 | -0.38 | 1.67 | nicht langsamer |
| w-ego | 4+4 | steht | Frame p95 ms | 16.8 | 16.8 | 0 | 0 | nicht langsamer |
| w-ego | 4+4 | steht | CPU-Takt p95 ms | 5.82 | 5.83 | 0 | 0.44 | nicht langsamer |
| w-ego | 4+4 | steht | GPU je Bild ms (gpu-bank) | 14.57 | 14.67 | 0.1 | 0.33 | nicht langsamer |
| w-ego | 4+4 | steht | Belegung p95 ms | 8.56 | 8.66 | 0.1 | 0.92 | nicht langsamer |
| w-ego | 4+4 | geht | fps | 54.78 | 54.8 | 0.02 | 1.07 | nicht langsamer |
| w-ego | 4+4 | geht | Frame p95 ms | 25.13 | 25.18 | 0.05 | 0.1 | nicht langsamer (1σ–2σ) |
| w-ego | 4+4 | geht | CPU-Takt p95 ms | 19.23 | 19.18 | -0.05 | 0.82 | nicht langsamer |
| w-ego | 4+4 | geht | Belegung p95 ms | 23.23 | 23.31 | 0.09 | 1.08 | nicht langsamer |
| w-ego | 4+4 | Zählung | steht Befehle | 41 | 41 | 0 | – | – |
| w-ego | 4+4 | Zählung | steht Dreiecke p95 | 261276 | 261303 | 26.5 | – | – |
| w-ego | 4+4 | Zählung | steht VRAM MB | 117.6 | 117.65 | 0.05 | – | – |
| w-ego | 4+4 | Zählung | geht Befehle | 58 | 58 | 0 | – | – |
| w-ego | 4+4 | Zählung | geht Dreiecke p95 | 385616 | 383481 | -2135 | – | – |
| w-ego | 4+4 | Zählung | geht VRAM MB | 122.2 | 122.1 | -0.1 | – | – |
| **w-ego** | 4+4 | | **Urteil** | | | | | **nicht-langsamer** |

Instrument je Boot: 8075fc036 (stadt-A1, stadt-A2, stadt-B1, stadt-B2, w-ego-A1, w-ego-A2, w-ego-A3, w-ego-A4, w-ego-B1, w-ego-B2, w-ego-B3, w-ego-B4)

Roh: `bericht/z96-abab/`.
