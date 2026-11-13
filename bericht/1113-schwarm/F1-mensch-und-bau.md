# F1 mensch-und-bau

Verdichtet aus den Blättern 01–08, Stichproben am Code von main ec281422 (Baum leib-kanon-urteil); origin/main steht auf 7f778d44.
Zweig-Köpfe per ls-remote am 13.11. abends: w28-leib-nah **a9a3d136** (nicht ace30e73: main gemischt 694b85d2 + Format), w28-mp-boden
**77c31f1a**, w28-stadt-grammatik **45290d87** (mischt mp-boden), w28-fassade b038852b, w28-stoff-fuge 212b6de9, w28-weg-koerper b1ffbea3.

**Vorweg, der Befund, der alle Bildpaare trifft:** Das „Dorf der Ankunft" aller Bilder (genom-spiel/, mensch-paar/, dorf-main-0.5.png)
ist der MESSORT `dorf`, die Zelle −4,−4 mit 13 Häusern, Spieler bei −841/−861 (spec/profiband/haushalt.json:123–131; Kameras −705/−880
im Rezept bildpaar-im-spiel-rezept.md:13), also etwa 1,2 km vom Genesis-Ort 0/0. Der Spieler kommt am Prüfplatz an und blickt nach
Norden (fachwerk-core.js:10153 `pol(50, a(0))`, achseGrad 90 :9589). Das Start-Dorf liegt an k5 bei −54/−182 hinter dem Wald-Gürtel
r 32–55 (:9596, :9648, :9756). Am Ort der Ankunft sieht der Spieler also KEINEN dieser Menschen und KEIN dieser Häuser. Entscheidung:
Die Nah-Schnitte 1–6 nehmen ihr Bildpaar weiter am Messort dorf ab, weil das Auto-Dorf dort denselben Spielpfad fährt, und sie nennen ihn
beim Namen. Schnitt 7 bringt die Stadt an die Ankunft.

## Die Schnitte, gereiht (höchstens 10)

**1 · Kleid: EINE Quelle, die gehobene Haut (Oberteil, Hose, Menge, Schuh)** · Aufwand M
- Mangel im Bild: Der Oberkörper ist ein Ballon, an Achsel und Flanke Fetzen (frontal.png: Sandfarbener, Lappen an den Hüften;
  probe-post/w28-leib-nah/7-paar-nah-heute-kandidat.jpg links). Rechts im Kandidaten: keine Fetzen, Saum als Linie, Hals frei.
- Wurzel: koerper-core.js:254 `dicke: top === "poncho" ? 0 : 0.032` → foundry-core.js:9355 `backeHuelle(…, z.abstand)` (gelesen).
- Entscheidung: Das Kleid hat EINE Gestalt-Quelle, `__stoffAusHaut`. `backeHuelle` stirbt als Weg für das Kleid GANZ.
- Schnitt: Stufe 0/1/Menge der Oberteile liegt in w28-leib-nah (Zweig :268 `poncho ? 0.05`). Der Schuh kommt in DENSELBEN Zweig vor dem
  Abgabe-Kopf: Am Zweig ruft foundry-core.js:9408 `backeHuelle` weiter für jede Zone ohne `dicke`, also nur noch den Schuh
  (koerper-core.js:290–302, `sohle:true`). Der Schuh wird Stoff aus der Fuß-Haut (`fussHaut` foundry-core.js:9801, `__imKleid` :9361)
  mit Schaft und Sohle als Linie; in der Menge `z.sohle` (main :7089) auf `dicke`. Absenz-Grep `backeHuelle(` im Kleid-Pfad = 0.
- Leser: Rumpf von ace30e73 (10 Leser) + Blatt 02 Z.58–62 (Sohlen-Pressung :9431–9460, `armAnlage` koerper-core.js:4488, Tuch-Wahl
  koerper-fahrt.js:269–285, Trachten mit Schuh fachwerk-core.js:3288–3295).
- Kosten: Oberteile gemessen GTX 1050 Dorf `lauf 15` Frame p50 16,69 → 16,68 ms, Dreiecke 492 889 → 495 464 (erwachen/gtx1050-2026-11-13.md).
  Schuh: ungemessen, Budget je Leib 39 992/40 000 am Zweig (sehr eng).
- Kriterien: haar.K4#1 „Schnitt 16,6 % (≥ 5 %)" am neuen Poncho ungemessen, Pflicht vor Abgabe · haar.K4#2 Durchdringung 0 · leib.K2
  Fuß p95 1,2–1,4 cm (die Sohle darf ihn nicht heben) · mensch.K4#1/#2 halten.
- Bildpaar: Messort dorf vorn/hinten ≤ 3 m + EINE Tracht mit Schuh (mittelalter) an fester Kamera.

**2 · Kopf-Umriss: die Kalotte trägt die Breite (L0, L1, Satz, Wurf)** · Aufwand M
- Mangel im Bild: genom/c-bau/k-nackt-vorn-07.png — ich sehe ein nach oben spitzes Ei, Lappen an Schläfe und Ohr auf Augenhöhe.
- Wurzel: koerper-core.js:2196 Schädel `skullBaseR*1.03`, :2197 Schläfe `s(0.2,…,[0.62,…])` bei x ±0,36 → Außenkante 0,484·0,86 = 0,416
  gegen Schädel 0,402·0,86 = 0,346; Kappe :1409 `sc: [1+dk, sy+dk, 1+dk]` → 0,373 < 0,416 (nachgerechnet, nicht am Guss gemessen).
- Entscheidung: Die Breite des Kopfs gehört der Kalotte, das Haar liegt seitlich auf ihr.
- Schnitt: `MENSCH_GESTALT.schaedel.breit` → :2196 quer; :2197 und Ohr :2220 folgen; `haarKappe` :1409 liest die Breite, HAAR_KAPPE :1382
  verteilt Dicke auf die Seite; Nacken-Wulst :2185–2186 im Seitenbild prüfen. Eine Quelle für L0 (foundry-core.js:9618), L1 (:9820),
  Satz und Wurf (:7048), Leib-Raum (:7291).
- Leser: Blatt 03 Z.45–54. Kosten: Dreiecke/Draws gleich (Zeilen koerper-core.js:48–60); Guss-ms von `_ofenMenschTemplate` vorher↔nachher.
- Kriterien: mensch.K4 2/2 halten (kopfB [0,078; 0,096] diag-mensch-anatomie.cjs:117) · haar.K2 0/2 (0,318 ↔ ≥ 0,3554) berichten ·
  haar.K1 1/2 halten. Liegt: kein Zweig.

**3 · Stand des Bewohners: der gezeichnete Boden über den EINEN Stand-Leser** · Aufwand M
- Mangel im Bild: frontal.png links — der Gehende im weißen Hemd hängt mit Zehen nach unten über der Böschungskante, Schatten daneben.
- Wurzel: siedlung-bewohner.js:2246–2250 (Gesetz-Grund mit 0,5-m-Merkstelle, `_bewohnerTritt`) und :917; in der Datei kein
  `_standSicht`/`_fussBoden`/`_bodenSichtAt` (Grep 0); `_gaitTick(…, null)` an :976, :1557, :1708–1709 (gelesen).
- Entscheidung: Der Bewohner steht auf dem gezeichneten Boden über `_standSicht` (koerper-leib.js:588) wie Spieler und Tier; das Gesetz
  bleibt Träger (`b.traegerY`).
- Schnitt: Ursprung an :917/:2250 → `_standSicht(x, z, t, struktur) + fuss`, Sim-Sohle liest `b.traegerY`; Nah-Wahl bekommt Fuß-IK
  (`_gaitBodenY` :606 liest heute `this.state._kapselTraegerY`, also nur den Spieler → Leib als Parameter); Satz und Feld erben den Ursprung.
- Leser: Blatt 04 Z.74–78. Kosten: eine Karten-Lesung je Schritt; IK ≤ 2×6 Proben je lebendem Leib; CPU-Takt p95 am Dorf vorher↔nachher.
- Kriterien: keines zählt die Sohle des Bewohners; mensch.K3#1 Durchdringung 0 halten; berichtete Zahl Sohle über `_bodenSichtAt` p95.

**4 · Leib-Stufen nach dem Schirm: L1 wird gezeigt** · Aufwand S
- Mangel: L1 (14k, Gesicht, Finger; 13-grobstufe-poncho-hemd.jpg) wird nie gezeigt: Nah-Wahl `nahM` 8 / `nahLeiber` 4
  (siedlung-bewohner.js:3482–3484, :1492, :1504), L1 erst ab `ab: 40` (koerper-core.js:49) — beides gelesen.
- Entscheidung: Die Stufe wählt der Schirm. Schnitt: Kreis bis zur Feld-Grenze (19,8 m bei 1080 p), Rang 1–2 L0, Rang 3–7 L1, Gang auch an
  L1 (`haltungFest` :862 hält die Pose, koerper-leib.js:427).
- Leser: Blatt 01 Z.68–79 (inkl. diag-mensch-anatomie.cjs:298/:320, kreatur-proben.cjs:2469/:2644/:2979, die `nahM` lesen).
- Kosten: 2·40k + 5·14k = 150k ≤ 160k Dreiecke, +14 Draws (gerechnet); CPU je lebendem Leib UNGEMESSEN — Abgabe nur, wenn CPU-Takt p95
  am Dorf Third nicht über heute. Kriterien: mensch.K4#1 (L0 an Rang 1), mensch.K1, lod.K1 (Soll nicht gelesen).

**5 · Fenster: der Schlaf-Würfel steuert nur die Glut, nie die Scheibe** · Aufwand S
- Mangel im Bild: frontal.png — am weißen Haus vier Fenster der Front grau, eines oben rechts fast schwarz-navy: Schachbrett.
- Wurzel (gelesen): fachwerk-core.js:1062 `fensterSchlaeft(...) ? 'glasdunkel' : 'glas'`; :1938 `glasdunkel` 0x2b4457 opacity 0,92;
  :1920 `glas` 0x33576a 0,42; L2 erbt über :2469–2470 `da = M.glasdunkel.opacity`; FENSTER_SCHLAF 0,45 :2426.
- Entscheidung und Schnitt: `M.glasdunkel` nimmt Farbe, Deckkraft, Rauheit von `M.glas`, ohne Licht-Datum (:1946). Eine Zeile, alle Stufen.
- Leser: Blatt 06 Z.53–57. Kosten: 0 Dreiecke, 0 Befehle; mehr Transparenz nur in Fenster-Pixeln. Kriterien: siedlung.K1#2 (0,081 ↔
  ≥ 0,15) bewegt sich nicht; Goldens v6 haeuser.json (Vertrags-Akt). Fährt AUF w28-fassade b038852b, nie daneben.

**6 · Weg als Körper, Erd-Gasse mit Spur und Rinne aus dem Kern** · Aufwand M
- Mangel im Bild: dorf-main-0.5.png — ein brauner Grund ohne Kante zwischen Gasse, Platz und Hausgrund.
- Wurzel: siedlung-wege.js:921 `mix(…, P.dirt, _erde)` linear, Rand `randM` 0,6 (:1880) — gelesen; Labor fachwerk.js:324 Mittelrinne
  −0,026 und :337 Spurrillen ±0,78/0,32 nur in Erde — gelesen.
- Entscheidung: EINE Quelle `WEG_GESETZ`/`wegQuerschnitt` im Kern für alle Arten und Platz; Spur und Rinne der Erd-Gasse ziehen in den Kern.
- Schnitt: b1ffbea3 als eine Welle + `WEG_GESETZ.erde` + Art „spur" im Pool siedlung-weg; Labor liest dieselbe Zahl, Asphalt-Ast im Labor
  ohne Welt-Leser fällt (FINAL STREICHEN, falls kein Ort > 1880 städtisch steht — nicht gelesen).
- Leser: Blatt 08 Z.58–63. Kosten: ein Pool, ≤ 1,5 ms Füllung je Takt, an 70/220 m gebunden; Shader +1 Rauschen +2 fwidth — ungemessen.
- Kriterien: keines misst Weg; material.K1#1 gtx ROT „boden 1,2969" (stand.json:2181) mitlesen. Liegt: b1ffbea3 WIP, kein Bild.

**7 · Die Stadt am Ort der Ankunft (k0 hinter dem Teich), das Dorf an k5 stirbt** · Aufwand M
- Mangel: Vom Rondell schließt Wald den Horizont (probe-post/w28-platte-fein/02c27132-genesis-0.5.png laut Blatt 07, nicht selbst angesehen).
- Wurzel (gelesen): fachwerk-core.js:9648 `viertel: { r: 190, k: 5, hausR: 60 }`; siedlung-ort.js:1620 `siedlungsGroesse(S, h, 0)` →
  8–17 Häuser (fachwerk-core.js:3326/:3366); `verkehrVon` :4065 → 0 Wagen ohne `staedtisch`.
- Entscheidung: Der Start-Ort ist eine Stadt `GROESSE_N.stadt` = 36 (:3344) in der Achse k0, nächstes Haus ≥ 210 m (Posen-Regel :9707).
- Schnitt: :9648 + Zone :10072 + Wirt :1620 + Weg :9674 + Pose S12 in `posen` (:9683) + Bildpaar S1 nach Norden.
- Leser: Blatt 07 Z.62–68 (diag-ankunft.cjs:337 Export als Kopf, ~12 Proben-Dateien mit „Start-Dorf"). Kosten: Export nH 36 ≈ 0,4 s
  geschätzt; Wache B GTX kalt 16,6 s darf nicht steigen. Kriterien: F ohne Station (stand.json:5202 „Silhouette der Stadt vom Platz");
  C 0/2; siedlung.K2#1 „Stadt −2,−6 nH 35 1424 m" (stand.json:3251).

**8 · Haus-Stoff: der Verband reist als Funktion der Welt-Lage** · Aufwand L
- Mangel im Bild: frontal.png — das Putzhaus ist eine glatte weiße Fläche ohne Korn; das Labor-Bild (900c28e6-radeon/…/fachwerk-buehne.png,
  nicht selbst angesehen) zeigt Fugen.
- Wurzel (gelesen): fachwerk-core.js:53–58 „Durchs Portal reist keine Karte"; siedlung-satz.js:1652–1661 `BAU_SATZ_ATTR` 8 Puffer, :1664
  WebGPU-Decke 8; Muster `BAU_STEIN_ATTR` mit uv :1667–1670.
- Entscheidung: Der Verband reist als Funktion (u, v, Anteil, Art) in freien Komponenten, 0 neue Puffer, 0 neue Programme; die vier
  Canvas-Karten fallen, das Labor zeichnet dieselbe Rechnung.
- Leser: Blatt 05 Z.68–74. Kosten: +16 B je Ecke, ~40 ALU in Haus-Fragmenten, Format 6 → 7 leert den Cache einmal (Kosten-Zeile B).
- Kriterien: studios.K4#1 radeon/gtx ungemessen · Wache material.K3#1 0,95–1,05, lod.K4#1 < 2 %. Liegt: w28-stoff-fuge 212b6de9 (1 von 4 Arten).

## Kopplungen
- **Golden bake.json:** 1 (Zweig ändert spec/asset-contract/ofen/golden/bake.json, git diff --stat) und 2 (bauMensch) schreiben dieselben
  Goldens → 1 vor 2, nie parallel.
- **1 → 4:** 4 macht L1 sichtbar; ohne 1 zeigt L1 den Ballon. **2 → 4:** die L1-Kappe (foundry-core.js:9820) ist dann öfter im Bild — 2 vor 4.
- **3 ↔ 4 ↔ CPU:** 3 gibt jedem lebenden Leib IK, 4 hebt die lebenden Leiber von 4 auf 7. Beide zahlen am CPU-Takt, der an Genesis Third
  schon reißt (Pflicht E 6,3 > 5,8). Reihenfolge 3 vor 4; 4 misst den CPU-Preis MIT der IK aller 7.
- **3 → 6:** beide fassen `_standSicht` (koerper-leib.js:588; der WIP liest dort `_wegKoerperAt`). Landet 3 zuerst, steht der Bewohner
  nach 6 ohne Zusatz-Code auf Gehsteig und Bord. 6 mischt main (39 Commits, leib-kanon in koerper-leib.js) und löst den Konflikt dort.
- **Haus-Kette:** mp-boden 77c31f1a → stadt-grammatik 45290d87 → fassade (+5) → stoff-fuge (+8). 5 und 8 schreiben fachwerk-core.js und
  haeuser.json: EIN Arbeiter für beide Heimfahrten (Blatt 05 Z.105).
- **6 und 7 auf der Grammatik:** 6 baut auf stadt-grammatik; 7 ist zeilen-unabhängig, sieht aber erst mit der Grammatik aus wie
  sg-stadt.png. 7 nach 6, damit die Stadt der Ankunft Kante und Bord schon trägt.
- **1 ↔ 3:** die neue Sohle (1) und der neue Stand (3) bewegen beide leib.K2 und das Bild des Fußes — gleiches Bildpaar, 1 zuerst.
Reihenfolge ohne Kreis: 1 → 2 → 3 → 4 auf main; Kette mp-boden → grammatik → 5 (fassade) → 6 → 7 → 8 (stoff-fuge).

## Widersprüche zwischen den Blättern und was die Quelle sagt
- **„Dorf der Ankunft"** (01–06, 08, UEBERGABE §3) ist der Messort dorf, Zelle −4,−4 (haushalt.json:123–131), nicht die Ankunft. Blatt 07
  hat recht, dass an der Ankunft Wald steht; sein eigenes Bild dorf-main-0.5.png ist aber ebenfalls der Messort.
- **Blick der Ankunft:** Blatt 07 S1 nach Norden (fachwerk-core.js:10153) — stimmt. Der Messort genesis blickt nach −x (haushalt.json:85–87
  `blick [−10, 0]`). Eine Werkbank-Probe am Messort genesis sieht die Stadt in k0 nicht; S12 braucht ihre eigene Pose (Blatt 07 Stufe 4).
- **Schweben:** 01 vermutet die Satz-Sohle (siedlung-bewohner.js:1158–1167), 04 den Gesetz-Boden ohne IK. Die Quelle trägt 04 (kein
  Stand-Leser, `_gaitTick(..., null)`, `_gaitBodenY` liest nur `this.state`). Ob der Gehende in frontal.png L0 oder Satz ist: unbekannt.
- **Ballon:** 02 sagt Kleid (backeHuelle), 03 zitiert den Befund „Ballon ist die L0-Gestalt". Beides stimmt teilweise: Im Kandidatenbild 7
  rechts sind die Fetzen weg, die Schulter-Kappe trägt weiter Masse; in k-nackt-vorn-07.png sehe ich die Kugel-Schulter auch NACKT. Die
  Schulter gehört dem Leib, kein Blatt trägt sie.
- **Kopf des Kleid-Zweigs:** 01/02 nennen ace30e73, origin trägt a9a3d136 (main gemischt, Kleid-Linse formatiert).
- **Fenster-Zahl:** 06 nennt sieben Giebel-Fenster mit einem dunklen; ich sehe in frontal.png vier an der Front, eines dunkel. Der Befund
  (Schachbrett) bleibt.
- **mensch.K4:** stand.json abends 2/2, Blatt B morgens 0 — der Abend gilt (01, 03 einig).

## Gestrichen
- 08: Lavendel = Geologie-Violett durch das Rand-Restgewicht (±0,6 m). In dorf-main-0.5.png sehe ich meterbreite Lavendel-Felder (links
  hinter der Frau, rechts vorn), kein 1,2-m-Band am Rand. Als Täter gestrichen; das Lavendel bleibt unbenannt offen.
- 03: „größte Kopfbreite am Euryon" — aus dem Gedächtnis, keine Quelle. Der Schnitt steht auf dem Bild k-nackt-vorn-07.png und den
  Konstanten :2196/:2197, nicht auf dieser Behauptung.
- 05: Labor-Bild mit Balken als Soll (Stand 18.546.244, widerspricht `GLATT` für klinker :197). Bis zum neuen Schuss kein Soll.
- 01: Verdacht Schweben an :1158–1167 — durch 3 ersetzt.
- 07: „Kurs-C 45 % der Zonen" — Schätzung ohne Messung.

## Ehrlich offen
- Ungemessen: CPU je lebendem Leib (4), Schuh-Dreiecke im Budget 40 000 (1), Guss-ms des Kopfs (2), Shader-Kosten Weg (6), Export nH 36
  an der Kalt-Zeile B (7), Pixel-Kosten Verband und Programm-Zahl (8), haar.K4#1 am neuen Poncho (1).
- Schulter-Kappe des Leibs (k-nackt-vorn-07.png): eigene Klasse, kein Blatt, kein Zweig.
- In k-nackt-vorn-07.png sehe ich am linken Oberarm eine senkrechte geflochtene Naht-Linie. Täter nicht gelesen.
- Satz der Menge ohne Gesicht und mit Fäustlingen (foundry-core.js:7025, vox 0,06 E), Haar-Licht nur an L0 (studio-stoff.js:36).
- Innenraum dunkel an L0 (siedlung.K1#2 Median 0,081 ↔ ≥ 0,15), 5/18 Häuser lesbar: Licht-Wurzel, nicht diese Familie.
- Himmel am Mittag dunkel-marine (frontal.png, dorf-main-0.5.png): niemand trägt ihn.
- Nicht selbst angesehen: genesis-Bild aus Blatt 07, fachwerk-buehne/-welt.png, Bilder 8–13 von w28-leib-nah außer 7.
- Ob `_autoSettlementSiteOk` bei z ≈ 372 Land trägt (7), ob ein Ort > 1880 städtisch je in der Welt steht (6): nicht gelesen.
