## w-ego — je Boot (Zeitfolge)

| Boot | Urteil | fps (Regler voll) | Frame p50 ms | Frame p95 ms | CPU-Takt p95 voll ms | CPU-Takt p95 frei ms | gpu-bank ms (Gier 0.00) | Takt MHz (Bank 1) | gpu-bank ms (Gier -0.88) | Band GPU ms je Frame | Befehle (Band) | Dreiecke (Band) | VRAM MB |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| w-ego-A1 | ROT | 102.3 | 8.4 | 16.7 | 4.9 | 5.0 | 8.50 | 1759.0 | 9.74 | 10.21 | 75 | 279969 | 93.9 |
| w-ego-B1 | GRUEN | 98.6 | 8.4 | 16.7 | 5.2 | 5.4 | 8.48 | 1733.5 | 9.21 | 10.59 | 75 | 279969 | 93.9 |
| w-ego-A2 | ROT | 96.7 | 8.4 | 16.7 | 5.3 | 5.9 | 8.33 | 1727.0 | 9.19 | 10.63 | 74 | 279577 | 94.1 |
| w-ego-B2 | GRUEN | 95.1 | 8.4 | 16.7 | 5.6 | 6.0 | 8.39 | 1714.0 | 9.31 | 10.67 | 73 | 278721 | 94.4 |

## Mittel je Seite (Werte je Boot)

| Größe | A main bd38fb16 | B integ-probe 0bbee8fc | Δ B − A | 2σ | Urteil |
|---|---|---|---|---|---|
| fps (Regler voll) | 99.5 (102.3 · 96.7) | 96.8 (98.6 · 95.1) | -2.7 | 6.6 | nicht langsamer |
| Frame p50 ms | 8.4 (8.4 · 8.4) | 8.4 (8.4 · 8.4) | 0.0 | 0.0 | nicht langsamer |
| Frame p95 ms | 16.7 (16.7 · 16.7) | 16.7 (16.7 · 16.7) | 0.0 | 0.0 | nicht langsamer |
| CPU-Takt p95 voll ms | 5.1 (4.9 · 5.3) | 5.4 (5.2 · 5.6) | +0.3 | 0.6 | nicht langsamer |
| CPU-Takt p95 frei ms | 5.5 (5.0 · 5.9) | 5.7 (5.4 · 6.0) | +0.3 | 1.1 | nicht langsamer |
| gpu-bank ms (Gier 0.00) | 8.41 (8.50 · 8.33) | 8.44 (8.48 · 8.39) | +0.02 | 0.19 | nicht langsamer |
| Takt MHz (Bank 1) | 1743.0 (1759.0 · 1727.0) | 1723.8 (1733.5 · 1714.0) | -19.3 | 37.5 | – |
| gpu-bank ms (Gier -0.88) | 9.46 (9.74 · 9.19) | 9.26 (9.21 · 9.31) | -0.20 | 0.56 | nicht langsamer |
| Band GPU ms je Frame | 10.42 (10.21 · 10.63) | 10.63 (10.59 · 10.67) | +0.21 | 0.43 | nicht langsamer |
| Befehle (Band) | 75 (75 · 74) | 74 (75 · 73) | 0 | 2 | – |
| Dreiecke (Band) | 279773 (279969 · 279577) | 279345 (279969 · 278721) | -428 | 1308 | – |
| VRAM MB | 94.0 (93.9 · 94.1) | 94.2 (93.9 · 94.4) | +0.2 | 0.5 | – |
