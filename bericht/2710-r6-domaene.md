# R6d — die Punkte-Maschine misst nach Änderung (Karte r6-domaene, 27.10.)

Zweig `r6-domaene-koord` (WIP, kein Merge). Vorgabe bleibt R6, R6d per `--r6 domaene` (buchen · run --offen · alt).
Rechnung über Git und Mess-Dateien, keine Messung. Werkzeug: `punkte.cjs alt --historie <kette>`, die Zahlen unten sind seine Ausgabe.

## Die Regel R6d (punkte.cjs `r6dGruende`, Tafel `meisterkarte-quelle/punkte/domaenen.js`)

Eine Messung gilt am Kopf weiter, außer (jeder Grund beim Namen):
`genannt` · `domaene:<d>` · `kern→kanarie:<k> (<Sprung>)` bzw. `… ausstehend` (die Station wartet, run --offen misst sie erst
nach den Kanarien) · `kanarie:<datei>` (die Kanarie selbst misst zuerst) · `werkzeug:<datei>` (eigene Linse oder ein nicht
geteiltes Werkzeug ihres Pfads) · `menge:<d> n/1000` (fremde Domäne über der Schwelle).

## Die Tafel

| Domäne | Module (Modul-Karte) · Kerne (Manifest) · Dateien |
|---|---|
| gelaende D1 | Gelaende/boden chunks fern kollision · Wasser/hydro zellen · voxel-worker.js · worlds/gelaende |
| vegetation D2 | Vegetation/wiese baum streu · Kern phyto (phyto-core, foundry-core) · worlds/terrain |
| siedlung D3 | Siedlung/ort bauten satz bewohner · Bau/vorlagen buch teile · Werkstatt/bauen · Kern fachwerk · worlds/fachwerk |
| tiere D4 | Kreatur/leben verhalten · Koerper/leib · Kern tetrapoda · worlds/tetrapoda, schwarm |
| mensch D5 | Koerper/leib seele bewegung · Kampf · Kerne koerper, schmiede · worlds/koerperstudio, skeleton, schmiede, begegnung |
| fahrzeug D6 | Koerper/fahrt bewegung (Kamera) · Kern vehicle · worlds/garage |
| licht D7 | Bild/himmel sicht · Stoff/material instanz · Gelaende/fern · foundry-core.js |
| studios D8 | Studio/bruecke gestalt · foundry-bruecke, foundry-core, cores.manifest.json · worlds/huelle, neuntes-buch, fluid, translated, tor-ziele.json |
| takt D9 | Dirigent/ankunft takt regler · Bild/kosten diaet |
| klang X1 | Klang · Kern klang · worlds/klang |
| feld X2 | Feld/leben dsl nexus sprache |
| netz X3 | Netz/p2p identitaet portal · Kern porta · signaling-server.js · worlds/portale |
| speicher X4 | Speicher/welten laden · save-server.js · speicher-faden.js |
| werkstatt X5 | Werkstatt/hud vorschau hof sozial |

X1–X5: die Systemkarte nennt diese Stamm-Zonen in keiner ihrer neun Domänen (Karte ≠ Code, hier beim Namen).
Doppelt geführt (verfilzt): Koerper/leib (mensch+tiere), Koerper/bewegung (mensch+fahrzeug), Gelaende/fern (gelaende+licht),
foundry-core (vegetation+licht+studios).

**Kern** (jede Domäne trägt ihn → Kanarien): Dirigent/kern · Dienst · Daten · gelaende-core.js · index.html · package*.json · vendor/.
**Geteilt** (Werkzeug wie Kern): welt-boot · software-gpu · welt-orte · ausgabe-aufnahme · stamm.cjs · abnahme-urteil · werkbank · haushalt.json.
**Ohne Welt**: .claude/ · Lint- und Git-Dateien · start.bat. Jede andere Welt-Datei ohne Domäne ist unzugeordnet: `liste` ROT, R6d nimmt sie als Kern.

**Bereich → Domänen** (28): gelaende → gelaende · wetter → licht vegetation feld · physik → mensch tiere fahrzeug · feld → feld gelaende
licht speicher siedlung · stoffe → gelaende mensch tiere licht klang · mensch → mensch siedlung tiere · tiere → tiere feld gelaende ·
vegetation → vegetation siedlung · oekologie → tiere feld · affekt → feld klang tiere gelaende · licht, schatten → licht · ferne → licht
vegetation gelaende · material → licht vegetation siedlung studios · studios → studios · pipeline → studios werkstatt · ki → feld studios
werkstatt · bauen → siedlung werkstatt studios mensch · fahrzeug → fahrzeug · siedlung → siedlung vegetation · leib → mensch fahrzeug ·
halten → mensch klang · ultiversum → netz feld · tore → netz studios · streaming → gelaende takt studios · profiband → jede ·
klang → klang gelaende tiere vegetation siedlung · speicher → speicher siedlung. Jede Zeit-Station trägt dazu takt.

**Kanarien** (`kanarie: true`, nicht im Abdruck; Minuten der jüngsten Messung):
radeon gelaende.K5#2 tiere.K3#2 material.K3#1 siedlung.K2#1 leib.K4#1 · 9,5 min · ohne Kanarie: takt klang netz speicher werkstatt.
gtx dieselben fünf · 10,3 min. headless gelaende.K5#1 feld.K1#1 stoffe.K1#1 tiere.K1#1 studios.K2#1 halten.K1#1 · 8,4 min · ohne
Kanarie: vegetation fahrzeug takt netz werkstatt. Gestrichen nach dem Rausch-Band: klang.K2#1 (r 0,00 ↔ 0,83 am gleichen SHA
e7a28b06) und fahrzeug.K3#1 (Urteil kippt am gleichen SHA eeaff9d6).

**Schwellen.** MENGE 1000 Zeilen: der größte Domänen-Schritt der Historie ist D1 mit 552 Zeilen (e7a28b06 → 42973786); 400 machte
dort jede Station alt, ohne dass eine fremde sich bewegte; 1000 lässt einen gewöhnlichen Zug durch, eine alte Messung altert über
die Summe der Züge. Toleranz bild 5 %, zeit 50 % (am gleichen SHA sprang leib.K1#1 ego/wechsel 46 → 26,6 ms = 42 %), Zahlen mit
der Einheit ms tragen immer die Zeit-Toleranz, Rand 0,02.

## Historie: R6 gegen R6d je Zug-Schritt (alt = Stationen, Minuten; wartet = nur ausstehende Kanarien)

| Schritt | radeon R6 → R6d (+wartet) | gtx R6 → R6d (+wartet) | headless R6 → R6d (+wartet) |
|---|---|---|---|
| e7a28b06 → 42973786 | 42/263 → 43/265 (+6/9) | 42/251 → 43/252 (+6/10) | 68/488 → 69/444 (+14/75) |
| 42973786 → 455e5be8 | 47/269 → 31/228 (+16/42) | 47/256 → 31/204 (+16/53) | 63/469 → 54/404 (+23/69) |
| 455e5be8 → cd34e72b | 26/119 → 23/115 (+26/159) | 26/116 → 23/107 (+26/155) | 45/348 → 49/346 (+32/173) |
| cd34e72b → dc06b495 | 45/268 → 35/209 (+14/65) | 45/256 → 35/199 (+14/62) | 81/518 → 58/355 (+25/165) |
| dc06b495 → 6db2602c | 44/267 → 34/246 | 44/255 → 34/227 | 64/467 → 46/365 |
| 6db2602c → 9fa32207 | 24/109 → 33/197 | 24/104 → 21/93 (+26/165) | 9/4 → 28/130 (+47/336) |
| Σ min (6 Schritte) | 1295 → 1260, gespart 35 (+275 wartend) | 1238 → 1082, gespart 156 (+445) | 2294 → 2044, gespart 250 (+818) |

Je gemessenem Takt (e7a28b06 → 455e5be8 → dc06b495 → 6db2602c → 9fa32207): radeon 918 → 933 min (−15, +57 wartend) · gtx
876 → 789 (gespart 87, +220) · headless 1493 → 1424 (gespart 69, +446). „Wartet“ ist der Rest, den gehaltene Kanarien sparen —
an den ungemessenen Zwischenköpfen (42973786, cd34e72b) gibt es keine Kanarien-Messung.

## Der Sicherheits-Beweis

278 Mess-Paare derselben Station an verschiedenen Köpfen der Kette · **bewegt 60** (Urteil oder Zahl über der Toleranz) ·
**verpasst R6d 0** · verpasst R6 2 (mensch.K1#1 radeon 6db2602c→9fa32207 Zahl 8 → 4; leib.K4#1 radeon 6db2602c→9fa32207 19 → 18,
seine Linse diag-kamera-laub.cjs änderte sich — R6 liest kein Werkzeug) · im Rausch-Band 1 (tiere.K2#2 radeon 6db2602c→9fa32207
Wolf 7790 → 10622 px; am gleichen SHA 206b395a sprang sie weiter) · Lauf-Bruch 0 · Abdruck gewechselt 5.

Der erste Lauf fand 6 verpasste Änderungen; geschlossen in der Tafel, nicht durch Aufweichen: klang.K1#1 (16 → 21 Leiber) und
klang.K2#2 (Ufer-Lag 0,5 → 0 s) bei dc06b495→6db2602c (gelaende-chunks 101 Z., wasser-zellen 24 Z.) → klang hört die Welt;
klang.K4#1 gtx 455e5be8→dc06b495 (n 31 → 25) ebenso; affekt.K1#1 (Vogel-Chor 6,69 → 6,35 dB) → affekt hört tiere und gelaende;
ki.K1#2 (p95 22972 → 30704 ms des lokalen Modells) → ms ist Wanduhr; tiere.K2#2 → Rausch-Band.

**Rausch-Band** (Git-Geschichte der Mess-Dateien, 103 Fassungen, Paare am GLEICHEN SHA): 28 Stationen, 18 springen über ihre
Toleranz, 10 davon kippen das Urteil (gelaende.K2#1, fahrzeug.K3#1/K3#2/K4#1/K4#2, leib.K1#1, klang.K2#1, halten.K2#1,
gelaende.K4#2, klang.K5#2). Eine Kanarie mit Rausch-Band über der Toleranz ist ROT in `alt --historie` (heute 0).

## Die leere Nachmessung — warum R6d wenig spart

218 Paare bewegten sich nicht. R6 hätte 207 davon neu gemessen, R6d 184 (−11 %). Die Gründe der 184 (je Paar jede Klasse einmal):
kern 73 · werkzeug 72 · domaene:gelaende 64 · domaene:siedlung 54 · domaene:licht 40 · domaene:feld 27 · domaene:studios 22 ·
kanarie 18 · domaene:klang 13 · domaene:takt 13 · domaene:fahrzeug 9 · genannt 4.

1. **Werkzeug (72):** R6 las nie ein Werkzeug (`scripts/`, `spec/` fielen als Nicht-Welt) — Regel 3 macht die Station alt, deren
   Linse sich ändert. Das ist neue Sicherheit (leib.K4#1 oben), kein Sparen.
2. **Kern (73):** jeder Zug stempelt gelaende-core, dirigent-kern, daten oder ein geteiltes Werkzeug (welt-boot 2 Zeilen an
   9fa32207); eine Kanarie, die der Zug selbst nennt oder deren Linse er ändert (leib.K4#1 an 9fa32207), macht ihre Domänen alt.
3. **Domäne:** jeder Takt der Historie berührt gelaende, siedlung oder licht, und diese drei tragen 60 % der Bereiche — die
   Verfilzung, die die Tafel beim Namen zeigt (Koerper/leib, foundry-core, klang hört die Welt).

## Halb, mit Grund

- Die Kanarien-Minuten je Gerät sind gerechnet (≤ 10,3 min), der zweiphasige Takt (Kanarien zuerst, dann `run --offen` erneut)
  ist im Urteil gebaut (`warten`), nie auf einem Messplatz gefahren.
- Ohne Kanarie: takt, klang, netz, speicher, werkstatt (GPU) — keine Station dieser Domänen ist schnell UND ruhig am gleichen SHA.
- Die gtx-Messungen an 6db2602c und 9fa32207 fehlen in koordination (Takt 11 läuft); die Paare der gtx enden an dc06b495.
- Vorgabe bleibt R6; der Schöpfer entscheidet. Die Zahl spricht: R6d ist sicherer (0 statt 2 verpasst) und spart 2–12 % der Minuten.
