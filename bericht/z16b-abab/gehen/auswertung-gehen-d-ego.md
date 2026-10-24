## d-ego — je Boot

| Boot | Gang | fps | Frame p50 ms | Frame p95 ms | Frame p99 ms | CPU-Takt p50 ms | CPU-Takt p95 ms | CPU-Takt p99 ms | GPU-Durchsatz p50 ms | k0 p50 ms | GPU p95 ms (lauf) | GPU je Bild ms (gpu-bank) | Belegung p50 ms | Belegung p95 ms | außer Takt p95 ms | Lebenszyklus p95 ms | über 33 ms % | KI-Uhr Mittel ms | KI-Uhr p95 ms | KI-Uhr p99 ms | KI-Takt EWMA ms |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| d-ego-A1 | steht | 74.9 | 16.6 | 16.8 | 17.2 | 4.20 | 5.6 | 6.7 | 13.30 | 0.18 | 2.56 | 12.60 | 5.80 | 7.40 | 0.75 | 0.08 | – | 0.166 | 0.30 | 0.40 | 0.41 |
| d-ego-A1 | geht-1 | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – |
| d-ego-A1 | Geher-Ende |  | | | | | | | | | | | | | | | | | | | |
| d-ego-A2 | steht | 75.1 | 16.6 | 16.8 | 17.0 | 4.40 | 6.0 | 7.1 | 13.20 | 0.18 | 2.63 | 12.91 | 5.96 | 8.13 | 0.80 | 0.08 | – | 0.213 | 0.40 | 0.50 | 0.59 |
| d-ego-A2 | geht-1 | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – |
| d-ego-A2 | Geher-Ende |  | | | | | | | | | | | | | | | | | | | |
| d-ego-B1 | steht | 75.1 | 16.6 | 16.8 | 17.0 | 4.00 | 5.4 | 6.4 | 13.40 | 0.18 | 2.61 | 12.94 | 5.65 | 7.09 | 0.75 | 0.08 | – | 0.150 | 0.30 | 0.40 | 0.38 |
| d-ego-B1 | geht-1 | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – |
| d-ego-B1 | Geher-Ende |  | | | | | | | | | | | | | | | | | | | |
| d-ego-B2 | steht | 75.2 | 16.6 | 16.8 | 17.0 | 4.20 | 5.4 | 6.2 | 13.20 | 0.18 | 2.58 | 12.62 | 5.83 | 7.29 | 0.74 | 0.08 | – | 0.206 | 0.40 | 0.50 | 0.53 |
| d-ego-B2 | geht-1 | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – |
| d-ego-B2 | Geher-Ende |  | | | | | | | | | | | | | | | | | | | |

## Tier-Zensus je Boot (zensus-0 nach umstellen · zensus-1 nach geht-1)

- d-ego-A1: vorher 6 (deer 6; Würfe≥2 1: deer 6 Spanne 3.4 m @156.6 m; Verband-Feld true, Verbände≥2 1: deer 6 Spanne 3.4 m; Zustand {"-":6})
  nachher –
- d-ego-A2: vorher 5 (deer 4, fox 1; Würfe≥2 1: deer 4 Spanne 2.4 m @180.1 m; Verband-Feld true, Verbände≥2 1: deer 4 Spanne 2.4 m; Zustand {"-":5})
  nachher –
- d-ego-B1: vorher 5 (deer 5; Würfe≥2 1: deer 5 Spanne 3 m @185.9 m; Verband-Feld true, Verbände≥2 1: deer 5 Spanne 3 m; Zustand {"-":5})
  nachher –
- d-ego-B2: vorher 5 (deer 4, fox 1; Würfe≥2 1: deer 4 Spanne 2.5 m @180.2 m; Verband-Feld true, Verbände≥2 1: deer 4 Spanne 2.5 m; Zustand {"-":5})
  nachher –

## GPU-Takt je Boot (nvidia-smi 1 s, nur P0-Sekunden: Median-MHz · Anteil Drossel (Grund ≠ 0 ohne GpuIdle 0x1) · max °C)

- d-ego-A1: 109 s · 1670 MHz · Drossel 19 % · 86 °C
- d-ego-A2: 96 s · 1695 MHz · Drossel 21 % · 83 °C
- d-ego-B1: 100 s · 1695 MHz · Drossel 24 % · 86 °C
- d-ego-B2: 103 s · 1708 MHz · Drossel 23 % · 83 °C

## Mittel je Seite (A 3d2b3276 · B 3046bc79; gehend = geht-1 je Boot)

| Gang | Größe | A | B | Δ B − A | 2σ | t (Welch) | Urteil |
|---|---|---|---|---|---|---|---|
| steht | fps | 75.0 (74.9 · 75.1) | 75.2 (75.1 · 75.2) | +0.2 | 0.2 | 1.34 | nicht langsamer |
| steht | Frame p50 ms | 16.6 (16.6 · 16.6) | 16.6 (16.6 · 16.6) | 0.0 | 0.0 | – | nicht langsamer |
| steht | Frame p95 ms | 16.8 (16.8 · 16.8) | 16.8 (16.8 · 16.8) | 0.0 | 0.0 | – | nicht langsamer |
| steht | Frame p99 ms | 17.1 (17.2 · 17.0) | 17.0 (17.0 · 17.0) | -0.1 | 0.2 | -1.00 | nicht langsamer |
| steht | CPU-Takt p50 ms | 4.30 (4.20 · 4.40) | 4.10 (4.00 · 4.20) | -0.20 | 0.28 | -1.41 | nicht langsamer |
| steht | CPU-Takt p95 ms | 5.8 (5.6 · 6.0) | 5.4 (5.4 · 5.4) | -0.4 | 0.4 | -2.00 | nicht langsamer |
| steht | CPU-Takt p99 ms | 6.9 (6.7 · 7.1) | 6.3 (6.4 · 6.2) | -0.6 | 0.4 | -2.68 | nicht langsamer |
| steht | GPU-Durchsatz p50 ms | 13.25 (13.30 · 13.20) | 13.30 (13.40 · 13.20) | +0.05 | 0.22 | 0.45 | nicht langsamer |
| steht | k0 p50 ms | 0.18 (0.18 · 0.18) | 0.18 (0.18 · 0.18) | 0.00 | 0.00 | – | nicht langsamer |
| steht | GPU p95 ms (lauf) | 2.59 (2.56 · 2.63) | 2.59 (2.61 · 2.58) | 0.00 | 0.08 | 0.00 | nicht langsamer |
| steht | GPU je Bild ms (gpu-bank) | 12.75 (12.60 · 12.91) | 12.78 (12.94 · 12.62) | +0.03 | 0.45 | 0.11 | nicht langsamer |
| steht | Belegung p50 ms | 5.88 (5.80 · 5.96) | 5.74 (5.65 · 5.83) | -0.14 | 0.24 | -1.16 | nicht langsamer |
| steht | Belegung p95 ms | 7.77 (7.40 · 8.13) | 7.19 (7.09 · 7.29) | -0.58 | 0.76 | -1.52 | nicht langsamer |
| steht | außer Takt p95 ms | 0.78 (0.75 · 0.80) | 0.74 (0.75 · 0.74) | -0.03 | 0.05 | -1.18 | nicht langsamer |
| steht | Lebenszyklus p95 ms | 0.08 (0.08 · 0.08) | 0.08 (0.08 · 0.08) | 0.00 | 0.00 | – | nicht langsamer |
| steht | über 33 ms % | – (– · –) | – (– · –) | – | – | – | – |
| steht | KI-Uhr Mittel ms | 0.190 (0.166 · 0.213) | 0.178 (0.150 · 0.206) | -0.012 | 0.073 | -0.32 | nicht langsamer |
| steht | KI-Uhr p95 ms | 0.35 (0.30 · 0.40) | 0.35 (0.30 · 0.40) | 0.00 | 0.14 | 0.00 | nicht langsamer |
| steht | KI-Uhr p99 ms | 0.45 (0.40 · 0.50) | 0.45 (0.40 · 0.50) | 0.00 | 0.14 | 0.00 | nicht langsamer |
| steht | KI-Takt EWMA ms | 0.50 (0.41 · 0.59) | 0.46 (0.38 · 0.53) | -0.04 | 0.23 | -0.38 | nicht langsamer |
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
