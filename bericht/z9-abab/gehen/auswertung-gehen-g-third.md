## g-third — je Boot

| Boot | Gang | fps | Frame p50 ms | Frame p95 ms | Frame p99 ms | CPU-Takt p50 ms | CPU-Takt p95 ms | CPU-Takt p99 ms | GPU-Durchsatz p50 ms | k0 p50 ms | GPU p95 ms (lauf) | GPU je Bild ms (gpu-bank) | Belegung p50 ms | Belegung p95 ms | außer Takt p95 ms | Lebenszyklus p95 ms | über 33 ms % | KI-Uhr Mittel ms | KI-Uhr p95 ms | KI-Uhr p99 ms | KI-Takt EWMA ms |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| g-third-A1 | steht | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – |
| g-third-A1 | geht-1 | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – |
| g-third-A1 | Geher-Ende |  | | | | | | | | | | | | | | | | | | | |
| g-third-A2 | steht | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – |
| g-third-A2 | geht-1 | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – |
| g-third-A2 | Geher-Ende |  | | | | | | | | | | | | | | | | | | | |
| g-third-B1 | steht | 81.5 | 8.5 | 16.8 | 17.0 | 4.10 | 5.4 | 6.3 | 12.10 | 0.20 | 2.09 | 11.38 | 5.19 | 6.78 | 0.69 | 0.07 | – | – | – | – | 0.22 |
| g-third-B1 | geht-1 | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – |
| g-third-B1 | Geher-Ende |  | | | | | | | | | | | | | | | | | | | |
| g-third-B2 | steht | 81.6 | 8.5 | 16.8 | 16.9 | 4.10 | 5.2 | 6.2 | 12.10 | 0.19 | 1.76 | 11.29 | 5.21 | 6.74 | 0.69 | 0.07 | – | – | – | – | 0.16 |
| g-third-B2 | geht-1 | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – |
| g-third-B2 | Geher-Ende |  | | | | | | | | | | | | | | | | | | | |

## Tier-Zensus je Boot (zensus-0 nach umstellen · zensus-1 nach geht-1)

- g-third-A1: vorher –
  nachher –
- g-third-A2: vorher –
  nachher –
- g-third-B1: vorher 5 (bear 1, wolf 4; Würfe≥2 1: wolf 4 Spanne 1.4 m @158.8 m; Verband-Feld true, Verbände≥2 1: wolf 4 Spanne 1.4 m; Zustand {"-":5})
  nachher –
- g-third-B2: vorher 5 (bear 1, wolf 4; Würfe≥2 1: wolf 4 Spanne 1.4 m @158.8 m; Verband-Feld true, Verbände≥2 1: wolf 4 Spanne 1.4 m; Zustand {"-":5})
  nachher –

## GPU-Takt je Boot (nvidia-smi 1 s, nur P0-Sekunden: Median-MHz · Anteil Drossel (Grund ≠ 0 ohne GpuIdle 0x1) · max °C)

- g-third-A1: 601 s · 1721 MHz · Drossel 45 % · 87 °C
- g-third-A2: 602 s · 1721 MHz · Drossel 41 % · 87 °C
- g-third-B1: 91 s · 1733 MHz · Drossel 12 % · 86 °C
- g-third-B2: 87 s · 1733 MHz · Drossel 28 % · 87 °C

## Mittel je Seite (A f7dd313c · B a2b28770; gehend = geht-1 je Boot)

| Gang | Größe | A | B | Δ B − A | 2σ | t (Welch) | Urteil |
|---|---|---|---|---|---|---|---|
| steht | fps | – (– · –) | 81.5 (81.5 · 81.6) | – | – | – | – |
| steht | Frame p50 ms | – (– · –) | 8.5 (8.5 · 8.5) | – | – | – | – |
| steht | Frame p95 ms | – (– · –) | 16.8 (16.8 · 16.8) | – | – | – | – |
| steht | Frame p99 ms | – (– · –) | 16.9 (17.0 · 16.9) | – | – | – | – |
| steht | CPU-Takt p50 ms | – (– · –) | 4.10 (4.10 · 4.10) | – | – | – | – |
| steht | CPU-Takt p95 ms | – (– · –) | 5.3 (5.4 · 5.2) | – | – | – | – |
| steht | CPU-Takt p99 ms | – (– · –) | 6.3 (6.3 · 6.2) | – | – | – | – |
| steht | GPU-Durchsatz p50 ms | – (– · –) | 12.10 (12.10 · 12.10) | – | – | – | – |
| steht | k0 p50 ms | – (– · –) | 0.20 (0.20 · 0.19) | – | – | – | – |
| steht | GPU p95 ms (lauf) | – (– · –) | 1.92 (2.09 · 1.76) | – | – | – | – |
| steht | GPU je Bild ms (gpu-bank) | – (– · –) | 11.34 (11.38 · 11.29) | – | – | – | – |
| steht | Belegung p50 ms | – (– · –) | 5.20 (5.19 · 5.21) | – | – | – | – |
| steht | Belegung p95 ms | – (– · –) | 6.76 (6.78 · 6.74) | – | – | – | – |
| steht | außer Takt p95 ms | – (– · –) | 0.69 (0.69 · 0.69) | – | – | – | – |
| steht | Lebenszyklus p95 ms | – (– · –) | 0.07 (0.07 · 0.07) | – | – | – | – |
| steht | über 33 ms % | – (– · –) | – (– · –) | – | – | – | – |
| steht | KI-Uhr Mittel ms | – (– · –) | – (– · –) | – | – | – | – |
| steht | KI-Uhr p95 ms | – (– · –) | – (– · –) | – | – | – | – |
| steht | KI-Uhr p99 ms | – (– · –) | – (– · –) | – | – | – | – |
| steht | KI-Takt EWMA ms | – (– · –) | 0.19 (0.22 · 0.16) | – | – | – | – |
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

**KERN-URTEIL GEHEN g-third** (steht + geht × fps · Frame p95 · CPU-Takt p95 · GPU je Bild (gpu-bank, nur steht) · Belegung p95; Δ ≤ max(2σ gepoolt, Auflösung)): nicht langsamer (0 Größen)
