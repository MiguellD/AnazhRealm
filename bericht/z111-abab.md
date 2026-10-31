# z111-abab — ABAB cdb2703d gegen 90878cc6: nicht-langsamer

GTX 1060, `--echt` 1920×1080, Regler voll, Messplatz-Dienst (zug/messplatz.md). A = 90878cc61494378c8994488059a3578ed2bdef80, B = cdb2703d106a5e26e8f7f95aa4d982824d39ff2e, Instrument aus B. Je Zelle 2+2, verlängert auf 4+4 nur bei Kern-Anschlag oder einer Größe zwischen 1σ und 2σ. Urteil je Größe Δ ≤ max(2σ gepoolt, Auflösung).

| Zelle | n A+B | Gang | Größe | A | B | Δ B − A | 2σ | Urteil |
|---|---|---|---|---|---|---|---|---|
| stadt | 4+4 | steht | fps | 65.85 | 65.5 | -0.35 | 1.68 | nicht langsamer |
| stadt | 4+4 | steht | Frame p95 ms | 25 | 25 | 0 | 0 | nicht langsamer |
| stadt | 4+4 | steht | CPU-Takt p95 ms | 11.57 | 11.68 | 0.1 | 1.08 | nicht langsamer |
| stadt | 4+4 | steht | Belegung p95 ms | 18.56 | 18.65 | 0.09 | 1.34 | nicht langsamer |
| stadt | 4+4 | geht | fps | 31.95 | 33.7 | 1.75 | 5.02 | nicht langsamer |
| stadt | 4+4 | geht | Frame p95 ms | 60.35 | 58.3 | -2.05 | 14.59 | nicht langsamer |
| stadt | 4+4 | geht | CPU-Takt p95 ms | 52.75 | 49.35 | -3.4 | 11.88 | nicht langsamer |
| stadt | 4+4 | geht | Belegung p95 ms | 58.91 | 55.61 | -3.3 | 10.61 | nicht langsamer |
| stadt | 4+4 | Zählung | steht Befehle | 62.5 | 61.75 | -0.75 | – | – |
| stadt | 4+4 | Zählung | steht Dreiecke p95 | 1295502 | 1288127 | -7375 | – | – |
| stadt | 4+4 | Zählung | steht VRAM MB | 189.93 | 189.2 | -0.73 | – | – |
| stadt | 4+4 | Zählung | geht Befehle | 96.25 | 88.75 | -7.5 | – | – |
| stadt | 4+4 | Zählung | geht Dreiecke p95 | 1464927 | 1418140 | -46787 | – | – |
| stadt | 4+4 | Zählung | geht VRAM MB | 200.18 | 208.65 | 8.47 | – | – |
| **stadt** | 4+4 | | **Urteil** | | | | | **nicht-langsamer** |
| w-ego | 2+2 | steht | fps | 66.05 | 66.25 | 0.2 | 0.91 | nicht langsamer |
| w-ego | 2+2 | steht | Frame p95 ms | 16.8 | 16.8 | 0 | 0 | nicht langsamer |
| w-ego | 2+2 | steht | CPU-Takt p95 ms | 5.9 | 5.85 | -0.05 | 0.1 | nicht langsamer |
| w-ego | 2+2 | steht | GPU je Bild ms (gpu-bank) | 14.66 | 14.54 | -0.12 | 0.26 | nicht langsamer |
| w-ego | 2+2 | steht | Belegung p95 ms | 8.67 | 8.62 | -0.05 | 0.32 | nicht langsamer |
| w-ego | 2+2 | geht | fps | 54.8 | 54.65 | -0.15 | 1.12 | nicht langsamer |
| w-ego | 2+2 | geht | Frame p95 ms | 25.1 | 25.15 | 0.05 | 0.1 | nicht langsamer |
| w-ego | 2+2 | geht | CPU-Takt p95 ms | 18.9 | 19.3 | 0.4 | 1.61 | nicht langsamer |
| w-ego | 2+2 | geht | Belegung p95 ms | 23.33 | 23.62 | 0.29 | 1.04 | nicht langsamer |
| w-ego | 2+2 | Zählung | steht Befehle | 41 | 41 | 0 | – | – |
| w-ego | 2+2 | Zählung | steht Dreiecke p95 | 263451 | 261958 | -1493 | – | – |
| w-ego | 2+2 | Zählung | steht VRAM MB | 117.65 | 117.65 | 0 | – | – |
| w-ego | 2+2 | Zählung | geht Befehle | 58 | 56 | -2 | – | – |
| w-ego | 2+2 | Zählung | geht Dreiecke p95 | 393481 | 362868 | -30612 | – | – |
| w-ego | 2+2 | Zählung | geht VRAM MB | 122.2 | 124.95 | 2.75 | – | – |
| **w-ego** | 2+2 | | **Urteil** | | | | | **nicht-langsamer** |

Instrument je Boot: 90878cc61 (stadt-A1, stadt-A2, stadt-A3, stadt-A4, stadt-B1, stadt-B2, stadt-B3, stadt-B4, w-ego-A1, w-ego-A2, w-ego-B1, w-ego-B2)

Roh: `bericht/z111-abab/`.
