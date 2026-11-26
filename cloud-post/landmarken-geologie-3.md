# Vorprüfung landmarken-geologie-3 — die Linsen ziehen mit dem Gesetz der Landmarke

Zweig `landmarken-geologie-3` (von `landmarken-geologie-2` 18f96a3c, eingemergt `origin/main` eae94514). Beanspruchte Sprosse:
`karte2.erleben.spieler.wegfindung#1`. Karte 2 gebucht 120 von 1 718 (der Brief nannte 119; `gate:betriebsgesetz` zählt am 26.11. 120). Status ZWISCHENSTAND.

Der Schnitt des Spiels (Kopf 2) steht unverändert: Felsbogen und Felsturm folgen der Geologie (gelaende-core `landmarke`,
gelaende-core.js:6115; der Wurf je Chunk `_landmarkeChunk`, stamm/vegetation-baum.js:2534), die Feuerstelle setzt nur der Mensch.
Diese Abgabe bewegt die sieben roten Linsen mit dem neuen Soll — keine wird still gemacht, keine gelöscht.

## Je Rot: Ursache → Schnitt → Zahl

| # | Linse | Ursache (am main gegengeprüft) | Schnitt (Datei:Zeile) | Zahl vorher → nachher |
| --- | --- | --- | --- | --- |
| 1 | Playtest W6.G P3 | Die Linse maß die alte Regel (1,4 % je Probe der Saat) im Block 20..31², der keine Tafel trägt — nach dem Gesetz stehen dort 0,03 Bögen und 0,15 Türme. Am main grün nur, weil die alte Regel überall würfelte. | scripts/playtest/feld-leben.cjs:1720 — Ort A (alle Chunks in [0,96)² mit `grossform.stil` ≥ 0,9) gegen das Gesetz im Poisson-Band ±3,3 σ, Ort B (20..31²) beweist, dass dort keine stehen; Konsum: der erste Träger je Art wächst in der vollen Saat (`_populateVoxelChunkVegetation`) | Bögen 0 · Türme 0 → A 1 791 Chunks 3,34 km²: Bögen 2 (Gesetz 2,83) · Türme 10 (Gesetz 10,32); B 144 Chunks: 0 (0,03) · 0 (0,15); Konsum felsbogen 25,11 · felsturm 35,16 |
| 2 | Playtest Scatter MAIN = FADEN | Kein Bruch zwischen Faden und Haupt (gleich true am Zweig). Das Register der Wege-Karte trug am main nur die Tritt-Kreise der Feld-Feuer (7 von 7 Einträgen, 2 × 2 m), der Genesis-Ort wird auf der Playtest-Seite nie gelegt (`ortZug(page,"genesis")`, der Dorf-Zug ruht) — nach dem Schnitt war das Register leer, die Probe würfelte ohne Ort. | scripts/playtest/vegetation.cjs:2007 — die Probe legt den Belag des Genesis-Orts durch dieselbe EINE Tür des Spiels (`_stlWegeBuild({zonen}, ort, "genesis")`, wie `_genesisOrt`) und würfelt die Region des Spielers und die des Orts; das Urteil verlangt Formen im Belag | 123 588 Zahlen, Ort null → 245 124 Zahlen, Regionen 0,-1 und 0,0, 278 Formen des Belags, Zahl für Zahl gleich |
| 3 | gate:sicht-arbeit (F) | Die Kante der Fahrt trug der Zufall der Wiese: am main riss der Täter „rand“ 1 Loch an einer Formations-Zelle (Bild 30, Strecke 0,2 π, 2 306 Zellen). Ohne Landmarken trägt die Mess-Wiese nur boden + wasser (1 758 Zellen), 0 Löcher auf allen 8 Strecken — die Linse vakuös. | scripts/diag-sicht-arbeit.cjs:676 — die Linse stellt ihre Kante selbst: drei Felstürme als Werke 12 · 18 · 24 m vor dem Auge, quer in der Mitte des Fensters, das das Gesetz der Wahl (`_passTrifft`, Dreh-Rand des Ankers `drehRand` + `weg.drehRad`, `sichtRand`) vorgibt: dem Anker ohne Halt entgangen, 10 m später im Frustum | Täter „rand“ 0 → 15 Löcher (Bild 11–13 …), das Gesetz 0 Löcher in 1 693 Zellen, Strecke 0,2 π |
| 4 | gate:klang-zensus (O) | Die Klang-Seite trägt kein Dorf; ihr „Dorf“ war ein Glutbrunnen des Felds 8 m vor dem Messort — ein Feuer ohne Menschen. Nach dem Schnitt keine Glut in Hörweite („DER BAU STEHT NICHT … 3000 Takte“). | scripts/diag-klang-zensus.cjs:264 — die Linse setzt die Feuerstelle des Menschen als Werk (`spawnArchitecture("glutbrunnen")`), am ersten trockenen, ebenen Ort ab Ring Hörweite (26 m) + längster Weg der Szenen (30 m) + 8 m, und wartet, bis das Ohr sie im Verzeichnis der Glut liest | keine Glut → dorf glut −27,2 dB (Soll ≥ −34), glutArm −15,2 dB, Wiese/gehend/fahrend ohne Glut (≤ wind), S1–S23 nennen jeden Täter |
| 5 | gate:chunk-satz (j) | Den Druck der dritten Ring-Kaskade trug am main der Formations-Satz der Landmarken am Gürtel (14 Felsbögen + 13 Felstürme, Index 67 584 = Ende; Frame 2 k0 49 920 B · k1 103 680 B). Ohne ihn schreibt der Täter nichts neu — die Wand vakuös. | scripts/diag-chunk-satz.cjs:1450 — der Druck ist erzwungen, nie geliehen: der Boden-Satz (in jeder Welt) vergisst das Hochwasser seiner Abschnitte und liegt dicht auf dem Inhalt der Drehung, der Index trägt genau sie | Täter „drei Ring-Kaskaden“ nichts → k0 90 600 B · k1 211 512 B in Frame 2, die Wand nennt ihn |
| 6a | gate:werk-im-wasser (das Warten ohne Ende) | Der Bruch liegt in der PROBE, nicht im Spiel. Die Ufer-Wahl nimmt das erste Ufer ohne Bau binnen 25 m. Am main trugen die Ufer 1–3 Feld-Glutbrunnen (Bauten 4 · 3 · 14), die Wahl fiel ans vierte (−209/−728). Am Zweig ist das erste Ufer −102/−845 frei. Das Dorf Z (Same 7, nH 18) wird dort gegründet, während der Spieler an der Rampe des Sees steht (1813/−6158, 5,5 km fern); der Ring hat die Kacheln fern des Spielers geräumt (w28-speicher-ring). Die Ort-Wahl (`_ortWahlImFaden`, stamm/gelaende-boden.js:1245) bestellt eine Kachel nach, die Probe hat den Voxel-Faden ausgehängt (scripts/diag-werk-im-wasser.cjs:803), die Bestellung parkt in `_hydroWarte` (`_hydroBestellen`, stamm/gelaende-boden.js:415) — `_ortWahl` kehrt nie zurück (Stufen-Marke `_ortWahl>30868` ohne Antwort, Async-Stapel `await r.spawnSettlement` in scripts/diag-werk-im-wasser.cjs:1073). Im Spiel steht der Faden, die Bestellung reist sofort. | scripts/diag-werk-im-wasser.cjs:776 — EINE Tür der Probe für die Kacheln eines Orts (`kacheln`, der Faden hängt für die Bestellung ein), gerufen von `stroemen` (:784) und vor dem Dorf Z (:1072) | Probe hängt > 20 min (Runtime.callFunctionOn timed out) → läuft durch, Selbsttest GRÜN, 2 Befunde (6b) |
| 6b | gate:werk-im-wasser Z (die Brücke liegt längs) | **Am main rot — gemeldet, nicht geheilt.** Am Ufer 1 legt das Dorf (Same 7, nH 18) zwei `bruecke_jochfeld` längs ins Flussbett: −97,38/−833,80 (das Ufer quer 3 m, längs 10 m) und −101,33/−834,41 (quer 5 m, längs 12 m), je 0,80 m Wasser. Das Brücken-Etikett des Plans v2 (fachwerk-core.js:14009, `nasseLaeufe` → `bruecken`) macht jeden nassen Lauf einer Gasse zur Spanne, auch den längs des Flusses. Gegenprobe unter gleichen Bedingungen (`--nur zensus`, Ufer 1, der Spieler beim Gründen am See): main 4c9e6aab zeigt dieselben zwei Felder an denselben Orten (#1061/#1062), der Zweig ebenso (#1044/#1045). Der Schnitt nahm nur die Feld-Feuer, die die Linse von diesem Ufer fernhielten. | — (Ort-Gesetz, Kern fachwerk-core; nicht angefasst) | main = Zweig: 2 Felder längs im Wasser, 0,80 m |
| 7 | gate:kreatur-takt Teil 2 (herde-revier) | **Am main rot — gemeldet, nicht geheilt.** Unter dem Täter hält der Verband zusammen (Wandern Mittel 1,0, Soll < 0,9 für den Namen), und zu wenige Glied-Bilder stehen jenseits ihrer Leine. Ob der Täter sichtbar wird, entscheiden die Los-Nummern des Wurfs (kreatur-proben.cjs:4327 sagt es selbst: „welcher Weg fällt, entscheiden die Leib-Größen“). Lokal headless gemessen (`--proben herde --selftest`): main 4c9e6aab 8,3 % jenseits (bis 2,77 Leinen, Anker 4,3 m auseinander), der Zweig 4,4 % (bis 2,75 Leinen, Anker 3,4 m), Soll > 10 %. Die Glieder heißen am Zweig anders (Rae · Yto · Mira statt Una · Orin · Pyx): der Zähler der Leiber vor der Probe (`_creatureNetSeq`) folgt der Szene. | — (Kreatur-Linse; nicht angefasst) | main 8,3 % → Zweig 4,4 % (beide ≤ 10 %, beide rot) |

## Offen

- 6b: die Brücke längs im Fluss (Ort-Gesetz, fachwerk-core `ortPlan` Brücken-Etikett) — am main am selben Ufer gleich rot,
  Messname `gate:werk-im-wasser` (Z). Nicht geheilt nach dem Brief; die Heilung gehört dem Ort-Gesetz (Kern, Byte-Beweis).
- 7: herde-revier unsichtbar — am main lokal gleich rot (8,3 % ≤ 10 %), Messname `gate:kreatur-takt` Teil 2.
- Der Sprung-Schritt von gate:chunk-satz (o)/(p) hängt lokal an main UND Zweig („DIE WELT HÄNGT“, Wald 61–71 offen) — lokal nur
  über die Kopie ohne Sprung gemessen; der Richter ist der CI-Lauf (Messname `gate:chunk-satz`).

## Stand (Vorprüfung 1)

- **Geschnitten:** sechs Linsen ziehen mit dem Gesetz der Landmarke, jede an ihrer EINEN Stelle — der Playtest W6.G P3 misst Bögen
  und Türme am Ort, den die Geologie trägt (feld-leben.cjs:1790 ff.), die Scatter-Scheibe würfelt den Belag des Genesis-Orts durch die
  Tür des Spiels (vegetation.cjs:2007), die Sicht-Arbeit stellt ihre Kante im Fenster des Wahl-Gesetzes (diag-sicht-arbeit.cjs:676,
  das Frustum über den EINEN Bau `_frustumVon`), der Klang-Zensus setzt die Feuerstelle des Menschen (diag-klang-zensus.cjs:297), die
  Satz-Wand erzwingt den Druck der dritten Kaskade am Boden-Satz (diag-chunk-satz.cjs:1452), Werk im Wasser bestellt die Kacheln
  eines Orts mit dem Faden (diag-werk-im-wasser.cjs:776). Kein Spiel-Code, kein Kern angefasst.
- **Gemessen (vorher → nachher):** W6.G P3 Bögen 0 · Türme 0 → Ort A 2 · 10 (Gesetz 2,83 · 10,32), Ort B 0 · 0 (0,03 · 0,15) ·
  Scatter 123 588 Zahlen ohne Ort → 245 124 Zahlen, 278 Formen, Faden = Haupt · Sicht (F) Täter „rand“ 0 → 15 Löcher, Gesetz 0 von
  1 693 · Klang keine Glut → dorf glut −27,2 dB (Soll ≥ −34) · Satz-Wand (j) Täter nichts → k0 90 600 B · k1 211 512 B · Werk im
  Wasser Warten > 20 min → Lauf durch, Selbsttest GRÜN · Playtest „Alle Invarianten OK“ · `check:statik` EXIT 0.
- **Offen:** 6b Brücke längs im Fluss (am main gleich rot, `gate:werk-im-wasser` Z, Ort-Gesetz fachwerk-core) · 7 herde-revier
  unsichtbar (am main gleich rot, `gate:kreatur-takt` Teil 2) · Sprung-Schritt der Satz-Wand lokal hängend an main und Zweig
  (`gate:chunk-satz` (o)/(p), Richter der CI-Lauf).
- **Probe-Ruf:** der Brief nennt fünf Proben, der Einlass fasst vier je Push (gpu-probe.yml:124; der Zug-Dienst in koordination, `PROBE_EINLASS_MAX`).
  Der Beitrag trifft Bau und Haus (stamm/siedlung-satz.js) → drei Pflicht-Wände; die vierte Probe ist `bild:wiese@0.5`, die Wiese,
  an der am main der Feld-Glutbrunnen und die Formations-Zelle standen. `bild:genesis@0.5` steht vom selben Schnitt am
  Kopf 18f96a3c (probe-post/landmarken-geologie-2/18f96a3c-genesis-0.5.png, GRÜN auf der GTX 1050). Gesehen: Kopfstein, Portale,
  Bank, Laterne, keine Glut ohne Menschen, keine Felsform auf dem Platz.
- **probeUrteil lokal:** `gate:pruefbuehne-licht` GRÜN (48 s) · `gate:studio-begehen` GRÜN (198 s) · `gate:weltbild-frost:echt`
  fährt nur auf der Karte (check.yml:1336, `matrix.karte == 'omen'`). Hier verliert swiftshader headful das Device beim Start
  („WebGPU Device Lost“, gpu-process 0xffffffff), am main eae94514 genauso (rc 124 nach 300 s). Der Richter ist die Probe der Karte.
- **Kopf:** der Commit, der dieses Blatt trägt (Vorprüfung 1, auf main eae94514); die 40 Zeichen stehen im letzten Stand nach dem Wartezimmer.
- **Beanspruchte Sprosse:** `karte2.erleben.spieler.wegfindung#1`.
- Karte 2 gebucht 120 von 1 718. Status ZWISCHENSTAND.
