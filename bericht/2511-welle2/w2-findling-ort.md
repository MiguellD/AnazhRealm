Lies zuerst DIE GOLDENE DEFINITION in CLAUDE.md — sie ist bindend. Arbeite als `champion` (IPERKA).

SPROSSE: `karte2.planet.kopplung.gegenwart#1` — ZWEIG `w2-findling-ort` (eigener Zweig von origin/main 804ca10c oder jünger).
ROTE ZEILE planet.kopplung.gegenwart#1 (Soll: „1 000 Relikte: Ursache in der Geschichte des Orts = 100 %“), GTX 1060 · Kopf e1a54023 · 2026-11-25 15:29 UTC, wörtlich: „S1 ursacheProzent 44,1 % gegen Soll = 100 % ✗ · Täter: stamm/vegetation-baum.js:1433 _rockGeologyClass (der Findling liest die Eis-Zeit des Planeten, ort.eis — nicht die Geschichte des Orts) · gemessen vor dem Wurf der Leiter nach 40,016 s: der Deckel der Leiter 40 s“

INFORMIEREN
- Station zuerst: punkte-maschine `meisterkarte-quelle/punkte/stationen/k2-zusammenspiel.js` (Leiter P = gegenwart :25; S1 `ursacheProzent` um :1746 und Soll :1819) — Soll, Umfang, Messe und Zeugen wörtlich in den Bericht. Steht dort `leser`/`nicht`, gehört die Mess-Funktion als Kandidat unter `cloud-post/w2-findling-ort-station/` zur Abgabe (Soll und Richter-Text bleiben unberührt).
- Eigene Quelle: stamm/vegetation-baum.js:1433 `_rockGeologyClass(slope, relH)`, Rufer :1716 (`geoCls`); die Eis-Zeit des Orts liefert der Planet (planet-core `ortEisZeit`, siehe scripts/diag-wetter-wache.cjs:30) — lesen, nie in planet-core schreiben.
- Wirklichkeit mit Zahl (an der Quelle prüfen, nie kopieren — Zahl wird Band): Findlinge (erratische Blöcke) liegen nur, wo Eis je lag — innerhalb der maximalen Vereisung, nie außerhalb: Ehlers & Gibbard (Hg.) 2004/2011, Quaternary Glaciations — Extent and Chronology; an der Quelle prüfen, wie scharf die Grenze (km) ist.

TÄTER-MESSUNG VOR DEM SCHNITT (≤ 15 min, node/headless genügt): die 1 000 Relikte der Station nach Klasse und Ursache aufteilen: welche Klasse trägt die 55,9 % ohne Ursache? Steht der Findling außerhalb jeder je vereisten Lage (ortEisZeit 0) — dann ist `_rockGeologyClass` der Täter; sonst ein anderes Relikt (dann Brief zurück).

DER EINE SCHNITT: `_rockGeologyClass` liest die Eis-GESCHICHTE des Orts (je vereist, aus dem Planeten) statt der Eis-Zeit des Planeten — der Findling fällt, wo nie Eis lag; kein zweiter Weg, kein Flag.
NICHT FALLEN DARF: gegenwart #6 ist gebucht (Glieder [6]) — vor und nach dem Schnitt dieselbe Zahl; der Fels-Wurf außerhalb der Findlinge byte-gleich (Anzahl und Lage der übrigen Fels-Klassen).

BEWEIS
- Zahl vorher ↔ nachher, gleiche Bedingung: ursacheProzent 44,1 % → 100 % an derselben Saat und denselben 1 000 Relikten.
- Linse in bestehender Familie mit Mutante, Selbsttest-Zeile mit „→ ROT“: eine Zeile in der bestehenden Familie der Vegetations-Linsen (gate:… der Fels-Klassen, falls vorhanden; sonst scripts/diag-planet.cjs Fall): Mutante „Findling außerhalb der Vereisung → ROT“.
- Kosten: ms je Fels-Wurf vorher ↔ nachher (der Leser ist ein Punkt-Abruf je Block, kein Gitter).
- Bild (Pose für die Radeon — die Bahn schießt es nicht selbst): Radeon-Pose am nächsten ehemals vereisten Rand (Werkbank --echt, Ego 1,7 m, Blick über die Grenze) — Findlinge nur auf der Eis-Seite.

ABGABE
- Vorprüf-Kopf mit `[ci voll]`, vorher `npm run check:statik` und `git merge-tree` gegen origin/main; Dateien NUR: stamm/vegetation-baum.js (+ Linse/Spec der Familie). Nicht anfassen: stamm/siedlung-bewohner.js, stamm/siedlung-verkehr.js, koerper-core.js TAGES_GESETZ, stamm/feld-brand.js, stamm/koerper-seele.js, gelaende-core.js wasserSpiegel, welt-licht.js, stamm/bild-himmel.js, phyto-core.js forest*, die Dateien der sieben Nachbar-Bahnen (planet-core.js, stamm/vegetation-streu.js, fachwerk-core.js, voxel-worker.js, stamm/feld-leben.js, stamm/stoff-dach.js).
- `cloud-post/w2-findling-ort.md` (drei Sätze: geschnitten · gemessen · offen mit Adresse) und `cloud-post/w2-findling-ort-satz.txt` (≤ 300 Zeichen). Nicht auf die CI warten. Keine GPU, keine Browser-Batterie, nur eigene PIDs, nie git stash.
- Die Bahn gilt erst an der GEBUCHTEN Sprosse — sag im Satz, was der echten Station dann noch fehlt: die Runde misst S1 am Kopf (GTX + Radeon); der Deckel der Leiter 40 s muss halten.
