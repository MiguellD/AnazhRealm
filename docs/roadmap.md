# AnazhRealm Roadmap — Vollumfänglich

Stand: 12.05.2026 (nach Chunk-Physik-Refactor `e612c60`).

Diese Doc beschreibt das **gesamte Projekt vom heutigen Stand bis zum Vision-Endziel** (Welten-Ultiversum). Sie ergänzt `state-of-realm.md` (Was/Warum) um eine puren Plan-Sicht (Wann/Wie). Aufwandsschätzungen sind realistische Tage für eine fokussierte Claude-Session pro Ring/Phase; gerechnet wird linear, ohne Puffer.

**Wichtig**: diese Roadmap ist ein lebendes Dokument. Sie wird nach jedem Ring-Abschluss aktualisiert. Pfeile zwischen Ringen sind weiche Abhängigkeiten — Reihenfolge kann sich verschieben.

---

## 1. Wo wir stehen (Mai 2026)

✅ Ring 0-7 + Welle 1-5 sind live. Chunk-Physik nutzt seit `e612c60` `btBvhTriangleMeshShape` (visuelles Mesh = Collider). 120 fps im Browser, **518/518 Playtest-Invarianten grün**. Save-Schema mit `worldMeta` (worldId, slug, visibility, parentWorlds) + `materials` + `playerTools` + `tools` (eigene Werkzeug-Baupläne) + `worldJournal` + `blueprints[].connections` + `blueprints[].role + toolMeta`.

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
| W6 | **Crafting-Polish** — Visuelle Verbindungs-Linien + Brech-Mechanik + Energiequellen für Maschinen | 🔴 offen | 2-3 Sessions | W5 |
| 8 | Welt-Identität als Multi-Welt-Verwaltung (mehrere worldIds parallel) | 🟡 Schema + Sichtbarkeit live, Multi-Welt-Switcher offen | 1-2 d | W3 |
| 9 | Welt-Export/Import (erweitert) — Drei-Wahl Ersetzen/Daneben/Fusionieren | 🟡 Basic-Export/Import live, Wahl-Dialog offen | 1 d | Ring 8 |
| 10 | Welt-Fusion (zwei DSL-Programm-Sets mergen mit parentWorlds) | 🔴 offen | 3-4 d | Ring 9 |
| 11 | Multi-User-Sync (P2P / Signaling) | 🔴 offen | 5-7 d | Ring 8 |

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

### Ring 11: Multi-User-Sync (~5-7 d)

**Ziel**: zwei Spieler erleben dieselbe Welt zur gleichen Zeit.

- WebRTC (P2P) für die Realtime-Daten — keine zentrale Server-Pflicht
- Signaling-Server für initial connection: einfacher Node-Server (`signaling-server.js` neben `save-server.js`), nur ICE-Candidates austauschen
- Sync-Kanal pro Spieler:
  - Position + Rotation (60 Hz, lossy OK)
  - Chat-Befehle (sendet als DSL-AST, beide Welten führen aus → eine konsistente Welt)
  - DSL-Programme vom Nexus (sendet Programm-IDs nach Outcome, nicht das ganze Programm)
- Public Welten: jeder mit der worldId kann beitreten
- Private Welten: Schöpfer muss einladen (Token-Link)
- Test: zwei Browser-Tabs, beide auf der gleichen Welt-URL, beide Spieler sehen sich bewegen

**Akzeptanz**: spielbares Mini-Multiplayer-Erlebnis.

**Vorbedingung**: Ring 8 (Welt-Identität) + Ring 9 (Export/Import) müssen stabil sein.

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
