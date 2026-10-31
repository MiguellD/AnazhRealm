## stadt — je Boot

| Boot | Gang | fps | Frame p50 ms | Frame p95 ms | Frame p99 ms | CPU-Takt p50 ms | CPU-Takt p95 ms | CPU-Takt p99 ms | GPU-Durchsatz p50 ms | k0 p50 ms | GPU p95 ms (lauf) | GPU je Bild ms (gpu-bank) | Belegung p50 ms | Belegung p95 ms | außer Takt p95 ms | Lebenszyklus p95 ms | über 33 ms % | KI-Uhr Mittel ms | KI-Uhr p95 ms | KI-Uhr p99 ms | KI-Takt EWMA ms |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| stadt-A1 | steht | 62.4 | 16.6 | 25.0 | 25.1 | 10.40 | 17.8 | 21.8 | 15.50 | 0.23 | 2.20 | – | 14.62 | 21.20 | 1.41 | 0.11 | – | – | – | – | 4.06 |
| stadt-A1 | geht-1 | 20.7 | 41.7 | 83.5 | 191.5 | 39.30 | 83.9 | 179.3 | 40.90 | 0.11 | 2.55 | – | 41.26 | 91.40 | 14.13 | 0.23 | – | – | – | – | 10.00 |
| stadt-A1 | Geher-Ende |  | | | | | | | | | | | | | | | | | | | |
| stadt-A2 | steht | 66.9 | 16.6 | 25.0 | 25.1 | 8.60 | 11.2 | 15.2 | 14.90 | 0.24 | 2.22 | – | 12.71 | 18.58 | 1.70 | 0.10 | – | – | – | – | 3.24 |
| stadt-A2 | geht-1 | 31.8 | 25.0 | 58.3 | 125.0 | 25.20 | 53.7 | 118.9 | 26.15 | 0.10 | 2.43 | – | 26.24 | 56.73 | 4.88 | 0.14 | – | – | – | – | 5.16 |
| stadt-A2 | Geher-Ende |  | | | | | | | | | | | | | | | | | | | |
| stadt-B1 | steht | 66.9 | 16.6 | 25.0 | 25.1 | 8.50 | 11.5 | 14.5 | 14.90 | 0.24 | 2.26 | – | 12.50 | 18.18 | 1.41 | 0.10 | – | – | – | – | 3.64 |
| stadt-B1 | geht-1 | 29.8 | 25.2 | 66.7 | 125.0 | 27.30 | 57.1 | 120.4 | 28.20 | 0.11 | 2.65 | – | 28.55 | 65.91 | 5.47 | 0.13 | – | – | – | – | 5.08 |
| stadt-B1 | Geher-Ende |  | | | | | | | | | | | | | | | | | | | |
| stadt-B2 | steht | 64.5 | 16.6 | 25.1 | 25.1 | 10.60 | 13.0 | 17.2 | 15.40 | 0.24 | 2.25 | – | 14.87 | 20.58 | 1.27 | 0.10 | – | – | – | – | 3.36 |
| stadt-B2 | geht-1 | 24.6 | 33.4 | 75.0 | 141.7 | 33.80 | 61.9 | 140.8 | 35.00 | 0.11 | 2.62 | – | 35.30 | 70.86 | 7.66 | 0.18 | – | – | – | – | 8.23 |
| stadt-B2 | Geher-Ende |  | | | | | | | | | | | | | | | | | | | |

## Tier-Zensus je Boot (zensus-0 nach umstellen · zensus-1 nach geht-1)

- stadt-A1: vorher 7 (deer 3, wolf 4; Würfe≥2 2: deer 3 Spanne 2.2 m @258 m | wolf 4 Spanne 1.4 m @468.4 m; Verband-Feld true, Verbände≥2 2: deer 3 Spanne 2.2 m | wolf 4 Spanne 1.4 m; Zustand {"flucht":3,"fressen":3,"-":1})
  nachher 9 (wolf 4, deer 5; Würfe≥2 2: wolf 4 Spanne 1.8 m @466.8 m | deer 5 Spanne 3.7 m @399.8 m; Verband-Feld true, Verbände≥2 2: wolf 4 Spanne 1.8 m | deer 5 Spanne 3.7 m; Zustand {"-":9})
- stadt-A2: vorher 7 (deer 3, wolf 4; Würfe≥2 2: deer 3 Spanne 1.9 m @266.4 m | wolf 4 Spanne 1.2 m @468.6 m; Verband-Feld true, Verbände≥2 2: deer 3 Spanne 1.9 m | wolf 4 Spanne 1.2 m; Zustand {"flucht":3,"-":1,"fressen":3})
  nachher 9 (wolf 4, deer 5; Würfe≥2 2: wolf 4 Spanne 2 m @468.8 m | deer 5 Spanne 3.6 m @400.6 m; Verband-Feld true, Verbände≥2 2: wolf 4 Spanne 2 m | deer 5 Spanne 3.6 m; Zustand {"-":9})
- stadt-B1: vorher 7 (deer 3, wolf 4; Würfe≥2 2: deer 3 Spanne 1.9 m @177.6 m | wolf 4 Spanne 1.6 m @467.9 m; Verband-Feld true, Verbände≥2 2: deer 3 Spanne 1.9 m | wolf 4 Spanne 1.6 m; Zustand {"flucht":3,"-":1,"fressen":3})
  nachher 9 (wolf 4, deer 5; Würfe≥2 2: wolf 4 Spanne 1.5 m @467.1 m | deer 5 Spanne 3.5 m @399.6 m; Verband-Feld true, Verbände≥2 2: wolf 4 Spanne 1.5 m | deer 5 Spanne 3.5 m; Zustand {"-":9})
- stadt-B2: vorher 6 (deer 2, wolf 4; Würfe≥2 2: deer 2 Spanne 1.5 m @155.3 m | wolf 4 Spanne 1.8 m @467.8 m; Verband-Feld true, Verbände≥2 2: deer 2 Spanne 1.5 m | wolf 4 Spanne 1.8 m; Zustand {"flucht":2,"-":2,"fressen":2})
  nachher 11 (wolf 4, deer 7; Würfe≥2 2: wolf 4 Spanne 1.7 m @467 m | deer 7 Spanne 3.4 m @417.6 m; Verband-Feld true, Verbände≥2 2: wolf 4 Spanne 1.7 m | deer 7 Spanne 3.4 m; Zustand {"-":11})

## GPU-Takt je Boot (nvidia-smi 1 s, nur P0-Sekunden: Median-MHz · Anteil Drossel (Grund ≠ 0 ohne GpuIdle 0x1) · max °C)

- stadt-A1: 170 s · 1771 MHz · Drossel 17 % · 86 °C
- stadt-A2: 173 s · 1759 MHz · Drossel 25 % · 87 °C
- stadt-B1: 183 s · 1759 MHz · Drossel 19 % · 86 °C
- stadt-B2: 187 s · 1759 MHz · Drossel 18 % · 87 °C

## Mittel je Seite (A 8075fc03 · B f1a654f1; gehend = geht-1 je Boot)

| Gang | Größe | A | B | Δ B − A | 2σ | t (Welch) | Urteil |
|---|---|---|---|---|---|---|---|
| steht | fps | 64.7 (62.4 · 66.9) | 65.7 (66.9 · 64.5) | +1.0 | 5.1 | 0.41 | nicht langsamer |
| steht | Frame p50 ms | 16.6 (16.6 · 16.6) | 16.6 (16.6 · 16.6) | 0.0 | 0.0 | – | nicht langsamer |
| steht | Frame p95 ms | 25.0 (25.0 · 25.0) | 25.1 (25.0 · 25.1) | +0.1 | 0.1 | 1.00 | nicht langsamer |
| steht | Frame p99 ms | 25.1 (25.1 · 25.1) | 25.1 (25.1 · 25.1) | 0.0 | 0.0 | – | nicht langsamer |
| steht | CPU-Takt p50 ms | 9.50 (10.40 · 8.60) | 9.55 (8.50 · 10.60) | +0.05 | 2.77 | 0.04 | nicht langsamer |
| steht | CPU-Takt p95 ms | 14.5 (17.8 · 11.2) | 12.3 (11.5 · 13.0) | -2.3 | 6.8 | -0.66 | nicht langsamer |
| steht | CPU-Takt p99 ms | 18.5 (21.8 · 15.2) | 15.8 (14.5 · 17.2) | -2.7 | 7.1 | -0.74 | nicht langsamer |
| steht | GPU-Durchsatz p50 ms | 15.20 (15.50 · 14.90) | 15.15 (14.90 · 15.40) | -0.05 | 0.78 | -0.13 | nicht langsamer |
| steht | k0 p50 ms | 0.23 (0.23 · 0.24) | 0.24 (0.24 · 0.24) | +0.01 | 0.01 | 1.00 | nicht langsamer |
| steht | GPU p95 ms (lauf) | 2.21 (2.20 · 2.22) | 2.25 (2.26 · 2.25) | +0.04 | 0.02 | 4.02 | LANGSAMER |
| steht | GPU je Bild ms (gpu-bank) | – (– · –) | – (– · –) | – | – | – | – |
| steht | Belegung p50 ms | 13.66 (14.62 · 12.71) | 13.68 (12.50 · 14.87) | +0.02 | 3.04 | 0.01 | nicht langsamer |
| steht | Belegung p95 ms | 19.89 (21.20 · 18.58) | 19.38 (18.18 · 20.58) | -0.51 | 3.55 | -0.29 | nicht langsamer |
| steht | außer Takt p95 ms | 1.55 (1.41 · 1.70) | 1.34 (1.41 · 1.27) | -0.22 | 0.32 | -1.34 | nicht langsamer |
| steht | Lebenszyklus p95 ms | 0.11 (0.11 · 0.10) | 0.10 (0.10 · 0.10) | -0.01 | 0.01 | -1.00 | nicht langsamer |
| steht | über 33 ms % | – (– · –) | – (– · –) | – | – | – | – |
| steht | KI-Uhr Mittel ms | – (– · –) | – (– · –) | – | – | – | – |
| steht | KI-Uhr p95 ms | – (– · –) | – (– · –) | – | – | – | – |
| steht | KI-Uhr p99 ms | – (– · –) | – (– · –) | – | – | – | – |
| steht | KI-Takt EWMA ms | 3.65 (4.06 · 3.24) | 3.50 (3.64 · 3.36) | -0.15 | 0.87 | -0.35 | nicht langsamer |
| geht | fps | 26.3 (20.7 · 31.8) | 27.2 (29.8 · 24.6) | +1.0 | 12.3 | 0.16 | nicht langsamer |
| geht | Frame p50 ms | 33.4 (41.7 · 25.0) | 29.3 (25.2 · 33.4) | -4.1 | 18.6 | -0.44 | nicht langsamer |
| geht | Frame p95 ms | 70.9 (83.5 · 58.3) | 70.8 (66.7 · 75.0) | -0.1 | 26.5 | -0.00 | nicht langsamer |
| geht | Frame p99 ms | 158.3 (191.5 · 125.0) | 133.3 (125.0 · 141.7) | -24.9 | 68.6 | -0.73 | nicht langsamer |
| geht | CPU-Takt p50 ms | 32.25 (39.30 · 25.20) | 30.55 (27.30 · 33.80) | -1.70 | 15.53 | -0.22 | nicht langsamer |
| geht | CPU-Takt p95 ms | 68.8 (83.9 · 53.7) | 59.5 (57.1 · 61.9) | -9.3 | 30.6 | -0.61 | nicht langsamer |
| geht | CPU-Takt p99 ms | 149.1 (179.3 · 118.9) | 130.6 (120.4 · 140.8) | -18.5 | 63.8 | -0.58 | nicht langsamer |
| geht | GPU-Durchsatz p50 ms | 33.52 (40.90 · 26.15) | 31.60 (28.20 · 35.00) | -1.92 | 16.24 | -0.24 | nicht langsamer |
| geht | k0 p50 ms | 0.11 (0.11 · 0.10) | 0.11 (0.11 · 0.11) | +0.00 | 0.01 | 1.00 | nicht langsamer |
| geht | GPU p95 ms (lauf) | 2.49 (2.55 · 2.43) | 2.63 (2.65 · 2.62) | +0.14 | 0.12 | 2.34 | LANGSAMER |
| geht | GPU je Bild ms (gpu-bank) | – (– · –) | – (– · –) | – | – | – | – |
| geht | Belegung p50 ms | 33.75 (41.26 · 26.24) | 31.92 (28.55 · 35.30) | -1.83 | 16.47 | -0.22 | nicht langsamer |
| geht | Belegung p95 ms | 74.06 (91.40 · 56.73) | 68.38 (65.91 · 70.86) | -5.68 | 35.02 | -0.32 | nicht langsamer |
| geht | außer Takt p95 ms | 9.51 (14.13 · 4.88) | 6.56 (5.47 · 7.66) | -2.94 | 9.51 | -0.62 | nicht langsamer |
| geht | Lebenszyklus p95 ms | 0.18 (0.23 · 0.14) | 0.15 (0.13 · 0.18) | -0.03 | 0.10 | -0.58 | nicht langsamer |
| geht | über 33 ms % | – (– · –) | – (– · –) | – | – | – | – |
| geht | KI-Uhr Mittel ms | – (– · –) | – (– · –) | – | – | – | – |
| geht | KI-Uhr p95 ms | – (– · –) | – (– · –) | – | – | – | – |
| geht | KI-Uhr p99 ms | – (– · –) | – (– · –) | – | – | – | – |
| geht | KI-Takt EWMA ms | 7.58 (10.00 · 5.16) | 6.66 (5.08 · 8.23) | -0.92 | 5.77 | -0.32 | nicht langsamer |

**KERN-URTEIL GEHEN stadt** (steht + geht × fps · Frame p95 · CPU-Takt p95 · GPU je Bild (gpu-bank, nur steht) · Belegung p95; Δ ≤ max(2σ gepoolt, Auflösung)): nicht langsamer (8 Größen)
