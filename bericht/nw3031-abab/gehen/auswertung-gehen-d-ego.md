## d-ego — je Boot

| Boot | Gang | fps | Frame p50 ms | Frame p95 ms | Frame p99 ms | CPU-Takt p50 ms | CPU-Takt p95 ms | CPU-Takt p99 ms | GPU-Durchsatz p50 ms | k0 p50 ms | GPU p95 ms (lauf) | GPU je Bild ms (gpu-bank) | Belegung p50 ms | Belegung p95 ms | außer Takt p95 ms | Lebenszyklus p95 ms | über 33 ms % | KI-Uhr Mittel ms | KI-Uhr p95 ms | KI-Uhr p99 ms | KI-Takt EWMA ms |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| d-ego-A1 | steht | 77.7 | 16.6 | 16.8 | 16.8 | 4.50 | 5.9 | 7.0 | 12.70 | 0.18 | 2.58 | 12.33 | 5.89 | 8.01 | 0.79 | 0.08 | – | 0.207 | 0.40 | 0.50 | 0.69 |
| d-ego-A1 | geht-1 | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – |
| d-ego-A1 | Geher-Ende |  | | | | | | | | | | | | | | | | | | | |
| d-ego-A2 | steht | 76.7 | 16.6 | 16.8 | 17.0 | 4.00 | 5.0 | 5.9 | 13.00 | 0.18 | 2.60 | 12.56 | 5.29 | 6.72 | 0.71 | 0.08 | – | 0.164 | 0.30 | 0.40 | 0.39 |
| d-ego-A2 | geht-1 | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – |
| d-ego-A2 | Geher-Ende |  | | | | | | | | | | | | | | | | | | | |
| d-ego-B1 | steht | 73.4 | 16.6 | 16.8 | 17.0 | 3.70 | 4.8 | 5.6 | 13.80 | 0.20 | 3.01 | 13.33 | 5.22 | 6.59 | 0.74 | 0.08 | – | 0.130 | 0.20 | 0.30 | 0.31 |
| d-ego-B1 | geht-1 | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – |
| d-ego-B1 | Geher-Ende |  | | | | | | | | | | | | | | | | | | | |
| d-ego-B2 | steht | 76.8 | 16.6 | 16.8 | 17.0 | 3.50 | 4.4 | 5.2 | 13.10 | 0.20 | 3.04 | 12.43 | 4.82 | 6.08 | 0.68 | 0.07 | – | 0.122 | 0.20 | 0.30 | 0.24 |
| d-ego-B2 | geht-1 | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – |
| d-ego-B2 | Geher-Ende |  | | | | | | | | | | | | | | | | | | | |

## Tier-Zensus je Boot (zensus-0 nach umstellen · zensus-1 nach geht-1)

- d-ego-A1: vorher 5 (deer 4, fox 1; Würfe≥2 1: deer 4 Spanne 3.6 m @179.4 m; Verband-Feld true, Verbände≥2 1: deer 4 Spanne 3.6 m; Zustand {"-":5})
  nachher –
- d-ego-A2: vorher 8 (deer 8; Würfe≥2 2: deer 5 Spanne 3.7 m @180 m | deer 3 Spanne 2.4 m @160.9 m; Verband-Feld true, Verbände≥2 2: deer 5 Spanne 3.7 m | deer 3 Spanne 2.4 m; Zustand {"-":8})
  nachher –
- d-ego-B1: vorher 5 (deer 5; Würfe≥2 1: deer 5 Spanne 3.8 m @179.9 m; Verband-Feld true, Verbände≥2 1: deer 5 Spanne 3.8 m; Zustand {"-":5})
  nachher –
- d-ego-B2: vorher 5 (deer 5; Würfe≥2 1: deer 5 Spanne 3.7 m @179.9 m; Verband-Feld true, Verbände≥2 1: deer 5 Spanne 3.7 m; Zustand {"-":5})
  nachher –

## GPU-Takt je Boot (nvidia-smi 1 s, nur P0-Sekunden: Median-MHz · Anteil Drossel (Grund ≠ 0 ohne GpuIdle 0x1) · max °C)

- d-ego-A1: 102 s · 1670 MHz · Drossel 22 % · 87 °C
- d-ego-A2: 102 s · 1695 MHz · Drossel 25 % · 86 °C
- d-ego-B1: 99 s · 1695 MHz · Drossel 23 % · 86 °C
- d-ego-B2: 73 s · 1708 MHz · Drossel 32 % · 86 °C

## Mittel je Seite (A 4a5f5e2c · B 8f1802b1; gehend = geht-1 je Boot)

| Gang | Größe | A | B | Δ B − A | 2σ | t (Welch) | Urteil |
|---|---|---|---|---|---|---|---|
| steht | fps | 77.2 (77.7 · 76.7) | 75.1 (73.4 · 76.8) | -2.1 | 3.5 | -1.19 | nicht langsamer |
| steht | Frame p50 ms | 16.6 (16.6 · 16.6) | 16.6 (16.6 · 16.6) | 0.0 | 0.0 | – | nicht langsamer |
| steht | Frame p95 ms | 16.8 (16.8 · 16.8) | 16.8 (16.8 · 16.8) | 0.0 | 0.0 | – | nicht langsamer |
| steht | Frame p99 ms | 16.9 (16.8 · 17.0) | 17.0 (17.0 · 17.0) | +0.1 | 0.2 | 1.00 | nicht langsamer |
| steht | CPU-Takt p50 ms | 4.25 (4.50 · 4.00) | 3.60 (3.70 · 3.50) | -0.65 | 0.54 | -2.41 | nicht langsamer |
| steht | CPU-Takt p95 ms | 5.5 (5.9 · 5.0) | 4.6 (4.8 · 4.4) | -0.9 | 1.0 | -1.73 | nicht langsamer |
| steht | CPU-Takt p99 ms | 6.5 (7.0 · 5.9) | 5.4 (5.6 · 5.2) | -1.0 | 1.2 | -1.79 | nicht langsamer |
| steht | GPU-Durchsatz p50 ms | 12.85 (12.70 · 13.00) | 13.45 (13.80 · 13.10) | +0.60 | 0.76 | 1.58 | nicht langsamer |
| steht | k0 p50 ms | 0.18 (0.18 · 0.18) | 0.20 (0.20 · 0.20) | +0.02 | 0.00 | – | LANGSAMER |
| steht | GPU p95 ms (lauf) | 2.59 (2.58 · 2.60) | 3.02 (3.01 · 3.04) | +0.44 | 0.04 | 24.13 | LANGSAMER |
| steht | GPU je Bild ms (gpu-bank) | 12.45 (12.33 · 12.56) | 12.88 (13.33 · 12.43) | +0.43 | 0.93 | 0.94 | nicht langsamer |
| steht | Belegung p50 ms | 5.59 (5.89 · 5.29) | 5.02 (5.22 · 4.82) | -0.57 | 0.72 | -1.58 | nicht langsamer |
| steht | Belegung p95 ms | 7.37 (8.01 · 6.72) | 6.33 (6.59 · 6.08) | -1.03 | 1.39 | -1.49 | nicht langsamer |
| steht | außer Takt p95 ms | 0.75 (0.79 · 0.71) | 0.71 (0.74 · 0.68) | -0.04 | 0.10 | -0.80 | nicht langsamer |
| steht | Lebenszyklus p95 ms | 0.08 (0.08 · 0.08) | 0.08 (0.08 · 0.07) | -0.00 | 0.01 | -1.00 | nicht langsamer |
| steht | über 33 ms % | – (– · –) | – (– · –) | – | – | – | – |
| steht | KI-Uhr Mittel ms | 0.185 (0.207 · 0.164) | 0.126 (0.130 · 0.122) | -0.060 | 0.044 | -2.73 | nicht langsamer |
| steht | KI-Uhr p95 ms | 0.35 (0.40 · 0.30) | 0.20 (0.20 · 0.20) | -0.15 | 0.10 | -3.00 | nicht langsamer |
| steht | KI-Uhr p99 ms | 0.45 (0.50 · 0.40) | 0.30 (0.30 · 0.30) | -0.15 | 0.10 | -3.00 | nicht langsamer |
| steht | KI-Takt EWMA ms | 0.54 (0.69 · 0.39) | 0.28 (0.31 · 0.24) | -0.27 | 0.31 | -1.72 | nicht langsamer |
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
