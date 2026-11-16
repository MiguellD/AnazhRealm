# Leser 2: alte Stationen gegen Karte 2, mittleres Drittel

**Rechnung** (`leser2-liste.cjs`, dann der Split in `leser2-bau.cjs`): Ich lade die Arrays aus `meisterkarte-quelle/punkte/stationen/g1–g6.js` (304 Einträge). Davon fallen 15 aus `module.exports.fehlt` weg (sie haben kein befehl) und 11, die nicht zur alten Karte gehören (pflicht 3, breite 3, karte2 5). Es bleiben **278 Stations-Einträge in 33 Familien**. Die Familien sind alphabetisch sortiert, die Schnitte liegen an den kumulierten Zahlen, die N/3 und 2N/3 am nächsten sind.
- Stück 1 (91): affekt 8 · ankunft 6 · bauen 10 · fahrzeug 8 · feld 9 · ferne 7 · gelaende 10 · haar 6 · halten 10 · ki 7 · klang 10
- **Stück 2 (94), meins:** leib 10 · licht 7 · lod 6 · luftwasser 13 · material 7 · mensch 8 · oekologie 10 · physik 8 · pipeline 9 · profiband 10 · schatten 6
- Stück 3 (93): siedlung 10 · speicher 10 · spielgang 6 · stoffe 9 · streaming 7 · studios 10 · tiere 9 · tore 4 · ultiversum 9 · vegetation 7 · wetter 12

**Zahlen:** 94 Einträge mit 91 Kennungen. Drei Kennungen stehen doppelt, je einmal headless und einmal als GPU-Station: luftwasser.K3#1, K3#2 und K4#1. Die Kennungen verteilen sich so:
- 1 gleich
- 41 Stationen mit teil (41 teil-Zeilen)
- 3 schon vollständig in der richter-tafel: mensch.K2#2, luftwasser.K3#1, luftwasser.K4#1
- 47 keine

**Der Maßstab** ist R2 der Karte: headless hebt nie. Darum ist eine Station, die nur headless läuft, höchstens „teil“, auch wenn ihr Satz wörtlich passt. Geschwister-Staffeln, die nur eine Teilmenge einer gelisteten Station messen, zählen als keine.

## gleich

| Station (Stand R/G) | Sprosse | Sprosse wörtlich | Station wörtlich |
|---|---|---|---|
| profiband.K5#2 (ROT/ROT, ohne Zahl) | same.preis.ausdauer S3 | „U: 20 min, Weg ≥ 5 km, Tor, Nacht · T: VRAM-Drift ≤ 2 MB · R: 20-min-Spielgang, beide Geräte“ | „2 = an beiden“. Das Urteil k5Richter (g6.js:3566) verlangt ≥ 20 min, Drift ×1,05, VRAM ≤ 2 MB zurück am Start, Heap ≤ 5 MB/min, Weg ≥ 5 km, gefahren, Nacht, Bau und Tor |

Zwei Vorbehalte. Erstens steht „P an G2 + G3“ in der Karte, ohne dass ich eine Definition von G2/G3 gefunden habe. Zweitens zählt S3 nach der Lücken-Regel erst, wenn S1 und S2 stehen. Für S1 ist dieselbe Station nur teil (siehe unten).

## Die fünf lohnendsten teil, jeweils mit dem fehlenden Glied

1. **erleben.spieler.praesenz S1**: leib.K1#1 (Taste → Leib p95 ≤ 50 ms), leib.K2#1 (Fuß p95 ≤ 3 cm am 25°-Hang, GRÜN/GRÜN) und leib.K4#1 (0 Fels-Pixel im Third, GRÜN/GRÜN) messen je ein Glied. Es fehlt EIN 2-min-Gang je Gerät, der alle drei Zahlen zugleich trägt (eine karte2-Station aus drei bestehenden Proben). ERSTE-RICHTER hatte nur leib.K2 geprüft.
2. **leben.oeko.dynamik S1** (oekologie.K1#2) und **leben.oeko.netz S1** (oekologie.K1#1): Richter und Schwelle sind wörtlich gleich, 8 Saaten, Stunde 2 → 8. Es fehlt nur, dass dieselbe Rechnung im echten Fenster an der GPU läuft statt headless.
3. **erleben.bild.flaeche S1**: Das Halbschatten-Glied trägt schatten.K1#2 (2,1 cm am Fuß, Zuwachs 0,76–0,96 cm/m, GRÜN/GRÜN). Es fehlt das Albedo-Glied „±0,05 gegen Tabellenwert für Gras, Erde, Fels, Holz, Haut“ im selben Lauf. material.K1#1 misst es heute mit anderer Schwelle und steht ohne Zahl.
4. **erleben.bild.nacht S1** (schatten.K5#1): Der Satz „Schatten-Kontrast ≥ 3:1 an einem Pfosten 2 m vom Feuer“ ist wörtlich die Station. Es fehlt das zweite Glied „Gasse in der Kelvin-Farbe ±200 K“, außerdem steht die Station an der Radeon ohne Messung.
5. **same.preis.takt S3**: profiband.K1#1 misst p95 ≤ 33 ms je Bewegungszelle (Gehen, Sprint, Fahrt, Sturm, Stadt-Gasse), profiband.K4#2 misst 0 Frames > 100 ms. Es fehlt ein Lauf, der beides in jeder Zelle zugleich urteilt. S1 (stehend) misst keine Station dieser Familien.

Knapp dahinter liegen fünf weitere:
- mensch.leib.gesicht S1 (mensch.K4#1): 10 Samen statt EINES Kopfs.
- mensch.geist.gespraech S1 (mensch.K5#1): 10² statt 4 Begegnungen.
- planet.kosmos.himmelsmechanik S1 (licht.K1#1): das zweite Gerät fehlt.
- planet.kosmos.welten S1 (licht.K2#1): die Fremdwelt fehlt.
- leben.wasser.netz S1 (luftwasser.K3#2): Der Hub ist gemessen, 0,081/0,207 m, also 0,39. Die Schwelle verlangt ≥ 0,8, und kein Urteil liest sie.

## Widerspruch mit Beleg

ERSTE-RICHTER nennt mensch.sport.koerper S1 „Richter … an beiden Geräten grün“. Die einzige Station meines Drittels auf dieser Leiter ist leib.K2#2. Sie misst Sprunghöhe und Sprungweite samt deren Mutation, aber weder das Tempo noch den Vergleich „gegen Eichwert ± 10 %“. Für mich ist das teil, nicht gleich.

## Nicht gefunden

- Die Definition von G2/G3 in der Preis-Treppe.
- Eine Station für same.preis.takt S1/S2 (stehend), same.preis.eingabe S1 und same.physik.tragen S1 in meinem Drittel.
