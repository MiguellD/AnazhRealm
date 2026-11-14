# ENTSCHEID 2 — das Gesicht (drei Schnitte am Kern) und die Reise (Plan der nächsten Welle)

Stand 14.11.2026, begonnen 21:46, Teil 1 gesichert 22:25, Teil 2 gesichert 22:30 · Blatt des Entscheiders der zweiten
Planeten-Welle · ZWISCHENSTAND.
Kein Kern-Code berührt: `planet-core.js` steht unverändert am Kopf d660f478 (Zweig `w28-planet-kern`). Konsum im Spiel weiter 0 %.
Alle Zeilen-Angaben zu `planet-core.js` und `scripts/diag-planet.cjs` gelten an d660f478, alle zum Spiel an main 7f778d44c1.
Jede Zeile, auf die dieses Blatt baut, ist in der Quelle nachgelesen.

Jede Zahl trägt ihre Herkunft: **gemessen** (mit Probe oder Richter, heute), **gerechnet** (aus Gemessenem oder aus dem Gesetz),
**Literatur zum Prüfen** (aus dem Gedächtnis, vor dem ersten Lauf an der Quelle zu prüfen) oder **geschätzt** (ohne Quelle; gilt
als Band nur bis eine Erd-Maske im Baum liegt, Messname `erde.maske`).

**Drei Sätze.**
- **Entschieden:** G1 schneidet die Gestalt an fünf Stellen EINER Kette (wer gruppiert · Lappen in zwei Bändern · die Küste als
  Höhenlinie · EINE Küste für alle Leser · Ozean-Platten als Stätten-Ketten), G2 das Innere und jede Messer-Kante als EINE Klasse
  („an der Grenze entscheidet das Paar, nie die Seite“) samt Feuchte als Integral, G3 die Zeit und die Kosten samt dem, was die
  Reise vom Kern braucht. Die Reise liest das Ort-Gesetz aus EINER Quelle, einem neuen Export `ortGesetz()` von `gelaende-core`.
- **Gemessen (heute, eigene Proben):** Richter am Kopf 10·3 / 5·3 / 6·5·1 (die Zahl im Auftrag, 10·3 / 4·3 / 8·5·1, ist veraltet).
  Eine kalte Scheibe rechnet 28 672 Hüll-Punkte in 7 Sätzen (314–568 ms, Median 408 ms); der Bezugs-Spiegel mit 1 024 statt
  4 096 Proben senkt sie auf das 0,548-fache bei 14,6 m Abweichung. `kont` springt an 108–218 Schollen-Nähten je Saat um mehr
  als 100 km. Das Größen-Spektrum fällt NICHT an den Zeilen 326 und 342: die größte Gruppe bleibt bei 0,25 der Kruste, weil
  `neuSchnitt` (523–540) die Gruppen schneidet. EINE Gruppen-Funktion für Anfang und Neuschnitt hebt sie auf 0,43 und das
  größte Landstück von 0,39 auf 0,51, bei 10–19 Platten.
- **Ehrlich offen:** Die Erd-Spalte der Gestalt-Maße ist außer dem Land-Anteil ungeprüft. Die beste Kopie (Gruppen + Lappen 1,0
  + Becken) steht bei `land.stuecke4` 35,5 gegen ≥ 40, `land.ellipse` 0,869 gegen ≤ 0,85 und `land.fern1000` 7,3 % gegen ≥ 8 %.
  Die Ozean-Stätten, die beidseitige Schablone und der Schild sind ungebaut und ungemessen. Die ≤ 5 s der Reise hängen an
  PFLICHT-OFFEN B.

---

## 0 Worauf dieses Blatt steht

**Gelesen (voll):** `befund-gesicht.md`, `befund-reise.md`, `ENTSCHEID.md`, `BERICHT.md` samt „Nach dem Angriff“, `REGELN.md`
(R2, R7, R8, Z2, Z8, Preis-Treppe), die Leitern `planet.geologie.platten`, `planet.wetter.klimazonen`, `same.massstab.sprung`,
`same.kopplung.zeitreise`, `same.entfaltung.reise` in `meisterkarte-2.json`, `planet-core.js` Zeilen 255–606, 600–1576, 1575–2012,
`diag-planet.cjs` Zeilen 44–56, 238–253, 348–367, 381–387, 498–556, 605–680, 766–819, die Spikes `patch.cjs`, `lib.cjs`,
`mass.cjs`, `kosten.cjs`, `spektrum.cjs`.

**Mit dem eigenen Auge angesehen:** `bau4/erde-09-zeit+0-relief.png`, `…+0-biom.png`, `…+50-relief.png`, `…-50-relief.png`;
`welle2/erde-09-0-relief-heute.png`, `…-becken+lappen+wurzel-a2.0.png`, `…-a0.9.png`, `…-becken+wurzel-c5.png`, `…-relief-alle.png`,
`…-biom-alle.png`; `welle2/spike/faecher-erde09-feuchte.png` ↔ `faecher-neu-…`, `kante-erde09-m50-terme.png` ↔ `kante-neu-…`;
dazu zwei eigene Karten (§0.3).

### 0.1 Der Blick — bestätigt, und zwei Funde dazu

Die sechs Punkte des Koordinators stehen am Bild, wie er sie nennt. Am eigenen Auge:
1. Ellipsen: die beiden „Eier“ rechts (x 1230–1330 und 1360–1520, y 350–600 in `bau4/…+0-relief.png`), die „Bohne“ unten links
   (x 100–440, y 480–700), das „Herz“ in der Mitte (x 840–1100, y 370–610). Alle tragen denselben Fransen-Saum, keines eine Halbinsel.
2. Das Innere ist eine Farbe je Kontinent. Bei −50 Ma stehen Teiche im Inneren, bei 0 Ma sind sie fort.
3. Fächer im Biom: Keile aus einem Punkt bei x 220–370, y 290–400, dazu gerade waagrechte Bandkanten mitten im Kontinent.
4. Der weiße Block bei −50 Ma (x 990–1115, y 115–175) endet rechts an einer senkrechten Kante.
5. Der Graben-Ring rechts (x 1050–1580, y 250–720) ist ein Dreiviertel-Kreis.
6. 0 → +50 Ma: der Polar-Kontinent verlässt den Pol, und der Schelf wird schmal. Ein Riss der Bewegung ist das nicht (§G3).

**Fund 1 — der Lappen-Spike löst das Bild nicht.** `…-a2.0.png` zeigt Halbinseln, Buchten und Inselketten, aber die Gebirge
zerfallen zu rot-weißem Krümel, und die Kontinente bleiben dieselben Flecken am selben Ort, nur ausgefranst. Die Zahl sagt
dasselbe: Land > 1 000 km von der Küste 2,9 % (gemessen, Befund).

**Fund 2 — eine dritte Art gerader Kanten im Biom.** Die schräge gerade Kante im Grün der „Bohne“ (x 120–215, y 555–650) steht
auch in `…-biom-alle.png` noch, also nach dem Feuchte-Schnitt. Ursache gemessen (§0.3): `kont` springt an der Naht zweier
Schollen.

### 0.2 Die Basis der Richter am Kopf d660f478 (gemessen 21:49–21:56, 30 Saaten, 10 Fäden, Laptop unter fremder Last)

| Richter | Urteil | ROT beim Namen (Leit-Zahl) | knapp GRÜN (Kipp-Kandidaten) |
|---|---|---|---|
| bau1 | **10 GRÜN · 3 ROT** | `gebirge.guertel` (lang 9 % · auf Kontinent 71 % · 155/178) · `ozean.facette` (99,33 %, schlechteste 98,44 %) · `vulkan.zahl` (Median 570,5, Band 256–965) | `hyps.bimodal` 28/30 · `land.anteil` 30,8 % · `schelf.anteil` 4,7 % · `ozean.alter` 86,1 Ma · `kueste.dimension` 1,167 · `gebirge.vorn` 83 % · `meer.volumen` 0,90 % · `platten.zahl` 9–19, größte 31,5 % |
| bau2 | **5 GRÜN · 3 ROT** | `klima.koeppen` (E 21,8 % über 19,2) · `klima.regenschatten` (45 %) · `klima.gegenlauf` (67 %) | `klima.wueste` 29/30, BWh 12,6 % |
| bau3 | **6 GRÜN · 5 ROT · 1 OFFEN** | `drift.cm_a` (p05 0,65) · `zeit.stetig` (106/240 000 Schritte > 1 km, max 8,95 km; 739 Küsten-Pixel ohne Partner, gepaart max 653 km) · `zeit.sprung` (kalt bestes 359 ms, Median 470 ms; warm 5,87 ms) · `superkontinent` (Median 66 %, 11/30) · `ort.kosten` (planetOrt 1,597 ms) · OFFEN `ort.leser` | `zeit.statistik` 28/30 bei 0 Ma · `meer.zeit` Rang −0,68, Spanne 457 m · `ort.anker` 28/30 |

Die Zahl im Auftrag (10·3 / 4·3 / 8·5·1) stammt aus dem Kopf des Berichts vor der Heilung: seither ist `klima.wueste` GRÜN und
`superkontinent` ROT. Die Roh-Ausgaben liegen in `spike-entscheid2/basis-bau{1,2,3}.txt`.

### 0.3 Eigene Proben (gepatchte Kopien im Scratch, Skripte in `vision/planet/spike-entscheid2/`)

| Probe | Ergebnis (gemessen) |
|---|---|
| `kont-naht.cjs` — springt `kont` (1341: `(fK − kuesteF)·sr[sBest]·R`), wo die nächste Scholle wechselt? 720×360, Inland ≥ 150 km, Ost-Nachbarn | erde-09 · 01 · 05: Naht-Paare 214 · 289 · 385, davon mit Sprung > 100 km **108 · 212 · 218**. Steigung an der Naht Median 2,9 · 5,3 · 2,7 km je km, im Schollen-Inneren 0,7–0,8. Niederschlags-Sprung an der Naht p95 21 % · 125 % · 41 %. |
| `kont-treu.cjs` — sieht `kont` die wahre Küste? Küsten-Pixel (wahrer Abstand < 110 km) mit `kont` > 300 km | heute 2,3–6,0 % (4 Saaten); mit Becken und Lappen (Kopie) **11,0–18,9 %**; Meer mit `kont` > 100 km 0,2–0,5 % → 0,7–2,3 %. |
| `kalt-profil.cjs` — woraus besteht `planetScheibe` kalt? | 7 Hüll-Proben-Sätze (0, −20, −40, −60, −80, +20 für den Bezug; +10 für das zweite Fach) = **28 672 Hüll-Punkte**; 90–98 % der Zeit. Kalt 314–568 ms (10 Läufe, Median 408 ms), `scheibeKern` 30–62 ms davon, je Hüll-Punkt 9,4–16,7 µs — die Hülle kostet so viel wie ein voller Punkt. |
| `bezug-n.cjs` — der Bezugs-Spiegel mit N Proben je Stütze aus eigenem Memo, 12 Saaten × 2 Zeiten, Kopie gegen heute im selben Prozess | N 2 048: ×0,758, Bezug ±4,7 m (max 19,9) · **N 1 024: ×0,548, ±14,6 m (max 42,9), Land ±0,12 Prozentpunkte (max 0,78)** · N 512: ×0,476, max 63,9 m, Land max 2,2 (verworfen). |
| `spektrum-spike.cjs` — das Spektrum IM Kern statt als Ziehung: Pareto α 4/3 (326), Anlagern (342), Deckel je Wurzel im Neuschnitt (535); 12 Saaten, t = 0 | Basis: 7,5 Gruppen, größte Gruppe 0,237 der Kruste, 2 Gruppen < 5 %, 13 Platten (9–16). Mit Spektrum (Deckel 12): 13,5 Gruppen, größte Gruppe **0,248** (0,15–0,57), Platten 17,5 (**13–22**), größter Schollen-Radius 3 646 km (eine Riesen-Ellipse), Land 32,8 %, Stücke ≥ 10⁴ km² 33,5. |
| dieselbe Kopie + Lappen 1,0 + Becken + Wurzel + Grenz-Normale (Deckel 8) | Platten 17 (13–20), größte 18,6 % (max 34,4) · Land **33,5 %** · Stücke ≥ 10⁴ km² 33 (10–56) · größtes Stück 0,425 · Formzahl 0,782 · Land > 1 000 km 9,3 % · Innen-Streuung 0,482 km · alte Gürtel 7,6 %. Bild: `spike-entscheid2/erde-09-spektrum8-lappen1-becken-wurzel-kante-relief.png`. |
| `gruppen-spike.cjs` — G1.1 als Kopie: EINE Funktion `gruppenGroessen` (Anlagern über die Zahl, neue Gruppe mit p 0,25, höchstens 19 − nO Gruppen, die größte ≤ 0,4 der Schollen) für den Anfang UND den Neuschnitt, der die Größen längs der Kontakt-Kanten füllt; Schollen-Gewicht Deckel 6; 12 Saaten, t = 0 | Gruppen 8,5 (6–15), größte Gruppe **0,426** der Kruste (0,21–0,58), Platten 13,5 (**10–19**), größte Platte 22,6 % (max 34,4), Land 30,9 %, größtes Landstück **0,508**, Stücke ≥ 10⁴ km² 29, Formzahl 0,804, Land > 1 000 km 11,6 %. |
| dieselbe Kopie + Lappen 1,0 + Becken + Wurzel + Grenz-Normale — die beste Kopie dieses Blatts | Land **31,2 %** · Platten 13,5 (10–19), größte 22,6 % (max 35,0) · Stücke ≥ 10⁴ km² 35,5 (10–44) · größtes Stück 0,524 · Formzahl 0,732 · Land > 1 000 km 7,3 % · Innen-Streuung 0,461 km · alte Gürtel 6,0 % · `land.ellipse` 0,869 · `meer.binnen` 2,1 %, 22,5 Stücke. Bild: `spike-entscheid2/erde-09-gruppen-lappen1-becken-wurzel-kante-relief.png`. |
| `gesicht-mass.cjs` — zwei Linsen, die den Täter nennen: `land.ellipse` (IoU eines Stücks ≥ 10⁶ km² mit seiner Momenten-Ellipse, je Saat das Maximum) und `meer.binnen` (Meer, das am 55-km-Gitter nicht am Weltmeer hängt, als Anteil der Landfläche) | heute: `land.ellipse` **0,899** (0,875–0,932), `meer.binnen` 0,6 %, 9 Stücke · Spektrum + Lappen 1,0: 0,870, 2,7 %, 24 Stücke · Lappen 2,0 (Kopie des Befunds): 0,805, 3,0 %, **59 Stücke**. |

Das eigene Auge an der besten Kopie (Gruppen + Lappen 1,0 + Becken): ein großer zusammengesetzter Kontinent mit einem
flachen Schelfmeer zwischen zwei Blöcken, einem Golf und einem Binnenmeer, zwei durchgehenden Gebirgszügen, daneben
mittlere und kleine Stücke verschiedener Größe und Randmeere; das Land steht im Grün des Tieflands. Das liest als Planet
mit Gesicht. Was stört: ein „Ei“ oben in der Mitte ist noch eine Ellipse, das Schelfmeer ist so groß wie ein Kontinent, und
der Süd-Gürtel krümelt stellenweise. An der ersten Kopie (Spektrum mit Deckel je Wurzel) stand das Land fast überall im
Braun der Rampe, und die Riesen-Scholle am Südpol (Deckel 12) war eine einzige glatte Ellipse.

### 0.4 Wo dieses Blatt vom Befund abweicht (mit Beleg)

1. **Das Spektrum sitzt im Neuschnitt.** Der Befund rechnet 0,558 für die größte Gruppe aus der Anfangs-Ziehung. Im Kern
   schneidet `neuSchnitt` (523–540) die Gruppen an jedem gelösten Schlüsselbild neu, mit Deckel 6 (535). Gemessen: ein
   Patch an 326 und 342 mit einem Deckel je Wurzel hebt die größte Gruppe nur von 0,237 auf 0,248; EINE Funktion für Anfang
   und Neuschnitt hebt sie auf 0,426.
2. **Die Lappen-Amplitude 2 fällt.** Sie leert das Innere (2,9 %) und zerkrümelt die Gürtel. Es gilt Amplitude ≈ 1 im groben
   Band, und die Tektonik liest nur das grobe Band.
3. **Die Formzahl trennt heute nicht von der Erde** (0,834 gegen geschätzt 0,75–0,85). Sie bleibt als Wächter gegen das
   Zerfransen; den Ellipsen-Fleck nennt `land.ellipse`.
4. **Die Küste als Höhenlinie trennt `kont` von der Küste** (11–19 % der Küste unsichtbar). Der Schnitt muss in derselben
   Welle `kont` an die neue Küste binden, sonst lesen Klima und Brücke eine alte.
5. **Das Schollen-Alter hat einen Leser:** `planetOrt` Zeile 1959 (Regler `tafel`). Der Punkt liest es nie.
6. **Die Breite der alten Gürtel** wächst an der Naht mit `1 + a/300` (1281), am erloschenen Rand mit `1 + a/200` (1295).
7. **Die Kreisbögen sieht man vor allem wegen der Stufe** (Befund, Punkt 5). Die Stufe gehört zur Klasse der Messer-Kanten
   und fällt in G2; G1 schneidet nur die Geometrie.

---

## Gemeinsam für G1 · G2 · G3

- **Baum und Folge:** alle drei in `.claude/worktrees/w28-planet-kern`, G2 auf dem Baum von G1, G3 auf dem Baum von G2. Reine
  CPU-Arbeit: `planet-core.js` und `scripts/diag-planet.cjs`, sonst keine Datei.
- **Basis einfrieren, bevor ein Zeichen fällt:** `diag-planet --richter bau1|bau2|bau3 --roh` am Kopf d660f478 als JSON in den
  Baum, dazu eine Kopie des Kerns `planet-core.g0.js` NUR im Scratch (Vergleichs-Kern für ABAB und Bildpaar, nie im Baum).
- **Kipp-Regel:** Eine Zeile, die in §0.2 GRÜN ist, bleibt GRÜN. Eine ROTE Zeile darf sich in ihrer Leit-Zahl nicht vom Band
  entfernen. Wer kippt, steht im Bericht beim Namen mit vorher ↔ nachher. Kein Band, keine Schwelle, kein Soll bewegt sich.
- **Die neuen Maße wohnen im Richter:** ein vierter Teil `--richter gesicht` in `diag-planet.cjs` (Familie `diag-*`, dieselben
  30 Saaten, Gitter 720×360, fuss 40 km). `gestalt()`, `innen()` und die Proben aus §0.3 ziehen dorthin um; die Spike-Kopien
  fallen. Jede neue Zeile bekommt im `--selbsttest` einen gepflanzten Täter, der sie ROT macht. Laufzeit des Teils ≤ 3 min.
- **Bildpaar aus EINEM Befehl:** `diag-planet --bildpaar <alt-kern.js> <samen> <zeitMa> <schicht> <px> <aus.png>` schreibt
  links den alten, rechts den neuen Kern mit denselben Pixeln. Jede Bild-Bedingung unten ist ein solches Paar, 1 600 px je
  Seite, abgelegt unter `artifacts/profiband/auge/planet-kern/welle2/g1|g2|g3/` und als Kontaktbogen in `vision/planet/bild-kern/`.
  Bild-Saaten: erde-09 an den fünf Zeiten, dazu die vier weiteren Saaten aus `bildSaaten()` (50–54) bei t = 0.
- **Erster Lauf jedes Schnitts ist die Karte,** nicht die Statistik: liest das Paar schlechter als vorher, steht der Schnitt nicht.
- **`VERSION` steigt mit jedem Schnitt** (`planet-g1-1`, `planet-g2-1`, `planet-g3-1`; Zeile 61). Der Anker von erde-09 ist
  nach der Heilung gewandert, ohne dass `VERSION` sich bewegte — diese Klasse fällt in G3 an einer Linse (R4 dort).
- **Bytes wie bisher:** nur `+ − × ÷`, `Math.sqrt floor abs min max imul` und `planetMathe`; kein `Math.random`, keine Wanduhr;
  `--bytes` und `--selbsttest` bleiben GRÜN nach jedem Schnitt. Kein Flag, kein zweiter Pfad: was ersetzt wird, fällt im selben
  Commit und steht unten beim Namen.
- **Sichern:** Commit und Push nach jedem Teil-Schritt, `[skip ci]` wie bisher im Zweig.

---

## TEIL 1 — DAS GESICHT

### G1 — Gestalt des Landes

**Das Gesetz in zwei Sätzen.** Land hat eine Rangordnung, weil die Schollen-Gruppen sie haben, und jede Scholle trägt ihre
Lappen im groben Band, das die Tektonik liest, und ihre Küste im feinen Band, das nur das Profil liest. Die Küste ist die
Höhenlinie der Kruste über dem Meer der Zeit, und jeder Leser, der „Küste“ fragt, liest dieselbe.

**Die fünf Stellen (Datei:Zeile, `planet-core.js`).**

| # | Stelle | Was dort steht | Was der Schnitt setzt |
|---|---|---|---|
| G1.1 Rangordnung | `planetPlan`: Gewicht 326, Radius 329–330, Anfangs-Gruppen 342, Anfangs-Lage 344–361, `neuSchnitt` 523–540 (Deckel 6 in 535) | Gewicht `0,35 + 1,6·u²` (Flächen-Verhältnis ≤ 5,6); Gruppen 2–6 der Reihe nach; der Neuschnitt verschmilzt bis 6 | EINE Funktion `gruppenZiehen` für Anfang UND Neuschnitt: Ziel-Größen aus bevorzugtem Anlagern (eine dominante Gruppe, zwei bis vier mittlere, Einzel-Schollen als Mikrokontinente), der Neuschnitt füllt sie längs der Kontakt-Kanten, alte Gruppen-Kanten zuerst. Start-Werte aus der Kopie: neue Gruppe mit p 0,25, die größte Gruppe ≤ 0,4 der Schollen, höchstens 19 − nO Gruppen. Deckel: `nG + nO ≤ 20` und keine Platte über 35 % (das Band von `platten.zahl` ist das Gesetz; die Kopie steht bei max 35,0 %, also an der Kante). Schollen-Gewicht gestutzt Pareto α 4/3 (`1/(v^¼)³`, nur `sqrt`), Deckel so, dass kein Schollen-Radius über dem größten von heute liegt (3 066 km, gemessen an 12 Saaten; die Kopie mit Deckel 12 trug 4 230 km). |
| G1.2 Lappen in zwei Bändern | `schollenFeld` 974–995 (Fenster 980, `lam0` 981, Verzug 983–990, fBm 991, Amplitude 992); `krusteFeld` 999–1022 | Rauschen nur im Gürtel −0,75 < f < 0,6, erste Wellenlänge = Radius, Amplitude 0,6 | Grobes Band (λ von `min(6 000 km, 2·rs·R)` bis 0,45·`lam0`) auf dem ganzen Feld ab f > −1,3, Amplitude 1,0 (Hebel 0,8–1,3). Feines Band (darunter bis `lamCut`) wie heute nur im Küsten-Gürtel, sein Fenster liest das GROBE f. `krusteFeld` führt beide Maxima: `gF` grob, Rückgabe voll. |
| G1.3 Wer welches Band liest | `plattenWertung` 927 (`dmin` aus `KF.gF`), Schablonen-Gewichte 1139–1140 und 1176–1177, Rand-Gedächtnis 1294 (`innenKm`), Nachbar-Liste 825; Profil 1245, K1-Vorrang 1112, `krustenSchwelle` 758–773 | alle lesen dasselbe volle Feld | Tektonik (Platten-Abstand, Schablonen, Gedächtnis-Ring) liest GROB; Profil, K1-Vorrang und Q lesen VOLL. K1 bleibt wahr: ein Punkt auf voller Kruste gehört seiner Gruppe (1112). |
| G1.4 Küste als Höhenlinie, EINE Küste | Profil 1245–1252 (`tafel` 1246–1250), `kuesteF` 1419–1421, `kont` 1341, Leser von `kont`: Klima 1675/1691/1727/1732/1740/1762, Anker 1885, Brücke 1962/1987 | `hA = oz(1−S1) + S1(1−S2)(−sd) + S2(fb + tafel)`; `kont` aus dem Krusten-Rand der nächsten Scholle | Ein Becken-Feld B im Schollen-Rahmen (4 000 km … 2·fuss, Gewinn 0,62, Amplitude c·Freibord, Start c 5) wirkt auf der ganzen Kruste: `… + S2·fb + S1·B`. `tafel` fällt. `kont` wird EINE Funktion: stetig über Schollen (`max_s (f_s − kuesteF)·sr_s·R` statt `sr[sBest]`) und gedeckelt durch den Abstand zur Null-Linie des groben Profils. |
| G1.5 Ozean-Platten als Stätten-Ketten | `plattenWertung` Ozean-Zweig 955–959, Gewicht ρ 365, Stätte 812–813 | `v = ρ − Winkel(q, Stätte)`, ρ = 0,42 + 0,3·Z je Platte: Kappen, Grenzen sind Kreise | Jede Ozean-Platte trägt k = 3 Stätten längs einer Achse aus der Saat, Wertung `ρ₀ − min_k Winkel_k` mit EINEM ρ₀ für alle. Grenzen zwischen Ozean-Platten werden Ketten von Großkreis-Stücken. ρ je Platte fällt. Gräben am Kontinent behalten ihre Bögen (Zweig 952). |

**Annahme als Zahl** (`--richter gesicht`, 30 Saaten, t = 0; Median über die Saaten, wo nichts anderes steht).

*Pflicht — der Schnitt gilt nur, wenn alle im Band stehen:*

| Messname | Definition | heute | beste Kopie (§0.3) | Band | Herkunft des Bands |
|---|---|---|---|---|---|
| `land.anteil` (bau1) | Land-Fläche | 30,8 % | 31,2 % (erste Kopie 33,5 %) | 29 ± 4 %, jede Saat 20–38 % | bestehend (ETOPO1 29,2 %) |
| `land.ellipse` | je Saat die größte IoU eines Stücks ≥ 10⁶ km² mit seiner Momenten-Ellipse | 0,899 (0,875–0,932) | 0,869 | ≤ 0,85 | gemessen (heute); Erde ~0,80–0,85 geschätzt (Australien, Antarktis) |
| `land.stuecke4` | Landstücke ≥ 10⁴ km² | 23 (18–36) | 35,5 | 40–100 | Literatur zum Prüfen: Erde ~80 (76 Inseln + 4 Massen); am 55-km-Gitter weniger |
| `land.formzahl` | Fläche ÷ konvexe Hülle, Stücke ≥ 10⁶ km² | 0,834 | 0,732 | 0,70–0,88 | geschätzt (Erde 0,75–0,85); Wächter: Lappen 2,0 gab 0,674 |
| `land.fern1000` | Land > 1 000 km von der Küste | 11,3 % | 7,3 % | 8–22 % | geschätzt (Erde 10–20 %); Wächter: Lappen 2,0 gab 2,9 % |
| `meer.binnen` | Meer ohne Verbindung zum Weltmeer am 55-km-Gitter ÷ Landfläche; Zahl der Stücke ≥ 10⁴ km² | 0,6 %, 9 | 2,1 %, 22,5 | 1,5–6 %, Zahl ≤ 30 | gerechnet aus Literatur-Flächen: Mittelmeer, Schwarzes und Kaspisches Meer, Ostsee, Rotes Meer, Golf ≈ 4,4 von 148,9 Mio. km² = 3 % |
| `kont.naht` | Inland-Nachbarpaare über eine Schollen-Naht mit `kont`-Sprung > 100 km | 108–218 je Saat | — | 0 | gerechnet: ein Abstand zur Küste ist stetig |
| `kont.kueste` | Küsten-Pixel (wahrer Abstand < 110 km) mit `kont` > 300 km | 2,3–6,0 % | 11,0–18,9 % | ≤ 3 % | gemessen (heute) |
| `gebirge.kruemel` | Fläche > 1,5 km in Stücken < 5·10⁴ km² ÷ Fläche > 1,5 km | ungemessen | ungemessen | ≤ der Wert des Kerns d660f478 | vorher ↔ nachher; der Macher misst „heute“ als Erstes |
| `grenze.bogen` | Kleinkreis-Radius der Grenzen Ozean–Ozean über ±2 000 km | 38–90° je Δρ (gerechnet) | — | Median ≥ 70° | Literatur zum Prüfen: Rücken nahezu Großkreise |

*Richt-Zahlen — sie müssen sich gegen den eingefrorenen Wert auf das Band zu bewegen; wer draußen bleibt, steht ROT beim Namen:*
`land.groesster` 0,40–0,65 (heute 0,387; beste Kopie 0,524; Erde 0,571 gerechnet aus 84,98 ÷ 148,94 Mio. km²) · `land.korcak` 0,45–0,75 (heute
0,22; Literatur zum Prüfen, Korčák 1938) · `land.stuecke5` 12–30 (heute 8,5; Erde 22, Literatur zum Prüfen) · `land.schmal300`
8–18 % (heute 11,8 %; geschätzt) · `kueste.entwicklung` 1,5–3,5 (heute 2,1; geschätzt) · `bogen.inseln`: Anteil der
Ozean–Ozean-Gräben mit Land binnen 300 km auf der oberen Platte ≥ 50 % (heute ungemessen; geschätzt nach Aleuten, Marianen, Tonga).

**Kosten-Deckel für G1:** `planetPunkt` Median ≤ 1,10 × Kern d660f478 (ABAB im selben Prozess, 7 Durchgänge, wie
`kosten.punkt.bau1` in `diag-planet.cjs` 624–627); die Hülle (`nurGrob`) ≤ 1,05 ×; `planetPlan` ≤ 25 ms. G3 holt den Rest.

**Annahme als Bild.** Paar `bau4/erde-09-zeit+0-relief.png` ↔ `welle2/g1/…` und die vier weiteren Bild-Saaten. Das Auge
muss ohne Legende sehen:
1. Kein Landstück ≥ 10⁶ km², dessen Umriss sich als EINE Ellipse zeichnen lässt. Die vier Täter aus §0.1 sind fort.
2. Eine Rangordnung auf einen Blick: ein dominantes Stück, zwei bis vier mittlere, mindestens fünf kleine.
3. Je großem Kontinent eine Halbinsel ≥ 500 km und eine Bucht ≥ 500 km; mindestens ein Rand- oder Binnenmeer ≥ 10⁵ km².
4. Die Gebirge bleiben Züge: der Hauptgürtel des größten Kontinents lässt sich ≥ 2 000 km ohne Lücke > 100 km verfolgen.
   Krümel wie in `…-a2.0.png` heißt nicht angenommen.
5. Die Tiefland-Farbe trägt das Land. Ein Kontinent ganz im Braun der Rampe (wie in der ersten Kopie, §0.3) heißt nicht angenommen.
6. Der Graben-Ring rechts ist kein Kreis mehr.

**Was NICHT getan wird (mit Ursache).**
- Keine Lappen-Amplitude 2: gemessen leert sie das Innere und zerkrümelt die Gürtel.
- Kein Stempel für Halbinseln, Inseln oder Binnenmeere: sie folgen aus Rangordnung, Lappen und Höhenlinie. Ein Sonder-Modul
  wäre ein zweiter Erzeuger der Küste.
- Der Wilson-Zyklus (`verstreuen`, `versammeln`, 408–462) bleibt, wie er ist. `superkontinent` (ROT, 66 %) wird hier nicht
  geheilt; die Zeile darf nicht fallen.
- Keine Akkretion, keine wachsenden Schollen, keine diffusen Ränder (`kruste.bilanz`, ENTSCHEID §7).
- Das Band von `platten.zahl` (8–20) bleibt. Mikroplatten leben INNERHALB des Bands; die Kopie mit 13–22 Platten ist deshalb
  nicht das Gesetz.
- Keine Erd-Maske aus dem Netz: ein Download braucht das Wort des Schöpfers. Die Erd-Spalte bleibt „zum Prüfen“ (`erde.maske`).

**Richter, die nicht kippen dürfen — die Gefährdeten beim Namen.** `land.anteil` (die erste Kopie stand bei 33,5 %, die beste bei 31,2 %; der Hebel ist die
Krusten-Schwelle 758–773 und der Hand-Faktor 1,22 in Zeile 329, nie das Band) · `hyps.bimodal` 28/30 · `schelf.anteil` 4,7 % (B
hebt Schelf über das Meer) · `platten.zahl` · `kueste.dimension` 1,167 (hängt am feinen Band und am Gewinn 0,75) · `ozean.alter`
86,1 Ma (größere Ozean-Platten tragen älteren Boden; der Hebel ist der Stätten-Abstand) · `meer.volumen` 0,90 % ·
`gebirge.vorn` 83 % · `gebirge.guertel` (ROT; lang ≥ 9 %, auf Kontinent ≥ 71 %) · `zeit.statistik` an allen fünf Zeiten ·
`superkontinent` ≥ 66 % · `drift.cm_a` (p05 ≥ 0,65) · `ort.anker` 28/30 · bau2 als Ganzes (das Land verteilt sich neu:
`klima.wueste`, `klima.eis`, `klima.kuestenseite` bleiben GRÜN, `klima.koeppen` E ≤ 21,8 %).

**Folge im Schnitt:** G1.1 (Plan allein, Karte ansehen) → G1.2 + G1.3 → G1.4 → G1.5. Nach jedem Schritt Karte, Richter, Push.

---

### G2 — Inneres und Klima-Bild

**Das Gesetz in zwei Sätzen.** Das Innere eines Kontinents trägt seine Geschichte: alte Gürtel stehen auf ihrer Krustenwurzel,
und das Alter der Scholle entscheidet, ob ihr Kern flacher Schild oder bewegtes Becken-Land ist. Feuchte ist ein Integral
längs des Winds über dieselbe Küste, und an jeder Grenze entscheidet das PAAR — Richtung, Schablone und Sockel sind von
beiden Seiten dieselbe Funktion.

**Die Stellen (Datei:Zeile, `planet-core.js`).**

| # | Stelle | Was dort steht | Was der Schnitt setzt |
|---|---|---|---|
| G2.1 Wurzel | `nahtTafel` 1062; Rand-Gedächtnis 1295; `TAU_A` 273 | `H0·(1 − e^(−a/20))·e^(−a/120)` und `H0·e^(−a/120)`: zwei Kopien EINER Abkling-Formel | EINE Funktion `gedaechtnisHoehe(H0, a)` mit zwei Zeitkonstanten, `e^(−a/120) + 0,15·e^(−a/1 500)`, an beiden Lesern. Ein 5-km-Gürtel steht nach 300 Ma bei 1,0 km, nach 1 Ga bei 0,4 km (gerechnet). |
| G2.2 Schild | Schollen-Alter 331 (1 500–4 000 Ma); einziger Leser heute `planetOrt` 1959; das Becken-Feld B aus G1.4 | der Punkt liest das Alter nie | Die Amplitude von B fällt mit dem Alter der Scholle (alt: flacher Schild mit feiner Rauheit; jung: Becken und Schwellen). Zwei Kontinente derselben Karte haben damit verschiedenen Charakter. |
| G2.3 Feuchte als Integral | `planetKlimaR` 1686–1727: Schritte 1593, `skal` 1697, Meeres-Anzeige 1704/1710, Gewicht `om` 1693 | sechs Punkt-Proben bei [75 … 2 000 km]·`skal`, scharfe Anzeige, `om = glatt(0,02; 0,35; Wind)` | 14 Knoten im festen Takt 150 km bis 2 100 km, nie mit dem Wind skaliert; die Meeres-Anzeige je Knoten liest das grobe PROFIL aus G1.4 (sie sieht Binnenmeere), über den Takt geglättet; dieselbe Rekursion; `om = Wind/1,044`. Die Kamm-Schranke liest die vier nahen Hüllen-Schritte. `schritte[4]` und `[5]` fallen. |
| G2.4 Grenz-Normale | `paarRelativ` 1033–1045 (Normale 1036), Rand-Schleife 1167–1169, `paarC` 832–836 | `n = t_j − t_i` kippt jenseits beider Anker; c springt von +49,4 auf −49,4 km/Ma auf 8,9 km Weg (gemessen, Befund) | Wo die Normale schwach ist (unter 0,8), trägt die Paar-Rate `paarC`: `c = c·g + paarC·(1 − g)`, `g = glatt(0,3; 0,8; Länge der Normale)`. |
| G2.5 Schablone und Sockel beidseitig | Schablonen 1187–1192 (Graben nur auf der abtauchenden Seite), Alter je Seite 1144–1164, Ozean-Boden 1239–1243 | an 98,7 % der konvergenten Grenz-Paare springt die Höhe (Median 2,5 km; gemessen, Befund) | Jede Schablone ist EIN Profil in der vorzeichenbehafteten Distanz ξ quer zur Grenze und wird von beiden Seiten gelesen (die obere Platte liest die Flanke des Grabens mit ξ = −x). Der Sockel (Alters-Tiefe) geht in einer Zone ±100 km um die Grenze stetig auf den Wert des Paars. |

**Annahme als Zahl** (`--richter gesicht`, dazu die bestehenden Teile).

*Pflicht:*

| Messname | Definition | heute | Kopie | Band | Herkunft des Bands |
|---|---|---|---|---|---|
| `klima.kante.flach` | Flachland-Nachbarpaare mit Niederschlags-Verdopplung auf < 100 km | 2,85 % (2,0–9,0; 12 Saaten) | 0,86 % (Feuchte allein) · 1,70 % (mit Lappen 2,0) | Median ≤ 1,0 %, jede Saat ≤ 4 % | gemessen (Spike); erwartet ~0, weil Niederschlags-Kanten dem Relief folgen |
| `klima.sprung20` | Flachland-Paare im Abstand 20 km (Höhen-Unterschied < 200 m), 30 Saaten × 30 Großkreis-Strecken: Betrag des Niederschlags-Unterschieds | an EINER Strecke: Spende p95 90 mm, max 281 mm (Befund Reise) | — | p99 ≤ 40 mm, max ≤ 80 mm | gerechnet: die steilste Stelle des Gürtel-Gesetzes (`guertelP`, 1651–1666) gibt 34 mm je 20 km |
| `relief.messer` | Land-Paare derselben Platte mit Sprung > 0,4 km auf ~1 km, je Million | 1 414 | 1 032 (nur G2.4) | ≤ 200 | erwartet 0; gemessen fällt G2.4 allein nur 27 % |
| `grenze.stufe` | Ozean-Grenz-Paare (beide tiefer als −1 km) mit Sprung > 0,4 km je km, je Rand-Art | konvergent 98,7 % · divergent 20,4 % · Transform 69,8 % | — | konvergent ≤ 10 % · divergent ≤ 5 % | gerechnet: Graben und Rücken haben stetige Flanken. Transform wird berichtet, ohne Band (Bruchzonen tragen echte Stufen; Höhe geschätzt) |
| `innen.streuung` | Höhen-Streuung des Landes > 500 km von der Küste, ohne aktives Orogen | 0,336 km | 0,482–0,496 km | 0,40–0,65 km | geschätzt (Erde 0,4–0,6 km) |
| `innen.altguertel` | Anteil davon mit Gürtel (Orogen-Stärke > 0,1) | 1,1 % | 5,6–7,6 % | 5–25 % | geschätzt (Erde 10–20 %: Ural, Appalachen, Kaledoniden) |
| `innen.schild` | Rang (Schollen-Alter gegen Höhen-Streuung im Kern derselben Scholle) über alle Schollen der 30 Saaten; Gegenlauf mit gespiegeltem Alter | ungemessen (kein Leser im Punkt) | — | Rang ≤ −0,5; im Gegenlauf ≥ +0,5 | R7: Ursache → Folge, mit Gegenlauf |
| `land.median` | Median der Landhöhe | ungemessen | Innen-Mittel 0,84 km | 0,2–0,6 km | Literatur zum Prüfen (Erde ~0,3–0,4 km) |

*Richt-Zahl:* `klima.widerspruch.binnen` — Land binnen 300 km im Lee eines Binnenmeers ≥ 10⁵ km² ist feuchter als dasselbe
Land im Gegenlauf (Drehsinn −1) in ≥ 80 % der Fälle (heute ungemessen; R7).

**Kosten-Deckel für G2:** `planetKlima` auf Land ≤ +12 µs gegen den Kern d660f478 (gemessen im Spike: 64 → 76 µs);
`planetPunkt` ≤ +1 µs (gemessen 10,9 → 11,9 µs für G2.4). G3 holt beides zurück.

**Annahme als Bild.**
1. Paar `bau4/erde-09-zeit+0-biom.png` ↔ `welle2/g2/…`: kein Keil aus einem Punkt, keine gerade Bandkante mitten im
   Kontinent, keine schräge Lineal-Kante an einer Schollen-Naht. Vom Luv-Ufer fällt das Grün stetig landein, hinter jedem
   Kamm steht braunes Lee, und am Ufer eines Binnenmeers steht Grün.
2. Paar `bau4/erde-09-zeit-50-relief.png` ↔ `welle2/g2/…`: der weiße Block (x 990–1115, y 115–175) läuft aus, ohne senkrechte
   Kante; das Plateau bleibt.
3. Paar `bau4/erde-09-zeit+0-relief.png` ↔ `welle2/g2/…`: jede Graben-Linie ist eine Rinne zwischen zwei Flanken, keine Stufe.
   Jeder Kontinent ≥ 10⁷ km² zeigt mindestens einen alten Gürtel (breit, niedrig, ≥ 1 000 km lang) und ein Becken, und zwei
   Kontinente unterscheiden sich im Charakter ihres Inneren.
4. Die Ausschnitte des Befunds neu geschossen: `faecher-erde09-feuchte.png` und `kante-erde09-m50-terme.png` ↔ nachher. Die
   senkrechte Kante unten rechts in `faecher-neu-erde09-feuchte.png` (x ≈ 440) darf nicht mehr stehen.

**Was NICHT getan wird (mit Ursache).**
- Keine Feuchte-Tafel und kein Gitter über die Kugel: ENTSCHEID §0 hat beides als zweite Ausführung desselben Gesetzes
  verworfen. Das Integral bleibt je Punkt, seine Kosten hängen an 14 Knoten, nie an der Planetengröße.
- Kein Druckfeld, kein Strömungsfeld, kein CO₂-Kreislauf (ENTSCHEID §7).
- `klima.koeppen` (E 21,8 %), `klima.regenschatten` (45 %) und `klima.gegenlauf` (67 %) werden nicht geeicht. Sie bleiben ROT,
  wenn sie nicht von selbst fallen, und dürfen sich nicht vom Band entfernen.
- Die Meereis-Kante bleibt: sie ist eine Blende über 6 K (1556), kein Gesetz-Fehler.
- Die rote Schraffur der Bogen-Kegel und die Hotspot-Perlenschnur (Karten-Marken, BERICHT Gegner 3) bleiben offen (`bild.marken`).
- Kein dritter Abkling-Term und keine Eichung der Wurzel an echten Gebirgen: 0,15 und 1 500 Ma sind gesetzt.

**Richter, die nicht kippen dürfen — die Gefährdeten beim Namen.** `hoch.anteil` 2,92 % (Band 1–5 %; die Wurzel hebt altes
Land) · `klima.koeppen` E ≤ 21,8 % (mehr Hochland heißt mehr E) · `klima.wueste` (BWh ≥ 7 %; die Feuchte-Kopie senkte BWh am
Pixel-Maß von 9,2 auf 7,4 %) · `klima.widerspruch` (0; die Rekursion ändert „Regen ohne Meer luvwärts“) ·
`klima.regenschatten` ≥ 45 % und `klima.gegenlauf` ≥ 67 % (die Kamm-Schranke liest zwei Schritte weniger) ·
`klima.kuestenseite` 0,33 · `klima.eis` 8,7 % · `gebirge.vorn` und `gebirge.vorn.zeit` (88 % / 84 %; das Gedächtnis steht
höher) · `ozean.facette` (99,33 %; die beidseitige Schablone darf keine neue Facette setzen) · `ozean.alter` 86,1 Ma ·
`zeit.stetig` (106 Sprünge; G2.4 und G2.5 sollten sie senken, nie heben) · `ort.anker` 28/30.

**Folge im Schnitt:** G2.4 (kleinster Eingriff, Kopie liegt vor) → G2.5 → G2.1 + G2.2 → G2.3. Nach jedem Schritt Karte,
Richter, Push.

---

### G3 — Zeit und Kosten, und was die Reise vom Kern braucht

**Das Gesetz in zwei Sätzen.** Nichts im Bild ändert sich schneller als seine Ursache: ein Kegel gehört der Platte seines
Ausbruchs, und jede Linse, die einen Sprung zählt, nennt den Term, der sprang. Eine Scheibe zahlt nur für das, was ihr
Leser liest: der Bezugs-Spiegel ist ein Mittel über 100 Ma und liest ein Viertel der Proben, und kein Fach rechnet, dessen
Gewicht 0 ist.

**Teil Z — die Zeit.**

Urteil zum Sprung 0 → +50 Ma (Punkt 6 des Blicks): Die Bewegung reißt nicht. In 5-Ma-Schritten steht die Schritt-IoU im
Nordband gleichmäßig bei 0,83–0,86 (gemessen, Befund), kein Schlüsselbild liegt zwischen −100 und +50 Ma. Was das Auge
sieht, ist der Polar-Kontinent, der in der Rechteck-Karte beim Verlassen des Pols die ganze obere Zeile räumt, und der
Schelf, der mit dem Spiegel schmal wird (+0,336 km bei −35 Ma → −0,239 km bei +50 Ma). Die Land-IoU über 50 Ma ist der
falsche Richter: sie fällt mit jeder Zerklüftung. Der wahre Riss steht woanders und ist ROT: `zeit.stetig`.

| # | Stelle | Was dort steht | Was der Schnitt setzt |
|---|---|---|---|
| G3.1 Kegel und ihre Platte | `kettenBauen` 850–891 (Platte 858–862) | Der Kopf (846–849) sagt „ein Kegel fährt mit der Platte seines Ausbruchs“; der Code hängt alle 24 Stützen an die Platte, die JETZT über dem Hotspot liegt. Kippt sie im Abschnitt, springt die ganze Kette (BERICHT §5). | Je Stütze die Platte zur Ausbruchs-Zeit T_k, aus einer Tafel im Plan-Memo je (Hotspot, k) auf dem absoluten Takt 3,5 Ma. Jede Scheibe liest dieselbe Tafel. |
| G3.2 Die Linse nennt den Täter | `zeit.stetig` in `diag-planet.cjs` 501 | zählt 106 Sprünge, nennt keinen Term | Je gezähltem Sprung die Zerlegung in Schablone · Orogen · Gedächtnis · Kegel · Mantel-Feld · Nachklang · Profil; der Richter druckt die Summe je Term. Jeder Term mit mehr als 5 Sprüngen wird in G3 an seiner Stelle geschnitten, der Rest steht beim Namen. |
| G3.3 Inseln sind keine springenden Küsten | Küsten-Teil von `zeit.stetig` | 739 Küsten-Pixel ohne Partner im ±470-km-Fenster, vermerkt als „Insel taucht auf/ab“ | Der Richter teilt die Zahl nach der Größe des Stücks (≥ 10⁴ km² · darunter) und druckt beide. Das Band der Zeile bleibt, wie es gestellt ist. Zeigt die Teilung, dass nur kleine Inseln ohne Partner sind, wird die Zeile mit diesem Beleg im Bericht neu begründet — offen, vom Koordinator, nie im Lauf. |

**Teil K — die Kosten.**

| # | Stelle | Was dort steht | Was der Schnitt setzt |
|---|---|---|---|
| G3.4 Bezug liest ein Viertel | `hueleProben` 1356–1365 (N 4 096 in 1359), `sigmaSelbst` 1368–1373, `sigmaRef` 1375–1379 | sechs Bezugs-Stützen zu je 4 096 Hüll-Punkten | Die Stützen des Bezugs lesen 1 024 Proben aus eigenem Memo (Schlüssel Zeit + N); der Spiegel der Zeit bleibt bei 4 096. Gemessen: ×0,548, Bezug ±14,6 m. |
| G3.5 Kein Fach mit Gewicht 0 | `planetMeer` 1402–1405 | `A1 = meerFach(f1)` wird gerechnet, auch wenn u = 0 ist | A1 nur bei u > 0. Byte-gleich. Bei t = 0 (die Heimat) fallen ein Satz zu 4 096 und die Stütze +20: 9 216 statt 28 672 Hüll-Punkte (gerechnet ×0,32). |
| G3.6 Ketten nur, wo sie gelesen werden | `scheibeKern` 840 (`kettenBauen`), Leser nur außerhalb der Hülle (1313) | jede der 7 Scheiben eines kalten Sprungs baut Ketten, sechs davon liest niemand | Ketten entstehen beim ersten Leser (Memo). Byte-gleich. Das trägt auch die Tafel aus G3.1. |
| G3.7 Je Punkt nicht schlechter als heute | Punkt 1102–1343, Klima 1670–1785 | G1 + G2 kosten im Spike +24–28 % je Punkt und +19–39 % je Klima-Punkt | Der Macher misst zuerst (`node --cpu-prof`, zwei Bänder der Kruste aus G1.2, Knoten-Kosten aus G2.3) und schneidet am größten Posten. Die Zahl richtet, die Stelle findet das Profil. |

Reserve, nur wenn G3.4–G3.6 das Band nicht tragen: die Bezugs-Stützen im 40-Ma-Takt (4 statt 6 Sätze). Das ändert das Mittel
des Gesetzes K7 und braucht `meer.zeit` GRÜN und ein Bildpaar bei −50 Ma.

**Teil R — was die Reise vom Kern braucht (das, und nur das).** Nach G3 ist der Kern für die Reise-Welle geschlossen: sie
schreibt `planet-core.js` nicht mehr, und der Kern-SHA eines gespeicherten Orts bleibt über die ganze Welle gültig.

| # | Lieferung | Leser in der Reise | Annahme-Zahl |
|---|---|---|---|
| R1 | `planetKarte(S, breitePx, schicht, ziel?, teil?)` rechnet in Streifen weiter (`teil = {zeile0, zeile1, zustand}`), und `planetKarteAusschnitt(S, mitte3, spanneKm, px, schicht, ziel?, teil?)` liest dieselbe Schleife für ein Fenster | Stufe B (Atlas, Zoom) | `bytes.streifen`: SHA in 16-Zeilen-Streifen = SHA am Stück; ein Streifen bei 256 px ≤ 150 ms; der Mittel-Pixel des Ausschnitts hat die Bytes von `planetPunkt` am selben Ort |
| R2 | `planetOrt(…).delta` — jede Größe als Differenz zum Anker bei t = 0: Klima, Regler, Wind, die Spende als Verhältnis, und die 9×9 Leit-Stützen als Differenz Stütze für Stütze (Ziel-Stütze − Anker-Stütze am selben Versatz) | Stufe C (D3 des Befunds; die Leit-Stützen liest `grossform`) | `ort.delta.null`: am Anker ist jedes Feld `Object.is(…, 0)` bzw. das Verhältnis genau 1 und jede der 81 Stützen 0, in 30/30 Saaten |
| R3 | `planetOrtDerZeit(plan, breite, laenge, t0, t1, aus?)` → der Ort desselben Krusten-Materials zur Zeit t1, oder `existiert: false` auf Ozeanboden, den es bei t1 nicht gibt | Stufe C (Zeitreise) | Hin und zurück ≤ 10⁻⁹ rad; Kruste bei t0 ist Kruste bei t1 in 100 % von 30 × 256 Orten |
| R4 | Linse `bytes.version` im Richter: Tafel `VERSION` → SHA der Relief-Karte erde-09, 256 px, t = 0 | Stufe C (D5: der gespeicherte Ort trägt den Kern-SHA) | ein geänderter SHA bei gleicher `VERSION` ist ROT; im Selbsttest gepflanzt |
| R5 | `planetOrt` bricht beim Namen, wenn das Jahr des Körpers (`koerper.jahrTage`) nicht das Jahr des Ort-Gesetzes ist (heute 365,25 gegen 365, Zeile 1974) | Stufe A | im Selbsttest gepflanzt; der Richter baut seinen Plan mit dem Jahr des Ort-Gesetzes |
| R6 | Der Kopf des Kerns nennt keinen Verdrahtungs-Stand mehr („nicht im Manifest“); den Stand sagt allein `ort.leser` im Richter | Stufe A (sie trägt den Kern ins Manifest, ohne seine Bytes zu ändern) | SHA des Kerns vor ↔ nach Stufe A gleich |

**Annahme als Zahl.**

| Messname | Definition | heute | Band | Herkunft des Bands |
|---|---|---|---|---|
| `zeit.stetig` (bau3) | Höhen-Schritt ≤ 1 km je 0,1 Ma; Küsten-Versatz ≤ 150 km je 1 Ma | ROT: 106/240 000, max 8,95 km; 739 ohne Partner | GRÜN, Band unverändert | bestehend (Blatt 05: Hebung ≤ 10 mm/a, Drift ≤ 15 cm/a) |
| `zeit.schritt` | Land-IoU in 5-Ma-Schritten über [−200, +50] Ma: kleinster Schritt ÷ Median der Saat | erde-09 Nordband 0,83 ÷ 0,86 = 0,965 (Befund, eine Saat) | ≥ 0,90 in ≥ 27/30 Saaten | gemessen an einer Saat; die 30 Saaten friert der Macher am Kern d660f478 ein, bevor er schneidet |
| `zeit.sprung.ref` | `planetScheibe` kalt nach der Vorschrift von `sprung()` (527–538), mit der Referenzfahrt normiert, Median von 5 | 314–568 ms, Median 408 ms (§0.3) | ≤ 250 ms | Auftrag |
| `zeit.sprung` (bau3) | kalt ≤ 120 ms, warm ≤ 5 ms | ROT: 359 / 470 ms, warm 5,87 ms | Band unverändert; bleibt ROT, wenn 120 ms nicht fallen | bestehend |
| `kosten.punkt.g0` | `planetPunkt` Median, Kern nach G3 ÷ Kern d660f478, ABAB im selben Prozess, 7 Durchgänge | 1,00 | ≤ 1,03 | Auftrag („nicht schlechter“); 3 % ist die Streuung des ABAB |
| `kosten.klima.g0` | `planetKlima` Land, ebenso | 1,00 | ≤ 1,03 | Auftrag |
| `ort.kosten.g0` | `planetOrt` warm, ebenso | 1,00 | ≤ 1,03 | Auftrag |
| `kosten.scheibe` (bau1) | warm ≤ 5 ms | 5,87–5,94 ms, ROT | nicht über dem Wert von heute | bestehend |

Die **Referenzfahrt**: eine feste Rechen-Last aus dem Kern selbst (`planetMathe` + `planetZufall`, ≥ 100 ms je Fahrt), warm
gefahren, bis fünf Fahrten in ±5 % liegen. Sie läuft direkt vor und nach jeder Messung; ein Paar mit mehr als 10 %
Unterschied wird verworfen und wiederholt. Die normierte Zeit ist `t · REF₀ ÷ Mittel(vor, nach)`; REF₀ ist die kleinste von
20 Fahrten am Messplatz, eingefroren im Richter mit Gerät und Datum. Die Lehre der eigenen Probe: eine kurze, kalte
Referenz (15–57 ms) streut stärker als die Messung.

**Annahme als Bild.**
1. Daumenkino erde-09, Relief 800 px, 0 → +50 Ma in 5-Ma-Schritten (11 Bilder), vorher ↔ nachher als zwei Reihen: das Auge
   folgt jeder Küste von Bild zu Bild, und kein Gebirge erscheint oder verschwindet ohne einen Rand, der es erklärt.
2. Dasselbe über das nächste Schlüsselbild hinweg in 2-Ma-Schritten (±10 Ma): keine Kette springt, kein Plateau schaltet.
3. Die Relief-Karte bei 0 Ma vor ↔ nach G3.4 als Differenz-Bild: die Küste bewegt sich um höchstens einen Pixel bei 1 600 px.

**Was NICHT getan wird (mit Ursache).**
- Die Spiegel-Spanne wird nicht gedämpft. `meer.zeit` ist GRÜN (457 m, Band ≤ 600 m); breite Schelfmeere bei −50 Ma sind das
  Gesetz K7. Dass der Erd-Richtwert darunter liegt (0,2–0,3 km, Literatur zum Prüfen), steht als Befund, das Band bleibt.
- `drift.cm_a` (p05 0,65) und `superkontinent` (66 %) werden hier nicht geheilt: beide hängen am Plan der Schlüsselbilder,
  nicht an der Stetigkeit. Sie bleiben ROT beim Namen.
- Die Hülle bekommt keine eigene, billigere Platten-Lesart: ihre Kämme stünden bis 360 km neben dem Relief, und das Klima
  liest sie.
- Der Bezug liest nicht 512 Proben: gemessen bewegt das den Land-Anteil um bis zu 2,2 Prozentpunkte.
- Kein Browser, keine GPU, kein Spiel: `planet.bytes.engines` bleibt ungemessen.

**Richter, die nicht kippen dürfen — die Gefährdeten beim Namen.** `zeit.rueckkehr` (SHA gleich über die Reihenfolge; jedes
neue Memo muss ihn halten) · `meer.volumen` 0,90 % (der Spiegel der Zeit bleibt bei 4 096 Proben) · `meer.zeit` · `land.anteil`
und `zeit.statistik` (der Bezug bewegt das Land um bis zu 0,78 Prozentpunkte) · `ort.bereich` (`Object.is(−3)` am Anker) ·
`ort.anker` 28/30 · `vulkan.kette` (Rang 1,000; G3.1 ordnet die Stützen neu zu) · `vulkan.zahl` (ROT, 570,5) · `--bytes` ganz.

**Folge im Schnitt:** G3.5 + G3.6 (byte-gleich, zuerst) → G3.4 → G3.2 → G3.1 und die genannten Terme → G3.7 → R4, R5, R6, R1, R2, R3.

---

## TEIL 2 — DIE REISE (Plan der nächsten Welle; hier wird nichts am Spiel gebaut)

Der Befund Reise trägt. Seine Entscheide D1 (ein Samen, zwei Lesarten: `planet.samen` und die Ort-Saat `samen@ortKey`),
D3 (die Heimat ist der Nullpunkt, jede Ziel-Größe ist Heimat + Δ des Planeten), D4 (der Kern rechnet im Faden, nach dem
ersten Weltbild) und D5 (ein gespeicherter Ort trägt den Kern-SHA und bricht beim Namen, wenn er nicht passt) gelten. Seine
Zeilen am Spiel sind an main 7f778d44c1 nachgelesen. Dieses Blatt setzt dazu vier Dinge.

### Die EINE Quelle des Ort-Gesetzes

**`gelaende-core.js` — ein neuer Export `ortGesetz()`.** Er baut `{ kuehlungKJeM, meerUnterBasisM, regler, klimaHeute }` aus
den eigenen Tafeln: `TEMPERATUR` (1298, `jahrTage` 365 in 1304), `SCHNEE` (1269), `LANDFORM_REGLER` (379), `PEGEL` (1582),
die Tafel der Lage ohne Wirt (2687, `meerUnterBasis` 3). Additiv neben den Exporten 7465 · 7490 · 7505; kein bestehendes
Byte ändert sich.

Ursache: Heute baut der Richter das Ort-Gesetz selbst (`ortGesetzAusGelaende`, `diag-planet.cjs` 382–387), mit einer
abgeleiteten Regel (Kühlung = Sommer ÷ Mitte der Schneegrenze) und mit zwei Jahreslängen in einer Zeile (die Spende mal
365,25, das Jahr der Tafel 365). Der Faden des Spiels müsste es ein zweites Mal bauen. Das wäre der Zwilling, bevor der
erste Leser steht.

Damit gilt für jede Stufe:
- Der Richter und der Planet-Faden lesen `ortGesetz()`. Der Nachbau im Richter fällt im selben Commit.
- Der Körper ist `PLANET_ERDE` mit `jahrTage` aus dem Ort-Gesetz. Stimmt das Jahr nicht, bricht der Kern (R5).
- Der Planet kopiert keine Zahl des Ortes. Er liefert Δ (`planetOrt().delta`, R2). Kein Aufrufer rechnet Δ nach.
- Am Anker ist Δ ≡ 0. Die Heimat bleibt byte-gleich, mit denselben Konstanten, ohne Bedingung im Code.

**Der Kragen aus ENTSCHEID §6 (Schritt 2) ist nicht Teil der nächsten Welle.** Er stellte den Planeten in der Heimat hinter
`if (k !== 0)` in `grossform`, `temperaturFeld`, `SCHNEE` und `wetterAt` — vier zweite Pfade im Gesetz des Ortes, und er
braucht einen wandernden Nullpunkt, den es im Stamm nicht gibt. Ein Ziel der Reise ist ein eigener Platz. Ob die Heimat
später einen Rand zum Planeten bekommt, entscheidet der Schöpfer.

### Was der Kern dafür liefert

Alles steht in G3, Teil R, und nur dort: R4 · R5 · R6 und die Kosten G3.4–G3.6 für Stufe A, R1 für Stufe B, R2 · R3 für
Stufe C. Die Reise-Welle schreibt `planet-core.js` nicht. Braucht sie doch eine Zeile im Kern, ist das ein neuer Kern-Schnitt
mit neuer `VERSION`, kein Beifang.

### Stufe A — „Die Welt kennt ihren Ort“

| | |
|---|---|
| **Was der Spieler sieht** | Nachts kreisen die Sterne um einen Pol, der so hoch steht, wie seine Breite ist (anazh-realm-seed: 48,4° N). Die Ankunft am Mittag ändert sich um kein Pixel. |
| **Leser, beim Namen** | (1) `starField.rotation` (`stamm/dirigent-takt.js` 2202): die Polhöhe kommt aus `anker.breite`, die Hand-Konstante 0,4 rad fällt. (2) Die Ort-Zeile im Kopf des Atlas-Blatts (Breite · Länge · Küste · Klima-Klasse), noch ohne Karte. Bestellt nach `_weltbildSteht` (`stamm/dirigent-ankunft.js` 882). |
| **Dateien** | `cores.manifest.json` (Eintrag `planet`) · `stamm/gelaende-chunks.js` (`FADEN_QUELLE.spaet`, 3378–3382; ein EIGENER Faden in der Rolle „planet“ aus demselben Blob, damit der Boden-Strom nicht 0,3 s steht) · `voxel-worker.js` (Auftrag `planet-anker` neben dem Genesis-Plan, 926) · `gelaende-core.js` (Export `ortGesetz`) · `scripts/diag-planet.cjs` (liest den Export) · `stamm/dirigent-takt.js` · `stamm/dirigent-ankunft.js`. Der Kern: keine Zeile (R6). |
| **Annahme-Zahl** | (1) Ankunft byte-gleich: Bildpaar Mittag 0 Pixel Differenz, Byte-Diff von Höhe und Temperatur 0, Golden-Sätze gleich. (2) Nacht-Bildpaar Uhr 0,0 ↔ 0,02: der Fixpunkt der Stern-Drehung steht in Höhe der Anker-Breite ± 1°, im Norden bei nördlicher Breite. (3) `ort.leser` 0 → 2, beim Namen. (4) Kein Bild im Haupt-Faden über 100 ms; Ankunft kalt vorher ↔ nachher nicht langsamer im Band der Referenzfahrt. (5) Der Faden rechnet Plan + Scheibe(0) + Anker in ≤ 0,35 s CPU. |
| **Preis** | Faden einmal je Boot: heute 0,50–0,62 s (gemessen, Befund Reise, unter Last: Plan 41–58 ms, Scheibe kalt 438–564 ms, Anker 12–17 ms); nach G3 gerechnet 0,20–0,25 s (die Scheibe bei t = 0 rechnet 9 216 statt 28 672 Hüll-Punkte). +142 KB Skript einmal im Faden, nach dem ersten Weltbild. Heap 70 KB. |
| **Größte Gefahr** | Die Stern-Achse aus der Breite steht neben einer Sonne im Zenit (`welt-licht.js` 696–715). Dieser benannte Zwilling wird in A sichtbarer und fällt erst in C. |
| **Sprosse** | Keine (Z8: ein Kern im Manifest ist ein Weg). |

### Stufe B — „Die Karte im Spiel“

| | |
|---|---|
| **Was der Spieler sieht** | Eine Taste öffnet den Atlas: der Planet in Biom-Farben, ein Fadenkreuz „du bist hier“, Zoom bis zum Kontinent. Die Bytes sind die von `diag-planet --karte`. |
| **Leser, beim Namen** | Planet-Faden (Aufträge `karte` und `ausschnitt`, in Streifen nach R1) → die Platte des Fadens (eigener Store; Schlüssel Samen · Zeit · Schicht · Pixel · Kern-SHA) → das Atlas-Blatt, das nur Bytes zeigt → „du bist hier“ aus `planetFlaeche` und `planetBreiteLaenge`. |
| **Dateien** | `voxel-worker.js` (Aufträge) · eine Atlas-Methode im Stamm (Textur, Taste, Fadenkreuz) · `index.html` (Taste). Der Kern: keine Zeile. |
| **Annahme-Zahl** | (1) Erstes Atlas-Bild ≤ 0,3 s nach der Taste, auch 5 s nach der Ankunft; kein Bild im Haupt-Faden über 100 ms. (2) SHA des Atlas-Puffers = SHA der `diag-planet`-Karte gleicher Saat, Zeit und Größe (Faden ↔ node). (3) Lagefehler von „du bist hier“ ≤ 1 Pixel auf jeder Zoomstufe. (4) Der Faden beantwortet einen Auftrag `planet-ort` binnen 150 ms, auch während er eine Karte rechnet. |
| **Tor** | B öffnet erst, wenn G2 im Kern steht: `klima.kante.flach`, `klima.sprung20`, `relief.messer` und `grenze.stufe` im Band. Der Atlas zeigt dem Spieler das Gesicht; mit Fächern und Messer-Kanten zeigt er die Mängel. |
| **Preis** | Faden: 64 → 128 → 256 px in Biom-Farben 100–107 + 256–291 + 1 008–1 129 ms (gemessen, Befund Reise, unter Last), zusammen ≤ 1,5 s nach dem Anker; 512 px etwa 4 s (gerechnet) im Leerlauf. Platte 0,1–1,6 MB je Zeit, Heap ≤ 2 MB. Haupt-Faden: ein Textur-Upload (98 KB bei 256 px). |
| **Größte Gefahr** | Eine zweite Farb-Tafel im Stamm. Der Atlas färbt nie selbst; die Farben sind `biomFarbe` des Kerns (1831–1846). |
| **Sprosse** | Keine allein. B macht `planet.geologie.platten` 1 · 2 und `planet.wetter.klimazonen` 5 richtbar (Bild-Stichprobe im Fenster, R2). Ihr Preis „P im Überflug“ ist ein Flug, kein Atlas. |

### Stufe C — „Die Reise“

| | |
|---|---|
| **Was der Spieler tut** | Er tippt im Atlas auf einen Ort und eine Zeit und steht dort auf Boden, der aus dem Planeten wächst: Land oder Meer wie im Atlas, anderes Klima, anderer Wind, die Sonne seiner Breite. Ein Tipp auf „Heimat“ bringt ihn zurück; das Gebaute steht, wie er es verließ. |
| **Drei Teil-Schritte** | **C1 Pflichtfelder, byte-gleich** (ohne Planeten): `L.klima`, `L.waterLevel` und `L.leit` werden Pflicht der Lage. Die Rückfälle `Number.isFinite(L.waterLevel) ? … : …` brechen beim Namen — es sind SIEBEN Stellen in `gelaende-core.js`, nicht sechs: 520 (`base + 4`) und 1279 · 1309 · 1377 · 1474 · 1519 · 1745. In der Heimat ist `L.leit` die Null-Tafel. **C2 Schlüssel statt Stempel** (ohne Planeten): der Erbgut-Hash wandert aus dem Stempel der Chunk-Platte (`stamm/gelaende-chunks.js` 793–795) in ihren Schlüssel (802–806). Heute leert ein anderer Stempel den GANZEN Speicher (`voxel-worker.js` 753–754), und jede Reise mit anderen Reglern nähme der Heimat den Warm-Start. **C3 die Reise selbst.** |
| **Leser von C3, beim Namen** | Atlas (Wahl) → Planet-Faden (`planetScheibe(t)`, `planetOrt().delta`, `planetOrtDerZeit`) → `_weltBetreten` (`stamm/speicher-laden.js` 1152) ohne Abschied der Seite (`WELT_GRENZE.seite`, `stamm/speicher-welten.js` 3411) → `_gelaende` (Ort-Saat) → `grossform` (`gelaende-core.js` 565: die Leit-Stützen als Versatz; in der Heimat +0) → `temperaturFeld` und `schnee` (Heimat + Δ) → `wetterAt` (`phyto-core.js` 4067: Leitrichtung + Δ) → `_genesisMitte` (`stamm/siedlung-ort.js` 1374: die Landung am Ziel) → `sonnenRichtung` (`welt-licht.js` 696–715: Breite und Jahr) → Sterne (`planet.samen`). |
| **Dateien** | `gelaende-core.js` · `phyto-core.js` · `welt-licht.js` · `stamm/gelaende-chunks.js` · `voxel-worker.js` · `stamm/speicher-laden.js` · `stamm/siedlung-ort.js` · `stamm/bild-himmel.js` · das Atlas-Blatt. Der Kern: keine Zeile. |
| **Annahme-Zahl** | (1) `reise.tuer` zuerst: die Welt-Tür von heute (Tor → `_weltbildSteht`) an beiden Geräten, als Basis. (2) Sprung Atlas-Tipp → ganzes Bild am Boden (≤ 2 % Lücke gegen die Ruhe): ≤ 5 s ohne Ladebild an beiden Geräten. (3) Heimat → Reise → Heimat: Werk-Pixel ≥ 95 % ↔ 0 % ↔ ≥ 95 %; Treffer der Chunk-Platte der Heimat danach ≥ 95 %. (4) Atlas ↔ Ort an 30 Zielen: Land oder Meer am Landepunkt wie im Atlas-Pixel (30/30), die nächste Küste in der Richtung des Atlas (≥ 24/30). (5) An denselben 30 Zielen: Temperatur am Meer = `TEMPERATUR` + Δ (Byte-Ableitung); Jahres-Amplitude gegen Meeres-Abstand Rang ≥ 0,7. (6) Zwei Ziele 20 km auseinander springen nicht weiter, als `klima.sprung20` trägt. (7) Nach C1 und C2: Byte-Diff von Höhe und Temperatur der Heimat 0, Golden-Sätze gleich. |
| **Preis** | Faden: eine neue Zeit ≤ 0,25 s (nach G3), ein neuer Ort derselben Zeit 1–5 ms (gemessen, Befund Reise). Der Rest ist Ankunft: GTX kalt 16,6 s, Zweit-Boot 12,0 s, Radeon etwa 11 s. Welcher Teil davon beim Orts-Wechsel warm bleibt, ist ungemessen. **≤ 5 s hängt an PFLICHT-OFFEN B.** |
| **Größte Gefahr** | Ein Ort-Gesetz am Ziel, absolut aus dem Planeten gelesen, neben `TEMPERATUR` und den Vorgaben der Regler in der Heimat. D3 und der Export `ortGesetz()` schließen das. Die zweite Gefahr ist ein Atlas, der Küste zeigt, und ein Ort, der keine hat: deshalb liest `grossform` die Leit-Stützen, und Zahl (4) richtet es. |
| **Sprosse** | C macht richtbar: `same.kopplung.zeitreise` 4 (Sprung ≤ 5 s) · `planet.wetter.klimazonen` 3 · 4 · 5 (4 braucht die Sonnenbahn) · `planet.geologie.platten` 5 (im Kern ROT an `drift.cm_a`). `same.massstab.sprung` 4 und 5 verlangen ≤ 2 s und ≤ 3 s; die hält C mit ≤ 5 s nicht. Gebucht wird nur im echten Spiel (Z2). |

### Die Reihenfolge

1. **Voraus, am Kern:** G1 → G2 → G3. Danach `npm run check` am Zweig `w28-planet-kern` (bisher nie gelaufen, alle Commits
   tragen `[skip ci]`) und die Landung des Kerns als Datei, ohne Leser.
2. **Gleichzeitig, weil keiner den anderen berührt:** Stufe A · C1 · C2 · die Messung `reise.tuer`. C1 und C2 brauchen den
   Planeten nicht; sie sind Byte-Beweise an der Heimat.
3. **Stufe B**, sobald A steht und das Tor von G2 offen ist.
4. **C3**, sobald B steht. Die Annahme (2) richtet erst, wenn `reise.tuer` gemessen ist; fällt sie über 5 s, steht C3 offen
   an PFLICHT-OFFEN B und wird nicht als gelandet gemeldet.

Dieses Blatt setzt keinen Eintrag in `docs/PFLICHT-OFFEN.md`. Umfang und Ship der Reise entscheidet der Schöpfer.

---

## Ehrlich offen (mit Messnamen)

- `erde.maske`: Die Erd-Spalte von `land.ellipse`, `land.stuecke4`, `land.formzahl`, `land.fern1000`, `meer.binnen`,
  `innen.*` und `land.median` ist geschätzt oder Literatur aus dem Gedächtnis. Sie gehört mit derselben Funktion an einer
  Erd-Maske gerechnet; die Maske ist ein Download und braucht das Wort des Schöpfers.
- `land.stuecke4`, `land.ellipse`, `land.fern1000`: Die beste Kopie (Gruppen + Lappen 1,0 + Becken) steht bei 35,5 · 0,869 · 7,3 %
  gegen die Bänder ≥ 40 · ≤ 0,85 · ≥ 8 %; `land.anteil` (31,2 %) und `land.formzahl` (0,732) stehen im Band. Dass G1 alle
  Pflicht-Zahlen zugleich trifft, ist ungemessen; die zwei Bänder der Kruste (G1.2, G1.3) trägt noch keine Kopie.
- G1.1 ist nur an 12 Saaten und nur bei t = 0 gemessen (größte Gruppe 0,426, Platten 10–19, größte Platte bis 35,0 % — an der
  Kante von `platten.zahl`). `superkontinent`, `drift.cm_a`, `zeit.statistik` und `gebirge.vorn.zeit` sind an der Kopie
  nicht gelaufen: der Richter liest nur den Kern im Baum.
- G1.4, die EINE Küste: Die Form, in der `kont` den Abstand zur Null-Linie des Profils liest, ist ungebaut; gemessen ist nur
  die Lücke (11–19 %).
- G1.5, G2.2, G2.5, G3.1: ungebaut und ohne Kopie. `grenze.bogen`, `innen.schild`, `gebirge.kruemel`, `klima.sprung20`,
  `land.median`, `bogen.inseln`, `zeit.schritt` über 30 Saaten: heute ungemessen.
- G3.7: Ob der Kern nach G1 und G2 je Punkt wieder bei heute landet, ist ungemessen. Gemessen ist nur der Aufschlag der
  Kopien (+24–28 % und +19–39 %).
- `zeit.sprung.ref`: gerechnet reichen G3.4–G3.6 knapp (0,548 × 408 ms = 224 ms vor dem Aufschlag von G1 und G2). REF₀ ist
  nicht eingefroren; meine Referenz streute (15–57 ms).
- Alle Zeiten dieses Blatts stammen von EINEM Laptop unter fremder Last. GTX, Browser und zweite Engine: ungemessen.
- `superkontinent` (66 %), `drift.cm_a` (p05 0,65), `klima.koeppen`, `klima.regenschatten`, `klima.gegenlauf`, `ozean.facette`,
  `vulkan.zahl`, `gebirge.guertel`: ROT am Kopf, von keinem der drei Schnitte als Ziel genommen.
- `bild.marken`: rote Schraffur und Hotspot-Perlenschnur, ungeschnitten.
- `reise.tuer`: die Zeit der Welt-Tür heute, ungemessen. `ort.leit.leser`: die Leit-Stützen haben keinen Leser.
- Der Kern steht in keinem Manifest und hat `npm run check` nie gesehen. Konsum im Spiel: 0 %.
