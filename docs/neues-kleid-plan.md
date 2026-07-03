# DAS NEUE KLEID — die Phytogenese der Hauptwelt (AKTIVER SUB-BOGEN)

> **STAND (03.07.2026 — WELLE 0 GEBAUT, der PHYTO-CORE-Bogen läuft; §1.5 ist der Visionsweg).**
> Schöpfer: „nun nutzen wir all das
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

## §1.5 — DER VISIONSWEG: PHYTO-CORE (die Naht am geteilten Generator, Schöpfer 03.07.)

**Der Schöpfer stoppte das Stück-für-Stück-Portieren mit der richtigen Frage:** „müssten wir
die Pipeline integrieren, den Code gar nicht duplizieren, sondern die Bäume direkt durch die
Pipeline ziehen? AnazhRealm eigentlich nur der Richter, der es nun so einfach hat wie nie
zuvor — was ist der Visionsweg, der professionelle, der beste Weg?" **Er hat recht: ein
Parameter-für-Parameter-Abgleich zwischen zwei Codebasen IST das Neubauen.** Der professionelle
Weg (ein Ultracode-Workflow aus 30 Agenten hat ihn gegen 4 Alternativen bewiesen, Ø 36.7, 0
Blocker) ist **PHYTO-CORE — der Richter-Kern + zwei Schalen, die Naht am Float32-Attribut:**

- **EINE geteilte Quelle `phyto-core.js`** (IIFE wie `bake-core.js`) trägt die gesetz-wahre
  Wuchs-Mathematik als reine Funktion `growSkeleton(P, seq)` → reine Arrays raus (`{segs,
  leaves, trunkR, height, runMeta}`). KEIN THREE, kein `this`, keine Zeit, kein `Math.random`
  — der injizierte `seq` trägt den Determinismus.
- **Drei Leser derselben Datei** (kein Mirror, der driften kann — Gesetz #0): der Main-Thread
  (`<script>` → `__phytoCore`), der voxel-worker (`importScripts`), das Terrain-Portal (später,
  über die Sandbox-Wand). Der **Stamm ist der RICHTER**: er reicht Dials rein (`_phytoDialsFor`),
  bekommt Arrays raus, faltet sie in seine ZWEI kanonischen Ausgänge (parts+skeleton) und
  urteilt (Tags · Ω-PHYSIS · Perf). Die Wuchs-Mathematik SELBST lebt nur EINMAL.
- **Die Naht ist der Float32-Attribut-Vertrag** (positions/color/aWind/aCenter/aType/uv) — an
  dieser einen Kante fließen die Assets (Skelett heute, Bake/Atlas/Fels/Kristall in den
  Wellen). Der Stamm optimiert die Perf-/Biom-/LOD-LOGIK (er ist der Dirigent), die ASSETS
  saugt er durch die eine Pipeline. So wird der Stamm robuster UND simpler zugleich.

Das ist exakt die Schöpfer-Vision: „wir optimieren die Performancelogik aus dem File in den
Stamm … saugen dann aber alle Assets aus der Pipeline, von Kristall über Steine bis zum letzten
Kern, der Stamm wird robuster und simpler, das System kommt näher an die Zukunft."

---

## §2 — DIE WELLEN (der PHYTO-CORE-Migrations-Bogen)

> **STAND: Welle 0 GEBAUT ✓ (V18.386, 03.07.2026).** Die geteilte Quelle steht: `phyto-core.js`
> trägt `growSkeleton` (byte-identisch aus dem alten `_phytoGrowSkeleton` extrahiert), der Trunk
> ist ein dünner Delegator (die 334-Zeilen-Referenz AST-präzise geschnitten — KEIN Duplikat mehr),
> Main (index.html) + Worker (voxel-worker.js importScripts) lesen dieselbe Datei. Beweis-Linsen:
> `diag-phyto-tree` (die Gesetze aus der neuen Quelle · im `check`-Gate) + NEU `diag-phyto-core-parity`
> (Main==Worker byte-identisch, 48 Läufe 0 divergent · im `check`-Gate). Voll grün: check · lint ·
> format · page-error 0 · fast 13/13. **VORHER (V18.385): K0+K1** — der Herz-Tausch (gesetz-wahrer
> Wuchs) war schon vollzogen; Welle 0 hob ihn auf das geteilte Fundament. **NÄCHSTES: Welle 1**
> (die Farb-/Atlas-Rezepte als zweite Schale auf phyto-core).

### Welle 0 — DIE GETEILTE QUELLE (das Fundament) ✓

Die gesetz-wahre Wuchs-Mathematik von einer Trunk-Methode zur EINEN geteilten Datei heben:

- `phyto-core.js` im `bake-core.js`-IIFE-Muster: `growSkeleton(P, seq)` — byte-identische
  Extraktion aus `_phytoGrowSkeleton` (da Vinci Δ · McMahon · Apikaldominanz · Gravitropismus ·
  Phyllotaxis · Konifere-Whorls/Droop · basalStems · Blatt-Terminierung · Blatt-Budget).
- Der Trunk `_phytoGrowSkeleton` wird ein Delegator (`globalThis.__phytoCore.growSkeleton`
  mit graceful-null-Fallback); die alte 334-Zeilen-Referenz ist GESCHNITTEN (`cut-method`,
  AST-präzise) — kein Parallelpfad. `_phytoDialsFor` (die Dial-Brücke) + der Herz-Tausch in
  `_growTreeBlueprintRich` bleiben unberührt (sie rufen dieselbe Trunk-Methode).
- Main lädt phyto-core.js VOR anazhRealm.js (defer, wie bake-core); der voxel-worker
  `importScripts` sie mit dem `?v=`-Cache-Bust (bereit für worker-seitigen Wuchs künftiger Wellen).
- **Beweis:** `diag-phyto-tree` (Gesetze aus der neuen Quelle, byte-identische Signatur) +
  `diag-phyto-core-parity` (Main-`require` == Worker-`vm`-`self`-Scope, byte-identisch über
  4 Arten × 12 Seeds) — beide im `check`-Gate; page-error 0; fast 13/13.
- **OFFEN als eigener Faden:** das Terrain-Portal (`worlds/terrain/phytogenesis.js`) auf
  `__phytoCore.growSkeleton` umschalten — eine ECHTE Sandbox-/CSP-Runtime-Grenze (ein CSP-Miss
  blankt das Portal, V18.383-Lehre); das Portal rendert heute byte-treu als Referenz, der
  Tausch bringt wenig und riskiert viel → eigene Welle mit sauberer CSP-Verifikation.

### Welle 1 — DEN ASSET-GENERATOR DURCHZIEHEN, NICHT NACHBAUEN (Schöpfer-Kurskorrektur 03.07.)

**Der Schöpfer hielt den Finger auf den Fehler:** „du baust die Systeme immer noch nach —
im Portalfile sind die gesamten Bäume erzeugt, du musst nur wie dort die Assets platzieren,
jede LOD-Stufe, jedes Asset direkt aus der Pipeline, unser eigener Asset-Generator. Wieso
machst du es so kompliziert?" **Er hat recht.** Ich hatte AnazhRealms EIGENE Reimplementierungen
(`_buildTreeFoliageCardGeometry`, `_ensureFoliageClusterAtlas`) getunt — Parallel-Nachbauten
der Portal-Funktionen `buildTree`/`bakeLeafAtlas`. Das ist genau das Nachbauen, das der
Visionsweg beenden soll.

**DIE KORREKTUR — der Asset-Generator ist geteilt (der Float32-Attribut-Faden von Welle 0
reicht bis zur fertigen Geometrie):** die ECHTEN Portal-Asset-Funktionen wandern als reine
Quelle in phyto-core.js:

- `pushSegment` (Rinden-Tube) · `pushLeaf`/`pushLeafClusterQuad` (Blatt-Karten) · `pushNeedle`
  (Nadel) · `buildTube` · `bakeLeafAtlas` (der Blatt-Atlas, main-guarded Canvas) · die
  `buildTree`-Montage pro LOD → produzieren PLAIN Arrays (`position/normal/uv/color/aWind/
  aCenter/aType/idx`) + eine Canvas-Textur. Byte-treu aus der Vorlage, kein Neuerfinden.
- **AnazhRealms Parallel-Builder werden GELÖSCHT** — `_buildTreeTubeGeometry`,
  `_buildTreeFoliageCardGeometry`, `_ensureFoliageClusterAtlas` werden dünne Wrapper, die die
  geteilte Quelle rufen + die Arrays in `THREE.BufferGeometry` wickeln. Die RICHTER-Rolle
  bleibt (Tags/Ω-PHYSIS/Placement), die ASSET-Erzeugung ist geteilt.
- **DIE EINE ECHTE GRENZE — das Material (WebGPU vs WebGL):** die Portal-`onBeforeCompile`-
  Wind-Injektion (GLSL) läuft auf AnazhRealms WebGPU-Renderer nicht → der Wind lebt als
  TSL-Node (`_windSwayOffset` existiert bereits) + das Atlas-Sampling als TSL (existiert). Ein
  DÜNNER Adapter über DIESELBEN Attribute, KEIN Nachbau — der Shader liest `aWind`/`uv`/`color`,
  egal wer die Geometrie baute. Das Portal behält seine WebGL-`MeshStandard`-Materialien.
- **DIE KOPPLUNG (warum es EIN Guss ist, nicht piecemeal):** Atlas-UV-Layout ↔ Karten-Geometrie
  ↔ Nadel-als-Geometrie ↔ LOD hängen zusammen (das Portal trennt `foliageMat` [Geometrie-Blatt/
  Nadel] von `foliageMatTex` [Cluster-Quad + Atlas]). Der Swap zieht Atlas + Karten-Geometrie +
  Nadel-Handling + die zwei Laub-Submeshes GEMEINSAM durch — ein verifizierter Guss, kein
  halber Hybrid.
- **ZWISCHENSCHRITT (V18.386, gebaut):** AnazhRealms Blatt-Atlas + Krone-Dapple auf das
  Vorlagen-Prinzip angeglichen — der Atlas trägt nur den WERT (grau-warm, `_valW`), die Artfarbe
  kommt aus der Vertex-Farbe (kein Hue-Skew mehr, der die besonnten Blätter zu Tan wusch). Das
  ist die RICHTUNG der Vorlage (FIX v37), wird vom vollen Durchzug aber ABGELÖST.
- **Beweis:** der gerenderte Baum (settled, world-lighting via `diag-look-forest`) liest wie
  die Portal-Krone · Tags frozen (`diag-arch-tags`) · das geteilte Asset headless nachgerechnet
  (Attribut-Arrays deterministisch, wie `diag-phyto-tree`) · Determinismus · voller Playtest.

### Welle 2 — FELS + KRISTALL (die dritte Asset-Klasse durch die Pipeline)

- `buildBoulder`/Kristall-Verformung (Zingg/Wadell · ridged-fBm · Sediment-Bänke ·
  Wadell-Facetten · Voronoi-Basalt · Kristall-Schulter-Prismen) als reine Geometrie-Funktion
  in phyto-core.js; der `noiserock`/Kristall-Case in `_makePartGeometry` LIEST sie.
- **TAG/AFFINITÄT-WAND (der EINE Major-Befund des Workflows):** die parts[] behalten ihre
  EXAKTEN Form-Strings (`computeCompoundTags` ist Winner-take-all über Shape×Material) — ein
  gesetz-wahrer Fels bleibt tag-technisch ein `noiserock`/Stein; harte Gates `diag-arch-tags`
  (4 Achsen byte-gleich) + `diag-genom` + `diag-tree-spawn` VOR/NACH.
- Neue fels_var/kristall_var-Charaktere als Zuwachs im `SCATTER_VARIANT_POOL` (eigene Identität).
- **Beweis:** `diag-arch-tags` byte-gleich · `diag-werk-render fels_var*/kristall_var*` ·
  Perf-Probe (det-Skalierung V18.266 bleibt).

### Welle 3 — DIE ÖKOLOGIE (die Platzierungs-Gesetze an unsere Felder)

- Die headless-designte Ökologie-Engine (variabler-Radius-Poisson · reverse-J-Selbstausdünnung ·
  Verjüngungs-Cluster · Beer-Lambert-canopyLight · geologische Fels-Platzierung · groundCover)
  vertieft `_vegetationSampleSpawn`/`_scatterPass` — sie LESEN die existierenden Felder
  (`worldFieldAt`/`_feuchteAt`/`_slopeAt`/`_kronenMult`), ersetzen sie NICHT. Der Affinitäts-Sieg
  bleibt der Arten-WÄHLER; die Ökologie wird der DICHTE-/GRÖSSEN-/NACHBARSCHAFTS-Former.
- Welt-Regen-Wand: worldgen-formend → Γ5-Streams, Determinismus-Band, bewusster Sign-off.
- **Beweis:** `diag-genese`-Klasse (Clark-Evans-Index, Dichte-Verteilung) + Schöpfer-Auge.

### Welle 4 — DIE PERF-/FERNE-LOGIK IN DEN DIRIGENTEN

- Die Performance-/Biom-Optimierungs-LOGIK der Vorlage (8-Winkel-Impostor-Prinzip ·
  Screen-Space-Error-Metrik · Occlusion-Demotion · kontinuierliche Saison ohne Rebuild) wandert
  als LOGIK in den EINEN Regler (`_nexusPerfActuate`/`effArch`/`_foliageDensityScale`) — kein
  zweiter Qualitäts-Regler (V18.263-Wand). Der ferne Baum wird EIN Impostor-Quad statt
  Karten-Geometrie → der 90 %-Laub-Posten (V18.303) fällt in der Ferne strukturell.
- Ein `bake-tree`-Worker-Typ (bake-worker-Muster, phyto-core ist ja schon worker-geladen) ist
  die benannte Eskalation, FALLS der Wuchs/Bake gemessen stallt.
- Saison als kontinuierliche Welt-Achse (uSeasonMul, harmonisch mit Tag/Nacht+Emotion, V17.23) —
  der eingefrorene Herbst-Würfel geht darin auf.
- **Beweis:** Draw-Call-/Tri-Kollaps (`diag-render-load` vorher/nachher, hardware-unabhängig) +
  Schöpfer-FPS-Wort; LOOK-A/B an der LOD-Grenze (kein Pop); Uniform-Konsum-Probe (Saison).

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

## §4 — DIE REIHENFOLGE + DER STAND

**Welle 0 (geteilte Quelle) + der V18.385-Herz-Tausch stehen** — das Fundament trägt: EINE
gesetz-wahre Wuchs-Quelle, der Trunk als dünner Richter, kein Duplikat. Dann Welle 1 (Farb-/
Atlas-Rezepte als zweite Schale — der breiteste LOOK-Hebel), Welle 2 (Fels/Kristall — die
dritte Asset-Klasse, tag-frozen), Welle 3 (Ökologie, mit Welt-Regen-Sign-off), Welle 4 (Perf/
Ferne/Saison — der FPS-Hebel im Dirigenten). Nach jedem Guss: die Diag-Zahl (Determinismus/
Parität/Tags) + settled Bild + volles Gate; die Schöpfer-Bestätigung zwischen den GROSSEN
Güssen (§6.9 wahrerguss). Der Portal-Umschalt-Faden (Welle 0 OFFEN) wartet auf seine eigene
CSP-saubere Welle.
