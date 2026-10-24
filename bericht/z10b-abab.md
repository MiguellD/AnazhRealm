# z10b-abab — ABAB 833bbc24 gegen 13c95713: nicht-langsamer

GTX 1060, `--echt` 1920×1080, Regler voll, Messplatz-Dienst (zug/messplatz.md). A = 13c95713e286923682dc8986505a581c9c8467db, B = 833bbc244711329e2e23305ed857d7e53a47e20e, Instrument aus B. Je Zelle 2+2, verlängert auf 4+4 nur bei Kern-Anschlag oder einer Größe zwischen 1σ und 2σ. Urteil je Größe Δ ≤ max(2σ gepoolt, Auflösung).

| Zelle | n A+B | Gang | Größe | A | B | Δ B − A | 2σ | Urteil |
|---|---|---|---|---|---|---|---|---|
| w-ego | 2+2 | steht | fps | 78.75 | 76.75 | -2 | 2.4 | nicht langsamer |
| w-ego | 2+2 | steht | Frame p95 ms | 16.8 | 16.8 | 0 | 0 | nicht langsamer |
| w-ego | 2+2 | steht | CPU-Takt p95 ms | 3.95 | 4.35 | 0.4 | 1.3 | nicht langsamer |
| w-ego | 2+2 | steht | GPU je Bild ms (gpu-bank) | 12.8 | 12.27 | -0.54 | 0.92 | nicht langsamer |
| w-ego | 2+2 | steht | Belegung p95 ms | 5.67 | 6.12 | 0.45 | 1.48 | nicht langsamer |
| w-ego | 2+2 | geht | fps | 62.1 | 57.5 | -4.6 | 9.82 | nicht langsamer |
| w-ego | 2+2 | geht | Frame p95 ms | 25.1 | 25.15 | 0.05 | 0.1 | nicht langsamer |
| w-ego | 2+2 | geht | CPU-Takt p95 ms | 18.45 | 21.45 | 3 | 7.95 | nicht langsamer |
| w-ego | 2+2 | geht | Belegung p95 ms | 21.77 | 24.46 | 2.69 | 5.97 | nicht langsamer |
| w-ego | 2+2 | Zählung | steht Befehle | 38 | 38 | 0 | – | – |
| w-ego | 2+2 | Zählung | steht Dreiecke p95 | 283187 | 285492 | 2305 | – | – |
| w-ego | 2+2 | Zählung | steht VRAM MB | 105.75 | 105.55 | -0.2 | – | – |
| w-ego | 2+2 | Zählung | geht Befehle | 53 | 53.5 | 0.5 | – | – |
| w-ego | 2+2 | Zählung | geht Dreiecke p95 | 387968 | 401225 | 13257 | – | – |
| w-ego | 2+2 | Zählung | geht VRAM MB | 109.5 | 109.3 | -0.2 | – | – |
| **w-ego** | 2+2 | | **Urteil** | | | | | **nicht-langsamer** |
| d-ego | 4+4 | steht | fps | 78.63 | 78.42 | -0.2 | 1.43 | nicht langsamer |
| d-ego | 4+4 | steht | Frame p95 ms | 16.8 | 16.8 | 0 | 0 | nicht langsamer |
| d-ego | 4+4 | steht | CPU-Takt p95 ms | 4.97 | 5.15 | 0.18 | 0.55 | nicht langsamer |
| d-ego | 4+4 | steht | GPU je Bild ms (gpu-bank) | 12.3 | 12.12 | -0.18 | 0.6 | nicht langsamer |
| d-ego | 4+4 | steht | Belegung p95 ms | 6.63 | 6.91 | 0.28 | 0.68 | nicht langsamer |
| d-ego | 4+4 | Zählung | steht Befehle | 59.25 | 59.5 | 0.25 | – | – |
| d-ego | 4+4 | Zählung | steht Dreiecke p95 | 447427 | 447639 | 211.25 | – | – |
| d-ego | 4+4 | Zählung | steht VRAM MB | 108.45 | 108.5 | 0.05 | – | – |
| **d-ego** | 4+4 | | **Urteil** | | | | | **nicht-langsamer** |
| stadt | 4+4 | steht | fps | 79.1 | 78.67 | -0.42 | 1.3 | nicht langsamer |
| stadt | 4+4 | steht | Frame p95 ms | 16.8 | 16.77 | -0.03 | 0.07 | nicht langsamer |
| stadt | 4+4 | steht | CPU-Takt p95 ms | 7.05 | 8.07 | 1.02 | 3.48 | nicht langsamer |
| stadt | 4+4 | steht | Belegung p95 ms | 10.36 | 11.65 | 1.29 | 4.5 | nicht langsamer |
| stadt | 4+4 | geht | fps | 40.08 | 34.05 | -6.02 | 13.63 | nicht langsamer |
| stadt | 4+4 | geht | Frame p95 ms | 45.88 | 58.35 | 12.48 | 33.93 | nicht langsamer |
| stadt | 4+4 | geht | CPU-Takt p95 ms | 41.4 | 51.35 | 9.95 | 24.45 | nicht langsamer |
| stadt | 4+4 | geht | Belegung p95 ms | 46.76 | 57.22 | 10.45 | 27.72 | nicht langsamer |
| stadt | 4+4 | Zählung | steht Befehle | 44 | 44 | 0 | – | – |
| stadt | 4+4 | Zählung | steht Dreiecke p95 | 1191726 | 1191457 | -269.5 | – | – |
| stadt | 4+4 | Zählung | steht VRAM MB | 142.9 | 144.45 | 1.55 | – | – |
| stadt | 4+4 | Zählung | geht Befehle | 73.75 | 73.25 | -0.5 | – | – |
| stadt | 4+4 | Zählung | geht Dreiecke p95 | 1843710 | 1844038 | 327.75 | – | – |
| stadt | 4+4 | Zählung | geht VRAM MB | 194.32 | 188.95 | -5.37 | – | – |
| **stadt** | 4+4 | | **Urteil** | | | | | **nicht-langsamer** |

Instrument je Boot: 13c95713e (d-ego-A1, d-ego-A2, d-ego-A3, d-ego-A4, d-ego-B1, d-ego-B2, d-ego-B3, d-ego-B4, stadt-A1, stadt-A2, stadt-A3, stadt-A4, stadt-B1, stadt-B2, stadt-B3, stadt-B4, w-ego-A1, w-ego-A2, w-ego-B1, w-ego-B2)

Roh: `bericht/z10b-abab/`.
