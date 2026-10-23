## d-ego — je Boot

| Boot | Gang | fps | Frame p50 ms | Frame p95 ms | Frame p99 ms | CPU-Takt p50 ms | CPU-Takt p95 ms | CPU-Takt p99 ms | GPU-Durchsatz p50 ms | k0 p50 ms | GPU p95 ms (lauf) | GPU je Bild ms (gpu-bank) | Belegung p50 ms | Belegung p95 ms | außer Takt p95 ms | Lebenszyklus p95 ms | über 33 ms % | KI-Uhr Mittel ms | KI-Uhr p95 ms | KI-Uhr p99 ms | KI-Takt EWMA ms |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| d-ego-A1 | steht | 77.5 | 16.5 | 16.8 | 17.0 | 4.00 | 5.1 | 6.0 | 12.90 | 0.22 | 3.39 | 12.60 | 5.44 | 7.05 | 0.75 | 0.08 | – | 0.235 | 0.40 | 0.50 | 0.40 |
| d-ego-A1 | geht-1 | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – |
| d-ego-A1 | Geher-Ende |  | | | | | | | | | | | | | | | | | | | |
| d-ego-A2 | steht | 77.0 | 16.6 | 16.8 | 17.0 | 4.20 | 5.5 | 6.3 | 12.90 | 0.22 | 3.32 | 12.16 | 5.62 | 7.43 | 0.76 | 0.07 | – | 0.252 | 0.40 | 0.50 | 0.44 |
| d-ego-A2 | geht-1 | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – |
| d-ego-A2 | Geher-Ende |  | | | | | | | | | | | | | | | | | | | |
| d-ego-B1 | steht | 77.4 | 16.5 | 16.8 | 17.0 | 4.10 | 5.4 | 6.4 | 12.80 | 0.21 | 3.32 | 12.18 | 5.49 | 7.22 | 0.75 | 0.08 | – | 0.249 | 0.40 | 0.50 | 0.47 |
| d-ego-B1 | geht-1 | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – |
| d-ego-B1 | Geher-Ende |  | | | | | | | | | | | | | | | | | | | |
| d-ego-B2 | steht | 76.9 | 16.6 | 16.8 | 17.0 | 4.20 | 5.6 | 6.5 | 12.90 | 0.21 | 3.27 | 12.58 | 5.73 | 7.48 | 0.77 | 0.08 | – | 0.242 | 0.40 | 0.50 | 0.44 |
| d-ego-B2 | geht-1 | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – |
| d-ego-B2 | Geher-Ende |  | | | | | | | | | | | | | | | | | | | |

## Tier-Zensus je Boot (zensus-0 nach umstellen · zensus-1 nach geht-1)

- d-ego-A1: vorher 10 (bear 1, deer 6, wolf 3; Würfe≥2 2: deer 6 Spanne 4.3 m @144.2 m | wolf 3 Spanne 1.4 m @204.5 m; Verband-Feld true, Verbände≥2 2: deer 6 Spanne 4.3 m | wolf 3 Spanne 1.4 m; Zustand {"-":10})
  nachher –
- d-ego-A2: vorher 10 (bear 1, deer 6, wolf 3; Würfe≥2 2: deer 6 Spanne 3.9 m @143 m | wolf 3 Spanne 1.5 m @204 m; Verband-Feld true, Verbände≥2 2: deer 6 Spanne 3.9 m | wolf 3 Spanne 1.5 m; Zustand {"-":10})
  nachher –
- d-ego-B1: vorher 10 (bear 1, deer 6, wolf 3; Würfe≥2 2: deer 6 Spanne 4.3 m @144.5 m | wolf 3 Spanne 1.3 m @204.2 m; Verband-Feld true, Verbände≥2 2: deer 6 Spanne 4.3 m | wolf 3 Spanne 1.3 m; Zustand {"-":10})
  nachher –
- d-ego-B2: vorher 10 (bear 1, deer 6, wolf 3; Würfe≥2 2: deer 6 Spanne 4.2 m @144.3 m | wolf 3 Spanne 1.5 m @204.1 m; Verband-Feld true, Verbände≥2 2: deer 6 Spanne 4.2 m | wolf 3 Spanne 1.5 m; Zustand {"-":10})
  nachher –

## GPU-Takt je Boot (nvidia-smi 1 s, nur P0-Sekunden: Median-MHz · Anteil Drossel (Grund ≠ 0 ohne GpuIdle 0x1) · max °C)

- d-ego-A1: 101 s · 1708 MHz · Drossel 23 % · 83 °C
- d-ego-A2: 104 s · 1708 MHz · Drossel 22 % · 86 °C
- d-ego-B1: 98 s · 1708 MHz · Drossel 22 % · 85 °C
- d-ego-B2: 103 s · 1708 MHz · Drossel 19 % · 86 °C

## Mittel je Seite (A 1ef4042c main · B 40d00ade zug 2; gehend = geht-1 je Boot)

| Gang | Größe | A | B | Δ B − A | 2σ | t (Welch) | Urteil |
|---|---|---|---|---|---|---|---|
| steht | fps | 77.3 (77.5 · 77.0) | 77.2 (77.4 · 76.9) | -0.1 | 0.7 | -0.28 | nicht langsamer |
| steht | Frame p50 ms | 16.6 (16.5 · 16.6) | 16.6 (16.5 · 16.6) | 0.0 | 0.1 | 0.00 | nicht langsamer |
| steht | Frame p95 ms | 16.8 (16.8 · 16.8) | 16.8 (16.8 · 16.8) | 0.0 | 0.0 | – | nicht langsamer |
| steht | Frame p99 ms | 17.0 (17.0 · 17.0) | 17.0 (17.0 · 17.0) | 0.0 | 0.0 | – | nicht langsamer |
| steht | CPU-Takt p50 ms | 4.10 (4.00 · 4.20) | 4.15 (4.10 · 4.20) | +0.05 | 0.22 | 0.45 | nicht langsamer |
| steht | CPU-Takt p95 ms | 5.3 (5.1 · 5.5) | 5.5 (5.4 · 5.6) | +0.2 | 0.4 | 0.89 | nicht langsamer |
| steht | CPU-Takt p99 ms | 6.2 (6.0 · 6.3) | 6.5 (6.4 · 6.5) | +0.3 | 0.3 | 1.90 | nicht langsamer |
| steht | GPU-Durchsatz p50 ms | 12.90 (12.90 · 12.90) | 12.85 (12.80 · 12.90) | -0.05 | 0.10 | -1.00 | nicht langsamer |
| steht | k0 p50 ms | 0.22 (0.22 · 0.22) | 0.21 (0.21 · 0.21) | -0.01 | 0.00 | – | nicht langsamer |
| steht | GPU p95 ms (lauf) | 3.35 (3.39 · 3.32) | 3.29 (3.32 · 3.27) | -0.06 | 0.09 | -1.39 | nicht langsamer |
| steht | GPU je Bild ms (gpu-bank) | 12.38 (12.60 · 12.16) | 12.38 (12.18 · 12.58) | 0.00 | 0.59 | 0.00 | nicht langsamer |
| steht | Belegung p50 ms | 5.53 (5.44 · 5.62) | 5.61 (5.49 · 5.73) | +0.08 | 0.30 | 0.53 | nicht langsamer |
| steht | Belegung p95 ms | 7.24 (7.05 · 7.43) | 7.35 (7.22 · 7.48) | +0.11 | 0.46 | 0.48 | nicht langsamer |
| steht | außer Takt p95 ms | 0.76 (0.75 · 0.76) | 0.76 (0.75 · 0.77) | +0.01 | 0.02 | 0.45 | nicht langsamer |
| steht | Lebenszyklus p95 ms | 0.08 (0.08 · 0.07) | 0.08 (0.08 · 0.08) | +0.00 | 0.01 | 1.00 | nicht langsamer |
| steht | über 33 ms % | – (– · –) | – (– · –) | – | – | – | – |
| steht | KI-Uhr Mittel ms | 0.243 (0.235 · 0.252) | 0.246 (0.249 · 0.242) | +0.003 | 0.018 | 0.31 | nicht langsamer |
| steht | KI-Uhr p95 ms | 0.40 (0.40 · 0.40) | 0.40 (0.40 · 0.40) | 0.00 | 0.00 | – | nicht langsamer |
| steht | KI-Uhr p99 ms | 0.50 (0.50 · 0.50) | 0.50 (0.50 · 0.50) | 0.00 | 0.00 | – | nicht langsamer |
| steht | KI-Takt EWMA ms | 0.42 (0.40 · 0.44) | 0.45 (0.47 · 0.44) | +0.03 | 0.05 | 1.40 | nicht langsamer |
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
