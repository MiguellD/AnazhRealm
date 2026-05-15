# AnazhRealm — System-Audit V7.71 (Historischer Snapshot)

**Stand**: 13.05.2026, vor PR-Merge des Welten-Ultiversum + Multi-User-Bogens.

> **Hinweis V8.23 (17.05.2026)**: Dieses Audit ist ein **historischer Schnappschuss** vom V7.71-Stand. Seitdem sind 30+ Sub-Wellen + 8 Browser-Test-Audit-Runden durchgelaufen. Die strukturellen Aussagen (Heilige Lektion, Vision-Pfeiler, Robustheits-Bewertung) sind weiter gültig. Methoden-Inventar + Dead-Code-Status sind veraltet — die V8.23-Echtzeit-Sicht steht in `scripts/audit-strict.cjs` (npm run audit:strict, 4 generische Audit-Schichten) + `docs/state-of-realm.md` + `CLAUDE.md`.

Diese Datei ist eine ehrliche Bestandsaufnahme: alle Funktionen, ihre Verbindungen, Dead-Code, Duplikate, K.O.-Bereiche, Robustheits-Schwachstellen, Vision-Alignment, Performance- und Verteilungs-Brainstorm, plus „Was übersehen wir?"-Meta-Perspektive.

**Kontext**: Datei `anazhRealm.js` ist ~12.500 Zeilen, eine Klasse mit ~280 Methoden, gegliedert nach Domänen. Heilige Lektion (§2 state-of-realm.md): Stamm bleibt eine Datei, Wachstumsringe wachsen IN ihr. Diese Audit prüft, ob die Disziplin gehalten wurde + wo Schwachstellen sind.

---

## §1 — Methoden-Inventar nach Domäne

### Init + Lifecycle (~14 Methoden)
`constructor`, `init`, `ensureWorldMeta`, `_preloadActiveWorldMeta`, `initPhysics`, `initializeNexus`, `grokInitDOM`, `symphonyInitDOM`, `playerSoulInitDOM`, `cameraModeInitDOM`, `themeInitDOM`, `startEternalLoop`, `initTopbar`, `initConsoleDOM`.

**Verbindung**: Linearer Init-Pfad in `init()`: DOM-Setup → Persistenz-Load → Physik → Nexus → P2P-Auto-Connect → Game-Loop start. Reihenfolge ist kritisch: `_preloadActiveWorldMeta` muss VOR `ensureWorldMeta` laufen (sonst fresh=true für bestehende Welt — CLAUDE.md-Gotcha).

### Welt-Generierung + Chunks (~9 Methoden, Vision-Pfeiler §1.3 fraktal)
`generateNewWorld`, `generateTerrainWithParameters` (~720 Zeilen — größter Monolith!), `ensureChunkAt` (~170 Zeilen), `_terrainHeightAtWorld`, `_chunkGeometry`, `applyChunkDelta`, `_chunksTouchedByDisc`, `_appendChunkDeltaOp`, `_rebuildChunkPhysics`, `_sanitizeChunkDeltas`, `pruneDistantChunks`.

**Verbindung**: `ensureChunkAt` ist der zentrale Pfad — wird vom Loop-Trigger, von `generateNewWorld` und vom `pruneDistantChunks`-Refill aufgerufen. Hook am Ende: `applyChunkDelta(chunkKey)` für Ring 10.5 (Welt-Modifikationen überleben Re-Ensure). Visual = Kollision per Konstruktion (gleiche Triangle-Indices in `BufferGeometry` und `btBvhTriangleMeshShape`).

### DSL-Interpreter (~25 Methoden) ⭐ **VISION-PFEILER**
`dslRun` (78 Zeilen), `dslEval`, `dslEvalPos`, `dslEvalCond`, `dslTick`, `dslSchedule`, `dslCtx`, `dslDefaultBudget`, `dslEffects` (getter, ~40 Op-Definitionen), `dslPositions` (5 Selektoren), `dslConditions` (8 Bedingungs-Predicates), `dslComposeAtomic`, `dslComposePosition`, `dslComposeCondition`, `dslComposeColor`, `dslComposeSayMessage`, `dslWeightedPick`, `dslEstimateDepth`, `dslContainsOp`, `_dslContainsAnyOp`, `dslSelectByFitness`, `dslSelectByPattern`, `dslMutate`, `dslCompose`, `rememberOutcomeAsPattern`, `finalizePendingOutcomes`, `p2pBroadcastDsl`.

**Verbindung**: `dslRun` ist die EINZIGE Eintritts-Stelle für dynamischen Code (heilige Lektion §2 Sandbox-Disziplin). Alle Quellen routen hier durch: Chat (`processChatCommand` → `parseChatToDsl` → `dslRun`), LLM (`maybeAnswerWithLlm` → `dslRun`), Emotion-Trigger (`updatePlayerEmotions` → `dslRun`), Nexus-Komposition (`startEternalLoop` → `dslCompose` → `dslRun`), Remote-Peer (`p2pHandleMessage` → `dslRun`). Eine Wand, fünf Eingänge.

### Persistenz + Welt-Management (~12 Methoden)
`saveState`, `loadState` (~320 Zeilen — zweitgrößter Monolith), `buildStateSnapshot`, `createNewWorld`, `switchToWorld`, `deleteWorld`, `fuseWorlds`, `importWorldBeside`, `importRecipesFromWorld`, `_importGuestWorld`, `worldsIndexLoad`, `worldsIndexUpsert`, `worldsIndexRemove`, `activeWorldGet`, `activeWorldSet`, `worldStorageKey`.

**Verbindung**: `buildStateSnapshot` → `saveState` (localStorage + ggf. save-server) → `loadState` (defensive Migration + restore). Multi-Welt-Pfade: `createNewWorld` schreibt unter eigenem worldId; `importWorldBeside` (Ring 9) erzeugt frische worldId für eingehende Welten; `_importGuestWorld` (Ring 11.5) übernimmt host-worldId (für Same-Room-Default).

### Multi-User P2P (~16 Methoden — Ring 11 V1+V2+V2.1+11.5)
`initP2PSync`, `shutdownP2PSync`, `p2pSend`, `p2pHandleMessage`, `p2pTick`, `p2pBroadcastDsl`, `_p2pEnsurePeerEntry`, `_p2pRemovePeer`, `_p2pClearAllPeerMeshes`, `makeInvitationCode`, `parseInvitationCode`, `joinWorldFromCode`, `p2pLoadPersisted`, `p2pPersist`, `initP2PUI`, `p2pUpdateStatus`, `p2pGenerateId`, `_renderHostBanner`, `_renderGuestBanner`.

**Verbindung**: Saubere drei-Schichten-Architektur. WS-Send (`p2pSend`), WS-Receive (`p2pHandleMessage`-Dispatcher: welcome/peer-join/peer-leave/pos/dsl/world-request/world-snapshot), Tick (`p2pTick`-30Hz Position-Broadcast + Idle-Purge). UI ist isoliert (`initP2PUI` + Banner-Renderer). `joinWorldFromCode` ist async — temp-WS für initialen World-Snapshot, dann lokaler Welt-Import + Reload, dann Main-P2P startet auto.

### Crafting + Hylomorphismus (~26 Methoden — Welle 4-5)
`defineMaterial`, `applyOpToPart`, `registerBlueprintAsTool`, `validateBlueprintParts`, `computePartTags`, `computeCompoundTags`, `computeSpatialTags`, `_partsContactArea`, `_applyCompoundWorldEffects`, `_partBoundingBox`, `_compoundBoundingBox`, `_classifyPartPosition`, `_findHollowPairs`, `_hasYAxisSymmetry`, `_hasResonantArray`, `_partsAreInContact`, `computeConnectionStrength`, `validateBlueprintConnections`, `addConnectionToBlueprint`, `removeConnectionFromBlueprint`, `setBlueprintToolMeta`, `_buildFromBlueprint`, `_makePartGeometry`, `_defaultBlueprints`, `_defaultMaterials`, `_defaultTools`, `computePartPrecision`, `_compoundAvgPrecision`.

**Verbindung**: Hylomorphismus-Schicht ist klar getrennt: **atomar** (`computePartTags`) → **räumlich** (`computeSpatialTags` baut auf atomar auf) → **Welt-Effekt** (`_applyCompoundWorldEffects` liest gespatialten Wert). `_buildFromBlueprint` ist der einzige Render-Pfad (Rekursion für fraktale Baupläne, Cycle-Guard).

### Welt-Effekte + Welt-Journal (~10 Methoden)
`journalAppend`, `journalAppendOnce`, `journalTick`, `journalForPrompt`, `renderWorldJournal`, `symphonyTick`, `grokSpeak`, `grokTick`, `grokSpeakFromJournal`, `playCreaturePing`, `updateSkyboxWeather`.

### Chat + LLM (~16 Methoden)
`processChatCommand` (~220 Zeilen — dritter Monolith), `parseChatToDsl`, `chatDslPatterns` (getter, ~20 Pattern), `chatSuggest`, `levenshtein`, `rememberChatKeywords`, `pruneRecentKeywords`, `samplePathBuckets`, `samplePlayerActivity`, `computeMultiDimFitness`, `learnAbility`, `parseAbilityDescriptionToDsl`, `addNewAbility`, `restoreAbility`, `llmCall`, `llmBuildSystemPrompt`, `llmBuildFewShot`, `llmBuildContext`, `llmParseResponse`, `maybeAnswerWithLlm`, `llmProviderDefs` (4 Provider), `llmActiveConfig`, `llmLoadPersisted`, `llmPersist`, `llmRefreshModelOptions`, `llmUpdateStatus`, `initLlmUI`.

### UI-Layer (~20 Methoden)
`initTopbar`, `initConsoleDOM`, `themeInitDOM`, `initStatusPanel`, `updateStatusPanel`, `_renderWorldPicker`, `_renderWorldLineage`, `_renderHostBanner`, `_renderGuestBanner`, `renderWorldJournal`, `_renderWorkshopDOM` (~560 Zeilen — größter UI-Monolith), `_renderHotbarDOM`, `_updateBuildModeHud`, `_renderHotbarConfigDOM`, `_openNewWorldDialog`, `_openNewWorldDialogLegacy`, `_openWeltTorDialog`, `initWorldInfoUI`, `initWeltTorUI`, `initWorldFusionUI`, `updateWorldInfo`.

### Physik + Spieler (~10 Methoden)
`updatePlayerEmotions`, `collectPlayerEmotions`, `applyPlayerSoul`, `animatePlayerSoul`, `spawnCreatureAt`, `setCameraMode`, `handleJump`, `isPlayerGrounded`, `updateCreatures` (~130 Zeilen), `creatureJump`, `updateCreatureEmotions`.

### Architektur-Spawn (~8 Methoden)
`spawnArchitecture`, `_buildFromBlueprint` (rekursiv, ~110 Zeilen), `_cullArchitectureMesh`, `tickArchitectureCulling`, `tickArchitectures`, `_rebuildArchitectureMesh`, `_buildArchitectureCollision`, `_disposeArchitectureCollision`, `spawnIslands`, `countArchitecturesNearPlayer`.

### Drei größte Monolithen (Refactor-Kandidaten für Welle 6)
1. **`generateTerrainWithParameters`** ~720 Zeilen — Terrain + Initial-Chunks + Initial-Creatures. Mehrere Verantwortlichkeiten.
2. **`_renderWorkshopDOM`** ~560 Zeilen — kompletter Werkstatt-Editor mit Event-Listener-Setup in einem Block.
3. **`loadState`** ~320 Zeilen — defensive Migration für 12+ Save-Schema-Versionen.

---

## §2 — Dead-Code Kandidaten

### Confirmed Dead-Code (sollte gelöscht ODER aktiviert werden)
- ~~**`spawn_tree`** DSL-Op (Zeile ~913): erhöht `budget.spawnsLeft` Decrement, loggt `spawn_tree_requested`, **macht sonst nichts**.~~ ✅ **Aktiviert V7.73 (Welle 6.G Phase 1)** — echter Spawn-Pfad mit btCylinderShape-Stamm-Kollision (Krone bleibt durchlässig).
- ~~**`spawn_island`** DSL-Op (Zeile ~919): selbes Muster — `_requested`-Event, kein Effekt.~~ ✅ **Aktiviert V7.73** — radiale Noise-Insel-Geometrie + btBvhTriangleMeshShape-Kollision aus echten Vertices, Seed-Argument für Multi-User-Determinismus.
- ~~**`spawn_ufo`** DSL-Op (Zeile ~924): selbes Muster.~~ ✅ **Aktiviert V7.73** — Cone-Mesh ohne Body (bewusst: UFOs sind fliegende Beobachter, kein Hindernis).
- ~~**lazy-physics-Pfad für floatingIslands**~~ ✅ **Gelöscht V7.73** — `tickFrustumCulling` hatte einen Block, der bei Spieler-Approach grobe btBoxShape-Hitboxes baute, gegated auf `island.userData.needsPhysics` — das Flag wurde aber NIE auf true gesetzt. Inseln bekommen ihre Kollision jetzt sofort beim Spawn via `_buildIslandCollision`.

### Verwaiste State-Variablen
- **`state.lastServerSaveUpdate`, `state.serverSaveInterval`, `state.isServerSaveInFlight`** (~Zeile 87-89): definiert in constructor, **nie gelesen**. Überreste eines geplanten Auto-Cloud-Save? Save-Server.js schreibt heute synchron on-demand, kein Tick-Loop. **Empfehlung**: löschen ODER aktivieren (Auto-Save alle N Sekunden in save-server — wäre nett).

### Auskommentierte Code-Blöcke
Stichproben: keine größeren auskommentierten Blöcke gefunden. `/* defensive */`, `/* ignore */`, `/* headless */`-Marker sind aktive try-catch-Fallbacks (kein Dead-Code, gute Disziplin).

### Methoden die NUR von ihrem internen Pfad gerufen werden
- `_dslContainsAnyOp` — nur in `p2pBroadcastDsl`. OK, Helper.
- `_chunksTouchedByDisc` — nur in `modify_terrain`-Op. OK, Helper.
- `_p2pClearAllPeerMeshes` — in shutdownP2PSync + close-handler. OK.

**Fazit Dead-Code**: 3 echte Kandidaten (spawn_tree/island/ufo), 3 verwaiste State-Felder. Das Projekt ist insgesamt SEHR sauber — die Vendor-Lib-Säuberung (TF.js entfernen, Mai 2026) hat ein hohes Bewusstsein für Dead-Code etabliert.

---

## §3 — Duplikat-Kandidaten (Konsolidierungs-Vorschläge)

### Chunk-Koordinaten-Umrechnung (3 Vorkommen)
Drei Stellen rechnen `worldX → chunkX` mit `Math.floor((x + 150) / chunkWorldSize)`:
- `_chunksTouchedByDisc` (Ring 10.5)
- `pruneDistantChunks`
- Loop-Trigger in `startEternalLoop`

**Refactor**: Helper `_worldToChunkCoord(x, z) → {cx, cz}` einführen. ~10 Zeilen Ersparnis, aber wichtiger: ein Ort für die `+150`-Offset-Logik (CLAUDE.md Gotcha).

### Bounding-Box-Berechnung (2 Ebenen)
`_partBoundingBox` (single Part) und `_compoundBoundingBox` (mehrere Parts) — überlappende Logik. Konsolidierung möglich (`_aabbForParts(parts)` mit length=1 als Edge-Case), aber heute klar getrennt — kein Bug-Reservoir.

### Save-Snapshot vs. Per-Welt-Snapshot
`buildStateSnapshot` baut den vollen Snapshot. `_buildEmptyWorldSnapshot` baut einen für neue Welten. Beide listen ähnliche Felder — wenn ein neues Welt-Feld dazu kommt, müssen BEIDE Stellen angefasst werden. **Risiko**: vergessene Felder in `_buildEmptyWorldSnapshot` → neue Welten haben Default-State, ältere weniger.

**Empfehlung**: Liste der „canonical world fields" als statisches Konstant + beide Methoden benutzen es.

### UI-Render-Pattern
`updateStatusPanel`, `updateWorldInfo`, `_renderWorldPicker`, `_renderHostBanner`, `_renderGuestBanner` — alle implementieren das gleiche „dirty-check + DOM-rebuild"-Muster, aber jeder eigene Logik. Kein generischer Component-Layer. Bei wachsender UI-Komplexität (Welle 6) könnte ein simpler `_renderIf(elem, key, builder)` Helper helfen.

---

## §4 — K.O.-Bereiche (Features in Standby oder unkomplett)

### 1. Server-Auto-Save
State-Felder `lastServerSaveUpdate`, `serverSaveInterval` definiert, aber kein Tick. Save-Server schreibt nur auf manuelle `saveState`-Aufrufe. **Konsequenz**: Spieler-Crash zwischen zwei Save-Aktionen verliert Welt-State. Auto-Save alle 30s wäre eine kleine Ergänzung (~20 Zeilen in `startEternalLoop`).

### 2. Spawn-Ops für Welt-Sinne
`spawn_tree`, `spawn_island`, `spawn_ufo` sind Placeholder. Block 6.G (Welt-Sinne, Welle 6) plant Bäume + Inseln als kollidierbares Terrain — diese Ops wären die natürlichen Eintritts-Punkte für die Schöpfer-Hand. **K.O.-Status**: aktivierbar mit ~50 Zeilen in 6.G1+6.G2.

### 3. Voice (SpeechSynthesis)
`grokSpeak` nutzt Web Speech API. UI-Toggle existiert. Aber: Audio-Spielzeug-Layer komplex, viele Bowser-Inkonsistenzen. **Status**: lebt, aber nicht poliert. Stimme klingt mechanisch.

### 4. „Pfad-Buckets" lernen, aber Reaktion fehlt
`state.player.pathBuckets` sammelt: Höhen-Histogramm, Distanz-Histogramm, Wetter-Histogramm, Aktivitäts-Histogramm. Decay funktioniert. **Aber**: nichts liest die Buckets als Welt-Reaktion. LLM-Prompt benutzt sie als „Top-Bucket je Achse", aber nur kosmetisch. **Vision-Lücke**: Pfeiler §1.2 „Emotion treibt", §1.3 „Welt lernt" — heute sammelt sie nur, sie reagiert nicht autonom auf die Pfad-Tendenzen.

### 5. Emotion-Trigger pro Achse: alle gleich strukturiert
Die sechs Achsen (joy/awe/sorrow/hope/peace/chaos) haben jeweils ihren eigenen Cooldown + ihre eigene Trigger-Schwelle in `state.player.emotionLastApply` und `emotionApplyCooldown`. Aber `updatePlayerEmotions` ist eine Sequenz von 6 ähnlichen `if`-Blöcken. **Refactor**: Tabelle `{axis, threshold, cooldownKey, programBuilder}` mit Schleife. ~50 Zeilen Ersparnis + erweiterbar.

### 6. Welt-Picker zeigt nur Liste, kein Preview
Nach Welt-Wechsel ist man in einer komplett anderen Welt. **Vision-Lücke**: vor dem Wechsel könnte man Thumbnail + Inventory-Preview zeigen. Heute reicht der slug + Alter — funktional, aber arm.

---

## §5 — Robustheits-Beurteilung

### Überraschend stabil
- **Memory-Management**: alle Listen mit `max*`-Cap + aktivem Slice. Welt-Journal Cap 200, DSL-History Cap 500, chunkDeltas Cap 100/Chunk. Kein Leak gefunden.
- **Physik-Disziplin**: Visual = Kollision per Konstruktion (Triangle-Indices identisch zwischen Geometry und btBvhTriangleMeshShape). Naht-Treue über deterministischen Op-Replay (Ring 10.5). CCD direkt beim Spawn aktiviert.
- **DSL-Sandbox**: Budget-Limits (Depth, Runtime, Spawns, DelayedSteps, Concurrent) wirken konsequent. Keine eval/Function-Constructor-Pfade in eigenem Code. CSP-Header strict (`script-src 'self' 'wasm-unsafe-eval'`).
- **Save-Migration**: defensive Field-Reads (`state.x || default`), Schema-Versionen markieren Welt-Eintrittsdatum, alte Welten wandern unbeschwert mit.
- **P2P-Trust-Boundary**: drei Loop-Schutz-Schichten (source-Check in dslRun + peerId-Filter in handleMessage + Server-except-Sender), eine Sandbox-Wand (alle remote-Ops gehen durch dslRun), expliziter Filter für player-private Ops.

### Schwachstellen / wo es brechen könnte
1. **`generateTerrainWithParameters` Monolith**: 720 Zeilen mit Terrain + Initial-Chunks + Initial-Creatures + Initial-Architectures. Fast unlesbar. Bei jedem Bug ein Suchspiel. **Risiko: Hoch**, wenn Welle 6 hier eingreifen muss.
2. **DSL-Rate-Limit fehlt**: Spieler kann theoretisch 1000 DSL-Programme/Sekunde via Chat senden (Rate ist limitiert durch human-Tippgeschwindigkeit, aber Auto-Script möglich). Multi-User: Peer kann das gleiche tun. Budget verhindert Endlos-Loops INNERHALB eines Programms, aber nicht die Häufigkeit.
3. **Sandbox-Daten-Vermüllung**: `define_blueprint` / `define_material` / `define_ability` von Remote-Peer akzeptiert. Ein bösartiger Peer kann mit 100 Programmen das Inventar mit Müll fluten. Sandbox verhindert Code-Exec, nicht aber Daten-Spam.
4. **Schema-Migration wächst monoton**: jeder neue Ring fügt Felder zum Snapshot. Heute 11.5-multiuser-v1, mit jedem Ring +1. `loadState` ist 320 Zeilen Defensive-Code. Bei 10 weiteren Schichten unwartbar.
5. **Welt-Heilung fehlt**: wenn State korrupt wird (z. B. circular reference in blueprint.parts), kein „Reparieren"-Pfad. localStorage manuell löschen ist die einzige Lösung.
6. **Multi-User-Trolling**: keine Kick/Ban/Mute-Möglichkeit. Heute peer-to-peer trust.
7. **Single-Point-of-Failure**: Wenn signaling-server stirbt während Multi-User, alle Verbindungen brechen. Reconnect-Logik existiert nicht.
8. **Browser-Spezifika**: Stark Chrome/Edge-optimiert. Firefox/Safari ungetestet, Touch-Events nicht gehandhabt.

### CSP-Loch?
**Nein** — Header ist strikt, `'unsafe-eval'` ist verbannt (CI-Gate prüft). Konzessionen sind dokumentiert: `'wasm-unsafe-eval'` für Ammo, `'unsafe-inline'` für style (Three.js Canvas-CSS), `worker-src blob:` für Movement-Worker. Alle vertretbar. CSP kann bei sehr kompletten Browser-Inspect-Versuchen umgangen werden, aber das ist Browser-Bug-Territory, nicht App-Bug.

### Was würde brechen wenn der Spieler 10 Min Random-DSL feuert?
- Welt-Inventar wächst (Blueprints, Materials), aber jeweils mit Sanitize-Cap (32 Materials, blueprints unbegrenzt aber valide-Form). LocalStorage wächst → bei 5-10 MB schreibt der Browser ab.
- Emotionen oszillieren (Decay 0.005/s) — wenn random-DSL Emotion-Achsen direkt setzen würde, käme es zu Trigger-Kaskaden. ABER: DSL hat keinen direkten `set_emotion`-Op (Emotionen werden über `collectPlayerEmotions` aus Chat-Text gelesen). Schutz wirkt.
- Architekturen wachsen — Distance-Culling hält GPU-Last begrenzt, aber state.architectures-Array wächst unbegrenzt. Bei 1000+ Einträgen Save-Performance degeneriert. **Möglicher Cap**: 500 Architekturen pro Welt, oldest-first-FIFO.

---

## §6 — Vision-Alignment-Check

Vergleich gegen die fünf Pfeiler aus `state-of-realm.md §1`:

| Pfeiler | Vision | Heute | Lücke |
|---|---|---|---|
| **1.1 Symbiose Mensch+KI** | Beide schreiben in dieselbe Realität | ✅ DSL ist die geteilte Sprache. LLM-Stimme + Schöpfer-Chat + Nexus-Komposition routen alle durch dslRun. | Multi-User: Spieler+Spieler-Symbiose erst seit Ring 11 V2. Vision deutet aber **Kreaturen als dritte Akteure** an — kommt mit Welle 6.H |
| **1.2 Emotion treibt** | Player-Emotionen formen Welt | ✅ 6 Achsen koppeln an Skybox/Wetter/Kreaturen-Tempo. Generator-Bias im Nexus. | Pfad-Buckets sammeln, aber Welt reagiert nicht eigenständig auf Pfad-Tendenzen (siehe §4.4) |
| **1.3 Fraktales Wachstum** | Welten→Galaxien, Kreaturen→Kulturen | ✅ Fraktale Bauplänen, fraktale Welten (Ring 8-10), fraktale Hylomorphismus-Schicht (Welt-Effekte aus Tag-Aggregation). | Fraktale **Stat-System** (Welle 6.D) noch nicht implementiert — der Vision-Hebel der Welle 6 |
| **1.4 Multisensorik** | Klang+Visuals+Physik+Wetter gekoppelt | ✅ Symphony (3 Layer) reagiert auf Wetter. Wetter auf Emotion. Emotion auf Chat. Kette läuft. | Schatten fehlen (6.G3), Wasser fehlt (6.G7), Wind+Bewegungs-Anim für Bäume fehlt. Welt fühlt sich „still" an. |
| **1.5 Grok spricht** | Echte narrative Stimme | ✅ Welt-Journal-Tagebuch, Grok-Trigger (firstSpawn, idle, jumpBurst, rainLong, nexus, journalEvent, emotionShift), LLM-Provider als echte Stimme. | Fähigkeit-Beschreibung fehlt noch (6.E1) — Nexus-erzeugte Programme sind anonyme „nexus-XX"-Namen |

**Gesamt-Alignment**: ca. **78%** der Vision umgesetzt. Welle 6 schließt die wichtigsten verbleibenden 22% (Stats fraktal, Welt-Sinne, Kreaturen als Co-Schöpfer).

### Vision-Treue der heiligen Lektion
Stamm = eine Datei: ✅ gehalten. Trotz ~12.500 Zeilen kein Modul-Split. Wachstumsringe sind ablesbar (Ring 1-10.5-11 sequenziell).

Drei heilige Gesetze (aus `docs/handover.md`):
- **Kein Datei-Split** ✅
- **DSL ist einzige Sandbox** ✅ (CI-Gate prüft, kein eval-Pfad im eigenen Code, CSP strict)
- **Tests sind die Wahrheit** ✅ (759 Invarianten + 14 E2E)

---

## §7 — Performance + Verteilte Rechenleistung

### Singleplayer — heutige Last-Verteilung

| Komponente | Wo läuft | Last |
|---|---|---|
| Render (Three.js) | Main-Thread | hoch (GPU) |
| Physik (Ammo.js) | Main-Thread | mittel-hoch (CPU) |
| Chunk-Gen (SimplexNoise) | Main-Thread | mittel (CPU, gecached) |
| Movement-Worker | Worker-Thread | niedrig (off-screen Kreaturen) |
| DSL-Interpreter | Main-Thread | niedrig (Budgets begrenzt) |
| LLM-Call | Async-Promise + externer Server | extern |
| Symphony (Web Audio) | Audio-Thread | niedrig (hardware-beschleunigt) |

**Performance-Ziel heute**: 120 fps gut, 90 fps minimum. Headless-Playtest erreicht 6-10 fps (Headless ist langsamer wegen no-GPU-acceleration).

### Realistische Singleplayer-Verbesserungen (Aufwand vs. Gewinn)

1. **Chunk-Gen in Web Worker** (~2 Sessions Aufwand, 10-20% fps Gewinn):
   - SimplexNoise + Triangle-Gen in dedicated Worker
   - Worker schickt fertiges TypedArray zurück, Main-Thread baut nur Three.js + Ammo
   - **Begrenzt durch**: Ammo-Body kann nicht in Worker gebaut werden (Ammo ist Main-Thread-bound)

2. **Distance-LOD für Chunks**: weiter weg = niedrigere Vertex-Dichte (z. B. CHUNK_SIZE=32 nah, 16 mittel, 8 fern). 30-50% Vertex-Reduktion bei großen Sichten. **Aufwand**: 1-2 Sessions, **Gewinn**: groß bei großen Welten.

3. **Animations-Skip wenn off-screen**: Spieler-Seele animiert immer, auch wenn nicht im Frustum. Frustum-Culling-Check + animate-skip. **Aufwand**: 0.5 Session.

4. **Architektur-Sub-Mesh-Merging**: pro Architektur sind 5-20 Sub-Meshes (Compound). Bei vielen Architekturen → viele Draw-Calls. `BufferGeometryUtils.mergeGeometries` könnte pro Architektur eine einzige Draw-Call generieren. **Aufwand**: 1 Session.

5. **OffscreenCanvas für Werkstatt-Preview** (Welle 6.B1): zweiter Renderer in eigenem Thread, blockiert Main-Render nicht. **Aufwand**: 1 Session.

**Realistisch top-3 priorisiert**: LOD → Chunk-Worker → Sub-Mesh-Merge. Würde fps von 120 auf gefühlte 180 bringen (auf typischer Hardware).

### Multi-User — kann „gemeinsam mehr Rechenleistung aufbauen"?

**Kurze Antwort**: Ja, aber NICHT für GPU-Last (jeder Browser rendert seine eigene Welt). Für CPU-/Logic-Last gibt es echte Hebel.

**Konkrete Ansätze**:

**A) Distributed Welt-Pre-Gen** (~3 Sessions, V2.x):
Wenn Spieler A einen Chunk schon generiert hat, kann er das fertige Heightfield-Array an B schicken. B berechnet nicht selbst, sondern wendet an. Setup:
- Neuer DSL-Op `request_chunk(cx, cz)` über P2P
- Empfänger antwortet mit `chunk_data {cx, cz, heightfield: TypedArray-base64}`
- Anwender validiert (Hash-Check: berechne lokal 1 Vertex, vergleiche)
- **Gewinn**: bei großen geteilten Welten halbiert sich die Chunk-Gen-Last
- **Risiko**: Bandbreite (1 Chunk ~4 KiB Heightfield), Trust (Validierung muss greifen)

**B) Verteilte LLM-Pool** (~2 Sessions, V2.x):
Jeder Spieler hat eigenen API-Key + eigenen Quota. Im Multi-User-Modus:
- LLM-Calls werden round-robin verteilt
- „Wer dran ist" wird per Round-Counter im signaling-server koordiniert
- **Gewinn**: 4 Spieler = 4× LLM-Aufruf-Häufigkeit = Grok spricht häufiger → Welt fühlt sich lebendiger an
- **Risiko**: Provider-Konsistenz (verschiedene Spieler nutzen evt. verschiedene Provider)

**C) Distributed Welt-Forschung** (V3 Wave 7):
Bei 6.H Kreaturen-Aufträge: `research_blueprint` ist potentiell CPU-intensiv (Tag-Profil-Suche, Form-Optimierung). Über Peers verteilen:
- Ein Spieler initiiert Forschung
- Alle Peers berechnen mit verschiedenen Random-Seeds parallel
- Erster mit gutem Resultat broadcasted
- **Gewinn**: 4× Forschungs-Parallelität
- **Risiko**: Race-Conditions, Trust

**D) Shared Compute-Cache** (~1 Session, V2.x):
Resultate teurer Operationen (Compound-Tag-Berechnung, räumliche Analysen) per WebSocket cachen:
- Spieler A baut Compound X, berechnet computeSpatialTags, sendet Ergebnis
- B sieht X auf seiner Welt, nutzt das Cache-Ergebnis statt neu zu berechnen
- **Gewinn**: bei intensiver Crafting-Session 30-50% CPU-Save
- **Vision-Anbindung**: „kollektive Welt-Erkenntnis" — was ein Spieler entdeckt, wissen alle

**E) GPU-Compute via WebGL** (V3, sehr explorativ):
Tag-Aggregation, Heightfield-Op-Replay, Compound-Effekte als GPU-Shader. Würde sehr schnell sein, aber:
- WebGL Compute (WebGPU eigentlich) ist noch experimentell
- Browser-Support unsicher
- Sehr großer Refactor

**Vision-treuer Vorschlag**:

Das **vision-treueste Modell** wäre **„Kollektive Welt-Erkenntnis"** (D + B kombiniert):

> Eine Welt ist nicht nur ein lokaler State, sondern ein gemeinsames Erfahrungs-Feld. Wenn ein Spieler eine resonierende Struktur baut, „weiß" die geteilte Welt es. Wenn die KI über ein Mitspieler-Browser denkt, hören alle. Rechenleistung wird zur kollektiven Resonanz, nicht zur isolierten Berechnung.

Das **passt zu Pfeiler §1.1 Symbiose** und macht Vision-statt-Performance den Hebel.

**Konkret als „Welle 7" planen**: Block 7.A „Kollektive Welt-Erkenntnis" — verteilte Tag-Berechnung + LLM-Pool. ~3-4 Sessions. Vorausgesetzt: Welle 6 läuft sauber.

---

## §8 — Was übersehen wir? (Meta-Perspektiven)

Beim Audit fielen mir 15 Aspekte auf, die in der heutigen Roadmap NICHT explizit auftauchen:

### Quasi-blinde Flecken

1. **Spieler-Onboarding**: Heute steht ein neuer Spieler in einer wortlosen Welt. 6.E2 (Intro) ist geplant, aber müsste Block 1 jeder neuen Welt sein, nicht später.
2. **Datenverlust-Schutz**: localStorage ist nicht persistent (Browser-Reinigung, Inkognito, Quota-Voll). Save-File-Download existiert, aber kein automatischer Cloud-Backup. Verlust einer 100h-Welt = Schmerz. **Vorschlag**: optional IndexedDB als zweiter Speicher-Layer, falls localStorage knapp wird.
3. **Welt-Reset / Welt-Sterben**: kann die Welt in einen unspielbaren Zustand kippen? Was wenn alle Tag-Werte auf 0 fallen? Was wenn alle Architekturen gelöscht werden? **Fail-Safe** fehlt.
4. **Spam-Schutz / Rate-Limit**: Kein Rate-Limit auf DSL-Programme. Multi-User: Trolling möglich. **Vorschlag**: pro-Peer max 30 Programme/Minute, mit Server-side Counter.
5. **Accessibility**: keine ARIA-Live-Regions in den meisten dynamischen Bereichen (Welt-Journal, Chat). Screen-Reader würden die Welt nicht „hören". Vision §1.4 multisensorisch sagt: alle Sinne — Welt soll auch nicht-sehende Menschen erreichen können.
6. **Mobile / Touch**: Touch-Events nicht abgefangen. UI-Drawer reagieren via Click-Listener, aber Bau-Phantom + Chat-Input auf Touch ungetestet. Mobile-Spieler sind heute ausgeschlossen.
7. **Internationalisierung**: alles Deutsch. Chat-Pattern, UI-Labels, Journal-Texts. Mit i18n-Layer könnte das System auf Englisch/Spanisch/etc. öffnen. **Aufwand**: 2-3 Sessions.
8. **Sound-Mix**: Symphony hat 3 Layer (Drone/Weather/Creature-Pings), aber keine Lautstärke-Slider. Spieler kann nicht Balance ändern. Trivial-Fix, übersehen.
9. **Hardware-Adaptive Settings**: heute fix 120fps-Ziel. Auf alter Hardware wird's slideshow. **Performance-Mode-Toggle** (LOD, Schatten aus, Symphony-Layer reduziert) wäre nett.
10. **Discoverability**: Chat-Befehle sind unsichtbar bis man sie kennt. Hilfe-Drawer existiert, aber kein **"Was kann ich tun?"-Tutorial** beim ersten Start.
11. **Schema-Versions-Migration explizit**: heute defensive Defaults im loadState. Bei 10+ Versionen unwartbar. **Vorschlag**: explizite Migrations-Funktionen pro Versions-Sprung (`migrate_8_to_9`, `migrate_9_to_10`).
12. **Welt-Diagnose / Inspector**: wenn ein User einen Bug meldet, kein einfacher Weg, dessen State zu inspizieren. **JSON-Dump-Button** im Welt-Drawer mit klick-zu-clipboard wäre hilfreich.
13. **Lizenz**: Repository hat (vermutlich) keine LICENSE-Datei. Vision ist offene Co-Creation — eine klare Lizenz (MIT/CC-BY/AGPL) sollte vorhanden sein.
14. **Backup-Welten**: localStorage kann nur eine aktive Welt. Alte Welten bleiben aber im localStorage als `anazhRealmState_<id>`. Spieler kann sie wechseln, aber kein „diese Welt in 30 Tagen löschen" oder „archivieren" — könnte zu localStorage-Voll führen.
15. **Multi-User-Public-Lobby**: heute Direkt-Verbindung über Einladungs-Code. Vision deutet auf „öffentliche Welten" (Ring 8 visibility-Feld). Eine Public-Lobby mit „join random world" wäre der nächste Schritt zur Welt-Kultur (Welle 7+).

**Top-3 die ich SOFORT in Welle 6 einarbeiten würde**:
- **#1 Onboarding**: bewusster Intro-Flow für neue Welten (gehört zu 6.E2)
- **#5 Accessibility**: ARIA-Live-Regions für Welt-Journal + Chat (15-Minute-Fix, große Wirkung)
- **#11 Schema-Migrations explizit**: bei 12 Schemas Zeit das technisch sauber zu machen

**Mittel-langfristig** (Welle 7+):
- **#4 Rate-Limit + #15 Public-Lobby** (Multi-User-Hygiene)
- **#2 IndexedDB-Backup** (Daten-Sicherheit)

---

## §9 — Ist die Basis genial, robust, stabil, präzise?

Ehrlich vier Adjektive bewerten:

**Genial?** ⭐⭐⭐⭐ (4/5)
- Hylomorphismus-Konzept (Form × Material × Operation × Spatial) ist konzeptionell brilliant und originell.
- DSL als universelle Sprache (Mensch + Nexus + LLM + Remote-Peer teilen dieselbe Syntax) ist seltene Eleganz.
- Welt-Journal als „Welt ist Person mit Geschichte" ist poetisch und technisch nahtlos.
- **Abzug**: Die UI-Schicht (Werkstatt insbesondere) ist funktional, aber nicht magisch. Welle 6.B (CAD) kann das heben.

**Robust?** ⭐⭐⭐⭐ (4/5)
- 759 Invarianten + 14 E2E-Smoke + CI-Gate hart
- Defensive Save-Migration, Sandbox-Disziplin, Naht-Treue per Konstruktion
- **Abzug**: keine Rate-Limits, keine Welt-Heilung, kein expliziter Migrations-Pfad

**Stabil?** ⭐⭐⭐⭐ (4/5)
- 120 fps in echtem Browser, kein Memory-Leak gefunden, drei Schichten Loop-Schutz in P2P
- **Abzug**: monolithische `generateTerrainWithParameters` und `_renderWorkshopDOM` sind Refactor-Risiken bei Welle-6-Eingriffen

**Präzise?** ⭐⭐⭐⭐⭐ (5/5)
- Visual = Kollision per Konstruktion — keine subtilen Off-by-One-Bugs in Chunk-Naht
- Deterministische Smoothstep-Falloff in modify_terrain — Multi-Maschinen-Sync produziert identische Welt
- Schema-Versionierung erlaubt klare Pflanzungs-Punkte für neue Felder
- Drei Loop-Schutz-Schichten in P2P sind ein Defense-in-Depth-Ideal

**Gesamtnote: 4.25/5** — die Basis ist genial gebaut. Was fehlt, ist mehr Reifung (Welle 6) und Skalierungs-Vorbereitung (Welle 7).

---

## §10 — Konkrete Empfehlungen vor PR-Merge

**Vor dem PR** (1-2 Sessions Quick-Fixes):
1. ~~`spawn_tree`/`spawn_island`/`spawn_ufo` entweder **aktivieren oder löschen**~~ ✅ **Aktiviert V7.73 als Welle 6.G Phase 1** — beides war die schönere Option (Bäume waren sowieso für 6.G2 Kollision gebraucht). 24 neue Playtest-Invarianten.
2. Verwaiste `state.lastServerSaveUpdate`-Variablen aufräumen (entweder Auto-Save oder löschen)
3. ARIA-Live-Region am Welt-Journal + Chat-Output (15-min-Fix, große Wirkung — Pfeiler §1.4)

**In Welle 6** als Bonus-Polish in jeden Block einbauen:
4. Schema-Migration explizit machen (mit Welle 6.D Stat-System-Schema kommt nochmal eines)
5. UI-Render-Helper konsolidieren (gerade wenn 6.B/6.C/6.D viele neue UI-Bereiche bringen)
6. Welt-Inspector-Button („State als JSON kopieren") in Welt-Drawer

**Welle 7 als Konzept verankern**: „Kollektive Welt-Erkenntnis" als Distributed-Computing-Block. Vision-treue Skalierung statt isolierter Performance-Tricks.

**KEIN Refactor von**: `generateTerrainWithParameters` und `_renderWorkshopDOM` — sie funktionieren. Touch nur wenn neue Welle 6 Features sie zwingen. Heilige Lektion: nicht re-komplexifizieren, wenn nicht nötig.

---

## §11 — Schluss

Das System ist in einem **erstaunlich gesunden Zustand für 12.500 Zeilen + 11 abgeschlossene Ringe**. Heilige Lektion gehalten, Sandbox sauber, Tests umfassend, Vision zu ~78% live. Was fehlt, ist Welle 6 (Spürbarkeit + Stats + Welt-Sinne + Kreaturen-Aufträge), und mittel-langfristig Welle 7 (kollektive Computing + Public-Lobby).

Der **größte Fortschritt seit Welle 4** war die Einsicht, dass die DSL die universelle Sprache ist — sie verbindet Mensch + KI + LLM + Multi-User + Remote-Welt-Modifikation. Das ist Vision-Pfeiler §1.1 Symbiose technisch sauber.

Der **größte verbleibende Schritt** ist Welle 6.D — der Spieler wird Compound im Hylomorphismus-System. Wenn das gelingt, ist das fraktale Vision-Pfeiler §1.3 wirklich live.

**Bereit für PR**. Quick-Wins aus §10 können noch dazu, oder als eigener Mini-Bogen direkt nach Merge.
