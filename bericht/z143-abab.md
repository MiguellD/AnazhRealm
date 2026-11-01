# z143-abab — ABAB baf9d828 gegen 1e90e7cd: nicht-langsamer

GTX 1060, `--echt` 1920×1080, Regler voll, Messplatz-Dienst (zug/messplatz.md). A = 1e90e7cd850ad32a8567bad9a5a8b241593a8e93, B = baf9d8280b0aa08441b436e9f93f6e17b221a7cc, Instrument aus B. Je Zelle 2+2, verlängert auf 4+4 nur bei Kern-Anschlag oder einer Größe zwischen 1σ und 2σ. Urteil je Größe Δ ≤ max(2σ gepoolt, Auflösung).

| Zelle | n A+B | Gang | Größe | A | B | Δ B − A | 2σ | Urteil |
|---|---|---|---|---|---|---|---|---|
| w-ego | 4+4 | steht | fps | 57.97 | 57.92 | -0.05 | 1.13 | nicht langsamer |
| w-ego | 4+4 | steht | Frame p95 ms | 24.98 | 23.02 | -1.95 | 5.68 | nicht langsamer |
| w-ego | 4+4 | steht | CPU-Takt p95 ms | 6.88 | 7.2 | 0.32 | 0.72 | nicht langsamer |
| w-ego | 4+4 | steht | GPU je Bild ms (gpu-bank) | 16.16 | 16.16 | -0.01 | 0.49 | nicht langsamer |
| w-ego | 4+4 | steht | Belegung p95 ms | 11.51 | 11.87 | 0.36 | 1.53 | nicht langsamer |
| w-ego | 4+4 | geht | fps | 50.6 | 50.1 | -0.5 | 1.14 | nicht langsamer |
| w-ego | 4+4 | geht | Frame p95 ms | 29.9 | 31.27 | 1.38 | 8.03 | nicht langsamer |
| w-ego | 4+4 | geht | CPU-Takt p95 ms | 21.63 | 21.8 | 0.18 | 1.63 | nicht langsamer |
| w-ego | 4+4 | geht | Belegung p95 ms | 25.91 | 26.11 | 0.19 | 0.94 | nicht langsamer |
| w-ego | 4+4 | Zählung | steht Befehle | 43 | 43 | 0 | – | – |
| w-ego | 4+4 | Zählung | steht Dreiecke p95 | 314452 | 318149 | 3697 | – | – |
| w-ego | 4+4 | Zählung | steht VRAM MB | 121.05 | 121.65 | 0.6 | – | – |
| w-ego | 4+4 | Zählung | geht Befehle | 59 | 59 | 0 | – | – |
| w-ego | 4+4 | Zählung | geht Dreiecke p95 | 416030 | 416961 | 931 | – | – |
| w-ego | 4+4 | Zählung | geht VRAM MB | 126.75 | 127.33 | 0.58 | – | – |
| **w-ego** | 4+4 | | **Urteil** | | | | | **nicht-langsamer** |
| stadt | 4+4 | steht | fps | 67.97 | 68.05 | 0.08 | 1.01 | nicht langsamer |
| stadt | 4+4 | steht | Frame p95 ms | 22.95 | 21.5 | -1.45 | 7.98 | nicht langsamer |
| stadt | 4+4 | steht | CPU-Takt p95 ms | 10.35 | 11 | 0.65 | 1.15 | nicht langsamer (1σ–2σ) |
| stadt | 4+4 | steht | Belegung p95 ms | 16.08 | 16.41 | 0.33 | 1.5 | nicht langsamer |
| stadt | 4+4 | geht | fps | 33.77 | 32.4 | -1.38 | 2.15 | nicht langsamer |
| stadt | 4+4 | geht | Frame p95 ms | 56.27 | 60.42 | 4.15 | 8.23 | nicht langsamer (1σ–2σ) |
| stadt | 4+4 | geht | CPU-Takt p95 ms | 49.15 | 51.67 | 2.52 | 4.58 | nicht langsamer (1σ–2σ) |
| stadt | 4+4 | geht | Belegung p95 ms | 56.88 | 59.93 | 3.05 | 7.43 | nicht langsamer |
| stadt | 4+4 | Zählung | steht Befehle | 63 | 62.25 | -0.75 | – | – |
| stadt | 4+4 | Zählung | steht Dreiecke p95 | 1278186 | 1266278 | -11908 | – | – |
| stadt | 4+4 | Zählung | steht VRAM MB | 192.73 | 191.63 | -1.1 | – | – |
| stadt | 4+4 | Zählung | geht Befehle | 96.25 | 96.75 | 0.5 | – | – |
| stadt | 4+4 | Zählung | geht Dreiecke p95 | 1427745 | 1431545 | 3800 | – | – |
| stadt | 4+4 | Zählung | geht VRAM MB | 194.43 | 213.15 | 18.72 | – | – |
| **stadt** | 4+4 | | **Urteil** | | | | | **nicht-langsamer** |

Instrument je Boot: 1e90e7cd8 (stadt-A1, stadt-A2, stadt-A3, stadt-A4, stadt-B1, stadt-B2, stadt-B3, stadt-B4, w-ego-A1, w-ego-A2, w-ego-A3, w-ego-A4, w-ego-B1, w-ego-B2, w-ego-B3, w-ego-B4)

Roh: `bericht/z143-abab/`.
