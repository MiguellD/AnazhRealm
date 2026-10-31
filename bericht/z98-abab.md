# z98-abab — ABAB 94c079cb gegen 3ef20f9f: nicht-langsamer

GTX 1060, `--echt` 1920×1080, Regler voll, Messplatz-Dienst (zug/messplatz.md). A = 3ef20f9f880252fbff6ea5263b573d19f5e20b19, B = 94c079cb714239d8f146ac3185295b0b220d8602, Instrument aus B. Je Zelle 2+2, verlängert auf 4+4 nur bei Kern-Anschlag oder einer Größe zwischen 1σ und 2σ. Urteil je Größe Δ ≤ max(2σ gepoolt, Auflösung).

| Zelle | n A+B | Gang | Größe | A | B | Δ B − A | 2σ | Urteil |
|---|---|---|---|---|---|---|---|---|
| stadt | 4+4 | steht | fps | 68.57 | 67.33 | -1.25 | 1.48 | nicht langsamer |
| stadt | 4+4 | steht | Frame p95 ms | 23.45 | 25 | 1.55 | 4.2 | nicht langsamer |
| stadt | 4+4 | steht | CPU-Takt p95 ms | 10.63 | 11.2 | 0.57 | 0.78 | nicht langsamer (1σ–2σ) |
| stadt | 4+4 | steht | Belegung p95 ms | 16.71 | 17.78 | 1.08 | 1.45 | nicht langsamer |
| stadt | 4+4 | geht | fps | 34.2 | 32.67 | -1.53 | 2.01 | nicht langsamer |
| stadt | 4+4 | geht | Frame p95 ms | 52.15 | 60.35 | 8.2 | 8.27 | nicht langsamer (1σ–2σ) |
| stadt | 4+4 | geht | CPU-Takt p95 ms | 48.03 | 50.75 | 2.72 | 5.84 | nicht langsamer |
| stadt | 4+4 | geht | Belegung p95 ms | 54.53 | 58.34 | 3.81 | 6.75 | nicht langsamer |
| stadt | 4+4 | Zählung | steht Befehle | 60.25 | 63 | 2.75 | – | – |
| stadt | 4+4 | Zählung | steht Dreiecke p95 | 1279443 | 1304741 | 25298 | – | – |
| stadt | 4+4 | Zählung | steht VRAM MB | 188.92 | 190.58 | 1.65 | – | – |
| stadt | 4+4 | Zählung | geht Befehle | 91.75 | 96.75 | 5 | – | – |
| stadt | 4+4 | Zählung | geht Dreiecke p95 | 1410617 | 1447479 | 36862 | – | – |
| stadt | 4+4 | Zählung | geht VRAM MB | 185.47 | 219.95 | 34.48 | – | – |
| **stadt** | 4+4 | | **Urteil** | | | | | **nicht-langsamer** |

Instrument je Boot: 3ef20f9f8 (stadt-A1, stadt-A2, stadt-A3, stadt-A4, stadt-B1, stadt-B2, stadt-B3, stadt-B4)

Roh: `bericht/z98-abab/`.
