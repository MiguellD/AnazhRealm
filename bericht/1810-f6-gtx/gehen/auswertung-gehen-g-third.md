## g-third — je Boot

| Boot | Gang | fps | Frame p50 ms | Frame p95 ms | Frame p99 ms | CPU-Takt p50 ms | CPU-Takt p95 ms | GPU-Durchsatz p50 ms |
|---|---|---|---|---|---|---|---|---|
| g-third-A1 | steht | 79.6 | 16.4 | 16.7 | 17.0 | 4.40 | 5.9 | 12.60 |
| g-third-A1 | geht-1 | 62.9 | 16.6 | 25.0 | 50.0 | 11.00 | 20.1 | 14.60 |
| g-third-A1 | geht-2 | 67.1 | 16.6 | 25.0 | 33.3 | 10.60 | 16.0 | 14.30 |
| g-third-A1 | Geher-Ende | { "ergebnis": { "s": -15.6, "wege": 4 }, "ms": 2 } | | | | | | |
| g-third-A2 | steht | 79.7 | 12.7 | 16.8 | 17.0 | 4.50 | 5.9 | 12.50 |
| g-third-A2 | geht-1 | 62.8 | 16.6 | 25.1 | 50.0 | 11.20 | 19.9 | 14.60 |
| g-third-A2 | geht-2 | 68.4 | 16.6 | 25.0 | 33.4 | 10.40 | 15.6 | 14.10 |
| g-third-A2 | Geher-Ende | { "ergebnis": { "s": -15.7, "wege": 4 }, "ms": 1 } | | | | | | |
| g-third-A3 | steht | 79.7 | 16.1 | 16.8 | 17.0 | 4.40 | 5.9 | 12.50 |
| g-third-A3 | geht-1 | 62.3 | 16.6 | 25.0 | 50.0 | 11.10 | 20.5 | 14.80 |
| g-third-A3 | geht-2 | 66.9 | 16.6 | 25.0 | 33.3 | 10.70 | 16.0 | 14.40 |
| g-third-A3 | Geher-Ende | { "ergebnis": { "s": -16, "wege": 4 }, "ms": 2 } | | | | | | |
| g-third-A4 | steht | 79.4 | 16.0 | 16.7 | 17.1 | 4.50 | 6.3 | 12.50 |
| g-third-A4 | geht-1 | 61.7 | 16.6 | 25.1 | 50.0 | 11.50 | 20.6 | 14.90 |
| g-third-A4 | geht-2 | 65.7 | 16.6 | 25.0 | 33.4 | 10.80 | 17.9 | 14.60 |
| g-third-A4 | Geher-Ende | { "ergebnis": { "s": -15.5, "wege": 4 }, "ms": 2 } | | | | | | |
| g-third-B1 | steht | 80.3 | 8.6 | 16.8 | 17.0 | 4.40 | 5.9 | 12.40 |
| g-third-B1 | geht-1 | 63.8 | 16.6 | 25.1 | 41.9 | 11.50 | 19.8 | 14.40 |
| g-third-B1 | geht-2 | 67.6 | 16.6 | 25.0 | 33.3 | 11.00 | 16.7 | 14.10 |
| g-third-B1 | Geher-Ende | { "ergebnis": { "s": -16.2, "wege": 4 }, "ms": 1 } | | | | | | |
| g-third-B2 | steht | 80.0 | 8.7 | 16.8 | 17.0 | 4.40 | 5.9 | 12.50 |
| g-third-B2 | geht-1 | 63.5 | 16.6 | 25.1 | 50.0 | 11.10 | 20.1 | 14.50 |
| g-third-B2 | geht-2 | 68.7 | 16.6 | 25.0 | 33.3 | 10.60 | 15.9 | 14.10 |
| g-third-B2 | Geher-Ende | { "ergebnis": { "s": -16.2, "wege": 4 }, "ms": 2 } | | | | | | |
| g-third-B3 | steht | 80.1 | 8.5 | 16.7 | 17.0 | 4.50 | 6.2 | 12.50 |
| g-third-B3 | geht-1 | 62.3 | 16.6 | 25.1 | 50.0 | 11.50 | 21.6 | 14.50 |
| g-third-B3 | geht-2 | 67.1 | 16.6 | 25.0 | 33.4 | 11.00 | 17.2 | 14.30 |
| g-third-B3 | Geher-Ende | { "ergebnis": { "s": -16.3, "wege": 4 }, "ms": 2 } | | | | | | |
| g-third-B4 | steht | 80.0 | 8.7 | 16.7 | 16.9 | 4.50 | 6.4 | 12.50 |
| g-third-B4 | geht-1 | 60.7 | 16.6 | 25.1 | 58.3 | 11.50 | 21.6 | 14.80 |
| g-third-B4 | geht-2 | 68.0 | 16.6 | 25.0 | 33.3 | 10.90 | 16.6 | 14.10 |
| g-third-B4 | Geher-Ende | { "ergebnis": { "s": -15.5, "wege": 4 }, "ms": 1 } | | | | | | |

## Mittel je Seite (A f45ee994 main · B 018945d5 Baum 8e54c6c7; gehend = Mittel aus geht-1 und geht-2 je Boot)

| Gang | Größe | A | B | Δ B − A | 2σ | Urteil |
|---|---|---|---|---|---|---|
| steht | fps | 79.6 (79.6 · 79.7 · 79.7 · 79.4) | 80.1 (80.3 · 80.0 · 80.1 · 80.0) | +0.5 | 0.3 | nicht langsamer |
| steht | Frame p50 ms | 15.3 (16.4 · 12.7 · 16.1 · 16.0) | 8.6 (8.6 · 8.7 · 8.5 · 8.7) | -6.7 | 2.5 | nicht langsamer |
| steht | Frame p95 ms | 16.8 (16.7 · 16.8 · 16.8 · 16.7) | 16.8 (16.8 · 16.8 · 16.7 · 16.7) | 0.0 | 0.1 | nicht langsamer |
| steht | Frame p99 ms | 17.0 (17.0 · 17.0 · 17.0 · 17.1) | 17.0 (17.0 · 17.0 · 17.0 · 16.9) | -0.0 | 0.1 | nicht langsamer |
| steht | CPU-Takt p50 ms | 4.45 (4.40 · 4.50 · 4.40 · 4.50) | 4.45 (4.40 · 4.40 · 4.50 · 4.50) | 0.00 | 0.12 | nicht langsamer |
| steht | CPU-Takt p95 ms | 6.0 (5.9 · 5.9 · 5.9 · 6.3) | 6.1 (5.9 · 5.9 · 6.2 · 6.4) | +0.1 | 0.4 | nicht langsamer |
| steht | GPU-Durchsatz p50 ms | 12.53 (12.60 · 12.50 · 12.50 · 12.50) | 12.47 (12.40 · 12.50 · 12.50 · 12.50) | -0.05 | 0.10 | nicht langsamer |
| geht | fps | 64.7 (65.0 · 65.6 · 64.6 · 63.7) | 65.2 (65.7 · 66.1 · 64.7 · 64.3) | +0.5 | 1.6 | nicht langsamer |
| geht | Frame p50 ms | 16.6 (16.6 · 16.6 · 16.6 · 16.6) | 16.6 (16.6 · 16.6 · 16.6 · 16.6) | 0.0 | 0.0 | nicht langsamer |
| geht | Frame p95 ms | 25.0 (25.0 · 25.1 · 25.0 · 25.1) | 25.1 (25.1 · 25.1 · 25.1 · 25.1) | +0.0 | 0.0 | nicht langsamer |
| geht | Frame p99 ms | 41.7 (41.6 · 41.7 · 41.6 · 41.7) | 41.7 (37.6 · 41.6 · 41.7 · 45.8) | +0.0 | 4.7 | nicht langsamer |
| geht | CPU-Takt p50 ms | 10.91 (10.80 · 10.80 · 10.90 · 11.15) | 11.14 (11.25 · 10.85 · 11.25 · 11.20) | +0.22 | 0.36 | nicht langsamer |
| geht | CPU-Takt p95 ms | 18.3 (18.1 · 17.8 · 18.3 · 19.3) | 18.7 (18.3 · 18.0 · 19.4 · 19.1) | +0.4 | 1.3 | nicht langsamer |
| geht | GPU-Durchsatz p50 ms | 14.54 (14.45 · 14.35 · 14.60 · 14.75) | 14.35 (14.25 · 14.30 · 14.40 · 14.45) | -0.19 | 0.28 | nicht langsamer |

**KERN-URTEIL GEHEN g-third** (steht + geht × Frame p95 · CPU-Takt p95 · GPU-Durchsatz p50; Δ ≤ max(2σ gepoolt, Auflösung)): nicht langsamer (6 Größen)
