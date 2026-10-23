## w-ego — je Boot

| Boot | Gang | fps | Frame p50 ms | Frame p95 ms | Frame p99 ms | CPU-Takt p50 ms | CPU-Takt p95 ms | CPU-Takt p99 ms | GPU-Durchsatz p50 ms | k0 p50 ms | GPU p95 ms (lauf) | GPU je Bild ms (gpu-bank) | Belegung p50 ms | Belegung p95 ms | außer Takt p95 ms | Lebenszyklus p95 ms | über 33 ms % | KI-Uhr Mittel ms | KI-Uhr p95 ms | KI-Uhr p99 ms | KI-Takt EWMA ms |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| w-ego-A1 | steht | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – |
| w-ego-A1 | geht-1 | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – |
| w-ego-A1 | Geher-Ende |  | | | | | | | | | | | | | | | | | | | |
| w-ego-A2 | steht | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – |
| w-ego-A2 | geht-1 | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – |
| w-ego-A2 | Geher-Ende |  | | | | | | | | | | | | | | | | | | | |
| w-ego-B1 | steht | 77.4 | 16.5 | 16.8 | 17.0 | 3.20 | 4.3 | 5.3 | 12.90 | 0.26 | 2.03 | 12.27 | 4.54 | 6.19 | 0.76 | 0.08 | – | – | – | – | 0.27 |
| w-ego-B1 | geht-1 | 60.7 | 16.6 | 25.1 | 33.4 | 11.50 | 19.3 | 26.8 | 16.00 | 0.24 | 2.42 | – | 15.49 | 22.17 | 1.82 | 0.10 | – | – | – | – | 0.30 |
| w-ego-B1 | Geher-Ende |  | | | | | | | | | | | | | | | | | | | |
| w-ego-B2 | steht | 78.1 | 16.5 | 16.8 | 17.0 | 2.90 | 3.8 | 4.8 | 12.60 | 0.26 | 2.04 | 12.47 | 3.90 | 5.45 | 0.70 | 0.08 | – | – | – | – | 0.21 |
| w-ego-B2 | geht-1 | 61.7 | 16.6 | 25.1 | 33.4 | 11.10 | 19.3 | 29.9 | 15.50 | 0.24 | 2.38 | – | 14.99 | 22.28 | 1.72 | 0.09 | – | – | – | – | 0.25 |
| w-ego-B2 | Geher-Ende |  | | | | | | | | | | | | | | | | | | | |

## Tier-Zensus je Boot (zensus-0 nach umstellen · zensus-1 nach geht-1)

- w-ego-A1: vorher –
  nachher –
- w-ego-A2: vorher –
  nachher –
- w-ego-B1: vorher 6 (fox 1, deer 5; Würfe≥2 1: deer 5 Spanne 2.7 m @199 m; Verband-Feld true, Verbände≥2 1: deer 5 Spanne 2.7 m; Zustand {"-":6})
  nachher 6 (fox 1, deer 5; Würfe≥2 1: deer 5 Spanne 3 m @203.8 m; Verband-Feld true, Verbände≥2 1: deer 5 Spanne 3 m; Zustand {"-":6})
- w-ego-B2: vorher 6 (fox 1, deer 5; Würfe≥2 1: deer 5 Spanne 2.6 m @165.9 m; Verband-Feld true, Verbände≥2 1: deer 5 Spanne 2.6 m; Zustand {"-":6})
  nachher 6 (fox 1, deer 5; Würfe≥2 1: deer 5 Spanne 2.9 m @170.2 m; Verband-Feld true, Verbände≥2 1: deer 5 Spanne 2.9 m; Zustand {"-":6})

## GPU-Takt je Boot (nvidia-smi 1 s, nur P0-Sekunden: Median-MHz · Anteil Drossel (Grund ≠ 0 ohne GpuIdle 0x1) · max °C)

- w-ego-A1: 597 s · 1721 MHz · Drossel 39 % · 86 °C
- w-ego-A2: 601 s · 1721 MHz · Drossel 43 % · 87 °C
- w-ego-B1: 147 s · 1708 MHz · Drossel 27 % · 86 °C
- w-ego-B2: 143 s · 1695 MHz · Drossel 39 % · 86 °C

## Mittel je Seite (A f7dd313c · B a2b28770; gehend = geht-1 je Boot)

| Gang | Größe | A | B | Δ B − A | 2σ | t (Welch) | Urteil |
|---|---|---|---|---|---|---|---|
| steht | fps | – (– · –) | 77.8 (77.4 · 78.1) | – | – | – | – |
| steht | Frame p50 ms | – (– · –) | 16.5 (16.5 · 16.5) | – | – | – | – |
| steht | Frame p95 ms | – (– · –) | 16.8 (16.8 · 16.8) | – | – | – | – |
| steht | Frame p99 ms | – (– · –) | 17.0 (17.0 · 17.0) | – | – | – | – |
| steht | CPU-Takt p50 ms | – (– · –) | 3.05 (3.20 · 2.90) | – | – | – | – |
| steht | CPU-Takt p95 ms | – (– · –) | 4.0 (4.3 · 3.8) | – | – | – | – |
| steht | CPU-Takt p99 ms | – (– · –) | 5.0 (5.3 · 4.8) | – | – | – | – |
| steht | GPU-Durchsatz p50 ms | – (– · –) | 12.75 (12.90 · 12.60) | – | – | – | – |
| steht | k0 p50 ms | – (– · –) | 0.26 (0.26 · 0.26) | – | – | – | – |
| steht | GPU p95 ms (lauf) | – (– · –) | 2.04 (2.03 · 2.04) | – | – | – | – |
| steht | GPU je Bild ms (gpu-bank) | – (– · –) | 12.37 (12.27 · 12.47) | – | – | – | – |
| steht | Belegung p50 ms | – (– · –) | 4.22 (4.54 · 3.90) | – | – | – | – |
| steht | Belegung p95 ms | – (– · –) | 5.82 (6.19 · 5.45) | – | – | – | – |
| steht | außer Takt p95 ms | – (– · –) | 0.73 (0.76 · 0.70) | – | – | – | – |
| steht | Lebenszyklus p95 ms | – (– · –) | 0.08 (0.08 · 0.08) | – | – | – | – |
| steht | über 33 ms % | – (– · –) | – (– · –) | – | – | – | – |
| steht | KI-Uhr Mittel ms | – (– · –) | – (– · –) | – | – | – | – |
| steht | KI-Uhr p95 ms | – (– · –) | – (– · –) | – | – | – | – |
| steht | KI-Uhr p99 ms | – (– · –) | – (– · –) | – | – | – | – |
| steht | KI-Takt EWMA ms | – (– · –) | 0.24 (0.27 · 0.21) | – | – | – | – |
| geht | fps | – (– · –) | 61.2 (60.7 · 61.7) | – | – | – | – |
| geht | Frame p50 ms | – (– · –) | 16.6 (16.6 · 16.6) | – | – | – | – |
| geht | Frame p95 ms | – (– · –) | 25.1 (25.1 · 25.1) | – | – | – | – |
| geht | Frame p99 ms | – (– · –) | 33.4 (33.4 · 33.4) | – | – | – | – |
| geht | CPU-Takt p50 ms | – (– · –) | 11.30 (11.50 · 11.10) | – | – | – | – |
| geht | CPU-Takt p95 ms | – (– · –) | 19.3 (19.3 · 19.3) | – | – | – | – |
| geht | CPU-Takt p99 ms | – (– · –) | 28.4 (26.8 · 29.9) | – | – | – | – |
| geht | GPU-Durchsatz p50 ms | – (– · –) | 15.75 (16.00 · 15.50) | – | – | – | – |
| geht | k0 p50 ms | – (– · –) | 0.24 (0.24 · 0.24) | – | – | – | – |
| geht | GPU p95 ms (lauf) | – (– · –) | 2.40 (2.42 · 2.38) | – | – | – | – |
| geht | GPU je Bild ms (gpu-bank) | – (– · –) | – (– · –) | – | – | – | – |
| geht | Belegung p50 ms | – (– · –) | 15.24 (15.49 · 14.99) | – | – | – | – |
| geht | Belegung p95 ms | – (– · –) | 22.23 (22.17 · 22.28) | – | – | – | – |
| geht | außer Takt p95 ms | – (– · –) | 1.77 (1.82 · 1.72) | – | – | – | – |
| geht | Lebenszyklus p95 ms | – (– · –) | 0.10 (0.10 · 0.09) | – | – | – | – |
| geht | über 33 ms % | – (– · –) | – (– · –) | – | – | – | – |
| geht | KI-Uhr Mittel ms | – (– · –) | – (– · –) | – | – | – | – |
| geht | KI-Uhr p95 ms | – (– · –) | – (– · –) | – | – | – | – |
| geht | KI-Uhr p99 ms | – (– · –) | – (– · –) | – | – | – | – |
| geht | KI-Takt EWMA ms | – (– · –) | 0.28 (0.30 · 0.25) | – | – | – | – |

**KERN-URTEIL GEHEN w-ego** (steht + geht × fps · Frame p95 · CPU-Takt p95 · GPU je Bild (gpu-bank, nur steht) · Belegung p95; Δ ≤ max(2σ gepoolt, Auflösung)): nicht langsamer (0 Größen)
