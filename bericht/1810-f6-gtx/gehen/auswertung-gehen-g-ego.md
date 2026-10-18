## g-ego — je Boot

| Boot | Gang | fps | Frame p50 ms | Frame p95 ms | Frame p99 ms | CPU-Takt p50 ms | CPU-Takt p95 ms | GPU-Durchsatz p50 ms |
|---|---|---|---|---|---|---|---|---|
| g-ego-A1 | steht | 83.2 | 8.4 | 16.8 | 17.0 | 3.60 | 4.9 | 11.70 |
| g-ego-A1 | geht-1 | 63.3 | 16.6 | 25.1 | 41.7 | 10.50 | 19.1 | 14.60 |
| g-ego-A1 | geht-2 | 68.8 | 16.6 | 25.0 | 25.7 | 9.70 | 13.8 | 14.20 |
| g-ego-A1 | Geher-Ende | { "ergebnis": { "s": -16.1, "wege": 4 }, "ms": 2 } | | | | | | |
| g-ego-A2 | steht | 84.2 | 8.4 | 16.8 | 16.9 | 3.60 | 5.0 | 11.50 |
| g-ego-A2 | geht-1 | 64.2 | 16.6 | 25.0 | 41.7 | 10.50 | 18.1 | 14.60 |
| g-ego-A2 | geht-2 | 68.3 | 16.6 | 25.0 | 33.3 | 9.90 | 14.3 | 14.20 |
| g-ego-A2 | Geher-Ende | { "ergebnis": { "s": -15.7, "wege": 4 }, "ms": 3 } | | | | | | |
| g-ego-A3 | steht | 84.7 | 8.4 | 16.8 | 17.0 | 3.60 | 4.9 | 11.50 |
| g-ego-A3 | geht-1 | 63.5 | 16.6 | 25.1 | 50.0 | 10.50 | 18.9 | 14.60 |
| g-ego-A3 | geht-2 | 69.3 | 16.6 | 25.0 | 33.3 | 9.70 | 13.8 | 14.10 |
| g-ego-A3 | Geher-Ende | { "ergebnis": { "s": -16, "wege": 4 }, "ms": 2 } | | | | | | |
| g-ego-A4 | steht | 82.1 | 8.5 | 16.8 | 17.0 | 3.70 | 5.0 | 11.90 |
| g-ego-A4 | geht-1 | 62.9 | 16.6 | 25.1 | 41.8 | 10.50 | 18.4 | 14.80 |
| g-ego-A4 | geht-2 | 65.8 | 16.6 | 25.0 | 33.4 | 10.30 | 16.9 | 14.70 |
| g-ego-A4 | Geher-Ende | { "ergebnis": { "s": -15.8, "wege": 4 }, "ms": 2 } | | | | | | |
| g-ego-B1 | steht | 85.5 | 8.4 | 16.8 | 16.9 | 3.60 | 4.9 | 11.30 |
| g-ego-B1 | geht-1 | 64.8 | 16.6 | 25.0 | 49.9 | 10.50 | 18.3 | 14.30 |
| g-ego-B1 | geht-2 | 69.9 | 16.6 | 25.0 | 33.4 | 9.70 | 14.2 | 13.90 |
| g-ego-B1 | Geher-Ende | { "ergebnis": { "s": -15.8, "wege": 4 }, "ms": 2 } | | | | | | |
| g-ego-B2 | steht | 85.9 | 8.4 | 16.8 | 17.0 | 3.50 | 4.8 | 11.30 |
| g-ego-B2 | geht-1 | 64.9 | 16.6 | 25.0 | 49.9 | 10.40 | 18.4 | 14.20 |
| g-ego-B2 | geht-2 | 70.0 | 16.6 | 25.0 | 33.0 | 9.80 | 14.0 | 14.00 |
| g-ego-B2 | Geher-Ende | { "ergebnis": { "s": -15.9, "wege": 4 }, "ms": 3 } | | | | | | |
| g-ego-B3 | steht | 84.7 | 8.4 | 16.8 | 16.9 | 3.70 | 5.0 | 11.40 |
| g-ego-B3 | geht-1 | 65.6 | 16.6 | 25.1 | 41.8 | 10.50 | 18.4 | 14.10 |
| g-ego-B3 | geht-2 | 70.3 | 16.6 | 25.0 | 25.3 | 9.80 | 14.1 | 13.90 |
| g-ego-B3 | Geher-Ende | { "ergebnis": { "s": -16.3, "wege": 4 }, "ms": 2 } | | | | | | |
| g-ego-B4 | steht | 84.6 | 8.4 | 16.8 | 16.9 | 3.80 | 5.1 | 11.40 |
| g-ego-B4 | geht-1 | 65.4 | 16.6 | 25.0 | 49.8 | 10.50 | 18.1 | 14.20 |
| g-ego-B4 | geht-2 | 69.7 | 16.6 | 25.0 | 33.3 | 10.00 | 14.2 | 13.90 |
| g-ego-B4 | Geher-Ende | { "ergebnis": { "s": -16, "wege": 4 }, "ms": 2 } | | | | | | |

## Mittel je Seite (A f45ee994 main · B 018945d5 Baum 8e54c6c7; gehend = Mittel aus geht-1 und geht-2 je Boot)

| Gang | Größe | A | B | Δ B − A | 2σ | Urteil |
|---|---|---|---|---|---|---|
| steht | fps | 83.6 (83.2 · 84.2 · 84.7 · 82.1) | 85.2 (85.5 · 85.9 · 84.7 · 84.6) | +1.6 | 1.9 | nicht langsamer |
| steht | Frame p50 ms | 8.4 (8.4 · 8.4 · 8.4 · 8.5) | 8.4 (8.4 · 8.4 · 8.4 · 8.4) | -0.0 | 0.1 | nicht langsamer |
| steht | Frame p95 ms | 16.8 (16.8 · 16.8 · 16.8 · 16.8) | 16.8 (16.8 · 16.8 · 16.8 · 16.8) | 0.0 | 0.0 | nicht langsamer |
| steht | Frame p99 ms | 17.0 (17.0 · 16.9 · 17.0 · 17.0) | 16.9 (16.9 · 17.0 · 16.9 · 16.9) | -0.1 | 0.1 | nicht langsamer |
| steht | CPU-Takt p50 ms | 3.63 (3.60 · 3.60 · 3.60 · 3.70) | 3.65 (3.60 · 3.50 · 3.70 · 3.80) | +0.03 | 0.20 | nicht langsamer |
| steht | CPU-Takt p95 ms | 5.0 (4.9 · 5.0 · 4.9 · 5.0) | 4.9 (4.9 · 4.8 · 5.0 · 5.1) | -0.0 | 0.2 | nicht langsamer |
| steht | GPU-Durchsatz p50 ms | 11.65 (11.70 · 11.50 · 11.50 · 11.90) | 11.35 (11.30 · 11.30 · 11.40 · 11.40) | -0.30 | 0.28 | nicht langsamer |
| geht | fps | 65.8 (66.0 · 66.3 · 66.4 · 64.3) | 67.6 (67.3 · 67.5 · 67.9 · 67.6) | +1.8 | 1.4 | nicht langsamer |
| geht | Frame p50 ms | 16.6 (16.6 · 16.6 · 16.6 · 16.6) | 16.6 (16.6 · 16.6 · 16.6 · 16.6) | 0.0 | 0.0 | nicht langsamer |
| geht | Frame p95 ms | 25.0 (25.1 · 25.0 · 25.1 · 25.1) | 25.0 (25.0 · 25.0 · 25.1 · 25.0) | -0.0 | 0.1 | nicht langsamer |
| geht | Frame p99 ms | 37.6 (33.7 · 37.5 · 41.6 · 37.6) | 39.5 (41.6 · 41.5 · 33.5 · 41.5) | +1.9 | 7.3 | nicht langsamer |
| geht | CPU-Takt p50 ms | 10.20 (10.10 · 10.20 · 10.10 · 10.40) | 10.15 (10.10 · 10.10 · 10.15 · 10.25) | -0.05 | 0.22 | nicht langsamer |
| geht | CPU-Takt p95 ms | 16.7 (16.5 · 16.2 · 16.4 · 17.6) | 16.2 (16.3 · 16.2 · 16.3 · 16.1) | -0.5 | 0.9 | nicht langsamer |
| geht | GPU-Durchsatz p50 ms | 14.47 (14.40 · 14.40 · 14.35 · 14.75) | 14.06 (14.10 · 14.10 · 14.00 · 14.05) | -0.41 | 0.27 | nicht langsamer |

**KERN-URTEIL GEHEN g-ego** (steht + geht × Frame p95 · CPU-Takt p95 · GPU-Durchsatz p50; Δ ≤ max(2σ gepoolt, Auflösung)): nicht langsamer (6 Größen)
