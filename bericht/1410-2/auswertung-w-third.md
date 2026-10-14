## w-third — je Boot (Zeitfolge)

| Boot | Urteil | fps (Regler voll) | Frame p50 ms | Frame p95 ms | CPU-Takt p95 voll ms | CPU-Takt p95 frei ms | gpu-bank ms (Gier 0.00) | Takt MHz (Bank 1) | gpu-bank ms (Gier -0.88) | Band GPU ms je Frame | Befehle (Band) | Dreiecke (Band) | VRAM MB |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| w-third-A1 | ROT | 61.3 | 16.7 | 16.8 | 6.1 | 5.5 | 14.16 | 1676.5 | 12.39 | 15.67 | 85 | 591853 | 118.8 |
| w-third-B1 | ROT | 59.0 | 16.7 | 24.8 | 7.5 | 6.1 | 16.31 | 1699.3 | 14.84 | 18.40 | 85 | 435989 | 112.2 |
| w-third-A2 | ROT | 62.0 | 16.7 | 16.8 | 5.6 | 5.6 | 14.19 | 1708.0 | 12.14 | 15.19 | 85 | 591811 | 119.2 |
| w-third-B2 | ROT | 59.9 | 16.7 | 25.0 | 6.9 | 6.0 | 16.29 | 1695.3 | 14.67 | 16.03 | 85 | 436071 | 112.2 |

## Mittel je Seite (Werte je Boot)

| Größe | A main 9fb869a5 | B integ-probe 08b57ed8 | Δ B − A | 2σ | Urteil |
|---|---|---|---|---|---|
| fps (Regler voll) | 61.6 (61.3 · 62.0) | 59.5 (59.0 · 59.9) | -2.2 | 1.1 | LANGSAMER |
| Frame p50 ms | 16.7 (16.7 · 16.7) | 16.7 (16.7 · 16.7) | 0.0 | 0.0 | nicht langsamer |
| Frame p95 ms | 16.8 (16.8 · 16.8) | 24.9 (24.8 · 25.0) | +8.1 | 0.2 | LANGSAMER |
| CPU-Takt p95 voll ms | 5.8 (6.1 · 5.6) | 7.2 (7.5 · 6.9) | +1.4 | 0.8 | LANGSAMER |
| CPU-Takt p95 frei ms | 5.5 (5.5 · 5.6) | 6.0 (6.1 · 6.0) | +0.5 | 0.1 | LANGSAMER |
| gpu-bank ms (Gier 0.00) | 14.18 (14.16 · 14.19) | 16.30 (16.31 · 16.29) | +2.12 | 0.04 | LANGSAMER |
| Takt MHz (Bank 1) | 1692.3 (1676.5 · 1708.0) | 1697.3 (1699.3 · 1695.3) | +5.0 | 31.8 | – |
| gpu-bank ms (Gier -0.88) | 12.27 (12.39 · 12.14) | 14.75 (14.84 · 14.67) | +2.49 | 0.30 | LANGSAMER |
| Band GPU ms je Frame | 15.43 (15.67 · 15.19) | 17.21 (18.40 · 16.03) | +1.79 | 2.42 | nicht langsamer |
| Befehle (Band) | 85 (85 · 85) | 85 (85 · 85) | 0 | 0 | – |
| Dreiecke (Band) | 591832 (591853 · 591811) | 436030 (435989 · 436071) | -155802 | 92 | – |
| VRAM MB | 119.0 (118.8 · 119.2) | 112.2 (112.2 · 112.2) | -6.8 | 0.4 | – |
