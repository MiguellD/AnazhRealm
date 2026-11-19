# WELLE 1 — der Planet im Kern (Zwischenstand 19.11.)

- **Code-Zweig:** `planet-welle-1`, Kopf `3eccc10f9`, geschnitten von main `b7ed8419`.
- **Kern:** `planet-core.js` planet-h2-4 → **planet-h2-10**. Die Relief-SHA von erde-09 ist seit B4 `5c937970…` (Tafel `VERSION_SHA`).
- **Dateien:**
  - `planet-core.js` +635 / −258;
  - `scripts/diag-planet.cjs` +169 / −21;
  - `docs/studio-vertrag.md` +3 / −1, eine Kreuzung außerhalb des Besitzes (unten).
- **Commits:** je Bahn einer, in der Reihenfolge des Auftrags. Der letzte Commit trägt `[ci voll]`.
- **Die Spike-Proben a–f** liefen aus `vision/planet/spike/` gegen `PLANET_KERN=<Zweig>/planet-core.js`. Sie wurden nicht
  kopiert. Der Richter im Code ist `diag-planet.cjs` ohne Argument (`welle1`), dazu `--kosten` und `--selftest`.

**Zwischenstand in drei Sätzen.**

1. Geschnitten:
   - die Kosten-Wurzel (B0);
   - die Naht des Paars samt `BEZUG_MA` (B1);
   - der Anden-Bogen (B4);
   - die Küste ohne Schalter mit EINER PET (B2);
   - S5 Wasser im Kern (B3);
   - der Anker bei fuss 16 (B5);
   - die vier FÄLLT-Setzer des Kerns: e135 und e217, e222, e223.
2. Gemessen: Jede Bahn trifft ihr Soll. Am Kopf stehen welle1 11/11, `--selftest` 60/60 und `--kosten` 10/10 GRÜN; am Kern
   b7ed8419 feuern 15/15 Zeilen.
3. Ehrlich offen:
   - **Die Welle reißt zwei Linsen-Zeilen:**
     - bau1 `schelf.anteil`, main GRÜN 4,25 % → ROT 3,9 % (B1);
     - gesicht `meer.binnen`, 1,5 → 1,4 % (die Kante).
   - **Sie heilt zwei:** gesicht `grenze.stufe` (B1) und bau3 `ort.kosten`.
   - die 12 FÄLLT-Setzer im Stamm und in den anderen Kernen, dazu die drei Zwillinge von e217/e222/e223 in `gelaende-core.js`;
   - Linsen-Zeilen, die schon auf main ROT standen: bau1 6, bau2 3, bau3 5, gesicht 11;
   - Konsum im Spiel 0 — keine Sprosse fällt durch diese Welle;
   - kein CI-Lauf ruft `diag-planet`.

## Je Bahn — Soll · gemessen · Urteil

Das Soll steht in `bahnen.md` und im Auftrag, fest vor dem Lauf. „Vorher“ ist main b7ed8419, wo nicht anders genannt.

| Bahn | Commit | Soll | gemessen (vorher → nachher) | Urteil |
|---|---|---|---|---|
| **B0** Kosten-Wurzel | `a0280521a` | Wurzel beim Namen, geschnitten. `--kosten`: platten ≤ +40 %, radius ≤ 1,35. Kein späterer Schnitt reißt den Preis | Fünf Wurzeln je Punkt waren O(Welt):<br>• `plattenWertung` lief jede Scholle jeder Gruppe;<br>• `krusteFeld` lief jede Scholle;<br>• `punktRoh` lief jede Stütze jeder Kette;<br>• `raender` rechnete die Paar-Bewegung je fernem Rand;<br>• `randAlter` rechnete die Paar-Teile je Rand.<br>Dazu wuchsen S und Memo träge. Schnitt: EIN Würfel-Gitter 6·16² mit genauen Schranken.<br>Punkt 6,02 → 3,87 µs, platten +82 → +34 %, radius 1,382 → 1,310, Höhe (a) 8,0 → 5,3 µs. Bytes gleich 10/10. Preis je Bahn: Tafel unten | **TRÄGT** |
| **B1** Naht dem Paar | `9f8142e77` | b Platte 102 · Scholle 223 · Kruste 74 → 0/400. Höhe ≤ 8 µs. `BEZUG_MA` ohne Leser 1 → 0 | ω_p = Π glatt(ξ), Höhe = Σ ω·H / Σ ω. `aufKruste`, `RX` und der Treppen-Zweig fallen.<br>b-stetig: Platte 102 → **0**, Scholle 223 → **0**, Kruste 74 → **0**. Höhe 8,0 → 6,3 µs. `BEZUG_MA` 1 → **0** (`sigmaRef` liest ihn). Am Kopf `naht.stetig` 0/400 je Klasse, max \|Δh\| 8,8 mm über 1 cm.<br>**Reißt bau1 `schelf.anteil`** 4,25 → 3,90 % (GRÜN → ROT; keine Gegenprobe der Bahn, unten offen) | **TRÄGT** am Soll, mit gerissener Nachbar-Zeile |
| **B4** Anden-Bogen | `eeae417a1` | c3 ≥ ×2 in 10/10 Saaten (heute 8/10). b Platte bleibt 0 | `xAnden` = Schürze·R + 150 km statt + 300 km, EINE Lage je Platte für beide Seiten. c3 8/10 → **10/10**, min ×0,76 → **×2,95** (je Saat 8,99 · 5,14 · 5,12 · 2,95 · 3,87 · 4,21 · 4,18 · 3,17 · 4,80 · 6,75). b Platte, Scholle und Kruste 0/400 | **TRÄGT** |
| **B2** Küste, EINE PET | `8605aae1a` | Küste 390 → 0/400 (\|ΔT\| ≤ 10⁻³ K, \|ΔP\| ≤ 0,1 mm/a). Klima+Biom an Land 55,3 → ≤ 25 µs. PET-Stellen 2 → 1 | EIN Land-Gewicht glatt(−0,2 km; 0; h) statt `land = h > 0`. EINE PET `petMm` = `planetPet` (`planet-core.js:2165`).<br>Küste 400 → **0/400**; am Kopf \|ΔT\| max 3,0·10⁻⁵ K, \|ΔP\| 8,2·10⁻⁴ mm/a. PET 2 → **1**.<br>Kosten Klima+Biom an Land: Befund unten | **TRÄGT** (Kosten mit Befund) |
| **B3** S5 Wasser im Kern | `1474e4d23` | c6 im Soll. Wasser je Adresse 10,5 → ≤ 8 µs. N_W fest 40 000, unabhängig vom Radius. \|ΔQ\|/Q ≤ 10⁻³. PET-Formeln in `lib.cjs` 1 → 0 | `planetWasserGitter` (Priority-Flood, Seen, Überlauf gegen DIE PET) und `planetWasserR`. Das Gitter ist Bit für Bit der Prototyp (Seen 227/227, Endseen 84/84, acc Δ 0 an erde-01). Index CSR-Würfel 2·d, Lauf 203 → 42–61 ms.<br>c6: 0 Kreise, Endsee-Land 18,8 % (10,8–29,7), P/PET 0,48, Abfluss 35 003 km³/a. \|ΔQ\|/Q 9,1·10⁻⁷. Wasser 11,1/12,0 → **1,67/1,75 µs** (a-kosten), am Kopf 0,71 µs (`kosten.wasser.adresse`). Gitter 4R ÷ R ×0,89. `lib.cjs` PET 1 → **0** (`92a85939f`, Zweig zensus-planet) | **TRÄGT** |
| **B5** Anker bei fuss 16 | `cdef708c7` | Meer 1/30 → 0, Wald 0 8/30 → 0, Spende 0 1/30 → 0, E 3/30 → 0. erde-29 abgelehnt 135/200 → 0. `ort.delta.null` 30/30, f 5/5 | `planetAnker` sucht bei fuss 16 und lässt nur Orte zu, die jedes reisende Verhältnis tragen und auf wahrer Höhe kein E sind.<br>e-mess §G/§H, alle **0/30**. erde-29 135 → **0/200**. `ort.delta.null` 30/30, f 5/5, Anker kalt 5,1 ms. Am Kopf `anker.traegt` 0 je Fall. Der Commit-Betreff nennt „vorher“ am Kopf von B3 (1/5/2/4), der Zensus auf main 1/8/1/3 | **TRÄGT** |
| **FÄLLT** im Kern | `9f8142e77`, `a665ae80c` | Die Setzer der Liste in `planet-core.js` fallen | e135 `BEZUG_MA` fiel mit B1. e217, e222 und e223 (`kontinentLambda`, `schichtDicke`, `hartAnteil` in `ortRoh` wildnis, samt ihren `reglerZeile`-Lesern und der Linse `ids` 9 → 6): Setzer im Kern 3 → **0**. Am Kopf `ort.faellt`: wildnis trägt land, hoehe, rauhLambda, trog, ks, tafel. Die übrigen 12 liegen außerhalb: Liste unten | **TRÄGT** für den Kern, 4 von 16 |
| **Proben** im Richter | `7c91dc9e4`, `3eccc10f9` | diag-planet um die Proben erweitert. Je Probe ein Selbsttest, ROT am alten Kern. Der Kopf GRÜN | welle1: 11 Zeilen (B1–B5, FÄLLT).<br>`--kosten`: 3 neue Zeilen (`wasser.adresse`, `wasser.radius`, der G3-Schätzer für platten und radius).<br>`--selftest` lädt b7ed8419 aus git: **15/15 feuern**. Der Betreff von `7c91dc9e4` sagt „13/13“; richtig ist 15/15 (11 welle1 + 2 Wasser + 2 Skala). `--selftest` und `--selbsttest` rufen dieselbe Funktion | **TRÄGT** |

### Befund B2 — Kosten (EIN Satz, auch in `bahnen.md`)

Klima+Biom an Land steht verschränkt (`diag-planet --kosten bau2`, bestes von 5, gleiche Maschine im Wechsel) bei **20,1 · 20,8 µs**
gegen main 44,5 · 49,1 µs, also im Soll ≤ 25. Der Spike-Richter `a-kosten` (Median EINES Durchgangs) liest am Kopf 20,7 · 36,9 ·
20,2 µs. Der mittlere Lauf lag ganz in einer Last-Phase der Maschine: Wasser stand in derselben Fahrt bei 2,50 statt 1,30 µs. Bei
B2 las er 23,6 · 28,0 µs (1 von 2 im Soll). Die Probe a urteilt also über die Last, nicht über den Kern. Das ist dieselbe Klasse wie
das Flackern von `kosten.radius`, das der G3-Schätzer im Richter heilte.

### Der Preis über die Bahnen

`diag-planet --kosten` am Kern jeder Bahn, Schätzer G3 (Median der Durchgangs-Verhältnisse, 21 Durchgänge × 4 000), ein Lauf je Kern,
nacheinander:

| Kern | Commit | `kosten.punkt` Median | `kosten.platten` (≤ +40 %) | `kosten.radius` (≤ 1,35) |
|---|---|---|---|---|
| main | `b7ed8419` | 6,91 µs | **+80 % ROT** | **1,431 ROT** |
| B0 | `a0280521a` | 3,88 µs | +35 % | 1,287 |
| B1 | `9f8142e77` | 4,70 µs | +36 % | 1,301 |
| B4 | `eeae417a1` | 4,71 µs | +37 % | 1,285 |
| B2 | `8605aae1a` | 3,92 µs | +37 % | 1,288 |
| B3 | `1474e4d23` | 4,11 µs | +36 % | 1,305 |
| B5 | `cdef708c7` | 4,09 µs | +35 % | 1,294 |
| FÄLLT = Kopf | `a665ae80c` | 4,72 µs | +35 % | 1,295 |

- **Kein späterer Schnitt riss den Preis.** Die Streuung von `kosten.punkt` (3,9 ↔ 4,7 µs) ist die Last-Phase der Maschine, kein
  Kern-Unterschied: B0 und FÄLLT tragen dieselbe Punkt-Rechnung.
- **Der alte Schätzer (Minimum je Aufbau)** las am selben Kern 1,29 ↔ 1,39, in einer Reihe B0 sogar 1,399. Darum liest der Richter
  seit `7c91dc9e4` den Schätzer G3.
- **Fünf Läufe am Kopf:** radius 1,281–1,319, platten +36/+37 %.

## Die Gegenprobe der Spike-Proben am Kopf

Kern sha256 `3cea70f68e599395`, planet-h2-10, Spike aus `vision/planet/spike/` mit `PLANET_KERN`, 19.11.

| Probe | Soll (`spike.md`) | main 18.11. | Kopf 19.11. | Urteil |
|---|---|---|---|---|
| **a** Kosten | Höhe ≤ 8 · Klima+Biom an Land ≤ 25 · Wasser ≤ 8 µs; 4R ÷ R ≤ 1,35 | 8,02 · 55,3 · 10,5 µs; 1,11 | 5,8 · 20,7/36,9/20,2 · 1,3–2,5 µs; gesamt 4R ÷ R 0,53–1,05 | TRÄGT (Klima: Befund B2) |
| **b** Stetigkeit | 0 Sprünge > 1 cm bzw. 10⁻³ K; Schlüsselbild ≤ 2 × Kontrolle | Platte 102 · Scholle 223 · Kruste 74 · Küste 390 | **0/400 in jeder Klasse**, max \|Δh\| 7,5 mm. Küste \|ΔT\| 2,7·10⁻⁵ K, \|ΔP\| 1,2·10⁻³ mm/a. \|ΔQ\|/Q ≤ 2,8·10⁻⁶. Schlüsselbild 1,05 · 0,67 · 0,81 m gegen Kontrolle 1,60 · 4,20 · 6,07 m | **TRÄGT** |
| **c** Erde | c1–c6 | c3 2/10 unter ×2 | c1 10/10 · c2 30,5 % (25,3–36,0) · c3 **10/10**, min ×2,95 · c4 N 25° 10/10, S −25° 10/10 · c5 ×8,2 · c6 0 Kreise, Endsee 18,8 %, P/PET 0,48, 35 003 km³/a | **TRÄGT** |
| **e** drei Zeiten | Drift 1–10 cm/a; mitgeführt ≥ 70 %, +20 Punkte | 3,29 cm/a; 84,3–98,0 % | 3,29 cm/a (2,69–4,88); bei −100 Ma mitgeführt 74,2–94,9 %, Vorteil ≥ 44,7 Punkte; bei −50 Ma ≥ 30,3 Punkte | **TRÄGT** |
| **f** Naht | Δ = 0 am Anker in 5/5; \|ΔT\| ≤ 0,01 K bei 10 m | 5/5 | **5/5**, \|ΔT\| bei 10 m 0,000 K | **TRÄGT** |

- **e:** Die schwächste Saat, mitgeführt 74,2 % bei −100 Ma, liegt über dem Soll von 70 %. Auf main lag das Minimum bei 84,3 %. Der
  Abfall kam mit B1: der Commit misst „mitgeführt ≥ 74 %“. Seither hält der Wert. Die Wurzel ist nicht zerlegt.
- **d** wurde nicht neu gelaufen: Keine Bahn trägt ein Soll für d.

- **Tag eins byte-gleich:** `node scripts/werkbank.cjs abdruck --gegen b7ed8419`, zwei Läufe am Baum von FÄLLT (genesis · wiese ·
  dorf). Seither ist der Kern byte-gleich.
  - **0 anders:** D1 Gelände, D3 Siedlung, D4 Tiere, D6 Fahrzeug, D7 Licht, D8 Foundry.
  - **Anders, und zwar nur in der Takt-Klasse:**
    - D2 `nahWiese.fern.kacheln…bueschel`: 10/336 im ersten Lauf, 1/336 im zweiten;
    - D5 `wegRestAb`: 1/54 bzw. 2/54;
    - D9 `_satzWerk`: 0/18 bzw. 1/18, er wechselt also zwischen zwei Läufen desselben Vergleichs.
  - **Abdruck A gegen A am selben Baum, ohne jede Kern-Änderung:** D2 `nahWiese` 2/336, D5 `wegRestAb` 2/54, D8 `schwarmKarte` 6.
    Kein Unterschied steht in beiden Läufen außerhalb dieser Klasse.
  - Am Kopf von B3 gegen b7ed8419: 2 anders, beide D5 `wegRestAb`.
- **Am Anker Δ ≡ 0:** f 5/5, `ort.delta.null` 30/30, `ort.landung` 400/400.

## Die Ausgabe-Enden am Kopf (Kern planet-h2-10)

`node scripts/diag-planet.cjs` (Exit 0):

```text
── Richter welle1 · Kern planet-h2-10 · 16 s
GRÜN   naht.stetig            Sprünge |Δh| > 1 cm über 1 cm: Platte 0/400 · Scholle 0/400 · Kruste 0/400 (max 8.8e-3 · 8.8e-3 · 7.1e-3 m; 63922 Paare)   [Schwelle 0 (B1)]
GRÜN   kueste.stetig          Klima-Sprünge an 0/400 Querungen Land ↔ Meer (|ΔT| max 3.0e-5 K · |ΔP| max 8.2e-4 mm/a)   [Schwelle |ΔT| ≤ 10⁻³ K, |ΔP| ≤ 0,1 mm/a auf 1 cm (B2)]
GRÜN   pet.eine               PET-Formel im Kern 1× · planetPet gelesen (Wuchs, Wasser, Richter)   [Schwelle 1×, planetPet (B2)]
GRÜN   anden.bogen            c3 ≥ ×2 in 10/10 Saaten (min ×2.95; je Saat 8.99 · 5.14 · 5.12 · 2.95 · 3.87 · 4.21 · 4.18 · 3.17 · 4.80 · 6.75)   [Schwelle 10/10 (B4)]
GRÜN   wasser.kreise          0 Läufe ohne Meer und Endsee über 10 Saaten · N_W 40000   [Schwelle 0 · N_W = 40 000 (B3)]
GRÜN   wasser.endsee          Endsee-Land Median 18.8 % (10.8 % … 29.7 %)   [Schwelle [10, 30] % (B3)]
GRÜN   wasser.trocken         P/PET Endsee ÷ Meer-Zufluss Median 0.48 (PET: planetPet)   [Schwelle ≤ 0,8 (B3)]
GRÜN   wasser.abfluss         Abfluss ins Meer Median 35003 km³/a   [Schwelle [18 600, 74 600] km³/a (B3)]
GRÜN   wasser.stetig          |ΔQ|/Q max 9.1e-7 an 400 Querungen der nächsten Zelle auf 1 cm   [Schwelle ≤ 10⁻³ (B3)]
GRÜN   anker.traegt           von 30 Ankern bei fuss 16 im Meer 0 · Wald 0 0 · Decke 0 0 · Spende 0 0 · Köppen E 0   [Schwelle 0 je Fall (B5)]
GRÜN   ort.faellt             planetOrt trägt keinen der drei Δ ≡ 0 · wildnis land, hoehe, rauhLambda, trog, ks, tafel   [Schwelle keiner (Zensus e217/e222/e223)]
```

`node scripts/diag-planet.cjs --kosten` (Exit 0):

```text
── Kosten
GRÜN   kosten.punkt           Median 4.70 µs, p95 8.41 µs (5 × 40 000, bestes)   [Schwelle ≤ 8 µs, p95 ≤ 20 µs]
GRÜN   kosten.platten         nP 7: 3.82 µs ↔ nP 19: 5.26 µs (+36 %, Median der Paar-Verhältnisse, 21 Durchgänge × 4 000)   [Schwelle ≤ +40 % (nP 9 ↔ 17)]
GRÜN   kosten.radius          5.68 · 4.87 · 4.34 µs (R 1 737 · 6 371 · 12 742), ÷ Erde je Durchgang 1.143 · 0.882, max/min 1.296   [Schwelle ≤ 1,35]
GRÜN   kosten.plan            11.0 ms, 45.0 KB   [Schwelle ≤ 25 ms, ≤ 96 KB]
GRÜN   kosten.abschnitt       8.6 ms (letzter Abschnitt kalt, mit Rand-Gedächtnis über alle Vorgänger)   [Schwelle ≤ 25 ms]
GRÜN   kosten.scheibe         2.25 ms, 4.5 KB warm, 239.1 KB mit allen Zellen   [Schwelle warm ≤ 5 ms, ≤ 64 KB; alle Zellen ≤ 512 KB]
GRÜN   kosten.meer            17.4 ms je Fach (Zusatz-Wasser erzwingt neue Lösung, Proben warm)   [Schwelle ≤ 40 ms]
GRÜN   kosten.karte           1.60 s   [Schwelle ≤ 5 s (1024×512 relief, ein Faden)]
GRÜN   kosten.wasser.adresse  Median 0.71 µs (5 × 20 000, bestes; 0.72 · 0.72 · 0.71 · 0.72 · 0.72)   [Schwelle ≤ 8 µs (B3)]
GRÜN   kosten.wasser.radius   Gitter R 599 ms ↔ 4R 536 ms (×0.89, verschränkt, Minimum von 3; N_W 40000)   [Schwelle 4R ÷ R ≤ 1,35 (B3)]
```

`node scripts/diag-planet.cjs --selftest` (Exit 0; 60 Zeilen GRÜN, 0 ROT; das Ende):

```text
GRÜN   ort.faellt feuert      Kern b7ed8419 (planet-h2-4): planetOrt trägt kontinentLambda, schichtDicke, hartAnteil · wildnis land, hoehe, kontinentLambda, rauhLambda, trog, ks, tafel, schichtDicke, hartAnteil
GRÜN   kosten.wasser.adresse feuert Kern b7ed8419 (planet-h2-4): der Kern trägt kein Wasser (planetWasserGitter/planetWasserR fehlen)
GRÜN   kosten.wasser.radius feuert Kern b7ed8419 (planet-h2-4): der Kern trägt kein Wasser (planetWasserGitter/planetWasserR fehlen)
GRÜN   kosten.platten feuert  Kern b7ed8419 (planet-h2-4): nP 7: 5.03 µs ↔ nP 19: 8.79 µs (+73 %, Median der Paar-Verhältnisse, 21 Durchgänge × 4 000)
GRÜN   kosten.radius feuert   Kern b7ed8419 (planet-h2-4): 8.68 · 7.21 · 6.04 µs (R 1 737 · 6 371 · 12 742), ÷ Erde je Durchgang 1.181 · 0.831, max/min 1.420
```

## FÄLLT — die 16 Setzer der Liste (`KURZ.md`)

Gefallen im Kern (4):
- e135 `BEZUG_MA` (B1);
- e217 `kontinentLambda`, e222 `schichtDicke`, e223 `hartAnteil` in `ortRoh` wildnis (FÄLLT).

**Stamm und andere Kerne: noch gesetzt, nicht angefasst** (12, Zeilen am Kopf geprüft, alle Dateien byte-gleich zu main):

| Zensus | Setzer | Datei:Zeile |
|---|---|---|
| a36 | Höhen-Deckel `255 + 12·tanh((h − 255)/12)` | `gelaende-core.js:1883` |
| a88 | `terrainSteepness: 1.0` | `stamm/dirigent-kern.js:282` |
| b4 | Meer-Vorgabe `base + 4` | `gelaende-core.js:520` |
| b5 | `aquiferY` … `: 0` | `stamm/wasser-zellen.js:206` |
| b11 | `level` … `: 0` (außerhalb der Region) | `gelaende-core.js:7756` |
| b12 | `level` … `: 0` | `gelaende-core.js:7697` |
| d4 | Samen-Vorgabe `"anazh-realm-seed"` | `stamm/feld-leben.js:1794` |
| d72 | `nachtSin: -0.15` · `daemmerSin: 0.25` · `lichtPhase` | `tetrapoda-core.js:131` · `:2118` · `:2133` |
| d73 | `chor`-Kurve ab −0,15 | `tetrapoda-core.js:2381` |
| d74 | `sonneMin: 0.05` | `tetrapoda-core.js:2458` |
| d75 | `sonne`-Kurve ab −0,1 | `tetrapoda-core.js:2916` |
| d76 | `nachtAb: 0.05`, `nachtVoll: -0.15` · Leser `glatt(Sc.nachtAb, Sc.nachtVoll, sonne)` | `klang-core.js:492` · `:932` |

**Die Zwillinge von e217/e222/e223 in der Heimat** stehen weiter in `LANDFORM_REGLER`. Das Ort-Gesetz liest sie als Pflicht, der
Faden liest ein fehlendes Δ als Heimat-Wert.

| Größe | Zeile in `LANDFORM_REGLER` | Leser |
|---|---|---|
| `kontinentLambda` | `gelaende-core.js:382` | `:571` |
| `schichtDicke` | `gelaende-core.js:397` | `:1043` |
| `hartAnteil` | `gelaende-core.js:398` | `:1044` |

Sie fallen erst, wenn die Heimat eine Adresse ist (`gesetz.md` §5). Für diesen Boot-Pfad gibt es keinen Richter (`bahnen.md`
„Ohne Bahn“).

## Die Kreuzung außerhalb des Besitzes

`docs/studio-vertrag.md` §9 „Stand der Gesetz-Kerne“, die Planet-Zeile, +3 / −1, Commit `0e01b8c78`.

- **Was:** Die Zeile nennt `planetPet`, `planetWasserGitter` (mit `PLANET_WASSER_N`) und `planetWasserR`.
- **Warum:**
  - Die Statik (`diag-studio-vertrag`, CI puls 1/2) stand seit B2 ROT: Jeder Schlüssel des Namensraums muss in §9 erklärt sein.
  - Ohne die Zeile trägt der Zweig eine rote Statik. Der Ersatz wäre ein unerklärter Export.
- **Was nicht angefasst ist:** kein anderer Kern, kein `stamm/`, kein Studio, keine Datei unter `spec/`. Die Planet-Zeile in
  `cores.manifest.json` ist unverändert: der Namensraum ist derselbe, die Funktionen kommen aus dem Export.

## Ehrlich offen — mit Zahl

| Was | Zahl | Grund |
|---|---|---|
| **bau1 `schelf.anteil` — von der Welle gerissen** | main **GRÜN** 4,25 % → Kopf **ROT** 3,9 % (B1 3,90 %, B4 3,94 %; Schwelle 4–12 %) | Die EINE Linsen-Zeile, die auf main GRÜN stand und am Kopf ROT steht. Benannt im Commit von B1.<br>Täter: der Kollisions-Gürtel in Meerengen. Nach der Klemme ξ ≥ c_p legt K1 den Rand an fremde Kruste, der Gürtel steht dann auf dem Schelf. Nicht der Bogen: B4 hob den Wert nur auf 3,94 %.<br>Kein Soll einer Bahn und keine Gegenprobe in `bahnen.md`, darum lief die Welle weiter. Der Schnitt ist offen |
| bau1, die übrigen Zeilen | main 6 ROT → Kopf 6 ROT, dieselben Zeilen (`--richter bau1`, beide Kerne am 19.11.):<br>• `platten.zahl` 26/30 ↔ 26/30;<br>• `gebirge.guertel` lang 6 → 4 %, auf Kontinent 74 → 70 %;<br>• `gebirge.vorn` 75 → 79 %;<br>• `ozean.facette` 99,11 → 99,36 %;<br>• `vulkan.zahl` 610,5 → 611;<br>• `meer.volumen` 1,29 → 1,27 % | Außerhalb jeder Bahn. `gebirge.guertel` „lang“ fiel um 2 Punkte (B1/B4 verlegen den Gürtel), die anderen Zeilen blieben gleich oder wurden besser |
| bau2 | main 3 ROT → Kopf 3 ROT, dieselben Zeilen:<br>• Köppen E 22,4 → 22,9 %;<br>• Regenschatten 38 → 35 %;<br>• Gegenlauf 66 → 65 % | Außerhalb jeder Bahn: B2 schnitt die Küste, nicht die Klassen. Die drei Zahlen bewegten sich um 0,5 bis 3 Punkte in die falsche Richtung; die Wurzel ist nicht zerlegt |
| bau3 (Zeit) | main 6 ROT → 5 ROT am Kern von B5 (FÄLLT änderte danach nur `ortRoh`): `ort.kosten` jetzt GRÜN, `zeit.stetig` 105 → 60 von 240 000 (max 8,35 → 3,00 km), `zeit.sprung` kalt 99 → 78 ms. ROT bleiben `drift.cm_a`, `zeit.stetig`, `zeit.schritt`, `zeit.sprung`, `zeit.reise` | Die Zeit hat keine Bahn in Welle 1 |
| gesicht | main 12 ROT → Kopf 12 ROT (`--richter gesicht`, beide Kerne am 19.11.), aber nicht dieselben Zeilen.<br>**ROT → GRÜN:** `grenze.stufe`, konvergent 16,6 → 8,1 %, divergent 8,8 → 2,2 %, Transform 10,9 → 3,7 % (die Naht des Paars, B1).<br>**GRÜN → ROT:** `meer.binnen` 1,5 → 1,4 % (Schwelle 1,5–6 %; main lag genau auf der Kante).<br>**Besser, aber ROT:** `relief.messer` 1 346 → 795 je Mio, `kont.kueste` 5,9 → 4,7 %, `klima.kante.flach` 1,72 → 1,62 %.<br>**Schlechter und ROT:** `klima.sprung20` p99 162 → 177 mm, `kont.naht` 35,5 → 39, `land.stuecke4` 33 → 30, `innen.streuung` 0,393 → 0,382 km, `innen.altguertel` 4,6 → 4,0 %, `grenze.bogen` 41,3 → 40,4°.<br>**Gleich:** `innen.schild` −0,25, `land.median` 0,767 km | Die Gestalt des Landes hat keine Bahn. `meer.binnen` ist eine zweite Kanten-Zeile, die die Welle über die Schwelle schob. Die Wurzel ist nicht zerlegt |
| Ozeanboden `gdh1` (`planet-core.js:1318`) | Stufe **0,41 m** an der 20-Ma-Isochrone (zwei Äste: 4,23233 ↔ 4,23274 km) | Keine Probe quert Isochronen: b misst Platte, Scholle, Kruste, Küste, Zelle. Ein Befund, kein Soll |
| Nachklang `punktKern` (`planet-core.js:1392`) | dreht die Adresse mit `PK.platte`, der Platte des Punkts | An einer Platten-Naht drehen beide Seiten verschieden. `naht.stetig` misst bei t = 0, in Zeiten mit Nachklang ist die Naht nicht gemessen |
| Eigene PET in den Richtern des Spikes | `spike/c-erde.cjs:48` und `b-stetig` tragen `400 + 45` | Richter, kein Kern. Der Kern und `lib.cjs` tragen 1 bzw. 0 |
| Der Heim-Anker wandert | anazh-realm-seed: 43,4° 12,1° → −45,5° −107,0° (Küste 289 → 284 km) | Folge von B5 (fuss 16, jede Größe trägt). Tag eins bleibt byte-gleich, denn die Heimat liest den Anker noch nicht als Adresse |
| Konsum im Spiel | 0 | Alle Halte sind headless. Keine Sprosse fällt durch eine Bahn allein (`bahnen.md`) |
| CI am Kopf | Lauf 44450717301 (`3eccc10f9`, `[ci voll]`): kopf, puls 1/2, puls 2/2 und voll 18/18 GRÜN; echt (GPU-Wände) übersprungen. Die Statik stand von B2 bis `7c91dc9e4` ROT (§9, oben) | **Kein CI-Lauf ruft `diag-planet.cjs`** (`.github/` und `package.json`: 0 Treffer). Der Richter welle1 (16 s) und `--selftest` laufen nur von Hand. Die Aufnahme in `check:statik` läge in `package.json`, außerhalb des Besitzes dieser Welle |
