# kultur-aus-klima — Stand-Blatt (ZWISCHENSTAND)

Zweig `kultur-aus-klima`, **Kopf 6** auf main 99649186 (der Schnitt von Kopf 5, an 54b89949 gebaut; Regel-Blatt 10:27: die nächste rote Front-Sprosse der Leiter). Sprosse:
`karte2.mensch.kultur.sprache#3` (Stammbaum aus gelesenen Wortlisten, Robinson-Foulds ≤ 0,3 in ≥ 70 %; U_eff ≥ 10²; ≥ 5 Familien).
Kopf 4 (5b21a935) ist GELANDET als `w28-kultur-aus-klima-4` (main 54b8994, V18.546.437) mit `karte2.mensch.kopplung.kultur#2` und
`karte2.mensch.kultur.sprache#1`. Karte 2 gebucht 130 von 1 718 (gate:betriebsgesetz 26.11.). Status ZWISCHENSTAND.

Auftrag 12:56 (`sprache-familie`, Richter OMEN Runde 38 auf 54b89949: 0 von 3) und Regel-Blatt 13:10 (Anspruch nur mit grüner
Station). Der Kopf trägt beide Schnitte, den Stammbaum (unten, sprache#3) und den gehaltenen Himmel (S2, kultur#2).

## Kopf 6 — derselbe Schnitt auf main 99649186 (das Wartezimmer von Kopf 5)

- **Die Probe von Kopf 5** (865cd4af, omen-gtx1060, 14:27, 651 s): gate:studio-begehen GRÜN 235 s. Das ist die Wand der Regel Haus,
  die der Schnitt an `fachwerk-core.js` trifft. gate:webgl-probe GRÜN 51 s. Zwei Wände ROT, beide geerbt, wortgleich an main 54b89949
  auf allen drei Läufern: gate:pruefbuehne-licht „S0 Himmel: … Bestrahlung 3.289e-8, der Himmel des Orts 2.74e-8“ (auch
  fahrzeug-stapel 445b4549) und gate:weltbild-frost:echt „dritte-person: B das Bild folgt der Kamera — 0.00 % der Blöcke“ (auch
  werk-am-ort 3fc3fb24, belichtung-daemmerung 6bca4418, buendel-mittag 52c07c4a und 8d0a9ebe). Der Absturz dort liegt in
  `stamm/werkstatt-vorschau.js` (`depthClearValue`) und `stamm/dirigent-ankunft.js` (`writeBuffer` null), nicht im Pfad des Plans.
  Nach dem Regel-Blatt 10:27 nicht geheilt, die Linsen nicht angefasst.
- **Der Vor-Richter** hat die Stationen an 865cd4af in vier Stunden nicht gefahren: kein Urteil im Briefkasten, in `probe-post/` oder in
  der Punkte-Maschine. Die Läufer maßen in derselben Zeit die Runde 38 am main.
- **main 99649186** (w28-buendel-mittag) fasst drei Dateien des Schnitts an (`scripts/diag-settlement.cjs`,
  `spec/stamm/modul-karte.json`, `stamm/siedlung-wege.js`). Der Merge ist ohne Konflikt. Am vereinten Baum: R12 GRÜN (r 0,576, Mutation
  100 %), gate:settlement-Selbsttest GRÜN („das Dach liest den Himmel nicht“ fällt in R12), die Modul-Karte ohne Abweichung, das Format
  sauber. Kopf 6 ist derselbe Schnitt als EIN glatter Commit auf diesem main.

## Kopf 5 — der gehaltene Himmel hebt das Dach (Station KULTUR S2)

### Was die Station liest (Zweig punkte-maschine, die Station des Zusammenspiels, KULTUR S2, wörtlich gelesen)

- 32 Zellen aus den Ringen von `_autoSettlementCellInfo`. Je Zelle setzt `DACH_AN` den Himmel über `__wetterSetzen` (sonnig · regnerisch ·
  sonnig gegen) und ruft `_foundryRequestSettlement({ seed, nH })` OHNE Klima.
- dach = mittleres `ov.pitchDeg` der Slots · regen = `_weatherFieldFor().rain` · r = Pearson(regen, dach) ohne den Gegenlauf ·
  mutationProzent = Anteil der Zellen, deren Plan-Hash (Kultur, Lage, W, D, Stockwerke, Neigung, Stil) sich mit dem Wetter ändert.
- Soll: r ≥ 0,5, Mutation ≥ 90 %; Zeugen: 32 Orte, Streuung des Niederschlags > 0, 32 Mutationen, 32 Gegenläufe gleich.

### Die Täter-Zahl (am alten Gesetz, main 54b89949)

Der Plan ohne Klima liest den Himmel nicht. `__wetterSetzen` hält das Wort (`state.wetterWort`, Schreiber „spieler“), aber
`_foundryRequestSettlement` reicht dem Kern nur Same und Häuserzahl. Der Richter: „S2 r 0 gegen ≥ 0,5“, „mutationProzent 0 % gegen
≥ 90 %“, Täter `fachwerk-core.js:2762 bauRezept`. Dieselbe Rechnung in node auf den 32 Zellen der Station: r 0, Mutation 0 %, Dach
sonnig 40,8° = regnerisch 40,8°.

### Der Schnitt (EIN Gesetz, gelesen an EINER Stelle)

- **Der Leser:** `_himmelDesPlans()` (`stamm/siedlung-ort.js`) liest den gehaltenen Himmel durch den EINEN Wetter-Leser
  (`_weatherFieldFor(wort).rain`, WX_GESETZ: klar 0 · bewölkt 0,12 · Nebel 0 · Regen 0,6 · Sturm 1,0). Der freie Himmel (kein
  gehaltenes Wort) gibt nichts; der Plan bleibt Byte für Byte der alte. Beide Pfade des Plans lesen dort: `_foundryRequestSettlement`
  (`d.himmel`) und die Kacheln der Wege (`kachelMassen(…, himmel)`).
- **Das Gesetz:** `himmelNeigung(P, a, regen)` in fachwerk-core. Unter gehaltenem Regen steigt die Neigung zum Reet-Band:
  s = min(1, regen / 0,6) · (50° − Grenze) / (60° − Grenze), Neigung = a + (60° − a) · s. Reet will 45° Minimum und üblich 50°
  (ZVDH-Regel für Reetdächer; FAO Thatch 1 : 0,6 ≈ 59°), die Kappe 60° ist die von `DACH_KLIMA`. Ein Regen außerhalb [0, 1] wirft beim
  Namen. Flache Deckung, Gewölbe und Kuppel bleiben stehen.
- **Die EINE Dach-Form:** `dachModus` / `dachFlach` in fachwerk-core. Das Bild zeigte, dass das marokkanische Haus mit Arkade flach
  blieb und nur der Schornstein wuchs (`ridgeY` folgt der Neigung). Darum lesen HAUS (`ROOFMODE`, `FLACH`) und `himmelNeigung`
  (`dachNeigt`) dieselbe Quelle. Gehoben wird nur ein Dach, das die Neigung auch baut.

### Gemessen (vorher main 54b89949 ↔ nachher Kopf 5, dieselben Zellen)

| Messung                                          | vorher  | nachher               |
| ------------------------------------------------ | ------- | --------------------- |
| r Regen ↔ Dach, die 32 Zellen der Station (node) | 0       | **0,547**             |
| Mutation der Pläne mit dem Wetter                | 0 %     | **100 %**             |
| Gegenlauf (sonnig, regnerisch, sonnig) gleich    | 32 / 32 | **32 / 32**           |
| mittleres Dach sonnig → regnerisch               | 40,8° → 40,8° | **40,8° → 52,9°** |
| R12, 32 Saaten ohne Klima (gate:settlement)      | r 0, 0 % | **r 0,576, 100 %**   |

Die Regionen der 32 Zellen: mitteleuropa 14 · mediterran 8 · nordisch 3 · fernost 3 · alpin 3 · antik 1.

**Vertragsakt:** Ohne gehaltenen Himmel ändert sich nichts. Der volle Bau aller 743 Häuser der sieben Klima-Klassen und des Labors hat
denselben Hash wie main (Sonde `haus-byte`), auch nach der Zusammenlegung von `ROOFMODE` in `dachModus`. Ein gehaltenes „klar“ ist
Byte für Byte der freie Himmel (R12: 32 von 32).

### Das Bild (diag-blick über den Stempel, swiftshader: die Form)

Marokkanisch, Same 488081, Slot 2 (Wohnhaus): klar 18° → regnerisch 50°. Unter Regen steht das Dach sichtbar steiler, Walm und Giebel
wachsen, der Schornstein wächst mit dem First und nicht allein. Das Bild vor dem `dachModus`-Schnitt zeigte den Fehler (flaches Dach,
langer Schornstein), das Bild danach nicht mehr.

### Die Linse (gate:settlement R12, Fachwerk-Familie)

- R12 fährt die 32 Saaten ohne Klima je zweimal, frei und unter gehaltenem Regen (0,6), dazu den Gegenlauf und das gehaltene „klar“.
  Soll: r ≥ 0,5, Mutation ≥ 90 %, Gegenlauf 32/32, klar = frei 32/32.
- Am alten Gesetz (main 54b89949, dieselbe Linse): **ROT** — „R12 … klar 41° · Regen 41°: r 0 (Soll ≥ 0,5), Mutation 0 % (Soll ≥ 90)“.
- Am neuen Gesetz: GRÜN, r 0,576, Mutation 100 %.
- Selbsttest (`--selftest`): der gepflanzte Täter „das Dach liest den Himmel nicht“ fällt in R12 beim Namen. „die Wüste baut den
  Sattel“ (Nadel auf `dachFlach`) fällt weiter in R10. SELBSTTEST GRÜN.

### Die Stationen (Regel-Blatt 13:10: Anspruch nur mit grüner Station)

- **KULTUR S2** (`karte2.mensch.kopplung.kultur#2`): **Station nicht gefahren.** Grund: die Station fährt in einer GPU-Sitzung
  (der Läufer der Punkte-Maschine). In der Wolke (swiftshader) stürzt der GPU-Prozess ab, die Welt steht nicht (Karten pnull), und `umstellen` sowie
  `bild` scheitern. Headless gemessen auf den Zellen der Station: r 0,547, Mutation 100 %. Der Vor-Richter fährt sie.
- **SPRACHE S1** (`karte2.mensch.kultur.sprache#1`): **ROT** · „Saaten der Namen 1 verfehlt ≥ 2“. Ursache gemessen: der Zensus bei
  `stadt-voll` zählt die Einträge von `_bewohnerSiedlungen`. In der Sitzung des Richters steht dort nur die Wort-Stadt (Same 7, ohne
  Klima, Region mediterran, 1 Name + 600 Leute); das Heimat-Dorf fehlt. Eine Siedlung trägt EIN Label, also eine Saat. Das Gesetz
  der Namen trennt die Regionen (R9 0,996); was fehlt, ist eine zweite Siedlung im Zensus des Messorts.
- **SPRACHE S3** (`karte2.mensch.kultur.sprache#3`): **ROT** · „S3 Umfang nicht erzeugbar: je Region EINE Silben-Tafel der Ortsnamen
  (fachwerk-core NAMEN, 6), keine Wortliste, keine Familie“. Die Station misst Art „nicht“ und kann am Kern nicht grün werden. Der
  Kandidat `cloud-post/kultur-aus-klima-station/` liest den Baum (192 Sprachen, 6 Familien, RF ≤ 0,3 in 6 von 6).

## Kopf 5 — der Stammbaum aus den Wortlisten (sprache#3, auf main 54b89949)

Dasselbe Gesetz wie sprache#1 (die Sprache je Region und Same, `spracheVon`; die Lautgesetze je Knoten), eine Stufe tiefer: die
Wortliste. Gelesen an EINER Stelle, `sprachWort(L, b)` in fachwerk-core; der Ortsname, die Linse und die Station lesen dort.

### Die Täter-Zahl (am alten Gesetz, main 54b8994)

- Der Kern trägt keine Wortliste: `sprachWort` fehlt, die Station misst `{ n: 3, art: "nicht" }` („je Region EINE Silben-Tafel“).
- Die neue Linse am Baum von main (gate:settlement, 653 s): ROT mit genau 1 Verletzung, R11 — „0 Sprachen in 0 Familien … der Kern
  trägt keine Wortliste (fachwerk sprachWort fehlt)“.
- Die Listen, die die Lautgesetze allein bauen (die Mutante „die Wortliste kennt keinen Ersatz“): 191 Sprachen, RF ≤ 0,3 in 0 von 6
  Familien (mitteleuropa 0,603 · alpin 0,655 · mediterran 0,534 · nordisch 0,345 · fernost 0,586 · antik 0,603). Die Lautgesetze eines Zweigs treffen jedes Wort gleich; die
  Schwestern bleiben ununterscheidbar, der Baum ist nicht lesbar.

### Der Schnitt (EIN Gesetz, `fachwerk-core.js`)

- `SPRACH_BAUM.bedeutungen`: 105 Bedeutungen nach der Grundliste (Swadesh 1971). Je Ursprache `U.lex`: das Wort der Ursprache
  (`_urWort` am Gesetz der Region); die Grundwörter der Ortsnamen und „haus“ stehen in derselben Liste.
- Je Blatt `L.lex`: das Wort der Ursprache durch die Lautgesetze seines Zweigs (`_lexWort`, dann das OCP).
- **Der Ersatz des Worts** (die Lexikostatistik: Lees 1953, Swadesh 1955): je 1 000 Jahre behält eine Sprache 86 % der Grundliste
  (`ERSATZ = { halten: 0.86, alter: 4000 }`). An jedem Knoten fällt eine Bedeutung mit 1 − 0,86^(alter/tiefe/1000) und wird ein neues
  Wort der Ursprache, das nur die Lautgesetze UNTER seinem Knoten trägt. Über die Wurzel teilen zwei Sprachen ≈ 30 % der Liste,
  Schwestern ≈ 79 %. Toponyme sind die konservativste Schicht: die Grundwörter und „haus“ bleiben.
- `sprachWort(L, b)` wirft beim Namen, wenn die Bedeutung nicht in der Liste steht; es gibt keinen stillen Rückfall.
- **Der Leser des Spiels:** der Ortsname (`ORTSNAME`, der Name auf der Karte und am Ort) liest sein Bestimmungswort aus der Liste
  (`SPRACH_BAUM.bestimmung`, 30 Bedeutungen; Bach 1953, Deutsche Namenkunde II).

### Gemessen (gate:settlement auf dem Baum von Kopf 5)

| Messung                                    | main 54b8994 (vorher) | Kopf 5 (nachher)                  |
| ------------------------------------------ | --------------------- | --------------------------------- |
| verschiedene Wortlisten U_eff (Soll ≥ 100) | 0 (keine Liste)       | **192**                           |
| Familien (Soll ≥ 5)                        | 0                     | **6**                             |
| RF ≤ 0,3 (Soll ≥ 70 % der Familien)        | —                     | **6 von 6 (100 %)**, Median 0,155 |
| der Ortsname liest die Wortliste           | —                     | **192 von 192**                   |
| R9 Namen aus ≥ 2 Saaten richtig zugeordnet | 0,993                 | 0,996                             |

RF je Familie: mitteleuropa 0,155 · alpin 0,017 · mediterran 0,19 · nordisch 0,034 · fernost 0,086 · antik 0,155. Lesart: die
Kompatibilitäts-Methode der Kognaten-Klassen (Buneman 1971; Ringe, Warnow & Taylor 2002), RF normiert auf 2(n − 3) (Robinson &
Foulds 1981). Der Leser kennt nur die Formen, nie den Zweig.

**Die Wortlisten (je Familie die Blätter 0, 1, 2 und 16, mit Same und Ortsname):** Blatt 0 und 1 sind Schwestern, 2 eine Base,
16 hängt am anderen Ast der Wurzel.

| Familie    | Blatt (Same, Ort)     | wasser · stein · berg · baum · feuer · mond · hand · zwei |
| ---------- | --------------------- | --------------------------------------------------------- |
| nordisch   | 0 (9, Høsnuk)         | tald · nis · snid · safjord · styd · hirkbad · steskan · ban |
| nordisch   | 1 (24, Vartald)       | tald · nis · snid · safjord · bed · hirkbad · staskan · ban |
| nordisch   | 2 (71, Drædvåga)      | tald · nit · snid · safjord · styd · hirkbad · kir · ban |
| nordisch   | 16 (27, Hedsned)      | tald · hjuld · sned · safjurd · stød · hadba · ker · fing |
| mediterran | 0 (30, Sapa)          | pa · mu · si · tom · calli · co · pu · ca                 |
| mediterran | 1 (7, Lausi)          | pa · mau · si · tom · calli · co · pau · ca               |
| mediterran | 16 (25, Latapa)       | pa · se · si · sulli · ma · cialla · po · ca              |
| antik      | 0 (5, Cyspaes)        | stes · les · ge · prosvos · myt · pem · brens · cex       |
| antik      | 1 (31, Cøsgas)        | stas · las · ga · prosvos · møt · pam · brans · cax       |
| antik      | 16 (10, Traecuonpaes) | stas · las · gan · cral · causpun · risas · brans · caem  |

Was man sieht: Die Schwestern teilen fast jedes Wort, oft mit einem Lautgesetz dazwischen (antik e → a, mediterran u → au). Der
andere Ast ersetzt ganze Wörter (nordisch „stein“ nis → hjuld, „zwei“ ban → fing; antik „baum“ prosvos → cral). „wasser“ und „berg“ sind
Grundwörter der Ortsnamen: sie werden nie ersetzt, nur ihr Laut wandelt (nordisch snid → sned). Das ist der Stammbaum in der Liste.

### Vertragsakt (nur Namen bewegen sich)

- Die Häuser sind Byte für Byte gleich: der volle Bau aller 743 Häuser der sieben Klima-Klassen des Planeten und des Labors hat
  denselben Hash wie main (Sonde `haus-byte`).
- Die Pläne der Dörfer unterscheiden sich nur in `.name`: dorf „Huvisnid“ → „Snadsnid“, stadt und stadt-voll (Same 7) „Mamilsi“ →
  „Lausi“. Die Bewohner tragen neue Laute derselben Sprache: „Besben Sebelf“ → „Basban Sebalf“.
- Golden `spec/asset-contract/v6/golden/siedlung.json` neu gestempelt (Same 7: Mamilsi → Lausi; Same 12345: Beldwert → Dindwirt;
  die Slots 16 und 7 gleich). gate:asset-contract GRÜN (407 s): der Generator trifft die Goldens byte-genau.

### Die Linse (gate:settlement R11, Fachwerk-Familie)

- R11 liest je Familie die Blätter, baut den Baum aus den Formen und misst RF gegen den Baum des Gesetzes. Soll: U_eff ≥ 100,
  ≥ 5 Familien, RF ≤ 0,3 in ≥ 70 %, und jeder Ortsname beginnt mit einem Wort seiner Liste.
- Am alten Gesetz (main 54b8994, dieselbe Linse): ROT, 1 Verletzung, R11 beim Namen (oben). Jede andere Regel bleibt dort GRÜN; auch
  R10 zählt am main 12 324 Wüsten-Häuser wie Kopf 5 (die 12 336 von Kopf 4 verschob main selbst).
- Selbsttest (gate:settlement --selftest): zwei gepflanzte Täter fallen in R11 beim Namen. „die Wortliste kennt keinen Ersatz“ (RF
  ≤ 0,3 in 0 von 6) und „der Ort liest die Wortliste nicht“ (der Ortsname aus einer Silbe der Ursprache). Alle 14 Täter des
  Klima-Gesetzes fallen in ihrer Regel; SELBSTTEST GRÜN.

### Die Station (Kandidat, `cloud-post/kultur-aus-klima-station/`, gegen origin/punkte-maschine 0e4cf4ac)

- Die Seiten-Funktion `sprachBaum` liest den Baum aus `__fachwerkCore` in der Welt; der Zeuge sind die Orte des Fächers. Die Sprosse 3
  geht von „nicht“ zu „zahl“. Zwei Proben: die Attrappe (Listen nur aus Lautgesetzen) ROT, der Stammbaum GRÜN.
- Wand 1 (die Liste der Punkte-Maschine, `liste`): Basis und Kandidat tragen dieselben zwei ROT (gelaende.K2#1/#2, Wand HAKEN), sonst nichts —
  1 976 Stationen, Fehler 2.
- Der Selbsttest der Punkte-Maschine: Basis 289 GRÜN · 5 ROT, Kandidat 290 GRÜN · 4 ROT, die ROT eine Teilmenge der Basis (die
  Umgebung der Wolke). PROBEN 16 630 → 16 634 GRÜN. Der Kandidat fügt kein ROT hinzu.
- Die Basis 55313a8b des Kandidaten von Kopf 4 ist überholt: die Station des Zusammenspiels wandelte sich im Zweig punkte-maschine; der Kandidat
  trägt alle drei Sprossen (kultur#2 und sprache#1 aus Kopf 4, sprache#3) gegen 0e4cf4ac.

### Gates (lokal auf dem Baum von Kopf 5)

- gate:settlement GRÜN (673 s, mit dem Selbsttest): R8 r 0,791, Mutation 100 % · R9 0,996 · R10 Wüste 12 324 von 12 324 flach ·
  R11 oben; SELBSTTEST GRÜN, 14 von 14 Tätern des Klima-Gesetzes in ihrer Regel.
- gate:asset-contract GRÜN (407 s, die neuen Goldens byte-genau) · gate:fachwerk-contract GRÜN (150 s, cv:6) · `npm run
  check:statik` GRÜN (498 s) · gate:profiband GRÜN (44 s) · `npm run format:check` GRÜN · gate:betriebsgesetz GRÜN.
- Die Sonden `haus-byte` (743 Häuser gleich) und `vertrag` (nur `.name` bewegt sich) gegen main 54b8994.

## Gelandet — Kopf 4 auf main (die Probe 5b21a935, radeon-890m, 09:31)

- **Die Probe:** GRÜN in 1 206 s — gate:pruefbuehne-licht 73 s · gate:weltbild-frost:echt 142 s · gate:studio-begehen 170 s ·
  `bild:dorf-trocken@0.42` 96 s · gate:webgl-probe 69 s.
- **Das Bild, mit eigenem Auge gegen Kopf 3 gelegt** (`probe-post/kultur-aus-klima/5b21a935-dorf-trocken-0.42.png` gegen
  `1a78aab2-…`): Das Haus von Nagu trägt die flache Platte mit der schmalen Lehmkante, ohne Schwung und ohne dunkle Ziegel; nur der
  Schornstein steht darüber. Auch das Haus dahinter und das Holzhaus rechts schließen flach. In Kopf 3 standen an derselben Stelle der
  geschwungene Giebel und das schwarze Ziegeldach. Das Gesetz steht im Bild.
- **Die Batterie am Zweig:** Die voll-Jobs der Läufe 45781041954 und 45781051348 brachen um 08:31 ohne roten Schritt ab (kopf, puls 2/2,
  einlass, die Probe und voll 3, 11, 12 GRÜN); der Koordinator stieß sie neu an.
- **Was die Landung trägt — und was nicht:** `karte2.mensch.kopplung.kultur#2` und `karte2.mensch.kultur.sprache#1` (die Station
  `cloud-post/kultur-aus-klima-station/` nennt genau diese zwei). **`karte2.mensch.kultur.sprache#3` ist NICHT in diesem Baum.** Die
  LAGE 12:15 nennt „#3“ unter den Ansprüchen von z754; sein Gesetz (die Wortlisten, der Ersatz nach Swadesh, die Linse R11) lag bis
  jetzt nur vorbereitet, außerhalb jedes Kopfs. Nach dem Regel-Blatt 10:27 („die nächste rote Front-Sprosse seiner Leiter“) kommt es als
  eigener Kopf 5 auf main 54b8994; bis dahin darf es nicht gebucht werden.
- **Der Anspruch 754 (`zug/anspruch.txt`, de2b560) bucht drei Sprossen auf `w28-kultur-aus-klima-4`, getragen sind zwei.** Woher
  `sprache#3` kam: die Message von Kopf 4 nennt den Namen in ihrem Offen (Zeile 47: „sprache#2/#3
  (karte2.mensch.kultur.sprache#3)“), der Anspruch nimmt jeden Sprossen-Namen der Message. Bitte die Zeile auf
  `karte2.mensch.kopplung.kultur#2,karte2.mensch.kultur.sprache#1` setzen; sprache#3 bucht erst der Kopf, der es trägt.

## Kopf 4 — die Wüste BAUT flach (das Bild der Probe 1a78aab2, gtx1050-desktop, 08:31)

### Der Befund

Die Probe von Kopf 3 fuhr GRÜN in 3 321 s: gate:pruefbuehne-licht 102 s · gate:weltbild-frost:echt 328 s · gate:studio-begehen 502 s ·
`bild:dorf-trocken@0.42` 160 s (abnahme bauSatz 29,6 %) · gate:webgl-probe 106 s. Die Welt steht am Ort der Reise; die acht Karten sind
geheilt. Das Bild urteilt anders als das Tor. Ich sehe in Nagu den geschwungenen Walm eines chinesischen Hauses mit dunklen Ziegeln und
schwarzer Traufe, kein flaches Lehmdach. Der Plan sagte „flach, 2°“, gebaut stand der Sattel.

### Die Wurzel (fachwerk-core HAUS, gelesen)

- `ROOFMODE` las die Deckung nicht. Eine Neigung von 2° unter `deckung: "flach"` blieb ein Sattel (oder ein Dach des Zoos), nur flacher.
- Der Schwung (`DEF_cv`, die gehobene Traufe: 1,35 · roofCurve · f^2,2, chinesisch 0,95 → 1,28 m) hob die Ecken unabhängig von der Neigung.
- Die Welt behält die Rolle des Teils (`mat = r => … {__role: r}`). Der Sattel unter der flachen Deckung trug darum den Ziegel der Kultur.
- Die Linse R10 las nur den Plan (`deckung`, `pitchDeg`). Sie war GRÜN, während HAUS den Sattel baute: 12 336 von 12 336 „flach“ im Plan,
  544 flach gebaut.

### Geschnitten (EIN Ort: die Dach-Quelle `ROOFMODE` in HAUS)

- **`FLACH`**: Die Neigung, die der Bau trägt (`pitch`, nach `grenzNeigung`), liegt unter `STADT_MASSEN.flachGrad`. Das ist dieselbe
  Grenze, mit der die ferne Masse `hausMasse` flach deckelt; es gibt keine zweite Zahl. Dann fährt das Haus die EINE flache Quelle, die
  Zinnen und Arkade schon tragen: die Platte auf der Traufe, kein Dachraum, kein Giebel, kein Dachwerk.
- **Das Gewölbe bleibt**: Kuppel, Tonne und Zwiebel tragen sich ohne Balken. Das ist der Lehmbau der Wüste (Yazd, Kashan, das nubische
  Gewölbe).
- **Kein Schwung auf dem flachen Dach**: `DEF_cv` gilt nur für ein geneigtes Dach.
- **Der Stoff der Platte ist die Deckung** (`DECKROLLE`): das Lehmdach des Orts (`dachmod`), wo die Wüste flach deckt. Sonst bleibt es der
  Stein des Wehrgangs (Zinnen, Arkade: byte-gleich).
- **Der Rundbau** trägt in der Wüste die flache Platte statt des Kegels (Masse `spitze` = Traufe + 0,12).

### Gemessen (Planet „anazh-realm-seed“, 1 200 Punkte, 78 Wüsten-Ziele, 8 Saaten × 14 Häuser, das Dach, das HAUS baut)

| | Kopf 3 (1a78aab) | Kopf 4 |
|---|---|---|
| Plan „flach ≤ 8°“ | 12 336 von 12 336 | 12 336 von 12 336 |
| gebaut flach (Platte im Lehm, ohne Schwung) | **544** | **11 928** |
| Gewölbe (Kuppel, Tonne, Zwiebel) | 408 | 408 |
| Form des Gesetzes gebaut | 952 von 12 336 (7,7 %, 0 von 624 Dörfern) | **12 336 von 12 336 (100 %, 624 von 624)** |
| Sattel gebaut | 11 384 (provenzalisch 3 672 · italienisch 3 536 · spanisch 1 224 · andalusisch 816 · …) | 0 |
| Schwung (gehobene Traufe) | 672 (japanisch 0,5: 480 · chinesisch 0,95: 192) | 0 |

- **Der Bau wird leichter**: 1 739 Wüsten-Häuser (200 Punkte) bauen in 7,2 s statt 15,1 s. Das Haus am Messort hat 14 940 △ statt
  69 684 △ (diag-blick, dasselbe Haus).
- **Byte-Beweis** (der volle Bau je Klasse, Hash über alle Teile): Labor, Pol, kalt, nass, Steppe und Süden sind Byte für Byte gleich
  (labor 56 6cdcf87b5ad8 · polar 116 ffa29a7a0454 · kalt 116 db1892203620 · nass 116 5018864e2836 · steppe 115 645b2e96e120 · sueden
  109 4d797f9fed58). Nur die Wüste bewegt sich (115 Häuser: a2430a456817 → 9120b6060a73).

### Das Bild (diag-blick über den Stempel des Dorfs, swiftshader: die Form; das Licht urteilt nur die Karte)

Dasselbe Haus von Nagu (chinesisch, Wohnhaus, Same 641789, Dorf-Same 11, Plan „flach, 2°“, roofCurve 0,95), vier Blicke im Streiflicht.

- **Kopf 3:** Ich sehe den geschwungenen Walm. Die vier Ecken sind hochgezogen, eine schwarze Traufe läuft rundum, der Ziegel ist
  körnig, und der First sitzt über der Mitte.
- **Kopf 4:** Ich sehe eine flache Platte auf der Mauerkrone. Sie trägt den Ton des getrockneten Lehms; nur der Schornstein steht
  darüber. Es gibt keinen Schwung, keinen Giebel und keine Traufe. Sockel, Wände, Fenster und Tür stehen gleich. Das ist das Gesetz im
  Bild.

### Die Linse (gate:settlement R10, Familie Fachwerk)

- **R10 liest jetzt das gebaute Dach.** Je Wüsten-Haus fährt der Mass-Bau des Gesetzbuchs (`MASSNUR`, wie los-proben). Gelesen wird
  die Masse „haupt“ (dach, curve, dachRolle) oder „rund“ (spitze, zwiebel).
- **Flach** heißt: die Platte ohne Schwung im Lehm der Deckung oder der flache Rundbau. Das Gewölbe zählt als Form des Gesetzes.
  Verlangt wird außerdem Schwung 0.
- **Gebaut wird einmal je Signatur des Plans:** alle Felder außer Maß, Same, Alter und Bewohner, denn das Dach liest keines davon. Das
  sind 110 Signaturen für 12 336 Häuser, 0,76 s.
- **Am alten Bau von Kopf 3 ist R10 ROT beim Namen:** 952 von 12 336, gebaut: Platte im Lehm 544, Gewölbe 408, Schwung 672.
- **Der Selbsttest** pflanzt zwei Täter, und beide fallen in R10 beim Namen (161 s):
  - „die Wüste baut den Sattel“ (`ROOFMODE` ohne `FLACH`): 952 von 12 336, Schwung 672.
  - „die Wüste behält den Schwung“ (`DEF_cv` ohne `ROOFMODE !== 'flat'`): 11 664 von 12 336, Schwung 672.
- **Die alten Täter fallen weiter:** „die Wüste deckt nicht flach“ (204 von 12 336; die Platte trägt den Stein statt des Lehms) und
  „die Wüste lässt das Werk des Stils stehen“ (12 132).

### Gates am Baum von Kopf 4 (lokal, ohne GPU)

- gate:settlement GRÜN: voll 548 s (R10 Wüste 12 336 von 12 336, gebaut Platte 11 928, Gewölbe 408, Schwung 0); der Selbsttest 161 s.
- `npm run check:statik` GRÜN (470 s), gate:fachwerk-contract GRÜN (129 s, cv:6), gate:profiband GRÜN (49 s), gate:haus-fern GRÜN
  (220 s, der Fernkörper grundriss-treu, kein Querfirst), Prettier GRÜN.

## Kopf 3 — die Frage der Karte fällt mit ihrer Welt (die Probe von Kopf 2, radeon-890m, 06:59)

### Der Befund

Kopf 2 (18cec0dc) fuhr auf der Radeon die drei Pflicht-Tore GRÜN (gate:pruefbuehne-licht 67 s · gate:weltbild-frost:echt 175 s ·
gate:studio-begehen 432 s · gate:webgl-probe 108 s). `bild:dorf-trocken@0.42` brach ROT nach 240 s: „DIE WELT STEHT NICHT nach 4 244
Takten … Karten offen 8“. Das Spiel hängt dort; das ist der wichtigere Schnitt als das Bild. Die acht Karten beim Namen (die Akte
`umstellen-dorf-trocken.json` der Probe): `fimp:strauch|1` · `fimp:birke|3` · `fimp:fichte|1` · `fimp:fichte|2` · `fimp:birke|2` ·
`fimp:tanne|2` · `fimp:totholz|1` · `fimp:weide|1`. Jede trägt `_platte` false. Es sind die Bäume der Heimat, nicht des Orts.

### Die Wurzel

- Der Atlas der Karten reist über die Weltgrenze (`stamm/speicher-welten.js` `WELT_GRENZE.wirt`: `_kartenAtlas`,
  `_impostorBakeQueue`).
- Die Zelle einer Karte fragt die Foundry nach ihrer Platte (`stamm/stoff-karte.js` `_kartePlatteFragen`, der Auftrag „krt“). Während
  die Frage reist, steht `_platte` auf false, und `_karteWeltBacken` backt nicht.
- Der Satz „reise B L“ wechselt die Welt. `_weltAbschied` (`stamm/speicher-laden.js`) lässt die Aufträge der alten Welt verfallen
  (pending → noop, `warte: []`). Die Antwort auf die Frage findet niemanden.
- Die Zelle wartet ewig, die Schlange `_impostorBakeQueue` zählt sie als „karten“ offen (`_weltOffen`), und die Welt steht nie.

### Geschnitten

- **`_weltAbschied`** (`stamm/speicher-laden.js`): mit den verfallenen Aufträgen fällt die Frage der Karten. Jede Zelle des Atlas mit
  `_platte` false ist wieder ungefragt (undefined), und ihr erster Leser in der neuen Welt fragt neu. Das ist EIN Ort, der Abschied, der
  schon die Aufträge verfallen lässt. Es gibt keinen Zeitgeber und keinen zweiten Weg.
- **Die Linse** (gate:weltgrenze, Familie Weltgrenze „KEIN WELT-ZUSTAND REIST ÜBER EINE WELTGRENZE“): die Saat-Route pflanzt vor dem
  ersten Wechsel eine Karte `fimp:grenze|1` mit der Frage der alten Welt (`_platte` false) und liest sie nach dem Wechsel. Trägt sie die
  Frage noch, nennt die Linse den Täter: „die Karte fimp:grenze|1 trägt die Frage der alten Welt (`_platte` false) — ihr Auftrag verfiel
  im Abschied (`_weltAbschied`), sie wartete ewig“. Schein 12 „Frage der Karte reist über den Abschied“ setzt die Frage nach dem
  Abschied zurück. Der Selbsttest ist GRÜN in 204 s, und Schein 12 fällt rot beim Namen.

### Gemessen

| Baum | gate:weltgrenze, Route saat | Urteil |
|---|---|---|
| alter Abschied (`stamm/speicher-laden.js` wie main und b0289a9e) | „Wechsel 1 (Saat grenze-saat-b): die Karte fimp:grenze\|1 trägt die Frage der alten Welt (`_platte` false)“ | **ROT** beim Namen, 1 Befund, 159 s |
| Kopf 3 | 0 Befunde; die Absenz und 14 Routen 0 Befunde | GRÜN; Selbsttest GRÜN, elf Scheine rot beim Namen, 204 s |

### Die Wand der Basis (nicht Kopf 2, aber vor dem Push gefunden)

`npm run check:statik` ist an b0289a9e selbst ROT: die Orts-Wand (`scripts/diag-altlasten.cjs`, Selbsttest „feuert nicht (oder steht
heute rot)“) nennt `scripts/diag-worker-dichte.cjs:1633/1634`. Das sind die Bau-Anker der Böschungs-Linse („dorf 20 8“ bei −730,4 /
−875,3 und „dorf 12 18“ bei −1 855 / −1 075, Erdbau). Erst die Gezeit von main (`playerMesh.position.set(O.x, …)` in derselben Datei)
macht die Datei zur Setz-Probe, darum war das Bündel `buendel-dorf` 65010917 noch GRÜN. Die Anker setzen keinen Spieler: `ortPlan`
plant das Dorf im Kern, ohne Browser. Kopf 3 deklariert sie mit EINER Zeile `// BÜHNE:` und nennt den Grund; danach ist die Orts-Wand
GRÜN (195 Gate-Dateien).

## Kopf 2 — das Dach am Ort des Planeten (Auftrag `kultur-aus-klima-2`, Briefkasten 05:12)

### Geschnitten

- **Der Pol zuerst** (`fachwerk-core.js` `ariditaet`): Kottek u. a. 2006 bestimmen E (der wärmste Monat unter +10 °C) VOR B. Der Pol
  kennt keine Trockenheit, der Ort deckt nach dem Schnee. Ohne die Reihe trugen 7 von 8 001 Land-Zielen (7 Saaten × 3 Zeiten, 466
  polar) das Lehmdach der Wüste, so erde-03 heute bei 47,38° N 126,23° O (51 mm, Sommer 9,3 °C).
- **Die Wüste deckt JEDES Dach flach** (`ortDeckung`, `ortNeigung`): die Trockenheit liest der Ort zuerst, vor dem Schiefer der Kultur
  und vor dem Werk des Stils. Am Planeten trugen 663 von 38 729 Wüsten-Häusern ein geneigtes Dach (645 modern 14–16° und 2 glas 11°,
  mediterran; 16 Schiefer 26,5°, mitteleuropa klinker/stein) → **0**. Außerhalb der Wüste bleiben Schiefer und das flache Werk des Stils.
- **Der Messort reist** (`scripts/werkbank.cjs` `reiseDesOrts`, `scripts/lib/band-urteil.cjs` `messortePruefen`): ein Messort trägt
  `reise` („reise B L“, der Satz des Spielers im Chat). Die Werkbank sagt ihn, wartet auf die Welt des Orts (`r.erwacht`, der Voxel-Faden)
  und prüft den Ort (`_gelaende().ort.teil`, B/L auf 0,01°); falsch oder stumm bricht laut. Der Spieler landet bei 0, 0, der Dorf-Zug
  baut das Dorf der Ankunft (die Zelle „start“), der Spieler steht auf dessen Platz. Zwei Messorte in `spec/profiband/haushalt.json`:
  **dorf-trocken** und **dorf-feucht**, derselbe Planet „anazh-realm-seed“, gleiche Uhr 0,42, gleiche Kamera-Regel (`ortPose` „platz“,
  `imBild` bauSatz 0,02). Ihre Ratschen-Serie steht offen (`serie.offen`, sie misst auf echter GPU).
- **Kein Wort gründet an der Reise** (der Befund): der erste Messort gründete „dorf 4291161376 13“ am trockenen Ort, die Welt baute
  „Cumigan“ mit geneigten Dächern. Das ist Gesetz, kein Bruch: der Plan eines Worts trägt kein Klima (`_foundryRequestSettlement`,
  „eine Funktion des Worts allein“), nur das Dorf des Zugs liest den Ort (`_zellEingang` → `_siedlungKlima`). Die Regel der Band-Wand
  (`messortePruefen`) fordert darum an jedem Ort der Reise Stand und Dorf-Zug und verbietet die Gründung. Ihr Selbsttest S20b
  (gate:profiband) ist ROT am Leser von main und GRÜN am Kopf (59/59).

### Der Ort am Gesetz (nicht per Hand-Pose)

Die Ziele des Standard-Planeten „anazh-realm-seed“ (Fibonacci-Punkte, Land im Relief, Band 16 km wie der Satz „reise“), je Ziel das
Δ des Planet-Fadens (`planetOrt`) durch das Ort-Gesetz (`ortGesetz(teil)` → `ortKlima`) in den Plan des Dorfs (`DORF`). Am Ort selbst
fährt die Welt ohne Karte (die Null-Welt, `welt-boot.nullWelt`, der Spieler bei 0, 0, der Dorf-Zug an): der Satz, das Dorf der Ankunft
(`_ortDp` → `_foundryRequestSettlement`), der Platz (`_ortPose` „platz“), je Ort 17–32 s, 0 Seitenfehler.

| Ort | Satz | Klima des Orts (`_siedlungKlima`) | Dorf der Ankunft | Dach | Platz → Blick |
|---|---|---|---|---|---|
| trocken | reise -49,05 -119,78 (1 547 km vom Anker der Heimat) | 42,8 mm, −8,9 / 23,3 °C, A = 0,15 (BW) | Nagu bei −159,8 / 55,6, fernost (chinesisch, japanisch) | **10 von 10 flach, 2°** | −159,8 / 61,1 → −151,7 / 52,3 |
| nass | reise 50,13 82,91 | 1 886 mm, 1,0 / 15,2 °C, A = 6,24, Spende 6,3 × Heimat | Chagrin bei −115,6 / 39,5, mitteleuropa (gotisch, tudor, alemannisch, französisch, viktorianisch) | **14 von 14 steil, 48–61°**: Reet 8, Schiefer 4, Biber 1, Hohlziegel 1 | −115,6 / 45,0 → −124,3 / 51,1 |
| Heimat | — | 548 mm, −4 / 18 °C, A = 1,96 | Chingewert bei −53,5 / −182,3, mitteleuropa | 17 von 17 geneigt, 38,5–62° (Hohlziegel 8, Schiefer 4, Schindel 3, Biber 2) | — |

Das Gesetz zieht Kultur, Name und Dach aus demselben Ort: trocken fernost und flach, nass mitteleuropäisch und steil.

### Gemessen — Anteil je Klima-Klasse mit der Dach-Form des Gesetzes (4 000 Punkte, 1 318 Land-Ziele, 8 Saaten × 14 Häuser)

| Klasse (Kottek u. a. 2006) | Form des Gesetzes | Dörfer n von m | Häuser n von m | Neigung | Rest (Grund) |
|---|---|---|---|---|---|
| Wüste BW (A ≤ 0,5) | flach, Lehm ≤ 8° | **1 960 von 1 960** (Kopf 1: 1 737) | **38 729 von 38 729** (Kopf 1: 38 066) | 2,0° | — |
| Pol E (Sommer < 10 °C) | nie flach, ≥ 30° | 808 von 808 | 15 655 von 15 655 | 41,5° | — |
| Schnee (Winter ≤ −3 °C) | nie flach, ≥ 30° | 2 281 von 2 288 | 44 565 von 44 576 | 40,8° | 3 flach (glas, das Werk des Stils), 8 Hohlziegel unter 30° (stein) |
| Steppe BS | nie flach | 2 499 von 2 720 | 53 437 von 54 094 | 22,3° | 657 flach: das Werk des Stils (modern 654, glas 3) |
| Süden (Winter ≥ 4 °C) | Kanal-Ziegel | 1 901 von 2 184 | 42 207 von 43 029 | 26,8° | 750 flach (modern 741, glas 9), 72 Schiefer (klinker/stein, die Deckung der Kultur) |
| nass (Spende ≥ Heimat) | Reet oder ≥ 40° | 332 von 392 | 7 151 von 7 373 | 47,7° | Reet trägt nur der Holzbau des Dorfs: stein mit Hohlziegel unter 40° 188, klinker mit Schiefer 26, glas flach 8 |
| Mitte | nie flach | 190 von 192 | 3 853 von 3 855 | 33,3° | 2 flach (glas) |

Am alten Kern (main vor Kopf 1) deckt die Wüste 0 von 38 729 flach; jedes Dach trägt die Neigung aus Kultur und Samen.

### Die Linse R10 (gate:settlement Teil R, Familie Fachwerk, 2,8 s)

„die Dächer des Planeten“: 1 200 Punkte, 8 Saaten; die Klasse liest der Richter selbst an der Quelle (Kottek-Konstanten), nie am
Gesetz, das er prüft. Soll: Wüste flach (Lehm ≤ 8°) 100 %, Süden Kanal-Ziegel ≥ 95 %, nass Reet oder ≥ 40° ≥ 95 %, Pol flach 0.

| Kern | Wüste flach | Süden | nass | Pol flach | Urteil |
|---|---|---|---|---|---|
| main e71f272 | 0 von 12 336 | 98,2 % | 96,0 % | 0 von 4 805 | **ROT** |
| Kopf 1 (33caabe5) | 12 132 von 12 336 (98,3 %) | 98,2 % | 96,0 % | 0 von 4 805 | **ROT** (dazu R8: der Pol flach 501 von 501) |
| Kopf 2 | **12 336 von 12 336** | 98,2 % | 96,0 % | 0 von 4 805 | GRÜN |

Die gepflanzten Täter fallen beim Namen: „die Wüste deckt nicht flach“ → R10 (0 %); „die Wüste lässt das Werk des Stils stehen“
→ R10; „die Trockenheit kennt den Pol nicht“ → R8 (die Polprobe 26 mm, Sommer 9 °C: flach 501 von 501). R8 trägt die Polprobe
dauerhaft: flach 0 von 501, 47,72°.

### Das Bild

- **Mein Auge (swiftshader, der Kanal des Dorfs, je vier Blicke):** die Kirche des Dorfs der Saat 4291161376 mit dem Klima der beiden
  Orte (Kumigu trocken, Buwegros nass). Trocken liegt ein flaches Lehmdach, nur die Traufe hebt sich an den Ecken (die Kurve der Kultur), kein Giebel. Nass trägt Reet auf 57°, der
  Giebel steht höher als das Fachwerk-Geschoss darunter. Das ist das Gesetz im Bild; es ist die Form, nicht das Weltbild.
- **Die Welt am Ort**: hier rendert die Welt nicht (WebGPU „Device Lost“ ohne Karte). Das Paar urteilt die Probe am Gerät:
  `bild:dorf-trocken@0.42` (Nagu) ↔ `bild:dorf-feucht@0.42` (Chagrin), gleiche Uhr 0,42, gleiche Kamera-Regel. Den Weg der Werkbank zum
  Ort (`reiseDesOrts`) prüfte die Null-Welt: „chat.befehl.reise.ziel“ nach 10,9 s, die Welt `ort_d5a1e45a2e4cb14d`, der Ort −49,05 /
  −119,78 auf 0,01°.
- **Nicht das Paar:** `bild:dorf` (die Heimat, `probe-post/buendel-dorf/65010917-dorf-0.42.png`) zeigt das Dorf eines Worts. Es
  trägt kein Klima, seine Dächer sind das Werk des Stils.

## Kopf 1 — das Gesetz

### Geschnitten

EIN Gesetz: was der Mensch am Ort baut und wie er heißt, folgt dem Ort und dem Klima seiner Saat, gelesen an EINER Stelle.

- **Der Himmel des Orts** (`gelaende-core.js` `NIEDERSCHLAG`, `niederschlagAmOrt`, `schneeFall`, `ortKlima`): der Niederschlag ist
  der Schneefall eines Frosttags × Jahr. Die Heimat hat 547,5 mm, davon ist der Abfluss `spendeMm` 328,5 mm. Am Ziel der Reise gilt die
  Umkehrung der Regen-Quote des Planeten (planet-core `ortRoh`: q = N / (N + 900)). Der Schneefall des Pegels skaliert mit N / N_H;
  in der Heimat ist der Faktor × 1, bit-gleich. `ortKlima(O)` ist die EINE Tafel, die der Mensch liest: {winter, sommer, spendeVerh,
  niederschlagMm, schneeMmTag}. Der Wirt reicht sie in jeden Plan ohne Wort (`stamm/siedlung-ort.js` `_siedlungKlima`).
- **Das Dach folgt dem Himmel** (`fachwerk-core.js` `DACH_KLIMA`, `ariditaet`, `schneeNeigung`, `ortNeigung`, `ortDeckung`). Die
  Bänder:
  - die Trockenheit nach Kottek et al. 2006 (Köppen-Geiger, die Schwelle 10·(T + 7));
  - die Schneelast nach EN 1991-1-3 (μ₁ = 0,8 bis 30°, 0 ab 60°, also die Neigung, über der der Schnee abgleitet);
  - das flache Dach nach DIN 18531 (2 %);
  - die Neigung trocken ↔ nass nach Li et al. 2021 (Hang-Steilheit-Regel der Volksarchitektur).

  Wo es trocken ist, wird das Dach flach (Lehm, `DECKUNG_GESETZ.flach`). Wo Schnee fällt, wird es steiler bis zur Gleitgrenze. Wo es
  nass ist, wird es steil.
- **Die Sprache der Region** (`fachwerk-core.js` `SPRACHE_GESETZ`, `SPRACH_BAUM`, `LAUTWANDEL`, `spracheVon`, `sprachName`):
  - Jede der 6 Kultur-Regionen ist eine Familie mit einer Ursprache, gewürfelt aus ihrem Lautgesetz: Anlaut, Cluster nur am Wortanfang
    oder nach Vokal, Silbenkontakt nach Vennemann 1988, Koda nach WALS 12A, Vokale nach WALS 2A.
  - Die Ursprache hat 6 Grundwörter und das Wort für „Haus“.
  - Eine Saat wählt ein Blatt eines Binärbaums der Tiefe 5. Jeder Knoten erneuert EIN Lautgesetz aus der Drift der Familie (Sapir 1921).
    Das Gesetz greift ausnahmslos (Osthoff & Brugmann 1878; Campbell 2013; Kümmel 2007).
  - Der Rang-Wurf ist 1/r (Sigurd 1968; Tambovtsev & Martindale 2007).
  - Die Fuge folgt dem OCP (Leben 1973; McCarthy 1986): zwei gleiche Konsonanten nebeneinander verschmelzen, außer den
    Geminaten, die das Gesetz der Region trägt (mediterran ll · tt · nn …). Das Maß über 36 000 Namen: Doppel-Laut ohne Gesetz
    4,19 % → **0 %** („Betzzel“ → „Betzel“, „Gonggros“ → „Gongros“).
  - Ortsname = Wurzel + Grundwort, Familienname = Wurzel + „Haus“: Ort und Leute klingen verwandt. Es gibt keine Namensliste und
    kein kopiertes Wörterbuch. Die alten Silben-Listen `NAMEN` und `LEBENSLAUF.namen` sind gefallen.
  - Die Leute heißen aus demselben Gesetz: `stamm/siedlung-bewohner.js` `_bewohnerLauf` „name“ ruft `sprachName` mit der Sprache
    des Plans (`spracheVon(plan.region, plan.seed)`). Ohne Kern bricht der Lauf beim Namen (`_kernPflichtBruch`).

### Gemessen (node, dasselbe Gesetz, vorher am Kern origin/main ↔ nachher)

#### kultur#2 — Dach ↔ Niederschlag (gate:settlement Teil R8, 32 Saaten, der Auftrag über `ortGesetz` eines Teils)

| Maß | vorher | nachher |
|---|---|---|
| r (Niederschlag, mittlere Dachneigung) | 0 | **0,792** |
| Mutation (Plan trocken bzw. nass ≠ Heimat) | 0 % (0 von 64) | **100 %** (64 von 64) |
| Gegenlauf gleich | 32 von 32 | 32 von 32 |
| Dach trocken · Heimat · nass | 50,86° · 50,86° · 50,86° | **2,13° · 51,05° · 60,06°** |
| Niederschlag trocken · Heimat · nass | 76 · 548 · 1 895 mm/a | 76 · 548 · 1 897 mm/a |

#### sprache#1 — Namen aus ≥ 2 Saaten (gate:settlement Teil R9, der Zweier-Laut-Leser der Station wörtlich)

| Maß | vorher | nachher |
|---|---|---|
| Fächer der Heimat (32 Zellen, 32 Ortsnamen + 640 Personennamen): Saaten | 3 | **3** (mitteleuropa · alpin · nordisch) |
| zugeordnet | 0,857 | **0,993** (128 Zellen: 0,995) |
| mit stadt-voll (mediterran) | 4 Saaten | 4 Saaten |
| Sprachen je Region (200 Saaten) | 1 (keine Familie) | 22–32 von 32 |
| Doppel-Laut ohne Gesetz an der Fuge (672 Namen des Fächers) | — | **0** (ohne OCP 26) |

#### Die Linse (Familie Fachwerk: gate:settlement Teil R, 1,3 s)

- R8 „das Dach liest den Niederschlag“: r ≥ 0,5, Mutation ≥ 90 %, Gegenlauf = n, trocken < Heimat ≤ nass.
- R9 „die Namen tragen ihre Region“: Saaten ≥ 2, zugeordnet ≥ 0,9, Doppel-Laut ohne Gesetz an der Fuge = 0.
- Am alten Kern (fachwerk-core origin/main) ist R8 ROT mit r 0 und Mutation 0 %. R9 ist ROT beim Namen („der Kern trägt kein
  Sprachgesetz“).
- Selbsttest mit gepflanzten Tätern (`KLIMA_TAETER`): „das Dach liest den Niederschlag nicht“ (der alte Deck-Schritt) → ROT an R8;
  „die Sprache kennt keine Region“ (jede Region spricht mitteleuropa) → ROT an R9 (zugeordnet 0,51); „die Fuge kennt kein OCP“
  → ROT an R9 (Fuge 26: „Krorzatzzel“ …). Der Selbsttest gate:settlement ist GRÜN (103 s).
- Die Leser des alten Klimas (Teil R Sockel/Klima/Dach, Teil O Studio = Welt) wandern mit: sie rechnen das Klima über `ortKlima`,
  nie über einen Zwilling.

#### Vertragsakt — wie weit sich die Welt bewegt (alter gegen neuen Kern, dieselben Saaten)

| Messort / Golden | Bewegung |
|---|---|
| **dorf** (Zelle −4,−4, Same 4291161376, die Heimat) | 17 von 17 Dächern byte-gleich (Reet 45°/47°); nur der Ortsname: Skogberg → Huvisnid |
| DORF Heimat, 64 Saaten | 15 von 1 105 Häusern neigen steiler (1,4 %, +10° … +14,5°, Mittel +11,4°: der Schnee der Heimat hebt flache Dächer an die Last-Regel); Deckung 0 geändert; Ortsnamen 64 von 64 neu |
| **stadt** („dorf 7 120“) · **stadt-voll** („dorf 7 300“) | Geometrie byte-gleich: der Plan eines Worts trägt per Gesetz kein Klima (`stamm/siedlung-ort.js:273`); nur der Name (stadt-voll: Villaalto → Mamilsi, mediterran) |
| Bewohner aller Messorte | jeder Name neu (Vorname, Familie aus der Sprache des Plans) |
| Golden siedlung (`spec/asset-contract/v6/golden/siedlung.json`) | neu gestempelt, nur der Name bewegt sich (1 Pfad je Plan): {seed 7, nH 12} „Villaalto“ → „Mamilsi“ (e874ebee → 8f9c90ef), {seed 12345, nH 6} „Grünbach“ → „Beldwert“ (dee40ec6 → f6432b76); Slots 16 und 7, Größe gleich |
| Goldens asset-contract (Häuser) | 128 von 128 byte-gleich |
| Ziele der Reise | der Schneefall skaliert mit N / N_H; diag-planet `ort.jahreszeit` 1 820 Land-Ziele GRÜN (Schnee zur Sommer-Mitte bei > 10 °C: 0) |

Kein Flag hält die alte Welt; der alte Silben-Zwilling ist gelöscht.

## Zehn Beispiel-Namen je Region (fünf Orte · fünf Leute, Heimat-Fächer und Saaten der Regionen)

| Region (Sprachen gesehen) | Orte | Leute |
|---|---|---|
| mitteleuropa (29) | Suhesgros · Bonmeschon · Bedusgrin · Bebegrin · Gundschon | Bogebrir Ditbelf · Bronbel Debelf · Debetzel Debelf · Zobahen Brebelf · Raschwer Senbelf |
| nordisch (22) | Tanbi · Sunglidald · Svæga · Flødtald · Glabi | Skifjikharn Hihud · Draldud Skahud · Fjedbasar Hæhud · Ryskannun Huhud · Hjydsillud Fanhud |
| alpin (27) | Krorzatzel · Bobog · Libu · Betzel · Tuchgonbag | Tinik Sinack · Gruchmig Hanack · Zrigsich Flinack · Gebri Gronack · Bagich Runack |
| mediterran (32) | Serari · Mitapa · Macilva · Mallava · Tirpa | Mibapro Cobo · Limi Cibu · Callagia Cabu · Dematta Sebo · Fulla Sanbu |
| antik (29) | Lamus · Pixqunspis · Polnistas · Cigas · Trygas | Tiplincat Cacras · Muvis Pucras · Gransos Pracras · Primses Facras · Plibabam Cycras |
| fernost (32) | Susagu · Yabi · Chibanka · Kuhagya · Kadungi | Komayi Chino · Shiminka Kanu · Nujin Tunu · Kyonkun Tsuno · Taganban Tano |

Die Ursprachen (6 Grundwörter · Haus, vor Lautwandel und OCP): mitteleuropa wat schon graus grin wert mon · belf — alpin bua sitz goag bagg zeil bog · nack —
mediterran ma pa si va pe mi · bo — nordisch bi tald sned snuk halm ga · hud — fernost pi kya ku gi ka mi · no — antik mos stas gan bre
paes gas · cras. Der Ort trägt das Grundwort seiner Ursprache, die Leute tragen das Haus ihrer Ursprache: „Tanbi“ und „Hihud“ sind
nordisch, „Mitapa“ und „Cobo“ mediterran.

## Die nächsten Sprossen aus demselben Gesetz (Mechanik gelegt, nicht gebucht)

- **sprache#2** (U_eff ≥ 10; Sprachen an 20 Sätzen getrennt ≥ 85 %): U_eff je Familie **31,4–31,7** über 1 000 Saaten (32 Blätter).
  Die Trennung ist ungemessen. Die Schwestern einer Familie unterscheiden sich an derselben Saat in 27–53 % der Vornamen und in
  0–75 % der Grundwörter. In mitteleuropa sind es 0 %: seine vier Lautgesetze treffen die Grundwörter nicht. Die Schwestern stehen
  also nah, wie Schwestern stehen; ob 85 % am Satz trennen, misst erst #2.
- **sprache#3** (U_eff ≥ 10²; ≥ 5 Familien; Kognaten; Robinson-Foulds ≤ 0,3 in ≥ 70 %): 6 Familien mit 192 Blättern. Gemessen
  (Kopf 2, 100 Bedeutungen je Blatt, Kompatibilität nach Ringe, Warnow & Taylor 2002): je Familie nur **2–8 von 32** Blättern
  unterscheidbar, RF **0,57–0,88**, 0 von 6 Bäumen ≤ 0,3. Der Baum steht im Gesetz, aber das Lexikon trägt ihn nicht: eine Neuerung
  je Knoten trifft zu wenige Wörter. Ein Versuch im Arbeitsstand (die 100 Bedeutungen nach Swadesh 1971 je Ursprache, je Knoten
  ein eigenes Lautgesetz TYP · LAUT · ORT, nur sichtbare Gesetze) hob die Unterscheidbarkeit auf 191 von 192, RF 0,26–0,78; er ist
  nicht im Kopf. Der nächste Hebel war der Ersatz des Worts selbst (Kognaten-Klassen), nicht nur sein Lautwandel: ihn trägt Kopf 5
  (oben), RF ≤ 0,3 in 6 von 6.
- kultur#3 (Kalender/Fest) ist ein anderes Gesetz und fällt nicht hieraus.

## Station (Kandidat, `cloud-post/kultur-aus-klima-station/`)

`stationen.diff` gegen origin/punkte-maschine 0e4cf4ac (seit Kopf 5; bis Kopf 4 55313a8b) und `BEGRUENDUNG.txt`:

- KULTUR misst das Klima des Orts statt des Wetters der Stunde. Der Plan kommt aus dem Auftrag des Spiels (`_ortDp`).
- SPRACHE misst dazu den Fächer von 32 Zellen über den Leser des Spiels (`_bewohnerLauf`).
- Wand 1 hält: die Liste der Punkte-Maschine (`liste`, Zweig punkte-maschine) zeigt genau zwei ROT (gelaende.K2#1/#2, Wand HAKEN), an der Basis wie am Kandidaten.
- Wand 3 hält: die Zeugen `klimaGleich`, `spielGleich` und der Namen-Zeuge.
- Wand 2 ist offen (siehe unten).
- Der Selbsttest der Punkte-Maschine (`selbsttest`) am Kandidaten: 286 GRÜN, 5 ROT. An der Basis 55313a8b stehen dieselben 286 GRÜN und dieselben 5 ROT
  (BEFEHL TRÄGT · zweimal WACHE · LEBENSZEICHEN DES ZEUGEN · RICHTER-AKTE). Der Kandidat fügt kein ROT hinzu.

## Probe

Der Ruf von Kopf 5: `[gpu-probe: gate:studio-begehen, bild:dorf-feucht@0.42]`. `probe-tag` nennt EIN Pflicht-Tor: die Regel Haus
(der Beitrag fasst `fachwerk-core.js` an); die Regel Bau trifft er nicht (kein `stamm/siedlung-*`). Das Bild ist der offene Partner
des Bildpaars, das nasse Dorf: es steht mit den neuen Namen, und seine Häuser sind Byte für Byte die von main.

Der Ruf von Kopf 4 (wie Kopf 3): `[gpu-probe: gate:pruefbuehne-licht, gate:weltbild-frost:echt, gate:studio-begehen,
bild:dorf-trocken@0.42]`. Das Bild ist dasselbe, weil es jetzt das flache Lehmdach in Nagu urteilt.

- Die drei Tore nennt `probe-tag` als Pflicht: Bau und Haus, weil der Beitrag `stamm/*` und `fachwerk-core.js` anfasst.
- Der Einlass trägt höchstens 4 Proben je Push (gpu-probe.yml „höchstens 4 je Push“), der Deckel je Probe ist 480 s
  (`PROBE_DECKEL_S`). Neben den drei Pflicht-Toren bleibt EIN Bild: das trockene Dorf, an dem Kopf 2 hing.
- Kopf 4 (5b21a935) auf radeon-890m: GRÜN in 1 206 s, alle fünf Einträge; das Bild zeigt das flache Lehmdach (oben, Gelandet).
- Kopf 3 (1a78aab2) auf gtx1050-desktop: GRÜN in 3 321 s, alle fünf Einträge; das Bild zeigte den Schwung (Kopf 4, oben).
- Kopf 2 (18cec0dc) auf der Radeon: die drei Tore und die GL-Wand GRÜN, das Bild ROT (die acht Karten, oben).
- Kopf 1 (33caabe5) fuhr im Bündel `buendel-dorf` 65010917: die Probe GRÜN, alle vier Einträge.
- Lokal am Baum von Kopf 3 auf b0289a9e: `npm run check:statik` GRÜN (491 s, die Orts-Wand nach der Zeile `// BÜHNE:`),
  gate:profiband GRÜN (42 s; die Wand: 12 Ratschen frisch an V18.546.429, die Serie offen an dorf-trocken, dorf-feucht, kueste, ufer),
  gate:settlement GRÜN (608 s; R8 r 0,791, Mutation 100 %, der Pol flach 0 von 501 · R9 zugeordnet 0,993 · R10 Wüste 12 336 von
  12 336 flach), gate:weltgrenze GRÜN (siehe Kopf 3), `npm run format:check` GRÜN. gate:weltbild-frost:echt fährt nur auf der Karte
  (`scripts/diag-weltbild-frost.cjs:47` „nur --echt“).
- `git merge-tree --write-tree`: gegen main 64fcf12 sauber, gegen b0289a9e sauber (die Bäume stehen im Commit).

## Das Dach im Blick (swiftshader, die Form — das Licht urteilt nur die Karte)

Dieselbe Kirche des Messorts dorf (norwegisch, Same 824851), derselbe Plan bis auf das Klima des Orts (das Ort-Gesetz eines Teils,
Δ Regen-Quote −0,3 / 0 / +0,3), vier Blicke im Streiflicht der Bühne.

- **Was ich sehe (der Kanal des Dorfs):** trocken liegt ein flaches Lehmdach — ein kaum gehobener First, kein Giebeldreieck,
  der Ton des getrockneten Lehms. Heimat trägt Reet auf 45°, der Giebel ein Dreieck so hoch wie das Obergeschoss.
  Nass trägt Reet auf 60°, der Giebel steht doppelt so hoch wie das Haus darunter, das Reet oliv-graubraun. Turm und Geschosse
  stehen in allen drei gleich, nur das Dach wechselt. Das ist das Gesetz im Bild.
- **Der Kanal zählt:** der erste Blick (`diag-blick --werk norwegisch --ov <Plan>`) zeigte trocken ein Schindeldach auf ~30°. Er fährt
  den Übergabe-Kanal der Studios (`_studioWerkPruefen`, stamm/netz-portal.js:1412): der klemmt die Prägung auf die Regler-Zeilen.
  `pitchDeg` 2 → 8 (Zeile min 8), `deckung` trägt keine Zeile und fällt (must-ignore). Das Haus hebt 8° auf die Grenze der
  Schindel (30°, `grenzNeigung`). Das ist die Tür der Regler des Spielers, nicht der Weg des Dorfs. Die Welt setzt das Haus des
  Dorfs mit dem ganzen Plan (stamm/siedlung-ort.js:2386 `_stempelVon(sl.ov)` → `_foundryGestaltOv` → der Faden der Foundry).
  Die Sonde ersetzt nur den Prüfer durch diesen Stempel, sonst nichts.

## Offen (Grund, Messname)

- **kultur#2 ohne Station**: die Station KULTUR S2 läuft nur auf der GPU. Headless r 0,547 und Mutation 100 % auf ihren Zellen; der
  Vor-Richter (GTX 1050) fährt sie. Messname: Station KULTUR S2 `r`, `mutationProzent`.
- **sprache#1 ROT**: im Zensus bei `stadt-voll` steht eine Siedlung (die Wort-Stadt, mediterran). Grund: das Heimat-Dorf liegt dort
  nicht in `_bewohnerSiedlungen`. Messname: Station SPRACHE S1 „Saaten der Namen“.
- **sprache#3 ROT an der Station**: die Station misst Art „nicht“; erst der Stations-Kandidat dreht sie. Messname: Station SPRACHE S3
  „Umfang“.
- **Der Partner des Bildpaars**: `bild:dorf-feucht@0.42` (Chagrin) fährt nicht im Ruf von Kopf 5. Der Ruf trägt nur die drei
  Pflicht-Wände des probe-tag (Bau und Haus), wie der Auftrag 12:56 es verlangt (≤ 4 Wände, ≤ 480 s). Messname `bild:dorf-feucht`.
- **Die Ratschen-Serie der beiden Orte der Reise** (`serie.offen`): sie misst auf echter GPU (Lehre 17). Messname gate:profiband H2b.
- **Wand 2 der Station** (Leiter ≤ 60 s): sie misst nur das Gerät. KULTUR rechnet 182 statt 116 Pläne, SPRACHE 32 Pläne dazu, und
  S3 liest 192 Blätter (in node 93 ms). Messname: die Stationen KULTUR S2, SPRACHE S1 und S3 am ersten Lauf.
- **Der Rest der Klasse nass** (222 von 7 373 Häusern): Stein, Klinker und Glas tragen kein Reet, das Gesetz deckt sie mit Ziegel,
  Schiefer oder flach unter 40°. Die Form des Gesetzes ist dort „steil oder Reet“ nur für den Holzbau. Messname gate:settlement R10 (nass
  96,0 % ≥ 95 %).
- **Der Anspruch 754** bucht sprache#3 auf `w28-kultur-aus-klima-4`, das es nicht trägt (oben, Gelandet). Die Zeile setzt der
  Koordinator; mit Kopf 5 trägt der Baum sprache#3. Messname `zug/anspruch.txt` Zeile 754.
- **sprache#2** (die Sprachen an 20 Sätzen getrennt): braucht einen Sprecher der Wörter; klang-core `mengeSilben` spricht Silben
  ohne Sprache. Die Wortlisten von Kopf 5 sind sein Stoff (105 Bedeutungen je Sprache). Messname: Station SPRACHE S2 „getrennt“.

## Blatt (Kopf 6, Ende des Wartezimmers)

- **Geschnitten:** Zwei Gesetze, je an EINER Stelle gelesen. (1) Der gehaltene Himmel hebt das Dach: `_himmelDesPlans` über den EINEN
  Wetter-Leser, `himmelNeigung` im Kern, die EINE Dach-Form `dachModus`. (2) Die Wortliste je Sprache mit dem Ersatz des Worts
  (`sprachWort`); der Ortsname liest dort. Linsen R12 und R11 (gate:settlement), die Station S3 als Kandidat.
- **Gemessen:** S2 headless auf den Zellen der Station: r 0 → 0,547 · Mutation 0 % → 100 % · Gegenlauf 32/32 · R12 r 0 → 0,576 ·
  Wortlisten 0 → 192 · Familien 0 → 6 · RF ≤ 0,3 in 6 von 6 · die Häuser Byte für Byte gleich (743) · R12 und R11 am alten Gesetz ROT.
  Die Probe von Kopf 5: studio-begehen GRÜN 235 s, die zwei ROT geerbt (oben, Kopf 6).
- **Offen:** die Liste oben (Grund, Messname). Keine Station ist hier GRÜN gefahren; der Vor-Richter fuhr 865cd4af in vier Stunden
  nicht.
- **Kopf:** dieser Commit (`Vorprüfung kultur-aus-klima 6`, Zweig `kultur-aus-klima`); die 40 Zeichen nennt der Bericht nach dem Push.
  Kopf 5 war `865cd4af76815b77420e5c1e52ca74c25e01fefb`.
- **Sprossen:** keine beansprucht (Regel-Blatt 13:10). Ein Anspruch folgt erst mit einer GRÜNEN Station: `karte2.mensch.kopplung.kultur#2`
  über den Vor-Richter.
- Karte 2 gebucht 130 von 1 718 (gate:betriebsgesetz 26.11.). Status ZWISCHENSTAND.

## Blatt (Kopf 4, gelandet)

- **Geschnitten:** EIN Gesetz — das Klima des Orts setzt Neigung, Deckung und Haus-Sprache. In der Wüste baut HAUS flach (`FLACH` in
  `ROOFMODE`, die Platte im Lehm, kein Schwung). Die acht Karten sind geheilt, der Pol liest zuerst.
- **Gemessen:** r Dach ↔ Niederschlag 0 → 0,791 · Mutation 0 % → 100 % · Namen aus 2 Saaten zugeordnet 0,993 · die Wüste baut flach
  952 → 12 336 von 12 336 · die Probe 5b21a935 GRÜN (1 206 s) · die Linse R10 am alten Gesetz ROT, der Selbsttest nennt jeden Täter.
- **Offen:** die Liste oben (Grund, Messname).
- **Kopf:** `5b21a935da255bc667a2d1e58b1eda8586d09bef`
- **Sprossen:** `karte2.mensch.kopplung.kultur#2` · `karte2.mensch.kultur.sprache#1`
- Karte 2 gebucht 126 von 1 718 (LAGE 12:15). Status ZWISCHENSTAND.
