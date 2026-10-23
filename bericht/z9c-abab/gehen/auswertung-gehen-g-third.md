## g-third — je Boot

| Boot | Gang | fps | Frame p50 ms | Frame p95 ms | Frame p99 ms | CPU-Takt p50 ms | CPU-Takt p95 ms | CPU-Takt p99 ms | GPU-Durchsatz p50 ms | k0 p50 ms | GPU p95 ms (lauf) | GPU je Bild ms (gpu-bank) | Belegung p50 ms | Belegung p95 ms | außer Takt p95 ms | Lebenszyklus p95 ms | über 33 ms % | KI-Uhr Mittel ms | KI-Uhr p95 ms | KI-Uhr p99 ms | KI-Takt EWMA ms |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| g-third-A1 | steht | 79.9 | 14.2 | 16.7 | 16.9 | 4.60 | 6.0 | 7.0 | 12.60 | 0.19 | 1.76 | 11.38 | 5.82 | 7.74 | 0.73 | 0.08 | – | – | – | – | 0.43 |
| g-third-A1 | geht-1 | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – |
| g-third-A1 | Geher-Ende |  | | | | | | | | | | | | | | | | | | | |
| g-third-A2 | steht | 80.0 | 8.8 | 16.7 | 16.9 | 4.50 | 6.1 | 7.4 | 12.50 | 0.19 | 1.79 | 11.91 | 5.81 | 7.91 | 0.75 | 0.08 | – | – | – | – | 0.42 |
| g-third-A2 | geht-1 | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – |
| g-third-A2 | Geher-Ende |  | | | | | | | | | | | | | | | | | | | |
| g-third-B1 | steht | 80.6 | 8.5 | 16.8 | 17.0 | 4.40 | 5.6 | 6.5 | 12.30 | 0.19 | 1.77 | 11.88 | 5.46 | 7.27 | 0.72 | 0.08 | – | – | – | – | 0.21 |
| g-third-B1 | geht-1 | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – |
| g-third-B1 | Geher-Ende |  | | | | | | | | | | | | | | | | | | | |
| g-third-B2 | steht | 80.2 | 8.7 | 16.7 | 16.9 | 4.30 | 5.8 | 6.7 | 12.40 | 0.20 | 1.78 | 11.51 | 5.56 | 7.60 | 0.74 | 0.08 | – | – | – | – | 0.21 |
| g-third-B2 | geht-1 | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – |
| g-third-B2 | Geher-Ende |  | | | | | | | | | | | | | | | | | | | |

## Tier-Zensus je Boot (zensus-0 nach umstellen · zensus-1 nach geht-1)

- g-third-A1: vorher 10 (fox 4, deer 4, bear 2; Würfe≥2 1: deer 4 Spanne 1.9 m @150.5 m; Verband-Feld true, Verbände≥2 1: deer 4 Spanne 1.9 m; Zustand {"-":10})
  nachher –
- g-third-A2: vorher 10 (fox 4, deer 4, bear 2; Würfe≥2 1: deer 4 Spanne 1.9 m @150.5 m; Verband-Feld true, Verbände≥2 1: deer 4 Spanne 1.9 m; Zustand {"-":10})
  nachher –
- g-third-B1: vorher 5 (bear 1, wolf 4; Würfe≥2 1: wolf 4 Spanne 1.4 m @158.6 m; Verband-Feld true, Verbände≥2 1: wolf 4 Spanne 1.4 m; Zustand {"-":5})
  nachher –
- g-third-B2: vorher 5 (bear 1, wolf 4; Würfe≥2 1: wolf 4 Spanne 1.4 m @158.4 m; Verband-Feld true, Verbände≥2 1: wolf 4 Spanne 1.4 m; Zustand {"-":5})
  nachher –

## GPU-Takt je Boot (nvidia-smi 1 s, nur P0-Sekunden: Median-MHz · Anteil Drossel (Grund ≠ 0 ohne GpuIdle 0x1) · max °C)

- g-third-A1: 78 s · 1746 MHz · Drossel 37 % · 87 °C
- g-third-A2: 108 s · 1733 MHz · Drossel 17 % · 87 °C
- g-third-B1: 102 s · 1721 MHz · Drossel 25 % · 86 °C
- g-third-B2: 110 s · 1721 MHz · Drossel 17 % · 87 °C

## Mittel je Seite (A f7dd313c · B 13c95713; gehend = geht-1 je Boot)

| Gang | Größe | A | B | Δ B − A | 2σ | t (Welch) | Urteil |
|---|---|---|---|---|---|---|---|
| steht | fps | 80.0 (79.9 · 80.0) | 80.4 (80.6 · 80.2) | +0.5 | 0.4 | 2.18 | nicht langsamer |
| steht | Frame p50 ms | 11.5 (14.2 · 8.8) | 8.6 (8.5 · 8.7) | -2.9 | 5.4 | -1.07 | nicht langsamer |
| steht | Frame p95 ms | 16.7 (16.7 · 16.7) | 16.8 (16.8 · 16.7) | +0.1 | 0.1 | 1.00 | nicht langsamer |
| steht | Frame p99 ms | 16.9 (16.9 · 16.9) | 16.9 (17.0 · 16.9) | +0.1 | 0.1 | 1.00 | nicht langsamer |
| steht | CPU-Takt p50 ms | 4.55 (4.60 · 4.50) | 4.35 (4.40 · 4.30) | -0.20 | 0.14 | -2.83 | nicht langsamer |
| steht | CPU-Takt p95 ms | 6.0 (6.0 · 6.1) | 5.7 (5.6 · 5.8) | -0.4 | 0.2 | -3.13 | nicht langsamer |
| steht | CPU-Takt p99 ms | 7.2 (7.0 · 7.4) | 6.6 (6.5 · 6.7) | -0.6 | 0.4 | -2.68 | nicht langsamer |
| steht | GPU-Durchsatz p50 ms | 12.55 (12.60 · 12.50) | 12.35 (12.30 · 12.40) | -0.20 | 0.14 | -2.83 | nicht langsamer |
| steht | k0 p50 ms | 0.19 (0.19 · 0.19) | 0.20 (0.19 · 0.20) | +0.01 | 0.01 | 1.00 | nicht langsamer |
| steht | GPU p95 ms (lauf) | 1.77 (1.76 · 1.79) | 1.77 (1.77 · 1.78) | 0.00 | 0.03 | 0.00 | nicht langsamer |
| steht | GPU je Bild ms (gpu-bank) | 11.64 (11.38 · 11.91) | 11.70 (11.88 · 11.51) | +0.05 | 0.65 | 0.15 | nicht langsamer |
| steht | Belegung p50 ms | 5.81 (5.82 · 5.81) | 5.51 (5.46 · 5.56) | -0.30 | 0.10 | -6.07 | nicht langsamer |
| steht | Belegung p95 ms | 7.83 (7.74 · 7.91) | 7.43 (7.27 · 7.60) | -0.39 | 0.37 | -2.10 | nicht langsamer |
| steht | außer Takt p95 ms | 0.74 (0.73 · 0.75) | 0.73 (0.72 · 0.74) | -0.01 | 0.03 | -0.71 | nicht langsamer |
| steht | Lebenszyklus p95 ms | 0.08 (0.08 · 0.08) | 0.08 (0.08 · 0.08) | 0.00 | 0.00 | – | nicht langsamer |
| steht | über 33 ms % | – (– · –) | – (– · –) | – | – | – | – |
| steht | KI-Uhr Mittel ms | – (– · –) | – (– · –) | – | – | – | – |
| steht | KI-Uhr p95 ms | – (– · –) | – (– · –) | – | – | – | – |
| steht | KI-Uhr p99 ms | – (– · –) | – (– · –) | – | – | – | – |
| steht | KI-Takt EWMA ms | 0.42 (0.43 · 0.42) | 0.21 (0.21 · 0.21) | -0.21 | 0.01 | -43.00 | nicht langsamer |
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
