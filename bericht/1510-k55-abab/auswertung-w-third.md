## w-third — je Boot (Zeitfolge)

| Boot | Urteil | fps (Regler voll) | Frame p50 ms | Frame p95 ms | CPU-Takt p95 voll ms | CPU-Takt p95 frei ms | gpu-bank ms (Gier 0.00) | Takt MHz (Bank 1) | gpu-bank ms (Gier -0.88) | Band GPU ms je Frame | Befehle (Band) | Dreiecke (Band) | VRAM MB |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| w-third-A1 | ROT | 91.9 | 8.4 | 16.7 | 6.0 | 6.4 | 8.97 | 1714.0 | 9.40 | 10.97 | 85 | 316089 | 95.1 |
| w-third-B1 | GRUEN | 93.5 | 8.4 | 16.7 | 5.8 | 6.4 | 9.08 | 1746.0 | 9.57 | 10.68 | 85 | 316089 | 95.3 |
| w-third-A2 | ROT | 90.2 | 8.4 | 16.8 | 6.1 | 6.5 | 9.38 | 1727.0 | 9.48 | 10.32 | 85 | 316195 | 95.0 |
| w-third-B2 | ROT | 91.2 | 8.4 | 16.8 | 6.4 | 6.8 | 9.07 | 1714.5 | 9.40 | 10.52 | 85 | 316195 | 94.2 |

## Mittel je Seite (Werte je Boot)

| Größe | A main 3406f8bd | B integ-probe bd38fb16 | Δ B − A | 2σ | Urteil |
|---|---|---|---|---|---|
| fps (Regler voll) | 91.1 (91.9 · 90.2) | 92.3 (93.5 · 91.2) | +1.3 | 2.9 | nicht langsamer |
| Frame p50 ms | 8.4 (8.4 · 8.4) | 8.4 (8.4 · 8.4) | 0.0 | 0.0 | nicht langsamer |
| Frame p95 ms | 16.8 (16.7 · 16.8) | 16.8 (16.7 · 16.8) | 0.0 | 0.1 | nicht langsamer |
| CPU-Takt p95 voll ms | 6.0 (6.0 · 6.1) | 6.1 (5.8 · 6.4) | +0.0 | 0.6 | nicht langsamer |
| CPU-Takt p95 frei ms | 6.5 (6.4 · 6.5) | 6.6 (6.4 · 6.8) | +0.1 | 0.4 | nicht langsamer |
| gpu-bank ms (Gier 0.00) | 9.18 (8.97 · 9.38) | 9.07 (9.08 · 9.07) | -0.10 | 0.41 | nicht langsamer |
| Takt MHz (Bank 1) | 1720.5 (1714.0 · 1727.0) | 1730.3 (1746.0 · 1714.5) | +9.8 | 34.1 | – |
| gpu-bank ms (Gier -0.88) | 9.44 (9.40 · 9.48) | 9.48 (9.57 · 9.40) | +0.04 | 0.19 | nicht langsamer |
| Band GPU ms je Frame | 10.64 (10.97 · 10.32) | 10.60 (10.68 · 10.52) | -0.04 | 0.67 | nicht langsamer |
| Befehle (Band) | 85 (85 · 85) | 85 (85 · 85) | 0 | 0 | – |
| Dreiecke (Band) | 316142 (316089 · 316195) | 316142 (316089 · 316195) | 0 | 150 | – |
| VRAM MB | 95.0 (95.1 · 95.0) | 94.8 (95.3 · 94.2) | -0.3 | 1.1 | – |
