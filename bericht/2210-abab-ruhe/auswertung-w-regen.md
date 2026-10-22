## w-regen — je Boot

| Boot | Gang | fps | Frame p50 ms | Frame p95 ms | Frame p99 ms | CPU-Takt p50 ms | CPU-Takt p95 ms | CPU-Takt p99 ms | GPU-Durchsatz p50 ms | k0 p50 ms | GPU p95 ms (lauf) | GPU je Bild ms (gpu-bank) | Belegung p50 ms | Belegung p95 ms | außer Takt p95 ms | Lebenszyklus p95 ms | über 33 ms % | KI-Uhr Mittel ms | KI-Uhr p95 ms | KI-Uhr p99 ms | KI-Takt EWMA ms |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| w-regen-A1 | steht | 74.8 | 16.6 | 16.8 | 17.1 | 3.30 | 4.5 | 5.5 | 13.60 | 0.26 | 2.69 | 12.89 | 4.64 | 6.36 | 0.75 | 0.08 | – | 0.231 | 0.40 | 0.50 | 0.28 |
| w-regen-A1 | geht-1 | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – |
| w-regen-A1 | Geher-Ende |  | | | | | | | | | | | | | | | | | | | |
| w-regen-A2 | steht | 76.0 | 16.6 | 16.8 | 17.1 | 3.00 | 4.2 | 5.4 | 13.20 | 0.26 | 2.68 | 13.80 | 4.22 | 5.90 | 0.71 | 0.08 | – | 0.199 | 0.30 | 0.50 | 0.21 |
| w-regen-A2 | geht-1 | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – |
| w-regen-A2 | Geher-Ende |  | | | | | | | | | | | | | | | | | | | |
| w-regen-B1 | steht | 77.9 | 16.6 | 16.8 | 17.2 | 3.10 | 4.1 | 5.6 | 12.70 | 0.26 | 2.46 | 12.13 | 4.20 | 5.85 | 0.72 | 0.08 | – | 0.204 | 0.30 | 0.50 | 0.27 |
| w-regen-B1 | geht-1 | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – |
| w-regen-B1 | Geher-Ende |  | | | | | | | | | | | | | | | | | | | |
| w-regen-B2 | steht | 78.2 | 16.6 | 16.8 | 17.1 | 3.10 | 4.8 | 6.5 | 12.70 | 0.61 | 2.65 | 11.82 | 4.27 | 6.59 | 0.80 | 0.08 | – | 0.209 | 0.40 | 0.50 | 0.21 |
| w-regen-B2 | geht-1 | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – |
| w-regen-B2 | Geher-Ende |  | | | | | | | | | | | | | | | | | | | |

## Tier-Zensus je Boot (zensus-0 nach umstellen · zensus-1 nach geht-1)

- w-regen-A1: vorher 10 (fox 4, deer 4, bear 2; Würfe≥2 1: deer 4 Spanne 2.6 m @149.6 m; Verband-Feld true, Verbände≥2 1: deer 4 Spanne 2.6 m; Zustand {"-":10})
  nachher 10 (fox 4, deer 4, bear 2; Würfe≥2 1: deer 4 Spanne 3 m @146.2 m; Verband-Feld true, Verbände≥2 1: deer 4 Spanne 3 m; Zustand {"-":10})
- w-regen-A2: vorher 9 (fox 3, deer 4, bear 2; Würfe≥2 1: deer 4 Spanne 2.5 m @149.6 m; Verband-Feld true, Verbände≥2 1: deer 4 Spanne 2.5 m; Zustand {"-":9})
  nachher 9 (fox 3, deer 4, bear 2; Würfe≥2 1: deer 4 Spanne 3.1 m @146.3 m; Verband-Feld true, Verbände≥2 1: deer 4 Spanne 3.1 m; Zustand {"-":9})
- w-regen-B1: vorher 9 (fox 3, deer 4, bear 2; Würfe≥2 1: deer 4 Spanne 2.6 m @149.7 m; Verband-Feld true, Verbände≥2 1: deer 4 Spanne 2.6 m; Zustand {"-":9})
  nachher 9 (fox 3, deer 4, bear 2; Würfe≥2 1: deer 4 Spanne 2.8 m @146.2 m; Verband-Feld true, Verbände≥2 1: deer 4 Spanne 2.8 m; Zustand {"-":9})
- w-regen-B2: vorher 9 (fox 3, deer 4, bear 2; Würfe≥2 1: deer 4 Spanne 2.5 m @149.5 m; Verband-Feld true, Verbände≥2 1: deer 4 Spanne 2.5 m; Zustand {"-":9})
  nachher 9 (fox 3, deer 4, bear 2; Würfe≥2 1: deer 4 Spanne 3.1 m @146.3 m; Verband-Feld true, Verbände≥2 1: deer 4 Spanne 3.1 m; Zustand {"-":9})

## GPU-Takt je Boot (nvidia-smi 1 s, nur P0-Sekunden: Median-MHz · Anteil Drossel (Grund ≠ 0 ohne GpuIdle 0x1) · max °C)

- w-regen-A1: 101 s · 1721 MHz · Drossel 32 % · 86 °C
- w-regen-A2: 102 s · 1721 MHz · Drossel 28 % · 86 °C
- w-regen-B1: 100 s · 1721 MHz · Drossel 30 % · 86 °C
- w-regen-B2: 82 s · 1721 MHz · Drossel 34 % · 85 °C

## Mittel je Seite (A e5003509 main · B c0151abb integ-probe (naesse-kosten + welt-ruhe + ci-deckung + CI-Zeiten); gehend = geht-1 je Boot)

| Gang | Größe | A | B | Δ B − A | 2σ | t (Welch) | Urteil |
|---|---|---|---|---|---|---|---|
| steht | fps | 75.4 (74.8 · 76.0) | 78.1 (77.9 · 78.2) | +2.7 | 1.2 | 4.28 | nicht langsamer |
| steht | Frame p50 ms | 16.6 (16.6 · 16.6) | 16.6 (16.6 · 16.6) | 0.0 | 0.0 | – | nicht langsamer |
| steht | Frame p95 ms | 16.8 (16.8 · 16.8) | 16.8 (16.8 · 16.8) | 0.0 | 0.0 | – | nicht langsamer |
| steht | Frame p99 ms | 17.1 (17.1 · 17.1) | 17.1 (17.2 · 17.1) | +0.0 | 0.1 | 1.00 | nicht langsamer |
| steht | CPU-Takt p50 ms | 3.15 (3.30 · 3.00) | 3.10 (3.10 · 3.10) | -0.05 | 0.30 | -0.33 | nicht langsamer |
| steht | CPU-Takt p95 ms | 4.3 (4.5 · 4.2) | 4.4 (4.1 · 4.8) | +0.1 | 0.8 | 0.26 | nicht langsamer |
| steht | CPU-Takt p99 ms | 5.5 (5.5 · 5.4) | 6.0 (5.6 · 6.5) | +0.6 | 0.9 | 1.33 | nicht langsamer |
| steht | GPU-Durchsatz p50 ms | 13.40 (13.60 · 13.20) | 12.70 (12.70 · 12.70) | -0.70 | 0.40 | -3.50 | nicht langsamer |
| steht | k0 p50 ms | 0.26 (0.26 · 0.26) | 0.43 (0.26 · 0.61) | +0.17 | 0.35 | 1.00 | nicht langsamer |
| steht | GPU p95 ms (lauf) | 2.69 (2.69 · 2.68) | 2.55 (2.46 · 2.65) | -0.13 | 0.19 | -1.37 | nicht langsamer |
| steht | GPU je Bild ms (gpu-bank) | 13.35 (12.89 · 13.80) | 11.98 (12.13 · 11.82) | -1.37 | 0.96 | -2.85 | nicht langsamer |
| steht | Belegung p50 ms | 4.43 (4.64 · 4.22) | 4.23 (4.20 · 4.27) | -0.20 | 0.43 | -0.92 | nicht langsamer |
| steht | Belegung p95 ms | 6.13 (6.36 · 5.90) | 6.22 (5.85 · 6.59) | +0.09 | 0.87 | 0.21 | nicht langsamer |
| steht | außer Takt p95 ms | 0.73 (0.75 · 0.71) | 0.76 (0.72 · 0.80) | +0.03 | 0.09 | 0.67 | nicht langsamer |
| steht | Lebenszyklus p95 ms | 0.08 (0.08 · 0.08) | 0.08 (0.08 · 0.08) | 0.00 | 0.00 | – | nicht langsamer |
| steht | über 33 ms % | – (– · –) | – (– · –) | – | – | – | – |
| steht | KI-Uhr Mittel ms | 0.215 (0.231 · 0.199) | 0.207 (0.204 · 0.209) | -0.008 | 0.033 | -0.51 | nicht langsamer |
| steht | KI-Uhr p95 ms | 0.35 (0.40 · 0.30) | 0.35 (0.30 · 0.40) | 0.00 | 0.14 | 0.00 | nicht langsamer |
| steht | KI-Uhr p99 ms | 0.50 (0.50 · 0.50) | 0.50 (0.50 · 0.50) | 0.00 | 0.00 | – | nicht langsamer |
| steht | KI-Takt EWMA ms | 0.24 (0.28 · 0.21) | 0.24 (0.27 · 0.21) | -0.01 | 0.09 | -0.11 | nicht langsamer |
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

**KERN-URTEIL GEHEN w-regen** (steht + geht × fps · Frame p95 · CPU-Takt p95 · GPU je Bild (gpu-bank, nur steht) · Belegung p95; Δ ≤ max(2σ gepoolt, Auflösung)): nicht langsamer (5 Größen)
