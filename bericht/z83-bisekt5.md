# z83-bisekt5 — ABAB 24a0f3ef gegen 81ce4392: LANGSAMER

GTX 1060, `--echt` 1920×1080, Regler voll, Messplatz-Dienst (zug/messplatz.md). A = 81ce43926eccd996aa9d4fc76769108def84f4ce, B = 24a0f3eff6051ae954369fd774cce415d1f32dc5, Instrument aus B. Je Zelle 2+2, verlängert auf 4+4 nur bei Kern-Anschlag oder einer Größe zwischen 1σ und 2σ. Urteil je Größe Δ ≤ max(2σ gepoolt, Auflösung).

| Zelle | n A+B | Gang | Größe | A | B | Δ B − A | 2σ | Urteil |
|---|---|---|---|---|---|---|---|---|
| w-ego | 2+2 | steht | fps | 73.15 | 71.6 | -1.55 | 1.51 | LANGSAMER |
| w-ego | 2+2 | steht | Frame p95 ms | 16.8 | 16.8 | 0 | 0 | nicht langsamer |
| w-ego | 2+2 | steht | CPU-Takt p95 ms | 4.7 | 5.4 | 0.7 | 0.2 | LANGSAMER |
| w-ego | 2+2 | steht | GPU je Bild ms (gpu-bank) | 13.23 | 13.38 | 0.15 | 0.46 | nicht langsamer |
| w-ego | 2+2 | steht | Belegung p95 ms | 6.72 | 7.45 | 0.72 | 0.16 | LANGSAMER |
| w-ego | 2+2 | geht | fps | 57.9 | 56.95 | -0.95 | 0.54 | LANGSAMER |
| w-ego | 2+2 | geht | Frame p95 ms | 25.1 | 25.1 | 0 | 0 | nicht langsamer |
| w-ego | 2+2 | geht | CPU-Takt p95 ms | 19.1 | 19.8 | 0.7 | 0 | LANGSAMER |
| w-ego | 2+2 | geht | Belegung p95 ms | 22.6 | 23.02 | 0.42 | 0.44 | nicht langsamer |
| w-ego | 2+2 | Zählung | steht Befehle | 39 | 39 | 0 | – | – |
| w-ego | 2+2 | Zählung | steht Dreiecke p95 | 264843 | 278686 | 13844 | – | – |
| w-ego | 2+2 | Zählung | steht VRAM MB | 109.4 | 114.7 | 5.3 | – | – |
| w-ego | 2+2 | Zählung | geht Befehle | 57 | 57 | 0 | – | – |
| w-ego | 2+2 | Zählung | geht Dreiecke p95 | 382017 | 397715 | 15698 | – | – |
| w-ego | 2+2 | Zählung | geht VRAM MB | 113.1 | 115.8 | 2.7 | – | – |
| **w-ego** | 2+2 | | **Urteil** | | | | | **LANGSAMER** |

Instrument je Boot: 81ce43926 (w-ego-A1, w-ego-A2, w-ego-B1, w-ego-B2)

Roh: `bericht/z83-bisekt5/`.
