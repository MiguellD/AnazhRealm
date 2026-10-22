## g-third — je Boot

| Boot | Gang | fps | Frame p50 ms | Frame p95 ms | Frame p99 ms | CPU-Takt p50 ms | CPU-Takt p95 ms | CPU-Takt p99 ms | GPU-Durchsatz p50 ms | k0 p50 ms | GPU p95 ms (lauf) | GPU je Bild ms (gpu-bank) | Belegung p50 ms | Belegung p95 ms | außer Takt p95 ms | Lebenszyklus p95 ms | über 33 ms % | KI-Uhr Mittel ms | KI-Uhr p95 ms | KI-Uhr p99 ms | KI-Takt EWMA ms |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| g-third-A1 | steht | 80.1 | 8.7 | 16.8 | 17.0 | 4.60 | 6.0 | 7.0 | 12.50 | 0.19 | 2.10 | 11.27 | 5.83 | 7.73 | 0.75 | 0.07 | – | – | – | – | 0.40 |
| g-third-A1 | geht-1 | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – |
| g-third-A1 | Geher-Ende |  | | | | | | | | | | | | | | | | | | | |
| g-third-A2 | steht | 80.2 | 8.6 | 16.8 | 17.0 | 4.50 | 5.8 | 6.8 | 12.50 | 0.19 | 2.15 | 11.33 | 5.75 | 7.43 | 0.74 | 0.07 | – | – | – | – | 0.40 |
| g-third-A2 | geht-1 | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – |
| g-third-A2 | Geher-Ende |  | | | | | | | | | | | | | | | | | | | |
| g-third-B1 | steht | 80.1 | 8.7 | 16.8 | 17.0 | 4.60 | 6.0 | 6.7 | 12.50 | 0.19 | 2.13 | 11.29 | 5.81 | 7.61 | 0.73 | 0.07 | – | – | – | – | 0.36 |
| g-third-B1 | geht-1 | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – |
| g-third-B1 | Geher-Ende |  | | | | | | | | | | | | | | | | | | | |
| g-third-B2 | steht | 80.1 | 9.0 | 16.7 | 16.9 | 4.60 | 6.1 | 7.3 | 12.50 | 0.19 | 2.19 | 11.58 | 5.92 | 7.76 | 0.75 | 0.08 | – | – | – | – | 0.42 |
| g-third-B2 | geht-1 | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – |
| g-third-B2 | Geher-Ende |  | | | | | | | | | | | | | | | | | | | |

## Tier-Zensus je Boot (zensus-0 nach umstellen · zensus-1 nach geht-1)

- g-third-A1: vorher 10 (fox 4, deer 4, bear 2; Würfe≥2 1: deer 4 Spanne 1.9 m @150.4 m; Verband-Feld true, Verbände≥2 1: deer 4 Spanne 1.9 m; Zustand {"-":10})
  nachher –
- g-third-A2: vorher 10 (fox 4, deer 4, bear 2; Würfe≥2 1: deer 4 Spanne 2 m @150.4 m; Verband-Feld true, Verbände≥2 1: deer 4 Spanne 2 m; Zustand {"-":10})
  nachher –
- g-third-B1: vorher 10 (fox 4, deer 4, bear 2; Würfe≥2 1: deer 4 Spanne 2 m @150.5 m; Verband-Feld true, Verbände≥2 1: deer 4 Spanne 2 m; Zustand {"-":10})
  nachher –
- g-third-B2: vorher 10 (fox 4, deer 4, bear 2; Würfe≥2 1: deer 4 Spanne 1.8 m @150.3 m; Verband-Feld true, Verbände≥2 1: deer 4 Spanne 1.8 m; Zustand {"-":10})
  nachher –

## GPU-Takt je Boot (nvidia-smi 1 s, nur P0-Sekunden: Median-MHz · Anteil Drossel (Grund ≠ 0 ohne GpuIdle 0x1) · max °C)

- g-third-A1: 82 s · 1746 MHz · Drossel 27 % · 86 °C
- g-third-A2: 109 s · 1746 MHz · Drossel 19 % · 86 °C
- g-third-B1: 111 s · 1733 MHz · Drossel 16 % · 86 °C
- g-third-B2: 109 s · 1733 MHz · Drossel 14 % · 86 °C

## Mittel je Seite (A 73f28224 main · B 1ef4042c zug; gehend = geht-1 je Boot)

| Gang | Größe | A | B | Δ B − A | 2σ | t (Welch) | Urteil |
|---|---|---|---|---|---|---|---|
| steht | fps | 80.2 (80.1 · 80.2) | 80.1 (80.1 · 80.1) | -0.1 | 0.1 | -1.00 | nicht langsamer |
| steht | Frame p50 ms | 8.6 (8.7 · 8.6) | 8.8 (8.7 · 9.0) | +0.2 | 0.3 | 1.26 | nicht langsamer |
| steht | Frame p95 ms | 16.8 (16.8 · 16.8) | 16.8 (16.8 · 16.7) | -0.1 | 0.1 | -1.00 | nicht langsamer |
| steht | Frame p99 ms | 17.0 (17.0 · 17.0) | 16.9 (17.0 · 16.9) | -0.1 | 0.1 | -1.00 | nicht langsamer |
| steht | CPU-Takt p50 ms | 4.55 (4.60 · 4.50) | 4.60 (4.60 · 4.60) | +0.05 | 0.10 | 1.00 | nicht langsamer |
| steht | CPU-Takt p95 ms | 5.9 (6.0 · 5.8) | 6.0 (6.0 · 6.1) | +0.1 | 0.2 | 1.34 | nicht langsamer |
| steht | CPU-Takt p99 ms | 6.9 (7.0 · 6.8) | 7.0 (6.7 · 7.3) | +0.1 | 0.6 | 0.32 | nicht langsamer |
| steht | GPU-Durchsatz p50 ms | 12.50 (12.50 · 12.50) | 12.50 (12.50 · 12.50) | 0.00 | 0.00 | – | nicht langsamer |
| steht | k0 p50 ms | 0.19 (0.19 · 0.19) | 0.19 (0.19 · 0.19) | 0.00 | 0.00 | – | nicht langsamer |
| steht | GPU p95 ms (lauf) | 2.13 (2.10 · 2.15) | 2.16 (2.13 · 2.19) | +0.04 | 0.08 | 0.90 | nicht langsamer |
| steht | GPU je Bild ms (gpu-bank) | 11.30 (11.27 · 11.33) | 11.43 (11.29 · 11.58) | +0.13 | 0.30 | 0.91 | nicht langsamer |
| steht | Belegung p50 ms | 5.79 (5.83 · 5.75) | 5.87 (5.81 · 5.92) | +0.08 | 0.14 | 1.10 | nicht langsamer |
| steht | Belegung p95 ms | 7.58 (7.73 · 7.43) | 7.69 (7.61 · 7.76) | +0.11 | 0.34 | 0.63 | nicht langsamer |
| steht | außer Takt p95 ms | 0.74 (0.75 · 0.74) | 0.74 (0.73 · 0.75) | -0.01 | 0.02 | -0.45 | nicht langsamer |
| steht | Lebenszyklus p95 ms | 0.07 (0.07 · 0.07) | 0.08 (0.07 · 0.08) | +0.01 | 0.01 | 1.00 | nicht langsamer |
| steht | über 33 ms % | – (– · –) | – (– · –) | – | – | – | – |
| steht | KI-Uhr Mittel ms | – (– · –) | – (– · –) | – | – | – | – |
| steht | KI-Uhr p95 ms | – (– · –) | – (– · –) | – | – | – | – |
| steht | KI-Uhr p99 ms | – (– · –) | – (– · –) | – | – | – | – |
| steht | KI-Takt EWMA ms | 0.40 (0.40 · 0.40) | 0.39 (0.36 · 0.42) | -0.01 | 0.06 | -0.33 | nicht langsamer |
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
