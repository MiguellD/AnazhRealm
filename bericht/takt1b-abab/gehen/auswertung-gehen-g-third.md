## g-third — je Boot

| Boot | Gang | fps | Frame p50 ms | Frame p95 ms | Frame p99 ms | CPU-Takt p50 ms | CPU-Takt p95 ms | CPU-Takt p99 ms | GPU-Durchsatz p50 ms | k0 p50 ms | GPU p95 ms (lauf) | GPU je Bild ms (gpu-bank) | Belegung p50 ms | Belegung p95 ms | außer Takt p95 ms | Lebenszyklus p95 ms | über 33 ms % | KI-Uhr Mittel ms | KI-Uhr p95 ms | KI-Uhr p99 ms | KI-Takt EWMA ms |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| g-third-A1 | steht | 79.7 | 16.0 | 16.7 | 17.0 | 4.50 | 5.7 | 6.6 | 12.60 | 0.17 | 1.74 | 12.08 | 5.76 | 7.47 | 0.72 | 0.07 | – | – | – | – | 0.29 |
| g-third-A1 | geht-1 | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – |
| g-third-A1 | Geher-Ende |  | | | | | | | | | | | | | | | | | | | |
| g-third-A2 | steht | 79.5 | 16.2 | 16.8 | 17.0 | 4.80 | 6.1 | 7.1 | 12.60 | 0.17 | 1.74 | 11.58 | 6.00 | 8.17 | 0.75 | 0.08 | – | – | – | – | 0.26 |
| g-third-A2 | geht-1 | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – |
| g-third-A2 | Geher-Ende |  | | | | | | | | | | | | | | | | | | | |
| g-third-B1 | steht | 79.6 | 16.2 | 16.7 | 17.0 | 4.60 | 5.9 | 7.0 | 12.60 | 0.19 | 1.80 | 12.05 | 5.93 | 7.69 | 0.71 | 0.08 | – | – | – | – | 0.21 |
| g-third-B1 | geht-1 | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – |
| g-third-B1 | Geher-Ende |  | | | | | | | | | | | | | | | | | | | |
| g-third-B2 | steht | 79.6 | 16.1 | 16.7 | 17.0 | 4.60 | 6.0 | 7.4 | 12.60 | 0.18 | 1.77 | 11.69 | 5.91 | 7.78 | 0.74 | 0.07 | – | – | – | – | 0.24 |
| g-third-B2 | geht-1 | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – |
| g-third-B2 | Geher-Ende |  | | | | | | | | | | | | | | | | | | | |

## Tier-Zensus je Boot (zensus-0 nach umstellen · zensus-1 nach geht-1)

- g-third-A1: vorher 5 (bear 1, wolf 4; Würfe≥2 1: wolf 4 Spanne 1.3 m @158.1 m; Verband-Feld true, Verbände≥2 1: wolf 4 Spanne 1.3 m; Zustand {"-":5})
  nachher –
- g-third-A2: vorher 5 (bear 1, wolf 4; Würfe≥2 1: wolf 4 Spanne 1.6 m @158.7 m; Verband-Feld true, Verbände≥2 1: wolf 4 Spanne 1.6 m; Zustand {"-":5})
  nachher –
- g-third-B1: vorher 5 (bear 1, wolf 4; Würfe≥2 1: wolf 4 Spanne 1.4 m @158.4 m; Verband-Feld true, Verbände≥2 1: wolf 4 Spanne 1.4 m; Zustand {"-":5})
  nachher –
- g-third-B2: vorher 5 (bear 1, wolf 4; Würfe≥2 1: wolf 4 Spanne 1.6 m @158.4 m; Verband-Feld true, Verbände≥2 1: wolf 4 Spanne 1.6 m; Zustand {"-":5})
  nachher –

## GPU-Takt je Boot (nvidia-smi 1 s, nur P0-Sekunden: Median-MHz · Anteil Drossel (Grund ≠ 0 ohne GpuIdle 0x1) · max °C)

- g-third-A1: 111 s · 1582 MHz · Drossel 23 % · 86 °C
- g-third-A2: 78 s · 1746 MHz · Drossel 24 % · 86 °C
- g-third-B1: 103 s · 1746 MHz · Drossel 14 % · 87 °C
- g-third-B2: 76 s · 1746 MHz · Drossel 25 % · 86 °C

## Mittel je Seite (A 79c0fae2 · B 206b395a; gehend = geht-1 je Boot)

| Gang | Größe | A | B | Δ B − A | 2σ | t (Welch) | Urteil |
|---|---|---|---|---|---|---|---|
| steht | fps | 79.6 (79.7 · 79.5) | 79.6 (79.6 · 79.6) | 0.0 | 0.2 | 0.00 | nicht langsamer |
| steht | Frame p50 ms | 16.1 (16.0 · 16.2) | 16.1 (16.2 · 16.1) | +0.0 | 0.2 | 0.45 | nicht langsamer |
| steht | Frame p95 ms | 16.8 (16.7 · 16.8) | 16.7 (16.7 · 16.7) | -0.1 | 0.1 | -1.00 | nicht langsamer |
| steht | Frame p99 ms | 17.0 (17.0 · 17.0) | 17.0 (17.0 · 17.0) | 0.0 | 0.0 | – | nicht langsamer |
| steht | CPU-Takt p50 ms | 4.65 (4.50 · 4.80) | 4.60 (4.60 · 4.60) | -0.05 | 0.30 | -0.33 | nicht langsamer |
| steht | CPU-Takt p95 ms | 5.9 (5.7 · 6.1) | 6.0 (5.9 · 6.0) | +0.0 | 0.4 | 0.24 | nicht langsamer |
| steht | CPU-Takt p99 ms | 6.8 (6.6 · 7.1) | 7.2 (7.0 · 7.4) | +0.4 | 0.6 | 1.09 | nicht langsamer |
| steht | GPU-Durchsatz p50 ms | 12.60 (12.60 · 12.60) | 12.60 (12.60 · 12.60) | 0.00 | 0.00 | – | nicht langsamer |
| steht | k0 p50 ms | 0.17 (0.17 · 0.17) | 0.18 (0.19 · 0.18) | +0.01 | 0.01 | 3.00 | LANGSAMER |
| steht | GPU p95 ms (lauf) | 1.74 (1.74 · 1.74) | 1.79 (1.80 · 1.77) | +0.05 | 0.03 | 3.00 | LANGSAMER |
| steht | GPU je Bild ms (gpu-bank) | 11.83 (12.08 · 11.58) | 11.87 (12.05 · 11.69) | +0.04 | 0.62 | 0.13 | nicht langsamer |
| steht | Belegung p50 ms | 5.88 (5.76 · 6.00) | 5.92 (5.93 · 5.91) | +0.04 | 0.24 | 0.33 | nicht langsamer |
| steht | Belegung p95 ms | 7.82 (7.47 · 8.17) | 7.74 (7.69 · 7.78) | -0.08 | 0.71 | -0.24 | nicht langsamer |
| steht | außer Takt p95 ms | 0.73 (0.72 · 0.75) | 0.72 (0.71 · 0.74) | -0.01 | 0.04 | -0.47 | nicht langsamer |
| steht | Lebenszyklus p95 ms | 0.08 (0.07 · 0.08) | 0.08 (0.08 · 0.07) | 0.00 | 0.01 | 0.00 | nicht langsamer |
| steht | über 33 ms % | – (– · –) | – (– · –) | – | – | – | – |
| steht | KI-Uhr Mittel ms | – (– · –) | – (– · –) | – | – | – | – |
| steht | KI-Uhr p95 ms | – (– · –) | – (– · –) | – | – | – | – |
| steht | KI-Uhr p99 ms | – (– · –) | – (– · –) | – | – | – | – |
| steht | KI-Takt EWMA ms | 0.28 (0.29 · 0.26) | 0.22 (0.21 · 0.24) | -0.05 | 0.04 | -2.36 | nicht langsamer |
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
