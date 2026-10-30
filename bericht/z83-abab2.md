# z83-abab2 — ABAB 6b3da705 gegen 73bdf938: LANGSAMER

GTX 1060, `--echt` 1920×1080, Regler voll, Messplatz-Dienst (zug/messplatz.md). A = 73bdf9388f22f5c1789e0da5b0c63b6121b045c8, B = 6b3da705074d6eacd348a192aecbaeb8d2592495, Instrument aus B. Je Zelle 2+2, verlängert auf 4+4 nur bei Kern-Anschlag oder einer Größe zwischen 1σ und 2σ. Urteil je Größe Δ ≤ max(2σ gepoolt, Auflösung).

| Zelle | n A+B | Gang | Größe | A | B | Δ B − A | 2σ | Urteil |
|---|---|---|---|---|---|---|---|---|
| stadt | 4+4 | steht | fps | 74.3 | 69.97 | -4.33 | 0.51 | LANGSAMER |
| stadt | 4+4 | steht | Frame p95 ms | 16.82 | 21.05 | 4.22 | 6.29 | nicht langsamer (1σ–2σ) |
| stadt | 4+4 | steht | CPU-Takt p95 ms | 10.15 | 10.55 | 0.4 | 0.55 | nicht langsamer (1σ–2σ) |
| stadt | 4+4 | steht | Belegung p95 ms | 15.36 | 16.02 | 0.66 | 0.91 | nicht langsamer |
| stadt | 4+4 | geht | fps | 34.63 | 35.63 | 1 | 1.28 | nicht langsamer |
| stadt | 4+4 | geht | Frame p95 ms | 52.05 | 49.98 | -2.07 | 5.7 | nicht langsamer |
| stadt | 4+4 | geht | CPU-Takt p95 ms | 47.95 | 44.93 | -3.02 | 3.98 | nicht langsamer |
| stadt | 4+4 | geht | Belegung p95 ms | 51.22 | 49.91 | -1.31 | 2.99 | nicht langsamer |
| stadt | 4+4 | Zählung | steht Befehle | 56 | 58.25 | 2.25 | – | – |
| stadt | 4+4 | Zählung | steht Dreiecke p95 | 1236186 | 1250456 | 14270 | – | – |
| stadt | 4+4 | Zählung | steht VRAM MB | 175.88 | 181.38 | 5.5 | – | – |
| stadt | 4+4 | Zählung | geht Befehle | 88 | 92.5 | 4.5 | – | – |
| stadt | 4+4 | Zählung | geht Dreiecke p95 | 1435005 | 1458742 | 23737 | – | – |
| stadt | 4+4 | Zählung | geht VRAM MB | 172.88 | 177.18 | 4.3 | – | – |
| **stadt** | 4+4 | | **Urteil** | | | | | **LANGSAMER** |
| w-ego | 4+4 | steht | fps | 75.13 | 70.5 | -4.63 | 1.43 | LANGSAMER |
| w-ego | 4+4 | steht | Frame p95 ms | 16.8 | 16.8 | 0 | 0 | nicht langsamer |
| w-ego | 4+4 | steht | CPU-Takt p95 ms | 4.8 | 5.35 | 0.55 | 0.37 | LANGSAMER |
| w-ego | 4+4 | steht | GPU je Bild ms (gpu-bank) | 12.83 | 13.62 | 0.79 | 0.37 | LANGSAMER |
| w-ego | 4+4 | steht | Belegung p95 ms | 6.83 | 7.64 | 0.81 | 0.43 | LANGSAMER |
| w-ego | 4+4 | geht | fps | 59.28 | 55.9 | -3.38 | 1.32 | LANGSAMER |
| w-ego | 4+4 | geht | Frame p95 ms | 25.05 | 25.1 | 0.05 | 0.08 | nicht langsamer (1σ–2σ) |
| w-ego | 4+4 | geht | CPU-Takt p95 ms | 19.4 | 20.43 | 1.02 | 1.11 | nicht langsamer (1σ–2σ) |
| w-ego | 4+4 | geht | Belegung p95 ms | 22.42 | 23.48 | 1.06 | 1.1 | nicht langsamer |
| w-ego | 4+4 | Zählung | steht Befehle | 39 | 39 | 0 | – | – |
| w-ego | 4+4 | Zählung | steht Dreiecke p95 | 264263 | 260481 | -3782 | – | – |
| w-ego | 4+4 | Zählung | steht VRAM MB | 108.38 | 114.88 | 6.5 | – | – |
| w-ego | 4+4 | Zählung | geht Befehle | 56.75 | 57.75 | 1 | – | – |
| w-ego | 4+4 | Zählung | geht Dreiecke p95 | 382393 | 379879 | -2514 | – | – |
| w-ego | 4+4 | Zählung | geht VRAM MB | 112.15 | 115.85 | 3.7 | – | – |
| **w-ego** | 4+4 | | **Urteil** | | | | | **LANGSAMER** |

Instrument je Boot: 73bdf9388 (stadt-A1, stadt-A2, stadt-A3, stadt-A4, stadt-B1, stadt-B2, stadt-B3, stadt-B4, w-ego-A1, w-ego-A2, w-ego-A3, w-ego-A4, w-ego-B1, w-ego-B2, w-ego-B3, w-ego-B4)

Roh: `bericht/z83-abab2/`.
