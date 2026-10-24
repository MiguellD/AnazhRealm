# z1920-abab — ABAB 1d9164e9 gegen 6f8a2c66: nicht-langsamer

GTX 1060, `--echt` 1920×1080, Regler voll, Messplatz-Dienst (zug/messplatz.md). A = 6f8a2c6638623a037f69bf110358f36b68b343d6, B = 1d9164e9144d15f70c40e8e5876cf98a2f0cacc8, Instrument aus B. Je Zelle 2+2, verlängert auf 4+4 nur bei Kern-Anschlag oder einer Größe zwischen 1σ und 2σ. Urteil je Größe Δ ≤ max(2σ gepoolt, Auflösung).

| Zelle | n A+B | Gang | Größe | A | B | Δ B − A | 2σ | Urteil |
|---|---|---|---|---|---|---|---|---|
| w-ego | 4+4 | steht | fps | 75.42 | 75.15 | -0.27 | 0.94 | nicht langsamer |
| w-ego | 4+4 | steht | Frame p95 ms | 16.8 | 16.8 | 0 | 0 | nicht langsamer |
| w-ego | 4+4 | steht | CPU-Takt p95 ms | 4.42 | 4.03 | -0.4 | 1.08 | nicht langsamer |
| w-ego | 4+4 | steht | GPU je Bild ms (gpu-bank) | 12.61 | 12.77 | 0.15 | 0.55 | nicht langsamer |
| w-ego | 4+4 | steht | Belegung p95 ms | 6.21 | 5.78 | -0.44 | 1.31 | nicht langsamer |
| w-ego | 4+4 | geht | fps | 60.5 | 58.83 | -1.67 | 2.75 | nicht langsamer |
| w-ego | 4+4 | geht | Frame p95 ms | 25.1 | 25.1 | 0 | 0 | nicht langsamer |
| w-ego | 4+4 | geht | CPU-Takt p95 ms | 17.88 | 19.65 | 1.77 | 3.11 | nicht langsamer (1σ–2σ) |
| w-ego | 4+4 | geht | Belegung p95 ms | 21.85 | 22.93 | 1.08 | 2.07 | nicht langsamer |
| w-ego | 4+4 | Zählung | steht Befehle | 38 | 38 | 0 | – | – |
| w-ego | 4+4 | Zählung | steht Dreiecke p95 | 263982 | 263984 | 2 | – | – |
| w-ego | 4+4 | Zählung | steht VRAM MB | 107.75 | 107.83 | 0.08 | – | – |
| w-ego | 4+4 | Zählung | geht Befehle | 55 | 55 | 0 | – | – |
| w-ego | 4+4 | Zählung | geht Dreiecke p95 | 378204 | 379244 | 1040 | – | – |
| w-ego | 4+4 | Zählung | geht VRAM MB | 111.72 | 111.7 | -0.03 | – | – |
| **w-ego** | 4+4 | | **Urteil** | | | | | **nicht-langsamer** |
| d-ego | 2+2 | steht | fps | 75.6 | 76.35 | 0.75 | 1.04 | nicht langsamer |
| d-ego | 2+2 | steht | Frame p95 ms | 16.8 | 16.8 | 0 | 0 | nicht langsamer |
| d-ego | 2+2 | steht | CPU-Takt p95 ms | 5.9 | 5.2 | -0.7 | 1 | nicht langsamer |
| d-ego | 2+2 | steht | GPU je Bild ms (gpu-bank) | 12.55 | 12.18 | -0.37 | 0.64 | nicht langsamer |
| d-ego | 2+2 | steht | Belegung p95 ms | 7.9 | 7.07 | -0.83 | 1.38 | nicht langsamer |
| d-ego | 2+2 | Zählung | steht Befehle | 59 | 59 | 0 | – | – |
| d-ego | 2+2 | Zählung | steht Dreiecke p95 | 446242 | 440514 | -5728 | – | – |
| d-ego | 2+2 | Zählung | steht VRAM MB | 112.75 | 110.85 | -1.9 | – | – |
| **d-ego** | 2+2 | | **Urteil** | | | | | **nicht-langsamer** |

Instrument je Boot: 6f8a2c663 (d-ego-A1, d-ego-A2, d-ego-B1, d-ego-B2, w-ego-A1, w-ego-A2, w-ego-A3, w-ego-A4, w-ego-B1, w-ego-B2, w-ego-B3, w-ego-B4)

Roh: `bericht/z1920-abab/`.
