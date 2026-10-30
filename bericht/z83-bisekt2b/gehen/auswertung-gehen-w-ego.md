## w-ego — je Boot

| Boot | Gang | fps | Frame p50 ms | Frame p95 ms | Frame p99 ms | CPU-Takt p50 ms | CPU-Takt p95 ms | CPU-Takt p99 ms | GPU-Durchsatz p50 ms | k0 p50 ms | GPU p95 ms (lauf) | GPU je Bild ms (gpu-bank) | Belegung p50 ms | Belegung p95 ms | außer Takt p95 ms | Lebenszyklus p95 ms | über 33 ms % | KI-Uhr Mittel ms | KI-Uhr p95 ms | KI-Uhr p99 ms | KI-Takt EWMA ms |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| w-ego-A1 | steht | 74.9 | 16.6 | 16.8 | 17.0 | 3.50 | 4.6 | 5.1 | 13.60 | 0.24 | 1.98 | 14.01 | 5.22 | 6.61 | 0.81 | 0.08 | – | – | – | – | 0.50 |
| w-ego-A1 | geht-1 | 60.1 | 16.7 | 25.1 | 33.3 | 10.90 | 18.2 | 26.0 | 16.10 | 0.30 | 2.35 | – | 15.65 | 21.84 | 1.58 | 0.09 | – | – | – | – | 0.65 |
| w-ego-A1 | Geher-Ende |  | | | | | | | | | | | | | | | | | | | |
| w-ego-A2 | steht | 74.4 | 16.6 | 16.8 | 17.0 | 3.50 | 4.6 | 5.4 | 13.80 | 0.24 | 2.03 | 12.91 | 5.24 | 6.63 | 0.81 | 0.08 | – | – | – | – | 0.49 |
| w-ego-A2 | geht-1 | 59.0 | 16.7 | 25.0 | 33.4 | 11.80 | 19.6 | 27.7 | 16.60 | 0.30 | 2.58 | – | 16.24 | 22.48 | 1.34 | 0.10 | – | – | – | – | 0.63 |
| w-ego-A2 | Geher-Ende |  | | | | | | | | | | | | | | | | | | | |
| w-ego-B1 | steht | 71.7 | 16.6 | 16.8 | 17.0 | 4.00 | 5.2 | 6.4 | 14.10 | 0.24 | 2.02 | 13.28 | 5.81 | 7.35 | 0.83 | 0.08 | – | – | – | – | 0.65 |
| w-ego-B1 | geht-1 | 55.8 | 16.7 | 25.1 | 33.4 | 12.70 | 20.7 | 31.1 | 17.30 | 0.30 | 2.71 | – | 17.04 | 23.32 | 1.50 | 0.09 | – | – | – | – | 0.61 |
| w-ego-B1 | Geher-Ende |  | | | | | | | | | | | | | | | | | | | |
| w-ego-B2 | steht | 71.6 | 16.6 | 16.8 | 17.0 | 3.90 | 5.1 | 6.1 | 14.20 | 0.24 | 2.01 | 13.31 | 5.80 | 7.28 | 0.85 | 0.08 | – | – | – | – | 0.62 |
| w-ego-B2 | geht-1 | 57.9 | 16.7 | 25.1 | 33.4 | 11.70 | 19.3 | 26.5 | 16.80 | 0.30 | 2.76 | – | 16.39 | 22.70 | 1.77 | 0.09 | – | – | – | – | 0.60 |
| w-ego-B2 | Geher-Ende |  | | | | | | | | | | | | | | | | | | | |

## Tier-Zensus je Boot (zensus-0 nach umstellen · zensus-1 nach geht-1)

- w-ego-A1: vorher 6 (fox 1, deer 5; Würfe≥2 1: deer 5 Spanne 3.2 m @170.8 m; Verband-Feld true, Verbände≥2 1: deer 5 Spanne 3.2 m; Zustand {"-":6})
  nachher 9 (fox 1, deer 5, wolf 3; Würfe≥2 2: deer 5 Spanne 2.7 m @170.1 m | wolf 3 Spanne 2.5 m @135.4 m; Verband-Feld true, Verbände≥2 2: deer 5 Spanne 2.7 m | wolf 3 Spanne 2.5 m; Zustand {"-":9})
- w-ego-A2: vorher 6 (fox 1, deer 5; Würfe≥2 1: deer 5 Spanne 3.2 m @170.8 m; Verband-Feld true, Verbände≥2 1: deer 5 Spanne 3.2 m; Zustand {"-":6})
  nachher 9 (fox 1, deer 5, wolf 3; Würfe≥2 2: deer 5 Spanne 2.7 m @170.1 m | wolf 3 Spanne 2.5 m @134.4 m; Verband-Feld true, Verbände≥2 2: deer 5 Spanne 2.7 m | wolf 3 Spanne 2.5 m; Zustand {"-":9})
- w-ego-B1: vorher 9 (deer 4, bear 1, wolf 4; Würfe≥2 2: deer 4 Spanne 2.2 m @228.3 m | wolf 4 Spanne 16.2 m @144 m; Verband-Feld true, Verbände≥2 2: deer 4 Spanne 2.2 m | wolf 4 Spanne 16.2 m; Zustand {"flucht":4,"-":5})
  nachher 4 (bear 2, wolf 2; Würfe≥2 1: wolf 2 Spanne 1 m @129.5 m; Verband-Feld true, Verbände≥2 1: wolf 2 Spanne 1 m; Zustand {"-":4})
- w-ego-B2: vorher 9 (deer 4, bear 1, wolf 4; Würfe≥2 2: deer 4 Spanne 2.1 m @230.5 m | wolf 4 Spanne 16.3 m @144 m; Verband-Feld true, Verbände≥2 2: deer 4 Spanne 2.1 m | wolf 4 Spanne 16.3 m; Zustand {"flucht":4,"-":5})
  nachher 4 (bear 2, wolf 2; Würfe≥2 1: wolf 2 Spanne 2.1 m @143.5 m; Verband-Feld true, Verbände≥2 1: wolf 2 Spanne 2.1 m; Zustand {"-":3,"fressen":1})

## GPU-Takt je Boot (nvidia-smi 1 s, nur P0-Sekunden: Median-MHz · Anteil Drossel (Grund ≠ 0 ohne GpuIdle 0x1) · max °C)

- w-ego-A1: 139 s · 1733 MHz · Drossel 29 % · 84 °C
- w-ego-A2: 152 s · 1721 MHz · Drossel 29 % · 86 °C
- w-ego-B1: 140 s · 1721 MHz · Drossel 25 % · 86 °C
- w-ego-B2: 144 s · 1721 MHz · Drossel 25 % · 86 °C

## Mittel je Seite (A 73bdf938 · B 24a0f3ef; gehend = geht-1 je Boot)

| Gang | Größe | A | B | Δ B − A | 2σ | t (Welch) | Urteil |
|---|---|---|---|---|---|---|---|
| steht | fps | 74.7 (74.9 · 74.4) | 71.7 (71.7 · 71.6) | -3.0 | 0.5 | -11.77 | LANGSAMER |
| steht | Frame p50 ms | 16.6 (16.6 · 16.6) | 16.6 (16.6 · 16.6) | 0.0 | 0.0 | – | nicht langsamer |
| steht | Frame p95 ms | 16.8 (16.8 · 16.8) | 16.8 (16.8 · 16.8) | 0.0 | 0.0 | – | nicht langsamer |
| steht | Frame p99 ms | 17.0 (17.0 · 17.0) | 17.0 (17.0 · 17.0) | 0.0 | 0.0 | – | nicht langsamer |
| steht | CPU-Takt p50 ms | 3.50 (3.50 · 3.50) | 3.95 (4.00 · 3.90) | +0.45 | 0.10 | 9.00 | LANGSAMER |
| steht | CPU-Takt p95 ms | 4.6 (4.6 · 4.6) | 5.2 (5.2 · 5.1) | +0.6 | 0.1 | 11.00 | LANGSAMER |
| steht | CPU-Takt p99 ms | 5.3 (5.1 · 5.4) | 6.3 (6.4 · 6.1) | +1.0 | 0.4 | 4.71 | LANGSAMER |
| steht | GPU-Durchsatz p50 ms | 13.70 (13.60 · 13.80) | 14.15 (14.10 · 14.20) | +0.45 | 0.22 | 4.02 | LANGSAMER |
| steht | k0 p50 ms | 0.24 (0.24 · 0.24) | 0.24 (0.24 · 0.24) | 0.00 | 0.00 | – | nicht langsamer |
| steht | GPU p95 ms (lauf) | 2.00 (1.98 · 2.03) | 2.01 (2.02 · 2.01) | +0.01 | 0.05 | 0.39 | nicht langsamer |
| steht | GPU je Bild ms (gpu-bank) | 13.46 (14.01 · 12.91) | 13.29 (13.28 · 13.31) | -0.17 | 1.10 | -0.30 | nicht langsamer |
| steht | Belegung p50 ms | 5.23 (5.22 · 5.24) | 5.80 (5.81 · 5.80) | +0.57 | 0.02 | 51.43 | LANGSAMER |
| steht | Belegung p95 ms | 6.62 (6.61 · 6.63) | 7.31 (7.35 · 7.28) | +0.69 | 0.07 | 19.09 | LANGSAMER |
| steht | außer Takt p95 ms | 0.81 (0.81 · 0.81) | 0.84 (0.83 · 0.85) | +0.03 | 0.02 | 3.00 | LANGSAMER |
| steht | Lebenszyklus p95 ms | 0.08 (0.08 · 0.08) | 0.08 (0.08 · 0.08) | 0.00 | 0.00 | – | nicht langsamer |
| steht | über 33 ms % | – (– · –) | – (– · –) | – | – | – | – |
| steht | KI-Uhr Mittel ms | – (– · –) | – (– · –) | – | – | – | – |
| steht | KI-Uhr p95 ms | – (– · –) | – (– · –) | – | – | – | – |
| steht | KI-Uhr p99 ms | – (– · –) | – (– · –) | – | – | – | – |
| steht | KI-Takt EWMA ms | 0.49 (0.50 · 0.49) | 0.64 (0.65 · 0.62) | +0.14 | 0.03 | 8.85 | LANGSAMER |
| geht | fps | 59.5 (60.1 · 59.0) | 56.8 (55.8 · 57.9) | -2.7 | 2.4 | -2.28 | LANGSAMER |
| geht | Frame p50 ms | 16.7 (16.7 · 16.7) | 16.7 (16.7 · 16.7) | 0.0 | 0.0 | – | nicht langsamer |
| geht | Frame p95 ms | 25.1 (25.1 · 25.0) | 25.1 (25.1 · 25.1) | +0.1 | 0.1 | 1.00 | nicht langsamer |
| geht | Frame p99 ms | 33.3 (33.3 · 33.4) | 33.4 (33.4 · 33.4) | +0.1 | 0.1 | 1.00 | nicht langsamer |
| geht | CPU-Takt p50 ms | 11.35 (10.90 · 11.80) | 12.20 (12.70 · 11.70) | +0.85 | 1.35 | 1.26 | nicht langsamer |
| geht | CPU-Takt p95 ms | 18.9 (18.2 · 19.6) | 20.0 (20.7 · 19.3) | +1.1 | 2.0 | 1.11 | nicht langsamer |
| geht | CPU-Takt p99 ms | 26.9 (26.0 · 27.7) | 28.8 (31.1 · 26.5) | +1.9 | 4.9 | 0.80 | nicht langsamer |
| geht | GPU-Durchsatz p50 ms | 16.35 (16.10 · 16.60) | 17.05 (17.30 · 16.80) | +0.70 | 0.71 | 1.98 | nicht langsamer |
| geht | k0 p50 ms | 0.30 (0.30 · 0.30) | 0.30 (0.30 · 0.30) | 0.00 | 0.00 | – | nicht langsamer |
| geht | GPU p95 ms (lauf) | 2.46 (2.35 · 2.58) | 2.73 (2.71 · 2.76) | +0.27 | 0.24 | 2.29 | LANGSAMER |
| geht | GPU je Bild ms (gpu-bank) | – (– · –) | – (– · –) | – | – | – | – |
| geht | Belegung p50 ms | 15.95 (15.65 · 16.24) | 16.71 (17.04 · 16.39) | +0.77 | 0.88 | 1.75 | nicht langsamer |
| geht | Belegung p95 ms | 22.16 (21.84 · 22.48) | 23.01 (23.32 · 22.70) | +0.85 | 0.89 | 1.91 | nicht langsamer |
| geht | außer Takt p95 ms | 1.46 (1.58 · 1.34) | 1.64 (1.50 · 1.77) | +0.18 | 0.36 | 0.97 | nicht langsamer |
| geht | Lebenszyklus p95 ms | 0.10 (0.09 · 0.10) | 0.09 (0.09 · 0.09) | -0.01 | 0.01 | -1.00 | nicht langsamer |
| geht | über 33 ms % | – (– · –) | – (– · –) | – | – | – | – |
| geht | KI-Uhr Mittel ms | – (– · –) | – (– · –) | – | – | – | – |
| geht | KI-Uhr p95 ms | – (– · –) | – (– · –) | – | – | – | – |
| geht | KI-Uhr p99 ms | – (– · –) | – (– · –) | – | – | – | – |
| geht | KI-Takt EWMA ms | 0.64 (0.65 · 0.63) | 0.60 (0.61 · 0.60) | -0.04 | 0.02 | -3.13 | nicht langsamer |

**KERN-URTEIL GEHEN w-ego** (steht + geht × fps · Frame p95 · CPU-Takt p95 · GPU je Bild (gpu-bank, nur steht) · Belegung p95; Δ ≤ max(2σ gepoolt, Auflösung)): LANGSAMER an steht fps, steht CPU-Takt p95 ms, steht Belegung p95 ms, geht fps (9 Größen)
