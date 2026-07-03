# DAS NEUE KLEID — die Phytogenese der Hauptwelt (AKTIVER SUB-BOGEN)

> **STAND (03.07.2026 — REINER PLAN, gemessen fundiert).** Schöpfer: „nun nutzen wir all das
> Wissen aus dieser Welt und wenden es auf unsere Voxelwelt an — AnazhRealm wird im neuen Kleid
> erwachen. Wir haben das Skelett in AnazhRealm und die Haut im Portal (performancetechnisch
> deutlich optimierter). Ich habe die perfekte Vorlage geschaffen." Die Vorlage: **phytogenesis
> v38** (`worlds/terrain/phytogenesis.js`, seit V18.383 die Terrain-Portal-Welt) — ein
> Morphologie-Labor, in dem Pflanzen + Felsen aus GESETZEN wachsen, mit einem Wald-Renderer,
> der auf schwacher Hardware läuft. Dieser Plan ist der Sub-Bogen von `docs/wahrerguss.md`
> (System C Grammatik-Tiefe + System A Substanz + System D Detail für Vegetation/Fels) mit
> einer BEWIESENEN Vorlage statt Neuerfindung — „auf Schultern von Riesen", wobei der Riese
> diesmal der Schöpfer selbst ist.
>
> Fundiert auf zwei READ-ONLY-Recon-Karten (03.07.): der Phytogenesis-Katalog (jedes System
> mit Zeilen + Portabilitäts-/Determinismus-Befund) + die AnazhRealm-Pipeline-Karte (jede
> Methode mit file:line). Kein Ratewerk — jede Naht unten ist gemessen.

---

## §0 — DIE ZENTRALE EINSICHT: die Nähte passen exakt

**AnazhRealm wächst Bäume heute in ZWEI Ausgängen** (`_growTreeBlueprintRich`, anazhRealm.js:50319):

1. **`parts[]`** (cylinder + sphere) — der SUBSTANZ-Körper: trägt Tags (`computeCompoundTags`
   :55860), Spezies-Identität (`_grownSpecies`), Physik-Richter, Crafting, Serialisierung.
2. **`_lastTreeSkeleton`** (Polylinien + Anchors) — der RENDER-Körper: daraus baut die
   Render-Schicht Tube-Rinde (`_buildTreeTubeGeometry` :57874) + Blatt-Karten
   (`_buildTreeFoliageCardGeometry` :58259) + den opaken Kern (V18.349).

**Phytogenesis erzeugt GENAU dieses Paar** — nur aus tieferen Gesetzen: `growTreeNodes`
(phytogenesis.js:350–452) emittiert `{segs[], leaves[]}` als **reine JS-Arrays, THREE-frei,
mulberry32-seed-deterministisch** — strukturell ISOMORPH zu unserem Skeleton. Die Phänotyp-
META-REGEL (`phenotype` :949, `__dials`-Naht :978) ist DOM-frei designt („wird 1:1 portiert"
steht wörtlich im Quellcode). **Die Integration ist also KEIN Umbau der Pipeline, sondern ein
Herz-Tausch an EINER Stelle: die Skelett-Wuchs-Mathematik in `_growTreeBlueprintRich` wird
gesetz-wahr — alles Downstream (Tags · Richter · HISM · LOD · Wind · Perf-Regler · Taille)
bleibt stehen und liest weiter dieselben zwei Ausgänge.**

Dasselbe beim Fels: `buildBoulder` (phytogenesis:778–831, Zingg/Wadell/fBm/Schichtung)
deformiert ein subdividiertes Ikosaeder — EXAKT die Topologie-Quelle unseres `noiserock`
(:51653). Der Tausch ist die Verformungs-Mathematik im selben `_makePartGeometry`-Case.

**Was Phytogenesis mitbringt, das uns GEMESSEN fehlt** (die Schwächen-Liste der Pipeline-Karte):

| Lücke heute (gemessen)                                                                 | Die Vorlage liefert                                                                                                                                                                                     |
| -------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Kronen-Kugeln in den Parts, Äste ohne Radius-Gesetz                                    | da Vinci Δ (r^Δ-Erhaltung) · McMahon H=k·D^(2/3) · Apikaldominanz exkurrent/dekurrent · Gravitropismus · Phyllotaxis (GOLDEN)                                                                           |
| Rinde = glatte Tube + Atlas-Tint                                                       | barkProfile-Tabelle (oak/birch/sequoia/…): Furchen · Birken-Lentizellen · Astnarben-Phyllotaxis · Wurzelanlauf-Kanneluren                                                                               |
| Fels = Icosahedron + 1-Oktav-Noise                                                     | Zingg-Formraum · Wadell-Facetten-Clipping · ridged-fBm-Verwitterung · Sediment-Bänke + Differenzialerosion · Voronoi-Basalt · Schuttkegel-Gesetz · Kristall-Schulter-Prismen                            |
| Baum-LOD2 = ausgedünnte Karten (kein echtes Billboard); Laub = 90 % GPU-Last (V18.303) | 8-Winkel-Impostor-Atlas (+Normal-Atlas, saisoninvariant, Dilation) · komplementäres Dither-Crossfade · Screen-Space-Error-Metrik · Occlusion-Demotion (Kronen-Dichtegitter)                             |
| Platzierung = Affinitäts-Sieg + clump-Noise                                            | Ökologie-Engine (explizit headless designt): variabler-Radius-Poisson · reverse-J-Selbstausdünnung · Verjüngungs-Cluster · Beer-Lambert-canopyLight · geologische Fels-Platzierung · groundCover-Gesetz |
| KEINE Jahreszeit (Herbst = eingefrorener 24 %-Würfel pro Baum)                         | kontinuierliche Phänologie OHNE Rebuild (uSeasonMul-Uniform-Verhältnis) + Saison-Farb-Gesetz                                                                                                            |

---

## §1 — DIE WÄNDE (verbindlich, vor jeder Welle)

1. **EINE QUELLE, kein Parallel-Baum.** Der neue Kern ERSETZT die Skelett-Mathematik in
   `_growTreeBlueprintRich` — er wird nicht daneben gestellt. Grep-Wand: kein zweiter
   Baum-Builder-Aufrufer außerhalb der einen Router-Kette (`_growTreeBlueprint` :50290).
2. **IDENTITÄT BLEIBT (V18.259).** Spezies-Namen (`baum_eiche`…), `_grownSpecies`,
   `SPECIES_TAG_REFERENCE/VARIATION` sind load-bearing — nur die GESTALT wird gesetz-wahr.
   Neue Arten (weide/mammutbaum) kommen als ZUWACHS mit eigener Identität, ersetzen keine.
3. **AFFINITÄT FROZEN (V17.16/17).** scatter-Spezies (Baum/Fels/Kristall/Glut) → die 4
   Tag-Achsen MÜSSEN vor/nach jeder Welle identisch messen (`diag-arch-tags`), sonst
   verdrängt ein Tag-Shift eine Art auf 0. Die parts[] bleiben cylinder/sphere mit denselben
   Materialien — der Gesetz-Wuchs ändert Positionen/Radien, NIE die Material-Belegung.
4. **DETERMINISMUS.** Der Kern ist seedbar-pur (die Vorlage IST mulberry32-deterministisch).
   Er speist sich aus den EXISTIERENDEN Streams (`_rollGenome`/FNV-r01, Γ5) — mulberry32 wird
   mit dem vorhandenen Seed-Hash gefüttert, kein `Math.random` im Wuchs-Pfad. Wand: gleicher
   Seed ⇒ byte-identische parts+skeleton (`diag-phyto-tree`); `diag-replay-determinism` grün.
   Snapshot-Restore re-wächst mit dem NEUEN Gesetz (dieselbe Klasse wie V18.258 — Identität
   trägt, Gestalt darf reifen).
5. **DER RICHTER HÄLT (Ω-PHYSIS).** Jeder gewachsene Baum durch steht/knickt (rooted →
   Knicken Ω-Φ3-b). da Vinci/McMahon machen das LEICHTER (physik-wahre Radien), nicht schwerer.
6. **PERF DURCH DEN EINEN REGLER.** Jede neue Render-Schicht (Impostor-Atlas, Crossfade)
   liest `_foliageDensityScale`/`effArch` — kein zweiter Qualitäts-Regler (V18.263-Wand).
   Schwerer Bau bleibt budgetiert/gecacht; ein `bake-tree`-Worker-Typ entlang der
   bestehenden bake-worker-Naht ist die benannte Eskalation, FALLS der Wuchs gemessen stallt.
7. **MECHANIK = ZAHL, LOOK = BILD.** Pro Welle: die Diag-Zahl (Tags/Determinismus/Varianz)
   UND der settled Augenhöhen-Shot; die GROSSEN Güsse am Schöpfer-Auge bestätigt, bevor der
   nächste stapelt (wahrerguss §6.9).
8. **KEIN FRAMEWORK-ÜBERBAU.** Der Kern ist ein dünner Stamm-Bewohner (wie Roller/Mesher).
   Ein Datei-Split NUR, wenn der bake-tree-Worker kommt (dann bake-core-Muster: EINE
   THREE-freie Quelle, von Main+Worker geladen — echte Laufzeit-Grenze, Drei-JA erfüllt).

---

## §2 — DIE WELLEN (risiko- und hebel-geordnet)

### K0 — DER KERN-EXTRAKT (das Fundament, headless-beweisbar)

Die portablen Phytogenesis-Kerne in den Stamm holen, an die AnazhRealm-Ströme angeschlossen:

- `growTreeNodes`-Mathematik (da Vinci Δ · McMahon · Apikaldominanz · Gravitropismus ·
  Phyllotaxis · Konifere-Whorls/Droop · basalStems · Blatt-Budget) als
  `_phytoGrowSkeleton(dials, rng)` — Eingabe: ein Dial-Vektor (die `__dials`-Naht der
  Vorlage) + ein seeded RNG; Ausgabe: `{segs, leaves}` (reine Arrays).
- Die Phänotyp-META-REGEL (`phenotype`/`rockPhenotype`) als `_phytoPhenotype(dials)` —
  Reglervektor → Art als Region im Morphospace (die Brücke SPECIES_GRAMMAR → Dials).
- mulberry32 + die Vektor-Helfer (nur was `_rollGenome`/Simplex nicht schon deckt — messen,
  nicht doppeln).
- **Beweis:** `diag-phyto-tree` — (a) gleicher Seed ⇒ byte-identisch, (b) N Seeds ⇒ vaste
  Varianz (Spannweiten-Band wie `diag-genom`), (c) McMahon/da-Vinci nachgerechnet
  (H/D-Verhältnis, Radius-Erhaltung an Gabeln — die Vorlage loggt ihre Beweise schon selbst).

### K1 — DER HERZ-TAUSCH (eine Art zuerst, dann alle)

- `_growTreeBlueprintRich` speist sein Skelett aus `_phytoGrowSkeleton` (Dials aus
  SPECIES_GRAMMAR + `_rollGenome`-Achsen gemappt) — emittiert weiter die ZWEI Ausgänge
  (parts[] mit denselben Material-Belegungen · `_lastTreeSkeleton` fürs Render).
- ZUERST `baum_eiche` (A/B: Konstanten-Toggle, settled Shot alt/neu am IDENTISCHEN Spot),
  Tags-frozen-Beweis, Richter, dann ALLE 13 Arten + weide/mammutbaum als Zuwachs.
- LOD-Keys (`grown_*_v*_lod{1,2}`) + Foliage-Caps bleiben; `_buildVariantLODs` unverändert.
- **Beweis:** `diag-arch-tags` byte-gleich · Richter-Band · `diag-tree-spawn` ·
  voller Playtest · Katalog-Auge (`diag-werk-render`).

### K2 — RINDE + BLATT (System A/D am Baum)

- barkProfile-Tabelle → `_buildTreeTubeGeometry`: Furchen (vSharp/hFreq) · Birken-Papyrus/
  Lentizellen · Astnarben (Phyllotaxis-Dellen+Wulst) · Wurzelanlauf-Kanneluren (flare
  vertiefen) · Flechten/AO in Vertex-Farben (die Substanz-Antenne liest sie schon).
- Blatt-Silhouetten: superR (Superformel) in die LAAS-Atlas-Zeichner
  (`_ensureFoliageClusterAtlas` — drawLeaf/drawNeedle werden superR-getrieben).
- Astachsel-Füllung (`pushJointSphere`-Prinzip) gegen die Gabel-Löcher.
- **Beweis:** LOOK-Bild (settled, nah, Rinden-Close-up) + Tags frozen + Vertex-Budget gemessen.

### K3 — DER FELS (Zingg/Wadell im noiserock)

- `buildBoulder`-Verformung in den `noiserock`-Case: Zingg-Skalierung · ridged-fBm ·
  Sediment-Bänke + Differenzialerosion · Wadell-Facetten-Clipping + Laplace-Rundung ·
  Kurvatur-AO in Vertex-Farben. Parameter aus den EXISTIERENDEN Tags (härte→Angularität
  lebt schon :51683) + `rockPhenotype`-Genese-Achse.
- Basalt-Säulen (Voronoi/Lloyd) + Schuttkegel + Kristall-Schulter-Prismen als NEUE
  fels_var-Charaktere (Zuwachs im `SCATTER_VARIANT_POOL`, tag-frozen vermessen).
- **Beweis:** `diag-arch-tags` + `diag-werk-render fels_var*` + Perf-Probe (det-Skalierung
  V18.266 bleibt: Kiesel klein = billig).

### K4 — DIE ÖKOLOGIE (die headless-Engine an unsere Felder)

- Die Ökologie-Gesetze (variabler-Radius-Poisson · reverse-J · Verjüngungs-Cluster ·
  canopyLight Beer-Lambert · placeRocks-Geologie · groundCover) vertiefen
  `_vegetationSampleSpawn`/`_scatterPass` — sie LESEN die existierenden Felder
  (`worldFieldAt` · `_feuchteAt` · `_slopeAt` · `_kronenMult`), ersetzen sie NICHT.
  Die Affinitäts-Sieg-Logik bleibt der Arten-WÄHLER; die Ökologie wird der DICHTE-/
  GRÖSSEN-/NACHBARSCHAFTS-Former (Poisson-Abstände ∝ Kronenradius, Größe reverse-J).
- Welt-Regen-Wand: jede Änderung ist worldgen-formend → Γ5-Streams, Determinismus-Band,
  bewusster Sign-off (die Welt sieht danach ANDERS aus — gewollt, aber benannt).
- **Beweis:** `diag-genese`-Klasse (Dichte-Verteilungen, Clark-Evans-Index) + Schöpfer-Auge.

### K5 — DIE FERNE (der Render-Schatz, GPU-Hebel)

- **8-Winkel-Impostor-Atlas für Bäume** (TSL/WebGPU-Port des GL-Bakes): schließt die
  gemessene Lücke „kein echtes Billboard für Bäume"; Atlas einmal je Seed-Signatur,
  saisoninvariant; Anker = Stammachse; Dilation gegen Halos. Der ferne Baum wird EIN Quad
  statt Karten-Geometrie → der 90 %-Laub-Posten fällt in der Ferne strukturell.
- **Komplementäres Dither-Crossfade** an den LOD-Grenzen (die V18.346-Karten behalten LOD0/1,
  LOD2 wird Impostor) + Screen-Space-Error-Metrik (PHYTO_LODREF-Prinzip) in
  `_chooseLODForDistance`.
- **Occlusion-Demotion** (Kronen-Dichtegitter, portabel) als Streaming-Tick-Leser.
- Alles durch den EINEN Regler (`effArch`); WebGPU-Pipeline-Warm (V18.322/.367-Klasse) für
  neue Materialien.
- **Beweis:** Draw-Call-/Tri-Kollaps hardware-unabhängig gemessen (`diag-render-load`
  vorher/nachher) + Schöpfer-FPS-Wort; LOOK-A/B an der LOD-Grenze (kein Pop).

### K6 — DIE JAHRESZEIT (eigener Faden, harmonisch)

- Saison als kontinuierliche Welt-Achse (uSeasonMul-Prinzip: Präsenz/Tint als Uniform-
  Verhältnis, KEIN Rebuild) — harmonisch verschmolzen mit Tag/Nacht + Emotion→Welt
  (V17.23-Disziplin: nichts snappt, alles fadet; die DSL bekommt fruehling…winter wie im
  Portal). Der eingefrorene Herbst-Würfel (:50839) geht darin auf.
- **Beweis:** Uniform-Konsum-Probe + LOOK; Peer-Konsistenz (Saison reist im Snapshot).

---

## §3 — WAS BEWUSST NICHT KOMMT (Scope-Wände)

- **KEIN Terrain-Tausch:** das Phytogenesis-Terrain (fbm2-Höhenfeld, Insel) ist dem
  Voxel-Feld UNTERLEGEN — das Skelett bleibt unseres (der Schöpfer-Plan sagt genau das).
- **KEIN Wasser-Tausch:** unser Wasser (CA + Atlas + Fern-Sheet) ist tiefer; die
  spektrale Wellen-Formel der Vorlage ist höchstens ein Shader-Zitat für später.
- **KEIN zweiter Wald-Modus:** kein „Phyto-Wald neben der Welt" — die Gesetze wandern in
  die EINE Welt. Das Portal bleibt als Labor/Referenz bestehen (dort tunt der Schöpfer
  Presets, die wir als Dials übernehmen — die Vorlage bleibt lebendig).
- **FoliagePass/TAA/planare Reflexion:** GL-gebundene Architektur der Vorlage — NICHT
  portieren (unser WebGPU-Post-FX/MSAA-Kontext ist anders); nur falls eine GEMESSENE
  Lücke sie ruft, als eigener Faden.

## §4 — DIE REIHENFOLGE + DER ERSTE SCHNITT

**K0+K1 sind EIN Guss** (Kern + Herz-Tausch an der Eiche — verifizierbare Arbeit, das ganze
Subsystem in einer Welle, V17.30). Dann K2 (Rinde/Blatt — der breiteste LOOK-Hebel), K3
(Fels), K4 (Ökologie, mit Welt-Regen-Sign-off), K5 (die Ferne — der FPS-Hebel), K6 (Saison).
Nach jedem Guss: Tags-frozen-Zahl + settled Bild + volles Gate; die Schöpfer-Bestätigung
zwischen den GROSSEN Güssen (§6.9 wahrerguss).
