# fluss-netz — EIN Flussnetz aus dem Abfluss über das echte Relief

**Status ZWISCHENSTAND** · Karte 2 gebucht 119 von 1 718 · Basis `origin/hydro-samen` 41840fb6 · main heute c3631992 (V18.546.435),
`w28-hydro-samen` noch NICHT in main → der Vorprüf-Kopf wartet (Brief: erst wenn hydro-samen in main liegt; bis dahin WIP `[skip ci]`).
Beansprucht: `karte2.same.kopplung.kohaerenz#1` (je Saat ≥ 95 %) · `karte2.leben.wasser.bild#1` (Konsum-Leser).
Kopf (WIP, Zweig `fluss-netz`): `eb658794de9d6cc31d16657fa861b2bc211a060f` — der Schnitt b892eaaa, der Vertragsakt eb658794.

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
- **Die Linse** (Gebot 10): Stern-Zensus `sternZahl`/`netzUrteil` in `scripts/diag-worker-dichte.cjs`, Familie `gate:gelaende-realismus`,
  Mutante `stern` (die Grenze des Zusammenflusses fällt). VORHER ROT am Täter (41840fb6): „25 · 31 · 31 Punkte mit ≥ 3 Zuflüssen“ je
  Saat; nachher GRÜN „Sterne 0“, Selbsttest „der Zusammenfluss ohne Grenze (Stern) → ROT“; das Tor läuft 53 s. Leser: `flussLaeufe`.

## Gemessen (101 Saaten, vorher 41840fb6 → nachher b892eaaa, gleiche Bedingungen)

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
| Wang: Land-Knoten der Ebene 0, deren Lauf im Meer endet (20 Saaten, 64 km) | 0,323 | 0,323 | Wang 2018 ≈ 0,8 — offen |
| Kosten `hydrosphaere` je Saat (1 Faden, 8 Saaten, min aus 3 · 3 · 5 kalten Läufen, abwechselnd) | 238,8 · 239,5 · 201,4 ms | 265,9 · 267,8 · 251,3 ms | Δ **+35 ms** im Mittel ≤ Latte 70 ms ✅ |

Das Bild: `cloud-post/fluss-netz-bild/vier-saaten.png` — anazh-realm-seed, same-saat-0, same-saat-29, same-saat-33; oben vorher (rote
Ringe = Sterne, 13 · 22 · 22 · 22 je Kachel; die Bäche als Sehnen, Speichen in einen Punkt, der Mäander ein Sinus auf der Geraden),
unten nachher (0 Sterne, gekrümmte Läufe ins Tal, ungleiche Bögen, Zuflüsse stromab versetzt). Selbst angesehen: gegen das Ziel
stimmen Sterne und Sinus; einzelne lange schwach gekrümmte Läufe der Ebene 1 bleiben sichtbar (Offen, Achse).

## Vertragsakt (die Standard-Welt bewegt sich)

- Wire-Goldens `spec/golden/v1`: unbewegt.
- Messorte am Wasser (`spec/profiband/haushalt.json`, gate:profiband H1, Toleranz 0,05): der Schnitt hob das Watt am Küsten-Ort
  −215,7/10 555,3 um 0,58 m (Meer 52,25 statt 40 m) und rückte am Ufer-Ort −118/−838 das Wasser von 4,75 auf 17 m. Beide neu gefunden mit
  denselben Kriterien und demselben Blick (`orte-neu.cjs`): **kueste −229,7/10 579,3** (27,8 m; Höhe −2,39, Meer −3 in 40 m, Hang 0,87°,
  Äsung 0,10, 0 Kronen im Blick, Ring kronenfrei) · **ufer −96/−833** (22,6 m; Höhe 22,09, Fluss 21,84 in 4,75 m, 8,65 m breit, Äsung
  0,61, Fuß 0,6°, 0 Kronen im Blick). Die Wiese bleibt grün.
- Die Bühnen des Küsten-Selbsttests (`diag-profiband.cjs` S20c) ziehen mit (`buehne-neu.cjs`): die Mündung 1191,1/9928,8 liegt nun 0,32 m
  unter dem Meer → **1211,1/9888,8** (44,7 m; der Täter-Wirt ohne Kacheln liest Meer in 33,75 m, die Welt den Fluss am Ort); der Wald am
  Watt 859,3/10 430,3 liegt 1,74 m unter dem Meer → **744,3/10 555,3** (169,9 m; 0,62 m über dem Meer in 39,5 m, 5 Kronen in der
  Ego-Sicht). Nach dem Akt: `diag-profiband` EXIT 0, Selbsttest GRÜN 58/58.
- Station: kein Kandidat — der Richter von `kohaerenz#1` misst unverändert (≥ 95 % je Saat), er wird nur grüner.

## Offen (mit Grund und Messname)

- **Wang 0,32 statt ≈ 0,8 ins Meer** — die Senken der Ebene 0 enden als See ohne Überlauf (`knotenFluss` senke 1); der Schnitt fasst die
  Ebene 0 nicht an. Messname `wang.cjs` „Anteil ins Meer“.
- **Achse > 10 Breiten 7,7 %** (p95 73 Breiten) — der Neigungs-Deckel der Achse skaliert die ganze selbstähnliche Kurve auf
  |Y|/Sehne ≈ 0,03–0,05, weil der Mäander senkrecht zur Sehne schert; der Schnitt wäre der Mäander in der Normalen der lokalen Achse.
  Die Variante Neigung 0,4 machte die Gerinne-Geraden schlechter und kostete +82 ms (verworfen). Messname `netz-mass` `achse.ueber10w`.
- **L2/L1 0,99** — Ströme 2. Ordnung der Ebene 1 enden nach einem Glied auf der Rinne der Ebene 0 (parallele D8-Ketten auf dem
  400-m-Gitter). Messname `horton-netz` „L2/L1 p50“.
- **Gerinne-Gerade > 10 Breiten: 16 Läufe (0,5 %, max 10,54)**. Messname `netz-mass` `gerade.ueber10w`.
- **Zwei Mündungen in einer Breite** (≥ 3 eintretend in max(2 m, w)): 481 → 139 in 73 Saaten. Messname `netz-mass` `sterne.genauEng`.
- **probe-tag**: `artifacts/profiband/werkzeug/zug.sh` fehlt in diesem Container — der Probe-Ruf folgt dem Brief: `gate:webgl-probe`,
  `bild:genesis@0.5`, `bild:ufer@0.35`, dazu `gate:gelaende-realismus` und `gate:profiband` (meine Linsen).
- **Der Vorprüf-Kopf** wartet auf `w28-hydro-samen` in `origin/main`.
