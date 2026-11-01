# z114-abab — ABAB 808464ca gegen f0dab43d: LANGSAMER

GTX 1060, `--echt` 1920×1080, Regler voll, Messplatz-Dienst (zug/messplatz.md). A = f0dab43d611dfdcd194d753e4471495de8a71b15, B = 808464cab1d7998c1378ff2de415a2288db87053, Instrument aus B. Je Zelle 2+2, verlängert auf 4+4 nur bei Kern-Anschlag oder einer Größe zwischen 1σ und 2σ. Urteil je Größe Δ ≤ max(2σ gepoolt, Auflösung).

| Zelle | n A+B | Gang | Größe | A | B | Δ B − A | 2σ | Urteil |
|---|---|---|---|---|---|---|---|---|
| w-ego | 2+2 | steht | fps | 62.5 | 47.2 | -15.3 | 1.41 | LANGSAMER |
| w-ego | 2+2 | steht | Frame p95 ms | 16.8 | 25.1 | 8.3 | 0 | LANGSAMER |
| w-ego | 2+2 | steht | CPU-Takt p95 ms | 6.4 | 6.5 | 0.1 | 0.82 | nicht langsamer |
| w-ego | 2+2 | steht | GPU je Bild ms (gpu-bank) | 15.41 | 20.52 | 5.11 | 0.35 | LANGSAMER |
| w-ego | 2+2 | steht | Belegung p95 ms | 10.15 | 11.99 | 1.84 | 1.7 | LANGSAMER |
| w-ego | 2+2 | geht | fps | 47.4 | 41.95 | -5.45 | 7.2 | nicht langsamer |
| w-ego | 2+2 | geht | Frame p95 ms | 33.3 | 33.4 | 0.1 | 0.2 | nicht langsamer (1σ–2σ) |
| w-ego | 2+2 | geht | CPU-Takt p95 ms | 25.8 | 22.9 | -2.9 | 8.59 | nicht langsamer |
| w-ego | 2+2 | geht | Belegung p95 ms | 28.56 | 30.96 | 2.4 | 6.19 | nicht langsamer |
| w-ego | 2+2 | Zählung | steht Befehle | 43 | 43 | 0 | – | – |
| w-ego | 2+2 | Zählung | steht Dreiecke p95 | 301993 | 300965 | -1027 | – | – |
| w-ego | 2+2 | Zählung | steht VRAM MB | 117.7 | 119.05 | 1.35 | – | – |
| w-ego | 2+2 | Zählung | geht Befehle | 59 | 59 | 0 | – | – |
| w-ego | 2+2 | Zählung | geht Dreiecke p95 | 406219 | 405279 | -940 | – | – |
| w-ego | 2+2 | Zählung | geht VRAM MB | 125.25 | 126.75 | 1.5 | – | – |
| **w-ego** | 2+2 | | **Urteil** | | | | | **LANGSAMER** |
| stadt | 4+4 | steht | fps | 63.75 | 55.42 | -8.33 | 2.95 | LANGSAMER |
| stadt | 4+4 | steht | Frame p95 ms | 25 | 25.1 | 0.1 | 0 | nicht langsamer |
| stadt | 4+4 | steht | CPU-Takt p95 ms | 12.33 | 12.22 | -0.1 | 2.05 | nicht langsamer |
| stadt | 4+4 | steht | Belegung p95 ms | 19.35 | 20.45 | 1.1 | 1.92 | nicht langsamer |
| stadt | 4+4 | geht | fps | 29.23 | 29.33 | 0.1 | 5.6 | nicht langsamer |
| stadt | 4+4 | geht | Frame p95 ms | 64.6 | 64.58 | -0.02 | 18.6 | nicht langsamer |
| stadt | 4+4 | geht | CPU-Takt p95 ms | 56.88 | 56.2 | -0.67 | 11.04 | nicht langsamer |
| stadt | 4+4 | geht | Belegung p95 ms | 63.97 | 63.87 | -0.11 | 13.95 | nicht langsamer |
| stadt | 4+4 | Zählung | steht Befehle | 64.5 | 64 | -0.5 | – | – |
| stadt | 4+4 | Zählung | steht Dreiecke p95 | 1288852 | 1292847 | 3995 | – | – |
| stadt | 4+4 | Zählung | steht VRAM MB | 190.18 | 190.4 | 0.22 | – | – |
| stadt | 4+4 | Zählung | geht Befehle | 95 | 89 | -6 | – | – |
| stadt | 4+4 | Zählung | geht Dreiecke p95 | 1463587 | 1418124 | -45463 | – | – |
| stadt | 4+4 | Zählung | geht VRAM MB | 203.32 | 205.48 | 2.15 | – | – |
| **stadt** | 4+4 | | **Urteil** | | | | | **LANGSAMER** |

Instrument je Boot: f0dab43d6 (stadt-A1, stadt-A2, stadt-A3, stadt-A4, stadt-B1, stadt-B2, stadt-B3, stadt-B4, w-ego-A1, w-ego-A2, w-ego-B1, w-ego-B2)

Roh: `bericht/z114-abab/`.
