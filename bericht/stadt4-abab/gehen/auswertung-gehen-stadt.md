## stadt — je Boot

| Boot | Gang | fps | Frame p50 ms | Frame p95 ms | Frame p99 ms | CPU-Takt p50 ms | CPU-Takt p95 ms | CPU-Takt p99 ms | GPU-Durchsatz p50 ms | k0 p50 ms | GPU p95 ms (lauf) | GPU je Bild ms (gpu-bank) | Belegung p50 ms | Belegung p95 ms | außer Takt p95 ms | Lebenszyklus p95 ms | über 33 ms % | KI-Uhr Mittel ms | KI-Uhr p95 ms | KI-Uhr p99 ms | KI-Takt EWMA ms |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| stadt-A1 | steht | 58.8 | 16.7 | 25.0 | 25.2 | 8.40 | 10.5 | 14.4 | 16.90 | 0.26 | 2.65 | – | 12.88 | 16.98 | 1.62 | 0.09 | – | – | – | – | 3.09 |
| stadt-A1 | geht-1 | 35.2 | 25.0 | 50.0 | 91.6 | 23.40 | 44.6 | 88.2 | 25.00 | 0.12 | 2.53 | – | 24.96 | 50.34 | 3.39 | 0.11 | – | – | – | – | 4.24 |
| stadt-A1 | Geher-Ende |  | | | | | | | | | | | | | | | | | | | |
| stadt-A2 | steht | 57.1 | 16.7 | 25.1 | 25.2 | 9.10 | 11.5 | 15.1 | 17.00 | 0.25 | 2.54 | – | 13.80 | 19.04 | 1.66 | 0.10 | – | – | – | – | 3.76 |
| stadt-A2 | geht-1 | 34.3 | 25.0 | 50.0 | 108.4 | 23.50 | 44.4 | 103.0 | 25.00 | 0.12 | 2.56 | – | 24.91 | 50.10 | 3.07 | 0.12 | – | – | – | – | 4.06 |
| stadt-A2 | Geher-Ende |  | | | | | | | | | | | | | | | | | | | |
| stadt-B1 | steht | 59.0 | 16.7 | 25.0 | 25.1 | 8.10 | 10.3 | 12.1 | 16.90 | 0.60 | 2.55 | – | 12.21 | 15.98 | 1.53 | 0.08 | – | – | – | – | 2.50 |
| stadt-B1 | geht-1 | 35.2 | 25.0 | 50.0 | 91.7 | 23.60 | 42.6 | 84.1 | 25.40 | 0.12 | 2.57 | – | 25.42 | 47.92 | 3.90 | 0.11 | – | – | – | – | 2.47 |
| stadt-B1 | Geher-Ende |  | | | | | | | | | | | | | | | | | | | |
| stadt-B2 | steht | 58.6 | 16.7 | 25.0 | 25.2 | 8.00 | 10.3 | 12.7 | 16.90 | 0.26 | 2.57 | – | 11.90 | 16.24 | 1.57 | 0.09 | – | – | – | – | 2.49 |
| stadt-B2 | geht-1 | 36.0 | 25.0 | 50.0 | 83.2 | 22.90 | 41.5 | 82.8 | 24.60 | 0.12 | 2.56 | – | 24.47 | 47.05 | 3.48 | 0.12 | – | – | – | – | 2.79 |
| stadt-B2 | Geher-Ende |  | | | | | | | | | | | | | | | | | | | |

## Tier-Zensus je Boot (zensus-0 nach umstellen · zensus-1 nach geht-1)

- stadt-A1: vorher 7 (deer 3, wolf 4; Würfe≥2 2: deer 3 Spanne 2 m @214 m | wolf 4 Spanne 1.7 m @466.6 m; Verband-Feld true, Verbände≥2 2: deer 3 Spanne 2 m | wolf 4 Spanne 1.7 m; Zustand {"flucht":3,"-":2,"fressen":2})
  nachher 11 (wolf 4, deer 7; Würfe≥2 2: wolf 4 Spanne 1.8 m @465.6 m | deer 7 Spanne 3.6 m @418.1 m; Verband-Feld true, Verbände≥2 2: wolf 4 Spanne 1.8 m | deer 7 Spanne 3.6 m; Zustand {"-":9,"fressen":2})
- stadt-A2: vorher 7 (deer 3, wolf 4; Würfe≥2 2: deer 3 Spanne 1.9 m @185.8 m | wolf 4 Spanne 1.5 m @465.4 m; Verband-Feld true, Verbände≥2 2: deer 3 Spanne 1.9 m | wolf 4 Spanne 1.5 m; Zustand {"flucht":3,"-":3,"fressen":1})
  nachher 7 (wolf 4, deer 3; Würfe≥2 2: wolf 4 Spanne 1.8 m @464.9 m | deer 3 Spanne 4.1 m @221.4 m; Verband-Feld true, Verbände≥2 2: wolf 4 Spanne 1.8 m | deer 3 Spanne 4.1 m; Zustand {"-":5,"fressen":2})
- stadt-B1: vorher 7 (deer 3, wolf 4; Würfe≥2 2: deer 3 Spanne 2.5 m @73.5 m | wolf 4 Spanne 1.4 m @466.3 m; Verband-Feld true, Verbände≥2 2: deer 3 Spanne 2.5 m | wolf 4 Spanne 1.4 m; Zustand {"flucht":3,"-":3,"fressen":1})
  nachher 4 (wolf 4; Würfe≥2 1: wolf 4 Spanne 1.9 m @465.6 m; Verband-Feld true, Verbände≥2 1: wolf 4 Spanne 1.9 m; Zustand {"-":2,"fressen":2})
- stadt-B2: vorher 7 (deer 3, wolf 4; Würfe≥2 2: deer 3 Spanne 1.9 m @149.7 m | wolf 4 Spanne 1.8 m @467 m; Verband-Feld true, Verbände≥2 2: deer 3 Spanne 1.9 m | wolf 4 Spanne 1.8 m; Zustand {"flucht":3,"fressen":2,"-":2})
  nachher 9 (wolf 4, deer 5; Würfe≥2 2: wolf 4 Spanne 1.6 m @465.4 m | deer 5 Spanne 3.6 m @400.7 m; Verband-Feld true, Verbände≥2 2: wolf 4 Spanne 1.6 m | deer 5 Spanne 3.6 m; Zustand {"-":7,"fressen":2})

## GPU-Takt je Boot (nvidia-smi 1 s, nur P0-Sekunden: Median-MHz · Anteil Drossel (Grund ≠ 0 ohne GpuIdle 0x1) · max °C)

- stadt-A1: 165 s · 1733 MHz · Drossel 30 % · 87 °C
- stadt-A2: 167 s · 1746 MHz · Drossel 16 % · 87 °C
- stadt-B1: 166 s · 1733 MHz · Drossel 28 % · 87 °C
- stadt-B2: 163 s · 1746 MHz · Drossel 28 % · 87 °C

## Mittel je Seite (A eeb5d2bf · B d46f055f; gehend = geht-1 je Boot)

| Gang | Größe | A | B | Δ B − A | 2σ | t (Welch) | Urteil |
|---|---|---|---|---|---|---|---|
| steht | fps | 58.0 (58.8 · 57.1) | 58.8 (59.0 · 58.6) | +0.8 | 1.7 | 0.97 | nicht langsamer |
| steht | Frame p50 ms | 16.7 (16.7 · 16.7) | 16.7 (16.7 · 16.7) | 0.0 | 0.0 | – | nicht langsamer |
| steht | Frame p95 ms | 25.1 (25.0 · 25.1) | 25.0 (25.0 · 25.0) | -0.1 | 0.1 | -1.00 | nicht langsamer |
| steht | Frame p99 ms | 25.2 (25.2 · 25.2) | 25.1 (25.1 · 25.2) | -0.1 | 0.1 | -1.00 | nicht langsamer |
| steht | CPU-Takt p50 ms | 8.75 (8.40 · 9.10) | 8.05 (8.10 · 8.00) | -0.70 | 0.71 | -1.98 | nicht langsamer |
| steht | CPU-Takt p95 ms | 11.0 (10.5 · 11.5) | 10.3 (10.3 · 10.3) | -0.7 | 1.0 | -1.40 | nicht langsamer |
| steht | CPU-Takt p99 ms | 14.8 (14.4 · 15.1) | 12.4 (12.1 · 12.7) | -2.4 | 0.9 | -5.10 | nicht langsamer |
| steht | GPU-Durchsatz p50 ms | 16.95 (16.90 · 17.00) | 16.90 (16.90 · 16.90) | -0.05 | 0.10 | -1.00 | nicht langsamer |
| steht | k0 p50 ms | 0.26 (0.26 · 0.25) | 0.43 (0.60 · 0.26) | +0.17 | 0.34 | 1.03 | nicht langsamer |
| steht | GPU p95 ms (lauf) | 2.59 (2.65 · 2.54) | 2.56 (2.55 · 2.57) | -0.04 | 0.11 | -0.63 | nicht langsamer |
| steht | GPU je Bild ms (gpu-bank) | – (– · –) | – (– · –) | – | – | – | – |
| steht | Belegung p50 ms | 13.34 (12.88 · 13.80) | 12.05 (12.21 · 11.90) | -1.29 | 0.97 | -2.65 | nicht langsamer |
| steht | Belegung p95 ms | 18.01 (16.98 · 19.04) | 16.11 (15.98 · 16.24) | -1.90 | 2.08 | -1.83 | nicht langsamer |
| steht | außer Takt p95 ms | 1.64 (1.62 · 1.66) | 1.55 (1.53 · 1.57) | -0.09 | 0.06 | -3.18 | nicht langsamer |
| steht | Lebenszyklus p95 ms | 0.10 (0.09 · 0.10) | 0.08 (0.08 · 0.09) | -0.01 | 0.01 | -1.41 | nicht langsamer |
| steht | über 33 ms % | – (– · –) | – (– · –) | – | – | – | – |
| steht | KI-Uhr Mittel ms | – (– · –) | – (– · –) | – | – | – | – |
| steht | KI-Uhr p95 ms | – (– · –) | – (– · –) | – | – | – | – |
| steht | KI-Uhr p99 ms | – (– · –) | – (– · –) | – | – | – | – |
| steht | KI-Takt EWMA ms | 3.42 (3.09 · 3.76) | 2.50 (2.50 · 2.49) | -0.93 | 0.67 | -2.78 | nicht langsamer |
| geht | fps | 34.8 (35.2 · 34.3) | 35.6 (35.2 · 36.0) | +0.9 | 1.2 | 1.41 | nicht langsamer |
| geht | Frame p50 ms | 25.0 (25.0 · 25.0) | 25.0 (25.0 · 25.0) | 0.0 | 0.0 | – | nicht langsamer |
| geht | Frame p95 ms | 50.0 (50.0 · 50.0) | 50.0 (50.0 · 50.0) | 0.0 | 0.0 | – | nicht langsamer |
| geht | Frame p99 ms | 100.0 (91.6 · 108.4) | 87.5 (91.7 · 83.2) | -12.5 | 18.8 | -1.33 | nicht langsamer |
| geht | CPU-Takt p50 ms | 23.45 (23.40 · 23.50) | 23.25 (23.60 · 22.90) | -0.20 | 0.71 | -0.57 | nicht langsamer |
| geht | CPU-Takt p95 ms | 44.5 (44.6 · 44.4) | 42.0 (42.6 · 41.5) | -2.5 | 1.1 | -4.38 | nicht langsamer |
| geht | CPU-Takt p99 ms | 95.6 (88.2 · 103.0) | 83.4 (84.1 · 82.8) | -12.2 | 14.9 | -1.64 | nicht langsamer |
| geht | GPU-Durchsatz p50 ms | 25.00 (25.00 · 25.00) | 25.00 (25.40 · 24.60) | 0.00 | 0.80 | 0.00 | nicht langsamer |
| geht | k0 p50 ms | 0.12 (0.12 · 0.12) | 0.12 (0.12 · 0.12) | 0.00 | 0.00 | – | nicht langsamer |
| geht | GPU p95 ms (lauf) | 2.54 (2.53 · 2.56) | 2.56 (2.57 · 2.56) | +0.02 | 0.03 | 1.26 | nicht langsamer |
| geht | GPU je Bild ms (gpu-bank) | – (– · –) | – (– · –) | – | – | – | – |
| geht | Belegung p50 ms | 24.94 (24.96 · 24.91) | 24.95 (25.42 · 24.47) | +0.01 | 0.95 | 0.02 | nicht langsamer |
| geht | Belegung p95 ms | 50.22 (50.34 · 50.10) | 47.48 (47.92 · 47.05) | -2.73 | 0.90 | -6.06 | nicht langsamer |
| geht | außer Takt p95 ms | 3.23 (3.39 · 3.07) | 3.69 (3.90 · 3.48) | +0.46 | 0.53 | 1.74 | nicht langsamer |
| geht | Lebenszyklus p95 ms | 0.11 (0.11 · 0.12) | 0.11 (0.11 · 0.12) | 0.00 | 0.01 | 0.00 | nicht langsamer |
| geht | über 33 ms % | – (– · –) | – (– · –) | – | – | – | – |
| geht | KI-Uhr Mittel ms | – (– · –) | – (– · –) | – | – | – | – |
| geht | KI-Uhr p95 ms | – (– · –) | – (– · –) | – | – | – | – |
| geht | KI-Uhr p99 ms | – (– · –) | – (– · –) | – | – | – | – |
| geht | KI-Takt EWMA ms | 4.15 (4.24 · 4.06) | 2.63 (2.47 · 2.79) | -1.52 | 0.37 | -8.28 | nicht langsamer |

**KERN-URTEIL GEHEN stadt** (steht + geht × fps · Frame p95 · CPU-Takt p95 · GPU je Bild (gpu-bank, nur steht) · Belegung p95; Δ ≤ max(2σ gepoolt, Auflösung)): nicht langsamer (8 Größen)
