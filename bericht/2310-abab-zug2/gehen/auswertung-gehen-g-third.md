## g-third — je Boot

| Boot | Gang | fps | Frame p50 ms | Frame p95 ms | Frame p99 ms | CPU-Takt p50 ms | CPU-Takt p95 ms | CPU-Takt p99 ms | GPU-Durchsatz p50 ms | k0 p50 ms | GPU p95 ms (lauf) | GPU je Bild ms (gpu-bank) | Belegung p50 ms | Belegung p95 ms | außer Takt p95 ms | Lebenszyklus p95 ms | über 33 ms % | KI-Uhr Mittel ms | KI-Uhr p95 ms | KI-Uhr p99 ms | KI-Takt EWMA ms |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| g-third-A1 | steht | 80.1 | 8.7 | 16.8 | 17.0 | 4.60 | 5.9 | 6.6 | 12.50 | 0.19 | 2.04 | 11.17 | 5.83 | 7.47 | 0.72 | 0.08 | – | – | – | – | 0.45 |
| g-third-A1 | geht-1 | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – |
| g-third-A1 | Geher-Ende |  | | | | | | | | | | | | | | | | | | | |
| g-third-A2 | steht | 79.8 | 14.0 | 16.8 | 17.0 | 4.60 | 5.9 | 6.7 | 12.60 | 0.19 | 2.30 | 11.88 | 5.86 | 7.62 | 0.73 | 0.08 | – | – | – | – | 0.42 |
| g-third-A2 | geht-1 | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – |
| g-third-A2 | Geher-Ende |  | | | | | | | | | | | | | | | | | | | |
| g-third-B1 | steht | 79.9 | 10.0 | 16.7 | 17.0 | 4.60 | 6.0 | 6.8 | 12.60 | 0.19 | 2.34 | 11.44 | 5.89 | 7.52 | 0.73 | 0.08 | – | – | – | – | 0.40 |
| g-third-B1 | geht-1 | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – |
| g-third-B1 | Geher-Ende |  | | | | | | | | | | | | | | | | | | | |
| g-third-B2 | steht | 79.8 | 10.0 | 16.7 | 17.0 | 4.60 | 6.0 | 6.8 | 12.60 | 0.19 | 2.38 | 11.42 | 5.95 | 7.85 | 0.72 | 0.08 | – | – | – | – | 0.46 |
| g-third-B2 | geht-1 | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – |
| g-third-B2 | Geher-Ende |  | | | | | | | | | | | | | | | | | | | |

## Tier-Zensus je Boot (zensus-0 nach umstellen · zensus-1 nach geht-1)

- g-third-A1: vorher 10 (fox 4, deer 4, bear 2; Würfe≥2 1: deer 4 Spanne 1.8 m @150.4 m; Verband-Feld true, Verbände≥2 1: deer 4 Spanne 1.8 m; Zustand {"-":10})
  nachher –
- g-third-A2: vorher 10 (fox 4, deer 4, bear 2; Würfe≥2 1: deer 4 Spanne 2.1 m @150.4 m; Verband-Feld true, Verbände≥2 1: deer 4 Spanne 2.1 m; Zustand {"-":10})
  nachher –
- g-third-B1: vorher 10 (fox 4, deer 4, bear 2; Würfe≥2 1: deer 4 Spanne 1.9 m @150.6 m; Verband-Feld true, Verbände≥2 1: deer 4 Spanne 1.9 m; Zustand {"-":10})
  nachher –
- g-third-B2: vorher 10 (fox 4, deer 4, bear 2; Würfe≥2 1: deer 4 Spanne 1.9 m @150.4 m; Verband-Feld true, Verbände≥2 1: deer 4 Spanne 1.9 m; Zustand {"-":10})
  nachher –

## GPU-Takt je Boot (nvidia-smi 1 s, nur P0-Sekunden: Median-MHz · Anteil Drossel (Grund ≠ 0 ohne GpuIdle 0x1) · max °C)

- g-third-A1: 76 s · 1746 MHz · Drossel 24 % · 86 °C
- g-third-A2: 110 s · 1733 MHz · Drossel 15 % · 86 °C
- g-third-B1: 107 s · 1733 MHz · Drossel 17 % · 86 °C
- g-third-B2: 108 s · 1746 MHz · Drossel 16 % · 87 °C

## Mittel je Seite (A 1ef4042c main · B 40d00ade zug 2; gehend = geht-1 je Boot)

| Gang | Größe | A | B | Δ B − A | 2σ | t (Welch) | Urteil |
|---|---|---|---|---|---|---|---|
| steht | fps | 79.9 (80.1 · 79.8) | 79.8 (79.9 · 79.8) | -0.1 | 0.3 | -0.63 | nicht langsamer |
| steht | Frame p50 ms | 11.3 (8.7 · 14.0) | 10.0 (10.0 · 10.0) | -1.3 | 5.3 | -0.51 | nicht langsamer |
| steht | Frame p95 ms | 16.8 (16.8 · 16.8) | 16.7 (16.7 · 16.7) | -0.1 | 0.0 | – | nicht langsamer |
| steht | Frame p99 ms | 17.0 (17.0 · 17.0) | 17.0 (17.0 · 17.0) | 0.0 | 0.0 | – | nicht langsamer |
| steht | CPU-Takt p50 ms | 4.60 (4.60 · 4.60) | 4.60 (4.60 · 4.60) | 0.00 | 0.00 | – | nicht langsamer |
| steht | CPU-Takt p95 ms | 5.9 (5.9 · 5.9) | 6.0 (6.0 · 6.0) | +0.1 | 0.0 | – | nicht langsamer |
| steht | CPU-Takt p99 ms | 6.7 (6.6 · 6.7) | 6.8 (6.8 · 6.8) | +0.1 | 0.1 | 3.00 | LANGSAMER |
| steht | GPU-Durchsatz p50 ms | 12.55 (12.50 · 12.60) | 12.60 (12.60 · 12.60) | +0.05 | 0.10 | 1.00 | nicht langsamer |
| steht | k0 p50 ms | 0.19 (0.19 · 0.19) | 0.19 (0.19 · 0.19) | 0.00 | 0.00 | – | nicht langsamer |
| steht | GPU p95 ms (lauf) | 2.17 (2.04 · 2.30) | 2.36 (2.34 · 2.38) | +0.19 | 0.26 | 1.44 | nicht langsamer |
| steht | GPU je Bild ms (gpu-bank) | 11.53 (11.17 · 11.88) | 11.43 (11.44 · 11.42) | -0.10 | 0.71 | -0.27 | nicht langsamer |
| steht | Belegung p50 ms | 5.85 (5.83 · 5.86) | 5.92 (5.89 · 5.95) | +0.07 | 0.07 | 2.24 | LANGSAMER |
| steht | Belegung p95 ms | 7.54 (7.47 · 7.62) | 7.68 (7.52 · 7.85) | +0.14 | 0.36 | 0.77 | nicht langsamer |
| steht | außer Takt p95 ms | 0.72 (0.72 · 0.73) | 0.72 (0.73 · 0.72) | 0.00 | 0.01 | 0.00 | nicht langsamer |
| steht | Lebenszyklus p95 ms | 0.08 (0.08 · 0.08) | 0.08 (0.08 · 0.08) | 0.00 | 0.00 | – | nicht langsamer |
| steht | über 33 ms % | – (– · –) | – (– · –) | – | – | – | – |
| steht | KI-Uhr Mittel ms | – (– · –) | – (– · –) | – | – | – | – |
| steht | KI-Uhr p95 ms | – (– · –) | – (– · –) | – | – | – | – |
| steht | KI-Uhr p99 ms | – (– · –) | – (– · –) | – | – | – | – |
| steht | KI-Takt EWMA ms | 0.43 (0.45 · 0.42) | 0.43 (0.40 · 0.46) | -0.00 | 0.07 | -0.15 | nicht langsamer |
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
