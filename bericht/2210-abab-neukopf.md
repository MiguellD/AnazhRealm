# Bericht 2210 ABAB am neuen Kopf: B b0b2d8ed ist NICHT LANGSAMER als main e3dd2b67, die GT-Fahrt ist schneller

**Aufbau**
- A = n2010-b2a (main e3dd2b6793242ed3acc1a92661d674b839d7ece7), B = n2010-b2b (b0b2d8edf49b69dab985957ac90cd2d710569c74, V18.546.68 = f36ab5a1 + vorrat-pingpong + fahrt-takt + Format). Beide sauber.
- Instrument: die Werkbank aus B. GTX 1060, `--echt`, 1920×1080, Regler voll, Tiere frei; frische Sitzung je Boot, Schloss je Boot.
- Neu: Vorfahrt auch für einen laufenden `Runner.Worker`.
- Folge je Zelle A1 B1 A2 B2 (…A4 B4):
  - **Genesis Third**: stehend + gpu-bank, n = 4.
  - **Wiese Ego**: stehend + gpu-bank + gehend, n = 4.
  - **Dorf −4,−4 Ego**: 8 Uhr, Dorf-Zug an, 2+2, verlängert auf 4+4, weil „außer Takt“ knapp war.
  - **GT-Fahrt Third**: 8–12 m/s, Third ↔ Ego, 2+2.
- Urteil: `auswertung-gehen.cjs`, Δ B − A gegen 2σ gepoolt; „nicht langsamer“, wenn Δ ≤ max(2σ, Auflösung).

## Gemessen (ms; A- und B-Werte je Boot im Roh)

| Zelle | Größe | A | B | Δ | 2σ | Urteil |
|---|---|---|---|---|---|---|
| Genesis Third steht (4+4) | CPU-Takt p95 | 5,9 | 5,7 | −0,2 | 0,3 | nicht langsamer |
|  | GPU je Bild (gpu-bank) | 11,44 | 11,43 | −0,01 | 0,31 | nicht langsamer |
|  | Belegung p95 | 7,45 | 7,31 | −0,15 | 0,22 | nicht langsamer |
| Wiese Ego steht (4+4) | CPU-Takt p95 | 4,1 | 4,1 | 0,0 | 0,3 | nicht langsamer |
|  | GPU je Bild (gpu-bank) | 12,93 (13,57 · 13,29 · 12,94 · 11,92) | 12,38 | −0,55 | 1,03 | nicht langsamer (A trägt die bekannte Zweiteilung der Wiese) |
| Wiese Ego geht (4+4) | CPU-Takt p50 / p95 | 10,85 / 19,1 | 10,60 / 17,8 | −0,25 / **−1,3** | 0,29 / 1,3 | nicht langsamer |
|  | Frame p95 / p99 | 25,1 / 37,5 | 25,1 / 33,4 | 0,0 / −4,1 | 0,0 / 6,7 | nicht langsamer |
| Dorf Ego steht (4+4) | CPU-Takt p95 | 5,3 | 5,3 | 0,0 | 0,2 | nicht langsamer |
|  | CPU-Takt p50 | 3,93 (4,0 · 3,9 · 3,9 · 3,9) | 4,00 (4,0 ×4) | +0,07 | 0,07 | in der Auflösung 0,1 → nicht langsamer |
|  | Belegung p95 / außer Takt p95 | 7,10 / 0,74 | 7,20 / 0,76 | +0,10 / +0,02 | 0,14 / 0,02 | nicht langsamer |
|  | gpu-bank | 12,62 | 12,73 | +0,11 | 0,59 | nicht langsamer |
|  | `--ruhe 300` | ruhig nach 3 s (4/4) | **ruhig nach 3 s (4/4)** | | | das Pingpong ist fort (b9d99b9e: nie ruhig) |
|  | Dreiecke | 421–424k | 421–423k | | | dieselbe Szene |
| GT-Fahrt Third (2+2) | Frame p95 | 41,6 · 33,4 | 33,4 · 33,3 | | | |
|  | CPU-Takt p50 / p95 | 15,8 / 35,0 | 14,3 / **29,9** | −1,5 / **−5,2** | – / ≈ 4,0 | **schneller** |
|  | fps | 46,6 · 49,5 | 51,2 · 52,8 | | | |

- Bei der Fahrt streut die gefahrene Bahn: v50 4,5 / 6,6 gegen 3,0 / 9,7, Anteil 8–12 m/s 0,42–0,53. B ist in beiden Boots schneller.
- Das ist der Geomorph je Nachbar-Seite von fahrt-takt. Gehend an der Wiese zeigt er sich ebenso (CPU-Takt p95 −1,3).
- Am Dorf ist der Bruch von b9d99b9e geheilt (CPU-Takt p95 dort 6,3 → hier 5,3 gleich A, die Welt steht).

## Urteil
- B b0b2d8ed ist an Genesis Third, Wiese Ego (stehend und gehend) und Dorf Ego **nicht langsamer**, die GT-Fahrt ist **schneller**.
- Das Urteil gilt laut Koordinator auch für den Folge-Kopf (reiner CI-Zeit-Commit).
- Zeile in `zug/abab.txt`: `b0b2d8edf49b69dab985957ac90cd2d710569c74 nicht-langsamer 2210-abab-neukopf`.

Roh: OMEN `p3/n2210/neukopf/`, hier `bericht/2210-abab-neukopf/` (`gehen/`, `fahrt/`, `auswertung-*.txt`).

**Status ZWISCHENSTAND + Übergabe:**
- ABAB am neuen Kopf gemessen: nicht langsamer, die Fahrt schneller.
- Als Nächstes die Messschuld GTX an b0b2d8ed (M34, M36, M15, M30), dann die abab-stufe.
