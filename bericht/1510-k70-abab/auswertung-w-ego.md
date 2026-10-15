## w-ego — je Boot (Zeitfolge)

| Boot | Urteil | fps (Regler voll) | Frame p50 ms | Frame p95 ms | CPU-Takt p95 voll ms | CPU-Takt p95 frei ms | gpu-bank ms (Gier 0.00) | Takt MHz (Bank 1) | gpu-bank ms (Gier -0.88) | Band GPU ms je Frame | Befehle (Band) | Dreiecke (Band) | VRAM MB |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| w-ego-A1 | ROT | 94.6 | 8.4 | 16.7 | 5.3 | 5.4 | 9.01 | 1708.0 | 9.49 | 11.28 | 76 | 279935 | 94.6 |
| w-ego-B1 | ROT | 91.1 | 8.4 | 16.7 | 5.1 | 5.4 | 9.33 | 1708.0 | 9.76 | 11.23 | 76 | 285293 | 93.5 |
| w-ego-A2 | ROT | 92.6 | 8.4 | 16.8 | 5.7 | 6.2 | 8.59 | 1733.5 | 9.75 | 10.85 | 76 | 279935 | 94.5 |
| w-ego-B2 | ROT | 91.0 | 8.4 | 16.7 | 5.1 | 5.6 | 9.40 | 1727.0 | 9.67 | 11.12 | 76 | 285180 | 89.2 |

## Mittel je Seite (Werte je Boot)

| Größe | A main 65854e26 | B integ-probe 2031b3e4 | Δ B − A | 2σ | Urteil |
|---|---|---|---|---|---|
| fps (Regler voll) | 93.6 (94.6 · 92.6) | 91.0 (91.1 · 91.0) | -2.5 | 2.0 | LANGSAMER |
| Frame p50 ms | 8.4 (8.4 · 8.4) | 8.4 (8.4 · 8.4) | 0.0 | 0.0 | nicht langsamer |
| Frame p95 ms | 16.8 (16.7 · 16.8) | 16.7 (16.7 · 16.7) | -0.1 | 0.1 | nicht langsamer |
| CPU-Takt p95 voll ms | 5.5 (5.3 · 5.7) | 5.1 (5.1 · 5.1) | -0.4 | 0.4 | nicht langsamer |
| CPU-Takt p95 frei ms | 5.8 (5.4 · 6.2) | 5.5 (5.4 · 5.6) | -0.3 | 0.8 | nicht langsamer |
| gpu-bank ms (Gier 0.00) | 8.80 (9.01 · 8.59) | 9.37 (9.33 · 9.40) | +0.56 | 0.43 | LANGSAMER |
| Takt MHz (Bank 1) | 1720.8 (1708.0 · 1733.5) | 1717.5 (1708.0 · 1727.0) | -3.3 | 31.8 | – |
| gpu-bank ms (Gier -0.88) | 9.62 (9.49 · 9.75) | 9.71 (9.76 · 9.67) | +0.09 | 0.28 | nicht langsamer |
| Band GPU ms je Frame | 11.06 (11.28 · 10.85) | 11.18 (11.23 · 11.12) | +0.11 | 0.44 | nicht langsamer |
| Befehle (Band) | 76 (76 · 76) | 76 (76 · 76) | 0 | 0 | – |
| Dreiecke (Band) | 279935 (279935 · 279935) | 285237 (285293 · 285180) | +5302 | 113 | – |
| VRAM MB | 94.5 (94.6 · 94.5) | 91.3 (93.5 · 89.2) | -3.2 | 4.3 | – |
