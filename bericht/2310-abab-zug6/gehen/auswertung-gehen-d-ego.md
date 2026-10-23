## d-ego — je Boot

| Boot | Gang | fps | Frame p50 ms | Frame p95 ms | Frame p99 ms | CPU-Takt p50 ms | CPU-Takt p95 ms | CPU-Takt p99 ms | GPU-Durchsatz p50 ms | k0 p50 ms | GPU p95 ms (lauf) | GPU je Bild ms (gpu-bank) | Belegung p50 ms | Belegung p95 ms | außer Takt p95 ms | Lebenszyklus p95 ms | über 33 ms % | KI-Uhr Mittel ms | KI-Uhr p95 ms | KI-Uhr p99 ms | KI-Takt EWMA ms |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| d-ego-A1 | steht | 78.0 | 16.5 | 16.8 | 17.0 | 4.00 | 5.2 | 6.2 | 12.70 | 0.22 | 2.60 | 12.39 | 5.27 | 7.12 | 0.72 | 0.08 | – | 0.221 | 0.40 | 0.50 | 0.43 |
| d-ego-A1 | geht-1 | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – |
| d-ego-A1 | Geher-Ende |  | | | | | | | | | | | | | | | | | | | |
| d-ego-A2 | steht | 78.2 | 16.5 | 16.8 | 17.0 | 4.10 | 5.4 | 6.7 | 12.70 | 0.22 | 2.62 | 12.38 | 5.41 | 7.28 | 0.75 | 0.08 | – | 0.233 | 0.40 | 0.50 | 0.46 |
| d-ego-A2 | geht-1 | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – |
| d-ego-A2 | Geher-Ende |  | | | | | | | | | | | | | | | | | | | |
| d-ego-B1 | steht | 78.4 | 16.5 | 16.8 | 17.0 | 4.00 | 5.3 | 6.3 | 12.70 | 0.22 | 2.63 | 12.28 | 5.30 | 7.11 | 0.72 | 0.08 | – | 0.250 | 0.40 | 0.50 | 0.41 |
| d-ego-B1 | geht-1 | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – |
| d-ego-B1 | Geher-Ende |  | | | | | | | | | | | | | | | | | | | |
| d-ego-B2 | steht | 77.7 | 16.5 | 16.8 | 17.0 | 4.00 | 5.4 | 6.2 | 12.80 | 0.22 | 2.60 | 12.09 | 5.36 | 7.09 | 0.72 | 0.07 | – | 0.236 | 0.40 | 0.50 | 0.48 |
| d-ego-B2 | geht-1 | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – |
| d-ego-B2 | Geher-Ende |  | | | | | | | | | | | | | | | | | | | |

## Tier-Zensus je Boot (zensus-0 nach umstellen · zensus-1 nach geht-1)

- d-ego-A1: vorher 10 (bear 1, deer 6, wolf 3; Würfe≥2 2: deer 6 Spanne 4.5 m @144.3 m | wolf 3 Spanne 1.3 m @204.3 m; Verband-Feld true, Verbände≥2 2: deer 6 Spanne 4.5 m | wolf 3 Spanne 1.3 m; Zustand {"-":10})
  nachher –
- d-ego-A2: vorher 10 (bear 1, deer 6, wolf 3; Würfe≥2 2: deer 6 Spanne 4 m @144.1 m | wolf 3 Spanne 1.3 m @204.9 m; Verband-Feld true, Verbände≥2 2: deer 6 Spanne 4 m | wolf 3 Spanne 1.3 m; Zustand {"-":10})
  nachher –
- d-ego-B1: vorher 10 (bear 1, deer 6, wolf 3; Würfe≥2 2: deer 6 Spanne 3.9 m @144.4 m | wolf 3 Spanne 1.7 m @204.2 m; Verband-Feld true, Verbände≥2 2: deer 6 Spanne 3.9 m | wolf 3 Spanne 1.7 m; Zustand {"-":10})
  nachher –
- d-ego-B2: vorher 10 (bear 1, deer 6, wolf 3; Würfe≥2 2: deer 6 Spanne 4.1 m @143.9 m | wolf 3 Spanne 1.4 m @204 m; Verband-Feld true, Verbände≥2 2: deer 6 Spanne 4.1 m | wolf 3 Spanne 1.4 m; Zustand {"-":10})
  nachher –

## GPU-Takt je Boot (nvidia-smi 1 s, nur P0-Sekunden: Median-MHz · Anteil Drossel (Grund ≠ 0 ohne GpuIdle 0x1) · max °C)

- d-ego-A1: 107 s · 1670 MHz · Drossel 19 % · 86 °C
- d-ego-A2: 107 s · 1695 MHz · Drossel 23 % · 86 °C
- d-ego-B1: 103 s · 1708 MHz · Drossel 18 % · 86 °C
- d-ego-B2: 103 s · 1695 MHz · Drossel 25 % · 86 °C

## Mittel je Seite (A 7c6f4b49 · B 6579e8f4; gehend = geht-1 je Boot)

| Gang | Größe | A | B | Δ B − A | 2σ | t (Welch) | Urteil |
|---|---|---|---|---|---|---|---|
| steht | fps | 78.1 (78.0 · 78.2) | 78.1 (78.4 · 77.7) | -0.0 | 0.7 | -0.14 | nicht langsamer |
| steht | Frame p50 ms | 16.5 (16.5 · 16.5) | 16.5 (16.5 · 16.5) | 0.0 | 0.0 | – | nicht langsamer |
| steht | Frame p95 ms | 16.8 (16.8 · 16.8) | 16.8 (16.8 · 16.8) | 0.0 | 0.0 | – | nicht langsamer |
| steht | Frame p99 ms | 17.0 (17.0 · 17.0) | 17.0 (17.0 · 17.0) | 0.0 | 0.0 | – | nicht langsamer |
| steht | CPU-Takt p50 ms | 4.05 (4.00 · 4.10) | 4.00 (4.00 · 4.00) | -0.05 | 0.10 | -1.00 | nicht langsamer |
| steht | CPU-Takt p95 ms | 5.3 (5.2 · 5.4) | 5.3 (5.3 · 5.4) | +0.0 | 0.2 | 0.45 | nicht langsamer |
| steht | CPU-Takt p99 ms | 6.5 (6.2 · 6.7) | 6.3 (6.3 · 6.2) | -0.2 | 0.5 | -0.78 | nicht langsamer |
| steht | GPU-Durchsatz p50 ms | 12.70 (12.70 · 12.70) | 12.75 (12.70 · 12.80) | +0.05 | 0.10 | 1.00 | nicht langsamer |
| steht | k0 p50 ms | 0.22 (0.22 · 0.22) | 0.22 (0.22 · 0.22) | 0.00 | 0.00 | – | nicht langsamer |
| steht | GPU p95 ms (lauf) | 2.61 (2.60 · 2.62) | 2.62 (2.63 · 2.60) | +0.00 | 0.04 | 0.28 | nicht langsamer |
| steht | GPU je Bild ms (gpu-bank) | 12.39 (12.39 · 12.38) | 12.18 (12.28 · 12.09) | -0.20 | 0.19 | -2.10 | nicht langsamer |
| steht | Belegung p50 ms | 5.34 (5.27 · 5.41) | 5.33 (5.30 · 5.36) | -0.01 | 0.15 | -0.13 | nicht langsamer |
| steht | Belegung p95 ms | 7.20 (7.12 · 7.28) | 7.10 (7.11 · 7.09) | -0.10 | 0.16 | -1.24 | nicht langsamer |
| steht | außer Takt p95 ms | 0.73 (0.72 · 0.75) | 0.72 (0.72 · 0.72) | -0.02 | 0.03 | -1.00 | nicht langsamer |
| steht | Lebenszyklus p95 ms | 0.08 (0.08 · 0.08) | 0.08 (0.08 · 0.07) | -0.00 | 0.01 | -1.00 | nicht langsamer |
| steht | über 33 ms % | – (– · –) | – (– · –) | – | – | – | – |
| steht | KI-Uhr Mittel ms | 0.227 (0.221 · 0.233) | 0.243 (0.250 · 0.236) | +0.016 | 0.018 | 1.76 | nicht langsamer |
| steht | KI-Uhr p95 ms | 0.40 (0.40 · 0.40) | 0.40 (0.40 · 0.40) | 0.00 | 0.00 | – | nicht langsamer |
| steht | KI-Uhr p99 ms | 0.50 (0.50 · 0.50) | 0.50 (0.50 · 0.50) | 0.00 | 0.00 | – | nicht langsamer |
| steht | KI-Takt EWMA ms | 0.45 (0.43 · 0.46) | 0.44 (0.41 · 0.48) | -0.00 | 0.08 | -0.00 | nicht langsamer |
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
