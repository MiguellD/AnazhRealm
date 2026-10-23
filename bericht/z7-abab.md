# z7-abab — ABAB 877d3e04 gegen f7dd313c: LANGSAMER

GTX 1060, `--echt` 1920×1080, Regler voll, Messplatz-Dienst (zug/messplatz.md). A = f7dd313c5e8d716b3f28df3d0f1420e78c12e2c4, B = 877d3e04ea99e07f27e71600df4e4564c1378187, Instrument aus B. Je Zelle 2+2, verlängert auf 4+4 nur bei Kern-Anschlag oder einer Größe zwischen 1σ und 2σ. Urteil je Größe Δ ≤ max(2σ gepoolt, Auflösung).

| Zelle | n A+B | Gang | Größe | A | B | Δ B − A | 2σ | Urteil |
|---|---|---|---|---|---|---|---|---|
| w-ego | 4+4 | steht | fps | 78.2 | 78.55 | 0.35 | 1.73 | nicht langsamer |
| w-ego | 4+4 | steht | Frame p95 ms | 16.8 | 16.8 | 0 | 0 | nicht langsamer |
| w-ego | 4+4 | steht | CPU-Takt p95 ms | 3.92 | 4.08 | 0.15 | 0.34 | nicht langsamer |
| w-ego | 4+4 | steht | GPU je Bild ms (gpu-bank) | 12.96 | 13.01 | 0.06 | 1.45 | nicht langsamer |
| w-ego | 4+4 | steht | Belegung p95 ms | 5.61 | 5.77 | 0.16 | 0.41 | nicht langsamer |
| w-ego | 4+4 | geht | fps | 62.42 | 65.03 | 2.6 | 1.93 | nicht langsamer |
| w-ego | 4+4 | geht | Frame p95 ms | 25.08 | 25 | -0.08 | 0.07 | nicht langsamer |
| w-ego | 4+4 | geht | CPU-Takt p95 ms | 17.98 | 15.13 | -2.85 | 1.73 | nicht langsamer |
| w-ego | 4+4 | geht | Belegung p95 ms | 21.29 | 20.37 | -0.92 | 1.3 | nicht langsamer |
| w-ego | 4+4 | Zählung | steht Befehle | 38 | 38 | 0 | – | – |
| w-ego | 4+4 | Zählung | steht Dreiecke p95 | 290094 | 320943 | 30850 | – | – |
| w-ego | 4+4 | Zählung | steht VRAM MB | 108.4 | 108.45 | 0.05 | – | – |
| w-ego | 4+4 | Zählung | geht Befehle | 53 | 54 | 1 | – | – |
| w-ego | 4+4 | Zählung | geht Dreiecke p95 | 390499 | 417448 | 26949 | – | – |
| w-ego | 4+4 | Zählung | geht VRAM MB | 112.28 | 112.25 | -0.03 | – | – |
| **w-ego** | 4+4 | | **Urteil** | | | | | **nicht-langsamer** |
| g-third | 4+4 | steht | fps | 80.72 | 80.38 | -0.35 | 1.1 | nicht langsamer |
| g-third | 4+4 | steht | Frame p95 ms | 16.8 | 16.8 | 0 | 0 | nicht langsamer |
| g-third | 4+4 | steht | CPU-Takt p95 ms | 5.3 | 5.52 | 0.22 | 0.52 | nicht langsamer |
| g-third | 4+4 | steht | GPU je Bild ms (gpu-bank) | 11.19 | 11.37 | 0.18 | 0.55 | nicht langsamer |
| g-third | 4+4 | steht | Belegung p95 ms | 6.92 | 7.13 | 0.21 | 0.49 | nicht langsamer |
| g-third | 4+4 | Zählung | steht Befehle | 78 | 78 | 0 | – | – |
| g-third | 4+4 | Zählung | steht Dreiecke p95 | 357606 | 377601 | 19995 | – | – |
| g-third | 4+4 | Zählung | steht VRAM MB | 113.7 | 113.97 | 0.27 | – | – |
| **g-third** | 4+4 | | **Urteil** | | | | | **nicht-langsamer** |
| d-ego | 4+4 | steht | fps | 78.95 | 75.1 | -3.85 | 0.86 | LANGSAMER |
| d-ego | 4+4 | steht | Frame p95 ms | 16.8 | 16.8 | 0 | 0 | nicht langsamer |
| d-ego | 4+4 | steht | CPU-Takt p95 ms | 4.95 | 5.2 | 0.25 | 0.59 | nicht langsamer |
| d-ego | 4+4 | steht | GPU je Bild ms (gpu-bank) | 11.9 | 12.81 | 0.91 | 0.49 | LANGSAMER |
| d-ego | 4+4 | steht | Belegung p95 ms | 6.68 | 7.04 | 0.37 | 0.83 | nicht langsamer |
| d-ego | 4+4 | Zählung | steht Befehle | 57 | 58 | 1 | – | – |
| d-ego | 4+4 | Zählung | steht Dreiecke p95 | 454832 | 475270 | 20438 | – | – |
| d-ego | 4+4 | Zählung | steht VRAM MB | 114.35 | 114.68 | 0.33 | – | – |
| **d-ego** | 4+4 | | **Urteil** | | | | | **LANGSAMER** |
| stadt | 4+4 | steht | fps | 80 | 79.35 | -0.65 | 1.16 | nicht langsamer (1σ–2σ) |
| stadt | 4+4 | steht | Frame p95 ms | 16.8 | 16.77 | -0.03 | 0.07 | nicht langsamer |
| stadt | 4+4 | steht | CPU-Takt p95 ms | 6.1 | 6.35 | 0.25 | 0.52 | nicht langsamer |
| stadt | 4+4 | steht | Belegung p95 ms | 9.03 | 9.37 | 0.34 | 0.71 | nicht langsamer |
| stadt | 4+4 | geht | fps | 43.17 | 47.05 | 3.88 | 3.22 | nicht langsamer |
| stadt | 4+4 | geht | Frame p95 ms | 41.7 | 43.67 | 1.97 | 5.87 | nicht langsamer |
| stadt | 4+4 | geht | CPU-Takt p95 ms | 37.98 | 35.77 | -2.2 | 4.79 | nicht langsamer |
| stadt | 4+4 | geht | Belegung p95 ms | 43.47 | 40.52 | -2.95 | 4.73 | nicht langsamer |
| stadt | 4+4 | Zählung | steht Befehle | 43 | 43 | 0 | – | – |
| stadt | 4+4 | Zählung | steht Dreiecke p95 | 1189392 | 1193552 | 4161 | – | – |
| stadt | 4+4 | Zählung | steht VRAM MB | 145.2 | 146.25 | 1.05 | – | – |
| stadt | 4+4 | Zählung | geht Befehle | 71.25 | 72.75 | 1.5 | – | – |
| stadt | 4+4 | Zählung | geht Dreiecke p95 | 1843281 | 1852295 | 9015 | – | – |
| stadt | 4+4 | Zählung | geht VRAM MB | 198.35 | 201.22 | 2.87 | – | – |
| **stadt** | 4+4 | | **Urteil** | | | | | **nicht-langsamer** |
| fahrt | 4+4 | volle Fahrt | fps | 51.05 | 55.5 | 4.45 | 4.92 | nicht langsamer |
| fahrt | 4+4 | volle Fahrt | Frame p95 | 33.4 | 29.25 | -4.15 | 8.1 | nicht langsamer |
| fahrt | 4+4 | volle Fahrt | Frame p99 | 50.05 | 49.9 | -0.15 | 0.1 | nicht langsamer |
| fahrt | 4+4 | volle Fahrt | CPU-Takt p95 | 30 | 25.55 | -4.45 | 8.22 | nicht langsamer |
| fahrt | 4+4 | volle Fahrt | Belegung p95 | 33.63 | 29.02 | -4.61 | 7.8 | nicht langsamer |
| fahrt | 4+4 | Zählung | Befehle | 59.25 | 61.75 | 2.5 | – | – |
| fahrt | 4+4 | Zählung | Dreiecke p95 | 434405 | 499348 | 64943 | – | – |
| fahrt | 4+4 | Zählung | VRAM MB | 117.25 | 120.32 | 3.07 | – | – |
| fahrt | – | volle Fahrten | A3 A4 B1 B2 | | | | | |
| **fahrt** | 4+4 | | **Urteil** | | | | | **nicht-langsamer** |

Roh: `bericht/z7-abab/`.
