## d-ego — je Boot

| Boot | Gang | fps | Frame p50 ms | Frame p95 ms | Frame p99 ms | CPU-Takt p50 ms | CPU-Takt p95 ms | CPU-Takt p99 ms | GPU-Durchsatz p50 ms | k0 p50 ms | GPU p95 ms (lauf) | GPU je Bild ms (gpu-bank) | Belegung p50 ms | Belegung p95 ms | außer Takt p95 ms | Lebenszyklus p95 ms | über 33 ms % | KI-Uhr Mittel ms | KI-Uhr p95 ms | KI-Uhr p99 ms | KI-Takt EWMA ms |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| d-ego-A1 | steht | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – |
| d-ego-A1 | geht-1 | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – |
| d-ego-A1 | Geher-Ende |  | | | | | | | | | | | | | | | | | | | |
| d-ego-A2 | steht | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – |
| d-ego-A2 | geht-1 | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – |
| d-ego-A2 | Geher-Ende |  | | | | | | | | | | | | | | | | | | | |
| d-ego-B1 | steht | 77.6 | 16.5 | 16.8 | 17.0 | 4.10 | 5.7 | 6.9 | 12.80 | 0.22 | 2.65 | 12.23 | 5.62 | 7.55 | 0.76 | 0.08 | – | 0.174 | 0.30 | 0.40 | 0.35 |
| d-ego-B1 | geht-1 | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – |
| d-ego-B1 | Geher-Ende |  | | | | | | | | | | | | | | | | | | | |
| d-ego-B2 | steht | 77.9 | 16.5 | 16.7 | 16.9 | 4.30 | 5.6 | 6.9 | 12.70 | 0.22 | 2.67 | 12.19 | 5.70 | 7.67 | 0.77 | 0.08 | – | 0.195 | 0.30 | 0.40 | 0.39 |
| d-ego-B2 | geht-1 | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – |
| d-ego-B2 | Geher-Ende |  | | | | | | | | | | | | | | | | | | | |

## Tier-Zensus je Boot (zensus-0 nach umstellen · zensus-1 nach geht-1)

- d-ego-A1: vorher –
  nachher –
- d-ego-A2: vorher –
  nachher –
- d-ego-B1: vorher 5 (deer 5; Würfe≥2 1: deer 5 Spanne 2.9 m @186.1 m; Verband-Feld true, Verbände≥2 1: deer 5 Spanne 2.9 m; Zustand {"-":5})
  nachher –
- d-ego-B2: vorher 5 (deer 5; Würfe≥2 1: deer 5 Spanne 3 m @186 m; Verband-Feld true, Verbände≥2 1: deer 5 Spanne 3 m; Zustand {"-":5})
  nachher –

## GPU-Takt je Boot (nvidia-smi 1 s, nur P0-Sekunden: Median-MHz · Anteil Drossel (Grund ≠ 0 ohne GpuIdle 0x1) · max °C)

- d-ego-A1: 591 s · 1746 MHz · Drossel 32 % · 87 °C
- d-ego-A2: 590 s · 1759 MHz · Drossel 32 % · 88 °C
- d-ego-B1: 118 s · 1404 MHz · Drossel 20 % · 86 °C
- d-ego-B2: 113 s · 1404 MHz · Drossel 26 % · 87 °C

## Mittel je Seite (A f7dd313c · B a2b28770; gehend = geht-1 je Boot)

| Gang | Größe | A | B | Δ B − A | 2σ | t (Welch) | Urteil |
|---|---|---|---|---|---|---|---|
| steht | fps | – (– · –) | 77.8 (77.6 · 77.9) | – | – | – | – |
| steht | Frame p50 ms | – (– · –) | 16.5 (16.5 · 16.5) | – | – | – | – |
| steht | Frame p95 ms | – (– · –) | 16.8 (16.8 · 16.7) | – | – | – | – |
| steht | Frame p99 ms | – (– · –) | 16.9 (17.0 · 16.9) | – | – | – | – |
| steht | CPU-Takt p50 ms | – (– · –) | 4.20 (4.10 · 4.30) | – | – | – | – |
| steht | CPU-Takt p95 ms | – (– · –) | 5.7 (5.7 · 5.6) | – | – | – | – |
| steht | CPU-Takt p99 ms | – (– · –) | 6.9 (6.9 · 6.9) | – | – | – | – |
| steht | GPU-Durchsatz p50 ms | – (– · –) | 12.75 (12.80 · 12.70) | – | – | – | – |
| steht | k0 p50 ms | – (– · –) | 0.22 (0.22 · 0.22) | – | – | – | – |
| steht | GPU p95 ms (lauf) | – (– · –) | 2.66 (2.65 · 2.67) | – | – | – | – |
| steht | GPU je Bild ms (gpu-bank) | – (– · –) | 12.21 (12.23 · 12.19) | – | – | – | – |
| steht | Belegung p50 ms | – (– · –) | 5.66 (5.62 · 5.70) | – | – | – | – |
| steht | Belegung p95 ms | – (– · –) | 7.61 (7.55 · 7.67) | – | – | – | – |
| steht | außer Takt p95 ms | – (– · –) | 0.77 (0.76 · 0.77) | – | – | – | – |
| steht | Lebenszyklus p95 ms | – (– · –) | 0.08 (0.08 · 0.08) | – | – | – | – |
| steht | über 33 ms % | – (– · –) | – (– · –) | – | – | – | – |
| steht | KI-Uhr Mittel ms | – (– · –) | 0.184 (0.174 · 0.195) | – | – | – | – |
| steht | KI-Uhr p95 ms | – (– · –) | 0.30 (0.30 · 0.30) | – | – | – | – |
| steht | KI-Uhr p99 ms | – (– · –) | 0.40 (0.40 · 0.40) | – | – | – | – |
| steht | KI-Takt EWMA ms | – (– · –) | 0.37 (0.35 · 0.39) | – | – | – | – |
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

**KERN-URTEIL GEHEN d-ego** (steht + geht × fps · Frame p95 · CPU-Takt p95 · GPU je Bild (gpu-bank, nur steht) · Belegung p95; Δ ≤ max(2σ gepoolt, Auflösung)): nicht langsamer (0 Größen)
