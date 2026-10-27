## stadt — je Boot

| Boot | Gang | fps | Frame p50 ms | Frame p95 ms | Frame p99 ms | CPU-Takt p50 ms | CPU-Takt p95 ms | CPU-Takt p99 ms | GPU-Durchsatz p50 ms | k0 p50 ms | GPU p95 ms (lauf) | GPU je Bild ms (gpu-bank) | Belegung p50 ms | Belegung p95 ms | außer Takt p95 ms | Lebenszyklus p95 ms | über 33 ms % | KI-Uhr Mittel ms | KI-Uhr p95 ms | KI-Uhr p99 ms | KI-Takt EWMA ms |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| stadt-A1 | steht | 74.4 | 16.6 | 16.8 | 25.0 | 7.20 | 11.0 | 13.5 | 13.30 | 0.20 | 2.10 | – | 10.64 | 16.53 | 1.30 | 0.13 | – | – | – | – | 3.82 |
| stadt-A1 | geht-1 | 32.9 | 25.0 | 58.4 | 149.9 | 22.40 | 54.4 | 103.0 | 23.50 | 0.14 | 2.48 | – | 23.58 | 59.67 | 4.09 | 0.13 | – | – | – | – | 3.32 |
| stadt-A1 | Geher-Ende |  | | | | | | | | | | | | | | | | | | | |
| stadt-A2 | steht | 77.6 | 16.5 | 16.8 | 17.0 | 6.00 | 7.9 | 9.8 | 12.90 | 0.20 | 2.20 | – | 8.72 | 11.72 | 0.98 | 0.09 | – | – | – | – | 2.38 |
| stadt-A2 | geht-1 | 45.9 | 16.7 | 33.4 | 83.3 | 17.00 | 34.0 | 65.3 | 18.60 | 0.14 | 2.38 | – | 18.57 | 35.80 | 2.53 | 0.08 | – | – | – | – | 3.28 |
| stadt-A2 | Geher-Ende |  | | | | | | | | | | | | | | | | | | | |
| stadt-B1 | steht | 77.5 | 16.5 | 16.8 | 17.1 | 6.20 | 8.0 | 10.5 | 12.90 | 0.20 | 2.19 | – | 8.89 | 12.28 | 1.00 | 0.08 | – | – | – | – | 2.81 |
| stadt-B1 | geht-1 | 44.2 | 16.7 | 41.6 | 83.4 | 17.70 | 35.4 | 61.7 | 19.10 | 0.14 | 2.29 | – | 19.14 | 38.55 | 2.37 | 0.09 | – | – | – | – | 4.07 |
| stadt-B1 | Geher-Ende |  | | | | | | | | | | | | | | | | | | | |
| stadt-B2 | steht | 78.7 | 16.5 | 16.8 | 17.1 | 5.70 | 7.0 | 9.3 | 12.70 | 0.20 | 1.99 | – | 8.15 | 10.74 | 0.89 | 0.08 | – | – | – | – | 2.35 |
| stadt-B2 | geht-1 | 46.5 | 16.7 | 41.5 | 75.0 | 16.80 | 33.3 | 74.6 | 18.40 | 0.14 | 2.31 | – | 18.37 | 36.81 | 2.36 | 0.08 | – | – | – | – | 3.62 |
| stadt-B2 | Geher-Ende |  | | | | | | | | | | | | | | | | | | | |

## Tier-Zensus je Boot (zensus-0 nach umstellen · zensus-1 nach geht-1)

- stadt-A1: vorher 6 (deer 5, fox 1; Würfe≥2 1: deer 5 Spanne 2.5 m @222.2 m; Verband-Feld true, Verbände≥2 1: deer 5 Spanne 2.5 m; Zustand {"-":6})
  nachher 6 (deer 5, fox 1; Würfe≥2 1: deer 5 Spanne 2.4 m @222.8 m; Verband-Feld true, Verbände≥2 1: deer 5 Spanne 2.4 m; Zustand {"-":6})
- stadt-A2: vorher 6 (deer 5, fox 1; Würfe≥2 1: deer 5 Spanne 2.5 m @222.1 m; Verband-Feld true, Verbände≥2 1: deer 5 Spanne 2.5 m; Zustand {"-":6})
  nachher 6 (deer 5, fox 1; Würfe≥2 1: deer 5 Spanne 2.4 m @222.8 m; Verband-Feld true, Verbände≥2 1: deer 5 Spanne 2.4 m; Zustand {"-":6})
- stadt-B1: vorher 6 (deer 5, fox 1; Würfe≥2 1: deer 5 Spanne 2.6 m @222.2 m; Verband-Feld true, Verbände≥2 1: deer 5 Spanne 2.6 m; Zustand {"-":6})
  nachher 6 (deer 5, fox 1; Würfe≥2 1: deer 5 Spanne 2.3 m @222.9 m; Verband-Feld true, Verbände≥2 1: deer 5 Spanne 2.3 m; Zustand {"-":6})
- stadt-B2: vorher 6 (deer 5, fox 1; Würfe≥2 1: deer 5 Spanne 2.4 m @222.2 m; Verband-Feld true, Verbände≥2 1: deer 5 Spanne 2.4 m; Zustand {"-":6})
  nachher 6 (deer 5, fox 1; Würfe≥2 1: deer 5 Spanne 2.4 m @222.9 m; Verband-Feld true, Verbände≥2 1: deer 5 Spanne 2.4 m; Zustand {"-":6})

## GPU-Takt je Boot (nvidia-smi 1 s, nur P0-Sekunden: Median-MHz · Anteil Drossel (Grund ≠ 0 ohne GpuIdle 0x1) · max °C)

- stadt-A1: 175 s · 1721 MHz · Drossel 14 % · 87 °C
- stadt-A2: 164 s · 1721 MHz · Drossel 23 % · 87 °C
- stadt-B1: 186 s · 1708 MHz · Drossel 17 % · 87 °C
- stadt-B2: 186 s · 1708 MHz · Drossel 17 % · 86 °C

## Mittel je Seite (A f1faa046 · B 19606f2e; gehend = geht-1 je Boot)

| Gang | Größe | A | B | Δ B − A | 2σ | t (Welch) | Urteil |
|---|---|---|---|---|---|---|---|
| steht | fps | 76.0 (74.4 · 77.6) | 78.1 (77.5 · 78.7) | +2.1 | 3.4 | 1.23 | nicht langsamer |
| steht | Frame p50 ms | 16.6 (16.6 · 16.5) | 16.5 (16.5 · 16.5) | -0.1 | 0.1 | -1.00 | nicht langsamer |
| steht | Frame p95 ms | 16.8 (16.8 · 16.8) | 16.8 (16.8 · 16.8) | 0.0 | 0.0 | – | nicht langsamer |
| steht | Frame p99 ms | 21.0 (25.0 · 17.0) | 17.1 (17.1 · 17.1) | -3.9 | 8.0 | -0.97 | nicht langsamer |
| steht | CPU-Takt p50 ms | 6.60 (7.20 · 6.00) | 5.95 (6.20 · 5.70) | -0.65 | 1.30 | -1.00 | nicht langsamer |
| steht | CPU-Takt p95 ms | 9.4 (11.0 · 7.9) | 7.5 (8.0 · 7.0) | -1.9 | 3.3 | -1.20 | nicht langsamer |
| steht | CPU-Takt p99 ms | 11.7 (13.5 · 9.8) | 9.9 (10.5 · 9.3) | -1.8 | 3.9 | -0.90 | nicht langsamer |
| steht | GPU-Durchsatz p50 ms | 13.10 (13.30 · 12.90) | 12.80 (12.90 · 12.70) | -0.30 | 0.45 | -1.34 | nicht langsamer |
| steht | k0 p50 ms | 0.20 (0.20 · 0.20) | 0.20 (0.20 · 0.20) | 0.00 | 0.00 | – | nicht langsamer |
| steht | GPU p95 ms (lauf) | 2.15 (2.10 · 2.20) | 2.09 (2.19 · 1.99) | -0.06 | 0.22 | -0.54 | nicht langsamer |
| steht | GPU je Bild ms (gpu-bank) | – (– · –) | – (– · –) | – | – | – | – |
| steht | Belegung p50 ms | 9.68 (10.64 · 8.72) | 8.52 (8.89 · 8.15) | -1.16 | 2.06 | -1.13 | nicht langsamer |
| steht | Belegung p95 ms | 14.13 (16.53 · 11.72) | 11.51 (12.28 · 10.74) | -2.62 | 5.05 | -1.04 | nicht langsamer |
| steht | außer Takt p95 ms | 1.14 (1.30 · 0.98) | 0.95 (1.00 · 0.89) | -0.20 | 0.34 | -1.15 | nicht langsamer |
| steht | Lebenszyklus p95 ms | 0.11 (0.13 · 0.09) | 0.08 (0.08 · 0.08) | -0.03 | 0.04 | -1.50 | nicht langsamer |
| steht | über 33 ms % | – (– · –) | – (– · –) | – | – | – | – |
| steht | KI-Uhr Mittel ms | – (– · –) | – (– · –) | – | – | – | – |
| steht | KI-Uhr p95 ms | – (– · –) | – (– · –) | – | – | – | – |
| steht | KI-Uhr p99 ms | – (– · –) | – (– · –) | – | – | – | – |
| steht | KI-Takt EWMA ms | 3.10 (3.82 · 2.38) | 2.58 (2.81 · 2.35) | -0.52 | 1.51 | -0.69 | nicht langsamer |
| geht | fps | 39.4 (32.9 · 45.9) | 45.4 (44.2 · 46.5) | +6.0 | 13.2 | 0.90 | nicht langsamer |
| geht | Frame p50 ms | 20.9 (25.0 · 16.7) | 16.7 (16.7 · 16.7) | -4.2 | 8.3 | -1.00 | nicht langsamer |
| geht | Frame p95 ms | 45.9 (58.4 · 33.4) | 41.5 (41.6 · 41.5) | -4.4 | 25.0 | -0.35 | nicht langsamer |
| geht | Frame p99 ms | 116.6 (149.9 · 83.3) | 79.2 (83.4 · 75.0) | -37.4 | 67.1 | -1.11 | nicht langsamer |
| geht | CPU-Takt p50 ms | 19.70 (22.40 · 17.00) | 17.25 (17.70 · 16.80) | -2.45 | 5.47 | -0.90 | nicht langsamer |
| geht | CPU-Takt p95 ms | 44.2 (54.4 · 34.0) | 34.3 (35.4 · 33.3) | -9.9 | 20.5 | -0.96 | nicht langsamer |
| geht | CPU-Takt p99 ms | 84.2 (103.0 · 65.3) | 68.2 (61.7 · 74.6) | -16.0 | 39.8 | -0.80 | nicht langsamer |
| geht | GPU-Durchsatz p50 ms | 21.05 (23.50 · 18.60) | 18.75 (19.10 · 18.40) | -2.30 | 4.95 | -0.93 | nicht langsamer |
| geht | k0 p50 ms | 0.14 (0.14 · 0.14) | 0.14 (0.14 · 0.14) | 0.00 | 0.00 | – | nicht langsamer |
| geht | GPU p95 ms (lauf) | 2.43 (2.48 · 2.38) | 2.30 (2.29 · 2.31) | -0.13 | 0.10 | -2.55 | nicht langsamer |
| geht | GPU je Bild ms (gpu-bank) | – (– · –) | – (– · –) | – | – | – | – |
| geht | Belegung p50 ms | 21.07 (23.58 · 18.57) | 18.76 (19.14 · 18.37) | -2.32 | 5.07 | -0.92 | nicht langsamer |
| geht | Belegung p95 ms | 47.73 (59.67 · 35.80) | 37.68 (38.55 · 36.81) | -10.05 | 23.93 | -0.84 | nicht langsamer |
| geht | außer Takt p95 ms | 3.31 (4.09 · 2.53) | 2.37 (2.37 · 2.36) | -0.94 | 1.56 | -1.21 | nicht langsamer |
| geht | Lebenszyklus p95 ms | 0.11 (0.13 · 0.08) | 0.08 (0.09 · 0.08) | -0.02 | 0.05 | -0.78 | nicht langsamer |
| geht | über 33 ms % | – (– · –) | – (– · –) | – | – | – | – |
| geht | KI-Uhr Mittel ms | – (– · –) | – (– · –) | – | – | – | – |
| geht | KI-Uhr p95 ms | – (– · –) | – (– · –) | – | – | – | – |
| geht | KI-Uhr p99 ms | – (– · –) | – (– · –) | – | – | – | – |
| geht | KI-Takt EWMA ms | 3.30 (3.32 · 3.28) | 3.85 (4.07 · 3.62) | +0.55 | 0.45 | 2.41 | LANGSAMER |

**KERN-URTEIL GEHEN stadt** (steht + geht × fps · Frame p95 · CPU-Takt p95 · GPU je Bild (gpu-bank, nur steht) · Belegung p95; Δ ≤ max(2σ gepoolt, Auflösung)): nicht langsamer (8 Größen)
