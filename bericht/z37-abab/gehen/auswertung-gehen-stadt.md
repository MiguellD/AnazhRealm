## stadt — je Boot

| Boot | Gang | fps | Frame p50 ms | Frame p95 ms | Frame p99 ms | CPU-Takt p50 ms | CPU-Takt p95 ms | CPU-Takt p99 ms | GPU-Durchsatz p50 ms | k0 p50 ms | GPU p95 ms (lauf) | GPU je Bild ms (gpu-bank) | Belegung p50 ms | Belegung p95 ms | außer Takt p95 ms | Lebenszyklus p95 ms | über 33 ms % | KI-Uhr Mittel ms | KI-Uhr p95 ms | KI-Uhr p99 ms | KI-Takt EWMA ms |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| stadt-A1 | steht | 77.0 | 16.5 | 16.8 | 17.0 | 5.60 | 7.1 | 9.5 | 12.80 | 0.20 | 2.06 | – | 8.16 | 11.06 | 1.00 | 0.07 | – | – | – | – | 2.44 |
| stadt-A1 | geht-1 | 42.0 | 16.8 | 41.7 | 83.4 | 18.40 | 38.5 | 69.8 | 19.70 | 0.14 | 2.28 | – | 19.67 | 41.22 | 3.19 | 0.09 | – | – | – | – | 2.85 |
| stadt-A1 | Geher-Ende |  | | | | | | | | | | | | | | | | | | | |
| stadt-A2 | steht | 76.4 | 16.5 | 16.8 | 17.0 | 5.90 | 7.5 | 10.4 | 12.90 | 0.20 | 2.10 | – | 8.65 | 11.59 | 0.99 | 0.08 | – | – | – | – | 2.73 |
| stadt-A2 | geht-1 | 40.8 | 16.8 | 41.7 | 83.3 | 19.00 | 40.3 | 73.8 | 20.10 | 0.14 | 2.36 | – | 19.97 | 43.32 | 2.23 | 0.09 | – | – | – | – | 2.62 |
| stadt-A2 | Geher-Ende |  | | | | | | | | | | | | | | | | | | | |
| stadt-B1 | steht | 78.0 | 16.5 | 16.8 | 17.0 | 5.70 | 7.5 | 10.1 | 12.80 | 0.20 | 2.10 | – | 8.32 | 11.11 | 0.93 | 0.09 | – | – | – | – | 2.45 |
| stadt-B1 | geht-1 | 44.6 | 16.7 | 41.6 | 66.7 | 17.90 | 36.9 | 56.3 | 19.40 | 0.14 | 2.35 | – | 19.31 | 38.71 | 1.94 | 0.09 | – | – | – | – | 3.60 |
| stadt-B1 | Geher-Ende |  | | | | | | | | | | | | | | | | | | | |
| stadt-B2 | steht | 77.9 | 16.5 | 16.8 | 17.1 | 5.80 | 7.5 | 10.4 | 12.80 | 0.20 | 2.08 | – | 8.46 | 11.28 | 0.93 | 0.10 | – | – | – | – | 2.92 |
| stadt-B2 | geht-1 | 42.8 | 16.8 | 41.7 | 75.0 | 18.40 | 38.7 | 68.1 | 19.70 | 0.14 | 2.38 | – | 19.70 | 42.08 | 2.29 | 0.09 | – | – | – | – | 3.86 |
| stadt-B2 | Geher-Ende |  | | | | | | | | | | | | | | | | | | | |

## Tier-Zensus je Boot (zensus-0 nach umstellen · zensus-1 nach geht-1)

- stadt-A1: vorher 6 (deer 5, fox 1; Würfe≥2 1: deer 5 Spanne 2.6 m @222.2 m; Verband-Feld true, Verbände≥2 1: deer 5 Spanne 2.6 m; Zustand {"-":6})
  nachher 6 (deer 5, fox 1; Würfe≥2 1: deer 5 Spanne 2.6 m @222.8 m; Verband-Feld true, Verbände≥2 1: deer 5 Spanne 2.6 m; Zustand {"-":6})
- stadt-A2: vorher 6 (deer 5, fox 1; Würfe≥2 1: deer 5 Spanne 2.5 m @222.2 m; Verband-Feld true, Verbände≥2 1: deer 5 Spanne 2.5 m; Zustand {"-":6})
  nachher 6 (deer 5, fox 1; Würfe≥2 1: deer 5 Spanne 2.6 m @222.8 m; Verband-Feld true, Verbände≥2 1: deer 5 Spanne 2.6 m; Zustand {"-":6})
- stadt-B1: vorher 6 (deer 5, fox 1; Würfe≥2 1: deer 5 Spanne 2.5 m @222.2 m; Verband-Feld true, Verbände≥2 1: deer 5 Spanne 2.5 m; Zustand {"-":6})
  nachher 6 (deer 5, fox 1; Würfe≥2 1: deer 5 Spanne 2.4 m @222.8 m; Verband-Feld true, Verbände≥2 1: deer 5 Spanne 2.4 m; Zustand {"-":6})
- stadt-B2: vorher 6 (deer 5, fox 1; Würfe≥2 1: deer 5 Spanne 2.5 m @222.2 m; Verband-Feld true, Verbände≥2 1: deer 5 Spanne 2.5 m; Zustand {"-":6})
  nachher 6 (deer 5, fox 1; Würfe≥2 1: deer 5 Spanne 2.4 m @222.8 m; Verband-Feld true, Verbände≥2 1: deer 5 Spanne 2.4 m; Zustand {"-":6})

## GPU-Takt je Boot (nvidia-smi 1 s, nur P0-Sekunden: Median-MHz · Anteil Drossel (Grund ≠ 0 ohne GpuIdle 0x1) · max °C)

- stadt-A1: 184 s · 1721 MHz · Drossel 18 % · 86 °C
- stadt-A2: 179 s · 1721 MHz · Drossel 22 % · 86 °C
- stadt-B1: 146 s · 1733 MHz · Drossel 23 % · 86 °C
- stadt-B2: 178 s · 1721 MHz · Drossel 19 % · 86 °C

## Mittel je Seite (A eeaff9d6 · B 9ceeca71; gehend = geht-1 je Boot)

| Gang | Größe | A | B | Δ B − A | 2σ | t (Welch) | Urteil |
|---|---|---|---|---|---|---|---|
| steht | fps | 76.7 (77.0 · 76.4) | 78.0 (78.0 · 77.9) | +1.3 | 0.6 | 4.11 | nicht langsamer |
| steht | Frame p50 ms | 16.5 (16.5 · 16.5) | 16.5 (16.5 · 16.5) | 0.0 | 0.0 | – | nicht langsamer |
| steht | Frame p95 ms | 16.8 (16.8 · 16.8) | 16.8 (16.8 · 16.8) | 0.0 | 0.0 | – | nicht langsamer |
| steht | Frame p99 ms | 17.0 (17.0 · 17.0) | 17.1 (17.0 · 17.1) | +0.1 | 0.1 | 1.00 | nicht langsamer |
| steht | CPU-Takt p50 ms | 5.75 (5.60 · 5.90) | 5.75 (5.70 · 5.80) | 0.00 | 0.32 | 0.00 | nicht langsamer |
| steht | CPU-Takt p95 ms | 7.3 (7.1 · 7.5) | 7.5 (7.5 · 7.5) | +0.2 | 0.4 | 1.00 | nicht langsamer |
| steht | CPU-Takt p99 ms | 9.9 (9.5 · 10.4) | 10.3 (10.1 · 10.4) | +0.3 | 0.9 | 0.63 | nicht langsamer |
| steht | GPU-Durchsatz p50 ms | 12.85 (12.80 · 12.90) | 12.80 (12.80 · 12.80) | -0.05 | 0.10 | -1.00 | nicht langsamer |
| steht | k0 p50 ms | 0.20 (0.20 · 0.20) | 0.20 (0.20 · 0.20) | 0.00 | 0.00 | – | nicht langsamer |
| steht | GPU p95 ms (lauf) | 2.08 (2.06 · 2.10) | 2.09 (2.10 · 2.08) | +0.01 | 0.04 | 0.45 | nicht langsamer |
| steht | GPU je Bild ms (gpu-bank) | – (– · –) | – (– · –) | – | – | – | – |
| steht | Belegung p50 ms | 8.41 (8.16 · 8.65) | 8.39 (8.32 · 8.46) | -0.02 | 0.51 | -0.06 | nicht langsamer |
| steht | Belegung p95 ms | 11.32 (11.06 · 11.59) | 11.20 (11.11 · 11.28) | -0.13 | 0.56 | -0.47 | nicht langsamer |
| steht | außer Takt p95 ms | 0.99 (1.00 · 0.99) | 0.93 (0.93 · 0.93) | -0.06 | 0.01 | -13.00 | nicht langsamer |
| steht | Lebenszyklus p95 ms | 0.08 (0.07 · 0.08) | 0.10 (0.09 · 0.10) | +0.02 | 0.01 | 2.83 | LANGSAMER |
| steht | über 33 ms % | – (– · –) | – (– · –) | – | – | – | – |
| steht | KI-Uhr Mittel ms | – (– · –) | – (– · –) | – | – | – | – |
| steht | KI-Uhr p95 ms | – (– · –) | – (– · –) | – | – | – | – |
| steht | KI-Uhr p99 ms | – (– · –) | – (– · –) | – | – | – | – |
| steht | KI-Takt EWMA ms | 2.58 (2.44 · 2.73) | 2.69 (2.45 · 2.92) | +0.10 | 0.55 | 0.36 | nicht langsamer |
| geht | fps | 41.4 (42.0 · 40.8) | 43.7 (44.6 · 42.8) | +2.3 | 2.2 | 2.13 | nicht langsamer |
| geht | Frame p50 ms | 16.8 (16.8 · 16.8) | 16.8 (16.7 · 16.8) | -0.1 | 0.1 | -1.00 | nicht langsamer |
| geht | Frame p95 ms | 41.7 (41.7 · 41.7) | 41.7 (41.6 · 41.7) | -0.0 | 0.1 | -1.00 | nicht langsamer |
| geht | Frame p99 ms | 83.3 (83.4 · 83.3) | 70.8 (66.7 · 75.0) | -12.5 | 8.3 | -3.01 | nicht langsamer |
| geht | CPU-Takt p50 ms | 18.70 (18.40 · 19.00) | 18.15 (17.90 · 18.40) | -0.55 | 0.78 | -1.41 | nicht langsamer |
| geht | CPU-Takt p95 ms | 39.4 (38.5 · 40.3) | 37.8 (36.9 · 38.7) | -1.6 | 2.5 | -1.26 | nicht langsamer |
| geht | CPU-Takt p99 ms | 71.8 (69.8 · 73.8) | 62.2 (56.3 · 68.1) | -9.6 | 12.5 | -1.54 | nicht langsamer |
| geht | GPU-Durchsatz p50 ms | 19.90 (19.70 · 20.10) | 19.55 (19.40 · 19.70) | -0.35 | 0.50 | -1.40 | nicht langsamer |
| geht | k0 p50 ms | 0.14 (0.14 · 0.14) | 0.14 (0.14 · 0.14) | 0.00 | 0.00 | – | nicht langsamer |
| geht | GPU p95 ms (lauf) | 2.32 (2.28 · 2.36) | 2.37 (2.35 · 2.38) | +0.05 | 0.09 | 1.05 | nicht langsamer |
| geht | GPU je Bild ms (gpu-bank) | – (– · –) | – (– · –) | – | – | – | – |
| geht | Belegung p50 ms | 19.82 (19.67 · 19.97) | 19.50 (19.31 · 19.70) | -0.32 | 0.49 | -1.28 | nicht langsamer |
| geht | Belegung p95 ms | 42.27 (41.22 · 43.32) | 40.39 (38.71 · 42.08) | -1.88 | 3.97 | -0.94 | nicht langsamer |
| geht | außer Takt p95 ms | 2.71 (3.19 · 2.23) | 2.12 (1.94 · 2.29) | -0.59 | 1.02 | -1.16 | nicht langsamer |
| geht | Lebenszyklus p95 ms | 0.09 (0.09 · 0.09) | 0.09 (0.09 · 0.09) | 0.00 | 0.00 | – | nicht langsamer |
| geht | über 33 ms % | – (– · –) | – (– · –) | – | – | – | – |
| geht | KI-Uhr Mittel ms | – (– · –) | – (– · –) | – | – | – | – |
| geht | KI-Uhr p95 ms | – (– · –) | – (– · –) | – | – | – | – |
| geht | KI-Uhr p99 ms | – (– · –) | – (– · –) | – | – | – | – |
| geht | KI-Takt EWMA ms | 2.74 (2.85 · 2.62) | 3.73 (3.60 · 3.86) | +0.99 | 0.35 | 5.73 | LANGSAMER |

**KERN-URTEIL GEHEN stadt** (steht + geht × fps · Frame p95 · CPU-Takt p95 · GPU je Bild (gpu-bank, nur steht) · Belegung p95; Δ ≤ max(2σ gepoolt, Auflösung)): nicht langsamer (8 Größen)
