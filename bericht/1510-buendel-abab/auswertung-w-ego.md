## w-ego — je Boot (Zeitfolge)

| Boot | Urteil | fps (Regler voll) | Frame p50 ms | Frame p95 ms | CPU-Takt p95 voll ms | CPU-Takt p95 frei ms | gpu-bank ms (Gier 0.00) | Takt MHz (Bank 1) | gpu-bank ms (Gier -0.88) | Band GPU ms je Frame | Befehle (Band) | Dreiecke (Band) | VRAM MB |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| w-ego-A1 | ROT | 96.3 | 8.4 | 16.7 | 5.4 | 6.9 | 8.56 | 1670.0 | 9.32 | 11.10 | 74 | 280713 | 93.8 |
| w-ego-B1 | GRUEN | 101.5 | 8.4 | 16.7 | 5.1 | 5.4 | 8.28 | 1720.5 | 9.80 | 10.18 | 74 | 279577 | 94.6 |
| w-ego-A2 | ROT | 96.6 | 8.4 | 16.7 | 5.3 | 5.6 | 8.28 | 1733.5 | 9.30 | 10.67 | 75 | 279969 | 93.9 |
| w-ego-B2 | GRUEN | 96.6 | 8.4 | 16.7 | 5.6 | 5.8 | 8.44 | 1740.0 | 9.32 | 10.27 | 74 | 279577 | 94.6 |

## Mittel je Seite (Werte je Boot)

| Größe | A main 0bbee8fc | B integ-probe e8a370ad | Δ B − A | 2σ | Urteil |
|---|---|---|---|---|---|
| fps (Regler voll) | 96.4 (96.3 · 96.6) | 99.0 (101.5 · 96.6) | +2.6 | 4.9 | nicht langsamer |
| Frame p50 ms | 8.4 (8.4 · 8.4) | 8.4 (8.4 · 8.4) | 0.0 | 0.0 | nicht langsamer |
| Frame p95 ms | 16.7 (16.7 · 16.7) | 16.7 (16.7 · 16.7) | 0.0 | 0.0 | nicht langsamer |
| CPU-Takt p95 voll ms | 5.3 (5.4 · 5.3) | 5.3 (5.1 · 5.6) | 0.0 | 0.5 | nicht langsamer |
| CPU-Takt p95 frei ms | 6.3 (6.9 · 5.6) | 5.6 (5.4 · 5.8) | -0.7 | 1.4 | nicht langsamer |
| gpu-bank ms (Gier 0.00) | 8.42 (8.56 · 8.28) | 8.36 (8.28 · 8.44) | -0.06 | 0.32 | nicht langsamer |
| Takt MHz (Bank 1) | 1701.8 (1670.0 · 1733.5) | 1730.3 (1720.5 · 1740.0) | +28.5 | 66.4 | – |
| gpu-bank ms (Gier -0.88) | 9.31 (9.32 · 9.30) | 9.56 (9.80 · 9.32) | +0.25 | 0.48 | nicht langsamer |
| Band GPU ms je Frame | 10.88 (11.10 · 10.67) | 10.22 (10.18 · 10.27) | -0.66 | 0.44 | nicht langsamer |
| Befehle (Band) | 75 (74 · 75) | 74 (74 · 74) | 0 | 1 | – |
| Dreiecke (Band) | 280341 (280713 · 279969) | 279577 (279577 · 279577) | -764 | 744 | – |
| VRAM MB | 93.8 (93.8 · 93.9) | 94.6 (94.6 · 94.6) | +0.8 | 0.1 | – |
