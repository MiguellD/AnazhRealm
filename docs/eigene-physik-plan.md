# DER DETERMINISMUS-BOGEN — die eigene voxel-native Physik

> **Status:** PLAN (noch kein Code). Geschrieben damit das Schöpfer-Auge die SCOPE prüft, bevor Code fällt.
> **Branch (reserviert):** `claude/confident-noether-yczn0c` (Noether — die Erhaltungsgröße; Determinismus).
> **Trigger — ZUERST lesen bei:** Physik · Kollision · Character-Controller · Bewegung · BVH · Ammo · Determinismus · Lockstep · Replay · Rollback · „der Spieler fällt/hängt/tunnelt".
> **Flankiert von:** `docs/archiv/wahrerbauplan.md` (Ω-PHYSIS — der Stabilitäts-/Lastpfad-Richter, BLEIBT die Autorität für Bauplan-Statik; dieser Plan ist die BEWEGUNGS-/Kollisions-Schicht, nicht die Bauplan-Statik).

---

## 0. Die eine Frage, die dieser Plan beantwortet

> „Eigene Physik scheint der nächste Gigantenschritt, oder? Die Performance soll spriessen, selbst Profis in den Schatten stellen."

**Ja — aber nur in EINER der zwei Lesarten von „eigene Physik".** Die andere ist die Heilige-Lektion-Falle (Sand ohne Fundament). Dieser Plan trennt sie scharf und legt den Genie-Pfad.

- **Die FALLE (Sand-Weg):** Bullets Rigid-Body-/Constraint-Solver nachbauen (Stacking, Ragdoll, Gelenke, Reibungskegel, Stoß-Impulse). Jahrzehnte Arbeit. Am Ende wären wir ein *schlechteres* Bullet — das stellt niemanden in den Schatten, es re-komplexifiziert (genau die 2025-Sünde).
- **Der GIGANTENSCHRITT (Gesetz #0 — Raptor):** Die Kollision **LIEST die EINE kanonische Wahrheit der Welt — das Dichtefeld** — statt eine redundante Dreiecks-BVH daraus abzuleiten. Das kann eine General-Engine NICHT: für Ammo ist die Welt undurchsichtige Dreiecke; für uns ist sie eine **reine, deterministische analytische Funktion** (`terrainDensityAt(x,y,z)`). **Hier lebt „forge was kaum ein zweiter kann" — der Vorteil ist STRUKTURELL, kein Tuning-Knopf.** Und weil die ganze Welt schon deterministisch ist AUSSER Ammo, öffnet der Schritt zugleich **Lockstep-MP · Replay · Rollback** — eine Fähigkeit, die die meisten Browser-Sandboxes nicht haben, weil sie auf einer undeterministischen Engine sitzen.

---

## 1. Der Befund — wie die Physik HEUTE liegt (gemessen, file:line)

### 1.1 Ammos Rolle ist winzig und schwach
- **Ein** `btDiscreteDynamicsWorld` (`:13758`). Solver: SequentialImpulse, Broadphase: Dbvt.
- **Spieler:** `btBoxShape(0.5, 0.5, 0.5)`, `mass=1`, `lockRotation=true` (`:71588`, `:71592`). KEIN `btKinematicCharacterController` — die Bewegung wird per `setLinearVelocity` jeden Frame gesetzt, die Erdung per Raycasts geprüft.
- **Kreaturen:** `btBoxShape` skaliert mit Körpergröße, `mass=0.5` (`:15137`). Max 20 (`maxCreatures`).
- **Statische Bodies (`mass=0`):** Terrain-Chunks (`btBvhTriangleMeshShape`, ~81 bei Ring 4), Architektur (`btCompoundShape` aus Box-Kindern, Cap 48 `MAX_NEXUS_STRUCTURES`), Inseln (`btBvhTriangleMeshShape`).
- **Schritt:** `stepSimulation(delta, 5, 1/60)` (`:72543`, Substep-Cap 5 gegen die Todesspirale).
- **Kein** Stacking, **kein** Ragdoll, **keine** Constraints/Gelenke. Dynamisch sind nur Spieler + Kreaturen, und beide bewegen sich character-controller-artig (gesetzte Velocity, kein Impuls-Stacking).

### 1.2 Der Rest-Freeze ist der sync BVH
- `_buildVoxelChunkBVH` (`:12855`) → `_buildStaticTriMeshCollision` (`:57644`) baut pro Chunk einen `btBvhTriangleMeshShape` aus den Mesh-Dreiecken — **synchron auf dem Main-Thread**.
- **GEMESSEN:** ~10 ms/Chunk (5–9k Dreiecke, `:25914`); bis zu 9 inline in einem Frame = der **294-ms-Lauf-Spike** vor V18.291.
- Der Spieler-Chunk baut die BVH inline beim Stream (`_voxelChunkLazyBVHFor` → `r===0`, `:25910`); die 8 Nachbarn wandern in den zeit-budgetierten `_pumpVoxelChunkBVH`.
- **V18.271 hat den Hauptschlag entschärft** (async Mesh + weicher Boden), die sync-BVH-WURZEL steht noch — sie ist der dokumentierte „Lauf-Freeze an der Wurzel".

### 1.3 Das Fundament für voxel-native Stützung LIEGT SCHON
- **`getTerrainHeightAt(x,z)` ist heute schon voxel-nativ** (`:73691`): es ruft `_voxelSurfaceY` direkt — der Ammo-Heightfield-Raycast-Fallback wurde V9.38 als toter Pfad geschnitten.
- **`_softFloorWhileChunkLoading` (`:72494`) beweist es:** während die BVH lädt, hält die deterministische Höhe `getTerrainHeightAt` den Spieler exakt (kein Durchfallen). **Das ist voxel-native Stützung — heute als FALLBACK; der Plan macht sie zum PRIMÄRPFAD.**
- `_voxelSurfaceY` (`:29415`) ist aber 2.5D (top-solid pro Spalte). Der echte Collider braucht **volle 3D** (`terrainDensityAt(x,y,z)` direkt) — für Höhlen, Überhänge, Decken.

### 1.4 Die kanonische Welt-Wahrheit (rein, deterministisch)
- `_terrainColumnContext(x,z)` (`:24605`) — die 2D-Spalten-Arbeit (surf/rough/ceil/hydro), EINMAL pro Spalte.
- `_terrainBaseDensityAtCol(x,y,z,ctx)` (`:24639`) — die per-Voxel-3D-Hälfte.
- `_terrainDensityAt(x,y,z)` (`:24681`) = base + Voxel-Edit-Deltas (carve/fill).
- **Alles reine Funktionen von (Seed, Voxel-Edits).** Bit-identisch in Main + Worker (Determinismus-Wand). `> 0` = solide, `≤ 0` = Luft/Wasser.

### 1.5 Was Ammo NOCH trägt (muss mit-portiert werden)
- **Raycasts** über `_runRaycast` (`:69957`) — 5 Call-Sites: 9-Ray-Erdung (`isPlayerGrounded` `:73585`), Kreatur-Wand-Detection, `_resolvePhantomTarget` (Greifen/Ziel), Lupen-Affordanz, `getTerrainHeightAt`-Fallback. **Plus** Abbau/Graben (`spawn`/Hieb-Raycast).
- **Wasser-/Auftriebs-Physik** lebt in `_loopPhysicsSync` (`:72573`) und liest schon die Welt-Wahrheit (`_playerWaterContext`/`_waterLevelAt`) — kein Ammo nötig, nur die Velocity-Integration.

### 1.6 Die Ammo-Schmerzen, die der Schritt tilgt
- 256-MB-WASM-Heap (`patch-ammo-memory.cjs`), `ALLOW_MEMORY_GROWTH` fehlt.
- `Ammo.destroy()` cascadiert NICHT → jede Allok-Welle muss Shape/MotionState/TMesh separat tracken (die Heap-Snowball-Gotcha).
- Der `optimizePhysics`-Doom-Loop (V18.279) — eine ganze Bug-Klasse aus dem WASM-Lifecycle.
- ~81 BVH-Bäume im Heap, nur um zu wissen, was das Dichtefeld schon weiß.

---

## 2. Die These — der EINE Trick (Gesetz #0)

**Die kanonische Größe dieser Domäne ist `terrainDensityAt`. Die Kollision soll sie LESEN, nicht eine BVH daraus ableiten.**

Heute: `Dichtefeld → Mesh (Worker) → Dreiecke → btBvhTriangleMeshShape (sync) → rayTest/Kontakt`. Vier Schichten, eine davon ein synchroner Block, alle redundant zur ersten.

Morgen: `Dichtefeld → analytische Abfrage`. Der Collider fragt das Feld direkt — „ist (x,y,z) solide?", „wo ist die Oberfläche unter mir?", „kollidiert meine Kapsel mit dem Feld?". Das ist der Raptor: die Teile (Mesh-zu-Collision-Pfad, BVH-Bäume, WASM-Heap, sync-Block) fallen weg, weil keiner mehr eine zweite Welt-Repräsentation herleitet.

**Warum das Profis in den Schatten stellt:** eine General-Engine MUSS die Welt als Dreiecke behandeln (sie kennt deine Funktion nicht). Sie zahlt Mesh-Bau + BVH + Speicher, und sie kann nicht bit-deterministisch über Plattformen sein. Wir kennen die Funktion → wir zahlen nichts davon und sind deterministisch by construction.

---

## 3. Die SCOPE-Grenzen (verbindlich — die Anti-Sand-Wand)

**IN (die schmale Voxel-Rolle):**
1. Spieler-Character-Controller gegen das Dichtefeld (3D — Höhlen/Überhänge/Decken).
2. Kreatur-Kollision gegen Feld + gegeneinander-Vermeidung (sie weichen heute auch nur aus, kein echter Kontakt-Solver).
3. Analytische Box-Kollision gegen platzierte Architektur + Inseln (broad-phase + AABB/Kapsel-Sweep).
4. Schwerkraft + Velocity-Integration + Fall-Cap + Auftrieb (alles schon da, nur ohne Ammo).
5. Raycast-Ersatz (voxel-native DDA-Ray + analytischer Box-Ray) für Erdung/Greifen/Abbau/Affordanz.

**OUT (der Sand-Weg — NICHT bauen):**
- Genereller Rigid-Body-Solver, Impuls-Stacking, Türme aus Kisten.
- Ragdoll, Gelenke, Constraints, Federn als Physik (Bewegungs-Federn im Skinning sind ANIMATION, nicht hier).
- Reibungskegel, Rest-Kontakt-Mannigfaltigkeiten, Schlaf-Inseln.
- Allgemeine konvexe-Konvex-Kollision. (Wir haben Kapseln gegen Feld + Boxen — fertig.)

**Wenn ein Feature außerhalb dieser Liste „nötig" scheint → ZUERST fragen (Schöpfer-Entscheid), nicht heimlich erweitern.** Genau so kollabierte die 19-Modul-Phase.

---

## 4. Die Architektur — vier kleine, kohärente Bausteine

### 4.1 Der Feld-Collider (`_fieldSolid` / `_fieldSurfaceBelow` / `_fieldRayDDA`)
- `_fieldSolid(x,y,z)` = `terrainDensityAt(x,y,z) > 0` (liest die Edits mit → ein gecarvter Tunnel ist SOFORT begehbar, **kein BVH-Rebuild** — heute der teure Edit-Pfad).
- `_fieldSurfaceBelow(x,y,z)` = der nächste Oberflächen-Übergang nach unten (für Bodensnap) — eine kurze 3D-Variante von `_voxelSurfaceY`, aber bei beliebigem Start-y (Höhlen-Boden, nicht nur Top-Solid).
- `_fieldRayDDA(start, dir, maxDist)` = Amanatides-Woo-Voxel-Traversal über das Feld (für Erdung/Abbau/Greifen). Deterministisch, allokationsfrei.

### 4.2 Der Character-Controller (`_stepCharacter(body, dt)`)
- Eine **Kapsel** (Radius ~0.45, Höhe ~1.8 — die heutige Box war zu grob für Stufen/Hänge) gegen das Feld.
- Bewegung = die HEUTIGEN exp-Lerp-Kurven (`:72782` — `k=14` Boden / `4.5` Luft, Brems-k, Luftkontrolle, Slope-Penalty `:72781`) BEWAHRT — nur die Auflösung wechselt von Ammo-Velocity zu eigener Integration + Feld-Penetrations-Korrektur.
- Bodensnap + Stufen-Schwelle (`step-up`, ~0.5 m), Wall-Slide (tangentiale Projektion am Feld-Gradient), Fall-Cap (−25 m/s), Auftrieb (der bestehende `_loopPhysicsSync`-Block, unverändert übernommen).
- Erdung = wenige Feld-Abfragen unter der Kapsel-Basis statt 9 Ammo-Raycasts → **billiger UND deterministisch**.

### 4.3 Die analytische Box-Schicht (`_boxesNear` / `_capsuleVsBoxes`)
- Architektur + Inseln tragen schon Box-Kinder (Compound) bzw. eine bekannte AABB. Eine **Grid-Hash-Broadphase** (Welt in Zellen, Bodies eingetragen) + Kapsel-gegen-AABB-Sweep löst Kontakt deterministisch.
- Inseln mit echter Tri-Geometrie: als grobe AABB-Hülle ODER ein eigenes kleines Feld — Entscheid offen (§9), wahrscheinlich AABB-Hülle reicht (sie sind selten und grob).

### 4.4 Der deterministische Schritt (`_physicsTick(dt)`)
- Festes `dt = 1/60`, Akkumulator + max N Substeps (wie heute Cap 5), **fixe Iterationsreihenfolge** (sortiert nach stabiler ID, kein `Map`-Iterations-Zufall).
- Integriert Spieler + Kreaturen, löst gegen Feld + Boxen, schreibt Mesh-Positionen.

---

## 5. Determinismus — der Preis (ehrlich)

Die Welt ist deterministisch (Seed + Edits). Eigene Integer-/sorgfältige-Float-Integration macht den GANZEN Sim deterministisch → **Lockstep, Replay, Rollback**.

**Die ehrliche Hürde:** echte BIT-Gleichheit über verschiedene CPUs/Browser ist mit `Math.*`-Floats nicht garantiert (transzendente Funktionen driften im letzten Bit). Drei Stufen, von billig zu teuer:
1. **Replay/Rollback auf DERSELBEN Maschine** (Undo, „spule zurück", Geister-Aufnahme) — braucht nur seed-deterministischen Sim. **Sofort erreichbar, hoher Wert.**
2. **Lockstep-MP zwischen GLEICHEN Browsern** (alle Chrome/WebGPU) — meist stabil mit Float-Disziplin (keine `Map`-Ordnung, feste Reihenfolge, keine `performance.now`-Abhängigkeit im Sim). **Erreichbar mit Vorsicht.**
3. **BIT-Lockstep über HETEROGENE Plattformen** — braucht ggf. Fixed-Point-Math im Kern. **Eigener, späterer Entscheid (P4) — kein Free Lunch, nicht für P1 versprechen.**

**P1–P3 brauchen NUR Stufe 1.** Stufe 3 ist ein bewusster Folge-Entscheid, kein Versprechen, das den ersten Schritt belastet.

---

## 6. Die Sequenz — Wellen, jede verifizierbar

| Welle | Was | Verifikation | Risiko |
|---|---|---|---|
| **P0 — Die Linse** | Mess-Skripte BAUEN (echter Renderer): sync-BVH-Last + `stepSimulation`-Kosten + Heap heute; eine Bewegungs-Trace-Linse (Position/Velocity/grounded über Zeit) | Zahlen vor/nachher hart belegbar | — |
| **P1 — Spieler-Feld-Controller** | `_fieldSolid/_fieldSurfaceBelow/_fieldRayDDA` + `_stepCharacter` für den SPIELER. Ammo trägt den Spieler weiter PARALLEL (A/B-Schalter) bis der Feel sitzt | sync-BVH-Spieler-Freeze messbar 0; Bewegungs-Trace == Ammo-Trace im Rahmen; **Schöpfer-Browser-Feel** | **Feel** (die eine echte Gefahr) |
| **P2 — Kreaturen + Boxen + Raycast** | Kreaturen auf `_stepCharacter`; analytische Box-Schicht für Architektur/Inseln; alle 5 `_runRaycast`-Konsumenten + Abbau auf `_fieldRayDDA`/`_capsuleVsBoxes` | Erdung/Greifen/Abbau treffen wie heute; Kreatur-Bewegung settled | mittel |
| **P3 — Ammo zurückziehen** | `physicsWorld`, alle `new Ammo.*`, der 256-MB-Patch, die BVH-Bauten, `_buildVoxelChunkBVH` GESCHNITTEN. Der weiche Boden wird der EINE Boden | Welt baut/läuft ohne Ammo; Heap-Sturz messbar; Gate grün | mittel (gründlicher Schnitt) |
| **P4 — Der Preis** | Replay/Rollback (Stufe 1) → ggf. Lockstep (Stufe 2). Fixed-Point-Entscheid (Stufe 3) als eigener Bogen | deterministischer Replay bit-gleich auf einer Maschine | eigener Plan |

**P1 ist der Löwenanteil des Werts** (killt den Freeze, beweist den Pfad). P3 ist die Vereinfachung, die die Heilige Lektion belohnt (weniger Kopplung, eine Welt-Wahrheit). P4 ist die Krone.

---

## 7. Die Bewegungs-Gefühl-Wand (das Schöpfer-Auge)

Mechanik braucht eine ZAHL, **FEEL braucht ein BILD/eine Bewegung**. Was vom heutigen Gefühl ZWINGEND erhalten bleibt (sonst fühlt sich der Controller „billig" an — das einzige echte Risiko):
- die exp-Lerp-Beschleunigungs-/Brems-Kurven (`:72782`) — snappy am Boden, ballistisch in der Luft.
- Luftkontrolle (schwächerer Input in der Luft, Momentum bleibt).
- Slope-Penalty (steile Hänge drosseln + schieben ab, `:72781`).
- Wall-Slide (entlang Wänden rutschen, nicht kleben).
- Sprung-Bogen, Tauchen/Auftauchen/Auftrieb (`_swimVerticalVelocity`).
- Stufen-Schwelle (über kleine Kanten gehen, nicht hängenbleiben — HIER kann der Feld-Controller sogar BESSER werden als die heutige Box).

**P1 merged NICHT, bevor du im Browser bestätigst, dass sich das Laufen mindestens so gut anfühlt wie heute.** Ammo bleibt in P1 als A/B-Vergleich live.

---

## 8. Die Linsen (Gesetz #0 — baue die Linse, verlass dich nicht auf Wachsamkeit)

Drei neue `scripts/diag-*`, weil der Playtest GPU-/Render-blind ist und der Feel nur im echten Renderer lebt:
- **`diag-physics-cost`** (echter Renderer): heutige sync-BVH-ms + `stepSimulation`-ms + WASM-Heap — die Vorher-Zahl, gegen die P3 misst.
- **`diag-physics-determinism`**: zwei identische Eingabe-Sequenzen → bit-gleiche Positions-Traces (die Replay-Wand; macht eine Determinismus-Regression LAUT).
- **`diag-walk-feel`** (erweitert das bestehende `diag-walk-profile`): Bewegungs-Trace + settled Augenhöhen-Screenshot über Hang/Stufe/Höhle/Wasser — der A/B-Vergleich Ammo vs. Feld.

Plus ein Playtest-Band `checkBandVoxelPhysics` (Feld-Collider liest die kanonische Quelle, Erdung deterministisch, kein `new Ammo.*` nach P3).

---

## 9. Offene Entscheide für dich (vor/während P1)

1. **Kapsel vs. Box** für den Spieler — ich empfehle Kapsel (Stufen/Hänge sauberer). OK?
2. **Inseln:** grobe AABB-Hülle (billig, leicht ungenau an den Rändern) ODER eigenes kleines Feld pro Insel (genau, mehr Code). Empfehlung: AABB-Hülle zuerst.
3. **Determinismus-Tiefe:** P4 nur Stufe 1+2 (Replay + Gleich-Browser-Lockstep) — Stufe 3 (Fixed-Point, Heterogen) als separater Bogen? Empfehlung: ja.
4. **Ammo-Schnitt-Zeitpunkt:** hart nach P2 (mutig) oder erst nach einer Schöpfer-Browser-Bestätigungsrunde über mehrere Welten? Empfehlung: erst Bestätigung, dann P3.

---

## 10. Warum das die Heilige Lektion EHRT (nicht verletzt)

Der Schnitt von Ammo ist KEIN neuer Datei-Split und KEine Re-Komplexifizierung — er ist das Gegenteil: **eine zweite Welt-Repräsentation (Dreiecks-BVH) und eine ganze Fremd-Laufzeit (WASM) fallen weg, ersetzt durch Lesen der EINEN Quelle, die die Welt schon ist.** Niedrigere Kopplung, höhere Kohäsion, eine schmale stehende Schnittstelle (`_fieldSolid`/`_fieldRayDDA`). Das ist der Stamm, der einen abgelösten Ring abwirft — kein neues Modul-Wirrwarr. Die Anti-Sand-Wand (§3) hält den Schritt schmal: wir bauen NICHT die generische Engine, nur die Voxel-Rolle, die unsere deterministische Welt uns geschenkt hat.
