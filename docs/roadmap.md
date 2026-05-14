# AnazhRealm Roadmap — Vollumfänglich

Stand: 12.05.2026 (nach Chunk-Physik-Refactor `e612c60`).

Diese Doc beschreibt das **gesamte Projekt vom heutigen Stand bis zum Vision-Endziel** (Welten-Ultiversum). Sie ergänzt `state-of-realm.md` (Was/Warum) um eine puren Plan-Sicht (Wann/Wie). Aufwandsschätzungen sind realistische Tage für eine fokussierte Claude-Session pro Ring/Phase; gerechnet wird linear, ohne Puffer.

**Wichtig**: diese Roadmap ist ein lebendes Dokument. Sie wird nach jedem Ring-Abschluss aktualisiert. Pfeile zwischen Ringen sind weiche Abhängigkeiten — Reihenfolge kann sich verschieben.

---

## 1. Wo wir stehen (Mai 2026)

✅ Ring 0-7 + Welle 1-5 + Editor-Konsistenz-Bugfixes sind live. Chunk-Physik nutzt seit `e612c60` `btBvhTriangleMeshShape` (visuelles Mesh = Collider). 120 fps im Browser, **527/527 Playtest-Invarianten grün**. Save-Schema mit `worldMeta` (worldId, slug, visibility, parentWorlds) + `materials` + `playerTools` + `tools` (eigene Werkzeug-Baupläne) + `worldJournal` + `blueprints[].connections` + `blueprints[].role + toolMeta`.

Aus den 5 Vision-Pfeilern (Symbiose, Emotion, Fraktal, Multisensorik, Stimme) sind alle fünf in V1+ angekommen. **Hylomorphismus-Crafting (Wellen 4+5) ist vollständig**: Substanz-Schicht (Materialien als Tag-Profile), Form-Aktivierung (9×10 Matrix), Werkzeug-Präzision (opChain als Geschichte), räumliche Emergenz (5 Konzept-§5.2-Prinzipien), Verbindungstypen (8 aus §5.1), Maschinen-Rekursivität (§4.3 — Bauplan kann Werkzeug sein). Was noch fehlt: visuelle Verbindungs-Linien, Brech-Mechanik, Energiequellen für Maschinen.

---

## 2. Pfad-D Übersicht (Ringe 0-11+)

| Ring | Pfeiler | Status | Aufwand | Vorbed. |
|---|---|---|---|---|
| 0 | Stabiles Fundament (Bewegung, Physik, Chunks, Save, CI) | ✅ erledigt | – | – |
| 1 | Grok-Stimme (`dialogue-box`, narrative Reflexion) | ✅ V1 live | – | – |
| 2 | DSL als gemeinsame Sprache | ✅ Phase 1-7 vollständig | – | – |
| 3 | Player-Emotionen → Welt | ✅ V1+V2 live | – | – |
| 4 | `anazhSymphony` V1 (Web Audio) | ✅ V1 live | – | – |
| UI | Bedien-Oberfläche (Painterly) | ✅ V1+V2 live, V3 optional | 2-3 h Rest | – |
| 5 | `createPlayerSoul` (Mensch/Phönix/Drache) | 🔴 offen | 1-2 d | – |
| 6 | `architectureTemplates` V1+V2 (Bauplan-Universum mit Hotbar + Werkstatt) | ✅ V1+V2 live | – | Ring 2 Phase 3 |
| 7 | **IQ-Schicht statt brain.js** (lernt aus Verhalten + Emotion + 4 LLM-Provider) | ✅ Schicht 1+2 live | – | Ring 3 + Ring 2 Phase 3 |
| W1 | **Welt-Journal + LLM-Selbstwissen** (Welt erinnert, weiß wer sie ist) | ✅ live | – | Ring 7 |
| W2 | **Schöpfer-Ops + Fraktale Baupläne** (define_blueprint/ability, blueprint-Refs) | ✅ live | – | Ring 6.6 |
| W3 | **Welt-Initiative + Welt-Tor** (Grok V2-Trigger, Welt-Info, Teilen/Empfangen) | ✅ live | – | W1 |
| W4 | **Hylomorphismus atomar** — Materialien + Aktivierungs-Matrix + Werkzeuge | ✅ P1+P2+P3 live | – | Ring 6 + Ring 7 |
| W5 | **Hylomorphismus räumlich + mechanisch + rekursiv** — Verbindungen (§5.1) + 5 räumliche Prinzipien (§5.2) + Bauplan-als-Werkzeug (§4.3) | ✅ A+B+C live | – | W4 |
| 8 | Welt-Identität als Multi-Welt-Verwaltung (mehrere worldIds parallel) | ✅ **8 + 8.1 + 8.2 live** — Welt-Index + Per-Welt-Save + Switch/Create/Delete + Person-Übernahme + Per-Welt-Seed + Spieler-Position-Restore + Status-Bar-Welt | – | W3 |
| 9 | Welt-Export/Import (erweitert) — Drei-Wahl Ersetzen/Daneben/Fusionieren | ✅ **live** — `<dialog>` mit drei Aktionen, `importWorldBeside` mit parentWorlds-Spur + Slug-Kollisions-Auflösung + Witness-Journal, Fusion-Button disabled bis Ring 10 | – | Ring 8 |
| 10 | Welt-Fusion + Cascade-Rewire (zwei DSL-Programm-Sets mergen mit parentWorlds) | ✅ **live** — drei Strategien (sequence/random-mix/tag-merge), 2-Spalten-Dialog, Stammbaum mit klickbaren Eltern-Welt-Links, Cascade-Bugfix (sourceBlueprint + refName folgen Rename), Schema 10.0-fusion-v1 | – | Ring 9 |
| 10.1 | Rezepte aus anderer Welt holen (ohne Fusion) | ✅ **live** — `importRecipesFromWorld(srcId)`, 1:1-Inhalt, `-import`-Suffix bei Kollision, Cascade-Rewire wie Fusion, „Rezepte holen"-Button pro Welt-Picker-Reihe | – | Ring 10 |
| 10.5 | Welt-Modifizierbarkeit (pro-Chunk DSL-Delta) | ✅ **live** — `state.worldMeta.chunkDeltas` mit FIFO-Cap 100/Chunk, `modify_terrain(x, z, r, dh)` mit Smoothstep-Falloff, `_rebuildChunkPhysics` aus aktuellen Vertices, `applyChunkDelta` als Hook in `ensureChunkAt`, Chat `grabe loch`/`hebe hügel`, Schema `10.5-chunk-delta-v1` | – | Ring 10 |
| 11 V1 | Multi-User Position-Sync via WebSocket-Broker | ✅ **live** — `signaling-server.js` (RFC-6455 von Hand, zero deps), `state.p2p` mit peers-Map, 30 Hz pos-Broadcast, Remote-Peer-Avatare als Cone+Sphere-Group (HSL-Hash aus peerId), UI-Toggle in Einstellungen, CSP um ws:// erweitert, Sandbox-Grenze (KEIN p2p-DSL-Op) — KEIN DSL-Sync | – | Ring 10.5 |
| 11 V2 | DSL-AST-Broadcast für Welt-Synchronisation | ✅ **live** — Chat-DSL eines Spielers wird via `p2pBroadcastDsl(program)` an alle Mitspieler gesendet, jeder Empfänger ruft `dslRun(program, {source: "remote:<peerId>"})` auf. Drei Loop-Schutz-Schichten (source-Check, peerId-Filter, Server-except-Sender). LLM-/Nexus-DSL bleibt lokal. modify_terrain + weather + spawn_creature synchronisieren beide Welten. | – | Ring 11 V1 |
| 11 V2.1 | LAN-Fähigkeit + Sync-Korrektheit (Bug-Fixes) | ✅ **live** — signaling-server bind 0.0.0.0 (LAN reachable, LAN-IPs werden geloggt), CSP `connect-src ws: wss:` allgemein (statt enge IP-Whitelist), `state.p2p.roomOverride` für ad-hoc-Räume, spawn_*-Chat-Patterns embedden Position+Seed bei Build-Zeit (Empfänger spawnt am SENDER-Ort, gleicher Seed → gleiche Geometrie), `NON_BROADCASTABLE_OPS`-Set für Spieler-private Ops (player_jump_power, player_speed, player_size_mul, player_soul, set_visible werden NIE gesendet) | – | Ring 11 V2 |
| 11.5 | Intuitiver Multi-User-Setup (Modus-Wahl + Einladungs-Code) | ✅ **live** — Neue-Welt-Dialog mit Modus (Allein/Mit-anderen) + Rolle (Host/Joinen). Host: Banner mit `anazh://lan-ip:port/worldId` + Copy-Button, Auto-P2P-Start nach Reload. Join: temp-WS sendet `world-request` → empfängt `world-snapshot` vom Host → `_importGuestWorld` schreibt Welt unter host-worldId mit `role:"guest"`+`hostInfo`, Auto-P2P-Start nach Reload. Server: targeted-delivery via `{to: peerId}`, LAN-Adressen im welcome, Frame-Cap 1 MiB. Schema `11.5-multiuser-v1`. | – | Ring 11 V2.1 |
| W6 | **Crafting-Polish + UX + Stats + Welt-Sinne + Kreaturen-Aufträge** — acht Sub-Blöcke (A–H), Brainstorm + Entscheidungen in `docs/wave-6-design.md` | 🔴 offen, bewusst nachgelagert | 22-28 Sessions verteilt auf acht Themen-Blöcke | W5 + Rings 8-11.5 |
| W7 | **Kollektive Welt-Erkenntnis (Distributed Compute)** — Skalierungs-Block, vision-treues Modell für Multi-User-Last-Verteilung: Distributed Chunk-Pre-Gen, LLM-Pool über Peers, Shared Compute-Cache, optional Public-Lobby für „join random world" | 🔴 offen — Skizze in `docs/system-audit.md` §7 | 6-8 Sessions | W6 (insb. 6.H Kreaturen-Aufträge) |

**Summe verbleibend**: ~30-40 Arbeitstage in fokussierten Sessions. Verteilt auf 2-4 Monate realistisch.

---

## 3. Detail pro Ring

### Ring 2: DSL als Brücke (Restarbeit Phase 3-7)

**Ziel**: Mensch und Nexus teilen vollständig eine Sprache. Alle Chat-Befehle gehen durch dieselben DSL-Primitives, die der Generator nutzt. `new Function`/`eval` komplett raus, strict CSP wird möglich.

**Phase 3 — Chat-Parser → DSL** (1-2 d)

**Phase 3a ✅ erledigt** (dieser Commit): `parseChatToDsl(text)` und `chatSuggest(text)` (Levenshtein, Distanz ≤ 4) live. Acht welt-betreffende Chat-Befehle laufen jetzt durch denselben Interpreter wie der Nexus:

| Chat | DSL |
|---|---|
| `setze wetter sunny/rainy` | `["weather", $1]` |
| `spawne kreaturen <n>` | `["repeat", n, ["spawn_creature", ["at_player"], 1, "happy"]]` |
| `ändere sternenhimmel <color>` | `["skybox_color", color]` |
| `setze terrain steilheit <v>` | `["terrain_steepness", v]` |
| `setze terrain basishöhe <v>` | `["terrain_base_height", v]` |
| `erhöhe sprungkraft um <n>` | `["player_jump_power", current+n]` |
| `heile welt` | `["chain", ["weather","sunny"], ["creatures_emotion","happy"], ["gravity",-14.715]]` |
| `vereine chaos ordnung` | `["chain", ["terrain_steepness",1.0], ["creatures_color","white"]]` |

Sechs neue Playtest-Invarianten verifizieren Parser, End-to-end-Routing und Levenshtein-Vorschlag. `state.dsl.lastUserProgram` + `state.dsl.lastUserOutcome` halten den letzten Menschen-Befehl für Diagnose/Persistenz fest.

**Phase 3b ✅ erledigt** (dieser Commit): Zwei neue DSL-Primitives `set_visible(target, visible)` (Whitelist „terrain"/„creatures", unbekannte Targets werden geloggt) und `record_narrative(text)` (Cap 500 Zeichen, schreibt in `state.knowledgeBase`). Fünf neue Chat-Patterns: `boden/kreaturen × aktivieren/deaktivieren` + `erzähle <text>`. Vier neue Playtest-Invarianten. Damit gehen 13 von ~25 Chat-Befehlen durch die DSL.

**Verbleibend nicht-migriert** (Phase 4/5 oder Ring 4):
- `lerne/entwickle fähigkeit`, `füge code` → Phase 5 mit `new Function`-Cleanup + Save-Migration
- `aktiviere anazh-symphonie` → Ring 4 (Web Audio)
- System-IO (`speichere/lade/lade datei`), `aktiviere version`, `füge trainingsdaten`, `behebe physik-tunneling`, `optimiere physik`, `boden nicht sichtbar`, `aktiviere/deaktiviere debug-logs`, `spawne neue welt` bleiben bewusst legacy (System-Ops, kein Welt-Effekt)

**Phase 4 ✅ erledigt** (dieser Commit-Block): `buildStateSnapshot` persistiert `dslAbilities` als Quelle der Wahrheit, die Legacy-`abilities`-Namensliste fliegt raus. `loadState` rehydriert das Array UND legt die zugehörigen `state.abilities[name]`-Wrapper an, damit „Führe Fähigkeit aus" und Keyboard-Loop nach Reload weiter funktionieren. Alte Saves (mit `abilities: string[]`) gehen weiter durch `restoreAbility` → Legacy-Namen-Mapping. `worldMeta.schemaVersion === "7.66-dsl-v1"` bleibt das Vertrags-Feld.

**Phase 5 ✅ erledigt** (dieser Commit-Block): `createDynamicAbility`, `codeParser`, `developAdvancedPhysics`, `developAdvancedRenderer` gelöscht. Chat-Befehle `füge code` und `entwickle fähigkeit` raus. `learnAbility` produziert DSL-Programme via `parseAbilityDescriptionToDsl` (5 Pattern + Catch-All als `say`). `addNewAbility` akzeptiert ausschließlich DSL-Arrays. `aktiviere anazh-symphonie` wird als statisches DSL-Programm gespeichert (V1-Stub, echte Web-Audio mit Ring 4). `processOptimization` ruft direkt `optimizePhysics()`, der Legacy-`evolution.impl`-Pfad in der Loop fliegt raus. CI-Gate „kein `new Function`/`eval` im Bundle" hart aktiviert (fail), Playtest verifiziert dass die toten Methoden weg sind.

**Phase 6 ✅ erledigt** (dieser Commit): `<meta http-equiv="Content-Security-Policy">` in `index.html` aktiviert. `default-src 'self'`, `object-src 'none'`, `base-uri 'self'` strict. Drei dokumentierte Konzessionen:
- `script-src 'self' 'wasm-unsafe-eval' 'unsafe-eval'` — Ammo (WASM) braucht das erste, TF.js (WebGL-Kernel-Compilation) das zweite. Unser eigener Code nutzt **kein** eval; CI-Gate „Verbotenes dynamisches Auswerten" sichert das hart.
- `style-src 'self' 'unsafe-inline'` — Three.js setzt Inline-Styles aufs `<canvas>` für Größe/Position. Risiko gering, kein User-CSS injizierbar.
- `worker-src 'self' blob:` — TF.js erstellt einen Backend-Worker aus blob-URL.

Plus: inline-styles aus `index.html` entfernt (`#fps`, `#state-file-input`), Inline-Bootstrap-`<script>` durch `<script src="anazhRealm.js" defer>` ersetzt. Sechs neue Playtest-Invarianten verifizieren CSP-Meta + dass über die Laufzeit keine CSP-Violations im Console-Buffer landen.

**Phase 7 ✅ erledigt** (dieser Commit): `dslSelectByFitness` (Roulette-Wheel über `state.dsl.history`; Gewicht `max(0.05, 1 − fpsDamage/100)`, Floor verhindert Aussterben), `dslMutate` (Sub-AST-Replacement, ±20 % Numeric-Shift, Chain-Wurzel-Schutz), `dslCompose({ historyProbability })` defaults auf 0.3 mit History ≥ 3 — der Nexus startet random, lernt aber zunehmend aus eigenen Outcomes. Fünf neue Playtest-Invarianten: high-fitness wird ≥ 2× häufiger gewählt (gemessen 11.2×), Selektion null-frei, Mutation behält `chain`-Root + Array-Sub-Strukturen, Compose nutzt History bei `historyProbability=1` zu 30/30.

**Akzeptanz Ring 2 vollständig** ✅ — alle Phasen 1-7 abgeschlossen.

---

### Ring 3: Player-Emotionen → Welt

**Ziel**: Spieler-Emotionen sind ein zentraler Welt-Treiber, nicht nur ein UI-Detail.

**V1 ✅ erledigt** (dieser Commit):
- `state.player.emotions = { joy, awe, sorrow, hope, peace, chaos }` (6 Achsen, 0..1)
- `collectPlayerEmotions(text)` regelbasiert: deutsche Stichwörter (z. B. „schön/fröhlich/liebe" → joy, „traurig/dunkel/trauer" → sorrow, „chaos/wild/sturm" → chaos). Jeder Treffer +0.1, geclampt.
- Eingehängt in `processChatCommand` → jeder Chat-Befehl füttert die Achsen.
- `updatePlayerEmotions(currentTime)` läuft im Hauptloop: Decay 0.005/s, drei Schwellen-Trigger als DSL-Programme (joy > 0.7 → `["skybox_color", "#f7d358"]`, sorrow > 0.7 → `["weather", "rainy"]`, chaos > 0.7 → `["creatures_speed_mul", 1.5]`). 30 s Cooldown pro Achse verhindert Spam.
- Neue DSL-Condition `emotion_above(name, threshold)` — der Nexus kann selbst auf Emotionen reagieren.
- Save persistiert `playerEmotions`. Sieben neue Playtest-Invarianten (Collect, Decay, Trigger, Cooldown, DSL-Cond, Save).

**V2 ✅ erledigt** (dieser Commit): drei stille Achsen (awe, hope, peace) bekommen Welt-Kopplungen — awe→`["skybox_color", "#d4a3ff"]` (magisches Lila), hope→`["chain", ["weather", "sunny"], ["creatures_emotion", "happy"]]` (Licht), peace→`["creatures_speed_mul", 0.7]` (Beruhigung). Generator-Bias in `dslComposeAtomic`: joy verschiebt sunny-/happy-Wahrscheinlichkeit nach oben, sorrow nach unten (±0.3 sanft, Clamp 0.05..0.95). Fünf neue Playtest-Invarianten verifizieren die drei neuen Trigger und die Generator-Bias-Richtung statistisch (1000 Samples, Ratio > 2× gemessen). **Bug nebenbei gefunden und gefixt**: `skybox_color`-DSL-Op schrieb in `tintColor`, das Skybox-Uniform heißt aber `nebulaColor` — war seit Phase 1 stiller No-Op.

**V3 offen** (später, wenn nötig):
- Mehr Achsen (`longing`, `melancholy`) wenn Vokabular es einfordert.
- Grok-Stimme: neuer Trigger „emotionShift" wenn eine Achse abrupt steigt.

**Akzeptanz** ✅: 5 Min chatten mit emotionalem Vokabular → die Welt antwortet sichtbar (Skybox, Wetter, Kreatur-Geschwindigkeit).

---

### Ring 4: anazhSymphony

**Ziel**: Multisensorik. Welt hat Klang, der mit ihrem Zustand atmet.

**V1 ✅ erledigt** (dieser Commit):
- `state.symphony = { ctx, enabled, masterGain, ambient, weather, lastWeather, creaturePingCount }` lazy initialisiert.
- Drei Klangschichten gebaut:
  - **Ambient**: zwei verstimmte Sägezahn-Oszillatoren (110 / 111.5 Hz) → langsame Schwebung. Tiefpass-Filter mit LFO (0.08 Hz) auf Cutoff. Atmet konstant.
  - **Wetter**: White-Noise-Loop → Bandpass 1500 Hz → Gain. Bei `weather === "rainy"` Cross-Fade auf 0.18, sunny → 0. `symphonyTick()` ist idempotent (nur Wechsel triggern Rampe).
  - **Kreatur-Pings**: `playCreaturePing(emotion)` mit kurzem Sinus + ADSR-Envelope. Happy = 659 Hz (E5), sad = 220 Hz (A3). Aufgerufen aus `spawnCreatureAt` (DSL-Spawns), initialer Spawn-Loop ausgenommen.
- Toggle-Button `#anazh-symphony-toggle` (analog Grok-Stimme): erster Klick startet AudioContext, weitere Klicks muten via `masterGain`.
- `disposeSymphony()` räumt komplett auf (osc.stop, ctx.close, alle Referenzen null). Acht neue Playtest-Invarianten.
- Headless-Tests funktionieren mit `--autoplay-policy=no-user-gesture-required` als Puppeteer-Arg.

**V2 offen** (später, klein, additiv):
- Emotion-Modulation der Klangschichten: hohe joy → Filter-Cutoff höher (heller), hohe sorrow → tiefer (dunkler). Höhe peace → Master-Gain leiser, chaos → LFO schneller.
- Player-Y-Position moduliert Ambient-Pitch (höher oben → höher in Frequenz).
- Reverb-Send für Echo-Effekte (Halle bei großer Höhe).

**Akzeptanz** ✅: Spieler hört die Welt — alles synthetisiert, kein Asset geladen, keine externe Library.

---

### Bedien-Oberfläche / UI (V1+V2 live, V3 offen)

**Ziel**: Sichtbare Welt-Steuerung — was im Code passiert, soll auch ohne DevTools fühlbar sein.

**V1 ✅ erledigt** (4 Commits): Status-Panel mit Welt-Daten + Emotion-Balken, Quick-Action-Buttons, Hilfe-Drawer mit allen Chat-Befehlen klickbar, Abilities-Liste mit Run-Button + Source-Tag, Save/Load-Aktionen, Live-Tuning-Slider für emotionThreshold/Decay/Cooldown. DOM-Cache + 0.4 s Throttle.

**V2 ✅ erledigt** (3 Commits — Mockup-Adaption):
- **Painterly Identity** (`36d2364`): vendored Cinzel + IM Fell English + JetBrains Mono (~190 KB Latin-Subset, CSP-strict), Color-Tokens als CSS-Custom-Properties (`--parch-*` / `--iron-*` / `--brass-*` / `--violet-*` + Emotion-Farben), Tag/Nacht-Theme via `body[data-theme]` mit localStorage-Persistenz, Pergament-Hintergrund (SVG-Noise) + Eisen-Rahmen mit Eckschrauben.
- **Topbar + Tab-Drawer-System** (`2eb6771`): aus dem langen Status-Panel werden sechs Drawer pro Tab plus eine Topbar mit Titel + Tabs + Latch-Toggles plus eine Status-Bar mit Live-Welt-Daten. `state.uiActiveDrawer` trackt den aktiven Tab.
- **Konsole + Brass-Scrollbars** (`4f638cb`): Chat + Logbuch + Input werden ein einklappbares `#console`-Panel links. Custom-Brass-Scrollbars für alle scrollbaren Container (Webkit + Firefox).

**V3 offen** (~2-3 h, optional/Polish):
- **Astrolabium** als rotierendes SVG-Live-Element in der Topbar (rotierende Ringe als „Anazh-Stein"). Live-Daten: Spieler-Position, Wetter, Anomalien.
- **Custom-Slider mit Rail/Knob** statt nativem `<input type="range">` — passt zum Painterly-Aesthetic. Drei Slider in Einstellungen-Drawer + zwei potenzielle für Terrain (Welt-Drawer).
- **Toggle-Cards für Wetter** mit Icon (Sonne/Regen) statt Buttons.
- **Logbuch separat darstellen** mit Zeitstempeln aus `state.logBuffer` (statt rohem Log-String).
- **Welt-Modifikatoren in Welt-Drawer**: Slider für Terrain-Steilheit / Basishöhe (mit Klippen-Warnung, weil Welt-Regen nur bei nächstem Worldgen greift).

**Akzeptanz V1+V2** ✅: Welt-Status, Emotionen, Fähigkeiten und alle Befehle ohne DevTools sichtbar und manipulierbar. Painterly-Theme spiegelt die Vision (Pergament + Eisen + Portal-Violett).

---

### Ring 5: createPlayerSoul (~1-2 d)

**Ziel**: Spieler ist nicht mehr der rote Würfel. Er wählt seine Form.

- Spielstart-Menü (`<dialog>`-Element): „Wer bist du?" mit 4 Optionen + „Frei" (random)
  - **Mensch**: speed 6, jump 12, size 1, color skin
  - **Phönix**: speed 8, jump 18, size 0.8, color orange + leichtes Glühen
  - **Drache**: speed 5, jump 14, size 1.3, color dunkelgrün
  - **Riese**: speed 4, jump 10, size 2.0, color grau
- `state.playerSoul` persistiert in localStorage und im Save
- Mesh wird entsprechend gestaucht/gefärbt (kein neues Modell — Box-Geometry mit Skalierung + Farbe reicht für V1)
- Spätere Erweiterung: Soul-spezifische DSL-Ops (z. B. `phoenix_dash`, `dragon_breathe`)

**Akzeptanz**: nach Auswahl spielt sich die Welt fühlbar anders — Phönix springt höher, Riese ist schwerer.

---

### Ring 6: architectureTemplates V1 (~2 d)

**Ziel**: Aus „Spawne Häuser" wird wirkliche Architektur.

- Drei DSL-Primitive (zusätzlich zum bestehenden Pool):
  - `spawn_village(position, size)`: 3-8 Boxen unterschiedlicher Größe in lockerer Anordnung, Holz-/Stein-Farbtöne
  - `spawn_temple(position)`: zentrale Säule + 4 umgebende Säulen + Plattform
  - `spawn_waterfall(position, height)`: vertikale Linie von THREE.PointsMaterial-Partikeln, fließt nach unten
- Alle prozedural, kein Asset. Geometrie aus simplen Three.js-Meshes.
- Generator-Pool um diese drei erweitern (geringe Gewichte, ~2-3 % je)
- Chat: „bau ein dorf bei mir" → `["spawn_village", ["near_player", 20], 5]`

**Akzeptanz**: nach 5 Min Nexus-Evolution stehen 1-2 Dörfer oder Tempel in der Welt; via Chat kann der Spieler gezielt eines bauen.

---

### Ring 7: brain.js-Welt (~3-4 d)

**Ziel**: Welt lernt selbst aus dem Spieler.

- `brain.js` aus `vendor/` einbinden (kleines Neural-Net-Modul, ~20 KB)
- `state.worldNeural`: 2-Schicht Net, Input = Spieler-Position-Trajectory (letzte N Punkte) + aktuelle Emotionen, Output = Empfehlung (DSL-Op + Argumente)
- Training: jeden Frame `state.dsl.history` als Trainings-Set nutzen — Programme mit hoher Fitness werden positiver beispielhaft
- Vorhersage: alle 30 s wird der Output abgefragt und als zusätzlicher Nexus-Vorschlag in die Evolution-Queue gelegt
- Test: nach 10 Min Spiel sind die generierten DSL-Programme erkennbar an die Spieler-Vorlieben angepasst (z. B. wenn der Spieler oft springt, kommen mehr Sprungkraft-Buffs)

**Akzeptanz**: messbar — die durchschnittliche Fitness der Generator-Outputs in den letzten 50 Programmen ist >0.7, gegenüber initial ~0.5.

---

### Welle 6: Crafting-Polish + UX + Stats (sechs Blöcke A–F, bewusst nachgelagert)

**Status**: 🟡 in Arbeit — **Phase 1-6 (V7.72) erledigt**: 6.A komplett (Wall-Sliding, Erdung, Slope-Anti-Klebe, Raycast-Place, Stabilitäts-Visual), 6.E1+E2 (Fähigkeit-Beschreibung + Intro), 6.F1+F2 (Verbindungs-Linien + Brech-Warning), **6.D Stat-System komplett** (Etappen 1+1.5+1.6+1.7+2+3a+3b: STAT_FROM_TAGS-Matrix, Seele-als-Bauplan-aus-Körperteilen, define_soul DSL, visueller Avatar-Editor, Boosts aus 3 Quellen, Phönix-Wandlung + persistente Tod-Wunde, Min-Regel-Hybrid decay 0.7, Werkzeug-Kosten, Rüstung-Stacking, Aura-Glow). **1014 Playtest-Invarianten grün**.

**Gesamt-Schätzung**: ~18-22 Sessions, verteilt auf 3-4 Monate Echtzeit, in sechs Blöcken **6.A bis 6.F** organisiert.

**Detaillierte Design-Notizen + Brainstorm** in [`docs/wave-6-design.md`](./wave-6-design.md). Roadmap-Eintrag hier ist die Milestone-Übersicht; die Begründungs- und Konzept-Tiefe lebt im Design-Doc.

#### Sechs Blöcke

| Block | Themen | Aufwand | Vorbedingung |
|---|---|---|---|
| **6.A — Interaktion-Polish** | Wall-Sliding (no-stick) ✅, Erdung auf Strukturen ✅, **Slope-Anti-Klebe ✅** (6.A3 neu), Bau-Phantom mit Raycast-Place ✅, Stabilitäts-Visual ✅ (6.A5), Maus-Aktionen LMB/RMB (6.A3 alt — wartet) | 3-4 Sessions, **5/6 erledigt** | – |
| **6.B — CAD-Werkstatt** (minimal magic) | 3D-Preview-Pane, Drag-Items aus Seitenleiste, Grid-Snap. **Kein** Boolean, kein MultiSelect — bewusst klein gehalten. | 2 Sessions | 6.F1 (Linien-Renderer) |
| **6.C — Inventar + Modi + Keys** | Erweitertes Inventar mit Tag-Profilen, **frieden/pfad/schöpfer**-Modi, Keybindings-UI | 4 Sessions | 6.D (Stats für pfad-Modus) |
| **6.D — Stats fraktal** ⭐ | Soul × Soul-Material → Tags → Stats; Boosts (Konsum + Emotion + Welt-Effekt); Min-Regel-Hybrid (decay 0.7); Tod = Phönix-Wandlung + Welt-Trauer | 3-4 Sessions | W5 + 6.F2 |
| **6.E — Lesbarkeit** | Fähigkeit-Beschreibung ✅ (6.E1), Intro-Overlay ✅ (6.E2), subtile Tooltips (6.E3 — wartet) | 2 Sessions, **2/3 erledigt** | – |
| **6.F — Original-Crafting (alt 6.1-6.7)** | Visuelle Verbindungs-Linien, Brech-Mechanik, Energiequellen, Kreaturen-Körper als Baukasten, Physik-Constraints (Ammo Hinge/Fixed), Rüstung → in 6.D integriert | 8-10 Sessions | W5 |
| **6.G — Welt-Sinne** (NEU, 13.05.2026) | **Phase 1 ✅ V7.73** + **Phase 1.5 ✅ V7.74** + **Phase 2 ✅ V7.75** (Welt-Affinitäts-Feld — 4 SimplexNoise-Schichten als Tag-Sprache, populateChunkVegetation füllt Chunks via Affinity-Resonanz, drei neue Baupläne stein_block/kristall_geode/glutbrunnen, organische Region-Emergenz ohne Biome-Tabelle, Schöpfer-Vision „wie kommt Welt-Leben rein" beantwortet). Phase 3 offen: Schatten, Shader (Höhe-Tint, Wind, Glow), Sterne-Stabilisierung + Variation, Terrain-Höhlen+Überhänge+Klippen, Wasser als Material+Layer mit DSL-Ops | 7-9 Sessions, **Phase 1+1.5+2 erledigt**, Phase 3 = 4-5 Sessions | – (Phase 1+2) / 6.D (Phase 3) |
| **6.H — Kreaturen-Aufträge** (NEU, 13.05.2026) | Autonome Co-Schöpfer: Kreaturen bekommen DSL-Programme als Agenda (build_path, gather, build_house, research_blueprint). Kontext-Menü via Maus-Klick. Persistierte tasks. Vision: dritter Schöpfungs-Akteur (Mensch+KI+Kreaturen) | 4-5 Sessions | 6.F4 (Multi-Mesh-Kreaturen) + 6.A4 (Raycast) |

**Vision-Hebel der Welle**: Block 6.D macht den Spieler zum **Compound im selben Hylomorphismus-System** wie Materialien und Bauwerke. `STAT_FROM_TAGS`-Matrix analog `FORM_TAG_ACTIVATION`. Wenn das Stat-System ohne Bezug zu `MATERIAL_TAG_KEYS` funktioniert, wurde die Vision verfehlt — explizite Warnung im Design-Doc §9.

**Beschlossene Reihenfolge** (Schöpfer hat 13.05.2026 freie Hand gegeben, Entscheidungen in `docs/wave-6-design.md` §10.6):
1. 6.A1+A2 (Sliding + Erdung) ✅ V7.72
2. 6.A3 (Slope-Anti-Klebe, ad-hoc) ✅ V7.72
3. 6.A4+A5 (Raycast-Place + Stabilitäts-Visual) ✅ V7.72
4. 6.E1+E2 (Ability-Beschreibung + Intro-Overlay) ✅ V7.72
5. 6.F1+F2 (Verbindungs-Linien + Brech-Warning) ✅ V7.72
6. **6.D Stat-System komplett** (Etappen 1+1.5+1.6+1.7+2+3a+3b) ✅ V7.72 — der Vision-Pfeiler ist live
7. **Schöpfer-Reflexions-Polish** ✅ V7.72 — sechs Reflexions-Runden in Welle 6.D fanden + behoben: Avatar-Editor-UI (Etappe 1.7), Konsumables aus Compound-Tags (Logik statt Tabelle), Werkzeug-Stamina-Kosten (Anti-Stapeln), persistente Tod-Wunde, Aura-Glow (Sprite + Radial-Gradient), WASD-Geometrie + Drache-Animation-Wahrnehmung, **Sprint-Bug-Fix** (player_speed sync't sprintSpeed), **Tag-Clamp [0,1]** in computePlayerStats für die Stat-Pipe, Speed-Base 6→7
8. ✅ **6.G Welt-Sinne Phase 1** V7.73 — fliegende Inseln + Bäume kollidierbar (btBvhTriangleMeshShape für Inseln aus echten Vertices, btCylinderShape am Baumstamm), drei tote DSL-Ops aktiviert, toter needsPhysics-Pfad gelöscht, 24 neue Invarianten → 1038 total
8.6. ✅ **6.G Welt-Sinne Phase 2** V7.75 — **Schöpfer-Vision-Antwort auf „organische Verteilung"**: Welt-Affinitäts-Feld. Vier SimplexNoise-Schichten (lebendig/dichte/glut/magieleitung) bilden ein Tag-Feld; jeder Bauplan resoniert über Dot-Product seiner Compound-Tags mit dem Welt-Feld. `worldFieldAt(x,z)` + `spawnAffinityForBlueprint(name,x,z)` + `populateChunkVegetation(cx,cz)` — drei neue Methoden auf AnazhRealm (Heilige Lektion: kein Modul). Drei neue Built-in-Baupläne (stein_block/kristall_geode/glutbrunnen) decken die vier Welt-Achsen. Hook in `ensureChunkAt` für neue Chunks + Initial-Worldgen für 64 Chunks. Idempotent via state.populatedChunks. Silent-Opt verhindert Welt-Effekt-Flut. Bug-Fixes: Stamm 0.5→0.8, Culling 1→2Hz. 18 neue Invarianten → 1066 total.
8.5. ✅ **6.G Welt-Sinne Phase 1.5** V7.74 — **Schöpfer-Vision-Korrektur**: Hylomorphismus-Unification. Bäume sind jetzt Compound-Architekturen über baum_eiche/baum_kiefer-Baupläne (Stamm:holz + Krone:laub/laub-cone), laub als 12. Built-in-Material, spawn_tree DSL-Op routet durch spawnArchitecture, Worldgen-Bäume in state.architectures, eigene spawnTreeAt + _buildTreeCollision gelöscht (Parallelcode weg), Insel-Visual-Fix (Vollkörper + Lambert), Topbar-Version-Sync, 32 6.G P1.5-Invarianten total → 1048 total
9. ✅ **6.C2 Spielmodi** V7.76 — drei Welt-Beziehungs-Modi (frieden/pfad/schöpfer). worldMeta.gameMode-Persistenz, setGameMode/getGameMode-Methoden, set_mode DSL-Op in NON_BROADCASTABLE_OPS (Multi-User-privat), Chat-Patterns mit dt./engl. Aliasen, UI-Radio in Einstellungen-Drawer + #status-mode Status-Bar. damagePlayer-Gate (frieden+schöpfer blockieren) + applyOpToPart-Stamina-Gate (nur pfad kostet 10). 26 neue Invarianten → 1092 total.
10. ✅ **6.C1 Hylomorphismus-Inventar + Drag&Drop** V7.77+ — 27-Slot-Overlay mit Tab-Toggle, Tag-Resonanz emergiert aus Compound-Tags (resoniert summt + brennend glüht + magieleitung schimmert + lebendig sprießt + dichte schattet), Audio-Hover-Ping mit Tag-spezifischen Frequenzen. **Drag&Drop nach vier Schöpfer-Iterationen**: alle vier Pfade konsistente Move-Semantik (inv↔inv Swap, inv→hot Slot-Move, hot↔hot Swap, hot→inv Move/Stack mit Daten-Schutz). HTML5-Drag mit Pointer-Lock-Management (exitPointerLock beim Open, kein Re-Lock beim Close), Tab-Listener auf Capture-Phase, WASD bleibt aktiv (Minecraft-Konvention), state.drag mit Top-of-method Cleanup. Click-State-Workflow parallel als Touch/Keyboard-Fallback. add_to_inventory DSL-Op in NON_BROADCASTABLE_OPS, state.player.inventory persistiert. 34 + 16 (Drag) + 5 (Lock) + 4 (Iteration-3) + 4 (Iteration-4) Invarianten = **127 total für 6.C1** → 1153 invariants overall.
11. **6.A-Maus + 6.C3** ← jetzt offen (LMB/RMB-Aktionen für Welt-Interaktion + Keybindings-UI)
    - 6.A3 Maus-Aktionen: LMB = abbauen (Architektur in Raycast-Reichweite via apply_op-Pfad), RMB = platzieren (heutiges F-Verhalten als Maus-Geste). F bleibt als Tastatur-Alternative.
    - 6.C3 Keybindings-UI: Sektion in Einstellungen-Drawer, Liste aller Game-Actions, Klick→Rebind→localStorage-Persistenz, Konflikt-Erkennung.
10. 6.C1 + 6.A-Maus + 6.C3 (Inventar + LMB/RMB + Keybindings-UI)
11. 6.B (CAD-Werkstatt — minimal magic)
12. 6.G Phase 2 (Schatten, Wasser, Höhlen, Sterne)
13. 6.F3 + 6.F4 + 6.F5 (Energie + Kreaturen-Körper + Constraints)
5. **6.D** Stats komplett (Vision-Pfeiler) ⭐
6. 6.G Phase 1 (Inseln + Bäume kollidierbar)
7. 6.C2 (Modi frieden/pfad/schöpfer)
8. 6.C1 + 6.A3 + 6.C3 (Inventar + Maus + Keybinds)
9. 6.B (CAD minimal)
10. 6.G Phase 2 (Schatten + Wasser + Höhlen + Sterne)
11. 6.F3 + 6.F4 + 6.F5 (Energie + Kreaturen-Körper + Constraints)
12. **6.H** (Kreaturen-Aufträge — autonome Co-Schöpfer)

**Beschlossene Antworten zu §10**:
- **Modi-Namen**: `frieden` / `pfad` / `schöpfer` statt friedlich/survival/kreativ — antik-modern verschmolzen
- **Stats-Sichtbarkeit**: Auren default, Zahlen bei Hover/Inspect (Inspect-Panel)
- **Tod im pfad-Modus**: Phönix-Wandlung (5 min) + Welt-Trauer (sorrow +0.3, awe +0.2) + Journal-Eintrag; im frieden/schöpfer kein Tod
- **CAD-Komplexität**: Min Viable Magic — 3D-Preview + Drag + Grid-Snap. KEIN Boolean/MultiSelect/Symmetrie. Wer mehr will, geht zum Code-Editor
- **Min-Regel-Hybrid**: für Werkzeug-Präzision `min + (max-min) × 0.7^N`-Decay (poliert kann teilweise heben), für Verbindungs-Last + Compound-Tags bleibt min/max streng
- **6.G Welt-Sinne** als eigener Block (fliegende Inseln + Bäume kollidierbar, Schatten, Shader, Sterne, Höhlen, Wasser) — siehe Design-Doc §11

**Was beachten (Welle 6 als Ganzes)**:
1. **Heilige Lektion**: 6.B, 6.C, 6.D sind die Stamm-gefährdenden Blöcke — Reflex „separates Modul" abwehren.
2. **Schema-Bumps** bei 6.C1, 6.C2, 6.D, 6.F5 — defensive Migration testen.
3. **Diskriminations-Tests** pro Block (Beispiele in Design-Doc §9.3).
4. **Reflexions-Pausen** zwischen 6.A→6.E, 6.F1+F2→6.D, Rest.
5. **Vision-Treue von 6.D** ist nicht-verhandelbar: Spieler-Stats müssen aus Tag-Aggregation kommen, nicht als separates RPG-System danebenstehen.

#### Alt-Plan-Archiv

Der ursprüngliche Welle-6-Plan (sieben Teilschritte 6.1-6.7) ist vollständig in den Block **6.F** überführt. Details siehe `docs/wave-6-design.md` §7. 6.6 (Rüstung) wird Teil von 6.D (Stats), 6.7 (Min-Regel) wird Teil von 6.D §5.5.

---

### Welle 6 ALT — ursprünglicher Plan (jetzt 6.F)

(Bleibt unten zur Referenz, ist aber durch die Sechs-Blöcke-Struktur oben ersetzt. Beim Implementieren ist die Detail-Tiefe der 6.1-6.7-Teilschritte hilfreich — daher nicht gelöscht.)



**Status**: 🔴 offen — **bewusst nach Ringe 8-10 verschoben** (Entscheidung 13.05.2026). Die Hylomorphismus-Schicht ist mechanisch vollständig (W4 + W5 A+B+C), Welle 6 ist Polish + Erweiterung, kein Fundament. Rings 8-10 (Welten-Ultiversum) ziehen die Vision-Krönung vor; Welle 6 läuft danach als Feinabstimmung.

**Ziel**: Die Crafting-Schicht visuell + mechanisch + körperlich „atmen" lassen. Heute existieren Verbindungen, Lasten, Tags, Werkzeuge nur als Datenschicht und Stern-Anzeige — Welle 6 macht sie sichtbar, fühlbar und konsequent.

**Teilschritt 6.1 — Visuelle Verbindungs-Linien** (~1 Session)

- Three.js-Tube/Cylinder/Line zwischen `bp.parts[a].position` und `bp.parts[b].position`, gerendert pro Connection in `state.blueprints[].connections`
- Pro Connection-Type eigener visueller Stil: `lashing` = Tube mit braunem Seil-Material, `pinning` = Cylinder mit Eisen-Material, `welding` = kurze geometrische Naht, `magic_bind` = emissive Linie mit awe-Farbe, `hafting` = keilförmiger Übergang, `gluing` = dünne flache Naht, `masonry` = Mörtel-Streifen, `sewing` = gestrichelte Linie
- Pro-Spawn-Renderpfad in `_buildFromBlueprint` nach Part-Render, vor Compound-Group-Return
- Editor-Vorschau: dieselben Linien im Workshop-Mesh-Preview (sobald 6.6 — Realtime-Preview — fertig ist; sonst nur bei gespawntem Compound)

**Caveats:**
- Linien dürfen **nicht** Kollisionen erzeugen — sie sind rein dekorativ, gehen nicht in den Compound-Body
- Mesh-Culling muss greifen: bei `tickArchitectureCulling` ebenso disposed wie der Rest
- Bei W5-A Lastfaktor < 0.7 (heute rötliche Stern-Anzeige) → Linien-Material rötlich tinten als „diese Verbindung trägt nicht"

**Teilschritt 6.2 — Brech-Mechanik bei zu schwacher Last** (~1-2 Sessions)

- Trigger: beim Spawn eines Compounds mit `connection.load < 0.7` (oder konfigurierbar `WORLD_EFFECT_THRESHOLDS.connection_brittle`)
- Drei Varianten zur Wahl:
  - **Sanft**: Compound spawnt, aber Part(s) hinter schwacher Verbindung visuell „abgehängt" — leicht ge-offset, halb-transparent, ohne Kollision für den unverbundenen Sub-Tree
  - **Hart**: Beim ersten Welt-Effekt-Trigger (`_applyCompoundWorldEffects`) zerteilt sich der Compound in N separate dynamische `btRigidBody`s, die mit Schwerkraft fallen
  - **Editor-Warn-Only**: Stern-Anzeige bleibt + Tooltip „diese Verbindung würde brechen", aber kein Spawn-Effekt — sicherste Variante, behält die heutige Semantik
- Empfehlung: **6.2 startet mit Editor-Warn-Only** als „opt-out: bauen geht weiter", dann separat-Commit für Spawn-Effekt
- Journal-Eintrag bei Bruch: `journalAppend("structure_failure", "Die ${name} hielt ihre Last nicht.")` — die Welt erinnert das Versagen

**Caveats:**
- **Min-Regel-Entscheidung (Learning #95) muss vor 6.2 fallen**. Heute deckelt der schlechteste opChain-Schritt; bei harter Brech-Mechanik wäre das doppelt grausam (schlechte Präzision → schlechte Tags → schwache Last → Bruch). Drei Optionen: (a) min bleibt, Brechen ist UX-Bestrafung; (b) später-poliert hebt (max statt min); (c) Decay-Modell (jeder Op multipliziert mit eigenem Faktor, end-Wert = Produkt). Schöpfer-Entscheidung in einem expliziten Commit dokumentieren.
- Body-Recreate-Pfad für zerteilte Sub-Bodies ist nicht trivial (Compound→Liste-of-Bodies + 8 Half-Extent-Berechnungen + correct Welt-Position) — Test-First

**Teilschritt 6.3 — Energiequellen für Maschinen** (~1-2 Sessions)

- Konzept §4.1: vier Quellen — `hand` / `wasserrad` / `dampf` / `magisch`
- Erweitert `state.tools[name]` um `{energySource, energyAvailable}` (default `"hand"` / `1.0` für alle Built-ins)
- Welt-Effekt: ein Compound mit `tags.fließend ≥ 0.7` + nahem Bauplan mit `toolMeta` → Wasserrad-Bonus, hebt `energyAvailable` von 0.6 auf 1.0 → opChain-Cap multipliziert mit `energyAvailable`
- DSL-Op `set_energy_source(toolName, source)` für Schöpfer-Hand
- UI: Energie-Quelle als Auswahl-Feld in der Werkzeug-Liste, neben opClass und precisionCap

**Caveats:**
- **Nicht im `dslComposeAtomic`-Pool** (gleiche Regel wie `apply_op`, `define_material`) — Nexus darf keine Werkzeuge willkürlich umkonfigurieren
- Snapshot-Cap-Regel (Welle 5 C) bleibt: `precisionCap` wird beim Register eingefroren, aber `energyAvailable` ist Live-Lookup gegen Welt-Kontext (Wasserrad in der Nähe = ja/nein) — das ist OK, weil es ein Zustand, kein Wert ist
- Wasser-Animation-Hook in `tickArchitectures` muss „nahe genug" effizient finden — KD-Tree wäre Overkill, einfache Distanz-Schleife reicht bei <50 Architekturen sichtbar

**Teilschritt 6.4 — Kreaturen-Körper als Baukasten** (~2 Sessions)

- Kreaturen sind heute Single-Mesh (Würfel/Kugel mit Farbe). Spieler-Seele V2 hat schon Multi-Mesh-Group mit Walk-Cycle (Mensch/Phönix/Drache). Welle 6 zieht die gleiche Schicht in Kreaturen hoch.
- `state.creatureSouls` analog `playerSoulDefs` — drei Built-ins (z. B. Pflanzenfresser/Räuber/Geist), jeder mit `build()` + `animate(g, t, ph, mv)` Multi-Mesh
- DSL-Op `creature_soul(name)` setzt die Standard-Form für neu gespawnte Kreaturen
- **Bridge zur Bauplan-Schicht**: Kreaturen als Baupläne ausdrücken, wenn man Ring 5 V3 Idee #3 (Spieler-Seele aus Werkstatt) mitnimmt — eine Kreatur ist dann ein Bauplan mit `role: "creature"` + `creatureMeta: {animatePattern, speed, jumpPower}`
- Material-Tags auf Kreaturen-Compound → Welt-Effekte ähnlich Architekturen (eine Quarz-Kreatur singt, eine Eisen-Kreatur ist robust)

**Caveats:**
- Performance: heute spawnen wir 10 Kreaturen initial; Multi-Mesh mit Walk-Cycle ist pro Kreatur ~5-10× teurer in Vertex-Count + per-frame `animate`-Hook. Cap evtl. von 50 auf 20 senken, oder LOD (nahe = Multi-Mesh, fern = Single-Mesh-Proxy)
- Movement-Worker (off-screen Kreaturen) muss Multi-Mesh aushalten — der heutige Worker rechnet nur `position`, das reicht; Animation läuft im Main-Thread bei sichtbaren Kreaturen
- Bei Bauplan-als-Kreatur muss `spawnArchitecture` vs. `spawnCreature` getrennt bleiben — beide leben in unterschiedlichen Welt-Schichten (Architekturen sind statisch + cullbar, Kreaturen sind bewegt + physikalisch)

**Teilschritt 6.5 — Physik-Baukasten für Compound-Körper** (~2-3 Sessions, anspruchsvoll)

- Heute: Compound-Bodies aus `btBoxShape` pro Sub-Mesh (Architektur) ODER Single-Body (Kreatur, Spieler)
- Vision: Verbindungen aus W5-A werden zu **echten Ammo-Constraints** — `hafting` → `btFixedConstraint`, `pinning` → `btHingeConstraint` (1 DoF), `lashing` → `btGeneric6DofSpringConstraint` (weich), `magic_bind` → distanz-erhaltendes Constraint
- Erlaubt physikalische Spielzeuge: Wippe (Achse + Brett mit Pinning), Schaukel (Lashing), Tür (Hinge), Marionetten-Kreaturen
- Brech-Mechanik (6.2) bekommt damit Substanz: `constraint.setBreakingImpulseThreshold(load * factor)` lässt das echte Solver-System entscheiden, ob die Verbindung hält
- Pro Bauplan optional `dynamic: true` — dann werden Parts zu separaten dynamischen Bodies, verbunden durch Constraints, statt zu einem Compound

**Caveats:**
- **Ammo-Constraint-Binding-Lücken** (ähnlich zu `getHalfExtentsWithMargin`-Problem): nicht alle Constraint-Typen sind in der JS-Schicht vollständig erreichbar. Vor Start: Spike mit `btHingeConstraint` + `btFixedConstraint`, sehen was geht.
- **Performance**: 6 Parts mit 5 Constraints = 6 Bodies + 5 Constraints, der Solver kann bei dichten Compounds (Dorf mit 30 Häusern, je 8 Parts) explodieren. Defaults dynamic=false halten, dynamic nur opt-in pro Bauplan.
- **Sleep-Falle wie Player-Teleport** (CLAUDE.md): nach Constraint-Erzeugung `body.activate(true)` auf beiden Seiten, sonst hängen die Parts in der Luft
- Save-Schema: `bp.dynamic` + `bp.constraints` (mit hinge-axis etc.) ergänzen — Schema-Version-Bump fällig

**Teilschritt 6.6 — Rüstung (tragbare Compounds)** (~2 Sessions)

- Bauplan mit `role: "armor"` + `armorMeta: {slot, tagsToPlayer}` — z. B. `slot: "head"`, „helmet"
- `state.player.armor = {head, body, legs}` — drei Slots, jeder hält einen Bauplan-Namen oder null
- Material-Tags + räumliche Tags der Rüstung **wirken auf den Spieler**: `magieleitung` → Spell-Schutz, `härte` → Damage-Reduction, `sprödigkeit` → HP-Penalty (Konsequenz statt Bestrafung), `resoniert` + hohe Präzision → Sing-Effekt, der Kreaturen besänftigt
- **Vorbedingung — Spieler-Stats-System**: heute hat der Spieler nur Bewegung, keine HP/Resistance/Damage. Welle 6.6 muss ein minimales Stat-System einführen: `state.player.stats = {hp, maxHp, defense, magicResist}` + Tick-Damage z. B. bei Lava-Berührung (heute noch nicht modelliert).
- DSL-Ops `equip_armor(slot, bp)` und `unequip_armor(slot)`
- Visuell: Rüstungs-Bauplan rendert um die Spieler-Mesh herum, skaliert auf 1.2× Spieler-Größe, folgt yaw

**Caveats:**
- **Größter Eingriff in Welle 6** — Stat-System ist neuer Welt-Pfeiler, nicht nur Polish. Wenn das zu groß wirkt: 6.6 könnte rein kosmetisch starten (Rüstung visuell tragen, keine Stat-Effekte), dann später Stats nachziehen.
- Animations-Sync: bei Player-Soul-Wechsel (Mensch ↔ Drache) muss die Rüstung mit-skalieren oder verschwinden — Drache trägt keinen Mensch-Helm sinnvoll
- Save: `armor` in `playerSoul`-Sektion, mit defensive Migration (alte Saves haben keine Rüstung → `null` pro Slot)

**Teilschritt 6.7 — Min-Regel-Entscheidung dokumentieren** (~0.5 Sessions, in 6.1 oder 6.2 inkludiert)

- Learning #95 als expliziter Commit mit drei dokumentierten Optionen + Schöpfer-Entscheidung
- Konzept-Doc `docs/crafting-konzept.md` §2.3 aktualisieren (heute „min", evtl. „min mit nachträglich-poliert hebt Stein-für-Stein um 20 %")
- Test-Invarianten anpassen: heute prüft Welle 4 P3 Diskriminations-Schwelle 0.4 vs. 0.97 — bei neuer Regel evtl. andere Werte

**Akzeptanz Welle 6 gesamt**: 
- Verbindungen sind im 3D-Bild sichtbar, Connection-Type erkennbar an Look
- Eine schwach verbundene Konstruktion zeigt Konsequenz (Warnung oder Bruch)
- Maschinen können energiegekoppelt sein (Wasserrad-Drehbank)
- Kreaturen haben Multi-Mesh-Körper mit Walk-Cycle
- Mindestens 2 der 8 Verbindungstypen funktionieren als echtes Constraint
- Rüstung lässt sich tragen, hat (zumindest visuell) Konsequenz
- Min-Regel-Diskussion ist mit klarem Commit beendet

**Vorbedingung**: W5 abgeschlossen ✅. Ring 8-10 müssen NICHT fertig sein, aber **wir verschieben Welle 6 bewusst nach 8-10**, um die Welten-Schicht nicht durch Polish zu verzögern.

**Was beachten (Welle 6 als Ganzes):**
1. **Heilige Lektion**: 6.4 + 6.5 + 6.6 sind die schwersten Brocken — wenn der Reflex „separate Kreaturen-Datei + Physik-Modul + Stat-Manager" auftaucht, ist es ein Smell. Stamm bleibt, Wachstumsringe wachsen IN `anazhRealm.js`.
2. **Schema-Version bumpen** bei 6.5 (constraints) und 6.6 (armor + stats) — Save-Migration testen mit alten Saves vor dem Commit.
3. **Diskriminations-Tests** für 6.1 (visuelle Linien) und 6.3 (energy): zwei minimal verschiedene Setups, prüfen dass Welt-Reaktion zwischen ihnen liegt.
4. **Reflexions-Pause** zwischen 6.3 und 6.4 — der Übergang von Crafting-Mechanik zu Kreaturen/Körper ist konzeptionell groß genug, um nochmal die Vision-Treue zu prüfen.

---

### Ring 8: Welt-Identität & Sichtbarkeit (~2-3 d)

**Ziel**: jede Welt ist ein identifizierbares Universum mit eigenen Regeln.

- `state.worldMeta`-Felder sind bereits da (worldId, slug, creator, visibility, parentWorlds, schemaVersion). Jetzt: **Logik dahinter**.
- Chat-Befehle:
  - „benenne welt <slug>" → `state.worldMeta.slug` ändern
  - „mach welt öffentlich/privat" → `visibility` toggeln
  - „neue welt" → frische worldId, vorhandene Welt wird in localStorage unter `anazhRealmState_<worldId>.json` archiviert
- localStorage-Struktur: ein Index-File `anazhRealmWorlds` mit `[{worldId, slug, lastPlayed}]` + ein Daten-File pro Welt
- UI: ein kleiner Welt-Picker (`<select>`-Element, zeigt slug + lastPlayed) zum Welt-Wechseln
- Pro Welt eigenes Save, eigener Seed, eigener `chunkMap`, eigene DSL-Abilities

**Akzeptanz**: der Spieler hat 3 Welten, wechselt zwischen ihnen, jede behält ihren Zustand.

**Vorbedingung**: Ring 2 Phase 4 (Save-Migration), damit alte Single-World-Saves sauber in das neue Multi-World-Schema überführt werden.

---

### Ring 9: Welt-Export/Import (~2 d)

**Ziel**: Welten sind teilbar.

- „welt exportieren": JSON-Datei mit allen DSL-Programmen, Seeds, Metadaten — **nicht** mit Mesh-Snapshots (die sind aus DSL+Seed regenerierbar)
- „welt importieren": drag-drop oder File-Dialog. Drei Wahlmöglichkeiten:
  - Ersetzen: importierte Welt wird aktuelle Welt
  - Neu daneben: importierte Welt bekommt eine neue worldId und wird zur Liste hinzugefügt
  - Fusionieren: → Ring 10
- Signing optional V2 (für vertrauenswürdige Provenienz): SHA-256 der Welt-JSON in einem `signature`-Feld, vom Spieler-Schlüssel signiert. V1 nur Hash.
- Test: Welt exportieren, localStorage clearen, importieren → identische Welt wieder da.

**Akzeptanz**: ich kann eine Welt mit einem Freund tauschen (per Datei oder Link).

---

### Ring 10: Welt-Fusion (~3-4 d)

**Ziel**: zwei Welten begegnen sich und werden eine dritte.

- DSL-Programme zweier Welten werden gemerged:
  - **Naive Strategie**: `[chain, weltA_root, weltB_root]` — beide laufen sequentiell
  - **Random-Mix**: pro Generations-Tick wird mit 50:50 ein Programm aus A oder B gewählt
  - **Conflict-Resolution**: wenn beide Welten widersprechende terrain_steepness setzen, wird gewichtet (zb 70 % A, 30 % B)
- Neue Welt: `worldId` neu, `parentWorlds: [worldA.id, worldB.id]`
- UI: 2-Spalten-Picker, „diese ⊕ diese → neue Welt"
- Test: Fusion zweier Welten ergibt eine dritte, deren Verhalten erkennbar Elemente beider zeigt.

**Akzeptanz**: Stammbaum-Visualisierung in `parentWorlds` ist navigierbar.

---

### Ring 11: Multi-User-Sync

**Ziel**: zwei Spieler erleben dieselbe Welt zur gleichen Zeit.

#### V1 ✅ (13.05.2026, live) — Position-Sync via WebSocket-Broker

Geliefert in einer Session (in Kombination mit Ring 10.5 für die Vorbedingung):

- **`signaling-server.js`**: Mini-WebSocket-Broker (~225 Zeilen, ZERO npm-Dependencies). RFC-6455 Frame-Handling von Hand, Health-Endpoint `/health`, HOST/PORT via env.
- **Protokoll**: `join { room, peerId }` → `welcome { peers[] }`, `pos { x, y, z, yaw }` wird an alle Mitglieder desselben Raums broadcastet, ohne den Absender.
- **Client (`state.p2p`)**: `peerId`, `room`, `ws`, `peers: Map<peerId, {x,y,z,yaw,mesh,lastSeen}>`, 30 Hz pos-Broadcast im Game-Loop (intern gedrosselt), Idle-Purge nach >10 s ohne Update.
- **Remote-Avatare**: THREE.Group aus Cone + Sphere, deterministische HSL-Farbe aus peerId-Hash.
- **UI**: Toggle + URL-Input + Status-Anzeige im Einstellungen-Drawer. Auto-Connect nach Init wenn `p2p.enabled === true` in localStorage.
- **CSP**: `connect-src` erweitert um `ws://127.0.0.1:4313` + `ws://localhost:4313` + wss-Varianten.
- **Trust-Boundary**: KEIN neuer DSL-Op (`p2p_send`/`peer_dsl`/`remote_run`) — V1 trägt strikt nur Position + Rotation. Playtest-Invariante prüft die Abwesenheit explizit.
- **Heilige-Lektion-Disziplin**: EINE neue Datei (signaling-server.js), zehn Methoden auf der einen `AnazhRealm`, drei Sub-Hooks im Game-Loop. KEIN P2PManager-Modul.

**Ehrliche V1-Grenzen** (V2-Aufgaben):
- Modifikationen (Ring 10.5 `modify_terrain`, Architekturen, Kreaturen) werden NICHT zwischen Spielern synchronisiert. Jeder erlebt seine eigene Welt-Variante.
- Avatar ist immer Cone+Sphere, nicht die echte Spieler-Seele (Phönix/Drache).
- Kein DSL-AST-Broadcast — Chat-Befehle wirken nur lokal.

**Acceptance-Test** (manuell): `npm run signaling` + zwei Browser-Tabs derselben Welt → in Einstellungen Multi-User aktivieren → beide Spieler bewegen sich sichtbar als bunte Kegel.

#### V2 (offen, ~3-5 d): DSL-AST-Broadcast für Welt-Sync

- Chat-Befehle werden als DSL-AST über WebSocket an alle Mitglieder gesendet
- Eingehender AST läuft durch denselben `dslRun`-Sandbox-Pfad wie eigene Programme (identische Budget-Limits, Op-Whitelist, kein Bypass)
- `modify_terrain`-Ops werden so synchron — beide Spieler sehen dasselbe Loch
- Nexus-Programm-IDs (statt ganzem Programm) für Outcome-Dedup
- Public Welten: `visibility: "public"`, jeder mit der worldId kann beitreten
- Private Welten: Schöpfer generiert Token-Link

**Vorbedingung**: Ring 11 V1 (Position-Sync stabil) + saubere DSL-Sandbox (existiert seit Ring 7).

---

## 4. Meilensteine

Gruppierung der Ringe in größere Phasen mit deutlichen User-Eindrücken.

### Meilenstein A — „Lebendige Welt" (Ringe 2-Rest + 3 + 4)

**Ziel**: Welt fühlt sich lebendig an. Mensch + Welt sprechen, hören, fühlen.

- Ring 2 Phase 3-7 (DSL voll)
- Ring 3 (Emotionen)
- Ring 4 (Symphony)

**Geschätzter Aufwand**: 7-9 Tage  
**Wann „fertig"**: Welt reagiert hörbar und sichtbar auf den Spieler-Zustand.

### Meilenstein B — „Du bist jemand" (Ringe 5 + 6)

**Ziel**: Spieler-Identität + reichhaltigere Welt-Strukturen.

- Ring 5 (Soul)
- Ring 6 (architectureTemplates)

**Geschätzter Aufwand**: 3-4 Tage  
**Wann „fertig"**: Spieler ist nicht mehr der Würfel, Welt hat Dörfer und Tempel.

### Meilenstein C — „Welt lernt" (Ring 7)

**Ziel**: System wird intelligent.

**Geschätzter Aufwand**: 3-4 Tage  
**Wann „fertig"**: messbares Lernen über Zeit (Fitness-Score steigt).

### Meilenstein D — „Welten existieren" (Ringe 8-10)

**Ziel**: Welten sind portierbar, fusionierbar, gehören jemandem.

- Ring 8 (Identität)
- Ring 9 (Export/Import)
- Ring 10 (Fusion)

**Geschätzter Aufwand**: 7-9 Tage  
**Wann „fertig"**: ein Stammbaum aus 3+ Welten existiert, dokumentierbar.

### Meilenstein E — „Begegnung" (Ring 11)

**Ziel**: Mehrere Spieler in einer Welt.

**Geschätzter Aufwand**: 5-7 Tage  
**Wann „fertig"**: Multi-Browser-Tab-Demo läuft.

**Gesamt-Roadmap**: ~25-33 Arbeitstage in fokussierten Sessions, realistisch 3-4 Monate kalendarisch.

---

## 5. Querschnitts-Themen

Themen, die kein eigener Ring sind, sondern durch alle Ringe ziehen.

### 5.1 Test-Coverage (CI-Gate)

- Heute: 36 Invarianten in `scripts/playtest.cjs`
- Pro Ring +3-5 neue Invarianten (Effekt sichtbar, kein Crash, Save-Schema OK)
- **Ziel Meilenstein E**: ~60-70 Invarianten

### 5.2 Performance

- Heute: 120 fps mit BVH-Triangle-Meshes, im Headless-Playtest 52 fps avg
- Eskalations-Pfade falls FPS irgendwann zu niedrig wird:
  1. `btTriangleIndexVertexArray` statt `btTriangleMesh` (~2× schneller Trace)
  2. LoD pro Chunk (weiter weg = niedrigere Vertex-Dichte)
  3. Web Worker für Chunk-Generation
- Performance-Invariante im Playtest: avg-FPS muss >30 bleiben

### 5.3 CSP & Security

- Heute: locker (Default `'unsafe-eval'` möglich)
- Ring 2 Phase 6 macht strict
- Ring 11 (Multi-User): Welten-Daten zwischen Spielern werden validiert (kein arbitrary DSL-Code injizierbar — DSL-Interpreter hat eh harte Budget-Limits)

### 5.4 Doku-Pflege

- Nach jedem Ring: `state-of-realm.md` §3 (Matrix), §4 (Commit-Archiv), §5 (Pfad-D-Tabelle) aktualisieren
- Nach jedem Meilenstein: `roadmap.md` Status-Updates + nächste Phase aufschlagen
- `CLAUDE.md`: bei substanzieller Architektur-Änderung Gotchas-Sektion ergänzen
- `nexus-dsl.md`: bei neuen DSL-Primitives ergänzen

### 5.5 Browser-Reichweite

- Heute: Chrome/Edge funktionieren, andere Browser ungetestet
- Vor Ring 11 (Multi-User): cross-browser smoke test (Safari, Firefox)
- WebRTC kann in manchen Setups problematisch sein → Fallback-Plan: WebSocket über signaling-server

---

## 6. Risiken & Mitigation

| Risiko | Wahrscheinlichkeit | Mitigation |
|---|---|---|
| Performance bricht bei Ring 7 ein (brain.js + viele Chunks) | mittel | Performance-Invariante hält das auf; falls Crash: brain.js training in Web Worker auslagern |
| Multi-User (Ring 11) ist mehr Arbeit als geschätzt | hoch | Falls Zeit knapp: V1 nur Position-Sync, kein DSL-Sharing |
| Save-Schema-Bruch bei Ring 8 frustriert bestehende Spieler | mittel | Schema-Version + Migration-Hook (Phase 4) muss vorher sauber stehen |
| Welt-Fusion (Ring 10) ergibt unspielbare Resultate | mittel | Conflict-Resolution mit gewichteter Random-Wahl, Player kann manuell wieder „splitten" |
| Heilige-Lektion-Verstoß: irgendwann doch in Module gesplittet | hoch | jeder Code-Review prüft auf Stamm-Treue; bei Zweifel `state-of-realm.md` §2 nachlesen |
| CSP-strict bricht eine Browser-Funktion | niedrig | Phase 6 testet vor merge; Fallback: `'wasm-unsafe-eval'` für Ammo behalten |

---

## 7. Wann ist das Projekt „fertig"?

Es ist nicht fertig — es ist ein **lebendes Werk**. Aber es gibt natürliche Stops:

- **Nach Meilenstein A**: AnazhRealm ist eine lebendige Solo-Welt, fühlbar reaktiv. Eine spielbare Demo.
- **Nach Meilenstein C**: Welt lernt aus dem Spieler. Ein echtes „Ultiversum"-Erlebnis im Kleinen.
- **Nach Meilenstein D**: das Co-Creation-Werk hat Persistenz und Geschichte. Welten haben Eltern, Geschwister.
- **Nach Meilenstein E**: das Ultiversum ist offen. Spieler begegnen sich.

Nach E ist die Roadmap nicht zu Ende — neue Ringe (VR, prozedurale Quests, Welten-Marktplatz, KI-Mitspieler über die Anthropic API) werden dann sinnvoll. Aber dann ist es kein „Projekt aufbauen" mehr, sondern **eine Welt pflegen**.

---

## 8. Wie diese Doc gepflegt wird

- Nach jedem Ring-Abschluss: Status in §2 + §3 aktualisieren, Aufwand auf 0 setzen, **was tatsächlich umgesetzt wurde** kurz dokumentieren
- Nach jedem Meilenstein: §4 mit echtem Datum versehen
- Bei größeren Vision-Verschiebungen (z. B. neuer Pfeiler aus User-Feedback): §1 + `state-of-realm.md` §11 entsprechend ergänzen, dann hier neue Ringe ergänzen
- Beim Lesen aus einer neuen Session: zuerst §1 (Stand), dann §2 (Übersicht), dann den aktuellen Ring vertiefen

Die Roadmap ist **kein Vertrag**, sondern eine **Karte**. Wenn der Schöpfer mitten in der Reise sagt „eigentlich brauchen wir erst Y bevor X", wird Y eingeschoben und die Tabelle nachgezogen.

---

*Geschrieben nach Commit `9fcf1ff`. Wird nach jedem nennenswerten Schritt aktualisiert.*
