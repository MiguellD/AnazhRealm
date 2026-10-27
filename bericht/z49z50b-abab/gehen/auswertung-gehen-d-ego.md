## d-ego — je Boot

| Boot | Gang | fps | Frame p50 ms | Frame p95 ms | Frame p99 ms | CPU-Takt p50 ms | CPU-Takt p95 ms | CPU-Takt p99 ms | GPU-Durchsatz p50 ms | k0 p50 ms | GPU p95 ms (lauf) | GPU je Bild ms (gpu-bank) | Belegung p50 ms | Belegung p95 ms | außer Takt p95 ms | Lebenszyklus p95 ms | über 33 ms % | KI-Uhr Mittel ms | KI-Uhr p95 ms | KI-Uhr p99 ms | KI-Takt EWMA ms |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| d-ego-A1 | steht | 73.4 | 16.6 | 16.8 | 17.0 | 3.80 | 4.8 | 5.9 | 13.90 | 0.20 | 3.08 | 13.35 | 5.51 | 6.90 | 0.77 | 0.09 | – | 0.200 | 0.30 | 0.40 | 0.59 |
| d-ego-A1 | geht-1 | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – |
| d-ego-A1 | Geher-Ende |  | | | | | | | | | | | | | | | | | | | |
| d-ego-A2 | steht | 75.2 | 16.6 | 16.8 | 17.0 | 3.70 | 4.7 | 6.1 | 13.50 | 0.20 | 3.15 | 13.30 | 5.18 | 6.62 | 0.78 | 0.09 | – | 0.128 | 0.20 | 0.30 | 0.39 |
| d-ego-A2 | geht-1 | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – |
| d-ego-A2 | Geher-Ende |  | | | | | | | | | | | | | | | | | | | |
| d-ego-B1 | steht | 74.2 | 16.6 | 16.8 | 17.0 | 3.70 | 4.6 | 5.7 | 13.80 | 0.20 | 2.95 | 12.68 | 5.22 | 6.52 | 0.75 | 0.08 | – | 0.163 | 0.30 | 0.40 | 0.53 |
| d-ego-B1 | geht-1 | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – |
| d-ego-B1 | Geher-Ende |  | | | | | | | | | | | | | | | | | | | |
| d-ego-B2 | steht | 73.4 | 16.6 | 16.8 | 17.0 | 3.80 | 4.8 | 5.7 | 13.80 | 0.20 | 3.24 | 13.03 | 5.44 | 6.77 | 0.76 | 0.08 | – | 0.176 | 0.30 | 0.40 | 0.51 |
| d-ego-B2 | geht-1 | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – |
| d-ego-B2 | Geher-Ende |  | | | | | | | | | | | | | | | | | | | |

## Tier-Zensus je Boot (zensus-0 nach umstellen · zensus-1 nach geht-1)

- d-ego-A1: vorher 9 (deer 9; Würfe≥2 2: deer 5 Spanne 3.5 m @180 m | deer 4 Spanne 3.6 m @185.4 m; Verband-Feld true, Verbände≥2 2: deer 5 Spanne 3.5 m | deer 4 Spanne 3.6 m; Zustand {"-":9})
  nachher –
- d-ego-A2: vorher 5 (deer 5; Würfe≥2 1: deer 5 Spanne 3.5 m @180 m; Verband-Feld true, Verbände≥2 1: deer 5 Spanne 3.5 m; Zustand {"-":5})
  nachher –
- d-ego-B1: vorher 8 (deer 8; Würfe≥2 2: deer 5 Spanne 3.5 m @180 m | deer 3 Spanne 3.5 m @186.6 m; Verband-Feld true, Verbände≥2 2: deer 5 Spanne 3.5 m | deer 3 Spanne 3.5 m; Zustand {"-":8})
  nachher –
- d-ego-B2: vorher 8 (deer 8; Würfe≥2 2: deer 4 Spanne 2.8 m @198.7 m | deer 4 Spanne 4.1 m @185.6 m; Verband-Feld true, Verbände≥2 2: deer 4 Spanne 2.8 m | deer 4 Spanne 4.1 m; Zustand {"-":8})
  nachher –

## GPU-Takt je Boot (nvidia-smi 1 s, nur P0-Sekunden: Median-MHz · Anteil Drossel (Grund ≠ 0 ohne GpuIdle 0x1) · max °C)

- d-ego-A1: 71 s · 1708 MHz · Drossel 31 % · 86 °C
- d-ego-A2: 77 s · 1708 MHz · Drossel 31 % · 86 °C
- d-ego-B1: 77 s · 1708 MHz · Drossel 25 % · 86 °C
- d-ego-B2: 82 s · 1708 MHz · Drossel 21 % · 86 °C

## Mittel je Seite (A cd34e72b · B 6db2602c; gehend = geht-1 je Boot)

| Gang | Größe | A | B | Δ B − A | 2σ | t (Welch) | Urteil |
|---|---|---|---|---|---|---|---|
| steht | fps | 74.3 (73.4 · 75.2) | 73.8 (74.2 · 73.4) | -0.5 | 2.0 | -0.51 | nicht langsamer |
| steht | Frame p50 ms | 16.6 (16.6 · 16.6) | 16.6 (16.6 · 16.6) | 0.0 | 0.0 | – | nicht langsamer |
| steht | Frame p95 ms | 16.8 (16.8 · 16.8) | 16.8 (16.8 · 16.8) | 0.0 | 0.0 | – | nicht langsamer |
| steht | Frame p99 ms | 17.0 (17.0 · 17.0) | 17.0 (17.0 · 17.0) | 0.0 | 0.0 | – | nicht langsamer |
| steht | CPU-Takt p50 ms | 3.75 (3.80 · 3.70) | 3.75 (3.70 · 3.80) | 0.00 | 0.14 | 0.00 | nicht langsamer |
| steht | CPU-Takt p95 ms | 4.8 (4.8 · 4.7) | 4.7 (4.6 · 4.8) | -0.1 | 0.2 | -0.45 | nicht langsamer |
| steht | CPU-Takt p99 ms | 6.0 (5.9 · 6.1) | 5.7 (5.7 · 5.7) | -0.3 | 0.2 | -3.00 | nicht langsamer |
| steht | GPU-Durchsatz p50 ms | 13.70 (13.90 · 13.50) | 13.80 (13.80 · 13.80) | +0.10 | 0.40 | 0.50 | nicht langsamer |
| steht | k0 p50 ms | 0.20 (0.20 · 0.20) | 0.20 (0.20 · 0.20) | 0.00 | 0.00 | – | nicht langsamer |
| steht | GPU p95 ms (lauf) | 3.12 (3.08 · 3.15) | 3.10 (2.95 · 3.24) | -0.02 | 0.30 | -0.13 | nicht langsamer |
| steht | GPU je Bild ms (gpu-bank) | 13.32 (13.35 · 13.30) | 12.86 (12.68 · 13.03) | -0.47 | 0.35 | -2.66 | nicht langsamer |
| steht | Belegung p50 ms | 5.34 (5.51 · 5.18) | 5.33 (5.22 · 5.44) | -0.01 | 0.40 | -0.08 | nicht langsamer |
| steht | Belegung p95 ms | 6.76 (6.90 · 6.62) | 6.64 (6.52 · 6.77) | -0.12 | 0.38 | -0.61 | nicht langsamer |
| steht | außer Takt p95 ms | 0.78 (0.77 · 0.78) | 0.76 (0.75 · 0.76) | -0.02 | 0.01 | -2.83 | nicht langsamer |
| steht | Lebenszyklus p95 ms | 0.09 (0.09 · 0.09) | 0.08 (0.08 · 0.08) | -0.01 | 0.00 | – | nicht langsamer |
| steht | über 33 ms % | – (– · –) | – (– · –) | – | – | – | – |
| steht | KI-Uhr Mittel ms | 0.164 (0.200 · 0.128) | 0.169 (0.163 · 0.176) | +0.005 | 0.073 | 0.14 | nicht langsamer |
| steht | KI-Uhr p95 ms | 0.25 (0.30 · 0.20) | 0.30 (0.30 · 0.30) | +0.05 | 0.10 | 1.00 | nicht langsamer |
| steht | KI-Uhr p99 ms | 0.35 (0.40 · 0.30) | 0.40 (0.40 · 0.40) | +0.05 | 0.10 | 1.00 | nicht langsamer |
| steht | KI-Takt EWMA ms | 0.49 (0.59 · 0.39) | 0.52 (0.53 · 0.51) | +0.03 | 0.20 | 0.30 | nicht langsamer |
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
