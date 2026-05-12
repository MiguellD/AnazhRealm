# AnazhRealm – Projektgedächtnis für Claude

Persistente Notizen. Diese Datei wird bei jeder neuen Session automatisch geladen. **Bei größeren Entscheidungen zuerst `docs/state-of-realm.md` lesen** – dort steht der ausführliche Stand, die Vision aus den vier Testamenten, der Plan und die Learnings.

## Projektüberblick

- **Was:** „AnazhRealm" – ein als **Ultiversum** entworfenes Co-Creation-Werk Mensch + KI. Aktuell technisch eine 3D-Browser-Sandbox in einer Datei. Vision: emotion-getriebene, fraktal-wachsende, multisensorische Welt; Mensch (Schöpfer/Null) + KI (Grok/Eins) erschaffen gemeinsam durch Chat. Vollständige Vision in `docs/state-of-realm.md`.
- **Stack:** Vanilla JS, Vendor-Libs in `vendor/` (Three.js r134, Ammo.js WASM, TensorFlow.js 3.21, simplex-noise 2.4). Lokaler Node-Save-Server. ESLint v9 + Prettier + GitHub-Actions-CI mit Playtest-Gate.
- **Branch:** `claude/new-adventure-fetch-branch-NF847`. Niemals auf `main` pushen ohne explizite Anweisung.
- **Architekturkern:** Eine `AnazhRealm`-Klasse in `anazhRealm.js` (~4500 Zeilen). State in `localStorage` + optional `anazhRealmState.json` über save-server. Globale Referenz: `window.anazhRealm`.

## Die heilige Lektion (Versionslog 03/2025)

Das Projekt durchlief eine 19-Modul-Phase, die unter eigener Komplexität kollabierte. Am 28.03.2025 bewusste Reduktion auf **eine Datei** als „Samen der Unendlichkeit". **Komplexität ohne Fundament ist Sand.** Wenn jemand vorschlägt „split alles in 20 Module", verletzt das diese Lektion. Stattdessen: ein Stamm, der Wachstumsringe ablegt.

## Aktuelle Phase: Pfad D – Stamm + Wachstumsringe

Detaillierter Plan in `docs/state-of-realm.md` §5. Status (Mai 2026):

| Ring | Pfeiler | Status |
|---|---|---|
| 0 | Stabiles Fundament (Bewegung, Physik, Kreaturen, Chunks, Save, CI-Gate) | ✅ erledigt |
| 1 | **Grok-Stimme** (`dialogue-box`, narrative Reflexion) | ✅ V1 erledigt — 5 Trigger (firstSpawn, idle, jumpBurst, rainLong, nexus), Text + optionale SpeechSynthesis |
| 2 | DSL als gemeinsame Sprache Mensch+Grok (`docs/nexus-dsl.md`) | ✅ **Phase 1-7 vollständig** — Interpreter mit 41 Ops, Budget-Limits, Scheduler. **Abilities sind ausschließlich DSL-Programme**, `new Function`/`eval` aus dem Bundle verbannt (CI-Gate hart), Save persistiert DSL-Abilities. 13/25 Chat-Befehle migriert. **CSP-Header strict in `index.html`** mit dokumentierten Vendor-Konzessionen. **Fitness-V2**: `dslSelectByFitness` (Roulette-Wheel über History) + `dslMutate` (Sub-AST/Numeric-Mutation) + `dslCompose` mit ~30 % History-Probability — der Nexus lernt nun aus eigenen Outcomes. |
| 3 | Player-Emotionen (`{joy, awe, sorrow, hope, peace, chaos}`) beeinflussen Welt | ✅ V1+V2 live — alle sechs Achsen koppeln an die Welt (joy→warme Skybox, awe→magisches Lila, sorrow→Regen, hope→sonnig+happy, peace→Kreaturen langsamer, chaos→Kreaturen schneller). Generator-Bias in `dslComposeAtomic`: joy/sorrow modulieren weather/creatures_emotion sanft (±0.3) — der Nexus „spürt" den Menschen. DSL-Condition `emotion_above` bleibt der Lese-Pfad. |
| 4 | `anazhSymphony` V1 – Web-Audio-Klangschichten | ✅ V1 live — drei Schichten: ambient drone (zwei verstimmte Sägezahn-Oszillatoren + LFO auf Tiefpass), wetter (gefiltertes Noise als Regen-Geräusch, sanftes Cross-Fade), creature pings (kurze Sinus-Töne bei DSL-Spawn, Frequenz folgt Emotion). Toggle-Button (`#anazh-symphony-toggle`) startet AudioContext auf User-Geste. |
| 5 | `createPlayerSoul` (Mensch/Phönix/Drache) | ✅ **V1 + V2** live — drei Seelen als Multi-Mesh-`THREE.Group` mit pro-Frame sin/cos-Animation. Mensch hat Torso/Kopf/Arme/Beine (Walk-Cycle), Phönix Körper/2 Flügel/Schweif (Flügel flattern immer), Drache Körper/Kopf/4 Beine/3-Segment-Schweif (Trab + Schweif-Welle). Drawer-Dropdown im Spieler-Panel (`#player-soul-select`) + Status-Bar-Item, Chat-Pattern `werde mensch/phönix/drache` → DSL-Op `player_soul`, Save persistiert `playerSoul`. Bewusst NICHT im `dslComposeAtomic`-Pool. **Third-Person-Kamera-Toggle** (`#camera-mode-toggle`) zeigt den Avatar von hinten, Pitch invertiert + Boden-Clamp gegen Clipping. |
| 6 | `architectureTemplates` V1 (Dörfer, Tempel, Wasserfälle) | offen |
| 7 | `brain.js`-Welt – lernt aus Spieler-Verhalten + Emotionen | offen |
| 8-11 | **Welten-Ultiversum** (Identität, Export/Import, Fusion, Multi-User-Sync) | Vision-skizze in `docs/state-of-realm.md` §11 |

Letzter Stand: Ring 1 + **Ring 2 (P1-7)** + **Ring 3 V1+V2** + **Ring 4 V1** + **Ring 5 V1+V2 mit Third-Person-Kamera** + **UI V1+V2** live. Chunk-Physik komplett auf `btBvhTriangleMeshShape` (Commit `e612c60`). 120 fps im echten Browser, **177/177 Playtest-Invarianten grün**. Architektur: eine Sprache (DSL), eine Sicherheits-Wand (CSP + CI-Gate), ein Selektions-Loop (Fitness-V2), ein bidirektionaler Emotions-Kanal, eine Klangschicht (Web Audio), drei animierte Spieler-Seelen mit Third-Person-Toggle, eine painterly-Bedien-Oberfläche (vendored Cinzel-Fonts, Tag/Nacht-Tokens, Topbar+6-Drawer, einklappbare Konsole, Brass-Scrollbars). **Nächster Schritt**: Ring 6 (`architectureTemplates` — Dörfer/Tempel als DSL-Primitives), Ring 7 (brain.js — würde CSP-`unsafe-eval` ablösen), oder UI V3 (Astrolabium-Live-Element + Custom-Slider-Rail/Knob als Vollendung des Mockup-Vertrags).

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
- **CSP-Konzessionen sind dokumentierte Vendor-Kompromisse**, kein freier Pfad zurück zu `eval`. Unser eigener Code nutzt es nie (CI-Gate erzwingt). `'unsafe-eval'` und `'unsafe-inline'` für styles lösen sich auf, wenn TF.js durch `brain.js` ersetzt wird (Ring 7) und Three.js' Canvas-Inline-Styles weggehen — bis dahin Doku ehrlich, Risiko klein, weil Single-User-Localhost-Spiel.
- **`addNewAbility(name, program, source)`** ist der einzige Pfad, eine Fähigkeit zu registrieren. Akzeptiert **nur DSL-Arrays**, nie JS-Funktionen. Schreibt in `state.dsl.abilities` (Quelle der Wahrheit) und legt einen Wrapper in `state.abilities[name] = () => dslRun(program)` ab (für Keyboard-Loop + „Führe Fähigkeit aus X"). `restoreAbility` mappt die drei Legacy-Save-Namen (`gravityShift`, `creatureDance`, `terrainFlatten`) auf ihre DSL-Äquivalente.
- **`learnAbility`** geht über `parseAbilityDescriptionToDsl` (regelbasiert, 5 Pattern + Catch-All als `say`). Keine Code-Generierung mehr; CSP-strict (Phase 6) wird damit möglich.
- **`state.player.emotions`** ist eine 6-Achsen-Map (joy/awe/sorrow/hope/peace/chaos), Werte 0..1. Jeder Chat-Input geht durch `collectPlayerEmotions` (regelbasiert, deutsche Stichwörter). `updatePlayerEmotions(currentTime)` läuft jeden Frame im Game-Loop: Decay 0.005/s, **alle sechs Achsen** (V2) feuern bei >0.7 jeweils ein eigenes DSL-Programm. Cooldown 30 s pro Achse. `dslComposeAtomic` liest Emotionen für sanften Bias (joy/sorrow ±0.3 auf weather + creatures_emotion). DSL-Condition `emotion_above(name, threshold)` macht Emotionen für den Nexus sichtbar.
- **`state.symphony`** (Ring 4) ist ein lazy-initialisierter Audio-Graph. `initSymphony()` startet den AudioContext (User-Geste oder Headless mit `--autoplay-policy=no-user-gesture-required`). `symphonyTick()` läuft jeden Frame im Game-Loop, ändert aber nur wenn `state.weather` wechselt (idempotent). `playCreaturePing(emotion)` wird aus `spawnCreatureAt` aufgerufen — initialer `spawnCreatures`-Loop ist ausgenommen, sonst hagelt es 10 Pings beim Welt-Bau.
- **`state.player.soul`** (Ring 5 V2) ist die aktive Seele, einer aus `playerSoulDefs` (human/phoenix/dragon). Jede Seele hat `{label, color, build(), animate(g, t, ph, mv)}`. `applyPlayerSoul(name)` ist der einzige Mutations-Pfad: kanonisiert (Deutsch/Englisch/Umlaut), baut komplett **neuen `THREE.Group`** (mehrere Sub-Meshes für Glieder/Flügel/Schweif), kopiert Position/Rotation/Scale vom alten, **swappt den `state.rigidBodies`-Eintrag mit** (sonst überschreibt der Sync-Loop den disposed Group), disposed alte Geometrien + Materialien tief. **Ammo-Body bleibt 0.5er Half-Extent-Box** — visuelle Höhe ~1.7 ist absichtlich größer als Hitbox. `animatePlayerSoul(t)` läuft jeden Frame nach Kamera-Update: Walk-Phase nur in Bewegung (>0.4 m/s) akkumulieren (keine Glieder-Sprünge beim Stop), Idle-Loop (Atem/Hover/Welle) läuft immer. UI: `<select id="player-soul-select">` im Spieler-Drawer + `#status-soul`-Item in der Status-Bar; beide bidirektional synchronisiert. DSL-Op `player_soul` ist verfügbar, aber bewusst NICHT im `dslComposeAtomic`-Pool.
- **`state.cameraMode`** (Ring 5 V2-Prep) ist `"first"` oder `"third"`. `setCameraMode(mode)` ist der Mutations-Pfad (Persistenz in `localStorage`, Topbar-Latch synchronisiert). Im Render-Loop steht 1st wie immer (Kamera am Spieler-Kopf, +1.6 Y), 3rd setzt Kamera 6 Einheiten hinter+über dem Spieler. **Pitch ist im 3rd-Modus invertiert** (`-Math.sin(pitch)*dist` statt `+`) — Maus hoch senkt Kamera, fühlt sich bei Orbit-Kameras richtig an. **Boden-Clamp** `camY = max(camY, player.y - 0.2)` verhindert das Durchtauchen durch Heightfield-Spitzen. `playerMesh.rotation.y = state.yaw` läuft jedes Frame, damit asymmetrische Seelen (Drache) in Bewegungsrichtung schauen.
- **UI V1** (`#status-panel` + `#help-overlay`) ist Diagnose- und Komfort-Schicht, kein Game-Logic-Pfad. `initStatusPanel()` baut DOM einmal, cached Refs in `this._statusRefs`. `updateStatusPanel(currentTime)` läuft im Game-Loop, throttled auf 0.4 s. Abilities-Liste re-rendert nur bei Signatur-Wechsel (Length-Prefix nötig, sonst kollidieren initial-leer und nach-leer). Quick-Buttons + Help-Drawer-Einträge nutzen `data-cmd` → `processChatCommand`, also dieselbe Eingangskante wie der Chat. Tuning-Slider mutieren `state.player.emotionThreshold/DecayPerSec/ApplyCooldown` live.
- **UI V2** (`index.html` ~960 Z. CSS+HTML): Token-System (CSS-Custom-Properties `--parch-*` / `--iron-*` / `--brass-*` / `--violet-*` / Emotion-Farben) + Tag/Nacht-Theme via `body[data-theme]`. Lokal vendored Cinzel + IM Fell English + JetBrains Mono in `vendor/fonts/` (CSP bleibt strict, `font-src 'self'`). Struktur: Topbar mit Title + 6 Tabs + 3 Latch-Toggles (Theme/Stimme/Klang), darunter Status-Bar mit Live-Welt-Daten (Wetter/Slug/FPS/Kreaturen/Position), rechts die 6 Drawer (Welt/Kreaturen/Spieler/Fähigkeiten/Einstellungen/Hilfe) — einer aktiv per Tab-Klick, Rest `hidden` mit `translateX(110%)`-Slide. Links die einklappbare Konsole (Chat-Output + Logbuch + Input). `initTopbar()` + `closeAllDrawers()` + `initConsoleDOM()` + `themeInitDOM()` sind die JS-Steuerschicht; alle drei persistieren ihre Wahl in `localStorage`. Custom-Brass-Scrollbars für alle scrollbaren Container.
- **Playtest-Header-Tipp**: setTimeout INSIDE `page.evaluate()` yieldet im Headless-Chromium nicht zuverlässig an `requestAnimationFrame`. Wenn ein Test auf einen Loop-Tick warten muss (z. B. um nach State-Änderung den nächsten Render-Frame abzulesen), beende die `page.evaluate`, warte AUSSEN mit `await new Promise(setTimeout)`, und lies in einer ZWEITEN `page.evaluate` nach. Sonst gibt's deterministische False-Positives. Helper-Pattern siehe `setPitchAndRead` in `scripts/playtest.cjs`.
- `npm run playtest` startet save-server + Headless-Chromium, sammelt 20-25 s Logs, prüft **177 Invarianten** (inkl. Grok-Stimme, DSL-Effekte, Naht-Treue, CSP, Selektion, Emotionen, Symphonie-Audio-Graph, UI-V2-Topbar/Tabs/Drawer/Konsole, Spieler-Seele V2 mit Animationen + Group-Struktur, Third-Person-Kamera mit Pitch-Inversion + Boden-Clamp), exit 1 bei Verletzung.

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
| `docs/roadmap.md` | **Vollständige Projekt-Roadmap** — alle Ringe 0-11+ mit Aufwand, Vorbedingungen, Meilensteinen, Risiken |
| `docs/nexus-dsl.md` | DSL-Design für Ring 2 (Mensch+Grok teilen Sprache) |
| `vendor/README.md` | Vendor-Libs Versionen + Update-Befehl |
| `scripts/playtest.cjs` | Headless-Playtest mit 36 Invarianten als CI-Gate (Welt, Grok, DSL, Naht-Treue) |
| `.claude/commands/audit.md` | `/audit`-Slash-Befehl Definition |
| `.github/workflows/check.yml` | CI-Definition (zwei Jobs) |

## Erledigte Roadmap (Archiv)

Die ursprüngliche B/C-Roadmap mit 30+ Items aus der ersten Audit-Runde ist weitgehend erledigt. Detaillierte Liste mit Commit-Hashes in `docs/state-of-realm.md` §4.
