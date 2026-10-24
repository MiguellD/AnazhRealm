## d-ego — je Boot

| Boot | Gang | fps | Frame p50 ms | Frame p95 ms | Frame p99 ms | CPU-Takt p50 ms | CPU-Takt p95 ms | CPU-Takt p99 ms | GPU-Durchsatz p50 ms | k0 p50 ms | GPU p95 ms (lauf) | GPU je Bild ms (gpu-bank) | Belegung p50 ms | Belegung p95 ms | außer Takt p95 ms | Lebenszyklus p95 ms | über 33 ms % | KI-Uhr Mittel ms | KI-Uhr p95 ms | KI-Uhr p99 ms | KI-Takt EWMA ms |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| d-ego-A1 | steht | 75.1 | 16.6 | 16.8 | 17.0 | 4.60 | 6.4 | 7.5 | 13.30 | 0.18 | 2.55 | 12.87 | 6.13 | 8.59 | 0.84 | 0.08 | – | 0.193 | 0.40 | 0.50 | 0.62 |
| d-ego-A1 | geht-1 | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – |
| d-ego-A1 | Geher-Ende |  | | | | | | | | | | | | | | | | | | | |
| d-ego-A2 | steht | 76.1 | 16.6 | 16.8 | 17.0 | 4.20 | 5.4 | 6.3 | 13.10 | 0.18 | 2.58 | 12.23 | 5.59 | 7.21 | 0.75 | 0.08 | – | 0.192 | 0.30 | 0.40 | 0.47 |
| d-ego-A2 | geht-1 | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – |
| d-ego-A2 | Geher-Ende |  | | | | | | | | | | | | | | | | | | | |
| d-ego-B1 | steht | 76.2 | 16.6 | 16.8 | 17.0 | 4.00 | 5.2 | 6.4 | 13.10 | 0.18 | 2.60 | 12.19 | 5.37 | 7.02 | 0.73 | 0.08 | – | 0.133 | 0.20 | 0.30 | 0.33 |
| d-ego-B1 | geht-1 | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – |
| d-ego-B1 | Geher-Ende |  | | | | | | | | | | | | | | | | | | | |
| d-ego-B2 | steht | 76.5 | 16.6 | 16.8 | 17.1 | 4.10 | 5.2 | 6.2 | 13.00 | 0.18 | 2.62 | 12.17 | 5.44 | 7.12 | 0.75 | 0.08 | – | 0.180 | 0.30 | 0.40 | 0.39 |
| d-ego-B2 | geht-1 | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – |
| d-ego-B2 | Geher-Ende |  | | | | | | | | | | | | | | | | | | | |

## Tier-Zensus je Boot (zensus-0 nach umstellen · zensus-1 nach geht-1)

- d-ego-A1: vorher 5 (deer 4, fox 1; Würfe≥2 1: deer 4 Spanne 2.5 m @180.1 m; Verband-Feld true, Verbände≥2 1: deer 4 Spanne 2.5 m; Zustand {"-":5})
  nachher –
- d-ego-A2: vorher 8 (deer 8; Würfe≥2 2: deer 5 Spanne 2.9 m @185.6 m | deer 3 Spanne 3.2 m @191 m; Verband-Feld true, Verbände≥2 2: deer 5 Spanne 2.9 m | deer 3 Spanne 3.2 m; Zustand {"-":8})
  nachher –
- d-ego-B1: vorher 6 (deer 6; Würfe≥2 1: deer 6 Spanne 3.7 m @161.9 m; Verband-Feld true, Verbände≥2 1: deer 6 Spanne 3.7 m; Zustand {"-":6})
  nachher –
- d-ego-B2: vorher 8 (deer 8; Würfe≥2 2: deer 5 Spanne 3.6 m @179.9 m | deer 3 Spanne 3.6 m @186.8 m; Verband-Feld true, Verbände≥2 2: deer 5 Spanne 3.6 m | deer 3 Spanne 3.6 m; Zustand {"-":8})
  nachher –

## GPU-Takt je Boot (nvidia-smi 1 s, nur P0-Sekunden: Median-MHz · Anteil Drossel (Grund ≠ 0 ohne GpuIdle 0x1) · max °C)

- d-ego-A1: 102 s · 1683 MHz · Drossel 22 % · 86 °C
- d-ego-A2: 104 s · 1695 MHz · Drossel 25 % · 86 °C
- d-ego-B1: 106 s · 1683 MHz · Drossel 22 % · 86 °C
- d-ego-B2: 106 s · 1683 MHz · Drossel 26 % · 86 °C

## Mittel je Seite (A 6f8a2c66 · B 1d9164e9; gehend = geht-1 je Boot)

| Gang | Größe | A | B | Δ B − A | 2σ | t (Welch) | Urteil |
|---|---|---|---|---|---|---|---|
| steht | fps | 75.6 (75.1 · 76.1) | 76.3 (76.2 · 76.5) | +0.8 | 1.0 | 1.44 | nicht langsamer |
| steht | Frame p50 ms | 16.6 (16.6 · 16.6) | 16.6 (16.6 · 16.6) | 0.0 | 0.0 | – | nicht langsamer |
| steht | Frame p95 ms | 16.8 (16.8 · 16.8) | 16.8 (16.8 · 16.8) | 0.0 | 0.0 | – | nicht langsamer |
| steht | Frame p99 ms | 17.0 (17.0 · 17.0) | 17.1 (17.0 · 17.1) | +0.1 | 0.1 | 1.00 | nicht langsamer |
| steht | CPU-Takt p50 ms | 4.40 (4.60 · 4.20) | 4.05 (4.00 · 4.10) | -0.35 | 0.41 | -1.70 | nicht langsamer |
| steht | CPU-Takt p95 ms | 5.9 (6.4 · 5.4) | 5.2 (5.2 · 5.2) | -0.7 | 1.0 | -1.40 | nicht langsamer |
| steht | CPU-Takt p99 ms | 6.9 (7.5 · 6.3) | 6.3 (6.4 · 6.2) | -0.6 | 1.2 | -0.99 | nicht langsamer |
| steht | GPU-Durchsatz p50 ms | 13.20 (13.30 · 13.10) | 13.05 (13.10 · 13.00) | -0.15 | 0.22 | -1.34 | nicht langsamer |
| steht | k0 p50 ms | 0.18 (0.18 · 0.18) | 0.18 (0.18 · 0.18) | 0.00 | 0.00 | – | nicht langsamer |
| steht | GPU p95 ms (lauf) | 2.56 (2.55 · 2.58) | 2.61 (2.60 · 2.62) | +0.05 | 0.04 | 2.50 | LANGSAMER |
| steht | GPU je Bild ms (gpu-bank) | 12.55 (12.87 · 12.23) | 12.18 (12.19 · 12.17) | -0.37 | 0.64 | -1.16 | nicht langsamer |
| steht | Belegung p50 ms | 5.86 (6.13 · 5.59) | 5.41 (5.37 · 5.44) | -0.45 | 0.54 | -1.67 | nicht langsamer |
| steht | Belegung p95 ms | 7.90 (8.59 · 7.21) | 7.07 (7.02 · 7.12) | -0.83 | 1.38 | -1.20 | nicht langsamer |
| steht | außer Takt p95 ms | 0.79 (0.84 · 0.75) | 0.74 (0.73 · 0.75) | -0.05 | 0.09 | -1.19 | nicht langsamer |
| steht | Lebenszyklus p95 ms | 0.08 (0.08 · 0.08) | 0.08 (0.08 · 0.08) | 0.00 | 0.00 | – | nicht langsamer |
| steht | über 33 ms % | – (– · –) | – (– · –) | – | – | – | – |
| steht | KI-Uhr Mittel ms | 0.193 (0.193 · 0.192) | 0.156 (0.133 · 0.180) | -0.036 | 0.047 | -1.54 | nicht langsamer |
| steht | KI-Uhr p95 ms | 0.35 (0.40 · 0.30) | 0.25 (0.20 · 0.30) | -0.10 | 0.14 | -1.41 | nicht langsamer |
| steht | KI-Uhr p99 ms | 0.45 (0.50 · 0.40) | 0.35 (0.30 · 0.40) | -0.10 | 0.14 | -1.41 | nicht langsamer |
| steht | KI-Takt EWMA ms | 0.54 (0.62 · 0.47) | 0.36 (0.33 · 0.39) | -0.18 | 0.16 | -2.29 | nicht langsamer |
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
