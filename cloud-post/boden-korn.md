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
