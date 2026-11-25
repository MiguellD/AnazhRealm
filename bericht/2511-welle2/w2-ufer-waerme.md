Lies zuerst DIE GOLDENE DEFINITION in CLAUDE.md — sie ist bindend. Arbeite als `champion` (IPERKA).

SPROSSE: `karte2.leben.pflanzen.biome#1` — ZWEIG `w2-ufer-waerme` (eigener Zweig von origin/main 804ca10c oder jünger).
ROTE ZEILE leben.pflanzen.biome#1 (Soll: „Bild am Gipfel baumfrei; Stichprobe: Uferarten am Wasser ≥ 90 %, Wärme-Arten außerhalb der Wärme 0“), GTX 1060 · Kopf 31ea3847 · 2026-11-21 10:00 UTC, wörtlich: „S1 uferProzent 64,706 % gegen Soll ≥ 90 % ✗ · waermeAussen 2 Pflanzen gegen Soll = 0 Pflanzen ✗ · Täter: stamm/vegetation-streu.js _scatterSpeciesForCell (die Palme folgt `lebendig`, nicht der Wärme)“

INFORMIEREN
- Station zuerst: punkte-maschine `meisterkarte-quelle/punkte/stationen/k2-leben.js` (B_ID :18; Stichprobe um :396–405 `uferArten`, `waermeAussen`; Werte :590) — Soll, Umfang, Messe und Zeugen wörtlich in den Bericht. Steht dort `leser`/`nicht`, gehört die Mess-Funktion als Kandidat unter `cloud-post/w2-ufer-waerme-station/` zur Abgabe (Soll und Richter-Text bleiben unberührt).
- Eigene Quelle: stamm/vegetation-streu.js:206 `_scatterSpeciesForCell(lebendig, moisture, hash, x, z)`, Rufer :257; die Wärme des Orts liest der Kern (`A.waermeWinterC` in der Station :405 — derselbe Wert, den der Streuer lesen muss).
- Wirklichkeit mit Zahl (an der Quelle prüfen, nie kopieren — Zahl wird Band): Palmen fehlen, wo der kälteste Monat unter ≈ 5 °C fällt — Walther et al. 2007 (Proc. R. Soc. B, Palmen und Klima); Uferarten (Weide, Erle, Schilf) an Wasser gebunden — Naiman & Décamps 1997 (Annu. Rev. Ecol. Syst., riparian zones); an der Quelle prüfen.

TÄTER-MESSUNG VOR DEM SCHNITT (≤ 15 min, node/headless genügt): an der Saat der Station die Stichprobe in node/headless: jede Pflanze außerhalb der Wärme mit Art und `lebendig` — tragen die 2 Fehl-Palmen hohes `lebendig` bei kaltem Winter, ist es der Täter; dazu die 35,3 % Ufer-Fehler: welche Art steht nass, welche Uferart trocken?

DER EINE SCHNITT: `_scatterSpeciesForCell` wählt die Art aus Wärme (Winter) und Nässe am Ort — die Palme nur über ihrer Wärme-Schwelle, die Uferart nur in der Ufer-Nässe — EIN Leser statt `lebendig`.
NICHT FALLEN DARF: biome hat keine gebuchte Sprosse; die gebuchten Leitern, die den Streuer lesen (pflanzen.kraft #1, jahreslauf #1, wanderung #1 u. a.) — ihre Station am Kandidaten nennen, Zahl gleich.

BEWEIS
- Zahl vorher ↔ nachher, gleiche Bedingung: uferProzent 64,7 % → ≥ 90 %, waermeAussen 2 → 0 an derselben Stichprobe.
- Linse in bestehender Familie mit Mutante, Selbsttest-Zeile mit „→ ROT“: die bestehende Familie der Streu-/Vegetations-Linsen (gate der Arten-Wahl): Mutante „Palme bei Winter −5 °C → ROT“.
- Kosten: ms je Streu-Zelle vorher ↔ nachher; Arten-Zahl je km² im Band.
- Bild (Pose für die Radeon — die Bahn schießt es nicht selbst): Radeon-Pose am Ufer des nächsten Flusses (Ego 1,7 m, Blick längs des Ufers) — Uferarten am Wasser, keine Palme im Kalten.

ABGABE
- Vorprüf-Kopf mit `[ci voll]`, vorher `npm run check:statik` und `git merge-tree` gegen origin/main; Dateien NUR: stamm/vegetation-streu.js (+ Linse/Spec der Familie). Nicht anfassen: stamm/siedlung-bewohner.js, stamm/siedlung-verkehr.js, koerper-core.js TAGES_GESETZ, stamm/feld-brand.js, stamm/koerper-seele.js, gelaende-core.js wasserSpiegel, welt-licht.js, stamm/bild-himmel.js, phyto-core.js forest*, die Dateien der sieben Nachbar-Bahnen (stamm/vegetation-baum.js, planet-core.js, fachwerk-core.js, voxel-worker.js, stamm/feld-leben.js, stamm/stoff-dach.js).
- `cloud-post/w2-ufer-waerme.md` (drei Sätze: geschnitten · gemessen · offen mit Adresse) und `cloud-post/w2-ufer-waerme-satz.txt` (≤ 300 Zeichen). Nicht auf die CI warten. Keine GPU, keine Browser-Batterie, nur eigene PIDs, nie git stash.
- Die Bahn gilt erst an der GEBUCHTEN Sprosse — sag im Satz, was der echten Station dann noch fehlt: „Bild am Gipfel baumfrei“ urteilt die Station am Gerät — die Runde misst S1 an GTX + Radeon.
