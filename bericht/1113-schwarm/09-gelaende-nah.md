# 09 Gelaende nah: Boden-Stoff, Fels, Boeschung, Erdbau

## Was der Spieler sieht (mit Bildpfad; sonst „kein Bild gesehen")
- `scratchpad/genom-spiel/eng-rot.png` (Dorf der Ankunft, Mittag, Auge): hinter den zwei Bewohnern steigt die Boeschung des Dorfs. Auf ihr
  liegt ein Muster runder, grau-brauner „Steine", gleich hell im Inneren und am Rand, ohne einen Schatten zwischen ihnen und ohne Kante im
  Licht — ein auf die glatte Flaeche gemaltes Pflaster. Oben im Bild wird dieselbe Wand weich und dunstig, die Steine laufen ineinander.
  Ueber der ganzen Boeschung stehen grosse flache gelbgruene Gras-Zacken. Der Platz-Boden davorn: brauner Grund mit feinem dunklem Sprenkel,
  liest sich als Teppich.
- `scratchpad/dorf-main-0.5.png` (Dorf, Mittag, etwas hoeher): links dasselbe gemalte Pflaster-Band; in der Mitte eine fast senkrechte
  Wand, glatt braun-grau, mit senkrechten Schlieren und zwei weisslichen Zacken-Flecken (bei ~920/270 und ~1090/300); keine Bank, keine
  Fuge, keine Kluft ist zu sehen, obwohl das Fels-Gesetz sie traegt. Unten auf dem Platz violette verwaschene Streifen (Wege, Karte 33).
- Nicht gesehen: dieselbe Wand bei Nacht, im Regen, aus Huegel- und Dachhoehe.

## Was die Quelle sagt (Fakten mit Datei:Zeile und Zahl; was das Gesetzbuch KANN gegen das, was die Welt davon KONSUMIERT)
KANN (Gesetz `gelaende-core.js`, Wurzel SPIEL):
- `FELS` :3300–3361 — Pakete 5,5 m, Baenke 0,9 m (Maechtigkeit 0,35–2,2×), gewellte Fugen als KANTE (Kehle 0,1 m dunkel, Oberkante
  0,08 m hell), zwei Kluft-Scharen 3,2 m, Rinde an konvexen Kanten, Flechte, Moos; Gerölle `geroell` korn 0,7 m mit Kuppe 0,9 und
  klaffender Fuge (tiefe 0,95) :3360. Ein Rechenwerk fuer Vertex und Pixel: `felsFeinO` :3640, `schuttKornO` :3665.
- `_mikroRelief(T, wp, n)` (`stamm/stoff-material.js:2664`) traegt mit Normale n ein dreiplanares Relief (|n|^4-Gewichte :2712–2724).
  `_steinStoff` :2779 zeigt, wie eine Fuge aus dem Gesetz zur NORMALE wird (Flächen-Gradient aus dFdx/dFdy, Mikkelsen 2010, :2802–2827).
KONSUMIERT (die Welt):
- Der Fels der Foundry (Formationen) liest Relief: `stoff-material.js:900` `_mikroGestalt`; das Studio auch (`studio-stoff.js:628`).
- Der Fels des BODENS (Kliff, Schutthang, Erdbau-Wand, Hoehle) liest NUR Farbe. Die Normale des Bodens kippt nur auf flachem Grund:
  `_flatGate = smoothstep(0.55, 0.85, ny)` (`stoff-material.js:1867`) — unter ny 0,55 (steiler als ~57°) ist das Relief 0, und es nimmt
  die Ebene (x, z) ohne Normale (:1879, Zweig `if (!n)` :2708). Bänke, Fugen, Klüfte und Steine des Gesetzes sind im Boden ein reiner
  Albedo-Faktor (`_feinV` :3086, `_rockCol` :3089, `_kornFern` :3094–3096) — sie sehen kein Licht.
- Der Schutt des Erdbaus: jede Wand des Erdbaus (Boeschung, Kante, Absatz) traegt den Schutt mit vollem Gewicht 1
  (`gelaende-core.js:5361–5366`, `erdbauWand` :2437). Die Boeschung ist tan 0,6 = 31° (`ERDBAU` :2045) → ny 0,857: der Schutt liegt dort
  voll, das Relief kippt mit der xz-Ebene — also ein Pflaster-Muster in der Farbe auf einer weichen Flaeche mit Wiesen-Relief darunter.
- `schuttKornO(o, x, z)` rechnet die Steine in der Ebene (x, z) (:3665–3671): an einer 55°-Wand ist jeder Stein 1/cos 55° = 1,74× senkrecht
  gestreckt, an 75° 3,9× — eine Quelle senkrechter Schlieren (an der Mitte von `dorf-main-0.5.png` nicht gemessen).
- Der Boden-Fels traegt den Ton im Vertex nur bis zur Kante 1,8 m (`FELS_STOFF.netz.fuss`, `stamm/gelaende-boden.js:2909`); Baenke
  traegt der Pixel-Term ganz bis 120 m, Fugen bis 30 m (`fein.fern`, `fugeFern` :3353).
- Schwellen: Fels ab Steile 0,42 (≈55°) voll ab 0,7 (`stamm/daten.js:669–670`), Schutt-Kandidat 0,08 (≈23°) :676, Bump voll bis 14 m,
  aus bei 95 m (`daten.js:747–750`).
- Gemessen wird der steile Boden von KEINER Station: material.K2#1 schiesst „fels" = `formationenSatz`, nicht den Boden
  (PM `punkte/stationen/g3.js:160`); die Soll-Tafel-Zeile `fels` misst nur Albedo 0,1–0,3 der Formationen (`spec/abnahme/soll-tafel.json:2332–2364`).
  Die gelaende.K1–K5 messen Hoehe, Wasser, Fuss (PM `src/g1.js:21–60`), kein Bild des Hangs.

## Die EINE begrenzende Entscheidung
Der steile Boden (Kliff, Schutthang, Wand des Erdbaus, Hoehle) bekommt sein Licht aus DEMSELBEN Gesetz wie seine Farbe: die Normale des
Boden-Stoffs liest auf steilem Pixel `_mikroRelief(T, wp, n)` dreiplanar und kippt an Fuge, Kluft und Stein-Kuppe des Fels-Gesetzes —
`_flatGate` faellt. Kein neues Gesetz, kein Regler, keine Schwelle bewegt; der flache Boden bleibt byte-gleich.

## Der Schnitt (die Klasse ganz: Stufen · Leser-Liste mit Datei:Zeile · Kosten-Zeile · Kriterien der Meisterkarte mit Id, Ist ↔ Soll, Station)
Stufen (alle in EINER Welle, jede an Auge, Huegel, Dach angesehen):
1. Steile Flaeche → dreiplanares Mikro-Relief: im Boden-Normal-Knoten (`stoff-material.js:1858–1882`) ein Zweig nach der Steile
   (`_zweigTSL`, wie :3086): flach (ny ≥ 0,85) der heutige Ebenen-Pfad byte-gleich; steil `_mikroRelief(_Tn, _wp, _nWahr)` mit Blende
   `smoothstep(0.55, 0.85)` statt Null. `_flatGate` stirbt (Absenz-Grep `_flatGate` = 0).
2. Fuge, Kluft, Stein als Licht: `_terrainGeologyAlbedo` reicht ihren Fels-Term als Hoehe hinaus (Out-Parameter wie `roughOut.gruen`
   :3234): h = Kante/Bank aus `_feinV.y`/`.x` × `_rockW` + Kuppe aus `_feinV.z` × `_kornW`; die Normale kippt gegen seinen
   Flächen-Gradienten aus dFdx/dFdy — dieselbe Rechnung wie `_steinStoff` :2802–2827, Blende `_nahF`/`_kornSicht` wie die Farbe.
   Die Ableitung steht AUSSERHALB des Zweigs (WGSL-Uniformitaet).
3. Der Stein in der Ebene des Hangs: `schuttKornO` bekommt die Lage in der Tangential-Ebene (dominante Achse der Normale) statt (x, z);
   `schuttMittel` :3701 bleibt (Mittel ueber eine Flaeche), der Vertex ruft schuttKorn nicht (nur Gewicht, :5311).
4. Das Himmels-Bild folgt: `_mikroH` (:1881) traegt die Hoehe der steilen Stufe in `_mikroStoff` (:1935) — die Fuge wird im Schatten dunkel.
Leser-Liste (vor dem Schnitt gegreppt):
- `stamm/stoff-material.js:1867` `_flatGate` → :1878 `_lod` → :1880 `_baseN` → :1896 `mat.normalNode` (PBR-Licht des Bodens)
- :1881 `_mikroH` → :1935 `_mikroStoff` (aoNode Himmels-Bild, colorNode Korn) · :1887 Pfuetze mischt `_baseN` (nur flach)
- :1904–1909 `_zu` (Zuwendung des Schattens) liest `_nWahr`, NICHT `_baseN` — bleibt
- :3055–3096 Fels-Term `_felsFn`/`_feinV` (Quelle der Hoehe) · :2664 `_mikroRelief` (geteilt mit :2766 `_mikroGestalt`, :2825 `_steinStoff`)
- `gelaende-core.js:3665` `schuttKornO` (Leser: stoff-material :3074, `scripts/diag-hoehlen-sicht.cjs:1622` (m) Rechenwerk-Gleichheit)
- `scripts/diag-pruefbuehne.cjs:902` (felsFein ohne Layout) · `scripts/diag-hoehlen-sicht.cjs:1620` (felsFein Zahl = Shader)
- Zweig `w28-weg-koerper` b1ffbea3 („Kante im Boden-Stoff") — Farbe der Wege, nicht die Normale; Kollision nur moeglich in stoff-material.js
Kosten-Zeile: flacher Pixel 0 (byte-gleich im Zweig); steiler Pixel +4 Atlas-Ladungen (3 Ebenen × 3 Oktaven = 9 statt 5) + 2 Ableitungen
+ ~20 ALU. Gemessen werden: Bild-ms p95 Dorf Ego und Third vorher↔nachher (Pflicht E, Soll nicht ueber heute) und die WGSL-Zeichen des
Boden-Programms (K17-3: 96 050 → 149 521 riss swiftshader-Frist) — Kosten am Schirm, nie an der Weltgroesse.
Kriterien der Meisterkarte:
- material.K2 (Mikro-Detail bis Armlaenge): Ist 1, Station material.K2#1 radeon gruen (boden 0,5 m glatt 0,0712 · fels 0,0027,
  dc9eacb0); Soll 2 verlangt mehr Klassen. Der Schnitt bewegt den Ist NICHT, solange die Station den Boden nur flach schiesst — er darf
  ihn nicht brechen (boden byte-gleich, fels = Formationen unberuehrt).
- Pflicht A (AAAA je Klasse, Soll-Tafel): Zeile `fels` (Albedo 0,1–0,3) bleibt; der steile Boden hat keine Zeile — keine neue Zeile
  in dieser Welle (kein Apparat), das Mass ist das vorhandene Arm-Urteil (`werkbank bild --arm 0.5/1/2`, nyquist ≤ 0,12, glatt ≤ 0,10)
  an der Boeschung des Dorfs, als BERICHT (vorher↔nachher), nicht als Tor.
- Abgabe = Bildpaar an fester Kamera im Dorf der Ankunft (ort:4291161376, -704/-886; Kameras `huegel -728 +11 -862 → -704.2 +0.5 -881`,
  `dach -705 +9 -871.5 → -703.5 0 -884` und Auge auf die Boeschung, aus dem Commit von w28-weg-koerper), Mittag und Nacht.

## Was schon liegt (Zweig, Kopf, was fehlt bis zur Landung)
- Nichts zu diesem Schnitt. Gelandet und nur Vorarbeit: `w13-fels-korn` fe2501a7 (Relief der Facette der Formationen, 0 vor main),
  `material-mikro`/`mk2-mikro` (Oktaven am Schirm), `w27-boden-nah-2` (Himmels-Bild stetig) — alle auf main.
- `w28-weg-koerper` b1ffbea3 (WIP, 62 Commits vor main, 34 Dateien): beruehrt `stamm/gelaende-boden.js` (+26), `voxel-worker.js`
  (+128), Erdbau (Gehsteig als Trasse) — Erdbau-Wand des Gehsteigs (0,12 m) liegt unter `wandM/2` = 0,25 m, faellt also NICHT in den
  Schutt (`gelaende-core.js:2444`). Reihenfolge: weg-koerper zuerst landen, dieser Schnitt danach auf main.
- Fehlt bis zur Landung: Bau der vier Stufen, Bildpaar Dorf (Auge, Huegel, Dach; Mittag, Nacht), Kosten-Zeile, Code-Check.

## Ehrlich offen (nicht gelesen, nicht gemessen, Widersprueche)
- Die senkrechten Schlieren und die weissen Zacken-Flecken in `dorf-main-0.5.png`: Ursache NICHT benannt (Kandidaten aus der Quelle:
  der in z gestreckte Stein, die Glaettung `_voxelLaplacianSmoothPositions` gelaende-boden.js:2173 an einer Kante, Vertex-Flechte λ 2,4 m).
- Der ABSATZ des Erdbaus: endet der Kegel an `reichweiteM` 16 m (`gelaende-core.js:2199`), steht dort eine senkrechte Stufe der Hoehe
  (tan Hang − 0,6) × 16 m — am 42°-Dorfhang (stoff-material.js:3033) bis 4,8 m. Ob die glatte Mittelwand diese Stufe ist: nicht gemessen.
  Die Stufe ist Gestalt, nicht Stoff — sie ist NICHT Teil dieses Schnitts und wird hier nicht als OFFEN-Eintrag erfunden.
- Gras auf der Boeschung trotz Wand-Schutt 1 (K66 sagt: keine Halme auf der Boeschung) — die Zacken in eng-rot stehen dort; Leser nicht
  gelesen (gehoert zu `w28-wiese-fern`).
- Nicht gelesen: `voxel-worker.js` buildChunkMesh ganz, `stamm/gelaende-chunks.js`, `stamm/gelaende-kollision.js`, `stamm/gelaende-fern.js`
  (Fern-Ring: dort traegt das Relief jenseits 95 m ohnehin nichts), `_zweigTSL`, `_bodenStufenKnoten`.
- Ob dFdx/dFdy im 2×2-Quad die Kehle (0,1 m) noch traegt: ab ~30 m (fugeFern) blendet sie aus; naeher nicht gemessen.
- Bild-ms und WGSL-Zahl vorher: nicht gemessen (keine GPU in diesem Lauf).

## Rang (Wirkung im Bild oder im Takt 1–5 · Aufwand S/M/L · Risiko in einem Satz)
Wirkung 4 (die Boeschung steht hinter jedem Ankunfts-Bild im Dorf; Labor-Fels traegt Relief, Welt-Fels nicht) · Aufwand M (eine Datei
stoff-material.js, eine Funktion im Kern) · Risiko: das Boden-Programm waechst (Kalt-Uebersetzung, Pflicht B) und eine Ableitung im
falschen Zweig bricht die WGSL-Uniformitaet — beides vor dem Bild mit WGSL-Zahl und Code-Check pruefen.
