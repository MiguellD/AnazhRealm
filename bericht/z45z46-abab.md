# z45z46-abab — ABAB 42973786 gegen 5b8603c1: nicht-langsamer

GTX 1060, `--echt` 1920×1080, Regler voll, Messplatz-Dienst (zug/messplatz.md). A = 5b8603c181cc376edb37dc1f31ec09e8859d2fb5, B = 429737862d4acc40e8d0e1b67215a8be997ff397, Instrument aus B. Je Zelle 2+2, verlängert auf 4+4 nur bei Kern-Anschlag oder einer Größe zwischen 1σ und 2σ. Urteil je Größe Δ ≤ max(2σ gepoolt, Auflösung).

| Zelle | n A+B | Gang | Größe | A | B | Δ B − A | 2σ | Urteil |
|---|---|---|---|---|---|---|---|---|
| w-ego | 4+4 | steht | fps | 76.1 | 76.13 | 0.03 | 1.93 | nicht langsamer |
| w-ego | 4+4 | steht | Frame p95 ms | 16.8 | 16.8 | 0 | 0 | nicht langsamer |
| w-ego | 4+4 | steht | CPU-Takt p95 ms | 4.05 | 4.25 | 0.2 | 0.62 | nicht langsamer |
| w-ego | 4+4 | steht | GPU je Bild ms (gpu-bank) | 12.63 | 12.56 | -0.07 | 0.47 | nicht langsamer |
| w-ego | 4+4 | steht | Belegung p95 ms | 5.83 | 6 | 0.16 | 0.79 | nicht langsamer |
| w-ego | 4+4 | geht | fps | 61.1 | 60.65 | -0.45 | 2.09 | nicht langsamer |
| w-ego | 4+4 | geht | Frame p95 ms | 25.08 | 25.1 | 0.02 | 0.07 | nicht langsamer |
| w-ego | 4+4 | geht | CPU-Takt p95 ms | 17.93 | 18.3 | 0.38 | 1.98 | nicht langsamer |
| w-ego | 4+4 | geht | Belegung p95 ms | 21.36 | 21.79 | 0.43 | 1.26 | nicht langsamer |
| w-ego | 4+4 | Zählung | steht Befehle | 39 | 39 | 0 | – | – |
| w-ego | 4+4 | Zählung | steht Dreiecke p95 | 264246 | 264242 | -3.5 | – | – |
| w-ego | 4+4 | Zählung | steht VRAM MB | 107.85 | 107.8 | -0.05 | – | – |
| w-ego | 4+4 | Zählung | geht Befehle | 56 | 56 | 0 | – | – |
| w-ego | 4+4 | Zählung | geht Dreiecke p95 | 377764 | 379305 | 1541 | – | – |
| w-ego | 4+4 | Zählung | geht VRAM MB | 111.68 | 111.6 | -0.08 | – | – |
| **w-ego** | 4+4 | | **Urteil** | | | | | **nicht-langsamer** |
| d-ego | 2+2 | steht | fps | 71.9 | 73.45 | 1.55 | 2.8 | nicht langsamer |
| d-ego | 2+2 | steht | Frame p95 ms | 16.8 | 16.8 | 0 | 0 | nicht langsamer |
| d-ego | 2+2 | steht | CPU-Takt p95 ms | 5.3 | 5.35 | 0.05 | 0.22 | nicht langsamer |
| d-ego | 2+2 | steht | GPU je Bild ms (gpu-bank) | 13.14 | 12.78 | -0.36 | 0.99 | nicht langsamer |
| d-ego | 2+2 | steht | Belegung p95 ms | 7.3 | 7.31 | 0.01 | 0.34 | nicht langsamer |
| d-ego | 2+2 | Zählung | steht Befehle | 50 | 50 | 0 | – | – |
| d-ego | 2+2 | Zählung | steht Dreiecke p95 | 363732 | 359222 | -4510 | – | – |
| d-ego | 2+2 | Zählung | steht VRAM MB | 106.65 | 107.3 | 0.65 | – | – |
| **d-ego** | 2+2 | | **Urteil** | | | | | **nicht-langsamer** |
| stadt | 2+2 | steht | fps | 78.5 | 77.2 | -1.3 | 3.22 | nicht langsamer |
| stadt | 2+2 | steht | Frame p95 ms | 16.8 | 16.8 | 0 | 0 | nicht langsamer |
| stadt | 2+2 | steht | CPU-Takt p95 ms | 7 | 7.9 | 0.9 | 1.9 | nicht langsamer |
| stadt | 2+2 | steht | Belegung p95 ms | 10.75 | 11.96 | 1.21 | 2.79 | nicht langsamer |
| stadt | 2+2 | geht | fps | 44.85 | 40.1 | -4.75 | 12.61 | nicht langsamer |
| stadt | 2+2 | geht | Frame p95 ms | 41.6 | 45.8 | 4.2 | 8.4 | nicht langsamer |
| stadt | 2+2 | geht | CPU-Takt p95 ms | 36.1 | 42.15 | 6.05 | 12.31 | nicht langsamer |
| stadt | 2+2 | geht | Belegung p95 ms | 38.98 | 44.4 | 5.41 | 13.16 | nicht langsamer |
| stadt | 2+2 | Zählung | steht Befehle | 57 | 57 | 0 | – | – |
| stadt | 2+2 | Zählung | steht Dreiecke p95 | 1234597 | 1235332 | 735.5 | – | – |
| stadt | 2+2 | Zählung | steht VRAM MB | 172.7 | 174.3 | 1.6 | – | – |
| stadt | 2+2 | Zählung | geht Befehle | 78 | 78 | 0 | – | – |
| stadt | 2+2 | Zählung | geht Dreiecke p95 | 1403270 | 1402186 | -1084 | – | – |
| stadt | 2+2 | Zählung | geht VRAM MB | 165.65 | 176.5 | 10.85 | – | – |
| **stadt** | 2+2 | | **Urteil** | | | | | **nicht-langsamer** |

Instrument je Boot: 5b8603c18 (d-ego-A1, d-ego-A2, d-ego-B1, d-ego-B2, stadt-A1, stadt-A2, stadt-B1, stadt-B2, w-ego-A1, w-ego-A2, w-ego-A3, w-ego-A4, w-ego-B1, w-ego-B2, w-ego-B3, w-ego-B4)

Roh: `bericht/z45z46-abab/`.
