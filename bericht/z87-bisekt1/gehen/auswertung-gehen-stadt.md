## stadt — je Boot

| Boot | Gang | fps | Frame p50 ms | Frame p95 ms | Frame p99 ms | CPU-Takt p50 ms | CPU-Takt p95 ms | CPU-Takt p99 ms | GPU-Durchsatz p50 ms | k0 p50 ms | GPU p95 ms (lauf) | GPU je Bild ms (gpu-bank) | Belegung p50 ms | Belegung p95 ms | außer Takt p95 ms | Lebenszyklus p95 ms | über 33 ms % | KI-Uhr Mittel ms | KI-Uhr p95 ms | KI-Uhr p99 ms | KI-Takt EWMA ms |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| stadt-A1 | steht | 71.0 | 16.6 | 17.0 | 25.0 | 7.60 | 10.5 | 13.7 | 14.20 | 0.24 | 2.25 | – | 11.36 | 15.36 | 1.51 | 0.09 | – | – | – | – | 3.08 |
| stadt-A1 | geht-1 | 38.8 | 24.9 | 49.8 | 91.7 | 21.40 | 41.8 | 87.3 | 22.40 | 0.11 | 2.81 | – | 22.38 | 46.61 | 2.80 | 0.10 | – | – | – | – | 4.56 |
| stadt-A1 | Geher-Ende |  | | | | | | | | | | | | | | | | | | | |
| stadt-A2 | steht | 69.0 | 16.6 | 25.0 | 25.1 | 7.80 | 10.9 | 13.5 | 14.50 | 0.24 | 2.25 | – | 11.61 | 17.98 | 1.58 | 0.09 | – | – | – | – | 2.90 |
| stadt-A2 | geht-1 | 37.5 | 25.0 | 50.0 | 108.1 | 21.50 | 45.2 | 93.6 | 22.90 | 0.11 | 2.51 | – | 22.92 | 49.74 | 2.42 | 0.10 | – | – | – | – | 4.45 |
| stadt-A2 | Geher-Ende |  | | | | | | | | | | | | | | | | | | | |
| stadt-B1 | steht | 68.8 | 16.6 | 25.0 | 25.1 | 8.00 | 11.0 | 14.5 | 14.50 | 0.23 | 2.23 | – | 11.94 | 17.48 | 1.60 | 0.09 | – | – | – | – | 3.27 |
| stadt-B1 | geht-1 | 34.2 | 25.0 | 58.3 | 100.1 | 23.90 | 49.6 | 102.8 | 24.90 | 0.12 | 2.77 | – | 24.98 | 54.40 | 4.40 | 0.10 | – | – | – | – | 4.41 |
| stadt-B1 | Geher-Ende |  | | | | | | | | | | | | | | | | | | | |
| stadt-B2 | steht | 69.2 | 16.6 | 24.9 | 25.1 | 7.80 | 10.7 | 13.9 | 14.50 | 0.23 | 2.24 | – | 11.79 | 17.27 | 1.54 | 0.09 | – | – | – | – | 3.43 |
| stadt-B2 | geht-1 | 34.3 | 25.0 | 58.3 | 91.7 | 23.80 | 48.9 | 89.0 | 25.00 | 0.12 | 2.54 | – | 24.98 | 54.86 | 3.67 | 0.11 | – | – | – | – | 4.10 |
| stadt-B2 | Geher-Ende |  | | | | | | | | | | | | | | | | | | | |

## Tier-Zensus je Boot (zensus-0 nach umstellen · zensus-1 nach geht-1)

- stadt-A1: vorher 9 (deer 6, wolf 3; Würfe≥2 2: deer 6 Spanne 3.8 m @191.5 m | wolf 3 Spanne 1.7 m @466.9 m; Verband-Feld true, Verbände≥2 2: deer 6 Spanne 3.8 m | wolf 3 Spanne 1.7 m; Zustand {"-":9})
  nachher 13 (deer 9, wolf 4; Würfe≥2 3: wolf 4 Spanne 2 m @468.2 m | deer 3 Spanne 2.3 m @307.2 m | deer 5 Spanne 3.7 m @401 m; Verband-Feld true, Verbände≥2 3: wolf 4 Spanne 2 m | deer 3 Spanne 2.3 m | deer 5 Spanne 3.7 m; Zustand {"-":10,"fressen":3})
- stadt-A2: vorher 9 (deer 6, wolf 3; Würfe≥2 2: deer 6 Spanne 3.9 m @191.5 m | wolf 3 Spanne 1.7 m @467 m; Verband-Feld true, Verbände≥2 2: deer 6 Spanne 3.9 m | wolf 3 Spanne 1.7 m; Zustand {"-":9})
  nachher 13 (deer 9, wolf 4; Würfe≥2 3: wolf 4 Spanne 1.9 m @468.4 m | deer 5 Spanne 2.8 m @406.1 m | deer 3 Spanne 2.8 m @309.4 m; Verband-Feld true, Verbände≥2 3: wolf 4 Spanne 1.9 m | deer 5 Spanne 2.8 m | deer 3 Spanne 2.8 m; Zustand {"-":10,"fressen":3})
- stadt-B1: vorher 11 (deer 5, wolf 6; Würfe≥2 2: deer 5 Spanne 2.3 m @171.7 m | wolf 6 Spanne 4 m @466.6 m; Verband-Feld true, Verbände≥2 2: deer 5 Spanne 2.3 m | wolf 6 Spanne 4 m; Zustand {"flucht":5,"-":6})
  nachher 12 (wolf 4, deer 8; Würfe≥2 3: wolf 4 Spanne 1.5 m @465.1 m | deer 3 Spanne 2.3 m @307.5 m | deer 5 Spanne 3.6 m @400.7 m; Verband-Feld true, Verbände≥2 3: wolf 4 Spanne 1.5 m | deer 3 Spanne 2.3 m | deer 5 Spanne 3.6 m; Zustand {"fressen":3,"-":9})
- stadt-B2: vorher 11 (deer 5, wolf 6; Würfe≥2 2: deer 5 Spanne 3.7 m @189.1 m | wolf 6 Spanne 3.3 m @467.3 m; Verband-Feld true, Verbände≥2 2: deer 5 Spanne 3.7 m | wolf 6 Spanne 3.3 m; Zustand {"flucht":5,"-":6})
  nachher 13 (deer 9, wolf 4; Würfe≥2 3: wolf 4 Spanne 2.1 m @467.1 m | deer 3 Spanne 2.3 m @307.4 m | deer 5 Spanne 3.7 m @400.9 m; Verband-Feld true, Verbände≥2 3: wolf 4 Spanne 2.1 m | deer 3 Spanne 2.3 m | deer 5 Spanne 3.7 m; Zustand {"flucht":1,"-":10,"fressen":2})

## GPU-Takt je Boot (nvidia-smi 1 s, nur P0-Sekunden: Median-MHz · Anteil Drossel (Grund ≠ 0 ohne GpuIdle 0x1) · max °C)

- stadt-A1: 147 s · 1759 MHz · Drossel 16 % · 86 °C
- stadt-A2: 153 s · 1746 MHz · Drossel 20 % · 86 °C
- stadt-B1: 157 s · 1759 MHz · Drossel 23 % · 86 °C
- stadt-B2: 152 s · 1759 MHz · Drossel 18 % · 86 °C

## Mittel je Seite (A 957a615c · B 0b8dbcfc; gehend = geht-1 je Boot)

| Gang | Größe | A | B | Δ B − A | 2σ | t (Welch) | Urteil |
|---|---|---|---|---|---|---|---|
| steht | fps | 70.0 (71.0 · 69.0) | 69.0 (68.8 · 69.2) | -1.0 | 2.0 | -0.98 | nicht langsamer |
| steht | Frame p50 ms | 16.6 (16.6 · 16.6) | 16.6 (16.6 · 16.6) | 0.0 | 0.0 | – | nicht langsamer |
| steht | Frame p95 ms | 21.0 (17.0 · 25.0) | 24.9 (25.0 · 24.9) | +3.9 | 8.0 | 0.99 | nicht langsamer |
| steht | Frame p99 ms | 25.1 (25.0 · 25.1) | 25.1 (25.1 · 25.1) | +0.1 | 0.1 | 1.00 | nicht langsamer |
| steht | CPU-Takt p50 ms | 7.70 (7.60 · 7.80) | 7.90 (8.00 · 7.80) | +0.20 | 0.28 | 1.41 | nicht langsamer |
| steht | CPU-Takt p95 ms | 10.7 (10.5 · 10.9) | 10.8 (11.0 · 10.7) | +0.2 | 0.5 | 0.60 | nicht langsamer |
| steht | CPU-Takt p99 ms | 13.6 (13.7 · 13.5) | 14.2 (14.5 · 13.9) | +0.6 | 0.6 | 1.90 | nicht langsamer |
| steht | GPU-Durchsatz p50 ms | 14.35 (14.20 · 14.50) | 14.50 (14.50 · 14.50) | +0.15 | 0.30 | 1.00 | nicht langsamer |
| steht | k0 p50 ms | 0.24 (0.24 · 0.24) | 0.23 (0.23 · 0.23) | -0.01 | 0.00 | – | nicht langsamer |
| steht | GPU p95 ms (lauf) | 2.25 (2.25 · 2.25) | 2.24 (2.23 · 2.24) | -0.01 | 0.01 | -3.00 | nicht langsamer |
| steht | GPU je Bild ms (gpu-bank) | – (– · –) | – (– · –) | – | – | – | – |
| steht | Belegung p50 ms | 11.48 (11.36 · 11.61) | 11.86 (11.94 · 11.79) | +0.38 | 0.29 | 2.61 | LANGSAMER |
| steht | Belegung p95 ms | 16.67 (15.36 · 17.98) | 17.38 (17.48 · 17.27) | +0.70 | 2.63 | 0.54 | nicht langsamer |
| steht | außer Takt p95 ms | 1.54 (1.51 · 1.58) | 1.57 (1.60 · 1.54) | +0.03 | 0.09 | 0.54 | nicht langsamer |
| steht | Lebenszyklus p95 ms | 0.09 (0.09 · 0.09) | 0.09 (0.09 · 0.09) | 0.00 | 0.00 | – | nicht langsamer |
| steht | über 33 ms % | – (– · –) | – (– · –) | – | – | – | – |
| steht | KI-Uhr Mittel ms | – (– · –) | – (– · –) | – | – | – | – |
| steht | KI-Uhr p95 ms | – (– · –) | – (– · –) | – | – | – | – |
| steht | KI-Uhr p99 ms | – (– · –) | – (– · –) | – | – | – | – |
| steht | KI-Takt EWMA ms | 2.99 (3.08 · 2.90) | 3.35 (3.27 · 3.43) | +0.36 | 0.24 | 2.99 | LANGSAMER |
| geht | fps | 38.1 (38.8 · 37.5) | 34.3 (34.2 · 34.3) | -3.9 | 1.3 | -5.98 | LANGSAMER |
| geht | Frame p50 ms | 24.9 (24.9 · 25.0) | 25.0 (25.0 · 25.0) | +0.1 | 0.1 | 1.00 | nicht langsamer |
| geht | Frame p95 ms | 49.9 (49.8 · 50.0) | 58.3 (58.3 · 58.3) | +8.4 | 0.2 | 84.00 | LANGSAMER |
| geht | Frame p99 ms | 99.9 (91.7 · 108.1) | 95.9 (100.1 · 91.7) | -4.0 | 18.4 | -0.43 | nicht langsamer |
| geht | CPU-Takt p50 ms | 21.45 (21.40 · 21.50) | 23.85 (23.90 · 23.80) | +2.40 | 0.14 | 33.94 | LANGSAMER |
| geht | CPU-Takt p95 ms | 43.5 (41.8 · 45.2) | 49.3 (49.6 · 48.9) | +5.8 | 3.5 | 3.31 | LANGSAMER |
| geht | CPU-Takt p99 ms | 90.4 (87.3 · 93.6) | 95.9 (102.8 · 89.0) | +5.5 | 15.2 | 0.72 | nicht langsamer |
| geht | GPU-Durchsatz p50 ms | 22.65 (22.40 · 22.90) | 24.95 (24.90 · 25.00) | +2.30 | 0.51 | 9.02 | LANGSAMER |
| geht | k0 p50 ms | 0.11 (0.11 · 0.11) | 0.12 (0.12 · 0.12) | +0.01 | 0.00 | – | nicht langsamer |
| geht | GPU p95 ms (lauf) | 2.66 (2.81 · 2.51) | 2.66 (2.77 · 2.54) | -0.00 | 0.38 | -0.03 | nicht langsamer |
| geht | GPU je Bild ms (gpu-bank) | – (– · –) | – (– · –) | – | – | – | – |
| geht | Belegung p50 ms | 22.65 (22.38 · 22.92) | 24.98 (24.98 · 24.98) | +2.33 | 0.54 | 8.63 | LANGSAMER |
| geht | Belegung p95 ms | 48.17 (46.61 · 49.74) | 54.63 (54.40 · 54.86) | +6.45 | 3.16 | 4.08 | LANGSAMER |
| geht | außer Takt p95 ms | 2.61 (2.80 · 2.42) | 4.04 (4.40 · 3.67) | +1.43 | 0.82 | 3.46 | LANGSAMER |
| geht | Lebenszyklus p95 ms | 0.10 (0.10 · 0.10) | 0.11 (0.10 · 0.11) | +0.01 | 0.01 | 1.00 | nicht langsamer |
| geht | über 33 ms % | – (– · –) | – (– · –) | – | – | – | – |
| geht | KI-Uhr Mittel ms | – (– · –) | – (– · –) | – | – | – | – |
| geht | KI-Uhr p95 ms | – (– · –) | – (– · –) | – | – | – | – |
| geht | KI-Uhr p99 ms | – (– · –) | – (– · –) | – | – | – | – |
| geht | KI-Takt EWMA ms | 4.50 (4.56 · 4.45) | 4.25 (4.41 · 4.10) | -0.25 | 0.33 | -1.52 | nicht langsamer |

**KERN-URTEIL GEHEN stadt** (steht + geht × fps · Frame p95 · CPU-Takt p95 · GPU je Bild (gpu-bank, nur steht) · Belegung p95; Δ ≤ max(2σ gepoolt, Auflösung)): LANGSAMER an geht fps, geht Frame p95 ms, geht CPU-Takt p95 ms, geht Belegung p95 ms (8 Größen)
