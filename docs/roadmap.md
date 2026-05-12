# AnazhRealm Roadmap — Vollumfänglich

Stand: 12.05.2026 (nach Chunk-Physik-Refactor `e612c60`).

Diese Doc beschreibt das **gesamte Projekt vom heutigen Stand bis zum Vision-Endziel** (Welten-Ultiversum). Sie ergänzt `state-of-realm.md` (Was/Warum) um eine puren Plan-Sicht (Wann/Wie). Aufwandsschätzungen sind realistische Tage für eine fokussierte Claude-Session pro Ring/Phase; gerechnet wird linear, ohne Puffer.

**Wichtig**: diese Roadmap ist ein lebendes Dokument. Sie wird nach jedem Ring-Abschluss aktualisiert. Pfeile zwischen Ringen sind weiche Abhängigkeiten — Reihenfolge kann sich verschieben.

---

## 1. Wo wir stehen (Mai 2026)

✅ Ring 0 (Fundament) + Ring 1 (Grok-Stimme) + Ring 2 Phase 1+2 (DSL Interpreter + Generator) sind live. Chunk-Physik nutzt seit `e612c60` `btBvhTriangleMeshShape` (visuelles Mesh = Collider). 120 fps im Browser, 36/36 Playtest-Invarianten grün. Save-Schema bereits zukunftsfest mit `worldMeta` (worldId, slug, visibility, parentWorlds).

Aus den 5 Vision-Pfeilern (Symbiose, Emotion, Fraktal, Multisensorik, Stimme) ist Pfeiler 5 (Stimme) zu ~30 % umgesetzt, Pfeiler 1 (Symbiose) zu ~50 % (DSL existiert, aber Mensch+Nexus teilen Sprache erst nach Phase 3). Pfeiler 2/3/4 stehen noch aus.

---

## 2. Pfad-D Übersicht (Ringe 0-11+)

| Ring | Pfeiler | Status | Aufwand | Vorbed. |
|---|---|---|---|---|
| 0 | Stabiles Fundament (Bewegung, Physik, Chunks, Save, CI) | ✅ erledigt | – | – |
| 1 | Grok-Stimme (`dialogue-box`, narrative Reflexion) | ✅ V1 live | – | – |
| 2 | DSL als gemeinsame Sprache | 🟡 Phase 1+2+3+4+5 live, 6-7 offen | 0.5-1 d Rest | – |
| 3 | Player-Emotionen → Welt | 🔴 offen | 2 d | Ring 2 Phase 3 |
| 4 | `anazhSymphony` V1 (Web Audio) | 🔴 offen | 2-3 d | Ring 3 |
| 5 | `createPlayerSoul` (Mensch/Phönix/Drache) | 🔴 offen | 1-2 d | – |
| 6 | `architectureTemplates` V1 (Dörfer, Tempel, Wasserfälle) | 🔴 offen | 2 d | Ring 2 Phase 3 |
| 7 | `brain.js`-Welt (lernt aus Verhalten + Emotion) | 🔴 offen | 3-4 d | Ring 3 + Ring 2 Phase 3 |
| 8 | Welt-Identität & Sichtbarkeit | 🟡 Schema bereit, Logik offen | 2-3 d | Ring 2 Phase 4 (Migration) |
| 9 | Welt-Export/Import | 🔴 offen | 2 d | Ring 8 |
| 10 | Welt-Fusion (zwei DSL-Programm-Sets mergen) | 🔴 offen | 3-4 d | Ring 9 |
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

**Phase 6 — CSP-Header strict** (2 h)
- `<meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self'; ...">` in `index.html`
- WASM für Ammo: `script-src 'self' 'wasm-unsafe-eval'` (das ist der erlaubte CSP-Ausweg für WebAssembly)
- Test: Playtest mit CSP aktiv läuft durch; in DevTools-Konsole keine CSP-Violations.

**Phase 7 — Fitness V2** (0.5 d)
- Generator nutzt `state.dsl.history`, um Programme mit niedrigem `fitness` seltener zu erzeugen (Selektion)
- Mutation: ein bestehendes high-fitness Programm wird leicht modifiziert (z. B. ein Sub-AST ersetzt)
- Test: nach 100 Generationen hat die durchschnittliche Fitness gegenüber Generation 1 zugenommen

**Akzeptanz Ring 2 vollständig**: alle Chat-Befehle gehen durch DSL, kein `new Function` im Bundle, CSP-strict aktiv, Nexus lernt aus Outcomes.

---

### Ring 3: Player-Emotionen → Welt (~2 d)

**Ziel**: Spieler-Emotionen sind ein zentraler Welt-Treiber, nicht nur ein UI-Detail.

- `state.player.emotions = {joy, awe, sorrow, hope, longing, melancholy, peace, chaos}` — alle 0..1
- `collectPlayerEmotions(input)`: aus Chat-Input via Schlüsselwort-Regeln. „glücklich/froh" → joy++. „weinen/traurig" → sorrow++. Emotionen klingen über Zeit ab (-0.01 pro Sekunde).
- Welt-Kopplung: Emotion → DSL-Composer. Hohe joy → Generator wählt häufiger `weather "sunny"`, `creatures_emotion "happy"`. Hohe sorrow → rainy, sad. Wird über `dslComposeAtomic`-Gewichte realisiert (Emotionen modulieren das `w` pro Choice).
- Grok-Stimme reagiert: Trigger „emotionShift" wenn Spieler stark eine Emotion ausgedrückt hat.
- Test: Spieler chattet „ich bin traurig" → state.player.emotions.sorrow > 0.5 → Wetter wechselt zu rainy innerhalb 30 s.

**Akzeptanz**: 5 Min mit dem Spiel chatten ergibt fühlbare Welt-Reaktion auf die Tonalität der Inputs.

---

### Ring 4: anazhSymphony V1 (~2-3 d)

**Ziel**: Multisensorik. Welt hat Klang, der mit ihrem Zustand atmet.

- `state.symphony = { context, layers, masterGain }` mit Web Audio API
- Drei Klang-Schichten:
  - **Ambient**: Welt-Drone (low-frequency sinus, moduliert durch zeit + Spieler-y-position)
  - **Creatures**: kurze Ping-Töne bei Kreatur-Sprung oder -Spawn (frequenz aus emotion: happy hoch, sad tief)
  - **Weather**: Regen-Geräusch (gefiltertes Noise) bei `weather === "rainy"`, leise wind bei sunny
- Player-Emotionen modulieren: hohe joy = höhere ambient-frequency, hohe sorrow = mehr reverb
- Master-Toggle in UI (analog zum Grok-Stimme-Toggle)
- Bewusst klein: ~300 Zeilen, keine SamplerLibrary, kein MIDI

**Akzeptanz**: Spieler hört die Welt — ohne dass je ein Asset geladen werden muss (alles synthetisiert).

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
