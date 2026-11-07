# Regel-Inventur 07.11. — feste Schwellen auf Ersatz-Größen, gemessen an Nutzen und Kosten

ZWISCHENSTAND. Keine Wand wurde geändert. Hier stehen nur die Tafel, die Empfehlungen und drei Ersatz-Entwürfe. Die Entscheidung trifft der Schöpfer.

**Datenbasis (01.11. 00:00 bis 07.11. ~21:30 UTC)**

- **GitHub-API:**
  - 975 Workflow-Läufe.
  - 11 405 Jobs mit allen Versuchen (`filter=all`).
  - Die Logs aller 747 roten Jobs. Jedes ROT ist an seiner Befund-Zeile einer Regel zugeordnet, Selbsttest-Zeilen sind ausgefiltert.
- **Züge:** Läufe auf integ-probe.
  - 167 Zug-Läufe mit 301 Versuchen, also 134 Neuläufe.
  - Im letzten Versuch waren 95 rot.
  - Zug-Jobs trugen zusammen 75 524 Job-Minuten.
- **Puls:** jeder andere Zweig, 646 Läufe.
- **Punkte-Maschine:** die 187 Mess-Dateien seit 01.11. aus `punkte-maschine:meisterkarte-quelle/punkte/messung/`.
  - Davon 141 GPU-Dateien (gtx 52, radeon 89) mit 2 916 Stations-Ereignissen.
  - Dazu `deckel.json` und `punkte.cjs`.
- **Marge heute:** aus `node scripts/diag-betriebsgesetz.cjs` und den Logs. Gemessen am Kopf e84fd1f, integ-probe steht auf f7156b2.
- **Nicht eigens gelesen:** die Text-Logs in `koordination:zug/` und `cloud-post/`. Die API trägt dieselben Läufe vollständig.

**Wie „echt" und „Reibung" unterschieden sind**

- **Reibung, bewiesen:**
  - Derselbe SHA ist im selben Schritt später grün geworden, ohne Code-Änderung.
  - Oder das Ziel der Regel war im selben Lauf direkt gemessen erfüllt (Frist, Bild, GPU).
  - Oder die Nacharbeit war nur Quetschen, Teilen oder Verlegen, ohne Änderung im Spiel.
- **Echt:** Der Zweig änderte danach das Spiel, oder der Fehler stand im Bild.

## Die Tafel

| # | Regel (Ort) | Ziel | misst direkt? | ROT seit 01.11. | davon echt / Reibung | Kosten | Marge heute | Empfehlung |
|---|---|---|---|---|---|---|---|---|
| 1 | **Linsen-Wanduhr auf geteilten Läufern**: Ego-Schatten „Leib Stufe 0 steht in 240 s" (`diag-ego-schatten.cjs:530/546`, zwei Literale), Erst-Zeichnung 120/600 s (`lib/ausgabe-aufnahme.cjs:556/606`), Probe 600 s, Puppeteer `protocolTimeout` 180 s (`welt-boot.cjs:612`), stall-akte | einen Hänger beim Namen nennen | **nein** (Wanduhr eines geteilten swiftshader-Läufers) | **120 Jobs** (92 im Zug, 28 Puls). Ego-240 allein: 7 Jobs in 3 Zügen (2f70c000, 4dbc18cc, f7156b2a) | **Ego-240: 0 echt / 3 Reibung.** An allen drei SHAs stand derselbe Schritt auf der GTX (omen-gtx1060) grün in 30–31 s. Auf swiftshader riss er bei 253–257 s, auch im Neulauf, denn die Laufzeit ist je SHA zweigipflig: 83–93 s oder 200–213 s. **Gesamt: 29 Jobs am selben SHA später grün.** Der Rest ist ohne Gegenprobe | **1 781 Job-min.** In 21 der 95 roten Zug-Läufe fielen NUR Ersatz- und Wanduhr-Wände (Zeilen 1–3) | Ego grün 213 s gegen 240 s, also 1,13×. Erst-Zeichnung < 1× für eine einzelne lange Pipeline (swiftshader 42–292 s je Pipeline) | **ERSETZEN** durch Bau-Ereignisse und den echten GPU-Läufer (Entwurf 1) |
| 2 | **voll-Job `timeout-minutes: 22`** (`check.yml:336`) | ein hängender Lauf hält den Zug nicht ewig | Not-Aus, Wanduhr | 19 Jobs am 22-min-Deckel abgebrochen, 17 davon im Zug | 0 echt nachweisbar; ein Abbruch trägt kein Urteil | **519 Job-min** | grün p50 13,8 · p90 17,1 · p99 18,8 min, also 1,17× p99 | **RELATIV**: Frist = 2 × p99 der Gruppe, von `ci-zeiten.cjs` geschrieben. Der Abbruch heißt „UNGEMESSEN (Läufer)" beim Namen des Schritts |
| 3 | **CI-Deckung (T) FRIST / WAAGE / ALT** (`diag-ci-deckung.cjs:763/782`, `lib/ci-klasse.cjs:92`) | gleich schwere Gruppen, Puls ≤ 2 min, die Frist hält den langsamen Läufer | **nein**: Median und p90 einer Zeit-Tafel, nie der laufende Lauf | FRIST 8 (alle im Zug, 03.–04.11.) · WAAGE 9 (4 im Zug, 5 im Puls) | 0 echt / 17 Reibung (Plan-Zahl, kein Spielfehler). Drei Züge fielen allein an FRIST, einer allein an WAAGE | 51 Job-min, **4 verlorene Züge** | FRIST 0,9 min (21,1 gegen 22) · ALT 1 Merge (6/7) · Puls-Plan 1/2 bei 3,3 min über 2,0, und die Wand schweigt. Der echte Puls läuft grün p50 2,2 · p90 3,7 min: das Ziel ist verfehlt, und die Wand sieht es nicht | **ERSETZEN**: Gruppen und Fristen sind Werkzeug-Ausgabe, `ci-zeiten.cjs` schreibt sie selbst und sie sind nie ein ROT im Zug. Das Puls-Ziel misst der echte Lauf (p50 der letzten 20 Pulse ≤ 2 min, WARN mit Täter-Schritt) |
| 4 | **S0 Boden-WGSL ≤ 100 000 Zeichen** (`lib/shader-kosten.cjs:70`, Leser `diag-pruefbuehne.cjs:846`, Lehre 14) | swiftshader übersetzt das Boden-Programm vor dem ersten Bild, S0 hält seine Frist von 170 s | **nein**: Zeichen statt Übersetzungszeit | 12 Jobs in **4 Zügen**: 6b9ba94e 101 063 · 9407b2ee 101 179 · f773818c 122 088 · f7156b2a 100 211 Zeichen, die Neuläufe am selben SHA wieder rot (deterministisch) | **0 echt / 4 Reibung.** In allen 12 Läufen stand das Ziel: S0 im Bild auf swiftshader 27–62 s gegen die Frist 170 s, auf der GTX 14–15 s, auch bei 122 088 Zeichen (+22 %) | 161 Job-min. 4 Züge rot, keiner allein (je 1–3 weitere rote Jobs). Dazu Quetsch-Nacharbeit, z301 fiel um 211 Zeichen | **main 99 436, Rest 564 Zeichen (0,56 %)**: fester Deckel, main direkt darunter | **ERSETZEN** durch die Kompilier-Zeit in ms auf GTX und Radeon und „nie im Weg des ersten Bilds" (Entwurf 3) |
| 5 | **Punkte: Stations-Deckel 45/90 s + `deckel.json`** (`punkte.cjs:151–154`, Eichung `deckelAus` `:2126`: ⌈1,5 × p90⌉ + 6 s, mindestens 10 s) | „Eine komplette Fahrt durch jedes System max 30 min" | **nein**: Wanduhr je Station. Die Eichung mischt schnelle ROT-Läufe ins p90 | **762 Deckel-Risse** auf der GPU (gtx 461, radeon 308). Dazu 426 „Frist der Probe gerissen", 243 „Fahrt riss", 238 „Sitzung trägt nicht" | Nach einem Riss folgte am selben Gerät 616× wieder UNGEMESSEN, 73× ROT gemessen und 30× GRÜN, nie am selben SHA. **Deckel 10 s riss 248× an 62 Stationen, deren Grün-Läufe median 44,6 s brauchen (max 84 s)**: Der Deckel steht bei einem Viertel des Bedarfs | **27 133 s = 452 min GPU-Zeit am Deckel.** Von 2 916 GPU-Ereignissen sind nur **495 GRÜN (17 %)**, 667 ROT gemessen und **1 754 UNGEMESSEN (60 %)** | 248 Risse am Boden von 10 s · 176 am Gesetz von 45 s (die grünen median 39 s, p90 80 s) | **ERSETZEN** (Entwurf 2) |
| 6 | **Punkte: Fahrt ≤ 1 800 s** (`FAHRT_MAX_S`, `punkte.cjs:154`) | dasselbe Schöpfer-Wort „max 30 min" | ja: das Gesetz selbst, auf einem eigenen Gerät | 243 Stationen „Fahrt riss" | Folge der Zeile 5: die Deckel verbrennen die Fahrt | in Zeile 5 enthalten | — | **BEHALTEN**; heilt mit Entwurf 2 |
| 7 | **DECKE**: scripts/ +0 Atome je Stand (`diag-betriebsgesetz.cjs:142–149`) | der Prüf-Apparat wächst nie still | **nein**: Atome ohne Kommentare | **44** (alle im Puls, 31 Zweige, 35 SHAs) | 0 echt: die Wand sieht keinen Spielfehler. Die Nacharbeit ist Quetschen oder „die Decke bezahlt" | 124 Job-min · **25 Commits „Decke bezahlt/zahlt"** · 127 von 476 Commits seit 01.11. nennen Atome (27 %) · w22-ci-diaet zahlte 2 876 Atome | +0 erlaubt: jede neue Linse reißt sie, so gebaut | **STREICHEN** zugunsten von Zeile 8: die DECKE ist strenger als die Wachstums-Wand, die für scripts/ damit tot ist (zwei Wände für EIN Ziel) |
| 8 | **WACHSTUMS-WAND**: Prüf ≤ ½ Spiel-Atome (`:150–153`) | Prüfen wächst höchstens halb so schnell wie das Spiel | Ersatz (Atome), aber **relativ** zum Spiel | 27 (Puls, 18 Zweige) | 0 echt / 27 Reibung, je Push gemessen: ein Linsen-Commit vor seinem Spiel-Commit reißt sie | 77 Job-min | integ-Push: Prüf −181 gegen erlaubt 2 367 | **BEHALTEN als die EINE Atom-Wand**, das Fenster = der Zug (Merge-Basis integ-probe), nicht der Push |
| 9 | **Stamm-Datei ≤ 4 000 Zeilen** (`diag-atlas.cjs:166`, `spec/stamm/ratsche.json`) und scripts-Datei ≤ 4 000 (`diag-betriebsgesetz.cjs:313`) | jede Datei ein lesbares Modul | Ersatz (Zeilen) | 13 im Puls (R2 DECKE) | 0 echt / 13 Reibung; die Heilung ist mechanisch (`stamm-umzug --nach-karte`) | klein (~35 Job-min) | **speicher-welten.js 3 998 (Rest 2)** · siedlung-ort 3 989 · kreatur-verhalten 3 986 · diag-altlasten 3 938 | **BEHALTEN**. Der Rand von 2 Zeilen ist die nächste Puls-Röte; die Karte teilt im selben Lauf, nicht als Nacharbeit |
| 10 | **Siegel-Wörter** (`diag-betriebsgesetz.cjs:37–41`, nur `git log -1`) | „fertig" ist illegal, solange PFLICHT-OFFEN Einträge trägt | Wort-Treffer am HEAD | 2 (1 SHA, „fertig") | echt 2 (das Wort stand wirklich da) | 5 Job-min | 0 Treffer heute | **BEHALTEN** mit Unicode-Wortgrenze: `\b` gilt nur für ASCII, darum sind „Fußschluss" und „Schluss-Takt" ROT. „Kronenschluss" ist es nicht (n vor s, keine Grenze) |
| 11 | **ZITAT-WAND** (`:200–262`) | ein Dokument nennt nur Lebendes | **ja** (der Pfad existiert oder nicht) | 12 (Puls, 8 Zweige, w5-*) | **12 echt**: CLAUDE.md nannte `bericht/…`-Pfade aus main; verlegt nach koordination | 31 Job-min | 0 | **BEHALTEN** |
| 12 | **Trias 70 000 Dreiecke** (`diag-trias.cjs:34`) | die Fernstufe der Architektur bleibt billig | Ersatz (Tris im Null-Renderer) | 2 (1 SHA, Zug) | nicht entschieden | 28 Job-min | ~28k gemessen, also 2,5× | **BEHALTEN** (billig, weiter Rand) |
| 13 | **typeof-Ratsche 873** (`diag-apparat.cjs:38`) | der Bestand sinkt nur | Ersatz (Zählung) | 0 | — | 0 | 29/873: die Ratsche wurde nie nachgezogen und ist damit zahnlos | **RELATIV**: die Ratsche schreibt den Bestand am Zug selbst nach |
| 14 | **Frozen-Liste ≤ 5 · Logbuch ≤ 40 · Stand ≤ 40 Zeilen** (`:412/26/438`) | Scope wächst nie still, die Chronik ist git | Ersatz (Zeilen), aber nah am Ziel | 0 | — | 0 | 5/5 · 20/40 · 16/40 | **BEHALTEN** (Schöpfer-Gesetz, kostet nichts) |

**Muster „fester Deckel, main direkt darunter":** S0-WGSL (0,56 %), Stamm-Datei (2 Zeilen), (T) ALT (1 Merge), (T) FRIST (0,9 min), Läufer-Plätze 20/20, DECKE (+0). Jede Änderung in ihrem Bereich reißt sie, ohne dass das Ziel sich bewegt.

**Wanduhr-Urteile auf geteilten Läufern:** Das sind die Zeilen 1–3 und 5. Zusammen kosten sie die meisten Zug-Minuten (≥ 2 351 Job-min ohne die Neuläufe), 4 + 21 rote Zug-Läufe und 60 % der GPU-Stationen. Bei Ego-240 und S0 war das Ziel im selben Lauf auf dem echten Gerät erfüllt.

**Die teuersten drei** nach verlorenen Zügen, Minuten und Nacharbeit:

- (1) die Linsen-Wanduhr, samt dem 22-min-Not-Aus und den (T)-Fristen;
- (2) die Stations-Deckel der Punkte-Maschine;
- (3) S0-WGSL ≤ 100 000.

Die DECKE kostet am meisten Commits (27 % nennen Atome), aber keinen Zug; ihr Ersatz ist ein Streichen (Zeile 7/8), kein Entwurf.

## Entwurf 1 — Linsen urteilen in Bau-Ereignissen, die Uhr ist nur Not-Aus (Ego-Schatten 240 s und die Klasse)

**Gesetz.** Eine Linse urteilt, was die Welt tat: Bauten, fertige Pipelines, gezeichnete Bilder, Takte. Wie schnell der Läufer war, urteilt sie nie. Lehre 26: „Wände urteilen in Bau-Ereignissen, nie in Wanduhr-Sekunden". Die Uhr ist ein Not-Aus, und ihr Ablauf heißt `UNGEMESSEN (Läufer <name>)` beim Schritt, nie ROT am Gesetz. Nicht fail-soft: Ein UNGEMESSEN hält den Zug wie ein ROT. Der Neulauf geht aber auf den echten GPU-Läufer, nicht noch einmal auf swiftshader.

**Messung.**

- **Leib-Stufe:** `diag-ego-schatten.cjs:530/546` wartet auf die Leib-Stufe 0 durch den EINEN Warter `__deckel` (`lib/welt-boot.cjs:309`). Gezählt werden Gänge und Bau-Ereignisse.
- **Urteil:** „Die Stufe steht ≤ 2 Bilder nach ihrer letzten fertigen Pipeline." Das ist dasselbe Maß wie der Bundle-Bürger der Erst-Zeichnung (`check.yml:409`). Fehlt nach der letzten Pipeline und N Bildern noch ein Bau, ist das ROT „Leib steht nie" mit dem Täter-Stoff.
- **Gerät:** Der Ego-Schatten läuft heute schon auf der GTX in 29–37 s (n = 30 seit 07.11.). Der swiftshader-Lauf wird zur Mechanik-Probe ohne Wanduhr-Urteil.

**Schwelle aus dem Ziel.**

- Ereignis: 0 fehlende Bauten nach der letzten Pipeline + 2 Bildern (die Zahl kommt aus dem Bundle-Gesetz, nicht aus der Uhr).
- Not-Aus: 3 × p99 des Schritts aus `spec/ci/ci-zeiten.json` je Läufer-Klasse, geschrieben von `ci-zeiten.cjs`. Swiftshader-p99 heute ~213 s ergibt 640 s; die GTX liegt bei ~37 s, also 110 s.
- Dieselbe Regel gilt für Erst-Zeichnung 120/600 s, Probe 600 s, `protocolTimeout` 180 s und den Job-Deckel 22 min (2 × p99 = 38 min).

**Mutanten.**

- (a) Die Leib-Stufe 0 baut nie: `_kreaturStufeBau` kehrt ohne Bau zurück. Erwartet ist ROT „Leib steht nie" mit Stoff-Name.
- (b) Die Stufe baut, aber 300 s verzögert (künstlicher `setTimeout` im Bau). Erwartet ist GRÜN im Gesetz, denn das Gesetz urteilt nie Tempo, plus „UNGEMESSEN (Läufer)", sobald 3 × p99 überschritten ist.
- (c) Der Leib wirft keinen Schatten. Der bestehende Selbsttest „LEIB WIRFT NICHT" muss ROT bleiben.

**Beleg, dass er echte Fehler weiter nennt.** (a) und (c) sind genau die Fehlerklasse der Wand. Die heutigen Rotläufe 2f70c000, 4dbc18cc und f7156b2a werden unter dem Entwurf grün, denn GTX 30–31 s, Gesetz erfüllt.

## Entwurf 2 — Stations-Deckel aus GEMESSENEN Grün-Läufen, ein Lebenszeichen statt Gesamt-Uhr (Punkte-Maschine)

**Gesetz.** Der Deckel einer Station ist ein Not-Aus relativ zu ihrer eigenen grünen Geschichte auf diesem Gerät. Eine Station, die ein Lebenszeichen gibt (eine Phase oder ein Bild im Strom), wird nicht getötet, solange die Fahrt ≤ 30 min trägt.

**Wurzel (gelesen).** `laufSekunden` (`punkte.cjs`, vor `deckelAus`) legt jeden gemessenen Lauf in die Reihe, auch einen schnell roten. Ein ROT nach 2 s drückt das p90 unter 2,7 s, und `deckelAus` setzt dann `DECKEL_MIN_S` = 10 s.

Die Folge in Zahlen: 62 Stationen tragen 10 s, ihre Grün-Läufe brauchen aber median 44,6 s. Dort riss der Deckel 248-mal.

**Messung.**

- `deckelAus` liest nur Läufe mit `gruen: true` oder mit einem Urteil, das nach der Grundstellung fiel. Schnelle ROT und `s ≤ 0` (Sitzung bricht) fallen aus der Reihe.
- Deckel = ⌈2 × p90_grün⌉ + 6 s. Mit weniger als 3 Grün-Läufen bleibt der Deckel bei `PROBE_DECKEL_S` 45 s, nie unter dem höchsten je grünen s.
- Die Leine: Die Probe meldet Fortschritt über den Strom (`strom.ndjson`, die Wache `fahreSitzung`). Der Deckel tötet nur, wenn seit 15 s kein Ereignis kam.
- Gerät: radeon, gtx und headless getrennt (`DECKEL_KARTEN`).

**Schwelle aus dem Ziel.** Σ Deckel je Teil ≤ `FAHRT_MAX_S` − Boot. Das hält `fahrtTeile` heute schon. Der Einzel-Deckel folgt dem Bedarf, die Summe dem Schöpfer-Wort.

**Mutanten.**

- (a) Eine Station hängt ohne Strom-Ereignis. Erwartet: nach 15 s Stille UNGEMESSEN beim Namen, die Fahrt läuft weiter.
- (b) Der Fall von heute als Selbsttest: Reihe [2 s ROT, 2 s ROT, 41 s GRÜN, 44 s GRÜN, 48 s GRÜN]. Die neue Eichung muss ≥ 102 s geben, die alte gab 10 s.
- (c) Eine Station misst ein ROT-Gesetz (Zahl außerhalb des Solls) in 20 s. Sie bleibt „ROT gemessen", der Deckel ändert das Urteil nie.

**Erwartung.** Die 248 Risse am 10-s-Boden fallen, ebenso der Großteil der 616 Folge-UNGEMESSEN. Die 452 GPU-Minuten am Deckel werden Messung. Das prüft die nächste Eich-Fahrt (vorher 17 % GRÜN, 60 % UNGEMESSEN).

## Entwurf 3 — Boden-Programm: Kompilier-Zeit in ms auf echter GPU, nie im Weg des ersten Bilds (S0 ≤ 100 000 Zeichen)

**Gesetz.** Das Boden-Programm `voxelChunkMaterial` ist übersetzt, bevor sein erstes Bild gebraucht wird, oder es wird asynchron übersetzt, während der Ladeschirm steht. Auf dem Standardgerät kostet es höchstens einen festen Teil der Ankunft. Seine Zeichenzahl ist Ausgabe, kein Urteil.

**Messung.**

- **Wo:** `diag-pruefbuehne.cjs` S0 (die Probe `S0_STOFF.urteil`). Gemessen wird die Zeit von `createRenderPipelineAsync` der Boden-Pipeline bis „fertig", kalt und ohne Pipeline-Cache.
- **Schon im Log:** Den Stempel trägt die stall-akte bereits („Pipeline MeshStandardNodeMaterial · vs 9128 fs 61771 Zeichen"). Ob die Pipeline auf dem Pfad des ersten Bilds synchron lag, sieht die Erst-Zeichnungs-Wand („drei neue Stoffe ohne synchrone Pipeline").
- **Gerät:** GTX 1060 (omen-gtx1060, Label `echt-gpu`) und Radeon 890M (`gpu-probe`).
- **Swiftshader:** behält nur „S0 steht in der Frist von 170 s". Heute braucht S0 dort 27–62 s, also 2,7× Rand.

**Schwelle aus dem Ziel.**

- Aus PFLICHT-OFFEN B (Ankunft ≤ 5 s kalt) darf die Boden-Pipeline ≤ 5 % der Ankunft kosten: ≤ 250 ms kalt auf GTX und auf Radeon.
- Relativ dazu: nie mehr als main + 10 % (ABAB, ≥ 4 Boots je Seite, Lehre 19/Werkbank).
- `bindungInFunktionMax 0` bleibt: Das ist ein Korrektheits-Gesetz, kein Ersatz (swiftshader sagte die Pipeline ab).

**Mutanten.**

- (a) Der K17-Fall: das Fels-Gesetz ausgeschrieben im Pixel (78 Ziehungen, 149 521 Zeichen; die Frist auf dem Läufer riss bei 171 s). Er muss auf swiftshader an der Frist und auf der GPU an ms ROT werden. Die ms dieses Falls auf GTX und Radeon werden einmal gemessen, bevor die Schwelle gilt.
- (b) Die Boden-Pipeline wird synchron (`createRenderPipeline`) auf dem Pfad des ersten Bilds gebaut. Erwartet: ROT an der Erst-Zeichnung.
- (c) Eine Hilfs-Funktion liest eine Bindung. Erwartet: ROT wie heute.

**Beleg.** Die vier gesperrten Züge (100 211–122 088 Zeichen) hätten unter diesem Entwurf gegolten. Ihr S0 stand im Bild in 14–15 s auf der GTX und in 27–62 s auf swiftshader.

## Ehrlich offen in dieser Inventur

- **Echt oder Reibung unbewiesen:** Von den 120 Wanduhr-Jobs sind 29 als Reibung bewiesen (gleicher SHA später grün). Für die übrigen 91 fehlt die Gegenprobe auf echter GPU. Ego-240 ist für alle 3 Züge entschieden.
- **ms des Boden-Programms:** Die Zahl auf GTX und Radeon ist ungemessen. Entwurf 3 braucht sie vor der Schwelle.
- **Nicht eigens gelesen:** `koordination:zug/` und `cloud-post/` (die API deckt dieselben Läufe).

Die Pflicht-OFFEN-Liste ist unverändert: A, B, C, E, F.
