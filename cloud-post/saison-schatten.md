# saison-schatten — Abgabe an den Koordinator (24.11.)

Geschnitten: die Phänologie je Art ist EIN Gesetz in phyto-core.js (`PHAENO_GESETZ`, die Grünland-Temperatursumme nach Ernst und Loeper 1976 aus dem EINEN Jahresgang des Orts, Schwellen aus den DWD-Jahresmeldern 1991 bis 2020), und `_saisonPraesenz` wie der Stoff (`_jahrLage` über `userData.jahrArt`) lesen dieselbe Kurve je Art; die Nässe am Ort ist eine Funktion (`_naesseAm`: Welt-Film mal örtliche Trocken-Rate, der Schatten aus dem Dach-Pool und der Sonne des Lichts, Diffus-Anteil 0,2 nach Liu und Jordan 1960), die `_fahrHaft` und der Stoff (`_naesseOrtKnoten`) gleich lesen.

Gemessen (node am Wirt, gleiche Bedingung wie der Zensus des Vorgängers): Rang des Kalenders je Art 0 auf 0,975 (Hasel Woche 5, Erle 6, Birke 10, Buche 11, Eiche 11); die Gasse mit κ ab 0,99 weicht 3,541° ab (299 Stücke, Gegenlauf 49,11°, Platz 43,836° über 381 Stücke) statt 30,645° im Mittel ohne Haus; die Pfütze trocknet im Hausschatten 2,63-mal so lange wie in der Sonne (1633 s zu 621 s) statt Zeuge 0.

Offen: die Hasel trägt kein eigenes Laub im DWD-Netz und folgt mit dem Laub dem Bestand (Buche), sie erwacht mit ihrer Blüte (Sprosse leben.pflanzen.jahreslauf#2, Messname rang, Leser `_saisonPraesenz`); der Schatten kennt nur die acht Häuser des Dach-Pools am Auge (Sprosse planet.kopplung.stadtklima#1, Messname schattenTrockenVerh, Leser `_hausSchatten`); die Linse F8 in diag-kopplung lief nur in node, das Bild bleibt der Radeon.

## Linsen

- diag-season-meadow F7: Rang je Art ab 0,8; Selbsttest „eine Kurve für jede Art“ und „Stoff ohne Art“ stehen ROT am Täter.
- diag-kopplung F8: Trocken-Zeit Schatten zu Sonne über 1,5; der Mutant ohne Hausschatten steht ROT.

## Stationen

Die Stationen meisterkarte-quelle/punkte/stationen/k2-leben.js und meisterkarte-quelle/punkte/stationen/k2-zusammenspiel.js (Zweig `punkte-maschine`) tragen den Schnitt im Zweig `pm-saison-schatten`.
