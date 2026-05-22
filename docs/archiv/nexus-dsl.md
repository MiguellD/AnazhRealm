# Nexus-DSL – Design-Doc (v0.1)

Status: **Diskussionsentwurf**. Kein Code wird geschrieben, bis diese Doc abgenommen ist.

## 1. Vision

AnazhRealm hat ein erklärtes Vorhaben: **eine Welt, die sich selbst weiterentwickelt, gesteuert durch Chat.** Aktuell ist davon nur die Hülle da – der „Nexus" wählt eines von drei hartcodierten `new Function()`-Schnipseln aus. Echte Evolution findet nicht statt.

Diese DSL füllt die Hülle. Sie ist die **gemeinsame Sprache** von

- **Mensch**, der via Chat („Spawne 5 Bäume bei mir", „Mach es regnen") Effekte aufruft, und
- **Nexus**, der zufällige/zielgerichtete Kombinationen aus denselben Primitiven baut.

Beide schreiben in dasselbe Format. Beide werden im Save persistiert. Beide sind reproduzierbar abspielbar. Mensch und KI sind Co-Creator.

## 2. Anforderungen (was die DSL leisten muss)

| # | Anforderung | Warum |
|---|---|---|
| R1 | **Sicher** – keine direkten Aufrufe auf `eval`, `new Function`, `fetch`, DOM | CSP-clean, deployable auf GitHub Pages |
| R2 | **Persistierbar** – jeder DSL-Baum ist reines JSON | Save/Load funktioniert vollständig |
| R3 | **Komponierbar** – Effekte lassen sich verschachteln | Wachsende Komplexität ohne Sprach-Erweiterung |
| R4 | **Begrenzt** – Tiefe, Spawn-Anzahl, Laufzeit hart gedeckelt | Nexus kann nicht aus Versehen die Welt killen |
| R5 | **Beobachtbar** – jede Ausführung liefert ein Outcome-Objekt | Fitness-Bewertung, Logging, Debugging |
| R6 | **Übersetzbar** – Chat-Strings ↔ DSL ↔ Mensch-lesbare Beschreibung | Mensch und Maschine verstehen sich |
| R7 | **Versionierbar** – Schema-Version im Save, Migration möglich | Wir können die DSL später erweitern, ohne alte Saves zu töten |
| R8 | **Klein anfangen** – ~20 Primitive sind genug für Tausende Kombinationen | Geringer Initial-Aufwand, große Wirkung |

## 3. AST-Format

Ein DSL-Programm ist ein **Array** mit `[opName, ...args]`. Args können Literale (`number | string | boolean | null`) oder verschachtelte Programme sein.

**Beispiel** – Spielererfahrung: regnet, 3 Sekunden später werden 5 traurige Kreaturen verstreut gespawnt:

```json
["chain",
  ["weather", "rainy"],
  ["delay", 3,
    ["repeat", 5,
      ["spawn_creature", ["random_position", 30], 1, "sad"]
    ]
  ]
]
```

Warum Array-Form (statt `{op, args}`)?
- ~30 % kompakter im Save.
- Liest sich wie eine Lisp-S-Expression. Pattern-Matching im Interpreter ist trivial.
- Mensch-lesbare Übersetzung („Wetter rainy, dann nach 3s 5 traurige Kreaturen…") ist Tree-Walk.

## 4. Primitive (Welt-Effekte)

Diese ändern den Spielzustand. Reihenfolge: **die V1-Liste, die zur Migration alter `getNexusIdeas()`-Effekte ausreicht und etwa 80 % aller Chat-Befehle abdeckt**.

| Op | Args | Wirkung |
|---|---|---|
| `weather` | `(name: string)` | Setzt Wetter. `name ∈ {"sunny", "rainy"}` |
| `gravity` | `(value: number)` | Setzt Welt-Gravitation. Clamp `[-30, 0]` |
| `terrain_steepness` | `(value: number)` | Clamp `[0.1, 2.0]`. Triggert Welt-Regen erst beim nächsten Cooldown-Tick |
| `terrain_base_height` | `(value: number)` | Clamp `[-50, 50]` |
| `time_of_day` | `(value: number)` | `0..1`, beeinflusst Skybox-Helligkeit |
| `skybox_color` | `(color: string)` | Hex- oder Named-Color |
| `spawn_creature` | `(position, count: int, emotion: string)` | `position`: Sub-Programm (s.u.). `count` clamp `[1, 20]`, vom Spawn-Budget abgezogen |
| `spawn_tree` | `(position, count: int)` | Pflanzt Bäume |
| `spawn_island` | `(near_position, height: number)` | Erzeugt fliegende Insel |
| `spawn_ufo` | `(position)` | UFO platzieren |
| `creatures_color` | `(color: string)` | Färbt alle Kreaturen |
| `creatures_emotion` | `(emotion: string)` | Setzt Emotion für alle Kreaturen |
| `creatures_speed_mul` | `(factor: number)` | Multiplikator auf Bewegung. Clamp `[0.1, 5]` |
| `creatures_size_mul` | `(factor: number)` | Skalierung. Clamp `[0.5, 3]` |
| `player_jump_power` | `(value: number)` | Clamp `[5, 40]` |
| `player_speed` | `(value: number)` | Clamp `[1, 30]` |
| `player_size_mul` | `(factor: number)` | Clamp `[0.5, 2]` |
| `say` | `(message: string)` | Schreibt eine Zeile in den Chat-Output (Nexus „spricht") |
| `set_visible` | `(target: "terrain"\|"creatures", visible: bool)` | Whitelist-basiertes Sichtbarkeits-Toggle. Unbekannte Targets → Log + No-op. |
| `record_narrative` | `(text: string)` | Schreibt einen Eintrag in `state.knowledgeBase` als `narrative`. Cap 500 Zeichen. |

→ **20 V1-Primitive**, alle CSP-clean, alle persistierbar, alle mit harten Grenzen.

## 5. Control-Flow & Komposition

| Op | Args | Wirkung |
|---|---|---|
| `chain` | `(...effects)` | Effekte sequentiell, alle synchron im selben Frame |
| `delay` | `(seconds: number, effect)` | Effekt wird nach `seconds` ausgeführt. Clamp `[0, 60]` |
| `repeat` | `(times: int, effect)` | Effekt `times`-mal. Clamp `[1, 20]` |
| `random` | `(...effects)` | Wählt zufällig **einen** aus |
| `random_weighted` | `({effect, weight}, ...)` | Wie `random`, mit Gewichtung |
| `when` | `(condition, then, else?)` | Bedingte Ausführung |
| `parallel` | `(...effects)` | Alle Effekte starten gleichzeitig (für Delays sinnvoll) |

## 6. Position-Selektoren (geben eine `{x, y, z}` zurück)

| Op | Args | Bedeutung |
|---|---|---|
| `at_player` | `()` | Spielerposition |
| `near_player` | `(radius: number)` | Zufallspunkt im Kreis r um Spieler. Clamp r `[1, 100]` |
| `at_origin` | `()` | `(0, 50, 0)` |
| `random_position` | `(range: number)` | Zufallspunkt im Quadrat ±range um Origin |
| `at` | `(x, y, z)` | Explizite Koordinaten |

## 7. Conditions (geben `boolean` zurück)

| Op | Args | Bedeutung |
|---|---|---|
| `fps_below` | `(value: number)` | Aktuelle FPS unter Schwelle |
| `weather_is` | `(name: string)` | Wetter-Match |
| `time_passed` | `(seconds: number)` | Sekunden seit Welt-Start |
| `creatures_count_above` | `(value: int)` | Anzahl Kreaturen-Check |
| `player_y_below` | `(value: number)` | Spieler-Höhe-Check (Sturz-Erkennung) |
| `random_chance` | `(probability: number)` | `0..1`, gibt `true` mit dieser Wahrscheinlichkeit |
| `not` | `(condition)` | Negation |
| `and` | `(...conditions)` | UND |
| `or` | `(...conditions)` | ODER |

→ Bewusst klein gehalten. Mehr Bedingungen kommen später, wenn der Bedarf da ist.

## 8. Ausführungs-Kontext

Jede Ausführung läuft mit einem `ctx`-Objekt:

```js
{
  state: AnazhRealmState,        // Referenz auf this.state
  startTime: 12.34,              // performance.now()/1000 bei Programm-Start
  rng: SeededRandom,             // deterministisch wenn Seed gesetzt
  budget: {
    spawnsLeft: 50,              // wird von spawn_* heruntergezählt
    depthLeft: 8,                // wird von chain/repeat/delay heruntergezählt
    timeMs: 100,                 // Wallclock-Budget für sync-Pass
  },
  scope: Map<string, any>,       // für künftige let-Bindings, V1 leer
}
```

Programme dürfen **nichts** außerhalb von `ctx.state` mutieren.

## 9. Sicherheits-Budgets

Hart kodiert, vom Nexus nicht überschreibbar:

| Budget | Default | Warum |
|---|---|---|
| `maxDepth` | 8 | Verhindert Stack-Overflow durch verschachtelte `chain`/`repeat` |
| `maxSpawns` | 50 | Verhindert „spawne 1 Million Kreaturen" |
| `maxRuntimeMs` | 100 | Verhindert Frame-Block durch Sync-Programme |
| `maxDelayedSteps` | 100 | Summe aller `repeat`-Iterationen über Delays |
| `maxConcurrent` | 32 | Maximum laufender Delay-Effekte |

Bei Überschreitung: Rest wird no-op, ein Log-Eintrag mit Schema `{event: "budget_exceeded", budget: name, program_id}`.

## 10. Mensch → DSL (Chat-Parser)

Heute: `processChatCommand` ist ein 200-Zeilen-If-Else mit String-Vergleich.
Künftig: einheitlich auf DSL.

Beispiele der Übersetzung:

| Chat-Input | Resultat |
|---|---|
| `Setze Wetter rainy` | `["weather", "rainy"]` |
| `Spawne Kreaturen 10` | `["repeat", 10, ["spawn_creature", ["at_player"], 1, "happy"]]` |
| `Erhöhe Sprungkraft um 2` | `["player_jump_power", <current+2>]` |
| `Ändere Sternenhimmel red` | `["skybox_color", "red"]` |
| `Lerne Fähigkeit foo Ändere Farbe von Kreaturen zu blau` | speichert unter Namen `foo` das Programm `["creatures_color", "blue"]` |
| `Führe Fähigkeit aus foo` | führt das gespeicherte Programm aus |
| `Heile Welt` | `["chain", ["weather", "sunny"], ["creatures_emotion", "happy"], ["gravity", -14.715]]` |

**Strategie**: Regelbasiert (Regex + Pattern) in `parseChatToDsl(text)`. Keine LLM-Anbindung nötig.
Unbekanntes Kommando → Vorschlag: „Meintest du `setze wetter rainy`?" (Levenshtein über bekannte Patterns).

## 11. Nexus-Generator (V1)

```
compose(depth = 0):
  if depth >= 5: gib einen einfachen Effekt zurück
  wähle gewichtet:
    20% chain(2-4 sub-programs)
    10% delay(0.5-5s, sub)
    10% repeat(2-5, sub)
    10% random(2-3 alternatives)
    10% when(condition, sub, else?)
    40% atomic effect (gewichtet nach Subtilität: mehr weather/spawn, weniger gravity)
```

Sub-Programme rekursiv. Tiefe 0 immer ein `chain` als Wurzel. Spawn-Positionen werden eingestreut. Counts/Werte aus zufälligen aber sinnvollen Bereichen gezogen.

**V2** wäre genetisch: Mutation existierender Programme, Crossover, Selection nach Fitness. Bewusst nicht V1.

## 12. Fitness / Bewertung

Wenn Nexus ein Programm ausgeführt hat, speichert er Outcome:

```json
{
  "id": "evo_1234",
  "program": [...],
  "at": 123.4,
  "outcome": {
    "fpsBefore": 119,
    "fpsAfter": 92,
    "playerYDelta": -3,
    "creaturesDelta": 5,
    "errors": []
  }
}
```

**V1-Fitness**: `1.0 − (fpsDamage / 100) − (errorCount × 0.5)`. Programme mit Score < 0.3 werden bei künftigen Compositions weniger gewählt.

V2 könnte Spieler-Reaktion einbeziehen (bewegt er sich mehr? schreibt er nach diesem Effekt etwas in den Chat?).

## 13. Persistenz / Save-Schema

Neuer Block im Save:

```json
{
  "version": "7.67-emotions-v1",
  "abilities": [
    {
      "name": "farbwechsel",
      "program": ["creatures_color", "blue"],
      "source": "human",
      "createdAt": 23.5
    },
    {
      "name": "auto_evo_1",
      "program": ["chain", ["weather", "rainy"], ...],
      "source": "nexus",
      "createdAt": 87.2,
      "fitness": 0.78
    }
  ],
  "evolutionHistory": [
    { "id": "evo_1234", "at": 123.4, "outcome": {...} }
  ]
}
```

Migration vom aktuellen Save (`abilities: ["terrainFlatten", "creatureDance", "gravityShift"]`):
- Beim Load wird jeder bekannte Name in das hartcodierte DSL-Equivalent expandiert
- Unbekannte Namen werden mit Warnung verworfen (wie heute schon)

## 14. Migration vom alten Code

Reihenfolge:

1. **`docs/nexus-dsl.md` finalisiert.** ← du bist hier
2. **`src/dsl/interpreter.js`** (neue Datei oder Modul) mit allen Primitiven + Tests pro Primitiv.
3. **`generateEvolution()` / `getNexusIdeas()`** schalten auf DSL um. Die alten Code-Strings werden zu DSL-Programmen:
   - `gravityShift` → `["gravity", -9.81]`
   - `creatureDance` → `["repeat", 10, ["spawn_creature", ["near_player", 5], 1, "happy"]]` (oder treuer zur Originalbedeutung)
   - `terrainFlatten` → `["terrain_steepness", current * 0.8]`
4. **`learnAbility()`** komplett ersetzt durch `parseChatToDsl()`.
5. **`new Function()` aus `createDynamicAbility()` entfernt.** Stattdessen: DSL speichern, beim Ausführen interpretieren.
6. **`addNewAbility()`** akzeptiert DSL-Programm statt JS-Funktion.
7. **Save-Migration**: alte Saves laden, abilities re-konstruieren wo möglich, Rest mit Hinweis verwerfen.
8. **CSP-Header**: in `index.html` ein restriktives `<meta http-equiv="Content-Security-Policy">` einbauen (ohne `'unsafe-eval'`).
9. **CI-Playtest erweitern**: neue Invariante „keine `new Function` mehr im Bundle" + "DSL-Interpreter wird ausgeführt".

## 15. Was NICHT zur DSL gehört

Bewusste Scope-Grenze. Diese Dinge bleiben **außerhalb** und nur dem Hauptcode zugänglich:

- Direkte Three.js-Mesh- oder Material-Manipulation
- Direkte Ammo-Body-Erzeugung
- Shader-Strings, Texture-Loading
- localStorage / fetch / Worker-Erzeugung
- Globale Hooks (window.\*, document.\*)
- Bibliotheks-Internals

Wenn ein Nexus-„Effekt" sowas braucht: nicht in der DSL umsetzen, sondern als neuen *Primitiv* hinzufügen (Doc-Review nötig).

## 16. Edge Cases

| Situation | Verhalten |
|---|---|
| Unbekannte Op | Skip, Log `{event: "unknown_op", op: name, program_id}` |
| Falscher Argumenttyp | Coerce wenn möglich (`"3"` → `3`), sonst Skip + Log |
| Zirkulärer Referenz im AST | JSON kann das nicht haben, aber zur Sicherheit: Depth-Check |
| Spieler nicht initialisiert bei `at_player` | Fallback `at_origin`, Log |
| Budget erschöpft | Rest no-op, Log einmal pro Programm |
| Async-Effekt nach `clearAbilities()` | Pending Timer prüfen `abilityStillRegistered`, sonst skip |
| Speicher-Schema-Version mismatch | Migration-Hook; wenn keiner passt: Welt frisch mit Warnung |

## 17. Phasen-Plan (revidiert nach Doc)

| Phase | Inhalt | Aufwand | Abnahme |
|---|---|---|---|
| **0** | Diese Doc | ~3 h | du liest gegen, kommentierst, ich nachbessere |
| **1** | Interpreter mit 18 Primitiven + Control-Flow + Conditions, isolierter Unit-Test pro Primitiv | 2 Tage | `npm test` grün, kein CI-Regress |
| **2** | Nexus-Generator V1 (rekursive Random-Komposition) | 1 Tag | Headless-Playtest sieht echte Evolution |
| **3** | Chat-Parser → DSL, alle alten Chat-Befehle übersetzt | 1-2 Tage | Bestehende Chat-Tests bleiben grün |
| **4** | Persistenz-Schema + Migration alter Saves | 0.5 Tage | `Lade Datei` mit altem Save funktioniert |
| **5** | Alten Code löschen: `new Function`, `createDynamicAbility`, `codeParser`, `getNexusIdeas` raus | 0.5 Tage | grep findet `new Function` nirgends |
| **6** | CSP-Header in index.html, CI-Invariante "keine eval" | 2 h | GitHub-Pages-Deploy mit strict CSP läuft |
| **7** | Fitness-V1 (FPS-Penalty), Gewichtung in Nexus-Wahl | 0.5 Tage | Evolutionen werden „besser" über Zeit |

Summe: **~7 Arbeitstage**, verteilt über 2-3 Wochen.

## 18. Offene Fragen (für deine Antwort)

1. **Async-Modell für `delay`**: nutze ich `setTimeout`? Mit pause-fähiger Timer-Liste? Oder einen DSL-eigenen Scheduler im Game-Tick (deterministischer, framerate-unabhängig)? Ich neige zu Letzterem.
2. **Soll der Nexus „sprechen"?** Der `say(...)`-Primitiv erlaubt es. Macht Evolutionen erzählerisch („Ich erschaffe Regen, damit die Kreaturen weinen.") — oder ist das Kitsch?
3. **Speichern wir Evolutions-Historie?** `evolutionHistory` im Save kann groß werden. Cap (z. B. letzte 50) oder ganz weglassen?
4. **Wie geht der Nexus mit eigenen Fehlschlägen um?** Heutiges `optimizePhysics`-Spam ist das Anti-Pattern. Mein Vorschlag: Fitness niedrig → Programm wird seltener gewählt, *fertig*. Kein automatisches „Gegen-Programm".
5. **CSP scharf machen?** Mit DSL drin können wir `script-src 'self'` ohne `'unsafe-eval'`. Aber: dann bricht `developAdvancedPhysics`/`developAdvancedRenderer` (haben heute `eval`-Verhalten via Shader-Strings). Beide löschen oder ausnehmen?
6. **Kompatibilität alter Save-Files**: hartes Reset oder Best-Effort-Migration? Empfehlung: Best-Effort + Warnung.

## 19. Was diese Doc *nicht* leistet

- Kein Code, keine konkreten TypeScript-Signaturen
- Kein UI-Mockup für künftigen DSL-Editor
- Keine Performance-Benchmarks (kommt in Phase 1 mit Interpreter)
- Keine vollständigen Beispiel-Programme (kommt mit Test-Suite)
- Keine Roadmap für V2 (genetisch / LLM-backed) – das wird ein eigener Diskurs

---

**Nächster Schritt**: Du liest, markierst was unklar / falsch / über- oder untergewichtet ist. Ich überarbeite. Erst danach Phase 1.
