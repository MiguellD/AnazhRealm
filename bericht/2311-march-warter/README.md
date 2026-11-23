# Vorprüfung march-warter 1 — GTX 1050, 23.11.

Auftrag (Koordinator 02:22): die Pose 804,9 / 62,8 / 402,8 in stadt-voll ruht um 20 Uhr nie. Zweig `march-warter`, main
ddaf883df (V18.546.377, eine-huelle) im Baum.

## Geschnitten — drei Stellen, EIN Mechanismus (`_standWecken("archCull")`), kein zweiter Wecker, kein Flag

1. `stamm/vegetation-baum.js` `tickArchitectureCulling` — **offen ist, wer ohne Zusage wartet.** Der Gang zählte die Länge
   der Satz-Schlange: ein Haus der Mesh-Zone, das als Vorbacker auf seiner Zusage „Platz im Welt-March“ schläft, stand je Gang
   wieder in ihr und wurde als „felder“ gemeldet — die keine Bake-Uhr je weckt. Jetzt zählt nur, wer keine Zusage nannte
   (`_schlafen` → false); so hält es der ferne Zweig desselben Gangs schon und der Leib (`_kzVorabVoll`).
2. ebd. `zurueck` — **die Zusage weckt den Takt.** `_cullWecken` weckt den Takt nur für den, der in die Wache TRITT; ein Satz
   der Mesh-Zone schläft IN der Wache. Der Platz-Takt regt die Welt im selben Takt, der Gang geht den noch Schlafenden
   (die Zusage löst als Mikro-Aufgabe erst danach), ruht — und der Geweckte fragte nie. Das Muster der Streu
   (`_standWecken("streuLod")`).
3. `stamm/studio-bruecke.js` `_archZiegelWeicht` — **der fallende Satz weckt den Takt.** Fällt ein Feld außerhalb des Gangs
   (`_weltStillWeicht` aus dem Leib-Takt, `_weltSatzWeichen` für einen Leib), fragte der Bau nie wieder: kein Warter stand am
   Platz, freier Platz weckte keinen.

**Zur Hypothese des Auftrags** („`_weltPlatzTakt` weckt sie nie“): hält zum Teil. Dass der Platz-Takt Vorbacker erst ÜBER der
Reserve weckt, ist geschriebenes Gesetz und bleibt (sonst weckte jeder Leib, der im Gehen seine Stufe wechselt, den Gang der
Bauten). Gebrochen waren die Meldung des Gangs (1) und zwei Weckrufe, die an einem Wachen verhallten (2, 3). Ohne (2) hätte
(1) allein die Röte gegen ein Loch getauscht: die Welt stünde, und das Haus bliebe für immer ohne vorgebackenen Satz.

Nicht geschnitten, mit Grund: `_cullWecken` weckt den Takt weiter nur beim Eintritt in die Wache — ein Weckruf je Schritt
jedes Wagens (`_blockerBewegt`) höbe die Ruhe der Stadt auf (die Geschichte von `_stufeWecken`, „die längste Ruhe 0 Takte“).

## Gemessen

| stadt-voll, 20 Uhr, Pose 804,86 / 62,83 / 402,81 → 792,86 / 62,69 / 402,81 (GTX 1050) | vorher | nachher |
| --- | --- | --- |
| `werkbank bild` (main 4019a2ad0 ↔ 673d3ede0, dieselbe Basis) | verweigert: „DIE WELT STEHT NICHT nach 1 970 Takten … Fege-Takt archCull wartet“ (58,2 s) | Bild, ABNAHME GRÜN (55,6 s) |
| `werkbank bild` am Kopf (Baum 53ed217b1, main ddaf883df darin) | — | Bild, ABNAHME GRÜN (63,5 s) |
| Takte bis zur Ruhe (Sonde `seite-cull.js`, kein Bild davor) | nie in 600 (486 Gänge, 484 davon „felder“) | **179** am Kopf (16 Gänge, 0 „felder“); der Tag ruht dort in 181 |
| freie Felder / Reserve im Welt-March | 128 / 128, `wm.platz` wartet (48 Vorab-Fragen) | 137–144 / 128, kein Warter |

Linse (V) in `gate:stand-takt`, Mess-Wiese, Null-Renderer mit Feld für EIN Haus — derselbe Lauf am ungeschnittenen Stamm ↔
mit den Schnitten:

| | vorher (ROT, drei Täter beim Namen) | nachher (GRÜN) |
| --- | --- | --- |
| das schweigende Feld fällt — das Haus fragt selbst | nie in 120 Takten („NIE GEFRAGT“) | im selben Takt |
| die Welt steht, während es wartet | nie in 120 Takten („VORBACKER HÄLT WACH … archCull wartet“) | nach 30 Takten |
| Platz über der Reserve (192 frei) — es bäckt | nie in 600 Takten („NIE GEWECKT“) | nach 2 Takten |
| Mutante „nie geweckt“ (der Platz-Takt schweigt) | bäckt nicht (scharf) | bäckt nicht (scharf) |

Selbsttest der Linse: 221 von 221 Tätern rot beim Namen, davon sieben neu (NIE GEFRAGT · VORBACKER HÄLT WACH · NIE GEWECKT ·
BLIND · drei LEER).

## Sprossen der Karte 2 an dieser Pose

Keine gebuchte oder gemessene Station liest diese Pose: `messung/c1236fa8-gtx.json` (42 Stationen) trägt nirgends „STEHT
NICHT“ oder „archCull“, die Stationen messen stadt-voll am Tag. Getroffen waren meine eigenen Abend-Bilder für
`menge.bevoelkerung#1` (in der Vorprüfung eine-huelle auf die Gegen-Pose 856,5 / 57,2 / 437,0 ausgewichen). Die Abend- und
Nacht-Bilder der höheren Sprossen (k2-mensch-stadt `2-nacht`, k2-mensch-bau stadt-voll bei Nacht aus 200 m,
k2-mensch-wirtschaft, -zukunft, -kultur) sind ungemessen; ob sie an der Reserve hingen, ist nicht belegt. Die Familien g1–g6
und k2-erleben, -leben, -planet, -same, -zusammenspiel habe ich dafür nicht gelesen.

## Bilder

- `pose-20h-vorher-bruecke.png` — main 4019a2ad0. Die Werkbank verweigert dort jedes Bild; für dieses eine hat mein Werkzeug
  das Wort „archCull wartet“ überbrückt (442-mal verdeckt), sonst hielt nichts die Welt wach.
- `pose-20h-nachher-gleiche-basis.png` — 673d3ede0 (main 4019a2ad0 + die Schnitte), regulär.
- `pose-20h-nachher-kopf.png` — der Kopf (main ddaf883df im Baum), regulär.
- `takte-20h-kopf.json` — die Sonde am Kopf (179 Takte, die Halter je Typ).

## Ehrlich offen

- Die Takt-Zahl der Werkbank selbst (ihr Einschwingen vor dem Schuss) steht in keiner Ausgabe von `werkbank bild`; die 179
  zählt meine Sonde. Vorher ↔ nachher derselben Sonde am selben Kopf fehlt: das Vorher (600 Takte, nie) stammt von main
  4019a2ad0, das Nachher vom Kopf.
- An der Pose stand der Welt-March in den Nachher-Läufen 9–16 Felder über der Reserve; den Stand genau AN der Reserve prüft
  die Linse (V), nicht das Bild.
- Der Rewarm (`_foundryRewarmColdTrees`) zählt Schläfer weiter als kalt und hält den Gang je Takt wach, bis ihre Lieferung
  kommt — dieselbe Form, aber die Foundry liefert immer; nicht gemessen, nicht geschnitten.
- Am ungeschnittenen Stamm fielen im roten Lauf der Linse zwei spätere Phasen mit (FRONT-MIT 0,343 m/s, DRUCK-SCHLAF 4
  wach): der rote Pfad von (V) ist etwa 900 Takte länger. Im grünen Lauf beide im Soll (0,603 m/s, 0 wach).

## Tore am Kopf

Vorprüf-Kopf 539cad7d9 (leer über 53ed217b1, main ddaf883df im Baum), Probe-Tag `[gpu-probe: gate:stand-takt] [ci voll]` — die
drei geschnittenen Dateien treffen keine Zeile der PROBE_PFLICHT. Lokal am Baum des Kopfs: Atlas-Ratsche, stamm:lint,
prettier, `check:statik` (Exit 0), `gate:stand-takt` (Selbsttest 221 von 221, Haupt-Lauf GRÜN mit dem Fall V, `--narbe` GRÜN),
`gate:betriebsgesetz` GRÜN. Der volle Playtest: Lauf 1 rot an den drei Feld-Zeilen der Register-Klasse vom 22.11. 08:00
(`deposit_life`, der Leser im selben Aufruf), Lauf 2 am selben Baum allein „Alle Invarianten OK“ (246 s) — vierter Nachtrag
im FUND-REGISTER.
