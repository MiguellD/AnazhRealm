# Spike — der Versuch, das Gesetz zu WIDERLEGEN

Reines Node, kein Spiel: die Proben laden `planet-core.js` (main, `planet-h2-4`, sha256 c4de4d615c78d337) und `gelaende-core.js`.
Die Stufe S5 Wasser gibt es im Kern nicht; ihr Prototyp steht nur hier, in `spike/lib.cjs` (`wasserGitter`, `wasserAt`). Jede
Ausgabe nennt in der ersten Zeile den sha256 und die VERSION des geladenen Kerns. Ein Lauf gibt `spike/<probe>.out.txt` (stdout)
und `spike/<probe>.json` (alle Rohzahlen).

```bash
cd vision/planet/spike && PLANET_KERN=<main>/planet-core.js node --expose-gc a-kosten.cjs erde-01 10000
```

## Soll — festgelegt VOR dem gewerteten Lauf

Die Rauch-Läufe vorher (n ≤ 300, ein bis vier Saaten) prüften nur die Mechanik und werden nicht gewertet. Gewertet wird allein
der Lauf mit den Zahlen dieser Tafel.

| Probe | Lauf | Soll | TRÄGT · TRÄGT BEDINGT · FÄLLT |
|---|---|---|---|
| **a** Kosten je Adresse | `a-kosten.cjs erde-01 10000`, Erd-Körper bei R = 3 186 · 6 371 · 12 742 · 25 484 km; jede Adresse EINZELN gerufen (Höhe S2, Klima+Biom S4/S7, Wasser S5); 500 Adressen zum Aufwärmen; ein ganzer Durchgang wärmt, gewertet wird der zweite | **a1** Median je Adresse (gesamt) bei 4R ÷ R ≤ 1,35, max ÷ min über die vier Radien ≤ 1,35 (das Band des Richters `kosten.radius`, `scripts/diag-planet.cjs:837`). Die Vor-Läufe je (Same, Zeit) — Plan, Scheibe samt Meer, Wasser-Gitter — bei 4R ÷ R ≤ 1,35. Heap nach GC über 10 000 Adressen ≤ +1 MB. **a2** Absolut: Höhe ≤ 8 µs (Band `kosten.punkt`, ENTSCHEID.md §5, BERICHT.md Z. 76), Klima+Biom an Land ≤ 25 µs (ENTSCHEID §5 bau2, BERICHT-2.md Z. 163; das Band gilt für `planetKlima` allein, die Probe zählt das Biom mit), das Lesen des Wassers ≤ 8 µs (nicht teurer als die Höhe), gesamt ≤ 1 ms (Band `ort.kosten`, `diag-planet.cjs:582`) | TRÄGT: a1 und a2. TRÄGT BEDINGT: a1 hält, a2 reißt; die Bedingung ist der Faktor zum Band. FÄLLT: a1 reißt, d. h. die Kosten wachsen mit der Welt |
| **b** Stetigkeit | `b-stetig.cjs erde-01 400`: Paare im Abstand von 20 km, Halbierung bis 1 cm, je 400 Querungen der Klassen Platte · Scholle · Kruste · Wasser-Zelle; Zeit: ±100 a um jedes Schlüsselbild in [−600, 0) Ma an 2 000 Adressen | **b1** an jeder Querung über 1 cm: \|Δh\| ≤ 0,01 m (Hang ≤ 1), über 1 m \|Δh\| ≤ 1 m; \|ΔT\| ≤ 0,001 K; \|ΔP\| ≤ 0,1 mm/a; \|ΔBewuchs\| ≤ 10⁻⁴; \|ΔQ\|/Q ≤ 10⁻³; \|ΔSee\| ≤ 0,01 m. Ein Wechsel der Biom-KLASSE zählt nicht als Sprung (Klasse über stetigen Größen). **b2** Zeit: der Sprung am Schlüsselbild ≤ 2 × derselbe Sprung mitten zwischen zwei Schlüsselbildern (das Schlüsselbild ist kein besonderer Zeitpunkt) | TRÄGT: b1 und b2 an allen Querungen. TRÄGT BEDINGT: die Sprünge sitzen in EINER benannten Klasse (Anteil als Zahl, Wurzel mit Datei:Zeile), die Stufe selbst ist stetig herleitbar. FÄLLT: Sprünge ohne gemeinsame Wurzel |
| **c** Wirklichkeit gegen die Erde | `c-erde.cjs 10`: erde-01 … erde-10, Erd-Körper `PLANET_ERDE`, 40 000 flächentreue Adressen, Wasser-Gitter N_W = 40 000 | **c1** Hypsometrie zweigipflig in ≥ 9/10 (zwei Gipfel, das Tal ≤ 50 % des kleineren), Ozean-Gipfel in [−5,5; −3,5] km, Land-Gipfel in [−0,5; +1,5] km (Erde: −4,5 und +0,1 km, ETOPO1, Amante & Eakins 2009). **c2** Land-Anteil Median in [22; 36] %, jede Saat in [15; 45] % (Erde 29,2 %, ETOPO1). **c3** Gebirge an Platten-Rändern: der Anteil des Landes > 2 km im Umkreis von 500 km um einen konvergenten Rand ≥ 2 × der Anteil des ganzen Landes dort, in jeder Saat. **c4** Wüsten um ±30°: der Gipfel des BW-Anteils je Halbkugel liegt im 10°-Band mit Mitte in [15°; 35°], in ≥ 9/10 (Erde: BW zwischen 15° und 35°, Peel et al. 2007). **c5** Regenschatten: B-Anteil im Lee (lee ≥ 0,3) ≥ 2 × im Luv (lee ≤ 0,05) bei 35–55°, Median. **c6** Flüsse erreichen das Meer: 0 Kreise; der Endsee-Anteil des Landes in [10; 30] % (Erde ≈ 20 %, Wang et al. 2018, Nature Geoscience 11); P/PET der Endsee-Gebiete ≤ 0,8 × der Meer-Gebiete; der Abfluss ins Meer Median in [18 600; 74 600] km³/a (Faktor 2 um 37 288 km³/a, Dai & Trenberth 2002) | TRÄGT: c1–c6. TRÄGT BEDINGT: eine Zeile reißt, die Bedingung als Zahl. FÄLLT: zwei oder mehr Zeilen reißen |
| **d** 100 Samen, 100 Planeten | `d-vielfalt.cjs 100`: welt-001 … welt-100, jeder mit dem Körper, den sein Same wählt; Fingerabdruck aus 28 Zahlen (Land, Hypsometrie 14, Land je \|Breite\| 6, Köppen-Hauptklasse 5, Eis, Temperatur/30 K) an 4 000 Adressen | **d1** Maß: euklidischer Abstand der Fingerabdrücke. Rausch-Boden: p99 des Abstands DESSELBEN Samens unter zwei unabhängigen Proben-Sätzen (10 × 5). Jeder nächste Nachbar ≥ 3 × Rausch-Boden: 0 von 100 darunter. **d2** Zurückführbar, im Gegenlauf je Körper-Datum, das nur Klima trägt (neigungRad +0,3, sternFluss ×1,15, tagStunden ×1,7, jahrTage ×1,5, drehsinn ×−1; 10 Samen × 2 000 Adressen): 0 Wechsel von Platte, Scholle, Kruste, Rand und Orogen, die Höhe nach Abzug des Mittels um ≤ 10⁻⁶ m gestreut, das Klima ändert sich (> 0,01) bei jedem Datum. R² des Land-Anteils auf (Wasser, Kruste, Freibord, Schelf, Radius) ≥ 0,5 und der mittleren Temperatur auf (Stern, Neigung, Tag, Radius, g) ≥ 0,5 | TRÄGT: d1 und d2. TRÄGT BEDINGT: d1 hält, ein R² < 0,5 (das Merkmal folgt aus Daten, die der Plan zieht, nicht aus dem Körper; benannt). FÄLLT: ein Paar ist ununterscheidbar oder ein Klima-Datum ändert das Relief |
| **e** Drei Zeiten | `e-zeit.cjs 5`: erde-01 … erde-05 zu 0, −50, −100 Ma, 12 000 Adressen | Drift: Median-Weg der Kontinent-Kruste in [1; 10] cm/a (Erde: 1–10 cm/a, DeMets et al. 2010, MORVEL). Wiedererkennbar: Land bei 0 Ma, das am MITGEFÜHRTEN Ort bei −100 Ma Land ist, ≥ 70 %, und ≥ 20 Punkte mehr als am STEHENDEN Ort, in jeder Saat. Die Treue der Kontinent-Kruste (Kruste reitet mit ihrer Platte) wird genannt, nicht gewertet: sie ist im Bau 100 % | TRÄGT: beide in jeder Saat. TRÄGT BEDINGT: eine Saat reißt (benannt). FÄLLT: die Drift liegt außerhalb [1; 10] cm/a, oder die Kontinente sind nicht wiederzuerkennen |
| **f** Die Naht (Gesetz §5) | `f-naht.cjs 5`: erde-01 … erde-05, Anker `planetAnker(plan, 0, ortGesetz())` | Tag eins ändert sich nicht: am Anker ist jedes Δ von `planetOrt` `Object.is(…, 0)` und jedes Verhältnis 1, in 5/5. Der benannte Unterschied wächst stetig vom Anker: \|ΔT\| ≤ 0,01 K bei r = 10 m | TRÄGT: beides in 5/5. FÄLLT: ein Δ ≠ 0 am Anker |

## Gewertet — 18.11., Kern sha256 c4de4d615c78d337, ein Laptop-Kern ohne GPU

| Probe | Soll | gemessen | Urteil |
|---|---|---|---|
| **a** Kosten | 4R ÷ R ≤ 1,35 · Heap ≤ +1 MB · Höhe ≤ 8 µs · Klima an Land ≤ 25 µs · Wasser ≤ 8 µs · gesamt ≤ 1 ms | gesamt 23,9 µs Median (p95 106 µs) bei R 6 371; 4R ÷ R **1,11**, max ÷ min über vier Radien 1,12; Vor-Läufe bei 4R ÷ R: Plan 0,82, Scheibe 0,73, Wasser-Gitter 0,83; Heap nach GC max **+12 KB**. Höhe **8,02 µs** (Lauf davor 8,1), Klima+Biom an Land **55,3 µs**, Wasser lesen **10,5 µs** | **TRÄGT BEDINGT**: Die Kosten wachsen nicht mit der Welt. Es reißen die Bänder: Klima an Land ×2,21, Wasser ×1,31, Höhe auf der Kante (×1,002) |
| **b** Stetigkeit | an jeder Querung über 1 cm \|Δh\| ≤ 0,01 m, \|ΔT\| ≤ 0,001 K, \|ΔP\| ≤ 0,1 mm/a, \|ΔQ\|/Q ≤ 10⁻³; Schlüsselbild ≤ 2 × Kontrolle | stetig: Wasser-Zelle (\|Δh\| ≤ 2,6 mm), \|ΔQ\|/Q ≤ 2,8·10⁻⁶ an allen 2 000 Querungen, \|ΔSee\| ≤ 1,4·10⁻⁵ m; Zeit 1,05 m am Schlüsselbild gegen 6,15 m Kontrolle (3 Bilder in [−600, 0)); das Klima bei stetiger Höhe an Platte, Scholle, Kruste und Zelle (0 Sprünge, \|ΔP\| ≤ 6·10⁻⁴ mm/a). **Es reißen:** die Höhe an 102/400 Platten-, 223/400 Schollen- und 74/400 Krusten-Querungen (max **5 727 m**, p99 3 581 m) und das Klima an **390/400 Küsten-Querungen** bei stetiger Höhe (\|ΔP\| bis 1 690 mm/a, \|ΔT\| bis 7,0 K) | **TRÄGT BEDINGT**: Alle Sprünge gehören zu EINER Klasse — ein harter Schalter der SEITE, wo §4 das PAAR verlangt. Die Bedingung ist 0 Sprünge an Platten-, Krusten- und Küsten-Querungen (heute 25,5 · 18,5 · 97,5 %). Die Wurzel steht unten |
| **c** Erde | c1–c6 (Tafel oben) | c1 **10/10** zweigipflig (Ozean-Gipfel −4,5 km in 8, −3,5 km in 2; Land-Gipfel +0,5 km in 10) · c2 Land Median **29,9 %** (25,7–35,3) · c3 Median ×2,96, **2/10 unter ×2** (erde-04 ×0,76, erde-07 ×0,83) · c4 BW-Gipfel Nord 25° in 9/10 (15° in 1), Süd −25° in 10/10 · c5 Lee ÷ Luv Median ×7,1 · c6 **0 Kreise**, End-See-Land Median 18,5 % (14,1–34,3; erde-05 34,3 % über 30), P/PET End ÷ Meer 0,50, Abfluss ins Meer Median **34 375 km³/a** | **TRÄGT BEDINGT**: c3 reißt in 2/10. Die Bedingung ist ×2 in 10/10. Die Wurzel steht unten |
| **d** 100 Planeten | jeder nächste Nachbar ≥ 3 × Rausch-Boden (Abdruck aus 4 000 Adressen); Gegenlauf 0 Feld-Wechsel; R² ≥ 0,5 | bei 4 000 Adressen: Boden p99 0,100, **76/100 darunter** (min ÷ Boden 1,21). Bei **40 000** (`d-vielfalt-40000.out.txt`): Boden p99 0,026, **0/100 darunter** (min ÷ Boden 3,25); der Median des nächsten Nachbarn bleibt 0,256 → 0,255, der Boden fällt um √10. Gegenlauf: 0 Wechsel in 5 × 20 000 Adressen, die Höhe nach Abzug des Mittels um ≤ 3,4·10⁻¹¹ m gestreut, das Klima ändert sich um 0,43 (jahrTage) bis 46,6 (sternFluss). R²: Temperatur 0,87, Eis 0,76, Wüste 0,87, **Land 0,46** | **TRÄGT BEDINGT**: Die 100 Planeten sind unterscheidbar, aber erst mit einem Abdruck aus ≥ 40 000 Adressen. Bei 4 000 war es das Rauschen der Probe, nicht die Gleichheit der Planeten. Der Land-Anteil folgt nur zu 46 % aus dem Körper; der Rest kommt aus der Gestalt der Schollen, die `planetPlan` aus demselben Samen zieht. Jeder Unterschied führt also auf den Samen zurück, aber nicht allein auf §2 |
| **e** drei Zeiten | Drift 1–10 cm/a; mitgeführt ≥ 70 % und ≥ 20 Punkte über stehend bei −100 Ma, jede Saat | Drift Median **3,29 cm/a** (2,69–4,88); bei −100 Ma mitgeführt **84,3–98,0 %** und 44,2–63,4 Punkte über stehend; bei −50 Ma 70,7–95,0 % und 30,5–46,2 Punkte. Die Kruste fährt in 5/5 zu 100 % mit (im Bau, nicht gewertet) | **TRÄGT** |
| **f** Naht | Δ am Anker = 0 in 5/5; \|ΔT\| ≤ 0,01 K bei 10 m | Δ = 0 (`Object.is`) in **5/5**; \|ΔT\| bei 10 m **0,00047 K**; der benannte Unterschied wächst: \|ΔT\| max 0,047 K bei 1 km · 0,34 K bei 8 km · 1,83 K bei 64 km · 16,5 K bei 512 km; die Leit-Höhe 0,59 m · 5,5 m · 118 m · 314 m; die Spende ±0,9 % · ±9 % · ±371 % · ±1 031 % | **TRÄGT** |

Kein FÄLLT: Das Gesetz steht. Drei Proben tragen bedingt, und jede Bedingung ist eine Zahl mit benannter Wurzel.

### Die Wurzeln

**b — der Schalter der Seite** (Linse `spike/wurzel-b.cjs`). Sie lädt eine instrumentierte KOPIE des Kerns aus dem
Temp-Verzeichnis; main bleibt byte-gleich. Ausgaben: `wurzel-b-platte.out.txt`, `wurzel-b-kruste.out.txt`. Gemessen wird je Seite
der Querung, welchen Zweig `punktRoh` nimmt.

- **S2, Entscheid ≠ Abstand (39/102 Platten-Sprünge, Median 319 m, max 5 727 m).** Die Platte wählt die Wertung mit dem
  Krusten-Vorrang und der Gruppe gK aus K1 (`planet-core.js:1351–1353`). Den Abstand zur Grenze `mHaupt` misst aber das Feld
  `sc` ohne Vorrang. Wo die Platte wechselt, ist `mHaupt` deshalb auf beiden Seiten verschieden (|Δm| > 1 km bei 60/102 Sprüngen,
  bei den stetigen Querungen 1/298). Die Naht G2.5 (`:1404–1408`) mischt nur bei `mHaupt` < 100 km und nimmt beidseits dasselbe
  `mHaupt` an.
- **S2, Versatz-Treppe (21/102, Median 428 m).** `if (m2 < 0 && !aufKruste) … else mHaupt = Math.max(0, m2)` (`:1390`): Auf
  der Kruste wird die verschobene Grenze auf 0 gedeckelt, jenseits trägt sie den Versatz. Das trifft 17 Sprünge an der
  Krusten-Kante; 14 sind ein Tausch auf nur einer Seite.
- **S2, der K1-Schalter (42/102 übrige mit |Δm| ≤ 1 km, Median 30 m; 65/74 Krusten-Sprünge).** `aufKruste = fK > Q − 0,05`
  (`:1352`) wählt zwei Abstands-Zweige: `:1370` gegenüber `:1371–1373`. Nur jenseits der Kruste setzt er `RX.j`, das `raender`
  liest (`:1255`). Alle 74 Krusten-Sprünge liegen dort, wo `aufKruste` kippt; 214/223 Schollen-Sprünge liegen an derselben Kante
  ozean|hang. Diese wurden nicht einzeln durch die Linse geführt. Von den 42 übrigen Platten-Sprüngen kippt bei 24 `aufKruste`;
  18 nennt diese Linse nicht beim Zweig.
- **S4, die Küste (390/400).** `land = hKm > 0` (`:1955`) schaltet die Feuchte-Kette (`:1972`), den Faktor des Niederschlags
  `fak = land ? m·schatten·hub·pF : 1` (`:2058`), die Kontinentalität `cL` (`:2066`) und den Trocken-Zuschlag (`:2070`). Die
  Höhe geht an der Küste stetig durch 0, das Klima nicht.

**c3 — das Hochland abseits des Rands** (`spike/c3-wurzel.cjs`, `c3-wurzel.out.txt`):

| Saat | konvergenter Rand ≤ 500 km | aktives Orogen | erloschenes Orogen | ohne Spur |
|---|---|---|---|---|
| erde-04 | 2 % | 40 % | 50 % | 7 % |
| erde-07 | 2 % | 47 % | 15 % | 26 % |
| erde-01 | 19 % | 44 % | 28 % | 0 % |
| erde-02 | 37 % | 45 % | 2 % | 0 % |

Die Anden-Schablone setzt den Bogen auf `xAnden = Schürze·R + 300 km` (`:1281`), mit einer Schürze von 150–450 km (K3). Das sind
450–750 km hinter der Grenze und damit jenseits des Fensters von c3. Das erloschene Orogen ist das Gedächtnis der Nähte (K4).
„Ohne Spur“ heißt 2,2–2,6 km hoch ohne Rand und ohne Orogen. Als Quellen sind die Becken-Schwelle (`BECKEN_C` = 3 × Freibord,
`:284`) und das Mantel-Feld (`DYN_KM` 2, `:293`) benannt; zerlegt wurde nicht.

**a — der Rest der Kosten:** Das Klima an Land kostet 55,3 µs gegen das Band von 25 µs. BERICHT-2 Z. 163 schreibt den
Aufschlag den 14 Krusten-Feldern der Feuchte-Knoten zu (`planet-core.js:1972–2020`); zerlegt wurde hier nicht. Die Kosten wachsen nicht mit R, wohl aber, wenn
R schrumpft: Die Scheibe kostet bei R/2 1,83 × so viel wie bei 4R, der Plan wiegt dort 75,2 KB (Grenze 96 KB, ENTSCHEID §2).

### Was der Spike NICHT beweist

- S6 Gestein und Boden: ungeprüft, deshalb ohne Bahn.
- Das Wasser lebt nur im Prototyp (`lib.cjs`): Seine Stetigkeit und Kosten sind gemessen, sein Bild im Spiel nicht.
- Alles ist headless gemessen. Ob das Spiel diese Funktion TRÄGT, sagt erst eine Bahn mit Bild.
