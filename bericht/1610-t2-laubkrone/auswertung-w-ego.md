## w-ego — je Boot (Zeitfolge)

| Boot | Urteil | fps (Regler voll) | Frame p50 ms | Frame p95 ms | CPU-Takt p95 voll ms | CPU-Takt p95 frei ms | gpu-bank ms (Gier 0.00) | Takt MHz (Bank 1) | gpu-bank ms (Gier -0.88) | Band GPU ms je Frame | Befehle (Band) | Dreiecke (Band) | VRAM MB |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| w-ego-A1 | ROT | 79.7 | 11.7 | 16.8 | 5.2 | 5.1 | 9.69 | 1758.5 | 10.49 | 11.98 | 82 | 308552 | 99.4 |
| w-ego-B1 | ROT | 77.6 | 16.5 | 16.8 | 5.3 | 7.8 | 11.40 | 1714.0 | 11.35 | 13.68 | 88 | 319499 | 99.7 |
| w-ego-A2 | ROT | 78.0 | 16.5 | 16.8 | 5.1 | 7.5 | 9.59 | 1727.0 | 10.65 | 13.38 | 82 | 307232 | 98.1 |
| w-ego-B2 | ROT | 77.7 | 16.5 | 16.8 | 5.0 | 6.9 | 11.42 | 1727.0 | 11.35 | 14.58 | 88 | 320077 | 99.6 |

## Mittel je Seite (Werte je Boot)

| Größe | A 27ae78bf | B f6fa9f63 | Δ B − A | 2σ | Urteil |
|---|---|---|---|---|---|
| fps (Regler voll) | 78.8 (79.7 · 78.0) | 77.7 (77.6 · 77.7) | -1.2 | 1.7 | nicht langsamer |
| Frame p50 ms | 14.1 (11.7 · 16.5) | 16.5 (16.5 · 16.5) | +2.4 | 4.8 | nicht langsamer |
| Frame p95 ms | 16.8 (16.8 · 16.8) | 16.8 (16.8 · 16.8) | 0.0 | 0.0 | nicht langsamer |
| CPU-Takt p95 voll ms | 5.2 (5.2 · 5.1) | 5.2 (5.3 · 5.0) | 0.0 | 0.3 | nicht langsamer |
| CPU-Takt p95 frei ms | 6.3 (5.1 · 7.5) | 7.3 (7.8 · 6.9) | +1.0 | 2.6 | nicht langsamer |
| gpu-bank ms (Gier 0.00) | 9.64 (9.69 · 9.59) | 11.41 (11.40 · 11.42) | +1.77 | 0.10 | LANGSAMER |
| Takt MHz (Bank 1) | 1742.8 (1758.5 · 1727.0) | 1720.5 (1714.0 · 1727.0) | -22.3 | 34.1 | – |
| gpu-bank ms (Gier -0.88) | 10.57 (10.49 · 10.65) | 11.35 (11.35 · 11.35) | +0.78 | 0.16 | LANGSAMER |
| Band GPU ms je Frame | 12.68 (11.98 · 13.38) | 14.13 (13.68 · 14.58) | +1.45 | 1.66 | nicht langsamer |
| Befehle (Band) | 82 (82 · 82) | 88 (88 · 88) | +6 | 0 | – |
| Dreiecke (Band) | 307892 (308552 · 307232) | 319788 (319499 · 320077) | +11896 | 1441 | – |
| VRAM MB | 98.8 (99.4 · 98.1) | 99.7 (99.7 · 99.6) | +0.9 | 1.3 | – |
