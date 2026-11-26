# fluss-netz — EIN Flussnetz aus dem Abfluss über das echte Relief

**Status ZWISCHENSTAND** · Karte 2 gebucht 130 von 1 718 (`vision/karte-2-stand.json`, punkte-maschine 26.11. 14:55; Ziel 1 718 am 17.12.) · Basis: main c814741e (V18.546.436) + der Diff von `origin/hydro-samen`
41840fb6 · main heute 54b89949 (V18.546.437), `w28-hydro-samen` noch NICHT in main → der Vorprüf-Kopf wartet (Brief: erst wenn
hydro-samen in main liegt; bis dahin WIP `[skip ci]`).
Beansprucht: `karte2.same.kopplung.kohaerenz#1` (je Saat ≥ 95 %) · `karte2.leben.wasser.bild#1` (Konsum-Leser).

**Die Stationen nach Regel 1 (Koordinator 13:10), am Kopf c4226224 — diese Zeilen gehen wörtlich in den Rumpf des Vorprüf-Kopfs:**
- `karte2.same.kopplung.kohaerenz#1 · ROT · S1 Umfang nicht erzeugbar: die Hydrosphäre lebt nur für die Saat der Welt` — so liest die
  Station in `punkte-maschine` heute (Akte `same.kopplung.kohaerenz.1.f63a69ef-radeon.json`), weil ihr `WASSER_AN` jede fremde Saat
  vor dem Ruf abweist (`a.saat !== st.worldMeta.seed → fehlt`). Die Fähigkeit liefert die Basis hydro-samen (`_hydroSaat`), der
  Wächter fällt mit ihrem Stations-Vorschlag `cloud-post/hydro-samen-station.diff` (setzt der Koordinator). Station nicht gefahren:
  sie misst in der warmen GPU-Sitzung (radeon|gtx), kein Gerät im Container. Ihr Maß im gebooteten Spiel über denselben Leser
  (`diag-worker-dichte --faden --planet --saaten 100`, K8, EXIT 0): **101 von 101 Saaten ≥ 95 %, 5 038 von 5 050 Paaren = 99,8 %**
  (schlechteste same-saat-25 48 von 50; hydro-samen allein 92 von 101, 98,1 %) · die Saat der Welt byte-gleich · je Saat im Faden
  Median 100 ms, max 382 ms. Im Betreff steht sie erst, wenn der Vor-Richter sie grün liest.
- `karte2.leben.wasser.bild#1` — Station nicht gefahren: Bild-Station der GPU-Sitzung (die Sicht unter Wasser je Gewässertyp, Bach ·
  See · Fluss gegen Davies-Colley & Smith 2001 / Carlson 1977), kein Gerät im Container. Der Schnitt ändert, wo Gewässer liegen, nicht
  ihre Optik; Konsum am Kopf: `diag-wasser-leben` EXIT 0. Kein Anspruch im Betreff — Konsum-Leser.
Kopf (WIP, Zweig `fluss-netz`): `117adc9e8c911d678f80c7d02587a15801ac97be` — der Schnitt, der Vertragsakt und die Linsen auf der Basis oben (das Blatt im Commit danach).

Messwerkzeuge im Zweig: `cloud-post/fluss-netz-bild/` (`netz-mass.cjs` Station · Sterne · Gerade · Rand · Kosten über die
Hydrosphäre der Heim-Region, `horton-netz.cjs` Strahler/Horton/Hack am Graph der Glieder 12 km, `wang.cjs`, `orte-neu.cjs` und
`buehne-neu.cjs` für den Vertragsakt, `netz-bild.cjs` + `bild-paar.cjs` für das Bild). 101 Saaten = `anazh-realm-seed` + `same-saat-0 … 99`.

## Geschnitten (an der Wurzel Knoten → Glied, `gelaende-core.js`, EIN Netz, kein Zwilling)

- **Der Abfluss über das Relief** (`knotenFluss`, `RELIEF_FANG` {fang 1 m, proben 4}): ein Knoten der Ebene k ≥ 1 erreicht seinen
  D8-Unterlieger nur, wenn die Fläche der Ebene darüber längs der Verbindung nie 1 m unter dessen Sohle fällt — sonst fängt das tiefere
  Tal dazwischen den Lauf, er mündet dort. Die Sehne eines Bachs quert kein Tal mehr und steigt nicht am Gegenhang.
- **Der Zusammenfluss ist binär** (`zusammenfluss`, `knotenZiel`, `ZUSAMMENFLUSS` {fernM 24, abstandM 24, nah 0,88, weg 0,3}): X behält
  Hauptlauf und nächstes Lot; jeder weitere mündet STROMAB auf der Bahn von X, ≥ 24 m hinter X und hinter der Mündung davor. Topologie,
  A und Sohlen bleiben die des Netzes.
- **Die Achse des Laufs** (`LAUF_ACHSE`, `achseBau`): kein Glied ist eine Sehne — Mittelpunkt-Verschiebung 0,183 · Teil-Sehne (D ≈ 1,10;
  Tarboton 1996: 1,1–1,4), Catmull-Rom, EIN Maßstab-Faktor aus Versatz ≤ 0,15 · Sehne, Krümmung ≤ ½ Mäander-Scheitel, Neigung ≤ 0,27.
- **Der Mäander ohne Sinus** (`MAEANDER`: λ 11 Breiten ± 0,3, wellenStreu 0,35, gestreckt 0,42): ungleiche Wellen; Leopold & Wolman
  1960 λ ≈ 10–14 Breiten. Playfair (die Sohle des Zuflusses nie unter dem Tal) nur in der Aue; See-Toleranz `AUE_QUER · Zelle · √½`.
- **Der Hang eines Orts fragt seine Fläche** (`hangOrt`, `HANG_ORT` {umkreisM 120, rasterM 2}): trocken auf jedem 2-m-Punkt im Kreis
  des Dorfs, nicht an acht Punkten in 40 m — mit dem neuen Netz stand der Akt an 1299/750 mit einem Fluss 60 m neben dem Anker.
- **Die Linse** (Gebot 10), Familie `gate:gelaende-realismus` (`scripts/diag-worker-dichte.cjs` `netzUrteil`):
  - Stern-Zensus `sternZahl`, Mutante `stern`. VORHER ROT am Täter (41840fb6): „25 · 31 · 31 Punkte mit ≥ 3 Zuflüssen“ je Saat; nachher
    GRÜN „Sterne 0“; Selbsttest „der Zusammenfluss ohne Grenze (Stern) → ROT“.
  - Kreuzungs-Ratsche `kreuzZahl` (`KREUZ_RATSCHE` je Saat, nur fallend), Mutante `kreuz` (der Fang fällt): die freien Kreuzungen der
    Bahnen > 60 m von jedem Ende, 41840fb6 45 · 28 · 34 → **12 · 22 · 17**; Selbsttest „der Lauf ohne Fang (Kreuzung) → ROT“ (39 frei).
    Der Stern-Mutant kreuzt mit Recht auch (frei 12 → 14, `NETZ_MITROT`). Das Tor läuft 21 s.
- **Die Wasser-Linse liest das neue Gesetz** (`scripts/lib/wasser-linse.cjs`, gate:wasser-leben K4):
  - `wasserLaeufe`: ein Zufluss mündet auf der Bahn der Ebene darunter ODER seiner eigenen (der dritte eines Knotens); weiter im Glied,
    dessen Bahn durch die Mündung läuft. Vorher verlor die Linse diese Läufe (81 „verloren“), nachher **300 von 300 in See oder Meer**,
    11 Senken nass, 0 steigende Schritte in 31 105.
  - `wasserKarte`: der Messort der Strömung verlangt die Säule, in der der Körper SCHWIMMT (`_schwimmBrustM` + 0,3 m), nicht 1,2 m fest
    unter der Brust-Linie 1,26 m (am Ort −2164/−5866, Säule 1,25 m, stand der Schwimmer). Nachher 4 von 4 Orten: Schwimmer, Boot und
    Wolf treiben 1,80 m, ohne Strömung 0.

## Gemessen (101 Saaten, vorher 41840fb6 → nachher der Schnitt, gleiche Bedingungen; auf der Basis main c814741e + hydro-samen bit-gleich)

| Maß | vorher | nachher | Band der Quelle |
|---|---|---|---|
| Punkte mit ≥ 3 Zuflüssen (Kanten > 5 cm) | 414 in 98 Saaten | **0** | 0 ✅ |
| Station kohaerenz#1 je Saat ≥ 95 % (Boden ohne Kanal, `voxelY`) | 92 von 101 | **101 von 101** | 101 ✅ |
| … Σ der Paare | 4 954 / 5 050 | **5 038 / 5 050** | |
| steigende Paare über dem Boden ohne Kanal, max | 4 721 · 22,76 m | **674 · 7,63 m** | |
| … im Kanal (Sohle), max | 255 · 2,50 m | **31 · 1,24 m** | |
| längste Gerade des Gürtels (Achse) p50 · p90 · max | 376 · 709 · 2 532 m | **37 · 85 · 1 979 m** | |
| … Läufe > 10 Breiten | 2 189 von 3 354 | **230 von 2 987 (7,7 %)** | L&W 1957: „selten“ — offen |
| längste Gerade im Gerinne p50 · p90 · max (Breiten) | 5,71 · 6,84 · 10,46 | 7,37 · 8,71 · 10,54 | ≤ 10 |
| … > 10 Breiten | 6 | 16 (0,5 %) | offen |
| Bögen: Wellenlänge · Variationskoeffizient | 5,97 · 0,219 | 6,02 Halbwellen-Breiten (λ ≈ 12) · **0,340** | L&W 1960 λ 10–14 ✅ |
| R_B je Saat p50 (Graph 12 km, ohne höchste Ordnung) | 5,10 | **4,52** (p10 4,22 · p90 4,95) | Horton/Strahler 3–5 ✅ |
| R_L je Saat p50 | 1,53 | **1,74** (p10 1,56 · p90 1,88) | 1,5–3,5 ✅ |
| Hack-Exponent am Graph (12 km), je Saat p10/p50/p90 | 0,630 (r² 0,78) | **0,624** (0,593 · 0,626 · 0,653) | Hack 1957 ≈ 0,6 ✅ |
| Hack im 2-km-Fenster der Station | 0,471 | 0,502 | vom Fenster gekappt |
| Flint θ (gate:gelaende-realismus, 12 Preset-Läufe) | 6 von 12 in 0,4–0,6 | **8 von 12** in 0,4–0,6, alle 12 im Korridor des Tors (min 0,311) | Flint 1974 0,4–0,6 |
| Seen flacher als 10 cm | 9 | 2 | |
| Anteil der „Rand“-Enden (Heim-Region) | 56,4 % | **45,0 %** (Rand 1 326 · Zufluss 1 475 · See 107 · Meer 38) | |
| Kreuzungen der Bahnen (4 Saaten, 6 × 6 km um −2000/−5500) alle · frei | 658 · 277 | **446 · 94** | 0 — offen |
| … im Fenster der Linse (3 Saaten, 4 × 4 km) alle · frei | 272 · 107 | **217 · 51** | Ratsche |
| Wang: Land-Knoten der Ebene 0, deren Lauf im Meer endet (20 Saaten, 64 km) | 0,323 | 0,323 | Wang 2018 ≈ 0,8 — offen |
| Kosten `hydrosphaere` je Saat (1 Faden, 8 Saaten, min aus 3 · 3 · 5 kalten Läufen, abwechselnd) | 238,8 · 239,5 · 201,4 ms | 265,9 · 267,8 · 251,3 ms | Δ **+35 ms** im Mittel ≤ Latte 70 ms ✅ |
| Spalten-Kosten Ebene (gate:gelaende-realismus, ABAB 3 × 3 Saaten) | 25,0 noise2D | 24,7 noise2D | ≤ 26,4 (die Uhr rauscht ± 1,5 — auch vorher 27,5) |

Das Bild: `cloud-post/fluss-netz-bild/vier-saaten.png` — anazh-realm-seed, same-saat-0, same-saat-29, same-saat-33; oben vorher (rote
Ringe = Sterne, 13 · 22 · 22 · 22 je Kachel; die Bäche als Sehnen, Speichen in einen Punkt, der Mäander ein Sinus auf der Geraden),
unten nachher (0 Sterne, gekrümmte Läufe ins Tal, ungleiche Bögen, Zuflüsse stromab versetzt). Selbst angesehen: gegen das Ziel
stimmen Sterne und Sinus; einzelne lange schwach gekrümmte Läufe der Ebene 1 bleiben sichtbar (Offen, Achse).

## Vertragsakt (die Standard-Welt bewegt sich)

- Wire-Goldens `spec/golden/v1`: unbewegt.
- Messorte am Wasser (`spec/profiband/haushalt.json`, gate:profiband H1, Toleranz 0,05), neu gefunden mit denselben Kriterien und
  demselben Blick (`orte-neu.cjs`): **kueste −229,7/10 579,3** (vorher −215,7/10 555,3: das Watt hob sich 0,58 m) · **ufer −96/−833**
  (vorher −118/−838: das Wasser rückte von 4,75 auf 17 m). Die Wiese bleibt grün.
- Die Bühnen des Küsten-Selbsttests (`diag-profiband.cjs` S20c, `buehne-neu.cjs`): die Mündung → **1211,1/9888,8**; der Wald am Watt
  → **619,3/10 430,3** (Fluss in 44,5 m, der Saum 161,9 m weiter, Meer in 188 m, 3,48 m über dem Meer, 7 Kronen in der Ego-Sicht).
- Der See des Eises (gate:wasser-leben N2, `diag-wasser-leben.cjs`): an 1816/−6168 liegt nun Land → **1926/−6168** (3,37 m tief,
  Spiegel 0,87).
- Der Hang-Ort des Akts (gate:settlement O, `hangOrt` im Raster 2 m): an main bleibt **−1448,9/−388,2**.
- Die Hang-Orte (gate:settlement C-K3, `diag-settlement.cjs` `HANG_ORTE`): seit dem Abfluss über das Relief trägt −400/−3175 zwei Zellen
  über der alten Wand, kein Spieler-Ort binnen 3,6 km vier — vier Orte, deren Zellen die alte Wand wirklich nimmt (−400/−3175 ·
  880/−5095 · 1136/−5223 · 752/−5479, je Zelle EIN Dorf): **5 Hangdörfer** p95 ≤ 12 %, die Wand 0,35 zurück → ROT.
- Station: kein Kandidat — der Richter von `kohaerenz#1` misst unverändert (≥ 95 % je Saat), er wird nur grüner.

## Tore (lokal auf der Basis, Zweig-Stand)

gate:gelaende-realismus Selbsttest GRÜN (stern · kreuz beim Namen), die Welt GRÜN bis auf `kosten` im Rauschen (oben) · gate:settlement
EXIT 0 · gate:wasser-leben EXIT 0 (Selbsttest GRÜN, K4 300 von 300) · gate:worker-dichte GRÜN bis auf `ort.frage.bytes` (der Planet-SHA 8aa55db6 ≠ 22ec9a31) — auch
auf main 54b89949 selbst ROT, geerbt, nicht berührt · gate:profiband EXIT 0 (die Band-Wand steht).

## Offen (mit Grund und Messname)

- **Kreuzungen der Bahnen: frei 94 in 4 Saaten × 36 km²** (vorher 277). Am Netz des Abflusses kreuzen sich die Bahnen noch: die lange
  Mündungs-Sehne der Ebene 1 (`muendung` vom Fang-Punkt, bis ~1 km; am Ort −2164/−5866 quert sie den Nachbarn, die Spiegel 29,14 ↔ 28,38
  stehen quer) und der Mäander am Zusammenfluss (nah ≤ 60 m: 1/1 5 → 132). Der Schnitt wäre: das tiefere von zwei Gerinnen fängt das
  andere am Schnitt. Messname gate:gelaende-realismus „Kreuzungen frei“ (Ratsche 12 · 22 · 17).
- **Wang 0,32 statt ≈ 0,8 ins Meer** — die Senken der Ebene 0 enden als See ohne Überlauf (`knotenFluss` senke 1); der Schnitt fasst die
  Ebene 0 nicht an. Messname `wang.cjs` „Anteil ins Meer“.
- **Achse > 10 Breiten 7,7 %** (p95 73 Breiten) — der Neigungs-Deckel der Achse skaliert die ganze selbstähnliche Kurve auf
  |Y|/Sehne ≈ 0,03–0,05, weil der Mäander senkrecht zur Sehne schert; der Schnitt wäre der Mäander in der Normalen der lokalen Achse.
  Die Variante Neigung 0,4 machte die Gerinne-Geraden schlechter und kostete +82 ms (verworfen). Gemessen ist auch der Schnitt selbst
  (der Mäander in der Normalen der lokalen Achse, in `bahnPunkt`, der Polylinie und dem Spalten-Leser; 101 Saaten, gleiche Bedingungen):
  Neigung 0,6 · 1,0 → `achse.ueber10w` 230 → 83 · 87, `ueber20w` 207 → 36 · 38, aber `ms.p50` 291 → 383 · 369 ms (+78 bis +93 ms,
  über dem Budget von 70 ms), `ohneKanal.steigt` 674 → 751 · 793 (steigtMax 7,6 → 8,4 · 18,3 m), Gerade > 10 Breiten 16 → 17,
  genauEng 139 → 149 · 148 — verworfen, weil die Kosten über dem Band liegen und der Kanal öfter steigt. Offen bleibt der billige Weg
  dorthin (die Normale je Glied einmal in `achseBau` gecacht statt je Punkt). Messname `netz-mass` `achse.ueber10w` · `ms.p50`.
- **L2/L1 0,99** — Ströme 2. Ordnung der Ebene 1 enden nach einem Glied auf der Rinne der Ebene 0 (parallele D8-Ketten auf dem
  400-m-Gitter). Messname `horton-netz` „L2/L1 p50“.
- **Gerinne-Gerade > 10 Breiten: 16 Läufe (0,5 %, max 10,54)**. Messname `netz-mass` `gerade.ueber10w`.
- **Zwei Mündungen in einer Breite** (≥ 3 eintretend in max(2 m, w)): 481 → 139 in 73 Saaten. Messname `netz-mass` `sterne.genauEng`.
- **Das Fachwerk-Labor** fragt den Hang-Ort nur nach der Höhe (`trocken` = 3 m über dem Meer): dort bleibt 1299/750 mit dem Fluss 60 m
  daneben; die Welt fragt das Wasser. Messname gate:settlement O (der Ort des Akts).
- **probe-tag**: `artifacts/profiband/werkzeug/zug.sh` fehlt in diesem Container — der Probe-Ruf folgt dem Brief: `gate:webgl-probe`,
  `bild:genesis@0.5`, `bild:ufer@0.35`, dazu `gate:gelaende-realismus` und `gate:profiband` (meine Linsen).
- **Der Vorprüf-Kopf** wartet auf `w28-hydro-samen` in `origin/main`.
