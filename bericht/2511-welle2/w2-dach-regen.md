Lies zuerst DIE GOLDENE DEFINITION in CLAUDE.md — sie ist bindend. Arbeite als `champion` (IPERKA).

SPROSSE: `karte2.mensch.kopplung.kultur#2` — ZWEIG `w2-dach-regen` (eigener Zweig von origin/main 804ca10c oder jünger).
ROTE ZEILE mensch.kopplung.kultur#2 (Soll: „Dach ↔ Niederschlag r ≥ 0,5; Mutation ≥ 90 %“), GTX 1060 · Kopf 2d6a0447 · 2026-11-24 20:47 UTC, wörtlich: „S2 r 0 gegen Soll ≥ 0,5 ✗ · mutationProzent 0 % gegen Soll ≥ 90 % ✗ · Täter: fachwerk-core.js:2762 bauRezept (die Dach-Neigung aus dem Samen; kein Niederschlag, kein Wetter am Dach)“

INFORMIEREN
- Station zuerst: punkte-maschine `meisterkarte-quelle/punkte/stationen/k2-zusammenspiel.js` (KULTUR :3207, Block :4072; S2 Werte `r`, `mutationProzent` um :4207) — Soll, Umfang, Messe und Zeugen wörtlich in den Bericht. Steht dort `leser`/`nicht`, gehört die Mess-Funktion als Kandidat unter `cloud-post/w2-dach-regen-station/` zur Abgabe (Soll und Richter-Text bleiben unberührt).
- Eigene Quelle: fachwerk-core.js:2852 `function bauRezept(z, haushalt, seed)` (die rote Zeile nennt :2762 am Kopf 2d6a0447), Rufer :4646 und :5417; der Niederschlag des Orts kommt über das Δ des Orts (planet-core `regenQuote`, :2842) — lesen, phyto-core und planet-core nicht ändern.
- Wirklichkeit mit Zahl (an der Quelle prüfen, nie kopieren — Zahl wird Band): die Dach-Neigung folgt Regen und Schnee — steil im Nassen und Verschneiten, flach im Trockenen (Rapoport 1969, House Form and Culture; Schnee-Last-Normen EN 1991-1-3 als Zahl für die Steilheit); an der Quelle prüfen, welches r (Neigung ↔ Niederschlag) belegt ist.

TÄTER-MESSUNG VOR DEM SCHNITT (≤ 15 min, node/headless genügt): bauRezept an 20 Orten mit verschiedenem Niederschlag in node rufen (fachwerk-core ist ein Kern ohne DOM): die Neigung je Ort — heute gleich bei gleichem Samen (r 0), das beweist den Täter.

DER EINE SCHNITT: `bauRezept` liest den Niederschlag des Orts (ein Argument aus dem Δ des Orts, vom Rufer gereicht) und legt die Dach-Neigung als Funktion von ihm, der Samen streut nur darum — additiv im Kern (ohne Ort byte-gleich, Byte-Beweis am Lab-Startzustand PRESETS.s).
NICHT FALLEN DARF: kultur hat keine gebuchte Sprosse; mensch.bau.innen #1/#2, wehrbau #1–#3, macht.grenze #1 lesen fachwerk — ihre Häuser ohne Ort byte-gleich (Byte-Beweis), Dächer am Start-Dorf nur nach dem Niederschlag verschoben.

BEWEIS
- Zahl vorher ↔ nachher, gleiche Bedingung: r 0 → ≥ 0,5, mutationProzent 0 % → ≥ 90 % (dasselbe Haus an einen nassen Ort verpflanzt ändert die Neigung).
- Linse in bestehender Familie mit Mutante, Selbsttest-Zeile mit „→ ROT“: die bestehende Fachwerk-Familie (gate der Bau-Rezepte): Mutante „Neigung unabhängig vom Regen → ROT“.
- Kosten: µs je bauRezept vorher ↔ nachher; Tris des Start-Dorfs gleich.
- Bild (Pose für die Radeon — die Bahn schießt es nicht selbst): Radeon-Bildpaar zweier Dörfer (nass ↔ trocken), Third 30 m, Blick auf die Dächer.

ABGABE
- Vorprüf-Kopf mit `[ci voll]`, vorher `npm run check:statik` und `git merge-tree` gegen origin/main; Dateien NUR: fachwerk-core.js (+ Linse/Spec der Familie). Nicht anfassen: stamm/siedlung-bewohner.js, stamm/siedlung-verkehr.js, koerper-core.js TAGES_GESETZ, stamm/feld-brand.js, stamm/koerper-seele.js, gelaende-core.js wasserSpiegel, welt-licht.js, stamm/bild-himmel.js, phyto-core.js forest*, die Dateien der sieben Nachbar-Bahnen (stamm/vegetation-baum.js, planet-core.js, stamm/vegetation-streu.js, voxel-worker.js, stamm/feld-leben.js, stamm/stoff-dach.js).
- `cloud-post/w2-dach-regen.md` (drei Sätze: geschnitten · gemessen · offen mit Adresse) und `cloud-post/w2-dach-regen-satz.txt` (≤ 300 Zeichen). Nicht auf die CI warten. Keine GPU, keine Browser-Batterie, nur eigene PIDs, nie git stash.
- Die Bahn gilt erst an der GEBUCHTEN Sprosse — sag im Satz, was der echten Station dann noch fehlt: die Runde misst S2 am Kopf; das Dach im Spiel muss den Wert des Rezepts zeichnen (Bild als Beleg).
