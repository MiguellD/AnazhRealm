# z93-abab — ABAB ab040980 gegen e0139769: nicht-langsamer

GTX 1060, `--echt` 1920×1080, Regler voll, Messplatz-Dienst (zug/messplatz.md). A = e0139769f464e8137f417ad0fc6f0af23cdddcc0, B = ab0409804200dce203a339fdf3c02a5fb42f1784, Instrument aus B. Je Zelle 2+2, verlängert auf 4+4 nur bei Kern-Anschlag oder einer Größe zwischen 1σ und 2σ. Urteil je Größe Δ ≤ max(2σ gepoolt, Auflösung).

| Zelle | n A+B | Gang | Größe | A | B | Δ B − A | 2σ | Urteil |
|---|---|---|---|---|---|---|---|---|
| stadt | 2+2 | steht | fps | 70.75 | 71.05 | 0.3 | 0.58 | nicht langsamer |
| stadt | 2+2 | steht | Frame p95 ms | 16.9 | 16.85 | -0.05 | 0.1 | nicht langsamer |
| stadt | 2+2 | steht | CPU-Takt p95 ms | 9.55 | 9.3 | -0.25 | 0.1 | nicht langsamer |
| stadt | 2+2 | steht | Belegung p95 ms | 14.25 | 14.13 | -0.13 | 0.33 | nicht langsamer |
| stadt | 2+2 | geht | fps | 39.2 | 38.85 | -0.35 | 1.2 | nicht langsamer |
| stadt | 2+2 | geht | Frame p95 ms | 49.9 | 49.9 | 0 | 0 | nicht langsamer |
| stadt | 2+2 | geht | CPU-Takt p95 ms | 41.9 | 41 | -0.9 | 3.26 | nicht langsamer |
| stadt | 2+2 | geht | Belegung p95 ms | 47.06 | 46.67 | -0.4 | 2.11 | nicht langsamer |
| stadt | 2+2 | Zählung | steht Befehle | 62 | 61 | -1 | – | – |
| stadt | 2+2 | Zählung | steht Dreiecke p95 | 1286122 | 1286128 | 6 | – | – |
| stadt | 2+2 | Zählung | steht VRAM MB | 189.75 | 186.85 | -2.9 | – | – |
| stadt | 2+2 | Zählung | geht Befehle | 89 | 89 | 0 | – | – |
| stadt | 2+2 | Zählung | geht Dreiecke p95 | 1400988 | 1394493 | -6494 | – | – |
| stadt | 2+2 | Zählung | geht VRAM MB | 207.7 | 185.55 | -22.15 | – | – |
| **stadt** | 2+2 | | **Urteil** | | | | | **nicht-langsamer** |
| w-ego | 4+4 | steht | fps | 67.88 | 67.33 | -0.55 | 1.51 | nicht langsamer |
| w-ego | 4+4 | steht | Frame p95 ms | 16.8 | 16.8 | 0 | 0 | nicht langsamer |
| w-ego | 4+4 | steht | CPU-Takt p95 ms | 4.8 | 4.95 | 0.15 | 0.24 | nicht langsamer (1σ–2σ) |
| w-ego | 4+4 | steht | GPU je Bild ms (gpu-bank) | 14.16 | 14.14 | -0.02 | 0.38 | nicht langsamer |
| w-ego | 4+4 | steht | Belegung p95 ms | 7.19 | 7.33 | 0.14 | 0.34 | nicht langsamer |
| w-ego | 4+4 | geht | fps | 57.25 | 56.85 | -0.4 | 0.65 | nicht langsamer |
| w-ego | 4+4 | geht | Frame p95 ms | 25.1 | 25.1 | 0 | 0 | nicht langsamer |
| w-ego | 4+4 | geht | CPU-Takt p95 ms | 16.95 | 17.32 | 0.37 | 0.41 | nicht langsamer (1σ–2σ) |
| w-ego | 4+4 | geht | Belegung p95 ms | 21.93 | 22.05 | 0.12 | 0.67 | nicht langsamer |
| w-ego | 4+4 | Zählung | steht Befehle | 41 | 41 | 0 | – | – |
| w-ego | 4+4 | Zählung | steht Dreiecke p95 | 261320 | 261321 | 1 | – | – |
| w-ego | 4+4 | Zählung | steht VRAM MB | 117.7 | 117.72 | 0.03 | – | – |
| w-ego | 4+4 | Zählung | geht Befehle | 58 | 58 | 0 | – | – |
| w-ego | 4+4 | Zählung | geht Dreiecke p95 | 383676 | 384184 | 508.25 | – | – |
| w-ego | 4+4 | Zählung | geht VRAM MB | 122.38 | 122.32 | -0.05 | – | – |
| **w-ego** | 4+4 | | **Urteil** | | | | | **nicht-langsamer** |

Instrument je Boot: e0139769f (stadt-A1, stadt-A2, stadt-B1, stadt-B2, w-ego-A1, w-ego-A2, w-ego-A3, w-ego-A4, w-ego-B1, w-ego-B2, w-ego-B3, w-ego-B4)

Roh: `bericht/z93-abab/`.
