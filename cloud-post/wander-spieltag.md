# Stand-Blatt wander-spieltag (Sprosse karte2.leben.tiere.wanderung#2) — ZWISCHENSTAND

## 26.11. 20:05 Macher — die Täter-Zahl

- Messweg: die Probe der Station wörtlich (Zweig `punkte-maschine`, meisterkarte-quelle/punkte/stationen/k2-leben.js:3344–3541,
  `{ tage: 1, dt: 0.05, uhrJe: 1200, msDeckel: 20000 }`), headless in der Werkbank-Welt dieses Kopfs (swiftshader, der GPU-Prozess
  stürzt in der Wolke ab — Station nicht gefahren: GPU).
- main 4a188bf2: **ausdehnungM 17,185 m · spieltage 1 · lebt true · 72 000 Takte in 2,6 s** — der Hirsch („wesen“ = deer) wiegt
  93,4 kg (`_leibMasse`), Temperament scheu, Leine 8 m (`tetrapoda-core.js:226` 18 m − 10 m × bodySize 1, gelesen
  `stamm/kreatur-verhalten.js:600`).
- Die 0,427 Spieltage der GTX 1060 (Runde 39, Kopf 99649186) enden am **Deckel der Station** (20 s Wanduhr, 30 744 von 72 000 Takten
  in der vollen Welt), nicht am Tod: das Tier lebt hier den ganzen Tag, und die Radeon liest am selben Kopf „spieltage 1 ✓“
  (vision/richter/leben.tiere.wanderung.2.99649186-radeon.json, Zweig `punkte-maschine`). → Stations-Sache: Kandidat.
- Der Spiel-Täter ist allein die Leine.

## Band (IPERKA)
Lindstedt, Miller & Buskirk 1986 (Ecology 67:413): das Streifgebiet wächst linear mit der Masse — Pflanzenfresser 2,71·M^1,02 ha
(N 28), Allesfresser 3,4·M^0,92 ha (N 7; Harestad & Bunnell 1979, ihre Gl. 7/8), Fleischfresser 170·M^1,03 ha (N 38, Telemetrie,
Gl. 10). Die Reichweite um den Anker = √(A/π): Hirsch 93 kg 0,94 km, Wolf 64 kg 6,3 km. Selbsttest gegen die Telemetrie-Tafel
(Tab. 1, geometrisches Mittel je Art): Wolf 1,19×, Rotfuchs 0,97× (Band ≤ 2×).

## Schnitt (im Bau)
- leben-core `streifRadiusM(M, kost)` (additiv, neben `lebensdauerS`), tetrapoda `kostDerGattung` (die EINE Diät-Schwelle für
  Temperament und Streifgebiet), `leashBaseM`/`leashSpanM` fallen (Vertrags-Akt: recipes.json neu gemünzt, nur `wandern`).
- Der EINE Leser `_creatureMoveCharacter`: leashM = streifRadiusM(_leibMasse, kost).
- Nachher, derselbe Messweg: **ausdehnungM 17,185 → 543,34 m · spieltage 1 → 1 · Tritt-Zellen 0 → 5**.

## 26.11. 20:55 Macher — Spieltag gegen refS, die Linsen der Familie, der Kandidat (Stand 23:10, auf main ab27f4f8)

- **Spieltag gegen refS (entschieden an der Quelle, nichts hochgesetzt):** refS 2 100 s ≙ jahreRef 8 Wolf-Jahre (leben-core.js
  `LEBEN_GESETZ`), ein Spieltag (3 600 s) ≙ 13,7 Jahre. Im Verzeichnis lebt der Hirsch `lebensdauerS(93,4 kg)` = 2 265 s = 0,63
  Spieltage. Das Tier der Station steht außerhalb des Verzeichnisses (gesetzt über `tier()`, der Alterstod fällt am Kopf des Gaus,
  `_bestandTakt`/`_gauAntwort`) und altert nicht — `lebt true` ist die Wahrheit der Probe. Das Streifgebiet der Telemetrie
  (Lindstedt et al. 1986) ist die Fläche über Jahre: es ist das Maß, das der geraffte Spieltag trägt. Das Soll „spieltage ≥ 1“ EINES
  Individuums liegt im Verzeichnis jenseits der Lebensdauer des Hirschs (0,63) — steht hier mit Zahl, der Koordinator entscheidet.
- **gate:wasser-leben** brach am Täter-Fall (6b) „ohne Gestalt-Baum“: die Linse löschte `_tierBaum`, die Leine liest jetzt die Masse
  → `_kernPflichtBruch` (fail-closed, richtig: ein Tier ohne Gestalt gibt es im Spiel nicht). Die Linse liest die Leine jetzt VOR dem
  Löschen (scripts/lib/wasser-linse.cjs `tierLage`), ihre Frage (Wasserlinie auf `schwimmTiefeM`) bleibt — K6 OK. Es bleibt „K10 LEER:
  8“, gleich am main 45bad33f in derselben Wolke (dort gemessen, ein Worktree): nicht dieses Schnitts.
- **gate:kreatur-takt** Teil 2: Probe `tagesbudget` ROT „kein Tier trinkt aus Durst: Trünke 4,8,2,3,9,10,4,2,0,2,1,3, 48 am
  Wasser“ — der dritte Fuchs trank nie: er streift 1,7 km, der Durst sucht 40 m (`aufgaben.trinkSuchM`). Die Linse zieht um: je Art
  trinken ihre drei Tiere (Σ ≥ 1), jeder Trunk am Wasser (Mutante `durst` bleibt ROT, alles 0). **Offen, beim Namen:** das
  Gedächtnis der Tränke im Streifgebiet — ein durstiges Tier fern vom Wasser findet heute nur, was sein Weg in 40 m kreuzt (Messname
  `tagesbudget.truenke`, Adresse stamm/kreatur-verhalten.js `_tickCreatureDrink` · tetrapoda-core.js `aufgaben.trinkSuchM`).
- **Playtest** (scripts/playtest/kreatur-verhalten.cjs): Tier-Separation (B) misst die Leine als Streifgebiet (Kitz 430 m · Hirsch
  939 m · Wolf 6 241 m); Kreatur-Kosten (B) „die neutrale Stance jenseits der Grenze“ stand bis hier jenseits einer Leine von 8 m im
  Zug — in der Leine von 939 m äste die Probe (Aktion scan, die Beine 0,27 rad neben STAND_POSE). Ihr Anker liegt jetzt drei Leinen
  fern: sie zieht ohne Aktion, devFrozen 0, `npm run playtest` EXIT 0.
- GRÜN: gate:tier-anatomie (101 s) · gate:tier-gang (108 s) · gate:kreatur-leben (47 s) · gate:fahr-leben (1 238 s) ·
  gate:kreatur-takt Teil 1/2/3 (972 · 974 · 739 s). gate:wasser-leben:bild: Station nicht gefahren: GPU (der GPU-Prozess stürzt in
  der Wolke ab).
- `npm run lint` 0 Fehler · `npm run format:check` grün.
- **Kandidat der Station** `cloud-post/wander-spieltag-station/` (Diff im Zweig `punkte-maschine` gegen
  meisterkarte-quelle/punkte/stationen/k2-leben.js, Basis byte-gleich mit dem Stand von 21:50): dt 0,25 · uhrJe 240 · die Bahn je Spiel-Sekunde · `lebensdauerS` aus
  dem Gesetz des Spiels. Die Wand `liste` (meisterkarte-quelle/punkte/punkte.cjs im Zweig `punkte-maschine`) mit Kandidat an den
  Köpfen 61e2a27f und 8cdef727: genau zwei ROT gelaende.K2#1/#2 (Wand HAKEN), 1 976 Stationen — wie die Basis.
- **Gemessen am Kopf (main 45bad33f + Schnitt, headless):** Probe wörtlich ausdehnungM 543,34 · spieltage 1 · 72 000 Takte in 1,5 s;
  Kandidat ausdehnungM 706,361 · spieltage 1 · 14 400 Takte in 0,22 s (auf der GTX 1060 ≈ 9,4 s, unter dem Deckel 20 s).
- **Probe-Ruf lokal (urteil-zeile.cjs je Log), swiftshader in der Wolke — am Kopf UND am main 45bad33f gleich ROT:**
  gate:pruefbuehne-licht ROT „S0 Himmel … Dämmerung (Sonne −12,5°) … das 1,08-Fache“ (Kopf 72 s · main 64 s, dieselbe Zahl) ·
  gate:weltbild-frost:echt ohne X-Server Exit 2, unter xvfb-run Exit 124 am Deckel 600 s (Kopf und main) · bild:wiese@0.5 ROT
  „umstellen: DIE WELT STEHT NICHT nach 3 699 Takten“ (main: 3 695 Takte). Kein ROT gehört dem Schnitt; das Urteil fährt der
  Vor-Richter (GTX 1050) am Vorprüf-Kopf.
- `npm run check:statik` GANZ grün (478 s am main 45bad33f, 455 s am main c072c864, 457 s am main ab27f4f8) · `npm run playtest` EXIT 0 (118 s) ·
  `git merge-tree --write-tree origin/main HEAD` Exit 0.

Karte 2 gebucht 134 von 1 718 · Status ZWISCHENSTAND
