## w-ego — je Boot (Zeitfolge)

| Boot | Urteil | fps (Regler voll) | Frame p50 ms | Frame p95 ms | CPU-Takt p95 voll ms | CPU-Takt p95 frei ms | gpu-bank ms (Gier 0.00) | Takt MHz (Bank 1) | gpu-bank ms (Gier -0.88) | Band GPU ms je Frame | Befehle (Band) | Dreiecke (Band) | VRAM MB |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| w-ego-A1 | ROT | 91.3 | 8.4 | 16.8 | 6.6 | 6.8 | 8.29 | 1733.5 | 9.58 | 10.80 | 74 | 279577 | 93.6 |
| w-ego-B1 | GRUEN | 94.9 | 8.4 | 16.7 | 5.6 | 5.7 | 8.52 | 1733.5 | 9.23 | 10.39 | 73 | 278721 | 94.6 |
| w-ego-A2 | ROT | 93.4 | 8.4 | 16.7 | 5.9 | 6.3 | 8.22 | 1733.0 | 9.42 | 10.58 | 74 | 279577 | 94.3 |
| w-ego-B2 | GRUEN | 96.9 | 8.4 | 16.7 | 5.3 | 5.6 | 8.70 | 1720.5 | 9.69 | 10.66 | 74 | 279257 | 93.9 |

## Mittel je Seite (Werte je Boot)

| Größe | A main d2e06032 | B takt-kreatur 17e3327b | Δ B − A | 2σ | Urteil |
|---|---|---|---|---|---|
| fps (Regler voll) | 92.3 (91.3 · 93.4) | 95.9 (94.9 · 96.9) | +3.6 | 2.9 | nicht langsamer |
| Frame p50 ms | 8.4 (8.4 · 8.4) | 8.4 (8.4 · 8.4) | 0.0 | 0.0 | nicht langsamer |
| Frame p95 ms | 16.8 (16.8 · 16.7) | 16.7 (16.7 · 16.7) | -0.1 | 0.1 | nicht langsamer |
| CPU-Takt p95 voll ms | 6.3 (6.6 · 5.9) | 5.4 (5.6 · 5.3) | -0.8 | 0.8 | nicht langsamer |
| CPU-Takt p95 frei ms | 6.5 (6.8 · 6.3) | 5.7 (5.7 · 5.6) | -0.9 | 0.5 | nicht langsamer |
| gpu-bank ms (Gier 0.00) | 8.25 (8.29 · 8.22) | 8.61 (8.52 · 8.70) | +0.36 | 0.19 | LANGSAMER |
| Takt MHz (Bank 1) | 1733.3 (1733.5 · 1733.0) | 1727.0 (1733.5 · 1720.5) | -6.3 | 13.0 | – |
| gpu-bank ms (Gier -0.88) | 9.50 (9.58 · 9.42) | 9.46 (9.23 · 9.69) | -0.04 | 0.49 | nicht langsamer |
| Band GPU ms je Frame | 10.69 (10.80 · 10.58) | 10.53 (10.39 · 10.66) | -0.17 | 0.35 | nicht langsamer |
| Befehle (Band) | 74 (74 · 74) | 74 (73 · 74) | 0 | 1 | – |
| Dreiecke (Band) | 279577 (279577 · 279577) | 278989 (278721 · 279257) | -588 | 536 | – |
| VRAM MB | 93.9 (93.6 · 94.3) | 94.3 (94.6 · 93.9) | +0.3 | 1.0 | – |
