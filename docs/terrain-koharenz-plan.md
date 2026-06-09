# Terrain-Kohärenz-Plan — DIE EINE GRENZE

> **Status:** AKTIVER PLAN (09.06.2026, Schöpfer-Auftrag „ein Plan, der dem Terrain gerecht wird —
> kein Pflaster, ans Eingemachte, alle Schnittstellen, hält die These stand"). Der Bogen, der die
> Wasser-Spirale (V18.0–.31, 30 Wellen) an ihrer wahren Wurzel heilt.
>
> **Vor Arbeit an Terrain-Mesh / Chunk-Naht / LOD-Stitching / Wasser-Dynamik / Höhlen-Eingängen /
> Canyons ZUERST lesen.** Wenn dieser Bogen vollendet ist → ins Archiv, die roadmap trägt die Essenz.
>
> **Regel #0 (über allem):** Render · Wasser · Naht sind PIXEL-BLIND headless. Der Schöpfer-Browser
> ist die einzige Wahrheit. Jede Phase wird browser-bestätigt + gemergt, bevor die nächste beginnt.
> KEIN 30-Wellen-Stapel mehr.

---

## 0 · DIE THESE (geprüft — hält sie stand?)

**Die These (Schöpfer, 09.06.2026):** *„Wenn die Chunk-Nähte nicht eine Sprache sprechen, synergetisch
eins werden, können wir das Wasser nie leiten — genau an diesen Grenzen hat auch das Wasser Probleme,
die wir über viele Läufe zu optimieren versuchten. Das Problem steckt tiefer als wir je schauten."*

**Gemessen bestätigt (2 Code-Audits + Recherche, 09.06.):** Jeder Chunk ist eine **independente Insel** —
er baut sein Mesh allein, klassifiziert sein Wasser allein, wird async gebaut, und seine Ränder finden
nur *approximativ* (über Determinismus) und *verspätet* (über eine async-Queue) zu den Nachbarn. **Die
Naht ist eine nachträgliche Reparatur, kein struktureller Teil des Designs.**

**Der Stress-Test (hält die These stand?):**

| Gegenargument | Antwort | These |
|---|---|---|
| „Blobig ist die Cel-Beleuchtung, nicht die Geometrie" (V17.107) | Die *Trapeze* sind Cel-Render (separates Thema). Aber „blobig/rund, keine Kanten" IST die Geometrie — Surface Nets *mittelt* (kein QEF). | hält (Mesher) |
| „Edit-Naht und LOD-Naht sind verschiedene Mechanismen" | Stimmt — zwei Achsen (zeitlich · räumlich). Aber **eine Krankheit: Isolation.** Beide entstehen, weil der Chunk allein behandelt wird. | hält (präzisiert) |
| „Wasser-fließt-nicht ist ein fehlendes CA, nicht die Naht" | Stimmt, das CA fehlt. **Aber:** ein CA mit cross-chunk-wake braucht eine *konsistente Nachbar-Zell-Wahrheit* — über eine inkohärente Grenze kann kein Wasser fließen. Die Naht ist die **Vorbedingung**. | hält (Vorbedingung) |

**Verfeinerung der These (ehrlich):** Es sind **zwei verbundene Wurzeln, eine Krankheit:**
- **Der MESHER** (Surface Nets, isolierte Vertex-Mittelung) → *blobig* + *schwache räumliche Naht*.
- **Die PIPELINE** (independent + async + per-Chunk-Wasser) → *zeitliche Naht* + *Wasser-per-Chunk*.

Beide sind dasselbe: **der Chunk ist eine Insel.** Die Heilung ist **Kohärenz an der Grenze** — den
Chunk zu einem *Fenster auf ein konsistentes Feld* machen, nicht zu einer isolierten Insel.

---

## 1 · I — INFORMIEREN (die gemessene Wahrheit)

### 1.1 Fünf Symptome, eine Wurzel

| Symptom | direkte Ursache (file:line) | Achse |
|---|---|---|
| Blobiges Terrain | Surface-Nets-Mittelung (`_voxelExtractSurfaceVertices` :18352) + Laplacian λ=0.5 (:18494) | Mesher |
| Naht beim Abbauen | async Nachbar-Rebuild (`_tickDirtyVoxelChunks` 1/Frame :24638), Fenster N→N+k | zeitlich |
| Naht beim LOD-Laden | KEIN Cross-LOD-Stitching, nur Fog-Tarnung (:18851); Vertex-Mismatch step-abhängig | räumlich |
| Wasser-Naht (30 Wellen) | per-Chunk-Klassifikation + `colDepthAt`-Fallback (:20030) + `cellClass`-OOB (:19648) | erbt beide |
| Wasser fließt nicht | statisches Höhenfeld `L`, kein zellulärer Automat | Vorbedingung |

### 1.2 Strukturell — die Naht ist APPROXIMATIV, nicht EINS

- Jeder Chunk sampelt sein **eigenes** Density-Grid (`(dim+4)×(dimY+1)×(dim+4)`, geteilt Boden+Wasser, :20788),
  mesht **eigene** Surface-Nets-Iso, glättet mit **eigenen** Nachbarn (Laplacian 1 Iteration, λ=0.5,
  Einfluss-Radius 1 Zelle → Pad 1 Zelle :18472), croppt den Pad (`cropMargin=1` :18529).
- **KEINE geteilten Vertices.** Naht-Freiheit = *Wette auf Determinismus*: zwei Chunks mit demselben
  Sampler (`_terrainDensityAt`, pure (x,z,y)) *hoffen* auf identische Ränder (bis Float32).
- **Surface Nets = Dual Contouring OHNE die QEF** → es kann keine scharfe Kante tragen (mittelt die
  Kanten-Schnittpunkte). Das ist die strukturelle Ursache von „blobig".

### 1.3 Zeitlich — die Naht ist ein FENSTER

```
Frame N:    carve → Spieler-Chunk SYNC rebuild + finalize → 8 Nachbarn re-enqueued (deferred)
Frame N→N+k: Skirt-Nachbarn async-pending, ALTES Mesh sichtbar  ← die Naht beim Abbauen
Frame N+k:  async-Terrain-Build fertig → atomic swap → Terrain-Naht heilt
Frame N+m:  _tickPendingWaterIso (≤4/Frame :38748) erreicht Nachbarn → Wasser-Naht heilt (m>k)
```
Agent-Befund wörtlich: *„Keines der Pflaster heilt die Kernwurzel: Nachbarn bauen sich nicht im selben
Frame."* Pad+Crop heilt nur Vertex-Jitter; V18.1 (8-Nachbar), V18.18 (`colDepthAt`), V9.93 (LOD0-Zwang)
heilen Symptome — das **Timing-Fenster bleibt**.

### 1.4 Die Konstanten (gemessen, `_voxelChunkConfig` :18858)

| LOD | dim | step (m) | span (m) | dimY | Pad-Grid | aktiv bei Ring r |
|---|---|---|---|---|---|---|
| 0 | 24 | 1.8 | 43.2 | 200 | dim+4=28 | r ≤ 1 |
| 1 | 12 | 3.6 | 43.2 | 100 | 16 | r 2–8 |
| 2 | 6 | 7.2 | 43.2 | 50 | 10 | r 9–10 |
| 3 | 3 | 14.4 | 43.2 | 25 | 7 | r ≥ 11 |

`span = dim·step = 43.2 m` (LOD-invariant) · `oy = base − floorDrop(90)` · cropMargin=1 · smoothIters=1.
**Constraint:** mehr Smoothing braucht breiteren Pad → bricht die Wasser-Cell-Indizierung (dim+4 geteilt,
V17.103 — eigener Mehr-Konsumenten-Umbau).

### 1.5 Von den Größten — die drei Sprachen für die Grenze (Recherche 09.06.)

| Sprache | Naht | Kantig? | Wasser | Preis |
|---|---|---|---|---|
| **Diskret** (Minecraft) | trivial (Blöcke teilen Kanten exakt) | würfelig | CA + cross-chunk-wake (active cells: 30→1100 FPS) | zu simpel für „Minecraft schlagen" |
| **Dual Contouring + Octree** | strukturell (geteilte Leaf-Nodes) | **scharf (QEF/Hermite)** | — | Seam-Octree-Hölle: non-manifold + self-intersection (*„none solve both simultaneously"*) |
| **Stable-LOD + Geomorph** | naht-frei (Fixpunkt-LOD + Vertex-Morph) | erbt vom Mesher | — | leicht; löst Naht, nicht Kantigkeit |

**Schlüssel-Erkenntnis:** Surface Nets → DC ist eine **Erweiterung des Vertex-Schritts** (Mittelung →
QEF-Minimum), und die Gradienten/Normalen werden **bereits berechnet** (für die Shading-Normalen). Das
ist KEIN Urknall — es ist ein chirurgischer Schnitt am Vertex-Platzierer. Die berüchtigte DC-Octree-
*Seam* umgeht man mit Stable-LOD+Geomorph (statt Seam-Octree).

### 1.6 Die Narben (roadmap §5 — was schon verworfen wurde, nicht wiederholen)

- Fluss-Querschnitt flach (V18.12→V18.26, **zweimal**) · Zell-Maske auf die Fläche (V18.8, Sägezahn) ·
  Auslauf-skirt (V18.25/.30/.31, Pflaster) · Boundary-Face-Mesh statt Surface-Nets (V13.2, flach/gappy).
- **Die Meta-Narbe:** alle waren Pflaster *an der Naht*, während die Wurzel (Isolation) nie berührt
  wurde. **Dieser Plan berührt die Wurzel — darum darf er groß sein, aber jede Phase wird bewiesen.**

### 1.7 Der AKTUELLSTE Stand (2021–2024) — geprüft, nicht bei den Klassikern stehengeblieben

Die §1.5-Klassiker (Transvoxel 2009 · DC 2002 · Surface Nets 1998) sind das Fundament — der
*read-as-stranger*-Selbst-Review (Schöpfer-Frage 09.06.) verlangte den HEUTIGEN Stand. Geprüft:
- **Teardown / Gustafsson (der moderne Voxel-Meister):** *„There are no triangles in this game"* —
  Raymarching; die nächste Engine (2024) **Hardware-Raytracing** (intersection shaders, unlimited world,
  sharp shadows, kein light-leak). **Der absolute Gipfel ist MESH-FREI.** → bewusste Grenze (§3): wir leben
  auf Three.js' Mesh-Pipeline; mesh-frei wäre ein eigener Render-Bogen (WebGPU-Raymarching), NICHT dieser
  Plan. Ehrlich benannt, kein Selbstbetrug, dass DC „der Gipfel" sei.
- **Nanite / Aokana (GPU-Driven Voxel for Open World, arxiv 2024):** Cluster-LOD mit nahtlosen Übergängen
  (das Geomorph-Prinzip, AAA-bestätigt). **WARNUNG, gemessen relevant:** *„viele diskontinuierliche Voxel →
  viele disconnected Cluster, schwer zu mergen, schlechte Geometrie"* → das **Risiko genau für T5 (große
  Höhlen/Canyons)**. Tröstlich: unser festes Chunk-Grid + Stable-LOD ist bei Hohlräumen ROBUSTER als
  Cluster-LOD — hier sind wir nicht rückständig, sondern besser positioniert.
- **GPU Dual Contouring (Tuntenfisch, destructible terrain):** DC läuft heute real auf der GPU → **härtet
  T3** (DC ist machbar, nicht nur Theorie).
- **Vertex Pooling (Nick McDonald 2021):** memory-freundliche nahtlose LOD für viele kleine Chunk-Meshes →
  ein Effizienz-Faden für T2.
- **FLIP/PIC (SIGGRAPH 2023, GPU-Flüssigkeit):** der Stand für FREIE Flüssigkeit (Spritzer/Wellen/Partikel).
  **Bewusst NICHT gewählt (§3):** unser Ziel ist *„fließt nach, sucht sein Niveau"* (Minecraft) → ein
  zellulärer Automat ist richtig + Größenordnungen billiger auf streamendem Open-World-Voxel. FLIP/PIC wäre
  Overkill = die Heilige-Lektion-Sünde (Komplexität ohne Fundament).

**Fazit des aktuellen Stands:** der Plan ist architektonisch BESTÄTIGT (DC kantig · Geomorph/Stable-LOD
nahtlos · CA fließend — die Profi-Wege von heute gehen denselben Pfad). Zwei ehrliche Schärfungen: (1) der
absolute Gipfel ist mesh-frei (Raytracing) — unsere Mesh-Wahl ist bewusst, nicht naiv; (2) Cluster-LOD
(Nanite) scheitert an Höhlen — unser festes Chunk-Grid ist HIER die robustere Wahl.

---

## 2 · P — PLANEN (der Lösungsweg)

### 2.1 Der gewählte Weg: KOHÄRENZ AN DER GRENZE (mutig, aber inkrementell)

Nicht ein Mesher-Tausch *oder* ein Wasser-Tausch — die EINE Krankheit (Isolation) auf **vier Schichten**
heilen, jede eine browser-validierte Phase. Das Density-Feld ist *schon* global+deterministisch — wir
machen den Chunk zum *Fenster* darauf statt zur Insel:

1. **Zeitliche Kohärenz** — bei Edit bauen die berührten Nachbarn **synchron** mit (kein async-Fenster).
2. **Räumliche Kohärenz** — Stable-LOD-Rounding + Geomorphing → die LOD-Naht verschwindet strukturell.
3. **Substanz-Kohärenz (kantig)** — Surface Nets → **Manifold Dual Contouring** (QEF) → scharfe Kanten,
   Canyons, kantige Felsen. Die Grenze bleibt kohärent unter der neuen Geometrie (der Härte-Test).
4. **Wasser-Kohärenz (Phase 1)** — statisches `L` → **zellulärer Automat** (Level + Flow, cross-chunk-
   wake) auf der nun-kohärenten Grenze. Wasser fließt nach wie Minecraft.

Dann ist **G3** (Höhleneingänge + Canyons) natürliche Folge: die `surf−16`-Decke öffnen, jetzt wo die
Grenze kein Wasser-Bleed mehr leakt und der Mesher Kanten trägt.

### 2.2 ALLE Schnittstellen (was jede tut · was sich ändert · Determinismus-Constraint)

| Schnittstelle (file:line) | tut heute | Plan-Änderung | Phase | bit-identisch? |
|---|---|---|---|---|
| `_voxelExtractSurfaceVertices` :18352 | Vertex = Mittel der Kanten-Iso | → QEF-Minimum (Hermite) | T3 | JA (Worker-Mirror) |
| `_voxelLaplacianSmoothPositions` :18478 | λ=0.5, 1 Iter (rundet Kanten) | → reduziert/feature-aware (Kanten erhalten) | T3 | JA |
| geteiltes Density-Grid (dim+4) :20788 | Boden+Wasser teilen Grid | bleibt die EINE Wahrheit; ggf. breiterer Pad (Cell-Index mit-ziehen, V17.103) | T2/T3 | JA |
| `_voxelChunkConfig` :18858 | dim/step/dimY pro LOD | unverändert (span 43.2 invariant) | — | JA |
| `_voxelChunkLodFor` :18916 | LOD aus `_detailBand(r)` | → Stable-Rounding (max über Nachbarn, Fixpunkt) | T2 | derived |
| `_remeshVoxelChunksAround` :24612 | markiert Footprint+skirt dirty | → markiert + triggert **sync** für berührte Nachbarn | T1 | — |
| `_tickDirtyVoxelChunks` :24638 | 1 dirty/Frame (async) | Edit-Nachbarn sync im Edit-Frame; ferne bleiben async | T1 | — |
| `_finalizeVoxelChunkBuild` :20976 | re-enqueued 8 Nachbarn (deferred) | bei Edit: synchroner Heal-Pass statt Queue | T1 | — |
| `_tickPendingWaterIso` :38748 | 4 Wasser-Iso/Frame | Edit-Wasser-Nachbarn sync; Streaming bleibt budgetiert | T1/T4 | — |
| `_buildVoxelChunkWaterCells` :19167 | BFS-Flood bis frozen `L` | → CA-Zustand (Level 0–N + Flow), liest Nachbar-Cells | T4 | JA (Worker) |
| `_buildVoxelChunkWaterIsoSurface` / `…SurfaceMesh` :19587/:19899 | Wasser-Mesh aus `L`/Cells | → speist sich aus CA-Cells; LOD0-Zwang fällt (T2 löst Naht) | T4 (U2) | main-only |
| `cellClass` OOB :19648 · `colDepthAt` :20030 | per-Chunk Nachbar-Lese-Heuristik | → liest die kohärente geteilte Grenz-Wahrheit | T1/T2 | — |
| BVH-Kollision (`_buildStaticTriMeshCollision` :37363) | Mesh = Kollision per Konstruktion | folgt dem neuen Mesher automatisch (Visual=Collision) | T3 | — |
| **Determinismus-Wand** `checkBandWellePerf3cWorkerFoundation` :21228 | Worker-Grid bit-identisch zu Main | **UNANTASTBAR** — jeder Mesher/Wasser-Umbau spiegelt im Worker, Test bewacht | alle | **HEILIG** |

### 2.3 Die Determinismus-Wand (die heilige Grenze des Plans)

Multi-User-Welten teilen einen Seed; Worker + Main + (jeder Peer) MÜSSEN bit-identische Geometrie +
Wasser-Zellen erzeugen. **Jede Phase, die den Mesher oder die Wasser-Klassifikation ändert, ändert
`voxel-worker.js` im selben Schritt** und hält `checkBandWellePerf3cWorkerFoundation` grün. Der
CA-Wasser-Tick (T4) ist *reaktiv* (wie Wetter) — er läuft deterministisch aus Seed+Edits ODER bleibt
lokal-reaktiv (nicht im Welt-Snapshot), die Wahl ist eine T4-Architektur-Frage (siehe T4).

---

## 3 · E — ENTSCHEIDEN (die Wahl + Begründung)

**Gewählt: Kohärenz an der Grenze (§2.1), vier Phasen.** Begründung:
- **Mutig (ans Eingemachte):** berührt die Wurzel — neuer Vertex-Platzierer (DC) + neue Wasser-Sim (CA) +
  strukturelle Naht. Kein Pflaster.
- **Aber inkrementell (Heilige Lektion treu):** jede Schicht baut auf der vorigen, jede ist eine eigene
  browser-validierte + gemergte Phase. DC ist eine *Erweiterung* von Surface Nets (QEF im Vertex-Schritt),
  kein Rewrite. Die LOD-Naht via Stable-LOD+Geomorph umgeht die DC-Seam-Hölle.
- **Synergetisch:** EINE Heilung (Kohärenz) löst fünf Symptome + entriegelt G3 + U2.

**Verworfen:**
- **Reine DC-Octree-Seam** (B): die Recherche ist eindeutig — non-manifold + self-intersection sind
  ungelöste offene Probleme. Wir nehmen DCs *Kanten* (QEF), aber NICHT seine Octree-Seam (Stable-LOD
  statt dessen).
- **Diskret/blocky** (A): würfelig; widerspricht „Minecraft in den Schatten stellen". (Aber das CA-
  *Wasser*-Modell von Minecraft übernehmen wir — T4.)
- **Mesh-frei (Raymarching/Raytracing, Teardown — der absolute Gipfel):** unlimited world, mesh-los, keine
  Naht per Definition. **Verworfen für JETZT (bewusst, nicht naiv):** unsere Render-Pipeline ist Three.js-
  Mesh (WebGPU); ein Raymarching-Renderer ist ein eigener großer Render-Bogen, kein Terrain-Plan. Notiert
  als der mögliche Fern-Horizont — wenn wir je den Renderer selbst neu denken.
- **Weiter pixel-blind am Wasser-Mesh tweaken:** das war die Spirale (Narben §1.6).

---

## 4 · R — REALISIEREN (die Phasen — jede: Ziel · Mechanik · Schnittstellen · Risiko · Sign-off)

**Ehrlich (read-as-stranger):** Die DIAGNOSE (§0–1) ist *gemessen*. Die LÖSUNGEN (T1–T5) sind *begründete
Hypothesen*, KEINE bewiesenen Wahrheiten — jede trägt ihre eigene Mess-Wand (§5) + ihren Browser-Sign-off,
BEVOR sie als wahr gilt. Kein Schritt wird gebaut, weil der Plan ihn behauptet — nur, weil seine Messung
ihn bestätigt. T0 misst zuerst; jede Phase darf scheitern und den Plan korrigieren.

### T0 — MESSEN: welche Naht dominiert? (die These empirisch härten · Risiko: keiner)
- **Ziel.** Bevor irgendein Umbau: trennen, ob das sichtbare Abbau-/Lade-Symptom die *zeitliche* (async)
  oder *räumliche* (LOD/blobig) Naht ist — die „miss zuerst"-Lehre (kostete den main-Stand).
- **Mechanik.** `scripts/diag-chunk-seam.cjs` (GEBAUT): (A) gleiche-LOD-Naht — EXAKT-geteilte Vertices,
  gebinnt nach Abstand zur Grenz-Ebene; (B) Cross-LOD-Naht — dasselbe + Punkt→grobe-Oberfläche-Spalt der
  feinen Naht-Vertices, okkludiert vs. sichtbar getrennt; (C) zeitlich — Carve an der Grenze, Frames bis
  der Nachbar heilt (async) vs. der Sync-Drain (0 Frames). *Mess-Disziplin (V13.0): drei Vertex-/Profil-
  Matchings verworfen, weil sie auf der MEHRWERTIGEN Surface-Nets-Fläche (Höhlen/Klippen/Wände) Schein-
  Spalte von 50+ m erzeugten — das band-UNABHÄNGIGE, dispositive Maß ist die EXAKT-geteilte-Vertex-Quote.*
- **GEMESSEN (09.06.2026, Spawn-Region, ringRadius 4):**
  - **(A) gleiche LOD — STRUKTURELL SEMI-VERSCHWEISST, KEIN primärer Riss.** ~50 % der Naht-Vertices sind
    float-EXAKT koinzident (der Pad+Crop-Overlap V9.79 + Determinismus), stabil über alle Abstands-Bins.
    → die §1.2/§0-Formulierung „KEINE geteilten Vertices" ist DESIGN-wahr (jeder Chunk mesht unabhängig),
    aber der Overlap+Determinismus erzeugt ~50 % KOINZIDENTE Vertices → die Wette zahlt weit mehr als
    gefürchtet. (Der Rest-Proxy Punkt→Fläche ist headless-unreliabel — kein „Terrain-Löcher"-Befund in
    30 Wellen → kein primärer sichtbarer Riss; Schöpfer-Auge bestätigt final.)
  - **(B) Cross-LOD — der STRUKTURELLE räumliche Riss.** 0 % geteilte Vertices über ALLE Abstände (fein
    step 1.8 / grob step 3.6 = fundamental inkompatible Gitter) + ~21 % der feinen Naht-Vertices klaffen
    sichtbar (>1 m, nicht okkludiert) von der groben Oberfläche. → **T2 (Stable-LOD+Geomorph) ist der
    echte räumliche Bogen.**
  - **(C) zeitlich — das async-Abbau-Fenster, klein + fixbar.** Ein Grenz-Carve markiert ~12 Chunks dirty;
    der Spieler-Chunk heilt @Frame 1, der Grenz-Nachbar @Frame 3 → **~2 Frame(s) sichtbare Abbau-Naht**
    (1 Chunk/Frame). Der bereits existierende Sync-Drain (`_drainDirtyVoxelChunks`) baut alle 12 in EINEM
    Schritt → **0 Frames stale** = das T1-Ziel ist erreichbar, der Pfad existiert großteils.
- **Fazit / Empfehlung der Zahlen:** die §6-Reihenfolge bestätigt sich — **T1 zuerst** (kleinster, risiko-
  ärmster Schritt, testet die These praktisch, 0-Frame-Heal über den vorhandenen Drain-Pfad), dann **T2**
  (Cross-LOD, der größere pixel-blinde Bogen). Die gleiche-LOD-Naht braucht KEINE eigene Arbeit.
- **Sign-off (OFFEN, Schöpfer-Auge):** welches Symptom stört im Browser mehr (die ~2-Frame-Abbau-Naht
  oder die Cross-LOD-LOD-Naht beim Heranstreamen) → bestätigt T1-zuerst oder priorisiert um.

### T1 — Zeitliche Kohärenz: der synchrone Footprint-Heal (Risiko: niedrig) — **GEBAUT ✓**
- **Ziel.** Beim Abbauen heilt die Naht im SELBEN Frame — kein stale Nachbar mehr.
- **GEBAUT (09.06.2026):** `_addVoxelEdit` ruft nach `_remeshVoxelChunksAround` ein neues
  `_syncRebuildEditFootprint(x,z,r)` — es baut die **FOOTPRINT-Chunks** (skirt=0 = die Chunks, die die
  Schnitz-/Aufschütt-Kugel wirklich überdeckt) SYNCHRON im Edit-Frame (forceSync → dispose-before-build,
  Wasser-Iso sync via `_finalizeVoxelChunkBuild(syncWater=true)`, BVH sync → kein Durchfall-Gap). Die
  **SKIRT-Nachbarn bleiben im Dirty-Set (async)** — ihre Oberfläche ist unverändert (nur das V9.86-Density-
  Pad sah die Kugel-Kante, sub-cell) → kein Edit-Spike (die V9.40-c-Lehre gewahrt: nur ≤Footprint sync).
- **VERIFIZIERT:** `diag-chunk-seam` C-Messung — der Grenz-Carve heilt jetzt Spieler-Chunk UND Grenz-Nachbar
  **beide IM Edit-Call (Frame 0)** (vorher: Nachbar @Frame 3 = ~2 Frames Naht); 10 Skirt-Chunks async,
  imperzeptibel. Playtest: 4 neue Invarianten grün (footprint=synced · Skirt async · 2 Source-Probes).
- **Schnittstellen (real):** `_addVoxelEdit` :24520, neu `_syncRebuildEditFootprint` (nach `_remeshVoxelChunksAround`).
- **Risiko (gemessen mild).** Footprint = 2–4 Chunks à ~2 ms (V12.0-perf.b Base-Density-Cache) ≈ sub-Frame;
  der Skirt bleibt async → kein Cluster-Spike.
- **Sign-off (OFFEN, Schöpfer-Auge):** beim Abbauen an einer Chunk-Grenze — keine sichtbare Trennung mehr.

### T2 — Räumliche Kohärenz: Cross-LOD-Geomorph (Risiko: mittel) — **GEBAUT ✓**
- **Ziel.** Die LOD-Naht (T0 GEMESSEN: Cross-LOD = 0 % geteilte Vertices, ~21 % sichtbare >1-m-Spalten)
  verschwindet → das Wasser darf später seinen LOD0-Zwang ablegen (U2).
- **GEBAUT (09.06.2026, render-only Vertex-Geomorph):** an jeder Cross-LOD-Grenze zieht
  `_applyCrossLodGeomorph` (Finalize + re-call der 4 Nachbarn, V13.13.2-Muster) die feinen Boundary-
  Vertices auf die GROBE Nachbar-OBERFLÄCHE (Punkt→Dreieck via `_closestPtTri` — NICHT der nächste grobe
  Vertex; der ist sparse + greift die falsche Branche). Zwei neue Geometrie-Attribute (`aMorphTarget`,
  `aMorphWeight`, ZENTRAL in `_voxelChunkGeometry` → WebGPU-strikt sicher), der Terrain-`positionNode`
  morpht `pos → target` per `geomorph`-Uniform (live-tunbar, default 1). Die Grenz-ZEILE (dPlane<flat)
  morpht VOLL (w=1 → auf der groben Fläche), ein Falloff bis 2·step ins Innere (kein interner Sprung).
- **VERIFIZIERT — GEOMETRIE, nicht pixel-blind (die V18-Lehre angewandt):** `diag-chunk-seam` D — die
  voll-gemorphte Grenz-Zeile (w>0.95) liegt **97.9 % AUF der groben Oberfläche, Spalt ⌀0.018 m** (Target→
  Fläche ⌀0.07 m = die Targets sind korrekt); die T-junction ist GESCHLOSSEN. Playtest +5 Invarianten grün
  (kein Material-Morph-Fehler [positionNode kompiliert] · Attribute auf JEDER Geometrie · Source-Probes ·
  Geomorph feuert, 8 Chunks). `diag-terrain-shot` (gerahmter 3D-Screenshot, das „nächste Hebel"-Werkzeug):
  das Terrain rendert KOHÄRENT mit Morph an — keine Falten/Löcher, kein WebGPU-Crash.
- **Eigenschaften:** render-only (Position/Physik/Determinismus/Naht-Test/BVH unberührt — der Morph lebt im
  Shader); main-only (liest die Nachbar-MESHES wie der Wasser-Iso); die Grenze ist immer ~1 Chunk vom
  Spieler (LOD-relativ) → der sub-meter Visual/Collision-Versatz liegt NIE unter den Füßen.
- **Schnittstellen (real):** `_voxelChunkGeometry` (Morph-Attribute), `_applyCrossLodGeomorph` +
  `_closestPtTri` (neu), `_finalizeVoxelChunkBuild` (Aufruf + Nachbar-re-call), `_buildToonNodeMaterial`
  (positionNode), `_ensureAtmoUniforms` (`geomorph`-Uniform).
- **Offen (Schöpfer-Auge, GPU-Feinheit):** das FEEL beim Laufen über die LOD-Grenze (kein Pop, kein
  Schimmer) auf echter WebGPU — die GEOMETRIE ist bewiesen, die Shader-Feinheit ist der Sign-off. Plus:
  Stable-LOD-Hysterese gegen LOD-Flicker (eigener kleiner Faden) · fernes Wasser-LOD (U2, separat).

### T3 — Substanz-Kohärenz: der kantige Mesher (Dual Contouring QEF) — **GEBAUT ✓ (Foundation)**
- **Ziel.** Kantiges, nicht-blobiges Terrain — scharfe Canyons, kantige Felsen.
- **GEBAUT (09.06.2026, beide Mesher bit-identisch):** `_voxelExtractSurfaceVertices` (main) +
  `extractSurfaceVertices` (`voxel-worker.js`) setzen den Vertex ans **QEF-Minimum** über die Hermite-
  Normalen (= der analytische Trilinear-Gradient des Dichtefeldes an jeder Kanten-Kreuzung) statt ins
  Mittel; Mass-Point-Regularisierung (`DC_LAMBDA`) + Cramer-3×3-Solve + Zell-Clamp gegen Self-Intersection;
  der Laplacian ist **feature-bewusst** (`sharp`-Flag pro Vertex: das QEF zog ihn spürbar vom Mittel weg
  → der Laplacian verschont ihn, sonst rundet er die Kante wieder). `DC_LAMBDA`/`DC_SHARP_MOVE2` sind in
  BEIDEN Dateien gespiegelt (Determinismus-Wand).
- **VERIFIZIERT:** **V9.42-b-Naht-Test grün — 288 Vertices teilen identische Position zwischen 9 Nachbar-
  Chunks** (Worker- + Main-QEF koinzident = die Determinismus-Wand hält, das QEF ist bit-identisch); Playtest
  +4 T3-Source-Probes grün, `Alle Invarianten OK`. `diag-mesh-sharpness` (Dieder-Winkel-Verteilung) +
  `diag-terrain-shot`: das Terrain rendert kohärent, keine Artefakte, keine Noise-Verstärkung.
- **EHRLICHER BEFUND (gemessen, der Fischer):** auf der AKTUELLEN Welt ist der Effekt **subtil** — sharp >45°
  24.4 %→26.8 %, mittlerer Dieder 40.5°→42.95°. WARUM: die Welt ist GEMESSEN smooth-noisy (rollende Hügel +
  ±12-m-Roughness = glatte Noise, KAUM echte Dichte-Ecken); das QEF ist auf der glatten Fläche ill-
  konditioniert → es fällt korrekt auf den Mass-Point zurück (es sharpt NUR echte Feature-Ecken, verstärkt
  die Noise NICHT). Das „blobige Gefühl" ist GEMESSEN grossteils **Facetten-SHADING** (V17.107, schon
  geheilt) + smooth-noise, NICHT gerundete Geometrie-Ecken. → **T3 ist die FOUNDATION: der Mesher ist jetzt
  SCHARF-FÄHIG; die dramatische Schärfe entsteht mit T5 (Canyons = echte Dichte-Features), die der DC dann
  AUTOMATISCH kantig rendert.** `DC_LAMBDA` browser-tunbar (kleiner = schärfer, Re-Mesh nötig).
- **Schnittstellen (real):** `_voxelExtractSurfaceVertices` + `_voxelLaplacianSmoothPositions` (+ `sharp`-
  Faden durch `_voxelChunkGeometry`), Worker-Mirror, `DC_LAMBDA`/`DC_SHARP_MOVE2` (static + Worker-const).
- **Sign-off (Schöpfer-Auge):** auf echter WebGPU — kohärent, FPS hält (die Schärfe selbst ist subtil bis T5).

### T4 — Wasser-Kohärenz: der zelluläre Automat (Wasser fließt) (Risiko: hoch · die Krönung) — **ENTRIEGELT, KERN GEBAUT**
- **→ DETAIL-PLAN: `docs/terrain-t4-wasser-ca-plan.md`** (der volle Bogen + die getroffenen Entscheidungen:
  lokal-reaktiv wie Wetter · Level-pro-Zelle über der Flood · active-cell · T4a-Zellen/T4b-Render-Split).
- **KERN GEBAUT + BEWIESEN (09.06.2026, T4a-1):** `_tickWaterCA(level, cells, dim, dimY)` — eine REINE,
  deterministische Tick-Funktion des Fluss-Automaten (Gravität top-down + lateral Niveau-suchen, Delta-
  Puffer = exakte Erhaltung). **VERIFIZIERT (`diag-water-flow-ca`, headless GEOMETRIE/Zustand): ERHALTUNG
  exakt (Σ Wasser konstant) UND FLUSS (ein Blob fällt zum Boden · eine 5er-Säule spreizt zur Lache,
  Grundfläche 1→64).** 3 Playtest-Invarianten grün. **Die Wurzel ‚Wasser fliesst nicht nach‘ (wasser-plan
  §3) ist im MODELL gelöst.** Noch NICHT in die Welt verdrahtet (T4a-2..4: Welt-Zellen + cross-chunk-wake
  + Physik) + Render (T4b, Browser, Regel #0) — die nächsten verifizierten Schritte.
- **Ziel.** Wasser fließt dynamisch nach wie Minecraft; ein Carve neben Wasser → es strömt hinein.
- **Mechanik.** `_buildVoxelChunkWaterCells` → CA: pro Zelle Level (0–N) + Flow-Vektor; Tick-Regeln
  (bergab-Priorität, lateral spreizen, Niveau suchen); nur **aktive/dirty** Zellen ticken (active-cell-
  only: 30→1100 FPS bei den Großen); an der Grenze **weckt** ein Update den Nachbar-Chunk (dirty-mark) —
  möglich, WEIL T1/T2 die Grenze kohärent machten. Der Render speist sich aus den CA-Cells (kein
  statisches `L`; das löst auch das Mesh-Falten von Ebene B).
- **Schnittstellen.** `_buildVoxelChunkWaterCells` :19167 (+ Worker-Mirror), das Wasser-Mesh :19899,
  `_playerWaterContext` (Physik liest die Cells), ein neuer `_tickWaterCA`.
- **Architektur-Frage (vor dem Bau zu klären):** Determinismus für Multi-User — läuft das CA
  deterministisch aus Seed+Edits (im Snapshot, peer-konsistent) ODER lokal-reaktiv (wie Wetter, nicht
  persistiert)? Tick-Budget auf streamendem Open-World. Persistenz (überlebt der Fluss-Zustand Reload?).
- **Risiko.** hoch — Sim-Architektur + Determinismus + Performance. Mitigation: eigener T4-Detail-Plan,
  `diag-water-flow.cjs` + `diag-water-fill.cjs` (existieren), Browser-Loop, Merge pro Sub-Schritt.
- **Sign-off.** Der Schöpfer gräbt einen Kanal → das Wasser fließt sichtbar hinein und sucht sein Niveau.

### T5 (Folge) — G3: Höhleneingänge + Canyons (die Belohnung) — **GEBAUT ✓**
- **GEBAUT (09.06.2026, beide Density-Mirror bit-identisch):** die CANYON-MASKE (`canyonOpen`, eine nieder-
  frequente 2D-Noise, `n.noise2D` freq 0.0065) öffnet die `surf−16`-Höhlendecke SELEKTIV — wo die Maske hoch
  ist, hebt sich die Decke (bis surf+8) → die bestehende Höhlen-Noise carvt zur Oberfläche = sichtbare
  Canyons/Ravines/Pit-Eingänge in die Unterwelt. Sparse (Maske × Höhlen-Noise-Sparsity → vereinzelte
  Schluchten, der Rest rollende Hügel — GESEHEN `diag-terrain-shot`: links grüne Hügel, rechts ein
  dramatisches Canyon-Feld). MUSS bit-identisch im Worker (`voxel-worker.js`).
- **DIE SYNERGIE EINGELÖST:** die Canyons sind SAUBER, WEIL der Bogen davor steht — T3 (DC) rendert die
  scharfen Wände (endlich echte Dichte-Features statt smooth-noise), T1/T2 halten die Grenze kohärent (kein
  V14.5-Naht-Loch), T4 trägt die 3D-Wasser-Wahrheit (kein Bleed in die offenen Höhlen).
- **VERIFIZIERT:** **V9.42-b-Naht 295 Vertices geteilt** (Worker==Main bit-identisch nach dem Density-Umbau =
  Determinismus-Wand hält) · keine `Chunk-Generation-Fehler` · keine `Boden fehlt`-Death-Spiral · Dreiecke
  +23 % (die Canyons carven echte Oberfläche) · `Alle Invarianten OK`. **GESEHEN:** dramatische, kohärente
  Canyons — kein zerbrochenes Mesh (die V14.5-Probleme sind durch T1–T4 geheilt).
- **Tunbar:** die Maske-Schwelle (0.52) + der Öffnungs-Grad (×24) steuern Häufigkeit/Tiefe der Schluchten.

---

## 5 · K — KONTROLLIEREN (Mess- & Verifikations-Kriterien)

| Phase | Headless-Diag (Wand) | Determinismus | Browser-Sign-off (Pixel) |
|---|---|---|---|
| T0 | `diag-chunk-seam` (GEBAUT, GEMESSEN) | — | **OFFEN**: welche Naht stört im Auge mehr |
| T1 | `diag-chunk-seam` C (footprint in-edit) + 4 Playtest-Inv. **GRÜN** | — | **OFFEN**: keine Abbau-Naht im Auge |
| T2 | `diag-chunk-seam` D (Grenz-Zeile 98 % auf grober Fläche) + 5 Playtest-Inv. **GRÜN** | render-only (kein Mirror) | **OFFEN**: kein Pop/Schimmer im Auge |
| T3 | `diag-mesh-sharpness` (Dieder-Winkel) + **V9.42-b 288 geteilt** + 4 Playtest-Inv. **GRÜN** | **bit-identisch (Worker-Mirror)** | kohärent; volle Schärfe ab T5 |
| T4 | KERN: `diag-water-flow-ca` (Erhaltung+Fluss) **GRÜN** + 3 Inv. · Welt+Render offen | lokal-reaktiv (kein Mirror) | Wasser fließt in den Kanal (T4b) |
| T5 | `diag-terrain-shot` (Canyons GESEHEN) + **V9.42-b 295 geteilt** + Inv. **GRÜN** | **bit-identisch (Worker)** | dramatische Canyons, sauber |

**Die EINE harte Wand über allem:** `npm run playtest` „Alle Invarianten OK" + die Determinismus-Wand
bit-identisch nach JEDER Phase. Pixel-blinde Phasen (T2/T3/T4/T5) gehen NICHT in einen Merge ohne
Schöpfer-Auge (Regel #0).

---

## 6 · A — AUSWERTEN (Reihenfolge, Disziplin, die Vision)

**Reihenfolge-Logik:** `T0 (messen) → T1 (zeitlich, kleinster, testet die These praktisch) → T2 (räumlich/
LOD) → T3 (kantig) → T4 (Wasser-CA) → T5 (G3)`. **Die Grenze zuerst (T0–T2), dann die Belohnung (T3 kantig,
T4 Wasser, T5 Canyons).** T3/T4 sind tauschbar (Schöpfer-Wahl), aber beide bauen auf der kohärenten Grenze —
**niemals T4 (Wasser) vor T1/T2 (Grenze):** das wäre die Spirale von vorn (Narben §1.6).

**Orthogonale Fäden (berühren die Naht NICHT — eigene roadmap-Punkte, hier bewusst ausgegrenzt):** U4
(Deko/Impostor) · U5 (Schatten-CSM) · U6 (Clipmap) lesen dieselbe LOD-Kaskade, aber nicht die Naht —
getrennte Bögen. **H3** (ferne Binnengewässer jenseits ±1024 m) ist eine Worldgen-REGION-Grenze, nicht die
Chunk-Naht — verwandt mit T4 (das CA müsste die mitwandernde Region tragen), aber ein eigener Faden. Diese
NICHT in diesen Bogen ziehen (Scope-Disziplin — der Plan heilt die Grenze, nicht alles).

**Die Disziplin (gegen die Wiederholung der Spirale):**
1. **Regel #0** — jede pixel-blinde Phase browser-bestätigt + gemergt, bevor die nächste beginnt.
2. **Eine verworfene Architektur nicht wieder anfassen** (Narben §1.6) — kein flacher Fluss, keine Zell-Maske.
3. **Determinismus-Wand heilig** — Worker bit-identisch nach jeder Mesher/Wasser-Phase.
4. **Miss zuerst** — T0 vor dem ersten Umbau; jeder Reproducer mit Output-Lesen *vor* dem Fix.
5. **Keine halben Schritte** (V17.30) — ist eine Phase dran, baue ihr ganzes Subsystem an die Wurzel.

**Die Vision (wofür):** ein Terrain, dessen Chunks EINE Sprache sprechen — kohärent über Edit, über LOD,
über die Grenze. Kantige Canyons, große begehbare Höhlen, Eingänge in die Unterwelt, und Wasser, das
wirklich *fließt* — über die Grenzen, in die Kanäle, sein Niveau suchend. Nicht Minecraft nachgebaut:
**Minecraft an seiner eigenen Stärke (kohärente Welt + fließendes Wasser) übertroffen, mit der Schönheit
scharfer Geometrie, die Minecraft nie hatte.** Das ist, was dem Terrain gerecht wird.

## Quellen (die Riesen)
**Fundament:** Transvoxel/Lengyel (LOD-Transition) · Dual Contouring of Hermite Data (Ju et al., QEF) ·
Manifold DC (Schaefer/Ju, gegen Self-Intersection) · Nick Gildea (DC-Seams-Praxis) · 0fps (blocky-LOD,
Geomorph) · Minecraft/DwarfCorp (CA-Wasser, active-cells, cross-chunk-wake).
**Aktueller Stand 2021–2024 (read-as-stranger-Review 09.06.):** Teardown/Gustafsson (mesh-frei, Raymarching
→ HW-Raytracing — der Gipfel) · Nanite + **Aokana** (GPU-Driven Voxel for Open World, arxiv 2505.02017 —
Cluster-LOD + das Höhlen-Disconnect-Problem) · Tuntenfisch (GPU-Dual-Contouring, destructible) · Nick
McDonald (Vertex Pooling) · SIGGRAPH 2023 (GPU-FLIP/PIC — bewusst NICHT gewählt, freie Flüssigkeit ≠ unser Ziel).
