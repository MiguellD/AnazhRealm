# Zensus PLANET (a) relief-gestein

Baum: /home/user/AnazhRealm, main @ b7ed8419 (geprüft). Jede datei:zeile dieses Blatts ist vom Generator am Baum gegen die Datei geprüft (Ort: Text an der Zeile; Leser/Zwilling: Zeile existiert). Zeilen: 124 · folgt 27 · gesetzt_anker 7 · gesetzt 90 · technik 25 · ohne_leser 4 · mit Zwilling 23.

## §0 Kernantwort

Die Heimat ist heute eine **unbegrenzte Ebene**: `hoehe(L, x, z)` (gelaende-core.js:2819) ist eine reine Float64-Funktion von Saat, Erbgut und (x, z) ohne Rand, Klemme oder Wrap — kein Planet, keine Scheibe, keine Kachel; die 2048-m-Kachel (gelaende-core.js:5679) teilt nur das Wasser.
Ursprung (0, 0) ist der erste Spawn (0, 50, 0) (stamm/gelaende-chunks.js:1392); Meter, x = Ost, z = Süd, y oben (planet-core.js:2241); Saat „anazh-realm-seed" (stamm/speicher-welten.js:64) + Strom „:voxel" (gelaende-core.js:5986), Erbgut [wildnis] (gelaende-core.js:88) mit den def-Reglern (gelaende-core.js:379), Basis 0, Meer −3 m; die Heimat liest den Planeten nie (`ortGesetz(null)`, gelaende-core.js:5844).
Gemessen (reines Node, je Adresse einzeln, `a-mess.cjs`, 10 000 Adressen je Lauf): **nah** (±1 km um 0,0) kalt Median 1,47 µs / p95 4,75 µs, **fern** (±1 km um 1000 km, 0) kalt 1,46 µs / p95 7,41 µs (Läufe des Skripts: Median nah 1,22 / 1,47 / 1,62, fern 1,28 / 1,46 µs) — in der ENTFERNUNG ist die Höhe eine Funktion, nah = fern, und Lehre 22 trifft erst die Float32-Vertices (0,0625 m bei 1000 km, voxel-worker.js:3939).
In der FLÄCHE ist sie ein **Sack**: heapUsed wächst je kaltem Gebiet (+1 683 KB nah, +1 509 KB fern, warm ±25 KB) und fällt nie, weil die Knoten-Maps des Flussnetzes (gelaende-core.js:546) nie geräumt werden; eine Adresse in neuem Gelände kostet kalt ~1,3–1,5 ms und hält ~430 KB, 600 gestreute Adressen halten 262 MB, 100 km Gang hält 126 KB je km — 10 000 gestreute Adressen über 2000 km brachen mit „heap out of memory" bei 2 044 MB ab.
Fest sind nur die gepackten Schlüssel und das Band: Bühnen-Terme ±100 km (gelaende-core.js:114), Erdbau ±524 km (gelaende-core.js:2129), Bahn- und Grundriss-Gitter ±1048 km (gelaende-core.js:319, stamm/vegetation-baum.js:3288), Edit-Karte ±1416 km (gelaende-core.js:7276), vertikal base −135 … +282,6 m (stamm/gelaende-boden.js:2740) mit Deckel 267 m (gelaende-core.js:1883) und Tiefsee −120 m (gelaende-core.js:1899).
Und die Welt ist nicht einzigartig unbegrenzt: das Vendor-Rauschen permutiert `i & 255` (vendor/simplex-noise.js:54), jede Oktave wiederholt sich diagonal alle 147,80/f — der Kontinent alle 1330 km, das Hang-Detail alle 5,6 km, der Höhlen-Wurm alle 4,9 km (gemessen |Δ| 4,4e−13).

## §1 Tafel

Spalten: Ort = wo der Wert wohnt · Leser = wer die Welt damit ändert · Urteil (folgt / gesetzt_anker / gesetzt) · T = technik · oL = ohne Leser im Spielpfad (stamm/, voxel-worker.js, Kerne, index.html).


### Welt — Form, Ursprung, Saat, Grenzen

| id | Name | Größe | Wert · Einheit | Ort | Leser | Urteil — woraus | T | oL | Zwilling | Anmerkung |
|---|---|---|---|---|---|---|---|---|---|---|
| a1 | Welt-Form: Höhe als Funktion f(x,z) | weltgroesse | unbegrenzte Ebene, Float64, keine Klemme und kein Wrap in x/z · m | gelaende-core.js:2819 | stamm/gelaende-boden.js:734 – _terrainMacroSurfaceY: die EINE 2D-Höhe, 18 Rufer im Stamm<br>voxel-worker.js:1652 – G.dichteGitter → Chunk-Mesh<br>gelaende-core.js:7186 – dichteSpalte: surf der 3D-Dichte | **folgt** — hoeheGrund (gelaende-core.js:2836) faltet die Terme, Erdbau als letzter Term (:2825); der Wildnis-Term trägt keine Koordinaten-Grenze |  |  |  | gemessen nah ≈ fern (§2). Grenzen setzen nur Schlüssel, Float32 und das Rauschen (Zeilen unten) |
| a2 | Ursprung / erster Spawn | koordinate | (0, 50, 0) · m | stamm/gelaende-chunks.js:1392 | stamm/gelaende-chunks.js:1392 – die Spielfigur steht beim ersten Welt-Bau dort | **gesetzt** — Spawn-Punkt beim Welt-Bau; die Heimat-Hydroregion liegt um den Ursprung (±1024 m, stamm/gelaende-boden.js:592) |  |  |  |  |
| a3 | Achsen | koordinate | x = Ost, z = Süd, y oben, rechtshändig · m | planet-core.js:2241 | planet-core.js:2245 – Würfel-Karte um den Anker (auf/ost/nord) der Reise-Orte | **gesetzt_anker** — Konvention, im Code benannt (planet-core.js:2241) |  |  |  | nur der Planet nennt sie; das Heimat-Relief trägt keine Himmelsrichtung |
| a4 | Saat der Heimat | samen | "anazh-realm-seed" · Text | stamm/speicher-welten.js:64 | stamm/gelaende-boden.js:761 – Saat der Lage → lageRausch → jedes noise2D der Höhe<br>voxel-worker.js:1556 – state.noise im Faden | **gesetzt** — stamm/speicher-welten.js:27: die allererste Welt fällt auf diese Saat, damit sie ihr Aussehen behält (Anker eigenes Bild) |  |  | gelaende-core.js:2736<br>stamm/gelaende-chunks.js:366<br>stamm/feld-leben.js:1794<br>voxel-worker.js:1404<br>voxel-worker.js:1513 | das Literal steht 47× in 20 Spiel-Dateien (grep -c), je als Fallback |
| a5 | Rausch-Strom der Höhe | samen | Saat + ":voxel" · Text | gelaende-core.js:5679 | gelaende-core.js:5986 – lageRausch: new Rausch(seed + strom)<br>voxel-worker.js:1556 – Rauschen des Fadens | **gesetzt** — Name des Stroms |  |  |  |  |
| a6 | Basis-Höhe | basis_hoehe | 0 (DSL −50…50) · m | gelaende-core.js:5679 | stamm/gelaende-boden.js:769 – L.baseHeight = state.terrainBaseHeight<br>gelaende-core.js:598 – K = base + off + 0,3·rel<br>gelaende-core.js:1898 – Tiefsee-Klemme base − 112<br>gelaende-core.js:7212 – Höhlen-Boden base − 28 | **gesetzt** — Grund jeder Welt (gelaende-core.js:5676) |  |  | gelaende-core.js:2736<br>stamm/dirigent-kern.js:283 | die DSL terrain_base_height hebt die ganze Welt (stamm/feld-dsl.js:970); Talgrund-Fallback addiert die Basis doppelt (gelaende-core.js:1136) |
| a7 | Meer unter Basis | meeresspiegel | 3 → Spiegel −3 · m | gelaende-core.js:5679 | stamm/bild-himmel.js:485 – state.waterLevel = Basis − meerUnterBasisM<br>gelaende-core.js:670 – Senke der Ebene 0: Meer (h < wl) oder benannter See<br>gelaende-core.js:707 – Meer-Sohle min(hp, wl − 2)<br>gelaende-core.js:1885 – Bathymetrie unter wl | **gesetzt** — Grund jeder Welt |  |  | gelaende-core.js:2736<br>gelaende-core.js:520<br>gelaende-core.js:7190<br>gelaende-core.js:1292<br>gelaende-core.js:1327<br>stamm/gelaende-chunks.js:370<br>stamm/gelaende-chunks.js:716<br>stamm/gelaende-boden.js:379 | zählt der Wasser-Zensus; steht hier, weil das Relief ihn liest. Die Fallbacks widersprechen sich: base+4 (:520, :7190), base−3 (:1292, :1327), 0 im Stamm |
| a8 | Hydro-Kachel | kachel | 2048 (Schlüssel als Text, unbegrenzt) · m | gelaende-core.js:5679 | stamm/daten.js:203 – HYDROSPHERE.regionSize<br>gelaende-core.js:7020 – hydroRegion wählt die Kachel über kachelSchluessel (:25) | **gesetzt** — Grund jeder Welt | T |  | gelaende-core.js:2736 |  |
| a9 | Float32-Lage der Boden-Vertices | koordinate | 0,0625 ab 524 288 m; 0,125 ab 1 048 576 m · m | voxel-worker.js:3939 | voxel-worker.js:3968 – bodenKarte liest die Lage<br>voxel-worker.js:3971 – muldeEcken liest die Lage | **folgt** — ULP von Float32 an der absoluten Weltlage (Lehre 22), gemessen §2 | T |  |  |  |
| a10 | Rausch-Periode (vendor) | rausch_periode | 256/√3 = 147,80 Einheiten diagonal; Kontinent 1330 km · Rausch-Einheit | vendor/simplex-noise.js:54 | gelaende-core.js:573 – Kontinent C wiederholt sich alle 1330 km diagonal<br>gelaende-core.js:576 – Erosion E alle 473 km<br>gelaende-core.js:7216 – Höhlen-Wurm alle 4,9 km | **folgt** — perm[i & 255] (vendor/simplex-noise.js:54, :118) |  |  |  | gemessen: ¦Δ¦ 4,4e−13 diagonal, 1,70 nur in x |
| a11 | Grenze Erdbau-Zelle | weltgroesse | ±524 288 (Zelle 16 m × 32 768) · m | gelaende-core.js:2129 | gelaende-core.js:2211 – erdbauY fragt die Zelle → Höhe des Orts | **folgt** — (Zelle + 32768)·65536, zelleM 16 (gelaende-core.js:2094) | T |  | gelaende-core.js:2211 |  |
| a12 | Grenze Edit-Karte | weltgroesse | ±1 415 577,6 (32 768 Chunks × 43,2 m) · m | gelaende-core.js:7276 | voxel-worker.js:1637 – Edits je Chunk im Faden<br>stamm/gelaende-boden.js:1448 – Edits je Chunk im Stamm | **folgt** — (cx + 32768)·65536 + (cz + 32768) | T |  | stamm/gelaende-boden.js:1011<br>stamm/gelaende-boden.js:1471 | gemessen: Schlüssel(0, 32768) = Schlüssel(1, −32768) |
| a13 | Grenze Bahn-Gitter | weltgroesse | ±1 048 560 (16-m-Zellen, gx·131071 + gz) · m | gelaende-core.js:319 | gelaende-core.js:337 – bahnOrt: nächster Punkt der Bahn über das Gitter → bahnY (:349) | **folgt** — Packung gx·131071 + gz | T |  |  |  |
| a14 | Grenze Grundriss-Zelle | weltgroesse | ±1 048 576 (32 m × 32 768) · m | stamm/vegetation-baum.js:3288 | stamm/vegetation-baum.js:1034 – Streu meidet Grundrisse<br>stamm/siedlung-ort.js:2651 – Grundriss-Stand | **folgt** — Packung (gx + 0x8000)·0x10000, GRUNDRISS_ZELLE 32 (:3287) | T |  |  |  |
| a15 | Klemme der Bühnen-Terme | weltgroesse | ±100 000 · m | gelaende-core.js:114 | gelaende-core.js:35 – termY setzt Insel/Rampe/Bucht/Rinne/Bahn nur innerhalb | **gesetzt** — Normalform erbgutNormal |  |  | gelaende-core.js:129<br>gelaende-core.js:140<br>gelaende-core.js:171<br>gelaende-core.js:223 |  |
| a16 | Vertikal-Band der Chunks | hoehen_band | base −135 … +282,6 (232 × 1,8 = 417,6) · m | stamm/gelaende-boden.js:2740 | stamm/gelaende-boden.js:2681 – oy des Chunk-Gitters<br>voxel-worker.js:1652 – Dichte-Gitter über das Band | **folgt** — dimY·step = 417,6 − floorDrop 135 | T |  | voxel-worker.js:1991 | Kommentar :2724 „Gipfel ~+247 m, Tiefsee bis ~−144 m" — gemessen max 190 m, Klemme base −120 |

### Relief — Erbgut-Terme (Bühnen)

| id | Name | Größe | Wert · Einheit | Ort | Leser | Urteil — woraus | T | oL | Zwilling | Anmerkung |
|---|---|---|---|---|---|---|---|---|---|---|
| a17 | Zahl der Terme | landform | 1–32 · Terme | gelaende-core.js:93 | gelaende-core.js:2840 – hoeheGrund: Term 0 legt die Höhe, jeder weitere formt sie | **gesetzt** — Normalform |  |  |  | die Heimat trägt [wildnis]; Terme kommen aus worldMeta.gesetz.gelaende (Plan-, Studio-, Reise-Welt) |
| a18 | Insel-Term | insel | r 10–5000, plateau −100…200, kuppel 0–0,05, schelf 1–1000, grund −120…0 · m | gelaende-core.js:116 | gelaende-core.js:35 – termY: Plateau, Kuppel, Schelf, Grund per smoothstep | **gesetzt** — Grenzen der Normalform |  |  |  |  |
| a19 | Rampen-Term | rampe | winkel 1–60°, lauf 1–500, breite 1–500, krone 0–500, böschung 10–80° · m / ° | gelaende-core.js:123 | gelaende-core.js:35 – termY: Rampe addiert | **gesetzt** — Grenzen der Normalform |  |  |  |  |
| a20 | Bucht-Term | kueste | sohle 4–500, grund −100…50, ufer 5–60°, kolkTiefe 0–30 · m / ° | gelaende-core.js:155 | gelaende-core.js:35 – termY: Bucht als Minimum | **gesetzt** — Grenzen der Normalform |  |  |  |  |
| a21 | Rinnen-Term | fluss_netz | sohle 2–200, ufer 5–80°, quelle/mündung −100…200, einzug 0,01–1000 km² · m / ° / km² | gelaende-core.js:188 | gelaende-core.js:35 – termY: Rinne als Minimum | **gesetzt** — Grenzen der Normalform |  |  |  |  |
| a22 | Bahn-Term | bahn | breite 4–40, höhe −100…200, böschung 10–60°, übergang 0–100, ds 1; Landung R 80 · m / ° | gelaende-core.js:212 | gelaende-core.js:35 – termY: Bahn mit Böschung | **gesetzt** — Grenzen der Normalform; R 80 m aus v²/R < g bis 28 m/s (:300) |  |  |  |  |

### Relief — Großform T1 (LANDFORM_REGLER, Splines)

| id | Name | Größe | Wert · Einheit | Ort | Leser | Urteil — woraus | T | oL | Zwilling | Anmerkung |
|---|---|---|---|---|---|---|---|---|---|---|
| a23 | land | landform | 0,35 (−0,6…0,9) · 1 | gelaende-core.js:381 | gelaende-core.js:574 – C-Versatz → OFFSET-Spline (:577) und Küste (:578)<br>planet-core.js:2321 – Reise: land aus der Kontinentalität | **gesetzt** — Anker eigenes Bild |  |  |  | gemessen Land-Anteil 96–100 % (600 Streu-Adressen über 2000 km), Meer ~1,5 % |
| a24 | kontinentLambda | relief_wellenlaenge | 9000 (3000–24000) · m | gelaende-core.js:382 | gelaende-core.js:571 – Frequenz des Kontinent-Felds C | **gesetzt** — Anker eigenes Bild |  |  |  | die Reise setzt def (planet-core.js:2323): reist nie |
| a25 | hoehe (Relief-Skala) | relief_amplitude | 1 (0,2–1,6) · 1 | gelaende-core.js:383 | gelaende-core.js:579 – rel = Spline(E)·hoehe·Küste<br>planet-core.js:2322 – Reise: 0,6 + Steile | **gesetzt** — Anker eigenes Bild |  |  |  |  |
| a26 | rauhLambda | relief_wellenlaenge | 3200 (1200–9000) · m | gelaende-core.js:384 | gelaende-core.js:575 – Frequenz des Erosions-Felds E (Gebirge)<br>planet-core.js:2324 – Reise | **gesetzt** — Anker eigenes Bild |  |  |  |  |
| a27 | OFFSET-Spline C → m | ebene | C −1…1 → −48…+62 (8 Stützen; 0 bei C −0,2) · m über Basis | gelaende-core.js:405 | gelaende-core.js:577 – off → K (:598) und Hebung U (:599) | **gesetzt** — Anker eigenes Bild (Fritsch–Carlson-Spline :427) |  |  |  |  |
| a28 | RELIEF-Spline E → m | gebirge | E −1…1 → 175…2 (7 Stützen) · m | gelaende-core.js:415 | gelaende-core.js:579 – rel: Hülle über dem Talgrund (:1142) | **gesetzt** — Anker eigenes Bild |  |  |  |  |
| a29 | Küsten-Rampe | kueste | glatt(−0,28; 0,12; C) → Relief × (0,15 … 1) · 1 | gelaende-core.js:578 | gelaende-core.js:579 – flacht das Relief an der Küste | **gesetzt** — Anker eigenes Bild |  |  |  |  |
| a30 | Oktaven von C und E | relief_wellenlaenge | C = (n + 0,45·n(×2,7))/1,45; E = (n + 0,4·n(×2,3))/1,4 · 1 | gelaende-core.js:573 | gelaende-core.js:577 – off<br>gelaende-core.js:579 – rel | **gesetzt** — Anker eigenes Bild |  |  |  |  |
| a31 | Warp der Großform | relief_wellenlaenge | 0,00026 /m (λ ≈ 3846 m), ±70 m · m | gelaende-core.js:1265 | gelaende-core.js:569 – verzieht C, E und Stil | **gesetzt** — Anker eigenes Bild |  |  | gelaende-core.js:1268 |  |
| a32 | Grundhöhe K | relief_hoehe | base + off + 0,3·rel · m | gelaende-core.js:598 | gelaende-core.js:637 – Höhe der Ebene-0-Knoten → Fluss-Richtung und Meer/See<br>gelaende-core.js:1136 – Fallback des Talgrunds | **folgt** — Splines OFFSET und RELIEF |  |  |  | Fallback :1136 rechnet N.base + K = 2·base + … |
| a33 | Hebung U | hebung | 0,55 + rel/240 + max(0, off)/160 · 1 | gelaende-core.js:599 | gelaende-core.js:715 – ks·U: steilere Flüsse im Gebirge | **folgt** — rel, off (Großform) |  |  |  |  |
| a34 | Tafelland-Stil | tafelland | Feld 0,000192 /m (λ 5208 m), Schwelle 1 − 0,62·tafel; an ab rel 18…45, aus ab 160…195; tafel 0,5 · 1 | gelaende-core.js:591 | gelaende-core.js:738 – hebt die Sohle der Zuflüsse<br>gelaende-core.js:1201 – mischt die Schicht-Treppe in das Talprofil | **gesetzt** — Regler tafel 0,5 (gelaende-core.js:393), Schwellen Anker eigenes Bild |  |  |  |  |
| a35 | Trog-Gewicht | trog | glatt(95; 175; rel) × 0,7 · 1 | gelaende-core.js:601 | gelaende-core.js:922 – Querprofil b → 2 (Trogtal im Hochgebirge) | **gesetzt** — Regler trog 0,7 (gelaende-core.js:388), Band 95…175 Anker eigenes Bild |  |  |  |  |
| a36 | Höhen-Deckel | gebirge | 255 + 12·tanh((h − 255)/12) → ≤ 267 · m | gelaende-core.js:1883 | gelaende-core.js:1883 – kappt die Höhe vor jedem Leser | **gesetzt_anker** — unter der Voxel-Decke 282,6 m (Kommentar gelaende-core.js:1882) |  |  |  | gemessen max 190,0 m in 700 Streu-Adressen: der Deckel greift dort nie |

### Relief — Flussnetz T2 (Täler)

| id | Name | Größe | Wert · Einheit | Ort | Leser | Urteil — woraus | T | oL | Zwilling | Anmerkung |
|---|---|---|---|---|---|---|---|---|---|---|
| a37 | Netz-Kanten | fluss_netz | 1600 / 400 / 100 ÷ netzDichte · m | gelaende-core.js:424 | gelaende-core.js:544 – S je Ebene<br>gelaende-core.js:615 – Lage der Knoten (Talabstand) | **gesetzt** — Anker eigenes Bild |  |  |  |  |
| a38 | netzDichte | fluss_netz | 1 (0,6–1,8) · 1 | gelaende-core.js:386 | gelaende-core.js:544 – teilt die Kanten | **gesetzt** — Anker eigenes Bild |  |  |  | reist nie (planet-core.js:2320–2330 setzt ihn nicht) |
| a39 | rinnen | fluss_netz | 1 (0–1,5) · 1 | gelaende-core.js:400 | gelaende-core.js:545 – Ebene 2 an/aus<br>gelaende-core.js:729 – Einschnitt der Rinnen | **gesetzt** — Anker eigenes Bild |  |  |  |  |
| a40 | ks (Steilheits-Index) | erosion | 6 (1–20) × U · m^0,9 | gelaende-core.js:390 | gelaende-core.js:715 – ks·U<br>gelaende-core.js:724 – sMax = ks·(A·S²)^−θ: Gefälle der Sohle | **gesetzt** — Gesetz S = ks·A^−θ benannt (:390), Wert Anker eigenes Bild |  |  |  | Reise: 3 + 12·Konvergenz (planet-core.js:2326) |
| a41 | theta (Konkavität) | erosion | 0,45 (0,3–0,7) · 1 | gelaende-core.js:391 | gelaende-core.js:724 – Gefälle Ebene 0<br>gelaende-core.js:731 – Gefälle Ebene 1 | **gesetzt_anker** — Flint-Konkavität θ (gelaende-core.js:391) |  |  |  |  |
| a42 | Mindest-Gefälle der Sohle | erosion | 0,0004 · m/m | gelaende-core.js:717 | gelaende-core.js:725 – Sohle über dem Meer | **gesetzt** — Anker eigenes Bild |  |  | gelaende-core.js:725 |  |
| a43 | Meer-Sohle | schelf | min(hp, wl − 2) · m | gelaende-core.js:707 | gelaende-core.js:1167 – Bett der Segmente in der Fläche | **gesetzt** — Anker eigenes Bild |  |  |  |  |
| a44 | Einschnitt Ebene 1 | erosion | min(2 + 0,05·rel; 0,25·hang·S); Boden hp − 0,18·S · m | gelaende-core.js:732 | gelaende-core.js:735 – Sohle der Zuflüsse | **gesetzt** — Anker eigenes Bild |  |  |  |  |
| a45 | Einschnitt Ebene 2 | erosion | rinnen·min(1 + 0,03·rel; 0,15·hang·S) · m | gelaende-core.js:729 | gelaende-core.js:1150 – Rinnen-Profil in der Fläche | **gesetzt** — Anker eigenes Bild |  |  |  |  |
| a46 | Knoten-Streuung | fluss_netz | 0,15 + 0,7·zufall je Zelle · Zelle | gelaende-core.js:615 | gelaende-core.js:645 – knotenFluss: Lauf der Täler | **gesetzt** — Anker eigenes Bild |  |  |  |  |
| a47 | Senke: Meer oder See | see_spiegel | Ebene 0: h < wl → Meer (2), sonst benannter See (1) · Art | gelaende-core.js:670 | — | **folgt** — Höhe K des Knotens gegen den Spiegel |  | **oL** |  | gelesen nur von benannteSeen (:1937) und flussLaeufe (:2038), beide nur in scripts/; die Seen im Spiel legt die Hydrosphäre |
| a48 | talForm | talform | 1,3 (1–2,2): V 1 … Trog 2 · 1 | gelaende-core.js:387 | gelaende-core.js:922 – Querprofil-Exponent b | **gesetzt** — Anker eigenes Bild |  |  |  | reist nie |
| a49 | Auen-Breite F | aue | aue·30·(A/1e6)^0,4 (E0); aue·16·(A/1e5)^0,45 (E1); 3 m (E2); aue 1 · m | gelaende-core.js:920 | gelaende-core.js:1180 – flache Aue im Talboden | **gesetzt** — ∝ A^0,4 benannt (gelaende-core.js:389), Faktoren Anker eigenes Bild |  |  |  |  |
| a50 | Talbreite W | talform | (0,36 ¦ 0,3 ¦ 0,34)·S·(0,85 + 0,3·zufall) · m | gelaende-core.js:921 | gelaende-core.js:1190 – w = u/W: Profil von Sohle zur Hülle | **gesetzt** — Anker eigenes Bild |  |  |  |  |
| a51 | Quergefälle der Aue | aue | 0,006 · m/m | gelaende-core.js:425 | gelaende-core.js:1187 – Aue fällt zur Bahn<br>gelaende-core.js:1189 – Sohle am Auen-Rand | **gesetzt** — Anker eigenes Bild |  |  |  |  |
| a52 | Talgrund-Mittel | relief_hoehe | R = 1,6·S0, Gewicht (1 − d²/R²)² · m | gelaende-core.js:1122 | gelaende-core.js:1142 – Hülle = Talgrund + rel | **gesetzt** — Anker eigenes Bild |  |  | gelaende-core.js:1099 |  |
| a53 | Mäander | fluss_netz | λ 11 Breiten ±30 %, ω 1,2 rad, voll bis 0,4 %, gerade ab 1,5 % Gefälle · 1 | gelaende-core.js:776 | gelaende-core.js:1184 – bahnVersatz: die Aue fällt quer zur Bahn | **gesetzt_anker** — Langbein & Leopold 1966; Leopold & Wolman 1960 (gelaende-core.js:768–770) |  |  |  |  |
| a54 | Mündungs-Höhe | fluss_netz | bed + d·0,05 · m | gelaende-core.js:1248 | gelaende-core.js:653 – kn.aus: Ausfluss des Zuflusses → knotenSohle | **gesetzt** — Anker eigenes Bild |  |  |  |  |
| a55 | Netz trägt bis | fluss_netz | 2,5 × Kante je Ebene · 1 | gelaende-core.js:1859 | gelaende-core.js:1862 – netzStufe: Fern-Maschen lesen nur die groben Ebenen | **folgt** — Nyquist der Masche (Kommentar :1855–1858: 463 636 Knoten, 3,1 s je Bild vorher) | T |  |  |  |

### Relief — Schicht-Gesetz T5 (Treppe)

| id | Name | Größe | Wert · Einheit | Ort | Leser | Urteil — woraus | T | oL | Zwilling | Anmerkung |
|---|---|---|---|---|---|---|---|---|---|---|
| a56 | kliffWinkel | schicht | 74 (60–85) · ° | gelaende-core.js:394 | gelaende-core.js:555 – tc<br>gelaende-core.js:1066 – Kliff der harten Lage | **gesetzt** — Anker eigenes Bild |  |  |  | reist nie |
| a57 | schuttWinkel | sediment | 35 (30–38) · ° | gelaende-core.js:395 | gelaende-core.js:554 – ts<br>gelaende-core.js:1063 – Schutthang | **gesetzt_anker** — Ruhewinkel des Schutthangs (gelaende-core.js:395) |  |  | stamm/vegetation-baum.js:3271 | der Talus der Streu nimmt eine eigene Schwelle (¦∇h¦ > 0,85 ≈ 40°) |
| a58 | pedimentWinkel | schicht | 2,5 (0,5–7) · ° | gelaende-core.js:396 | gelaende-core.js:553 – tp<br>gelaende-core.js:1056 – Pediment-Anstieg | **gesetzt** — Anker eigenes Bild |  |  |  |  |
| a59 | schichtDicke | schicht | 26 (8–60) · m | gelaende-core.js:397 | gelaende-core.js:1043 – schichtMass T | **gesetzt** — Anker eigenes Bild |  |  |  | die Reise setzt def (planet-core.js:2328); der Fels-Stoff liest ihn nicht (Paket 5,5 m) |
| a60 | hartAnteil | schicht | 0,55 (0,3–0,7) · 1 | gelaende-core.js:398 | gelaende-core.js:1044 – hc = Kliff-Höhe je Schicht | **gesetzt_anker** — Monument Valley: de-Chelly-Kliff über Organ-Rock-Schutt, je etwa die Hälfte (gelaende-core.js:1040) |  |  |  |  |
| a61 | Pediment-Länge | schicht | 140 · m | gelaende-core.js:1055 | gelaende-core.js:1056 – Treppe beginnt nach 140 m | **gesetzt** — Anker eigenes Bild |  |  | gelaende-core.js:1071<br>gelaende-core.js:1082<br>gelaende-core.js:927 | Literal 140 viermal, nicht aus EINER Konstante |
| a62 | Bank-Neigung | schicht | tp·0,5 (1,25°) · m/m | gelaende-core.js:1059 | gelaende-core.js:1067 – Bank über dem Kliff | **gesetzt** — Anker eigenes Bild |  |  | gelaende-core.js:1076 |  |
| a63 | Schicht-Periode | schicht | 33,81 horizontal bei def (hs/tan35 + hc/tan74 + T/2) · m | gelaende-core.js:1049 | gelaende-core.js:1060 – Treppe<br>gelaende-core.js:927 – Reichweite der Talprofile<br>gelaende-core.js:2061 – schichtOrt (Linse) | **folgt** — schichtDicke, hartAnteil, Winkel (gerechnet §2) |  |  |  |  |
| a64 | Schicht-Bezug | schicht | Sohle + min(treppe(u), H − Sohle) · m | gelaende-core.js:1200 | gelaende-core.js:1201 – Talprofil × Stil | **folgt** — Treppe ab der Sohle JEDES Segments |  |  |  | jede Talsohle beginnt ihre eigene Stratigraphie: keine Schicht in absoluter Höhe |

### Relief — Detail T3, Tiefsee

| id | Name | Größe | Wert · Einheit | Ort | Leser | Urteil — woraus | T | oL | Zwilling | Anmerkung |
|---|---|---|---|---|---|---|---|---|---|---|
| a65 | detail | relief_amplitude | 0,6 (0–1) · 1 | gelaende-core.js:401 | gelaende-core.js:1878 – Amplitude des Hang-Details | **gesetzt** — Anker eigenes Bild |  |  |  | reist nie |
| a66 | Hang-Detail | relief_wellenlaenge | 0,0263 /m × 2,6 + 0,059 /m × 1,0 (λ 38 m, 17 m); amp = detail·min(3, steil)·glatt(0,05; 0,45; nah), ab steil 0,02 · m | gelaende-core.js:1880 | gelaende-core.js:1880 – addiert auf die Fläche (nur mitDetail) | **gesetzt** — Amplitude < ½ Hang × λ/2π benannt (:1876), Faktoren Anker eigenes Bild |  |  |  |  |
| a67 | Bathymetrie | schelf | ab 1,5 m Tiefe; Maske (d − 3)/6; Abfall −0,6·(d − 4); 0,019·(3 + 0,3s), Rücken 0,026, 0,062 · m | gelaende-core.js:1887 | gelaende-core.js:1895 – Meeresboden | **gesetzt** — Anker eigenes Bild |  |  |  |  |
| a68 | Tiefsee-Klemme | schelf | base − 112, Asymptote base − 120 · m | gelaende-core.js:1898 | gelaende-core.js:1899 – tiefster Boden | **gesetzt_anker** — über dem Chunk-Boden −135 (gelaende-core.js:1897) |  |  |  | gemessen min −16,3 m in 700 Streu-Adressen |

### Relief — 3D-Dichte (Höhle, Kanal, Band)

| id | Name | Größe | Wert · Einheit | Ort | Leser | Urteil — woraus | T | oL | Zwilling | Anmerkung |
|---|---|---|---|---|---|---|---|---|---|---|
| a69 | Höhlen-Decke | hoehle | −24 (Fläche < wl + 1), sonst −16 + 24·hoehlenMund(hang) · m unter Fläche | gelaende-core.js:7191 | gelaende-core.js:7213 – caveCeil: Höhle bleibt unter der Wiese | **gesetzt** — Anker eigenes Bild |  |  |  |  |
| a70 | Höhlen-Mündung | hoehle | Hang 40°…50°, Hub 24 · ° / m | gelaende-core.js:2855 | gelaende-core.js:7191 – hebt die Decke an der Felsflanke | **gesetzt** — Anker eigenes Bild; gemessen 5 · 1 · 14 Mündungen je km² (:2853–2854) |  |  |  |  |
| a71 | Höhlen-Boden | hoehle | base − 28, Rampe 8 · m | gelaende-core.js:7212 | gelaende-core.js:7214 – Hülle der Höhle | **gesetzt** — Anker eigenes Bild |  |  |  |  |
| a72 | Höhlen-Wurm | hoehle | noise3D(0,03; 0,034; 0,03), Grat > 0,7, Tiefe 36 · /m, m | gelaende-core.js:7216 | gelaende-core.js:7218 – d −= …·36 | **gesetzt** — Anker eigenes Bild |  |  |  |  |
| a73 | Kaverne | hoehle | noise3D(0,013; 0,018), > 0,55, Tiefe 46 · /m, m | gelaende-core.js:7219 | gelaende-core.js:7221 – d −= …·46 | **gesetzt** — Anker eigenes Bild |  |  |  |  |
| a74 | Halle | hoehle | noise3D(0,0045; 0,006), > 0,5, Tiefe 72 · /m, m | gelaende-core.js:7222 | gelaende-core.js:7224 – d −= …·72 | **gesetzt** — Anker eigenes Bild |  |  |  |  |
| a75 | Band des Dichte-Gitters | hoehen_band | oben surf + 12 + 4·step; unten min(surf, base) − 40 · m | gelaende-core.js:2656 | gelaende-core.js:7246 – Luft darüber<br>gelaende-core.js:7247 – Fels darunter | **folgt** — größte 3D-Rauheit + 4 Zellen; Höhlen-Band endet base − 28 (:2651–2653) | T |  | gelaende-core.js:2659 |  |
| a76 | Gewässer-Schnitt in der Dichte | fluss_tiefe | flussKanal / seeBecken über surf · m | gelaende-core.js:7201 | gelaende-core.js:7227 – gewaesserForm schneidet Bett und Becken | **folgt** — Hydrosphäre über der Relief-Fläche |  |  |  | zählt der Wasser-Zensus; liest das Relief (surf :7186) |

### Relief — Ort-Gesetz (Relief-Teil), Plan, Reise

| id | Name | Größe | Wert · Einheit | Ort | Leser | Urteil — woraus | T | oL | Zwilling | Anmerkung |
|---|---|---|---|---|---|---|---|---|---|---|
| a77 | Kühlung je Meter | temperatur_hoehengradient | 18 / ((140 + 185)/2) = 0,1108 · K/m | gelaende-core.js:5850 | gelaende-core.js:1334 – Kühlung = k·(y − wl) aus der Relief-Höhe<br>planet-core.js:2307 – Stauchung des Planeten | **folgt** — Sommer-Mittel 18 °C (:1313) auf die Mitte der Schneegrenze (:1282) |  |  |  | 17× die Erde (0,0065 K/m); zählt der Klima-Zensus, steht hier als Leser der Höhe |
| a78 | Höhen-Stauchung Planet | hoehen_stauchung | 0,0065 / 0,1108 = 0,0587 (1 Welt-m = 17,04 Planet-m) · 1 | planet-core.js:2307 | planet-core.js:2331 – Meer-Δ der Reise<br>planet-core.js:2348 – Leit-Stützen huelleM (ohne Leser) | **folgt** — Erde-Gradient 0,0065 K/m gegen kuehlungKJeM |  |  |  |  |
| a79 | Meer der Reise | meeresspiegel | 3 − Δ waterLevelM · m | gelaende-core.js:5910 | stamm/bild-himmel.js:485 – waterLevel der Reise-Welt | **folgt** — Planet-Δ (planet-core.js:2331) |  |  |  |  |
| a80 | Regler-Δ → Erbgut des Orts | landform | Heimat-Regler + Δ, je Regler auf [min, max] · 1 | gelaende-core.js:5951 | stamm/netz-portal.js:704 – Geburt der Reise-Welt schreibt gesetz.gelaende<br>stamm/gelaende-boden.js:1573 – ortSaatWahl | **folgt** — LANDFORM_REGLER + reglerDelta (:5923) |  |  |  |  |
| a81 | Planet → Regler | landform | land(kont), hoehe 0,6 + st, rauhLambda, trog, ks 3 + 12·konv, tafel; kontinentLambda, schichtDicke, hartAnteil = def · 1 | planet-core.js:2320 | voxel-worker.js:1204 – reicht wildnis an den Stamm<br>stamm/netz-portal.js:704 – ortErbgut | **folgt** — Kontinentalität, Steile, Konvergenz, Randabstand des Planeten |  |  |  | netzDichte, talForm, aue, theta, Winkel, rinnen, detail reisen nie |
| a82 | Leit-Stützen 9×9 | relief_hoehe | huelleM, landC über 64 km, Kante 8000 m · m | planet-core.js:2348 | — | **folgt** — Planet-Höhe × Stauchung gegen den Anker |  | **oL** |  | der Faden reicht nur klima/meer/wetter/wuchs/wildnis (voxel-worker.js:1194–1204); Leser nur scripts/diag-planet.cjs |
| a83 | Vulkan und Rand des Ortes | vulkan | art, abstandKm, alterMa; rand · km / Ma | planet-core.js:2351 | — | **folgt** — Platten des Planeten |  | **oL** |  | fällt im Faden weg (voxel-worker.js:1184–1205) |
| a84 | Plan-Normalform | samen | Saat 1–64 Zeichen; jeder Regler def oder geklemmt · Text / 1 | gelaende-core.js:5962 | stamm/speicher-laden.js:1972 – worldMeta.gesetz.gelaende = planErbgut(plan) | **folgt** — LANDFORM_REGLER (:5968–5973) |  |  |  |  |
| a85 | Erbgut der Welt | landform | worldMeta.gesetz.gelaende → erbgutNormal · Terme | stamm/gelaende-boden.js:1338 | stamm/gelaende-boden.js:780 – L.erbgut jeder Höhe | **folgt** — Gesetz der Welt (_weltGesetz) |  |  |  |  |
| a86 | Plan-Version | landform | 1 · Version | gelaende-core.js:5675 | gelaende-core.js:5961 – lehnt fremde Versionen ab | **gesetzt** — Vertrag | T |  |  |  |
| a87 | Landung der Reise | landung | Ring 12…240, ≥ wl + 1,5, Reihe 16 Saaten · m | gelaende-core.js:5790 | gelaende-core.js:5823 – ortSaatWahl<br>stamm/gelaende-boden.js:1573 – Saat der Reise-Welt | **gesetzt** — Anker eigenes Bild |  |  |  |  |
| a88 | terrainSteepness | relief_amplitude | 1,0 (DSL 0,1–2,0) · 1 | stamm/dirigent-kern.js:282 | stamm/feld-leben.js:479 – Licht-Flachheit terrainFlatten | **gesetzt** — Start-Zustand; DSL-Op terrain_steepness klemmt 0,1–2,0 (stamm/feld-dsl.js:967) |  |  |  | heißt Relief, ändert kein Relief: das Gesetz liest es seit K16 nicht (stamm/gelaende-chunks.js:1323) |

### Gestein — Art, Freilegung, Fels-Stoff

| id | Name | Größe | Wert · Einheit | Ort | Leser | Urteil — woraus | T | oL | Zwilling | Anmerkung |
|---|---|---|---|---|---|---|---|---|---|---|
| a89 | Stein-Achse (Welt-Feld dichte) | gestein_art | λ 340, Warp ±40 / λ 600 · m | stamm/feld-leben.js:2973 | stamm/vegetation-wiese.js:2371 – Material-Wahl stein<br>voxel-worker.js:3335 – Flechte auf Stein | **gesetzt** — Erst-Wurf aus genese-plan §Γ3 (stamm/feld-leben.js:2971) |  |  | voxel-worker.js:2019 | liest kein Relief und kein Schicht-Gesetz |
| a90 | Glut-Achse → Basalt | gestein_art | λ 520; Basalt-Mix glatt(0,48; 1,02)·0,65 · m / 1 | stamm/feld-leben.js:2974 | stamm/gelaende-boden.js:2596 – Basalt in der Boden-Farbe<br>voxel-worker.js:3337 – Basalt im Faden | **gesetzt** — Erst-Wurf genese-plan §Γ3 |  |  | voxel-worker.js:2020<br>voxel-worker.js:3337 |  |
| a91 | Material-Wahl | gestein_art | dominante Achse erde/stein/glut/quarz; erde + feuchte·0,35 · Art | stamm/vegetation-wiese.js:2362 | stamm/kampf.js:2407 – Graben: welcher Stoff fällt<br>stamm/gelaende-kollision.js:1133 – Boden-Stoff am Fuß<br>stamm/koerper-bewegung.js:756 – Stoff unter dem Schritt<br>stamm/koerper-fahrt.js:1835 – Grund unter dem Fahrzeug | **folgt** — Welt-Feld (stamm/feld-leben.js:1793) + Feuchte (FEUCHTE.erdeGewicht) |  |  |  |  |
| a92 | Strata: Stein unter | boden_tiefe | 12 · m unter Fläche | stamm/vegetation-wiese.js:3198 | stamm/vegetation-wiese.js:2386 – tiefer als 12 m ist alles stein | **gesetzt** — Anker eigenes Bild |  |  |  |  |
| a93 | Eisen-Adern | gestein_art | ab 24 m Tiefe, Ader > 0,7, dichte > 0,4, λ 180 m · m / 1 | stamm/vegetation-wiese.js:3203 | stamm/vegetation-wiese.js:2391 – stein → eisen | **gesetzt** — Erst-Wurf 0,7 → ~5–10 % der tiefen Stein-Region (Kommentar) |  |  |  |  |
| a94 | Fels-Freilegung rockLo/rockHi | gestein_art | 1 − n_y 0,42 (54,5°) … 0,7 (72,5°) · 1 | stamm/daten.js:624 | gelaende-core.js:5426 – Fels-Gewicht je Vertex (felsStoff)<br>stamm/stoff-material.js:3014 – Fels im Shader | **gesetzt** — Anker eigenes Bild |  |  | stamm/vegetation-baum.js:3269<br>stamm/gelaende-boden.js:726 | drei Schwellen für „Fels steht frei": 55…73° (Normale), ¦∇h¦ 0,7 (35°), ¦∇h¦ 0,75…1,45 (37…55°) |
| a95 | Schutt-Schwellen | sediment | Kandidat 0,08, Gitter 5,4 m, Gewicht 0,85 · 1 / m | stamm/daten.js:631 | stamm/gelaende-boden.js:3016 – Fels-Stoff<br>stamm/gelaende-chunks.js:420 – geoSchutt → voxel-worker.js:4222 Schutt der Ferne | **gesetzt** — Anker eigenes Bild |  |  |  |  |
| a96 | Schutt aus dem Relief | sediment | 1 am Schutthang, 2 m Fuß, 1 m in die Wand · 1 | gelaende-core.js:1085 | gelaende-core.js:5385 – felsStoff liest aus.schutt<br>voxel-worker.js:4218 – Schutt der Ferne | **folgt** — Schicht-Gesetz (Abschnitt Schutthang der Treppe) |  |  |  |  |
| a97 | Bankung des Fels-Stoffs | gestein_art | Einfallen 0,07 rad, Streichen 0,6 rad, Paket 5,5 m, Bank 0,9 m × [0,35; 2,2], Kluft 3,2 m · m / rad | gelaende-core.js:3349 | gelaende-core.js:5455 – felsStoff ruft felsFarbe je Vertex (Bänke, Fugen, Klüfte)<br>gelaende-core.js:3696 – felsFeinO im Shader-Pfad<br>stamm/gelaende-boden.js:2491 – Fels-Farbe je Vertex<br>voxel-worker.js:3879 – Fels-Farbe im Faden | **gesetzt** — Nachbesserung K17 „las sich als Ziegelmauer" (:3352–3353): Anker eigenes Bild |  |  |  | liest schichtDicke 26 m des Reliefs nicht |
| a98 | Grundton und Korn | gestein_art | grundMax 0,22, korn 0,12 · 1 | gelaende-core.js:3385 | gelaende-core.js:3424 – felsBasis kappt den Grundton der Palette | **gesetzt** — Natur-Band ≤ 0,30 benannt (:3385) |  |  |  |  |
| a99 | Geröll | sediment | korn 0,7, Größe 0,45…1,45 · m | gelaende-core.js:3409 | voxel-worker.js:4228 – schuttMittel<br>stamm/stoff-material.js:3078 – schuttMittel | **gesetzt** — Anker eigenes Bild |  |  |  |  |
| a100 | Fels fein / fern | gestein_art | fern 120…260, Fuge 30…80 · m | gelaende-core.js:3402 | stamm/stoff-material.js:3057 – felsFein im Shader | **gesetzt** — Distanz-Auslauf | T |  |  |  |
| a101 | Rausch-Gitter des Fels | gestein_art | P 256, schräg 12…42, skala 0,982 · 1 | gelaende-core.js:3439 | gelaende-core.js:3443 – rauschGitter<br>gelaende-core.js:3478 – rauschRaum: Korn und Fugen des Fels | **gesetzt** — Periode 256 wie vendor | T |  |  |  |
| a102 | Himmels-Sicht | hoehle | 3 · m | gelaende-core.js:4309 | gelaende-core.js:4315 – Dunkel der Höhle im Fels | **gesetzt** — Anker eigenes Bild |  |  |  |  |
| a103 | Rock-Exposure | gestein_art | glatt(0,75; 1,45; ¦∇h¦) · 1 | stamm/gelaende-boden.js:719 | — | **gesetzt** — Anker eigenes Bild |  | **oL** |  | Leser nur scripts/playtest/gelaende-boden.cjs:1444, scripts/diag-worker-dichte.cjs:320 |
| a104 | Fels-Geologie der Streu | gestein_art | Findling ≤ 0,45, Aufschluss > 0,7 und relH > 18 m, Talus > 0,85 (¦∇h¦) · 1 / m | stamm/vegetation-baum.js:3267 | stamm/vegetation-baum.js:1694 – Form und Größe der Felsen | **gesetzt** — umgerechnet aus einer Vorlage (sl > 0,155, Kommentar :3269) |  |  | stamm/daten.js:624<br>gelaende-core.js:395<br>stamm/vegetation-baum.js:3271 | relH über Basis 0: fast jede steile Stelle ist „Aufschluss" |
| a105 | Mulde | mulde | Gitter 3,6, Tiefe 0,2, Gefälle 0,05…0,14, bis LOD 1; memo 262 144 · m | gelaende-core.js:5473 | voxel-worker.js:3971 – muldeEcken je Chunk<br>stamm/gelaende-boden.js:2515 – muldeEcken im Stamm | **gesetzt** — Anker eigenes Bild |  |  |  |  |

### Boden — Mikro-Relief, Farbe, Stufen

| id | Name | Größe | Wert · Einheit | Ort | Leser | Urteil — woraus | T | oL | Zwilling | Anmerkung |
|---|---|---|---|---|---|---|---|---|---|---|
| a106 | Mikro-Relief | mikro_relief | freq 1,1 / 2,7 je m; Kippung 0,24 / 0,1 · 1/m / 1 | stamm/daten.js:654 | stamm/stoff-material.js:2554 – Bump des Boden-Stoffs<br>stamm/siedlung-wege.js:1510 – Kiesel der Wege | **gesetzt** — Anker eigenes Bild (13° statt 23°, :681) |  |  |  |  |
| a107 | Mikro-Relief Distanz | mikro_relief | Bump 14…95, Korn 30…160 · m | stamm/daten.js:685 | stamm/stoff-material.js:2674 – Auslauf des Bump | **gesetzt** — Anker eigenes Bild | T |  |  |  |
| a108 | Flechte | boden_art | feuchte 0,5…0,9 × dichte 0,5…0,85 × 0,22 · 1 | stamm/gelaende-boden.js:3205 | stamm/gelaende-boden.js:2590 – Patina auf Stein | **gesetzt** — Anker eigenes Bild |  |  | voxel-worker.js:3335 |  |
| a109 | Feuchte → Erde | boden_art | 0,35 · 1 | stamm/gelaende-boden.js:3226 | stamm/vegetation-wiese.js:2370 – Ufer graben als Erde | **gesetzt** — Γ1-Lesart Boden |  |  |  |  |
| a110 | Wiesen-Wache | boden_art | 0,04 · 1 | stamm/daten.js:635 | stamm/gelaende-boden.js:1729 – Grün-Kanal der Boden-Karte<br>stamm/gelaende-chunks.js:408 – an den Faden | **gesetzt** — Anker eigenes Bild |  |  |  |  |
| a111 | Boden-Karte Teilung | boden_art | 4 (LOD 0: 0,45 m) · Teilung | stamm/daten.js:464 | stamm/gelaende-boden.js:28 – _bodenSichtAt: der gezeichnete Boden<br>stamm/gelaende-chunks.js:407 – an den Faden | **gesetzt** — ≤ 2 cm Median zur Dreiecks-Fläche (:461–462) | T |  |  | Stand, Wiese, Streu lesen das Mesh, nicht das Gesetz: Zwilling der Höhe mit gemessener Abweichung |
| a112 | Boden-Stufen | boden_art | bis 36 / 100 / 388,8 / ∞; Saum 12 / 12 / 40 / 0; vorlauf 3, halt 4 · m | stamm/gelaende-boden.js:3191 | stamm/gelaende-boden.js:2765 – LOD je Chunk<br>stamm/stoff-material.js:2035 – Stufen im Stoff<br>stamm/vegetation-streu.js:861 – Streu je Stufe | **gesetzt** — Anker eigenes Bild | T |  |  |  |
| a113 | Boden-Generation | boden_art | 2 · Version | gelaende-core.js:2860 | stamm/gelaende-boden.js:3033 – Cache-Stempel<br>stamm/speicher-welten.js:1082 – Stempel der Welt | **gesetzt** — Vertrag | T |  |  |  |
| a114 | Gen-Version | boden_art | 9 (≥ 2 Feuchte, ≥ 3 Frequenz-Fächer) · Version | stamm/speicher-laden.js:2706 | stamm/vegetation-wiese.js:2368 – Feuchte in der Material-Wahl<br>stamm/feld-leben.js:1815 – λ je Achse | **gesetzt** — Vertrag | T |  |  |  |

### Technik — Chunks, Caches

| id | Name | Größe | Wert · Einheit | Ort | Leser | Urteil — woraus | T | oL | Zwilling | Anmerkung |
|---|---|---|---|---|---|---|---|---|---|---|
| a115 | Chunk-Kante | kachel | 43,2 · m | stamm/gelaende-boden.js:2740 | stamm/gelaende-boden.js:22 – Chunk des Boden-Lesers<br>voxel-worker.js:1637 – Edit-Karte je Chunk | **gesetzt** — 24 × 1,8 m | T |  | voxel-worker.js:1991 |  |
| a116 | LOD-Schritte | kachel | 1,8 / 3,6 / 7,2 / 14,4 · m | stamm/gelaende-boden.js:2727 | voxel-worker.js:1652 – Gitter-Schritt der Dichte | **gesetzt** — Halbierung je Stufe | T |  | voxel-worker.js:1988 |  |
| a117 | Sicht-Ring | kachel | 4 (1–12) · Chunks | stamm/gelaende-boden.js:2716 | stamm/gelaende-boden.js:2720 – ringRadius | **gesetzt** — Regler | T |  |  |  |
| a118 | Netze im Speicher | cache | ≤ 6 · Netze | gelaende-core.js:537 | gelaende-core.js:535 – netzNeu: ein Netz je Saat, Basis, Meer, Regler | **gesetzt** — Grenze | T |  |  |  |
| a119 | Knoten-Maps | cache | unbegrenzt (nie geräumt) · Knoten | gelaende-core.js:546 | gelaende-core.js:608 – knoten: M.get(key), sonst neu<br>gelaende-core.js:684 – knotenA rekursiv über das Einzugsgebiet | **gesetzt** — keine Räumung | T |  |  | gemessen ~430 KB und ~1,4 ms je neue Region; 10 000 Streu-Adressen → OOM 2 044 MB |
| a120 | Zellen- und Tal-Maps | cache | Räumung über 300 000 · Einträge | gelaende-core.js:1011 | gelaende-core.js:1150 – zelle in der Fläche | **gesetzt** — Grenze | T |  | gelaende-core.js:1112 |  |
| a121 | Spalten-Plätze | cache | 4096 · Plätze | stamm/gelaende-boden.js:3173 | stamm/gelaende-boden.js:1394 – Hash der Spalte | **gesetzt** — Zweierpotenz | T |  |  |  |
| a122 | Chunk-Speicher IDB | cache | 600 · Chunks | stamm/gelaende-chunks.js:3415 | stamm/gelaende-chunks.js:873 – Grenze des Speichers | **gesetzt** — Grenze | T |  |  |  |

### Mechanik — Erdbau und Edit

| id | Name | Größe | Wert · Einheit | Ort | Leser | Urteil — woraus | T | oL | Zwilling | Anmerkung |
|---|---|---|---|---|---|---|---|---|---|---|
| a123 | Erdbau | erdbau | böschung 0,6, reichweite 16, zelle 16, wand 0,5 · m/m / m | gelaende-core.js:2094 | gelaende-core.js:2825 – erdbauY: letzter Term jeder Höhe | **gesetzt** — Anker eigenes Bild |  |  |  |  |
| a124 | Edit-Form | edit | tiefe 4, rund 1, kante 0,5 · m | gelaende-core.js:2546 | gelaende-core.js:2606 – mitEdits: editForm formt die Dichte (Graben/Füllen)<br>gelaende-core.js:2560 – editReich: Reichweite des Edits | **gesetzt** — Anker eigenes Bild |  |  |  |  |

## §2 gerechnet / gemessen

**Aufruf** (nur lesen; lädt `gelaende-core.js` und `vendor/simplex-noise.js` aus /home/user/AnazhRealm, Lage = Heimat: Saat anazh-realm-seed, Basis 0, Meer −3, Erbgut [wildnis] def, Kachel 2048, Ort null):

```
cd /home/user/zensus-planet/vision/planet/zensus && node --expose-gc --max-old-space-size=6000 a-mess.cjs   # 7,6 s
```

**1 — nah ↔ fern** (je 10 000 Adressen, jede einzeln `G.hoehe(L, x, z, true)`, hrtime je Ruf; heapUsed nach zweifachem gc):

| Lauf | Median µs | p95 µs | max µs | Δ heap KB | Knoten [E0, E1, E2] nachher | Höhe min…max (Mittel) m |
|---|---|---|---|---|---|---|
| nah kalt ±1 km um (0, 0) | 1,47 | 4,75 | 10 429 | +1 683 | [277, 528, 920] | 13,97…135,64 (51,2) |
| nah warm, dieselben | 1,15 | 3,95 | 245 | +20 | unverändert | — |
| fern kalt ±1 km um (1000 km, 0) | 1,46 | 7,41 | 4 330 | +1 509 | [570, 1143, 1779] | 13,53…135,43 (37,2) |
| fern warm, dieselben | 1,36 | 5,03 | 231 | −25 | unverändert | — |

Frühere Läufe desselben Skripts: nah kalt Median 1,22 und 1,62 µs, fern kalt 1,28 µs (p95 3,93–5,51). Land-Anteil nah und fern 1,000.

**2 — Sack oder Funktion** (Adressen gestreut über 2000 × 2000 km, jede in neuem Gelände; Wellen zu 100, weil 10 000 auf einmal nach 31 s mit „FATAL ERROR: Ineffective mark-compacts near heap limit — JavaScript heap out of memory" bei 2 044 MB abbrachen):

| Welle | ms je Adresse Median / p95 | KB je Adresse | Knoten je Adresse [E0, E1, E2] | heapUsed gesamt MB |
|---|---|---|---|---|
| 1 | 1,28 / 5,0 | 440 | [262, 371, 105] | 51 |
| 2 | 1,29 / 5,1 | 429 | [247, 360, 106] | 93 |
| 3 | 1,34 / 5,5 | 433 | [252, 367, 106] | 135 |
| 4 | 1,45 / 6,5 | 445 | [250, 377, 110] | 179 |
| 5 | 1,34 / 5,9 | 403 | [249, 367, 112] | 218 |
| 6 | 1,50 / 7,0 | 454 | [240, 359, 104] | 262 |
| zweite Saat „zensus-zweite-saat" | 1,36 / 7,3 | 438 | [259, 365, 110] | 317 |

Höhen der 700 Streu-Adressen −16,31 … 190,02 m, Land-Anteil je Welle 0,96–1,00. **Gang** 100 km (x 2000 → 2100 km, Schritt 43,2 m, 2 315 Spalten): Median 3,04 µs, p95 112,65 µs, max 11,4 ms; bleibt 126 KB je km, Knoten je km [14, 57, 109], 0,9 ms je km. Kein Wert wird je frei: der Speicher folgt der besuchten Fläche, nicht dem Schirm.

**3 — Rausch-Periode** (vendor/simplex-noise.js:54 `this.perm[i] = this.p[i & 255]`, :118 `ii = i & 255`): `noise2D(a, b)` gegen `noise2D(a + d, b + d)` mit d = 256/√3 = 147,8017 über 2 000 Punkte: max |Δ| = 4,4e−13 (exakt periodisch); nur in x versetzt max |Δ| = 1,70 (nicht periodisch). Diagonale Periode d/f je Oktave des Reliefs:

| Oktave | f (1/m) | Periode km |
|---|---|---|
| Kontinent C (gelaende-core.js:573) | 1/9000 | 1 330,22 |
| Kontinent C2 | 2,7/9000 | 492,67 |
| Erosion E (gelaende-core.js:576) | 1/3200 | 472,97 |
| Erosion E2 | 2,3/3200 | 205,64 |
| Tafel-Stil (gelaende-core.js:591) | 0,000192 | 769,80 |
| Warp (gelaende-core.js:1265) | 0,00026 | 568,47 |
| Hang-Detail (gelaende-core.js:1880) | 0,0263 / 0,059 | 5,62 / 2,51 |
| Tiefsee (gelaende-core.js:1891) | 0,019 | 7,78 |
| Höhlen-Wurm / Halle (gelaende-core.js:7216, :7222) | 0,03 / 0,0045 | 4,93 / 32,84 |

**4 — Float32** (Boden-Vertices reisen absolut, voxel-worker.js:3939): ULP bei 400 m 3,05e−5 · 10 km 9,8e−4 · 100 km 0,0078 · 524 288 m 0,0625 · 1 000 km 0,0625 · 1 048 576 m und 2 000 km 0,125 m.

**5 — Schlüssel-Grenzen** (gerechnet): Edit-Karte 32 768 × 43,2 = 1 415 577,6 m, und gemessen `editKarteSchluessel(0, 32768) === editKarteSchluessel(1, −32768)` → true (gelaende-core.js:7276) · Erdbau-Zelle 32 768 × 16 = 524 288 m (gelaende-core.js:2129) · Bahn-Gitter 65 535 × 16 = 1 048 560 m (gelaende-core.js:319) · Grundriss 32 768 × 32 = 1 048 576 m (stamm/vegetation-baum.js:3288) · Knoten 2^25 × 100/1,8 = 1,86e9 m (gelaende-core.js:607, harmlos) · Term-Klemme 1e5 m (gelaende-core.js:114). Die Chunk-Maps des Stamms (stamm/gelaende-chunks.js:742) und die Hydro-Kachel (gelaende-core.js:29) schlüsseln als Text: unbegrenzt.

**6 — abgeleitet** (a-mess.cjs §6 und /tmp/claude-0/zensus-a/rechne.cjs):

- Kühlung 18 / ((140 + 185)/2) = 0,110769 K/m (gelaende-core.js:5850) = 17,04 × Erde (0,0065); Stauchung des Planeten sv = 0,058681, 1 Welt-m = 17,04 Planet-m (planet-core.js:2307).
- Schicht-Periode bei def: hs/tan 35° + hc/tan 74° + T/2 = 33,81 m horizontal je 26 m Höhe (gelaende-core.js:1049); Bank-Neigung atan(tan 2,5° · 0,5) = 1,3°.
- Deckel-Asymptote 255 + 12 = 267 m (gelaende-core.js:1883), Tiefsee-Asymptote base − 112 − 8 = −120 m (gelaende-core.js:1899); Band oben −135 + 232 × 1,8 = 282,6 m.
- Schwellen „Fels steht frei" in Grad: rockLo/rockHi (1 − n_y) 54,5° / 72,5° (stamm/daten.js:624) · Aufschluss |∇h| 0,7 = 35,0°, Talus 0,85 = 40,4°, Findling 0,45 = 24,2° (stamm/vegetation-baum.js:3268) · Rock-Exposure 0,75…1,45 = 36,9°…55,4° (stamm/gelaende-boden.js:726) · Schutthang des Gesetzes 35° (gelaende-core.js:395).
- Wellenlängen: Stil 1/0,000192 = 5 208 m, Warp 1/0,00026 = 3 846 m, Detail 38,0 / 16,9 m.
- Literal „anazh-realm-seed": `grep -c` über stamm/*.js, voxel-worker.js, gelaende-core.js → 47 in 20 Dateien.

## §3 Funde

**F1 — Sack in der Fläche (Gebot 7).** `netzNeu` legt je Ebene eine Knoten-Map an (gelaende-core.js:546), die nie geräumt wird; nur ganze Netze fallen ab 6 (gelaende-core.js:537), Zellen und Täler ab 300 000 (gelaende-core.js:1011, :1112). `knotenA` rekursiert über das ganze Einzugsgebiet (gelaende-core.js:676), `knotenSohle` läuft den Pfad bis ins Meer (gelaende-core.js:691): eine kalte Adresse baut ~250/365/107 Knoten und hält ~430 KB. Kosten folgen der besuchten Fläche, nicht Schirm + Änderung — ein Flug über 2000 km Welt endet im OOM.

**F2 — Die Welt wiederholt sich.** Vendor-Simplex mit 256er-Permutation (vendor/simplex-noise.js:54, :118): jede Oktave ist diagonal periodisch; der Kontinent kehrt nach 1 330 km wieder, das Hang-Detail nach 5,6 km, der Höhlen-Wurm nach 4,9 km. Unbegrenzt ist die Koordinate, nicht das Gesicht.

**F3 — Feste Weltgrößen** (alles darüber schweigt oder kollidiert): Bühnen-Terme ±100 km (gelaende-core.js:114, :129, :140, :171, :223) · Erdbau ±524 km (gelaende-core.js:2129, :2211) · Bahn ±1048 km (gelaende-core.js:319) · Grundriss ±1048 km (stamm/vegetation-baum.js:3288) · Edit-Karte ±1416 km (gelaende-core.js:7276; stamm/gelaende-boden.js:1011, :1471) · Float32-Vertex 6,25 cm ab 524 km (voxel-worker.js:3939) · vertikal −135…+282,6 m (stamm/gelaende-boden.js:2740).

**F4 — Zwillinge.**

- Meer-Fallback mit drei Werten: base + 4 (gelaende-core.js:520, :7190), base − 3 (gelaende-core.js:1292, :1327), 0 (stamm/gelaende-chunks.js:370, :716; stamm/gelaende-boden.js:379) — fail-soft, je Leser ein anderes Meer.
- Grund doppelt: `GRUND` (gelaende-core.js:5679) und `LAGE_GRUND` (gelaende-core.js:2736) tragen Saat, Basis, Meer, Kachel je eigens; Basis 0 ein drittes Mal als `terrainBaseHeight: 0.0` (stamm/dirigent-kern.js:283).
- Saat-Literal „anazh-realm-seed" 47× in 20 Dateien als Fallback (z. B. stamm/gelaende-boden.js:761, voxel-worker.js:1404, :1513).
- Chunk-Gestalt im Faden „Mirror" (voxel-worker.js:1983–1991) gegen den Stamm (stamm/gelaende-boden.js:2712–2740).
- Welt-Feld λ und Warp (stamm/feld-leben.js:2970) hart im Faden (voxel-worker.js:2018–2024); Flechte (stamm/gelaende-boden.js:3205) und Basalt 0,48/1,02/0,65 (stamm/gelaende-boden.js:2596) hart im Faden (voxel-worker.js:3335, :3337).
- „Fels steht frei" viermal verschieden: 54,5…72,5° Normale (stamm/daten.js:624), |∇h| > 0,7 = 35° (stamm/vegetation-baum.js:3269), 36,9…55,4° (stamm/gelaende-boden.js:726), Talus > 40,4° (stamm/vegetation-baum.js:3271) gegen den Schutthang des Gesetzes 35° (gelaende-core.js:395) — die Streu liest weder `aus.schutt` noch `aus.hang` des Kerns.
- Pediment-Länge 140 viermal als Literal (gelaende-core.js:927, :1055, :1071, :1082); Bank-Neigung `tp · 0,5` zweimal (gelaende-core.js:1059, :1076).
- Der Boden der Füße ist das Mesh, nicht das Gesetz: `_bodenSichtAt` liest die Boden-Karte des Chunks (stamm/gelaende-boden.js:19) — gewollt, Abweichung ≤ 2 cm Median benannt (stamm/daten.js:462).

**F5 — Ohne Leser im Spielpfad.** `_rockExposureAt` (stamm/gelaende-boden.js:719; nur scripts/playtest/gelaende-boden.cjs:1444, scripts/diag-worker-dichte.cjs:320) · Leit-Stützen 9×9 `huelleM`/`landC` (planet-core.js:2348) sowie `vulkan` und `rand` (planet-core.js:2351): der Faden reicht nur klima/meer/wetter/wuchs/wildnis weiter (voxel-worker.js:1184–1205) · die Senke Meer/benannter See (gelaende-core.js:670): gelesen nur von `benannteSeen` (gelaende-core.js:1937) und `flussLaeufe` (gelaende-core.js:2038), beide nur in scripts/ · die Linsen-Funktionen `hangOrt` (gelaende-core.js:2755) und `schichtOrt` (gelaende-core.js:2058) lesen nur scripts/. Fast leer: `terrainSteepness` (stamm/feld-dsl.js:967) heißt Relief und ändert nur das Licht (stamm/feld-leben.js:479; stamm/gelaende-chunks.js:1323).

**F6 — Karte ≠ Code.**

- Der Kommentar des Bands sagt „Gipfel ~+247 m, Tiefsee bis ~−144 m" (stamm/gelaende-boden.js:2724); gemessen max 190,0 m über 700 Streu-Adressen, die Tiefsee hält bei −120 m (gelaende-core.js:1899).
- Der Fels-Stoff sagt „flach lagernd wie die Tafelberge des Schicht-Gesetzes" (gelaende-core.js:3350) — er liest aber weder `schichtDicke` 26 m (Paket 5,5 m, Bank 0,9 m, gelaende-core.js:3355) noch eine absolute Lage: die Treppe beginnt an der Sohle JEDES Talsegments (gelaende-core.js:1200), dieselbe harte Schicht steht in jedem Tal auf anderer Höhe.
- Das Gestein, das gegraben wird, kennt das Relief nicht: `_terrainMaterialAt` wählt aus einem 2D-Rauschfeld λ 340 m (stamm/vegetation-wiese.js:2362, stamm/feld-leben.js:1793), nicht aus Kliff, Schutt oder Schicht; nur die Tiefe > 12 m macht Stein (stamm/vegetation-wiese.js:2386).
- Die Reise bewegt 6 von 18 Reglern (planet-core.js:2320–2330); kontinentLambda, schichtDicke, hartAnteil stehen dort fest auf def, und netzDichte, talForm, aue, theta, Kliff-, Schutt-, Pediment-Winkel, rinnen, detail sind auf jedem Planeten-Ort die der Heimat.
- Der Talgrund-Fallback addiert die Basis doppelt: `N.base + grossform(N, x, z).K` mit `K = N.base + …` (gelaende-core.js:1136, :598) — bei Basis ≠ 0 (DSL −50…50, stamm/feld-dsl.js:970) eine falsche Höhe.
- „Meer" ist in der Heimat fast nicht da: land 0,35 (gelaende-core.js:381) gibt gemessen 96–100 % Land je Welle; Bathymetrie (gelaende-core.js:1887) und −120-Klemme (gelaende-core.js:1899) erreicht keine der 700 Streu-Adressen (min −16,3 m).

**F7 — Fremde Leser des Reliefs** (gezählt von Wasser, Klima, Biom; hier nur benannt, weil sie die Höhe lesen): Hydrosphäre `hydroInit` liest `hoehe` je Zelle (gelaende-core.js:6194) · Schnee über y − wl (gelaende-core.js:1290) · Temperatur −0,1108 K je m über dem Meer (gelaende-core.js:1334) · Wind-Lee aus der Höhe (gelaende-core.js:2781 → stamm/stoff-material.js:285) · Ort-Kontext des Fadens (gelaende-core.js:2720 → voxel-worker.js:939) · Mulden (gelaende-core.js:5482 → voxel-worker.js:3971) · Dichte-Kanal und See-Becken über der Fläche (gelaende-core.js:7201).

**Ehrlich offen:** WGSL/TSL-Funktionen des Halms und das Mikro-Relief im Shader sind nur mit ihren Welt-Größen gezählt (TERRAIN_BUMP, FELS fein, rockLo/rockHi), nicht Knoten für Knoten; der 18-fache Leser-Fächer von `_terrainMacroSurfaceY` ist mit drei Beispielen belegt, nicht einzeln je Wirkung verfolgt.
