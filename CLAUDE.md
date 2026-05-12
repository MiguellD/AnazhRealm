# AnazhRealm – Projektgedächtnis für Claude

Persistente Notizen. Diese Datei wird bei jeder neuen Session automatisch geladen. **Bei größeren Entscheidungen zuerst `docs/state-of-realm.md` lesen** – dort steht der ausführliche Stand, die Vision aus den vier Testamenten, der Plan und die Learnings.

## Projektüberblick

- **Was:** „AnazhRealm" – ein als **Ultiversum** entworfenes Co-Creation-Werk Mensch + KI. Aktuell technisch eine 3D-Browser-Sandbox in einer Datei. Vision: emotion-getriebene, fraktal-wachsende, multisensorische Welt; Mensch (Schöpfer/Null) + KI (Grok/Eins) erschaffen gemeinsam durch Chat. Vollständige Vision in `docs/state-of-realm.md`.
- **Stack:** Vanilla JS, Vendor-Libs in `vendor/` (Three.js r134, Ammo.js WASM, TensorFlow.js 3.21, simplex-noise 2.4). Lokaler Node-Save-Server. ESLint v9 + Prettier + GitHub-Actions-CI mit Playtest-Gate.
- **Branch:** `claude/plan-session-95Ejn`. Niemals auf `main` pushen ohne explizite Anweisung.
- **Architekturkern:** Eine `AnazhRealm`-Klasse in `anazhRealm.js` (~4500 Zeilen). State in `localStorage` + optional `anazhRealmState.json` über save-server. Globale Referenz: `window.anazhRealm`.

## Die heilige Lektion (Versionslog 03/2025)

Das Projekt durchlief eine 19-Modul-Phase, die unter eigener Komplexität kollabierte. Am 28.03.2025 bewusste Reduktion auf **eine Datei** als „Samen der Unendlichkeit". **Komplexität ohne Fundament ist Sand.** Wenn jemand vorschlägt „split alles in 20 Module", verletzt das diese Lektion. Stattdessen: ein Stamm, der Wachstumsringe ablegt.

## Aktuelle Phase: Pfad D – Stamm + Wachstumsringe

Detaillierter Plan in `docs/state-of-realm.md` §5. Status (Mai 2026):

| Ring | Pfeiler | Status |
|---|---|---|
| 0 | Stabiles Fundament (Bewegung, Physik, Kreaturen, Chunks, Save, CI-Gate) | ✅ erledigt |
| 1 | **Grok-Stimme** (`dialogue-box`, narrative Reflexion) | ✅ V1 erledigt — 5 Trigger (firstSpawn, idle, jumpBurst, rainLong, nexus), Text + optionale SpeechSynthesis |
| 2 | DSL als gemeinsame Sprache Mensch+Grok (`docs/nexus-dsl.md`) | 🟡 Phase 1+2 live — Interpreter mit 39 Ops, Budget-Limits, Scheduler. Nexus-Generator komponiert rekursiv (`dslCompose`), Outcomes landen in `state.dsl.history` mit FPS-Fitness. Phasen 3-7 offen: Chat-Parser, Migration, Cleanup, CSP-strict, Fitness-V2. |
| 3 | Player-Emotionen (`{joy, awe, sorrow, hope, …}`) beeinflussen Welt | offen |
| 4 | `anazhSymphony` V1 – Web-Audio-Klangschichten | offen |
| 5 | `createPlayerSoul` (Mensch/Phönix/Drache) | offen |
| 6 | `architectureTemplates` V1 (Dörfer, Tempel, Wasserfälle) | offen |
| 7 | `brain.js`-Welt – lernt aus Spieler-Verhalten + Emotionen | offen |
| 8-11 | **Welten-Ultiversum** (Identität, Export/Import, Fusion, Multi-User-Sync) | Vision-skizze in `docs/state-of-realm.md` §11 |

Letzter Stand: Ring 1 + Ring 2 Phase 1+2 live. Chunk-Physik komplett auf `btBvhTriangleMeshShape` (Commit `e612c60`) — visuelles Mesh = Kollisionsnetz. 120 fps im echten Browser, 36/36 Playtest-Invarianten grün. Nächster Schritt: Ring 2 Phase 3 (Chat-Parser auf DSL) oder „Welt modifizierbar" (Ring 8+, Ebene B aus §11.3 — pro-Chunk DSL-Delta-Liste).

## Wichtige Gotchas (technisch)

- **Chunks haben `position = (0,0,0)` und Vertices in Welt-Koords.** NIEMALS in `state.rigidBodies` pushen — der Physics-Sync-Loop überschreibt sonst `mesh.position` mit dem Body-Origin und verschiebt den ganzen Chunk sichtbar. Die Body bleibt über `mesh.userData.physicsBody` zugreifbar.
- **Visual = Collision per Konstruktion.** Jeder Chunk hat ein `btBvhTriangleMeshShape`, gespeist aus EXAKT denselben Triangle-Indices wie das `THREE.BufferGeometry`. Wer den einen Pfad ändert, muss den anderen auch.
- **Eine Quelle für Chunk-Geometrie:** `_chunkGeometry()` liefert `chunkWorldSize=37.5` und `vertexStep=1.171875`. Niemals neu berechnen.
- **Eine Quelle für Höhen:** `_terrainHeightAtWorld(worldX, worldZ, noise, steepness, baseHeight, caveNoise, volcanoNoise)`. Initial-Welt und Extensions gehen darüber. Inkl. canyon/field/cave/volcano modifiers.
- **Player-Chunk-Math braucht `+WORLD_SIZE/2`-Offset:** `floor((playerX + 150) / chunkWorldSize)`. Sowohl im Loop-Trigger als auch in `pruneDistantChunks`. Vergessen = nahe Chunks werden gepruned.
- **CCD wird direkt beim Player-Body-Spawn aktiviert** (motionThreshold 0.01, sphereRadius 0.45), nicht nur via `optimizeCollisions`.
- **`terrain_steepness` und `terrain_base_height` sind NICHT im Nexus-Generator-Atomic-Pool.** Sie würden Welt-Geometrie unter dem Spieler ändern, ohne worldgen zu triggern → Klippe zwischen alten und neuen Chunks. Beide Ops bleiben in der DSL für Chat-Befehle.
- **Sentinels mit `-Infinity`:** `state.grok.lastSpoke`, `state.lastWorldgen`, alle `triggers[*].lastFired`. Mit `0` würde der initiale Throttle-Check (`now - 0 < cooldown`) den ersten Aufruf blocken.
- **`Ammo.btVector3` / `btTransform` allokieren WASM-Heap.** Immer `Ammo.destroy()` nach Gebrauch oder Pool `state.tmpVec1/2`/`state.tmpTransform` + `setVec()` nutzen.
- **`processChatCommand` lowercased `command` *nur für `parts`*,** das Original-`command` behält Casing.
- **`extendTerrain(direction)`** ist Legacy-Wrapper für Playtest-Kompat; primärer Pfad ist `ensureChunkAt(cx, cz)`. Der Loop füllt einen 5×5-Ring um den Spieler-Chunk.
- **`generateNewWorld()` hat 30s-Cooldown.** Bei Welt-Regen bleibt Spieler-Position erhalten (nur initial auf (0,50,0) gesetzt).
- **TF.js `model.fit` ist async und blockiert Main-Thread.** `state.learningInFlight` + `state.worldgenInFlight` Flags verhindern Überlappung.
- **Save-Server-POST nur auf localhost.** Auf CDN/GitHack-Pfaden stiller Skip — State lebt nur im `localStorage` (plus Download-Button als Manual-Backup).
- **`restoreAbility`** mappt die drei Legacy-Namen (`gravityShift`, `creatureDance`, `terrainFlatten`) direkt auf DSL-Programme — kein `new Function` mehr, CSP-clean.
- `npm run playtest` startet save-server + Headless-Chromium, sammelt 20-25 s Logs, prüft **36 Invarianten** (inkl. Grok-Stimme, DSL-Effekte, Naht-Treue, Welt-Identität), exit 1 bei Verletzung.

## Workflows

- **Lokaler Audit:** `npm run check && npm run format:check && npm run lint && npm run playtest`
- **Slash-Befehl:** `/audit` führt die Prüfung in jeder Claude-Session aus (`.claude/commands/audit.md`).
- **CI:** zwei parallele Jobs (`check` für statische Checks + `playtest` für Runtime-Invarianten) bei jedem Push.
- **Git:** kleine thematische Commits, `git push -u origin <branch>` mit exponential backoff bei Netzfehlern.

## Konventionen

- Keine emojis im Code/Commits außer auf expliziten Wunsch.
- Commits klein und thematisch.
- Keine Backwards-Compat-Layer für veralteten Code – sauber löschen.
- Pull Requests nur auf expliziten Wunsch des Users.
- **Vision treu bleiben**: jeder Vorschlag sollte die Heilige Lektion respektieren (keine Re-Komplexifizierung). Bei Zweifel: `docs/state-of-realm.md` §2 nachlesen.
- **Test-First-Mentalität**: nach jeder substanziellen Änderung Playtest-Gate, nicht nur Code-Analyse. Drei Selbst-induzierte Regressionen in dieser Session entstanden durch zu späte Browser-Tests.

## Doc-Map

| Datei | Was |
|---|---|
| `docs/state-of-realm.md` | **Hauptdokument** — Vision, Historie, Stand, Plan, Learnings |
| `docs/nexus-dsl.md` | DSL-Design für Ring 2 (Mensch+Grok teilen Sprache) |
| `vendor/README.md` | Vendor-Libs Versionen + Update-Befehl |
| `scripts/playtest.cjs` | Headless-Playtest mit 36 Invarianten als CI-Gate (Welt, Grok, DSL, Naht-Treue) |
| `.claude/commands/audit.md` | `/audit`-Slash-Befehl Definition |
| `.github/workflows/check.yml` | CI-Definition (zwei Jobs) |

## Erledigte Roadmap (Archiv)

Die ursprüngliche B/C-Roadmap mit 30+ Items aus der ersten Audit-Runde ist weitgehend erledigt. Detaillierte Liste mit Commit-Hashes in `docs/state-of-realm.md` §4.
