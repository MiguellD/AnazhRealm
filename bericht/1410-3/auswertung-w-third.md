## w-third — je Boot (Zeitfolge)

| Boot | Urteil | fps (Regler voll) | Frame p50 ms | Frame p95 ms | CPU-Takt p95 voll ms | CPU-Takt p95 frei ms | gpu-bank ms (Gier 0.00) | Takt MHz (Bank 1) | gpu-bank ms (Gier -0.88) | Band GPU ms je Frame | Befehle (Band) | Dreiecke (Band) | VRAM MB |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| w-third-A1 | ROT | 95.1 | 8.4 | 16.7 | 6.7 | 7.2 | 8.75 | 1727.0 | 10.01 | 10.53 | 85 | 324047 | 95.7 |
| w-third-B1 | GRUEN | 94.8 | 8.4 | 16.7 | 6.4 | 6.9 | 8.75 | 1714.0 | 9.40 | 10.28 | 85 | 324047 | 95.8 |
| w-third-A2 | ROT | 95.0 | 8.4 | 16.7 | 6.7 | 7.4 | 8.69 | 1702.0 | 9.46 | 11.23 | 85 | 324552 | 96.2 |
| w-third-B2 | GRUEN | 97.9 | 8.4 | 16.7 | 6.4 | 7.0 | 9.03 | 1733.0 | 9.43 | 10.67 | 85 | 324888 | 95.5 |

## Mittel je Seite (Werte je Boot)

| Größe | A main-naechst d47efac7 | B takt-wurzel 872ffeec | Δ B − A | 2σ | Urteil |
|---|---|---|---|---|---|
| fps (Regler voll) | 95.0 (95.1 · 95.0) | 96.3 (94.8 · 97.9) | +1.3 | 3.1 | nicht langsamer |
| Frame p50 ms | 8.4 (8.4 · 8.4) | 8.4 (8.4 · 8.4) | 0.0 | 0.0 | nicht langsamer |
| Frame p95 ms | 16.7 (16.7 · 16.7) | 16.7 (16.7 · 16.7) | 0.0 | 0.0 | nicht langsamer |
| CPU-Takt p95 voll ms | 6.7 (6.7 · 6.7) | 6.4 (6.4 · 6.4) | -0.3 | 0.0 | nicht langsamer |
| CPU-Takt p95 frei ms | 7.3 (7.2 · 7.4) | 7.0 (6.9 · 7.0) | -0.4 | 0.2 | nicht langsamer |
| gpu-bank ms (Gier 0.00) | 8.72 (8.75 · 8.69) | 8.89 (8.75 · 9.03) | +0.17 | 0.29 | nicht langsamer |
| Takt MHz (Bank 1) | 1714.5 (1727.0 · 1702.0) | 1723.5 (1714.0 · 1733.0) | +9.0 | 31.4 | – |
| gpu-bank ms (Gier -0.88) | 9.73 (10.01 · 9.46) | 9.41 (9.40 · 9.43) | -0.32 | 0.55 | nicht langsamer |
| Band GPU ms je Frame | 10.88 (10.53 · 11.23) | 10.47 (10.28 · 10.67) | -0.40 | 0.80 | nicht langsamer |
| Befehle (Band) | 85 (85 · 85) | 85 (85 · 85) | 0 | 0 | – |
| Dreiecke (Band) | 324300 (324047 · 324552) | 324468 (324047 · 324888) | +168 | 981 | – |
| VRAM MB | 96.0 (95.7 · 96.2) | 95.7 (95.8 · 95.5) | -0.3 | 0.6 | – |
