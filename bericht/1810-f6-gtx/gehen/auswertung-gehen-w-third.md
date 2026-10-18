## w-third — je Boot

| Boot | Gang | fps | Frame p50 ms | Frame p95 ms | Frame p99 ms | CPU-Takt p50 ms | CPU-Takt p95 ms | GPU-Durchsatz p50 ms |
|---|---|---|---|---|---|---|---|---|
| w-third-A1 | steht | 80.7 | 8.5 | 16.8 | 17.1 | 3.70 | 5.0 | 12.20 |
| w-third-A1 | geht-1 | 59.2 | 16.6 | 25.1 | 50.1 | 11.90 | 21.9 | 15.70 |
| w-third-A1 | geht-2 | 63.3 | 16.6 | 25.0 | 33.4 | 11.20 | 17.2 | 15.20 |
| w-third-A1 | Geher-Ende | { "ergebnis": { "s": -16, "wege": 4 }, "ms": 2 } | | | | | | |
| w-third-A2 | steht | 79.9 | 9.6 | 16.7 | 17.0 | 4.20 | 5.4 | 12.40 |
| w-third-A2 | geht-1 | 49.7 | 16.7 | 33.4 | 66.6 | 15.70 | 27.6 | 17.80 |
| w-third-A2 | geht-2 | 54.6 | 16.7 | 25.1 | 41.7 | 14.90 | 22.6 | 17.20 |
| w-third-A2 | Geher-Ende | { "ergebnis": { "s": -16.2, "wege": 4 }, "ms": 1 } | | | | | | |
| w-third-A3 | steht | 80.9 | 8.5 | 16.8 | 17.0 | 3.70 | 4.9 | 12.20 |
| w-third-A3 | geht-1 | 58.0 | 16.7 | 25.1 | 50.0 | 12.40 | 21.9 | 16.10 |
| w-third-A3 | geht-2 | 63.3 | 16.6 | 25.0 | 33.4 | 11.20 | 16.4 | 15.30 |
| w-third-A3 | Geher-Ende | { "ergebnis": { "s": -16.1, "wege": 4 }, "ms": 1 } | | | | | | |
| w-third-A4 | steht | 81.0 | 8.5 | 16.8 | 17.0 | 3.70 | 5.1 | 12.20 |
| w-third-A4 | geht-1 | 58.9 | 16.6 | 25.1 | 58.2 | 12.40 | 22.4 | 15.70 |
| w-third-A4 | geht-2 | 63.2 | 16.6 | 25.0 | 33.4 | 11.30 | 16.7 | 15.20 |
| w-third-A4 | Geher-Ende | { "ergebnis": { "s": -16, "wege": 4 }, "ms": 1 } | | | | | | |
| w-third-B1 | steht | 83.2 | 8.4 | 16.8 | 17.0 | 3.70 | 4.9 | 11.80 |
| w-third-B1 | geht-1 | 59.3 | 16.6 | 25.1 | 50.0 | 12.20 | 22.2 | 15.50 |
| w-third-B1 | geht-2 | 64.7 | 16.6 | 25.0 | 33.3 | 11.30 | 17.1 | 15.00 |
| w-third-B1 | Geher-Ende | { "ergebnis": { "s": -16, "wege": 4 }, "ms": 2 } | | | | | | |
| w-third-B2 | steht | 81.0 | 8.5 | 16.8 | 17.0 | 3.90 | 5.3 | 12.10 |
| w-third-B2 | geht-1 | 59.0 | 16.7 | 25.1 | 50.0 | 12.40 | 21.9 | 15.80 |
| w-third-B2 | geht-2 | 63.8 | 16.6 | 25.0 | 33.4 | 11.50 | 17.0 | 15.20 |
| w-third-B2 | Geher-Ende | { "ergebnis": { "s": -16.2, "wege": 4 }, "ms": 2 } | | | | | | |
| w-third-B3 | steht | 81.5 | 8.4 | 16.8 | 17.0 | 3.80 | 5.1 | 12.00 |
| w-third-B3 | geht-1 | 59.6 | 16.6 | 25.1 | 50.0 | 12.00 | 21.9 | 15.70 |
| w-third-B3 | geht-2 | 64.0 | 16.6 | 25.1 | 33.3 | 11.40 | 16.9 | 15.00 |
| w-third-B3 | Geher-Ende | { "ergebnis": { "s": -15.9, "wege": 4 }, "ms": 2 } | | | | | | |
| w-third-B4 | steht | 83.1 | 8.4 | 16.8 | 17.0 | 3.70 | 5.0 | 11.70 |
| w-third-B4 | geht-1 | 60.5 | 16.6 | 25.1 | 50.0 | 12.20 | 21.1 | 15.50 |
| w-third-B4 | geht-2 | 64.5 | 16.6 | 25.0 | 33.3 | 11.20 | 17.0 | 15.00 |
| w-third-B4 | Geher-Ende | { "ergebnis": { "s": -16, "wege": 4 }, "ms": 2 } | | | | | | |

## Mittel je Seite (A f45ee994 main · B 018945d5 Baum 8e54c6c7; gehend = Mittel aus geht-1 und geht-2 je Boot)

| Gang | Größe | A | B | Δ B − A | 2σ | Urteil |
|---|---|---|---|---|---|---|
| steht | fps | 80.6 (80.7 · 79.9 · 80.9 · 81.0) | 82.2 (83.2 · 81.0 · 81.5 · 83.1) | +1.6 | 1.7 | nicht langsamer |
| steht | Frame p50 ms | 8.8 (8.5 · 9.6 · 8.5 · 8.5) | 8.4 (8.4 · 8.5 · 8.4 · 8.4) | -0.4 | 0.8 | nicht langsamer |
| steht | Frame p95 ms | 16.8 (16.8 · 16.7 · 16.8 · 16.8) | 16.8 (16.8 · 16.8 · 16.8 · 16.8) | +0.0 | 0.1 | nicht langsamer |
| steht | Frame p99 ms | 17.0 (17.1 · 17.0 · 17.0 · 17.0) | 17.0 (17.0 · 17.0 · 17.0 · 17.0) | -0.0 | 0.1 | nicht langsamer |
| steht | CPU-Takt p50 ms | 3.83 (3.70 · 4.20 · 3.70 · 3.70) | 3.77 (3.70 · 3.90 · 3.80 · 3.70) | -0.05 | 0.38 | nicht langsamer |
| steht | CPU-Takt p95 ms | 5.1 (5.0 · 5.4 · 4.9 · 5.1) | 5.1 (4.9 · 5.3 · 5.1 · 5.0) | -0.0 | 0.4 | nicht langsamer |
| steht | GPU-Durchsatz p50 ms | 12.25 (12.20 · 12.40 · 12.20 · 12.20) | 11.90 (11.80 · 12.10 · 12.00 · 11.70) | -0.35 | 0.29 | nicht langsamer |
| geht | fps | 58.8 (61.3 · 52.2 · 60.6 · 61.0) | 61.9 (62.0 · 61.4 · 61.8 · 62.5) | +3.1 | 6.3 | nicht langsamer |
| geht | Frame p50 ms | 16.6 (16.6 · 16.7 · 16.6 · 16.6) | 16.6 (16.6 · 16.6 · 16.6 · 16.6) | -0.0 | 0.1 | nicht langsamer |
| geht | Frame p95 ms | 26.1 (25.1 · 29.3 · 25.1 · 25.1) | 25.1 (25.1 · 25.1 · 25.1 · 25.1) | -1.0 | 3.0 | nicht langsamer |
| geht | Frame p99 ms | 45.9 (41.8 · 54.1 · 41.7 · 45.8) | 41.7 (41.6 · 41.7 · 41.6 · 41.6) | -4.2 | 8.3 | nicht langsamer |
| geht | CPU-Takt p50 ms | 12.63 (11.55 · 15.30 · 11.80 · 11.85) | 11.77 (11.75 · 11.95 · 11.70 · 11.70) | -0.85 | 2.53 | nicht langsamer |
| geht | CPU-Takt p95 ms | 20.8 (19.5 · 25.1 · 19.1 · 19.5) | 19.4 (19.6 · 19.4 · 19.4 · 19.1) | -1.4 | 4.0 | nicht langsamer |
| geht | GPU-Durchsatz p50 ms | 16.03 (15.45 · 17.50 · 15.70 · 15.45) | 15.34 (15.25 · 15.50 · 15.35 · 15.25) | -0.69 | 1.41 | nicht langsamer |

**KERN-URTEIL GEHEN w-third** (steht + geht × Frame p95 · CPU-Takt p95 · GPU-Durchsatz p50; Δ ≤ max(2σ gepoolt, Auflösung)): nicht langsamer (6 Größen)
