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

## §10 — Schöpfer-Entscheidungen (13.05.2026)

Der Schöpfer hat mir bei den sechs offenen Fragen freie Hand gelassen — „entscheide was cool ist, authentisch, antik mit modern verschmelzend". Hier meine Entscheidungen mit kurzer Begründung. Wer das später anders sieht, ändert es bewusst.

### §10.1 — Spiel-Modi-Namen: `frieden` / `pfad` / `schöpfer`

Statt „Friedlich / Survival / Kreativ":
- **frieden** — keine HP, keine Stamina, Kreaturen freundlich, alle Baupläne verfügbar. (Original „friedlich" verkürzt.)
- **pfad** — der frühere „Survival". Spieler geht einen Pfad mit Konsequenz: Stamina-Verbrauch, Verletzungen, Inventar-Knappheit, Kreaturen mit eigener Agenda. *Pfad* statt *Survival*, weil der Vibe ist: man wandert, lernt, wird besser — nicht „überlebe".
- **schöpfer** — das frühere „Kreativ". Voll-Zugang, fliegen toggelbar, kein Schaden, alles instant. Name spiegelt die Vision (Mensch = Null = Schöpfer).

DSL-Op: `set_mode(frieden|pfad|schöpfer)`. Save: `state.gameMode = "pfad"` (default frieden für neue Welten, weil Welt erst-Begegnung nicht hostil sein soll).

### §10.2 — Stats-Sichtbarkeit: Auren default, Zahlen bei Inspect

Default-Anzeige: subtile Aura um Spieler-Avatar (HSL-Hue aus dominanter Tag-Achse, Saturation aus HP%/MaxHP). Werkzeug glüht leicht in seiner opClass-Farbe. Rüstung zeigt Material-Tint.

Bei Hover über Avatar/Werkzeug/Rüstung-Slot → Tooltip mit nummerischen Werten ("HP 87/120 · Speed 11.4 · Präzision 0.83"). Bei Klick auf Avatar → Inspect-Panel mit voller Stat-Auflistung + Boost-Liste + Quellen-Aufschlüsselung ("HP 120 = 50 base + 60×dichte + 30×härte_durch_Rüstung").

**Antike trifft modern**: Auren = mystisch/antik, Inspect-Zahlen = analytisch/modern. Beide gleichzeitig sichtbar nur bei expliziter Wahl. Default ist gefühlt, nicht gerechnet.

### §10.3 — Tod-Behandlung: Phönix-Wandlung mit Welt-Trauer

**SWOT der vier Optionen**:

| Option | S | W | O | T |
|---|---|---|---|---|
| Klassisch Respawn | vertraut, schnell zurück | Vision-fremd | – | „Game Over"-Vibe, RPG-Defaultismus |
| Welt trauert (sorrow +0.5, Spieler erwacht) | Vision-treu, narrativ, emotional | komplex | Tod wird Welt-Erinnerung, Journal-Eintrag | Spieler verwirrt wenn nicht klar erklärt |
| Seele wandert (Tod = Phönix-Wechsel) | mythologisch, fraktal | Phönix-Seelen-Spezifizität schwächer | Antik: „Tod ist Verwandlung" | – |
| Kein Tod (Bewusstlosigkeit + Heilung) | sanft, friedlich | konsequenz-leicht | – | eintönig |

**Entscheidung — Hybrid „Phönix wandelt, Welt trauert"**:

Wenn HP=0 im `pfad`-Modus:
1. Spieler-Seele wechselt automatisch auf `phönix` für 5 Minuten (Cooldown im Save)
2. HP regeneriert sich während dieser Zeit langsam zurück
3. Emotion-Welt-Achsen: `sorrow +0.3` + `awe +0.2` (Wandlung ist beides)
4. Journal-Eintrag: `Die ${alteSeele} fiel hier. Eine Flamme erhob sich.`
5. Nach 5 Min: Spieler kann manuell zur ursprünglichen Seele zurück (oder bleibt Phönix wenn ihm das gefällt)

Im `frieden`-Modus: HP existiert nicht, also kein Tod.  
Im `schöpfer`-Modus: kein Tod, Welt-Trauer trotzdem als optionales narratives Element triggerbar via DSL.

Vision-Anbindung: drei der Tag-Achsen werden hier verwoben — `chaos` (verlust) + `awe` (verwandlung) + `hope` (regeneration). Tod ist nicht Strafe, sondern Welt-Erinnerung + Spieler-Transformation.

### §10.4 — CAD-Komplexität: Min Viable Magic

**Entscheidung — bewusst minimal, drei Kernfeatures**:

1. **3D-Preview-Pane** (300×300px, OrbitControls)
2. **Drag-Items** aus Shape-Sidebar in Preview → neuer Part am Ursprung
3. **Grid-Snap auf 0.5-Einheiten** (Toggle G-Taste)

**NICHT in V1**: Boolean-Operationen (Union/Subtract), MultiSelect, Group, Symmetrie-Snap, Part-Snap auf andere Parts, kopieren-einfügen. Wer das braucht, geht zum Code-Editor (anazhRealm.js direkt). Das CAD ist für magisches Stöbern, nicht für CAD-Profis.

**Vision-Anbindung**: das ist ein Sandbox für Kinder-Wunder, nicht für Ingenieure. Wer ein Schwert baut, soll dabei lächeln, nicht stirnrunzeln. Wenig Knöpfe = wenig Hürden zur Magie.

### §10.5 — Min-Regel-Hybrid

**Erklärung der heutigen Min-Regel** (W4-P3): jeder Part hat eine `opChain` (Liste von Werkzeug-Anwendungen). Die Part-Präzision = MIN(Werte der Chain). Wenn man mit Hand grob beginnt (cap 0.4), dann mit Polierscheibe (cap 0.97) feinarbeitet — die Hand zieht den Wert auf 0.4 fest, die Polierscheibe ändert nichts.

**Problem**: kein Spielraum für Lernen + Reparatur. Schlechter erster Schritt = nicht mehr aufholbar.

**Hybrid-Vorschlag (jetzt entschieden)**:

Für **Werkzeug-opChain bei Part-Präzision** (W4-P3):
- Statt strikt min: **`precision = min + (max − min) × decay^N`** wo N = Schritte unter min, decay = 0.7
- In Worten: schlechte Anfangsarbeit kann durch 4-5 hochwertige Schritte teilweise gehoben werden, aber nie ganz aufgeholt
- Beispiel: Hand 0.4 → Hammer 0.7 → Feile 0.85 → Polierscheibe 0.97. Min wäre 0.4. Hybrid: 0.4 + (0.97 − 0.4) × 0.7³ = 0.4 + 0.57 × 0.343 = 0.595. Polieren hat geholfen, aber die initiale Hand-Arbeit prägte das Werk.

Für **Verbindungs-Last** (W5-A) und **Compound-Tags** (W5-B): **Min/Max-Aggregation bleibt streng** — Verbindungen sind physikalisch (Mörtel kann nicht nachträglich verstärkt werden), Tags sind emergent (Spitze richtet, oder nicht).

**Vision-Anbindung**: „der erste Schlag prägt die Form, die letzte Politur prägt den Glanz." Antik-handwerklich. Der Spieler kann durch Sorgfalt + Geduld kompensieren, nicht beliebig. Bestraft Faulheit, belohnt Hingabe.

### §10.6 — Reihenfolge (entschieden)

**Status V7.72 (13.05.2026)**: Schritte 1-6 erledigt + Schöpfer-Reflexions-Fixes. 6.D ist der Vision-Pfeiler — komplett in 7 Etappen umgesetzt.

1. ✅ **6.A1 + 6.A2** (Wall-Sliding + Erdung auf Bauwerken) — V7.72
2. ✅ **6.A-Slope (neu, ad-hoc)** (Slope-Anti-Klebe — `maxWalkableSlopeY=0.5`, Drossel auf 20 % bei >60°) — V7.72
3. ✅ **6.A4 + 6.A5** (Raycast-Place + Grün/Rot-Phantom-Tint) — V7.72
4. ✅ **6.E1 + 6.E2** (Fähigkeit-Beschreibung + dynamisches Intro-Dialog) — V7.72
5. ✅ **6.F1 + 6.F2** (Verbindungs-Linien + Brech-Warning bei strength <0.7) — V7.72
6. ✅ **6.D Stat-System komplett** — der Vision-Pfeiler. Sieben Etappen:
   - 1: STAT_FROM_TAGS-Matrix + state.player.stats + applyPlayerSoul→recomputePlayerStats-Pipe
   - 1.5: Seele = Bauplan aus Körper-Teilen (Vision-Korrektur: keine hardcodete Tabelle)
   - 1.6: `define_soul` DSL-Op + state.customSouls + Custom-Rendering via _buildFromBlueprint
   - 1.7: Visueller Avatar-Editor im Spieler-Drawer (klonen/edit/parts add+remove+update)
   - 2: Boosts aus 3 Quellen (Emotion / Welt-Resonanz / Konsum)
   - 3a: Tod-Wandlung mit Welt-Trauer + Min-Regel-Hybrid + Werkzeug-Stamina-Kosten + persistente Tod-Wunde
   - 3b: Stat-Stacking (Soul + Armor×0.3 + Tool×0.15 + Boosts − Wound) + Aura-Visual (Sprite + Radial-Gradient + AdditiveBlending)
7. ✅ **Schöpfer-Reflexions-Fixes** — WASD-Geometrie-Revert (`state.right` ist player-LINKS in Right-Hand-Coords), Drache-Inner-π-Flip (Cone-Tail als wahrgenommene Schnauze in +Z), Aura-Sprite weicher Falloff statt Sphere-Kante
8. **6.G Welt-Sinne — Phase 1** ← **JETZT OFFEN** (Kollisionen für fliegende Inseln + Bäume). 1-2 Sessions.
9. **6.C2** (Spiel-Modi frieden/pfad/schöpfer) — nutzt das Stat-System. 1 Session.
10. **6.C1 + 6.A-Maus + 6.C3** (Inventar + LMB/RMB-Aktionen + Keybindings-UI). 2-3 Sessions.
11. **6.B** (CAD-Werkstatt — minimal magic). 2 Sessions.
12. **6.G Welt-Sinne — Phase 2** (Schatten + Wasser + Höhlen + Sterne). 3-4 Sessions.
13. **6.F3 + 6.F4 + 6.F5** (Energie + Kreaturen-Körper + Ammo-Constraints). 4-5 Sessions.

**Gesamt-Schätzung**: 20-25 Sessions, verteilt auf 4-5 Monate Echtzeit.

Logik der Reihenfolge:
- **Polish zuerst** (1-2): das was heute am meisten stört. Sofort fühlbar.
- **Lesbarkeit + sichtbares Crafting** (3-4): Spieler versteht, was die Welt tut.
- **Stat-System (5)** — Vision-Hebel. Nach Lesbarkeit, weil Stats erst sichtbar gemacht werden müssen, um sinnvoll zu sein.
- **Welt-Sinne Phase 1 (6)** — Kollisionen für Inseln+Bäume sind kleine Eingriffe, große Wirkung.
- **Modi (7)** — braucht Stats.
- **Inventar+Keys (8)** — strukturelle UX.
- **CAD (9)** — UX-Vertiefung, nach Konventionen-Block.
- **Welt-Sinne Phase 2 (10)** — visuelle Politur, kommt nahe ans Finale.
- **Crafting-Tiefe (11)** — schwerster Brocken zuletzt, weil andere Schichten als Fundament gebraucht werden.

---

## §11 — Welle 6.G: Welt-Sinne (visuelle + physikalische Politur)

Nachgereicht 13.05.2026 vom Schöpfer. Diese Liste macht die Welt **körperlich vollständig** — heute fehlen ein paar Sinne, die jedes andere 3D-Spiel hat. Polish, aber wichtig fürs Finale.

### 6.G1 — Fliegende Inseln als kollidierbares Terrain (~1 Session)

**Heute**: `spawnIslands` (siehe anazhRealm.js) erstellt schwebende Insel-Meshes als rein dekorativ. Sie haben keine Kollision — Spieler fällt durch.

**Lösung**: jede Insel bekommt ein `btBvhTriangleMeshShape` aus ihren echten Vertices (selbes Muster wie Chunks). Insel-Mesh + Body bleiben gekoppelt, Insel-Position wird im `state.rigidBodies`-NICHT-Set gehalten (Visual = Collision bei Position 0,0,0, Vertices in Welt-Koords — siehe CLAUDE.md Gotcha über Chunks).

**Test**: Spieler springt auf Insel → erwartet `playerMesh.position.y > inselY + 0.5` nach Landung.

### 6.G2 — Bäume mit Kollision (~0.5 Session)

**Heute**: Bäume sind kosmetische Single-Meshes ohne Body.

**Lösung**: pro Baum ein `btCylinderShape` als Stamm-Kollider, Höhe = Baum-Höhe, Radius = 0.4. Krone bleibt kollisionsfrei (Spieler kann durch Blätter).

**Caveat**: bei vielen Bäumen kostet das Physik-Performance. Cap auf sichtbare Bäume + Distance-Culling (analog Architekturen).

### 6.G3 — Schatten (~1-2 Sessions)

**Heute**: keine Schatten, Welt fühlt sich „kontaktlos" an.

**Lösung**: Three.js `DirectionalLight` mit `castShadow=true`, Shadow-Map 1024×1024 (oder 2048 für gehobenere Hardware), PCF-Soft-Shadows. Schatten-Empfänger: alle Architekturen, Bäume, Chunks. Schatten-Werfer: alle Objekte über dem Boden.

**Performance**: Shadow-Maps sind teuer. Toggle in Einstellungen (Standard: an, deaktivierbar). FOV der Shadow-Camera auf sichtbares Umfeld begrenzen (~30 Einheiten Radius um Spieler).

### 6.G4 — Shader-Erweiterungen (~1 Session)

**Heute**: Terrain ist `MeshBasicMaterial` (kein Licht-Effekt), Architekturen ähnlich.

**Lösung-Skizze**: Wechsel auf `MeshLambertMaterial` oder leichtgewichtigen Custom-Shader mit:
- Subtile Höhe-Tinting (höher = blasser, tiefer = sattier — antik-malerischer Look)
- Wind-Animation für Bäume (Vertex-Shader-Wackeln)
- Glüh-Effekt für hochpräzise Compounds (W4 P3 Welt-Effekt visuell verstärken)

**Caveat**: Custom-Shader müssen mit CSP `'unsafe-eval'`-Verbot klarkommen (kein eval). Three.js generiert Shader aus String-Concatenation, das ist OK. Aber MeshBasicMaterial mit modifier callback wäre Vorsicht.

### 6.G5 — Himmel-Sterne stabilisieren + Variation (~0.5 Session)

**Heute**: Galaxie-Skybox flackert beim Bewegen — die Sterne werden offenbar in Welt-Koordinaten gerendert statt in Kamera-Raum.

**Diagnose**: vermutlich der `createGalaxySkybox()`-Pfad. Sterne sollten in Kamera-folgendem Coordinate-Space gerendert werden, nicht in Welt-Koords (die ihre Position relativ zur Kamera ändern → Aliasing).

**Lösung**:
- Skybox-Mesh hat Position = `camera.position` jeden Frame (folgt mit, statt fest)
- Sterne-Punkte werden im Vertex-Shader transformiert mit Identity-Translation
- Variation: 3 verschiedene Stern-Typen (groß/mittel/klein) mit unterschiedlichen Farben (warm/kalt/grünlich) und Helligkeits-Falloff

### 6.G6 — Terrain: Höhlen + Überhänge + Klippen (~2-3 Sessions, anspruchsvoll)

**Heute**: Terrain ist Heightfield (eine Höhe pro X/Z-Koordinate). Höhlen + Überhänge sind topologisch ausgeschlossen.

**Lösung-Skizze**: 
- 2D-Heightfield bleibt für die Grundebene
- Höhlen + Überhänge als **modify_terrain-Erweiterung** mit `op.type = "carve_cavity"` — schnitzt einen Hohlraum ins Terrain mit metaball-artigem Falloff
- Klippen entstehen organisch durch `caveNoise`-Modifier (bereits in `_terrainHeightAtWorld`) — verstärken
- Pro-Chunk-Delta speichert auch Carve-Ops (gleiche Datenstruktur wie modify_terrain)

**Caveat**: btBvhTriangleMeshShape kann durch Höhlen geometrisch teuer werden (mehr Triangles). Bei wenigen Höhlen pro Chunk akzeptabel; bei massivem Carving evtl. LOD.

**Vision-Anbindung**: Welt wird begehbar in drei Dimensionen. Wer einen Tempel im Berg baut, kann ihn betreten.

### 6.G7 — Wasser (~2 Sessions)

**Heute**: kein Wasser. Wetter `rainy` ändert nur Skybox + Stimmung.

**Lösung**:
- `state.water` mit pro-Chunk Wasser-Höhe (eigene Layer, analog Heightfield)
- Animiertes Wasser-Mesh: niedrig-aufgelöste Plane mit Wellen-Vertex-Shader
- Wasser-Tag-Profile: hohe `fließend`, hohe `magieleitung`, niedrig `dichte`
- Eintauchen: Spieler unter Wasser-Höhe → Bewegung gedämpft, Stamina verbraucht schneller (`pfad`-Modus), Atem-Anzeige
- DSL-Ops `fill_water(x, z, r, height)` und `drain_water(x, z, r)` — Wasser ist auch modifizierbar

**Vision-Anbindung**: Wasser ist im Hylomorphismus-System genau wie Stein und Eisen — ein Material mit Tag-Profil, das in Compounds (Brunnen, Aquädukte, Flüsse) verwendbar ist.

---



## §12 — Welle 6.H: Kreaturen-Aufträge (autonome Co-Schöpfer)

Hinzugefügt 13.05.2026 vom Schöpfer. **Bevor du dies liest**: Block 6.F4 baut Kreaturen-Körper als Baukasten. Dieser Block (6.H) gibt diesen Körpern **eine eigene Agenda**. Sie wird nach 6.F4 sinnvoll, kann aber auch ohne Multi-Mesh-Bodies funktionieren (Single-Mesh-Kreaturen reichen für V1).

### §12.1 — Konzept: Kreaturen als Hilfsgeister

Heute sind Kreaturen Bewegungs-Dekoration — sie wandern, springen, ändern Farbe nach Wetter. Sie tragen keine eigene Absicht.

**Vision-Erweiterung**: Kreaturen werden zu **autonomen Co-Schöpfern**. Der Spieler gibt ihnen Aufträge (in DSL formuliert), sie führen sie aus mit Pfadfinden + Stamina + Materialhandhabung. **Dritter Schöpfungs-Akteur** neben Mensch (Null) und Nexus (Eins) — Kreaturen sind die `Vielen`.

Vision-Anbindung: Pfeiler §1.5 spricht von „Symbiose Mensch + KI". Kreaturen erweitern das um „Symbiose Mensch + KI + autonome Welt-Wesen".

### §12.2 — Auftrags-Modell

Jeder Auftrag ist ein **DSL-Programm**, das die Kreatur als ihre Agenda übernimmt:

```js
state.creatures[i].task = {
    program: ["chain",
      ["walk_to", ["at", 50, 0, -20]],
      ["gather", "stein", 3],
      ["walk_to", ["at_player"]],
      ["deliver", "stein"]
    ],
    status: "running" | "paused" | "complete" | "failed",
    progress: { stepIndex: 0, gatherCount: 0 },
    energyLeft: 100,  // Stamina-Decay
    assignedAt: Date.now(),
}
```

**Vier Auftrags-Klassen** (entspricht dem Wunsch des Schöpfers):

**a) Straßen + Wege bauen**:
```js
["build_path", ["at", x1, z1], ["at", x2, z2], "stein"]
```
- Kreatur läuft den Pfad ab, ruft pro N Meter `modify_terrain(x, z, 1, +0.05)` auf (sanfte Erhöhung), platziert pro M Meter ein flaches Stein-Compound (Bauplan „weg-stein").
- Konsumiert Stein-Material aus Spieler-Inventar (V1: kostenlos)

**b) Materialien farmen**:
```js
["gather_loop", "holz", 10]  // sammle 10 Holz, bring zum Spieler
```
- Kreatur sucht Bäume in 30m-Radius, walk_to, animation „hacken" (2s), Material in eigenes Inventar, dann walk_to(at_player) + deliver.
- Vorbedingung: Bäume müssen abbaubar sein (6.G2 Kollision + 6.F4 dynamic-bodies + neue spawn_tree-Op die NICHT nur ein _requested-Event loggt).

**c) Rezepte forschen**:
```js
["research_blueprint", "schwert"]  // versucht einen schwert-Bauplan zu finden
```
- Kreatur „grübelt" (sitzt 30s mit pulsierender Aura)
- Mit Wahrscheinlichkeit p basierend auf Kreaturen-Material-Tags (`magieleitung × resoniert`) entsteht ein neuer Bauplan
- Vergibt zufällige aber valide `parts[]`-Struktur (1-4 Parts, mit Materialien aus state.materials, Form passend zum Zweck)
- Übernimmt das Konzept der **Aktivierungsmatrix** umgekehrt: Forschungs-Ziel bestimmt Tag-Profil, Kreatur sucht passende Form+Material

**d) Häuser/Strukturen bauen**:
```js
["build_house", ["at", x, z], "hütte"]
```
- Kreatur läuft zur Position
- Konsumiert Material aus Spieler-Inventar (oder eigenem)
- Spielt Anim "bauen" (10s)
- Spawnt am Ende `spawn_blueprint("hütte", ["at", x, y, z])`

### §12.3 — Neue DSL-Ops

- `walk_to(positionNode)` — Pfadfinden-Move (gradient descent gegen Heightfield, einfacher A* falls Block 6.F5 Constraints da sind)
- `gather(material, count)` — Material-Suche + Animation + Inventory-Add
- `deliver(material, [targetId])` — gibt Material an Spieler oder Ziel-Kreatur
- `build_path(from, to, material)` — Straßen-Bau
- `build_house(at, blueprint)` — Compound-Spawn
- `research_blueprint(category)` — Rezept-Erfindung
- `assign_task(creatureId, taskProgram)` — Spieler übergibt Auftrag an spezifische Kreatur

### §12.4 — Auftrags-Vergabe-UI

**Maus-Klick auf Kreatur**: kleines Kontext-Menü öffnet sich
```
┌─ Kreatur grüße ────────┐
│ ▸ Sammle Material      │
│ ▸ Baue Weg              │
│ ▸ Baue Haus             │
│ ▸ Forsche Rezept        │
│ ▸ Folge mir             │
│ ▸ Pause                 │
└────────────────────────┘
```
Klick auf Option öffnet sub-Dialog für Parameter (Material-Typ, Ziel-Position via map-click, etc.)

Alternativ Chat-Befehle:
- „kreatur sammelt 10 holz"
- „kreatur baut weg von hier nach <position>"
- „kreatur forscht schwert"

### §12.5 — Auftrags-Tick im Game-Loop

`creatureTaskTick()` läuft pro Frame:
- Für jede Kreatur mit `task.status === "running"`:
  - Step ausführen: walk_to → bewege ein Stück Richtung Ziel, gather → check Radius nach Material-Source
  - Bei Step-Abschluss: increment stepIndex
  - Bei task-Abschluss: status=complete, optional Journal-Eintrag

**Performance**: 50 aktive Kreaturen × jede mit task-tick = 50 Updates pro Frame. Bei einfacher Pfadfindung (gradient descent) <0.5ms. Acceptable.

### §12.6 — Vision-Anbindung (warum das vision-treu ist)

1. **Symbiose-Erweiterung**: Mensch gibt Auftrag, KI (Nexus) hat eigene Aufträge im Auto-Mode, Kreaturen verbinden beides — die Welt füllt sich mit autonomen Wesen, nicht nur reaktiven Bewegungen.

2. **Hylomorphismus-Vertiefung**: Kreaturen-Forschung benutzt die `MATERIAL_TAG_KEYS` + `FORM_TAG_ACTIVATION` umgekehrt — vom Ziel-Tag-Profil aus Form+Material wählen. Schöpft auf demselben System wie alles andere.

3. **Fraktales Wachstum**: einzelne Kreatur sammelt → mehrere Kreaturen koordinieren (V2) → Kreaturen-Kulturen entstehen (V3 §11.4 Welt-Ultiversum).

4. **Emotion-getrieben** (Pfeiler §1.2): hohe `joy` macht Kreaturen schneller bei Aufträgen, hohe `sorrow` lässt sie eigene Aufträge erfinden (Wandern, Trauern), hohe `chaos` lässt sie Aufträge ablehnen.

### §12.7 — Aufwand

**4-5 Sessions** wegen Komplexität (Pfadfinden, Animations-Sync, Auftrags-State-Machine, UI).

Empfohlene Reihenfolge:
1. Datenmodell + walk_to + gather (Material-spawn vorausgesetzt) — 1 Session
2. build_path + build_house — 1 Session
3. research_blueprint + UI Kontext-Menü — 1-2 Sessions
4. Multi-Kreatur-Koordination + Journal-Integration — 1 Session

**Vorbedingungen**:
- Welle 6.F4 (Multi-Mesh-Kreaturen) — Anim-Hooks brauchen Glieder
- Welle 6.A4 (Raycast-Place) — Maus-Klick auf Welt für Auftrags-Ziel
- 6.G6 (Höhlen) ist optional — Pfadfinden braucht 3D-Topology nicht zwingend

### §12.8 — Was beachten

1. **Heilige Lektion**: NICHT als „CreatureAI-Modul" — bleibt im Stamm. Neue Methoden: `creatureAssignTask`, `creatureTaskTick`, `_creaturePathStep`. ~10 Methoden, alle auf der einen Klasse.
2. **DSL-Sandbox bleibt**: Kreaturen-Aufträge sind DSL-Programme. Laufen durch dslRun mit Budget-Limits. KEIN eval-Pfad.
3. **Auftrags-Persistenz**: tasks in state.creatures[i] werden in buildStateSnapshot mitgespeichert. Beim Load: wiederaufnehmen.
4. **Synchronisation in Multi-User** (V2.x): wenn Spieler A einer Kreatur Auftrag gibt, broadcast als DSL → B's Welt führt aus. Aber: Kreaturen müssen denselben Identifier haben. Lösung: Kreatur-IDs deterministisch aus spawn-Reihenfolge + worldSeed.

---
