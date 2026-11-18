# Lesen: phyto-core.js (Pflanzen-Kern) — main 18058dba

Gelesen ganz: 1–1175 · 1176–1690 · 2227–4560 · 6586–7234. Nur überflogen (Kopf + Signatur): 1690–2227 (Klinge, Fels,
Rinden-Röhre, Kristall) · 4553–5856 (Karten-Codec, Mips, BC1/BC3/BC4) · 5960–6586 (Budget-Faltung). Siehe (6).
Zur Einordnung kurz gelesen außerhalb: foundry-core.js 630–660 (gestalten), 4721–5040 (PRESETS), 5086–5141 (deriveParamsPlant).

## Kern-Befund in einem Satz
Eine Pflanzenart ist heute EINE Zeile `PRESETS[art] = { s: {api, delta, slim, trop, leaf}, ph: {...} }` (foundry-core.js:4721ff.) —
fünf dimensionslose Regler 0..1 plus Hand-Überschreibungen —, die `treePhenotype` (phyto-core.js:2300) über Schwellen in sechs
Rinden-Klassen und Farb-Tafeln sortiert; die Wuchs-PHYSIK (McMahon, da Vinci, Stamm aus Krone, Wind f0) liest diese Regler, aber
nichts im Kern erzeugt eine Art: es gibt kein Genom, keinen Merkmals-Vektor mit Einheit, kein Erbe, keine Selektion.

## (1) WAS TRÄGT — Gesetze mit Leser

| Gesetz | Ort | Leser (konsumiert im Spiel) |
|---|---|---|
| McMahon H→D (Form-Einheit `trunkForm`, k = lerp(13,22,slim)) | phyto-core.js:79–81 | growSkeleton selbst (Quirl-Teilung 184, Stamm ohne Welt-Maß 110–115) |
| Konifere: Stamm aus Schlankheit H/D `P.hd` (Bestand 40–100, waldwissen) · Solitär hd·0,45 | :104–115, FREISTAND :2743 | growSkeleton; hd kommt aus PRESETS `ph.hd` (fichte 70, tanne 65, mammut 18 — foundry-core.js:4732/4756/4750) |
| Stamm aus der Krone: BHD = Schirm-⌀ / kd, kd 21,5 (Hemery 2005, „UNGEPRÜFT" je Art :443) | :448–467, angewandt :407–416 | growSkeleton → jedes Segment-Radius × k |
| da Vinci / Rohr-Modell r^Δ an jeder Gabel | :304, :350; Strauch-Triebe :377 | growSkeleton; Δ = Regler `delta` (2,05–2,4 in PRESETS) |
| Apikaldominanz exkurrent/dekurrent, Quirle | :173–204, :307–348 | growSkeleton (Schwelle api > 0,62 = Konifere/Leittrieb) |
| Gravitropismus | :145–146 | growSkeleton (trop) |
| Phyllotaxis Goldener Winkel | :37–38, PHYLO_GESETZ :4282 | growSkeleton (Blatt-/Ast-Azimut); Rinden-Narben :4091 |
| Selbst-Astung (Schattenäste unter crownBase sterben) | :306, :314 | growSkeleton; crownBase aus treePhenotype :2356 |
| Bestand vs. Solitär (Lichtkonkurrenz: Seitenast 0,6, Krone 0,6 der Höhe) | BESTAND :2751, FREISTAND :2743, bestandArt :2754 | growSkeleton :107; Wirt `_forestStehtFrei` (nicht gelesen) |
| Welt-Maß: Höhe in Metern `hoeheM`, Schaft-Hub | :101, schaftHub :2227, treeParams :2525–2532 | growSkeleton :394–398 |
| Jugend-Gestalt: Krone×alter, Blatt × alter^−¼, Tiefe | treeParams :2542–2551, JUGEND :2556 | foundry-core.js:5462 (ov.alter), Wald-Schichten |
| Wind: f0 = kF·D/H² (kF 720 m/s), Last ∝ U^1,4, Kolmogorov-Antwort | WIND_GESETZ :6591, windAusschlag :6671 | foundry-core.js (Laub/Rinden-Stoff), stamm/stoff-instanz.js:174 (windSchlankheit liest D aus der GEBAUTEN Rinde :6604–6651) |
| Laub-Licht: Durchlass τ (PROSPECT-D) Laub 1,0 / Nadel 0,5 | LAUB_LICHT :6786, laubDurchlass :6796 | foundry-core.js:964 |
| Halm: Querschnitt, Adern, Monsi-Saeki/Campbell-Narbe | HALM_GESETZ :6846, :6891–6949 | foundry-core emitGrass (nicht gelesen), Welt-Stoff |
| Krone im Jahr (Laubfall-Präsenz p, Holz 0,05) · Halm im Jahr | :6728–6765 | stamm/gelaende-fern.js:1052/2031, voxel-worker.js:4785, stamm/stoff-karte.js:718 |
| Wald-Geburt: Bestandsdichte (fbm) → Matérn-II-Schüchternheit, Deckung analytisch | :2788–2818, forestKronenDeckung :2974 | voxel-worker.js:4324 (Fern-Farbe), planForestCell |
| Bestandsschichten (Kraft'sche Klassen, alter 0,7/0,4) | FOREST_PACK.schicht :3180, forestSchicht :3403 | voxel-worker.js:1304, stamm/vegetation-wiese.js:2737 |
| Waldgrenze unter Sommer-Schnee (Körner 2012) · Trockengrenze `wuchs.wald` · Saum am Ort | :3227, :3243, forestWuchs :3092 | planForestCell :3641/3660/3735 |
| Klima der Erdzeit: Faktor `nadel`/`laub` je Ort (Bedecktsamer-Zeit) | forestNische :3079–3085 | voxel-worker.js:4313, planForestCell |
| Boden-Bänder (licht · feucht · ufer · fels · hang · leben) je Boden-Art | bodenBand/bodenGewicht :5861–5915 | stamm/vegetation-wiese.js:1278, worlds/terrain/phytogenesis.js:2655 |

Fazit (1): Was trägt, ist MECHANIK DES INDIVIDUUMS (Statik, Verzweigung, Wind, Licht) und ÖKOLOGIE DES BESTANDS (Dichte,
Schicht, Grenzen). Das Bindeglied dazwischen — welche Art wo steht und warum sie so gebaut ist — ist Tafel (siehe 2).

## (2) WÜRFE UND TABELLEN

### Art-Tafeln (Art = Zeile, kein Gesetz)
- **PRESETS** (foundry-core.js:4721–5040, außerhalb meines Felds, aber die Quelle jeder Art): eiche, fichte, birke, weide, mammut,
  tanne, strauch, buche, karst, totholz (+ Blume/Gras/Farn… nicht-holzig). Je Art 5 Regler `s` 0..1 + `ph` (hoeheM, hd, solitaer,
  Farben). Die Regler sind gesetzt, nie abgeleitet.
- **treePhenotype Schwellen** :2303–2316: Konifere ⇔ api > 0,72 (conif>0,5); Strauch ⇔ api < 0,22; Weide ⇔ trop > 0,7;
  barkType = Kaskade (sequoia ⇔ Konifere ∧ slim < 0,4; birch ⇔ slim > 0,66; sonst oak). Wirkung: der stetige Reglerraum fällt in
  6 Klassen — Rinde, Farbe, Wuchsform springen an Schwellen.
- **Höhe ohne Physik** :2307–2316: height = lerp(2,2; 6,0; 0,35·api + 0,3·leaf + 0,35·(1−slim)), ×1,4 Konifere, ×1,6 sequoia,
  Strauch lerp(1,5; 2,6). Reine Stellwerte; im Welt-Maß überschreibt `ph.hoeheM` (Hand-Zahl je Art) die Höhe ohnehin.
- **Farb-Tafeln BC/LC** :2328–2343 (Rinde 2 Töne, Laub 1 Ton je barkType; Birke mit Albedo-Beleg Betts & Ball 1997). Wirkung:
  alle Laubbäume derselben barkType-Klasse tragen dieselbe Grundfarbe ± HSL-Wurf.
- **leafShape aus „oakness"** :2317–2327 (Superformel m 2..9) · **LEAF_SHAPES** :1633 (5 Formen). Nur L0-Klinge liest sie.
- **barkProfile** :3842–3853: Tafel T mit 6 Rinden (ridges, depth, plate, hFreq, lichen, papery) — Wirkung: jede Rinde im Bild.
- **BIRKEN_RINDE** :3882 — eine Art bekommt ihr eigenes Gesetzbuch-Kapitel (Lentizellen, Fuß-Borke); keine andere Art kann es erben.
- **Blatt-Atlas: 4 Zellen** :581–600, ZWEIG_BLATT/GROSS/WEIDE/WEDEL :611–725 — ALLE Laubbäume teilen Zelle 0 (ein Zweig mit
  ~600 Blättern à 14 px), Weide Zelle 1, Strauch Zelle 2, alle Nadelbäume Zelle 3. Wirkung: Blattgestalt ist pro Klasse, nicht pro Art.
- **Stufen-Konstanten** treeParams :2461–2480 (lf 0,0265/0,21/0,16; ls 1,62/2,05/4,0) — Render, nicht Art.
- **STRAUCH_WUCHS** :2772 (triebe 12…10, neigung, laenge …) — Strauch als Klasse.
- **FOREST_PACK.crown** :3159–3168: Kronen-Radius je Art in m (eiche 4,0 … mammut 9,2) — gemessen an der eigenen L0 (Kommentar
  :3151), also Echo der Gestalt, aber als Tafel gehalten (ein Zwilling der gewachsenen Krone). Auto-Arten ohne Zeile: 4,0 m (:3713).
- **forestNicheWeights** :2823–2858: FÜNF handgeschriebene Gewichte (wF Kiefer, wT Tanne, wE Eiche, wB Birke, wW Erle) mit
  Patch-Zentren 0,15/0,36/0,58/0,82 auf EINEM fbm (Halbbreite 0,14) und Hand-Koeffizienten (0,45·sF + 0,5·dry + 0,04 …).
  Wirkung: welche Art wo steht, ist ein Rausch-Fach, keine Konkurrenz um Licht/Wasser.
- **Pick-Strings** planForestCell :3692–3696, FOREST_SPECIES :3299 (Kurzname↔Wirt; fichte→baum_kiefer, weide→baum_erle:
  Namens-Zwillinge, Kommentar „fail-soft identity" :3298).
- **AUTO-Arten** :3678–3705: neue Rezeptbuch-Arten bekommen `w0` und Patch-`center` „deterministisch aus dem Namens-Hash"
  (Kommentar :3679) — Nische aus dem NAMEN, nicht aus Merkmalen. Fallback-Art baum_erle :3699.
- **Mammut-Promotion** :3118–3126: jede Nicht-Erle wird mit 2 % (sd > 0,72 ∧ clim > 0,5) zum Mammut — die ART wechselt per Wurf.
- **WX_GESETZ / FOREST_LAB / SCATTER_STRATUM / FOREST_STAND** :4287, :3264, :3614, :2728 — Preset-Tafeln (Labor-Schwellen).
- **gestalten je Art** (foundry-core.js:639–659): eiche 2, fichte 2, birke 2, tanne 2, buche 2, weide 1, mammut 1, strauch 1, karst 1.

### Würfe je Individuum (Hash/Strom ohne Gesetz dahinter)
- treeParams IR = mulberry32((seedInt+1)·2246822519) :2454 — Reihenfolge: 3 Farb-Würfe (HSL ±0,025/±0,05/±0,04) :2481,
  dann api/delta/slim/trop ± 0,1 (O) :2484–2487, leafD ×(1±0,16) :2488, height ×(1±0,16) :2491, leafSize ×(1±0,12) :2507,
  `_bphase` :2510, Totholz-Bruchhöhe 0,42 + 0,26·IR :2516. Wirkung: Gestalt-Streuung innerhalb der Art = gleichverteilter Lärm
  um die Preset-Zeile, ohne Korrelation (Höhe und Blatt unabhängig, kein Allometrie-Zwang).
- `seedInt` ist NICHT der Baum, sondern die Gestalt 1..V (foundry-core.js:5141 `SEED`; stamm/studio-gestalt.js:618 „die Samen
  je Art sind ihre Gestalten 1..V"); Same V+1 = Solitär :2552. Wirkung: in der Welt hat eine Art 1–3 Skelette; jedes Individuum ist
  eine Kopie davon × Größe s × Drehung.
- growSkeleton-Strom `seq` (genomStrom :473 über FNV des Namens) — Ast-Wackeln :151, Seitenast-Zahl 2 oder 3 per `rnd() < 0,55`
  :339, Spreizung ×0,85–1,12 :344, Leittrieb-Azimut :358, Blatt-Ort/Größe/Phase :223–230, :287–297, Peitschen-Länge 0,2–0,38·H
  :239, Strauch-Trieb-Winkel und Rang :370–371, Trieb-Stärke :377. Das ist die erlaubte Mikro-Varianz der Gestalt (wie Natur),
  aber auch Gestalt-bestimmende Würfe (2 vs 3 Arme) ohne Ressourcen-Gesetz.
- planForestCell (forestCellRng :2716): Ort, Geburts-Wurf, Hang-Wurf, Art-Pick :3689, Größe reverse-J :3105 (s = 0,55 + 1,45·u^1,45,
  5 % Überhälter), Mammut, prio, keep, totRoll, rotY, seed :3723–3728. `s` ist der einzige Individual-Unterschied der Welt (Größe
  ×0,55–1,95, Kommentar :3183) — ein Wurf, kein Alter, kein Wuchs am Ort.
- FOREST_LAB (Labor-Wald): Verjüngung erbt die Art des Elters mit p = 0,6 (`inheritSp` :3286) — das EINZIGE Erbe im Kern, nur Art,
  nur Labor, Wurf.
- streuZelle :2973: Streu-Größe = scaleBase + Hash·scaleVar (Kraut-/Strauch-Schicht).
- Blatt-Atlas-Maler `_atlasRnd(strom)` :751, :926 — Bake-einmal, gilt für alle Arten der Zelle.
- Blüte (foundry-core.js:5098): Blütenfarbe = Wurf aus 8-Farben-Palette FP; Blütenstand aus api-Schwelle (single/umbel/spike).

## (3) GRÖSSEN — Zahl MIT Einheit (lesbar für ein Erbe-Gesetz)

Vorhanden:
- Wipfelhöhe `hoeheM` [m] je Art (PRESETS ph; Individuum: hoeheM·P.height/ph.height :2526).
- Schlankheit H/D [–] `hd` (nur Konifere), kd = Kronen-⌀/BHD 21,5 [–] :448; BHD folgt [m] aus Krone (abgeleitet, nicht Erbe).
- Kronen-Radius T [m] je Art (FOREST_PACK.crown :3159), Wald-Größe s [–] :3105.
- Brusthöhe 1,3 m, f0 = kF·D/H² [Hz] mit kF 720 m/s :6591 — Eigenfrequenz ist ableitbar, sobald D und H Merkmale sind.
- Blattgröße: Atlas-Pixel → Welt 0,09–0,12 m (Kommentar :606–610), Strauch 4–16 cm (:2767); Halm-Aderabstand 0,7 mm :6849.
- Albedo Laub/Rinde (BC/LC hex; Betulin ~0,5 :2332; Laubkrone 0,15–0,26 :2340), Blatt-Durchlass τ [–] :6787.
- Phänologie: Präsenz p des Laubs (Leser kroneImJahr; Quelle SAISON_GESETZ außerhalb), Halm-Länge ha.
- Ort-Größen als Eingang: Feuchte 0..1, Höhe/Trockenheit, Schnee-Anteil, Wald-Anteil (Niederschlag/Verdunstung), Boden-Licht.

Fehlt (kein Feld, keine Einheit, kein Leser):
- **Holzdichte** ρ [g/cm³] — nirgends; die Statik (McMahon k = lerp(13,22,slim)) ersetzt sie durch einen Regler.
- **Samenmasse** [mg], Samenzahl, Ausbreitung — nirgends (Verjüngung nur Labor, Wurf :3279–3289).
- **Spezifische Blattfläche SLA** [m²/kg], Blatt-N, Lebensdauer des Blatts (immergrün vs. sommergrün ist nur conifer-Bool).
- **Maximalhöhe als Merkmal** vs. Alter: Alter existiert nur als Jugend-Faktor 0..1 (:2542), Wachstumsrate fehlt.
- **Schatten-/Trockentoleranz** als Zahl — ersetzt durch Patch-Fach + Hand-Koeffizient (:2853–2857).
- **Wurzeltiefe**, Wasserbedarf, Frosthärte (Waldgrenze ist Bestandsgrenze, nicht Art-Grenze).
- **Verwandtschaft** (Stammbaum, Abstand zweier Arten) — nichts.
- Die 5 Regler api/delta/slim/trop/leaf sind dimensionslos; nur delta (Δ ≈ 2–2,5, da-Vinci-Exponent) ist physikalisch deutbar.

Merkmals-Vektor nach Díaz 2016 (Höhe · Holzdichte · Samenmasse · Blattfläche · SLA · Blatt-N) gegen heute:
Höhe = hoeheM (ja, Hand) · Holzdichte = fehlt · Samenmasse = fehlt · Blattgröße = leafSize relativ (Regler leaf) · SLA = fehlt ·
Blatt-N = fehlt. Gestalt (api, slim, trop, maxDepth, crownBase, windGain) müsste daraus FOLGEN — heute ist es umgekehrt: Gestalt-Regler
gesetzt, Höhe nebenher.

## (4) NAHT — die EINE Eintrittsstelle

**phyto-core.js:2431 `artPhaenotyp(dials, art)`** (mit ihrem Rumpf `treePhenotype` :2300 und dem Aufrufer `treeParams` :2446).

- Heute dort: `treePhenotype(api, slim, trop, delta, leaf)` (Schwellen + Tafeln BC/LC/leafShape) ⊕ `Object.assign(ph, art.ph)`
  (Hand-Zeile der Art überschreibt). Eingang sind die 5 Preset-Regler aus foundry-core PRESETS.
- Wer liest sie (Kommentar :2427–2430 „die EINE Quelle für Rinde, Laubfarbe, Nadel-Art und Krone jedes Baums"):
  treeParams :2457 (→ growSkeleton, Rinde buildTubeGesetz, Laub, Karte) ← foundry-core.js:5141/5552 (Studio + Foundry-Worker),
  stamm/stoff-karte.js:1551; stamm/gelaende-fern.js:816/1008/1156 (Fern-Farbe, Kamm-Krone, Nadel der Karte);
  foundry-bruecke.js:430; bestandArt :2754 (Wuchs + Kamm-Krone des Wirts).
- Was dort eintreten müsste: `artPhaenotyp(genom, ort?)` — ein Merkmals-Vektor mit Einheit (Höhe, Holzdichte, Samenmasse, SLA,
  Blattgröße, Phänologie) als Eingang; Regler api/slim/trop/hoeheM/hd/Farben/barkType als FOLGE. Dann konsumieren Wuchs, Rinde,
  Laub, Karte, Ferne und Wind (über D/H) dasselbe Genom ohne neuen Leser.
- ZWEITE Naht (Wahl der Art am Ort), muss mitfallen, sonst bleibt die Verteilung Tafel: **forestNicheWeights :2823 /
  planForestCell :3689–3706** — fünf Hand-Gewichte + Pick-Strings. Ein Art-Gesetz müsste hier aus Merkmal × Ort (Licht, Wasser,
  Schnee, Trockenheit — die Eingänge liegen in forestNische :3054–3060 bereits vor) die Gewichte rechnen, für N Arten statt 5.
- Nebenbedingung: treeParams' Wurf-Reihenfolge ist „heilig" (:2439, :3101, :3627) — jede Naht-Änderung ist ein Wald-Re-Roll.

## (5) PREIS

Je Gestalt (Bau, aus Quelle/Kommentar):
- Segment-Kappe `countCap` 8 800 :76, Blatt-Budget 20 000 :426 (je Stufe gesetzt); gepackt 14 Float64 je Segment, 15 je Blatt
  :488 → bis ≈ 1,0 MB + 2,4 MB Transfer je Wuchs (abgeleitet aus den Konstanten, nicht gemessen).
- Dreiecke: Budget tree[0] 12 000, tree[1] 10 000 (Kommentar :3873, :3881); Strauch Nah 6 460/12 000, Mittel 704/1 100 (:2769);
  Birken-L1 Rinde 3,4–3,8k (:3959); L0-Klinge 28 Tris je Blatt (:1659), Karte 2 Tris je Blatt.
- Lagen-Raster (Karten-Wahl, je Gestalt beim Bau): GTX 1050 kalt 6,2 CPU-s vor dem ersten Bild, „die Hälfte jedes Laub-Körpers"
  (:1384, vor dem w28-Schnitt; nachher nicht genannt).
- Vorab-Geometrie L2 hätte ~38 MB je Boot gekostet (studio-gestalt.js:657, gefallen).

Je Art (wächst mit der Zahl der Arten):
- V Gestalten × Stufen (L0, L1, Karte) Bauten; je Art EINE Schicht im Karten-Array-Atlas (:4457) — Atlas-VRAM ∝ Arten × V.
- Draws: je Stoff × Attribut-Form ein Draw (BUDGET_GESETZ :5923ff.); Laub teilt EIN Material/Atlas (:731), Rinde je Art eigene
  Vertex-Farbe — Draws je Art × Stufe (Zahl in diesem Kern nicht genannt: OFFEN).
- forestNicheWeights/planForestCell: O(Arten) je Dart; forestKronenDeckung O(Arten × 16 Größen) je Abtastung, kalt ~70 000 Rufe,
  1,3 s Selbstzeit vor K60 (:2957), danach „bitgleich" ohne neue Zeit-Zahl.
- forestKammKronen: Art-Phänotyp je Art gemerkt (AP-Map :3556) — O(Arten).

Je Individuum (Welt): ein Dart = 12 Felder Objekt (:3736), Urteil über ±2 Zellen (58 398 Urteile kalt, :3360); Bestand 142–349
Stämme/ha (:3175–3179). Ein Individuum kostet KEINEN eigenen Bau — es ist Instanz einer Gestalt; genau das macht „jedes Individuum
eigen" heute unbezahlbar: eigene Gestalt = eigener Bau (Wuchs + Lagen + Karte), Kosten ∝ Individuen statt ∝ Arten·V.

## (6) OFFEN
- 1690–2227 (buildLeafBlades-Rumpf, buildBoulderGeometry, buildBarkTubeArrays, buildCrystalPointGeometry), 4553–5856 (Karten-Codec,
  impostorMips, BC-Kodierer) und 5960–6586 (Budget-Faltung) nur an Kopf und Signatur gelesen — dort vermutete ich keine Art-Logik,
  geprüft ist es nicht.
- `_foundryVariantFor` (welche der V Gestalten ein Dart bekommt — Hash des Dart-`seed` :3727?) nicht gelesen.
- Wie viele Arten die Welt HEUTE wirklich trägt: Wald 5 + Mammut + `ctx.extras` (Auto-Arten aus dem LIVE-Rezeptbuch) — die Zahl
  der extras im Spielpfad nicht ermittelt; PRESETS-Zeilen gezählt: 10 holzige (eiche … totholz).
- SAISON_GESETZ (Quelle der Präsenz p, Phänologie je Art?) liegt außerhalb dieses Kerns — nicht gelesen, ob es je Art oder nur
  Laub/Nadel unterscheidet.
- Draw-Calls und MB je Art/Gestalt als gemessene Zahl: in diesem Kern nicht genannt.
- Ob `ph.hoeheM` je Art irgendwo gegen eine Quelle geprüft wird (Kommentare nennen Altbestands-Bänder, die Zahlen selbst sind gesetzt).
