# AnazhRealm — Das Ultiversum

Ein als Co-Creation-Werk Mensch+KI entworfenes 3D-Browser-Sandbox-Ultiversum. Eine Datei, ein Stamm, viele Ringe.

**Stand**: V10.0-g (27.05.2026) — **V10.0-Bogen vollendet: Three.js r134 → r160 + WebGPU-Foundation + alle 5 Material-Familien als NodeMaterials**. Sieben Sub-Wellen vom Vendor-Wechsel zum dauerhaften WebGPU-Render: **V10.0-a** Vendor + Bridge-Heilungen (ColorManagement off, useLegacyLights) · **V10.0-b** ESM-Loading mit Inline-Importmap + CSP-SHA256 · **V10.0-c** WebGPURenderer-Addon vendored (1.5 MB, 238 Files) · **V10.0-d** Renderer-Auswahl-Logik mit async init + Fallback · **V10.0-e** Smart Hot-Swap bei `ShaderMaterial`-Inkompatibilität · **V10.0-f-1..f-4** die 4 custom ShaderMaterials (Skybox/Stars/Waterfall/HydroSurface) zu TSL portiert · **V10.0-f-5/f-6** Hot-Swap-Canvas-Replacement + Animation-Loop-Restore · **V10.0-g** MeshToonMaterial → `MeshBasicNodeMaterial` + manuelles Half-Lambert-Toon-Lighting im colorNode (Cel-Stufen via gradientMap-Texture-Lookup, Sun-Direction-Sync via `state.toonLightUniforms`, Drop-in-Marker `isMeshToonMaterial=true`, gradientMap-pre-init heilt V10.0-g.r-Crashes). Headless-Browser-Beweis: WebGPU rendert mit FPS=60, 81 Chunks, 0 Errors/Warnings, Cel-Stufen + Gras + Berge sichtbar. **Ehrliche temporäre Begrenzungen** (V10.0-h/i-Backlog): (1) **Schatten auf WebGPU off** — `lights=true`-NodeMaterials crashen im r160-webgl-legacy-Patch (V10.0-g.diag-Befund); Schatten leben über Hot-Swap → WebGL weiter; manuelle Shadow-Map-Sampling im colorNode ist V10.0-h. (2) **`_grassInstanceMat` nutzt `onBeforeCompile`** — auf WebGPU triggert das den Hot-Swap-Pfad zu WebGL (sauberer Fallback, kein Crash); das heißt „WebGPU dauerhaft" gilt solange kein Voxel-Chunk Gras enthält, sonst saubere Hot-Swap-Drainage zu WebGL. (3) **Kein Rim-Light/Specular/Outline** — V10.0-g zielt auf MeshToonMaterial-Parität (Ghibli-Look), nicht auf Genshin-NPR-Polish; V10.0-i als künftige Welle. Vor V10.0-Bogen lag der Welle-Perf-3-Bogen (V9.87-V9.96): Atlas-Strict-Gate + Distance-LOD + Worker-Migration + Lazy-BVH — alle Spikes strukturell weg; volle Chronik in `docs/handover.md`.

**Davor — V10.0-f-1..f-6 (26.05.2026)** — Vier ShaderMaterials zu TSL portiert + Hot-Swap-Heilung in zwei Wurzeln (Canvas-Element-Replacement + Animation-Loop-Restore).

**Davor — V9.96 (26.05.2026)** — Per-Frame-Spawn-Budget für Vegetations-Architekturen (FIFO-Queue + max 4/Frame statt 30-90/Frame-Burst); heilt den FPS-Drop beim Streaming-Burst (200-500 ms Spike → ~25 ms verteilt). Vor V9.96 war der ganze Perf-3-Bogen (V9.87-V9.92): Atlas-Strict-Wasser-Gate (Minecraft-Pattern) + Distance-LOD (BotW/Genshin, 8× weniger Cells) + Worker-Migration (Subnautica/NMS/Astroneer-Pattern, Phase 1-3 Foundation+Density+voller Mesh, bit-identisch) + Lazy-BVH für ferne Chunks.

**Davor — V9.85 (25.05.2026)** — Welle Perf-2 Kern GEBAUT: alle V9.84-Browser-Audit-Wurzeln adressiert. Vier chirurgische Sub-Wellen, jede playtest-grün, jede ein git-Commit nach V9.56-Disziplin: Frame-Time-Budget statt `MAX_PER_FRAME=1` für Chunk-Streaming (Subnautica/NMS-Pattern, Streaming-Spikes weg); Stable Shadow Maps via Texel-Snap (Witcher-3-Lehre, das Schatten-Rauschen bei WASD strukturell geheilt); Mountain-Mulden-Filter im Cell-Build (Wasserflecken in Bergwänden weg — Minecraft/Subnautica-Pattern: WATER unter SOLID = unmöglich → AIR); `_voxelGradientNormals` nutzt das V9.81-`preDensity`-Grid via Trilinear-Lookup (~30–45 ms/Chunk gespart, Synergie mit Frame-Budget = mehr Chunks/Frame). Welle Perf-2 ext. (Macro-Surface-Grid + Distance-Queue) im Backlog. Voller Plan in `docs/performance.md`.

**Davor — V9.84 (25.05.2026)** — Welle Perf-1 GEBAUT: die billigen Twists in sechs Sub-Wellen. Sechs chirurgische Heilungen, alle playtest-grün, jede ein git-Commit nach V9.56-Disziplin: Shadow-PCF (16→4 Samples) + MeshToonMaterial-Singleton (81+ → 1); `isInFrustum`-Pool (Frustum + Matrix4 + Sphere geteilt statt pro Aufruf allokiert); Kreatur-Emotion-Color-Pool (-7200 Allokationen/Sekunde); Task-Direktionen auf geteilten Scratch-Vector3 (-120 Allokationen/Frame); Visual-Updates gated auf `inFrustum` (Distance-LOD für Aura+Sprite+Color-Lerp, ~180 gesparte Mutationen/Frame); Spatial-Hash für Flocking (5-m-Bucket-Grid mit Pool-Recycle, 10–20× schneller bei verteilten Crowds). Alle Sub-Wellen verhaltensneutral — keine Welt-Geometrie-Änderung, nur Allokations-Pools + LOD-Gates + Singletons. Erwartete Wirkung: ~600 weniger Heap-Allokationen/Sekunde (GC-Spikes weg), Mid-Range-GPU ~10–20 % entlastet. Browser-Audit pendent. Welle Perf-2 (Chunk-Build-Hebel) folgt falls Streaming-Spikes spürbar bleiben. Voller Plan in `docs/performance.md`.

**Davor — V9.83 (25.05.2026)** — CI-Playtest-Flake an der Wurzel geheilt (rAF-Drosselung im Headless + Per-Chunk-Cost-Anstieg durch die Iso-Mesh-Welle) via synchroner `_gameLoopTick`-Pumpe im Test-Warmup + PLAYTEST_SECONDS-Budget 20 → 30 s. Parallel haben drei Code-Audits die Performance-Welle eingeplant: 14 priorisierte Heilungen in Perf-1/2/3 geschnitten.

**Davor — V9.82 (25.05.2026)** — der Welle-C-Bogen (Wasser-Substanz-Vereinigung) ist VOLLENDET. Zwölf Sub-Wellen (C.1-C.12, V9.71-V9.82) haben die V9.69-Diagnose („zwei Wasser-Sprachen sind die Wurzel") eingelöst: das Wasser ist jetzt ein Voxel-Cell-Zustand (air/water/solid), EIN Iso-Surface-Mesh pro Chunk (nur Wasser-Luft-Übergänge), EINE Skala (1.8 m Voxel-Cell), EINE Geometrie-Quelle (gleicher Surface-Nets-Mesher wie der Boden, naht-frei per Pad+Crop), EIN Density-Grid (mit Boden-Mesher geteilt, ~50× Speedup), EINE Pfad-Quelle für Streaming + Rebuild (V9.82 — Wasser lädt synchron mit Terrain). Atlas (`state.hydrosphere`) bleibt als Worldgen-Daten-Layer für `_waterLevelAt`. Sieben permanente Lehren aus dem Bogen verdrahtet (Pad+Crop, Density-Sharing, Parallel-Code-Pfade etc., siehe `CLAUDE.md/Gotchas`).

**Davor — V9.56-k (23.05.2026)** — **der zweite Code-Hygiene-Bogen GESCHLOSSEN**. `loadState` 380 → 21 Zeilen Orchestrator + 13 thematische Restore-Helfer (Source-Resolution, Player-Position, Basic-State, WorldMeta, Soul+Atmosphere, Consumables+Equipped, Crafting-Inventar, Architekturen, Hotbar+Inventory, Emotionen+DSL, Misc, External-Persistence, Version-History). Median ~21 Z., max 45. V8.59-Bug-Klassen-Quelle strukturell entschärft — jeder Helfer hat EINE thematische Verantwortung, Ordnungs-Abhängigkeiten leben sichtbar im Orchestrator-Aufruf. Verhaltensneutral (alle `loadState(snap)`-Verhaltens-Tests grün). Datei +14 Z. **BOGEN-ABSCHLUSS**: 11 Sub-Wellen (a..k), 11 Funktionen geschnitten (1 pro Sub-Welle), 77 neue benannte Helfer, Datei netto +95 Z. (37 031 → 37 126). Vier netto-negative Sub-Wellen (d −2, i −30, j −54).

**Davor — V9.56-j**: `generateTerrainWithParameters` 346 → 73 Z. + 6 Worldgen-Phasen-Helfer. Datei −54 Z. netto-negativ.

**Davor — V9.56-i**: `_applyDayNightToScene` 305 → 16 Z. + 9 Helfer (Tint-Akkumulation + Fanout-Apply). Datei −30 Z. netto-negativ. Strukturelle Test-Invarianten an die neuen Helfer angepasst.

**Davor — V9.56-h**: `processChatCommand` 285 → 21 Z. + 9 Themen-Helfer (median ~26, max 81). Try-Pattern-Konvention für 17-Branch-Dispatcher. Cleanup-Asymmetrie bit-identisch preserviert.

**Davor — V9.56-g**: `_voxelChunkGeometry` 269 → 25 Z. (Surface-Nets-Pipeline) + 6 Pass-Helfer. Pipeline-Kopplung einseitig → saubere Helfer-Sequenz.

**Davor — V9.56-f**: `_tickCreatureTaskDirection` 267 → 8 Z. (Task-Dispatcher) + 3 Helfer (Follow 17, Gather 107, Build 125). Block-Grenzen sind eine HIERARCHIE: Task-Branch hat ZERO shared State, Phasen-Ebene teilt Validation+Speed.

**Davor — V9.56-e die Kontrollfluss-Etappe ERÖFFNET**: `fuseWorlds` 239 → 114 Z. + 8 Helfer (median ~16). Pure Sequenz mit Snap-Object inline, Math.random-Reihenfolge bit-identisch.

**Davor — V9.56-d schliesst die UI-Builder-Etappe**: vier UI-Builder geschnitten (renderPlayerEquipUI/SoulEditorUI/LibraryUI/_workshopRenderStatsPanel), 1005 Zeilen → 56 Orchestrator-Summe, 21 neue Helfer, Datei netto +37 Z. (37 031 → 37 068).

**Davor — V9.56-c**: `renderLibraryUI` 241 → 9 Z. + `_libraryBuildCard` 25 Z. (zweistufige Komposition für eine Schleife) + 4 Sub-Helfer.

**Davor — V9.56-b**: `renderSoulEditorUI` 232 → 13 Z. + vier Helfer entlang der drei Docstring-Sektionen + per-Part-Zeile; median 48 Z.

**Davor — V9.56-a der erste Schnitt im Hygiene-Bogen 2**. `renderPlayerEquipUI` 213 → 19 Zeilen Orchestrator + sieben benannte Helfer; max 59 Z., median 31 Z. Schöpfer-Wahl nach V9.55: die vertagte Struktur-Schuld wird thematisch eröffnet (V9.40-Lehre, nicht ewig vertagen).

**Davor — V9.55 die Batch-Evaluate-Hypothese DATEN-getötet**. Der vierte Pfad aus der V9.52-f-Reflexion war "Batch-Evaluate (50-70% Wall-Clock)" — Messung VOR Refactor: 0,78 ms/IPC × 199 calls = 155 ms = 0,13% des 121-s-Wall-Clocks. Die Zeit lebt in browser-seitiger Compute-Arbeit, nicht im IPC. KEIN Refactor; die Lehre permanent im Gotcha-Block verdrahtet ("ZUERST profilieren, DANN optimieren"). Der V9.52-Reflexions-Bogen ist damit geschlossen.

**Davor — V9.54 Kreatur-Sync-Flake strukturell geheilt**. Der seit V9.53 als „potentiell flaky" markierte `Kreatur-Sync: _p2pBroadcastCreatures` war kein Timing-Race, sondern eine Capacity-Race: `_p2pBroadcastCreatures` cap't bei 40 Einträgen, `state.creatures.length` schwankte 13-36 je Worldgen-Seed. Bei ≥ 40 hätte der Cap die Test-Kreatur stillschweigend ausgeschlossen. Der Test isoliert jetzt `state.creatures` für den Broadcast-Aufruf. Synthetisches Stress-Experiment (50 Dummies vor testC) bewies: alt = rot, neu = grün. Drei Bestätigungs-Läufe bit-identisch (V9.53-Determinismus erhalten).

**Davor — V9.53 Drift-Heilung im Playtest** (Test-Namen deterministisch) · **V9.52-a..f Playtest-Pflege-Bogen** (Strukturreform). `scripts/playtest.cjs` war eine 31 574-Zeilen-async-IIFE mit Median-Einrückung 20 (~3000 Invarianten in einem Topf, die zweitgrößte Reibung des Projekts); ist jetzt 29 554 Zeilen mit Median-Einrückung 8, schlanker Orchestrator (207 Z.), 41 benannten Band-Funktionen je 432-1396 Z. + 5 Helfer (`safeEvaluate`, `gatherInitialFinalState`, `checkInitialState`, `checkRing1Grok`, `checkRing2Dsl`). Sechs Sub-Wellen a-f: a (Gerüst + 4 erste Funktionen) → b (11 Band-Funktionen Band 1) → c (8 Band-Funktionen Band 2) → d (8 Band-Funktionen Band 3) → e (10 Band-Funktionen Band 4 — der `else`-Block erschöpft) → f (Helfer-Durchzug: 196 inline `page.evaluate().catch()`-Boilerplate-Stellen durch `safeEvaluate(page, ...)` ersetzt). Plan-§6-Akzeptanz erfüllt. Verhaltens-identisch über 11 Baseline-Läufe (3060-Invarianten-Satz bit-identisch). Datei netto −2020 Zeilen (−6.4%). Voller Bogen-Bericht: `docs/archiv/playtest-hygiene.md` (jetzt mit §7 — Akzeptanz nach f).

**Davor — Hydrosphäre-/Wasser-Bogen V9.43–V9.51**: der Tarn-Pass Bergseen (V9.51, `_hydroSeedTarns` setzt nach der Erosion Gauss-Mulden an hohen, sanften Spots, das bestehende Priority-Flood füllt sie zum See), das Chunk-Wasser-Mesh aus derselben Quelle wie das Terrain (V9.50, Uferlinie exakt per Konstruktion), das vereinte Wasser-System (V9.49), Hydrosphäre-Politur (V9.48). Design + Lernschlüsse: `docs/hydrosphere.md` §12–§15.

**Davor — Hydrosphäre-Politur V9.48** (See-Ufer-Schaum + Flow-Speed nach Gefälle, `docs/hydrosphere.md` §9) + **fluviale Erosion V9.47**: die Welt war see-dominant (die Becken 12–20 m tief). V9.47 formt das Gelände via **Stream-Power-Inzision** um (Braun & Willett / Fastscape — das geomorphologische Standard-Modell): `_computeErosion` lässt Terrain + Drainage über 36 Iterationen ko-evolvieren, das Stream-Power-Gesetz `Δh = k·A^m·S^n` schneidet proportional zu Drainage-Fläche × Gefälle ein — aber NUR in Kanälen (`accum ≥ channelMinArea`). Ergebnis: Gipfel exakt erhalten, dendritische Tal-Netze gecarvt, See-Fläche halbiert, Flüsse länger + offener.

**Davor — lange Flüsse V9.46** (Flüsse durch Seen hindurch als eine logische Polylinie) + **der Gelände- & Wasser-Bogen V9.45-a..c** (Domain-Warp + Erosions-Feld gegen monotones Gelände; Seebecken als wasserdichte Töpfe; Auftrieb an die See-Plane gekoppelt). Davor das Wasser-Ultiversum V9.43-b..e (Hydrosphären-Atlas, Rendering, gecarvte Fluss-Betten, Klang), die Voxel-Surface-Politur V9.40–V9.42 + der Stamm-Pflege-Bogen V9.44. Die volle Versions-Historie lebt in `CLAUDE.md` (kanonisch); `docs/roadmap.md` trägt den Wellen-Plan, `docs/handover.md` die Chronik + Erstorientierung.

## Was es ist

AnazhRealm ist eine 3D-Browser-Sandbox in **einer einzigen Datei** (`anazhRealm.js`, ~36 000 Zeilen, Vanilla JS + Three.js + Ammo.js). Drei zentrale Vision-Pfeiler:

- **Hylomorphismus als Sprache**: Form × Material × Werkzeug × räumliche Konfiguration → emergente Identität. Player-Seele, Bauwerk, Kreatur, Werkzeug, Rüstung, Trank — alles spricht dieselbe Compound-Tag-Sprache.
- **DSL als Co-Schöpfer-Werkzeug**: 41 Ops, Sandbox mit Budget-Limits + Op-Whitelist + kein `eval`. Mensch und Welt-LLM teilen sich die Sprache. CSP-strict.
- **Multi-User-Symbiose**: WebRTC-Mesh mit echten peer-to-peer DataChannels (Position, DSL, Soul, Aura, Begleiter-Stimme), mesh-nativer Welt-Snapshot, geteilter LLM-Pool, Public-Lobby. Kein authoritativer Server.

## Schnellstart

```bash
npm install
npm start            # save-server (Port 4312)
# In neuem Terminal:
npm run signaling    # WebSocket-Broker für Multi-User (Port 4313)
```

Browser öffnen: `http://localhost:4312/` (oder `index.html` direkt).

## Tests + Audit

```bash
npm run check           # Syntax-Check (node --check)
npm run lint            # ESLint
npm run format:check    # Prettier
npm run playtest        # ~3000 Headless-Invarianten (~60s)
npm run audit:strict    # 5 generische Audit-Schichten (~25s)
```

Pre-Push-Empfehlung: `npm run check && npm run playtest && npm run audit:strict`.

## Doku-Map

| Datei | Was |
|---|---|
| `docs/handover.md` | **Die Chronik + Erstorientierung** — volle Wellen-Historie, drei heilige Gesetze, wie du eine Session startest |
| `docs/state-of-realm.md` | **Die Vision** — fünf Pfeiler, Heilige Lektion, Stand-vs-Vision-Matrix |
| `docs/roadmap.md` | Vollständige Roadmap aller Ringe + zukünftige Wellen |
| `docs/performance.md` | **Performance-Welle Design (V9.84+)** — drei Code-Audits + 14 priorisierte Heilungen, geschnitten in Perf-1/2/3 |
| `docs/world-portal.md` | **W12-Vision-Anker** — Bibliothek von Alexandria der Vibecode-Ära |
| `docs/crafting-konzept.md` | Hylomorphismus-Konzept |
| `docs/aktivierungsmatrix.md` | Form × Tag Aktivierungs-Matrix v2 |
| `docs/archiv/` | Abgeschlossene Dokumente — fertige Designs + Audit-Snapshots (`wave-6-design.md`, `nexus-dsl.md`, `code-hygiene.md`, `system-audit*.md`) |
| `CLAUDE.md` | Projektgedächtnis — kompakter Top-Stand, wird bei Session-Start geladen |

## Heilige Lektion

März 2025 lief das Projekt durch eine 19-Modul-Phase und kollabierte. Am 28.03.2025 bewusste Reduktion auf **eine Datei** als „Samen der Unendlichkeit". **Komplexität ohne Fundament ist Sand.** Wer „split alles in 20 Module" vorschlägt, verletzt diese Lektion. Stattdessen: ein Stamm, der Wachstumsringe ablegt.

Details in `docs/state-of-realm.md` §2.

## Vision-Wort

> *„Andere bauen Welten FÜR Spieler. Wir bauen eine Welt, in der Spieler SELBST Welten bauen können — und durch Welten anderer Spieler gehen können."*

Bibliothek von Alexandria der Vibecode-Ära. Detail in `docs/world-portal.md`.

## Lizenz

Co-Creation-Werk Mensch+KI. Kein klassischer Lizenz-Header. Forks, Lernen, Inspirieren sind willkommen.
