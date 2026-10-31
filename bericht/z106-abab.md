# z106-abab — ABAB b4bcf19c gegen 48cc0efc: nicht-langsamer

GTX 1060, `--echt` 1920×1080, Regler voll, Messplatz-Dienst (zug/messplatz.md). A = 48cc0efcacdf2eff12431f57793c881bcdb8d69b, B = b4bcf19c21d456de2547313768915d6a821e4087, Instrument aus B. Je Zelle 2+2, verlängert auf 4+4 nur bei Kern-Anschlag oder einer Größe zwischen 1σ und 2σ. Urteil je Größe Δ ≤ max(2σ gepoolt, Auflösung).

| Zelle | n A+B | Gang | Größe | A | B | Δ B − A | 2σ | Urteil |
|---|---|---|---|---|---|---|---|---|
| g-third | 2+2 | steht | fps | 76.65 | 78.5 | 1.85 | 1.63 | nicht langsamer |
| g-third | 2+2 | steht | Frame p95 ms | 16.8 | 16.8 | 0 | 0 | nicht langsamer |
| g-third | 2+2 | steht | CPU-Takt p95 ms | 7.25 | 6.5 | -0.75 | 0.41 | nicht langsamer |
| g-third | 2+2 | steht | GPU je Bild ms (gpu-bank) | 12.5 | 12.51 | 0.01 | 0.56 | nicht langsamer |
| g-third | 2+2 | steht | Belegung p95 ms | 9.98 | 9 | -0.99 | 0.74 | nicht langsamer |
| g-third | 2+2 | Zählung | steht Befehle | 81 | 83 | 2 | – | – |
| g-third | 2+2 | Zählung | steht Dreiecke p95 | 344445 | 390205 | 45760 | – | – |
| g-third | 2+2 | Zählung | steht VRAM MB | 119.85 | 123.25 | 3.4 | – | – |
| **g-third** | 2+2 | | **Urteil** | | | | | **nicht-langsamer** |
| w-ego | 2+2 | steht | fps | 67.05 | 66.5 | -0.55 | 0.78 | nicht langsamer |
| w-ego | 2+2 | steht | Frame p95 ms | 16.8 | 16.8 | 0 | 0 | nicht langsamer |
| w-ego | 2+2 | steht | CPU-Takt p95 ms | 5.2 | 5.4 | 0.2 | 1 | nicht langsamer |
| w-ego | 2+2 | steht | GPU je Bild ms (gpu-bank) | 14.32 | 14.39 | 0.07 | 0.26 | nicht langsamer |
| w-ego | 2+2 | steht | Belegung p95 ms | 7.75 | 7.88 | 0.13 | 1.09 | nicht langsamer |
| w-ego | 2+2 | geht | fps | 56.65 | 56 | -0.65 | 1.1 | nicht langsamer |
| w-ego | 2+2 | geht | Frame p95 ms | 25.1 | 25.1 | 0 | 0 | nicht langsamer |
| w-ego | 2+2 | geht | CPU-Takt p95 ms | 16.95 | 17.3 | 0.35 | 0.73 | nicht langsamer |
| w-ego | 2+2 | geht | Belegung p95 ms | 22.32 | 22.73 | 0.41 | 0.92 | nicht langsamer |
| w-ego | 2+2 | Zählung | steht Befehle | 41 | 41 | 0 | – | – |
| w-ego | 2+2 | Zählung | steht Dreiecke p95 | 262034 | 262107 | 73 | – | – |
| w-ego | 2+2 | Zählung | steht VRAM MB | 117.7 | 117.65 | -0.05 | – | – |
| w-ego | 2+2 | Zählung | geht Befehle | 58 | 58 | 0 | – | – |
| w-ego | 2+2 | Zählung | geht Dreiecke p95 | 381154 | 389484 | 8330 | – | – |
| w-ego | 2+2 | Zählung | geht VRAM MB | 122.25 | 122.3 | 0.05 | – | – |
| **w-ego** | 2+2 | | **Urteil** | | | | | **nicht-langsamer** |

Instrument je Boot: 48cc0efca (g-third-A1, g-third-A2, g-third-B1, g-third-B2, w-ego-A1, w-ego-A2, w-ego-B1, w-ego-B2)

Roh: `bericht/z106-abab/`.
