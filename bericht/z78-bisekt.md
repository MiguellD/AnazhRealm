# z78-bisekt — ABAB 748ea96f gegen 715754fc: LANGSAMER

GTX 1060, `--echt` 1920×1080, Regler voll, Messplatz-Dienst (zug/messplatz.md). A = 715754fc0cff89917d8ee933ba23e208bfdd54fb, B = 748ea96f36af0a1d74d7308ca185f5995087bbcd, Instrument aus B. Je Zelle 2+2, verlängert auf 4+4 nur bei Kern-Anschlag oder einer Größe zwischen 1σ und 2σ. Urteil je Größe Δ ≤ max(2σ gepoolt, Auflösung).

| Zelle | n A+B | Gang | Größe | A | B | Δ B − A | 2σ | Urteil |
|---|---|---|---|---|---|---|---|---|
| stadt | 4+4 | steht | fps | 78.4 | 74.55 | -3.85 | 0.85 | LANGSAMER |
| stadt | 4+4 | steht | Frame p95 ms | 16.8 | 16.82 | 0.02 | 0.07 | nicht langsamer |
| stadt | 4+4 | steht | CPU-Takt p95 ms | 7.42 | 9.83 | 2.4 | 0.4 | LANGSAMER |
| stadt | 4+4 | steht | Belegung p95 ms | 11.34 | 14.95 | 3.61 | 0.54 | LANGSAMER |
| stadt | 4+4 | geht | fps | 42.98 | 35.33 | -7.65 | 0.8 | LANGSAMER |
| stadt | 4+4 | geht | Frame p95 ms | 41.68 | 50 | 8.32 | 0.07 | LANGSAMER |
| stadt | 4+4 | geht | CPU-Takt p95 ms | 37.38 | 46.33 | 8.95 | 3.43 | LANGSAMER |
| stadt | 4+4 | geht | Belegung p95 ms | 41.22 | 49.64 | 8.42 | 2.67 | LANGSAMER |
| stadt | 4+4 | Zählung | steht Befehle | 58.75 | 56 | -2.75 | – | – |
| stadt | 4+4 | Zählung | steht Dreiecke p95 | 1246751 | 1236253 | -10498 | – | – |
| stadt | 4+4 | Zählung | steht VRAM MB | 170.43 | 175.35 | 4.93 | – | – |
| stadt | 4+4 | Zählung | geht Befehle | 76 | 87.25 | 11.25 | – | – |
| stadt | 4+4 | Zählung | geht Dreiecke p95 | 1366319 | 1431368 | 65050 | – | – |
| stadt | 4+4 | Zählung | geht VRAM MB | 176.2 | 172.15 | -4.05 | – | – |
| **stadt** | 4+4 | | **Urteil** | | | | | **LANGSAMER** |

Instrument je Boot: 715754fc0 (stadt-A1, stadt-A2, stadt-A3, stadt-A4, stadt-B1, stadt-B2, stadt-B3, stadt-B4)

Roh: `bericht/z78-bisekt/`.
