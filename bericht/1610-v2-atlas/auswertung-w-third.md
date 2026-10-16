## w-third — je Boot (Zeitfolge)

| Boot | Urteil | fps (Regler voll) | Frame p50 ms | Frame p95 ms | CPU-Takt p95 voll ms | CPU-Takt p95 frei ms | gpu-bank ms (Gier 0.00) | Takt MHz (Bank 1) | gpu-bank ms (Gier -0.88) | Band GPU ms je Frame | Befehle (Band) | Dreiecke (Band) | VRAM MB |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| w-third-A1 | ROT | 82.2 | 8.4 | 16.8 | 5.5 | 5.3 | 9.34 | 1714.0 | 10.68 | 12.76 | 96 | 378910 | 100.4 |
| w-third-B1 | ROT | 80.9 | 8.5 | 16.8 | 5.6 | 5.7 | 10.21 | 1746.0 | 10.73 | 13.88 | 103 | 403879 | 97.8 |
| w-third-A2 | ROT | 81.0 | 8.5 | 16.8 | 5.7 | 5.5 | 9.66 | 1752.5 | 10.73 | 13.57 | 99 | 384200 | 100.4 |
| w-third-B2 | ROT | 80.8 | 8.5 | 16.8 | 5.5 | 5.5 | 10.17 | 1739.5 | 10.44 | 13.08 | 103 | 404131 | 98.7 |

## Mittel je Seite (Werte je Boot)

| Größe | A 27ae78bf | B 5fb8eb1c | Δ B − A | 2σ | Urteil |
|---|---|---|---|---|---|
| fps (Regler voll) | 81.6 (82.2 · 81.0) | 80.8 (80.9 · 80.8) | -0.8 | 1.2 | nicht langsamer |
| Frame p50 ms | 8.4 (8.4 · 8.5) | 8.5 (8.5 · 8.5) | +0.1 | 0.1 | nicht langsamer |
| Frame p95 ms | 16.8 (16.8 · 16.8) | 16.8 (16.8 · 16.8) | 0.0 | 0.0 | nicht langsamer |
| CPU-Takt p95 voll ms | 5.6 (5.5 · 5.7) | 5.5 (5.6 · 5.5) | -0.0 | 0.2 | nicht langsamer |
| CPU-Takt p95 frei ms | 5.4 (5.3 · 5.5) | 5.6 (5.7 · 5.5) | +0.2 | 0.3 | nicht langsamer |
| gpu-bank ms (Gier 0.00) | 9.50 (9.34 · 9.66) | 10.19 (10.21 · 10.17) | +0.69 | 0.32 | LANGSAMER |
| Takt MHz (Bank 1) | 1733.3 (1714.0 · 1752.5) | 1742.8 (1746.0 · 1739.5) | +9.5 | 39.0 | – |
| gpu-bank ms (Gier -0.88) | 10.71 (10.68 · 10.73) | 10.59 (10.73 · 10.44) | -0.12 | 0.29 | nicht langsamer |
| Band GPU ms je Frame | 13.16 (12.76 · 13.57) | 13.48 (13.88 · 13.08) | +0.32 | 1.14 | nicht langsamer |
| Befehle (Band) | 98 (96 · 99) | 103 (103 · 103) | +6 | 3 | – |
| Dreiecke (Band) | 381555 (378910 · 384200) | 404005 (403879 · 404131) | +22450 | 5296 | – |
| VRAM MB | 100.4 (100.4 · 100.4) | 98.3 (97.8 · 98.7) | -2.2 | 0.9 | – |
