# Entwurf GENOM ZUERST — die EINE Samen-Entscheidung (main 18058dba, nur gelesen)

**Die Entscheidung:** Jedes Lebewesen trägt EINEN Zuchtwert-Vektor `a` (Gen-Achsen in natürlichen Einheiten, log-skaliert
wo multiplikativ), geboren als reine Funktion (Same, Region, Takt, Eltern): Kind = Eltern-Mittel + Segregation N(0, V_A/2)
+ Mutation N(0, V_M) (Infinitesimal-Modell). Der Phänotyp ist `z = μ_Art + a + e` (e je Individuum aus seiner Kennung,
nie vererbt), und der Leib (Masse, Größe über das Alter, Flucht) liest NUR z. Die Art ist eine Wolke (μ, V_A, V_E) im
Merkmalsraum, keine Zeile. Selektion entsteht, weil die Kräfte, die heute schon töten (Hunger-Tod, Riss, Alter) und gebären,
ihr Opfer und ihre Mutter nach z wählen statt „das Älteste“. Welle 1 setzt das an den vier Gattungen und tötet die
Größen-Bänder ganz; Welle 2 trägt die Achsen auf die GPU (Instanz statt Guss) und auf den Baum; Welle 3 macht μ_Art selbst
zum Knoten eines Stammbaums aus dem Samen.

Selbst an der Quelle geprüft: koerper-leib.js:2545–2556 (Band-Wurf über `_rollGenome`), :1022–1032 (`_ofenKreaturDials`,
Memo-Key :1033), :2469–2478 (`_buildCreatureGroup`, Klon); kreatur-leben.js:140–153 (netId-Größe, `scale.setScalar`),
:1976–1998 (Geburt ohne Eltern), :1904 (`groessen.at(-1).max`), :2165–2185 (`_bestandJagd`), :2344–2378 (`_bestandKg` mit
Cache `t.kg`, `_gattungLeib`, `_bestandAeltester`), :2401–2424 (`_bestandTakt`: Hunger- und Riss-Opfer = Ältestes, globaler
Alterstod :2422), :2692–2697 (`_bestandLeib` → spawnCreatureAt {bodySize}); tetrapoda-core.js:62 (GATTUNGEN), :253–259
(groessen), :839–866 (deriveTierParams), :1959–1963 (Temperament aus kg), :2197–2229 (BESTAND_GESETZ); netz-p2p.js:1487,
:1527; bau-teile.js:1479–1508 (`_rollGenome`, `genomStrom` aus phyto-core); stoff-gang.js:282–287 (`_gangSatzInstanz`:
Matrix je Instanz + Ton-Zeilen); cores.manifest.json (Kern-Liste mit ns).

## (1) DAS GESETZ

### 1.1 Datenstrukturen (Einheit je Feld)

```
ERBE_GESETZ (eingefroren, im Kern):
  achsen: [                                   // Reihenfolge = Byte-Vertrag; eine Achse tritt NUR mit ihrem Leser ein
    { name:"lnM",   einheit:"ln(kg/M̄_Art)", h2:0.46, sdP:0.20, leser:"Masse→bs, Temperament, Beute, Biss, Magen" },
    { name:"scheu", einheit:"ln(m/Flucht̄_Art)", h2:0.30, sdP:0.25, leser:"_kreaturMenschFlucht" },
    // Welle 2: bein (ln L/L̄), hals (logit), statur (logit), hell (logit Albedo); Pflanze: lnH, lnRho, lnLMA, lnSaat, lnBlatt
  ],
  vmJeVE: 1e-3,            // Mutations-Varianz je Generation, Houle, Morikawa & Lynch 1996; Lynch & Walsh 1998 (Spanne 1e-4…1e-2, unsicher)
  lebenExp: 0.20,          // t_max ∝ M^0,20, Calder 1984 / Sacher 1959
  reifeAnteil: 0.20,       // α = 0,20·t_max (Charnov 1993, Invariante α/E; Zahl UNSICHER, als Stellwert markiert)
  geburtAnteil: 0.06,      // m0/M∞ des Neugeborenen (Blueweiss et al. 1978, Exponent ~0,9; Zahl UNSICHER)
  fastenExp: 0.25,         // Fasten-Ausdauer ∝ M^0,25, Lindstedt & Boyce 1985
  refKg: 64, refS: FAUNA_MAX_AGE_MS/1000   // Zeit-Anker der Welt: der Wolf (KAMPF.refKg, tetrapoda-core.js:3959) lebt die
                                           // heutige Spiel-Lebensspanne (daten.js:176) — die Welt-Verdichtung bleibt EIN Anker
}
Art (Wolke):     { id, bauplan:"tetrapod"|"baum", Mbar_kg, fluchtBar_m, VA[k], VE[k] }   // VA = h²·sdP², VE = (1−h²)·sdP²
Tier im Bestand: { id, soul, g, a:[k Float], m:idMutter|null, alterS, x, z, v }           // bs FÄLLT als Feld: bs ist Phänotyp
```
h² aus Mousseau & Roff 1987 (Morphologie ~0,46, Verhalten ~0,30); sdP von lnM 0,20 = Masse-CV 10–30 % je Art
(Yablokov 1974, unsicher); sdP von scheu 0,25 (unsicher, keine Quelle gelesen — als Stellwert markiert, fällt mit Welle 3).

### 1.2 Funktionen (reine Funktionen, Kern ohne THREE)

```
erbeGesetz() → ERBE_GESETZ
gruender(rng, K) → a           // a_i = N(0, VA_i): ein Tier ohne Eltern in der Region zieht aus der Wolke der Art
kind(aM, aV, rng, K) → a       // a_i = (aM_i+aV_i)/2 + N(0, VA_i/2) + N(0, vmJeVE·VE_i)   (Fisher 1918; Bulmer 1971)
umwelt(indId, K) → e           // e_i = N(0, VE_i) aus genomStrom(FNV("erbe-e|"+indId)) — je Individuum fest, nie vererbt
phaenotyp(a, e, K) → z         // z_i = a_i + e_i (relativ zum Art-Mittel)
massInf(z, Mbar) → M∞ kg       // Mbar·exp(z.lnM)
masseZurZeit(M∞, alterS, K)    // von Bertalanffy 1957: M(t) = M∞·(1 − (1−q^{1/3})·e^{−k t})³, q = geburtAnteil,
                               //   k so, dass M(α) = 0,9·M∞ (α = reife(M∞))
lebensdauerS(M∞, K)            // refS·(M∞/refKg)^0,20
reifeS(M∞, K)                  // reifeAnteil·lebensdauerS
fastenAusdauer(M, K)           // (M/refKg)^0,25 (relativ; nur Ordnung zählt)
sprint(beinL_m, bs, g)         // 3,0·√(g·beinL·bs) — DIE Steuer-Zahl, die tetrapoda-core.js:1618ff. schon trägt (gelesen)
normal(rng)                    // Box-Muller über den Takt-Strom; EIN Ruf je Achse und Zug, feste Reihenfolge
```

### 1.3 Adress-Schema (Art · Individuum · Ahn) als Funktion von (Same, Ort, Zeit)

- **Art** Welle 1: `artId = g` (die vier Anker wolf/fox/bear/deer, Mbar = `_gattungLeib(g).v × ρ`, also die Masse des
  gegossenen Templates — das mittlere Tier IST die Vorlage, bs = 1). Welle 3: `artId = g + "/" + pfad` (Ziffernpfad im
  Stammbaum), `art(saat, pfad)` rekursiv: μ_Kind = μ_Elter + Brown-Schritt N(0, σ²·Δt), Δt aus Geburt-Tod-Zeiten
  (λ, μ, S1/S3 im Blatt gesetze-natur). Nichts gespeichert, O(Tiefe) Hashes je Art.
- **Individuum**: `id = key + "." + R.t + "." + j + "." + k` (Region, Takt-Zeit, j-ter Wurf des Takts, k-tes Kind) statt
  `key + "." + ++R.seq` — die Kennung ist (Same, Ort, Zeit), nie ein Zähler. Der Gen-Zug läuft auf dem Strom, der heute schon
  rein ist: `_faunaRng("bestand:"+key+"@"+R.t)` (kreatur-leben.js:2406). Die Umwelt-Streuung e aus `id` (nie aus netId).
- **Ahn**: `m` = id der Mutter im Datensatz; Vater = das reife Tier derselben Gattung mit kleinster Distanz zum Anker der
  Mutter (Gleichstand: frühere Stelle im Verzeichnis). Wurf-Geschwister teilen Mutter und Vater → Korrelation ½·V_A von selbst.
- **Leib-Kennung**: Größe, Peer-Größe und Gehege lesen `a`/`id`, nie `netId` (der Sitzungs-Zähler kreatur-leben.js:140 bleibt
  nur Sync-Schlüssel).

### 1.4 Selektion durch die Kräfte, die heute schon töten und gebären (kreatur-leben.js:2401–2424)

| Kraft | heute (gelesen) | Gesetz |
|---|---|---|
| Hunger-Tod (n > K) | Opfer `_bestandAeltester` :2412–2413 | Opfer = kleinste `fastenAusdauer(M(t))` (Lindstedt & Boyce 1985): Leichte, also Junge und Kleine, zuerst |
| Riss | Opfer = Ältestes unter `beute` :2415 | Opfer = kleinstes `sprint(beinL_g, bs(t), g)` unter `beute` — wen der Jäger einholt |
| Alter | globaler Ältester > 35 min :2421–2422 | jedes Tier mit `alterS > lebensdauerS(M∞)` stirbt |
| Geburt | Gruppe Erwachsener, Größe gewürfelt :1984–1996 | Mutter = reifes Tier (alterS ≥ reifeS(M∞)) des Takt-Stroms; Kinder am Anker der Mutter, Verband `v` der Mutter, Masse m0 = 0,06·M∞ und wachsen; ohne reife Mutter: Gründer aus der Wolke am Kandidaten-Ort (heutiger Pfad) |

Damit ist das Vorzeichen der Evolution ERGEBNIS: Größe kauft Riss-Flucht und Hunger-Ausdauer, kostet Reife-Zeit (spätere
Mutter, Charnov). Kein Term der Tafel nennt eine Richtung.

## (2) DIE EINE QUELLE

**Kern: `erbe-core.js`** (neu, ns `__erbeCore`, Eintrag in cores.manifest.json neben tetrapoda/phyto; kein THREE, nur Zahlen).
Grund für eine eigene Datei: Tier (tetrapoda) UND Pflanze (phyto) lesen dasselbe Gesetz; in einem der beiden Kerne wäre der
andere ein Fremd-Leser. Der Zufall bleibt die EINE Quelle `genomStrom` (phyto-core.js:473) über `_rollGenome` (bau-teile.js:1479).

**Leser (Welle 1), je mit Stelle:**
- kreatur-leben.js:1984–1996 `_creatureNaturalBirth` → `kind`/`gruender` (statt `_creatureBodySize`).
- kreatur-leben.js:2344–2346 `_bestandKg` → `masseZurZeit(massInf(z, Mbar), alterS)` (der Cache `t.kg` fällt; Masse ist Funktion des Alters).
- kreatur-leben.js:2412–2422 `_bestandTakt` → Opferwahl nach `fastenAusdauer`/`sprint`, Alterstod nach `lebensdauerS`.
- kreatur-leben.js:2692–2697 `_bestandLeib` → `spawnCreatureAt(…, {bodySize: bs(t)})`; der gezeichnete Leib bekommt je
  Bestand-Takt `scale.setScalar(bs(t))` (Wachstum sichtbar, 0 Güsse).
- kreatur-leben.js:149 und :1904 (Spawn ohne Bestand / Blick-Kugel-Größe) → Gründer-Zug bzw. `exp(4·sdP)`-Obergrenze aus dem Gesetz.
- kreatur-gehege.js:64 → `gruender` auf dem Strom `"g"+p.id` (dieselben Tiere in jedem Boot bleiben).
- netz-p2p.js:1487/1527 → der Sender schickt `s` (die Skala, 3 Stellen); der Empfänger würfelt nicht mehr.
- feld-leben.js:2185–2196 (`_lebenImStand`) und :2157 (`_feldAktFremd`) → `a`, `m` reisen statt `bs`.
- kreatur-furcht.js:164–182 `_kreaturMenschFlucht` → `fluchtDistanzM[g] × exp(z.scheu)`.
- Temperament/Beute/Biss/Magen/Kadaver lesen schon die EINE Masse (`_bestandKg`, `_leibMasse` × bs³) — kein neuer Leser nötig;
  dass ein Welpe unter 21,5 kg „scheu“ ist (tetrapoda-core.js:1960–1961), folgt von selbst.

**FÄLLT beim Namen (Welle 1, ganz, im selben Zug):**
- tetrapoda-core.js:253–259 `VERHALTEN.groessen` (vier Bänder klein/normal/groß/gigant) — kein Ersatz, keine Restzeile.
- stamm/koerper-leib.js:2545–2556 `_creatureBodySize` (und der Kommentar :3493).
- stamm/kreatur-leben.js:149 (Größe aus netId), :1993 (Größenwurf der Geburt), :1904 (`groessen.at(-1).max`).
- stamm/kreatur-gehege.js:64 (Größe aus Plan-Nummer), stamm/netz-p2p.js:1527 (Peer würfelt aus netId).
- stamm/kreatur-leben.js:2413/:2415 Opferwahl „das Älteste“ (`_bestandAeltester` bleibt nur, wo kein Merkmal urteilt), :2421–2422
  der eine Alterstod für alle Arten (daten.js:176 wird Zeit-Anker `refS`, kein Grenzwert mehr).
- Absenz-Grep am Kopf: `_creatureBodySize|groessen` = 0 Treffer in stamm/ und tetrapoda-core.js.

Kein Zwilling: Es gibt danach EINEN Weg zur Größe (Genom → Phänotyp → bs), keinen Schalter „Erbe aus“ im Spiel; die
Mutante „Erbe aus“ (Richter erbe#1) ist ein Probe-Parameter des Kerns (`kind` mit aM = aV = 0), nie ein Spiel-Flag.

## (3) DREI FÄLLE

**F1 (Bild): die Hirsch-Herde hat Kinder und keine Riesen.** Wiese am Spawn, Werkbank am Messort, Third-Kamera 25 m seitlich
auf eine Herde (deer, Wurf 3–7), gleiche Kamera main ↔ Kopf, nach 20 min Spielzeit (zwei Reife-Spannen).
main: Widerrist streut in Bändern (einzelne ×1,25–2,7-Tiere zwischen normalen, ein „Jungtier“ ohne Mutter).
Kopf: Erwachsene innerhalb ±10 % Widerrist (sdP 0,20 auf lnM → ±6,7 % Länge je σ), dazu Kälber mit 0,4–0,8 Widerrist
dicht an ihrer Mutter. Zahl im Bericht: CV des Widerrists der Erwachsenen aus dem Bild, main ≈ 0,25 → Kopf ≤ 0,08.

**F2 (Bild): kein Gigant-Wolf, und der Welpe jagt nicht.** Wald am Spawn, Rudel im Blick. main: ein Wolf kann bs 2,7
(≈ 1 260 kg, schlägt jede Beute bis ~2 500 kg). Kopf: kein Wolf über M̄·e^{4·0,2} ≈ 142 kg; der Welpe (< 21,5 kg) ist „scheu“,
bleibt bei der Hetze zurück. Zahl: Max-Masse der Wölfe über 30 Saaten (Zahl-Bestand), main ≈ 1 260 kg → Kopf ≤ 150 kg.
Zweite Bild-Zahl: beim Zugehen auf die Herde reißt sie gestaffelt aus (Flucht-Distanzen gestreut, Kalb ↔ Mutter korreliert).

**F3 (Falsifikation): Eltern-Kind-Regression und Züchter-Gleichung.** Zahl-Bestand EINER Region im Zeitraffer, 30 Saaten.
(a) Steigung lnM∞(Kind) auf Eltern-Mittel muss h² = 0,46 treffen (Karten-Band 0,2–0,8); mit `kind(0,0)` (Mutante) ≈ 0.
(b) Je Generation Δz̄ = h²·S ± 20 % (S = Selektions-Differential der Mütter, gemessen am Bestand).
(c) Räuber aus (Wolf-K = 0): z̄(lnM) der Hirsche muss gegen Räuber-an messbar (> 2 SE) wandern.
**Widerlegt ist der Entwurf**, wenn (a) außerhalb 0,2–0,8 liegt, (b) außerhalb ±20 % liegt oder (c) keinen Unterschied
zeigt — dann erreicht die Selektion das Gen nicht, und „Selektion durch die Kräfte, die schon töten“ ist falsch.
Das Vorzeichen in (c) sage ich NICHT voraus (muster#1 verlangt „Größe sinkt“; das ist hier Ergebnis, s. (6)).

## (4) PREIS

Aus dem Blatt preis-menge (Kommentare koerper-leib.js:2152–2153, :1326; kreatur-leben.js:2791–2792, :3730):
- **Das 10 001. Individuum** kostet: 0 Güsse, 0 Befehle (der Phänotyp ist Skala in der Instanz-Matrix — `_gangSatzInstanz`
  stoff-gang.js:282 trägt sie schon; der Nah-Leib ist ein Klon ~1 ms mit `scale`), einen Datensatz (~10 Felder + k Floats,
  ~1 KB im Stand wie heute), je Takt O(1) Altern + bei Geburt 2k Normal-Züge, bei einem Tod O(n) Opferwahl je Region (wie
  heute das Älteste). Es lebt nur in gelesenen Regionen → Kosten ∝ Schirm-Nähe × Änderung, nie ∝ Weltgröße.
- **Die 101. Art** kostet in Welle 1 genau, was heute eine Gattung kostet (2 Vorlagen à ~0,9 s Faden kalt, ~4,8 MB je Vorlage,
  bis 4 Satz-Befehle) — mein Winkel senkt das NICHT. Ab Welle 2/3: Art = Wolke über EINER Bauplan-Vorlage; ihre Abweichung
  vom Bauplan-Mittel reist als Instanz-Achsen (Matrix je Achse, Ton-Zeile je Fell) → die 101. Art kostet 0 Güsse, solange ihr
  gequantelter Bauplan-Schlüssel schon gegossen ist, sonst EINEN Guss nach Bedarf am Schirm. Hochrechnung 10² Arten
  (preis-menge): heute ~960 MB Heap → mit Bauplan-Klassen ∝ Zahl der KLASSEN im Bild, nicht der Arten.
- Was der Entwurf NIE tut: Gen-Werte in den Ofen-Key (`recId|lod|JSON(dials)`, koerper-leib.js:1033) — das wäre ein Guss je
  Individuum.

## (5) WELLEN

### Welle 1 — ein Tag, das Bild ändert sich (vier Bahnen, ausschließlicher Datei-Besitz)

**B1 Kern** — Dateien: `erbe-core.js` (neu), `cores.manifest.json` (der Lade-Pfad der Kerne; ob ein zweiter Loader die
Liste dupliziert, prüft B1 zuerst per Grep). Schnitt: ERBE_GESETZ + §1.2 als reine Funktionen, Selbstprüfung im Kern
(10⁴ Eltern-Kind-Paare → Steigung h² ± 0,02; `kind(0,0)` → Steigung 0 ± 0,02). Bildpaar: keins allein — B1 landet nur im
selben Zug wie B2 (Kern ohne Leser landet nie). Sprossen: trägt erbe#1/#3 für B2/B4. Stopp: Selbstprüfung grün, Signaturen
wie §1.2 eingefroren und an B2/B3 als Karte gegeben, bevor sie schneiden.

**B2 Bestand und Selektion** — Datei: `stamm/kreatur-leben.js` (allein). Schnitt: Geburt aus Mutter+Vater (§1.4), Kennung
(Same, Ort, Zeit) §1.3, `_bestandKg` als Funktion des Alters (Cache fällt), Opfer nach Fasten/Sprint, Alterstod je Individuum,
:149/:1904 aus dem Gesetz, Wachstum des gezeichneten Leibs je Takt. Bildpaar: F1 (Hirsch-Herde, Wiese am Spawn, Third 25 m
seitlich, nach 20 min Spielzeit): Kälber bei der Mutter sichtbar, keine Band-Riesen. Sprossen: leben.evolution.erbe#1,
leben.evolution.erbe#3, leben.evolution.muster#1, leben.tiere.lebenszyklus#2. Stopp: F1-Zahl (CV Widerrist ≤ 0,08,
Kälber ≥ 10 % der Herde) am Kopf; Takt `gate:kreatur-takt` nicht schlechter als main (heute p95 7,36 ms laut Karten-Blatt).

**B3 Hülle: Größe, Peer, Gehege, Stand, Flucht** — Dateien: `stamm/koerper-leib.js`, `tetrapoda-core.js`,
`stamm/kreatur-gehege.js`, `stamm/netz-p2p.js`, `stamm/feld-leben.js`, `stamm/kreatur-furcht.js`. Schnitt: `_creatureBodySize`
und `VERHALTEN.groessen` löschen (Byte-Beweis: der Ofen liest groessen nie — Ofen-Bytes gleich; der VERHALTEN-Fingerabdruck
ändert sich und steht als benannte Änderung im Abdruck), Gehege-Gründer, Peer übernimmt `s` des Senders, Stand trägt `a`/`m`,
Flucht × exp(z.scheu). Bildpaar: F2 (Wald am Spawn, Rudel, Third 25 m; dann Ego-Annäherung an eine Herde): kein Riese,
gestaffeltes Ausreißen. Sprossen: leben.evolution.zivilisation#1. Stopp: Absenz-Grep `_creatureBodySize|groessen` = 0;
Mitspieler sieht dieselbe Größe wie der Sender (zwei Fenster, ein Tier, Skala gleich auf 3 Stellen).

**B4 Messen** — Dateien: `scripts/lib/abdruck.cjs` und die bestehende Zeitraffer-Probe des Bestands (der Kommentar
kreatur-leben.js:2188 nennt „Zeitraffer am main 45c6aa19“; die Datei sucht B4 per Grep — von mir nicht gelesen). Schnitt:
der Abdruck hasht das Tier über `id` + `a` statt `netId` (heute ROT „A gegen A“ an tier:baer/fuchs/wolf, Blatt samen-funktion);
die Probe fährt F3 (a)(b)(c) über 30 Saaten am ECHTEN `_bestandTakt` (kein Zweit-Modell im Skript). Bildpaar: die 5
Third-Bilder der R2-Ausnahme (≥ 5 Saaten, Morphometrie ±10 % gegen die Saat-Statistik). Sprossen: erbe#1, erbe#3
(Richter-Akten). Stopp: drei Zahlen im Commit (Steigung, R/h²S, Δz̄ Räuber an/aus) und `abdruck --a-gegen-a` an tier:* grün.

### Welle 2 — die Achsen auf die GPU und auf den Baum
- Tier-Satz liest den BESTAND statt `st.creatures` (die Kappe maxCreatures 20, dirigent-kern.js:280, fällt als Zahl).
- Achsen bein/hals/statur: Knochen-Skala je Glied am Nah-Leib, Matrix-Achsen im Satz; hell: Ton-Zeile je Instanz (wie `aTon`).
- Pflanze: Díaz-Vektor (lnH, lnRho, lnLMA, lnSaat, lnBlatt) tritt in `artPhaenotyp` (phyto-core.js:2431) ein; der IR-Wurf
  ±0,1/±16 % (phyto-core.js:2481–2491) und V = 2 (`_foundryVariantFor` studio-gestalt.js:935) fallen in Instanz-Achsen.
- Welt-Verjüngung mit Mutterbaum (inheritSp 0,6, phyto-core.js:3286, fällt); Bestand als reine Funktion (aufholS :2289 fällt).

### Welle 3 — die Art selbst aus dem Samen
- `art(saat, pfad)`: Geburt-Tod-Baum (λ, μ) auf der Zeit-Achse des Planeten, μ_Art per Brown/OU vom Elter (S1/S3).
- GATTUNGEN (tetrapoda-core.js:62), ART_GESTALT (:3973), PRESETS (foundry-core.js:4721) werden Wurzeln, dann gequantelte Bauplan-Klassen.
- Nische aus dem Klima der Lage (`ortGesetz`, gelaende-core.js:5843): Bergmann/Allen wirken als Selektion auf lnM/bein, nie als Tafel.
- Abgeleitet statt Zeile: fluchtDistanzM :1998, herde.wurf :289, ETHOGRAMM :2125, LEBENSRAUM :2077, kopfJeHa→Damuth :2201.
- forestNicheWeights (phyto-core.js:2823) und der Streu-Zwilling (vegetation-streu.js:202) fallen in dieselbe Nischen-Funktion.

## (6) EHRLICH — was mein Winkel nicht trägt

- **Die Gestalt jenseits der Skala.** Ein Genom, das nur Größe und Flucht trägt, ändert in Welle 1 keinen Bauplan: Wolf und
  Hirsch bleiben vier Güsse. Wie bein/hals/statur ohne Scherung des Rigs und ohne Guss je Individuum in den Leib kommen
  (Knochen-Skala, Bauplan-Raum wie LEIB_RAUM) braucht den Winkel **Bauplan/Preis**.
- **Die Art als Ergebnis.** μ_Art ist in Welle 1 noch die Template-Masse der vier Tafel-Zeilen; der Merkmalsraum ist eine
  Wolke um einen Tabellenpunkt. Woher Arten kommen (Baum, Nische, Klima des Planeten) braucht den Winkel **Stammbaum/Nische**.
- **Die Zeit.** 10³ Generationen ≤ 60 s: bei Reife ≈ 7 min Spielzeit (Wolf) sind das ~10⁵ Takte je Region; ob der echte Takt
  (~0,25 ms) das in 60 s schafft, ist ungemessen (gerechnet ~25 s je Region, nicht gemessen).
- **Vorzeichen von muster#1.** Die Karte verlangt „Größe sinkt unter Räuberdruck“; mein Gesetz sagt das Vorzeichen nicht
  voraus (Riss-Flucht und Hunger drücken nach oben, Reife-Kosten nach unten). Fällt es falsch, ist das ein Befund über die
  Kräfte, kein Grund, eine Richtung einzustellen.
- **Unsichere Konstanten:** reifeAnteil 0,20, geburtAnteil 0,06, sdP(scheu) 0,25, vmJeVE — als Stellwerte markiert.
- **Geschlecht fehlt** in Welle 1 (Mutter = reifes Tier, Vater = nächstes reifes) — Dimorphismus ist eine Achse für Welle 2.
- Nicht selbst gelesen: die Zeitraffer-Probe, der Kern-Lade-Pfad außer cores.manifest.json, kreatur-furcht.js:164–182 (nur aus dem Blatt).
