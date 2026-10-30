# z83-bisekt6 — ABAB abb24c37 gegen 81ce4392: nicht-langsamer

GTX 1060, `--echt` 1920×1080, Regler voll, Messplatz-Dienst (zug/messplatz.md). A = 81ce43926eccd996aa9d4fc76769108def84f4ce, B = abb24c37e5eccc8f6ceff03b33acde9ad28fa18e, Instrument aus B. Je Zelle 2+2, verlängert auf 4+4 nur bei Kern-Anschlag oder einer Größe zwischen 1σ und 2σ. Urteil je Größe Δ ≤ max(2σ gepoolt, Auflösung).

| Zelle | n A+B | Gang | Größe | A | B | Δ B − A | 2σ | Urteil |
|---|---|---|---|---|---|---|---|---|
| w-ego | 2+2 | steht | fps | 72.1 | 72.8 | 0.7 | 0.57 | nicht langsamer |
| w-ego | 2+2 | steht | Frame p95 ms | 16.8 | 16.8 | 0 | 0 | nicht langsamer |
| w-ego | 2+2 | steht | CPU-Takt p95 ms | 4.9 | 5 | 0.1 | 0.2 | nicht langsamer |
| w-ego | 2+2 | steht | GPU je Bild ms (gpu-bank) | 13.4 | 13.24 | -0.15 | 0.11 | nicht langsamer |
| w-ego | 2+2 | steht | Belegung p95 ms | 6.97 | 7.02 | 0.05 | 0.28 | nicht langsamer |
| w-ego | 2+2 | geht | fps | 57.65 | 57.75 | 0.1 | 0.42 | nicht langsamer |
| w-ego | 2+2 | geht | Frame p95 ms | 25.1 | 25.1 | 0 | 0 | nicht langsamer |
| w-ego | 2+2 | geht | CPU-Takt p95 ms | 19.55 | 19.35 | -0.2 | 0.51 | nicht langsamer |
| w-ego | 2+2 | geht | Belegung p95 ms | 22.55 | 22.72 | 0.17 | 0.28 | nicht langsamer |
| w-ego | 2+2 | Zählung | steht Befehle | 39 | 39 | 0 | – | – |
| w-ego | 2+2 | Zählung | steht Dreiecke p95 | 264274 | 264237 | -37 | – | – |
| w-ego | 2+2 | Zählung | steht VRAM MB | 109.5 | 109.5 | 0 | – | – |
| w-ego | 2+2 | Zählung | geht Befehle | 57 | 57 | 0 | – | – |
| w-ego | 2+2 | Zählung | geht Dreiecke p95 | 383765 | 382595 | -1170 | – | – |
| w-ego | 2+2 | Zählung | geht VRAM MB | 113.2 | 113.05 | -0.15 | – | – |
| **w-ego** | 2+2 | | **Urteil** | | | | | **nicht-langsamer** |

Instrument je Boot: 81ce43926 (w-ego-A1, w-ego-A2, w-ego-B1, w-ego-B2)

Roh: `bericht/z83-bisekt6/`.
