## w-ego — je Boot

| Boot | Gang | fps | Frame p50 ms | Frame p95 ms | Frame p99 ms | CPU-Takt p50 ms | CPU-Takt p95 ms | CPU-Takt p99 ms | GPU-Durchsatz p50 ms | k0 p50 ms | GPU p95 ms (lauf) | GPU je Bild ms (gpu-bank) | Belegung p50 ms | Belegung p95 ms | außer Takt p95 ms | Lebenszyklus p95 ms | über 33 ms % | KI-Uhr Mittel ms | KI-Uhr p95 ms | KI-Uhr p99 ms | KI-Takt EWMA ms |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| w-ego-A1 | steht | 73.9 | 16.6 | 16.8 | 17.0 | 3.50 | 4.6 | 5.7 | 13.80 | 0.24 | 2.00 | 13.03 | 5.28 | 6.65 | 0.81 | 0.08 | – | – | – | – | 0.55 |
| w-ego-A1 | geht-1 | 57.8 | 16.7 | 25.1 | 33.3 | 11.30 | 19.1 | 27.8 | 16.70 | 0.30 | 2.76 | – | 16.04 | 22.65 | 1.77 | 0.09 | – | – | – | – | 0.69 |
| w-ego-A1 | Geher-Ende |  | | | | | | | | | | | | | | | | | | | |
| w-ego-A2 | steht | 72.4 | 16.6 | 16.8 | 17.0 | 3.60 | 4.8 | 5.4 | 13.90 | 0.24 | 2.03 | 13.43 | 5.31 | 6.79 | 0.81 | 0.08 | – | – | – | – | 0.52 |
| w-ego-A2 | geht-1 | 58.0 | 16.7 | 25.1 | 33.4 | 11.30 | 19.1 | 29.0 | 16.80 | 0.30 | 2.59 | – | 16.13 | 22.56 | 1.67 | 0.09 | – | – | – | – | 0.67 |
| w-ego-A2 | Geher-Ende |  | | | | | | | | | | | | | | | | | | | |
| w-ego-B1 | steht | 71.5 | 16.6 | 16.8 | 17.1 | 4.00 | 5.4 | 6.4 | 14.20 | 0.24 | 2.03 | 13.50 | 5.87 | 7.41 | 0.83 | 0.08 | – | – | – | – | 0.66 |
| w-ego-B1 | geht-1 | 56.7 | 16.7 | 25.1 | 33.4 | 12.00 | 19.8 | 28.8 | 17.00 | 0.29 | 2.77 | – | 16.47 | 23.24 | 1.84 | 0.09 | – | – | – | – | 0.49 |
| w-ego-B1 | Geher-Ende |  | | | | | | | | | | | | | | | | | | | |
| w-ego-B2 | steht | 71.7 | 16.6 | 16.8 | 17.0 | 4.00 | 5.4 | 6.5 | 14.20 | 0.24 | 2.03 | 13.27 | 5.92 | 7.48 | 0.82 | 0.08 | – | – | – | – | 0.67 |
| w-ego-B2 | geht-1 | 57.2 | 16.7 | 25.1 | 33.4 | 11.80 | 19.8 | 26.5 | 17.00 | 0.30 | 2.61 | – | 16.50 | 22.81 | 1.67 | 0.09 | – | – | – | – | 0.62 |
| w-ego-B2 | Geher-Ende |  | | | | | | | | | | | | | | | | | | | |

## Tier-Zensus je Boot (zensus-0 nach umstellen · zensus-1 nach geht-1)

- w-ego-A1: vorher 6 (fox 1, deer 5; Würfe≥2 1: deer 5 Spanne 3.2 m @170.8 m; Verband-Feld true, Verbände≥2 1: deer 5 Spanne 3.2 m; Zustand {"-":6})
  nachher 9 (fox 1, deer 5, wolf 3; Würfe≥2 2: deer 5 Spanne 2.7 m @170.1 m | wolf 3 Spanne 2.5 m @135 m; Verband-Feld true, Verbände≥2 2: deer 5 Spanne 2.7 m | wolf 3 Spanne 2.5 m; Zustand {"-":9})
- w-ego-A2: vorher 6 (fox 1, deer 5; Würfe≥2 1: deer 5 Spanne 3.2 m @170.8 m; Verband-Feld true, Verbände≥2 1: deer 5 Spanne 3.2 m; Zustand {"-":6})
  nachher 9 (fox 1, deer 5, wolf 3; Würfe≥2 2: deer 5 Spanne 2.7 m @170.1 m | wolf 3 Spanne 2.5 m @135.6 m; Verband-Feld true, Verbände≥2 2: deer 5 Spanne 2.7 m | wolf 3 Spanne 2.5 m; Zustand {"-":9})
- w-ego-B1: vorher 9 (deer 4, bear 1, wolf 4; Würfe≥2 2: deer 4 Spanne 2.4 m @228.7 m | wolf 4 Spanne 16.4 m @143.6 m; Verband-Feld true, Verbände≥2 2: deer 4 Spanne 2.4 m | wolf 4 Spanne 16.4 m; Zustand {"flucht":4,"-":5})
  nachher 4 (bear 2, wolf 2; Würfe≥2 1: wolf 2 Spanne 1 m @129.8 m; Verband-Feld true, Verbände≥2 1: wolf 2 Spanne 1 m; Zustand {"-":4})
- w-ego-B2: vorher 9 (deer 4, bear 1, wolf 4; Würfe≥2 2: deer 4 Spanne 2.4 m @228.7 m | wolf 4 Spanne 16.2 m @144.3 m; Verband-Feld true, Verbände≥2 2: deer 4 Spanne 2.4 m | wolf 4 Spanne 16.2 m; Zustand {"flucht":4,"-":5})
  nachher 4 (bear 2, wolf 2; Würfe≥2 1: wolf 2 Spanne 1.9 m @143.6 m; Verband-Feld true, Verbände≥2 1: wolf 2 Spanne 1.9 m; Zustand {"-":3,"fressen":1})

## GPU-Takt je Boot (nvidia-smi 1 s, nur P0-Sekunden: Median-MHz · Anteil Drossel (Grund ≠ 0 ohne GpuIdle 0x1) · max °C)

- w-ego-A1: 139 s · 1721 MHz · Drossel 35 % · 85 °C
- w-ego-A2: 141 s · 1721 MHz · Drossel 30 % · 86 °C
- w-ego-B1: 142 s · 1721 MHz · Drossel 30 % · 86 °C
- w-ego-B2: 141 s · 1721 MHz · Drossel 32 % · 86 °C

## Mittel je Seite (A 81ce4392 · B 24a0f3ef; gehend = geht-1 je Boot)

| Gang | Größe | A | B | Δ B − A | 2σ | t (Welch) | Urteil |
|---|---|---|---|---|---|---|---|
| steht | fps | 73.2 (73.9 · 72.4) | 71.6 (71.5 · 71.7) | -1.6 | 1.5 | -2.05 | LANGSAMER |
| steht | Frame p50 ms | 16.6 (16.6 · 16.6) | 16.6 (16.6 · 16.6) | 0.0 | 0.0 | – | nicht langsamer |
| steht | Frame p95 ms | 16.8 (16.8 · 16.8) | 16.8 (16.8 · 16.8) | 0.0 | 0.0 | – | nicht langsamer |
| steht | Frame p99 ms | 17.0 (17.0 · 17.0) | 17.1 (17.1 · 17.0) | +0.1 | 0.1 | 1.00 | nicht langsamer |
| steht | CPU-Takt p50 ms | 3.55 (3.50 · 3.60) | 4.00 (4.00 · 4.00) | +0.45 | 0.10 | 9.00 | LANGSAMER |
| steht | CPU-Takt p95 ms | 4.7 (4.6 · 4.8) | 5.4 (5.4 · 5.4) | +0.7 | 0.2 | 7.00 | LANGSAMER |
| steht | CPU-Takt p99 ms | 5.6 (5.7 · 5.4) | 6.5 (6.4 · 6.5) | +0.9 | 0.3 | 5.69 | LANGSAMER |
| steht | GPU-Durchsatz p50 ms | 13.85 (13.80 · 13.90) | 14.20 (14.20 · 14.20) | +0.35 | 0.10 | 7.00 | LANGSAMER |
| steht | k0 p50 ms | 0.24 (0.24 · 0.24) | 0.24 (0.24 · 0.24) | 0.00 | 0.00 | – | nicht langsamer |
| steht | GPU p95 ms (lauf) | 2.01 (2.00 · 2.03) | 2.03 (2.03 · 2.03) | +0.02 | 0.03 | 1.00 | nicht langsamer |
| steht | GPU je Bild ms (gpu-bank) | 13.23 (13.03 · 13.43) | 13.38 (13.50 · 13.27) | +0.15 | 0.46 | 0.67 | nicht langsamer |
| steht | Belegung p50 ms | 5.29 (5.28 · 5.31) | 5.89 (5.87 · 5.92) | +0.60 | 0.06 | 20.58 | LANGSAMER |
| steht | Belegung p95 ms | 6.72 (6.65 · 6.79) | 7.45 (7.41 · 7.48) | +0.72 | 0.16 | 9.26 | LANGSAMER |
| steht | außer Takt p95 ms | 0.81 (0.81 · 0.81) | 0.82 (0.83 · 0.82) | +0.01 | 0.01 | 3.00 | LANGSAMER |
| steht | Lebenszyklus p95 ms | 0.08 (0.08 · 0.08) | 0.08 (0.08 · 0.08) | 0.00 | 0.00 | – | nicht langsamer |
| steht | über 33 ms % | – (– · –) | – (– · –) | – | – | – | – |
| steht | KI-Uhr Mittel ms | – (– · –) | – (– · –) | – | – | – | – |
| steht | KI-Uhr p95 ms | – (– · –) | – (– · –) | – | – | – | – |
| steht | KI-Uhr p99 ms | – (– · –) | – (– · –) | – | – | – | – |
| steht | KI-Takt EWMA ms | 0.54 (0.55 · 0.52) | 0.67 (0.66 · 0.67) | +0.13 | 0.03 | 8.22 | LANGSAMER |
| geht | fps | 57.9 (57.8 · 58.0) | 57.0 (56.7 · 57.2) | -0.9 | 0.5 | -3.53 | LANGSAMER |
| geht | Frame p50 ms | 16.7 (16.7 · 16.7) | 16.7 (16.7 · 16.7) | 0.0 | 0.0 | – | nicht langsamer |
| geht | Frame p95 ms | 25.1 (25.1 · 25.1) | 25.1 (25.1 · 25.1) | 0.0 | 0.0 | – | nicht langsamer |
| geht | Frame p99 ms | 33.3 (33.3 · 33.4) | 33.4 (33.4 · 33.4) | +0.1 | 0.1 | 1.00 | nicht langsamer |
| geht | CPU-Takt p50 ms | 11.30 (11.30 · 11.30) | 11.90 (12.00 · 11.80) | +0.60 | 0.20 | 6.00 | LANGSAMER |
| geht | CPU-Takt p95 ms | 19.1 (19.1 · 19.1) | 19.8 (19.8 · 19.8) | +0.7 | 0.0 | – | LANGSAMER |
| geht | CPU-Takt p99 ms | 28.4 (27.8 · 29.0) | 27.6 (28.8 · 26.5) | -0.8 | 2.6 | -0.58 | nicht langsamer |
| geht | GPU-Durchsatz p50 ms | 16.75 (16.70 · 16.80) | 17.00 (17.00 · 17.00) | +0.25 | 0.10 | 5.00 | LANGSAMER |
| geht | k0 p50 ms | 0.30 (0.30 · 0.30) | 0.29 (0.29 · 0.30) | -0.01 | 0.01 | -1.00 | nicht langsamer |
| geht | GPU p95 ms (lauf) | 2.67 (2.76 · 2.59) | 2.69 (2.77 · 2.61) | +0.02 | 0.23 | 0.13 | nicht langsamer |
| geht | GPU je Bild ms (gpu-bank) | – (– · –) | – (– · –) | – | – | – | – |
| geht | Belegung p50 ms | 16.09 (16.04 · 16.13) | 16.48 (16.47 · 16.50) | +0.40 | 0.09 | 8.43 | LANGSAMER |
| geht | Belegung p95 ms | 22.60 (22.65 · 22.56) | 23.02 (23.24 · 22.81) | +0.42 | 0.44 | 1.91 | nicht langsamer |
| geht | außer Takt p95 ms | 1.72 (1.77 · 1.67) | 1.75 (1.84 · 1.67) | +0.03 | 0.20 | 0.35 | nicht langsamer |
| geht | Lebenszyklus p95 ms | 0.09 (0.09 · 0.09) | 0.09 (0.09 · 0.09) | 0.00 | 0.00 | – | nicht langsamer |
| geht | über 33 ms % | – (– · –) | – (– · –) | – | – | – | – |
| geht | KI-Uhr Mittel ms | – (– · –) | – (– · –) | – | – | – | – |
| geht | KI-Uhr p95 ms | – (– · –) | – (– · –) | – | – | – | – |
| geht | KI-Uhr p99 ms | – (– · –) | – (– · –) | – | – | – | – |
| geht | KI-Takt EWMA ms | 0.68 (0.69 · 0.67) | 0.55 (0.49 · 0.62) | -0.13 | 0.13 | -1.90 | nicht langsamer |

**KERN-URTEIL GEHEN w-ego** (steht + geht × fps · Frame p95 · CPU-Takt p95 · GPU je Bild (gpu-bank, nur steht) · Belegung p95; Δ ≤ max(2σ gepoolt, Auflösung)): LANGSAMER an steht fps, steht CPU-Takt p95 ms, steht Belegung p95 ms, geht fps, geht CPU-Takt p95 ms (9 Größen)
