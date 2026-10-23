## d-ego — je Boot

| Boot | Gang | fps | Frame p50 ms | Frame p95 ms | Frame p99 ms | CPU-Takt p50 ms | CPU-Takt p95 ms | CPU-Takt p99 ms | GPU-Durchsatz p50 ms | k0 p50 ms | GPU p95 ms (lauf) | GPU je Bild ms (gpu-bank) | Belegung p50 ms | Belegung p95 ms | außer Takt p95 ms | Lebenszyklus p95 ms | über 33 ms % | KI-Uhr Mittel ms | KI-Uhr p95 ms | KI-Uhr p99 ms | KI-Takt EWMA ms |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| d-ego-A1 | steht | 77.3 | 16.6 | 16.8 | 17.0 | 4.10 | 5.4 | 6.3 | 12.90 | 0.22 | 3.24 | 12.07 | 5.42 | 7.14 | 0.75 | 0.07 | – | 0.213 | 0.40 | 0.50 | 0.44 |
| d-ego-A1 | geht-1 | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – |
| d-ego-A1 | Geher-Ende |  | | | | | | | | | | | | | | | | | | | |
| d-ego-A2 | steht | 77.2 | 16.6 | 16.8 | 17.0 | 4.00 | 5.4 | 6.3 | 12.90 | 0.22 | 3.21 | 12.49 | 5.35 | 7.22 | 0.74 | 0.08 | – | 0.220 | 0.40 | 0.50 | 0.42 |
| d-ego-A2 | geht-1 | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – |
| d-ego-A2 | Geher-Ende |  | | | | | | | | | | | | | | | | | | | |
| d-ego-B1 | steht | 77.5 | 16.5 | 16.8 | 17.0 | 4.00 | 5.3 | 6.2 | 12.80 | 0.22 | 3.48 | 12.43 | 5.34 | 7.10 | 0.73 | 0.07 | – | 0.215 | 0.40 | 0.50 | 0.40 |
| d-ego-B1 | geht-1 | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – |
| d-ego-B1 | Geher-Ende |  | | | | | | | | | | | | | | | | | | | |
| d-ego-B2 | steht | 77.3 | 16.6 | 16.8 | 17.1 | 4.00 | 5.4 | 6.4 | 12.80 | 0.22 | 3.10 | 12.47 | 5.41 | 7.21 | 0.73 | 0.07 | – | 0.214 | 0.40 | 0.50 | 0.34 |
| d-ego-B2 | geht-1 | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – |
| d-ego-B2 | Geher-Ende |  | | | | | | | | | | | | | | | | | | | |

## Tier-Zensus je Boot (zensus-0 nach umstellen · zensus-1 nach geht-1)

- d-ego-A1: vorher 10 (bear 1, deer 6, wolf 3; Würfe≥2 2: deer 6 Spanne 4.1 m @144.4 m | wolf 3 Spanne 1.2 m @204.5 m; Verband-Feld true, Verbände≥2 2: deer 6 Spanne 4.1 m | wolf 3 Spanne 1.2 m; Zustand {"-":10})
  nachher –
- d-ego-A2: vorher 10 (bear 1, deer 6, wolf 3; Würfe≥2 2: deer 6 Spanne 4.2 m @144.6 m | wolf 3 Spanne 1.6 m @204.3 m; Verband-Feld true, Verbände≥2 2: deer 6 Spanne 4.2 m | wolf 3 Spanne 1.6 m; Zustand {"-":10})
  nachher –
- d-ego-B1: vorher 10 (bear 1, deer 6, wolf 3; Würfe≥2 2: deer 6 Spanne 3.9 m @144.1 m | wolf 3 Spanne 1.3 m @204.7 m; Verband-Feld true, Verbände≥2 2: deer 6 Spanne 3.9 m | wolf 3 Spanne 1.3 m; Zustand {"-":10})
  nachher –
- d-ego-B2: vorher 10 (bear 1, deer 6, wolf 3; Würfe≥2 2: deer 6 Spanne 4.2 m @144.4 m | wolf 3 Spanne 1.3 m @204.4 m; Verband-Feld true, Verbände≥2 2: deer 6 Spanne 4.2 m | wolf 3 Spanne 1.3 m; Zustand {"-":10})
  nachher –

## GPU-Takt je Boot (nvidia-smi 1 s, nur P0-Sekunden: Median-MHz · Anteil Drossel (Grund ≠ 0 ohne GpuIdle 0x1) · max °C)

- d-ego-A1: 105 s · 1670 MHz · Drossel 20 % · 86 °C
- d-ego-A2: 108 s · 1695 MHz · Drossel 18 % · 86 °C
- d-ego-B1: 108 s · 1683 MHz · Drossel 22 % · 86 °C
- d-ego-B2: 105 s · 1695 MHz · Drossel 20 % · 86 °C

## Mittel je Seite (A cfb563bf main · B 3528f2d0 zug 3; gehend = geht-1 je Boot)

| Gang | Größe | A | B | Δ B − A | 2σ | t (Welch) | Urteil |
|---|---|---|---|---|---|---|---|
| steht | fps | 77.3 (77.3 · 77.2) | 77.4 (77.5 · 77.3) | +0.2 | 0.2 | 1.34 | nicht langsamer |
| steht | Frame p50 ms | 16.6 (16.6 · 16.6) | 16.6 (16.5 · 16.6) | -0.1 | 0.1 | -1.00 | nicht langsamer |
| steht | Frame p95 ms | 16.8 (16.8 · 16.8) | 16.8 (16.8 · 16.8) | 0.0 | 0.0 | – | nicht langsamer |
| steht | Frame p99 ms | 17.0 (17.0 · 17.0) | 17.1 (17.0 · 17.1) | +0.1 | 0.1 | 1.00 | nicht langsamer |
| steht | CPU-Takt p50 ms | 4.05 (4.10 · 4.00) | 4.00 (4.00 · 4.00) | -0.05 | 0.10 | -1.00 | nicht langsamer |
| steht | CPU-Takt p95 ms | 5.4 (5.4 · 5.4) | 5.3 (5.3 · 5.4) | -0.1 | 0.1 | -1.00 | nicht langsamer |
| steht | CPU-Takt p99 ms | 6.3 (6.3 · 6.3) | 6.3 (6.2 · 6.4) | +0.0 | 0.2 | 0.00 | nicht langsamer |
| steht | GPU-Durchsatz p50 ms | 12.90 (12.90 · 12.90) | 12.80 (12.80 · 12.80) | -0.10 | 0.00 | – | nicht langsamer |
| steht | k0 p50 ms | 0.22 (0.22 · 0.22) | 0.22 (0.22 · 0.22) | 0.00 | 0.00 | – | nicht langsamer |
| steht | GPU p95 ms (lauf) | 3.23 (3.24 · 3.21) | 3.29 (3.48 · 3.10) | +0.06 | 0.38 | 0.34 | nicht langsamer |
| steht | GPU je Bild ms (gpu-bank) | 12.28 (12.07 · 12.49) | 12.45 (12.43 · 12.47) | +0.17 | 0.42 | 0.81 | nicht langsamer |
| steht | Belegung p50 ms | 5.38 (5.42 · 5.35) | 5.38 (5.34 · 5.41) | -0.01 | 0.10 | -0.20 | nicht langsamer |
| steht | Belegung p95 ms | 7.18 (7.14 · 7.22) | 7.15 (7.10 · 7.21) | -0.03 | 0.14 | -0.37 | nicht langsamer |
| steht | außer Takt p95 ms | 0.74 (0.75 · 0.74) | 0.73 (0.73 · 0.73) | -0.02 | 0.01 | -3.00 | nicht langsamer |
| steht | Lebenszyklus p95 ms | 0.08 (0.07 · 0.08) | 0.07 (0.07 · 0.07) | -0.01 | 0.01 | -1.00 | nicht langsamer |
| steht | über 33 ms % | – (– · –) | – (– · –) | – | – | – | – |
| steht | KI-Uhr Mittel ms | 0.217 (0.213 · 0.220) | 0.214 (0.215 · 0.214) | -0.002 | 0.007 | -0.66 | nicht langsamer |
| steht | KI-Uhr p95 ms | 0.40 (0.40 · 0.40) | 0.40 (0.40 · 0.40) | 0.00 | 0.00 | – | nicht langsamer |
| steht | KI-Uhr p99 ms | 0.50 (0.50 · 0.50) | 0.50 (0.50 · 0.50) | 0.00 | 0.00 | – | nicht langsamer |
| steht | KI-Takt EWMA ms | 0.43 (0.44 · 0.42) | 0.37 (0.40 · 0.34) | -0.06 | 0.06 | -1.90 | nicht langsamer |
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
