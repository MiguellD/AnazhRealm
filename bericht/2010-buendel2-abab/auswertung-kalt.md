## Kalt je Lauf (`diag-boot-stage --kalt --echt`, Roh kalt/<A|B><n>.{json,log,png,-smi.csv})

| Lauf | Version | t(Weltbild) s | t(Leib) | t(Boden) | t(licht) | letzter offener Term | Brunnen beim Bild (gebaut/alle) | Erst-Bau beim Bild (Bauten · ms · Pipelines) | halbes Weltbild |
|---|---|---|---|---|---|---|---|---|---|
| A1 | 18.546.26 | 16.97 | 7.08 | 13.18 | nie offen | streu | 1/1 | 58 · 3459 · 4 | 0 |
| B1 | 18.546.32 | 15.99 | 5.01 | 12.88 | 5.48 | streu | 1/1 | 49 · 2499 · 3 | 0 |
| A2 | 18.546.26 | 16.14 | 9.70 | 13.32 | nie offen | streu | 1/1 | 54 · 3557 · 2 | 0 |
| B2 | 18.546.32 | 15.14 | 5.66 | 13.27 | 5.66 | streu | 1/1 | 46 · 2583 · 2 | 0 |
| A3 | 18.546.26 | 15.61 | 6.12 | 12.70 | nie offen | (keiner) | 1/1 | 58 · 3657 · 3 | 0 |
| B3 | 18.546.32 | 15.11 | 4.77 | 13.16 | 6.02 | bauten+streu | 1/1 | 48 · 2531 · 4 | 0 |
| A4 | 18.546.26 | 16.03 | 5.42 | 11.60 | nie offen | streu | 1/1 | 55 · 3442 · 2 | 0 |
| B4 | 18.546.32 | 15.52 | 4.89 | 12.86 | 5.34 | bauten+streu+karten | 1/1 | 49 · 2511 · 4 | 0 |

| Größe (Median, Spanne) | A dc6702ab | B 8ba1510d | Δ B − A |
|---|---|---|---|
| t(Weltbild) s | 16.08 (15.61–16.97) | 15.33 (15.11–15.99) | -0.75 |
| t(Leib) s | 6.60 (5.42–9.70) | 4.95 (4.77–5.66) | -1.65 |
| t(Boden) s | 12.94 (11.60–13.32) | 13.02 (12.86–13.27) | +0.09 |

**Urteil KALT:** Median B − A = -0.75 s → B hält (≤ +0,1 s).
Läufe mit gebautem Brunnen beim ersten Bild: A1, B1, A2, B2, A3, B3, A4, B4. Wartet B auf „licht“: B1 bis 5.48 s, B2 bis 5.66 s, B3 bis 6.02 s, B4 bis 5.34 s.
