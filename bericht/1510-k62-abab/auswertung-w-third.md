## w-third — je Boot (Zeitfolge)

| Boot | Urteil | fps (Regler voll) | Frame p50 ms | Frame p95 ms | CPU-Takt p95 voll ms | CPU-Takt p95 frei ms | gpu-bank ms (Gier 0.00) | Takt MHz (Bank 1) | gpu-bank ms (Gier -0.88) | Band GPU ms je Frame | Befehle (Band) | Dreiecke (Band) | VRAM MB |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| w-third-A1 | ROT | 90.4 | 8.4 | 16.7 | 6.1 | 6.1 | 9.40 | 1720.5 | 9.79 | 10.38 | 85 | 316089 | 95.3 |
| w-third-B1 | GRUEN | 93.0 | 8.4 | 16.7 | 5.9 | 6.4 | 9.36 | 1746.0 | 9.48 | 10.67 | 85 | 316089 | 94.9 |
| w-third-A2 | ROT | 91.5 | 8.4 | 16.7 | 6.3 | 6.5 | 9.38 | 1758.5 | 9.71 | 10.71 | 85 | 316089 | 95.1 |
| w-third-B2 | GRUEN | 90.5 | 8.4 | 16.8 | 6.1 | 6.7 | 9.42 | 1733.5 | 9.17 | 10.77 | 85 | 316089 | 95.4 |

## Mittel je Seite (Werte je Boot)

| Größe | A main bd38fb16 | B K62 4e8270bc (render-objekt fedecfaa + main) | Δ B − A | 2σ | Urteil |
|---|---|---|---|---|---|
| fps (Regler voll) | 91.0 (90.4 · 91.5) | 91.8 (93.0 · 90.5) | +0.8 | 2.7 | nicht langsamer |
| Frame p50 ms | 8.4 (8.4 · 8.4) | 8.4 (8.4 · 8.4) | 0.0 | 0.0 | nicht langsamer |
| Frame p95 ms | 16.7 (16.7 · 16.7) | 16.8 (16.7 · 16.8) | +0.1 | 0.1 | nicht langsamer |
| CPU-Takt p95 voll ms | 6.2 (6.1 · 6.3) | 6.0 (5.9 · 6.1) | -0.2 | 0.3 | nicht langsamer |
| CPU-Takt p95 frei ms | 6.3 (6.1 · 6.5) | 6.6 (6.4 · 6.7) | +0.3 | 0.5 | nicht langsamer |
| gpu-bank ms (Gier 0.00) | 9.39 (9.40 · 9.38) | 9.39 (9.36 · 9.42) | 0.00 | 0.06 | nicht langsamer |
| Takt MHz (Bank 1) | 1739.5 (1720.5 · 1758.5) | 1739.8 (1746.0 · 1733.5) | +0.3 | 40.0 | – |
| gpu-bank ms (Gier -0.88) | 9.75 (9.79 · 9.71) | 9.32 (9.48 · 9.17) | -0.43 | 0.32 | nicht langsamer |
| Band GPU ms je Frame | 10.55 (10.38 · 10.71) | 10.72 (10.67 · 10.77) | +0.17 | 0.34 | nicht langsamer |
| Befehle (Band) | 85 (85 · 85) | 85 (85 · 85) | 0 | 0 | – |
| Dreiecke (Band) | 316089 (316089 · 316089) | 316089 (316089 · 316089) | 0 | 0 | – |
| VRAM MB | 95.2 (95.3 · 95.1) | 95.2 (94.9 · 95.4) | -0.0 | 0.5 | – |
