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
Playtest-Invarianten**. Gesamt: 1259/1259.

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
