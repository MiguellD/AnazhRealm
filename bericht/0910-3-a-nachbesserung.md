# Bericht 0910-3 A, Nachbesserung: der vierte Weg, der Zwilling fällt, die Linsen schlank

Auftrag: `auftrag/0910-3-a-nachbesserung.md` (Gegenprüfung von 1457bfa9: ROT).
Kopf: **welle-m-render-fehler 130d9f21** (per `git ls-remote`), zwei Commits auf 1457bfa9 (73879d6a die Schnitte, 130d9f21
die Linsen unter dem CI-Soll). CI: Lauf 38021261668 auf 130d9f21, 5 von 5 grün.

## In drei Sätzen

**Geschnitten:**
- **ROT 1:** Die Hülle um `finishRender` lässt die Abfrage mit ihrem Render enden. Der nächste Frame mit Zähler 0 erbt
  keinen offenen Stellvertreter mehr.
- **ROT 2:** Der Wasser-Neubau im resize-Handler fällt ganz. Die Diät (Wächter 6) trägt jeden Größenwechsel. Der alte Name
  steht in `gate:altlasten`; was bleibt, ist der Tausch des Tiefen-KNOTENS für Linsen (`_tiefenKnotenTausch`).
- **Gelb:** Der stumme Stellvertreter meldet sich laut, `currentOcclusionQueryObjects` ist gepinnt, `--ohne-echt` ist fort.

**Gemessen:**
- Die neue Station L ist an 1457bfa9 ROT (4× „No occlusion queries are active“), am Kopf 0.
- Die Prüfung K der Fenster-Wand ist an 1457bfa9 und main ROT, am Kopf GRÜN.
- In der CI läuft die Verdeckungs-Abfrage 1,8 min (vorher 14,4), die Fenster-Wand 1,0 min (vorher 12,7).

**Ehrlich offen:**
- Der Original-Takt der Radeon (Bündel seitlich, 45 s) ist nicht nachgestellt. Station L stellt die Lage deterministisch.
- Die Fenster-Wand braucht das Fern-Wasser als ruhenden Leser, das Software-Holz schaltet es sonst ab.

## ROT 1: der vierte Weg

**Wurzel:** r184s `beginRender` setzt `lastOcclusionObject` nur bei Zähler > 0 zurück. Endet ein Probe-Frame mit einem
Stellvertreter, schließt der nächste Frame (Zähler 0) dessen Abfrage beim ersten Draw, und zwar in einem Pass ohne
Abfrage-Satz. Meine Hülle um den Pass-Bruch hätte im selben Frame dasselbe getan, denn sie las das veraltete Feld.

**Schnitt** (derselbe Block „Verdeckungs-Abfrage“): Nach `finishRender` fällt `lastOcclusionObject`. Den Abfrage-Satz lasse
ich stehen, denn r184 zerstört ihn im nächsten Probe-Frame über genau dieses Feld (`currentOcclusionQuerySet`).

**Station L** (`gate:verdeckungs-abfrage`):
- Der Aufbau: der Stellvertreter als letzter Draw (durchsichtig, renderOrder 1e6), im Wechsel sichtbar und unsichtbar.
- Nicht vakuös: Frames, die mit ihm endeten, und Null-Frames danach.

| | main 7dd944e6 | 1457bfa9 (geprüfter Kopf) | Kopf 130d9f21 |
|---|---|---|---|
| Ablauf | ROT: 6× „No occlusion queries are active“, 6× ungültiger Befehlspuffer, geschluckt `three: No occlusion …`, 7× weak set | 0 | 0 (6× gezählt, 5 begonnen) |
| Bruch | ROT: 5× „ended with incomplete occlusion query“ | 0 | 0 (6× offen gebrochen) |
| Gift | ROT: 8× „No occlusion queries“, 7× weak set | 0 | 0 (6 Gift-Draws) |
| **Letzter** | ROT: 4× „No occlusion queries“ | **ROT: 4× „No occlusion queries are active“ + 4× ungültiger Befehlspuffer** | **0** (3 Frames endeten mit ihm, 3 Null-Frames) |
| Urteil | ROT, 15 Verletzungen | ROT, 4 | **GRÜN** |

Gegen main und 1457bfa9 lief die Linse in der Fassung 73879d6a (8 Frames je Station); die Endfassung 130d9f21 fährt 6.

**Der `queryTakt`-Eingriff** der Linse wirkte auf dem eingefrorenen Gesetz nie. Er ist gestrichen, der Ablauf probt im echten
Takt (jeden 10. Frame, zwei Probe-Fenster nach dem Aussteigen). Die Beschreibungen in Linse und `check.yml` stimmen jetzt.

## ROT 2: der Zwilling fällt

- **Gefallen:** der Aufruf im resize-Handler.
- **Umbenannt:** `_tiefenLeserNeuBinden` heißt jetzt `_tiefenKnotenTausch`. Die Methode hat genau EINEN belegten Grund:
  Wechselt der Tiefen-KNOTEN selbst (das A/B des Wassers in `gate:post-kette`), ändert sich der Shader-Graph beider Leser.
  Das kann kein Wächter auffangen. `gate:post-kette` ist am Kopf GRÜN (umgehängt [1,1], 19 s).
- **Feld-Pass-Abbau:** Er hat keinen eigenen Grund, die Feld-Pass-Texturen haben feste Größen (Azimut × Radius / Elevation).
- **Altlast:** Der alte Name ist eine Zeile in `gate:altlasten` (GRÜN).
- **Die F-Wand** (GPU-frei, sie erzwang den Neubau) fällt mit ihm. Die Fenster-Wand ist jetzt der echte Frame allein:

| | main 7dd944e6 | 1457bfa9 | Kopf 130d9f21 |
|---|---|---|---|
| K kein Leser-Neubau im Handler (Quelle, kommentarfrei) | ROT | ROT | GRÜN |
| E1–E4 (vergrößern, DPR 2 über die Kappe, zurück, die Pixel-Ratio allein) | ROT bei E2–E4b: 2×, 5×, 2× „Destroyed texture [Texture "szene:tiefenabbild"]“, E4b über die GPU-Wache (+2) | GRÜN | GRÜN |
| ES ohne Wächter: Größen-Schritt (Fassung 73879d6a) | — | **0 (der Zwilling maskiert)** | 1–2× „Destroyed texture …“ |
| ES ohne Wächter: Pixel-Ratio-Schritt | — | geschluckt `three: Destroyed texture …` (GPU-Wache) | 1–2× (bzw. geschluckt `world-canvas: Destroyed texture …`) |
| Urteil | ROT | ROT | **GRÜN** (3 von 3 Läufen) |

Die Zeile ES an 1457bfa9 ist der Befund der Gegenprüfung als Zahl. Solange der Neubau im Handler stand, blieb der
Größen-Schritt ohne Wächter still. Jetzt fällt er (Fassung 73879d6a, 3 von 3).

Die Endfassung 130d9f21 fährt EINEN Boot. Nach den Fehlern eines Selbsttest-Schritts rendert der GPU-Prozess des Browsers
nicht weiter, auch keine frische Seite; ein zweiter Browser kostete einen ganzen Boot (CI 3,1 min). Deshalb ist der
Selbsttest jetzt der Pixel-Ratio-Schritt als letzter. Dass ein Größenwechsel keinen anderen Retter hat, hält K in der Quelle.

## PFLICHT: die Kosten der Linsen

| Linse | vorher lokal | vorher CI | nachher lokal | nachher CI |
|---|---|---|---|---|
| gate:verdeckungs-abfrage | 499 s | 14,4 min | **64–71 s** (73879d6a: 98 s) | **1,8 min** (73879d6a: 2,8) |
| gate:fenster-wechsel | 187 s (Maßstab 2/3, holz nah; in voller Größe 516 s) | 12,7 min | **19–28 s** (73879d6a: 33 s) | **1,0 min** (73879d6a: 3,1) |

Die CI-Gruppen laufen auf 130d9f21: 1/3 23,2 min · 2/3 20,1 min · 3/3 13,4 min (bei 1457bfa9: 23,2 · 32,9 · 32,4).

Wie, bei gleicher Schärfe:
- **Verdeckung:**
  - EIN Boot.
  - Einschwingen ohne GPU-Warten: Die Leine setzt den Render aus, das Streamen läuft.
  - Die Stoffe der Stationen bauen im Ablauf mit.
  - Gemessene Takte: Ablauf 2 + 4 + 3 und zwei Probe-Fenster nach dem Aussteigen; je Station 6 Frames; Viewport 320×180.
    Ein voller Spiel-Takt kostet auf swiftshader etwa 0,9 s; die Linse nennt ihre Teilzeiten (Ort 4,6 s, Wagen 3,9 s,
    Takte 20,4 s).
- **Fenster:**
  - Software-Holz `kienspan` mit der Pixel-Kappe des Holzes nah (1,25) und dem Fern-Wasser als ruhendem Leser des Abbilds.
    Das nahe Wasser des Software-Holzes zeichnet über den Wasser-Satz, dessen Abschnitte je Pass ohnehin auffrischen. Ohne
    ruhenden Leser wäre der Selbsttest still geblieben, das habe ich gemessen.
  - Je Schritt 3 gezählte Frames statt Wanduhr.
  - Der Selbsttest endet mit der ersten Meldung.
  - EIN Boot: Der Selbsttest ohne Wächter ist der letzte Schritt. Nach seinen Fehlern rendert der GPU-Prozess des Browsers
    nicht weiter.

## Gelb

- **Der stumme Stellvertreter ist laut:**
  - `_bundleQueryTick` merkt, ob der Renderer den Stellvertreter im letzten Probe-Fenster zeichnen wollte (`onBeforeRender`)
    und ob er im Abfrage-Feld steht.
  - Nach 6 Fenstern ohne Abfrage (`BERG_CULL.stummFenster`) meldet er einmal: ERROR „BERG-CULL STUMM: der Stellvertreter von
    regionBundle:… begann in 6 Probe-Fenstern keine Verdeckungs-Abfrage …“.
  - Werkbank (GTX, Wiese): ohne Gift 0 / 1 / 0 …, keine Meldung; mit vergifteter Pipeline 1 … 11 und die Meldung beim 6.
- **Gepinnt:** `currentOcclusionQueryObjects` in beginRender und resolveOccludedAsync (gate:vendor-anker 178 Anker).
- **`--ohne-echt`** ist fort, die Fenster-Wand hat keinen Notausgang mehr.
- **Die Zahlen von 3ff2c5da** stehen in der Commit-Message von 73879d6a.

## Wände

| Wand | Urteil |
|---|---|
| gate:verdeckungs-abfrage | Kopf GRÜN (64 s und 71 s; CI 1,8 min), 1457bfa9 ROT 4, main ROT 15 |
| gate:fenster-wechsel | Kopf GRÜN (19 s, 23 s, 28 s; CI 1,0 min), 1457bfa9 ROT, main ROT |
| gate:post-kette | Kopf GRÜN |
| npm run check (darin --selftest der Verdeckung mit 23 Fällen, altlasten, vendor-anker 178, ci-deckung) | GRÜN |
| lint | 0 Fehler (2 Warnungen wie auf main) |
| CI | Lauf 38021261668 auf 130d9f21: 5 von 5 grün (check 4,0 · erst-zeichnung 8,4 · playtest 1/3 23,2 · 2/3 20,1 · 3/3 13,4 min) |

Rohdateien: `bericht/0910-3-a-nachbesserung/` (je Linse Kopf, 1457bfa9, main; `k-zwilling`; `berg-cull-stumm`; `post-kette`).

## Offen (mit Grund)

- **Der Radeon-Takt** (Bündel seitlich, echter Animations-Loop, 45 s) ist am OMEN nicht nachgefahren. Station L stellt dieselbe
  Lage deterministisch (der Stellvertreter als letzter Draw, dann Zähler 0).
- **r184s Fehler-Bereich** um den asynchronen Pipeline-Bau vergiftet weiter jede Pipeline, die bei einem fremden Fehler baut.
  Jetzt ist es laut: als Zeile der GPU-Wache und, trifft es den Stellvertreter, als BERG-CULL STUMM. Geschnitten ist es nicht.
