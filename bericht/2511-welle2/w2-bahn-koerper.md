Lies zuerst DIE GOLDENE DEFINITION in CLAUDE.md — sie ist bindend. Arbeite als `champion` (IPERKA).

SPROSSE: `karte2.planet.kopplung.bahn-klima#2` — ZWEIG `w2-bahn-koerper` (eigener Zweig von origin/main 804ca10c oder jünger).
ROTE ZEILE planet.kopplung.bahn-klima#2 (Soll: „0° Neigung: Jahresamplitude ≤ 10 % der Erd-Saat; 45°: ≥ 2× — Schneelinie und Laub im Bild“), GTX 1060 · Kopf e1a54023 · 2026-11-25 15:29 UTC, wörtlich: „S2 Umfang nicht erzeugbar: der Planet-Faden liest den Körper der Saat nicht (voxel-worker.js:1429 planetPlanVon: P.PLANET_ERDE fest): Neigung 3.096° → Amplitude 7.22 K, Neigung 35.786° → 14.813 K, Erd-Saat 19.523 K (Spanne der Saaten 17.48 K: das Relief der Saat unter dem Körper der Erd · amp0Prozent 37 % gegen Soll ≤ 10 % ✗ · amp45Faktor 0,759 gegen Soll ≥ 2 ✗ · schneelinieVersatzM ungemessen gegen Soll > 0 m ✗ · Bild (Beleg) fehlt (/bild: {"ms":4541,"fehler":"ABNAHME ROT [Vordergrund 28.1 % näher als 8 m (der h) · Täter: voxel-worker.js planetPlanVon (PLANET_ERDE fest)“

INFORMIEREN
- Station zuerst: punkte-maschine `meisterkarte-quelle/punkte/stationen/k2-zusammenspiel.js` (C :20, Block :700; S2 `s2` :747, Werte :789, Soll :808; 20 Saaten `bahn-klima-s2-*` :719) — Soll, Umfang, Messe und Zeugen wörtlich in den Bericht. Steht dort `leser`/`nicht`, gehört die Mess-Funktion als Kandidat unter `cloud-post/w2-bahn-koerper-station/` zur Abgabe (Soll und Richter-Text bleiben unberührt).
- Eigene Quelle: voxel-worker.js:1419–1470 (KOERPER_FELDER, `planetPlanVon(samen, koerper)` :1468; der Körper des Auftrags kam mit bahn-klima#2 nur für EINEN Auftrag, :1502) und die Rufer :1481, :1507 ohne Körper. Die rote Zeile: „der Planet-Faden liest den Körper der Saat nicht (voxel-worker.js:1429 planetPlanVon: P.PLANET_ERDE fest)“ — sie misst Neigung 3,1° / 35,8° je Saat, die Amplitude folgt ihr nicht. Lies, woher die Saat ihre Neigung hat (planet-core, nur lesen; planet-core.js gehört der Bahn w2-gipfel-saaten).
- Wirklichkeit mit Zahl (an der Quelle prüfen, nie kopieren — Zahl wird Band): Neigung 0° → kaum Jahreszeiten, große Neigung → Jahres-Amplitude ein Vielfaches der Erde — Williams & Kasting 1997 (Icarus, „Habitable planets with high obliquities“); an der Quelle prüfen: Amplitude bei 0° ≤ 10 % und bei 45° ≥ 2× der Erde.

TÄTER-MESSUNG VOR DEM SCHNITT (≤ 15 min, node/headless genügt): in node den Faden-Plan für drei Saaten (Neigung 3°, 23°, 36°) bauen und die Jahres-Amplitude lesen: heute 7,22 / 19,52 / 14,81 K — folgt sie der Neigung nicht monoton, liest der Plan den Körper nicht; dann den Weg der Nachricht bis `planetPlanVon` mit `koerper` ausgeben.

DER EINE SCHNITT: jeder Auftrag des Fadens baut den Plan mit dem Körper SEINER Saat (der Körper als Funktion des Samens bzw. aus dem Auftrag, an EINER Stelle in `planetPlanVon`) — kein zweiter Plan, kein stiller Rückfall auf PLANET_ERDE.
NICHT FALLEN DARF: bahn-klima #1 ist gebucht (g1.js SCHNEE_JAHR, die Schneelinie der Erd-Saat) — die Erd-Saat byte-gleich (Plan-Hash vorher ↔ nachher).

BEWEIS
- Zahl vorher ↔ nachher, gleiche Bedingung: amp0Prozent 37 % → ≤ 10 %, amp45Faktor 0,759 → ≥ 2, schneelinieVersatzM ungemessen → > 0 m.
- Linse in bestehender Familie mit Mutante, Selbsttest-Zeile mit „→ ROT“: scripts/diag-planet.cjs (bestehende Familie): Fall „Neigung 0 ↔ 45° Amplitude“ mit Mutante „Körper fällt still auf PLANET_ERDE → ROT“.
- Kosten: ms je Plan im Faden vorher ↔ nachher (ein Feld mehr, kein Bau mehr).
- Bild (Pose für die Radeon — die Bahn schießt es nicht selbst): Radeon-Bildpaar Schneelinie Sommer ↔ Winter an einer 45°-Saat (die Station verlangt „Schneelinie und Laub im Bild“ als Beleg).

ABGABE
- Vorprüf-Kopf mit `[ci voll]`, vorher `npm run check:statik` und `git merge-tree` gegen origin/main; Dateien NUR: voxel-worker.js (+ Linse/Spec der Familie). Nicht anfassen: stamm/siedlung-bewohner.js, stamm/siedlung-verkehr.js, koerper-core.js TAGES_GESETZ, stamm/feld-brand.js, stamm/koerper-seele.js, gelaende-core.js wasserSpiegel, welt-licht.js, stamm/bild-himmel.js, phyto-core.js forest*, die Dateien der sieben Nachbar-Bahnen (stamm/vegetation-baum.js, planet-core.js, stamm/vegetation-streu.js, fachwerk-core.js, stamm/feld-leben.js, stamm/stoff-dach.js).
- `cloud-post/w2-bahn-koerper.md` (drei Sätze: geschnitten · gemessen · offen mit Adresse) und `cloud-post/w2-bahn-koerper-satz.txt` (≤ 300 Zeichen). Nicht auf die CI warten. Keine GPU, keine Browser-Batterie, nur eigene PIDs, nie git stash.
- Die Bahn gilt erst an der GEBUCHTEN Sprosse — sag im Satz, was der echten Station dann noch fehlt: der Beleg „Schneelinie und Laub im Bild“ fällt am Gerät — die Runde misst S2 an GTX + Radeon.
