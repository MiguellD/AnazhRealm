## d-ego — je Boot

| Boot | Gang | fps | Frame p50 ms | Frame p95 ms | Frame p99 ms | CPU-Takt p50 ms | CPU-Takt p95 ms | CPU-Takt p99 ms | GPU-Durchsatz p50 ms | k0 p50 ms | GPU p95 ms (lauf) | GPU je Bild ms (gpu-bank) | Belegung p50 ms | Belegung p95 ms | außer Takt p95 ms | Lebenszyklus p95 ms | über 33 ms % | KI-Uhr Mittel ms | KI-Uhr p95 ms | KI-Uhr p99 ms | KI-Takt EWMA ms |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| d-ego-A1 | steht | 73.1 | 16.6 | 16.8 | 17.0 | 4.10 | 5.2 | 6.2 | 13.90 | 0.21 | 3.81 | 13.19 | 5.86 | 7.39 | 0.76 | 0.08 | – | 0.158 | 0.30 | 0.40 | 0.55 |
| d-ego-A1 | geht-1 | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – |
| d-ego-A1 | Geher-Ende |  | | | | | | | | | | | | | | | | | | | |
| d-ego-A2 | steht | 72.0 | 16.6 | 16.8 | 17.0 | 4.10 | 5.3 | 6.2 | 14.20 | 0.20 | 3.78 | 13.15 | 5.94 | 7.56 | 0.77 | 0.08 | – | 0.161 | 0.30 | 0.40 | 0.56 |
| d-ego-A2 | geht-1 | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – |
| d-ego-A2 | Geher-Ende |  | | | | | | | | | | | | | | | | | | | |
| d-ego-B1 | steht | 73.4 | 16.6 | 16.8 | 17.0 | 4.00 | 5.1 | 6.1 | 13.90 | 0.20 | 3.84 | 12.97 | 5.87 | 7.31 | 0.90 | 0.08 | – | 0.158 | 0.30 | 0.40 | 0.52 |
| d-ego-B1 | geht-1 | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – |
| d-ego-B1 | Geher-Ende |  | | | | | | | | | | | | | | | | | | | |
| d-ego-B2 | steht | 71.7 | 16.6 | 16.8 | 17.0 | 4.10 | 5.3 | 6.2 | 14.20 | 0.21 | 3.84 | 13.29 | 6.08 | 7.64 | 0.93 | 0.08 | – | 0.168 | 0.30 | 0.40 | 0.49 |
| d-ego-B2 | geht-1 | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – |
| d-ego-B2 | Geher-Ende |  | | | | | | | | | | | | | | | | | | | |

## Tier-Zensus je Boot (zensus-0 nach umstellen · zensus-1 nach geht-1)

- d-ego-A1: vorher 5 (deer 5; Würfe≥2 1: deer 5 Spanne 3.7 m @179.9 m; Verband-Feld true, Verbände≥2 1: deer 5 Spanne 3.7 m; Zustand {"-":5})
  nachher –
- d-ego-A2: vorher 5 (deer 5; Würfe≥2 1: deer 5 Spanne 3.6 m @180 m; Verband-Feld true, Verbände≥2 1: deer 5 Spanne 3.6 m; Zustand {"-":5})
  nachher –
- d-ego-B1: vorher 5 (deer 5; Würfe≥2 1: deer 5 Spanne 3.8 m @179.9 m; Verband-Feld true, Verbände≥2 1: deer 5 Spanne 3.8 m; Zustand {"-":5})
  nachher –
- d-ego-B2: vorher 5 (deer 5; Würfe≥2 1: deer 5 Spanne 3.7 m @180 m; Verband-Feld true, Verbände≥2 1: deer 5 Spanne 3.7 m; Zustand {"-":5})
  nachher –

## GPU-Takt je Boot (nvidia-smi 1 s, nur P0-Sekunden: Median-MHz · Anteil Drossel (Grund ≠ 0 ohne GpuIdle 0x1) · max °C)

- d-ego-A1: 102 s · 1708 MHz · Drossel 25 % · 86 °C
- d-ego-A2: 105 s · 1708 MHz · Drossel 20 % · 86 °C
- d-ego-B1: 103 s · 1708 MHz · Drossel 24 % · 86 °C
- d-ego-B2: 105 s · 1708 MHz · Drossel 22 % · 86 °C

## Mittel je Seite (A 8dff8f15 · B eeaff9d6; gehend = geht-1 je Boot)

| Gang | Größe | A | B | Δ B − A | 2σ | t (Welch) | Urteil |
|---|---|---|---|---|---|---|---|
| steht | fps | 72.5 (73.1 · 72.0) | 72.6 (73.4 · 71.7) | +0.0 | 2.0 | 0.00 | nicht langsamer |
| steht | Frame p50 ms | 16.6 (16.6 · 16.6) | 16.6 (16.6 · 16.6) | 0.0 | 0.0 | – | nicht langsamer |
| steht | Frame p95 ms | 16.8 (16.8 · 16.8) | 16.8 (16.8 · 16.8) | 0.0 | 0.0 | – | nicht langsamer |
| steht | Frame p99 ms | 17.0 (17.0 · 17.0) | 17.0 (17.0 · 17.0) | 0.0 | 0.0 | – | nicht langsamer |
| steht | CPU-Takt p50 ms | 4.10 (4.10 · 4.10) | 4.05 (4.00 · 4.10) | -0.05 | 0.10 | -1.00 | nicht langsamer |
| steht | CPU-Takt p95 ms | 5.3 (5.2 · 5.3) | 5.2 (5.1 · 5.3) | -0.1 | 0.2 | -0.45 | nicht langsamer |
| steht | CPU-Takt p99 ms | 6.2 (6.2 · 6.2) | 6.2 (6.1 · 6.2) | -0.0 | 0.1 | -1.00 | nicht langsamer |
| steht | GPU-Durchsatz p50 ms | 14.05 (13.90 · 14.20) | 14.05 (13.90 · 14.20) | 0.00 | 0.42 | 0.00 | nicht langsamer |
| steht | k0 p50 ms | 0.21 (0.21 · 0.20) | 0.21 (0.20 · 0.21) | 0.00 | 0.01 | 0.00 | nicht langsamer |
| steht | GPU p95 ms (lauf) | 3.79 (3.81 · 3.78) | 3.84 (3.84 · 3.84) | +0.04 | 0.03 | 3.00 | LANGSAMER |
| steht | GPU je Bild ms (gpu-bank) | 13.17 (13.19 · 13.15) | 13.13 (12.97 · 13.29) | -0.04 | 0.32 | -0.25 | nicht langsamer |
| steht | Belegung p50 ms | 5.90 (5.86 · 5.94) | 5.97 (5.87 · 6.08) | +0.07 | 0.22 | 0.67 | nicht langsamer |
| steht | Belegung p95 ms | 7.47 (7.39 · 7.56) | 7.47 (7.31 · 7.64) | 0.00 | 0.37 | 0.00 | nicht langsamer |
| steht | außer Takt p95 ms | 0.77 (0.76 · 0.77) | 0.92 (0.90 · 0.93) | +0.15 | 0.03 | 9.49 | LANGSAMER |
| steht | Lebenszyklus p95 ms | 0.08 (0.08 · 0.08) | 0.08 (0.08 · 0.08) | 0.00 | 0.00 | – | nicht langsamer |
| steht | über 33 ms % | – (– · –) | – (– · –) | – | – | – | – |
| steht | KI-Uhr Mittel ms | 0.159 (0.158 · 0.161) | 0.163 (0.158 · 0.168) | +0.004 | 0.011 | 0.63 | nicht langsamer |
| steht | KI-Uhr p95 ms | 0.30 (0.30 · 0.30) | 0.30 (0.30 · 0.30) | 0.00 | 0.00 | – | nicht langsamer |
| steht | KI-Uhr p99 ms | 0.40 (0.40 · 0.40) | 0.40 (0.40 · 0.40) | 0.00 | 0.00 | – | nicht langsamer |
| steht | KI-Takt EWMA ms | 0.56 (0.55 · 0.56) | 0.51 (0.52 · 0.49) | -0.05 | 0.03 | -3.16 | nicht langsamer |
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
