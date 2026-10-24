# z14c-abab — ABAB 056330d8 gegen 18a84649: nicht-langsamer

GTX 1060, `--echt` 1920×1080, Regler voll, Messplatz-Dienst (zug/messplatz.md). A = 18a846491377cb9898af2b5bb930234c249fa6ad, B = 056330d8a70fcdc617df8c3ff62ec174c5d33995, Instrument aus B. Je Zelle 2+2, verlängert auf 4+4 nur bei Kern-Anschlag oder einer Größe zwischen 1σ und 2σ. Urteil je Größe Δ ≤ max(2σ gepoolt, Auflösung).

| Zelle | n A+B | Gang | Größe | A | B | Δ B − A | 2σ | Urteil |
|---|---|---|---|---|---|---|---|---|
| w-ego | 2+2 | steht | fps | 76.05 | 75.3 | -0.75 | 3.14 | nicht langsamer |
| w-ego | 2+2 | steht | Frame p95 ms | 16.8 | 16.8 | 0 | 0 | nicht langsamer |
| w-ego | 2+2 | steht | CPU-Takt p95 ms | 3.85 | 4 | 0.15 | 0.92 | nicht langsamer |
| w-ego | 2+2 | steht | GPU je Bild ms (gpu-bank) | 13 | 13.15 | 0.15 | 0.56 | nicht langsamer |
| w-ego | 2+2 | steht | Belegung p95 ms | 5.51 | 5.83 | 0.33 | 1.21 | nicht langsamer |
| w-ego | 2+2 | geht | fps | 60.3 | 59.75 | -0.55 | 2.78 | nicht langsamer |
| w-ego | 2+2 | geht | Frame p95 ms | 25.1 | 25.1 | 0 | 0 | nicht langsamer |
| w-ego | 2+2 | geht | CPU-Takt p95 ms | 17.85 | 17.85 | 0 | 2.1 | nicht langsamer |
| w-ego | 2+2 | geht | Belegung p95 ms | 21.46 | 22.26 | 0.8 | 1.76 | nicht langsamer |
| w-ego | 2+2 | Zählung | steht Befehle | 38 | 38 | 0 | – | – |
| w-ego | 2+2 | Zählung | steht Dreiecke p95 | 263934 | 264030 | 96 | – | – |
| w-ego | 2+2 | Zählung | steht VRAM MB | 107.85 | 107.8 | -0.05 | – | – |
| w-ego | 2+2 | Zählung | geht Befehle | 55 | 55 | 0 | – | – |
| w-ego | 2+2 | Zählung | geht Dreiecke p95 | 378189 | 385478 | 7289 | – | – |
| w-ego | 2+2 | Zählung | geht VRAM MB | 111.7 | 111.8 | 0.1 | – | – |
| **w-ego** | 2+2 | | **Urteil** | | | | | **nicht-langsamer** |
| d-ego | 2+2 | steht | fps | 76.5 | 76.3 | -0.2 | 1.61 | nicht langsamer |
| d-ego | 2+2 | steht | Frame p95 ms | 16.8 | 16.8 | 0 | 0 | nicht langsamer |
| d-ego | 2+2 | steht | CPU-Takt p95 ms | 5.05 | 5.1 | 0.05 | 0.3 | nicht langsamer |
| d-ego | 2+2 | steht | GPU je Bild ms (gpu-bank) | 12.45 | 12.21 | -0.24 | 0.17 | nicht langsamer |
| d-ego | 2+2 | steht | Belegung p95 ms | 6.69 | 6.84 | 0.15 | 0.45 | nicht langsamer |
| d-ego | 2+2 | Zählung | steht Befehle | 59 | 59 | 0 | – | – |
| d-ego | 2+2 | Zählung | steht Dreiecke p95 | 442977 | 444136 | 1159 | – | – |
| d-ego | 2+2 | Zählung | steht VRAM MB | 112.9 | 113.95 | 1.05 | – | – |
| **d-ego** | 2+2 | | **Urteil** | | | | | **nicht-langsamer** |
| stadt | 2+2 | steht | fps | 78.75 | 78.95 | 0.2 | 0.32 | nicht langsamer |
| stadt | 2+2 | steht | Frame p95 ms | 16.8 | 16.8 | 0 | 0 | nicht langsamer |
| stadt | 2+2 | steht | CPU-Takt p95 ms | 6.75 | 6.5 | -0.25 | 0.36 | nicht langsamer |
| stadt | 2+2 | steht | Belegung p95 ms | 10.2 | 9.86 | -0.34 | 0.68 | nicht langsamer |
| stadt | 2+2 | geht | fps | 40.85 | 42.3 | 1.45 | 5.12 | nicht langsamer |
| stadt | 2+2 | geht | Frame p95 ms | 45.85 | 45.8 | -0.05 | 11.67 | nicht langsamer |
| stadt | 2+2 | geht | CPU-Takt p95 ms | 39.65 | 38.4 | -1.25 | 6.99 | nicht langsamer |
| stadt | 2+2 | geht | Belegung p95 ms | 45.06 | 44.27 | -0.8 | 5.53 | nicht langsamer |
| stadt | 2+2 | Zählung | steht Befehle | 44 | 44 | 0 | – | – |
| stadt | 2+2 | Zählung | steht Dreiecke p95 | 1168689 | 1168690 | 0.5 | – | – |
| stadt | 2+2 | Zählung | steht VRAM MB | 144.8 | 152.3 | 7.5 | – | – |
| stadt | 2+2 | Zählung | geht Befehle | 74.5 | 75.5 | 1 | – | – |
| stadt | 2+2 | Zählung | geht Dreiecke p95 | 1973855 | 1975761 | 1907 | – | – |
| stadt | 2+2 | Zählung | geht VRAM MB | 203.45 | 204.15 | 0.7 | – | – |
| **stadt** | 2+2 | | **Urteil** | | | | | **nicht-langsamer** |

Instrument je Boot: 18a846491 (d-ego-A1, d-ego-A2, d-ego-B1, d-ego-B2, stadt-A1, stadt-A2, stadt-B1, stadt-B2, w-ego-A1, w-ego-A2, w-ego-B1, w-ego-B2)

Roh: `bericht/z14c-abab/`.
