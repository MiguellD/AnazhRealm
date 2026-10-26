## stadt — je Boot

| Boot | Gang | fps | Frame p50 ms | Frame p95 ms | Frame p99 ms | CPU-Takt p50 ms | CPU-Takt p95 ms | CPU-Takt p99 ms | GPU-Durchsatz p50 ms | k0 p50 ms | GPU p95 ms (lauf) | GPU je Bild ms (gpu-bank) | Belegung p50 ms | Belegung p95 ms | außer Takt p95 ms | Lebenszyklus p95 ms | über 33 ms % | KI-Uhr Mittel ms | KI-Uhr p95 ms | KI-Uhr p99 ms | KI-Takt EWMA ms |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| stadt-A1 | steht | 77.4 | 16.5 | 16.8 | 17.1 | 6.20 | 7.8 | 10.1 | 12.90 | 0.20 | 2.11 | – | 9.10 | 11.88 | 0.96 | 0.09 | – | – | – | – | 2.72 |
| stadt-A1 | geht-1 | 39.6 | 24.9 | 49.9 | 91.6 | 19.90 | 43.7 | 84.0 | 20.90 | 0.14 | 2.56 | – | 21.00 | 46.61 | 2.36 | 0.10 | – | – | – | – | 3.64 |
| stadt-A1 | Geher-Ende |  | | | | | | | | | | | | | | | | | | | |
| stadt-A2 | steht | 77.6 | 16.5 | 16.8 | 17.0 | 5.90 | 7.6 | 9.8 | 12.90 | 0.20 | 2.15 | – | 8.59 | 11.56 | 0.94 | 0.09 | – | – | – | – | 2.96 |
| stadt-A2 | geht-1 | 42.9 | 16.8 | 41.7 | 66.7 | 18.50 | 38.1 | 65.1 | 19.80 | 0.14 | 2.42 | – | 19.83 | 41.08 | 2.77 | 0.09 | – | – | – | – | 3.90 |
| stadt-A2 | Geher-Ende |  | | | | | | | | | | | | | | | | | | | |
| stadt-B1 | steht | 77.8 | 16.5 | 16.8 | 17.1 | 6.00 | 7.7 | 11.2 | 12.80 | 0.20 | 2.02 | – | 8.58 | 11.75 | 0.98 | 0.08 | – | – | – | – | 2.50 |
| stadt-B1 | geht-1 | 39.8 | 24.9 | 49.9 | 108.3 | 19.80 | 43.8 | 96.6 | 20.90 | 0.14 | 2.39 | – | 20.90 | 45.03 | 2.59 | 0.11 | – | – | – | – | 3.49 |
| stadt-B1 | Geher-Ende |  | | | | | | | | | | | | | | | | | | | |
| stadt-B2 | steht | 77.9 | 16.6 | 16.8 | 17.2 | 6.10 | 8.0 | 11.3 | 12.90 | 0.20 | 2.08 | – | 8.86 | 12.14 | 0.96 | 0.08 | – | – | – | – | 2.57 |
| stadt-B2 | geht-1 | 40.6 | 24.9 | 41.7 | 83.4 | 19.60 | 41.6 | 81.4 | 20.70 | 0.14 | 2.42 | – | 20.69 | 45.88 | 2.48 | 0.09 | – | – | – | – | 3.61 |
| stadt-B2 | Geher-Ende |  | | | | | | | | | | | | | | | | | | | |

## Tier-Zensus je Boot (zensus-0 nach umstellen · zensus-1 nach geht-1)

- stadt-A1: vorher 6 (deer 5, fox 1; Würfe≥2 1: deer 5 Spanne 2.5 m @222.2 m; Verband-Feld true, Verbände≥2 1: deer 5 Spanne 2.5 m; Zustand {"-":6})
  nachher 6 (deer 5, fox 1; Würfe≥2 1: deer 5 Spanne 2.4 m @222.8 m; Verband-Feld true, Verbände≥2 1: deer 5 Spanne 2.4 m; Zustand {"-":6})
- stadt-A2: vorher 6 (deer 5, fox 1; Würfe≥2 1: deer 5 Spanne 2.5 m @222.2 m; Verband-Feld true, Verbände≥2 1: deer 5 Spanne 2.5 m; Zustand {"-":6})
  nachher 6 (deer 5, fox 1; Würfe≥2 1: deer 5 Spanne 2.4 m @222.8 m; Verband-Feld true, Verbände≥2 1: deer 5 Spanne 2.4 m; Zustand {"-":6})
- stadt-B1: vorher 6 (deer 5, fox 1; Würfe≥2 1: deer 5 Spanne 2.7 m @222.2 m; Verband-Feld true, Verbände≥2 1: deer 5 Spanne 2.7 m; Zustand {"-":6})
  nachher 6 (deer 5, fox 1; Würfe≥2 1: deer 5 Spanne 2.3 m @222.9 m; Verband-Feld true, Verbände≥2 1: deer 5 Spanne 2.3 m; Zustand {"-":6})
- stadt-B2: vorher 6 (deer 5, fox 1; Würfe≥2 1: deer 5 Spanne 2.6 m @222.2 m; Verband-Feld true, Verbände≥2 1: deer 5 Spanne 2.6 m; Zustand {"-":6})
  nachher 6 (deer 5, fox 1; Würfe≥2 1: deer 5 Spanne 2.3 m @222.9 m; Verband-Feld true, Verbände≥2 1: deer 5 Spanne 2.3 m; Zustand {"-":6})

## GPU-Takt je Boot (nvidia-smi 1 s, nur P0-Sekunden: Median-MHz · Anteil Drossel (Grund ≠ 0 ohne GpuIdle 0x1) · max °C)

- stadt-A1: 141 s · 1733 MHz · Drossel 25 % · 86 °C
- stadt-A2: 164 s · 1733 MHz · Drossel 18 % · 84 °C
- stadt-B1: 151 s · 1733 MHz · Drossel 25 % · 86 °C
- stadt-B2: 197 s · 1556 MHz · Drossel 14 % · 86 °C

## Mittel je Seite (A 9ceeca71 · B b2c6c627; gehend = geht-1 je Boot)

| Gang | Größe | A | B | Δ B − A | 2σ | t (Welch) | Urteil |
|---|---|---|---|---|---|---|---|
| steht | fps | 77.5 (77.4 · 77.6) | 77.8 (77.8 · 77.9) | +0.3 | 0.2 | 3.13 | nicht langsamer |
| steht | Frame p50 ms | 16.5 (16.5 · 16.5) | 16.6 (16.5 · 16.6) | +0.1 | 0.1 | 1.00 | nicht langsamer |
| steht | Frame p95 ms | 16.8 (16.8 · 16.8) | 16.8 (16.8 · 16.8) | 0.0 | 0.0 | – | nicht langsamer |
| steht | Frame p99 ms | 17.1 (17.1 · 17.0) | 17.1 (17.1 · 17.2) | +0.1 | 0.1 | 1.41 | nicht langsamer |
| steht | CPU-Takt p50 ms | 6.05 (6.20 · 5.90) | 6.05 (6.00 · 6.10) | -0.00 | 0.32 | -0.00 | nicht langsamer |
| steht | CPU-Takt p95 ms | 7.7 (7.8 · 7.6) | 7.8 (7.7 · 8.0) | +0.2 | 0.4 | 0.83 | nicht langsamer |
| steht | CPU-Takt p99 ms | 9.9 (10.1 · 9.8) | 11.3 (11.2 · 11.3) | +1.3 | 0.3 | 8.22 | LANGSAMER |
| steht | GPU-Durchsatz p50 ms | 12.90 (12.90 · 12.90) | 12.85 (12.80 · 12.90) | -0.05 | 0.10 | -1.00 | nicht langsamer |
| steht | k0 p50 ms | 0.20 (0.20 · 0.20) | 0.20 (0.20 · 0.20) | 0.00 | 0.00 | – | nicht langsamer |
| steht | GPU p95 ms (lauf) | 2.13 (2.11 · 2.15) | 2.05 (2.02 · 2.08) | -0.08 | 0.07 | -2.22 | nicht langsamer |
| steht | GPU je Bild ms (gpu-bank) | – (– · –) | – (– · –) | – | – | – | – |
| steht | Belegung p50 ms | 8.84 (9.10 · 8.59) | 8.72 (8.58 · 8.86) | -0.13 | 0.58 | -0.43 | nicht langsamer |
| steht | Belegung p95 ms | 11.72 (11.88 · 11.56) | 11.95 (11.75 · 12.14) | +0.22 | 0.50 | 0.89 | nicht langsamer |
| steht | außer Takt p95 ms | 0.95 (0.96 · 0.94) | 0.97 (0.98 · 0.96) | +0.02 | 0.03 | 1.41 | nicht langsamer |
| steht | Lebenszyklus p95 ms | 0.09 (0.09 · 0.09) | 0.08 (0.08 · 0.08) | -0.01 | 0.00 | – | nicht langsamer |
| steht | über 33 ms % | – (– · –) | – (– · –) | – | – | – | – |
| steht | KI-Uhr Mittel ms | – (– · –) | – (– · –) | – | – | – | – |
| steht | KI-Uhr p95 ms | – (– · –) | – (– · –) | – | – | – | – |
| steht | KI-Uhr p99 ms | – (– · –) | – (– · –) | – | – | – | – |
| steht | KI-Takt EWMA ms | 2.84 (2.72 · 2.96) | 2.54 (2.50 · 2.57) | -0.30 | 0.25 | -2.44 | nicht langsamer |
| geht | fps | 41.3 (39.6 · 42.9) | 40.2 (39.8 · 40.6) | -1.0 | 3.4 | -0.62 | nicht langsamer |
| geht | Frame p50 ms | 20.9 (24.9 · 16.8) | 24.9 (24.9 · 24.9) | +4.0 | 8.1 | 1.00 | nicht langsamer |
| geht | Frame p95 ms | 45.8 (49.9 · 41.7) | 45.8 (49.9 · 41.7) | 0.0 | 11.6 | 0.00 | nicht langsamer |
| geht | Frame p99 ms | 79.2 (91.6 · 66.7) | 95.8 (108.3 · 83.4) | +16.7 | 35.2 | 0.95 | nicht langsamer |
| geht | CPU-Takt p50 ms | 19.20 (19.90 · 18.50) | 19.70 (19.80 · 19.60) | +0.50 | 1.41 | 0.71 | nicht langsamer |
| geht | CPU-Takt p95 ms | 40.9 (43.7 · 38.1) | 42.7 (43.8 · 41.6) | +1.8 | 6.0 | 0.60 | nicht langsamer |
| geht | CPU-Takt p99 ms | 74.5 (84.0 · 65.1) | 89.0 (96.6 · 81.4) | +14.5 | 24.3 | 1.19 | nicht langsamer |
| geht | GPU-Durchsatz p50 ms | 20.35 (20.90 · 19.80) | 20.80 (20.90 · 20.70) | +0.45 | 1.12 | 0.80 | nicht langsamer |
| geht | k0 p50 ms | 0.14 (0.14 · 0.14) | 0.14 (0.14 · 0.14) | 0.00 | 0.00 | – | nicht langsamer |
| geht | GPU p95 ms (lauf) | 2.49 (2.56 · 2.42) | 2.41 (2.39 · 2.42) | -0.08 | 0.14 | -1.19 | nicht langsamer |
| geht | GPU je Bild ms (gpu-bank) | – (– · –) | – (– · –) | – | – | – | – |
| geht | Belegung p50 ms | 20.41 (21.00 · 19.83) | 20.80 (20.90 · 20.69) | +0.38 | 1.19 | 0.64 | nicht langsamer |
| geht | Belegung p95 ms | 43.84 (46.61 · 41.08) | 45.45 (45.03 · 45.88) | +1.61 | 5.59 | 0.58 | nicht langsamer |
| geht | außer Takt p95 ms | 2.56 (2.36 · 2.77) | 2.54 (2.59 · 2.48) | -0.03 | 0.42 | -0.14 | nicht langsamer |
| geht | Lebenszyklus p95 ms | 0.10 (0.10 · 0.09) | 0.10 (0.11 · 0.09) | +0.01 | 0.02 | 0.45 | nicht langsamer |
| geht | über 33 ms % | – (– · –) | – (– · –) | – | – | – | – |
| geht | KI-Uhr Mittel ms | – (– · –) | – (– · –) | – | – | – | – |
| geht | KI-Uhr p95 ms | – (– · –) | – (– · –) | – | – | – | – |
| geht | KI-Uhr p99 ms | – (– · –) | – (– · –) | – | – | – | – |
| geht | KI-Takt EWMA ms | 3.77 (3.64 · 3.90) | 3.55 (3.49 · 3.61) | -0.22 | 0.29 | -1.54 | nicht langsamer |

**KERN-URTEIL GEHEN stadt** (steht + geht × fps · Frame p95 · CPU-Takt p95 · GPU je Bild (gpu-bank, nur steht) · Belegung p95; Δ ≤ max(2σ gepoolt, Auflösung)): nicht langsamer (8 Größen)
