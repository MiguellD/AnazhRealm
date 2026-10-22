## sturm — je Boot

| Boot | Gang | fps | Frame p50 ms | Frame p95 ms | Frame p99 ms | CPU-Takt p50 ms | CPU-Takt p95 ms | CPU-Takt p99 ms | GPU-Durchsatz p50 ms | k0 p50 ms | GPU p95 ms (lauf) | GPU je Bild ms (gpu-bank) | Belegung p50 ms | Belegung p95 ms | außer Takt p95 ms | Lebenszyklus p95 ms | über 33 ms % | KI-Uhr Mittel ms | KI-Uhr p95 ms | KI-Uhr p99 ms | KI-Takt EWMA ms |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| sturm-A1 | steht | 77.6 | 16.5 | 16.8 | 17.3 | 3.30 | 4.5 | 5.8 | 12.90 | 0.63 | 2.75 | – | 4.62 | 6.36 | 0.77 | 0.08 | – | – | – | – | 0.34 |
| sturm-A1 | geht-1 | 44.9 | 24.9 | 33.4 | 50.0 | 20.00 | 29.7 | 40.9 | 20.80 | 0.31 | 2.44 | – | 20.76 | 31.75 | 1.43 | 0.09 | – | – | – | – | 3.51 |
| sturm-A1 | Geher-Ende |  | | | | | | | | | | | | | | | | | | | |
| sturm-A2 | steht | 76.0 | 16.6 | 16.8 | 17.1 | 3.50 | 4.7 | 5.7 | 13.30 | 0.26 | 2.82 | – | 5.03 | 6.68 | 0.77 | 0.08 | – | – | – | – | 0.57 |
| sturm-A2 | geht-1 | 44.4 | 24.9 | 33.4 | 50.0 | 20.20 | 30.8 | 45.9 | 21.00 | 0.32 | 2.42 | – | 20.90 | 32.65 | 1.54 | 0.09 | – | – | – | – | 4.13 |
| sturm-A2 | Geher-Ende |  | | | | | | | | | | | | | | | | | | | |
| sturm-B1 | steht | 75.7 | 16.6 | 16.8 | 17.0 | 3.60 | 4.8 | 5.5 | 13.30 | 0.26 | 2.86 | – | 5.16 | 6.81 | 0.76 | 0.08 | – | – | – | – | 0.54 |
| sturm-B1 | geht-1 | 48.2 | 16.7 | 33.3 | 50.0 | 18.40 | 27.7 | 38.3 | 19.30 | 0.28 | 2.52 | – | 19.20 | 29.94 | 1.61 | 0.09 | – | – | – | – | 3.70 |
| sturm-B1 | Geher-Ende |  | | | | | | | | | | | | | | | | | | | |
| sturm-B2 | steht | 77.1 | 16.6 | 16.8 | 17.1 | 3.40 | 4.5 | 5.2 | 13.00 | 0.27 | 2.75 | – | 4.73 | 6.33 | 0.75 | 0.08 | – | – | – | – | 0.34 |
| sturm-B2 | geht-1 | 47.5 | 16.7 | 33.4 | 50.0 | 18.40 | 29.8 | 42.9 | 19.30 | 0.29 | 2.46 | – | 19.23 | 31.84 | 2.27 | 0.10 | – | – | – | – | 3.52 |
| sturm-B2 | Geher-Ende |  | | | | | | | | | | | | | | | | | | | |

## Tier-Zensus je Boot (zensus-0 nach umstellen · zensus-1 nach geht-1)

- sturm-A1: vorher 10 (fox 4, deer 4, bear 2; Würfe≥2 1: deer 4 Spanne 2.7 m @149.6 m; Verband-Feld true, Verbände≥2 1: deer 4 Spanne 2.7 m; Zustand {"-":10})
  nachher 60 (fox 18, deer 13, bear 15, wolf 14; Würfe≥2 1: deer 4 Spanne 2.7 m @150.3 m; Verband-Feld true, Verbände≥2 1: deer 4 Spanne 2.7 m; Zustand {"-":59,"flucht":1})
- sturm-A2: vorher 11 (fox 3, deer 4, bear 1, wolf 3; Würfe≥2 2: deer 4 Spanne 2.7 m @149.5 m | wolf 3 Spanne 1.4 m @158.5 m; Verband-Feld true, Verbände≥2 2: deer 4 Spanne 2.7 m | wolf 3 Spanne 1.4 m; Zustand {"-":11})
  nachher 60 (fox 15, deer 14, bear 16, wolf 15; Würfe≥2 2: deer 4 Spanne 2.9 m @151 m | wolf 3 Spanne 1.6 m @155.2 m; Verband-Feld true, Verbände≥2 2: deer 4 Spanne 2.9 m | wolf 3 Spanne 1.6 m; Zustand {"fressen":1,"-":59})
- sturm-B1: vorher 11 (fox 3, deer 4, bear 1, wolf 3; Würfe≥2 2: deer 4 Spanne 2.5 m @149.6 m | wolf 3 Spanne 1.3 m @158.8 m; Verband-Feld true, Verbände≥2 2: deer 4 Spanne 2.5 m | wolf 3 Spanne 1.3 m; Zustand {"-":11})
  nachher 60 (fox 15, deer 14, bear 16, wolf 15; Würfe≥2 2: deer 4 Spanne 2.9 m @151 m | wolf 3 Spanne 1.6 m @154.9 m; Verband-Feld true, Verbände≥2 2: deer 4 Spanne 2.9 m | wolf 3 Spanne 1.6 m; Zustand {"fressen":1,"-":59})
- sturm-B2: vorher 10 (fox 4, deer 4, bear 2; Würfe≥2 1: deer 4 Spanne 2.7 m @149.6 m; Verband-Feld true, Verbände≥2 1: deer 4 Spanne 2.7 m; Zustand {"-":10})
  nachher 60 (fox 18, deer 13, bear 15, wolf 14; Würfe≥2 1: deer 4 Spanne 2.9 m @151 m; Verband-Feld true, Verbände≥2 1: deer 4 Spanne 2.9 m; Zustand {"-":59,"flucht":1})

## GPU-Takt je Boot (nvidia-smi 1 s, nur P0-Sekunden: Median-MHz · Anteil Drossel (Grund ≠ 0 ohne GpuIdle 0x1) · max °C)

- sturm-A1: 140 s · 1721 MHz · Drossel 27 % · 86 °C
- sturm-A2: 138 s · 1721 MHz · Drossel 26 % · 86 °C
- sturm-B1: 142 s · 1721 MHz · Drossel 24 % · 86 °C
- sturm-B2: 138 s · 1721 MHz · Drossel 24 % · 86 °C

## Mittel je Seite (A 73f28224 main · B 1ef4042c zug; gehend = geht-1 je Boot)

| Gang | Größe | A | B | Δ B − A | 2σ | t (Welch) | Urteil |
|---|---|---|---|---|---|---|---|
| steht | fps | 76.8 (77.6 · 76.0) | 76.4 (75.7 · 77.1) | -0.4 | 2.1 | -0.38 | nicht langsamer |
| steht | Frame p50 ms | 16.6 (16.5 · 16.6) | 16.6 (16.6 · 16.6) | +0.1 | 0.1 | 1.00 | nicht langsamer |
| steht | Frame p95 ms | 16.8 (16.8 · 16.8) | 16.8 (16.8 · 16.8) | 0.0 | 0.0 | – | nicht langsamer |
| steht | Frame p99 ms | 17.2 (17.3 · 17.1) | 17.1 (17.0 · 17.1) | -0.2 | 0.2 | -1.34 | nicht langsamer |
| steht | CPU-Takt p50 ms | 3.40 (3.30 · 3.50) | 3.50 (3.60 · 3.40) | +0.10 | 0.28 | 0.71 | nicht langsamer |
| steht | CPU-Takt p95 ms | 4.6 (4.5 · 4.7) | 4.7 (4.8 · 4.5) | +0.1 | 0.4 | 0.28 | nicht langsamer |
| steht | CPU-Takt p99 ms | 5.8 (5.8 · 5.7) | 5.3 (5.5 · 5.2) | -0.4 | 0.3 | -2.53 | nicht langsamer |
| steht | GPU-Durchsatz p50 ms | 13.10 (12.90 · 13.30) | 13.15 (13.30 · 13.00) | +0.05 | 0.50 | 0.20 | nicht langsamer |
| steht | k0 p50 ms | 0.45 (0.63 · 0.26) | 0.27 (0.26 · 0.27) | -0.18 | 0.37 | -0.97 | nicht langsamer |
| steht | GPU p95 ms (lauf) | 2.79 (2.75 · 2.82) | 2.80 (2.86 · 2.75) | +0.02 | 0.13 | 0.31 | nicht langsamer |
| steht | GPU je Bild ms (gpu-bank) | – (– · –) | – (– · –) | – | – | – | – |
| steht | Belegung p50 ms | 4.83 (4.62 · 5.03) | 4.95 (5.16 · 4.73) | +0.12 | 0.59 | 0.40 | nicht langsamer |
| steht | Belegung p95 ms | 6.52 (6.36 · 6.68) | 6.57 (6.81 · 6.33) | +0.05 | 0.58 | 0.17 | nicht langsamer |
| steht | außer Takt p95 ms | 0.77 (0.77 · 0.77) | 0.76 (0.76 · 0.75) | -0.02 | 0.01 | -3.00 | nicht langsamer |
| steht | Lebenszyklus p95 ms | 0.08 (0.08 · 0.08) | 0.08 (0.08 · 0.08) | 0.00 | 0.00 | – | nicht langsamer |
| steht | über 33 ms % | – (– · –) | – (– · –) | – | – | – | – |
| steht | KI-Uhr Mittel ms | – (– · –) | – (– · –) | – | – | – | – |
| steht | KI-Uhr p95 ms | – (– · –) | – (– · –) | – | – | – | – |
| steht | KI-Uhr p99 ms | – (– · –) | – (– · –) | – | – | – | – |
| steht | KI-Takt EWMA ms | 0.45 (0.34 · 0.57) | 0.44 (0.54 · 0.34) | -0.01 | 0.30 | -0.10 | nicht langsamer |
| geht | fps | 44.6 (44.9 · 44.4) | 47.9 (48.2 · 47.5) | +3.2 | 0.9 | 7.44 | nicht langsamer |
| geht | Frame p50 ms | 24.9 (24.9 · 24.9) | 16.7 (16.7 · 16.7) | -8.2 | 0.0 | – | nicht langsamer |
| geht | Frame p95 ms | 33.4 (33.4 · 33.4) | 33.3 (33.3 · 33.4) | -0.1 | 0.1 | -1.00 | nicht langsamer |
| geht | Frame p99 ms | 50.0 (50.0 · 50.0) | 50.0 (50.0 · 50.0) | 0.0 | 0.0 | – | nicht langsamer |
| geht | CPU-Takt p50 ms | 20.10 (20.00 · 20.20) | 18.40 (18.40 · 18.40) | -1.70 | 0.20 | -17.00 | nicht langsamer |
| geht | CPU-Takt p95 ms | 30.3 (29.7 · 30.8) | 28.8 (27.7 · 29.8) | -1.5 | 2.4 | -1.27 | nicht langsamer |
| geht | CPU-Takt p99 ms | 43.4 (40.9 · 45.9) | 40.6 (38.3 · 42.9) | -2.8 | 6.8 | -0.82 | nicht langsamer |
| geht | GPU-Durchsatz p50 ms | 20.90 (20.80 · 21.00) | 19.30 (19.30 · 19.30) | -1.60 | 0.20 | -16.00 | nicht langsamer |
| geht | k0 p50 ms | 0.32 (0.31 · 0.32) | 0.29 (0.28 · 0.29) | -0.03 | 0.01 | -4.24 | nicht langsamer |
| geht | GPU p95 ms (lauf) | 2.43 (2.44 · 2.42) | 2.49 (2.52 · 2.46) | +0.06 | 0.06 | 1.90 | nicht langsamer |
| geht | GPU je Bild ms (gpu-bank) | – (– · –) | – (– · –) | – | – | – | – |
| geht | Belegung p50 ms | 20.83 (20.76 · 20.90) | 19.21 (19.20 · 19.23) | -1.61 | 0.14 | -22.56 | nicht langsamer |
| geht | Belegung p95 ms | 32.20 (31.75 · 32.65) | 30.89 (29.94 · 31.84) | -1.31 | 2.10 | -1.25 | nicht langsamer |
| geht | außer Takt p95 ms | 1.48 (1.43 · 1.54) | 1.94 (1.61 · 2.27) | +0.46 | 0.67 | 1.36 | nicht langsamer |
| geht | Lebenszyklus p95 ms | 0.09 (0.09 · 0.09) | 0.10 (0.09 · 0.10) | +0.01 | 0.01 | 1.00 | nicht langsamer |
| geht | über 33 ms % | – (– · –) | – (– · –) | – | – | – | – |
| geht | KI-Uhr Mittel ms | – (– · –) | – (– · –) | – | – | – | – |
| geht | KI-Uhr p95 ms | – (– · –) | – (– · –) | – | – | – | – |
| geht | KI-Uhr p99 ms | – (– · –) | – (– · –) | – | – | – | – |
| geht | KI-Takt EWMA ms | 3.82 (3.51 · 4.13) | 3.61 (3.70 · 3.52) | -0.21 | 0.65 | -0.65 | nicht langsamer |

**KERN-URTEIL GEHEN sturm** (steht + geht × fps · Frame p95 · CPU-Takt p95 · GPU je Bild (gpu-bank, nur steht) · Belegung p95; Δ ≤ max(2σ gepoolt, Auflösung)): nicht langsamer (8 Größen)
