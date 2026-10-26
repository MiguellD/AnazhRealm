## stadt — je Boot

| Boot | Gang | fps | Frame p50 ms | Frame p95 ms | Frame p99 ms | CPU-Takt p50 ms | CPU-Takt p95 ms | CPU-Takt p99 ms | GPU-Durchsatz p50 ms | k0 p50 ms | GPU p95 ms (lauf) | GPU je Bild ms (gpu-bank) | Belegung p50 ms | Belegung p95 ms | außer Takt p95 ms | Lebenszyklus p95 ms | über 33 ms % | KI-Uhr Mittel ms | KI-Uhr p95 ms | KI-Uhr p99 ms | KI-Takt EWMA ms |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| stadt-A1 | steht | 77.5 | 16.6 | 16.8 | 18.1 | 6.00 | 7.8 | 10.7 | 12.90 | 0.20 | 2.18 | – | 8.69 | 11.75 | 0.93 | 0.09 | – | – | – | – | 2.75 |
| stadt-A1 | geht-1 | 42.2 | 16.8 | 41.7 | 75.0 | 18.80 | 39.2 | 70.9 | 20.10 | 0.14 | 2.42 | – | 20.07 | 41.99 | 3.07 | 0.09 | – | – | – | – | 5.19 |
| stadt-A1 | Geher-Ende |  | | | | | | | | | | | | | | | | | | | |
| stadt-A2 | steht | 78.0 | 16.6 | 16.8 | 17.1 | 5.90 | 7.4 | 9.9 | 12.80 | 0.20 | 2.09 | – | 8.49 | 11.45 | 0.94 | 0.08 | – | – | – | – | 2.33 |
| stadt-A2 | geht-1 | 42.3 | 16.8 | 41.7 | 83.4 | 18.50 | 39.6 | 73.9 | 19.90 | 0.14 | 2.40 | – | 19.80 | 41.69 | 2.35 | 0.09 | – | – | – | – | 4.87 |
| stadt-A2 | Geher-Ende |  | | | | | | | | | | | | | | | | | | | |
| stadt-B1 | steht | 78.0 | 16.5 | 16.8 | 17.1 | 5.90 | 7.4 | 9.8 | 12.80 | 0.20 | 2.20 | – | 8.46 | 11.39 | 0.94 | 0.09 | – | – | – | – | 2.40 |
| stadt-B1 | geht-1 | 42.2 | 16.8 | 41.7 | 83.4 | 18.40 | 38.9 | 82.0 | 19.80 | 0.14 | 2.37 | – | 19.75 | 41.78 | 2.88 | 0.10 | – | – | – | – | 3.52 |
| stadt-B1 | Geher-Ende |  | | | | | | | | | | | | | | | | | | | |
| stadt-B2 | steht | 78.0 | 16.6 | 16.8 | 17.0 | 5.80 | 7.5 | 9.6 | 12.90 | 0.20 | 2.12 | – | 8.54 | 11.35 | 0.93 | 0.09 | – | – | – | – | 2.51 |
| stadt-B2 | geht-1 | 43.5 | 16.8 | 41.7 | 66.8 | 18.20 | 37.0 | 66.5 | 19.80 | 0.14 | 2.55 | – | 19.72 | 39.00 | 3.23 | 0.09 | – | – | – | – | 3.68 |
| stadt-B2 | Geher-Ende |  | | | | | | | | | | | | | | | | | | | |

## Tier-Zensus je Boot (zensus-0 nach umstellen · zensus-1 nach geht-1)

- stadt-A1: vorher 6 (deer 5, fox 1; Würfe≥2 1: deer 5 Spanne 2.5 m @222.1 m; Verband-Feld true, Verbände≥2 1: deer 5 Spanne 2.5 m; Zustand {"-":6})
  nachher 6 (deer 5, fox 1; Würfe≥2 1: deer 5 Spanne 2.4 m @222.8 m; Verband-Feld true, Verbände≥2 1: deer 5 Spanne 2.4 m; Zustand {"-":6})
- stadt-A2: vorher 6 (deer 5, fox 1; Würfe≥2 1: deer 5 Spanne 2.6 m @222.2 m; Verband-Feld true, Verbände≥2 1: deer 5 Spanne 2.6 m; Zustand {"-":6})
  nachher 6 (deer 5, fox 1; Würfe≥2 1: deer 5 Spanne 2.3 m @222.9 m; Verband-Feld true, Verbände≥2 1: deer 5 Spanne 2.3 m; Zustand {"-":6})
- stadt-B1: vorher 6 (deer 5, fox 1; Würfe≥2 1: deer 5 Spanne 2.5 m @222.2 m; Verband-Feld true, Verbände≥2 1: deer 5 Spanne 2.5 m; Zustand {"-":6})
  nachher 6 (deer 5, fox 1; Würfe≥2 1: deer 5 Spanne 2.4 m @222.8 m; Verband-Feld true, Verbände≥2 1: deer 5 Spanne 2.4 m; Zustand {"-":6})
- stadt-B2: vorher 6 (deer 5, fox 1; Würfe≥2 1: deer 5 Spanne 2.5 m @222.1 m; Verband-Feld true, Verbände≥2 1: deer 5 Spanne 2.5 m; Zustand {"-":6})
  nachher 6 (deer 5, fox 1; Würfe≥2 1: deer 5 Spanne 2.4 m @222.8 m; Verband-Feld true, Verbände≥2 1: deer 5 Spanne 2.4 m; Zustand {"-":6})

## GPU-Takt je Boot (nvidia-smi 1 s, nur P0-Sekunden: Median-MHz · Anteil Drossel (Grund ≠ 0 ohne GpuIdle 0x1) · max °C)

- stadt-A1: 182 s · 1721 MHz · Drossel 16 % · 86 °C
- stadt-A2: 193 s · 1708 MHz · Drossel 15 % · 86 °C
- stadt-B1: 174 s · 1721 MHz · Drossel 21 % · 86 °C
- stadt-B2: 170 s · 1721 MHz · Drossel 17 % · 86 °C

## Mittel je Seite (A b2c6c627 · B f85ddf35; gehend = geht-1 je Boot)

| Gang | Größe | A | B | Δ B − A | 2σ | t (Welch) | Urteil |
|---|---|---|---|---|---|---|---|
| steht | fps | 77.8 (77.5 · 78.0) | 78.0 (78.0 · 78.0) | +0.3 | 0.5 | 1.00 | nicht langsamer |
| steht | Frame p50 ms | 16.6 (16.6 · 16.6) | 16.6 (16.5 · 16.6) | -0.1 | 0.1 | -1.00 | nicht langsamer |
| steht | Frame p95 ms | 16.8 (16.8 · 16.8) | 16.8 (16.8 · 16.8) | 0.0 | 0.0 | – | nicht langsamer |
| steht | Frame p99 ms | 17.6 (18.1 · 17.1) | 17.1 (17.1 · 17.0) | -0.6 | 1.0 | -1.09 | nicht langsamer |
| steht | CPU-Takt p50 ms | 5.95 (6.00 · 5.90) | 5.85 (5.90 · 5.80) | -0.10 | 0.14 | -1.41 | nicht langsamer |
| steht | CPU-Takt p95 ms | 7.6 (7.8 · 7.4) | 7.5 (7.4 · 7.5) | -0.1 | 0.4 | -0.73 | nicht langsamer |
| steht | CPU-Takt p99 ms | 10.3 (10.7 · 9.9) | 9.7 (9.8 · 9.6) | -0.6 | 0.8 | -1.46 | nicht langsamer |
| steht | GPU-Durchsatz p50 ms | 12.85 (12.90 · 12.80) | 12.85 (12.80 · 12.90) | 0.00 | 0.14 | 0.00 | nicht langsamer |
| steht | k0 p50 ms | 0.20 (0.20 · 0.20) | 0.20 (0.20 · 0.20) | 0.00 | 0.00 | – | nicht langsamer |
| steht | GPU p95 ms (lauf) | 2.13 (2.18 · 2.09) | 2.16 (2.20 · 2.12) | +0.03 | 0.12 | 0.42 | nicht langsamer |
| steht | GPU je Bild ms (gpu-bank) | – (– · –) | – (– · –) | – | – | – | – |
| steht | Belegung p50 ms | 8.59 (8.69 · 8.49) | 8.50 (8.46 · 8.54) | -0.09 | 0.22 | -0.84 | nicht langsamer |
| steht | Belegung p95 ms | 11.60 (11.75 · 11.45) | 11.37 (11.39 · 11.35) | -0.23 | 0.30 | -1.52 | nicht langsamer |
| steht | außer Takt p95 ms | 0.94 (0.93 · 0.94) | 0.94 (0.94 · 0.93) | 0.00 | 0.01 | 0.00 | nicht langsamer |
| steht | Lebenszyklus p95 ms | 0.08 (0.09 · 0.08) | 0.09 (0.09 · 0.09) | +0.01 | 0.01 | 1.00 | nicht langsamer |
| steht | über 33 ms % | – (– · –) | – (– · –) | – | – | – | – |
| steht | KI-Uhr Mittel ms | – (– · –) | – (– · –) | – | – | – | – |
| steht | KI-Uhr p95 ms | – (– · –) | – (– · –) | – | – | – | – |
| steht | KI-Uhr p99 ms | – (– · –) | – (– · –) | – | – | – | – |
| steht | KI-Takt EWMA ms | 2.54 (2.75 · 2.33) | 2.46 (2.40 · 2.51) | -0.08 | 0.43 | -0.39 | nicht langsamer |
| geht | fps | 42.3 (42.2 · 42.3) | 42.9 (42.2 · 43.5) | +0.6 | 1.3 | 0.92 | nicht langsamer |
| geht | Frame p50 ms | 16.8 (16.8 · 16.8) | 16.8 (16.8 · 16.8) | 0.0 | 0.0 | – | nicht langsamer |
| geht | Frame p95 ms | 41.7 (41.7 · 41.7) | 41.7 (41.7 · 41.7) | 0.0 | 0.0 | – | nicht langsamer |
| geht | Frame p99 ms | 79.2 (75.0 · 83.4) | 75.1 (83.4 · 66.8) | -4.1 | 18.6 | -0.44 | nicht langsamer |
| geht | CPU-Takt p50 ms | 18.65 (18.80 · 18.50) | 18.30 (18.40 · 18.20) | -0.35 | 0.36 | -1.94 | nicht langsamer |
| geht | CPU-Takt p95 ms | 39.4 (39.2 · 39.6) | 38.0 (38.9 · 37.0) | -1.5 | 1.9 | -1.49 | nicht langsamer |
| geht | CPU-Takt p99 ms | 72.4 (70.9 · 73.9) | 74.3 (82.0 · 66.5) | +1.8 | 15.8 | 0.23 | nicht langsamer |
| geht | GPU-Durchsatz p50 ms | 20.00 (20.10 · 19.90) | 19.80 (19.80 · 19.80) | -0.20 | 0.20 | -2.00 | nicht langsamer |
| geht | k0 p50 ms | 0.14 (0.14 · 0.14) | 0.14 (0.14 · 0.14) | 0.00 | 0.00 | – | nicht langsamer |
| geht | GPU p95 ms (lauf) | 2.41 (2.42 · 2.40) | 2.46 (2.37 · 2.55) | +0.05 | 0.18 | 0.55 | nicht langsamer |
| geht | GPU je Bild ms (gpu-bank) | – (– · –) | – (– · –) | – | – | – | – |
| geht | Belegung p50 ms | 19.94 (20.07 · 19.80) | 19.73 (19.75 · 19.72) | -0.20 | 0.27 | -1.47 | nicht langsamer |
| geht | Belegung p95 ms | 41.84 (41.99 · 41.69) | 40.39 (41.78 · 39.00) | -1.45 | 2.80 | -1.04 | nicht langsamer |
| geht | außer Takt p95 ms | 2.71 (3.07 · 2.35) | 3.05 (2.88 · 3.23) | +0.34 | 0.80 | 0.86 | nicht langsamer |
| geht | Lebenszyklus p95 ms | 0.09 (0.09 · 0.09) | 0.10 (0.10 · 0.09) | +0.01 | 0.01 | 1.00 | nicht langsamer |
| geht | über 33 ms % | – (– · –) | – (– · –) | – | – | – | – |
| geht | KI-Uhr Mittel ms | – (– · –) | – (– · –) | – | – | – | – |
| geht | KI-Uhr p95 ms | – (– · –) | – (– · –) | – | – | – | – |
| geht | KI-Uhr p99 ms | – (– · –) | – (– · –) | – | – | – | – |
| geht | KI-Takt EWMA ms | 5.03 (5.19 · 4.87) | 3.60 (3.52 · 3.68) | -1.43 | 0.36 | -7.99 | nicht langsamer |

**KERN-URTEIL GEHEN stadt** (steht + geht × fps · Frame p95 · CPU-Takt p95 · GPU je Bild (gpu-bank, nur steht) · Belegung p95; Δ ≤ max(2σ gepoolt, Auflösung)): nicht langsamer (8 Größen)
