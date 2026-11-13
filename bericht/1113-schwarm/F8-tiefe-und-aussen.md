# F8 tiefe-und-aussen

Verdichtet aus den Blättern 57–64. Nur gelesen, kein Lauf, keine GPU. SPIEL = `.claude/worktrees/leib-kanon-urteil` (main ec281422), REPO-Köpfe per
`git log origin/<zweig>` am 13.11. nach 21:37 gelesen. Selbst angesehen: `BILD/dorf-main-0.5.png`, `BILD/wiese-mitte/kand4-dorf-rot.png`,
`KO/probe-post/w28-stadt-grammatik/22872718-dorf-0.5.png`.

Was ich in den drei Bildern SEHE: Platz und Gasse sind brauner Sprenkel-Teppich mit violetten Schleiern ohne Kante. Die Häuser sind weiße glatte Kästen,
ihre Fenster flache dunkle Tafeln. Um jedes Haus steht nichts außer der Tür-Treppe: keine Rinne, kein Fallrohr, kein Stapel, kein Beet. Unter dem Haus
liegt ein harter Schatten aus blau-schwarzem Rauschen (22872718, etwa ein Zehntel des Bilds). Am Hang stehen gelbgrüne Zacken-Karten in Lagen. Die
Oberkörper sind Ballons, die Hemden reißen an der Seite, und das rote Hemd zeigt Farb-Treppen (kand4). Der Himmel ist in dorf-main dunkel-marine, in
22872718 bei derselben Uhr hell grau-blau.

## Die Schnitte, gereiht

**1 · Saat-Entscheider lesen die Saat-Höhe (Blatt 60).** Der Mangel liegt im Takt: Die Mehrspieler-Wand hält die ganze Stadt-Kette fest (UEBERGABE:39).
- Wurzel: `stamm/kreatur-leben.js:1681-1687` `_bodenKlasseAt` liest `_terrainMacroSurfaceY`, also `hoehe` samt Erdbau (gelaende-boden.js:711-712).
  Geschwister sind `_pegelOrte` (wasser-hydro.js:282-286, y samt Erdbau, Schlüssel ohne Erdbau-Stand), `ortCtx.hoeheAt` (gelaende-core.js:2673,
  „samt dem Erdbau früherer Orte" :2655) und der Trickle auf Wanduhr (kreatur-verhalten.js:3185 `performance.now()/1000` → :3218).
- Entscheidung: Was aus der Saat entschieden wird, liest `hoeheGrund`. Jeder Merker, der den Erdbau liest, trägt `_erdbauStand` im Schlüssel.
- Stufen in einer Welle: (1) `_terrainSaatY` in `_bodenKlasseAt`, (2) `_pegelOrte` an `_erdbauStand`, (3) `ortCtx.hoeheAt` → `hoeheGrund`, (4) Trickle auf `spielZeit`.
- Leser: Blatt 60 Z. 58–64. Für Stufe 3: fachwerk ortPlan, Ring-Wahl, voxel-worker ortWahl, gate:settlement Teil O (Plan-Hash Studio = Welt).
  `gelaende-core.js` ist ein Kern, deshalb braucht Stufe 3 einen Byte-Beweis: der Plan bleibt am Dorf in Spawn-Folge byte-gleich.
- Kosten: 0 Dreiecke, 0 Programme. Stufe 1 rechnet einen Gang weniger.
- Kriterium: feld.K2#2. Ist: GRÜN gehalten an 95ba6fd6, „Linse seit der Messung geändert" (PM stand.json:631-637). Am Stadt-Zweig ROT 3/3 ohne Schnitt,
  GRÜN mit Schnitt (UEBERGABE:89). Soll: GRÜN am Zug.
- Liegt: Stufe 1 in `w28-mp-boden` (Kopf 77c31f1a, Merge über f97fe692). Sie steckt schon in `w28-stadt-grammatik` 45290d87 (Ahnen-Probe:
  mpboden-in-stadt). Die Stufen 2–4 liegen nirgends.
- Aufwand: S (Stufen 1, 2, 4), M (Stufe 3).

**2 · Die Schale der Wiesen-Ferne fällt (Blatt 63).** Der Mangel liegt im Bild: Zacken-Wand am Dorf-Hang, nach Augenmaß 10–45 % Fläche in 7 von 8 Bildern.
- Wurzel: zwei Masken für eine Wiese. `stamm/vegetation-wiese.js:863-864` zeigt die Karte bei `gras` (Grund > 0) und die Büschel erst ab `traegt` (≥ `F.wiese`).
- Entscheidung: Die Schale fällt ganz, die Büschel tragen die Ferne. Der ferne Halm-Klon zeichnet auf Standard-Licht, die Zeile
  `origin/w28-wiese-fern:stamm/stoff-material.js:141` `_laubLichtStoff(m, false, …)` fällt mit dem Wurf :139-140.
- Stufen: Auge, Hügel, Dach, zugewandter Hang, Wegrand und Hausfuß, Winter. Der Zweig löscht laut Rumpf alles (16 Dateien, +359 −590, gelesen per diff --stat).
- Leser: vegetation-wiese.js :464, :590-616, :764, :1029-1212, :1383, :1513-1570 · daten.js:571-581 · stoff-material.js:71 · bild-kosten.js (4 Treffer, nicht gelesen).
- Kosten: Dreiecke 365 797 → 351 275, Ego Radeon 37,5 → 45,3 ms (Rumpf 476a3ed9). Bedingung: Ego ≤ 37,5 ms, Dorf-Ego ≤ heute. Hält das nicht,
  sinkt `NAH_WIESE.fern`.
- Kriterium: vegetation.K1#1. Ist: 0 Punkte, beide Geräte UNGEMESSEN „Station geändert" (stand.json:4419-4440). Soll: Ring-Gesetz bis 40 m.
- Liegt: `w28-wiese-fern` 476a3ed9, nicht in main.
- Aufwand: S.

**3 · Stein im Verband: EIN Knoten, bevor w28-stoff-fuge landet (Blatt 58).** Der Mangel liegt im Bild: Häuser ohne Stoff, nach Augenmaß 15–35 % in 8 von 8 Bildern.
- Wurzel: drei Kämme. `stamm/stoff-material.js:2779` `_steinStoff` mit sin-Hash :2792. `stamm/siedlung-wege.js:935-960` `_kopfsteinFarbe` sagt selbst
  „dieselbe Rechnung wie `_steinStoff`" (:931) und hat einen eigenen sin-Hash :960 und eine Fern-Regel :968. Dazu `_fugeStoff`
  (`origin/w28-stoff-fuge:stamm/studio-stoff.js:134`, Ton aus `steinTon` des Kerns :130).
- Entscheidung: `_steinStoff` wird der einzige Kamm, der Ton kommt aus `steinTon`, die Fern-Regel steht EINMAL. `_fugeStoff` und `_kopfsteinFarbe` liefern nur (u, v, Lage).
- Stufen: Tor-Quader, Kopfstein, Backstein-Gefach, Kantstein und Bord von Schnitt 5. Die Labor-Karten fachwerk-core.js:1799-1856 fallen mit `w28-studio-seiten`.
- Leser: studio-stoff.js:585-593 · siedlung-wege.js:924 · w28-weg-koerper `_kopfsteinMittel`/`_wegKoerperFarben` (nicht gelesen) · Goldens
  `spec/asset-contract/v6/golden/haeuser.json` · material.K3.
- Kosten: nur Pixel, 0 Befehle, 0 Dreiecke.
- Kriterien: material.K1#1 11/13 ↔ 13/13 (Blatt 58, nicht selbst an stand.json geprüft). material.K3#1 1,008/0,992 ↔ 0,95–1,05, darf nicht kippen.
- Liegt: `w28-stoff-fuge` 212b6de9 auf 22872718 (nicht auf 45290d87).
- Aufwand: M.

**4 · Der Hof reist mit dem Haus (Blatt 59).** Der Mangel liegt im Bild: Um jedes Haus ist leerer Teppich (alle drei Bilder).
- Wurzel: `fachwerk-core.js:5051-5052` „KEIN hofFuer (Schnitt-Grenze (a))" und `spec/asset-contract/v6/CONTRACT.md:64`. `hofFuer` (:3177-3226) hat in
  stamm/ 0 Leser (Grep 0), das Labor mischt ihn (`worlds/fachwerk/fachwerk.js:88`, `C.stufe<=2`).
- Entscheidung: `buildStufe` mischt `hofFuer(B)` in die Welt-Stufen 0 und 1, mit demselben B. Die Grenze (a) fällt an allen drei Stellen im selben Commit.
- Stufen: Rinne und Fallrohr (:3185-3194), Weg-Platten (:3204-3205), Stapel, Beet und Leine (:3206-3218), Kisten, Efeu, Trog (:3219-3223), Stadthof (:3199-3202).
  `hofGap` reist über das Slot-ov. Stapel, Trog und Beet bekommen Solids, sonst bricht die Kollision still.
- Leser: foundry-bruecke.js:888 · diag-fachwerk-contract.cjs:130,146 · haeuser.json · gelaende-kollision `__solids` · siedlung-wege.js
  `vorplatzBoden` (Doppel-Belag vor der Tür) · weg-koerper (Weg-Platten gegen Dorfweg-Körper).
- Kosten: Box-Prims in vorhandenen Rollen. Draws je Instanz plus die Rollen lehm, laub und stamm, nicht gemessen. Die Bauzeit im Worker ist eine Zeile für B.
- Kriterium: studios.K4. Ist: UNGEMESSEN, Radeon wegen Werkbank-Tod, GTX wegen Schloss (stand.json:3994-4013). Soll: ≤ 2,1 %.
- Liegt: nichts. Er setzt auf den Vertrags-Akt von `w28-stoff-fuge`, denn EIN Neu-Prägen von haeuser.json, nicht zwei.
- Aufwand: M.

**5 · Weg als Körper, die Erd-Stufe zuerst (Blatt 62).** Der Mangel liegt im Bild: violette Schleier ohne Kante.
- Wurzel: `stamm/siedlung-wege.js:1877` Nah-Texel 0,5 m und `:1880` `randM 0,6`. Die Kante verschmiert über etwa 1,7 m (Rechnung Blatt 62).
- Entscheidung: Der Querschnitt entsteht aus EINEM Gesetz als Körper. Die Karte trägt nur noch den Belag.
- Stufen: Dorfweg und Platz (Erde, Kante, Kies, Fassung), Gasse, Fahrstraße (Bord 0,12 × 0,16 m, `origin/w28-weg-koerper:fachwerk-core.js:9126`), Platz, Ferne ab 70 und 220 m.
- Leser: Rumpf b1ffbea3 (Blatt 62 Z. 63–68).
- Kosten: UNGEMESSEN. Glieder nur bis 70 m.
- Kriterium: keines nennt Bord oder Weg (Blatt 62). Die Abgabe ist das Bildpaar `bild:dorf@0.5`.
- Liegt: `w28-weg-koerper` b1ffbea3, 6 Dateien +670 −57 gegen stadt-grammatik, auf 22872718. Im Bild noch UNGESEHEN (Rumpf).
- Aufwand: M.

**6 · Der Himmel als EINE Klasse (Blatt 64), Spike vor Schnitt.** Der Mangel liegt im Bild: dunkel-marine bei Mittag in dorf-main. In 22872718 ist er bei derselben Uhr hell.
- Wurzel: unbenannt. Die Kette ist `welt-licht.js:565` `himmelFarbe = tafel × U.licht × U.toenung`.
- Entscheidung: Erst misst der Spike Tafel gegen Pixel in einer warmen Welt an genau DIESEN zwei Kameras, dann wird geschnitten. E0 bleibt unberührt.
- Stufen: Kuppel, Spiegel-Tafel, Studio-Grund.
- Leser: bild-himmel.js:2307 · wasser-hydro.js:820 · dirigent-ankunft.js:1630 · welt-licht.js:628. Die Leitplanke ist licht.K2.
- Kosten: 0 ms.
- Liegt: nichts.
- Aufwand: M (Spike S).

**7 · Der stumme Werkbank-Tod nennt sich selbst, dazu VERWEHT und sh.exe (Blatt 57).** Der Mangel liegt im Takt: profiband.K3#1/#2 und studios.K4#1/#2
stehen auf der Radeon UNGEMESSEN mit „Exit 3221226505" (stand.json:2972, :4004). Damit hat jede Kosten-Zeile der Schnitte 2, 4 und 8 keine Radeon-Zahl.
- Wurzel: unbenannt. Die Stellen sind punkte.cjs:2361-2374, `notbremse.sh:15-21` (`git add -u` auf jede Änderung, also auch auf reine Löschungen) und
  check.yml:1235/:1244 `shell: bash` am self-hosted Job :1224. `gpu-lauf.sh` hat keine sh-Zeile (Kopf :1-12 gelesen).
- Entscheidung und Schnitt: `--report-on-fatalerror` in NODE_OPTIONS, das Prädikat `verweht` in gemein.sh, gelesen von notbremse.sh und
  worktrees-ausduennen.sh, und sh.exe für gpu-lauf und die self-hosted Jobs.
- Kosten: 0 Spiel-Byte.
- Aufwand: S.

**8 · Tiefen-Vorlauf: jedes Pixel EINMAL beleuchtet (Blatt 61), Spike (a)/(b)/(c) vor Schnitt.** Der Mangel liegt im Takt: Radeon Ego Wiese 37,5 ms (Rumpf 476a3ed9).
- Wurzel: Jeder Foundry-Stoff mit Blende trägt `alphaTest` (studio-stoff.js:658). Es gibt keinen Vorlauf (Grep `Vorpass|prepass|Tiefen-Vorlauf` in stamm/: 0).
  Der Hauptpass bricht für das Tiefen-Abbild (bild-kosten.js:410, bild-sicht.js:165).
- Schnitt: wie Blatt 61 Z. 54–62.
- Kosten: Befehle 93 → bis ~188 bei einem K3-Soll von 208. Die Programme sind eine Zeile für B.
- Liegt: nichts.
- Aufwand: L.

**9 · Das Kleid als Schicht aus der Haut, alle Stufen (Blätter 58/62/63).** Der Mangel liegt im Bild: Ballon und Riss in 6 von 8 Bildern.
- Wurzel: `koerper-core.js:254`, Poncho mit `dicke 0`.
- Liegt: `w28-leib-nah` a9a3d136 (Kopf 21:37, nach ace30e73). Laut Bild 13 schließt das Hemd, die Schultern bleiben gebläht. Die ferne Stufe (Klötze) fehlt.
- Aufwand: M. Gehört der GTX 1050.

## Kopplungen (die Reihenfolge ohne Kreis)
- **1 trägt 3, 4 und 5.** `w28-stoff-fuge` und `w28-weg-koerper` stehen auf 22872718. Den heutigen Stadt-Kopf 45290d87 (mit mp-boden) enthalten sie nicht.
  Also landet erst 1 (mp-boden allein auf main), dann stadt-grammatik, dann wird in fuge und weg-koerper neu gemischt.
- **3 vor 4.** Beide prägen `haeuser.json` neu (Blätter 58 und 59). Erst der Stein-Knoten auf stoff-fuge, dann der Hof auf DEMSELBEN Vertrags-Akt.
- **3 und 5 berühren dieselbe Klasse.** Bord und Kantstein von weg-koerper sind Zeilen des Stein-Schemas. Landet 5 vor 3, kommt ein vierter Kamm dazu.
  Die Reihenfolge ist deshalb 3, dann 5. Oder 5 übernimmt den Kamm aus 3.
- **4 und 5 treffen sich vor der Tür.** Die Weg-Platten des Hofs (:3204-3205) und der Dorfweg-Körper von 5, dazu `vorplatzBoden`. Eine Leser-Zeile in beiden Commits.
- **2 kippt vegetation.K1.** Das sagt der Kern selbst: Die volle Büschel-Maske kostete an der Mess-Wiese 8,6 % der Kartenfläche und LAI 0,89
  (vegetation-wiese.js:1014-1017). Nimmt die Schale den Hang weg, wird der Boden-Stoff des Hangs (Rang 5 in Blatt 63, Stein-Pflaster-Muster, in kand4
  deutlich) sichtbarer. Das Bildpaar muss Hügel und Dach mitnehmen.
- **8 trägt 2.** Der Vorlauf macht den breiteren Halm zu reinen Tiefen-Kosten. 2 wartet NICHT auf 8, denn die Licht-Entscheidung in 2 kommt zuerst.
- **7 trägt die Messung von 2, 4 und 8** auf der Radeon. 7 berührt kein Spiel-Byte und läuft deshalb parallel in koordination und punkte-maschine.
- **6 hängt an nichts.** Die Leitplanke licht.K2 verbietet, dass 6 die Bestrahlung der Stoffe von 3 und 4 verschiebt.
- Reihe: 7 ∥ 1 → 2 ∥ 6-Spike → 3 → 4 → 5. 8 erst nach seinem Spike, 9 auf der GTX 1050 parallel.

## Widersprüche zwischen den Blättern und was die Quelle sagt
- **Ort der Ankunft.** Blatt 64 sagt: der Spieler kommt am Rondell an, das Dorf liegt bei r 190 (`fachwerk-core.js:9648`) und ist im ersten Bild nicht
  zu sehen. Ohne Akteur gilt `kegelM 150` (:9707). Die Blätter 58, 59, 62 und 63 messen am „Dorf der Ankunft". Der Kurs (UEBERGABE:24) sagt
  „Prüfplatz mit Dorf". Ich lege fest: Bildpaar am Dorf UND ein Blick vom Rondell. Wer die Pose S2 setzt, entscheidet der Schöpfer.
- **kand4-dorf-rot.png.** Blatt 63 sagt, dort stünden „einzelne Büschel auf dem Fels; liest ehrlich". Ich sehe dort Dutzende einzelne flache gelbgrüne
  Wimpel-Karten über einem freigelegten Stein-Pflaster-Hang und nur drei oder vier echte Halm-Büschel. Das ist besser als die Wand, aber die Klasse
  „flache Karte" lebt im Bild weiter.
- **studios.K4 hat drei Ist-Werte:** 23,9–46,1 % (Blätter 59 und 64 nach kurs-B:151), 97,9 → 8,3 % (UEBERGABE:36, „die Bühne wurde stumpf") und
  UNGEMESSEN (stand.json:3994-4013). Gilt die Quelle stand.json, ist kein Ist gebucht.
- **profiband.K3.** Blatt 61 nennt Ist „GTX Wiese 12,99 ms". stand.json:2967-3006 hat `zahl: null` auf beiden Geräten, ungemessen.
- **Boden-Teppich (Rang 1, Blatt 63) gegen weg-koerper.** Blatt 63 ordnet den braunen Sprenkel `w28-weg-koerper` zu. Blatt 62 sagt, der Zweig baut
  am Dorf (−136) nur Kante, Kies und Fassung. Ob er die Sprenkel-Fläche des Platzes und den Rausch-Schatten ändert, sagt kein Blatt. Ich habe es nicht gelesen.
- **Köpfe veraltet.** main ist 7f778d44 (z427, karte-stamm), nicht ec281422. stadt-grammatik ist 45290d87, nicht 156cc903. leib-nah ist a9a3d136, nicht ace30e73.
- Blatt 60 nennt kreatur-verhalten.js:3185 als Trickle-Ruf. Dort steht nur die Wanduhr, der Ruf ist :3218. Inhaltlich ist es richtig.

## Gestrichen
- Blatt 61: „Überzeichnung 8–15× → 1–2×" stammt aus einem Übersichts-Blog, nicht aus einer Primärquelle. Das Blatt sagt es selbst.
- Blatt 64: „Himmel 1,5–2 Blenden zu dunkel" ist eine Augen-Schätzung. 22872718-dorf-0.5.png zeigt bei derselben Uhr einen hellen Himmel. Die Zahl fällt, der Mangel bleibt an der Pose.
- Blatt 59: „fachwerk ≈ 40 %, vehicle ≈ 25 % gelesen" sind Grep-Zählungen ohne Kern-interne Rufe. Das ist kein Maß für Konsum-Tiefe.
- Blatt 59: „Welt-Stufe 2 trägt ihn mit, wenn B2c hält". Das ist eine Option. Entschieden sind die Stufen 0 und 1.
- Blatt 63: „liest ehrlich" für kand4 ist von meinem Blick widerlegt (siehe oben).
- Blatt 57: die Speicheroptimierung als Täter von VERWEHT ist nicht belegt, das Blatt sagt es selbst. Das Prädikat braucht keinen Täter.
- Blatt 62: „Fassade Wirkung 4 · S (nur Mischen)". `w28-fassade` b038852b enthält 22872718 nicht (Ahnen-Probe). Das Mischen ist ungeprüft, also nicht S.

## Ehrlich offen
- Die Wurzel des dunklen Himmels (6), des Werkbank-Tods 0xC0000409 (7) und von bash.exe ist unbenannt.
- Die Ursache des Kippers der Mehrspieler-Wand an w28-studio-welt ist offen. Stufe 1 erklärt ihn nicht (UEBERGABE:89). Kandidat ist Stufe 4 (Trickle), ungemessen.
- Der Rausch-Schatten unter den Häusern (Rang 6 in Blatt 63, in 22872718 etwa ein Zehntel der Fläche) und das graue Himmelsband (Rang 9) haben keinen Zweig und keine benannte Wurzel.
- Ob `_fugeStoff` auf Putz-Häusern sichtbar wird (die Dorf-Häuser im Bild sind weiß verputzt), ist nicht gelesen. Der sichtbare Gewinn von 3 am Dorf ist unbewiesen.
- Der Faden-Spiegel (voxel-worker.js, rund 50 „Mirror"-Marken, Blatt 58) ist der größte Zwilling im Code. Er steht nicht im Bild und hat L. Kein Schnitt in dieser Reihe.
- Keine Zahl in diesem Blatt ist eigene Messung. Tris, Draws und ms für 3, 4 und 5 sind ungemessen.
