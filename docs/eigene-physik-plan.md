# DER DETERMINISMUS-BOGEN — die eigene voxel-native Physik

> **Status:** P0 + P1a + P1b **GEBAUT** (Feld-Collider-Helfer + Kapsel-Character-Controller, A/B hinter `state.fieldPhysics`, Default AUS). Die Mechanik trägt (Linsen grün); **das FEEL wartet auf den Schöpfer-Browser** (§9 — Chat-Befehl `feldphysik` umschalten, A/B vs Ammo). Nächster Code: P2 (Kreaturen + Boxen + Raycast) NACH dem Feel-Sign-off. Der Rest (§5.3/§5.5/§6 Box-Schicht-Details) bleibt Spezifikation.
> **Branch (reserviert):** `claude/confident-noether-yczn0c` (Noether — die Erhaltungsgröße; Determinismus).
> **ENTSCHIEDEN (Schöpfer, 22.06.):** Ammo muss RAUS — voll. Kollision FELD-NATIV (gegen `terrainDensityAt`, kein Collision-Mesh, kein BVH-Build). „Sonst bringt das, was wir tun, ja gar nichts."
> **Trigger — ZUERST lesen bei:** Physik · Kollision · Character-Controller · Bewegung · BVH · Ammo · Determinismus · Lockstep · Replay · Rollback · „der Spieler fällt/hängt/tunnelt".
> **Flankiert von:** `docs/archiv/wahrerbauplan.md` (Ω-PHYSIS — der Stabilitäts-/Lastpfad-Richter für Bauplan-Statik, BLEIBT die Autorität dafür; DIESER Plan ist die BEWEGUNGS-/Kollisions-Schicht, nicht die Bauplan-Statik). `docs/das-lebendige-feld.md` (der wahre Norden — die Physik tritt dem Feld bei).

---

## 0. Die Frage + die entschiedene Antwort

> „Eigene Physik scheint der nächste Gigantenschritt, oder? Die Performance soll spriessen, selbst Profis in den Schatten stellen."

**Ja — in der EINEN richtigen Lesart.**

- **Die FALLE (Sand-Weg, Heilige Lektion):** Bullets Rigid-Body-/Constraint-Solver nachbauen (Stacking, Ragdoll, Gelenke, Stoß-Impulse). Jahrzehnte Arbeit, am Ende ein *schlechteres* Bullet. Stellt niemanden in den Schatten.
- **Der GIGANTENSCHRITT (entschieden):** Die Kollision **LIEST die kanonische Welt-Wahrheit — das Dichtefeld** `terrainDensityAt(x,y,z)` — direkt, statt eine redundante Dreiecks-BVH daraus abzuleiten. **Ammo fällt ganz weg.** Das kann eine General-Engine NICHT, weil sie die Welt nur als undurchsichtige Dreiecke kennt. Wir kennen die reine Funktion → wir zahlen weder Mesh-Bau noch BVH noch WASM-Heap, sind deterministisch by construction, und Edits sind sofort begehbar.

---

## 1. Stand der Technik — was die Besten der Besten tun (geerdet, mit Quellen)

| Wer | Was | Lehre für uns |
|---|---|---|
| **Astroneer** | Dichtefeld pro Voxel + Marching Cubes → *glatte* Oberfläche (nicht blockig). Verformen = Dichte ändern + Chunk re-polygonisieren. | **Unser exaktes Pendant** — ABER Astroneer kollidiert gegen das MESH, nicht das Feld. Selbst der nächste Verwandte machte den Feld-nativen Sprung NICHT → unser Schritt ist kühner als der Industrie-Standard. Das ist die „kaum ein zweiter kann"-Marke. |
| **Quake / Fauerby / PhysX CCT** | *Collide-and-slide* Character-Controller: bewege → Kontakt finden → Velocity auf die Kontakt-Ebene projizieren (gleiten) → 2-3× iterieren. „Wenig Physik, viel getuntes Gefühl." | Der bewährte FEEL-Kern. Wir übernehmen collide-and-slide, nur die Kontakt-Ebene kommt aus dem Feld-Gradient statt aus Dreiecken. |
| **NVIDIA / Macklin — „Local Optimization for Robust SDF Collision"** | SDF-Kontakt: der Gradient ∇ϕ ist die Auswurf-Richtung, innen negativ, außen positiv. | Der Gradient des Feldes gibt die Kontakt-Normale. ABER: unser Feld ist KEIN echtes SDF (Wert ≠ Distanz) — das ist die zentrale Subtilität, gelöst in §5.1. |
| **StarCraft** (Fixed-Point) vs **AoE2 HD** (strikte Float-Flags) | Determinismus für Lockstep: entweder Integer-Fixed-Point ODER strenge Float-Disziplin + Per-Plattform-Tests. Cross-Plattform (verschiedene FPUs) ist die Bruchstelle. | Bestätigt die 3 Determinismus-Stufen (§7): Replay (trivial) → Gleich-Browser-Lockstep (Float-Disziplin, AoE2-Stil) → Bit-Lockstep heterogen (Fixed-Point, StarCraft-Stil, eigener Bogen). |

Quellen: [NVIDIA/Macklin SDF Collision](https://mmacklin.com/sdfcontact.pdf) · [iquilezles SDF distfunctions](https://iquilezles.org/articles/distfunctions/) · [Astroneer voxel terrain (Game Developer)](https://www.gamedeveloper.com/design/what-i-astroneer-i-s-devs-learned-while-leaving-early-access) · [Gaffer On Games — Floating Point Determinism](https://gafferongames.com/post/floating_point_determinism/) · [Cross-platform RTS & float indeterminism (Game Developer)](https://www.gamedeveloper.com/programming/cross-platform-rts-synchronization-and-floating-point-indeterminism) · [Lockstep RTS gold standard](https://www.socratopia.app/library/math-for-game-devs-en/chapter-30) · [PhysX Character Controllers](https://nvidia-omniverse.github.io/PhysX/physx/5.4.1/docs/CharacterControllers.html).

---

## 2. Der Befund heute (gemessen, file:line)

### 2.1 Ammos Rolle ist winzig — aber überall verzweigt
- **Ein** `btDiscreteDynamicsWorld` (`:13758`), SequentialImpulse-Solver, Dbvt-Broadphase.
- **Spieler:** `btBoxShape(0.5,0.5,0.5)`, `mass=1`, `lockRotation` (`:71588`). KEIN `btKinematicCharacterController` — Bewegung per `setLinearVelocity` jeden Frame, Erdung per 9 Raycasts.
- **Kreaturen:** `btBoxShape`, `mass=0.5` (`:15137`), max 20.
- **Statisch (`mass=0`):** Terrain-Chunks (`btBvhTriangleMeshShape`, ~81), Architektur (`btCompoundShape`, Cap 48), Inseln (`btBvhTriangleMeshShape`).
- **Schritt:** `stepSimulation(delta, 5, 1/60)` (`:72543`).
- **Kein** Stacking/Ragdoll/Constraints. Nur character-controller-artige Bewegung.

### 2.2 Der Rest-Freeze ist der sync BVH
- `_buildVoxelChunkBVH` (`:12855`) → `_buildStaticTriMeshCollision` (`:57644`, `btBvhTriangleMeshShape` `:57707`), **synchron Main-Thread**, ~10 ms/Chunk; bis 9 inline = der 294-ms-Lauf-Spike (`:25914`). V18.271 entschärfte den Hauptschlag — die Wurzel steht.

### 2.3 Das halbe Fundament STEHT SCHON (feld-nativ)
- **`getTerrainHeightAt(x,z)` ist feld-nativ** (`:73691`) → `_voxelSurfaceY` (`:29415`) → `_terrainDensityAt`. Der Ammo-Heightfield-Fallback wurde V9.38 geschnitten.
- **`_softFloorWhileChunkLoading` (`:72494`) beweist die voxel-native Stützung** — hält den Spieler heute schon an der deterministischen Höhe, wenn die BVH lädt. Der Plan macht das vom Fallback zum **Primärpfad**.
- **`_runRaycast` (`:69957`) ist der EINE Chokepoint für ALLE Raycasts** — 5 Aufrufer. Sein Inneres tauschen = alle Aufrufer geerbt heilen (Gesetz #0).

### 2.4 Die kanonische Welt-Wahrheit (rein, deterministisch)
- `_terrainColumnContext(x,z)` (`:24605`) — 2D-Spalten-Arbeit, einmal/Spalte. `_terrainBaseDensityAtCol(x,y,z,ctx)` (`:24639`) — per-Voxel-3D. `_terrainDensityAt(x,y,z)` = base + Voxel-Edit-Deltas. `> 0` solide, `≤ 0` Luft/Wasser. Bit-identisch Main+Worker.

---

## 3. Die These — Gesetz #0 + der wahre Norden

**Die kanonische Größe dieser Domäne ist `terrainDensityAt`. Die Kollision LIEST sie.** Heute: `Feld → Mesh → Dreiecke → BVH (sync) → rayTest` (vier Schichten, eine ein Block, alle redundant). Morgen: `Feld → analytische Abfrage`.

**Vision-Ausrichtung (nicht nur Perf):** der wahre Norden ist *das lebendige Feld* — die Welt als EIN Feld, das alle **lesen · schreiben · werten**. Feld-native Physik ist die Physik, die dem Feld **BEITRITT**: die Kollision wird ein weiterer *Leser* der kanonischen Größe — wie `auraAt`/`deposit`. „Der Spieler steht auf dem Boden" = „der Spieler liest das Feld". Ammo war eine fremde WASM-Blackbox, drangeschraubt; danach ist die Physik Teil der Welt, die die Welt schon IST. Und Determinismus ist die Brücke zur Co-Schöpfungs-Vision (Mensch + KI, Lockstep/Replay).

---

## 4. Die SCOPE-Grenzen (verbindlich — die Anti-Sand-Wand)

**IN (die schmale Voxel-Rolle):**
1. Spieler-Character-Controller gegen das Feld (volle 3D — Höhlen/Überhänge/Decken).
2. Kreatur-Kollision gegen Feld (sie steuern heute auch nur, kein Kontakt-Solver).
3. Analytische Box-Kollision gegen Architektur + Inseln.
4. Schwerkraft + Velocity-Integration + Fall-Cap + Auftrieb (Logik existiert, nur ohne Ammo).
5. Raycast-Ersatz (Feld-DDA + Box-Ray) im EINEN `_runRaycast`-Chokepoint.

**OUT (der Sand-Weg — NICHT bauen):** genereller Rigid-Body-Solver, Impuls-Stacking, Kisten-Türme, Ragdoll, Gelenke, Constraints, Reibungskegel, Rest-Kontakt-Mannigfaltigkeiten, allgemeine Konvex-Konvex-Kollision. **Außerhalb dieser Liste „nötig"? ZUERST fragen (Schöpfer-Entscheid), nie heimlich erweitern.**

---

## 5. Die Algorithmik (die spezifische Implementierung)

### 5.1 Der Feld-Collider — und das „kein-echtes-SDF"-Problem
**Wurzel:** `terrainDensityAt > 0` sagt innen/außen, aber der *Wert* ist KEINE euklidische Distanz. Naive „push out um density" wäre falsch skaliert.

**Lösung (Macklin-Gradient + Robustheit gegen Nicht-SDF):**
```
_fieldSolid(x,y,z)       = terrainDensityAt(x,y,z) > 0          // liest Edits mit
_fieldGradient(x,y,z)    = Zentral-Differenzen über 6 Samples
                           (±eps in x,y,z) → ∇density
_fieldResolve(p, radius) = bei _fieldSolid(p):
                             n = normalize(-∇density)           // Auswurf-Richtung
                             schritt = clamp(density / |∇density|, 0, radius)  // 1.-Ordnung-Distanz, GEKLAMMERT
                             p += n * schritt                   // Dichte nur als Schritt-HINWEIS
                           iteriere 2-3×
```
- Die Dichte ist nur **Schritt-Hinweis** (geklammert), nicht präzise Distanz → robust gegen die Nicht-SDF-Ungenauigkeit. AnazhRealms Terrain ist glattes differenzierbares Noise → der Gradient ist sauber.
- `eps` ≈ halbe Voxel-Schrittweite (an die Roughness-Wellenlänge gekoppelt — die `diag-normals`-Lehre).

### 5.2 Der Character-Controller `_stepCharacter(body, dt)` — collide-and-slide
- **Form:** Kapsel (Radius ~0.45, Höhe ~1.8) = 2-3 Kugeln entlang der Achse (Schöpfer-Entscheid Kapsel vs Box, §13).
- **Schritt:** bewege um `v·dt`; für jede Kugel `_fieldResolve`; bei Auswurf die Velocity auf die Kontakt-Ebene projizieren (`v -= n·(v·n)`) = gleiten; 2-3× iterieren (collide-and-slide).
- **FEEL — exakt erhalten (die Gefühl-Wand, §9):** die exp-Lerp-Kurven `f = 1−e^(−k·dt)` (`:72782`), `k=14` Boden / `4.5` Luft / Brems `18`/`1.5`, Slope-Penalty `0.2` (`:72781`), Coyote-Time, `jumpPower`, der Decken-Klammer (`_ceilingHeadroom`). **Die Bewegungs-LOGIK bleibt 1:1 — nur die AUFLÖSUNG wechselt von Ammo-Velocity zu eigener Integration + `_fieldResolve`.**
- **Bodensnap + Stufen-Schwelle:** Abwärts-DDA-Probe (`_fieldSurfaceBelow`) statt 9 Raycasts; `step-up` ~0.5 m (über kleine Kanten — hier wird der Controller SAUBERER als die heutige Box). Erdung + `groundNormalY` + `onSteepSlope` aus dem Boden-Gradient.
- **Fall-Cap (−25 m/s), Auftrieb:** der bestehende `_loopPhysicsSync`-Wasser-Block (`:72573`) wandert 1:1 herüber (er liest schon das Feld via `_playerWaterContext`/`_waterLevelAt`).
- **Anti-Tunneling:** der Schritt wird SWEPT abgetastet (Sub-Steps ≤ Kapsel-Radius) → deterministisch, kein CCD-Tuning mehr nötig.

### 5.3 Die analytische Box-Schicht (Architektur + Inseln)
- Architektur trägt schon Box-Kinder (`btCompoundShape` `:57514`), Inseln eine bekannte Hülle.
- **Grid-Hash-Broadphase:** Welt in Zellen, Bodies eingetragen; `_boxesNear(p)` liefert die Kandidaten.
- **`_capsuleVsBoxes(capsule)`:** Kapsel-gegen-AABB-Sweep, Auswurf + Slide wie 5.2.
- **Begehbar/hohl bleibt EMERGENT:** per-Part-Box, eine Tür-Lücke = kein Part = man geht hindurch (die heutige Wahrheit `:57514` erhalten).
- Inseln: AABB-Hülle zuerst (Schöpfer-Empfehlung §13).

### 5.4 Der Raycast-Ersatz — EIN Chokepoint
- **`_runRaycast(start, end, extractor)` (`:69957`) behält die Signatur** — sein Inneres wechselt von Ammo-`btClosestRayResultCallback` zu:
  - **Feld-DDA** (Amanatides-Woo Voxel-Traversal über `_fieldSolid`) für Terrain-Treffer (Punkt + Gradient-Normale).
  - **Box-Ray** gegen `_boxesNear` für Architektur.
  - das nähere Ergebnis gewinnt; `extractor(cb-shim, hit)` mit denselben Feldern (`m_hitPointWorld`, `m_hitNormalWorld`).
- **Alle 5 Aufrufer unberührt:** 9-Ray-Erdung (`isPlayerGrounded` `:73585` — wird später durch die billigere Feld-Probe ersetzt, aber funktioniert sofort), Decken-Headroom, `_resolvePhantomTarget` (Ziel/Greifen), Lupen-Affordanz, Kreatur-Wand. **Das ist der Raptor: ein Ort tauschen, alle Leser erben.**

### 5.5 Der deterministische Schritt `_physicsTick(dt)`
- Festes `dt = 1/60`, Akkumulator + max N Substeps (wie heute Cap 5).
- **Fixe Iterationsreihenfolge:** Entitäten nach stabiler ID sortiert (kein `Map`-Iterations-Zufall), keine `performance.now`-Abhängigkeit in der Sim-Logik, kein `Math.random` (im Welt-Pfad eh verboten — Γ5).

---

## 6. Die Integrations-Karte (jede Kopplung, die mit-portiert werden MUSS)

Aus dem Stamm-Audit — was der neue Pfad replizieren/erhalten muss:

| # | System | Kopplung (file:line / Methode) | Was der Feld-Pfad tun muss |
|---|---|---|---|
| 1 | **Bewegungs-Feel** | `_loopPlayerMovement` (`:72747`), exp-Lerp k=14/4.5/18/1.5, Slope `0.2` (`:72781`), Coyote, `jumpPower`, `_ceilingHeadroom` | Logik 1:1; nur Auflösung wechselt |
| 2 | **Gefährt/Sattel** | `_mountedVehicleProfile` → überschreibt `kAcc/kBrake/topSpeedMul` (`:72796`); Gefährt folgt Spieler VISUELL (kein Constraint) | Mount-überschreibt-Kurven-Pfad behalten; Gefährt-Mesh-Follow bleibt rein visuell |
| 3 | **Wasser/Auftrieb** | `_loopPhysicsSync`-Wasser-Block (`:72573`), `_playerWaterContext` (3D-Zellen) + `_waterLevelAt`-Fallback, `_swimVerticalVelocity`, `liftingField`, Augen-Wasser | Velocity-Integration 1:1 übernehmen; die READ-Funktionen lesen schon das Feld → unverändert |
| 4 | **Raycasts** | `_runRaycast` (`:69957`) — EINE Quelle, 5 Aufrufer | Inneres tauschen (DDA + Box-Ray), Signatur + Aufrufer unverändert |
| 5 | **Architektur/Inseln** | `_buildArchitectureCollision` (`btCompoundShape` `:57514`), `_buildIslandCollision` (TriMesh), per-Part = begehbare Tür-Lücken | analytische Box-Schicht; per-Part-Emergenz erhalten; Insel = AABB-Hülle |
| 6 | **Voxel-Edits** | `_addVoxelEdit` → `_rebuildVoxelChunk` (Mesh+BVH); `_voxelEditsFillTop` | **BONUS: Kollision braucht KEINEN Rebuild** (Feld liest Edits). Mesh-Rebuild bleibt nur fürs RENDER; `_voxelEditsFillTop` bleibt für die Render-Skip-Band-Grenze |
| 7 | **Kreaturen** | `spawnCreatureAt` (`:15045`), `tickFaunaLifecycle`, `_creatureWaterContextAt`, Erdung via `getTerrainHeightAt` | gleicher `_stepCharacter`; gleiche Feld-Boden-Wahrheit (schon feld-nativ) |
| 8 | **State-Save** | `buildStateSnapshot` speichert Position, NICHT Velocity; `loadState` re-positioniert | ohne Ammo-Body: Position setzen + Velocity 0 → einfacher |
| 9 | **Multiplayer/Peers** | Peer-Avatare network-kinematisch (keine Kollision); `NON_BROADCASTABLE_OPS` Position | Peers bleiben Geister (keine Feld-Kollision); Determinismus → Lockstep-Tür (§7) |
| 10 | **Perf-Regler** | `_perfMark("bvh"...)` (`:12858`) → `perfSense.bvhMs`; Physik sonst INDIREKT | `bvh`-Mark entfällt; neuer `_perfMark("physics",...)` (Feld-DDA-Kosten, headless messbar — kein GPU!) |
| 11 | **Void-Rettung** | `_rescuePlayerFromVoid` (y<−120), Kill-Plane (`base−88`), `_ensurePlayerChunkBVH`-Watchdog | Kill-Plane + Rettung bleiben; der weiche Boden wird der EINE Boden; der BVH-Watchdog entfällt (kein BVH) |
| 12 | **Scale-Factor** | `scaleFactor` (=1) in ALLEN Ammo-Koords (`:73641`, `:57713`, …) | feld-nativ rechnet in Welt-Koords → die `/scaleFactor`-Konversionen können VEREINFACHT/entfernt werden (Cleanup-Gewinn; vorsichtig, viele Stellen) |
| 13 | **Controller-State** | `isInAir`/`isJumping`/`onSteepSlope`/`groundNormalY`/`_groundedCache`/`_softFloorActive` | als Controller-State erhalten (Feel + UI lesen sie) |

**Subtile Fallen (vom Audit geflaggt):** (a) `physicsWorld`-null-Guard bei Welt-Regen → der Feld-Collider muss vor Welt-Aufbau graziös leer-treffen; (b) Wasser hat ZWEI Wahrheiten (3D-Zellen + `_waterLevelAt`-Fallback) — beide bleiben; (c) Decken-Headroom liest `mesh.position`, nicht den Body — mit eigenem Controller ist das EINE Position (Vereinfachung); (d) Kreaturen MÜSSEN dieselbe Feld-Boden-Wahrheit lesen wie der Spieler, sonst Drift.

---

## 7. Determinismus — die 3 Stufen (ehrlich)

JS-Zahlen sind alle f64 (kein x87-80-bit-Drift wie C++). Innerhalb EINER Engine (V8) sind `Math.*` deterministisch; über Engines (V8/SpiderMonkey/JSC) driften Transzendente im letzten ULP.
1. **Replay/Rollback auf DERSELBEN Maschine** (Undo, „spule zurück", Geist-Aufnahme) — nur seed-deterministischer Sim. **Sofort, hoher Wert.**
2. **Lockstep zwischen GLEICHEN Browsern** (alle Chrome/WebGPU) — Float-Disziplin (keine `Map`-Ordnung, fixe Reihenfolge, kein `performance.now` in der Sim). **Erreichbar mit Vorsicht (AoE2-Stil).**
3. **BIT-Lockstep über HETEROGENE Plattformen** — braucht Fixed-Point-Math im Kern (StarCraft-Stil). **Eigener, späterer Bogen — kein Versprechen für P1.**

P1–P3 brauchen NUR Stufe 1. Stufe 2/3 sind bewusste Folge-Entscheide.

---

## 8. Die Sequenz — Wellen, jede verifizierbar

| Welle | Was | Verifikation | Risiko |
|---|---|---|---|
| **P0 ✅ GEBAUT** | `diag-physics-cost` (echter Renderer): sync-BVH-ms + `stepSimulation`-ms + WASM-Heap + Feld-Sample-Kosten — die Vorher-Zahl | GEMESSEN (§P0-ERGEBNIS): BVH-Build 9,18 ms/Chunk = der Freeze; Schritt ~0 → Spike-gegen-Smooth ist der Gewinn | — |
| **P1a ✅ GEBAUT** | `_fieldDensityAt/Solid/Gradient/ResolveSphere/SurfaceBelow` (rein, gehoistet) + `_voxelEditDeltaAt` (EINE Quelle) | `diag-field-collide` 5/5: bit-gleich zu `_terrainDensityAt`, Boden ≈ Wahrheit, Auswurf, Normale, **gehoistete Probe 6× schneller** als `_voxelSurfaceY` | — |
| **P1b ✅ GEBAUT (Feel offen)** | `_stepCharacter` (Kapsel) für den SPIELER; A/B hinter `state.fieldPhysics` (Default AUS, Chat `feldphysik`); Ammo trägt PARALLEL | `diag-walk-feel` 4/4: Erdung (restClear 0) · Lauf (10 m, kein Sink/Float, 100 % geerdet) · Stufe-hoch (0,49 m) · Sprung+Landung. **Schöpfer-Browser-Feel = das Merge-Gate** | **Feel** (die eine echte Gefahr) |
| **P2 — Kreaturen + Boxen + Raycast** | Kreaturen auf `_stepCharacter`; Box-Schicht (Grid-Hash); `_runRaycast`-Inneres → DDA+Box-Ray | Erdung/Greifen/Abbau treffen wie heute; Kreatur settled | mittel |
| **P3 — Ammo RAUS** | `physicsWorld`, alle `new Ammo.*`, der 256-MB-Patch, `_buildVoxelChunkBVH`, der BVH-Watchdog GESCHNITTEN; der weiche Boden wird der EINE Boden; scaleFactor-Cleanup | Welt baut/läuft ohne Ammo; Heap-Sturz messbar; Gate grün; `grep 'new Ammo'` = 0 | mittel (gründlicher Schnitt — die V17.20-sed-Disziplin) |
| **P4 — Der Preis** | Replay/Rollback (Stufe 1) → ggf. Lockstep (Stufe 2). Fixed-Point (Stufe 3) eigener Bogen | deterministischer Replay bit-gleich (eine Maschine) | eigener Plan |

**P1 = Löwenanteil des Werts.** P3 = die Heilige-Lektion-Belohnung (256-MB-Heap + ~81 BVH-Bäume + die `Ammo.destroy`-Cascade-Klasse + der `optimizePhysics`-Doom-Loop-Erbe — alle weg). P4 = die Krone.

### P0-ERGEBNIS — die Vorher-Zahl (GEMESSEN, `scripts/diag-physics-cost.cjs`, headless/swiftshader)

| Größe | Wert | Lehre |
|---|---|---|
| **sync BVH-Build** | **Ø 9,18 ms/Chunk · MAX 12,3 ms** (Ø 6920 Dreiecke) | **DER FREEZE BESTÄTIGT** — exakt die dokumentierten ~10 ms. Jeder Chunk-Cross = ein synchroner ~9-ms-Spike. **Feld-nativ = 0 Build.** |
| **stepSimulation** | Ø 0,028 ms/Frame (11 Bodies) | **Ehrlicher Befund: der laufende Ammo-Schritt ist FAST GRATIS.** Der Gewinn ist NICHT „Schritt schneller" — es ist „der Build-Spike verschwindet" + Heap + Determinismus. |
| `_terrainDensityAt` | 2,46 µs/call | die kanonische Quelle; teurer als gehofft (voller Spalten-Kontext + 3D-Noise pro Call) → der Kollisions-Query MUSS den Spalten-Kontext über die y-/Gradient-Samples HOISTEN (V18.321-Muster). |
| `_voxelSurfaceY` (Boden) | **43,7 µs/call** | **DER VERSTECKTE BOTTLENECK.** Der volle Spalten-Scan dominiert die Projektion (43,7 von 53,5 µs/Entität). Der Feld-Controller braucht eine LOKALE Kurz-DDA-Boden-Probe (~3-5 Samples an den Füßen), NICHT `_voxelSurfaceY`. |
| **Projektion feld-nativ/Frame** | **typisch ~0,59 ms · worst ~2,19 ms** (Spieler + 10 Kreaturen, naiv) | Höher als der Ammo-Schritt, aber SMOOTH + winzig vs. 16,7-ms-Budget (3,5 %). **Mit der lokalen Boden-Probe + Kontext-Hoist sinkt das deutlich** (P1-Optimierung). |
| WASM-Heap | 256 MB reserviert + 9 BVH-Bäume (bei Ring-Wachstum ~81) | fällt mit Ammo ganz weg. |

**Das ehrliche Urteil:** Ammo tauscht einen **9-ms-Build-Spike pro Chunk-Cross** (= der Freeze) gegen ~0 laufende Kosten. Feld-nativ tauscht das gegen **0 Spike + ~0,6 ms smooth/Frame**. Das tötet den Freeze an der Wurzel, kostet Speicher 0 und öffnet Determinismus — der Spike-gegen-Smooth-Tausch IST der Gewinn, nicht eine schnellere Mathe. **ZWEI gemessene P1-Pflichten:** (a) die Boden-Probe als lokale Kurz-DDA (nicht `_voxelSurfaceY`), (b) der Kollisions-Query hoistet `_terrainColumnContext` über seine y-/Gradient-Samples. Ohne beide wäre der Feld-Pfad unnötig teuer.

---

## 9. Die Bewegungs-Gefühl-Wand (das Schöpfer-Auge)

Mechanik braucht eine ZAHL, **FEEL braucht ein BILD/eine Bewegung.** Zwingend erhalten (sonst „billig"): die exp-Lerp-Kurven, Luftkontrolle, Slope-Penalty, Wall-Slide, Sprung-Bogen, Tauchen/Auftrieb, Stufen-Schwelle (hier sogar besser). **P1 merged NICHT, bevor du im Browser bestätigst, dass Laufen/Hänge/Stufen sich mindestens so gut anfühlen wie heute.** Ammo bleibt in P1 als A/B live.

---

## 10. Die Linsen (Gesetz #0 — baue die Linse)

- **`diag-physics-cost`** (echter Renderer): die Vorher-Zahl, gegen die P3 misst.
- **`diag-physics-determinism`**: zwei identische Eingabe-Sequenzen → bit-gleiche Positions-Traces (die Replay-Wand).
- **`diag-walk-feel`** (erweitert `diag-walk-profile`): Bewegungs-Trace + settled Augenhöhen-Screenshot über Hang/Stufe/Höhle/Wasser — A/B Ammo vs Feld.
- Playtest-Band `checkBandVoxelPhysics`: Feld-Collider liest die kanonische Quelle, Erdung deterministisch, `grep 'new Ammo'`=0 nach P3.

---

## 11. Selbst-Kritik — wo ich (noch) NICHT zufrieden bin (ehrlich)

1. **Der Feel ist die echte Unbekannte.** Collide-and-slide ist bewährt, aber das *Gefühl* eines hand-gerollten Controllers entscheidet sich im Browser, nicht in der Zahl. Der A/B-Schalter (Ammo parallel in P1) ist das Sicherheitsnetz — ich verspreche kein „besser" vor deinem Auge.
2. **Nicht-SDF-Genauigkeit.** Der `density/|∇density|`-Schritt ist 1.-Ordnung; an dünnen Features/hoher Krümmung kann er mis-schätzen. Mitigation: geklammerter Schritt + Iteration + boolescher Feld-Fallback. Muss in P1 an scharfen Kanten (Canyon-Wand, Höhlen-Decke) verifiziert werden — eine eigene `diag`-Probe.
3. **Kreatur-Vielfalt.** 20 Kreaturen × `_stepCharacter` + Feld-Samples — Kosten messen (P0). Wahrscheinlich billiger als 20 Ammo-Boxen + stepSimulation, aber GEMESSEN, nicht geraten.
4. **Inseln als AABB-Hülle** sind an den Rändern ungenau (fliegende Inseln mit Noise-Kante). Akzeptabel? Schöpfer-Browser. Sonst eigenes kleines Insel-Feld (mehr Code).
5. **Der scaleFactor-Cleanup (P3)** berührt VIELE Stellen — die V17.20-sed-Chirurgie-Disziplin (Backup, awk-Methoden-Liste, `diag-page-error` vor Playtest) gilt strikt.
6. **Determinismus Stufe 2/3** ist noch nicht ausgemessen (welche `Math.*`/Noise-Pfade driften über Engines). Erst relevant für echtes Lockstep — P4.

---

## 12. Warum das die Heilige Lektion EHRT

Der Ammo-Schnitt ist KEIN neuer Datei-Split und KEINE Re-Komplexifizierung — das Gegenteil: **eine zweite Welt-Repräsentation (Dreiecks-BVH) UND eine ganze Fremd-Laufzeit (WASM, 256 MB Heap, die destroy-Cascade-Bug-Klasse) fallen weg, ersetzt durch das Lesen der EINEN Quelle, die die Welt schon ist.** Niedrigere Kopplung, höhere Kohäsion, eine schmale stehende Schnittstelle (`_fieldSolid`/`_fieldResolve`/`_fieldRayDDA`). Der Stamm wirft einen abgelösten Ring ab. Die Anti-Sand-Wand (§4) hält den Schritt schmal: nur die Voxel-Rolle, die unsere deterministische Welt uns schenkt.

---

## 13. Offene Entscheide (Fork entschieden: feld-nativ, Ammo raus)

| # | Frage | Meine Empfehlung | Status |
|---|---|---|---|
| ✓ | Kollisions-Kern | **Feld-nativ, Ammo voll raus** | **ENTSCHIEDEN (Schöpfer)** |
| 1 | Spieler-Form: Kapsel vs Box | **Kapsel** (Stufen/Hänge sauberer) | ENTSCHIEDEN (Schöpfer 22.06.) — Kapsel, GEBAUT in P1b |
| 2 | Inseln: AABB-Hülle vs eigenes Feld | **AABB-Hülle zuerst** | offen |
| 3 | Determinismus-Tiefe P4 | Replay + Gleich-Browser-Lockstep; Fixed-Point eigener Bogen | offen |
| 4 | Ammo-Schnitt (P3)-Zeitpunkt | Erst Schöpfer-Browser-Bestätigung über mehrere Welten, dann schneiden | offen |

**Nächster Schritt:** P0/P1a/P1b sind GEBAUT (alle Linsen grün). **Der Ball liegt beim Schöpfer-Browser** — `feldphysik` im Chat schalten, Laufen/Hänge/Stufen/Sprung A/B gegen Ammo fühlen (§9 die Gefühl-Wand). Nach dem Feel-Sign-off: P2 (Kreaturen + Box-Schicht + Raycast-DDA), dann P3 (Ammo RAUS).
