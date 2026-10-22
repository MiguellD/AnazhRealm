## d-ego — je Boot

| Boot | Gang | fps | Frame p50 ms | Frame p95 ms | Frame p99 ms | CPU-Takt p50 ms | CPU-Takt p95 ms | CPU-Takt p99 ms | GPU-Durchsatz p50 ms | k0 p50 ms | GPU p95 ms (lauf) | GPU je Bild ms (gpu-bank) | Belegung p50 ms | Belegung p95 ms | außer Takt p95 ms | Lebenszyklus p95 ms | über 33 ms % | KI-Uhr Mittel ms | KI-Uhr p95 ms | KI-Uhr p99 ms | KI-Takt EWMA ms |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| d-ego-A1 | steht | 76.9 | 16.6 | 16.8 | 17.0 | 4.10 | 5.5 | 6.8 | 13.00 | 0.21 | 3.28 | 12.63 | 5.56 | 7.42 | 0.77 | 0.08 | – | 0.245 | 0.40 | 0.50 | 0.42 |
| d-ego-A1 | geht-1 | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – |
| d-ego-A1 | Geher-Ende |  | | | | | | | | | | | | | | | | | | | |
| d-ego-A2 | steht | 76.3 | 16.6 | 16.8 | 17.0 | 4.10 | 5.7 | 7.2 | 13.05 | 0.21 | 3.24 | 12.17 | 5.62 | 7.58 | 0.78 | 0.08 | – | 0.244 | 0.40 | 0.50 | 0.45 |
| d-ego-A2 | geht-1 | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – |
| d-ego-A2 | Geher-Ende |  | | | | | | | | | | | | | | | | | | | |
| d-ego-B1 | steht | 77.1 | 16.6 | 16.8 | 17.0 | 4.10 | 5.4 | 6.3 | 12.90 | 0.22 | 3.22 | 12.60 | 5.54 | 7.25 | 0.73 | 0.08 | – | 0.256 | 0.40 | 0.50 | 0.42 |
| d-ego-B1 | geht-1 | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – |
| d-ego-B1 | Geher-Ende |  | | | | | | | | | | | | | | | | | | | |
| d-ego-B2 | steht | 76.8 | 16.6 | 16.8 | 17.0 | 4.10 | 5.4 | 6.4 | 13.00 | 0.22 | 3.21 | 12.13 | 5.58 | 7.37 | 0.76 | 0.07 | – | 0.245 | 0.40 | 0.50 | 0.42 |
| d-ego-B2 | geht-1 | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – |
| d-ego-B2 | Geher-Ende |  | | | | | | | | | | | | | | | | | | | |

## Tier-Zensus je Boot (zensus-0 nach umstellen · zensus-1 nach geht-1)

- d-ego-A1: vorher 10 (bear 1, deer 6, wolf 3; Würfe≥2 2: deer 6 Spanne 3.8 m @143.3 m | wolf 3 Spanne 1.7 m @203.8 m; Verband-Feld true, Verbände≥2 2: deer 6 Spanne 3.8 m | wolf 3 Spanne 1.7 m; Zustand {"-":10})
  nachher –
- d-ego-A2: vorher 10 (bear 1, deer 6, wolf 3; Würfe≥2 2: deer 6 Spanne 3.6 m @144.3 m | wolf 3 Spanne 1.8 m @204.5 m; Verband-Feld true, Verbände≥2 2: deer 6 Spanne 3.6 m | wolf 3 Spanne 1.8 m; Zustand {"-":10})
  nachher –
- d-ego-B1: vorher 10 (bear 1, deer 6, wolf 3; Würfe≥2 2: deer 6 Spanne 3.6 m @143.3 m | wolf 3 Spanne 1.7 m @203.9 m; Verband-Feld true, Verbände≥2 2: deer 6 Spanne 3.6 m | wolf 3 Spanne 1.7 m; Zustand {"-":10})
  nachher –
- d-ego-B2: vorher 10 (bear 1, deer 6, wolf 3; Würfe≥2 2: deer 6 Spanne 3.9 m @144.1 m | wolf 3 Spanne 1.2 m @204.8 m; Verband-Feld true, Verbände≥2 2: deer 6 Spanne 3.9 m | wolf 3 Spanne 1.2 m; Zustand {"-":10})
  nachher –

## GPU-Takt je Boot (nvidia-smi 1 s, nur P0-Sekunden: Median-MHz · Anteil Drossel (Grund ≠ 0 ohne GpuIdle 0x1) · max °C)

- d-ego-A1: 104 s · 1695 MHz · Drossel 17 % · 86 °C
- d-ego-A2: 100 s · 1708 MHz · Drossel 23 % · 86 °C
- d-ego-B1: 102 s · 1695 MHz · Drossel 22 % · 86 °C
- d-ego-B2: 110 s · 1695 MHz · Drossel 22 % · 86 °C

## Mittel je Seite (A 73f28224 main · B 1ef4042c zug; gehend = geht-1 je Boot)

| Gang | Größe | A | B | Δ B − A | 2σ | t (Welch) | Urteil |
|---|---|---|---|---|---|---|---|
| steht | fps | 76.6 (76.9 · 76.3) | 76.9 (77.1 · 76.8) | +0.3 | 0.7 | 1.04 | nicht langsamer |
| steht | Frame p50 ms | 16.6 (16.6 · 16.6) | 16.6 (16.6 · 16.6) | 0.0 | 0.0 | – | nicht langsamer |
| steht | Frame p95 ms | 16.8 (16.8 · 16.8) | 16.8 (16.8 · 16.8) | 0.0 | 0.0 | – | nicht langsamer |
| steht | Frame p99 ms | 17.0 (17.0 · 17.0) | 17.0 (17.0 · 17.0) | 0.0 | 0.0 | – | nicht langsamer |
| steht | CPU-Takt p50 ms | 4.10 (4.10 · 4.10) | 4.10 (4.10 · 4.10) | 0.00 | 0.00 | – | nicht langsamer |
| steht | CPU-Takt p95 ms | 5.6 (5.5 · 5.7) | 5.4 (5.4 · 5.4) | -0.2 | 0.2 | -2.00 | nicht langsamer |
| steht | CPU-Takt p99 ms | 7.0 (6.8 · 7.2) | 6.3 (6.3 · 6.4) | -0.7 | 0.4 | -3.15 | nicht langsamer |
| steht | GPU-Durchsatz p50 ms | 13.03 (13.00 · 13.05) | 12.95 (12.90 · 13.00) | -0.08 | 0.11 | -1.34 | nicht langsamer |
| steht | k0 p50 ms | 0.21 (0.21 · 0.21) | 0.22 (0.22 · 0.22) | +0.01 | 0.00 | – | nicht langsamer |
| steht | GPU p95 ms (lauf) | 3.26 (3.28 · 3.24) | 3.21 (3.22 · 3.21) | -0.04 | 0.04 | -2.18 | nicht langsamer |
| steht | GPU je Bild ms (gpu-bank) | 12.40 (12.63 · 12.17) | 12.37 (12.60 · 12.13) | -0.04 | 0.66 | -0.11 | nicht langsamer |
| steht | Belegung p50 ms | 5.59 (5.56 · 5.62) | 5.56 (5.54 · 5.58) | -0.03 | 0.07 | -0.83 | nicht langsamer |
| steht | Belegung p95 ms | 7.50 (7.42 · 7.58) | 7.31 (7.25 · 7.37) | -0.19 | 0.20 | -1.90 | nicht langsamer |
| steht | außer Takt p95 ms | 0.78 (0.77 · 0.78) | 0.74 (0.73 · 0.76) | -0.03 | 0.03 | -1.90 | nicht langsamer |
| steht | Lebenszyklus p95 ms | 0.08 (0.08 · 0.08) | 0.08 (0.08 · 0.07) | -0.00 | 0.01 | -1.00 | nicht langsamer |
| steht | über 33 ms % | – (– · –) | – (– · –) | – | – | – | – |
| steht | KI-Uhr Mittel ms | 0.245 (0.245 · 0.244) | 0.251 (0.256 · 0.245) | +0.006 | 0.011 | 1.10 | nicht langsamer |
| steht | KI-Uhr p95 ms | 0.40 (0.40 · 0.40) | 0.40 (0.40 · 0.40) | 0.00 | 0.00 | – | nicht langsamer |
| steht | KI-Uhr p99 ms | 0.50 (0.50 · 0.50) | 0.50 (0.50 · 0.50) | 0.00 | 0.00 | – | nicht langsamer |
| steht | KI-Takt EWMA ms | 0.43 (0.42 · 0.45) | 0.42 (0.42 · 0.42) | -0.02 | 0.03 | -1.00 | nicht langsamer |
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

**KERN-URTEIL GEHEN d-ego** (steht + geht × fps · Frame p95 · CPU-Takt p95 · GPU je Bild (gpu-bank, nur steht) · Belegung p95; Δ ≤ max(2σ gepoolt, Auflösung)): nicht langsamer (5 Größen)
