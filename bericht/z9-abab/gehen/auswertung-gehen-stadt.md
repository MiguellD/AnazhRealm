## stadt — je Boot

| Boot | Gang | fps | Frame p50 ms | Frame p95 ms | Frame p99 ms | CPU-Takt p50 ms | CPU-Takt p95 ms | CPU-Takt p99 ms | GPU-Durchsatz p50 ms | k0 p50 ms | GPU p95 ms (lauf) | GPU je Bild ms (gpu-bank) | Belegung p50 ms | Belegung p95 ms | außer Takt p95 ms | Lebenszyklus p95 ms | über 33 ms % | KI-Uhr Mittel ms | KI-Uhr p95 ms | KI-Uhr p99 ms | KI-Takt EWMA ms |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| stadt-A1 | steht | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – |
| stadt-A1 | geht-1 | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – |
| stadt-A1 | Geher-Ende |  | | | | | | | | | | | | | | | | | | | |
| stadt-A2 | steht | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – |
| stadt-A2 | geht-1 | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – |
| stadt-A2 | Geher-Ende |  | | | | | | | | | | | | | | | | | | | |
| stadt-B1 | steht | 79.2 | 16.2 | 16.8 | 17.0 | 5.10 | 6.9 | 9.4 | 12.60 | 0.26 | 2.56 | – | 7.15 | 10.20 | 0.82 | 0.08 | – | – | – | – | 2.19 |
| stadt-B1 | geht-1 | 38.3 | 24.9 | 50.0 | 91.6 | 20.70 | 43.0 | 72.8 | 21.90 | 0.34 | 2.14 | – | 21.95 | 49.36 | 4.48 | 0.12 | – | – | – | – | 1.92 |
| stadt-B1 | Geher-Ende |  | | | | | | | | | | | | | | | | | | | |
| stadt-B2 | steht | 78.5 | 16.3 | 16.7 | 17.4 | 5.20 | 6.9 | 8.8 | 12.60 | 0.26 | 2.75 | – | 7.24 | 9.88 | 0.80 | 0.10 | – | – | – | – | 2.02 |
| stadt-B2 | geht-1 | 38.8 | 24.9 | 50.0 | 91.6 | 20.70 | 44.8 | 78.9 | 21.90 | 0.33 | 2.24 | – | 21.85 | 49.45 | 3.93 | 0.12 | – | – | – | – | 2.26 |
| stadt-B2 | Geher-Ende |  | | | | | | | | | | | | | | | | | | | |

## Tier-Zensus je Boot (zensus-0 nach umstellen · zensus-1 nach geht-1)

- stadt-A1: vorher –
  nachher –
- stadt-A2: vorher –
  nachher –
- stadt-B1: vorher 8 (deer 7, fox 1; Würfe≥2 1: deer 7 Spanne 4.3 m @179.1 m; Verband-Feld true, Verbände≥2 1: deer 7 Spanne 4.3 m; Zustand {"-":8})
  nachher 8 (deer 7, fox 1; Würfe≥2 1: deer 7 Spanne 5.7 m @177.9 m; Verband-Feld true, Verbände≥2 1: deer 7 Spanne 5.7 m; Zustand {"-":8})
- stadt-B2: vorher 8 (deer 7, fox 1; Würfe≥2 1: deer 7 Spanne 4.4 m @177.6 m; Verband-Feld true, Verbände≥2 1: deer 7 Spanne 4.4 m; Zustand {"-":8})
  nachher 8 (deer 7, fox 1; Würfe≥2 1: deer 7 Spanne 5.2 m @175.8 m; Verband-Feld true, Verbände≥2 1: deer 7 Spanne 5.2 m; Zustand {"-":8})

## GPU-Takt je Boot (nvidia-smi 1 s, nur P0-Sekunden: Median-MHz · Anteil Drossel (Grund ≠ 0 ohne GpuIdle 0x1) · max °C)

- stadt-A1: 595 s · 1746 MHz · Drossel 32 % · 87 °C
- stadt-A2: 589 s · 1746 MHz · Drossel 32 % · 87 °C
- stadt-B1: 201 s · 1582 MHz · Drossel 9 % · 87 °C
- stadt-B2: 166 s · 1746 MHz · Drossel 16 % · 87 °C

## Mittel je Seite (A f7dd313c · B a2b28770; gehend = geht-1 je Boot)

| Gang | Größe | A | B | Δ B − A | 2σ | t (Welch) | Urteil |
|---|---|---|---|---|---|---|---|
| steht | fps | – (– · –) | 78.8 (79.2 · 78.5) | – | – | – | – |
| steht | Frame p50 ms | – (– · –) | 16.3 (16.2 · 16.3) | – | – | – | – |
| steht | Frame p95 ms | – (– · –) | 16.8 (16.8 · 16.7) | – | – | – | – |
| steht | Frame p99 ms | – (– · –) | 17.2 (17.0 · 17.4) | – | – | – | – |
| steht | CPU-Takt p50 ms | – (– · –) | 5.15 (5.10 · 5.20) | – | – | – | – |
| steht | CPU-Takt p95 ms | – (– · –) | 6.9 (6.9 · 6.9) | – | – | – | – |
| steht | CPU-Takt p99 ms | – (– · –) | 9.1 (9.4 · 8.8) | – | – | – | – |
| steht | GPU-Durchsatz p50 ms | – (– · –) | 12.60 (12.60 · 12.60) | – | – | – | – |
| steht | k0 p50 ms | – (– · –) | 0.26 (0.26 · 0.26) | – | – | – | – |
| steht | GPU p95 ms (lauf) | – (– · –) | 2.66 (2.56 · 2.75) | – | – | – | – |
| steht | GPU je Bild ms (gpu-bank) | – (– · –) | – (– · –) | – | – | – | – |
| steht | Belegung p50 ms | – (– · –) | 7.20 (7.15 · 7.24) | – | – | – | – |
| steht | Belegung p95 ms | – (– · –) | 10.04 (10.20 · 9.88) | – | – | – | – |
| steht | außer Takt p95 ms | – (– · –) | 0.81 (0.82 · 0.80) | – | – | – | – |
| steht | Lebenszyklus p95 ms | – (– · –) | 0.09 (0.08 · 0.10) | – | – | – | – |
| steht | über 33 ms % | – (– · –) | – (– · –) | – | – | – | – |
| steht | KI-Uhr Mittel ms | – (– · –) | – (– · –) | – | – | – | – |
| steht | KI-Uhr p95 ms | – (– · –) | – (– · –) | – | – | – | – |
| steht | KI-Uhr p99 ms | – (– · –) | – (– · –) | – | – | – | – |
| steht | KI-Takt EWMA ms | – (– · –) | 2.10 (2.19 · 2.02) | – | – | – | – |
| geht | fps | – (– · –) | 38.5 (38.3 · 38.8) | – | – | – | – |
| geht | Frame p50 ms | – (– · –) | 24.9 (24.9 · 24.9) | – | – | – | – |
| geht | Frame p95 ms | – (– · –) | 50.0 (50.0 · 50.0) | – | – | – | – |
| geht | Frame p99 ms | – (– · –) | 91.6 (91.6 · 91.6) | – | – | – | – |
| geht | CPU-Takt p50 ms | – (– · –) | 20.70 (20.70 · 20.70) | – | – | – | – |
| geht | CPU-Takt p95 ms | – (– · –) | 43.9 (43.0 · 44.8) | – | – | – | – |
| geht | CPU-Takt p99 ms | – (– · –) | 75.8 (72.8 · 78.9) | – | – | – | – |
| geht | GPU-Durchsatz p50 ms | – (– · –) | 21.90 (21.90 · 21.90) | – | – | – | – |
| geht | k0 p50 ms | – (– · –) | 0.34 (0.34 · 0.33) | – | – | – | – |
| geht | GPU p95 ms (lauf) | – (– · –) | 2.19 (2.14 · 2.24) | – | – | – | – |
| geht | GPU je Bild ms (gpu-bank) | – (– · –) | – (– · –) | – | – | – | – |
| geht | Belegung p50 ms | – (– · –) | 21.90 (21.95 · 21.85) | – | – | – | – |
| geht | Belegung p95 ms | – (– · –) | 49.41 (49.36 · 49.45) | – | – | – | – |
| geht | außer Takt p95 ms | – (– · –) | 4.21 (4.48 · 3.93) | – | – | – | – |
| geht | Lebenszyklus p95 ms | – (– · –) | 0.12 (0.12 · 0.12) | – | – | – | – |
| geht | über 33 ms % | – (– · –) | – (– · –) | – | – | – | – |
| geht | KI-Uhr Mittel ms | – (– · –) | – (– · –) | – | – | – | – |
| geht | KI-Uhr p95 ms | – (– · –) | – (– · –) | – | – | – | – |
| geht | KI-Uhr p99 ms | – (– · –) | – (– · –) | – | – | – | – |
| geht | KI-Takt EWMA ms | – (– · –) | 2.09 (1.92 · 2.26) | – | – | – | – |

**KERN-URTEIL GEHEN stadt** (steht + geht × fps · Frame p95 · CPU-Takt p95 · GPU je Bild (gpu-bank, nur steht) · Belegung p95; Δ ≤ max(2σ gepoolt, Auflösung)): nicht langsamer (0 Größen)
