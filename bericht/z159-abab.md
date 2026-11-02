# z159-abab — ABAB 10770eb5 gegen 6a571e3b: LANGSAMER

GTX 1060, `--echt` 1920×1080, Regler voll, Messplatz-Dienst (zug/messplatz.md). A = 6a571e3b98934cbc73b85e217f7fa69b080d415a, B = 10770eb5698e05aef55914ee1b08907fb4b285a6, Instrument aus B. Je Zelle 2+2, verlängert auf 4+4 nur bei Kern-Anschlag oder einer Größe zwischen 1σ und 2σ. Urteil je Größe Δ ≤ max(2σ gepoolt, Auflösung).

| Zelle | n A+B | Gang | Größe | A | B | Δ B − A | 2σ | Urteil |
|---|---|---|---|---|---|---|---|---|
| w-ego | 4+4 | steht | fps | 58.15 | 57.2 | -0.95 | 2.87 | nicht langsamer |
| w-ego | 4+4 | steht | Frame p95 ms | 20.98 | 23 | 2.02 | 8.73 | nicht langsamer |
| w-ego | 4+4 | steht | CPU-Takt p95 ms | 7.07 | 7.57 | 0.5 | 0.81 | nicht langsamer (1σ–2σ) |
| w-ego | 4+4 | steht | GPU je Bild ms (gpu-bank) | 16.33 | 16.46 | 0.13 | 0.61 | nicht langsamer |
| w-ego | 4+4 | steht | Belegung p95 ms | 11.59 | 12.62 | 1.03 | 1.87 | nicht langsamer |
| w-ego | 4+4 | geht | fps | 49.02 | 48 | -1.02 | 2.84 | nicht langsamer |
| w-ego | 4+4 | geht | Frame p95 ms | 33.3 | 32.92 | -0.38 | 1.16 | nicht langsamer |
| w-ego | 4+4 | geht | CPU-Takt p95 ms | 22.58 | 23.7 | 1.12 | 3.4 | nicht langsamer |
| w-ego | 4+4 | geht | Belegung p95 ms | 26.86 | 27.64 | 0.78 | 2.29 | nicht langsamer |
| w-ego | 4+4 | Zählung | steht Befehle | 43 | 44 | 1 | – | – |
| w-ego | 4+4 | Zählung | steht Dreiecke p95 | 309651 | 310151 | 499.25 | – | – |
| w-ego | 4+4 | Zählung | steht VRAM MB | 119.68 | 119.85 | 0.17 | – | – |
| w-ego | 4+4 | Zählung | geht Befehle | 59 | 60 | 1 | – | – |
| w-ego | 4+4 | Zählung | geht Dreiecke p95 | 407831 | 409727 | 1896 | – | – |
| w-ego | 4+4 | Zählung | geht VRAM MB | 125.53 | 125.55 | 0.02 | – | – |
| **w-ego** | 4+4 | | **Urteil** | | | | | **nicht-langsamer** |
| stadt | 4+4 | steht | fps | 66.68 | 66.15 | -0.53 | 1.23 | nicht langsamer |
| stadt | 4+4 | steht | Frame p95 ms | 25 | 25.05 | 0.05 | 0.08 | nicht langsamer (1σ–2σ) |
| stadt | 4+4 | steht | CPU-Takt p95 ms | 10.8 | 11.05 | 0.25 | 0.27 | nicht langsamer (1σ–2σ) |
| stadt | 4+4 | steht | Belegung p95 ms | 16.86 | 17.66 | 0.8 | 0.45 | LANGSAMER |
| stadt | 4+4 | geht | fps | 25.9 | 25.78 | -0.12 | 3.81 | nicht langsamer |
| stadt | 4+4 | geht | Frame p95 ms | 54.25 | 58.33 | 4.08 | 11.64 | nicht langsamer |
| stadt | 4+4 | geht | CPU-Takt p95 ms | 50.48 | 49.92 | -0.55 | 7.57 | nicht langsamer |
| stadt | 4+4 | geht | Belegung p95 ms | 55.83 | 56.64 | 0.81 | 7.9 | nicht langsamer |
| stadt | 4+4 | Zählung | steht Befehle | 63 | 63.75 | 0.75 | – | – |
| stadt | 4+4 | Zählung | steht Dreiecke p95 | 1294051 | 1292320 | -1731 | – | – |
| stadt | 4+4 | Zählung | steht VRAM MB | 187.18 | 190.65 | 3.47 | – | – |
| stadt | 4+4 | Zählung | geht Befehle | 85 | 87.25 | 2.25 | – | – |
| stadt | 4+4 | Zählung | geht Dreiecke p95 | 1347832 | 1353684 | 5852 | – | – |
| stadt | 4+4 | Zählung | geht VRAM MB | 214.83 | 216.9 | 2.07 | – | – |
| **stadt** | 4+4 | | **Urteil** | | | | | **LANGSAMER** |

Instrument je Boot: 6a571e3b9 (stadt-A1, stadt-A2, stadt-A3, stadt-A4, stadt-B1, stadt-B2, stadt-B3, stadt-B4, w-ego-A1, w-ego-A2, w-ego-A3, w-ego-A4, w-ego-B1, w-ego-B2, w-ego-B3, w-ego-B4)

Roh: `bericht/z159-abab/`.
