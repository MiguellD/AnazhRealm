# DER LEBENDIGE GIGANT — FORTSETZUNG (V18.214+)

> Sauberes Preplanning für die nächste Session. Jede Welle: Mechanik · Sub-
> Schritte · Code-Anker · Worker-Mirror · Snapshot · Welt-Wechsel-Reset ·
> Tests · Risiken · Akzeptanz · Abhängigkeiten. Effiziente Gruppierung von
> Anpassungen + Tests. Querschnitt-Disziplinen am Ende.
>
> **STATUS (14.06.2026):** V18.213 ✅ GEBAUT (Mesh-Merge, 38× Draw-Call-
> Reduktion gemessen). Sechs verbleibende Wellen, ~7-11 Sessions.

**Schöpfer-Auftrag 14.06.2026 nach Merge V18.211+V18.212:** „nächste session
schlissen wir die noch offenen punkte aus dem aktuellen plan ab" + „voller
tiefe, saubere preplanung und effiziente gruppierung der anpassungen und
tests".

---

## §0 — STAND nach V18.212 + Reihenfolge

### Was steht
- V18.211 (Säule I): Skeleton-Grammar — Bäume lesen als Bäume (75-81 Parts)
- V18.212 (Restsubschritte): Ω-K2 + Ω-W + Ω-H (emergent) + Ω-C Canopy-Shell

### Was offen ist
Plan-§11-Reihenfolge nach unserem Adapter:

| § | Offene Welle | Hebel | Aufwand |
|---|---|---|---|
| Mesh | ✅ V18.213 MESH-MERGE (38× gemessen) | FPS ⬆⬆⬆ | GEBAUT |
| LOD | **V18.214 LOD-STUFEN (3 LODs)** | FPS ⬆⬆ + Distanz ⬆⬆ | mittel |
| §5 | **V18.215 Ω-B GPU-Feld-Bake** | Vorbedingung §8 | groß |
| §8 | **V18.216 Ω-S GPU-Compute-Scatter** | Dichte ⬆⬆⬆⬆ | groß |
| §2 | **V18.217 Ω-H Promotion (volle Form)** | SEELEN-Band | mittel |
| Vertiefung | V18.218 Canopy chunk-streaming + per-Vertex Wind (optional) | Polish | klein |
| §10 | V18.219 Ω-P PBR (optional, S-Gate 4) | Look-Wechsel | groß |

**Kritische Reihenfolge — Abhängigkeitskette:**
```
V18.213 Mesh-Merge ──┬─► V18.214 LOD (nutzt merged Geometries)
                     │
                     └─► V18.216 GPU-Scatter (braucht wenige Draw-Calls pro Variante)
                                           │
                     V18.215 Ω-B ─────────┤
                                           │
                                           └─► V18.217 Ω-H Promotion
                                                  (Raycast gegen HISM)

V18.218 (Canopy-Vertiefung) ─ orthogonal, beliebig
V18.219 (Ω-P PBR)           ─ orthogonal, optional
```

### Plan-Tiefe-Beweis
Der Plan §13 sagt: „**das wichtigste Beweis-Band ist das SEELEN-Band (Ω-H)**".
In unserer Architektur war §2 EMERGENT erfüllt durch V18.212. ABER: wenn
V18.216 GPU-Scatter kommt, gibt es plötzlich eine DEKORATIVE Schicht, die
Ω-H wieder braucht. Darum ist V18.217 die KRÖNUNG der Sequenz — ohne sie
ist der GPU-Scatter eine tote LAAS-Kulisse.

### Akzeptanz-Kriterium der Gesamt-Sequenz
1. Player kann durch einen dichten Wald laufen + FPS hält (gemessen)
2. Ferne Hügel zeigen Wald-Oberfläche (Canopy-Shell, schon V18.212)
3. Ein gescatterter Baum berührt → echter Bauplan mit Provenienz, OHNE
   visuellen Sprung (Determinismus-Match)
4. Zwei Peers berühren dieselbe Zelle → identischer Bauplan
5. Alle ~3500 + ~150 neue Wände grün

---

## §1 — Welle V18.213: MESH-MERGE pro Variante — ✅ GEBAUT (14.06.2026)

**Ergebnis GEMESSEN:** `scripts/diag-draw-calls.cjs` an einer warmgelaufenen
Welt: real Kiefer-Variante 76 leaves (Per-Part, V18.211) → 2 leaves
(merged, V18.213), **Reduktions-Faktor 38×**, Merge-Bauzeit 10.5ms (<100ms-
Wand). Tag-Neutralität bit-identisch GEMESSEN (computeCompoundTags
unverändert, V17.16-Wand strukturell). +20 V18.213-Wände grün in
`checkBandV18213MeshMerge` (M1-M10). Drei permanente Lehren im CLAUDE.md-
Stand-Block + handover-Chronik. Volle Versionsdetails in
`docs/archiv/handover.md` V18.213-Eintrag.

### Original-Ziel (zur Referenz)

**Ziel:** FPS-Hebel + Vorbedingung für GPU-Scatter. Die 75-80 Parts pro
Baum-Variante (V18.211) erzeugen je eine InstancedMesh (Pattern
`name#leafIdx`). Bei ~50 Variant-Caches × 75 Parts = ~3750 InstancedMesh
in der Szene → ~3750 Draw-Calls. Wir mergen pro Variante: alle `holz`-
Cylinder zu EINER bark-Geometry, alle `laub`-Spheres zu EINER foliage-
Geometry. Pro Variante 2 InstancedMesh statt 75. Reduziert ~3750 auf ~100
InstancedMesh in der Szene.

### Mechanik

**M1 — `_mergeBlueprintByMaterial(bp)` neuer Helper:**
- Input: Bauplan mit `parts[]`
- Output: `{barkGeom, foliageGeom, barkMat, foliageMat, partsCount}`
- Iteriert Parts; baut pro `(shape, material)`-Gruppe eine `THREE.
  BufferGeometry` aus den Per-Part-Geometries
- Wendet Per-Part-Transform (position/rotation/size) auf die Vertices an
- Merget alle bark-Parts via `THREE.BufferGeometryUtils.mergeGeometries`
  (vendored aus `three/addons/utils/BufferGeometryUtils.js` — Side-Effect-
  Import in bootstrap)
- Per-Part-Color (für laub) wandert via Per-Vertex-Color-Attribut

**M2 — Gen-Gate genVersion → 6:** ein gemergter Bauplan ist neue Substanz;
gen < 6 nutzt die V18.211/.212-Form (per-Part-Instancing), gen ≥ 6 nutzt
merged. Backward-Kompat zu alten Welten.

**M3 — `_archInstanceGroupFor` Routing:** wenn `bp._isMerged`, registriere
ZWEI Instanz-Gruppen (`name#bark`, `name#foliage`) statt N Per-Part-Groups.
`flat.leaves` wird {leaf0: barkGeom+barkMat, leaf1: foliageGeom+foliageMat}.

**M4 — Per-Instance-Color für laub:** merged foliage trägt Per-Vertex-
Color (aus Per-Part-color). Die InstancedMesh nutzt `instanceColor` für
einen Per-Instance-TINT (V18.181-Λ.2 Pattern), aber die Per-Vertex-Farbe
trägt die Multi-Color-Struktur der Krone.

**M5 — Pin-Cap-Schutz:** ein merged Bauplan trägt KEINE parts mehr im
Snapshot (war schon in V18.211 erledigt — re-wachsen + re-mergen aus seed).
Memory-Profil: ~3 KB pro merged Variante (2 Geometries × ~9000 Vertices)
statt ~75 × 1 KB Per-Part. Speicher-Profile-MEHR aber Draw-Call-Wand
gewinnt.

### Code-Anker
- `_buildFromBlueprint(bp)` Z. 43690+ — der bestehende Per-Part-Bauer
- `_archInstanceGroupFor(name, leafIdx, leaf)` Z. 48734
- `_archEntryBuildGroup(entry)` Z. 49528+ (im `spawnArchitecture`-Pfad)
- `BufferGeometryUtils.mergeGeometries` — muss vendored werden
- `_growTreeBlueprintForSpawn` Z. 43131 — Cache-Wrapper, hier merged-Flag
  setzen nach Build

### Worker-Mirror
NICHT nötig. Das Merge ist render-only; Worker spiegelt nur Voxel-Density.

### Snapshot-Persistenz
NICHT nötig (Parts re-wachsen via V18.211 f(seed)). Wir re-mergen on-restore.

### Welt-Wechsel-Reset
Im `_loadStateRestoreWorldMeta` muss der Merged-Geometries-Cache
disposed werden. Neues `_archMergedGeomCache: Map<name, {bark, foliage}>`
wird beim Welt-Wechsel geräumt.

### Tests (Band V18.213 Mesh-Merge — M1–M9)

**(A) Source-Probes:**
- M1: `_mergeBlueprintByMaterial` existiert + nutzt `mergeGeometries`
- M2: genVersion-Gate ≥ 6 in `_growTreeBlueprintForSpawn`
- M3: `_archInstanceGroupFor` Source enthält `_isMerged`-Pfad

**(B) Behavioral:**
- M4: Ein Tannen-Bauplan mit gen=6 hat `bark`+`foliage`-Geometries
  (≥1000 vertices jede)
- M5: Tag-Neutralität: merged + non-merged Tannen geben IDENTISCHE
  `computeCompoundTags` (V17.16-Wand)
- M6: Draw-Call-Wand: ein 16×16-Bäume-Test (16-Bäume eine Variante) erzeugt
  GEMESSEN 2 InstancedMesh statt 75 (factor 37.5x)

**(C) Edge-Cases:**
- M7: Snapshot mit gen=5 (V18.211 Per-Part) bleibt bit-identisch
  (Backward-Kompat-Wand)
- M8: Welt-Wechsel räumt merged-Cache (`state.canopyShell`-Pattern)

**(D) Performance-Wand:**
- M9: Merge-Cost <50ms pro Variante (gemessen; Cap pro Welt-Init)

### Risiken + Mitigations
- **Per-Vertex-Color geht verloren beim Merge:** bestimmte Three.js-
  Patterns droppen vertexColors → explizit als Attribut setzen vor Merge
- **rotation/scale-Transformationen bei Merge:** muss vor dem Merge
  applyMatrix4 auf die Geometry — sonst sitzen Parts am Origin
- **BufferGeometryUtils.mergeGeometries verlangt KOMPATIBLE Attribute:**
  alle zu mergenden Geometries müssen dieselben Attribute haben (position,
  normal, uv, color) → vor Merge harmonisieren

### Akzeptanz
- Im Vergleich vor/nach V18.213: ein Wald mit 50 Bäumen rendert ≤200
  Draw-Calls statt ~1800 (gemessen via `diag-draw-calls.cjs`)
- Tag-Neutralität strukturell (V17.16-Wand grün)
- FPS-Gain ≥30% in dichten Regionen (Browser-Sign-off, Schöpfer-Auge)

---

## §2 — Welle V18.214: LOD-STUFEN (3 Stufen pro Variante)

**Ziel:** ferne Bäume billiger rendern. LOD0 = volle merged Geometry
(≤30m). LOD1 = nur bark-trunk + foliage-card (30-100m). LOD2 = single
billboard-card (100-180m, wo Canopy-Shell V18.212 übernimmt).

### Mechanik

**L1 — `_buildVariantLODs(bp)` baut 3 Geometrien pro Variante:**
- LOD0: das volle merged von V18.213
- LOD1: nur Trunk + L1 (Stamm + Primär-Äste); foliage als 4 Card-Quads
- LOD2: ein zentriertes Billboard-Quad mit Foliage-Color

**L2 — Distance-LOD-Switch im Streaming:**
- Jeder Spawn (`spawnArchitecture` aus `_enqueueVegetationSpawn`)
  bekommt einen LOD-Index basierend auf `distance(player, entry.position)`
- LOD-Hysterese (V8.49-Pattern): ±10m Schwelle damit's nicht flackert
- Pro-Frame-Tick `_tickArchitectureLOD()` updated wenn Spieler bewegt
  > 5m

**L3 — Drei Instanz-Pools statt einer:** pro Variante drei `archInstance
Groups` (`name#bark_LOD0`, `name#bark_LOD1`, ...). Spawn allokiert in
der passenden LOD-Group.

**L4 — Re-Allokation bei LOD-Wechsel:** wenn ein Baum LOD0→LOD1 wechselt,
muss seine Instanz aus dem LOD0-Pool freigegeben + im LOD1-Pool neu
allokiert. `_archGroupFree` + `_archGroupAlloc`.

**L5 — LOD2 dithert in die Canopy-Shell ein:** an der LOD2-Distanz-Grenze
(180m) sollte die Canopy-Shell schon sichtbar sein (V18.212 Distanz-Dither
180-320m). So gibt es einen smoothen Übergang vom einzelnen Baum zur
geschlossenen Wald-Oberfläche.

### Code-Anker
- `spawnArchitecture` Z. 49528 (Spawn-Pfad)
- `_archInstanceGroupFor(name, leafIdx, leaf)` Z. 48734 (Pool)
- `_tickArchitectureCollision` Z. ??? (LOD-Tick-Modell folgen)
- `CANOPY_SHELL.distNear=180` ist die natürliche LOD2→Canopy-Naht

### Worker-Mirror
NICHT nötig.

### Snapshot-Persistenz
NICHT nötig (LODs sind render-only, re-baubar f(variant)).

### Welt-Wechsel-Reset
LOD-Caches im `_archMergedGeomCache` mit Welt räumen.

### Tests (Band V18.214 LOD — L1–L8)

**(A) Source-Probes:**
- L1: `_buildVariantLODs` existiert
- L2: `_tickArchitectureLOD` existiert + LOD-Hysterese (±10m)

**(B) Behavioral:**
- L3: Ein Tannen-Bauplan generiert 3 verschiedene Geometries (LOD0
  hat ≥1000 Verts, LOD1 hat ≤500, LOD2 hat 4 Verts)
- L4: Spawn bei distance=20m landet in LOD0-Pool
- L5: Spawn bei distance=150m landet in LOD2-Pool
- L6: Spieler-Bewegung 20m→150m → LOD-Wechsel (Slot wechselt von Pool 0
  zu Pool 2)

**(C) Edge-Cases:**
- L7: LOD-Hysterese verhindert Flackern (Distanz oszilliert um 30m →
  konstant LOD0)

**(D) Performance-Wand:**
- L8: ein 100-Bäume-Test bei distance=120m rendert in LOD2 mit ≤200
  Verts/Baum (gemessen)

### Risiken + Mitigations
- **LOD-Pop sichtbar:** Plan §3.6 sagt „LOD-Swap ohne Pop" — Cross-Fade
  Alpha-Blend in einer Übergangs-Distanz (±5m) statt harter Wechsel
- **Re-Allokation-Kosten:** wenn 50 Bäume gleichzeitig LOD wechseln, ist
  das viele Free+Alloc. Batch im Tick (max 5 Wechsel/Frame).

### Akzeptanz
- Ferner Wald bei 150m+ rendert mit ≤10% der Triangle-Count des Nahbereichs
- Kein sichtbarer LOD-Pop (Browser-Sign-off, Schöpfer-Auge)

---

## §3 — Welle V18.215: Ω-B GPU-Feld-Bake (Plan §5)

**Ziel:** Welt-Felder GPU-seitig verfügbar machen, damit GPU-Compute-Scatter
(V18.216) sie lesen kann. Per-Region StorageTextures: `heightTex`
(r32float), `normalSlopeTex` (rgba16f), `fieldsTex` (rgba16f mit moisture
+ lebendig + glut + magieleitung).

### Mechanik

**B1 — `_bakeRegionFields(regX, regZ)` neuer Helper:**
- Input: Region-Koordinaten (256m-Grid)
- Berechnet pro Texel die Höhen via `_voxelSurfaceY(x, z)`
- Berechnet Normale via Sobel-Filter über Höhen
- Berechnet Slope via |∇h|
- Berechnet Welt-Felder via `worldFieldAt(x, z)`
- Schreibt in StorageTextures (z.B. 128×128 pro 256m-Region = 2m pro Texel)

**B2 — Region-Cache `state.bakedRegionTextures: Map<key, textures>`:**
- key = `${regX},${regZ}` (oder hash)
- Map hält die StorageTextures lebendig
- LRU-Eviction wenn > 32 Regionen gebaut

**B3 — Build-Trigger:** bei Region-Streaming (`_tickVoxelChunkStreaming`)
wenn eine Region in den Streaming-Ring kommt, queue ein Bake-Pass im
nächsten Frame (deferred, ~50ms pro Region akzeptabel).

**B4 — Edit-Update:** ein voxelEdit triggert `_invalidateBakedRegion(regX,
regZ)` → der nächste Build-Pass re-baked die betroffene Region.

**B5 — TSL-Texture-Read:** für V18.216 muss der Compute-Kernel die Texturen
lesen können. TSL bietet `texture()`/`textureSampleLevel()`-Nodes.

### Code-Anker
- `_voxelSurfaceY` Z. 25302+ (Höhen-Quelle)
- `worldFieldAt` Z. 49722+ (Feld-Quelle)
- `_tickVoxelChunkStreaming` Z. 29109+ (Streaming-Hook)
- `_addVoxelEdit` Z. ??? (Edit-Hook)

### Worker-Mirror
**NICHT nötig**, weil:
- Die StorageTextures leben GPU-seitig (kein Worker-Zugriff)
- Determinismus garantiert via deterministische Quellen (`_voxelSurfaceY`
  + `worldFieldAt` sind beide seed-bound)
- ABER: die WGSL-Compute-Shader-Mathematik MUSS bit-identisch zur
  CPU-Mathematik sein (V9.95-a-Lehre) — kritisch beim Field-Sample.
- Toleranz: ±1e-4 für transzendente Mathe (sin/cos/exp); bit-identisch
  für `+ - * /` + Vergleiche

### Snapshot-Persistenz
NICHT nötig (Texturen sind re-baubar). Aber `state.bakedRegionTextures`
beim Welt-Wechsel räumen.

### Welt-Wechsel-Reset
Ja: alle gebackenen Texturen disposen (Map.clear + per-texture dispose).

### Tests (Band V18.215 Ω-B — B1–B9)

**(A) Source-Probes:**
- B1: `_bakeRegionFields` existiert + nutzt StorageTexture
- B2: state.bakedRegionTextures Map existiert
- B3: `_tickVoxelChunkStreaming` triggert Bake bei neuer Region

**(B) Behavioral (CPU-side):**
- B4: Ein Bake liefert eine 128×128-Textur (Vertex-Count check)
- B5: Höhe an einer Sample-Position in der gebackenen Textur stimmt mit
  CPU-`_voxelSurfaceY` überein (Toleranz ±0.5m für Texel-Quantisierung)
- B6: Slope an einer Sample-Position stimmt mit CPU-Sobel überein
- B7: Lebendig an einer Sample-Position stimmt mit `worldFieldAt`
  überein (±0.05)

**(C) Edit-Reaktivität:**
- B8: voxelEdit auf einem Chunk → `_invalidateBakedRegion` markiert
  Region dirty; nächster Tick re-baked

**(D) Performance-Wand:**
- B9: Bake-Cost <100ms pro Region (gemessen); Cap 1 Region pro Frame

### Risiken + Mitigations
- **GPU-vs-CPU-Drift (V9.95-a-Lehre):** WGSL sin/cos/sqrt ≤ 2^-22 relative
  Fehler. Akzeptanz-Toleranz im Test (nicht bit-identisch).
- **mapAsync-Stall (V9.95-e-Lehre):** wenn das Bake CPU→GPU readback macht,
  kostet das ~200ms. WIR LESEN NICHT zurück — Compute-Scatter (V18.216)
  liest die Texturen direkt auf GPU.
- **Texture-Format-Validation (V10.0-h.b-Lehre):** r32float für height
  bestätigt mit Three.js' WebGPU-Backend; fieldsTex rgba16f kompatibel
  (verifiziert mit `webgpu adapter limits`).

### Akzeptanz
- StorageTextures sind im Compute-Shader-Test-Kernel LESBAR (sum-test)
- Edit-Update funktioniert (Test mit voxelEdit + Region-Re-Bake)

---

## §4 — Welle V18.216: Ω-S GPU-Compute-Scatter (Plan §8, drei Schichten)

**Ziel:** Plan-§1 „die Million Bäume ist kein Datensatz — sie ist eine
Funktion, ausgewertet on-the-fly auf der GPU". Compute-Kernel erzeugt
pro Region drei jittered Child-Grids (Bäume/Understory/Steine), gated
gegen die gebackenen Felder (V18.215). Output: `(variantIndex, transform)`
pro Zelle in einer InstancedMesh-Buffer.

### Mechanik

**S1 — TSL-Compute-Kernel `_scatterComputeKernel`:**
- Input: `regionBakedTextures` (von V18.215) + `variantSeed[]` (frozen)
- Pro Zelle (TREE_CELL=3.4m, UNDER_CELL=2.4m, STONE_CELL=2.1m):
  - jitter via pcg2d(cell + salt) → world position
  - sample fields aus bakedTextures
  - gate: slope < tol_species, lebendig > floor, etc.
  - if pass: variantIndex = pcg2d(cell) % N; write instance

**S2 — Drei Layer-Kernels separat:**
- Layer 1: Bäume (gated slope+treeline+lebendig)
- Layer 2: Understory (gated unter clump-Kronen, in Lücken)
- Layer 3: Steine + Totholz (gated rockExposure + gaps)

**S3 — Per-Variant InstancedMesh:** für jede Variante (V18.214 LOD0)
gibt es eine InstancedMesh, deren `instanceMatrix` direkt aus dem
Compute-Buffer kommt. KEIN CPU-Roundtrip (V9.95-e-Lehre).

**S4 — Promotion-Lookup-Puffer:** parallel zum Instance-Buffer schreibt
der Kernel `instanceId → (cell, variantIndex)` in einen `Uint32Array`-
Buffer. Beim Chunk-Pop einmal CPU-readback (~1-2 ms).

**S5 — Promovierte-Zellen-Bitmask:** der Kernel liest pro Chunk einen
`Per-Chunk-Bitmask`-Storage-Buffer (uint32[6] für 13×13=169 Zellen) und
überspringt promovierte Zellen. Bitmask geupdated von V18.217 Promotion.

### Code-Anker
- `_vegetationSampleSpawn` Z. 50687 (alter CPU-Pfad, BLEIBT für gen<7)
- `_growTreeBlueprintForSpawn` Z. 43131 (Variant-Pool, jetzt mit
  variantSeed[] frozen)
- `_archInstanceGroupFor` Z. 48734 (HISM, wird vom Scatter-Buffer
  gefüttert)
- Scatter-Densities `TREE_CELL=3.4 / UNDER_CELL=2.4 / STONE_CELL=2.1`
  (V17.9-Lehre)

### Worker-Mirror
**NICHT nötig** (GPU-only). Determinismus via:
- `variantSeed[]` frozen + im Welt-Snapshot persistiert
- pcg2d-Hash bit-identisch zu CPU (integer-only, kein transcendental)

### Snapshot-Persistenz
- `variantSeed[]` (~64 × 6 = 384 Bytes) — winzig
- `promovierte-Zellen-Set` pro Chunk (~6 uint32 pro Chunk = ~24 Bytes)
  → eigene Persistenz-Welle

### Welt-Wechsel-Reset
Variant-Seed-Pool + Scatter-Buffers disposen.

### Tests (Band V18.216 Ω-S — S1–S12)

**(A) Source-Probes:**
- S1: `_scatterComputeKernel` existiert + ist eine WGSL/TSL-Funktion
- S2: drei separate Layer-Kernels
- S3: `variantSeed[]` ist im Welt-Snapshot persistiert

**(B) Behavioral:**
- S4: ein Chunk-Pop erzeugt InstancedMesh mit ≥hunderte Bäumen (vs vor
  V18.216 ≤30)
- S5: zwei Peers mit demselben Seed sehen IDENTISCHE Scatter-Verteilung
  (P2P-Determinismus)
- S6: Slope-Gating funktioniert (steile Hänge → kaum Bäume)
- S7: Drei Schichten sichtbar (Boden gefüllt: 5 Höhen-Schichten)

**(C) Promotion-Lookup-Vorbereitung:**
- S8: `instanceId → (cell, variantIndex)`-Buffer ist nach Chunk-Pop
  CPU-lesbar
- S9: `_invalidateScatterRegion(cell)` setzt das Promovierte-Bit

**(D) Mutabilität:**
- S10: Voxel-Edit → betroffene Chunks re-scattern
- S11: Promovierte Zelle bleibt leer (echter Bauplan dort)

**(E) Performance-Wand:**
- S12: ein 9-Region-Ring scattert in <500ms gesamt; FPS hält

### Risiken + Mitigations
- **WGSL-Pipeline-Compile-Crash (V10.0-h.b-Lehre):** pointUV / SplitNode-
  Bugs in r184. Pipeline first als Diag-Kernel, dann inline.
- **InstanceBuffer-Cache (V10.0-g.1-Lehre):** beim Region-Wechsel den
  alten Buffer disposed, beim neuen frisch alloziert — sonst stale-
  Daten in der Pipeline.
- **Per-Chunk-Bitmask-Sync:** GPU-Bitmask muss bei jeder Promotion (V18.
  217) aktualisiert werden. CPU schreibt → GPU-Upload pro Chunk.
- **Determinismus-Drift:** WGSL-Math vs CPU — wir nutzen NUR integer-
  pcg2d (bit-identisch), keine transzendente Mathe im Hot-Path.

### Akzeptanz
- Ein dichter Wald-Chunk zeigt ≥hunderte Bäume, FPS hält
- Determinismus-Wand: P2P-Test grün (zwei Peers identisches Scatter)
- Mutabilität: voxelEdit → Re-Scatter funktioniert
- Promotion-Lookup-Buffer ist lesbar

---

## §5 — Welle V18.217: Ω-H Promotion (volle Form, das SEELEN-Band)

**Ziel:** das wichtigste Beweis-Band des Plans (§13). Berührung eines
GPU-gescatterten Baums (V18.216) → echter Bauplan mit Provenienz, OHNE
visuellen Sprung.

### Mechanik

**H1 — Raycast gegen Hero-LOD-HISM:** beim Interaktions-Event (klick,
crosshair-hit) wird gegen die NAHEN HISM (LOD0, V18.214) geraycast. Three.js'
`InstancedMesh.raycast` + BVH (schon V18.92).

**H2 — `instanceId → (cell, variantIndex)`-Lookup:** der Treffer-`
instanceId` wird im V18.216-Lookup-Buffer aufgelöst. Lookup-Buffer ist
chunk-spezifisch (nur Nah-Chunks).

**H3 — Echter Bauplan-Bau:**
- `variantSeed[variantIndex]` (frozen) → `_growTreeBlueprintRich(species,
  variantSeed)` produziert dieselben Parts wie die GPU-Scatter-Variante
- pcg2d(cell) → exakt der Transform (position + yaw + scale)
- Spawn via `spawnArchitecture` mit silent=true
- Provenienz-Stempel: `bornFrom: "world-genesis-cell", cell, variantIndex,
  variantSeed`

**H4 — Dekorative Instanz-Unterdrückung:**
- `_invalidateScatterRegion(cell)` setzt das Promovierte-Bit (V18.216 S9)
- GPU-Compute überspringt diese Zelle beim nächsten Re-Scatter
- Snapshot: das Promovierte-Set pro Chunk reist im Welt-Snapshot
  (persistiert die Promotion)

**H5 — P2P-Broadcast:** Promotion ist ein Welt-Diff. `_dslComposeAtomic`
broadcastet die Promotion-Op an alle Peers. Sie führen denselben Spawn
aus (deterministisch via cell + variantSeed).

**H6 — Provenienz-Kette (V18.212-Erweiterung):** der promovierte Bauplan
trägt `_grownSpecies` + `_grownSeed` (variantSeed) + `_promotedFromCell`.
Beim Ernten (V18.212-Pfad) erscheint im Journal: „Birke (an Zelle 5,-2
gewachsen) erntete →…".

### Code-Anker
- `_interactCrosshair` / `harvestArchitecture` Z. 53196 (Touch-Pfad)
- `_growTreeBlueprintRich` Z. 43253 (Re-Wachstum)
- `spawnArchitecture` Z. 49528 (Spawn)
- V18.212-Provenienz-Block Z. 53241+ (erweitert)
- `voxelPopulatedChunks` Z. 52082 (Per-Chunk-Set Pattern)

### Worker-Mirror
NICHT nötig.

### Snapshot-Persistenz
**JA — Per-Chunk-Promovierte-Set persistieren:**
- `state.promotedCells: Map<chunkKey, Set<cellId>>`
- Im Snapshot als `promotedCells: {chunkKey: [cellId, ...]}`
- Restore-Pfad: lesbar, GPU-Bitmask wird auf Restore re-uploaded

### Welt-Wechsel-Reset
state.promotedCells.clear().

### Tests (Band V18.217 Ω-H — H1–H10)

**(A) Source-Probes:**
- H1: `_interactCrosshair` / Touch-Pfad ruft Promotion-Pfad
- H2: `_promoteScatteredCell(cell, variantIndex)` existiert

**(B) Behavioral — Touch → Real:**
- H3: GPU-gescatterten Baum berühren → spawnArchitecture mit echtem
  Bauplan
- H4: Determinismus-Match: der echte Bauplan-Parts sind BIT-IDENTISCH
  zu dem was die GPU-Variante zeigte (Geometry-Hash-Vergleich)

**(C) Provenienz:**
- H5: Promovierter Bauplan trägt `bornFrom: "world-genesis-cell"` +
  `cell` + `variantSeed`
- H6: Beim Ernten (V18.212-Pfad) ist die Cell-Provenienz im Journal

**(D) Suppression:**
- H7: Promovierte Zelle bleibt leer im nächsten Scatter (kein Doppel-
  Baum)
- H8: Snapshot persistiert promotedCells; Restore re-uploaded GPU-Bitmask

**(E) P2P:**
- H9: Zwei Peers berühren dieselbe Zelle → identischer Bauplan
- H10: Promotion-Broadcast geht durch (deterministische Spawns auf beiden)

### Risiken + Mitigations
- **Visueller Sprung (das wichtigste Risiko):** das Re-Wachstum aus
  variantSeed MUSS bit-genau die Geometry der Variante geben. Lösung:
  identischer Algorithmus (`_growTreeBlueprintRich`) + identische Seeds.
  Test H4 verifiziert.
- **Promovierte Bäume bei Welt-Wechsel:** der Set kann groß werden (~1000
  Cells). Snapshot-Cap-Wand (V18.211-Lehre): muss klein bleiben. ~24 Bytes
  pro Cell × 1000 = 24 KB, akzeptabel.

### Akzeptanz — das SEELEN-Band (Plan §13)
> „einen gescatterten Baum berühren → er wird ein echter Bauplan mit
> Provenienz, OHNE visuellen Sprung."
- Touch → Real funktioniert in 100% der Tests
- Visueller Determinismus-Match GEMESSEN (Geometry-Hash)
- P2P-deterministisch
- Provenienz reist mit dem geernteten Material
- **Browser-Sign-off der Schöpfer:** „die Welt fühlt sich lebendig an,
  jeder Baum ist real" — das ist das echte Akzeptanz-Kriterium

---

## §6 — Welle V18.218: Canopy + Wind Vertiefung (optional, klein)

**Ziel:** zwei Polish-Schritte auf V18.212.

### Mechanik

**P1 — Canopy chunk-streaming:** statt einer statischen 2km×2km-Mesh
folgt die Canopy dem Spieler. Pro 256m-Region eigener Mini-Canopy-Mesh.
Streaming-Pattern wie Voxel-Chunks.

**P2 — Per-Vertex flex/phase im Wind:** der V18.212-Wind ist global. Plan
§2.5 sagt: `flex/phase` pro Laub-Vertex gebacken. Wir backen ein Per-
Vertex-Attribut beim Foliage-Merge (V18.213) — leaf-spitzen flexen mehr
als leaf-knäuel-Zentren.

### Code-Anker
- `_buildCanopyShell` Z. 13290 (V18.212)
- `_buildToonNodeMaterial` Z. 23956 (Wind)
- `_growTreeBlueprintRich` foliage-emit-Block (Per-Vertex flex zu
  ergänzen)

### Tests (Band V18.218 — P1–P5)
- P1: Canopy-Mesh-Pro-Region existiert + folgt Spieler
- P2: foliage-Geometry trägt `aFlex`-Attribut (Per-Vertex flex)
- P3: Wind-Shader liest `aFlex` (Source)
- P4: Canopy-Disposal bei Region-Eviction (kein Memory-Leak)
- P5: Per-Vertex flex bewirkt sichtbar (Tip-Vertex bewegt sich mehr als
  Base-Vertex; gemessen via Vertex-Transform-Δ)

---

## §7 — Welle V18.219: Ω-P PBR (S-Gate 4, optional)

**Ziel:** Look-Entscheid Toon vs PBR. Plan §10 explizit als OPTIONAL.
Voraussetzung: Schöpfer-Browser-Sign-off von V18.213-V18.217.

### Mechanik

**Q1 — MeshStandardNodeMaterial-Pfad parallel zu MeshToonNodeMaterial:**
ein neues `_buildPbrNodeMaterial(opts)` analog zum Toon-Pendant.

**Q2 — Welt-weiter Look-Switch:** `state.atmosphere.materialMode =
"toon"/"pbr"`. Re-build alle Materials bei Wechsel.

**Q3 — Γ-M wandert ins PBR-Material:** Strata + Lichen + Iron-Bands als
TSL-Node-Graph im PBR-Material (V18.197–.200 Werte).

**Q4 — S-Gate 4:** Browser-Audit „Welt aus EINEM Stoff?". Wenn Schöpfer
PBR wählt, default-flag wird gesetzt; sonst Toon bleibt.

### Tests (Band V18.219 — Q1–Q6)
- Q1: `_buildPbrNodeMaterial` existiert
- Q2: Material-Mode-Switch funktioniert
- Q3: Γ-M-Tabellen sind in PBR-Material verbaut
- Q4: PBR-Schatten korrekt (Three.js' WebGPU-Shadow-Pipeline)
- Q5: Schöpfer-Browser-Sign-off-Wand (manual)
- Q6: Toon-Fallback bleibt funktional

---

## §8 — QUERSCHNITT-DISZIPLINEN (gelten in JEDER Welle)

1. **Determinismus + Stream-Gesetz (Γ5, V18.166):**
   - JEDER neue Noise-Stream eigener Suffix (`seed + "-scatter-tree"`,
     `seed + "-bake-fields"`, etc.)
   - KEIN `Math.random` im Welt-Substanz-Pfad

2. **P2P-Konsistenz (Stream-Gesetz):**
   - zwei Peers mit demselben Seed sehen IDENTISCHE Welt
   - Test pro Welle: zwei Mock-AnazhRealm-Instanzen mit gleichem Seed
     müssen gleiche Output produzieren

3. **Welt-Identitäts-Wand (V18.210-Lehre):**
   - jeder lazy-cached Helper wird in `_loadStateRestoreWorldMeta`
     resetted
   - Pro Welle prüfen: ist mein neuer Cache welt-bound? Wenn ja → reset

4. **Tag-Neutralität (V17.16):**
   - keine Material/Form-Combo-Erweiterung in einem Pfad, der
     `computeCompoundTags` füttert
   - Test pro Welle: V17.16-Wand grün (Spawn-Affinität unverschoben)

5. **Snapshot-Größe (V18.211-Lehre):**
   - `pinCurrentWorld` Cap = 256 KB
   - Wenn neue Welt-Data persistiert wird: prüfen ob f(seed)-derivierbar
   - Wenn ja: NUR Metadata persistieren, beim Restore re-bauen

6. **Worker-Mirror-Pflicht (V9.89-Lehre):**
   - Wenn die neue Mechanik die VOXEL-DENSITY beeinflusst, muss der Worker
     bit-identisch spiegeln
   - GPU-Compute (V18.215+) ist GPU-only, kein Worker nötig

7. **Read-as-stranger-Audit (V18.210-Lehre):**
   - NACH der ersten grünen Wand: feindlicher Selbst-Review (Sub-Agent)
   - Drei kritische Mängel oft NOCH versteckt — der Audit fängt sie

---

## §9 — TEST-EFFIZIENZ + GRUPPIERUNG

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
        // (C) Edge-Cases (null, empty, missing)
        // (D) Performance-Wand (max ms / max draws)
        return out;
    });
    // ... check-Calls
}
```

### Gruppierung
Pro Welle: 6-15 Wände. Aufteilung wie in §1-§7:
- (A) Source: 30%
- (B) Behavioral: 40%
- (C) Edge-Cases: 15%
- (D) Performance: 15%

### Shared Diag-Tools (eigene Files)
- `scripts/diag-draw-calls.cjs` — InstancedMesh-Zähler (V18.213)
- `scripts/diag-lod-distribution.cjs` — LOD-Pool-Verteilung (V18.214)
- `scripts/diag-bake-fields.cjs` — GPU-Field-Bake-Konsistenz (V18.215)
- `scripts/diag-scatter-density.cjs` — Per-Chunk-Tree-Counts (V18.216)
- `scripts/diag-promotion.cjs` — Touch→Real-Determinismus (V18.217)

### Gemeinsame Test-Sequenz pro Session
1. `npm run check` (syntax + lint + atlas)
2. `npm run format` (auto-format)
3. `node scripts/diag-tree-grammar.cjs` (V18.211-Probe)
4. NEU per Welle: `node scripts/diag-<welle>.cjs`
5. `npm run playtest` (alle ~3500 + neue Wände)
6. Browser-Sign-off (Schöpfer-Auge)

---

## §10 — ABSCHLUSS-KRITERIUM der Gesamt-Sequenz

### Headless-Wände
- Alle ~3500 + ~150 neue Wände grün
- diag-tree-grammar grün
- diag-draw-calls < 200 in dichten Regionen
- diag-promotion: 100% Determinismus-Match

### Performance-Wände
- FPS in dichtem Wald: ≥45 (auf Schöpfer-Maschine, AMD RDNA-3)
- Draw-Calls in 9-Region-Ring: ≤300
- Memory: <500 MB GPU-Heap

### Schöpfer-Browser-Sign-off (das ECHTE Akzeptanz-Kriterium)
- „Bäume wirken lebendig" (V18.211 ✓)
- „Wald wirkt dicht" (V18.216)
- „Berühren fühlt sich echt an, kein Sprung" (V18.217 — das SEELEN-Band)
- „Ferner Wald geschlossen" (V18.212 ✓)
- „FPS halten in dichten Regionen" (V18.213+V18.214)

### Plan-§13-Beweis-Bänder
- Säule I (Baum-Wahrheit): ✓ V18.211
- Säule II (Resonanz): EMERGENT durch worldFieldAt + computeCompoundTags
- Säule III (Dichte): V18.216
- ⟡ SEELEN-BAND (Ω-H): V18.217 — das wichtigste
- Säule IV (Makro-Schönheit): ✓ V18.212
- Säule V (Kohärenz/PBR): V18.219 optional

---

## §11 — SESSIONS-Schätzung

| Welle | Aufwand | Sitzungen |
|---|---|---|
| V18.213 Mesh-Merge | mittel | 1-2 |
| V18.214 LOD | mittel | 1-2 |
| V18.215 Ω-B GPU-Feld-Bake | groß | 2-3 |
| V18.216 Ω-S GPU-Compute-Scatter | groß | 2-3 |
| V18.217 Ω-H Promotion | mittel | 1-2 |
| V18.218 Canopy/Wind Vertiefung | klein | 1 |
| V18.219 Ω-P PBR (optional) | groß | 2-3 |
| **Gesamt (ohne §219)** | | **8-13** |

Realistisch in 8-13 Sessions vollendbar. Mit Browser-Sign-offs zwischen
jeder Welle.

---

## §12 — NACH GLOBAL-MERGE (Sweep-Samen für später)

- Mesh-Pool-Pattern (V11+ Lehre): persistente Material/Mesh-Pools statt
  per-Use-Disposes → noch FPS
- GPU-Driven-Rendering: alle Draw-Calls in einem indirect-Buffer →
  ultimative FPS
- Wasser-GPU-Sim (Pfad B, abgelegt nach V13): wenn der Schöpfer es
  wieder will, lebt der Plan in `docs/archiv/wasser-finale-form-plan.md`

---

## §13 — Risiko-Liste + Mitigations (kompakt)

| Risiko | Mitigation |
|---|---|
| WGSL-Compile-Crashes (V10.0-h.b) | Pipeline first als Diag-Kernel testen |
| Determinismus-Drift CPU↔GPU | NUR integer-Mathe im Hot-Path; transzendente nur in Toleranz-Tests |
| Visueller Pop bei LOD-Wechsel | Cross-Fade Alpha-Blend in Übergangszone |
| Visueller Sprung bei Promotion | identischer Re-Wachstums-Algorithmus (V18.211); Test H4 |
| Snapshot-Größe sprengt 256-KB-Wand | f(seed)-derivierbare Daten NICHT persistieren (V18.211-Lehre) |
| GPU-Bitmask out-of-sync mit CPU | Pro Promotion sofortiges Upload; Test H7 |
| Worker-Drift | NEU sind GPU-only Pfade kein Worker-Mirror nötig |
| Tag-Wand-Verletzung | V17.16-Wand-Test pro Welle |

---

**Mit diesem Plan kann die nächste Session strukturiert + effizient
durchziehen. Jede Welle ist isoliert testbar, hat klare Code-Anker, klare
Akzeptanz. Querschnitt-Disziplinen sind explizit. Risiken vorab benannt.**

**Die SEELE des Plans (Ω-H) ist die KRÖNUNG — V18.217 ist der Moment, wo
der GPU-Gigant wirklich lebt. Alles davor ist Foundation für diesen einen
Moment: Berühren → Echt.**
