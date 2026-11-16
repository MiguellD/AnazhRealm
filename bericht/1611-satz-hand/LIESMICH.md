# w28-satz-hand — die Hand des Satzes ist keine Faust mehr (GTX 1050, Dorf, 16.11.)

Bilder: `vor-14 · vor-9 · vor-5` (Kern von 60e23437, der Standhöhen-Kopf) und `nach-14 · nach-9 · nach-5` (Kopf eb9daf80),
dieselbe Kamera auf Hüfthöhe, dieselbe frische Folge wie im Bericht 1611-stand-hoehe. Mitte 1680600477, links 1658642617;
bei 9 m stehen beide im Satz, bei 5 m die Mitte als naher Leib (offene Hand), links im Satz.

## Wurzel (zwei Fehler einer Klasse: die Hand der Menge war nicht die Hand)

1. **Der Dicken-Zuschlag des Rasters** (`TIER_HAUT.minDicke`, gebaut, damit dünne Glieder der Tiere auf grobem Raster
   nicht verschwinden) hob jeden Finger und Knöchel der Menge auf 0,75 vox. Die Finger liegen unter dem Raster der Menge
   (0,06 E); aufgebläht flossen sie zu EINEM Klumpen in der Ausdehnung der offenen Hand — die Faust. Schnitt: die Hand
   wächst nicht über ihre Gestalt (foundry-core `__mengenPrims`).
2. **Die Hand erbte den Ärmel**: jedes Primitiv nimmt den Teil seines ersten Vorfahren aus einer Kleid-Zone; nennt ein
   Oberteil den Ellbogen (Pullover), goss die Hand, die unter ihm hängt, als Stoff. Schnitt: der Weg zum Teil endet an
   der Hand (wie nah: die Hand-Haut ist ein eigener Guss, der Stoff aus der Haut endet am Handgelenk).

Die Ausdehnung allein trennt die Faust nicht von der offenen Hand (das Dorf im Poncho: Länge +2,7 %, Breite +1,4 %,
Dicke −2,2 % — im Bild die Faust); die bedeckte Fläche tut es.

## Zahl: Hand der Menge gegen die nahe Hand-Haut, bedeckte Fläche jenseits der Naht zum Unterarm (%)

| Fall (Ofen) | vorn vorher | vorn nachher | Seite vorher | Seite nachher | Länge nachher |
| --- | --- | --- | --- | --- | --- |
| Dorf-Vorlage (Poncho) R / L | +39,1 / +35,8 | −9,2 / −1,6 | +40,2 / +24,1 | −9,9 / −18,0 | −16,0 / −3,9 |
| Dorf Gestalt 4 R / L | +39,8 / +36,8 | −6,7 / −1,5 | +41,8 / +27,8 | −7,1 / −10,6 | −16,2 / −4,1 |
| Linse: Hemd · Pullover · Poncho · Frau im Pullover | — | −0,8 … −5,1 | — | −9,7 … −17,6 | −6,6 … −10,7 |

Der Ärmel allein (Vorlage 0x51ed im Pullover, Ausdehnung): Dicke +36 → +2,5 %, Breite +22…+26 → +3 %, Länge +11…+13 → +2 %.

Zerlegt (Dorf-Vorlage, vorn / Seite): nur die Verrundung der Hand-Haut +27…+29 / −0,3…−1,6 % (die Faust bleibt von vorn);
Verrundung und kein Zuschlag zusammen −51…−61 % (die Finger zerfallen auf dem Raster) — verworfen.

**Offen, mit Ursache:** die Hand der Menge ist etwas schlanker und kürzer als nah (Seite bis −18 %, Länge bis −16 % an einer
Hand): das Netz der Menge (1 700 Dreiecke) trägt ~40–60 Dreiecke je Hand, die Vereinfachung schneidet beide Hände verschieden.
Finger und Daumen stehen im Satz nicht einzeln.

## Kosten Dorf, gepaart vor · nach · vor · nach (`lauf 15`, Tiere gehalten)

| | vorher | nachher |
| --- | --- | --- |
| Bild p50 ms | 16,68 · 16,67 | 16,67 · 16,67 |
| Bild p95 ms | 33,36 · 33,28 | 33,37 · 33,39 |
| Satz-Leib Dreiecke / Ecken | 1 700 / 964 | 1 700 / 976 |
| Satz Geometrie MB | 0,492 | 0,497 |

## Linse

`gate:mensch-anatomie`, Urteil `menge.hand` (Hemd, Pullover, Poncho, Frau im Pullover; je Hand Länge ±20 %, bedeckte Fläche
von vorn und von der Seite −20 … +10 %): GRÜN. Selbsttest HM1 (die Zone des Oberteils nennt die Hand: der Ärmel schluckt sie)
ROT beim Namen, vorn +77…+84 %, Seite +93…+99 %. Am Kern vor dem Schnitt ROT (Dorf +24…+42 %).
Kerne: L0 und L1 byte-gleich (56 / 23 Netze); mensch-L2/L3 neu im Ofen-Golden.
