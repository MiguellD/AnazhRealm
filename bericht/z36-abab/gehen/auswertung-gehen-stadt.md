## stadt — je Boot

| Boot | Gang | fps | Frame p50 ms | Frame p95 ms | Frame p99 ms | CPU-Takt p50 ms | CPU-Takt p95 ms | CPU-Takt p99 ms | GPU-Durchsatz p50 ms | k0 p50 ms | GPU p95 ms (lauf) | GPU je Bild ms (gpu-bank) | Belegung p50 ms | Belegung p95 ms | außer Takt p95 ms | Lebenszyklus p95 ms | über 33 ms % | KI-Uhr Mittel ms | KI-Uhr p95 ms | KI-Uhr p99 ms | KI-Takt EWMA ms |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| stadt-A1 | steht | 47.8 | 16.6 | 41.7 | 233.3 | 4.40 | 33.8 | 71.3 | 12.80 | 0.11 | 4.68 | – | 6.20 | 41.14 | 1.80 | 0.11 | – | – | – | – | 0.38 |
| stadt-A1 | geht-1 | 20.4 | 33.8 | 116.8 | 216.8 | 34.40 | 110.0 | 198.9 | 35.40 | 0.23 | 2.80 | – | 37.35 | 124.61 | 18.00 | 0.25 | – | – | – | – | 78.05 |
| stadt-A1 | Geher-Ende |  | | | | | | | | | | | | | | | | | | | |
| stadt-A2 | steht | 48.5 | 16.6 | 33.4 | 283.3 | 4.20 | 30.6 | 68.2 | 12.80 | 0.11 | 4.99 | – | 6.09 | 36.52 | 1.92 | 0.11 | – | – | – | – | 0.35 |
| stadt-A2 | geht-1 | 20.6 | 33.4 | 116.8 | 233.3 | 33.50 | 107.1 | 220.3 | 35.50 | 0.24 | 2.80 | – | 36.31 | 116.62 | 16.02 | 0.24 | – | – | – | – | 102.39 |
| stadt-A2 | Geher-Ende |  | | | | | | | | | | | | | | | | | | | |
| stadt-B1 | steht | 50.9 | 16.6 | 33.4 | 149.9 | 4.30 | 30.0 | 71.7 | 12.90 | 0.11 | 2.08 | – | 6.38 | 35.11 | 1.63 | 0.10 | – | – | – | – | 0.36 |
| stadt-B1 | geht-1 | 20.7 | 33.5 | 116.8 | 200.0 | 33.70 | 109.3 | 181.6 | 35.30 | 0.21 | 2.96 | – | 36.25 | 115.35 | 14.83 | 0.24 | – | – | – | – | 20.84 |
| stadt-B1 | Geher-Ende |  | | | | | | | | | | | | | | | | | | | |
| stadt-B2 | steht | 50.2 | 16.6 | 33.5 | 183.4 | 4.20 | 30.8 | 68.8 | 12.70 | 0.11 | 3.88 | – | 6.04 | 36.30 | 1.75 | 0.10 | – | – | – | – | 0.32 |
| stadt-B2 | geht-1 | 21.5 | 33.3 | 116.6 | 200.0 | 30.50 | 110.3 | 177.3 | 30.90 | 0.20 | 3.26 | – | 31.96 | 120.34 | 15.24 | 0.21 | – | – | – | – | 99.38 |
| stadt-B2 | Geher-Ende |  | | | | | | | | | | | | | | | | | | | |

## Tier-Zensus je Boot (zensus-0 nach umstellen · zensus-1 nach geht-1)

- stadt-A1: vorher 0 (; Würfe≥2 0: ; Verband-Feld false, Verbände≥2 0: ; Zustand {})
  nachher 6 (deer 5, fox 1; Würfe≥2 1: deer 5 Spanne 2.8 m @177.7 m; Verband-Feld true, Verbände≥2 1: deer 5 Spanne 2.8 m; Zustand {"-":6})
- stadt-A2: vorher 0 (; Würfe≥2 0: ; Verband-Feld false, Verbände≥2 0: ; Zustand {})
  nachher 6 (deer 5, fox 1; Würfe≥2 1: deer 5 Spanne 2.8 m @177.7 m; Verband-Feld true, Verbände≥2 1: deer 5 Spanne 2.8 m; Zustand {"-":6})
- stadt-B1: vorher 0 (; Würfe≥2 0: ; Verband-Feld false, Verbände≥2 0: ; Zustand {})
  nachher 6 (deer 5, fox 1; Würfe≥2 1: deer 5 Spanne 2.8 m @177.7 m; Verband-Feld true, Verbände≥2 1: deer 5 Spanne 2.8 m; Zustand {"-":6})
- stadt-B2: vorher 0 (; Würfe≥2 0: ; Verband-Feld false, Verbände≥2 0: ; Zustand {})
  nachher 6 (deer 5, fox 1; Würfe≥2 1: deer 5 Spanne 2.8 m @177.7 m; Verband-Feld true, Verbände≥2 1: deer 5 Spanne 2.8 m; Zustand {"-":6})

## GPU-Takt je Boot (nvidia-smi 1 s, nur P0-Sekunden: Median-MHz · Anteil Drossel (Grund ≠ 0 ohne GpuIdle 0x1) · max °C)

- stadt-A1: 78 s · 1809 MHz · Drossel 15 % · 82 °C
- stadt-A2: 102 s · 1784 MHz · Drossel 7 % · 82 °C
- stadt-B1: 93 s · 1695 MHz · Drossel 6 % · 82 °C
- stadt-B2: 82 s · 1733 MHz · Drossel 10 % · 81 °C

## Mittel je Seite (A 8dff8f15 · B eeaff9d6; gehend = geht-1 je Boot)

| Gang | Größe | A | B | Δ B − A | 2σ | t (Welch) | Urteil |
|---|---|---|---|---|---|---|---|
| steht | fps | 48.1 (47.8 · 48.5) | 50.5 (50.9 · 50.2) | +2.4 | 1.0 | 4.85 | nicht langsamer |
| steht | Frame p50 ms | 16.6 (16.6 · 16.6) | 16.6 (16.6 · 16.6) | 0.0 | 0.0 | – | nicht langsamer |
| steht | Frame p95 ms | 37.5 (41.7 · 33.4) | 33.5 (33.4 · 33.5) | -4.1 | 8.3 | -0.99 | nicht langsamer |
| steht | Frame p99 ms | 258.3 (233.3 · 283.3) | 166.7 (149.9 · 183.4) | -91.7 | 60.2 | -3.05 | nicht langsamer |
| steht | CPU-Takt p50 ms | 4.30 (4.40 · 4.20) | 4.25 (4.30 · 4.20) | -0.05 | 0.22 | -0.45 | nicht langsamer |
| steht | CPU-Takt p95 ms | 32.2 (33.8 · 30.6) | 30.4 (30.0 · 30.8) | -1.8 | 3.3 | -1.09 | nicht langsamer |
| steht | CPU-Takt p99 ms | 69.8 (71.3 · 68.2) | 70.3 (71.7 · 68.8) | +0.5 | 4.2 | 0.24 | nicht langsamer |
| steht | GPU-Durchsatz p50 ms | 12.80 (12.80 · 12.80) | 12.80 (12.90 · 12.70) | 0.00 | 0.20 | 0.00 | nicht langsamer |
| steht | k0 p50 ms | 0.11 (0.11 · 0.11) | 0.11 (0.11 · 0.11) | 0.00 | 0.00 | – | nicht langsamer |
| steht | GPU p95 ms (lauf) | 4.83 (4.68 · 4.99) | 2.98 (2.08 · 3.88) | -1.85 | 1.83 | -2.03 | nicht langsamer |
| steht | GPU je Bild ms (gpu-bank) | – (– · –) | – (– · –) | – | – | – | – |
| steht | Belegung p50 ms | 6.14 (6.20 · 6.09) | 6.21 (6.38 · 6.04) | +0.07 | 0.36 | 0.36 | nicht langsamer |
| steht | Belegung p95 ms | 38.83 (41.14 · 36.52) | 35.70 (35.11 · 36.30) | -3.13 | 4.77 | -1.31 | nicht langsamer |
| steht | außer Takt p95 ms | 1.86 (1.80 · 1.92) | 1.69 (1.63 · 1.75) | -0.17 | 0.17 | -2.00 | nicht langsamer |
| steht | Lebenszyklus p95 ms | 0.11 (0.11 · 0.11) | 0.10 (0.10 · 0.10) | -0.01 | 0.00 | – | nicht langsamer |
| steht | über 33 ms % | – (– · –) | – (– · –) | – | – | – | – |
| steht | KI-Uhr Mittel ms | – (– · –) | – (– · –) | – | – | – | – |
| steht | KI-Uhr p95 ms | – (– · –) | – (– · –) | – | – | – | – |
| steht | KI-Uhr p99 ms | – (– · –) | – (– · –) | – | – | – | – |
| steht | KI-Takt EWMA ms | 0.36 (0.38 · 0.35) | 0.34 (0.36 · 0.32) | -0.03 | 0.05 | -1.00 | nicht langsamer |
| geht | fps | 20.5 (20.4 · 20.6) | 21.1 (20.7 · 21.5) | +0.6 | 0.8 | 1.46 | nicht langsamer |
| geht | Frame p50 ms | 33.6 (33.8 · 33.4) | 33.4 (33.5 · 33.3) | -0.2 | 0.4 | -0.89 | nicht langsamer |
| geht | Frame p95 ms | 116.8 (116.8 · 116.8) | 116.7 (116.8 · 116.6) | -0.1 | 0.2 | -1.00 | nicht langsamer |
| geht | Frame p99 ms | 225.1 (216.8 · 233.3) | 200.0 (200.0 · 200.0) | -25.1 | 16.5 | -3.04 | nicht langsamer |
| geht | CPU-Takt p50 ms | 33.95 (34.40 · 33.50) | 32.10 (33.70 · 30.50) | -1.85 | 3.32 | -1.11 | nicht langsamer |
| geht | CPU-Takt p95 ms | 108.5 (110.0 · 107.1) | 109.8 (109.3 · 110.3) | +1.3 | 3.1 | 0.81 | nicht langsamer |
| geht | CPU-Takt p99 ms | 209.6 (198.9 · 220.3) | 179.4 (181.6 · 177.3) | -30.2 | 21.8 | -2.76 | nicht langsamer |
| geht | GPU-Durchsatz p50 ms | 35.45 (35.40 · 35.50) | 33.10 (35.30 · 30.90) | -2.35 | 4.40 | -1.07 | nicht langsamer |
| geht | k0 p50 ms | 0.23 (0.23 · 0.24) | 0.21 (0.21 · 0.20) | -0.03 | 0.01 | -4.24 | nicht langsamer |
| geht | GPU p95 ms (lauf) | 2.80 (2.80 · 2.80) | 3.11 (2.96 · 3.26) | +0.31 | 0.30 | 2.07 | LANGSAMER |
| geht | GPU je Bild ms (gpu-bank) | – (– · –) | – (– · –) | – | – | – | – |
| geht | Belegung p50 ms | 36.83 (37.35 · 36.31) | 34.11 (36.25 · 31.96) | -2.72 | 4.41 | -1.23 | nicht langsamer |
| geht | Belegung p95 ms | 120.62 (124.61 · 116.62) | 117.84 (115.35 · 120.34) | -2.77 | 9.42 | -0.59 | nicht langsamer |
| geht | außer Takt p95 ms | 17.01 (18.00 · 16.02) | 15.04 (14.83 · 15.24) | -1.97 | 2.02 | -1.95 | nicht langsamer |
| geht | Lebenszyklus p95 ms | 0.24 (0.25 · 0.24) | 0.22 (0.24 · 0.21) | -0.02 | 0.03 | -1.26 | nicht langsamer |
| geht | über 33 ms % | – (– · –) | – (– · –) | – | – | – | – |
| geht | KI-Uhr Mittel ms | – (– · –) | – (– · –) | – | – | – | – |
| geht | KI-Uhr p95 ms | – (– · –) | – (– · –) | – | – | – | – |
| geht | KI-Uhr p99 ms | – (– · –) | – (– · –) | – | – | – | – |
| geht | KI-Takt EWMA ms | 90.22 (78.05 · 102.39) | 60.11 (20.84 · 99.38) | -30.11 | 82.23 | -0.73 | nicht langsamer |

**KERN-URTEIL GEHEN stadt** (steht + geht × fps · Frame p95 · CPU-Takt p95 · GPU je Bild (gpu-bank, nur steht) · Belegung p95; Δ ≤ max(2σ gepoolt, Auflösung)): nicht langsamer (8 Größen)
