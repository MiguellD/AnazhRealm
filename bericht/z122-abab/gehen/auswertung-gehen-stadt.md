## stadt — je Boot

| Boot | Gang | fps | Frame p50 ms | Frame p95 ms | Frame p99 ms | CPU-Takt p50 ms | CPU-Takt p95 ms | CPU-Takt p99 ms | GPU-Durchsatz p50 ms | k0 p50 ms | GPU p95 ms (lauf) | GPU je Bild ms (gpu-bank) | Belegung p50 ms | Belegung p95 ms | außer Takt p95 ms | Lebenszyklus p95 ms | über 33 ms % | KI-Uhr Mittel ms | KI-Uhr p95 ms | KI-Uhr p99 ms | KI-Takt EWMA ms |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| stadt-A1 | steht | 59.6 | 16.7 | 25.0 | 25.3 | 8.60 | 10.8 | 15.7 | 16.80 | 0.60 | 2.52 | – | 13.27 | 17.03 | 1.58 | 0.09 | – | – | – | – | 3.63 |
| stadt-A1 | geht-1 | 35.5 | 25.0 | 50.1 | 108.3 | 22.40 | 45.1 | 104.4 | 24.00 | 0.11 | 2.54 | – | 23.99 | 51.68 | 3.82 | 0.12 | – | – | – | – | 3.22 |
| stadt-A1 | Geher-Ende |  | | | | | | | | | | | | | | | | | | | |
| stadt-A2 | steht | 58.8 | 16.7 | 25.0 | 25.1 | 8.70 | 10.8 | 14.9 | 16.90 | 0.25 | 2.52 | – | 13.23 | 17.46 | 1.57 | 0.09 | – | – | – | – | 3.56 |
| stadt-A2 | geht-1 | 33.4 | 25.0 | 58.2 | 116.7 | 24.10 | 47.5 | 118.4 | 25.40 | 0.12 | 2.49 | – | 25.46 | 51.46 | 3.10 | 0.12 | – | – | – | – | 3.68 |
| stadt-A2 | Geher-Ende |  | | | | | | | | | | | | | | | | | | | |
| stadt-B1 | steht | 58.7 | 16.7 | 25.0 | 25.2 | 8.60 | 10.8 | 15.0 | 16.90 | 0.60 | 2.54 | – | 13.13 | 17.31 | 1.58 | 0.09 | – | – | – | – | 3.72 |
| stadt-B1 | geht-1 | 34.8 | 25.0 | 50.0 | 108.3 | 23.80 | 44.1 | 103.3 | 25.00 | 0.12 | 2.50 | – | 25.02 | 50.60 | 3.12 | 0.12 | – | – | – | – | 4.09 |
| stadt-B1 | Geher-Ende |  | | | | | | | | | | | | | | | | | | | |
| stadt-B2 | steht | 58.8 | 16.7 | 25.0 | 25.2 | 8.80 | 11.1 | 14.7 | 16.90 | 0.60 | 2.55 | – | 13.50 | 17.85 | 1.58 | 0.08 | – | – | – | – | 3.48 |
| stadt-B2 | geht-1 | 34.1 | 25.0 | 50.0 | 108.3 | 24.20 | 43.9 | 107.0 | 25.50 | 0.12 | 2.57 | – | 25.44 | 50.33 | 3.12 | 0.12 | – | – | – | – | 3.90 |
| stadt-B2 | Geher-Ende |  | | | | | | | | | | | | | | | | | | | |

## Tier-Zensus je Boot (zensus-0 nach umstellen · zensus-1 nach geht-1)

- stadt-A1: vorher 7 (deer 3, wolf 4; Würfe≥2 2: deer 3 Spanne 1.9 m @112 m | wolf 4 Spanne 1.8 m @466.7 m; Verband-Feld true, Verbände≥2 2: deer 3 Spanne 1.9 m | wolf 4 Spanne 1.8 m; Zustand {"flucht":3,"fressen":4})
  nachher 9 (wolf 4, deer 5; Würfe≥2 2: wolf 4 Spanne 1.8 m @465.2 m | deer 5 Spanne 3.4 m @400 m; Verband-Feld true, Verbände≥2 2: wolf 4 Spanne 1.8 m | deer 5 Spanne 3.4 m; Zustand {"fressen":2,"-":7})
- stadt-A2: vorher 7 (deer 3, wolf 4; Würfe≥2 2: deer 3 Spanne 2 m @112 m | wolf 4 Spanne 1.7 m @467.1 m; Verband-Feld true, Verbände≥2 2: deer 3 Spanne 2 m | wolf 4 Spanne 1.7 m; Zustand {"flucht":3,"-":1,"fressen":3})
  nachher 9 (wolf 4, deer 5; Würfe≥2 2: wolf 4 Spanne 1.8 m @465.7 m | deer 5 Spanne 3.6 m @400.7 m; Verband-Feld true, Verbände≥2 2: wolf 4 Spanne 1.8 m | deer 5 Spanne 3.6 m; Zustand {"fressen":3,"-":6})
- stadt-B1: vorher 7 (deer 3, wolf 4; Würfe≥2 2: deer 3 Spanne 2.2 m @155.6 m | wolf 4 Spanne 1.5 m @466.2 m; Verband-Feld true, Verbände≥2 2: deer 3 Spanne 2.2 m | wolf 4 Spanne 1.5 m; Zustand {"flucht":3,"-":2,"fressen":2})
  nachher 7 (wolf 4, deer 3; Würfe≥2 2: wolf 4 Spanne 2.2 m @465.1 m | deer 3 Spanne 4.1 m @221.4 m; Verband-Feld true, Verbände≥2 2: wolf 4 Spanne 2.2 m | deer 3 Spanne 4.1 m; Zustand {"-":6,"fressen":1})
- stadt-B2: vorher 7 (deer 3, wolf 4; Würfe≥2 2: deer 3 Spanne 1.8 m @90.6 m | wolf 4 Spanne 1.5 m @465.7 m; Verband-Feld true, Verbände≥2 2: deer 3 Spanne 1.8 m | wolf 4 Spanne 1.5 m; Zustand {"flucht":3,"-":2,"fressen":2})
  nachher 4 (wolf 4; Würfe≥2 1: wolf 4 Spanne 2.3 m @464.8 m; Verband-Feld true, Verbände≥2 1: wolf 4 Spanne 2.3 m; Zustand {"-":2,"fressen":2})

## GPU-Takt je Boot (nvidia-smi 1 s, nur P0-Sekunden: Median-MHz · Anteil Drossel (Grund ≠ 0 ohne GpuIdle 0x1) · max °C)

- stadt-A1: 161 s · 1733 MHz · Drossel 30 % · 86 °C
- stadt-A2: 161 s · 1733 MHz · Drossel 31 % · 87 °C
- stadt-B1: 164 s · 1733 MHz · Drossel 29 % · 87 °C
- stadt-B2: 163 s · 1746 MHz · Drossel 34 % · 87 °C

## Mittel je Seite (A 4b13478b · B eeb5d2bf; gehend = geht-1 je Boot)

| Gang | Größe | A | B | Δ B − A | 2σ | t (Welch) | Urteil |
|---|---|---|---|---|---|---|---|
| steht | fps | 59.2 (59.6 · 58.8) | 58.8 (58.7 · 58.8) | -0.5 | 0.8 | -1.12 | nicht langsamer |
| steht | Frame p50 ms | 16.7 (16.7 · 16.7) | 16.7 (16.7 · 16.7) | 0.0 | 0.0 | – | nicht langsamer |
| steht | Frame p95 ms | 25.0 (25.0 · 25.0) | 25.0 (25.0 · 25.0) | 0.0 | 0.0 | – | nicht langsamer |
| steht | Frame p99 ms | 25.2 (25.3 · 25.1) | 25.2 (25.2 · 25.2) | -0.0 | 0.2 | -0.00 | nicht langsamer |
| steht | CPU-Takt p50 ms | 8.65 (8.60 · 8.70) | 8.70 (8.60 · 8.80) | +0.05 | 0.22 | 0.45 | nicht langsamer |
| steht | CPU-Takt p95 ms | 10.8 (10.8 · 10.8) | 10.9 (10.8 · 11.1) | +0.1 | 0.3 | 1.00 | nicht langsamer |
| steht | CPU-Takt p99 ms | 15.3 (15.7 · 14.9) | 14.8 (15.0 · 14.7) | -0.5 | 0.9 | -1.05 | nicht langsamer |
| steht | GPU-Durchsatz p50 ms | 16.85 (16.80 · 16.90) | 16.90 (16.90 · 16.90) | +0.05 | 0.10 | 1.00 | nicht langsamer |
| steht | k0 p50 ms | 0.42 (0.60 · 0.25) | 0.60 (0.60 · 0.60) | +0.17 | 0.35 | 1.00 | nicht langsamer |
| steht | GPU p95 ms (lauf) | 2.52 (2.52 · 2.52) | 2.54 (2.54 · 2.55) | +0.02 | 0.01 | 5.00 | LANGSAMER |
| steht | GPU je Bild ms (gpu-bank) | – (– · –) | – (– · –) | – | – | – | – |
| steht | Belegung p50 ms | 13.25 (13.27 · 13.23) | 13.32 (13.13 · 13.50) | +0.07 | 0.37 | 0.35 | nicht langsamer |
| steht | Belegung p95 ms | 17.25 (17.03 · 17.46) | 17.58 (17.31 · 17.85) | +0.33 | 0.69 | 0.97 | nicht langsamer |
| steht | außer Takt p95 ms | 1.58 (1.58 · 1.57) | 1.58 (1.58 · 1.58) | +0.00 | 0.01 | 1.00 | nicht langsamer |
| steht | Lebenszyklus p95 ms | 0.09 (0.09 · 0.09) | 0.08 (0.09 · 0.08) | -0.01 | 0.01 | -1.00 | nicht langsamer |
| steht | über 33 ms % | – (– · –) | – (– · –) | – | – | – | – |
| steht | KI-Uhr Mittel ms | – (– · –) | – (– · –) | – | – | – | – |
| steht | KI-Uhr p95 ms | – (– · –) | – (– · –) | – | – | – | – |
| steht | KI-Uhr p99 ms | – (– · –) | – (– · –) | – | – | – | – |
| steht | KI-Takt EWMA ms | 3.59 (3.63 · 3.56) | 3.60 (3.72 · 3.48) | +0.01 | 0.25 | 0.04 | nicht langsamer |
| geht | fps | 34.5 (35.5 · 33.4) | 34.5 (34.8 · 34.1) | 0.0 | 2.2 | 0.00 | nicht langsamer |
| geht | Frame p50 ms | 25.0 (25.0 · 25.0) | 25.0 (25.0 · 25.0) | 0.0 | 0.0 | – | nicht langsamer |
| geht | Frame p95 ms | 54.2 (50.1 · 58.2) | 50.0 (50.0 · 50.0) | -4.2 | 8.1 | -1.02 | nicht langsamer |
| geht | Frame p99 ms | 112.5 (108.3 · 116.7) | 108.3 (108.3 · 108.3) | -4.2 | 8.4 | -1.00 | nicht langsamer |
| geht | CPU-Takt p50 ms | 23.25 (22.40 · 24.10) | 24.00 (23.80 · 24.20) | +0.75 | 1.75 | 0.86 | nicht langsamer |
| geht | CPU-Takt p95 ms | 46.3 (45.1 · 47.5) | 44.0 (44.1 · 43.9) | -2.3 | 2.4 | -1.91 | nicht langsamer |
| geht | CPU-Takt p99 ms | 111.4 (104.4 · 118.4) | 105.2 (103.3 · 107.0) | -6.3 | 14.5 | -0.86 | nicht langsamer |
| geht | GPU-Durchsatz p50 ms | 24.70 (24.00 · 25.40) | 25.25 (25.00 · 25.50) | +0.55 | 1.49 | 0.74 | nicht langsamer |
| geht | k0 p50 ms | 0.11 (0.11 · 0.12) | 0.12 (0.12 · 0.12) | +0.01 | 0.01 | 1.00 | nicht langsamer |
| geht | GPU p95 ms (lauf) | 2.52 (2.54 · 2.49) | 2.54 (2.50 · 2.57) | +0.02 | 0.09 | 0.46 | nicht langsamer |
| geht | GPU je Bild ms (gpu-bank) | – (– · –) | – (– · –) | – | – | – | – |
| geht | Belegung p50 ms | 24.73 (23.99 · 25.46) | 25.23 (25.02 · 25.44) | +0.50 | 1.53 | 0.66 | nicht langsamer |
| geht | Belegung p95 ms | 51.57 (51.68 · 51.46) | 50.47 (50.60 · 50.33) | -1.10 | 0.35 | -6.35 | nicht langsamer |
| geht | außer Takt p95 ms | 3.46 (3.82 · 3.10) | 3.12 (3.12 · 3.12) | -0.34 | 0.72 | -0.94 | nicht langsamer |
| geht | Lebenszyklus p95 ms | 0.12 (0.12 · 0.12) | 0.12 (0.12 · 0.12) | 0.00 | 0.00 | – | nicht langsamer |
| geht | über 33 ms % | – (– · –) | – (– · –) | – | – | – | – |
| geht | KI-Uhr Mittel ms | – (– · –) | – (– · –) | – | – | – | – |
| geht | KI-Uhr p95 ms | – (– · –) | – (– · –) | – | – | – | – |
| geht | KI-Uhr p99 ms | – (– · –) | – (– · –) | – | – | – | – |
| geht | KI-Takt EWMA ms | 3.45 (3.22 · 3.68) | 4.00 (4.09 · 3.90) | +0.54 | 0.50 | 2.19 | LANGSAMER |

**KERN-URTEIL GEHEN stadt** (steht + geht × fps · Frame p95 · CPU-Takt p95 · GPU je Bild (gpu-bank, nur steht) · Belegung p95; Δ ≤ max(2σ gepoolt, Auflösung)): nicht langsamer (8 Größen)
