# z83-bisekt4 — ABAB 81ce4392 gegen 4df8c302: LANGSAMER

GTX 1060, `--echt` 1920×1080, Regler voll, Messplatz-Dienst (zug/messplatz.md). A = 4df8c302d20ce3a314c0394d9404054db87abc3e, B = 81ce43926eccd996aa9d4fc76769108def84f4ce, Instrument aus B. Je Zelle 2+2, verlängert auf 4+4 nur bei Kern-Anschlag oder einer Größe zwischen 1σ und 2σ. Urteil je Größe Δ ≤ max(2σ gepoolt, Auflösung).

| Zelle | n A+B | Gang | Größe | A | B | Δ B − A | 2σ | Urteil |
|---|---|---|---|---|---|---|---|---|
| w-ego | 4+4 | steht | fps | 75.32 | 72.88 | -2.45 | 1.75 | LANGSAMER |
| w-ego | 4+4 | steht | Frame p95 ms | 16.8 | 16.8 | 0 | 0 | nicht langsamer |
| w-ego | 4+4 | steht | CPU-Takt p95 ms | 4.67 | 4.83 | 0.15 | 0.46 | nicht langsamer |
| w-ego | 4+4 | steht | GPU je Bild ms (gpu-bank) | 12.96 | 13.17 | 0.21 | 0.66 | nicht langsamer |
| w-ego | 4+4 | steht | Belegung p95 ms | 6.56 | 6.75 | 0.2 | 0.44 | nicht langsamer |
| w-ego | 4+4 | geht | fps | 59.83 | 57.83 | -2 | 1.24 | LANGSAMER |
| w-ego | 4+4 | geht | Frame p95 ms | 25.05 | 25.08 | 0.03 | 0.11 | nicht langsamer |
| w-ego | 4+4 | geht | CPU-Takt p95 ms | 18.65 | 19.32 | 0.68 | 0.98 | nicht langsamer (1σ–2σ) |
| w-ego | 4+4 | geht | Belegung p95 ms | 22.08 | 22.8 | 0.71 | 1.02 | nicht langsamer |
| w-ego | 4+4 | Zählung | steht Befehle | 39 | 39 | 0 | – | – |
| w-ego | 4+4 | Zählung | steht Dreiecke p95 | 264423 | 264404 | -19 | – | – |
| w-ego | 4+4 | Zählung | steht VRAM MB | 108.4 | 109.45 | 1.05 | – | – |
| w-ego | 4+4 | Zählung | geht Befehle | 56.25 | 57 | 0.75 | – | – |
| w-ego | 4+4 | Zählung | geht Dreiecke p95 | 381355 | 383818 | 2463 | – | – |
| w-ego | 4+4 | Zählung | geht VRAM MB | 112.22 | 113.2 | 0.97 | – | – |
| **w-ego** | 4+4 | | **Urteil** | | | | | **LANGSAMER** |

Instrument je Boot: 4df8c302d (w-ego-A1, w-ego-A2, w-ego-A3, w-ego-A4, w-ego-B1, w-ego-B2, w-ego-B3, w-ego-B4)

Roh: `bericht/z83-bisekt4/`.
