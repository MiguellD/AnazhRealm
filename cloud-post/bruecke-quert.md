# bruecke-quert — die Brücke quert den Lauf

Zweig `bruecke-quert` (von `origin/main` e71f2721). Auftrag: Vorrang 2 des Koordinators (05:20), das 6b der Vorprüfung
landmarken-geologie-3. Beanspruchte Sprosse: die des Briefs, `karte2.erleben.spieler.wegfindung#1` (ein Weg längs im Bett ist kein
Weg). Karte 2 gebucht 120 von 1 718. Status ZWISCHENSTAND.

## Ursache → Schnitt → Zahl

**Ursache.** Das Brücken-Etikett des Plans v2 (fachwerk-core `ortPlan`, am main fachwerk-core.js:14009: `nasseLaeufe` →
`bruecken.push([wa, wb])`) spannt JEDEN nassen Lauf einer Gasse, auch den längs im Bett. Das Dorf legt seine Gassen blind für das
Wasser: `wasserReich(nH)` ist 0 für Weiler und Dorf (fachwerk-core.js:5733), nur die Trasse der Stadt liest `H.nass`. Läuft eine
Gasse des Exports im Fluss, wird sie Brücke. Am Ufer −102/−845 (Same 7, nH 18) stand so eine Brücke aus acht Jochfeldern Ost–West
im Ost–West-Lauf, Achse 171,2°, je Feld 0,80 m Wasser (gate:werk-im-wasser Z: #1061/#1062 „liegt längs“).

**Das Band (die Profis).** TxDOT Hydraulic Design Manual Kap. 9 (Bridges, Location Selection: die Kreuzung liegt normal zum Strom),
TxDOT Bridge Design Manual LRFD Kap. 3 (Geometric Constraints: Schiefe höchstens 30° ohne Sonder-Zeichnung) → `querGrad` 60°
zwischen Achse und Lauf.

**Schnitt (EIN Ort, der Plan v2; der Fluss wird gelesen, nie geschrieben).**
- gelaende-core.js:2819 — `ortCtx` reicht `flussAt` = das EINE Fluss-Netz (`flussAm`: flowX/flowZ, centerness) an den Plan.
- fachwerk-core.js:5775 — `BRUECKE_GESETZ` trägt `querGrad: 60`, `uferSuchM: 60`, `uferSchrittM: 0,5`.
- fachwerk-core.js:13682 — `amUfer`, zwischen `gelegt` und dem Etikett (fachwerk-core.js:13930). Je nassem Lauf liest sie den Lauf
  über der Sehne Widerlager→Widerlager, die das Deck spannt (`laufAuf`: der Punkt größter centerness je Meter). Schneidet die
  Sehne den Lauf unter 60° (`quert`, fachwerk-core.js:13727), führt der Plan die Gasse am Ufer. Jeder Punkt wird quer zum Fluss auf
  das erste Ufer gerückt, auf dem die Gasse samt halber Breite trocken und frei von jedem Grundriss liegt. Liegt das andere
  Widerlager am anderen Ufer, quert sie NORMAL zum Lauf AM ORT der Kreuzung (`querUeber`, zweimal nachgerichtet). Trägt das Ufer von
  X nicht, quert sie gleich bei X und geht am Ufer von Y. Endet sie im Wasser, endet sie am Ufer, so weit es trägt, sonst an der
  Kante des Wassers. Liegt sie ganz längs im Bett, rückt sie an das nähere Ufer. Das Etikett selbst ist unberührt: es spannt, was
  quert.
- scripts/diag-settlement.cjs:996 — die Linse `brueckeQuertUrteil`, Selbst-Test 14b (in `gate:settlement`): fünf Gassen über
  einem gedachten Fluss (längs · schräg 53° · quer · endend · im Bett). Der Kern ohne Winkel-Wand (`quert` → `return true`) ist ROT
  beim Namen („Gasse 0 Brücke [3, 23] liegt längs: 0.0° zum Lauf (Soll ≥ 60°)“ · „Gasse 1 … 53.1°“ · Gasse 3 7,4° · Gasse 4
  0,0°). Der Kern von main ist ROT („BRUECKE_GESETZ trägt keinen querGrad“, 19 Punkte der Gasse längs im Wasser).

**Schnitt der KLASSE: der Feldweg zwischen zwei Orten** (der zweite Leser von `nasseLaeufe`, fachwerk `wegZwischen` →
`brueckenAmWeg`; Vorprüfung 2). Ursache: der Lauf über dem Raster ging Schritt für Schritt durchs Wasser (je nasser Zelle ×20) und
fand am Rand des Betts die billigste Spur längs; die Glättung (16 Durchgänge ¼ · ½ · ¼) zog Punkte eines Laufs um das Wasser in
das Wasser (−325/−630: fünf Punkte, die Brücke darüber 2,5° zum Lauf).
- fachwerk-core.js:6038 — `wegZwischen(r, A, B, sperren, nass, fluss)`: über das Wasser führt die Brücke, und sie ist gerade.
  Vom trockenen Punkt vor dem Wasser geht der Lauf in EINEM Sprung in der Richtung seines Schritts bis zum ersten trockenen Punkt
  (fachwerk-core.js:6068); jeder nasse Punkt darunter sieht den Lauf unter mindestens `querGrad` (der Lauf am Rand des Betts ohne
  eigenen: der nächste binnen zwei Teilungen). Die Punkte unter der Brücke stehen im Lauf, ihre Sehne ist die, die
  `brueckenAmWeg` spannt und `wegUeberBruecken` fährt.
- fachwerk-core.js:6102 — `glaetten(…, fest, nass)`: die nassen Punkte und ihre Widerlager bleiben, kein Punkt rückt ins Wasser.
- voxel-worker.js:366 — der Ort-Faden (`ort-weg`) reicht den Lauf des EINEN Netzes (`hydroRiverAt`) an `wegZwischen`.
- scripts/diag-settlement.cjs:1065 — die Linse `feldwegQuertUrteil`, Selbst-Test 14c: frei schräg über den Fluss, gezwungen
  (Grundrisse lassen nur zwei Zugänge 80 m versetzt), um einen Teich, trocken. ROT beim Namen: der Kern ohne die gerade Brücke
  („Feldweg gezwungen Brücke [12, 26] liegt längs: 12.5° zum Lauf“), der Kern mit der Glättung ins Wasser („Feldweg Teich
  Brücke [5, 9] liegt längs: 6.7°“ · 3 Punkte im Wasser), der Kern von main („Feldweg Teich liegt mit 3 Punkten im Wasser“).

**Zahl (vorher main e71f2721 → nachher, gleiche Bedingungen).**
- Zensus der Brücken am Ufer −102/−845, nH 18, Saaten 1–62. Gemessen mit dem Welt-Wasser und der Ort-Wahl des Fadens
  (voxel-worker `ortNass`, `ortWahl`); je Brücke der Winkel ihrer Sehne zum Lauf des Netzes:
  **Brücken längs (< 30°) 59 von 584 → 0 von 381** · schräg (30–60°) 221 → 0 · quer (≥ 60°) 176 → 226 · ohne Lauf über der
  Sehne 124 → 151 · Spannen der Länge 0 4 → 4. Die 4 sind dieselben Stellen am main (Saat 28/47/49/59, eine Gasse aus einem
  nassen Punkt); `brueckenFelder` baut für L = 0 kein Feld.
- Das Bild des roten Falls im Spiel (gate:werk-im-wasser `--nur zensus` am Zweig landmarken-geologie-3, wo Z rot war, Ufer 1,
  der Spieler beim Gründen am See wie im vollen Lauf):
  - vorher 14 Jochfelder, davon 8 längs (Achse 171,2°), Z ROT (#1075/#1076 „liegt längs 0,80 m“);
  - nachher 10 Jochfelder: die Querung bei x −106,5 (Achse −92,4°, normal zum Ost–West-Lauf) und die Brücke bei x −73,7 (91,1°,
    unverändert). Z ohne Befund.
  - Am heutigen main wählt die Probe das vierte Ufer (−209/−728; am ersten stehen noch Feld-Glutbrunnen): dort eine Brücke mit
    4 Feldern (54,5°-Achse, nicht längs), main = Kopf.
- Byte-Beweis: die Heimat der Standard-Welt (Genesis 0/0) auf 4 Dezimalen gleich (sha 58d3e81ba983a80e an main und am Kopf).
  157 von 161 Spiral-Orten gleich. Die 4 anderen sind genau die mit Brücken am main (2 · 2 · 3 · 3 → 1 · 0 · 3 · 1).
- Bildpaar (Draufsicht des Plans, Same 7, links main, rechts Kopf; Wasser blau, Gassen grau, Brücken grün ≥ 60° / gelb schräg /
  rot längs / grau „?“ ohne Lauf): `cloud-post/bruecke-quert-bild/ufer-same7-plan.png`. Am main liegen dort drei Brücken schräg
  (57° · 48° · 33°), am Kopf keine: die Gasse, die im Fluss endete, endet am Westufer; die quere 78° · 85° · 66° · 72° · 65°
  bleiben.
- **Der Feldweg.** Zensus an den Läufen der Standard-Welt um das Ufer (x −600…400, z −1100…−600: 41 Mitten je 25 m, je Mitte ein
  Paar Anschlüsse ±35 m quer, um 0 · 30 · 60 · 90 m längs versetzt; 139 Wege, das Raster und das Wasser wie der Ort-Faden):
  **Feldweg-Brücken längs (< 30°) 5 von 148 → 0 von 103** · schräg 33 → 0 · quer 105 → 99 · ohne Lauf 5 → 4 · Wege mit Lauf
  139 → 139. Im Spiel (der echte Ort-Faden, `_nebenAuftrag("ort", {type: "ort-weg"})`, dieselben 38 Paare mit einer Brücke unter
  60° am main): main 5 längs · 33 schräg · 5 quer von 43 → Kopf 0 · 0 · 30 von 32 (2 ohne Lauf).
  Byte-Beweis: 133 von 133 Feldwegen über Land (−1200…−600 / −1400…−900) gleich; die 139 am Fluss weichen ab, jeder lief am
  main durchs Wasser.

## Offen (mit Grund und Messnamen)

- **Das Bild auf dem Gerät.** Hier bootet die Werkbank nicht (swiftshader-GPU-Prozess stirbt beim Start, 0xffffffff, am main
  gleich). Der Messort `ufer` (−118/−838) trägt kein Dorf (`dorfZug: false`). Ein Messort mit dem Dorf am Ufer wäre eine
  Stations-Änderung, nie im Spiel-Zweig. Die Draufsicht ist das Bild des Plans, nicht des Spiels.
- **Die Fahrt auf dem Wegenetz** (`diag-fahr-leben --wegenetz`, fahrzeug.K2) fährt nur auf der Karte; der Feldweg ist hier im
  Ort-Faden gemessen, nicht unter dem Rad.
- **Nasse Läufe ohne Lauf des Netzes über der Sehne** (151, der Rand des Betts jenseits der Krone, See, Meer) spannt das Etikett
  wie bisher.

## Stand (Vorprüfung 2)

Vorprüfung 1 (de39879a, auf main 64fcf12e) trug den Plan v2; der Feldweg war offen, gemessen 5 von 148 längs. Vorprüfung 2 zieht
die KLASSE: beide Leser von `nasseLaeufe` queren.

- **Geschnitten:** der Plan v2 führt eine Gasse, die den Lauf nicht quert, am Ufer (fachwerk-core.js:13682 `amUfer`, die Wand
  fachwerk-core.js:13727 `quert`, das Gesetz fachwerk-core.js:5775 `BRUECKE_GESETZ.querGrad` 60); der Feldweg zwischen zwei Orten
  quert in EINEM geraden Sprung (fachwerk-core.js:6068), die Glättung rückt nichts ins Wasser (fachwerk-core.js:6102); Ort und
  Ort-Faden lesen die Fließrichtung des EINEN Fluss-Netzes (gelaende-core.js:2819 `flussAt`, voxel-worker.js:366), schreiben sie
  nicht. Die Linsen: scripts/diag-settlement.cjs:996 und :1065, Selbst-Test 14b und 14c in `gate:settlement`.
- **Gemessen (vorher → nachher):** Brücken der Gassen längs (< 30°) 59 von 584 → 0 von 381 · schräg 221 → 0 an 62 Saaten am Ufer
  −102/−845 · Brücken des Feldwegs längs 5 von 148 → 0 von 103 · schräg 33 → 0 an 139 Wegen, im Ort-Faden des Spiels 5 · 33 von
  43 → 0 · 0 von 32 · der rote Fall Z an landmarken-geologie-3: 8 Jochfelder längs (171,2°) → 0 · Heimat der Standard-Welt
  byte-gleich (58d3e81ba983a80e), 157 von 161 Spiral-Orten gleich · 133 von 133 Feldwegen über Land gleich.
- **probeUrteil lokal (Kopf 2):** `gate:studio-begehen` GRÜN (198 s) · `gate:werk-im-wasser` GRÜN (154 s; am main wählt die Probe
  das vierte Ufer −209/−728, das erste trägt 4 Bauten; Zensus 136 Werke, keines im Wasser) · `gate:fachwerk-contract` GRÜN (89 s) ·
  `gate:settlement` GRÜN (420 s, Selbst-Test 14b und 14c grün; 589 s Cloud-Zeit, darum nur in der Batterie) · Playtest „Alle
  Invarianten OK“ (118 s) · `check:statik` EXIT 0 (363 s; die Urteil-Zeile über seinem Log liest ROT an einer fremden
  Selbsttest-Zeile ohne „→ ROT“, scripts/diag-blocker-netz.cjs:187 `[H Mutant Objekt-Liste]` — auf main gleich).
- **Probe-Ruf:** `gate:studio-begehen` (Pflicht: der Beitrag fasst fachwerk-core.js an, der Zug-Dienst in koordination, `PROBE_PFLICHT` Haus) ·
  `gate:werk-im-wasser` (die Wand Z, die die Brücke längs nennt) · `gate:fachwerk-contract` (der Haus-Asset-Vertrag des Kerns).
  Kein `bild:` — kein Messort trägt das Dorf am Ufer.
- **Offen:** das Bild auf dem Gerät (kein Messort mit Dorf am Ufer, `ufer` trägt `dorfZug: false`; die Werkbank bootet hier nicht) ·
  die Fahrt auf dem Wegenetz unter dem Rad (`diag-fahr-leben --wegenetz`, nur auf der Karte) · 151 Spannen der Gassen und 4 des
  Feldwegs ohne Lauf des Netzes (See, Rand jenseits der Krone) spannen wie bisher.
- **Kopf:** der Commit, der dieses Blatt trägt (Vorprüfung 2, auf main 64fcf12e); die 40 Zeichen stehen im letzten Stand nach dem
  Wartezimmer.
- **Beanspruchte Sprosse:** `karte2.erleben.spieler.wegfindung#1`.
- Karte 2 gebucht 120 von 1 718. Status ZWISCHENSTAND.
