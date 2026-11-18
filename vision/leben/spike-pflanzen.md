# SPIKE — Pflanzenarten aus EINEM Merkmalsraum (leben.pflanzen.arten#2), main 18058dba, nur gelesen

Skript: `scratchpad/leben/spike/pflanzen.cjs` (lauffähig, 11,7–15,3 s; `--alle` baut jede der 100 Arten voll: 30,9 s, unter Last 82 s).
Nebenprobe: `spike/laubkante.cjs` (dieselbe Konifere am Kopf von `origin/laub-kante` afb90b8e, Kerne per `git show` gelesen).
Ausgaben: `spike/lauf-schnell.txt`, `spike/lauf-alle.txt`. Der Kern läuft im vm wie in `scripts/lib/welt-boot.cjs` `fadenScope`
(phyto-core → foundry-core → foundry-bruecke, dazu ein OffscreenCanvas-Stummel: der Blatt-Atlas wird gemalt, nie gelesen —
foundry-core.js:2582 „die Karten-GEOMETRIE liest nur den Steckbrief“); planet-core.js per `require`.
NICHT gelaufen: GPU, Karten-Bake, Bild, Blindtest, Spielpfad, Radeon/GTX. Was hier „Bild“ heißt, ist ein Stellvertreter aus Maßen.

## BEFUND (die Zahlen)

1. **Abbildung**: 28 Parameter trägt eine Art heute (P-Vektor von `treeParams` + Art-Tafeln). Aus dem Díaz-Raum folgen per Gesetz 4,
   per Korrelat 5, per Bauplan 3, im Kern abgeleitet 8, aus dem Ort 3; **FREI 3/28 = 10,7 %** (trop, barkA, barkB), die
   Kern-Formel widerspricht dem Gesetz bei 2 (leafD, maxDepth); streng (frei + widersprochen + Korrelat) 10/28 = 35,7 %.
   Ohne Kern-Leser: **Samenmasse** (Achse 1 nach Díaz — kein Feld, keine Verjüngung in der Welt) und **Blatt-Lebensdauer/Phänologie**
   (SAISON_GESETZ ist EINE Kurve für alle Arten).
2. **100 Arten** (korreliert gezogen, Cholesky, Strom 20161), gebaut über `buildInstance`/`skelettDerGestalt` des echten Kerns:
   **Fehler 0** (Skelett 61/61, Geometrie L0 100/100 mit `--alle`), Ist-Form = Bauplan 100/100, Baum-Höhe aus dem Welt-Maß
   ±50 % 100/100 (Merkmal p5/p50/p95 0,08/3,14/18,8 m, gebaut 0,08/3,14/18,1), Krone/Höhe im Erd-Band 99/100, Dreiecke ≤ Zeile 93/100
   → **PLAUSIBLE WUCHSFORM 92/100**. Die 8 Ausfälle: 5 Farne (3 964–4 472 > 3 800) und 2 Röhrichte (2 412 > 2 200) reißen ihre
   Zeile — nur Baum und Blume bauen bei Überlauf neu (foundry-core.js:5464–5506); 1 Konifere ⌀/H 0,98 (die ROT-Klasse laub-kante).
3. **Grenze der Sprosse**: der Kern baut von ihrer Liste (Baum, Strauch, Gras, Kletterer, Sukkulente, Farn, Moos) **4 von 7**; es
   fehlen Kletterer (~10 % der Erd-Arten), Sukkulente (~3 %), Moos (~5 %), dazu Epiphyt (~9 %), Palme (Wirt-Alias `baum_palme → weide`,
   studio-bruecke.js:3844). Nach Erd-Anteil ist die Decke **≈ 82 % < 90 %**. Die 92/100 trafen nur, weil der Díaz-Raum diese
   Formen nicht enthält — kein Merkmal trennt sie.
4. **Corner fehlt**: r(log LA, Glieder) = **+0,05**, r(log LA, Blatt-Anker) = **−0,03** (Gesetz: beide < 0). Der Wuchs endet an
   `rMin = 0,045·trunkR`, `lMin = 0,012·H` (phyto-core.js:136–137) — relativ zum Baum, nie in Metern; `maxDepth` (überschrieben, :2502)
   greift praktisch nie. Die Blattgröße skaliert nur die Laub-Karte (Anker ×20 bei √LA ×23); das gemalte Blatt ist für jede
   Laub-Art dieselbe Zelle (foundry-core.js:2627, BLATT_ATLAS_BREIT).
5. **Schwestern** (0,3 SD, je 6 Gestalten): Laub d′ Höhe 0,50 · ⌀/H 0,06 · Glieder 0,00 · Blätter 0,00 · Ansatz 0,01 · Farbe ΔRGB 2,4;
   Nadel d′ Höhe 4,03, Form ⌀/H 0,21; Strauch d′ Höhe 1,04, ⌀/H 0,67. **Die Topologie ist bei Schwestern bitgleich** (derselbe Strom,
   Glieder 737,8/737,8) — sie unterscheiden sich in der GRÖSSE, nicht in der Gestalt und kaum in der Farbe. Über die Schwelle
   (LA +0,3 SD bei 55 mm²) springt dieselbe „Schwester“ von Nadel zu Laub: ⌀/H d′ 16,6, Glieder 2 627 → 745.
6. **Silhouetten-Paare** (Stellvertreter, 4 950 Paare der 100): trennbar 96,3 %, davon 9,1 % NUR über die Größe — die streut im
   Spiel je Baum 0,55–1,95 (forestTreeSize, phyto-core.js:3105) und trennt dort keine Art. Form allein 87,2 %; **im selben Bauplan
   40,8 %**. Auflösung der Regler gegen den Wurf des Individuums (Spanne ÷ 2·Wurf, treeParams :2481–2491): api 2 · slim 5 · trop 6,5 ·
   Höhe 7,8 · leaf 3,1 → **≈ 1 577 Gestalt-Zellen je Bauplan** — Form allein trägt keine 10⁵.
7. **Preis**: Holz Bau L0 p50/p95 345/719 ms (Node, Skelett allein 31–71 ms, der Rest Rinde `h()` und `quadLagen`), Dreiecke p50/max
   4 644/9 272, Netz 0,26/0,45 MB; Kraut 16/45 ms, 300/4 472, 0,03/0,37 MB. 50 Arten im heutigen Modell (V 2 + Solitär je Art):
   150 Karten = 82,5 MiB BC (70 % des 118-MB-Bands allein) / 420 MiB rgba8, 8,3 s Bake (55 ms je Karte GTX, stoff-karte.js:905), ~300
   Draws (Band 208). Je Wurzel statt je Art (6 × 2): 12 Karten, 6,6 MiB, 0,66 s, ~36 Draws.
8. **Standort** an echten Orten des Planeten (planet-core `planetKlima`/`planetBiom`, Same „anazh“): Nische(Merkmal, Klima) trifft
   **3/5 Richtungs-Erwartungen** (LA tropen 414 > gemäßigt 186 > boreal 120 mm² · H tropen 7,4 > boreal 4,2 m · Strauch busch 36 >
   gemäßigt 30 %); verfehlt: LMA busch 81 < gemäßigt 86 g/m², immergrün boreal 0 < gemäßigt 5 %. Der Nachtrag „Schulter-Saison“
   (benannt, nach Lauf 1) hebt immergrün boreal auf 9 %, gemäßigt aber auf 20 % — weiter 3/5. Heute: `forestNicheWeights` hat keinen
   Eingang für T und P — an allen 4 Orten byte-gleich (wE 1,441 · wW 0,150 · wB 0,061 · wF 0,047 · wT 0,019).
9. **laub-kante kollidiert**: am Kopf afb90b8e WIRFT eine neue Konifere ohne Zeile der Kronen-Tafel („die Konifere trägt keine Zeile
   der Kronen-Tafel (ph.krone undefined)“, phyto-core.js:2562–2566 dort); mit geliehener Zeile `krone: "fichte"` ⌀/H 0,51 → 0,09.
   Die Krone wird dort ein Name-Schlüssel — für Arten aus dem Raum muss sie ein Gesetz sein.
10. Nadelbäume im Pool 1/100 — Erd-Maß (~615 Koniferen unter ~60 000 Baumarten); der boreale Nadelwald ist mit EINER Art nicht zu tragen.

## FAKTEN (datei:zeile, gelesen)
- Art = Tafel: PRESETS foundry-core.js:4721–5040 (5 Regler `s` + `ph`); `deriveParamsPlant` :5086 → `treeParams` phyto-core.js:2446.
- Schwellen: `treePhenotype` :2300–2366 — Konifere ⇔ api > 0,72, Strauch ⇔ api < 0,22, Trauer ⇔ trop > 0,7, barkType-Kaskade, Farb-
  Tafeln BC/LC (6 Paletten), `maxDepth` ↑ mit leaf (:2364).
- IR-Wurf :2454–2491: drei Farb-Würfe, api/delta/slim/trop ± 0,1, leafD ×(1 ± 0,16), Höhe ×(1 ± 0,16), leafSize ±12 % (:2507).
- Welt-Maß: hoeheM → schaftHub; Konifere `hd` (:104–115), Laub-Stamm aus der Krone kd 21,5 (:448–467); McMahon nur Form-k (:79–81).
- V = Gestalten je Art: studio-gestalt.js:935–945 (h·V/2³²), lod.budget.gestalten (eiche 2 … '*' 16).
- Nische: forestNicheWeights phyto-core.js:2823–2858 (5 Hand-Gewichte auf fbm-Patch), Kronen-Tafel FOREST_PACK.crown :3159–3168.
- Klima existiert: planet-core.js:1950 `planetKlimaR` (tJahrC, tSommerC, tWinterC, niederschlagMm), :2098 `planetBiom` (Köppen/Whittaker).

## DIE ENTSCHEIDUNG

Eine Pflanzenart ist ein PUNKT im Díaz-Raum unter einer BAUPLAN-WURZEL: `artId(wurzel, pfad)` aus §1.3 des Entscheids, die
Wurzel ist der Bauplan (Laub, Nadel, Strauch, Gras, Kraut, Farn, Röhricht — später Kletterer, Sukkulente, Moos), der Pfad trägt den
Punkt (Welle 3: Brown entlang des Stammbaums). Der Bauplan wird NIE aus Merkmals-Schwellen geurteilt (Fall 3: der Sprung), er ist
geerbt. Gestalt, Krone, Stamm und Standort folgen aus dem Punkt über die Physik, die der Kern schon trägt (Greenhill/McMahon,
Rohr-Modell, Wind f0, Welt-Maß) plus ZWEI neue Gesetze: das **Zweig-Maß aus der Blattgröße** (Corner) und die **Nische aus dem
Blatt-Haushalt** (Kikuzawa). Die Art reist zur GPU als Instanz-Parameter ihrer Wurzel-Gestalt; Karten und Draws zählen je Wurzel.

## DAS GESETZ — Signaturen (kein zweiter Kern; die Achsen sind die Form des Erbes aus §1.1/1.2)

**leben-core.js** (`__lebenCore`, additiv zu §1.2 — dieselbe Form `achsen`/Normale/Gründer, der Zufall bleibt in den Strömen):
```
PFLANZEN_RAUM = Object.freeze({ achsen: ["lgH","lgSM","lgSSD","lgLA","lgLMA","lgN"],   // m · mg · g/cm³ · mm² · g/m² · mg/g
  mu: [0.35, 0.5, -0.3, 3.0, 1.95, 1.3], sd: [0.8, 1.3, 0.15, 0.85, 0.22, 0.17],          // Díaz 2016 — UNSICHER ±0,1–0,2
  R: [[1,.5,.3,.3,.15,-.15],[.5,1,.15,.4,.1,-.05],[.3,.15,1,-.05,.3,-.25],[.3,.4,-.05,1,.05,.05],[.15,.1,.3,.05,1,-.6],[-.15,-.05,-.25,.05,-.6,1]] })
      // R: Moles 2005 (H–SM .5), Wright 2004 (LMA–N −.6), Chave 2009 (SSD), Wright 2017 (LA) — UNSICHER ±0,15
raumPunkt(n6)                      → z    = chol(R)·n          (Gründer einer Wurzel; n aus dem Strom der Region)
pfadPunkt(zEltern, n6, tiefe)      → z'   = zEltern + √(σ²_pfad/tiefe)·chol(R)·n   (Welle 3: Brown entlang artId-Pfad)
merkmal(z)                         → { H, SM, SSD, LA, LMA, N }  = 10^(mu + sd·z)
```
**phyto-core.js** (der Gattungs-Kern der Pflanze; `artPhaenotyp` bleibt die EINE Naht, `art.m` tritt neben `art.s`):
```
BAUPLAN = Object.freeze({ laub, nadel, strauch, gras, kraut, farn, roehricht })   // die Wurzeln; PRESETS-Zeilen werden ihre Stützstellen
hdGreenhill(H, SSD)        → H/D = H / (c·(H/(0,792·∛(E/w)))^1,5), E = 22 GPa·SSD·0,65, w = 1 800·SSD·g, c = 1,77 (an der Fichte)
artAusMerkmal(m, wurzel)   → { s:{api, delta:2, slim, trop, leaf}, ph:{hoeheM:H, hd, crownBase, whorlSpacing, leafCol, kroneAnteil} }
     slim  = 0,18 + 0,0104·(hdGreenhill − 18)          leaf = (lg LA − 1,5)/3           leafCol = L(N·LMA)
     api   = Wurzel-Band (nadel 0,74–0,92 · laub 0,25–0,60 · strauch 0,04–0,18) × σ(1,5·zFast)   (KORRELAT, benannt)
zweigMass(LA, SSD)         → { rMinM, lMinM }   absolute Zweig-Enden in Metern (Corner: Zweig-Querschnitt ∝ Blattfläche) — ersetzt
                              rMin = 0,045·trunkR / lMin = 0,012·H (:136–137) für Arten mit m; growSkeleton liest P.rMinM/P.lMinM
kroneAnteil(m, wurzel)     → r/H aus dem gewachsenen Schirm (stammAusKrone misst ihn schon) — ersetzt FOREST_PACK.crown[name]
                              und laub-kantes `konifereKroneAnteil(ph.krone)` für Arten mit m
nische(m, wurzel, klima)   → w ≥ 0     klima = { tJahrC, tSommerC, tWinterC, niederschlagMm } aus planetKlimaR am Ort
     Kikuzawa: netto = (immergrün ? gW : min(LL, gW))/τ − Ersatz;  LL = 0,06·LMA^1,1 Mo;  τ = (N/20)^−1,4 Mo
     × N-Haushalt (Q10 2) × Wasser (aKrit aus SSD, LMA) × Höhe (H_max aus AI, Saison) × Blattgröße (Wright 2017) × Frost
```
FREI bleiben benannt: `trop` (Trauerwuchs), `barkA/barkB` (Rindenfarbe) — Würfe aus dem Strom der Art (`genomStrom`, :473), vererbt
entlang des Pfads, nie Hash eines Namens. Es fällt: `treePhenotype`-Schwellen als Arten-Urteil (für Arten mit m), forestNicheWeights
+ AUTO-Arten-Hash (vegetation-wiese.js:2583–2589) + der Zwilling `_scatterSpeciesForCell` (vegetation-streu.js:202–230),
FOREST_PACK.crown als Tafel, `gestalten['*'] = 16` je neuer Art, der Alias `baum_palme → weide`.

## DREI FÄLLE (gerechnet) und die Falsifikation

- **Fall 1 — die 100 aus dem Raum**: trägt. 92/100 plausibel, 0 Fehler, Höhe aus dem Welt-Maß 100/100. Lücke: Farn/Röhricht reißen
  ihre Zeile (7) — die Ableitung hält das Budget nur bei Baum und Blume.
- **Fall 2 — Schwestern**: trägt NICHT für #5. d′ der Form < 1 in 3/3 Bauplänen (⌀/H 0,06–0,67), Glieder bitgleich, ΔRGB ≤ 2,4:
  Schwestern sind skalierte Kopien. Ursache: der Wuchs-Strom hängt am Namen/Samen, nicht an der Art, und die Topologie hängt an
  relativen Enden (Corner fehlt). Mit `zweigMass` in Metern und dem Strom aus `artId` wird die Topologie Funktion der Art.
- **Fall 3 — die Schwelle**: zwei Punkte, 0,3 SD in LA auseinander, werden Nadel- und Laubbaum (Glieder 2 627 → 745, Rinde und
  Farbe springen). Das ist kein Artunterschied, sondern ein Gattungs-Sprung aus einem Regler: der Bauplan muss Wurzel sein.
- **Falsifikation** (gesetzt vor dem Lauf): < 70 von 100 plausibel ODER > 50 % der Kern-Parameter frei → widerlegt.
  **Ausgang: 92 ≥ 70 und 10,7 % ≤ 50 % (streng 35,7 %) → NICHT widerlegt.** Gegen die Wuchsform-Liste der Sprosse aber Decke ≈ 82 %:
  die fehlenden Gesetze sind (a) das **Stütz-Gesetz** — Greenhill mit Stamm-Investition unter der Selbsttrage-Grenze (D < D_krit(H,SSD))
  ergibt den Kletterer, der einen Wirt sucht (dieselbe Formel wie `hdGreenhill`, kein neuer Kern); (b) der **Wasser-Speicher**
  (Kapazität · Trockentage, CAM) für die Sukkulente; (c) die Wurzel **Moos** (poikilohydr, ohne Holz und Leitgewebe).

## PREIS — was mit der Artenzahl wächst

Wächst je Art heute: Karten (Art × Gestalt, 0,55 MiB BC / 2,8 MiB rgba8 je Schicht, stoff-karte.js:240–242), Karten-Bake 55 ms Haupt-
Faden je Karte, Draws je Art × Stufe, Foundry-Bau je Gestalt × Stufe (Node L0 p50 345 ms Holz), die Pick-Schleife O(Arten) je Dart.
Wächst nicht: Dreiecke je Instanz (Zeile hält), Wuchs-Gesetz, Skelett (31–71 ms).
Damit 50 Arten zugleich (#3) den Preis halten, muss gelten: **Kosten ∝ Wurzeln × V, nicht ∝ Arten.** Eine Gestalt je Wurzel × V (2),
gebacken einmal (Platte); die Art reist als Instanz-Parameter (Skala x/y aus H und ⌀/H, Ton aus leafCol, Kronen-Ansatz, Wind f0 aus
D/H) — 12 Karten 6,6 MiB, 0,66 s, ~36 Draws. Der Rest (Topologie je Art, Fall 2) braucht eine Nah-Gestalt je Art nur im Nahring:
höchstens N_nah Arten × 1 Gestalt × L0 (0,26 MB, 345 ms Faden) — N_nah ist zu messen, nicht hier gelaufen.

## BAHNEN der Bau-Welle (nach Welle 1; ausschließlicher Datei-Besitz)

Reihenfolge: laub-kante landet zuerst (besitzt phyto-core.js/foundry-core.js heute) → **P0** → **P1, P2, P3 parallel** → **P4** zuletzt.
Gelandet wird EINMAL, alle im selben Zug; Abgabe je Bahn `node scripts/werkbank.cjs abdruck --gegen <Kopf nach laub-kante>`.

- **P0 leben-raum** — `leben-core.js` (nach B1 der Welle 1): PFLANZEN_RAUM, raumPunkt, merkmal; Selbsttest: 10⁴ Punkte treffen R ± 0,03
  und mu/sd ± 0,02. ≤ 1 h. Sprossen: keine allein.
- **P1 pflanzen-gesetz** — `phyto-core.js`: BAUPLAN, hdGreenhill, artAusMerkmal in `artPhaenotyp`, `zweigMass` in growSkeleton (:136–137),
  `kroneAnteil` statt Tafel (auch für laub-kantes Kegel), `nische`. Stopp: Spike-Zahlen am Kopf (unten).
- **P2 pflanzen-bau** — `foundry-core.js`: PRESETS als Wurzel-Stützstellen mit `m`; Zeilen-Halt (Neubau bei Überlauf) für Farn, Röhricht,
  Gras wie für Baum/Blume (:5464–5506); `lod.budget.gestalten` je Wurzel statt '*' 16.
- **P3 pflanzen-welt** — `stamm/vegetation-wiese.js`, `stamm/vegetation-streu.js`, `stamm/studio-gestalt.js`, `stamm/studio-bruecke.js`,
  `voxel-worker.js`: das Klima des Orts (tJahrC, tSommerC, tWinterC, niederschlagMm aus planetKlimaR) reist in den Wald-ctx (heute
  reicht voxel-worker.js:1194–1207 nur Deltas); planForestCell wählt nach `nische`; der Streu-Zwilling und der Namens-Hash fallen;
  die Art als Instanz-Parameter der Wurzel-Gestalt; Alias palme → weide fällt (Palme bleibt offen, kein stiller Ersatz).
- **P4 pflanzen-richter** — `scripts/diag-phyto-tree.cjs` (bestehende Familie gate:phyto-core): die Spike-Probe am ECHTEN Kern (100
  Saaten, ≤ 60 s nur in der Akte, Gate-Teil 20 Saaten ≤ 3 min CI); Mutanten: `zweigMass` → relative Enden (ROT am Namen Corner),
  Bauplan aus Schwelle (ROT am Namen Schwelle); `spec/stamm/modul-karte.json` neu.

**Bildpaar** (main ↔ Kopf): Waldrand an der Mess-Wiese (Profi-Band-Ort Wiese), Werkbank am Messort, Third-Kamera 25 m vor dem Saum,
1,7 m Augenhöhe, Mittag, gleiche Saat. main: fünf Arten in Rausch-Flecken (Eiche, Kiefer, Tanne, Birke, Erle), Klone je V = 2.
Kopf: ≥ 20 Arten nach Nische, je Wurzel eine Gestalt, Arten über Größe/⌀/H/Ton/Ansatz getrennt. Zahl aus dem Bild: unterscheidbare
Silhouetten im Ausschnitt main ≤ 5 → Kopf ≥ 20; Tris/dc/VRAM vorher ↔ nachher am selben Ort unter E (Band 208 Draws, 118 MB).
Zweites Paar: dieselbe Kamera an einem borealen und einem tropischen Ort (`reise`), main gleiche Arten ↔ Kopf andere Gemeinschaft.

**Sprossen**: leben.pflanzen.arten#2 (fällt NICHT ganz: 4 von 7 Wuchsformen — Kletterer, Sukkulente, Moos stehen offen mit (a)–(c)),
arten#3 (≥ 50 Arten im Bild bei Kosten ∝ Wurzeln; Histogramm-Distanz H/LA/SSD ≤ 0,2 — die Ziehung trifft das Band per Bau, das BILD
ist zu messen), biome#3 (Whittaker-Kappa an 20 Orten). arten#5 fällt nicht (Fall 2).

**Stopp-Kriterium** (Zahlen im Commit, gerechnet von P4 am Kopf): plausibel ≥ 90/100 · Fehler 0 · Dreiecke ≤ Zeile 100/100 ·
FREI ≤ 3/28 · r(log LA, Glieder) ≤ −0,3 · Schwestern: d′ ≥ 1 in einer FORM-Größe (⌀/H, Glieder, Ansatz) in ≥ 3/4 Fällen · Paare im
selben Bauplan nach Form ≥ 80 % (heute 40,8 %) · Nische ≥ 4/5 Erwartungen und forestNicheWeights im Absenz-Grep 0 · 50 Arten: Karten
≤ 12, Draws ≤ 60 · Bildpaar Waldrand mit Silhouetten main ≤ 5 → Kopf ≥ 20.

## OFFEN
- Díaz-Mittel, Streuungen und die Korrelationsmatrix sind aus der Literatur erinnert, nicht aus TRY/Díaz-Daten gezogen — UNSICHER
  ±0,1–0,2 (log) bzw. ±0,15; die Teilung der Varianz auf die zwei Achsen (zusammen ~74 %) ist nicht nachgerechnet.
- Eichzahlen: c = 1,77 (Greenhill, an der Fichte), slim-Gerade an Fichte↔Mammut, E_grün = 22 GPa·SSD·0,65 — je EINE Stütze.
- Die Nische ist eine Konstanten-Setzung (Kikuzawa-Form, Q10, aKrit, H_max, LA_max), 3/5 Erwartungen; E2 (LMA mit Trockenheit) und
  E4 (immergrün boreal) verfehlt. Die Schulter-Saison ist ein Nachtrag nach Lauf 1, benannt, und hob E4 nicht.
- Planet-Orte aus dem Samen „anazh“ (nicht der Same der Heimat); die Heimat ruft planetOrt nie (Leser-Blatt planet-physik).
- Kein Bild: Silhouetten-Paare sind ein Maß-Stellvertreter; Blindtest, Karten-Bake (GPU), Radeon/GTX, Spielpfad nicht gelaufen.
- Kraut-Höhe ist durch die Skala gesetzt (kein Test); Gras/Blume/Farn/Röhricht lesen den Raum nur über api/leaf (Platzhalter-Regel).
- Samenmasse und Phänologie je Art haben keinen Leser (leben.pflanzen.lebenslauf, .jahreslauf); Kletterer, Sukkulente, Moos, Epiphyt,
  Palme fehlen als Bauplan.
- N_nah (Arten im Nahring zugleich) für die Nah-Gestalt je Art ist ungemessen.
