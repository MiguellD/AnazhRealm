# Zensus der Grundgrößen: origin/main 92b7afd0, nur lesend

Methode: `git grep` auf origin/main über stamm/, die Kerne (cores.manifest.json), worlds/ und die Wurzel-JS (ohne vendor/, scripts/, *.min.js).
Z = Zwillinge: Stellen, die die Größe selbst erzeugen, statt sie vom Kanon zu lesen, gezählt nach Datei. Gleicher Wert zählt mit, wenn die
Stelle einer Gesetz-Änderung nicht folgt (Mars).
L = Leser: Dateien, die den kanonischen Schreiber lesen (`git grep -c`, Summe der Dateien). Stichproben mit Zählung; die Zahlen sind ±20 %.

## 1 Licht/Belichtung — Z 10 · L 16 (65 Rufe von `__weltLicht.*`)
- Kanon: `welt-licht.js:784` `sonnenRichtung`, `:801` `tagAchse`, `:1350` `belichtung` (Bühne), `:130` die Tonkurve (Neutral). Die Welt ruft
  sie: `stamm/bild-himmel.js:1385` (Sonne), `:1964` → `:1950` toneMappingExposure. Uhr → Sonne → Belichtung ist EIN Weg.
- Zwillinge:
  - Labore: `worlds/fachwerk/fachwerk.js:639/642/661` (ACES ×1,12, eigene Sonne, eigene ZEIT-Tafel), `worlds/koerperstudio/koerperstudio.js:83`
    (ACES ×1,0, 2 Lichter), `worlds/terrain/phytogenesis.js:536` (ACES ×1,0, 4 Lichter), `worlds/tetrapoda/tetrapoda.js:186` (ACES ×1,25),
    `worlds/translated/translated.js:104` (Sonne fest).
  - Stamm: `stamm/dirigent-ankunft.js:168` (Belichtung fest 1,0 bis zum ersten Licht-Takt); `stamm/werkstatt-hof.js`, `werkstatt-sozial.js`,
    `werkstatt-vorschau.js:1562` (8 eigene Lichter, NoToneMapping in der Vorschau).
  - `planet-core.js:264/2100/2279`: Neigung und Deklination wirken nur im Klima. Die Welt-Sonne bleibt eine Kreisbahn ohne Breite und
    Saison (z = 0,4·sin(w/2)).
- Befund: 4 von 14 Studios (garage, huelle, portale, schmiede) stehen auf der EINEN Bühne. 5 Labore belichten mit ACES, die Welt mit Neutral.

## 2 Zeit — Z 8 · L 31 (`spielZeit` 196 Stellen; `timeOfDay` 12 Dateien/45)
- Kanon: Der Takt `stamm/dirigent-takt.js:54` treibt `spielZeit += delta`. EIN Uhr-Schreiber ist `stamm/bild-himmel.js:2705` `_uhrSetzen`
  (`tickDayNight` :2588). `tagNull` steht in `stamm/feld-leben.js:2628`.
- Zwillinge:
  - `stamm/daten.js:165` `PEGEL_TAG_S` = 3600 s fest. Der Pegel-Tag folgt nicht dem Tag-Regler `dayLengthMinutes` (1–60, :146–159):
    bei 8 min läuft das Licht 7,5-mal schneller als der Pegel.
  - Saison-Jahr 2400 s, viermal hart geschrieben (`dirigent-kern.js:311`, `bild-himmel.js:933/970`, `speicher-laden.js:543`): ein Jahr
    dauert 2/3 eines 60-min-Tags. `planet-core.js:265` trägt dagegen tagStunden 24 und jahrTage 365.
  - `stamm/kreatur-leben.js:2394/2398`: Der Bestand biegt die Welt-Uhr je Schritt um und setzt sie danach zurück.
  - `stamm/daten.js:143` Wetter-Übergang in ms (45 000); dt-Kopien 1/60: `koerper-bewegung.js:2623` FIXED_DT, `koerper-core.js:8475`,
    `vehicle-core.js:4137`, `kreatur-leben.js:3062/3098`.
  - `worlds/schmiede/schmiede.js`: rund 15 Stellen `clock.getElapsedTime()`. Wanduhr `performance.now|Date.now`: 299 Stellen in 50 Dateien,
    nicht klassiert (meist Kosten-Messung).
- Befund: Für die Tageszeit gibt es genau EINEN Schreiber. Tag, Pegel-Tag und Jahr sind drei voneinander gelöste Längen.

## 3 Gravitation/Fall — Z 12 · L 13 (`state.gravity` 25 Stellen)
- Kanon: `stamm/daten.js:72` `WELT_GESETZ_ERDE.schwere` −9,81 (Mars `:90` −3,71) → `state.gravity` (`feld-leben.js:1786`, DSL
  `feld-dsl.js:964`). Leser sind Leib, Gang, Hüpfer, Kampf, Bau und Kreatur-Stoß.
- Zwillinge:
  - `vehicle-core.js:3080` FAHR.G 9,8, durch `exportDrive` :3547 in die Welt gereicht. Die Welt liest kein state.gravity für den Wagen:
    Auf dem Mars fällt der Wagen mit 9,8 (G1-Bruch).
  - Kerne und Labore: `fachwerk-core.js:11650` BEGEH_GESETZ.g 20 (gelesen in `fachwerk.js:998`); `schmiede-core.js:2260/5040` 9,81 (gelesen
    in `schmiede.js:764/827/1107`); `tetrapoda-core.js:1332` GANG_GESETZ.g 9,81 (Hüpf-v0, Gang :1654); `planet-core.js:264/319` g je Planet,
    ohne Faden zum ULTIVERSUM-Gesetz.
  - Stamm: `stamm/feld-brand.js:696/746` (9,81 als Literal); `stamm/kampf.js:910` (Fallback 0, die Funken schweben); `stamm/bau-buch.js:1874`,
    `bau-teile.js:2566` (Fallback 9,81); `koerper-frei.js:534` (Fallback −9,81).
  - Studios mit eigener Zahl: `garage.js:568` 12, `koerperstudio.js:309` 25, `klang.js:3684` p3.grav.
- Befund: Der Kanon existiert und wird gelesen. Der Wagen ist der einzige Welt-Pfad, der ihn umgeht. Alle Labore fallen eigen.

## 4 Bewegungs-Integration — Z 14 · L 6 (`_leibTakt()` 24 Rufe; kein Kanon für den Rest)
- Teil-Kanon: der Leib-Löser `koerper-core.js:5900` `leibFall` (+ KCC), nur der Spieler und die Leiber, die ihn rufen.
- Eigene Integratoren (die Regex fand 25 Stellen in 15 Dateien, Untergrenze):
  - Tiere: `kreatur-verhalten.js:1085` (x/z += v·h) und `:3601` (Hüpfer mit eigener Ballistik), `tetrapoda-core.js:2698` (Gier × Tempo),
    `kreatur-leben.js:3081` (z += tempo·dt).
  - Körper und Dinge: `koerper-leib.js:1894` (Glieder), `koerper-frei.js:1137–1142` (freie Körper, semi-implizit), `kampf.js:919–922`
    (Funken), `vehicle-core.js:3791/3826–3859` (Feder, Wagen-Fallkurve), `schmiede-core.js:5127` (Gerät), `koerper-core.js:6339` (Bahn).
  - Studios: schmiede.js ×4, garage.js ×2, koerperstudio.js ×2, fachwerk.js:998, klang.js:3684, tetrapoda.js. Wasser: Zellen-Automat.
- Befund: Jede bewegte Klasse integriert selbst. Schrittweite, Deckel (−25 m/s nur im Leib) und Schwere-Quelle unterscheiden sich.

## 5 Kontakt/Reibung/Haftung — Z 5 · L 11 (`this._stoff(` 28 Rufe)
- Kanon: Stoff-Zeile `mu/muRad/muRadNass` aus der Wirts-Tafel `stamm/bau-vorlagen.js:1620` (SI). Sie ist NICHT schmiede-core
  `STOFF_GESETZ`; nur η kommt von dort (:1700).
- Leser: `koerper-frei.js:316–329` (Körper und Boden), `kreatur-verhalten.js:1121` (Stoß), `koerper-fahrt.js:1826` (Rad), Klang-Schritt.
- Zwillinge:
  - `schmiede-core.js:2813–2821`: eigene mu-Tafel (holz 0,35 · stein 0,5 · erde 0,4).
  - `koerper-core.js:5399`: Rutschen mit Reibung 0,35 als Konstante. Der Spieler-Leib liest keinen Boden-Stoff.
  - `vehicle-core.js:3083/3171/3320` (maxGrip 1,0, gripK 6, Lab-Reibkreis neben dem Host-Pfad), `:3148` (Rollreibung 0,013).
  - `koerper-fahrt.js:1833–1840`: Die Rad-Haftung mischt nach `_bodenSichtAt().gruen`, also aus der Sicht-Deckung statt aus dem Stoff.

## 6 Maß/Skala — Z 7 · L 6
- Kanon: keiner als Größe (1 Einheit = 1 m ist implizit). `tetrapoda-core.js:3943` MASSSTAB meterJeEinheit 1/3, gelesen von
  `koerper-leib.js:2484` und `bau-vorlagen.js:1571`.
- Zwillinge:
  - Augenhöhe `dirigent-kern.js:1997` EGO_AUGE_M 1,6 (5 Dateien), fest. Der Körper rechnet sein Auge selbst (`koerper-core.js:2110`), die
    Kamera liest es nicht.
  - `fachwerk-core.js:11648/11855` (eyeY 1,62, augeM 1,6), `schmiede.js:400` (eyeY 1,62), `klang-core.js:441` (augeM 1,7),
    `siedlung-bewohner.js:3967` (kopfM 1,8), `vegetation-streu.js:2911` (mengeKoerperM 1,8), `koerper-fahrt.js:3249` (1,5).

## 7 Samen/Zufall — Z 13 · L 18
- Der Sim-Pfad des Stamms ist sauber: 13 Math.random in 4 Dateien, alle für Namen, IDs, Netz und Klang. In den Studios stehen 63 in 11 Dateien
  (klang 21, koerperstudio 11, fachwerk 6 davon Rauch-Teilchen :1068, phytogenesis 5).
- Kein Samen-Baum (Welt-Samen → benannter Teil-Strom). Stattdessen:
  - mulberry32 kopiert, 17 Stellen in 13 Dateien: `foundry-core.js:8`, `phyto-core.js:18/561/2719`, `porta-core.js:212`, `klang-core.js:537`,
    `fachwerk-core.js:6731`, `schmiede-core.js:4208`, `bild-himmel.js:330`, `klang.js:1235`, `vegetation-baum.js:1326`,
    `vegetation-wiese.js:140/1368`, `huelle.js:63`, `worlds/klang/klang.js:38`.
  - Je Kopie ein eigener Text→Zahl-Hash (×31 in `bild-himmel.js:326`; Hash-Konstanten in 27 Dateien).
  - Geteilter Strom: `_samenStrom` (`siedlung-ort.js:1384`, 8 Rufe/5 Dateien); `feld-dsl.js:52` gibt EINEN rng an alle Ops eines Satzes
    (`_werkOrtSuchen` :1157/1260). Eine neue Ziehung verschiebt die Orte der folgenden Ops.

## 8 Sicht/Stufe — Z 10 · L 16 (`_lodAuge(` 26 Rufe; LOD_SCHIRM/DISTANCES 14 Dateien)
- Kanon: EIN Auge `stoff-material.js:3278` `_lodAuge` und das Schirm-Gesetz `vegetation-streu.js:2907` LOD_SCHIRM (px 1 @ 1080).
- Eigene Ketten: `gelaende-boden.js:3205` (BODEN_STUFEN, Distanz/CDLOD), `foundry-core.js:3170` (HALM_STUFEN), `phyto-core.js:2372/3904`
  (stufenRezept, STUFEN_BILD_PX), `schmiede-core.js:4154` (ARENA_STUFEN), `worlds/gelaende/makro-worker.js:71` (STUFEN),
  `siedlung-bauten.js` (12 Stufen-Methoden, eigenes Verdeckungs-Gitter :82–117), `siedlung-instanz.js:434`.
- 51 Stufen-Methoden in 17 Stamm-Dateien. 7 eigene Frustum-Objekte, davon zwei gleichnamige `_frustumCache` (`dirigent-takt.js:1073`,
  `feld-leben.js:24`). 21 Studio-Dateien tragen eigene LOD-Logik.

## Rangliste Z × L

| Größe | Z | L | Z × L |
|---|---|---|---|
| Zeit | 8 | 31 | 248 |
| Samen | 13 | 18 | 234 |
| Licht | 10 | 16 | 160 |
| Sicht/Stufe | 10 | 16 | 160 |
| Gravitation | 12 | 13 | 156 |
| Bewegung | 14 | 6 | 84 (L klein, weil es keinen Kanon gibt) |
| Kontakt | 5 | 11 | 55 |
| Maß | 7 | 6 | 42 |

Licht steht vor Stufe, weil es bei gleichem Produkt den sichtbaren Bruch Labor ≠ Welt trägt (ACES gegen Neutral, 5 Labore). Gravitation liegt
4 Punkte dahinter und trägt den einzigen Welt-Bruch der Physik-Gruppe: Der Wagen ignoriert das Mars-Gesetz.

## Die drei Schnitte: je EIN Gesetz
- **ZEIT:** EIN Welt-Kalender im Kern (planet-core `tagStunden`/`jahrTage`). `spielZeit` ist die einzige laufende Größe. Tag, Pegel-Tag und
  Saison-Jahr sind reine Funktionen von spielZeit ÷ Tag-Länge, kein Leser hält eigene 3600 s oder 2400 s, dt kommt aus EINEM FIXED_DT.
- **SAMEN:** EIN Samen-Baum `samen(pfad)`: Er leitet aus dem Welt-Samen je Name (`"nexus"`, `"dsl:op:n"`, `"baum:x:z"`) einen eigenen Strom
  per Hash ab. mulberry32 lebt einmal im Kern, jede der 13 Kopien ruft ihn, und Math.random fällt aus jedem Sim-Pfad.
- **LICHT:** welt-licht.js `buehne` ist die einzige Quelle für Sonne, Belichtung und Tonkurve, auch für die 5 Labore und die Werkstatt.
  Die Sonnenrichtung rechnet aus planet-core Neigung × Breite × Saison statt aus der Kreisbahn.
