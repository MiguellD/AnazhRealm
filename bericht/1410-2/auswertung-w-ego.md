## w-ego — je Boot (Zeitfolge)

| Boot | Urteil | fps (Regler voll) | Frame p50 ms | Frame p95 ms | CPU-Takt p95 voll ms | CPU-Takt p95 frei ms | gpu-bank ms (Gier 0.00) | Takt MHz (Bank 1) | gpu-bank ms (Gier -0.88) | Band GPU ms je Frame | Befehle (Band) | Dreiecke (Band) | VRAM MB |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| w-ego-A1 | ROT | 65.6 | 16.7 | 16.8 | 5.7 | 5.3 | 13.22 | 1733.5 | 10.78 | 15.03 | 79 | 428189 | 111.7 |
| w-ego-B1 | ROT | 57.6 | 16.7 | 25.0 | 6.8 | 6.2 | 15.02 | 1703.7 | 13.20 | 17.03 | 88 | 411599 | 110.3 |
| w-ego-A2 | ROT | 66.0 | 16.7 | 16.8 | 5.5 | 4.9 | 12.85 | 1727.0 | 10.23 | 14.75 | 79 | 428543 | 112.0 |
| w-ego-B2 | ROT | 58.1 | 16.7 | 25.0 | 6.4 | 5.9 | 14.71 | 1727.0 | 13.31 | 17.09 | 88 | 411599 | 110.2 |

## Mittel je Seite (Werte je Boot)

| Größe | A main 9fb869a5 | B integ-probe 08b57ed8 | Δ B − A | 2σ | Urteil |
|---|---|---|---|---|---|
| fps (Regler voll) | 65.8 (65.6 · 66.0) | 57.9 (57.6 · 58.1) | -7.9 | 0.6 | LANGSAMER |
| Frame p50 ms | 16.7 (16.7 · 16.7) | 16.7 (16.7 · 16.7) | 0.0 | 0.0 | nicht langsamer |
| Frame p95 ms | 16.8 (16.8 · 16.8) | 25.0 (25.0 · 25.0) | +8.2 | 0.0 | LANGSAMER |
| CPU-Takt p95 voll ms | 5.6 (5.7 · 5.5) | 6.6 (6.8 · 6.4) | +1.0 | 0.4 | LANGSAMER |
| CPU-Takt p95 frei ms | 5.1 (5.3 · 4.9) | 6.1 (6.2 · 5.9) | +1.0 | 0.5 | LANGSAMER |
| gpu-bank ms (Gier 0.00) | 13.04 (13.22 · 12.85) | 14.87 (15.02 · 14.71) | +1.83 | 0.48 | LANGSAMER |
| Takt MHz (Bank 1) | 1730.3 (1733.5 · 1727.0) | 1715.3 (1703.7 · 1727.0) | -14.9 | 24.2 | – |
| gpu-bank ms (Gier -0.88) | 10.50 (10.78 · 10.23) | 13.25 (13.20 · 13.31) | +2.75 | 0.56 | LANGSAMER |
| Band GPU ms je Frame | 14.89 (15.03 · 14.75) | 17.06 (17.03 · 17.09) | +2.17 | 0.29 | LANGSAMER |
| Befehle (Band) | 79 (79 · 79) | 88 (88 · 88) | +9 | 0 | – |
| Dreiecke (Band) | 428366 (428189 · 428543) | 411599 (411599 · 411599) | -16767 | 354 | – |
| VRAM MB | 111.8 (111.7 · 112.0) | 110.3 (110.3 · 110.2) | -1.6 | 0.3 | – |
