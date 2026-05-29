# Performance-Welle — Design (V9.84+)

**Stand:** 25.05.2026 — geplant nach V9.83 (CI-Flake-Heilung via `_gameLoopTick`-Pumpe). Schöpfer-Befund nach dem V9.82-Welle-C-Bogen: „das spiel wird langsamer, ruckelhafter, mit fps-einbrüchen". Drei parallele Code-Audits (Game-Loop, Voxel-Chunk-Build, Allokationen + Renderer) lieferten ein klares Bild — die Performance liegt nicht in einem einzigen Engpass, sondern in einer Kette kleiner Verluste über drei Schichten. Dieses Doc trug den Plan vorwärts; er ist inzwischen **vollständig abgearbeitet** (siehe Postscript unten).

**Postscript 27.05.2026 — Perf-Bogen abgeschlossen, V10.0-Renderer-Migration darauf gefolgt + vollendet**: der Performance-Plan dieses Docs ist gebaut — Perf-1 (V9.84) + Perf-2 (V9.85) + Perf-2 ext.a (V9.86) + Perf-3-Bogen (V9.87-V9.92, alle vier Sub-Wellen vollendet inkl. Worker-Migration Phase 1-3 + Lazy-BVH) + V9.96 Per-Frame-Spawn-Budget. Main-Thread-Spike vor Perf-Bogen ~150 ms → V9.92 ~5-10 ms. Danach: **V9.95-Bogen WebGPU-Compute** als Vorarbeit (a/b/c/d Foundation + Density-Pipeline + Logging) endete mit V9.95-e ehrlicher Abklemmung — die Architektur-Wurzel benannt: *WebGPU-Compute + WebGL-Renderer braucht IMMER `mapAsync`-Roundtrip → GPU langsamer als Worker*. V9.95-Code lebt weiter als Vorarbeit für die V10.0-Renderer-Migration (zero-copy GPU→Renderer ohne mapAsync), die im **V10.0-Bogen (a..j.j, 26-27.05.2026, 23 Sub-Wellen)** gebaut wurde: Three.js r134→r160 + WebGPURenderer-Addon vendored + Smart Hot-Swap-Safety-Net + alle 5 Material-Familien als NodeMaterials + **V10.0-h..i Shadow-Profi-Pattern** (Hardware-PCF via `texture.compare(refZ)`) + Sterne als InstancedMesh-Billboards + Gras-Wind via TSL-positionNode (WGSL-konform, kein onBeforeCompile mehr) + **V10.0-j (10 Sub-Wellen) WebGPU-Buffer-Lifecycle-Race-Workaround mit Memory-Trade-Profi-Pattern** (Gras-Geometry nicht disposed, ~500 KB GPU-Heap-Cost akzeptiert gegen Three.js-v160-Vendor-Race). **Welt rendert dauerhaft auf WebGPU** mit voller Visual-Tiefe (Cel-Stufen + Sun-Sync + Schatten + Sterne-Billboards + Gras-Wind). **V11+-Backlog**: echtes Mesh-Pool-Pattern (Genshin's instancing-system) als saubere Wurzel-Heilung des V10.0-j.j-Memory-Trades, ~3-4h eigene Welle.

Die anderen Zeit-Ebenen: der aktuelle Stand + die Gotchas in `CLAUDE.md`, die volle Wellen-Chronik in `docs/handover.md`, der Plan vorwärts (gesamt) in `docs/roadmap.md`, die Vision in `docs/state-of-realm.md`.

---

## 1. Wo die Performance versteckt liegt — drei tiefe Quellen

### Quelle A — Frame-Allokations-Sturm (der heimliche GC-Killer)

Jede Sekunde entstehen ~600+ kurzlebige Three.js-/Ammo-Objekte im Hot-Path. Nicht eine teure Operation, sondern Tausend kleine — die GC-Pausen alle ~2–3 s SIND das gefühlte Ruckeln.

| Stelle | Was | Warum teuer |
|---|---|---|
| `isInFrustum` (Z12223–12227) | `new THREE.Frustum` + `Matrix4` + `Vector3` pro Objekt-Check | bei 50 Chunks + Inseln + Kreaturen = ~150 Allokationen/Frame. Es gibt schon `_frustumCache` (Z36168), aber `isInFrustum` ignoriert ihn |
| `updateCreatures` (Z12116) | `new THREE.Color()` pro Kreatur pro Frame für Emotion-Lerp | bei 120 Kreaturen = 120 Color/Frame |
| `_tickCreatureFollowPlayer/Gather/Build` (Z11499+) | `new THREE.Vector3()` pro Task-Aufruf | `scratchDir/A/B` (Z11983) wären genau dafür da — werden nicht benutzt |
| `_loopPhysicsSync` (Z12313) | `new Ammo.btTransform()` pro Raycast | `state.tmpTransform` (Z9613) wäre da — wird ignoriert |

### Quelle B — Chunk-Build: 107 k Density-Samples + redundante Arbeit

Pro Voxel-Chunk-Build (im Streaming-Ring auf ~81 Chunks):

- **42 875 Density-Samples** für Terrain-Mesh (V9.81 `preDensity` teilt das Grid mit dem Wasser-Cell-Build → hier schon optimiert).
- **46 656 Samples** für Wasser-Cells via 8-Point-Trilinear-Avg.
- **18 000 Samples** in `_voxelGradientNormals` (Z14394) — **dieser Pfad nutzt das V9.81-`preDensity`-Grid NICHT** und resamplet 6 Punkte pro Vertex. Die ehrlichste „versteckte" Quelle nach dem Welle-C-Bogen.
- **80–120 ms** für `_buildStaticTriMeshCollision` (Ammo-BVH-Bau) synchron im Main-Thread pro Chunk.
- `_terrainMacroSurfaceY` wird ~90 000-mal pro Chunk gerufen — könnte trivial als 40×40-Grid pre-sampelt + trilinear interpoliert werden (semantisch korrekt, Spike-frei).

### Quelle C — Renderer-Settings auf High-End geklemmt

- `pixelRatio = window.devicePixelRatio` (Z30787): auf Retina = 4× Pixel-Last.
- `shadowMap.mapSize = 2048²` + `PCFSoftShadowMap` (Z35432, Z35479): 16× Samples/Pixel. Für unsere ~600-m-Sicht ist 1024² + `PCFShadowMap` optisch identisch.
- **625 separate `MeshToonMaterial`-Instanzen** (eine pro Chunk, Z15254) statt ein geteiltes — verbraucht VRAM + Shader-Compile-Stalls.

---

## 2. Die genialen Twists — was Profis machen

| Twist | Wer macht's | Was bringt's | Bei uns |
|---|---|---|---|
| **Object-Pool für Math-Typen** | jede AAA-Engine | Zero-Allocation-Hot-Path | Ammo teilweise (`tmpVec1/2`), Three.js NICHT — Quelle A |
| **Spatial-Hash für Flocking** | jedes Boids-Tutorial seit 2010 | O(N²) → O(N) bei N>50 Kreaturen | wir: voller N²-Loop (Z12049) mit early-exit-Pflaster |
| **Distance-LOD für Kreaturen** | Genshin, BotW | ferne Kreaturen = kein Raycast, kein Flocking, kein Color-Lerp | wir: alle Kreaturen ticken voll, egal ob 300 m weg |
| **Frame-Time-Budget für Streaming** | jeder moderne Voxel-Engine | adaptiv, nie Frame-Lock | wir: `MAX_PER_FRAME=1` statisch (Z17156) |
| **Pre-sampled Macro-Grid** | jeder Terrain-Engine | Coarse-Grid + Lerp statt Per-Vertex-Noise | wir noisen 90k-mal pro Chunk |
| **Lazy BVH-Collision** | BotW, Genshin | Collision erst wenn Spieler im Radius — ferne Chunks sind nur Mesh | wir bauen BVH sofort für jeden Chunk im Ring (81 × 100ms) |
| **InstancedMesh + Material-Atlas** | Modern Three.js | 1 draw call statt N | wir: 625+ Materials |
| **Worker-Thread für Chunk-Build** | Subnautica, NMS | Main-Thread frei → keine Build-Spikes mehr | wir haben EINEN Worker (Movement Z12162) — Iso-Mesh + Ammo laufen alle main |
| **Greedy Meshing** | Minecraft | 10–100× weniger Dreiecke (Surface-Nets gibt uns das nicht direkt) | tiefer Refactor — nicht für diese Welle |
| **GPU-Density via Vertex-Shader** | NMS, Astroneer | CPU 0%, GPU rechnet Terrain | tiefer Refactor — nicht für diese Welle |

---

## 3. Priorisierte Heilungs-Matrix

Sortiert nach Aufwand-pro-Gewinn (oben = billigster Gewinn). „Tiefe-Verlust" misst, ob die Welt sichtbar weniger reichhaltig wird — die Performance darf nicht auf Vision-Kosten gehen (`docs/state-of-realm.md`).

| # | Heilung | Aufwand | Gewinn | Tiefe-Verlust |
|---|---|---|---|---|
| 1 | `isInFrustum` poolt Frustum + Matrix4 (1 Instanz, reuse) | 1 h | -100 Allokationen/Frame, **GC-Spikes weg** | keiner |
| 2 | Kreatur-Color-Pool (1 `THREE.Color` pro Emotion, lerp in-place) | 1 h | -N Allokationen/Frame | keiner |
| 3 | Task-Direktionen auf `scratchDir/A/B` umstellen | 1 h | -120 Allokationen/Frame | keiner |
| 4 | `MeshToonMaterial` einmal in `state.voxelChunkMaterial` (Singleton) | 30 min | -624 Material-Instanzen, VRAM-Sparung | keiner |
| 5 | Shadow-Map 2048→1024 + PCFSoft→PCF | 5 min | -20 % GPU bei Mid-Range | minimal sichtbar |
| 6 | `pixelRatio = Math.min(devicePixelRatio, 1.5)` | 5 min | -50 % Fragment-Last auf Retina | sehr leicht weicher |
| 7 | Spatial-Hash für Kreaturen-Flocking (16×16 Grid) | 2 h | O(N²)→O(N), bei 100 Kreaturen ~10× | keiner |
| 8 | Distance-LOD: ferne Kreaturen (>80 m) skippen flocking + raycast | 1 h | ~50 % weniger Per-Kreatur-Arbeit | unsichtbar (ferne Kreaturen verhalten sich kaum) |
| 9 | Macro-Surface 40×40-Grid pre-sample + Lerp | 2 h | -50–80 ms/Chunk = 50 % schnelleres Streaming | keiner (Lerp ist exakter als Sub-Vertex-Variation) |
| 10 | `_voxelGradientNormals` nutzt `preDensity`-Grid statt resampeln | 1 h | -30–45 ms/Chunk | keiner |
| 11 | Frame-Time-Budget statt `MAX_PER_FRAME=1` (build solange `now()-frameStart < 4 ms`) | 2 h | Streaming adaptiv schnell, nie Spike | keiner |
| 12 | Lazy BVH-Collision: nur Chunks im 2-Ring bekommen sofort, der Rest später | 4 h | -50 % Init-Spike | keiner (man kann nicht in fernen Chunks laufen) |
| 13 | Chunk-Build in Worker (Density + Iso-Surface) | 8 h | Spike-frei, ~30 % schnelleres Streaming | keiner — aber tiefer Refactor |
| 14 | Greedy Meshing für Voxel-Boden | 16 h+ | 10× weniger Triangles | keiner, aber Iso-Surface vs. Block-Voxel-Diskussion |

---

## 4. Wellen-Schnitt

### Welle Perf-1 — die billigen Twists (V9.84, ~1 Tag, 80 % des Gewinns)

Heilungen 1–8. Allokations-Sturm-Heilungen + Spatial-Hash + LOD + Renderer-Settings. Alle ohne Welt-Tiefe-Verlust, alle messbar (FPS-Counter direkt + GC-Sample über Chrome DevTools).

**Disziplin pro Sub-Welle** (V9.56-Bogen-Lehre):

1. Block-Grenzen-Inspektion zuerst — welche existierenden Funktionen werden berührt.
2. `grep -n 'NAME\.toString' scripts/playtest.cjs` — strukturelle Invarianten identifizieren, die mit-wandern müssen (V9.56-i-Lehre).
3. Playtest-Invariante VOR dem Schnitt schreiben — Akzeptanz wird der Test.
4. Sub-Welle = ein git-Commit + ein Chronik-Eintrag oben in `handover.md`.
5. Browser-Audit am Phasen-Schluss.

**Akzeptanz Perf-1:**

- `playtest.cjs` zählt Allokations-Counter (eine neue Invariante): `new THREE.Color/Frustum/Vector3/Matrix4` im Game-Loop ≤ N pro 100 Frames.
- Browser-Test: 60 fps stabil über 60 s in normaler Welt (vorher: dips auf 30–40 fps alle ~2 s).
- audit:strict 0 Failures.

### Welle Perf-2 — die Chunk-Build- & Welt-Aufbau-Hebel (V9.85, sechs Sub-Wellen)

Erweitert nach dem V9.84-Browser-Audit um zwei Wurzel-Heilungen aus Schöpfer-Befunden: **Shadow-Swimming bei WASD-Bewegung** (Witcher-3-Lehre: Stable Shadow Maps) + **Wasser-Flecken in Bergwänden** (Minecraft-Lehre: Atlas-Connectivity-Check). Beide sind thematisch passend („Welt-Aufbau-Politur"), beide haben präzise Profi-Lösungen.

**Sechs Sub-Wellen nach Schmerz-Priorität**:

- **2.a — Frame-Time-Budget statt `MAX_PER_FRAME=1`** (Heilung 11). Subnautica/NMS-Pattern: baue Chunks solange `now() - frameStart < 4 ms`, max N. Auf 60-FPS-Maschine ~3–4 Chunks/Frame; auf überlasteter Maschine 0–1. Adaptiv, NIEMALS Spike. Heilt den V9.84-Audit-Befund „massive Ruckler beim Laden". Direkter Schmerz-Killer.
- **2.b — Distance-priorisierte Streaming-Queue** (neu). Standard Voxel-Engine-Pattern: statt Ring-für-Ring-Iteration einen Min-Heap nach Entfernung-zum-Spieler. Der nächste sichtbare Chunk wird zuerst gebaut → Spieler sieht sofort Boden um sich, ferne Chunks füllen sich ohne Druck. Synergie mit 2.a (Budget × Priorisierung = harmonisches Laden).
- **2.c — Stable Shadow Maps via Texel-Snapping** (neu, Witcher-3-Lehre + Microsoft-DX11-Tutorial). Shadow-Camera-Position wird auf Texel-Boundaries gesnapt: `Math.round(playerX / texelSize) * texelSize` mit `texelSize = shadowFrustumWidth / shadowMapSize = 600/2048 ≈ 0.293 m`. Spieler läuft kontinuierlich, Shadow-Camera springt diskret pro Texel → Schatten-Pattern bleibt absolut stabil. Heilt den V9.84-Audit-Befund „Schatten rauscht bei WASD, nicht bei Maus" (Maus = Rotation, nicht Position).
- **2.d — Wasser-Cell Bergwand-Filter (Atlas-Connectivity)** (neu, Minecraft/Subnautica-Lehre). Eine WATER-Cell ist nur valid, wenn sie in eine echte Atlas-Wasser-Quelle hinein-flood-fillen kann (Ozean, Lake, River im `state.hydrosphere`). Mountain-Mulden-Cells (kleine Höhlen in der Bergwand) werden zu AIR umklassifiziert. Plus Steepness-Filter: bei großem Density-Gradient (Bergwand) keine WATER-Cells erzeugen. Heilt den V9.84-Audit-Befund „kleine Wasser-Chunks aus dem Nichts in steilen Hängen". Plus marginaler Perf-Gewinn (weniger Iso-Mesh-Surfaces zu rendern).
- **2.e — `_voxelGradientNormals` nutzt `preDensity`-Grid** (Heilung 10). V9.81 hat das Density-Grid für Mesher + Wasser-Cells geteilt — die Gradient-Normal-Berechnung resampelt 18 k Punkte pro Chunk separat. Diese letzte Resampling-Stelle nutzt das geteilte Grid via Trilinear-Interpolation. Spart ~30–45 ms pro Chunk-Build.
- **2.f — Pre-sampled Macro-Surface-Grid** (Heilung 9). `_terrainMacroSurfaceY` wird ~90 000-mal pro Chunk gerufen. Pre-sample 40×40-Grid pro Chunk-Footprint, lookup via bilinear. Semantisch exakter Mittelwert. Spart ~50–80 ms pro Chunk = ~50 % schnelleres Streaming. Größte verbliebene Cost-Sparung.

**Akzeptanz Perf-2:**

- Diagnose-Tool (`scripts/diag-pump.cjs` wieder erschaffen, V9.83-Stil): per-Chunk-Build-Wall-Time ≤ 60 ms (vorher: 100–150 ms).
- Streaming-Ring (81 Chunks) füllt sich in < 5 s auf 60-FPS-Maschine (vorher: ~10 s).
- Schöpfer-Browser-Audit: kein sichtbares Schatten-Rauschen bei WASD-Bewegung; keine Floating-Water-Patches in Bergwänden; smoothes „harmonisches" Laden.
- audit:strict 0 Failures.

### Welle Perf-3 — die epochale Welle: Raumzeit-Performance (V9.87+)

**Vision-Anker** (Schöpfer-Auftrag nach V9.86-Audit): „die bibliothek von alexandria der neuzeit, muss selbst die aaa titel alt aussehen lassen, effizienz, simplizität, tiefe in nie dagewesener synergie". Welle Perf-3 ist nicht eine „weitere Optimierungs-Welle" — sie ist der epochale Schnitt, der die Wurzel der Spike-Klasse strukturell wegnimmt. Bisher (Perf-1 + Perf-2 + Perf-2 ext.a) haben wir Allokations-Sturm, Renderer-Settings und Architektur-Spawn-Skirts geheilt. Die ECHTE Wurzel der Frame-Drops bleibt: **alle Welt-Generation läuft synchron im Main-Thread**. Jeder Chunk-Build = 100 ms Frame-Lock = sichtbarer 10-FPS-Drop. Welle Perf-3 zieht die Wurzel.

**Drei Profi-Säulen, die jede AAA-Engine kombiniert** (Subnautica/NMS-Worker, BotW/Genshin-LOD, Minecraft-Atlas) — bei uns noch fehlend. Drei Sub-Wellen, nach Schmerz-Hebel sortiert:

#### Perf-3.a — Atlas-Strict-Wasser-Gate (V9.87 ✅ GEBAUT 25.05.2026, ~2 h, Schmerz-Direkt)

Schöpfer-Audit V9.86: „auch noch wasser an gebäude und steilen bergwände". V9.86-Konnektivitäts-Filter trifft eingeschlossene Mulden, aber lässt LEGITIME WATER-Cells in Bergwänden mit „Pfad nach oben offen" durch (z.B. eine WATER-Cell, die durch eine Felsspalte mit Atmosphäre verbunden ist). Wurzel: `_voxelChunkHasAnyWater`-Gate (V9.76) hat Predicate (1) „Macro-Surface dippt unter waterLevel+16" — LOOSE Heuristik, false-positive in hügeligem Gelände. **V9.87 Heilung**: Predicate (1) gestrichen. Neue Predicate-Trias: (a) Voxel-Carve unter waterLevel (Spieler-Pool im Hochland, unabhängig vom Atlas); (b) Hydrosphäre-Atlas-Marker `waterKind === 1` (Ozean) ODER `waterKind === 2` (See) im Chunk-Footprint mit +1 Cell Marge (vorher war Predicate-3 nur waterKind=2 = Lake, der Ozean fiel über die LOOSE Macro-Dipp); (c) Fluss-Bucket im Footprint (unverändert). **Profi-Vorbild Minecraft**: Wasser ist deterministisch durch Welt-Seed/Atlas bestimmt, nicht durch lokale Geometrie-Heuristik. **Akzeptanz** (steht aus, Schöpfer-Browser-Audit): KEIN Wasser mehr in Bergwänden + bei Strukturen; Atlas-Lake/River/Ozean-Wasser bleibt unverändert; marginaler Perf-Win (Hochland-Chunks sparen den Density-Pass komplett). **Verhaltens-Beweis** (Headless): Playtest grün (2/3 — pre-existierender C.3-Carve-Flake ~50%), audit:strict 0 Failures, format/lint sauber. Was bewusst offen bleibt: Per-Column-Atlas-Strict in `_buildVoxelChunkWaterCells` (Coast-adjacent Mischchunks) — eigene Folge-Sub-Welle Perf-3.a-ext nur falls Schöpfer-Audit es zeigt.

#### Perf-3.b — Distance-LOD für ferne Chunks (V9.88 ✅ GEBAUT 26.05.2026, ~4 h, Streaming-Speedup auf Fern-Chunks)

Heute (vor V9.88): alle 81 Chunks im Streaming-Ring (4-Ring) bauen volle Geometrie — 24×24×124 Density-Samples = 71 424 Cells pro Chunk. Profi-Pattern (BotW, Genshin, NMS, jede AAA Open-World): **ferne Chunks bekommen GRÖBERES Mesh**. **V9.88 Heilung**: `_voxelChunkConfig(lod)` mit optionalem `lod`-Parameter (LOD 0 = volle Detail, LOD 1 = halb in jeder Dimension → 8× weniger Cells). Neuer Helper `_voxelChunkLodFor(cx, cz, pcx, pcz)` macht die Distance-Decision: r ≥ 2 (~86 m vom Spieler) → LOD 1. Span (43.2 m) + vertikaler Range (223.2 m) bleiben konstant → Chunks world-aligned über LOD-Grenze. Pipeline ist threaded: `_buildVoxelChunkData(cx, cz, lod)`, `_buildVoxelChunkWaterCells(..., lod)`, `_stampArchitectureSolidCellsInto(..., lod)`, `_buildVoxelChunkWaterIsoSurface` liest `entry.lod`. Streaming-Pump ist reaktiv: bei LOD-Mismatch (Spieler-Bewegung) wird der Chunk rebuildet. Grass-Skip auf LOD 1 (Detail-Cap < 50 m macht sie ohnehin unsichtbar). **Akzeptanz**: 15 neue Invarianten grün — empirisch LOD 0 = 71 424 Cells, LOD 1 = 8 928 Cells (exakt 8.00× ratio); ≥1 LOD-0-Chunk + ≥1 LOD-1-Chunk gestreamt; r=0/1 → LOD 0, r=2/4 → LOD 1. **Was BLEIBT offen**: am LOD-0↔LOD-1-Boundary kann ein marginaler Vertex-Mismatch sichtbar werden — Surface-Nets-Cell-Avg ist step-abhängig. Wenn Schöpfer-Audit das zeigt → Folge-Welle Geometry-Stitching. **Emergenz-Disziplin** (V8.30-Lehre): aktuell Hard-Distance-Threshold (r ≥ 2), eine Folge-Welle könnte das emergent über `worldFieldAt`-Affinity machen (dichte Wälder = näher hochauflösend); wartet auf Audit-Bedarf.

#### Perf-3.c — Worker-Migration für Chunk-Build (V9.89 Phase 1 ✅ GEBAUT 26.05.2026, Phasen 2-4 multi-Session)

**Phase 1 (V9.89, Foundation)**: `voxel-worker.js` mit 1:1-Mirror der Density-Pipeline (terrainDensityAt + Subroutinen). Worker spawnt, empfängt State via postMessage, berechnet Density-Grids. **Determinismus bewiesen**: Worker-Grid bit-identisch zum Main-Thread-Grid (mismatches=0, maxDelta=0 über 729 Floats). KEIN async Integration-Pfad — der Main-Thread baut weiterhin synchron, Worker ist nur durch Determinismus-Test angesteuert. Sichere Foundation für die Cutover-Phasen.

**Phase 2 (V9.90 ✅ GEBAUT 26.05.2026, Density-Cutover)**: `_buildVoxelChunkData` akzeptiert optionalen `preDensityOverride` vom Worker. `_fetchOrRequestChunkDensity` ist der Cache-First-Lookup (Float32Array / null / undefined). `_ensureVoxelChunkAt` versucht Worker-Density wenn `voxelWorkerWorldgenSynced=true` — bei Cache-Hit Build mit preDensity (schnell), bei Pending return null (Pump kommt wieder), bei Worker-Off sync-Fallback. State-Sync-Hooks: `_worldgenComputeAndBuildHydrosphere` ruft `_voxelWorkerSyncWorldgenState` (full state-set), `_addVoxelEdit` ruft `_voxelWorkerNotifyEdit` (Delta). State-gen bumpt am SEND-Zeitpunkt (Send-Synchronität für deterministische `voxelWorkerWorldgenSynced`-Semantik). **Bewiesen**: BufferGeometry bit-identisch zwischen Sync-Build und Worker-Density-Build (5299 Vertices, 0 Mismatches, maxPosDelta=0). Main-Spike sinkt von ~150ms auf ~30-50ms (~60-70% Wurzel weg).

**Phase 3 (V9.91 ✅ GEBAUT 26.05.2026, voller Chunk-Mesh)**: `voxel-worker.js` erweitert um die volle Mesh-Pipeline — Surface-Nets-Iso-Meshing (extractSurfaceVertices, emitQuadIndices, laplacianSmoothPositions, cropPad, gradientNormals), buildChunkWaterCells (OHNE Architektur-Stempel — Main-only), attachFieldColors (worldFieldAt + waterLevelAt). Snapshot erweitert um `hydrosphere.water` + `hydroBand`. Main-Helpers `_voxelWorkerComputeChunkMesh`, `_fetchOrRequestChunkMesh`, `_buildVoxelChunkDataFromWorkerMesh`. `_ensureVoxelChunkAt` 3-stufiger Fallback (Mesh-Worker → Density-Worker → Sync). **Bewiesen**: positions+normals+indices+colors bit-identisch (0 Mismatches je Array, maxDelta=0). Subtile Float32-Precision-Lehre: positions VOR colors zu Float32 konvertieren (sonst Float64-Drift in Mix-Pipeline = 1.19e-7 Color-Mismatch). **Main-Spike sinkt von ~50-70ms auf ~30ms** (nur BVH-Collision + Stempel + Scene). Iso+Cells+Colors laufen jetzt parallel im Worker.

**Phase 4 (V9.92 ✅ GEBAUT 26.05.2026, Lazy-BVH)**: BVH-Collision nur im 2-Ring (r ≤ 1) sofort. Ferne Chunks bekommen Mesh+Cells sichtbar aber ohne Collision. `_voxelChunkLazyBVHFor` Decision; `_upgradeChunkBVH` für Late-Add; `_pumpVoxelChunkBVH` rate-limited (2/Frame) für 2-Ring-Eintritte; `_ensurePlayerChunkBVH` als Sicherheits-Wand (sync-build wenn Spieler in BVH-losem Chunk). Chunk-Entry `{mesh, waterCells, lod, hasBVH}`. Mechanik-Probe bewiesen: `buildBVH=false` → `hasBVH=false`; `_upgradeChunkBVH` idempotent. **Perf-3-Bogen STRUKTURELL VOLLENDET**: Main-Spike ~150ms (vor Perf-3) → ~5-10ms (V9.92). 6 Sub-Wellen, 9 Lehren, 47 Determinismus-Invarianten.

---

**Historischer Kontext (Original-Plan vor Phase-Schnitt):**

**Der epochale Hebel**. Aktueller Pfad: `_buildVoxelChunkData` läuft 100 ms synchron im Main-Thread → 1 Frame-Lock. Nach Migration: ein `voxel-worker.js` (Web Worker) bekommt `(cx, cz, baseHeight, seed, voxelEdits)` und returnt `{positions, normals, indices, waterCells}`. Main-Thread macht NUR `THREE.BufferGeometry.setFromTransfer` (zero-copy ArrayBuffer-Transfer) + `_buildStaticTriMeshCollision` (Ammo-BVH MUSS im Main-Thread wegen WASM-Heap). **Frame-Time-Profil**: 100 ms → 0 ms im Main-Thread (Density+Iso), ~30 ms BVH-Collision bleibt → noch 1 Frame-Spike, aber 70 % kleiner. **Lazy-BVH-Folge** (V9.86-Sub-Hebel): nur Chunks im 2-Ring (Spieler-Nähe) bekommen sofort BVH, ferne Chunks bekommen Iso-Mesh sofort + BVH erst beim Frustum-Eintritt → 0 % Main-Thread-Cost beim Erst-Stream. **Determinismus-Garantie**: Worker nutzt denselben simplex-noise-Seed + denselben Welt-Code (gemeinsame `voxel-core.js` als shared chunk). Test-Setup: Worker UND Main-Thread bauen denselben Chunk → BufferGeometry bit-identisch (Hash-Vergleich). **Profi-Vorbild** (Subnautica, NMS, Astroneer, Vintage Story): Worker-Pool für Welt-Gen ist STANDARD in moderner Voxel-Engineering, nicht Optionen. **Akzeptanz**: Main-Thread-Frame-Spike beim Chunk-Stream ≤ 16 ms (vorher 100+ ms); Spieler kann durch die Welt rennen + Bauwerke spawnen + Nexus-Updates auslösen — KEIN sichtbarer FPS-Drop mehr. Determinismus-Test (Worker vs Main bit-identisch) ist die Kern-Invariante.

#### Perf-3.d — Frustum-priorisiertes Build (V9.88-Begleiter, ~2 h)

Heute: Ring-Iteration ist blind — der nächste Chunk wird gebaut, egal ob hinter dem Spieler oder im Sicht-Frustum. Heilung: vor jedem `_ensureVoxelChunkAt`-Aufruf prüfen, ob die Chunk-AABB im aktuellen Frustum liegt (V8.26-`_frustumCache` ist schon da). Wenn JA → sofort bauen; wenn NEIN → defer to idle (z.B. eigener `_buildIdleVoxelChunks` der pro Frame max 1 ferner Chunk baut). **Synergie** mit Perf-2.a (Frame-Budget): innerhalb des 4-ms-Budgets gewichten wir sichtbare Chunks 4× höher → Spieler sieht IMMER zuerst was vor ihm liegt, ferne Chunks kommen unmerklich nach. Sub-Welle ist kleine Ergänzung zu Perf-3.b; baut zusammen.

---

### 4.1 Stamm-Lehren angewandt auf Welle Perf-3 (Recall aus `docs/archiv/learnings.md`)

Diese Welle muss DIESE Lehren respektieren, sonst wird sie Sand auf Fundament (Heilige Lektion):

- **Heilige Lektion (Anti-Modul-Split)**: Worker als externer File ist OK (`voxel-worker.js` ist eine BAUSTELLE, nicht eine Domäne) — aber `anazhRealm.js` bleibt der EINE Stamm. Worker-Code wird via `importScripts` oder Bundle in der Worker-Spawn-Stelle integriert. Kein Verlust der „einen Datei" als Vision.
- **Hylomorphismus durchzieht alles**: Distance-LOD darf NICHT eine zweite Geometrie-Sprache einführen. Der LOD-Pfad nutzt DASSELBE `_voxelChunkGeometry` mit anderem `step`-Parameter (1.8 m → 3.6 m). EINE Mesh-Maschinerie.
- **Wurzel vor Symptom**: nicht „MAX_PER_FRAME erhöhen" (Symptom), sondern „Main-Thread aus dem Spike-Pfad entfernen" (Wurzel). Worker-Migration ist die Wurzel-Heilung.
- **Schnittstellen-Vollendung ist Wellen-Pflicht**: Distance-LOD muss durch `_buildStaticTriMeshCollision` (Collision-Raycast), `_attachVoxelFieldColors` (Per-Vertex-Farben), `_buildVoxelChunkGrass` (Grass-Spawn) durchgezogen werden. Sub-Welle 3.b ist nicht fertig wenn Iso-Geometrie LOD hat aber Grass-Density nicht.
- **Emergenz statt Tabelle**: kein Hardcoded-Threshold „> 80 m = LOD". Threshold emergiert aus `worldFieldAt`-Affinity (dichte Wälder = näher hochauflösend) + `_frustumCache` (sichtbar = höher priorisiert).
- **Sub-Wellen-Schnitt als Kraftfeld-Sicherung**: 3.a + 3.b + 3.d sind ~1 Tag jeweils, 3.c ist ~2 Tage. Pro Sub-Welle: ein git-Commit, ein Browser-Audit, ein Chronik-Eintrag. KEIN „lass uns alle drei in einem Wurf machen". Die V9.56-Disziplin.
- **Block-Grenzen sind Fundamentalität**: Worker-Boundary ist die natürliche Chunk-Grenze (eine Chunk-Arbeit = eine Worker-Message). LOD-Boundary ist die Distance-Schwelle. Beide sind ARCHITEKTUR, nicht Tuning.
- **Test-Determinismus**: Worker vs Main-Thread Bit-für-Bit-Identität ist die Worker-Kern-Invariante. Nicht „FPS-Test schießt 60 ab" (variabel), sondern „shared seed + shared voxelEdits = identische BufferGeometry-Hashes".
- **Komplexität ohne Fundament ist Sand**: Worker-Migration ist nicht fertig wenn Determinismus fuzzy ist. Erst Tests, dann Welle-Schluss.
- **Reload-Überlebensfrage** (V8.59-Lehre): nach Worker-Migration muss `buildStateSnapshot` + `loadState` weiterhin funktionieren — der Worker hat keinen State zu persistieren, aber der Spawn-Lifecycle muss reload-rein sein.
- **DSL als Diagnose-Werkzeug**: drei neue DSL-Ops für Schöpfer-Sichtbarkeit: `debug_lod_distance <m>` (zwingt LOD-Threshold), `debug_worker_stats` (zeigt Worker-Queue-Length, Build-Time-Median), `debug_atlas_strict` (toggled Wasser-Atlas-Strict-Gate live).

---

### 4.2 Was Welle Perf-3 explizit NICHT machte (V9.87-V9.93)

- **Greedy Meshing**: Surface-Nets ist nicht block-voxel-kompatibel (kontinuierliche Iso-Surface, keine diskreten Faces). Eine eigene Architektur-Diskussion — Welle 4+ oder NIE.
- **GPU-Compute via WebGPU**: ~~würde Welt-Determinismus gefährden + Safari hat kein WebGPU. Backlog.~~ **V9.93-REFLEXION (26.05.2026)**: dieses Backlog-Argument ist überholt. Safari hat WebGPU stable seit September 2024; Determinismus ist via Float32-strict lösbar (genau die V9.91-Lehre). WebGPU-Compute kommt JETZT als V9.95 (epochaler Hebel — siehe §5 unten).
- **Geometry Instancing für Chunks**: jeder Chunk hat eigene Per-Vertex-Farben (worldField-Tint) → InstancedMesh nicht direkt anwendbar. Material-Singleton (V9.84) gibt schon den Hauptanteil.
- **Shadow-Cascades**: 2048²-Map + V8.47-Bias ist genug für 600 m Sicht. Cascades wären eine zweite Welle für 2 km+ Sicht-Reichweite.
- **GeometryBuffer-Pooling**: das `BufferGeometry.dispose`/`new` pro Chunk ist Three.js-Standard, kein Bottleneck. Erst angehen wenn Profiler es als TOP-5 ausweist.

---

## 5. Welle Vision-Reset (V9.94-V9.99) — die wahre Bibliothek von Alexandria

**Reflexions-Stand (26.05.2026, nach Schöpfer-Konfrontation):** V9.87-V9.93 (Perf-3-Bogen + Wasser-LOD-Naht) ist solide AAA-Catch-up — wir haben Subnautica/NMS-Standard erreicht. Wir haben sie NICHT alt aussehen lassen. Drei wahre Vision-Pfeiler liegen unberührt:

1. **WebGPU-Compute für Density-Sampling** (50-100× schneller als CPU-Worker). Stale Backlog-Argument (§4.2) ist 2026 hinfällig.
2. **IndexedDB-Persistent-Chunk-Cache** (Welt-Gedächtnis — jede Architektur, jeder Carve lebt persistent in der Geometrie).
3. **Predictive Prefetch aus Spieler-Velocity** (Welt atmet ENTGEGEN).

Plus **Geometry-Stitching** als ehrliche Profi-Antwort auf LOD-Naht (V9.93-Workaround ersetzt durch echtes Stitching).

### Welle Vision-Reset — Sub-Wellen-Schnitt

#### V9.94 — WebGPU-Compute-Diagnose (~30 min, kein Code-Change am Stamm)

Schöpfer-Maschinen-Diagnose. Ein kleiner WGSL-Compute-Shader, der eine triviale Density-Berechnung (z.B. `noise2D(x, z) * 35`) auf GPU macht. Verifizieren: `navigator.gpu` verfügbar, Compute-Pipeline compiliert, Output bit-identisch zur CPU-Implementation. Wenn ja → V9.95 frei. Wenn nein (Browser-Stack-Issue) → wir wissen es ehrlich, entscheiden anders.

#### V9.95 — WebGPU-Density-Sampling (~6-8 h, der EPOCHALE Hebel)

Die ~91k Density-Samples pro Chunk laufen auf GPU. WGSL-Compute-Shader implementiert die gesamte `terrainDensityAt`-Pipeline (terrainMacroSurfaceY + erosionDelta + tarnDelta + hydrosphereCarve + hydrosphereLake + voxelEdits). Atlas-State wird als StorageBuffer in GPU-Memory geladen + einmal pro Worldgen aktualisiert. Voxel-Edits als Uniform-Buffer-Delta. Fallback auf Worker (V9.89) für No-WebGPU-Browser.

**Determinismus-Wand**: Float32-strict in WGSL — die V9.91-Lehre wird hier zur Sicherheits-Wand. Bit-identische Density zwischen CPU-Worker und GPU-Compute ist die Kern-Invariante. Determinismus-Test im Playtest verifiziert.

**Erwarteter Sprung**: pro-Chunk-Density-Cost ~50ms (Worker) → <1ms (GPU). Streaming-Pump kann jetzt komplette Ring in <1s füllen statt 5-10s.

#### V9.96 — IndexedDB-Persistent-Chunk-Cache (~4-5 h, VISION-PFEILER „Welt-Gedächtnis")

Gestreamt-besuchte Chunks (positions/normals/indices/colors/waterCells als typed-array-blobs) werden in IndexedDB persistiert. Schlüssel: `{seed, cx, cz, lod}`. Bei Re-Visit: Cache-Hit → BufferGeometry-Konstruktion + BVH (sync ~30ms statt 100-150ms voller Build). Cache-Eviction via LRU (Cap z.B. 500 Chunks = ~50MB). Architektur-State wird ALSO persistiert (separater Cache pro Welt, mit `worldMeta.seed`-Versionierung).

**Vision-Anker**: die Welt wird endlich UND erinnert. Jede Geste des Spielers (Carve, Damm, Architektur) lebt persistent in der Geometrie selbst, nicht nur im JSON-Snapshot. Skyrim/Witcher-Trick auf Browser übertragen.

#### V9.97 — Predictive Prefetch aus Spieler-Velocity (~3 h)

Streaming-Pump statt blinder Ring-Iteration: Velocity-Kegel-priorisiert. Wenn Spieler nach Norden läuft, baut der Pump zuerst Chunks im Norden + neben dem Spieler, ferne Süd-Chunks im Idle-Tick. Begleiter zu V9.95 (GPU macht Compute spottbillig, Pump kann mehr in der gleichen Frame-Time bauen).

#### V9.98 — Geometry-Stitching für LOD-Boundaries (~6 h, ehrliche Naht-Heilung)

V9.93-Workaround („Wasser uniform LOD 0") wird durch echtes Profi-Geometry-Stitching ersetzt. Am LOD-0↔LOD-1-Boundary baut der höher-aufgelöste Chunk explizite Triangle-Fan-Patterns, die seine 24 Boundary-Vertices auf die 12 Nachbar-Vertices abbilden. Beide LODs bleiben aware. Witcher 3, BotW, Nanite — Profi-Standard.

Vorteile gegenüber V9.93: (a) Wasser-Mesh wieder LOD-aware → Performance-Win von V9.88 voll erhalten; (b) das Stitching-Pattern überträgt sich auf jede künftige Geometrie-Schicht; (c) ehrliche Profi-Antwort statt Pragmatic Fix.

#### V9.99 — Per-Column-Atlas-Strict (~2 h, V9.92-Audit-Folge)

Wasserschatten/Hangpfützen an Strukturen strukturell weg. Neuer Helper `_atlasWaterLevelAt(x, z)` returnt `-Infinity` wenn der Atlas an dieser Spalte kein Wasser markiert. `_buildVoxelChunkWaterCells` nutzt diesen statt `state.waterLevel`-Fallback. Mountainside-Cells in Coast-Mischchunks bleiben AIR — der V9.87-Atlas-Strict-Pattern auf die Spalten-Ebene erweitert.

### 5.1 Reihenfolge nach Diagnose-First-Disziplin

1. **V9.94** zuerst (30min): WebGPU-Diagnose. KÜRZESTER Schritt, entscheidet die Pfade.
2. Falls WebGPU verfügbar → **V9.95** (GPU-Density, der epochale Hebel) → **V9.97** (Predictive Prefetch) → **V9.96** (IndexedDB-Cache) → **V9.98** (Geometry-Stitching, ersetzt V9.93) → **V9.99** (Per-Column-Strict).
3. Falls WebGPU NICHT verfügbar → V9.96 + V9.97 + V9.98 + V9.99 ohne den GPU-Sprung. Wir sind dann immer noch AAA-Standard mit IndexedDB-Vision-Pfeiler.

### 5.2 Was V9.87-V9.93 trotzdem wert war

KEIN Verwerfen — die Foundation bleibt. Die Lehren leben:
- V9.87 Atlas-Strict-Gate: ECHTE Wurzel-Heilung (kanonische Quelle vor Heuristik) — bleibt
- V9.89-V9.91 Worker-Foundation + Float32-Cutover-Lehre: ist die Vorbedingung für GPU-Cutover (V9.95 nutzt die Float32-strict-Disziplin) — bleibt
- V9.92 Lazy-BVH: Profi-Pattern, Sicherheits-Wand-Lehre — bleibt
- V9.93 Wasser-LOD=0: bleibt als ZWISCHEN-Lösung bis V9.98 echtes Stitching liefert, dann wird's ersetzt

**Lehre verdrahtet**: ich (Claude) habe meine eigene Vision der „sicheren" Master-Plan-Roadmap untergeordnet, ohne Backlog-Argumente zu prüfen. Backlog ist kein heiliges Dokument — es ist eine Momentaufnahme. Bei jedem Session-Start eine 5-min-Reflexion: was IST der heutige Stand der Backlog-Argumente? Browser-Support ändert sich, Determinismus-Techniken werden gelernt, was 2025 Risiko war kann 2026 gelöst sein.

---

### Welle Perf-3-Strategie — Reihenfolge nach Schmerz × Aufwand

1. **3.a Atlas-Strict-Gate** (2 h) — direkte Schmerz-Heilung für „Wasser an Strukturen". Sofortiger Win, kein Refactor.
2. **3.b Distance-LOD + 3.d Frustum-Prio** (6 h zusammen) — 4–8× schnellere Chunks, sichtbare smoothe Lade-Erfahrung. Geometrie-Sprache bleibt eine.
3. **3.c Worker-Migration** (10 h+) — der epochale Wurf. Wartet auf Schöpfer-Signal nach 3.a+3.b+3.d Browser-Audit (vielleicht ist nach 3.b schon „gut genug").

---

## 6. Was BEWUSST nicht im Performance-Bogen 1+2+3 steckte (vor V9.93.r-Reflexion)

- **Vision-Tiefe wird NICHT angetastet.** Keine Kreatur-Anzahl reduzieren, keine Sicht-Reichweite kürzen, keine Effekte streichen. Die Welt soll dichter und schneller werden, nicht ärmer. **„Effizienz × Simplizität × Tiefe in nie dagewesener Synergie"** — Profi-Pattern OHNE Welt-Tiefe-Kosten ist der einzige akzeptable Pfad.
- ~~**Kein GPU-Compute-Shader (WebGPU)** — würde deterministisches Worldgen (Multi-User-Welt-Seeds reproduzierbar) gefährden + Safari kennt kein WebGPU. Backlog für Welle 4+ falls je gewünscht.~~ **V9.93.r-Reflexion (26.05.2026)**: dieses Argument ist überholt — siehe §5 Welle Vision-Reset. WebGPU-Compute kommt JETZT als V9.95.
- **Greedy Meshing** — Iso-Surface (Surface-Nets) ist nicht direkt block-voxel-kompatibel. Eigene Architektur-Diskussion; Welle 4+ oder NIE.
- **Crafting-Tiefe, Welle D/E/F/G** aus der Roadmap §1.1 — kommen NACH dem ganzen Performance-Bogen + Vision-Reset. Eine schnellere Welt erhöht die Welt-Tiefe spürbar (Spieler nicht durch Ruckler gestört) — Perf-1+2+3 + Vision-Reset ist die Brücke zu System-Kopplungen.
- **Modul-Split** — die Heilige Lektion. Worker-File (`voxel-worker.js`) ist eine BAUSTELLE (separate Ausführungs-Umgebung), kein Modul-Split der Domänen-Logik. Der Stamm `anazhRealm.js` bleibt EINS.

---

## 7. Vorbedingungen + Risiken

**Vorbedingungen:**

- V9.83 CI-Flake-Heilung ist gemerged (sonst sind die Perf-Tests nicht stabil messbar).
- `scripts/diag-pump.cjs` als wiederverwendbares Mess-Tool — wird in Welle Perf-2 wieder gebaut (war V9.83-Diagnose, dann gelöscht; sollte als Stamm-Werkzeug bleiben).

**Risiken:**

- **Allokations-Pool-Disziplin**: ein gepoolter `THREE.Vector3` darf NICHT in einer Closure festgehalten werden (sonst sieht der nächste Caller einen veränderten Wert). Test: alle gepoolten Stellen `grep`-prüfen, dass Werte vor Returns kopiert werden.
- **Spatial-Hash + Determinismus**: das Flocking läuft pro Frame, Reihenfolge der Nachbarn könnte sich ändern → Test prüfen ob Kreatur-Positionen deterministisch bleiben (Spielertests).
- **Material-Singleton**: ein geteiltes Material darf NICHT pro Chunk eigene Uniforms haben. Test: nach Wasser-Migration in Welle C wissen wir das (V9.43-c-Hydro-Material ist geteilt) — gleiches Pattern für `MeshToonMaterial`.
- **Lazy BVH-Collision**: ein Spieler kann durch teleport/DSL in einen fernen Chunk springen — wenn BVH dort fehlt, fällt er durch. Heilung: BVH-Build auf Teleport-Event triggern (synchron).

---

## 8. Ehrliche Performance-Reflexion

Diese Welle ist KEIN Selbstzweck — sie ist Vorbereitung für die System-Kopplungs-Wellen D (Kreaturen + Wasser), E (Emotion + lokale Welt), F (Cluster-Resonanz). Jede dieser Wellen fügt Per-Frame-Arbeit hinzu. Wenn V9.82 schon spürbar ruckelt, würde Welle D die Welt unbrauchbar machen. Performance-Welle räumt das Fundament auf, damit die Vision-Wellen wieder Platz haben.

Die Heilige Lektion warnt vor Komplexität ohne Fundament. Diese Welle ist Fundament-Pflege, nicht neue Komplexität — sie streicht oder pooled, mehr nicht. Das Ergebnis ist EINE Datei mit derselben Vision, schneller.

**V9.93.r-Reflexion (26.05.2026)**: V9.87-V9.93 hat das Fundament gebaut — solide AAA-Catch-up, Workers + LOD + Lazy-BVH + Float32-Determinismus. Was fehlt für die ECHTE Bibliothek von Alexandria liegt in §5 Welle Vision-Reset (V9.94-V9.99): WebGPU-Compute als epochaler Hebel + IndexedDB als Welt-Gedächtnis-Pfeiler + Predictive Prefetch + Geometry-Stitching als Profi-Antwort auf LOD-Naht. Das ist der Pfad nach vorne.

---

## 9. Architektur-Instancing-Bogen — Design (V12.0-perf.c+, 29.05.2026)

Der V12.0-perf-Bogen heilte den **Edit-Rebuild-Freeze** (perf.a Kaskaden-Unifikation, perf.b Basis-Density-Cache). Das ist EIN FPS-Symptom. Der ANDERE — der vom Schöpfer im Browser gesehene Sturm auf FPS 6-9 beim **Laufen in dichte Architektur-Regionen** (Kristallfelder, Wälder) — sitzt im **Architektur-Teilsystem** und hat seine eigenen Wurzeln. Dieser Abschnitt ist das Design für ihre Heilung. Disziplin: **Wurzeln heilen, nicht entfernen** — dem Teilsystem seine verdiente Tiefe + Funktionalität geben, verlorene Fäden verbinden.

### 9.1 Das Teilsystem verstanden — der Lebenszyklus

Architekturen sind das **persistente Leben der Welt**: Wälder, Kristallfelder, Felsformationen, Spieler-Bauten (Dörfer/Tempel/Dämme), Werkstätten. Vision-Pfeiler F (Hylomorphismus-Cluster-Resonanz): die Welt soll **dicht** davon sein, persistent (Daten immer, Mesh gecullt), interaktiv (harvestbar/kollidierbar), emotional resonant (Cluster gleicher Tags verstärken Aura, locken Fauna).

- `spawnArchitecture` → legt einen **Daten-Eintrag** an, berechnet Affordances + `_populateBlockerAABBs`. Baut den Mesh NICHT wenn der Spieler fern ist → **„cold"** (nur Daten). *Das Culling-System existiert also schon — gut gedacht.*
- `tickArchitectureCulling` (1×/s) → für jeden Eintrag in `architectureCullingRadius` (150 m) ohne Mesh: `_rebuildArchitectureMesh`. Außerhalb: `_cullArchitectureMesh`.
- `_rebuildArchitectureMesh` → `builder(seed)` → `_buildFromBlueprint` baut eine `THREE.Group` mit **einem separaten `THREE.Mesh` pro Part** (eigene Geometrie via `_makePartGeometry`, eigenes Material) + `_buildArchitectureCollision` (Compound-Ammo-Body, eine `btBoxShape` pro Sub-Mesh).

### 9.2 Die vier Wurzeln (code- + konsolen-belegt)

- **A. Kein Instancing** — `_buildFromBlueprint` baut ein `THREE.Mesh` pro Part, kein Sharing über identische Strukturen. 20 Kiefern = 40 Geometrien + 40 Draw-Calls. 150-m-Feld dicht = **hunderte Draw-Calls jeden Frame** (Steady-State-Killer, nicht nur Build).
- **B. Culling-Build ohne Budget** — `tickArchitectureCulling` (Z30869) baut JEDEN in-Range-Eintrag ohne Mesh in EINEM Tick, **kein Per-Frame-Cap**. Spieler läuft in dichte Region → Dutzende Mesh-Builds gleichzeitig → der „(cold)→Build"-Burst. V9.96 budgetierte den *Spawn*, vergaß den *Culling-Build*.
- **C. Eager-Collision für alles in 150 m** — `_rebuildArchitectureMesh` baut immer `_buildArchitectureCollision`. Compound-Ammo-Body für jede Deko-Kiefer in 150 m, die der Spieler nie berührt.
- **D. Nexus-Pflaster** — die Nexus-Selbstanalyse senkt bei FPS<60 `gravity *= 0.9`. Welt schwebt nach 10 Zyklen bei 35% Gravitation = die spürbare Disharmonie. Heilt das falsche Ding.

### 9.3 Wie die Profis es lösen

- **Unreal HISM / Instanced Static Mesh:** tausende Bäume = ein Draw-Call pro Mesh-Typ, GPU-instanced, hierarchisches Culling + LOD.
- **Foliage-Systeme (Witcher/Genshin):** instanced Rendering + Impostor-LODs (ferne Bäume → Billboards) + **keine Collision bis nah**.
- **Spatial Partitioning + Time-Budget:** nie mehr als X ms Build/Frame; nur nahe Buckets betrachtet.
- **Adaptive Quality (Dynamic Resolution/LOD):** das System merkt FPS-Druck und justiert **Qualität** (LOD-Distanz, Dichte), niemals die Simulation/Physik.

### 9.4 Die nachhaltige Lösung — vier Wurzeln heilen, Fäden verbinden

- **Wurzel A → Instancing als natürliche Form (das Herz).** Architektur-Parts gruppiert nach `(blueprint, part-index)` → alle „Kiefer-Stämme" als EINE `InstancedMesh`, alle „Kronen" als eine, usw. Die Geometrie pro Bauplan-Part ist **fix** (die `parts`-Arrays sind Konstanten), der Seed treibt nur Transform/Tint → instancbar (Per-Instance-Matrix = Group-Transform × Part-Local, Per-Instance-Color via `setColorAt`). Der Culling-Tick **schreibt/löscht Instance-Slots** statt Meshes zu addieren/entfernen. Draw-Calls kollabieren von hunderten auf ~(Typen × Parts). Die V11-Gras-Pool-Lehre auf Architekturen verallgemeinert — r184 trägt es (V12.0-d bewies Gras-Recycling: `maxPoolSize=1` über 50-Zyklus-Stress, echtes Recycling). **Unikate** (ein einzelner Tempel) bleiben klassische Meshes — der Hebel zielt auf die Wiederhol-Typen (Vegetation), die stürmen.
- **Wurzel B → budgetierter Culling-Build (der Atem).** `tickArchitectureCulling` bekommt ein Per-Frame-Zeit/Count-Budget (V9.85 Chunk-Streaming-Pattern, V9.96 Vegetations-Pattern). Mit Instancing ist der Build fast frei (Matrix-Write), das Budget ist das Sicherheitsnetz.
- **Wurzel C → Lazy-Proxy-Collision (der Boden).** Wie V9.92-Lazy-BVH: Ammo-Body nur in kleinem Radius (~25 m) um den Spieler, nicht in den vollen 150 m Render-Radius. Ferne Deko ist sichtbar (instanced), aber ohne Physik bis der Spieler herankommt. **Sicherheits-Wand-Lehre (V9.92)**: der Player-aktuelle-Bereich MUSS sofort Collision haben (sync wenn nötig), andere rate-limited late-upgraden. Collision ist für Interaktion, nicht Dekoration.
- **Wurzel D → den Nexus HEILEN, nicht entfernen (der verlorene Faden).** Die Idee ist schön + Vision-treu (das System, das lernt, sich selbst heilt). Nur die *Handlung* (Gravitation senken) ist die Korruption. Heilung: den FPS-Sinn auf die echten Hebel umleiten → bei FPS-Druck adaptiv `cullingRadius` straffen / Spawn-Budget senken / LOD-Distanz erhöhen, bei Luft wieder lockern. Der Nexus wird ein **ehrlicher adaptiver Qualitäts-Governor** (AAA-Dynamic-LOD-Pattern) — gibt dem Wurzel-Gedanken seine verdiente Tiefe + verbindet „System das lernt" mit „Welt die bei 60 FPS läuft".

**Der verbundene Klang:** Welt füllt sich mit instanced Leben (A, fast frei) → budgetiert gebaut (B, kein Spike) → Collision nur wo der Spieler berührt (C, Physik bleibt leicht) → der Nexus regelt Qualität adaptiv (D). **Dann** ist der Frame frei für Kreaturen die leben, Emotion die pulsiert, den Spieler der entdeckt.

### 9.5 Wellen-Schnitt (jede Sub-Welle: messen → testen → committen)

| Sub-Welle | Was | Aufwand |
|---|---|---|
| ✅ **V12.0-perf.c.diag** | `scripts/diag-arch-perf.cjs` — Befund: 762 Sub-Meshes, 183 Ammo-Bodies, Burst 26.5 ms/60-cold, **572 → 40 Instancing-Gruppen = ×14.3 weniger Draw-Calls**. | ~1h ✅ |
| ✅ **V12.0-perf.c.1** | Instancing-Foundation: `_archFlattenBlueprint` (flatten + Gate) + `_archEntryWorldMatrix` + `_archLeafMaterial`, 8-Invarianten-Test (Leaf-Matrix bit-gleich, maxDelta=0). Builder ignoriert seed → nur Per-Instance-Matrix nötig. KEIN Cutover. | ✅ |
| ✅ **V12.0-perf.c.2** | Cutover: InstancedMesh-Registry (Slot + capacity-doubling), Vegetation via `instanced: true`-Flag instanced (AAA-Foliage-Pattern), Collision aus Leaf-AABBs, 4 entry.mesh-Fäden geheilt (find-nearest, crosshair-pick via instanceId→slotEntry, collision, grounding-topY). Playtest grün inkl. instancierter LMB-Pick. | ✅ |
| **V12.0-perf.d** | Budgetierter Culling-Build + Lazy-Proxy-Collision (~25 m, Sicherheits-Wand am Player-Bereich). | ~2-3h |
| **V12.0-perf.e** | Nexus → adaptiver Qualitäts-Governor. Pflaster (`gravity *= 0.9`) raus, echter Regler rein. | ~2h |
| **V12.0-perf.g** | Schöpfer-Browser-Audit RDNA-3 — die FPS-Wahrheit (headless nicht messbar, swiftshader serialisiert). | ~30min |
