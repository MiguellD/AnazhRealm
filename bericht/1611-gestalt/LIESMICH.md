# w28-gestalt — der Satz trägt die Gestalt des nahen Leibs (GTX 1050, Dorf, 16.11.)

Bilder: `vor-14 · vor-9 · vor-5` (Basis e6748dd45 = Kandidat d9740a6b + Steh-Haltung) und `nach-14 · nach-9 · nach-5` (Kopf
f69a1d19), dieselbe Kamera, dieselbe frische Folge 14 → 9 → 5 m, Uhr 12:30. Mitte: Bewohner 1680600477 (Gestalt 7, füllig,
Taille 0,39 der Körperhöhe); links: Bewohner 1658642617 (Gestalt 4, schlank, Taille 0,30). 14 m = Feld, 9 m = Satz, 5 m = Leib.

## (a) Zahl am selben Bewohner, Satz 9 m gegen nahen Leib (bedeckte Breite je Körperhöhe, Abweichung in %)

| Bewohner | Maß | vorher | nachher |
| --- | --- | --- | --- |
| füllig (g7) | Schulter | −8,8 | +3,8 |
| füllig (g7) | Taille | −13,2 | +4,6 |
| füllig (g7) | Hüfte | −18,3 | −2,2 |
| schlank (g4) | Schulter | −15,6 | +0,4 |
| schlank (g4) | Taille | −10,4 | +6,2 |
| schlank (g4) | Hüfte | −18,9 | −7,4 |

Alle acht Gestalten des Dorfs nachher (Poncho): Schulter −0,1 … +4,8 · Taille +4,6 … +12,7 · Hüfte −7,4 … −1,2 %.
Welt der Linse (Pullover, 73 im Satz, 8 Gestalten): Schulter ≤ 2,4 · Taille ≤ 2,0 · Hüfte ≤ 3,8 %.

**Offen, mit Ursache:** unter dem Poncho stehen Taille (bis +12,7 %) und Hüfte (bis −7,4 %) über dem Ziel 5 %. Dem Netz der
Menge (1 700 Dreiecke, Kante 0,21 E) fehlt die Ecke unter dem Arm; die Anlage drückt nur Ecken unter dem Arm ein, die Ecken
vorn und hinten bleiben stehen (Flanke 0,06–0,10 E zu weit). Eine Runde Entspannung tauscht nur Taille gegen Hüfte (Ofen, 40
Bewohner: Taille Median 7,4 → 5,5 %, Hüfte 2,8 → 8,5 %) und ist verworfen. Hände (Faust im Satz, offene Hand am Leib) und das
Feld sind nicht angefasst.

## (c) Kosten Dorf, gepaart vor · nach · vor · nach (`lauf 15`, Tiere gehalten)

| | vorher | nachher |
| --- | --- | --- |
| Bild p50 ms | 16,67 · 16,68 | 16,68 · 16,67 |
| Bild p95 ms | 33,30 · 33,35 | 33,35 · 33,26 |
| Dreiecke im Bild (Mittel) | 357 785 · 356 497 | 356 879 · 357 252 |
| Satz-Leib Dreiecke / Ecken | 1 700 / 949 | 1 700 / 964 |
| Satz Geometrie MB | 0,484 | 0,492 |
| Satz Gang-Puffer / Tafel MB | 0,129 / 0,129 | 0,129 / 0,129 |

## (d) Linse

`gate:kreatur-takt --proben bewohner`: zweites Urteil „die Gestalt des Stands im Satz“ (Soll 5 % je Maß) GRÜN; Selbsttest:
Täter `bewohner-gestalt` (jede Instanz liest die Mitte des Leib-Raums) ROT beim Namen mit 11,3 · 13,1 · 12,4 %.
Kerne: L0 und L1 byte-gleich zur Basis (56 / 23 Netze, drei Läufe).

## Nebenfund (auch an der Basis)

Die Standhöhe eines Bewohners fällt, wenn der Spieler ihm von der Platz-Seite auf 9 m und 5 m nahekommt: 1680600477
38,077 → 37,978 m an der Basis, → 37,923 m am Kopf (Boden 37,592, Soll-Ursprung 38,077) — die Figur steht 10–15 cm im Boden
und bleibt dort, auch zurück im Feld bei 14 m. `nach-9` zeigt den Ansatz (Füße halb im Boden). Nicht aus diesem Schnitt:
die Matrix des Satzes liest nur `g.position.y`.
