## w-ego — je Boot

| Boot | Gang | fps | Frame p50 ms | Frame p95 ms | Frame p99 ms | CPU-Takt p50 ms | CPU-Takt p95 ms | CPU-Takt p99 ms | GPU-Durchsatz p50 ms | k0 p50 ms | GPU p95 ms (lauf) | GPU je Bild ms (gpu-bank) | Belegung p50 ms | Belegung p95 ms | außer Takt p95 ms | Lebenszyklus p95 ms | über 33 ms % | KI-Uhr Mittel ms | KI-Uhr p95 ms | KI-Uhr p99 ms | KI-Takt EWMA ms |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| w-ego-A1 | steht | 80.1 | 8.5 | 16.8 | 17.0 | 3.10 | 4.2 | 5.6 | 12.30 | 0.26 | 2.54 | 11.83 | 4.20 | 5.99 | 0.74 | 0.08 | – | 0.198 | 0.30 | 0.40 | 0.27 |
| w-ego-A1 | geht-1 | 61.7 | 16.6 | 25.1 | 33.5 | 11.30 | 19.7 | 33.1 | 15.50 | 0.24 | 2.71 | – | 15.06 | 21.93 | 1.86 | 0.10 | – | 0.209 | 0.40 | 0.50 | 0.34 |
| w-ego-A1 | Geher-Ende | { "ergebnis": { "s": -8.4, "wege": 2, "wegM": 128.4, "abwMaxM": 0, "takte": 2951 | | | | | | | | | | | | | | | | | | | |
| w-ego-A2 | steht | 79.6 | 10.6 | 16.8 | 17.0 | 3.20 | 4.3 | 5.6 | 12.30 | 0.26 | 2.67 | 11.79 | 4.23 | 5.96 | 0.72 | 0.08 | – | 0.211 | 0.40 | 0.50 | 0.29 |
| w-ego-A2 | geht-1 | 61.0 | 16.6 | 25.1 | 41.6 | 11.60 | 19.3 | 31.3 | 15.70 | 0.24 | 2.62 | – | 15.32 | 22.67 | 1.79 | 0.09 | – | 0.196 | 0.30 | 0.40 | 0.23 |
| w-ego-A2 | Geher-Ende | { "ergebnis": { "s": -8.4, "wege": 2, "wegM": 128.4, "abwMaxM": 0, "takte": 2896 | | | | | | | | | | | | | | | | | | | |
| w-ego-B1 | steht | 79.5 | 16.1 | 16.8 | 17.0 | 3.30 | 4.7 | 6.1 | 12.40 | 0.26 | 2.74 | 13.51 | 4.57 | 6.59 | 0.79 | 0.08 | – | 0.226 | 0.40 | 0.50 | 0.24 |
| w-ego-B1 | geht-1 | 61.7 | 16.6 | 25.1 | 41.6 | 11.20 | 19.2 | 31.0 | 15.50 | 0.24 | 2.57 | – | 15.08 | 21.99 | 1.84 | 0.09 | – | 0.193 | 0.30 | 0.40 | 0.29 |
| w-ego-B1 | Geher-Ende | { "ergebnis": { "s": -8.4, "wege": 2, "wegM": 128.4, "abwMaxM": 0, "takte": 2990 | | | | | | | | | | | | | | | | | | | |
| w-ego-B2 | steht | 80.3 | 8.5 | 16.8 | 17.1 | 3.00 | 3.9 | 5.1 | 12.30 | 0.62 | 2.43 | 11.58 | 3.92 | 5.57 | 0.69 | 0.08 | – | 0.196 | 0.30 | 0.50 | 0.23 |
| w-ego-B2 | geht-1 | 64.0 | 16.6 | 25.1 | 33.4 | 10.60 | 18.3 | 30.2 | 15.00 | 0.25 | 2.53 | – | 14.38 | 21.55 | 1.78 | 0.10 | – | 0.187 | 0.30 | 0.40 | 0.29 |
| w-ego-B2 | Geher-Ende | { "ergebnis": { "s": -8.4, "wege": 2, "wegM": 128.4, "abwMaxM": 0, "takte": 3186 | | | | | | | | | | | | | | | | | | | |

## Tier-Zensus je Boot (zensus-0 nach umstellen · zensus-1 nach geht-1)

- w-ego-A1: vorher 10 (fox 4, deer 4, bear 2; Würfe≥2 1: deer 4 Spanne 2.7 m @149.6 m; Verband-Feld true, Verbände≥2 1: deer 4 Spanne 2.7 m; Zustand {"-":10})
  nachher 10 (fox 4, deer 4, bear 2; Würfe≥2 1: deer 4 Spanne 2.9 m @142.7 m; Verband-Feld true, Verbände≥2 1: deer 4 Spanne 2.9 m; Zustand {"-":10})
- w-ego-A2: vorher 9 (fox 3, deer 4, bear 2; Würfe≥2 1: deer 4 Spanne 2.5 m @149.6 m; Verband-Feld true, Verbände≥2 1: deer 4 Spanne 2.5 m; Zustand {"-":9})
  nachher 9 (fox 3, deer 4, bear 2; Würfe≥2 1: deer 4 Spanne 2.8 m @142.7 m; Verband-Feld true, Verbände≥2 1: deer 4 Spanne 2.8 m; Zustand {"-":9})
- w-ego-B1: vorher 9 (fox 3, deer 4, bear 2; Würfe≥2 1: deer 4 Spanne 2.6 m @149.5 m; Verband-Feld true, Verbände≥2 1: deer 4 Spanne 2.6 m; Zustand {"-":9})
  nachher 9 (fox 3, deer 4, bear 2; Würfe≥2 1: deer 4 Spanne 2.8 m @142.6 m; Verband-Feld true, Verbände≥2 1: deer 4 Spanne 2.8 m; Zustand {"-":9})
- w-ego-B2: vorher 9 (fox 3, deer 4, bear 2; Würfe≥2 1: deer 4 Spanne 2.7 m @149.3 m; Verband-Feld true, Verbände≥2 1: deer 4 Spanne 2.7 m; Zustand {"-":9})
  nachher 9 (fox 3, deer 4, bear 2; Würfe≥2 1: deer 4 Spanne 2.8 m @142.6 m; Verband-Feld true, Verbände≥2 1: deer 4 Spanne 2.8 m; Zustand {"-":9})

## GPU-Takt je Boot (nvidia-smi 1 s, nur P0-Sekunden: Median-MHz · Anteil Drossel (Grund ≠ 0 ohne GpuIdle 0x1) · max °C)

- w-ego-A1: 140 s · 1708 MHz · Drossel 34 % · 86 °C
- w-ego-A2: 137 s · 1708 MHz · Drossel 30 % · 86 °C
- w-ego-B1: 137 s · 1708 MHz · Drossel 31 % · 86 °C
- w-ego-B2: 131 s · 1708 MHz · Drossel 31 % · 86 °C

## Mittel je Seite (A 5951786f · B 2160be58 integ-probe (erstes-haus + bewohner); gehend = geht-1 je Boot)

| Gang | Größe | A | B | Δ B − A | 2σ | t (Welch) | Urteil |
|---|---|---|---|---|---|---|---|
| steht | fps | 79.8 (80.1 · 79.6) | 79.9 (79.5 · 80.3) | +0.1 | 0.9 | 0.11 | nicht langsamer |
| steht | Frame p50 ms | 9.6 (8.5 · 10.6) | 12.3 (16.1 · 8.5) | +2.8 | 7.9 | 0.70 | nicht langsamer |
| steht | Frame p95 ms | 16.8 (16.8 · 16.8) | 16.8 (16.8 · 16.8) | 0.0 | 0.0 | – | nicht langsamer |
| steht | Frame p99 ms | 17.0 (17.0 · 17.0) | 17.1 (17.0 · 17.1) | +0.1 | 0.1 | 1.00 | nicht langsamer |
| steht | CPU-Takt p50 ms | 3.15 (3.10 · 3.20) | 3.15 (3.30 · 3.00) | -0.00 | 0.32 | -0.00 | nicht langsamer |
| steht | CPU-Takt p95 ms | 4.3 (4.2 · 4.3) | 4.3 (4.7 · 3.9) | +0.0 | 0.8 | 0.12 | nicht langsamer |
| steht | CPU-Takt p99 ms | 5.6 (5.6 · 5.6) | 5.6 (6.1 · 5.1) | 0.0 | 1.0 | 0.00 | nicht langsamer |
| steht | GPU-Durchsatz p50 ms | 12.30 (12.30 · 12.30) | 12.35 (12.40 · 12.30) | +0.05 | 0.10 | 1.00 | nicht langsamer |
| steht | k0 p50 ms | 0.26 (0.26 · 0.26) | 0.44 (0.26 · 0.62) | +0.18 | 0.36 | 1.00 | nicht langsamer |
| steht | GPU p95 ms (lauf) | 2.60 (2.54 · 2.67) | 2.58 (2.74 · 2.43) | -0.02 | 0.34 | -0.12 | nicht langsamer |
| steht | GPU je Bild ms (gpu-bank) | 11.81 (11.83 · 11.79) | 12.54 (13.51 · 11.58) | +0.74 | 1.93 | 0.76 | nicht langsamer |
| steht | Belegung p50 ms | 4.21 (4.20 · 4.23) | 4.25 (4.57 · 3.92) | +0.03 | 0.65 | 0.09 | nicht langsamer |
| steht | Belegung p95 ms | 5.97 (5.99 · 5.96) | 6.08 (6.59 · 5.57) | +0.11 | 1.02 | 0.21 | nicht langsamer |
| steht | außer Takt p95 ms | 0.73 (0.74 · 0.72) | 0.74 (0.79 · 0.69) | +0.01 | 0.10 | 0.20 | nicht langsamer |
| steht | Lebenszyklus p95 ms | 0.08 (0.08 · 0.08) | 0.08 (0.08 · 0.08) | 0.00 | 0.00 | – | nicht langsamer |
| steht | über 33 ms % | – (– · –) | – (– · –) | – | – | – | – |
| steht | KI-Uhr Mittel ms | 0.205 (0.198 · 0.211) | 0.211 (0.226 · 0.196) | +0.007 | 0.033 | 0.41 | nicht langsamer |
| steht | KI-Uhr p95 ms | 0.35 (0.30 · 0.40) | 0.35 (0.40 · 0.30) | 0.00 | 0.14 | 0.00 | nicht langsamer |
| steht | KI-Uhr p99 ms | 0.45 (0.40 · 0.50) | 0.50 (0.50 · 0.50) | +0.05 | 0.10 | 1.00 | nicht langsamer |
| steht | KI-Takt EWMA ms | 0.28 (0.27 · 0.29) | 0.23 (0.24 · 0.23) | -0.05 | 0.02 | -4.02 | nicht langsamer |
| geht | fps | 61.4 (61.7 · 61.0) | 62.9 (61.7 · 64.0) | +1.5 | 2.4 | 1.25 | nicht langsamer |
| geht | Frame p50 ms | 16.6 (16.6 · 16.6) | 16.6 (16.6 · 16.6) | 0.0 | 0.0 | – | nicht langsamer |
| geht | Frame p95 ms | 25.1 (25.1 · 25.1) | 25.1 (25.1 · 25.1) | 0.0 | 0.0 | – | nicht langsamer |
| geht | Frame p99 ms | 37.5 (33.5 · 41.6) | 37.5 (41.6 · 33.4) | -0.0 | 11.5 | -0.01 | nicht langsamer |
| geht | CPU-Takt p50 ms | 11.45 (11.30 · 11.60) | 10.90 (11.20 · 10.60) | -0.55 | 0.67 | -1.64 | nicht langsamer |
| geht | CPU-Takt p95 ms | 19.5 (19.7 · 19.3) | 18.8 (19.2 · 18.3) | -0.8 | 1.0 | -1.52 | nicht langsamer |
| geht | CPU-Takt p99 ms | 32.2 (33.1 · 31.3) | 30.6 (31.0 · 30.2) | -1.6 | 2.0 | -1.62 | nicht langsamer |
| geht | GPU-Durchsatz p50 ms | 15.60 (15.50 · 15.70) | 15.25 (15.50 · 15.00) | -0.35 | 0.54 | -1.30 | nicht langsamer |
| geht | k0 p50 ms | 0.24 (0.24 · 0.24) | 0.24 (0.24 · 0.25) | +0.01 | 0.01 | 1.00 | nicht langsamer |
| geht | GPU p95 ms (lauf) | 2.67 (2.71 · 2.62) | 2.55 (2.57 · 2.53) | -0.12 | 0.10 | -2.34 | nicht langsamer |
| geht | GPU je Bild ms (gpu-bank) | – (– · –) | – (– · –) | – | – | – | – |
| geht | Belegung p50 ms | 15.19 (15.06 · 15.32) | 14.73 (15.08 · 14.38) | -0.46 | 0.75 | -1.23 | nicht langsamer |
| geht | Belegung p95 ms | 22.30 (21.93 · 22.67) | 21.77 (21.99 · 21.55) | -0.53 | 0.86 | -1.23 | nicht langsamer |
| geht | außer Takt p95 ms | 1.83 (1.86 · 1.79) | 1.81 (1.84 · 1.78) | -0.02 | 0.09 | -0.33 | nicht langsamer |
| geht | Lebenszyklus p95 ms | 0.10 (0.10 · 0.09) | 0.10 (0.09 · 0.10) | 0.00 | 0.01 | 0.00 | nicht langsamer |
| geht | über 33 ms % | – (– · –) | – (– · –) | – | – | – | – |
| geht | KI-Uhr Mittel ms | 0.203 (0.209 · 0.196) | 0.190 (0.193 · 0.187) | -0.013 | 0.015 | -1.73 | nicht langsamer |
| geht | KI-Uhr p95 ms | 0.35 (0.40 · 0.30) | 0.30 (0.30 · 0.30) | -0.05 | 0.10 | -1.00 | nicht langsamer |
| geht | KI-Uhr p99 ms | 0.45 (0.50 · 0.40) | 0.40 (0.40 · 0.40) | -0.05 | 0.10 | -1.00 | nicht langsamer |
| geht | KI-Takt EWMA ms | 0.29 (0.34 · 0.23) | 0.29 (0.29 · 0.29) | +0.00 | 0.11 | 0.09 | nicht langsamer |

**KERN-URTEIL GEHEN w-ego** (steht + geht × fps · Frame p95 · CPU-Takt p95 · GPU je Bild (gpu-bank, nur steht) · Belegung p95; Δ ≤ max(2σ gepoolt, Auflösung)): nicht langsamer (9 Größen)
