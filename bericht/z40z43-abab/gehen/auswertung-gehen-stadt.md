## stadt — je Boot

| Boot | Gang | fps | Frame p50 ms | Frame p95 ms | Frame p99 ms | CPU-Takt p50 ms | CPU-Takt p95 ms | CPU-Takt p99 ms | GPU-Durchsatz p50 ms | k0 p50 ms | GPU p95 ms (lauf) | GPU je Bild ms (gpu-bank) | Belegung p50 ms | Belegung p95 ms | außer Takt p95 ms | Lebenszyklus p95 ms | über 33 ms % | KI-Uhr Mittel ms | KI-Uhr p95 ms | KI-Uhr p99 ms | KI-Takt EWMA ms |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| stadt-A1 | steht | 78.8 | 16.4 | 16.8 | 17.0 | 5.60 | 6.9 | 9.6 | 12.70 | 0.20 | 1.93 | – | 7.79 | 10.51 | 0.92 | 0.08 | – | – | – | – | 2.16 |
| stadt-A1 | geht-1 | 45.9 | 16.7 | 33.4 | 66.7 | 17.60 | 34.4 | 58.2 | 19.00 | 0.14 | 2.27 | – | 19.00 | 36.80 | 2.29 | 0.08 | – | – | – | – | 3.57 |
| stadt-A1 | Geher-Ende |  | | | | | | | | | | | | | | | | | | | |
| stadt-A2 | steht | 78.8 | 16.3 | 16.8 | 17.0 | 5.50 | 6.7 | 8.9 | 12.80 | 0.20 | 1.99 | – | 7.78 | 10.25 | 0.91 | 0.08 | – | – | – | – | 2.05 |
| stadt-A2 | geht-1 | 46.4 | 16.7 | 41.6 | 66.7 | 17.10 | 35.0 | 65.0 | 18.80 | 0.14 | 2.34 | – | 18.64 | 37.40 | 2.66 | 0.08 | – | – | – | – | 3.33 |
| stadt-A2 | Geher-Ende |  | | | | | | | | | | | | | | | | | | | |
| stadt-B1 | steht | 78.7 | 16.3 | 16.8 | 17.0 | 5.50 | 6.7 | 9.5 | 12.80 | 0.20 | 1.99 | – | 7.80 | 10.18 | 0.91 | 0.09 | – | – | – | – | 2.27 |
| stadt-B1 | geht-1 | 47.6 | 16.7 | 33.4 | 58.4 | 16.60 | 33.1 | 56.1 | 18.20 | 0.14 | 2.28 | – | 18.18 | 34.99 | 1.95 | 0.08 | – | – | – | – | 3.24 |
| stadt-B1 | Geher-Ende |  | | | | | | | | | | | | | | | | | | | |
| stadt-B2 | steht | 78.8 | 16.4 | 16.8 | 17.0 | 5.50 | 6.8 | 9.1 | 12.80 | 0.20 | 1.96 | – | 7.71 | 10.51 | 0.85 | 0.08 | – | – | – | – | 2.26 |
| stadt-B2 | geht-1 | 46.7 | 16.7 | 33.5 | 58.4 | 17.20 | 35.0 | 56.8 | 18.60 | 0.14 | 2.43 | – | 18.59 | 36.18 | 2.13 | 0.08 | – | – | – | – | 3.24 |
| stadt-B2 | Geher-Ende |  | | | | | | | | | | | | | | | | | | | |

## Tier-Zensus je Boot (zensus-0 nach umstellen · zensus-1 nach geht-1)

- stadt-A1: vorher 6 (deer 5, fox 1; Würfe≥2 1: deer 5 Spanne 2.5 m @222.2 m; Verband-Feld true, Verbände≥2 1: deer 5 Spanne 2.5 m; Zustand {"-":6})
  nachher 6 (deer 5, fox 1; Würfe≥2 1: deer 5 Spanne 2.4 m @222.8 m; Verband-Feld true, Verbände≥2 1: deer 5 Spanne 2.4 m; Zustand {"-":6})
- stadt-A2: vorher 6 (deer 5, fox 1; Würfe≥2 1: deer 5 Spanne 2.6 m @222.2 m; Verband-Feld true, Verbände≥2 1: deer 5 Spanne 2.6 m; Zustand {"-":6})
  nachher 6 (deer 5, fox 1; Würfe≥2 1: deer 5 Spanne 2.3 m @222.9 m; Verband-Feld true, Verbände≥2 1: deer 5 Spanne 2.3 m; Zustand {"-":6})
- stadt-B1: vorher 6 (deer 5, fox 1; Würfe≥2 1: deer 5 Spanne 2.6 m @222.2 m; Verband-Feld true, Verbände≥2 1: deer 5 Spanne 2.6 m; Zustand {"-":6})
  nachher 6 (deer 5, fox 1; Würfe≥2 1: deer 5 Spanne 2.3 m @222.9 m; Verband-Feld true, Verbände≥2 1: deer 5 Spanne 2.3 m; Zustand {"-":6})
- stadt-B2: vorher 6 (deer 5, fox 1; Würfe≥2 1: deer 5 Spanne 2.6 m @222.2 m; Verband-Feld true, Verbände≥2 1: deer 5 Spanne 2.6 m; Zustand {"-":6})
  nachher 6 (deer 5, fox 1; Würfe≥2 1: deer 5 Spanne 2.3 m @222.9 m; Verband-Feld true, Verbände≥2 1: deer 5 Spanne 2.3 m; Zustand {"-":6})

## GPU-Takt je Boot (nvidia-smi 1 s, nur P0-Sekunden: Median-MHz · Anteil Drossel (Grund ≠ 0 ohne GpuIdle 0x1) · max °C)

- stadt-A1: 134 s · 1733 MHz · Drossel 25 % · 86 °C
- stadt-A2: 108 s · 1746 MHz · Drossel 23 % · 86 °C
- stadt-B1: 139 s · 1733 MHz · Drossel 21 % · 86 °C
- stadt-B2: 144 s · 1733 MHz · Drossel 19 % · 86 °C

## Mittel je Seite (A f85ddf35 · B 607d0c73; gehend = geht-1 je Boot)

| Gang | Größe | A | B | Δ B − A | 2σ | t (Welch) | Urteil |
|---|---|---|---|---|---|---|---|
| steht | fps | 78.8 (78.8 · 78.8) | 78.8 (78.7 · 78.8) | -0.0 | 0.1 | -1.00 | nicht langsamer |
| steht | Frame p50 ms | 16.4 (16.4 · 16.3) | 16.4 (16.3 · 16.4) | 0.0 | 0.1 | 0.00 | nicht langsamer |
| steht | Frame p95 ms | 16.8 (16.8 · 16.8) | 16.8 (16.8 · 16.8) | 0.0 | 0.0 | – | nicht langsamer |
| steht | Frame p99 ms | 17.0 (17.0 · 17.0) | 17.0 (17.0 · 17.0) | 0.0 | 0.0 | – | nicht langsamer |
| steht | CPU-Takt p50 ms | 5.55 (5.60 · 5.50) | 5.50 (5.50 · 5.50) | -0.05 | 0.10 | -1.00 | nicht langsamer |
| steht | CPU-Takt p95 ms | 6.8 (6.9 · 6.7) | 6.8 (6.7 · 6.8) | -0.1 | 0.2 | -0.45 | nicht langsamer |
| steht | CPU-Takt p99 ms | 9.3 (9.6 · 8.9) | 9.3 (9.5 · 9.1) | +0.1 | 0.8 | 0.12 | nicht langsamer |
| steht | GPU-Durchsatz p50 ms | 12.75 (12.70 · 12.80) | 12.80 (12.80 · 12.80) | +0.05 | 0.10 | 1.00 | nicht langsamer |
| steht | k0 p50 ms | 0.20 (0.20 · 0.20) | 0.20 (0.20 · 0.20) | 0.00 | 0.00 | – | nicht langsamer |
| steht | GPU p95 ms (lauf) | 1.96 (1.93 · 1.99) | 1.98 (1.99 · 1.96) | +0.02 | 0.07 | 0.45 | nicht langsamer |
| steht | GPU je Bild ms (gpu-bank) | – (– · –) | – (– · –) | – | – | – | – |
| steht | Belegung p50 ms | 7.79 (7.79 · 7.78) | 7.75 (7.80 · 7.71) | -0.03 | 0.09 | -0.66 | nicht langsamer |
| steht | Belegung p95 ms | 10.38 (10.51 · 10.25) | 10.34 (10.18 · 10.51) | -0.04 | 0.42 | -0.17 | nicht langsamer |
| steht | außer Takt p95 ms | 0.92 (0.92 · 0.91) | 0.88 (0.91 · 0.85) | -0.04 | 0.06 | -1.15 | nicht langsamer |
| steht | Lebenszyklus p95 ms | 0.08 (0.08 · 0.08) | 0.08 (0.09 · 0.08) | +0.00 | 0.01 | 1.00 | nicht langsamer |
| steht | über 33 ms % | – (– · –) | – (– · –) | – | – | – | – |
| steht | KI-Uhr Mittel ms | – (– · –) | – (– · –) | – | – | – | – |
| steht | KI-Uhr p95 ms | – (– · –) | – (– · –) | – | – | – | – |
| steht | KI-Uhr p99 ms | – (– · –) | – (– · –) | – | – | – | – |
| steht | KI-Takt EWMA ms | 2.10 (2.16 · 2.05) | 2.26 (2.27 · 2.26) | +0.16 | 0.11 | 2.90 | LANGSAMER |
| geht | fps | 46.1 (45.9 · 46.4) | 47.2 (47.6 · 46.7) | +1.0 | 1.0 | 1.94 | nicht langsamer |
| geht | Frame p50 ms | 16.7 (16.7 · 16.7) | 16.7 (16.7 · 16.7) | 0.0 | 0.0 | – | nicht langsamer |
| geht | Frame p95 ms | 37.5 (33.4 · 41.6) | 33.5 (33.4 · 33.5) | -4.0 | 8.2 | -0.99 | nicht langsamer |
| geht | Frame p99 ms | 66.7 (66.7 · 66.7) | 58.4 (58.4 · 58.4) | -8.3 | 0.0 | – | nicht langsamer |
| geht | CPU-Takt p50 ms | 17.35 (17.60 · 17.10) | 16.90 (16.60 · 17.20) | -0.45 | 0.78 | -1.15 | nicht langsamer |
| geht | CPU-Takt p95 ms | 34.7 (34.4 · 35.0) | 34.0 (33.1 · 35.0) | -0.7 | 2.0 | -0.65 | nicht langsamer |
| geht | CPU-Takt p99 ms | 61.6 (58.2 · 65.0) | 56.5 (56.1 · 56.8) | -5.1 | 6.8 | -1.51 | nicht langsamer |
| geht | GPU-Durchsatz p50 ms | 18.90 (19.00 · 18.80) | 18.40 (18.20 · 18.60) | -0.50 | 0.45 | -2.24 | nicht langsamer |
| geht | k0 p50 ms | 0.14 (0.14 · 0.14) | 0.14 (0.14 · 0.14) | 0.00 | 0.00 | – | nicht langsamer |
| geht | GPU p95 ms (lauf) | 2.30 (2.27 · 2.34) | 2.35 (2.28 · 2.43) | +0.05 | 0.17 | 0.60 | nicht langsamer |
| geht | GPU je Bild ms (gpu-bank) | – (– · –) | – (– · –) | – | – | – | – |
| geht | Belegung p50 ms | 18.82 (19.00 · 18.64) | 18.38 (18.18 · 18.59) | -0.44 | 0.55 | -1.59 | nicht langsamer |
| geht | Belegung p95 ms | 37.10 (36.80 · 37.40) | 35.59 (34.99 · 36.18) | -1.51 | 1.33 | -2.27 | nicht langsamer |
| geht | außer Takt p95 ms | 2.48 (2.29 · 2.66) | 2.04 (1.95 · 2.13) | -0.44 | 0.41 | -2.11 | nicht langsamer |
| geht | Lebenszyklus p95 ms | 0.08 (0.08 · 0.08) | 0.08 (0.08 · 0.08) | 0.00 | 0.00 | – | nicht langsamer |
| geht | über 33 ms % | – (– · –) | – (– · –) | – | – | – | – |
| geht | KI-Uhr Mittel ms | – (– · –) | – (– · –) | – | – | – | – |
| geht | KI-Uhr p95 ms | – (– · –) | – (– · –) | – | – | – | – |
| geht | KI-Uhr p99 ms | – (– · –) | – (– · –) | – | – | – | – |
| geht | KI-Takt EWMA ms | 3.45 (3.57 · 3.33) | 3.24 (3.24 · 3.24) | -0.21 | 0.24 | -1.75 | nicht langsamer |

**KERN-URTEIL GEHEN stadt** (steht + geht × fps · Frame p95 · CPU-Takt p95 · GPU je Bild (gpu-bank, nur steht) · Belegung p95; Δ ≤ max(2σ gepoolt, Auflösung)): nicht langsamer (8 Größen)
