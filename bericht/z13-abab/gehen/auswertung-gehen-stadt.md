## stadt — je Boot

| Boot | Gang | fps | Frame p50 ms | Frame p95 ms | Frame p99 ms | CPU-Takt p50 ms | CPU-Takt p95 ms | CPU-Takt p99 ms | GPU-Durchsatz p50 ms | k0 p50 ms | GPU p95 ms (lauf) | GPU je Bild ms (gpu-bank) | Belegung p50 ms | Belegung p95 ms | außer Takt p95 ms | Lebenszyklus p95 ms | über 33 ms % | KI-Uhr Mittel ms | KI-Uhr p95 ms | KI-Uhr p99 ms | KI-Takt EWMA ms |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| stadt-A1 | steht | 79.8 | 8.6 | 16.8 | 20.1 | 4.70 | 6.2 | 10.6 | 12.00 | 0.26 | 2.81 | – | 6.52 | 9.41 | 1.19 | 0.08 | – | – | – | – | 1.91 |
| stadt-A1 | geht-1 | 43.2 | 16.7 | 41.7 | 83.5 | 18.30 | 37.9 | 65.5 | 19.60 | 0.35 | 2.18 | – | 19.56 | 42.38 | 3.70 | 0.11 | – | – | – | – | 1.64 |
| stadt-A1 | Geher-Ende |  | | | | | | | | | | | | | | | | | | | |
| stadt-A2 | steht | 78.9 | 16.3 | 16.8 | 17.1 | 5.10 | 7.0 | 8.9 | 12.60 | 0.26 | 3.16 | – | 7.10 | 10.04 | 0.78 | 0.08 | – | – | – | – | 2.15 |
| stadt-A2 | geht-1 | 39.4 | 24.9 | 49.9 | 91.7 | 20.30 | 41.4 | 82.4 | 21.30 | 0.36 | 2.46 | – | 21.27 | 47.19 | 3.63 | 0.14 | – | – | – | – | 1.84 |
| stadt-A2 | Geher-Ende |  | | | | | | | | | | | | | | | | | | | |
| stadt-B1 | steht | 78.9 | 16.3 | 16.8 | 17.1 | 5.00 | 6.5 | 8.2 | 12.70 | 0.10 | 2.93 | – | 6.86 | 9.55 | 0.80 | 0.09 | – | – | – | – | 2.10 |
| stadt-B1 | geht-1 | 39.6 | 24.9 | 49.9 | 100.0 | 19.80 | 41.7 | 86.6 | 21.20 | 0.23 | 2.51 | – | 21.23 | 46.96 | 4.31 | 0.15 | – | – | – | – | 1.74 |
| stadt-B1 | Geher-Ende |  | | | | | | | | | | | | | | | | | | | |
| stadt-B2 | steht | 78.9 | 16.3 | 16.8 | 17.1 | 4.90 | 6.5 | 8.6 | 12.60 | 0.10 | 3.02 | – | 6.78 | 9.47 | 0.77 | 0.08 | – | – | – | – | 1.95 |
| stadt-B2 | geht-1 | 43.9 | 16.8 | 41.6 | 66.7 | 18.40 | 36.6 | 60.3 | 19.80 | 0.23 | 2.43 | – | 19.74 | 39.33 | 3.43 | 0.10 | – | – | – | – | 1.52 |
| stadt-B2 | Geher-Ende |  | | | | | | | | | | | | | | | | | | | |

## Tier-Zensus je Boot (zensus-0 nach umstellen · zensus-1 nach geht-1)

- stadt-A1: vorher 8 (deer 7, fox 1; Würfe≥2 1: deer 7 Spanne 3.8 m @176.7 m; Verband-Feld true, Verbände≥2 1: deer 7 Spanne 3.8 m; Zustand {"-":8})
  nachher 8 (deer 7, fox 1; Würfe≥2 1: deer 7 Spanne 4.1 m @179.9 m; Verband-Feld true, Verbände≥2 1: deer 7 Spanne 4.1 m; Zustand {"-":8})
- stadt-A2: vorher 3 (deer 3; Würfe≥2 1: deer 3 Spanne 2.2 m @208.2 m; Verband-Feld true, Verbände≥2 1: deer 3 Spanne 2.2 m; Zustand {"-":3})
  nachher 7 (deer 7; Würfe≥2 2: deer 3 Spanne 2.3 m @204.6 m | deer 4 Spanne 3 m @158.2 m; Verband-Feld true, Verbände≥2 2: deer 3 Spanne 2.3 m | deer 4 Spanne 3 m; Zustand {"-":7})
- stadt-B1: vorher 6 (deer 5, fox 1; Würfe≥2 1: deer 5 Spanne 4.1 m @183.9 m; Verband-Feld true, Verbände≥2 1: deer 5 Spanne 4.1 m; Zustand {"-":5,"fressen":1})
  nachher 7 (deer 5, fox 1, bear 1; Würfe≥2 1: deer 5 Spanne 4 m @185.8 m; Verband-Feld true, Verbände≥2 1: deer 5 Spanne 4 m; Zustand {"-":7})
- stadt-B2: vorher 7 (deer 6, fox 1; Würfe≥2 1: deer 6 Spanne 4.1 m @181.7 m; Verband-Feld true, Verbände≥2 1: deer 6 Spanne 4.1 m; Zustand {"-":7})
  nachher 6 (deer 5, fox 1; Würfe≥2 1: deer 5 Spanne 4.3 m @184 m; Verband-Feld true, Verbände≥2 1: deer 5 Spanne 4.3 m; Zustand {"-":6})

## GPU-Takt je Boot (nvidia-smi 1 s, nur P0-Sekunden: Median-MHz · Anteil Drossel (Grund ≠ 0 ohne GpuIdle 0x1) · max °C)

- stadt-A1: 208 s · 1683 MHz · Drossel 9 % · 85 °C
- stadt-A2: 198 s · 1404 MHz · Drossel 11 % · 85 °C
- stadt-B1: 168 s · 1746 MHz · Drossel 11 % · 85 °C
- stadt-B2: 148 s · 1746 MHz · Drossel 18 % · 86 °C

## Mittel je Seite (A 833bbc24 · B 18a84649; gehend = geht-1 je Boot)

| Gang | Größe | A | B | Δ B − A | 2σ | t (Welch) | Urteil |
|---|---|---|---|---|---|---|---|
| steht | fps | 79.3 (79.8 · 78.9) | 78.9 (78.9 · 78.9) | -0.4 | 0.9 | -1.00 | nicht langsamer |
| steht | Frame p50 ms | 12.4 (8.6 · 16.3) | 16.3 (16.3 · 16.3) | +3.9 | 7.7 | 1.00 | nicht langsamer |
| steht | Frame p95 ms | 16.8 (16.8 · 16.8) | 16.8 (16.8 · 16.8) | 0.0 | 0.0 | – | nicht langsamer |
| steht | Frame p99 ms | 18.6 (20.1 · 17.1) | 17.1 (17.1 · 17.1) | -1.5 | 3.0 | -1.00 | nicht langsamer |
| steht | CPU-Takt p50 ms | 4.90 (4.70 · 5.10) | 4.95 (5.00 · 4.90) | +0.05 | 0.41 | 0.24 | nicht langsamer |
| steht | CPU-Takt p95 ms | 6.6 (6.2 · 7.0) | 6.5 (6.5 · 6.5) | -0.1 | 0.8 | -0.25 | nicht langsamer |
| steht | CPU-Takt p99 ms | 9.8 (10.6 · 8.9) | 8.4 (8.2 · 8.6) | -1.4 | 1.7 | -1.55 | nicht langsamer |
| steht | GPU-Durchsatz p50 ms | 12.30 (12.00 · 12.60) | 12.65 (12.70 · 12.60) | +0.35 | 0.61 | 1.15 | nicht langsamer |
| steht | k0 p50 ms | 0.26 (0.26 · 0.26) | 0.10 (0.10 · 0.10) | -0.16 | 0.00 | – | nicht langsamer |
| steht | GPU p95 ms (lauf) | 2.99 (2.81 · 3.16) | 2.98 (2.93 · 3.02) | -0.01 | 0.36 | -0.06 | nicht langsamer |
| steht | GPU je Bild ms (gpu-bank) | – (– · –) | – (– · –) | – | – | – | – |
| steht | Belegung p50 ms | 6.81 (6.52 · 7.10) | 6.82 (6.86 · 6.78) | +0.01 | 0.59 | 0.03 | nicht langsamer |
| steht | Belegung p95 ms | 9.72 (9.41 · 10.04) | 9.51 (9.55 · 9.47) | -0.21 | 0.64 | -0.68 | nicht langsamer |
| steht | außer Takt p95 ms | 0.98 (1.19 · 0.78) | 0.79 (0.80 · 0.77) | -0.20 | 0.41 | -0.97 | nicht langsamer |
| steht | Lebenszyklus p95 ms | 0.08 (0.08 · 0.08) | 0.08 (0.09 · 0.08) | +0.00 | 0.01 | 1.00 | nicht langsamer |
| steht | über 33 ms % | – (– · –) | – (– · –) | – | – | – | – |
| steht | KI-Uhr Mittel ms | – (– · –) | – (– · –) | – | – | – | – |
| steht | KI-Uhr p95 ms | – (– · –) | – (– · –) | – | – | – | – |
| steht | KI-Uhr p99 ms | – (– · –) | – (– · –) | – | – | – | – |
| steht | KI-Takt EWMA ms | 2.03 (1.91 · 2.15) | 2.02 (2.10 · 1.95) | -0.00 | 0.28 | -0.04 | nicht langsamer |
| geht | fps | 41.3 (43.2 · 39.4) | 41.8 (39.6 · 43.9) | +0.5 | 5.7 | 0.16 | nicht langsamer |
| geht | Frame p50 ms | 20.8 (16.7 · 24.9) | 20.9 (24.9 · 16.8) | +0.1 | 11.5 | 0.01 | nicht langsamer |
| geht | Frame p95 ms | 45.8 (41.7 · 49.9) | 45.8 (49.9 · 41.6) | -0.0 | 11.7 | -0.01 | nicht langsamer |
| geht | Frame p99 ms | 87.6 (83.5 · 91.7) | 83.3 (100.0 · 66.7) | -4.3 | 34.3 | -0.25 | nicht langsamer |
| geht | CPU-Takt p50 ms | 19.30 (18.30 · 20.30) | 19.10 (19.80 · 18.40) | -0.20 | 2.44 | -0.16 | nicht langsamer |
| geht | CPU-Takt p95 ms | 39.6 (37.9 · 41.4) | 39.2 (41.7 · 36.6) | -0.5 | 6.2 | -0.16 | nicht langsamer |
| geht | CPU-Takt p99 ms | 74.0 (65.5 · 82.4) | 73.4 (86.6 · 60.3) | -0.5 | 31.3 | -0.03 | nicht langsamer |
| geht | GPU-Durchsatz p50 ms | 20.45 (19.60 · 21.30) | 20.50 (21.20 · 19.80) | +0.05 | 2.20 | 0.05 | nicht langsamer |
| geht | k0 p50 ms | 0.35 (0.35 · 0.36) | 0.23 (0.23 · 0.23) | -0.12 | 0.01 | -25.00 | nicht langsamer |
| geht | GPU p95 ms (lauf) | 2.32 (2.18 · 2.46) | 2.47 (2.51 · 2.43) | +0.15 | 0.29 | 1.03 | nicht langsamer |
| geht | GPU je Bild ms (gpu-bank) | – (– · –) | – (– · –) | – | – | – | – |
| geht | Belegung p50 ms | 20.41 (19.56 · 21.27) | 20.48 (21.23 · 19.74) | +0.07 | 2.27 | 0.06 | nicht langsamer |
| geht | Belegung p95 ms | 44.78 (42.38 · 47.19) | 43.14 (46.96 · 39.33) | -1.64 | 9.02 | -0.36 | nicht langsamer |
| geht | außer Takt p95 ms | 3.67 (3.70 · 3.63) | 3.87 (4.31 · 3.43) | +0.21 | 0.88 | 0.46 | nicht langsamer |
| geht | Lebenszyklus p95 ms | 0.13 (0.11 · 0.14) | 0.13 (0.15 · 0.10) | 0.00 | 0.06 | 0.00 | nicht langsamer |
| geht | über 33 ms % | – (– · –) | – (– · –) | – | – | – | – |
| geht | KI-Uhr Mittel ms | – (– · –) | – (– · –) | – | – | – | – |
| geht | KI-Uhr p95 ms | – (– · –) | – (– · –) | – | – | – | – |
| geht | KI-Uhr p99 ms | – (– · –) | – (– · –) | – | – | – | – |
| geht | KI-Takt EWMA ms | 1.74 (1.64 · 1.84) | 1.63 (1.74 · 1.52) | -0.11 | 0.30 | -0.74 | nicht langsamer |

**KERN-URTEIL GEHEN stadt** (steht + geht × fps · Frame p95 · CPU-Takt p95 · GPU je Bild (gpu-bank, nur steht) · Belegung p95; Δ ≤ max(2σ gepoolt, Auflösung)): nicht langsamer (8 Größen)
