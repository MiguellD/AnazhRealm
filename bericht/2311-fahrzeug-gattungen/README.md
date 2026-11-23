# Vorprüfung fahrzeug-gattungen 1 — GTX 1050, 23.11.

Auftrag (Koordinator 02:22): `fahrzeug-gattungen` 90b02ef6c zu Ende bauen — main hinein, B-h und der volle Check, das BILDPAAR
an stadt-voll (gleiche Pose, gleiche Uhr; sechs Gattungen müssen als sechs Fahrzeuge lesen), Kosten vorher ↔ nachher.
Sprosse `mensch.fahrzeug.gestalt#1`; ihre Station (`k2-mensch-fahrzeug.js`) misst am Messort **stadt-voll** (`K.messort("stadt-voll")`,
Klasse Ort — der Preis-Hinweis 531–600 MB gegen 400 trifft sie; die Reihe der Epochen der Sprosse 2 steht am selben Ort).

## Geschnitten

1. **Der Transporter ist ein Kasten** (`vehicle-core.js`). Der Transporter des WIP (vier Türen, Glas rundum, Dach 1,75 am
   Anschlag des Reglers) las im Bild der Wiese als zweiter SUV — „sechs Farben einer Karosse“ für genau diese Gattung. Die
   Eigenschaft `kasten` (additiv): das Seitenfeld hinter der Fahrertür und die Hecktür tragen Blech statt Glas. Das Rezept:
   zwei Türen, Dach 2,0, Gürtel 1,15, Radstand 3,3 (L 5,20 · B 2,20 · H 2,09 m). Die Regler-Bänder `dach` (bis 2,1) und
   `guertel` (bis 1,2) reichen dafür weiter — das Rezept ist ein Punkt des Regler-Raums, kein Wert außerhalb.
2. **Die Wand zeigt beide Seiten.** Das Seitenfeld ist EINE Fläche; als Glas zeigte sie beide Seiten, als Blech nur eine. An der
   Wagenseite, an der sie nach innen blickt, stand der Transporter als offenes Gerippe (Bild `wiese-loch-vorher.png`). Jetzt
   steht dieselbe Fläche im Gegen-Umlauf daneben (von außen und aus dem Laderaum).
3. **Die Linse** in `gate:vehicle-drive` (A7, Node, 1,4 s): der Seitenriss jeder Gattung aus `buildInstance` (die feine Stufe,
   Raster Karosse/Glas auf 2 cm). (a) ZWILLING: zwei Risse am Boden und an einem Ende aufeinander, Abweichung unter 0,3 liest
   als EIN Wagen; (b) LOCH: derselbe Riss von der Gegenseite, einseitiges Blech fällt, wo es vom Auge wegblickt — mehr als 2 %
   verschiedene Zellen sind rot. Mutanten: der WIP-Wagen am echten Kern („transporter liest als suv“, 0,288), eine Blech-Wand
   als EINE Fläche am echten Raster (33,3 % gegen 0).
4. **Das Gesetz der Kabine** (`vehicle-core.js` `kabineGesetz`, im EINEN Form-Durchgang `epocheForm` jedes P — Bau,
   Fahr-Physik, Labor). Die geweiteten Bänder sind je Art absolut; am GT rechnete der Rand `guertel = 1,2` (= sein Dach) 7 668
   nicht-endliche Werte in die Puffer (`gate:regler-wirkt`: BRICHT, beim Namen), über dem Dach stülpt sich die Kabine um. Jetzt
   bleibt der Gürtel 10 cm unter dem Dach (die kleinste Glas-Höhe der alten Bänder; kein Rezept, keine Epoche bewegt sich —
   kleinste Glas-Höhe über 126 Fälle 0,35 m). Linse A8 in `gate:vehicle-drive`: 48 Ecken des Regler-Paars an sechs Gattungen;
   Mutant = der Kern-Text ohne das Gesetz (10 Zeilen rot, der GT beim Namen).
5. **Der Byte-Vertrag trägt sechs Gattungen** (`gate:vehicle-contract`). Die Linse zählte fünf aus einer Hand-Liste — der
   Transporter fuhr ohne Byte-Beweis, die Wand blieb grün. Die Liste kommt jetzt aus dem Kern (`GATTUNGEN`), die EINE
   Golden-Wand (fachwerk · porta · schmiede · vehicle) nennt jeden Fall ohne Golden beim Namen (vorher rot: drei Zeilen
   „transporter-… fehlt im Golden“). Vertrags-Akt: 17 → 20 Fälle, die 17 alten byte-gleich (15 Zeilen dazu, 0 weg).
6. Die Klasse „neues Rezept, alte Tafel“: die Wort-Tafel trägt `gestalt.transporter` (`gate:sprache` F nannte es); der
   Seitenriss der Linse ruft das EINE Dreiecks-Raster (`gate:altlasten` nannte den Zwilling, Zahlen unverändert).
7. main hinein (.381 im WIP-Kopf 720259315, dann .382 im Kopf 3ef592936, beide ohne Konflikt), `_fahrzeugGattungen` in der
   Modul-Karte (Studio/gestalt), der Umschlag der Goldens neu eingefroren.

## Gemessen

**Das Paar an der Station** — stadt-voll, 13 Uhr, Pose (856,2 · 57,47 · 441,05 → 865,65 · 57,42 · 433,65), GTX 1050,
`werkbank lauf` 8 s nach 4 s Einlauf, Regler voll. Vorher = 539cad7d9 (main .377 mit der Cull-Heilung von march-warter, drei
Gattungen), nachher = derselbe Baum mit dem Schnitt (6fa26860a). Der Kopf trägt denselben Schnitt auf main .382.

| Maß | vorher | nachher |
| --- | --- | --- |
| Gattungen im Verkehr (21 Wagen) | 3 — limousine 9, kompakt_fwd 8, suv 4 | 6 — kompakt_fwd 7, suv 5, limousine 4, transporter 3, gt 1, supersport 1 |
| frameMs p50 / p95 / p99 | 33,31 / 50,06 / 66,62 | 33,32 / 50,08 / 66,72 |
| cpuTaktMs p50 / p95 | 25,06 / 42,59 | 24,91 / 45,56 |
| gpuMs p50 / p95 | 4,19 / 5,13 | 3,70 / 4,90 |
| Zeichen-Befehle Mittel (p95) | 198 (238) | 190 (235) |
| Dreiecke Mittel | 1 228 676 | 1 224 051 |
| VRAM des Renderers jetzt / Spitze | 188,3 / 221,1 MB | 190,2 / 230,7 MB |
| Karten-Atlas | 32 Schichten, 9,324 MB | 34 Schichten, 9,907 MB |

Das stehende Bild an der Pose (`werkbank zaehlen`): 231 Befehle / 573 837 Dreiecke ↔ 200 / 523 804 — kein gleiches Paar, es
zählt den Wagen, der gerade vorn steht (vorher eine Limousine fein auf 6–8 m, nachher der Transporter in Stufe 1 auf 16–20 m).
Der Preis der drei neuen Gattungen an der Station: zwei Karten-Schichten (+0,58 MB), +9,6 MB VRAM-Spitze; Bildzeit im Rauschen.

**Der Kern je Gattung** (`buildInstance`, Dreiecke fein / Stufe 1; Budget-Zeile 32 000 / 10 600):

| Gattung | fein | Stufe 1 | Glas-Anteil am Seitenriss | nächster Nachbar (Abweichung, Soll ≥ 0,3) |
| --- | --- | --- | --- | --- |
| gt | 28 424 | 9 808 | 20 % | supersport 0,327 |
| supersport | 27 956 | 9 660 | 15 % | gt 0,327 |
| limousine | 28 528 | 9 896 | 24 % | gt 0,368 |
| kompakt_fwd | 28 716 | 10 056 | 31 % | — |
| suv | 30 624 | 10 512 | 35 % | limousine 0,407 |
| transporter | 31 404 | 10 548 | 12 % | suv 0,570 (im WIP 0,288 — der Zwilling) |

Links gegen rechts: höchstens 0,08 % verschiedene Zellen an allen sechs (der Kasten mit EINER Blech-Fläche: 23 %).
`gate:vehicle-drive` B-h an stadt-voll: 21 von 21 Wagen tragen eine Gattung des Kerns, sechs Gattungen fahren.

## Bilder

- **DAS PAAR nah, zwei Gattungen nebeneinander** (echte Karte GTX 1050, Messort wiese, 13 Uhr, dieselbe Pose, derselbe Platz):
  `wiese-wip-zwilling.png` (VORHER, WIP 90b02ef6c) ↔ `wiese-reihe-B.png` (NACHHER, am WIP-Kopf 720259315). Vorher steht rechts neben dem
  weißen SUV ein zweiter SUV in Orange (der Transporter des WIP: vier Türen, Glas rundum); nachher steht dort ein Kastenwagen
  — Kabine vorn, die Wand zu, höher als der SUV. Selbst angesehen, beide Bilder.
- `wiese-reihe-A.png` · `wiese-reihe-B.png` — die sechs Gattungen auf freiem Grund (Messort wiese, 13 Uhr, 11 m, feine Stufe,
  am WIP-Kopf 720259315): GT, Supersport, Limousine · Kompakt, SUV, Transporter. Das Urteil des Auges: sechs Wagen — zwei Coupés
  verschiedener Haltung, Stufenheck, Schrägheck, Geländewagen, Kastenwagen (höher als der SUV, Kabine vorn, Wand zu).
- `wiese-wip-zwilling.png` — VORHER (WIP 90b02ef6c): der Transporter mit Glas rundum neben dem SUV — zwei SUV.
- `wiese-loch-vorher.png` ↔ `wiese-gegenseite.png` — der Kasten von der Gegenseite: EINE Blech-Fläche (offenes Gerippe) ↔
  die Fläche im Gegen-Umlauf (Wand zu).
- `station-vorher.png` ↔ `station-nachher.png` — das Paar an der Station (stadt-voll, 13 Uhr, gleiche Pose): der Verkehr fährt
  durch, vorn steht je der Wagen, den der Takt gerade bringt (vorher eine Limousine auf 6 m, nachher der Transporter auf 18 m,
  Stufe 1). Dass sechs als sechs lesen, zeigt die Reihe der Wiese; die Station zeigt, dass die Stadt sie fährt.
- `lauf-vorher.txt` · `lauf-nachher.txt` (`werkbank lauf`), `gattungen-vorher.txt` · `gattungen-nachher.txt` (Zensus und
  `werkbank zaehlen` an der Pose), `linsen-vorher-rot.txt` (die drei Linsen ROT am Täter), `tore.txt` (der Tor-Satz am Kopf).

## Ehrlich offen

- **GT · Supersport 0,327** liegt 0,027 über der Zwillings-Schwelle (0,3; der Täter stand bei 0,288). Zwei Sportwagen, beide
  von den Goldens eingefroren — die Schwelle trennt, der Abstand ist schmal. Messname: `gate:vehicle-drive` A7.
- **Der Transporter füllt seine Budget-Zeile**: fein 31 404 von 32 000, Stufe 1 10 548 von 10 600 Dreiecken. Der Kern hält
  die Zeile an jedem Regler-Rand selbst (`gate:regler-wirkt` Teil 1 am Kopf, siehe Tore).
- **Paar-Ecken der übrigen Regler** misst niemand: `gate:regler-wirkt` bewegt EINEN Regler je Bau, A8 das Paar Gürtel × Dach.
  Ob ein zweites Paar (Radstand × Kabinen-Länge, Überhänge) eine Beziehung braucht, ist ungemessen.
- **Rezept ohne eigenen Byte-Fall an den anderen Kernen**: vehicle 6 von 6, porta 10 von 10 gemessen; schmiede trägt 48
  Klingen-Fälle und fünf Arena-Szenen (die Arena-Stücke nur in der Szene), fachwerk ungemessen. Die Golden-Wand nennt jetzt
  jeden Fall des Ist ohne Golden — eine Hand-Liste, die ein Rezept auslässt, sieht sie weiter nicht.
- **Die Station misst an stadt-voll** (Klasse Ort, Preis-Hinweis des Koordinators). `werkbank lauf` trägt dort auf beiden
  Bäumen „BELEGUNG ROT: Pflicht über dem Boden“ und p95 50 ms — nicht dieser Schnitt, derselbe Stand vorher wie nachher.
- Das Paar steht auf main .377 mit der Cull-Heilung (gleiche Basis beider Seiten); der Kopf trägt main .382 dazu und ist an
  der Station nicht neu gemessen (der Bau jeder Gattung ist am Kopf byte-gleich, 20 Goldens; B-h am Kopf: 21 von 21).
- Der helle Fleck am Heck des Transporters ist der Himmel im Lack der geneigten Hecktür (die Tür ist ein geschlossener
  Körper), kein Loch. Der Streifen 1600 × 520 von `werkbank bild --fov 30` ist um das Doppelte gestreckt (Werkzeug-Fund,
  FUND-REGISTER) — die Bilder hier stehen im Seitenverhältnis des Schirms.

## Tore am Kopf

GTX 1050, je Linse EIN Schloss-Griff (Hand-Halt 476 s), die Protokolle in `tore.txt`.

**Am WIP-Kopf 720259315 (main .381 im Baum), 10:08–11:32:**
- `gate:regler-wirkt` Teil 1 ✅ · `gate:vehicle-drive` ✅ · die Reihe der Wiese (w6) ✅, Bilder selbst angesehen
- `gate:pruefbuehne-licht` ✅ · `gate:weltbild-frost:echt` ✅
- Verkehr je Stunde im Fenster 300 s: 10 Uhr ✅ · 23 Uhr ✅ (`diag-fahr-leben --verkehr`)
- `diag-garage-labor` + Selbsttest ✅ · `diag-fahr-leben` + Selbsttest ✅
- `gate:studio-begehen --selftest`: neun Selbsttests ✅, dann riss der Hand-Halt (476 s) vor dem Basis-Urteil (LAUF-EXIT 124)
- Playtest: ROT an den drei bekannten Feld-Zeilen (`feld.cjs:582` · `:590` · `:1451`, „FPS: 23“, 259 s) — nicht dieser Diff

**Am Kopf 3ef592936 (main .382 im Baum, ohne Konflikt), 11:30–12:24:**
- Node: format, `gate:vehicle-contract` (20 Fälle), nervensystem-vehicle, `gate:studio-vertrag`, `check:statik` ✅ (Exit 0)
- `gate:vehicle-drive` ✅ — A7 sechs Gattungen, engstes Paar gt · supersport 0,327; A8 48 Ecken, kleinste Glas-Höhe 0,100 m; B-h 21 von 21 Wagen
- `gate:studio-begehen` (Basis) ✅ in 95 s
- Playtest ✅ „Alle Invarianten OK“ (247 s)
- Verkehr 10 Uhr: erster Lauf am Hand-Halt gerissen (die Statik-Kette lief im Leerlauf daneben, Seite #2 nach 98,3 statt 83,8 s); zweiter Lauf allein grün (12:16–12:24: VK und VK-V ✅, 10 von 10 Zeilen grün)
- Probe-Tag mit dem Wächter des Zugs (`PROBE_PFLICHT`, Basis main): Beitrag 16 Dateien, Siedlung `stamm/siedlung-verkehr.js` → PROBE-TAG OK; Gegenprobe ohne `gate:studio-begehen` ROT beim Namen
