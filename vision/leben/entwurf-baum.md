# Entwurf STAMMBAUM ZUERST — die EINE Samen-Entscheidung (main 18058dba, nur gelesen)

**Die Entscheidung:** Jede Art ist ein BLATT eines Baums, den der Same träge als Funktion trägt. Die Topologie kommt aus dem
Aldous-β-Splitting (β = −1), das Alter jedes Knotens aus dem Geburt-Tod-Prozess, Merkmale (ln M, Kost, Statur, Hals, Bein)
wandern als Brown-Bewegung von der Wurzel zum Blatt. Ein Individuum ist ein Blatt plus eigene Abweichung
(Infinitesimal-Erbe aus Mutter und Vater, Umwelt-Rest, Wachstum mit dem Alter). Eine ausgestorbene Art ist ein innerer Knoten,
eine Zeitreise dieselbe Funktion bei anderem t. Gespeichert wird nichts außer dem Bestand (wer heute lebt, je Region).
Es FALLEN sofort: der Größen-Wurf in vier Bändern, die Art als Wahl unter 4 Zeilen und der Alterstod nach 35 min für alle.

Selbst an der Quelle geprüft (main 18058dba): koerper-leib.js:2545–2557 (`_creatureBodySize` = FNV(netId) → Band),
:1022–1041 (`_ofenKreaturDials`, Memo-Key recId|lod|JSON(dials)), kreatur-leben.js:140–153 (netId-Zähler, `setScalar(bs)`),
:1985–1996 (Wurf ohne Eltern), :2401–2423 (Takt, Opfer = `_bestandAeltester`, Alterstod `FAUNA_MAX_AGE_MS`), :2344
(`_bestandKg`), :2372 (`_bestandAeltester`), :1902 (Größe der Blick-Probe = `groessen.at(-1).max`); tetrapoda-core.js:39, :62,
:253–260, :4062–4085 (artGewichte σ² 0,01); kreatur-verhalten.js:590 (`_kreaturGroesseSetzen` klemmt auf die Bänder), :3745
(Wand verlangt `groessen`); netz-p2p.js:1527; kreatur-gehege.js:64; feld-leben.js:2157 und :2252 (`t.g in L.gattung`);
bau-teile.js:1479 (`_rollGenome`, FNV je Achse); daten.js:176; cores.manifest.json (planet-core nur im Faden, tetrapoda im Haupt).

---------------------------------------------------------------------------------------------------------------------------------
## (1) DAS GESETZ

### 1.1 Konstanten (jede mit Anker; „unsicher" heißt: Band der Literatur, Wert gewählt in der Mitte)
```
STAMMBAUM_GESETZ = {
  beta:        -1.0,   // Aldous-β-Splitting; ML-β realer Bäume ≈ −1 (Aldous 1996; Blum & François 2006, Syst. Biol. 55:685)
  epsilon:      0.9,   // Umsatz μ/λ (Band 0,5–0,9, S1; unsicher)
  rJeMa:        0.023, // Netto-Diversifikation r = λ − μ [1/Ma]; folgt aus N(T) unten (Band 0,02–0,2, S1; unsicher)
  wurzelMa:   350,     // Krone der Landwirbeltiere [Ma] (Benton 2009; Kumar et al. 2017 TimeTree) — ERD-Anker, Welle 3: aus dem Planeten
  // => N = 1 + (λ/r)(e^{rT} − 1) ≈ 3,0·10⁴ lebende Arten (Erde ~3,3·10⁴ Tetrapoden, S5) — Folge, kein Stellwert
  sigma2LnM:    0.018, // Brown-Rate von ln M [1/Ma] = Var(ln M) / T: Säuger-Streuung sd(log10 M) ≈ 1,1 (Smith et al. 2003, MOM)
  wandLnM:  Math.log(0.002), // Untergrenze 2 g, reflektierend (Clauset & Erwin 2008, Science 321:399)
  copeJeSpaltung: 0.04,      // Drift von ln M je Artbildung (Cope-Bias ~1,04; Clauset & Erwin 2008; unsicher)
  sigma2Logit:  0.004, // Brown-Rate der Form-Dials (Kost, Statur, Hals, Bein) auf der Logit-Skala [1/Ma]; Blomberg-K ≈ 1
                       //   (Blomberg et al. 2003); Rate unsicher — kalibriert auf die Spanne ART_SPANNE (tetrapoda-core.js:4061)
  wurzelDials:  Mittel der 4 GATTUNGEN (tetrapoda-core.js:62), // die Ahnin; die 4 Zeilen werden Stützstellen der Form, nie Arten
  sOrt:        60,     // Tetrapoden-Arten je Ort gemäßigter Breite (O4/O5, Größenordnung; unsicher) → Areal-Radius je Blatt
  // ERBE (je Merkmal, Welle 1 nur ln M)
  h2:           0.46,  // Erblichkeit Morphologie (Mousseau & Roff 1987)
  sdLnM:        0.20,  // phänotypische Streuung ln M in der Art = CV ~20 % (Yablokov 1974, E5: 10–30 %; unsicher)
  // LEBENSLAUF (K6, alles ∝ M^¼-artig)
  tMaxA:  [11.6, 0.20],// t_max = 11,6·M^0,20 Jahre (Sacher 1959; Calder 1984; Konstante unsicher)
  reifeA: [0.6, 0.27], // Reife α = 0,6·M^0,27 Jahre (Charnov 1993; Konstante unsicher)
  raffung:  78.6,      // Spiel-s je Lebens-Jahr: DIE eine Design-Konstante; hält das Tempo von heute (64-kg-Tier lebt 35 min,
                       //   daten.js:176: 2100 s / t_max(64 kg) 26,7 a) — benannt, nicht versteckt
}
```

### 1.2 Adress-Schema (reine Funktion, nichts gespeichert)
- **Knoten** = `(lo, n)`: das Intervall der Blatt-Nummern [lo, lo+n) im Baum von N Blättern. Wurzel `(0, N)`.
- **Art (lebend)** = Blatt-Nummer `i ∈ [0, N)`. Art-ID im Spiel: `"a" + i` (statt der Gattung `g`).
- **Ahn / ausgestorbene Art** = innerer Knoten `(lo, n)`; er lebte von `alterMa(lo,n)` bis `alterMa(Elter)`.
- **Individuum** = `{a: Art-ID, id, m: Mutter-ID|null, A: Zuchtwert ln M, E: Umwelt-Rest ln M, alterS}`; `id` bleibt in Welle 1
  `key + "." + seq` (kreatur-leben.js:1990), Welle 2 macht die Region absolut (s. 6).
- **Spaltung** (das β = −1-Gesetz in geschlossener Form): q_n(k) ∝ 1/(k(n−k)) = (1/n)(1/k + 1/(n−k)), k = 1..n−1.
  Ziehen: u₁, u₂ aus `H(same, "stamm", lo, n)`; `k = ceil((n−1)^u₁)`, mit u₂ < ½ gespiegelt `k ← n − k`. O(1) je Knoten.
- **Tiefe**: β = −1 → mittlere Blatt-Tiefe ~ (ln N)²/2 ≈ 50 Schritte bei N = 3·10⁴, ≈ 200 bei 10⁹ (je Schritt 1 FNV);
  die oberen 12 Ebenen sind ein Memo von ≤ 4 096 Knoten (≈ 200 KB), alles darunter wird gerechnet.

### 1.3 Funktionen (alle in `leben-core.js`, Namensraum `__lebenCore`, rein, deterministisch)
```
stammN(same)                         -> N                       // 1 + (λ/r)(e^{rT}−1), gerundet
stammSpalt(same, lo, n)              -> k                       // β = −1, s. o.
stammAlterMa(same, lo, n, elterMa)   -> Ma                      // ln(1+(n−1)·r/λ)/r · e^{0,15·z}, geklemmt auf (0, 0,98·elterMa); Blatt = 0
stammPfad(same, i)                   -> [(lo,n,alterMa)…]       // Wurzel → Blatt, O(Tiefe)
artMerkmale(same, i | (lo,n))        -> {lnM, diet, build, neck, leg, size, alterMa}
    // entlang des Pfads: x_Kind = x_Elter + √(σ²·Δt)·z(H(same,lo,n,"merkmal")); ln M reflektiert an der Wand, +cope je Spaltung;
    // Form-Dials auf Logit-Skala in ihrer Spanne (PARAMS tetrapoda-core.js:302–353); size = 2,4·(M/64 kg)^{1/3} (Wolf-Bezug :62)
mrca(same, i, j)                     -> (lo,n,alterMa)          // letzter gemeinsamer Knoten zweier Pfade
artenAm(same, xKm, zKm, filter)      -> [i…]                    // Raum-Abstieg: jeder Knoten trägt eine Scheibe
    // Mitte(Kind) = Mitte(Elter) + Versatz in der Scheibe R(Elter)−R(Kind); R(n) = R_planet·√(n·sOrt/N) ⇒ Hülle garantiert,
    // an jedem Punkt ~sOrt Blätter; die Abfrage besucht nur Knoten, deren Scheibe den Punkt deckt: O(sOrt·Tiefe)
gussKnoten(same, i, slice)           -> (lo,n)                  // Ahn des Blatts zur Zeit `slice` [Ma]: Arten, die seither erst
    // auseinanderliefen, teilen EINEN Guss (Preis-Gesetz, s. 4)
artenZurZeit(same, tMa, xKm, zKm)    -> [(lo,n)…]               // Knoten mit alterMa ≤ t < alterMa(Elter): die Zeitreise
lebenslauf(lnM)                      -> {tMaxS, reifeS}          // K6 × raffung
individuum(same, i, A, E, alterS)    -> {kg, bs}
    // ln M_adult = artMerkmale.lnM + A + E; Wachstum M(a) = M_adult·(1 − e^{−3a/reife})³ (von Bertalanffy; West et al. 2001);
    // bs = (M(a) / M_guss)^{1/3} mit M_guss = gemessene Masse des Gusses (Volumen × ρ, `_gattungLeib` → je Guss-Knoten)
kindErbe(Amutter, Avater|null, u)    -> A                       // (A_m + A_v)/2 + N(0, h²·sd²/2); ohne Vater A_m; ohne Eltern N(0, h²·sd²)
umweltRest(u)                        -> E                       // N(0, (1−h²)·sd²)
```
z/u kommen aus FNV über (Same, Zweck, Adresse) — dieselbe Familie wie `_rollGenome` (bau-teile.js:1479), nie aus netId oder Zähler.

### 1.4 Was der Spieler sieht
Die Herde hat Kälber, die mit der Zeit wachsen; Erwachsene streuen um ±20 % statt ×4,5, Giganten über 1,9 gibt es nicht mehr.
Neben dem Hirsch steht eine Schwesterart (gleiche Form-Familie, anderer Hals, anderes Bein, andere Masse), weil der Baum am Ort
mehrere Blätter trägt. Ein Fuchs lebt 26 min, ein Bär 48 min, nicht mehr alle 35. Unter Räuberdruck schrumpfen die Hirsche über
Generationen.

---------------------------------------------------------------------------------------------------------------------------------
## (2) DIE EINE QUELLE

**Kern: `leben-core.js` (neu, Namensraum `__lebenCore`, Eintrag in cores.manifest.json, `funktion: true`).** Er gehört keiner
Gattung: Pflanzen (Welle 3) lesen denselben Baum. Er ist kein Zwilling, weil es heute nichts gibt, das Art, Abstammung oder Erbe
rechnet. Die vier Bänder und der Alterstod fallen im selben Commit. planet-core.js scheidet als Wirt aus, weil es nur im Faden
lädt (voxel-worker.js:1155) und die Geburt im Haupt-Faden läuft.

**Leser (jeder mit datei:zeile, alle in Welle 1):**
- `_creatureNaturalBirth` kreatur-leben.js:1985–1996: Art = `artenAm(...)` statt `TETRAPODA_SOUL_MAP[best.soul]`;
  Datensatz `{id, a, g, soul, A, E, m, alterS:0, x, z, v}`; `bs` fällt aus dem Datensatz (wird gelesen, nicht gewürfelt).
- `_kreaturBestand` kreatur-leben.js:2114–2149: die Bilanz läuft über die Arten des Orts (`artenAm`), nicht über `L.gattung`.
- `_bestandKg` kreatur-leben.js:2344: `individuum(...).kg` statt `_gattungLeib(t.g).v × bs³ × ρ`.
- `_bestandTakt` kreatur-leben.js:2412–2422: Opfer des Risses mit Gewicht ∝ M (Beutewert, optimale Nahrungswahl: Stephens &
  Krebs 1986) statt `_bestandAeltester`; Alterstod je Tier bei `alterS > tMaxS(M)` statt `FAUNA_MAX_AGE_MS`.
- `_bestandLeib` kreatur-leben.js:2692 → `spawnCreatureAt` :147–153: `opts.bodySize = individuum(...).bs`, `gussDials =
  artMerkmale(gussKnoten(...))`.
- `_ofenKreaturDials` koerper-leib.js:1022: Basis = `artMerkmale(same, gussKnoten)` für Art-IDs; Memo-Key = Guss-Knoten.
- `_kreaturDiet` koerper-leib.js:2873: liest dieselbe Quelle (der Kost-Zwilling fällt).
- `_kreaturGroesseSetzen` kreatur-verhalten.js:590: klemmt auf `individuum`, nicht auf die Bänder.
- Peer netz-p2p.js:1527: liest `bs` aus dem Sync-Feld des Senders statt `_creatureBodySize(e.id)`.
- Gehege kreatur-gehege.js:64: `individuum(same, art, 0, E(H("g"+id)), alterS)`.
- Stand/Annahme feld-leben.js:2157 und :2252: Prüfung `t.a` als Blatt `< stammN(same)` statt `t.g in L.gattung`.
- Blick-Probe kreatur-leben.js:1902: größtes `bs` der Art = `individuum(..., A = +2σ)`.

**Es FÄLLT beim Namen (im selben Wurf, ohne Flag und ohne Rückfall):**
1. `VERHALTEN.groessen` tetrapoda-core.js:253–260 (vier Bänder) samt der Wand kreatur-verhalten.js:3745–3746.
2. `_creatureBodySize` koerper-leib.js:2545–2557 mit allen vier Rufern (kreatur-leben.js:149 und :1993, kreatur-gehege.js:64,
   netz-p2p.js:1527). Ein Leib ohne Bestand (Boot, DSL, Hof) bekommt Art und Individuum über `_bestandAdoptieren` :2482.
3. `FAUNA_MAX_AGE_MS` daten.js:174–177 und sein Leser kreatur-leben.js:2422.
4. Opfer-Wahl nach Alter: `_bestandAeltester` in Hunger und Riss (kreatur-leben.js:2413, :2416). Der Hungertod nimmt das Tier
   mit der kleinsten Masse relativ zur Reife (das Schwächste), nicht das Älteste.
5. `GATTUNGEN` als ART-Liste (tetrapoda-core.js:62). Die 4 Zeilen bleiben Stützstellen von `artGestalt`
   (:4062–4112) und die Mittelwurzel des Baums. Keine Zeile wird mehr als Art geboren.
6. Die Diag-Leser der Bänder ziehen mit: diag-koerper-stand.cjs:947, diag-kollision-bild.cjs:709, diag-kreatur-leben.cjs:1568,
   diag-profiband.cjs:699.

**Welle 1 bleibt ehrlich ein Zwischenschritt:** Die Verhaltens-Tafeln mit dem String-Schlüssel (fluchtDistanzM :1998,
herde.wurf :289, ETHOGRAMM :2125, LEBENSRAUM :2077, TETRAPODA_SOUL_MAP koerper-leib.js:3484) lesen `g` = die nächste Stützstelle
im Dial-Raum, so wie artGewichte heute (tetrapoda-core.js:4079). Das ist eine benannte Tafel, kein Gesetz. Sie fällt in Welle 2.

---------------------------------------------------------------------------------------------------------------------------------
## (3) DREI FÄLLE

**F1 — Bild: Kälber und Erwachsene mit natürlicher Streuung.** Ort: Spawn-Wiese, die Region mit dem größten Hirsch-Bestand,
Third-Kamera 12 m, Mittag; dieselbe Saat und dieselbe Spielzeit nach 20 min Aufholen.
main: 5–7 gleiche Hirsche, Länge 0,6–2,7 (Giganten möglich). Kopf: Adulte innerhalb ±25 %, ≥ 1 Kalb < 0,6 der Mutterlänge
neben einem Adulten.
Zahl: Längen-Verhältnis max/min der Adulten main bis 4,5 → Kopf ≤ 1,6. CV(bs) der Adulten main ≈ 0,3 → Kopf 0,06–0,08.

**F2 — Bild: Schwesterarten, Verwandtschaft sichtbar.** Ort: zwei Regionen ≥ 2 km auseinander (heute dieselben 4 Gattungen).
Kopf: je Region die Arten aus `artenAm`. Eine Schwesterart des Hirsch-Typs mit MRCA < 5 Ma hat dieselbe Form-Familie und andere
Hals-, Bein- und Masse-Werte; ein Paar mit MRCA > 100 Ma sieht klar fremd aus. Zahl: Dial-Abstand des Schwesterpaars <
Dial-Abstand des fernen Paars, an 30 Saaten ≥ 90 %.

**FALSIFIKATION (widerlegt den Entwurf):** An 30 Saaten, rein am Zahl-Bestand (kein Bild nötig):
(a) Die Regression Kind auf Eltern-Mittel für ln M nach 10 Generationen liegt außerhalb 0,36–0,56 (h² ± 0,1), oder die Mutante
„Erbe aus" (Kind ohne Eltern-A) hat eine Steigung ≠ 0 ± 0,05. Dann trägt das Erbe nicht.
(b) ODER Schwesterarten (MRCA < 5 Ma) unterscheiden sich in ln M im Mittel nicht weniger als zufällige Artpaare. Dann ist der Baum
Dekoration: die Merkmale wandern nicht mit den Ästen.
(c) ODER Colless (normiert) aus 100 Saaten bei N = 10³ fällt aus dem Band zwischen Yule und PDA (Blum & François 2006).
Jede der drei ist ROT am Täter beim Namen (`kindErbe`, `artMerkmale`, `stammSpalt`).

---------------------------------------------------------------------------------------------------------------------------------
## (4) PREIS (aus preis-menge: Guss ~0,9 s im Faden, 2 Vorlagen ≈ 4,8 MB, Tier-Satz ≤ 4 Befehle je Gestalt, Kappe 20 Leiber)

**Die 101. Art:** kostet nichts, solange sie nicht im Bild steht. Sie ist eine Blatt-Nummer: ~50 FNV (≈ 5 µs) für den Pfad, 0 Byte
Speicher. Steht sie im Bild, kostet sie höchstens einen Guss, und auch nur, wenn ihr Guss-Knoten neu ist. Den Guss-Knoten wählt
die Region als Zeitschnitt `slice`: die jüngste Zeit, in der die Arten der Region in ≤ G Linien zerfallen (G = 4 = Preis von
heute). Arten, die erst danach auseinanderliefen, teilen den Guss und unterscheiden sich nur in Skala (Welle 1). Die Zahl der
Güsse hängt also am Schirm (Arten im Blick ÷ Verwandtschaft), nie an N. Eine Region rechnet `artenAm` einmal, das sind
~sOrt·Tiefe ≈ 3 000 FNV ≈ 0,3 ms, gemerkt je Region-Schlüssel. Der Boot-Vorrat (koerper-leib.js:2169–2185) gießt keine
Art-Liste mehr, nur die Guss-Knoten der Heimat-Region. Die Ankunft (Pflicht B) bekommt keinen Guss dazu.
**Das 10 001. Individuum:** ein Bestand-Datensatz mit ~12 Feldern (~120 B, + `a, A, E, m` gegen heute), Geburt O(Eltern der
Region), Riss O(n²) je Region wie heute (kreatur-leben.js:2171). Gezeichnet kostet es im Satz 0 Befehle mehr (`bs` ist die Skala
der Instanz). Die Kappe maxCreatures 20 (dirigent-kern.js:280) bleibt in diesem Winkel stehen (s. 6).
**Was NICHT mehr wächst:** keine Tafel je Art, keine Schleife über alle Arten der Welt (`_kreaturBestand` läuft über die ≈ 6
großen Arten des Orts statt über 4 global feste). **Was wächst:** der Guss je NEUEM Guss-Knoten im Blick, gedeckelt durch G.

---------------------------------------------------------------------------------------------------------------------------------
## (5) WELLEN

### Welle 1 — ein Tag, das Bild ändert sich (4 Bahnen, Dateien exklusiv)

**Bahn K — der Kern.** Dateien: `leben-core.js` (neu), `cores.manifest.json`, der Lade-Ort der Haupt-Faden-Kerne (den Ort, an
dem `__tetrapodaCore` geladen wird, findet die Bahn; nur dort). Schnitt: §1.3 vollständig, plus `--selbsttest`-Block im Kern
(N(T), mittlere Tiefe, Colless an 100 Saaten, Regression Kind auf Eltern am künstlichen Bestand).
Bild: kein eigenes; der Beweis ist `window.__lebenCore.stammN(same)` im laufenden Spiel (Konsole der Blick-Sonde).
Sprossen: trägt erbe#1 und muster#1 mit (Richter-Rechnung). Stopp: Selbsttest grün mit den Zahlen im Commit; Boot-Δ ≤ 5 ms
gemessen; API-Signaturen exakt wie §1.3 (die anderen Bahnen bauen gegen sie).

**Bahn I — Individuum und Leib.** Dateien: `stamm/koerper-leib.js`, `tetrapoda-core.js`, `stamm/netz-p2p.js`,
`stamm/kreatur-gehege.js`, `stamm/kreatur-verhalten.js`. Schnitt: `_creatureBodySize` und `VERHALTEN.groessen` fallen (samt Wand
:3745); `_ofenKreaturDials` liest den Guss-Knoten; der Memo-Key wird `"k"+lo+":"+n|lod`; `_kreaturDiet` geht auf dieselbe Quelle;
Peer liest `bs` aus dem Sync; Gehege über `individuum`; `_kreaturGroesseSetzen` ohne Bänder.
Bildpaar F1 (Ort, Kamera, Zahl s. 3). Sprossen: leben.evolution.erbe#1 (Bild-Hälfte). Stopp: `grep groessen|_creatureBodySize`
im Spielpfad = 0 Treffer; Bildpaar F1 mit max/min ≤ 1,6 unter Adulten.

**Bahn B — Bestand, Erbe, Auslese.** Dateien: `stamm/kreatur-leben.js`, `stamm/daten.js`. Schnitt: Geburt mit Mutter
(Adulte der Art in R mit `alterS ≥ reifeS`, Zug aus dem Strom der Region) und Vater (zweiter Adulter, sonst keiner);
`kindErbe`/`umweltRest`; Art aus `artenAm`; `_bestandKg` aus `individuum`; Riss-Opfer ∝ M, Hunger-Opfer das Schwächste;
Alterstod `tMaxS(M)`; `FAUNA_MAX_AGE_MS` fällt; Blick-Probe :1902.
Bildpaar: Spawn-Wiese, Third, nach Welt-Uhr-Sprung um 10³ Hirsch-Generationen (Aufholen `_bestandSchritt`). Mit Wolf-Bestand ist
das Mittel der Hirsch-Länge kleiner als ohne Wolf (Gegenlauf: Wölfe in der Saat-Region auf 0 gesetzt durch die Akte `aus`).
Zahl: Δ ln M̄ Hirsch mit gegen ohne Räuber, an 30 Saaten, Vorzeichen in ≥ 90 %. Sprossen: leben.evolution.muster#1,
leben.evolution.erbe#1 (Zahl-Hälfte: Regression 0,2–0,8). Stopp: beide Zahlen im Commit; Raffer 10³ Generationen ≤ 60 s Wanduhr
gemessen (gerechnet: ~3·10⁴ Takte × 0,25 ms ≈ 8 s, kreatur-leben.js:3728).

**Bahn S — Stand und Annahme.** Dateien: `stamm/feld-leben.js`, `scripts/lib/abdruck.cjs`, die vier Diag-Leser (§2 Punkt 6).
Schnitt: Stand und p2p tragen `a, A, E, m` und prüfen `a` gegen `stammN`; `bs` reist nicht mehr (wird gelesen); der Abdruck
hasht das Tier über `id`+`a`, nicht über die netId (abdruck.cjs:587, der „A gegen A"-Täter an tier:*).
Bildpaar: Speichern → Neu laden an der Spawn-Wiese; dieselben Tiere mit derselben Größe am selben Anker (main: Größen nach dem
Laden neu gewürfelt, wenn der Leib aus netId kam). Zahl: Größen-Gleichheit vor ↔ nach Laden, n/n. Stopp: Stand-Runde n/n
gleich; `werkbank abdruck --a-gegen-a` an tier:* ohne netId-Täter.

Abgabe je Bahn mit `node scripts/werkbank.cjs abdruck --gegen 18058dba` (außerhalb der eigenen Dateien byte-gleich).

### Welle 2 — die Art ersetzt die Gattung ganz (fünf Zeilen)
1. Die String-Tafeln fallen: Fluchtdistanz, Gruppe, Ethogramm, Lebensraum, Häufigkeit werden Funktionen von (M, Kost, Statur);
   K über Damuth D ∝ M^−0,75 statt kopfJeHa 25 (O1). `g`, TETRAPODA_SOUL_MAP und die Wand :3831 sterben.
2. Die Merkmals-Drift bekommt ein Ziel: OU zu θ(Klima am Ort) über planetOrt (Bergmann/Allen, O2), sonst bleibt sie Brown.
3. Region absolut: der Bestand beginnt bei der Weltzeit 0 statt 1 h vor dem Lesen (kreatur-leben.js:2289), Individuum-ID =
   H(Same, Region, Geburts-Takt, k). Damit ist das Individuum eine Funktion, nicht nur die Art.
4. Guss nach Bedarf am Schirm statt Vorrat; G steigt mit dem Leib-Raum für Tiere aus dem Preis-Winkel (stammbaum#1 braucht ≥ 10
   Körper im Bild).
5. Geschlecht und Dimorphismus (M♂/M♀ aus M, Rensch) als zweites Erbe-Merkmal; das Fell-Gen (Helligkeit) für evolution-planet#2.

### Welle 3 — der Baum trägt alles Leben und die Zeit (fünf Zeilen)
1. Pflanzen: `artPhaenotyp` (phyto-core.js:2431) liest `artMerkmale` einer Pflanzen-Klade (Díaz-Achsen Größe und Blatt-Ökonomie, P1);
   forestNicheWeights und der Streu-Zwilling (vegetation-streu.js:202) fallen.
2. Die Wurzel kommt aus dem Planeten: wurzelMa aus alterMa, μ-Pulse an den 28 Trapps (planet-core.js:615), Vikarianz an den
   Superkontinent-Zyklen. Die Bauplan-Klassen (Land, Wasser, Luft) werden Klade-Merkmale.
3. Ausgestorbene Seitenäste: auf jeder Kante Poisson(∫λ·p₀) gepfropfte Teilbäume, die bis heute aussterben (Nee et al. 1994);
   Fossil und Zeitreise lesen `artenZurZeit`.
4. Baum-Blick: Pfad und MRCA eines angeschauten Tiers (≤ 1 s, eine Funktion).
5. Gamma-Statistik und raten-erbliche Diversifikation (Schlüssel-Innovation) gegen die zu regelmäßigen Knoten-Alter aus §1.3.

---------------------------------------------------------------------------------------------------------------------------------
## (6) EHRLICH — was dieser Winkel NICHT trägt

- **Physik der Art:** Die Merkmale der Arten sind Brown-Drift mit Wand und Cope-Bias, keine Auslese aus der Physik. Warum ein
  Bauplan in diesem Klima, bei dieser Schwere, mit dieser Nahrung trägt, liefert der Winkel GESETZE/NISCHE: θ(Ort), M_max ∝ g^−3,
  Kleiber, Damuth. Ohne ihn ist „Art aus Physik" nur zur Hälfte da (die Statistik stimmt, die Begründung fehlt).
- **Jedes Individuum eigen (Gestalt):** Welle 1 gibt dem Individuum nur Masse, Alter und Erbe als uniforme Skala. Allometrie
  (Kalb mit großem Kopf, Beine ∝ M^0,36, Muster, Narbe) braucht Instanz-Achsen im Tier-Satz (Leib-Raum wie LEIB_RAUM des
  Menschen, koerper-core.js:1659). Das liefert der Winkel PREIS/BAUPLAN; sonst kostet jede Gestalt einen Guss.
- **Menge:** Die Kappe 20 Leiber (dirigent-kern.js:280) und 10⁴ im Schirm sind nicht mein Schnitt.
- **Zu regelmäßiger Baum:** Das Knoten-Alter hängt (bis auf ±15 %) an der Klade-Größe, die Topologie nicht an den Merkmalen.
  Damit fehlen Schlüssel-Innovationen und Radiationen, und die γ-Statistik ist zu glatt (Welle 3, Zeile 5).
- **Erd-Anker:** wurzelMa 350 und sOrt 60 sind Erd-Zahlen, solange der Planet sie nicht liefert (planet-core lädt nur im Faden).
- **Das Individuum ist in Welle 1 noch keine reine Funktion:** Seine ID hängt an `R.seq` und am Start der Region 1 h vor dem
  Lesen. Nur Art, Ahn und Zeitreise sind ab Welle 1 Funktionen.
- **Nicht selbst geprüft:** der Lade-Ort der Haupt-Faden-Kerne (Bahn K findet ihn), ob ein Welt-Uhr-Sprung über 10³ Generationen
  das Aufholen schon trägt, und Bake-ms und MB einer Tier-Vorlage (nur zitiert).
