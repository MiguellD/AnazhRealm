## stadt — je Boot

| Boot | Gang | fps | Frame p50 ms | Frame p95 ms | Frame p99 ms | CPU-Takt p50 ms | CPU-Takt p95 ms | CPU-Takt p99 ms | GPU-Durchsatz p50 ms | k0 p50 ms | GPU p95 ms (lauf) | GPU je Bild ms (gpu-bank) | Belegung p50 ms | Belegung p95 ms | außer Takt p95 ms | Lebenszyklus p95 ms | über 33 ms % | KI-Uhr Mittel ms | KI-Uhr p95 ms | KI-Uhr p99 ms | KI-Takt EWMA ms |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| stadt-A1 | steht | 79.2 | 16.1 | 16.8 | 17.7 | 5.00 | 6.8 | 8.9 | 12.60 | 0.24 | 3.28 | – | 7.14 | 9.89 | 0.80 | 0.08 | – | – | – | – | 2.21 |
| stadt-A1 | geht-1 | 35.5 | 25.0 | 58.3 | 100.0 | 21.80 | 49.7 | 96.0 | 23.20 | 0.35 | 2.52 | – | 23.27 | 57.88 | 4.41 | 0.13 | – | – | – | – | 1.95 |
| stadt-A1 | Geher-Ende |  | | | | | | | | | | | | | | | | | | | |
| stadt-A2 | steht | 79.2 | 16.2 | 16.8 | 17.0 | 5.00 | 6.6 | 8.5 | 12.60 | 0.24 | 3.41 | – | 7.03 | 9.63 | 0.79 | 0.08 | – | – | – | – | 2.17 |
| stadt-A2 | geht-1 | 36.3 | 25.0 | 50.2 | 100.0 | 21.50 | 48.7 | 95.0 | 22.70 | 0.35 | 2.49 | – | 22.87 | 54.84 | 4.18 | 0.11 | – | – | – | – | 1.67 |
| stadt-A2 | Geher-Ende |  | | | | | | | | | | | | | | | | | | | |
| stadt-B1 | steht | 78.5 | 15.9 | 16.8 | 17.1 | 4.90 | 6.7 | 9.2 | 12.50 | 0.24 | 3.25 | – | 6.95 | 9.87 | 0.82 | 0.10 | – | – | – | – | 1.83 |
| stadt-B1 | geht-1 | 41.1 | 24.9 | 49.8 | 83.3 | 19.50 | 39.4 | 74.0 | 20.80 | 0.35 | 2.56 | – | 20.74 | 46.15 | 3.84 | 0.13 | – | – | – | – | 1.77 |
| stadt-B1 | Geher-Ende |  | | | | | | | | | | | | | | | | | | | |
| stadt-B2 | steht | 79.1 | 15.9 | 16.8 | 17.3 | 5.00 | 6.8 | 9.2 | 12.60 | 0.24 | 3.32 | – | 7.10 | 9.97 | 0.79 | 0.08 | – | – | – | – | 2.20 |
| stadt-B2 | geht-1 | 40.9 | 24.9 | 49.9 | 83.3 | 19.20 | 40.8 | 70.2 | 20.60 | 0.35 | 2.55 | – | 20.53 | 46.47 | 3.96 | 0.11 | – | – | – | – | 1.77 |
| stadt-B2 | Geher-Ende |  | | | | | | | | | | | | | | | | | | | |

## Tier-Zensus je Boot (zensus-0 nach umstellen · zensus-1 nach geht-1)

- stadt-A1: vorher 7 (bear 3, deer 4; Würfe≥2 1: deer 4 Spanne 2.2 m @184.6 m; Verband-Feld true, Verbände≥2 1: deer 4 Spanne 2.2 m; Zustand {"-":7})
  nachher 7 (bear 3, deer 4; Würfe≥2 1: deer 4 Spanne 2.8 m @179.5 m; Verband-Feld true, Verbände≥2 1: deer 4 Spanne 2.8 m; Zustand {"-":7})
- stadt-A2: vorher 7 (bear 3, deer 4; Würfe≥2 1: deer 4 Spanne 2.2 m @184.7 m; Verband-Feld true, Verbände≥2 1: deer 4 Spanne 2.2 m; Zustand {"-":7})
  nachher 7 (bear 3, deer 4; Würfe≥2 1: deer 4 Spanne 2.9 m @179.7 m; Verband-Feld true, Verbände≥2 1: deer 4 Spanne 2.9 m; Zustand {"-":7})
- stadt-B1: vorher 7 (bear 3, deer 4; Würfe≥2 1: deer 4 Spanne 1.9 m @182 m; Verband-Feld true, Verbände≥2 1: deer 4 Spanne 1.9 m; Zustand {"-":7})
  nachher 7 (bear 3, deer 4; Würfe≥2 1: deer 4 Spanne 2.7 m @183.6 m; Verband-Feld true, Verbände≥2 1: deer 4 Spanne 2.7 m; Zustand {"-":7})
- stadt-B2: vorher 7 (bear 3, deer 4; Würfe≥2 1: deer 4 Spanne 2.2 m @185 m; Verband-Feld true, Verbände≥2 1: deer 4 Spanne 2.2 m; Zustand {"-":7})
  nachher 7 (bear 3, deer 4; Würfe≥2 1: deer 4 Spanne 2.7 m @179.7 m; Verband-Feld true, Verbände≥2 1: deer 4 Spanne 2.7 m; Zustand {"-":7})

## GPU-Takt je Boot (nvidia-smi 1 s, nur P0-Sekunden: Median-MHz · Anteil Drossel (Grund ≠ 0 ohne GpuIdle 0x1) · max °C)

- stadt-A1: 144 s · 1759 MHz · Drossel 17 % · 86 °C
- stadt-A2: 139 s · 1759 MHz · Drossel 14 % · 86 °C
- stadt-B1: 149 s · 1759 MHz · Drossel 19 % · 86 °C
- stadt-B2: 144 s · 1759 MHz · Drossel 13 % · 86 °C

## Mittel je Seite (A 1ef4042c main · B 40d00ade zug 2; gehend = geht-1 je Boot)

| Gang | Größe | A | B | Δ B − A | 2σ | t (Welch) | Urteil |
|---|---|---|---|---|---|---|---|
| steht | fps | 79.2 (79.2 · 79.2) | 78.8 (78.5 · 79.1) | -0.4 | 0.6 | -1.33 | nicht langsamer |
| steht | Frame p50 ms | 16.1 (16.1 · 16.2) | 15.9 (15.9 · 15.9) | -0.2 | 0.1 | -5.00 | nicht langsamer |
| steht | Frame p95 ms | 16.8 (16.8 · 16.8) | 16.8 (16.8 · 16.8) | 0.0 | 0.0 | – | nicht langsamer |
| steht | Frame p99 ms | 17.4 (17.7 · 17.0) | 17.2 (17.1 · 17.3) | -0.1 | 0.7 | -0.41 | nicht langsamer |
| steht | CPU-Takt p50 ms | 5.00 (5.00 · 5.00) | 4.95 (4.90 · 5.00) | -0.05 | 0.10 | -1.00 | nicht langsamer |
| steht | CPU-Takt p95 ms | 6.7 (6.8 · 6.6) | 6.8 (6.7 · 6.8) | +0.1 | 0.2 | 0.45 | nicht langsamer |
| steht | CPU-Takt p99 ms | 8.7 (8.9 · 8.5) | 9.2 (9.2 · 9.2) | +0.5 | 0.4 | 2.50 | LANGSAMER |
| steht | GPU-Durchsatz p50 ms | 12.60 (12.60 · 12.60) | 12.55 (12.50 · 12.60) | -0.05 | 0.10 | -1.00 | nicht langsamer |
| steht | k0 p50 ms | 0.24 (0.24 · 0.24) | 0.24 (0.24 · 0.24) | 0.00 | 0.00 | – | nicht langsamer |
| steht | GPU p95 ms (lauf) | 3.34 (3.28 · 3.41) | 3.29 (3.25 · 3.32) | -0.06 | 0.15 | -0.81 | nicht langsamer |
| steht | GPU je Bild ms (gpu-bank) | – (– · –) | – (– · –) | – | – | – | – |
| steht | Belegung p50 ms | 7.08 (7.14 · 7.03) | 7.03 (6.95 · 7.10) | -0.06 | 0.19 | -0.65 | nicht langsamer |
| steht | Belegung p95 ms | 9.76 (9.89 · 9.63) | 9.92 (9.87 · 9.97) | +0.16 | 0.28 | 1.15 | nicht langsamer |
| steht | außer Takt p95 ms | 0.80 (0.80 · 0.79) | 0.80 (0.82 · 0.79) | +0.01 | 0.03 | 0.63 | nicht langsamer |
| steht | Lebenszyklus p95 ms | 0.08 (0.08 · 0.08) | 0.09 (0.10 · 0.08) | +0.01 | 0.02 | 1.00 | nicht langsamer |
| steht | über 33 ms % | – (– · –) | – (– · –) | – | – | – | – |
| steht | KI-Uhr Mittel ms | – (– · –) | – (– · –) | – | – | – | – |
| steht | KI-Uhr p95 ms | – (– · –) | – (– · –) | – | – | – | – |
| steht | KI-Uhr p99 ms | – (– · –) | – (– · –) | – | – | – | – |
| steht | KI-Takt EWMA ms | 2.19 (2.21 · 2.17) | 2.02 (1.83 · 2.20) | -0.17 | 0.37 | -0.94 | nicht langsamer |
| geht | fps | 35.9 (35.5 · 36.3) | 41.0 (41.1 · 40.9) | +5.1 | 0.8 | 12.37 | nicht langsamer |
| geht | Frame p50 ms | 25.0 (25.0 · 25.0) | 24.9 (24.9 · 24.9) | -0.1 | 0.0 | – | nicht langsamer |
| geht | Frame p95 ms | 54.3 (58.3 · 50.2) | 49.8 (49.8 · 49.9) | -4.4 | 8.1 | -1.09 | nicht langsamer |
| geht | Frame p99 ms | 100.0 (100.0 · 100.0) | 83.3 (83.3 · 83.3) | -16.7 | 0.0 | – | nicht langsamer |
| geht | CPU-Takt p50 ms | 21.65 (21.80 · 21.50) | 19.35 (19.50 · 19.20) | -2.30 | 0.42 | -10.84 | nicht langsamer |
| geht | CPU-Takt p95 ms | 49.2 (49.7 · 48.7) | 40.1 (39.4 · 40.8) | -9.1 | 1.7 | -10.58 | nicht langsamer |
| geht | CPU-Takt p99 ms | 95.5 (96.0 · 95.0) | 72.1 (74.0 · 70.2) | -23.4 | 3.9 | -11.91 | nicht langsamer |
| geht | GPU-Durchsatz p50 ms | 22.95 (23.20 · 22.70) | 20.70 (20.80 · 20.60) | -2.25 | 0.54 | -8.36 | nicht langsamer |
| geht | k0 p50 ms | 0.35 (0.35 · 0.35) | 0.35 (0.35 · 0.35) | 0.00 | 0.00 | – | nicht langsamer |
| geht | GPU p95 ms (lauf) | 2.50 (2.52 · 2.49) | 2.55 (2.56 · 2.55) | +0.05 | 0.03 | 3.16 | LANGSAMER |
| geht | GPU je Bild ms (gpu-bank) | – (– · –) | – (– · –) | – | – | – | – |
| geht | Belegung p50 ms | 23.07 (23.27 · 22.87) | 20.63 (20.74 · 20.53) | -2.44 | 0.45 | -10.78 | nicht langsamer |
| geht | Belegung p95 ms | 56.36 (57.88 · 54.84) | 46.31 (46.15 · 46.47) | -10.05 | 3.06 | -6.58 | nicht langsamer |
| geht | außer Takt p95 ms | 4.29 (4.41 · 4.18) | 3.90 (3.84 · 3.96) | -0.40 | 0.26 | -3.05 | nicht langsamer |
| geht | Lebenszyklus p95 ms | 0.12 (0.13 · 0.11) | 0.12 (0.13 · 0.11) | 0.00 | 0.03 | 0.00 | nicht langsamer |
| geht | über 33 ms % | – (– · –) | – (– · –) | – | – | – | – |
| geht | KI-Uhr Mittel ms | – (– · –) | – (– · –) | – | – | – | – |
| geht | KI-Uhr p95 ms | – (– · –) | – (– · –) | – | – | – | – |
| geht | KI-Uhr p99 ms | – (– · –) | – (– · –) | – | – | – | – |
| geht | KI-Takt EWMA ms | 1.81 (1.95 · 1.67) | 1.77 (1.77 · 1.77) | -0.04 | 0.28 | -0.29 | nicht langsamer |

**KERN-URTEIL GEHEN stadt** (steht + geht × fps · Frame p95 · CPU-Takt p95 · GPU je Bild (gpu-bank, nur steht) · Belegung p95; Δ ≤ max(2σ gepoolt, Auflösung)): nicht langsamer (8 Größen)
