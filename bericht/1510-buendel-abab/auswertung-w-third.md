## w-third — je Boot (Zeitfolge)

| Boot | Urteil | fps (Regler voll) | Frame p50 ms | Frame p95 ms | CPU-Takt p95 voll ms | CPU-Takt p95 frei ms | gpu-bank ms (Gier 0.00) | Takt MHz (Bank 1) | gpu-bank ms (Gier -0.88) | Band GPU ms je Frame | Befehle (Band) | Dreiecke (Band) | VRAM MB |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| w-third-A1 | ROT | 91.5 | 8.4 | 16.8 | 6.2 | 6.6 | 9.33 | 1784.0 | 9.51 | 10.87 | 85 | 316089 | 95.2 |
| w-third-B1 | GRUEN | 90.6 | 8.4 | 16.8 | 6.1 | 6.2 | 9.37 | 1739.5 | 9.59 | 10.93 | 85 | 316089 | 95.9 |
| w-third-A2 | ROT | 90.2 | 8.4 | 16.7 | 7.1 | 6.5 | 9.07 | 1695.0 | 9.49 | 10.63 | 85 | 316089 | 95.8 |
| w-third-B2 | GRUEN | 89.8 | 8.4 | 16.7 | 7.2 | 7.2 | 9.46 | 1739.5 | 9.37 | 10.55 | 87 | 316447 | 96.0 |

## Mittel je Seite (Werte je Boot)

| Größe | A main 0bbee8fc | B integ-probe e8a370ad | Δ B − A | 2σ | Urteil |
|---|---|---|---|---|---|
| fps (Regler voll) | 90.8 (91.5 · 90.2) | 90.2 (90.6 · 89.8) | -0.7 | 1.5 | nicht langsamer |
| Frame p50 ms | 8.4 (8.4 · 8.4) | 8.4 (8.4 · 8.4) | 0.0 | 0.0 | nicht langsamer |
| Frame p95 ms | 16.8 (16.8 · 16.7) | 16.8 (16.8 · 16.7) | 0.0 | 0.1 | nicht langsamer |
| CPU-Takt p95 voll ms | 6.7 (6.2 · 7.1) | 6.7 (6.1 · 7.2) | 0.0 | 1.4 | nicht langsamer |
| CPU-Takt p95 frei ms | 6.5 (6.6 · 6.5) | 6.7 (6.2 · 7.2) | +0.2 | 1.0 | nicht langsamer |
| gpu-bank ms (Gier 0.00) | 9.20 (9.33 · 9.07) | 9.41 (9.37 · 9.46) | +0.21 | 0.28 | nicht langsamer |
| Takt MHz (Bank 1) | 1739.5 (1784.0 · 1695.0) | 1739.5 (1739.5 · 1739.5) | 0.0 | 89.0 | – |
| gpu-bank ms (Gier -0.88) | 9.50 (9.51 · 9.49) | 9.48 (9.59 · 9.37) | -0.02 | 0.22 | nicht langsamer |
| Band GPU ms je Frame | 10.75 (10.87 · 10.63) | 10.74 (10.93 · 10.55) | -0.01 | 0.45 | nicht langsamer |
| Befehle (Band) | 85 (85 · 85) | 86 (85 · 87) | +1 | 2 | – |
| Dreiecke (Band) | 316089 (316089 · 316089) | 316268 (316089 · 316447) | +179 | 358 | – |
| VRAM MB | 95.5 (95.2 · 95.8) | 96.0 (95.9 · 96.0) | +0.5 | 0.6 | – |
