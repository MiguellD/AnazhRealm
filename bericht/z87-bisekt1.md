# z87-bisekt1 — ABAB 0b8dbcfc gegen 957a615c: LANGSAMER

GTX 1060, `--echt` 1920×1080, Regler voll, Messplatz-Dienst (zug/messplatz.md). A = 957a615c142c2bb6ac9be5e285858dd7206f9aff, B = 0b8dbcfc379c1963e66b224b525ab6b72cdf383d, Instrument aus B. Je Zelle 2+2, verlängert auf 4+4 nur bei Kern-Anschlag oder einer Größe zwischen 1σ und 2σ. Urteil je Größe Δ ≤ max(2σ gepoolt, Auflösung).

| Zelle | n A+B | Gang | Größe | A | B | Δ B − A | 2σ | Urteil |
|---|---|---|---|---|---|---|---|---|
| stadt | 2+2 | steht | fps | 70 | 69 | -1 | 2.04 | nicht langsamer |
| stadt | 2+2 | steht | Frame p95 ms | 21 | 24.95 | 3.95 | 8 | nicht langsamer |
| stadt | 2+2 | steht | CPU-Takt p95 ms | 10.7 | 10.85 | 0.15 | 0.5 | nicht langsamer |
| stadt | 2+2 | steht | Belegung p95 ms | 16.67 | 17.38 | 0.7 | 2.63 | nicht langsamer |
| stadt | 2+2 | geht | fps | 38.15 | 34.25 | -3.9 | 1.3 | LANGSAMER |
| stadt | 2+2 | geht | Frame p95 ms | 49.9 | 58.3 | 8.4 | 0.2 | LANGSAMER |
| stadt | 2+2 | geht | CPU-Takt p95 ms | 43.5 | 49.25 | 5.75 | 3.47 | LANGSAMER |
| stadt | 2+2 | geht | Belegung p95 ms | 48.17 | 54.63 | 6.45 | 3.16 | LANGSAMER |
| stadt | 2+2 | Zählung | steht Befehle | 62 | 61.5 | -0.5 | – | – |
| stadt | 2+2 | Zählung | steht Dreiecke p95 | 1320514 | 1287654 | -32860 | – | – |
| stadt | 2+2 | Zählung | steht VRAM MB | 175.65 | 177.9 | 2.25 | – | – |
| stadt | 2+2 | Zählung | geht Befehle | 78 | 83 | 5 | – | – |
| stadt | 2+2 | Zählung | geht Dreiecke p95 | 1370946 | 1365413 | -5532 | – | – |
| stadt | 2+2 | Zählung | geht VRAM MB | 208.4 | 179.55 | -28.85 | – | – |
| **stadt** | 2+2 | | **Urteil** | | | | | **LANGSAMER** |

Instrument je Boot: 957a615c1 (stadt-A1, stadt-A2, stadt-B1, stadt-B2)

Roh: `bericht/z87-bisekt1/`.
