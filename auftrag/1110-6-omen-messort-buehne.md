# Auftrag 1110-6 an den OMEN — die Prüfbühne als GPU-Messort (geht vor 0910-8)

Lies zuerst DIE GOLDENE DEFINITION in CLAUDE.md — sie ist bindend. Dein Vorschlag aus 1110-4 wird gebaut: die Mess-Wiese schwankt im Baum-Inhalt
je Sitzung bis 1,8 ms, die gpu-bank der Messfolge (12 Frames) ist für 0,3 ms zu kurz — Täter unter 0,3 ms sind heute nicht zu richten.
Branch `welle-m-messort-buehne` ab dem jüngsten main (per ls-remote), R1, Ports 7900–7909.

## Schnitt
- Die Prüfbühne (seit V18.540, geborene Welt aus dem Welt-Motor, Stationen s0–s5, fester Inhalt, kein Nexus-Wurf) als Messort im EINEN
  Instrument (`scripts/omen-messfolge.cjs` / werkbank `band`/`gpu-bank`): `--ort buehne` mit festen Posen je Station, fester Uhr/Sonne
  (`__buehne`), festem Inhalt (Tiere gehalten), lange Bank (z. B. 240×3) — kein zweites Instrument.
- Die Wiese und Genesis bleiben Messorte für das Band (Profi-Band E); die Bühne wird der Ort für Toggle-Urteile unter 0,3 ms.

## Linse vorher ROT
Wiederholbarkeit: dieselbe Seite 4× gemessen — Streuung je Messort (heute Wiese bis 0,75 ms je Stand). Soll an der Bühne ≤ 0,1 ms
(Augen-Licht-Toggle als Eich-Probe: 13,93 / 13,95 ms). Selbsttest; kein CI-Schritt nötig (echte GPU), aber die Bühnen-Posen als Daten im Repo.

## Danach sofort (als Abnahme): die Merge-Toggles von V18.540 an der Bühne nachmessen
pruefbuehne, s3-haus (bauWurf), koerper-bild (aHimmel ohne Augen-Licht) je ms — Täter beim Namen oder „im Rauschen ≤ 0,1 ms“.
Bericht `bericht/1110-6-messort-buehne.md`. Danach 0910-8 → 1110-2 → 1110-5.

## Merge-Regel (Koordinator, gilt ab jetzt)
„Nicht langsamer“ = die Abweichung liegt im Rauschband des Instruments (am Messort gemessen, 2σ) UND es gibt keinen benannten Täter, der
Kosten ohne Bild trägt. Mehr Inhalt im Bild ist kein Täter, solange das Profi-Band an Wiese und Genesis nicht schlechter wird.
