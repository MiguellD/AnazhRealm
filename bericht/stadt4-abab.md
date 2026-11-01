# stadt4-abab — ABAB d46f055f gegen eeb5d2bf: nicht-langsamer

GTX 1060, `--echt` 1920×1080, Regler voll, Messplatz-Dienst (zug/messplatz.md). A = eeb5d2bfbcdae181388a990d13c434cd67b923a0, B = d46f055f6615e5469cc236846dde0346ce0c27b7, Instrument aus B. Je Zelle 2+2, verlängert auf 4+4 nur bei Kern-Anschlag oder einer Größe zwischen 1σ und 2σ. Urteil je Größe Δ ≤ max(2σ gepoolt, Auflösung).

| Zelle | n A+B | Gang | Größe | A | B | Δ B − A | 2σ | Urteil |
|---|---|---|---|---|---|---|---|---|
| stadt | 2+2 | steht | fps | 57.95 | 58.8 | 0.85 | 1.75 | nicht langsamer |
| stadt | 2+2 | steht | Frame p95 ms | 25.05 | 25 | -0.05 | 0.1 | nicht langsamer |
| stadt | 2+2 | steht | CPU-Takt p95 ms | 11 | 10.3 | -0.7 | 1 | nicht langsamer |
| stadt | 2+2 | steht | Belegung p95 ms | 18.01 | 16.11 | -1.9 | 2.08 | nicht langsamer |
| stadt | 2+2 | geht | fps | 34.75 | 35.6 | 0.85 | 1.2 | nicht langsamer |
| stadt | 2+2 | geht | Frame p95 ms | 50 | 50 | 0 | 0 | nicht langsamer |
| stadt | 2+2 | geht | CPU-Takt p95 ms | 44.5 | 42.05 | -2.45 | 1.12 | nicht langsamer |
| stadt | 2+2 | geht | Belegung p95 ms | 50.22 | 47.48 | -2.73 | 0.9 | nicht langsamer |
| stadt | 2+2 | Zählung | steht Befehle | 64 | 64 | 0 | – | – |
| stadt | 2+2 | Zählung | steht Dreiecke p95 | 1296171 | 1307495 | 11325 | – | – |
| stadt | 2+2 | Zählung | steht VRAM MB | 195.8 | 185.75 | -10.05 | – | – |
| stadt | 2+2 | Zählung | geht Befehle | 94 | 93 | -1 | – | – |
| stadt | 2+2 | Zählung | geht Dreiecke p95 | 1450908 | 1466210 | 15302 | – | – |
| stadt | 2+2 | Zählung | geht VRAM MB | 194.45 | 202.7 | 8.25 | – | – |
| **stadt** | 2+2 | | **Urteil** | | | | | **nicht-langsamer** |
| w-ego | 2+2 | steht | fps | 48.8 | 48.75 | -0.05 | 0.81 | nicht langsamer |
| w-ego | 2+2 | steht | Frame p95 ms | 25.1 | 25.2 | 0.1 | 0 | nicht langsamer |
| w-ego | 2+2 | steht | CPU-Takt p95 ms | 5.6 | 5.55 | -0.05 | 0.36 | nicht langsamer |
| w-ego | 2+2 | steht | GPU je Bild ms (gpu-bank) | 19.69 | 19.68 | -0.01 | 0.5 | nicht langsamer |
| w-ego | 2+2 | steht | Belegung p95 ms | 9.69 | 9.57 | -0.12 | 0.39 | nicht langsamer |
| w-ego | 2+2 | geht | fps | 44.35 | 44.45 | 0.1 | 1.03 | nicht langsamer |
| w-ego | 2+2 | geht | Frame p95 ms | 33.4 | 33.4 | 0 | 0 | nicht langsamer |
| w-ego | 2+2 | geht | CPU-Takt p95 ms | 18.85 | 18.45 | -0.4 | 0.58 | nicht langsamer |
| w-ego | 2+2 | geht | Belegung p95 ms | 26.76 | 26.86 | 0.1 | 1.76 | nicht langsamer |
| w-ego | 2+2 | Zählung | steht Befehle | 43 | 43 | 0 | – | – |
| w-ego | 2+2 | Zählung | steht Dreiecke p95 | 300772 | 301794 | 1022 | – | – |
| w-ego | 2+2 | Zählung | steht VRAM MB | 119.15 | 119.15 | 0 | – | – |
| w-ego | 2+2 | Zählung | geht Befehle | 59 | 59 | 0 | – | – |
| w-ego | 2+2 | Zählung | geht Dreiecke p95 | 404394 | 404476 | 82 | – | – |
| w-ego | 2+2 | Zählung | geht VRAM MB | 124.8 | 124.8 | 0 | – | – |
| **w-ego** | 2+2 | | **Urteil** | | | | | **nicht-langsamer** |

Instrument je Boot: eeb5d2bfb (stadt-A1, stadt-A2, stadt-B1, stadt-B2, w-ego-A1, w-ego-A2, w-ego-B1, w-ego-B2)

Roh: `bericht/stadt4-abab/`.
