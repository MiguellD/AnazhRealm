# z122-abab — ABAB eeb5d2bf gegen 4b13478b: nicht-langsamer

GTX 1060, `--echt` 1920×1080, Regler voll, Messplatz-Dienst (zug/messplatz.md). A = 4b13478b5ca245925c8a2ca4fe700b33d4e72959, B = eeb5d2bfbcdae181388a990d13c434cd67b923a0, Instrument aus B. Je Zelle 2+2, verlängert auf 4+4 nur bei Kern-Anschlag oder einer Größe zwischen 1σ und 2σ. Urteil je Größe Δ ≤ max(2σ gepoolt, Auflösung).

| Zelle | n A+B | Gang | Größe | A | B | Δ B − A | 2σ | Urteil |
|---|---|---|---|---|---|---|---|---|
| w-ego | 4+4 | steht | fps | 49.13 | 48.98 | -0.15 | 1.14 | nicht langsamer |
| w-ego | 4+4 | steht | Frame p95 ms | 25.13 | 25.15 | 0.02 | 0.11 | nicht langsamer |
| w-ego | 4+4 | steht | CPU-Takt p95 ms | 5.6 | 5.6 | 0 | 0.59 | nicht langsamer |
| w-ego | 4+4 | steht | GPU je Bild ms (gpu-bank) | 19.55 | 19.62 | 0.07 | 0.56 | nicht langsamer |
| w-ego | 4+4 | steht | Belegung p95 ms | 9.7 | 9.67 | -0.03 | 0.95 | nicht langsamer |
| w-ego | 4+4 | geht | fps | 44.52 | 44.38 | -0.15 | 1.12 | nicht langsamer |
| w-ego | 4+4 | geht | Frame p95 ms | 33.4 | 33.4 | 0 | 0 | nicht langsamer |
| w-ego | 4+4 | geht | CPU-Takt p95 ms | 18.65 | 18.38 | -0.27 | 0.82 | nicht langsamer |
| w-ego | 4+4 | geht | Belegung p95 ms | 26.86 | 26.72 | -0.14 | 1.26 | nicht langsamer |
| w-ego | 4+4 | Zählung | steht Befehle | 43 | 43 | 0 | – | – |
| w-ego | 4+4 | Zählung | steht Dreiecke p95 | 300888 | 302916 | 2029 | – | – |
| w-ego | 4+4 | Zählung | steht VRAM MB | 119.08 | 119.15 | 0.08 | – | – |
| w-ego | 4+4 | Zählung | geht Befehle | 59 | 59 | 0 | – | – |
| w-ego | 4+4 | Zählung | geht Dreiecke p95 | 407025 | 404183 | -2841 | – | – |
| w-ego | 4+4 | Zählung | geht VRAM MB | 126.55 | 125 | -1.55 | – | – |
| **w-ego** | 4+4 | | **Urteil** | | | | | **nicht-langsamer** |
| stadt | 2+2 | steht | fps | 59.2 | 58.75 | -0.45 | 0.81 | nicht langsamer |
| stadt | 2+2 | steht | Frame p95 ms | 25 | 25 | 0 | 0 | nicht langsamer |
| stadt | 2+2 | steht | CPU-Takt p95 ms | 10.8 | 10.95 | 0.15 | 0.3 | nicht langsamer |
| stadt | 2+2 | steht | Belegung p95 ms | 17.25 | 17.58 | 0.33 | 0.69 | nicht langsamer |
| stadt | 2+2 | geht | fps | 34.45 | 34.45 | 0 | 2.21 | nicht langsamer |
| stadt | 2+2 | geht | Frame p95 ms | 54.15 | 50 | -4.15 | 8.1 | nicht langsamer |
| stadt | 2+2 | geht | CPU-Takt p95 ms | 46.3 | 44 | -2.3 | 2.41 | nicht langsamer |
| stadt | 2+2 | geht | Belegung p95 ms | 51.57 | 50.47 | -1.1 | 0.35 | nicht langsamer |
| stadt | 2+2 | Zählung | steht Befehle | 63.5 | 64 | 0.5 | – | – |
| stadt | 2+2 | Zählung | steht Dreiecke p95 | 1307241 | 1299374 | -7867 | – | – |
| stadt | 2+2 | Zählung | steht VRAM MB | 193.65 | 193.85 | 0.2 | – | – |
| stadt | 2+2 | Zählung | geht Befehle | 93.5 | 93.5 | 0 | – | – |
| stadt | 2+2 | Zählung | geht Dreiecke p95 | 1448118 | 1442941 | -5177 | – | – |
| stadt | 2+2 | Zählung | geht VRAM MB | 195.15 | 194.6 | -0.55 | – | – |
| **stadt** | 2+2 | | **Urteil** | | | | | **nicht-langsamer** |

Instrument je Boot: 4b13478b5 (stadt-A1, stadt-A2, stadt-B1, stadt-B2, w-ego-A1, w-ego-A2, w-ego-A3, w-ego-A4, w-ego-B1, w-ego-B2, w-ego-B3, w-ego-B4)

Roh: `bericht/z122-abab/`.
