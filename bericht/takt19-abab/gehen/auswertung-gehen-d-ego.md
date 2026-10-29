## d-ego — je Boot

| Boot | Gang | fps | Frame p50 ms | Frame p95 ms | Frame p99 ms | CPU-Takt p50 ms | CPU-Takt p95 ms | CPU-Takt p99 ms | GPU-Durchsatz p50 ms | k0 p50 ms | GPU p95 ms (lauf) | GPU je Bild ms (gpu-bank) | Belegung p50 ms | Belegung p95 ms | außer Takt p95 ms | Lebenszyklus p95 ms | über 33 ms % | KI-Uhr Mittel ms | KI-Uhr p95 ms | KI-Uhr p99 ms | KI-Takt EWMA ms |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| d-ego-A1 | steht | 74.6 | 16.6 | 16.8 | 17.0 | 4.10 | 5.5 | 6.4 | 13.60 | 0.20 | 2.99 | 12.97 | 6.04 | 7.65 | 0.82 | 0.09 | – | 0.199 | 0.30 | 0.40 | 0.60 |
| d-ego-A1 | geht-1 | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – |
| d-ego-A1 | Geher-Ende |  | | | | | | | | | | | | | | | | | | | |
| d-ego-A2 | steht | 73.7 | 16.6 | 16.8 | 17.0 | 4.10 | 5.4 | 6.3 | 13.80 | 0.20 | 3.02 | 13.21 | 5.98 | 7.51 | 0.80 | 0.09 | – | 0.154 | 0.30 | 0.40 | 0.62 |
| d-ego-A2 | geht-1 | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – |
| d-ego-A2 | Geher-Ende |  | | | | | | | | | | | | | | | | | | | |
| d-ego-B1 | steht | 72.7 | 16.6 | 16.8 | 17.0 | 4.00 | 5.1 | 6.0 | 13.90 | 0.20 | 3.03 | 13.07 | 5.83 | 7.27 | 0.84 | 0.09 | – | 0.145 | 0.30 | 0.30 | 0.45 |
| d-ego-B1 | geht-1 | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – |
| d-ego-B1 | Geher-Ende |  | | | | | | | | | | | | | | | | | | | |
| d-ego-B2 | steht | 74.2 | 16.6 | 16.8 | 17.0 | 3.80 | 5.2 | 6.9 | 13.70 | 0.20 | 2.98 | 13.04 | 5.67 | 7.37 | 0.84 | 0.09 | – | 0.141 | 0.30 | 0.30 | 0.35 |
| d-ego-B2 | geht-1 | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – |
| d-ego-B2 | Geher-Ende |  | | | | | | | | | | | | | | | | | | | |

## Tier-Zensus je Boot (zensus-0 nach umstellen · zensus-1 nach geht-1)

- d-ego-A1: vorher 8 (deer 8; Würfe≥2 2: deer 5 Spanne 3.5 m @180 m | deer 3 Spanne 3.6 m @186.7 m; Verband-Feld true, Verbände≥2 2: deer 5 Spanne 3.5 m | deer 3 Spanne 3.6 m; Zustand {"-":8})
  nachher –
- d-ego-A2: vorher 5 (deer 5; Würfe≥2 1: deer 5 Spanne 3.6 m @180 m; Verband-Feld true, Verbände≥2 1: deer 5 Spanne 3.6 m; Zustand {"-":5})
  nachher –
- d-ego-B1: vorher 5 (deer 5; Würfe≥2 1: deer 5 Spanne 3.4 m @180 m; Verband-Feld true, Verbände≥2 1: deer 5 Spanne 3.4 m; Zustand {"-":5})
  nachher –
- d-ego-B2: vorher 5 (deer 5; Würfe≥2 1: deer 5 Spanne 3.4 m @180 m; Verband-Feld true, Verbände≥2 1: deer 5 Spanne 3.4 m; Zustand {"-":5})
  nachher –

## GPU-Takt je Boot (nvidia-smi 1 s, nur P0-Sekunden: Median-MHz · Anteil Drossel (Grund ≠ 0 ohne GpuIdle 0x1) · max °C)

- d-ego-A1: 104 s · 1695 MHz · Drossel 23 % · 86 °C
- d-ego-A2: 98 s · 1695 MHz · Drossel 20 % · 87 °C
- d-ego-B1: 104 s · 1695 MHz · Drossel 26 % · 86 °C
- d-ego-B2: 99 s · 1695 MHz · Drossel 26 % · 86 °C

## Mittel je Seite (A 9e92be45 · B b3f9ae95; gehend = geht-1 je Boot)

| Gang | Größe | A | B | Δ B − A | 2σ | t (Welch) | Urteil |
|---|---|---|---|---|---|---|---|
| steht | fps | 74.2 (74.6 · 73.7) | 73.5 (72.7 · 74.2) | -0.7 | 1.7 | -0.80 | nicht langsamer |
| steht | Frame p50 ms | 16.6 (16.6 · 16.6) | 16.6 (16.6 · 16.6) | 0.0 | 0.0 | – | nicht langsamer |
| steht | Frame p95 ms | 16.8 (16.8 · 16.8) | 16.8 (16.8 · 16.8) | 0.0 | 0.0 | – | nicht langsamer |
| steht | Frame p99 ms | 17.0 (17.0 · 17.0) | 17.0 (17.0 · 17.0) | 0.0 | 0.0 | – | nicht langsamer |
| steht | CPU-Takt p50 ms | 4.10 (4.10 · 4.10) | 3.90 (4.00 · 3.80) | -0.20 | 0.20 | -2.00 | nicht langsamer |
| steht | CPU-Takt p95 ms | 5.5 (5.5 · 5.4) | 5.2 (5.1 · 5.2) | -0.3 | 0.1 | -4.24 | nicht langsamer |
| steht | CPU-Takt p99 ms | 6.3 (6.4 · 6.3) | 6.5 (6.0 · 6.9) | +0.1 | 0.9 | 0.22 | nicht langsamer |
| steht | GPU-Durchsatz p50 ms | 13.70 (13.60 · 13.80) | 13.80 (13.90 · 13.70) | +0.10 | 0.28 | 0.71 | nicht langsamer |
| steht | k0 p50 ms | 0.20 (0.20 · 0.20) | 0.20 (0.20 · 0.20) | 0.00 | 0.00 | – | nicht langsamer |
| steht | GPU p95 ms (lauf) | 3.00 (2.99 · 3.02) | 3.00 (3.03 · 2.98) | 0.00 | 0.06 | 0.00 | nicht langsamer |
| steht | GPU je Bild ms (gpu-bank) | 13.09 (12.97 · 13.21) | 13.05 (13.07 · 13.04) | -0.04 | 0.24 | -0.29 | nicht langsamer |
| steht | Belegung p50 ms | 6.01 (6.04 · 5.98) | 5.75 (5.83 · 5.67) | -0.26 | 0.17 | -3.04 | nicht langsamer |
| steht | Belegung p95 ms | 7.58 (7.65 · 7.51) | 7.32 (7.27 · 7.37) | -0.26 | 0.17 | -3.02 | nicht langsamer |
| steht | außer Takt p95 ms | 0.81 (0.82 · 0.80) | 0.84 (0.84 · 0.84) | +0.03 | 0.02 | 3.00 | LANGSAMER |
| steht | Lebenszyklus p95 ms | 0.09 (0.09 · 0.09) | 0.09 (0.09 · 0.09) | 0.00 | 0.00 | – | nicht langsamer |
| steht | über 33 ms % | – (– · –) | – (– · –) | – | – | – | – |
| steht | KI-Uhr Mittel ms | 0.176 (0.199 · 0.154) | 0.143 (0.145 · 0.141) | -0.033 | 0.045 | -1.49 | nicht langsamer |
| steht | KI-Uhr p95 ms | 0.30 (0.30 · 0.30) | 0.30 (0.30 · 0.30) | 0.00 | 0.00 | – | nicht langsamer |
| steht | KI-Uhr p99 ms | 0.40 (0.40 · 0.40) | 0.30 (0.30 · 0.30) | -0.10 | 0.00 | – | nicht langsamer |
| steht | KI-Takt EWMA ms | 0.61 (0.60 · 0.62) | 0.40 (0.45 · 0.35) | -0.21 | 0.10 | -4.12 | nicht langsamer |
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
