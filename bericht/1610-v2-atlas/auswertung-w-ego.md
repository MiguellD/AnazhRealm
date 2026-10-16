## w-ego — je Boot (Zeitfolge)

| Boot | Urteil | fps (Regler voll) | Frame p50 ms | Frame p95 ms | CPU-Takt p95 voll ms | CPU-Takt p95 frei ms | gpu-bank ms (Gier 0.00) | Takt MHz (Bank 1) | gpu-bank ms (Gier -0.88) | Band GPU ms je Frame | Befehle (Band) | Dreiecke (Band) | VRAM MB |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| w-ego-A1 | ROT | 79.3 | 16.3 | 16.8 | 4.8 | 6.0 | 9.75 | 1739.5 | 10.38 | 14.23 | 82 | 308556 | 98.5 |
| w-ego-B1 | ROT | 77.6 | 16.6 | 16.8 | 4.7 | 7.3 | 10.75 | 1739.5 | 11.10 | 14.13 | 84 | 310494 | 95.1 |
| w-ego-A2 | ROT | 77.9 | 16.5 | 16.8 | 5.3 | 7.6 | 9.73 | 1727.0 | 10.25 | 13.63 | 82 | 307893 | 98.6 |
| w-ego-B2 | ROT | 77.2 | 16.6 | 16.8 | 5.1 | 7.4 | 11.32 | 1720.5 | 11.40 | 13.48 | 88 | 319947 | 95.6 |

## Mittel je Seite (Werte je Boot)

| Größe | A 27ae78bf | B 5fb8eb1c | Δ B − A | 2σ | Urteil |
|---|---|---|---|---|---|
| fps (Regler voll) | 78.6 (79.3 · 77.9) | 77.4 (77.6 · 77.2) | -1.2 | 1.5 | nicht langsamer |
| Frame p50 ms | 16.4 (16.3 · 16.5) | 16.6 (16.6 · 16.6) | +0.2 | 0.2 | LANGSAMER |
| Frame p95 ms | 16.8 (16.8 · 16.8) | 16.8 (16.8 · 16.8) | 0.0 | 0.0 | nicht langsamer |
| CPU-Takt p95 voll ms | 5.0 (4.8 · 5.3) | 4.9 (4.7 · 5.1) | -0.1 | 0.6 | nicht langsamer |
| CPU-Takt p95 frei ms | 6.8 (6.0 · 7.6) | 7.3 (7.3 · 7.4) | +0.5 | 1.6 | nicht langsamer |
| gpu-bank ms (Gier 0.00) | 9.74 (9.75 · 9.73) | 11.04 (10.75 · 11.32) | +1.29 | 0.57 | LANGSAMER |
| Takt MHz (Bank 1) | 1733.3 (1739.5 · 1727.0) | 1730.0 (1739.5 · 1720.5) | -3.3 | 22.7 | – |
| gpu-bank ms (Gier -0.88) | 10.32 (10.38 · 10.25) | 11.25 (11.10 · 11.40) | +0.93 | 0.33 | LANGSAMER |
| Band GPU ms je Frame | 13.93 (14.23 · 13.63) | 13.80 (14.13 · 13.48) | -0.13 | 0.88 | nicht langsamer |
| Befehle (Band) | 82 (82 · 82) | 86 (84 · 88) | +4 | 4 | – |
| Dreiecke (Band) | 308225 (308556 · 307893) | 315221 (310494 · 319947) | +6996 | 9476 | – |
| VRAM MB | 98.5 (98.5 · 98.6) | 95.3 (95.1 · 95.6) | -3.2 | 0.5 | – |
