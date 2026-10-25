## stadt — je Boot

| Boot | Gang | fps | Frame p50 ms | Frame p95 ms | Frame p99 ms | CPU-Takt p50 ms | CPU-Takt p95 ms | CPU-Takt p99 ms | GPU-Durchsatz p50 ms | k0 p50 ms | GPU p95 ms (lauf) | GPU je Bild ms (gpu-bank) | Belegung p50 ms | Belegung p95 ms | außer Takt p95 ms | Lebenszyklus p95 ms | über 33 ms % | KI-Uhr Mittel ms | KI-Uhr p95 ms | KI-Uhr p99 ms | KI-Takt EWMA ms |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| stadt-A1 | steht | 72.3 | 16.6 | 16.9 | 25.0 | 6.70 | 9.2 | 12.9 | 13.80 | 0.13 | 2.42 | – | 10.02 | 13.56 | 1.37 | 0.10 | – | – | – | – | 3.20 |
| stadt-A1 | geht-1 | 34.2 | 25.0 | 58.4 | 125.1 | 22.20 | 49.8 | 103.4 | 23.70 | 0.22 | 2.32 | – | 23.78 | 56.98 | 5.65 | 0.14 | – | – | – | – | 2.71 |
| stadt-A1 | Geher-Ende |  | | | | | | | | | | | | | | | | | | | |
| stadt-A2 | steht | 72.4 | 16.6 | 16.8 | 25.0 | 6.70 | 8.8 | 11.2 | 13.90 | 0.13 | 2.36 | – | 10.11 | 13.26 | 1.18 | 0.09 | – | – | – | – | 3.31 |
| stadt-A2 | geht-1 | 37.7 | 25.0 | 50.0 | 108.3 | 20.80 | 44.3 | 101.2 | 22.00 | 0.22 | 2.33 | – | 22.02 | 50.25 | 4.44 | 0.13 | – | – | – | – | 2.89 |
| stadt-A2 | Geher-Ende |  | | | | | | | | | | | | | | | | | | | |
| stadt-B1 | steht | 73.2 | 16.6 | 16.9 | 25.0 | 6.20 | 8.2 | 11.1 | 13.70 | 0.13 | 2.39 | – | 8.94 | 11.81 | 1.11 | 0.09 | – | – | – | – | 2.02 |
| stadt-B1 | geht-1 | 37.9 | 25.0 | 50.1 | 100.0 | 20.70 | 46.7 | 99.4 | 21.90 | 0.22 | 2.35 | – | 21.98 | 51.74 | 4.56 | 0.17 | – | – | – | – | 2.05 |
| stadt-B1 | Geher-Ende |  | | | | | | | | | | | | | | | | | | | |
| stadt-B2 | steht | 75.0 | 16.6 | 16.8 | 24.9 | 5.40 | 7.2 | 8.8 | 13.30 | 0.13 | 2.37 | – | 7.81 | 10.19 | 0.82 | 0.08 | – | – | – | – | 1.52 |
| stadt-B2 | geht-1 | 37.4 | 25.0 | 50.0 | 100.0 | 21.00 | 42.9 | 92.7 | 22.40 | 0.22 | 2.42 | – | 22.29 | 50.96 | 4.73 | 0.11 | – | – | – | – | 2.25 |
| stadt-B2 | Geher-Ende |  | | | | | | | | | | | | | | | | | | | |

## Tier-Zensus je Boot (zensus-0 nach umstellen · zensus-1 nach geht-1)

- stadt-A1: vorher 7 (deer 7; Würfe≥2 1: deer 7 Spanne 4.4 m @179.5 m; Verband-Feld true, Verbände≥2 1: deer 7 Spanne 4.4 m; Zustand {"-":7})
  nachher 6 (deer 5, fox 1; Würfe≥2 1: deer 5 Spanne 3.8 m @180.8 m; Verband-Feld true, Verbände≥2 1: deer 5 Spanne 3.8 m; Zustand {"-":5,"fressen":1})
- stadt-A2: vorher 7 (deer 6, fox 1; Würfe≥2 1: deer 6 Spanne 4.2 m @180.2 m; Verband-Feld true, Verbände≥2 1: deer 6 Spanne 4.2 m; Zustand {"-":7})
  nachher 6 (deer 5, fox 1; Würfe≥2 1: deer 5 Spanne 3.7 m @181.5 m; Verband-Feld true, Verbände≥2 1: deer 5 Spanne 3.7 m; Zustand {"-":6})
- stadt-B1: vorher 7 (deer 6, fox 1; Würfe≥2 1: deer 6 Spanne 3.9 m @180.2 m; Verband-Feld true, Verbände≥2 1: deer 6 Spanne 3.9 m; Zustand {"-":7})
  nachher 6 (deer 5, fox 1; Würfe≥2 1: deer 5 Spanne 3.7 m @181.4 m; Verband-Feld true, Verbände≥2 1: deer 5 Spanne 3.7 m; Zustand {"-":6})
- stadt-B2: vorher 6 (deer 5, fox 1; Würfe≥2 1: deer 5 Spanne 3.5 m @181.4 m; Verband-Feld true, Verbände≥2 1: deer 5 Spanne 3.5 m; Zustand {"-":5,"fressen":1})
  nachher 5 (deer 4, fox 1; Würfe≥2 1: deer 4 Spanne 3.3 m @181.9 m; Verband-Feld true, Verbände≥2 1: deer 4 Spanne 3.3 m; Zustand {"-":5})

## GPU-Takt je Boot (nvidia-smi 1 s, nur P0-Sekunden: Median-MHz · Anteil Drossel (Grund ≠ 0 ohne GpuIdle 0x1) · max °C)

- stadt-A1: 135 s · 1733 MHz · Drossel 19 % · 86 °C
- stadt-A2: 149 s · 1733 MHz · Drossel 17 % · 86 °C
- stadt-B1: 148 s · 1733 MHz · Drossel 20 % · 86 °C
- stadt-B2: 178 s · 1721 MHz · Drossel 15 % · 86 °C

## Mittel je Seite (A 79c0fae2 · B 206b395a; gehend = geht-1 je Boot)

| Gang | Größe | A | B | Δ B − A | 2σ | t (Welch) | Urteil |
|---|---|---|---|---|---|---|---|
| steht | fps | 72.3 (72.3 · 72.4) | 74.1 (73.2 · 75.0) | +1.8 | 1.8 | 1.94 | nicht langsamer |
| steht | Frame p50 ms | 16.6 (16.6 · 16.6) | 16.6 (16.6 · 16.6) | 0.0 | 0.0 | – | nicht langsamer |
| steht | Frame p95 ms | 16.9 (16.9 · 16.8) | 16.9 (16.9 · 16.8) | 0.0 | 0.1 | 0.00 | nicht langsamer |
| steht | Frame p99 ms | 25.0 (25.0 · 25.0) | 24.9 (25.0 · 24.9) | -0.1 | 0.1 | -1.00 | nicht langsamer |
| steht | CPU-Takt p50 ms | 6.70 (6.70 · 6.70) | 5.80 (6.20 · 5.40) | -0.90 | 0.80 | -2.25 | nicht langsamer |
| steht | CPU-Takt p95 ms | 9.0 (9.2 · 8.8) | 7.7 (8.2 · 7.2) | -1.3 | 1.1 | -2.41 | nicht langsamer |
| steht | CPU-Takt p99 ms | 12.1 (12.9 · 11.2) | 9.9 (11.1 · 8.8) | -2.1 | 2.9 | -1.47 | nicht langsamer |
| steht | GPU-Durchsatz p50 ms | 13.85 (13.80 · 13.90) | 13.50 (13.70 · 13.30) | -0.35 | 0.41 | -1.70 | nicht langsamer |
| steht | k0 p50 ms | 0.13 (0.13 · 0.13) | 0.13 (0.13 · 0.13) | 0.00 | 0.00 | – | nicht langsamer |
| steht | GPU p95 ms (lauf) | 2.39 (2.42 · 2.36) | 2.38 (2.39 · 2.37) | -0.01 | 0.06 | -0.32 | nicht langsamer |
| steht | GPU je Bild ms (gpu-bank) | – (– · –) | – (– · –) | – | – | – | – |
| steht | Belegung p50 ms | 10.06 (10.02 · 10.11) | 8.38 (8.94 · 7.81) | -1.69 | 1.13 | -2.98 | nicht langsamer |
| steht | Belegung p95 ms | 13.41 (13.56 · 13.26) | 11.00 (11.81 · 10.19) | -2.41 | 1.65 | -2.93 | nicht langsamer |
| steht | außer Takt p95 ms | 1.27 (1.37 · 1.18) | 0.97 (1.11 · 0.82) | -0.31 | 0.35 | -1.79 | nicht langsamer |
| steht | Lebenszyklus p95 ms | 0.10 (0.10 · 0.09) | 0.08 (0.09 · 0.08) | -0.01 | 0.01 | -1.41 | nicht langsamer |
| steht | über 33 ms % | – (– · –) | – (– · –) | – | – | – | – |
| steht | KI-Uhr Mittel ms | – (– · –) | – (– · –) | – | – | – | – |
| steht | KI-Uhr p95 ms | – (– · –) | – (– · –) | – | – | – | – |
| steht | KI-Uhr p99 ms | – (– · –) | – (– · –) | – | – | – | – |
| steht | KI-Takt EWMA ms | 3.25 (3.20 · 3.31) | 1.77 (2.02 · 1.52) | -1.48 | 0.51 | -5.80 | nicht langsamer |
| geht | fps | 36.0 (34.2 · 37.7) | 37.6 (37.9 · 37.4) | +1.7 | 3.5 | 0.96 | nicht langsamer |
| geht | Frame p50 ms | 25.0 (25.0 · 25.0) | 25.0 (25.0 · 25.0) | 0.0 | 0.0 | – | nicht langsamer |
| geht | Frame p95 ms | 54.2 (58.4 · 50.0) | 50.0 (50.1 · 50.0) | -4.2 | 8.4 | -0.99 | nicht langsamer |
| geht | Frame p99 ms | 116.7 (125.1 · 108.3) | 100.0 (100.0 · 100.0) | -16.7 | 16.8 | -1.99 | nicht langsamer |
| geht | CPU-Takt p50 ms | 21.50 (22.20 · 20.80) | 20.85 (20.70 · 21.00) | -0.65 | 1.43 | -0.91 | nicht langsamer |
| geht | CPU-Takt p95 ms | 47.0 (49.8 · 44.3) | 44.8 (46.7 · 42.9) | -2.3 | 6.7 | -0.67 | nicht langsamer |
| geht | CPU-Takt p99 ms | 102.3 (103.4 · 101.2) | 96.1 (99.4 · 92.7) | -6.3 | 7.1 | -1.77 | nicht langsamer |
| geht | GPU-Durchsatz p50 ms | 22.85 (23.70 · 22.00) | 22.15 (21.90 · 22.40) | -0.70 | 1.77 | -0.79 | nicht langsamer |
| geht | k0 p50 ms | 0.22 (0.22 · 0.22) | 0.22 (0.22 · 0.22) | 0.00 | 0.00 | – | nicht langsamer |
| geht | GPU p95 ms (lauf) | 2.33 (2.32 · 2.33) | 2.38 (2.35 · 2.42) | +0.06 | 0.07 | 1.70 | nicht langsamer |
| geht | GPU je Bild ms (gpu-bank) | – (– · –) | – (– · –) | – | – | – | – |
| geht | Belegung p50 ms | 22.90 (23.78 · 22.02) | 22.13 (21.98 · 22.29) | -0.77 | 1.79 | -0.86 | nicht langsamer |
| geht | Belegung p95 ms | 53.61 (56.98 · 50.25) | 51.35 (51.74 · 50.96) | -2.26 | 6.78 | -0.67 | nicht langsamer |
| geht | außer Takt p95 ms | 5.04 (5.65 · 4.44) | 4.64 (4.56 · 4.73) | -0.40 | 1.22 | -0.65 | nicht langsamer |
| geht | Lebenszyklus p95 ms | 0.14 (0.14 · 0.13) | 0.14 (0.17 · 0.11) | +0.01 | 0.06 | 0.16 | nicht langsamer |
| geht | über 33 ms % | – (– · –) | – (– · –) | – | – | – | – |
| geht | KI-Uhr Mittel ms | – (– · –) | – (– · –) | – | – | – | – |
| geht | KI-Uhr p95 ms | – (– · –) | – (– · –) | – | – | – | – |
| geht | KI-Uhr p99 ms | – (– · –) | – (– · –) | – | – | – | – |
| geht | KI-Takt EWMA ms | 2.80 (2.71 · 2.89) | 2.15 (2.05 · 2.25) | -0.65 | 0.27 | -4.83 | nicht langsamer |

**KERN-URTEIL GEHEN stadt** (steht + geht × fps · Frame p95 · CPU-Takt p95 · GPU je Bild (gpu-bank, nur steht) · Belegung p95; Δ ≤ max(2σ gepoolt, Auflösung)): nicht langsamer (8 Größen)
