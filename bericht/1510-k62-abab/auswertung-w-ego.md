## w-ego — je Boot (Zeitfolge)

| Boot | Urteil | fps (Regler voll) | Frame p50 ms | Frame p95 ms | CPU-Takt p95 voll ms | CPU-Takt p95 frei ms | gpu-bank ms (Gier 0.00) | Takt MHz (Bank 1) | gpu-bank ms (Gier -0.88) | Band GPU ms je Frame | Befehle (Band) | Dreiecke (Band) | VRAM MB |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| w-ego-A1 | ROT | 99.7 | 8.4 | 16.7 | 5.3 | 5.8 | 8.23 | 1733.0 | 9.67 | 10.82 | 74 | 279577 | 93.9 |
| w-ego-B1 | GRUEN | 93.7 | 8.4 | 16.7 | 6.2 | 6.4 | 8.28 | 1739.5 | 9.52 | 10.62 | 74 | 279577 | 94.0 |
| w-ego-A2 | ROT | 95.9 | 8.4 | 16.7 | 5.5 | 6.1 | 8.36 | 1720.5 | 9.35 | 10.61 | 73 | 278721 | 94.5 |
| w-ego-B2 | GRUEN | 96.8 | 8.4 | 16.7 | 5.3 | 5.6 | 8.63 | 1733.5 | 9.50 | 10.54 | 74 | 279113 | 93.3 |

## Mittel je Seite (Werte je Boot)

| Größe | A main bd38fb16 | B K62 4e8270bc (render-objekt fedecfaa + main) | Δ B − A | 2σ | Urteil |
|---|---|---|---|---|---|
| fps (Regler voll) | 97.8 (99.7 · 95.9) | 95.3 (93.7 · 96.8) | -2.6 | 4.9 | nicht langsamer |
| Frame p50 ms | 8.4 (8.4 · 8.4) | 8.4 (8.4 · 8.4) | 0.0 | 0.0 | nicht langsamer |
| Frame p95 ms | 16.7 (16.7 · 16.7) | 16.7 (16.7 · 16.7) | 0.0 | 0.0 | nicht langsamer |
| CPU-Takt p95 voll ms | 5.4 (5.3 · 5.5) | 5.8 (6.2 · 5.3) | +0.3 | 0.9 | nicht langsamer |
| CPU-Takt p95 frei ms | 5.9 (5.8 · 6.1) | 6.0 (6.4 · 5.6) | +0.1 | 0.9 | nicht langsamer |
| gpu-bank ms (Gier 0.00) | 8.29 (8.23 · 8.36) | 8.46 (8.28 · 8.63) | +0.16 | 0.37 | nicht langsamer |
| Takt MHz (Bank 1) | 1726.8 (1733.0 · 1720.5) | 1736.5 (1739.5 · 1733.5) | +9.8 | 13.9 | – |
| gpu-bank ms (Gier -0.88) | 9.51 (9.67 · 9.35) | 9.51 (9.52 · 9.50) | 0.00 | 0.32 | nicht langsamer |
| Band GPU ms je Frame | 10.71 (10.82 · 10.61) | 10.58 (10.62 · 10.54) | -0.14 | 0.22 | nicht langsamer |
| Befehle (Band) | 74 (74 · 73) | 74 (74 · 74) | +1 | 1 | – |
| Dreiecke (Band) | 279149 (279577 · 278721) | 279345 (279577 · 279113) | +196 | 974 | – |
| VRAM MB | 94.2 (93.9 · 94.5) | 93.7 (94.0 · 93.3) | -0.5 | 0.9 | – |
