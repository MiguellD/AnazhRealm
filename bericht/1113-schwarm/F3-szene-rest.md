# F3 szene-rest

Verdichtet aus 17-nacht-laternen · 18-wetter · 19-tiere · 20-fahrzeug · 21-verkehr · 22-stoff-system · 23-post-kette · 24-klang.
SPIEL = `.claude/worktrees/leib-kanon-urteil` (main ec281422), PM = `w3/pm/meisterkarte-quelle/punkte`. Je Blatt sind mindestens zwei tragende
Stellen an der Quelle nachgelesen. Gereiht wird nach Pflicht-OFFEN, dann nach dem Bild am Ort der Ankunft (Dorf), dann nach den Kosten. Gesehen:
- `BILD/dorf-main-0.5.png`: Das weiße Haus hat eine glatte Wand ohne Korn, der Sockel stößt ohne Dunkel auf den Erdplatz. Unter dem
  Marktdach ist der Boden so hell wie der offene Platz. Der Schatten des mittleren Bewohners liegt abgesetzt von den Füßen. Der Himmel ist
  dunkel-marine, ein Wagen ist nicht zu sehen.
- `BILD/befunde/li-bild-heute-nacht.png` gegen `li-bild-pass-nacht.png` (Spike, nicht die Welt): Heute ist nur der Boden vor dem Auge orange,
  die hinteren Laternen-Füße und Wände bleiben blauschwarz. Mit dem Pass liegen warme Kreise vor den hinteren Häusern, die Wände glühen.
- `KO/probe-post/w28-verkehr-bild/71bb1587-stadt.png`: Das Dach des gelben Wagens liegt als flache Platte auf den Säulen, in der Kabine stehen
  dunkle Klötze, im Glas grobe Pixel-Blöcke.
- `KO/probe-post/w28-tiere-nach-bild/7-nach-12000.jpg`: Der Wolf ist ein glatter sandgoldener Körper ohne Sattel und Bauch. Die Szene ist
  Schnee unter warmem, cremefarbenem Himmel.

## Die Schnitte, gereiht

### 1 · Richter von C (Klasse „wer misst C“) · S
- Mangel (Takt): pflicht.C steht bei 0/2 „ohne Richter“ (PM stand.json:4771–4785). C#1 headless ist ungemessen, Grund R6 „Linse seit der
  Messung geändert“ (:4781). Zuletzt GRÜN war es an 782ce8a3. Die jüngste headless-Datei 6aa7a5a6 trägt keine Zeile pflicht.C (Grep 0).
- Wurzel: Der Zwilling fahrzeug.K2#2 fährt 12 s (`stationen/g5.js:5624`) gegen eine Frist von 300 s. `ohne` ist fest eingetragen und
  `gruen: c && ohne.length === 0` (g5.js:5637–5639), er kann also nie GRÜN werden. Band-Zellen gibt es nur für genesis, wiese und dorf
  (g6.js:1438–1482). Die Stadt hat nur den Gang `stadt-ego-geht` (g6.js:1222, :1485).
- Entscheidung: C misst der Richter, den es schon gibt, an dem Ort, den das Kriterium nennt (stadt-voll). Der Verkehrs-Code bleibt unberührt.
- Schnitt (eine Welle): Der C-Teil von K2#2 fällt samt `PW.fahrVerkehr`. pbRichter bekommt den Schritt `stadt-voll` nach dem Muster dorf
  (g6.js:1477–1482) mit den Zellen `band:stadt-voll-ego`/`-third`. Sie urteilen nur die neue Station pflicht.C#2 (radeon+gtx), nie
  profiband.K1–K3. Dazu kommt die Mutante „die Stadt trug keinen Wagen“ (Muster g6.js:1811). C#1 wird headless frisch gemessen.
- Leser: g5.js:5621–5654, :5693–5716 · proben-welt.cjs:1001–1028 · g6.js:1221–1223, :1477–1486, :1811 · pflicht.json:30–37 · punkte.cjs
  (Buchung) · `spec/profiband/haushalt.json:321–331` (stadt-voll steht dort, `ortPose` „platz“). Kein Spiel-Byte.
- Kosten: Schirm 0, B ±0. Messplatz −2,9 min GPU je Fahrt, dafür ≈ +40 s je Gerät (geschätzt).
- Kriterien: pflicht.C 0/2 ↔ jeder Teil gemessen und GRÜN · C#1 ungemessen ↔ GRÜN 10/23 Uhr × 600 s · K2#2 konstruiert ROT ↔ ROT nur noch beim
  Namen Hang/Furt/Sichten.
- Liegt: Die Verkehrs-Heilung ist in `w28-stadt-grammatik` 156cc903 (hinter `w28-mp-boden` f97fe692 WIP). Für den Richter liegt kein Zweig.
  Im Bild ändert sich nichts. Es ist das einzige Pflicht-Teilstück der Familie ohne Spiel-Byte.

### 2 · Mikro-Relief mittelfrei, dann die Bau-Wand mit Stoff (Klasse „matte deckende Fläche“) · S + M
- Mangel (Bild): Die Häuser am Dorf sind glatte Kästen. material.K1 = 0, weil fels W/L 1,1056 und boden 1,2969 außerhalb von 0,9–1,1 liegen
  (ec281422, beide Geräte).
- Wurzel: `studio-stoff.js:275` `const mikro = flat && kind === "unknown"`. Die glatte Bau-Fläche endet bei :594–598 mit `colorNode = laubFarbe`
  (= Vertex-Farbe, :314–317). In `stoff-material.js:2739–2746` gilt `ao = himmel/korn`, das Himmels-Licht liest also `himmel`. Laut Kommentar
  :2734 liegt dessen Mittel bei 1,13 und fällt erst mit der Ausblende auf 1.
- Entscheidung: EIN Mikro-Relief für jede matte, deckende Fläche. Es muss in Albedo UND Himmelslicht mittelfrei sein, bevor es eine weitere
  Fläche bekommt.
- Schnitt: Stufe 1 allein auf main: `himmel` wird durch sein Mittel bei k geteilt (:2744). Das trifft Boden, Fels, Stein und Gestalt. Die
  Stufen 2–4 kommen in der Welle von `w28-stoff-fuge`: `mikro` für jeden opaken Bau-Stoff `unknown`, gewogen mit `smoothstep(0.3,0.6,rauh)`;
  die Signatur `mikro:f` gegen `mikro` (:732); die Fuge vor dem Korn (Zweig `studio-stoff.js:694` `!mikro` → `!flat`).
- Leser: stoff-material.js:900, :1935, :2768, :2828 · studio-gestalt.js:310/315 · siedlung-satz.js:79 · vegetation-wiese.js:1906 (ausgenommen)
  · Nässe :2084 · Albedo-Tafel, material.K3, `armUrteil` (abnahme-urteil.cjs:517).
- Kosten: Stufe 1 ±0. Stufen 2–4 kosten 9 Rausch-Ebenen je Wand-Fragment, aber kein neues Programm. Gemessen wird gpu-bank Dorf Ego
  vorher↔nachher.
- Kriterien: material.K1 0 ↔ 1 (fels voraussichtlich < 1,1, boden bleibt offen) · material.K2 1 ↔ 2 (#2 Putz/Holz über denselben `armUrteil`)
  · material.K3 2 muss halten (haus 1,008/1,013) · Pflicht A haus.
- Liegt: `w28-stoff-fuge` 212b6de9 (WIP, OMEN, Goldens 113/258 neu geprägt) und `w28-fassade` b038852b (WIP). Die Kette: mp-boden →
  stadt-grammatik → fassade → stoff-fuge.

### 3 · Kontakt-Verdeckung durch die EINE Umgebung (Klasse „was das indirekte Licht verdeckt“) · M
- Mangel (Bild): Der Sockel ist hart, unter dem Marktdach liegt kein Dunkel, die Füße stehen ohne Dunkel (dorf-main-0.5.png).
- Wurzel: `_kontaktVerdeckung` (bild-schatten.js:1396–1415) hat einen einzigen Aufrufer, den Boden (`stoff-material.js:1924`, Grep über
  stamm/). Die Umgebung jedes Stoffs entsteht in `SpiegelUmgebung.setup` (bild-sicht.js:690–715). Ihr Bestrahlungs-Zweig nutzt schon einen
  Stoff-Haken (`receivedShadowPositionNode`, :701).
- Entscheidung: Die Verdeckung läuft durch `_spiegelUmgebung`. Jede Fläche, die dort ihr Himmels-Licht holt, liest sie mit.
- Schnitt: Bestrahlung und Glanz werden mit `K = material.kontaktNode ?? _kontaktVerdeckung()` multipliziert. Der Boden zieht `_kontakt` aus dem
  aoNode (:1924–1933) in `kontaktNode` (Byte-Beweis am Boden). Halm und Laub setzen `kontaktNode = 1`. Die alten Kommentare fallen
  (bild-schatten.js:1352–1354, vendor-anker.json:1263).
- Leser: bild-himmel.js:715 · bild-sicht.js:675 (Bühne ohne Pass) · schatten.K3/K4 (g3.js:1181–1216) · material.K4 (dieselbe Umgebung).
- Kosten: je Fragment eines Standard-Stoffs ein Matrix-Produkt und ein `load` (:1402–1406), an den Schirm in Skala 0,75 gebunden, ungemessen.
- Kriterien: schatten.K3#1 ROT 93,4/4,6 % ↔ 30–60 % · K4#1 ROT 0,0 % ↔ ≥ 10 %. Beide sind seit 21:02 der Grund der Buchung 221 → 219, ohne
  Täter (UEBERGABE STAND). Die Wand misst kein Kriterium; die Abgabe ist das Bildpaar. Liegt: kein Zweig.

### 4 · Fell ist Licht, nie Emission (Klasse „Fell“: alle Arten, L0/L1/Satz, Labor) · M
- Mangel (Bild): Ein goldener, glatter Wolf. Das Gesetz will Grauwolf mit Sattel und heller Kehle (tetrapoda-core.js:3644–3706).
- Wurzel: `studio-stoff.js:490–502` addiert rim, sheen und microFur, `:542` setzt `else if (add) mat.emissiveNode = add`. Die Werte sind Gold
  aus `wolf_aureus_v22` (tetrapoda-core.js:3376, :3385, :3389). Das Labor rechnet dasselbe als `totalEmissiveRadiance` (tetrapoda.js:99–102).
  Das Haar dagegen trägt Licht (`setupLightingModel`, studio-stoff.js:504–541).
- Entscheidung: Fell bekommt dasselbe Lichtmodell wie das Haar (`_haarLichtModell`). Das Aureus-Gold fällt, die Farbe kommt nur aus
  `fellFarbe`.
- Schnitt: Erst die Gegenprobe (rimAmt, sheenAmt, microFur.amt = 0; gleiche Pose; Mittag und Schatten). Dann in einer Welle: Haut fell
  L0/L1/Satz · fellSchale (Kamm als Tangente, :413–415) · straehne · Labor-GLSL · Haut-Tangente additiv aus dem Ofen (foundry-core, Byte-Beweis).
- Leser: tetrapoda-core.js:3382–3411, :4985 · studio-stoff.js:43–100, :361–551 · foundry-core.js:7925, 7965, 8187–8188, 8501 · tetrapoda.js:60,
  72–104 · foundry-bruecke.js:630 · kreatur-verhalten.js:2842 · kreatur-leben.js:2714–2722 · welt-licht.js:1019 (nicht gelesen).
- Kosten: Ein Programm-Schlüssel ersetzt einen, ungemessen. Kriterien: haar.K1 1/2 (#2 ohne Station) · tiere.K3#2 hält · Pflicht A fell.
- Daneben (F): Das Gehege mit 3 Wölfen (fachwerk-core.js:9640) hat keinen Leser (siedlung-ort.js:2195 liest nur `.rand`). Ein freier Punkt ist
  tiere.K1#2 GTX.

### 5 · Laternen-Licht als EIN Pass auf dem Schirm (Klasse „Quellen-Licht“) · L
- Wurzel: `LICHT_POOL plaetze: 4` (stoff-material.js:3754). Der Term steckt in jedem Stoff (`em.add(this._lichtPoolTerm(…))` :2064, Funktion
  :2414), gleich hinter der Nässe (:2046). schatten.K5 Radeon steht bei 0,22:1, Soll ≥ 3:1.
- Schnitt und Leser wie in Blatt 17 (Stufen 1–6, 16 Plätze, zwei MRT-Ziele, Pass nur bei Stärke > 0).
- Kosten: Fragment-Text −7 %, +9,3 MB VRAM. Bild-ms Nacht im Spike 182 → 254 (swiftshader). Auf der Karte ungemessen.
- Liegt: `w28-samen-lichtweg` d8887125 (Befund und Spike).

### 6 · Fahrzeug-Haut aus Schnitten auf `gitter` (5 Rezepte, Stufe 0/1, Box-Satz fern) · L
- Wurzel: `buildSkin` (vehicle-core.js:1379), `taperBody` :1014, `bowEnds` :1338, `gitter` :2475, `wheelClearance` :3364. Schnitt und Leser wie
  Blatt 20. Am kompakt_fwd fallen die Dreiecke von 28 716 auf ≈ 20 578 und die Meshes von 359 auf 103 (Spike).
- Kriterien: Die Gestalt misst kein Kriterium. Mitlaufend material.K4 (Lack 0,4468 ↔ ≥ 0,5) und fahrzeug.K4 (darf nicht fallen). Der Ort der
  Ankunft ist der GT-Vorschau (Tor k 8).
- Liegt: `w28-samen-fahrzeug` 5406f47d (Spike) und `w26-lack-glas` 8230911b (ABGABE, zurückgehalten).

### 7 · Klang: Einmal-Klang als Puffer, dann an mit der ersten Geste · M
- Wurzel: `initSymphony` hat zwei Rufer (speicher-laden.js:2435, feld-leben.js:1553). Der Klick-Hörer `dirigent-ankunft.js:1384–1396` fängt nur
  den Zeiger. `schrittKlang` (klang-core.js:1532–1579) baut je Tritt zwei Ketten, `koerner: 28` (:1485) mit je zwei Automationen
  (:1573–1576). Das Literal 0,35 steht in speicher-laden.js:2443.
- Schnitt: Die Stufen 3–5 aus Blatt 24 (Puffer, Takt-Teile) kommen VOR Stufe 1 (Geste); dazu Stufe 2 (Master-Gesetz). Kriterium:
  klang.K5#2 Radeon 0,40/0,34/0,33 ↔ ≤ 0,2 ms. Klang steht nicht in PFLICHT-OFFEN.

### 8 · Regen nach Schirm und Ort · M
- Wurzel: `REGEN_GESETZ` mit 7 200 Schlieren in `raum: [54,30,54]` (foundry-core.js:190–192). EIN β für den ganzen Schirm
  (`U.beta.value = this._luftBeta()`, bild-himmel.js:2429), gebildet nur aus dem globalen Wort (:2160–2168). Schnitt wie Blatt 18.
- Zuletzt gereiht: Wetter steht unter Feature-Stopp (g1.js:80 laut Blatt) und in keinem Pflicht-Eintrag. ferne.K5#2 hat keine Station.

## Kopplungen (Reihenfolge ohne Kreis)
1. **Zuerst den Täter der Schatten-Familie benennen (vor 3 und 5).** schatten.K3#1, K4#1 und K5 (0,22:1, am 12.11. 5,28:1) stehen am ec281422
   ROT ohne Namen. 3 ändert die Wand-Verdeckung, die K4 misst, 5 den Wurf, den K5 misst. Ohne Täter hat keiner ein sauberes Vorher. EINE
   Halbierung über z424–z426 schafft das.
2. **2 (Stufe 1) vor 3.** Beide greifen in dieselben Zeilen des Boden-aoNode (stoff-material.js:1924–1935, :2746). Den Byte-Beweis am Boden,
   den 3 verspricht, gibt es nur gegen einen festen Kopf.
3. **2 (Stufen 2–4) hängt an der OMEN-Kette.** 3 legt seine Verdeckung auf dieselben Wände, die 2 mit Korn versieht. Beide wirken
   multiplikativ im indirekten Licht und auf material.K3 haus. Sie landen als zwei Köpfe in fester Folge, nicht in einem Commit.
4. **1 trägt 6.** Die Band-Zellen stadt-voll messen 20 Wagen mit der heutigen Haut. Das ist das Vorher für die Dreiecke und Befehle von 6.
   1 misst main und braucht `w28-stadt-grammatik` nicht.
5. **3 und `w26-lack-glas` teilen material.K4.** 3 multipliziert auch den Glanz-Zweig (bild-sicht.js:705–714), lack-glas setzt
   `envMapIntensity` (studio-stoff.js:251). Einer landet zuerst und wird gemessen.
6. **5 braucht die Nässe im G-Puffer.** `_naesseImStoff` (:2046) wirkt vor dem Pool-Term. Der Pass muss nach der Nässe schreiben, sonst
   verliert der nasse Platz den Laternen-Glanz. 8 berührt dieselbe Luft; wo das Pool-Licht heute gedämpft wird, habe ich nicht gelesen. Also
   8 nach 5.
7. **7 (Stufe 1) vor den Puffern bricht E.** Schaltet der Klick den Klang an, zahlt jede Band-Zelle mit Klick den Haupt-Faden. E reißt schon
   heute am CPU-Takt (Genesis Third 6,3 > 5,8). Ob die Zellen klicken: nicht gelesen.
8. **4 ist frei.** Es braucht nur die Gegenprobe und foundry-core additiv.
Folge: Täter Schatten · 1 · 2 (Stufe 1) · 4 · 3 · 2 (Stufen 2–4, nach der OMEN-Kette) · 6 · 5 · 7 · 8.

## Widersprüche zwischen den Blättern und was die Quelle sagt
- Kosten von 5: Blatt 17 nennt Fragment-Text −7 %. Im selben Befund kostet der Pass nachts aber 254 statt 182 ms (Spike). „Kosten nicht über
  heute“ ist am Spike nachts verletzt.
- Blatt 21 sagt, nicht gelesen sei, ob stadt-voll in haushalt.json steht. Die Quelle sagt ja, `haushalt.json:321–331`, allerdings ohne
  `spieler`-Zahl wie beim Dorf (:125).
- Re-Mint: Blatt 20 verlangt dafür das Wort des Schöpfers (Lehre 11). Der Kopf von `w28-stoff-fuge`, auf den Blatt 22 baut, hat die Goldens
  schon neu geprägt („Vertrags-Akt“, 212b6de9). Ob ein Wort vorliegt, sagt keines der Blätter.
- VK zählt 0 Berührungen (Blatt 21), ein Bild am Zweig zeigt einen Bewohner auf einer Haube (55c820a6, einmal gesehen).
- tiere.K1#2 urteilt GRÜN (5 × ~25 px auf 46–55 m), das Auge aus Blatt 19 findet die Herde nicht.
- Die Soll-Tafel nennt haus GRÜN (soll-tafel.json:1290–1313), das Bild zeigt glatte Kästen.
- Blatt 22 sagt, die Hauswand habe nur die Vertex-Farbe. Das bestätigt sich: der Zweig :594–598 ist laut Kommentar für Fels/Kristall/Blume/Laub
  gedacht, und die Wand fällt hinein.

## Gestrichen
- Blatt 18 „≈ 59 % der Spielzeit nass“: Mittel über 300 Saaten (Kommentar phyto-core.js:4014), nicht die Saat der Ankunft.
- Blatt 18 „Dichte ×9“ und „≈ 0,15 % Deckung“: gerechnet, nicht gemessen. Gemessen sind 0,55/0,36/0,07 %.
- Blatt 23 „main steht seit z427 auf 7f778d44“: nicht geprüft. Die UEBERGABE nennt z427 in Fahrt am ec281422.
- Blatt 24 „≈ 70 → ≈ 6 Rufe je Schritt“: am Code gezählt, nicht profiliert. Es zählt die Takt-Messung.
- Blatt 19 „das Gold kommt aus der Emission“: Als Bild-Befund gestrichen, bis die Gegenprobe läuft, denn das nahe Bild ist Schnee unter warmem
  Himmel. Der Code-Befund (Emission in Gold) bleibt.
- Blatt 21 „Statuszeile C veraltet“: Das trifft zu, aber die Zeile setzt nur der Schöpfer. Als Arbeits-Schritt gestrichen.

## Ehrlich offen
- Der Täter von schatten.K3/K4/K5 am ec281422 ist unbenannt und sperrt das Vorher von 3 und 5.
- Es gibt kein Nachtbild und kein Regenbild der echten Welt am Dorf. Keiner der Schnitte 2–8 ist auf einer Karte gemessen.
- boden 1,297: Die Messstelle liegt im Rasen (w28-stadt-grund). material.K1 bleibt nach 2 auf 0, bis das Exemplar entschieden ist.
- Ob das Lichtmodell des Haars die Umgebung (und damit 3) liest, ist nicht gelesen. Das betrifft das Fell nach 4.
- Herde ≥ 20 (tiere.K5) gegen einen Wurf von 3–7 (tetrapoda-core.js:289): Der Wortlaut des Solls liegt beim Schöpfer.
- Ob die headless-Farm überhaupt fährt, ist nicht gelesen. Den dunkel-marinen Himmel, die Tonkurve und die Skala 0,75 gegen 1 trägt kein Blatt dieser Familie.
