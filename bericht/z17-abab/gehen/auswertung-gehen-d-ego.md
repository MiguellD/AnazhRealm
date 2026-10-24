## d-ego — je Boot

| Boot | Gang | fps | Frame p50 ms | Frame p95 ms | Frame p99 ms | CPU-Takt p50 ms | CPU-Takt p95 ms | CPU-Takt p99 ms | GPU-Durchsatz p50 ms | k0 p50 ms | GPU p95 ms (lauf) | GPU je Bild ms (gpu-bank) | Belegung p50 ms | Belegung p95 ms | außer Takt p95 ms | Lebenszyklus p95 ms | über 33 ms % | KI-Uhr Mittel ms | KI-Uhr p95 ms | KI-Uhr p99 ms | KI-Takt EWMA ms |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| d-ego-A1 | steht | 74.7 | 16.6 | 16.8 | 17.6 | 4.30 | 5.8 | 6.6 | 13.40 | 0.18 | 2.56 | 13.07 | 5.93 | 7.65 | 0.77 | 0.08 | – | 0.207 | 0.40 | 0.50 | 0.51 |
| d-ego-A1 | geht-1 | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – |
| d-ego-A1 | Geher-Ende |  | | | | | | | | | | | | | | | | | | | |
| d-ego-A2 | steht | 74.5 | 16.6 | 16.8 | 17.0 | 4.00 | 5.0 | 6.1 | 13.50 | 0.18 | 2.58 | 12.27 | 5.41 | 6.81 | 0.71 | 0.08 | – | 0.176 | 0.30 | 0.40 | 0.54 |
| d-ego-A2 | geht-1 | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – |
| d-ego-A2 | Geher-Ende |  | | | | | | | | | | | | | | | | | | | |
| d-ego-B1 | steht | 76.8 | 16.6 | 16.8 | 17.3 | 4.10 | 5.1 | 6.1 | 12.80 | 0.18 | 2.55 | 11.93 | 5.36 | 6.98 | 0.72 | 0.08 | – | 0.176 | 0.30 | 0.40 | 0.44 |
| d-ego-B1 | geht-1 | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – |
| d-ego-B1 | Geher-Ende |  | | | | | | | | | | | | | | | | | | | |
| d-ego-B2 | steht | 77.3 | 16.6 | 16.8 | 17.0 | 3.90 | 4.9 | 5.8 | 12.90 | 0.18 | 2.59 | 12.03 | 5.24 | 6.67 | 0.69 | 0.07 | – | 0.177 | 0.30 | 0.40 | 0.45 |
| d-ego-B2 | geht-1 | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – |
| d-ego-B2 | Geher-Ende |  | | | | | | | | | | | | | | | | | | | |

## Tier-Zensus je Boot (zensus-0 nach umstellen · zensus-1 nach geht-1)

- d-ego-A1: vorher 5 (deer 4, fox 1; Würfe≥2 1: deer 4 Spanne 2.4 m @180.1 m; Verband-Feld true, Verbände≥2 1: deer 4 Spanne 2.4 m; Zustand {"-":5})
  nachher –
- d-ego-A2: vorher 5 (deer 4, fox 1; Würfe≥2 1: deer 4 Spanne 2.3 m @180.4 m; Verband-Feld true, Verbände≥2 1: deer 4 Spanne 2.3 m; Zustand {"-":5})
  nachher –
- d-ego-B1: vorher 5 (deer 4, fox 1; Würfe≥2 1: deer 4 Spanne 2.5 m @180 m; Verband-Feld true, Verbände≥2 1: deer 4 Spanne 2.5 m; Zustand {"-":5})
  nachher –
- d-ego-B2: vorher 8 (deer 8; Würfe≥2 2: deer 5 Spanne 3.2 m @185.7 m | deer 3 Spanne 2.5 m @157 m; Verband-Feld true, Verbände≥2 2: deer 5 Spanne 3.2 m | deer 3 Spanne 2.5 m; Zustand {"-":8})
  nachher –

## GPU-Takt je Boot (nvidia-smi 1 s, nur P0-Sekunden: Median-MHz · Anteil Drossel (Grund ≠ 0 ohne GpuIdle 0x1) · max °C)

- d-ego-A1: 109 s · 1670 MHz · Drossel 17 % · 87 °C
- d-ego-A2: 107 s · 1708 MHz · Drossel 21 % · 85 °C
- d-ego-B1: 100 s · 1708 MHz · Drossel 24 % · 82 °C
- d-ego-B2: 102 s · 1695 MHz · Drossel 16 % · 86 °C

## Mittel je Seite (A 3046bc79 · B 6f8a2c66; gehend = geht-1 je Boot)

| Gang | Größe | A | B | Δ B − A | 2σ | t (Welch) | Urteil |
|---|---|---|---|---|---|---|---|
| steht | fps | 74.6 (74.7 · 74.5) | 77.0 (76.8 · 77.3) | +2.5 | 0.5 | 9.10 | nicht langsamer |
| steht | Frame p50 ms | 16.6 (16.6 · 16.6) | 16.6 (16.6 · 16.6) | 0.0 | 0.0 | – | nicht langsamer |
| steht | Frame p95 ms | 16.8 (16.8 · 16.8) | 16.8 (16.8 · 16.8) | 0.0 | 0.0 | – | nicht langsamer |
| steht | Frame p99 ms | 17.3 (17.6 · 17.0) | 17.1 (17.3 · 17.0) | -0.2 | 0.7 | -0.45 | nicht langsamer |
| steht | CPU-Takt p50 ms | 4.15 (4.30 · 4.00) | 4.00 (4.10 · 3.90) | -0.15 | 0.36 | -0.83 | nicht langsamer |
| steht | CPU-Takt p95 ms | 5.4 (5.8 · 5.0) | 5.0 (5.1 · 4.9) | -0.4 | 0.8 | -0.97 | nicht langsamer |
| steht | CPU-Takt p99 ms | 6.3 (6.6 · 6.1) | 5.9 (6.1 · 5.8) | -0.4 | 0.6 | -1.37 | nicht langsamer |
| steht | GPU-Durchsatz p50 ms | 13.45 (13.40 · 13.50) | 12.85 (12.80 · 12.90) | -0.60 | 0.14 | -8.49 | nicht langsamer |
| steht | k0 p50 ms | 0.18 (0.18 · 0.18) | 0.18 (0.18 · 0.18) | 0.00 | 0.00 | – | nicht langsamer |
| steht | GPU p95 ms (lauf) | 2.57 (2.56 · 2.58) | 2.57 (2.55 · 2.59) | -0.00 | 0.04 | -0.00 | nicht langsamer |
| steht | GPU je Bild ms (gpu-bank) | 12.67 (13.07 · 12.27) | 11.98 (11.93 · 12.03) | -0.69 | 0.81 | -1.71 | nicht langsamer |
| steht | Belegung p50 ms | 5.67 (5.93 · 5.41) | 5.30 (5.36 · 5.24) | -0.37 | 0.53 | -1.39 | nicht langsamer |
| steht | Belegung p95 ms | 7.23 (7.65 · 6.81) | 6.83 (6.98 · 6.67) | -0.41 | 0.90 | -0.90 | nicht langsamer |
| steht | außer Takt p95 ms | 0.74 (0.77 · 0.71) | 0.70 (0.72 · 0.69) | -0.04 | 0.07 | -1.04 | nicht langsamer |
| steht | Lebenszyklus p95 ms | 0.08 (0.08 · 0.08) | 0.08 (0.08 · 0.07) | -0.00 | 0.01 | -1.00 | nicht langsamer |
| steht | über 33 ms % | – (– · –) | – (– · –) | – | – | – | – |
| steht | KI-Uhr Mittel ms | 0.192 (0.207 · 0.176) | 0.176 (0.176 · 0.177) | -0.015 | 0.031 | -0.97 | nicht langsamer |
| steht | KI-Uhr p95 ms | 0.35 (0.40 · 0.30) | 0.30 (0.30 · 0.30) | -0.05 | 0.10 | -1.00 | nicht langsamer |
| steht | KI-Uhr p99 ms | 0.45 (0.50 · 0.40) | 0.40 (0.40 · 0.40) | -0.05 | 0.10 | -1.00 | nicht langsamer |
| steht | KI-Takt EWMA ms | 0.53 (0.51 · 0.54) | 0.45 (0.44 · 0.45) | -0.08 | 0.03 | -5.06 | nicht langsamer |
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
