# F2 natur-und-licht

Quelle: die Blätter 09–16 (dieser Ordner). Stichproben an SPIEL (main ec281422), REPO (origin/main 7f778d44), PM (`meisterkarte-quelle/punkte/`).
Mein Auge: `BILD/dorf-main-0.5.png` (Ankunft, Mittag) und `BILD/wiese-mitte/heute-wiese-fov20-rot.png`. Am Dorf sehe ich einen Himmel in tiefem Marineblau mit
fast weißen Wolken. Am Hang über dem Platz liegen gemalte runde Steine ohne Schatten in den Fugen, darüber riesige gelbgrüne Gras-Zacken, die Mittelwand ist
glatt. Der Hauswurf ist blau-schwarz gesprenkelt. Auf der Wiese bilden die Gräser ab ~10 m eine Wand aus Sägezähnen, die Kronen sind verwischt wie
Aquarell, am Horizont stehen dunkle Spitz-Kegel ohne Luft vor einem grau-weißen Himmel.

## Die Schnitte, gereiht

**1 · Wiese: ein Büschel wird nie verformt (Blatt 11) · Aufwand M**
- Mangel im Bild: Zacken-Wand an Auge/Hang (beide Bilder oben), Platten im Kandidaten, Striche vom Dach. Im Takt: Ego +7,3 ms am Kandidaten.
- Wurzel: `stamm/vegetation-wiese.js:574-588` `_wieseFern`, zwei Regler, Streckung s bis `streckMax` 14 (`stamm/daten.js:563`). Die Schale steht bei `daten.js:571-581`
  und `vegetation-wiese.js:610-616`. Selbst-Widerspruch der Quelle: `:561` „nie um s breiter" gegen `:569` „jeden Halm quer um s breiter" (gelesen).
- Entscheidung: die Ferne hat EINEN Regler, die Anzahl. Der Anteil folgt der Lücke des Strahls (Beer-Lambert, μ aus `_wieseFuss` :623-629) bis zur Kappe
  Büschel je Pixel ≤ heute.
- Schnitt mit allen Stufen: streck/spreiz ≡ 1 · `streckMax` und `schale{}` fallen · `_wieseFernGrenzen` :870-915 fällt · Schale-Kette (:1029, :1132-1200,
  :1383) fällt · WGSL `WIESE_WGSL` :593-604 + `PASS_WAHL_WGSL` Art 6/7 · Stoff `_halmFerne` (`stoff-material.js:62-130`), Spreizung und `G.breit` fallen.
  Die Kameras sind Ego · Third · Dorf-Hang · Hügel 12 m · Dach 25 m.
- Leser: die Liste in Blatt 11 Z. 57-67 (Tafel, Schranke, Instanz-Matrix :1218/:1336-1346, vier Kommentar-Orte, vier Linsen im Diff).
- Kosten: Radeon 1920×1080 Ego ≤ 37,5 ms · Third ≤ 27,0 · Dreiecke ≤ 351 275 · Befehle ≤ 93. An den Schirm gebunden, weil die Kappe Büschel je Pixel zählt.
- Kriterien: vegetation.K1#1 (radeon, gtx) ungemessen, Naht 5 m −16,9 / −18,3 % ↔ ≤ 15 %, LAI-Ringe ≥ 1,7, nahWiese ≤ 4 / 80 000 · E (Ego ≤ heute).
- Liegt: `w28-wiese-fern` 476a3ed9 (2 vor, 32 hinter main; berührt phyto-core +42, daten −, stoff-material +36, vegetation-wiese ±530). Die Schale fällt dort
  schon, `halmFerne.breit` 2,5 ist die neue Verformung. Die Probe ist `breit` 1 + `spreiz` 1 am Zweig, dazu das Ego-Paar und fünf Bilder.

**2 · Himmel: die Leuchtdichte der Kuppel (Blatt 15) · Aufwand M (Spike S)**
- Mangel im Bild: tiefes Marineblau über dem Dorf (gesehen). Am Horizont der Wiese steht ein grau-weißer Himmel (fov20, gesehen). Am Dorf verdeckt der Hang
  den Horizont, die Aussage „auch dicht über dem Horizont dunkel" lässt sich dort also nicht prüfen.
- Wurzel: EINE Quelle `welt-licht.js:565` `himmelFarbe = Texel × U.licht × U.toenung`, gemalt von `passHimmel` :538. Die Kuppel liest sie über
  `stamm/bild-himmel.js:249` (gelesen). Der Faktor zwischen Tafel und Pixel ist UNBENANNT.
- Entscheidung: Himmel ÷ 18-%-Karte am Mittag, 90° von der Sonne, 30° Höhe, nach CIE-Klarhimmel 0,35–0,6. Die Bestrahlung (`himmel-licht`,
  `soll-tafel.json:323`) bleibt unberührt und dient als Leitplanke.
- Schnitt: zuerst der Spike mit drei Fällen in EINER warmen Welt über `werkbank licht` (a Marsch zu dunkel · b Faktor im Weg der Kuppel · c Tonkurve).
  Geschnitten wird nur am benannten Ort. Die Stufen sind Kuppel (Auge/Hügel/Dach) · `himmelTafel` (Spiegel) · der Grund der Studio-Bühne (heute schwarz,
  `welt-licht.js:1053ff`, nicht gelesen).
- Leser: Kuppel `bild-himmel.js:249` · fogNode :2307/:2340 (der Dunst der Ferne bewegt sich mit) · PMREM `welt-licht.js:571, 832-837` · Bestrahlung
  :579-603 → Belichtung :667 · Wasser `wasser-hydro.js:820` · `dirigent-ankunft.js:1630` · Bühne.
- Kosten: 0 ms je Bild, kein neuer Pass. Die Tafel zeichnet sich nur bei Wechsel von Sonne, Medium oder Höhe neu (`bild-himmel.js:1610-1635`).
- Kriterien: licht.K2 (1 P) 5,27/5,46 im Band 5–12,5 muss halten · licht.K1 Karte Luma 126 hält · für die Kuppel gibt es KEIN Kriterium, Abgabe ist darum das
  Bildpaar am Dorf.
- Liegt: kein Zweig. Benachbart sind `w27-ferne-ton-5` 155abda9 (537 hinter, berührt fogNode) und `w28-studio-seiten` ad504fbe (die Bühne).

**3 · Steiler Boden: Licht aus dem Fels-Gesetz (Blatt 09) · Aufwand M**
- Mangel im Bild: gemaltes Pflaster am Hang über dem Platz, glatte Mittelwand ohne Bank und Fuge (gesehen, `dorf-main-0.5.png`).
- Wurzel: `stamm/stoff-material.js:1867` `_flatGate = smoothstep(0.55, 0.85, ny)`. Bei :1879 läuft `_mikroRelief(_Tn, _wp)` ohne n, das Relief stirbt also auf
  steilen Flächen (gelesen). Dazu `gelaende-core.js:3665-3671` `schuttKornO` in der Ebene (x, z) (gelesen): an einer 55°-Wand ist jeder Stein 1,74× gestreckt.
- Entscheidung: der steile Boden kippt seine Normale aus demselben Gesetz wie seine Farbe. Der flache Boden bleibt byte-gleich.
- Schnitt (Stufen 1–4 aus Blatt 09): steiler Zweig ruft `_mikroRelief(T, wp, n)` dreiplanar auf · Fuge, Bank und Stein-Kuppe werden Höhe, gekippt über dFdx/dFdy
  wie `_steinStoff` :2802-2827 (Ableitung außerhalb des Zweigs) · `schuttKornO` in der Tangential-Ebene · `_mikroH` → `_mikroStoff` :1935. Absenz:
  `_flatGate` = 0.
- Leser: Blatt 09 Z. 58-63 (:1878 `_lod`, :1880, :1896 normalNode, :1887 Pfütze, :1904-1909 bleibt; `diag-hoehlen-sicht.cjs:1620-1622`,
  `diag-pruefbuehne.cjs:902`).
- Kosten: flacher Pixel 0. Steiler Pixel +4 Atlas-Ladungen, +2 Ableitungen, ~20 ALU. Zu messen: Bild-ms Dorf Ego/Third und WGSL-Zeichen des Boden-Programms
  (K17-3 hat schon einmal die swiftshader-Frist gerissen, Pflicht B).
- Kriterien: material.K2 Ist 1 ↔ 2 (darf nicht brechen, bewegt sich nicht, weil die Station flach schießt) · Pflicht A ohne neue Zeile. Abgabe ist das
  Bildpaar an der Böschung, Auge/Hügel/Dach, Mittag und Nacht.
- Liegt: nichts.

**4 · Station schatten.K3/K4: Prüfkörper auf den gezeichneten Boden (Blatt 16) · Aufwand S · nur PM**
- Mangel im Takt: die Buchung fällt 221 → 219 (UEBERGABE STAND 21:02). K4 an der Ankunft: LA 0,1849 = LB 0,1849, hubM 4,1043
  (`roh/ec281422-radeon/schatten.K4_1.out:64`, gelesen). Am alten Ort c4010773 gilt [-840.7,-866.4], LA 0,1806, LB 0,1375, hub 0,6246 (gelesen).
- Wurzel: PM `stationen/g3.js:1202-1206`. Die Platte liegt auf `M.y + max(hub) + 0,04`, das Auge steht 7 m vor der Wand auf `M.y + 1,7` (:1195, gelesen).
  Bei einem Hub von 4,1 m schwebt die Platte also über dem Auge.
- Entscheidung: die Prüfkörper liegen auf `r._bodenSichtAt` über ihrem GANZEN Fußabdruck. Soll, Schwelle und Maß bleiben.
- Schnitt: K4-Platte als 16×16-Raster auf dem gezeichneten Boden · `platz` prüft den Hang über den Abdruck (2…16 m längs n) · K3-Platz über 4×4 m. K3 mit
  `sicht` < 1 wird UNGEMESSEN beim Namen.
- Leser: `g3.js:1185, 1198-1206, 1253, 2114-2138`, Selbsttest `neunProben`, NEUN-BRUCH-Abdruck. Kosten: 0 ms am Schirm, Probe +~0,1 s.
- Kriterien: schatten.K4#1 radeon Gewinn 0,0 % ↔ ≥ 10 % · schatten.K3#1 Fuß 93,4 % ↔ 30–60 %. Liegt: nichts, PM pusht nur bei SELBSTTEST GRÜN.

**5 · Baum-Karte kopiert ihre Gestalt (Blatt 12) · Aufwand M, Buche L**
- Mangel im Bild: Laib-Kronen, Aquarell, Lutscher (`BILD/ks/bild2/`, nicht selbst angesehen; die Aquarell-Kronen sehe ich in fov20). Im Takt: 10 Landungen in
  13 Tagen an derselben Stufe (kurs-A:69-70).
- Wurzel: origin/main `phyto-core.js` KARTEN_GESETZ :4179-4185 (saumZelle 2,5 · saumBand 8 · saumWeite 3 · saumGestalt [0,15, 0,3]), `karteSaumBand` :4313,
  `karteSaumEigen` :4345, `karteSaumGestalt` :4354 (gelesen, Blatt-Zeilen ±1). Der GPU-Zwilling steht in `stamm/stoff-karte.js:2192-2411`.
- Entscheidung: jede Stufe wählt nach eigener Box-Deckung, M bleibt deckungstreu, der Stamm bleibt zeilenweise. Reißt eine Art, wächst ihr Rand in die
  Gestalt, nie in die Karte.
- Schnitt: Band, Muster und Gestalt-Gewicht fallen in CPU und GPU zugleich (Liste Blatt 12 Z. 69-73) · `w28-stamm-krone` 31f4607c einmischen (138 hinter,
  5 vor) · Buchen-Rand im Wuchs.
- Leser: Blatt 12 Z. 77-84 (impostorMips :4739, `_karteSaumVon` :1541, `_karteAblage` :1822, Goldens, `diag-foundry-impostor.cjs:695`).
- Kosten: Ablage je Karte heute 31,5 / 33,8 ms und 69 Züge, Erwartung darunter (ungemessen). Haupt-Faden ≤ 0,10 ms je Ablage.
- Kriterien: lod.K1#1 Spielgang buche 0,2303 / strauch 0,271 ↔ ≤ 0,22 und frei ≤ 0,007 · lod.K4#1 1,52 % ↔ < 2 % · licht.K3#2 · Pflicht A laub-kante.
- Liegt: `w28-karte-stamm` liegt IN origin/main (merge-base geprüft), das ist die Basis.

**6 · Unterwuchs nach EINEM Licht (Blatt 13) · Aufwand M**
- Mangel im Bild: die Wiese läuft ohne Mantel unter die Kronen (fov20, gesehen: Gras bis an die Stämme, zwei verlorene Büsche).
- Wurzel: `stamm/vegetation-baum.js:1343` liest `_canopyLightAt`. Das ist das Platzierungs-Feld (`vegetation-wiese.js:2963-2995`, gelesen: es nimmt
  `_placementStandAt`, nicht die Kronen). Dazu `vegetation-streu.js:222-226` Schicht „under" ohne Licht (gelesen).
- Entscheidung: EIN Licht (Kronen des Bestands), EIN Gesetz im Kern (`groundCover` + `bodenGewicht`). Wer kein Licht liest, fällt.
- Schnitt: `bodenLicht` byte-gleich nach phyto-core (Labor `phytogenesis.js:1430-1457` und Host `_bodenLichtFeld` lesen es, `UNDERGROWTH` :3712 fällt) ·
  Strauch-Teppich liest Plan-Kronen und `groundCover.shrub`, die Inline-Kopie :1345-1353 und `_canopyLightAt` fallen · Busch-Unterwurf :1610-1660 und Schicht
  „under" fallen.
- Leser: Blatt 13 Z. 66-74 (`diag-stand-takt.cjs:598,621` zieht um, `playtest/vegetation.cjs:1778-1783`, `g3.js:1854`).
- Kosten: 0 je Bild, Arbeit beim Pflanzen. Zu messen: Haupt-Faden `_forestPlantChunk` an der GTX kalt (Pflicht B), Draws und Dreiecke mit `werkbank zaehlen`.
- Kriterien: vegetation.K3#1 0/2 (am Messort 24 Stämme/ha, Deckung 0,0293, an ec281422 ausgelassen) · oekologie.K1–K5 halten · Bildpaar Waldrand.
- Liegt: kein Zweig.

**7 · Die Ferne tauscht nur ganz (Blatt 10) · Aufwand M**
- Mangel: nicht im Bild gesehen. Der Re-Anker ist gelesen: `stamm/bild-sicht.js:2824-2828` setzt Anker und `uAnker` sofort. `gelaende-fern.js:1944-1955` setzt
  nur Cursor und vollY zurück, sichtbar wird nur beim ersten Ring (`:2003-2005`). Die Kamm-Krone leert die Sektoren (:611-614) und baut nach JEDER Antwort neu
  (:641-642) (alles gelesen).
- Entscheidung: der neue Anker wird hinter dem Bild ganz aufgebaut und in EINEM Takt getauscht. Vorbild ist die Fern-Karte :1714.
- Schnitt: Ping-Pong der Ring-Geometrien · Tausch von Lage, `uAnker`, Maske, Teilung · die Kamm-Krone baut erst, wenn `sektoren.every`.
- Leser: Blatt 10 Z. 73-77. Kosten: Draws ±0, Programme ±0, GPU +≈1,1 MB (gerechnet).
- Kriterien: keins misst den Re-Anker. ferne.K3 (kamm 29 ↔ ≥ 100) bewegt dieser Schnitt nicht. Abgabe: Dorf 3 Boots und Gang 200 m.

**8 · Wasser: eine Optik je Körper (Blatt 14) · Aufwand M–L**
- Mangel: an der Ankunft gibt es kein Wasser (`dorf-main-0.5.png`, gesehen). Am See ist kein Grund zu sehen (nur Blatt 14).
- Wurzel: `stamm/bild-sicht.js:1447` exp(−wK·(wegM + aDepth)) und `:225-227` `_wasserKoerper` aus `WG.wK` (gelesen). wK 6,5/2,0/1,2 ist eine Look-Zahl
  (`foundry-core.js:146`). koerper see/bach/fluss steht bei :172, koerperStreu 0,1 bei :162 (gelesen). Nachgerechnet: 2 m Weg ergibt Luma 0,0196 mit wK
  und 0,605 mit bach.c.
- Entscheidung: `WASSER_GESETZ.koerper[gewaesserArt]` ist die Optik jedes Welt-Lesers, wK nur für das Studio. Absenz: `.wK` in stamm/ = 0.
- Schnitt: die Stufen 1–6 aus Blatt 14 (bb je Art additiv · `aArt` in beiden Sheet-Bauten · Stoff · Fern-Ring · Gefäß · Fläche von unten).
- Kosten: 4 B je Vertex, 3 vec3-Mischungen je Fragment. Kriterien: leib.K3 1 ↔ 2 · gelaende.K3 spiegelTreue ≥ 0,6 hält · luftwasser.K3 hält.

## Kopplungen (Reihenfolge ohne Kreis)
- **phyto-core.js** tragen 1 (wiese-fern +42), 5 (Karte :4170-4900) und 6 (neues `bodenLicht`). Die Bereiche sind getrennt, die Datei aber ist dieselbe.
  Reihenfolge 1 → 5 → 6, jeder auf dem gelandeten Vorgänger.
- **stoff-material.js** tragen 1 (`_halmFerne` :62-130, Zweig +36) und 3 (:1858-1935, :3055-3096). 1 landet zuerst. Das Bildpaar von 3 an der Böschung ist erst
  lesbar, wenn die Gras-Zacken von 1 weg sind. 1 TRÄGT also 3.
- **2 Himmel** bewegt im Fall (a) Umgebung, Bestrahlung und Belichtung. Damit ändert sich jedes Bildpaar von 3, 5, 6, 8 und den Dunst von 7. Der Spike von 2 läuft
  früh und braucht keinen Code der anderen. Fällt der Schnitt in Fall (a), werden die Vorher-Bilder der anderen neu geschossen.
- **4 Station** ist reiner PM-Code, ohne Kopplung ans Spiel. Läuft parallel zu allem. 6 erbt von ihm den Befund des Messorts (vegetation.K3 sucht ±60 m).
- **8 Wasser** liest die Himmels-Tafel (`wasser-hydro.js:820`), deshalb steht es nach 2. Mit 7 teilt es nur `gelaende-fern.js`, in getrennten Zeilen (:1482-1496
  gegen :443-453/:1944).
- **3 und w28-weg-koerper:** `diff --stat origin/main...origin/w28-weg-koerper` berührt stoff-material.js NICHT (nur daten.js +2 aus meiner Liste). Kein
  Zwang zur Reihenfolge.
- Reihenfolge: 4 ∥ Spike 2 → 1 → 3 → Schnitt 2 → 5 → 6 → 7 → 8.

## Widersprüche zwischen den Blättern und was die Quelle sagt
- **16 gegen 13, Zeitpunkt des Ort-Sprungs:** Blatt 16 nennt PM ab71fe5be und ec281422 als erste Fahrt. Die Quelle widerspricht: `roh/350e6b11-radeon/
  schatten.K4_1.out:64` (eingecheckt PM e991ba19c, 12.11. 20:55) misst schon an [-704.2,-880] mit LA 0,1836 = LB 0,1836 und hubM 4,1043. ab71fe5be ist
  13.11. 19:02 eingecheckt. Blatt 13 („ab 350e6b11") hat recht. Der Befund von 16 wird dadurch STÄRKER, denn die gleiche Null stand schon vor z424–z426. Warum
  221 trotzdem gebucht war: nicht gelesen (Ratsche vermutet).
- **16 gegen 15, der blau-schwarze Wurf:** Blatt 16 vermutet „dunkler Mittags-Himmel". Blatt 15 belegt, dass die Bestrahlung im Band liegt (Diffus 0,19,
  `soll-tafel.json` himmel-licht). Die Füllung des Schattens kommt aus der Bestrahlung, nicht aus dem Pixel der Kuppel. Ursache offen. Die Kuppel ist als Täter
  des Wurfs nicht belegt.
- **12 gegen UEBERGABE §4:** „karte-stamm fährt in z427" ist überholt, der Zweig ist Vorfahre von origin/main 7f778d44 (geprüft).
- **11, Selbst-Widerspruch der Quelle** `vegetation-wiese.js:561` gegen `:569`: gelesen, beide Sätze stehen da. Der Schnitt 1 löst ihn auf.
- **10 gegen kurs-B, ferne.K3-Kohärenz:** 0,367 und 0,2671 gelten an verschiedenen Orten, beides wahr (Blatt 10 Z. 104).
- **12 gegen FUND:219:** „Buche trägt keinen Rand" (0,544/0,632) ist ein anderes Maß als Spielgang 0,197/0,2303. Nicht verglichen.

## Gestrichen
- Blatt 16: „Der Sprung ist die punkte-maschine selbst: PM-Commit ab71fe5be … Erste Fahrt danach: ec281422". Die Messung am 350e6b11 widerlegt es (siehe oben).
- Blatt 11: „vom Hügel/Dach ist Q bei gleichem Abstand größer". Die Quelle `vegetation-wiese.js:619-622` sagt flach S = h, Q = dist. Das Auge über dem eigenen
  Grund geht durch S wieder heraus, und aus einer Hügel-Kamera über tieferer Wiese wird Q kleiner. Der Grund für den Kreis an der Wiese ist die Verformung
  selbst, nicht h.
- Blatt 09: „Kollision nur möglich in stoff-material.js" mit w28-weg-koerper und „weg-koerper zuerst landen". Der Zweig berührt die Datei nicht (diff --stat).
- Blatt 15: „derselbe dunkelblaue Himmel auch am Horizont" (heute-wiese). Im fov20-Bild derselben Wiese ist der Horizont grau-weiß, am Dorf verdeckt der Hang
  den Horizont.

## Ehrlich offen
- Der Faktor zwischen Himmels-Tafel und Pixel (2) ist ungemessen. Die Rechnung 0,46 ist ein Überschlag, kein Trace.
- Der Fächer am Dorf als halber Ring (7) ist nicht bewiesen. Wie lange ein Re-Anker nachfüllt und ob die Ankunft einen Re-Anker trägt: nicht gelesen.
- Wiese (1): ob die Kappe Third 20–40 m satt hält, ohne nahWiese ≤ 80 000 zu reißen, ist ungemessen. Die Büschel auf dem Fels am Dorf-Hang (Maske
  `_wieseGrund`) sind nicht gelesen.
- Baum (5): die reine eigene Deckung ohne `saum` ist ungemessen. Das Aquarell im INNEREN der Krone löst der Rand-Schnitt nicht (BC1 oder die Zelle 128×256,
  ungemessen). lod.K5 Baum 3,12 px ↔ ≤ 1 px bleibt stehen.
- Steiler Boden (3): die senkrechten Schlieren und weißen Zacken der Mittelwand haben keine benannte Ursache. Der Absatz des Erdbaus (bis 4,8 m Stufe) ist
  Gestalt, nicht dieser Schnitt.
- Station (4): K3-Sockel 4,6 % (Hang oder Bewohner im Blick, Sicht 0,6) und schatten.K5 am selben Ort sind ununtersucht.
- Unterwuchs (6): vegetation.K3 findet am Ankunftsort keinen Wald (±60 m gegen Dorfrand ≈ 173 m). Der Schnitt bewegt das nicht.
- ferne.K3 an der Wurzel (Merge 4f4b15a4): Mechanismus ungemessen. Radeon-Absturz Exit 3221226505 ist unbenannt und sperrt leib.K3#2 und gelaende.K3 an der
  Radeon (8).
- Nicht selbst angesehen: `BILD/ks/bild2/*`, `BILD/studio-welt/*`, die See-Pose aus PM `gegenlauf`. Nichts gemessen (keine GPU in diesem Lauf).
