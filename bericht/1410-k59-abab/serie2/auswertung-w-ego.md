## w-ego — je Boot (Zeitfolge)

| Boot | Urteil | fps (Regler voll) | Frame p50 ms | Frame p95 ms | CPU-Takt p95 voll ms | CPU-Takt p95 frei ms | gpu-bank ms (Gier 0.00) | Takt MHz (Bank 1) | gpu-bank ms (Gier -0.88) | Band GPU ms je Frame | Befehle (Band) | Dreiecke (Band) | VRAM MB |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| w-ego-A1 | ROT | 92.5 | 8.4 | 16.7 | 6.5 | 6.8 | 8.30 | 1727.0 | 9.52 | 10.57 | 74 | 279577 | 93.9 |
| w-ego-B1 | GRUEN | 93.7 | 8.4 | 16.7 | 6.2 | 7.2 | 8.34 | 1746.0 | 9.33 | 10.61 | 74 | 281655 | 94.8 |
| w-ego-A2 | ROT | 92.4 | 8.4 | 16.8 | 6.5 | 7.1 | 8.72 | 1752.0 | 9.74 | 10.55 | 74 | 279577 | 93.7 |
| w-ego-B2 | ROT | 92.9 | 8.4 | 16.7 | 6.2 | 6.5 | 8.28 | 1752.5 | 9.44 | 10.62 | 74 | 279897 | 94.9 |

## Mittel je Seite (Werte je Boot)

| Größe | A main d2e06032 | B takt-kreatur c6558274 | Δ B − A | 2σ | Urteil |
|---|---|---|---|---|---|
| fps (Regler voll) | 92.5 (92.5 · 92.4) | 93.3 (93.7 · 92.9) | +0.9 | 0.8 | nicht langsamer |
| Frame p50 ms | 8.4 (8.4 · 8.4) | 8.4 (8.4 · 8.4) | 0.0 | 0.0 | nicht langsamer |
| Frame p95 ms | 16.8 (16.7 · 16.8) | 16.7 (16.7 · 16.7) | -0.1 | 0.1 | nicht langsamer |
| CPU-Takt p95 voll ms | 6.5 (6.5 · 6.5) | 6.2 (6.2 · 6.2) | -0.3 | 0.0 | nicht langsamer |
| CPU-Takt p95 frei ms | 6.9 (6.8 · 7.1) | 6.8 (7.2 · 6.5) | -0.1 | 0.8 | nicht langsamer |
| gpu-bank ms (Gier 0.00) | 8.51 (8.30 · 8.72) | 8.31 (8.34 · 8.28) | -0.20 | 0.42 | nicht langsamer |
| Takt MHz (Bank 1) | 1739.5 (1727.0 · 1752.0) | 1749.3 (1746.0 · 1752.5) | +9.8 | 25.8 | – |
| gpu-bank ms (Gier -0.88) | 9.63 (9.52 · 9.74) | 9.38 (9.33 · 9.44) | -0.24 | 0.25 | nicht langsamer |
| Band GPU ms je Frame | 10.56 (10.57 · 10.55) | 10.61 (10.61 · 10.62) | +0.05 | 0.02 | LANGSAMER |
| Befehle (Band) | 74 (74 · 74) | 74 (74 · 74) | 0 | 0 | – |
| Dreiecke (Band) | 279577 (279577 · 279577) | 280776 (281655 · 279897) | +1199 | 1758 | – |
| VRAM MB | 93.8 (93.9 · 93.7) | 94.8 (94.8 · 94.9) | +1.0 | 0.2 | – |
