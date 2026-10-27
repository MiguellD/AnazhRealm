## stadt — je Boot

| Boot | Gang | fps | Frame p50 ms | Frame p95 ms | Frame p99 ms | CPU-Takt p50 ms | CPU-Takt p95 ms | CPU-Takt p99 ms | GPU-Durchsatz p50 ms | k0 p50 ms | GPU p95 ms (lauf) | GPU je Bild ms (gpu-bank) | Belegung p50 ms | Belegung p95 ms | außer Takt p95 ms | Lebenszyklus p95 ms | über 33 ms % | KI-Uhr Mittel ms | KI-Uhr p95 ms | KI-Uhr p99 ms | KI-Takt EWMA ms |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| stadt-A1 | steht | 78.5 | 16.4 | 16.8 | 17.1 | 5.80 | 7.1 | 10.1 | 12.80 | 0.20 | 1.96 | – | 8.30 | 11.06 | 0.90 | 0.08 | – | – | – | – | 2.45 |
| stadt-A1 | geht-1 | 42.9 | 16.7 | 41.7 | 75.0 | 17.80 | 39.2 | 68.0 | 19.50 | 0.14 | 2.34 | – | 19.44 | 43.40 | 3.53 | 0.09 | – | – | – | – | 3.67 |
| stadt-A1 | Geher-Ende |  | | | | | | | | | | | | | | | | | | | |
| stadt-A2 | steht | 73.9 | 16.6 | 16.8 | 24.9 | 7.40 | 9.5 | 12.3 | 13.50 | 0.20 | 2.24 | – | 10.71 | 14.49 | 1.17 | 0.11 | – | – | – | – | 3.54 |
| stadt-A2 | geht-1 | 31.7 | 25.1 | 58.3 | 116.6 | 25.10 | 50.2 | 111.6 | 26.10 | 0.14 | 2.37 | – | 26.10 | 54.13 | 3.95 | 0.11 | – | – | – | – | 4.34 |
| stadt-A2 | Geher-Ende |  | | | | | | | | | | | | | | | | | | | |
| stadt-B1 | steht | 77.9 | 16.5 | 16.8 | 17.1 | 6.00 | 7.7 | 10.6 | 12.80 | 0.20 | 2.17 | – | 8.68 | 11.82 | 0.94 | 0.09 | – | – | – | – | 2.81 |
| stadt-B1 | geht-1 | 41.9 | 16.8 | 41.7 | 83.2 | 18.40 | 40.8 | 75.7 | 19.50 | 0.14 | 2.32 | – | 19.55 | 43.82 | 2.54 | 0.09 | – | – | – | – | 3.72 |
| stadt-B1 | Geher-Ende |  | | | | | | | | | | | | | | | | | | | |
| stadt-B2 | steht | 77.3 | 16.5 | 16.8 | 24.8 | 6.00 | 7.8 | 11.2 | 13.00 | 0.20 | 2.17 | – | 8.76 | 11.87 | 1.07 | 0.09 | – | – | – | – | 2.74 |
| stadt-B2 | geht-1 | 43.2 | 16.8 | 41.7 | 74.8 | 18.20 | 37.9 | 60.6 | 19.90 | 0.14 | 2.39 | – | 19.83 | 40.29 | 2.22 | 0.09 | – | – | – | – | 3.92 |
| stadt-B2 | Geher-Ende |  | | | | | | | | | | | | | | | | | | | |

## Tier-Zensus je Boot (zensus-0 nach umstellen · zensus-1 nach geht-1)

- stadt-A1: vorher 6 (deer 5, fox 1; Würfe≥2 1: deer 5 Spanne 2.5 m @222.1 m; Verband-Feld true, Verbände≥2 1: deer 5 Spanne 2.5 m; Zustand {"-":6})
  nachher 6 (deer 5, fox 1; Würfe≥2 1: deer 5 Spanne 2.4 m @222.8 m; Verband-Feld true, Verbände≥2 1: deer 5 Spanne 2.4 m; Zustand {"-":6})
- stadt-A2: vorher 6 (deer 5, fox 1; Würfe≥2 1: deer 5 Spanne 2.5 m @222.2 m; Verband-Feld true, Verbände≥2 1: deer 5 Spanne 2.5 m; Zustand {"-":6})
  nachher 6 (deer 5, fox 1; Würfe≥2 1: deer 5 Spanne 2.4 m @222.8 m; Verband-Feld true, Verbände≥2 1: deer 5 Spanne 2.4 m; Zustand {"-":6})
- stadt-B1: vorher 6 (deer 5, fox 1; Würfe≥2 1: deer 5 Spanne 2.5 m @222.2 m; Verband-Feld true, Verbände≥2 1: deer 5 Spanne 2.5 m; Zustand {"-":6})
  nachher 6 (deer 5, fox 1; Würfe≥2 1: deer 5 Spanne 2.4 m @222.8 m; Verband-Feld true, Verbände≥2 1: deer 5 Spanne 2.4 m; Zustand {"-":6})
- stadt-B2: vorher 6 (deer 5, fox 1; Würfe≥2 1: deer 5 Spanne 2.5 m @222.2 m; Verband-Feld true, Verbände≥2 1: deer 5 Spanne 2.5 m; Zustand {"-":6})
  nachher 6 (deer 5, fox 1; Würfe≥2 1: deer 5 Spanne 2.4 m @222.9 m; Verband-Feld true, Verbände≥2 1: deer 5 Spanne 2.4 m; Zustand {"-":6})

## GPU-Takt je Boot (nvidia-smi 1 s, nur P0-Sekunden: Median-MHz · Anteil Drossel (Grund ≠ 0 ohne GpuIdle 0x1) · max °C)

- stadt-A1: 185 s · 1721 MHz · Drossel 17 % · 87 °C
- stadt-A2: 202 s · 1556 MHz · Drossel 13 % · 86 °C
- stadt-B1: 198 s · 1695 MHz · Drossel 17 % · 87 °C
- stadt-B2: 135 s · 1733 MHz · Drossel 24 % · 87 °C

## Mittel je Seite (A 6db2602c · B 9fa32207; gehend = geht-1 je Boot)

| Gang | Größe | A | B | Δ B − A | 2σ | t (Welch) | Urteil |
|---|---|---|---|---|---|---|---|
| steht | fps | 76.2 (78.5 · 73.9) | 77.6 (77.9 · 77.3) | +1.4 | 4.6 | 0.60 | nicht langsamer |
| steht | Frame p50 ms | 16.5 (16.4 · 16.6) | 16.5 (16.5 · 16.5) | 0.0 | 0.2 | 0.00 | nicht langsamer |
| steht | Frame p95 ms | 16.8 (16.8 · 16.8) | 16.8 (16.8 · 16.8) | 0.0 | 0.0 | – | nicht langsamer |
| steht | Frame p99 ms | 21.0 (17.1 · 24.9) | 21.0 (17.1 · 24.8) | -0.0 | 11.0 | -0.01 | nicht langsamer |
| steht | CPU-Takt p50 ms | 6.60 (5.80 · 7.40) | 6.00 (6.00 · 6.00) | -0.60 | 1.60 | -0.75 | nicht langsamer |
| steht | CPU-Takt p95 ms | 8.3 (7.1 · 9.5) | 7.8 (7.7 · 7.8) | -0.6 | 2.4 | -0.46 | nicht langsamer |
| steht | CPU-Takt p99 ms | 11.2 (10.1 · 12.3) | 10.9 (10.6 · 11.2) | -0.3 | 2.3 | -0.26 | nicht langsamer |
| steht | GPU-Durchsatz p50 ms | 13.15 (12.80 · 13.50) | 12.90 (12.80 · 13.00) | -0.25 | 0.73 | -0.69 | nicht langsamer |
| steht | k0 p50 ms | 0.20 (0.20 · 0.20) | 0.20 (0.20 · 0.20) | 0.00 | 0.00 | – | nicht langsamer |
| steht | GPU p95 ms (lauf) | 2.10 (1.96 · 2.24) | 2.17 (2.17 · 2.17) | +0.07 | 0.28 | 0.50 | nicht langsamer |
| steht | GPU je Bild ms (gpu-bank) | – (– · –) | – (– · –) | – | – | – | – |
| steht | Belegung p50 ms | 9.51 (8.30 · 10.71) | 8.72 (8.68 · 8.76) | -0.79 | 2.41 | -0.65 | nicht langsamer |
| steht | Belegung p95 ms | 12.78 (11.06 · 14.49) | 11.84 (11.82 · 11.87) | -0.93 | 3.43 | -0.54 | nicht langsamer |
| steht | außer Takt p95 ms | 1.03 (0.90 · 1.17) | 1.00 (0.94 · 1.07) | -0.03 | 0.30 | -0.20 | nicht langsamer |
| steht | Lebenszyklus p95 ms | 0.10 (0.08 · 0.11) | 0.09 (0.09 · 0.09) | -0.01 | 0.03 | -0.33 | nicht langsamer |
| steht | über 33 ms % | – (– · –) | – (– · –) | – | – | – | – |
| steht | KI-Uhr Mittel ms | – (– · –) | – (– · –) | – | – | – | – |
| steht | KI-Uhr p95 ms | – (– · –) | – (– · –) | – | – | – | – |
| steht | KI-Uhr p99 ms | – (– · –) | – (– · –) | – | – | – | – |
| steht | KI-Takt EWMA ms | 3.00 (2.45 · 3.54) | 2.78 (2.81 · 2.74) | -0.22 | 1.09 | -0.40 | nicht langsamer |
| geht | fps | 37.3 (42.9 · 31.7) | 42.5 (41.9 · 43.2) | +5.3 | 11.3 | 0.93 | nicht langsamer |
| geht | Frame p50 ms | 20.9 (16.7 · 25.1) | 16.8 (16.8 · 16.8) | -4.1 | 8.4 | -0.98 | nicht langsamer |
| geht | Frame p95 ms | 50.0 (41.7 · 58.3) | 41.7 (41.7 · 41.7) | -8.3 | 16.6 | -1.00 | nicht langsamer |
| geht | Frame p99 ms | 95.8 (75.0 · 116.6) | 79.0 (83.2 · 74.8) | -16.8 | 42.4 | -0.79 | nicht langsamer |
| geht | CPU-Takt p50 ms | 21.45 (17.80 · 25.10) | 18.30 (18.40 · 18.20) | -3.15 | 7.30 | -0.86 | nicht langsamer |
| geht | CPU-Takt p95 ms | 44.7 (39.2 · 50.2) | 39.3 (40.8 · 37.9) | -5.4 | 11.4 | -0.94 | nicht langsamer |
| geht | CPU-Takt p99 ms | 89.8 (68.0 · 111.6) | 68.2 (75.7 · 60.6) | -21.6 | 46.1 | -0.94 | nicht langsamer |
| geht | GPU-Durchsatz p50 ms | 22.80 (19.50 · 26.10) | 19.70 (19.50 · 19.90) | -3.10 | 6.61 | -0.94 | nicht langsamer |
| geht | k0 p50 ms | 0.14 (0.14 · 0.14) | 0.14 (0.14 · 0.14) | 0.00 | 0.00 | – | nicht langsamer |
| geht | GPU p95 ms (lauf) | 2.35 (2.34 · 2.37) | 2.35 (2.32 · 2.39) | 0.00 | 0.08 | 0.00 | nicht langsamer |
| geht | GPU je Bild ms (gpu-bank) | – (– · –) | – (– · –) | – | – | – | – |
| geht | Belegung p50 ms | 22.77 (19.44 · 26.10) | 19.69 (19.55 · 19.83) | -3.08 | 6.67 | -0.92 | nicht langsamer |
| geht | Belegung p95 ms | 48.77 (43.40 · 54.13) | 42.05 (43.82 · 40.29) | -6.71 | 11.30 | -1.19 | nicht langsamer |
| geht | außer Takt p95 ms | 3.74 (3.53 · 3.95) | 2.38 (2.54 · 2.22) | -1.36 | 0.53 | -5.15 | nicht langsamer |
| geht | Lebenszyklus p95 ms | 0.10 (0.09 · 0.11) | 0.09 (0.09 · 0.09) | -0.01 | 0.02 | -1.00 | nicht langsamer |
| geht | über 33 ms % | – (– · –) | – (– · –) | – | – | – | – |
| geht | KI-Uhr Mittel ms | – (– · –) | – (– · –) | – | – | – | – |
| geht | KI-Uhr p95 ms | – (– · –) | – (– · –) | – | – | – | – |
| geht | KI-Uhr p99 ms | – (– · –) | – (– · –) | – | – | – | – |
| geht | KI-Takt EWMA ms | 4.00 (3.67 · 4.34) | 3.82 (3.72 · 3.92) | -0.18 | 0.70 | -0.53 | nicht langsamer |

**KERN-URTEIL GEHEN stadt** (steht + geht × fps · Frame p95 · CPU-Takt p95 · GPU je Bild (gpu-bank, nur steht) · Belegung p95; Δ ≤ max(2σ gepoolt, Auflösung)): nicht langsamer (8 Größen)
