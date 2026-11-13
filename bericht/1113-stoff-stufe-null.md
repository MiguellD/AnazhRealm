# Spike: die Stufen-Übersetzung der Stoffe (Stufe 0 fürs erste Bild) — ZWISCHENSTAND

GTX 1050, 13.11. 15:22–16:20, main 1e00bfdb, echter Renderer ohne DevTools (`frei-sonde.cjs`), Genesis-Ankunft der Sonde.
Kein Schnitt, kein Abgabe-Commit: der Kandidat steht als WIP im Kern auf `w28-stoff-stufe-null` (`_stufeNull` in
`stamm/studio-stoff.js`, der EINE Ort `_renderObjectDirect` in `stamm/bild-kosten.js`); „heute" ist am selben Kopf der
Vergleichs-Eingriff, der die Stufe 0 ruhen lässt. Je Fall drei Paare im Wechsel: Kalt-Boot im frischen Profil, dann der
Zweit-Boot im selben Profil (Platte und Pipeline-Cache warm).

## URTEIL in fünf Sätzen

1. EIN Stoff-Interpreter trägt das erste Bild NICHT voll beleuchtet: die Farbe jeder Art lebt in ihrem Farb-Graphen (Boden:
   Rausch-Gesetz und eigene Attribute, Bäume und Karten: Atlas, Wiese: Graph), aus Daten kommt nur die der Felsen — das erste
   Bild der Stufe 0 ist weiß und ohne Kaskaden-Schatten (Bild 2).
2. Die Zeit, die darin liegt, ist echt: im Bestfall (Licht ganz an der Ecke, die eigenen Programme erst nach dem Bild) fällt
   Bild − Renderer kalt 16,8 → 13,7 s und warm 8,2 → 7,1 s, vor dem Bild 43 → 37 Pipelines, 1,99 → 1,03 MB Text und
   4,06 → 1,25 s Knoten-Bau.
3. Bezahlt wird nach dem Bild: die Ablösung dauert 15 s (14,3–16,3), in ihren ersten 2 s liegt der Bild-Abstand bei 96 statt
   38 ms, die Summe langer Aufgaben steigt 7,1 → 11,0 s, und jedes Ding springt sichtbar von Weiß in seinen Stoff (Bild 3).
4. „Ein Programm" gibt es in r184 nicht: jede Art baut ihren eigenen Grund-Stoff (13 Stück, im Mittel 17,7 KB Fragment plus
   9–29 KB Ecke, ~85 ms Knoten-Bau je Stück), und drei billigere Würfe tragen nicht — Farbe und Licht im Fragment (36–90 KB,
   1,2–3,2 s Übersetzung je Stück in der EINEN Schlange der GPU: das Bild kam nach 26,4 statt 22,2 s), der Farb-Graph an der
   Ecke (11 von 12 Pipelines abgesagt), die Kaskaden im Fragment (28,7–29,0 KB in vier verschiedenen Texten, 0,9–1,4 s je Stück).
5. Die Gegenprobe (b) hilft nicht (kalt 17,9 s, warm 9,2 s — später), und sauber sortiert ist sie nicht: die Fassaden der
   Arenen tragen keine Hülle, 20 von 24 Bauten galten als bildfüllend; solange das erste Bild auf JEDEN Bürger wartet, ändert
   die Reihenfolge ohnehin nur, wer zuerst fertig ist, nie wann alle fertig sind.

## Die Zahlen (Mittel, min–max; n = 3 je Zelle)

| | (a) heute | (b) nach Schirm-Fläche | (c) Stufe 0, Bestfall |
|---|---|---|---|
| **KALT** Bild − Renderer | 16,8 s (16,6–17,1) | 17,9 s (16,9–19,2) | 13,7 s (12,9–14,9) |
| Bild ab Navigation | 21,5 s (20,9–21,9) | 23,2 s (22,7–24,0) | 18,9 s (17,8–20,4) |
| Pipelines vor dem Bild | 43 | 44–45 | 37–38 (davon 13–14 Grund-Stoffe) |
| Programm-Text vor dem Bild | 1,99 MB | 1,99–2,08 MB | 1,01–1,05 MB |
| Knoten-Bau bis zum Bild | 37 / 4 059 ms | 37–38 / 4 264 ms | 18 / 1 246 ms (Grund-Stoffe 1 103 ms) |
| längste Aufgabe vor dem Bild | 460 ms (423–481) | 434 ms (413–461) | 496 ms (475–510) |
| längste Aufgabe nach dem Bild | 312 ms (219–381) | 238 ms (209–265) | 253 ms (249–261) |
| Σ lange Aufgaben, 22 s nach dem Bild | 7,10 s | 7,35 s | 11,0 s (9,9–11,7) |
| Bild-Abstand 0–2 s nach dem Bild (Median) | 38 ms | 38 ms | 96 ms (88–101) |
| Bild-Abstand 2–10 s nach dem Bild | 33 ms | 34 ms | 54 ms (44–61) |
| Ablösung fertig nach dem Bild | — | — | 15,0 s (14,3–16,3) |
| **WARM** Bild − Renderer | 8,24 s (7,91–8,59) | 9,15 s (8,81–9,60) | 7,10 s (6,82–7,51) |
| Bild ab Navigation | 9,82 s (9,48–10,2) | 10,7 s (10,3–11,1) | 8,64 s (8,34–9,07) |
| Pipelines vor dem Bild | 40 | 38–39 | 34 |
| Programm-Text vor dem Bild | 1,86 MB | 1,83–1,86 MB | 0,89 MB |
| Knoten-Bau bis zum Bild | 35 / 2 684 ms | 32–33 / 2 579 ms | 16 / 852 ms (Grund-Stoffe 808 ms) |
| längste Aufgabe vor / nach dem Bild | 452 / 296 ms | 445 / 266 ms | 462 / 325 ms |
| Σ lange Aufgaben, 22 s nach dem Bild | 6,53 s | 6,00 s | 10,3 s (9,5–11,8) |
| Bild-Abstand 0–2 s nach dem Bild (Median) | 70 ms (46–112) | 36 ms | 90 ms (71–102) |
| Ablösung fertig nach dem Bild | — | — | 13,9 s (10,3–21,1) |

Grund-Pipeline bestellt → fertig: kalt 0,58 s (0,56–0,61), warm 0,10 s. Die Bild-Zeit des Grund-Programms gegen die eigenen
ist NICHT einzeln gemessen (keine GPU-Zeitmarken in der Sonde): der Bild-Abstand der Ablöse-Phase trägt den Knoten-Bau der
eigenen Stoffe in Raten mit, nicht nur das Zeichnen.

## Die Bilder (`probe-post/w28-stoff-stufe-null/`)

| Bild | was es zeigt |
|---|---|
| `1-heute-erstbild.jpg` | (a) das erste Weltbild heute, kalt 21,6 s ab Navigation |
| `2-stufe0-erstbild.jpg` | (c) das erste Weltbild in Stufe 0, kalt 17,8 s: Boden, Fern-Ring, Karten und Kronen weiß, ohne Kaskaden-Schatten; nur die Felsen tragen Farbe |
| `3-abloesung-mitte.jpg` | (c) 14,5 s danach, mitten in der Ablösung: der nahe Boden-Satz in seinem Stoff, Fern-Ring und Kronen noch weiß |
| `4-nach-abloesung.jpg` | (c) 20 s nach dem Bild: jeder Bürger in seinem Stoff — dasselbe Bild wie heute |

## Was in die Stufe 0 passt und was nicht (beim Namen)

- Hinein, ohne Farbe: jeder Standard-Stoff dieses Blicks, 13–14 Grund-Stoffe — nach der Liste der eigenen Stoffe sind das
  Boden-Satz, Fern-Ring (frei und Naht, mit geerbter Tiefe), Formationen, Stamm und Krone, Strauch, Nah-Wiese, der
  Karten-Atlas und das Leben; je Grund-Stoff beim Namen gezählt habe ich sie nicht. Ein Ausschnitt liest seine Deckung
  weiter aus dem Farb-Graphen: die teuerste Grund-Pipeline trägt 62,6 KB Fragment (1,4 s kalt).
- Nicht hinein: fünf Grund-Stoffe ohne Szenen-Licht — Himmel, Sonne, der Welt-March des Felds (109 KB), Panorama und sein
  Horizont — und jeder Wurf (der Schatten-Stoff zeichnet keine Farbe). Beobachtet, die Ursache nicht gelesen: in (c) entsteht vor dem
  Bild keine Pipeline eines Schatten-Stoffs (heute mehrere) — ein Teil des Gewinns kann daher kommen. Wasser, Glas und Haar standen in diesem Blick nicht; die Regel schließt
  Durchsichtiges aus.
- Zwei Türen des Weltbilds kannten die Stufe 0 nicht und sind im Kandidaten angeschlossen: der Wartende des Bilds
  (`_erstWartet`) und „Arena ohne Programm" (`_arenaImBild`) — ohne die zweite stand das Bild erst am Deckel (39,1 s).

## OFFEN, ehrlich

- Was den Gewinn tragen würde, ist nicht gebaut: ein Daten-Kanal der Farbe je Art (mittlere Albedo je Ecke oder Instanz) und
  ein Schatten ohne die Kaskaden im Fragment — ein Schnitt durch jeden Stoff-Bauer, kein Zusatz am einen Ort.
- Die 3,1 s kalt bestehen aus dem Knoten-Bau im Haupt-Faden (−2,8 s) und der Übersetzung, die aus der Schlange vor dem Bild
  fällt; ob dasselbe mit den EIGENEN Programmen geht, wenn sie früher bestellt werden (sie sind seit w28-baum-programm je
  Familie eins), ist hier nicht gemessen.
- Nur dieser Blick (Wald am Genesis-Ort), nur diese Karte; Radeon nicht.
- Der Zähler „Bürger in Stufe 0 je Bild" sieht die Draws in Bündeln nicht (das Abspiel ruft den einen Ort nicht) — die
  Ablösung ist darum an den Pipelines gemessen (so viele eigene fertig wie Grund-Stoffe).
- (b) ist nicht sauber sortiert (siehe Satz 5); eine echte Flächen-Ordnung bräuchte die Deckung je Arena aus ihren Gliedern.

Werkzeug: `zug/werkzeug-gtx1050/stoff-spike/` (Paar-Läufer, Mess- und Vergleichs-Eingriffe, Leser der Reihe).
