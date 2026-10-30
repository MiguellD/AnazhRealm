# z83-bisekt3 — ABAB 4df8c302 gegen 73bdf938: nicht-langsamer

GTX 1060, `--echt` 1920×1080, Regler voll, Messplatz-Dienst (zug/messplatz.md). A = 73bdf9388f22f5c1789e0da5b0c63b6121b045c8, B = 4df8c302d20ce3a314c0394d9404054db87abc3e, Instrument aus B. Je Zelle 2+2, verlängert auf 4+4 nur bei Kern-Anschlag oder einer Größe zwischen 1σ und 2σ. Urteil je Größe Δ ≤ max(2σ gepoolt, Auflösung).

| Zelle | n A+B | Gang | Größe | A | B | Δ B − A | 2σ | Urteil |
|---|---|---|---|---|---|---|---|---|
| w-ego | 2+2 | steht | fps | 75.1 | 75.1 | 0 | 1.52 | nicht langsamer |
| w-ego | 2+2 | steht | Frame p95 ms | 16.8 | 16.8 | 0 | 0 | nicht langsamer |
| w-ego | 2+2 | steht | CPU-Takt p95 ms | 4.85 | 4.8 | -0.05 | 0.36 | nicht langsamer |
| w-ego | 2+2 | steht | GPU je Bild ms (gpu-bank) | 12.89 | 12.85 | -0.04 | 0.1 | nicht langsamer |
| w-ego | 2+2 | steht | Belegung p95 ms | 6.95 | 6.77 | -0.18 | 0.5 | nicht langsamer |
| w-ego | 2+2 | geht | fps | 58.9 | 59.7 | 0.8 | 1 | nicht langsamer |
| w-ego | 2+2 | geht | Frame p95 ms | 25.1 | 25.05 | -0.05 | 0.1 | nicht langsamer |
| w-ego | 2+2 | geht | CPU-Takt p95 ms | 19.55 | 18.7 | -0.85 | 0.92 | nicht langsamer |
| w-ego | 2+2 | geht | Belegung p95 ms | 22.8 | 22.14 | -0.66 | 0.33 | nicht langsamer |
| w-ego | 2+2 | Zählung | steht Befehle | 39 | 39 | 0 | – | – |
| w-ego | 2+2 | Zählung | steht Dreiecke p95 | 264272 | 264273 | 0.5 | – | – |
| w-ego | 2+2 | Zählung | steht VRAM MB | 108.35 | 108.4 | 0.05 | – | – |
| w-ego | 2+2 | Zählung | geht Befehle | 57 | 57 | 0 | – | – |
| w-ego | 2+2 | Zählung | geht Dreiecke p95 | 384586 | 381909 | -2677 | – | – |
| w-ego | 2+2 | Zählung | geht VRAM MB | 112.1 | 112.1 | 0 | – | – |
| **w-ego** | 2+2 | | **Urteil** | | | | | **nicht-langsamer** |

Instrument je Boot: 73bdf9388 (w-ego-A1, w-ego-A2, w-ego-B1, w-ego-B2)

Roh: `bericht/z83-bisekt3/`.
