# z165-abab — ABAB 5fba36ea gegen 95d7bba1: LANGSAMER

GTX 1060, `--echt` 1920×1080, Regler voll, Messplatz-Dienst (zug/messplatz.md). A = 95d7bba1c91eeea0a0abca9373b6ed53ee6e0adf, B = 5fba36ea44a6e80bb9bd645900a9584c1fcce0b9, Instrument aus B. Je Zelle 2+2, verlängert auf 4+4 nur bei Kern-Anschlag oder einer Größe zwischen 1σ und 2σ. Urteil je Größe Δ ≤ max(2σ gepoolt, Auflösung).

| Zelle | n A+B | Gang | Größe | A | B | Δ B − A | 2σ | Urteil |
|---|---|---|---|---|---|---|---|---|
| w-ego | 4+4 | steht | fps | 57.85 | 58 | 0.15 | 0.48 | nicht langsamer |
| w-ego | 4+4 | steht | Frame p95 ms | 25 | 25 | 0 | 0 | nicht langsamer |
| w-ego | 4+4 | steht | CPU-Takt p95 ms | 7.65 | 6.82 | -0.83 | 0.98 | nicht langsamer |
| w-ego | 4+4 | steht | GPU je Bild ms (gpu-bank) | 16.17 | 16.16 | 0 | 0.1 | nicht langsamer |
| w-ego | 4+4 | steht | Belegung p95 ms | 13.2 | 11.5 | -1.71 | 1.68 | nicht langsamer |
| w-ego | 4+4 | geht | fps | 49.27 | 49.48 | 0.2 | 0.92 | nicht langsamer |
| w-ego | 4+4 | geht | Frame p95 ms | 31.25 | 31.25 | 0 | 8.07 | nicht langsamer |
| w-ego | 4+4 | geht | CPU-Takt p95 ms | 22.13 | 22.35 | 0.22 | 1.25 | nicht langsamer |
| w-ego | 4+4 | geht | Belegung p95 ms | 26.85 | 26.7 | -0.15 | 0.94 | nicht langsamer |
| w-ego | 4+4 | Zählung | steht Befehle | 44 | 44 | 0 | – | – |
| w-ego | 4+4 | Zählung | steht Dreiecke p95 | 314632 | 307857 | -6775 | – | – |
| w-ego | 4+4 | Zählung | steht VRAM MB | 121 | 119.15 | -1.85 | – | – |
| w-ego | 4+4 | Zählung | geht Befehle | 60 | 60 | 0 | – | – |
| w-ego | 4+4 | Zählung | geht Dreiecke p95 | 414790 | 407340 | -7450 | – | – |
| w-ego | 4+4 | Zählung | geht VRAM MB | 126.7 | 124.82 | -1.88 | – | – |
| **w-ego** | 4+4 | | **Urteil** | | | | | **nicht-langsamer** |
| stadt | 4+4 | steht | fps | 66.2 | 67 | 0.8 | 2.17 | nicht langsamer |
| stadt | 4+4 | steht | Frame p95 ms | 25 | 25 | 0 | 0 | nicht langsamer |
| stadt | 4+4 | steht | CPU-Takt p95 ms | 11.3 | 11.1 | -0.2 | 0.83 | nicht langsamer |
| stadt | 4+4 | steht | Belegung p95 ms | 18.06 | 17.37 | -0.7 | 1.37 | nicht langsamer |
| stadt | 4+4 | geht | fps | 32.95 | 32.1 | -0.85 | 1.58 | nicht langsamer |
| stadt | 4+4 | geht | Frame p95 ms | 52.15 | 56.2 | 4.05 | 8.1 | nicht langsamer |
| stadt | 4+4 | geht | CPU-Takt p95 ms | 47.4 | 48.3 | 0.9 | 2.19 | nicht langsamer |
| stadt | 4+4 | geht | Belegung p95 ms | 52.75 | 54.61 | 1.86 | 1.41 | LANGSAMER |
| stadt | 4+4 | Zählung | steht Befehle | 64.25 | 64 | -0.25 | – | – |
| stadt | 4+4 | Zählung | steht Dreiecke p95 | 1287941 | 1287326 | -615.75 | – | – |
| stadt | 4+4 | Zählung | steht VRAM MB | 192.85 | 188.9 | -3.95 | – | – |
| stadt | 4+4 | Zählung | geht Befehle | 95 | 95.25 | 0.25 | – | – |
| stadt | 4+4 | Zählung | geht Dreiecke p95 | 1374518 | 1381071 | 6553 | – | – |
| stadt | 4+4 | Zählung | geht VRAM MB | 203.9 | 227.6 | 23.7 | – | – |
| **stadt** | 4+4 | | **Urteil** | | | | | **LANGSAMER** |

Instrument je Boot: 95d7bba1c (stadt-A1, stadt-A2, stadt-A3, stadt-A4, stadt-B1, stadt-B2, stadt-B3, stadt-B4, w-ego-A1, w-ego-A2, w-ego-A3, w-ego-A4, w-ego-B1, w-ego-B2, w-ego-B3, w-ego-B4)

Roh: `bericht/z165-abab/`.
