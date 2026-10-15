## w-ego — je Boot (Zeitfolge)

| Boot | Urteil | fps (Regler voll) | Frame p50 ms | Frame p95 ms | CPU-Takt p95 voll ms | CPU-Takt p95 frei ms | gpu-bank ms (Gier 0.00) | Takt MHz (Bank 1) | gpu-bank ms (Gier -0.88) | Band GPU ms je Frame | Befehle (Band) | Dreiecke (Band) | VRAM MB |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| w-ego-A1 | ROT | 98.9 | 8.4 | 16.7 | 5.2 | 5.8 | 8.58 | 1740.0 | 9.40 | 10.30 | 74 | 279577 | 94.6 |
| w-ego-B1 | GRUEN | 98.6 | 8.4 | 16.7 | 5.3 | 5.6 | 8.49 | 1727.0 | 9.63 | 10.59 | 74 | 279577 | 93.9 |
| w-ego-A2 | ROT | 96.5 | 8.4 | 16.7 | 5.3 | 5.7 | 8.61 | 1740.0 | 9.25 | 10.94 | 74 | 279257 | 93.9 |
| w-ego-B2 | GRUEN | 92.9 | 8.4 | 16.7 | 6.1 | 6.0 | 9.01 | 1746.0 | 9.46 | 10.43 | 74 | 279257 | 93.7 |

## Mittel je Seite (Werte je Boot)

| Größe | A main 3406f8bd | B integ-probe bd38fb16 | Δ B − A | 2σ | Urteil |
|---|---|---|---|---|---|
| fps (Regler voll) | 97.7 (98.9 · 96.5) | 95.8 (98.6 · 92.9) | -2.0 | 6.2 | nicht langsamer |
| Frame p50 ms | 8.4 (8.4 · 8.4) | 8.4 (8.4 · 8.4) | 0.0 | 0.0 | nicht langsamer |
| Frame p95 ms | 16.7 (16.7 · 16.7) | 16.7 (16.7 · 16.7) | 0.0 | 0.0 | nicht langsamer |
| CPU-Takt p95 voll ms | 5.3 (5.2 · 5.3) | 5.7 (5.3 · 6.1) | +0.4 | 0.8 | nicht langsamer |
| CPU-Takt p95 frei ms | 5.8 (5.8 · 5.7) | 5.8 (5.6 · 6.0) | +0.0 | 0.4 | nicht langsamer |
| gpu-bank ms (Gier 0.00) | 8.59 (8.58 · 8.61) | 8.75 (8.49 · 9.01) | +0.16 | 0.52 | nicht langsamer |
| Takt MHz (Bank 1) | 1740.0 (1740.0 · 1740.0) | 1736.5 (1727.0 · 1746.0) | -3.5 | 19.0 | – |
| gpu-bank ms (Gier -0.88) | 9.32 (9.40 · 9.25) | 9.55 (9.63 · 9.46) | +0.22 | 0.23 | nicht langsamer |
| Band GPU ms je Frame | 10.62 (10.30 · 10.94) | 10.51 (10.59 · 10.43) | -0.11 | 0.66 | nicht langsamer |
| Befehle (Band) | 74 (74 · 74) | 74 (74 · 74) | 0 | 0 | – |
| Dreiecke (Band) | 279417 (279577 · 279257) | 279417 (279577 · 279257) | 0 | 453 | – |
| VRAM MB | 94.3 (94.6 · 93.9) | 93.8 (93.9 · 93.7) | -0.4 | 0.7 | – |
