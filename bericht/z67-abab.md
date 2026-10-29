# z67-abab — ABAB 29a5f696 gegen b3f9ae95: LANGSAMER

GTX 1060, `--echt` 1920×1080, Regler voll, Messplatz-Dienst (zug/messplatz.md). A = b3f9ae95d3bf1188285b135c757b074a12ee3f22, B = 29a5f696dbfa0ddac659b8ce808e83f32bf1ad29, Instrument aus B. Je Zelle 2+2, verlängert auf 4+4 nur bei Kern-Anschlag oder einer Größe zwischen 1σ und 2σ. Urteil je Größe Δ ≤ max(2σ gepoolt, Auflösung).

| Zelle | n A+B | Gang | Größe | A | B | Δ B − A | 2σ | Urteil |
|---|---|---|---|---|---|---|---|---|
| w-ego | 4+4 | steht | fps | 75.27 | 74.6 | -0.67 | 2.6 | nicht langsamer |
| w-ego | 4+4 | steht | Frame p95 ms | 16.8 | 16.8 | 0 | 0 | nicht langsamer |
| w-ego | 4+4 | steht | CPU-Takt p95 ms | 4.57 | 4.58 | 0 | 0.4 | nicht langsamer |
| w-ego | 4+4 | steht | GPU je Bild ms (gpu-bank) | 12.76 | 12.86 | 0.1 | 0.48 | nicht langsamer |
| w-ego | 4+4 | steht | Belegung p95 ms | 6.55 | 6.51 | -0.04 | 0.38 | nicht langsamer |
| w-ego | 4+4 | geht | fps | 59.97 | 60 | 0.03 | 1.89 | nicht langsamer |
| w-ego | 4+4 | geht | Frame p95 ms | 25.1 | 25.08 | -0.02 | 0.07 | nicht langsamer |
| w-ego | 4+4 | geht | CPU-Takt p95 ms | 18.35 | 18.48 | 0.13 | 1.25 | nicht langsamer |
| w-ego | 4+4 | geht | Belegung p95 ms | 21.84 | 21.83 | -0.01 | 0.85 | nicht langsamer |
| w-ego | 4+4 | Zählung | steht Befehle | 39 | 39 | 0 | – | – |
| w-ego | 4+4 | Zählung | steht Dreiecke p95 | 264236 | 264242 | 6 | – | – |
| w-ego | 4+4 | Zählung | steht VRAM MB | 107.77 | 107.85 | 0.08 | – | – |
| w-ego | 4+4 | Zählung | geht Befehle | 56.5 | 56.75 | 0.25 | – | – |
| w-ego | 4+4 | Zählung | geht Dreiecke p95 | 380979 | 381296 | 317.5 | – | – |
| w-ego | 4+4 | Zählung | geht VRAM MB | 111.7 | 111.9 | 0.2 | – | – |
| **w-ego** | 4+4 | | **Urteil** | | | | | **nicht-langsamer** |
| d-ego | 2+2 | steht | fps | 73.75 | 73.65 | -0.1 | 2.52 | nicht langsamer |
| d-ego | 2+2 | steht | Frame p95 ms | 16.8 | 16.8 | 0 | 0 | nicht langsamer |
| d-ego | 2+2 | steht | CPU-Takt p95 ms | 5.65 | 5 | -0.65 | 0.92 | nicht langsamer |
| d-ego | 2+2 | steht | GPU je Bild ms (gpu-bank) | 12.64 | 12.71 | 0.06 | 0.73 | nicht langsamer |
| d-ego | 2+2 | steht | Belegung p95 ms | 7.91 | 7.13 | -0.78 | 1.26 | nicht langsamer |
| d-ego | 2+2 | Zählung | steht Befehle | 51 | 51 | 0 | – | – |
| d-ego | 2+2 | Zählung | steht Dreiecke p95 | 295839 | 364942 | 69103 | – | – |
| d-ego | 2+2 | Zählung | steht VRAM MB | 105.55 | 106.05 | 0.5 | – | – |
| **d-ego** | 2+2 | | **Urteil** | | | | | **nicht-langsamer** |
| stadt | 4+4 | steht | fps | 79.55 | 77.45 | -2.1 | 0.23 | LANGSAMER |
| stadt | 4+4 | steht | Frame p95 ms | 16.7 | 16.83 | 0.13 | 0.07 | LANGSAMER |
| stadt | 4+4 | steht | CPU-Takt p95 ms | 5.95 | 8.5 | 2.55 | 0.67 | LANGSAMER |
| stadt | 4+4 | steht | Belegung p95 ms | 8.61 | 12.95 | 4.34 | 0.89 | LANGSAMER |
| stadt | 4+4 | geht | fps | 59.88 | 41.85 | -18.02 | 1.04 | LANGSAMER |
| stadt | 4+4 | geht | Frame p95 ms | 25.1 | 41.68 | 16.58 | 0.07 | LANGSAMER |
| stadt | 4+4 | geht | CPU-Takt p95 ms | 22.83 | 36.8 | 13.97 | 1.57 | LANGSAMER |
| stadt | 4+4 | geht | Belegung p95 ms | 24.62 | 40.27 | 15.65 | 2.02 | LANGSAMER |
| stadt | 4+4 | Zählung | steht Befehle | 53 | 59 | 6 | – | – |
| stadt | 4+4 | Zählung | steht Dreiecke p95 | 601767 | 1249441 | 647674 | – | – |
| stadt | 4+4 | Zählung | steht VRAM MB | 166.65 | 173.73 | 7.08 | – | – |
| stadt | 4+4 | Zählung | geht Befehle | 54 | 77.75 | 23.75 | – | – |
| stadt | 4+4 | Zählung | geht Dreiecke p95 | 581608 | 1497115 | 915507 | – | – |
| stadt | 4+4 | Zählung | geht VRAM MB | 157.73 | 174.08 | 16.35 | – | – |
| **stadt** | 4+4 | | **Urteil** | | | | | **LANGSAMER** |

Instrument je Boot: b3f9ae95d (d-ego-A1, d-ego-A2, d-ego-B1, d-ego-B2, stadt-A1, stadt-A2, stadt-A3, stadt-A4, stadt-B1, stadt-B2, stadt-B3, stadt-B4, w-ego-A1, w-ego-A2, w-ego-A3, w-ego-A4, w-ego-B1, w-ego-B2, w-ego-B3, w-ego-B4)

Roh: `bericht/z67-abab/`.
