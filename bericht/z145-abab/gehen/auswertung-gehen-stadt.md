## stadt — je Boot

| Boot | Gang | fps | Frame p50 ms | Frame p95 ms | Frame p99 ms | CPU-Takt p50 ms | CPU-Takt p95 ms | CPU-Takt p99 ms | GPU-Durchsatz p50 ms | k0 p50 ms | GPU p95 ms (lauf) | GPU je Bild ms (gpu-bank) | Belegung p50 ms | Belegung p95 ms | außer Takt p95 ms | Lebenszyklus p95 ms | über 33 ms % | KI-Uhr Mittel ms | KI-Uhr p95 ms | KI-Uhr p99 ms | KI-Takt EWMA ms |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| stadt-A1 | steht | 67.1 | 16.6 | 24.9 | 25.1 | 7.60 | 11.3 | 19.4 | 14.90 | 0.25 | 2.58 | – | 11.51 | 17.61 | 1.73 | 0.21 | – | – | – | – | 2.71 |
| stadt-A1 | geht-1 | 32.1 | 25.1 | 58.3 | 83.3 | 26.20 | 50.8 | 72.4 | 27.10 | 0.11 | 2.55 | – | 27.08 | 56.88 | 3.42 | 0.22 | – | – | – | – | 3.29 |
| stadt-A1 | Geher-Ende |  | | | | | | | | | | | | | | | | | | | |
| stadt-A2 | steht | 65.9 | 16.6 | 25.0 | 25.1 | 7.90 | 11.7 | 17.7 | 15.20 | 0.25 | 2.74 | – | 11.80 | 18.19 | 1.73 | 0.21 | – | – | – | – | 2.72 |
| stadt-A2 | geht-1 | 31.9 | 25.0 | 58.4 | 91.7 | 25.50 | 52.4 | 85.1 | 26.40 | 0.11 | 2.67 | – | 26.40 | 60.58 | 3.56 | 0.23 | – | – | – | – | 3.23 |
| stadt-A2 | Geher-Ende |  | | | | | | | | | | | | | | | | | | | |
| stadt-B1 | steht | 66.0 | 16.6 | 25.0 | 25.1 | 8.10 | 11.3 | 16.3 | 15.10 | 0.24 | 2.62 | – | 12.10 | 17.96 | 1.81 | 0.21 | – | – | – | – | 2.62 |
| stadt-B1 | geht-1 | 32.7 | 25.1 | 50.1 | 75.0 | 26.00 | 46.5 | 61.9 | 27.00 | 0.11 | 2.64 | – | 27.10 | 52.14 | 2.87 | 0.24 | – | – | – | – | 3.56 |
| stadt-B1 | Geher-Ende |  | | | | | | | | | | | | | | | | | | | |
| stadt-B2 | steht | 66.4 | 16.6 | 25.0 | 25.1 | 7.80 | 10.9 | 18.6 | 15.10 | 0.24 | 2.60 | – | 11.89 | 17.14 | 1.70 | 0.21 | – | – | – | – | 2.52 |
| stadt-B2 | geht-1 | 33.8 | 25.1 | 50.0 | 66.8 | 25.90 | 43.7 | 56.9 | 26.60 | 0.11 | 2.55 | – | 26.72 | 48.47 | 3.03 | 0.24 | – | – | – | – | 4.04 |
| stadt-B2 | Geher-Ende |  | | | | | | | | | | | | | | | | | | | |

## Tier-Zensus je Boot (zensus-0 nach umstellen · zensus-1 nach geht-1)

- stadt-A1: vorher 7 (deer 3, wolf 4; Würfe≥2 2: deer 3 Spanne 2 m @148.3 m | wolf 4 Spanne 1.3 m @464.7 m; Verband-Feld true, Verbände≥2 2: deer 3 Spanne 2 m | wolf 4 Spanne 1.3 m; Zustand {"flucht":3,"fressen":3,"-":1})
  nachher 4 (wolf 4; Würfe≥2 1: wolf 4 Spanne 2 m @463.7 m; Verband-Feld true, Verbände≥2 1: wolf 4 Spanne 2 m; Zustand {"-":4})
- stadt-A2: vorher 6 (deer 2, wolf 4; Würfe≥2 2: deer 2 Spanne 1.6 m @141.7 m | wolf 4 Spanne 1.3 m @465.7 m; Verband-Feld true, Verbände≥2 2: deer 2 Spanne 1.6 m | wolf 4 Spanne 1.3 m; Zustand {"flucht":2,"-":3,"fressen":1})
  nachher 4 (wolf 4; Würfe≥2 1: wolf 4 Spanne 2.1 m @464.7 m; Verband-Feld true, Verbände≥2 1: wolf 4 Spanne 2.1 m; Zustand {"-":4})
- stadt-B1: vorher 7 (deer 3, wolf 4; Würfe≥2 2: deer 3 Spanne 1.8 m @151.4 m | wolf 4 Spanne 1.4 m @465.8 m; Verband-Feld true, Verbände≥2 2: deer 3 Spanne 1.8 m | wolf 4 Spanne 1.4 m; Zustand {"flucht":3,"fressen":3,"-":1})
  nachher 7 (wolf 4, deer 3; Würfe≥2 2: wolf 4 Spanne 1.6 m @465.8 m | deer 3 Spanne 3.9 m @221.3 m; Verband-Feld true, Verbände≥2 2: wolf 4 Spanne 1.6 m | deer 3 Spanne 3.9 m; Zustand {"-":7})
- stadt-B2: vorher 6 (deer 2, wolf 4; Würfe≥2 2: deer 2 Spanne 1.4 m @186.2 m | wolf 4 Spanne 1.7 m @466.7 m; Verband-Feld true, Verbände≥2 2: deer 2 Spanne 1.4 m | wolf 4 Spanne 1.7 m; Zustand {"flucht":2,"fressen":4})
  nachher 4 (wolf 4; Würfe≥2 1: wolf 4 Spanne 1.9 m @466.6 m; Verband-Feld true, Verbände≥2 1: wolf 4 Spanne 1.9 m; Zustand {"-":4})

## GPU-Takt je Boot (nvidia-smi 1 s, nur P0-Sekunden: Median-MHz · Anteil Drossel (Grund ≠ 0 ohne GpuIdle 0x1) · max °C)

- stadt-A1: 165 s · 1784 MHz · Drossel 17 % · 87 °C
- stadt-A2: 175 s · 1759 MHz · Drossel 19 % · 87 °C
- stadt-B1: 167 s · 1771 MHz · Drossel 16 % · 87 °C
- stadt-B2: 170 s · 1784 MHz · Drossel 17 % · 87 °C

## Mittel je Seite (A baf9d828 · B 28dd7a47; gehend = geht-1 je Boot)

| Gang | Größe | A | B | Δ B − A | 2σ | t (Welch) | Urteil |
|---|---|---|---|---|---|---|---|
| steht | fps | 66.5 (67.1 · 65.9) | 66.2 (66.0 · 66.4) | -0.3 | 1.3 | -0.47 | nicht langsamer |
| steht | Frame p50 ms | 16.6 (16.6 · 16.6) | 16.6 (16.6 · 16.6) | 0.0 | 0.0 | – | nicht langsamer |
| steht | Frame p95 ms | 24.9 (24.9 · 25.0) | 25.0 (25.0 · 25.0) | +0.1 | 0.1 | 1.00 | nicht langsamer |
| steht | Frame p99 ms | 25.1 (25.1 · 25.1) | 25.1 (25.1 · 25.1) | 0.0 | 0.0 | – | nicht langsamer |
| steht | CPU-Takt p50 ms | 7.75 (7.60 · 7.90) | 7.95 (8.10 · 7.80) | +0.20 | 0.42 | 0.94 | nicht langsamer |
| steht | CPU-Takt p95 ms | 11.5 (11.3 · 11.7) | 11.1 (11.3 · 10.9) | -0.4 | 0.6 | -1.41 | nicht langsamer |
| steht | CPU-Takt p99 ms | 18.5 (19.4 · 17.7) | 17.5 (16.3 · 18.6) | -1.1 | 2.9 | -0.77 | nicht langsamer |
| steht | GPU-Durchsatz p50 ms | 15.05 (14.90 · 15.20) | 15.10 (15.10 · 15.10) | +0.05 | 0.30 | 0.33 | nicht langsamer |
| steht | k0 p50 ms | 0.25 (0.25 · 0.25) | 0.24 (0.24 · 0.24) | -0.01 | 0.00 | – | nicht langsamer |
| steht | GPU p95 ms (lauf) | 2.66 (2.58 · 2.74) | 2.61 (2.62 · 2.60) | -0.05 | 0.16 | -0.62 | nicht langsamer |
| steht | GPU je Bild ms (gpu-bank) | – (– · –) | – (– · –) | – | – | – | – |
| steht | Belegung p50 ms | 11.66 (11.51 · 11.80) | 12.00 (12.10 · 11.89) | +0.34 | 0.36 | 1.90 | nicht langsamer |
| steht | Belegung p95 ms | 17.90 (17.61 · 18.19) | 17.55 (17.96 · 17.14) | -0.35 | 1.00 | -0.70 | nicht langsamer |
| steht | außer Takt p95 ms | 1.73 (1.73 · 1.73) | 1.75 (1.81 · 1.70) | +0.02 | 0.11 | 0.45 | nicht langsamer |
| steht | Lebenszyklus p95 ms | 0.21 (0.21 · 0.21) | 0.21 (0.21 · 0.21) | 0.00 | 0.00 | – | nicht langsamer |
| steht | über 33 ms % | – (– · –) | – (– · –) | – | – | – | – |
| steht | KI-Uhr Mittel ms | – (– · –) | – (– · –) | – | – | – | – |
| steht | KI-Uhr p95 ms | – (– · –) | – (– · –) | – | – | – | – |
| steht | KI-Uhr p99 ms | – (– · –) | – (– · –) | – | – | – | – |
| steht | KI-Takt EWMA ms | 2.71 (2.71 · 2.72) | 2.57 (2.62 · 2.52) | -0.14 | 0.10 | -2.89 | nicht langsamer |
| geht | fps | 32.0 (32.1 · 31.9) | 33.3 (32.7 · 33.8) | +1.3 | 1.1 | 2.24 | nicht langsamer |
| geht | Frame p50 ms | 25.1 (25.1 · 25.0) | 25.1 (25.1 · 25.1) | +0.1 | 0.1 | 1.00 | nicht langsamer |
| geht | Frame p95 ms | 58.3 (58.3 · 58.4) | 50.0 (50.1 · 50.0) | -8.3 | 0.1 | -117.38 | nicht langsamer |
| geht | Frame p99 ms | 87.5 (83.3 · 91.7) | 70.9 (75.0 · 66.8) | -16.6 | 11.7 | -2.83 | nicht langsamer |
| geht | CPU-Takt p50 ms | 25.85 (26.20 · 25.50) | 25.95 (26.00 · 25.90) | +0.10 | 0.71 | 0.28 | nicht langsamer |
| geht | CPU-Takt p95 ms | 51.6 (50.8 · 52.4) | 45.1 (46.5 · 43.7) | -6.5 | 3.2 | -4.03 | nicht langsamer |
| geht | CPU-Takt p99 ms | 78.8 (72.4 · 85.1) | 59.4 (61.9 · 56.9) | -19.4 | 13.6 | -2.84 | nicht langsamer |
| geht | GPU-Durchsatz p50 ms | 26.75 (27.10 · 26.40) | 26.80 (27.00 · 26.60) | +0.05 | 0.81 | 0.12 | nicht langsamer |
| geht | k0 p50 ms | 0.11 (0.11 · 0.11) | 0.11 (0.11 · 0.11) | 0.00 | 0.00 | – | nicht langsamer |
| geht | GPU p95 ms (lauf) | 2.61 (2.55 · 2.67) | 2.59 (2.64 · 2.55) | -0.02 | 0.15 | -0.20 | nicht langsamer |
| geht | GPU je Bild ms (gpu-bank) | – (– · –) | – (– · –) | – | – | – | – |
| geht | Belegung p50 ms | 26.74 (27.08 · 26.40) | 26.91 (27.10 · 26.72) | +0.17 | 0.78 | 0.44 | nicht langsamer |
| geht | Belegung p95 ms | 58.73 (56.88 · 60.58) | 50.30 (52.14 · 48.47) | -8.43 | 5.21 | -3.23 | nicht langsamer |
| geht | außer Takt p95 ms | 3.49 (3.42 · 3.56) | 2.95 (2.87 · 3.03) | -0.54 | 0.21 | -5.08 | nicht langsamer |
| geht | Lebenszyklus p95 ms | 0.23 (0.22 · 0.23) | 0.24 (0.24 · 0.24) | +0.01 | 0.01 | 3.00 | LANGSAMER |
| geht | über 33 ms % | – (– · –) | – (– · –) | – | – | – | – |
| geht | KI-Uhr Mittel ms | – (– · –) | – (– · –) | – | – | – | – |
| geht | KI-Uhr p95 ms | – (– · –) | – (– · –) | – | – | – | – |
| geht | KI-Uhr p99 ms | – (– · –) | – (– · –) | – | – | – | – |
| geht | KI-Takt EWMA ms | 3.26 (3.29 · 3.23) | 3.80 (3.56 · 4.04) | +0.54 | 0.48 | 2.23 | LANGSAMER |

**KERN-URTEIL GEHEN stadt** (steht + geht × fps · Frame p95 · CPU-Takt p95 · GPU je Bild (gpu-bank, nur steht) · Belegung p95; Δ ≤ max(2σ gepoolt, Auflösung)): nicht langsamer (8 Größen)
