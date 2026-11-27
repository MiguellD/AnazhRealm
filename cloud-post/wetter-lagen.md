# Stand-Blatt wetter-lagen (Sprossen `karte2.planet.wetter.lagen#2`, `karte2.planet.wetter.extreme#1`) — oberster Abschnitt = jüngster Stand

## 27.11. — Kopf 3 übernommen; die Station extreme#1 S1 gegen main 948f68ee gefahren

- 17:44 Wartezimmer: Briefkasten unverändert seit 16:59, main 948f68ee, Kopf 3 31678001 wartet auf den Stempel `w28-wetter-lagen-3`.
- Kopf 3 31678001 (Rang statt Hand-Median, Zeile 830) ist in `wetter-lagen` gemergt (4d933e1), Basis jeder Folge-Arbeit. Gelernt: wer `scripts/diag-*.cjs` anfasst, fährt die Stall-Akte `npm run gate:welt-boot` lokal — am gemergten Baum Exit 0.
- S1, FLUT_AN wortgleich aus `k2-planet.js` (punkte-maschine), 20 Saaten × 30 Jahre + die Welt = 601 Adressen, in der echten Welt (Null-Renderer, `_wetterAmOrt` → `pegelLauf` → `pegelTafel` → `pegelHub`):
    - main 948f68ee (ohne `WETTER_LAGE`): regenMaxMm **17,6 mm**, Median 13,8 mm, stark 0, ueberAueM ungemessen, bordvoll 601/601, hubMax 0,2 m = Krone 0,2 m.
    - main 948f68ee + Kopf 3: regenMaxMm **117,8 mm** (Soll ≥ 100 ✓), Median 43,8 mm, stark 4 (s0/j23 100,5 · s0/j29 100,5 · s6/j16 117,8 · s8/j5 100,5 mm, je 20 Takte), ueberAueM **0 m** (Soll > 0 ✗), bordvoll 601/601, hubMax 0,2 m = Krone.
- Das Spiel liest dieselbe Zahl wie der Kern (117,8 / 43,8 / 4 — byte-gleich zur Rechnung am Kern). Mein Teil trägt: der Regen kommt ungekappt beim Pegel an.
- Der Täter von ueberAueM ist weiter `gelaende-core.js` `pegelHubVon` `Math.min(krone, h)` im main 948f68ee (die Bahn pegel-nach-brand schnitt den Brand, nicht die Aue — ihr Commit nennt „offen die Aue über der Krone"). Befund für sie: auch das gewöhnliche Jahr (13,8 mm) steht schon an der Krone — alle 601 Adressen bordvoll; über der Krone trennt erst der ungedeckelte Hub das Jahrhundert vom gewöhnlichen Jahr.

## 27.11. — Abgabe Kopf 2: `wetter-lagen-kopf2` a9385c1 auf main bed6256c

- EIN glatter Commit (Kopf 1 + Heilung + Kopf 2) auf dem `origin/main` des Moments bed6256c, Zweig `wetter-lagen-kopf2` (kein force); `wetter-lagen` trägt denselben Baum (Merge ed2a1d0, byte-Diff zum Kopf leer).
- Am Kopf lokal (Null-Renderer): check:statik · gate:wetter-wache · gate:stand-takt (Selbsttest · Lauf · Narbe) · format:check — je Exit 0.
- Ruf: `[gpu-probe: gate:wetter-wache, gate:tag-achse:echt, gate:stand-takt, bild:wiese@0.5]`. Die Station selbst läuft am Vor-Richter.

## 27.11. — Heilung am Stand-Takt: der gesetzte Wind setzt seine Richtung (Kopf 1 + Heilung + Kopf 2)

- Gemessen zuerst (`windRichtung` der Heimat-Saat an den Uhren der Herde, main ↔ Kopf): 41 150 → 1,0° ↔ 38,7° zum Gitter (der Lauf meldete 38,8°), 40 766 → 23,4° ↔ 24,7°, 40 713 → 44,2° ↔ 41,6°. Die Deutung stimmt: die Richtung zur Uhr trägt seit lagen#2 die Drehung der Lage, der Herd „grob“ steht nicht mehr längs der Achse.
- Der Chokepoint: im Spiel setzt niemand den Wind; die Bühnen, die ihn setzen, sind die Proben, und jeder Leser des Spiels liest die Richtung über den EINEN Leser `_windDirAt` (stamm/stoff-material.js:351), den `_windAt` (:370) ruft. Geheilt im EINEN Setzer der Herde (`herd` in scripts/diag-stand-takt.cjs): der gesetzte Wind setzt Stärke (seine Uhr) UND Richtung (`richtung` → `_windDirAt`): achse 90° · schraeg 22,5° · diagonal/wieder/langsam 45° · grob 90°. FRONT_TREUE, das Muster des Selbsttests und der Winkel von „grob“ (= achse) stehen unverändert.
- Die Klasse, jeder Setzer eines Winds: scripts/diag-stand-takt.cjs `herd` (Brand: Uhr → jetzt Uhr + Richtung, geheilt) · scripts/diag-stand-takt.cjs:3596 (Druck-Platte: x 1, z 0, ms 0 — gesetzt) · scripts/lib/fahr-proben.cjs:2923 (Wurf und Feder: längs der Gasse — gesetzt) · scripts/diag-kopplung.cjs:296 (setzt nur die Stärke 0, die Richtung bleibt die der Welt — kein gesetzter Wind) · scripts/werkbank.cjs:2180 (`_windWob` 0 — stille Luft).
- Die Leser des Winds im Spiel (alle über `_windAt` → `_windDirAt`): Brand stamm/feld-brand.js:417 · :900 · Rauch :1021 · Regen-Schlag und Himmel stamm/bild-himmel.js:1338 · :2955 · Segel/Wagen stamm/koerper-fahrt.js:1907 · Wurf stamm/koerper-frei.js:1175 · Leib stamm/koerper-leib.js:1912 · :3307 · Ohr stamm/klang.js:440 · Vögel stamm/kreatur-fauna.js:34 · :631 · Auge stamm/dirigent-takt.js:2511 · Gras/Krone stamm/stoff-material.js:481.
- Der Schritt lokal (Null-Renderer): vorher am Kopf 1 + 2 wortgleich das Rot der Batterie „BLIND: … grob (Kopf 38.8° zum Gitter): Vorrücken 1.033 m/s bei R 1.049 m/s“ (Exit 1, 194 s); mit der Heilung `--selftest` GRÜN · Lauf GRÜN · `--narbe` GRÜN (Exit 0). Die Köpfe: achse 0,1° (1,002 von R) · schraeg 22,6° (0,997) · diagonal/wieder/langsam 44,9° (1,004) · grob 0,1° → 0,899 von R: die Mutante fällt, die Linse sieht das Gitter.

## 27.11. — extreme#1 Schub 1: der Starkregen der stehenden Front (mein Teil: das Wetter-Gesetz)

- Die Zahl zuerst (Rumpf S1 der Station im Zweig `punkte-maschine`, Teil FLUT_AN, am Kern nachgerechnet: je Adresse Saat 0–19 × Jahr 0–29 die stärkste nasse Strecke im Jahr der Welt-Uhr, 20 Takte; der Regen je Takt das Feld des Worts × 10 mm je Stunde, 1 h = 150 s): am Kern von Kopf 1 (die Lage ohne Stau) **regenMaxMm 83,2 mm**, kein Jahr ≥ 100 (die rote Zeile 14,72 mm maß den Kern vor der Lage). Die Station liest das Ereignis über `_wetterAmOrt` → die Zeile sturm → das Wort stormy (rain 1): kein Stations-Kandidat nötig.
- Befund: das Jahr der Station (2 400 s) ist die Hälfte des Lagen-Zyklus (4 800 s) — die Jahres-Grenze steht an jeder Saat für immer an derselben Phase (Heimat ζ 0,497, mitten im Landregen). Ein Umfärben der Worte ohne mehr Regen-Zeit trägt an der Heimat höchstens ~68 mm.
- Der Schnitt in `phyto-core.js`, EINE Wurzel in `WETTER_LAGE`: `stau` {μ −5, β 3, bis 16 Takte} · `lageStauTakte` (E_n = ⌊μ + β·G_n⌋, G gumbelverteilt aus Saat und Lage n) · `lageStau` (die Warmfront kommt pünktlich und steht E_n Takte in Sturm-Stärke 0,9; was folgt, kommt später, das Hoch danach ist kürzer — der Takt der Lagen bleibt, reine Funktion von Saat, Ort, Zeit) · `wetterAt` liest Zeile, Front und Druck an der gestauten Phase · `frontVerteilung` mischt den Stau (das Δ des Planeten trifft dieselbe Verteilung).
- Band: Gumbel 1958; KOSTRA-DWD 2020, Dauerstufe 24 h, Wiederkehr 100 a: 87–105 mm.
- Gemessen am Kern: **regenMaxMm 83,2 → 117,8 mm** (4 von 600 Adressen ≥ 100, Median 43,8 mm, das gewöhnliche Jahr nicht) · über 200 Saaten × 100 Jahre 0 → 1,13 % der Jahre ≥ 100 mm (Wiederkehr ≈ 90 a) · Heimat 100 Jahre: Max 49,6 → 117,8 mm (EIN Jahr ≥ 100), Gumbel-x100 62,0 → 83,5 mm.
- Gegenlauf: lagen#2 am Mess-Leib FRONT_AN 94 → 92 % (Soll ≥ 80; Drehung 100 → 98 %: an EINER Passage, der Kaltfront hinter einem Stau, dreht der Wind an seiner Uhr weiter) · klimazonen#1 liest kein Wetter am Ort: byte-gleich · vorhersage#1 S1 am Kern-Nachbau 35 → 39 % (Soll ≥ 70, rot vorher wie nachher) · Heimat nass 37,8 → 38,9 % · **die Jahres-Summe des Regens der Heimat +3,6 mm (43,2 → 46,8 mm je Jahr der Station, +8,3 %); über 200 Saaten +4,2 %** — höchstens diese Zahl.
- Der Leser zum Pegel: stamm/wasser-hydro.js `_regenVergangen` (Zug für Zug `_wetterAmOrt` → `_regenWeg`, die Knoten [t, rain]) → gelaende-core `pegelLauf` (Faltung `laufFalte`, rain ungekappt) → `pegelHubVon`: dort deckelt `Math.min(krone, h)` den Hub an der Krone — der Schnitt der Bahn `pegel-nach-brand`. Die 100 mm tragen die Stempel ungekappt bis an diesen Deckel.
- Linse gate:wetter-wache (X) STARKREGEN im Selbsttest (14 s): GRÜN am Kern; gepflanzt „die Front zieht immer" → ROT an (X) STARK (83,2 mm), „der Stau in jeder Lage" → ROT an (X) GEWOEHNLICH.
- Ehrlich offen: ueberAueM wartet auf den Kopf von `pegel-nach-brand` (der Deckel an der Krone); die Drehung am Anker (`windRichtung`, `windWeg` geschlossen) kennt den Stau nicht (lagen#2 Drehung 98 %); das Bildpaar der Flut schießt der Vor-Richter; der Kopf 2 wartet auf die Landung des Bündels im main (15:24 UTC: main bed6256c trägt Kopf 1 noch nicht; der Diff liegt dort probeweise sauber auf, Selbsttest der Wache GRÜN).

Karte 2 gebucht 149 von 1 718 · Status ZWISCHENSTAND.

## 27.11. — GPU-Probe am Kopf 1 (71c7f166, GTX 1060): GRÜN

- gate:wetter-wache GRÜN 116 s · gate:tag-achse:echt GRÜN 142 s (genesis und wiese) · gate:webgl-probe GRÜN 55 s · bild:wiese@0.5 ABNAHME GRÜN, Inhalt nahWiese 48,2 %.
- Das Bild angesehen: Wiese am Mittag, Himmel und Wolken ohne Bruch. Die Bühne hält dort „summer sunny 0.50" — es beweist, dass nichts bricht, nicht den Durchzug selbst. Der Durchzug ist eine Folge über Takte am Kern (Mess-Leib FRONT_AN, stimmt 94 %), kein Standbild.
- Offen: das Urteil des Vor-Richters (Station) steht aus.

## 27.11. — Schub 3: der Schnitt im Kern, die Heimat trägt ihre Quote, die Linse (D) steht

- Der Schnitt in `phyto-core.js`: `WETTER_LAGE` (die Folge der Abschnitte Hoch → Aufzug → Landregen → Warmsektor → Kaltfront → zwei Nebentröge → Rückseite, je Abschnitt Stärke und Textur) · `lageProfil` · `lageDruck` (Tief an der Kaltfront, Senke je Trog) · `windRichtung` dreht mit derselben Phase (ψ = 80° · sin, rechts durch Front und Trog) · `windWeg` bleibt geschlossen (Bessel-Glieder k < 9, d/dt-Fehler 4,4e-7) · `frontVerteilung` liest dieselbe Lage.
- Gemessen am Kern (Mess-Leib FRONT_AN, 50 Saaten, 400 Takte): **stimmt 0 % → 94 %**, Drehung ≥ 15° 0 → 100 %, Druckfall 0 → 50 von 50, Abfolge 52 → 94 %.
- Die Heimat trägt ihre Quote: nass 37,8 % (gelaende-core `NIEDERSCHLAG`: 547,5 / 1 447,5); der erste Prototyp (nass 16 %) brach sie — das Δ des Planeten klemmte an 0, die Linse (L) KAMM fiel mit dem Täter der Küsten zusammen. Jetzt: Kamm West ÷ Ost 7,36 (main 5,47), jeder (L)-Täter fällt genau an seiner Klinge.
- Verteilung über 300 Saaten × 40 Orte, alt → neu: klar 27 → 27 · nebel 15 → 16 · bewoelkt 21 → 19 · regen 25 → 33 · sturm 13 → 5 %.
- Linse gate:wetter-wache (D) DURCHZUG im Selbsttest: GRÜN am Kern; gepflanzt „drei Sinus-Wellen" → ROT an STIMMT (24 %), „Zeile ohne Druck" → ROT an DRUCK, „Richtung blind" → ROT an STIMMT (0 %).
- (F) zog mit dem Gesetz: „A nass bei trockenem B ≥ 20 %" war das Aliasing der drei Sinus-Wellen; Regen dekorreliert über 50–110 km (Korrelation bei 0 km 0,92, Peleg et al. 2013), über die Lage 8,6 %. Soll jetzt: die Kante zieht (> 0) und der Lag 240 s gegen 273 s ±20 %. Die volle Wache (Null-Renderer) lief hier: GRÜN bis auf diese eine Klinge, die nun zieht.
- windWeg 0,097 → 0,138 ms je Aufruf (ein Aufruf je Bild, `_wolkenWind`).
- Vorprüf-Kopf 1 auf main 3008a66: `check:statik` GRÜN · gate:wetter-wache voll GRÜN (probeUrteil GRÜN) · gate:mp-sync Exit 0 mit EINER roten Zeile „(b) Tür … kein Rejoin geplant“ — am main 52937c92 dieselbe Zeile, nicht vom Wetter, darum nicht im Ruf · gate:tag-achse:echt hier nicht fahrbar (SwiftShader: das erste Weltbild steht nicht), der Richter ist der Ruf an der Radeon · `zug.sh probe-tag` liegt in keinem Zweig, der Ruf ist von Hand gegen `spec/ci/ci-zeiten.json` gehalten (wetter-wache 79 s · tag-achse:echt 117 s).
- Messort der Station: Ort (0, 0) der Heimat, kein GPU-Messort — der Mess-Leib FRONT_AN ist deterministisch am Kern; die Zahl am Gerät ist die Zahl headless.
- Ehrlich offen: der Rumpf der Station im Zweig `punkte-maschine` nicht gefahren — der Vor-Richter fährt sie; stadtklima#1 am Rumpf seiner Station nicht nachgefahren (kraft#2: die Böe-Linse (Ö) am Wirt GRÜN, Laufzeit ±2 %); das Bild des Himmels (Wolken-Zug mit der Drehung) nur am Ruf `bild:wiese@0.5`.

Karte 2 gebucht 149 von 1 718 · Status ZWISCHENSTAND.

## 27.11. — Schub 2: der Prototyp der Lage hält die Station (headless), der Schnitt in phyto-core läuft

- Prototyp (EINE Phase ζ des Durchzugs längs der Zug-Koordinate s, Zyklus 40 Takte; Front-Stärke, Druck und Drehung lesen dieselbe ζ; die drei alten Wellen nur noch als Textur): **stimmt 0 % → 86 %**, Drehung ≥ 15° 0 % → 98 %, Druckfall 0 → 88 %, Abfolge 52 → 88 %, 50 von 50 Passagen; die 7 Fehl-Passagen sind Fenster, deren erster Regen der Schauer des Nebentrogs hinter der Kaltfront ist (Druck steigt dort — richtig so).
- Verteilung der Zeilen alt → neu: klar 27 → 44 % · nebel 15 → 24 % · bewoelkt 21 → 17 % · regen 25 → 13 % · sturm 13 → 3 % (nass 38 → 16 %).
- Band: Bjerknes & Solberg 1922 (Ci → As → Ns, Druckfall vor der Front, Rechtsdrehung an der Front, Schauer dahinter); Hess & Brezowsky 1952 / Gerstengarbe & Werner 2010 (PIK 119): Lage ≥ 3 Tage, häufigste Andauer 3 Tage, WZ 15,7 % des Jahres; Kaltfront-Drehung Beispiel 225° → 290°.
- Offen jetzt: Schnitt in `phyto-core.js` (wetterAt · windRichtung · windWeg · frontVerteilung), Linse in gate:wetter-wache, check:statik.

## 27.11. — Sitzung 3, Schub 1: die Täter-Zahl am heutigen main 52937c92

**Die rote Zeile gilt am heutigen main.** Akte `vision/richter/planet.wetter.lagen.2.f0a89f7e-gtx.json` im Zweig `punkte-maschine` (GTX 1060, 23.11.), wörtlich:

> S2 Umfang nicht erzeugbar: kein Druckfeld und keine Wolkengattung (Cirrus, Nimbostratus) in der Welt — das Wetter am Ort ist ein Wort aus drei Sinus-Wellen (phyto-core.js:4423 wetterAt), der Druckfall ist nicht messbar · stimmtProzent 0 % gegen Soll ≥ 80 % ✗ · passagen 50 gegen Soll ≥ 50 ✓ · Täter: phyto-core.js wetterAt (drei Sinus-Wellen, kein Druck, keine Gattung)

**Nachgerechnet headless am Kern von 52937c92** (der Mess-Leib FRONT_AN der Station `vision/k2-planet.js:5125` im Zweig `punkte-maschine`, Ort (0, 0), Heimat, 50 Saaten `wetter-s0…49`, 400 Takte à 120 s):

| Maß | Wert am main | Soll |
|---|---|---|
| passagen | 50 | ≥ 50 ✓ |
| stimmtProzent | **0 %** | ≥ 80 % ✗ |
| abfolgeProzent (Decke steigt + Schauer) | 52 % (anstieg 26 / 50, schauer 50 / 50) | — |
| drehungProzent (rechts ≥ 15° über ±3 Takte) | **0 %** | — |
| Druck an der Passage | **0 von 50** (die Zeile trägt `zeile,front,feuchte`) | Zeuge ≥ 50 |

**Täter mit Datei:Zeile:**
- `phyto-core.js:5053` `wetterAt` — die Front ist die Summe dreier unabhängiger Sinus-Wellen (6 600 · 4 100 · 2 500 m, `WIND_FELD.front`, :4928), die mit `zugMS` 11 m/s ziehen: kein Druckfeld, kein geordneter Durchzug (vor dem Regen steht in 24 von 50 Passagen klar oder Nebel statt einer Decke, die sich verdichtet).
- `phyto-core.js:4965` `windRichtung(saat, t)` — die Richtung ist ein Mäander der Uhr allein (±41°, Perioden 698 s und 244 s), blind für die Front: die Drehung über ±3 Takte am Regenbeginn liegt in allen 50 Passagen unter 15°.

**Der Schnitt (P, eine Zeile):** Chokepoint `wetterAt` + `windRichtung` im Kern — die Front wird ein Durchzug mit Profil (Bjerknes & Solberg 1922: Druckfall vor der Front, Aufzug der Decke, Regen, Rechtsdrehung des Winds an der Front, Schauer dahinter); Druck und Drehung folgen aus DERSELBEN Front-Koordinate, kein zweiter Wetter-Weg. Leser bleiben `_wetterAmOrt` / `_wetterFeldAm` / `_windDirAt`; `_boeWeg` und `_windAt` (Bahn `rauch-nan`) fasse ich nicht an.

Karte 2 gebucht 149 von 1 718 · Status ZWISCHENSTAND.
