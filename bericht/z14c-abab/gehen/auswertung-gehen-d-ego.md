## d-ego — je Boot

| Boot | Gang | fps | Frame p50 ms | Frame p95 ms | Frame p99 ms | CPU-Takt p50 ms | CPU-Takt p95 ms | CPU-Takt p99 ms | GPU-Durchsatz p50 ms | k0 p50 ms | GPU p95 ms (lauf) | GPU je Bild ms (gpu-bank) | Belegung p50 ms | Belegung p95 ms | außer Takt p95 ms | Lebenszyklus p95 ms | über 33 ms % | KI-Uhr Mittel ms | KI-Uhr p95 ms | KI-Uhr p99 ms | KI-Takt EWMA ms |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| d-ego-A1 | steht | 77.3 | 16.6 | 16.8 | 17.0 | 3.90 | 4.9 | 6.0 | 12.80 | 0.18 | 2.58 | 12.38 | 5.08 | 6.47 | 0.68 | 0.08 | – | 0.134 | 0.20 | 0.30 | 0.31 |
| d-ego-A1 | geht-1 | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – |
| d-ego-A1 | Geher-Ende |  | | | | | | | | | | | | | | | | | | | |
| d-ego-A2 | steht | 75.7 | 16.6 | 16.8 | 17.1 | 4.10 | 5.2 | 6.2 | 13.10 | 0.18 | 2.56 | 12.52 | 5.46 | 6.91 | 0.71 | 0.08 | – | 0.180 | 0.30 | 0.40 | 0.44 |
| d-ego-A2 | geht-1 | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – |
| d-ego-A2 | Geher-Ende |  | | | | | | | | | | | | | | | | | | | |
| d-ego-B1 | steht | 76.4 | 16.6 | 16.8 | 17.1 | 4.10 | 5.1 | 6.0 | 12.90 | 0.18 | 2.56 | 12.26 | 5.36 | 6.80 | 0.70 | 0.07 | – | 0.160 | 0.30 | 0.40 | 0.32 |
| d-ego-B1 | geht-1 | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – |
| d-ego-B1 | Geher-Ende |  | | | | | | | | | | | | | | | | | | | |
| d-ego-B2 | steht | 76.2 | 16.6 | 16.8 | 17.1 | 4.00 | 5.1 | 6.0 | 13.00 | 0.18 | 2.62 | 12.16 | 5.37 | 6.88 | 0.71 | 0.08 | – | 0.187 | 0.30 | 0.40 | 0.40 |
| d-ego-B2 | geht-1 | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – |
| d-ego-B2 | Geher-Ende |  | | | | | | | | | | | | | | | | | | | |

## Tier-Zensus je Boot (zensus-0 nach umstellen · zensus-1 nach geht-1)

- d-ego-A1: vorher 5 (deer 5; Würfe≥2 1: deer 5 Spanne 3 m @185.7 m; Verband-Feld true, Verbände≥2 1: deer 5 Spanne 3 m; Zustand {"-":5})
  nachher –
- d-ego-A2: vorher 5 (deer 4, fox 1; Würfe≥2 1: deer 4 Spanne 2.5 m @180.2 m; Verband-Feld true, Verbände≥2 1: deer 4 Spanne 2.5 m; Zustand {"-":5})
  nachher –
- d-ego-B1: vorher 4 (deer 4; Würfe≥2 1: deer 4 Spanne 2.5 m @178.8 m; Verband-Feld true, Verbände≥2 1: deer 4 Spanne 2.5 m; Zustand {"-":4})
  nachher –
- d-ego-B2: vorher 5 (deer 4, fox 1; Würfe≥2 1: deer 4 Spanne 2.5 m @180.2 m; Verband-Feld true, Verbände≥2 1: deer 4 Spanne 2.5 m; Zustand {"-":5})
  nachher –

## GPU-Takt je Boot (nvidia-smi 1 s, nur P0-Sekunden: Median-MHz · Anteil Drossel (Grund ≠ 0 ohne GpuIdle 0x1) · max °C)

- d-ego-A1: 94 s · 1695 MHz · Drossel 32 % · 85 °C
- d-ego-A2: 108 s · 1695 MHz · Drossel 23 % · 85 °C
- d-ego-B1: 103 s · 1695 MHz · Drossel 25 % · 85 °C
- d-ego-B2: 101 s · 1695 MHz · Drossel 22 % · 85 °C

## Mittel je Seite (A 18a84649 · B 056330d8; gehend = geht-1 je Boot)

| Gang | Größe | A | B | Δ B − A | 2σ | t (Welch) | Urteil |
|---|---|---|---|---|---|---|---|
| steht | fps | 76.5 (77.3 · 75.7) | 76.3 (76.4 · 76.2) | -0.2 | 1.6 | -0.25 | nicht langsamer |
| steht | Frame p50 ms | 16.6 (16.6 · 16.6) | 16.6 (16.6 · 16.6) | 0.0 | 0.0 | – | nicht langsamer |
| steht | Frame p95 ms | 16.8 (16.8 · 16.8) | 16.8 (16.8 · 16.8) | 0.0 | 0.0 | – | nicht langsamer |
| steht | Frame p99 ms | 17.1 (17.0 · 17.1) | 17.1 (17.1 · 17.1) | +0.1 | 0.1 | 1.00 | nicht langsamer |
| steht | CPU-Takt p50 ms | 4.00 (3.90 · 4.10) | 4.05 (4.10 · 4.00) | +0.05 | 0.22 | 0.45 | nicht langsamer |
| steht | CPU-Takt p95 ms | 5.1 (4.9 · 5.2) | 5.1 (5.1 · 5.1) | +0.0 | 0.3 | 0.33 | nicht langsamer |
| steht | CPU-Takt p99 ms | 6.1 (6.0 · 6.2) | 6.0 (6.0 · 6.0) | -0.1 | 0.2 | -1.00 | nicht langsamer |
| steht | GPU-Durchsatz p50 ms | 12.95 (12.80 · 13.10) | 12.95 (12.90 · 13.00) | 0.00 | 0.32 | 0.00 | nicht langsamer |
| steht | k0 p50 ms | 0.18 (0.18 · 0.18) | 0.18 (0.18 · 0.18) | 0.00 | 0.00 | – | nicht langsamer |
| steht | GPU p95 ms (lauf) | 2.57 (2.58 · 2.56) | 2.59 (2.56 · 2.62) | +0.02 | 0.06 | 0.63 | nicht langsamer |
| steht | GPU je Bild ms (gpu-bank) | 12.45 (12.38 · 12.52) | 12.21 (12.26 · 12.16) | -0.24 | 0.17 | -2.79 | nicht langsamer |
| steht | Belegung p50 ms | 5.27 (5.08 · 5.46) | 5.37 (5.36 · 5.37) | +0.10 | 0.38 | 0.50 | nicht langsamer |
| steht | Belegung p95 ms | 6.69 (6.47 · 6.91) | 6.84 (6.80 · 6.88) | +0.15 | 0.45 | 0.67 | nicht langsamer |
| steht | außer Takt p95 ms | 0.70 (0.68 · 0.71) | 0.70 (0.70 · 0.71) | +0.01 | 0.03 | 0.63 | nicht langsamer |
| steht | Lebenszyklus p95 ms | 0.08 (0.08 · 0.08) | 0.08 (0.07 · 0.08) | -0.00 | 0.01 | -1.00 | nicht langsamer |
| steht | über 33 ms % | – (– · –) | – (– · –) | – | – | – | – |
| steht | KI-Uhr Mittel ms | 0.157 (0.134 · 0.180) | 0.174 (0.160 · 0.187) | +0.017 | 0.053 | 0.64 | nicht langsamer |
| steht | KI-Uhr p95 ms | 0.25 (0.20 · 0.30) | 0.30 (0.30 · 0.30) | +0.05 | 0.10 | 1.00 | nicht langsamer |
| steht | KI-Uhr p99 ms | 0.35 (0.30 · 0.40) | 0.40 (0.40 · 0.40) | +0.05 | 0.10 | 1.00 | nicht langsamer |
| steht | KI-Takt EWMA ms | 0.38 (0.31 · 0.44) | 0.36 (0.32 · 0.40) | -0.02 | 0.15 | -0.20 | nicht langsamer |
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
