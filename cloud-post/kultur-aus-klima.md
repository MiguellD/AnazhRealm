# kultur-aus-klima — Stand-Blatt (ZWISCHENSTAND)

Zweig `kultur-aus-klima`, **Kopf 4** auf `buendel-dorf-2` b0289a9e (Kopf 1 im Bündel, auf main e71f2721; Briefkasten 06:58): EIN
Commit, der trägt, was Kopf 2 über Kopf 1 hinaus bringt (die Wüste deckt flach, der Pol liest zuerst, der Messort der Reise), die
Heilung der acht Karten (Kopf 3) und das Dach, das HAUS in der Wüste baut (Kopf 4, das Bild der Probe 1a78aab2). Sprossen:
`karte2.mensch.kopplung.kultur#2` (Dach ↔ Niederschlag r ≥ 0,5; Mutation ≥ 90 %) und `karte2.mensch.kultur.sprache#1` (100 Namen aus
2 Saaten richtig zugeordnet ≥ 90 %). Karte 2 gebucht 120 von 1 718. Status ZWISCHENSTAND.

## Kopf 4 — die Wüste BAUT flach (das Bild der Probe 1a78aab2, gtx1050-desktop, 08:31)

### Der Befund

Die Probe von Kopf 3 fuhr GRÜN in 3 321 s: gate:pruefbuehne-licht 102 s · gate:weltbild-frost:echt 328 s · gate:studio-begehen 502 s ·
`bild:dorf-trocken@0.42` 160 s (abnahme bauSatz 29,6 %) · gate:webgl-probe 106 s. Die Welt steht am Ort der Reise; die acht Karten sind
geheilt. Das Bild urteilt anders als das Tor. Ich sehe in Nagu den geschwungenen Walm eines chinesischen Hauses mit dunklen Ziegeln und
schwarzer Traufe, kein flaches Lehmdach. Der Plan sagte „flach, 2°“, gebaut stand der Sattel.

### Die Wurzel (fachwerk-core HAUS, gelesen)

- `ROOFMODE` las die Deckung nicht. Eine Neigung von 2° unter `deckung: "flach"` blieb ein Sattel (oder ein Dach des Zoos), nur flacher.
- Der Schwung (`DEF_cv`, die gehobene Traufe: 1,35 · roofCurve · f^2,2, chinesisch 0,95 → 1,28 m) hob die Ecken unabhängig von der Neigung.
- Die Welt behält die Rolle des Teils (`mat = r => … {__role: r}`). Der Sattel unter der flachen Deckung trug darum den Ziegel der Kultur.
- Die Linse R10 las nur den Plan (`deckung`, `pitchDeg`). Sie war GRÜN, während HAUS den Sattel baute: 12 336 von 12 336 „flach“ im Plan,
  544 flach gebaut.

### Geschnitten (EIN Ort: die Dach-Quelle `ROOFMODE` in HAUS)

- **`FLACH`**: Die Neigung, die der Bau trägt (`pitch`, nach `grenzNeigung`), liegt unter `STADT_MASSEN.flachGrad`. Das ist dieselbe
  Grenze, mit der die ferne Masse `hausMasse` flach deckelt; es gibt keine zweite Zahl. Dann fährt das Haus die EINE flache Quelle, die
  Zinnen und Arkade schon tragen: die Platte auf der Traufe, kein Dachraum, kein Giebel, kein Dachwerk.
- **Das Gewölbe bleibt**: Kuppel, Tonne und Zwiebel tragen sich ohne Balken. Das ist der Lehmbau der Wüste (Yazd, Kashan, das nubische
  Gewölbe).
- **Kein Schwung auf dem flachen Dach**: `DEF_cv` gilt nur für ein geneigtes Dach.
- **Der Stoff der Platte ist die Deckung** (`DECKROLLE`): das Lehmdach des Orts (`dachmod`), wo die Wüste flach deckt. Sonst bleibt es der
  Stein des Wehrgangs (Zinnen, Arkade: byte-gleich).
- **Der Rundbau** trägt in der Wüste die flache Platte statt des Kegels (Masse `spitze` = Traufe + 0,12).

### Gemessen (Planet „anazh-realm-seed“, 1 200 Punkte, 78 Wüsten-Ziele, 8 Saaten × 14 Häuser, das Dach, das HAUS baut)

| | Kopf 3 (1a78aab) | Kopf 4 |
|---|---|---|
| Plan „flach ≤ 8°“ | 12 336 von 12 336 | 12 336 von 12 336 |
| gebaut flach (Platte im Lehm, ohne Schwung) | **544** | **11 928** |
| Gewölbe (Kuppel, Tonne, Zwiebel) | 408 | 408 |
| Form des Gesetzes gebaut | 952 von 12 336 (7,7 %, 0 von 624 Dörfern) | **12 336 von 12 336 (100 %, 624 von 624)** |
| Sattel gebaut | 11 384 (provenzalisch 3 672 · italienisch 3 536 · spanisch 1 224 · andalusisch 816 · …) | 0 |
| Schwung (gehobene Traufe) | 672 (japanisch 0,5: 480 · chinesisch 0,95: 192) | 0 |

- **Der Bau wird leichter**: 1 739 Wüsten-Häuser (200 Punkte) bauen in 7,2 s statt 15,1 s. Das Haus am Messort hat 14 940 △ statt
  69 684 △ (diag-blick, dasselbe Haus).
- **Byte-Beweis** (der volle Bau je Klasse, Hash über alle Teile): Labor, Pol, kalt, nass, Steppe und Süden sind Byte für Byte gleich
  (labor 56 6cdcf87b5ad8 · polar 116 ffa29a7a0454 · kalt 116 db1892203620 · nass 116 5018864e2836 · steppe 115 645b2e96e120 · sueden
  109 4d797f9fed58). Nur die Wüste bewegt sich (115 Häuser: a2430a456817 → 9120b6060a73).

### Das Bild (diag-blick über den Stempel des Dorfs, swiftshader: die Form; das Licht urteilt nur die Karte)

Dasselbe Haus von Nagu (chinesisch, Wohnhaus, Same 641789, Dorf-Same 11, Plan „flach, 2°“, roofCurve 0,95), vier Blicke im Streiflicht.

- **Kopf 3:** Ich sehe den geschwungenen Walm. Die vier Ecken sind hochgezogen, eine schwarze Traufe läuft rundum, der Ziegel ist
  körnig, und der First sitzt über der Mitte.
- **Kopf 4:** Ich sehe eine flache Platte auf der Mauerkrone. Sie trägt den Ton des getrockneten Lehms; nur der Schornstein steht
  darüber. Es gibt keinen Schwung, keinen Giebel und keine Traufe. Sockel, Wände, Fenster und Tür stehen gleich. Das ist das Gesetz im
  Bild.

### Die Linse (gate:settlement R10, Familie Fachwerk)

- **R10 liest jetzt das gebaute Dach.** Je Wüsten-Haus fährt der Mass-Bau des Gesetzbuchs (`MASSNUR`, wie los-proben). Gelesen wird
  die Masse „haupt“ (dach, curve, dachRolle) oder „rund“ (spitze, zwiebel).
- **Flach** heißt: die Platte ohne Schwung im Lehm der Deckung oder der flache Rundbau. Das Gewölbe zählt als Form des Gesetzes.
  Verlangt wird außerdem Schwung 0.
- **Gebaut wird einmal je Signatur des Plans:** alle Felder außer Maß, Same, Alter und Bewohner, denn das Dach liest keines davon. Das
  sind 110 Signaturen für 12 336 Häuser, 0,76 s.
- **Am alten Bau von Kopf 3 ist R10 ROT beim Namen:** 952 von 12 336, gebaut: Platte im Lehm 544, Gewölbe 408, Schwung 672.
- **Der Selbsttest** pflanzt zwei Täter, und beide fallen in R10 beim Namen (161 s):
  - „die Wüste baut den Sattel“ (`ROOFMODE` ohne `FLACH`): 952 von 12 336, Schwung 672.
  - „die Wüste behält den Schwung“ (`DEF_cv` ohne `ROOFMODE !== 'flat'`): 11 664 von 12 336, Schwung 672.
- **Die alten Täter fallen weiter:** „die Wüste deckt nicht flach“ (204 von 12 336; die Platte trägt den Stein statt des Lehms) und
  „die Wüste lässt das Werk des Stils stehen“ (12 132).

### Gates am Baum von Kopf 4 (lokal, ohne GPU)

- gate:settlement GRÜN: voll 548 s (R10 Wüste 12 336 von 12 336, gebaut Platte 11 928, Gewölbe 408, Schwung 0); der Selbsttest 161 s.
- `npm run check:statik` GRÜN (470 s), gate:fachwerk-contract GRÜN (129 s, cv:6), gate:profiband GRÜN (49 s), gate:haus-fern GRÜN
  (220 s, der Fernkörper grundriss-treu, kein Querfirst), Prettier GRÜN.

## Kopf 3 — die Frage der Karte fällt mit ihrer Welt (die Probe von Kopf 2, radeon-890m, 06:59)

### Der Befund

Kopf 2 (18cec0dc) fuhr auf der Radeon die drei Pflicht-Tore GRÜN (gate:pruefbuehne-licht 67 s · gate:weltbild-frost:echt 175 s ·
gate:studio-begehen 432 s · gate:webgl-probe 108 s). `bild:dorf-trocken@0.42` brach ROT nach 240 s: „DIE WELT STEHT NICHT nach 4 244
Takten … Karten offen 8“. Das Spiel hängt dort; das ist der wichtigere Schnitt als das Bild. Die acht Karten beim Namen (die Akte
`umstellen-dorf-trocken.json` der Probe): `fimp:strauch|1` · `fimp:birke|3` · `fimp:fichte|1` · `fimp:fichte|2` · `fimp:birke|2` ·
`fimp:tanne|2` · `fimp:totholz|1` · `fimp:weide|1`. Jede trägt `_platte` false. Es sind die Bäume der Heimat, nicht des Orts.

### Die Wurzel

- Der Atlas der Karten reist über die Weltgrenze (`stamm/speicher-welten.js` `WELT_GRENZE.wirt`: `_kartenAtlas`,
  `_impostorBakeQueue`).
- Die Zelle einer Karte fragt die Foundry nach ihrer Platte (`stamm/stoff-karte.js` `_kartePlatteFragen`, der Auftrag „krt“). Während
  die Frage reist, steht `_platte` auf false, und `_karteWeltBacken` backt nicht.
- Der Satz „reise B L“ wechselt die Welt. `_weltAbschied` (`stamm/speicher-laden.js`) lässt die Aufträge der alten Welt verfallen
  (pending → noop, `warte: []`). Die Antwort auf die Frage findet niemanden.
- Die Zelle wartet ewig, die Schlange `_impostorBakeQueue` zählt sie als „karten“ offen (`_weltOffen`), und die Welt steht nie.

### Geschnitten

- **`_weltAbschied`** (`stamm/speicher-laden.js`): mit den verfallenen Aufträgen fällt die Frage der Karten. Jede Zelle des Atlas mit
  `_platte` false ist wieder ungefragt (undefined), und ihr erster Leser in der neuen Welt fragt neu. Das ist EIN Ort, der Abschied, der
  schon die Aufträge verfallen lässt. Es gibt keinen Zeitgeber und keinen zweiten Weg.
- **Die Linse** (gate:weltgrenze, Familie Weltgrenze „KEIN WELT-ZUSTAND REIST ÜBER EINE WELTGRENZE“): die Saat-Route pflanzt vor dem
  ersten Wechsel eine Karte `fimp:grenze|1` mit der Frage der alten Welt (`_platte` false) und liest sie nach dem Wechsel. Trägt sie die
  Frage noch, nennt die Linse den Täter: „die Karte fimp:grenze|1 trägt die Frage der alten Welt (`_platte` false) — ihr Auftrag verfiel
  im Abschied (`_weltAbschied`), sie wartete ewig“. Schein 12 „Frage der Karte reist über den Abschied“ setzt die Frage nach dem
  Abschied zurück. Der Selbsttest ist GRÜN in 204 s, und Schein 12 fällt rot beim Namen.

### Gemessen

| Baum | gate:weltgrenze, Route saat | Urteil |
|---|---|---|
| alter Abschied (`stamm/speicher-laden.js` wie main und b0289a9e) | „Wechsel 1 (Saat grenze-saat-b): die Karte fimp:grenze\|1 trägt die Frage der alten Welt (`_platte` false)“ | **ROT** beim Namen, 1 Befund, 159 s |
| Kopf 3 | 0 Befunde; die Absenz und 14 Routen 0 Befunde | GRÜN; Selbsttest GRÜN, elf Scheine rot beim Namen, 204 s |

### Die Wand der Basis (nicht Kopf 2, aber vor dem Push gefunden)

`npm run check:statik` ist an b0289a9e selbst ROT: die Orts-Wand (`scripts/diag-altlasten.cjs`, Selbsttest „feuert nicht (oder steht
heute rot)“) nennt `scripts/diag-worker-dichte.cjs:1633/1634`. Das sind die Bau-Anker der Böschungs-Linse („dorf 20 8“ bei −730,4 /
−875,3 und „dorf 12 18“ bei −1 855 / −1 075, Erdbau). Erst die Gezeit von main (`playerMesh.position.set(O.x, …)` in derselben Datei)
macht die Datei zur Setz-Probe, darum war das Bündel `buendel-dorf` 65010917 noch GRÜN. Die Anker setzen keinen Spieler: `ortPlan`
plant das Dorf im Kern, ohne Browser. Kopf 3 deklariert sie mit EINER Zeile `// BÜHNE:` und nennt den Grund; danach ist die Orts-Wand
GRÜN (195 Gate-Dateien).

## Kopf 2 — das Dach am Ort des Planeten (Auftrag `kultur-aus-klima-2`, Briefkasten 05:12)

### Geschnitten

- **Der Pol zuerst** (`fachwerk-core.js` `ariditaet`): Kottek u. a. 2006 bestimmen E (der wärmste Monat unter +10 °C) VOR B. Der Pol
  kennt keine Trockenheit, der Ort deckt nach dem Schnee. Ohne die Reihe trugen 7 von 8 001 Land-Zielen (7 Saaten × 3 Zeiten, 466
  polar) das Lehmdach der Wüste, so erde-03 heute bei 47,38° N 126,23° O (51 mm, Sommer 9,3 °C).
- **Die Wüste deckt JEDES Dach flach** (`ortDeckung`, `ortNeigung`): die Trockenheit liest der Ort zuerst, vor dem Schiefer der Kultur
  und vor dem Werk des Stils. Am Planeten trugen 663 von 38 729 Wüsten-Häusern ein geneigtes Dach (645 modern 14–16° und 2 glas 11°,
  mediterran; 16 Schiefer 26,5°, mitteleuropa klinker/stein) → **0**. Außerhalb der Wüste bleiben Schiefer und das flache Werk des Stils.
- **Der Messort reist** (`scripts/werkbank.cjs` `reiseDesOrts`, `scripts/lib/band-urteil.cjs` `messortePruefen`): ein Messort trägt
  `reise` („reise B L“, der Satz des Spielers im Chat). Die Werkbank sagt ihn, wartet auf die Welt des Orts (`r.erwacht`, der Voxel-Faden)
  und prüft den Ort (`_gelaende().ort.teil`, B/L auf 0,01°); falsch oder stumm bricht laut. Der Spieler landet bei 0, 0, der Dorf-Zug
  baut das Dorf der Ankunft (die Zelle „start“), der Spieler steht auf dessen Platz. Zwei Messorte in `spec/profiband/haushalt.json`:
  **dorf-trocken** und **dorf-feucht**, derselbe Planet „anazh-realm-seed“, gleiche Uhr 0,42, gleiche Kamera-Regel (`ortPose` „platz“,
  `imBild` bauSatz 0,02). Ihre Ratschen-Serie steht offen (`serie.offen`, sie misst auf echter GPU).
- **Kein Wort gründet an der Reise** (der Befund): der erste Messort gründete „dorf 4291161376 13“ am trockenen Ort, die Welt baute
  „Cumigan“ mit geneigten Dächern. Das ist Gesetz, kein Bruch: der Plan eines Worts trägt kein Klima (`_foundryRequestSettlement`,
  „eine Funktion des Worts allein“), nur das Dorf des Zugs liest den Ort (`_zellEingang` → `_siedlungKlima`). Die Regel der Band-Wand
  (`messortePruefen`) fordert darum an jedem Ort der Reise Stand und Dorf-Zug und verbietet die Gründung. Ihr Selbsttest S20b
  (gate:profiband) ist ROT am Leser von main und GRÜN am Kopf (59/59).

### Der Ort am Gesetz (nicht per Hand-Pose)

Die Ziele des Standard-Planeten „anazh-realm-seed“ (Fibonacci-Punkte, Land im Relief, Band 16 km wie der Satz „reise“), je Ziel das
Δ des Planet-Fadens (`planetOrt`) durch das Ort-Gesetz (`ortGesetz(teil)` → `ortKlima`) in den Plan des Dorfs (`DORF`). Am Ort selbst
fährt die Welt ohne Karte (die Null-Welt, `welt-boot.nullWelt`, der Spieler bei 0, 0, der Dorf-Zug an): der Satz, das Dorf der Ankunft
(`_ortDp` → `_foundryRequestSettlement`), der Platz (`_ortPose` „platz“), je Ort 17–32 s, 0 Seitenfehler.

| Ort | Satz | Klima des Orts (`_siedlungKlima`) | Dorf der Ankunft | Dach | Platz → Blick |
|---|---|---|---|---|---|
| trocken | reise -49,05 -119,78 (1 547 km vom Anker der Heimat) | 42,8 mm, −8,9 / 23,3 °C, A = 0,15 (BW) | Nagu bei −159,8 / 55,6, fernost (chinesisch, japanisch) | **10 von 10 flach, 2°** | −159,8 / 61,1 → −151,7 / 52,3 |
| nass | reise 50,13 82,91 | 1 886 mm, 1,0 / 15,2 °C, A = 6,24, Spende 6,3 × Heimat | Chagrin bei −115,6 / 39,5, mitteleuropa (gotisch, tudor, alemannisch, französisch, viktorianisch) | **14 von 14 steil, 48–61°**: Reet 8, Schiefer 4, Biber 1, Hohlziegel 1 | −115,6 / 45,0 → −124,3 / 51,1 |
| Heimat | — | 548 mm, −4 / 18 °C, A = 1,96 | Chingewert bei −53,5 / −182,3, mitteleuropa | 17 von 17 geneigt, 38,5–62° (Hohlziegel 8, Schiefer 4, Schindel 3, Biber 2) | — |

Das Gesetz zieht Kultur, Name und Dach aus demselben Ort: trocken fernost und flach, nass mitteleuropäisch und steil.

### Gemessen — Anteil je Klima-Klasse mit der Dach-Form des Gesetzes (4 000 Punkte, 1 318 Land-Ziele, 8 Saaten × 14 Häuser)

| Klasse (Kottek u. a. 2006) | Form des Gesetzes | Dörfer n von m | Häuser n von m | Neigung | Rest (Grund) |
|---|---|---|---|---|---|
| Wüste BW (A ≤ 0,5) | flach, Lehm ≤ 8° | **1 960 von 1 960** (Kopf 1: 1 737) | **38 729 von 38 729** (Kopf 1: 38 066) | 2,0° | — |
| Pol E (Sommer < 10 °C) | nie flach, ≥ 30° | 808 von 808 | 15 655 von 15 655 | 41,5° | — |
| Schnee (Winter ≤ −3 °C) | nie flach, ≥ 30° | 2 281 von 2 288 | 44 565 von 44 576 | 40,8° | 3 flach (glas, das Werk des Stils), 8 Hohlziegel unter 30° (stein) |
| Steppe BS | nie flach | 2 499 von 2 720 | 53 437 von 54 094 | 22,3° | 657 flach: das Werk des Stils (modern 654, glas 3) |
| Süden (Winter ≥ 4 °C) | Kanal-Ziegel | 1 901 von 2 184 | 42 207 von 43 029 | 26,8° | 750 flach (modern 741, glas 9), 72 Schiefer (klinker/stein, die Deckung der Kultur) |
| nass (Spende ≥ Heimat) | Reet oder ≥ 40° | 332 von 392 | 7 151 von 7 373 | 47,7° | Reet trägt nur der Holzbau des Dorfs: stein mit Hohlziegel unter 40° 188, klinker mit Schiefer 26, glas flach 8 |
| Mitte | nie flach | 190 von 192 | 3 853 von 3 855 | 33,3° | 2 flach (glas) |

Am alten Kern (main vor Kopf 1) deckt die Wüste 0 von 38 729 flach; jedes Dach trägt die Neigung aus Kultur und Samen.

### Die Linse R10 (gate:settlement Teil R, Familie Fachwerk, 2,8 s)

„die Dächer des Planeten“: 1 200 Punkte, 8 Saaten; die Klasse liest der Richter selbst an der Quelle (Kottek-Konstanten), nie am
Gesetz, das er prüft. Soll: Wüste flach (Lehm ≤ 8°) 100 %, Süden Kanal-Ziegel ≥ 95 %, nass Reet oder ≥ 40° ≥ 95 %, Pol flach 0.

| Kern | Wüste flach | Süden | nass | Pol flach | Urteil |
|---|---|---|---|---|---|
| main e71f272 | 0 von 12 336 | 98,2 % | 96,0 % | 0 von 4 805 | **ROT** |
| Kopf 1 (33caabe5) | 12 132 von 12 336 (98,3 %) | 98,2 % | 96,0 % | 0 von 4 805 | **ROT** (dazu R8: der Pol flach 501 von 501) |
| Kopf 2 | **12 336 von 12 336** | 98,2 % | 96,0 % | 0 von 4 805 | GRÜN |

Die gepflanzten Täter fallen beim Namen: „die Wüste deckt nicht flach“ → R10 (0 %); „die Wüste lässt das Werk des Stils stehen“
→ R10; „die Trockenheit kennt den Pol nicht“ → R8 (die Polprobe 26 mm, Sommer 9 °C: flach 501 von 501). R8 trägt die Polprobe
dauerhaft: flach 0 von 501, 47,72°.

### Das Bild

- **Mein Auge (swiftshader, der Kanal des Dorfs, je vier Blicke):** die Kirche des Dorfs der Saat 4291161376 mit dem Klima der beiden
  Orte (Kumigu trocken, Buwegros nass). Trocken liegt ein flaches Lehmdach, nur die Traufe hebt sich an den Ecken (die Kurve der Kultur), kein Giebel. Nass trägt Reet auf 57°, der
  Giebel steht höher als das Fachwerk-Geschoss darunter. Das ist das Gesetz im Bild; es ist die Form, nicht das Weltbild.
- **Die Welt am Ort**: hier rendert die Welt nicht (WebGPU „Device Lost“ ohne Karte). Das Paar urteilt die Probe am Gerät:
  `bild:dorf-trocken@0.42` (Nagu) ↔ `bild:dorf-feucht@0.42` (Chagrin), gleiche Uhr 0,42, gleiche Kamera-Regel. Den Weg der Werkbank zum
  Ort (`reiseDesOrts`) prüfte die Null-Welt: „chat.befehl.reise.ziel“ nach 10,9 s, die Welt `ort_d5a1e45a2e4cb14d`, der Ort −49,05 /
  −119,78 auf 0,01°.
- **Nicht das Paar:** `bild:dorf` (die Heimat, `probe-post/buendel-dorf/65010917-dorf-0.42.png`) zeigt das Dorf eines Worts. Es
  trägt kein Klima, seine Dächer sind das Werk des Stils.

## Kopf 1 — das Gesetz

### Geschnitten

EIN Gesetz: was der Mensch am Ort baut und wie er heißt, folgt dem Ort und dem Klima seiner Saat, gelesen an EINER Stelle.

- **Der Himmel des Orts** (`gelaende-core.js` `NIEDERSCHLAG`, `niederschlagAmOrt`, `schneeFall`, `ortKlima`): der Niederschlag ist
  der Schneefall eines Frosttags × Jahr. Die Heimat hat 547,5 mm, davon ist der Abfluss `spendeMm` 328,5 mm. Am Ziel der Reise gilt die
  Umkehrung der Regen-Quote des Planeten (planet-core `ortRoh`: q = N / (N + 900)). Der Schneefall des Pegels skaliert mit N / N_H;
  in der Heimat ist der Faktor × 1, bit-gleich. `ortKlima(O)` ist die EINE Tafel, die der Mensch liest: {winter, sommer, spendeVerh,
  niederschlagMm, schneeMmTag}. Der Wirt reicht sie in jeden Plan ohne Wort (`stamm/siedlung-ort.js` `_siedlungKlima`).
- **Das Dach folgt dem Himmel** (`fachwerk-core.js` `DACH_KLIMA`, `ariditaet`, `schneeNeigung`, `ortNeigung`, `ortDeckung`). Die
  Bänder:
  - die Trockenheit nach Kottek et al. 2006 (Köppen-Geiger, die Schwelle 10·(T + 7));
  - die Schneelast nach EN 1991-1-3 (μ₁ = 0,8 bis 30°, 0 ab 60°, also die Neigung, über der der Schnee abgleitet);
  - das flache Dach nach DIN 18531 (2 %);
  - die Neigung trocken ↔ nass nach Li et al. 2021 (Hang-Steilheit-Regel der Volksarchitektur).

  Wo es trocken ist, wird das Dach flach (Lehm, `DECKUNG_GESETZ.flach`). Wo Schnee fällt, wird es steiler bis zur Gleitgrenze. Wo es
  nass ist, wird es steil.
- **Die Sprache der Region** (`fachwerk-core.js` `SPRACHE_GESETZ`, `SPRACH_BAUM`, `LAUTWANDEL`, `spracheVon`, `sprachName`):
  - Jede der 6 Kultur-Regionen ist eine Familie mit einer Ursprache, gewürfelt aus ihrem Lautgesetz: Anlaut, Cluster nur am Wortanfang
    oder nach Vokal, Silbenkontakt nach Vennemann 1988, Koda nach WALS 12A, Vokale nach WALS 2A.
  - Die Ursprache hat 6 Grundwörter und das Wort für „Haus“.
  - Eine Saat wählt ein Blatt eines Binärbaums der Tiefe 5. Jeder Knoten erneuert EIN Lautgesetz aus der Drift der Familie (Sapir 1921).
    Das Gesetz greift ausnahmslos (Osthoff & Brugmann 1878; Campbell 2013; Kümmel 2007).
  - Der Rang-Wurf ist 1/r (Sigurd 1968; Tambovtsev & Martindale 2007).
  - Die Fuge folgt dem OCP (Leben 1973; McCarthy 1986): zwei gleiche Konsonanten nebeneinander verschmelzen, außer den
    Geminaten, die das Gesetz der Region trägt (mediterran ll · tt · nn …). Das Maß über 36 000 Namen: Doppel-Laut ohne Gesetz
    4,19 % → **0 %** („Betzzel“ → „Betzel“, „Gonggros“ → „Gongros“).
  - Ortsname = Wurzel + Grundwort, Familienname = Wurzel + „Haus“: Ort und Leute klingen verwandt. Es gibt keine Namensliste und
    kein kopiertes Wörterbuch. Die alten Silben-Listen `NAMEN` und `LEBENSLAUF.namen` sind gefallen.
  - Die Leute heißen aus demselben Gesetz: `stamm/siedlung-bewohner.js` `_bewohnerLauf` „name“ ruft `sprachName` mit der Sprache
    des Plans (`spracheVon(plan.region, plan.seed)`). Ohne Kern bricht der Lauf beim Namen (`_kernPflichtBruch`).

### Gemessen (node, dasselbe Gesetz, vorher am Kern origin/main ↔ nachher)

#### kultur#2 — Dach ↔ Niederschlag (gate:settlement Teil R8, 32 Saaten, der Auftrag über `ortGesetz` eines Teils)

| Maß | vorher | nachher |
|---|---|---|
| r (Niederschlag, mittlere Dachneigung) | 0 | **0,792** |
| Mutation (Plan trocken bzw. nass ≠ Heimat) | 0 % (0 von 64) | **100 %** (64 von 64) |
| Gegenlauf gleich | 32 von 32 | 32 von 32 |
| Dach trocken · Heimat · nass | 50,86° · 50,86° · 50,86° | **2,13° · 51,05° · 60,06°** |
| Niederschlag trocken · Heimat · nass | 76 · 548 · 1 895 mm/a | 76 · 548 · 1 897 mm/a |

#### sprache#1 — Namen aus ≥ 2 Saaten (gate:settlement Teil R9, der Zweier-Laut-Leser der Station wörtlich)

| Maß | vorher | nachher |
|---|---|---|
| Fächer der Heimat (32 Zellen, 32 Ortsnamen + 640 Personennamen): Saaten | 3 | **3** (mitteleuropa · alpin · nordisch) |
| zugeordnet | 0,857 | **0,993** (128 Zellen: 0,995) |
| mit stadt-voll (mediterran) | 4 Saaten | 4 Saaten |
| Sprachen je Region (200 Saaten) | 1 (keine Familie) | 22–32 von 32 |
| Doppel-Laut ohne Gesetz an der Fuge (672 Namen des Fächers) | — | **0** (ohne OCP 26) |

#### Die Linse (Familie Fachwerk: gate:settlement Teil R, 1,3 s)

- R8 „das Dach liest den Niederschlag“: r ≥ 0,5, Mutation ≥ 90 %, Gegenlauf = n, trocken < Heimat ≤ nass.
- R9 „die Namen tragen ihre Region“: Saaten ≥ 2, zugeordnet ≥ 0,9, Doppel-Laut ohne Gesetz an der Fuge = 0.
- Am alten Kern (fachwerk-core origin/main) ist R8 ROT mit r 0 und Mutation 0 %. R9 ist ROT beim Namen („der Kern trägt kein
  Sprachgesetz“).
- Selbsttest mit gepflanzten Tätern (`KLIMA_TAETER`): „das Dach liest den Niederschlag nicht“ (der alte Deck-Schritt) → ROT an R8;
  „die Sprache kennt keine Region“ (jede Region spricht mitteleuropa) → ROT an R9 (zugeordnet 0,51); „die Fuge kennt kein OCP“
  → ROT an R9 (Fuge 26: „Krorzatzzel“ …). Der Selbsttest gate:settlement ist GRÜN (103 s).
- Die Leser des alten Klimas (Teil R Sockel/Klima/Dach, Teil O Studio = Welt) wandern mit: sie rechnen das Klima über `ortKlima`,
  nie über einen Zwilling.

#### Vertragsakt — wie weit sich die Welt bewegt (alter gegen neuen Kern, dieselben Saaten)

| Messort / Golden | Bewegung |
|---|---|
| **dorf** (Zelle −4,−4, Same 4291161376, die Heimat) | 17 von 17 Dächern byte-gleich (Reet 45°/47°); nur der Ortsname: Skogberg → Huvisnid |
| DORF Heimat, 64 Saaten | 15 von 1 105 Häusern neigen steiler (1,4 %, +10° … +14,5°, Mittel +11,4°: der Schnee der Heimat hebt flache Dächer an die Last-Regel); Deckung 0 geändert; Ortsnamen 64 von 64 neu |
| **stadt** („dorf 7 120“) · **stadt-voll** („dorf 7 300“) | Geometrie byte-gleich: der Plan eines Worts trägt per Gesetz kein Klima (`stamm/siedlung-ort.js:273`); nur der Name (stadt-voll: Villaalto → Mamilsi, mediterran) |
| Bewohner aller Messorte | jeder Name neu (Vorname, Familie aus der Sprache des Plans) |
| Golden siedlung (`spec/asset-contract/v6/golden/siedlung.json`) | neu gestempelt, nur der Name bewegt sich (1 Pfad je Plan): {seed 7, nH 12} „Villaalto“ → „Mamilsi“ (e874ebee → 8f9c90ef), {seed 12345, nH 6} „Grünbach“ → „Beldwert“ (dee40ec6 → f6432b76); Slots 16 und 7, Größe gleich |
| Goldens asset-contract (Häuser) | 128 von 128 byte-gleich |
| Ziele der Reise | der Schneefall skaliert mit N / N_H; diag-planet `ort.jahreszeit` 1 820 Land-Ziele GRÜN (Schnee zur Sommer-Mitte bei > 10 °C: 0) |

Kein Flag hält die alte Welt; der alte Silben-Zwilling ist gelöscht.

## Zehn Beispiel-Namen je Region (fünf Orte · fünf Leute, Heimat-Fächer und Saaten der Regionen)

| Region (Sprachen gesehen) | Orte | Leute |
|---|---|---|
| mitteleuropa (29) | Suhesgros · Bonmeschon · Bedusgrin · Bebegrin · Gundschon | Bogebrir Ditbelf · Bronbel Debelf · Debetzel Debelf · Zobahen Brebelf · Raschwer Senbelf |
| nordisch (22) | Tanbi · Sunglidald · Svæga · Flødtald · Glabi | Skifjikharn Hihud · Draldud Skahud · Fjedbasar Hæhud · Ryskannun Huhud · Hjydsillud Fanhud |
| alpin (27) | Krorzatzel · Bobog · Libu · Betzel · Tuchgonbag | Tinik Sinack · Gruchmig Hanack · Zrigsich Flinack · Gebri Gronack · Bagich Runack |
| mediterran (32) | Serari · Mitapa · Macilva · Mallava · Tirpa | Mibapro Cobo · Limi Cibu · Callagia Cabu · Dematta Sebo · Fulla Sanbu |
| antik (29) | Lamus · Pixqunspis · Polnistas · Cigas · Trygas | Tiplincat Cacras · Muvis Pucras · Gransos Pracras · Primses Facras · Plibabam Cycras |
| fernost (32) | Susagu · Yabi · Chibanka · Kuhagya · Kadungi | Komayi Chino · Shiminka Kanu · Nujin Tunu · Kyonkun Tsuno · Taganban Tano |

Die Ursprachen (6 Grundwörter · Haus, vor Lautwandel und OCP): mitteleuropa wat schon graus grin wert mon · belf — alpin bua sitz goag bagg zeil bog · nack —
mediterran ma pa si va pe mi · bo — nordisch bi tald sned snuk halm ga · hud — fernost pi kya ku gi ka mi · no — antik mos stas gan bre
paes gas · cras. Der Ort trägt das Grundwort seiner Ursprache, die Leute tragen das Haus ihrer Ursprache: „Tanbi“ und „Hihud“ sind
nordisch, „Mitapa“ und „Cobo“ mediterran.

## Die nächsten Sprossen aus demselben Gesetz (Mechanik gelegt, nicht gebucht)

- **sprache#2** (U_eff ≥ 10; Sprachen an 20 Sätzen getrennt ≥ 85 %): U_eff je Familie **31,4–31,7** über 1 000 Saaten (32 Blätter).
  Die Trennung ist ungemessen. Die Schwestern einer Familie unterscheiden sich an derselben Saat in 27–53 % der Vornamen und in
  0–75 % der Grundwörter. In mitteleuropa sind es 0 %: seine vier Lautgesetze treffen die Grundwörter nicht. Die Schwestern stehen
  also nah, wie Schwestern stehen; ob 85 % am Satz trennen, misst erst #2.
- **sprache#3** (U_eff ≥ 10²; ≥ 5 Familien; Kognaten; Robinson-Foulds ≤ 0,3 in ≥ 70 %): 6 Familien mit 192 Blättern. Gemessen
  (Kopf 2, 100 Bedeutungen je Blatt, Kompatibilität nach Ringe, Warnow & Taylor 2002): je Familie nur **2–8 von 32** Blättern
  unterscheidbar, RF **0,57–0,88**, 0 von 6 Bäumen ≤ 0,3. Der Baum steht im Gesetz, aber das Lexikon trägt ihn nicht: eine Neuerung
  je Knoten trifft zu wenige Wörter. Ein Versuch im Arbeitsstand (die 100 Bedeutungen nach Swadesh 1971 je Ursprache, je Knoten
  ein eigenes Lautgesetz TYP · LAUT · ORT, nur sichtbare Gesetze) hob die Unterscheidbarkeit auf 191 von 192, RF 0,26–0,78; er ist
  nicht im Kopf. Der nächste Hebel ist der Ersatz des Worts selbst (Kognaten-Klassen), nicht nur sein Lautwandel.
- kultur#3 (Kalender/Fest) ist ein anderes Gesetz und fällt nicht hieraus.

## Station (Kandidat, `cloud-post/kultur-aus-klima-station/`)

`stationen.diff` gegen origin/punkte-maschine 55313a8b und `BEGRUENDUNG.txt`:

- KULTUR misst das Klima des Orts statt des Wetters der Stunde. Der Plan kommt aus dem Auftrag des Spiels (`_ortDp`).
- SPRACHE misst dazu den Fächer von 32 Zellen über den Leser des Spiels (`_bewohnerLauf`).
- Wand 1 hält: die Liste der Punkte-Maschine (`liste`, Zweig punkte-maschine) zeigt genau zwei ROT (gelaende.K2#1/#2, Wand HAKEN), an der Basis wie am Kandidaten.
- Wand 3 hält: die Zeugen `klimaGleich`, `spielGleich` und der Namen-Zeuge.
- Wand 2 ist offen (siehe unten).
- Der Selbsttest der Punkte-Maschine (`selbsttest`) am Kandidaten: 286 GRÜN, 5 ROT. An der Basis 55313a8b stehen dieselben 286 GRÜN und dieselben 5 ROT
  (BEFEHL TRÄGT · zweimal WACHE · LEBENSZEICHEN DES ZEUGEN · RICHTER-AKTE). Der Kandidat fügt kein ROT hinzu.

## Probe

Der Ruf von Kopf 4 (wie Kopf 3): `[gpu-probe: gate:pruefbuehne-licht, gate:weltbild-frost:echt, gate:studio-begehen,
bild:dorf-trocken@0.42]`. Das Bild ist dasselbe, weil es jetzt das flache Lehmdach in Nagu urteilt.

- Die drei Tore nennt `probe-tag` als Pflicht: Bau und Haus, weil der Beitrag `stamm/*` und `fachwerk-core.js` anfasst.
- Der Einlass trägt höchstens 4 Proben je Push (gpu-probe.yml „höchstens 4 je Push“), der Deckel je Probe ist 480 s
  (`PROBE_DECKEL_S`). Neben den drei Pflicht-Toren bleibt EIN Bild: das trockene Dorf, an dem Kopf 2 hing.
- Kopf 3 (1a78aab2) auf gtx1050-desktop: GRÜN in 3 321 s, alle fünf Einträge; das Bild zeigte den Schwung (Kopf 4, oben).
- Kopf 2 (18cec0dc) auf der Radeon: die drei Tore und die GL-Wand GRÜN, das Bild ROT (die acht Karten, oben).
- Kopf 1 (33caabe5) fuhr im Bündel `buendel-dorf` 65010917: die Probe GRÜN, alle vier Einträge.
- Lokal am Baum von Kopf 3 auf b0289a9e: `npm run check:statik` GRÜN (491 s, die Orts-Wand nach der Zeile `// BÜHNE:`),
  gate:profiband GRÜN (42 s; die Wand: 12 Ratschen frisch an V18.546.429, die Serie offen an dorf-trocken, dorf-feucht, kueste, ufer),
  gate:settlement GRÜN (608 s; R8 r 0,791, Mutation 100 %, der Pol flach 0 von 501 · R9 zugeordnet 0,993 · R10 Wüste 12 336 von
  12 336 flach), gate:weltgrenze GRÜN (siehe Kopf 3), `npm run format:check` GRÜN. gate:weltbild-frost:echt fährt nur auf der Karte
  (`scripts/diag-weltbild-frost.cjs:47` „nur --echt“).
- `git merge-tree --write-tree`: gegen main 64fcf12 sauber, gegen b0289a9e sauber (die Bäume stehen im Commit).

## Das Dach im Blick (swiftshader, die Form — das Licht urteilt nur die Karte)

Dieselbe Kirche des Messorts dorf (norwegisch, Same 824851), derselbe Plan bis auf das Klima des Orts (das Ort-Gesetz eines Teils,
Δ Regen-Quote −0,3 / 0 / +0,3), vier Blicke im Streiflicht der Bühne.

- **Was ich sehe (der Kanal des Dorfs):** trocken liegt ein flaches Lehmdach — ein kaum gehobener First, kein Giebeldreieck,
  der Ton des getrockneten Lehms. Heimat trägt Reet auf 45°, der Giebel ein Dreieck so hoch wie das Obergeschoss.
  Nass trägt Reet auf 60°, der Giebel steht doppelt so hoch wie das Haus darunter, das Reet oliv-graubraun. Turm und Geschosse
  stehen in allen drei gleich, nur das Dach wechselt. Das ist das Gesetz im Bild.
- **Der Kanal zählt:** der erste Blick (`diag-blick --werk norwegisch --ov <Plan>`) zeigte trocken ein Schindeldach auf ~30°. Er fährt
  den Übergabe-Kanal der Studios (`_studioWerkPruefen`, stamm/netz-portal.js:1412): der klemmt die Prägung auf die Regler-Zeilen.
  `pitchDeg` 2 → 8 (Zeile min 8), `deckung` trägt keine Zeile und fällt (must-ignore). Das Haus hebt 8° auf die Grenze der
  Schindel (30°, `grenzNeigung`). Das ist die Tür der Regler des Spielers, nicht der Weg des Dorfs. Die Welt setzt das Haus des
  Dorfs mit dem ganzen Plan (stamm/siedlung-ort.js:2386 `_stempelVon(sl.ov)` → `_foundryGestaltOv` → der Faden der Foundry).
  Die Sonde ersetzt nur den Prüfer durch diesen Stempel, sonst nichts.

## Offen (Grund, Messname)

- **Der Partner des Bildpaars**: `bild:dorf-feucht@0.42` (Chagrin). Der Einlass trägt 4, die Pflicht 3; er fährt im nächsten Ruf.
  Messname `bild:dorf-feucht`.
- **Das Bild am Ort der Reise auf der Karte**: Die Welt steht dort (Probe 1a78aab2 GRÜN, die acht Karten sind geheilt). Das flache
  Lehmdach in Nagu urteilt die Probe von Kopf 4; hier läuft keine Karte, die Form steht im Blick oben. Messname `bild:dorf-trocken`.
- **Die Ratschen-Serie der beiden Orte der Reise** (`serie.offen`): sie misst auf echter GPU (Lehre 17). Messname gate:profiband H2b.
- **Wand 2 der Station** (Leiter ≤ 60 s): sie misst nur das Gerät. KULTUR rechnet 182 statt 116 Pläne, SPRACHE 32 Pläne dazu.
  Messname `karte2.mensch.kopplung.kultur#2` und `karte2.mensch.kultur.sprache#1` am ersten Lauf.
- **Der Rest der Klasse nass** (222 von 7 373 Häusern): Stein, Klinker und Glas tragen kein Reet, das Gesetz deckt sie mit Ziegel,
  Schiefer oder flach unter 40°. Die Form des Gesetzes ist dort „steil oder Reet“ nur für den Holzbau. Messname gate:settlement R10 (nass
  96,0 % ≥ 95 %).
- **sprache#2/#3**: ungemessen am Kopf (Trennung an 20 Sätzen, Robinson-Foulds). Der WIP-Schnitt (Lautgesetz je Knoten) hebt die
  Unterscheidbarkeit auf 191 von 192 bei RF 0,26–0,78; er ist nicht im Kopf. Messname `karte2.mensch.kultur.sprache#3`.
