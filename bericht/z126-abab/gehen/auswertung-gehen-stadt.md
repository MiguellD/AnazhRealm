## stadt — je Boot

| Boot | Gang | fps | Frame p50 ms | Frame p95 ms | Frame p99 ms | CPU-Takt p50 ms | CPU-Takt p95 ms | CPU-Takt p99 ms | GPU-Durchsatz p50 ms | k0 p50 ms | GPU p95 ms (lauf) | GPU je Bild ms (gpu-bank) | Belegung p50 ms | Belegung p95 ms | außer Takt p95 ms | Lebenszyklus p95 ms | über 33 ms % | KI-Uhr Mittel ms | KI-Uhr p95 ms | KI-Uhr p99 ms | KI-Takt EWMA ms |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| stadt-A1 | steht | 58.3 | 16.7 | 25.0 | 25.2 | 8.90 | 11.4 | 15.4 | 17.00 | 0.26 | 2.53 | – | 13.58 | 18.46 | 1.59 | 0.09 | – | – | – | – | 3.37 |
| stadt-A1 | geht-1 | 35.1 | 25.0 | 50.0 | 91.7 | 23.20 | 44.2 | 80.0 | 25.00 | 0.11 | 2.49 | – | 24.93 | 49.53 | 4.20 | 0.12 | – | – | – | – | 3.96 |
| stadt-A1 | Geher-Ende |  | | | | | | | | | | | | | | | | | | | |
| stadt-A2 | steht | 58.6 | 16.7 | 25.0 | 25.1 | 8.70 | 10.9 | 14.8 | 17.00 | 0.60 | 2.51 | – | 13.33 | 17.60 | 1.64 | 0.09 | – | – | – | – | 3.51 |
| stadt-A2 | geht-1 | 35.8 | 25.0 | 50.0 | 91.5 | 23.00 | 42.1 | 82.6 | 24.70 | 0.11 | 2.56 | – | 24.67 | 47.23 | 2.73 | 0.11 | – | – | – | – | 3.61 |
| stadt-A2 | Geher-Ende |  | | | | | | | | | | | | | | | | | | | |
| stadt-B1 | steht | 66.0 | 16.6 | 25.0 | 25.1 | 9.00 | 11.1 | 15.0 | 15.00 | 0.25 | 2.44 | – | 13.02 | 18.20 | 1.61 | 0.08 | – | – | – | – | 3.26 |
| stadt-B1 | geht-1 | 36.4 | 25.0 | 50.0 | 100.0 | 22.80 | 42.5 | 89.3 | 23.70 | 0.11 | 2.45 | – | 23.68 | 48.70 | 3.01 | 0.10 | – | – | – | – | 3.97 |
| stadt-B1 | Geher-Ende |  | | | | | | | | | | | | | | | | | | | |
| stadt-B2 | steht | 66.2 | 16.6 | 25.0 | 25.1 | 8.80 | 11.0 | 16.1 | 15.00 | 0.25 | 2.42 | – | 12.53 | 18.12 | 1.55 | 0.08 | – | – | – | – | 3.48 |
| stadt-B2 | geht-1 | 35.5 | 25.0 | 50.0 | 100.0 | 23.20 | 43.1 | 102.4 | 24.10 | 0.12 | 2.52 | – | 24.18 | 51.45 | 3.02 | 0.10 | – | – | – | – | 4.19 |
| stadt-B2 | Geher-Ende |  | | | | | | | | | | | | | | | | | | | |

## Tier-Zensus je Boot (zensus-0 nach umstellen · zensus-1 nach geht-1)

- stadt-A1: vorher 7 (deer 3, wolf 4; Würfe≥2 2: deer 3 Spanne 2.3 m @115.6 m | wolf 4 Spanne 1.7 m @466.8 m; Verband-Feld true, Verbände≥2 2: deer 3 Spanne 2.3 m | wolf 4 Spanne 1.7 m; Zustand {"flucht":3,"fressen":3,"-":1})
  nachher 9 (wolf 4, deer 5; Würfe≥2 2: wolf 4 Spanne 1.9 m @466.4 m | deer 5 Spanne 3.5 m @400.7 m; Verband-Feld true, Verbände≥2 2: wolf 4 Spanne 1.9 m | deer 5 Spanne 3.5 m; Zustand {"-":8,"fressen":1})
- stadt-A2: vorher 7 (deer 3, wolf 4; Würfe≥2 2: deer 3 Spanne 1.9 m @206.9 m | wolf 4 Spanne 1.7 m @466.5 m; Verband-Feld true, Verbände≥2 2: deer 3 Spanne 1.9 m | wolf 4 Spanne 1.7 m; Zustand {"flucht":3,"-":3,"fressen":1})
  nachher 11 (wolf 4, deer 7; Würfe≥2 2: wolf 4 Spanne 2.1 m @465.4 m | deer 7 Spanne 3.5 m @418.1 m; Verband-Feld true, Verbände≥2 2: wolf 4 Spanne 2.1 m | deer 7 Spanne 3.5 m; Zustand {"fressen":2,"-":9})
- stadt-B1: vorher 7 (deer 3, wolf 4; Würfe≥2 2: deer 3 Spanne 2.5 m @106.6 m | wolf 4 Spanne 1.8 m @466.7 m; Verband-Feld true, Verbände≥2 2: deer 3 Spanne 2.5 m | wolf 4 Spanne 1.8 m; Zustand {"flucht":3,"fressen":3,"-":1})
  nachher 9 (wolf 4, deer 5; Würfe≥2 2: wolf 4 Spanne 2.1 m @465.8 m | deer 5 Spanne 3.4 m @400 m; Verband-Feld true, Verbände≥2 2: wolf 4 Spanne 2.1 m | deer 5 Spanne 3.4 m; Zustand {"-":8,"fressen":1})
- stadt-B2: vorher 7 (deer 3, wolf 4; Würfe≥2 2: deer 3 Spanne 1.8 m @86.2 m | wolf 4 Spanne 1.3 m @465.4 m; Verband-Feld true, Verbände≥2 2: deer 3 Spanne 1.8 m | wolf 4 Spanne 1.3 m; Zustand {"flucht":3,"fressen":3,"-":1})
  nachher 4 (wolf 4; Würfe≥2 1: wolf 4 Spanne 1.8 m @464.6 m; Verband-Feld true, Verbände≥2 1: wolf 4 Spanne 1.8 m; Zustand {"-":1,"fressen":3})

## GPU-Takt je Boot (nvidia-smi 1 s, nur P0-Sekunden: Median-MHz · Anteil Drossel (Grund ≠ 0 ohne GpuIdle 0x1) · max °C)

- stadt-A1: 158 s · 1759 MHz · Drossel 26 % · 87 °C
- stadt-A2: 164 s · 1746 MHz · Drossel 26 % · 86 °C
- stadt-B1: 163 s · 1759 MHz · Drossel 16 % · 87 °C
- stadt-B2: 167 s · 1759 MHz · Drossel 19 % · 87 °C

## Mittel je Seite (A 9e40c93c · B e0f42f9d; gehend = geht-1 je Boot)

| Gang | Größe | A | B | Δ B − A | 2σ | t (Welch) | Urteil |
|---|---|---|---|---|---|---|---|
| steht | fps | 58.5 (58.3 · 58.6) | 66.1 (66.0 · 66.2) | +7.6 | 0.4 | 42.43 | nicht langsamer |
| steht | Frame p50 ms | 16.7 (16.7 · 16.7) | 16.6 (16.6 · 16.6) | -0.1 | 0.0 | – | nicht langsamer |
| steht | Frame p95 ms | 25.0 (25.0 · 25.0) | 25.0 (25.0 · 25.0) | 0.0 | 0.0 | – | nicht langsamer |
| steht | Frame p99 ms | 25.1 (25.2 · 25.1) | 25.1 (25.1 · 25.1) | -0.0 | 0.1 | -1.00 | nicht langsamer |
| steht | CPU-Takt p50 ms | 8.80 (8.90 · 8.70) | 8.90 (9.00 · 8.80) | +0.10 | 0.28 | 0.71 | nicht langsamer |
| steht | CPU-Takt p95 ms | 11.2 (11.4 · 10.9) | 11.1 (11.1 · 11.0) | -0.1 | 0.5 | -0.39 | nicht langsamer |
| steht | CPU-Takt p99 ms | 15.1 (15.4 · 14.8) | 15.6 (15.0 · 16.1) | +0.4 | 1.3 | 0.72 | nicht langsamer |
| steht | GPU-Durchsatz p50 ms | 17.00 (17.00 · 17.00) | 15.00 (15.00 · 15.00) | -2.00 | 0.00 | – | nicht langsamer |
| steht | k0 p50 ms | 0.43 (0.26 · 0.60) | 0.25 (0.25 · 0.25) | -0.18 | 0.34 | -1.06 | nicht langsamer |
| steht | GPU p95 ms (lauf) | 2.52 (2.53 · 2.51) | 2.43 (2.44 · 2.42) | -0.09 | 0.03 | -6.36 | nicht langsamer |
| steht | GPU je Bild ms (gpu-bank) | – (– · –) | – (– · –) | – | – | – | – |
| steht | Belegung p50 ms | 13.46 (13.58 · 13.33) | 12.77 (13.02 · 12.53) | -0.68 | 0.55 | -2.47 | nicht langsamer |
| steht | Belegung p95 ms | 18.03 (18.46 · 17.60) | 18.16 (18.20 · 18.12) | +0.13 | 0.86 | 0.30 | nicht langsamer |
| steht | außer Takt p95 ms | 1.61 (1.59 · 1.64) | 1.58 (1.61 · 1.55) | -0.03 | 0.08 | -0.90 | nicht langsamer |
| steht | Lebenszyklus p95 ms | 0.09 (0.09 · 0.09) | 0.08 (0.08 · 0.08) | -0.01 | 0.00 | – | nicht langsamer |
| steht | über 33 ms % | – (– · –) | – (– · –) | – | – | – | – |
| steht | KI-Uhr Mittel ms | – (– · –) | – (– · –) | – | – | – | – |
| steht | KI-Uhr p95 ms | – (– · –) | – (– · –) | – | – | – | – |
| steht | KI-Uhr p99 ms | – (– · –) | – (– · –) | – | – | – | – |
| steht | KI-Takt EWMA ms | 3.44 (3.37 · 3.51) | 3.37 (3.26 · 3.48) | -0.07 | 0.26 | -0.54 | nicht langsamer |
| geht | fps | 35.5 (35.1 · 35.8) | 36.0 (36.4 · 35.5) | +0.5 | 1.1 | 0.88 | nicht langsamer |
| geht | Frame p50 ms | 25.0 (25.0 · 25.0) | 25.0 (25.0 · 25.0) | 0.0 | 0.0 | – | nicht langsamer |
| geht | Frame p95 ms | 50.0 (50.0 · 50.0) | 50.0 (50.0 · 50.0) | 0.0 | 0.0 | – | nicht langsamer |
| geht | Frame p99 ms | 91.6 (91.7 · 91.5) | 100.0 (100.0 · 100.0) | +8.4 | 0.2 | 84.00 | LANGSAMER |
| geht | CPU-Takt p50 ms | 23.10 (23.20 · 23.00) | 23.00 (22.80 · 23.20) | -0.10 | 0.45 | -0.45 | nicht langsamer |
| geht | CPU-Takt p95 ms | 43.2 (44.2 · 42.1) | 42.8 (42.5 · 43.1) | -0.4 | 2.2 | -0.32 | nicht langsamer |
| geht | CPU-Takt p99 ms | 81.3 (80.0 · 82.6) | 95.8 (89.3 · 102.4) | +14.5 | 13.4 | 2.18 | LANGSAMER |
| geht | GPU-Durchsatz p50 ms | 24.85 (25.00 · 24.70) | 23.90 (23.70 · 24.10) | -0.95 | 0.50 | -3.80 | nicht langsamer |
| geht | k0 p50 ms | 0.11 (0.11 · 0.11) | 0.11 (0.11 · 0.12) | +0.00 | 0.01 | 1.00 | nicht langsamer |
| geht | GPU p95 ms (lauf) | 2.53 (2.49 · 2.56) | 2.49 (2.45 · 2.52) | -0.04 | 0.10 | -0.81 | nicht langsamer |
| geht | GPU je Bild ms (gpu-bank) | – (– · –) | – (– · –) | – | – | – | – |
| geht | Belegung p50 ms | 24.80 (24.93 · 24.67) | 23.93 (23.68 · 24.18) | -0.87 | 0.56 | -3.09 | nicht langsamer |
| geht | Belegung p95 ms | 48.38 (49.53 · 47.23) | 50.08 (48.70 · 51.45) | +1.70 | 3.59 | 0.95 | nicht langsamer |
| geht | außer Takt p95 ms | 3.46 (4.20 · 2.73) | 3.01 (3.01 · 3.02) | -0.45 | 1.47 | -0.61 | nicht langsamer |
| geht | Lebenszyklus p95 ms | 0.11 (0.12 · 0.11) | 0.10 (0.10 · 0.10) | -0.01 | 0.01 | -3.00 | nicht langsamer |
| geht | über 33 ms % | – (– · –) | – (– · –) | – | – | – | – |
| geht | KI-Uhr Mittel ms | – (– · –) | – (– · –) | – | – | – | – |
| geht | KI-Uhr p95 ms | – (– · –) | – (– · –) | – | – | – | – |
| geht | KI-Uhr p99 ms | – (– · –) | – (– · –) | – | – | – | – |
| geht | KI-Takt EWMA ms | 3.79 (3.96 · 3.61) | 4.08 (3.97 · 4.19) | +0.29 | 0.41 | 1.43 | nicht langsamer |

**KERN-URTEIL GEHEN stadt** (steht + geht × fps · Frame p95 · CPU-Takt p95 · GPU je Bild (gpu-bank, nur steht) · Belegung p95; Δ ≤ max(2σ gepoolt, Auflösung)): nicht langsamer (8 Größen)
