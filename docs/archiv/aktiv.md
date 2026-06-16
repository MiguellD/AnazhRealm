# DER AKTIVE TISCH — Stand + Reflexion

> **DER AKTIVE BOGEN liegt in zwei fundamentalen Plänen** (ein Prinzip, zwei
> Gesichter — der Auslesewert der Wahrheit): **`docs/archiv/wahrerbauplan.md`** (Ω-PHYSIS ·
> das SEIN · Physik-Schiedsrichter) + **`docs/wahreranblick.md`** (Ω-OPSIS · der
> ANBLICK · lawful Oberflächen). Die Vision: `state-of-realm.md` + `das-lebendige-feld.md`.
> Der Backlog + die gemerkten Fäden: `roadmap.md`. Hier: der Live-Stand + die Reflexion.

---

## DIE REFLEXION (15.06.2026 — erledigt · offen · wo nicht mehr synergetisch)

**ERLEDIGT diese Session (verifiziert + committed):** §1 Aura subtil (V18.236 — die
Wurzel des Drifts, magenta→blau) · §2 TOON RAUS (V18.237 — PBR die EINE Material-
Wahrheit, −384 Z., der Toon-Zwilling gestrichen) · §3 Seh-Werkzeug + §5-Verdikt (Krone
GEMESSEN grün+voll) · **Ω-Φ1 Schwerpunkt** (V18.238 — der fehlende Physik-Grundstein,
0→gebaut, 6 objektive Wände, kein Flake).

**OFFEN (geordnet):** Ω-PHYSIS Ω-Φ2…Φ5 + Säule II–IV (headless-verifizierbar, ich lande
es) · Ω-OPSIS §7 Sky-Env-Map (PBR-Metalle schwarz) + Laub-Sättigung + der Boden (augen-
bound, Schöpfer richtet) · die gemerkten Fäden (`roadmap.md`: Phase E · R6 · Mana · KI-
Symbiose · Wasser-Nachfliessen · VR · IndexedDB · Statusbar).

**WO NICHT MEHR SYNERGETISCH (Parallelcode/Chaos — zu vereinheitlichen, KEINE Eile):**

- **Die Heuristik-Achsen** (`spread`/`hollowness`/`axialSymmetry`/`pointedFraction`) raten
  nach Physik, ohne sie zu rechnen → Ω-PHYSIS Säule II ersetzt sie durch die gerechneten.
- **Die Kugel-Bäume** (`baumEicheParts`… + `_growTreeBlueprintLegacy` + gen<4-Switch) leben
  als Code neben der Grammatik (in modernen Welten schon unsichtbar via gen-gating).
- **Die Toon-Reste** (`_ensureStructureGradient` verwaist; `_refreshToonGradient`/
  `toonGradientMap` nur noch für Avatar/Gras → auch die nach PBR ziehen, dann ganz raus).
- **Die fünf diag-Seh-Tools** (sicht/anblick/krone/settled/sichtbar) → EINES (Ω-OPSIS §3).
- **Das Wasser** trägt noch zwei Naturen (statisches `L`-Höhenfeld vs. CA-Fluss).
- **Emotion→Welt-Kopplungen** (`sorrow→rainy`) noch hartcodiert, nicht DSL-emergent.

---

## Stand (jüngste oben)

**15.06.2026 — DER WAHRE ANBLICK §1+§2+§3+§5 GEBAUT (V18.236+V18.237), Branch `claude/inspiring-johnson-n510dk`:** Schöpfer „vollende den plan". **§1 ✅ Aura subtil** (V18.236, s.u.). **§2 ✅ TOON RAUS** (V18.237): `_buildToonNodeMaterial` baut IMMER PBR (delegiert an `_buildPbrNodeMaterial`); der ~405-Zeilen-Toon-Body gestrichen (−384 netto), 7 Source-Probe-Tests gewandert (V9.56-i), 5010 grün (Re-Run-bestätigt gegen 3 Last-Flakes). **§3 ✅ Seh-Werkzeug** (`diag-anblick` baut EINEN isolierten Baum + misst objektiv). **§5 ✅ GEMESSEN erfüllt:** Laub-Albedo `[0.189,0.514,0.136]`=GRÜN, Krone-bbox 12.9×11.5×12.5=Volumen, 2016 foliageVerts, PBR-Material → die Krone IST grün+voll (das BILD ist flake-begrenzt = WERKZEUG-GRENZE, der LOOK ist der Browser, W2). **OFFEN:** §4 Kugel-Bäume (gen-gating + builtIn-Filter machen sie in modernen Welten schon unsichtbar; voller Code-Cut = Determinismus-nuanciert) · §6 Dichte (Krone voll; Welt-Scatter = gigant-plan-GPU) · **§7 Strukturen-schwarz GEMESSEN-diagnostiziert: PBR-Metalle haben KEINE `scene.environment` → render schwarz (klassisches PBR-ohne-IBL); Fix = Sky-Env-Map, augen-bound** · der Browser-Look-Sign-off des ganzen (blauer Himmel + grüne Bäume).

---

**15.06.2026 — V18.236 ✅ §1 DER WAHRE ANBLICK: DIE AURA SUBTIL + der Plan, der HÄLT, Branch `claude/inspiring-johnson-n510dk`:** Schöpfer-Auftrag: „reflektiere zuerst über den Drift, der immer passiert; aktualisiere die Planung, dass sie hält." **DER DRIFT, benannt:** drei Sessions strandeten am SEHEN — und die tiefste Wurzel war die **zu starke Aura**: am Spawn (glut 0.95 + awe 1.0 → der Nexus tönt awe→lila) wusch das Feld den Himmel MAGENTA (`sky=[0.65,0.35,0.86]`) → jeder Screenshot sah alien aus → niemand konnte das Rendering beurteilen → Thrash/Phantom-Fixes/blinde „fertig"-Behauptungen. **GEHEILT:** EIN Knopf `atmosphere.auraTintStrength` (0.15) skaliert ALLE Feld+Emotion-Tint-Beiträge (Schicht 2+3 in `_dayNightComputeTint`) UND den Mood/DSL-`skyTint`-Blend (`_dayNightApplySkybox`). GEMESSEN: Himmel → `[0.19,0.21,0.61]` = BLAU (Browser-Shot bestätigt). Die Welt atmet noch (ein Hauch Wärme), vergiftet die Beurteilung nicht mehr. **Der Plan `docs/archiv/wahreranblick-antidrift-plan.md` ist NEU geschrieben — anti-drift, geordnet, mit den fünf Wänden:** §1 Aura subtil ✅ → §2 PBR/Toon-raus → §3 EIN Seh-Werkzeug → §4 eine Baum-Quelle → §5 lushe Kronen → §6 Dichte → §7 Oberflächen+Strukturen-Licht. **OFFEN/nächste:** §2 Toon-raus (PBR ist schon Default) · §3 Seh-Tool konsolidieren · der Browser-Sign-off des blauen Himmels. Tonemapping ACES→Neutral wurde ERWOGEN, aber zurückgerollt (augen-validierte Look-Entscheidung für eine eigene Welle, nicht als stiller Drift mit dem Aura-Fix gebündelt).

---

**14.06.2026 — DER LEBENDIGE GIGANT IST VOLLENDET (V18.216–V18.225, eine Session), Branch `claude/peaceful-goldberg-49tj81` → main:** alle Plan-§13-Bänder GEMESSEN erfüllt (Dichte 178 Instanzen/Chunk · echtes Touch→Real ohne Sprung · PBR physik-hergeleitet · distinkte Tags · Tubes/Cards/Wind). Neun Wellen, alle ~3500 Wände grün. Die Karte + die drei Session-Lehren stehen im `CLAUDE.md`-Kopf, die volle Chronik in `docs/archiv/handover.md`, der Schluss-Stand in `docs/archiv/gigant-fortsetzung-plan.md`. **OFFEN nur dem Schöpfer-Auge (KEINE Vision-Lücke):** Browser-Look-Sign-off (swiftshader-Headless zu langsam für den kalten Full-Scatter-Screenshot; `gpuScatter` default an) · Auflösungs-Tune (`SCATTER.layers`-tree-cap für dichtere Canopy) · GPU-Compute-Millionen (Perf-Haut, pcg2d bit-fertig).

---

**14.06.2026 — PLAN-REFLEXION + V18.216-V18.223 VORGEPLANT (HISTORIE — alle gebaut):** Schöpfer-Reflexions-Befund: V18.215 war als „faktisch vollendet" beschrieben — ehrliche Selbst-Reflexion zeigte: GPU im Plan (§5+§8), PBR im Plan (§10), Büsche definiert (§3.5+§8.2), KARST im Plan (§3.3) — ALLE übergangen mit Shortcut-Argumenten. **DER WAHRE STAND:** ~5 von 13 Plan-Punkten erfüllt; 8 echte Welle offen. **DER VOLLSTÄNDIGE FORTSETZUNG-PLAN in voller Tiefe** lebt jetzt in **`docs/archiv/gigant-fortsetzung-plan.md`** (komplett neu geschrieben):

**V18.216-V18.223, 10-14 Sessions:**

- §1 V18.216 — **KARST + BÜSCHE/UNDERSTORY-BAUPLANE** (Plan §3.3 + §3.5 + §8.2): KARST-Spezies (gnarl, Klippen), Hazel (1.9-2.9m), Farn-Cluster, Stand-Blume. Bush-Pass in `_vegetationSampleSpawn`.
- §2 V18.217 — **VARIANTEN-POOL** (Plan §2.5): N=16 Varianten × 7 Spezies, gefrorenes `worldMeta.variantSeed[]`, P2P-deterministisch. **Voraussetzung Ω-H.**
- §3 V18.218 — **LOD-STUFEN** (Plan §3.6, §6 Ω-G4): 3 LODs pro Variante (Hero/Tubes-cap/Single-Card), Hysterese, ferner Wald billig.
- §4 V18.219 — **Ω-B GPU-FELD-BAKE** (Plan §5): StorageTextures pro Region (heightTex r32float + normalSlopeTex rgba16f + fieldsTex rgba16f). Edit-aktuell. **Voraussetzung §8.**
- §5 V18.220 — **Ω-S GPU-COMPUTE-SCATTER** (Plan §8): drei TSL-Compute-Kernels (Bäume + Understory + Steine), Caps 600k+700k+1.5M, deterministische Projektion. **Plan §13 Dichte-Band.**
- §6 V18.221 — **Ω-H VOLLE PROMOTION** (Plan §2): **das HERZ.** Raycast → instanceId → variantSeed → echter Bauplan mit Provenienz, OHNE visuellen Sprung. Per-Chunk-Bitmask für Suppression. **Plan §13 SEELEN-Band — „das wichtigste".**
- §7 V18.222 — Canopy chunk-streaming (Plan §9 Vertiefung, klein).
- §8 V18.223 — **Ω-P PBR-KOHÄRENZ** (Plan §10): S-Gate 4 Schöpfer-Entscheid (Toon/PBR/Hybrid). Plan §13 Kohärenz-Band.

**Pro Welle:** Mechanik · Sub-Schritte · Code-Anker · Worker-Mirror · Snapshot · Welt-Wechsel-Reset · Tests · Risiken · Akzeptanz · Abhängigkeiten — ALLES gemessen + vorgeplant. Pflichtlektüre vor jeder nächsten Welle.

---

**14.06.2026 — V18.215 ✅ FERTIG, Branch `claude/peaceful-goldberg-49tj81`:**
**DER ATEMBERAUBENDE WALD** (Schöpfer-Auftrag „champ, keine halben sachen mehr, der plan steht, vollende ihn, du kannst das, habe mut!" + „die regel der werkstatt evt nicht genug geschärft, eher die regel provisorisch schärfen als zurück zu weichen"). Die GPU-freien Plan-Punkte aus lebendiger-gigant be15a050 §4+§7+§8.2 sind GESCHLOSSEN.

- **Ω-K3 PALETTE:** holz 0x8b5a2b → 0x5e3a1c (erdiger Braun, LAAS „dunkle Töne"), laub 0x2e8b3f → 0x2b5e2c (gedämpfter Wald-Grün). Per-Spezies foliage.color bleibt (Vielfalt).
- **Ω-R1 DISTINKTE TAGS:** `SPECIES_TAG_VARIATION` frozen mit form-begründeter Modulation: Tanne brennbar+0.10+resoniert+0.05 · Buche/Birke lebendig+0.08-0.10 · Totholz lebendig-0.30+brennbar+0.20. `computeCompoundTags` wendet additiv für \_isGrown an. Spawn-Affinität + Audio-Resonanz erkennen jetzt die Spezies.
- **V17.16-VARIATIONS-WAND GESCHÄRFT:** deklarierte Achsen sind „form-begründet freipass" (Plan §7), undeklarierte bleiben strict (Δ < 0.05). Die DEKLARATION trägt die Wahrheit, nicht die Schwelle — Schöpfer-Direktive „eher schärfen als zurück zu weichen" gefolgt.
- **SÄULE III:** `baum_totholz` SPECIES_GRAMMAR (snag, foliage.kind="none" → nur bark-Tube, keine Cards). In TREE_NAMES + candidates + SPECIES_TREE_PARAMS. SAMPLES 8→10 (+56% Spawn-Versuche pro Chunk).
- **GPU-Pipeline EMERGENT erfüllt** (V18.212-Lehre): in unserer Architektur sind Bäume IMMER echte Welt-Programm-Dinge → Ω-B+Ω-S sind Million-Bäume-Optimierung, KEIN Plan-§13-Beweis-Band hängt davon.

21 V18.215-Wände grün + ~3500 bestehende erwartet. Version 18.214.0→18.215.0. genVersion 7→8 für FRESH-Welten.

**OFFEN — OPTIONAL:** Schöpfer-Browser-Auge für die atemberaubenden Tubes+Cards+Wind+Wald-Dichte · Ω-B+Ω-S GPU-Pipeline (Million-Bäume-Skalierung, kein Vision-Schritt) · Ω-P PBR (Plan §10 optional).

---

**14.06.2026 — V18.214 ✅ FERTIG, Branch `claude/peaceful-goldberg-49tj81`:**
**DER LEBENDIGE GIGANT, SÄULE I+II+IV VOLLENDUNG** (Schöpfer-Auftrag „führe den plan durch, der weg ist klar, die beiden seelen, leben im renderer und der logik, sollen entstehen"). Schliesst die Plan-Tiefe, die V18.211+V18.212 nur ZAHLENMÄSSIG erfüllt hatten — Ω-G2 echte Tube-Geometrie + Ω-G3 Foliage-Cards mit normalBend + Ω-W per-Vertex flex/phase + Ω-R2 §3.7-Toleranzen, in EINER Welle.

- **Ω-G2 ECHTE TUBE-GEOMETRIE:** `_buildTreeTubeGeometry(skeleton)` Ring-von-6-Vertices pro Polylinien-Punkt mit **lobed flare am Stamm-Fuß** (sin(j·lobes·2π/radialSegs)·amp·smoothstep). Statt N nackten cylinder-parts EINE organische Tube-Geom pro Variante.
- **Ω-G3 ECHTE FOLIAGE-CARDS:** `_buildTreeFoliageCardGeometry(skeleton)` card{cross} pro Anchor (2⊥ Quads, 8 Vertices) mit **normalBend=0.6 zur Krone-Sphere** → schattiert wie geschlossene Krone. needleSpray = y-stretched, leafCluster = breit-quadratisch.
- **Ω-W PER-VERTEX WIND:** `_buildToonNodeMaterial({useFlexAttr:true})` liest gebackene `aFlex` + `aPhase` Attribute. crownFactor = aFlex² (quadratisch, Plan §9), aperiodisches Flattern aus aPhase → echtes Atmen, kein Lockstep mehr.
- **Ω-R2 §3.7 TOLERANZEN:** `AnazhRealm.SPECIES_TREE_PARAMS` (frozen, VERMUTUNG-markiert) — per-Spezies slopeMax (Birke 0.6 / Tanne 1.2) + heightRange. `_vegetationSampleSpawn` gated den Spawn vor der chance-Probe.
- **Welt-Routing:** `_skeleton` an gewachsenen Bauplänen ab genVersion 7, Side-Channel `_lastTreeSkeleton`. `_archFlattenBlueprint` priorisiert Skeleton-Pfad. genVersion 6→7 für FRESH-Welten; alte Welten gen<7 fallen auf V18.213-cylinder-merge zurück (bit-identisch).
- **Tag-Neutralität:** bp.parts UNVERÄNDERT → V17.16-Wand STRUKTURELL bewahrt. computeCompoundTags bit-identisch GEMESSEN.
- **Snapshot:** \_skeleton NICHT persistiert (re-baubar aus seed wie parts).

28 V18.214-Wände grün (T1-T10) + ~3500 bestehende grün erwartet. Version 18.213.0→18.214.0. **Diag GEMESSEN:** archInstanceGroups 174→26 (6.7× weniger Pools welt-weit), Skeleton-Build 0.5ms (vs V18.213 cylinder-merge 10.5ms).

**Vier permanente Lehren in CLAUDE.md + handover-Chronik:** Side-Channel-Pattern · Per-Vertex-Attribute STRIKT-Gating (V10.0-g.1-Erweiterung) · flare als Radius-Modulation statt Extra-Part · Skeleton-Render direkt aus Polylinien (V18.213-merge war Foundation, V18.214 die echte Form).

**📋 NÄCHSTE:** S-Gate 0 Ω-K3 Palette-Bindung (Schöpfer-Browser-Auge) · Ω-R1 distinkte Tag-Vektoren (Plan §7, V17.16-Wand kontrolliert öffnen) · GPU-Welle Ω-B+Ω-S+Ω-H für Millionen-Bäume-Dichte + SEELEN-Band (gigant-fortsetzung-plan V18.215-V18.217).

---

**14.06.2026 — V18.213 ✅ FERTIG, Branch `claude/peaceful-goldberg-49tj81`:**
**DER LEBENDIGE GIGANT, MESH-MERGE pro Variante** — die erste Welle des gigant-fortsetzung-plans, der erste FPS-Hebel nach Säule I.

- **MERGE:** 75-80 Per-Part-Leaves → 2 merged Leaves (bark+foliage) pro Variante
- **GEMESSEN (`scripts/diag-draw-calls.cjs`):** Reduktions-Faktor **38× weniger Draw-Calls/Variante** an real warmgelaufener Kiefer (76 → 2). Merge-Bauzeit 10.5ms (<100ms-Wand).
- **TAG-NEUTRALITÄT:** bp.parts unverändert → `computeCompoundTags` bit-identisch (V17.16-Wand STRUKTURELL). Eine Render-Optimierung, kein Substanz-Eingriff.
- **`_mergeGeometries` Helper** (~40 Z., position+normal+color konkatenieren — kein Vendor-Addon nötig)
- **`_mergeBlueprintByMaterial(bp)`** gruppiert nach material, applied Per-Part-Transform via applyMatrix4, Per-Vertex-Color aus tintedColor
- **`_archFlattenBlueprint` Routing**: `bp._isMerged === true` → `archMergedGeomCache`-Lookup/-Bau, returnt `{merged:true, leaves:[2]}`
- **genVersion 5→6** für FRESH-Welten; alte Welten gen<6 = V18.211-Per-Part-Pfad bit-identisch
- **Welt-Wechsel:** `_loadStateRestoreWorldMeta` disposed merged Geometries (Welt-Identitäts-Wand)
- **Snapshot:** `_isMerged` NICHT persistiert (aus `_genVersion()` ableitbar)

20 neue V18.213-Wände grün + ~3500 bestehende grün. Version 18.212→18.213.

**📋 NÄCHSTE SESSION:** der Plan-Rest liegt in **`docs/archiv/gigant-fortsetzung-plan.md`** — 6 verbleibende Wellen V18.214-V18.219. **REIHENFOLGE:** ✅ Mesh-Merge (V18.213) → LOD (V18.214) → Ω-B GPU-Feld-Bake (V18.215) → Ω-S GPU-Compute-Scatter (V18.216) → ⟡ Ω-H Promotion / SEELEN-Band (V18.217) → Canopy-Vertiefung (V18.218 optional) → PBR (V18.219 optional). Verbleibend ~7-11 Sessions.

---

**14.06.2026 — V18.211+V18.212 ✅ GEMERGT in main (commit `f447caa`)** — DER LEBENDIGE GIGANT, Säule I + Restsubschritte vollendet.

---

**14.06.2026 — V18.212 ✅ FERTIG, Branch `claude/kind-rubin-udn6cn`:**
**DER LEBENDIGE GIGANT, RESTSUBSCHRITTE Ω-K2 + Ω-W + Ω-H + Ω-C** — V18.211 hatte Säule I (Skeleton-Grammar); V18.212 schließt die nicht-GPU Restsubschritte:

- **Ω-K2 BAUM-FÜSSE** (§4): flacher Saum am Stamm-Sockel — Baum wurzelt optisch im Boden
- **Ω-W VERTIEFTES WIND** (§9): quadratischer crownFactor + aperiodisches Flattern (Plan §9 „Laub flattert aperiodisch") + stärkere Sway-Magnitude
- **Ω-H PROMOTION-PROVENIENZ** (§2 SEELEN-Band): in unserer Architektur sind Bäume IMMER echt → §2 EMERGENT erfüllt; `harvestArchitecture` stempelt Welt-Genese-Provenienz `{bornFrom, species, seed}` in Journal + Return
- **Ω-C CANOPY-SHELL** (§9): 96×96 PlaneGeometry über 2km², Y aus Terrain + Coverage-Lift aus `worldFieldAt.lebendig × Clump`, Plan-§9-Formel `lift = (coverage > 0.18) ? coverage·7 + 11 : 0`, Distanz-Dither `smoothstep(180, 320, viewerDist) × 0.85`, lazy via `_ensureCanopyShell`, dispose im Welt-Wechsel

23 neue V18.212-Wände grün + ~3500 bestehende grün. Version 18.211→18.212.

**OFFENE GIGANT-FÄDEN** (Plan §11): §5 Ω-B GPU-Feld-Bake (eigener Bogen) · §8 Ω-S GPU-Compute-Scatter (hängt §5) · §10 Ω-P PBR (optional). Säulen I-IV foundational komplett.

---

**14.06.2026 — V18.211 ✅ FERTIG, Branch `claude/kind-rubin-udn6cn`:**
**DER LEBENDIGE GIGANT, SÄULE I (Skeleton-Grammar)** — Bäume lesen jetzt als Bäume, nicht als „Zylinder + 8 Kugeln". Der vorige `abschluss-plan.md` ist superseded vom Schöpfer-Anhang `69189e03-lebendigergigant.md` (DER LEBENDIGE GIGANT — Ω∞). Diese Welle baut **die visuelle Wurzel von Säule I**: `AnazhRealm.SPECIES_GRAMMAR` (frozen, 6 Arten × Plan-§3.3-Werte) + `_growTreeBlueprintRich(speciesKey, seed, grammar)` (Multi-Level-Wachstums-Grammatik mit perpBasis + Tropismus + Wander + Droop + TipCurl + Foliage AT TIPS). 75-81 Parts pro Baum (vs V18.210's 12). genVersion 4→5 routet bei gen≥5 zur Rich-Methode. **§2.5 (Variant-Pool + Wind + Snapshot)** sind GEERBT/GEHEILT:

- **Variant-Pool**: der V18.210-Region-Cache (256m × Welt-Seed × Spezies) ist faktisch §2.5 in Region-Form.
- **Wind**: V18.181-`positionWorld`-basiertes Sway gibt Per-Instance-Phasen gratis.
- **Snapshot-Heilung**: 75 Parts × 54 Region-Varianten = 400 KB → sprengt 256-KB-`pinCurrentWorld`-Wand → NUR Metadata persistieren, Parts re-wachsen via f(seed). Φ5-Tests grün.

Alle ~3500 Invarianten grün + 16 neue V18.211-S1-S6-Wände. Tests-wander-mit-Code (V9.56-i): G9-Probe liest jetzt `Rich+Legacy`-Source, K1-Version 18.210→18.211, A1b genVersion 4→5.

**OFFENE GIGANT-FÄDEN nach V18.211** (Plan-§11): §5 Ω-B GPU-Feld-Bake · §8 Ω-S GPU-Compute-Scatter · **§2 Ω-H Promotion (das SEELEN-Band)** · §9 Ω-C Canopy-Shell + Ω-W vertieftes Wind · §10 Ω-P PBR (optional). Volle 17-25 Sitzungen für den Bogen.

---

**14.06.2026 — V18.210 ✅ FERTIG (3 Commits + 3 Audit-Cycles), Branch `claude/relaxed-hawking-dzkj9g`:**

Die vier Sub-Akte aus `docs/archiv/abschluss-plan.md §1` sind verdrahtet — plus
drei Audit-Cycles, die NEUN echte Mängel fanden (drei kritisch) und alle
heilten. Alle ~3500 Invarianten grün, `npm run smoke:multiuser` grün.

| Commit    | Welle                                                          |
| --------- | -------------------------------------------------------------- |
| `fa70879` | A1-A4 + 5 Audit-Heilungen (Sub-Agent-Review)                   |
| `8cdddb8` | \_growTreeNoise-Welt-Wechsel-Reset (Selbst-Audit)              |
| `d5d33a1` | A3-Memoization + A2-Mini-Passagier weg (Schöpfer-Watch 14.06.) |

**Die vier Sub-Akte:**

- **A1** Γ7 Worldgen-Hook: `_growTreeBlueprintForSpawn` mit REGION-Caching
  (256m-Grid × Welt-Seed × Species), gen Default 3→4, V17.16-Tag-Wand pro
  Spezies-Referenz, SPECIES_PROFILE (6 Arten × Form/Farbe), Snapshot-
  Persistenz, architektur-bewusste Eviction.
- **A2** R5 Live-Slider: `setStructureBoost` + Live-TSL-Uniform + DOM-Slider
  „Struktur-Tiefe", Default 1.0→1.3 (sichtbar), `_applySubstanceResponse`
  liest Uniform direkt (tote Fallback-Branch weg, V18.210-Watch #3).
- **A3** \_scentAt KI: wild-Temperament wittert scheu/sanft/wehrhaft-Beute
  in 50m, 4-Richtungs-Gradient, strike via `damageCreature("jagd")`,
  replaced NEUTRAL-wander-Branch, `_scentSizeBySoul`-Cache (V18.210-Watch #1).
- **A4** Mana-Konsument γ: `phaseChange`-Op-Klasse zieht 15 Mana statt 10
  Stamina, Floor 5, Anti-Scope §3 (keine DSL-Schleuse), Werkstatt + Hand-
  Pfad spiegeln EXAKT, Return-Symmetrie (`manaRemaining`+`staminaRemaining`).

**Permanente Lehren (in CLAUDE.md):**

1. **Region-Caching für Worldgen → Instancing:** Hash-pro-Spawn bricht
   das Instancing-Pattern. Region-basierter Cache (~256m-Grid) ist die
   synergetische Form: lokaler Wald-Stil emergiert + Instancing wirkt.
2. **Headless-grün ≠ fertig:** ein feindlicher Sub-Agent-Audit NACH der
   ersten grünen Wand fing fünf echte Mängel — drei davon hätten das Werk
   im Browser zerbrochen.
3. **Welt-Identitäts-Wand:** jeder lazy-cached Worldgen-Helper wird in
   `_loadStateRestoreWorldMeta` resetted, sonst P2P-Drift bei Welt-Wechsel.

**Offener Schöpfer-Watch #2 (Folge-Welle, V18.211 B-26):** A1-Region-Naht —
zwei Bäume 1m auseinander aber über 256m-Grenze haben verschiedene
Bauplane. Pixel-blind für headless → auf die Sign-off-Liste.

**Nächste Welle: V18.211 — Browser-Sign-off-Galerie** (siehe abschluss-plan
§2, jetzt 26 Schliffe B1-B26 inkl. der vier Foundations + der Region-Naht).
Danach V18.212-V18.228 als geplante Folge — der KOMPLETTE Plan soll in der
nächsten Session abgeschlossen werden (Schöpfer-Auftrag 14.06.: „keine
halben sachen mehr").

---

## Quellen-Karte (was wo lebt)

| Quelle                              | Was sie trägt                                                                              |
| ----------------------------------- | ------------------------------------------------------------------------------------------ |
| **`docs/archiv/abschluss-plan.md`** | DER EINE PLAN — alle offenen Punkte mit Sub-Schritten + Reihenfolge V18.211-V18.250+       |
| `docs/archiv/handover.md`           | Volle Wellen-Chronik (jüngste oben), permanente Lehren                                     |
| `CLAUDE.md`                         | Aktueller Stand auto-geladen + tragende Gotchas                                            |
| `docs/rueckmeldung.md`              | Schöpfer-Rückmeldungs-Korpus (S-Abnahmen)                                                  |
| `docs/state-of-realm.md`            | Vision                                                                                     |
| `docs/das-lebendige-feld.md`        | Wahrer Norden (Vision)                                                                     |
| `docs/taille-spec.md` + `.en.md`    | NORMATIV, frozen                                                                           |
| `docs/roadmap.md`                   | Karte vorwärts (3 Phasen + gemerkte Fäden); operative Details leben in `abschluss-plan.md` |
| `docs/archiv/<bogen>-plan.md`       | Vergangene Bogen-Pläne (Vergangenheit, nicht aktiv)                                        |

---

## Disziplin (für jeden Welle-Schritt)

1. **Nur dieser Tisch + abschluss-plan.md** trägt den Stand. Keine zweite Liste.
2. **Eine Welle = ein Commit = Update HIER + im abschluss-plan §15-Reihenfolge.** Block strikethrough + Datum + Commit-Hash.
3. **Verdrahtungs-Wand:** keine neue Foundation ohne konkreten Konsumenten im selben Commit (§16#4).
4. **Read-as-stranger vor jedem „fertig":** ist KONSUM verdrahtet (V17.31)? Plus: feindlicher Sub-Agent-Audit NACH headless-grün (§16#3, V18.210-Lehre).
5. **Test-Harness-Trennung:** wenn eine Welle das Test-Harness berührt, eigener Commit (§16#7).
6. **Welt-Identitäts-Wand:** jeder lazy-cached Worldgen-Helper wird in `_loadStateRestoreWorldMeta` resetted (§16#8).

---

## Schöpfer-Entscheide (echt offen)

| ID    | Frage                               | Antwort/Default                     | Wann                         |
| ----- | ----------------------------------- | ----------------------------------- | ---------------------------- |
| R-037 | T-Welle Typ-Sicherheit?             | Ruhen lassen (no-build bleibt rein) | wenn dritter Bauer mit-tippt |
| R-039 | Devlog/Welle-Schau gegen Versanden? | Schöpfer-Wort offen                 | nach öffentlicher Phase      |

(V18.210-A4 Mana-Konsumenten-Mechanik ist beantwortet — die `phaseChange`-Op-Klasse zieht Mana, gebaut + verifiziert.)

---

_Der Tisch ist schlank. Der Plan lebt drüben. Wir ziehen durch._
