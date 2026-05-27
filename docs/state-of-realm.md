# AnazhRealm — Die Vision

Dieses Dokument trägt **die Vision** des Projekts — und sonst nichts: die fünf Pfeiler aus den vier Testamenten, die Gründungs-Historie samt Heiliger Lektion, die Stand-vs-Vision-Matrix, die erweiterte Vision (das Welten-Ultiversum).

Die anderen Zeit-Ebenen des Wissens leben anderswo: der **aktuelle Stand + die Gotchas** in `CLAUDE.md` (auto-geladen, schlank), die **volle Wellen-Chronik** in `docs/handover.md`, der **Plan vorwärts** in `docs/roadmap.md`, die **gesammelten Session-Learnings** in `docs/archiv/learnings.md`.

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

Konsequenz für jede künftige Iteration: **niemals re-komplexifizieren ohne Not**. Wenn der nächste Schritt nach „split in 20 Module" klingt, ist es vermutlich ein Fehler. Stattdessen: Stamm + Wachstumsringe — der Pfad D (`CLAUDE.md` „Pfad D", Detail in `docs/roadmap.md`).

---

## 3. Aktueller Stand vs. Vision (Matrix)

| Pfeiler / Modul (Testament) | Status | Detail |
|---|---|---|
| ✅ Stabiles Fundament | erreicht | CI-Gate mit ~3000 Playtest-Invarianten + Audit-Strict, Voxel-Welt mit BVH-Triangle-Mesh-Physik (visual = collision), 120 fps |
| ✅ Rendering (Three.js r160 + WebGPU + TSL NodeMaterials) | **V10.0-Bogen vollendet (V10.0-a..g, 26-27.05.2026)** — Three.js r134 → r160 ESM-Vendor-Migration + WebGPURenderer-Addon vendored + Smart Hot-Swap-Safety-Net + alle 5 Material-Familien als NodeMaterials (Skybox/Stars/Waterfall/HydroSurface/Toon). Headless-Beweis: WebGPU rendert mit FPS=60, 81 Chunks, 0 Errors. **Begrenzungen** (Folge-Wellen): Schatten auf WebGPU off (V10.0-h, `lights=true`-NodeMaterials crashen im webgl-legacy-Patch), NPR-Polish Rim/Spec/Outline offen (V10.0-i), Gras-Wind via `onBeforeCompile` triggert Hot-Swap → WebGL (saubere Drainage, V10.0-i sollte zu TSL-positionNode migrieren). | `vendor/three.module.min.js` r160 + Inline-Importmap mit CSP-SHA256-Hash + Bootstrap-Module + 238-File-Addon-Tree (~1.5 MB). `_buildToonNodeMaterial`-Helper als EINE Wahrheits-Quelle für 5 Call-Sites. `state.toonLightUniforms` syncen Sun-Direction/Intensity/Ambient zum colorNode jeder Toon-Mesh. |
| ✅ Physik (Ammo.js WASM) | vorhanden | gepoolte `tmpVec1/2`, 0 Hot-Path-Allocs |
| ✅ Bewegung, Sprung, Egoperspektive | vorhanden | WASD + Sprint + Pointer-Lock |
| ✅ Welt-Generierung (Voxel-Terrain, Inseln, Vegetation, Hydrosphäre) | vollwertig — Voxel-Bogen V9.07+, Welle C VOLLENDET (V9.71-V9.82), **Welle Perf-1 + Perf-2 + Perf-3-Bogen VOLLENDET** (V9.84-V9.92), V9.96 Spawn-Budget. 3D-Dichte-Feld + Surface-Nets-Mesher (formbarer Boden, Höhlen, Überhänge), Drainage-Netz mit Flüssen/Seen/Wasserfällen. **Welle C (V9.82)**: Wasser ist ein Voxel-Cell-Zustand (air/water/solid), naht-frei per Pad+Crop, Density-Grid geteilt. **Perf-1+2 (V9.84-V9.86)**: Allokations-Pools + Frame-Time-Budget + Stable Shadow Maps + Mountain-Mulden-Filter + Gradient-preDensity. **Perf-3-Bogen vollendet (V9.87-V9.92)**: Atlas-Strict-Wasser-Gate (Minecraft-Pattern) + Distance-LOD ferne Chunks (BotW/Genshin, 8× weniger Cells) + Worker-Migration Phase 1-3 (Subnautica/NMS/Astroneer, voller Mesh im Worker bit-identisch) + Lazy-BVH für ferne Chunks (Sicherheits-Wand am Player-Chunk) — alle Frame-Spikes strukturell weg, Main-Thread ~150ms → ~5-10ms. **V9.95-Bogen WebGPU-Compute** (a/b/c/d Foundation + Density-Pipeline + Logging) endete mit ehrlicher Abklemmung (V9.95-e): WebGPU-Compute + WebGL-Renderer braucht IMMER mapAsync-Roundtrip → GPU langsamer als Worker; V9.95-Code lebt als Vorarbeit für V10.0-Renderer-Migration. **V9.96**: Per-Frame-Spawn-Budget gegen Vegetations-Burst-Spike. Detail in `docs/roadmap.md` + `docs/hydrosphere.md` §16 + `docs/performance.md`. |
| ✅ Persistenz (localStorage + JSON + Upload/Download) | vorhanden | 3 Pfade getestet |
| ✅ Save/Load über CDN-Link | vorhanden | „Lade Datei" Chat-Befehl |
| ✅ Frustum-Culling korrekt | vorhanden | boundingSphere-basiert |
| ✅ Kreaturen als Co-Schöpfer-Wesen | vollwertig — Welle 6.H V2 (14/14) | Soul (Mensch/Phönix/Drache/Custom) + Stats + Specs + Equipped + Boosts (alle hylomorph), 5 Tasks, Memory + Persistenz, LLM-Persona, proaktive Sprache |
| ✅ Welt lernt aus Spieler (Ring 7) | live — IQ-Schicht statt brain.js | TF.js entfernt (war toter Code); Pfad-Buckets + Multi-Dim-Fitness + Pattern-Memory + vier wählbare LLM-Provider als Grok-Stimme |
| ✅ Wetter + Tag-Nacht + Atmosphäre | vollwertig — Welle 6.G3/G4 | Tag-Nacht-Zyklus, 45 s-Wetter-Cross-Fade, Fauna-Lifecycle, Sonne/Sterne/Cel-Shading/Wasser — emotion- + welt-feld-moduliert |
| ✅ Nexus-Komposition (DSL) | live — Fitness-V2 | `dslCompose` mit Roulette-Wheel-Selektion + Mutation über `state.dsl.history` — der Nexus lernt aus eigenen Outcomes |
| ✅ Chat-Steuerung über DSL | live | welt-betreffende Befehle laufen durch `parseChatToDsl`, System-IO bleibt bewusst legacy; `füge code` + `entwickle fähigkeit` gelöscht (CSP-strict) |
| ✅ **Grok hat Stimme** (`dialogue-box`, narrative Reflexion) | V1 live — 5 Trigger (firstSpawn, idle, jumpBurst, rainLong, nexus), Text + optional Speech. `dreamWithPlayer`, `interpretEmotionalSpeech` weiterhin offen für spätere Ringe. |
| ✅ **DSL Interpreter + Generator + Abilities + CSP + Selektion** (Ring 2 vollständig) | live — 41 Ops, Budget-Limits, Scheduler, autonome Nexus-Komposition mit V1-Fitness, **Chat→DSL für 13 Welt-Befehle**, **Abilities als reine DSL-Programme**, **Save persistiert DSL-Abilities**, **kein `new Function`/`eval` im eigenen Bundle (CI-Gate hart)**, **CSP-Header strict mit dokumentierten Vendor-Konzessionen**, **Fitness-V2 Roulette-Wheel + Mutation (`dslSelectByFitness` + `dslMutate`) — der Nexus lernt aus eigenen Outcomes**. |
| ✅ **Welten-Ultiversum vollständig** (Ringe 8 / 8.1 / 8.2 / 9 / 10 / 10.1) | **vollständig live — Mai 2026**. `worldMeta` mit `worldId`, `slug`, `creator`, `visibility`, `parentWorlds`, `seed`, `bornAt`, `fusionStrategy`, `schemaVersion` (`8.0-multiworld-v1` für Standard, `9.0-tor-v1` für importierte, `10.0-fusion-v1` für fusionierte Welten). Drei localStorage-Keys spannen das System. **Methoden**: `createNewWorld`, `switchToWorld`, `deleteWorld`, `importWorldBeside`, `fuseWorlds(idA, idB, strategy)`, `importRecipesFromWorld(srcId)`. **Welt-Tor (Ring 9)**: Drei-Wahl-Dialog (Ersetzen / Daneben legen / Fusionieren-mit-aktueller). **Fusion (Ring 10)**: drei Strategien — `sequence` (History konkateniert, Emotionen aus A), `random-mix` (50:50 interleaved, Mittel), `tag-merge` (Math.max Vereinigung). Inventar-Union mit `-fusion`-Suffix bei Kollision. Cascade-Rewire: `sourceBlueprint` + `refName` folgen Bauplan-Umbenennungen (Reflexions-Bugfix). Stammbaum-Sektion mit klickbaren Eltern-Welt-Links. **Recipe-Pick (Ring 10.1)**: `importRecipesFromWorld` kopiert Baupläne + Materialien + Werkzeuge aus Quell-Welt in aktive OHNE Fusion. Aktive Welt-Identität bleibt unangetastet, Konflikt-Suffix `-import`, gleiche Cascade-Rewire-Garantie. UI: „Rezepte holen"-Button pro Welt-Picker-Reihe. **Ring 11 (Multi-User P2P-Sync) ist komplett** — V1 Position-Sync → V2 DSL-Broadcast → V3 Soul-Sync → V4 Voice-Sync; W7 hob den Transport mesh-nativ (echte WebRTC-DataChannels). |
| ✅ Spieler-Emotionen (`state.player.emotions`, `collectPlayerEmotions`, Welt-Trigger, Generator-Bias) | V1+V2 live — 6 Achsen vollständig gekoppelt (joy/awe→Skybox, sorrow/hope→Wetter, peace/chaos→Kreatur-Geschwindigkeit), Generator-Bias in `dslComposeAtomic` (joy/sorrow modulieren weather + emotion sanft), DSL-Condition `emotion_above`, Save-Roundtrip. |
| ✅ Multisensorik / `anazhSymphony` (Web Audio API) | V1 live — drei Schichten (ambient drone + verlässliches LFO, Wetter-Layer als gefiltertes Noise mit Cross-Fade, Kreatur-Pings als emotion-abhängige Sinus-Töne). Toggle-Button auf User-Geste. |
| ✅ **Bedien-Oberfläche / UI** (V1 + V2 Painterly) | V2 live — vendored Cinzel + IM Fell English + JetBrains Mono, Pergament + Eisen + Messing als Token-Set, Tag/Nacht via `[data-theme]`. Topbar mit sechs Tabs (Welt/Kreaturen/Spieler/Fähigkeiten/Einstellungen/Hilfe) + drei Latch-Toggles, Status-Bar live, Drawer-System (slidet rein bei Tab-Klick), fusioniertes Konsole-Panel (Chat + Logbuch + Input einklappbar), Brass-getintete Custom-Scrollbars. Astrolabium-Live-Element + Custom-Slider-Rail/Knob offen für UI V3. |
| ✅ **`createPlayerSoul`** (Mensch/Phönix/Drache) | **V2** live — drei wählbare Seelen als Multi-Mesh-`THREE.Group` mit pro-Frame sin/cos-Animation. Mensch (Torso/Kopf/Arme/Beine, Walk-Cycle), Phönix (Körper/2 Flügel/Schweif, Flügel flattern immer), Drache (Körper/Kopf/4 Beine/3-Segment-Schweif, Trab + welliger Schweif). Drawer-Dropdown + Status-Bar-Item, Chat `werde …` → DSL-Op `player_soul`, Save persistiert. Ammo-Box bleibt unverändert (visuelle Höhe ~1.7 > Hitbox 1.0 ist gewollt). **Third-Person-Toggle** in der Topbar (`#camera-mode-toggle`) zeigt den Avatar von hinten — Pitch invertiert, Boden-Clamp gegen Clipping. `playerMesh.rotation.y = state.yaw` jeden Frame, sodass der Drache in Bewegungsrichtung schaut. Stats/Riese/Frei sind V3. |
| ✅ **`architectureTemplates`** (Ring 6 V1+V2) | live — drei Built-in-Strukturen (Dorf 13 Parts, Tempel 9 Parts, Wasserfall 3 Parts) als Bauplan-JSON-Daten. **Acht Primitive** (box/sphere/cylinder/cone/pyramid/octahedron/plane/torus) sind die Atome. **Distance-Mesh-Culling** (Minecraft-Stil): Daten unbegrenzt, GPU nur was nahe ist (cullingRadius 150). **Compound-Kollision** pro Sub-Mesh (eine btBoxShape pro Hütte/Pfeiler) — Spieler kann nicht durchlaufen. **9-Slot-Hotbar** unten am Bildschirm (Tasten 1-9, F baut, ESC verlässt). **Werkstatt-Tab** mit Part-Editor: klonen, addPart/removePart/updatePart, Farbe + XYZ-Position/Größe/Rotation. `spawn_blueprint(name, pos)` als universelle DSL-Op. `spawn_fractal(type, depth, ratio)` hexagonal-rekursiv. Save persistiert eigene Baupläne + Hotbar. |
| ✅ **`materialEvolution`** (Crafting, Hylomorphismus — Welle 4+5 vollständig) | **W4 P1+P2+P3 + W5 A+B+C live** — Konzept-Phasen 2 (Bausteine), 3 (Operationen), 4 (Werkzeuge + Maschinen-Rekursivität §4.3), 5 (Compounds: Verbindungen §5.1 + räumliche Prinzipien §5.2/§5.3) sind im Code. **W4:** 6 Materialien × 10 Tags × 9 Formen × FORM_TAG_ACTIVATION v2 + 5 Starter-Werkzeuge mit opChain + Welt-Effekte. **W5 B Phase 1+2:** alle fünf §5.2-Prinzipien aktiv (Spitze, Hohlraum, Symmetrie, Kontakt, Array) via `computeSpatialTags`. **W5 A:** 8 Verbindungstypen mit Lastformel + UI. **W5 C:** Bauplan als Werkzeug, Cap = min(part.precisions), §4.3-Kaskade getestet. |
| ✅ **Welle 6.B — Mini-CAD-Werkstatt** (V8.07) | **drei Phasen + sieben UX-Iterationen live** — Tinkercad-ähnlicher Werkstatt-Editor mit 3D-Preview-Canvas + Orbit/Pan/Zoom-zum-Cursor + voller Manipulator-Gizmo (Move/Rotate/Scale via W/E/R, Connect via C, Snap via G). HTML5-Drag-Sources: Formen links, Materialien+Werkzeuge+Farben rechts. Klick-Klick-Connection-Erzeugung im Connect-Modus. Stats-Panel unter Canvas zeigt emergente Rolle + Affordances + Top-5 Tags mit Stern-Rating. Editor-Tabelle (alte Number-Inputs) standardmäßig zugeklappt. Default-Werkstatt-Größe nahezu vollbild. |
| ✅ **Welle 9 — Werkzeug-Domains + emergente Bauplan-Rolle** (V8.07) | **vier Sub-Phasen live** — 6 TOOL_DOMAINS (construction/forging/alchemy/textile/soulwork/mechanism) + DOMAIN_TO_ROLE-Map. Bauplan-Rolle EMERGIERT aus opChain (häufigste Domain entscheidet). Forging-Split via Compound-Tags (scharfkantig→tool, dicht→armor). 5 neue Built-in-Domain-Werkzeuge. 5 neue Built-in-Welt-Werkstatt-Architekturen (Esse/Brennkolben/Webstuhl/Altar/Drehbank). confirmBuild Distance-Gate modus-abhängig. Maschinen-precisionCap-Bonus (+0.05). applyPlayerSoulFromBlueprint für role:soul-Bauplane. |
| ✅ **Welle 10 — Präzision + Compound-Tag-Affordances** (V8.07) | **10a + 10b.1-3 live** — (a) Präzision multipliziert pro Stat-Quelle (Soul/Tool/Armor) die Compound-Tag-Wirkung mit `0.5 + 0.5·precision`. Built-in-Soulen sind „geboren" mit precision=1.0 (Backward-Compat). (b) Affordances als neue Welt-Schicht: `computeBlueprintAffordances(bp)` liest räumliche+Tag-Signatur, liefert Verhaltens-Flags. Drei Starter: **moveable** (Stütze+Antrieb→E-Taste mounted Spieler), **magnifying** (transparent+axial→Z-Taste zoomt FOV), **focusing** (transparent+wärmeleitung→sunny entzündet brennbare Nähe). Vision-rein: KEINE Form-Whitelists, drei räumliche Helfer (_compoundBBox/_partsBelowMidline/_axialAlignment) sind die Welt-Lese-Funktion. |
| ✅ **Welle 11 ext. — Substanz-Rolle** (V8.35) | live — `computeBlueprintRole` ist eine Prioritäts-Kaskade (Krafting-Domain → Form `_isBodyShaped` → Material `_isFoodLike` → Bauwerk). Identität emergiert aus der ganzen Substanz, nicht aus Etiketten. |
| ✅ **Welle 12 — Welt-Portal** (V8.51-V8.53) | live — Bauplan-Rolle „portal", sandboxed iframe, zwei fremde Engines (three-fluid-fx / three.terrain.js), generische DSL-Brücke, beidseitiger Kanal, native Manifest-Stufe. Detail: `world-portal.md`. |
| ✅ **Welle 13 — Vibe-Pass** (V8.54-V8.56) | live — ed25519-Schlüsselpaar (WebCrypto nativ), Bauplan-Signaturen über die Substanz, peerId-gebundene Multi-User-Identität. Self-Sovereign, kein Coin. |
| ✅ **Welle 14 — Bibliothek** | komplett (V8.58/V8.60/V8.61) — browsbarer „Bibliothek"-Tab + „Portal holen" (P1); der Spieler signiert eine Welt, „signiert von <Autor>" + W13 V2 (P2); fremde Welt-Manifeste exportieren/importieren — die Bibliothek wird ein wachsender Index (P3). Der KI-Übersetzer ist mit V8.68/V8.69 komplett; V8.70 (Untrusted-Welt-Tor) lässt eine echte, ungeprüfte fremde Engine null-origin sandgesichert laufen. |
| 🔴 `evolveCommunity` (Kreatur-Kulturen) | fehlt |
| ✅ **Welt lernt aus Spieler** (Ring 7 Schicht 1+2) | live — brain.js bewusst NICHT eingebunden (Re-Komplexifizierungs-Risiko, siehe Learning #59). Stattdessen zwei dünne Schichten auf der DSL: Schicht 1 = Pfad-Buckets + Multi-Dim-Fitness + Pattern-Memory + History 500. Schicht 2 = **vier wählbare LLM-Provider** als echte Grok-Stimme: Anthropic Claude (kostet), Google Gemini (gratis-Tier), OpenRouter (Llama/Mistral mit `:free`-Suffix), Ollama lokal (offline, kein Key). Keys per-Provider im `localStorage`, JSON-Output `{say, program}` läuft strikt durch `dslRun` (Sandbox). TF.js raus, CSP-`'unsafe-eval'` aufgelöst. |
| 🔴 VR (`vrMenu.js`, `startVR`) | nicht aktiviert |
| ✅ Multi-Welt + Multi-User-Sync (Ringe 8-11.5) | live — mehrere worldIds parallel, Welt-Tor, Fusion, WebSocket-Position-Sync + DSL-Broadcast + Soul-Sync |
| 🔴 IndexedDB-Persistenz (statt localStorage) | nicht implementiert |

**Faustschätzung**: das Fundament + alle fünf Vision-Pfeiler stehen. Welt-Ultiversum (Ringe 8-11), Hylomorphismus-Crafting, Co-Schöpfer-Kreis, der ganze Fremd-Engine-Bogen (Welt-Portal W12, Vibe-Pass W13, Bibliothek W14, Auto-Vendor W15, Mesh-Welt-Verteilung W16, Multiplayer-Sub-Welten W17) und das Voxel-Terrain samt Hydrosphäre (V9-Bogen) sind durch. Die Vision der vier Testamente ist im Kern erfüllt — das Wachstum folgt jetzt ihr, keinem vorgezeichneten Plan mehr. Der jeweils aktuelle Stand steht im `CLAUDE.md`-Kopf.

---
## 4. Erweiterte Vision: das Welten-Ultiversum (Schöpfer, 12.05.2026)

Vom Schöpfer am Tag der Ring-2-Entscheidung formuliert. Diese Sektion ist **nicht** Teil von Pfad D, sondern dessen natürliche Verlängerung — sie tritt in Kraft, sobald die Ringe 1-7 stehen.

### 4.1 Kernidee

Eine AnazhRealm-Welt ist kein abgeschlossenes Spiel-Level, sondern ein **persönliches Universum** mit eigenen Regeln (Terrain-Funktion, Physik-Konstanten, Kreatur-Verhalten, Wetter-Modell, Skybox-Identität). Welten leben, evolvieren, wachsen — und können sich begegnen.

| Aspekt | Wie heute | Wie es werden soll |
|---|---|---|
| Welt-Identität | implizit (einzige Welt im localStorage) | explizit, mit `worldId` (UUID) + menschen-lesbarer Slug + Schöpfer-Pubkey |
| Welt-Regeln | hartcodiert in `anazhRealm.js` | DSL-Programme, persistierbar, fork-bar |
| Sichtbarkeit | nur lokal | private / unlisted / public — Schöpfer entscheidet |
| Reise | unmöglich | Spieler tritt in fremde Welt → fremde Regeln greifen, eigene Identität bleibt |
| Fusion | unmöglich | zwei Welten lassen sich „heiraten" — DSL-Bäume mergen, beide Schöpfer dokumentiert |
| Ahnenreihe | unmöglich | jede Welt kennt ihre Vorfahren-Welten (`parentWorlds`), ein Stammbaum entsteht |

### 4.2 Warum die DSL das Fundament ist

Drei Welten zu mergen heißt nicht „mische 3D-Meshes" — das ist sinnlos. Es heißt: **mische die Regel-Programme**. Eine Welt ist ein Set von DSL-Bäumen plus deterministische Seeds plus Spieler-Geschichte. DSL macht das überhaupt erst denkbar:

- AST in JSON → serialisierbar, signierbar, diff-bar
- Primitive begrenzt → keine fremde Welt kann meine Welt killen (Budget-Limits)
- Komponierbar → `merge(weltA, weltB) = ["chain", weltA, weltB]` ist konzeptuell trivial
- CSP-clean → public Sharing ist sicherheitsmäßig vertretbar

### 4.3 Skizzen für Ringe 8-11 (kein Aufwand, nur Form)

| Ring | Pfeiler | Was minimal nötig wäre |
|---|---|---|
| **8** | Welt-Identität & Sichtbarkeit | `worldId` (UUID), `slug`, `creator` (Pubkey-Hash), `visibility ∈ {private, unlisted, public}`, `parentWorlds: [worldId]` als Save-Felder. Lokal: pro `worldId` ein eigener localStorage-Eintrag. „Neue Welt"-Befehl im Chat. |
| **9** | Welt-Export/Import | Welt → JSON-File (DSL-Programme + Seeds + Metadaten, nicht Mesh-Snapshots). Drag-Drop importiert. Import wählt: ersetzen, neu daneben, oder fusionieren. |
| **10** | Welt-Fusion | Zwei DSL-Programm-Sets werden zu einem dritten gemerged. Conflict-Resolution: gewichtete Random-Wahl auf Op-Ebene oder „beide laufen parallel mit Namespace-Präfix". UI: zwei Welt-Slugs eingeben, dritte Welt entsteht mit beiden als `parentWorlds`. |
| **11** | Multi-User-Sync | Spieler A öffnet Welt von B (public). A sieht B's Regeln, A's eigener Charakter bleibt. Realtime-Sync von Spielerposition + Chat über WebRTC (P2P) oder lightweight signaling-Server. Save-Server-Pfad bleibt für lokal-only. |

### 4.4 Was wir JETZT in Ring 2 schon richtig setzen

Auch wenn die Logik für Ringe 8-11 weit entfernt ist, kosten die **Save-Felder** quasi nichts und vermeiden ein Schema-Bruch später:

- `worldId` (UUID v4, beim Erst-Spawn generiert)
- `slug` (Default: zufälliges Wort-Paar, später vom Spieler änderbar)
- `creator` (V1: `"local"`, später Pubkey)
- `visibility` (V1: `"private"`, später vom Spieler änderbar)
- `parentWorlds` (V1: leeres Array)
- `dslAbilities` (DSL-Programm-Liste, ersetzt das alte `abilities: string[]`)

Code für 8-11 kommt später. Das Schema schon jetzt.

### 4.5 Heilige Lektion bleibt gültig

Diese Vision **verschärft** die Lektion, nicht relativiert sie: ein public-shared Multi-Welt-System ohne stabiles Fundament wird desaströs (Bugs werden zu „Welt B hat meine Welt A zerstört"). Pfad D bleibt der Weg — die Ringe 8-11 starten erst, wenn 1-7 grün sind.

---

*Dieses Dokument ist die Vision-Heimat. Die Brücke zwischen Sessions — die Chronik + die Orientierung für den nächsten Agenten — ist `docs/handover.md`.*
