# Vorprüfung rennofen 1 — `karte2.mensch.wirtschaft.energie#1` (Gutsdorf um 1300, Zensus-Rang 11)

ZWISCHENSTAND: Geschnitten · Gemessen (Zahl) · Karte 2 gebucht 105 von 1 718 (die Buchung macht der Koordinator). Basis: main
804ca10 (eingemergt); gemessen an main e1a54023 (Täter) und am Zweig. Der Kopf ist der Commit, der diese Datei trägt.

**Geschnitten:** Der Rennofen hat jetzt zwei Bestände, die Erz-Halde und den Holzkohle-Stapel. Eine Ofenreise lädt Erz und Kohle
nach dem Stoff-Gesetz und gibt am Ende die Luppe. Ohne Kohle beginnt keine Reise, also gibt es keinen Barren. Das Gesetz steht
EINMAL im Kern: schmiede `STOFFSTROM.feuer`, koerper `_ofenreisen`. Der Wirt liest es nur und zeichnet den Stapel als
Schüttkegel neben dem Schmied, gegenüber seinen Barren-Kisten.

**Gemessen:**
- **main:** 34 Barren aus 941,7 kg Erz bei 0 kg Brennstoff (Linse D8 ROT beim Namen).
- **Kopf:** Gegenlauf mit leerem Stapel ergibt 0 Barren.
- **Dorf, 7 Tage:** Stapel 682,6 → 307,6 kg, −25 kg je Schmelze. Bilanzfehler 0.

**Halb (4 von 5 Beweisen, 80 %):** Das Bildpaar zeigt nur die Gestalt. Hier läuft der swiftshader-WebGL2-Rückfall; am echten GPU
ist der Look ungemessen. stoffstrom#1 bleibt offen (Grund unten).

## Die Station, wörtlich (Zweig `punkte-maschine`, die Stationen der Wirtschaft, F.leiter „mensch.wirtschaft.energie“)

- **Karte:** `| 1 | Muskel und Feuer | Ofen kostet Holz | P · Dorf | Holzstapel sinkt je Schmelze; ohne Holz kein Barren |`
- **Soll und Umfang:**
  ```
  1: { umfang: { soll: 1, wort: "Feuer mit Brennstoff (Schmelze)" }, masse: [{ key: "holz", wort: "Änderung des Holzstapels je Schmelze", soll: 0, richtung: "<" }, { key: "ohneHolz", wort: "Gegenlauf: Barren ohne Holz", soll: 0, richtung: "≤" }], erwartet: "leser", fehlt: "kein Brennstoff", wo: "stamm/feld-leben.js:3121" }
  ```
- **Messe (der Leser heute):**
  ```
  await K.messort("stadt-voll");
  … await K.schritt(1, async () => K.leser(1, { n: z().schmieden, fehlt: "kein Brennstoff: das Feuer der Esse ist eine Konstante (feuerK 1573 K), es frisst kein Holz, und keine Schmelze gibt einen Barren (" + z().schmieden + " Schmieden)", wo: "stamm/feld-leben.js:3121" }));
  ```
- **Der Kandidat:** `cloud-post/rennofen-station/energie-1.js`. Er tauscht nur den `K.leser(1, …)`-Ruf gegen
  `K.zahl(1, { werte: { holz, ohneHolz } })` und legt die Seiten-Funktion `RENNOFEN` dazu. Soll und Richter-Text bleiben,
  wie sie sind.
  - `RENNOFEN` liest den Wirt `_stoffstromZensus` an der nächsten Kette, sieben gestaffelte Tage weit.
  - Der Gegenlauf ist dieselbe Kette des Kerns auf Kopien der Öfen, mit leerem Stapel.
  - In der Welt gefahren: 15 geladene Ofenreisen, `holz` −25 kg (Soll < 0), `ohneHolz` 0 (Soll ≤ 0).
  - Der Messort der Station ist stadt-voll. Diese Metropole trägt keine Schmiede (Bericht `stoffstrom-kette`). Dort antwortet der
    Kandidat mit `leser` „kein Rennofen am Messort“. Den Messort mit Schmiede wählt der Koordinator.

## Miss zuerst (main e1a54023)

| Messung | Ergebnis |
| --- | --- |
| Täter | `koerper stoffstromFassen`. Die Esse verhüttete stetig `esseKgJeStunde` aus der Halde, ohne Feuer. |
| Lauf über 7 Tage | 34 Barren gegossen, 176,82 kg Luppe, 0 kg Kohle |
| Woher kam die Energie? | Aus keiner Quelle. Die Esse des Spielers (`stamm/feld-leben.js` `ESSE.feuerK` 1 573 K) wärmt nur gehaltenen Stahl. |
| Die Linse von main (neuer Text) | ROT: „D8 Barren ohne Kohle: mit leerem Stapel 34 Barren gegossen, 176.82 kg Luppe … — die Esse verhüttet ohne Feuer (koerper stoffstromFassen)“, dazu D9 und D10 |

## Der Schnitt (Datei:Zeile)

- **`schmiede-core.js:3404` `STOFFSTROM.FEUER` / `feuer(kg)`** (additiv)
  - Erz und Holzkohle gehen zu gleichen Gewichten in den Schacht (`kohleJeErz` 1).
  - Die Energie leitet sich aus der Zeile der Kohle ab: Formel `glut` = C, `molMasse`, ΔfH° CO₂ −393,51 kJ/mol. Das ergibt
    32,76 MJ je kg Kohle.
  - Der Wirt trägt keine eigene Zahl.
- **`koerper-core.js:6251` `BESTAND_GESETZ.stoffstrom.reiseH` 5**
  - Eine Ofenreise lädt `esseKgJeStunde · reiseH` = 25 kg Erz.
  - Der Stapel trägt `haldeTage` Tage Arbeit seiner Öfen, aus einem eigenen Wurf aus dem Samen („kohle“).
  - `stoffstromHalter` (:6463) verlangt `kohleJeErz` und wirft ohne.
  - `_ofenreisen` (:6494) ersetzt die stetige Verhüttung in `stoffstromFassen`: Laden aus Halde und Stapel, Luppe am Ende der
    Reise, ohne Ladung `kalt`.
- **`stamm/siedlung-bewohner.js`**
  - `_stoffstromAnlegen` (:1360) reicht `feuer(1).kohle` weiter. Der Stapel steht am ersten freien Fuß der Ringe um das Werk,
    zuerst gegenüber den Barren, nie in Haus oder Bau, zuerst auch nicht auf dem Weg.
  - `_stoffstromZensus` (:1458) gibt aus: Stapel, verbrannte Kohle, Reisen, im Schacht, kalte Stunden, MJ.
  - `_stoffstromBild` (:1524) zeichnet Halde UND Stapel. Beide sind Kegel aus `stoffstromHaldeForm`, auf dem EINEN Bau-Pfad,
    die Kohle in `FEUER.kohleTon` (am Mesh 0x342b24), weil der Stoff `glut` leuchtet.
  - `_bestandFort` räumt beide.
- **Die Linse `gate:koerper-kern` Teil D** (`scripts/diag-koerper-kern.cjs:614`)
  - D8: Barren ohne Kohle, ein Gegenlauf mit leerem Stapel.
  - D9: Der Stapel sinkt je Reise, verbrannt = Erz × `kohleJeErz`.
  - D10: Das Feuer trägt den Reduktions-Kohlenstoff.
  - D4 rechnet das Erz im Schacht ab. D7 vergleicht auch Stapel und Reisen.
  - Neue Mutanten: „ohneKohle“ und „stapelVoll“. Der Selbsttest erkennt alle 46.

## Gemessen

**Die Linse (Kern, 7 Tage, 2 Öfen):**
- Halde 1 432,8 → 482,8 kg.
- 36 Ofenreisen, Stapel 1 789,1 → 839,1 kg, also 950 kg verbrannt (31 124 MJ).
- Luppe 168,98 kg, 32 Barren.
- Gegenlauf ohne Kohle: 0 Barren.
- `--selftest` und Lauf mit `EXIT=0`.

**Die Welt (Werkbank, Gutsdorf „dorf 7 18“ am Anker der Stadt, Mitte 740,4/415,9, 112 Bewohner, 1 Schmiede):**
- Halde am Aufschluss 648/130, 300 m von der Mitte.
- Der Stapel liegt 3,43 m vom Werk; der Fuß ist frei.

| Tag | Halde kg | Stapel kg | Reisen (fertig + im Schacht) | Luppe kg | Barren gegossen · am Ofen | Werkzeug |
| --- | --- | --- | --- | --- | --- | --- |
| 0 | 546,7 | 682,6 | 0 | 0 | 0 · 0 | 0 |
| 1 | 471,7 | 607,6 | 2 + 1 | 9,388 | 1 · 0 | 1 |
| 3 | 371,7 | 507,6 | 6 + 1 | 28,164 | 5 · 4 | 7 |
| 5 | 271,7 | 407,6 | 10 + 1 | 46,940 | 9 · 7 | 14 |
| 7 | 171,7 | 307,6 | 14 + 1 | 65,716 | 13 · 11 | 21 |

**Die Massen-Bilanz über 7 Tage:**
- Erz und Kohle: Erz ein 375 kg. Kohle ein 375 kg.
- Was im Ofen geschah: 350 kg verhüttet, 25 kg liegen noch im Schacht.
- Luppe: 65,716 kg = 350 × 0,18776, **Fehler 0** (Soll ≤ 1 %).
- Elementbilanz: 350 Erz + 17,597 Reduktions-C = 65,716 Fe + 237,404 Schlacke + 64,477 CO₂ (**Fehler 0**).
- Energie: 12 285,9 MJ, also 174,5 MJ je kg Luppe.
- Der Ofen stand 0 h kalt: der Stapel trägt noch 307,6 kg.

**Gestalt:**
- Stapel-Kegel r 1,533 → 1,176 m, h 1,155 → 0,886 m.
- Barren-Kisten am Ofen 0 → 3.

**Das Bild** liegt in `cloud-post/rennofen-bild/`: `tag0-…-swiftshader-webgl2-direkt.jpg` ↔ `tag7-…`. Pose: Kamera 6 m diagonal
vor dem Werk (780,98 / +1,7 m / 452,59), der Blick zwischen Werk und Stapel.
- Ein WebGPU-Adapter fehlt in diesem Container: der GPU-Prozess stürzt unter jeder Flagge.
- Der WebGL2-Rückfall baut hier den nahen Boden nicht (`_bodenSichtAt` null).
- Der Ausgabe-Pfad gab ein auf dem Kopf stehendes, ausgebranntes Bild ohne das Dorf.
- Das Paar ist darum ein Direkt-Render ohne Post-Kette: der Kegel schrumpft, drei Kisten erscheinen.
- Es beweist Gestalt und Lage, nicht den Look.

**Kosten am Dorf:**
- Je Ort ein Mesh, 24 Dreiecke, Schatten-Werfer: höchstens 1 Befehl je Pass.
- Gezeichnet nur ≤ 60 m vom Auge (`BESTAND_BILD.nahM`).
- Das Fassen rechnet nur die Raster-Schritte seit dem letzten Leser.
- Das A/B (mit ↔ ohne Stapel) geht hier im Strom der Welt unter: an derselben Pose stiegen die Dreiecke in sechs Renders von
  124 700 auf 233 059 und die Befehle von 65 auf 71.
- Am echten GPU ungemessen.

## Die Bänder (äußere Quelle mit Zahl → das Gesetz zitiert sie)

- **WIRG, Experimental Bloomery 4:** „equal weights of ore and charcoal“, 15–20 kg je Reise in ≈ 5 h. Daraus `kohleJeErz` 1 und
  `reiseH` 5.
- **Cleere 1969, Horam, Schmelze 2:** 91 kg Erz und 98,6 kg Kohle ohne Vorwärmung ergaben 8,8 kg Luppe und 63 kg Schlacke.
  - Schlacke je kg Erz: Gesetz 0,678, Cleere 0,692 (−2 %).
  - Kohle je kg Luppe: Gesetz 5,3, Cleere 11,2. Die Erklärung steht unter Ehrlich offen.
- **NIST-JANAF:** ΔfH° CO₂(g) −393,51 kJ/mol.
- **Gefallen, weil in dieser Bahn nicht belegt:** jede Zahl von Crew.

## Ehrlich offen

- **Die Spalte `q`:** Das Gesetz liest die Energie nicht aus `q` der Kohle. Die Spalte `q` ist die Energie einer Ladung; die
  Druckwelle liest sie, und ein Heizwert dort machte die Kohle zum Sprengstoff. Die Energie folgt aus der Formel der Zeile `glut`.
- **Die Ausbeute:** Sie bleibt die Elementbilanz des Welt-Erzes (56 % Fe): 18,8 % der Erzmasse statt ≈ 10 % (Wealden-Erz,
  Cleere 9,7 %). Die Fe-Ausbringung liegt mit 33,5 % über den ≈ 24 % der Versuche.
  - Das Band der Ausbringung ist ungeeicht.
  - Folge: 174,5 MJ je kg Luppe gegen 367 MJ bei Cleere (Faktor 2,1).
  - Die Kohle der Vorwärmung zählt nicht.
- **Niemand liefert nach:** `tagesPlan` (koerper-core) kennt die Rollen schmiede, kirche, gasthaus, kaufhaus, kontor, haendler,
  fahrer, nachtfahrer, werk, waechter und nachtwaechter. Es gibt keinen Köhler und keinen Bergmann. Ist ein Bestand leer, steht der
  Ofen ehrlich kalt (`kaltH`); im Dorf geschieht das nach 7 Tagen noch nicht.
- **stoffstrom#1 nicht genommen:** 23 Bewohner tragen das Beil im Zustand, aber 0 von 112 Leibern tragen hier ein Rig (die Träger
  stehen 8 m vom Auge). Darum zeigt `_stoffstromHand` kein Werkzeug in der Hand. Am echten GPU ungemessen.
- **Das Bild:** Der Look ist am echten GPU ungemessen. Eine `bild:`-Probe trägt nur Messorte, und stadt-voll hat keine Schmiede.
  Die Halde liegt 300 m vom Ofen am Aufschluss und steht nicht im 6-m-Bild.
- **Der Cache-Buster:** Der `?v=`-Träger ist nicht gestuft; die Versions-Stufe macht main.
