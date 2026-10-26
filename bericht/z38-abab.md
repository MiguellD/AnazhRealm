# z38-abab — ABAB b2c6c627 gegen 9ceeca71: nicht-langsamer

GTX 1060, `--echt` 1920×1080, Regler voll, Messplatz-Dienst (zug/messplatz.md). A = 9ceeca7169d4980549974ce81a608cacd3ac471f, B = b2c6c627e6526265fcdc5178b987515ae06f2584, Instrument aus B. Je Zelle 2+2, verlängert auf 4+4 nur bei Kern-Anschlag oder einer Größe zwischen 1σ und 2σ. Urteil je Größe Δ ≤ max(2σ gepoolt, Auflösung).

| Zelle | n A+B | Gang | Größe | A | B | Δ B − A | 2σ | Urteil |
|---|---|---|---|---|---|---|---|---|
| w-ego | 2+2 | steht | fps | 74.4 | 74.4 | 0 | 0 | nicht langsamer |
| w-ego | 2+2 | steht | Frame p95 ms | 16.8 | 16.8 | 0 | 0 | nicht langsamer |
| w-ego | 2+2 | steht | CPU-Takt p95 ms | 4.65 | 4.85 | 0.2 | 0.51 | nicht langsamer |
| w-ego | 2+2 | steht | GPU je Bild ms (gpu-bank) | 12.87 | 12.81 | -0.06 | 0.12 | nicht langsamer |
| w-ego | 2+2 | steht | Belegung p95 ms | 6.58 | 6.83 | 0.25 | 0.58 | nicht langsamer |
| w-ego | 2+2 | geht | fps | 58.75 | 59.3 | 0.55 | 0.22 | nicht langsamer |
| w-ego | 2+2 | geht | Frame p95 ms | 25.1 | 25.1 | 0 | 0 | nicht langsamer |
| w-ego | 2+2 | geht | CPU-Takt p95 ms | 19.6 | 19.35 | -0.25 | 0.3 | nicht langsamer |
| w-ego | 2+2 | geht | Belegung p95 ms | 22.49 | 22.38 | -0.11 | 0.52 | nicht langsamer |
| w-ego | 2+2 | Zählung | steht Befehle | 39 | 39 | 0 | – | – |
| w-ego | 2+2 | Zählung | steht Dreiecke p95 | 264242 | 264248 | 6 | – | – |
| w-ego | 2+2 | Zählung | steht VRAM MB | 107.9 | 107.8 | -0.1 | – | – |
| w-ego | 2+2 | Zählung | geht Befehle | 56 | 56 | 0 | – | – |
| w-ego | 2+2 | Zählung | geht Dreiecke p95 | 378718 | 378457 | -260.5 | – | – |
| w-ego | 2+2 | Zählung | geht VRAM MB | 111.65 | 111.5 | -0.15 | – | – |
| **w-ego** | 2+2 | | **Urteil** | | | | | **nicht-langsamer** |
| d-ego | 4+4 | steht | fps | 73.02 | 73.38 | 0.35 | 1.46 | nicht langsamer |
| d-ego | 4+4 | steht | Frame p95 ms | 16.8 | 16.8 | 0 | 0 | nicht langsamer |
| d-ego | 4+4 | steht | CPU-Takt p95 ms | 5.42 | 5.3 | -0.12 | 0.33 | nicht langsamer |
| d-ego | 4+4 | steht | GPU je Bild ms (gpu-bank) | 13.05 | 12.86 | -0.19 | 0.56 | nicht langsamer |
| d-ego | 4+4 | steht | Belegung p95 ms | 7.62 | 7.48 | -0.14 | 0.37 | nicht langsamer |
| d-ego | 4+4 | Zählung | steht Befehle | 50 | 50 | 0 | – | – |
| d-ego | 4+4 | Zählung | steht Dreiecke p95 | 359927 | 359292 | -635.25 | – | – |
| d-ego | 4+4 | Zählung | steht VRAM MB | 106.83 | 107.5 | 0.67 | – | – |
| **d-ego** | 4+4 | | **Urteil** | | | | | **nicht-langsamer** |
| stadt | 2+2 | steht | fps | 77.5 | 77.85 | 0.35 | 0.22 | nicht langsamer |
| stadt | 2+2 | steht | Frame p95 ms | 16.8 | 16.8 | 0 | 0 | nicht langsamer |
| stadt | 2+2 | steht | CPU-Takt p95 ms | 7.7 | 7.85 | 0.15 | 0.36 | nicht langsamer |
| stadt | 2+2 | steht | Belegung p95 ms | 11.72 | 11.95 | 0.22 | 0.5 | nicht langsamer |
| stadt | 2+2 | geht | fps | 41.25 | 40.2 | -1.05 | 3.4 | nicht langsamer |
| stadt | 2+2 | geht | Frame p95 ms | 45.8 | 45.8 | 0 | 11.6 | nicht langsamer |
| stadt | 2+2 | geht | CPU-Takt p95 ms | 40.9 | 42.7 | 1.8 | 6.02 | nicht langsamer |
| stadt | 2+2 | geht | Belegung p95 ms | 43.84 | 45.45 | 1.61 | 5.59 | nicht langsamer |
| stadt | 2+2 | Zählung | steht Befehle | 57 | 57 | 0 | – | – |
| stadt | 2+2 | Zählung | steht Dreiecke p95 | 1236608 | 1235148 | -1460 | – | – |
| stadt | 2+2 | Zählung | steht VRAM MB | 170.45 | 169.3 | -1.15 | – | – |
| stadt | 2+2 | Zählung | geht Befehle | 78 | 78 | 0 | – | – |
| stadt | 2+2 | Zählung | geht Dreiecke p95 | 1400399 | 1400747 | 348 | – | – |
| stadt | 2+2 | Zählung | geht VRAM MB | 172.3 | 173.25 | 0.95 | – | – |
| **stadt** | 2+2 | | **Urteil** | | | | | **nicht-langsamer** |

Instrument je Boot: 9ceeca716 (d-ego-A1, d-ego-A2, d-ego-A3, d-ego-A4, d-ego-B1, d-ego-B2, d-ego-B3, d-ego-B4, stadt-A1, stadt-A2, stadt-B1, stadt-B2, w-ego-A1, w-ego-A2, w-ego-B1, w-ego-B2)

Roh: `bericht/z38-abab/`.
