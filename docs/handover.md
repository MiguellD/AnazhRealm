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
   Sicherheits-Netz. Es prüft aktuell **~1014 Invarianten (V7.72 nach Welle 6.D komplett)**.
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
- ✅ **Schöpfer-Reflexions-Fixes** — WASD-Geometrie-Revert (`state.right`
  ist player-LINKS geometrisch, in Right-Hand-Coords mit Y up gilt
  forward × up = -X, also player-anatomisch-rechts = -state.right),
  Drache-Inner-π-Flip (Tail-Cone ist die wahrgenommene Schnauze, gehört
  in +Z = Forward), Aura-Sprite-Falloff statt Sphere (weicher Schimmer
  ohne harte Kontur), Chat-Patterns für damage/trink/rüste.

### Nächste Schritte (Reihenfolge laut wave-6-design §10.6)

8. **6.G Welt-Sinne Phase 1** ← **JETZT OFFEN**. Kollisionen für
   fliegende Inseln + Bäume. Kleine Eingriffe, große Wirkung. 1-2 Sessions.
9. **6.C2** (frieden/pfad/schöpfer-Modi) — nutzt 6.D Stat-System. 1 Session.
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
   1014/1014 grün (V7.72 nach Welle 6.D komplett) — gibt Vertrauen, dass
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
