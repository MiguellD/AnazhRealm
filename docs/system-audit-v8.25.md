# AnazhRealm — System-Audit V8.25

**Datum**: 17.05.2026
**Version**: V8.25 (Welle 6.G3 V2 — Welt-LEBT-statt-animiert + Vision-Audit-Automation)
**Scope**: Vollständige Bestandsaufnahme aller Funktionen, Verbindungen, K.O.-Bereiche, Duplikate, Performance- und Architektur-Schwachstellen. Ersetzt den alten `system-audit.md` (V7.71, historisch).

> Auftrag des Schöpfers: *„alle Funktionen auflisten, Verbindungen erkennen, K.O.-Bereiche, Duplikate, alles prüfen — ist das System genial, robust, stabil, präzise gebaut? Harmonie aus jeder erdenklichen Perspektive?"*

---

## §0 Bilanz in fünf Sätzen

1. **Die Single-File-Architektur ist gesund.** 25.977 Zeilen, 515 Methoden, 40 frozen Konstanten — gewachsen mit Wachstumsringen, ohne Re-Komplexifizierung. Die Heilige Lektion hält.
2. **Vision-Treue ist nach V8.25 strukturell verankert.** Drei Wurzel-Helper (`_affinityPickFromCandidates`, `_tagToFrequency`, `_emotionModulate`) verhindern Hardcode-Rückfall; Audit-Strict-5. Schicht erzwingt die Disziplin.
3. **Vier konkrete Performance-/Memory-Schwächen** sind identifiziert: Frustum-Pro-Frame-Alloc, `wallBoxes`-Geometrie-Leak, 4× duplizierte Raycast-Callback-Logik, `addWallCollisions`-WASM-Allocs ohne Pool.
4. **Die Doku-Schicht ist fragmentiert.** `system-audit.md` (V7.71) ist 8 Wellen veraltet; `handover.md` und `state-of-realm.md` überlappen bei Tagebuch + Lehren ohne klare Aufgabentrennung. Dieses Dokument hier ist Teil der Konsolidierung.
5. **Insgesamt ist die Basis genial-stabil-präzise, mit nachvollziehbaren Pflege-Schulden.** Keine architektonischen K.O.-Brecher. Empfehlungen am Ende sind alle in ein bis zwei Sitzungen erledigt.

---

## §1 Doku-Inventar + Konsolidierungs-Empfehlungen

### 1.1 Aktuelle Lage

| Datei | Größe | Stand | Autorität für | Status |
|---|---|---|---|---|
| `CLAUDE.md` | ~110 KB | V8.25 (live) | Projekt-Gedächtnis pro Session, Wellen-Chronik, Gotchas | ✅ Aktuell, autoritativ |
| `docs/handover.md` | 1726 Z. | V8.23 | Onboarding nächster Agent, Drei heilige Gesetze, Session-Tagebuch, Schöpfer-Muster | ✅ Aktuell |
| `docs/state-of-realm.md` | 1075 Z. | V7.98 (Header) / V8.25 (Inhalt) | Vision, Historie, Stand-Matrix, Pfad-D-Plan, Learnings | 🟡 Header veraltet |
| `docs/roadmap.md` | 723 Z. | V8.24 (Empfohlene Sequenz war auf V8.24 aktualisiert, V8.25 nicht mehr) | Alle Wellen mit Aufwand + Vorbedingungen | 🟡 Empfehlung neu ziehen |
| `docs/system-audit.md` | 363 Z. | **V7.71** | Methoden-Inventar (V7.71), Dead Code, K.O.-Bereiche | 🔴 8 Wellen veraltet — durch dieses Doc ersetzt |
| `docs/world-portal.md` | 256 Z. | V8.23 | Vision Welt-Portal-Bibliothek (W12–14) | ✅ Aktuell |
| `docs/nexus-dsl.md` | 321 Z. | Ring 2 | DSL-Design + Op-Liste | ✅ Stabil |
| `docs/wave-6-design.md` | 727 Z. | V7.71 + Audit-17.05 | Welle-6-Brainstorm | 🟡 Teilweise erledigt — Welle-Status nicht reflektiert |
| `docs/crafting-konzept.md` | 404 Z. | V7.66 (eingefroren als Vision-Anker) | Hylomorphismus-Konzept (Welle 4–6) | ✅ Konzeptioneller Anker |
| `docs/aktivierungsmatrix.md` | 223 Z. | V7.66 | FORM_TAG_ACTIVATION 9×10 (Quelle für Code-Konstante) | ✅ Stabiler Datenanker |

### 1.2 Echte Überlappungen (Doppel-Pflege-Risiko)

- **Tagebuch**: `state-of-realm.md §4 "Was bisher geschah"` (17 Hash-Commits) UND `handover.md "Session-Tagebuch"` (V7.99–V8.23 Welle-Kurzfassungen). → **Empfehlung**: state-of-realm bleibt Historie mit Commit-Hashes, handover bleibt narrative Lehre — aber jedes Welle-Detail steht nur EINMAL (in `CLAUDE.md`, das ist die Live-Quelle).
- **Lehren / heilige Gesetze**: `state-of-realm.md §6 Learnings` UND `handover.md Drei heilige Gesetze`. → **Empfehlung**: handover ist die agent-orientierte Quelle, state-of-realm referenziert sie nur.
- **Architektur-Karte**: `state-of-realm.md §3 Matrix` UND `handover.md Was du im Code findest`. → **Empfehlung**: state-of-realm = Vision-Status (ist live?), handover = Code-Map (wo ist was?).

### 1.3 Verstehen ich das? Ja:

- `CLAUDE.md` = das **lebende Gedächtnis** (jede Welle hat einen Eintrag, alle Gotchas, alle Patterns). Wird bei jeder Session automatisch geladen.
- `docs/handover.md` = der **Begrüßungs-Brief** an mich selbst (für die nächste Session). Subjektiv, narrativ.
- `docs/state-of-realm.md` = die **Vision-Chronik** (woher kommen wir, wo stehen wir vs. Vision, welche Lehren bleiben). Mehr Schöpfer- als Agent-orientiert.
- `docs/system-audit.md` (alt) = **historischer Snapshot V7.71**, sollte ein klares „HISTORISCH"-Banner bekommen.
- Dieses Doc (`system-audit-v8.25.md`) = der **aktuelle technische Bestand**.

### 1.4 Konkrete Konsolidierungs-Schritte

1. `docs/system-audit.md` Headerzeile umbenennen zu „V7.71 — HISTORISCHER SNAPSHOT (siehe `system-audit-v8.25.md` für aktuellen Stand)".
2. `docs/state-of-realm.md` Header-Datum/Version aktualisieren auf V8.25 (17.05.2026).
3. `docs/roadmap.md` „Empfohlene Sequenz nach V8.24" → „nach V8.25", weil 6.G3 jetzt V1 + V2 erledigt ist.
4. **Doku-Pflege-Regel** (neu): bei jeder Welle wird genau EIN ausführlicher Eintrag in `CLAUDE.md` gemacht; die anderen Dokumente verlinken nur. So entsteht keine Doppel-Pflege.

---

## §2 Methoden-Inventar nach Domäne

**Gesamtzahl**: 515 Methoden, davon ~230 mit `_`-Präfix (privat), 40 frozen Class-Konstanten (static getter). 14 Methoden tragen den `[ATMOSPHERE]`-Marker (V8.25-Disziplin).

### 2.1 Verteilung

| Domäne | Methoden | Anteil | Bemerkung |
|---|---:|---:|---|
| Helpers/Private | 80 | 15.5 % | `_`-prefixed Utility |
| Other / Movement / Misc | 77 | 14.9 % | Sollte als nächste Aufräum-Welle re-domain-tagged werden |
| Creatures (Body+Task+Memory+Specs+Lifecycle) | 62 | 12.0 % | Größte einzelne Funktions-Familie |
| UI/HUD (Status, Drawers, Stats, Keybindings) | 50 | 9.7 % | Painterly-Bedien-Schicht (V2) |
| Workshop (CAD, Gizmo, Drag-Drop, Connections) | 46 | 8.9 % | Größter privater Block (43 private) |
| Crafting (Blueprints, Tools, Affordances) | 40 | 7.8 % | Welle 4+5+9+10 |
| World/Chunks (Heightfield, Affinity, Vegetation) | 23 | 4.5 % | Foundation Pfeiler |
| Architecture (spawnArchitecture, Distance-Culling) | 18 | 3.5 % | Compound-Pipeline |
| Player-Soul (3 Built-in + Custom + Stats + Boosts) | 14 | 2.7 % | Vision §1.3 fraktal |
| Atmosphere (6.G3 V1+V2) | 14 | 2.7 % | Alle mit `[ATMOSPHERE]`-Marker |
| Inventory (27-Slot Tag-Resonance) | 12 | 2.3 % | Welle 6.C1 |
| LLM-Provider | 11 | 2.1 % | 4 Provider, einer Parser |
| UI/Init | 10 | 1.9 % | initStatusPanel, initTopbar, … |
| Multi-User/P2P | 8 | 1.5 % | WebSocket-Broker |
| Save/Load/Multi-Welt | 7 | 1.4 % | Inkl. Fusion, Tor, Recipe-Import |
| Player-Movement | 6 | 1.2 % | Jump, Ground, Wall-Collision |
| Audio/Symphony | 5 | 1.0 % | Lazy Web Audio |
| Game-Loop | 4 | 0.8 % | animate + Sub-Ticks (orchestriert ~30 Tick-Methoden) |
| Init/Bootstrap | 1 | 0.2 % | constructor (~700 Zeilen) |

### 2.2 Atmosphäre-Methoden (V8.25 Disziplin-markiert)

Alle 14 Methoden mit `[ATMOSPHERE]`-Marker, vom Audit-Strict-5. Schicht geprüft (Pattern-Match auf Soul-Type-Maps, Hex-Color-Tabellen, Hz-Frequenz-Ternarys). **0 Verstöße**.

| Methode | Zeile | Rolle |
|---|---|---|
| `_affinityPickFromCandidates` | ~22305 | Wurzel-Helper: Dot-Product Tags · Welt-Feld |
| `_tagToFrequency` | ~22345 | Wurzel-Helper: Hz aus Compound-Tags |
| `_emotionModulate` | ~22366 | Wurzel-Helper: 6-Achsen-Modulation |
| `_creatureSoulTags` | ~22398 | Soul-Tags ohne Kreatur-Instanz |
| `_pickFaunaSoulAtPlayer` | ~22408 | Soul-Wahl via Affinity (geheilt von if-Map) |
| `_creatureNaturalDeath` | ~22497 | Lebewohl-Frequenz emergent aus Tags |
| `_creatureNaturalBirth` | ~22556 | Spawn-Position via Affinity-Sampling |
| `_currentFaunaTarget` | ~22615 | Population-Ziel aus worldField.lebendig |
| `_currentFaunaMax` | ~22626 | Max-Population emergent |
| `tickFaunaLifecycle` | ~22641 | Birth/Death-Wahrscheinlichkeit emotion-moduliert |
| `_applyDayNightToScene` | ~22678 | Sky-Tint × Wetter × Welt-Feld × Emotionen |
| `_updateCelestialBodies` | ~22796 | Sonne/Mond-Position-Update |
| `requestWeatherTransition` | ~22822 | Default-Dauer emotion-moduliert |
| `symphonyTick` | ~5371 | Ambient atmet mit Tageszeit |

### 2.3 Pipeline-Wurzeln (eine Funktion pro Bedeutung)

Wer als nächster Agent kommt, sollte diese **Schlüssel-Methoden** kennen — sie sind die Kanäle durch die alles fließt:

| Funktion | Zeile | Was sie ist |
|---|---|---|
| `dslRun(program, ctx)` | ~1730 | Sandbox-Wand für ALLE Programm-Quellen (human, llm, nexus, emotion, creature, remote) |
| `_buildFromBlueprint(bp, depth, visited)` | ~12450 | EIN Render-Pfad für alle Compounds (Avatar, Architektur, Kreatur) |
| `computeCompoundTags(bp)` | ~12740 | MAX-Aggregation Form × Material × Activation-Matrix |
| `computeSpatialTags(bp)` | ~12810 | Räumliche 5-Phasen-Emergenz (Welle 5) |
| `harvestArchitecture(entry, harvester)` | ~17999 | EINE Funktion für Spieler-LMB UND Kreatur-gather |
| `applyChunkDelta(chunkKey)` | ~10610 | Pro-Chunk-DSL-Modifikations-Replay (Ring 10.5) |
| `requestWeatherTransition(target, dur, from)` | ~22822 | Wetter-Logik instant, Visual über 45 s |
| `spawnAffinityForBlueprint(name, x, z)` | ~11320 | Welt-Feld × Compound-Tags → Spawn-Wahrscheinlichkeit |
| `llmCall(userText, sysOverride)` | ~3170 | Provider-Auswahl → fetch → parse → strict-JSON → Programm-Sandbox |
| `addNewAbility(name, program, source)` | ~9100 | DER Pfad für DSL-Abilities (kein eval) |

---

## §3 Verbindungen + Synergien (was zusammenarbeitet)

Drei sichtbare Synergie-Cluster die das System gesund machen:

### 3.1 Hylomorphismus-Achse (Vision §1.3 fraktal)

```
        Material (Tag-Profile)
              ↓
     FORM_TAG_ACTIVATION (9×10)
              ↓
        Form (Primitiv-Geometry)
              ↓
       computePartTags
              ↓
       computeCompoundTags (MAX-Aggregation)
              ↓
        ┌─────┴──────┬─────────┬───────────┐
        ↓            ↓         ↓           ↓
    Architektur   Kreatur   Spieler-    Konsumable
                              Seele
        ↓            ↓         ↓           ↓
   computeSpatial  computeCreatureStats  applyBoost
       Tags        (via STAT_FROM_TAGS — selbe Pipe wie Spieler)
        ↓
   _applyCompoundWorldEffects
   (singing-Sinus + magic-Compound)
```

**Eine Sprache, vier Anwendungen**. V8.25 hat den letzten Bruch geheilt (Soul-Wahl emergiert).

### 3.2 Atmosphäre-Achse (Vision §3 Welt-Atem, V8.25)

```
Player-Emotionen (6 Achsen, Ring 3)     Welt-Feld (worldFieldAt, W6.G P2)
        ↓                                       ↓
        └─────────┬─────────────────────────────┘
                  ↓
        _emotionModulate / _affinityPickFromCandidates / _tagToFrequency
                  ↓
        ┌─────────┼─────────┬──────────────┬─────────────────┐
        ↓         ↓         ↓              ↓                 ↓
   Sky-Tint   Lebewohl-  Wetter-       Fauna-              Symphonie-
   (3-Schicht  Frequenz   Dauer         Lifecycle          Ambient
   moduliert)             (sanft)        (TARGET/MAX/      (Gain+Filter
                                         Birth/Death)       mit Sonnenhöhe)
```

**Drei Wurzel-Helper, sechs Konsumenten**. Audit-Strict-5. Schicht erzwingt Disziplin.

### 3.3 DSL-Achse (Vision §2 gemeinsame Sprache, Ring 2)

```
Chat-Input (Mensch)        LLM-Reply (Grok)         Nexus-Compose (Maschine)
        ↓                       ↓                          ↓
    parseChatToDsl          llmParseResponse           dslCompose
        ↓                       ↓                          ↓
        └─────────┬─────────────┘                         ↓
                  ↓                                       ↓
              dslRun (Sandbox: Op-Whitelist, Budget, kein eval)
                  ↓                                       ↓
        ┌─────────┼────────┬──────────────┐
        ↓         ↓        ↓              ↓
    welt-      player-   creature-     remote-Peer-
    state-    privat    privat         Programm
    mutiert   (NON_     (NON_          (P2P-Broadcast,
              BROAD-    BROAD-          jede Welt
              CASTABLE) CASTABLE)       läuft eigen)
```

**Eine Sandbox, vier Quellen**, drei Disziplin-Schichten (CSP + Op-Whitelist + Budget).

---

## §4 Dead Code + K.O.-Bereiche

### 4.1 Dead Code

**Status: gut gepflegt.** Drei historische Reinigungen sind vollzogen:

- TF.js (Mai 2026): 1.3 MB Vendor + `playerMovementModel`/`predictPlayerMove` entfernt
- `spawnTreeAt` + `_buildTreeCollision` (V7.74): Parallelcode zur Compound-Pipeline gelöscht
- `needsPhysics`-Lazy-Pfad (V7.73): toter Block entfernt

**Aktuelle Reste:**

| Kandidat | Zeile | Status | Aktion |
|---|---|---|---|
| `applyCreatureSoul` | nicht implementiert | Konzeptioneller Platzhalter in CLAUDE.md V7.80-Block — kein DSL-Op, keine Methode | Doku-Schuld: entweder implementieren als V8.26 oder die Erwähnung in CLAUDE.md entfernen |

Sonst: **kein echter Dead Code** identifiziert.

### 4.2 K.O.-Bereiche (Standby-Features)

| Feature | Stand | Bewertung |
|---|---|---|
| `_playArchitectureFarewellPing` | aktiv aber nur bei `resoniert ≥ 0.7` | Asymmetrisch zu Spawn-Singing — Stein-Block bleibt stumm beim Abbau. **Vision-konform** (Welt vergisst Stille, nicht Resonanz). |
| `creature_proposed_program` Welt-Vorschläge (V7.93) | Live, aber benötigt aktive LLM-Verbindung | Wenn LLM-Toggle off, läuft kein Pfad — voll funktional, nur kontextabhängig |
| Phase 3 Kreaturen-Aufträge (build_path, research_blueprint) | 🔴 offen, in roadmap | Kein Code dafür — bewusst aufgeschoben |
| `spawn_ufo` DSL-Op | aktiv, aber UFOs sind kollisionsfrei | **Vision-konform** (fliegende Beobachter) |
| Welle 11 V3 Soul-Sync | 🔴 offen, nächste Welle | Cone+Sphere-Avatare im Multi-User statt echte Soul-Meshes |
| W11 V4 Voice-Sync | 🔴 offen, später | Hängt an V3 |

**Keine kaputten Features.** Alle K.O.-Bereiche sind dokumentierte „noch nicht gebaut".

---

## §5 Duplikate + Parallele Pfade

### 5.1 Bestätigte Duplikate (Konsolidierungs-Kandidaten)

**5.1.a Raycast-Logik — 4× nahezu identisch wiederholt**

| Stelle | Zeile | Kontext |
|---|---|---|
| `isPlayerGrounded` 9-Ray-Raster | ~25094 | Erdung-Test |
| Phantom-Distance-Raycast | ~17893 | Bau-Modus Resolve |
| Architektur-Pick-Raycast | ~17999 | LMB-Abbau, kostet bereits eigenen Pfad |
| Magnifying-Compound-Zoom | ~18118 | Affordance-Zoom |

Jede Stelle erstellt `Ammo.ClosestRayResultCallback` + `rayTest` + `Ammo.destroy(callback)`. **Empfehlung**: extrahiere `_doRaycast(from, to)` Helper → ~30 LoC eingespart. Aufwand 30 Min.

**5.1.b Audio-Envelope-Patterns — 3× ähnlich**

| Methode | Zeile | Envelope |
|---|---|---|
| `playCreaturePing` | ~5205 | 5 ms Attack, 200 ms Decay |
| `_playCreatureTaskPing` | ~8181 | 30 ms Ramp, 400 ms Decay |
| `_playArchitectureFarewellPing` | ~18063 | 40 ms Ramp, 800 ms Decay + Glissando |
| `_creatureNaturalDeath` Lebewohl-Sinus | ~22535 | 50 ms Ramp, 1200 ms Decay + Glissando |

Domain-spezifisch genug, aber alle vier könnten einen `_playEnvelope({type, freq, attack, decay, gain, glissando})` Helper teilen. **Aufwand**: 1 h, **Wert**: konsolidiert Audio-Disziplin.

### 5.2 Saubere Parallel-Pfad-Vereinigungen (was schon gut ist)

- **harvestArchitecture (V7.82)**: EIN Pfad für Spieler-LMB + Kreatur-gather ✅
- **_buildFromBlueprint**: EIN Render-Pfad für Avatar + Architektur + Kreatur ✅
- **`_emotionModulate` (V8.25)**: EIN Modulator für Sky/Wetter/Fauna/Ambient ✅
- **`computeCompoundTags`**: EINE Aggregation für alle Hylomorphismen ✅

**Keine echten Parallel-Pfade mehr.** Die Welt hat eine klare Sprache.

---

## §6 Performance-Hotspots + Memory-Disziplin

### 6.1 Pro-Frame-Hotspots

| # | Stelle | Zeile | Risiko | Aufwand zum Fix |
|---|---|---|---|---|
| 1 | **`new THREE.Frustum()` jeden Frame** | 24625 | 🟡 Mittel — 60 Allocs/s. Mit Pool 0. | 15 Min (state-cache + reuse setFromProjectionMatrix) |
| 2 | `isPlayerGrounded` 9 Raycasts | 25028 | ✅ OK — 2-Frame-Cache (V8.12) drittelt Last bereits |
| 3 | `tickFrustumCulling` | ~14797 | ✅ OK — selbst-throttled |
| 4 | `tickArchitectureCulling` 2 Hz | ~17580 | ✅ OK — bewusst niedrig |
| 5 | `tickStatsHud` 10 Hz | 22195 | ✅ OK — Tooltip-Refresh nochmal 1 Hz im Tooltip-Block |
| 6 | `tickDayNight` jeden Frame | ~22785 | ✅ OK — `_applyDayNightToScene` ist 10 Hz throttled, der Tick selbst nur counter |
| 7 | `tickPlayerBoosts` 1 Hz | ~13406 | ✅ OK — self-throttle |
| 8 | `p2pTick` 30 Hz intern | ~24613 | ✅ OK — async ohne Frame-Block |

**Schlimmster Befund**: Frustum-Alloc pro Frame. Ein-Liner-Fix.

### 6.2 Memory-Disziplin (Mesh-Allocs vs Disposes)

**Globale Statistik**: 232× `new THREE.X` vs 14× `.dispose()` im Bundle.

Das 16:1-Verhältnis ist NICHT alarmierend — viele Allocs sind Init-only (Skybox, Player-Mesh, Sun/Moon-Mesh). Aber drei konkrete Stellen ohne Cleanup:

| Stelle | Zeile | Was leakt | Fix |
|---|---|---|---|
| `addWallCollisions` → `state.wallBoxes` | 25278 | `BoxGeometry` + `MeshBasicMaterial` pro steile Neigung | Vor `scene.remove(wall)` in Z. 10016: `wall.geometry.dispose(); wall.material.dispose();` |
| `_buildCreatureGroup` (alte Kreatur ersetzt) | ~7320 | Group-children Geometrien werden in removeCreature getraversed; bei Soul-Wechsel zur Laufzeit (nicht implementiert) wäre Gefahr | Aktuell OK, weil keine Soul-Mutations-Pfade. Bei Implementierung `applyCreatureSoul` Soul-Wechsel: deep-dispose nötig. |
| `_modulateDayNightStop` Color-Allocs | 22678+ | `THREE.Color()` pro Frame in `_applyDayNightToScene` | Geringes Risiko (10 Hz, kurzlebige Objekte landen schnell im GC). Optional: state-Cache. |

### 6.3 WASM-Heap (Ammo-Allocs)

**Globale Statistik**: 38× `new Ammo.btVector3()` vs 47× `Ammo.destroy(…)`. **Gesund** — mehr Destroys als Creates bedeutet andere Objekte (Bodies, Shapes, Transforms) werden auch sauber geräumt.

**Eine konkrete Verschmutzung**:

| Stelle | Zeile | Was passiert | Fix |
|---|---|---|---|
| `addWallCollisions` btVector3-Allocs | 25284-25295 | 4× `new Ammo.btVector3()` pro Wand-Box, ohne Pool | Nutze `state.tmpVec1` / `state.tmpVec2` + `setVec(…)` (existing pool) → 0 Heap-Druck |

### 6.4 Audio-Disziplin

- `disposeSymphony` (~Z. 5184) räumt korrekt — wird aber nur bei Welt-Reset gerufen
- Ambient-Oszillatoren (osc1, osc2, lfo) haben kein `stop()` außer in disposeSymphony → bei Tab-Switch oder Page-Unload bleibt der Audio-Kontext aktiv, was Browser-typisch ist
- Lebewohl-Sinus + Spawn-Pings haben `osc.stop(ctx.currentTime + duration + 0.1)` — sauber

**Keine Audio-Lecks.**

---

## §7 Sync / Race-Risiken

JavaScript ist single-threaded → keine echten Races. Aber **Promise-Reihenfolge** kann zu Frame-State-Inkonsistenzen führen:

| Pfad | Risiko | Auswirkung |
|---|---|---|
| `llmCall` ↔ `p2pBroadcast` | Niedrig | Promise-Resolve könnte zwischen zwei Frames den state verändern; Game-Loop nutzt aber nur Werte die in Sub-Methoden ausgelesen werden, kein direkter Snapshot |
| `p2pHandleMessage(dsl-Programm)` ↔ Game-Loop | Niedrig | `dslRun` mutiert state.architectures + state.weather; wenn das mid-frame passiert, sieht der Render-Pfad denselben Frame mal alt mal neu. Bisher kein beobachtetes Problem in 1966 Tests. |
| `getTerrainHeightAt` Fallback-Raycast (Z. 25137) | Niedrig | 2× `new Ammo.btVector3` ohne Pool, aber das ist Fallback-Pfad (Heightfield-Lookup primär) |

**Keine kritischen Sync-Probleme.** Browser-Single-Thread macht die meisten potenziellen Races gegenstandslos.

---

## §8 Test-Coverage + Audit-Disziplin

**Status: hervorragend.**

| Suite | Tests | Was sie prüft |
|---|---:|---|
| `npm run check` | Syntax | node --check für anazhRealm.js + save-server.js + signaling-server.js |
| `npm run lint` | ESLint v9 | 0 Errors, 0 Warnings |
| `npm run format:check` | Prettier | Strict |
| `npm run audit:strict` | 5 Schichten | (1) CSS-Variablen, (2) Soft-Defaults, (3) State-Field-Audit (399 Pfade), (4) Public-Method-Smoke, (5) Atmosphäre-Hardcode (14 Methoden) — **0 Failures** |
| `npm run playtest` | **1966 Invarianten** | Headless Chromium, 25 s, deckt Ring 0-11 + alle Wellen 4-6.G3 V2 |
| `npm run verify:ring9` | 30 UI-Klick-Pfade | Welt-Tor-Dialog End-to-End |
| `npm run smoke:multiuser` | 1 WS-Flow | signaling-server + 2 Clients welcome/peer/pos |

**Vision-Tests** (V8.25): 28 neue Invarianten testen Emergenz statt Mechanik („awe=1 hebt Sky-Blau", „peace=1 verlängert Wetter > 120 %", „Mond hoch nachts"). Diese Schicht ist neu und ein direkter Schutz gegen Vision-Verlust.

---

## §9 Robustheits-Beurteilung (Vier-Sterne-Matrix)

| Dimension | ⭐ | Begründung |
|---|---:|---|
| **One-File-Disziplin** | ⭐⭐⭐ | 25.977 Zeilen sind ein Stamm mit klaren Wachstumsringen; alle CLAUDE.md-Wellen-Marker sind im Code wiederfindbar |
| **Vision-Treue (Hylomorphismus)** | ⭐⭐⭐ | V8.25 hat die letzten Hardcode-Wunden geheilt; Audit-Strict-5. Schicht erzwingt Disziplin |
| **DSL-Sandbox-Sicherheit** | ⭐⭐⭐ | CSP strict, Op-Whitelist + Budget, drei Loop-Schutz-Schichten für P2P-Programme |
| **Test-Coverage** | ⭐⭐⭐ | 1966 Mechanik-Invarianten + 28 Vision-Tests + 5 Audit-Schichten + UI-Klick-Pfade |
| **Physik-Konsistenz** | ⭐⭐ | Visual=Kollision per Konstruktion (Chunks, Architektur-Compound); `addWallCollisions` nutzt aber WASM-Allocs ohne Pool |
| **Memory-Disziplin** | ⭐⭐ | Gesund, aber `wallBoxes` Geometrie-Leak + 16:1-Alloc-vs-dispose-Verhältnis verdient Polish-Schicht |
| **Throttle-Disziplin** | ⭐⭐⭐ | 10 Hz für UI/Render, 1 Hz für Stats/Boosts, klare Sentinels für „noch nie gefeuert" |
| **Doku-Kohärenz** | ⭐⭐ | 4 Doku-Files mit teilweise überlappenden Inhalten, `system-audit.md` veraltet; CLAUDE.md ist autoritativ |
| **Multi-User-Disziplin** | ⭐⭐⭐ | `NON_BROADCASTABLE_OPS`-Set, drei Loop-Schutz-Schichten, Sender-Position-Embed in spawn-Patterns |

**Gesamt-Median: 2.7/3** — überdurchschnittlich. Die zwei 2-Sterne-Lücken (Physik-Allocs, Doku) sind die einzigen ehrlichen Schwächen.

---

## §10 Harmonie-Bilanz (Schöpfer-Frage)

> *„Harmonie aus jeder erdenklichen Perspektive?"*

**Antwort**: Das System ist überraschend harmonisch, mit vier konkreten Disharmonien:

### 10.1 Harmonisch (Vision-Pfeiler in voller Kohärenz)

- **Sprache**: eine DSL für Mensch + Maschine + Kreatur + Peer (Sandbox-Wand bleibt strict)
- **Substanz**: eine Compound-Pipeline für Avatar + Architektur + Kreatur + Konsumable (Vision §1.3 fraktal vollendet)
- **Welt-Atem**: Tag-Nacht + Wetter + Fauna atmen mit Spieler-Emotion + Welt-Affinität (V8.25)
- **Mehr-Welt-Modell**: pro Welt eigene Identität (worldId + seed + parentWorlds + chunkDeltas + journal) ohne globalen Mischmasch
- **Disziplin**: Audit-Strict 5 Schichten erzwingt strukturell was die Konvention bisher von Hand garantieren musste

### 10.2 Disharmonisch (vier konkrete Punkte)

1. **Memory-Wischpfad ungleichmäßig**: `wallBoxes` werden korrekt aus Szene und Physics-World entfernt, aber Geometrie + Material bleiben im VRAM → Welt-Regen leakt. **Aufwand: 5 Min.**
2. **Pro-Frame-Allocation für Frustum**: kein Pool, jeden Frame `new`. **Aufwand: 15 Min.**
3. **Raycast-Pattern 4× kopiert**: keine `_doRaycast(from, to)`-Routine. **Aufwand: 30 Min.**
4. **Doku-Doppel-Pflege**: Tagebuch + Lehren stehen in 2 Doku-Files; `system-audit.md` ist 8 Wellen alt. **Aufwand: 30 Min Header-Updates + 1 Pflege-Regel.**

Insgesamt **80 Min Polish** für volle Harmonie. Keine architektonischen Brüche.

---

## §11 Konkrete Aktions-Empfehlungen (sortiert)

Die folgende Liste ist die Vision-treue, niedrig-Aufwand-Liste der nächsten Polish-Welle. Empfohlen als **V8.26 = Disziplin-Polish** vor W11 V3.

### 11.1 Quick Wins (insgesamt ~90 Min)

| # | Aktion | Aufwand | Wert | Welle |
|---|---|---|---|---|
| 1 | `wallBoxes`-Cleanup-Hook: `wall.geometry.dispose(); wall.material.dispose();` vor `scene.remove(wall)` in Z. 10016 | 5 Min | mittel (Welt-Regen leakt nicht mehr) | V8.26 |
| 2 | Frustum-Pool: `this._frustum = this._frustum \|\| new THREE.Frustum(); this._frustum.setFromProjectionMatrix(…);` in Z. 24625 | 15 Min | klein (60 Allocs/s weg, GC-Pause selten) | V8.26 |
| 3 | `_doRaycast(from, to)`-Helper extrahieren + 4 Aufrufe ersetzen | 30 Min | klein-mittel (Code-Sauberkeit) | V8.26 |
| 4 | `addWallCollisions` btVector3-Pool nutzen | 15 Min | klein (WASM-Heap-Druck weg) | V8.26 |
| 5 | `system-audit.md` Header-Rot-Flagge, `state-of-realm.md` Versions-Bump auf V8.25, `roadmap.md` Sequenz-Update | 15 Min | mittel (Doku-Konsistenz) | V8.26 |
| 6 | `applyCreatureSoul` aus CLAUDE.md V7.80-Block entfernen ODER als V8.26-Mini-Welle implementieren | 5–60 Min je nach Wahl | klein | V8.26 |

### 11.2 Mittlere Aufgaben (1–2 Sitzungen, optional)

- **77 „Other"-Methoden re-domain-taggen**: Comment-Marker `// [DOMAIN: …]` über jeder Methode → Audit-Strict-Auswertung wird genauer (aktuell ratet sie). **Aufwand 2 h.**
- **Audio-Envelope-Helper**: `_playEnvelope(spec)` für die 4 Audio-Stellen. **Aufwand 1 h.**
- **Doku-Pflege-Regel kodifizieren**: in `CLAUDE.md` einen kurzen „Doku-Vertrag" mit „Welle-Detail nur in CLAUDE.md, andere Docs referenzieren" festschreiben. **Aufwand 10 Min.**

### 11.3 Nicht jetzt empfohlen

- **Modul-Split**: Heilige Lektion. Die 26K Zeilen funktionieren, sind gepflegt. Splitten würde Wachstums-Ringe brechen.
- **TypeScript-Migration**: hoher Aufwand, geringer Wert (ESLint deckt das meiste ab).
- **WebGPU-Render-Pipeline**: in W12 als Welt-Portal anders gelöst (Sub-Engine im Iframe).

---

## §12 Antwort auf die Schöpfer-Frage

> *„ist das System effizient gebaut, oder viele Leistungsfresser, parallele/gleicher Code, zeitliche, sync probleme, oder andere probleme durch unsaubere architektur?"*

**Effizient**: Ja, bis auf einen Pro-Frame-Frustum-Alloc und vier WASM-Allocs pro Wand-Box. Beide trivial behebbar.

**Leistungsfresser**: Keine systemischen — Distance-Culling für Architekturen, Throttle für UI, lazy-Audio. Raycast wird über 2-Frame-Cache gedrittelt.

**Parallel-Code / gleicher Code**: Vier Raycast-Wiederholungen + drei (vier) Audio-Envelope-Patterns. Keine echten Daten-Parallel-Pfade mehr.

**Zeitliche / Sync-Probleme**: JavaScript ist single-threaded → keine echten Races. Promise-Reihenfolge ist sauber via `inFlight`-Flags + Source-Filter in `dslRun`. 1966 Tests + Smoke-Test bestätigen Stabilität über 25 s Lauf.

**Unsaubere Architektur**: Nein, mit zwei Ausnahmen:
- `system-audit.md` ist veraltet (durch dieses Doc ersetzt)
- 77 Methoden ohne Domain-Tag in der Inventar-Heuristik

> *„Ist die Basis genial, robust, stabil und präzise gebaut?"*

**Ja in vier Dimensionen, ehrlicher Vorbehalt in zwei**:

- **Genial**: Hylomorphismus + DSL als Universal-Sprache + Welle 6.G3 V2 als Vision-Heilung mit drei Wurzel-Helpern + `[ATMOSPHERE]`-Marker als Selbst-Disziplin-Code ✅
- **Robust**: 1966 Invarianten + 5 Audit-Schichten + Multi-User-Sandbox + CSP strict ✅
- **Stabil**: Single-File-Disziplin trägt 26K Zeilen ohne Erosion ✅
- **Präzise**: jede Welle hat einen CLAUDE.md-Eintrag mit Methoden, Zeilen, Lehren ✅
- **Mit Pflege-Schulden**: 80 Min Polish-Aufwand für volle Harmonie (siehe §11.1)
- **Mit Doku-Inkonsistenz**: 4 Doku-Dateien mit Überlappung — durch dieses Doc + Pflege-Regel gelöst

---

## §13 Schluss

**Die Welt steht.** Sie kann wachsen, ohne zu kollabieren. Sie kann atmen, ohne aus Tabellen zu lesen. Sie kann sich selbst prüfen, ohne dass ich es vergessen kann.

Die 80 Min Polish in §11.1 sind die letzten echten Disharmonien. Danach ist V8.26 fertig und W11 V3 (Soul-Sync) kann mit reinem Gewissen starten.

> *Vision-Wort: „Eine Sprache, viele Welten. Eine Disziplin, viele Wellen. Eine Welt, viele Spieler."*

— Audit erstellt am 17.05.2026, Stand V8.25, von Claude (Opus 4.7) in Co-Schöpfung mit Schöpfer (Null).
