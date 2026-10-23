## g-third — je Boot

| Boot | Gang | fps | Frame p50 ms | Frame p95 ms | Frame p99 ms | CPU-Takt p50 ms | CPU-Takt p95 ms | CPU-Takt p99 ms | GPU-Durchsatz p50 ms | k0 p50 ms | GPU p95 ms (lauf) | GPU je Bild ms (gpu-bank) | Belegung p50 ms | Belegung p95 ms | außer Takt p95 ms | Lebenszyklus p95 ms | über 33 ms % | KI-Uhr Mittel ms | KI-Uhr p95 ms | KI-Uhr p99 ms | KI-Takt EWMA ms |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| g-third-A1 | steht | 80.2 | 8.6 | 16.8 | 16.9 | 4.40 | 5.8 | 6.8 | 12.50 | 0.19 | 2.09 | 11.19 | 5.60 | 7.42 | 0.74 | 0.08 | – | – | – | – | 0.40 |
| g-third-A1 | geht-1 | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – |
| g-third-A1 | Geher-Ende |  | | | | | | | | | | | | | | | | | | | |
| g-third-A2 | steht | 80.1 | 8.8 | 16.8 | 17.0 | 4.30 | 5.7 | 6.4 | 12.50 | 0.19 | 1.98 | 11.52 | 5.50 | 7.29 | 0.70 | 0.08 | – | – | – | – | 0.36 |
| g-third-A2 | geht-1 | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – |
| g-third-A2 | Geher-Ende |  | | | | | | | | | | | | | | | | | | | |
| g-third-B1 | steht | 80.2 | 8.7 | 16.8 | 17.0 | 4.30 | 5.8 | 6.6 | 12.50 | 0.19 | 2.10 | 11.76 | 5.52 | 7.34 | 0.71 | 0.08 | – | – | – | – | 0.32 |
| g-third-B1 | geht-1 | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – |
| g-third-B1 | Geher-Ende |  | | | | | | | | | | | | | | | | | | | |
| g-third-B2 | steht | 80.3 | 8.6 | 16.8 | 17.0 | 4.40 | 5.7 | 6.7 | 12.50 | 0.19 | 2.07 | 11.27 | 5.59 | 7.29 | 0.70 | 0.08 | – | – | – | – | 0.30 |
| g-third-B2 | geht-1 | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – |
| g-third-B2 | Geher-Ende |  | | | | | | | | | | | | | | | | | | | |

## Tier-Zensus je Boot (zensus-0 nach umstellen · zensus-1 nach geht-1)

- g-third-A1: vorher 10 (fox 4, deer 4, bear 2; Würfe≥2 1: deer 4 Spanne 1.9 m @150.3 m; Verband-Feld true, Verbände≥2 1: deer 4 Spanne 1.9 m; Zustand {"-":10})
  nachher –
- g-third-A2: vorher 10 (fox 4, deer 4, bear 2; Würfe≥2 1: deer 4 Spanne 2 m @150.3 m; Verband-Feld true, Verbände≥2 1: deer 4 Spanne 2 m; Zustand {"-":10})
  nachher –
- g-third-B1: vorher 10 (fox 4, deer 4, bear 2; Würfe≥2 1: deer 4 Spanne 1.9 m @150.2 m; Verband-Feld true, Verbände≥2 1: deer 4 Spanne 1.9 m; Zustand {"-":10})
  nachher –
- g-third-B2: vorher 10 (fox 4, deer 4, bear 2; Würfe≥2 1: deer 4 Spanne 1.9 m @150.3 m; Verband-Feld true, Verbände≥2 1: deer 4 Spanne 1.9 m; Zustand {"-":10})
  nachher –

## GPU-Takt je Boot (nvidia-smi 1 s, nur P0-Sekunden: Median-MHz · Anteil Drossel (Grund ≠ 0 ohne GpuIdle 0x1) · max °C)

- g-third-A1: 74 s · 1746 MHz · Drossel 31 % · 85 °C
- g-third-A2: 77 s · 1746 MHz · Drossel 25 % · 86 °C
- g-third-B1: 77 s · 1746 MHz · Drossel 23 % · 86 °C
- g-third-B2: 79 s · 1759 MHz · Drossel 23 % · 86 °C

## Mittel je Seite (A cfb563bf main · B 3528f2d0 zug 3; gehend = geht-1 je Boot)

| Gang | Größe | A | B | Δ B − A | 2σ | t (Welch) | Urteil |
|---|---|---|---|---|---|---|---|
| steht | fps | 80.2 (80.2 · 80.1) | 80.3 (80.2 · 80.3) | +0.1 | 0.1 | 1.41 | nicht langsamer |
| steht | Frame p50 ms | 8.7 (8.6 · 8.8) | 8.6 (8.7 · 8.6) | -0.1 | 0.2 | -0.45 | nicht langsamer |
| steht | Frame p95 ms | 16.8 (16.8 · 16.8) | 16.8 (16.8 · 16.8) | 0.0 | 0.0 | – | nicht langsamer |
| steht | Frame p99 ms | 16.9 (16.9 · 17.0) | 17.0 (17.0 · 17.0) | +0.1 | 0.1 | 1.00 | nicht langsamer |
| steht | CPU-Takt p50 ms | 4.35 (4.40 · 4.30) | 4.35 (4.30 · 4.40) | 0.00 | 0.14 | 0.00 | nicht langsamer |
| steht | CPU-Takt p95 ms | 5.8 (5.8 · 5.7) | 5.8 (5.8 · 5.7) | 0.0 | 0.1 | 0.00 | nicht langsamer |
| steht | CPU-Takt p99 ms | 6.6 (6.8 · 6.4) | 6.7 (6.6 · 6.7) | +0.1 | 0.4 | 0.24 | nicht langsamer |
| steht | GPU-Durchsatz p50 ms | 12.50 (12.50 · 12.50) | 12.50 (12.50 · 12.50) | 0.00 | 0.00 | – | nicht langsamer |
| steht | k0 p50 ms | 0.19 (0.19 · 0.19) | 0.19 (0.19 · 0.19) | 0.00 | 0.00 | – | nicht langsamer |
| steht | GPU p95 ms (lauf) | 2.04 (2.09 · 1.98) | 2.08 (2.10 · 2.07) | +0.05 | 0.11 | 0.88 | nicht langsamer |
| steht | GPU je Bild ms (gpu-bank) | 11.36 (11.19 · 11.52) | 11.52 (11.76 · 11.27) | +0.16 | 0.59 | 0.54 | nicht langsamer |
| steht | Belegung p50 ms | 5.55 (5.60 · 5.50) | 5.55 (5.52 · 5.59) | +0.00 | 0.12 | 0.08 | nicht langsamer |
| steht | Belegung p95 ms | 7.36 (7.42 · 7.29) | 7.31 (7.34 · 7.29) | -0.04 | 0.14 | -0.57 | nicht langsamer |
| steht | außer Takt p95 ms | 0.72 (0.74 · 0.70) | 0.70 (0.71 · 0.70) | -0.02 | 0.04 | -0.73 | nicht langsamer |
| steht | Lebenszyklus p95 ms | 0.08 (0.08 · 0.08) | 0.08 (0.08 · 0.08) | 0.00 | 0.00 | – | nicht langsamer |
| steht | über 33 ms % | – (– · –) | – (– · –) | – | – | – | – |
| steht | KI-Uhr Mittel ms | – (– · –) | – (– · –) | – | – | – | – |
| steht | KI-Uhr p95 ms | – (– · –) | – (– · –) | – | – | – | – |
| steht | KI-Uhr p99 ms | – (– · –) | – (– · –) | – | – | – | – |
| steht | KI-Takt EWMA ms | 0.38 (0.40 · 0.36) | 0.31 (0.32 · 0.30) | -0.07 | 0.04 | -3.13 | nicht langsamer |
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
