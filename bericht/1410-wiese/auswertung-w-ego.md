## w-ego — je Boot (Zeitfolge)

| Boot | Urteil | fps (Regler voll) | Frame p50 ms | Frame p95 ms | CPU-Takt p95 voll ms | CPU-Takt p95 frei ms | gpu-bank ms (Gier 0.00) | Takt MHz (Bank 1) | gpu-bank ms (Gier -0.88) | Band GPU ms je Frame | Befehle (Band) | Dreiecke (Band) | VRAM MB |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| w-ego-A1 | ROT | 103.2 | 8.3 | 16.7 | 5.6 | 5.9 | 7.94 | 1733.0 | 8.93 | 10.03 | 75 | 286238 | 94.8 |
| w-ego-B1 | GRUEN | 95.3 | 8.4 | 16.8 | 5.8 | 6.7 | 8.08 | 1759.0 | 9.38 | 10.26 | 74 | 287135 | 94.5 |
| w-ego-A2 | ROT | 98.0 | 8.4 | 16.7 | 6.1 | 6.6 | 8.03 | 1721.0 | 9.14 | 9.77 | 74 | 285268 | 94.8 |
| w-ego-B2 | GRUEN | 95.5 | 8.4 | 16.7 | 6.2 | 6.3 | 7.87 | 1708.0 | 9.25 | 10.09 | 74 | 287455 | 94.3 |

## Mittel je Seite (Werte je Boot)

| Größe | A main 495bf199 | B integ-probe c5e2fc8f | Δ B − A | 2σ | Urteil |
|---|---|---|---|---|---|
| fps (Regler voll) | 100.6 (103.2 · 98.0) | 95.4 (95.3 · 95.5) | -5.2 | 5.2 | nicht langsamer |
| Frame p50 ms | 8.4 (8.3 · 8.4) | 8.4 (8.4 · 8.4) | +0.0 | 0.1 | nicht langsamer |
| Frame p95 ms | 16.7 (16.7 · 16.7) | 16.8 (16.8 · 16.7) | +0.1 | 0.1 | nicht langsamer |
| CPU-Takt p95 voll ms | 5.8 (5.6 · 6.1) | 6.0 (5.8 · 6.2) | +0.2 | 0.6 | nicht langsamer |
| CPU-Takt p95 frei ms | 6.3 (5.9 · 6.6) | 6.5 (6.7 · 6.3) | +0.3 | 0.8 | nicht langsamer |
| gpu-bank ms (Gier 0.00) | 7.98 (7.94 · 8.03) | 7.97 (8.08 · 7.87) | -0.01 | 0.23 | nicht langsamer |
| Takt MHz (Bank 1) | 1727.0 (1733.0 · 1721.0) | 1733.5 (1759.0 · 1708.0) | +6.5 | 52.4 | – |
| gpu-bank ms (Gier -0.88) | 9.04 (8.93 · 9.14) | 9.32 (9.38 · 9.25) | +0.28 | 0.25 | LANGSAMER |
| Band GPU ms je Frame | 9.90 (10.03 · 9.77) | 10.18 (10.26 · 10.09) | +0.28 | 0.31 | nicht langsamer |
| Befehle (Band) | 75 (75 · 74) | 74 (74 · 74) | 0 | 1 | – |
| Dreiecke (Band) | 285753 (286238 · 285268) | 287295 (287135 · 287455) | +1542 | 1021 | – |
| VRAM MB | 94.8 (94.8 · 94.8) | 94.4 (94.5 · 94.3) | -0.4 | 0.2 | – |
