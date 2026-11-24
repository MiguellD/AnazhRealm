# Vorprüfung auge-der-art 2 — das Auge der Art aus dem Leib, Entdeckung ≠ Alarm

ZWISCHENSTAND: Geschnitten · Gemessen (Zahl) · Karte 2 gebucht 78 von 1 718. Diese Abgabe bucht keine Sprosse — gebucht wird
erst, wenn der Richter im Zweig `punkte-maschine` sie grün misst (Stationen im Zweig `pm-auge-der-art`).

**Geschnitten:** EIN Sinnes-Gesetz im Kern (`tetrapoda-core.js` `SINNES_GESETZ`):

- Der Fang kommt aus den Zapfen-Kurven, die Schärfe aus der Augenlänge des Leibs.
- Die Entdeckung ist Riccò × Koschmieder durch die EINE Luft der Welt (`_luftSichtM`).
- Zwei Zapfen sehen Blau-Gelb nach Viénot 1999.

Zwei Leser:

- `_kreaturSiehtM` sagt, OB ein Tier den Spieler oder einen hetzenden Jäger sieht.
- Die Ausgabe `auge` der Post-Kette zeigt die Welt durch die Zapfen einer Art.

Der eine `noticeRadius` 22 m fiel, ebenso seine vier Kopien in den Rezepten.

**Heilung der ersten Vorprüfung (59080c51, vier Röten, EIN Täter):** Die Wariness rampte über die ganze Sichtweite (Hirsch 685 m,
Gigant 2 283 m) statt über die Nähe. Auf 90 m stand der scheue Hirsch bei +0,80 und der kühne bei −0,84, neugierig auf dem Weg
zum Spieler. Der hetzende Jäger trug den Flucht-Radius der Sicht: der Hirsch floh ab 1 066 m und lief r + 2,2 r ≈ 3,4 km weit.
Jetzt gilt **Entdeckung ≠ Alarm**: das Auge sagt OB, zwei Maße sagen AB WELCHER NÄHE.

- Die Aura rampt über ihre Reichweite `auraReichM` (tetrapoda, abgeleitet: die scheueste Natur erreicht die Flucht-Schwelle
  genau am `fleeRadius`, 14 / ⅔ = 21 m).
- Die Flucht vor dem Menschen im pfad, vor dem hetzenden Jäger und vor der Glut liest die Fluchtdistanz der Gattung (Feldmaß,
  `FURCHT_GESETZ.fluchtDistanzM`).

Über die Fluchtdistanz gerampt fürchtete der Verband den Spieler 50 m vor dem Radius seiner Flucht: er zog, statt zu ruhen, und
die zweite Hand riss. Das Auge wird nur in Reichweite gefragt, der Boden unter dem Ziel je Ort am Ziel gemerkt.

| Röte                                                                     | vorher                                    | nachher                                             | Probe                                                                                    |
| ------------------------------------------------------------------------ | ----------------------------------------- | --------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| Voller Playtest, Tier-Separation                                         | „Anker nicht initialisiert“               | Alle Invarianten OK                                 | `node scripts/playtest.cjs` lokal; die Bühne steht ab der Fluchtdistanz                  |
| Daten-Vertrag v7, tetrapoda                                              | sha 8138b919 ≠ Golden                     | 9115267c geprägt                                    | Byte-Beweis: 4 Pfade, `noticeRadius` 22 → fort in wolf · fox · bear · deer               |
| Kreatur-Linse Teil 2 (Absturz NATIV) und gate:kreatur-takt 595 s > 480 s | Fluchten bis ≈ 3,4 km                     | Flucht in der Fluchtdistanz                         | `--proben furcht` GRÜN (Kontrolle 117,6 m · geschlagen 371,7 m · gefüttert 0 m)          |
| herde · tagesbudget (Teil 2, lokal unter dem ersten Schnitt)             | zweite Hand 0 von 4 · der Wolf ruht 0,014 | zweite Hand 4 von 4 · der Wolf ruht 0,600           | `--proben herde,tagesbudget` GRÜN 173 s; Trünke 10 · 10 · 10 · 10 · 8 · …, 118 am Wasser |
| Die Jagd (der hetzende Jäger trägt die Fluchtdistanz)                    | —                                         | Rudel 16 / 60 = 0,27 · Kitz 20 / 20 · 1 Wolf 0 / 20 | `--proben jagdkreis,mahl,rudel` GRÜN (Band 0,2–0,4 · 0,6–1 · 0–0,1, MacNulty 2012)       |

Lokal auf Idle neben der GTX-Sitzung, Null-Renderer:

- `--selftest --proben herde,tagesbudget,furcht` GRÜN: 19 von 19 Tätern ROT beim Namen, der Grund in 3 von 3 Proben grün (311 s).
- `--proben jagd,kaskade` GRÜN: 4 Risse mit dem Jäger, die acht Saaten im Band (467 s).

Die Zeit an der GPU (Deckel 480 s) misst erst die Probe dieses Kopfs.

## Je Sprosse: Stand an der GTX (Station `pm-auge-der-art`, lauf-e)

| Sprosse                   | Stand                                                                                 | Täter / Beleg                                                                                   |
| ------------------------- | ------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| `erleben.sinne.gesehen#3` | GRÜN: Wolf 1 290 m, Mensch 5 684 m (77,3 %), Bildpaar Hund ↔ Mensch an derselben Pose | —                                                                                               |
| `erleben.sinne.gesehen#1` | ROT 22,6 %                                                                            | Orange und Grün gleicher Leuchtdichte liegen im Auge des Hirschs 26,4 ↔ 45,7 Schritte vom Boden |
| `erleben.sinne.gesehen#2` | ROT −18 %                                                                             | die Böden der Welt um die Beute sind im Wolfs-Auge zu gleich (53 ↔ 82,4 Schritte)               |
| `erleben.sinne.genom#1`   | ROT 0,5                                                                               | die Witterung ist EIN Radius 50 m (`scentRangeM`) — kein Nasen-Gesetz                           |
| `erleben.sinne.genom#2`   | ROT 0,333                                                                             | Augenlänge Wolf 27,2 mm außer dem Band 21–21,7 mm (Nema 2025)                                   |
| `erleben.sinne.sicht#1`   | ROT 0 von 12                                                                          | der Stoff der Blüte trägt kein UV-Albedo                                                        |

**Ehrlich offen:**

- Die Nase (`scentRangeM` 50 m): Widerspruch mit Zahl gemeldet. Yee 2016 nennt die Riechschleimhaut, kein Schwellen-Band für
  die Gattungen der Saat.
- Der Alarm als eigener Leser: Sika-Hirsch Alarm 80 m (Hirobe & Senzaki 2026). Das Spiel trägt kein Sichern je Blick.
- Die Augapfel-Größen im Guss (Bär 52,6 · Hirsch 34,9 · Wolf 27,2 mm) liegen über den Bändern der Quellen.
