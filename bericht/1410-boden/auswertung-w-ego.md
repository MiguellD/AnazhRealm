## w-ego — je Boot (Zeitfolge)

| Boot | Urteil | fps (Regler voll) | Frame p50 ms | Frame p95 ms | CPU-Takt p95 voll ms | CPU-Takt p95 frei ms | gpu-bank ms (Gier 0.00) | Takt MHz (Bank 1) | gpu-bank ms (Gier -0.88) | Band GPU ms je Frame | Befehle (Band) | Dreiecke (Band) | VRAM MB |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| w-ego-A1 | ROT | 97.6 | 8.4 | 16.8 | 6.0 | 6.3 | 8.13 | 1721.0 | 9.41 | 10.52 | 74 | 287443 | 93.9 |
| w-ego-B1 | ROT | 92.4 | 8.4 | 16.8 | 6.4 | 6.3 | 8.35 | 1746.0 | 8.94 | 11.22 | 74 | 279577 | 94.6 |
| w-ego-A2 | ROT | 95.6 | 8.4 | 16.7 | 6.1 | 6.6 | 7.90 | 1759.0 | 9.12 | 10.98 | 74 | 287775 | 94.5 |
| w-ego-B2 | GRUEN | 89.9 | 8.4 | 16.8 | 7.2 | 6.3 | 8.12 | 1733.0 | 9.03 | 10.84 | 74 | 279577 | 94.1 |

## Mittel je Seite (Werte je Boot)

| Größe | A main c5e2fc8f | B integ-probe 9d3292de | Δ B − A | 2σ | Urteil |
|---|---|---|---|---|---|
| fps (Regler voll) | 96.6 (97.6 · 95.6) | 91.2 (92.4 · 89.9) | -5.4 | 3.2 | LANGSAMER |
| Frame p50 ms | 8.4 (8.4 · 8.4) | 8.4 (8.4 · 8.4) | 0.0 | 0.0 | nicht langsamer |
| Frame p95 ms | 16.8 (16.8 · 16.7) | 16.8 (16.8 · 16.8) | +0.1 | 0.1 | nicht langsamer |
| CPU-Takt p95 voll ms | 6.0 (6.0 · 6.1) | 6.8 (6.4 · 7.2) | +0.8 | 0.8 | nicht langsamer |
| CPU-Takt p95 frei ms | 6.4 (6.3 · 6.6) | 6.3 (6.3 · 6.3) | -0.1 | 0.3 | nicht langsamer |
| gpu-bank ms (Gier 0.00) | 8.02 (8.13 · 7.90) | 8.23 (8.35 · 8.12) | +0.22 | 0.33 | nicht langsamer |
| Takt MHz (Bank 1) | 1740.0 (1721.0 · 1759.0) | 1739.5 (1746.0 · 1733.0) | -0.5 | 40.2 | – |
| gpu-bank ms (Gier -0.88) | 9.27 (9.41 · 9.12) | 8.98 (8.94 · 9.03) | -0.28 | 0.30 | nicht langsamer |
| Band GPU ms je Frame | 10.75 (10.52 · 10.98) | 11.03 (11.22 · 10.84) | +0.28 | 0.60 | nicht langsamer |
| Befehle (Band) | 74 (74 · 74) | 74 (74 · 74) | 0 | 0 | – |
| Dreiecke (Band) | 287609 (287443 · 287775) | 279577 (279577 · 279577) | -8032 | 332 | – |
| VRAM MB | 94.2 (93.9 · 94.5) | 94.3 (94.6 · 94.1) | +0.1 | 0.8 | – |
