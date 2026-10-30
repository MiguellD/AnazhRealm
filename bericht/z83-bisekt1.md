# z83-bisekt1 — ABAB 952a5603 gegen 73bdf938: LANGSAMER

GTX 1060, `--echt` 1920×1080, Regler voll, Messplatz-Dienst (zug/messplatz.md). A = 73bdf9388f22f5c1789e0da5b0c63b6121b045c8, B = 952a5603ffec4b4abb496394110f05de166a7ce6, Instrument aus B. Je Zelle 2+2, verlängert auf 4+4 nur bei Kern-Anschlag oder einer Größe zwischen 1σ und 2σ. Urteil je Größe Δ ≤ max(2σ gepoolt, Auflösung).

| Zelle | n A+B | Gang | Größe | A | B | Δ B − A | 2σ | Urteil |
|---|---|---|---|---|---|---|---|---|
| w-ego | 4+4 | steht | fps | 75.5 | 72.13 | -3.38 | 0.7 | LANGSAMER |
| w-ego | 4+4 | steht | Frame p95 ms | 16.8 | 16.8 | 0 | 0 | nicht langsamer |
| w-ego | 4+4 | steht | CPU-Takt p95 ms | 4.6 | 5.17 | 0.58 | 0.14 | LANGSAMER |
| w-ego | 4+4 | steht | GPU je Bild ms (gpu-bank) | 12.63 | 13.3 | 0.67 | 0.21 | LANGSAMER |
| w-ego | 4+4 | steht | Belegung p95 ms | 6.64 | 7.31 | 0.67 | 0.07 | LANGSAMER |
| w-ego | 4+4 | geht | fps | 59.65 | 56.97 | -2.68 | 0.58 | LANGSAMER |
| w-ego | 4+4 | geht | Frame p95 ms | 25.05 | 25.1 | 0.05 | 0.08 | nicht langsamer (1σ–2σ) |
| w-ego | 4+4 | geht | CPU-Takt p95 ms | 18.82 | 19.9 | 1.07 | 0.72 | LANGSAMER |
| w-ego | 4+4 | geht | Belegung p95 ms | 22 | 23.04 | 1.04 | 0.3 | LANGSAMER |
| w-ego | 4+4 | Zählung | steht Befehle | 39 | 39 | 0 | – | – |
| w-ego | 4+4 | Zählung | steht Dreiecke p95 | 264403 | 278103 | 13701 | – | – |
| w-ego | 4+4 | Zählung | steht VRAM MB | 108.43 | 114.78 | 6.35 | – | – |
| w-ego | 4+4 | Zählung | geht Befehle | 56.75 | 57 | 0.25 | – | – |
| w-ego | 4+4 | Zählung | geht Dreiecke p95 | 380935 | 395353 | 14418 | – | – |
| w-ego | 4+4 | Zählung | geht VRAM MB | 112.22 | 115.9 | 3.67 | – | – |
| **w-ego** | 4+4 | | **Urteil** | | | | | **LANGSAMER** |

Instrument je Boot: 73bdf9388 (w-ego-A1, w-ego-A2, w-ego-A3, w-ego-A4, w-ego-B1, w-ego-B2, w-ego-B3, w-ego-B4)

Roh: `bericht/z83-bisekt1/`.
