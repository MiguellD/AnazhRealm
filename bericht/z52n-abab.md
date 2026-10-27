# z52n-abab — ABAB 9fa32207 gegen 6db2602c: nicht-langsamer

GTX 1060, `--echt` 1920×1080, Regler voll, Messplatz-Dienst (zug/messplatz.md). A = 6db2602c6ea8c3a2ae5e75e6309f7a6196b03c3a, B = 9fa32207625dc4dfcfdf50e895b05c5226825ea6, Instrument aus B. Je Zelle 2+2, verlängert auf 4+4 nur bei Kern-Anschlag oder einer Größe zwischen 1σ und 2σ. Urteil je Größe Δ ≤ max(2σ gepoolt, Auflösung).

| Zelle | n A+B | Gang | Größe | A | B | Δ B − A | 2σ | Urteil |
|---|---|---|---|---|---|---|---|---|
| w-ego | 2+2 | steht | fps | 75.2 | 75.8 | 0.6 | 0.82 | nicht langsamer |
| w-ego | 2+2 | steht | Frame p95 ms | 16.8 | 16.8 | 0 | 0 | nicht langsamer |
| w-ego | 2+2 | steht | CPU-Takt p95 ms | 4.35 | 4.3 | -0.05 | 0.22 | nicht langsamer |
| w-ego | 2+2 | steht | GPU je Bild ms (gpu-bank) | 13.16 | 12.67 | -0.49 | 0.66 | nicht langsamer |
| w-ego | 2+2 | steht | Belegung p95 ms | 6.19 | 6.1 | -0.09 | 0.2 | nicht langsamer |
| w-ego | 2+2 | geht | fps | 59.55 | 59.7 | 0.15 | 0.78 | nicht langsamer |
| w-ego | 2+2 | geht | Frame p95 ms | 25.1 | 25.05 | -0.05 | 0.1 | nicht langsamer |
| w-ego | 2+2 | geht | CPU-Takt p95 ms | 19.25 | 19.65 | 0.4 | 1.21 | nicht langsamer |
| w-ego | 2+2 | geht | Belegung p95 ms | 22.18 | 22.22 | 0.04 | 0.45 | nicht langsamer |
| w-ego | 2+2 | Zählung | steht Befehle | 39 | 39 | 0 | – | – |
| w-ego | 2+2 | Zählung | steht Dreiecke p95 | 264242 | 264244 | 1.5 | – | – |
| w-ego | 2+2 | Zählung | steht VRAM MB | 107.9 | 107.85 | -0.05 | – | – |
| w-ego | 2+2 | Zählung | geht Befehle | 56 | 56 | 0 | – | – |
| w-ego | 2+2 | Zählung | geht Dreiecke p95 | 379378 | 379860 | 482 | – | – |
| w-ego | 2+2 | Zählung | geht VRAM MB | 111.6 | 111.9 | 0.3 | – | – |
| **w-ego** | 2+2 | | **Urteil** | | | | | **nicht-langsamer** |
| d-ego | 4+4 | steht | fps | 73.75 | 72.65 | -1.1 | 3.38 | nicht langsamer |
| d-ego | 4+4 | steht | Frame p95 ms | 16.8 | 16.8 | 0 | 0 | nicht langsamer |
| d-ego | 4+4 | steht | CPU-Takt p95 ms | 5.25 | 5.25 | 0 | 0.5 | nicht langsamer |
| d-ego | 4+4 | steht | GPU je Bild ms (gpu-bank) | 13.06 | 13.12 | 0.06 | 1.04 | nicht langsamer |
| d-ego | 4+4 | steht | Belegung p95 ms | 7.36 | 7.25 | -0.11 | 0.67 | nicht langsamer |
| d-ego | 4+4 | Zählung | steht Befehle | 50 | 50 | 0 | – | – |
| d-ego | 4+4 | Zählung | steht Dreiecke p95 | 359702 | 359702 | 0.5 | – | – |
| d-ego | 4+4 | Zählung | steht VRAM MB | 107 | 106.97 | -0.03 | – | – |
| **d-ego** | 4+4 | | **Urteil** | | | | | **nicht-langsamer** |
| stadt | 2+2 | steht | fps | 76.2 | 77.6 | 1.4 | 4.64 | nicht langsamer |
| stadt | 2+2 | steht | Frame p95 ms | 16.8 | 16.8 | 0 | 0 | nicht langsamer |
| stadt | 2+2 | steht | CPU-Takt p95 ms | 8.3 | 7.75 | -0.55 | 2.4 | nicht langsamer |
| stadt | 2+2 | steht | Belegung p95 ms | 12.78 | 11.84 | -0.93 | 3.43 | nicht langsamer |
| stadt | 2+2 | geht | fps | 37.3 | 42.55 | 5.25 | 11.28 | nicht langsamer |
| stadt | 2+2 | geht | Frame p95 ms | 50 | 41.7 | -8.3 | 16.6 | nicht langsamer |
| stadt | 2+2 | geht | CPU-Takt p95 ms | 44.7 | 39.35 | -5.35 | 11.38 | nicht langsamer |
| stadt | 2+2 | geht | Belegung p95 ms | 48.77 | 42.05 | -6.71 | 11.3 | nicht langsamer |
| stadt | 2+2 | Zählung | steht Befehle | 57 | 57 | 0 | – | – |
| stadt | 2+2 | Zählung | steht Dreiecke p95 | 1234466 | 1234582 | 116 | – | – |
| stadt | 2+2 | Zählung | steht VRAM MB | 173.8 | 174.2 | 0.4 | – | – |
| stadt | 2+2 | Zählung | geht Befehle | 79 | 78 | -1 | – | – |
| stadt | 2+2 | Zählung | geht Dreiecke p95 | 1405240 | 1404734 | -506 | – | – |
| stadt | 2+2 | Zählung | geht VRAM MB | 173.75 | 174.2 | 0.45 | – | – |
| **stadt** | 2+2 | | **Urteil** | | | | | **nicht-langsamer** |

Instrument je Boot: 6db2602c6 (d-ego-A1, d-ego-A2, d-ego-A3, d-ego-A4, d-ego-B1, d-ego-B2, d-ego-B3, d-ego-B4, stadt-A1, stadt-A2, stadt-B1, stadt-B2, w-ego-A1, w-ego-A2, w-ego-B1, w-ego-B2)

Roh: `bericht/z52n-abab/`.
