## g-third — je Boot

| Boot | Gang | fps | Frame p50 ms | Frame p95 ms | Frame p99 ms | CPU-Takt p50 ms | CPU-Takt p95 ms | CPU-Takt p99 ms | GPU-Durchsatz p50 ms | k0 p50 ms | GPU p95 ms (lauf) | GPU je Bild ms (gpu-bank) | Belegung p50 ms | Belegung p95 ms | außer Takt p95 ms | Lebenszyklus p95 ms | über 33 ms % | KI-Uhr Mittel ms | KI-Uhr p95 ms | KI-Uhr p99 ms | KI-Takt EWMA ms |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| g-third-A1 | steht | 79.8 | 9.8 | 16.8 | 17.0 | 4.60 | 6.1 | 7.5 | 12.50 | 0.20 | 2.26 | 11.12 | 5.91 | 7.67 | 0.72 | 0.07 | – | – | – | – | 0.41 |
| g-third-A1 | geht-1 | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – |
| g-third-A1 | Geher-Ende |  | | | | | | | | | | | | | | | | | | | |
| g-third-A2 | steht | 79.9 | 9.9 | 16.8 | 17.0 | 4.60 | 6.1 | 7.2 | 12.60 | 0.20 | 2.25 | 11.34 | 5.94 | 7.75 | 0.72 | 0.07 | – | – | – | – | 0.36 |
| g-third-A2 | geht-1 | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – |
| g-third-A2 | Geher-Ende |  | | | | | | | | | | | | | | | | | | | |
| g-third-B1 | steht | 79.4 | 15.9 | 16.8 | 17.1 | 5.30 | 6.9 | 9.1 | 12.60 | 0.20 | 2.33 | 11.48 | 6.79 | 9.04 | 0.83 | 0.09 | – | – | – | – | 0.47 |
| g-third-B1 | geht-1 | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – |
| g-third-B1 | Geher-Ende |  | | | | | | | | | | | | | | | | | | | |
| g-third-B2 | steht | 79.9 | 10.4 | 16.8 | 17.0 | 4.50 | 5.9 | 7.1 | 12.60 | 0.20 | 2.26 | 11.71 | 5.79 | 7.49 | 0.72 | 0.08 | – | – | – | – | 0.35 |
| g-third-B2 | geht-1 | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – |
| g-third-B2 | Geher-Ende |  | | | | | | | | | | | | | | | | | | | |

## Tier-Zensus je Boot (zensus-0 nach umstellen · zensus-1 nach geht-1)

- g-third-A1: vorher 10 (fox 4, deer 4, bear 2; Würfe≥2 1: deer 4 Spanne 2 m @150.4 m; Verband-Feld true, Verbände≥2 1: deer 4 Spanne 2 m; Zustand {"-":10})
  nachher –
- g-third-A2: vorher 10 (fox 4, deer 4, bear 2; Würfe≥2 1: deer 4 Spanne 2.1 m @150.2 m; Verband-Feld true, Verbände≥2 1: deer 4 Spanne 2.1 m; Zustand {"-":10})
  nachher –
- g-third-B1: vorher 10 (fox 4, deer 4, bear 2; Würfe≥2 1: deer 4 Spanne 2.3 m @150.3 m; Verband-Feld true, Verbände≥2 1: deer 4 Spanne 2.3 m; Zustand {"-":10})
  nachher –
- g-third-B2: vorher 10 (fox 4, deer 4, bear 2; Würfe≥2 1: deer 4 Spanne 2.1 m @150.3 m; Verband-Feld true, Verbände≥2 1: deer 4 Spanne 2.1 m; Zustand {"-":10})
  nachher –

## GPU-Takt je Boot (nvidia-smi 1 s, nur P0-Sekunden: Median-MHz · Anteil Drossel (Grund ≠ 0 ohne GpuIdle 0x1) · max °C)

- g-third-A1: 104 s · 1733 MHz · Drossel 20 % · 86 °C
- g-third-A2: 102 s · 1746 MHz · Drossel 22 % · 86 °C
- g-third-B1: 81 s · 1746 MHz · Drossel 20 % · 86 °C
- g-third-B2: 108 s · 1733 MHz · Drossel 22 % · 86 °C

## Mittel je Seite (A 32b37933 main · B 5951786f integ-probe; gehend = geht-1 je Boot)

| Gang | Größe | A | B | Δ B − A | 2σ | t (Welch) | Urteil |
|---|---|---|---|---|---|---|---|
| steht | fps | 79.8 (79.8 · 79.9) | 79.7 (79.4 · 79.9) | -0.2 | 0.5 | -0.78 | nicht langsamer |
| steht | Frame p50 ms | 9.9 (9.8 · 9.9) | 13.2 (15.9 · 10.4) | +3.3 | 5.5 | 1.20 | nicht langsamer |
| steht | Frame p95 ms | 16.8 (16.8 · 16.8) | 16.8 (16.8 · 16.8) | 0.0 | 0.0 | – | nicht langsamer |
| steht | Frame p99 ms | 17.0 (17.0 · 17.0) | 17.1 (17.1 · 17.0) | +0.1 | 0.1 | 1.00 | nicht langsamer |
| steht | CPU-Takt p50 ms | 4.60 (4.60 · 4.60) | 4.90 (5.30 · 4.50) | +0.30 | 0.80 | 0.75 | nicht langsamer |
| steht | CPU-Takt p95 ms | 6.1 (6.1 · 6.1) | 6.4 (6.9 · 5.9) | +0.3 | 1.0 | 0.60 | nicht langsamer |
| steht | CPU-Takt p99 ms | 7.3 (7.5 · 7.2) | 8.1 (9.1 · 7.1) | +0.8 | 2.0 | 0.74 | nicht langsamer |
| steht | GPU-Durchsatz p50 ms | 12.55 (12.50 · 12.60) | 12.60 (12.60 · 12.60) | +0.05 | 0.10 | 1.00 | nicht langsamer |
| steht | k0 p50 ms | 0.20 (0.20 · 0.20) | 0.20 (0.20 · 0.20) | 0.00 | 0.00 | – | nicht langsamer |
| steht | GPU p95 ms (lauf) | 2.25 (2.26 · 2.25) | 2.29 (2.33 · 2.26) | +0.04 | 0.07 | 1.13 | nicht langsamer |
| steht | GPU je Bild ms (gpu-bank) | 11.23 (11.12 · 11.34) | 11.60 (11.48 · 11.71) | +0.37 | 0.32 | 2.29 | LANGSAMER |
| steht | Belegung p50 ms | 5.93 (5.91 · 5.94) | 6.29 (6.79 · 5.79) | +0.36 | 1.00 | 0.73 | nicht langsamer |
| steht | Belegung p95 ms | 7.71 (7.67 · 7.75) | 8.27 (9.04 · 7.49) | +0.56 | 1.55 | 0.72 | nicht langsamer |
| steht | außer Takt p95 ms | 0.72 (0.72 · 0.72) | 0.77 (0.83 · 0.72) | +0.05 | 0.11 | 1.00 | nicht langsamer |
| steht | Lebenszyklus p95 ms | 0.07 (0.07 · 0.07) | 0.08 (0.09 · 0.08) | +0.01 | 0.01 | 3.00 | LANGSAMER |
| steht | über 33 ms % | – (– · –) | – (– · –) | – | – | – | – |
| steht | KI-Uhr Mittel ms | – (– · –) | – (– · –) | – | – | – | – |
| steht | KI-Uhr p95 ms | – (– · –) | – (– · –) | – | – | – | – |
| steht | KI-Uhr p99 ms | – (– · –) | – (– · –) | – | – | – | – |
| steht | KI-Takt EWMA ms | 0.39 (0.41 · 0.36) | 0.41 (0.47 · 0.35) | +0.02 | 0.13 | 0.38 | nicht langsamer |
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

**KERN-URTEIL GEHEN g-third** (steht + geht × fps · Frame p95 · CPU-Takt p95 · GPU je Bild (gpu-bank, nur steht) · Belegung p95; Δ ≤ max(2σ gepoolt, Auflösung)): LANGSAMER an steht GPU je Bild ms (gpu-bank) (5 Größen)
