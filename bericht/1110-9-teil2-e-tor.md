# Bericht 1110-9 Teil 2 — das Tor-L0 auf seiner Band-Zeile (welle-m-e-tor)

1. **Geschnitten:** Ein Detail-Gesetz gilt für Röhren und Ringe in porta-core: Sehnen-Fehler 1 cm, höchstens 1 m je Segment, der Winkel per atan2. Die sieben Tore tragen auf L0 jetzt 7 126 – 51 096 Dreiecke statt 62 696 – 183 756. Alles außer den 3 296 Röhren und Ringen ist byte-gleich.
2. **Gemessen an der Genesis** (ABAB 3+3, GTX 1060, mit Takt):
   - Dreiecke 2 276k → 977k, VRAM 141,6 → 121,6 MB.
   - Befehle 226 → 226 und CPU-Takt p95 7,5 → 7,8 ms bewegen sich nicht.
   - Die Genesis liegt damit noch in vier Kriterien über E. Nächster Täter bei den Dreiecken ist der Wurf der Tore in die nahe Kaskade (k0 181k). Bei Befehlen und CPU-Takt sind es die 13 Stoff-Züge je Tor und Pass.
3. **Dieselbe Gestalt:** Die Bild-Paare sind in EINER Welt gemacht, die Tor-Geometrie wird je Mesh getauscht.
   - Hauptbild: IoU ≥ 0,997 bei 2,6, 11 und 30 m (±1 px).
   - Schatten: ≥ 0,997 bei 2,6 und 11 m (±2 px).
   - Schatten bei 30 m: 0,967 – 0,978. Die Linse selbst kommt dort nur auf 0,975 – 0,978 (dieselbe Gestalt zweimal).
4. **Ein Vertrags-Akt, ein Commit** `50ea40aa` (per `git ls-remote`), CI 38189585034 `[ci voll]`. Neu geprägt sind:
   - die 16 Tor-Goldens,
   - zehn Zahlen der TOR_HUELLE,
   - die Budget-Ratsche `gate[0]`: tris 184000 → 52000, band fällt,
   - die eine Zahl in `render-config.json` und ihr Hash im Manifest.

Auftrag: `auftrag/1110-9-omen-e-messung.md` (koordination 3fb7408c). Freigaben: Re-Mint der Tor-Goldens (deine Nachricht nach Teil 1), TOR_HUELLE (12.10.), die Budget-Ratsche (12.10.).

Basis: integ-probe **858ed586** per `git ls-remote` (beim Start). Rohdaten: `bericht/1110-9/teil2/` (`abab/`, `bild/`, `bilder/`, `zahlen/`, `waende/`, `skripte/`).

## Geschnitten — der Vertrags-Akt in porta-core

**Pfadliste des Commits** `50ea40aa`:
- `porta-core.js`
- `spec/asset-contract/v4/golden/gates.json`
- `spec/asset-contract/v1/golden/render-config.json`
- `spec/asset-contract/v1/golden/manifest.json`

**Das Gesetz** (`porta-core.js`, Block „DAS DETAIL-GESETZ der Röhren und Ringe"):
- `tubeMesh` teilt längs nach der Krümmung der Kurve (∫ √(κ/8ε) ds, umparametrisiert). Je Segment sind es höchstens 1 m, um den Umfang π/acos(1 − ε/r).
- `torusMesh` und der Rand-Ring teilen nach dem Radius.
- Die Zahl des Aufrufers ist die Höchst-Teilung. Objekte, Rahmen und Stoffe bleiben.

Je Tor (L0, `zahlen/teile-vorher.txt` · `zahlen/teile-nachher.txt`):

| Tor | vorher | nachher |
|---|---|---|
| drachentor | 150 200 | 51 096 |
| maurentor | 183 756 | 37 850 |
| verkalkt | 171 028 | 42 308 |
| maschine | 167 184 | 27 520 |
| kathedrale | 110 200 | 18 702 |
| ruine | 88 384 | 14 640 |
| geisttor | 62 696 | 7 126 |

**Zwei Lehren auf dem Weg:**
- **ULP-Robustheit:** Der erste Entwurf maß den Winkel mit `acos(t0·t1)`. Die PLATTFORM-PROBE v4 kippte damit je 7 Fälle unter pow und hypot ±1 ULP: acos nahe 1 verstärkt das Rauschen, die Wurzel und `ceil` kippen die Teilung. Mit `atan2(|t0×t1|, t0·t1)` kippt 0 (`waende/nachher/porta-contract.txt`).
- **Die 1-m-Kappe:** Ein Krümmungs-Gesetz allein gab geraden Pfosten keine Ringe, nur Fuß und Schulter. Die Tor-Hülle misst Ecken und sah den Pfosten der maschine darum 37 cm schmaler als gezeichnet (pfostenX 2,29 statt 2,66). Der Blocker hätte den Spieler in den Pfosten gelassen. Seit der Kappe trägt jeder Pfosten Ringe ≤ 1 m.

**Wände** vorher grün, nach dem Gesetz ROT beim Namen, mit dem Re-Mint grün:

| Wand | vorher (858ed586) | Gesetz, vor dem Re-Mint | nachher (50ea40aa) |
|---|---|---|---|
| gate:porta-contract | EXIT=0 | ROT: Goldens 16 Fälle (sha256) · Tor-Hülle 10 Zahlen (`waende/nach-gesetz-vor-mint/porta-contract.txt`) | EXIT=0, PLATTFORM-PROBE 0 Flips |
| gate:asset-contract | EXIT=0 | ROT: „Selbsttest der Budget-Wand feuert nicht", gate[0].tris halbiert = 92 000 > 51 096 (Rohlog vom Nachlauf überschrieben) | EXIT=0, 128/128 Goldens, „gate[0] 51096/52000" |
| npm run check (studio-vertrag) | EXIT=0 | ROT: „B2c: lod.budget.gate[0].band muss … < tris sein" (`waende/nach-gesetz-vor-mint/check-studio-vertrag.txt`) | EXIT=0 |
| membran-gesetz · portal-gestalt · nervensystem-porta | EXIT=0 | EXIT=0 | EXIT=0 |
| portal-membran (Durchgang: Öffnung frei, Pfosten solide, Hindurchgehen = Betreten, seitlich nicht) · blocker-netz · kollision-bild · worker-dichte · lint | – | – | EXIT=0 |

Alle Rohlogs der letzten Spalte liegen in `waende/nachher/` (`gates-exit.txt`). Lint meldet 2 Warnungen in `anazhRealm.js`, beide nicht von mir.

**Neu geprägt** (`zahlen/byte-beweis.txt`):
- **Tor-Goldens v4:** Alle 16 Fälle tragen neue `vertices` und `sha256`, `cv` und `minted` bleiben. Beispiel drachentor-L0: 90 720 → 34 040 Ecken.
- **TOR_HUELLE:** Zehn von 63 Zahlen wurden neu geprägt, je 1–2 cm nach innen. Die anderen 53 bleiben.
  - drachentor obenX 2,69 → 2,67 (beide Seiten), geisttor obenX 2,36 → 2,34 (beide Seiten)
  - maschine pfostenX 2,67 → 2,66 (beide Seiten)
  - Oberkanten: kathedrale 8,57 → 8,56, maschine 7,14 → 7,13, verkalkt 7,36 → 7,35, ruine 6,83 → 6,81
- **Budget-Ratsche:** `gate[0].tris` 184000 → 52000 (gemessenes Maximum 51 096, auf das Tausend gerundet wie zuvor 183 756 → 184000). `band: 60000` fällt. Der Studio-Vertrag sagt dazu: „erreicht die Stufe das Band, fällt das Feld und tris IST das Band".
- **render-config:** dieselbe Zeile in `v1/golden/render-config.json` und ihr Hash im Manifest.
  - Geprägt mit dem Werkzeug des Vertrags: `MINT_NUR_DATEN=1 node scripts/mint-asset-goldens.cjs`.
  - Alle drei Daten-Kanäle melden „=" (`waende/nachher/mint-nur-daten.txt`): meine Zeile ist byte-gleich zum lebenden Umschlag. Im Manifest ändert sich nur der render-config-Hash 3663ea1b → 4c00852a.

**Byte-Beweis**, vorher gegen nachher in Node (`zahlen/byte-beweis.txt`, `skripte/tor-byte-beweis.cjs`):
- **Bau, 7 Tore × 2 Saaten:** 5 340/5 340 Objekte gleich im Rahmen (Typ, Name, Weltmatrix, Material, Sicht, Reihenfolge, userData). 2 044/2 044 übrige Geometrien sind byte-gleich (Kasten, Zylinder, Membran, Form). Neu geteilt sind genau die 3 296 Röhren und Ringe.
- **Daten und Rechnungen:** 54 von 55 sind gleich. Das eine ist `PORTAL_RENDER_CONFIG`, die Budget-Zeile. Die Rechnungen sind gateParams, deriveGate, membranUniforms, membranPalette, messen und archProfile je Rezept, keine wirft.

## Gemessen — Genesis-ABAB mit Takt

Die Messung lief so (`abab/serie.sh`, `abab/fortschritt.log`):
- Instrument omen-messfolge aus `welle-m-e-messung` 3ccdcaea.
- A = 858ed586, B = welle-m-e-tor; je Boot frisch, Folge A B A B A B, Regler voll.
- Die Seiten-Wache prüft je Boot den servierten porta-core (A 543555e773db4a78, B 212386d2f556cd43).
- Alle 6 Boots: Urteil GRÜN, exit 0.
- **Stand der Seite B:** der Arbeitsbaum vor dem letzten Daten-Schliff. Danach fielen `band: 60000` und kam ein Kommentar dazu.
  - Die Geometrie ist byte-gleich zu `50ea40aa`.
  - `band` liest der Stamm nicht; nur die Anzeige der Budget-Wand liest es.
  - Die Bild-Paare liefen schon auf den Bytes von `50ea40aa`.

| Kriterium | Soll E | vorher (Median) | nachher (Median) | Rest zu E | nächster Täter beim Namen |
|---|---|---|---|---|---|
| Frame p95 (Regler voll) | ≤ 33 ms | 25,1 | 25,1 | −7,9, hält | – |
| CPU-Takt p95 | ≤ 5,8 ms | 7,5 | 7,8 | **+2,0** | Der Render-Pfad je Befehl, nicht je Dreieck (siehe Befehle). Der Schnitt bewegt ihn nicht: Boots 7,1–7,7 gegen 7,6–7,8 |
| Befehle | ≤ 208 | 226 | 226 | **+18** | Klasse `bau` 156 (Soll 40). Die Tor-L0 zeichnen 113 davon (maurentor 25, drachentor 24 mit 2 Exemplaren, verkalkt 24, maschine 14, kathedrale 9, ruine 9, geisttor 8). Es sind die 13 Stoff-Züge je Tor und Pass (Budget-Zeile `draws: 13`) |
| Dreiecke | ≤ 680k | 2 276k | **977k** | **+297k** | Die Tore tragen noch 436k, davon **k0-Wurf 181k**: Stufe 0 wirft sich selbst, Budget-Zeile `schatten: 0`. Danach `bodenSatz` 237k (Soll boden 200k) und `portal-membran` 65k |
| VRAM | ≤ 118 MB | 141,6 | **121,6** | **+3,6** | Szene-Puffer 36,5 MB (Wiese 27,4): `bodenSatz` 17,25, Tor-L0 7,76 (vorher 27,66) |

Rohdaten:
- je Boot: `abab/g{A,B}{1,2,3}.json`
- Mediane: `abab/auswertung.md`
- je Tor und Pass: `abab/tor-zensus.txt`

Die Tore allein sinken von 1 732k auf 436k Dreiecke (k0 620k → 181k). Ihre Puffer sinken von 27,66 auf 7,76 MB, das ist das ganze VRAM-Delta von −20,0 MB.

**Takt:** Die GPU lief in jedem Lauf am Leistungs-Deckel, A 1709,7–1746,3 MHz, B 1718,2–1739,2 MHz (`kurz.laufVoll.takt` je Boot). Der Frame p95 sitzt auf dem 120-Hz-Raster (25,0 ms), auf beiden Seiten gleich.

**Lesart:** Der Schnitt trifft Dreiecke und VRAM an ihrer Wurzel. Befehle und CPU-Takt hängen nicht an den Dreiecken: die Zahl der Stoff-Züge bleibt, und mit ihr der Render-Pfad.

Die nächsten Schnitte, nach Abstand geordnet:
1. **Der Tor-Wurf** (k0 181k, gut 60 % des Dreieck-Rests). Ein eigener Wurf-Teil der Stufe 0, wie der Schatten-Teil der Bäume.
2. **Die Stoff-Züge** der Tore (113 Befehle). Ein Atlas der Tor-Stoffe senkt Befehle und CPU-Takt zugleich.
3. **`bodenSatz`** (237k, 17,25 MB).

Das Dorf (VRAM 125,2 MB, `bauSatz` 9,3 MB) bleibt auf meiner Liste; dieser Schnitt berührt es nicht.

## Gemessen — dieselbe Gestalt (Bild-Paare, IoU)

**Ausgabe-Pfad unter der Bühne** (`werkbank bild`: `__buehne`, echter Frame 1920×1080, 32 TRAA-Takte, Phase und Uhren fest).

**Die Blicke** (`bilder/paar-*.jpg`). Die Membran ist in jedem Bild im Blick.
- **2,6 m:** vor der maschine (Innenseite), auf Bogen und Membran.
- **11 m:** der Spieler-Stand in der Ring-Mitte auf der Plattform, Blick +z auf maschine und verkalkt. Die Tore stehen mit rotationY 0; ihre Öffnungen zeigen nach ±z. Der Standard-Blick nach −x sieht die Tore von der Kante.
- **30 m:** vor der maschine, 30° von oben (26 m waagrecht, 15 m hoch), der ganze Ring über Klang und Plattform. Am Boden verdecken in 30 m Hügel, Felsen und Bäume den Ring.

**Die Masken** je Blick, je Seite (`skripte/tor-bild.cjs`):
- Hauptbild = |Tore sichtbar ohne Wurf − Tore weg| > 10.
- Schatten = |Tore nur in den Kaskaden (Ebene 30) − Tore weg| > 10.
- Für die Masken-Schüsse sind die Pflanzen aus, die Kaskaden-Box je Blick ist fest.
- Rausch-Pixel (leer gegen leer2 derselben Welt) sind ausgenommen.

**EINE Welt:** Die Tor-Geometrie der Welt A (71 Gruppen, 43 MB) ist gezogen und in der Welt B je Mesh gesetzt (`skripte/geo.cjs`). Rahmen und Leaves sind laut Byte-Beweis gleich. Die Folge war B1 · A1 · B2 · A2 (`bild/inwelt.log`).

| Blick | Hauptbild A↔B (±1 px) | Hauptbild streng | Schatten A↔B (±2 px) | Boden der Linse (B1↔B2 · A1↔A2) |
|---|---|---|---|---|
| 2,6 m | 0,9972 – 0,9973 | 0,990 | 0,9973 – 1,0 | Haupt 1,0 · 1,0 · Schatten 0,9972 · 0,9998 |
| 11 m | 0,9981 – 0,9982 | 0,984 | 0,9993 – 1,0 | Haupt 0,9999 · 0,9998 · Schatten 0,9998 · 0,9996 |
| 30 m | 0,9973 – 0,9978 | 0,971 – 0,972 | **0,967 – 0,978** | Haupt 0,9979 · 0,9982 · Schatten **0,9747 · 0,9781** |

Rohdaten: drei Paare je Zeile (A1↔B1, A1↔B2, A2↔B2) in `bild/iou-ergebnis.txt` und `bild/iou-W-*.json`; Masken-Zahlen je Lauf in `bild/W-*/masken.json`.

Wo die Silhouette wandert, zeigen `bilder/xor-*-koerper.jpg` (rot nur vorher, grün nur nachher): 1-px-Linien an den Bogen-Kanten der Röhren, die Polygon-Kante statt der feineren.

**Die offene Stelle — der Schatten bei 30 m:** Mit 0,967 – 0,978 liegt er unter 0,98, aber auf dem Boden der Linse.
- Dieselbe Gestalt zweimal in derselben Welt gibt dort 0,975 – 0,978.
- Die Abweichungen sitzen als kurze Kanten-Stücke unter den Gitter-Stäben (`bilder/xor-d30-wurf.jpg`). Schatten-Kanten wandern dort zwischen zwei Läufen um 1–2 px, ein Texel der nahen Kaskade.
- Die Linse trägt bei 30 m also keine 0,98. Der Unterschied A↔B liegt höchstens 0,008 unter ihrem Boden.
- Der Tor-Schatten bei 2,6 und 11 m, wo er groß im Bild steht, hält ≥ 0,997.

**Zur Stufe bei 30 m:** Steht der Spieler selbst 30 m vom Ring, zeichnet das Spiel die Tore als L2-Impostor (`impostor#fimp:atlas`, gemessen am Werkbank-Stand −5/0). Der Impostor wird aus der L0 gebacken.
- Das 30-m-Bild zeigt die L0 selbst in 30 m Bild-Maßstab, der Spieler bleibt im Ring.
- Das ist die strengere Probe: sie trifft genau die Geometrie des Schnitts.

**Die Linse über Sitzungen** (zur Einordnung, `bild/sitzungen-getrennt/`): Zwei frische Sitzungen derselben Seite (A gegen A2) kommen nur auf Hauptbild 0,95 (11 m) und 0,90 (30 m). Deshalb ist das Paar in einer Welt gemacht.

## Lehren für die Linsen

**Für die Gangtafel:** Das wahre Maß eines Asset-Budgets ist die Regler-Hülle, nicht die Rezepte. Beim Tor sind das 7 Rezepte × 27 Regler × min/max = 385 Bauten; ihr Maximum (75 608) setzt die Budget-Zeile, die sieben Rezepte allein (51 096) täuschen (siehe Nachtrag).

Fünf Fallen, jede verfälschte eine Zahl dieser Karte:
- **Bild-A/B über zwei Sitzungen hat einen Boden unter 0,98.** Die Tor-Geometrie wird deshalb in EINER Welt getauscht. `geo.cjs` zieht und setzt je Mesh; JSON trägt `drawRange.count = Infinity` als `null`, ohne Rückführung zeichnet die Gruppe nichts.
- **Pflanzen driften ohne Takt.** Laub und sein Schatten wandern zwischen zwei Schüssen, 6 000 Pixel je Schuss bei 30 m. Für Masken-Schüsse sind sie aus, wie die Lehre 0710-2.
- **Die Kaskaden-Box folgt dem höchsten Werfer** (`_kaskadenPassen`). Ein verstecktes Tor verschiebt das Tiefen-Raster, deshalb ist die Box je Blick fest.
- **Command-Substitution hält die Pipe offen.** `$(seite …)` mit einem Hintergrund-Server darin: unter Windows erbt der Server die Pipe, die Serie hing 10 min. Der Hash geht jetzt über eine globale Variable.
- **Backticks im Eval-Code.** Ein Backtick in einem Kommentar des Seiten-Codes bricht das Template-Literal. Keine Backticks im Eval-Code.

## Probe-Merge auf den neuen Kopf

integ-probe steht jetzt auf **a5f05612** (ls-remote 12.10.). Seit 858ed586 kamen ufer, fahr-bahn und kamera-kugel dazu. Der Merge von `50ea40aa` darauf ist sauber; Git führt `manifest.json` selbst zusammen (dort trägt integ-probe einen neuen recipes-Hash, ich den render-config-Hash).

Auf dem Probe-Merge stehen alle vier Wände bei EXIT=0: porta-contract, asset-contract (128/128), portal-gestalt und studio-vertrag (`probemerge/exit.txt` und die Logs daneben). Das Manifest trägt danach beide neuen Hashes: recipes 6b979a6e und render-config 4c00852a.

## Status: ZWISCHENSTAND · Übergabe

- **Pflicht-OFFEN Rest:** A · B · C stehen.
  - E ist an der Genesis mit Zahl offen: Dreiecke +297k, VRAM +3,6 MB, Befehle +18, CPU-Takt +2,0 ms.
  - Die Täter je Kriterium stehen oben beim Namen. Der nächste Schnitt ist der Tor-Wurf (k0 181k).
  - Das Dorf ist beim VRAM offen (+7,2 MB, `bauSatz`).
- **Zweig:** `welle-m-e-tor` **50ea40aa** (per `git ls-remote`), ein Commit über dem WIP 2c3cb6eb. CI 38189585034 `[ci voll]`, das Ergebnis im Nachtrag.
- **Instrument:** `welle-m-e-messung` 3ccdcaea, unverändert seit Teil 1, für das nächste Bündel.
- **Werkplatz:**
  - `welle-m-e-tor` (der Zweig)
  - `tor-vorher` (858ed586, Seite A der Messung)
  - `tor-probemerge` (Wegwerf, Probe-Merge auf a5f05612)

## Nachtrag 12.10. — CI 38189585034 auf 50ea40aa ROT, Nachbesserung d2b0a731

**ROT 1, `gate:regler-wirkt` (voll 10/11) — mein Fehler.**
- Die Budget-Zeile `gate[0].tris` 52000 hielt nur die sieben Rezepte.
- Die Wand fährt jeden Regler an seinen Rand (am drachentor) und fand fünf neue Brüche über 52000 (`nachbesserung/regler-wirkt-kopf.txt`): k=1 70 828 · rise=0,55 67 382 · mass=1 59 724 · depth=0 54 576 · orders=9 54 368.
- Die Ratsche `reglerBudget` hat Soll 0: „jede Gestalt verlässt das Studio auf ihrer Budget-Zeile — auch am Rand jedes Reglers".

**Die Hülle des Regler-Raums**, 7 Rezepte × 27 Regler × min/max = 385 Bauten in Node (`nachbesserung/regler-rand-*.txt`, `nachbesserung/regler-rand.cjs`):
- nachher: Maximum **75 608** (ruine wBraid=1)
- vorher: 256 284 (maurentor orders=9), schon über der alten Zeile 184000; ungesehen, weil die Wand den Rand nur am drachentor baut

**Die Zeile heißt jetzt** `gate: { 0: { tris: 76000, band: 60000, draws: 13, schatten: 0 } }`.
- Das Band ist wieder offen: die Rezepte liegen darauf (≤ 51 096), der Rand der Regler noch darüber.
- `render-config.json` und `manifest.json` sind per `MINT_NUR_DATEN=1` geprägt; nur render-config meldet „✔ neu", der Hash ist 510c8a7c (`nachbesserung/waende/mint-nur-daten-2.txt`).
- Geometrie, Goldens v4, TOR_HUELLE und alle Genesis-Zahlen bleiben.
- Auf d2b0a731 stehen alle bei EXIT=0 (`nachbesserung/waende/gates-exit.txt`):
  - regler-wirkt: 95/113 wirken, 0 brechen, 18 tot = Ratsche 18
  - check
  - porta-contract
  - asset-contract: „gate[0] 51096/76000 · Band 60000 (0.9×)"
  - portal-gestalt
  - worker-dichte
  - lint

**ROT 2, `gate:kampf-gefuehl` (voll 8/11, Schritt 75) — lokal nicht nachzubauen.**
- Kopf 50ea40aa und Basis 858ed586 laufen beide EXIT=0 GRÜN (`nachbesserung/kampf-*.txt`).
- Der Diff berührt nur porta-core und Goldens.
- Ob der Schritt in der CI von d2b0a731 wiederkehrt, zeigt der nächste Lauf.

**Status:** `welle-m-e-tor` **d2b0a731** (per `git ls-remote`), `[ci voll]`, CI ausstehend. ci-lokal (alle 156 Schritte) läuft auf denselben Bytes (`p3/tor/ci3`, Werkplatz).
