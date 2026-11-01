## stadt — je Boot

| Boot | Gang | fps | Frame p50 ms | Frame p95 ms | Frame p99 ms | CPU-Takt p50 ms | CPU-Takt p95 ms | CPU-Takt p99 ms | GPU-Durchsatz p50 ms | k0 p50 ms | GPU p95 ms (lauf) | GPU je Bild ms (gpu-bank) | Belegung p50 ms | Belegung p95 ms | außer Takt p95 ms | Lebenszyklus p95 ms | über 33 ms % | KI-Uhr Mittel ms | KI-Uhr p95 ms | KI-Uhr p99 ms | KI-Takt EWMA ms |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| stadt-A1 | steht | 58.6 | 16.7 | 25.0 | 25.2 | 7.70 | 10.3 | 14.1 | 16.90 | 0.25 | 2.60 | – | 12.38 | 17.25 | 1.68 | 0.10 | – | – | – | – | 3.88 |
| stadt-A1 | geht-1 | 34.8 | 25.0 | 50.0 | 91.7 | 22.40 | 45.9 | 90.3 | 24.60 | 0.11 | 2.64 | – | 24.52 | 50.84 | 4.00 | 0.13 | – | – | – | – | 3.95 |
| stadt-A1 | Geher-Ende |  | | | | | | | | | | | | | | | | | | | |
| stadt-A2 | steht | 57.3 | 16.7 | 25.1 | 25.2 | 8.40 | 11.1 | 14.5 | 17.10 | 0.25 | 2.64 | – | 13.29 | 18.39 | 1.72 | 0.10 | – | – | – | – | 4.25 |
| stadt-A2 | geht-1 | 31.9 | 25.0 | 58.3 | 125.0 | 24.40 | 50.8 | 103.7 | 26.30 | 0.12 | 2.75 | – | 26.31 | 57.14 | 3.86 | 0.13 | – | – | – | – | 4.11 |
| stadt-A2 | Geher-Ende |  | | | | | | | | | | | | | | | | | | | |
| stadt-B1 | steht | 57.4 | 16.7 | 25.1 | 25.4 | 8.00 | 10.5 | 13.5 | 17.00 | 0.25 | 2.77 | – | 12.83 | 17.73 | 1.64 | 0.10 | – | – | – | – | 3.95 |
| stadt-B1 | geht-1 | 33.4 | 25.0 | 58.2 | 108.3 | 23.90 | 48.1 | 97.3 | 26.10 | 0.11 | 2.64 | – | 26.20 | 53.96 | 3.91 | 0.13 | – | – | – | – | 4.12 |
| stadt-B1 | Geher-Ende |  | | | | | | | | | | | | | | | | | | | |
| stadt-B2 | steht | 57.8 | 16.7 | 25.0 | 25.2 | 8.10 | 10.9 | 14.3 | 17.00 | 0.25 | 2.51 | – | 12.80 | 17.71 | 1.62 | 0.10 | – | – | – | – | 3.98 |
| stadt-B2 | geht-1 | 33.1 | 25.0 | 50.0 | 125.1 | 24.30 | 46.8 | 118.5 | 26.40 | 0.12 | 2.77 | – | 26.31 | 53.18 | 3.35 | 0.12 | – | – | – | – | 3.99 |
| stadt-B2 | Geher-Ende |  | | | | | | | | | | | | | | | | | | | |

## Tier-Zensus je Boot (zensus-0 nach umstellen · zensus-1 nach geht-1)

- stadt-A1: vorher 7 (deer 3, wolf 4; Würfe≥2 2: deer 3 Spanne 2.9 m @242.6 m | wolf 4 Spanne 1.7 m @468.5 m; Verband-Feld true, Verbände≥2 2: deer 3 Spanne 2.9 m | wolf 4 Spanne 1.7 m; Zustand {"flucht":3,"-":2,"fressen":2})
  nachher 9 (wolf 4, deer 5; Würfe≥2 2: wolf 4 Spanne 1.7 m @468.5 m | deer 5 Spanne 3.5 m @400 m; Verband-Feld true, Verbände≥2 2: wolf 4 Spanne 1.7 m | deer 5 Spanne 3.5 m; Zustand {"-":7,"fressen":2})
- stadt-A2: vorher 7 (deer 3, wolf 4; Würfe≥2 2: deer 3 Spanne 1.8 m @228.4 m | wolf 4 Spanne 1.6 m @468.2 m; Verband-Feld true, Verbände≥2 2: deer 3 Spanne 1.8 m | wolf 4 Spanne 1.6 m; Zustand {"flucht":3,"-":3,"fressen":1})
  nachher 9 (wolf 4, deer 5; Würfe≥2 2: wolf 4 Spanne 1.6 m @468.1 m | deer 5 Spanne 3.7 m @400.7 m; Verband-Feld true, Verbände≥2 2: wolf 4 Spanne 1.6 m | deer 5 Spanne 3.7 m; Zustand {"-":7,"fressen":2})
- stadt-B1: vorher 7 (deer 3, wolf 4; Würfe≥2 2: deer 3 Spanne 2 m @207.8 m | wolf 4 Spanne 1.4 m @465.6 m; Verband-Feld true, Verbände≥2 2: deer 3 Spanne 2 m | wolf 4 Spanne 1.4 m; Zustand {"flucht":3,"fressen":4})
  nachher 4 (wolf 4; Würfe≥2 1: wolf 4 Spanne 1.9 m @464.9 m; Verband-Feld true, Verbände≥2 1: wolf 4 Spanne 1.9 m; Zustand {"-":4})
- stadt-B2: vorher 7 (deer 3, wolf 4; Würfe≥2 2: deer 3 Spanne 1.5 m @121.6 m | wolf 4 Spanne 1.6 m @467.1 m; Verband-Feld true, Verbände≥2 2: deer 3 Spanne 1.5 m | wolf 4 Spanne 1.6 m; Zustand {"flucht":3,"fressen":4})
  nachher 4 (wolf 4; Würfe≥2 1: wolf 4 Spanne 2.6 m @466.3 m; Verband-Feld true, Verbände≥2 1: wolf 4 Spanne 2.6 m; Zustand {"-":4})

## GPU-Takt je Boot (nvidia-smi 1 s, nur P0-Sekunden: Median-MHz · Anteil Drossel (Grund ≠ 0 ohne GpuIdle 0x1) · max °C)

- stadt-A1: 166 s · 1733 MHz · Drossel 31 % · 87 °C
- stadt-A2: 166 s · 1733 MHz · Drossel 31 % · 87 °C
- stadt-B1: 172 s · 1746 MHz · Drossel 28 % · 87 °C
- stadt-B2: 169 s · 1746 MHz · Drossel 33 % · 87 °C

## Mittel je Seite (A b895650c · B c351b318; gehend = geht-1 je Boot)

| Gang | Größe | A | B | Δ B − A | 2σ | t (Welch) | Urteil |
|---|---|---|---|---|---|---|---|
| steht | fps | 58.0 (58.6 · 57.3) | 57.6 (57.4 · 57.8) | -0.4 | 1.4 | -0.51 | nicht langsamer |
| steht | Frame p50 ms | 16.7 (16.7 · 16.7) | 16.7 (16.7 · 16.7) | 0.0 | 0.0 | – | nicht langsamer |
| steht | Frame p95 ms | 25.1 (25.0 · 25.1) | 25.1 (25.1 · 25.0) | 0.0 | 0.1 | 0.00 | nicht langsamer |
| steht | Frame p99 ms | 25.2 (25.2 · 25.2) | 25.3 (25.4 · 25.2) | +0.1 | 0.2 | 1.00 | nicht langsamer |
| steht | CPU-Takt p50 ms | 8.05 (7.70 · 8.40) | 8.05 (8.00 · 8.10) | 0.00 | 0.71 | 0.00 | nicht langsamer |
| steht | CPU-Takt p95 ms | 10.7 (10.3 · 11.1) | 10.7 (10.5 · 10.9) | 0.0 | 0.9 | 0.00 | nicht langsamer |
| steht | CPU-Takt p99 ms | 14.3 (14.1 · 14.5) | 13.9 (13.5 · 14.3) | -0.4 | 0.9 | -0.89 | nicht langsamer |
| steht | GPU-Durchsatz p50 ms | 17.00 (16.90 · 17.10) | 17.00 (17.00 · 17.00) | 0.00 | 0.20 | 0.00 | nicht langsamer |
| steht | k0 p50 ms | 0.25 (0.25 · 0.25) | 0.25 (0.25 · 0.25) | 0.00 | 0.00 | – | nicht langsamer |
| steht | GPU p95 ms (lauf) | 2.62 (2.60 · 2.64) | 2.64 (2.77 · 2.51) | +0.02 | 0.26 | 0.15 | nicht langsamer |
| steht | GPU je Bild ms (gpu-bank) | – (– · –) | – (– · –) | – | – | – | – |
| steht | Belegung p50 ms | 12.84 (12.38 · 13.29) | 12.82 (12.83 · 12.80) | -0.02 | 0.91 | -0.04 | nicht langsamer |
| steht | Belegung p95 ms | 17.82 (17.25 · 18.39) | 17.72 (17.73 · 17.71) | -0.10 | 1.14 | -0.18 | nicht langsamer |
| steht | außer Takt p95 ms | 1.70 (1.68 · 1.72) | 1.63 (1.64 · 1.62) | -0.07 | 0.04 | -3.13 | nicht langsamer |
| steht | Lebenszyklus p95 ms | 0.10 (0.10 · 0.10) | 0.10 (0.10 · 0.10) | 0.00 | 0.00 | – | nicht langsamer |
| steht | über 33 ms % | – (– · –) | – (– · –) | – | – | – | – |
| steht | KI-Uhr Mittel ms | – (– · –) | – (– · –) | – | – | – | – |
| steht | KI-Uhr p95 ms | – (– · –) | – (– · –) | – | – | – | – |
| steht | KI-Uhr p99 ms | – (– · –) | – (– · –) | – | – | – | – |
| steht | KI-Takt EWMA ms | 4.06 (3.88 · 4.25) | 3.96 (3.95 · 3.98) | -0.10 | 0.37 | -0.54 | nicht langsamer |
| geht | fps | 33.3 (34.8 · 31.9) | 33.3 (33.4 · 33.1) | -0.1 | 2.9 | -0.07 | nicht langsamer |
| geht | Frame p50 ms | 25.0 (25.0 · 25.0) | 25.0 (25.0 · 25.0) | 0.0 | 0.0 | – | nicht langsamer |
| geht | Frame p95 ms | 54.1 (50.0 · 58.3) | 54.1 (58.2 · 50.0) | -0.0 | 11.7 | -0.01 | nicht langsamer |
| geht | Frame p99 ms | 108.3 (91.7 · 125.0) | 116.7 (108.3 · 125.1) | +8.3 | 37.3 | 0.45 | nicht langsamer |
| geht | CPU-Takt p50 ms | 23.40 (22.40 · 24.40) | 24.10 (23.90 · 24.30) | +0.70 | 2.04 | 0.69 | nicht langsamer |
| geht | CPU-Takt p95 ms | 48.3 (45.9 · 50.8) | 47.5 (48.1 · 46.8) | -0.9 | 5.1 | -0.36 | nicht langsamer |
| geht | CPU-Takt p99 ms | 97.0 (90.3 · 103.7) | 107.9 (97.3 · 118.5) | +10.9 | 25.1 | 0.87 | nicht langsamer |
| geht | GPU-Durchsatz p50 ms | 25.45 (24.60 · 26.30) | 26.25 (26.10 · 26.40) | +0.80 | 1.73 | 0.93 | nicht langsamer |
| geht | k0 p50 ms | 0.11 (0.11 · 0.12) | 0.11 (0.11 · 0.12) | 0.00 | 0.01 | 0.00 | nicht langsamer |
| geht | GPU p95 ms (lauf) | 2.70 (2.64 · 2.75) | 2.71 (2.64 · 2.77) | +0.01 | 0.17 | 0.12 | nicht langsamer |
| geht | GPU je Bild ms (gpu-bank) | – (– · –) | – (– · –) | – | – | – | – |
| geht | Belegung p50 ms | 25.41 (24.52 · 26.31) | 26.25 (26.20 · 26.31) | +0.84 | 1.79 | 0.94 | nicht langsamer |
| geht | Belegung p95 ms | 53.99 (50.84 · 57.14) | 53.57 (53.96 · 53.18) | -0.42 | 6.35 | -0.13 | nicht langsamer |
| geht | außer Takt p95 ms | 3.93 (4.00 · 3.86) | 3.63 (3.91 · 3.35) | -0.30 | 0.58 | -1.04 | nicht langsamer |
| geht | Lebenszyklus p95 ms | 0.13 (0.13 · 0.13) | 0.13 (0.13 · 0.12) | -0.01 | 0.01 | -1.00 | nicht langsamer |
| geht | über 33 ms % | – (– · –) | – (– · –) | – | – | – | – |
| geht | KI-Uhr Mittel ms | – (– · –) | – (– · –) | – | – | – | – |
| geht | KI-Uhr p95 ms | – (– · –) | – (– · –) | – | – | – | – |
| geht | KI-Uhr p99 ms | – (– · –) | – (– · –) | – | – | – | – |
| geht | KI-Takt EWMA ms | 4.03 (3.95 · 4.11) | 4.05 (4.12 · 3.99) | +0.02 | 0.21 | 0.24 | nicht langsamer |

**KERN-URTEIL GEHEN stadt** (steht + geht × fps · Frame p95 · CPU-Takt p95 · GPU je Bild (gpu-bank, nur steht) · Belegung p95; Δ ≤ max(2σ gepoolt, Auflösung)): nicht langsamer (8 Größen)
