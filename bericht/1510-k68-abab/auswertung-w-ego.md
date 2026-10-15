## w-ego — je Boot (Zeitfolge)

| Boot | Urteil | fps (Regler voll) | Frame p50 ms | Frame p95 ms | CPU-Takt p95 voll ms | CPU-Takt p95 frei ms | gpu-bank ms (Gier 0.00) | Takt MHz (Bank 1) | gpu-bank ms (Gier -0.88) | Band GPU ms je Frame | Befehle (Band) | Dreiecke (Band) | VRAM MB |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| w-ego-A1 | ROT | 94.1 | 8.4 | 16.8 | 5.8 | 6.2 | 8.63 | 1720.5 | 9.51 | 10.59 | 76 | 279935 | 94.6 |
| w-ego-B1 | GRUEN | 93.3 | 8.4 | 16.7 | 5.5 | 6.0 | 8.45 | 1714.0 | 9.50 | 10.57 | 76 | 279935 | 94.7 |
| w-ego-A2 | ROT | 92.9 | 8.4 | 16.7 | 6.0 | 7.2 | 8.38 | 1733.0 | 9.69 | 10.31 | 76 | 280255 | 94.7 |
| w-ego-B2 | GRUEN | 91.7 | 8.4 | 16.7 | 5.8 | 6.7 | 8.70 | 1727.0 | 9.65 | 10.43 | 76 | 279935 | 94.7 |

## Mittel je Seite (Werte je Boot)

| Größe | A main a19ca615 | B integ-probe 65854e26 | Δ B − A | 2σ | Urteil |
|---|---|---|---|---|---|
| fps (Regler voll) | 93.5 (94.1 · 92.9) | 92.5 (93.3 · 91.7) | -1.0 | 2.0 | nicht langsamer |
| Frame p50 ms | 8.4 (8.4 · 8.4) | 8.4 (8.4 · 8.4) | 0.0 | 0.0 | nicht langsamer |
| Frame p95 ms | 16.8 (16.8 · 16.7) | 16.7 (16.7 · 16.7) | -0.1 | 0.1 | nicht langsamer |
| CPU-Takt p95 voll ms | 5.9 (5.8 · 6.0) | 5.7 (5.5 · 5.8) | -0.3 | 0.4 | nicht langsamer |
| CPU-Takt p95 frei ms | 6.7 (6.2 · 7.2) | 6.3 (6.0 · 6.7) | -0.4 | 1.2 | nicht langsamer |
| gpu-bank ms (Gier 0.00) | 8.51 (8.63 · 8.38) | 8.57 (8.45 · 8.70) | +0.07 | 0.35 | nicht langsamer |
| Takt MHz (Bank 1) | 1726.8 (1720.5 · 1733.0) | 1720.5 (1714.0 · 1727.0) | -6.3 | 18.0 | – |
| gpu-bank ms (Gier -0.88) | 9.60 (9.51 · 9.69) | 9.57 (9.50 · 9.65) | -0.03 | 0.23 | nicht langsamer |
| Band GPU ms je Frame | 10.45 (10.59 · 10.31) | 10.50 (10.57 · 10.43) | +0.05 | 0.31 | nicht langsamer |
| Befehle (Band) | 76 (76 · 76) | 76 (76 · 76) | 0 | 0 | – |
| Dreiecke (Band) | 280095 (279935 · 280255) | 279935 (279935 · 279935) | -160 | 320 | – |
| VRAM MB | 94.7 (94.6 · 94.7) | 94.7 (94.7 · 94.7) | +0.0 | 0.1 | – |
