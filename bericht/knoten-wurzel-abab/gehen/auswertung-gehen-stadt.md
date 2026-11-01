## stadt — je Boot

| Boot | Gang | fps | Frame p50 ms | Frame p95 ms | Frame p99 ms | CPU-Takt p50 ms | CPU-Takt p95 ms | CPU-Takt p99 ms | GPU-Durchsatz p50 ms | k0 p50 ms | GPU p95 ms (lauf) | GPU je Bild ms (gpu-bank) | Belegung p50 ms | Belegung p95 ms | außer Takt p95 ms | Lebenszyklus p95 ms | über 33 ms % | KI-Uhr Mittel ms | KI-Uhr p95 ms | KI-Uhr p99 ms | KI-Takt EWMA ms |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| stadt-A1 | steht | 67.7 | 16.6 | 24.9 | 25.1 | 7.70 | 10.9 | 15.1 | 14.80 | 0.25 | 2.55 | – | 11.58 | 16.36 | 1.74 | 0.20 | – | – | – | – | 2.28 |
| stadt-A1 | geht-1 | 34.3 | 25.0 | 50.1 | 75.1 | 24.30 | 47.6 | 71.5 | 25.10 | 0.11 | 2.45 | – | 25.11 | 52.80 | 3.36 | 0.22 | – | – | – | – | 2.69 |
| stadt-A1 | Geher-Ende |  | | | | | | | | | | | | | | | | | | | |
| stadt-A2 | steht | 65.9 | 16.6 | 25.0 | 25.2 | 8.50 | 12.7 | 18.1 | 15.00 | 0.25 | 2.67 | – | 12.34 | 18.69 | 1.69 | 0.20 | – | – | – | – | 2.68 |
| stadt-A2 | geht-1 | 32.3 | 25.1 | 58.3 | 83.4 | 26.00 | 50.1 | 77.0 | 26.80 | 0.11 | 2.45 | – | 26.95 | 55.57 | 3.11 | 0.22 | – | – | – | – | 2.94 |
| stadt-A2 | Geher-Ende |  | | | | | | | | | | | | | | | | | | | |
| stadt-B1 | steht | 68.2 | 16.6 | 17.7 | 25.1 | 7.50 | 10.0 | 14.1 | 14.70 | 0.25 | 2.64 | – | 11.38 | 15.65 | 1.66 | 0.20 | – | – | – | – | 2.64 |
| stadt-B1 | geht-1 | 34.8 | 25.0 | 50.0 | 75.1 | 24.50 | 44.5 | 65.4 | 25.30 | 0.11 | 2.49 | – | 25.43 | 50.42 | 3.29 | 0.21 | – | – | – | – | 3.05 |
| stadt-B1 | Geher-Ende |  | | | | | | | | | | | | | | | | | | | |
| stadt-B2 | steht | 69.0 | 16.6 | 17.0 | 25.1 | 7.30 | 9.9 | 13.3 | 14.60 | 0.25 | 2.62 | – | 10.95 | 15.08 | 1.64 | 0.19 | – | – | – | – | 2.54 |
| stadt-B2 | geht-1 | 36.3 | 25.0 | 50.0 | 66.7 | 23.50 | 43.0 | 55.9 | 24.40 | 0.11 | 2.45 | – | 24.40 | 48.75 | 3.21 | 0.22 | – | – | – | – | 3.45 |
| stadt-B2 | Geher-Ende |  | | | | | | | | | | | | | | | | | | | |

## Tier-Zensus je Boot (zensus-0 nach umstellen · zensus-1 nach geht-1)

- stadt-A1: vorher 7 (deer 3, wolf 4; Würfe≥2 2: deer 3 Spanne 2.1 m @143.6 m | wolf 4 Spanne 1.5 m @465.8 m; Verband-Feld true, Verbände≥2 2: deer 3 Spanne 2.1 m | wolf 4 Spanne 1.5 m; Zustand {"flucht":3,"-":3,"fressen":1})
  nachher 7 (wolf 4, deer 3; Würfe≥2 2: wolf 4 Spanne 1.8 m @465 m | deer 3 Spanne 4 m @221.3 m; Verband-Feld true, Verbände≥2 2: wolf 4 Spanne 1.8 m | deer 3 Spanne 4 m; Zustand {"-":7})
- stadt-A2: vorher 7 (deer 3, wolf 4; Würfe≥2 2: deer 3 Spanne 1.9 m @91.8 m | wolf 4 Spanne 1.7 m @465.7 m; Verband-Feld true, Verbände≥2 2: deer 3 Spanne 1.9 m | wolf 4 Spanne 1.7 m; Zustand {"flucht":3,"fressen":3,"-":1})
  nachher 7 (wolf 4, deer 3; Würfe≥2 2: wolf 4 Spanne 1.8 m @464.9 m | deer 3 Spanne 3.9 m @221.3 m; Verband-Feld true, Verbände≥2 2: wolf 4 Spanne 1.8 m | deer 3 Spanne 3.9 m; Zustand {"-":7})
- stadt-B1: vorher 7 (deer 3, wolf 4; Würfe≥2 2: deer 3 Spanne 1.9 m @97.9 m | wolf 4 Spanne 1.8 m @466.2 m; Verband-Feld true, Verbände≥2 2: deer 3 Spanne 1.9 m | wolf 4 Spanne 1.8 m; Zustand {"flucht":3,"-":2,"fressen":2})
  nachher 4 (wolf 4; Würfe≥2 1: wolf 4 Spanne 1.8 m @464.9 m; Verband-Feld true, Verbände≥2 1: wolf 4 Spanne 1.8 m; Zustand {"fressen":3,"-":1})
- stadt-B2: vorher 7 (deer 3, wolf 4; Würfe≥2 2: deer 3 Spanne 1.9 m @157.6 m | wolf 4 Spanne 1.5 m @465.7 m; Verband-Feld true, Verbände≥2 2: deer 3 Spanne 1.9 m | wolf 4 Spanne 1.5 m; Zustand {"flucht":3,"-":2,"fressen":2})
  nachher 7 (wolf 4, deer 3; Würfe≥2 2: wolf 4 Spanne 2 m @465.2 m | deer 3 Spanne 4 m @221.3 m; Verband-Feld true, Verbände≥2 2: wolf 4 Spanne 2 m | deer 3 Spanne 4 m; Zustand {"-":7})

## GPU-Takt je Boot (nvidia-smi 1 s, nur P0-Sekunden: Median-MHz · Anteil Drossel (Grund ≠ 0 ohne GpuIdle 0x1) · max °C)

- stadt-A1: 163 s · 1759 MHz · Drossel 21 % · 87 °C
- stadt-A2: 166 s · 1759 MHz · Drossel 19 % · 87 °C
- stadt-B1: 168 s · 1759 MHz · Drossel 23 % · 86 °C
- stadt-B2: 161 s · 1759 MHz · Drossel 21 % · 87 °C

## Mittel je Seite (A 1e90e7cd · B b7ea7cdc; gehend = geht-1 je Boot)

| Gang | Größe | A | B | Δ B − A | 2σ | t (Welch) | Urteil |
|---|---|---|---|---|---|---|---|
| steht | fps | 66.8 (67.7 · 65.9) | 68.6 (68.2 · 69.0) | +1.8 | 2.0 | 1.83 | nicht langsamer |
| steht | Frame p50 ms | 16.6 (16.6 · 16.6) | 16.6 (16.6 · 16.6) | 0.0 | 0.0 | – | nicht langsamer |
| steht | Frame p95 ms | 24.9 (24.9 · 25.0) | 17.4 (17.7 · 17.0) | -7.6 | 0.7 | -21.50 | nicht langsamer |
| steht | Frame p99 ms | 25.1 (25.1 · 25.2) | 25.1 (25.1 · 25.1) | -0.0 | 0.1 | -1.00 | nicht langsamer |
| steht | CPU-Takt p50 ms | 8.10 (7.70 · 8.50) | 7.40 (7.50 · 7.30) | -0.70 | 0.82 | -1.70 | nicht langsamer |
| steht | CPU-Takt p95 ms | 11.8 (10.9 · 12.7) | 9.9 (10.0 · 9.9) | -1.9 | 1.8 | -2.05 | nicht langsamer |
| steht | CPU-Takt p99 ms | 16.6 (15.1 · 18.1) | 13.7 (14.1 · 13.3) | -2.9 | 3.1 | -1.87 | nicht langsamer |
| steht | GPU-Durchsatz p50 ms | 14.90 (14.80 · 15.00) | 14.65 (14.70 · 14.60) | -0.25 | 0.22 | -2.24 | nicht langsamer |
| steht | k0 p50 ms | 0.25 (0.25 · 0.25) | 0.25 (0.25 · 0.25) | 0.00 | 0.00 | – | nicht langsamer |
| steht | GPU p95 ms (lauf) | 2.61 (2.55 · 2.67) | 2.63 (2.64 · 2.62) | +0.02 | 0.12 | 0.33 | nicht langsamer |
| steht | GPU je Bild ms (gpu-bank) | – (– · –) | – (– · –) | – | – | – | – |
| steht | Belegung p50 ms | 11.96 (11.58 · 12.34) | 11.16 (11.38 · 10.95) | -0.80 | 0.87 | -1.82 | nicht langsamer |
| steht | Belegung p95 ms | 17.52 (16.36 · 18.69) | 15.37 (15.65 · 15.08) | -2.16 | 2.40 | -1.80 | nicht langsamer |
| steht | außer Takt p95 ms | 1.71 (1.74 · 1.69) | 1.65 (1.66 · 1.64) | -0.06 | 0.05 | -2.41 | nicht langsamer |
| steht | Lebenszyklus p95 ms | 0.20 (0.20 · 0.20) | 0.20 (0.20 · 0.19) | -0.01 | 0.01 | -1.00 | nicht langsamer |
| steht | über 33 ms % | – (– · –) | – (– · –) | – | – | – | – |
| steht | KI-Uhr Mittel ms | – (– · –) | – (– · –) | – | – | – | – |
| steht | KI-Uhr p95 ms | – (– · –) | – (– · –) | – | – | – | – |
| steht | KI-Uhr p99 ms | – (– · –) | – (– · –) | – | – | – | – |
| steht | KI-Takt EWMA ms | 2.48 (2.28 · 2.68) | 2.59 (2.64 · 2.54) | +0.11 | 0.41 | 0.53 | nicht langsamer |
| geht | fps | 33.3 (34.3 · 32.3) | 35.5 (34.8 · 36.3) | +2.3 | 2.5 | 1.80 | nicht langsamer |
| geht | Frame p50 ms | 25.1 (25.0 · 25.1) | 25.0 (25.0 · 25.0) | -0.1 | 0.1 | -1.00 | nicht langsamer |
| geht | Frame p95 ms | 54.2 (50.1 · 58.3) | 50.0 (50.0 · 50.0) | -4.2 | 8.2 | -1.02 | nicht langsamer |
| geht | Frame p99 ms | 79.3 (75.1 · 83.4) | 70.9 (75.1 · 66.7) | -8.3 | 11.8 | -1.41 | nicht langsamer |
| geht | CPU-Takt p50 ms | 25.15 (24.30 · 26.00) | 24.00 (24.50 · 23.50) | -1.15 | 1.97 | -1.17 | nicht langsamer |
| geht | CPU-Takt p95 ms | 48.9 (47.6 · 50.1) | 43.8 (44.5 · 43.0) | -5.1 | 2.9 | -3.50 | nicht langsamer |
| geht | CPU-Takt p99 ms | 74.3 (71.5 · 77.0) | 60.7 (65.4 · 55.9) | -13.6 | 11.0 | -2.48 | nicht langsamer |
| geht | GPU-Durchsatz p50 ms | 25.95 (25.10 · 26.80) | 24.85 (25.30 · 24.40) | -1.10 | 1.92 | -1.14 | nicht langsamer |
| geht | k0 p50 ms | 0.11 (0.11 · 0.11) | 0.11 (0.11 · 0.11) | 0.00 | 0.00 | – | nicht langsamer |
| geht | GPU p95 ms (lauf) | 2.45 (2.45 · 2.45) | 2.47 (2.49 · 2.45) | +0.02 | 0.04 | 1.00 | nicht langsamer |
| geht | GPU je Bild ms (gpu-bank) | – (– · –) | – (– · –) | – | – | – | – |
| geht | Belegung p50 ms | 26.03 (25.11 · 26.95) | 24.91 (25.43 · 24.40) | -1.12 | 2.11 | -1.06 | nicht langsamer |
| geht | Belegung p95 ms | 54.19 (52.80 · 55.57) | 49.59 (50.42 · 48.75) | -4.60 | 3.23 | -2.84 | nicht langsamer |
| geht | außer Takt p95 ms | 3.23 (3.36 · 3.11) | 3.25 (3.29 · 3.21) | +0.02 | 0.26 | 0.11 | nicht langsamer |
| geht | Lebenszyklus p95 ms | 0.22 (0.22 · 0.22) | 0.21 (0.21 · 0.22) | -0.01 | 0.01 | -1.00 | nicht langsamer |
| geht | über 33 ms % | – (– · –) | – (– · –) | – | – | – | – |
| geht | KI-Uhr Mittel ms | – (– · –) | – (– · –) | – | – | – | – |
| geht | KI-Uhr p95 ms | – (– · –) | – (– · –) | – | – | – | – |
| geht | KI-Uhr p99 ms | – (– · –) | – (– · –) | – | – | – | – |
| geht | KI-Takt EWMA ms | 2.81 (2.69 · 2.94) | 3.25 (3.05 · 3.45) | +0.44 | 0.47 | 1.84 | nicht langsamer |

**KERN-URTEIL GEHEN stadt** (steht + geht × fps · Frame p95 · CPU-Takt p95 · GPU je Bild (gpu-bank, nur steht) · Belegung p95; Δ ≤ max(2σ gepoolt, Auflösung)): nicht langsamer (8 Größen)
