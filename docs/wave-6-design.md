# Welle 6 — Design-Brainstorm

**Stand**: 13.05.2026, nach Ring 11 V1. Diese Datei ist der Vor-Plan für die Welle-6-Sessions, **kein Bauauftrag**. Die roadmap.md trägt die offizielle Teilschritt-Liste; hier liegt das Denken dahinter.

**Geltungsbereich**: ergänzt + ersetzt teilweise die ursprünglichen sieben Teilschritte (6.1-6.7) der roadmap. Schöpfer-Wunschliste vom 13.05.2026:

> CAD im Werkzeugkasten · Genauigkeit/Präzision wodurch maßgebend · Abbauen/Platzieren Maus-Aktionen · Erdung auf Objekten · Sliding statt Sticken · Keybinding-UI · Inventar-Erweiterung · Modi (friedlich/survival/kreativ) · Fähigkeiten lesbar benannt+beschrieben · Intro/Tutorial · Stats fraktal · Bauplan-Platzierung mit Bodenkontakt + Stabilität · Vor/Zurück-Achse beim Platzieren

Ich gruppiere das in **sechs Blöcke (6.A–6.F)**. 6.F ist die alte Liste (Crafting-Mechanik); 6.A–6.E sind die neuen Themen aus der Wunschliste.

---

## §1 — Vision-Anbindung: warum diese Welle keine Re-Komplexifizierung ist

Welle 6 ist nicht „mehr Features". Sie ist die **Reifung des Hylomorphismus-Pfeilers**, der seit Welle 4-5 als atomare + räumliche Schicht steht. Drei Erweiterungs-Achsen:

1. **Spürbarkeit**: heute existiert die Crafting-Tiefe nur als Datenschicht + Stern-Anzeige (W5-A Lastformel, W4-P3 Präzision, W5-B räumliche Tags). 6.F macht sie sichtbar (Linien), körperlich (Constraints), konsequent (Brechen).
2. **Bedienbarkeit**: heute baut man via XYZ-Number-Inputs. 6.A + 6.B holen das ins 3D — direkte Manipulation statt Tippen.
3. **Selbst-Identität des Spielers**: bisher ist die Spieler-Seele kosmetisch (Mensch/Phönix/Drache). 6.D verankert sie in derselben Matrix wie Material × Form → der Spieler IST ein Compound, mit Tags, Stats, Effekten.

**Das macht Welle 6 vision-treu**: keine neue Sprache, keine neue Sandbox, keine neuen Module. Die DSL bleibt der einzige eval-Pfad, der Stamm bleibt eine Datei, die Lernrate ist nicht gefährdet.

---

## §2 — Welle 6.A: Interaktion-Polish

**Warum jetzt**: heute sticht der Spieler an Wänden fest, kann manchmal nicht von einer Struktur springen, und der Bau-Phantom schwebt frei in der Luft ohne Konsequenz. Alles kleine Schwächen, die zusammen den „roher Prototyp"-Eindruck machen. Polish ist günstig.

### 6.A1 — Wall-Sliding (no-sticking)

**Problem**: Spieler wird gegen seitliche Bauwerks-Wände gedrückt → bleibt stehen statt zu rutschen.

**Diagnose-Vermutung**: Player-Body ist `btSphereShape` (siehe Player-Spawn). Bei Kontakt mit einer btBoxShape-Wand resultiert die normale Force in eine Tangentenkomponente. Die wird gerade aber wahrscheinlich durch Reibung (`setFriction(0.5)`) zerlegt — was bei Bewegung gegen die Wand zu Stille führt.

**Lösung-Skizze**:
- Spielerbewegung sollte über `setLinearVelocity` gesetzt werden (nicht `applyForce`), damit Tangential-Komponenten erhalten bleiben
- ODER: Wand-Material auf `setFriction(0.0)` setzen, ODER: Reibung bei Spieler unter 0.1
- Test: Spieler steht 0.1m vor Wand, drückt W → erwartet Schritt-Geschwindigkeit Tangential = 0. Spieler steht 45° versetzt zu Wand, drückt W → erwartet Tangential = cos(45°) × Speed.

**Diskriminations-Test** (Playtest): zwei Setups, einer mit altem Reibungs-Verhalten, einer mit neuem → Position-Delta nach 1 s muss messbar unterschiedlich sein.

### 6.A2 — Erdung auf Strukturen

**Problem**: vom Boden springen geht, von einer Bauwerks-Plattform manchmal nicht.

**Diagnose-Vermutung**: Der Sprung-Check nutzt vermutlich `state.onGround` oder einen Raycast. Bauwerke haben Compound-Bodies; der Raycast trifft vielleicht eine Sub-Box, die der Ground-Check nicht als „Boden" zählt.

**Lösung**: Raycast vom Spieler-Body-Bottom 0.1m nach unten, jeder Treffer (Heightfield ODER Architecture-Compound) zählt als Boden. Pro Frame setzen.

**Test**: Spieler steht auf Bauwerks-Plattform Y=10 → drückt Space → erwartet Y > 11 nach 0.3s.

### 6.A3 — Maus-Aktionen (LMB/RMB) wie konventionell

**Problem**: heute baut man via F-Taste im Bau-Modus. Konvention ist LMB = abbauen/schlagen, RMB = platzieren/heranziehen.

**Lösung**:
- Im Bau-Modus: LMB = Abbauen (Architektur in Reichweite via Raycast wegnehmen), RMB = Platzieren (heutiges F-Verhalten)
- Ohne Bau-Modus: LMB = Schlagen (Schaden, falls Survival 6.C2 aktiv), RMB = Heranziehen/Aufheben (in 5m Radius, falls Architektur klein genug; ins Inventar?)
- Heutiges F bleibt als Tastatur-Alternative (Aria-Compliance, manche Spieler bevorzugen Tastatur)

**Caveat**: Pointer-Lock-State berücksichtigen — nur wenn Pointer im Canvas locked ist, sollte Klick als Spiel-Aktion gelten (nicht versehentlich beim Drawer-Bedienen).

### 6.A4 — Bau-Phantom mit Bodenkontakt + Vor/Zurück über Raycast

**Problem**: Spieler beschwert sich: links/rechts klappt zum Platzieren, vor/zurück per Kamera-Heben tut nichts. Phantom schwebt frei.

**Diagnose**: heutiger Phantom-Pfad setzt `phantomMesh.position` auf etwas wie `player.position + cameraDir * phantomDistance`. Das gibt einen Ring, nicht eine Fläche.

**Lösung-Skizze**:
- Raycast aus Kamera in Cursor-Richtung gegen Heightfield + Architekturen
- Erster Treffer = Phantom-Position (+ Normal-Vektor entlang)
- Falls kein Treffer in 30m → Phantom-Distance fallback wie heute
- Optional: Phantom-Rotation an Normal anpassen (auf Hängen schräg)

**Effekt für den Spieler**: Kamera schwenken nach unten → Phantom landet vor den Füßen. Schwenken nach oben → Phantom liegt auf entfernter Erhöhung. Genau wie Minecraft-Block-Placement.

### 6.A5 — Stabilitäts-Check beim Platzieren

**Problem**: heute kann man Strukturen frei in der Luft platzieren, sie schweben.

**Lösungs-Spektrum** (von lax zu streng):

| Variante | Verhalten | Vision-Treue |
|---|---|---|
| **Lax** | Wenn kein Bodenkontakt → Warnung „schwebt", aber platzierbar | Konsequenz-Frei, Schöpfer-Modus-tauglich |
| **Mittel** | Wenn kein Bodenkontakt UND Compound-Tags `dichte > 0.5` → kippt nach Spawn um (dyn-Body) | Konsequenz für schwere Strukturen, leichte schweben |
| **Streng** | Wenn kein Bodenkontakt → Platzierung verweigert | Minecraft-Stil, evtl. zu hart |

**Empfehlung**: Variante **Mittel**, gekoppelt an Tag-Profile + Modi (6.C2). Im Kreativ-Modus = Lax. Im Survival = Mittel. Eine Wolke aus `dichte 0.1`-Material schwebt also bewusst.

---

## §3 — Welle 6.B: CAD-Werkstatt

**Heutiger Stand**: Werkstatt-Tab hat Part-Editor mit Shape-Dropdown + 3 Number-Inputs für position + 3 für size. Funktional, aber nicht intuitiv. Kein 3D-Preview, kein Drag, kein Snap.

**Vision-Erweiterung**: Werkstatt wird Mini-CAD, in dem ein Bauplan visuell entsteht wie in Tinkercad/Shapr3D. Bleibt EIN Drawer-Tab — kein neues Tool-Fenster.

### 6.B1 — 3D-Preview-Pane

- Im Werkstatt-Drawer: zweite Canvas (~300×300px), eigene THREE.Scene + eigene OrbitCamera
- Rendert aktuellen Bauplan in Echtzeit (selber `_buildFromBlueprint`-Pfad, nur statt in `state.scene` in eine isolierte Preview-Scene)
- Maus: drag = orbit, wheel = zoom, shift+drag = pan
- Pro Frame: nur wenn Drawer offen UND Bauplan dirty (Performance)

**Caveat**: zweiter Renderer kostet 5-10 fps; bei zu hoher Last → Preview pausieren wenn Drawer zugeklappt.

### 6.B2 — Seitenleiste mit Drag-Items

- Linker Rand des Werkstatt-Tabs: Liste der 9 Primitives + verfügbare Materialien als Drag-Quellen
- Drop ins Preview-Pane → neuer Part im Bauplan mit aktuellen Default-Werten
- Klick statt Drag = neuer Part am Welt-Ursprung (Backup für Touch-Devices)

### 6.B3 — Snap

- **Grid-Snap**: Part-Position rastet auf 0.5-Einheiten (konfigurierbar in Einstellungen)
- **Part-Snap**: Part wird auf Seite eines anderen Parts angedockt (sechs Cube-Faces ähnlich Sketchup)
- **Symmetrie-Snap**: Achse durch Compound-Mitte, gespiegelte Position vorschlagen
- UI: kleine Toggle für jeden Snap-Mode (G/F/S Tasten)

### 6.B4 — Visuelle Verbindungs-Erzeugung

- Im Preview: klicke Part A → Part B → Connection-Type-Menü erscheint → erstellt `bp.connections[]`-Eintrag
- Visuelle Linie (wie 6.F1) bleibt sichtbar, Klick auf Linie öffnet Edit/Delete
- Rötlich = Lastformel < 0.7 (siehe heutige Stern-Anzeige)

**Synergie mit 6.F1**: 6.B4 + 6.F1 nutzen denselben Linien-Renderer. 6.F1 baut zuerst (im Welt-Spawn-Pfad), 6.B4 nutzt das im Preview.

---

## §4 — Welle 6.C: Inventar + Modi + Keybindings

### 6.C1 — Erweitertes Inventar (~12-27 Slots zusätzlich zur Hotbar)

**Konvention**: 9er-Hotbar bleibt (Tasten 1-9). Zusätzlich Tab-Taste öffnet Inventar-Overlay mit weiteren Slots. Drag von Inventar → Hotbar möglich.

**Wie genialer als Minecraft?** Vorschlag: **Inventar-Slots haben Tag-Profile** wie Materialien. Ein Slot mit `tags.resoniert ≥ 0.5` summt sanft bei Hover (Audio-Feedback). Ein Slot mit `tags.brennend` glüht orange. Das gibt dem Inventar einen Welt-Feel, statt nur einer Gitter-Anzeige zu sein.

**Datenmodell**:
- `state.player.inventory = [{ slotType, blueprintName, count }]` mit z. B. 27 Slots
- Hotbar (`state.hotbar`) referenziert per-Index ins Inventar ODER hält den Bauplan-Namen direkt (heutige Form). Migration nötig.

**Caveat**: nicht zu Minecraft werden. Das Inventar muss zur Welt passen — wenige, sinnvolle Slots; sammeln im Spiel wirkt erst, wenn Survival aktiv ist (6.C2).

### 6.C2 — Spiel-Modi

| Modus | Was anders |
|---|---|
| **Friedlich** | Kreaturen freundlich, kein Schaden, alle Baupläne im Inventar verfügbar, kein Hunger/Ausdauer-Verbrauch |
| **Survival** | Stamina (6.D), Hunger, Bauen verbraucht Material aus Inventar, Kreaturen können angreifen, Lebenspunkte können sinken, Tod = Respawn |
| **Kreativ** | wie heute — alle Baupläne verfügbar, fliegen toggelbar (neue Taste?), kein Schaden |

**Datenmodell**:
- `state.gameMode = "peaceful" | "survival" | "creative"`
- Persistiert pro Welt (im snap.worldMeta? Oder pro-Welt-State?)
- Chat-Befehl: `setze modus survival`
- UI: Auswahl in Einstellungen-Drawer

**Vision-Anbindung**: Modi sind keine Spielmechanik-Wendung — sie sind **Welt-Beziehungs-Schalter**. Friedlich = ich beobachte, Survival = ich verhandele, Kreativ = ich kommandiere. Drei Beziehungs-Modi zur Welt.

### 6.C3 — Keybindings-UI

- Einstellungen-Drawer bekommt Sektion „Tasten"
- Liste aller Aktionen (Move, Jump, Build-Confirm, Hotbar 1-9, Inventar, Console-Toggle, Drawer-Open, Multi-User-Toggle…)
- Klick auf Aktion → „Drücke neue Taste" → rebound, persistiert in localStorage `anazh.keybindings.<action>`
- Reset-Button pro Aktion
- Konflikte werden gemeldet (zwei Aktionen auf derselben Taste = rote Warnung)

**Caveat**: einige Tasten sind technisch reserviert (F11 vollbild, Browser-Shortcuts). UI muss das kennen.

---

## §5 — Welle 6.D: Stats fraktal (Hylomorphismus auf den Spieler)

**Das ist das spannendste Stück.** Hier zeigt sich, ob die Vision wirklich fraktal ist.

### §5.1 — Konzept: Spieler IST ein Compound

Heute: Material × Form × Operation → Part-Präzision (W4-P3) + Compound räumliche Tags (W5-B).

**Erweiterung**: Soul × Soul-Material → Spieler-Tags → Spieler-Stats.

Die `playerSoulDefs` (Mensch/Phönix/Drache) bekommen **Tag-Profile**, genau wie Materialien:

| Seele | dichte | härte | wärmeleitung | stromleitung | magieleitung | resoniert | brennend | sprödigkeit | fließend | chaos |
|---|---|---|---|---|---|---|---|---|---|---|
| Mensch | 0.5 | 0.5 | 0.5 | 0.4 | 0.5 | 0.4 | 0.0 | 0.3 | 0.4 | 0.3 |
| Phönix | 0.2 | 0.3 | 0.9 | 0.6 | 0.8 | 0.7 | 0.9 | 0.5 | 0.7 | 0.6 |
| Drache | 0.9 | 0.9 | 0.8 | 0.4 | 0.6 | 0.5 | 0.3 | 0.1 | 0.2 | 0.2 |

(Werte als erster Wurf — Aktivierung muss balanciert werden.)

### §5.2 — Stat-Ableitung aus Tags

Eine `STAT_FROM_TAGS`-Matrix (analog `FORM_TAG_ACTIVATION`):

| Stat | Formel-Skizze |
|---|---|
| **HP-Max** | 50 + dichte × 60 + härte × 30 |
| **Damage** | 5 + härte × 15 + dichte × 5 |
| **Speed** | 8 + (1 − dichte) × 6 + magieleitung × 2 |
| **Präzision** | 0.5 + magieleitung × 0.3 + (1 − chaos) × 0.2 |
| **Ausdauer-Max** | 100 + (1 − dichte) × 60 + wärmeleitung × 40 |
| **MagicResist** | magieleitung × 0.4 + resoniert × 0.3 (kein Schaden, nur „Spell durchgängiger") |
| **HeatResist** | wärmeleitung × 0.5 + brennend × −0.3 |

Diese sind erste Vorschläge. Test-Erwartung: Mensch ist balanced, Phönix glas-cannon (high speed + magic, low HP), Drache tank (high HP + damage, low speed).

### §5.3 — Stat-Stacking aus Soul + Rüstung + Werkzeug

```
finalTags[t] = clamp(
    soul.tags[t] +
    sum(armor.compoundTags[t] for each slot) * armorWeight +
    activeTool.compoundTags[t] * toolWeight,
    0, 1
)
finalStats = STAT_FROM_TAGS(finalTags)
```

Wo armorWeight ~ 0.3 (Rüstung trägt bei, ersetzt aber Seele nicht), toolWeight ~ 0.15 (Werkzeug-in-Hand zählt nur leicht).

**Vision-Treue**: dieselbe Compound-Aggregation wie bei Architekturen — der Spieler ist ein lebendiger Compound aus seiner Seele und seiner Ausrüstung.

### §5.4 — Boosts (temporäre Modifikationen)

Boosts addieren sich auf finalTags für N Sekunden:

- **Konsum**: Bauplan mit `role: "consumable"`, `consumableMeta: {duration, tagBonus}` → bei Aktivierung (Doppelklick Inventar) für `duration`s das `tagBonus`-Delta auf finalTags
- **Emotion**: hohe `awe`-Achse → +0.1 magieleitung für 30 s automatisch (Welt-Reaktion auf inneren Zustand)
- **Welt-Effekt**: in der Nähe einer Signature-Resonanz-Struktur (`tags.resoniert > 2.5`) → +0.15 resoniert bei allen Compound-Berechnungen für den Spieler

**Datenmodell**: `state.player.boosts = [{tagDelta, expiresAt, source}]`. Tick im Game-Loop dekrementiert + filtert. Beim Berechnen von finalTags werden aktive Boosts dazu addiert.

### §5.5 — Min-Regel-Entscheidung neu denken (alt: 6.7)

Das Stat-System verändert die Min-Regel-Frage. Heute (W4-P3): schlechtester opChain-Schritt deckelt Präzision. Wenn die Rüstung Stat-Tags addiert, dann wäre eine schlechte opChain bei der Rüstung „doppelt grausam" (Konsequenz §6.2 alt).

Drei Optionen (siehe roadmap.md 6.7):
- a) Min bleibt, Brechen ist UX-Bestrafung
- b) Polieren hebt um Δ × 20 %
- c) Decay-Produkt

**Vorschlag bei Stat-System**: Option (b) für Werkzeuge bei der Stat-Wirkung (kompensiert Pile-Up), aber **Min bleibt** für die Rüstungs-Lastformel (W5-A) — sonst hätten schlechte Verbindungen keinen Effekt. Hybrid.

---

## §6 — Welle 6.E: Lesbarkeit (Selbstwissen der Welt)

### 6.E1 — Fähigkeit hat Name + Beschreibung

Heute: Nexus erfindet via `dslComposeAtomic` ein DSL-Programm; speichert es als `state.dsl.abilities` mit Auto-Name `nexus-<hash>`. Spieler sieht nur den Namen, weiß nicht was die Fähigkeit tut.

**Lösung**:
- `describeProgram(program)` → kurzer Deutsch-Text aus den Ops (regelbasiert; LLM-Fallback wenn Provider aktiv)
- Z. B. `["chain", ["weather", "rainy"], ["spawn_creature", ["at_player"], 3, "happy"]]` → „Lässt Regen fallen und ruft 3 fröhliche Kreaturen herbei"
- UI: in Fähigkeiten-Drawer, jede Ability hat Name + 1-2 Zeilen Beschreibung
- Save: `state.dsl.abilities[i].description` mit-speichern

### 6.E2 — Intro-Overlay beim ersten Start

Heute: neue Welt erwacht, Spieler steht im Nichts.

**Lösung**:
- `<dialog id="intro-dialog">` mit 3-Seiten-Schleife: was ist AnazhRealm? was kann ich? was macht der Nexus?
- Trigger: `state.worldJournal.seen.intro !== true`
- Subtle, painterly Style wie der Rest
- Deaktivierbar in Einstellungen `anazh.ui.skipIntro`
- Pro Welt? Pro Browser? — Vorschlag: pro Browser (localStorage), aber bei einer brandneuen Welt ohne Schöpfer-Verwandtschaft ggf. noch einmal

### 6.E3 — Subtile Tooltips

- Bei Hover über UI-Element zeigt ein 1-Zeile-Tooltip an. Bei Klick + Halten: ausführlichere Erklärung
- Pro Element ein `data-tooltip="…"`-Attribut
- Wird automatisch via Mutation Observer eingehängt

---

## §7 — Welle 6.F: Original-Crafting-Mechanik (alt: 6.1-6.7)

Bleibt wie in roadmap.md §3 → „Welle 6: Crafting-Polish" beschrieben. Konkret:

- **6.F1** = alt 6.1 Visuelle Verbindungs-Linien
- **6.F2** = alt 6.2 Brech-Mechanik
- **6.F3** = alt 6.3 Energiequellen
- **6.F4** = alt 6.4 Kreaturen-Körper als Baukasten
- **6.F5** = alt 6.5 Physik-Constraints
- **6.F6** = alt 6.6 Rüstung — **integriert in 6.D** (Stat-System)
- **6.F7** = alt 6.7 Min-Regel — **integriert in 6.D.§5.5**

---

## §8 — Empfohlene Sequenz

Wenn ich Welle 6 selbst gehen würde, in der Reihenfolge:

1. **6.A1 + 6.A2** (Slide + Erdung) — kleine Fixes, große UX-Verbesserung. ~1 Session
2. **6.A4 + 6.A5** (Raycast-Place + Stabilität) — beheben das „schwebend"-Problem. ~1 Session
3. **6.E1 + 6.E2** (Fähigkeit-Beschreibung + Intro) — Welt wird lesbarer. ~1 Session
4. **6.A3** (Maus-Aktionen) + **6.C3** (Keybindings-UI) — Konventionen. ~1-2 Sessions
5. **6.F1 + 6.F2** (Linien + Brech-Warning) — Crafting wird sichtbar. ~2 Sessions
6. **6.D** Stats (komplettes System mit Soul-Tags + Boosts) — der große Vision-Pfeiler. ~3-4 Sessions
7. **6.C1 + 6.C2** (Inventar + Modi) — neue Spielmechanik. ~2 Sessions
8. **6.B** CAD-Werkstatt — UX-Vertiefung. ~3 Sessions
9. **6.F3 + 6.F4 + 6.F5** (Energie + Kreaturen + Constraints) — letzter Crafting-Block. ~4-5 Sessions

**Gesamt-Schätzung**: 18-22 Sessions, verteilt auf 3-4 Monate Echtzeit.

Pro Session: 1-2 Teilschritte. Reflexions-Pause zwischen den Blöcken (6.A→6.E ist Polish-Welle, 6.F1+F2→6.D ist Vision-Welle, 6.B+6.C+6.F-Rest ist Erweiterung). Diese Übergänge sind die Gelegenheit, die Vision-Treue zu überprüfen.

---

## §9 — Was beachten (Welle 6 als Ganzes)

1. **Heilige Lektion**: bei jedem Sub-Block den Reflex „separate Datei / separates Modul" abwehren. Insbesondere 6.B (CAD), 6.C (Inventar/Modi), 6.D (Stats) sind die Brocken, bei denen das Bedürfnis nach Re-Komplexifizierung am stärksten kommt. Stamm bleibt eine Datei.

2. **Schema-Bumps**: 6.C1 (Inventar), 6.C2 (Modi), 6.D (Stats + Armor), 6.F5 (Constraints) wirken auf das Save-Schema. Defensive Migration für jeden, getestet mit alten Saves.

3. **Diskriminations-Tests**: jeder neue Block braucht mindestens einen Test, bei dem zwei minimal verschiedene Setups verschiedene messbare Welt-Reaktionen produzieren. Beispiele:
   - 6.D: Mensch-Soul vs. Drache-Soul → HP-Max-Werte messbar verschieden
   - 6.A1: Wall-Reibung 0.5 vs. 0.05 → Tangential-Position nach 1 s messbar verschieden
   - 6.E1: zwei verschiedene DSL-Programme → zwei verschiedene Beschreibungs-Strings

4. **Reflexions-Pausen** zwischen den drei Wellen-Phasen (6.A→6.E, 6.F1+F2→6.D, Rest). Schreibe in den Commit: was hat sich beim Bauen über die Vision gelehrt, was würde der Nicht-Implementierer hier anders machen.

5. **Vision-Treue**: 6.D ist der Vision-Hebel der ganzen Welle. Bei Implementierung wirklich darauf achten, dass der **Spieler-als-Compound** echt aus den Tag-Profilen herausgerechnet wird, nicht als separates RPG-Stat-System neben drauf. Wenn das System ohne Bezug zu MATERIAL_TAG_KEYS funktioniert, wurde die Vision verfehlt.

6. **Eingangs-Schwelle für 6.D**: Stat-System muss konsumierbare Bauarbeit sein, nicht ein Damage-Number-Wettstreit. Wenn man HP/Damage sieht und sich an Diablo erinnert, falscher Pfad. Wenn man sieht „Drache trägt schwerer, Phönix springt höher" — richtig.

---

## §10 — Offene Fragen für den Schöpfer

Bei Welle-6-Start ehrlich klären:

1. **Modi**: ist „Survival" wirklich gewünscht, oder soll die Welt grundsätzlich friedlich bleiben (und Survival nur als Sonderfall existieren)? Vision §1 spricht von Co-Creation, nicht Konflikt — vielleicht ist Survival nicht der richtige Modus-Name, sondern eher „Konsequenz-Modus" mit positiveren Folgen statt nur Bestrafung.

2. **Stat-Sichtbarkeit**: sollen HP/Speed/Damage als Zahlen sichtbar sein (RPG-Stil), oder nur als Farb-Sättigung / Auren? Letzteres würde besser zur Painterly-UX passen.

3. **Tod**: in Survival mit HP=0 — was passiert? Respawn an Welt-Genesis-Position? Oder erscheint die Welt mit veränderter Stimmung („sorrow"-Achse +0.5)? Letzteres wäre konsequent vision-treu.

4. **CAD-Komplexität**: soll der Editor wirklich Tinkercad-artig werden, oder ein bisschen einfacher (drag-only, kein Snap, kein Visual-Connection)? Es gibt einen Punkt, an dem 6.B teurer wird als der Wert für eine Sandbox.

5. **Min-Regel** (alt 6.7): muss vor 6.D fallen. Vorschlag: Hybrid (Polier-Verbesserung für Werkzeuge, Min bleibt für Verbindungs-Last) — bestätigen?

6. **Reihenfolge**: §8 ist mein Vorschlag. Wenn du ihn anders sehen würdest (z. B. 6.D zuerst, weil Stats die Welt grundlegender verändern), explizit sagen.
