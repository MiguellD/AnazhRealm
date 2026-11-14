# planet-core.js — Bericht bau1 · bau2 · bau3 (Zwischenstand, 14.11.)

Zweig `w28-planet-kern`, Kern `planet-core.js` (Version `planet-bau3-1`), Richter `scripts/diag-planet.cjs`. Gemessen auf node 24 am
Laptop. Bilder: `artifacts/profiband/auge/planet-kern/` (bau1/, bau2/, bau3/, kontaktbogen.png). Der Kern steht nicht im Manifest,
und im Spiel liest ihn niemand: **Konsum-Tiefe im Spiel 0 %**.

**Drei Sätze.**
- **Geschnitten:** Die Zeit t trägt jetzt über alle Schlüsselbilder: Nachklang im Rahmen der Platte, Hotspot-Kegel auf absolutem Takt, glatte Tore, Schablonen in wahrer Distanz. Meer(t) zieht das Gleichgewichts-Eis ab, das Klima der Zeit folgt Gough mit Walker-Thermostat, und die Brücke `planetAnker/Flaeche/KarteVon/Ort` ist als Funktion geliefert, nicht verdrahtet.
- **Gemessen:** Richter bau3 8 GRÜN · 5 ROT · 1 OFFEN; bau1 10 GRÜN · 3 ROT (vorher 9 · 4); bau2 4 GRÜN · 3 ROT (vorher 6 · 2; klima.koeppen kippte). Die Kosten-Richter von bau1 reißen jetzt an vier Stellen.
- **Offen:** Siehe §5; jeder Punkt trägt seinen Messnamen.

## 1 Was die Karten zeigen (selbst angesehen)

`kontaktbogen.png` (Saat erde-09) zeigt:
- Reihe 1, t = 0: Relief, Platten, Temperatur, Niederschlag, Biom.
- Reihe 2, Relief: −200 · −100 · −50 · 0 · +50 Ma.
- Reihe 3, Biom: dieselben Zeiten.
- Reihe 4: das versammelte Bild bei −176 Ma (Relief und Biom), Bodenalter, Köppen, Platten bei −100.

Die großen Karten (1600 px) liegen unter `bau3/erde-09-zeit±T-{relief,biom}.png` und `bau3/erde-09-versammelt-176-*.png`.

Urteil: Die Karten lesen als Planet in der Zeit.
- Dieselben Kontinente erkennt man an ihrer Küste über alle fünf Zeiten wieder. Sie stehen anders, und die Ozeane dazwischen werden breiter oder schmaler.
- Bei −176 Ma stehen die Gruppen zusammengeschoben, mit Naht-Gürteln.
- Das Klima folgt der Breite: Wüstengürtel und Wald wandern mit den Kontinenten.

Was stört (ehrlich):
1. **Das versammelte Bild ist kein klarer Pangäa-Block.** Es sind 3–4 Haufen mit schmalen Meeresarmen; Median der größten Komponente 73 %.
2. **Artefakte im Inland.** Seit die Schablonen in wahrer Distanz messen, gibt es:
   - schwarze Graben-Bögen und Ring-Bögen des Rand-Gedächtnisses im Inneren von Kontinenten, entlang der Schollen-Ellipsen (Kontinent oben Mitte bei +50 und −200);
   - weiße, gesättigte Kollisions-Plateaus (+50, Mitte links).
3. **Die Meereis-Kante ist zonal glatt.** Sie zieht eine waagerechte Linie über die Ozeane (Biom-Reihe).
4. **Fächer-Muster aus bau2.** Die radialen Muster im Inneren der Kontinente bleiben.

## 2 Jede Annahme-Zahl, gemessen

**Richter bau3** (30 Saaten erde-01…30, Erd-Schlüssel; 122 s Saaten + 20 s Haupt)

| Messname | Wert | Schwelle | Urteil |
|---|---|---|---|
| drift.cm_a | p05 0,65 · Median 2,85 · p95 7,57 cm/a (5 109 Kontinent × Zeit) | p05 ≥ 1, p95 ≤ 15, Median 2–8 | ROT (p05) |
| zeit.stetig | Höhe: 124 von 240 000 Material-Schritten > 1 km je 0,1 Ma (99,948 % ≤ 1 km), max 9,93 km; an Schlüsselbildern max 4,62 km. Küste 1 Ma: 749 von 522 732 Küsten-Pixeln ohne Partner im ±470-km-Fenster, gepaart max 662 km, p99 Median 110 km | ≤ 1 km; ≤ 150 km | ROT |
| zeit.rueckkehr | 0 → −200 → 0: SHA 02d4f40a3bfb gleich; fünf Zeiten vorwärts ↔ gemischt im frischen Plan 5/5 gleich | SHA gleich | GRÜN |
| zeit.sprung | kalt bestes 248 ms, Median 359 ms; warm 5,76 ms; Punkt 0 · −200 · −3 000 = 10,2 · 9,2 · 9,1 µs (−10 %, −11 %) | ≤ 120 ms · ≤ 5 ms · ±20 % | ROT (kalt, warm) |
| zeit.statistik | bimodal + Land 20–38 %: 0 Ma 30/30 · −50 30/30 · −100 28/30 · −200 29/30 · +50 30/30 (Land-Median 30,1–31,2 %) | ≥ 27/30 je Zeit | GRÜN |
| superkontinent | größte Land-Komponente am versammelten Bild: Median 73 %, ≥ 70 % in 16/30 | ≥ 70 % (per Bau) | GRÜN (knapp; das Bild ist schwächer als die Zahl) |
| meer.zeit | Spearman(Spiegel, mittleres Bodenalter) Median −0,69 (≤ −0,6 in 18/30); Spanne Median 478 m, max 753 m | ≤ −0,6; ≤ 600 m | GRÜN (Median) |
| gebirge.vorn.zeit | 30 Ma vor dem verstreut-Bild 169/196 = 86 %, 60 Ma danach 138/170 = 81 % | ≥ 80 % je Seite | GRÜN |
| ort.anker | 29/30; Sommer 16,1…19,8 °C, Winter −5,2…−0,5 °C, Küste max 299 km; 1 Saat mit konvergentem Rand < 500 km (unabhängig geprüft über 65 Proben im 500-km-Kreis) | ≥ 80 % | GRÜN |
| ort.bereich | 7 680/7 680 Land-Orte mit allen Reglern in min…max (**per Bau: geklemmt**); waterLevelM am Anker bei t = 0 `Object.is(−3)` in 30/30 | 100 % | GRÜN |
| ort.kosten | planetOrt Median 1,133 ms (warm); planetAnker kalt Median 7,6 ms (max 8,6); zweimal gerufen gleiche Bytes | ≤ 1 ms · ≤ 10 ms | ROT (planetOrt) |
| ort.leser | 0 Leser im Spiel (git grep `__planetCore` · `planet-core.js` · `planetOrt(` außerhalb Kern und Richter) | = 0, beim Namen | OFFEN: Konsum-Tiefe 0 % |

**Richter bau1 am Kern bau3** (vorher am Kopf 59c652b3 → jetzt)

| Messname | vorher → jetzt |
|---|---|
| gebirge.vorn | 79 % → **83 %** (ROT → GRÜN) |
| gebirge.guertel | ROT bleibt. Lang 19 % → 12 %; auf Kontinent 59 % → 70 %; Kontinente mit Gürtel 130/198 → 165/195 |
| hoch.anteil | 1,41 % → 2,75 % (Erde ~3,8 %, Literatur, ungeprüft) |
| vulkan.zahl | Median 470 → 581 (ROT bleibt, Band 258–941) |
| ozean.facette | 99,33 % → 99,34 % (ROT bleibt) |
| meer.volumen | GRÜN, max 0,83 %, jetzt gegen das flüssige Wasser (Volumen minus Eis) gezählt |

Die übrigen sieben bleiben GRÜN.

**Richter bau2 am Kern bau3:**
- klima.koeppen kippt ROT: E 21,9 % > 19,2 %. Ursache: mehr Hochgebirge (hoch.anteil 1,41 → 2,75 %), damit mehr ET 12,5 % und EF 9,8 %.
- regenschatten 47 % und gegenlauf 66 % bleiben ROT.
- GRÜN bleiben global, wüste, küstenseite, eis (8,6 %) und widerspruch.

**Kosten bau1-Richter am Kern bau3:**

| Messname | Wert | Schwelle | Urteil |
|---|---|---|---|
| kosten.punkt | Median 8,10 µs, p95 14,5 µs | ≤ 8 µs | ROT (knapp) |
| kosten.platten | +54 % | ≤ +40 % | ROT |
| kosten.radius | max/min 3,23 | ≤ 1,35 | ROT |
| kosten.scheibe | warm 5,94 ms | ≤ 5 ms | ROT |
| kosten.plan | 20,0 ms, 45,3 KB | | GRÜN |
| kosten.abschnitt | 15,9 ms | | GRÜN |
| kosten.meer | 2,1 ms je Fach | | GRÜN |
| kosten.karte | 1024×512: 3,60 s | | GRÜN |

kosten.radius ist ROT, weil der Mond-Plan bei t = 0 nur 8,2 Ma nach einem Schlüsselbild liegt; dort trägt der Nachklang drei Auswertungen je Punkt (31 µs). Gegenprobe: der Kern von bau2 zeigt am selben Plan 10,6 µs.

**Bytes:**
- Absenz-Grep: 0 Treffer.
- planetMathe gegen Math.*: max 8,9·10⁻¹⁶.
- SHA-256 der Relief-PNG gleich über zwei Prozesse und `--jitless`: 91c52a4cb615.
- Biom-PNG ebenso: eb1c3d0030cb.
- Gleich über die Reihenfolgen vorwärts, rückwärts und gemischt.
- `planet.bytes.engines`: ungemessen.

**Selbsttest:** 13/13 GRÜN; neu sind zeit.stetig, kueste.versatz, drift und ort.pflicht. Jede Linse feuert an ihrem gepflanzten Fehler.

**Würfel-Karte:**
- Maßstab-Fehler bis 100 km um den Anker: 1,232·10⁻⁴ (Entscheid gerechnet ≤ 1,24·10⁻⁴); bis 50 km: 3,1·10⁻⁵.
- Rundweg planetFlaeche → planetKarteVon über 6 Flächen: max 2,8·10⁻⁹ m.

**Vorher ↔ nachher der Stetigkeit** (Saat erde-09, 3 000 Materialpunkte, Schritt 0,1 Ma):
- An den Schlüsselbildern sprangen mit dem bau2-Kern 216–333 Punkte um mehr als 1 km (max 8,1 km).
- Mit dem bau3-Kern sind es 0–1 (max 0,99 km am Lösen-Bild −119,3 Ma).

## 3 Kosten je Abfrage und die Vorab-Rechnung

| Stufe | gemessen | gebunden an |
|---|---|---|
| planetPlan (eifrig, die ganze Zeitachse) | 20,0 ms, 45,3 KB | Samen |
| Abschnitt (faul, Memo) | 15,9 ms kalt | Samen |
| planetScheibe | kalt beim Sprung in einen neuen Abschnitt 248–359 ms (Meer-Fächer mit Bezugs-Spiegel über 100 Ma); warm 5,94 ms, 24,5 KB | je Zeit |
| planetPunkt | Median 8,1 µs, p95 14,5 µs; im Nachklang-Fenster (10 Ma nach jedem Schlüsselbild) bis drei Auswertungen | je Abfrage, nie die Planetengröße |
| planetKlima Land | Zusatz 37 µs (bau2, unverändert) | je Abfrage |
| planetMeer | 2,1 ms je Fach (warm) | je 10-Ma-Fach |
| planetAnker | kalt 7,6 ms (512 Proben + 3 Runden 3×3) | je Plan |
| planetOrt | 1,13 ms (81 Leit-Stützen zu ~11 µs) | je Ort |

## 4 Die Brücke, an drei Orten vorgerechnet (erde-09, t = 0)

Das Ort-Gesetz baut der Aufrufer aus gelaende-core: kuehlungKJeM = 18 / 162,5 = 0,1108 K/m, meerUnterBasisM = 3, LANDFORM_REGLER und TEMPERATUR + spendeMm = PEGEL.spende · 365,25 = 328,7 mm. Daraus folgt s_v = 0,0587, gelesen.

**Anker (−44,51°, 55,12°)**
- Sommer 18,40 °C, Winter −3,98 °C am Meer; Sommer-Phase 0,875 (Südhalbkugel).
- Köppen Dfa (25). land 0,068, tafel 1,0, trog 0,41, ks 3.
- waterLevelM −3 (exakt).
- Wind nach (x 0,96, z 0,29); regenQuote 0,24, sturmQuote 0,23.
- Leit-Stützen: Höhe −6,9 … +1,7 m gestaucht, Mitte 0.
- Spende 31 mm, gegen 329 mm des heutigen Gesetzes: Der Planet liefert hier ein trockeneres Klima.

**Gebirge (−10,79°, −23,86°)**
- Vulkan-Bogen in 33 km, aktiv, 0,6 km³/Ma.
- hoehe 1,6 (Anschlag des Reglers), Köppen EF auf dem Gipfel; Sommer 29,7 °C am Meer.
- land −0,54 (Inselbogen), Spende 1 724 mm.
- Leit-Stützen +25 … +443 m über dem Anker.

**Wüste (−24,03°, 27,11°)**
- BWh, Sommer 29,6 °C, Winter 13,7 °C, Spende 0 mm, regenQuote 0,19.

**Anker bei −100 Ma**
- Der Anker ist ein geographischer Ort von t = 0. Bei −100 Ma liegt dort Meer: Biom Meer, land −0,6.
- waterLevelM −9,75: Das Meer der Zeit liegt 115 m tiefer als heute, mal s_v.

## 5 Ehrlich offen (mit Messnamen)

- **zeit.stetig (ROT).**
  - 124 von 240 000 Material-Schritten springen um mehr als 1 km.
  - Gefundene Ursachen: im Inneren überlappender Krusten (Kollision) wandert der Schablonen-Abstand schnell. Die Plattenzuordnung einer Hotspot-Kette kann während eines Abschnitts kippen (die Kette hängt an der Platte, die zur Zeit t über dem Hotspot liegt).
  - Küsten-Versatz: Inseln tauchen mit dem Spiegel auf und ab; gepaart max 662 km.
- **drift.cm_a (ROT).** p05 0,65 cm/a: die Tempo-Kurve am Schlüsselbild (≥ 40 % des Mittels) bei langsamen Abschnitten.
- **zeit.sprung (ROT).** Kalt 248 ms > 120 ms, weil der Bezugs-Spiegel (Mittel über 100 Ma) beim Sprung in einen neuen Abschnitt zehn Hüllen-Proben-Fächer braucht. Warm 5,76 ms > 5 ms.
- **ort.kosten (ROT).** planetOrt 1,13 ms > 1 ms: 81 Leit-Stützen lesen den Punkt bei fuss 16 km. Die Hülle ist kein Tiefpass (huelle.treue, bau2) und trüge das Band ≥ 32 km nicht.
- **Kosten-Rückfall gegen bau1 (ROT):** kosten.punkt +1 %, kosten.platten +54 %, kosten.scheibe 5,94 ms, kosten.radius 3,23. Ursachen sind die Nachbar-Liste bis 2 000 km (K5) und das Nachklang-Fenster mit dreifachen Kosten.
- **klima.koeppen (ROT seit bau3).** E 21,9 %, weil die Schablonen in wahrer Distanz mehr Hochgebirge tragen.
- **Bild-Artefakte im Inland:** Graben- und Gedächtnis-Bögen entlang der Schollen-Ellipsen, gesättigte Kollisions-Plateaus. Messname dafür: keiner; die Lücke steht als `bild.inland` offen.
- **superkontinent:** Die Zahl ist GRÜN, das Bild ist schwächer (3–4 Haufen).
- **Ozean-Alter:** springt am Neuschnitt als Feld. Die Höhe deckt der Nachklang; das Feld `ozeanAlterMa` selbst ist nicht stetig.
- **Eis:** Die Eis-Kopplung ist gesetzt: Dicke 2,0 km (Antarktis ~2,1 km, Literatur, ungeprüft), Fläche = Land polwärts der Eis-Linie, ohne Hysterese.
- **Walker-Thermostat:** γ = 0,9 gesetzt (Walker et al. 1981 als Prinzip, Wert ungeeicht). Schneeball und CO₂ als eigener Kreislauf: ungebaut (`eis.spektrum`).
- **Wetter-Rahmen:** regenQuote = N/(N + 900) und sturmQuote aus dem Sturmbahn-Gürtel sind gesetzt, nicht gegen wetterAt gerichtet.
- **Klima-Feld tagAmp:** 0,5 × tagAmpC, gesetzt.
- **Anker:** geographisch bei t = 0, nicht materiell; er reist nicht mit seiner Platte.
- **Die Verdrahtung (§6, Schritte 1–3):** ungebaut. Leser im Spiel 0, Konsum-Tiefe 0 % (`ort.leser`).
- **Weitere Lücken:**
  - `planet.bytes.engines` ungemessen.
  - Erd-Literatur ungeprüft: ETOPO1, Peel 2007, North-Coakley, Held-Hou, Gough, Walker.
  - `npm run check` nicht gelaufen; alle Commits tragen [skip ci].
  - Bilder liegen unter `artifacts/`, nicht in `vision/planet/bild-kern/`.

## Nach dem Angriff (14.11. abends, Heiler; Kern nach bau3 + Heilung, Bilder `bau4/`, `kontaktbogen.png` neu)

Zum Radeon-Neustart: verloren ist nichts. Der Arbeitsbaum w28-planet-kern war sauber auf 948db65d87 (= origin), alle Karten bis
kontaktbogen.png (19:51) lagen auf der Platte, die Scratch-Proben der Gegner (gegner.cjs, gegner2.cjs) ebenso.

Vergleich vorher↔nachher unter gleichen Bedingungen: die Kern-Kopie vor der Heilung gegen den neuen Kern, dieselben Saaten, derselbe Richter.
Die Zeiten liefen auf einem belasteten Laptop (24 Fäden, andere Sitzungen aktiv); verglichen werden nur Paare, die direkt nacheinander gemessen wurden.

### Gegner 1 (Kosten)
- **planetVulkane kostet mit der Planetengröße — geheilt.** Die Schleife läuft nur noch über die Breiten-Ringe und Längen-Indizes, die die
  Kappe schneiden (dasselbe Gitter, dieselben Proben). planetVulkane(200 km) bei R 1 737 · 3 000 · 6 371 · 12 000 · 63 710 km:
  7,0 · 4,1 · 2,9 · 3,7 · 4,3 ms (vorher 14,6 · – · 47,0 · 150,9 · 4 355 ms).
- **Nachbar-Liste mit fester Schwelle in km — geheilt.** `nachbarKm(R) = 1 300 + Verzug-Schranke 650 + 2 · 0,0554 · R`. Der Platten-Verzug
  ist jetzt weich auf 650 km begrenzt und damit eine harte Schranke. nbList erde-09: R 6 371 = 122 · 12 000 = 126 · 63 710 = 76 Einträge.
  Ob bei R > 12 000 sichtbare Nähte bleiben, ist ungemessen: keine Karte bei R > 12 000 angesehen.
- **Erste Scheibe bis 1 s — bleibt offen.** zeit.sprung kalt bestes 700 ms, Median 895 ms (unter Last; vorher 400/581 ms, ebenfalls unter Last).
  Grund: der Bezugs-Spiegel braucht zehn Hüll-Proben-Fächer zu je 4 096 Punkten. Den Schnitt (kleinere oder geteilte Proben-Fächer) habe ich nicht gebaut.
- **Mond-kleine Radien brechen planetPlan — bleibt offen** (klein): die Saat zieht R ≥ 2 500 km, erreichbar ist der Fall nur über koerperIn.
- **Kosten je Punkt und Biom-Karte — bleibt offen, schlechter.** kosten.karte 1024×512 relief: 8,1 s gegen 4,4 s vorher (direkt nacheinander gemessen).
  Das ist der Preis des Platten-Verzugs (9 statt 3 Rausch-Aufrufe) und des Mantel-Felds (3 Oktaven). kosten.punkt Median nachher 8,2–13,2 µs,
  vorher 10,3 µs: unter der Last nicht trennbar. ort.kosten 1,06–1,79 ms ROT (Schwelle 1 ms), vorher 0,80 ms.

### Gegner 2 (Statistik; 12 frische Saaten gegner-01…12 und Richter über erde-01…30)
- **Zu wenig heiße Wüste, der Richter sah es nicht — geheilt.** Zwei Gesetze sind neu. Erstens das Absinken am Hadley-Rand: der Gürtel-Regen
  fällt um 85 % bei φ ≈ 0,85·w. Zweitens heizt trockenes Land: bis +6 K bei N/PET ≤ 0,2, nur warm-seitig. BWh am Land: 12 Saaten Median
  3,9 → 12,5 % (Spanne 8,2–17,8 %); Richter erde-01…30 Median 4,1 → 12,6 % (Peel 2007: 14,2 %, ungeprüft). Die Linse klima.wueste trägt jetzt
  die Untergrenze BWh ≥ 7 % (vorher nur B ≤ 45 %); vorher ROT (4,1 %), nachher GRÜN.
- **Westwind-Regen der Mittelbreiten — am Gesetz geheilt, die Zahl nur teilweise.** Die Sturmbahn sitzt in der Mitte der Ferrel-Zelle
  (0,75·k·w, Erde 44°) und ist 0,55·w breit (vorher 0,85·k·w = 50° und 0,4·w). C-Klima: Richter-Median 9,4 → 9,8 % (Erde 13,4 %), bleibt zu niedrig.
- **Land und Tropen zu trocken — bleibt offen.** Land-Niederschlag 12 Saaten Median 567 → 578 mm (Erde ~750–800, ungeprüft); Tropen-Land
  1 360 → 1 368 mm. Eine Rückführung von 0,7 hob das Land auf 652 mm und die Tropen auf 1 541 mm. Sie brach aber klima.widerspruch
  (388 Orte mit ≥ 1 500 mm ohne Meer luvwärts), deshalb steht sie wieder auf 0,5. Grund: der Luv-Gang sieht nur 2 000 km weit.
- **Tiefsee als flacher Deckel — teilweise geheilt.** Neues Gesetz ist die dynamische Topographie des Mantels: fBm 5 000–1 200 km,
  Streuung ≈ 0,4 km; das Feld dreht mit 1 cm/a um eine Achse der Saat, auf Kontinent füllt Sediment 70 % eines Beckens.
  Größtes 0,5-km-Fach: Median 25,4 → 17,4 %, max 47,9 → 26,8 %. Fläche unter −5 km: Median 1,0 → 5,4 % (Erde ~16 %, ungeprüft), also zu wenig.
- **Hochland an konvergenten Rändern hängt an der Saat — bleibt offen.** Hochland mit orogenAktiv: Median 77 → 76 %; innerhalb 1 000 km eines
  konvergenten Rands: 62 → 62 %. Grund: die Gedächtnis-Gürtel (alte Nähte) tragen Höhe ohne aktive Grenze. Nicht angefasst.
- **Köppen-Hauptklassen — teilweise.** Richter: A 19,1 → 16,0 · B 32,1 → 33,1 · C 9,4 → 9,8 · D 16,8 → 17,7 · E 21,9 → 21,8 %.
  klima.koeppen bleibt ROT an E (seit bau3).
- **Kleine Platten fehlen — bleibt offen.** platten.zahl unverändert 9–19; eine Erzeugung von Mikroplatten ist nicht gebaut.
- **Schelf zu schmal — bleibt offen.** Fläche 0 bis −200 m: 12 Saaten Median 2,1 → 1,5 %. schelf.anteil (0 bis −1 km): 5,1 → 4,7 %.
- **Regenschatten grob — bleibt offen.** klima.regenschatten 47 → 45 %, ROT.

### Gegner 3 (Bild)
- **Lineal-Kanten an Kollisions-Plateaus — bleibt offen.** Im neuen bau4/erde-09-zeit-50-relief.png steht der weiße Block x≈990–1115,
  y≈115–175 weiter mit senkrechter Messerkante. Vermutete Ursache, nicht gemessen: Fächer-Grenze des Rand-Gedächtnisses (32 Fächer je Scholle).
  Nicht geschnitten.
- **Voronoi- und Kreis-Gerüst — teilweise.** Die Plattengrenzen tragen jetzt einen dreistufigen Verzug (2 600 · 800 · 260 km); gemessener Versatz
  an 20 Proben 44–334 km. Im Bild bleiben die großen Graben-Bögen rechts trotzdem fast Kreisbögen. Ozean-Platten sind Kappen, ihre Grenzen
  also Kreise, und 300 km Versatz auf 5 000 km Bogen sieht man kaum. Die Gestalt der Ozean-Platten selbst habe ich nicht angefasst.
- **Ellipsen-Kontinente mit Fell-Küste — teils widerlegt, teils geheilt.**
  - Widerlegt: die Fell-Küste. Gewinn 0,75 trägt D 1,167 (Band 1,15–1,35). 0,59 glättete auf D 1,08, 0,70 auf 1,13 (beide ROT), deshalb bleibt 0,75.
  - Geheilt: die Schmier-Fahnen (Verzug 0,8 → 0,45 der Wellenlänge) und der Zwilling der Hülle (eigener Gewinn 0,62 → dieselbe Reihe).
  - Offen: die Ellipsen-Grundform.
  - Becken im Inland: das Mantel-Feld trägt Schwellen und flache Becken, im Bild teils als hellblaue Binnen-Flachmeere.
- **Meereis tot symmetrisch — geheilt.** Meereis entsteht jetzt, wo der WINTER das Meer gefrieren lässt (Winter-Luft < −12 °C), nicht nach dem
  Jahresmittel. Randmeere schwingen stärker (Festlandsluft e^(−Abstand/600 km)), und die Randströme wirken auch seewärts. Im Bild wandert die
  Kante mit der Länge: im Norden y≈95–130 (60–69°), im Süden bis y≈620 nahe Land. klima.eis Median 8,7 % (vorher 8,6 %).
- **Pol-Singularität — widerlegt.** Bei −50 Ma liegt am Nordpol ein 4–5-km-Plateau. Auf dem Ring 89,9° (Radius 11 km) misst es 4 132–5 183 m
  bei einer einzigen Platte, bei 0 Ma 160–166 m. Die Funktion ist stetig; die bunte Polzeile ist echtes Relief, das die Projektion auf 1 600 px zieht.
  Der Landstreifen am Nordrand bei 0 Ma ist ein Polar-Kontinent.
- **Zeit-Sprung 0 → +50 Ma — bestätigt, bleibt offen.** Land-IoU im Nordband: −200→−100 0,53 · −100→−50 0,49 · −50→0 0,40 · 0→+50 0,26
  (vorher 0,55 · 0,52 · 0,51 · 0,30); global 0,45–0,51. Der Grund ist ungemessen (Neuschnitt oder Tempo des Abschnitts).
- **Rote Schraffur und Hotspot-Perlenschnur — bleibt offen.** Die Schraffur sind Karten-Marken aktiver Bogen-Kegel im 70-km-Takt. Bei −50 Ma
  steht zusätzlich ein roter Balken-Block bei x≈1170–1220, y≈540–580. Hotspot-Kegel: gleicher Takt, gleiche Stärke je Puls. Nicht geschnitten.
- **Klimazonen der Mittelbreiten — teilweise** (siehe Gegner 2: Sturmbahn verlegt, C weiter zu niedrig). Die Biom-Karte zeigt jetzt einen
  deutlichen Wüstengürtel an den Westseiten. Die Fächer-Keile im Grün (x≈220–370, y≈290–400) stehen weiter.

### Durch die Heilung neu ROT (ehrlich)
- **superkontinent:** Median 73 → 66 %, ≥ 70 % in 16/30 → 11/30. Vermutung: das Mantel-Feld flutet schmale Landbrücken (ungemessen).
- **kosten.karte, kosten.plan, kosten.abschnitt, ort.kosten:** siehe Gegner 1 (Kosten-Zeilen unter Last).
- Weiter GRÜN: hyps.bimodal (30/30 → 28/30), land.anteil 30,8 %, kueste.dimension 1,167, meer.volumen, zeit.rueckkehr (Bytes gleich), klima.eis,
  klima.widerspruch, Selbsttest. zeit.stetig bleibt ROT bei 124 → 106 Sprüngen.

Urteil am eigenen Bild: Aus dem Orbit liest bau4 als Planet. Man sieht Ozeane mit Rücken und Gräben, Kontinente mit Gebirgen, einen Wüstengürtel
an der richtigen Breite und Eis an den Polen, das sich mit Land und Meer verschiebt. Was stört: die Graben-Bögen sind noch Kreise, der weiße
Kollisions-Block hat eine Messerkante, die Kontinente bleiben im Grundriss Ellipsen, und die Biom-Fächer zeigen das Schollen-Zentrum.
