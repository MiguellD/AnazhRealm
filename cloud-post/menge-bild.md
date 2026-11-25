# Vorprüfung menge-bild — der Weg zum Werk führt über den Markt (halb, ohne Anspruch)

**Basis main 6c210411 (V18.546.411). Der Kopf ist EIN Commit auf main und fasst zwei Dateien an:** koerper-core.js
(`_morgenGang`) und scripts/diag-koerper-kern.cjs (Linse M1). Dazu kommen dieser Bericht und das Bildpaar. Mit main 486a6685 gibt es keine
Überschneidung: main fasst seit 6c210411 26 Dateien an, keine davon ist eine des Kopfs; `git merge-tree <Basis> origin/main HEAD`
(git 2.30 am OMEN) zeigt 0 Konflikte.

**Der Stand ist halb und ehrlich.** mensch.menge.bild#2 bleibt ROT: 47 → 84 im Bild (Soll ≥ 100), 21 → 32 gehend (Soll ≥ 40).
Der Kopf erhebt KEINEN Anspruch. Der Spike „Ankunft zur Stunde“ (82/29) ging nicht über 100/40. Der Koordinator nahm den STOPP
um 01:57 an. Der Fund steht im Register (`[sprosse mensch.menge.bild#2]`, koordination 70481bc5).

**Die Wurzel.** Die letzten `morgenPlatzH` Stunden vor dem Werk geht jeder über den Markt. Bisher lag der Gang gleich nach dem
Aufstehen, danach ging jeder erst heim und dann zum Werk. Am Messort stadt-voll hatten um 7 Uhr 296 Menschen den Platz zum
Ziel, um 8 Uhr nur noch 8 (Täter `_morgenGang`). Die Zahl der Wege je Mensch bleibt gleich.

**Geschnitten.**
- koerper-core.js `_morgenGang(T, bM)`: das Fenster des Markts endet am Werk (mit dem Besuch des Morgens erst nach ihm). Wer vor
  dem Werk keine `morgenH` Stunden wach ist, geht wie bisher gleich nach dem Aufstehen. Leser sind `tagesPlan` und `tagesGaenge`.
- Linse gate:koerper-kern M1: der Täter „Markt gleich nach dem Aufstehen“ ist ROT beim Namen. Der Selbsttest zählt
  vierundvierzig Täter.

**Das Bild (GTX 1060, die Kamera der Station bild#2: stadt-voll, 8 Uhr, third).** Vorher heißt: derselbe Baum, nur
koerper-core.js von main 6c210411 (der einzige Laufzeit-Unterschied des Kopfs). Beide Seiten stehen auf demselben main.

| Uhr | vorher (main 6c210411) | nachher (Kopf) |
|---|---|---|
| 8,05 | im Bild 47 · gehend 21 · Ziel am Platz: Morgen 8, Arbeit 35 | im Bild 84 · gehend 32 · Ziel am Platz: Morgen 140, Arbeit 35 |

Das Bildpaar liegt im Zweig, 960 × 540, JPEG: `cloud-post/menge-bild-bild/vor-08_00.jpg` ↔ `cloud-post/menge-bild-bild/nach-08_00.jpg`.

**Die Stationen vorher ↔ nachher (GTX 1060).** Die Stationen an der GTX liefen als echte Station der Punkte-Maschine am Gerät gtx
(OMEN-Handlauf der Maschine, `run --nur` je Station). Die headless-Stationen liefen mit DEM BEFEHL DER STATION (`node scripts/diag-kreatur-takt.cjs
--proben …`) im Baum des Kopfs, nicht mit der Maschine. Die Farm der Maschine nimmt keinen Baum ohne Zweig; „main“ heißt dort:
koerper-core.js von main 6c210411 im selben Baum.

| Station (Ort × Stunde) | main 6c210411 | Kopf |
|---|---|---|
| karte2.mensch.menge.bild#2 (stadt-voll 8 Uhr) | ROT 47 im Bild · 21 gehend | ROT 84 · 32 (ohne Anspruch) |
| karte2.mensch.menge.bild#1 (Dorfplatz 8 Uhr) | GRÜN 21 · 9 | GRÜN 43 · 15 |
| karte2.mensch.menge.rhythmus#2 (stadt-voll, Wege je Stunde 0–23 Uhr) | ROT 3 Spitzen 6 · 18 · 22 Uhr (Soll 2), Spitze zu Tal 110, Umfang 1 470 · [0,0,0,0,0,0,1470,530,620,290,20,20,320,320,0,0,270,880,950,440,70,20,1100,300] | ROT 3 Spitzen 6 · 18 · 22 Uhr (Soll 2), Spitze zu Tal 110, Umfang 1 480 · [0,0,0,0,0,0,1480,350,680,230,20,20,320,320,0,0,270,880,960,440,70,20,1100,300] |
| karte2.mensch.menge.bevoelkerung#1 (5 Orte × 4 Uhren) | ROT: Ort 3 Ist 0/Soll 1 um 10, 15, 20 Uhr | ROT, dieselben drei Stichproben |
| mensch.K2#2 (Werk · Beruf · Tag) | GRÜN Soll-Orte min 0,987 · Wege 5–9 | GRÜN min 0,992 · Wege 5–9 |
| karte2.mensch.macht.recht#1 (Wache) | UNGEMESSEN: „/eval ohne Antwort binnen 40 s“ | UNGEMESSEN, dieselbe Zeile |
| breite.mensch#1 = Probe zielplan (stadt-voll), Befehl der Station | GRÜN 10 Uhr am 0,905 · ohne 0,011 | GRÜN 0,909 · 0,011 |
| mensch.K2#1 / K3 = Probe bewohner, Befehl der Station | GRÜN Dorf 5–9 Wege, ≥ 223 m · Stadt 5–10, ≥ 362 m | GRÜN Dorf 5–9, ≥ 235 m · Stadt 5–10, ≥ 287 m |

bevoelkerung#1 und recht#1 stehen am main ebenso. Beide sind als Funde gebucht (koordination 9accf071 und 66f10b0e). Der Kopf
fasst den Ort 3 und die Wache nicht an.

**Pflicht vor dem Kopf (OMEN, im Baum des Kopfs, EXIT beim Namen).**

| Schritt | EXIT | Zahl |
|---|---|---|
| check:statik | 0 | Selbsttest GRÜN |
| format:check | 0 | alle Dateien formatiert (8,2 s) |
| lint | 0 | 0 Fehler, 4 Warnungen (alt, stamm/koerper-leib.js u. a.) |
| stamm-umzug --nach-karte | 0 | Karte und Tafeln stehen |
| gate:mensch-zuege | 0 | 0,90 der ersten 20 · 0,85 aller 100 blind ihrem Zug zugeordnet |
| gate:koerper-kern · --selftest | 0 · 0 | DER MENSCH IST EINER (729 Punkte, 118 181 Werte alt==neu, 0 Abweichungen) · Selbsttest vierundvierzig Abweichungen erkannt, darunter der Täter des Morgengangs |
| gate:kreatur-takt --selftest --teil=1/3 | 0 | 46 von 46 Tätern rot beim Namen, Grund 8 von 8 grün (723 s). Ein erster Lauf war ROT im Grund (bewohner alsLeib 5 > 4), die Wiederholung im eigenen Fenster grün |
| gate:kreatur-takt --selftest --teil=2/3 | 0 | 55 Täter, Grund 15 von 15 |
| gate:kreatur-takt --selftest --teil=3/3 | 0 | 44 Täter, Grund 12 von 12 |
| probe-tag (die Regeln des Zugs) | 0 | PROBE-TAG OK · 5 Dateien, keine Überschneidung mit 6c210411 · Tag bild:stadt-voll@0.333, gate:kamera-leib:echt (2 von höchstens 4) |

**Offen.** bild#2 bleibt ROT bis zur Welle `tages-gesetz` (Markt als eigener Akt, Ankunft zur Stunde im Gesetz).
