# 18 Wetter: Regen, Nässe, Pfützen, Wind und Böe

## Was der Spieler sieht (mit Bildpfad; sonst „kein Bild gesehen")
- Ein Regenbild aus dem Spiel habe ich NICHT gesehen. Jedes Bildpaar von heute läuft auf der Bühne „summer sunny 0.50“
  (`scratchpad/genom-spiel/gruppe.abnahme.json:9` und `:75`, ebenso `frontal`, `eng-rot`). Das Dorf in
  `scratchpad/genom-spiel/gruppe.png`: trockener brauner Platz, harte Schatten, kein Tropfen, keine Pfütze.
- Ein Paar Sturm gegen trocken gibt es nur am Bach (Station wetter.K3#2, Radeon am e6f0cf7e):
  `w3/pm/meisterkarte-quelle/punkte/messung/roh/e6f0cf7e-radeon/wetter.K3_2-werk/sturm.png` gegen `trocken.png`. Darin sehe ich:
  im Sturm ist der Teich größer, sonst gleicher Himmel (blau mit weißen Wolken), gleiches Licht, die Halme gleich hell,
  KEINE einzige Regen-Schliere. Ob die Station das Wetter fürs Bild auf sonnig hält: nicht gelesen.
- Was der Spieler im Regen zu sehen bekommt, sagt nur die Zahl der Linse: auf der Wiese ändern die Schlieren 143 von 25 920
  Rasterpunkten (0,55 %, Ego) bzw. 92 von 25 867 (0,36 %, Third) um mehr als 3 Luma. Am Dorf sind es 9 von 13 289 (0,07 %)
  (stand.json wetter.K2#1/#2, Radeon e6f0cf7e; roh `e6f0cf7e-radeon/wetter.K2_2.json:25,52`). Der Regen fällt also, ist im Bild
  aber so gut wie nicht zu sehen. Der Boden wird dunkler (porös 0,782), das ganze Bild auch (Regenbild 0,642 / 0,605).

## Was die Quelle sagt (Fakten mit Datei:Zeile und Zahl; was das Gesetzbuch KANN gegen das, was die Welt davon KONSUMIERT)
Pfade unter SPIEL, wenn nichts anderes steht.
- **Wie oft es regnet.** Die Front ist EINE Kern-Funktion `wetterAt(saat,x,z,t)` (`phyto-core.js:4067-4091`). Über 300 Saaten
  × 400 Orte: klar 27 % · Nebel 15 % · bewölkt 21 % · Regen 25 % · Sturm 13 % (`phyto-core.js:4014`). Auch „bewölkt“ trägt
  Regen 0,12 (`phyto-core.js:3995`), und das liegt über der Grenze `regenAb` 0,05 (`stoff-material.js:3767`). Damit benetzt bewölktes
  Wetter die Welt und zeichnet Schlieren (`bild-himmel.js:1071`, Bedingung rain > 0,01). Ergebnis: ungefähr 59 % der Spielzeit
  ist die Welt nass oder wird nass. Die Bühne jeder Bildprobe zeigt dagegen 0 % davon (R9, `meisterkarte-quelle/src/meta.js:34`).
- **Was die Nässe KANN, ist eingefädelt.** Engstelle ist `_leuchtStoff` → `_naesseImStoff` (`stoff-material.js:2046`, `:2078-2106`)
  für jeden beleuchteten Welt-Stoff. Die Albedo geht gegen ihr Quadrat, die Rauheit sinkt ×0,5 (`:2157-2166`, Lagarde und
  Lekner-Dorf). Der Effekt wird gewichtet mit Himmels-Sicht × Poren (`NAESSE.poren` `:3776`) und gilt unter einem Dach nicht
  (`_naesseHimmel` `:2198-2207`). Die Pfützen stehen in den Mulden des Kerns, nur im Boden-Stoff (`pfuetze: true` nur bei
  `geomorph` `:1966`, `_pfuetzeKnoten` `:2116-2149`). Tropfen-Ringe werden gelesen (`:1886-1887`). Die Trocken-Kurve ist
  benetzt 0,909 → trocken nach 570 s (wetter.K2#2 headless). Die Kosten der Nässe im Regen sind bereits geschnitten: GTX
  Wiese +0,59 → +0,04 ms (Zweig `naesse-kosten` d7cd7267, gemergt).
- **Was der Regen KANN.** Ein Gesetz `REGEN_GESETZ` für Labor und Welt (`foundry-core.js:190-200`): 7 200 Schlieren in einem
  Kasten 54 × 30 × 54 m um das Auge, Fall 9 m/s, Länge 15 cm, Breite 1,2 cm, mindestens 1,25 px, Deckung 0,72 × Regen.
  Die Welt zeichnet sie als ein instanziertes Sprite (`bild-himmel.js:972-1054`). Am Rand blendet der Kasten bei 0,7–1,0
  seines halben Maßes aus (`:1026`), und unter einem Dach fällt kein Regen (`:1022`).
  **Das ist die Wurzel der Unsichtbarkeit:** 7 200 Schlieren auf 87 480 m³ sind 0,08 je m³. Jenseits von etwa 8 m ist eine
  Schliere schmaler als ein Pixel und deckt nur anteilig (`:1018`, `:1024`). Fast alle Schlieren stehen also dort, wo sie
  keinen Pixel tragen. Meine Überschlagsrechnung (nicht gemessen) ergibt ≈ 0,15 % Bild-Deckung. Gemessen sind 0,36–0,55 %
  der Punkte; das ist dieselbe Größenordnung.
- **Fern gibt es keinen Regen.** Die Luft liest EIN β für den ganzen Schirm: `U.beta.value = this._luftBeta()`
  (`bild-himmel.js:2429`, `_luftBeta` `:2160-2168` über das globale Wort). Die Front ist im Kern räumlich, die Welt nutzt sie
  aber nur am Spieler (`dirigent-takt.js:1643-1651`). Den Vorhang einer Front aus 2 km gibt es nicht (Beleg ferne.K5,
  `meisterkarte-quelle/src/g3.js:126-130`).
- **Wind und Böe.** Ein Term `_windSwayOffset` und ein Wind am Ort `_windAt`. Die Leser Gras, Wasser, Regen, Tuch, Rauch und Wagen
  folgen der Mutation ×0 (wetter.K5#2: 6/6). Bild ↔ Ohr: klang.K2#1 r 0,81 (Radeon) / 0,79 (GTX). Die Regen-Drift liest
  denselben Wind (`bild-himmel.js:1087-1089`).
- **Meisterkarte Wetter:** 9 von 10 Punkten (K1 2 · K2 2 · K3 2 · K4 1 · K5 2, stand.json:4571-4731). Daneben ferne.K5 1/2
  („#2 ohne Station“) und licht.K5 1/2 (`bericht/1113-kurs-B-meisterkarte.md:177,179`).

## Die EINE begrenzende Entscheidung
**Der Regen wird nach dem Schirm und nach dem Ort gezeichnet, nicht nach einem Kasten und einem globalen Wort.**
Nah sind die Schlieren dort dicht, wo eine Schliere Pixel trägt. Fern ist der Regen der Vorhang der Front aus
`wetterAt` am Ort des Fragments. Es kommt kein neuer Pass dazu, die Zahl der Schlieren steigt nicht, und die trockene Welt
zahlt nichts.

## Der Schnitt (die Klasse ganz: Stufen · Leser-Liste mit Datei:Zeile · Kosten-Zeile · Kriterien der Meisterkarte mit Id, Ist ↔ Soll, Station)
**Klasse „sichtbarer Regen“, drei Stufen in EINER Welle:**
1. **Schliere (nah, 0–~10 m).** Den Kasten `REGEN_GESETZ.raum` (`foundry-core.js:192`) auf die Nähe binden, in der eine Schliere
   ≥ `minPixel` ist. `anzahl` 7 200 bleibt. Bei einem Kasten um 24 × 16 × 24 m wäre die Dichte ≈ ×9 (gerechnet, nicht gemessen).
   Das ist ein Wert im Kern und kein additiver Eingriff. Labor und Welt ändern sich gemeinsam (ein Gesetz), deshalb gehört der
   Byte- und Bild-Beweis beider Seiten in den Commit.
2. **Schleier (mittel).** Was jenseits des Kastens nicht mehr als Schliere gezeichnet wird, trägt die Luft. Das macht
   `_luftBeta` schon heute über `f.rain` (`bild-himmel.js:2165-2167`). Es bleibt prüfen, dass der kleinere Kasten keine Lücke
   zwischen Schliere und Dunst hinterlässt: Bildpaar Ego.
3. **Vorhang (fern, bis 2 km).** Im Luft-Knoten trägt β zusätzlich den Regen der Front am Welt-Ort des Fragments: die drei
   Wellen und die Stufen von `wetterAt` (`phyto-core.js:4067-4091`) als TSL-Arithmetik, hinter einem `select(regen > 0)`, wie es
   `_naesseHimmel` vormacht (`stoff-material.js:2204`). Am Auge gilt dasselbe Wort wie heute, damit bleiben die CPU-Leser byte-gleich.

**Leser-Liste (vor dem Schnitt):**
- REGEN_GESETZ: `bild-himmel.js:976` (`_ensureRainSystem`), `:1000-1026` (Kasten, Blende), `:1082` (Deckung) ·
  Labor `worlds/terrain/phytogenesis.js:503-527`, `:3852-3859` · Linse Q7 `scripts/lib/wasser-linse.cjs:1491-1564`
  (Schlieren ≥ 50, Neigung; Soll `scripts/diag-wasser-leben.cjs:66`) · Nässe-Linse
  `scripts/lib/licht-linsen.cjs:2646-2650,2748` (Regen-Punkte) · Ohr↔Bild `scripts/diag-klang-zensus.cjs:1486-1492` (liest
  nur die Deckung, die unverändert bleibt) · `scripts/diag-wetter-wache.cjs:203` · `scripts/diag-kopplung.cjs:244` ·
  `scripts/lib/ausgabe-aufnahme.cjs:300` · Inventar `scripts/diag-asset-inventory.cjs:161`.
- β: `bild-himmel.js:2429` (Uniform) · `:1455` `_atmoMediumJetzt` (Sonne und Tafeln, bleibt am Auge) · `:2194,2216`
  `_luftSichtM` (Linsen, Fern-Wasser-Reichweite, bleibt am Auge) · der Feld-Pass, der dieselben Fn-Knoten ruft (`:2155`).
- Front: `wetterAt` wird heute gelesen von `bild-himmel.js:2760`, `dirigent-takt.js:1645-1646`, `wasser-hydro.js:208-209,244`.
  Bleibt unverändert, es kommt nur ein Leser im Knoten dazu.

**Kosten-Zeile:** Bei Sonne +0 (Sprite unsichtbar `bild-himmel.js:1072`, Vorhang hinter `select`). Damit bleiben die
Pflicht E (gemessen bei Sonne) und B (`_ensureRainSystem` lazy beim ersten Regen, `:1076`) unberührt. Im Regen bleibt der
Vertex-Teil gleich (7 200). Der Overdraw steigt mit der Bild-Deckung der Schlieren, ist also an den Schirm gebunden.
Der Vorhang kostet je Pixel etwa 3 sin plus 1 Stufen-Wahl. Messen: GTX-Frame p95 im Regen vorher ↔ nachher an der Wiese, Ego
und Third (Werkpaket-Muster `naesse-kosten`).

**Kriterien:**
- wetter.K2 bleibt 2/2 (Station #1 Dorf, #2 Wiese, beide Geräte). Die Regen-Punkte draußen werden berichtet, ohne neues
  Soll: Ist 143 / 92 / 9.
- ferne.K5 1 → 2: „Regenvorhang einer Front aus 2 km sichtbar, beide Geräte“ (`g3.js:128`). Station #2 FEHLT
  (Teil der 58 Punkte ohne Station). Die Abgabe ist das Bildpaar.
- licht.K5 1/2 (Wetter ohne Bruch): wird berührt, nicht gezählt.

**Abgabe (Bildpaar):** Dorf am Prüfplatz, `werkbank bild --wetter rainy`, 10 min, Ego und Third, feste Kamera, vorher ↔
nachher. Dazu ein Hügel-Blick quer zur Front für den Vorhang.

## Was schon liegt (Zweig, Kopf, was fehlt bis zur Landung)
- Gemergt, 0 Commits vor main: `naesse` cde74c22 · `naesse-kosten` d7cd7267 · `w15-pfuetze` f5a5bc1e (Schliere als Weg des
  Tropfens, 9 m/s) · `w20-innen-regen` 46272912 · `w20-boee-bild` 7c379725 · `wetter-sicht` 1424a9c8 · `pegel-regen` 630ffe44.
- Kein Zweig trägt die Sichtbarkeit des Regens oder den Vorhang. Bis zur Landung fehlt alles aus „Der Schnitt“.

## Ehrlich offen (nicht gelesen, nicht gemessen, Widersprüche)
- Kein Regenbild aus dem Spiel gesehen. Das K3-Paar zeigt im Sturm weder Schlieren noch dunkleres Gras; ob die Station dort
  das Wetter fürs Bild hält, habe ich nicht gelesen.
- Das Regenbild auf der Radeon sprang von 0,85–0,95 auf 0,60–0,65. Das fällt zusammen mit dem Format-Wechsel der Linse (+Pfütze,
  „Regenbild unter offenem Himmel“, `w20-innen-regen`). Ich halte es für eine Änderung der Linse, nicht der Welt; bewiesen ist es nicht.
- „Glanz 16“ ist eine Konstante des Gesetzes ((0,8/rauh)^4 bei fest 0,4/0,8, `scripts/lib/licht-linsen.cjs:2755,2767`), keine
  Messung im Bild. Die Staffel-2 „Glanz ≥ 2×“ ist damit am Bild ungemessen. Berichtet, nicht neu gebaut.
- Pfützen: am Haus am Markt lagen 2 029 von 3 837 Boden-Punkten in einer Pfütze (`licht-linsen.cjs:2695`). Wie das aussieht:
  kein Bild. Wege und Platten aus `w28-weg-koerper` tragen kein `pfuetze` (nur geomorph, `stoff-material.js:1966`).
- Die 59 % gelten über 300 Saaten (Kommentar `phyto-core.js:4014`). Die Saat der Ankunft habe ich nicht gerechnet.
- Der Dichte-Faktor ×9 und die Deckung von 0,15 % sind gerechnet, nicht gemessen. Die Kosten des Vorhangs sind ungemessen.
- wetter.K4 (Schnee, #2 ohne Werkzeug) habe ich nicht vertieft. FUND-REGISTER:102 nennt am 07.11. die Bild-Seite von klang.K2 rot
  (r 0,39–0,65), die Stationen stehen heute grün (0,81 / 0,79). Die Heilung habe ich nicht nachgelesen.

## Rang (Wirkung im Bild oder im Takt 1–5 · Aufwand S/M/L · Risiko in einem Satz)
- Wirkung **3**: im Regen und Niesel (≈ 59 % der Spielzeit) sichtbar, auf der Mittags-Bühne nie. Wetter steht unter Feature-Stopp
  (v1: false, `g1.js:80`) und in keinem Pflicht-Eintrag.
- Aufwand **M**: Stufe 1 ist S (ein Kern-Wert plus Beweis), Stufe 3 ist M (TSL-Front im Luft-Knoten).
- Risiko: der Kern-Wert in `foundry-core.js:192` ändert das Labor mit (Byte- und Bild-Beweis beider Seiten nötig), und ein β je
  Pixel darf die Fern-Linsen bei Sonne um kein Byte bewegen (`select` auf Regen > 0).
