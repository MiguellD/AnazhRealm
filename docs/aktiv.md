# DER AKTIVE TISCH — schlank, der eine Plan liegt anderswo

> **Auftrag Schöpfer 14.06.2026:** „Bringe einen plan zusammen, der alle offenen
> punkte aufnimmt … wieder einheit erzeugt. Keine pausen, kein zögern mehr."
>
> **DIESES FILE TRÄGT NICHTS MEHR ALS DEN VERWEIS.** Der eine Plan mit allen
> offenen Punkten, Sub-Schritten, Reihenfolge: **`docs/abschluss-plan.md`**.
> Hier nur: aktuelle Welle + Stand.

---

## Stand (jüngste oben)

**14.06.2026 — V18.214 ✅ FERTIG, Branch `claude/peaceful-goldberg-49tj81`:**
**DER LEBENDIGE GIGANT, SÄULE I+II+IV VOLLENDUNG** (Schöpfer-Auftrag „führe den plan durch, der weg ist klar, die beiden seelen, leben im renderer und der logik, sollen entstehen"). Schliesst die Plan-Tiefe, die V18.211+V18.212 nur ZAHLENMÄSSIG erfüllt hatten — Ω-G2 echte Tube-Geometrie + Ω-G3 Foliage-Cards mit normalBend + Ω-W per-Vertex flex/phase + Ω-R2 §3.7-Toleranzen, in EINER Welle.

- **Ω-G2 ECHTE TUBE-GEOMETRIE:** `_buildTreeTubeGeometry(skeleton)` Ring-von-6-Vertices pro Polylinien-Punkt mit **lobed flare am Stamm-Fuß** (sin(j·lobes·2π/radialSegs)·amp·smoothstep). Statt N nackten cylinder-parts EINE organische Tube-Geom pro Variante.
- **Ω-G3 ECHTE FOLIAGE-CARDS:** `_buildTreeFoliageCardGeometry(skeleton)` card{cross} pro Anchor (2⊥ Quads, 8 Vertices) mit **normalBend=0.6 zur Krone-Sphere** → schattiert wie geschlossene Krone. needleSpray = y-stretched, leafCluster = breit-quadratisch.
- **Ω-W PER-VERTEX WIND:** `_buildToonNodeMaterial({useFlexAttr:true})` liest gebackene `aFlex` + `aPhase` Attribute. crownFactor = aFlex² (quadratisch, Plan §9), aperiodisches Flattern aus aPhase → echtes Atmen, kein Lockstep mehr.
- **Ω-R2 §3.7 TOLERANZEN:** `AnazhRealm.SPECIES_TREE_PARAMS` (frozen, VERMUTUNG-markiert) — per-Spezies slopeMax (Birke 0.6 / Tanne 1.2) + heightRange. `_vegetationSampleSpawn` gated den Spawn vor der chance-Probe.
- **Welt-Routing:** `_skeleton` an gewachsenen Bauplänen ab genVersion 7, Side-Channel `_lastTreeSkeleton`. `_archFlattenBlueprint` priorisiert Skeleton-Pfad. genVersion 6→7 für FRESH-Welten; alte Welten gen<7 fallen auf V18.213-cylinder-merge zurück (bit-identisch).
- **Tag-Neutralität:** bp.parts UNVERÄNDERT → V17.16-Wand STRUKTURELL bewahrt. computeCompoundTags bit-identisch GEMESSEN.
- **Snapshot:** _skeleton NICHT persistiert (re-baubar aus seed wie parts).

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

**📋 NÄCHSTE SESSION:** der Plan-Rest liegt in **`docs/gigant-fortsetzung-plan.md`** — 6 verbleibende Wellen V18.214-V18.219. **REIHENFOLGE:** ✅ Mesh-Merge (V18.213) → LOD (V18.214) → Ω-B GPU-Feld-Bake (V18.215) → Ω-S GPU-Compute-Scatter (V18.216) → ⟡ Ω-H Promotion / SEELEN-Band (V18.217) → Canopy-Vertiefung (V18.218 optional) → PBR (V18.219 optional). Verbleibend ~7-11 Sessions.

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

Die vier Sub-Akte aus `docs/abschluss-plan.md §1` sind verdrahtet — plus
drei Audit-Cycles, die NEUN echte Mängel fanden (drei kritisch) und alle
heilten. Alle ~3500 Invarianten grün, `npm run smoke:multiuser` grün.

| Commit | Welle |
|---|---|
| `fa70879` | A1-A4 + 5 Audit-Heilungen (Sub-Agent-Review) |
| `8cdddb8` | _growTreeNoise-Welt-Wechsel-Reset (Selbst-Audit) |
| `d5d33a1` | A3-Memoization + A2-Mini-Passagier weg (Schöpfer-Watch 14.06.) |

**Die vier Sub-Akte:**
- **A1** Γ7 Worldgen-Hook: `_growTreeBlueprintForSpawn` mit REGION-Caching
  (256m-Grid × Welt-Seed × Species), gen Default 3→4, V17.16-Tag-Wand pro
  Spezies-Referenz, SPECIES_PROFILE (6 Arten × Form/Farbe), Snapshot-
  Persistenz, architektur-bewusste Eviction.
- **A2** R5 Live-Slider: `setStructureBoost` + Live-TSL-Uniform + DOM-Slider
  „Struktur-Tiefe", Default 1.0→1.3 (sichtbar), `_applySubstanceResponse`
  liest Uniform direkt (tote Fallback-Branch weg, V18.210-Watch #3).
- **A3** _scentAt KI: wild-Temperament wittert scheu/sanft/wehrhaft-Beute
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

| Quelle | Was sie trägt |
|---|---|
| **`docs/abschluss-plan.md`** | DER EINE PLAN — alle offenen Punkte mit Sub-Schritten + Reihenfolge V18.211-V18.250+ |
| `docs/archiv/handover.md` | Volle Wellen-Chronik (jüngste oben), permanente Lehren |
| `CLAUDE.md` | Aktueller Stand auto-geladen + tragende Gotchas |
| `docs/rueckmeldung.md` | Schöpfer-Rückmeldungs-Korpus (S-Abnahmen) |
| `docs/state-of-realm.md` | Vision |
| `docs/das-lebendige-feld.md` | Wahrer Norden (Vision) |
| `docs/taille-spec.md` + `.en.md` | NORMATIV, frozen |
| `docs/roadmap.md` | Karte vorwärts (3 Phasen + gemerkte Fäden); operative Details leben in `abschluss-plan.md` |
| `docs/archiv/<bogen>-plan.md` | Vergangene Bogen-Pläne (Vergangenheit, nicht aktiv) |

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

| ID | Frage | Antwort/Default | Wann |
|---|---|---|---|
| R-037 | T-Welle Typ-Sicherheit? | Ruhen lassen (no-build bleibt rein) | wenn dritter Bauer mit-tippt |
| R-039 | Devlog/Welle-Schau gegen Versanden? | Schöpfer-Wort offen | nach öffentlicher Phase |

(V18.210-A4 Mana-Konsumenten-Mechanik ist beantwortet — die `phaseChange`-Op-Klasse zieht Mana, gebaut + verifiziert.)

---

_Der Tisch ist schlank. Der Plan lebt drüben. Wir ziehen durch._
