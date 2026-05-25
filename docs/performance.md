# Performance-Welle — Design (V9.84+)

**Stand:** 25.05.2026 — geplant nach V9.83 (CI-Flake-Heilung via `_gameLoopTick`-Pumpe). Schöpfer-Befund nach dem V9.82-Welle-C-Bogen: „das spiel wird langsamer, ruckelhafter, mit fps-einbrüchen". Drei parallele Code-Audits (Game-Loop, Voxel-Chunk-Build, Allokationen + Renderer) lieferten ein klares Bild — die Performance liegt nicht in einem einzigen Engpass, sondern in einer Kette kleiner Verluste über drei Schichten. Dieses Doc trägt den Plan vorwärts.

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

### Welle Perf-2 — die Chunk-Build-Hebel (V9.85, ~1 Tag, weitere 15 %)

Heilungen 9–11. Pre-sampled Macro-Grid + Gradient-Normals nutzen `preDensity` + Frame-Time-Budget statt `MAX_PER_FRAME=1`. Löst die Streaming-Spikes wenn neue Chunks streamen.

**Akzeptanz Perf-2:**

- Diagnose-Tool (`scripts/diag-pump.cjs` wieder erschaffen, V9.83-Stil): per-Chunk-Build-Wall-Time ≤ 60 ms (vorher: 100–150 ms).
- Streaming-Ring (81 Chunks) füllt sich in < 5 s auf 60-FPS-Maschine (vorher: ~10 s).
- audit:strict 0 Failures.

### Welle Perf-3 — die tiefen Operationen (optional, V9.86+, je 1–2 Tage)

Heilungen 12–13. Lazy BVH-Collision + Chunk-Build in Worker. Nur wenn Perf-1 + Perf-2 das gefühlte Ruckeln nicht vollständig eliminieren. Greedy Meshing (14) bleibt explizit Backlog — Iso-Surface ist nicht Block-Voxel-kompatibel; eine eigene Diskussion.

---

## 5. Was BEWUSST nicht in dieser Welle steckt

- **Vision-Tiefe wird nicht angetastet.** Keine Kreatur-Anzahl reduzieren, keine Sicht-Reichweite kürzen, keine Effekte streichen. Die Welt soll dichter und schneller werden, nicht ärmer.
- **Keine Worker-Migration des Iso-Mesh** in Welle Perf-1 — der Refactor ist tief (Async-Lifecycle, Message-Protokoll, Determinismus-Garantien). Erst Perf-3.
- **Kein GPU-Compute-Shader** — würde Vision (deterministisches Worldgen für Multi-User-Welt-Seeds) brechen oder zumindest viel Engineering verlangen.
- **Greedy Meshing** — Iso-Surface ist nicht direkt kompatibel; eigene Architektur-Diskussion.
- **Crafting-Tiefe, Welle D/E/F/G** aus der Roadmap §1.1 — kommen NACH Perf-1+2. Eine schnellere Welt erhöht die Welt-Tiefe spürbar (weil der Spieler nicht durch Ruckler gestört wird) — Perf-1+2 ist die Brücke.

---

## 6. Vorbedingungen + Risiken

**Vorbedingungen:**

- V9.83 CI-Flake-Heilung ist gemerged (sonst sind die Perf-Tests nicht stabil messbar).
- `scripts/diag-pump.cjs` als wiederverwendbares Mess-Tool — wird in Welle Perf-2 wieder gebaut (war V9.83-Diagnose, dann gelöscht; sollte als Stamm-Werkzeug bleiben).

**Risiken:**

- **Allokations-Pool-Disziplin**: ein gepoolter `THREE.Vector3` darf NICHT in einer Closure festgehalten werden (sonst sieht der nächste Caller einen veränderten Wert). Test: alle gepoolten Stellen `grep`-prüfen, dass Werte vor Returns kopiert werden.
- **Spatial-Hash + Determinismus**: das Flocking läuft pro Frame, Reihenfolge der Nachbarn könnte sich ändern → Test prüfen ob Kreatur-Positionen deterministisch bleiben (Spielertests).
- **Material-Singleton**: ein geteiltes Material darf NICHT pro Chunk eigene Uniforms haben. Test: nach Wasser-Migration in Welle C wissen wir das (V9.43-c-Hydro-Material ist geteilt) — gleiches Pattern für `MeshToonMaterial`.
- **Lazy BVH-Collision**: ein Spieler kann durch teleport/DSL in einen fernen Chunk springen — wenn BVH dort fehlt, fällt er durch. Heilung: BVH-Build auf Teleport-Event triggern (synchron).

---

## 7. Ehrliche Performance-Reflexion

Diese Welle ist KEIN Selbstzweck — sie ist Vorbereitung für die System-Kopplungs-Wellen D (Kreaturen + Wasser), E (Emotion + lokale Welt), F (Cluster-Resonanz). Jede dieser Wellen fügt Per-Frame-Arbeit hinzu. Wenn V9.82 schon spürbar ruckelt, würde Welle D die Welt unbrauchbar machen. Performance-Welle räumt das Fundament auf, damit die Vision-Wellen wieder Platz haben.

Die Heilige Lektion warnt vor Komplexität ohne Fundament. Diese Welle ist Fundament-Pflege, nicht neue Komplexität — sie streicht oder pooled, mehr nicht. Das Ergebnis ist EINE Datei mit derselben Vision, schneller.
