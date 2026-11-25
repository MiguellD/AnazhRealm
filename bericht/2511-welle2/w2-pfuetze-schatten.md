Lies zuerst DIE GOLDENE DEFINITION in CLAUDE.md — sie ist bindend. Arbeite als `champion` (IPERKA).

SPROSSE: `karte2.planet.kopplung.stadtklima#1` — ZWEIG `w2-pfuetze-schatten` (eigener Zweig von origin/main 804ca10c oder jünger).
ROTE ZEILE planet.kopplung.stadtklima#1 (Soll: „Wind folgt der Gasse ±20°; Pfütze trocknet im Schatten später“), GTX 1060 · Kopf e1a54023 · 2026-11-25 15:29 UTC, wörtlich: „S1 abweichungGrad 1,976 ° gegen Soll ≤ 20 ° ✓ · der Zeuge der Welt fehlt: die Pfütze trocknet im Schatten nicht später (Trocken-Zeit Schatten ÷ Sonne 0) · Täter: stamm/stoff-material.js _windAt (liest keine Häuser)“

INFORMIEREN
- Station zuerst: punkte-maschine `meisterkarte-quelle/punkte/stationen/k2-zusammenspiel.js` (E :22; die Pfütze im Schatten :1158–1182, Zeuge :1211) — Soll, Umfang, Messe und Zeugen wörtlich in den Bericht. Steht dort `leser`/`nicht`, gehört die Mess-Funktion als Kandidat unter `cloud-post/w2-pfuetze-schatten-station/` zur Abgabe (Soll und Richter-Text bleiben unberührt).
- Eigene Quelle: die Station (k2-zusammenspiel.js:1161–1182) sucht am Dach-Pool (`atmoUniforms.dachLage`) ein Haus, an dem ein Punkt im Wurf `_hausSchatten === 1` und einer davor `=== 0` ist, und misst die Trocken-Zeit mit `_naesseAm`; Ergebnis 0 heißt: KEIN Haus erfüllte die Bedingung (schatten null). stamm/stoff-dach.js:93 `_hausSchatten`, :113 `_naesseAm`.
- Wirklichkeit mit Zahl (an der Quelle prüfen, nie kopieren — Zahl wird Band): im Schatten verdunstet Wasser langsamer, weil die Strahlung fehlt (Penman–Monteith, Allen et al. 1998, FAO-56: Strahlungsterm) — an der Quelle prüfen, welches Verhältnis Schatten ÷ Sonne für eine Pfütze plausibel ist (> 1 verlangt die Station).

TÄTER-MESSUNG VOR DEM SCHNITT (≤ 15 min, node/headless genügt): die Schleife der Station in der Werkbank-Welt (headless genügt) je Haus ausgeben: dachMass, `_hausSchatten` an pS/pO, `_naesseAm` — fällt jedes Haus an `_hausSchatten(pS) !== 1`, ist der Wurf der Täter; trocknet beides gleich, ist es `_naesseAm` (liest den Schatten nicht).

DER EINE SCHNITT: der EINE Leser, den die Messung nennt: `_hausSchatten` wirft den Schatten der Wand gegen die Sonne ODER `_naesseAm` liest ihn in der Trocken-Rate — nur der eine, in stamm/stoff-dach.js.
NICHT FALLEN DARF: stadtklima hat keine gebuchte Sprosse; der Wind der Gasse (abweichungGrad 1,98° ✓) bleibt gleich; pflanzen.jahreslauf #2 (die Pfütze trocknet im Hausschatten später, Zweig w28-saison-schatten) wartet auf die Radeon-Messung — nicht verschieben.

BEWEIS
- Zahl vorher ↔ nachher, gleiche Bedingung: schattenTrockenVerh 0 (kein Haus gefunden) → > 1.
- Linse in bestehender Familie mit Mutante, Selbsttest-Zeile mit „→ ROT“: die bestehende Familie der Stoff-/Nässe-Linsen: Mutante „Schatten trocknet wie Sonne → ROT“.
- Kosten: µs je `_naesseAm` vorher ↔ nachher.
- Bild (Pose für die Radeon — die Bahn schießt es nicht selbst): Radeon-Pose an einer Hauswand gegen die Sonne nach Regen, Ego 1,7 m — nasser Fleck im Wurf, trockener davor.

ABGABE
- Vorprüf-Kopf mit `[ci voll]`, vorher `npm run check:statik` und `git merge-tree` gegen origin/main; Dateien NUR: stamm/stoff-dach.js (+ Linse/Spec der Familie). Nicht anfassen: stamm/siedlung-bewohner.js, stamm/siedlung-verkehr.js, koerper-core.js TAGES_GESETZ, stamm/feld-brand.js, stamm/koerper-seele.js, gelaende-core.js wasserSpiegel, welt-licht.js, stamm/bild-himmel.js, phyto-core.js forest*, die Dateien der sieben Nachbar-Bahnen (stamm/vegetation-baum.js, planet-core.js, stamm/vegetation-streu.js, fachwerk-core.js, voxel-worker.js, stamm/feld-leben.js), stamm/stoff-material.js (der Wind ist grün).
- `cloud-post/w2-pfuetze-schatten.md` (drei Sätze: geschnitten · gemessen · offen mit Adresse) und `cloud-post/w2-pfuetze-schatten-satz.txt` (≤ 300 Zeichen). Nicht auf die CI warten. Keine GPU, keine Browser-Batterie, nur eigene PIDs, nie git stash.
- Die Bahn gilt erst an der GEBUCHTEN Sprosse — sag im Satz, was der echten Station dann noch fehlt: die Runde misst S1 am Kopf; der Wind-Zeuge der Station muss grün bleiben.
