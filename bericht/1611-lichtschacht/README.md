# Lichtschacht (w28-lichtschacht) — Bildpaare und Preis, GTX 1060, 16.11.

Vorher = main 9c9c9bd3, nachher = Kopf e8115a41 (Läufe `p3/n1611/fuge/f7`, `f12`, `f15-nach` an OMEN).

## Geschnitten

- EIN Helfer Welt → screenUV (`_schirmUV`, bild-sicht.js). Leser: Godray-Pegel (dirigent-takt), `_spiegelUmgebung`,
  `_spiegelPass` (uvP · uvE · uvI), der Kontakt-Leser (bild-schatten), der Wasser-Spiegel (wasser-hydro).
  Falsch lag nur der Godray-Pegel: Sonnen-Ziel im Schirm (0,5 · 0,632) statt (0,5 · 0,368).
- Quelle nur Himmel: dieselbe Maske wie die Farbsicht (`istWelt` über die Szenen-Tiefe), Lücken der Krone bleiben Quelle.
- Versatz je Pixel; der Marsch (20 Schritte, Farbe + Tiefe) als EIGENER Pass in Viertel-Ausgabe (`_godrayStufe`,
  `GODRAY.skala` 0,25 → 480 × 270), die Ausgabe liest ihn bilinear.

## Bilder

| Pose | vorher | nachher |
|---|---|---|
| Raum 08 Uhr | raum-8-vorher.png | raum-8-nachher.png |
| Raum 12 Uhr | raum-12-vorher.png | raum-12-nachher.png |
| Raum 17 Uhr | raum-17-vorher.png (ohne Godrays: raum-17-vorher-ohne-godray.png) | raum-17-nachher.png, raum-17-nachher-zoom.png |
| draußen d20, gegen die tiefe Sonne | draussen-d20-vorher.png | draussen-d20-nachher.png (ohne: draussen-d20-ohne-godray.png) |
| draußen d60 | draussen-d60-vorher.png | draussen-d60-nachher.png (ohne: draussen-d60-ohne-godray.png) |

Raum 17: vorher steigt eine gestufte Treppe vom Fenster zur Decke (zur gespiegelten Sonne), nachher fällt der Schacht vom
Fenster weg von der Sonne. Draußen fallen die Strahlen von der Sonne weg; geänderte Pixel d20 9,83 → 9,35 %, d60 18,31 → 21,08 %.

## Preis (Frame an − aus, ms, p50)

| Stand | d20 | d60 |
|---|---|---|
| main | +0,62 | +0,70 |
| Marsch voll aufgelöst in der Ausgabe (51f9f6ea, verworfen) | +4,16 | +4,37 |
| eigener Pass halb (960 × 540), 2 Läufe | +1,71 · +1,60 | +1,71 · +1,59 |
| eigener Pass viertel, 4 Läufe (f14, f15) | +0,85 · +0,05 · +0,92 · +0,69 | +0,85 · +0,67 · +0,86 · +0,29 |

Die Streuung zwischen Läufen derselben Lage liegt bei etwa ± 0,4 ms; viertel liegt im Band von main.

## Offen

- Der Rand des Schachts im Raum trägt Korn und Zähne (Versatz je Pixel in Viertel-Ausgabe, raum-17-nachher-zoom.png).
- Das brennende Fenster × 22,9 (Belichtung innen) ist nicht Teil dieses Schnitts.
- Die Fuge (p3) meldet einen Ausfall der Post-Kette nicht selbst rot (Lauf k86 war deshalb wertlos).
