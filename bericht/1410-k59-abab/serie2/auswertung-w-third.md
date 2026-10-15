## w-third — je Boot (Zeitfolge)

| Boot | Urteil | fps (Regler voll) | Frame p50 ms | Frame p95 ms | CPU-Takt p95 voll ms | CPU-Takt p95 frei ms | gpu-bank ms (Gier 0.00) | Takt MHz (Bank 1) | gpu-bank ms (Gier -0.88) | Band GPU ms je Frame | Befehle (Band) | Dreiecke (Band) | VRAM MB |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| w-third-A1 | ROT | 89.5 | 8.4 | 16.7 | 7.6 | 8.6 | 9.20 | 1733.5 | 9.72 | 10.75 | 85 | 316089 | 95.1 |
| w-third-B1 | GRUEN | 91.1 | 8.4 | 16.8 | 6.2 | 6.2 | 9.25 | 1752.5 | 9.89 | 10.75 | 85 | 316089 | 95.1 |
| w-third-A2 | ROT | 89.8 | 8.4 | 16.8 | 6.7 | 6.8 | 9.13 | 1714.0 | 9.55 | 10.43 | 85 | 316089 | 95.1 |
| w-third-B2 | GRUEN | 92.4 | 8.4 | 16.7 | 6.4 | 6.4 | 9.38 | 1714.0 | 9.81 | 11.35 | 85 | 316089 | 94.9 |

## Mittel je Seite (Werte je Boot)

| Größe | A main d2e06032 | B takt-kreatur c6558274 | Δ B − A | 2σ | Urteil |
|---|---|---|---|---|---|
| fps (Regler voll) | 89.7 (89.5 · 89.8) | 91.8 (91.1 · 92.4) | +2.1 | 1.3 | nicht langsamer |
| Frame p50 ms | 8.4 (8.4 · 8.4) | 8.4 (8.4 · 8.4) | 0.0 | 0.0 | nicht langsamer |
| Frame p95 ms | 16.8 (16.7 · 16.8) | 16.8 (16.8 · 16.7) | 0.0 | 0.1 | nicht langsamer |
| CPU-Takt p95 voll ms | 7.2 (7.6 · 6.7) | 6.3 (6.2 · 6.4) | -0.8 | 0.9 | nicht langsamer |
| CPU-Takt p95 frei ms | 7.7 (8.6 · 6.8) | 6.3 (6.2 · 6.4) | -1.4 | 1.8 | nicht langsamer |
| gpu-bank ms (Gier 0.00) | 9.16 (9.20 · 9.13) | 9.32 (9.25 · 9.38) | +0.15 | 0.15 | LANGSAMER |
| Takt MHz (Bank 1) | 1723.8 (1733.5 · 1714.0) | 1733.3 (1752.5 · 1714.0) | +9.5 | 43.2 | – |
| gpu-bank ms (Gier -0.88) | 9.64 (9.72 · 9.55) | 9.85 (9.89 · 9.81) | +0.21 | 0.19 | LANGSAMER |
| Band GPU ms je Frame | 10.59 (10.75 · 10.43) | 11.05 (10.75 · 11.35) | +0.46 | 0.68 | nicht langsamer |
| Befehle (Band) | 85 (85 · 85) | 85 (85 · 85) | 0 | 0 | – |
| Dreiecke (Band) | 316089 (316089 · 316089) | 316089 (316089 · 316089) | 0 | 0 | – |
| VRAM MB | 95.1 (95.1 · 95.1) | 95.0 (95.1 · 94.9) | -0.1 | 0.2 | – |
