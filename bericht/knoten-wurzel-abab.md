# knoten-wurzel-abab — ABAB b7ea7cdc gegen 1e90e7cd: nicht-langsamer

GTX 1060, `--echt` 1920×1080, Regler voll, Messplatz-Dienst (zug/messplatz.md). A = 1e90e7cd850ad32a8567bad9a5a8b241593a8e93, B = b7ea7cdc45f9736af0247f2945518f83c4d39939, Instrument aus B. Je Zelle 2+2, verlängert auf 4+4 nur bei Kern-Anschlag oder einer Größe zwischen 1σ und 2σ. Urteil je Größe Δ ≤ max(2σ gepoolt, Auflösung).

| Zelle | n A+B | Gang | Größe | A | B | Δ B − A | 2σ | Urteil |
|---|---|---|---|---|---|---|---|---|
| w-ego | 4+4 | steht | fps | 57.92 | 57.6 | -0.33 | 1.38 | nicht langsamer |
| w-ego | 4+4 | steht | Frame p95 ms | 23 | 25 | 2 | 5.56 | nicht langsamer |
| w-ego | 4+4 | steht | CPU-Takt p95 ms | 6.85 | 7.03 | 0.18 | 0.8 | nicht langsamer |
| w-ego | 4+4 | steht | GPU je Bild ms (gpu-bank) | 16.18 | 16.3 | 0.12 | 0.36 | nicht langsamer |
| w-ego | 4+4 | steht | Belegung p95 ms | 11.17 | 11.26 | 0.09 | 1.8 | nicht langsamer |
| w-ego | 4+4 | geht | fps | 50.2 | 49.9 | -0.3 | 1.58 | nicht langsamer |
| w-ego | 4+4 | geht | Frame p95 ms | 31.27 | 31.32 | 0.05 | 7.94 | nicht langsamer |
| w-ego | 4+4 | geht | CPU-Takt p95 ms | 21.75 | 21.8 | 0.05 | 1.24 | nicht langsamer |
| w-ego | 4+4 | geht | Belegung p95 ms | 26.14 | 26.3 | 0.16 | 1.3 | nicht langsamer |
| w-ego | 4+4 | Zählung | steht Befehle | 43 | 43 | 0 | – | – |
| w-ego | 4+4 | Zählung | steht Dreiecke p95 | 312869 | 312244 | -625 | – | – |
| w-ego | 4+4 | Zählung | steht VRAM MB | 120.5 | 120.58 | 0.08 | – | – |
| w-ego | 4+4 | Zählung | geht Befehle | 59 | 59 | 0 | – | – |
| w-ego | 4+4 | Zählung | geht Dreiecke p95 | 414034 | 412042 | -1992 | – | – |
| w-ego | 4+4 | Zählung | geht VRAM MB | 126.43 | 126.3 | -0.13 | – | – |
| **w-ego** | 4+4 | | **Urteil** | | | | | **nicht-langsamer** |
| stadt | 2+2 | steht | fps | 66.8 | 68.6 | 1.8 | 1.97 | nicht langsamer |
| stadt | 2+2 | steht | Frame p95 ms | 24.95 | 17.35 | -7.6 | 0.71 | nicht langsamer |
| stadt | 2+2 | steht | CPU-Takt p95 ms | 11.8 | 9.95 | -1.85 | 1.8 | nicht langsamer |
| stadt | 2+2 | steht | Belegung p95 ms | 17.52 | 15.37 | -2.16 | 2.4 | nicht langsamer |
| stadt | 2+2 | geht | fps | 33.3 | 35.55 | 2.25 | 2.5 | nicht langsamer |
| stadt | 2+2 | geht | Frame p95 ms | 54.2 | 50 | -4.2 | 8.2 | nicht langsamer |
| stadt | 2+2 | geht | CPU-Takt p95 ms | 48.85 | 43.75 | -5.1 | 2.92 | nicht langsamer |
| stadt | 2+2 | geht | Belegung p95 ms | 54.19 | 49.59 | -4.6 | 3.23 | nicht langsamer |
| stadt | 2+2 | Zählung | steht Befehle | 63 | 62.5 | -0.5 | – | – |
| stadt | 2+2 | Zählung | steht Dreiecke p95 | 1277124 | 1273195 | -3929 | – | – |
| stadt | 2+2 | Zählung | steht VRAM MB | 190.6 | 191.9 | 1.3 | – | – |
| stadt | 2+2 | Zählung | geht Befehle | 96.5 | 96 | -0.5 | – | – |
| stadt | 2+2 | Zählung | geht Dreiecke p95 | 1441103 | 1434377 | -6726 | – | – |
| stadt | 2+2 | Zählung | geht VRAM MB | 193.85 | 194.35 | 0.5 | – | – |
| **stadt** | 2+2 | | **Urteil** | | | | | **nicht-langsamer** |

Instrument je Boot: 1e90e7cd8 (stadt-A1, stadt-A2, stadt-B1, stadt-B2, w-ego-A1, w-ego-A2, w-ego-A3, w-ego-A4, w-ego-B1, w-ego-B2, w-ego-B3, w-ego-B4)

Roh: `bericht/knoten-wurzel-abab/`.
