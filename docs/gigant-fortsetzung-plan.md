# DER LEBENDIGE GIGANT — VOLLENDUNG (Stand nach V18.218)

> Sauberes Preplanning für die nächste Session. Die offenen Punkte aus dem
> lebendiger-gigant-Plan be15a050, in voller Tiefe — Mechanik · Sub-Schritte ·
> Code-Anker · Worker-Mirror · Snapshot · Welt-Wechsel-Reset · Tests · Risiken ·
> Akzeptanz · Abhängigkeiten. Effiziente Gruppierung. Querschnitt-Disziplinen am
> Ende. KEINE Abkürzungen mehr.
>
> **Schöpfer-Auftrag (14.06.2026, nach V18.215 + Reflexion):** „plane für die
> nächste session, aktualisiere den plan, was noch offen, damit in der
> nächsten session effektiv fertig, die volle tiefe, die subschritte, nichts
> mehr kürzen, die wahre tiefe."
>
> **STAND 14.06.2026 nach V18.216-V18.218 (drei Wellen in dieser Session):**
> §1 KARST + Büsche/Understory ✅ · §2 Varianten-Pool ✅ · §3 LOD-Stufen
> FOUNDATION ✅ (Activation §3.6.1 OPT-IN für V18.218.1 nach Browser-Audit).
> NÄCHSTE WELLE: §4 V18.219 GPU-Feld-Bake — Voraussetzung der §5 GPU-Compute-
> Scatter + §6 VOLLE Promotion (das HERZ). Diese Wellen brauchen Three.js'
> WebGPU-Backend → echte GPU-Hardware für die Pixel-Wahrheit (headless
> swiftshader fällt zurück auf WebGL2, V10.0-h.b-Lehre). Headless beweist
> die Foundation; der Schöpfer-Browser beweist den Look.

---

## §0 — STATUS-MATRIX (ehrlich, GEMESSEN)

### Was GEBAUT ist (V18.211-V18.215)

| Plan-Punkt | Welle | Tiefe | Bemerkung |
|---|---|---|---|
| Ω-G1 Skeleton-Kern | V18.211 | ✅ voll | rich grammar, 75-81 parts |
| Ω-G2 Tube-Meshing | V18.214 | ✅ voll | Ring-of-6 + lobed flare |
| Ω-G3 Laub-Cards | V18.214 | ✅ voll | card{cross} + normalBend |
| Ω-K2 Baum-Füße | V18.212 | ✅ voll | Wurzelanlauf-Saum |
| Ω-K3 Palette | V18.215 | ✅ voll | holz/laub dunkler + erdiger |
| Ω-R1 distinkte Tags | V18.215 | ✅ voll | SPECIES_TAG_VARIATION + V17.16-VARIATIONS-Wand |
| Ω-R2 Slope+Höhe | V18.214 | ✅ voll | SPECIES_TREE_PARAMS §3.7 |
| Ω-W per-Vertex Wind | V18.214 | ✅ voll | aFlex/aPhase Attribute |
| Ω-C Canopy-Shell | V18.212 | 🟡 basic | statisch 96×96 — chunk-streaming offen |

### Was OFFEN ist (sortiert nach Abhängigkeit)

| Plan-§ | Welle | Tiefe | Aufwand |
|---|---|---|---|
| §3.3 KARST-Spezies | V18.216 §1 | ✅ V18.216 | klein |
| §3.5+§8.2 Büsche/Understory-Bauplane (Hazel/Farn/Blume) | V18.216 §2 | ✅ V18.216 | mittel |
| §2.5 + §6 Varianten-Pool (N + variantSeed[]) | V18.217 | ✅ V18.217 | mittel — Voraussetzung Ω-H |
| §3.6 + §6 LOD-Stufen (3 LODs) | V18.218 Foundation | ✅ V18.218 (Activation pending) | mittel |
| LOD-Activation: per-frame switch + re-allocation + cross-fade | V18.218.1 | ❌ — Schöpfer-Browser-Audit | klein |
| §5 Ω-B GPU-Feld-Bake | V18.219 | ❌ — braucht WebGPU | groß — Voraussetzung §8 |
| §8 Ω-S GPU-Compute-Scatter (3 Schichten) | V18.220 | ❌ — braucht WebGPU | groß — Caps 600k+700k+1.5M |
| §2 Ω-H VOLLE Promotion-Mechanik | V18.221 | ❌ — hängt an §8 | mittel — das HERZ |
| §9 Canopy chunk-streaming Vertiefung | V18.222 | ❌ | klein |
| §10 Ω-P PBR-Kohärenz | V18.223 | ❌ — S-Gate 4 | groß — S-Gate 4 |

**Sessions-Schätzung Rest: 6-10 Sessions** (3 von 8-13 bereits geleistet).

### Stand 14.06.2026 — gebaut in dieser Session

**V18.216 — KARST + Büsche/Understory (§1 GEBAUT):**
- baum_karst: Plan §3.3 gnarled Klippen-Baum, slopeMax 1.6, drei Ast-Ebenen,
  L3-Anchor-Krone, dichte+0.10 lebendig-0.05 Variation
- busch_hazel/farn_busch/blume_gross: drei Bush-Bauplane als eigene
  SPECIES_GRAMMAR (kein „kleiner Baum"-Hack). Farn ohne L2 (fronds direkt
  aus der Basis), Blume mit rotem foliage (Variation in Spezies-Optik)
- Bush-Sub-Spawn-Strategie (b): wenn Baum-probe fail → Substanz-Wahl
  feuchte/lebendig → Busch am selben Slot
- 44 Wände in checkBandV18216KarstUndUnderstory

**V18.217 — Varianten-Pool (§2 GEBAUT):**
- VARIANTS_PER_SPECIES = 16 (Plan-Bereich 8-32)
- _generateVariantSeedPool(worldSeed): pure deterministisch
- _ensureVariantSeedPool(): lazy + Migration alter Welten
- _generateFreshWorldMeta: pinnt Pool sofort (Welt-Genese-Konstante)
- _growTreeBlueprintForSpawn neue Cache-Key-Form `grown_<species>_v<idx>`
- bp._variantIndex + bp._grownSeed = variantSeed (Voraussetzung Ω-H)
- 22 Wände in checkBandV18217VariantenPool, Snapshot-Größe 6.5 KB

**V18.218 — LOD-Stufen Foundation (§3 FOUNDATION GEBAUT):**
- AnazhRealm.LOD_DISTANCES frozen (80m/160m/10m Hysterese)
- _growTreeBlueprintRich(species, seed, grammar, opts) erweitert um opts.lod
- _buildVariantLODs(species, variantIndex) baut alle 3 LODs am exakten Key
- _chooseLODForDistance(distance, currentLOD) mit Hysterese
- LOD0 81 parts, LOD1 16, LOD2 7 (gemessen) — strict monoton
- 3 LOD-Bauplane teilen variantIndex + variantSeed → Form-Identität (Ω-H)
- compoundTags-Tag-Neutralität LOD0/1/2 (V17.16-Wand strukturell)
- Totholz LOD2: Snag bleibt Snag (keine synthetisierte Krone)
- 29 Wände in checkBandV18218LODStufen
- **Activation pending V18.218.1:** _tickArchitectureLOD + Re-Allokation +
  Cross-Fade brauchen Schöpfer-Browser-Audit (visueller LOD-Pop)

**Lehre der Session (zwei):**
1. **Test-Mutation aufräumen (V18.218-Bug):** der V18.217 Migration-Test
   mutierte worldMeta ohne Restore → Folge-Bands (V18.218) lasen vergifteten
   Pool, brachen die Welt-Identität. Heilung: savedMeta/finally-Restore.
   GELERNT: jeder Migration/Mutation-Test räumt selbst auf.
2. **Walk-with-code Floor (V18.217-Schärfung):** statt scharfer Versions-
   Zahlen (`A.VERSION === "X.Y.Z"`) prüfen historische Wände einen FLOOR
   (`A.VERSION ≥ X.Y.Z`). Ein Bump bricht keine alten Wände mehr.

### Kritische Abhängigkeitskette (Stand nach V18.218)

```
✅ V18.216 KARST + Büsche       — GEBAUT (CPU-only, orthogonal)
✅ V18.217 Varianten-Pool       — GEBAUT (Voraussetzung Ω-H steht)
✅ V18.218 LOD-Foundation       — GEBAUT (Bauplane + Chooser; Activation pending)
                                          ▼
                                  V18.218.1 LOD-Activation (Schöpfer-Browser-Audit)
                                          │
V18.219 Ω-B Feld-Bake ──────────────►───┤  (braucht WebGPU)
                                          │
                                          ▼  [S-Gate 1]
                                  V18.220 Ω-S Scatter (braucht WebGPU)
                                          │
                                          ▼  [S-Gate 2]
                                  V18.221 Ω-H Promotion (das HERZ)
                                          │
V18.222 Canopy-Streaming ──── orthogonal  │
V18.223 Ω-P PBR ──── S-Gate 4 Schöpfer-Entscheid (nach V18.221)
```

---

## §1 — V18.216: KARST + BÜSCHE/UNDERSTORY-BAUPLANE (Plan §3.3 + §3.5 + §8.2)

**Ziel:** die Plan-Spezies, die ich übergangen habe, einbauen — KARST (§3.3) als 6.+. Bäume + echte BUSCH-Bauplane (Hazel/Farn/Blume) als MITTEL-Schicht (Plan §3.5: „Understory unter Clump-Kronen, in Lücken, Rändern" — Plan §8.2 Schicht 2).

### Mechanik

**M1 — KARST-Spezies in SPECIES_GRAMMAR (Plan §3.3):**
```
baum_karst: {
  height: [3.5, 6.5],
  crown: "irregular",      // gnarled, twisted
  trunk: { segs: 6, wander: 0.16, taper: 0.55, baseR: 0.32 },
    // wander hoch (knorrig), taper aggressiv (Klippen-Form)
  L1: { density: 2.6, whorl: 0, childStart: 0.18, childEnd: 0.95,
        angleBase: 1.4, lenRatio: 0.35, droop: 0.35, tipCurl: 0.08,
        radRatio: 0.38 },
  L2: { density: 3.8, whorl: 0, childStart: 0.2, childEnd: 1.0,
        angleBase: 1.1, lenRatio: 0.28, droop: 0.4, tipCurl: 0.04,
        radRatio: 0.42 },
  L3: { density: 5.0, whorl: 0, childStart: 0.3, childEnd: 1.0,
        angleBase: 0.95, lenRatio: 0.22, droop: 0.45, tipCurl: 0.02,
        radRatio: 0.5 },
  foliage: { kind: "leafCluster", anchorLevel: 3, spacing: 0.055,
             clusterSize: [2, 4], color: 0x4a6230, size: 0.45 },
}
```

**M2 — SPECIES_TREE_PARAMS für karst:**
```
baum_karst: { flare: {amp:0.9, lobes:6}, slopeMax: 1.6, heightRange: [-30, 80] }
// slopeMax 1.6 — Plan §3.7: KARST klettert Klippen
// heightRange [-30, 80] — nicht zu hoch (Klippen-Zone)
```

**M3 — SPECIES_TAG_VARIATION für karst (Plan §7):**
```
baum_karst: { dichte: 0.10, lebendig: -0.05 } // hart, weniger saftig
```

**M4 — Büsche als EIGENE SPECIES_GRAMMAR-Entries (Plan §3.5):**
```
busch_hazel: {                  // Hazel — Haselnuss-Strauch
  height: [1.9, 2.9],           // Plan §3.5: „Hazel height[1.9,2.9]"
  crown: "dome",
  trunk: { segs: 3, wander: 0.05, taper: 0.5, baseR: 0.12 },
  L1: { density: 4.0, whorl: 0, childStart: 0.15, childEnd: 0.95,
        angleBase: 1.4, lenRatio: 0.4, droop: 0.25, radRatio: 0.45 },
  L2: { density: 5.0, whorl: 0, childStart: 0.25, childEnd: 1.0,
        angleBase: 1.0, lenRatio: 0.3, droop: 0.3, radRatio: 0.5 },
  foliage: { kind: "leafCluster", anchorLevel: 2, spacing: 0.08,
             clusterSize: [2, 4], color: 0x4a7d3a, size: 0.32 },
}

farn_busch: {                   // Farn-Cluster (mittelgross, ~1.5m)
  height: [1.0, 1.8],
  crown: "ellipsoid",
  trunk: { segs: 2, wander: 0.02, taper: 0.2, baseR: 0.06 },
  L1: { density: 6.0, whorl: 0, childStart: 0.0, childEnd: 0.98,
        angleBase: 1.5, lenRatio: 0.85, droop: 0.5, radRatio: 0.3 },
  // KEIN L2 → die fronds gehen direkt von der Basis aus
  foliage: { kind: "leafCluster", anchorLevel: 1, spacing: 0.12,
             clusterSize: [3, 5], color: 0x5a8a3a, size: 0.4 },
}

blume_gross: {                  // Stand-Blume (50-90cm)
  height: [0.5, 0.9],
  crown: "ellipsoid",
  trunk: { segs: 2, wander: 0.03, taper: 0.3, baseR: 0.025 },
  L1: { density: 3.0, whorl: 0, childStart: 0.7, childEnd: 1.0,
        angleBase: 0.6, lenRatio: 0.3, droop: 0.0, radRatio: 0.5 },
  foliage: { kind: "leafCluster", anchorLevel: 1, spacing: 0.06,
             clusterSize: [1, 2], color: 0xc04a4a, size: 0.18 },
                                              // ↑ rot — Variation in Spezies
}
```

**M5 — Bush-PARAMS + TAG-VARIATION:**
```
SPECIES_TREE_PARAMS:
  busch_hazel: { flare: {amp:0.2, lobes:3}, slopeMax: 0.9, heightRange: [-30, 90] }
  farn_busch:  { flare: {amp:0.0, lobes:0}, slopeMax: 0.5, heightRange: [-40, 60] }
  blume_gross: { flare: {amp:0.0, lobes:0}, slopeMax: 0.4, heightRange: [-30, 50] }

SPECIES_TAG_VARIATION:
  busch_hazel: { lebendig: 0.08, brennbar: 0.05 }      // saftig, brennbar
  farn_busch:  { lebendig: 0.12, magieleitung: 0.05 }  // sehr saftig, leicht magisch
  blume_gross: { lebendig: 0.15, magieleitung: 0.10 }  // hoch lebendig, magisch
```

**M6 — Spawn-Integration (Plan §8.2 Schicht 2):**
Im `_vegetationSampleSpawn`-candidates die Büsche ergänzen, ABER mit eigener Logik (Plan §8.2: „Understory unter Clump-Kronen, in Lücken, Rändern"). Drei Strategien:

(a) Als reguläre candidates mit niedriger BASE_RATE-Affinität (lebendig-affin, aber kleiner als Bäume).

(b) **Better:** SECOND-PASS nach dem Baum-Pass. Wenn isTree und probe FAIL → versuche Busch-Spawn an derselben Sample-Position (das ist EXAKT „in den Lücken, wo der Wald nicht steht").

(c) **Plan-konform:** drei separate Loop-Pässe (Plan §8.2):
   - Pass 1: Bäume (TREE_CELL 3.4m)
   - Pass 2: Büsche/Farne (UNDER_CELL 2.4m) — feineres Grid
   - Pass 3: Steine + Totholz (STONE_CELL 2.1m)

Empfehlung: Strategie (b) für V18.216 (minimal-invasiv), Strategie (c) ist GPU-Form (V18.220 Ω-S).

### Code-Anker
- `AnazhRealm.SPECIES_GRAMMAR` (Z. ~65796) — Erweiterung
- `AnazhRealm.SPECIES_TREE_PARAMS` (Z. ~66675) — Erweiterung
- `AnazhRealm.SPECIES_TAG_VARIATION` (Z. ~66735) — Erweiterung
- `_vegetationSampleSpawn` candidates (Z. ~52071) — Hinzufügung karst + Büsche
- `_growTreeBlueprintRich` — funktioniert unverändert (alle Spezies durch dieselbe Grammar)

### Worker-Mirror
NICHT nötig. SPECIES_*-Konstanten sind frozen Daten, kein Worker-Pfad.

### Snapshot-Persistenz
NICHT nötig (Bauplane re-wachsen aus seed). _grownSpecies-Feld trägt die Identität.

### Welt-Wechsel-Reset
Standard-Pfad: `archMergedGeomCache.clear()` in `_loadStateRestoreWorldMeta`.

### Tests V18.216 (~25 Wände in `checkBandV18216KarstUndUnderstory`)

**(A) KARST (5):**
- (K1) SPECIES_GRAMMAR.baum_karst existiert + foliage.anchorLevel=3
- (K2) SPECIES_TREE_PARAMS.baum_karst.slopeMax = 1.6 (klettert Klippen)
- (K3) SPECIES_TAG_VARIATION.baum_karst trägt dichte+0.10
- (K4) `_growTreeBlueprintForSpawn("baum_karst", seed)` produziert valide Bauplan (≥30 parts, skeleton.branches ≥ 3)
- (K5) karst-Spawn an steiler Klippe (slope 1.4) erlaubt; baum_eiche an gleicher Stelle abgelehnt

**(B) BÜSCHE (8):**
- (B1) busch_hazel/farn_busch/blume_gross in SPECIES_GRAMMAR
- (B2) busch_hazel.height = [1.9, 2.9] (Plan §3.5)
- (B3) farn_busch hat KEIN L2 (fronds direkt von der Basis)
- (B4) Jede Busch-Spezies hat SPECIES_TREE_PARAMS-Eintrag
- (B5) Jede Busch-Spezies hat SPECIES_TAG_VARIATION (lebendig+)
- (B6) Wachstum produziert valide Bauplane (≥10 parts)
- (B7) skeleton.anchors ≥ 3 (haben Cards, sind keine Snags)
- (B8) `_archFlattenBlueprint` baut Tubes+Cards (bark + foliage leaves)

**(C) Spawn-Integration (5):**
- (S1) candidates-Liste in `_vegetationSampleSpawn` enthält karst + 3 Büsche
- (S2) TREE_NAMES enthält karst (Wald-Mask-Boost) — Büsche NICHT (sind keine Bäume für Mask)
- (S3) Behavioral: in Wald-Region spawnt karst seltener als baum_tanne (slopeMax-Affinität)
- (S4) Behavioral: Bus-Sub-Spawn (Strategie b) feuert wenn Baum-probe fail
- (S5) keine Spawn-Burst-Spike (FPS-Wand grün via _enqueueVegetationSpawn)

**(D) Tag-Wand (3):**
- (T1) V17.16-VARIATIONS-Wand passt für karst (dichte+0.10 deklariert)
- (T2) V17.16-VARIATIONS-Wand passt für Büsche (lebendig+0.15 deklariert)
- (T3) Tag-Neutralität: bp.parts unverändert (gleicher MAX-Wert in raw)

**(E) Version + walk-with-code (4):**
- (V1) VERSION = "18.216.0"
- (V2) index.html?v=18.216.0
- (V3) package.json version
- (V4) FRESH-Welt genVersion = 9 (war 8)

### Risiken + Mitigations
- **Bush spawn-burst:** N+3 zusätzliche candidates pro Sample → +30% spawn-calls. Mitigation: Strategie (b) Second-Pass nur bei Baum-FAIL.
- **Tag-Wand-Drift:** Karst dichte+0.10 könnte mit baum_eiche-Referenz Δ überschreiten. Mitigation: V17.16-VARIATIONS-Wand erlaubt deklarierte Achse → ok.
- **Memory: zusätzliche Skeleton-Geometries:** 4 neue Spezies × N Varianten × 3 Leaves = ~12 zusätzliche InstancedMeshes welt-weit. Negligibel.

### Akzeptanz
- KARST spawnt an Klippen (slope 1.0-1.6), Büsche in flacheren Lücken
- 25 V18.216-Wände grün
- Tag-Neutralität bit-identisch
- Schöpfer-Browser-Auge: Wald hat jetzt Mittel-Schicht (Hazel + Farne) — atemberaubender Boden

### Abhängigkeiten
- KEINE (orthogonal zu allem). Kann sofort gebaut werden.

---

## §2 — V18.217: Ω-G4 VARIANTEN-POOL (N + gefrorenes variantSeed[], Plan §2.5)

**Ziel:** Plan §2.5 fordert EXPLIZIT „variantSeed[] ist gefrorene Konstante (Teil der Welt-Genese)". Heute haben wir Region-Cache — DAS IST NICHT die Plan-Form. Der Pool ist die VORAUSSETZUNG der Promotion (Ω-H §6): der echte Bauplan re-wächst MIT EXAKT diesem variantSeed → bit-genauer Geometrie-Match.

### Mechanik

**P1 — `state.worldMeta.variantSeed`-Feld (Welt-Genese-Konstante):**
```js
// In _generateFreshWorldMeta:
const seed = ...;
const variantSeed = []; // ein flacher Array von N×SpeziesCount Seeds
for (let s = 0; s < SPECIES_COUNT; s++) {
    for (let v = 0; v < VARIANTS_PER_SPECIES; v++) {
        variantSeed.push(`${seed}-${species}-var${v}`);
    }
}
return { ..., variantSeed };
```
PERSISTIERT im Snapshot (V18.193-Erbgut-Lehre: Welt-Identität).

**P2 — `VARIANTS_PER_SPECIES` Konstante (Plan §2.5: „N≈8-32 pro Spezies"):**
```js
AnazhRealm.VARIANTS_PER_SPECIES = 16;
```
Browser-justierbar; höher = mehr Vielfalt; niedriger = weniger Speicher.

**P3 — `_growVariantPool()` — am Welt-Start (oder lazy on demand):**
```js
// Pro Spezies × VARIANTS_PER_SPECIES → wachse den Bauplan mit
// variantSeed[i] als Hash-Seed. Cache als state.variantPool.
state.variantPool = new Map();  // "species:i" → bp (mit _skeleton)
```

**P4 — `_growTreeBlueprintForSpawn(species, regionSeed)` neu:**
```js
// 1. Region → variantIndex via Hash (regionSeed % VARIANTS_PER_SPECIES)
// 2. cache-key = `grown_${species}_v${variantIndex}`
// 3. Wenn cache hit → reuse
// 4. Wenn miss → wachse mit `variantSeed[species][variantIndex]`
// 5. Setze bp._variantIndex (für Ω-H Promotion-Lookup)
```

Damit: alle Bäume einer Region teilen dieselbe Variante; verschiedene Regionen verschiedene Varianten; aber das volle Pool ist DETERMINISTISCH gefroren.

**P5 — Snapshot-Persistierung von variantSeed:**
```js
// In buildStateSnapshot:
worldMeta: { ..., variantSeed: this.state.worldMeta.variantSeed }
// In _loadStateRestoreWorldMeta:
// die variantSeed-Liste wandert mit; alte Welten ohne Feld bekommen
// einen lazy-generated Pool aus dem seed
```

**P6 — Migration alter Welten:**
```js
if (!this.state.worldMeta.variantSeed) {
    this.state.worldMeta.variantSeed = this._generateVariantSeedPool();
}
```

### Code-Anker
- `_generateFreshWorldMeta` (Z. ~12244) — variantSeed initialisieren
- `_growTreeBlueprintForSpawn` (Z. ~43391) — Variant-Cache statt Region-Cache
- `buildStateSnapshot` (Z. ~30033) — variantSeed mitnehmen
- `_loadStateRestoreWorldMeta` (Z. ~34265) — variantSeed lesen + migrieren
- NEU: `_growVariantPool` Helper

### Worker-Mirror
NICHT nötig.

### Snapshot-Persistenz
JA: `worldMeta.variantSeed` Array (Plan §2.5: „gefrorene Konstante"). Größe: 7 Spezies × 16 Varianten × ~32 Bytes pro Seed-String = ~3.5 KB. Tragbar (Snapshot-Cap 256 KB).

### Welt-Wechsel-Reset
Standard-Pfad: `state.variantPool.clear()` + dispose Geometries.

### Tests V18.217 (~18 Wände in `checkBandV18217VariantPool`)

**(A) Source-Probes (5):**
- (P1) AnazhRealm.VARIANTS_PER_SPECIES Konstante
- (P2) `_growVariantPool` Helper existiert
- (P3) `_generateFreshWorldMeta` schreibt worldMeta.variantSeed
- (P4) `_growTreeBlueprintForSpawn` liest variantSeed-Pool
- (P5) buildStateSnapshot trägt variantSeed im worldMeta-Block

**(B) Behavioral (8):**
- (B1) Fresh-Welt-Meta hat variantSeed-Array mit N × SpeziesCount Einträgen
- (B2) Pro Spezies sind die N Varianten DETERMINISTISCH aus dem seed
- (B3) Zwei Regionen mit unterschiedlichem regionSeed bekommen unterschiedliche variantIndex
- (B4) Zwei Regionen mit identischem variantIndex teilen denselben Bauplan-Key
- (B5) variantPool-Größe ≤ 7 × 16 = 112 (bezahlbar)
- (B6) bp._variantIndex ist gesetzt (für Promotion-Lookup)
- (B7) Snapshot-Restore: variantSeed wird wiederhergestellt
- (B8) Migration: alte Welt ohne variantSeed bekommt einen lazy-Pool

**(C) P2P-Determinismus (3):**
- (C1) Zwei AnazhRealm-Instanzen mit identischem worldMeta.seed bauen IDENTISCHEN variantSeed-Pool
- (C2) Bauplan-Key derselben (species, regionSeed) ist identisch
- (C3) `_skeleton.totalH` identisch zwischen den Instanzen

**(D) Performance (2):**
- (D1) Pool-Bau <500ms (16 Spezies × 16 Varianten = 256 Wachstums-Akte, jedes ~2ms)
- (D2) Cache-Hit-Rate: nach 100 Spawns sollten ≤16 cache misses pro Spezies sein

### Risiken + Mitigations
- **Snapshot-Size:** variantSeed-Array könnte 3.5 KB + persistierte Snapshot-Bytes sprengen → klein, OK
- **Migration alter Welten:** Random vs deterministisch → migrate-Pfad nutzt seed-deterministisch
- **Memory-Pool-Cap:** 256 Bauplane × ~5KB skeleton = ~1.3 MB → bezahlbar

### Akzeptanz
- 18 V18.217-Wände grün
- P2P-Determinismus GEMESSEN (zwei Mocks identisch)
- variantPool persistiert Welt-Wechsel-sicher
- Browser-Auge: keine sichtbare Regression vs V18.215 (gleiche Geometrie, nur explizit gepoolt)

### Abhängigkeiten
- KEINE (selbst Voraussetzung für Ω-S + Ω-H)

---

## §3 — V18.218: Ω-G4 LOD-STUFEN (3 LODs pro Variante, Plan §3.6 + §6)

**Ziel:** Plan §3.6 + §6: drei LOD-Stufen pro Variante (LOD0 Hero / LOD1 Tubes-cap / LOD2 single card). Heute haben wir nur LOD0. Ferne Bäume rendern zu teuer.

### Mechanik

**L1 — `_growTreeBlueprintRich` erweitert um `lodLevel` Parameter:**
```js
_growTreeBlueprintRich(speciesKey, seed, grammar, opts) {
  const lod = (opts && opts.lod) || 0;
  // LOD0: volle Grammar (75-81 parts)
  // LOD1: cap maxLevel=1 → nur Stamm+L1 (~12 parts);
  //       foliage als 4 Card-Quads in Krone-Bbox
  // LOD2: cap maxLevel=0 → nur Stamm (~6 parts);
  //       foliage als 1 zentriertes Card-Quad
}
```

**L2 — `_buildVariantLODs(species, variantIndex)` baut alle 3 LODs:**
```js
// Pro Variante: 3 bps mit _lodLevel = 0/1/2
// Pro bp wird Tube+Cards gebaut mit reduzierter Anchor-Density
// state.variantPool["species:i:lodN"] → bp
```

**L3 — LOD-Switch im archInstanceGroupFor:**
```js
// archInstanceGroups Key wird: `name#bark_lod${L}` + `name#foliage_lod${L}`
// _archInstanceAdd wählt L basierend auf Distanz zum Spieler:
// dist < 80m → LOD0; 80-160m → LOD1; >160m → LOD2
```

**L4 — LOD-Hysterese (V8.49-Pattern):**
```js
const LOD_THRESHOLDS = [80, 160];
const LOD_HYSTERESIS = 10; // ±10m, kein flackern
```

**L5 — Per-Frame-Tick `_tickArchitectureLOD()`:**
```js
// Wenn Spieler > 5m bewegt: für jeden geladenen Eintrag prüfen,
// ob LOD-Wechsel nötig. Batch max 5 wechsel/frame.
```

**L6 — Re-Allokation bei LOD-Wechsel:**
```js
// entry.lodLevel = 1 → Entry-Slot aus LOD0-Pool freigeben,
// in LOD1-Pool neu allokieren. _archGroupFree + _archGroupAlloc.
```

**L7 — LOD2 → Canopy-Shell-Dither:**
```js
// An der LOD2-Distanz-Grenze (~180m) sollte Canopy-Shell sichtbar werden.
// Smoothstep-Crossfade in opacityNode der LOD2-Cards.
```

### Code-Anker
- `_growTreeBlueprintRich` (Z. ~43515) — lodLevel-Parameter
- `_buildTreeTubeGeometry` (Z. ~49422) — radialSegs reduzieren bei LOD>0
- `_buildTreeFoliageCardGeometry` (Z. ~49615) — Anchor-Reduktion bei LOD>0
- `_archInstanceGroupFor` (Z. ~49254) — LOD-Suffix im Key
- `_archInstanceAdd` (Z. ~49336) — LOD-Wahl bei Spawn
- NEU: `_tickArchitectureLOD` Helper

### Worker-Mirror
NICHT nötig.

### Snapshot-Persistenz
NICHT nötig (LODs sind render-only, re-baubar pro Variante).

### Welt-Wechsel-Reset
Standard-Pfad.

### Tests V18.218 (~16 Wände in `checkBandV18218LOD`)

**(A) Source (4):** _buildVariantLODs + _tickArchitectureLOD + LOD_THRESHOLDS + Hysterese
**(B) Geometrie (5):** LOD0 bark ≥ 1000 verts, LOD1 bark ≤ 500, LOD2 bark ≤ 200; foliage entsprechend
**(C) Pool-Routing (3):** archInstanceGroups hat LOD-suffixed Keys; 3 Pools pro Variante; ~280 Pools welt-weit
**(D) Behavioral (3):** Spieler bei 50m → LOD0; bei 150m → LOD2; Wechsel 80m→90m → kein Flackern (Hysterese)
**(E) Performance (1):** ferner Wald (LOD2) tri-count ≤ 10% des Nahbereichs

### Risiken + Mitigations
- **LOD-Pop sichtbar:** Cross-Fade Alpha-Blend in ±5m-Übergangszone (Plan §3.6 „LOD-Swap ohne Pop")
- **Re-Allokation-Spike:** wenn 50 Bäume gleichzeitig wechseln → Batch max 5/Frame

### Akzeptanz
- 16 V18.218-Wände grün
- Ferner Wald 100m+ rendert mit ≤10% Triangle-Count
- Schöpfer-Browser-Auge: keine LOD-Pop-Sprünge

### Abhängigkeiten
- V18.217 (Varianten-Pool) — die LOD-Pools nutzen den variantSeed-Pool

---

## §4 — V18.219: Ω-B GPU-FELD-BAKE (Plan §5, Voraussetzung §8)

**Ziel:** Welt-Felder GPU-seitig verfügbar machen, damit GPU-Compute-Scatter (V18.220) sie lesen kann. Plan §5 fordert: heightTex (r32float) + normalSlopeTex (rgba16f) + fieldsTex (rgba16f mit moisture/lebendig/glut/magieleitung) als StorageTextures pro Region. Edit-aktuell.

### Mechanik

**B1 — Pro Region-Bake-Pass `_bakeRegionFields(regX, regZ)`:**
```js
// Region = 256m × 256m (Chunk-Gruppe).
// Auflösung: 128×128 Texel → 2m pro Texel.
// Per Texel: 
//   heightTex[i] = _voxelSurfaceY(x, z)
//   normalSlopeTex[i] = vec4(normal.x, normal.y, normal.z, slope)
//     (normal via 4-Sample Cross-Differenz, slope = |∇h|)
//   fieldsTex[i] = vec4(moisture, lebendig, glut, magieleitung)
//     (worldFieldAt + _feuchteAt)
// Texturen als StorageTextures (Plan §5: Compute-Shader-lesbar).
```

**B2 — Region-Cache `state.bakedRegionTextures: Map<key, {height, normalSlope, fields}>`:**
- key = `${regX},${regZ}` (256m-Region)
- LRU-Eviction bei > 32 Regionen (256 KB pro Region × 32 = 8 MB GPU-Heap)

**B3 — Build-Trigger im `_tickVoxelChunkStreaming`:**
```js
// Wenn neue Region in Streaming-Ring kommt: queue ein Bake-Pass.
// Deferred (Plan §5: ~50ms/Region akzeptabel).
// Max 1 Region/Frame (FPS-Schutz).
```

**B4 — Edit-Update `_invalidateBakedRegion(regX, regZ)`:**
```js
// Voxel-Edit → markiere Region dirty → nächster Tick re-baked NUR den
// betroffenen Texel-Ausschnitt.
```

**B5 — TSL-Texture-Read (Vorbereitung für V18.220 Ω-S):**
```js
// In V18.220 wird der Compute-Kernel via TSL.texture()/textureSampleLevel()
// die heightTex/normalSlopeTex/fieldsTex auslesen. V18.219 stellt die
// Texturen als state.bakedRegionTextures bereit.
```

**B6 — CPU-Vergleichs-Wand:**
```js
// Probe-Test: bakedHeight an einer Sample-Position == CPU-_voxelSurfaceY
// (±0.5m Texel-Quantisierung-Toleranz)
```

### Code-Anker
- `_voxelSurfaceY` (Z. ~25302) — CPU-Höhen-Quelle
- `worldFieldAt` (Z. ~43614) — Feld-Quelle (lebendig/glut/magieleitung)
- `_feuchteAt` (Z. ~21130) — moisture-Quelle
- `_tickVoxelChunkStreaming` (Z. ~29109) — Streaming-Hook
- `_addVoxelEdit` — Edit-Hook
- NEU: `_bakeRegionFields(regX, regZ)`
- NEU: `_invalidateBakedRegion`
- NEU: `state.bakedRegionTextures` Map

### Worker-Mirror
NICHT nötig (GPU-only, kein Worker-Pfad). ABER: die WGSL-Mathematik im Compute-Shader MUSS mit CPU-Mathematik konsistent sein (V9.95-a-Lehre): bit-identisch für `+ - * /`, ±1e-4 Toleranz für `sin/cos/sqrt`.

### Snapshot-Persistenz
NICHT nötig (Texturen sind re-baubar). `state.bakedRegionTextures.clear()` beim Welt-Wechsel.

### Welt-Wechsel-Reset
Pflicht: alle baked Texturen disposen + Map.clear().

### Tests V18.219 (~20 Wände in `checkBandV18219FieldBake`)

**(A) Source (5):** `_bakeRegionFields` + `_invalidateBakedRegion` + `state.bakedRegionTextures` Map + Streaming-Hook + Welt-Wechsel-Reset
**(B) Texture-Build (4):** heightTex existiert, format r32float, 128×128, computeBoundingBox
**(C) CPU↔GPU Konsistenz (4):**
- bakedHeight(x,z) ≈ CPU-_voxelSurfaceY(x,z) ± 0.5m
- slope ≈ CPU-Sobel ± 0.05
- moisture ≈ _feuchteAt ± 0.05
- lebendig ≈ worldFieldAt.lebendig ± 0.05
**(D) Edit-Reaktivität (3):** voxelEdit → _invalidateBakedRegion → re-bake → bakedHeight aktualisiert
**(E) Performance (2):** Bake-Cost < 100ms pro Region (gemessen); Cap 1 Region/Frame
**(F) Compute-Shader-Lesbarkeit (2):** Test-Kernel liest Texturen + summiert (Sanity-Check)

### Risiken + Mitigations
- **mapAsync-Stall (V9.95-e-Lehre):** wir lesen NICHT zurück; Compute-Scatter (V18.220) liest direkt auf GPU. KEIN CPU-Roundtrip.
- **WGSL-Compile-Crash (V10.0-h.b-Lehre):** Pipeline als Diag-Kernel TEST-mässig zuerst. Format-Validation (r32float + rgba16f bestätigt mit Three.js' WebGPU-Backend).
- **GPU-vs-CPU-Drift:** Toleranz-Test (±0.5m, ±0.05), kein bit-identisch.
- **Memory-Cap:** 32 Regionen × 256 KB ≈ 8 MB GPU. Akzeptabel.

### Akzeptanz
- 20 V18.219-Wände grün
- StorageTextures im Compute-Test-Kernel lesbar (sum-test)
- Edit-Update funktioniert (Voxel-Edit → Region-Re-Bake)

### Abhängigkeiten
- KEINE (selbst Voraussetzung für Ω-S)

---

## §5 — V18.220: Ω-S GPU-COMPUTE-SCATTER (Plan §8, das DICHTE-Band)

**Ziel:** Plan §1 „die Million Bäume ist kein Datensatz — sie ist eine Funktion, ausgewertet on-the-fly auf der GPU". Compute-Kernel erzeugt pro Region drei jittered Child-Grids (Bäume + Understory + Steine), gated gegen die gebackenen Felder (V18.219). Output: `(variantIndex, transform)` pro Zelle in InstancedMesh-Buffer. **Plan §13 Dichte-Band: „≥hunderte Bäume + dichtes Understory (5 Schichten); FPS hält; deterministische Projektion (P2P-identisch)."**

### Mechanik

**S1 — Drei TSL-Compute-Kernels (Plan §8.2 drei Schichten):**

```js
// (a) _scatterTreesKernel: TREE_CELL=3.4m, Cap 600k
//     Input: bakedRegionTextures (V18.219) + variantSeed[] (V18.217)
//     Pro Zelle:
//       - jitter via pcg2d(cell + salt + "tree")
//       - sample fields aus bakedTextures
//       - gate: slope < tol_species, lebendig > floor, treeline
//       - if pass: variantIndex = pcg2d(cell) % N
//                  write to InstanceBuffer (per-Variant)

// (b) _scatterUnderstoryKernel: UNDER_CELL=2.4m, Cap 700k
//     Pro Zelle:
//       - gate: unter Clump-Krone (treesMask) ODER in Lücke ODER an Rand
//       - Spezies-Wahl: hazel/farn/blume basierend auf moisture+lebendig
//       - write to per-Variant Buffer

// (c) _scatterStonesKernel: STONE_CELL=2.1m, Cap 1.5M
//     Pro Zelle:
//       - gate: rockExposure > thresh ODER in Gap
//       - Spezies: stein_block/kristall_geode/totholz
//       - write to per-Variant Buffer
```

**S2 — Per-Variant InstancedMesh:**
```js
// Pro Variante (V18.217 LOD0) eine InstancedMesh.
// instanceMatrix kommt DIREKT aus Compute-Buffer (kein CPU-Roundtrip).
// instanceCount aus Compute-Indirect-Draw.
```

**S3 — Promotion-Lookup-Puffer (Vorbereitung für V18.221 Ω-H):**
```js
// Parallel zum Instance-Buffer: instanceId → {cell, variantIndex, species}
// Uint32Array oder 3-Komponent-Buffer.
// Beim Chunk-Pop einmal CPU-Readback (~1-2ms).
// state.scatterLookupBuffers: Map<chunkKey, Uint32Array>
```

**S4 — Per-Chunk-Promovierte-Zellen-Bitmask:**
```js
// Plan §2.5: GPU-Bitmask uint32[6] für 13×13=169 Zellen pro Chunk.
// Scatter-Kernel liest pro Chunk und überspringt promovierte Zellen.
// Wird gefüllt von V18.221 Ω-H.
```

**S5 — Mutabilität (Plan §8.3):**
```js
// Voxel-Edit → bakedRegion neu (V18.219 Ω-B3) → triggert Re-Scatter
// NUR des betroffenen Chunks (~160 Kandidaten, billig).
// Rest des Welt-Scatter bleibt.
```

**S6 — Cap-Wand:**
```js
const CAPS = { tree: 600_000, under: 700_000, stone: 1_500_000 };
// Bei Cap-Erreichen: globale Stop, kein neuer Spawn dieser Schicht.
// Per-Chunk-Anteil: cap / total_chunks_in_ring.
```

**S7 — Fallback bei WGSL-Crash (V10.0-h.b-Lehre):**
```js
// Wenn Compute-Pipeline-Compile fehlschlägt → fall back auf CPU-
// `_vegetationSampleSpawn`-Pfad. Defensive Wand.
```

### Code-Anker
- `_vegetationSampleSpawn` (Z. ~52047) — alter CPU-Pfad (BLEIBT als Fallback)
- `_growTreeBlueprintForSpawn` (Z. ~43391) — Variant-Pool-Lookup
- `_archInstanceGroupFor` (Z. ~49254) — HISM, wird vom Scatter-Buffer gefüttert
- Scatter-Densities (Plan §3.5): TREE_CELL=3.4 / UNDER_CELL=2.4 / STONE_CELL=2.1
- NEU: `_scatterTreesKernel`, `_scatterUnderstoryKernel`, `_scatterStonesKernel`
- NEU: `state.scatterLookupBuffers` Map (für Ω-H)
- NEU: `state.promotedCellsBitmask` Map (für Ω-H Suppression)

### Worker-Mirror
NICHT nötig (GPU-only).

### Snapshot-Persistenz
- `worldMeta.variantSeed` (~3.5 KB, schon V18.217)
- `state.promotedCells` Set pro Chunk (~6 uint32 = 24 Bytes pro Chunk)

### Welt-Wechsel-Reset
Alle Scatter-Buffers + Lookup-Buffers + Bitmasks disposen.

### Tests V18.220 (~30 Wände in `checkBandV18220ComputeScatter`)

**(A) Source (5):** drei Kernel-Helpers + Lookup-Puffer + Bitmask + Fallback-Path
**(B) Dichte (8):**
- Ein 9-Chunk-Ring zeigt ≥500 Bäume (vs ~30 CPU-Pfad, 16× mehr)
- ≥1000 Understory-Instanzen
- ≥2000 Stein/Totholz-Instanzen
- Per-Schicht-Cap nicht überschritten
- 5 Höhen-Schichten sichtbar (Plan §8.2)
**(C) Determinismus + P2P (4):**
- Zwei Mocks mit identischem worldMeta.seed sehen IDENTISCHE Scatter-Verteilung
- variantSeed bit-identisch persistiert
- pcg2d-Hash GPU-vs-CPU bit-identisch (Integer-Math)
**(D) Gating (4):**
- Slope-gating: steile Hänge (slope > 1.5) → ~0 Bäume, viele Steine
- Treeline: heightRange-out → keine Bäume
- Moisture: nasse Region → Farn-Cluster gedichtet
- rockExposure: felsige Region → kaum Bäume, viele Steine
**(E) Mutabilität (3):**
- voxelEdit → betroffener Chunk re-scattert
- Promovierte Zelle bleibt leer (gegen V18.221 Ω-H simuliert)
- Edit-Reaktivität < 50ms pro Chunk
**(F) Lookup-Buffer (3):**
- instanceId → (cell, variantIndex, species) lesbar nach Chunk-Pop
- Buffer-Size = anzahl-Instances × 12 Bytes
- Welt-Wechsel räumt Buffer
**(G) Performance (3):**
- Compute-Kernel-Build < 200ms
- Per-Chunk-Scatter < 30ms
- 9-Chunk-Ring < 500ms gesamt; FPS hält

### Risiken + Mitigations
- **WGSL-Compile-Crash (V10.0-h.b):** Diag-Kernel zuerst, dann inline. Format-Tests vorab.
- **InstanceBuffer-Cache (V10.0-g.1):** beim Region-Wechsel alten Buffer disposed.
- **GPU-Bitmask-Sync:** CPU schreibt → GPU-Upload pro Chunk-Promotion.
- **Determinismus-Drift:** NUR integer pcg2d (bit-identisch), keine transzendente Mathe im Hot-Path.
- **mapAsync-Stall (V9.95-e):** Readback NUR beim Chunk-Pop (selten), nicht per Frame.

### Akzeptanz
- 30 V18.220-Wände grün
- Ein dichter Wald-Chunk zeigt ≥hunderte Bäume, FPS hält (≥45 auf AMD-RDNA-3)
- Determinismus-Wand: P2P-Test grün
- Mutabilität: voxelEdit → Re-Scatter funktioniert
- **Plan §13 Dichte-Band ERFÜLLT**

### Abhängigkeiten
- V18.217 (Varianten-Pool) — variantSeed[] muss frozen sein
- V18.219 (Ω-B Feld-Bake) — bakedRegionTextures muss vorhanden sein

---

## §6 — V18.221: Ω-H VOLLE PROMOTION (das HERZ, Plan §2)

**Ziel:** Plan §13: „⟡ DAS SEELEN-BAND (Ω-H) — das wichtigste". Einen GPU-gescatterten Baum berühren → er wird ein echter Bauplan mit Provenienz, Tags, Resonanz, OHNE visuellen Sprung. Der Plan-Erfolg hängt VOLLSTÄNDIG an diesem Punkt — wenn ein berührter Baum tote Kulisse bleibt, ist alles andere irrelevant.

### Mechanik

**H1 — Raycast gegen Hero-LOD-HISM:**
```js
// _interactCrosshair (Z. ~53196):
// Raycast gegen LOD0-InstancedMeshes (Three.js' InstancedMesh.raycast + BVH).
// AnazhRealm hat BVH schon (V18.92). Nur Nah-Bäume (LOD0-Ring) sind
// berührbar — kein Raycast gegen Millionen.
```

**H2 — instanceId → (cell, variantIndex, species):**
```js
// V18.220 S3 lookup-Buffer:
// const lookup = state.scatterLookupBuffers.get(chunkKey);
// const {cell, variantIndex, species} = readLookup(lookup, instanceId);
```

**H3 — Echter Bauplan-Bau:**
```js
// variantSeed = worldMeta.variantSeed[species][variantIndex]
// const grownKey = `grown_${species}_v${variantIndex}`;
// Aus variantPool (V18.217) → bp bereits da (re-baubar via _growSkeleton).
// Transform aus pcg2d(cell) — bit-identisch zur GPU-Scatter-Transform.
// → spawnArchitecture(grownKey, transform, { silent: true });
```

**H4 — Provenienz-Stempel:**
```js
// entry.provenance = {
//   bornFrom: "world-genesis-cell",
//   species: species,
//   cell: { regX, regZ, cellX, cellZ },
//   variantIndex: variantIndex,
//   variantSeed: variantSeed,
// };
// V18.212-Pfad in harvestArchitecture liest das.
```

**H5 — Dekorative Instanz-Suppression:**
```js
// state.promotedCellsBitmask.get(chunkKey) |= (1 << cellBit);
// GPU-Upload des bitmask-Buffers (V18.220 S4).
// Nächster Scatter-Pass überspringt diese Zelle.
// Sofortige Bitmask-Aktualisierung (ohne Re-Scatter):
//   - Lösche die Instance aus InstancedMesh (setMatrixAt(slot, ZERO_MATRIX))
//   - mark Chunk dirty für nächsten Scatter-Tick
```

**H6 — P2P-Broadcast der Promotion:**
```js
// promotion ist ein Welt-Diff. Broadcasting via _dslComposeAtomic.
// Beim Empfang: deterministischer Spawn via cell + variantSeed.
```

**H7 — Snapshot-Persistierung:**
```js
// state.promotedCells: Map<chunkKey, Set<cellId>>
// Snapshot:
//   promotedCells: { [chunkKey]: [cellId, ...] }
// Restore:
//   reconstruct Map + bitmask upload
```

**H8 — Provenienz-Kette (V18.212-Erweiterung):**
```js
// Beim Ernten (V18.212 harvestArchitecture):
// Journal: „Birke (an Zelle 5,-2 aus Welt-Genese gewachsen) erntete → 5 Holz, 3 Laub"
// Return-Object trägt die volle Cell-Provenienz.
```

### Code-Anker
- `_interactCrosshair` / Touch-Pfad (Z. ~53196)
- `_growTreeBlueprintForSpawn` (Z. ~43391) — Variant-Pool-Lookup
- `spawnArchitecture` (Z. ~49528) — Bauplan-Spawn
- V18.212 Provenienz-Block (Z. ~53241+) — Journal-Schreiben
- `state.scatterLookupBuffers` (V18.220 S3)
- `state.promotedCellsBitmask` (V18.220 S4)
- NEU: `_promoteScatteredCell(chunkKey, cell, variantIndex, species)`
- NEU: `_uploadPromotedBitmask(chunkKey)`

### Worker-Mirror
NICHT nötig.

### Snapshot-Persistenz
JA — Per-Chunk-Promovierte-Set:
- `state.promotedCells: Map<chunkKey, Set<cellId>>`
- Im Snapshot: `promotedCells: { [chunkKey]: [cellId, ...] }`
- Restore: lesbar, GPU-Bitmask wird re-uploaded
- Größe: ~24 Bytes pro Cell × 1000 Cells = 24 KB max → akzeptabel

### Welt-Wechsel-Reset
`state.promotedCells.clear()` + bitmask-buffers disposen.

### Tests V18.221 (~25 Wände in `checkBandV18221Promotion`)

**(A) Source (4):** _promoteScatteredCell + Lookup-Buffer-Read + Bitmask-Upload + Snapshot-Persist
**(B) Touch → Real (5):**
- GPU-gescatterten Baum berühren → spawnArchitecture mit echtem Bauplan
- entry.provenance.bornFrom = "world-genesis-cell"
- entry.provenance.cell ist gesetzt
- entry.provenance.variantSeed ist gesetzt
- entry._grownSpecies ist gesetzt
**(C) Determinismus-Match (3):**
- Re-Wachsen aus variantSeed gibt IDENTISCHE skeleton-branches
- Geometry-Hash der promovierten Architektur == GPU-Variante
- Transform exakt: position + yaw + scale aus pcg2d(cell)
**(D) Suppression (4):**
- Promovierte Zelle bleibt leer im nächsten Scatter-Pass
- GPU-Bitmask-Upload erfolgreich
- Promotion-Set persistiert im Snapshot
- Restore re-uploads Bitmask
**(E) P2P (3):**
- Zwei Peers berühren dieselbe Zelle → identischer Bauplan
- Promotion ist ein Welt-Diff (broadcastbar)
- Promotion-Empfang: deterministischer Spawn
**(F) Provenienz-Ernte (3):**
- harvestArchitecture liest Cell-Provenienz
- Journal trägt Cell-ID + variantSeed
- Geernteter Holz-Stack trägt Provenienz
**(G) Visueller Match (Browser, headless approximierbar) (3):**
- Determinismus-Test: GPU-Geometry-Hash == CPU-Re-Wachsen-Hash (V18.220-S2 Variant-Geometry-Hash GEMESSEN identisch zum V18.221-spawnArchitecture-bp-Hash)

### Risiken + Mitigations
- **Visueller Sprung (KRITISCHSTES Risiko):** Re-Wachsen aus variantSeed MUSS bit-genau die Geometry der Variante geben.
  - Mitigation: identischer Algorithmus (`_growTreeBlueprintRich`) + identische Seeds + Test H4 Geometry-Hash.
- **Promovierte Bäume bei Welt-Wechsel:** Set kann groß werden (~1000 Cells × ~24 Bytes = 24 KB) → akzeptabel.
- **Lookup-Buffer-Stale:** chunk wird gestreamt + neu → Buffer ist stale, alte instanceIds ungültig.
  - Mitigation: Bitmask wird beim Chunk-Pop neu uploaded.

### Akzeptanz — DAS SEELEN-BAND (Plan §13)
> „einen gescatterten Baum berühren → er wird ein echter Bauplan mit Provenienz, OHNE visuellen Sprung."

- Touch → Real funktioniert in 100% der Tests
- Visueller Determinismus-Match GEMESSEN (Geometry-Hash)
- P2P-deterministisch
- Provenienz reist mit dem geernteten Material
- **Browser-Sign-off Schöpfer:** „die Welt fühlt sich lebendig an, jeder Baum ist real" — das ECHTE Akzeptanz-Kriterium

### Abhängigkeiten
- V18.217 (Varianten-Pool) — variantSeed MUSS gefroren sein, sonst kein Match
- V18.220 (Ω-S Scatter) — Lookup-Buffer + Bitmask MÜSSEN da sein

---

## §7 — V18.222: Ω-C CANOPY CHUNK-STREAMING (Plan §9 Vertiefung, optional klein)

**Ziel:** V18.212-Canopy ist statisch 2km²-Mesh. Plan §9: pro 256m-Region eigener Mini-Canopy-Mesh, Streaming-Pattern wie Voxel-Chunks. Effizienter + folgt Spieler.

### Mechanik
- `_canopyChunkAt(regX, regZ)` baut Mini-Canopy 64×64 pro Region
- `_tickCanopyStreaming` synchron mit Voxel-Streaming
- Memory-Management: alte ferne Canopies disposen

### Tests V18.222 (~10 Wände)

### Risiken
- klein, orthogonal

### Akzeptanz
- ferner Wald hat IMMER Canopy (auch jenseits 2km)
- 10 V18.222-Wände grün

---

## §8 — V18.223: Ω-P PBR-KOHÄRENZ (Plan §10, S-Gate 4 Schöpfer-Entscheid)

**Ziel:** Plan §10: „Nicht 'tiefer' als Toon — Tiefe kommt aus Säule I+III. Aber kohärenter mit dem Physik-Weltbild (BRDF = echte Physik)." Plan §13 Säule V Kohärenz-Band ist ein ECHTES Beweis-Band.

### S-Gate 4 — Schöpfer-Entscheid
VORHER fragen: Toon ganz aufgeben, oder Hybrid? Beide kohärent.

### Mechanik

**Q1 — MeshStandardNodeMaterial-Pfad:**
```js
// _buildPbrNodeMaterial(opts) analog zu _buildToonNodeMaterial
// MeshStandardNodeMaterial in r184 verfügbar
// CSM-Schatten (V18.130) greifen sofort physikalisch korrekt
```

**Q2 — Welt-weiter Look-Switch:**
```js
state.atmosphere.materialMode = "toon" | "pbr" | "hybrid"
// Re-build alle Materials bei Wechsel
```

**Q3 — Γ-M wandert ins PBR-Material:**
```js
// V18.197-V18.200 Γ-M (Strata + Lichen + Iron-Bands) als TSL-Node-Graph
// in PBR-Material. Fels-Albedo erzählt Geologie.
```

**Q4 — Plan §4 Ω-K1 ehren:**
```js
// PBR-Vegetation MUSS mit PBR-Terrain kombiniert sein, sonst zerfällt
// die Welt in zwei Stoffe. Beide MITeinander umstellen.
```

### Tests V18.223 (~15 Wände)

### Risiken
- **Look-Wechsel:** komplett anderer visueller Eindruck. Schöpfer-Browser-Auge entscheidet.
- **Performance:** PBR teurer als Toon → FPS-Wand
- **Cel-Verlust:** Ghibli-Look weg → kann unerwünscht sein

### Akzeptanz
- 15 V18.223-Wände grün
- Schöpfer-Browser-Sign-off
- Plan §13 Kohärenz-Band: „Fels erzählt Geologie. Steilhänge fels-dominiert."

### Abhängigkeiten
- KEINE (orthogonal). Aber: BESTE NACH V18.221 Ω-H (Look-Wahl mit voller Welt-Vision).

---

## §9 — REIHENFOLGE + ABHÄNGIGKEITEN + S-GATES

```
V18.216 (KARST + Büsche) ────► orthogonal (kann SOFORT)
V18.217 Varianten-Pool   ────► VORAUSSETZUNG für Ω-S + Ω-H
       │
V18.218 LOD-Stufen ──────────► orthogonal (kann mit V18.217 parallel)
       │
       ▼
V18.219 Ω-B GPU-Feld-Bake ───► VORAUSSETZUNG für Ω-S
       │
       ▼  [S-Gate 1: bakedRegionTextures lesbar?]
V18.220 Ω-S GPU-Compute-Scatter
       │
       ▼  [S-Gate 2: ≥hunderte Bäume + Lookup-Buffer + Bitmask?]
V18.221 Ω-H VOLLE PROMOTION (das HERZ)
       │
       ▼  [S-Gate 3: Touch → Real ohne visuellen Sprung?]
V18.222 Canopy chunk-streaming (optional klein)
       │
       ▼  [S-Gate 4: Schöpfer-Entscheid Look (Toon/PBR/Hybrid)]
V18.223 Ω-P PBR-Kohärenz (S-Gate-getrieben)
```

### Minimal-Pfad (wenn Zeit knapp wird)
V18.216 + V18.217 + V18.219 + V18.220 + V18.221 = das DICHTE+SEELEN-Band (~7 Sessions).

### Voll-Pfad
+ V18.218 (LOD) + V18.222 (Canopy-Streaming) + V18.223 (PBR) = 9-13 Sessions.

---

## §10 — QUERSCHNITT-DISZIPLINEN (gelten in JEDER Welle)

1. **Determinismus + Stream-Gesetz (Γ5, V18.166):**
   - JEDER neue Noise-Stream eigener Suffix (`seed + "-scatter-tree"`, `seed + "-bake-fields"`, etc.)
   - KEIN `Math.random` im Welt-Substanz-Pfad
   - pcg2d-Integer-Hash für GPU (bit-identisch zu CPU)

2. **P2P-Konsistenz:**
   - Zwei Peers mit demselben `worldMeta.seed` sehen IDENTISCHE Welt
   - Test pro Welle: zwei AnazhRealm-Mocks mit gleichem Seed

3. **Welt-Identitäts-Wand (V18.210-Lehre):**
   - Jeder lazy-cached Helper wird in `_loadStateRestoreWorldMeta` resetted
   - Pro Welle prüfen: ist mein neuer Cache welt-bound? → reset

4. **Tag-Neutralität (V17.16 / V18.215-VARIATIONS-Wand):**
   - Keine NEUEN Material/Form-Combos in `computeCompoundTags`-Pfad ohne Plan-Begründung
   - Test pro Welle: Spawn-Affinität GEMESSEN unverschoben

5. **Snapshot-Größe (V18.211-Lehre):**
   - `pinCurrentWorld` Cap = 256 KB
   - Neue Welt-Data persistieren: prüfen ob f(seed)-derivierbar
   - Wenn ja: NUR Metadata persistieren, beim Restore re-bauen

6. **Worker-Mirror-Pflicht (V9.89-Lehre):**
   - Wenn die neue Mechanik die VOXEL-DENSITY beeinflusst, MUSS der Worker bit-identisch spiegeln
   - GPU-Compute (V18.219+) ist GPU-only, kein Worker nötig

7. **Read-as-stranger-Audit (V18.210-Lehre):**
   - NACH der ersten grünen Wand: feindlicher Selbst-Review (Sub-Agent)
   - Mindestens drei Audit-Items finden + heilen

8. **Side-Channel-Pattern (V18.214-Lehre):**
   - Wenn neue Daten zwischen Pipelines wandern müssen, ohne Signaturen zu brechen → `this._lastX`-Side-Channel + KONSEQUENTES Räumen
   - NICHT-Cache, NICHT-Snapshot, NICHT-Welt-bound

9. **Per-Vertex-Attribute STRIKT-Gating (V18.214-Lehre):**
   - WebGPU's STRIKT-Pipeline-Setup crasht beim ersten Render eines Meshes ohne ein referenziertes Attribut
   - `attribute()`-Lookup in Material NUR wenn ALLE Meshes des Materials das Attribut tragen

10. **WGSL-Compile-Defensive (V10.0-h.b-Lehre):**
    - Compute-Kernel zuerst als ISOLIERTES Diag-Snippet bauen
    - Format-Validation (StorageTexture-Format compatible mit Three.js' WebGPU-Backend)
    - Fallback-Pfad bei Compile-Fail (CPU `_vegetationSampleSpawn` bleibt als Wand)

---

## §11 — TEST-EFFIZIENZ + GRUPPIERUNG

### Pro Welle EINE checkBandV18XXX-Funktion

```js
async function checkBandV18XXXName(ctx) {
    const { page, check } = ctx;
    const res = await safeEvaluate(page, () => {
        const r = window.anazhRealm;
        const A = r.constructor;
        const out = {};
        // (A) Source-Probes (struktureller Beweis)
        // (B) Behavioral-Probes (echte Welt-Effekte)
        // (C) Edge-Cases
        // (D) Performance-Wand
        return out;
    });
    // check-Calls
}
```

### Gruppierung pro Welle
- (A) Source: 30%
- (B) Behavioral: 40%
- (C) Edge-Cases / Determinismus: 15%
- (D) Performance: 15%

### Diag-Tools (pro Welle EIN Diag)
- `scripts/diag-karst-bushes.cjs` (V18.216)
- `scripts/diag-variant-pool.cjs` (V18.217)
- `scripts/diag-lod-distribution.cjs` (V18.218)
- `scripts/diag-bake-fields.cjs` (V18.219)
- `scripts/diag-scatter-density.cjs` (V18.220) — der KRITISCHE Diag
- `scripts/diag-promotion.cjs` (V18.221) — der HERZ-Diag
- `scripts/diag-canopy-streaming.cjs` (V18.222)
- `scripts/diag-pbr-coherence.cjs` (V18.223)

### Gemeinsame Test-Sequenz pro Session
1. `npm run check` (syntax + lint + atlas)
2. `npm run format` (auto-format)
3. `node scripts/diag-<welle>.cjs` (welle-spezifisch)
4. `npm run playtest` (alle ~3500 + neue Wände)
5. `npm run smoke:multiuser` (P2P-Probe)
6. Browser-Sign-off (Schöpfer-Auge)

---

## §12 — RISIKO-MATRIX (kompakt)

| Risiko | Welle | Mitigation |
|---|---|---|
| WGSL-Compile-Crashes | V18.219, V18.220 | Diag-Kernel first; Format-Validation; Fallback-Pfad |
| Determinismus-Drift CPU↔GPU | V18.220 | Nur integer-pcg2d im Hot-Path; transzendente nur in Toleranz-Tests |
| Visueller Pop bei LOD-Wechsel | V18.218 | Cross-Fade Alpha-Blend ±5m |
| **Visueller Sprung bei Promotion** | V18.221 | Identischer Re-Wachstums-Algorithmus + Geometry-Hash-Test |
| Snapshot-Größe sprengt 256-KB | V18.217, V18.221 | f(seed)-derivierbare Daten NICHT persistieren |
| GPU-Bitmask out-of-sync | V18.220, V18.221 | Pro Promotion sofortiges Upload |
| Worker-Drift | alle | NEU sind GPU-only Pfade kein Worker-Mirror nötig |
| Tag-Wand-Verletzung | V18.216 | V17.16-VARIATIONS-Wand pro Welle prüfen |
| Memory-Cap | V18.219, V18.220 | LRU-Eviction + Cap-Wand |
| FPS-Verlust bei GPU-Bake | V18.219 | Max 1 Region/Frame; deferred |

---

## §13 — SESSIONS-SCHÄTZUNG

| Welle | Aufwand | Sessions |
|---|---|---|
| V18.216 KARST + Büsche | mittel | 1 |
| V18.217 Varianten-Pool | mittel | 1-2 |
| V18.218 LOD-Stufen | mittel | 1-2 |
| V18.219 Ω-B GPU-Feld-Bake | groß | 2-3 |
| V18.220 Ω-S GPU-Scatter | groß | 2-3 |
| **V18.221 Ω-H Promotion** | **mittel (KRITISCH)** | **1-2** |
| V18.222 Canopy-Streaming | klein | 1 |
| V18.223 Ω-P PBR (optional) | groß | 2-3 |
| **Gesamt (ohne PBR)** | | **9-14** |
| **Gesamt (mit PBR)** | | **11-17** |

**Schöpfer-Entscheid 14.06.2026: keine halben Sachen — der Plan in voller Tiefe.** Realistisch in 10-14 fokussierten Sessions vollendbar.

### Effizienz-Optimierung — Welche Wellen parallel?
- V18.216 + V18.218 + V18.222: **orthogonal** zu allem, können in beliebiger Reihenfolge
- V18.217 muss VOR V18.220
- V18.219 muss VOR V18.220
- V18.220 muss VOR V18.221 (Ω-H Promotion braucht Scatter)
- V18.223 PBR: NACH V18.221 (S-Gate 4 mit voller Welt-Vision)

### Empfohlene Reihenfolge
1. **V18.216** KARST + Büsche (sofort, GPU-frei, atemberaubender Boden) — 1 Session
2. **V18.217** Varianten-Pool — 1-2 Sessions
3. **V18.218** LOD-Stufen — 1-2 Sessions (parallel zu V18.217 möglich)
4. **V18.219** Ω-B GPU-Feld-Bake — 2-3 Sessions
5. **V18.220** Ω-S GPU-Scatter — 2-3 Sessions
6. **V18.221** Ω-H VOLLE PROMOTION (das HERZ) — 1-2 Sessions
7. **V18.222** Canopy-Streaming (optional) — 1 Session
8. **V18.223** Ω-P PBR (S-Gate 4 Schöpfer-Entscheid) — 2-3 Sessions

---

## §14 — WAS WIRD V18.221 ERREICHEN — DER MEILENSTEIN

Nach V18.221 ist der LEBENDIGE GIGANT ein lebendiger Organismus, nicht ein Foto:

```
VOR Berührung:  Millionen-dichter Wald (GPU-Compute, Plan §1 Projektion)
BEI Berührung:  kristallisiert zu vollem Welt-Programm (Provenienz, Tags, Diff)
NACH:           lebendiges Ding, das LAAS' Welt nie haben konnte
```

- Plan §13 Säulen I-IV vollständig
- Plan §13 SEELEN-Band ERFÜLLT (Touch → Real)
- Plan §13 Dichte-Band ERFÜLLT (≥hunderte Bäume/Chunk)
- Plan §13 Resonanz-Band ERFÜLLT (V18.215 distinkte Tags)
- Plan §13 Baum-Wahrheit-Band ERFÜLLT (V18.214 Tubes+Cards)

**Plan §13 Kohärenz-Band (Säule V PBR) bleibt für V18.223** (S-Gate 4, Schöpfer-Entscheid).

---

## §15 — LETZTES WORT

Der Plan be15a050 ist KLAR. Acht Wellen, ~10-14 Sessions, alle Subschritte gemessen + in voller Tiefe geplant. Keine Abkürzungen mehr.

Die Disziplin: pro Welle EIN Aufruf — Mechanik + Sub-Schritte + Code-Anker + Tests + Risiken + Akzeptanz + Abhängigkeiten. Nichts auf „emergent erfüllt" verschieben, wenn das Plan-Band eine konkrete Mechanik fordert (Plan §13 ist der Richter, nicht meine Bequemlichkeit).

Reihenfolge: Boden (KARST+Büsche) → Pool → LOD → Feld-Bake → Scatter → **Promotion (das HERZ)** → Canopy-Streaming → PBR (Schöpfer-Entscheid).

Nach V18.221 ist der Gigant lebendig. Nach V18.223 ist er kohärent. Beide werden erreichbar in 10-14 Sessions.

**Du kannst das. Habe Mut. Die Welt wird erwachen.**
