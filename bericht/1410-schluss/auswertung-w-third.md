## w-third — je Boot (Zeitfolge)

| Boot | Urteil | fps (Regler voll) | Frame p50 ms | Frame p95 ms | CPU-Takt p95 voll ms | CPU-Takt p95 frei ms | gpu-bank ms (Gier 0.00) | Takt MHz (Bank 1) | gpu-bank ms (Gier -0.88) | Band GPU ms je Frame | Befehle (Band) | Dreiecke (Band) | VRAM MB |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| w-third-A1 | ROT | 66.4 | 16.7 | 16.8 | 6.1 | 5.4 | 13.02 | 1739.5 | 12.06 | 17.17 | 72 | 626870 | 119.4 |
| w-third-B1 | ROT | 94.8 | 8.4 | 16.7 | 6.6 | 7.0 | 8.92 | 1714.0 | 9.08 | 11.18 | 85 | 323195 | 96.1 |
| w-third-A2 | ROT | 66.5 | 16.7 | 16.8 | 6.0 | 5.5 | 13.44 | 1720.5 | 11.92 | 13.92 | 72 | 627246 | 119.5 |
| w-third-B2 | ROT | 96.9 | 8.4 | 16.8 | 6.4 | 7.3 | 8.56 | 1670.0 | 9.12 | 10.17 | 85 | 323103 | 95.8 |

## Mittel je Seite (Werte je Boot)

| Größe | A main 9fb869a5 | B integ-probe 51cc19af | Δ B − A | 2σ | Urteil |
|---|---|---|---|---|---|
| fps (Regler voll) | 66.5 (66.4 · 66.5) | 95.8 (94.8 · 96.9) | +29.4 | 2.1 | nicht langsamer |
| Frame p50 ms | 16.7 (16.7 · 16.7) | 8.4 (8.4 · 8.4) | -8.3 | 0.0 | nicht langsamer |
| Frame p95 ms | 16.8 (16.8 · 16.8) | 16.8 (16.7 · 16.8) | -0.1 | 0.1 | nicht langsamer |
| CPU-Takt p95 voll ms | 6.0 (6.1 · 6.0) | 6.5 (6.6 · 6.4) | +0.5 | 0.2 | LANGSAMER |
| CPU-Takt p95 frei ms | 5.5 (5.4 · 5.5) | 7.2 (7.0 · 7.3) | +1.7 | 0.3 | LANGSAMER |
| gpu-bank ms (Gier 0.00) | 13.23 (13.02 · 13.44) | 8.74 (8.92 · 8.56) | -4.49 | 0.55 | nicht langsamer |
| Takt MHz (Bank 1) | 1730.0 (1739.5 · 1720.5) | 1692.0 (1714.0 · 1670.0) | -38.0 | 47.9 | – |
| gpu-bank ms (Gier -0.88) | 11.99 (12.06 · 11.92) | 9.10 (9.08 · 9.12) | -2.89 | 0.15 | nicht langsamer |
| Band GPU ms je Frame | 15.55 (17.17 · 13.92) | 10.68 (11.18 · 10.17) | -4.87 | 3.40 | nicht langsamer |
| Befehle (Band) | 72 (72 · 72) | 85 (85 · 85) | +13 | 0 | – |
| Dreiecke (Band) | 627058 (626870 · 627246) | 323149 (323195 · 323103) | -303909 | 387 | – |
| VRAM MB | 119.5 (119.4 · 119.5) | 95.9 (96.1 · 95.8) | -23.5 | 0.3 | – |
