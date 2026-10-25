## stadt — je Boot

| Boot | Gang | fps | Frame p50 ms | Frame p95 ms | Frame p99 ms | CPU-Takt p50 ms | CPU-Takt p95 ms | CPU-Takt p99 ms | GPU-Durchsatz p50 ms | k0 p50 ms | GPU p95 ms (lauf) | GPU je Bild ms (gpu-bank) | Belegung p50 ms | Belegung p95 ms | außer Takt p95 ms | Lebenszyklus p95 ms | über 33 ms % | KI-Uhr Mittel ms | KI-Uhr p95 ms | KI-Uhr p99 ms | KI-Takt EWMA ms |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| stadt-A1 | steht | 44.2 | 16.5 | 25.1 | 500.1 | 4.00 | 17.9 | 49.6 | 12.40 | 0.11 | 4.60 | – | 5.63 | 25.45 | 1.81 | 0.10 | – | – | – | – | 0.21 |
| stadt-A1 | geht-1 | 25.8 | 33.2 | 91.7 | 191.6 | 27.80 | 91.5 | 182.6 | 28.60 | 0.25 | 2.91 | – | 29.51 | 96.28 | 13.63 | 0.20 | – | – | – | – | 2.90 |
| stadt-A1 | Geher-Ende |  | | | | | | | | | | | | | | | | | | | |
| stadt-A2 | steht | 46.2 | 16.6 | 25.1 | 500.0 | 4.00 | 17.8 | 47.0 | 12.30 | 0.11 | 2.92 | – | 5.62 | 26.97 | 1.71 | 0.09 | – | – | – | – | 0.18 |
| stadt-A2 | geht-1 | 23.6 | 33.4 | 100.0 | 183.3 | 30.60 | 90.3 | 171.4 | 32.90 | 0.24 | 3.21 | – | 33.12 | 101.08 | 16.02 | 0.23 | – | – | – | – | 2.57 |
| stadt-A2 | Geher-Ende |  | | | | | | | | | | | | | | | | | | | |
| stadt-B1 | steht | 45.4 | 16.5 | 25.0 | 500.2 | 4.00 | 17.3 | 45.0 | 12.30 | 0.11 | 4.28 | – | 5.59 | 23.68 | 1.67 | 0.10 | – | – | – | – | 0.20 |
| stadt-B1 | geht-1 | 24.4 | 33.3 | 91.6 | 166.6 | 29.80 | 87.6 | 153.9 | 31.80 | 0.25 | 3.69 | – | 32.34 | 92.08 | 14.52 | 0.22 | – | – | – | – | 3.07 |
| stadt-B1 | Geher-Ende |  | | | | | | | | | | | | | | | | | | | |
| stadt-B2 | steht | 46.2 | 16.5 | 25.0 | 500.0 | 4.00 | 16.1 | 42.7 | 12.30 | 0.11 | 3.43 | – | 5.60 | 22.38 | 1.78 | 0.10 | – | – | – | – | 0.24 |
| stadt-B2 | geht-1 | 24.7 | 33.3 | 99.9 | 183.2 | 28.50 | 89.0 | 172.8 | 30.20 | 0.24 | 3.23 | – | 30.48 | 95.99 | 13.41 | 0.22 | – | – | – | – | 2.82 |
| stadt-B2 | Geher-Ende |  | | | | | | | | | | | | | | | | | | | |

## Tier-Zensus je Boot (zensus-0 nach umstellen · zensus-1 nach geht-1)

- stadt-A1: vorher 0 (; Würfe≥2 0: ; Verband-Feld false, Verbände≥2 0: ; Zustand {})
  nachher 6 (deer 5, fox 1; Würfe≥2 1: deer 5 Spanne 2.7 m @177.7 m; Verband-Feld true, Verbände≥2 1: deer 5 Spanne 2.7 m; Zustand {"-":6})
- stadt-A2: vorher 0 (; Würfe≥2 0: ; Verband-Feld false, Verbände≥2 0: ; Zustand {})
  nachher 6 (deer 5, fox 1; Würfe≥2 1: deer 5 Spanne 2.7 m @177.7 m; Verband-Feld true, Verbände≥2 1: deer 5 Spanne 2.7 m; Zustand {"-":6})
- stadt-B1: vorher 0 (; Würfe≥2 0: ; Verband-Feld false, Verbände≥2 0: ; Zustand {})
  nachher 6 (deer 5, fox 1; Würfe≥2 1: deer 5 Spanne 2.7 m @177.7 m; Verband-Feld true, Verbände≥2 1: deer 5 Spanne 2.7 m; Zustand {"-":6})
- stadt-B2: vorher 0 (; Würfe≥2 0: ; Verband-Feld false, Verbände≥2 0: ; Zustand {})
  nachher 6 (deer 5, fox 1; Würfe≥2 1: deer 5 Spanne 2.7 m @177.7 m; Verband-Feld true, Verbände≥2 1: deer 5 Spanne 2.7 m; Zustand {"-":6})

## GPU-Takt je Boot (nvidia-smi 1 s, nur P0-Sekunden: Median-MHz · Anteil Drossel (Grund ≠ 0 ohne GpuIdle 0x1) · max °C)

- stadt-A1: 75 s · 1809 MHz · Drossel 7 % · 82 °C
- stadt-A2: 112 s · 1733 MHz · Drossel 5 % · 83 °C
- stadt-B1: 101 s · 1733 MHz · Drossel 8 % · 83 °C
- stadt-B2: 108 s · 1733 MHz · Drossel 6 % · 83 °C

## Mittel je Seite (A 8f1802b1 · B d43cb61c; gehend = geht-1 je Boot)

| Gang | Größe | A | B | Δ B − A | 2σ | t (Welch) | Urteil |
|---|---|---|---|---|---|---|---|
| steht | fps | 45.2 (44.2 · 46.2) | 45.8 (45.4 · 46.2) | +0.6 | 2.2 | 0.56 | nicht langsamer |
| steht | Frame p50 ms | 16.6 (16.5 · 16.6) | 16.5 (16.5 · 16.5) | -0.1 | 0.1 | -1.00 | nicht langsamer |
| steht | Frame p95 ms | 25.1 (25.1 · 25.1) | 25.0 (25.0 · 25.0) | -0.1 | 0.0 | – | nicht langsamer |
| steht | Frame p99 ms | 500.1 (500.1 · 500.0) | 500.1 (500.2 · 500.0) | +0.1 | 0.2 | 0.45 | nicht langsamer |
| steht | CPU-Takt p50 ms | 4.00 (4.00 · 4.00) | 4.00 (4.00 · 4.00) | 0.00 | 0.00 | – | nicht langsamer |
| steht | CPU-Takt p95 ms | 17.9 (17.9 · 17.8) | 16.7 (17.3 · 16.1) | -1.1 | 1.2 | -1.91 | nicht langsamer |
| steht | CPU-Takt p99 ms | 48.3 (49.6 · 47.0) | 43.9 (45.0 · 42.7) | -4.4 | 3.5 | -2.56 | nicht langsamer |
| steht | GPU-Durchsatz p50 ms | 12.35 (12.40 · 12.30) | 12.30 (12.30 · 12.30) | -0.05 | 0.10 | -1.00 | nicht langsamer |
| steht | k0 p50 ms | 0.11 (0.11 · 0.11) | 0.11 (0.11 · 0.11) | 0.00 | 0.00 | – | nicht langsamer |
| steht | GPU p95 ms (lauf) | 3.76 (4.60 · 2.92) | 3.86 (4.28 · 3.43) | +0.10 | 1.88 | 0.10 | nicht langsamer |
| steht | GPU je Bild ms (gpu-bank) | – (– · –) | – (– · –) | – | – | – | – |
| steht | Belegung p50 ms | 5.63 (5.63 · 5.62) | 5.59 (5.59 · 5.60) | -0.03 | 0.01 | -4.24 | nicht langsamer |
| steht | Belegung p95 ms | 26.21 (25.45 · 26.97) | 23.03 (23.68 · 22.38) | -3.18 | 2.00 | -3.18 | nicht langsamer |
| steht | außer Takt p95 ms | 1.76 (1.81 · 1.71) | 1.73 (1.67 · 1.78) | -0.03 | 0.15 | -0.47 | nicht langsamer |
| steht | Lebenszyklus p95 ms | 0.10 (0.10 · 0.09) | 0.10 (0.10 · 0.10) | +0.01 | 0.01 | 1.00 | nicht langsamer |
| steht | über 33 ms % | – (– · –) | – (– · –) | – | – | – | – |
| steht | KI-Uhr Mittel ms | – (– · –) | – (– · –) | – | – | – | – |
| steht | KI-Uhr p95 ms | – (– · –) | – (– · –) | – | – | – | – |
| steht | KI-Uhr p99 ms | – (– · –) | – (– · –) | – | – | – | – |
| steht | KI-Takt EWMA ms | 0.20 (0.21 · 0.18) | 0.22 (0.20 · 0.24) | +0.02 | 0.05 | 1.00 | nicht langsamer |
| geht | fps | 24.7 (25.8 · 23.6) | 24.5 (24.4 · 24.7) | -0.2 | 2.2 | -0.14 | nicht langsamer |
| geht | Frame p50 ms | 33.3 (33.2 · 33.4) | 33.3 (33.3 · 33.3) | 0.0 | 0.2 | 0.00 | nicht langsamer |
| geht | Frame p95 ms | 95.8 (91.7 · 100.0) | 95.8 (91.6 · 99.9) | -0.1 | 11.7 | -0.02 | nicht langsamer |
| geht | Frame p99 ms | 187.4 (191.6 · 183.3) | 174.9 (166.6 · 183.2) | -12.6 | 18.6 | -1.35 | nicht langsamer |
| geht | CPU-Takt p50 ms | 29.20 (27.80 · 30.60) | 29.15 (29.80 · 28.50) | -0.05 | 3.09 | -0.03 | nicht langsamer |
| geht | CPU-Takt p95 ms | 90.9 (91.5 · 90.3) | 88.3 (87.6 · 89.0) | -2.6 | 1.8 | -2.82 | nicht langsamer |
| geht | CPU-Takt p99 ms | 177.0 (182.6 · 171.4) | 163.4 (153.9 · 172.8) | -13.6 | 22.0 | -1.24 | nicht langsamer |
| geht | GPU-Durchsatz p50 ms | 30.75 (28.60 · 32.90) | 31.00 (31.80 · 30.20) | +0.25 | 4.59 | 0.11 | nicht langsamer |
| geht | k0 p50 ms | 0.24 (0.25 · 0.24) | 0.24 (0.25 · 0.24) | 0.00 | 0.01 | 0.00 | nicht langsamer |
| geht | GPU p95 ms (lauf) | 3.06 (2.91 · 3.21) | 3.46 (3.69 · 3.23) | +0.40 | 0.55 | 1.46 | nicht langsamer |
| geht | GPU je Bild ms (gpu-bank) | – (– · –) | – (– · –) | – | – | – | – |
| geht | Belegung p50 ms | 31.31 (29.51 · 33.12) | 31.41 (32.34 · 30.48) | +0.10 | 4.06 | 0.05 | nicht langsamer |
| geht | Belegung p95 ms | 98.68 (96.28 · 101.08) | 94.03 (92.08 · 95.99) | -4.65 | 6.19 | -1.50 | nicht langsamer |
| geht | außer Takt p95 ms | 14.82 (13.63 · 16.02) | 13.96 (14.52 · 13.41) | -0.86 | 2.64 | -0.65 | nicht langsamer |
| geht | Lebenszyklus p95 ms | 0.22 (0.20 · 0.23) | 0.22 (0.22 · 0.22) | +0.00 | 0.03 | 0.33 | nicht langsamer |
| geht | über 33 ms % | – (– · –) | – (– · –) | – | – | – | – |
| geht | KI-Uhr Mittel ms | – (– · –) | – (– · –) | – | – | – | – |
| geht | KI-Uhr p95 ms | – (– · –) | – (– · –) | – | – | – | – |
| geht | KI-Uhr p99 ms | – (– · –) | – (– · –) | – | – | – | – |
| geht | KI-Takt EWMA ms | 2.73 (2.90 · 2.57) | 2.94 (3.07 · 2.82) | +0.21 | 0.41 | 1.01 | nicht langsamer |

**KERN-URTEIL GEHEN stadt** (steht + geht × fps · Frame p95 · CPU-Takt p95 · GPU je Bild (gpu-bank, nur steht) · Belegung p95; Δ ≤ max(2σ gepoolt, Auflösung)): nicht langsamer (8 Größen)
