# Stand-Blatt `kosmos-bahn` (Zweig `kosmos-bahn`, von origin/main 2da17e2e) — ZWISCHENSTAND

Kandidaten der Station: `cloud-post/kosmos-bahn-station/` (zwei Patches gegen punkte-maschine e0b88e0, BEGRUENDUNG.txt, zwei
Prüfstände). Die Zahlen „an der Stationsfunktion“ kommen aus diesen Prüfständen: sie schneiden den Stationstext wörtlich aus der Datei,
und der Faden ist der Block aus voxel-worker.js, wörtlich im vm.
**Eichung:** alte Station × Kern von main ergibt die Gerätemessung an main 2da17e2e Zahl für Zahl
(im Zweig `punkte-maschine` die Datei `meisterkarte-quelle/punkte/messung/roh/2da17e2e-radeon/karte2.planet.kopplung.bahn-klima_2.json`): amp0Prozent 42, amp45Faktor 0,712,
ampErde 20,816. Die Zahlen des Auftrags (37 % / 0,759) stammen von einem älteren Kopf.

## Geschnitten

1. **planet-core.js `planetOrt`** (der Jahreszeiten-Vertrag): die halbe Spanne des Gangs reist als VERHÄLTNIS zur Spanne des Ankers
   (wie `spendeVerh`), das Mittel als Differenz.
   - Vorher reiste sie als Differenz: der Rest des Ankers blieb jedem Körper.
   - Am Anker gilt r − 1 = 0 exakt; die Heimat ist byte-gleich.
   - Neigung 0 → Spanne 0 an jeder Breite (S0·sin φ·sin ε, Berger 1978).
   - Ein Anker ohne Gang bricht beim Namen.
2. **welt-licht.js — der Mond hat seine Bahn:** `KOSMOS.mond` mit Band und Quelle:
   - 384 400 km und 27,3217 d (NASA NSSDC Moon Fact Sheet), e 0,026–0,077 und i 4,99°–5,30°;
   - AE 149 597 870,7 km (IAU 2012 B2).

   Die Kepler-Elemente des Monds um die Heimat werden aus der Saat gezogen (`kMond`, nur `heimat`; die Heimat trägt ≥ 1 Mond).
   - `kosmosZeit` → `mond {dLaenge, breite, abstandKm}`.
   - `sonnenBahn(…, mond)` → `bahn.mond {dekl, stunde, nah}`: Ekliptik → Äquator (Meeus Kap. 13), topozentrische Parallaxe
     R/d (Meeus Kap. 40, bis 1,008°).
   - `mondRichtung(winkel, bahn)` bricht ohne `bahn.mond`. Den Zwilling −Sonne gibt es nicht mehr.
3. **Die Leser:**
   - stamm/bild-himmel.js:
     - `_sonnenBahn` reicht den Mond der gestuften Kosmos-Zeit;
     - `_dayNightMoonDirection` ist die EINE Richtung für Körper, Richtlicht, Belichtung und Tafel-Schlüssel;
     - der Wächter −sunDir im Richtlicht ist gestrichen.
   - stamm/bild-himmel.js `_mondPhase`: die Scheibe trägt ihre Phase (Lommel–Seeliger 2μ₀/(μ₀+μ), Hapke 1981) über die Uniform
     der Sonne. Der Stoff des Monds in stamm/dirigent-ankunft.js `init` nimmt sie; der TSL-Bau steht außerhalb von `init`
     (Stoff-Wand).
   - voxel-worker.js `planetAnker` reicht `radiusKm`.
   - scripts/diag-weltgrenze.cjs und scripts/playtest/bild.cjs: die Proben „Mond tief am Mittag / hoch um Mitternacht“ (das
     Gegen-Sonne-Gesetz) sind ersetzt durch `mondAmOrt` (Scheibe = Leser, < 1e-6 rad) und `mondLaeuft` (Länge über 7 d in 70–100°).

## Gemessen — je Sprosse vorher → nachher

**planet.kosmos.systeme#1** (Soll ≤ 0,5°)

| Maß | vorher | nachher |
|---|---|---|
| Mond gegen eine unabhängige Ephemeride (eigener Kepler, Matrizen; 8 760 Proben, 2 Saaten, ohne Stufe) | max 179,77° · Mittel 91,45° | 1,7·10⁻⁶° |
| Kandidaten-Station: Leser des Spiels gegen `MOND_EPHEMERIDE` (2 Saaten × 2 Körper × 2 920, gestufte Zeit) | max 179,77° | max 0,082° · Mittel 0,071° |
| Stufe `kosmosSchrittTage` 1/96 d | — | ≤ 0,144° je Schritt |
| synodischer Monat | — (keine Phase) | 29,5313 d |
| beleuchteter Anteil über eine Woche | konstant voll | 0,06 … 0,91 |
| Planeten, Sternfeld, 731 Kosmos-Zeiten, 1 020 Sonnen-Richtungen | — | byte-gleich |

**planet.kopplung.bahn-klima#2** (Soll ≤ 10 % · ≥ 2× · > 0 m; 21 Saaten × 15°/45°/75°, gepoolt)

| | amp0Prozent | amp45Faktor | schneelinieVersatzM |
|---|---|---|---|
| alte Station × Kern main (= Gerät an 2da17e2e) | 42 | 0,712 | — |
| alte Station × Kern kosmos-bahn | 59,3 | 0,760 | — |
| neue Station × Kern main | 22,8 | 1,833 | 150,1 |
| **neue Station × Kern kosmos-bahn** | **0,0** | **1,944** | **152,2** (min 94,9 · max 371,2) |

- Je Adresse: 0° bis 0,0 % (mit dem Kern von main bis 871,7 %); 45° 0,028 … 4,797×.
- **Täter-Urteil:** BEIDE.
  - Station: sie fragte ohne `koerper` und urteilte über die eigene Neigung der Saat, die der Faden nie liest (er baut mit dem
    Körper der Erde, voxel-worker.js:1468). Sie maß das Relief: mit dem neuen Kern steigt ihr Fehlurteil von 42 % auf 59,3 %.
  - Kern: die Spanne reiste als Differenz.
- Texte „PLANET_ERDE fest“ an S2/S5/S6: veraltet und im Kandidaten ersetzt.

**Heimat und Messorte** (spec/profiband/haushalt.json, 11 Orte)

- **Kern:** `planetOrt` liest nur der Reise-Satz (feld-leben.js:1298 → voxel-worker planet-ort). Die Heimat liest ihn nie.
  - Anker-Δ byte-gleich (0/0).
  - Die Orte der Reise an der Heimat-Saat verschieben sich um ≤ 0,453 K (Mittel 0,168 K, 204 Orte); die Phase kippt nur am Äquator.
- **Sonne und Planeten:** byte-gleich (oben).
- **Abweichung 1 — der Taghimmel trägt den Mond:** vorher stand er tagsüber immer unter dem Horizont (−Sonne), jetzt ist er
  sichtbar, wenn er oben steht (bild-himmel.js `moon.visible = y > −10`).
  - Bei Welt-Tag 0 zur Uhr des Orts steht er an KEINEM Messort im Bildfeld: wiese/genesis/buehne/hochhaus-dach/gipfel-blick 60,3°
    über dem Horizont, ufer 45,1° (FOV vertikal 75°, halb 37,5°); kueste −4,4° (unter dem Horizont).
  - Über einen Monat zur selben Uhr steht er an 0–4 von 30 Tagen im Bildfeld: das Bild des Orts hängt jetzt vom Welt-Tag ab.
  - Kosten: +1 dc und 480 Tris, SOBALD er über dem Horizont steht, auch außerhalb des Bildfelds (dirigent-ankunft.js
    `moonMesh.frustumCulled = false`, wie die Sonne). Bei Welt-Tag 0 betrifft das jeden Tag-Messort außer kueste; über einen Monat
    steht er zur Uhr des Orts an 14–16 von 30 Tagen oben. Vorher waren es 0 dc bei Tag.
- **Abweichung 2 — kueste (Uhr 0,7, Sonne −1,6°, Nacht-Zweig des Richtlichts):** vorher stand der Mond bei +1,6° (Durchlass
  1,76·10⁻³ des Zenits, klare Luft), nachher bei −4,4° (Durchlass 0, foundry-core.js:368).
  - Das direkte Mondlicht und der Mond-Anteil der Belichtung fallen von MOONLIGHT·1,76·10⁻³ auf 0.
  - Ein Licht von unten entsteht nicht.
- Nicht gemessen am Bild: die Cloud-GPU stürzt im GPU-Prozess ab (auch an main 2da17e2e, eigener Gegenlauf im Worktree).
  Leser: FUND-REGISTER „apparat die cloud misst keine pixel“ (25.11.).

## Offen (mit Leser)

- **bahn-klima#2 amp45 1,944 < 2 (97 % des Solls).**
  - Rest-Täter: planet-core.js `planetKlimaGlobal`, die Hadley-Breite nach Held–Hou aus dem JAHRESMITTEL. Erde: 3 Zellen à 29,64°;
    45° Neigung: 5 Zellen à 19,55°.
  - An 45° Breite fallen die Küsten-Winterterme weg (Heimat dTw −7,70 → 0 K), und die Winter-Advektion kehrt um (−1,62 → +1,32 K).
    Drei Meer-Adressen liegen unter der Erde (Heimat 0,887×).
  - Die Quelle sagt das Gegenteil: die Hadley-Zirkulation wird mit der Neigung breiter (Guendelman & Kaspi 2019, ApJ,
    arXiv 1906.05748; Lindzen & Hou 1988 Sonnwend-Fall).
  - Ein planetenweiter Schnitt (Gürtel, Regen, Wind jeder Neigung ≠ Erde) — in dieser Welle nicht geschnitten.
  - Leser: bahn-klima#2 `amp45Faktor`, bahn-klima#6 (Zonen).
- **bahn-klima#2 „Schneelinie und Laub im Bild“:** die Zahl steht (152,2 m), das Bildpaar nur am Gerät. Leser: bahn-klima#2 `auge`.
- **Kein Spielpfad fragt einen fremden Körper:** feld-leben.js:1298 reist ohne `koerper`. Das Gesetz antwortet, gespielt wird die Erde.
  Leser: bahn-klima#5/#6 (gebundene Welt, 1 000 Welten).
- **Mond:**
  - Phasen-Helligkeit des Lichts, Neumond-Nacht ≥ 2 EV, Erdschein, dunkle Seite verdeckt Sterne → himmelsmechanik#3.
  - Knoten- und Apsiden-Präzession nicht im Gesetz (reine Kepler-Bahn; NASA-Zahlen nicht gelesen) → himmelsmechanik.
  - Gezeiten-Weitung → systeme#6.
  - Größe der Scheibe fest (keine Abstands-Skala) → himmelsmechanik#3.
  - Bildpaar der Mondphase je Woche am Gerät → systeme#1 `ungemessen`.
- **Planeten im Sternfeld:** sie stehen nicht relativ zur Sonne (feste Drehung `_sternDrehung`). Leser: himmelsmechanik N-Körper
  (im Zweig `punkte-maschine` `meisterkarte-quelle/punkte/stationen/k2-kosmos.js` ~136).
- **Fund-Vorschlag** (fürs FUND-REGISTER, Koordinator): im Zweig `punkte-maschine` (e0b88e0) schickt
  `meisterkarte-quelle/punkte/stationen/k2-planet.js`:1004
  `koerper: "mond"` als Text. Der Faden bricht daran: voxel-worker.js:1446 „koerper ist kein Objekt“.
  - Im Zweig `punkte-maschine` sagen `meisterkarte-quelle/punkte/stationen/k2-planet.js`:1086/:1165 noch „PLANET_ERDE fest“.

## Fragen an den Koordinator

1. Das Soll „45°: ≥ 2×“ (bahn-klima#2) nennt keine Quelle; die Einstrahlung allein trägt 1,777×. Gilt es gepoolt (1,944) oder
   je Adresse (0,028 … 4,797)? Ein Soll ohne Quelle setze ich nicht.
2. Soll die Hadley-Breite der Neigung folgen (planetKlimaGlobal, Guendelman & Kaspi 2019)? Es ist ein eigener, planetenweiter Schnitt.

Karte 2: 118 von 1 718 (im Zweig `punkte-maschine` e0b88e0 `vision/karte-2-stand.json` `heute`; dieser Zweig bucht keine Sprosse — die
Kandidaten urteilen erst am Gerät).
Status: ZWISCHENSTAND
