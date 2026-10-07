# Karte: Fahren im Gelände und am Wasser

Stand: main `2b60988b` (V18.531), Worktree `vigorous-nash-studio-bild`. Rein lesend erstellt, ohne Browser und ohne GPU.
Die Zahlen rechnet `_leben/fahren/messe-fahrgesetz.cjs` aus vehicle-core und den Stamm-Konstanten, mit denselben
Formeln wie Lenk-Pfad, Ritt-Takt und Kapsel-Controller. Die Rohzahlen liegen in `artifacts/profiband/leben/fahren-gesetz-zahlen.json`.
Die Sonde für das echte Fenster liegt in `_leben/fahren/konsole-fahrsonde.js`.

**Chokepoint und was dabei wegfällt.** Gebaut wird EIN Fahr-Schritt im Kern (`vehicle-core` `fahrSchritt(zustand, eingabe, boden, dt)`), und Probefahrt wie Welt-Ritt rufen ihn auf.
Damit fallen weg:

- der zweite Integrator im Stamm (`_loopPlayerMovement`, Lenk-Pfad `anazhRealm.js:86135–86301`)
- die Reiter-Kapsel als Körper des Wagens
- das menschliche Schwimm-Gesetz am Wagen
- die Holzkarren-Substanz als Wasser-Wahrheit des Studio-Wagens

---

## 0 · Drei Sätze

Geschnitten wurde nichts, denn das ist eine Karte. In der Welt fährt der Wagen das Zweispur-Querrad des Labors mit
byte-gleichen Konstanten. Alles andere außer dem Längs-Hangabtrieb kommt dagegen von der Spieler-Kapsel (r 0,35 m)
oder vom menschlichen Schwimm-Gesetz.

Die Rechnung zeigt beim GT einen Bug, der 1,88 m tief in Wände fährt. Jeder Studio-Wagen schwimmt (Donor-Dichte
0,5155 < 0,55, Tauchtiefe 0,90 m). Der Supersport steigt senkrecht (Stillstand 90°), der SUV nur 41,7°. Stufen bis
1,075 m nimmt der Wagen ohne Stoß. Bei Vollbremsung tauchen die Vorderräder 8,6–16,1 cm in den Boden.

Offen sind 8 DEFEKTE, 5 V1-LÜCKEN und 7 NACH-V1-Posten (§4). Den Beweis im Bild liefert der Spiel-Plan in §6.

---

## 1 · Wo was definiert ist

| System | Wo (Datei:Zeile) | Studio / Welt | Stand |
|---|---|---|---|
| Fahr-Konstanten (Lenkung, Bremse, Reifen, Feder, Kamera) | `vehicle-core.js:2151` `FAHR` (`lenkung` 2211 · `zweispur` 2227 · `kamera` 2242 · `hostEmergent` 2175) | beide lesen dieselben Konstanten | gebaut |
| Antrieb aus der Form | `vehicle-core.js:2334` `carPhys` (Masse ∝ L·B·H, vmax aus Stirnfläche) | beide | gebaut |
| Export in die Welt | `vehicle-core.js:2364` `exportDrive` → `phytogenesis.js:5101` mintet `fx.fahrprofil` je Buch-Bau | Welt | gebaut, **ohne Wasser** (`vehicle-core.js:2359` „floats FEHLT BEWUSST") |
| Zweispur-Integrator (Schlupf, Reibkreis, Gier) | Labor `worlds/garage/garage.js:315` `updateVehicle` · Welt `anazhRealm.js:86223` | **zwei Kopien**, Konstanten gleich | gebaut, doppelt |
| Längs-Antrieb | Labor `garage.js:334–343` als Kraftbilanz (aEngine − Luft − Roll − Bremse) · Welt `anazhRealm.js:86199–86210` als exp-Lerp kAcc/kBrake + `brakeDecel` | **nicht gleich** | halb |
| Längs-Hangabtrieb | Labor `garage.js:356–361` (`FAHR.G` 9,8, zwei Proben ±b/c) · Welt `anazhRealm.js:86212–86218` (`state.gravity` 9,81, vier Aufstandspunkte) | gleiche Idee, zwei g | gebaut |
| Quer-Hangabtrieb, Kippen | — | **fehlt in beiden** | fehlt |
| Traktions-Grenze am Hang | — (der Reibkreis wirkt nur quer) | **fehlt in beiden** | fehlt |
| Rad-Ebene, Nick, Wank aus dem Gelände | Welt `anazhRealm.js:50059` `_rittEbene` (vier Punkte aus `huelle.fAx/rAx/spur`, Bauch-Hebung 50076–50085) · Labor `garage.js:374–381` | beide, Welt genauer | gebaut |
| Vertikale (Kuppe, Klippe, Landung) | Welt `anazhRealm.js:50218–50225`: an Land gilt `y = Boden` exakt · Labor `garage.js:383` `y = bodenY` | gleich: **klebt in beiden** | fehlt |
| Aufbau-Feder (Nick, Kurven-Wank, Heave) | Labor `garage.js:367–381` (nur `gSprung`) · Welt `anazhRealm.js:50290–50410` (ganze Instanz) | gleiche Formel, anderer Körper | halb (Räder federn mit) |
| Rad-Rolle, Lenk-Einschlag sichtbar | Labor `garage.js:385–388` · Welt nur am Gruppen-Pfad 50431; Studio-Instanz `anazhRealm.js:50446` / `64065` (`STEER_VIS.instance` „entry-yaw") | **Labor ja, Welt-Studio-Wagen nein** | fehlt in der Welt |
| Kollision | Labor `garage.js:301–305` (Pylonen, Radius um die Mitte) · Welt: Reiter-Kapsel `anazhRealm.js:49960` „Kollision ruht im Sattel", `85982–85986` (das gerittene Gefährt blockt nicht), `85774` / `85823` / `85838` (`PLAYER_WALL_RADIUS` 0,35) | Welt nutzt die Kapsel des Menschen | **DEFEKT** |
| Kollisions-Hülle des Wagens | `anazhRealm.js:31324` `_fahrzeugBlockerParts` (aus `exportDrive.huelle`), Zweig 31085 | Welt, **nur geparkt** | halb |
| Wasser: schwimmt es? | `anazhRealm.js:49704–49723` (volumen-gewichtete Dichte < 0,55) über den Bauplan-Klon des Donors `KIND_SUBSTANCE.fahrzeug_wagen` `anazhRealm.js:88314` (Holz 0,4 · Eisen 0,9: `57293` / `57303`) | Welt; das Labor hat kein Wasser | **DEFEKT** (jeder Studio-Wagen schwimmt) |
| Wasser: Wasserlinie | `anazhRealm.js:50183–50208` (`_waterRunSurfaceAt` − `_tauchTiefe`, Rumpf-Höhe aus der Donor-BBox) | Welt | halb |
| Wasser: Widerstand, Unterwasser | `anazhRealm.js:85692` `_playerWaterContext` an der **Reiter-Hüfte**, `85731–85733` `SG.drag` (`koerper-core.js:459` drag 0,7) | Welt, Gesetz des Menschen | **DEFEKT** |
| Strömung | `anazhRealm.js:85744–85762` (`_waterFlowAt` 30867, `FLOW_ADVECT_K` 0,3, `FLOW_ADVECT_SPEED` 3,2 `92859`) | Welt (Schwimmer + `_afloat`) | gebaut (für Boote) |
| Steig-/Stufen-Grenze | `anazhRealm.js:85774–85810` (Kapsel-Wand-Probe `STEP_UP` 0,6 `92846`) | Welt, Kapsel des Menschen | **DEFEKT** |
| Grip je Boden | — Welt-Boden ist lesbar: `_schrittMaterialAt` 10110, `_terrainMaterialAt` 65353, `_pfadFeldAt` 63658, `_wegeFeldAt` 63590 (Wege nur als Farbe: `_stlWegeBuild` 63819) | **fehlt in beiden** (nur Rezept-`grip`) | fehlt |
| Strukturen befahren (Rampe, Brücke) | `_rittEbene` liest nur `getTerrainHeightAt` (88066). Die Brücken-Schicht der Siedlung „reist unkonsumiert" (63818) | Welt | fehlt |
| Chase-Kamera | `anazhRealm.js:86817–86833` (nur `azEase` gelesen; `posEase` und `elEase` haben keinen Leser) · Labor `garage.js:396` | halb gleich | halb |
| Steuerung, Handbremse | Labor: Leertaste `garage.js:441`, HUD `worlds/garage/index.html:128` · Welt: Shift `anazhRealm.js:86194` | **nicht gleich** | **DEFEKT** |
| Spur, Staub, Gischt, Motor-Klang | Labor: Reifenspur und Rauch `garage.js:251–291` (Shell-privat) · Welt: grep 0 | nur Labor | fehlt in der Welt |
| Linsen | `scripts/diag-vehicle-drive.cjs` B-e 600ff integriert `pm.x += v·dt` **ohne** `_stepCharacter` (670) und wählt die trockenste, flachste Strecke (610, 627); B-f prüft den Stand am Hang · `scripts/playtest.cjs:29065` M3 prüft den Stand · `gate:kopplung` F1 prüft die Boot-Drift | headless | Wasser, Kollision, Stufe, Querhang und Kuppe sind **ungeprüft** |

**Gleiches Gesetz wie die Teststrecke der Garage? Nur zum Teil.**

- **Gleich:** Querreifen-Modell, Lenksäule, Feder-Formel und Konstanten (EINE Quelle `FAHR`).
- **Verschieden:** Längs-Antrieb, das g im Hangabtrieb, die Handbremsen-Taste und der Feder-Körper (Labor: Aufbau, Welt: ganzer Wagen samt Rädern). Dazu rollen und lenken die Räder in der Welt nicht.
- **In beiden blind:** Quer-Hang, Traktion, Kuppe/Klippe, Boden-Grip und Wasser. Die Teststrecke ist Ebene, Pylonen und EIN cos²-Hügel (`garage.js:244`: h 3,5 m, r 22 m, größte Steigung 14,0°, Scheitel-Radius 28 m). Sie kann deshalb weder Abheben zeigen (erst ab 16,57 m/s, über jedem vmax) noch Querrutschen, Stufe oder Furt.

---

## 2 · Die Zahlen (aus `messe-fahrgesetz.cjs`, je Rezept)

| | GT | Supersport | Limousine | Kompakt-FWD | SUV |
|---|---|---|---|---|---|
| vmax m/s | 16,00 | 16,36 | 14,80 | 14,93 | 13,52 |
| Reifen-Grip (Rezept) | 1,0 | 0,85 | 1,0 | 1,0 | 1,0 |
| **Bug / Heck / Flanke dringen ein, m** (Hülle − Kapsel 0,35) | **1,88 / 2,02 / 0,59** | 1,60 / 1,70 / 0,61 | 2,06 / 2,18 / 0,58 | 1,67 / 1,47 / 0,56 | 1,90 / 1,94 / 0,60 |
| **Stillstand am Hang, Welt / Labor** | **66,6° / 54,7°** | **90° / 90°** | 47,1° / 39,1° | 73,2° / 58,9° | **41,7° / 34,3°** |
| Reibkreis-Grenze tan α = μ (ohne Leser) | 45° | 40,4° | 45° | 45° | 45° |
| Tempo am 30-%-Hang, Welt / Labor m/s | 10,99 / 12,14 | 12,10 / 13,16 | 8,99 / 10,13 | 10,45 / 11,50 | 7,68 / 8,71 |
| **Stufe, die ohne Stoß genommen wird, m** (Kapsel-Probe) / Richtwert ½ radR | **1,075** / 0,17 | 1,03 / 0,18 | 1,085 / 0,17 | 1,08 / 0,16 | 1,165 / 0,205 |
| Kipp-Grenze quer (ohne Leser) / Optik-Klemme | 60,2° / 40,1° | 62,6° | 56,3° | 55,5° | 52,6° |
| Abheben an Kuppe bei vmax ab Scheitel-Radius < | 26,1 m | 27,3 m | 22,3 m | 22,7 m | 18,6 m |
| Böschung vorn / hinten / Rampe | 9,5° / 8,0° / 10,2° | 8,1° / 6,9° / 7,2° | 9,0° / 8,0° / 10,5° | 10,6° / 14,6° / 11,9° | 15,0° / 14,3° / 17,6° |
| **Rad-Hub der starren Instanz: Nick / Wank** | **8,6 / 5,0 cm** | 6,2 / 3,6 cm | 11,7 / 6,8 cm | 10,6 / 6,2 cm | **16,1 / 9,4 cm** |
| Reiter-Hüfte über Rad-Ebene, m (= Furt ohne jede Wirkung bis) | 0,925 | 0,88 | 0,935 | 0,93 | 1,015 |
| Kriechtempo unter Wasser (Schwimm-Drag 0,7), m/s | 0,341 (2,1 % vmax) | 0,408 | 0,273 | 0,355 | 0,248 |
| Schwimmt (Donor-Dichte 0,5155) / Tauchtiefe | ja / 0,90 m | ja | ja | ja | ja |

Zur Reiter-Kapsel: Bei allen fünf Rezepten liegt die Fußkante 0,38–0,52 m über dem Boden, also über dem Haft-Band
von 0,25 m. Der Reiter gilt im Sattel deshalb im Regelfall als „in der Luft" (`isInAir`, die Sonde zählt es: `reiterInLuftTakte`).

---

## 3 · Befunde nach Klasse

### DEFEKT: ein bestehendes System verhält sich falsch und wird geschnitten

**D1 · Kollision über die Reiter-Kapsel statt über die Wagen-Hülle.**
- `mountArchitecture` schaltet die Hülle des gerittenen Wagens ab (`anazhRealm.js:49960`, 85982–85986). Was dann stoppt, ist die menschliche Kapsel (r 0,35 m) am Wagen-Ursprung, und zwar über Feld-Wand (85774), Struktur-AABB (85829) und Terrain-Kugeln.
- Folge: Haus, Baumstamm, Fels und geparkter Wagen lassen den Bug 1,47–2,06 m und die Flanke ~0,6 m eindringen, bevor etwas hält.
- Die Hülle existiert schon (`_fahrzeugBlockerParts` 31324) und blockt nur, solange der Wagen parkt.
- Kreaturen kennt der Kapsel-Schritt gar nicht. Der Wagen fährt durch Tiere.
- Schnitt: Im Sattel kollidiert der Hüllen-Satz des Wagens (Unterkörper, Greenhouse, Räder in Fahrt-Gier) am EINEN Kontakt-Chokepoint `_stepCharacter` (5b/6/7).
- Zahl: `bugImBlockerMax`, Soll ≤ 0,05 m.

**D2 · Wasser: Ob der Wagen schwimmt, entscheidet die Substanz des Holzkarrens, und den Widerstand entscheidet die Hüfte des Reiters.**
- (a) Jeder Studio-Wagen ist ein Bauplan-Klon von `fahrzeug_wagen` (Auto-Register `anazhRealm.js:65956–65959`). Dessen Mitteldichte 0,5155 liegt unter der Schwimmgrenze 0,55. Der Supersportler schwimmt also wie ein Holzboot, mit der Wasserlinie 0,90 m über der Rad-Ebene (Rumpf-Höhe aus der Donor-BBox 0,96 m statt aus der Hülle). Damit ragen beim GT nur ~0,3 m Dach aus dem Wasser.
- (b) Im Schwimmen lesen Nick, Wank und Hangabtrieb weiter den Seegrund. `_terrainPitchZiel = eb.nick` (50179) wird vor dem floats-Zweig (50206) gesetzt und nie zurückgesetzt, und der Lenk-Pfad schiebt mit `g·sin` dieser Neigung (86217). Folge: Ein schwimmender Wagen neigt sich mit dem Grund und treibt über einem abfallenden Seegrund „bergab".
- (c) Der Wasser-Kontext misst an der Reiter-Hüfte (85692, 0,88–1,02 m über der Rad-Ebene, 1,8-m-Zellen). Bis dahin hat eine Furt **null** Wirkung. Darüber bremst das menschliche Schwimm-Gesetz (`SG.drag` 0,7 je Fixed-Step) den Wagen auf 0,25–0,41 m/s, und die Strömung reißt ihn mit 3,2 m/s mit.
- (d) Die Hüfte schwimmt 0,025 m über der Lauf-Fläche (0,925 − 0,90). Ob „unter Wasser" gilt, entscheidet damit die Zell-Quantisierung. Erwartet wird ein Flackern zwischen voller Fahrt und Kriechen (`unterWasserWechsel`).
- Schnitt: EIN Fahrzeug-Wasser-Gesetz in `_tickMountedMovement`. Es nimmt die Tiefe an den vier Aufstandspunkten gegen die Hülle, die Substanz kommt aus dem Studio (additive Daten-Zeile in vehicle-core: Hüll-Dichte und Furttiefe). Daraus folgen Auftrieb, Widerstand ∝ eingetauchte Stirnfläche · v² und die Furt-Grenze. Die Nick-Quelle beim Schwimmen ist die Lauf-Fläche. Das Schwimm-Gesetz des Menschen und die Donor-Dichte fallen am Wagen weg.

**D3 · Die Hang-Klasse ist nur zur Hälfte gebaut.**
- (a) Es gibt keine Traktions-Grenze: Die Steigfähigkeit ist reiner Motor. Der Supersport fährt Wände hoch (90°), der GT 66,6°, und ausgerechnet der SUV, das Geländeauto, steigt am schlechtesten (41,7°). Mit dem Reibkreis wären es 45° bzw. 40,4°.
- (b) Es gibt keinen Quer-Hangabtrieb, weder in der Welt noch im Labor. Quer zum 35°-Hang fährt der Wagen wie auf der Ebene, rutscht nie und kippt nie (Kipp-Grenze 52,6–62,6°); die Optik-Klemme ±40,1° hält ihn.
- (c) Stufen bis 1,03–1,165 m nimmt der Wagen in einem Takt (Kapsel-Wand-Probe `STEP_UP` 0,6 + Sitz). Richtwert wäre ½ Rad-Radius (0,16–0,21 m).
- (d) Im selben Takt gelten zwei g (Hangabtrieb 9,81 `86216`, Achslast `zs.G` 9,8).
- (e) Welt und Labor laufen auseinander: Stillstand GT 66,6° gegen 54,7°, weil der Welt-Längs-Antrieb eine exp-Linearisierung ohne Rollwiderstand ist.
- (f) Das Tempo ist horizontal gemessen, am 30°-Hang fährt der Wagen auf der Fläche deshalb 15 % schneller als vmax.
- Schnitt: Der Fahr-Schritt im Kern rechnet den Antrieb als Kraft, gedeckelt am Reibkreis der Achslast (μ·W·cos α). Dazu kommt der Quer-Hangabtrieb `g·sin(Wank)` auf vLat. Die Stufen-Grenze kommt aus Rad-Radius und Aufstandspunkten statt aus der Kapsel.

**D4 · Die Vertikale klebt am Boden.**
- An Land setzt der Ritt `y = Boden` exakt (50218–50225), ohne vy. Das Labor macht es genauso (`garage.js:383`).
- An einer Klippe springt der Wagen in einem Takt hinunter, wie ein Teleport. An einer Kuppe hebt er nie ab: Der GT müsste bei vmax unter einem Scheitel-Radius von 26 m abheben. Auf einer Kuppe trägt der Bauch statt ihn aufsetzen zu lassen (50076).
- Die Chase-Kamera springt mit, weil `FAHR.kamera.posEase` und `elEase` im Stamm keinen Leser haben (nur `azEase`, 86827).
- Schnitt: ein vertikaler Zustand im Fahr-Schritt. Fällt der Boden unter den Rädern schneller als die Fallkurve, wird der Wagen ballistisch; er landet über die Heave-Feder mit Stoß. Dazu die Kamera mit `posEase`/`elEase`.

**D5 · Die Studio-Instanz ist starr.**
- `_archInstanceUpdate` (64065) multipliziert jedes Blatt mit derselben Matrix (`_archEntryWorldMatrix` 59508), und die enthält Feder-Nick, Kurven-Wank und Heave.
- Bei Vollbremsung taucht deshalb das Vorderrad 6,2–16,1 cm in den Boden und das Hinterrad hebt ab; in der Kurve 3,6–9,4 cm. Im Labor federt nur der Aufbau.
- Die Räder rollen und lenken in der Welt nicht (`STEER_VIS.instance` „entry-yaw", 50446). Das ist Drehbuch-Schritt 7 im Bild.
- Schnitt: Die Rad-Blätter des Foundry-Flat bekommen ihre eigene Slot-Matrix (Rolle Weg/radR, Lenk-Gier, ungefederte Höhe aus `_rittEbene`), die Feder dreht nur den Aufbau. `localMatrix` bleibt geteilt.

**D6 · Zwei Belegungen für die Handbremse.**
- Labor: Leertaste (`garage.js:441`, HUD „Leer Handbremse"). Welt: Shift (86194). In der Welt läuft die Leertaste im Sattel in `handleJump`.
- Der Spieler lernt in der Garage die Taste, die er in der Welt für Drehbuch-Schritt 7 („Handbremse in der Kurve") nicht drücken darf.
- Schnitt: EINE Belegung als Daten im Kern; Labor und Welt lesen sie.

**D7 · Naht zwischen Gesetz und Mesh unter den Rädern (Verdacht, wird gemessen).**
- Die Räder stehen auf `_voxelSurfaceY` (Nulldurchgang auf dem 1,2-m-Gitter, 30280). Gezeigt wird das Surface-Nets-Mesh auf 1,8 m (±0,2 m, Lehre 22).
- B-e misst den Kontakt nur gegen das Gesetz.
- Zahl: `radSpaltMeshMax` und `radUnterMeshMax`, Soll ≤ 0,05 m.

**D8 · Die Linse ist blind.**
- `gate:vehicle-drive` B-e integriert die Position ohne `_stepCharacter` (`diag-vehicle-drive.cjs:670`, „ohne Kollision" 610) und wählt die trockenste, flachste Strecke (627).
- Kollision, Wasser, Stufe, Querhang und Kuppe hat nie ein Gate gesehen.
- Schnitt (Gebot 10): Die Fahr-Linse fährt über den echten Sim-Schritt (`_stepFixedSim`), und zwar je Klasse an einer gesuchten Station (Furt, Tief, Querhang, Stufe, Kuppe, Wand). Die Verdikte sind die Zahlen aus §6.

### V1-LÜCKE: fehlt auf dem v1.0-Pfad („benutzen: fahren", `docs/roadmap.md` §0.v1 Schritt 5)

- **L1 · Grip je Boden.** `zs.grip` ist allein der Rezept-Wert. Weg, Wiese, Erde, Fels und nasser Boden fahren gleich. Die Welt kennt den Boden bereits (der Fußklang liest `_schrittMaterialAt` 10110, die Wiese `_pfadFeldAt` 63658); nur das Rad liest ihn nicht. Ein μ-Faktor je Boden wird eine Daten-Zeile in vehicle-core, der Leser sitzt im Fahr-Schritt.
- **L2 · Bodenwellen erregen die Feder nicht.** Die Feder schwingt nur aus Beschleunigung. Die Vier-Punkt-Ebene folgt dem Boden starr (50415–50425), über Buckel federt nichts ein. Die Lücke fällt mit D4/D5 in der Rad-Welle: Höhe je Rad gibt den Rad-Hub und erregt die Aufbau-Feder.
- **L3 · Strukturen tragen den Wagen nicht.** `_rittEbene` liest nur das Terrain. Rampe, Plattform und Brücke aus der Werkstatt lassen sich nicht befahren. Die Siedlungs-Brücken bleiben ungebaut (63818), Wege enden deshalb am Fluss, und dort gilt D2.
- **L4 · Keine Fahr-Rückmeldung in der Welt.** Es gibt keine Reifenspur und keinen Staub (das Labor hat beides, aber nur in der Shell), keinen Motor- oder Abrollklang, und der Fußklang verstummt im Sattel.
- **L5 · Kein Kontakt zwischen Kreatur und Wagen.** Der Wagen fährt durch Wolf und Hirsch. Minimal reicht eine Kreatur-Kapsel gegen die Wagen-Hülle (am selben Chokepoint wie D1).

### NACH-V1: neues Verhalten (benannt und vorbereitet)

- **N1 · Aufhängung je Rad mit Quer-Lastverlagerung.** Heute verlagert das Reifenmodell nur längs über `cgH/L`. Vorbereitet ist das durch die Vier-Punkt-Proben aus D5 und L2.
- **N2 · Überschlag, Abheben mit Schaden, Aufsetzen.** Gemeint ist Hängenbleiben statt Bauch-Hebung. Vorbereitet sind die Kipp-Grenzen aus §2 und die Vertikale aus D4.
- **N3 · Wasser-Erlebnis.** Bugwelle, Gischt und Kielwasser (`docs/roadmap.md:134`, Orakel nach v1.0), ein Motor, der absäuft, ein Wagen, der vollläuft und sinkt, ein Boot-Rezept in der Garage (vehicle-core kennt kein Boot) und Krängung im Seegang.
- **N4 · Den Boden beschreiben.** Spurrillen und Schlamm über das lebendige Feld (deposit), Regen-Nässe als zeitlicher Grip.
- **N5 · Die Garage-Teststrecke als Gelände-Labor.** Querhang 20–35°, Kuppe mit R 15–25 m, Stufen 0,2/0,5/1,0 m, Furt 0,3/0,8 m, Schotter- und Wiesen-Flächen. So prüft das Studio, was die Welt fährt, mit demselben Fahr-Schritt.
- **N6 · Verkehr und Fahrer-NPC.** Verkehr in Dorf und Stadt auf dem Straßengraph der Siedlung (`plan.roads`), außerdem Stöße zwischen Fahrzeugen (geparkte Wagen schieben).
- **N7 · Kreatur-Ritt im Gelände.** Holzross und Bein-Werke folgen der Richtung, haben kein Lenk-Gesetz und rechnen mit der Emergenz-Formel.

---

## 4 · Was im Code ganz fehlt

- Quer-Hangabtrieb, Rutschen und Kippen, in Labor **und** Welt.
- Traktions-Grenze längs (Reibkreis der Antriebs-Achslast am Hang).
- Ballistische Vertikale des Wagens (Abheben, Fallen, Landen) in Labor **und** Welt.
- Grip je Boden (kein Leser von Material, Weg oder Nässe im Fahrpfad).
- Ein Fahrzeug-Wasser-Gesetz (Furt-Widerstand, Auftrieb aus der Hülle, Absaufen); `exportDrive` trägt kein Wasser.
- Kollision über die Wagen-Hülle während der Fahrt; Kontakt zwischen Wagen und Kreatur.
- Wagen auf Strukturen (Rampe, Brücke); die Brücken-Schicht der Siedlung hat keinen Konsumenten.
- Rad-Rolle und Lenk-Einschlag der instanzierten Studio-Wagen; ungefederte Räder.
- Fahr-Klang (Motor, Abrollen), Reifenspur und Staub in der Welt.
- Ein Gate, das durch den echten Sim-Schritt fährt (Kollision, Wasser, Stufe, Querhang, Kuppe).
- Gelände-Stationen in der Garage-Teststrecke (Querhang, Kuppe < 26 m, Stufe, Furt, Schotter).

---

## 5 · Gleiches Gesetz: die Wurzel

Die Konstanten haben EINE Quelle, der **Integrator** dagegen zwei: `garage.js:315` und `anazhRealm.js:86135–86301`.
Die zweite Kopie läuft schon auseinander (Längs-Antrieb, g, Handbremse). Jede neue Klasse aus D3, D4 und L1 müsste
zweimal gebaut werden.

Der Wurzel-Schnitt ist `vehicle-core.fahrSchritt(z, e, boden, dt)`: rein, ohne THREE, additiv im Kern. Der Boden wird
als Funktion übergeben, die je Aufstandspunkt Höhe, μ und Wassertiefe liefert. Das Labor ruft ihn mit `bodenY` und
der Teststrecke, die Welt mit `_rittEbene`, Boden-Material und Lauf-Fläche. Die Lenk-Kopie im Stamm wird gelöscht.

---

## 6 · Spiel-Plan: sichtbarer Test im echten Fenster

### Aufbau

1. `npm start` (save-server :4312), dann Chrome mit echter GPU auf `http://localhost:4312/`. Welt mit dem Standard-Seed. Symphonie an, damit sich prüfen lässt, ob es einen Fahr-Klang gibt.
2. DevTools-Konsole öffnen und den ganzen Inhalt von `_leben/fahren/konsole-fahrsonde.js` einfügen. Ausgabe: „Fahrsonde geladen".
3. Tasten im Sattel: **E** auf- und absteigen (Reichweite 3 m), **W/S** Gas und Bremse (S unter 0,4 m/s fährt rückwärts), **A/D** lenken, Pfeiltasten wie WASD, **Shift** Handbremse in der Welt (im Labor die Leertaste), **H** blendet das HUD aus (für Bilder).
4. Je Station: Wagen setzen, dann `__fahrSonde.start()`, das Manöver fahren, dann `__fahrSonde.stop()`. Die Tabelle aus der Konsole kommt in die Ist-Spalte unten. Bilder mit Win+Shift+S (HUD aus) nach `artifacts/profiband/leben/fahren-bilder/<station>.png`.
5. Zum Teleportieren: `anazhRealm.state.playerMesh.position.set(x, anazhRealm.getTerrainHeightAt(x,z)+2, z)`, dann warten, bis der Boden steht.

### Anker in der Welt-Genese

| Ort | Wo | Wofür |
|---|---|---|
| Spawn, Genesis-Ring | (0, 0), Tore auf r 11 m (`_genesisPortalRing`) | Gebirge, Stufen bis 24 m (`diag-vehicle-drive.cjs:398`). Ein GT steht ~8 m radial vor dem Garage-Tor (`_ensurePortalPreview`, Seed 49178) |
| Kamm | (66, 60) (`playtest.cjs:29128`: dort lag einmal der Bauch 1,05 m im Boden) | Kuppe, Bauch-Hebung |
| Mess-Wiese | (−900, −850) (`spec/profiband/haushalt.json` messort), flach und grün | Referenz Ebene; Hänge im Ring ±40 m (die B-f-Proben finden 12–35 %) |
| Start-Dorf | 110–170 m vom Spawn (`_autoSettlementStartInfo` 66886) oder Chat `dorf 7 18` | Haus, Weg, Platz |
| Wasser | Chat `bau ein gt am wasser` (oder `suv`, `supersport`): Spawn am nächsten Ufer im Umkreis von 80 m | Furt, Tiefwasser, Strömung |
| Exakte Stationen | `__fahrOrte(200, 6)` am jeweiligen Anker: listet Furt, Tief, Strom, Hang 15/25/45, Stufe, Kuppe (mit Scheitel-Radius), Haus und Baum mit x/z und Gier | die Koordinaten der Läufe unten |

### Stationen (Soll · Prognose aus dem Code · Ist)

| # | Station und Handgriffe | Messung | Soll (Profi-Klasse) | Prognose aus dem Code | Ist |
|---|---|---|---|---|---|
| S0 | **Ebene**, Mess-Wiese: `__fahrSetze(-900,-850,90,"gt")`. W geradeaus bis vmax, S voll, A voll mit Shift. Danach Leertaste. Bild seitlich beim Bremsen. | `radSpaltGesetzMax`, `radSpaltMeshMax`, `radUnterMeshMax`, `nickMaxGrad`; sichtbar: rollen und lenken die Räder? | Rad im Boden ≤ 0,03 m; Räder rollen und lenken | Vorderrad taucht ~0,09 m ein (Feder dreht die Instanz); Räder stehen still; Leertaste bewirkt nichts Sichtbares | |
| S1 | **Hang längs**: `o=__fahrOrte(200)`, Punkte `o.hang25[0]` und `o.hang45[0]`. Wagen 15 m talwärts setzen, Gier = `bergaufGier`, W halten. Dasselbe mit `"suv"` und `"supersport"`. | `steigBeiStillstand`, `vMax`; Bild am Hang | GT bleibt ab ~45° stehen bzw. dreht durch; der SUV klettert am besten | GT und Supersport fahren über 45° hoch, der Supersport jede Wand; der SUV bleibt als erster stehen (41,7°) | |
| S2 | **Querhang**: dieselben Punkte, Gier = `bergaufGier`+90, mit 5–8 m/s entlang, dann anhalten und 5 s stehen. | `wankMaxGrad`, `kipp`; seitliche Abdrift (x/z vorher und nachher, quer zur Fahrt) | ab ~45° rutscht der Wagen talwärts, ab 52–60° kippt er | 0 m Abdrift; Wank am 40,1°-Deckel, aber kein Kippen | |
| S3 | **Kuppe**: `o.kuppe` mit Scheitel-Radius < 20 m (sonst Kamm 66/60). Mit Vollgas über den Scheitel in der `gier` der Probe. Bild am Scheitel. | `ySpruenge05`, `yStufeMax`, `radSpaltGesetzMax` | GT hebt ab (R < 26 m), landet mit Feder-Stoß | klebt am Boden, kein Abheben | |
| S4 | **Stufe und Klippe**: `o.stufe` mit `stufeM` < −1,1 (abwärts) bzw. 0,6–1,0 (aufwärts). Langsam (W tippen) hinab- und hinauffahren. | `ySpruenge05`, `yStufeMax`, `bugImBodenMax` | abwärts fällt der Wagen ballistisch; eine Stufe über ~0,2 m stoppt oder stößt | abwärts Höhen-Sprung in einem Takt (= `stufeM`), Kamera springt mit; aufwärts bis ~1,07 m kein Stopp | |
| S5 | **Boden**: Dorf (`dorf 7 18`), auf Weg, Wiese, Erde und Fels je eine Kreisfahrt mit A voll bei gleichem Tempo, dann Shift-Drift. Bei Regen wiederholen. | `querGJeBoden` (Quer-g-Spitze je Boden) | Weg > Fels > Wiese > Erde > nass | alle Böden gleich (nur Rezept-Grip) | |
| S6 | **Hindernisse**: frontal mit ~3 m/s an eine Hauswand, einen Baumstamm und einen zweiten geparkten GT (`__fahrSetze` daneben, absteigen, neuen setzen). Rückwärts ans Haus. Seitlich an den Baum. Ein Wolf ins Bild (Kreaturen-Drawer). Bild jeweils von außen. | `bugImBlockerMax`, `bugImBodenMax`; Wolf durchfahren ja/nein | ≤ 0,05 m; der Wagen stoppt an der Hülle; der Wolf ist ein Hindernis | Bug ~1,88 m (GT) in der Wand, Heck ~2,0 m, Flanke ~0,6 m; durch den Wolf hindurch | |
| S7a | **Furt** 0,3–0,85 m (`o.furt[0]` oder `bau ein gt am wasser`): mit Vollgas quer durch. | `vWasserMax`, `wasserTiefeMax`, `unterWasserTakte` | Widerstand ∝ Tiefe; Bugwelle | volle Fahrt, 0 Widerstand, keine Gischt | |
| S7b | **Tiefwasser** > 1,2 m (`o.tief[0]`): hineinfahren und 10 s geradeaus. Mit `"suv"` wiederholen. | `schwimmTakte`, `unterWasserWechsel`, `vWasserMax`, `wasserProben`; Bild | ein Straßenwagen säuft ab bzw. sinkt; er fährt nicht wie ein Boot | schwimmt, Dach ~0,3 m über Wasser; das Tempo flackert zwischen Kriechen (0,34 m/s) und Fahrt | |
| S7c | **Strömung** (`o.strom[0]`): im Fluss anhalten (kein Gas). | Drift-Richtung gegen `richtungGrad` der Probe, Drift-Tempo | ein schwerer Wagen steht am Grund | treibt mit ~3,2 m/s flussab | |
| S7d | **Abfallender Seegrund**: in tiefem See vom Ufer weg schwimmend, ohne Gas. | Neigung (`nickMaxGrad`) und Bewegung | schwimmend waagrecht, kein Hangabtrieb | neigt sich mit dem Grund und treibt „bergab" (D2b) | |
| S8 | **Gegenprobe im Labor**: zum Garage-Tor am Ring, E, „Probefahrt starten". 70 m geradeaus über den Hügel, dann quer an seiner Flanke; Leertaste in der Kurve; der Pylonen-Slalom frontal. | sichtbar: rollen und lenken die Räder? Abheben am Hügel? Quer-Abdrift an der Flanke? | | Räder rollen und lenken; kein Abheben (Hügel R 28 m, erst ab 16,57 m/s); Flanke ohne Abdrift (dieselbe Lücke wie die Welt); die Pylone fällt erst bei 0,85 m + Mitten-Abstand | |

**Abnahme der Messung:** Je Station eine Zeile Ist, ein Bild und die Koordinaten aus `__fahrOrte`. Jede Prognose,
die sich bestätigt, ist der Beleg für ihren Schnitt in §3. Jede Abweichung bekommt einen Namen, und D7 wird dort
entschieden (`radSpaltMeshMax` > 0,05 m heißt DEFEKT).

---

Dateien:
- `C:\Users\micha\AnazhRealm-profiband\artifacts\profiband\leben\karte-fahren-gelaende.md` (diese Karte)
- `C:\Users\micha\AnazhRealm-profiband\artifacts\profiband\leben\fahren-gesetz-zahlen.json` (Zahlen)
- `C:\Users\micha\AnazhRealm-profiband\.claude\worktrees\vigorous-nash-studio-bild\_leben\fahren\messe-fahrgesetz.cjs` (Rechnung)
- `C:\Users\micha\AnazhRealm-profiband\.claude\worktrees\vigorous-nash-studio-bild\_leben\fahren\konsole-fahrsonde.js` (Sonde für das echte Fenster)
