# Stand-Blatt wetter-lagen (Sprosse `karte2.planet.wetter.lagen#2`) — oberster Abschnitt = jüngster Stand

## 27.11. — Schub 2: der Prototyp der Lage hält die Station (headless), der Schnitt in phyto-core läuft

- Prototyp (EINE Phase ζ des Durchzugs längs der Zug-Koordinate s, Zyklus 40 Takte; Front-Stärke, Druck und Drehung lesen dieselbe ζ; die drei alten Wellen nur noch als Textur): **stimmt 0 % → 86 %**, Drehung ≥ 15° 0 % → 98 %, Druckfall 0 → 88 %, Abfolge 52 → 88 %, 50 von 50 Passagen; die 7 Fehl-Passagen sind Fenster, deren erster Regen der Schauer des Nebentrogs hinter der Kaltfront ist (Druck steigt dort — richtig so).
- Verteilung der Zeilen alt → neu: klar 27 → 44 % · nebel 15 → 24 % · bewoelkt 21 → 17 % · regen 25 → 13 % · sturm 13 → 3 % (nass 38 → 16 %).
- Band: Bjerknes & Solberg 1922 (Ci → As → Ns, Druckfall vor der Front, Rechtsdrehung an der Front, Schauer dahinter); Hess & Brezowsky 1952 / Gerstengarbe & Werner 2010 (PIK 119): Lage ≥ 3 Tage, häufigste Andauer 3 Tage, WZ 15,7 % des Jahres; Kaltfront-Drehung Beispiel 225° → 290°.
- Offen jetzt: Schnitt in `phyto-core.js` (wetterAt · windRichtung · windWeg · frontVerteilung), Linse in gate:wetter-wache, check:statik.

## 27.11. — Sitzung 3, Schub 1: die Täter-Zahl am heutigen main 52937c92

**Die rote Zeile gilt am heutigen main.** Akte `vision/richter/planet.wetter.lagen.2.f0a89f7e-gtx.json` (GTX 1060, 23.11.), wörtlich:

> S2 Umfang nicht erzeugbar: kein Druckfeld und keine Wolkengattung (Cirrus, Nimbostratus) in der Welt — das Wetter am Ort ist ein Wort aus drei Sinus-Wellen (phyto-core.js:4423 wetterAt), der Druckfall ist nicht messbar · stimmtProzent 0 % gegen Soll ≥ 80 % ✗ · passagen 50 gegen Soll ≥ 50 ✓ · Täter: phyto-core.js wetterAt (drei Sinus-Wellen, kein Druck, keine Gattung)

**Nachgerechnet headless am Kern von 52937c92** (der Mess-Leib FRONT_AN der Station `k2-planet.js:5125`, Ort (0, 0), Heimat, 50 Saaten `wetter-s0…49`, 400 Takte à 120 s):

| Maß | Wert am main | Soll |
|---|---|---|
| passagen | 50 | ≥ 50 ✓ |
| stimmtProzent | **0 %** | ≥ 80 % ✗ |
| abfolgeProzent (Decke steigt + Schauer) | 52 % (anstieg 26 / 50, schauer 50 / 50) | — |
| drehungProzent (rechts ≥ 15° über ±3 Takte) | **0 %** | — |
| Druck an der Passage | **0 von 50** (die Zeile trägt `zeile,front,feuchte`) | Zeuge ≥ 50 |

**Täter mit Datei:Zeile:**
- `phyto-core.js:5053` `wetterAt` — die Front ist die Summe dreier unabhängiger Sinus-Wellen (6 600 · 4 100 · 2 500 m, `WIND_FELD.front`, :4928), die mit `zugMS` 11 m/s ziehen: kein Druckfeld, kein geordneter Durchzug (vor dem Regen steht in 24 von 50 Passagen klar oder Nebel statt einer Decke, die sich verdichtet).
- `phyto-core.js:4965` `windRichtung(saat, t)` — die Richtung ist ein Mäander der Uhr allein (±41°, Perioden 698 s und 244 s), blind für die Front: die Drehung über ±3 Takte am Regenbeginn liegt in allen 50 Passagen unter 15°.

**Der Schnitt (P, eine Zeile):** Chokepoint `wetterAt` + `windRichtung` im Kern — die Front wird ein Durchzug mit Profil (Bjerknes & Solberg 1922: Druckfall vor der Front, Aufzug der Decke, Regen, Rechtsdrehung des Winds an der Front, Schauer dahinter); Druck und Drehung folgen aus DERSELBEN Front-Koordinate, kein zweiter Wetter-Weg. Leser bleiben `_wetterAmOrt` / `_wetterFeldAm` / `_windDirAt`; `_boeWeg` und `_windAt` (Bahn `rauch-nan`) fasse ich nicht an.

Karte 2 gebucht 149 von 1 718 · Status ZWISCHENSTAND.
