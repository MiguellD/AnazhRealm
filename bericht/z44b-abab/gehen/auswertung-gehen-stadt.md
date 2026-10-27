## stadt — je Boot

| Boot | Gang | fps | Frame p50 ms | Frame p95 ms | Frame p99 ms | CPU-Takt p50 ms | CPU-Takt p95 ms | CPU-Takt p99 ms | GPU-Durchsatz p50 ms | k0 p50 ms | GPU p95 ms (lauf) | GPU je Bild ms (gpu-bank) | Belegung p50 ms | Belegung p95 ms | außer Takt p95 ms | Lebenszyklus p95 ms | über 33 ms % | KI-Uhr Mittel ms | KI-Uhr p95 ms | KI-Uhr p99 ms | KI-Takt EWMA ms |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| stadt-A1 | steht | 77.4 | 16.5 | 16.8 | 17.1 | 6.10 | 7.7 | 10.8 | 12.90 | 0.20 | 2.28 | – | 8.95 | 11.93 | 0.93 | 0.08 | – | – | – | – | 2.62 |
| stadt-A1 | geht-1 | 39.5 | 24.9 | 49.9 | 100.0 | 20.00 | 42.4 | 77.6 | 21.00 | 0.14 | 2.39 | – | 21.01 | 46.27 | 3.24 | 0.09 | – | – | – | – | 3.84 |
| stadt-A1 | Geher-Ende |  | | | | | | | | | | | | | | | | | | | |
| stadt-A2 | steht | 74.7 | 16.6 | 16.7 | 25.0 | 7.10 | 9.7 | 12.9 | 13.40 | 0.20 | 2.25 | – | 10.66 | 14.79 | 1.15 | 0.10 | – | – | – | – | 3.93 |
| stadt-A2 | geht-1 | 35.4 | 25.0 | 50.0 | 141.7 | 21.50 | 47.9 | 111.4 | 22.60 | 0.14 | 2.34 | – | 22.73 | 51.13 | 3.57 | 0.11 | – | – | – | – | 4.27 |
| stadt-A2 | Geher-Ende |  | | | | | | | | | | | | | | | | | | | |
| stadt-B1 | steht | 77.5 | 16.5 | 16.8 | 17.0 | 6.10 | 7.8 | 10.6 | 12.90 | 0.20 | 2.09 | – | 8.89 | 11.90 | 0.96 | 0.08 | – | – | – | – | 2.94 |
| stadt-B1 | geht-1 | 39.4 | 24.9 | 49.9 | 100.0 | 19.40 | 42.7 | 81.2 | 20.90 | 0.14 | 2.32 | – | 20.80 | 47.48 | 3.40 | 0.10 | – | – | – | – | 3.75 |
| stadt-B1 | Geher-Ende |  | | | | | | | | | | | | | | | | | | | |
| stadt-B2 | steht | 75.5 | 16.6 | 16.8 | 25.0 | 6.80 | 9.2 | 12.2 | 13.30 | 0.20 | 2.26 | – | 10.33 | 13.83 | 1.13 | 0.12 | – | – | – | – | 3.62 |
| stadt-B2 | geht-1 | 34.3 | 25.0 | 50.0 | 99.9 | 23.20 | 47.5 | 91.0 | 24.20 | 0.14 | 2.43 | – | 24.17 | 52.25 | 3.28 | 0.12 | – | – | – | – | 5.00 |
| stadt-B2 | Geher-Ende |  | | | | | | | | | | | | | | | | | | | |

## Tier-Zensus je Boot (zensus-0 nach umstellen · zensus-1 nach geht-1)

- stadt-A1: vorher 6 (deer 5, fox 1; Würfe≥2 1: deer 5 Spanne 2.6 m @222.2 m; Verband-Feld true, Verbände≥2 1: deer 5 Spanne 2.6 m; Zustand {"-":6})
  nachher 6 (deer 5, fox 1; Würfe≥2 1: deer 5 Spanne 2.3 m @222.9 m; Verband-Feld true, Verbände≥2 1: deer 5 Spanne 2.3 m; Zustand {"-":6})
- stadt-A2: vorher 6 (deer 5, fox 1; Würfe≥2 1: deer 5 Spanne 2.7 m @222.3 m; Verband-Feld true, Verbände≥2 1: deer 5 Spanne 2.7 m; Zustand {"-":6})
  nachher 6 (deer 5, fox 1; Würfe≥2 1: deer 5 Spanne 2.3 m @222.9 m; Verband-Feld true, Verbände≥2 1: deer 5 Spanne 2.3 m; Zustand {"-":6})
- stadt-B1: vorher 6 (deer 5, fox 1; Würfe≥2 1: deer 5 Spanne 2.6 m @222.2 m; Verband-Feld true, Verbände≥2 1: deer 5 Spanne 2.6 m; Zustand {"-":6})
  nachher 6 (deer 5, fox 1; Würfe≥2 1: deer 5 Spanne 2.3 m @222.9 m; Verband-Feld true, Verbände≥2 1: deer 5 Spanne 2.3 m; Zustand {"-":6})
- stadt-B2: vorher 6 (deer 5, fox 1; Würfe≥2 1: deer 5 Spanne 2.5 m @222.1 m; Verband-Feld true, Verbände≥2 1: deer 5 Spanne 2.5 m; Zustand {"-":6})
  nachher 6 (deer 5, fox 1; Würfe≥2 1: deer 5 Spanne 2.4 m @222.8 m; Verband-Feld true, Verbände≥2 1: deer 5 Spanne 2.4 m; Zustand {"-":6})

## GPU-Takt je Boot (nvidia-smi 1 s, nur P0-Sekunden: Median-MHz · Anteil Drossel (Grund ≠ 0 ohne GpuIdle 0x1) · max °C)

- stadt-A1: 152 s · 1733 MHz · Drossel 18 % · 86 °C
- stadt-A2: 171 s · 1721 MHz · Drossel 17 % · 86 °C
- stadt-B1: 186 s · 1708 MHz · Drossel 17 % · 86 °C
- stadt-B2: 168 s · 1721 MHz · Drossel 17 % · 87 °C

## Mittel je Seite (A 607d0c73 · B 5b8603c1; gehend = geht-1 je Boot)

| Gang | Größe | A | B | Δ B − A | 2σ | t (Welch) | Urteil |
|---|---|---|---|---|---|---|---|
| steht | fps | 76.1 (77.4 · 74.7) | 76.5 (77.5 · 75.5) | +0.4 | 3.4 | 0.27 | nicht langsamer |
| steht | Frame p50 ms | 16.6 (16.5 · 16.6) | 16.6 (16.5 · 16.6) | 0.0 | 0.1 | 0.00 | nicht langsamer |
| steht | Frame p95 ms | 16.8 (16.8 · 16.7) | 16.8 (16.8 · 16.8) | +0.1 | 0.1 | 1.00 | nicht langsamer |
| steht | Frame p99 ms | 21.1 (17.1 · 25.0) | 21.0 (17.0 · 25.0) | -0.1 | 11.2 | -0.01 | nicht langsamer |
| steht | CPU-Takt p50 ms | 6.60 (6.10 · 7.10) | 6.45 (6.10 · 6.80) | -0.15 | 1.22 | -0.25 | nicht langsamer |
| steht | CPU-Takt p95 ms | 8.7 (7.7 · 9.7) | 8.5 (7.8 · 9.2) | -0.2 | 2.4 | -0.16 | nicht langsamer |
| steht | CPU-Takt p99 ms | 11.9 (10.8 · 12.9) | 11.4 (10.6 · 12.2) | -0.5 | 2.6 | -0.34 | nicht langsamer |
| steht | GPU-Durchsatz p50 ms | 13.15 (12.90 · 13.40) | 13.10 (12.90 · 13.30) | -0.05 | 0.64 | -0.16 | nicht langsamer |
| steht | k0 p50 ms | 0.20 (0.20 · 0.20) | 0.20 (0.20 · 0.20) | 0.00 | 0.00 | – | nicht langsamer |
| steht | GPU p95 ms (lauf) | 2.26 (2.28 · 2.25) | 2.17 (2.09 · 2.26) | -0.09 | 0.17 | -1.04 | nicht langsamer |
| steht | GPU je Bild ms (gpu-bank) | – (– · –) | – (– · –) | – | – | – | – |
| steht | Belegung p50 ms | 9.80 (8.95 · 10.66) | 9.61 (8.89 · 10.33) | -0.20 | 2.24 | -0.17 | nicht langsamer |
| steht | Belegung p95 ms | 13.36 (11.93 · 14.79) | 12.87 (11.90 · 13.83) | -0.49 | 3.45 | -0.29 | nicht langsamer |
| steht | außer Takt p95 ms | 1.04 (0.93 · 1.15) | 1.04 (0.96 · 1.13) | +0.00 | 0.28 | 0.04 | nicht langsamer |
| steht | Lebenszyklus p95 ms | 0.09 (0.08 · 0.10) | 0.10 (0.08 · 0.12) | +0.01 | 0.04 | 0.45 | nicht langsamer |
| steht | über 33 ms % | – (– · –) | – (– · –) | – | – | – | – |
| steht | KI-Uhr Mittel ms | – (– · –) | – (– · –) | – | – | – | – |
| steht | KI-Uhr p95 ms | – (– · –) | – (– · –) | – | – | – | – |
| steht | KI-Uhr p99 ms | – (– · –) | – (– · –) | – | – | – | – |
| steht | KI-Takt EWMA ms | 3.28 (2.62 · 3.93) | 3.28 (2.94 · 3.62) | +0.00 | 1.48 | 0.01 | nicht langsamer |
| geht | fps | 37.5 (39.5 · 35.4) | 36.8 (39.4 · 34.3) | -0.6 | 6.5 | -0.18 | nicht langsamer |
| geht | Frame p50 ms | 24.9 (24.9 · 25.0) | 24.9 (24.9 · 25.0) | 0.0 | 0.1 | 0.00 | nicht langsamer |
| geht | Frame p95 ms | 50.0 (49.9 · 50.0) | 50.0 (49.9 · 50.0) | 0.0 | 0.1 | 0.00 | nicht langsamer |
| geht | Frame p99 ms | 120.8 (100.0 · 141.7) | 100.0 (100.0 · 99.9) | -20.9 | 41.7 | -1.00 | nicht langsamer |
| geht | CPU-Takt p50 ms | 20.75 (20.00 · 21.50) | 21.30 (19.40 · 23.20) | +0.55 | 4.09 | 0.27 | nicht langsamer |
| geht | CPU-Takt p95 ms | 45.1 (42.4 · 47.9) | 45.1 (42.7 · 47.5) | -0.0 | 7.3 | -0.01 | nicht langsamer |
| geht | CPU-Takt p99 ms | 94.5 (77.6 · 111.4) | 86.1 (81.2 · 91.0) | -8.4 | 35.2 | -0.48 | nicht langsamer |
| geht | GPU-Durchsatz p50 ms | 21.80 (21.00 · 22.60) | 22.55 (20.90 · 24.20) | +0.75 | 3.67 | 0.41 | nicht langsamer |
| geht | k0 p50 ms | 0.14 (0.14 · 0.14) | 0.14 (0.14 · 0.14) | 0.00 | 0.00 | – | nicht langsamer |
| geht | GPU p95 ms (lauf) | 2.37 (2.39 · 2.34) | 2.38 (2.32 · 2.43) | +0.01 | 0.12 | 0.17 | nicht langsamer |
| geht | GPU je Bild ms (gpu-bank) | – (– · –) | – (– · –) | – | – | – | – |
| geht | Belegung p50 ms | 21.87 (21.01 · 22.73) | 22.48 (20.80 · 24.17) | +0.61 | 3.78 | 0.33 | nicht langsamer |
| geht | Belegung p95 ms | 48.70 (46.27 · 51.13) | 49.86 (47.48 · 52.25) | +1.16 | 6.81 | 0.34 | nicht langsamer |
| geht | außer Takt p95 ms | 3.41 (3.24 · 3.57) | 3.34 (3.40 · 3.28) | -0.07 | 0.35 | -0.37 | nicht langsamer |
| geht | Lebenszyklus p95 ms | 0.10 (0.09 · 0.11) | 0.11 (0.10 · 0.12) | +0.01 | 0.03 | 0.71 | nicht langsamer |
| geht | über 33 ms % | – (– · –) | – (– · –) | – | – | – | – |
| geht | KI-Uhr Mittel ms | – (– · –) | – (– · –) | – | – | – | – |
| geht | KI-Uhr p95 ms | – (– · –) | – (– · –) | – | – | – | – |
| geht | KI-Uhr p99 ms | – (– · –) | – (– · –) | – | – | – | – |
| geht | KI-Takt EWMA ms | 4.05 (3.84 · 4.27) | 4.38 (3.75 · 5.00) | +0.32 | 1.32 | 0.48 | nicht langsamer |

**KERN-URTEIL GEHEN stadt** (steht + geht × fps · Frame p95 · CPU-Takt p95 · GPU je Bild (gpu-bank, nur steht) · Belegung p95; Δ ≤ max(2σ gepoolt, Auflösung)): nicht langsamer (8 Größen)
