## d-ego — je Boot

| Boot | Gang | fps | Frame p50 ms | Frame p95 ms | Frame p99 ms | CPU-Takt p50 ms | CPU-Takt p95 ms | CPU-Takt p99 ms | GPU-Durchsatz p50 ms | k0 p50 ms | GPU p95 ms (lauf) | GPU je Bild ms (gpu-bank) | Belegung p50 ms | Belegung p95 ms | außer Takt p95 ms | Lebenszyklus p95 ms | über 33 ms % | KI-Uhr Mittel ms | KI-Uhr p95 ms | KI-Uhr p99 ms | KI-Takt EWMA ms |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| d-ego-A1 | steht | 74.3 | 16.6 | 16.8 | 17.1 | 4.00 | 5.0 | 5.7 | 13.60 | 0.20 | 2.59 | 12.32 | 5.36 | 6.61 | 0.68 | 0.08 | – | 0.172 | 0.30 | 0.40 | 0.43 |
| d-ego-A1 | geht-1 | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – |
| d-ego-A1 | Geher-Ende |  | | | | | | | | | | | | | | | | | | | |
| d-ego-A2 | steht | 74.6 | 16.6 | 16.8 | 17.0 | 4.40 | 6.0 | 6.7 | 13.40 | 0.18 | 2.62 | 12.39 | 6.06 | 7.82 | 0.75 | 0.08 | – | 0.212 | 0.40 | 0.50 | 0.52 |
| d-ego-A2 | geht-1 | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – |
| d-ego-A2 | Geher-Ende |  | | | | | | | | | | | | | | | | | | | |
| d-ego-B1 | steht | 76.3 | 16.6 | 16.8 | 17.0 | 3.90 | 4.9 | 6.0 | 12.90 | 0.18 | 2.55 | 12.16 | 5.14 | 6.61 | 0.72 | 0.08 | – | 0.132 | 0.20 | 0.30 | 0.37 |
| d-ego-B1 | geht-1 | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – |
| d-ego-B1 | Geher-Ende |  | | | | | | | | | | | | | | | | | | | |
| d-ego-B2 | steht | 74.4 | 16.6 | 16.8 | 17.1 | 4.30 | 5.5 | 6.4 | 13.40 | 0.18 | 2.55 | 12.42 | 5.84 | 7.30 | 0.75 | 0.08 | – | 0.183 | 0.30 | 0.40 | 0.36 |
| d-ego-B2 | geht-1 | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – |
| d-ego-B2 | Geher-Ende |  | | | | | | | | | | | | | | | | | | | |

## Tier-Zensus je Boot (zensus-0 nach umstellen · zensus-1 nach geht-1)

- d-ego-A1: vorher 5 (deer 4, fox 1; Würfe≥2 1: deer 4 Spanne 2.6 m @180.1 m; Verband-Feld true, Verbände≥2 1: deer 4 Spanne 2.6 m; Zustand {"-":5})
  nachher –
- d-ego-A2: vorher 5 (deer 4, fox 1; Würfe≥2 1: deer 4 Spanne 2.5 m @180.2 m; Verband-Feld true, Verbände≥2 1: deer 4 Spanne 2.5 m; Zustand {"-":5})
  nachher –
- d-ego-B1: vorher 5 (deer 5; Würfe≥2 1: deer 5 Spanne 2.9 m @186 m; Verband-Feld true, Verbände≥2 1: deer 5 Spanne 2.9 m; Zustand {"-":5})
  nachher –
- d-ego-B2: vorher 4 (deer 4; Würfe≥2 1: deer 4 Spanne 2.5 m @178.8 m; Verband-Feld true, Verbände≥2 1: deer 4 Spanne 2.5 m; Zustand {"-":4})
  nachher –

## GPU-Takt je Boot (nvidia-smi 1 s, nur P0-Sekunden: Median-MHz · Anteil Drossel (Grund ≠ 0 ohne GpuIdle 0x1) · max °C)

- d-ego-A1: 108 s · 1683 MHz · Drossel 19 % · 85 °C
- d-ego-A2: 104 s · 1708 MHz · Drossel 19 % · 85 °C
- d-ego-B1: 99 s · 1695 MHz · Drossel 24 % · 85 °C
- d-ego-B2: 109 s · 1695 MHz · Drossel 21 % · 86 °C

## Mittel je Seite (A 056330d8 · B 3d2b3276; gehend = geht-1 je Boot)

| Gang | Größe | A | B | Δ B − A | 2σ | t (Welch) | Urteil |
|---|---|---|---|---|---|---|---|
| steht | fps | 74.4 (74.3 · 74.6) | 75.3 (76.3 · 74.4) | +0.9 | 1.9 | 0.94 | nicht langsamer |
| steht | Frame p50 ms | 16.6 (16.6 · 16.6) | 16.6 (16.6 · 16.6) | 0.0 | 0.0 | – | nicht langsamer |
| steht | Frame p95 ms | 16.8 (16.8 · 16.8) | 16.8 (16.8 · 16.8) | 0.0 | 0.0 | – | nicht langsamer |
| steht | Frame p99 ms | 17.1 (17.1 · 17.0) | 17.1 (17.0 · 17.1) | 0.0 | 0.1 | 0.00 | nicht langsamer |
| steht | CPU-Takt p50 ms | 4.20 (4.00 · 4.40) | 4.10 (3.90 · 4.30) | -0.10 | 0.57 | -0.35 | nicht langsamer |
| steht | CPU-Takt p95 ms | 5.5 (5.0 · 6.0) | 5.2 (4.9 · 5.5) | -0.3 | 1.2 | -0.51 | nicht langsamer |
| steht | CPU-Takt p99 ms | 6.2 (5.7 · 6.7) | 6.2 (6.0 · 6.4) | 0.0 | 1.1 | 0.00 | nicht langsamer |
| steht | GPU-Durchsatz p50 ms | 13.50 (13.60 · 13.40) | 13.15 (12.90 · 13.40) | -0.35 | 0.54 | -1.30 | nicht langsamer |
| steht | k0 p50 ms | 0.19 (0.20 · 0.18) | 0.18 (0.18 · 0.18) | -0.01 | 0.02 | -1.00 | nicht langsamer |
| steht | GPU p95 ms (lauf) | 2.60 (2.59 · 2.62) | 2.55 (2.55 · 2.55) | -0.06 | 0.03 | -3.67 | nicht langsamer |
| steht | GPU je Bild ms (gpu-bank) | 12.36 (12.32 · 12.39) | 12.29 (12.16 · 12.42) | -0.07 | 0.27 | -0.48 | nicht langsamer |
| steht | Belegung p50 ms | 5.71 (5.36 · 6.06) | 5.49 (5.14 · 5.84) | -0.22 | 0.99 | -0.44 | nicht langsamer |
| steht | Belegung p95 ms | 7.21 (6.61 · 7.82) | 6.96 (6.61 · 7.30) | -0.26 | 1.39 | -0.37 | nicht langsamer |
| steht | außer Takt p95 ms | 0.72 (0.68 · 0.75) | 0.73 (0.72 · 0.75) | +0.02 | 0.08 | 0.53 | nicht langsamer |
| steht | Lebenszyklus p95 ms | 0.08 (0.08 · 0.08) | 0.08 (0.08 · 0.08) | 0.00 | 0.00 | – | nicht langsamer |
| steht | über 33 ms % | – (– · –) | – (– · –) | – | – | – | – |
| steht | KI-Uhr Mittel ms | 0.192 (0.172 · 0.212) | 0.157 (0.132 · 0.183) | -0.035 | 0.065 | -1.08 | nicht langsamer |
| steht | KI-Uhr p95 ms | 0.35 (0.30 · 0.40) | 0.25 (0.20 · 0.30) | -0.10 | 0.14 | -1.41 | nicht langsamer |
| steht | KI-Uhr p99 ms | 0.45 (0.40 · 0.50) | 0.35 (0.30 · 0.40) | -0.10 | 0.14 | -1.41 | nicht langsamer |
| steht | KI-Takt EWMA ms | 0.47 (0.43 · 0.52) | 0.36 (0.37 · 0.36) | -0.11 | 0.09 | -2.43 | nicht langsamer |
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
