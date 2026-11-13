# 29 v1-Pfad Schritt 1: ankommen — der Prüfplatz (Pflicht F)

## Was der Spieler sieht (mit Bildpfad; sonst „kein Bild gesehen")
- HEUTE am Ort der Ankunft (`probe-post/w28-platte-fein/02c27132-genesis-0.5.png`, Mittag, Messort S2 Blick West): ein graues
  Kopfstein-Rondell im Bogenverband, vier Tore mit Membran (blau, Spiegel-Gold, Orange-Wüste), dazwischen Rasen-Keile mit
  gelb-grünen Zacken-Halmen, eine Holzbank und eine Laterne, dahinter dichter Laubwald. Der Himmel oben ist dunkel-marine.
- VORHER (`bericht/pruefplatz/vorher/genesis-ego-alt.png`): graue Steinscheibe, beige Kästen-Tore eng im Ring R 11, Erde. Der Platz
  ist seit dem 01./02.11. ein anderer Ort: Teil I von F steht im Spiel.
- Kein Bild gesehen von Arena, Spielplatz, Strecke, Zoo oder Stadt-Silhouette. Vom Platz aus liegen sie alle ≥ 210 m entfernt, im
  ersten Bild ist keine davon zu sehen (Plan §6 S4, `fachwerk-core.js:9637`, `:9655`, `:9657`).
- Das Dorf (`scratchpad/dorf-main-0.5.png`) ist das Start-Viertel bei r 190 (`fachwerk-core.js:9648`), nicht der Platz: brauner Boden,
  violette Weg-Schlieren, ein glatter weißer Kasten als Haus, Zacken-Wiese am Hang.

## Was die Quelle sagt (Fakten mit Datei:Zeile und Zahl; was das Gesetzbuch KANN gegen das, was die Welt davon KONSUMIERT)
- EIN Plan: `GENESIS_ORT` `fachwerk-core.js:9587-9724` (Rondell r 10, 10 Tore auf r 22, Mall, Teich, Wiese, Fels, Saum, Zoo r 265,
  Viertel r 190, Arena r 260 / k 9, Spielplatz r 260 / k 6). Er wird im Faden als erster Auftrag gerechnet (`gelaende-boden.js:428-461`).
  Der Wirt liest nur (`siedlung-ort.js:2082-2122`): 1×/s, höchstens `GENESIS_JE_TAKT` neue Werke je Takt.
- **Spielplatz:** Das Gesetzbuch trägt 8 Geräte mit `siteTag: "spielplatz"` (`fachwerk-core.js:6549-6556`). Der Plan nimmt sie über
  `spielplatzGeraete` (`:9841`) auf, der Wirt setzt sie (`siedlung-ort.js:2190-2192`). Der Spieler kann sie benutzen
  (`koerper-bewegung.js:114` `_leibAngebote`). KONSUM 8/8 Geräte. Ein KIND fehlt: in `siedlung-bewohner.js` gibt es 0 Treffer für
  `kind|Familie`.
- **Arena: Das Gesetzbuch trägt den Hof, die Welt liest davon 0.**
  - `schmiede-core.js:4691-4703` `ARENA_HOF`: 31 Zeilen, jede Art an ihrem Ort (Waffenhof, Schnitthof, Schießbahn, Dojo, Tisch, Torii).
  - `:4648-4687` `ARENA_SATZ`: die Glieder an ihrem Gelenk. Aus dem Quelltext gezählt, nicht ausgeführt: ≈ 84 Werke.
  - `:4597-4644` `ARENA_ARTEN`: 25 Hof-Arten und 17 Glieder.
  - `:5174` `KIND_POLICY arena_`: die Baupläne `arena_<id>` sind in der Welt registriert.
  - Die Welt antwortet dem Treffer bereits über den EINEN Stoß (`kampf.js:2043-2140` `_geraetVon`/`_geraetHieb`, Pick `:2265-2285`).
    Die Mechanik prüft `scripts/lib/kampf-proben.cjs:3114-3139` headless.
  - Leser von `ARENA_HOF` heute: nur das Labor (`worlds/schmiede/schmiede.js:944`). In `stamm/` gibt es 0 Leser.
  - Der Plan behauptet das Gegenteil: „Die Arena bleibt Fläche, bis ein Gesetzbuch ihren Hof trägt" (`fachwerk-core.js:9653`,
    `siedlung-ort.js:2188-2189`). `ARENA_HOF` steht seit a1a0e60f (31.10.) im Kern, der Satz seit 2ef342af (01.11.).
    Seit 12 Tagen heißt es also „Sage a, tue b".
  - Die Fläche passt: Plan-Kasten 49 × 42 m (`ex 24.5, ez 21`, `:9655`), Hof x −7…38 / z −18,5…19 ≈ 45 × 38 m. Seine Mitte liegt bei
    x +15,5, also verschiebt sich der Hof um −15,5 m.
- **Strecke:** Das Gesetzbuch trägt die Bahn (`gelaende-core.js:200-323` `bahnNormal`: Bögen, Überhöhung, Kuppe, Kicker · Lücke ·
  Tisch · Landung). Die Bühne `spec/pruefbuehne/strecke.json` hat Soll Runde 55–65 s und Flug 18–22 m. Leser sind nur die Garage
  (`worlds/garage/garage.js:495-496`) und `vehicle-core.js:4102`. Im GENESIS_ORT gibt es keine Zeile `strecke`, KONSUM 0. Die Bahn
  misst nachgerechnet ≈ 555 × 350 m (x −45…510, z −350…0). Der reservierte Rahmen ist 320 × 220 m (Plan `bericht/pruefplatz/plan.md:165`),
  sie passt also nicht hinein.
- **Stadt-Silhouette:** Das hängt an der OMEN-Kette (`w28-stadt-grammatik` 156cc903 WIP, UEBERGABE §4). In main gibt es keinen Leser vom Platz aus.
- **Richter:** F hat keine Station: `pflicht.json:47-55` `stationen: []`, ohneRichter „Schaukel, Arena, Strecke, vier Wagen, Silhouette".
  B: `ankunft.K1#1/#2` ungemessen (Absturz Exit 3221226505 an 36f9d45a, `stand.json:133-175`), ankunft.K2#1 hat 1 Punkt
  (t(Kontrolle) kalt 8,78 s Radeon, `:179`).

## Die EINE begrenzende Entscheidung
Die Breite von F wächst nur aus Gesetzbüchern, die schon tragen. Zuerst fällt die Arena GANZ, denn ihr Hof steht im Kern und ihr
Stoß in der Welt, und nur der Haken fehlt. Strecke, Kind und Silhouette brauchen ein neues Gesetz bzw. die OMEN-Kette und werden
nicht in dieselbe Welle gemischt.

## Der Schnitt (die Klasse ganz: Stufen · Leser-Liste mit Datei:Zeile · Kosten-Zeile · Kriterien der Meisterkarte mit Id, Ist ↔ Soll, Station)
**Klasse = der Arena-Hof in der Welt, alle Stufen in EINER Welle:**
1. Hof-Bauten (dojo, waffentisch, torii),
2. 22 Geräte samt Mehrfach-Zeilen (4 Zielscheiben, 4 Papageien),
3. alle Glieder am Gelenk (Stechring ×3, Gassenball ×4, Bambusrohr ×11, Ritter/Kämpfer mit Armen und 8 Bannern, Kirmes-Enten ×3 …),
4. ihre Stufen L0 · L1 · Wurf, wie das Buch sie trägt (`schmiede-core.js:4152-4158`).

**Bauen:**
1. `schmiede-core.js`, additiv mit Byte-Beweis (Waffen-Goldens gleich): eine reine Funktion `arenaHofTeile(yaw)` →
   `[{id, x, y, z, gier, ov, seed}]` aus `ARENA_HOF` × `ARENA_SATZ`, die Mitte des Hofs auf 0/0. Der Kopf `:4646` verspricht
   „EIN Satz, zwei Leser", heute gibt es einen.
2. Das Labor `worlds/schmiede/schmiede.js:944` und `:530` liest dieselbe Funktion, damit die Drehung nicht doppelt gerechnet wird.
3. Der Wirt `siedlung-ort.js:2193` in `_genesisWerkListeBauen` bekommt je Teil
   `w("geraet", "arena", "arena_" + id, {x: A.x + rot(t), z: …, gier: A.phi + t.gier, seed, ov}, i, {dy: t.y + 0.5})`.
   Das ist dasselbe Muster wie der Spielplatz in `:2191`.
4. Es stirbt der falsche Satz `fachwerk-core.js:9652-9654` und `siedlung-ort.js:2188-2189`. Der Absenz-Grep auf „bleibt Fläche"
   muss 0 ergeben.

**Leser-Liste (wer liest, was sich ändert):**
- `siedlung-ort.js:2139-2144` `_genesisWerke` (Bühne `arena`, liegt schon)
- `:2214-2238` `_genesisWerkSetzen` → `spawnArchitecture`
- `:2202-2205` (Prüfbühne ohne Wildnis: es kommt kein Arena-Werk hinzu, gate:pruefbuehne zählt weiter 21/25)
- `kampf.js:2051`, `:2059`, `:2097`, `:2265`
- `dirigent-takt.js:1081` (Werke ruhen außer Reichweite)
- `schmiede.js:530`, `:944`
- `fachwerk-core.js:10006-10010`, `:10058`, `:10487`, `:10519`

**Kosten-Zeile:**
- Ankunft: Δ 0 per Bau. Die Arena-Mitte liegt bei r 260, ihr Rand bei ≈ 228 m > `residentM` 210 (`fachwerk-core.js:9707`), also wird
  sie erst geladen, wenn der Spieler auf dem Weg k 9 ist (`:9678`). Die Kalt-Zeile B und S1/S2 bleiben unverändert, kein Programm
  kommt vor dem Bild hinzu.
- An der Arena-Station: Haushalt laut Brief ≤ 30 Befehle / 45k Dreiecke / +2 MB / CPU Δ ≤ 0,5 ms (`briefe/arena.md:46-49`).
  Gemessen ist das nicht. Die Obergrenze bei voller L0 wäre ≈ 84 × 3 400 = 286k Dreiecke, sie gilt aber nur am Schirm, nie an der Weltgröße.

**Meisterkarte:**
- Pflicht F `pflicht.json:47-55`: Ist 0 Stationen, Teil „Arena (der EINE Stoß der Schmiede)" ohne Richter. Soll ist das Teil-Kriterium
  „die Arena antwortet dem Treffer mit allen Geräten" (`PFLICHT-OFFEN.md:20`).
- Abgabe: ein Bildpaar an fester Kamera am Ende von Weg k 9 (Ego + Third, Mittag), dazu headless die Zahl der stehenden Werke =
  Länge von `arenaHofTeile` (≈ 84) und `kampf-proben` 3114 an den gesetzten Werken (stumm = 0). Es kommt keine neue Station und keine
  neue Schwelle hinzu.

## Was schon liegt (Zweig, Kopf, was fehlt bis zur Landung)
- `w4-arena-welt` f5add9e2: gelandet (Stoß, Baupläne, Stoffe der Teile). `w4-genesis-ort-wirt11` 2e042f0d: gelandet (Plan, Wirt, Spielplatz).
- Für den Arena-Haken gibt es keinen Zweig. Bis zur Landung fehlt EIN Commit über `schmiede-core.js`, `schmiede.js` und
  `siedlung-ort.js` (+ Kommentar in `fachwerk-core.js`) und ein Bildpaar.
- Für die Strecke liegt `spec/pruefbuehne/strecke.json` (w11-fahrzeug). Es fehlen die Zeile im Plan und ein Rahmen ≥ 560 × 360 m.
  Der Brief `briefe/strecke.md` ist veraltet: er will ein neues `STRECKE_GESETZ`, obwohl die `bahn` schon trägt.
- Für die Stadt liegt `w28-stadt-grammatik` 156cc903 WIP bei der OMEN. Erst danach kommt die Silhouette.

## Ehrlich offen (nicht gelesen, nicht gemessen, Widersprüche)
- Nicht geprüft ist, ob `spawnArchitecture` mit `dy` ein hängendes Glied (Pendelball 2,65 m, Papagei 4,6 m) richtig an sein Gelenk
  setzt. Die Probe benutzt `precise: true` (`kampf-proben.cjs:3118`), der Wirt den Weg mit `dy`.
- Nicht gelesen: die Platzierung der Tontaube in `ARENA_SATZ` (`:4684` setzt nur den Wurfarm). Die 84 sind von Hand gezählt.
- Nicht gemessen: Kosten an der Arena, Kosten des Spielplatzes, die GPU-Zeit des Kopfsteins.
- Widerspruch: F verlangt Stationen je Zone (`pflicht.json:52`), der Kurs vom 13.11. verbietet neuen Prüf-Apparat. F kann ohne
  Richter nicht fallen. Ob ein Bildpaar plus headless-Zahl als Richter gilt, entscheidet der Koordinator bzw. der Schöpfer.
- Das Kind auf der Schaukel fehlt ganz, im Körper-Gesetz gibt es keine Rolle „kind". `FUND-REGISTER.md:110`: das Schaukel-Sitz-Flackern ist ungeklärt.
- Der Strecken-Rahmen ist um ≈ 235 × 130 m zu klein. Ein neuer Ort muss ≥ 364 m vom Anlauf 400/400 der Stadt-Messorte halten.
- Der dunkle Mittag-Himmel steht in jedem Ankunftsbild, er ist nicht Teil dieses Bereichs.

## Rang (Wirkung im Bild oder im Takt 1–5 · Aufwand S/M/L · Risiko in einem Satz)
- Arena-Hof in die Welt: Wirkung 4 (eine Zone von F wird im Spielpfad benutzbar, 0 → ≈ 84 Werke, die dem Hieb antworten; im ersten
  Ankunftsbild 0) · Aufwand S · Risiko: Glieder hängen falsch oder das L0 von ≈ 84 Werken reißt an der Station das Band. Darum wird es
  vor der Abgabe gezählt.
- Strecke als `bahn` im Plan: Wirkung 4 · Aufwand M · Risiko: der Rahmen muss neu gelegt werden, und eine Bahn im Erbgut der
  Standard-Welt ändert den Gelände-Hash jedes Saves.
- Kind am Spielplatz: Wirkung 3 · Aufwand L · Risiko: eine neue Leib-Größe zieht jede Stufe des Menschen mit (Kleid, Haar, Gang).
