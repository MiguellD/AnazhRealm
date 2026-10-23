## g-third — je Boot

| Boot | Gang | fps | Frame p50 ms | Frame p95 ms | Frame p99 ms | CPU-Takt p50 ms | CPU-Takt p95 ms | CPU-Takt p99 ms | GPU-Durchsatz p50 ms | k0 p50 ms | GPU p95 ms (lauf) | GPU je Bild ms (gpu-bank) | Belegung p50 ms | Belegung p95 ms | außer Takt p95 ms | Lebenszyklus p95 ms | über 33 ms % | KI-Uhr Mittel ms | KI-Uhr p95 ms | KI-Uhr p99 ms | KI-Takt EWMA ms |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| g-third-A1 | steht | 79.5 | 16.4 | 16.7 | 16.8 | 4.80 | 6.5 | 7.8 | 12.70 | 0.19 | 2.36 | 11.45 | 6.20 | 8.68 | 0.83 | 0.09 | – | – | – | – | 0.41 |
| g-third-A1 | geht-1 | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – |
| g-third-A1 | Geher-Ende |  | | | | | | | | | | | | | | | | | | | |
| g-third-A2 | steht | 80.5 | 8.6 | 16.8 | 17.0 | 4.30 | 5.5 | 6.3 | 12.30 | 0.19 | 2.21 | 11.48 | 5.49 | 7.05 | 0.70 | 0.07 | – | – | – | – | 0.35 |
| g-third-A2 | geht-1 | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – |
| g-third-A2 | Geher-Ende |  | | | | | | | | | | | | | | | | | | | |
| g-third-B1 | steht | 80.1 | 8.7 | 16.8 | 17.0 | 4.30 | 5.8 | 7.1 | 12.50 | 0.19 | 2.12 | 11.22 | 5.60 | 7.46 | 0.72 | 0.08 | – | – | – | – | 0.34 |
| g-third-B1 | geht-1 | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – |
| g-third-B1 | Geher-Ende |  | | | | | | | | | | | | | | | | | | | |
| g-third-B2 | steht | 80.2 | 8.7 | 16.8 | 17.0 | 4.50 | 5.6 | 6.4 | 12.50 | 0.19 | 2.34 | 11.69 | 5.64 | 7.23 | 0.71 | 0.08 | – | – | – | – | 0.40 |
| g-third-B2 | geht-1 | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – |
| g-third-B2 | Geher-Ende |  | | | | | | | | | | | | | | | | | | | |

## Tier-Zensus je Boot (zensus-0 nach umstellen · zensus-1 nach geht-1)

- g-third-A1: vorher 10 (fox 4, deer 4, bear 2; Würfe≥2 1: deer 4 Spanne 2.2 m @150.4 m; Verband-Feld true, Verbände≥2 1: deer 4 Spanne 2.2 m; Zustand {"-":10})
  nachher –
- g-third-A2: vorher 10 (fox 4, deer 4, bear 2; Würfe≥2 1: deer 4 Spanne 2 m @150.4 m; Verband-Feld true, Verbände≥2 1: deer 4 Spanne 2 m; Zustand {"-":10})
  nachher –
- g-third-B1: vorher 10 (fox 4, deer 4, bear 2; Würfe≥2 1: deer 4 Spanne 2 m @150.4 m; Verband-Feld true, Verbände≥2 1: deer 4 Spanne 2 m; Zustand {"-":10})
  nachher –
- g-third-B2: vorher 10 (fox 4, deer 4, bear 2; Würfe≥2 1: deer 4 Spanne 1.9 m @150.5 m; Verband-Feld true, Verbände≥2 1: deer 4 Spanne 1.9 m; Zustand {"-":10})
  nachher –

## GPU-Takt je Boot (nvidia-smi 1 s, nur P0-Sekunden: Median-MHz · Anteil Drossel (Grund ≠ 0 ohne GpuIdle 0x1) · max °C)

- g-third-A1: 106 s · 1733 MHz · Drossel 21 % · 86 °C
- g-third-A2: 76 s · 1759 MHz · Drossel 30 % · 86 °C
- g-third-B1: 107 s · 1759 MHz · Drossel 17 % · 86 °C
- g-third-B2: 105 s · 1746 MHz · Drossel 12 % · 82 °C

## Mittel je Seite (A 3528f2d0 main · B 435f54f4 zug 4; gehend = geht-1 je Boot)

| Gang | Größe | A | B | Δ B − A | 2σ | t (Welch) | Urteil |
|---|---|---|---|---|---|---|---|
| steht | fps | 80.0 (79.5 · 80.5) | 80.2 (80.1 · 80.2) | +0.2 | 1.0 | 0.30 | nicht langsamer |
| steht | Frame p50 ms | 12.5 (16.4 · 8.6) | 8.7 (8.7 · 8.7) | -3.8 | 7.8 | -0.97 | nicht langsamer |
| steht | Frame p95 ms | 16.8 (16.7 · 16.8) | 16.8 (16.8 · 16.8) | +0.1 | 0.1 | 1.00 | nicht langsamer |
| steht | Frame p99 ms | 16.9 (16.8 · 17.0) | 17.0 (17.0 · 17.0) | +0.1 | 0.2 | 1.00 | nicht langsamer |
| steht | CPU-Takt p50 ms | 4.55 (4.80 · 4.30) | 4.40 (4.30 · 4.50) | -0.15 | 0.54 | -0.56 | nicht langsamer |
| steht | CPU-Takt p95 ms | 6.0 (6.5 · 5.5) | 5.7 (5.8 · 5.6) | -0.3 | 1.0 | -0.59 | nicht langsamer |
| steht | CPU-Takt p99 ms | 7.0 (7.8 · 6.3) | 6.8 (7.1 · 6.4) | -0.3 | 1.7 | -0.36 | nicht langsamer |
| steht | GPU-Durchsatz p50 ms | 12.50 (12.70 · 12.30) | 12.50 (12.50 · 12.50) | 0.00 | 0.40 | 0.00 | nicht langsamer |
| steht | k0 p50 ms | 0.19 (0.19 · 0.19) | 0.19 (0.19 · 0.19) | 0.00 | 0.00 | – | nicht langsamer |
| steht | GPU p95 ms (lauf) | 2.29 (2.36 · 2.21) | 2.23 (2.12 · 2.34) | -0.06 | 0.27 | -0.41 | nicht langsamer |
| steht | GPU je Bild ms (gpu-bank) | 11.46 (11.45 · 11.48) | 11.46 (11.22 · 11.69) | -0.01 | 0.47 | -0.04 | nicht langsamer |
| steht | Belegung p50 ms | 5.85 (6.20 · 5.49) | 5.62 (5.60 · 5.64) | -0.23 | 0.71 | -0.63 | nicht langsamer |
| steht | Belegung p95 ms | 7.87 (8.68 · 7.05) | 7.35 (7.46 · 7.23) | -0.52 | 1.65 | -0.63 | nicht langsamer |
| steht | außer Takt p95 ms | 0.76 (0.83 · 0.70) | 0.71 (0.72 · 0.71) | -0.05 | 0.13 | -0.77 | nicht langsamer |
| steht | Lebenszyklus p95 ms | 0.08 (0.09 · 0.07) | 0.08 (0.08 · 0.08) | 0.00 | 0.02 | 0.00 | nicht langsamer |
| steht | über 33 ms % | – (– · –) | – (– · –) | – | – | – | – |
| steht | KI-Uhr Mittel ms | – (– · –) | – (– · –) | – | – | – | – |
| steht | KI-Uhr p95 ms | – (– · –) | – (– · –) | – | – | – | – |
| steht | KI-Uhr p99 ms | – (– · –) | – (– · –) | – | – | – | – |
| steht | KI-Takt EWMA ms | 0.38 (0.41 · 0.35) | 0.37 (0.34 · 0.40) | -0.01 | 0.08 | -0.24 | nicht langsamer |
| geht | fps | – (– · –) | – (– · –) | – | – | – | – |
| geht | Frame p50 ms | – (– · –) | – (– · –) | – | – | – | – |
| geht | Frame p95 ms | – (– · –) | – (– · –) | – | – | – | – |
| geht | Frame p99 ms | – (– · –) | – (– · –) | – | – | – | – |
| geht | CPU-Takt p50 ms | – (– · –) | – (– · –) | – | – | – | – |
| geht | CPU-Takt p95 ms | – (– · –) | – (– · –) | – | – | – | – |
| geht | CPU-Takt p99 ms | – (– · –) | – (– · –) | – | – | – | – |
| geht | GPU-Durchsatz p50 ms | – (– · –) | – (– · –) | – | – | – | – |
| geht | k0 p50 ms | – (– · –) | – (– · –) | – | – | – | – |
| geht | GPU p95 ms (lauf) | – (– · –) | – (– · –) | – | – | – | – |
| geht | GPU je Bild ms (gpu-bank) | – (– · –) | – (– · –) | – | – | – | – |
| geht | Belegung p50 ms | – (– · –) | – (– · –) | – | – | – | – |
| geht | Belegung p95 ms | – (– · –) | – (– · –) | – | – | – | – |
| geht | außer Takt p95 ms | – (– · –) | – (– · –) | – | – | – | – |
| geht | Lebenszyklus p95 ms | – (– · –) | – (– · –) | – | – | – | – |
| geht | über 33 ms % | – (– · –) | – (– · –) | – | – | – | – |
| geht | KI-Uhr Mittel ms | – (– · –) | – (– · –) | – | – | – | – |
| geht | KI-Uhr p95 ms | – (– · –) | – (– · –) | – | – | – | – |
| geht | KI-Uhr p99 ms | – (– · –) | – (– · –) | – | – | – | – |
| geht | KI-Takt EWMA ms | – (– · –) | – (– · –) | – | – | – | – |

**KERN-URTEIL GEHEN g-third** (steht + geht × fps · Frame p95 · CPU-Takt p95 · GPU je Bild (gpu-bank, nur steht) · Belegung p95; Δ ≤ max(2σ gepoolt, Auflösung)): nicht langsamer (5 Größen)
