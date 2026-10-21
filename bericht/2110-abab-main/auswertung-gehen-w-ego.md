## w-ego — je Boot

| Boot | Gang | fps | Frame p50 ms | Frame p95 ms | Frame p99 ms | CPU-Takt p50 ms | CPU-Takt p95 ms | CPU-Takt p99 ms | GPU-Durchsatz p50 ms | k0 p50 ms | GPU p95 ms (lauf) | GPU je Bild ms (gpu-bank) | Belegung p50 ms | Belegung p95 ms | außer Takt p95 ms | Lebenszyklus p95 ms | über 33 ms % | KI-Uhr Mittel ms | KI-Uhr p95 ms | KI-Uhr p99 ms | KI-Takt EWMA ms |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| w-ego-A1 | steht | 79.5 | 15.9 | 16.8 | 17.0 | 3.20 | 4.4 | 5.7 | – | 0.26 | 2.74 | 11.86 | 4.43 | 6.09 | 0.73 | 0.08 | – | 0.215 | 0.40 | 0.50 | 0.26 |
| w-ego-A1 | geht-1 | 61.9 | 16.7 | 25.1 | 41.6 | 10.70 | 19.0 | 38.6 | – | 0.25 | 2.67 | – | 14.64 | 21.35 | 1.85 | 0.10 | – | 0.198 | 0.30 | 0.50 | 0.30 |
| w-ego-A1 | Geher-Ende | { "ergebnis": { "s": -8.1, "wege": 2, "wegM": 128.1, "abwMaxM": 0, "takte": 3051 | | | | | | | | | | | | | | | | | | | |
| w-ego-A2 | steht | 79.5 | 14.0 | 16.8 | 17.0 | 3.30 | 4.6 | 5.9 | – | 0.26 | 2.67 | 11.78 | 4.54 | 6.34 | 0.80 | 0.08 | – | 0.230 | 0.40 | 0.50 | 0.28 |
| w-ego-A2 | geht-1 | 62.0 | 16.6 | 25.1 | 41.8 | 10.70 | 18.8 | 33.7 | – | 0.24 | 2.71 | – | 14.65 | 21.66 | 1.85 | 0.10 | – | 0.204 | 0.30 | 0.40 | 0.39 |
| w-ego-A2 | Geher-Ende | { "ergebnis": { "s": -8.4, "wege": 2, "wegM": 128.4, "abwMaxM": 0, "takte": 3133 | | | | | | | | | | | | | | | | | | | |
| w-ego-B1 | steht | 79.4 | 16.4 | 16.8 | 17.0 | 3.20 | 4.3 | 5.8 | 12.40 | 0.26 | 2.64 | 11.78 | 4.42 | 6.02 | 0.74 | 0.08 | – | 0.240 | 0.40 | 0.50 | 0.26 |
| w-ego-B1 | geht-1 | 62.1 | 16.6 | 25.1 | 33.5 | 11.00 | 18.8 | 31.0 | 15.50 | 0.25 | 2.55 | – | 14.94 | 21.53 | 1.77 | 0.09 | – | 0.204 | 0.30 | 0.50 | 0.34 |
| w-ego-B1 | Geher-Ende | { "ergebnis": { "s": -8.4, "wege": 2, "wegM": 128.4, "abwMaxM": 0, "takte": 3074 | | | | | | | | | | | | | | | | | | | |
| w-ego-B2 | steht | 80.1 | 8.6 | 16.8 | 17.1 | 3.20 | 4.4 | 5.4 | 12.30 | 0.26 | 2.67 | 11.66 | 4.26 | 6.04 | 0.73 | 0.08 | – | 0.218 | 0.40 | 0.50 | 0.24 |
| w-ego-B2 | geht-1 | 62.4 | 16.6 | 25.1 | 33.4 | 11.00 | 18.3 | 29.9 | 15.40 | 0.24 | 2.66 | – | 14.88 | 21.44 | 1.82 | 0.10 | – | 0.194 | 0.30 | 0.40 | 0.31 |
| w-ego-B2 | Geher-Ende | { "ergebnis": { "s": -8.4, "wege": 2, "wegM": 128.4, "abwMaxM": 0, "takte": 3071 | | | | | | | | | | | | | | | | | | | |

## Tier-Zensus je Boot (zensus-0 nach umstellen · zensus-1 nach geht-1)

- w-ego-A1: vorher 9 (fox 3, deer 4, bear 2; Würfe≥2 1: deer 4 Spanne 2.3 m @149.7 m; Verband-Feld true, Verbände≥2 1: deer 4 Spanne 2.3 m; Zustand {"-":9})
  nachher 9 (fox 3, deer 4, bear 2; Würfe≥2 1: deer 4 Spanne 2.8 m @143 m; Verband-Feld true, Verbände≥2 1: deer 4 Spanne 2.8 m; Zustand {"-":9})
- w-ego-A2: vorher 10 (fox 4, deer 4, bear 2; Würfe≥2 1: deer 4 Spanne 2.6 m @149.5 m; Verband-Feld true, Verbände≥2 1: deer 4 Spanne 2.6 m; Zustand {"-":10})
  nachher 10 (fox 4, deer 4, bear 2; Würfe≥2 1: deer 4 Spanne 2.8 m @142.7 m; Verband-Feld true, Verbände≥2 1: deer 4 Spanne 2.8 m; Zustand {"-":10})
- w-ego-B1: vorher 9 (fox 3, deer 4, bear 2; Würfe≥2 1: deer 4 Spanne 1.9 m @149.6 m; Verband-Feld true, Verbände≥2 1: deer 4 Spanne 1.9 m; Zustand {"-":9})
  nachher 9 (fox 3, deer 4, bear 2; Würfe≥2 1: deer 4 Spanne 2.6 m @142.5 m; Verband-Feld true, Verbände≥2 1: deer 4 Spanne 2.6 m; Zustand {"-":9})
- w-ego-B2: vorher 9 (fox 3, deer 4, bear 2; Würfe≥2 1: deer 4 Spanne 2.7 m @149.4 m; Verband-Feld true, Verbände≥2 1: deer 4 Spanne 2.7 m; Zustand {"-":9})
  nachher 9 (fox 3, deer 4, bear 2; Würfe≥2 1: deer 4 Spanne 2.8 m @142.6 m; Verband-Feld true, Verbände≥2 1: deer 4 Spanne 2.8 m; Zustand {"-":9})

## GPU-Takt je Boot (nvidia-smi 1 s, nur P0-Sekunden: Median-MHz · Anteil Drossel (Grund ≠ 0 ohne GpuIdle 0x1) · max °C)

- w-ego-A1: 141 s · 1708 MHz · Drossel 29 % · 86 °C
- w-ego-A2: 140 s · 1708 MHz · Drossel 31 % · 86 °C
- w-ego-B1: 132 s · 1721 MHz · Drossel 27 % · 86 °C
- w-ego-B2: 130 s · 1721 MHz · Drossel 28 % · 86 °C

## Mittel je Seite (A d3a626ee main · B 1011d41d integ-probe; gehend = geht-1 je Boot)

| Gang | Größe | A | B | Δ B − A | 2σ | t (Welch) | Urteil |
|---|---|---|---|---|---|---|---|
| steht | fps | 79.5 (79.5 · 79.5) | 79.8 (79.4 · 80.1) | +0.3 | 0.7 | 0.71 | nicht langsamer |
| steht | Frame p50 ms | 14.9 (15.9 · 14.0) | 12.5 (16.4 · 8.6) | -2.4 | 8.0 | -0.61 | nicht langsamer |
| steht | Frame p95 ms | 16.8 (16.8 · 16.8) | 16.8 (16.8 · 16.8) | 0.0 | 0.0 | – | nicht langsamer |
| steht | Frame p99 ms | 17.0 (17.0 · 17.0) | 17.1 (17.0 · 17.1) | +0.1 | 0.1 | 1.00 | nicht langsamer |
| steht | CPU-Takt p50 ms | 3.25 (3.20 · 3.30) | 3.20 (3.20 · 3.20) | -0.05 | 0.10 | -1.00 | nicht langsamer |
| steht | CPU-Takt p95 ms | 4.5 (4.4 · 4.6) | 4.3 (4.3 · 4.4) | -0.2 | 0.2 | -1.34 | nicht langsamer |
| steht | CPU-Takt p99 ms | 5.8 (5.7 · 5.9) | 5.6 (5.8 · 5.4) | -0.2 | 0.4 | -0.89 | nicht langsamer |
| steht | GPU-Durchsatz p50 ms | – (– · –) | 12.35 (12.40 · 12.30) | – | – | – | – |
| steht | k0 p50 ms | 0.26 (0.26 · 0.26) | 0.26 (0.26 · 0.26) | 0.00 | 0.00 | – | nicht langsamer |
| steht | GPU p95 ms (lauf) | 2.71 (2.74 · 2.67) | 2.66 (2.64 · 2.67) | -0.05 | 0.08 | -1.31 | nicht langsamer |
| steht | GPU je Bild ms (gpu-bank) | 11.82 (11.86 · 11.78) | 11.72 (11.78 · 11.66) | -0.10 | 0.14 | -1.39 | nicht langsamer |
| steht | Belegung p50 ms | 4.48 (4.43 · 4.54) | 4.34 (4.42 · 4.26) | -0.14 | 0.19 | -1.49 | nicht langsamer |
| steht | Belegung p95 ms | 6.21 (6.09 · 6.34) | 6.03 (6.02 · 6.04) | -0.19 | 0.25 | -1.48 | nicht langsamer |
| steht | außer Takt p95 ms | 0.77 (0.73 · 0.80) | 0.73 (0.74 · 0.73) | -0.03 | 0.07 | -0.85 | nicht langsamer |
| steht | Lebenszyklus p95 ms | 0.08 (0.08 · 0.08) | 0.08 (0.08 · 0.08) | 0.00 | 0.00 | – | nicht langsamer |
| steht | über 33 ms % | – (– · –) | – (– · –) | – | – | – | – |
| steht | KI-Uhr Mittel ms | 0.223 (0.215 · 0.230) | 0.229 (0.240 · 0.218) | +0.006 | 0.026 | 0.46 | nicht langsamer |
| steht | KI-Uhr p95 ms | 0.40 (0.40 · 0.40) | 0.40 (0.40 · 0.40) | 0.00 | 0.00 | – | nicht langsamer |
| steht | KI-Uhr p99 ms | 0.50 (0.50 · 0.50) | 0.50 (0.50 · 0.50) | 0.00 | 0.00 | – | nicht langsamer |
| steht | KI-Takt EWMA ms | 0.27 (0.26 · 0.28) | 0.25 (0.26 · 0.24) | -0.02 | 0.03 | -1.41 | nicht langsamer |
| geht | fps | 62.0 (61.9 · 62.0) | 62.3 (62.1 · 62.4) | +0.3 | 0.3 | 1.90 | nicht langsamer |
| geht | Frame p50 ms | 16.6 (16.7 · 16.6) | 16.6 (16.6 · 16.6) | -0.0 | 0.1 | -1.00 | nicht langsamer |
| geht | Frame p95 ms | 25.1 (25.1 · 25.1) | 25.1 (25.1 · 25.1) | 0.0 | 0.0 | – | nicht langsamer |
| geht | Frame p99 ms | 41.7 (41.6 · 41.8) | 33.5 (33.5 · 33.4) | -8.3 | 0.2 | -73.79 | nicht langsamer |
| geht | CPU-Takt p50 ms | 10.70 (10.70 · 10.70) | 11.00 (11.00 · 11.00) | +0.30 | 0.00 | – | LANGSAMER |
| geht | CPU-Takt p95 ms | 18.9 (19.0 · 18.8) | 18.6 (18.8 · 18.3) | -0.3 | 0.5 | -1.30 | nicht langsamer |
| geht | CPU-Takt p99 ms | 36.2 (38.6 · 33.7) | 30.4 (31.0 · 29.9) | -5.7 | 5.0 | -2.27 | nicht langsamer |
| geht | GPU-Durchsatz p50 ms | – (– · –) | 15.45 (15.50 · 15.40) | – | – | – | – |
| geht | k0 p50 ms | 0.24 (0.25 · 0.24) | 0.24 (0.25 · 0.24) | 0.00 | 0.01 | 0.00 | nicht langsamer |
| geht | GPU p95 ms (lauf) | 2.69 (2.67 · 2.71) | 2.60 (2.55 · 2.66) | -0.08 | 0.12 | -1.45 | nicht langsamer |
| geht | GPU je Bild ms (gpu-bank) | – (– · –) | – (– · –) | – | – | – | – |
| geht | Belegung p50 ms | 14.64 (14.64 · 14.65) | 14.91 (14.94 · 14.88) | +0.27 | 0.06 | 8.71 | LANGSAMER |
| geht | Belegung p95 ms | 21.51 (21.35 · 21.66) | 21.48 (21.53 · 21.44) | -0.02 | 0.32 | -0.12 | nicht langsamer |
| geht | außer Takt p95 ms | 1.85 (1.85 · 1.85) | 1.79 (1.77 · 1.82) | -0.06 | 0.05 | -2.20 | nicht langsamer |
| geht | Lebenszyklus p95 ms | 0.10 (0.10 · 0.10) | 0.10 (0.09 · 0.10) | -0.01 | 0.01 | -1.00 | nicht langsamer |
| geht | über 33 ms % | – (– · –) | – (– · –) | – | – | – | – |
| geht | KI-Uhr Mittel ms | 0.201 (0.198 · 0.204) | 0.199 (0.204 · 0.194) | -0.002 | 0.011 | -0.39 | nicht langsamer |
| geht | KI-Uhr p95 ms | 0.30 (0.30 · 0.30) | 0.30 (0.30 · 0.30) | 0.00 | 0.00 | – | nicht langsamer |
| geht | KI-Uhr p99 ms | 0.45 (0.50 · 0.40) | 0.45 (0.50 · 0.40) | 0.00 | 0.14 | 0.00 | nicht langsamer |
| geht | KI-Takt EWMA ms | 0.34 (0.30 · 0.39) | 0.33 (0.34 · 0.31) | -0.02 | 0.09 | -0.42 | nicht langsamer |

**KERN-URTEIL GEHEN w-ego** (steht + geht × fps · Frame p95 · CPU-Takt p95 · GPU je Bild (gpu-bank, nur steht) · Belegung p95; Δ ≤ max(2σ gepoolt, Auflösung)): nicht langsamer (9 Größen)
