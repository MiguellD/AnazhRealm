# Stand-Blatt boden-korn (Sprosse karte2.planet.relief.boden#2)

## 27.11. 12:06 UTC — WIP 1 (Informieren)

- Täter-Zahl: die Station S2 der Leiter Boden (Zweig `punkte-maschine`, ihr `aus[2]`) trägt ein festes „nicht: keine Korngröße in der Welt“ — Rang vorher: keiner
  (kein Korn-Feld; `stamm/vegetation-wiese.js:2620 _terrainMaterialAt` nennt Stoff erde|stein|glut|quarz, kein Korn).
- Wurzel gelesen: `gelaende-core.js:1228 flaeche` wählt je Spalte das Talprofil (Segment, Aue/Hang/Schutt) — dort liegt die Herkunft
  (Segment-Knoten, A, Gefälle); `segmentNeu:996` trägt A und Sohle.
- Plan: EIN Korn-Feld im Kern (`korn(L,x,z)`: Hang-Schutt nach Steile, Aue stromab Sternberg, Wind-Sortierung), Leser
  `_terrainMaterialAt` (Stoff der Sohle) und das Boden-Material (Korn-Maßstab, Rauheit) bei der Geburt der Kachel.
- Status: ZWISCHENSTAND · Karte 2 gebucht 149 von 1 718.

## 27.11. 13:04 UTC — WIP 2 (Schnitt steht im Kern, Leser im Bild und Zustand)

- Geschnitten: `gelaende-core.js korn(L,x,z,aus)` — Bett Sternberg über Hack-Lauflänge (α 0,15 km⁻¹, Kies-Sand-Übergang), Aue Schluff,
  Hang nach Steile/Schutt, Wind Löss; `flaeche` nennt die Aue (aueSeg/aueT/aueQuer, Höhe byte-gleich). Leser: `_terrainMaterialAt(…, aus)`
  (kornMm, kornKlasse, herkunft) und `sedimentFarbe` in `_bodenFarbeAt` + voxel-worker `bodenFarbe` (Sohle und Bank, nur am Fluss).
- Gemessen (swiftshader, Heimat, Stations-Rumpf S2 mit dem Feld): Rang an der Sohle Median 1,0 (min 1,0) an 20 Läufen, alle
  Punkte der Bahn 0,70; D Quelle 85,9 mm ↔ Mündung 3,5 mm; Korn-Stufen 2 (Kies, Steine).
- Offen: Linse, Preis je Kachel, Statik, Stations-Kandidat (S2 trägt ein festes „nicht“), Vor-Richter-Orte.
- Status: ZWISCHENSTAND · Karte 2 gebucht 149 von 1 718.

## 27.11. 13:45 UTC — WIP 3 (Linse, Station-Kandidat, Bild, Orte)

- Linse (bestehende Familie: die Kern-Probe `node scripts/diag-worker-dichte.cjs --kern --selftest`, in gate:worker-dichte): an
  161 von 2 304 Ufer-Punkten am Kanal fragt die Boden-Farbe das Korn-Feld; das halbe Korn zieht 483 Werte der Stamm-Farbe;
  Ufer-Farbe Stamm = Faden (0 ab); die Mutation „Korn“ zieht Stamm 483 · Faden 483. Vorher (Baum origin/main 7e73426e) ROT beim
  Namen: „an 0 von 2 304 Ufer-Punkten … das Feld lebt im Zustand, das Bild liest es nicht“ · „MUTATION Korn: kein Anker im Kern“.
  Selbsttest: das Bild ohne Korn-Leser (`amFluss` fragt nie) → zieht 0 → ist ROT am BILD. Dauer der ganzen Kern-Probe 123 s.
- Station-Kandidat: `cloud-post/boden-korn-station/` (Diff gegen punkte-maschine f0d408e und BEGRUENDUNG.txt). Durch den Leser des
  Spiels (`_terrainMaterialAt(…, aus).kornMm`): Rang 1,0 (min 0,9) an 20 Läufen, 3 Stufen (Steine, Kies, Schluff); die Seite der
  Leiter 94 ms; die Wand „liste“ der Punkte-Maschine: Basis und Kandidat je genau zwei ROT gelaende.K2#1/#2 „Wand HAKEN“.
- Die Station wie sie steht: ROT · nicht „keine Korngröße in der Welt“ (fest im Text, liest das Feld nicht).
- Bild (Draufsicht des Vertex-Lesers, `cloud-post/boden-korn-station/ufer-korn.png`): oben das Feld, unten festes Korn 2 mm — am
  groben Ufer (115 mm, 68 mm) zeichnet das Feld den Saum grau-kiesig statt sandig. Der GPU-Schuss (`werkbank bild`) hält auf
  swiftshader keine Welt (Wald-Karten pnull) — das Bild am Gerät fällt der Vorprüfung zu.
- Preis: Farbe einer Fluss-Kachel (4 096 Vertices, Main-Spiegel, ABAB × 4) 28,6 ms (festes Korn) ↔ 26,9 ms (Feld), 427 Fragen je
  Kachel, ≤ 1 je Vertex, nur am Fluss; je Bild nichts.
- Vor-Richter-Orte (Lauf 0, der längste im Fenster ±3 km, Heimat): Quelle (3479, 2311) D 85,9 mm · Mitte (1788, −1385) D 40,7 mm ·
  Mündung (2314, −5432) D 9,2 mm. Im Hydro-Bereich des Spielers: Ufer (−188, −632) 115 mm · (−1616, −212) 68 mm.
- Offen (mit Adresse): das Korn als Rauheit des Schutt-Shaders (`schuttKornO` liest `FELS.geroell.korn` fest, nicht das Feld) ·
  die Düne (Wind sortiert nur Löss) · Horizonte #3 lesen `korn` noch nicht · das Bild am Gerät.
- Status: ZWISCHENSTAND · Karte 2 gebucht 149 von 1 718.

## 27.11. 14:50 UTC — WIP 4 (Wartezimmer: Vorprüf-Kopf 14c43592 im Bündel 2)

- GPU-Probe 14c43592 (GTX 1050): GRÜN — gate:webgl-probe 119 s · bild:dorf@0.5 214 s · bild:ufer@0.5 105 s.
- Eigenes Auge an `bild:ufer@0.5`: die Wiese deckt die Bank, das Wasser spiegelt hell — das Korn ist an dieser Pose NICHT sichtbar;
  das grüne Tor beweist Szene und Wasser, nicht das Korn. Dorf ohne Bruch.
- Post 15:39 (an alle) gelesen: Kopf fährt in `buendel-abend`, kein neuer Vorprüf-Kopf vor der Landung; weiter am Auftrag: der
  Korn-Maßstab des gezeichneten Materials (Rauheit, `schuttKornO`) liest das Feld noch nicht.
- Status: ZWISCHENSTAND · Karte 2 gebucht 149 von 1 718.

## 27.11. 15:03 UTC — WIP 5 (das Korn an Sohle und Bank im Bild)

- Befund am Messort `ufer` (Profil Spieler → Blick, 1,5 m): die Sohle unter 0,6 m Wasser trug 99,8 % Wiese (die Rampe des
  stehenden Wassers, voll ab 4 m), die Bank jenseits der Krone keinen Fluss-Bezug (`flussAm` endet an der Krone) — das Korn
  lebte im Zustand, das Bild las es an 161 von 2 304 Ufer-Punkten.
- Schnitt im Gelände-Kern: `flussSohle` (Tafel `SOHLE`, voll ab 0,3 m unter dem Spiegel — unter der Mittelwasser-Linie wurzelt
  keine Landpflanze) und `flussBank` (die Bank, die der Kanal schneidet: 1 bis zur Krone, 0 am Saum dammBreite + bankWeite
  dahinter, der Spiegel des nächsten Segments samt Pegel). Leser: `_bodenFarbeAt` und voxel-worker `bodenFarbe` (nah je Vertex,
  fern je Segment im Abdruck `flussAbdruck` als Mittel der Bank).
- Gemessen: Sohle am `ufer` 0,046/0,084/0,019 (Wiese) → 0,155/0,129/0,101 (Kies 56,8 mm); Bank 0,041/0,069/0,020 →
  0,094/0,105/0,049. Kern-Probe GRÜN 129 s: 1 807 von 2 304 Ufer-Punkten fragen das Korn (vorher 161), das halbe Korn zieht 2 925
  Werte (vorher 483), Stamm = Faden 0, Mutation Korn zieht 1 104 · 1 104, Selbsttest ROT am BILD. Preis der Farbe einer
  Fluss-Kachel (4 096 Vertices, ABAB) 27,4 / 31,8 → 31,9 / 35,0 ms (+3–4,5 ms, nur bei der Geburt; je Bild nichts).
- Bild: `cloud-post/boden-korn-station/ufer-sohle-bank.png` (Draufsicht ±32 m am `ufer`, oben nachher, unten vorher).
- Offen: der Korn-Maßstab des Schutt-Shaders (`_kornSicht` liest `FELS.geroell.korn` fest; alle vier w-Kanäle des Boden-Satzes
  sind belegt — ein Korn je Vertex braucht einen fünften), die Düne, Horizonte #3, das Bild am Gerät (Vorprüf-Kopf erst nach
  der Landung von `buendel-abend`).
- Status: ZWISCHENSTAND · Karte 2 gebucht 150 von 1 718.

## 27.11. 15:23 UTC — die drei Lauf-Orte im Kanal (für den Vor-Richter)

- Am Ort umgestellt (der Spieler dort, die Hydrosphäre dort gerechnet), der nächste Kanal-Punkt (`flussAm`, Mitte > 0,5) — die
  Orte des Laufs 0 (der längste Lauf der Station, ±3 km):
  Quelle (3479, 2311) D 85,9 mm, Bett 7,8 m · Mitte (1788, −1385) D 40,7 mm, Bett 14,1 m · Mündung (2497, −5615) D 9,8 mm,
  Bett 8,7 m. Bild: `cloud-post/boden-korn-station/lauf-orte.png` (Draufsicht ±32 m, oben nachher, unten vorher: vorher trug
  keines der drei Betten Sediment).
- Befund: am Netz-Punkt der Mündung (2314, −5432) liegt kein Kanal; im Unterlauf läuft der Kanal der Hydrosphäre 115–150 m
  neben dem Bett des Netzes (an (2517, −5120) liest die Sohle des Kanals „aue“ 0,3 mm). Am `ufer`, an Quelle und Mitte decken
  sich beide. Offen mit Adresse: das Bett des Kanals und das Bett des Netzes (`korn` liest `flaeche` … `aueSeg`).
- Status: ZWISCHENSTAND · Karte 2 gebucht 150 von 1 718.

## 27.11. 15:27 UTC — das Bett des Kanals = das Bett des Laufs

- Wurzel des Befunds 15:23: der Kanal der Hydrosphäre IST die Bahn des Netzes (`hydroNetzFluesse` → `flussLaeufe`, Ebenen 0
  und 1, die Bahn des Mäanders); das Korn las sein Bett über die Aue-Wahl der Fläche (das gröbste Netz). Ein Zufluss quer durch
  die Aue seines Hauptlaufs las dessen Auelehm; wo die Bahn eines kleinen Laufs über seine schmale Aue schwingt, den Hang.
- Schnitt: `laufBahn` im Korn (gelaende-core) — das Bett des nächsten Laufs der Ebenen 0 und 1, quer gemessen zur Bahn des
  Mäanders (`bahnVersatz`); es gewinnt, wo der Ort tiefer in ihm liegt als im Bett der Aue. `flaeche` bleibt byte-gleich.
- Gemessen (Region des `ufer`, je Kanal-Segment die Mitte): 230 von 1 058 Kanal-Sohlen lasen kein Bett (143 Hang, 50 Aue,
  20 Wind; vorher 230) → 0 von 1 058. Zufluss (2517, −5120): „aue“ 0,3 mm → „bett“ 72,9 mm. Rang an 20 Läufen Median 1,0, min
  0,9 → 1,0. Korn je 4 096 Punkte: Ufer 8,4–13,5 → 5,3–8,7 ms, Wiese 3,1–3,9 → 4,5–6,0 ms, Fern 5,7–6,6 → 5,4–8,1 ms.
- Status: ZWISCHENSTAND · Karte 2 gebucht 150 von 1 718.

## 27.11. 15:40 UTC — Prüfungen am Kopf 57d2916

- `gate:worker-dichte` GRÜN (≈ 8 min, die Kern-Probe darin: Korn zieht Stamm 1 131 · Faden 1 131) · `gate:fern-ring` GRÜN (14:
  der Fluss im Ring ohne Fern-Blau) · `gate:betriebsgesetz` GRÜN. `gate:fern-wasser` ist hier ROT („gebaut: false“) — am
  main bed6256c im selben Behälter ebenso, kein Bruch dieses Schnitts.
- Stations-Kandidat: `BEGRUENDUNG.txt` trägt die Zahl am Kopf 57d2916 (rang 1,0, min 1,0, kornStufen 2) und die EINE Zeile
  des Richters.
- Nächster Vorprüf-Kopf erst, wenn `buendel-abend` im main liegt (Post 15:39).
- Status: ZWISCHENSTAND · Karte 2 gebucht 150 von 1 718.

## 27.11. 16:25 UTC — im Wartezimmer, Kopf 1 fährt in `buendel-b`

- Post 16:54 (Koordinator) gelesen: boden-korn 14c43592 fährt in `buendel-b` 08098b8f auf `buendel-a`, kein Rot an diesem
  Teil. Kopf 2 (Sohle, Bank, das Bett des Laufs) liegt gebaut im Zweig, Probelauf auf dem Bündel: setzt sich glatt bis auf
  den einen Satz in `docs/studio-vertrag.md`, als Vereinigung gelöst.
- Die Linsen-Schritte der Post: dieser Kopf fasst weder Bewohner, Tiere, Siedlung noch Wind, Brand, Wetter an — seine Linsen
  sind `gate:worker-dichte` (Kern-Probe) und `gate:fern-ring`, beide GRÜN am Kopf 57d2916.
- Ehrlich offen: Korn-Maßstab und Rauheit im Boden-Shader (die vier w-Kanäle sind belegt, `aSchutt` trägt das Gewicht des
  Schutts — ein zweiter Sinn darin wäre ein Zwilling); die Düne; die Horizonte (#3); das Bild am Gerät.
- Status: ZWISCHENSTAND · Karte 2 gebucht 150 von 1 718.

## 27.11. 17:15 UTC — Vorprüf-Kopf 2 auf main 948f68ee

- `buendel-b` gelandet (z807), der Kandidat gesetzt (punkte-maschine 7d5a6463). Kopf 2 sitzt glatt auf 948f68ee: der Satz in
  `docs/studio-vertrag.md` als Vereinigung mit pegel-nach-brand; `flussBank` liest den Spiegel mit dem Knoten des Segments
  (`pegelHub(L, y, j, kn)`, KANAL_FELDER Feld 11) wie `flussAm` — die Bank steht nach Brand auf demselben Spiegel wie der Fluss.
- Gemessen am Kopf 2: Kern-Probe GRÜN 125 s (Korn fragen 1 807 von 2 304 Ufer-Punkten, vorher 161; das halbe Korn zieht 2 952
  Werte; Korn zieht Stamm 1 131 · Faden 1 131; Selbsttest ROT am BILD) · Körper des Kandidaten rang 1,0 (min 1,0), laeufe 20,
  kornStufen 2, 179 Stützen „bett“.
- Linsen-Schritte der Batterie an den Dateien des Kopfs, lokal: `gate:fachwerk-contract` GRÜN 111 s · `gate:gelaende-realismus`
  GRÜN 71 s · `gate:gelaende-studio` GRÜN 35 s · `gate:fluss` GRÜN 113 s · `gate:seam` GRÜN 15 s · `gate:werk-im-wasser` GRÜN
  161 s · `gate:worker-dichte` GRÜN 437 s. `gate:wasser-leben` ROT allein an „K10 LEER: 8“ (die Höhlen-Probe findet 8 von 20
  Proben) — am main 42a14279 im selben Behälter byte-gleich ROT, kein Bruch dieses Schnitts.
- Status: ZWISCHENSTAND · Karte 2 gebucht 154 von 1 718.

## 27.11. 17:55 UTC — Auftrag boden#1 (Post 18:35): der Zensus

Kopf 2 b5ffb77f fährt in `buendel-c`. Die nächste Sprosse ist `karte2.planet.relief.boden#1` „Fels und Erdboden eines Orts“. Der
Zensus ist headless aus dem Gesetz der Station S1 gerechnet (30 Zufallsposen × 9 Punkte der Heimat, Saat 12345, der Körper
`BODEN_AN` aus dem Planet-Prüfer des Zweigs punkte-maschine, Werkbank).

- Die Hänge: 270 Punkte, 200 unter 10°, 48 zwischen 10 und 20°, 12 zwischen 20 und 30°, 7 zwischen 30 und 40°, 3 zwischen 40
  und 50°.
- Schutt (`hoehe(…, aus).schutt` > 0,5) am Steilen ≥ 30°: **0 von 10**, auf flachen Punkten unter 10°: 0 von 200.
- Fels und Schutt (`felsStoffPunkt` > 0,5) am Steilen: **0 von 10**. Der Fels beginnt erst an der Steile 0,42 ≈ 55°
  (stamm/daten.js:646 `TERRAIN_GEOLOGY.rockLo`). Den Schutt legt allein der Schutthang des Schicht-Gesetzes (gelaende-core.js
  `hoehe`, die Treppe), nie die Steile unter einer Wand.
- Moos: **0 von 13** feuchten Punkten (Feuchte > 0,5 an 4,8 % der Punkte). Moos und Flechte liegen nur auf dem Fels-Stoff
  (gelaende-core.js:4468 `felsFarbe`, `felsStoffPunkt` ab `w > 0`), nie auf dem Erdboden. Kein Punkt trägt Stoff, also kein
  Moos — auch nicht im Schatten.
- Der Erdboden: die Farbe ist `BODEN_FARBE.mead` ↔ `.wet` nach Rausch-Feld und Feuchte (stamm/gelaende-boden.js:2634
  `_bodenFarbeAt`). Das Klima des Orts (`ortGesetz(teil).klimaHeute`: Winter, Sommer, Niederschlag; Heimat −4 / 18 °C, 547,5 mm)
  liest nur der kahle Grund der Reise (`kahlGrund`, `wuchs.sand`), nie die Farbe der Erde.
- Der Korpus: die Quellen-Liste der Prüfer (Zweig punkte-maschine) führt boden#1 unter `plan` als „Wikimedia Commons, ≥ 40 Fotos, nicht geholt: die
  Suche braucht die Kamera der Station“. Es gibt keinen Satz und keine Zahl der Anteile.
- Nächster Schnitt: das Gesetz der Deckung an EINER Wurzel im Gelände-Kern — Schutt-Fächer unter der Wand im Band des
  Schüttwinkels, Moos im Feuchten und Schatten auf dem Erdboden, die Farbe der Erde aus dem Klima — mit Band und Quelle.
- Status: ZWISCHENSTAND · Karte 2 gebucht 154 von 1 718.

## 27.11. 18:10 UTC — der Hang-Schutt im Gelände-Kern (WIP)

- Geschnitten (gelaende-core.js, ungeprüft gegen die Wand): `HANG_SCHUTT` — der Schutt-Anteil steigt mit der Steile von 30° bis
  50° (`hangSchuttAnteil`, glatt), gelegt als Flecken eines Rausch-Felds (λ 9 m, Quantil-Tafel aus 4 096 Proben), deren Mittel
  der Anteil IST (33° 0,041 → 0,044 · 37° 0,218 → 0,227 · 40° 0,422 → 0,428 · 45° 0,799 → 0,803). Band: DiBiase, Heimsath &
  Whipple 2012 (ESPL 37:855, „unter 30° mittlerer Steile ist der Fels kaum entblößt, darüber steigt er stark“) und der
  Schüttwinkel 35–40° (Statham 1976). `felsSchutt` liest ihn am EINEN Chokepoint, Chunk-Pfad und Punkt-Pfad gleich.
- Gemessen (Zensus, 30 Posen): Stoff am Steilen ≥ 30° 0 → 3 von 10 (30 %); 30–40° 1 von 7, 40–50° 2 von 3. Die Draufsicht
  200 × 200 m um den 43°-Hang bei (286, −74): `cloud-post/boden-korn-bild/hang-286-74-vorher.png` → `…-nachher.png`.
- Ehrlich offen: das Ego-Bild — der GPU-Prozess (SwiftShader) stürzt in diesem Container bei jedem Sprung ab (17 Abbilder seit
  13:06, auch mit dem Code von HEAD), das Bild kommt über die gpu-probe; der Fächer unter der Wand (heute Flecken ohne
  Fallrichtung); das Fern-Feld `fernSchuttVon` (voxel-worker.js) ohne die Steile; Moos auf dem Erdboden; die Farbe der Erde aus
  dem Klima; die Linse; der Stations-Kandidat.
- Status: ZWISCHENSTAND · Karte 2 gebucht 154 von 1 718.

## 27.11. 18:25 UTC — die Ferne, das Moos, die Linse, der Kandidat (WIP)

- Geschnitten: (1) die Ferne trägt das Mittel des Schutts nach DERSELBEN Kurve (stamm/stoff-material.js `_terrainGeologyAlbedo`,
  `HANG_SCHUTT_ST` an der Geometrie-Normale, gemischt wie `fernSchutt`; der Fein-Term läuft weiter nur am Chunk — kein neuer
  Zweig auf der GPU). (2) Das Moos ist EIN Gesetz im Gelände-Kern: `moosDeckung(fe, k, nord, ny)` — Feuchte des Bodens oder
  das Klima (de Martonne 1926, I = P/(T+10), 20 → 55; die Heimat I = 32, k = 0,28), der Nordhang (Norden = −z) hält das Wasser
  bis aufs Doppelte; `felsFarbe` (Sims), `felsStoff` → `moosErde` (die Erde je Vertex, die Feuchte auf dem 5,4-m-Gitter) und
  `felsStoffPunkt` lesen es; der Shader legt am Chunk kein zweites Moos (der Treiber Grün × Dunkel bleibt nur der Ferne). Der
  Fleck der Erde hat λ 8 m — das Netz der Nähe (1,8 m) trug den Fleck des Simses (3,4 m) nicht (`traegt` 0: ein Schleier).
  (3) Die Linse (o) in `gate:hoehlen-sicht`: Mittel der Flecken = Anteil der Kurve, kein Schutt unter 30°, an 40° ≥ ⅓, Flecken
  statt Schleier, die Ferne liest die Kurve — an main LEER/ROT, am Kopf GRÜN (40°: 0,432 gegen 0,422, Schleier 0,127).
  (4) Der Stations-Kandidat S1 (cloud-post/boden-korn-station: `felsStoffPunkt(…, aus)`, `schuttMittelSteil`).
- Gemessen (S1-Körper, 30 Posen × 9 Punkte, Saat 12345): Schutt am Steilen 0 → 30 % (3 von 10), Mittel 0 → 0,304 (Kurve 0,28),
  am Flachen 0 → 0 %; Moos an den feuchten Punkten (Feuchte > 0,5) 0 → 46 % (6 von 13, Mittel 0,311), an den trockenen 0 → 0 %.
- Ehrlich offen: die Farbe der Erde aus dem Klima; das Ego-Bild (GPU-Probe); der Preis (die Feuchte je Chunk ≤ 144 Rufe à 7 µs);
  der Foto-Korpus als Zahl.
- Status: ZWISCHENSTAND · Karte 2 gebucht 154 von 1 718.

## 27.11. 18:50 UTC — die Erde des Klimas, der Anschnitt, der Fächer (WIP)

- Geschnitten: (1) `ortErde(P, L)` im Gelände-Kern: die Erde (`dirt`) in der Farbe des Klimas, relativ zur Heimat (die Heimat ist
  dasselbe Objekt, byte-gleich) — Humus nach Jenny 1930 (2,5× je 10 K kühler, gesättigt mit dem Niederschlag, die Albedo
  (1+k)/(1+k·h/h₀)), Hämatit nach Schwertmann 1982 (ab 8 °C, die Nässe halbiert ihn). Leser: `_bodenFarbeAt`, der Worker
  `bodenFarbe` (dieselbe Funktion, Main = Worker). Kopf 3 fasst stamm/siedlung-wege.js NICHT an (die Wege `_wegeBodenFarbe`, das
  Band der Ferne und der Acker): ihr Stempel trägt drei Pflicht-Wände (Prüfbühne, Frost, Studio-Dorf), mit gate:webgl-probe und
  bild:dorf@0.5 fünf über dem Einlass 4 — sie fahren im eigenen Stempel, bis dahin am fremden Ort die Erde der Heimat. (2) DER ANSCHNITT
  IST ERDE: die Wand des Erdbaus (Böschung im Schüttwinkel loser Böden, Trasse, Absatz) trägt den Unterboden des Orts
  (`anschnittErde`: Bw 10YR 4/4 der Heimat über `ortErde`) statt des grauen Fels-Schutts; `aSchutt` bleibt das Gewicht (K66: kein
  Halm auf der Wand). (3) DER FÄCHER UNTER DER WAND: `schuttFaecher` — die Wand (≥ 50°, der volle Schutt der Kurve) schickt ihren
  Schutt hangab, bis die Linie von ihrer Krone den Schattenwinkel 27,5° unterschreitet (Evans & Hungr 1993); `felsStoff` (Gitter
  ≤ 5 × 5 je Netz) und `felsStoffPunkt` lesen ihn. (4) Die Linsen in `gate:hoehlen-sicht`: (p) Erde des Klimas und Anschnitt,
  (o) Fächer am Wirt — je ROT am Mutanten von main 948f68ee.
- Gemessen: Terra rossa (17 °C, 700 mm) Röte 1,75× · Moor (3 °C, 1 400 mm) Albedo 0,66× · Steppe (9 °C, 350 mm) 1,23× der Heimat
  (`#5c4a33` → `#7c4d37` · `#4b3c29` · `#665239`); die Erdbau-Wände um den Ursprung: 835 von 882 steilen Punkten Erde statt Fels
  (Y 0,126 → 0,118, r/g 1,20 → 1,69, grün nie); der Fächer: 906 von 21 833 steilen Punkten (≥ 23°, 3 × 3 km), 232 davon, wo
  die Flecken des Hangs keinen Schutt tragen; Preis 25–38 µs je Fächer-Punkt (≤ 1 ms je steilem Netz); S1 an 30 Posen unverändert
  (Schutt am Steilen 30 %, Moos-Polster auf der feuchten Erde 46,2 %, kein Fächer unter den Posen). Bilder:
  `cloud-post/boden-korn-bild/faecher-186-118-vorher.png` → `…-nachher.png` (die Böschungen braun statt grau).
- Ehrlich offen: die Ferne trägt die Wand des Erdbaus und den Fächer weiter als Fels-Mittel (`fernSchuttVon`, ein Skalar); das
  Ego-Bild (GPU-Probe am Kopf 3); der Foto-Korpus als Zahl.
- Status: ZWISCHENSTAND · Karte 2 gebucht 154 von 1 718.

## 27.11. 21:00 UTC — Kopf 3 08e47d8b auf main b3740dd5; der Wege-Stempel (WIP darüber)

- Kopf 3 trägt boden#1 ohne stamm/siedlung-wege.js: probe-tag verlangt für `stamm/siedlung-*` die Wände gate:pruefbuehne-licht,
  gate:weltbild-frost:echt und gate:studio-begehen — mit den Pflicht-Proben gate:webgl-probe und bild:dorf@0.5 fünf über dem
  Einlass 4. Nach der Regel vom 20:28 lief `gate:welt-boot` am Kopf (die Linse diag-hoehlen-sicht.cjs ist angefasst): GRÜN, 81 s.
- Der Wege-Stempel (WIP über dem Kopf, [skip ci]): die Wege (`_wegeBodenFarbe`), das Band der Ferne und der Acker
  (`_ackerErde(P)`) lesen `ortErde` — in der Heimat byte-gleich (dasselbe Objekt). Sein Probe-Ruf braucht die drei Pflicht-Wände;
  mit gate:webgl-probe sind es vier, bild:dorf@0.5 fände keinen Platz. FRAGE an den Koordinator: fährt der Wege-Stempel mit
  `[gpu-probe: gate:webgl-probe, gate:pruefbuehne-licht, gate:weltbild-frost:echt, gate:studio-begehen]` ohne bild:dorf@0.5?

## 28.11. 01:20 UTC — Kopf 6 auf main bbb97563: das Mittel des Moos-Flecks ist das Mittel seines Gesetzes · die Masche je Achse widerlegt

- **Geschnitten:** gelaende-core `moosFleckMittel` — wo eine Masche den Fleck nicht trägt (die Ferne), stand das Mittel fest auf
  0,32; das Gesetz trägt 0,358 (eine Million Punkte, ± 0,0004): das Moos des Rings lag 11 % unter dem Moos der Nähe. Jetzt einmal
  gerechnet an 65 536 Punkten der Folge R3 am selben Hash (0,3577). Ein Gitter mit festen Schritten traf 0,367 — es tastet das Rauschen in Mustern.
- **Die Linse** `gate:hoehlen-sicht` (q), reine Familie wie (m) und (o): Fern-Mittel ÷ Nah-Mittel an 16 384 Punkten je λ (Erde 8 m,
  Sims 3,4 m) auf ± 3 %. Am Stamm 27d2f60e ROT beim Namen (0,32 ÷ 0,352 = 0,909), am Kopf GRÜN; Selbsttest „Moos-Fleck mit fester Zahl“.
- **Widerlegt, nicht geliefert:** die Masche der Fern-Farbe je Achse (quer `ht`, längs `hr` statt isotrop über die längere Seite,
  voxel-worker `fernFarbeMasche`). Sie senkte die Abweichung Masche ↔ Mittel der Nähe (ΔE-Median 1,15 → 0,66 an 30 Posen) und die
  Naht-Posen 3 → 0 von 29 — aber `gate:fern-ring` (10) fiel ROT: Streifen-Index 0,463 → 0,695 (Soll ≤ 0,5). Gemessen: selbst das
  dichte Dreiecks-Mittel der Wahrheit trägt längs der fernen Reihen 0,59; unter 0,5 kommt nur ein Farbfeld, das quer so weit mittelt
  wie längs. Die Welt kennt die Speichen des Rings nicht — die isotrope Masche ist das Gesetz, sie bleibt.
- **Ehrlich offen, die Naht beim Index** (Masche isotrop wie das Spiel, Klassen-Mittel ΔE > 5 ohne Schutt/Fels des Steilen): Pose 3
  (797, 255) Fächer 5,4 an 23 Punkten · Pose 15 (1232, −496) Fächer 8,1 an 1 Punkt · Pose 24 (314, −4) Moos 5,7 an 17 Punkten. Ein
  Klassen-Mittel am Scheitel trägt die Rückkehr zum Mittel jeder Masche, die über die Klasse hinaus reicht — das Bild der GTX 1050
  an diesen drei Posen ist der Richter, ob das Auge dort eine Naht sieht.
- **Kandidat 4 boden#1, der Satz der Quellen** (cloud-post/boden-korn-station/quellen-boden1.diff, gegen pm fd95ac83, nach der
  Post 02:25): sechs Sätze, Breite 1280 wie der Schuss des Fachs, ungeholt — geholt wird am Gerät. Die Kategorien mit ihrer
  Dateizahl (Commons categoryinfo, ohne Download): „Views from the Fordon slope“ 127 (die Flanke von Fordon — dort lagen die
  Treffer eines Vorlaufs „zbocze“, 11 von 20), „Świętokrzyskie Mountains“ 55 (Kielce ist der Klima-Anker des Gesetzes, Dfb 18 / −4 °C,
  547,5 mm), „Screes“ 109 (Klasse Schutt), „Rock formations in Poland“ 47, „Outcrops in Poland“ 23 (Soll 23), „Slopes“ 172 — 533 vor
  den Wänden des Holers; „Screes“ und „Slopes“ sind weltweit, am Bogen fällt das fremde Klima. Begründung: BEGRUENDUNG.txt „KANDIDAT 4“.
- **formschatz#1, sein Satz der Quellen geprüft:** er braucht keinen — der Zensus führt ihn als art ordnen · lauf spiel · stumpf rot
  · anker klasse; der Paar-Bauer des Prüfers (pm) nimmt ihn über das Klassen-Blatt, die Wahrheit je Bild schreibt das Profil-Gesetz
  in die Akte des Fächers (V-Tal · Trogtal), die Liste der Quellen liest dieser Weg nie, und die Eichung ordnen × klasse steht (d568b019). Was ihn hält, ist der Lauf
  des Fächers am Gerät.
- **Batterie Kopf 6** (auf main bbb97563, nach der Landung von Kopf 5 = w28-boden-korn-5 8a775cef und z819): check:statik ·
  gate:fachwerk-contract · gate:asset-contract 128 von 128 · gate:hoehlen-sicht · gate:fern-ring · gate:settlement (1 045 s) GRÜN,
  lint 0 Fehler. Er trägt nur noch das Mittel des Moos-Flecks, die Linse (q), das Blatt und die Station.
- **boden#1 an der Stille-Wache (Post 04:26): wie weit die Leiter reist und wie lange sie zwischen zwei Zeilen rechnet** — gemessen
  an der Werkbank (dieser Rechner, Holz kienspan, das Gesetz von Kopf 5; der Wortlaut der Station aus pm 9b4b3c91 ausgeschnitten und
  am Stück gefahren, Spieler an der Wiese 1252/861):
  - **Reise: 0 m.** BODEN_AN ist ein reiner Gesetz-Leser (hoehe, _feuchteAt, _bodenFarbeAt, felsStoffPunkt) an 270 Adressen (30 Posen
    × 3 × 3 à 10 m, ± 1 500 m um den Ursprung) — die Adressen liegen vom Stand 0 … 3 501 m (Median 1 905 m), gelesen, nie gestreamt;
    der Spieler und die Kamera bleiben stehen. HANG_BLICK sucht ≤ 400 m um den Stand (an der Wiese 20 m, Hang 30°; an den 30
    Pose-Mitten 24 mit Hang, Blick 20 … 400 m, 6 ohne).
  - **Rechnen: ≈ 0,22 s für die ganze Leiter.** Block S0 (270 Hang-Punkte, 20 Läufe aus flussLaeufe über 6 × 6 km, 50 × 9 Säulen
    zu 10 Tiefen, 100 Klassen) 196 ms · BODEN_AN 270 Punkte 21 ms (Median 0,02 ms, höchstens 8,1 ms) · HANG_BLICK 0,4 ms (30 Mitten 46 ms).
  - **Daraus:** die 148,8 s Stille liegen nicht in der Rechnung der Leiter. Was dauern kann, ist das Einschwingen nach dem Heimweg (am
    Gerät 56,3 s für 10 272 m, die formschatz den Spieler fortgetragen hatte) und das EINE Auge relief-boden-s1 (Kamera am Stand,
    Ziel ≤ 400 m — kein Umstellen, aber /bild wartet, bis die Welt dort steht). Der Deckel der Tafel hängt also an Heimweg + Auge,
    nicht an der Reichweite des Bodens.
- Status: ZWISCHENSTAND · Karte 2 gebucht 158 von 1 718.

## 28.11. 00:55 UTC — Kopf 5 auf main 27d2f60e (das Golden des Findlings) · Kandidat 3 boden#1 gesendet (drei Dateien)

- **Das Rot von Kopf 4** (Asset-Vertrag v1, findling-s7-L0-summer.json Mesh0.color): nach der Quelle entschieden — GESETZ, kein
  Leck. foundry-core `felsStoffNetz` ruft `GK.felsNetz` mit Feuchte 0,3; das alte `felsFarbe` legte Moos linear in der Feuchte,
  das EINE Moos-Gesetz des Schnitts (`moosDeckung`, glatt 0,35 … 0,8) legt dort keins. Golden neu mit dem Schreiber
  (`MINT_FORCE=1 scripts/mint-asset-goldens.cjs`): 127 byte-gleich, nur der Findling. Kanal Mesh0.color, Mittel RGB
  0,2825/0,2505/0,1911 → 0,2987/0,2611/0,2038, Y 0,253 → 0,265 (+4,7 %), G−R −0,032 → −0,038; 224 von 549 Werten, höchstens
  0,065. Das manifest zog zwei am main stale Zeilen mit (blume-s7-L0/L2, Dateien byte-gleich, stale seit 90a12876).
- **Kandidat 3 boden#1** (cloud-post/boden-korn-station/, gegen pm 2ec879b1, an 2492c7c9 unberührt): `k2-planet-stand.diff`
  (der Stand der Sitzung am EINEN Rumpf `probeRumpf`: vor jeder Leiter und am Ende `/umstellen` zurück, wenn der Spieler
  > 43,2 m daneben steht, sonst wirft die Leiter beim Namen; der Zwilling in wasser.seegang fällt; die Pose `HANG_BLICK`:
  Ego an der Wiese, Blick auf den Hang 360 m westlich, 21,5°) · `punkte-stand-linse.diff` (Selbsttest (h): ROT am alten Rumpf,
  9 387 m daneben, kein Ruf) · `faecher-boden1.diff` (das Fach liest BODEN_AN, HANG_BLICK und den Strom der Saat 12345 aus dem
  Wortlaut; 85 von 100 Posen tragen einen Hang; Selbsttest 16 GRÜN). Die Klassen-Zeile steht schon (pm: die Klassen-Tafel der Stationen, Zeile 233, Klasse P).
  Kandidat 2 fällt. Begründung: BEGRUENDUNG.txt „KANDIDAT 3“.
- Ehrlich offen: der Foto-Korpus (≥ 40 Fotos gleichen Hangs und Klimas) fehlt — der Paar-Bauer des Prüfers (pm) verweigert, anteilJeKorpus ungemessen;
  die Rückkehr an der GTX 1050 ungefahren; die Naht-Linse (Scheitel gegen das Mittel über die Masche) noch nicht im Baum.
- Status: ZWISCHENSTAND · Karte 2 gebucht 156 von 1 718.

## 28.11. 00:35 UTC — die Posen der Naht beim Index (Saat 12345, für die Bilder der GTX 1050)

- Die Posen: Saat 12345, `zf = () => (s = (s * 16807) % 2147483647) / 2147483647`, je Pose x0 = (zf() − 0,5) · 3 000, dann z0
  ebenso (die Reihe der Station). Gemessen am Kopf 4: Klassen-Mittel ΔE > 5 (ohne Schutt/Fels des Steilen, die der Ring-Stoff im
  Shader legt) an **10 von 29 Posen** (vor dem Schnitt 17) — die „9“ des Commits zählte Pose 15 nicht (ein einziger Fächer-Punkt):
  - 3 (797, 255) Fächer 6,0 (23 Punkte) · 5 (−501, −915) Moos 5,9 (73), Fächer 5,6 (5) · 9 (−701, −998) Fächer 5,5 (15)
  - 10 (1 093, −873) Moos 6,2 (31) · 13 (−580, 389) Moos 5,8 (127) · 15 (1 232, −496) Fächer 11,8 (1)
  - 20 (585, 250) Anschnitt 5,3 (10) · 21 (−772, −967) Fächer 5,1 (20) · 24 (314, −4) Moos 7,2 (17)
  - 25 (−366, 296) Moos 5,8 (123), Fächer 6,0 (4), Anschnitt 7,3 (15)
- Ehrlich: die Messung vergleicht den Ring-Scheitel (das Mittel des Gesetzes über seine Masche, `fernFarbeMasche`) mit dem
  Nah-Gesetz an EINEM Punkt — ein Teil des Rests ist die Fläche gegen den Punkt. Das Werkzeug kommt in den Baum als Linse
  (Scheitel gegen das Mittel des Nah-Gesetzes über dieselbe Masche), dann fällt die Klasse ganz.

## 27.11. 23:05 UTC — GPU-Probe Kopf 4 cbc549ab GRÜN (gtx1050-desktop, 2 392 s), das Bild gesehen

- webgl-probe 127 s, bild:dorf@0.5 198 s, bild:wiese@0.5 99 s, gate:hoehlen-sicht 152 s — alle GRÜN (Probe-Post boden-korn zu cbc549ab im Zweig koordination).
- Mein Auge an den zwei Bildern: am Dorf trägt die Erdbau-Böschung links braune Erde mit dem Korn des Schutts (kein graues
  Fels-Band), Grünsaum oben; die Wege braun. An der Wiese Gras bis an den Waldrand, kein Farbsprung am Übergang in die Ferne.
- Zug-Abgleich (23:45-Post): `git merge-tree` gegen w28-frist-puls-1, w28-kunst-am-leib-4, w28-sprache-dialekt-2b,
  w28-wurf-mit-luft-3 je 0 CONFLICT; Kopf 4 rührt weder check.yml noch spec/ci/ci-zeiten.json.

## 27.11. 21:40 UTC — die Station boden#1: der Ort wandert nicht im Körper, sondern am Auge

- Gemessen (Werkbank, Kopf 4): die Seite der Leiter Boden 158 ms, der Fächer S1 (270 Adressen) 8 ms, Weg des Spielers 0 m —
  die 30 Posen sind Funktionsrufe der Saat, kein Sprung. Den Deckel (62 s) fraß der kalte Ring (59,3 s): die vier Augen
  `M.auge("relief-boden-s1/4/5/6", { ort: "wiese" })` tragen kein px und schießen an der Kamera des Spiels (Planet-Station, Zeile 288 im Zweig punkte-maschine);
  steht sie an einer fernen Pose (formschatz schießt an px-Posen ferner Orte, dort Zeile 2649), stellt /bild den Spieler um
  (scripts/werkbank.cjs:2546).
- Kandidat 2 (der Diff „k2-planet-boden1“ im Stations-Ordner, gefallen mit Kandidat 3, gegen punkte-maschine 6483c403): das Auge AM SPIELER, Blick
  auf den steilsten Hang 20 … 120 m im gebauten Ring (1 ms), EIN Schuss für die vier Auge-Sprossen. Ehrlich offen: `afcProzent`
  rechnet keine Station — R11 urteilt die Prüfer-Akte, und sie braucht ein Foto gleichen Hangs und Klimas und den Korpus der Anteile.

## 27.11. 21:35 UTC — die Linse der Ferne und Kopf 4 (auf main b3740dd5)

- Die Linse (gate:hoehlen-sicht (p), Familie Anschnitt): an jeder Wand des Erdbaus (1 168 Punkte) färbt der Fern-Faden
  (`_fernAuftrag("teile", roh)` → voxel-worker `fernFarbeTeile` → `fernFelsStoff`) wie das Gesetz des Haupt-Fadens
  (`_bodenFarbeAt` + `felsStoffPunkt` mit dem Schutthang der Ferne) — am Kopf 0 von 1 168 fremd (Abstand ≤ 1,3·10⁻⁸). ROT am
  Täter: der alte Zwilling `fernSchutt` (main b3740dd5) färbt 995 von 1 168 Wänden anders, bis 0,137 linear — der Selbsttest
  trägt ihn als Mutanten und nennt „FERNE OHNE GESETZ: … (voxel-worker `fernFarbeTeile`)“. Gate 49 s (vorher 55 s).
- Kopf 4 = Kopf 3 + der Schnitt der Ferne + die Linse, OHNE den Wege-Stempel (er bleibt WIP, seine Frage an den Koordinator
  steht). Probe-Ruf `gate:webgl-probe,bild:dorf@0.5,bild:wiese@0.5,gate:hoehlen-sicht`: bild:buehne@0.5 fällt aus dem Ruf, weil
  es an main b3740dd5 GENAUSO rot ist — Täter mit Datei:Zeile: die Pose spec/profiband/haushalt.json:205 (spieler [300, 0] →
  blick [420, 0], Auge 11,46 m über dem 9,36-m-Plateau) gegen die Fuß-Prüfung scripts/lib/ausgabe-aufnahme.cjs:819 (der Fuß
  des Ziels = Boden + 0,3 m = 1,5 m, in kamera-nah.cjs:291 „Punkt 1“): der Strahl taucht nach 26,3 m unter die Schelf-Kante (Probe: 26,57 m), die Höhen sind byte-gleich an
  main und Kopf. Die Bühne ist ein Fall für den Besitzer des Messorts, nicht für boden-korn. bild:wiese@0.5 sieht Fels, Schutt
  und Ferne (8 Läufe in 10 Tagen am main).

## 27.11. 21:30 UTC — der Schnitt am EINEN Leser: die Ferne trägt das Punkt-Gesetz (Naht 16 → 9 Posen), die Bühne gemessen

- Geschnitten: `voxel-worker.js` `fernFelsStoff` — der Fern-Faden ruft dasselbe `felsStoffPunkt` (gelaende-core.js) wie die Nähe,
  mit `fern` = Schutthang der Höhe; Fels/Steile/hangSchutt legt weiter der Ring-Stoff aus der Masche, das Korn der Nähe geht als
  sein Mittel (`schuttMittel()` 0,514) in die Farbe. Der Zwilling `fernSchutt` und der Moos-Zwilling des Shaders (`geoMoss` ·
  `mossMax`, stamm/daten.js) fielen — Moos ist Gesetz im Scheitel.
- Gemessen (dieselben 30 Posen, Saat 12345, Schale 0 in 60 … 400 m; ΔE > 10 je Klasse vorher → nachher): Anschnitt 200 → 27 von
  201, Fächer 137 → 56 von 417, Moos 311 → 156 von 947; Posen mit Naht (Klassen-Mittel ΔE > 5) 16 → 9 von 29. Ring-Zeit je Pose
  Median 1 718 → 1 671 ms (kein Aufpreis). Ehrlich offen: je Scheitel bleibt das Rauschen der Nähe gegen das Mittel der Ferne
  (Moos-Flecken) — 14 von 29 Posen mit ≥ 1 Punkt über 10.
- Die Bühne (bild:buehne@0.5 ROT an 08e47d8b): Höhen längs des Strahls x 300 … 420, z 0 an main b3740dd5 und am Kopf BYTE-GLEICH
  (Gesetz und Voxel-Fläche). Das Plateau steht 9,36 m (x 300) … 9,28 m (x 326,6), fällt dann auf 2,0 m (x 420). Punkt 1 der
  Abnahme ist der FUSS des Ziels (1,2 + 0,3 m): der Strahl (300, 11,46, 0) → (420, 1,5, 0) taucht nach ≈ 26,3 m unter die
  Schelf-Kante — die Probe sagt 26,57 m. Täter: die Pose (spec/profiband/haushalt.json messort `buehne`, spieler [300,0] →
  blick [420,0]) gegen die Fuß-Prüfung (scripts/lib/ausgabe-aufnahme.cjs ~816) — main wäre gleich ROT; kein Lauf der letzten
  100 gpu-probes trug bild:buehne.

## 27.11. 21:20 UTC — die Naht Nah-Erde ↔ Fern-Mittel an 30 Posen (Zahl zuerst, vor dem Schnitt)

- Messung (Werkbank, die 30 Posen der Station, Saat 12345 in ± 1 500 m): je Pose der Fern-Ring dort verankert
  (`_tickFernRing`), je Scheitel der Schale 0 in 60 … 400 m (ohne Wasser) die gezeichnete Ring-Farbe gegen das Nah-Gesetz am
  selben Punkt (`_bodenFarbeAt` + `felsStoffPunkt`), ΔE (CIELAB, linear). Pose 12 (1250, −784) verankerte nicht neu (zählt nicht).
- Grund ohne Deckung: 112 591 Punkte, im Mittel ΔE 2,4, je Pose 2–6 % über 10 (Pfade, Rausch — das Rauschen der Grenze).
- Die Deckungen von boden#1, die die Ferne NICHT liest (der Fern-Faden mischt nur `fernSchutt`: Boden → Fels-Mittel):
  Anschnitt 201 von 201 Punkten über ΔE 10 (Mittel 19,8; 3 Posen), Fächer 248 von 417 (8 von 9 Posen), Moos 321 von 978 (15 von
  17 Posen). DIE ZAHL: an 17 von 29 Posen zeigt der Ring eine Naht der Erde (≥ 1 Punkt einer dieser Deckungen über ΔE 10).
- Der Schutt des Steilen (806 von 1 543 über 10) ist am Scheitel nicht vergleichbar: der Ring-Stoff legt Fels und den Schutt der
  Kurve im Shader aus der Steile der Masche (`_terrainGeologyAlbedo` `_rockW`, `_hangFern`), nicht in die Scheitel-Farbe.
- Der Schnitt am EINEN Leser: der Fern-Faden (`fernFarbeTeile` → `fernSchutt`) trägt die Deckungen des Punkt-Gesetzes als ihr
  Mittel (Moos, Fächer, Anschnitt) statt eines eigenen Zwillings. boden#3 der Station ist die Mächtigkeit (Kuppe dünner als
  Unterhang, Horizonte) — die Naht liest sie nicht; sie bleibt das Offene von boden#1.

## 27.11. 21:15 UTC — GPU-Probe 08e47d8b: bild:buehne@0.5 ROT („Blickziel verdeckt von Gelände in 26,57 m“) — Kopf 3 rührt keine Höhe

- Der Befund (gtx1050-desktop, Lauf 46065675653): webgl-probe, bild:dorf@0.5 und gate:hoehlen-sicht GRÜN; bild:buehne@0.5 ROT an
  der GEOMETRIE — die Kamera (300, 11,46, 0) blickt 120 m nach +x, an Punkt 1 schneidet Gelände den Strahl in 26,57 m.
- Kopf 3 ändert keine Höhe: die 23 Hunks in gelaende-core.js sind `felsBasis` (die Erde der Palette), das Moos von `felsFarbe`,
  die neuen Gesetze (ortErde, moosDeckung, schuttFaecher, hangSchutt, felsAnschnitt …), `felsStoffPunkt` und die Ausfuhr;
  `hoehe`/`hoeheGrund` (Zeile 3434 ff.) stehen unberührt. stoff-material, gelaende-boden und voxel-worker tragen nur Farbe.
  Die Verdeckung ist damit eine Frage der Bühne an main b3740dd5, nicht dieses Kopfs — Regel 1: das Urteil des Bündels richtet.
