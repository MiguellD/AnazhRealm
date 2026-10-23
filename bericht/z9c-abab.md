# z9c-abab — ABAB 13c95713 gegen f7dd313c: nicht-langsamer

GTX 1060, `--echt` 1920×1080, Regler voll, Messplatz-Dienst (zug/messplatz.md). A = f7dd313c5e8d716b3f28df3d0f1420e78c12e2c4, B = 13c95713e286923682dc8986505a581c9c8467db, Instrument aus B. Je Zelle 2+2, verlängert auf 4+4 nur bei Kern-Anschlag oder einer Größe zwischen 1σ und 2σ. Urteil je Größe Δ ≤ max(2σ gepoolt, Auflösung).

| Zelle | n A+B | Gang | Größe | A | B | Δ B − A | 2σ | Urteil |
|---|---|---|---|---|---|---|---|---|
| w-ego | 4+4 | steht | fps | 76.75 | 76.65 | -0.1 | 0.96 | nicht langsamer |
| w-ego | 4+4 | steht | Frame p95 ms | 16.8 | 16.8 | 0 | 0 | nicht langsamer |
| w-ego | 4+4 | steht | CPU-Takt p95 ms | 4.92 | 4.55 | -0.38 | 0.67 | nicht langsamer |
| w-ego | 4+4 | steht | GPU je Bild ms (gpu-bank) | 12.18 | 12.57 | 0.38 | 0.47 | nicht langsamer (1σ–2σ) |
| w-ego | 4+4 | steht | Belegung p95 ms | 6.89 | 6.47 | -0.42 | 0.86 | nicht langsamer |
| w-ego | 4+4 | geht | fps | 59.77 | 59.8 | 0.03 | 3.47 | nicht langsamer |
| w-ego | 4+4 | geht | Frame p95 ms | 25.1 | 25.1 | 0 | 0 | nicht langsamer |
| w-ego | 4+4 | geht | CPU-Takt p95 ms | 20.15 | 19.98 | -0.17 | 3.3 | nicht langsamer |
| w-ego | 4+4 | geht | Belegung p95 ms | 23.27 | 22.79 | -0.48 | 2.22 | nicht langsamer |
| w-ego | 4+4 | Zählung | steht Befehle | 38 | 38 | 0 | – | – |
| w-ego | 4+4 | Zählung | steht Dreiecke p95 | 294704 | 284243 | -10461 | – | – |
| w-ego | 4+4 | Zählung | steht VRAM MB | 108.55 | 105.7 | -2.85 | – | – |
| w-ego | 4+4 | Zählung | geht Befehle | 53.25 | 53.25 | 0 | – | – |
| w-ego | 4+4 | Zählung | geht Dreiecke p95 | 405294 | 388623 | -16671 | – | – |
| w-ego | 4+4 | Zählung | geht VRAM MB | 112.28 | 109.4 | -2.88 | – | – |
| **w-ego** | 4+4 | | **Urteil** | | | | | **nicht-langsamer** |
| g-third | 2+2 | steht | fps | 79.95 | 80.4 | 0.45 | 0.41 | nicht langsamer |
| g-third | 2+2 | steht | Frame p95 ms | 16.7 | 16.75 | 0.05 | 0.1 | nicht langsamer |
| g-third | 2+2 | steht | CPU-Takt p95 ms | 6.05 | 5.7 | -0.35 | 0.22 | nicht langsamer |
| g-third | 2+2 | steht | GPU je Bild ms (gpu-bank) | 11.64 | 11.7 | 0.05 | 0.65 | nicht langsamer |
| g-third | 2+2 | steht | Belegung p95 ms | 7.83 | 7.43 | -0.39 | 0.37 | nicht langsamer |
| g-third | 2+2 | Zählung | steht Befehle | 78 | 78 | 0 | – | – |
| g-third | 2+2 | Zählung | steht Dreiecke p95 | 356932 | 345628 | -11304 | – | – |
| g-third | 2+2 | Zählung | steht VRAM MB | 113.85 | 111.1 | -2.75 | – | – |
| **g-third** | 2+2 | | **Urteil** | | | | | **nicht-langsamer** |
| d-ego | 4+4 | steht | fps | 77.82 | 77.82 | 0 | 0.9 | nicht langsamer |
| d-ego | 4+4 | steht | Frame p95 ms | 16.8 | 16.8 | 0 | 0 | nicht langsamer |
| d-ego | 4+4 | steht | CPU-Takt p95 ms | 5.55 | 5.78 | 0.23 | 0.65 | nicht langsamer |
| d-ego | 4+4 | steht | GPU je Bild ms (gpu-bank) | 12.34 | 12.42 | 0.08 | 0.7 | nicht langsamer |
| d-ego | 4+4 | steht | Belegung p95 ms | 7.31 | 7.79 | 0.47 | 0.91 | nicht langsamer (1σ–2σ) |
| d-ego | 4+4 | Zählung | steht Befehle | 57 | 59 | 2 | – | – |
| d-ego | 4+4 | Zählung | steht Dreiecke p95 | 455089 | 446254 | -8835 | – | – |
| d-ego | 4+4 | Zählung | steht VRAM MB | 113.5 | 108.55 | -4.95 | – | – |
| **d-ego** | 4+4 | | **Urteil** | | | | | **nicht-langsamer** |
| stadt | 4+4 | steht | fps | 78.63 | 78.88 | 0.25 | 0.75 | nicht langsamer |
| stadt | 4+4 | steht | Frame p95 ms | 16.8 | 16.77 | -0.03 | 0.07 | nicht langsamer |
| stadt | 4+4 | steht | CPU-Takt p95 ms | 6.65 | 6.92 | 0.27 | 0.62 | nicht langsamer |
| stadt | 4+4 | steht | Belegung p95 ms | 9.86 | 10.26 | 0.4 | 0.81 | nicht langsamer |
| stadt | 4+4 | geht | fps | 39.77 | 39.98 | 0.2 | 1.78 | nicht langsamer |
| stadt | 4+4 | geht | Frame p95 ms | 47.9 | 47.9 | 0 | 8.27 | nicht langsamer |
| stadt | 4+4 | geht | CPU-Takt p95 ms | 42.23 | 41 | -1.23 | 4.73 | nicht langsamer |
| stadt | 4+4 | geht | Belegung p95 ms | 47.1 | 47.54 | 0.44 | 5.42 | nicht langsamer |
| stadt | 4+4 | Zählung | steht Befehle | 43 | 44 | 1 | – | – |
| stadt | 4+4 | Zählung | steht Dreiecke p95 | 1189386 | 1191988 | 2602 | – | – |
| stadt | 4+4 | Zählung | steht VRAM MB | 152.88 | 147.63 | -5.25 | – | – |
| stadt | 4+4 | Zählung | geht Befehle | 71 | 73.25 | 2.25 | – | – |
| stadt | 4+4 | Zählung | geht Dreiecke p95 | 1837937 | 1842162 | 4225 | – | – |
| stadt | 4+4 | Zählung | geht VRAM MB | 188.02 | 193.95 | 5.93 | – | – |
| **stadt** | 4+4 | | **Urteil** | | | | | **nicht-langsamer** |
| fahrt | 4+4 | volle Fahrt | fps | 47.6 | 49.2 | 1.6 | 8.5 | nicht langsamer |
| fahrt | 4+4 | volle Fahrt | Frame p95 | 37.48 | 33.4 | -4.08 | 10.65 | nicht langsamer |
| fahrt | 4+4 | volle Fahrt | Frame p99 | 54.2 | 50 | -4.2 | 10.59 | nicht langsamer |
| fahrt | 4+4 | volle Fahrt | CPU-Takt p95 | 33.05 | 31.3 | -1.75 | 5.8 | nicht langsamer |
| fahrt | 4+4 | volle Fahrt | Belegung p95 | 35.91 | 32.86 | -3.05 | 7.67 | nicht langsamer |
| fahrt | 4+4 | Zählung | Befehle | 63.75 | 63 | -0.75 | – | – |
| fahrt | 4+4 | Zählung | Dreiecke p95 | 474945 | 461243 | -13702 | – | – |
| fahrt | 4+4 | Zählung | VRAM MB | 118.42 | 115.28 | -3.15 | – | – |
| fahrt | – | volle Fahrten | A1 A2 A3 A4 B4 | | | | | |
| **fahrt** | 4+4 | | **Urteil** | | | | | **nicht-langsamer** |

Instrument je Boot: f7dd313c5 (d-ego-A1, d-ego-A2, d-ego-A3, d-ego-A4, d-ego-B1, d-ego-B2, d-ego-B3, d-ego-B4, fahrt-A1, fahrt-A2, fahrt-A3, fahrt-A4, fahrt-B1, fahrt-B2, fahrt-B3, fahrt-B4, g-third-A1, g-third-A2, g-third-B1, g-third-B2, stadt-A1, stadt-A2, stadt-A3, stadt-A4, stadt-B1, stadt-B2, stadt-B3, stadt-B4, w-ego-A1, w-ego-A2, w-ego-A3, w-ego-A4, w-ego-B1, w-ego-B2, w-ego-B3, w-ego-B4)

Roh: `bericht/z9c-abab/`.
