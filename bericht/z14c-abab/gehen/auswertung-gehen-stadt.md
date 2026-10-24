## stadt — je Boot

| Boot | Gang | fps | Frame p50 ms | Frame p95 ms | Frame p99 ms | CPU-Takt p50 ms | CPU-Takt p95 ms | CPU-Takt p99 ms | GPU-Durchsatz p50 ms | k0 p50 ms | GPU p95 ms (lauf) | GPU je Bild ms (gpu-bank) | Belegung p50 ms | Belegung p95 ms | außer Takt p95 ms | Lebenszyklus p95 ms | über 33 ms % | KI-Uhr Mittel ms | KI-Uhr p95 ms | KI-Uhr p99 ms | KI-Takt EWMA ms |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| stadt-A1 | steht | 78.7 | 16.3 | 16.8 | 24.7 | 5.30 | 6.9 | 8.6 | 12.70 | 0.10 | 2.75 | – | 7.39 | 10.14 | 0.78 | 0.10 | – | – | – | – | 2.22 |
| stadt-A1 | geht-1 | 38.3 | 24.9 | 50.0 | 108.2 | 20.70 | 43.0 | 82.3 | 22.00 | 0.23 | 2.45 | – | 22.06 | 47.11 | 4.03 | 0.13 | – | – | – | – | 1.53 |
| stadt-A1 | Geher-Ende |  | | | | | | | | | | | | | | | | | | | |
| stadt-A2 | steht | 78.8 | 16.2 | 16.8 | 24.9 | 5.00 | 6.6 | 9.9 | 12.60 | 0.10 | 2.61 | – | 6.94 | 10.26 | 1.26 | 0.10 | – | – | – | – | 1.87 |
| stadt-A2 | geht-1 | 43.4 | 16.8 | 41.7 | 83.3 | 18.30 | 36.3 | 74.8 | 19.70 | 0.23 | 2.43 | – | 19.64 | 43.01 | 3.84 | 0.09 | – | – | – | – | 1.57 |
| stadt-A2 | Geher-Ende |  | | | | | | | | | | | | | | | | | | | |
| stadt-B1 | steht | 79.1 | 16.3 | 16.8 | 17.0 | 5.00 | 6.4 | 8.1 | 12.60 | 0.10 | 2.56 | – | 6.94 | 9.53 | 0.76 | 0.10 | – | – | – | – | 1.98 |
| stadt-B1 | geht-1 | 42.5 | 16.8 | 41.7 | 83.4 | 18.50 | 37.4 | 71.3 | 20.10 | 0.22 | 2.39 | – | 20.09 | 42.41 | 3.55 | 0.10 | – | – | – | – | 1.82 |
| stadt-B1 | Geher-Ende |  | | | | | | | | | | | | | | | | | | | |
| stadt-B2 | steht | 78.8 | 16.2 | 16.8 | 24.8 | 5.10 | 6.6 | 10.0 | 12.60 | 0.10 | 2.63 | – | 6.91 | 10.20 | 1.23 | 0.09 | – | – | – | – | 1.86 |
| stadt-B2 | geht-1 | 42.1 | 16.8 | 49.9 | 91.7 | 18.90 | 39.4 | 80.3 | 20.10 | 0.22 | 2.39 | – | 20.07 | 46.12 | 3.77 | 0.09 | – | – | – | – | 1.64 |
| stadt-B2 | Geher-Ende |  | | | | | | | | | | | | | | | | | | | |

## Tier-Zensus je Boot (zensus-0 nach umstellen · zensus-1 nach geht-1)

- stadt-A1: vorher 7 (deer 6, fox 1; Würfe≥2 1: deer 6 Spanne 3.9 m @181.9 m; Verband-Feld true, Verbände≥2 1: deer 6 Spanne 3.9 m; Zustand {"-":6,"fressen":1})
  nachher 7 (deer 5, fox 1, bear 1; Würfe≥2 1: deer 5 Spanne 4.6 m @181.2 m; Verband-Feld true, Verbände≥2 1: deer 5 Spanne 4.6 m; Zustand {"-":7})
- stadt-A2: vorher 6 (deer 5, fox 1; Würfe≥2 1: deer 5 Spanne 3.7 m @184.4 m; Verband-Feld true, Verbände≥2 1: deer 5 Spanne 3.7 m; Zustand {"-":5,"fressen":1})
  nachher 6 (deer 4, fox 1, bear 1; Würfe≥2 1: deer 4 Spanne 3.4 m @184.6 m; Verband-Feld true, Verbände≥2 1: deer 4 Spanne 3.4 m; Zustand {"-":6})
- stadt-B1: vorher 7 (deer 6, fox 1; Würfe≥2 1: deer 6 Spanne 4.3 m @184 m; Verband-Feld true, Verbände≥2 1: deer 6 Spanne 4.3 m; Zustand {"-":6,"fressen":1})
  nachher 7 (deer 5, fox 1, bear 1; Würfe≥2 1: deer 5 Spanne 4.2 m @182.7 m; Verband-Feld true, Verbände≥2 1: deer 5 Spanne 4.2 m; Zustand {"-":7})
- stadt-B2: vorher 6 (deer 5, fox 1; Würfe≥2 1: deer 5 Spanne 3.8 m @185.5 m; Verband-Feld true, Verbände≥2 1: deer 5 Spanne 3.8 m; Zustand {"-":5,"fressen":1})
  nachher 6 (deer 4, fox 1, bear 1; Würfe≥2 1: deer 4 Spanne 3.4 m @183.3 m; Verband-Feld true, Verbände≥2 1: deer 4 Spanne 3.4 m; Zustand {"-":6})

## GPU-Takt je Boot (nvidia-smi 1 s, nur P0-Sekunden: Median-MHz · Anteil Drossel (Grund ≠ 0 ohne GpuIdle 0x1) · max °C)

- stadt-A1: 163 s · 1746 MHz · Drossel 14 % · 85 °C
- stadt-A2: 150 s · 1746 MHz · Drossel 17 % · 85 °C
- stadt-B1: 158 s · 1733 MHz · Drossel 15 % · 85 °C
- stadt-B2: 178 s · 1733 MHz · Drossel 16 % · 84 °C

## Mittel je Seite (A 18a84649 · B 056330d8; gehend = geht-1 je Boot)

| Gang | Größe | A | B | Δ B − A | 2σ | t (Welch) | Urteil |
|---|---|---|---|---|---|---|---|
| steht | fps | 78.8 (78.7 · 78.8) | 78.9 (79.1 · 78.8) | +0.2 | 0.3 | 1.26 | nicht langsamer |
| steht | Frame p50 ms | 16.3 (16.3 · 16.2) | 16.3 (16.3 · 16.2) | 0.0 | 0.1 | 0.00 | nicht langsamer |
| steht | Frame p95 ms | 16.8 (16.8 · 16.8) | 16.8 (16.8 · 16.8) | 0.0 | 0.0 | – | nicht langsamer |
| steht | Frame p99 ms | 24.8 (24.7 · 24.9) | 20.9 (17.0 · 24.8) | -3.9 | 7.8 | -1.00 | nicht langsamer |
| steht | CPU-Takt p50 ms | 5.15 (5.30 · 5.00) | 5.05 (5.00 · 5.10) | -0.10 | 0.32 | -0.63 | nicht langsamer |
| steht | CPU-Takt p95 ms | 6.8 (6.9 · 6.6) | 6.5 (6.4 · 6.6) | -0.3 | 0.4 | -1.39 | nicht langsamer |
| steht | CPU-Takt p99 ms | 9.3 (8.6 · 9.9) | 9.1 (8.1 · 10.0) | -0.2 | 2.3 | -0.17 | nicht langsamer |
| steht | GPU-Durchsatz p50 ms | 12.65 (12.70 · 12.60) | 12.60 (12.60 · 12.60) | -0.05 | 0.10 | -1.00 | nicht langsamer |
| steht | k0 p50 ms | 0.10 (0.10 · 0.10) | 0.10 (0.10 · 0.10) | 0.00 | 0.00 | – | nicht langsamer |
| steht | GPU p95 ms (lauf) | 2.68 (2.75 · 2.61) | 2.59 (2.56 · 2.63) | -0.08 | 0.16 | -1.09 | nicht langsamer |
| steht | GPU je Bild ms (gpu-bank) | – (– · –) | – (– · –) | – | – | – | – |
| steht | Belegung p50 ms | 7.17 (7.39 · 6.94) | 6.93 (6.94 · 6.91) | -0.24 | 0.45 | -1.06 | nicht langsamer |
| steht | Belegung p95 ms | 10.20 (10.14 · 10.26) | 9.86 (9.53 · 10.20) | -0.34 | 0.68 | -0.98 | nicht langsamer |
| steht | außer Takt p95 ms | 1.02 (0.78 · 1.26) | 0.99 (0.76 · 1.23) | -0.03 | 0.67 | -0.07 | nicht langsamer |
| steht | Lebenszyklus p95 ms | 0.10 (0.10 · 0.10) | 0.10 (0.10 · 0.09) | -0.01 | 0.01 | -1.00 | nicht langsamer |
| steht | über 33 ms % | – (– · –) | – (– · –) | – | – | – | – |
| steht | KI-Uhr Mittel ms | – (– · –) | – (– · –) | – | – | – | – |
| steht | KI-Uhr p95 ms | – (– · –) | – (– · –) | – | – | – | – |
| steht | KI-Uhr p99 ms | – (– · –) | – (– · –) | – | – | – | – |
| steht | KI-Takt EWMA ms | 2.04 (2.22 · 1.87) | 1.92 (1.98 · 1.86) | -0.13 | 0.37 | -0.68 | nicht langsamer |
| geht | fps | 40.8 (38.3 · 43.4) | 42.3 (42.5 · 42.1) | +1.5 | 5.1 | 0.57 | nicht langsamer |
| geht | Frame p50 ms | 20.9 (24.9 · 16.8) | 16.8 (16.8 · 16.8) | -4.1 | 8.1 | -1.00 | nicht langsamer |
| geht | Frame p95 ms | 45.9 (50.0 · 41.7) | 45.8 (41.7 · 49.9) | -0.1 | 11.7 | -0.01 | nicht langsamer |
| geht | Frame p99 ms | 95.8 (108.2 · 83.3) | 87.6 (83.4 · 91.7) | -8.2 | 26.2 | -0.62 | nicht langsamer |
| geht | CPU-Takt p50 ms | 19.50 (20.70 · 18.30) | 18.70 (18.50 · 18.90) | -0.80 | 2.43 | -0.66 | nicht langsamer |
| geht | CPU-Takt p95 ms | 39.6 (43.0 · 36.3) | 38.4 (37.4 · 39.4) | -1.3 | 7.0 | -0.36 | nicht langsamer |
| geht | CPU-Takt p99 ms | 78.5 (82.3 · 74.8) | 75.8 (71.3 · 80.3) | -2.8 | 11.7 | -0.47 | nicht langsamer |
| geht | GPU-Durchsatz p50 ms | 20.85 (22.00 · 19.70) | 20.10 (20.10 · 20.10) | -0.75 | 2.30 | -0.65 | nicht langsamer |
| geht | k0 p50 ms | 0.23 (0.23 · 0.23) | 0.22 (0.22 · 0.22) | -0.01 | 0.00 | – | nicht langsamer |
| geht | GPU p95 ms (lauf) | 2.44 (2.45 · 2.43) | 2.39 (2.39 · 2.39) | -0.05 | 0.02 | -5.00 | nicht langsamer |
| geht | GPU je Bild ms (gpu-bank) | – (– · –) | – (– · –) | – | – | – | – |
| geht | Belegung p50 ms | 20.85 (22.06 · 19.64) | 20.08 (20.09 · 20.07) | -0.77 | 2.42 | -0.64 | nicht langsamer |
| geht | Belegung p95 ms | 45.06 (47.11 · 43.01) | 44.27 (42.41 · 46.12) | -0.80 | 5.53 | -0.29 | nicht langsamer |
| geht | außer Takt p95 ms | 3.94 (4.03 · 3.84) | 3.66 (3.55 · 3.77) | -0.27 | 0.29 | -1.89 | nicht langsamer |
| geht | Lebenszyklus p95 ms | 0.11 (0.13 · 0.09) | 0.10 (0.10 · 0.09) | -0.01 | 0.04 | -0.73 | nicht langsamer |
| geht | über 33 ms % | – (– · –) | – (– · –) | – | – | – | – |
| geht | KI-Uhr Mittel ms | – (– · –) | – (– · –) | – | – | – | – |
| geht | KI-Uhr p95 ms | – (– · –) | – (– · –) | – | – | – | – |
| geht | KI-Uhr p99 ms | – (– · –) | – (– · –) | – | – | – | – |
| geht | KI-Takt EWMA ms | 1.55 (1.53 · 1.57) | 1.73 (1.82 · 1.64) | +0.18 | 0.18 | 1.95 | nicht langsamer |

**KERN-URTEIL GEHEN stadt** (steht + geht × fps · Frame p95 · CPU-Takt p95 · GPU je Bild (gpu-bank, nur steht) · Belegung p95; Δ ≤ max(2σ gepoolt, Auflösung)): nicht langsamer (8 Größen)
