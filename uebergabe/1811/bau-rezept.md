# Stand w28-bau-rezept (18.11.)

Zweig `vorrat12-bau-rezept` (von origin/main 21f279f5) · Kopf `36dfe5c92b` (gepusht, WIP, [skip ci]) · Baum welle3/nachtbild.

## Was steht (Zahl)
- Kopf 1: `bauRezept({nutzung,bauweise,rahmen,los}, haushalt, seed)` ersetzt kulturParams an 9 von 9 Rufern (Absenz-Grep 0); metaParams und die Tafel `bau` sind tot; Labor (fachwerk.js applyMeta) liest dasselbe Gesetz; leuteVon liest `hp.leute` des Loses.
- Byte-Beweis Kopf 1: 32 Kulturen × 16 Saaten + 46 Pläne + 6 Exporte + PRESETS = 564 Fälle, 0 verschieden; gate:fachwerk-contract GRÜN.
- Neigung: STIL_GRENZNEIGUNG ist EINE Tafel (STILMODE und HAUS lesen sie); 63/512 Rezepte ändern nur pitchDeg, Geometrie-Vertrag GRÜN.
- Flügel-Fang: 0 Fänge gezählt -> jetzt ROT beim Namen (throw).
- Kopf 2: Zeilen wohnhaus, reihenhaus, hofhaus, hofhaus_pastas, mietshaus + 12 Sonderbauten mit Räumen.
- Messort: Regler 12 -> 13 von 31, Silhouetten 10 -> 14, Grundriss 15 I/1 L -> 12 I/1 L/3 Hof, Wohnhaus-Geschosse {2:10} -> {1:2,2:7,3:1}.
- s7 (310 Bauten): Regler 17 -> 18, Silhouetten 72 -> 110; sechs Pläne Anteil I 95,6 -> 90,5 %.
- Größtes Haus: L2 2918 -> 3714 (Decke 7000), L0 89692 -> 112184; 0 neue Draws/Materialien, Slots gleich.
- Rollen mit eigenem Bau: 0 -> 12 von 21 vorkommenden; konsumierte Zeilen 16 von 115 (13,9 %, Zählung vor dem Literal-Schnitt kirche/turm/halle, Nachzählung steht aus).
- Passung: der Hof eines früheren Baus nur, wo das Los seine Tiefe trägt (hofImLos) — 864 Exporte, 0 ROT (vorher 4 ROT).

## Bis zur Abgabe fehlt
gate:settlement (läuft) + Golden siedlung.json neu mit Grund; format:check, check:statik, playtest, fachwerk-contract, haus-welt, betriebsgesetz; Merge origin/main ([skip ci], Geschwister vorrat11-stadt-netz, w28-haus-stoff); Bildpaar Dorf main <-> Kopf, Mittag nah/fern (noch KEIN Bild).

Nächster Schritt: gate:settlement lesen, Golden neu minten, Tore nacheinander, dann Bildpaar über gpu-lauf.sh.

## Fallen
- Der Los braucht `kultur`, sonst liest bauProgramm die falsche Kultur-Geschosszahl.
- Passung kürzt nur W/D: ein Hof (courtD = clamp(W,5,9) vor der Front) explodiert dort (az 8e11) — daher hofImLos.
- diag-settlement las `STADT_GRAMMATIK.bau` — jetzt BAU_NUTZUNG.
- Mitteleuropa- und nordische Städte bleiben 100 % I (reihenhaus trägt keinen Flügel).

## Irrtümer der Blätter
"23 Nutzungen": 23 im Code benannt, 21 kommen in den 6 Plänen vor · stadtpalais trägt hof 121 als lage hof_umlauf · Chokepoint Kopf 2 ist bauRezept, nicht houses.push (bau-gesetz.md hatte recht).

## Offen (ehrlich)
7 HAUS-Maße ohne Schreiber (Klima, Kopf 3) · Jahr/Klima aus dem Labor genommen · Masse-Zeilen kaufhaus, pfarrhaus, kapelle, werkstatt, zeughaus · Literale kirche, turm, halle, scheune, burg · `zeichen` der Zeilen unkonsumiert · Räume dach/getrennt ignoriert · Personen s7 1215 -> 902.

## Prozesse
Eigene: ein gate:settlement-Lauf (Hintergrund), sonst keine; keine Werkbank gestartet.

## Lehre
1. Zeit kostete: der erste Baum war fremd belegt, und die Passung (Hof vor der Front) fiel erst im Siedlungs-Tor, nicht in meinen Sonden — der Sweep über 864 Exporte hätte vor dem Tor laufen sollen.
2. Trug: eigene Byte-Sonde (bau-mess --byte) und der Export-Sweep; nutzlos: Blatt-Zeilennummern nachzählen, die unverändert waren.
3. Übersehen: frühere Bauten (fr) erben die Form, das Los aber wechselt später (halle/turm) — Ordnung der Schreiber im DORF lesen, bevor man Formen ändert.
4. Im Auftrag soll stehen: welche Tore den Golden minten und wie; nie: Blätter als Quelle mit Zeilennummern, die der Arbeiter ohnehin prüft.
5. Großer Hebel ohne Auftrag: DORF schreibt Form an drei Stellen nach dem Rezept (Downtown, Gewerbe, Kirche) — EIN Schreiber-Ende (Rezept zuletzt, auf dem endgültigen Los) würde Passungs-Flicken und Literale gemeinsam töten.
