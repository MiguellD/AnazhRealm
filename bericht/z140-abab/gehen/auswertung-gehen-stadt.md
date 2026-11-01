## stadt — je Boot

| Boot | Gang | fps | Frame p50 ms | Frame p95 ms | Frame p99 ms | CPU-Takt p50 ms | CPU-Takt p95 ms | CPU-Takt p99 ms | GPU-Durchsatz p50 ms | k0 p50 ms | GPU p95 ms (lauf) | GPU je Bild ms (gpu-bank) | Belegung p50 ms | Belegung p95 ms | außer Takt p95 ms | Lebenszyklus p95 ms | über 33 ms % | KI-Uhr Mittel ms | KI-Uhr p95 ms | KI-Uhr p99 ms | KI-Takt EWMA ms |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| stadt-A1 | steht | 65.2 | 16.6 | 25.1 | 25.2 | 8.90 | 11.5 | 14.8 | 15.20 | 0.25 | 2.45 | – | 12.64 | 18.34 | 1.60 | 0.09 | – | – | – | – | 2.59 |
| stadt-A1 | geht-1 | 30.2 | 25.4 | 58.4 | 100.0 | 27.60 | 51.1 | 100.6 | 28.40 | 0.11 | 2.52 | – | 28.44 | 57.93 | 3.39 | 0.13 | – | – | – | – | 4.00 |
| stadt-A1 | Geher-Ende |  | | | | | | | | | | | | | | | | | | | |
| stadt-A2 | steht | 67.0 | 16.6 | 25.0 | 25.1 | 8.40 | 10.7 | 14.5 | 14.90 | 0.25 | 2.65 | – | 12.19 | 16.73 | 1.55 | 0.08 | – | – | – | – | 2.60 |
| stadt-A2 | geht-1 | 29.8 | 33.2 | 58.3 | 116.7 | 28.60 | 51.0 | 107.9 | 29.20 | 0.11 | 2.55 | – | 29.33 | 57.46 | 3.74 | 0.13 | – | – | – | – | 3.47 |
| stadt-A2 | Geher-Ende |  | | | | | | | | | | | | | | | | | | | |
| stadt-B1 | steht | 67.9 | 16.6 | 24.9 | 25.1 | 7.50 | 10.6 | 15.2 | 14.70 | 0.25 | 2.56 | – | 11.19 | 16.44 | 1.62 | 0.20 | – | – | – | – | 2.36 |
| stadt-B1 | geht-1 | 32.9 | 25.0 | 58.3 | 91.7 | 24.80 | 50.4 | 79.0 | 25.90 | 0.11 | 2.47 | – | 25.83 | 58.09 | 3.11 | 0.22 | – | – | – | – | 2.96 |
| stadt-B1 | Geher-Ende |  | | | | | | | | | | | | | | | | | | | |
| stadt-B2 | steht | 68.1 | 16.6 | 24.9 | 25.1 | 7.60 | 10.6 | 15.3 | 14.70 | 0.25 | 2.68 | – | 11.38 | 16.24 | 1.65 | 0.19 | – | – | – | – | 2.34 |
| stadt-B2 | geht-1 | 32.5 | 25.0 | 58.4 | 100.0 | 24.90 | 52.4 | 87.3 | 25.50 | 0.11 | 2.48 | – | 25.55 | 62.61 | 3.96 | 0.20 | – | – | – | – | 3.25 |
| stadt-B2 | Geher-Ende |  | | | | | | | | | | | | | | | | | | | |

## Tier-Zensus je Boot (zensus-0 nach umstellen · zensus-1 nach geht-1)

- stadt-A1: vorher 6 (deer 2, wolf 4; Würfe≥2 2: deer 2 Spanne 2 m @111.1 m | wolf 4 Spanne 1.7 m @465.7 m; Verband-Feld true, Verbände≥2 2: deer 2 Spanne 2 m | wolf 4 Spanne 1.7 m; Zustand {"flucht":2,"-":2,"fressen":2})
  nachher 4 (wolf 4; Würfe≥2 1: wolf 4 Spanne 1.7 m @465.1 m; Verband-Feld true, Verbände≥2 1: wolf 4 Spanne 1.7 m; Zustand {"-":4})
- stadt-A2: vorher 7 (deer 3, wolf 4; Würfe≥2 2: deer 3 Spanne 1.9 m @123.7 m | wolf 4 Spanne 1.5 m @466 m; Verband-Feld true, Verbände≥2 2: deer 3 Spanne 1.9 m | wolf 4 Spanne 1.5 m; Zustand {"flucht":3,"-":2,"fressen":2})
  nachher 4 (wolf 4; Würfe≥2 1: wolf 4 Spanne 1.9 m @465.5 m; Verband-Feld true, Verbände≥2 1: wolf 4 Spanne 1.9 m; Zustand {"-":2,"fressen":2})
- stadt-B1: vorher 7 (deer 3, wolf 4; Würfe≥2 2: deer 3 Spanne 1.9 m @116.2 m | wolf 4 Spanne 1.6 m @466 m; Verband-Feld true, Verbände≥2 2: deer 3 Spanne 1.9 m | wolf 4 Spanne 1.6 m; Zustand {"flucht":3,"fressen":3,"-":1})
  nachher 4 (wolf 4; Würfe≥2 1: wolf 4 Spanne 1.7 m @466.4 m; Verband-Feld true, Verbände≥2 1: wolf 4 Spanne 1.7 m; Zustand {"-":3,"fressen":1})
- stadt-B2: vorher 7 (deer 3, wolf 4; Würfe≥2 2: deer 3 Spanne 2.1 m @112.3 m | wolf 4 Spanne 1.2 m @466.5 m; Verband-Feld true, Verbände≥2 2: deer 3 Spanne 2.1 m | wolf 4 Spanne 1.2 m; Zustand {"flucht":3,"fressen":3,"-":1})
  nachher 4 (wolf 4; Würfe≥2 1: wolf 4 Spanne 1.8 m @465.3 m; Verband-Feld true, Verbände≥2 1: wolf 4 Spanne 1.8 m; Zustand {"fressen":3,"-":1})

## GPU-Takt je Boot (nvidia-smi 1 s, nur P0-Sekunden: Median-MHz · Anteil Drossel (Grund ≠ 0 ohne GpuIdle 0x1) · max °C)

- stadt-A1: 170 s · 1771 MHz · Drossel 15 % · 86 °C
- stadt-A2: 164 s · 1771 MHz · Drossel 21 % · 86 °C
- stadt-B1: 161 s · 1759 MHz · Drossel 17 % · 87 °C
- stadt-B2: 165 s · 1759 MHz · Drossel 22 % · 87 °C

## Mittel je Seite (A 25ac4c0c · B 1e90e7cd; gehend = geht-1 je Boot)

| Gang | Größe | A | B | Δ B − A | 2σ | t (Welch) | Urteil |
|---|---|---|---|---|---|---|---|
| steht | fps | 66.1 (65.2 · 67.0) | 68.0 (67.9 · 68.1) | +1.9 | 1.8 | 2.10 | nicht langsamer |
| steht | Frame p50 ms | 16.6 (16.6 · 16.6) | 16.6 (16.6 · 16.6) | 0.0 | 0.0 | – | nicht langsamer |
| steht | Frame p95 ms | 25.1 (25.1 · 25.0) | 24.9 (24.9 · 24.9) | -0.2 | 0.1 | -3.00 | nicht langsamer |
| steht | Frame p99 ms | 25.1 (25.2 · 25.1) | 25.1 (25.1 · 25.1) | -0.0 | 0.1 | -1.00 | nicht langsamer |
| steht | CPU-Takt p50 ms | 8.65 (8.90 · 8.40) | 7.55 (7.50 · 7.60) | -1.10 | 0.51 | -4.31 | nicht langsamer |
| steht | CPU-Takt p95 ms | 11.1 (11.5 · 10.7) | 10.6 (10.6 · 10.6) | -0.5 | 0.8 | -1.25 | nicht langsamer |
| steht | CPU-Takt p99 ms | 14.7 (14.8 · 14.5) | 15.3 (15.2 · 15.3) | +0.6 | 0.3 | 3.79 | LANGSAMER |
| steht | GPU-Durchsatz p50 ms | 15.05 (15.20 · 14.90) | 14.70 (14.70 · 14.70) | -0.35 | 0.30 | -2.33 | nicht langsamer |
| steht | k0 p50 ms | 0.25 (0.25 · 0.25) | 0.25 (0.25 · 0.25) | 0.00 | 0.00 | – | nicht langsamer |
| steht | GPU p95 ms (lauf) | 2.55 (2.45 · 2.65) | 2.62 (2.56 · 2.68) | +0.07 | 0.23 | 0.60 | nicht langsamer |
| steht | GPU je Bild ms (gpu-bank) | – (– · –) | – (– · –) | – | – | – | – |
| steht | Belegung p50 ms | 12.41 (12.64 · 12.19) | 11.29 (11.19 · 11.38) | -1.13 | 0.49 | -4.63 | nicht langsamer |
| steht | Belegung p95 ms | 17.54 (18.34 · 16.73) | 16.34 (16.44 · 16.24) | -1.20 | 1.62 | -1.47 | nicht langsamer |
| steht | außer Takt p95 ms | 1.58 (1.60 · 1.55) | 1.64 (1.62 · 1.65) | +0.06 | 0.06 | 2.06 | LANGSAMER |
| steht | Lebenszyklus p95 ms | 0.08 (0.09 · 0.08) | 0.20 (0.20 · 0.19) | +0.11 | 0.01 | 15.56 | LANGSAMER |
| steht | über 33 ms % | – (– · –) | – (– · –) | – | – | – | – |
| steht | KI-Uhr Mittel ms | – (– · –) | – (– · –) | – | – | – | – |
| steht | KI-Uhr p95 ms | – (– · –) | – (– · –) | – | – | – | – |
| steht | KI-Uhr p99 ms | – (– · –) | – (– · –) | – | – | – | – |
| steht | KI-Takt EWMA ms | 2.59 (2.59 · 2.60) | 2.35 (2.36 · 2.34) | -0.25 | 0.02 | -21.91 | nicht langsamer |
| geht | fps | 30.0 (30.2 · 29.8) | 32.7 (32.9 · 32.5) | +2.7 | 0.6 | 9.55 | nicht langsamer |
| geht | Frame p50 ms | 29.3 (25.4 · 33.2) | 25.0 (25.0 · 25.0) | -4.3 | 7.8 | -1.10 | nicht langsamer |
| geht | Frame p95 ms | 58.3 (58.4 · 58.3) | 58.3 (58.3 · 58.4) | 0.0 | 0.1 | 0.00 | nicht langsamer |
| geht | Frame p99 ms | 108.3 (100.0 · 116.7) | 95.8 (91.7 · 100.0) | -12.5 | 18.6 | -1.34 | nicht langsamer |
| geht | CPU-Takt p50 ms | 28.10 (27.60 · 28.60) | 24.85 (24.80 · 24.90) | -3.25 | 1.00 | -6.47 | nicht langsamer |
| geht | CPU-Takt p95 ms | 51.0 (51.1 · 51.0) | 51.4 (50.4 · 52.4) | +0.4 | 2.0 | 0.35 | nicht langsamer |
| geht | CPU-Takt p99 ms | 104.3 (100.6 · 107.9) | 83.2 (79.0 · 87.3) | -21.1 | 11.1 | -3.82 | nicht langsamer |
| geht | GPU-Durchsatz p50 ms | 28.80 (28.40 · 29.20) | 25.70 (25.90 · 25.50) | -3.10 | 0.89 | -6.93 | nicht langsamer |
| geht | k0 p50 ms | 0.11 (0.11 · 0.11) | 0.11 (0.11 · 0.11) | 0.00 | 0.00 | – | nicht langsamer |
| geht | GPU p95 ms (lauf) | 2.54 (2.52 · 2.55) | 2.48 (2.47 · 2.48) | -0.06 | 0.03 | -3.79 | nicht langsamer |
| geht | GPU je Bild ms (gpu-bank) | – (– · –) | – (– · –) | – | – | – | – |
| geht | Belegung p50 ms | 28.88 (28.44 · 29.33) | 25.69 (25.83 · 25.55) | -3.20 | 0.93 | -6.85 | nicht langsamer |
| geht | Belegung p95 ms | 57.70 (57.93 · 57.46) | 60.35 (58.09 · 62.61) | +2.66 | 4.54 | 1.17 | nicht langsamer |
| geht | außer Takt p95 ms | 3.57 (3.39 · 3.74) | 3.54 (3.11 · 3.96) | -0.03 | 0.92 | -0.07 | nicht langsamer |
| geht | Lebenszyklus p95 ms | 0.13 (0.13 · 0.13) | 0.21 (0.22 · 0.20) | +0.08 | 0.02 | 8.00 | LANGSAMER |
| geht | über 33 ms % | – (– · –) | – (– · –) | – | – | – | – |
| geht | KI-Uhr Mittel ms | – (– · –) | – (– · –) | – | – | – | – |
| geht | KI-Uhr p95 ms | – (– · –) | – (– · –) | – | – | – | – |
| geht | KI-Uhr p99 ms | – (– · –) | – (– · –) | – | – | – | – |
| geht | KI-Takt EWMA ms | 3.74 (4.00 · 3.47) | 3.10 (2.96 · 3.25) | -0.63 | 0.60 | -2.09 | nicht langsamer |

**KERN-URTEIL GEHEN stadt** (steht + geht × fps · Frame p95 · CPU-Takt p95 · GPU je Bild (gpu-bank, nur steht) · Belegung p95; Δ ≤ max(2σ gepoolt, Auflösung)): nicht langsamer (8 Größen)
