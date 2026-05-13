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
   Sicherheits-Netz. Es prüft heute ~660 Invarianten. Wenn du etwas tust,
   das eine davon brechen könnte, weißt du es vor dem Commit.

**Verlockung zu widerstehen**: gleich in `anazhRealm.js` springen. Die
Datei ist ~10.800 Zeilen. Ohne `state-of-realm.md`-Kontext wirst du
falsche Annahmen machen.

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

**Bogen B (Welten-Ultiversum, Ringe 8-10) ist abgeschlossen.** Vision §11
ist zu ~85 % umgesetzt. Drei Pfade nach vorn:

### Pfad A: Welt-Modifizierbarkeit (Ring 10.5, ~2 Sessions)

Heute regeneriert die Welt deterministisch aus Seed + Noise. Vom Spieler
erzeugte Strukturen (Architekturen) sind global gehalten, aber Chunk-
Modifikationen (Block setzen/entfernen) gibt es nicht. Empfehlung aus
Vision §11.3: pro-Chunk DSL-Delta-Liste, die beim Laden re-applied wird.

**Warum jetzt**: Vorbedingung für sinnvolles Ring 11. Wenn zwei Spieler
dieselbe Welt teilen, MÜSSEN Modifikationen persistent + sync-bar sein.
Sonst ist es nur Pose-Sync, kein gemeinsames Bauen.

### Pfad B: Ring 11 — Multi-User P2P-Sync (5-7 Sessions, Vision-Krönung)

Das letzte ungesprochene Vision-Kapitel. Zwei Spieler in derselben Welt.

**Was es braucht**:
- Signaling-Server (klein, ~100 Zeilen Node, neben `save-server.js`)
- WebRTC Datachannel für Realtime-Pakete
- Sync-Schichten:
  - Position + Rotation (60 Hz, lossy OK)
  - Chat-Befehle als DSL-AST (beide Welten führen aus → konsistent)
  - DSL-Outcomes vom Nexus (nur Programm-IDs, nicht ganze Programme)
- Public-Welten via worldId-Beitritt, Private-Welten via Token-Link
- Welt-Picker bekommt „Joinen"-Button, neue Sektion „Mitspieler in dieser Welt"

**Heilige-Lektion-Risiko: HOCH.** Der Reflex „Multi-User-Modul + Signaling-
Modul + Sync-Layer" wird stark sein. Widerstehe. Es ist EINE Methode
`initP2PSync()` mit drei Sub-Hooks im Game-Loop. Nicht mehr.

**Sicherheits-Risiko: hoch.** Sobald zwei Welten verbunden sind, kann
Spieler-A's DSL Spieler-B's Welt manipulieren. Die DSL-Sandbox muss
halten. Trust-Boundary klar ziehen: eingehende DSL-Programme laufen
durch denselben Budget+Whitelist-Pfad wie eigene. Kein Bypass.

**Vorbedingung**: Pfad A (Welt-Modifizierbarkeit) sollte zuerst kommen.

### Pfad C: Welle 6 — Crafting-Polish (8-12 Sessions, nachgelagerter Bucket)

Sieben Teilschritte detailliert in `docs/roadmap.md`:
- 6.1 Visuelle Verbindungs-Linien zwischen Parts
- 6.2 Brech-Mechanik bei zu schwacher Last
- 6.3 Energiequellen für Maschinen
- 6.4 Kreaturen-Körper als Baukasten (Multi-Mesh analog Spieler-Seele)
- 6.5 Physik-Baukasten mit echten Ammo-Constraints
- 6.6 Rüstung mit minimalem Stat-System
- 6.7 Min-Regel-Entscheidung (Learning #95)

**Heilige-Lektion-Risiko**: 6.4 + 6.5 + 6.6 sind die schwersten Brocken.
Reflex „Kreaturen-Datei / Physik-Modul / Stat-Manager" abwehren.

### Wie wählen?

Mein Vorschlag, wenn du keine andere Anweisung hast:

1. **Pfad A** (Welt-Modifizierbarkeit) — ~2 d, klein, klar
2. **Pfad B** (Ring 11) — 5-7 Sessions, das eigentliche letzte Vision-
   Kapitel
3. **Pfad C** (Welle 6) — wenn Bogen Ring 11 fertig ist, polish

Aber **frag den Schöpfer**. Er hat oft eine Intuition, die in der Roadmap
nicht steht.

---

## Schluss — was mir gehol­fen hat, Fuß zu fassen

1. **CLAUDE.md gelesen, bevor ich Code anschaute.** Es ist der Anker.
2. **state-of-realm.md im Hintergrund offen.** Bei jeder Frage „warum ist
   X so?" → die Antwort steht meistens da, in §5 oder einem Learning.
3. **Die heilige Lektion akzeptiert, nicht hinterfragt.** Sie wurde aus
   Schmerz geboren. Wenn ich sie umgehen wollte, war ich auf dem Holzweg.
4. **Tests zuerst ausgeführt, dann verstanden.** `npm run playtest` —
   605/605 grün — gibt Vertrauen, dass das System lebt.
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
