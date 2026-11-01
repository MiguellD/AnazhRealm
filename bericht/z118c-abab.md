# z118c-abab — ABAB c351b318 gegen b895650c: nicht-langsamer

GTX 1060, `--echt` 1920×1080, Regler voll, Messplatz-Dienst (zug/messplatz.md). A = b895650c7dc2e303a3299ed17b04c6350d002437, B = c351b31853a3c5439a73e62238f7d90e421c4050, Instrument aus B. Je Zelle 2+2, verlängert auf 4+4 nur bei Kern-Anschlag oder einer Größe zwischen 1σ und 2σ. Urteil je Größe Δ ≤ max(2σ gepoolt, Auflösung).

| Zelle | n A+B | Gang | Größe | A | B | Δ B − A | 2σ | Urteil |
|---|---|---|---|---|---|---|---|---|
| w-ego | 2+2 | steht | fps | 48 | 48.35 | 0.35 | 1.08 | nicht langsamer |
| w-ego | 2+2 | steht | Frame p95 ms | 25.1 | 25.1 | 0 | 0 | nicht langsamer |
| w-ego | 2+2 | steht | CPU-Takt p95 ms | 5.85 | 5.85 | 0 | 0.32 | nicht langsamer |
| w-ego | 2+2 | steht | GPU je Bild ms (gpu-bank) | 20.05 | 19.98 | -0.08 | 0.44 | nicht langsamer |
| w-ego | 2+2 | steht | Belegung p95 ms | 10.25 | 10.36 | 0.11 | 0.36 | nicht langsamer |
| w-ego | 2+2 | geht | fps | 43.45 | 43.75 | 0.3 | 0.14 | nicht langsamer |
| w-ego | 2+2 | geht | Frame p95 ms | 33.3 | 33.4 | 0.1 | 0 | nicht langsamer |
| w-ego | 2+2 | geht | CPU-Takt p95 ms | 19.2 | 19 | -0.2 | 0.45 | nicht langsamer |
| w-ego | 2+2 | geht | Belegung p95 ms | 27.78 | 27.75 | -0.03 | 0.78 | nicht langsamer |
| w-ego | 2+2 | Zählung | steht Befehle | 43 | 43 | 0 | – | – |
| w-ego | 2+2 | Zählung | steht Dreiecke p95 | 300848 | 302220 | 1372 | – | – |
| w-ego | 2+2 | Zählung | steht VRAM MB | 119.1 | 119.25 | 0.15 | – | – |
| w-ego | 2+2 | Zählung | geht Befehle | 59 | 59 | 0 | – | – |
| w-ego | 2+2 | Zählung | geht Dreiecke p95 | 405151 | 406208 | 1057 | – | – |
| w-ego | 2+2 | Zählung | geht VRAM MB | 126.45 | 127 | 0.55 | – | – |
| **w-ego** | 2+2 | | **Urteil** | | | | | **nicht-langsamer** |
| stadt | 2+2 | steht | fps | 57.95 | 57.6 | -0.35 | 1.36 | nicht langsamer |
| stadt | 2+2 | steht | Frame p95 ms | 25.05 | 25.05 | 0 | 0.14 | nicht langsamer |
| stadt | 2+2 | steht | CPU-Takt p95 ms | 10.7 | 10.7 | 0 | 0.89 | nicht langsamer |
| stadt | 2+2 | steht | Belegung p95 ms | 17.82 | 17.72 | -0.1 | 1.14 | nicht langsamer |
| stadt | 2+2 | geht | fps | 33.35 | 33.25 | -0.1 | 2.92 | nicht langsamer |
| stadt | 2+2 | geht | Frame p95 ms | 54.15 | 54.1 | -0.05 | 11.67 | nicht langsamer |
| stadt | 2+2 | geht | CPU-Takt p95 ms | 48.35 | 47.45 | -0.9 | 5.07 | nicht langsamer |
| stadt | 2+2 | geht | Belegung p95 ms | 53.99 | 53.57 | -0.42 | 6.35 | nicht langsamer |
| stadt | 2+2 | Zählung | steht Befehle | 64 | 64 | 0 | – | – |
| stadt | 2+2 | Zählung | steht Dreiecke p95 | 1314191 | 1300115 | -14076 | – | – |
| stadt | 2+2 | Zählung | steht VRAM MB | 193.1 | 193.35 | 0.25 | – | – |
| stadt | 2+2 | Zählung | geht Befehle | 94.5 | 94 | -0.5 | – | – |
| stadt | 2+2 | Zählung | geht Dreiecke p95 | 1457522 | 1452823 | -4699 | – | – |
| stadt | 2+2 | Zählung | geht VRAM MB | 213.9 | 229.1 | 15.2 | – | – |
| **stadt** | 2+2 | | **Urteil** | | | | | **nicht-langsamer** |

Instrument je Boot: b895650c7 (stadt-A1, stadt-A2, stadt-B1, stadt-B2, w-ego-A1, w-ego-A2, w-ego-B1, w-ego-B2)

Roh: `bericht/z118c-abab/`.
