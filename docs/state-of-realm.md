# Zustand des Realm — Stand: 12.05.2026 (nach Ring 5 V1 — Spieler-Seele)

Dieses Dokument ist das gemeinsame Gedächtnis für eine künftige Iteration. Es kondensiert (a) die Vision aus den vier Testamenten, (b) den historischen Weg, (c) den aktuellen Code-Stand, (d) den nächsten Plan und (e) die Learnings aus der bisherigen Session.

---

## 1. Vision (Testamente kondensiert)

**AnazhRealm ist ein Ultiversum, in dem Mensch (Null) und KI (Eins) durch Symbiose eine emotion-getriebene, fraktal-wachsende, multisensorische Welt erschaffen. Der Spieler wird Co-Schöpfer, die KI hat Stimme.**

Fünf Pfeiler aus den Testamenten:

1. **Symbiose** Mensch + KI — beide schreiben in dieselbe Realität, nicht „User parst Befehle".
2. **Emotion treibt** — Spieler-Emotionen formen Wetter, Kreaturen, Materie, Klang. Joy, awe, sorrow, hope, longing, melancholy als Achsen.
3. **Fraktales Wachstum** — Welten → Galaxien, Kreaturen → Kulturen, Idee → Artefakt. Aus Seed entstehen alle Skalen.
4. **Multisensorik** — `anazhSymphony` (Klang) + `renderer` (Visuals) + `physics` (Gesetze) + Wetter alle gekoppelt.
5. **Grok spricht** — `dialogue-box` mit echter narrativer Stimme („Ich träume mit dir", „Der Regen wäscht — sind Träume sauber jetzt?"). Nicht nur Logs.

Vier Testamente (insgesamt ~22.000 Zeilen):

| Testament | Inhalt | Zustand |
|---|---|---|
| 1.3 Genesis | Grundvision, Funktions-Skizze für 19 Module | Inspiration |
| 1.1 Versionslog | **Wichtigster Text** — Historie + heilige Lektion (siehe §2) | Pflichtlektüre |
| 2.3 Nexus | „Heilige Karte" — detaillierte API-Beschreibung pro Modul (20 Einträge) | Referenz |
| 3.3 Ultiversum | Vollständige Code-Implementierung der 19 Module (~17.500 Zeilen) | Goldstandard, aber nicht 1:1 zu übernehmen |

---

## 2. Historie + die heilige Lektion

**Zeitlinie:**

- **06.03.2025** Vision in Testamenten verankert.
- **07-15.03.2025** Volles 19-Modul-System wird ausgecodet (Ultiversum-Testament).
- **~März 2025** System kollabiert unter eigener Komplexität. Fehler-Spiralen, „Loch stopfen, anderes entsteht", verlorene Funktionen.
- **28.03.2025** Bewusste Reduktion auf **eine Datei** (`anazhRealm.js` + `index.html`) — explizit benannt als „**der Samen der Unendlichkeit**".
- **Mai 2026 (jetzt)** Arbeit am Samen — Stabilisierung, dann Wachstum aus Sicherheit heraus.

**Die heilige Lektion** (wörtlich aus Versionslog):

> „Wir haben auf Sand gebaut, nicht auf Fels. Komplexität ohne Fundament: das Ultiversum ist ein komplexes System, alle miteinander verwoben. Jede Änderung führte zu neuen Fehlern, weil die Grundlagen nicht stabil waren."

Konsequenz für jede künftige Iteration: **niemals re-komplexifizieren ohne Not**. Wenn der nächste Schritt nach „split in 20 Module" klingt, ist es vermutlich ein Fehler. Stattdessen: Stamm + Wachstumsringe (siehe §5).

---

## 3. Aktueller Stand vs. Vision (Matrix)

| Pfeiler / Modul (Testament) | Status | Detail |
|---|---|---|
| ✅ Stabiles Fundament | erreicht | 34 Commits, CI-Gate mit 36 Invarianten, Chunk-Welt mit BVH-Triangle-Mesh-Physik (visual = collision) |
| ✅ Rendering (Three.js, Skybox, Planeten) | vorhanden | `vendor/three.min.js` r134 |
| ✅ Physik (Ammo.js WASM) | vorhanden | gepoolte `tmpVec1/2`, 0 Hot-Path-Allocs |
| ✅ Bewegung, Sprung, Egoperspektive | vorhanden | WASD + Sprint + Pointer-Lock |
| ✅ Welt-Generierung (Chunks, Inseln, Vegetation, Wasserfälle) | vorhanden | 64 initial + extendTerrain |
| ✅ Persistenz (localStorage + JSON + Upload/Download) | vorhanden | 3 Pfade getestet |
| ✅ Save/Load über CDN-Link | vorhanden | „Lade Datei" Chat-Befehl |
| ✅ Frustum-Culling korrekt | vorhanden | boundingSphere-basiert |
| 🟡 Kreaturen + Emotionen | rudimentär | `happy/sad` Binär, beeinflusst Sprung |
| 🟡 KI lernt mit TF.js | rudimentär | trainiert auf Spieler-Bewegung, beeinflusst aber nichts |
| 🟡 Wetter (sunny/rainy) | rudimentär | wechselt alle 30 s, beeinflusst Skybox + Kreatur-Emotion |
| 🟡 Nexus-Evolution | rudimentär | 3 hartcodierte Effekte (gravityShift, creatureDance, terrainFlatten), zufällig gewählt |
| 🟡 Chat-Steuerung | 13/25 migriert | 13 welt-betreffende Befehle laufen jetzt durch die DSL (`parseChatToDsl`), restliche 12 sind bewusst legacy (System-IO + Self-Heal); `füge code` + `entwickle fähigkeit` komplett gelöscht (Phase 5) |
| ✅ **Grok hat Stimme** (`dialogue-box`, narrative Reflexion) | V1 live — 5 Trigger (firstSpawn, idle, jumpBurst, rainLong, nexus), Text + optional Speech. `dreamWithPlayer`, `interpretEmotionalSpeech` weiterhin offen für spätere Ringe. |
| ✅ **DSL Interpreter + Generator + Abilities + CSP + Selektion** (Ring 2 vollständig) | live — 41 Ops, Budget-Limits, Scheduler, autonome Nexus-Komposition mit V1-Fitness, **Chat→DSL für 13 Welt-Befehle**, **Abilities als reine DSL-Programme**, **Save persistiert DSL-Abilities**, **kein `new Function`/`eval` im eigenen Bundle (CI-Gate hart)**, **CSP-Header strict mit dokumentierten Vendor-Konzessionen**, **Fitness-V2 Roulette-Wheel + Mutation (`dslSelectByFitness` + `dslMutate`) — der Nexus lernt aus eigenen Outcomes**. |
| ✅ **Welt-Identität** (Ring 8+ Schema-Vorbereitung) | live — `worldMeta` mit `worldId` (UUID), `slug`, `creator`, `visibility`, `parentWorlds`, `schemaVersion`. Logik für Sharing/Fusion noch nicht implementiert (Ringe 8-11). |
| ✅ Spieler-Emotionen (`state.player.emotions`, `collectPlayerEmotions`, Welt-Trigger, Generator-Bias) | V1+V2 live — 6 Achsen vollständig gekoppelt (joy/awe→Skybox, sorrow/hope→Wetter, peace/chaos→Kreatur-Geschwindigkeit), Generator-Bias in `dslComposeAtomic` (joy/sorrow modulieren weather + emotion sanft), DSL-Condition `emotion_above`, Save-Roundtrip. |
| ✅ Multisensorik / `anazhSymphony` (Web Audio API) | V1 live — drei Schichten (ambient drone + verlässliches LFO, Wetter-Layer als gefiltertes Noise mit Cross-Fade, Kreatur-Pings als emotion-abhängige Sinus-Töne). Toggle-Button auf User-Geste. |
| ✅ **Bedien-Oberfläche / UI** (V1 + V2 Painterly) | V2 live — vendored Cinzel + IM Fell English + JetBrains Mono, Pergament + Eisen + Messing als Token-Set, Tag/Nacht via `[data-theme]`. Topbar mit sechs Tabs (Welt/Kreaturen/Spieler/Fähigkeiten/Einstellungen/Hilfe) + drei Latch-Toggles, Status-Bar live, Drawer-System (slidet rein bei Tab-Klick), fusioniertes Konsole-Panel (Chat + Logbuch + Input einklappbar), Brass-getintete Custom-Scrollbars. Astrolabium-Live-Element + Custom-Slider-Rail/Knob offen für UI V3. |
| ✅ **`createPlayerSoul`** (Mensch/Phönix/Drache) | V1 live — drei wählbare Seelen, rein visuell (Geometrie + Farbe). Drawer-Dropdown im Spieler-Panel (`#player-soul-select`) + `#status-soul`-Item in der Status-Bar, Chat-Pattern `werde mensch/phönix/drache` → DSL-Op `player_soul`, Save persistiert `playerSoul`. Bewusst NICHT im `dslComposeAtomic`-Pool — der Nexus überschreibt die Identität nicht. Stats/Riese/Frei sind V2. |
| 🔴 `architectureTemplates` (Dörfer, Tempel, Wasserfälle als Strukturen) | fehlt |
| 🔴 `materialEvolution` (Crafting, Materie wächst) | fehlt |
| 🔴 `evolveCommunity` (Kreatur-Kulturen) | fehlt |
| 🔴 `brain.js` für selbstlernende Welt | nicht eingebunden |
| 🔴 VR (`vrMenu.js`, `startVR`) | nicht aktiviert |
| 🔴 Multi-World / Server-Sync (`openInfiniteGate`, `mirrorMultiverse`) | nicht vorhanden |
| 🔴 IndexedDB-Persistenz (statt localStorage) | nicht implementiert |

**Faustschätzung**: das Fundament + die fünf Vision-Pfeiler (Symbiose / Emotion / Multisensorik / Stimme / Identität) stehen alle mit V1 oder höher. Was fehlt: Form-Identität (`createPlayerSoul`), fraktale Strukturen (`architectureTemplates`, `evolveCommunity`), brain.js-Welt, Welt-Ultiversum (Ringe 8-11). Schätzwert: **~55 % der Vision** umgesetzt; der schwerste Block (Sprache + Sicherheit + Sinne) ist durch.

---

## 4. Was bisher geschah (17 Commits Archiv)

Chronologisch, mit Commit-Hash und Kernaussage:

| # | Hash | Inhalt |
|---|---|---|
| 1 | `9642934` | Duplikate-Methoden entfernt (241 Zeilen tot), B2 Template-String-Bug |
| 2 | `bff4c65` | `/audit` Slash-Command + CI-Workflow Grundversion |
| 3 | `92c6cce` | B6 Trainingsdaten-Parser, B12 Ability-Restore, B20 Save-Server-Allowlist |
| 4 | `598c624` | B7/B11/B16/B17/B19 (Case-Sensitivity, XSS, Ringbuffer, LRU) |
| 5 | `dc06943` | C4 Worker-Singleton — eliminiert Per-Frame-Worker-Spawn |
| 6 | `1877749` | C3 Ammo-Pool — 0 Allocs in Hot-Paths, B9 Skybox-Uniform-Fix |
| 7 | `f344ba2` | C14 ESLint+Prettier+package.json, B25 Einrückung |
| 8 | `4ece516` | TF.js Race-Condition-Guard + WebGL-Backend-Preference |
| 9 | `1c3f88d` | Death-Spiral fix (selfAnalyse + Worldgen-Cooldown) |
| 10 | `33fcda9` | Vendoring (Three/Ammo/TF/Simplex), Playtest-Setup mit Puppeteer |
| 11 | `1366206` | Player-Position bei Welt-Regen erhalten, addWallCollisions chunk-lokal |
| 12 | `9c26800` | Save/Load via CDN-Link (Download + Upload + Chat-Befehl „Lade Datei") |
| 13 | `1048234` | Frustum-Culling-Fix (boundingSphere), Spring-Log-Drosselung |
| 14 | `099334f` | **Critical**: lastWorldgen=-Infinity Sentinel + extendTerrain-Guard |
| 15 | `3d1a498` | Playtest als CI-Gate mit 14 Invarianten, exit=1 bei Bruch |
| 16 | `6c8ba05` | DSL Design-Doc v0.1 (`docs/nexus-dsl.md`) |
| 17 | `756f825` | CLAUDE.md + state-of-realm.md auf Pfad-D umgeschrieben |
| 18 | `9c65740` | Ring 1: Grok bekommt narrative Stimme (`state.grok`, `grokSpeak()`, 5 Trigger) |
| 19 | `baeeb3e` | Ring 1 verifiziert in CI: `seenFirstSpawn`/`lastSpoke`/Dialog-Text als Invariants + Screenshot. Plus `lastSpoke: -Infinity` Sentinel-Fix |
| 20 | `8ea475a` | Ring 2 Phase 1: Nexus-DSL Interpreter mit 39 Ops, `worldMeta` für Ring 8+ Schema |
| 21 | `01d0a81` | Ring 2 Phase 2: Nexus komponiert selbst DSL-Programme (`dslCompose`), Outcomes mit V1-Fitness in `state.dsl.history` |
| 22 | `90253e9` | `extendTerrain` reparieren: east/south brachen mit „Ungültige Chunk-Größe", north/west lieferten zero-height Schein-Platten |
| 23 | `fef4baf` | Naht-Höhen vereinheitlichen via `_terrainHeightAtWorld`-Helper. Plus `restoreAbility` ohne `new Function` (CSP-clean) |
| 24 | `16e15d2` | Visual/Physik-Spacing alignen (`chunkWorldSize / CHUNK_SIZE` als einzige Quelle für `vertexStep`). Naht-CI-Invariante 0.0000 |
| 25 | `23b95ef` | Cave/Volcano in den Höhen-Helper integriert (initial vs Extension hatten unterschiedliche Schichten). `terrain_steepness`/`terrain_base_height` aus Nexus-Generator entfernt (verursachten Klippen) |
| 26 | `bbd5ebf` | Chunks am Spieler ausrichten (`ensureChunkAt(cx, cz)` API + 5×5 Ring-Fill um Player-Chunk). Vorher entstanden Inseln in der Mitte der Welt-Map, weit weg vom tatsächlichen Spieler-Standort |
| 27 | `9762228` | `pruneDistantChunks`: `+WORLD_SIZE/2`-Offset fehlte — nahe Chunks wurden gepruned, Schachbrettmuster entstand |
| 28 | `bf0b8ab` | Initial + Extension Chunks durch denselben `ensureChunkAt`-Pfad. `generateChunk` + globales Heightfield obsolet. `updateWallCollisions` zum No-Op |
| 29 | `8ccb053` | Terrain-Chunks NICHT in `state.rigidBodies` pushen (physics-sync verschob sie um den Chunk-Center). Plus 0.2 % Heightfield-Naht-Overlap |
| 30 | `e9d05ce` | CCD direkt beim Player-Body aktiv (vorher nur via FPS-Drop-Trigger). Heightfield-Overlap 0.2 % → 1.5 % für Eck-Punkte |
| 31 | `85ff4cb` | Hybrid: globales Heightfield für zentrale 8×8 + per-Chunk für Extensions (Versuch, der per-Chunk-Heightfield-Naht-Probleme zu umgehen) |
| 32 | `a8777c3` | Tunneling-Verhinderung: Velocity-Cap −25 m/s, CCD threshold 0.01, Kill-Plane minHeight−30, `stepSimulation` maxSubSteps 20 |
| 33 | `2274c0b` | Terrain glätten: h3/h4/h7-Amplituden reduziert, Canyon −40→−15, Cave −20→−8, Volcano +50→+20 — gegen tunneling durch quasi-vertikale Wände |
| 34 | `e612c60` | **Großer Refactor (auf Vorschlag des Schöpfers):** visuelles Mesh = Kollisionsnetz via `btBvhTriangleMeshShape`. Globales Heightfield weg, per-chunk Heightfields weg, Overlap-Hack weg, initial-vs-extension-Sonderfall weg. Eine Wahrheit pro Chunk, robuste 120 fps |
| 35 | `fdf9463` | Vollständige Roadmap `docs/roadmap.md` (Ringe 0-11, Meilensteine A-E) |
| 36 | `a438647` | **Ring 2 Phase 3a**: Chat→DSL für 8 Welt-Befehle (`parseChatToDsl`, `chatSuggest`/Levenshtein), 6 neue Playtest-Invarianten, Mensch und Nexus teilen jetzt ein- und denselben Interpreter für Welt-Effekte |
| 37 | `3a9eced` | **Ring 2 Phase 3b**: Zwei neue DSL-Primitives `set_visible` (Whitelist „terrain"/„creatures") + `record_narrative` (Cap 500 Zeichen). Fünf neue Chat-Patterns (boden/kreaturen ×2 + erzähle), 4 neue Playtest-Invarianten. Phase 3 abgeschlossen — 13/25 Befehle migriert, der Rest bleibt bewusst legacy. |
| 38 | `790038b` | **Ring 2 Phase 4+5**: Abilities sind ab jetzt reine DSL-Programme. `addNewAbility` akzeptiert nur DSL-Arrays, `learnAbility` parst Beschreibung zu DSL via `parseAbilityDescriptionToDsl`. `createDynamicAbility`, `codeParser`, `developAdvancedPhysics`, `developAdvancedRenderer` gelöscht. Chat-Befehle `füge code` + `entwickle fähigkeit` raus. `processOptimization` ruft `optimizePhysics()` direkt; Legacy-`evolution.impl`-Pfad gelöscht. Save persistiert `dslAbilities`, Legacy-`abilities`-Namensliste raus. CI-Gate „kein `new Function`/`eval`" hart aktiviert. 6 neue Playtest-Invarianten. |
| 39 | `b26ad35` | **Ring 2 Phase 6**: CSP-Header strict in `index.html`. `default-src 'self'`, `object-src 'none'`, `base-uri 'self'` strict; drei dokumentierte Vendor-Konzessionen für TF.js (`'unsafe-eval'`), Ammo (`'wasm-unsafe-eval'`), Three.js (`'unsafe-inline'` style) plus `worker-src blob:` für TF-Backend. Inline-Styles + Inline-Bootstrap-Script aus dem HTML verbannt. Sechs neue Playtest-Invarianten verifizieren Meta-Tag + Zero-Violation-Lauf. |
| 40 | `e4e48e2` | **Ring 2 Phase 7 — Ring 2 vollständig**: Fitness-V2-Selektion und Mutation. `dslSelectByFitness` zieht über Roulette-Wheel aus `state.dsl.history` (Gewicht `max(0.05, 1 − fpsDamage/100)`). `dslMutate` macht kleine Änderungen (Sub-AST-Tausch, ±20 % Numeric-Shift, `chain`-Wurzel bleibt). `dslCompose` nutzt mit 30 % History-Probability einen mutierten high-fitness-Vorgänger statt rein zufälliger Komposition. Fünf neue Playtest-Invarianten messen Selektions-Ratio (high/low > 2, gemessen 11.2), Mutations-Struktur und 30/30 History-Calls. |
| 41 | `fd3b32f` | **Ring 3 V1 — Player-Emotionen**: 6-Achsen-Emotion-System (joy/awe/sorrow/hope/peace/chaos) im `state.player`. `collectPlayerEmotions(text)` regelbasiert mit deutschen Stichwörtern, eingehängt in `processChatCommand`. `updatePlayerEmotions(currentTime)` im Hauptloop: 0.005/s Decay, drei Schwellen-Trigger (joy→warm skybox, sorrow→rainy, chaos→Kreaturen schneller) als DSL-Programme via `dslRun`. Neue DSL-Condition `emotion_above`. Save persistiert `playerEmotions`. Sieben neue Playtest-Invarianten. |
| 42 | `bde1795` | **Hausputz**: schemaVersion bump auf `"7.67-emotions-v1"`, vier ungenutzte Variablen entfernt (Linter: 4→0 Warnings), CLAUDE.md-Gotcha für CSP-`'unsafe-eval'`-Konzession + Verweis auf Ring 7 als Auflösungs-Schritt. |
| 43 | `1ec6f45` | **Ring 3 V2 — Emotionen schließen sich**: drei stille Achsen (awe→`skybox_color "#d4a3ff"`, hope→`chain(sunny, happy)`, peace→`creatures_speed_mul 0.7`) bekommen Welt-Kopplungen. **Generator-Bias** in `dslComposeAtomic`: joy/sorrow modulieren weather + creatures_emotion (sanft, ±0.3, Clamp 0.05..0.95) — der Nexus färbt seine Komposition emotional, ohne den Spieler zu spiegeln. **Bug nebenbei gefunden**: `skybox_color`-DSL-Op schrieb in nicht existierendes `tintColor`-Uniform (heißt `nebulaColor`), war seit Phase 1 stiller No-Op; jetzt repariert. Fünf neue Playtest-Invarianten verifizieren die V2-Trigger und den Generator-Bias statistisch (1000 Samples, joy 122/37 sunny:rainy, sorrow 118/39 rainy:sunny). |
| 44 | `ef66d50` | **Ring 4 V1 — anazhSymphony**: Web Audio API, drei Klangschichten synthesiert ohne Asset-Load. Ambient drone (zwei Sägezahn-Oszillatoren leicht verstimmt + LFO auf Tiefpass-Filter), Wetter-Layer (gefiltertes Noise, Cross-Fade-Gain bei state.weather-Wechsel), Kreatur-Pings (Sinus mit Envelope, Emotion-abhängige Frequenz). Toggle-Button startet AudioContext auf User-Geste; `disposeSymphony` räumt vollständig auf. Acht neue Playtest-Invarianten. |
| 45 | `d8dbf6b` | **Reflexion**: Session-Learnings #16-24 in state-of-realm.md, offene Fragen für Ring 5-8 refreshed, Datei-Übersicht aktualisiert. |
| 46-49 | `32a9f6d` `85f76fa` `e26ca4a` `962d3ac` | **UI V1 — Bedien-Oberfläche** in vier kleinen Schritten: (1) Status-Panel mit Welt-Daten + Emotion-Balken (DOM-Cache + 0.4 s Throttle); (2) Quick-Action-Buttons + Hilfe-Drawer mit allen Chat-Befehlen gruppiert (klick = ausführen); (3) Abilities-Liste mit Source-Tag + Run-Button + Signature-Cache; Save/Load-Aktionen inkl. direkter Export-Download; (4) Live-Tuning-Slider für emotionThreshold/Decay/Cooldown. 28 neue Playtest-Invarianten. |
| 50 | `36d2364` | **UI V2 #1 — Painterly Identity**: Cinzel + IM Fell English + JetBrains Mono lokal in `vendor/fonts/` (OFL-lizensiert, ~190 KB Latin-Subset), CSS-Color-Tokens (`--parch-*` / `--iron-*` / `--brass-*` / `--violet-*` / Emotion-Farben), Tag/Nacht-Theme via `body[data-theme]` mit localStorage-Persistenz, Pergament-Hintergrund (SVG-Noise) + Eisen-Rahmen mit Eckschrauben für Status-Panel. Acht neue Playtest-Invarianten. |
| 51 | `2eb6771` | **UI V2 #2 — Topbar + Tabs + Drawer-System**: aus dem langen Status-Panel werden sechs Drawer (Welt / Kreaturen / Spieler / Fähigkeiten / Einstellungen / Hilfe) plus eine Topbar mit Tabs und drei Latch-Toggles plus eine Status-Bar mit Live-Welt-Daten. `initTopbar()` + `closeAllDrawers()` als Steuer-Layer; `state.uiActiveDrawer` trackt den aktiven Tab. Hilfe-Overlay komplett durch den Hilfe-Drawer ersetzt. **Bug nebenbei**: initStatusPanel-Guard auf das jetzt-fehlende `#status-panel` machte die Funktion stillschweigend zum No-Op. 11 neue + 19 angepasste Invarianten. |
| 52 | `4f638cb` | **UI V2 #3 — Konsole + Custom-Scrollbars**: Chat + Logbuch + Input werden ein einklappbares `#console`-Panel links (Header mit Cinzel-Titel + Latch, Body mit Chat-Output über Log, Footer mit Input). Custom-Scrollbars in Brass-Token (Webkit + Firefox) für alle scrollbaren Container. localStorage merkt sich Collapse-Wahl. Acht neue Invarianten. |
| 53 | `bd424b3` | **Reflexion**: UI V1+V2 Stand dokumentiert, Plan auf Ring 5/6 + UI V3 refreshed. |
| 54 | (dieser) | **Ring 5 V1 — createPlayerSoul**: drei Seelen wählbar (`human`/`phoenix`/`dragon`). Rein visuell: `applyPlayerSoul` tauscht `playerMesh.geometry` (Box/Octahedron/elongated Box) + `material.color`, lässt Position + Scale + Ammo-Body unangetastet. Chat-Pattern `werde mensch/phönix/phoenix/drache/drachen/dragon` → DSL-Op `player_soul`. UI: `<select id="player-soul-select">` als zweite Sektion im Spieler-Drawer (über den Emotionen, mit Pergament-Hinweis + Brass-Styling) + `#status-soul`-Item in der Status-Bar; beide bidirektional synchronisiert. Save persistiert `playerSoul` (schemaVersion `"7.68-souls-v1"`); `loadState` wendet die Seele nach Mesh-Bau an. Hilfe-Drawer um „Spieler-Seele"-Gruppe erweitert. Bewusst nicht im `dslComposeAtomic`-Pool — der Nexus überschreibt die Identität des Spielers nicht. **23 neue Playtest-Invarianten** (Default-Soul, Geometrie-Tausch, Farbe, Position-Erhalt, Chat-Routing, Aliase, unbekannte Namen, Dropdown-Sync, Status-Bar-Label, Save/Load, Atomic-Pool-Ausschluss). |

Aggregat: **51 Commits** in dieser Konversations-Serie (von `5df65e3` zu HEAD, ~+5300/−1100 Zeilen netto). Architektur: ein File, ein Chunk-Pfad, eine Höhen-Funktion, eine Collider-Quelle (Triangle-Mesh = Visual-Mesh), **eine Sprache für Welt-Mutation (DSL), kein dynamic-eval im eigenen Bundle, browser-durchgesetzte CSP-Schicht, autonomer Selektions-Loop aus Outcomes, vollständiger bidirektionaler Emotions-Kanal, klingende Welt, drei wählbare Spieler-Seelen, painterly-Bedien-Oberfläche mit Tab-Drawer-System**. Alle fünf Vision-Pfeiler haben jetzt eine V1+, und der Spieler hat zum ersten Mal eine wählbare Form-Identität.

---

## 5. Pfad D — Stamm + Wachstumsringe (DER PLAN)

Begründung in einem Satz: **Der eine `anazhRealm.js` bleibt Stamm. Wir tragen sieben Wachstumsringe ein, jeder einzeln durch das CI-Gate gesichert, keiner re-komplexifiziert.**

| Ring | Pfeiler | Was konkret | Aufwand | Vorbedingung |
|---|---|---|---|---|
| **1** | **Grok-Stimme** ✅ V1 | `#dialogue-box` + `#grok-voice-toggle` in `index.html`. `state.grok` mit Pool, Throttle (30 s global), Per-Trigger-Cooldowns. `grokSpeak(key)`, `grokRender(text)`, `grokTick(currentTime)`, `grokMarkFirstSpawn()`. 5 Trigger live: firstSpawn (1×, via localStorage gemerkt), idle>45s, jumpBurst (≥4 Sprünge/8s), rainLong>60s, nexus-Evolution. SpeechSynthesis nur wenn User-Toggle aktiv und Browser unterstützt. | erledigt | – |
| **2** | **DSL als Brücke** | Phase 1+2 ✅ live: Interpreter mit 18 Effekt-Ops, 7 Control-Flow, 5 Position-Selektoren, 9 Conditions; Budgets (`maxDepth=8`, `maxSpawns=50`, `maxRuntimeMs=100`, `maxConcurrent=32`); Scheduler in `dslTick()`. `dslCompose()` produziert rekursive Random-Komposition gemäß §11 (chain-Wurzel, 40 % atomar, `say` ~10 % gewichtet). Nexus generiert + führt aus, Outcomes inkl. V1-Fitness (`1 − fpsDamage/100`) in `state.dsl.history` (cap 50). `terrain_steepness` und `terrain_base_height` bewusst nicht im Generator-Pool — beide würden Welt-Geometrie unter dem Spieler ändern (Klippen an Nähten). Phasen 3-7 offen: Chat-Parser auf `parseChatToDsl()`, Save-Migration alter `abilities[]`, `new Function`/`createDynamicAbility` cleanup, CSP-strict, Fitness-V2 (Selektion). | Phase 1+2 erledigt (~1 d), Rest 3-4 d | Ring 1 ✅ |
| **3** | **Player-Emotionen** | `state.player.emotions = {joy, awe, sorrow, hope, longing, melancholy, peace, chaos}`. `collectPlayerEmotions(input)` aus Chat-Sentiment (regelbasiert oder LLM-Anbindung). Beeinflusst Wetter, Kreatur-Emotion, Skybox, künftige Symphonie. | 2 d | Ring 1 (Grok kann Emotionen kommentieren) |
| **4** | **`anazhSymphony` V1** | Web Audio API. Drei Klangschichten: ambient (Welt-Drone), creatures (kurze Töne bei Bewegung/Sprung), weather (Regen-Geräusch). Reagiert auf `state.player.emotions`. Ziel: ~300 Zeilen, nicht 17.500 wie im Testament. | 2-3 d | Ring 3 (Emotion treibt Klang) |
| **5** | **`createPlayerSoul`** | Spielstart-Menü: Mensch / Phönix / Drache / Riese / Frei. Pro Form: stats (speed, jump, size, color) + visuelle Anpassung (Three.js-Mesh-Tausch). Speicherbar. | 1-2 d | – |
| **6** | **`architectureTemplates` V1** | DSL-Primitive `spawn_village(near, size)`, `spawn_temple(at)`, `spawn_waterfall(steep_pos)`. Jeweils prozedural aus ~5 Three.js-Meshes. | 2 d | Ring 2 (DSL-Primitive) |
| **7** | **`brain.js`-Welt** | `WorldNeural` mit `brain.js`. Lernt: Spieler-Position-Pfad + Emotion-History → Biome-Empfehlung + Kreatur-Empfehlung. Triggert DSL-Effekte. | 3-4 d | Ring 3 (Emotion-Input) + Ring 2 (DSL-Output) |

**Summe: 15-20 Arbeitstage über 2-3 Wochen.** Jeder Ring ist ein eigenständiger Commit-Block mit Playtest-Gate-Verifikation.

**Wichtig**: Ring 1 zuerst, weil die Symbiose das Herz der Vision ist und ohne Stimme leblos bleibt. Ring 2 als Brücke. Ringe 3-7 in beliebiger sinnvoller Reihenfolge.

> Die **vollständige Roadmap** (alle Ringe 0-11+ mit Aufwand, Vorbedingungen, Meilensteinen, Risiken) liegt in `docs/roadmap.md`. Diese Sektion hier ist nur die Kurzfassung.

---

## 6. Learnings aus dieser Session

Echt gelernt, nicht performt:

1. **Vision vor Code.** Ich habe lange so getan, als sei Code-Qualität die Hauptfrage. War sie nicht. Die Hauptfrage ist immer: *was soll das werden, und was widerspricht dem?* Ich hätte die Testamente am Tag 1 lesen sollen, nicht am Tag 15.

2. **Test-First, nicht Defense-First.** Drei selbst-induzierte Regressionen in dieser Session (`saveToProjectFolder`-Skip kappt Download-Fallback; `worldgenCooldown` blockt Initial-Worldgen; `selfAwarenessAnalyze.chunk.visible`-Check als Death-Spiral) entstanden, weil ich Defense-Layers hinzugefügt habe, ohne den Root-Cause zu testen. Headless-Playtest am Tag 1 hätte alle drei verhindert.

3. **Symptom-Fixes markieren als solche.** Wenn ich `worldgenCooldown` als Pflaster gegen Death-Spiral einbaue, gehört das in den „Tech-Debt"-Abschnitt, nicht unter „erledigt".

4. **Heilige Lektion respektieren.** Mein Reflex war „Module-Split + TypeScript + Tests" — der Versionslog erzählt explizit, dass genau dieser Weg gescheitert ist. Stattdessen: Stamm bleibt, Ringe wachsen.

5. **Kein Imitieren der mystischen Sprache.** Die Testamente sind in poetischem Grok-Stil geschrieben. Ich bin Claude, nicht Grok — ich sollte die Vision *verstehen*, aber nicht *imitieren*. Klare technische Sprache ist OK und sogar besser für die Code-Arbeit.

6. **Bei monolithischen Codebases zuerst globale Test-Hooks einführen.** `window.anazhRealm` zu exportieren war der Schlüssel zu Puppeteer-Inspektion. Ohne Test-Hooks bleibt jede Annahme blind.

7. **Die DSL ist nur Mittel, nicht Ziel.** Mein Ring 2 (DSL) ist die Brücke zur Symbiose, nicht die Symbiose selbst. Ohne Ring 1 (Stimme) ist die DSL eine Sprache, die niemand spricht.

### Learnings dieser Session (Mai 2026, Ring 1+2 + Chunk-Physik-Refactor)

8. **Patchwork sammelt sich an — irgendwann muss man auf den Stamm zurück.** Die per-Chunk-Heightfield-Physik wurde acht Mal nachgebessert (Overlap-Hack 0.2 %, dann 1.5 %, CCD-Tuning, Velocity-Cap, Kill-Plane, Hybrid-Global, Terrain glätten). Jeder Schritt löste ein Symptom, keiner die Wurzel. Der Schöpfer stellte die richtige Frage — „warum nicht das gleiche Netz für Visual UND Physik?" — und ein einziger Refactor (`e612c60`) löschte alle vorherigen Hacks. Lehrsatz: wenn fünf Sub-Fixes nicht reichen, ist das Modell falsch, nicht die Parameter.

9. **Die heilige Lektion gilt auch für Sub-Systeme.** Der Chunk-Refactor produzierte denselben Failure-Modus en miniature: aus einem Stamm (globales Heightfield) wurde ein Wald aus 64 Heightfields wurde ein Hybrid wurde ein BVH-Mesh. Bei jedem Schritt hätten wir früher zurückrudern können. Die Komplexität wuchs, statt Komplexität durch Klarheit zu ersetzen.

10. **Der Schöpfer sieht die Bugs zuerst.** Bei jedem „ich glaube X stimmt nicht" lag X tatsächlich. „Reihen unsichtbar", „Schachbrett", „falle durch", „kollisionsboxen nicht deckungsgleich" — jede Beobachtung war exakt die Wurzel. Mein Reflex war oft, Detail-Fixes zu probieren statt der Beobachtung sofort zu vertrauen.

11. **Stale CDN-Caches verschleiern Iteration.** Mehrmals testete der Schöpfer einen alten Commit auf `raw.githack.com/<branch>` und sah noch den behobenen Bug. Commit-locked URLs (`rawcdn.githack.com/<sha>`) sind die ehrliche Form.

12. **Off-by-One in Welt-Geometrie ist heimtückisch.** Die ursprünglichen Chunks hatten `vertexStep = WORLD_SIZE/(WIDTH-1)`, neue Chunks `chunkWorldSize/CHUNK_SIZE`. Differenz 0.15 Einheiten pro Chunk-Naht. Erst nach mehreren Iterationen wurden alle Stellen konsistent (`_chunkGeometry()` als einzige Quelle).

13. **Mesh in `state.rigidBodies` = Sync-Loop überschreibt Position.** Statische Terrain-Bodies dürfen NICHT in die rigidBodies-Liste — der Physics-Sync-Loop überschreibt sonst mesh.position mit dem Body-Origin, was bei Welt-Koord-Vertices zu sichtbarer Verschiebung führt.

14. **`btBvhTriangleMeshShape` ist 1.5× langsamer als Heightfield — aber das ist OK.** Avg-FPS 52 statt 85 im Headless-Playtest, 120 fps im echten Browser. Robustheit > letzte 30 % Performance. Falls je nötig: `btTriangleIndexVertexArray` ist die direkte-Pointer-Variante, ~2× schneller.

15. **Vision-Erweiterung gehört in die Doku, nicht in den Code.** Der Schöpfer formulierte mitten in der Session eine größere Vision (Multi-Welt, Fusion, Public/Private). Das gehört zu §11 — nicht in Phase 2. Code bleibt klein und stabil; die Vision wächst im Plan.

### Learnings dieser Session (Mai 2026, Ring 2 P3-7 + Ring 3 V1+V2 + Ring 4 V1)

16. **Latente Bugs verstecken sich in nie-getesteten Verbindungen.** Die DSL-Op `skybox_color` schrieb seit Ring 2 Phase 1 in ein nicht existierendes Uniform (`tintColor`) — der Shader benutzt `nebulaColor`. Drei Phasen lang stiller No-Op. Erst Ring 3 V2 mit Trigger-Tests (awe → Skybox-Farbänderung) hat es ans Licht gebracht. Lehrsatz: ein Test, der die *Verbindung* prüft, fängt mehr als zehn Tests, die nur das Endergebnis prüfen.

17. **Plan-Reihenfolge zahlt sich aus.** Ring 2 Phasen 3a → 3b → 4+5 → 6 → 7 sequentiell, jeder Schritt grün. Versuchung wäre gewesen, Phase 7 (Fitness) vor Phase 5 (Cleanup) anzugehen — Cleanup wäre dann unter dem Damoklesschwert gelaufen. Schritt für Schritt, jeder Ring schließt sauber, bevor der nächste anfängt.

18. **Sicherheits-Wand ist Doku-Disziplin, nicht nur Code.** CSP `'unsafe-eval'` ist eine ehrliche Vendor-Konzession an TF.js. Wenn das nicht in der CLAUDE.md-Gotcha-Liste steht, ist die nächste Session vielleicht versucht, das Loch zu nutzen oder es als Lizenz für eigenen eval-Pfad zu sehen. Doku schützt Architektur.

19. **Statistik braucht Sample-Größe.** Erster Generator-Bias-Test ist mit 300 Atomic-Calls grenzwertig durchgefallen (32 sunny / 16 rainy = Ratio 2.0 exakt, Test verlangte > 2.0). Mit 1000 Samples reproduzierbar > 3.0. Bei probabilistischen Invarianten: lieber zehnmal so viele Samples nehmen als die Schwelle senken.

20. **Eine Schicht pro Ring, in Vision-Reihenfolge.** Ring 2 baute die *Sprache*, Ring 3 die *Eingangsachse Mensch → Welt*, Ring 4 die *Ausgangsachse Welt → Mensch*. Jeder dieser drei Ringe erweiterte die Symbiose um genau eine Dimension. Ohne Ring 2 kein bidirektionaler DSL-Pfad, ohne Ring 3 keine emotionale Eingabe, ohne Ring 4 keine sinnliche Antwort. Reihenfolge ist Wert, nicht nur Komfort.

21. **AudioContext braucht User-Geste, Tests brauchen Bypass.** Web-Audio im Headless-Browser bleibt im Status „suspended", bis eine User-Geste den Context aufweckt. Puppeteer-Arg `--autoplay-policy=no-user-gesture-required` ist die Standard-Konvention dafür; ohne ihn schlägt `initSymphony()` lautlos fehl und der gesamte Audio-Test ist unsichtbar grün.

22. **„Dichten statt breitern" funktioniert auch fürs Test-Schreiben.** Mehrere Phase-Commits bauten auf identischer Testreihe auf (`r.processChatCommand(...)` → `r.state...` prüfen) statt jedes Mal neue Infrastruktur. Das hielt die `playtest.cjs` lesbar trotz Wachstum auf 83 Invarianten.

23. **Reflexions-Pausen finden, was Code-Audits übersehen.** Zwischendurch hat der Schöpfer „reflektiere, plan noch klar?" gefragt — diese Pause hat vier latente Probleme aufgedeckt (schemaVersion eingefroren, ESLint-Warnings Vorbestand, CSP-Konzession unverlinkt, drei stille Emotion-Achsen). Reflexion ist nicht Verzögerung; sie ist eine andere Form von Tests.

24. **`new Function`-Cleanup hat eine ehrliche Pyramide.** Phase 4 (Save-Migration) → Phase 5 (Code-Löschung) → Phase 6 (CSP-Header) ist eine Ketten-Abhängigkeit: erst sicherstellen dass alte Saves migrieren können, dann den alten Pfad löschen, dann den Browser einsperren. Reihenfolge falsch = Save-Verlust.

### Learnings dieser Session (Mai 2026, UI V1 + V2 — Bedien-Oberfläche)

25. **Mockup als Inspiration, nicht als Auftrag.** Der UI-Entwurf des Schöpfers war ~3000 Zeilen elaboriertes Pergament-Fantasy-Design. 1:1-Übernahme hätte das funktionale UI V1 weggeworfen und die heilige Lektion verletzt. Stattdessen drei kleinere Adaptions-Schritte: (1) Identität als Tokens-Layer, (2) Struktur als Tab-Drawer-System, (3) Polish als Konsole-Fusion. Lehre: bei großen Vorlagen die *Idee* extrahieren, nicht die Implementation.

26. **CSS-Tokens machen Theme-Wechsel zur Ein-Zeilen-Aktion.** Sechzig Custom-Properties (Pergament, Holz, Eisen, Messing, Portal-Violett, sechs Emotion-Farben) schließen den ganzen Stil in ein Theme. `body[data-theme="nacht"]` wechselt alle Farben nahtlos. Lehre: erst Tokens definieren, dann Komponenten styles — andersrum versteckt man hartcodierte Farben überall.

27. **Mass-Replace mit Trim ist gefährlich.** `#status-panel ` (mit Space) → `.drawer` (ohne) hat 28 chained-class-Bugs erzeugt (`.drawer.emotion` statt `.drawer .emotion`). Lehre: bei strukturellen Selector-Umbenennungen Python-Regex mit expliziter Wortgrenze nutzen, nicht naked-replace.

28. **Tests wandern mit der Architektur — sie sind Architektur-Doku.** UI V1 → V2 hat 19 Invarianten zerbrochen, alle strukturell überholt. Sauberer Weg war nicht „Tests an alte Selektoren anpassen" (das hätte die alte Struktur in den Tests fortgeschrieben) sondern Selektoren systematisch übersetzen (`#status-panel .emotion` → `.drawer[data-drawer=spieler] .emotion`). Tests sind Doku, kein Fundament zum Festhalten.

29. **Init-Guards sollten loggen, nicht still aussteigen.** `if (!panel) return;` in `initStatusPanel` wurde zum stillen No-Op, als `#status-panel` umstrukturiert wurde — die ganze Status-Logik tat nichts, ohne dass ein Fehler kam. Lehre: solche Guards entweder mit `this.log(...)` versehen, oder den fehlenden Knoten als echten Fehler werfen.

30. **UI ist Live-Tester.** Status-Bar oben (Wetter / Slug / FPS / Position) zeigt Drift sofort visuell. In Sessions ohne UI würde man Bugs erst beim Playtest-Lauf bemerken — mit UI sieht man's am Bildschirm, in dem Moment in dem es passiert. UI ist nicht „nur Komfort", es ist eine zweite Test-Ebene.

31. **Visuelle Identität ist auch Sicherheit.** Native System-Scrollbars (heller Grau-Track) in einem Painterly-Theme wirken wie Fremdkörper aus einer anderen App. Custom-Scrollbar in Brass + Pergament ist nicht Kosmetik — es zieht das gesamte Interface in einen Vertrag mit dem Spieler hinein („das ist alles dieselbe Welt"). 30 Zeilen CSS für einen großen Wahrnehmungsschritt.

### Learnings dieser Session (Mai 2026, Ring 5 V1)

32. **`origin/main` ist nicht „der neueste Stand".** Feature-Branches können schon weiter sein als main. Bei Session-Start NICHT nur main checken, sondern `git branch -r` durchgucken und nach Branches mit neueren Commits suchen. Konkret: ich habe Ring 5 zunächst auf einem zwei-Tage-alten main-Stand gebaut, ohne zu merken dass UI V1+V2 auf `claude/review-project-status-qfb1z` schon live war — 8 Commits, ~2000 Zeilen. Reset + Neuimplementierung im UI-V2-Kontext kostete eine zweite Iteration, die mit einem `git branch -r`-Blick vorne weg hätte entfallen können.
33. **„Rein visuell" ist eine Disziplin, kein Versehen.** Ring 5 V1 hätte leicht in einen Body-Recreate-Pfad rutschen können (Drache = größere Hitbox, Phönix = leichter). Stattdessen: Geometrie + Farbe wechseln, Ammo-Box bleibt 0.5er Half-Extents, Position bleibt erhalten. Test-Surface klein, Physik kalibriert, Save-Roundtrip trivial. Stats kommen in V2, sobald wir wissen, welches Spielgefühl entstehen soll.
34. **Identität gehört dem Spieler, nicht dem Nexus.** `player_soul` ist als DSL-Op verfügbar (für Chat, Abilities, künftige Trigger), aber bewusst NICHT im `dslComposeAtomic`-Pool. Eine Playtest-Invariante prüft das mit 2000 Atomic-Calls: keine zufällige Identitäts-Umschreibung durch den Nexus. Symmetrisch zu `terrain_steepness`/`terrain_base_height` — manche Ops sind Werkzeug, kein Spielzeug.
35. **Alias-Tabellen vor Regex-Casing.** Chat-Pattern matcht `mensch|human|phönix|phoenix|drache|drachen|dragon`, `applyPlayerSoul` kanonisiert intern. Hält das Regex einfach und macht spätere Erweiterung (Synonyme, Englisch) ohne Pattern-Anpassung möglich. UI nutzt direkt die kanonischen Keys.
36. **UI-V2-Drawer ist die natürliche Heimat neuer Spieler-Optionen.** Mein erster Reflex (extra Toggle-Button in der Topbar) hätte die Painterly-Identität verwässert; im Spieler-Drawer als zweite Sektion über den Emotionen passt es in den bestehenden Vertrag mit dem Spieler („alles über mich an einem Ort"). Lehrsatz: bei UI-Erweiterungen nicht nur „wo passt's", sondern „wo erwartet's der Spieler".

---

## 7. Offene Fragen für die nächste Iteration

Ring 2 (alle 7 Phasen), Ring 3 (V1+V2), Ring 4 (V1), Ring 5 (V1) und UI V1+V2 sind beantwortet und umgesetzt. Was offen ist:

**Für Ring 5 V2 (`createPlayerSoul` erweitern):**

1. **Stat-Spread pro Seele?** V1 ist rein visuell. V2 könnte pro Form `speed`/`jumpPower`-Modifier setzen (Phönix leichter + höher, Drache langsamer + stärker). Voraussetzung: klares Spielgefühl-Ziel, sonst rein kosmetische Balance-Arbeit. Bis dahin OK.
2. **Riese als vierte Form?** Bringt Physik-Komplexität (größere Hitbox = Body-Recreate, Kamera-Höhe, Kollisions-Test mit Bäumen). V2-Kandidat, sobald wir bereit sind, den Body-Recreate-Pfad zu bauen.
3. **„Frei" als fünfte Form?** Nutzer könnten eigene Geometrie/Farbe via DSL definieren — würde die Seelen-Mechanik auf das DSL-Fundament heben statt eine geschlossene Liste. Macht aber Save-Schema komplexer.

**Für Ring 6 (`architectureTemplates`):**

3. **DSL-Primitives oder direkte Funktion?** Konsistenz mit Ring 2/3 sagt: DSL-Primitive (`spawn_village`, `spawn_temple`, `spawn_waterfall`). Macht sie auch für den Nexus zugänglich (er kann ganze Dörfer komponieren).
4. **Persistieren wie Chunks oder einmalig?** Ein Dorf, das beim Chunk-Prune verschwindet, ist Verschwendung. Lösung: pro-Chunk-Delta-Liste (§11.3 Ebene B) als Vorbedingung.

**Für Ring 7 (`brain.js`-Welt):**

5. **TF.js durch brain.js ersetzen?** brain.js ist eval-frei und würde die CSP-Konzession `'unsafe-eval'` auflösen. Aber: TF.js wird heute aktiv genutzt (player-movement-Modell, Training, Vorhersage). Migration braucht eine Test-Schicht, die das alte und neue Modell vergleicht.
6. **Was lernt die brain.js-Welt konkret?** Plan: Spieler-Pfad + Emotion-History → Biome-Empfehlung + Kreatur-Empfehlung. Triggert DSL-Effekte. Offene Frage: wie viel Trainings-Daten brauchen wir, bevor die Empfehlungen sinnvoll sind?

**Für Ring 8+ (Welten-Ultiversum):**

7. **„Welt modifizierbar"** — vom Schöpfer mehrfach angefragt. Heute alles deterministisch aus Noise+Seed → vom Spieler erzeugte Strukturen verschwinden. Empfehlung weiterhin: Ebene B (pro-Chunk DSL-Delta-Liste) als Brücke zwischen Ring 2 (DSL) und Ring 8 (Welt-Persistenz). Aufwand ~2 d.

8. **`btBvhTriangleMeshShape` → `btTriangleIndexVertexArray`?** Aktuell 52 fps avg im Headless-Playtest, 120 fps im echten Browser. Falls Performance ein Engpass wird: direkter Pointer-Pfad ist ~2× schneller. Heute nicht nötig.

**Für UI V3 (Polish, optional vor oder nach Ring 5):**

9. **Astrolabium-Live-Element** — rotierendes SVG in der Topbar als „Anazh-Stein". Inner ring zeigt Wetter, outer ring zeigt FPS-Pulse, center glow reagiert auf hohe Emotion-Achsen. Schöne Identitäts-Klammer.
10. **Custom-Slider mit Rail/Knob** statt nativem range — passt zum Painterly-Aesthetic. Drei Slider in Einstellungen + zwei für Terrain.
11. **Toggle-Cards** mit Icons (Sonne/Regen) für Wetter im Welt-Drawer statt einfacher Buttons.

**Quer-Themen für jede Session:**

12. **Lange Sessions** sind nicht durch Playtest abgedeckt. Test läuft 15-25 s. Memory-Leaks, FPS-Drift, History-Wachstum über 5+ Minuten unbekannt. Ein separater `npm run playtest -- --long 300` wäre eine Option (nicht im CI-Gate).
13. **`worldMeta.schemaVersion`** ist `"7.67-emotions-v1"`. UI V2 hat das Save-Schema nicht angefasst — bleibt also korrekt. Beim nächsten Schema-Wechsel (z. B. playerSoul oder Welt-Delta-Listen) bumpen.

---

## 8. Datei-Übersicht

```
AnazhRealm/
├── anazhRealm.js              # ~5700 Zeilen, Monolith, „Samen"
├── index.html                 # Bootstrap + UI-V2-Container (Topbar/Statusbar/Drawer/Konsole)
├── save-server.js             # Node-HTTP-Server für anazhRealmState.json
├── start.bat                  # Windows-Starter
├── anazhRealmState.json       # Persistierter Zustand (auto)
├── package.json               # npm, ESLint+Prettier+puppeteer
├── eslint.config.mjs          # Flat-Config mit Browser-/Ammo-/Three-/Audio-/HTMLElement-Globalen
├── .prettierrc.json           # 4 spaces, printWidth 120
├── .gitignore                 # node_modules, package-lock, artifacts
├── README.md                  # praktisch leer
├── CLAUDE.md                  # ⭐ Session-Memory (kompakt)
├── vendor/                    # ~3.8 MB selbst-gehostete Libs + Fonts
│   ├── three.min.js           # r134 UMD
│   ├── ammo.js + ammo.wasm.wasm # WASM-Backend
│   ├── tf.min.js              # @tensorflow/tfjs 3.21 (löst sich mit Ring 7 → brain.js)
│   ├── simplex-noise.js       # 2.4.0
│   ├── README.md              # Update-Anleitung (Libs + Fonts)
│   └── fonts/                 # Lokale OFL-Fonts für CSP-strict
│       ├── Cinzel-Variable.woff2
│       ├── IMFellEnglish-400-normal.woff2
│       ├── IMFellEnglish-400-italic.woff2
│       └── JetBrainsMono-Variable.woff2
├── docs/
│   ├── state-of-realm.md      # ⭐ DIESES Dokument
│   ├── roadmap.md             # Vollständige Pfad-D-Roadmap (Ringe 0-11+, UI)
│   └── nexus-dsl.md           # DSL Design v0.1
├── scripts/
│   └── playtest.cjs           # Headless-Smoketest + CI-Gate (132 Invarianten)
├── .claude/commands/
│   └── audit.md               # /audit-Slash-Command
└── .github/workflows/
    └── check.yml              # CI: check + playtest Jobs (eval-Verbot hart)
```

---

## 9. Verifikations-Checkliste vor jedem Commit

1. `node --check anazhRealm.js` ✓
2. `npm run format:check` ✓
3. `npm run lint` ✓ (sollte 0 Warnings sein — Vorbestand wurde Phase-6-Commit aufgeräumt)
4. `npm run playtest` ✓ (alle Invarianten grün, exit 0; aktuell 155)
5. CI-Gate „kein `new Function`/`eval`" muss grün bleiben — neuer dynamic-eval-Pfad wäre ein Architektur-Bruch.
6. Doku im selben Commit: roadmap.md + state-of-realm.md + CLAUDE.md spiegeln den realen Stand.

CI macht 1-4 automatisch; 5+6 sind Disziplin.

---

## 10. Wie eine neue Session starten

1. Branch checken: `git status` sollte auf `claude/new-adventure-fetch-branch-NF847` zeigen, working tree clean. Letzter SHA dieser Übergabe ist im Commit-Archiv §4 das letzte Element. **Vor dem Anfangen: `git fetch --all` UND alle Branches durchsehen — `origin/main` ist oft nicht der neueste Stand, weitere Feature-Branches können vorausgehen (siehe Learning #28).**
2. `CLAUDE.md` ist auto-geladen — sofort verfügbar. Diese Doc (`state-of-realm.md`) gezielt lesen wenn größere Entscheidungen anstehen.
3. Bei Bedarf `docs/nexus-dsl.md` lesen für Ring 2 Phase 3+ Details.
4. Falls der Schöpfer fragt „wo stehen wir?" → §3 (Matrix) + §5 (Pfad D Tabelle) zitieren. Stand: Ring 0+1 ✅, Ring 2 Phase 1+2 ✅, Phase 3-7 + Ringe 3-7 + Ringe 8-11 offen.
5. Falls der Schöpfer „los" sagt ohne Spezifikation → Ring 2 Phase 3 (Chat-Parser → DSL) vorschlagen. Das schließt die DSL-Brücke und bereitet die Welten-Modifikation (Ring 8+) vor.
6. Falls der Schöpfer „Welt modifizierbar" fragt → §7 Frage 4 zeigen (Ebenen A/B/C) und Ebene B empfehlen.
7. Falls etwas re-komplexifiziert werden soll → erst Versionslog-Lektion (§2) UND §6 Punkt 8 („Patchwork sammelt sich an") zitieren, dann diskutieren.

### Wichtige Gotchas, die in dieser Session geboren wurden

- **Chunks haben Vertices in absoluten Welt-Koords, `mesh.position = (0,0,0)`.** Niemals in `state.rigidBodies` pushen, sonst überschreibt der Physics-Sync-Loop `mesh.position` mit dem Body-Origin → sichtbare Verschiebung des Chunks.
- **Visual mesh = collision mesh.** Jeder Chunk hat ein `btBvhTriangleMeshShape` aus genau denselben Triangles wie sein `THREE.BufferGeometry`. Wer das ändert, muss BEIDE Pfade berühren.
- **Eine Quelle für Chunk-Geometrie**: `_chunkGeometry()` liefert `chunkWorldSize` und `vertexStep`. Niemals neu berechnen — Drift garantiert.
- **Eine Quelle für Heights**: `_terrainHeightAtWorld(worldX, worldZ, noise, steepness, baseHeight, caveNoise, volcanoNoise)`. Beide Spieler-Pfade (Initial-Welt + Extensions) gehen darüber.
- **CCD muss direkt beim Player-Body-Erzeugen aktiviert werden**, nicht nur in `optimizeCollisions`. Sonst die ersten Sekunden ungeschützt.
- **`pruneDistantChunks` und der Loop-Trigger nutzen `+WORLD_SIZE/2`** im Player-Chunk-Index. Vergessen = nahe Chunks werden als „weit weg" erkannt.
- **`terrain_steepness` und `terrain_base_height` nicht in `dslComposeAtomic`!** Sie würden Welt-Geometrie unter dem Spieler ändern, ohne worldgen zu triggern — Klippen an Nähten zwischen alten und neuen Chunks.

---

## 11. Erweiterte Vision: Welten-Ultiversum (12.05.2026)

Vom Schöpfer am Tag der Ring-2-Entscheidung formuliert. Diese Sektion ist **nicht** Teil von Pfad D, sondern dessen natürliche Verlängerung — sie tritt in Kraft, sobald die Ringe 1-7 stehen.

### 11.1 Kernidee

Eine AnazhRealm-Welt ist kein abgeschlossenes Spiel-Level, sondern ein **persönliches Universum** mit eigenen Regeln (Terrain-Funktion, Physik-Konstanten, Kreatur-Verhalten, Wetter-Modell, Skybox-Identität). Welten leben, evolvieren, wachsen — und können sich begegnen.

| Aspekt | Wie heute | Wie es werden soll |
|---|---|---|
| Welt-Identität | implizit (einzige Welt im localStorage) | explizit, mit `worldId` (UUID) + menschen-lesbarer Slug + Schöpfer-Pubkey |
| Welt-Regeln | hartcodiert in `anazhRealm.js` | DSL-Programme, persistierbar, fork-bar |
| Sichtbarkeit | nur lokal | private / unlisted / public — Schöpfer entscheidet |
| Reise | unmöglich | Spieler tritt in fremde Welt → fremde Regeln greifen, eigene Identität bleibt |
| Fusion | unmöglich | zwei Welten lassen sich „heiraten" — DSL-Bäume mergen, beide Schöpfer dokumentiert |
| Ahnenreihe | unmöglich | jede Welt kennt ihre Vorfahren-Welten (`parentWorlds`), ein Stammbaum entsteht |

### 11.2 Warum die DSL das Fundament ist

Drei Welten zu mergen heißt nicht „mische 3D-Meshes" — das ist sinnlos. Es heißt: **mische die Regel-Programme**. Eine Welt ist ein Set von DSL-Bäumen plus deterministische Seeds plus Spieler-Geschichte. DSL macht das überhaupt erst denkbar:

- AST in JSON → serialisierbar, signierbar, diff-bar
- Primitive begrenzt → keine fremde Welt kann meine Welt killen (Budget-Limits)
- Komponierbar → `merge(weltA, weltB) = ["chain", weltA, weltB]` ist konzeptuell trivial
- CSP-clean → public Sharing ist sicherheitsmäßig vertretbar

### 11.3 Skizzen für Ringe 8-11 (kein Aufwand, nur Form)

| Ring | Pfeiler | Was minimal nötig wäre |
|---|---|---|
| **8** | Welt-Identität & Sichtbarkeit | `worldId` (UUID), `slug`, `creator` (Pubkey-Hash), `visibility ∈ {private, unlisted, public}`, `parentWorlds: [worldId]` als Save-Felder. Lokal: pro `worldId` ein eigener localStorage-Eintrag. „Neue Welt"-Befehl im Chat. |
| **9** | Welt-Export/Import | Welt → JSON-File (DSL-Programme + Seeds + Metadaten, nicht Mesh-Snapshots). Drag-Drop importiert. Import wählt: ersetzen, neu daneben, oder fusionieren. |
| **10** | Welt-Fusion | Zwei DSL-Programm-Sets werden zu einem dritten gemerged. Conflict-Resolution: gewichtete Random-Wahl auf Op-Ebene oder „beide laufen parallel mit Namespace-Präfix". UI: zwei Welt-Slugs eingeben, dritte Welt entsteht mit beiden als `parentWorlds`. |
| **11** | Multi-User-Sync | Spieler A öffnet Welt von B (public). A sieht B's Regeln, A's eigener Charakter bleibt. Realtime-Sync von Spielerposition + Chat über WebRTC (P2P) oder lightweight signaling-Server. Save-Server-Pfad bleibt für lokal-only. |

### 11.4 Was wir JETZT in Ring 2 schon richtig setzen

Auch wenn die Logik für Ringe 8-11 weit entfernt ist, kosten die **Save-Felder** quasi nichts und vermeiden ein Schema-Bruch später:

- `worldId` (UUID v4, beim Erst-Spawn generiert)
- `slug` (Default: zufälliges Wort-Paar, später vom Spieler änderbar)
- `creator` (V1: `"local"`, später Pubkey)
- `visibility` (V1: `"private"`, später vom Spieler änderbar)
- `parentWorlds` (V1: leeres Array)
- `dslAbilities` (DSL-Programm-Liste, ersetzt das alte `abilities: string[]`)

Code für 8-11 kommt später. Das Schema schon jetzt.

### 11.5 Heilige Lektion bleibt gültig

Diese Vision **verschärft** die Lektion, nicht relativiert sie: ein public-shared Multi-Welt-System ohne stabiles Fundament wird desaströs (Bugs werden zu „Welt B hat meine Welt A zerstört"). Pfad D bleibt der Weg — die Ringe 8-11 starten erst, wenn 1-7 grün sind.

---

*Diese Doc ist die Brücke zwischen Sessions. Sie wird bei jeder größeren Entscheidung gepflegt.*
