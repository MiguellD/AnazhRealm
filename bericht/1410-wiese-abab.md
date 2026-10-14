# Bericht 1410 Wiese — ABAB integ-probe c5e2fc8f gegen main 495bf199

**Status: ZWISCHENSTAND.**

**Urteil (OMEN, GTX, Regler voll, Wiese K55 −278/−1038 Blick −z, 2 Boots je Seite im Wechsel, 2σ gepoolt):**
- **Frames:** Im Frame ist B **nicht langsamer**, Ego wie Third. p50 8,4 / 8,4, p95 16,7–16,8 auf beiden Seiten, fps im
  Rauschband (Ego −5,2 bei 2σ 5,2, Third −0,8 bei 2σ 2,3). Befehle, Dreiecke und VRAM sind gleich.
- **GPU:** In der GPU-Zeit liegen 3 von 8 Größen knapp über 2σ, alle in Richtung B, +0,28 bis +0,49 ms (3–5 %):
  - Ego, gpu-bank Gier −0,88: +0,28 (2σ 0,25);
  - Third, gpu-bank Gier 0: +0,38 (2σ 0,09);
  - Third, Band-GPU: +0,49 (2σ 0,27).
  - Gleich bleiben Ego Gier 0 (−0,01), Ego Band (+0,28 bei 2σ 0,31) und Third Gier −0,88 (+0,14 bei 2σ 0,67).
- **Das genannte Risiko trägt es nicht.** Die doppelte Halm-Deckung (K56) ist es nicht, direkt gemessen: In EINER Sitzung
  je Seite, nach 45 s Lauf unter Regler voll, gpu-bank am Third-Blick mit und ohne Nah-Wiese (`state.nahWiese.senken`
  unsichtbar):

  | | mit Gras | ohne Gras | Anteil Gras |
  |---|---|---|---|
  | A main | 8,05 · 8,09 | 7,87 · 7,88 | 0,20 ms |
  | B c5e2fc8f | 8,08 · 8,09 | 7,87 · 7,86 | 0,22 ms |

  - Die Überzeichnung kostet B höchstens +0,02 ms. Die ganze Szene ist in dieser Pose gleich (8,07 gegen 8,09).
  - Ebenso ohne Lauf, am ruhenden Blick: Gras 0,11 / 0,10 ms, gesamt 6,38 / 6,38.
- **Offen:** Der Term der Messfolge (+0,3–0,5 ms nach `lauf voll` + `lauf frei`) ist damit nicht dem Gras zuzuordnen. Die
  direkte Sitzung reproduziert ihn nicht.
  - Kandidat 1, nicht belegt: der Inhalt je Sitzung. Die Spanne des Baum-Inhalts an der Mess-Wiese lag am 11.10. bis
    1,8 ms. Bei 2 Boots je Seite unterschätzt σ das.
  - Kandidat 2: die Folge `lauf frei` (der Regler bewegt Stufen) vor der Bank.
  - Sicherheit gäben 2 weitere Boots je Seite in Third, ca. 20 min. Genesis ist nicht gemessen (nur bei Zeit).

## Je Ort × Sicht (Mittel je Seite, Werte je Boot; `auswertung-w-*.md`)

| Größe | Ego A → B (Δ, 2σ) | Third A → B (Δ, 2σ) |
|---|---|---|
| fps | 100,6 → 95,4 (−5,2, 5,2) | 95,3 → 94,4 (−0,8, 2,3) |
| Frame p50 / p95 ms | 8,4 / 16,7 → 8,4 / 16,8 | 8,4 / 16,8 → 8,4 / 16,8 |
| CPU-Takt p95 voll ms | 5,8 → 6,0 (+0,2, 0,6) | 6,7 → 6,9 (+0,2, 0,6) |
| gpu-bank Gier 0 ms | 7,98 → 7,97 (−0,01, 0,23) | 8,57 → 8,96 (**+0,38, 0,09**) |
| gpu-bank Gier −0,88 ms | 9,04 → 9,32 (**+0,28, 0,25**) | 9,45 → 9,59 (+0,14, 0,67) |
| Band-GPU ms | 9,90 → 10,18 (+0,28, 0,31) | 10,05 → 10,54 (**+0,49, 0,27**) |
| Takt Bank MHz | 1 727 → 1 734 | 1 717 → 1 724 |
| Befehle / Dreiecke / VRAM MB | 75 / 285 753 / 94,8 → 74 / 287 295 / 94,4 | 85 / 323 570 / 96,1 → 85 / 324 256 / 95,8 |

- **Drossel:** 0x0 / 0x1 (GpuIdle) in allen 16 Abfragen, nie Leistung oder Hitze. Seiten-Wache nie rot.
- **Nah-Wiese im Band:** gleich, wie K56 sagt. Ego 4 Befehle, 65 732 → 66 946 Dreiecke; Third 60 452 → 61 392.

## Die Messung

- **Seiten:** `abab-m495` (main 495bf199), `abab-p5e2` (c5e2fc8f).
- **Instrument:** EIN Instrument `abab-i5e2` (omen-messfolge c5e2fc8f) für beide Seiten. Lokal gepatcht ist nur die Wiese
  (Eintrag aus mess-wiese 54c78ff3). Genesis steht in c5e2fc8f schon auf 0/0 (K43-3).
- **Ablauf:** Spielstand vor jedem Boot beiseite, A1 B1 A2 B2 je Sicht, 60 s Pause. Ein Band-Urteil ist kein Neulauf-Grund.
- **Gras-Probe:** `gras.sh` (ruhender Blick) und `gras2.sh` (nach `lauf 45 --regler voll`), je 2 Runden mit und ohne
  Gras.
- **Rohdaten** `bericht/1410-wiese/`: 8 Boot-JSON, Auswertungen, `gras*/`, Skripte.

## Pflicht-OFFEN Rest

- **E (Profi-Band):** An der Wiese hält das Band in Frame, Befehlen, Dreiecken und VRAM. Der CPU-Takt p95 liegt bei
  6,0 / 6,9 > 5,8 auf beiden Seiten, unverändert offen (siehe `1410-uebergabe.md`).

## Status ZWISCHENSTAND + Übergabe

- Kein Code-Commit.
- **Messbäume:** `abab-m495`, `abab-p5e2`, `abab-i5e2` (Wiese lokal gepatcht), Werkzeug `p3/k1410e`.
- Ich ruhe wieder.
