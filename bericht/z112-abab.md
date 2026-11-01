# z112-abab — ABAB 8809ec6d gegen cdb2703d: nicht-langsamer

GTX 1060, `--echt` 1920×1080, Regler voll, Messplatz-Dienst (zug/messplatz.md). A = cdb2703d106a5e26e8f7f95aa4d982824d39ff2e, B = 8809ec6de94eb07c370e1a465a76ca085fb5c129, Instrument aus B. Je Zelle 2+2, verlängert auf 4+4 nur bei Kern-Anschlag oder einer Größe zwischen 1σ und 2σ. Urteil je Größe Δ ≤ max(2σ gepoolt, Auflösung).

| Zelle | n A+B | Gang | Größe | A | B | Δ B − A | 2σ | Urteil |
|---|---|---|---|---|---|---|---|---|
| w-ego | 4+4 | steht | fps | 66.23 | 65 | -1.23 | 2.24 | nicht langsamer |
| w-ego | 4+4 | steht | Frame p95 ms | 16.8 | 16.8 | 0 | 0 | nicht langsamer |
| w-ego | 4+4 | steht | CPU-Takt p95 ms | 5.65 | 5.95 | 0.3 | 0.84 | nicht langsamer |
| w-ego | 4+4 | steht | GPU je Bild ms (gpu-bank) | 14.53 | 14.7 | 0.17 | 0.71 | nicht langsamer |
| w-ego | 4+4 | steht | Belegung p95 ms | 8.45 | 8.76 | 0.31 | 1.15 | nicht langsamer |
| w-ego | 4+4 | geht | fps | 55.22 | 53.45 | -1.77 | 2.85 | nicht langsamer |
| w-ego | 4+4 | geht | Frame p95 ms | 25.13 | 27.18 | 2.05 | 5.68 | nicht langsamer |
| w-ego | 4+4 | geht | CPU-Takt p95 ms | 18.2 | 20.3 | 2.1 | 3.73 | nicht langsamer (1σ–2σ) |
| w-ego | 4+4 | geht | Belegung p95 ms | 23.25 | 24.18 | 0.92 | 2.26 | nicht langsamer |
| w-ego | 4+4 | Zählung | steht Befehle | 41 | 43 | 2 | – | – |
| w-ego | 4+4 | Zählung | steht Dreiecke p95 | 264721 | 301248 | 36527 | – | – |
| w-ego | 4+4 | Zählung | steht VRAM MB | 117.67 | 117.7 | 0.03 | – | – |
| w-ego | 4+4 | Zählung | geht Befehle | 56 | 58.25 | 2.25 | – | – |
| w-ego | 4+4 | Zählung | geht Dreiecke p95 | 362936 | 402999 | 40063 | – | – |
| w-ego | 4+4 | Zählung | geht VRAM MB | 124.85 | 125.05 | 0.2 | – | – |
| **w-ego** | 4+4 | | **Urteil** | | | | | **nicht-langsamer** |
| stadt | 4+4 | steht | fps | 65.03 | 65.15 | 0.12 | 3.79 | nicht langsamer |
| stadt | 4+4 | steht | Frame p95 ms | 24.98 | 25 | 0.02 | 0.07 | nicht langsamer |
| stadt | 4+4 | steht | CPU-Takt p95 ms | 12.83 | 11.65 | -1.18 | 2.4 | nicht langsamer |
| stadt | 4+4 | steht | Belegung p95 ms | 19.48 | 18.95 | -0.52 | 2.74 | nicht langsamer |
| stadt | 4+4 | geht | fps | 29.2 | 30.07 | 0.87 | 7.13 | nicht langsamer |
| stadt | 4+4 | geht | Frame p95 ms | 64.58 | 62.52 | -2.05 | 18.87 | nicht langsamer |
| stadt | 4+4 | geht | CPU-Takt p95 ms | 57.23 | 55 | -2.23 | 15.4 | nicht langsamer |
| stadt | 4+4 | geht | Belegung p95 ms | 65.42 | 62.56 | -2.85 | 17.21 | nicht langsamer |
| stadt | 4+4 | Zählung | steht Befehle | 62.25 | 64 | 1.75 | – | – |
| stadt | 4+4 | Zählung | steht Dreiecke p95 | 1284797 | 1286762 | 1965 | – | – |
| stadt | 4+4 | Zählung | steht VRAM MB | 189.57 | 190.9 | 1.33 | – | – |
| stadt | 4+4 | Zählung | geht Befehle | 90.25 | 92 | 1.75 | – | – |
| stadt | 4+4 | Zählung | geht Dreiecke p95 | 1431215 | 1438567 | 7352 | – | – |
| stadt | 4+4 | Zählung | geht VRAM MB | 215.28 | 217.05 | 1.77 | – | – |
| **stadt** | 4+4 | | **Urteil** | | | | | **nicht-langsamer** |

Instrument je Boot: cdb2703d1 (stadt-A1, stadt-A2, stadt-A3, stadt-A4, stadt-B1, stadt-B2, stadt-B3, stadt-B4, w-ego-A1, w-ego-A2, w-ego-A3, w-ego-A4, w-ego-B1, w-ego-B2, w-ego-B3, w-ego-B4)

Roh: `bericht/z112-abab/`.
