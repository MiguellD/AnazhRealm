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
