## g-ego — je Boot (Zeitfolge)

| Boot | Urteil | fps (Regler voll) | Frame p50 ms | Frame p95 ms | CPU-Takt p95 voll ms | CPU-Takt p95 frei ms | gpu-bank ms (Gier undefined) | Takt MHz (Bank 1) | gpu-bank ms (Gier –) | Band GPU ms je Frame | Befehle (Band) | Dreiecke (Band) | VRAM MB |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| g-ego-A1 | ROT | 78.7 | 16.5 | 16.8 | 5.4 | – | – | – | – | 12.28 | 106 | 354121 | 104.6 |
| g-ego-B1 | GRUEN | 78.6 | 16.5 | 16.8 | 5.2 | – | – | – | – | 14.49 | 106 | 354121 | 105.0 |
| g-ego-A2 | ROT | 78.0 | 16.5 | 16.8 | 5.5 | – | – | – | – | 14.45 | 106 | 350207 | 104.4 |
| g-ego-B2 | GRUEN | 78.0 | 16.5 | 16.8 | 5.5 | – | – | – | – | 14.28 | 106 | 353695 | 104.6 |

## Mittel je Seite (Werte je Boot)

| Größe | A main bd38fb16 | B K62 4e8270bc (render-objekt fedecfaa + main) | Δ B − A | 2σ | Urteil |
|---|---|---|---|---|---|
| fps (Regler voll) | 78.3 (78.7 · 78.0) | 78.3 (78.6 · 78.0) | -0.0 | 0.9 | nicht langsamer |
| Frame p50 ms | 16.5 (16.5 · 16.5) | 16.5 (16.5 · 16.5) | 0.0 | 0.0 | nicht langsamer |
| Frame p95 ms | 16.8 (16.8 · 16.8) | 16.8 (16.8 · 16.8) | 0.0 | 0.0 | nicht langsamer |
| CPU-Takt p95 voll ms | 5.5 (5.4 · 5.5) | 5.3 (5.2 · 5.5) | -0.1 | 0.3 | nicht langsamer |
| Band GPU ms je Frame | 13.36 (12.28 · 14.45) | 14.38 (14.49 · 14.28) | +1.02 | 2.18 | nicht langsamer |
| Befehle (Band) | 106 (106 · 106) | 106 (106 · 106) | 0 | 0 | – |
| Dreiecke (Band) | 352164 (354121 · 350207) | 353908 (354121 · 353695) | +1744 | 3937 | – |
| VRAM MB | 104.5 (104.6 · 104.4) | 104.8 (105.0 · 104.6) | +0.3 | 0.4 | – |
