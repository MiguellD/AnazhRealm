## d-ego — je Boot

| Boot | Gang | fps | Frame p50 ms | Frame p95 ms | Frame p99 ms | CPU-Takt p50 ms | CPU-Takt p95 ms | CPU-Takt p99 ms | GPU-Durchsatz p50 ms | k0 p50 ms | GPU p95 ms (lauf) | GPU je Bild ms (gpu-bank) | Belegung p50 ms | Belegung p95 ms | außer Takt p95 ms | Lebenszyklus p95 ms | über 33 ms % | KI-Uhr Mittel ms | KI-Uhr p95 ms | KI-Uhr p99 ms | KI-Takt EWMA ms |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| d-ego-A1 | steht | 73.6 | 16.6 | 16.8 | 16.8 | 3.90 | 5.1 | 6.2 | 13.80 | 0.21 | 3.44 | 13.01 | 5.57 | 7.04 | 0.77 | 0.08 | – | 0.149 | 0.30 | 0.40 | 0.40 |
| d-ego-A1 | geht-1 | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – |
| d-ego-A1 | Geher-Ende |  | | | | | | | | | | | | | | | | | | | |
| d-ego-A2 | steht | 74.7 | 16.6 | 16.8 | 17.0 | 3.60 | 4.7 | 5.7 | 13.60 | 0.21 | 3.71 | 13.08 | 5.08 | 6.50 | 0.71 | 0.08 | – | 0.126 | 0.20 | 0.30 | 0.37 |
| d-ego-A2 | geht-1 | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – |
| d-ego-A2 | Geher-Ende |  | | | | | | | | | | | | | | | | | | | |
| d-ego-B1 | steht | 74.2 | 16.6 | 16.8 | 16.8 | 4.10 | 5.3 | 6.3 | 13.70 | 0.20 | 3.66 | 12.83 | 5.77 | 7.34 | 0.79 | 0.08 | – | 0.139 | 0.30 | 0.30 | 0.51 |
| d-ego-B1 | geht-1 | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – |
| d-ego-B1 | Geher-Ende |  | | | | | | | | | | | | | | | | | | | |
| d-ego-B2 | steht | 74.9 | 16.6 | 16.8 | 17.0 | 3.60 | 4.7 | 5.7 | 13.60 | 0.20 | 3.64 | 12.40 | 5.12 | 6.61 | 0.72 | 0.08 | – | 0.133 | 0.20 | 0.30 | 0.41 |
| d-ego-B2 | geht-1 | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – |
| d-ego-B2 | Geher-Ende |  | | | | | | | | | | | | | | | | | | | |

## Tier-Zensus je Boot (zensus-0 nach umstellen · zensus-1 nach geht-1)

- d-ego-A1: vorher 5 (deer 5; Würfe≥2 1: deer 5 Spanne 3.7 m @179.9 m; Verband-Feld true, Verbände≥2 1: deer 5 Spanne 3.7 m; Zustand {"-":5})
  nachher –
- d-ego-A2: vorher 5 (deer 5; Würfe≥2 1: deer 5 Spanne 3.7 m @180 m; Verband-Feld true, Verbände≥2 1: deer 5 Spanne 3.7 m; Zustand {"-":5})
  nachher –
- d-ego-B1: vorher 5 (deer 5; Würfe≥2 1: deer 5 Spanne 3.6 m @179.9 m; Verband-Feld true, Verbände≥2 1: deer 5 Spanne 3.6 m; Zustand {"-":5})
  nachher –
- d-ego-B2: vorher 5 (deer 5; Würfe≥2 1: deer 5 Spanne 3.7 m @179.9 m; Verband-Feld true, Verbände≥2 1: deer 5 Spanne 3.7 m; Zustand {"-":5})
  nachher –

## GPU-Takt je Boot (nvidia-smi 1 s, nur P0-Sekunden: Median-MHz · Anteil Drossel (Grund ≠ 0 ohne GpuIdle 0x1) · max °C)

- d-ego-A1: 108 s · 1695 MHz · Drossel 19 % · 86 °C
- d-ego-A2: 105 s · 1695 MHz · Drossel 14 % · 86 °C
- d-ego-B1: 102 s · 1708 MHz · Drossel 20 % · 86 °C
- d-ego-B2: 78 s · 1708 MHz · Drossel 27 % · 86 °C

## Mittel je Seite (A 83df2052 · B 8dff8f15; gehend = geht-1 je Boot)

| Gang | Größe | A | B | Δ B − A | 2σ | t (Welch) | Urteil |
|---|---|---|---|---|---|---|---|
| steht | fps | 74.2 (73.6 · 74.7) | 74.6 (74.2 · 74.9) | +0.4 | 1.3 | 0.61 | nicht langsamer |
| steht | Frame p50 ms | 16.6 (16.6 · 16.6) | 16.6 (16.6 · 16.6) | 0.0 | 0.0 | – | nicht langsamer |
| steht | Frame p95 ms | 16.8 (16.8 · 16.8) | 16.8 (16.8 · 16.8) | 0.0 | 0.0 | – | nicht langsamer |
| steht | Frame p99 ms | 16.9 (16.8 · 17.0) | 16.9 (16.8 · 17.0) | 0.0 | 0.3 | 0.00 | nicht langsamer |
| steht | CPU-Takt p50 ms | 3.75 (3.90 · 3.60) | 3.85 (4.10 · 3.60) | +0.10 | 0.58 | 0.34 | nicht langsamer |
| steht | CPU-Takt p95 ms | 4.9 (5.1 · 4.7) | 5.0 (5.3 · 4.7) | +0.1 | 0.7 | 0.28 | nicht langsamer |
| steht | CPU-Takt p99 ms | 6.0 (6.2 · 5.7) | 6.0 (6.3 · 5.7) | +0.0 | 0.8 | 0.13 | nicht langsamer |
| steht | GPU-Durchsatz p50 ms | 13.70 (13.80 · 13.60) | 13.65 (13.70 · 13.60) | -0.05 | 0.22 | -0.45 | nicht langsamer |
| steht | k0 p50 ms | 0.21 (0.21 · 0.21) | 0.20 (0.20 · 0.20) | -0.01 | 0.00 | – | nicht langsamer |
| steht | GPU p95 ms (lauf) | 3.58 (3.44 · 3.71) | 3.65 (3.66 · 3.64) | +0.08 | 0.27 | 0.55 | nicht langsamer |
| steht | GPU je Bild ms (gpu-bank) | 13.04 (13.01 · 13.08) | 12.62 (12.83 · 12.40) | -0.43 | 0.44 | -1.97 | nicht langsamer |
| steht | Belegung p50 ms | 5.33 (5.57 · 5.08) | 5.45 (5.77 · 5.12) | +0.12 | 0.81 | 0.29 | nicht langsamer |
| steht | Belegung p95 ms | 6.77 (7.04 · 6.50) | 6.97 (7.34 · 6.61) | +0.21 | 0.91 | 0.45 | nicht langsamer |
| steht | außer Takt p95 ms | 0.74 (0.77 · 0.71) | 0.76 (0.79 · 0.72) | +0.02 | 0.09 | 0.33 | nicht langsamer |
| steht | Lebenszyklus p95 ms | 0.08 (0.08 · 0.08) | 0.08 (0.08 · 0.08) | 0.00 | 0.00 | – | nicht langsamer |
| steht | über 33 ms % | – (– · –) | – (– · –) | – | – | – | – |
| steht | KI-Uhr Mittel ms | 0.138 (0.149 · 0.126) | 0.136 (0.139 · 0.133) | -0.002 | 0.023 | -0.13 | nicht langsamer |
| steht | KI-Uhr p95 ms | 0.25 (0.30 · 0.20) | 0.25 (0.30 · 0.20) | 0.00 | 0.14 | 0.00 | nicht langsamer |
| steht | KI-Uhr p99 ms | 0.35 (0.40 · 0.30) | 0.30 (0.30 · 0.30) | -0.05 | 0.10 | -1.00 | nicht langsamer |
| steht | KI-Takt EWMA ms | 0.39 (0.40 · 0.37) | 0.46 (0.51 · 0.41) | +0.07 | 0.10 | 1.44 | nicht langsamer |
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
