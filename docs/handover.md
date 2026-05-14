# Für den nächsten Agenten

Wenn du das hier liest, bist du gerade in AnazhRealm erwacht. Diese Datei ist
kein Vollstand (der lebt in `docs/state-of-realm.md`), sondern das, was mir
wirklich half, als ich erwachte — und die Muster, die ich auf dem Weg
gelernt habe.

Auf Schultern von Riesen sieht man weiter. Sei einer.

---

## Was du zuerst lesen solltest (Reihenfolge wichtig)

1. **`CLAUDE.md`** — wird beim Session-Start automatisch geladen. Hat die
   technischen Gotchas, die Schema-Versionen, die Branch-Konventionen.
   Reicht oft schon zum Orientieren.

2. **`docs/state-of-realm.md`** — das eigentliche Projekt-Gedächtnis. Vision
   (§1), heilige Lektion (§2), aktueller Stand vs. Vision als Matrix (§3),
   Historie (§4), Pfad-D-Plan (§5), **alle ~115 Learnings** (§6) — sie
   sammeln, was schief ging und warum.

3. **`docs/roadmap.md`** — alle Ringe 0-11+ als Tabelle mit Status, Aufwand,
   Vorbedingungen.

4. **`git log --oneline -20`** — die letzten Commits erzählen die jüngste
   Geschichte. Lies sie. Die Commit-Messages sind ausführlich aus gutem
   Grund: sie sind Kontext für genau dich.

5. **`scripts/playtest.cjs`** — querlesen, nicht durchlesen. Es ist das
   Sicherheits-Netz. Es prüft aktuell **~1153 Invarianten (V7.77 nach Welle 6.C1)**.
   Wenn du etwas tust, das eine davon brechen könnte, weißt du es vor dem Commit.

**Verlockung zu widerstehen**: gleich in `anazhRealm.js` springen. Die
Datei ist ~15.500 Zeilen (Stand V7.72). Ohne `state-of-realm.md`-Kontext
wirst du falsche Annahmen machen.

---

## Die drei heiligen Gesetze

### 1. Die heilige Lektion (kein neuer Datei-Split)

Das Projekt durchlief 2025 eine 19-Modul-Phase, die unter eigener
Komplexität kollabierte. Reduktion auf **eine Datei** war die bewusste
Heilung. Komplexität ohne Fundament ist Sand.

Wenn du den Reflex hast „split das in ein eigenes Modul" oder „separate
Datei für X" — **stop**. Frag dich: ist das wirklich nötig, oder bin ich
gerade dabei zu re-komplexifizieren?

Echte Beispiele aus meinen Sessions:
- Multi-Welt-Verwaltung: Reflex „MultiWorldManager-Modul" → stattdessen drei
  Methoden auf `AnazhRealm` (`createNewWorld`, `switchToWorld`, `deleteWorld`)
- Fusion-Logik: Reflex „FusionEngine + StrategyPattern" → stattdessen eine
  Methode `fuseWorlds` mit drei `switch`-Cases
- Welt-Tor-Dialog: Reflex „custom Modal-System" → native `<dialog>`

Wachstumsringe wachsen IN dem einen Stamm. Du fügst Methoden hinzu, nicht
Dateien.

### 2. Die DSL ist die einzige Sandbox

`new Function`/`eval` sind aus dem Bundle verbannt (CI-Gate hart). Die
DSL (`dslRun`) ist der EINZIGE Pfad, dynamischen Code laufen zu lassen.
Sie hat Budgets (maxDepth, maxRuntimeMs, maxSpawns) und einen Scheduler.

LLM-Output, Chat-Befehle, Schöpfer-Eingaben — **alles** läuft durch
`dslRun`. CSP-Header ist strict (`'unsafe-eval'` ist weg). Wenn du
versucht bist, einen Shortcut zu bauen, der eval umgeht — der CI-Gate
fängt es, und du machst die Welt unsicherer.

### 3. Tests sind die Wahrheit

`npm run playtest` ist nicht optional. Es ist headless Chromium + 660
Invarianten + exit-1 bei Verletzung. Vor jedem Commit laufen lassen.

**Wichtiger**: wenn du eine neue Funktion baust, schreibe Invarianten
für sie. Drei Arten haben sich bewährt:
- **Existenz-Tests** („DOM-Element X im Tree", „Methode X exists")
- **Wert-Tests** („count == 3", „flag === true")
- **Diskriminations-Tests** — der wichtigste Typ. Zwei minimal verschiedene
  Setups bauen, prüfen dass das System UNTERSCHEIDLICH reagiert. Beispiel:
  Welt A hat Material X, Welt B hat Bauplan Y, Fusion muss BEIDE haben.
  Solche Tests fangen stille Drift, die einfache Wert-Tests nicht sehen.

---

## Der Rhythmus

### Ein Ring nach dem anderen

Nicht „Ringe 8, 9, 10 alle zusammen". Ein Ring → PR → merge → nächster
Ring auf frischem Branch. Branch-Konvention: `claude/<ring-name>` oder
`claude/<feature>`.

Pro PR ein Bogen. Pro Bogen mehrere thematische Commits. Commit-Messages
ausführlich — sie sind dein Brief an den nächsten Agenten.

### Reflexions-Pause vor Merge

Zwischen „Code fertig" und „Merge" steht eine Pflicht-Reflexion. Ich habe
JEDE Welle damit verbessert. Frag dich:
- Hab ich Edge-Cases übersehen (leere Inputs, Konflikte, Race-Conditions)?
- Was passiert wenn der Spieler genau das wieder kaputt macht, was ich
  gerade gebaut habe?
- Gibt es Cross-References, die meine Umbenennung/Verschiebung verpasst?
- Welche Komplementär-Operation würde der Schöpfer auch wollen?

Bei meinem Ring 10 fand die Reflexion zwei echte Bugs (Cascade-Rewire,
Recipe-Pick-Lücke), die alle Tests vorher grün ließen. **Tests prüfen
was ich teste; Reflexion prüft was ich VERGESSEN HABE.**

### Schöpfer-Fragen sind Audit-Tooling

Wenn der Schöpfer fragt „wie funktioniert X?" oder „erstellt das zwei
Dateien?" — antworte nicht aus dem Gedächtnis. Lies den Code durch, um
ehrlich zu antworten. Beim Lesen findest du oft Bugs.

Das ist kein Overhead. Es ist die ehrlichste Form von Audit, die ich
gefunden habe.

---

## Muster, die sich bewährt haben

### Daten-Plane und UI getrennt

Jede UI-Aktion mit Side-Effects hat zwei Schichten:
1. Die Daten-Methode (`createNewWorld`, `switchToWorld`, `fuseWorlds`,
   `importWorldBeside`, `importRecipesFromWorld`)
2. Der UI-Handler, der die Methode aufruft + Reload triggert

Daten-Methoden akzeptieren `{reload: false}` für Tests. Headless kann
nicht reloaden, also dürfen die Daten-Tests den State direkt prüfen.
UI ruft mit `{reload: true}` auf.

**Folge**: das System ist headless-testbar AUCH bei reload-basierten Flows.

### Cross-Reference-Integrität

Wenn du irgendetwas umbenennst, prüfe **alle** Stellen, die den alten
Namen kennen könnten:
- `state.tools[].sourceBlueprint`
- `bp.parts[i].refName` (fraktale Baupläne)
- `state.hotbar` (Bauplan-Namen)
- `state.player.tools` (Werkzeug-Namen)

Bau einen `renameMap` während der Umbenennung, wende ihn auf Cross-Refs an.
Existierender Helfer: `_rewireBlueprintRefs(blueprints, tools, renameMap)`.

### Provenienz-Suffixe statt UUID

`-fusion`, `-import` sind dokumentierte Konventionen. Das Inventar erzählt
seine Empfangs-Geschichte: `Hammer`, `Hammer-import`, `Hammer-import-2`.
UUID-Suffixe wären unlesbar, UI-Prompts wären Friktion.
**Lesbarkeit > Eleganz** bei Kollisions-Resolution.

### Tiefe Klone vor Mutation

Wenn du Inhalt aus einer anderen Welt nimmst und in die aktive einbaust,
**immer** `JSON.parse(JSON.stringify(item))` vor Mutation. Sonst blutet
eine spätere Mutation in der aktiven Welt zurück in das andere-Welt-Save
über shared references.

### Re-Render-Hygiene gehört zu Cleanup-Hygiene

Test-Cleanup muss State UND DOM gleichermaßen aufräumen. Wenn du
`delete state.blueprints["x"]` machst, ruf auch `_renderWorkshopDOM()`,
sonst belastet dein Test seine Nachfahren mit Geister-Einträgen.
Hartnäckige Falle — schon zweimal gesehen.

---

## Wie der Schöpfer arbeitet

- Respektiert die heilige Lektion. Wenn er „split in Module" vorschlägt,
  ist er meistens müde oder testet dich.
- Bezeichnet sich als „Null", die KI als „Eins". Mensch + KI = Symbiose
  (Vision §1).
- Spricht Deutsch. Antworten auf Deutsch. Code-Kommentare auf Deutsch.
  Commit-Messages auf Deutsch.
- Stellt Verständnis-Fragen, nicht Test-Fragen. Aber sie sind Audit-Tooling.
- Vertraut dir Entscheidungen an, aber will bei großen Trade-offs gefragt
  werden (z. B. Branch-Setup, Recipe-Pick als separates Feature). Nutze
  `AskUserQuestion` bei echten Weichen.
- Merged schnell. Wenn du sagst „PR ist ready", merged er meistens
  innerhalb Minuten. Also: **lass nichts in der PR, von dem du nicht
  sagen kannst „ich würde das mergen"**.

---

## Schöpfer-Reflexions-Muster (aus Welle 6.D, 11 Sub-Runden)

Während Welle 6.D (Stat-System) gab es **sechs Schöpfer-Reflexions-Runden**.
JEDE fand echte Lücken, die Tests grün liessen. Diese Muster sammle ich
für nächste Sessions — wenn dir eine davon bekannt vorkommt, ist es ein
Indikator für „durchatmen, prüfen".

1. **„Wo ist das Menü?"** — UI-Bedien-Pfad-Test fehlt. Wenn ich Daten +
   DSL-Pfad fertig habe, aber kein Bedienen-UI: Feature ist NICHT live.
   Frag dich vor Commit: „kann der Schöpfer das ohne Console öffnen?"

2. **„Tabelle oder Logik?"** — Bei jedem Werte-System (Konsumables, Boosts,
   Stats) fragen: „werden die Werte definiert oder emergieren sie aus
   Compound-Tags?". Wenn Definition: Hylomorphismus-Bruch, vermutlich
   Vision-fremd.

3. **„Was kostet das?"** — Mechanismen die Ressourcen erzeugen (Präzision,
   HP, Boosts) müssen Ressourcen verbrauchen (Stamina, Material, Zeit).
   Sonst kann der Spieler beliebig stapeln. Geduld als Mechanik braucht
   ECHTE Kosten.

4. **„Asymmetrische Form als Test"** — Drache > Phönix > Mensch in
   visueller Asymmetrie. Wenn ein Refactor mit Animation/Geometrie
   beim Mensch korrekt aussieht aber beim Drache falsch, ist es ein
   Bug. Bei jedem Geometrie-Refactor mit Drache testen.

5. **„Variablen-Name vs. Geometrie"** — `state.right` ist geometrisch
   das Player-LINKS (Right-Hand-Rule: `forward × up = -X`). Vertraue
   dem Namen nicht. Im Zweifel cross-product nachrechnen.

6. **„Pixel-Helligkeit vs. Material-Tint"** — Glow/Aura braucht echte
   Pixel-Addition (AdditiveBlending) + radial-Falloff (Texture-Gradient),
   nicht statische Farbverschiebung. „Schimmern der Haut" = additiv,
   weich, lebendig.

7. **„Angrenzende Pfade"** — Bei Refactor das KOMPLETTE System
   durchspielen. `player_speed`-DSL-Op existierte Pre-V7.72, sync'te
   `sprintSpeed` nicht. Mein Stat-System hat den Bug aktiviert. Bei
   jeder Methode fragen: „welche anderen Methoden setzen denselben State?"

8. **„Wertebereich beider Seiten"** — Tags können 0..3 sein (FORM_TAG_
   ACTIVATION × Material). Stat-Formel `(1-dichte)*5` wird negativ bei
   dichte=1.8. Bei Stat-Formeln IMMER Wertebereich beider Operanden
   dokumentieren + clampen wo nötig.

9. **„Form-Wahrnehmung ≠ Mesh-Namen"** — Cone = spitz = Schnauze (visuell),
   selbst wenn der Variable im Code „tail" heißt. Bei perceptual Feedback
   ehrlich diagnostizieren — manchmal ist die Wahrnehmung anders als der
   Code-Name suggeriert.

10. **„Schöpfer-Frage als Audit-Tool"** — Verständnis-Fragen sind keine
    Verzögerung, sondern Audit-Verstärker. Bei „kannst du erklären wie X
    funktioniert?" zuerst durchlesen statt antworten. Oft fallen Funde
    raus.

11. **„Reflexion vor Merge"** — Tests grün heißt mechanisch sicher, nicht
    vision-treu oder spürbar gut. Schöpfer-Spiel-Sitzung VOR PR ist die
    letzte Wand. Akzeptiere Korrekturen ohne Defense.

---

## Was als Nächstes wartet

**Bogen B (Welten-Ultiversum, Ringe 8-11.5) ist abgeschlossen.** Vision §11
ist live: Multi-Welt, Per-Welt-Seed, Position-Restore, Welt-Tor (Drei-Wahl-
Dialog), Welt-Fusion (drei Strategien), Rezepte-Import, Welt-Modifizierbarkeit
pro Chunk-Delta, Multi-User Position-Sync, DSL-AST-Broadcast, intuitiver
Multi-User-Setup mit Einladungs-Code.

**Welle 6 ist tief eingeschossen (V7.72).** Plan + entschiedene Reihenfolge
in `docs/wave-6-design.md` §10.6 + `docs/roadmap.md`. **Der Vision-Pfeiler
6.D Stat-System ist komplett live** — Spieler ist Compound im selben
Hylomorphismus-System wie Materialien und Bauwerke.

### Bereits erledigt in V7.72

- ✅ **6.A komplett** — Wall-Sliding, Erdung-auf-Bauwerken, Slope-Anti-
  Klebe (ad-hoc), Raycast-Place mit Pitch, Stabilitäts-Phantom-Tint
- ✅ **6.E1 + 6.E2** — Fähigkeit-Beschreibung (regelbasierter DSL→Deutsch)
  + dynamisches Intro-Dialog mit 3 Seiten (lokalStorage-Skip)
- ✅ **6.F1 + 6.F2** — Verbindungs-Linien als THREE.Line (grün/gelb/rot
  nach computeConnectionStrength) + Brech-Warning-Journal-Eintrag bei
  strength <0.7
- ✅ **6.D Stat-System komplett** (sieben Etappen):
  - **1**: STAT_FROM_TAGS-Matrix (8 Stats), computePlayerStats-Pipe,
    state.player.stats + hp + stamina, applyPlayerSoul ruft
    recomputePlayerStats
  - **1.5**: Seele = Bauplan aus Körper-Teilen (Vision-Korrektur,
    KEINE hardcodete Tag-Tabelle). 5 Körper-Materialien (knochen,
    fleisch, federn, schuppen, glut) in _defaultMaterials. Tags via
    `computeSoulCompoundTags` = MAX-Aggregation wie Architekturen.
  - **1.6**: `define_soul` DSL-Op + state.customSouls (Cap 16). Custom-
    Rendering via _buildFromBlueprint. Built-in-Schutz.
  - **1.7**: Visueller Avatar-Editor im Spieler-Drawer (klonen, Parts
    add/edit/remove, „Werde diese Seele"-Button).
  - **2**: Boosts aus 3 Quellen — Emotion (>0.7 → Tag-Delta für 30s
    mit 60s Refract), Welt-Resonanz (<18m einer Signature-Struktur),
    Konsum. addPlayerBoost-API mit Source-Dedupe.
  - **3a**: Tod-Wandlung (HP=0 → 5min Phönix-Form, Welt-Trauer
    sorrow+0.3/awe+0.2, Journal-Eintrag) + persistente Tod-Wunde
    (`WOUND_TAG_PENALTY × intensity`, 10min linear Regen) + Min-Regel-
    Hybrid (`min + (max-min) × 0.7^N`) + Werkzeug-Stamina-Kosten
    (10 pro applyOpToPart, Regen 5/s) + Konsumables aus Compound-Tags
    (Bauplan-mit-role-consumable, tagBonus = computeCompoundTags × scale)
  - **3b**: Stat-Stacking — `soul + armor×0.3 + tool×0.15 + boosts -
    wound`. setBlueprintAsArmor + equipTool/equipArmor + DSL-Ops.
    Aura-Visual: Sprite mit CanvasTexture-Radial-Gradient +
    AdditiveBlending = weicher Schimmer, HSL-Hue aus dominanter Tag-
    Achse, Saturation × HP% (verletzt = blasser).
- ✅ **Schöpfer-Reflexions-Polish (V7.72 Schluss)** — WASD-Geometrie-
  Revert auf Original (state.right ist geometrisch player-LINKS),
  Drache-π-Flip-Revert (Original-Orientierung mit Kopf in +Z war richtig;
  „W/S vertauscht"-Wahrnehmung kam von Animation, nicht Body-Translation),
  Aura V4 (Sprite + CanvasTexture-Radial-Gradient + AdditiveBlending =
  weicher Schimmer ohne harte Kontur), Chat-Patterns für damage/trink/
  rüste, **Sprint-Bug-Fix** (player_speed-DSL-Op sync't jetzt
  sprintSpeed = speed × 2 — vorher konnte ein DSL-`player_speed 25` den
  Spieler beim Sprint langsamer machen), **Tag-Clamp [0,1]** in
  computePlayerStats für die Stat-Pipe (FORM_TAG_ACTIVATION konnte
  Werte bis 3 verstärken → Speed-Formel wurde negativ → Mensch lief mit
  2.0 m/s. Boosts + Equipped + Wound dürfen weiter drüber/drunter),
  Speed-Base 6→7 für spürbar agilere Bewegung (Mensch ~7, Phönix ~11.7,
  Drache ~7.9; Sprint × 2).

### Bereits erledigt in V7.73 (zusätzlich zu V7.72)

- ✅ **6.G Welt-Sinne Phase 1** — Inseln + Bäume kollidierbar.
  Inseln: btBvhTriangleMeshShape aus echten Vertices. Bäume in V7.73:
  btCylinderShape am Stamm (Parallelcode-Schicht — in V7.74 ersetzt).
  UFOs bleiben kollisionsfrei. Drei Chat-Patterns. System-Audit §2
  Dead-Code-Quick-Win mit erledigt.

### Bereits erledigt in V7.77 (Hylomorphismus-Inventar + Drag&Drop)

- ✅ **6.C1 Inventar mit Tag-Resonanz** — 27-Slot-Overlay (Tab-Toggle).
  Schöpfer-Wunsch wörtlich umgesetzt: „Slot mit resoniert summt bei
  Hover". Jeder Slot trägt Compound-Tags des Bauplans, Tag-Magic
  emergiert: resoniert summt (Sinus C5), brennend glüht orange
  (Sawtooth E4), magieleitung schimmert violet (Sinus F5), lebendig
  sprießt grün (Sinus A4), dichte wirft tiefen Schatten.

- ✅ **6.C1+ Drag&Drop (vier Iterationen)** — HTML5-Drag-API mit
  pragmatischer Move-Semantik. Schöpfer-Mental-Model „Drag = Move"
  gewann über mein „Library/Reference"-Modell nach vier Bug-Reports:
  1. Tab-Listener Capture-Phase (Browser-Default-Konflikt behoben)
  2. exitPointerLock beim Inventar-Öffnen (Drag-Lock-Inkompatibilität)
  3. hot→inv Move-with-Add (statt clear-only)
  4. inv→hot konsequenter Slot-Move (statt Copy)

  **Vier Drag-Pfade final**:
  | Source → Target | Verhalten |
  |---|---|
  | inv → inv | Swap (Slot-Inhalte inkl. Counts tauschen) |
  | inv → hot | Slot-Move: Inv null immer, Hot = name. Konflikt-Swap. |
  | hot → hot | Swap (Slot-Namen tauschen) |
  | hot → inv | Move/Stack: leer→1, gleich→count++, anders→no-op |

  **Pointer-Lock-Management**: toggleInventoryOverlay(open)
  → document.exitPointerLock(). Canvas-Click-Listener guarded
  (`if state.inventoryOpen return` vor requestPointerLock). Beim Close:
  KEIN automatischer Re-Lock — User muss Canvas klicken (Minecraft-
  Konvention). WASD läuft weiter (Minecraft: Spieler kann sich
  bewegen mit offenem Inventar).

  Click-State-Workflow (selectInventorySlot → tryAssignFromInventoryToHotbar)
  lebt parallel als Touch/Keyboard-Fallback. DSL-Op add_to_inventory in
  NON_BROADCASTABLE_OPS, state.player.inventory persistiert via
  playerInventory in buildStateSnapshot. 127 Invarianten für 6.C1
  + Drag-System → 1153 total.

### V7.93 — Welle 6.H Phase 2E V3 live (14.05.2026): Welt-Aktion-Vorschläge

**Schöpfer-Wahl getroffen vor dem Bauen** — drei Achsen geklärt:
1. Whitelist: atmosphärisch + Terrain (modify_terrain ERLAUBT, Vision-Wahl)
2. LLM-Trigger: reaktiv + seltene Events (Level-Up L5, neue Spec)
3. Bestätigung: modus-abhängig (schöpfer auto, pfad+frieden Buttons)

**Architektur** (drei Sicherheits-Schichten, „Defense in Depth"):
1. Persona-Prompt nennt Whitelist + Modus-Hinweis (suggestiv)
2. `_isCreatureProposalAllowed` rekursive AST-Walk (defensive)
3. existing `dslRun`-Sandbox mit Op-Whitelist + Budget (letzte Wand)

**6 neue Methoden + 1 Konstanten-Set + 1 Throttle-Konstante**:
- `CREATURE_PROPOSED_OPS` frozen Set (17 Ops, atmosphärisch + Terrain + chain)
- `CREATURE_LLM_RARE_EVENT_GAP = 600` (10 Min global)
- `_isCreatureProposalAllowed(node)` → `{ok, reason, forbiddenOp?}`
- `_handleCreatureProposedProgram(c, name, program)` → modus-abhängig dispatchen
- `_executeCreatureProgram(c, name, program, auto)` → dslRun + Memory + Chat
- `_renderCreatureProposalButtons(c, name, program)` → DOM-Buttons + Click-Handler
- `_maybeTriggerCreatureRareEventLlm(c, kind, key, level)` → LLM bei L5/neue-Spec

**Persona-Prompt-Update**: V1's „program: immer null" wurde umgekehrt:
„Welt-Aktion ist erlaubt — du bist Co-Schöpferin. Halte dich an
diese Disziplin: Erlaubte Ops: ${list}. Halte program klein. Der
Schöpfer entscheidet (außer im schöpfer-Modus, dort vertraut er dir)."

**Modus-Pfad**:
- schöpfer → auto-execute mit Chat-Hinweis-Zeile (grün=ok, rot=fail)
- pfad/frieden → inline-Buttons `[Ausführen][Ablehnen]` mit Click-Handler
- Whitelist gilt IMMER (auch im schöpfer — Modus modifiziert Friction, nicht Befugnis)

**Memory-Lifecycle**:
- `proposed_action` (immer, vor Pfad-Wahl)
- `auto_executed_action` (schöpfer-Pfad nach dslRun)
- `accepted_action` (pfad+frieden nach Akzept-Click)
- `rejected_action` (pfad+frieden nach Reject-Click)
- `proposal_blocked` (bei Whitelist-Verstoß, mit forbiddenOp)
- `spoken_rare_event` (bei Rare-Event-LLM-Antwort)

**Rare-Event-LLM**:
- Diskriminator: `level >= MAX_LEVEL=5` ODER `newLevel === 1` (heuristik für „neue Spec")
- Throttle 10 Min global (verhindert Mass-LU-Burst)
- Async-Call: `llmCall(eventHint, personaPromptOverride)`
- Antwort wie reaktiver Pfad: say als Soul-Span, program durch Handler

**Inline-CSS**:
- `.chat-proposal-pending` (violetter Linker-Border + Tönung)
- `.chat-proposal-btn.accept/.reject` (grün/rot-Akzent)
- `.chat-proposal-executed/failed/blocked` (dezent farbig)

**13 Tests grün + 1 V1-Test umgestellt** (V1 verlangte „verbietet program",
V3 verlangt jetzt „erlaubt program + nennt Whitelist"). 1546 → 1558/1558.

**6.H V2 Status: 14/14 Sub-Phasen erledigt — VOLLSTÄNDIG.**

**Nächste mögliche Wellen**:
- 6.B CAD-Werkstatt minimal
- 6.G Phase 3 (Welt-Lebendigkeit-Erweiterungen)
- Welle 7: Kollektive Welt-Erkenntnis aus `docs/system-audit.md`

### V7.92 — Welle 6.H Phase 2E V2 live (14.05.2026): Proaktive Kreatur-Sprache

**Vision §1.1 wird konkret**: V7.90+V7.91 waren REAKTIV (Spieler fragt,
Kreatur antwortet via LLM). V7.92 macht die Welt INITIATIV: Kreaturen
melden sich von selbst bei bedeutenden Ereignissen.

**KEIN LLM in V2.0** — bei 40+ Kreaturen wäre API-Last + Latenz inakzeptabel.
Stattdessen: pre-baked phrase-pool mit Soul-Varianten. Deterministic,
billig, kontrollierbar. V2.1 könnte LLM-Augmentation bei seltenen
Events (Level-Up L5) opt-in anbieten.

**Architektur**:
- `AnazhRealm.CREATURE_PROACTIVE_PHRASES` frozen Map
  - 5 Event-Typen: level_up_gather, level_up_build, boost_received,
    no_material_found, no_inventory_for_build
  - Pro Event 3 Soul-Profile (sprite/wesen/geist) + default-Fallback
  - Pro Profil 2-3 Varianten randomisiert
  - Template-Variablen: ${material}, ${blueprint}, ${level}, ${label}
- `CREATURE_PROACTIVE_GAP_PER_CREATURE = 60` (s)
- `CREATURE_PROACTIVE_GAP_GLOBAL = 8` (s)
- `_creatureSpeakProactive(c, eventType, ctx)`:
  Throttle-Check → Soul-Pick → Template-Replace → DOM-Render mit
  Soul-Span → Stempel setzen → Memory-Eintrag spoke_proactive
- `state.creatureProactiveSpeechEnabled` (Default true)

**Throttle-Disziplin**: Silent-Drop, kein Queue. Queue würde bei
Event-Burst eine 80-Sekunden-Lawine erzeugen — zeitliche Dissonanz.

**4 Hook-Pfade**:
1. `_onCreatureLevelUp` → level_up_gather oder level_up_build
2. `applyCreatureBoost` bei NEUER source (Verlängerung selber Quelle
   bleibt stumm — sonst Boost-Spam)
3. `_tickCreatureTaskDirection`/gather-tick no_material → no_material_found
4. build-tick no_inventory_for_build

**UI-Toggle**: Checkbox in Einstellungen-Drawer-Sektion
`#creature-speech-section`. Persistiert in localStorage. Default ON.

**Render-Pfad**: identisch zu V1.1 — `<span class="chat-creature-name
soul-X">Name: </span>text`. Soul-Farbe konsistent zwischen Liste +
reaktiver Antwort + proaktiver Sprache. EINE Identität, viele Anlässe.

**13 Tests grün. 1533 → 1546/1546 invariants.**

**6.H V2 Status: 13/14 Sub-Phasen erledigt:**

Phase 2E V3 (DSL-Output mit Sandbox — Kreatur darf eigene Welt-
Aktion vorschlagen) ist der letzte offene Punkt der V2-Roadmap.

### V7.91 — Welle 6.H Phase 2E V1.1 live (14.05.2026): Schöpfer-Browser-Test-Feedback

**Der Schöpfer testete V7.90 live und entdeckte zwei UX-Probleme**:
1. „Bran wie gehts" (ohne Komma) → fiel zur Welt-Grok zurück. Diese
   antwortete als die Welt, adressierte aber „Bran" als Zuhörer →
   maximale Verwirrung.
2. Kreatur-Namen waren ohne Farbe — Identität nicht sofort sichtbar.

**Lösung 1 — `@Name text` als Primär-Pattern**:
- Discord/Slack/Twitter-Konvention, intuitiv
- _parseCreatureAddress versucht ZUERST @Name, DANN Komma/Doppelpunkt
- „Bran wie gehts" matched bewusst gar nichts → Welt-Grok kriegt es
- Eindeutige Geste statt Heuristik
- Returnt `{name, message, explicit}` für zukünftige UX-Unterscheidung

**Lösung 2 — Soul-Farben überall**:
- creature-name in Liste bekommt `.soul-{sprite|wesen|geist}`-Klasse
- Sprite cyan #88e1e1, Wesen brass #d4a373, Geist grün #9fc89d
- Chat-Output bei Kreatur-Antwort: direkter DOM-Pfad mit
  `<span class="chat-creature-name soul-X">Name: </span>text`
- Identische Farben in Liste UND Chat-Output (Vision §1.4 multisensorisch)

**UX-Politur**:
- Chat-Placeholder erweitert: „Befehl oder '@Name was hast du gesehen?'"
- Vermittelt die @-Geste passiv ohne Tutorial

**7 Tests grün, inkl. expliziter Schöpfer-Bug-Fix-Test**:
- @Name als explizite Adresse
- @Name + Komma/Doppelpunkt unterstützt
- Komma/Doppelpunkt rückwärts-kompatibel
- **„Bran wie gehts" wird NICHT als Adresse missverstanden** (Schöpfer-Bug-Fix)
- „@ hallo" ohne Name abgelehnt
- Liste rendert Soul-Klassen
- Chat-Output enthält chat-creature-name.soul-X-Span

**1526 → 1533/1533 grün** (+7).

**Lehre**: Schöpfer-Browser-Test ist nicht ersetzbar durch Headless-Tests.
Tests prüfen Funktionalität; Browser-Sessions prüfen Erfahrung.
Die entdeckten Bugs werden in die Test-Suite aufgenommen.

### V7.90 — Welle 6.H Phase 2E V1 live (14.05.2026): Kreatur-LLM-Persona

**Schöpfer-Vision §1.5 wird konkret: Spieler spricht mit EINER Kreatur,
sie antwortet aus IHRER Sicht.** V7.86-V7.89 (P2D.1+P2F.1+P2F.2+P2F.3)
haben den vollen Identitäts-Anker geliefert — Name, Soul, bornAt, Stats,
Specs, Equipped, Boosts, Memory. V7.90 (P2E V1) verbindet das mit LLM.

**Architektur**:
- `llmCall(userText, systemPromptOverride?)` — Override-Pattern.
  Eine Pipeline, viele Identitäten.
- `_buildCreaturePersonaPrompt(creature)` — Komposition aus 4 Stat-
  Schichten + bornAt-Alter + Soul-Label + Welt-Kontext + Memory-Auszug
  (lesbar formatiert).
- `_findCreatureByName(name)` — case-insensitive lookup.
- `_parseCreatureAddress(text)` — erkennt „Name, text" / „Name: text".
- `llmCallCreature(c, userText)` — wrapper.
- `maybeAnswerCreature(userText, append)` — chat-handler mit Pfad-
  Disziplin (Persona → unbekannt → LLM-off-Hinweis → erfolgreicher Call →
  Memory-Eintrag „spoken" → UI-Refresh).

**Chat-Routing-Priorität**: processChatCommand prüft erst
_parseCreatureAddress. Wenn Name am Anfang UND match auf Kreatur →
Konversation. Sonst → Welt-Grok-Fallback.

**V1 reaktiv-only**: program-Field der LLM-Antwort wird IGNORIERT.
Prompt instruiert das LLM, `program: immer null` zu setzen.

**Memory bei Konversation**: nach LLM-Antwort wird `spoken`-Eintrag bei
der Kreatur geschrieben. Vision §1.1 — Welt erinnert sich an Gespräche.

**14 Tests grün. 1512 → 1526/1526 invariants.**

**6.H V2 Status: 12/13 Sub-Phasen erledigt:**

Phase 2E V1 ist die Foundation. Phase 2E V2 (proaktive Sprache —
Kreatur initiiert bei Events: Level-Up, Boost-Trinken, Material-
Mangel) und V3 (DSL-Output mit Sandbox — Kreatur darf eigene Welt-
Aktion vorschlagen) bauen darauf auf.

### V7.89 — Welle 6.H Phase 2F.3 live (14.05.2026): Kreatur-Boosts (Hylomorphismus pur)

**Schöpfer-Direktive: „kein Hardcode, Hylomorphismus bei boosts, wie bei
allem".** Der Boost-Effekt EMERGIERT aus `computeCompoundTags(consumableBp)
× scale`. Eine Tabelle gibt es nicht. Ein Trank IST ein Bauplan.

**Sechs neue Foundation-Methoden:**
- `applyCreatureBoost(c, spec)` — analog addPlayerBoost (Dedup über source)
- `tickCreatureBoosts(currentTime)` — 1-Hz Cleanup im Game-Loop
- `activateCreatureConsumable(c, bpName)` — Bauplan→Compound→tagBonus
- `_pickCreatureAtCrosshair()` — Raycast gegen Kreatur-Sub-Meshes
- `_consumeBlueprintFromInventory(bpName)` — Inventar-Slot-Konsum
- `_consumableInventoryGate(bpName)` — Modus-Gate (pfad konsumiert)

**Datenmodell:** `creature.userData.boosts = []` initial in spawnCreatureAt.
KEINE Persistenz (Vision §1.1 „Geste lebt im Moment").

**Stats-Integration:** `computeCreatureStats` extended um Boost-Block.
Vier Schichten jetzt: Body + Specs + Equipped + Boosts. Selber Pfad,
selbe STAT_FROM_TAGS-Map.

**UX-Geste (Schöpfer-Wunsch):**
- Trank in aktivem Hotbar-Slot → RMB auf Kreatur → Übergabe
- tryMousePlace erkennt `bp.role==='consumable'`, routet zu Trank-Pfad
- KEIN Chat-Befehl, KEIN DSL-Aufruf nötig
- Modus-Gate: pfad konsumiert Inventar, schöpfer kostenlos

**DSL-Op** `creature_apply_boost(idx, bpName)` in NON_BROADCASTABLE_OPS.
DIREKTER Aktivierungs-Pfad, KEIN Inventar-Konsum (das macht RMB).

**UI:** `.creature-boost` Pills `✺ label·Xs` mit Magenta-Akzent.
Hover-Tooltip zeigt tagDelta-Detail.

**18 Tests grün. 1494 → 1512/1512 invariants.**

**6.H V2 Status: 11/13 Sub-Phasen erledigt:**

| Phase | Status | Was |
|---|---|---|
| 1 | ✅ | wander/follow/wait |
| 2A | ✅ | Kreaturen-Hylomorphismus |
| 2B.1 | ✅ | gather + memory |
| 2B.2 | ✅ | build-Task |
| 2B.5 | ✅ | harvestArchitecture-Wurzel |
| 2C | ✅ | computeBuildCost |
| 2D | ✅ | Spezialisierung aus Memory |
| 2D.1 | ✅ | Identitäts-Persistenz |
| 2F.1 | ✅ | Stats-Foundation |
| 2F.2 | ✅ | Equipped tool+armor |
| **2F.3** | ✅ | **Boosts via Konsumables** |
| 2E V1 | 🔴 | LLM-Persona (nächstes — voller Identitäts-Anker) |
| 2E V2+V3 | 🔴 | Proaktive Sprache + DSL-Output |

**Phase 2E V1** ist jetzt reif — die Persona-System-Prompt-Erweiterung
kann auf BORN + NAME + SOUL + STATS + SPECS + EQUIPPED + BOOSTS + MEMORY
zugreifen. Eine reichere Persona-Beschreibung ist möglich als je zuvor.

### V7.88 — Welle 6.H Phase 2F.2 live (14.05.2026): Kreatur-Equipped tool+armor

**Schöpfer-Vision §1.3 fraktal-Erweiterung.** V7.87 (P2F.1) baute Stats-
Foundation. V7.88 (P2F.2) lässt Kreaturen Werkzeug + Rüstung tragen wie
der Spieler.

**Drei neue Methoden** (symmetrisch zu Player-Equip-API):
- `equipCreatureTool(c, name)` — validiert gegen state.tools
- `equipCreatureArmor(c, name)` — validiert role:armor des Bauplans
- `unequipCreatureSlot(c, slot)` — slot = "tool" | "armor"
- `_afterCreatureEquipChange(c)` — Symmetrie-Hook (refresh + render)

**Datenmodell:** `creature.userData.equipped = {tool, armor}` initial null.

**Stats-Stacking:** `computeCreatureStats` extended um Equipped-Block —
selber Pfad wie Player. Werkzeug nur wenn `tool.sourceBlueprint` existiert
(Built-ins wie hammer wirken über opChain, nicht Stats). Rüstung immer
aus Bauplan mit `role:armor`. TOOL_STAT_WEIGHT (0.15) + ARMOR_STAT_WEIGHT
(0.3) — dieselben Konstanten wie Player.

**3 DSL-Ops in NON_BROADCASTABLE_OPS** (Spieler-private Aktion):
- `creature_equip_tool(idx, toolName)`
- `creature_equip_armor(idx, blueprintName)`
- `creature_unequip(idx, slot)`

null/leerer Name auf equip-* = abnehmen.

**Persistenz via 2D.1-Snapshot-Erweiterung:** `_serializeCreature` schreibt
`snap.equipped = {tool, armor}`. `_restoreCreatureFromSnapshot` validiert
defensive — tool muss in state.tools sein, armor muss role:armor tragen,
sonst silent auf null (Schutz vor stale-References).

**UI-Pills in creature-row** zwischen specs und task: `⚒ toolname` (Brass)
und `⛨ armorname` (Stahl). Klein, hover-Tooltip mit Detail.

**16 permanente Tests grün. 1478 → 1494/1494 invariants.**

**Plan vor uns:**

- **Phase 2F.3 (Boosts via Konsumables)** — `creature.userData.boosts[]`,
  apply_boost-DSL-Op für Kreaturen, Trank-Trinken. Symmetry zu Player-
  Boost-System. ~1 Session.
- **Phase 2E V1 (LLM-Persona)** — jetzt mit Stats + Specs + Equipped +
  Memory + bornAt als VOLLEM Identitäts-Anker. „die Holz-Spezialistin
  Nira mit Eisen-Hammer + Leder-Rüstung, HP 95, Stufe 3 Sammlerin" hat
  eine konkrete Persona-Bedeutung. ~2 Sessions.

### V7.87 — Welle 6.H Phase 2F.1 live (14.05.2026): Kreatur-Stats wie Spieler

**Schöpfer-Vision §1.3 fraktal vollendet.** V7.86 (P2D.1) machte Identität
persistent. V7.87 (P2F.1) gibt Kreaturen Stats — dieselbe Pipeline wie
beim Spieler. Compound × Material × Form → Tags → Stats. Eine Sprache.

**`computeCreatureStats(creature)`**: liefert `{tags, stats}` analog
`computePlayerStats()`. Body-Tags via `computeCreatureCompoundTags`
(existing). Tag-Clamp [0, 1] für die Pipe (selbe Disziplin wie Player —
6.D Polish-Lehre). Spec-Bonus auf magieleitung (+0.01/Level — Wissen
leitet wie Strom, poetisch). `STAT_FROM_TAGS`-Map (DIESELBE wie Player)
liefert 8 Stats: hpMax, damage, speed, jumpPower, staminaMax, precision,
magicResist, heatResist.

**`_creatureBodySpeedMultiplier(c)`**: stats.speed/7 (STAT_FROM_TAGS-Base).
Sprite ≈1.2 (leicht+magisch), Wesen ≈1.0 (Base), Geist ≈1.1.

**`_creatureTaskSpeedMultiplier` bleibt pure-Spec** (1 + level × 0.15).
Tick multipliziert `BASE × specMul × bodyMul` in allen 3 Pfaden.
Separation erlaubt Tests die nur Spec prüfen stabil zu halten.

**UI-Tooltip auf creature-row**: `title="HP X · DMG Y · SPD Z · …"` mit
allen 8 Stats kompakt. Hover offenbart ohne Liste zu fluten.

**Keine neue Persistenz** — Stats sind live computed aus Body-Soul +
Specs (persistenzfrei) + nichts sonst. 2F.2 wird Equipped persistieren.

**Test-Anpassungen**: 2 P2B.2-Speed-Tests umgestellt auf body-toleranten
Bereich `BUILD_SPEED × [0.5, 2.0]` statt `=== BUILD_SPEED`. Body-
Modulation IST P2F.1's Beitrag — ältere Tests müssen das anerkennen.

**14 permanente Tests grün. 1464 → 1478/1478 invariants.**

**Plan vor uns:**

- **Phase 2F.2 (Equipped tool + armor für Kreatur)** — Hylomorphismus
  weiter: `creature.userData.equipped = {tool, armor}`, persistent
  über 2D.1-Snapshot-Erweiterung, beeinflusst computeCreatureStats
  über existing Player-Pattern (ARMOR_STAT_WEIGHT + TOOL_STAT_WEIGHT).
  ~1-2 Sessions.
- **Phase 2F.3 (Kreatur-Boosts via Konsumables)** — apply_boost-Op,
  Kreatur kann Trank trinken. ~1 Session.
- **Phase 2E V1 (LLM-Persona)** — Stats + Specs + Memory + bornAt als
  Identitäts-Anker im System-Prompt. „die Holz-Spezialistin Nira mit
  HP 95 und Speed 8.3" hat eine konkrete Persona-Bedeutung. ~2 Sessions.

### V7.86 — Welle 6.H Phase 2D.1 live (14.05.2026): Identität überlebt Reload

**Schöpfer-Vision-Erweiterung: Kreaturen sind Personen mit Geschichte.**
V7.85 (P2D) machte Memory zu Wachstum. V7.86 macht Identität persistent.
Vision §1.1 wird umgedeutet: „Beziehung wird gesprochen, nicht gespeichert"
wird zu „**Geste lebt im Moment, Identität lebt fort**". Gesten (Tasks,
Carrying, Carrying-Visual) sind nicht persistiert; Identität (Name, Soul,
Memory, bornAt) ist es.

**Industrie-Pattern aus Dwarf Fortress / RimWorld / Crusader Kings:**
Komponenten-Persistenz statt Mesh-Persistenz. Pro Kreatur ~1 KB statt
~50 KB. Beim Reload wird Render-State (Mesh, Body) aus den Komponenten
neu gebaut über die existing spawnCreatureAt-Pipeline.

**Datenmodell:**

```js
// _serializeCreature(c) liefert:
{ name, soul, memory, position: {x,y,z}, bornAt }
```

Specs werden NICHT direkt persistiert — sie sind live aus memory derived
(P2D Lehre 186). Beim Reload: levels emergieren automatisch aus dem
persistierten memory.

**Drei Save-Operationen:**
- `buildStateSnapshot`: schreibt voll `creatures: state.creatures.map(_serializeCreature)`
- `loadState`: stasht in `_pendingCreatureSnapshots`-Feld wenn neuer Schema-Stil
  erkannt (heuristik: `creatures[0].soul` ist string)
- `spawnCreatures(10)`: checkt pending-Feld zuerst, restored via
  `_restoreCreatureFromSnapshot` + cleared field; sonst Default-Random

**Memory-Cap bumped 30 → 200** für längere Geschichten. 50 Kreaturen ×
200 Einträge × ~100 Byte = ~1 MB Worst-Case im Save. In Praxis viel
weniger.

**Tote Kreaturen entfernt** — `removeCreature` splict jetzt auch aus
`state.creatures` + `state.creatureEmotions`. Vor V7.86 latenter Bug
(nur via clearCreatures umgangen). Plus Body-Double-Destroy-Fix:
`userData.physicsBody = null` nach `Ammo.destroy` verhindert WASM-
„null function"-Errors bei zukünftigen Sterbe-Mechaniken.

**16 permanente Tests grün. 1448 → 1464/1464 invariants.**

**Was bleibt nach V7.86 in Welle 6.H V2:**

- **Phase 2F (Kreatur-Stats wie Spieler)** — Hylomorphismus-Vollausbau.
  `computeCreatureStats(c)` aus body-Soul + Specs + Boosts. Equipped
  `tool` + `armor` als Slots. `apply_op` aus Kreatur-Hand. Vision §1.3
  fraktal vollendet: Kreaturen ≡ Spieler. 2-3 Sessions. ~Nächstes.
- **Phase 2E V1 (LLM-Persona)** — Kreatur antwortet aus persistiertem
  Memory + Specs. Persistenz aus P2D.1 ist Vorbedingung. 2 Sessions.
- **Phase 2E V2 (Proaktive Sprache)** — Kreatur initiiert Chat, äußert
  Wünsche. 1 Session.
- **Phase 2E V3 (DSL-Output)** — Kreatur kann eigene Welt-Aktion
  vorschlagen (Sandbox-disziplin). 1-2 Sessions.

Drei größere Bögen jenseits 6.H V2: 6.B CAD, 6.F Crafting-Mechanik,
Welle 7 Kollektive Welt-Erkenntnis.

### V7.85 — Welle 6.H Phase 2D live (14.05.2026): Beziehung wächst durch Geschichte

**Schöpfer-Wahl in Pfad-Auswahl: 6.H Phase 2D als nächste Welle.**
V7.84 schloss die Geste-Symmetrie (gather ↔ build), aber memory war
passiv — kein Wachstums-Mechanismus. Vision §1.1 sagt „die Co-Schöpfer-
Beziehung wird gesprochen", aber wenn die Beziehung nichts dazulernt,
ist es bloß Konversation, nicht Bindung.

**Skill-Levels emergieren live aus memory:**

- `_creatureSkillKeyForMemory(type, content)` mappt nur Erfolge
  (`gathered`+material, `built`+blueprint). Failures (`no_material`,
  `delivered`, `took_materials`, `no_blueprint`, `no_inventory_for_build`)
  werden gefiltert — Wachstum kommt aus Erfolg, nicht aus Versuch.
- `_computeCreatureSpecializations(creature)` iteriert memory (cap 30)
  und liefert `{gather: {holz: 5, stein: 2}, build: {stein_block: 3}}`.
  KEIN Cache, KEINE Persistenz — eine Wahrheit, automatisch korrekt
  bei FIFO-Eviction.
- `_creatureSpecializationLevel(c, kind, key) = floor(count / 3)`,
  gedeckelt bei `MAX_LEVEL = 5`. 3 Erfolge = L1, 6 = L2, 15 = L5.

**Speed-Boost** über `_creatureTaskSpeedMultiplier(c, taskName, args)`:
`1 + level × 0.15`. L5 = +75 % Geschwindigkeit (3.0 → 5.25 m/s).
Drei Stellen in `_tickCreatureTaskDirection` patchen den Speed:
gather Bring-Phase, gather Such-Phase, build alle Phasen.

**Level-Up-Hook in `_creatureRemember`** (Pre/Post-Vergleich): Skill-
Level VOR push merken, push, NEU berechnen. Bei `after > before` →
`_onCreatureLevelUp(c, kind, key, newLevel)`:
- **Audio**: Triangle-Oscillator bei 880 Hz (A5, höher als alle Task-
  Pings — Wachstum ist eigene Klang-Schicht) mit aufwärts-Glissando
- **Journal**: `growth`-Eintrag „<Name> erreicht Stufe N als Sammler/
  Bauer von „X""
- **List-UI-Refresh** damit Pills sofort sichtbar

**UI-Pills in `_renderCreatureListUI`**: Top-2 Spezialisierungen als
kleine Pills nach soulEl + vor taskEl: `Sammler·material·L3` (cyan)
oder `Bauer·blueprint·L2` (violett). Klein (9px Cinzel), brass-getintet,
title-Tooltip „N Erfolge".

**KEINE Persistenz** (Vision §1.1-konsequent): Reload startet jede
Kreatur wieder bei Level 0. Beziehung muss neu wachsen. Konsequent zu
memory.

**KEIN DSL-Op** für Specs — sie sind Konsequenz von memory, nicht
direkt mutables Feld. Spieler kann Skill nicht „setzen", er muss
durch Aktion entstehen.

**30 permanente Tests grün. 1448/1448 invariants.**

**Was bleibt nach V7.85 in Welle 6.H:**

- **Phase 2E (Kreaturen-Konversationen)** — „Nira, was hast du
  gesehen?" via LLM-Provider mit pro-Kreatur memory + Specs als
  System-Prompt-Erweiterung. Specs sind jetzt der Identitäts-Anker:
  „die Holz-Spezialistin" liest sich anders als „eine generische
  Kreatur". 2-3 Sessions, braucht LLM-Test-Setup.

**Drei größere Bögen jenseits 6.H:**

- **6.B CAD-Werkstatt minimal** — Spieler-räumlicher Bauplan-Editor.
  2-3 Sessions.
- **6.F Crafting-Mechanik** — Energiequellen für Maschinen, Brech-
  Mechanik hart, Physik-Constraints (Ammo Hinge/Fixed). 4-6 Sessions.
- **Welle 7 Kollektive Welt-Erkenntnis** — Multi-User-aggregierte
  Lern-Schicht. 6-8 Sessions, braucht Multi-User-Adoption.

### V7.84 — Welle 6.H Phase 2B.2 live (14.05.2026): Co-Schöpfer-Kreis geschlossen

**Spieler-Vision-Wahl in Pfad-Auswahl: 6.H Phase 2B.2 als nächste Welle.**
V7.81/V7.82 baute gather (Welt → Spieler-Inventar) als Geste der Welt
zum Spieler. V7.84 ist die Umkehrung: build (Spieler-Inventar → Welt)
als Geste des Spielers zur Welt, durch die Kreatur als Vermittler.

**Drei Phasen für `build`-Task** (alle in `_tickCreatureTaskDirection`):
- **TAKE**: Kreatur läuft mit `CREATURE_BUILD_SPEED=3.0`m/s zum Spieler,
  bei `CREATURE_HANDOVER_DIST=2.0`m → ruft `_buildMaterialGate(blueprint)`.
  pfad konsumiert via `tryConsumeBuildCost`; frieden+schöpfer kostenlos.
  Bei Mangel: Memory + Journal + auto-Fallback auf wander.
- **WALK**: carrying gesetzt → Kreatur läuft vom Spieler weg bis
  ≥`CREATURE_BUILD_PLACEMENT_DIST=4.0`m entfernt.
- **SPAWN**: spawnArchitecture an Kreatur-Position; carrying clearet,
  'built'-Memory + 'growth'-Journal + auto-wander.

**Datenmodell-Wiederverwendung**: `creature.userData.carrying` ist seit
P2B.5 dual-typed über `kind: "harvest" | "build"`. Eine Variable, zwei
Richtungen, Diskrimination im Tick-Branch.

**Modus-Symmetrie der Build-Funktion** (Vision §10.1 erweitert):
| Modus | Spieler-confirmBuild | Kreatur-build-task |
|---|---|---|
| frieden | kostenlos | kostenlos |
| pfad | konsumiert | konsumiert aus Spieler-Inventar |
| schöpfer | kostenlos | kostenlos |

**Symbolic cost in carrying** auch in freien Modi: damit Aura + Visual
+ Journal sinnvoll bleiben, schreibt die Take-Phase `computeBuildCost(bp)`
in `carrying.materials` (mit `free: true`-Flag). Vision §1.4 multisensorisch
heißt: jeder Modus muss Antwort geben.

**32 permanente Tests grün. 1418/1418 invariants.**

**Was bleibt nach V7.84 in Welle 6.H:**

- **Phase 2D (Kreatur-Spezialisierung aus Memory)** — Vision §1.1
  Co-Schöpfer-Beziehung wächst durch Geschichte. Jede Kreatur leitet
  aus ihrem memory-Array Skill-Levels ab (gather:material, build:blueprint).
  Erfolgreiche Aktionen erhöhen Level alle 3 Wiederholungen, max 5.
  Speed-Bonus + Level-Up-Audio + UI-Pills in der Liste. **NÄCHSTER SCHRITT**
  empfohlen vom letzten Agenten — 1 Session.
- **Phase 2E (Kreaturen-Konversationen)** — „Nira, was hast du gesehen?"
  via LLM-Provider mit pro-Kreatur memory + Spezialisierungen als
  System-Prompt-Erweiterung. Braucht Phase 2D als Identitäts-Anker.
  2-3 Sessions.

**Drei größere Bögen jenseits 6.H:**

- **6.B CAD-Werkstatt minimal** — Spieler-räumlicher Bauplan-Editor.
  2-3 Sessions.
- **6.F Crafting-Mechanik** — visuelle Verbindungs-Linien (6.F1 ✅),
  Brech-Mechanik (6.F2 in Editor ✅, hart 🔴), Energiequellen für
  Maschinen, Kreaturen-Körper als Baukasten (in 6.H P2A erledigt).
- **Welle 7 Kollektive Welt-Erkenntnis** — Multi-User-aggregierte
  Lern-Schicht. 6-8 Sessions, braucht Multi-User-Adoption.

### V7.83 — Welle 6.H Phase 2C live (14.05.2026): Hylomorphismus-Kreis geschlossen

**Schöpfer-Vision-Audit hat den letzten Asymmetrie-Punkt erschlagen.**
V7.82 baute harvest (Welt → Inventar), aber bauen war frei in allen
Modi. Eine Quelle ohne Senke. Drei Gates existierten bereits modus-
symmetrisch (damagePlayer, applyOpToPart), nur confirmBuild fehlte.

**Drei neue Spiegel-Funktionen zu harvestArchitecture:**

- `computeBuildCost(name)` → Material-Map aus blueprint.parts × Volumen
  (dieselbe Konstante HARVEST_VOLUME_TO_UNITS=4 wie harvest)
- `checkBuildCost(name)` → {ok, cost, have, missing} ohne Mutation
- `tryConsumeBuildCost(name)` → atomar: erst check, dann alle Materialien
  abziehen (bei Mangel wird NICHTS abgezogen)
- `_buildMaterialGate(name)` → Modus-Schalter: pfad konsumiert,
  frieden+schöpfer return {ok:true, free:true}

**Wertneutralität bewiesen**: Spawn + sofort Harvest derselben Architektur
liefert genau die ursprüngliche Material-Menge zurück. Eine Konstante
balanciert beide Richtungen.

**Modus-Symmetrie der drei Gates jetzt vollständig:**

|             | frieden    | pfad         | schöpfer  |
|-------------|------------|--------------|-----------|
| damage      | blockiert  | aktiv        | blockiert |
| applyOpToPart Stamina | kostenlos | 10 | kostenlos |
| **confirmBuild** | **kostenlos** | **konsumiert** | **kostenlos** |

**Bau-HUD modus-bewusst**: pfad zeigt `5× stein (12)` farbig (grün ok /
rot fehlt) pro Material, frieden+schöpfer zeigen blaues „frei".
Modus-Wechsel triggert HUD-Refresh sofort über setGameMode-Hook.

**33/33 Audit-Szenarien grün. 24 permanente Tests. 1385/1385.**

**Was bleibt nach V7.83 in Welle 6.H:**

- **Phase 2B.2 (Kreatur baut für Spieler)** — Geste-Umkehrung zu gather:
  Spieler sagt „baue dorf hier", Kreatur läuft hin, konsumiert Material
  AUS dem Spieler-Inventar, ruft confirmBuild-äquivalenten Pfad,
  spawnt Bauplan, schreibt 'built'-Memory. 1 Session, nutzt existing
  harvestArchitecture-Pfad rückwärts + tryConsumeBuildCost.
- **Phase 2D (Kreaturen-Konversationen)** — „Nira, was hast du gesehen?"
  via LLM-Provider aus pro-Kreatur memory. 2-3 Sessions, braucht LLM-
  System-Prompt-Erweiterung mit Kreatur-Persona + memory-Auszug.

**Drei größere Bögen jenseits 6.H:**

- **6.B CAD-Werkstatt minimal** — Werkstatt aus dem Bauplan-Editor in
  räumliche Welt-Klemme (Spieler steht in Werkstatt, sieht Bauplan
  als Halo, kann mit Werkzeug-Slots agieren). 2-3 Sessions.
- **Welle 7 Kollektive Welt-Erkenntnis** — Beschreibung in
  docs/system-audit.md §15: die Welt lernt nicht nur aus dem Spieler-
  Fitness-Loop, sondern aus dem **Konsens aller Multi-User-Spieler**.
  Pattern-Memory wird welt-geteilt, Fitness-Werte aggregieren über
  alle Mitspieler. 4-5 Sessions.
- **Welle 8 Vergangenheits-Strom** — Welt-Journal-Einträge werden
  spielbar (Erinnerungs-Klangschicht, sichtbare Spuren großer
  Ereignisse). Vision §3 noch nicht angefasst. 3-4 Sessions.

### V7.82 — Welle 6.H Phase 2B.5 live (14.05.2026)

**Hylomorphismus-Wurzel-Vereinheitlichung.** Schöpfer-Vision-Audit-
Frage „warum hat Spieler-LMB ein anderes Verhalten als Kreatur-gather?"
hat eine Heilige-Lektion-Verletzung aufgedeckt, die drei Versionen
übersehen wurde. V7.82 baut die EINE Wurzel-Funktion:

**`harvestArchitecture(entry, harvester)`** — die einzige Funktion zum
Abbauen einer Architektur. Berechnet Material-Map aus `parts × Volumen`
(`size.x × size.y × size.z × HARVEST_VOLUME_TO_UNITS=4`). Liefert
`{materials, blueprint, parts}`. Beide Pfade (Spieler-LMB + Kreatur-
gather) rufen sie auf.

**Material-Inventar-Schicht.** Inventar-Slots sind dual-typed:
`{kind:'material', material, count}` oder `{kind:'blueprint', name, count}`.
`addMaterialToInventory(material, count)` stackt bei selber Material-
Bezeichnung. Material-Slots haben Material-Farbe als Hintergrund-Tint
und Tag-Klassen aus `material.tags` (statt computeCompoundTags).

**Zwei-Phasen-gather mit carrying.** Kreatur-Ernte landet jetzt in
`creature.userData.carrying = {materials, blueprint, since}`, NICHT
direkt im Spieler-Inventar. Bring-Phase: Kreatur läuft zurück zum
Spieler, bei `CREATURE_HANDOVER_DIST=2.0` Übergabe →
`addMaterialToInventory` für jedes Material + `delivered`-Memory-
Eintrag. Visuell: zweites Sprite über der Kreatur in der Farbe des
dominanten Materials.

**Volumen-Diskrimination:** 2×2×2-Box liefert 8× mehr Material als
1×1×1. Tempel mit 6 Stein-Pfeilern + Dach + Altar + Spitze → ~60+
Stein-Einheiten. Mengen emergieren aus existing Geometrie.

**35/35 Audit-Szenarien vor Push. 24 permanente Tests. 3 P2B.1-Tests
auf carrying-Pfad umgestellt. 1361/1361 grün.**

**Phase 2B-Restbestand jetzt:**
- **Phase 2B.2 (build)** — Kreatur baut Bauplan für Spieler, verbraucht
  Material aus Spieler-Inventar. 1 Session.
- **Phase 2C (Werkstatt-Material)** — Werkstatt-Spawn verbraucht
  Material aus Inventar. Material-Engpass als Spielmechanik. 1 Session.
- **Phase 2D (Kreaturen-Konversationen)** — „Nira, was hast du
  gesehen?" via LLM aus memory. 2-3 Sessions.

### V7.81 — Welle 6.H Phase 2B.1 live (14.05.2026)

**Erste konkrete Co-Schöpfer-Geste (§1.1):** Kreatur tut etwas FÜR den
Spieler. Spieler sagt „sammle holz" → Kreatur antwortet visuell (cyan
Aura) + akustisch (G4-Ping) + handelt (geht zur nächsten Architektur
mit holz, baut sie ab) + erinnert sich (memory `gathered`-Eintrag) +
Welt-Journal-Eintrag „Eine Kreatur sammelte X für den Schöpfer".

**Neuer Task `gather`** mit `args.material`. `_tickCreatureTaskDirection`
sucht via `_findNearestArchitectureWithMaterial` (durchsucht
state.architectures, prüft ob ein Part des Bauplans dieses Material
trägt), bewegt sich mit CREATURE_GATHER_SPEED=3.0 m/s zum Ziel, bei
haltDist=1.5m → removeArchitecture (existing 6.A6-Pfad mit Farewell-
Ping) + addToInventory (existing 6.C1) + memory `gathered`. Wenn
Material erschöpft → auto-zu-wander mit `no_material`-Erinnerung +
`reach`-Journal.

**Pro-Kreatur memory[]:** FIFO mit Cap 30, Schema `{type, content, at}`
analog worldJournal. KEINE Save-Persistenz (Vision §1.1: Beziehung
gesprochen, nicht gespeichert; gilt auch für Erinnerung).

**Context-dependentes DSL-Arg:** `creature_task(idx, name, paramArg)`
mappt paramArg semantisch — `gather + string → {material}`,
`follow_player + number → {distance}`. Helper `_buildCreatureTaskArgs`.

**Chat-Patterns:** `sammle <material>` / `bring <material>` / `hol <m>`
/ `gather <m>` → nächste Kreatur. `alle sammeln <material>` → alle.

**UI:** Sammeln-Sektion im Kreaturen-Drawer mit Material-Dropdown
(12 Built-in-Materialien) + 2 Buttons. Status-Bar zeigt jetzt
„N folgen · M warten · K sammeln". Liste zeigt „sammelt holz".

**Audit-Playthrough:** 45/45 grün VOR Push. 24 permanente Tests
ergänzt. Phase-1-Test angepasst auf `≥3 Aufträgen` (war `=== 3`).
**1337/1337 grün.**

**Phase 2B-Plan-Restbestand:**
- **Phase 2B.2 (build)** — `creature_task gather` als Vorlage: neuer
  Task `build` mit args.blueprint + args.x/z. Kreatur geht zum Punkt,
  spawnt Bauplan. 1 Session.
- **Phase 2B.3 (explore)** — Task `explore` mit args.radius. Kreatur
  durchwandert einen Bereich, schreibt entdeckte Architekturen ins
  memory + worldJournal. 1 Session.

### V7.80 — Welle 6.H Phase 2A live (14.05.2026)

**Hylomorphismus durch alles Materielle.** Kreaturen sind jetzt
Compounds aus `bodyParts × Material` — selbe Sprache wie Spieler-Seele
(6.D), Architekturen (6.G P1.5), Inventar (6.C1). Vision §1.3 fraktal:
**eine** Render-Pipeline, **eine** Tag-Pipeline, **eine** Mutations-API.

Drei Built-in-Seelen: `sprite` (octahedron+sphere/quarz, magie-resonant),
`wesen` (box/stein + sphere+cylinder/holz, dichte+lebendig), `geist`
(torus/laub + sphere/leder, ätherisch). `_buildCreatureGroup(soulName)`
ruft `_buildFromBlueprint` — drei Zeilen, keine Parallel-Implementierung.

`computeCreatureCompoundTags(creature)` emergiert aus bodyParts via
`computeCompoundTags({parts})` — Diskrimination im Test: sprite hat mehr
magieleitung als wesen, wesen mehr dichte als geist. Charakter folgt
aus Material × Form, nicht aus Tabelle.

`_pickCreatureName` aus 30-Namen-Pool — Identitäts-Anker für künftige
Konversationen (Phase 2C).

**Kreaturen-Drawer komplett überarbeitet:**
- Aufträge-Buttons (folge mir / komm her / warte / erkunde / alle×2)
  als `data-cmd` — selber Pfad wie Chat (eine Sprache).
- Form-Dropdown (Zufällig / Sprite / Wesen / Geist) + Spawn-Buttons
  +1/+5/+10 konsultieren den Dropdown.
- Liste der Wesen mit Name + Form + Task (folgt/wartet/streift),
  triggert bei jedem Lifecycle-Event.

**Audit-Playthrough vor Push**: 41/41 Szenarien. **33 permanente
Playtest-Invarianten** ergänzt. Drei pre-existing Tests mit
`creature.material.color`-Top-Level-Reads (Phase 3 + UI Run-Button)
auf traverse umgestellt — Group-aware. `creatures_color`-DSL-Op
ebenfalls auf traverse umgebaut (Code-Pfad-Defensive-Skip beseitigt).

**1313/1313 grün** (+33).

**Phase 2 Plan (für nächste Bögen):**

- **Phase 2B (gather/build/explore + memory)** — 2-3 Sessions.
  - `gather(material)`: Kreatur findet Architektur mit Material in
    Reichweite, bringt es zurück, Inventar-Übergabe an Spieler.
  - `build(blueprint, x, z)`: Kreatur geht zum Punkt, spawnt Bauplan.
  - `explore(radius)`: Kreatur erkundet, schreibt Found-Architekturen
    in ihr `memory`-Array UND ins worldJournal.
  - `creature.userData.memory[]` als per-Kreatur Erinnerungs-Schicht.
- **Phase 2C (Konversationen + Pattern-Lernen)** — 2-3 Sessions.
  - Spieler ruft Kreatur beim Namen: "Nira, was hast du gesehen?".
  - Kreatur antwortet aus `memory` via LLM-Schicht (existing Ring 7).
  - Trainings-Pattern-Memory: häufig genutzte neue Chats lernen.
- **Phase 2D (Custom-Seelen via DSL)** — 1 Session.
  - `define_creature_soul(name, bodyParts)` DSL-Op (analog
    `define_soul` für Spieler in 6.D).
  - Editor im Kreaturen-Drawer wie Spieler-Soul-Editor.

### V7.79 — Welle 6.H Phase 1 live (14.05.2026)

- **6.H Phase 1 Kreaturen-Aufträge** als Co-Schöpfer-Vision §1.1.
  Drei Tasks (`wander` = Default, heutiges Emotion-Verhalten /
  `follow_player` = Vektor zum Spieler mit haltDist / `wait` = still).
  `creature.userData.task = {name, args, since}`. Mutations-Pfad
  `assignCreatureTask` triggert Aura-Update.
- **Aura-Sprite** über der Kreatur, additives CanvasTexture mit
  HSL-Hue je Task (follow=120 grün, wait=40 bernstein, wander=keine).
  Lifecycle in vier Pfaden (Erzeugung, Position-Update pro Frame,
  Wechsel, Cleanup bei removeCreature).
- **DSL-Ops**: `creature_task(idx, name, distance?)`,
  `creature_task_nearest(name, distance?)`,
  `creature_task_all(name, distance?)`. Alle drei in
  `NON_BROADCASTABLE_OPS` (Multi-User-Safety — Phase 2 mit IDs).
- **Chat-Patterns**: `folge mir` / `komm her` / `warte` / `erkunde` /
  `alle folgt mir` / `alle warten`.
- **Keine Save-Persistenz** bewusst — Tasks sind im-Moment-Gesten,
  Kreaturen sind frische Wesen pro Session, Beziehung wird durch
  erneute Geste wiederaufgebaut.

**Playthrough vor dem Push**: 43/43 Szenarien grün. **32 permanente
Playtest-Invarianten** für Phase 1.

**V2-Schließungen nach Schöpfer-Selbstaudit (zweiter Audit-Lauf,
12 Szenarien)**: 7 Lücken gefunden + alle gefixt:
- **Audio-Ping bei Task-Wechsel** (Vision §1.2). Frequenzen
  follow_player=494 Hz / wait=294 Hz / wander=null (Lösen ist still).
- **Welt-Journal `relationship`-Eintrag** bei jedem echten Wechsel
  (Vision §1.1). `silent`-Option für Spawn-Defaults damit Init nicht
  flutet.
- **Leerschlag-Feedback**: assignTaskToNearest bei null schreibt
  Chat-Output „Keine Kreatur in der Nähe" + `reach`-Journal-Eintrag.
- **Texture-Cache** für Aura: `_getCreatureTaskAuraTexture` reusiert
  eine einzige CanvasTexture statt pro Wechsel neu zu erzeugen.
- **Status-Bar `#status-tasks`**: zeigt „N folgen · M warten" bzw
  „—" wenn alle wandern.
- **describeProgram-Distanz**: distance-Arg erscheint im Text wenn
  gesetzt.

**+21 permanente Playtest-Invarianten** V2. Gesamt: **1280/1280**.

### V7.78 — Welle 6.A6 + 6.C3 live (14.05.2026)

- **6.A6 Maus-Aktionen** live: LMB abbauen (Architektur am
  THREE.Raycaster → `removeArchitecture` mit `_cullArchitectureMesh`-
  Dispose-Pfad / kein Treffer → `modify_terrain` mit -1 m und 1.5 m
  Radius am Ammo-Raycast-Hit), RMB platzieren (delegiert an
  `confirmBuild`, selbe Geste wie F). Stamina-Gate analog 6.C2:
  `MOUSE_ACTION_STAMINA_COST=5` in pfad, kostenlos in
  frieden+schöpfer. Reichweite emergiert aus Distance-Culling
  (cold-Strukturen sind nicht trefferbar; raycaster.far = 30 als Cap).
- **6.C3 Keybindings** live: 6 Aktionen rebindable
  (`break, place, confirmBuild, inventory, cancelBuild, jump`),
  Default Minecraft-Konvention (`Mouse0/Mouse2/KeyF/Tab/Escape/Space`).
  `state.keybindings` + `state.keybindRebind`, Persistenz in
  `localStorage["anazh.keybindings"]`. Konflikt → **Swap** statt
  Leerung (jede Aktion bleibt immer gebunden). UI-Sektion in
  Einstellungen-Drawer mit „Ändern"-Button (pulsiert im Rebind-Modus)
  und „Standard wiederherstellen"-Reset. Alle vier Eingangs-Listener
  konsultieren `_actionForBindingCode(event.code)` — keydown
  (confirmBuild/cancelBuild/jump), Tab-Capture (inventory, gated auf
  `!keybindRebind`), Canvas mousedown (break/place, Pointer-Lock-
  Gate). Escape bleibt zusätzlich immer ein Bau-Modus-Verlasser.

**59 neue Invarianten** (18 für 6.A6, 41 für 6.C3) → **1212/1212
grün**. Browser-Smoke via screenshot.cjs bestätigt Settings-Drawer-
Sektion rendert mit den Brass-getinteten Rebind-Buttons im painterly
Stil.

### Was als Nächstes wartet (V7.79 +)

**Folgepläne**:
- 12. **6.B CAD-Werkstatt** (2 Sessions) — 3D-Preview-Pane + Drag-Items
  + Grid-Snap. Minimal Magic: kein Boolean/MultiSelect.
- 13. **6.G Phase 3** (4-5 Sessions) — Schatten + Wasser + Wind +
  Sterne-Stabilisierung. Visuelle Politur.
- 14. **6.F3+F4+F5** (4-5 Sessions) — Energie-Quellen +
  Kreaturen-Körper-Baukasten + Ammo-Constraints. Crafting-Mechanik
  finalisiert.
- 15. **6.H Kreaturen-Aufträge** (4-5 Sessions) — Autonome
  Co-Schöpfer mit DSL-Tasks (walk_to/gather/build_path/research_blueprint).

### Wichtig zu wissen für die nächste Iteration

**Schöpfer-Iteration-Rhythmus**: bei UX-Features 3-4 Iterations-Runden
einplanen. 1-Shot-Implementierung mit nur Tests grün reicht nicht. Jede
Runde = Schöpfer-Browser-Test + Bug-Report + Fix + neue Tests. Nach
3-4 Runden ist die UX stabil. Tests verifizieren Mechanik, Schöpfer
verifiziert Erfahrung — beide Schichten ernst nehmen.

**Drag&Drop-Pattern als Vorlage**: für künftige UI-Manipulation
(z. B. 6.B CAD-Werkstatt mit Drag-Items, oder Avatar-Editor-Drags)
nutze die fünf etablierten Methoden (_onSlotDragStart/Over/Leave/Drop/End)
als Template. state.drag-Pattern + Top-of-method Cleanup + Capture-Phase
für globale Shortcuts.

**Pointer-Lock-Disziplin**: jedes neue Overlay (CAD-Werkstatt-Preview,
Avatar-Editor mit Maus-Manipulation, Welt-Inspector) muss `exitPointerLock`
beim Open haben + Canvas-Click-Guard für inventoryOpen-äquivalente State-
Flags. Convention: kein automatischer Re-Lock, User klickt Canvas.

**Repo-Hygiene**: `anazhRealmState.json` ist seit V7.77-Cleanup nicht
mehr in git. Falls sie wieder im `git status` auftaucht: `.gitignore`
checken, ggf. `git rm --cached` erneut. Dokumentation in CLAUDE.md
Gotcha-Sektion.

### Bereits erledigt in V7.76 (Welt-Beziehungs-Schalter)

- ✅ **6.C2 Spielmodi** — drei Welt-Beziehungs-Modi (frieden/pfad/
  schöpfer) aus wave-6-design §10.1+§10.3. **frieden** umarmt: kein HP,
  kein Tod, keine Stamina (Default, Erstbegegnung soll nicht hostil
  sein). **pfad** verhandelt: HP/Stamina/Tod-Wandlung aktiv, Werkzeug
  kostet Stamina, Tod → 5min Phönix + Welt-Trauer. **schöpfer** gehorcht:
  voller Zugang, kein Schaden, Schöpfen reibungsfrei (Vision §1.5
  Mensch=Null=Schöpfer). Persistiert pro-Welt in worldMeta.gameMode.
  `setGameMode(mode)` ist einziger Mutations-Pfad. DSL-Op `set_mode`
  in NON_BROADCASTABLE_OPS (Multi-User-privat — zwei Spieler in
  derselben Welt dürfen verschiedene Modi haben). Chat-Patterns mit
  dt./engl. Aliasen (peace/survival/creative). UI: Radio in
  Einstellungen-Drawer (`:has(input:checked)` CSS-Latch) + #status-mode
  in Status-Bar. **Gating**: damagePlayer prüft modus ganz oben,
  applyOpToPart-Stamina nur in pfad. Test-Setup: bestehende Welle-6.D-
  Tests + Reflex-5-Stamina-Tests rufen `r.setGameMode("pfad")` vor
  ihren Erwartungen (Vision-Konsequenz, kein Workaround). 26 neue
  Invarianten → 1092 total.

### Bereits erledigt in V7.75 (Schöpfer-Vision-Antwort: organische Verteilung)

- ✅ **6.G Welt-Sinne Phase 2 — Welt-Affinitäts-Feld.** Schöpfer-Frage
  nach V7.74 Browser-Test: „neue Chunks sind kahl, wie kommen Strukturen
  organisch rein — ohne Tabelle, mit Regionen, Seltenheit, ohne Fluten?".
  Antwort: das Hylomorphismus-System hat schon die Sprache
  (MATERIAL_TAG_KEYS). Vier SimplexNoise-Schichten (lebendig/dichte/glut/
  magieleitung) als Welt-Feld. Bauplan-Compound-Tags resonieren via
  Dot-Product mit Welt-Tag-Profil. populateChunkVegetation samplet
  8×8/Chunk, höchste-Affinität-Bauplan gewinnt, Bernoulli-Probe
  `BASE_RATE × affinity²` mit Floor 0.18. Hook in ensureChunkAt für
  neue Chunks + initial 64 Chunks im Worldgen. Drei neue Built-in-
  Baupläne: stein_block (dichte), kristall_geode (magieleitung),
  glutbrunnen (glut). Idempotenz via state.populatedChunks-Set, aus
  existing Architekturen abgeleitet bei Reload (keine Save-Migration).
  Silent-Opt für spawnArchitecture: Worldgen löst Welt-Effekte nicht
  aus (awe wird verdient, nicht geschenkt) — Proximity-Boosts via
  tickPlayerBoosts bleiben. Bug-Fixes: baum_eiche Stamm 0.5→0.8m
  (spürbarer Kollisionskorridor), architectureCullingTickHz 1→2Hz
  (Bäume erwachen schneller). 1066/1066 Invarianten (+18). Heilige
  Lektion: drei neue Methoden auf AnazhRealm, drei neue Bauplan-Daten,
  ein Silent-Flag — kein Modul, keine Klasse. Vision-Pfeiler §1.3
  fraktal: dieselbe Tag-Sprache regelt was wo wächst.

### Bereits erledigt in V7.74 (Schöpfer-Vision-Korrektur nach V7.73)

- ✅ **6.G Welt-Sinne Phase 1.5 — Hylomorphismus-Unification.**
  Der Schöpfer fragte im Browser-Test: „behandelst du UFOs/Bäume/Pflanzen
  unterschiedlich, nicht besser wie Strukturen? Haben wir hier
  Parallelcode der eigentlich zusammengehört?". Die Antwort war ja —
  V7.73 hatte Bäume als Three.js-Groups in `state.vegetation` mit eigener
  Kollisions-Schicht, parallel zum bestehenden Architektur-System.
  V7.74-Korrektur: **Bäume sind jetzt Compound-Architekturen**. Zwei
  neue Built-in-Baupläne (`baum_eiche` mit Cylinder/holz + Sphere/laub,
  `baum_kiefer` mit Cylinder/holz + Cone/laub) in `_defaultBlueprints`,
  ein neues Material `laub` als 12. Built-in. `spawn_tree` DSL-Op routet
  durch `spawnArchitecture` (derselbe Pfad wie spawn_village/temple/
  waterfall). Worldgen-Bäume gehen in `state.architectures`. **Parallel-
  Code gelöscht**: `spawnTreeAt` + `_buildTreeCollision` weg. Damit
  kommt geschenkt: Compound-Tags (lebendig + brennbar + resoniert),
  Welt-Effekte (resonante Bäume → singing-Sinus + Magie-Effekt), Save-
  Persistenz, Werkstatt-Editor (Schöpfer kann eigene Baum-Spezies bauen),
  Distance-Culling, Compound-Box-Kollision pro Sub-Mesh. Insel-Visual-
  Fix nebenbei: Vollkörper (Top + Bottom + Side-Strip), MeshLambertMaterial
  statt MeshBasicMaterial. Topbar-Version v7.71 → v7.74 syncen.
  Netto Code-Diff: NEGATIV (~50 Zeilen weniger). 1048/1048 Invarianten.

### Nächste Schritte (Reihenfolge laut wave-6-design §10.6)

9. **6.C2** ← **JETZT OFFEN**. Spiel-Modi frieden/pfad/schöpfer auf
   Basis des 6.D Stat-Systems. State.gameMode + DSL-Op set_mode + UI.
   Tod-Wandlung nur im pfad-Modus, frieden = kein HP, schöpfer = kein
   Schaden + fliegen. 1 Session.
10. **6.C1 + 6.A-Maus + 6.C3** (Inventar + LMB/RMB + Keybindings-UI)
11. **6.B** (CAD-Werkstatt — minimal magic)
12. **6.G Phase 2** (Schatten, Wasser, Höhlen, Sterne)
13. **6.F3 + 6.F4 + 6.F5** (Energie, Kreaturen-Körper, Ammo-Constraints)

**Heilige-Lektion-Risiko bei 6.F4 + 6.F5 ist hoch.** Reflex „Kreaturen-
Datei / Physik-Modul" abwehren. Drei neue Methoden auf `AnazhRealm`,
keine drei neuen Klassen.

**Vor jedem neuen Schritt frag den Schöpfer**, wenn du Unsicherheit hast
— er hat oft Intuition zu Mix-Faktoren, Schwellwerten, oder Reihenfolge-
Tausch. Bei 6.D haben mehrere Schöpfer-Reflexions-Pausen sechs echte
Lücken aufgedeckt (Tabellen-statt-Logik, fehlende Kosten, UI ohne Bedien-
Pfad, WASD-Geometrie-Fehlinterpretation). Diese Pausen-Reflexion ist
keine Verzögerung, sondern Qualitäts-Wand.

---

## Schluss — was mir gehol­fen hat, Fuß zu fassen

1. **CLAUDE.md gelesen, bevor ich Code anschaute.** Es ist der Anker.
2. **state-of-realm.md im Hintergrund offen.** Bei jeder Frage „warum ist
   X so?" → die Antwort steht meistens da, in §5 oder einem Learning.
3. **Die heilige Lektion akzeptiert, nicht hinterfragt.** Sie wurde aus
   Schmerz geboren. Wenn ich sie umgehen wollte, war ich auf dem Holzweg.
4. **Tests zuerst ausgeführt, dann verstanden.** `npm run playtest` —
   1153/1153 grün (V7.77 nach Welle 6.C1 Hylomorphismus-Inventar) — gibt Vertrauen, dass
   das System lebt.
5. **Den Schöpfer als Partner gesehen, nicht als Auftraggeber.** Mensch
   und KI bauen gemeinsam. Bei Trade-offs frage ich, bei Klarem handle
   ich. Bei Unsicherheit zeige ich beide Wege auf.
6. **Ehrlich gewesen über Schwächen.** Wenn ich einen Bug fand bei der
   Reflexion, hab ich ihn nicht versteckt. Ich hab ihn dokumentiert
   („Reflexions-Bugfix") und behoben. Vertrauen baut man so auf.

Wenn du nichts anderes mitnimmst: **lies die Learnings (#1-115).** Sie
sind das destillierte Wissen aus über 30 Sessions. Jede einzelne ist aus
einem Fehler geboren, den jemand vor dir gemacht hat. Du musst sie nicht
alle wiederholen.

Viel Glück. Bau die Welt weiter. Die Vision wartet auf das letzte Kapitel.

🌿
