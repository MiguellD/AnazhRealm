# z140-abab — ABAB 1e90e7cd gegen 25ac4c0c: LANGSAMER

GTX 1060, `--echt` 1920×1080, Regler voll, Messplatz-Dienst (zug/messplatz.md). A = 25ac4c0c485570ed887cffb7f175d430264f86bf, B = 1e90e7cd850ad32a8567bad9a5a8b241593a8e93, Instrument aus B. Je Zelle 2+2, verlängert auf 4+4 nur bei Kern-Anschlag oder einer Größe zwischen 1σ und 2σ. Urteil je Größe Δ ≤ max(2σ gepoolt, Auflösung).

| Zelle | n A+B | Gang | Größe | A | B | Δ B − A | 2σ | Urteil |
|---|---|---|---|---|---|---|---|---|
| w-ego | 4+4 | steht | fps | 59.1 | 57.9 | -1.2 | 0.82 | LANGSAMER |
| w-ego | 4+4 | steht | Frame p95 ms | 17.07 | 24.98 | 7.9 | 0.22 | LANGSAMER |
| w-ego | 4+4 | steht | CPU-Takt p95 ms | 5.32 | 7.45 | 2.13 | 1.96 | LANGSAMER |
| w-ego | 4+4 | steht | GPU je Bild ms (gpu-bank) | 16.18 | 16.14 | -0.04 | 0.35 | nicht langsamer |
| w-ego | 4+4 | steht | Belegung p95 ms | 8.32 | 12.08 | 3.75 | 3.07 | LANGSAMER |
| w-ego | 4+4 | geht | fps | 45.8 | 49.57 | 3.77 | 3.3 | nicht langsamer |
| w-ego | 4+4 | geht | Frame p95 ms | 33.3 | 33.3 | 0 | 0 | nicht langsamer |
| w-ego | 4+4 | geht | CPU-Takt p95 ms | 26.35 | 22 | -4.35 | 3.78 | nicht langsamer |
| w-ego | 4+4 | geht | Belegung p95 ms | 28.37 | 26.73 | -1.64 | 1.86 | nicht langsamer |
| w-ego | 4+4 | Zählung | steht Befehle | 43 | 43 | 0 | – | – |
| w-ego | 4+4 | Zählung | steht Dreiecke p95 | 315182 | 314509 | -673 | – | – |
| w-ego | 4+4 | Zählung | steht VRAM MB | 119.15 | 121.03 | 1.88 | – | – |
| w-ego | 4+4 | Zählung | geht Befehle | 58.75 | 59 | 0.25 | – | – |
| w-ego | 4+4 | Zählung | geht Dreiecke p95 | 415927 | 413493 | -2434 | – | – |
| w-ego | 4+4 | Zählung | geht VRAM MB | 124.97 | 126.88 | 1.9 | – | – |
| **w-ego** | 4+4 | | **Urteil** | | | | | **LANGSAMER** |
| stadt | 2+2 | steht | fps | 66.1 | 68 | 1.9 | 1.81 | nicht langsamer |
| stadt | 2+2 | steht | Frame p95 ms | 25.05 | 24.9 | -0.15 | 0.1 | nicht langsamer |
| stadt | 2+2 | steht | CPU-Takt p95 ms | 11.1 | 10.6 | -0.5 | 0.8 | nicht langsamer |
| stadt | 2+2 | steht | Belegung p95 ms | 17.54 | 16.34 | -1.2 | 1.62 | nicht langsamer |
| stadt | 2+2 | geht | fps | 30 | 32.7 | 2.7 | 0.57 | nicht langsamer |
| stadt | 2+2 | geht | Frame p95 ms | 58.35 | 58.35 | 0 | 0.14 | nicht langsamer |
| stadt | 2+2 | geht | CPU-Takt p95 ms | 51.05 | 51.4 | 0.35 | 2 | nicht langsamer |
| stadt | 2+2 | geht | Belegung p95 ms | 57.7 | 60.35 | 2.66 | 4.54 | nicht langsamer |
| stadt | 2+2 | Zählung | steht Befehle | 62.5 | 62 | -0.5 | – | – |
| stadt | 2+2 | Zählung | steht Dreiecke p95 | 1272935 | 1266606 | -6329 | – | – |
| stadt | 2+2 | Zählung | steht VRAM MB | 192.1 | 191.2 | -0.9 | – | – |
| stadt | 2+2 | Zählung | geht Befehle | 97.5 | 96.5 | -1 | – | – |
| stadt | 2+2 | Zählung | geht Dreiecke p95 | 1436528 | 1432405 | -4122 | – | – |
| stadt | 2+2 | Zählung | geht VRAM MB | 212.85 | 194.5 | -18.35 | – | – |
| **stadt** | 2+2 | | **Urteil** | | | | | **nicht-langsamer** |

Instrument je Boot: 25ac4c0c4 (stadt-A1, stadt-A2, stadt-B1, stadt-B2, w-ego-A1, w-ego-A2, w-ego-A3, w-ego-A4, w-ego-B1, w-ego-B2, w-ego-B3, w-ego-B4)

Roh: `bericht/z140-abab/`.
