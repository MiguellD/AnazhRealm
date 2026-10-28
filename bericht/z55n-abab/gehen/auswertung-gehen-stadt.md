## stadt — je Boot

| Boot | Gang | fps | Frame p50 ms | Frame p95 ms | Frame p99 ms | CPU-Takt p50 ms | CPU-Takt p95 ms | CPU-Takt p99 ms | GPU-Durchsatz p50 ms | k0 p50 ms | GPU p95 ms (lauf) | GPU je Bild ms (gpu-bank) | Belegung p50 ms | Belegung p95 ms | außer Takt p95 ms | Lebenszyklus p95 ms | über 33 ms % | KI-Uhr Mittel ms | KI-Uhr p95 ms | KI-Uhr p99 ms | KI-Takt EWMA ms |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| stadt-A1 | steht | 77.0 | 16.6 | 16.8 | 17.1 | 6.20 | 7.9 | 11.0 | 12.90 | 0.20 | 2.36 | – | 9.23 | 12.27 | 1.05 | 0.09 | – | – | – | – | 2.67 |
| stadt-A1 | geht-1 | 42.2 | 16.8 | 41.7 | 83.4 | 18.30 | 39.7 | 76.9 | 19.90 | 0.14 | 2.36 | – | 19.84 | 42.74 | 2.50 | 0.09 | – | – | – | – | 3.93 |
| stadt-A1 | Geher-Ende |  | | | | | | | | | | | | | | | | | | | |
| stadt-A2 | steht | 77.4 | 16.5 | 16.8 | 17.2 | 6.20 | 8.1 | 10.9 | 13.00 | 0.20 | 2.16 | – | 9.05 | 12.32 | 1.00 | 0.08 | – | – | – | – | 2.76 |
| stadt-A2 | geht-1 | 42.9 | 16.8 | 41.7 | 66.7 | 18.40 | 39.5 | 64.6 | 19.90 | 0.14 | 2.30 | – | 19.86 | 42.35 | 2.64 | 0.09 | – | – | – | – | 3.64 |
| stadt-A2 | Geher-Ende |  | | | | | | | | | | | | | | | | | | | |
| stadt-B1 | steht | 77.3 | 16.5 | 16.8 | 17.2 | 6.40 | 8.4 | 10.8 | 13.00 | 0.20 | 2.15 | – | 9.37 | 12.73 | 1.11 | 0.09 | – | – | – | – | 2.80 |
| stadt-B1 | geht-1 | 42.9 | 16.8 | 41.7 | 75.0 | 18.10 | 37.2 | 67.4 | 19.40 | 0.14 | 2.35 | – | 19.38 | 40.08 | 2.20 | 0.09 | – | – | – | – | 4.56 |
| stadt-B1 | Geher-Ende |  | | | | | | | | | | | | | | | | | | | |
| stadt-B2 | steht | 77.8 | 16.5 | 16.8 | 24.8 | 6.20 | 7.9 | 11.3 | 12.80 | 0.20 | 2.18 | – | 9.02 | 12.42 | 1.07 | 0.09 | – | – | – | – | 3.12 |
| stadt-B2 | geht-1 | 42.8 | 16.7 | 41.7 | 83.3 | 18.20 | 39.5 | 72.3 | 19.40 | 0.14 | 2.43 | – | 19.40 | 41.27 | 2.73 | 0.09 | – | – | – | – | 4.37 |
| stadt-B2 | Geher-Ende |  | | | | | | | | | | | | | | | | | | | |

## Tier-Zensus je Boot (zensus-0 nach umstellen · zensus-1 nach geht-1)

- stadt-A1: vorher 6 (deer 5, fox 1; Würfe≥2 1: deer 5 Spanne 2.5 m @222.2 m; Verband-Feld true, Verbände≥2 1: deer 5 Spanne 2.5 m; Zustand {"-":6})
  nachher 6 (deer 5, fox 1; Würfe≥2 1: deer 5 Spanne 2.4 m @222.8 m; Verband-Feld true, Verbände≥2 1: deer 5 Spanne 2.4 m; Zustand {"-":6})
- stadt-A2: vorher 6 (deer 5, fox 1; Würfe≥2 1: deer 5 Spanne 2.6 m @222.1 m; Verband-Feld true, Verbände≥2 1: deer 5 Spanne 2.6 m; Zustand {"-":6})
  nachher 6 (deer 5, fox 1; Würfe≥2 1: deer 5 Spanne 2.3 m @222.9 m; Verband-Feld true, Verbände≥2 1: deer 5 Spanne 2.3 m; Zustand {"-":6})
- stadt-B1: vorher 6 (deer 5, fox 1; Würfe≥2 1: deer 5 Spanne 2.5 m @222.1 m; Verband-Feld true, Verbände≥2 1: deer 5 Spanne 2.5 m; Zustand {"-":6})
  nachher 6 (deer 5, fox 1; Würfe≥2 1: deer 5 Spanne 2.4 m @222.8 m; Verband-Feld true, Verbände≥2 1: deer 5 Spanne 2.4 m; Zustand {"-":6})
- stadt-B2: vorher 6 (deer 5, fox 1; Würfe≥2 1: deer 5 Spanne 2.5 m @222.2 m; Verband-Feld true, Verbände≥2 1: deer 5 Spanne 2.5 m; Zustand {"-":6})
  nachher 6 (deer 5, fox 1; Würfe≥2 1: deer 5 Spanne 2.4 m @222.8 m; Verband-Feld true, Verbände≥2 1: deer 5 Spanne 2.4 m; Zustand {"-":6})

## GPU-Takt je Boot (nvidia-smi 1 s, nur P0-Sekunden: Median-MHz · Anteil Drossel (Grund ≠ 0 ohne GpuIdle 0x1) · max °C)

- stadt-A1: 151 s · 1721 MHz · Drossel 16 % · 87 °C
- stadt-A2: 194 s · 1404 MHz · Drossel 15 % · 87 °C
- stadt-B1: 167 s · 1721 MHz · Drossel 17 % · 86 °C
- stadt-B2: 172 s · 1721 MHz · Drossel 20 % · 87 °C

## Mittel je Seite (A 19606f2e · B a03b7b06; gehend = geht-1 je Boot)

| Gang | Größe | A | B | Δ B − A | 2σ | t (Welch) | Urteil |
|---|---|---|---|---|---|---|---|
| steht | fps | 77.2 (77.0 · 77.4) | 77.5 (77.3 · 77.8) | +0.3 | 0.6 | 1.09 | nicht langsamer |
| steht | Frame p50 ms | 16.6 (16.6 · 16.5) | 16.5 (16.5 · 16.5) | -0.1 | 0.1 | -1.00 | nicht langsamer |
| steht | Frame p95 ms | 16.8 (16.8 · 16.8) | 16.8 (16.8 · 16.8) | 0.0 | 0.0 | – | nicht langsamer |
| steht | Frame p99 ms | 17.1 (17.1 · 17.2) | 21.0 (17.2 · 24.8) | +3.9 | 7.6 | 1.01 | nicht langsamer |
| steht | CPU-Takt p50 ms | 6.20 (6.20 · 6.20) | 6.30 (6.40 · 6.20) | +0.10 | 0.20 | 1.00 | nicht langsamer |
| steht | CPU-Takt p95 ms | 8.0 (7.9 · 8.1) | 8.2 (8.4 · 7.9) | +0.2 | 0.5 | 0.56 | nicht langsamer |
| steht | CPU-Takt p99 ms | 10.9 (11.0 · 10.9) | 11.1 (10.8 · 11.3) | +0.1 | 0.5 | 0.39 | nicht langsamer |
| steht | GPU-Durchsatz p50 ms | 12.95 (12.90 · 13.00) | 12.90 (13.00 · 12.80) | -0.05 | 0.22 | -0.45 | nicht langsamer |
| steht | k0 p50 ms | 0.20 (0.20 · 0.20) | 0.20 (0.20 · 0.20) | 0.00 | 0.00 | – | nicht langsamer |
| steht | GPU p95 ms (lauf) | 2.26 (2.36 · 2.16) | 2.17 (2.15 · 2.18) | -0.09 | 0.20 | -0.94 | nicht langsamer |
| steht | GPU je Bild ms (gpu-bank) | – (– · –) | – (– · –) | – | – | – | – |
| steht | Belegung p50 ms | 9.14 (9.23 · 9.05) | 9.20 (9.37 · 9.02) | +0.05 | 0.39 | 0.28 | nicht langsamer |
| steht | Belegung p95 ms | 12.29 (12.27 · 12.32) | 12.57 (12.73 · 12.42) | +0.28 | 0.31 | 1.78 | nicht langsamer |
| steht | außer Takt p95 ms | 1.02 (1.05 · 1.00) | 1.09 (1.11 · 1.07) | +0.07 | 0.06 | 2.03 | LANGSAMER |
| steht | Lebenszyklus p95 ms | 0.08 (0.09 · 0.08) | 0.09 (0.09 · 0.09) | +0.01 | 0.01 | 1.00 | nicht langsamer |
| steht | über 33 ms % | – (– · –) | – (– · –) | – | – | – | – |
| steht | KI-Uhr Mittel ms | – (– · –) | – (– · –) | – | – | – | – |
| steht | KI-Uhr p95 ms | – (– · –) | – (– · –) | – | – | – | – |
| steht | KI-Uhr p99 ms | – (– · –) | – (– · –) | – | – | – | – |
| steht | KI-Takt EWMA ms | 2.71 (2.67 · 2.76) | 2.96 (2.80 · 3.12) | +0.25 | 0.33 | 1.47 | nicht langsamer |
| geht | fps | 42.5 (42.2 · 42.9) | 42.8 (42.9 · 42.8) | +0.3 | 0.7 | 0.85 | nicht langsamer |
| geht | Frame p50 ms | 16.8 (16.8 · 16.8) | 16.8 (16.8 · 16.7) | -0.1 | 0.1 | -1.00 | nicht langsamer |
| geht | Frame p95 ms | 41.7 (41.7 · 41.7) | 41.7 (41.7 · 41.7) | 0.0 | 0.0 | – | nicht langsamer |
| geht | Frame p99 ms | 75.1 (83.4 · 66.7) | 79.2 (75.0 · 83.3) | +4.1 | 18.6 | 0.44 | nicht langsamer |
| geht | CPU-Takt p50 ms | 18.35 (18.30 · 18.40) | 18.15 (18.10 · 18.20) | -0.20 | 0.14 | -2.83 | nicht langsamer |
| geht | CPU-Takt p95 ms | 39.6 (39.7 · 39.5) | 38.4 (37.2 · 39.5) | -1.3 | 2.3 | -1.08 | nicht langsamer |
| geht | CPU-Takt p99 ms | 70.8 (76.9 · 64.6) | 69.8 (67.4 · 72.3) | -0.9 | 13.2 | -0.14 | nicht langsamer |
| geht | GPU-Durchsatz p50 ms | 19.90 (19.90 · 19.90) | 19.40 (19.40 · 19.40) | -0.50 | 0.00 | – | nicht langsamer |
| geht | k0 p50 ms | 0.14 (0.14 · 0.14) | 0.14 (0.14 · 0.14) | 0.00 | 0.00 | – | nicht langsamer |
| geht | GPU p95 ms (lauf) | 2.33 (2.36 · 2.30) | 2.39 (2.35 · 2.43) | +0.06 | 0.10 | 1.20 | nicht langsamer |
| geht | GPU je Bild ms (gpu-bank) | – (– · –) | – (– · –) | – | – | – | – |
| geht | Belegung p50 ms | 19.85 (19.84 · 19.86) | 19.39 (19.38 · 19.40) | -0.46 | 0.03 | -32.53 | nicht langsamer |
| geht | Belegung p95 ms | 42.55 (42.74 · 42.35) | 40.67 (40.08 · 41.27) | -1.87 | 1.25 | -2.99 | nicht langsamer |
| geht | außer Takt p95 ms | 2.57 (2.50 · 2.64) | 2.46 (2.20 · 2.73) | -0.11 | 0.55 | -0.38 | nicht langsamer |
| geht | Lebenszyklus p95 ms | 0.09 (0.09 · 0.09) | 0.09 (0.09 · 0.09) | 0.00 | 0.00 | – | nicht langsamer |
| geht | über 33 ms % | – (– · –) | – (– · –) | – | – | – | – |
| geht | KI-Uhr Mittel ms | – (– · –) | – (– · –) | – | – | – | – |
| geht | KI-Uhr p95 ms | – (– · –) | – (– · –) | – | – | – | – |
| geht | KI-Uhr p99 ms | – (– · –) | – (– · –) | – | – | – | – |
| geht | KI-Takt EWMA ms | 3.79 (3.93 · 3.64) | 4.46 (4.56 · 4.37) | +0.68 | 0.35 | 3.92 | LANGSAMER |

**KERN-URTEIL GEHEN stadt** (steht + geht × fps · Frame p95 · CPU-Takt p95 · GPU je Bild (gpu-bank, nur steht) · Belegung p95; Δ ≤ max(2σ gepoolt, Auflösung)): nicht langsamer (8 Größen)
