## g-third — je Boot

| Boot | Gang | fps | Frame p50 ms | Frame p95 ms | Frame p99 ms | CPU-Takt p50 ms | CPU-Takt p95 ms | CPU-Takt p99 ms | GPU-Durchsatz p50 ms | k0 p50 ms | GPU p95 ms (lauf) | GPU je Bild ms (gpu-bank) | Belegung p50 ms | Belegung p95 ms | außer Takt p95 ms | Lebenszyklus p95 ms | über 33 ms % | KI-Uhr Mittel ms | KI-Uhr p95 ms | KI-Uhr p99 ms | KI-Takt EWMA ms |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| g-third-A1 | steht | 79.9 | 14.9 | 16.7 | 17.0 | 4.30 | 5.3 | 6.3 | 12.60 | 0.17 | 1.78 | 12.14 | 5.48 | 6.93 | 0.69 | 0.07 | – | – | – | – | 0.27 |
| g-third-A1 | geht-1 | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – |
| g-third-A1 | Geher-Ende |  | | | | | | | | | | | | | | | | | | | |
| g-third-A2 | steht | 78.6 | 16.5 | 16.7 | 17.1 | 5.80 | 7.6 | 8.6 | 12.70 | 0.18 | 1.75 | 12.07 | 7.46 | 10.28 | 0.97 | 0.09 | – | – | – | – | 0.34 |
| g-third-A2 | geht-1 | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – |
| g-third-A2 | Geher-Ende |  | | | | | | | | | | | | | | | | | | | |
| g-third-B1 | steht | 79.9 | 10.9 | 16.7 | 17.0 | 4.50 | 6.1 | 7.0 | 12.50 | 0.16 | 1.80 | 11.94 | 5.86 | 7.72 | 0.71 | 0.07 | – | – | – | – | 0.27 |
| g-third-B1 | geht-1 | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – |
| g-third-B1 | Geher-Ende |  | | | | | | | | | | | | | | | | | | | |
| g-third-B2 | steht | 79.6 | 16.5 | 16.7 | 16.8 | 5.40 | 6.9 | 7.8 | 12.60 | 0.19 | 1.75 | 11.65 | 6.84 | 9.19 | 0.82 | 0.09 | – | – | – | – | 0.26 |
| g-third-B2 | geht-1 | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – |
| g-third-B2 | Geher-Ende |  | | | | | | | | | | | | | | | | | | | |

## Tier-Zensus je Boot (zensus-0 nach umstellen · zensus-1 nach geht-1)

- g-third-A1: vorher 5 (bear 1, wolf 4; Würfe≥2 1: wolf 4 Spanne 1.5 m @158.6 m; Verband-Feld true, Verbände≥2 1: wolf 4 Spanne 1.5 m; Zustand {"-":5})
  nachher –
- g-third-A2: vorher 5 (bear 1, wolf 4; Würfe≥2 1: wolf 4 Spanne 1.7 m @158.5 m; Verband-Feld true, Verbände≥2 1: wolf 4 Spanne 1.7 m; Zustand {"-":5})
  nachher –
- g-third-B1: vorher 5 (bear 1, wolf 4; Würfe≥2 1: wolf 4 Spanne 1.5 m @158.6 m; Verband-Feld true, Verbände≥2 1: wolf 4 Spanne 1.5 m; Zustand {"-":5})
  nachher –
- g-third-B2: vorher 5 (wolf 5; Würfe≥2 1: wolf 5 Spanne 2.1 m @164 m; Verband-Feld true, Verbände≥2 1: wolf 5 Spanne 2.1 m; Zustand {"-":5})
  nachher –

## GPU-Takt je Boot (nvidia-smi 1 s, nur P0-Sekunden: Median-MHz · Anteil Drossel (Grund ≠ 0 ohne GpuIdle 0x1) · max °C)

- g-third-A1: 72 s · 1746 MHz · Drossel 31 % · 86 °C
- g-third-A2: 75 s · 1746 MHz · Drossel 35 % · 87 °C
- g-third-B1: 110 s · 1733 MHz · Drossel 17 % · 86 °C
- g-third-B2: 99 s · 1733 MHz · Drossel 21 % · 86 °C

## Mittel je Seite (A 4a5f5e2c · B 8f1802b1; gehend = geht-1 je Boot)

| Gang | Größe | A | B | Δ B − A | 2σ | t (Welch) | Urteil |
|---|---|---|---|---|---|---|---|
| steht | fps | 79.3 (79.9 · 78.6) | 79.8 (79.9 · 79.6) | +0.5 | 1.3 | 0.75 | nicht langsamer |
| steht | Frame p50 ms | 15.7 (14.9 · 16.5) | 13.7 (10.9 · 16.5) | -2.0 | 5.8 | -0.69 | nicht langsamer |
| steht | Frame p95 ms | 16.7 (16.7 · 16.7) | 16.7 (16.7 · 16.7) | 0.0 | 0.0 | – | nicht langsamer |
| steht | Frame p99 ms | 17.1 (17.0 · 17.1) | 16.9 (17.0 · 16.8) | -0.2 | 0.2 | -1.34 | nicht langsamer |
| steht | CPU-Takt p50 ms | 5.05 (4.30 · 5.80) | 4.95 (4.50 · 5.40) | -0.10 | 1.75 | -0.11 | nicht langsamer |
| steht | CPU-Takt p95 ms | 6.4 (5.3 · 7.6) | 6.5 (6.1 · 6.9) | +0.1 | 2.4 | 0.04 | nicht langsamer |
| steht | CPU-Takt p99 ms | 7.4 (6.3 · 8.6) | 7.4 (7.0 · 7.8) | -0.0 | 2.4 | -0.04 | nicht langsamer |
| steht | GPU-Durchsatz p50 ms | 12.65 (12.60 · 12.70) | 12.55 (12.50 · 12.60) | -0.10 | 0.14 | -1.41 | nicht langsamer |
| steht | k0 p50 ms | 0.17 (0.17 · 0.18) | 0.17 (0.16 · 0.19) | 0.00 | 0.03 | 0.00 | nicht langsamer |
| steht | GPU p95 ms (lauf) | 1.77 (1.78 · 1.75) | 1.77 (1.80 · 1.75) | +0.01 | 0.06 | 0.34 | nicht langsamer |
| steht | GPU je Bild ms (gpu-bank) | 12.11 (12.14 · 12.07) | 11.79 (11.94 · 11.65) | -0.31 | 0.30 | -2.08 | nicht langsamer |
| steht | Belegung p50 ms | 6.47 (5.48 · 7.46) | 6.35 (5.86 · 6.84) | -0.12 | 2.21 | -0.11 | nicht langsamer |
| steht | Belegung p95 ms | 8.61 (6.93 · 10.28) | 8.46 (7.72 · 9.19) | -0.15 | 3.66 | -0.08 | nicht langsamer |
| steht | außer Takt p95 ms | 0.83 (0.69 · 0.97) | 0.76 (0.71 · 0.82) | -0.07 | 0.30 | -0.43 | nicht langsamer |
| steht | Lebenszyklus p95 ms | 0.08 (0.07 · 0.09) | 0.08 (0.07 · 0.09) | 0.00 | 0.03 | 0.00 | nicht langsamer |
| steht | über 33 ms % | – (– · –) | – (– · –) | – | – | – | – |
| steht | KI-Uhr Mittel ms | – (– · –) | – (– · –) | – | – | – | – |
| steht | KI-Uhr p95 ms | – (– · –) | – (– · –) | – | – | – | – |
| steht | KI-Uhr p99 ms | – (– · –) | – (– · –) | – | – | – | – |
| steht | KI-Takt EWMA ms | 0.31 (0.27 · 0.34) | 0.27 (0.27 · 0.26) | -0.04 | 0.07 | -1.13 | nicht langsamer |
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
