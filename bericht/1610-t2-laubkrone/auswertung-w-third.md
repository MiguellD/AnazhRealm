## w-third — je Boot (Zeitfolge)

| Boot | Urteil | fps (Regler voll) | Frame p50 ms | Frame p95 ms | CPU-Takt p95 voll ms | CPU-Takt p95 frei ms | gpu-bank ms (Gier 0.00) | Takt MHz (Bank 1) | gpu-bank ms (Gier -0.88) | Band GPU ms je Frame | Befehle (Band) | Dreiecke (Band) | VRAM MB |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| w-third-A1 | ROT | 80.6 | 8.5 | 16.8 | 7.0 | 6.1 | 9.72 | 1721.0 | 10.51 | 12.40 | 99 | 389884 | 96.8 |
| w-third-B1 | ROT | 81.8 | 8.5 | 16.8 | 4.9 | 4.8 | 9.77 | 1733.0 | 10.28 | 12.13 | 100 | 393319 | 100.4 |
| w-third-A2 | ROT | 81.9 | 8.4 | 16.8 | 5.7 | 5.5 | 9.27 | 1708.0 | 10.48 | 12.13 | 99 | 389894 | 101.5 |
| w-third-B2 | ROT | 82.0 | 8.4 | 16.8 | 5.3 | 5.3 | 9.94 | 1708.0 | 10.36 | 12.38 | 103 | 403879 | 101.9 |

## Mittel je Seite (Werte je Boot)

| Größe | A 27ae78bf | B f6fa9f63 | Δ B − A | 2σ | Urteil |
|---|---|---|---|---|---|
| fps (Regler voll) | 81.3 (80.6 · 81.9) | 81.9 (81.8 · 82.0) | +0.7 | 1.3 | nicht langsamer |
| Frame p50 ms | 8.4 (8.5 · 8.4) | 8.4 (8.5 · 8.4) | 0.0 | 0.1 | nicht langsamer |
| Frame p95 ms | 16.8 (16.8 · 16.8) | 16.8 (16.8 · 16.8) | 0.0 | 0.0 | nicht langsamer |
| CPU-Takt p95 voll ms | 6.3 (7.0 · 5.7) | 5.1 (4.9 · 5.3) | -1.3 | 1.4 | nicht langsamer |
| CPU-Takt p95 frei ms | 5.8 (6.1 · 5.5) | 5.0 (4.8 · 5.3) | -0.8 | 0.8 | nicht langsamer |
| gpu-bank ms (Gier 0.00) | 9.50 (9.72 · 9.27) | 9.86 (9.77 · 9.94) | +0.36 | 0.48 | nicht langsamer |
| Takt MHz (Bank 1) | 1714.5 (1721.0 · 1708.0) | 1720.5 (1733.0 · 1708.0) | +6.0 | 28.2 | – |
| gpu-bank ms (Gier -0.88) | 10.50 (10.51 · 10.48) | 10.32 (10.28 · 10.36) | -0.18 | 0.09 | nicht langsamer |
| Band GPU ms je Frame | 12.27 (12.40 · 12.13) | 12.26 (12.13 · 12.38) | -0.01 | 0.37 | nicht langsamer |
| Befehle (Band) | 99 (99 · 99) | 102 (100 · 103) | +3 | 3 | – |
| Dreiecke (Band) | 389889 (389884 · 389894) | 398599 (393319 · 403879) | +8710 | 10560 | – |
| VRAM MB | 99.2 (96.8 · 101.5) | 101.2 (100.4 · 101.9) | +2.0 | 4.9 | – |
