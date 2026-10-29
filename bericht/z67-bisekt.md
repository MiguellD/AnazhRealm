# z67-bisekt — ABAB 29a5f696 gegen c5fb8cbc: LANGSAMER

GTX 1060, `--echt` 1920×1080, Regler voll, Messplatz-Dienst (zug/messplatz.md). A = c5fb8cbc879d29176a598307b0d1f7d6da6f13aa, B = 29a5f696dbfa0ddac659b8ce808e83f32bf1ad29, Instrument aus B. Je Zelle 2+2, verlängert auf 4+4 nur bei Kern-Anschlag oder einer Größe zwischen 1σ und 2σ. Urteil je Größe Δ ≤ max(2σ gepoolt, Auflösung).

| Zelle | n A+B | Gang | Größe | A | B | Δ B − A | 2σ | Urteil |
|---|---|---|---|---|---|---|---|---|
| stadt | 4+4 | steht | fps | 79.6 | 77.88 | -1.72 | 0.57 | LANGSAMER |
| stadt | 4+4 | steht | Frame p95 ms | 16.7 | 16.8 | 0.1 | 0 | nicht langsamer |
| stadt | 4+4 | steht | CPU-Takt p95 ms | 5.88 | 8.1 | 2.22 | 0.51 | LANGSAMER |
| stadt | 4+4 | steht | Belegung p95 ms | 8.57 | 12.65 | 4.09 | 0.55 | LANGSAMER |
| stadt | 4+4 | geht | fps | 60.35 | 42.17 | -18.17 | 0.89 | LANGSAMER |
| stadt | 4+4 | geht | Frame p95 ms | 25.1 | 41.63 | 16.52 | 0.07 | LANGSAMER |
| stadt | 4+4 | geht | CPU-Takt p95 ms | 22.43 | 37.3 | 14.87 | 0.97 | LANGSAMER |
| stadt | 4+4 | geht | Belegung p95 ms | 24.43 | 40.94 | 16.5 | 2.63 | LANGSAMER |
| stadt | 4+4 | Zählung | steht Befehle | 53 | 59 | 6 | – | – |
| stadt | 4+4 | Zählung | steht Dreiecke p95 | 603048 | 1250732 | 647684 | – | – |
| stadt | 4+4 | Zählung | steht VRAM MB | 164.05 | 173.83 | 9.78 | – | – |
| stadt | 4+4 | Zählung | geht Befehle | 54 | 77.75 | 23.75 | – | – |
| stadt | 4+4 | Zählung | geht Dreiecke p95 | 582318 | 1499928 | 917610 | – | – |
| stadt | 4+4 | Zählung | geht VRAM MB | 156.98 | 169.5 | 12.52 | – | – |
| **stadt** | 4+4 | | **Urteil** | | | | | **LANGSAMER** |

Instrument je Boot: c5fb8cbc8 (stadt-A1, stadt-A2, stadt-A3, stadt-A4, stadt-B1, stadt-B2, stadt-B3, stadt-B4)

Roh: `bericht/z67-bisekt/`.
