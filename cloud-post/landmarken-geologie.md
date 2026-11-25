# Vorprüfung landmarken-geologie — die Landmarke folgt der Geologie, das Feld wirft kein Feuer

Zweig `landmarken-geologie` (von main 2da17e2e). ZWISCHENSTAND: Geschnitten · Gemessen (Zahl) · Karte 2 gebucht 118 von 1 718
(Stand-Datei `vision/karte-2-stand.json`, Zweig `punkte-maschine`; diese Abgabe bucht keine Sprosse, keine gebuchte fällt).

**Geschnitten:** Ein Gesetz an der Wurzel — gelaende-core `landmarke(L, x, z)` (additiv, erklärt in studio-vertrag §9): Felsbogen
und Felsturm je km² aus der Gesteinsklasse (`grossform(…).stil`, das Tafelland) × der Trockenheit des Orts (1 − `wuchs.decke`),
die Bänder der Profis im Gesetz zitiert. Der Stamm würfelt je Chunk Poisson(λ · Fläche) aus dem Samen des Chunks
(`_landmarkeChunk`, gerufen in `_tickSaat`), der Platz ist der höchste Punkt des Saat-Rasters auf dem Land. Die alte Regel (jede
Probe der Saat 1,4 %, `LANDMARK_RATE`) fiel ganz. Das Lagerfeuer: `glutbrunnen` IST die Feuerstelle (fachwerk `feuerstelle`);
gesetzt hat sie der Wurf des Felds (`FELD_WURF`, der Glut-Kanal von `worldFieldAt`) — ein Feuer ohne Menschen. Sie fiel aus der
Liste; die Feuerstelle setzt jetzt nur der Mensch (Bau-Modus, Satz der KI, Akt des Nexus). **Gemessen:** an 100 Zufalls-Orten
der Standard-Welt Glut 299 → 0, Bogen 294 → 0, Turm 291 → 0,51 je km²; im Tafelland der Heimat Bogen 0,88 / Turm 3,08 je km²
gegen die Bänder 0,85 / 3,1. **Ehrlich offen:** die Therme (kein Körper in irgendeinem Studio), das Bild und die GPU-Zahl.

## Die Bänder (äußere Quellen, im Gesetz zitiert, Stand 2026)

| Art | Ort des Bands | Quelle | Zahl | je km² |
| --- | --- | --- | --- | --- |
| Felsbogen, feucht | Red River Gorge (Kentucky) | USFS Daniel Boone NF | > 100 Bögen auf 29 000 acres (117 km²) | 0,85 |
| Felsbogen, trocken | Arches (Utah) | NPS | > 2 000 Bögen auf 76 519 acres (310 km²) | 6,5 |
| Felsturm, Tafelland | Sächsische Schweiz | Sächsischer Bergsteigerbund · LfULG | 1 134 freistehende Gipfel auf 363 km² | 3,1 |
| Felsturm, sonst (Tor) | Dartmoor | DNPA | > 160 Tors auf 954 km² | 0,17 |
| Therme / Geysir | Yellowstone | NPS | > 10 000 hydrothermale Erscheinungen auf 8 991 km² | ≈ 1,1 — OFFEN, kein Körper |

## Zahlen vorher ↔ nachher (dieselbe Probe: der Saat-Gang im vm, `_tickSaat`-Raster, `_vegetationSampleSpawn` + `_landmarkeChunk`)

Scheibe R = 250 m (≈ 0,2 km²) je Messort (`spec/profiband/haushalt.json`), je km²; vorher main 2da17e2e, nachher dieser Zweig.

| Ort | Glutbrunnen | Felsbogen | Felsturm | Blume · Busch (Streu, die den Platz erbt) |
| --- | --- | --- | --- | --- |
| Mess-Wiese −280,4/−1045,6 | 340 → 0 | 319 → 0 | 216 → 0 | 72 → 113 · 5 → 10 |
| Genesis (Ankunft 0/0) | 177 → 0 | 373 → 0 | 306 → 0 | 0 → 0 · 0 → 0 |
| Dorf −841/−861 | 515 → 0 | 286 → 0 | 209 → 0 | 5 → 15 · 0 → 5 |
| Prüfbühne 300/0 | 177 → 0 | 330 → 0 | 239 → 0 | 0 · 0 |
| Hochhaus-Dach | 334 → 0 | 278 → 0 | 238 → 5 | 0 · 0 |
| Gipfel-Blick | 185 → 0 | 291 → 0 | 255 → 0 | 0 · 5 → 5 |
| Küste | 196 → 0 | 330 → 0 | 278 → 0 | 490 → 520 · 57 → 62 |
| Ufer | 232 → 0 | 397 → 0 | 253 → 5 | 139 → 155 · 36 → 46 |
| **100 Zufalls-Orte (19,6 km², ±5 km)** | **299 → 0** (5 871 → 0) | **294 → 0** (5 770 → 0) | **291 → 0,51** (5 716 → 10) | 128 → 164 · 17,7 → 19,4 |
| Anteil Orte mit 0 Glutbrunnen | 0 → 100 von 100 | | | |
| Anteil Orte ohne Landmarke in 0,2 km² | 0 → 91 von 100 | | | |

Das Band (je 20 000 Chunks = 37,3 km², `_landmarkeChunk` am Wirt im vm; die Linse misst dasselbe auf 15 km²):

| Satz | Felsbogen je km² (Band) | Felsturm je km² (Band) |
| --- | --- | --- |
| Tafelland der Heimat (stil ≥ 0,9, feucht) | 0,88 (0,85) | 3,08 (3,1) |
| Heimat außerhalb der Tafel (stil 0) | 0 (0) | 0,19 (0,17) |
| trockene Tafel (decke 0) | 5,89 (6,5) | 3,27 (3,1) |
| vulkanische Zone, Therme | — | OFFEN (kein Körper, s. u.) |

Die Streu erbt den Platz: was vorher Glut oder Landmarke gewann, gewinnt jetzt die nächste Art der Affinität — an den
Zufalls-Orten Blume +28 %, Busch +9 %, Geode 6,3 → 7,0 je km². Der Wald (`_forestPlantChunk`) ist unberührt.

## Die Linse (Gebot 10) — scripts/diag-phyto-tree.cjs (in `check:statik`, +4 s)

„Landmarke: das Feld wirft keinen Bau, der Bogen und der Turm folgen dem Gesetz des Orts" — am Wirt im vm (`grundWirt`):
(a) jede Art von `FELD_WURF` ist Natur (`_istNatur`); (b) über je 8 000 Chunks Tafel / außerhalb / trocken liegt die Zahl je Art
binnen 4 σ ihrer Erwartung Σ λ · Fläche. Selbsttest ROT am Täter: die alte Regel (1,4 % je Probe) → `_landmarkeChunk: Tafel der
Heimat felsturm 1356 auf 1,9 km², das Gesetz erwartet …`; die Feuerstelle zurück in der Liste → `FELD_WURF: das Feld wirft glutbrunnen`.

## Folgen (gelesen, nicht geraten)

- gate:settlement Teil O: die Liste der Linse ohne `glutbrunnen` (sonst `quelle` ROT). Der Selbst-Schein „bau" wirft jetzt den
  Akt des Felds als Probe (die Feuerstelle mit der Marke `feldWurf`, die der Nexus noch trägt), „art" den Stein des Menschen.
- gate:fahr-leben L1 Hangfuß: fuhr an „den nächsten Glutbrunnen am Dorf-Messort" — den warf das Feld (101 je 0,2 km²); nach dem
  Schnitt wäre L1 vakuös. Jetzt setzt die Probe die Feuerstelle als Werk an den Hangfuß der Welt (welt-orte `hangfuss`, rMax
  200 m); am Gesetz im vm liegt er 72 m vom Messort (−787,8/−909,5, Hang 8 m westlich). Die Fahrt kommt vom Hang statt mit der
  Gier 92,3° der Schau. Selbsttest der Fahr-Linse grün; der Browser-Lauf von L1 steht aus (hier keine Seite gefahren).
- Andere Gates (stoss-Station, weg-boden TRITT, Prüfbühne, Klang-Zensus, Kollisions-Bild) setzen ihre Feuerstelle bzw. ihre
  Exemplare selbst — unberührt. Der Dorf-Brand zündet über `_brandZuenden`, nie an der Feuerstelle (`stamm/feld-brand.js`).
- Goldens: keine Spec trägt eine Zahl dieser Arten (nur die Albedo-Tafel die Farbe der Feuerstelle).
- Karte 2, gelesen in der Meisterkarte 2 (Zweig `punkte-maschine`): Glut/Feuer lesen leben.oeko.sukzession#1, same.kopplung.stoerung#1,
  same.kopplung.kaskade#1, same.kopplung.gewalt#1, same.kopplung.ereignis#1, mensch.wirtschaft.energie#1 — keine liest die
  Feuerstelle des Felds, keine gebuchte fällt. FRONT-Kandidat: erleben.spieler.wegfindung#1 („Turm, Fels, Gipfel vom Rauschen
  der Ferne trennbar"): vorher 585 Landmarken je km² (Rauschen), nachher 0,5 je km² an Zufalls-Orten — im Ring 1–3 km
  (25 km²) erwartet ≈ 13, P(≥ 1) ≈ 1 am Gesetz; gebucht wird sie erst mit dem Bild (Kontrast ≥ 0,1 aus 1–3 km), nicht hier.
  planet.geologie.inneres#3 (Geysire, heiße Quellen nur über Wärme-Anomalien) bleibt offen.

## Offen (mit Grund und Messnamen)

- **Die Therme / Glut aus Vulkanismus:** kein Studio trägt einen natürlichen Wärme-Körper (Geysir, Quelle, Fumarole) — der
  einzige Glut-Körper war die Feuerstelle des Menschen. Ein Gesetz ohne Körper wäre tot; die Heimat liegt im Platten-Inneren
  ohne Vulkan (planet-core), dort ist die Dichte ≈ 0 ohnehin. Die Adresse ist planet.geologie.inneres#3, das Band Yellowstone
  ≈ 1,1 je km². „In vulkanischer Zone im Band" ist damit NICHT erfüllt.
- Das Bild: `[gpu-probe: bild:wiese@0.5, bild:genesis@0.5, gate:webgl-probe]` — Mess-Wiese und Ankunft ohne Feuerstellen und
  Zacken-Wald; Draw-Calls und Tris dort vorher↔nachher misst die Probe (hier keine GPU).
- gate:fahr-leben L1 im Browser (die neue Geometrie am Hangfuß).

## Fragen

Keine, die die Abgabe hält. Ob die Therme eine neue Leiter bekommt, setzt der Schöpfer.
