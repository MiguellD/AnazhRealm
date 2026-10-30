# z83-bisekt2b — ABAB 24a0f3ef gegen 73bdf938: LANGSAMER

GTX 1060, `--echt` 1920×1080, Regler voll, Messplatz-Dienst (zug/messplatz.md). A = 73bdf9388f22f5c1789e0da5b0c63b6121b045c8, B = 24a0f3eff6051ae954369fd774cce415d1f32dc5, Instrument aus B. Je Zelle 2+2, verlängert auf 4+4 nur bei Kern-Anschlag oder einer Größe zwischen 1σ und 2σ. Urteil je Größe Δ ≤ max(2σ gepoolt, Auflösung).

| Zelle | n A+B | Gang | Größe | A | B | Δ B − A | 2σ | Urteil |
|---|---|---|---|---|---|---|---|---|
| w-ego | 2+2 | steht | fps | 74.65 | 71.65 | -3 | 0.51 | LANGSAMER |
| w-ego | 2+2 | steht | Frame p95 ms | 16.8 | 16.8 | 0 | 0 | nicht langsamer |
| w-ego | 2+2 | steht | CPU-Takt p95 ms | 4.6 | 5.15 | 0.55 | 0.1 | LANGSAMER |
| w-ego | 2+2 | steht | GPU je Bild ms (gpu-bank) | 13.46 | 13.29 | -0.17 | 1.1 | nicht langsamer |
| w-ego | 2+2 | steht | Belegung p95 ms | 6.62 | 7.31 | 0.69 | 0.07 | LANGSAMER |
| w-ego | 2+2 | geht | fps | 59.55 | 56.85 | -2.7 | 2.37 | LANGSAMER |
| w-ego | 2+2 | geht | Frame p95 ms | 25.05 | 25.1 | 0.05 | 0.1 | nicht langsamer |
| w-ego | 2+2 | geht | CPU-Takt p95 ms | 18.9 | 20 | 1.1 | 1.98 | nicht langsamer (1σ–2σ) |
| w-ego | 2+2 | geht | Belegung p95 ms | 22.16 | 23.01 | 0.85 | 0.89 | nicht langsamer |
| w-ego | 2+2 | Zählung | steht Befehle | 39 | 39 | 0 | – | – |
| w-ego | 2+2 | Zählung | steht Dreiecke p95 | 264259 | 278104 | 13846 | – | – |
| w-ego | 2+2 | Zählung | steht VRAM MB | 108.35 | 114.75 | 6.4 | – | – |
| w-ego | 2+2 | Zählung | geht Befehle | 57 | 57 | 0 | – | – |
| w-ego | 2+2 | Zählung | geht Dreiecke p95 | 381697 | 396645 | 14949 | – | – |
| w-ego | 2+2 | Zählung | geht VRAM MB | 112.05 | 116.15 | 4.1 | – | – |
| **w-ego** | 2+2 | | **Urteil** | | | | | **LANGSAMER** |

Instrument je Boot: 73bdf9388 (w-ego-A1, w-ego-A2, w-ego-B1, w-ego-B2)

Roh: `bericht/z83-bisekt2b/`.
