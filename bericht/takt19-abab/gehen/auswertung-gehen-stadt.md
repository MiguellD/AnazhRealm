## stadt — je Boot

| Boot | Gang | fps | Frame p50 ms | Frame p95 ms | Frame p99 ms | CPU-Takt p50 ms | CPU-Takt p95 ms | CPU-Takt p99 ms | GPU-Durchsatz p50 ms | k0 p50 ms | GPU p95 ms (lauf) | GPU je Bild ms (gpu-bank) | Belegung p50 ms | Belegung p95 ms | außer Takt p95 ms | Lebenszyklus p95 ms | über 33 ms % | KI-Uhr Mittel ms | KI-Uhr p95 ms | KI-Uhr p99 ms | KI-Takt EWMA ms |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| stadt-A1 | steht | 77.4 | 16.5 | 16.7 | 24.9 | 6.30 | 8.3 | 10.9 | 13.00 | 0.20 | 2.21 | – | 9.15 | 12.85 | 1.13 | 0.09 | – | – | – | – | 3.09 |
| stadt-A1 | geht-1 | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – |
| stadt-A1 | Geher-Ende |  | | | | | | | | | | | | | | | | | | | |
| stadt-A2 | steht | 76.8 | 16.5 | 16.8 | 17.2 | 6.40 | 8.6 | 11.7 | 13.00 | 0.20 | 2.10 | – | 9.38 | 12.88 | 1.08 | 0.09 | – | – | – | – | 2.68 |
| stadt-A2 | geht-1 | 42.8 | 16.8 | 41.7 | 83.3 | 17.80 | 38.6 | 77.2 | 19.40 | 0.14 | 2.34 | – | 19.31 | 43.69 | 2.43 | 0.09 | – | – | – | – | 4.49 |
| stadt-A2 | Geher-Ende |  | | | | | | | | | | | | | | | | | | | |
| stadt-B1 | steht | 79.7 | 16.4 | 16.7 | 16.9 | 4.50 | 5.6 | 7.2 | 12.70 | 0.19 | 1.78 | – | 6.43 | 8.38 | 0.82 | 0.07 | – | – | – | – | 0.83 |
| stadt-B1 | geht-1 | 61.5 | 16.6 | 25.1 | 33.4 | 12.30 | 22.0 | 34.6 | 15.40 | 0.11 | 2.25 | – | 15.26 | 23.70 | 1.87 | 0.08 | – | – | – | – | 0.66 |
| stadt-B1 | Geher-Ende |  | | | | | | | | | | | | | | | | | | | |
| stadt-B2 | steht | 79.1 | 16.5 | 16.7 | 16.8 | 5.50 | 7.1 | 8.0 | 12.70 | 0.19 | 1.78 | – | 7.78 | 10.53 | 1.03 | 0.09 | – | – | – | – | 0.97 |
| stadt-B2 | geht-1 | 50.8 | 16.7 | 33.3 | 41.7 | 16.80 | 28.9 | 42.7 | 18.20 | 0.11 | 2.13 | – | 18.12 | 30.45 | 1.78 | 0.10 | – | – | – | – | 0.84 |
| stadt-B2 | Geher-Ende |  | | | | | | | | | | | | | | | | | | | |

## Tier-Zensus je Boot (zensus-0 nach umstellen · zensus-1 nach geht-1)

- stadt-A1: vorher 6 (deer 5, fox 1; Würfe≥2 1: deer 5 Spanne 2.5 m @222.2 m; Verband-Feld true, Verbände≥2 1: deer 5 Spanne 2.5 m; Zustand {"-":6})
  nachher –
- stadt-A2: vorher 6 (deer 5, fox 1; Würfe≥2 1: deer 5 Spanne 2.5 m @222.2 m; Verband-Feld true, Verbände≥2 1: deer 5 Spanne 2.5 m; Zustand {"-":6})
  nachher 6 (deer 5, fox 1; Würfe≥2 1: deer 5 Spanne 2.4 m @222.8 m; Verband-Feld true, Verbände≥2 1: deer 5 Spanne 2.4 m; Zustand {"-":6})
- stadt-B1: vorher 6 (deer 5, fox 1; Würfe≥2 1: deer 5 Spanne 2.6 m @222.1 m; Verband-Feld true, Verbände≥2 1: deer 5 Spanne 2.6 m; Zustand {"-":6})
  nachher 6 (deer 5, fox 1; Würfe≥2 1: deer 5 Spanne 2.4 m @222.8 m; Verband-Feld true, Verbände≥2 1: deer 5 Spanne 2.4 m; Zustand {"-":6})
- stadt-B2: vorher 6 (deer 5, fox 1; Würfe≥2 1: deer 5 Spanne 2.5 m @222.1 m; Verband-Feld true, Verbände≥2 1: deer 5 Spanne 2.5 m; Zustand {"-":6})
  nachher 7 (deer 5, fox 1, bear 1; Würfe≥2 1: deer 5 Spanne 2.3 m @222.8 m; Verband-Feld true, Verbände≥2 1: deer 5 Spanne 2.3 m; Zustand {"-":7})

## GPU-Takt je Boot (nvidia-smi 1 s, nur P0-Sekunden: Median-MHz · Anteil Drossel (Grund ≠ 0 ohne GpuIdle 0x1) · max °C)

- stadt-A1: 171 s · 1721 MHz · Drossel 20 % · 87 °C
- stadt-A2: 183 s · 1721 MHz · Drossel 18 % · 87 °C
- stadt-B1: 164 s · 1721 MHz · Drossel 26 % · 87 °C
- stadt-B2: 177 s · 1708 MHz · Drossel 16 % · 87 °C

## Mittel je Seite (A 9e92be45 · B b3f9ae95; gehend = geht-1 je Boot)

| Gang | Größe | A | B | Δ B − A | 2σ | t (Welch) | Urteil |
|---|---|---|---|---|---|---|---|
| steht | fps | 77.1 (77.4 · 76.8) | 79.4 (79.7 · 79.1) | +2.3 | 0.8 | 5.42 | nicht langsamer |
| steht | Frame p50 ms | 16.5 (16.5 · 16.5) | 16.4 (16.4 · 16.5) | -0.1 | 0.1 | -1.00 | nicht langsamer |
| steht | Frame p95 ms | 16.8 (16.7 · 16.8) | 16.7 (16.7 · 16.7) | -0.1 | 0.1 | -1.00 | nicht langsamer |
| steht | Frame p99 ms | 21.0 (24.9 · 17.2) | 16.9 (16.9 · 16.8) | -4.2 | 7.7 | -1.09 | nicht langsamer |
| steht | CPU-Takt p50 ms | 6.35 (6.30 · 6.40) | 5.00 (4.50 · 5.50) | -1.35 | 1.00 | -2.69 | nicht langsamer |
| steht | CPU-Takt p95 ms | 8.4 (8.3 · 8.6) | 6.3 (5.6 · 7.1) | -2.1 | 1.5 | -2.75 | nicht langsamer |
| steht | CPU-Takt p99 ms | 11.3 (10.9 · 11.7) | 7.6 (7.2 · 8.0) | -3.7 | 1.1 | -6.54 | nicht langsamer |
| steht | GPU-Durchsatz p50 ms | 13.00 (13.00 · 13.00) | 12.70 (12.70 · 12.70) | -0.30 | 0.00 | – | nicht langsamer |
| steht | k0 p50 ms | 0.20 (0.20 · 0.20) | 0.19 (0.19 · 0.19) | -0.01 | 0.00 | – | nicht langsamer |
| steht | GPU p95 ms (lauf) | 2.16 (2.21 · 2.10) | 1.78 (1.78 · 1.78) | -0.38 | 0.11 | -6.82 | nicht langsamer |
| steht | GPU je Bild ms (gpu-bank) | – (– · –) | – (– · –) | – | – | – | – |
| steht | Belegung p50 ms | 9.27 (9.15 · 9.38) | 7.11 (6.43 · 7.78) | -2.16 | 1.37 | -3.15 | nicht langsamer |
| steht | Belegung p95 ms | 12.87 (12.85 · 12.88) | 9.46 (8.38 · 10.53) | -3.41 | 2.15 | -3.17 | nicht langsamer |
| steht | außer Takt p95 ms | 1.10 (1.13 · 1.08) | 0.93 (0.82 · 1.03) | -0.18 | 0.22 | -1.67 | nicht langsamer |
| steht | Lebenszyklus p95 ms | 0.09 (0.09 · 0.09) | 0.08 (0.07 · 0.09) | -0.01 | 0.02 | -1.00 | nicht langsamer |
| steht | über 33 ms % | – (– · –) | – (– · –) | – | – | – | – |
| steht | KI-Uhr Mittel ms | – (– · –) | – (– · –) | – | – | – | – |
| steht | KI-Uhr p95 ms | – (– · –) | – (– · –) | – | – | – | – |
| steht | KI-Uhr p99 ms | – (– · –) | – (– · –) | – | – | – | – |
| steht | KI-Takt EWMA ms | 2.88 (3.09 · 2.68) | 0.90 (0.83 · 0.97) | -1.98 | 0.43 | -9.16 | nicht langsamer |
| geht | fps | 42.8 (– · 42.8) | 56.1 (61.5 · 50.8) | +13.4 | 15.1 | 2.50 | nicht langsamer |
| geht | Frame p50 ms | 16.8 (– · 16.8) | 16.6 (16.6 · 16.7) | -0.2 | 0.1 | -3.00 | nicht langsamer |
| geht | Frame p95 ms | 41.7 (– · 41.7) | 29.2 (25.1 · 33.3) | -12.5 | 11.6 | -3.05 | nicht langsamer |
| geht | Frame p99 ms | 83.3 (– · 83.3) | 37.5 (33.4 · 41.7) | -45.8 | 11.7 | -11.02 | nicht langsamer |
| geht | CPU-Takt p50 ms | 17.80 (– · 17.80) | 14.55 (12.30 · 16.80) | -3.25 | 6.36 | -1.44 | nicht langsamer |
| geht | CPU-Takt p95 ms | 38.6 (– · 38.6) | 25.4 (22.0 · 28.9) | -13.2 | 9.8 | -3.81 | nicht langsamer |
| geht | CPU-Takt p99 ms | 77.2 (– · 77.2) | 38.7 (34.6 · 42.7) | -38.5 | 11.5 | -9.52 | nicht langsamer |
| geht | GPU-Durchsatz p50 ms | 19.40 (– · 19.40) | 16.80 (15.40 · 18.20) | -2.60 | 3.96 | -1.86 | nicht langsamer |
| geht | k0 p50 ms | 0.14 (– · 0.14) | 0.11 (0.11 · 0.11) | -0.03 | 0.00 | – | nicht langsamer |
| geht | GPU p95 ms (lauf) | 2.34 (– · 2.34) | 2.19 (2.25 · 2.13) | -0.15 | 0.17 | -2.50 | nicht langsamer |
| geht | GPU je Bild ms (gpu-bank) | – (– · –) | – (– · –) | – | – | – | – |
| geht | Belegung p50 ms | 19.31 (– · 19.31) | 16.69 (15.26 · 18.12) | -2.62 | 4.04 | -1.83 | nicht langsamer |
| geht | Belegung p95 ms | 43.69 (– · 43.69) | 27.07 (23.70 · 30.45) | -16.61 | 9.55 | -4.92 | nicht langsamer |
| geht | außer Takt p95 ms | 2.43 (– · 2.43) | 1.83 (1.87 · 1.78) | -0.60 | 0.13 | -13.44 | nicht langsamer |
| geht | Lebenszyklus p95 ms | 0.09 (– · 0.09) | 0.09 (0.08 · 0.10) | 0.00 | 0.03 | 0.00 | nicht langsamer |
| geht | über 33 ms % | – (– · –) | – (– · –) | – | – | – | – |
| geht | KI-Uhr Mittel ms | – (– · –) | – (– · –) | – | – | – | – |
| geht | KI-Uhr p95 ms | – (– · –) | – (– · –) | – | – | – | – |
| geht | KI-Uhr p99 ms | – (– · –) | – (– · –) | – | – | – | – |
| geht | KI-Takt EWMA ms | 4.49 (– · 4.49) | 0.75 (0.66 · 0.84) | -3.74 | 0.25 | -41.56 | nicht langsamer |

**KERN-URTEIL GEHEN stadt** (steht + geht × fps · Frame p95 · CPU-Takt p95 · GPU je Bild (gpu-bank, nur steht) · Belegung p95; Δ ≤ max(2σ gepoolt, Auflösung)): nicht langsamer (8 Größen)
