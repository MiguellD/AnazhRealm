# Befund: Fahren im Gelände und am Wasser — gespielt im sichtbaren Fenster

Stand: main `2b60988b` (V18.531), Worktree `vigorous-nash-studio-bild`, Code unverändert, nichts committet.
Gespielt im sichtbaren Chrome (puppeteer `headless:false`, echte Radeon 890M, `echteWebGpuArgs()`, 1280×720),
save-server aus dem Worktree auf :7660, Steuer-Server :7661. Gefahren wurde mit echten Tasten (W/A/S/D, Shift,
E, Leertaste über `page.keyboard`). Eine Zeile unten links nannte jeden Schritt; für jedes Bild war sie ausgeblendet.

Werkzeuge (nur Lesen, keine Welt-Änderung außer Spawns):
- `_leben/fahren-gelaende/spiel.cjs` (Fenster + Steuer-Server)
- `_leben/fahren-gelaende/st.cjs` (Kommandozeile)
- `_leben/fahren-gelaende/werkzeug.js` (Orte-Suche + Fahrlog je Frame: Rad-Kontakt gegen Gesetz und Mesh, Nick/Wank, Tempo angezeigt und echt, Wasser, Blocker, Kreatur-Abstand)
- dazu die Kollegen-Sonde `_leben/fahren/konsole-fahrsonde.js` (`__fahrSetze`)

Ort: die Mess-Wiese (−900/−850) und ihr Umkreis bis 400 m. Bilder: `artifacts/profiband/leben/bilder-fahren-gelaende/`.
Zahlen: `artifacts/profiband/leben/fahren-gelaende-messung.json`.

---

## 0 · Drei Sätze

Geschnitten wurde nichts, denn das ist ein Befund. Gemessen im echten Fenster: Der gerittene Wagen verwirft je Frame die
Interpolations-Spanne seines eigenen Sim-Wegs (114 von 114 Frames als „Teleport“, 25,95 m simuliert, 10,27 m gefahren;
zu Fuß am selben Ort 0 von 40, 2,25 m simuliert, 2,27 m gegangen). Außerdem ist der eigene Wagen in der Verfolger-Kamera
nur zu 45 % sichtbar (4189 statt 9268 Wagen-Pixel), und er dreht sich ohne Lenkung (84° beim Zurückrollen).
Offen: 10 DEFEKTE, 6 V1-LÜCKEN und 8 NACH-V1-Posten; Pflicht-OFFEN unverändert (A–C, E).

---

## 1 · Was ich gesehen habe (Stationen)

| # | Station | Was geschah (Zahl) | Bild |
|---|---|---|---|
| S0 | Ebene, GT, Vollgas · Vollbremsung · Kurve · Shift-Drift | Drift entsteht (Gier 428° → 531°, vLat −3,7 m/s). Beim Bremsen tauchen die Vorderräder 7,4–11,1 cm in den Boden, die Hinterräder heben 5,4–9,6 cm ab. Auf welligem Grund (10–14°) steht der Wagen verwunden: zwei Räder 11–12 cm im Boden, zwei 14–16 cm in der Luft. Reiter „in der Luft“ in 421 von 421 Frames. | `02`, `03` |
| S1 | Hang längs 21° und 30°, aus dem Stand | 30°, 5 s W: GT 10,5 m bergauf, Supersport 11,0 m, **SUV nur 3,5 m**. Echtes Tempo 4,3 / 5,5 / 3,7 m/s bei angezeigten 6,8 / 11,8 / 6,2 m/s. Der Nick folgt dem Hang (Hang 30,4°, Nick 31,0°). | — |
| S1c | 21°-Hang, keine Taste | Der GT rollt rückwärts bis 4,7 m/s, 9,7 m weit, und **dreht sich dabei 84°** (Gier 83,7° → −0,3°). | — |
| S2 | Querhang 35,5°, fahren, dann 5 s stehen | 0,00 m Abdrift, Wank 36,7°, kein Rutschen, kein Kippen. Alle vier Räder schweben 4,5–19 cm über dem Boden. | `06-querhang-hinten` |
| S3 | Kuppe (Scheitel-Radius ~15 m), Vollgas aus 30 m Anlauf bergab | Angezeigt 17,7 m/s, real im Anstieg Ø 3,3 m/s. Der Wagen bleibt bei 32° Steigung 3,5 m vor dem Scheitel stehen; zum Abheben kommt es gar nicht. | — |
| S4 | Spalt-Graben (Felsspalt, Grund 23 m unter dem Rand) | Der Wagen springt in einem Frame 6,94 m bzw. 7,95 m nach unten (6 Sprünge > 0,5 m). Danach hängt er 16,7 m über dem Spaltgrund und 6,7 m unter dem Rand, Nick und Wank an der 40,1°-Klammer. | `07`, `22` |
| S4b | Plattform 1,0 m (Kante 1,34 m über der Rad-Ebene) | Die Kapsel hält 0,35 m vor der Kante, der Bug steckt 1,83 m in der Plattform. Befahrbar ist die Plattform nie. | `21` |
| S6 | Bäume, Hauswand, Bär | Fichte mittig: Bug 1,97 m (mit Nachschieben 2,32 m) im Stamm. Eiche 0,83 m neben der Mitte: der Wagen fährt hindurch, der Bug liegt danach 5,28 m hinter dem Stamm. Hauswand: Bug 2,17 m in der Wand. Bär: bei angezeigten 9,7 m/s steht seine Mitte 0,40 m vor der Wagenmitte, er steckt ganz im Wagen. | `11`, `12b`, `14` |
| S7 | Seeufer, 12-m-Streifen trockener Boden unter dem Seespiegel | Der Reiter gilt dort als unter Wasser, der Wagen kriecht mit 0,5–0,75 m/s. Wo die Lauf-Fläche beginnt, springt er in einem Frame 3,2 m hoch und schwimmt, mit 25° Bug-ab nach dem Seegrund. Ohne Gas treibt er mit 0,22 m/s seewärts. | `15`, `16`, `17` |
| S7a | Bach-Furt | Auf trockenem Boden 5 m vor dem Wasser bremst der Wagen von 10,1 auf 0,42 m/s, auf 1,2 m Weg und ohne Stoß („nasse Wand“). Danach kriecht er mit 0,43 m/s. | `20` |
| S7c | Fluss, Kern 3,2 m/s, Wagen quer, kein Gas | Er treibt mit 0,60 m/s (5,51 m), Wank −16°, Nick −15°. Nur das Dach ragt 0,31 m aus dem Wasser. Die Verfolger-Kamera zeigt Wasser mit Zebra-Streifen, der Wagen ist nicht im Bild. | `18`, `19` |
| S8 | Garage-Labor, Probefahrt | Reifenspuren und Drift sind da, Handbremse auf der Leertaste. Der Tacho zeigt „126 km/h“ bei 10,5 m/s, das sind real 37,8 km/h. | `23`, `24`, `25` |
| K | Verfolger-Kamera | Der eigene Wagen ist ein halb durchsichtiger Geist (A/B mit und ohne Dither-Maske). Die Kamera sitzt in Baumkronen. | `02`, `09`, `10a/10b`, `05` |
| R | Holzross (Kreatur-Ritt), dieselbe Probe wie D1 | 131 von 135 Frames „Teleport“, 3,66 m simuliert, 1,81 m geritten. | — |

---

## 2 · DEFEKTE: bestehendes System verhält sich falsch und wird geschnitten

**DEFEKT 1 · Jeder Ritt verwirft je Frame die Interpolations-Spanne seines Sim-Wegs (neu, die Wurzel vieler Symptome).**
- *Ursache:*
  - `tickAffordances` → `_tickMountedMovement` schreibt `pm.y = riderY` (`anazhRealm.js:50248`). Das passiert NACH `_applyFixedInterpolation` (`:85233` vor `:85252`), also auf dem interpolierten Spieler-Mesh.
  - Im nächsten Frame ist deshalb `mesh.position.equals(_fixedRenderPos)` falsch. `_loopFixedStep` hält das für einen Teleport und übernimmt die nachhinkende, interpolierte Position als Sim-Wahrheit (`:85617–85627`, `st._fixedSimPos.copy(mesh.position)` `:85625`).
- *Gemessen:* Gleicher Ort, 3 s W:
  - zu Fuß: 0 Teleport-Frames von 40, Sim-Weg 2,25 m, gegangen 2,27 m
  - im GT: 114 von 114, Sim-Weg 25,95 m, verworfen 15,67 m, gefahren 10,27 m
  - zweiter Lauf: 65 von 65, 26,29 m simuliert, 13,41 m gefahren
  - Holzross: 131 von 135
- *Folge:*
  - Der Wagen fährt 40–55 % seines Gesetz-Tempos; der Anteil hängt von der Frame-Zahl ab.
  - Das angezeigte Tempo (`playerVel`) ist 1,6–2,5× das echte.
  - Hangabtrieb und Bremse wirken über die volle Sim-Zeit, die Strecke dagegen nur zur Hälfte. Deshalb erreicht der GT die Kuppe nicht (S3), und am 30°-Hang kriecht er.
- *Schnitt:* Der Ritt führt die Sitz-Höhe im Sim-Schritt (vor der Interpolation), oder er stempelt `_fixedRenderPos` im selben Chokepoint nach. Linse: Teleport-Zähler im Ritt = 0, Sim-Weg = Fahr-Weg.

**DEFEKT 2 · Der Wagen dreht sich ohne Lenkung (neu).**
- *Ursache:*
  - Der Lenk-Pfad setzt `_rideSteer = true` je Sim-Schritt (`:86299`).
  - `_tickMountedMovement` läuft je Frame und setzt es zurück. In Frames ohne Sim-Schritt greift deshalb der Gier-Folge-Zweig (`:50273`, `yawFolgeK` 4, `fahrtGate` 0,4 m/s): Die Gier zieht zur Geschwindigkeits-Richtung.
- *Gemessen:*
  - 21°-Hang ohne Taste: In 14 von 192 Frames (die ohne Sim-Schritt) dreht die Gier zusammen 82,4°, der Wagen insgesamt 84°.
  - Spawn am 14°-Hang: 90° → 31,3°. Mit Shift im selben Eval bleiben es 84,8°.
  - 30°-Anstieg geradeaus: SUV −47°, Supersport −35°.
- *Folge:* Wer am Hang anhält, rollt rückwärts und steht dann quer oder verkehrt herum. Ein Drift wird je nach Frame-Zahl herausgezogen.
- *Schnitt:* Das Lenk-Recht des Gesetz-Fahrzeugs ist ein Zustand des Eintrags, kein Frame-Flag. Der Folge-Zweig gilt nur für Werke ohne `lenkung`.

**DEFEKT 3 · Der eigene Wagen ist in der Verfolger-Kamera ein Geist (neu).**
- *Ursache:*
  - Die Studio-Dither-Blende maskiert L0 nach Augen-Distanz × `uLodPerf` (`anazhRealm.js:29285`, Kante `D0 − fade0` = 8 m, Breite 4 m).
  - Die Kern-Kamera steht 9,6 m hinter dem Wagen (`vehicle-core.js:2244`), horizontal 9,05 m, unter Last × 1,3.
  - Einen L1-Band-Partner bekommen nur Bäume (`:51423` `_foundryPresetIsTree`). Der Wagen dithert also aus, und nichts blendet ein.
- *Gemessen:* Dieselbe Kamera, Maske an/aus: 4189 gegen 9268 Wagen-Pixel, also 45 % sichtbar. Dach und Kabine verschwinden zuerst.
- *Bild:* `10a-chase-maske-an` gegen `10b-chase-maske-aus`, dazu `02`, `09`, `15`, `20`.
- *Schnitt:* Der gerittene Eintrag ist Kamera-Ziel: Er bleibt L0 ohne Maske (Stempel `aLodLevel` 0 = ungemaskt), oder die Maske misst vom Fahrer statt vom Auge.

**DEFEKT 4 · Kollision über die Reiter-Kapsel statt über die Wagen-Hülle** (Karte D1 bestätigt, mit Kreaturen und Strukturen).
- *Ursache:* „Kollision ruht im Sattel“ (`:49960`); das gerittene Gefährt blockt nicht (`:85986`). Es stoppt die menschliche Kapsel r 0,35 m.
- *Gemessen:*
  - Fichte mittig: Bug 1,97–2,32 m im Stamm
  - Eiche 0,83 m neben der Mitte: durchfahren
  - Hauswand: 2,17 m
  - Plattform: 1,83 m
  - Bär: ganz im Wagen
- *Bild:* `11-baum-chase` (Stamm durch den Wagen), `14-baer-im-wagen-seite`, `21-plattform-stufe-seite`, `12b`.
- *Schnitt:* Die Hülle aus `_fahrzeugBlockerParts` (`:31324`) kollidiert im Sattel am EINEN Kontakt-Chokepoint `_stepCharacter`, mit einer Kreatur-Kapsel im selben Satz.

**DEFEKT 5 · Drei Wasser-Wahrheiten für einen Wagen** (Karte D2 bestätigt und erweitert).
- *Ursache:*
  - Der Reiter misst Wasser an den Voxel-Wasserzellen der Hüfte (`_playerWaterContext` `:32186`, 1,8-m-Zellen, Spiegel 23,40). Daraus folgt das menschliche Schwimm-Drag (`:85732`).
  - Das Schwimmen des Wagens liest `_waterRunSurfaceAt` (im 12-m-Uferstreifen `null`).
  - Der Seespiegel `_waterLevelAt` liegt bei 22,93.
  - Dazu kommen die Donor-Dichte des Holzkarrens (`:49722`, `fahrzeug_wagen` `:88314`) und der Nick vom Seegrund (`:50179`, vor dem Schwimm-Zweig).
- *Gemessen:*
  - nasse Wand an der Furt: 10,1 → 0,42 m/s auf 1,2 m, auf trockenem Boden
  - Kriechen mit 0,43–0,75 m/s
  - Schwimm-Einsatz als 3,2-m-Sprung
  - schwimmend 25° Bug-ab und 0,22 m/s Drift seewärts
  - im 3,2-m/s-Fluss nur 0,60 m/s Drift, weil das Reifenmodell die Quer-Geschwindigkeit des schwimmenden Wagens tötet
  - Straßenwagen schwimmt, Dach 0,31 m über Wasser
- *Bild:* `17-see-schwimmt-seite`, `19-strom-seite`, `20-furt-chase`, `15-see-chase-fahrt`.
- *Schnitt:* EINE Wasser-Abfrage für jeden Körper (Mensch, Tier, Wagen), und ein Fahrzeug-Wasser-Gesetz an den vier Aufstandspunkten gegen die Hülle.

**DEFEKT 6 · Die Vertikale klebt am Boden, im Spalt hängt der Wagen in der Luft** (Karte D4 bestätigt).
- *Ursache:* An Land gilt `y = Ebene` exakt (`:50224`, `_rideVy = 0`). Die Vier-Punkt-Ebene mittelt Rand und Spaltgrund (`:50059–50092`).
- *Gemessen:* Sprung 6,94 m und 7,95 m in einem Frame; der Wagen hängt 16,7 m über dem Grund, 6,7 m unter dem Rand, Nick und Wank an der 40,1°-Klammer.
- *Bild:* `07-graben-chase`, `22-graben-wagen-haengt`.
- *Schnitt:* Ein vertikaler Zustand im Fahr-Schritt (ballistisch, landet über die Heave-Feder).

**DEFEKT 7 · Die Hang-Klasse ist nur zur Hälfte gebaut** (Karte D3 bestätigt).
- *Gemessen:* Querhang 35,5°: 0,00 m Abdrift in 5 s, kein Rutschen. Der SUV klettert am schlechtesten (3,5 m gegen 10,5 und 11,0 m). Ohne Taste rollt der Wagen am 21°-Hang mit 4,7 m/s zurück, ohne zu halten.
- Am Querhang heben die Bauch-Hebung (`:50082`) und die starre Ebene alle vier Räder 4,5–19 cm vom Boden.
- *Bild:* `06-querhang-hinten`.
- *Schnitt:* wie Karte D3: der Antrieb als Kraft am Reibkreis, der Quer-Hangabtrieb `g·sin(Wank)` auf vLat.

**DEFEKT 8 · Die Studio-Instanz ist starr** (Karte D5 bestätigt).
- *Gemessen:* 12 Blätter, relative Matrix nach 1,5 s Fahrt mit Lenkung um 0 verändert: Kein Rad rollt oder lenkt.
- Beim Bremsen tauchen die Vorderräder 7,4–11,1 cm in den Boden. Auf welligem Grund steht der Wagen diagonal verwunden: zwei Räder 11–12 cm im Boden, zwei 14–16 cm in der Luft.
- *Bild:* `03-gt-seite-hang`.
- *Ursache:* `:50446` „entry-yaw“, `_archInstanceUpdate` `:64065`.
- *Schnitt:* wie Karte D5.

**DEFEKT 9 · Der Tacho im Garage-Labor lügt um den Faktor 3,33 (neu).**
- *Ursache:* `worlds/garage/garage.js:455` rechnet `|car.speed| × 12` in die Einheit „km/h“; richtig wäre × 3,6.
- *Gemessen:* angezeigt 126 km/h, real 10,5 m/s = 37,8 km/h.
- *Bild:* `24-labor-fahrt`.
- *Schnitt:* Der Faktor wird eine Kern-Zeile in `FAHR`; Labor und künftiger Welt-Tacho lesen sie.

**DEFEKT 10 · Der Reiter „fliegt“ im Sattel.**
- *Gemessen:* `isInAir` ist in 421 von 421 und in 684 von 704 Frames wahr. Seine Kapsel steht 0,425 m über der Rad-Ebene, über dem Haft-Band von 0,25 m.
- *Folge:* Grounded-Leser (Coyote, Slope-Penalty, Landungs-Dip, Schritt-Klang) sehen im Sattel Luft. Das fällt mit DEFEKT 1 und 4 zusammen, wenn der Wagen sein eigener Körper wird.

---

## 3 · V1-LÜCKEN: fehlt auf dem v1.0-Pfad (Schritt 5 „benutzen/fahren“)

- **L1 · Grip je Boden.** Um die Mess-Wiese liegen erde, stein, quarz und glut (Zensus 9 000 Proben), aber kein Weg im Umkreis von 200 m. Im Fahrpfad liest kein Rad den Boden (nur Rezept-`grip`).
- **L2 · Verfolger-Kamera ohne Ausblendung und ohne Wasser-Klemme.**
  - Die Kamera sitzt mitten in Baumkronen (`05-querhang-chase`).
  - Im Fluss sieht man nur Wasser mit Zebra-Streifen und keinen Wagen (`18-strom-chase`).
  - Am Ufer sieht man Unterwasser-Blau ohne Wagen (`16-see-tief-chase`).
  - Wie Profi-Spiele es lösen: Laub zwischen Kamera und Wagen dithert aus, die Kamera klemmt über dem Wasserspiegel.
- **L3 · Strukturen tragen den Wagen nicht.** `_rittEbene` liest nur Terrain. Eine Plattform von 1 m ist eine Wand (Bug 1,83 m drin), Rampe und Brücke gibt es nicht.
- **L4 · Keine Fahr-Rückmeldung in der Welt.** Es gibt keine Reifenspur, keinen Staub, keinen Motor- oder Abrollklang (grep „Motor“ trifft nur Kommentare) und keinen Tacho. Das Labor hat Spuren und Drift-Rauch (`25-labor-drift`).
- **L5 · Wagen und Kreatur.** Der Bär steckt im Wagen (`14`). Kreaturen weichen dem Wagen nicht aus, der Wagen weicht ihnen nicht aus.
- **L6 · Die Fahr-Linse ist blind für den echten Loop.** `gate:vehicle-drive` integriert ohne Akkumulator und Interpolation. DEFEKT 1, 2 und 3 sieht nur ein Lauf mit `setAnimationLoop`.
  - Gebraucht wird eine Linse aus Teleport-Zähler, Sim-Weg gegen Fahr-Weg, Gier ohne Lenkung und Pixel-Deckung des eigenen Wagens.

---

## 4 · NACH-V1: neues Verhalten (benannt und vorbereitet)

- **N1 Aufhängung je Rad:** ungefederte Räder und Rad-Hub aus der Ebene je Rad, vorbereitet durch die gemessene Verwindung von ±16 cm.
- **N2 Überschlag, Aufsetzen und Schaden:** Hängenbleiben am Spaltrand statt Hängen in der Luft.
- **N3 Wasser-Erlebnis:**
  - Bugwelle und Gischt
  - ein Motor, der absäuft, und ein Wagen, der vollläuft und sinkt
  - ein Boot-Rezept in der Garage
- **N4 Den Boden beschreiben:** Spurrillen und Schlamm als `deposit` im lebendigen Feld, Nässe nach Regen als Grip.
- **N5 Gelände-Teststrecke im Labor:** Querhang, Kuppe < 26 m, Stufe, Furt, Spalt, gebaut aus derselben Welt-Funktion.
- **N6 Verkehr und Fahrer-NPC** auf `plan.roads`.
- **N7 Kreatur-Ritt im Gelände:** Das Holzross teilt DEFEKT 1 (131 von 135 Teleport-Frames).
- **N8 Seilwinde und Bergung** (Snowrunner): Baum-Blocker als Anker, Wagen aus dem Spalt ziehen.

---

## 5 · Über den Tellerrand

1. **Zurückspulen wie in Forza:** Der Lockstep-Replay-Rekorder existiert schon (`_replayRec`, `_replayCaptureFrame`). Ein Spul-Knopf nach einem Unfall wäre ein Leser mehr, kein neues System.
2. **Fahren schreibt die Welt:** Reifen hinterlassen `deposit` im Feld. Oft befahrene Wiese wird Weg, der Weg hebt den Grip (L1). Das Feld wird so zum dritten Mitspieler: Wege entstehen, wo Spieler fahren.
3. **Tiere hören den Motor:** Ein Motorklang aus `klang-core` (L4) gibt dem Rudel ein Flucht-Signal. Der Bär scheut, statt im Wagen zu stecken (L5), auf dem vorhandenen Temperament-Pfad.
4. **Eine Wasser-Frage für alle Körper:** Mensch, Tier, Wagen und Boot fragen dieselbe Funktion (Zelle, Lauf-Fläche, Spiegel → EIN Wert). DEFEKT 5 fällt für alle Leser in einer Welle.
5. **Die eigene Blick-Probe je Commit:** ein Schuss der Verfolger-Kamera mit Pixel-Deckung des eigenen Wagens (DEFEKT 3) als Ratsche. „Der Spieler sieht sein Auto“ ist eine Zahl.
6. **Tacho und Tempo aus EINER Quelle:** Das Welt-HUD zeigt km/h aus dem Fahr-Weg (nicht aus `playerVel`). Damit wird DEFEKT 1 für jeden Spieler sichtbar, und DEFEKT 9 fällt mit.

---

## 6 · Bilder (Auswahl, alle aus dem sichtbaren Fenster)

- `02-gt-steht.png`: der GT als heller Geist auf der Wiese (Verfolger-Kamera)
- `03-gt-seite-hang.png`: GT seitlich am Hang (Rad-Kontakt)
- `05-querhang-chase.png`: Kamera in der Baumkrone
- `06-querhang-hinten.png`: GT am 35°-Querhang, steht ohne Rutschen
- `07-graben-chase.png`: GT im Felsspalt
- `08-geist-hinten-6m.png`, `08-geist-hinten-10m.png`: derselbe Wagen aus 6 m (fest) und 10 m (zerfällt)
- `09-chase-offen.png`: Geist in der normalen Fahrsicht
- `10a-chase-maske-an.png`, `10b-chase-maske-aus.png`: A/B der Dither-Maske, gleiche Kamera
- `11-baum-chase.png`: Eichenstamm durch den Wagen
- `12b-tanne-von-oben.png`: Bug unter der Fichte
- `14-baer-im-wagen-seite.png`: Bär im roten GT
- `15-see-chase-fahrt.png`: Wagen kriecht im trockenen Uferstreifen
- `16-see-tief-chase.png`: Kamera unter dem Seespiegel
- `17-see-schwimmt-seite.png`: GT schwimmt mit 25° Bug-ab
- `18-strom-chase.png`: Fluss mit Zebra-Streifen, Wagen unsichtbar
- `19-strom-seite.png`: Dach 0,31 m über dem Fluss
- `20-furt-chase.png`: nasse Wand an der Furt, Wasserkörper mit senkrechter Flanke
- `21-plattform-stufe-seite.png`: Bug in der 1-m-Plattform
- `22-graben-wagen-haengt.png`: Spalt von oben
- `23-garage-labor.png`, `24-labor-fahrt.png`, `25-labor-drift.png`: Gegenprobe im Labor (Tacho „126 km/h“, Reifenspuren)

---

Geschnitten: nichts (Befund, Code unverändert).
Gemessen: Sim-Weg im Ritt 25,95 m gegen 10,27 m gefahren (114 von 114 Frames Teleport; zu Fuß 0 von 40); eigener Wagen zu 45 % sichtbar (4189/9268 Pixel); Bug 1,97–2,32 m im Stamm; Furt 10,1 → 0,42 m/s auf trockenem Boden.
Pflicht-OFFEN Rest: unverändert, A–C und E (docs/PFLICHT-OFFEN.md).
Status: ZWISCHENSTAND
