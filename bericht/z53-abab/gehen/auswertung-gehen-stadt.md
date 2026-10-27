## stadt — je Boot

| Boot | Gang | fps | Frame p50 ms | Frame p95 ms | Frame p99 ms | CPU-Takt p50 ms | CPU-Takt p95 ms | CPU-Takt p99 ms | GPU-Durchsatz p50 ms | k0 p50 ms | GPU p95 ms (lauf) | GPU je Bild ms (gpu-bank) | Belegung p50 ms | Belegung p95 ms | außer Takt p95 ms | Lebenszyklus p95 ms | über 33 ms % | KI-Uhr Mittel ms | KI-Uhr p95 ms | KI-Uhr p99 ms | KI-Takt EWMA ms |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| stadt-A1 | steht | 78.7 | 16.4 | 16.8 | 17.0 | 5.70 | 7.1 | 9.0 | 12.70 | 0.20 | 1.99 | – | 7.91 | 10.82 | 0.88 | 0.08 | – | – | – | – | 2.48 |
| stadt-A1 | geht-1 | 44.5 | 16.7 | 41.6 | 75.0 | 18.10 | 35.5 | 68.0 | 19.50 | 0.14 | 2.31 | – | 19.56 | 37.90 | 3.02 | 0.08 | – | – | – | – | 3.27 |
| stadt-A1 | Geher-Ende |  | | | | | | | | | | | | | | | | | | | |
| stadt-A2 | steht | 78.7 | 16.4 | 16.8 | 17.0 | 5.50 | 6.9 | 9.4 | 12.70 | 0.20 | 2.00 | – | 7.91 | 10.61 | 0.86 | 0.08 | – | – | – | – | 2.05 |
| stadt-A2 | geht-1 | 46.2 | 16.7 | 41.5 | 75.0 | 17.00 | 34.3 | 60.1 | 18.70 | 0.14 | 2.31 | – | 18.59 | 36.86 | 2.62 | 0.08 | – | – | – | – | 3.52 |
| stadt-A2 | Geher-Ende |  | | | | | | | | | | | | | | | | | | | |
| stadt-B1 | steht | 78.5 | 16.5 | 16.8 | 17.1 | 5.60 | 7.1 | 10.1 | 12.80 | 0.20 | 1.96 | – | 8.04 | 10.78 | 0.87 | 0.09 | – | – | – | – | 2.38 |
| stadt-B1 | geht-1 | 45.1 | 16.7 | 41.6 | 75.0 | 17.30 | 37.3 | 65.3 | 18.90 | 0.14 | 2.28 | – | 18.89 | 39.78 | 2.38 | 0.13 | – | – | – | – | 3.24 |
| stadt-B1 | Geher-Ende |  | | | | | | | | | | | | | | | | | | | |
| stadt-B2 | steht | 78.7 | 16.3 | 16.8 | 17.0 | 5.50 | 6.7 | 9.4 | 12.70 | 0.20 | 1.99 | – | 7.76 | 10.37 | 0.86 | 0.08 | – | – | – | – | 2.47 |
| stadt-B2 | geht-1 | 45.7 | 16.7 | 41.5 | 66.6 | 17.20 | 34.3 | 64.4 | 19.00 | 0.14 | 2.28 | – | 18.93 | 36.36 | 2.22 | 0.08 | – | – | – | – | 3.42 |
| stadt-B2 | Geher-Ende |  | | | | | | | | | | | | | | | | | | | |

## Tier-Zensus je Boot (zensus-0 nach umstellen · zensus-1 nach geht-1)

- stadt-A1: vorher 6 (deer 5, fox 1; Würfe≥2 1: deer 5 Spanne 2.4 m @222.1 m; Verband-Feld true, Verbände≥2 1: deer 5 Spanne 2.4 m; Zustand {"-":6})
  nachher 6 (deer 5, fox 1; Würfe≥2 1: deer 5 Spanne 2.4 m @222.8 m; Verband-Feld true, Verbände≥2 1: deer 5 Spanne 2.4 m; Zustand {"-":6})
- stadt-A2: vorher 6 (deer 5, fox 1; Würfe≥2 1: deer 5 Spanne 2.5 m @222.1 m; Verband-Feld true, Verbände≥2 1: deer 5 Spanne 2.5 m; Zustand {"-":6})
  nachher 6 (deer 5, fox 1; Würfe≥2 1: deer 5 Spanne 2.4 m @222.8 m; Verband-Feld true, Verbände≥2 1: deer 5 Spanne 2.4 m; Zustand {"-":6})
- stadt-B1: vorher 6 (deer 5, fox 1; Würfe≥2 1: deer 5 Spanne 2.5 m @222.1 m; Verband-Feld true, Verbände≥2 1: deer 5 Spanne 2.5 m; Zustand {"-":6})
  nachher 6 (deer 5, fox 1; Würfe≥2 1: deer 5 Spanne 2.4 m @222.8 m; Verband-Feld true, Verbände≥2 1: deer 5 Spanne 2.4 m; Zustand {"-":6})
- stadt-B2: vorher 6 (deer 5, fox 1; Würfe≥2 1: deer 5 Spanne 2.5 m @222.1 m; Verband-Feld true, Verbände≥2 1: deer 5 Spanne 2.5 m; Zustand {"-":6})
  nachher 6 (deer 5, fox 1; Würfe≥2 1: deer 5 Spanne 2.4 m @222.8 m; Verband-Feld true, Verbände≥2 1: deer 5 Spanne 2.4 m; Zustand {"-":6})

## GPU-Takt je Boot (nvidia-smi 1 s, nur P0-Sekunden: Median-MHz · Anteil Drossel (Grund ≠ 0 ohne GpuIdle 0x1) · max °C)

- stadt-A1: 183 s · 1721 MHz · Drossel 15 % · 86 °C
- stadt-A2: 176 s · 1721 MHz · Drossel 16 % · 86 °C
- stadt-B1: 174 s · 1721 MHz · Drossel 17 % · 86 °C
- stadt-B2: 167 s · 1721 MHz · Drossel 19 % · 86 °C

## Mittel je Seite (A 9fa32207 · B f1faa046; gehend = geht-1 je Boot)

| Gang | Größe | A | B | Δ B − A | 2σ | t (Welch) | Urteil |
|---|---|---|---|---|---|---|---|
| steht | fps | 78.7 (78.7 · 78.7) | 78.6 (78.5 · 78.7) | -0.1 | 0.2 | -1.00 | nicht langsamer |
| steht | Frame p50 ms | 16.4 (16.4 · 16.4) | 16.4 (16.5 · 16.3) | 0.0 | 0.2 | 0.00 | nicht langsamer |
| steht | Frame p95 ms | 16.8 (16.8 · 16.8) | 16.8 (16.8 · 16.8) | 0.0 | 0.0 | – | nicht langsamer |
| steht | Frame p99 ms | 17.0 (17.0 · 17.0) | 17.1 (17.1 · 17.0) | +0.1 | 0.1 | 1.00 | nicht langsamer |
| steht | CPU-Takt p50 ms | 5.60 (5.70 · 5.50) | 5.55 (5.60 · 5.50) | -0.05 | 0.22 | -0.45 | nicht langsamer |
| steht | CPU-Takt p95 ms | 7.0 (7.1 · 6.9) | 6.9 (7.1 · 6.7) | -0.1 | 0.4 | -0.45 | nicht langsamer |
| steht | CPU-Takt p99 ms | 9.2 (9.0 · 9.4) | 9.8 (10.1 · 9.4) | +0.6 | 0.8 | 1.36 | nicht langsamer |
| steht | GPU-Durchsatz p50 ms | 12.70 (12.70 · 12.70) | 12.75 (12.80 · 12.70) | +0.05 | 0.10 | 1.00 | nicht langsamer |
| steht | k0 p50 ms | 0.20 (0.20 · 0.20) | 0.20 (0.20 · 0.20) | 0.00 | 0.00 | – | nicht langsamer |
| steht | GPU p95 ms (lauf) | 2.00 (1.99 · 2.00) | 1.98 (1.96 · 1.99) | -0.02 | 0.03 | -1.26 | nicht langsamer |
| steht | GPU je Bild ms (gpu-bank) | – (– · –) | – (– · –) | – | – | – | – |
| steht | Belegung p50 ms | 7.91 (7.91 · 7.91) | 7.90 (8.04 · 7.76) | -0.01 | 0.28 | -0.07 | nicht langsamer |
| steht | Belegung p95 ms | 10.71 (10.82 · 10.61) | 10.57 (10.78 · 10.37) | -0.14 | 0.46 | -0.61 | nicht langsamer |
| steht | außer Takt p95 ms | 0.87 (0.88 · 0.86) | 0.86 (0.87 · 0.86) | -0.01 | 0.02 | -0.45 | nicht langsamer |
| steht | Lebenszyklus p95 ms | 0.08 (0.08 · 0.08) | 0.08 (0.09 · 0.08) | +0.00 | 0.01 | 1.00 | nicht langsamer |
| steht | über 33 ms % | – (– · –) | – (– · –) | – | – | – | – |
| steht | KI-Uhr Mittel ms | – (– · –) | – (– · –) | – | – | – | – |
| steht | KI-Uhr p95 ms | – (– · –) | – (– · –) | – | – | – | – |
| steht | KI-Uhr p99 ms | – (– · –) | – (– · –) | – | – | – | – |
| steht | KI-Takt EWMA ms | 2.26 (2.48 · 2.05) | 2.42 (2.38 · 2.47) | +0.16 | 0.44 | 0.73 | nicht langsamer |
| geht | fps | 45.4 (44.5 · 46.2) | 45.4 (45.1 · 45.7) | +0.1 | 1.8 | 0.06 | nicht langsamer |
| geht | Frame p50 ms | 16.7 (16.7 · 16.7) | 16.7 (16.7 · 16.7) | 0.0 | 0.0 | – | nicht langsamer |
| geht | Frame p95 ms | 41.5 (41.6 · 41.5) | 41.5 (41.6 · 41.5) | 0.0 | 0.1 | 0.00 | nicht langsamer |
| geht | Frame p99 ms | 75.0 (75.0 · 75.0) | 70.8 (75.0 · 66.6) | -4.2 | 8.4 | -1.00 | nicht langsamer |
| geht | CPU-Takt p50 ms | 17.55 (18.10 · 17.00) | 17.25 (17.30 · 17.20) | -0.30 | 1.10 | -0.54 | nicht langsamer |
| geht | CPU-Takt p95 ms | 34.9 (35.5 · 34.3) | 35.8 (37.3 · 34.3) | +0.9 | 3.2 | 0.56 | nicht langsamer |
| geht | CPU-Takt p99 ms | 64.0 (68.0 · 60.1) | 64.8 (65.3 · 64.4) | +0.8 | 8.0 | 0.20 | nicht langsamer |
| geht | GPU-Durchsatz p50 ms | 19.10 (19.50 · 18.70) | 18.95 (18.90 · 19.00) | -0.15 | 0.81 | -0.37 | nicht langsamer |
| geht | k0 p50 ms | 0.14 (0.14 · 0.14) | 0.14 (0.14 · 0.14) | 0.00 | 0.00 | – | nicht langsamer |
| geht | GPU p95 ms (lauf) | 2.31 (2.31 · 2.31) | 2.28 (2.28 · 2.28) | -0.03 | 0.00 | – | nicht langsamer |
| geht | GPU je Bild ms (gpu-bank) | – (– · –) | – (– · –) | – | – | – | – |
| geht | Belegung p50 ms | 19.07 (19.56 · 18.59) | 18.91 (18.89 · 18.93) | -0.16 | 0.97 | -0.34 | nicht langsamer |
| geht | Belegung p95 ms | 37.38 (37.90 · 36.86) | 38.07 (39.78 · 36.36) | +0.69 | 3.57 | 0.39 | nicht langsamer |
| geht | außer Takt p95 ms | 2.82 (3.02 · 2.62) | 2.30 (2.38 · 2.22) | -0.52 | 0.43 | -2.41 | nicht langsamer |
| geht | Lebenszyklus p95 ms | 0.08 (0.08 · 0.08) | 0.11 (0.13 · 0.08) | +0.03 | 0.05 | 1.00 | nicht langsamer |
| geht | über 33 ms % | – (– · –) | – (– · –) | – | – | – | – |
| geht | KI-Uhr Mittel ms | – (– · –) | – (– · –) | – | – | – | – |
| geht | KI-Uhr p95 ms | – (– · –) | – (– · –) | – | – | – | – |
| geht | KI-Uhr p99 ms | – (– · –) | – (– · –) | – | – | – | – |
| geht | KI-Takt EWMA ms | 3.40 (3.27 · 3.52) | 3.33 (3.24 · 3.42) | -0.06 | 0.31 | -0.42 | nicht langsamer |

**KERN-URTEIL GEHEN stadt** (steht + geht × fps · Frame p95 · CPU-Takt p95 · GPU je Bild (gpu-bank, nur steht) · Belegung p95; Δ ≤ max(2σ gepoolt, Auflösung)): nicht langsamer (8 Größen)
