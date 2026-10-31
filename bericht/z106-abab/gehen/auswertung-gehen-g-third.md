## g-third — je Boot

| Boot | Gang | fps | Frame p50 ms | Frame p95 ms | Frame p99 ms | CPU-Takt p50 ms | CPU-Takt p95 ms | CPU-Takt p99 ms | GPU-Durchsatz p50 ms | k0 p50 ms | GPU p95 ms (lauf) | GPU je Bild ms (gpu-bank) | Belegung p50 ms | Belegung p95 ms | außer Takt p95 ms | Lebenszyklus p95 ms | über 33 ms % | KI-Uhr Mittel ms | KI-Uhr p95 ms | KI-Uhr p99 ms | KI-Takt EWMA ms |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| g-third-A1 | steht | 76.8 | 16.5 | 16.8 | 17.4 | 5.60 | 7.3 | 8.8 | 12.80 | 0.19 | 1.78 | 12.42 | 7.33 | 10.28 | 0.95 | 0.11 | – | – | – | – | 0.86 |
| g-third-A1 | geht-1 | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – |
| g-third-A1 | Geher-Ende |  | | | | | | | | | | | | | | | | | | | |
| g-third-A2 | steht | 76.5 | 16.6 | 16.8 | 17.1 | 5.30 | 7.2 | 8.5 | 12.90 | 0.16 | 1.79 | 12.57 | 6.94 | 9.69 | 0.87 | 0.10 | – | – | – | – | 0.96 |
| g-third-A2 | geht-1 | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – |
| g-third-A2 | Geher-Ende |  | | | | | | | | | | | | | | | | | | | |
| g-third-B1 | steht | 77.7 | 16.6 | 16.8 | 17.0 | 5.10 | 6.7 | 8.0 | 12.80 | 0.17 | 1.67 | 12.78 | 6.78 | 9.22 | 0.84 | 0.11 | – | – | – | – | 0.94 |
| g-third-B1 | geht-1 | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – |
| g-third-B1 | Geher-Ende |  | | | | | | | | | | | | | | | | | | | |
| g-third-B2 | steht | 79.3 | 16.5 | 16.8 | 17.0 | 5.10 | 6.3 | 8.2 | 12.50 | 0.17 | 1.68 | 12.24 | 6.50 | 8.77 | 0.84 | 0.10 | – | – | – | – | 0.84 |
| g-third-B2 | geht-1 | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – |
| g-third-B2 | Geher-Ende |  | | | | | | | | | | | | | | | | | | | |

## Tier-Zensus je Boot (zensus-0 nach umstellen · zensus-1 nach geht-1)

- g-third-A1: vorher 5 (bear 1, wolf 4; Würfe≥2 1: wolf 4 Spanne 1.5 m @161.7 m; Verband-Feld true, Verbände≥2 1: wolf 4 Spanne 1.5 m; Zustand {"-":5})
  nachher –
- g-third-A2: vorher 5 (bear 1, wolf 4; Würfe≥2 1: wolf 4 Spanne 1.6 m @161.6 m; Verband-Feld true, Verbände≥2 1: wolf 4 Spanne 1.6 m; Zustand {"-":5})
  nachher –
- g-third-B1: vorher 5 (bear 1, wolf 4; Würfe≥2 1: wolf 4 Spanne 1.5 m @161.8 m; Verband-Feld true, Verbände≥2 1: wolf 4 Spanne 1.5 m; Zustand {"-":5})
  nachher –
- g-third-B2: vorher 5 (bear 1, wolf 4; Würfe≥2 1: wolf 4 Spanne 1.5 m @161.7 m; Verband-Feld true, Verbände≥2 1: wolf 4 Spanne 1.5 m; Zustand {"-":5})
  nachher –

## GPU-Takt je Boot (nvidia-smi 1 s, nur P0-Sekunden: Median-MHz · Anteil Drossel (Grund ≠ 0 ohne GpuIdle 0x1) · max °C)

- g-third-A1: 73 s · 1759 MHz · Drossel 41 % · 83 °C
- g-third-A2: 75 s · 1746 MHz · Drossel 40 % · 86 °C
- g-third-B1: 75 s · 1746 MHz · Drossel 41 % · 86 °C
- g-third-B2: 79 s · 1733 MHz · Drossel 37 % · 86 °C

## Mittel je Seite (A 48cc0efc · B b4bcf19c; gehend = geht-1 je Boot)

| Gang | Größe | A | B | Δ B − A | 2σ | t (Welch) | Urteil |
|---|---|---|---|---|---|---|---|
| steht | fps | 76.7 (76.8 · 76.5) | 78.5 (77.7 · 79.3) | +1.8 | 1.6 | 2.27 | nicht langsamer |
| steht | Frame p50 ms | 16.6 (16.5 · 16.6) | 16.6 (16.6 · 16.5) | 0.0 | 0.1 | 0.00 | nicht langsamer |
| steht | Frame p95 ms | 16.8 (16.8 · 16.8) | 16.8 (16.8 · 16.8) | 0.0 | 0.0 | – | nicht langsamer |
| steht | Frame p99 ms | 17.3 (17.4 · 17.1) | 17.0 (17.0 · 17.0) | -0.3 | 0.3 | -1.67 | nicht langsamer |
| steht | CPU-Takt p50 ms | 5.45 (5.60 · 5.30) | 5.10 (5.10 · 5.10) | -0.35 | 0.30 | -2.33 | nicht langsamer |
| steht | CPU-Takt p95 ms | 7.3 (7.3 · 7.2) | 6.5 (6.7 · 6.3) | -0.8 | 0.4 | -3.64 | nicht langsamer |
| steht | CPU-Takt p99 ms | 8.7 (8.8 · 8.5) | 8.1 (8.0 · 8.2) | -0.6 | 0.4 | -3.05 | nicht langsamer |
| steht | GPU-Durchsatz p50 ms | 12.85 (12.80 · 12.90) | 12.65 (12.80 · 12.50) | -0.20 | 0.32 | -1.26 | nicht langsamer |
| steht | k0 p50 ms | 0.17 (0.19 · 0.16) | 0.17 (0.17 · 0.17) | -0.00 | 0.03 | -0.33 | nicht langsamer |
| steht | GPU p95 ms (lauf) | 1.79 (1.78 · 1.79) | 1.67 (1.67 · 1.68) | -0.11 | 0.01 | -15.56 | nicht langsamer |
| steht | GPU je Bild ms (gpu-bank) | 12.50 (12.42 · 12.57) | 12.51 (12.78 · 12.24) | +0.01 | 0.56 | 0.05 | nicht langsamer |
| steht | Belegung p50 ms | 7.13 (7.33 · 6.94) | 6.64 (6.78 · 6.50) | -0.49 | 0.48 | -2.06 | nicht langsamer |
| steht | Belegung p95 ms | 9.98 (10.28 · 9.69) | 9.00 (9.22 · 8.77) | -0.99 | 0.74 | -2.67 | nicht langsamer |
| steht | außer Takt p95 ms | 0.91 (0.95 · 0.87) | 0.84 (0.84 · 0.84) | -0.07 | 0.08 | -1.75 | nicht langsamer |
| steht | Lebenszyklus p95 ms | 0.11 (0.11 · 0.10) | 0.11 (0.11 · 0.10) | 0.00 | 0.01 | 0.00 | nicht langsamer |
| steht | über 33 ms % | – (– · –) | – (– · –) | – | – | – | – |
| steht | KI-Uhr Mittel ms | – (– · –) | – (– · –) | – | – | – | – |
| steht | KI-Uhr p95 ms | – (– · –) | – (– · –) | – | – | – | – |
| steht | KI-Uhr p99 ms | – (– · –) | – (– · –) | – | – | – | – |
| steht | KI-Takt EWMA ms | 0.91 (0.86 · 0.96) | 0.89 (0.94 · 0.84) | -0.02 | 0.14 | -0.28 | nicht langsamer |
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
