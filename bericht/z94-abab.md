# z94-abab — ABAB 8075fc03 gegen ab040980: LANGSAMER

GTX 1060, `--echt` 1920×1080, Regler voll, Messplatz-Dienst (zug/messplatz.md). A = ab0409804200dce203a339fdf3c02a5fb42f1784, B = 8075fc036a9534b7ef772fc42dd4a19502c38aeb, Instrument aus B. Je Zelle 2+2, verlängert auf 4+4 nur bei Kern-Anschlag oder einer Größe zwischen 1σ und 2σ. Urteil je Größe Δ ≤ max(2σ gepoolt, Auflösung).

| Zelle | n A+B | Gang | Größe | A | B | Δ B − A | 2σ | Urteil |
|---|---|---|---|---|---|---|---|---|
| stadt | 4+4 | steht | fps | 69.77 | 68.47 | -1.3 | 1.71 | nicht langsamer |
| stadt | 4+4 | steht | Frame p95 ms | 20.92 | 24.9 | 3.98 | 6.49 | nicht langsamer (1σ–2σ) |
| stadt | 4+4 | steht | CPU-Takt p95 ms | 10.38 | 10.43 | 0.05 | 0.62 | nicht langsamer |
| stadt | 4+4 | steht | Belegung p95 ms | 15.84 | 16.48 | 0.64 | 1.67 | nicht langsamer |
| stadt | 4+4 | geht | fps | 36.4 | 34.7 | -1.7 | 1.57 | LANGSAMER |
| stadt | 4+4 | geht | Frame p95 ms | 50.02 | 52.13 | 2.1 | 5.73 | nicht langsamer |
| stadt | 4+4 | geht | CPU-Takt p95 ms | 46.3 | 46.17 | -0.13 | 1.15 | nicht langsamer |
| stadt | 4+4 | geht | Belegung p95 ms | 51.35 | 53.26 | 1.92 | 2.56 | nicht langsamer |
| stadt | 4+4 | Zählung | steht Befehle | 62.5 | 60.25 | -2.25 | – | – |
| stadt | 4+4 | Zählung | steht Dreiecke p95 | 1296543 | 1279997 | -16546 | – | – |
| stadt | 4+4 | Zählung | steht VRAM MB | 183.9 | 184.52 | 0.63 | – | – |
| stadt | 4+4 | Zählung | geht Befehle | 83.5 | 95.5 | 12 | – | – |
| stadt | 4+4 | Zählung | geht Dreiecke p95 | 1364077 | 1434991 | 70915 | – | – |
| stadt | 4+4 | Zählung | geht VRAM MB | 193.8 | 227.43 | 33.63 | – | – |
| **stadt** | 4+4 | | **Urteil** | | | | | **LANGSAMER** |
| w-ego | 4+4 | steht | fps | 66.6 | 66.65 | 0.05 | 1.53 | nicht langsamer |
| w-ego | 4+4 | steht | Frame p95 ms | 16.8 | 16.8 | 0 | 0 | nicht langsamer |
| w-ego | 4+4 | steht | CPU-Takt p95 ms | 5.67 | 5.63 | -0.05 | 0.5 | nicht langsamer |
| w-ego | 4+4 | steht | GPU je Bild ms (gpu-bank) | 14.39 | 14.44 | 0.05 | 0.52 | nicht langsamer |
| w-ego | 4+4 | steht | Belegung p95 ms | 8.39 | 8.29 | -0.1 | 0.82 | nicht langsamer |
| w-ego | 4+4 | geht | fps | 55.63 | 55.08 | -0.55 | 1.57 | nicht langsamer |
| w-ego | 4+4 | geht | Frame p95 ms | 25.1 | 25.2 | 0.1 | 0.2 | nicht langsamer |
| w-ego | 4+4 | geht | CPU-Takt p95 ms | 18.32 | 18.85 | 0.53 | 1.37 | nicht langsamer |
| w-ego | 4+4 | geht | Belegung p95 ms | 22.81 | 23.22 | 0.42 | 0.9 | nicht langsamer |
| w-ego | 4+4 | Zählung | steht Befehle | 41 | 41 | 0 | – | – |
| w-ego | 4+4 | Zählung | steht Dreiecke p95 | 261316 | 261386 | 70.5 | – | – |
| w-ego | 4+4 | Zählung | steht VRAM MB | 117.63 | 117.7 | 0.07 | – | – |
| w-ego | 4+4 | Zählung | geht Befehle | 58 | 58 | 0 | – | – |
| w-ego | 4+4 | Zählung | geht Dreiecke p95 | 377471 | 381315 | 3845 | – | – |
| w-ego | 4+4 | Zählung | geht VRAM MB | 122.3 | 122.23 | -0.08 | – | – |
| **w-ego** | 4+4 | | **Urteil** | | | | | **nicht-langsamer** |

Instrument je Boot: ab0409804 (stadt-A1, stadt-A2, stadt-A3, stadt-A4, stadt-B1, stadt-B2, stadt-B3, stadt-B4, w-ego-A1, w-ego-A2, w-ego-A3, w-ego-A4, w-ego-B1, w-ego-B2, w-ego-B3, w-ego-B4)

Roh: `bericht/z94-abab/`.
