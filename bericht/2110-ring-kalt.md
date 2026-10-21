# Bericht 2110 Ring-Heilung kalt auf der GTX: A integ bbc97d8b (V18.546.39, ohne Heilung) gegen B integ 57a9f2ab (V18.546.40, mit Ring-Heilung f871462b), 21.10.

**Urteil: nicht langsamer.** t(Weltbild) Median 15,57 → 15,45 s (−0,12 s; A 15,46 · 15,68, B 15,77 · 15,13), damit unter der Schwelle +0,1 s.
- Gefahren als 2+2 verschränkt (A1 B1 A2 B2) statt 1+1, weil ein einzelner Kalt-Lauf hier ±0,5 s streut.
- Halbes Weltbild in keinem Lauf, Brunnen beim ersten Bild gebaut in 4/4.
- t(Boden) gleich im Median (13,24 ↔ 13,27), aber an B weiter gestreut (B1 15,31, B2 11,24). Das passt dazu, dass die Ringhälfte außer Blick jetzt mitläuft.
- t(Leib) B1 8,60 ist ein Ausreißer; B2 liegt bei 5,07, A bei 5,48–5,78.
- Letzter offener Term vor dem Bild: an B bauten+streu+karten (beide Läufe). An A war in der letzten Probe vor dem Bild kein Term mehr offen, das Bild wartete dort nur noch auf seine Ruhe.

## Weg
- `diag-boot-stage --kalt --echt` aus dem Baum der Seite (n2010-b2a = bbc97d8b, n2010-b2b = 57a9f2ab), Port 7903, frisches Profil je Lauf.
- Beide Seiten mit demselben Stations-Patch (`kalt-patch.cjs`, sha 6f4ba725: Term-Namen + Brunnen je Probe), danach `git checkout`, Status 0.
- Gestartet nach dem echt-Job 39529740393 an 57a9f2ab (Schloss bis ~04:08, dann 180 s CI-Ruhe), 30 s Pause zwischen den Läufen.
- Roh: OMEN `p3/n2110/ringkalt/kalt/<A|B><n>.{json,log,png,-smi.csv}`, Tafel `kalt/auswertung-kalt.md` (Kopie hier unten).

Status ZWISCHENSTAND: nur gemessen.

## Kalt je Lauf (`diag-boot-stage --kalt --echt`, Roh kalt/<A|B><n>.{json,log,png,-smi.csv})

| Lauf | Version | t(Weltbild) s | t(Leib) | t(Boden) | t(licht) | letzter offener Term | Brunnen beim Bild (gebaut/alle) | Erst-Bau beim Bild (Bauten · ms · Pipelines) | halbes Weltbild |
|---|---|---|---|---|---|---|---|---|---|
| A1 | 18.546.39 | 15.46 | 5.48 | 13.69 | 5.48 | (keiner) | 1/1 | 47 · 2326 · 2 | 0 |
| B1 | 18.546.40 | 15.77 | 8.60 | 15.31 | 5.63 | bauten+streu+karten | 1/1 | 45 · 2383 · 1 | 0 |
| A2 | 18.546.39 | 15.68 | 5.78 | 12.79 | 5.78 | (keiner) | 1/1 | 48 · 2503 · 2 | 0 |
| B2 | 18.546.40 | 15.13 | 5.07 | 11.24 | 6.54 | bauten+streu+karten | 1/1 | 48 · 2407 · 2 | 0 |

| Größe (Median, Spanne) | A bbc97d8b | B 57a9f2ab | Δ B − A |
|---|---|---|---|
| t(Weltbild) s | 15.57 (15.46–15.68) | 15.45 (15.13–15.77) | -0.12 |
| t(Leib) s | 5.63 (5.48–5.78) | 6.84 (5.07–8.60) | +1.20 |
| t(Boden) s | 13.24 (12.79–13.69) | 13.27 (11.24–15.31) | +0.04 |

**Urteil KALT:** Median B − A = -0.12 s → B hält (≤ +0,1 s).
Läufe mit gebautem Brunnen beim ersten Bild: A1, B1, A2, B2. Wartet B auf „licht“: B1 bis 5.63 s, B2 bis 6.54 s.
