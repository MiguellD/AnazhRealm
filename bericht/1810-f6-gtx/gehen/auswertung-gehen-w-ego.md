## w-ego — je Boot

| Boot | Gang | fps | Frame p50 ms | Frame p95 ms | Frame p99 ms | CPU-Takt p50 ms | CPU-Takt p95 ms | GPU-Durchsatz p50 ms |
|---|---|---|---|---|---|---|---|---|
| w-ego-A1 | steht | 77.3 | 16.5 | 16.8 | 17.0 | 3.30 | 4.5 | 12.90 |
| w-ego-A1 | geht-1 | 59.9 | 16.7 | 25.1 | 49.9 | 11.00 | 20.6 | 15.70 |
| w-ego-A1 | geht-2 | 63.9 | 16.6 | 25.0 | 33.3 | 10.20 | 14.7 | 15.20 |
| w-ego-A1 | Geher-Ende | { "ergebnis": { "s": -16, "wege": 4 }, "ms": 2 } | | | | | | |
| w-ego-A2 | steht | 77.4 | 16.5 | 16.8 | 17.0 | 3.30 | 4.5 | 12.90 |
| w-ego-A2 | geht-1 | 60.6 | 16.6 | 25.1 | 41.8 | 11.00 | 19.7 | 15.80 |
| w-ego-A2 | geht-2 | 63.5 | 16.6 | 25.0 | 33.3 | 10.10 | 14.8 | 15.30 |
| w-ego-A2 | Geher-Ende | { "ergebnis": { "s": -16.2, "wege": 4 }, "ms": 1 } | | | | | | |
| w-ego-A3 | steht | 77.2 | 16.6 | 16.8 | 16.8 | 3.20 | 4.5 | 12.90 |
| w-ego-A3 | geht-1 | 56.1 | 16.7 | 25.1 | 50.1 | 12.20 | 23.8 | 16.50 |
| w-ego-A3 | geht-2 | 62.6 | 16.6 | 25.1 | 33.4 | 10.30 | 15.6 | 15.50 |
| w-ego-A3 | Geher-Ende | { "ergebnis": { "s": -16.1, "wege": 4 }, "ms": 1 } | | | | | | |
| w-ego-A4 | steht | 77.8 | 16.5 | 16.8 | 17.0 | 3.10 | 4.4 | 12.80 |
| w-ego-A4 | geht-1 | 61.1 | 16.6 | 25.0 | 49.9 | 10.80 | 19.3 | 15.50 |
| w-ego-A4 | geht-2 | 63.9 | 16.6 | 25.0 | 33.4 | 10.00 | 15.2 | 15.20 |
| w-ego-A4 | Geher-Ende | { "ergebnis": { "s": -16, "wege": 4 }, "ms": 1 } | | | | | | |
| w-ego-B1 | steht | 79.1 | 16.3 | 16.8 | 17.1 | 3.70 | 4.7 | 12.40 |
| w-ego-B1 | geht-1 | 53.1 | 16.7 | 25.2 | 66.7 | 14.60 | 24.9 | 17.10 |
| w-ego-B1 | geht-2 | 57.4 | 16.7 | 25.1 | 41.7 | 13.70 | 21.0 | 16.60 |
| w-ego-B1 | Geher-Ende | { "ergebnis": { "s": -16.2, "wege": 4 }, "ms": 2 } | | | | | | |
| w-ego-B2 | steht | 80.2 | 8.6 | 16.8 | 16.9 | 3.30 | 4.5 | 12.30 |
| w-ego-B2 | geht-1 | 60.7 | 16.6 | 25.1 | 41.7 | 11.20 | 20.3 | 15.40 |
| w-ego-B2 | geht-2 | 64.4 | 16.6 | 25.0 | 33.3 | 10.40 | 15.7 | 15.10 |
| w-ego-B2 | Geher-Ende | { "ergebnis": { "s": -16.1, "wege": 4 }, "ms": 3 } | | | | | | |
| w-ego-B3 | steht | 79.4 | 16.3 | 16.8 | 17.0 | 3.20 | 4.4 | 12.40 |
| w-ego-B3 | geht-1 | 61.5 | 16.6 | 25.1 | 49.9 | 10.70 | 20.0 | 15.40 |
| w-ego-B3 | geht-2 | 64.3 | 16.6 | 25.0 | 33.4 | 10.00 | 15.1 | 15.10 |
| w-ego-B3 | Geher-Ende | { "ergebnis": { "s": -16.2, "wege": 4 }, "ms": 2 } | | | | | | |
| w-ego-B4 | steht | 80.3 | 8.6 | 16.8 | 17.0 | 3.20 | 4.4 | 12.30 |
| w-ego-B4 | geht-1 | 61.0 | 16.6 | 25.1 | 41.7 | 11.00 | 19.6 | 15.40 |
| w-ego-B4 | geht-2 | 64.7 | 16.6 | 25.0 | 33.3 | 10.30 | 15.1 | 15.10 |
| w-ego-B4 | Geher-Ende | { "ergebnis": { "s": -16.1, "wege": 4 }, "ms": 2 } | | | | | | |

## Mittel je Seite (A f45ee994 main · B 018945d5 Baum 8e54c6c7; gehend = Mittel aus geht-1 und geht-2 je Boot)

| Gang | Größe | A | B | Δ B − A | 2σ | Urteil |
|---|---|---|---|---|---|---|
| steht | fps | 77.4 (77.3 · 77.4 · 77.2 · 77.8) | 79.8 (79.1 · 80.2 · 79.4 · 80.3) | +2.3 | 0.9 | nicht langsamer |
| steht | Frame p50 ms | 16.5 (16.5 · 16.5 · 16.6 · 16.5) | 12.5 (16.3 · 8.6 · 16.3 · 8.6) | -4.1 | 6.3 | nicht langsamer |
| steht | Frame p95 ms | 16.8 (16.8 · 16.8 · 16.8 · 16.8) | 16.8 (16.8 · 16.8 · 16.8 · 16.8) | 0.0 | 0.0 | nicht langsamer |
| steht | Frame p99 ms | 16.9 (17.0 · 17.0 · 16.8 · 17.0) | 17.0 (17.1 · 16.9 · 17.0 · 17.0) | +0.1 | 0.2 | nicht langsamer |
| steht | CPU-Takt p50 ms | 3.23 (3.30 · 3.30 · 3.20 · 3.10) | 3.35 (3.70 · 3.30 · 3.20 · 3.20) | +0.12 | 0.36 | nicht langsamer |
| steht | CPU-Takt p95 ms | 4.5 (4.5 · 4.5 · 4.5 · 4.4) | 4.5 (4.7 · 4.5 · 4.4 · 4.4) | +0.0 | 0.2 | nicht langsamer |
| steht | GPU-Durchsatz p50 ms | 12.88 (12.90 · 12.90 · 12.90 · 12.80) | 12.35 (12.40 · 12.30 · 12.40 · 12.30) | -0.52 | 0.11 | nicht langsamer |
| geht | fps | 61.4 (61.9 · 62.0 · 59.4 · 62.5) | 60.9 (55.3 · 62.6 · 62.9 · 62.9) | -0.6 | 5.7 | nicht langsamer |
| geht | Frame p50 ms | 16.6 (16.6 · 16.6 · 16.6 · 16.6) | 16.6 (16.7 · 16.6 · 16.6 · 16.6) | 0.0 | 0.1 | nicht langsamer |
| geht | Frame p95 ms | 25.1 (25.1 · 25.1 · 25.1 · 25.0) | 25.1 (25.1 · 25.1 · 25.1 · 25.1) | +0.0 | 0.1 | nicht langsamer |
| geht | Frame p99 ms | 40.6 (41.6 · 37.5 · 41.8 · 41.6) | 42.7 (54.2 · 37.5 · 41.6 · 37.5) | +2.1 | 11.6 | nicht langsamer |
| geht | CPU-Takt p50 ms | 10.70 (10.60 · 10.55 · 11.25 · 10.40) | 11.49 (14.15 · 10.80 · 10.35 · 10.65) | +0.79 | 2.58 | nicht langsamer |
| geht | CPU-Takt p95 ms | 18.0 (17.6 · 17.3 · 19.7 · 17.3) | 19.0 (22.9 · 18.0 · 17.6 · 17.4) | +1.0 | 4.1 | nicht langsamer |
| geht | GPU-Durchsatz p50 ms | 15.59 (15.45 · 15.55 · 16.00 · 15.35) | 15.65 (16.85 · 15.25 · 15.25 · 15.25) | +0.06 | 1.20 | nicht langsamer |

**KERN-URTEIL GEHEN w-ego** (steht + geht × Frame p95 · CPU-Takt p95 · GPU-Durchsatz p50; Δ ≤ max(2σ gepoolt, Auflösung)): nicht langsamer (6 Größen)
