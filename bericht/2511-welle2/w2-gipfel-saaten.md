Lies zuerst DIE GOLDENE DEFINITION in CLAUDE.md — sie ist bindend. Arbeite als `champion` (IPERKA).

SPROSSE: `karte2.planet.kopplung.gegenwart#2` — ZWEIG `w2-gipfel-saaten` (eigener Zweig von origin/main 804ca10c oder jünger).
ROTE ZEILE planet.kopplung.gegenwart#2 (Soll: „100 Saaten: Gipfel > 2 km an einer jemals konvergenten Grenze ≥ 95 %“), GTX 1060 · Kopf e1a54023 · 2026-11-25 15:29 UTC, wörtlich: „S2 gipfelProzent 98,6 % gegen Soll ≥ 95 % ✓ · der Zeuge der Welt fehlt: nur 12 Saaten (Soll 100) · Täter: planet-core.js planetPunktR (Orogen an der konvergenten Grenze) · gemessen vor dem Wurf der Leiter nach 40,016 s: der Deckel der Leiter 40 s“

INFORMIEREN
- Station zuerst: punkte-maschine `meisterkarte-quelle/punkte/stationen/k2-zusammenspiel.js` (S2: `s2 = gip` um :1656, Werte :1750, Soll :1836, Zeuge „nur … Saaten (Soll 100)“ :1839) — Soll, Umfang, Messe und Zeugen wörtlich in den Bericht. Steht dort `leser`/`nicht`, gehört die Mess-Funktion als Kandidat unter `cloud-post/w2-gipfel-saaten-station/` zur Abgabe (Soll und Richter-Text bleiben unberührt).
- Eigene Quelle: planet-core.js:1876 `planetPunktR(S, x, y, z, fussKm, aus)` (Kruste → Platte → Rand → Relief → Vulkan, µs je Punkt laut Kopf :13) und der Bau der Scheibe je Saat; die Station zählt Gipfel > 2 km an je konvergenten Grenzen.
- Wirklichkeit mit Zahl (an der Quelle prüfen, nie kopieren — Zahl wird Band): Hochgebirge > 2 km liegen fast nur an konvergenten Plattengrenzen oder deren Narben (Orogene) — Bird 2003 (G³, „An updated digital model of plate boundaries“) und ETOPO1 (NOAA, Amante & Eakins 2009) als Höhen-Zählung; an der Quelle prüfen, welcher Anteil der Gipfel > 2 km an Orogenen liegt (das Soll sagt ≥ 95 %).

TÄTER-MESSUNG VOR DEM SCHNITT (≤ 15 min, node/headless genügt): die S2-Schleife in node (planet-core von main) je Saat stoppen: ms für die Scheibe ↔ ms für die Gipfel-Suche (Zahl der `planetPunktR`-Rufe). 40 s ÷ 12 Saaten ≈ 3,3 s je Saat — welcher Teil trägt sie?

DER EINE SCHNITT: die Gipfel-Suche je Saat kostet höchstens 0,3 s, am Chokepoint in planet-core (der teure Teil der Messung — z. B. die Scheibe einmal je Saat statt je Punkt, oder die Suche grob → fein), das Gesetz des Reliefs byte-gleich (Höhen an 1 000 Stichpunkten identisch).
NICHT FALLEN DARF: gegenwart #6 gebucht; jede Höhe des Planeten (byte-Beweis an Stichpunkten, alle Sprossen der Leitern planet.*, die planet-core lesen).

BEWEIS
- Zahl vorher ↔ nachher, gleiche Bedingung: Saaten im Deckel 12 → 100, gipfelProzent bleibt ≥ 95 % (heute 98,6 % an 12).
- Linse in bestehender Familie mit Mutante, Selbsttest-Zeile mit „→ ROT“: scripts/diag-planet.cjs (bestehende Familie): Fall „100 Saaten Gipfel-Suche ≤ 30 s“ mit Mutante „Relief-Höhe weicht an einem Stichpunkt ab → ROT“.
- Kosten: ms je Saat vorher ↔ nachher, gemessen in node am selben Rechner, drei Läufe.
- Bild (Pose für die Radeon — die Bahn schießt es nicht selbst): keines (Zahl).

ABGABE
- Vorprüf-Kopf mit `[ci voll]`, vorher `npm run check:statik` und `git merge-tree` gegen origin/main; Dateien NUR: planet-core.js (+ Linse/Spec der Familie). Nicht anfassen: stamm/siedlung-bewohner.js, stamm/siedlung-verkehr.js, koerper-core.js TAGES_GESETZ, stamm/feld-brand.js, stamm/koerper-seele.js, gelaende-core.js wasserSpiegel, welt-licht.js, stamm/bild-himmel.js, phyto-core.js forest*, die Dateien der sieben Nachbar-Bahnen (stamm/vegetation-baum.js, stamm/vegetation-streu.js, fachwerk-core.js, voxel-worker.js, stamm/feld-leben.js, stamm/stoff-dach.js).
- `cloud-post/w2-gipfel-saaten.md` (drei Sätze: geschnitten · gemessen · offen mit Adresse) und `cloud-post/w2-gipfel-saaten-satz.txt` (≤ 300 Zeichen). Nicht auf die CI warten. Keine GPU, keine Browser-Batterie, nur eigene PIDs, nie git stash.
- Die Bahn gilt erst an der GEBUCHTEN Sprosse — sag im Satz, was der echten Station dann noch fehlt: die Runde misst S2 am Kopf; hält der Deckel der Leiter 40 s nicht, nennt der Satz die gemessene Wanduhr.
