## stadt — je Boot

| Boot | Gang | fps | Frame p50 ms | Frame p95 ms | Frame p99 ms | CPU-Takt p50 ms | CPU-Takt p95 ms | CPU-Takt p99 ms | GPU-Durchsatz p50 ms | k0 p50 ms | GPU p95 ms (lauf) | GPU je Bild ms (gpu-bank) | Belegung p50 ms | Belegung p95 ms | außer Takt p95 ms | Lebenszyklus p95 ms | über 33 ms % | KI-Uhr Mittel ms | KI-Uhr p95 ms | KI-Uhr p99 ms | KI-Takt EWMA ms |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| stadt-A1 | steht | 71.0 | 16.6 | 16.9 | 25.0 | 7.40 | 9.5 | 13.7 | 14.20 | 0.24 | 2.12 | – | 10.86 | 14.19 | 1.50 | 0.08 | – | – | – | – | 2.88 |
| stadt-A1 | geht-1 | 38.8 | 25.0 | 49.9 | 91.6 | 20.90 | 43.5 | 87.8 | 21.90 | 0.13 | 2.39 | – | 22.01 | 48.08 | 3.67 | 0.09 | – | – | – | – | 3.68 |
| stadt-A1 | Geher-Ende |  | | | | | | | | | | | | | | | | | | | |
| stadt-A2 | steht | 70.5 | 16.6 | 16.9 | 25.0 | 7.50 | 9.6 | 12.7 | 14.30 | 0.24 | 2.06 | – | 11.20 | 14.32 | 1.52 | 0.08 | – | – | – | – | 2.81 |
| stadt-A2 | geht-1 | 39.6 | 25.0 | 49.9 | 91.6 | 20.50 | 40.3 | 89.6 | 21.70 | 0.12 | 2.40 | – | 21.78 | 46.05 | 3.65 | 0.09 | – | – | – | – | 5.19 |
| stadt-A2 | Geher-Ende |  | | | | | | | | | | | | | | | | | | | |
| stadt-B1 | steht | 70.9 | 16.6 | 16.8 | 25.0 | 7.50 | 9.3 | 12.3 | 14.30 | 0.23 | 2.05 | – | 11.10 | 13.98 | 1.31 | 0.08 | – | – | – | – | 2.95 |
| stadt-B1 | geht-1 | 38.4 | 25.0 | 49.9 | 91.7 | 21.40 | 41.3 | 90.4 | 22.70 | 0.11 | 2.51 | – | 22.63 | 46.95 | 3.82 | 0.09 | – | – | – | – | 3.46 |
| stadt-B1 | Geher-Ende |  | | | | | | | | | | | | | | | | | | | |
| stadt-B2 | steht | 71.2 | 16.6 | 16.9 | 25.0 | 7.40 | 9.3 | 12.8 | 14.20 | 0.24 | 2.22 | – | 11.05 | 14.28 | 1.54 | 0.08 | – | – | – | – | 2.45 |
| stadt-B2 | geht-1 | 39.3 | 25.0 | 49.9 | 83.2 | 21.00 | 40.7 | 76.2 | 22.40 | 0.10 | 2.49 | – | 22.38 | 46.38 | 3.21 | 0.10 | – | – | – | – | 6.38 |
| stadt-B2 | Geher-Ende |  | | | | | | | | | | | | | | | | | | | |

## Tier-Zensus je Boot (zensus-0 nach umstellen · zensus-1 nach geht-1)

- stadt-A1: vorher 9 (deer 4, wolf 5; Würfe≥2 2: deer 4 Spanne 2.1 m @220.5 m | wolf 5 Spanne 1.9 m @468.6 m; Verband-Feld true, Verbände≥2 2: deer 4 Spanne 2.1 m | wolf 5 Spanne 1.9 m; Zustand {"flucht":4,"fressen":3,"-":2})
  nachher 9 (wolf 4, deer 5; Würfe≥2 2: wolf 4 Spanne 1.9 m @467.3 m | deer 5 Spanne 3.2 m @400.1 m; Verband-Feld true, Verbände≥2 2: wolf 4 Spanne 1.9 m | deer 5 Spanne 3.2 m; Zustand {"-":7,"fressen":2})
- stadt-A2: vorher 11 (deer 5, wolf 6; Würfe≥2 2: deer 5 Spanne 2.4 m @174.2 m | wolf 6 Spanne 3.9 m @466.7 m; Verband-Feld true, Verbände≥2 2: deer 5 Spanne 2.4 m | wolf 6 Spanne 3.9 m; Zustand {"flucht":5,"-":6})
  nachher 12 (wolf 4, deer 8; Würfe≥2 3: wolf 4 Spanne 2 m @465.8 m | deer 5 Spanne 2.8 m @405.7 m | deer 3 Spanne 2.7 m @309.4 m; Verband-Feld true, Verbände≥2 3: wolf 4 Spanne 2 m | deer 5 Spanne 2.8 m | deer 3 Spanne 2.7 m; Zustand {"fressen":3,"-":9})
- stadt-B1: vorher 6 (deer 2, wolf 4; Würfe≥2 2: deer 2 Spanne 3 m @104.8 m | wolf 4 Spanne 2 m @466.4 m; Verband-Feld true, Verbände≥2 2: deer 2 Spanne 3 m | wolf 4 Spanne 2 m; Zustand {"flucht":2,"fressen":4})
  nachher 9 (wolf 4, deer 5; Würfe≥2 2: wolf 4 Spanne 2 m @466.4 m | deer 5 Spanne 3.7 m @399.8 m; Verband-Feld true, Verbände≥2 2: wolf 4 Spanne 2 m | deer 5 Spanne 3.7 m; Zustand {"-":9})
- stadt-B2: vorher 11 (deer 5, wolf 6; Würfe≥2 2: deer 5 Spanne 2.3 m @174.6 m | wolf 6 Spanne 4 m @466.7 m; Verband-Feld true, Verbände≥2 2: deer 5 Spanne 2.3 m | wolf 6 Spanne 4 m; Zustand {"flucht":5,"-":6})
  nachher 12 (wolf 4, deer 8; Würfe≥2 3: wolf 4 Spanne 1.9 m @465.9 m | deer 3 Spanne 2.3 m @307.4 m | deer 5 Spanne 3.6 m @400.7 m; Verband-Feld true, Verbände≥2 3: wolf 4 Spanne 1.9 m | deer 3 Spanne 2.3 m | deer 5 Spanne 3.6 m; Zustand {"fressen":3,"-":9})

## GPU-Takt je Boot (nvidia-smi 1 s, nur P0-Sekunden: Median-MHz · Anteil Drossel (Grund ≠ 0 ohne GpuIdle 0x1) · max °C)

- stadt-A1: 163 s · 1759 MHz · Drossel 28 % · 85 °C
- stadt-A2: 159 s · 1746 MHz · Drossel 22 % · 86 °C
- stadt-B1: 174 s · 1746 MHz · Drossel 25 % · 86 °C
- stadt-B2: 147 s · 1759 MHz · Drossel 24 % · 86 °C

## Mittel je Seite (A e0139769 · B ab040980; gehend = geht-1 je Boot)

| Gang | Größe | A | B | Δ B − A | 2σ | t (Welch) | Urteil |
|---|---|---|---|---|---|---|---|
| steht | fps | 70.8 (71.0 · 70.5) | 71.1 (70.9 · 71.2) | +0.3 | 0.6 | 1.03 | nicht langsamer |
| steht | Frame p50 ms | 16.6 (16.6 · 16.6) | 16.6 (16.6 · 16.6) | 0.0 | 0.0 | – | nicht langsamer |
| steht | Frame p95 ms | 16.9 (16.9 · 16.9) | 16.9 (16.8 · 16.9) | -0.0 | 0.1 | -1.00 | nicht langsamer |
| steht | Frame p99 ms | 25.0 (25.0 · 25.0) | 25.0 (25.0 · 25.0) | 0.0 | 0.0 | – | nicht langsamer |
| steht | CPU-Takt p50 ms | 7.45 (7.40 · 7.50) | 7.45 (7.50 · 7.40) | 0.00 | 0.14 | 0.00 | nicht langsamer |
| steht | CPU-Takt p95 ms | 9.6 (9.5 · 9.6) | 9.3 (9.3 · 9.3) | -0.3 | 0.1 | -5.00 | nicht langsamer |
| steht | CPU-Takt p99 ms | 13.2 (13.7 · 12.7) | 12.6 (12.3 · 12.8) | -0.6 | 1.1 | -1.16 | nicht langsamer |
| steht | GPU-Durchsatz p50 ms | 14.25 (14.20 · 14.30) | 14.25 (14.30 · 14.20) | 0.00 | 0.14 | 0.00 | nicht langsamer |
| steht | k0 p50 ms | 0.24 (0.24 · 0.24) | 0.23 (0.23 · 0.24) | -0.01 | 0.01 | -1.00 | nicht langsamer |
| steht | GPU p95 ms (lauf) | 2.09 (2.12 · 2.06) | 2.13 (2.05 · 2.22) | +0.04 | 0.18 | 0.50 | nicht langsamer |
| steht | GPU je Bild ms (gpu-bank) | – (– · –) | – (– · –) | – | – | – | – |
| steht | Belegung p50 ms | 11.03 (10.86 · 11.20) | 11.07 (11.10 · 11.05) | +0.04 | 0.34 | 0.26 | nicht langsamer |
| steht | Belegung p95 ms | 14.25 (14.19 · 14.32) | 14.13 (13.98 · 14.28) | -0.13 | 0.33 | -0.76 | nicht langsamer |
| steht | außer Takt p95 ms | 1.51 (1.50 · 1.52) | 1.43 (1.31 · 1.54) | -0.08 | 0.23 | -0.74 | nicht langsamer |
| steht | Lebenszyklus p95 ms | 0.08 (0.08 · 0.08) | 0.08 (0.08 · 0.08) | 0.00 | 0.00 | – | nicht langsamer |
| steht | über 33 ms % | – (– · –) | – (– · –) | – | – | – | – |
| steht | KI-Uhr Mittel ms | – (– · –) | – (– · –) | – | – | – | – |
| steht | KI-Uhr p95 ms | – (– · –) | – (– · –) | – | – | – | – |
| steht | KI-Uhr p99 ms | – (– · –) | – (– · –) | – | – | – | – |
| steht | KI-Takt EWMA ms | 2.84 (2.88 · 2.81) | 2.70 (2.95 · 2.45) | -0.14 | 0.50 | -0.57 | nicht langsamer |
| geht | fps | 39.2 (38.8 · 39.6) | 38.8 (38.4 · 39.3) | -0.4 | 1.2 | -0.58 | nicht langsamer |
| geht | Frame p50 ms | 25.0 (25.0 · 25.0) | 25.0 (25.0 · 25.0) | 0.0 | 0.0 | – | nicht langsamer |
| geht | Frame p95 ms | 49.9 (49.9 · 49.9) | 49.9 (49.9 · 49.9) | 0.0 | 0.0 | – | nicht langsamer |
| geht | Frame p99 ms | 91.6 (91.6 · 91.6) | 87.5 (91.7 · 83.2) | -4.1 | 8.5 | -0.98 | nicht langsamer |
| geht | CPU-Takt p50 ms | 20.70 (20.90 · 20.50) | 21.20 (21.40 · 21.00) | +0.50 | 0.57 | 1.77 | nicht langsamer |
| geht | CPU-Takt p95 ms | 41.9 (43.5 · 40.3) | 41.0 (41.3 · 40.7) | -0.9 | 3.3 | -0.55 | nicht langsamer |
| geht | CPU-Takt p99 ms | 88.7 (87.8 · 89.6) | 83.3 (90.4 · 76.2) | -5.4 | 14.3 | -0.75 | nicht langsamer |
| geht | GPU-Durchsatz p50 ms | 21.80 (21.90 · 21.70) | 22.55 (22.70 · 22.40) | +0.75 | 0.36 | 4.16 | LANGSAMER |
| geht | k0 p50 ms | 0.13 (0.13 · 0.12) | 0.11 (0.11 · 0.10) | -0.02 | 0.01 | -2.83 | nicht langsamer |
| geht | GPU p95 ms (lauf) | 2.40 (2.39 · 2.40) | 2.50 (2.51 · 2.49) | +0.10 | 0.02 | 9.39 | LANGSAMER |
| geht | GPU je Bild ms (gpu-bank) | – (– · –) | – (– · –) | – | – | – | – |
| geht | Belegung p50 ms | 21.90 (22.01 · 21.78) | 22.50 (22.63 · 22.38) | +0.61 | 0.34 | 3.59 | LANGSAMER |
| geht | Belegung p95 ms | 47.06 (48.08 · 46.05) | 46.67 (46.95 · 46.38) | -0.40 | 2.11 | -0.38 | nicht langsamer |
| geht | außer Takt p95 ms | 3.66 (3.67 · 3.65) | 3.51 (3.82 · 3.21) | -0.15 | 0.61 | -0.48 | nicht langsamer |
| geht | Lebenszyklus p95 ms | 0.09 (0.09 · 0.09) | 0.10 (0.09 · 0.10) | +0.01 | 0.01 | 1.00 | nicht langsamer |
| geht | über 33 ms % | – (– · –) | – (– · –) | – | – | – | – |
| geht | KI-Uhr Mittel ms | – (– · –) | – (– · –) | – | – | – | – |
| geht | KI-Uhr p95 ms | – (– · –) | – (– · –) | – | – | – | – |
| geht | KI-Uhr p99 ms | – (– · –) | – (– · –) | – | – | – | – |
| geht | KI-Takt EWMA ms | 4.44 (3.68 · 5.19) | 4.92 (3.46 · 6.38) | +0.48 | 3.29 | 0.30 | nicht langsamer |

**KERN-URTEIL GEHEN stadt** (steht + geht × fps · Frame p95 · CPU-Takt p95 · GPU je Bild (gpu-bank, nur steht) · Belegung p95; Δ ≤ max(2σ gepoolt, Auflösung)): nicht langsamer (8 Größen)
