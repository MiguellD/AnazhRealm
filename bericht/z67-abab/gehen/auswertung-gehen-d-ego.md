## d-ego — je Boot

| Boot | Gang | fps | Frame p50 ms | Frame p95 ms | Frame p99 ms | CPU-Takt p50 ms | CPU-Takt p95 ms | CPU-Takt p99 ms | GPU-Durchsatz p50 ms | k0 p50 ms | GPU p95 ms (lauf) | GPU je Bild ms (gpu-bank) | Belegung p50 ms | Belegung p95 ms | außer Takt p95 ms | Lebenszyklus p95 ms | über 33 ms % | KI-Uhr Mittel ms | KI-Uhr p95 ms | KI-Uhr p99 ms | KI-Takt EWMA ms |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| d-ego-A1 | steht | 73.6 | 16.6 | 16.8 | 17.0 | 4.20 | 6.1 | 7.7 | 13.80 | 0.20 | 3.01 | 12.88 | 6.09 | 8.52 | 0.94 | 0.10 | – | 0.166 | 0.30 | 0.40 | 0.43 |
| d-ego-A1 | geht-1 | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – |
| d-ego-A1 | Geher-Ende |  | | | | | | | | | | | | | | | | | | | |
| d-ego-A2 | steht | 73.9 | 16.6 | 16.8 | 17.0 | 3.90 | 5.2 | 6.2 | 13.70 | 0.20 | 2.99 | 12.40 | 5.73 | 7.30 | 0.82 | 0.09 | – | 0.147 | 0.30 | 0.30 | 0.40 |
| d-ego-A2 | geht-1 | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – |
| d-ego-A2 | Geher-Ende |  | | | | | | | | | | | | | | | | | | | |
| d-ego-B1 | steht | 74.9 | 16.6 | 16.8 | 17.0 | 3.90 | 4.9 | 6.0 | 13.60 | 0.20 | 3.00 | 12.43 | 5.59 | 6.97 | 0.80 | 0.09 | – | 0.131 | 0.20 | 0.30 | 0.42 |
| d-ego-B1 | geht-1 | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – |
| d-ego-B1 | Geher-Ende |  | | | | | | | | | | | | | | | | | | | |
| d-ego-B2 | steht | 72.4 | 16.6 | 16.8 | 17.0 | 4.00 | 5.1 | 6.3 | 14.00 | 0.20 | 3.02 | 12.98 | 5.76 | 7.30 | 0.82 | 0.09 | – | 0.138 | 0.20 | 0.30 | 0.56 |
| d-ego-B2 | geht-1 | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – |
| d-ego-B2 | Geher-Ende |  | | | | | | | | | | | | | | | | | | | |

## Tier-Zensus je Boot (zensus-0 nach umstellen · zensus-1 nach geht-1)

- d-ego-A1: vorher 5 (deer 5; Würfe≥2 1: deer 5 Spanne 3.3 m @180 m; Verband-Feld true, Verbände≥2 1: deer 5 Spanne 3.3 m; Zustand {"-":5})
  nachher –
- d-ego-A2: vorher 5 (deer 5; Würfe≥2 1: deer 5 Spanne 3.4 m @180 m; Verband-Feld true, Verbände≥2 1: deer 5 Spanne 3.4 m; Zustand {"-":5})
  nachher –
- d-ego-B1: vorher 5 (deer 5; Würfe≥2 1: deer 5 Spanne 3.6 m @179.9 m; Verband-Feld true, Verbände≥2 1: deer 5 Spanne 3.6 m; Zustand {"-":5})
  nachher –
- d-ego-B2: vorher 5 (deer 5; Würfe≥2 1: deer 5 Spanne 3.6 m @179.9 m; Verband-Feld true, Verbände≥2 1: deer 5 Spanne 3.6 m; Zustand {"-":5})
  nachher –

## GPU-Takt je Boot (nvidia-smi 1 s, nur P0-Sekunden: Median-MHz · Anteil Drossel (Grund ≠ 0 ohne GpuIdle 0x1) · max °C)

- d-ego-A1: 105 s · 1695 MHz · Drossel 22 % · 86 °C
- d-ego-A2: 104 s · 1721 MHz · Drossel 25 % · 86 °C
- d-ego-B1: 105 s · 1695 MHz · Drossel 26 % · 86 °C
- d-ego-B2: 107 s · 1695 MHz · Drossel 21 % · 86 °C

## Mittel je Seite (A b3f9ae95 · B 29a5f696; gehend = geht-1 je Boot)

| Gang | Größe | A | B | Δ B − A | 2σ | t (Welch) | Urteil |
|---|---|---|---|---|---|---|---|
| steht | fps | 73.8 (73.6 · 73.9) | 73.7 (74.9 · 72.4) | -0.1 | 2.5 | -0.08 | nicht langsamer |
| steht | Frame p50 ms | 16.6 (16.6 · 16.6) | 16.6 (16.6 · 16.6) | 0.0 | 0.0 | – | nicht langsamer |
| steht | Frame p95 ms | 16.8 (16.8 · 16.8) | 16.8 (16.8 · 16.8) | 0.0 | 0.0 | – | nicht langsamer |
| steht | Frame p99 ms | 17.0 (17.0 · 17.0) | 17.0 (17.0 · 17.0) | 0.0 | 0.0 | – | nicht langsamer |
| steht | CPU-Takt p50 ms | 4.05 (4.20 · 3.90) | 3.95 (3.90 · 4.00) | -0.10 | 0.32 | -0.63 | nicht langsamer |
| steht | CPU-Takt p95 ms | 5.7 (6.1 · 5.2) | 5.0 (4.9 · 5.1) | -0.7 | 0.9 | -1.41 | nicht langsamer |
| steht | CPU-Takt p99 ms | 7.0 (7.7 · 6.2) | 6.2 (6.0 · 6.3) | -0.8 | 1.5 | -1.05 | nicht langsamer |
| steht | GPU-Durchsatz p50 ms | 13.75 (13.80 · 13.70) | 13.80 (13.60 · 14.00) | +0.05 | 0.41 | 0.24 | nicht langsamer |
| steht | k0 p50 ms | 0.20 (0.20 · 0.20) | 0.20 (0.20 · 0.20) | 0.00 | 0.00 | – | nicht langsamer |
| steht | GPU p95 ms (lauf) | 3.00 (3.01 · 2.99) | 3.01 (3.00 · 3.02) | +0.01 | 0.03 | 0.71 | nicht langsamer |
| steht | GPU je Bild ms (gpu-bank) | 12.64 (12.88 · 12.40) | 12.71 (12.43 · 12.98) | +0.06 | 0.73 | 0.18 | nicht langsamer |
| steht | Belegung p50 ms | 5.91 (6.09 · 5.73) | 5.67 (5.59 · 5.76) | -0.24 | 0.40 | -1.18 | nicht langsamer |
| steht | Belegung p95 ms | 7.91 (8.52 · 7.30) | 7.13 (6.97 · 7.30) | -0.78 | 1.26 | -1.23 | nicht langsamer |
| steht | außer Takt p95 ms | 0.88 (0.94 · 0.82) | 0.81 (0.80 · 0.82) | -0.07 | 0.12 | -1.15 | nicht langsamer |
| steht | Lebenszyklus p95 ms | 0.10 (0.10 · 0.09) | 0.09 (0.09 · 0.09) | -0.01 | 0.01 | -1.00 | nicht langsamer |
| steht | über 33 ms % | – (– · –) | – (– · –) | – | – | – | – |
| steht | KI-Uhr Mittel ms | 0.157 (0.166 · 0.147) | 0.134 (0.131 · 0.138) | -0.022 | 0.021 | -2.14 | nicht langsamer |
| steht | KI-Uhr p95 ms | 0.30 (0.30 · 0.30) | 0.20 (0.20 · 0.20) | -0.10 | 0.00 | – | nicht langsamer |
| steht | KI-Uhr p99 ms | 0.35 (0.40 · 0.30) | 0.30 (0.30 · 0.30) | -0.05 | 0.10 | -1.00 | nicht langsamer |
| steht | KI-Takt EWMA ms | 0.42 (0.43 · 0.40) | 0.49 (0.42 · 0.56) | +0.07 | 0.14 | 1.05 | nicht langsamer |
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
