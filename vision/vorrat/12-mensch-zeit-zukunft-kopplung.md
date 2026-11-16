# Vorrat 12 — mensch · zeit · zukunft · kopplung (Kopf e4eeee08)

**Zählung:** A 0 · T 0 · F 3 · R 2 · B 10 (15 Leitern) — **gelesen: 15 von 15 Leitern; je Ziel-Sprosse die tragende Stelle im Code mit
Datei:Zeile, die alten Stationen siedlung.K4#1/#2 (g5.js:4220–4380) und stoffe.K2#2 (g1.js:3385–3465) ganz am Urteil. Die B-Leitern habe ich
per Absenz-Grep und Lesen der Ansatzstelle belegt, nicht tiefer. Ehrlich etwa 70 %.** Alles gelesen, nichts gemessen.

## Die fünf billigsten Sprossen

1. **mensch.kopplung.antwort 1 (R, Bau S, ~4 GPU-min):** siedlung.K4#2 urteilt den Ring um das Spielerhaus schon an beiden Geräten (Ring 9,
   Median 22 m), es fehlt nur der Gegenlauf „dieselbe Saat ohne Haus → kein Ring“. Ein zweiter Ort derselben Saat im selben Uhr-Lauf
   (der Nachbar wächst im selben Takt, WW4) und eine Zeile im Urteil (g5.js:4335) — danach die Tafel-Zeile.
2. **mensch.zeit.palimpsest 2 (F, Bau S, ~5 GPU-min):** die Überdeckung je Slot steht nur headless (Teil J 0,915), in der Welt nur über
   1412 → 1724 (0,917). Vier Sätze „dorf 7 300 jahr J“ in der Sitzung von K4#2, `ueberdeckung()` über den Plan der Welt, plus Sprung ≤ 5 s;
   Risiko: 0,915 liegt knapp über der Schwelle 0,9.
3. **mensch.kopplung.leben 1 (B, Bau S, ~3 GPU-min):** `tagesPlan` (koerper-core.js:5280) hat keinen Wetter-Eingang, sein einziger Rufer
   `_bewohnerSoll` (siedlung-bewohner.js:2129) reicht keins. Ein fünfter, additiver Eingang „nass“ macht platz/abend/morgen zu drinnen;
   der Richter fährt im Muster mensch.K2#2 (g2.js:5483) Markt Sonne gegen Regen.
4. **mensch.zeit.kausal 1 (F, Bau S, ~8 GPU-min):** die Welt verdrahtet „Gewalt bremst“ ganz (Zeuge → Akte → `wachstum`,
   siedlung-bewohner.js:2117, siedlung-ort.js:2848), aber das Urteil W2 rechnet nur Node neben der Sitzung. Zwei Orte derselben Saat in
   der K4#2-Uhr, an einem drei Schläge vor Zeugen; der Ort mit Gewalt muss weniger Häuser tragen.
5. **mensch.zeit.erleben 1 (F, Bau S, ~5 GPU-min, sicher nur 0,45):** der Brand des Brennglases hinterlässt eine Narbe am Ort
   (feld-leben.js:9–68, 2711), stoffe.K2#2 misst die Asche nur headless. Ein Bildpaar vor/nach dem Brand an einer Pose — offen ist, ob eine
   Gras-Narbe als „Ereignis am Ort“ gilt (Häuser brennen nicht, bau-vorlagen.js:1551).

## Funde über das Paket hinaus

- **Eine Erweiterung von siedlung.K4#2 trägt drei Leitern:** antwort 1 (Gegenlauf ohne Haus), kausal 1 (Gegenlauf mit Gewalt) und
  palimpsest 2 (Jahresringe in der Welt) brauchen dieselbe Sitzung, denselben Ort von 1320 und den Nachbarn im selben Takt. Gebaut als EIN
  Zusatz wären das drei Sprossen für eine Station; der Preis ist die Dauer (K4#2 trägt heute schon 12 min) und der Heap am Dorf.
- **Es gibt keinen Blind-Leser für Bilder:** spanne 1 (Blind-Datierung), erde 1 (2AFC-Panel), zukunft.technik 1 (Dinge benennen) und
  kultur 1 (Region aus dem Hausbild) brauchen alle denselben Richter, der PNGs blind bewertet. Ein Grep nach „blind|2AFC|Panel“ in
  stationen/ findet nur Selbsttest-Wörter. Ein KI-Bildurteil nach dem Muster `kiSpracheLaufUrteil` (g5.js:384) würde vier Leitern
  freischalten.
- **mensch.K2#2 (g2.js:5483) ist das Muster für die Tages-Kopplungen:** leben 1, sport 1, kopplung.leib 1 und kreislauf 1 lesen alle
  den Bewohner-Zustand (`soll.drinnen`, `soll.akt`, `ov.top`, `b.orte`) in derselben Sitzung. Nach den jeweiligen Kern-Schnitten
  (alle an koerper-core `tagesPlan`/`tagesBindung` oder `_bewohnerTracht`) reicht EINE Proben-Familie.
- **Belege mit gewanderten Zeilen (Inhalt stimmt noch):** kultur (Region per Würfel heute fachwerk-core.js:3819 statt 3647,
  metaParams 8779 statt 8103, weiter nur das Studio als Leser); sport (`tagesPlan` heute koerper-core.js:5280 statt 5057–5086, weiter ohne
  Freizeit); spanne (die Satz-Regel feld-leben.js:1174–1196, stimmt).
- **palimpsest:** heute = 1, die Tafel-Zeile hängt an Sprosse 1 (siedlung.K4#2). Die Ziel-Sprosse ist 2, darum NICHT A.
- **zukunft.technik:** die Zeit-Achse endet bei 1965 (modern/volle_moderne, fachwerk-core.js:3282); „dorf … jahr 2100“ baut ein Dorf der
  Moderne. Der Satz nimmt Jahre bis 9999 an, aber nach 1965 wächst nichts mehr.
