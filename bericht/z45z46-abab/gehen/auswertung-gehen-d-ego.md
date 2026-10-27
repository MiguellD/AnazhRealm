## d-ego — je Boot

| Boot | Gang | fps | Frame p50 ms | Frame p95 ms | Frame p99 ms | CPU-Takt p50 ms | CPU-Takt p95 ms | CPU-Takt p99 ms | GPU-Durchsatz p50 ms | k0 p50 ms | GPU p95 ms (lauf) | GPU je Bild ms (gpu-bank) | Belegung p50 ms | Belegung p95 ms | außer Takt p95 ms | Lebenszyklus p95 ms | über 33 ms % | KI-Uhr Mittel ms | KI-Uhr p95 ms | KI-Uhr p99 ms | KI-Takt EWMA ms |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| d-ego-A1 | steht | 73.3 | 16.6 | 16.8 | 17.0 | 4.10 | 5.4 | 6.5 | 13.80 | 0.20 | 3.03 | 12.64 | 6.01 | 7.45 | 0.83 | 0.09 | – | 0.236 | 0.40 | 0.50 | 0.61 |
| d-ego-A1 | geht-1 | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – |
| d-ego-A1 | Geher-Ende |  | | | | | | | | | | | | | | | | | | | |
| d-ego-A2 | steht | 70.5 | 16.6 | 16.8 | 17.0 | 3.90 | 5.2 | 6.0 | 14.40 | 0.20 | 2.97 | 13.63 | 5.72 | 7.16 | 0.82 | 0.09 | – | 0.152 | 0.30 | 0.40 | 0.48 |
| d-ego-A2 | geht-1 | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – |
| d-ego-A2 | Geher-Ende |  | | | | | | | | | | | | | | | | | | | |
| d-ego-B1 | steht | 73.5 | 16.6 | 16.8 | 17.0 | 4.00 | 5.3 | 6.5 | 13.80 | 0.20 | 3.01 | 12.78 | 5.79 | 7.22 | 0.79 | 0.09 | – | 0.161 | 0.30 | 0.40 | 0.61 |
| d-ego-B1 | geht-1 | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – |
| d-ego-B1 | Geher-Ende |  | | | | | | | | | | | | | | | | | | | |
| d-ego-B2 | steht | 73.4 | 16.6 | 16.8 | 17.0 | 4.10 | 5.4 | 6.2 | 13.80 | 0.20 | 2.96 | 12.78 | 5.95 | 7.40 | 0.81 | 0.09 | – | 0.165 | 0.30 | 0.40 | 0.52 |
| d-ego-B2 | geht-1 | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – |
| d-ego-B2 | Geher-Ende |  | | | | | | | | | | | | | | | | | | | |

## Tier-Zensus je Boot (zensus-0 nach umstellen · zensus-1 nach geht-1)

- d-ego-A1: vorher 9 (deer 9; Würfe≥2 2: deer 5 Spanne 3.5 m @180 m | deer 4 Spanne 3.6 m @185.4 m; Verband-Feld true, Verbände≥2 2: deer 5 Spanne 3.5 m | deer 4 Spanne 3.6 m; Zustand {"-":9})
  nachher –
- d-ego-A2: vorher 5 (deer 5; Würfe≥2 1: deer 5 Spanne 3.6 m @180 m; Verband-Feld true, Verbände≥2 1: deer 5 Spanne 3.6 m; Zustand {"-":5})
  nachher –
- d-ego-B1: vorher 5 (deer 5; Würfe≥2 1: deer 5 Spanne 3.6 m @180 m; Verband-Feld true, Verbände≥2 1: deer 5 Spanne 3.6 m; Zustand {"-":5})
  nachher –
- d-ego-B2: vorher 5 (deer 5; Würfe≥2 1: deer 5 Spanne 3.5 m @180 m; Verband-Feld true, Verbände≥2 1: deer 5 Spanne 3.5 m; Zustand {"-":5})
  nachher –

## GPU-Takt je Boot (nvidia-smi 1 s, nur P0-Sekunden: Median-MHz · Anteil Drossel (Grund ≠ 0 ohne GpuIdle 0x1) · max °C)

- d-ego-A1: 106 s · 1695 MHz · Drossel 16 % · 86 °C
- d-ego-A2: 104 s · 1695 MHz · Drossel 19 % · 86 °C
- d-ego-B1: 109 s · 1695 MHz · Drossel 15 % · 87 °C
- d-ego-B2: 106 s · 1695 MHz · Drossel 24 % · 86 °C

## Mittel je Seite (A 5b8603c1 · B 42973786; gehend = geht-1 je Boot)

| Gang | Größe | A | B | Δ B − A | 2σ | t (Welch) | Urteil |
|---|---|---|---|---|---|---|---|
| steht | fps | 71.9 (73.3 · 70.5) | 73.5 (73.5 · 73.4) | +1.5 | 2.8 | 1.11 | nicht langsamer |
| steht | Frame p50 ms | 16.6 (16.6 · 16.6) | 16.6 (16.6 · 16.6) | 0.0 | 0.0 | – | nicht langsamer |
| steht | Frame p95 ms | 16.8 (16.8 · 16.8) | 16.8 (16.8 · 16.8) | 0.0 | 0.0 | – | nicht langsamer |
| steht | Frame p99 ms | 17.0 (17.0 · 17.0) | 17.0 (17.0 · 17.0) | 0.0 | 0.0 | – | nicht langsamer |
| steht | CPU-Takt p50 ms | 4.00 (4.10 · 3.90) | 4.05 (4.00 · 4.10) | +0.05 | 0.22 | 0.45 | nicht langsamer |
| steht | CPU-Takt p95 ms | 5.3 (5.4 · 5.2) | 5.3 (5.3 · 5.4) | +0.0 | 0.2 | 0.45 | nicht langsamer |
| steht | CPU-Takt p99 ms | 6.3 (6.5 · 6.0) | 6.3 (6.5 · 6.2) | +0.1 | 0.6 | 0.34 | nicht langsamer |
| steht | GPU-Durchsatz p50 ms | 14.10 (13.80 · 14.40) | 13.80 (13.80 · 13.80) | -0.30 | 0.60 | -1.00 | nicht langsamer |
| steht | k0 p50 ms | 0.20 (0.20 · 0.20) | 0.20 (0.20 · 0.20) | 0.00 | 0.00 | – | nicht langsamer |
| steht | GPU p95 ms (lauf) | 3.00 (3.03 · 2.97) | 2.98 (3.01 · 2.96) | -0.02 | 0.08 | -0.38 | nicht langsamer |
| steht | GPU je Bild ms (gpu-bank) | 13.14 (12.64 · 13.63) | 12.78 (12.78 · 12.78) | -0.36 | 0.99 | -0.72 | nicht langsamer |
| steht | Belegung p50 ms | 5.87 (6.01 · 5.72) | 5.87 (5.79 · 5.95) | +0.00 | 0.33 | 0.03 | nicht langsamer |
| steht | Belegung p95 ms | 7.30 (7.45 · 7.16) | 7.31 (7.22 · 7.40) | +0.01 | 0.34 | 0.03 | nicht langsamer |
| steht | außer Takt p95 ms | 0.82 (0.83 · 0.82) | 0.80 (0.79 · 0.81) | -0.02 | 0.02 | -2.24 | nicht langsamer |
| steht | Lebenszyklus p95 ms | 0.09 (0.09 · 0.09) | 0.09 (0.09 · 0.09) | 0.00 | 0.00 | – | nicht langsamer |
| steht | über 33 ms % | – (– · –) | – (– · –) | – | – | – | – |
| steht | KI-Uhr Mittel ms | 0.194 (0.236 · 0.152) | 0.163 (0.161 · 0.165) | -0.031 | 0.085 | -0.74 | nicht langsamer |
| steht | KI-Uhr p95 ms | 0.35 (0.40 · 0.30) | 0.30 (0.30 · 0.30) | -0.05 | 0.10 | -1.00 | nicht langsamer |
| steht | KI-Uhr p99 ms | 0.45 (0.50 · 0.40) | 0.40 (0.40 · 0.40) | -0.05 | 0.10 | -1.00 | nicht langsamer |
| steht | KI-Takt EWMA ms | 0.54 (0.61 · 0.48) | 0.56 (0.61 · 0.52) | +0.02 | 0.16 | 0.25 | nicht langsamer |
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
