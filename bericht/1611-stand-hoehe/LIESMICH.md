# w28-stand-hoehe — die Sohle steht in Feld, Satz und Leib auf ihrem Boden (GTX 1050, Dorf, 16.11.)

Bilder: `vor-14 · vor-9 · vor-5` (Basis 25fbeb9a, der Gestalt-Kopf) und `nach-14 · nach-9 · nach-5` (Kopf 1c861031), dieselbe
Kamera (Gegenseite, Blick auf die Füße), dieselbe frische Folge: Annäherung von der Platz-Seite 14 → 9 → 5 m, dann das Trio
von der Gegenseite 14 → 9 → 5 m. Mitte: Bewohner 1680600477 (am Hang 0,5 m/m), links: Bewohner 1658642617 (ebener Stand).

## Wurzel

Die Höhe schreiben nur `_bewohnerStellen` (Geburt, Ankunft) und `_bewohnerSchritt`; Feld, Satz und Leib lesen alle drei nur
`g.position.y`. Der Schritt hielt seinen Grund je halben Meter als EINE Zahl: wer dem Spieler ausweicht (1,5 m hinaus und
zurück), kam mit dem Grund eines Punkts 23 cm daneben an seinen Stand zurück — am Hang 12–16 cm tiefer — und blieb dort.
Schnitt an der EINEN Quelle: der gehaltene Grund ist eine Schräge (Höhe + Gefälle entlang des Gangs aus dem Halt davor), ihr
Halt hängt am Abstand zum Auge (1 cm je Meter, höchstens der halbe Meter), wer steht, liest genau an seinem Punkt.

## Zahl: Sohle gegen den Boden ihres Punkts (mm), derselbe Bewohner in jeder Stufe

| Schritt der Folge | Stufe | vorher | nachher |
| --- | --- | --- | --- |
| Platz-Seite 14 m | Feld | 0 | 0 |
| Platz-Seite 9 m | Feld | −131 | −6 |
| Platz-Seite 5 m | Leib | −146 | −6 |
| Gegenseite 14 m | Feld | −146 | −6 |
| Gegenseite 9 m | Satz | −146 | −6 |
| Gegenseite 5 m | Leib | −84 | −6 |

Der zweite Bewohner (ebener Stand) steht in jeder Zeile vorher und nachher bei 0 mm. Die −6 mm sind der Feld-Scan des
Schritts (er endet bis `BEWOHNER.sohleM` 8 mm unter der Kante), in jeder Stufe dieselbe Zahl: Differenz zwischen den Stufen 0 mm.

Im Gehen (das Ausweichen, 264 ↔ 274 Schritte): Sohle gegen Boden im Mittel 55,3 → 1,9 mm, größter Abstand 258 → 39 mm,
Schritte über 1 cm 67,8 → 1,8 %.

## Kosten Dorf

| | vorher | nachher |
| --- | --- | --- |
| Bild p50 ms (`lauf 15`, gepaart vor · nach · vor · nach) | 16,67 · 16,67 | 16,67 · 16,67 |
| Bild p95 ms | 33,33 · 33,24 | 33,35 · 33,34 |
| Boden-Leser je Schritt (24,1 µs je Leser) | 0,08 | 0,61–0,74 |
| Boden-Leser ms je Bild, Folge mit zwei Ausweichenden (274 Schritte in 1 200 Bildern) | 0,0005 | 0,004 |
| je gehendem Bewohner unter 14 m, ms je Bild | 0,002 | 0,016 |

Im stehenden Dorf des `lauf` geht kein Bewohner (0 Schritte in 900 Bildern, vorher wie nachher): der CPU-Takt des Laufs
(p50 12,91 · 12,58 ↔ 13,44 · 12,99 ms) trägt keinen Leser dieses Schnitts. Zehn Gehende unter 14 m kosten 0,16 ms je Bild;
fern (ab 50 m) hält der Grund den halben Meter wie zuvor.

## Linse

`gate:kreatur-takt --proben bewohner`, Urteil „der Stand nach dem Gang“ (die Sohle ≤ 10 mm vom Boden ihres Punkts, einmal je
Halt gelesen): GRÜN mit 498 und 843 Halten, 0 über 1 cm, größter Abstand 8 mm. Selbsttest: Täter `bewohner-grund` (der Schritt
liest seinen Grund am Raster des halben Meters) ROT beim Namen, 186 von 490 Halten über 1 cm.
