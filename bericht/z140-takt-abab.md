# z140-takt-abab — ABAB 5a341855 gegen 25ac4c0c: LANGSAMER

GTX 1060, `--echt` 1920×1080, Regler voll, Messplatz-Dienst (zug/messplatz.md). A = 25ac4c0c485570ed887cffb7f175d430264f86bf, B = 5a34185577a22288299244f90a6029ee271416bd, Instrument aus B. Je Zelle 2+2, verlängert auf 4+4 nur bei Kern-Anschlag oder einer Größe zwischen 1σ und 2σ. Urteil je Größe Δ ≤ max(2σ gepoolt, Auflösung).

| Zelle | n A+B | Gang | Größe | A | B | Δ B − A | 2σ | Urteil |
|---|---|---|---|---|---|---|---|---|
| w-ego | 4+4 | steht | fps | 58.9 | 57.9 | -1 | 0.94 | LANGSAMER |
| w-ego | 4+4 | steht | Frame p95 ms | 19.07 | 25 | 5.93 | 5.59 | LANGSAMER |
| w-ego | 4+4 | steht | CPU-Takt p95 ms | 5.68 | 6.08 | 0.4 | 0.86 | nicht langsamer |
| w-ego | 4+4 | steht | GPU je Bild ms (gpu-bank) | 16.14 | 16.25 | 0.12 | 0.51 | nicht langsamer |
| w-ego | 4+4 | steht | Belegung p95 ms | 8.71 | 10.48 | 1.78 | 1.56 | LANGSAMER |
| w-ego | 4+4 | geht | fps | 44.07 | 49.7 | 5.63 | 1.47 | nicht langsamer |
| w-ego | 4+4 | geht | Frame p95 ms | 33.35 | 33.3 | -0.05 | 0.08 | nicht langsamer |
| w-ego | 4+4 | geht | CPU-Takt p95 ms | 28.65 | 21.75 | -6.9 | 1.54 | nicht langsamer |
| w-ego | 4+4 | geht | Belegung p95 ms | 29.73 | 26.35 | -3.38 | 1.49 | nicht langsamer |
| w-ego | 4+4 | Zählung | steht Befehle | 43 | 43 | 0 | – | – |
| w-ego | 4+4 | Zählung | steht Dreiecke p95 | 312147 | 309934 | -2213 | – | – |
| w-ego | 4+4 | Zählung | steht VRAM MB | 119.82 | 113.45 | -6.37 | – | – |
| w-ego | 4+4 | Zählung | geht Befehle | 59 | 59 | 0 | – | – |
| w-ego | 4+4 | Zählung | geht Dreiecke p95 | 411186 | 409403 | -1782 | – | – |
| w-ego | 4+4 | Zählung | geht VRAM MB | 125.65 | 119.05 | -6.6 | – | – |
| **w-ego** | 4+4 | | **Urteil** | | | | | **LANGSAMER** |
| stadt | 4+4 | steht | fps | 66.38 | 66.08 | -0.3 | 3.01 | nicht langsamer |
| stadt | 4+4 | steht | Frame p95 ms | 24.98 | 24.98 | 0 | 0.1 | nicht langsamer |
| stadt | 4+4 | steht | CPU-Takt p95 ms | 10.9 | 11.8 | 0.9 | 0.86 | LANGSAMER |
| stadt | 4+4 | steht | Belegung p95 ms | 17.18 | 17.85 | 0.67 | 1.77 | nicht langsamer |
| stadt | 4+4 | geht | fps | 29.65 | 31.35 | 1.7 | 2.49 | nicht langsamer |
| stadt | 4+4 | geht | Frame p95 ms | 58.38 | 58.4 | 0.02 | 9.53 | nicht langsamer |
| stadt | 4+4 | geht | CPU-Takt p95 ms | 51.83 | 53.83 | 2 | 4.89 | nicht langsamer |
| stadt | 4+4 | geht | Belegung p95 ms | 59.07 | 59.4 | 0.33 | 5.85 | nicht langsamer |
| stadt | 4+4 | Zählung | steht Befehle | 63.25 | 62.25 | -1 | – | – |
| stadt | 4+4 | Zählung | steht Dreiecke p95 | 1277564 | 1278157 | 593 | – | – |
| stadt | 4+4 | Zählung | steht VRAM MB | 191.4 | 190.52 | -0.88 | – | – |
| stadt | 4+4 | Zählung | geht Befehle | 95.5 | 97 | 1.5 | – | – |
| stadt | 4+4 | Zählung | geht Dreiecke p95 | 1423648 | 1433673 | 10025 | – | – |
| stadt | 4+4 | Zählung | geht VRAM MB | 211.05 | 228.55 | 17.5 | – | – |
| **stadt** | 4+4 | | **Urteil** | | | | | **LANGSAMER** |

Instrument je Boot: 25ac4c0c4 (stadt-A1, stadt-A2, stadt-A3, stadt-A4, stadt-B1, stadt-B2, stadt-B3, stadt-B4, w-ego-A1, w-ego-A2, w-ego-A3, w-ego-A4, w-ego-B1, w-ego-B2, w-ego-B3, w-ego-B4)

Roh: `bericht/z140-takt-abab/`.
