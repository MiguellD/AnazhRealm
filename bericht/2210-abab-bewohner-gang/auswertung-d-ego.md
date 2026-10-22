## d-ego — je Boot

| Boot | Gang | fps | Frame p50 ms | Frame p95 ms | Frame p99 ms | CPU-Takt p50 ms | CPU-Takt p95 ms | CPU-Takt p99 ms | GPU-Durchsatz p50 ms | k0 p50 ms | GPU p95 ms (lauf) | GPU je Bild ms (gpu-bank) | Belegung p50 ms | Belegung p95 ms | außer Takt p95 ms | Lebenszyklus p95 ms | über 33 ms % | KI-Uhr Mittel ms | KI-Uhr p95 ms | KI-Uhr p99 ms | KI-Takt EWMA ms |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| d-ego-A1 | steht | 78.0 | 16.5 | 16.8 | 17.0 | 3.70 | 5.0 | 6.2 | 12.80 | 0.23 | 3.12 | 12.48 | 4.96 | 6.71 | 0.75 | 0.08 | – | 0.211 | 0.40 | 0.50 | 0.28 |
| d-ego-A1 | geht-1 | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – |
| d-ego-A1 | Geher-Ende |  | | | | | | | | | | | | | | | | | | | |
| d-ego-A2 | steht | 78.3 | 16.5 | 16.8 | 17.0 | 3.60 | 5.0 | 6.0 | 12.70 | 0.23 | 3.19 | 12.64 | 4.92 | 6.60 | 0.72 | 0.07 | – | 0.205 | 0.40 | 0.50 | 0.33 |
| d-ego-A2 | geht-1 | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – |
| d-ego-A2 | Geher-Ende |  | | | | | | | | | | | | | | | | | | | |
| d-ego-B1 | steht | 76.9 | 16.6 | 16.8 | 17.1 | 4.00 | 5.3 | 6.7 | 12.90 | 0.20 | 3.24 | 12.41 | 5.31 | 7.03 | 0.75 | 0.08 | – | 0.214 | 0.40 | 0.50 | 0.34 |
| d-ego-B1 | geht-1 | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – |
| d-ego-B1 | Geher-Ende |  | | | | | | | | | | | | | | | | | | | |
| d-ego-B2 | steht | 76.9 | 16.6 | 16.8 | 17.0 | 3.90 | 5.3 | 6.6 | 12.90 | 0.20 | 3.25 | 12.39 | 5.25 | 7.18 | 0.75 | 0.08 | – | 0.203 | 0.30 | 0.50 | 0.35 |
| d-ego-B2 | geht-1 | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – |
| d-ego-B2 | Geher-Ende |  | | | | | | | | | | | | | | | | | | | |

## Tier-Zensus je Boot (zensus-0 nach umstellen · zensus-1 nach geht-1)

- d-ego-A1: vorher 10 (bear 1, deer 6, wolf 3; Würfe≥2 2: deer 6 Spanne 4 m @144.4 m | wolf 3 Spanne 1.6 m @204.1 m; Verband-Feld true, Verbände≥2 2: deer 6 Spanne 4 m | wolf 3 Spanne 1.6 m; Zustand {"-":10})
  nachher –
- d-ego-A2: vorher 10 (bear 1, deer 6, wolf 3; Würfe≥2 2: deer 6 Spanne 3.6 m @143.1 m | wolf 3 Spanne 1.8 m @204.3 m; Verband-Feld true, Verbände≥2 2: deer 6 Spanne 3.6 m | wolf 3 Spanne 1.8 m; Zustand {"-":10})
  nachher –
- d-ego-B1: vorher 10 (bear 1, deer 6, wolf 3; Würfe≥2 2: deer 6 Spanne 3.9 m @144 m | wolf 3 Spanne 1.5 m @203.7 m; Verband-Feld true, Verbände≥2 2: deer 6 Spanne 3.9 m | wolf 3 Spanne 1.5 m; Zustand {"-":10})
  nachher –
- d-ego-B2: vorher 10 (bear 1, deer 6, wolf 3; Würfe≥2 2: deer 6 Spanne 4.2 m @144.5 m | wolf 3 Spanne 1.4 m @203.9 m; Verband-Feld true, Verbände≥2 2: deer 6 Spanne 4.2 m | wolf 3 Spanne 1.4 m; Zustand {"-":10})
  nachher –

## GPU-Takt je Boot (nvidia-smi 1 s, nur P0-Sekunden: Median-MHz · Anteil Drossel (Grund ≠ 0 ohne GpuIdle 0x1) · max °C)

- d-ego-A1: 102 s · 1695 MHz · Drossel 25 % · 86 °C
- d-ego-A2: 99 s · 1708 MHz · Drossel 21 % · 86 °C
- d-ego-B1: 105 s · 1695 MHz · Drossel 21 % · 86 °C
- d-ego-B2: 105 s · 1695 MHz · Drossel 17 % · 86 °C

## Mittel je Seite (A f3865c80 main · B e3dd2b67 integ-probe (Bewohner-Gang + radeon-beweise + wiederkehr); gehend = geht-1 je Boot)

| Gang | Größe | A | B | Δ B − A | 2σ | t (Welch) | Urteil |
|---|---|---|---|---|---|---|---|
| steht | fps | 78.2 (78.0 · 78.3) | 76.9 (76.9 · 76.9) | -1.3 | 0.3 | -8.33 | LANGSAMER |
| steht | Frame p50 ms | 16.5 (16.5 · 16.5) | 16.6 (16.6 · 16.6) | +0.1 | 0.0 | – | nicht langsamer |
| steht | Frame p95 ms | 16.8 (16.8 · 16.8) | 16.8 (16.8 · 16.8) | 0.0 | 0.0 | – | nicht langsamer |
| steht | Frame p99 ms | 17.0 (17.0 · 17.0) | 17.1 (17.1 · 17.0) | +0.1 | 0.1 | 1.00 | nicht langsamer |
| steht | CPU-Takt p50 ms | 3.65 (3.70 · 3.60) | 3.95 (4.00 · 3.90) | +0.30 | 0.14 | 4.24 | LANGSAMER |
| steht | CPU-Takt p95 ms | 5.0 (5.0 · 5.0) | 5.3 (5.3 · 5.3) | +0.3 | 0.0 | – | LANGSAMER |
| steht | CPU-Takt p99 ms | 6.1 (6.2 · 6.0) | 6.7 (6.7 · 6.6) | +0.6 | 0.2 | 4.92 | LANGSAMER |
| steht | GPU-Durchsatz p50 ms | 12.75 (12.80 · 12.70) | 12.90 (12.90 · 12.90) | +0.15 | 0.10 | 3.00 | LANGSAMER |
| steht | k0 p50 ms | 0.23 (0.23 · 0.23) | 0.20 (0.20 · 0.20) | -0.03 | 0.00 | – | nicht langsamer |
| steht | GPU p95 ms (lauf) | 3.16 (3.12 · 3.19) | 3.25 (3.24 · 3.25) | +0.09 | 0.07 | 2.55 | LANGSAMER |
| steht | GPU je Bild ms (gpu-bank) | 12.56 (12.48 · 12.64) | 12.40 (12.41 · 12.39) | -0.16 | 0.16 | -1.98 | nicht langsamer |
| steht | Belegung p50 ms | 4.94 (4.96 · 4.92) | 5.28 (5.31 · 5.25) | +0.34 | 0.07 | 9.43 | LANGSAMER |
| steht | Belegung p95 ms | 6.65 (6.71 · 6.60) | 7.11 (7.03 · 7.18) | +0.45 | 0.19 | 4.84 | LANGSAMER |
| steht | außer Takt p95 ms | 0.73 (0.75 · 0.72) | 0.75 (0.75 · 0.75) | +0.02 | 0.03 | 1.00 | nicht langsamer |
| steht | Lebenszyklus p95 ms | 0.08 (0.08 · 0.07) | 0.08 (0.08 · 0.08) | +0.00 | 0.01 | 1.00 | nicht langsamer |
| steht | über 33 ms % | – (– · –) | – (– · –) | – | – | – | – |
| steht | KI-Uhr Mittel ms | 0.208 (0.211 · 0.205) | 0.208 (0.214 · 0.203) | +0.000 | 0.013 | 0.05 | nicht langsamer |
| steht | KI-Uhr p95 ms | 0.40 (0.40 · 0.40) | 0.35 (0.40 · 0.30) | -0.05 | 0.10 | -1.00 | nicht langsamer |
| steht | KI-Uhr p99 ms | 0.50 (0.50 · 0.50) | 0.50 (0.50 · 0.50) | 0.00 | 0.00 | – | nicht langsamer |
| steht | KI-Takt EWMA ms | 0.31 (0.28 · 0.33) | 0.34 (0.34 · 0.35) | +0.04 | 0.05 | 1.57 | nicht langsamer |
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

**KERN-URTEIL GEHEN d-ego** (steht + geht × fps · Frame p95 · CPU-Takt p95 · GPU je Bild (gpu-bank, nur steht) · Belegung p95; Δ ≤ max(2σ gepoolt, Auflösung)): LANGSAMER an steht fps, steht CPU-Takt p95 ms, steht Belegung p95 ms (5 Größen)
