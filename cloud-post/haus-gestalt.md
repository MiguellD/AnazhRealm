# haus-gestalt — Abgabe (ZWISCHENSTAND)

Zweig `haus-gestalt` von origin/main f18576b6. Sprosse `karte2.mensch.bau.bauen#1` (fachwerk Labor ↔ Welt an derselben Kamera,
98,0 %, Soll ≤ 2,1 %). Diese Abgabe bucht keine Sprosse: gebucht wird erst, wenn der Richter im Zweig `punkte-maschine` sie grün
misst. Karte 2 gebucht 83 von 1 718 (`vision/karte-2-stand.json` im Zweig `punkte-maschine`).

## Der Schnitt: die Bauweise folgt dem Klima

Die Region eines Dorfs ohne Wort war ein freier Wurf über den Planeten (fachwerk-core `DORF`, die Zeile
`r<.30?'mitteleuropa': … :'antik'`). Am Messort `dorf` der Heimat (Winter −4 °C, Sommer 18 °C, gelaende-core `ortGesetz(teil).klimaHeute`)
stand deshalb ein antikes Dorf: 14 griechische und 2 römische Häuser in Kykladen-Putz mit einer Dachneigung von 18°, im Schnee.
Jetzt wählt der Wurf nur aus den Regionen, deren Klima-Band den Ort trägt (fachwerk-core `REGION_KLIMA`, `regionImKlima`). Das Klima kommt
über den EINEN Kanal des Exports: `_foundryRequestSettlement` → `d.klima = this._siedlungKlima()` (stamm/siedlung-ort.js). Dieselbe Quelle
speist das Viertel-Wort (`_viertelInfo`) und die Kachel-Massen der Stadt (stamm/siedlung-wege.js, beide Aufrufe von `kachelMassen`).
Ohne Klima, also im Labor und bei einem Plan ohne Ort, würfelt der Kern wie bisher. Der Byte-Beweis: der sha256 über 6 Exporte
(7/18, 4291161376/13, 1/18, 3/10, 42/60, 9/200) und 3 Kacheln der Stadt 501/2000 ist gleich, c31204c7cdb89380 auf beiden Seiten.

| | vorher (f18576b6) | nachher |
|---|---|---|
| Messort dorf (Same 4291161376, 13 Häuser + Kirche/Gasthaus/Schmiede/Scheunen) | antik: griechisch 14, roemisch 2 · Stil stein 16 | nordisch: russisch 13, norwegisch 4 · Stil huette 17 |
| Dachneigung am Messort (alle Rollen) | Mittel 19,9°, Median 18° | Mittel 41,5°, Median 43° |
| 200 Dörfer im Heimat-Klima | jede Region möglich (mediterran, fernost, antik) | mitteleuropa 106, alpin 53, nordisch 41 |

## Das Bild am Messort (Radeon 890M, WebGPU, Uhr 0,5, dieselbe Kamera −715,86 49,01 −932,69 → −695,90 49,01 −931,40)

| | vorher (f18576b6) | nachher |
|---|---|---|
| ms (Bild) | 441 | 373 |
| Draw-Calls | 61 | 77 |
| Dreiecke | 395 097 | 438 641 |

- Vorher zeigt das Bild weiße dreigeschossige Putz-Kuben mit blauem Flachdach.
- Nachher zeigt es Holzhäuser mit sichtbarem Ständer- und Riegelraster: das Holz ist dunkel, die Dächer steil (etwa 45°), dazu ein
  Schornstein und ein Kirchturm mit Spitzhelm.
- Die Kosten steigen um 16 Draw-Calls und 11 % Dreiecke. Grund: am Messort stehen mehr Teile (Turm, Hölzer). Die Bildzeit fällt
  dabei, die Kosten hängen also am Schirm, nicht an der Weltgröße.

Je Merkmal im Bild, gegen Studio und Foto (Molfsee, Michelau):

- Tragwerk ja: Ständer, Riegel und Andreaskreuz stehen.
- Gefach ja, aber Holz-Brett, kein Ziegel und kein Lehm.
- Sockel nein, nicht lesbar.
- Dachform ja, steil.
- Dachdeckung ja: Brett/Schindel, kein Reet.
- Fenster ja, mit Sprossenkreuz.
- Tür nicht im Bild.
- Schornstein ja.
- Alterung nein.
- Stoff ja: Holz statt Putz.

## Die Gegenprobe (gate:settlement Teil R, mit Selbsttest)

Eingang ist das Klima des Orts aus gelaende-core `ortGesetz(teil).klimaHeute` (TEMPERATUR, gelaende-core.js:1313). Gemessen werden
200 Saaten mit je 18 Häusern:

- In der Heimat (−4/18) liegt die mittlere Dachneigung bei 49,6°, am Mittelmeer-Ort (10/27) bei 25,1°, am subpolaren Ort (−12/14)
  bei 44,4°.
- Fachwerk (Stil `alt`) steht in der Heimat an 2 011 Häusern, am Mittelmeer-Ort an keinem.
- Die Mutante „der Kern liest das Klima nicht“ fällt ROT in R1 (fremde Regionen in allen drei Klimaten). Auch R3 fällt: 40,2° gegen 40,2°.
- `node scripts/diag-settlement.cjs --nur-r` braucht 0,2 s.

## Die Quellen (mit Zahl)

- Klima-Normalen WMO 1961–1990 (kältester/wärmster Monat): Berlin −0,5/19, Frankfurt 1/20, London 5/18, Innsbruck −2/18, Davos −6/12,
  Rom 8/25, Athen 10/28, Marseille 7/24, Oslo −4/17, Helsinki −5/18, Moskau −7/19, Tokio 5/26, Peking −3/27, Sapporo −4/22.
- Kottek u. a. 2006, Köppen-Geiger, Meteorol. Z. 15: 259–263: die Grenze C/D liegt bei −3 °C im kältesten Monat.
- Dachneigung je Deckung: Reet ≥ 45° (BauNetz Wissen „Reet und Stroh“,
  https://www.baunetzwissen.de/geneigtes-dach/fachwissen/dachdeckungen/reet-und-stroh-158485; Landkreis Rostock 40–45°,
  https://www.lk-row.de/medien/dokumente/reetdach_voraussetzungen_fuer_eine_vergabe_von_foerdermitteln.pdf). Schiefer 26,5°
  (https://de.wikipedia.org/wiki/Dachneigung). Mönch-Nonne ≥ 40° (https://www.baunetzwissen.de/glossar/m/moench--und-nonnendeckung-49119).
- Schneelast nach EN 1991-1-3: μ1 = 0,8·(60°−α)/30° (https://structuralbasics.com/how-to-calculate-the-snow-load-of-a-pitched-roof). Ein
  steiles Dach trägt im Schnee-Klima weniger Last.
- Fachwerk-Maße nach Esselborn 1908 (https://digital.ub.uni-paderborn.de/download/pdf/3184978.pdf):
  - Schwelle 14/26–32 cm, Ständer 14/16–18 cm, Riegel 12/14–14/14 cm.
  - Vorkragung bis 40 cm ohne Knagge.
- Fachwerk-Maße nach Marx 1891 (https://digital.ub.uni-paderborn.de/download/pdf/7576894.pdf):
  - Ständerabstand im Mittel 1 m.
  - Gefach 1,5–2,5 m².
  - Sockel 50–60 cm gegen das Spritzwasser.
- Referenzfotos (Wikimedia Commons), nur angesehen:
  - Molfsee Reetdach, <https://commons.wikimedia.org/wiki/File:Fachwerkhaus_mit_bemoostem_Reetdach_in_fr%C3%BChem_Abendlicht,%5FFreilichtmuseum%5FMolfsee%5F-%5Fpanoramio.jpg>
    — Ziegel-Gefach im Läuferverband, Ständer etwa im Meter-Raster, niedriger Feldstein-Sockel, tief gezogenes Reet.
  - Michelau, https://commons.wikimedia.org/wiki/File:Michelau_Schiefer%2BFachwerk.JPG — Wetterseite verschiefert, Traufseite Sichtfachwerk,
    Vorkragung über den Balkenköpfen.
  - Ziegelausfachung, https://commons.wikimedia.org/wiki/File:Ziegelausfachung.jpg — Holz silbergrau verwittert.
  - Alsfeld Untergasse 22, https://commons.wikimedia.org/wiki/File:Alsfeld_Untergasse_22.jpg — Sandstein-Sockel etwa 0,6 m, Neigung etwa 55–60°.
- Profis der Verfahren: Müller u. a. 2006, CGA shape, ACM TOG 25(3): 614–623 (Repeat-Split mit Zielbreite); Kelly & Wonka 2011, Procedural
  Extrusions, ACM TOG 30(2) (Neigung je Kante).

## OFFEN (je Punkt: Grund · Messname · Leser)

- K4 Labor ↔ Welt 98,0 %. Grund: die Sprosse misst das Studio-Werk `viktorianisch` an der Pose, nicht das Dorf, und dieser Schnitt
  ändert den Stempel nicht. Die Silhouetten decken sich zu 99,4 %, der Rest ist Luma: die Bühne liegt im Kunstlicht, die Welt im
  Sonnenlicht mit Schatten am Giebel (Bildpaar der Station vom 17.11.). Mein eigener Nachbau der Welt-Seite stand mit der Kamera im Haus
(Abstand 4,98 m vom Fuß, Abnahme ROT) und ist kein gültiges Bild. Messname: studios.K4 · Leser: der Richter `punkte-maschine`.
- Alpin darf auf Meereshöhe stehen. Grund: das Klima-Band liest die Höhe nicht. Eingang: gelaende-core Höhe/Relief des Orts ·
  Messname: gate:settlement R (Erweiterung) · Leser: `regionImKlima`.
- Dachneigung = f(Deckung, Schneelast): `KULTUR.pitch` ist eine Konstante je Kultur (fachwerk-core.js, KULTUR-Tafel). Eingang: Klima
  winter/Schnee · Messname: gate:settlement R3 · Leser: `bauRezept`.
- Traufe 0,42 m, Ortgang 0,32 m, Sockel 0,55 m und Ständer 0,16 m sind Konstanten (fachwerk-core.js:201–204). Für Traufe und Ortgang
  gibt es keine Zahl (Quelle unbelegt); der Sockel 50–60 cm ist belegt (Marx). Eingang: der Niederschlag (planet-core `niederschlagMm`,
  von der Welt bisher nicht gelesen) · Messname: gate:haus-welt · Leser: `HAUS`.
- Die Wetterseite als f(Fassadennormale · Regenwind): Eingang wind-saison · Messname offen · Leser `HAUS`.
- Die Gefach-Füllung und die Holzart als f(Boden, Bestand): Eingang gelaende-core Boden, phyto-core Bestand · Leser `HAUS`.
- Die L2 der Fachwerk-Häuser verliert den Backstein: der Körper hat einen Stoff, die Hölzer liegen als aWand-Gewebe (lod2Koerper) ·
  Messname: studios.K4 Albedo · Leser `lod2Koerper`.
- Unbelegt, nie geschätzt: Geschosshöhe, Dachüberstand an Traufe und Ortgang, Schindel-Neigung, Türen, Schornstein, Sprossenteilung,
  Kirche/Schmiede/Gasthaus als eigene Maßtypen.
- Der Messort der Heimat wird nordisch: Blockbau (huette), kein Fachwerk. Grund: −4 °C liegt im Band von nordisch, mitteleuropa und
  alpin, und der Same 4291161376 fällt auf nordisch. Fachwerk steht in 2 011 von 4 520 Häusern über 200 Saaten im Heimat-Klima.
