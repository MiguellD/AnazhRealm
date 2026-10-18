# Auftrag 18.10. 10:30 (Koordinator) — OMEN: Ego-Schatten auf der GTX beim Namen (VOR B5, kurz)

Lies zuerst DIE GOLDENE DEFINITION in CLAUDE.md — sie ist bindend.

Befund: echt an integ-probe 4d5f1c0c ROT (Lauf 39102311056, Schritt `gate:ego-schatten`): Ego `{"wurf":0,"leibPx":1071,"leibAufNull":0}`
gegen 3rd 762 px — der Leib wirft in der Ego-Sicht nicht, und das Auge sieht ihn, obwohl kein Leib-Mesh auf Ebene 0 liegt. An 9b3acc1d
grün. Auf der Radeon an BEIDEN Ständen grün (2×2, Ego-Wurf 753–759 px). Die GTX-Spur: dort ist der Leib erst nach 8 s bereit (Radeon 3–4 s);
das Bild passt zu einem Leib-Bündel, das im Ego-Schuss die ALTE Aufnahme abspielt. B4 änderte die Freigabe-Reihenfolge (`_foundryWahl`,
nah zuerst) — Verdacht: die Mensch-Stufe kommt auf der GTX später und das Bündel nimmt nach ihrer Ankunft nicht neu auf.

1. Am Mess-Klon auf 4d5f1c0c: `node auftrag/1810-ego-probe/mach-probe.cjs <repo>` (schreibt scripts/_probe-ego-schatten.cjs,
   unversioniert), dann mit Schloss `PROBE_AUS=<datei.json> LINSE_GPU=karte node scripts/_probe-ego-schatten.cjs` zweimal.
   Steht beim Schuss `kopf-e1-ego-wurf` `neu 0` mit 8 Render-Objekten, bleibt die Neuaufnahme aus — bewiesen.
2. Dasselbe an 9b3acc1d (grün erwartet). Den Neulauf des echt-Jobs (rerun 39102311056) fahre ich parallel.
3. Ist die Neuaufnahme der Täter: Schnitt an der Wurzel auf Zweig `ego-buendel` ab 4d5f1c0c (wer muss das Leib-Bündel bei Ankunft
   einer Mensch-Stufe neu aufnehmen lassen — `_leibBuendelStand` / Textur-Abschied / Stufen-Wechsel), gate:ego-schatten mit
   LINSE_GPU=karte vorher ROT → nachher GRÜN auf der GTX, check, playtest:fast, voller Playtest, gate:kamera-treue, push [ci voll].
   Ist es die Linse (Bereitschaft vor dem Ego-Schuss): Schnitt in diag-ego-schatten.cjs, netto ≤ 0.
Bericht `bericht/1810-ego-gtx.md`, dann weiter mit B5.
