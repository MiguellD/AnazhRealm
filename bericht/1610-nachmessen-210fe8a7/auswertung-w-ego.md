## w-ego — je Boot (Zeitfolge)

| Boot | Urteil | fps (Regler voll) | Frame p50 ms | Frame p95 ms | CPU-Takt p95 voll ms | CPU-Takt p95 frei ms | gpu-bank ms (Gier 0.00) | Takt MHz (Bank 1) | gpu-bank ms (Gier -0.88) | Band GPU ms je Frame | Befehle (Band) | Dreiecke (Band) | VRAM MB |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| w-ego-A1 | ROT | 92.3 | 8.4 | 16.7 | 5.0 | 4.9 | 8.67 | 1714.5 | 9.27 | 10.87 | 74 | 284935 | 95.8 |
| w-ego-B1 | GRUEN | 93.5 | 8.4 | 16.7 | 4.9 | 5.2 | 8.82 | 1708.0 | 9.13 | 11.53 | 74 | 283205 | 97.0 |
| w-ego-A2 | ROT | 94.0 | 8.4 | 16.7 | 5.0 | 5.0 | 8.63 | 1695.5 | 9.15 | 10.96 | 73 | 282367 | 96.6 |
| w-ego-B2 | ROT | 90.9 | 8.4 | 16.7 | 4.9 | 4.9 | 8.96 | 1733.0 | 8.62 | 11.35 | 75 | 287496 | 93.1 |

## Mittel je Seite (Werte je Boot)

| Größe | A d5deed14 | B 210fe8a7 | Δ B − A | 2σ | Urteil |
|---|---|---|---|---|---|
| fps (Regler voll) | 93.2 (92.3 · 94.0) | 92.2 (93.5 · 90.9) | -1.0 | 3.1 | nicht langsamer |
| Frame p50 ms | 8.4 (8.4 · 8.4) | 8.4 (8.4 · 8.4) | 0.0 | 0.0 | nicht langsamer |
| Frame p95 ms | 16.7 (16.7 · 16.7) | 16.7 (16.7 · 16.7) | 0.0 | 0.0 | nicht langsamer |
| CPU-Takt p95 voll ms | 5.0 (5.0 · 5.0) | 4.9 (4.9 · 4.9) | -0.1 | 0.0 | nicht langsamer |
| CPU-Takt p95 frei ms | 5.0 (4.9 · 5.0) | 5.1 (5.2 · 4.9) | +0.1 | 0.3 | nicht langsamer |
| gpu-bank ms (Gier 0.00) | 8.65 (8.67 · 8.63) | 8.89 (8.82 · 8.96) | +0.24 | 0.15 | LANGSAMER |
| Takt MHz (Bank 1) | 1705.0 (1714.5 · 1695.5) | 1720.5 (1708.0 · 1733.0) | +15.5 | 31.4 | – |
| gpu-bank ms (Gier -0.88) | 9.21 (9.27 · 9.15) | 8.88 (9.13 · 8.62) | -0.34 | 0.52 | nicht langsamer |
| Band GPU ms je Frame | 10.91 (10.87 · 10.96) | 11.44 (11.53 · 11.35) | +0.53 | 0.20 | LANGSAMER |
| Befehle (Band) | 74 (74 · 73) | 75 (74 · 75) | +1 | 1 | – |
| Dreiecke (Band) | 283651 (284935 · 282367) | 285351 (283205 · 287496) | +1700 | 5001 | – |
| VRAM MB | 96.2 (95.8 · 96.6) | 95.0 (97.0 · 93.1) | -1.1 | 4.0 | – |
