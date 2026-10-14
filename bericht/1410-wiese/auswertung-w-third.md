## w-third — je Boot (Zeitfolge)

| Boot | Urteil | fps (Regler voll) | Frame p50 ms | Frame p95 ms | CPU-Takt p95 voll ms | CPU-Takt p95 frei ms | gpu-bank ms (Gier 0.00) | Takt MHz (Bank 1) | gpu-bank ms (Gier -0.88) | Band GPU ms je Frame | Befehle (Band) | Dreiecke (Band) | VRAM MB |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| w-third-A1 | ROT | 94.1 | 8.4 | 16.8 | 6.8 | 7.9 | 8.60 | 1720.5 | 9.57 | 10.01 | 85 | 323195 | 96.3 |
| w-third-B1 | GRUEN | 94.5 | 8.4 | 16.8 | 7.2 | 7.9 | 8.92 | 1714.0 | 9.27 | 10.42 | 85 | 324464 | 95.9 |
| w-third-A2 | ROT | 96.4 | 8.4 | 16.7 | 6.6 | 7.3 | 8.55 | 1714.0 | 9.33 | 10.10 | 85 | 323944 | 95.9 |
| w-third-B2 | GRUEN | 94.3 | 8.4 | 16.7 | 6.6 | 8.7 | 8.99 | 1733.5 | 9.90 | 10.67 | 85 | 324047 | 95.6 |

## Mittel je Seite (Werte je Boot)

| Größe | A main 495bf199 | B integ-probe c5e2fc8f | Δ B − A | 2σ | Urteil |
|---|---|---|---|---|---|
| fps (Regler voll) | 95.3 (94.1 · 96.4) | 94.4 (94.5 · 94.3) | -0.8 | 2.3 | nicht langsamer |
| Frame p50 ms | 8.4 (8.4 · 8.4) | 8.4 (8.4 · 8.4) | 0.0 | 0.0 | nicht langsamer |
| Frame p95 ms | 16.8 (16.8 · 16.7) | 16.8 (16.8 · 16.7) | 0.0 | 0.1 | nicht langsamer |
| CPU-Takt p95 voll ms | 6.7 (6.8 · 6.6) | 6.9 (7.2 · 6.6) | +0.2 | 0.6 | nicht langsamer |
| CPU-Takt p95 frei ms | 7.6 (7.9 · 7.3) | 8.3 (7.9 · 8.7) | +0.7 | 1.0 | nicht langsamer |
| gpu-bank ms (Gier 0.00) | 8.57 (8.60 · 8.55) | 8.96 (8.92 · 8.99) | +0.38 | 0.09 | LANGSAMER |
| Takt MHz (Bank 1) | 1717.3 (1720.5 · 1714.0) | 1723.8 (1714.0 · 1733.5) | +6.5 | 20.6 | – |
| gpu-bank ms (Gier -0.88) | 9.45 (9.57 · 9.33) | 9.59 (9.27 · 9.90) | +0.14 | 0.67 | nicht langsamer |
| Band GPU ms je Frame | 10.05 (10.01 · 10.10) | 10.54 (10.42 · 10.67) | +0.49 | 0.27 | LANGSAMER |
| Befehle (Band) | 85 (85 · 85) | 85 (85 · 85) | 0 | 0 | – |
| Dreiecke (Band) | 323570 (323195 · 323944) | 324256 (324464 · 324047) | +686 | 857 | – |
| VRAM MB | 96.1 (96.3 · 95.9) | 95.8 (95.9 · 95.6) | -0.3 | 0.5 | – |
