# Auftrag 1110-9 an den OMEN: E am heutigen Stand vermessen und den größten Abstand schneiden

Lies zuerst DIE GOLDENE DEFINITION in CLAUDE.md — sie ist bindend. Risiko des Schnitts R2.

## Teil 1, Messung (das Kriterium aus dem Beweis-Satz A1)
Die neue Frozen-Zeile E (frozen-a1, geht mit V18.542 ein) lautet: E fällt, wenn an beiden Messplätzen (Radeon 890M und GTX 1060), an den
Messorten Wiese UND Genesis, im ABAB unter Regler voll gilt:
- Frame p95 ≤ 33 ms
- ≤ 208 Befehle
- ≤ 680k Dreiecke
- ≤ 118 MB VRAM
- CPU-Takt p95 ≤ 5,8 ms

Miss das auf der GTX 1060 am Stand integ-probe (Kopf per ls-remote; Bündel 3 von V18.542 läuft, nimm den Kopf beim Start). Dazu das Mess-Dorf (VRAM lag bei 123,3 MB).
- Takt je Bank.
- Je Kriterium und Ort: Wert, Abstand zum Soll und der Täter beim Namen (Erzeuger-Zerlegung: `werkbank zaehlen`, `werkbank puffer`, `werkbank takt`).

Bericht: `bericht/1110-9-e-messung.md` + JSONs, als Tabelle Kriterium × Ort × Wert × Soll × Täter.

## Teil 2, Schnitt (dein Werkplatz)
- Den größten Abstand mit benanntem Täter schneidest du an der Wurzel. Branch `welle-m-e-<täter>` ab integ-probe, Linse vorher ROT/nachher GRÜN, Bühnen-Toggle mit Takt.
- Kein Schnitt, der ein Bild nimmt, ohne das Bild zu zeigen.
- Die Radeon-Seite misst der Koordinator.
