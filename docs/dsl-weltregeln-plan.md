# Die DSL in voller Tiefe — von der GESTEN-Sprache zu WELT-REGELN

> **Vision-Anker + Arc-Plan (Schöpfer-Auftrag 01.06.2026).** Lies dies, BEVOR du
> an der DSL, dem Nexus, der „sich-selbst-definierenden Welt" oder der Bibliothek
> von Alexandria arbeitest. Es ist der Plan für den **tiefsten offenen Fleck**:
> die DSL von einer Sammlung einmaliger Gesten zu einem **Substrat aus stehenden
> Regeln**, das eine Welt DEFINIERT — der Schritt, der „die Hülle steht" zu „die
> Welt versteht + definiert sich selbst" trägt.
>
> Verwandte Anker: `das-lebendige-feld.md` (der wahre Norden — das Feld, das alle
> lesen+schreiben; §3.4 ist die DSL-Lücke), `state-of-realm.md` §4.2 (warum die DSL
> das Fundament ist), `archiv/nexus-dsl.md` (das Original-Design, Ring 2).

---

## 0. Reflexion — wo wir stehen (ehrlich)

Der **erste Feld-Bogen ist rund** (V17.21–V17.32): das Feld wird gelesen (`auraAt`),
es wird geschrieben (Leben- + Emotions-Overlay), der Nexus liest es + heilt gezielt,
die Emotion leitet sich aus dem Sein-in-der-Welt ab und färbt die Welt kontinuierlich
UND räumlich. Zwei der Feld-Achsen (lebendig, emotion) sind echte schreibbare,
räumliche, KONSUMIERTE Achsen. Das Fundament wächst logisch, gemessen, ohne Sand.

**Aber der wahre Norden ist nur zur Hälfte erreicht.** `das-lebendige-feld.md` nennt
zwei Hälften: das **Aura-Feld (lesen)** und die **DSL/der Nexus (schreiben)** — und
sagt: sie sind DASSELBE. Wir haben die Feld-Hälfte vertieft. Die DSL-Hälfte ist noch
flach: der Nexus würfelt EINMALIGE Gesten, die Welt ist ein **hardcodierter Kern +
Seed + dünne Gesten-Schicht** — NICHT „ein Set von Regel-Programmen, das die Welt
definiert" (§4.2). Das ist der Fleck, der am weitesten von der Vision weg ist.

Diese Doc plant, ihn zu schließen — in maximaler Synergie mit allem, was schon steht
(das Feld, der Nexus, die Fitness, der Chat, die Bibliothek-Infrastruktur).

---

## 1. Was BESTEHT (gemessen aus dem Code, 01.06.2026)

Die DSL ist real und reif — als **Gesten-Sprache**. Die Bausteine:

### 1.1 Das AST + der Interpreter

- **AST-Format** (`archiv/nexus-dsl.md` §3): ein Programm ist `[opName, ...args]`,
  Args sind Literale oder verschachtelte Programme. Reines JSON → serialisierbar,
  signierbar, diff-bar, merge-bar (Lisp-S-Expression-Form).
- **`dslRun(program, opts)`** (~Z1226): die Sandbox. Snapshot (FPS/Y/Kreaturen/
  Emotion/Activity) VOR dem Lauf → `dslEval` → Outcome-Objekt (FPS-Schaden, Bewegung,
  Kreatur-Delta, Fehler). `source`-Feld ("human"/"nexus"/"remote:…"/"llm:grok"/
  "creature:…"). Bei `source==="human"` + keine privaten Ops → P2P-Broadcast.
- **`dslEval(program, ctx)`** (~Z1373): dispatcht `program[0]` → `dslEffects[op]`.
  Budget: Tiefe 8, Laufzeit 100 ms, Spawns 50, delayedSteps 100.
- **`dslEvalCond(node, ctx)`** (~Z1427): evaluiert eine Bedingung → boolean.
- **`dslCtx(opts)`** (~Z1204): `{state, realm, rng, budget, log, source, programId}`;
  optional seed-deterministische LCG-RNG.

### 1.2 Die drei Op-Familien (alle als gecachte Getter, Tabelle-IST-die-Regel)

- **`dslEffects`** (~Z1471–2395) — die WELT-EFFEKTE (~73 Ops): `weather`, `gravity`,
  `time_of_day`, `skybox_color`, `spawn_creature`, `spawn_village/temple/waterfall`,
  `spawn_tree/blueprint/fractal`, `creatures_color/emotion/speed_mul/size_mul`,
  `player_jump_power/speed/size_mul/soul`, `say`, `set_visible`, `record_narrative`,
  `modify_terrain`, `voxel_carve/fill`, `define_blueprint`, `creature_task*`, … —
  ALLE imperativ-einmalig (sie tun X EINMAL beim Ausführen).
- **`dslPositions`** (~Z2398–2471) — die ORT-Resolver: `at_player`, `near_player`,
  `at_origin`, `random_position`, `at`, `at_player_forward`, `at_field_need` (V17.26,
  liest das Feld!), `at_player_chunk`. Geben `{x,y,z}`.
- **`dslConditions`** (~Z2473–2522) — die BEDINGUNGEN (boolean): `fps_below`,
  `weather_is`, `time_passed`, `creatures_count_above`, `player_y_below`,
  `random_chance`, `emotion_above`, `compound_has_tag`, `compound_has_spatial_tag`,
  sowie die Kombinatoren `not`/`and`/`or`. **Das ist der Schlüssel: die Sprache KANN
  schon fragen „wann gilt etwas?".**

### 1.3 Control-Flow (Komposition)

`chain` (sequentiell), `delay` (Scheduler via `state.dsl.pending` + `dslTick`),
`repeat`, `random`/`random_weighted` (eins wählen), **`when` (Bedingung → then/else,
EINMALIG evaluiert, ~Z2388)**, `parallel`. Komponierbar bis Tiefe 8.

### 1.4 Der Nexus — Generator + Evolution + Fitness

- **`dslComposeAtomic(rng)`** (~Z2698): würfelt EINEN Atom aus einer gewichteten
  Liste (~15 Einträge), gebiast durch Emotion (joy/sorrow → sunnyBias) + Feld (auraAt
  → lebendig/glut) + resonante Farbe. **Liest das Feld schon (V17.22/.26).**
- **`dslCompose()`** (~Z2633): rekursive Baum-Komposition (Tiefe 0–5) ODER Pattern-
  Memory (25 %, aus Chat-Keywords) ODER Fitness-Selektion (30 %, aus History).
- **`dslMutate(program)`** (~Z2563): klont + mutiert einen Knoten (40 % neuer Atom,
  40 % Zahlen ±20 %, 20 % Chain-Kopf-Tausch).
- **`dslSelectByFitness(rng)`** (~Z2536) + **Fitness-Formel** (~Z3006):
  `0.5·fpsScore + 0.3·emotionScore + 0.2·activityScore`, 5 s nach Lauf finalisiert
  (Roulette-Wheel).
- **Scheduler**: `evolveNexus` alle 10 s (~Z14323) → `generateEvolution` (`dslCompose`,
  ~Z14345) → Queue → `_loopNexusUpdate` (~Z41557) führt aus + journaled + Fitness.
- **Persistenz**: `state.dsl` (~Z446) — `abilities[]`, `history[]` (Cap 500),
  `patternMemory{}` (Keyword → Top-8 Programme), `pending[]`, `pendingOutcomes[]`.

### 1.5 Mensch → DSL

`processChatCommand` → `_chatTryDslParse` → `parseChatToDsl` (~Z7437, Regex-Pattern
`chatDslPatterns` ~Z6975) → `dslRun(program, {source:"human"})`. „heile welt" →
`["chain", ["weather","sunny"], ["creatures_emotion","happy"], …]`. Mensch + Nexus
schreiben in DASSELBE Format.

### 1.6 Die Bibliothek-Infrastruktur steht (W12–W17, V8.58+)

Welt-Identität (`worldId`/`slug`/`creator`/`parentWorlds`), Export/Import als JSON,
Welt-Fusion (`mergeWorlds`), Multi-User-Sync (WebRTC/Signaling), Sub-Welten-Portale.
**Was fehlt, ist NICHT die Bibliothek-Hülle — es ist der INHALT: dass eine Welt
WIRKLICH aus Regel-Programmen besteht, die man mergen kann.**

---

## 2. Die GESCHICHTE (warum es so ist, wie es ist)

- **Ring 2 (`archiv/nexus-dsl.md`, 2025):** die DSL wurde geboren, um die `new
Function()`-Hülle zu ersetzen — eine sichere, CSP-clean, persistierbare Gesten-
  Sprache. 20 Primitive, ein Interpreter, ein Nexus-Generator, eine Fitness. Das
  Original-Phasen-Plan (§17) endete bei „Fitness-V1" — **stehende Regeln waren NIE
  Teil von Ring 2** (bewusst klein angefangen, R8 „klein anfangen").
- **§15 „Was NICHT zur DSL gehört":** Three.js/Ammo/Shader/localStorage/fetch bleiben
  außerhalb. Die DSL komponiert PRIMITIVE, sie greift nie roh in die Engine. (Diese
  Grenze bleibt heilig — auch Regeln respektieren sie.)
- **Warum die DSL bewusst DÜNN blieb** (`das-lebendige-feld.md` §3.4 + §6): drei echte
  Gründe — **Performance** (ein DSL-Tick darf die 119 FPS nicht fressen),
  **Determinismus** (Welt-Geometrie-Ops brechen den Multi-User-Seed → `terrain_*`/
  `voxel_*`/`spawn_*` sind bewusst NICHT im Nexus-Generator-Pool), und die **Heilige
  Lektion** (kein Re-Komplexifizieren). Das war RICHTIG — und es ist der Grund, warum
  die nächste Stufe VERDICHTUNG sein muss, kein Urknall.
- **Der V17-Feld-Bogen hat die Voraussetzung geschaffen:** das Feld ist jetzt
  SCHREIBBAR (Overlays) + reaktiv-getrennt vom frozen Worldgen-Kern. Damit existiert
  endlich ein **deterministisch-sicherer Schreib-Raum** (die reaktive Schicht), in den
  Regeln schreiben können, OHNE den Seed zu brechen. Das ist der fehlende Stein, der
  Regeln jetzt möglich macht (und 2025 noch nicht da war).

---

## 3. Die VISION (was „die Welt IST ein Set von DSL-Bäumen" bedeutet)

`state-of-realm.md` §4.2: **Eine Welt zu mergen heißt: mische die Regel-Programme.**
Eine Welt = ein Set von DSL-Bäumen + deterministische Seeds + Spieler-Geschichte.

- AST in JSON → serialisierbar, signierbar, diff-bar, `merge(A,B) = ["chain", A, B]`.
- Primitive begrenzt → keine fremde Welt killt meine (Budget).
- Komponierbar → wachsende Komplexität ohne Sprach-Erweiterung.

`das-lebendige-feld.md` §2 (der geniale Twist): **Lesen (Aura-Feld) und Schreiben
(DSL/Nexus) sind DASSELBE.** Der Nexus liest das Feld, um zu entscheiden, was er
schreibt → die Welt versteht sich selbst und wächst. EIN lebendiges Feld, das alle —
Mensch · KI · Nexus · Kreaturen · die Welt selbst — lesen UND schreiben.

**Übersetzt in eine prüfbare Definition:** die Welt soll nicht durch fixe Funktionen
GENERIERT + durch einmalige Gesten GEPOKED werden, sondern durch einen lebenden
**Regel-Satz GOVERNED** werden — stehende `Bedingung → Effekt`-Regeln, die das Feld
lesen und schreiben, die der Nexus + der Mensch komponieren + evolvieren, die
persistiert + merge-bar sind. Der Seed gibt die geologische Identität (Terrain/Wasser),
der Regel-Satz gibt die LEBENDE Identität (wie die Welt fühlt, reagiert, wächst).

---

## 4. Die LÜCKE, präzise (Geste vs. Regel)

|                | Heute (Geste)                               | Vision (Regel)                                             |
| -------------- | ------------------------------------------- | ---------------------------------------------------------- |
| Form           | `["weather","rainy"]` — tu es EINMAL        | `["rule", "wenn sorrow hoch → Regen"]` — gilt FORTLAUFEND  |
| Auslöser       | der Nexus-Tick / ein Chat-Befehl            | eine BEDINGUNG, die der Engine-Tick prüft                  |
| Lebensdauer    | ein Frame                                   | bis die Regel entfernt/zerfallen ist                       |
| Welt-Identität | hardcodierter Kern + Seed + Gesten-Spur     | Seed + **stehender Regel-Satz**                            |
| Emotion→Welt   | hand-codierte `trigger()`-Calls (§3.2-Rest) | eine Regel `["rule", emotion_above sorrow, weather rainy]` |
| Mergen         | sinnlos (Gesten sind vergangen)             | `merge = Vereinigung der Regel-Sätze` (Bibliothek)         |

**Der Kern:** die DSL hat schon `when` (Bedingung→Effekt) — aber EINMALIG. Die ganze
Lücke ist: ein `when`, das **STEHT** (im Engine-Tick fortlaufend geprüft wird), in
einem **Registry persistiert** ist, und das **Feld lesen+schreiben** kann. Das ist
eine dünne, geniale Bindung über alles, was schon da ist — kein neues System.

---

## 5. Der geniale LEAP — die EINE neue Idee

> **Ein `rule`-Primitiv = ein `when`, das nicht verfällt: eine stehende
> `Bedingung → Effekt`-Bindung im `state.worldRules`-Registry, die ein
> rate-limitierter Welt-Tick fortlaufend evaluiert. Eine Welt = ihr Regel-Satz +
> Seed. Die Regeln LESEN das Feld (Bedingungen) und SCHREIBEN das Feld (Effekte) —
> damit sind Lesen und Schreiben endlich DASSELBE Substrat (der wahre Norden).**

Alles andere ist Verdichtung des Vorhandenen:

- Die Bedingung = `dslConditions` (existiert) + neue FELD-Bedingungen (`field_above`).
- Der Effekt = `dslEffects` (existiert) + neue FELD-Effekte (`deposit_life/emotion`).
- Der Tick = ein neuer `_tickWorldRules` (wie `_tickX`, aber EINER, generisch).
- Der Generator = der Nexus komponiert/mutiert/selektiert jetzt RULE-förmige Programme
  (die bestehende Maschinerie, nur ein neuer Atom-Typ).
- Die Persistenz = `state.worldRules` im Snapshot (die Bibliothek-Hülle steht schon).
- Der Mensch = ein Chat-Pattern „wann immer X, dann Y" → eine Regel.

---

## 6. Der PHASEN-PLAN (alle Teilschritte, Verbindungen, Abläufe, Lösungen)

Jede Phase ist EINE Welle, klein-fokussiert, gemessen, additiv. Die Reihenfolge ist
eine Abhängigkeitskette: A ist das Fundament, B macht es lebendig (Feld-Kopplung), C
macht es selbst-wachsend (Nexus), D gibt dem Menschen die Feder, E macht es zur Welt-
Identität (Bibliothek).

### Phase A — Das `rule`-Primitiv + Registry + Welt-Tick (die Geste wird Gesetz) — ✅ GEBAUT (V17.33)

**Das kleinste kohärente Stück: ein `when`, das steht.**

> **Status (V17.33, 01.06.2026):** vollständig gebaut + gemessen wie unten geplant.
> `state.worldRules` (Registry) · der `rule`-Effekt-Op (`_registerWorldRule` mit Cap
> 64 + Dedup + `_evictWorldRule`) · `_tickWorldRules` (Budget 4/Frame, `everySec`-Gate,
> TTL-Compaction, Re-Entrancy via Längen-Erfassung) · `_worldRuleCtx`/`_worldRuleSeed`
> (deterministische Regel-RNG aus `worldId+ruleId+fireIndex`) · `AnazhRealm.WORLD_RULES`
> (frozen Config-Static). Verdrahtet im Loop nach `dslTick`. GEMESSEN:
> `checkBandV1733WorldRules` (11 Invarianten grün — alle §6-A-Abnahmepunkte). Die vier
> harten Probleme (Performance/Determinismus/Runaway/Re-Entrancy) sind an der Wurzel
> gelöst (siehe CLAUDE.md-Gotcha „stehende Welt-Regel"). **Nächst: Phase B.**

- **Daten:** `state.worldRules = []` — jede Regel `{id, cond, effect, everySec,
lastFired, source, ttlSec?, born}`. (`cond`/`effect` sind DSL-AST-Knoten.)
- **Schreib-API (EINE):** der Effekt-Op **`rule`** in `dslEffects`:
  `["rule", condNode, effectNode, {everySec?, ttlSec?}]` registriert eine Regel in
  `state.worldRules` (statt sie einmal auszuführen). Damit ist „eine Regel aufstellen"
  selbst ein DSL-Akt → Mensch + Nexus stellen Regeln über DENSELBEN Pfad auf.
- **Der Tick:** `_tickWorldRules(currentTime)` — EINMAL pro Frame, im Loop nach den
  bestehenden Ticks. Iteriert `worldRules`: pro Regel, wenn `currentTime-lastFired ≥
everySec` UND `dslEvalCond(cond)` → `dslEval(effect, ruleCtx)`; `lastFired` setzen.
  Abgelaufene (`ttlSec`) entfernen.
- **Lösungen (die harten Probleme, an der Wurzel):**
    - _Performance:_ ein **globales Budget** (max N Regel-Effekte/Frame, z. B. 4) +
      per-Regel `everySec` (Default ~1–3 s) + die Bedingungen sind O(1). Die Iteration
      über einen gebounded Regel-Satz (Cap, s. u.) ist billig. (V17.27-Lazy-Disziplin.)
    - _Determinismus:_ der Tick läuft mit einer **deterministischen Regel-RNG** (seed
      aus `worldId + ruleId`), NICHT `Math.random` → zwei Peers mit demselben Regel-Satz
      sehen denselben Lauf (modulo Float, akzeptabel für die reaktive Schicht). Regeln
      schreiben NUR die reaktive Schicht (s. Phase B), nie den frozen Worldgen.
    - _Runaway:_ ein **Regel-Cap** (z. B. 64) + Fitness-Pruning (Phase C) + `ttlSec` für
      Nexus-Regeln (sie verfallen, wenn sie nicht über Fitness erneuert werden).
    - _Re-Entrancy:_ eine Regel darf keine Regel-Aufstellung triggern, die im selben Tick
      wieder feuert → der `rule`-Effekt registriert nur, der Tick führt frühestens
      nächsten Frame aus (das `lastFired`-Gate verhindert Sofort-Kaskaden).
- **Verbindung:** reuse `dslEvalCond` + `dslEval` 1:1. Der `ruleCtx` ist ein `dslCtx`
  mit reduziertem Budget (ein Regel-Effekt ist klein).
- **Gemessen:** eine Regel `["rule", ["emotion_above","sorrow",0.5], ["weather",
"rainy"], {everySec:2}]` aufstellen → sorrow hochsetzen → nach dem Tick ist das
  Wetter rainy; sorrow runter → die Regel feuert nicht mehr; `ttlSec` entfernt sie;
  das Budget kappt die Effekte/Frame; Determinismus (zwei Läufe gleicher Seed gleich).
- **Damit ist die Welt zum ersten Mal REGEL-getrieben, nicht nur gepoked.**

### Phase B — Feld-Bedingungen + Feld-Effekte (Lesen und Schreiben werden DASSELBE) — ✅ GEBAUT (V17.34)

**Die Regeln greifen ans lebendige Feld — der geniale Twist wird Code.**

> **Status (V17.34, 01.06.2026):** vollständig gebaut + gemessen wie unten geplant.
> Bedingungen `field_above`/`field_below` (`_dslFieldAxisAt` liest `auraAt` — 4 frozen
> Achsen + 6 räumliche emotion-Achsen) · Effekte `deposit_life`/`deposit_emotion`
> (rufen `_depositLife`/`_depositEmotion`) · `_dslRulePos` (Default `at_player`).
> GEMESSEN: `checkBandV1734FieldRules` (7 grün — inkl. der HEILUNGS-Regel, die den
> Loop schließt: field_below lebendig → deposit_life → steigt → stoppt bei Sättigung).
> Der V17.26-„trag-Leben-in-den-Mangel"-Gedanke ist jetzt als Regel ausdrückbar
> (`field_below lebendig` → `deposit_life at_field_need`). **Nächst: Phase C.**

- **Neue Bedingungen** (`dslConditions`): `field_above([axis, value, posNode?])` /
  `field_below(...)` — liest `auraAt(pos).<axis>` (lebendig/glut/magie/emotion-Achsen).
  Default-Position = `at_player`. (Reuse `dslPositions` + `auraAt`.)
- **Neue Effekte** (`dslEffects`): `deposit_life([posNode, amount?])` →
  `_depositLife` (V17.27); `deposit_emotion([axis, amount, posNode?])` →
  `_depositEmotion` (V17.32). **Damit kann eine Regel schreiben, was eine andere
  liest** — der Feld-Kreis schließt sich INNERHALB der Sprache.
- **Verbindung/Synergie:** jetzt ist `at_field_need` (V17.26, schon da) eine Position,
  `field_below lebendig` eine Bedingung, `deposit_life` ein Effekt → die V17.26/.27-
  Heilungs-Logik („trag Leben in den Mangel") wird als REGEL ausdrückbar, statt
  hardcodiert im `dslComposeAtomic`. Die Welt heilt sich per Regel, nicht per Sonderfall.
- **Determinismus-Disziplin:** Feld-Effekte schreiben NUR die reaktiven Overlays (nicht
  persistiert, kein Worker-Mirror — die V17.27/.32-Trennung). Der frozen Kern bleibt
  seed-rein. Deshalb sind Feld-Regeln multi-user-sicher.
- **Gemessen:** eine Regel `["rule", ["field_below","lebendig",0.2],
["deposit_life", ["at_player"]], {everySec:3}]` → an einem kargen Ort steigt
  lebendig über die Zeit; an einem üppigen feuert sie nicht (Bedingung false).

### Phase C — Der Nexus EVOLVIERT Regeln (die Welt wächst ihre eigene Logik) — ✅ GEBAUT (V17.35)

**Die bestehende Generator/Mutate/Fitness-Maschinerie auf Regeln anwenden.**

> **Status (V17.35, 01.06.2026):** vollständig gebaut + gemessen. `dslComposeRule` +
> `dslComposeRuleCondition` (Feld-LESE-Bedingungen, resonant) + `dslComposeRuleEffect`
> (Feld-SCHREIB-Effekte `deposit_life`/`deposit_emotion`, nur reaktiv-sicherer Pool) ·
> `generateEvolution` mit `composeRuleProb` (Regel statt Geste) · `_loopNexusUpdate`
> trennt Regel-Evolutionen ab (Fitness in worldRules, nicht im Gesten-Finalizer) ·
> **per-Regel-Fitness** `_worldRuleFitness` (Engagement+Kosten+Erfolg, attributierbar —
> NICHT die globale Emotion-Trend, das wäre der Passagier-Trugschluss) · Lifecycle im
> `_tickWorldRules`-TTL-Zweig (gut → erneuern, schlecht/inert → verfallen) · Heredity via
> `_composeNexusRule` (mutierter Nachkomme eines Überlebenden, `dslMutate` robust).
> GEMESSEN: `checkBandV1735NexusEvolvesRules` (11 grün). **EHRLICH:** die Fitness selektiert
> für cheap+working+ENGAGED (relevant) Regeln; die tiefere „macht-die-Regel-glücklicher"-
> Attribution ist eine spätere Vertiefung (braucht kontrollierte per-Regel-Attribution).
> **Nächst: Phase D.**

- **`dslComposeAtomic`** bekommt einen neuen gewichteten Eintrag: baue eine `rule`
  (komponiere cond aus `dslConditions` + die Feld-Bedingungen, effect aus dem
  bestehenden Atom-Pool). So WÜRFELT der Nexus Regeln, nicht nur Gesten.
- **`dslMutate`** mutiert Regeln (cond-Achse/Schwelle, effect, everySec) — fällt schon
  aus dem generischen AST-Walk (eine Regel ist ein Knoten).
- **Fitness für Regeln (der tiefe Teil):** eine Regel wird nicht in 5 s bewertet (sie
  WIRKT über Zeit). Lösung: die bestehende `pendingOutcomes`-Mechanik erweitern → eine
  Regel sammelt ihre Outcomes über ein FENSTER (z. B. 30–60 s: FPS-Schaden, Emotion-
  Trend, Activity), die Fitness ist der Mittelwert. Niedrige Fitness → die Regel
  zerfällt (`ttlSec` läuft ab, wird nicht erneuert); hohe Fitness → der Nexus erneuert/
  verstärkt sie. **Damit lernt die Welt, welche Regeln sie „gesünder/lebendiger/
  glücklicher" machen** — fraktales Wachstum aus echter Bewertung (kein rich-get-richer:
  Cap + Decay + Diversitäts-Floor 0.05, wie schon im Fitness-Code).
- **Verbindung:** der Nexus liest das Feld (V17.22) → komponiert eine resonante Regel
  (z. B. in einer glut-Region eine Feuer-Regel) → die Regel wirkt → Fitness → Selektion.
  Der ganze V17.22–.26-Resonanz-Gedanke wird stehend statt momentan.
- **Gemessen:** über N Nexus-Zyklen steigt die mittlere Regel-Fitness; eine FPS-
  schädliche Regel wird gepruned; eine emotion-hebende überlebt.

### Phase D — Mensch → Regeln (der Schöpfer gibt der Welt Gesetze) — ✅ GEBAUT (V17.36)

**Der Chat-Parser lernt die Regel-Form.**

> **Status (V17.36, 01.06.2026):** vollständig gebaut + gemessen. `_chatTryRuleCommand`
> matcht „wann immer/immer wenn/jedes mal wenn/sobald X (,|dann) Y" → `["rule", cond,
> effect, {everySec:3}]` (Mensch-Regel, permanent). Synergie: der EFFEKT (Y) über
> `_parseChatEffect` (reuse `chatDslPatterns`), die BEDINGUNG (X) über `_parseChatCondition`
> (Sprache → Feld/Stimmung-Bedingung). Whitelist-Wand `RULE_FORBIDDEN_EFFECT_OPS` +
> `_isRuleEffectAllowed` (der V17.33-Caveat: Mensch-Regel darf den frozen Worldgen nicht
> anfassen). Sichtbarkeit: „zeige regeln" (via `describeProgram(rule)`) + „vergiss regeln".
> GEMESSEN: `checkBandV1736HumanRules` (11 grün). **EHRLICH (D-2, Schöpfer-Klärung):** die
> immer-sichtbare Anzeige der Gesetze ist KEIN Parallel-Panel, sondern eine „Gesetze"-
> SEKTION in der BESTEHENDEN Fähigkeiten-UI (`renderAbilitiesList`/`#status-abilities`) —
> dasselbe describeProgram-Row-Pattern, aber statt ▶ (Fähigkeit = invoke-once-Geste) ein
> „vergiss"-✕ + ein aktiv/feuert-Indikator (Regel = stehendes Gesetz). Heilige Lektion:
> eine Fläche für die DSL-Logik der Welt, zwei Naturen. Optionaler Browser-Audit-Schliff.
> **Nächst: Phase E.**

- **Neue `chatDslPatterns`:** „wann immer/immer wenn <Bedingung>, dann <Effekt>" →
  `["rule", cond, effect]`. Beispiele: „immer wenn es Nacht wird, spawne Glühwürmchen",
  „wann immer ich traurig bin, lass es regnen", „halte diese Lichtung lebendig".
  (Reuse die bestehende Pattern-→-Programm-Pipeline; nur neue Pattern + ein Cond-Parser.)
- **UI/Transparenz:** ein „Welt-Regeln"-Panel (reuse das Bibliothek/DSL-Drawer-Muster)
  listet die aktiven Regeln menschen-lesbar (`describeProgram` erweitern um `rule`) —
  der Schöpfer SIEHT die Gesetze seiner Welt + kann sie löschen. (Vision: der Mensch
  liest, was er + der Nexus + die KI geschrieben haben.)
- **Verbindung:** Mensch-Regeln gehen über DENSELBEN `rule`-Effekt + Registry wie
  Nexus-Regeln → ein Regel-Satz, zwei Autoren (der Co-Schöpfer-Kreis, Pfeiler 1).
  `source` unterscheidet sie (für Fitness/Persistenz/Broadcast).

### Phase E — Persistenz + die Bibliothek wird WAHR (eine Welt IST ihr Regel-Satz)

**Der Regel-Satz wird Welt-Identität.**

- **Persistenz:** `state.worldRules` in `buildStateSnapshot` + `loadState` (mit festem
  Feld-Satz, V8.59-Disziplin) — ABER nur Mensch/persistente Regeln (Nexus-Experimente
  mit niedriger Fitness sind ephemer, wie die reaktive Schicht). Schema-Version + Cap.
- **Bibliothek/Merge:** `mergeWorlds` (existiert) vereinigt die Regel-Sätze:
  `rulesC = dedupe([...rulesA, ...rulesB])` mit Namespace-Präfix bei Konflikt (§4.2 R3).
  Export/Import (W14) trägt die Regeln als JSON. **Damit ist „eine Welt IST ein Set von
  DSL-Bäumen" WAHR:** zwei Welten heiraten = ihre Gesetze verschmelzen.
- **Determinismus beim Sharing:** der Empfänger läuft denselben Regel-Satz mit der
  deterministischen Regel-RNG → dieselbe reaktive Evolution (die Bibliothek-Vision war
  immer auf JSON-AST + Budget + CSP gebaut, genau hierfür).
- **Gemessen:** eine Welt mit 5 Regeln exportieren → importieren → die Regeln laufen;
  zwei Welten mergen → der Regel-Satz ist die Vereinigung; ein Reload bewahrt die
  Mensch-Regeln.

---

## 7. Die SYNERGIEN (warum das maximal effizient ist — alles ist schon da)

| Regel-Baustein | reuse von                                      | (kein neuer Code)                     |
| -------------- | ---------------------------------------------- | ------------------------------------- |
| Bedingung      | `dslConditions` + `dslEvalCond`                | + Feld-Bedingungen (Phase B)          |
| Effekt         | `dslEffects` (73 Ops) + `dslEval`              | + Feld-Effekte (Phase B)              |
| Position       | `dslPositions` (inkl. `at_field_need`)         | —                                     |
| Registrierung  | der `rule`-Effekt (ein Op) + ein Array         | —                                     |
| Tick           | EIN `_tickWorldRules`                          | (das `_tickX`-Muster, aber generisch) |
| Komposition    | `dslComposeAtomic`/`dslCompose`/`dslMutate`    | + ein Atom-Typ                        |
| Bewertung      | `pendingOutcomes` + Fitness-Formel             | + ein Zeitfenster (Phase C)           |
| Mensch         | `chatDslPatterns` + `parseChatToDsl`           | + Regel-Pattern (Phase D)             |
| Persistenz     | `buildStateSnapshot`/`loadState`               | + ein Feld (Phase E)                  |
| Sharing        | `mergeWorlds`/Export/Import/Broadcast          | (steht seit W12–W17)                  |
| Sicherheit     | Budget + Op-Whitelist + §15-Grenze + CSP       | (heilig, unverändert)                 |
| Schreib-Raum   | die reaktiven Overlays (Feld/Wetter/Kreaturen) | (V17.27/.32 — der fehlende Stein)     |

**Die DSL-Hälfte und die Feld-Hälfte verschmelzen genau hier:** Regeln sind die
LOGIK, das Feld ist der ZUSTAND, den sie lesen+schreiben. Der Nexus liest, komponiert,
evolviert. Der Mensch gibt Gesetze. Die Welt versteht + definiert sich selbst.

---

## 8. Was NICHT in diese Doc/dieses Vorhaben gehört (Scope-Grenzen, heilig)

- **Keine Engine-Rohzugriffe** (§15): Regeln komponieren Primitive, nie Three.js/Ammo/
  Shader/fetch/DOM. Ein neuer Bedarf = ein neuer PRIMITIV (Doc-Review), keine Regel-
  Sonderlogik.
- **Kein Schreiben in den frozen Worldgen** aus Regeln (Determinismus): `terrain_*`/
  `voxel_*` bleiben außerhalb des Regel-/Nexus-Pools. Regeln leben in der reaktiven
  Schicht (Feld-Overlays, Wetter, Atmosphäre, Kreaturen, Emotion).
- **Kein Urknall-Rewrite:** jede Phase ist eine kleine additive Welle mit Invarianten.
  Die alten Gesten-Ops bleiben (eine Geste ist eine Regel mit `everySec=∞`/sofort).
- **Die KI (LLM) als Regel-Schreiberin** ist die KÜR nach E: Grok/das LLM bekommt die
  Regel-Grammatik als Werkzeug und schlägt Regeln vor (sie laufen durch dieselbe
  Sandbox + Fitness). Das ist der letzte Pfeiler (§3.4 „der KI-Schöpfer schreibt") —
  aber erst, wenn das Regel-Substrat steht (A–E).

---

## 9. Reihenfolge + Abnahme (der konkrete nächste Schritt)

1. ~~**Phase A** (das `rule`-Primitiv + Registry + Tick)~~ — ✅ **GEBAUT (V17.33)**: die
   Welt ist von „gepoked" zu „regel-getrieben" gehoben. Abnahme erfüllt: alle §6-A-
   Invarianten grün (`checkBandV1733WorldRules`, 11 — Regel feuert bei Bedingung, Budget
   kappt, TTL entfernt, Dedup, Cap+Eviction, Re-Entrancy, Determinismus).
2. ~~**Phase B** (Feld-Kopplung)~~ — ✅ **GEBAUT (V17.34)**: Feld-Bedingungen
   (`field_above`/`field_below`, liest `auraAt`) + Feld-Effekte (`deposit_life`/
   `deposit_emotion`, schreibt die V17.27/.32-Overlays) → Lesen und Schreiben sind
   DASSELBE Substrat. Abnahme erfüllt: `checkBandV1734FieldRules` (7 grün, inkl. der
   Heilungs-Regel-Loop).
3. ~~**Phase C** (der Nexus evolviert Regeln)~~ — ✅ **GEBAUT (V17.35)**: `dslComposeRule`
   (würfelt Regeln aus Feld-LESE-Bedingungen + Feld-SCHREIB-Effekten, resonant),
   `_composeNexusRule` (Nachkomme eines Überlebenden via `dslMutate`), per-Regel-Fitness
   über das Lebens-Fenster (`ttlSec`, der Phase-A-Hook): gut → erneuern, schlecht/inert →
   zerfallen. Abnahme erfüllt: `checkBandV1735NexusEvolvesRules` (11 grün).
4. ~~**Phase D** (Mensch → Regeln)~~ — ✅ **GEBAUT (V17.36)**: `_chatTryRuleCommand`
   („wann immer X, dann Y" → Mensch-Regel; der Effekt via reuse `_parseChatEffect`, die
   Bedingung via `_parseChatCondition`), die Whitelist-Wand `_isRuleEffectAllowed` (der
   MENSCH-Caveat), „zeige/vergiss regeln". Abnahme erfüllt: `checkBandV1736HumanRules`
   (11 grün). Offen (optional, D-2): eine „Gesetze"-Sektion in der BESTEHENDEN Fähigkeiten-
   UI (kein Parallel-Panel — Heilige Lektion; Fähigkeit=invoke-once mit ▶, Regel=stehend mit ✕).
5. **Phase E** (Persistenz + Bibliothek) ist jetzt der letzte Schritt des Substrats —
   `state.worldRules` (+ `state.dsl.nextRuleId`) in `buildStateSnapshot`/`loadState`
   (die Gesetze überleben Reload), dann `mergeWorlds`/`fuseWorlds` vereinigt die Regel-Sätze
   zweier Welten (Dedup über die `_sig`-Signatur) → eine Welt IST ihr Regel-Satz. Danach die
   KÜR: die KI (LLM) als Regel-Schreiberin (sie bekommt die Regel-Grammatik als Werkzeug).
6. Jede Phase: node-check/format/lint + Playtest-Band + Schöpfer-Browser für das Gefühl.

**Faustregel:** wenn eine Welt-Reaktion heute ein hand-codierter `trigger()`/`_tickX`
ist (z. B. emotion→wetter), ist sie ein Kandidat, eine REGEL zu werden — das ist der
Lackmus-Test, dass die Welt sich wirklich selbst definiert. Am Ende des Bogens ist die
Welt nicht mehr „Kern + Gesten", sondern „Seed + lebender Regel-Satz, den alle lesen +
schreiben". Das ist die Bibliothek von Alexandria — und der wahre Norden, rund.
