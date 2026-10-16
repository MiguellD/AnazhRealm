## w-ego — je Boot (Zeitfolge)

| Boot | Urteil | fps (Regler voll) | Frame p50 ms | Frame p95 ms | CPU-Takt p95 voll ms | CPU-Takt p95 frei ms | gpu-bank ms (Gier 0.00) | Takt MHz (Bank 1) | gpu-bank ms (Gier -0.88) | Band GPU ms je Frame | Befehle (Band) | Dreiecke (Band) | VRAM MB |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| w-ego-A1 | ROT | 89.0 | 8.4 | 16.7 | 5.9 | 5.1 | 8.80 | 1752.0 | 9.02 | 11.71 | 76 | 295959 | 97.7 |
| w-ego-B1 | ROT | 90.3 | 8.4 | 16.7 | 4.9 | 5.0 | 8.98 | 1721.0 | 9.13 | 11.64 | 73 | 293124 | 97.7 |
| w-ego-A2 | ROT | 91.0 | 8.4 | 16.7 | 4.8 | 4.8 | 8.94 | 1727.0 | 9.20 | 11.23 | 73 | 283919 | 97.0 |
| w-ego-B2 | ROT | 91.5 | 8.4 | 16.7 | 4.8 | 4.8 | 9.10 | 1702.0 | 8.88 | 11.63 | 73 | 292996 | 97.7 |

## Mittel je Seite (Werte je Boot)

| Größe | A 210fe8a7 | B 0d6c8bc1 | Δ B − A | 2σ | Urteil |
|---|---|---|---|---|---|
| fps (Regler voll) | 90.0 (89.0 · 91.0) | 90.9 (90.3 · 91.5) | +0.9 | 2.3 | nicht langsamer |
| Frame p50 ms | 8.4 (8.4 · 8.4) | 8.4 (8.4 · 8.4) | 0.0 | 0.0 | nicht langsamer |
| Frame p95 ms | 16.7 (16.7 · 16.7) | 16.7 (16.7 · 16.7) | 0.0 | 0.0 | nicht langsamer |
| CPU-Takt p95 voll ms | 5.3 (5.9 · 4.8) | 4.8 (4.9 · 4.8) | -0.5 | 1.1 | nicht langsamer |
| CPU-Takt p95 frei ms | 4.9 (5.1 · 4.8) | 4.9 (5.0 · 4.8) | -0.0 | 0.4 | nicht langsamer |
| gpu-bank ms (Gier 0.00) | 8.87 (8.80 · 8.94) | 9.04 (8.98 · 9.10) | +0.17 | 0.18 | nicht langsamer |
| Takt MHz (Bank 1) | 1739.5 (1752.0 · 1727.0) | 1711.5 (1721.0 · 1702.0) | -28.0 | 31.4 | – |
| gpu-bank ms (Gier -0.88) | 9.11 (9.02 · 9.20) | 9.01 (9.13 · 8.88) | -0.10 | 0.31 | nicht langsamer |
| Band GPU ms je Frame | 11.47 (11.71 · 11.23) | 11.64 (11.64 · 11.63) | +0.17 | 0.48 | nicht langsamer |
| Befehle (Band) | 75 (76 · 73) | 73 (73 · 73) | -1 | 3 | – |
| Dreiecke (Band) | 289939 (295959 · 283919) | 293060 (293124 · 292996) | +3121 | 12041 | – |
| VRAM MB | 97.3 (97.7 · 97.0) | 97.7 (97.7 · 97.7) | +0.4 | 0.7 | – |
