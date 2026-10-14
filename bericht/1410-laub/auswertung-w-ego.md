## w-ego — je Boot (Zeitfolge)

| Boot | Urteil | fps (Regler voll) | Frame p50 ms | Frame p95 ms | CPU-Takt p95 voll ms | CPU-Takt p95 frei ms | gpu-bank ms (Gier 0.00) | Takt MHz (Bank 1) | gpu-bank ms (Gier -0.88) | Band GPU ms je Frame | Befehle (Band) | Dreiecke (Band) | VRAM MB |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| w-ego-A1 | ROT | 96.4 | 8.4 | 16.7 | 6.2 | 6.3 | 8.27 | 1720.5 | 9.12 | 10.13 | 74 | 287455 | 95.0 |
| w-ego-B1 | GRUEN | 92.0 | 8.4 | 16.8 | 6.4 | 6.6 | 8.49 | 1752.0 | 9.18 | 10.64 | 74 | 285713 | 95.0 |
| w-ego-A2 | ROT | 94.6 | 8.4 | 16.7 | 6.1 | 6.1 | 8.24 | 1746.0 | 9.60 | 10.58 | 74 | 287443 | 94.5 |
| w-ego-B2 | GRUEN | 92.7 | 8.4 | 16.8 | 6.3 | 7.6 | 8.32 | 1721.0 | 9.33 | 10.70 | 74 | 287443 | 95.2 |

## Mittel je Seite (Werte je Boot)

| Größe | A main c5e2fc8f | B main-naechst f09398e6 | Δ B − A | 2σ | Urteil |
|---|---|---|---|---|---|
| fps (Regler voll) | 95.5 (96.4 · 94.6) | 92.3 (92.0 · 92.7) | -3.2 | 1.9 | LANGSAMER |
| Frame p50 ms | 8.4 (8.4 · 8.4) | 8.4 (8.4 · 8.4) | 0.0 | 0.0 | nicht langsamer |
| Frame p95 ms | 16.7 (16.7 · 16.7) | 16.8 (16.8 · 16.8) | +0.1 | 0.0 | LANGSAMER |
| CPU-Takt p95 voll ms | 6.2 (6.2 · 6.1) | 6.3 (6.4 · 6.3) | +0.2 | 0.1 | LANGSAMER |
| CPU-Takt p95 frei ms | 6.2 (6.3 · 6.1) | 7.1 (6.6 · 7.6) | +0.9 | 1.0 | nicht langsamer |
| gpu-bank ms (Gier 0.00) | 8.25 (8.27 · 8.24) | 8.41 (8.49 · 8.32) | +0.15 | 0.17 | nicht langsamer |
| Takt MHz (Bank 1) | 1733.3 (1720.5 · 1746.0) | 1736.5 (1752.0 · 1721.0) | +3.3 | 40.1 | – |
| gpu-bank ms (Gier -0.88) | 9.36 (9.12 · 9.60) | 9.25 (9.18 · 9.33) | -0.11 | 0.50 | nicht langsamer |
| Band GPU ms je Frame | 10.36 (10.13 · 10.58) | 10.67 (10.64 · 10.70) | +0.31 | 0.45 | nicht langsamer |
| Befehle (Band) | 74 (74 · 74) | 74 (74 · 74) | 0 | 0 | – |
| Dreiecke (Band) | 287449 (287455 · 287443) | 286578 (285713 · 287443) | -871 | 1730 | – |
| VRAM MB | 94.8 (95.0 · 94.5) | 95.1 (95.0 · 95.2) | +0.3 | 0.5 | – |
