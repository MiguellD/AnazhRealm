## w-ego — je Boot (Zeitfolge)

| Boot | Urteil | fps (Regler voll) | Frame p50 ms | Frame p95 ms | CPU-Takt p95 voll ms | CPU-Takt p95 frei ms | gpu-bank ms (Gier 0.00) | Takt MHz (Bank 1) | gpu-bank ms (Gier -0.88) | Band GPU ms je Frame | Befehle (Band) | Dreiecke (Band) | VRAM MB |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| w-ego-A1 | ROT | 79.9 | 13.7 | 16.8 | 5.0 | 4.9 | 10.49 | 1739.5 | 10.31 | 14.53 | 61 | 388359 | 112.6 |
| w-ego-B1 | ROT | 99.4 | 8.4 | 16.7 | 6.0 | 6.3 | 8.15 | 1727.0 | 9.28 | 9.95 | 74 | 285454 | 94.6 |
| w-ego-A2 | ROT | 78.7 | 16.5 | 16.8 | 5.8 | 6.4 | 10.50 | 1714.5 | 10.43 | 14.52 | 61 | 388344 | 113.2 |
| w-ego-B2 | ROT | 97.9 | 8.4 | 16.7 | 6.1 | 6.4 | 7.93 | 1733.0 | 9.07 | 10.34 | 75 | 286226 | 94.8 |

## Mittel je Seite (Werte je Boot)

| Größe | A main 9fb869a5 | B integ-probe 51cc19af | Δ B − A | 2σ | Urteil |
|---|---|---|---|---|---|
| fps (Regler voll) | 79.3 (79.9 · 78.7) | 98.7 (99.4 · 97.9) | +19.3 | 1.9 | nicht langsamer |
| Frame p50 ms | 15.1 (13.7 · 16.5) | 8.4 (8.4 · 8.4) | -6.7 | 2.8 | nicht langsamer |
| Frame p95 ms | 16.8 (16.8 · 16.8) | 16.7 (16.7 · 16.7) | -0.1 | 0.0 | nicht langsamer |
| CPU-Takt p95 voll ms | 5.4 (5.0 · 5.8) | 6.0 (6.0 · 6.1) | +0.6 | 0.8 | nicht langsamer |
| CPU-Takt p95 frei ms | 5.7 (4.9 · 6.4) | 6.3 (6.3 · 6.4) | +0.7 | 1.5 | nicht langsamer |
| gpu-bank ms (Gier 0.00) | 10.50 (10.49 · 10.50) | 8.04 (8.15 · 7.93) | -2.46 | 0.22 | nicht langsamer |
| Takt MHz (Bank 1) | 1727.0 (1739.5 · 1714.5) | 1730.0 (1727.0 · 1733.0) | +3.0 | 25.7 | – |
| gpu-bank ms (Gier -0.88) | 10.37 (10.31 · 10.43) | 9.18 (9.28 · 9.07) | -1.20 | 0.24 | nicht langsamer |
| Band GPU ms je Frame | 14.52 (14.53 · 14.52) | 10.14 (9.95 · 10.34) | -4.38 | 0.39 | nicht langsamer |
| Befehle (Band) | 61 (61 · 61) | 75 (74 · 75) | +14 | 1 | – |
| Dreiecke (Band) | 388352 (388359 · 388344) | 285840 (285454 · 286226) | -102511 | 772 | – |
| VRAM MB | 112.9 (112.6 · 113.2) | 94.7 (94.6 · 94.8) | -18.2 | 0.6 | – |
