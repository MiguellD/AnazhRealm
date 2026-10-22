## stadt — je Boot

| Boot | Gang | fps | Frame p50 ms | Frame p95 ms | Frame p99 ms | CPU-Takt p50 ms | CPU-Takt p95 ms | CPU-Takt p99 ms | GPU-Durchsatz p50 ms | k0 p50 ms | GPU p95 ms (lauf) | GPU je Bild ms (gpu-bank) | Belegung p50 ms | Belegung p95 ms | außer Takt p95 ms | Lebenszyklus p95 ms | über 33 ms % | KI-Uhr Mittel ms | KI-Uhr p95 ms | KI-Uhr p99 ms | KI-Takt EWMA ms |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| stadt-A1 | steht | 78.1 | 16.3 | 16.8 | 25.0 | 5.10 | 7.0 | 12.5 | 12.60 | 0.23 | 3.34 | – | 7.22 | 10.44 | 0.87 | 0.10 | – | – | – | – | 2.27 |
| stadt-A1 | geht-1 | 3.1 | 333.3 | 458.4 | 524.9 | 325.60 | 453.0 | 502.1 | 325.80 | 0.33 | 4.64 | – | 333.06 | 458.28 | 41.48 | 0.68 | – | – | – | – | 260.12 |
| stadt-A1 | Geher-Ende |  | | | | | | | | | | | | | | | | | | | |
| stadt-A2 | steht | 78.2 | 16.4 | 16.8 | 25.0 | 5.20 | 7.3 | 13.3 | 12.70 | 0.21 | 3.36 | – | 7.28 | 11.05 | 1.26 | 0.10 | – | – | – | – | 2.41 |
| stadt-A2 | geht-1 | 3.2 | 325.0 | 475.0 | 508.3 | 316.80 | 448.3 | 482.7 | 311.90 | 0.31 | 2.65 | – | 323.93 | 486.49 | 49.90 | 0.57 | – | – | – | – | 268.08 |
| stadt-A2 | Geher-Ende |  | | | | | | | | | | | | | | | | | | | |
| stadt-B1 | steht | 78.7 | 9.5 | 16.8 | 17.1 | 5.00 | 6.6 | 8.7 | 12.50 | 0.22 | 3.27 | – | 7.06 | 9.87 | 0.83 | 0.10 | – | – | – | – | 2.30 |
| stadt-B1 | geht-1 | 34.4 | 25.0 | 58.4 | 100.0 | 22.60 | 52.8 | 80.0 | 24.10 | 0.35 | 2.53 | – | 24.10 | 58.78 | 4.91 | 0.14 | – | – | – | – | 1.86 |
| stadt-B1 | Geher-Ende |  | | | | | | | | | | | | | | | | | | | |
| stadt-B2 | steht | 78.6 | 14.9 | 16.8 | 17.1 | 5.00 | 6.5 | 8.9 | 12.50 | 0.22 | 3.35 | – | 7.04 | 9.52 | 0.77 | 0.10 | – | – | – | – | 2.08 |
| stadt-B2 | geht-1 | 34.8 | 25.0 | 58.2 | 99.9 | 23.20 | 49.4 | 90.1 | 24.60 | 0.35 | 2.51 | – | 24.65 | 55.50 | 4.24 | 0.14 | – | – | – | – | 1.78 |
| stadt-B2 | Geher-Ende |  | | | | | | | | | | | | | | | | | | | |

## Tier-Zensus je Boot (zensus-0 nach umstellen · zensus-1 nach geht-1)

- stadt-A1: vorher 7 (bear 3, deer 4; Würfe≥2 1: deer 4 Spanne 2.3 m @182.4 m; Verband-Feld true, Verbände≥2 1: deer 4 Spanne 2.3 m; Zustand {"-":7})
  nachher 7 (bear 3, deer 4; Würfe≥2 1: deer 4 Spanne 2.4 m @179.7 m; Verband-Feld true, Verbände≥2 1: deer 4 Spanne 2.4 m; Zustand {"-":7})
- stadt-A2: vorher 7 (bear 3, deer 4; Würfe≥2 1: deer 4 Spanne 3.2 m @184.1 m; Verband-Feld true, Verbände≥2 1: deer 4 Spanne 3.2 m; Zustand {"-":7})
  nachher 7 (bear 3, deer 4; Würfe≥2 1: deer 4 Spanne 3.1 m @180.7 m; Verband-Feld true, Verbände≥2 1: deer 4 Spanne 3.1 m; Zustand {"-":7})
- stadt-B1: vorher 7 (bear 3, deer 4; Würfe≥2 1: deer 4 Spanne 2.8 m @181.8 m; Verband-Feld true, Verbände≥2 1: deer 4 Spanne 2.8 m; Zustand {"-":7})
  nachher 7 (bear 3, deer 4; Würfe≥2 1: deer 4 Spanne 3.1 m @181 m; Verband-Feld true, Verbände≥2 1: deer 4 Spanne 3.1 m; Zustand {"-":7})
- stadt-B2: vorher 7 (bear 3, deer 4; Würfe≥2 1: deer 4 Spanne 2.2 m @182.4 m; Verband-Feld true, Verbände≥2 1: deer 4 Spanne 2.2 m; Zustand {"-":7})
  nachher 7 (bear 3, deer 4; Würfe≥2 1: deer 4 Spanne 2.4 m @181.8 m; Verband-Feld true, Verbände≥2 1: deer 4 Spanne 2.4 m; Zustand {"-":7})

## GPU-Takt je Boot (nvidia-smi 1 s, nur P0-Sekunden: Median-MHz · Anteil Drossel (Grund ≠ 0 ohne GpuIdle 0x1) · max °C)

- stadt-A1: 158 s · 1607 MHz · Drossel 15 % · 86 °C
- stadt-A2: 192 s · 1404 MHz · Drossel 14 % · 86 °C
- stadt-B1: 145 s · 1759 MHz · Drossel 13 % · 86 °C
- stadt-B2: 158 s · 1759 MHz · Drossel 18 % · 86 °C

## Mittel je Seite (A 73f28224 main · B 1ef4042c zug; gehend = geht-1 je Boot)

| Gang | Größe | A | B | Δ B − A | 2σ | t (Welch) | Urteil |
|---|---|---|---|---|---|---|---|
| steht | fps | 78.2 (78.1 · 78.2) | 78.7 (78.7 · 78.6) | +0.5 | 0.1 | 7.07 | nicht langsamer |
| steht | Frame p50 ms | 16.4 (16.3 · 16.4) | 12.2 (9.5 · 14.9) | -4.2 | 5.4 | -1.54 | nicht langsamer |
| steht | Frame p95 ms | 16.8 (16.8 · 16.8) | 16.8 (16.8 · 16.8) | 0.0 | 0.0 | – | nicht langsamer |
| steht | Frame p99 ms | 25.0 (25.0 · 25.0) | 17.1 (17.1 · 17.1) | -7.9 | 0.0 | – | nicht langsamer |
| steht | CPU-Takt p50 ms | 5.15 (5.10 · 5.20) | 5.00 (5.00 · 5.00) | -0.15 | 0.10 | -3.00 | nicht langsamer |
| steht | CPU-Takt p95 ms | 7.2 (7.0 · 7.3) | 6.5 (6.6 · 6.5) | -0.6 | 0.3 | -3.79 | nicht langsamer |
| steht | CPU-Takt p99 ms | 12.9 (12.5 · 13.3) | 8.8 (8.7 · 8.9) | -4.1 | 0.8 | -9.94 | nicht langsamer |
| steht | GPU-Durchsatz p50 ms | 12.65 (12.60 · 12.70) | 12.50 (12.50 · 12.50) | -0.15 | 0.10 | -3.00 | nicht langsamer |
| steht | k0 p50 ms | 0.22 (0.23 · 0.21) | 0.22 (0.22 · 0.22) | 0.00 | 0.02 | 0.00 | nicht langsamer |
| steht | GPU p95 ms (lauf) | 3.35 (3.34 · 3.36) | 3.31 (3.27 · 3.35) | -0.04 | 0.08 | -0.97 | nicht langsamer |
| steht | GPU je Bild ms (gpu-bank) | – (– · –) | – (– · –) | – | – | – | – |
| steht | Belegung p50 ms | 7.25 (7.22 · 7.28) | 7.05 (7.06 · 7.04) | -0.20 | 0.06 | -6.32 | nicht langsamer |
| steht | Belegung p95 ms | 10.75 (10.44 · 11.05) | 9.70 (9.87 · 9.52) | -1.05 | 0.70 | -2.99 | nicht langsamer |
| steht | außer Takt p95 ms | 1.06 (0.87 · 1.26) | 0.80 (0.83 · 0.77) | -0.26 | 0.39 | -1.34 | nicht langsamer |
| steht | Lebenszyklus p95 ms | 0.10 (0.10 · 0.10) | 0.10 (0.10 · 0.10) | 0.00 | 0.00 | – | nicht langsamer |
| steht | über 33 ms % | – (– · –) | – (– · –) | – | – | – | – |
| steht | KI-Uhr Mittel ms | – (– · –) | – (– · –) | – | – | – | – |
| steht | KI-Uhr p95 ms | – (– · –) | – (– · –) | – | – | – | – |
| steht | KI-Uhr p99 ms | – (– · –) | – (– · –) | – | – | – | – |
| steht | KI-Takt EWMA ms | 2.34 (2.27 · 2.41) | 2.19 (2.30 · 2.08) | -0.15 | 0.26 | -1.15 | nicht langsamer |
| geht | fps | 3.2 (3.1 · 3.2) | 34.6 (34.4 · 34.8) | +31.4 | 0.4 | 152.55 | nicht langsamer |
| geht | Frame p50 ms | 329.1 (333.3 · 325.0) | 25.0 (25.0 · 25.0) | -304.1 | 8.3 | -73.29 | nicht langsamer |
| geht | Frame p95 ms | 466.7 (458.4 · 475.0) | 58.3 (58.4 · 58.2) | -408.4 | 16.6 | -49.20 | nicht langsamer |
| geht | Frame p99 ms | 516.6 (524.9 · 508.3) | 100.0 (100.0 · 99.9) | -416.7 | 16.6 | -50.20 | nicht langsamer |
| geht | CPU-Takt p50 ms | 321.20 (325.60 · 316.80) | 22.90 (22.60 · 23.20) | -298.30 | 8.82 | -67.64 | nicht langsamer |
| geht | CPU-Takt p95 ms | 450.6 (453.0 · 448.3) | 51.1 (52.8 · 49.4) | -399.5 | 5.8 | -137.76 | nicht langsamer |
| geht | CPU-Takt p99 ms | 492.4 (502.1 · 482.7) | 85.0 (80.0 · 90.1) | -407.3 | 21.9 | -37.25 | nicht langsamer |
| geht | GPU-Durchsatz p50 ms | 318.85 (325.80 · 311.90) | 24.35 (24.10 · 24.60) | -294.50 | 13.91 | -42.35 | nicht langsamer |
| geht | k0 p50 ms | 0.32 (0.33 · 0.31) | 0.35 (0.35 · 0.35) | +0.03 | 0.02 | 3.00 | LANGSAMER |
| geht | GPU p95 ms (lauf) | 3.64 (4.64 · 2.65) | 2.52 (2.53 · 2.51) | -1.13 | 1.99 | -1.13 | nicht langsamer |
| geht | GPU je Bild ms (gpu-bank) | – (– · –) | – (– · –) | – | – | – | – |
| geht | Belegung p50 ms | 328.50 (333.06 · 323.93) | 24.38 (24.10 · 24.65) | -304.12 | 9.15 | -66.50 | nicht langsamer |
| geht | Belegung p95 ms | 472.38 (458.28 · 486.49) | 57.14 (58.78 · 55.50) | -415.25 | 28.40 | -29.24 | nicht langsamer |
| geht | außer Takt p95 ms | 45.69 (41.48 · 49.90) | 4.58 (4.91 · 4.24) | -41.11 | 8.45 | -9.74 | nicht langsamer |
| geht | Lebenszyklus p95 ms | 0.63 (0.68 · 0.57) | 0.14 (0.14 · 0.14) | -0.48 | 0.11 | -8.82 | nicht langsamer |
| geht | über 33 ms % | – (– · –) | – (– · –) | – | – | – | – |
| geht | KI-Uhr Mittel ms | – (– · –) | – (– · –) | – | – | – | – |
| geht | KI-Uhr p95 ms | – (– · –) | – (– · –) | – | – | – | – |
| geht | KI-Uhr p99 ms | – (– · –) | – (– · –) | – | – | – | – |
| geht | KI-Takt EWMA ms | 264.10 (260.12 · 268.08) | 1.82 (1.86 · 1.78) | -262.28 | 7.96 | -65.90 | nicht langsamer |

**KERN-URTEIL GEHEN stadt** (steht + geht × fps · Frame p95 · CPU-Takt p95 · GPU je Bild (gpu-bank, nur steht) · Belegung p95; Δ ≤ max(2σ gepoolt, Auflösung)): nicht langsamer (8 Größen)
