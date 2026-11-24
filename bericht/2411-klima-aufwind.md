# klima-aufwind — Vorprüfung (ZWISCHENSTAND)

Zweig `klima-aufwind` von origin/main 499f8b57 (V18.546.403), EIN Schreiber: `planet-core.js` (VERSION planet-h2-15), dazu die Linse
in `scripts/diag-planet.cjs`. Karte 2 gebucht 83 von 1 718. Diese Abgabe bucht keine Sprosse — gebucht wird erst, wenn der Richter im
Zweig `punkte-maschine` sie grün misst.

**Geschnitten:** der Hang-Aufwind ist Gesetz in `planetKlimaR` (planet-core.js:2238): was die Säule über einem Anstieg verliert, fällt
dort — der Regen des Luv-Hangs ist dieselbe Menge, die windab als Sperre fehlt (lineares Modell nach Smith & Barstad 2004, Quelle und
Band im Gesetz zitiert, planet-core.js:2086–2104). EINE Quelle für Luv und Lee: die Sperrhöhe der Säule (planet-core.js:2318); der
Föhn nimmt dem Lee e^(−Abstieg/1,5 km), die zweite Kamm-Schranke aus drei nahen Schritten (e^(−d/800 km), `leeKm`) fiel. Die nahen
Luft-Schritte (100 … 300 km) lesen das Relief am Fuß ihres Schritts (`klimaRelief`, planet-core.js:2237) statt der Hülle am Fuß
400 km; ihre Küste bleibt die der Hülle (`kuesteHuelle`, planet-core.js:2236 — sonst wandert die Heimat). **Gemessen:** die Linse
`klima.aufwind` (Heimat, 291 Kämme) Median Luv/Lee 1,56 → 2,49; der Zensus über 12 Saaten und 2 252 Kämme 1,37 → 1,61, Anteil ≥ 2
von 31 % auf 42 %. **Ehrlich offen:** #1 und #2 erreicht der Schnitt NICHT auf allen Saaten (1,61 gegen ≥ 2; Rang 0,29 gegen ≥ 0,7),
#5 bleibt offen (Lee −2,1 % gegen −50 %), und der Schnitt hat einen Preis im Flachland: die Sprünge des Niederschlags auf 20 km
verdoppeln sich (Richter gesicht, zwei Zeilen, beide schon an main rot).

## Die Sprossen (vorher → nachher, Export, gleiche Saaten)

| Sprosse | vorher (main) | nachher | Soll | Stand |
| --- | --- | --- | --- | --- |
| `planet.kopplung.land-meer-luft#1` Luv/Lee an Ketten, 12 Saaten, 2 252 Kämme (¾-Punkt) | 1,37 | 1,61 | ≥ 2 | offen: 80 % des Solls |
| dasselbe, Anteil der Kämme ≥ 2 | 31 % | 42 % | — | — |
| dasselbe, Kämme mit Abfall ≥ 3 km (987) | 1,67 | 2,31 | ≥ 2 | erreicht |
| dasselbe, Breite 35–50° (985) | 1,88 | 2,49 | ≥ 2 | erreicht |
| dasselbe, Breite 25–35° (551) · 50–65° (702) | 1,20 · 1,16 | 1,34 · 1,30 | ≥ 2 | offen |
| dasselbe, wie die Station heute misst (±42/52°, 147 Kämme) | 1,22 | 1,33 | ≥ 2 | offen |
| dasselbe an der Heimat, Linse `klima.aufwind` (291 Kämme) | 1,56 | 2,49 | ≥ 2 | grün; Luv über seinem Vorland 77 %, Lee unter dem Kamm 96 % |
| `planet.kopplung.land-meer-luft#2` Rang der Trockenheit je 10°-Gürtel, wie die Station (8 Saaten) | 0,23 | 0,29 | ≥ 0,7 | offen: 42 % des Solls |
| dasselbe längs des Winds gelesen | 0,39 | 0,51 | ≥ 0,7 | offen |
| `planet.kopplung.land-meer-luft#5` Lee der 60 höchsten Kämme nach 1 Ma Hebung | −0,8 % | −2,1 % | −50 % | offen: die Hebung (962 m Median) trägt das Lee nicht |
| Richter bau2 `klima.regenschatten` (30 Saaten, 1 696 Abschnitte ≥ 2:1) | 38 % | 43 % | ≥ 80 % | offen |
| Richter bau2 `klima.gegenlauf` (trockene Seite wechselt mit dem Drehsinn) | 61 % | 60 % | ≥ 80 % | offen, unbewegt |
| Köppen-Klassen (A · B · C · D · E) | 13,3 · 32,0 · 9,4 · 27,6 · 17,4 % | 13,2 · 32,1 · 10,2 · 26,6 · 17,5 % | Bänder | grün, unbewegt |

## Der Preis (Richter gesicht, beide Zeilen schon an main rot)

| Zeile | vorher (main) | nachher | Soll |
| --- | --- | --- | --- |
| `klima.sprung20` p99 der Sprünge zwischen Flachland-Paaren auf 20 km (Median der Saaten) | 158 mm | 320 mm | ≤ 40 mm |
| dasselbe, größter Sprung | 2 042 mm | 6 492 mm | ≤ 80 mm |
| `klima.kante.flach` | 2,39 % | 4,14 % | ≤ 1,0 % |

Wurzel des Preises, gemessen: die Luft-Schritte stehen im Takt von 100 km, der Hub fällt im Schritt seines Aufstiegs — am Fuß einer
Kette springt der Regen von Knoten zu Knoten. Eine erste Kante fiel im Zug (die Sperre liest ihren Meer-Anteil an der Höhe des
Schritts: erde-01 p99 377 → 244 mm), der Rest ist der Takt. Die zehn übrigen roten Zeilen des Richters gesicht sind unbewegt.
Kosten: + 9,2 µs je Land-Abfrage des Klimas, die Zeile der Kosten bleibt grün.

## Die Linse und ihre Täter

`klima.aufwind` in `scripts/diag-planet.cjs` (`aufwindZeile`, :1463; in der Familie `--anker`): Median Luv/Lee ≥ 2 über ≥ 40 Kämme,
Luv über seinem Vorland ≥ 70 %. Drei Täter fallen beim Namen (`--anker --selftest`): „ohne Aufwind“ → 1,92 · „das Lee ohne die
Säule“ → 1,38 · „die Schritte an der Hülle“ → 1,91.

## Die Wände

- `node scripts/diag-planet.cjs` (welle1) GRÜN 61 s · `--selftest` GRÜN 55 s · `--anker` GRÜN 8 s · `--anker --selftest` GRÜN 20 s ·
  `--bytes` GRÜN 143 s · `node scripts/stamm-umzug.cjs --lint` GRÜN (keine Stamm-Datei geändert) — am Kern-Stand des Kopfes.
- `npm run check:statik` GRÜN · `node scripts/diag-kopplung.cjs` GRÜN 36 s und `gate:wetter-wache` unter dem GPU-Schloss der GTX 1050.
- Das Bild (vier Felder über EINER Kette der Heimat, Export): im Zweig `koordination` unter probe-post/klima-aufwind/kette-bogen-gegen.png —
  Relief mit Wind · Niederschlag main · Niederschlag Schnitt · Schnitt mit umgekehrtem Drehsinn. Was ich sehe: an main trägt der
  Bogen einen schwachen grünen Saum, am Schnitt steht der Luv-Hang im Nordwesten blau und das Becken hinter dem Kamm fahl; mit
  umgekehrtem Wind wechselt die nasse Seite auf die Ost-Flanke. Im Vorland stehen in allen drei Feldern feine Strahlen im Takt der
  Knoten — der Preis oben, sichtbar.

## Ehrlich offen (Sprosse · Grund · Messname · Leser)

- **#1 Luv/Lee ≥ 2 auf allen Saaten** · flache Kämme (Abfall 0,8–1,5 km: 1,27) und die Breiten außerhalb 35–50° tragen wenig Wind quer
  zum Kamm · `luvLee` · die Station im Zweig `punkte-maschine`.
- **#2 Rang ≥ 0,7** · der Schatten erklärt mehr (0,34 → 0,49), der Gürtel-Regen selbst bleibt die größere Streuung · `rang`.
- **#5 Lee −50 %** · mit dem stärkeren Lee senkt 1 Ma Hebung das Lee um 2,1 % statt 0,8 % — die Schwelle bleibt fern · `leeProzent`.
- **Sprünge im Flachland** · der Takt der Luft-Schritte (100 km) · `klima.sprung20` · `planetKlimaR`.
