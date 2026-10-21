## w-ego — je Boot

| Boot | Gang | fps | Frame p50 ms | Frame p95 ms | Frame p99 ms | CPU-Takt p50 ms | CPU-Takt p95 ms | CPU-Takt p99 ms | GPU-Durchsatz p50 ms | k0 p50 ms | GPU p95 ms (lauf) | GPU je Bild ms (gpu-bank) | Belegung p50 ms | Belegung p95 ms | außer Takt p95 ms | Lebenszyklus p95 ms | über 33 ms % | KI-Uhr Mittel ms | KI-Uhr p95 ms | KI-Uhr p99 ms | KI-Takt EWMA ms |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| w-ego-A1 | steht | 79.2 | 16.4 | 16.8 | 17.0 | 3.30 | 4.5 | 5.6 | 12.40 | 0.26 | 2.77 | 11.79 | 4.52 | 6.21 | 0.75 | 0.08 | – | 0.240 | 0.40 | 0.60 | 0.29 |
| w-ego-A1 | geht-1 | 61.8 | 16.6 | 25.1 | 33.5 | 11.10 | 18.8 | 33.9 | 15.60 | 0.24 | 2.66 | – | 15.05 | 21.43 | 1.86 | 0.09 | – | 0.202 | 0.30 | 0.50 | 0.29 |
| w-ego-A1 | Geher-Ende | { "ergebnis": { "s": -8.3, "wege": 2, "wegM": 128.3, "abwMaxM": 0, "takte": 3040 | | | | | | | | | | | | | | | | | | | |
| w-ego-A2 | steht | 78.9 | 16.5 | 16.7 | 17.0 | 3.60 | 4.6 | 6.5 | 12.50 | 0.26 | 2.65 | 11.87 | 4.90 | 6.55 | 0.79 | 0.09 | – | 0.227 | 0.40 | 0.50 | 0.33 |
| w-ego-A2 | geht-1 | 53.3 | 16.7 | 25.2 | 50.0 | 14.70 | 25.9 | 42.1 | 17.40 | 0.24 | 2.61 | – | 17.27 | 27.39 | 1.87 | 0.11 | – | 0.246 | 0.40 | 0.60 | 0.28 |
| w-ego-A2 | Geher-Ende | { "ergebnis": { "s": -8.3, "wege": 2, "wegM": 128.3, "abwMaxM": 0, "takte": 2123 | | | | | | | | | | | | | | | | | | | |
| w-ego-B1 | steht | 78.4 | 16.5 | 16.8 | 17.0 | 3.30 | 4.5 | 5.8 | 12.80 | 0.63 | 2.63 | 11.97 | 4.65 | 6.31 | 0.76 | 0.08 | – | 0.237 | 0.40 | 0.50 | 0.37 |
| w-ego-B1 | geht-1 | 61.7 | 16.6 | 25.1 | 33.6 | 11.30 | 18.9 | 32.3 | 15.50 | 0.24 | 2.67 | – | 15.04 | 21.76 | 1.77 | 0.09 | – | 0.198 | 0.30 | 0.50 | 0.31 |
| w-ego-B1 | Geher-Ende | { "ergebnis": { "s": -8.4, "wege": 2, "wegM": 128.4, "abwMaxM": 0, "takte": 2978 | | | | | | | | | | | | | | | | | | | |
| w-ego-B2 | steht | 78.6 | 16.5 | 16.8 | 17.0 | 3.30 | 4.8 | 6.3 | 12.60 | 0.26 | 2.64 | 11.98 | 4.68 | 6.61 | 0.81 | 0.08 | – | 0.254 | 0.40 | 0.50 | 0.36 |
| w-ego-B2 | geht-1 | 60.4 | 16.6 | 25.1 | 41.6 | 11.40 | 20.9 | 34.8 | 15.70 | 0.24 | 2.75 | – | 15.33 | 23.21 | 1.91 | 0.10 | – | 0.214 | 0.40 | 0.50 | 0.31 |
| w-ego-B2 | Geher-Ende | { "ergebnis": { "s": -8.4, "wege": 2, "wegM": 128.4, "abwMaxM": 0, "takte": 2905 | | | | | | | | | | | | | | | | | | | |

## Tier-Zensus je Boot (zensus-0 nach umstellen · zensus-1 nach geht-1)

- w-ego-A1: vorher 9 (fox 3, deer 4, bear 2; Würfe≥2 1: deer 4 Spanne 2.2 m @149.3 m; Verband-Feld true, Verbände≥2 1: deer 4 Spanne 2.2 m; Zustand {"-":9})
  nachher 9 (fox 3, deer 4, bear 2; Würfe≥2 1: deer 4 Spanne 2.8 m @142.6 m; Verband-Feld true, Verbände≥2 1: deer 4 Spanne 2.8 m; Zustand {"-":9})
- w-ego-A2: vorher 10 (fox 4, deer 4, bear 2; Würfe≥2 1: deer 4 Spanne 1.9 m @149.6 m; Verband-Feld true, Verbände≥2 1: deer 4 Spanne 1.9 m; Zustand {"-":10})
  nachher 10 (fox 4, deer 4, bear 2; Würfe≥2 1: deer 4 Spanne 2.6 m @142.7 m; Verband-Feld true, Verbände≥2 1: deer 4 Spanne 2.6 m; Zustand {"-":10})
- w-ego-B1: vorher 9 (fox 3, deer 4, bear 2; Würfe≥2 1: deer 4 Spanne 2.6 m @149.3 m; Verband-Feld true, Verbände≥2 1: deer 4 Spanne 2.6 m; Zustand {"-":9})
  nachher 9 (fox 3, deer 4, bear 2; Würfe≥2 1: deer 4 Spanne 2.8 m @142.6 m; Verband-Feld true, Verbände≥2 1: deer 4 Spanne 2.8 m; Zustand {"-":9})
- w-ego-B2: vorher 10 (fox 4, deer 4, bear 2; Würfe≥2 1: deer 4 Spanne 2.6 m @149 m; Verband-Feld true, Verbände≥2 1: deer 4 Spanne 2.6 m; Zustand {"-":10})
  nachher 10 (fox 4, deer 4, bear 2; Würfe≥2 1: deer 4 Spanne 2.8 m @142.6 m; Verband-Feld true, Verbände≥2 1: deer 4 Spanne 2.8 m; Zustand {"-":10})

## GPU-Takt je Boot (nvidia-smi 1 s, nur P0-Sekunden: Median-MHz · Anteil Drossel (Grund ≠ 0 ohne GpuIdle 0x1) · max °C)

- w-ego-A1: 142 s · 1721 MHz · Drossel 28 % · 86 °C
- w-ego-A2: 132 s · 1721 MHz · Drossel 31 % · 86 °C
- w-ego-B1: 144 s · 1708 MHz · Drossel 28 % · 86 °C
- w-ego-B2: 137 s · 1721 MHz · Drossel 22 % · 86 °C

## Mittel je Seite (A 32b37933 main · B 5951786f integ-probe; gehend = geht-1 je Boot)

| Gang | Größe | A | B | Δ B − A | 2σ | t (Welch) | Urteil |
|---|---|---|---|---|---|---|---|
| steht | fps | 79.1 (79.2 · 78.9) | 78.5 (78.4 · 78.6) | -0.6 | 0.4 | -3.05 | LANGSAMER |
| steht | Frame p50 ms | 16.4 (16.4 · 16.5) | 16.5 (16.5 · 16.5) | +0.1 | 0.1 | 1.00 | nicht langsamer |
| steht | Frame p95 ms | 16.8 (16.8 · 16.7) | 16.8 (16.8 · 16.8) | +0.1 | 0.1 | 1.00 | nicht langsamer |
| steht | Frame p99 ms | 17.0 (17.0 · 17.0) | 17.0 (17.0 · 17.0) | 0.0 | 0.0 | – | nicht langsamer |
| steht | CPU-Takt p50 ms | 3.45 (3.30 · 3.60) | 3.30 (3.30 · 3.30) | -0.15 | 0.30 | -1.00 | nicht langsamer |
| steht | CPU-Takt p95 ms | 4.5 (4.5 · 4.6) | 4.7 (4.5 · 4.8) | +0.1 | 0.3 | 0.63 | nicht langsamer |
| steht | CPU-Takt p99 ms | 6.0 (5.6 · 6.5) | 6.0 (5.8 · 6.3) | 0.0 | 1.0 | 0.00 | nicht langsamer |
| steht | GPU-Durchsatz p50 ms | 12.45 (12.40 · 12.50) | 12.70 (12.80 · 12.60) | +0.25 | 0.22 | 2.24 | LANGSAMER |
| steht | k0 p50 ms | 0.26 (0.26 · 0.26) | 0.45 (0.63 · 0.26) | +0.18 | 0.37 | 1.00 | nicht langsamer |
| steht | GPU p95 ms (lauf) | 2.71 (2.77 · 2.65) | 2.63 (2.63 · 2.64) | -0.08 | 0.12 | -1.25 | nicht langsamer |
| steht | GPU je Bild ms (gpu-bank) | 11.83 (11.79 · 11.87) | 11.98 (11.97 · 11.98) | +0.15 | 0.08 | 3.60 | LANGSAMER |
| steht | Belegung p50 ms | 4.71 (4.52 · 4.90) | 4.67 (4.65 · 4.68) | -0.04 | 0.38 | -0.24 | nicht langsamer |
| steht | Belegung p95 ms | 6.38 (6.21 · 6.55) | 6.46 (6.31 · 6.61) | +0.08 | 0.45 | 0.35 | nicht langsamer |
| steht | außer Takt p95 ms | 0.77 (0.75 · 0.79) | 0.79 (0.76 · 0.81) | +0.02 | 0.06 | 0.47 | nicht langsamer |
| steht | Lebenszyklus p95 ms | 0.08 (0.08 · 0.09) | 0.08 (0.08 · 0.08) | -0.00 | 0.01 | -1.00 | nicht langsamer |
| steht | über 33 ms % | – (– · –) | – (– · –) | – | – | – | – |
| steht | KI-Uhr Mittel ms | 0.233 (0.240 · 0.227) | 0.246 (0.237 · 0.254) | +0.012 | 0.021 | 1.15 | nicht langsamer |
| steht | KI-Uhr p95 ms | 0.40 (0.40 · 0.40) | 0.40 (0.40 · 0.40) | 0.00 | 0.00 | – | nicht langsamer |
| steht | KI-Uhr p99 ms | 0.55 (0.60 · 0.50) | 0.50 (0.50 · 0.50) | -0.05 | 0.10 | -1.00 | nicht langsamer |
| steht | KI-Takt EWMA ms | 0.31 (0.29 · 0.33) | 0.36 (0.37 · 0.36) | +0.05 | 0.04 | 2.67 | LANGSAMER |
| geht | fps | 57.5 (61.8 · 53.3) | 61.0 (61.7 · 60.4) | +3.5 | 8.6 | 0.81 | nicht langsamer |
| geht | Frame p50 ms | 16.6 (16.6 · 16.7) | 16.6 (16.6 · 16.6) | -0.0 | 0.1 | -1.00 | nicht langsamer |
| geht | Frame p95 ms | 25.1 (25.1 · 25.2) | 25.1 (25.1 · 25.1) | -0.0 | 0.1 | -1.00 | nicht langsamer |
| geht | Frame p99 ms | 41.8 (33.5 · 50.0) | 37.6 (33.6 · 41.6) | -4.1 | 18.3 | -0.45 | nicht langsamer |
| geht | CPU-Takt p50 ms | 12.90 (11.10 · 14.70) | 11.35 (11.30 · 11.40) | -1.55 | 3.60 | -0.86 | nicht langsamer |
| geht | CPU-Takt p95 ms | 22.4 (18.8 · 25.9) | 19.9 (18.9 · 20.9) | -2.5 | 7.4 | -0.66 | nicht langsamer |
| geht | CPU-Takt p99 ms | 38.0 (33.9 · 42.1) | 33.5 (32.3 · 34.8) | -4.5 | 8.6 | -1.04 | nicht langsamer |
| geht | GPU-Durchsatz p50 ms | 16.50 (15.60 · 17.40) | 15.60 (15.50 · 15.70) | -0.90 | 1.81 | -0.99 | nicht langsamer |
| geht | k0 p50 ms | 0.24 (0.24 · 0.24) | 0.24 (0.24 · 0.24) | 0.00 | 0.00 | – | nicht langsamer |
| geht | GPU p95 ms (lauf) | 2.63 (2.66 · 2.61) | 2.71 (2.67 · 2.75) | +0.08 | 0.09 | 1.59 | nicht langsamer |
| geht | GPU je Bild ms (gpu-bank) | – (– · –) | – (– · –) | – | – | – | – |
| geht | Belegung p50 ms | 16.16 (15.05 · 17.27) | 15.18 (15.04 · 15.33) | -0.98 | 2.24 | -0.87 | nicht langsamer |
| geht | Belegung p95 ms | 24.41 (21.43 · 27.39) | 22.48 (21.76 · 23.21) | -1.93 | 6.13 | -0.63 | nicht langsamer |
| geht | außer Takt p95 ms | 1.87 (1.86 · 1.87) | 1.84 (1.77 · 1.91) | -0.03 | 0.14 | -0.36 | nicht langsamer |
| geht | Lebenszyklus p95 ms | 0.10 (0.09 · 0.11) | 0.10 (0.09 · 0.10) | -0.01 | 0.02 | -0.45 | nicht langsamer |
| geht | über 33 ms % | – (– · –) | – (– · –) | – | – | – | – |
| geht | KI-Uhr Mittel ms | 0.224 (0.202 · 0.246) | 0.206 (0.198 · 0.214) | -0.018 | 0.046 | -0.78 | nicht langsamer |
| geht | KI-Uhr p95 ms | 0.35 (0.30 · 0.40) | 0.35 (0.30 · 0.40) | 0.00 | 0.14 | 0.00 | nicht langsamer |
| geht | KI-Uhr p99 ms | 0.55 (0.50 · 0.60) | 0.50 (0.50 · 0.50) | -0.05 | 0.10 | -1.00 | nicht langsamer |
| geht | KI-Takt EWMA ms | 0.29 (0.29 · 0.28) | 0.31 (0.31 · 0.31) | +0.02 | 0.01 | 5.00 | LANGSAMER |

**KERN-URTEIL GEHEN w-ego** (steht + geht × fps · Frame p95 · CPU-Takt p95 · GPU je Bild (gpu-bank, nur steht) · Belegung p95; Δ ≤ max(2σ gepoolt, Auflösung)): LANGSAMER an steht fps, steht GPU je Bild ms (gpu-bank) (9 Größen)
