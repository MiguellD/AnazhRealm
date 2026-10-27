## stadt — je Boot

| Boot | Gang | fps | Frame p50 ms | Frame p95 ms | Frame p99 ms | CPU-Takt p50 ms | CPU-Takt p95 ms | CPU-Takt p99 ms | GPU-Durchsatz p50 ms | k0 p50 ms | GPU p95 ms (lauf) | GPU je Bild ms (gpu-bank) | Belegung p50 ms | Belegung p95 ms | außer Takt p95 ms | Lebenszyklus p95 ms | über 33 ms % | KI-Uhr Mittel ms | KI-Uhr p95 ms | KI-Uhr p99 ms | KI-Takt EWMA ms |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| stadt-A1 | steht | 78.3 | 16.5 | 16.8 | 17.2 | 5.70 | 7.3 | 9.7 | 12.80 | 0.20 | 2.12 | – | 8.23 | 11.10 | 0.94 | 0.09 | – | – | – | – | 2.59 |
| stadt-A1 | geht-1 | 43.7 | 16.8 | 41.6 | 66.7 | 18.00 | 36.4 | 60.6 | 19.30 | 0.14 | 2.47 | – | 19.22 | 39.70 | 3.11 | 0.09 | – | – | – | – | 3.27 |
| stadt-A1 | Geher-Ende |  | | | | | | | | | | | | | | | | | | | |
| stadt-A2 | steht | 78.7 | 16.4 | 16.8 | 17.0 | 5.50 | 6.7 | 9.2 | 12.70 | 0.20 | 1.96 | – | 7.71 | 10.40 | 0.87 | 0.08 | – | – | – | – | 2.32 |
| stadt-A2 | geht-1 | 46.0 | 16.7 | 41.6 | 83.3 | 17.20 | 35.8 | 63.5 | 18.60 | 0.14 | 2.34 | – | 18.59 | 38.27 | 1.98 | 0.09 | – | – | – | – | 3.38 |
| stadt-A2 | Geher-Ende |  | | | | | | | | | | | | | | | | | | | |
| stadt-B1 | steht | 75.6 | 16.6 | 16.8 | 17.7 | 6.90 | 8.8 | 11.6 | 13.20 | 0.20 | 2.22 | – | 9.78 | 13.31 | 1.07 | 0.11 | – | – | – | – | 2.95 |
| stadt-B1 | geht-1 | 33.9 | 25.0 | 50.0 | 108.3 | 24.20 | 48.3 | 92.3 | 25.10 | 0.14 | 2.45 | – | 24.98 | 50.94 | 3.08 | 0.11 | – | – | – | – | 4.04 |
| stadt-B1 | Geher-Ende |  | | | | | | | | | | | | | | | | | | | |
| stadt-B2 | steht | 78.8 | 16.4 | 16.8 | 17.0 | 5.60 | 7.0 | 9.2 | 12.70 | 0.20 | 1.97 | – | 7.90 | 10.61 | 0.91 | 0.10 | – | – | – | – | 2.09 |
| stadt-B2 | geht-1 | 46.3 | 16.7 | 41.6 | 66.7 | 17.10 | 36.0 | 60.8 | 18.50 | 0.14 | 2.35 | – | 18.47 | 37.86 | 2.34 | 0.08 | – | – | – | – | 3.39 |
| stadt-B2 | Geher-Ende |  | | | | | | | | | | | | | | | | | | | |

## Tier-Zensus je Boot (zensus-0 nach umstellen · zensus-1 nach geht-1)

- stadt-A1: vorher 6 (deer 5, fox 1; Würfe≥2 1: deer 5 Spanne 2.5 m @222.1 m; Verband-Feld true, Verbände≥2 1: deer 5 Spanne 2.5 m; Zustand {"-":6})
  nachher 6 (deer 5, fox 1; Würfe≥2 1: deer 5 Spanne 2.4 m @222.8 m; Verband-Feld true, Verbände≥2 1: deer 5 Spanne 2.4 m; Zustand {"-":6})
- stadt-A2: vorher 6 (deer 5, fox 1; Würfe≥2 1: deer 5 Spanne 2.6 m @222.3 m; Verband-Feld true, Verbände≥2 1: deer 5 Spanne 2.6 m; Zustand {"-":6})
  nachher 6 (deer 5, fox 1; Würfe≥2 1: deer 5 Spanne 2.3 m @223 m; Verband-Feld true, Verbände≥2 1: deer 5 Spanne 2.3 m; Zustand {"-":6})
- stadt-B1: vorher 6 (deer 5, fox 1; Würfe≥2 1: deer 5 Spanne 2.5 m @222.2 m; Verband-Feld true, Verbände≥2 1: deer 5 Spanne 2.5 m; Zustand {"-":6})
  nachher 6 (deer 5, fox 1; Würfe≥2 1: deer 5 Spanne 2.3 m @222.8 m; Verband-Feld true, Verbände≥2 1: deer 5 Spanne 2.3 m; Zustand {"-":6})
- stadt-B2: vorher 6 (deer 5, fox 1; Würfe≥2 1: deer 5 Spanne 2.4 m @222.1 m; Verband-Feld true, Verbände≥2 1: deer 5 Spanne 2.4 m; Zustand {"-":6})
  nachher 6 (deer 5, fox 1; Würfe≥2 1: deer 5 Spanne 2.4 m @222.9 m; Verband-Feld true, Verbände≥2 1: deer 5 Spanne 2.4 m; Zustand {"-":6})

## GPU-Takt je Boot (nvidia-smi 1 s, nur P0-Sekunden: Median-MHz · Anteil Drossel (Grund ≠ 0 ohne GpuIdle 0x1) · max °C)

- stadt-A1: 180 s · 1721 MHz · Drossel 19 % · 86 °C
- stadt-A2: 192 s · 1708 MHz · Drossel 19 % · 86 °C
- stadt-B1: 187 s · 1708 MHz · Drossel 13 % · 86 °C
- stadt-B2: 127 s · 1733 MHz · Drossel 23 % · 86 °C

## Mittel je Seite (A 5b8603c1 · B 42973786; gehend = geht-1 je Boot)

| Gang | Größe | A | B | Δ B − A | 2σ | t (Welch) | Urteil |
|---|---|---|---|---|---|---|---|
| steht | fps | 78.5 (78.3 · 78.7) | 77.2 (75.6 · 78.8) | -1.3 | 3.2 | -0.81 | nicht langsamer |
| steht | Frame p50 ms | 16.4 (16.5 · 16.4) | 16.5 (16.6 · 16.4) | +0.1 | 0.2 | 0.45 | nicht langsamer |
| steht | Frame p95 ms | 16.8 (16.8 · 16.8) | 16.8 (16.8 · 16.8) | 0.0 | 0.0 | – | nicht langsamer |
| steht | Frame p99 ms | 17.1 (17.2 · 17.0) | 17.4 (17.7 · 17.0) | +0.3 | 0.7 | 0.69 | nicht langsamer |
| steht | CPU-Takt p50 ms | 5.60 (5.70 · 5.50) | 6.25 (6.90 · 5.60) | +0.65 | 1.32 | 0.99 | nicht langsamer |
| steht | CPU-Takt p95 ms | 7.0 (7.3 · 6.7) | 7.9 (8.8 · 7.0) | +0.9 | 1.9 | 0.95 | nicht langsamer |
| steht | CPU-Takt p99 ms | 9.4 (9.7 · 9.2) | 10.4 (11.6 · 9.2) | +0.9 | 2.5 | 0.78 | nicht langsamer |
| steht | GPU-Durchsatz p50 ms | 12.75 (12.80 · 12.70) | 12.95 (13.20 · 12.70) | +0.20 | 0.51 | 0.78 | nicht langsamer |
| steht | k0 p50 ms | 0.20 (0.20 · 0.20) | 0.20 (0.20 · 0.20) | 0.00 | 0.00 | – | nicht langsamer |
| steht | GPU p95 ms (lauf) | 2.04 (2.12 · 1.96) | 2.10 (2.22 · 1.97) | +0.06 | 0.30 | 0.37 | nicht langsamer |
| steht | GPU je Bild ms (gpu-bank) | – (– · –) | – (– · –) | – | – | – | – |
| steht | Belegung p50 ms | 7.97 (8.23 · 7.71) | 8.84 (9.78 · 7.90) | +0.87 | 1.95 | 0.89 | nicht langsamer |
| steht | Belegung p95 ms | 10.75 (11.10 · 10.40) | 11.96 (13.31 · 10.61) | +1.21 | 2.79 | 0.87 | nicht langsamer |
| steht | außer Takt p95 ms | 0.91 (0.94 · 0.87) | 0.99 (1.07 · 0.91) | +0.08 | 0.17 | 0.97 | nicht langsamer |
| steht | Lebenszyklus p95 ms | 0.08 (0.09 · 0.08) | 0.11 (0.11 · 0.10) | +0.02 | 0.01 | 2.83 | LANGSAMER |
| steht | über 33 ms % | – (– · –) | – (– · –) | – | – | – | – |
| steht | KI-Uhr Mittel ms | – (– · –) | – (– · –) | – | – | – | – |
| steht | KI-Uhr p95 ms | – (– · –) | – (– · –) | – | – | – | – |
| steht | KI-Uhr p99 ms | – (– · –) | – (– · –) | – | – | – | – |
| steht | KI-Takt EWMA ms | 2.46 (2.59 · 2.32) | 2.52 (2.95 · 2.09) | +0.06 | 0.90 | 0.14 | nicht langsamer |
| geht | fps | 44.9 (43.7 · 46.0) | 40.1 (33.9 · 46.3) | -4.8 | 12.6 | -0.75 | nicht langsamer |
| geht | Frame p50 ms | 16.8 (16.8 · 16.7) | 20.9 (25.0 · 16.7) | +4.1 | 8.3 | 0.99 | nicht langsamer |
| geht | Frame p95 ms | 41.6 (41.6 · 41.6) | 45.8 (50.0 · 41.6) | +4.2 | 8.4 | 1.00 | nicht langsamer |
| geht | Frame p99 ms | 75.0 (66.7 · 83.3) | 87.5 (108.3 · 66.7) | +12.5 | 44.8 | 0.56 | nicht langsamer |
| geht | CPU-Takt p50 ms | 17.60 (18.00 · 17.20) | 20.65 (24.20 · 17.10) | +3.05 | 7.14 | 0.85 | nicht langsamer |
| geht | CPU-Takt p95 ms | 36.1 (36.4 · 35.8) | 42.1 (48.3 · 36.0) | +6.1 | 12.3 | 0.98 | nicht langsamer |
| geht | CPU-Takt p99 ms | 62.0 (60.6 · 63.5) | 76.5 (92.3 · 60.8) | +14.5 | 31.6 | 0.92 | nicht langsamer |
| geht | GPU-Durchsatz p50 ms | 18.95 (19.30 · 18.60) | 21.80 (25.10 · 18.50) | +2.85 | 6.64 | 0.86 | nicht langsamer |
| geht | k0 p50 ms | 0.14 (0.14 · 0.14) | 0.14 (0.14 · 0.14) | 0.00 | 0.00 | – | nicht langsamer |
| geht | GPU p95 ms (lauf) | 2.41 (2.47 · 2.34) | 2.40 (2.45 · 2.35) | -0.00 | 0.16 | -0.06 | nicht langsamer |
| geht | GPU je Bild ms (gpu-bank) | – (– · –) | – (– · –) | – | – | – | – |
| geht | Belegung p50 ms | 18.91 (19.22 · 18.59) | 21.73 (24.98 · 18.47) | +2.82 | 6.54 | 0.86 | nicht langsamer |
| geht | Belegung p95 ms | 38.98 (39.70 · 38.27) | 44.40 (50.94 · 37.86) | +5.41 | 13.16 | 0.82 | nicht langsamer |
| geht | außer Takt p95 ms | 2.54 (3.11 · 1.98) | 2.71 (3.08 · 2.34) | +0.17 | 1.35 | 0.24 | nicht langsamer |
| geht | Lebenszyklus p95 ms | 0.09 (0.09 · 0.09) | 0.10 (0.11 · 0.08) | +0.01 | 0.03 | 0.33 | nicht langsamer |
| geht | über 33 ms % | – (– · –) | – (– · –) | – | – | – | – |
| geht | KI-Uhr Mittel ms | – (– · –) | – (– · –) | – | – | – | – |
| geht | KI-Uhr p95 ms | – (– · –) | – (– · –) | – | – | – | – |
| geht | KI-Uhr p99 ms | – (– · –) | – (– · –) | – | – | – | – |
| geht | KI-Takt EWMA ms | 3.33 (3.27 · 3.38) | 3.71 (4.04 · 3.39) | +0.39 | 0.66 | 1.18 | nicht langsamer |

**KERN-URTEIL GEHEN stadt** (steht + geht × fps · Frame p95 · CPU-Takt p95 · GPU je Bild (gpu-bank, nur steht) · Belegung p95; Δ ≤ max(2σ gepoolt, Auflösung)): nicht langsamer (8 Größen)
