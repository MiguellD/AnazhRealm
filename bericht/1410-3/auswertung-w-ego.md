## w-ego — je Boot (Zeitfolge)

| Boot | Urteil | fps (Regler voll) | Frame p50 ms | Frame p95 ms | CPU-Takt p95 voll ms | CPU-Takt p95 frei ms | gpu-bank ms (Gier 0.00) | Takt MHz (Bank 1) | gpu-bank ms (Gier -0.88) | Band GPU ms je Frame | Befehle (Band) | Dreiecke (Band) | VRAM MB |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| w-ego-A1 | ROT | 97.9 | 8.4 | 16.7 | 5.7 | 6.4 | 8.08 | 1708.0 | 9.08 | 11.11 | 74 | 287443 | 94.7 |
| w-ego-B1 | GRUEN | 97.5 | 8.4 | 16.7 | 5.8 | 6.1 | 8.38 | 1771.0 | 9.26 | 10.37 | 73 | 284773 | 94.8 |
| w-ego-A2 | ROT | 94.1 | 8.4 | 16.8 | 6.2 | 6.7 | 8.07 | 1727.0 | 9.07 | 10.52 | 74 | 287455 | 94.0 |
| w-ego-B2 | GRUEN | 98.2 | 8.4 | 16.7 | 5.7 | 6.0 | 8.19 | 1720.5 | 9.31 | 10.38 | 75 | 288016 | 94.5 |

## Mittel je Seite (Werte je Boot)

| Größe | A main-naechst d47efac7 | B takt-wurzel 872ffeec | Δ B − A | 2σ | Urteil |
|---|---|---|---|---|---|
| fps (Regler voll) | 96.0 (97.9 · 94.1) | 97.8 (97.5 · 98.2) | +1.8 | 3.9 | nicht langsamer |
| Frame p50 ms | 8.4 (8.4 · 8.4) | 8.4 (8.4 · 8.4) | 0.0 | 0.0 | nicht langsamer |
| Frame p95 ms | 16.8 (16.7 · 16.8) | 16.7 (16.7 · 16.7) | -0.1 | 0.1 | nicht langsamer |
| CPU-Takt p95 voll ms | 6.0 (5.7 · 6.2) | 5.8 (5.8 · 5.7) | -0.2 | 0.5 | nicht langsamer |
| CPU-Takt p95 frei ms | 6.6 (6.4 · 6.7) | 6.0 (6.1 · 6.0) | -0.5 | 0.3 | nicht langsamer |
| gpu-bank ms (Gier 0.00) | 8.07 (8.08 · 8.07) | 8.29 (8.38 · 8.19) | +0.21 | 0.19 | LANGSAMER |
| Takt MHz (Bank 1) | 1717.5 (1708.0 · 1727.0) | 1745.8 (1771.0 · 1720.5) | +28.3 | 54.0 | – |
| gpu-bank ms (Gier -0.88) | 9.07 (9.08 · 9.07) | 9.29 (9.26 · 9.31) | +0.21 | 0.05 | LANGSAMER |
| Band GPU ms je Frame | 10.81 (11.11 · 10.52) | 10.38 (10.37 · 10.38) | -0.44 | 0.59 | nicht langsamer |
| Befehle (Band) | 74 (74 · 74) | 74 (73 · 75) | 0 | 2 | – |
| Dreiecke (Band) | 287449 (287443 · 287455) | 286395 (284773 · 288016) | -1054 | 3243 | – |
| VRAM MB | 94.3 (94.7 · 94.0) | 94.7 (94.8 · 94.5) | +0.3 | 0.8 | – |
