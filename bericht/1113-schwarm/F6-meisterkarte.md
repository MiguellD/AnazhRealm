# F6 meisterkarte

Verdichtet aus 41–48 (acht Scheiben der 33 Domänen, stand.json kopf ec281422 19:48). Stichproben an der Quelle: SPIEL = leib-kanon-urteil,
PM = w3/pm/meisterkarte-quelle/punkte, dazu origin/punkte-maschine f6d76563 (kopf 7f778d44, 20:39) und origin/main 7f778d44c.
Bild selbst gesehen: `BILD/dorf-main-0.5.png` — Himmel dunkel-marine bis an den Kamm, Platz brauner gesprenkelter Teppich mit violetten
Schlieren ohne Kante, der Hausschatten unten rechts blau-schwarz gesprenkelt, Hang aus flachen gelbgrünen Zacken, das Haus ein glatter
weißer Kasten mit flachen grauen Fenstern, neun Menschen stehen still.

Befund der Familie: Vier der acht Blätter finden denselben Täter: Die STATION urteilt falsch, das Spiel ist es nicht. Sie liest ein totes Feld,
steht neben ihrem Maß oder schießt ohne Takt. Das sind drei Klassen in pm, alle S, und sie halten gebuchte Punkte. Erst nach ihnen urteilt die Karte
über Bild-Schnitte am Dorf ehrlich. Die Bild-Schnitte folgen danach in der Reihenfolge, die keinen Kreis macht.

## Die Schnitte, gereiht (hoechstens 10)

**1 · Klasse „die Station liest eine Quelle, die das Spiel nicht mehr liefert" (pm, Takt).** Blätter 41, 42, 43 Stufe 1.
- Mangel im Takt: Drei Stationen urteilen über Felder, die seit einem gelandeten Schnitt tot sind. Sie liefern Schein-ROT oder NaN.
- Wurzel (gelesen): (a) `wetterWunsch` hat in SPIEL nur noch einen Kommentar (`stamm/bild-himmel.js:3060`). Die lebende Quelle ist `wetterWuensche`
  (:3024, :3075) mit `wetterSchreiber` (:3031). pm liest das tote Feld an 8 Code-Zeilen: `g2.js:951, 1184, 1204, 1362, 1368, 1372, 1385`, `g5.js:236`.
  Dazu ruft pm `_setWeather("rainy","auto-zug")` ohne Zug-Objekt (`g2.js:1371`, `g5.js:239`).
  (b) `SCHUSS` gibt nur `{dc, dreiecke, png}` zurück (`scripts/diag-boot-stage.cjs:111`). pm liest `b.luecke` (`stationen/sitzung-seite.js:319`) und bekommt NaN.
  Die Linse rechnet die Lücke selbst (`lueckeKacheln` :116). Am origin/punkte-maschine f6d76563 ist das ungeheilt (git show, Treffer 319/321).
  (c) Die Fahrt-Station rechnet den Karten-Rand als `_archKartenHorizont(e)` OHNE Eintritt (`g6.js:2337`). Das Spiel fragt
  `_archKartenHorizont(entry, !gezeichnet)` (`stamm/vegetation-baum.js:2814`) und klemmt Wurf-Karten auf `_laubRand() − saum` (`stamm/studio-bruecke.js:3425-3427`).
- Entscheidung: Jede Station liest das Gesetz an der EINEN Quelle des Spiels, nie eine eigene Rechnung und nie ein Feld von gestern.
- Stufen (ein pm-Commit, je Stufe ein Selbsttest-Fall „totes Feld → ROT beim Namen, nie NaN"): (a) 8 Zeilen auf `wetterWuensche`/`wetterSchreiber` nach
  `_wetterZugZiehen` (Absenz-Grep `wetterWunsch\b` in stationen/ 8 → 0). (b) `luecke` = MAXIMUM je Kachel aus a.png/b.png wie `diag-boot-stage.cjs:116/528`.
  Dazu werden die vier „Wald-Stücke" mit Grund genannt (`r._streuWartet`, `stamm/vegetation-streu.js:1599`). (c) `g6.js:2337` fragt `r._archKartenHorizont(e, !r._archIsRendered(e))`.
  Spiel-Teil von 41: Das Band des Leib-Gesetzes ist hartes Deutsch (`stamm/feld-dsl.js:2434`, `:2459`) und wird eine Tafel-Zeile DE/EN in `stamm/daten.js`.
- Leser: `g6.js:1182` kaltKontrolle, `:2797` (ankunft.K2#1), `:2473/2490` Fahrt-Urteile; Spiel `feld-dsl.js:316`, `feld-nexus.js:1069/1161`,
  `scripts/diag-sprache.cjs` (spielgang.K5#1 hält 0 hart).
- Kosten: 0 ms am Schirm; zwei PNG-Lesungen 960×540 je Kalt-Boot.
- Kriterien: affekt.K4#1 0 → 1 (wunsch 0 ↔ > 0) · spielgang.K5#2 1 → 2 · affekt.K2#1 hält 1 · ankunft.K2#1 hält 1 (sonst 221 → 220) ·
  ankunft.K1#1/#2 nennen die Zeit statt NaN (12,95 s ↔ 5 / 15,6 s ↔ 10) · streaming.K1#1/K2#1 werden lesbar, buchen aber nicht (GT bleibt, siehe 6).
- Liegt: nichts in pm; `w14-wunsch-akt` (Spiel) und `w28-linse-wahr` (Spiel) sind gelandet, ihre pm-Leser zogen nie nach.
- Aufwand S.

**2 · Klasse „die Station steht neben ihrem Maß" (pm g3.js, Takt).** Blatt 46.
- Mangel: Seit PM ab71fe5be (18:36) stehen die Proben an der Ankunft und urteilen über ihre eigene Lage. Gebucht und GRÜN war am alten Ort
  [-840.7,-866.4]: schatten.K4 Gewinn 31,3 %, Boden 0,4395; schatten.K3 Fuß 53,6 % (origin stand.json, c4010773). An der Ankunft steht:
  Gewinn 0,0 %, Boden 0,0981; Fuß 93,4 % (ec281422).
- Wurzel (gelesen): Die Platte der K4 liegt auf `M.y + max(hub)` (`g3.js:1202-1206`), das Auge auf `M.y + 1,7` (:1195). Der K3-Platz prüft Hang und
  Halm nur an 9 Punkten im Radius 5 (:1236-1249), nicht über den Fußabdruck. Die lod.K1-Tafel trägt `--ziel tanne` (`g3.js:3023`), die Soll-Tafel
  aber `--ziel Blickziel` (`spec/abnahme/soll-tafel.json:743`).
- Entscheidung: Eine Probe steht dort, wo ihr Maß sie beschreibt. Soll, Schwelle und Urteil bleiben byte-gleich, der Messort bleibt die Ankunft.
- Stufen (Blatt 46, eine Welle): K4-Platte als Raster auf `_bodenSichtAt` + 0,04 · K3-Fußabdruck 4 × 4 m · K5-Pose nur auf gesehenem Boden ·
  ferne.K3-Stand über dem Hügel, bis ≥ 100 Kamm-Spalten stehen · lod.K1-Tafel mit `--ziel Blickziel`.
- Leser: `g3.js:1185` (einziger Rufer von platz), :1621-1655, :1092-1122, :3019-3029; Urteile :2099-2188 unverändert; Selbsttest `neunProben`.
- Kosten: 0 ms am Schirm, Probe +0,1 s.
- Kriterien: schatten.K4#1 0,0 % ↔ ≥ 10 % und schatten.K3#1 93,4 % ↔ 30–60 % halten 2 Punkte (Buchung 21:02 verweigerte 221 → 219) ·
  schatten.K5#1 0,22:1 ↔ ≥ 3:1 · ferne.K3#1 29 ↔ ≥ 100 Spalten · lod.K1#1 Tafel ohne Bild, strauch 0,271 ↔ ≤ 0,22 (Pflicht A).
- Liegt: kein Zweig. Aufwand S.

**3 · Klasse „Licht unter der Decke" (Spiel + Station, Bild).** Blätter 47 und 44 (leib.K3#2).
- Mangel im Bild: Ein Innenraum am Mittag ist schwarz (Innen-Luma 0,005–0,012 in 18 Häusern, `messung/roh/ec281422-radeon/siedlung.K1_2.json` laut 47;
  ein Innen-Bild selbst nicht gesehen). Die Höhle ist fast reines Schwarz (`MS/roh/ec281422-radeon/leib.K3_2-hoehle.png` laut 44).
- Wurzel (gelesen): `_himmelAmAuge` gibt ohne Höhlen-Satz 1 zurück (`stamm/bild-himmel.js:2017`, :2043). Damit ist das Licht des Auges aus (:1970-1972).
  Der Rückstrahl ist unter der Decke aus (`stamm/bild-schatten.js:315`). DAZU, von 47 nur vermutet, an der Quelle bestätigt: Ein Platz mit Ersatz
  wiegt auf Stoffen ohne Himmels-Sicht `1 − ersatz` (`stamm/stoff-material.js:2454`). `_leuchtStoff` reicht `himmel || null` (:2064). Das Auge
  trägt `ersatz: true` (bild-himmel.js:1984). Darum erhellt das Auge Wand und Diele NICHT, auch wenn h = 0.
  Station: Beide Proben schießen bei stehender Schleife ohne Takt (`g5.js:1886`/`:1951` Haus, `g5.js:2227`/`:2343-2347` Höhle).
- Entscheidung: EINE Frage „fehlt dem Auge der Himmel" für Höhle und Haus. Dafür liest `_himmelAmAuge` die Decke über `_augeUnterDach`.
  Jeder Stoff unter der Decke trägt den Himmel 0 in den Pool. Es gibt kein Innen-Licht-Modul und keine Lampe je Haus.
- Stufen: Auge (`bild-himmel.js:2015-2043`, der Merker-Schlüssel trägt den Dach-Wechsel) · Haus-Stoff reicht seinen Himmel in `_lichtPoolTerm`
  (:2064) · Rückstrahl bleibt aus · Station: ≥ 0,5 s `__werkTakt` vor jedem Innen- und Höhlen-Schuss (Muster `g5.js:2279-2286`). Findet sie
  keinen Außen-Schatten, sucht sie im Kreis (6/18 Häuser `aussen` leer, `g5.js:1963-1978`).
- Leser: `bild-himmel.js:1965`, `dirigent-kern.js:1754` (`_leuchtQuellen`), `scripts/diag-hoehlen-sicht.cjs:1305/1310`, gate:hoehlen-sicht (j), jeder
  Stoff über `_leuchtStoff`. Bildpaar: Ego in haus_schwarzwald am Dorf, Mittag und Nacht, dazu die Höhle.
- Kosten: Das Auge ist ein Platz des bestehenden Pools. Stufe 2 ändert aber den Graph jedes Haus-Stoffs, darum gehört eine Programm-Zeile für
  Pflicht B dazu, vorher↔nachher gemessen. Dazu kommt eine CPU-Prüfung je Takt (`_augeUnterDach`, `stoff-material.js:2253`).
- Kriterien: siedlung.K1#2 4–5/18, Median 0,057/0,083 ↔ 18/18 ≥ 0,15 · leib.K3#2 Radeon Abfall 0,00004 ↔ [0,06; 0,25].
- Liegt: `w28-dorf-innen-leicht-pm` 6c090fc8 (WIP, Station); `w18-innen-licht` in main liefert die Decken. Aufwand M.

**4 · Klasse „der Boden der Ankunft ist EIN Stoff, Welt = Labor" (Spiel, Bild).** Blatt 48.
- Mangel im Bild: Der Teppich (selbst gesehen). Zahl: material.K1#1 boden 1,2957/1,2969, fels 1,1056 ↔ 0,9–1,1 (ec281422, beide Geräte).
- Wurzel (gelesen): Das Himmels-Bild ist nicht mittelfrei, sein Mittel liegt bei 1,13 (`stamm/daten.js:721`, `stamm/stoff-material.js:2734`, `ao = himmel/korn` :2745).
  w28-stadt-grund änderte mikroPx 1 → 3 (`daten.js:705-708`) und korn 2,0 → 0,6 (:735-739). Welche Zeile den Sprung 1,13 → 1,296 trägt, ist NICHT bisektiert.
- Entscheidung: Beide Bilder des Mikro-Stoffs werden mittelfrei. Der Sprung wird an seiner Zeile geschnitten, das Band bleibt.
- Stufen: Schritt 0 Bisektion c4010773 ↔ b065ed91 in EINER Welt · Korn · Himmels-Bild · Oktaven · Fels-Gestalt · Gassen-Stein · fern; angesehen aus Auge, Hügel 12 m, Dach 25 m.
- Leser: `stoff-material.js:1935, :900, :2828`, `studio-stoff.js:628/727`, `siedlung-wege.js:1387`, Linsen `g3.js:216/376/2617`, gate:pruefbuehne-licht S0 Nacht.
- Kosten: ALU im Boden-Fragment, 0 Dreiecke, 0 Pässe.
- Kriterien: material.K1#1 und #2 je +1 · Nachbarn material.K2#1 und K3 dürfen nicht fallen · schatten.K4 liest dieselbe Boden-Luma.
- Liegt: `w28-weg-koerper` b1ffbea3 (WIP, „Kante im Boden-Stoff"). Der Schnitt fährt IN dieser Welle. Aufwand M.

**5 · Klasse „Sonne gegen Himmel über die Uhr, am Dorf" (Spiel, Bild).** Blatt 45.
- Mangel im Bild: Die Mittags-Kuppel ist dunkler als jede besonnte Fläche (selbst gesehen). Niemand sitzt daran (ÜBERGABE §3).
- Wurzel: `welt-licht.js:971 himmelSicht` (Wurzel des Repos, nicht stamm/), Belichtung `:646/:667`, Atmosphäre `foundry-core.js:372 sonne`.
  Die Leuchtdichte der Kuppel misst KEIN Kriterium; die Tag-Kurve liest nur die untere Hälfte (`g3.js:799` laut 45, nicht nachgelesen).
- Entscheidung: Zuerst die Kuppel (Zenit, 45°, Horizont) im Ausgabe-Bild am Dorf gegen E_himmel/π·k derselben Tafel messen. Geschnitten wird nur in
  der EINEN Atmosphäre und ihrem Leser, nie an Tönung, Soll oder REF.
- Stufen: Kuppel Mittag · tiefe Sonne 7–10° (die Kugel-Pose frei von Werfern, A/B 0,70 heute UNGÜLTIG) · Dämmerung (Dichte-Krone im Lichtmesser
  `welt-licht.js:699-707`, `bild-himmel.js:2100`) · Nacht (Ursache nicht gelesen).
- Leser: `bild-himmel.js:249, 1962, 2083, 2337-2343`, `welt-licht.js:952`; die Studio-Bühnen lesen `__weltLicht` (jedes Studio ändert sich mit, darum ein Bildpaar je Leser).
- Kosten: Uniforms bei Änderung; per gpu-bank am Dorf messen.
- Kriterien: licht.K1#1 Sprung 0,50 ↔ ≤ 0,1 EV, Gold R/B 0,75 ↔ ≥ 1,3, Nacht −1,50 ↔ −5…−3 · licht.K2#2 Kugel 7° 0,96 ↔ ≥ 2,5.
- Liegt: kein Zweig (`w28-samen-lichtweg` d8887125 ist nur Befund). Aufwand M.

**6 · Klasse „Wald unter Tempo" (Spiel, Bild bei Fahrt).** Blatt 43 Stufen 2–3 (Stufe 1 liegt in Schnitt 1).
- Mangel: GT 63,8 m/s 1263/1780 Lücken-Bilder, schon vor dem Zwilling (eb3cc7f3); Sprint seit w22-wald-geburt 4771/5412 (6aa7a5a6).
- Wurzel: `vegetation-baum.js:2815-2823` misst den Eintritt vom Spieler (`dEin`), nicht längs der Bahn; Rang `_bedarfWeg` `studio-bruecke.js:1869`.
- Entscheidung: Gebaut wird im Vorlauf der Bahn bei Blende 0, eingeblendet wird am Eintritt.
- Leser: `_archIsRendered`, `dirigent-ankunft.js:868/1232` (`_weltbildFehlt`), gate:pop, lod.K2#1.
- Kosten: Karten im Vorlauf v·vorlaufS auf Blende 0, also an Tempo und Schirm gebunden. Takt p95 der Fahrt 30,5 ms als Vorher-Wert.
- Kriterien: streaming.K1#1 Lücken ↔ 0 · K2#1 baum 58 % · karte 50 % ↔ ≥ 95 %. Die Messung braucht den Farm-Zeugen (`provjobd` fehlt in punkte.cjs).
- Liegt: `w26-fahrt-planer` 3da584a4d (WIP, nicht gelesen). Aufwand M (Stufe 2) + L (Stufe 3).

**7 · Klasse „die Welt steigt zum Labor" (Spiel, Bild).** Blatt 44.
- Mangel: Die Häuser sind glatte Kästen (selbst gesehen). studios.K4#1 0/7 ↔ ≥ 3/7 ≤ 2,1 %; die Differenz fiel 97,9 → 8,3 %, weil die Bühne stumpf wurde.
- Entscheidung: Die Bühne wird nicht weiter angeglichen; der Stoff des Werks kommt in die Welt am Dorf (Fachwerk, dann garage und schmiede).
- Leser: die Dateien von `w28-stoff-fuge` 212b6de9 und `w28-fassade` b038852b (nicht Zeile für Zeile gelesen); K4_PFAD (`g4.js:484-511`) löst R6 aus.
- Kosten: Ego-Bildzeit am Dorf vorher↔nachher. Liegt: die OMEN-Kette (siehe Kopplungen). Aufwand L.

**8 · Klasse „Stationen, die nie GRÜN sagen können" (pm, Wahrheit der Karte).** Blätter 44, 48.
- Wurzel (gelesen): fahrzeug.K2#2 trägt `ohne = ["25°-Hang","Furt","Ego und Third"]` fest, `gruen: c && ohne.length === 0` (`g5.js:5637-5639`).
  studios.K4#2 verlangt 7/7 (`g4.js:2185`), aber koerperstudio/tetrapoda melden immer „ungemessen" (`k4-bild.cjs:259`).
  vegetation.K4#2: `o.werkstatt` ist EIN Objekt (`scripts/diag-haus-welt.cjs:142`); jedes `setze` (:326) überschreibt es (:349).
- Entscheidung: Eine unerreichbare Staffel steht als „Station fehlt", nicht als ROT; die Linse von vegetation.K4 trennt den Ausgang je Setzen.
- Kriterien: vegetation.K4#2 (+1 möglich, Gegenprobe 0 px ↔ > 0); die anderen bewegen keinen Punkt, machen die Fahrt aber kürzer. Aufwand S.

## Kopplungen (die Reihenfolge ohne Kreis)
- 1 und 2 vor jedem Bild-Schnitt am Dorf: Ohne sie urteilt die Karte über Lage, NaN und tote Felder. Ein Bild-Schnitt fiele dann ROT oder bliebe ungemessen.
- 2 vor 4: schatten.K4 trägt den Rückstrahl der Boden-Luma (0,098 an der Ankunft). Landet 4 vor 2, ist der Boden-Schnitt nicht vom Platten-Fehler zu trennen.
- 3 trägt leib.K3#2 mit: Die Station-Stufe (Takt vor dem Schuss) gilt für Haus UND Höhle. Die Spiel-Stufe darf `_augenLichtStaerke` der Höhle nicht senken (gate:hoehlen-sicht).
- 4 vor 5: material.K1 misst Welt/Labor. Ein Himmel-Schnitt verändert beide Seiten (die Bühne liest `__weltLicht`). Wer zuerst den Boden mittelfrei macht,
  sieht den Himmel-Schnitt auf einem wahren Boden. 4 bewegt das Himmels-Bild, also die Nacht (S0, `daten.js:722-730`: krume 0,025 hält die Nacht-Luma) —
  licht.K1#1 Nacht mitmessen.
- 4 hängt an der Kette OMEN: `w28-mp-boden` f97fe692 → `w28-stadt-grammatik` (Abgabe 228727187) → `w28-weg-koerper` b1ffbea3. Davor landet 4 nicht.
- 7 hängt an derselben Kette (`w28-fassade`, `w28-stoff-fuge` erben stadt-grammatik und mp-boden) und kommt nach 3, denn Haus-Stoffe bekommen in 3 einen neuen Pool-Eingang.
- 6 Stufe 2 berührt lod.K2#1 (Pop 0,0474 gegen 0,05, ein Wackler am Soll) und gate:pop. Sie gehört nach `w28-karte-stamm` (gelandet z427) und nach einer frischen lod-Messung aus 2.
- 5 ändert jedes Studio. Darum kommt 7 nicht zwischen zwei Himmel-Stufen.

## Widersprueche zwischen den Blaettern und was die Quelle sagt
- ÜBERGABE (Stand beim Sichern) nennt für 221 → 219 „Täter nicht benannt, Kandidaten z424–z426". Blatt 46 nennt den Ortswechsel ab71fe5be. Die Quelle stützt 46:
  Beide GRÜN-Belege stehen am alten Ort [-840.7,-866.4] (origin stand.json), die ROT-Messung an der Ankunft. Ein Spiel-Byte braucht diese Erklärung nicht.
- 47 schätzt Schnitt 3 als S–M „0 neue Programme". Die Quelle widerspricht: `stoff-material.js:2454` (`1 − ersatz` ohne Himmel) — das Auge erreicht Haus-Stoffe nur mit einem
  Graph-Eingang je Stoff. Das ist M und eine Programm-Zeile.
- 44 erklärt die schwarze Höhle mit „Station ohne Takt", 47 das schwarze Haus mit dem Gesetz. Beides gilt (g5.js:2343-2347 und bild-himmel.js:2017); darum ist es eine Welle.
- 41 nennt 9 Zeilen `wetterWunsch`. Gelesen sind 8 Code-Zeilen und 1 Kommentar (`g2.js:1356`).
- 44 nennt k4Zahl an `g4.js:450/460`. Gelesen: `:458` Definition, `:460` Filter, `:2185` die 7/7.
- 45 schreibt `welt-licht.js` ohne Ordner. Die Datei liegt an der Wurzel des Repos (`welt-licht.js:971` himmelSicht bestätigt).
- 42 sieht den Kalt-Boot an nackter Erde am Waldrand, den K4-Blick am Rondell. 46 nennt den Ortswechsel. Ob beides dieselbe Ursache hat: keine Quelle gelesen.

## Gestrichen (ohne Datei:Zeile oder von der Quelle widerlegt)
- 43 klang.K5#2 „Bildrate der Radeon halbiert" — Deutung ohne Profil, vom Blatt selbst so genannt.
- 44 studios.K2#2 „Poncho als Voxel-Hülle macht den Neubau langsam" — Kandidat, nicht gemessen.
- 44 #3/#4, 43 #4: „kippt nebenbei (Vermutung)" — ohne Messung, keine Planungsgrundlage.
- 45 Nacht-Stufe „Laternen-Pool der Ankunft" — ohne Datei:Zeile.
- 48 vegetation.K4 „die Nah-Wiese folgt dem verstellten Spieler" — vermutet. Es bleibt nur das gelesene Überschreiben von `o.werkstatt`.
- 41 „falsch 6 → 0" als sicher — das Blatt nennt es selbst unbewiesen; gebucht wird nur, was die Headless-Fahrt sagt.
- 47 „0 neue Programme" — widerlegt (oben).

## Ehrlich offen
- Die Headless-Farm schreibt seit 10.11. 12:08 keine Messung (`messung/6aa7a5a6-headless.json`); Ursache nicht gelesen. Schnitt 1 (affekt, spielgang) bucht erst danach.
- Der Absturz der Radeon-Werkbank Exit 3221226505 ist unbenannt; er macht ganze Fahrten ungemessen.
- profiband (0/10) fällt nur mit dem bewegten Takt der Pflicht E (`stamm/dirigent-takt.js:2107` laut 45). Kein Schnitt dieser Familie kippt es.
  Radeon Gehen 58 ms ↔ ≤ 33 ms sperrt zugleich leib.K1 (Kette 31,6 ms bei Bild 49,4 ms).
- 58 der 111 offenen Punkte haben keine Station (ÜBERGABE §5). Diese Familie baut keine neue, so verlangt es der Kurs.
- Nicht gelesen: ob `__ausgabeAufnahme` Tag-Nacht und `_augeUnterDach` je Schuss rechnet. Davon hängt ab, ob in Schnitt 3 der Takt allein reicht.
- Nicht gemessen: die Leuchtdichte der Kuppel gegen die Tafel (5). Die Zeile von w28-stadt-grund, die den Boden +15 % hebt (4). Ob die Station an der Ankunft
  ≥ 100 Kamm-Spalten findet (2). Der GT bei 64 m/s (6).
- Kein Innen-Bild und kein Höhlen-Bild selbst angesehen. Das Fachwerk-Bild der Welt (`fachwerk-welt.png`) hat kein Blatt gesehen.
