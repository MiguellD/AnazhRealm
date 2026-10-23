## d-ego — je Boot

| Boot | Gang | fps | Frame p50 ms | Frame p95 ms | Frame p99 ms | CPU-Takt p50 ms | CPU-Takt p95 ms | CPU-Takt p99 ms | GPU-Durchsatz p50 ms | k0 p50 ms | GPU p95 ms (lauf) | GPU je Bild ms (gpu-bank) | Belegung p50 ms | Belegung p95 ms | außer Takt p95 ms | Lebenszyklus p95 ms | über 33 ms % | KI-Uhr Mittel ms | KI-Uhr p95 ms | KI-Uhr p99 ms | KI-Takt EWMA ms |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| d-ego-A1 | steht | 77.0 | 16.5 | 16.8 | 17.1 | 4.20 | 5.6 | 6.6 | 12.90 | 0.23 | 2.62 | 12.79 | 5.67 | 7.46 | 0.77 | 0.08 | – | 0.252 | 0.40 | 0.50 | 0.47 |
| d-ego-A1 | geht-1 | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – |
| d-ego-A1 | Geher-Ende |  | | | | | | | | | | | | | | | | | | | |
| d-ego-A2 | steht | 78.8 | 16.5 | 16.8 | 17.0 | 4.00 | 5.3 | 6.0 | 12.60 | 0.22 | 2.63 | 12.38 | 5.26 | 7.11 | 0.72 | 0.07 | – | 0.230 | 0.40 | 0.50 | 0.43 |
| d-ego-A2 | geht-1 | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – |
| d-ego-A2 | Geher-Ende |  | | | | | | | | | | | | | | | | | | | |
| d-ego-B1 | steht | 78.0 | 16.5 | 16.8 | 17.0 | 4.10 | 5.3 | 6.4 | 12.70 | 0.22 | 2.59 | 11.81 | 5.38 | 7.16 | 0.73 | 0.08 | – | 0.238 | 0.40 | 0.50 | 0.36 |
| d-ego-B1 | geht-1 | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – |
| d-ego-B1 | Geher-Ende |  | | | | | | | | | | | | | | | | | | | |
| d-ego-B2 | steht | 77.8 | 16.5 | 16.7 | 17.0 | 4.20 | 5.6 | 6.9 | 12.70 | 0.22 | 2.57 | 12.42 | 5.54 | 7.37 | 0.77 | 0.08 | – | 0.240 | 0.40 | 0.50 | 0.48 |
| d-ego-B2 | geht-1 | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – |
| d-ego-B2 | Geher-Ende |  | | | | | | | | | | | | | | | | | | | |

## Tier-Zensus je Boot (zensus-0 nach umstellen · zensus-1 nach geht-1)

- d-ego-A1: vorher 10 (bear 1, deer 6, wolf 3; Würfe≥2 2: deer 6 Spanne 3.9 m @144.4 m | wolf 3 Spanne 1.5 m @204.2 m; Verband-Feld true, Verbände≥2 2: deer 6 Spanne 3.9 m | wolf 3 Spanne 1.5 m; Zustand {"-":10})
  nachher –
- d-ego-A2: vorher 10 (bear 1, deer 6, wolf 3; Würfe≥2 2: deer 6 Spanne 4.1 m @144.3 m | wolf 3 Spanne 1.4 m @204.6 m; Verband-Feld true, Verbände≥2 2: deer 6 Spanne 4.1 m | wolf 3 Spanne 1.4 m; Zustand {"-":10})
  nachher –
- d-ego-B1: vorher 10 (bear 1, deer 6, wolf 3; Würfe≥2 2: deer 6 Spanne 4 m @144.6 m | wolf 3 Spanne 1.4 m @204.8 m; Verband-Feld true, Verbände≥2 2: deer 6 Spanne 4 m | wolf 3 Spanne 1.4 m; Zustand {"-":10})
  nachher –
- d-ego-B2: vorher 10 (bear 1, deer 6, wolf 3; Würfe≥2 2: deer 6 Spanne 4.4 m @144.4 m | wolf 3 Spanne 1.3 m @204.3 m; Verband-Feld true, Verbände≥2 2: deer 6 Spanne 4.4 m | wolf 3 Spanne 1.3 m; Zustand {"-":10})
  nachher –

## GPU-Takt je Boot (nvidia-smi 1 s, nur P0-Sekunden: Median-MHz · Anteil Drossel (Grund ≠ 0 ohne GpuIdle 0x1) · max °C)

- d-ego-A1: 107 s · 1695 MHz · Drossel 16 % · 86 °C
- d-ego-A2: 109 s · 1683 MHz · Drossel 18 % · 86 °C
- d-ego-B1: 101 s · 1695 MHz · Drossel 23 % · 86 °C
- d-ego-B2: 108 s · 1695 MHz · Drossel 22 % · 86 °C

## Mittel je Seite (A 452972a6 main · B 7c6f4b49 zug 5; gehend = geht-1 je Boot)

| Gang | Größe | A | B | Δ B − A | 2σ | t (Welch) | Urteil |
|---|---|---|---|---|---|---|---|
| steht | fps | 77.9 (77.0 · 78.8) | 77.9 (78.0 · 77.8) | 0.0 | 1.8 | 0.00 | nicht langsamer |
| steht | Frame p50 ms | 16.5 (16.5 · 16.5) | 16.5 (16.5 · 16.5) | 0.0 | 0.0 | – | nicht langsamer |
| steht | Frame p95 ms | 16.8 (16.8 · 16.8) | 16.8 (16.8 · 16.7) | -0.1 | 0.1 | -1.00 | nicht langsamer |
| steht | Frame p99 ms | 17.1 (17.1 · 17.0) | 17.0 (17.0 · 17.0) | -0.1 | 0.1 | -1.00 | nicht langsamer |
| steht | CPU-Takt p50 ms | 4.10 (4.20 · 4.00) | 4.15 (4.10 · 4.20) | +0.05 | 0.22 | 0.45 | nicht langsamer |
| steht | CPU-Takt p95 ms | 5.4 (5.6 · 5.3) | 5.4 (5.3 · 5.6) | 0.0 | 0.4 | 0.00 | nicht langsamer |
| steht | CPU-Takt p99 ms | 6.3 (6.6 · 6.0) | 6.7 (6.4 · 6.9) | +0.4 | 0.8 | 0.90 | nicht langsamer |
| steht | GPU-Durchsatz p50 ms | 12.75 (12.90 · 12.60) | 12.70 (12.70 · 12.70) | -0.05 | 0.30 | -0.33 | nicht langsamer |
| steht | k0 p50 ms | 0.23 (0.23 · 0.22) | 0.22 (0.22 · 0.22) | -0.01 | 0.01 | -1.00 | nicht langsamer |
| steht | GPU p95 ms (lauf) | 2.63 (2.62 · 2.63) | 2.58 (2.59 · 2.57) | -0.04 | 0.02 | -4.02 | nicht langsamer |
| steht | GPU je Bild ms (gpu-bank) | 12.59 (12.79 · 12.38) | 12.12 (11.81 · 12.42) | -0.47 | 0.73 | -1.28 | nicht langsamer |
| steht | Belegung p50 ms | 5.46 (5.67 · 5.26) | 5.46 (5.38 · 5.54) | -0.00 | 0.44 | -0.02 | nicht langsamer |
| steht | Belegung p95 ms | 7.29 (7.46 · 7.11) | 7.27 (7.16 · 7.37) | -0.02 | 0.41 | -0.10 | nicht langsamer |
| steht | außer Takt p95 ms | 0.74 (0.77 · 0.72) | 0.75 (0.73 · 0.77) | +0.01 | 0.06 | 0.16 | nicht langsamer |
| steht | Lebenszyklus p95 ms | 0.08 (0.08 · 0.07) | 0.08 (0.08 · 0.08) | +0.00 | 0.01 | 1.00 | nicht langsamer |
| steht | über 33 ms % | – (– · –) | – (– · –) | – | – | – | – |
| steht | KI-Uhr Mittel ms | 0.241 (0.252 · 0.230) | 0.239 (0.238 · 0.240) | -0.002 | 0.022 | -0.20 | nicht langsamer |
| steht | KI-Uhr p95 ms | 0.40 (0.40 · 0.40) | 0.40 (0.40 · 0.40) | 0.00 | 0.00 | – | nicht langsamer |
| steht | KI-Uhr p99 ms | 0.50 (0.50 · 0.50) | 0.50 (0.50 · 0.50) | 0.00 | 0.00 | – | nicht langsamer |
| steht | KI-Takt EWMA ms | 0.45 (0.47 · 0.43) | 0.42 (0.36 · 0.48) | -0.03 | 0.13 | -0.47 | nicht langsamer |
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
