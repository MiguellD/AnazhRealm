## d-ego — je Boot

| Boot | Gang | fps | Frame p50 ms | Frame p95 ms | Frame p99 ms | CPU-Takt p50 ms | CPU-Takt p95 ms | CPU-Takt p99 ms | GPU-Durchsatz p50 ms | k0 p50 ms | GPU p95 ms (lauf) | GPU je Bild ms (gpu-bank) | Belegung p50 ms | Belegung p95 ms | außer Takt p95 ms | Lebenszyklus p95 ms | über 33 ms % | KI-Uhr Mittel ms | KI-Uhr p95 ms | KI-Uhr p99 ms | KI-Takt EWMA ms |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| d-ego-A1 | steht | 76.8 | 16.6 | 16.8 | 17.0 | 4.10 | 5.6 | 7.2 | 12.90 | 0.20 | 3.07 | 12.07 | 5.58 | 7.39 | 0.76 | 0.08 | – | 0.220 | 0.40 | 0.50 | 0.40 |
| d-ego-A1 | geht-1 | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – |
| d-ego-A1 | Geher-Ende |  | | | | | | | | | | | | | | | | | | | |
| d-ego-A2 | steht | 76.3 | 16.6 | 16.8 | 17.1 | 4.00 | 5.3 | 6.4 | 13.10 | 0.21 | 3.40 | 12.13 | 5.44 | 7.13 | 0.74 | 0.08 | – | 0.224 | 0.40 | 0.50 | 0.41 |
| d-ego-A2 | geht-1 | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – |
| d-ego-A2 | Geher-Ende |  | | | | | | | | | | | | | | | | | | | |
| d-ego-B1 | steht | 79.3 | 15.0 | 16.7 | 18.4 | 4.50 | 6.3 | 7.7 | 12.60 | 0.18 | 2.11 | 12.47 | 6.02 | 8.58 | 1.07 | 0.08 | – | 0.322 | 0.50 | 0.60 | 0.53 |
| d-ego-B1 | geht-1 | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – |
| d-ego-B1 | Geher-Ende |  | | | | | | | | | | | | | | | | | | | |
| d-ego-B2 | steht | 79.4 | 15.1 | 16.7 | 17.1 | 4.50 | 6.2 | 7.8 | 12.50 | 0.18 | 2.16 | 12.37 | 6.05 | 8.34 | 1.04 | 0.08 | – | 0.320 | 0.50 | 0.60 | 0.59 |
| d-ego-B2 | geht-1 | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – |
| d-ego-B2 | Geher-Ende |  | | | | | | | | | | | | | | | | | | | |

## Tier-Zensus je Boot (zensus-0 nach umstellen · zensus-1 nach geht-1)

- d-ego-A1: vorher 10 (bear 1, deer 6, wolf 3; Würfe≥2 2: deer 6 Spanne 3.9 m @144.3 m | wolf 3 Spanne 1.5 m @203.6 m; Verband-Feld true, Verbände≥2 2: deer 6 Spanne 3.9 m | wolf 3 Spanne 1.5 m; Zustand {"-":10})
  nachher –
- d-ego-A2: vorher 10 (bear 1, deer 6, wolf 3; Würfe≥2 2: deer 6 Spanne 4 m @142.9 m | wolf 3 Spanne 1.3 m @203.7 m; Verband-Feld true, Verbände≥2 2: deer 6 Spanne 4 m | wolf 3 Spanne 1.3 m; Zustand {"-":10})
  nachher –
- d-ego-B1: vorher 10 (bear 1, deer 6, wolf 3; Würfe≥2 2: deer 6 Spanne 3.9 m @142.2 m | wolf 3 Spanne 1.6 m @204.7 m; Verband-Feld true, Verbände≥2 2: deer 6 Spanne 3.9 m | wolf 3 Spanne 1.6 m; Zustand {"-":10})
  nachher –
- d-ego-B2: vorher 10 (bear 1, deer 6, wolf 3; Würfe≥2 2: deer 6 Spanne 3.9 m @140.8 m | wolf 3 Spanne 1.5 m @205.1 m; Verband-Feld true, Verbände≥2 2: deer 6 Spanne 3.9 m | wolf 3 Spanne 1.5 m; Zustand {"-":10})
  nachher –

## GPU-Takt je Boot (nvidia-smi 1 s, nur P0-Sekunden: Median-MHz · Anteil Drossel (Grund ≠ 0 ohne GpuIdle 0x1) · max °C)

- d-ego-A1: 99 s · 1695 MHz · Drossel 25 % · 86 °C
- d-ego-A2: 105 s · 1683 MHz · Drossel 22 % · 87 °C
- d-ego-B1: 487 s · 1721 MHz · Drossel 30 % · 88 °C
- d-ego-B2: 489 s · 1721 MHz · Drossel 27 % · 88 °C

## Mittel je Seite (A 32b37933 main · B 5951786f integ-probe; gehend = geht-1 je Boot)

| Gang | Größe | A | B | Δ B − A | 2σ | t (Welch) | Urteil |
|---|---|---|---|---|---|---|---|
| steht | fps | 76.5 (76.8 · 76.3) | 79.3 (79.3 · 79.4) | +2.8 | 0.5 | 10.98 | nicht langsamer |
| steht | Frame p50 ms | 16.6 (16.6 · 16.6) | 15.1 (15.0 · 15.1) | -1.6 | 0.1 | -31.00 | nicht langsamer |
| steht | Frame p95 ms | 16.8 (16.8 · 16.8) | 16.7 (16.7 · 16.7) | -0.1 | 0.0 | – | nicht langsamer |
| steht | Frame p99 ms | 17.1 (17.0 · 17.1) | 17.8 (18.4 · 17.1) | +0.7 | 1.3 | 1.07 | nicht langsamer |
| steht | CPU-Takt p50 ms | 4.05 (4.10 · 4.00) | 4.50 (4.50 · 4.50) | +0.45 | 0.10 | 9.00 | LANGSAMER |
| steht | CPU-Takt p95 ms | 5.4 (5.6 · 5.3) | 6.3 (6.3 · 6.2) | +0.8 | 0.3 | 5.06 | LANGSAMER |
| steht | CPU-Takt p99 ms | 6.8 (7.2 · 6.4) | 7.8 (7.7 · 7.8) | +0.9 | 0.8 | 2.36 | LANGSAMER |
| steht | GPU-Durchsatz p50 ms | 13.00 (12.90 · 13.10) | 12.55 (12.60 · 12.50) | -0.45 | 0.22 | -4.02 | nicht langsamer |
| steht | k0 p50 ms | 0.21 (0.20 · 0.21) | 0.18 (0.18 · 0.18) | -0.03 | 0.01 | -5.00 | nicht langsamer |
| steht | GPU p95 ms (lauf) | 3.23 (3.07 · 3.40) | 2.13 (2.11 · 2.16) | -1.10 | 0.33 | -6.59 | nicht langsamer |
| steht | GPU je Bild ms (gpu-bank) | 12.10 (12.07 · 12.13) | 12.42 (12.47 · 12.37) | +0.32 | 0.12 | 5.49 | LANGSAMER |
| steht | Belegung p50 ms | 5.51 (5.58 · 5.44) | 6.04 (6.02 · 6.05) | +0.53 | 0.14 | 7.33 | LANGSAMER |
| steht | Belegung p95 ms | 7.26 (7.39 · 7.13) | 8.46 (8.58 · 8.34) | +1.20 | 0.35 | 6.78 | LANGSAMER |
| steht | außer Takt p95 ms | 0.75 (0.76 · 0.74) | 1.06 (1.07 · 1.04) | +0.31 | 0.04 | 16.92 | LANGSAMER |
| steht | Lebenszyklus p95 ms | 0.08 (0.08 · 0.08) | 0.08 (0.08 · 0.08) | 0.00 | 0.00 | – | nicht langsamer |
| steht | über 33 ms % | – (– · –) | – (– · –) | – | – | – | – |
| steht | KI-Uhr Mittel ms | 0.222 (0.220 · 0.224) | 0.321 (0.322 · 0.320) | +0.099 | 0.004 | 45.00 | LANGSAMER |
| steht | KI-Uhr p95 ms | 0.40 (0.40 · 0.40) | 0.50 (0.50 · 0.50) | +0.10 | 0.00 | – | LANGSAMER |
| steht | KI-Uhr p99 ms | 0.50 (0.50 · 0.50) | 0.60 (0.60 · 0.60) | +0.10 | 0.00 | – | LANGSAMER |
| steht | KI-Takt EWMA ms | 0.41 (0.40 · 0.41) | 0.56 (0.53 · 0.59) | +0.16 | 0.06 | 5.10 | LANGSAMER |
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

**KERN-URTEIL GEHEN d-ego** (steht + geht × fps · Frame p95 · CPU-Takt p95 · GPU je Bild (gpu-bank, nur steht) · Belegung p95; Δ ≤ max(2σ gepoolt, Auflösung)): LANGSAMER an steht CPU-Takt p95 ms, steht GPU je Bild ms (gpu-bank), steht Belegung p95 ms (5 Größen)
