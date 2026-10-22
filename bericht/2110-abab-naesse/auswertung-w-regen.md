## w-regen — je Boot

| Boot | Gang | fps | Frame p50 ms | Frame p95 ms | Frame p99 ms | CPU-Takt p50 ms | CPU-Takt p95 ms | CPU-Takt p99 ms | GPU-Durchsatz p50 ms | k0 p50 ms | GPU p95 ms (lauf) | GPU je Bild ms (gpu-bank) | Belegung p50 ms | Belegung p95 ms | außer Takt p95 ms | Lebenszyklus p95 ms | über 33 ms % | KI-Uhr Mittel ms | KI-Uhr p95 ms | KI-Uhr p99 ms | KI-Takt EWMA ms |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| w-regen-A1 | steht | 79.9 | 8.7 | 16.8 | 17.0 | 3.20 | 4.2 | 5.3 | 12.40 | 0.26 | 2.68 | 11.77 | 4.24 | 5.97 | 0.72 | 0.08 | – | 0.223 | 0.40 | 0.50 | 0.24 |
| w-regen-A1 | geht-1 | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – |
| w-regen-A1 | Geher-Ende |  | | | | | | | | | | | | | | | | | | | |
| w-regen-A2 | steht | 79.7 | 8.8 | 16.8 | 17.0 | 3.20 | 4.3 | 5.3 | 12.40 | 0.26 | 2.56 | 11.80 | 4.32 | 5.98 | 0.71 | 0.08 | – | 0.235 | 0.40 | 0.50 | 0.28 |
| w-regen-A2 | geht-1 | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – |
| w-regen-A2 | Geher-Ende |  | | | | | | | | | | | | | | | | | | | |
| w-regen-B1 | steht | 74.3 | 16.6 | 16.8 | 17.0 | 3.20 | 4.4 | 5.4 | 13.80 | 0.62 | 2.66 | 14.46 | 4.58 | 6.15 | 0.74 | 0.08 | – | 0.229 | 0.40 | 0.50 | 0.29 |
| w-regen-B1 | geht-1 | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – |
| w-regen-B1 | Geher-Ende |  | | | | | | | | | | | | | | | | | | | |
| w-regen-B2 | steht | 75.7 | 16.6 | 16.8 | 17.0 | 3.20 | 4.4 | 5.3 | 13.40 | 0.26 | 2.58 | 12.40 | 4.51 | 6.04 | 0.72 | 0.08 | – | 0.216 | 0.40 | 0.50 | 0.30 |
| w-regen-B2 | geht-1 | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – |
| w-regen-B2 | Geher-Ende |  | | | | | | | | | | | | | | | | | | | |

## Tier-Zensus je Boot (zensus-0 nach umstellen · zensus-1 nach geht-1)

- w-regen-A1: vorher 9 (fox 3, deer 4, bear 2; Würfe≥2 1: deer 4 Spanne 2.3 m @149.3 m; Verband-Feld true, Verbände≥2 1: deer 4 Spanne 2.3 m; Zustand {"-":9})
  nachher 9 (fox 3, deer 4, bear 2; Würfe≥2 1: deer 4 Spanne 2.9 m @146 m; Verband-Feld true, Verbände≥2 1: deer 4 Spanne 2.9 m; Zustand {"-":9})
- w-regen-A2: vorher 10 (fox 4, deer 4, bear 2; Würfe≥2 1: deer 4 Spanne 2 m @149.8 m; Verband-Feld true, Verbände≥2 1: deer 4 Spanne 2 m; Zustand {"-":10})
  nachher 10 (fox 4, deer 4, bear 2; Würfe≥2 1: deer 4 Spanne 3.1 m @146.4 m; Verband-Feld true, Verbände≥2 1: deer 4 Spanne 3.1 m; Zustand {"-":10})
- w-regen-B1: vorher 10 (fox 4, deer 4, bear 2; Würfe≥2 1: deer 4 Spanne 2.4 m @149.7 m; Verband-Feld true, Verbände≥2 1: deer 4 Spanne 2.4 m; Zustand {"-":10})
  nachher 10 (fox 4, deer 4, bear 2; Würfe≥2 1: deer 4 Spanne 2.9 m @146.4 m; Verband-Feld true, Verbände≥2 1: deer 4 Spanne 2.9 m; Zustand {"-":10})
- w-regen-B2: vorher 9 (fox 3, deer 4, bear 2; Würfe≥2 1: deer 4 Spanne 2.5 m @149.2 m; Verband-Feld true, Verbände≥2 1: deer 4 Spanne 2.5 m; Zustand {"-":9})
  nachher 9 (fox 3, deer 4, bear 2; Würfe≥2 1: deer 4 Spanne 2.9 m @145.9 m; Verband-Feld true, Verbände≥2 1: deer 4 Spanne 2.9 m; Zustand {"-":9})

## GPU-Takt je Boot (nvidia-smi 1 s, nur P0-Sekunden: Median-MHz · Anteil Drossel (Grund ≠ 0 ohne GpuIdle 0x1) · max °C)

- w-regen-A1: 105 s · 1695 MHz · Drossel 29 % · 86 °C
- w-regen-A2: 101 s · 1708 MHz · Drossel 28 % · 86 °C
- w-regen-B1: 90 s · 1721 MHz · Drossel 31 % · 86 °C
- w-regen-B2: 103 s · 1721 MHz · Drossel 27 % · 87 °C

## Mittel je Seite (A b9537781 main · B 7670a4a1 integ-probe (bauen-k1 + naesse); gehend = geht-1 je Boot)

| Gang | Größe | A | B | Δ B − A | 2σ | t (Welch) | Urteil |
|---|---|---|---|---|---|---|---|
| steht | fps | 79.8 (79.9 · 79.7) | 75.0 (74.3 · 75.7) | -4.8 | 1.4 | -6.79 | LANGSAMER |
| steht | Frame p50 ms | 8.8 (8.7 · 8.8) | 16.6 (16.6 · 16.6) | +7.9 | 0.1 | 157.00 | LANGSAMER |
| steht | Frame p95 ms | 16.8 (16.8 · 16.8) | 16.8 (16.8 · 16.8) | 0.0 | 0.0 | – | nicht langsamer |
| steht | Frame p99 ms | 17.0 (17.0 · 17.0) | 17.0 (17.0 · 17.0) | 0.0 | 0.0 | – | nicht langsamer |
| steht | CPU-Takt p50 ms | 3.20 (3.20 · 3.20) | 3.20 (3.20 · 3.20) | 0.00 | 0.00 | – | nicht langsamer |
| steht | CPU-Takt p95 ms | 4.3 (4.2 · 4.3) | 4.4 (4.4 · 4.4) | +0.2 | 0.1 | 3.00 | LANGSAMER |
| steht | CPU-Takt p99 ms | 5.3 (5.3 · 5.3) | 5.3 (5.4 · 5.3) | +0.0 | 0.1 | 1.00 | nicht langsamer |
| steht | GPU-Durchsatz p50 ms | 12.40 (12.40 · 12.40) | 13.60 (13.80 · 13.40) | +1.20 | 0.40 | 6.00 | LANGSAMER |
| steht | k0 p50 ms | 0.26 (0.26 · 0.26) | 0.44 (0.62 · 0.26) | +0.18 | 0.36 | 1.00 | nicht langsamer |
| steht | GPU p95 ms (lauf) | 2.62 (2.68 · 2.56) | 2.62 (2.66 · 2.58) | 0.00 | 0.14 | 0.00 | nicht langsamer |
| steht | GPU je Bild ms (gpu-bank) | 11.79 (11.77 · 11.80) | 13.43 (14.46 · 12.40) | +1.64 | 2.06 | 1.60 | nicht langsamer |
| steht | Belegung p50 ms | 4.28 (4.24 · 4.32) | 4.54 (4.58 · 4.51) | +0.26 | 0.11 | 4.99 | LANGSAMER |
| steht | Belegung p95 ms | 5.97 (5.97 · 5.98) | 6.10 (6.15 · 6.04) | +0.12 | 0.11 | 2.17 | LANGSAMER |
| steht | außer Takt p95 ms | 0.71 (0.72 · 0.71) | 0.73 (0.74 · 0.72) | +0.02 | 0.02 | 1.34 | nicht langsamer |
| steht | Lebenszyklus p95 ms | 0.08 (0.08 · 0.08) | 0.08 (0.08 · 0.08) | 0.00 | 0.00 | – | nicht langsamer |
| steht | über 33 ms % | – (– · –) | – (– · –) | – | – | – | – |
| steht | KI-Uhr Mittel ms | 0.229 (0.223 · 0.235) | 0.223 (0.229 · 0.216) | -0.006 | 0.018 | -0.69 | nicht langsamer |
| steht | KI-Uhr p95 ms | 0.40 (0.40 · 0.40) | 0.40 (0.40 · 0.40) | 0.00 | 0.00 | – | nicht langsamer |
| steht | KI-Uhr p99 ms | 0.50 (0.50 · 0.50) | 0.50 (0.50 · 0.50) | 0.00 | 0.00 | – | nicht langsamer |
| steht | KI-Takt EWMA ms | 0.26 (0.24 · 0.28) | 0.29 (0.29 · 0.30) | +0.03 | 0.04 | 1.70 | nicht langsamer |
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

**KERN-URTEIL GEHEN w-regen** (steht + geht × fps · Frame p95 · CPU-Takt p95 · GPU je Bild (gpu-bank, nur steht) · Belegung p95; Δ ≤ max(2σ gepoolt, Auflösung)): LANGSAMER an steht fps, steht CPU-Takt p95 ms, steht Belegung p95 ms (5 Größen)
