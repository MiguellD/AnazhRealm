# spanne-auge — der Regen liest den Eingriff, das Auge steigt über die Saat

ZWISCHENSTAND: Geschnitten · Gemessen (Zahl) · Karte 2 gebucht 123 von 1 718. Beansprucht: `karte2.same.kopplung.terraform#1`,
`karte2.same.massstab.spanne#1`. Basis origin/main 12029279, V18.546.434 (Kopf 1 auf 4c9e6aab, Kopf 2 auf 3bbd1e8f, Kopf 3 auf
e71f2721, Kopf 4 auf 64fcf12e).

## A · same.kopplung.terraform#1 — die Täter-Zahl (vor dem Schnitt)

**Der „Rückfall“ hat keinen Commit.** Gerechnet in der echten Welt (Null-Renderer, Fächer der Station nachgebaut: Ziel 5 · Lee 5 ·
fern 3 · Karte 1, ohne ↔ mit „rainy“, Spieler an der Wiese −280,4/−1045,6):

- f63a69ef und 2da17e2e geben an 6 gleichen Uhren (0 · 600 · 1 200 · 3 600 · 7 200 · 20 000 s) **byte-gleiche** Zahlen
  (bilanzVerh 0,8625 · 1,4491 · 0,9753 · 1,3132 · 0,9742 · 0,6262). Kein Commit in f63a69ef..2da17e2e ändert das Feld.
- Die Bilanz ist eine Lotterie der Welt-Uhr: an main, 200 Uhren 0–39 203 s, liegt bilanzVerh nur an **12 von 200** (6 %) in 1 ± 10 %,
  Spanne 0,455 … 62,3. Die Radeon-Akten springen mit der Uhr ihrer Sitzung: b1f0de0e 0,79 · 486a6685 1,003 · f63a69ef 0,975 ·
  2da17e2e 0,807 (Ziel ohne 0,4203477358052692 an b1f0de0e UND 2da17e2e, bis zur letzten Stelle gleich: dieselbe Lage, nicht derselbe Code).

**Der Mechanismus (Täter):** phyto-core.js:5157 `wetterEingriff` — der Ausgleich des Lee ist EIN Faktor c = Σ g·(Wort − Natur) ÷
Σ gL·Natur über die ganze Region (96 Punkte bis 6 600 m, **ohne Relief**), angewandt als `rain · (1 − c·gL)` an jedem Lee-Ort
(phyto-core.js:5230). Die Station mittelt 5 Orte im Kern (1 485 m) und 5 im Lee, MIT Relief. Die Fronten tragen Wellen von 6 600 ·
4 100 · 2 500 m: der Kern der Region ist eine andere Stichprobe als ihre Summe, das Relief fehlt in der Summe — die Bilanz der
Station hält nur zufällig. Dazu: im Kern des Eingriffs (g = 1, bis 3 300 m um den Spieler) ist das Feld das Wort OHNE Relief
(phyto-core.js:5209) — ein Hang, den der Spieler hebt, kann den Regen dort nie ändern; und die Höhe des Regens
(`_wetterFeldAm` stamm/bild-himmel.js:3196 `_terrainMacroSurfaceY(…, false)`) liest keinen Edit des Spielers.

## A · der Schnitt (Kopf 1)

**Geschnitten — EIN Gesetz, die Verlagerung Ort für Ort** (phyto-core `wetterZug`, `wetterFeldAm`): der Regen, den der Eingriff an p
zieht, fehlt an seinem Lee-Partner q = p + `leeM` windab zur selben Uhr: Δ = g(p)·(T − R(p)), T = min(1, ρ·Wort), R die Natur am
Ort, beide mit dem Relief ρ desselben Orts; Δ ≤ R(q) (das Ziel nimmt nur, was das Lee getragen hätte — WMO 2017), Δ ≥ R(q) − 1.
Der Faktor der Region (`wetterEingriff`, 96 Spiral-Punkte, `WETTER_ORT.spirale`) fiel ganz. Das Relief formt jetzt auch den Kern
des Eingriffs (dort stand das Wort ohne Relief). Die Höhe des Regens trägt die Edits des Spielers (`_wetterFeldAm`
stamm/bild-himmel.js: `_terrainMacroSurfaceY` + gelaende-core `editHoehe` über `editsAm`, derselbe Leser wie `_fernNass`).

**Gemessen** (Null-Renderer, Fächer der Station nachgebaut, Spieler an der Wiese, Wort „rainy“, 200 Uhren 0–39 203 s):

| | main 4c9e6aab | Zweig |
|---|---|---|
| bilanzVerh in 1 ± 10 % | 12 von 200 (Spanne 0,455 … 62,3) | **200 von 200** (0,9961 … 1,0010) |
| alle drei Soll der Sprosse (Ziel höher · Lee tiefer · Bilanz) | 12 von 200 | 158 von 200 |
| fern \|Δ\| ≤ 0,02 | 200 von 200 | 200 von 200 |

Der gehobene Kamm (14 Füllungen `fillVoxel` r 12 in zwei Lagen quer zum Grundwind, Grat 29,6 → 77,6 m, 400 m windauf vom Spieler,
Mittel über 6 Uhren):

| Regen | main vorher → nachher | Zweig vorher → nachher |
|---|---|---|
| auf dem Grat, Wort „rainy“ (im Eingriff) | 0,600 → 0,600 | **0,535 → 0,771** |
| 600 m windab, Wort „rainy“ | 0,600 → 0,600 | **0,352 → 0,183** |
| auf dem Grat, Natur (Eingriff fern) | 0,471 → 0,471 | **0,471 → 0,624** |
| 600 m windab, Natur | 0,252 → 0,252 | **0,252 → 0,122** |
| 600 m windauf (Kontrolle) | 0,643 → 0,643 | 0,643 → 0,643 |

**Die Linse** (gate:wetter-wache, Familie (O), am echten Kern im Selbsttest): PAAR (Ort ↔ Lee-Partner mit = ohne, ≤ 1e-9, über einem
Hügel-Relief) · BEREICH [0, 1] · EINGRIFF (das Wort am Ort des Eingriffs, wo das Lee trägt) · RELIEF IM EINGRIFF (Kontrast ≥ ½ des
Kontrasts draußen, Smith & Barstad 2004) · KAMM in der Welt (`fillVoxel` → Regen am Grat steigt, windab sinkt). Am alten Kern ROT:
PAAR 1,4 · RELIEF IM EINGRIFF 0,000 gegen 0,498; am alten Leser KAMM 0,4713 → 0,4713. Gepflanzt: „das Lee zahlt nicht“ → ROT an
(O) PAAR · „ohne die Grenze des Lee“ → ROT an (O) BEREICH · „das Relief nicht im Eingriff“ → ROT an (O) RELIEF IM EINGRIFF · „die
Höhe des Regens ohne Edits“ → ROT an (O) KAMM. Am Zweig: Paar 8,0e-15 · Kamm in der Welt 0,1145 → 0,1460, windab 0,1455 → 0,1200.
Wand 77 → 82 s (Deckel 90 s).

**Kosten:** je Bild ~9 Rufe des Felds, 99 % im Kern ohne Höhe; der Eingriff fragt je Ruf zwei Naturen (p, q) statt einer — die
96-Punkte-Summe je Uhr fiel. Edits kosten eine Karten-Frage je Höhe (`editsAm`, gemerkter Chunk), nur wenn Edits stehen.

**Ehrlich offen:**
- **Was die 42 Uhren trägt** (Koordinator 04:28; dieselbe Reihe der 200 Uhren, nachgezählt): an allen 42 fallen ZWEI Soll zusammen,
  „Ziel höher“ UND „Lee tiefer“; die Bilanz hält an 200 von 200. An **34** Uhren kippt das Vorzeichen: an den Ziel-Orten trägt die
  Front mit Relief mehr Regen, als das Wort zieht (T = min(1, ρ·0,6); Natur am Ziel im Mittel 0,372 gegen 0,231 an den 158), der
  Eingriff nimmt dort und gibt dem Lee — 0 · 1 773 · 1 970 · 3 743 · 4 728 · 5 516 · 6 698 · 7 880 · 8 668 · 9 653 · 10 441 · 10 835 ·
  12 608 · 13 790 · 15 563 · 16 745 · 18 321 · 18 518 · 20 488 · 22 261 · 23 443 · 24 625 · 26 398 · 27 186 · 28 368 · 29 550 ·
  31 323 · 34 278 · 35 066 · 35 460 · 36 051 · 37 233 · 38 021 · 38 415 s. An **8** Uhren fließt nichts (|Δ| ≤ 0,001 an Ziel und
  Lee; an 11 229 und 23 246 s trägt das Lee 0,000) — 2 955 · 11 229 · 19 700 · 19 897 · 21 670 · 23 246 · 32 308 · 33 490 s. Das
  Gesetz verlagert und erfindet nicht (WMO 2017); ein „Ziel höher“ an jeder Uhr verlangte Regen aus dem Nichts. Messname
  `karte2.same.kopplung.terraform#1` zielMehr an der Uhr der Sitzung.
- Der Lee-Schatten eines Kamms liegt genau `relief.schrittM` (600 m) windab — der Hang ist eine Zwei-Punkt-Steigung. Die Drift des
  Kondensats (Smith & Barstad: U·τ ≈ 11 km bei Zug 11 m/s, τ 1 000 s) trägt das Gesetz nicht.
- Regen-Bild und Pfützen am Spieler (`_tickRain`, `_weatherFieldFor`) lesen das Wort, nicht das Feld.
- `zug.sh probe-tag` liegt in diesem Container nicht (artifacts/profiband ist nicht verfolgt); das Tag folgt der Regel „Licht
  (bild-himmel.js) → gate:tag-achse:echt“ (Lage des Koordinators, 20.11.).

## B · same.massstab.spanne#1 — die Täter-Zahl (vor dem Schnitt)

**1 von 21 Adressen trägt das Auge, 0 von 21 steigen.** Die Station (AUGE_AN in meisterkarte-quelle/punkte/stationen/k2-same.js im Zweig `punkte-maschine`) liest an main eae94514
nur die geladene Saat (`a.saat !== worldMeta.seed` → 20 × „fehlt“), S1 steht als Leser „kein Verb hebt das Auge vom Leib“; der
Befund der Leser (leser-2611): „Beide Geräte: kein Verb hebt das Auge vom Leib (Steigflug 0,5 → 700 m), 1 von 21 Adressen.“
Die Linse K7 an main: „0 von 21 Adressen tragen Grund … kein Leser der Adresse · keine Taste trägt das Verb ‚steigen‘ · 0 von 5
Stufen gemessen“.

**Die Täter:** `_loopCamera` (stamm/koerper-bewegung.js:1765) — die Kamera folgt nur dem Leib (Ego: Auge am Leib, Third: der Arm
des Orbits), kein Eintrag der Verb-Tafel hebt sie. `_gelaende()` (stamm/gelaende-boden.js:833) — EINE lebende Lage, die der
geladenen Saat; eine fremde Saat hat keinen Grund, die Sicht kann die Welt nicht als Funktion der Adresse fragen.

## B · der Schnitt (Kopf 2)

**EIN Gesetz der Höhe des Auges** (stamm/koerper-bewegung.js): die Höhe a über dem Grund der Saat wächst mit sich selbst,
da/dt = s·k·a (`_augeSchritt`, `AnazhRealm.AUGE_STEIG`: k = 60·ln 1,01 — Cesium „moveRate = Höhe / 100“ je Bild bei 60 Hz, jede
Größenordnung 3,86 s; höchstens 2 000 m). Der Grund ist an jeder Adresse dieselbe Funktion (`_augeAn(saat, x, z, a)` → gelaende-core
`hoehe` über `_gelaende(saat)`). `_augeHeben` sitzt in `_loopCamera` für Ego UND Third: sinkt a unter das Auge des Rigs, ruht es
(`augeHoehe` 0, das Rig byte-alt); eine Decke über dem Leib hält es darunter.
**Das Verb** `steigen`/`sinken` (Verb-Tafel, gehalten −1..1; Tasten R / Bild auf und X / Bild ab in den DEFAULT_KEYBINDINGS — eine
gespeicherte Belegung erbt sie). **Die Lage je Saat** (stamm/gelaende-boden.js `_gelaende(saat)`): gelaende-core `lageGrund` der
Saat, gemerkt je Saat (höchstens `GELAENDE_SAATEN` 8); ohne Saat die lebende Lage wie bisher.

**Gemessen** (Null-Renderer, Wiese Ego, Takt des Spiels 60 Hz; Linse K7 `--teile steig` und der Kandidat der Station wörtlich):

| | main eae94514 | Zweig |
|---|---|---|
| Adressen mit Grund und Gesetz (Fächer 20 Saaten + die geladene) | 1 von 21 (Station) · 0 (kein Leser) | **21 von 21**, 21 verschiedene Gründe (107,9 · 33,2 · −1,23 … m) |
| das Gesetz 0,5 → 700 m | – | **12,15 s** (Soll ≤ 30 s) |
| der Flug in der Welt über die Taste | kein Verb | **KeyR: 2,1 → 700,3 m in 9,65 s**, zurück (`sinken`) in 9,73 s, 0 Brüche, Takt ≤ 83 ms |
| die Lage der geladenen Saat über `lageGrund` gegen `_terrainSaatY` (64 Punkte) | – | 0 m |

**Kosten je Höhen-Stufe** (je Stufe 120 getaktete Bilder, CPU-Zeit des Takts; Heap der ganzen Seite mit GC-Rauschen):

| Stufe | p50 · p95 ms | Mio. Dreiecke | Meshes | Chunks | Heap MB |
|---|---|---|---|---|---|
| Leib 2,1 m (vor dem Flug) | 1,88 · 3,41 | 0,473 | 142 | 25 | 436,4 |
| 2 000 m | 1,88 · 2,31 | 0,469 | 141 | 25 | 254,3 |
| 697 m | 1,98 · 3,53 | 0,469 | 141 | 25 | 268,2 |
| 70 m | 1,85 · 2,18 | 0,470 | 141 | 25 | 282,3 |
| 7 m | 2,19 · 3,46 | 0,462 | 144 | 25 | 293,8 |
| Leib 2,1 m (nach dem Flug) | 2,11 · 2,74 | 0,462 | 144 | 25 | 305,3 |

Die nächste Größenordnung kostet nicht mehr: nichts lädt mit der Höhe (25 Chunks an jeder Stufe, 0,462–0,473 Mio. Dreiecke,
2 000 m nicht über dem Leib); der Unterschied der Meshes folgt der Welt-Uhr (die Ankunft räumt ab), nicht der Höhe. Lauf auf dem
Stand mit main eae94514 (auf 3bbd1e8f wieder K7 GRÜN, 700 m nach 9,65 s); ein Lauf davor gab dieselbe Form (0,434–0,489 Mio., p50 1,70–2,07 ms). Das Auge
kostet je Bild einen Ruf `hoehe` und eine Exponentialfunktion.

**Die Linse** (gate:kamera-laub K7, Familie der Kamera-Linse, `--teile laub,steig`): der Fächer durch den Leser des Auges, die Gleichheit
der Lage, der Flug über die Taste des Verbs (KeyboardEvent am Fenster) bis 700 m in ≤ 30 s, die Kosten je Stufe gegen den Leib
(p50 ≤ 2× + 1 ms, Dreiecke ≤ 1,1×), der Schmuggel in derselben Welt: „das Auge ohne Hub“ (`_augeHeben` → y0) → ROT „hebt sich in 3 s
um 0 m“, „die Lage nur der geladenen Saat“ → ROT „1 verschiedene Gründe“. Selbsttest 15 Fälle, jeder Täter beim Namen. An main
ROT (oben). Wand der ganzen gate:kamera-laub lokal 2 m 12 s (vorher 139 s in CI).

**Das Bild:** der Messort `wiese-auge` (spec/profiband/haushalt.json, `auge` 700): `werkbank umstellen --ort` hebt das Auge über
`augeHoehe`, schwingt die Welt dort ein und bricht laut, steht es nicht auf seiner Höhe (der Schritt wörtlich in der Null-Welt:
2,1 → 700 m, die Welt steht nach 394 Takten, die Kamera der GPU-Probe liest 700 m). Das Schema prüft `auge` (gate:profiband S23a:
„−1 m“ → ROT). Die Orts-Wand (gate:altlasten) zählt einen Platz als EIN Paar: die Wiese und ihr gehobenes Auge stehen auf
demselben — vorher meldete der Selbsttest jede Abschrift doppelt („feuert nicht“, ROT in check:statik). Lokal steht die Welt
unter swiftshader nicht (16 Karten der Ferne `pnull`, auch am Genesis-Ort) — das Bild kommt von der Radeon: `bild:wiese-auge@0.5`.

**Die Station** (Kandidat `cloud-post/spanne-auge-station/`, Diff gegen origin/punkte-maschine e925941d + BEGRUENDUNG.txt): AUGE_AN
liest den Leser des Spiels an jeder Adresse, AUGE_FLUG fliegt hin und zurück über die Taste; S1 misst steig_s = max(Gesetz, Flug)
= 12,15 s mit Zeuge auge_m 700,3. meisterkarte-quelle/punkte/punkte.cjs `liste` (Zweig `punkte-maschine`): 1 976 Stationen · Fehler 2 — genau gelaende.K2#1/#2 „Wand HAKEN“ (die Basis ebenso).

**Ehrlich offen:**
- `probeUrteil` über die lokalen Logs: gate:profiband GRÜN · gate:wetter-wache GRÜN · gate:kamera-laub EXIT 0 (K1 und K7 GRÜN),
  im Urteil ROT an „SOLL-TAFEL: 14 von 14 Klassen ROT“ — die Zeile druckt der Selbsttest K5 an main eae94514 ebenso (die Tafel
  steht „veraltet“, nicht mein Schnitt). gate:tag-achse:echt steht lokal unter swiftshader nicht (BLIND), ihr Richter ist die Radeon.
- Die GPU-Zeit je Höhe (die Zahlen oben sind CPU-Takt im Null-Renderer): ungemessen bis zur Ratschen-Serie von `wiese-auge`.
- Die Bruch-Bedingungen im BILD des Flugs (Pop, Loch, Stufen-Wechsel je Höhe) — die Station zeichnet je Höhe kein Ausgabe-Bild;
  `bild:wiese-auge` zeigt EINE Höhe.
- Die Stufen der Chunks folgen dem Leib, nicht dem Auge (über 700 m ist die Nähe unter dem Auge so fein wie am Boden).
- Die Decke reicht 2 km (`AUGE_STEIG.maxM`); S3 verlangt 10 km. Der Pad trägt kein `steigen` (16 von 16 Knöpfen belegt).
- Der Flug an den 20 fremden Saaten trägt Grund und Gesetz, nicht die gezeichnete Welt (Boot je Saat).
- `zug.sh probe-tag` liegt in diesem Container nicht; der Ruf folgt der Lage des Koordinators (bild-himmel.js → gate:tag-achse:echt)
  und dem Bild der Schnitte (`wiese-auge` · `wiese` · `genesis`), höchstens vier.

## Funkeln (Koordinator 06:07) — die Täter-Zahl (vor dem Schnitt)

**0,26 % des Fels-Hangs funkeln** — 446 von 171 588 Pixeln springen um > 0,25 Luma gegen das Mittel ihrer acht Nachbarn
(65010917 `bild:dorf@0.42`, Maske Hang ∩ grau, erodiert; 40c7113c ohne Erdbau 0,02 %); **238 davon dunkel, 208 hell**. Das Pflaster
rechts: 0,00 % (22 404 Pixel). Zwei Wurzeln, beide im EINEN Stoff-Weg gelesen:

- **Der Glanz:** r184 trägt den Leser der Varianz nur für die GEOMETRIE-Normale (`getGeometryRoughness`, `normalViewGeometry`) — das
  Detail des `normalNode` (Mikro-Relief, Fels, Kopfstein, Fase) sah die Rauheit nie. Der Stoff-Weg trug keinen eigenen Leser.
- **Die Kante:** ein Glanz macht nur HELLE Pixel — die dunkle Hälfte ist Albedo. Die Kante der Fuge (`FELS.rand` 0,08 m hell,
  `kehle` 0,1 m dunkel) blendete nur nach Metern (`fein.fugeFern` 30 … 80 m); dort ist ein Pixel 0,04 … 0,11 m (75°, 1 080 Zeilen),
  die Kante 0,7 … 1,9 Pixel: ein Pixel trug sie ganz. Das Korn des Schutts folgte schon seinen Pixeln (`_kornSicht`).

## Funkeln · der Schnitt (Kopf 3)

**Geschnitten — die Klasse, nicht der Hang:**

1. **`_glanzFilter`** (stamm/stoff-material.js, Kaplanyan & Hoffman 2016): jeder Stoff mit Normalen-Detail liest die Varianz seiner
   Normale in die Rauheit — α² ← α² + min(2σ², κ), σ² = 0,25 · (|∂N/∂x|² + |∂N/∂y|²) auf `normalView` (`GLANZ_FILTER` σ² 0,25 · κ 0,18).
   EIN Rufer: die Erst-Zeichnung (`_renderObjectDirect`, stamm/bild-kosten.js) VOR dem Render-Objekt (der Bau-Schlüssel trägt die
   Rauheit, die er baut); der Schatten-Stoff über sein Original; je Rauheits-Quelle EIN Graph, ein Klon filtert nie zweimal.
   **Sampler +0** (nur Ableitungen und Rechnung). Die Konsum-Probe (eigene Seite, r184 WebGPU, swiftshader) fing den Bruch vor dem
   Kopf: `materialRoughness.pow2()` deklariert r184 als Variable vom Typ `null` — ungültiges WGSL, der Stoff zeichnete nichts; die
   Rauheit als `float` gefasst trägt das Programm `dpdx(normalView)` (15 048 → 15 410 Zeichen).
2. **Die Kante nach ihren Pixeln** (`_terrainGeologyAlbedo`): dieselbe Regel wie das Korn — unter 1,5 … 4 Pixeln der schmaleren
   Kante fällt sie auf ihr Mittel 1 (75°: voll bis 14 m, fort ab 38 m), `fugeFern` bleibt die Grenze des Zweigs.

**Linsen (je in bestehender Familie, Selbsttest nennt den Mutanten von main e71f2721):**

- gate:kamera-treue (l) GLANZ: jedes gebaute Render-Objekt der Welt mit Normalen-Detail trägt `dpdx(normalView)` im Programm; die
  Kontrolle (dasselbe Programm mit r184s Geometrie-Leser) zählt nicht; das Gesetz hält frisch · Klon · Geometrie.
- gate:hoehlen-sicht (f) KANTE: der Farb-Graph des Chunk-Stoffs trägt die Pixel-Sicht der Kante, und sie liest `screenSize`.

**Gemessen:** lokal Selbsttests GRÜN, check:statik GRÜN; die Welt-Linsen fahren in der CI (swiftshader stürzt hier am Welt-Boot, vor
wie nach dem Schnitt). GPU-Probe 7fadccbb (gtx1050-desktop) GRÜN: webgl-probe · `bild:dorf@0.42` · `bild:wiese@0.5`; am Bild der
Probe (Pose ohne Erdbau-Hang) Funkel am Fels **0,02 → 0,01 %** (38 → 24 Pixel), Pflaster 0,00 → 0,00; die Änderung liegt am Fels.

**Ehrlich offen:**

- Der Hang mit Erdbau (65010917, 0,26 %) steht erst im Bild, wenn `buendel-dorf` in main ist; ms/dc misst die Bild-Probe nicht —
  Messname `zeit:` am Band-Gerät, `bild:dorf@0.42`.
- Die Kluft (0,1 … 0,8 m breit) blendet weiter nach Metern (`fein.fern` 120 … 260 m): sie liegt im Bank-Term des Kerns (gelaende-core
  `felsFeinO` gibt `bank` = Helligkeit × Akzent × Kluft zusammen), ihre Pixel-Sicht verlangt den Schnitt im Kern-Gesetz.

## Schale (Koordinator 07:46) — die Täter-Zahl (vor dem Schnitt)

**Die Schale der Werkstatt füllt unter „rainy“ 0** — und der Täter ist nicht der Edit-Leser. Gerechnet in der Welt der Linse
(gate:werkstatt-weg, Null-Renderer, Ort der Schale, 60 Takte „rainy“) am Leser des Gefäßes `_wetterFeldAm`: Natur am Ort **0** ·
Natur am Lee-Partner (13 200 m windab) **0** · Feld des Worts 0,6 · Edits **0** (`editHoehe` wird ohne Edits nie gerufen) → Regen
**0**, Zeile „klar“. Der Täter ist die Kappe des Zugs, phyto-core `wetterZug`: `d = d > 0 ? Math.min(d, rq) : Math.max(d, rq - 1)`
— das Ziel nahm nur, was das Lee trug; unter trockenem Lee regnete das Wort nicht. Dieselbe Kappe überall: am Kern (6 Saaten × 4 Uhren)
an **14 von 24** Fällen trockenes Lee; an der Station (Wiese, Fächer Ziel 5, 200 Uhren) Regen am Ziel unter „rainy“ p10 **0,065** ·
p50 **0,287** · min 0,0096 gegen das Wort am Hang 0,526 (an 103 von 200 Uhren unter 0,3); am gehobenen Kamm (7 Füllungen) „rainy“
**0,0000 … 1,0000** über 200 Uhren (ein volles Lee hielt auch nasse Natur unter dem Wort fest).

## Schale · der Schnitt (Kopf 4)

**Geschnitten — EIN Regen-Feld, das Wort hält am Ziel** (phyto-core `wetterZug`, `wetterFeldAm`): im Eingriff Regen = R(p) +
g·(T − R(p)) an jeder Uhr, im Kern das Wort am Hang T = min(1, ρ·Wort); das Lee zahlt davon, was es trägt (`zahlt` = min(Δ, R(q)),
nimmt der Eingriff Regen weg max(Δ, R(q) − 1)), sein Regen bleibt in [0, 1]; den Rest bringt die Front des Worts aus dem Dampf der
Säule (AMS Glossary „precipitable water“: 10–50 mm auch unter klarem Himmel). Gefäß, Kamm, Wind und Blitz lesen den EINEN Leser
`_wetterFeldAm` — kein Zwilling, kein Flag.

**Linse** (gate:wetter-wache, Familie (O)): EINGRIFF am Kern — das Wort an JEDER Uhr (24 Fälle, 14 mit trockenem Lee; bisher nur, wo
das Lee trug) · PAAR und BILANZ, wo das Lee trägt (15 453 Paare, |Δ| 8e-15), der Import der Säule als Zahl (alle Paare ×1,269) ·
WORT in der Welt — der Spieler auf dem gehobenen Kamm sagt „rainy“, 200 Uhren. Am alten Kern ROT: „(O) WORT: … Regen 0 … 1 über 200
Uhren: Regen 0 unter Regen-Wetter an einem Ort mit Edit, das trockene Lee kappt das Wort“. Gepflanzt: „Regen 0 unter Regen-Wetter:
das trockene Lee kappt das Wort (main 64fcf12e)“ → ROT an (O) EINGRIFF · „Regen 0 unter Regen-Wetter an einem Ort mit Edit“ → ROT an
(O) WORT · „das Lee zahlt nicht“ → PAAR · „ohne die Grenze des Lee“ → BEREICH.

**Gemessen** (vorher = Kern von 7fadccbb = main 64fcf12e):

| | vorher | nachher |
|---|---|---|
| Schale (werkstatt-weg): regen · sonne · sichtbar | 0 · 0 · nein | **0,744 · 0,703 · ja** |
| gate:werkstatt-weg | Statik 10/10 · Wirkung 4/5 (Täter Schale) | 10/10 · 5/5 GRÜN (3 m 19 s) |
| „rainy“ auf dem Kamm, 200 Uhren | 0,0000 … 1,0000 | **0,6680 … 0,6680** |
| Station Wiese: Ziel unter „rainy“ p10 / p50 | 0,065 / 0,287 | 0,526 / 0,526 |
| Station: Ziel höher | 158 von 200 | 185 von 200 |
| Station: Bilanz in 1 ± 10 % | 200 von 200 | **60 von 200** (Median 1,443) |
| Station: alle drei Soll der Sprosse | 158 von 200 | **40 von 200** |

gate:wetter-wache GRÜN (Selbsttest 13 s, Welt 60 s); check:statik GRÜN 7 m 56 s.

**Ehrlich offen:**

- **Die Bilanz der Sprosse fällt an der Station** (Messname `karte2.same.kopplung.terraform#1` bilanzVerh): „Ziel höher · Lee tiefer
  · Bilanz ±10 %“ und „das Wort regnet an jeder Uhr“ schließen sich aus, wo das Lee trocken ist — an 140 von 200 Uhren der Wiese
  trägt das Lee den Zug nicht, die Front bringt im Median 44 % der Ziel+Lee-Summe aus der Säule. Entschieden: das Wort hält (Gefäß,
  Regen-Bild und Kamm an EINEM Feld); die Bilanz gilt Paar für Paar, wo das Lee trägt. Den Dampf, den die Front zieht, trägt kein
  Kanal des Felds (die Luft im Lee wird nicht trockener) — die Wasser-Bilanz aus Dampf und Regen ist offen, Messname wie oben.

## Batterie Kopf 4 — die Täter-Zahl (Code-Check 45775376662, Versuch 2)

GPU-Probe 13d6c260 GRÜN (radeon-890m, vier Tore). Die Batterie: 16 von 18 grün, zwei rot.

- **voll 17/18 „Stall-Akte“ — MEIN Rot.** Die Schlaf-Wand von gate:welt-boot: `eigene Schlafe neben sleep: Träger
  diag-kamera-laub.cjs statt FREMD keiner`. K7 (das gehobene Auge, Kopf 2) schlief dreimal mit eigenem
  `new Promise((f) => setTimeout(f, 0))` und las p50/p95 per Hand-Index statt `rang`.
- **voll 1/18 „Mehrspieler-Wand“ — nicht der Regen-Leser.** gate:mp-sync (f) „Reload mitten im Sturm: leben VERSCHIEDEN“
  (93 Zellen nur im Betrag, größter Abstand 4,73e-4). Geprüft an der Wurzel, die der Koordinator nannte (Zustand des Regen-Lesers):
  - **Das Gesetz trägt keinen Zustand:** `wetterZug`/`wetterFeldAm` schreiben `_wxP`, `_wxQ`, `_wxZug` je Ruf ganz neu, die Eingänge
    sind Saat · Ort · Uhr · Edits · Wort am Ort des Spielers; `_wetterFeldEin` hält nur die Tafel und die Leser (nach dem Reload
    neu gebaut, derselbe Inhalt).
  - **Das Leben liest ihn nicht:** der Ruf-Graph des Stamms ab `_feldTakt`, `_feldAktWirkt`, `_lebenImStand`, `_depositLife`
    (1 937 erreichbare Glieder, jeder gleichnamige Ruf eine Kante) erreicht den Regen von `_wetterFeldAm` nie; er erreicht den
    Wind-Kanal über den Brand (`_brandTempo` → `_windAt`, Brand 0 Zellen im Lauf) und den Pegel über `wetterAt` (`_pegelTafel` →
    `_regenMittel`) — beide nicht von Kopf 4 berührt. `_gelaende(saat)` (Kopf 2) ruft außer `_augeAn` niemand mit Argument.
  - **Lokal gemessen, gleiche Maschine, nacheinander** (Leben im Reload mitten im Sturm): 13d6c260 132/132 GRÜN · Kopf 5 158/167
    **ROT** · A B A B main 12029279 193/193, Kopf 5 136/136, main 192/192, Kopf 5 191/191 — alle GRÜN. Mein Baum 3 von 4 grün,
    main 2 von 2: die Zahl trennt bei so wenigen Läufen nicht. Versuch 1 der Batterie war abgebrochen, nicht rot.
  - **Der Befund des lokalen Rots nennt die Reihe der Akte, nicht den Regen:** „REIHE der Akte verschieden ab dem 23. von 24
    gemeinsamen: A 2325,62 (eigener Akt „leben“ −39,6/45,0) · B 2322,20 (eigener Akt „leben“ 56/5,4) — Täter _feldAkt“, Zelle 3,0:
    A 0,25 · B 0,5, 0 spät auf beiden Seiten. A wirkte seinen Akt 2325,62 am Eingang (`akt.w <= _feldHorizont()`), während B's
    Akt 2322,20 noch reiste — der Horizont von A lag über einem Stempel, den B noch senden konnte. Das ist die Klasse „(f) leben
    VERSCHIEDEN“ des Mehrspieler-Felds auf main (w28-studio-welt 14.11., damals geheilt mit w28-mp-boden). Kandidat der Wurzel:
    `_feldHorizont` überspringt einen Mitspieler, dessen Welt-Uhr noch unbekannt ist (`Number.isFinite(e.weltUhr)`; der Eintrag
    entsteht mit join/soul/dsl, die Uhr erst mit der ersten pos) — nicht gebaut: der Mechanismus ist nicht beim Namen gemessen,
    und das Feld liegt außerhalb der beanspruchten Sprossen. **Offen**, Messname gate:mp-sync (f) „Reload mitten im Sturm“.
  - **(b) Tür ist die Mutante des Selbsttests:** die Zeile „ROT (b) Tür … enabled=false“ steht im Selbsttest von diag-mp-sync,
    unmittelbar gefolgt von „SELBSTTEST OK: die alte Tür (initP2PSync ohne Absicht) macht (b) ROT“; im Lauf selbst ist (b) OK
    („Rejoin 1.5 s nach Server-Start“). Sie ist nicht die Folge von (f).

## Stall-Akte · der Schnitt (Kopf 5)

**Geschnitten:** K7 schläft mit dem EINEN `sleep` (`window.sleep`, `WARTEN_SEITE`) und rankt mit dem EINEN `rang` (`window.rang`) —
drei Schlafe und zwei Hand-Ränge fielen in derselben Welle; die Linse selbst wanderte nicht. Merge mit main 12029279: K7 (steig)
und K8 (feld, bewegungs-feld) stehen nebeneinander in Kopf, Lauf, Akte, Selbsttest und Urteil.

**Gemessen:** Schlaf-Wand vorher (CI, 13d6c260) Träger diag-kamera-laub.cjs → nachher Träger keiner; gate:welt-boot GRÜN;
diag-kamera-laub Selbsttest GRÜN (71 Fälle, K7 und K8); check:statik GRÜN 503 s; gate:mp-sync am Kopf-5-Baum 2 von 3 GRÜN (oben).

## Wartezimmer · erdbau-boeschung-2 (Koordinator 04:28)

Die Heilung stand schon im Zweig erdbau-boeschung selbst (03cafd96, 03:25 UTC = 04:25 MEZ, vom Arbeiter des Zweigs; Kopf über einem
Merge, nicht glatt). Keine zweite Heilung gebaut: `erdbau-boeschung-2` = **10168181**, EIN glatter Commit auf eae94514, Baum
byte-gleich 03cafd96 (a133198b + die Weltgrenze der Linse). Die Täter-Zahl: die Senke an alpha war der Grund der Boot-Welt in der
Regenesis der Linse — das Rondell der Sweep-Saat auf 90,31 m über 37,64 m Naturboden; das Spiel trägt die Grenze schon
(`_weltMetaWechsel`), die Linse nicht. Lokal: gate:gelaende-realismus GRÜN 76 s (alpha `voll` 0,53 · beta 0,26 · boot 0 Senken/km²,
Böschung 0 Kanten > 0,6 m an 4 Erdbauten, Selbsttest-Weltgrenze „90,31 über 37,64“ rot erkannt), check:statik GRÜN 7 m 38 s.
Der erste Kopf bed28e8b trug den Ruf des Betreffs wörtlich (`gate:webgl-probe bild:dorf@0.42`, ohne Komma) — der Einlass wies
ihn ab (EINE Probe, kein Name); 10168181 trägt denselben Baum mit `[gpu-probe: gate:webgl-probe, bild:dorf@0.42]`.
Koordinator 05:12: der Baum c8204bc0 fährt im Bündel `buendel-dorf` 65010917 — kein weiterer Kopf auf erdbau-boeschung-2.
