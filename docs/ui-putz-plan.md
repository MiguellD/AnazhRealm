# Der UI-Putz — die Bibliothek von Alexandria der Moderne (Plan)

> **Lies dies ZUERST vor jeder Arbeit am UI / an der Bedien-Oberfläche / am HUD / an den
> Drawern / Tabs / am Inventar / an der Ausrüstung / am Theme / an der Erreichbarkeit von
> Spieler-Funktionen.** Es hält die gemessene Bestandsaufnahme (06.06.2026), die
> Design-Philosophie und den geordneten Plan fest. Verwandte Anker: `kampf-plan.md` §11
> (die Werkstatt — das Vorbild-Subdesign), `das-lebendige-feld.md` (die Welt, die das UI
> trägt), `state-of-realm.md` (die Vision).

**Stand: GEBAUT + VEREDELT (V18.34, 07.06.2026).** Zehn Bögen verifiziert + gepusht
(`_el`-Builder · Tag/Nacht weg · WOW-Start · Hilfe→Einstellungen+Dev gestaffelt ·
Emotion-Klarheit · Rezeptbuch+Equip · Der Hof · Bibliothek von Alexandria · Das Ich/Inventar
· freier Bildschirm); dann (V18.34) der CRAFTING→INVENTAR-FLUSS vereint: das Rezeptbuch ist der
EINE Weg von der Werkstatt ins Inventar (emergente Rollen-Klassifikation → Auto-Gruppen ohne
Markieren · Trank brauen+trinken in einem Akt · die redundanten Equip-Dropdowns in eine
eingeklappte „Mehr"-Sektion gefaltet, das Falt-System auf das Inventar generalisiert); davor
die VEREDELUNG (V18.33): die GEMESSEN-Wurzel der hässlichen Räume
geheilt (57 `.drawer`-skopierte Charakter-Widgets → `#inventory-overlay`, sie waren ungestylt),
das Ich in Balance (Minecraft 9-Raster + Hotbar links · Charakter mitte · Ausrüstung & Rezepte
rechts · Pergament-Karten überall), der Welt-Tab AUFGELÖST (die Welt = Default-Blick, „Diese
Welt" + „Welt-Aktionen" → Einstellungen). **8 Tabs → 5 Kern-Räume** (Hof · Ich · Werkstatt ·
Bibliothek · Einstellungen; die Welt ist der Default-Blick, kein eigener Tab). Offen: ein
lebendiger 3D-Avatar-Vorschau-Mittelpunkt im Ich (WebGPU-Sub-Renderer, pixel-blind → erst
Schöpfer-Go) · der Schöpfer-Browser-Sign-off des ganzen Flusses (Feel/Schönheit auf echtem
WebGPU) · weitere CSS-Verschlankung (Phase 4d). Der Schöpfer-Auftrag, wörtlich:

> „Das UI hat dringend einen Putz verdient, effizient in Struktur des Codes wie auch das
> UI selbst. Lerne von den Besten, intuitiv, geordnet, simpel, aber trotzdem die volle
> Tiefe, elegant ausgeführt. Einiges scheint getrennt, was zusammengehört — die Werkstatt
> eines der solidesten Subdesigns. Tag/Nacht unnötig (Nacht schöner). Kreaturen und
> Fähigkeiten gehören zusammen, der Dirigent und das Orchester. Dinge, die der Spieler
> gerne sieht, sind versteckt (Hover statt sichtbar); der Bildschirm beim Spielen
> möglichst frei; Inventar/Blueprints nur über viele Klicks, alles verteilt. Was wurde gar
> nicht ins UI genommen, was nur umständlich erreichbar, was nicht geordnet? Lasse Apple
> alt aussehen — die Simplizität der Moderne mit der Schönheit der Antike, wie es dem
> Ultiversum, der Bibliothek von Alexandria der Moderne würdig ist."

---

## 1. Die EINE Vision

**Das UI zieht sich zurück, wenn der Spieler lebt, und erscheint in voller Tiefe +
Schönheit, wenn er fragt.** Es ist geordnet wie eine Bibliothek, klar wie das beste
moderne Werkzeug, warm + lebendig wie ein illuminiertes Manuskript. Drei Sätze:

1. **Beim Spielen gehört der Bildschirm der Welt** — minimaler, eleganter HUD, der
   atmet (Emotion/Nacht tönen ihn), nichts Überflüssiges.
2. **Jede Spieler-relevante Tat ist EINEN intuitiven Schritt entfernt** — sichtbar, nicht
   versteckt; direkt manipuliert, nicht über Chat-Geheimwissen; geordnet nach Intention,
   nicht verstreut.
3. **Was zusammengehört, lebt zusammen** — der Dirigent bei seinem Orchester, das Ich bei
   dem, was ich trage, die Welt bei ihren Schwester-Welten.

---

## 2. Die Design-Philosophie — von den Besten lernen

**„Lasse Apple alt aussehen" heißt nicht Apple kopieren — es heißt Apples Klarheit nehmen
und ihr geben, was Apple fehlt: Seele + Lebendigkeit.** Die vier Quellen:

- **Apple (Human Interface Guidelines):** _Klarheit_ (nichts Überflüssiges, jedes Element
  verdient seinen Platz), _Deferenz_ (das UI dient dem Inhalt, zieht sich zurück), _Tiefe_
  (Schichten + sanfte Bewegung geben Hierarchie — progressive disclosure: Basics sichtbar,
  Details auf Abruf). **Was Apple fehlt: Wärme. Das geben wir.**
- **Moderne Game-UI (Zelda BotW · Genshin · Death Stranding):** beim Spielen ist der HUD
  fast unsichtbar (der Spieler taucht ein); Aktionen sind _kontextuell + diegetisch_
  (radiale Menüs, in-Welt-Prompts), nicht in Menü-Bäumen vergraben.
- **Die Werkstatt (unser eigenes solidestes Subdesign, gemessen — `kampf-plan.md` §11):**
  fünf Prinzipien, die wir auf das GANZE UI heben — **(1) direkte Manipulation statt
  Formulare** (Drag-Drop, 3D-Gizmo) · **(2) sofortiges visuelles Feedback** (Live-Preview,
  live-Readout) · **(3) EIN Fluss statt drei Fenster** (entwerfen → verfeinern → ablesen →
  handeln in einem Raum) · **(4) emergente statt deklarierte Werte** (Rolle/Affordanz/Tags
  berechnet + als Stern-Rating gezeigt, nicht roh) · **(5) gestaffelte Komplexität**
  (Stats-Panel sichtbar, Tooltips erklärbar, volle Tiefe im Code).
- **Die Antike / die Bibliothek von Alexandria:** Schönheit + Wissen + Ordnung als EINS.
  Die vendored Schriften tragen es schon — **Cinzel** (römische Versalien, monumental),
  **IM Fell English** (alte Drucktype, Prosa), **JetBrains Mono** (Zahlen/Code). Pergament
  · Eisen · Messing als Material-Palette. Das UI ist ein illuminiertes Manuskript, das
  lebt.

**Die Synthese (die These dieses Putzes):** Apple ist klar, aber kalt. Spiele sind
immersiv, aber oft chaotisch. Die Antike ist schön, aber statisch. **AnazhRealm vereint
alle drei: die Klarheit der Moderne, die Immersion des Spiels, die Schönheit + Ordnung der
Antike — und darüber die LEBENDIGKEIT des Ultiversums** (das UI tönt mit der Emotion, trägt
die Nacht-Stimmung, atmet mit der Welt). Das ist der wahre Norden des UI.

---

## 3. Die gemessene Bestandsaufnahme (06.06.2026)

**Topologie:** 8 flache Tabs (Welt · Kreaturen · Spieler · Fähigkeiten · Werkstatt ·
Bibliothek · Einstellungen · Hilfe), 4 Toggles (Tag/Nacht · Grok-Stimme · Klang · Kamera),
je ein Seiten-Drawer pro Tab (rechts, 300 px). Permanenter HUD: Topbar + Statusbar (oben),
Stats-HUD + Hotbar (unten), Konsole (links, 420 px). Inventar = verstecktes modales
Overlay.

**Wo die Masse liegt (HTML-Zeilen je Drawer):** Einstellungen **462** · Werkstatt 183 ·
Bibliothek 128 · Kreaturen 101 · Welt 58 · Spieler 56 · Hilfe 42 · **Fähigkeiten 16**.
index.html = 5942 Z., davon **~4467 Z. CSS** (eine eigene Putz-Dimension). anazhRealm.js:
177 UI-Methoden, ~10.800 Z., **322 rohe `document.createElement`, kein DOM-Helfer** (bis
Phase 0).

---

## 4. Die Befunde — nach den vier Schöpfer-Fragen geordnet

### 4.1 Was ist GAR NICHT im UI (nur per Chat/Geheimwissen erreichbar)?

| Funktion                                         | heute                                                                                | Schwere                                          |
| ------------------------------------------------ | ------------------------------------------------------------------------------------ | ------------------------------------------------ |
| **Ausrüsten** (Gerät/Rüstung anlegen)            | NUR Chat `rüste X` — kein Knopf, keine Slots, man sieht nicht mal, was getragen wird | 🔴 blockiert den Kampf-/Crafting-Loop            |
| **FERTIGEN** (`fertigeBlueprint`, V17.66 gebaut) | nur tief im Werkstatt-Editor-Stats-Panel; kein Chat-Befehl `fertige X`               | 🔴 das Kern-Crafting-Feature ist quasi versteckt |
| **Trank trinken**                                | Chat `trink X`, gratis, kein Trank-Slot/Knopf                                        | 🟡 (S6-B Flora-Ökonomie ist eigener Faden)       |
| **Drawer-Hotkeys** (M/K/P/B/I/V)                 | funktionieren, aber kein sichtbarer Hinweis — der Spieler muss sie kennen            | 🟡                                               |

### 4.2 Was ist NUR EXTREM UMSTÄNDLICH erreichbar (obwohl relevant)?

| Funktion               | Weg heute                                                                      | besser                                       |
| ---------------------- | ------------------------------------------------------------------------------ | -------------------------------------------- |
| **Bauplan platzieren** | Inventar (I) → Slot wählen → Hotbar-Slot zuweisen → F/RMB = 4 Schritte         | direkter Inventar→Hand-Fluss                 |
| **Inventar**           | verstecktes Modal-Overlay, überdeckt die Welt; Material-Mengen schwer ablesbar | sichtbarer, geordneter Raum im „Ich"-Bereich |
| **Logbuch sehen**      | Einstellungen → Checkbox → Konsole-Caret = 3 Klicks                            | ein Schalter                                 |
| **Werkstatt-Preview**  | bricht beim Tab-Wechsel ab (man verliert sie, wenn man woanders nachsieht)     | persistenter Werkstatt-Zustand               |

### 4.3 Was ist NICHT GEORDNET?

- **Die Einstellungen mischen Welten:** Spieler-Settings (Speicher · Lautstärke · Begleiter
  · Multi-User) mit **~17 Entwickler-Render-Reglern** (Atmosphäre ×7, Wasser ×8, Schatten
  ×2 — die pixel-blinden V18-Tuning-Slider). Der Spieler scrollt durch Dev-Werkzeug, um
  „Speichern" zu finden.
- **Wichtige Werte sind hover-only:** das volle Stats-Profil lebt im `title`-Tooltip des
  Stats-HUD (Maus drüber statt sichtbar) — genau der Schöpfer-Befund.
- **8 flache Tabs** ohne Bedeutungs-Gruppierung (Welt neben Werkstatt neben Hilfe).

### 4.4 Was ist GETRENNT, das ZUSAMMENGEHÖRT?

- **Kreaturen + Fähigkeiten** (Schöpfer: „der Dirigent + das Orchester") — die Kreaturen
  (wen ich dirigiere) und die Fähigkeiten/Gesetze (womit ich dirigiere) sind zwei Tabs.
- **Das Ich ist verstreut:** Seele · Stats · Ausrüstung · Inventar leben in Spieler-Drawer
    - verstecktem Overlay + Chat — nicht in EINEM „Ich"-Raum.
- **Zwei Tag/Nacht-Dinge** (zu trennen!): das **UI-Theme-Toggle** (Pergament hell/dunkel,
  `#theme-toggle`) — klar entfernbar, Nacht wird der EINE Stil — UND der **3D-Welt-Zyklus**
  (Sonne/Mond, Tag-Länge/Tageszeit in den Einstellungen) — das ist die _lebende Welt_
  („die Welt atmet", Vision-Pfeiler) und bleibt; siehe Klärung §7.

---

## 5. Der Plan — die Akte, geordnet

Vier Phasen, jede ein verifizierter Bogen mit eigenen Commits (Merge-Rhythmus). Phase 1
(Code) ist die Grundlage; 2–4 (UX) stehen darauf. **Heilige-Lektion-sicher:** alles bleibt
im Stamm (der `_el`-Builder ist eine Methode, kein Modul); wir verdichten + ordnen, wir
teilen nicht nach Thema.

### Phase 1 — Das Code-Fundament: der `_el`-Builder durch die ganze Schicht (BEGONNEN)

Die UI emergiert deklarativ aus einer Beschreibung (V9.82 „eine Quelle", Hylomorphismus auf
die View) — die Voraussetzung dafür, dass die UX-Akte (2–4) sauber + kompakt baubar sind.

- **1a ✅ (V18.31+):** `_el(tag, attrs, ...children)` + `_elAppend` + `_kvRow` gebaut;
  `renderPlayerStatsUI` + `_renderCreatureListUI` migriert, **DOM byte-identisch** verifiziert
  (`scripts/diag-ui-snapshot.cjs`).
- **1b:** die Schema-Helfer für die wiederkehrenden Muster — `_wireSlider(def)` (eine
  Slider-_Tabelle_ statt 46 hand-verdrahteter Regler), `_fillSelect(sel, items, opts)` (die
  19 `<option>`-Schleifen), `_pill`/`_chip` (die Werkstatt/Kreatur-Pills), `_section`/`_drawer`
  (die Drawer-Gerüste). Jeder ersetzt eine Klasse von Wiederholung.
- **1c:** die übrigen ~40 row/list/panel-Methoden migrieren (Inventar, Werkstatt-Render-
  Familie, Bibliothek, die Settings-Slider-Init), jede byte-verifiziert.
- **Ehrlich:** die Zeilen-Ersparnis ist moderat (~400–800 Z. über die Schicht, Prettier
  bricht verschachtelte Aufrufe um); der Hauptgewinn ist **Struktur + eine Quelle** — und
  dass die UX-Neuordnung (Phasen 2–4) dann in Stunden statt Tagen baubar ist.

### Phase 2 — Die Ordnung: Bedeutungs-Gruppierung statt 8 flacher Tabs

Die große Neuordnung — die Tabs nach **Intention** gruppieren (Apple: Klarheit + Hierarchie;
die Bibliothek: geordnetes Wissen). Vorschlag (vom Schöpfer zu verfeinern, §7):

- **2a — Kreaturen + Fähigkeiten → EIN Raum „Der Hof" (Dirigent + Orchester).** Links das
  Orchester (die Kreatur-Liste, lebendig, mit Status), rechts/oben die Partitur (die
  Fähigkeiten/Gesten + die stehenden Gesetze/Weltregeln). Eine Geste wählen + auf eine
  Kreatur/die Welt anwenden — direkte Manipulation statt Dropdown-Ketten. Die Aura-
  Rückmeldung (die Kreatur leuchtet) macht den Befehl sichtbar.
- **2b — „Ich" sammelt das Verstreute.** Der Spieler-Raum vereint Seele · Stats (sichtbar,
  nicht hover) · **Ausrüstung** (Equip-Slots: Gerät/Rüstung/Seele, Klick zum Anlegen) ·
  **Inventar** (kein Modal mehr — ein geordneter Teil von „Ich", Material-Mengen sichtbar).
- **2c — Tag/Nacht-Theme weg, Nacht ist der EINE Stil.** `#theme-toggle` entfernen,
  `<body data-theme="nacht">`, die `[data-theme="tag"]`-Tokens in `:root` falten (Nacht-
  Werte) → **das CSS-Theme halbiert sich**, ein Toggle weniger. (Der 3D-Zyklus bleibt —
  §7.)
- **2d — Einstellungen ordnen + staffeln.** Vorne die Spieler-Settings (Speicher ·
  Lautstärke · Begleiter/Avatar · Multi-User · Tastenbelegung). Die ~17 Render-Tuning-Regler
  (Atmosphäre/Wasser/Schatten) in einen **eingeklappten „Render-Feinschliff"-Abschnitt**
  (progressive disclosure — der Justierer findet sie, der Spieler sieht sie nicht). Den
  Logbuch-Schalter zu EINEM Klick machen.
- **Resultat:** ~8 → ~5 Bedeutungs-Bereiche: **Welt** (+ Bibliothek als ihre Schwester-
  Welten-Dimension?) · **Der Hof** (Leben + Befehl) · **Ich** (Seele/Stats/Habe) ·
  **Werkstatt** · **Rat** (Einstellungen + Hilfe). (Genaue Gruppierung = §7.)

### Phase 3 — Die Erreichbarkeit: jede relevante Tat einen Schritt entfernt

- **3a — Ausrüstung ins UI** (🔴 die größte Lücke). Equip-Slots im „Ich"-Raum: das
  gehaltene Gerät · die Rüstung · die Seele, jeweils Klick-zum-Wechseln aus dem Inventar/
  den verfügbaren Bauplänen. Das getragene Gerät + seine abgelesene Affordanz sichtbar
  (das Readout-Pattern). Macht den Kampf-/Crafting-Loop erst spielbar ohne Chat-Geheimwissen.
- **3b — FERTIGEN erreichbar** (🔴). Der Werkstatt-„⚒ FERTIGEN"-Fluss (V17.66) bleibt das
  Herz; zusätzlich ein Chat-/Schnell-Pfad. Der Weg „Material → fertiges Gerät → in der
  Hand" wird EIN sichtbarer Fluss (die Werkstatt-Gebärmutter, `kampf-plan.md` §11.5).
- **3c — Inventar intuitiv** (Material-Mengen sichtbar, Drag auf einen Equip-Slot/die
  Hotbar = direkt; der 4-Schritt-Hotbar-Weg auf 1–2 verkürzt).
- **3d — Stats + Status sichtbar** statt hover-only (das volle Profil im „Ich"-Raum
  permanent; das HUD trägt nur das Lebenswichtige).
- **3e — Hotkey-Hinweise** dezent sichtbar (oder die Topbar-Toggles selbsterklärend).

### Phase 4 — Der freie Bildschirm + die lebendige Schönheit

- **4a — HUD minimieren** (Game-UI-Deferenz): die Statusbar verschlanken (nur das
  Lebenswichtige permanent, der Rest auf Abruf), die Konsole zähmen (kleiner/auto-collapse,
  sie frisst 420 px links), der Drawer schmaler/auto-schließend beim Zurück-ins-Spiel. Der
  Bildschirm gehört der Welt.
- **4b — Das Nacht-Theme zur vollen Schönheit bringen** (jetzt der EINE Stil): Cinzel +
  IM Fell English + die Pergament/Messing-Palette in dunkler Eleganz, sanfte Tiefe
  (Schatten/Glas-Schichten), das illuminierte Manuskript.
- **4c — Das UI atmet mit der Welt** (die Lebendigkeit, die Apple fehlt): die Emotion-Achse
  des Felds (`auraAt.emotion`, schon ein Leser für den Welt-Tint) tönt dezent auch das UI;
  die Tageszeit trägt die HUD-Stimmung. Das UI ist Teil des lebendigen Felds.
- **4d — Das CSS verschlanken** (~4467 Z., die zweite Masse): Token-Konsolidierung,
  Wiederholungen zu Utility-Klassen, das halbierte Theme (4c). Eigener verifizierter Bogen.

---

## 6. Umsetzung + Verifikation (die Disziplin)

- **Merge-Rhythmus:** jede Phase (oft jeder Akt) = ein verifizierter Bogen + Commit. Kein
  großer Stapel (die V18-Wasser-Lehre).
- **Verifikation:** `scripts/diag-ui-snapshot.cjs` (DOM byte-Vergleich vor/nach für jede
  verhaltensneutrale Migration) + Playtest (das CI-Gate, die UI-Source-Proben wandern mit,
  V9.56-i) + **Screenshot lesen** (die UI rastert headless TREU — kein swiftshader-Problem
  wie bei WebGPU-Shadern; ich SEHE das UI, bin hier nicht pixel-blind) + der Schöpfer-
  Browser für das finale Feel/die Schönheit.
- **Heilige Lektion:** der `_el`-Builder + alle UI-Methoden bleiben im Stamm (ein
  Wachstumsring, kein Modul-Split). Wir verdichten + ordnen, wir teilen nicht nach Thema.
- **Behalte die Saat:** kein Feature wird im Putz still entfernt — was verschoben/vereint
  wird, bleibt erreichbar; was der Spieler braucht, wird sichtbarer, nicht weniger.
- **Reihenfolge:** Phase 1 (Code) trägt 2–4. Innerhalb 2–4 zuerst die 🔴-Erreichbarkeits-
  Lücken (Ausrüstung/Fertigen — sie blockieren echtes Spiel), dann die Ordnung, dann die
  Schönheit.

---

## 7. Die Onboarding-Philosophie — von den Riesen lernen, sie in den Schatten stellen

### Die Riesen-Lehre: „das Level IST das Tutorial"

Die genialsten Spiele erklären nie — sie **lehren durch Design**. Eine Anleitung am Anfang
ist das Eingeständnis, dass das Design selbst nicht spricht.

- **Mario 1-1** (Miyamoto): kein Wort — ein Goomba läuft auf dich zu, du lernst springen.
  Das Level ist so gebaut, dass der erste sichere Instinkt der richtige ist.
- **Half-Life / Portal** (Valve): „show, don't tell" — die erste Kammer lehrt durch die
  Umgebung; du siehst ein Portal, gehst durch, verstehst.
- **Zelda BotW** (Great Plateau): ein offenes Tutorial-Gebiet, das durch NEUGIER zieht
  (ein Turm in der Ferne → du kletterst → die Welt öffnet sich). Kein Text-Dump.
- **Outer Wilds**: KEIN Tutorial — du erwachst am Lagerfeuer, die Welt ist da, die Neugier
  ist der Lehrer.
- **Minecraft**: die Notwendigkeit lehrt (die Nacht kommt, du MUSST handeln).

### Das geniale Meta (Tunic · Disco Elysium): die Anleitung IST das Werk

- **Tunic**: das Handbuch ist ein in-Welt-Sammelobjekt (Seiten, teils in erfundener
  Sprache) — die Anleitung ist Teil des Mysteriums, der Entdeckung.
- **Disco Elysium**: die Fähigkeiten SPRECHEN mit dir (Stimmen im Kopf) — das UI ist
  diegetisch + charaktervoll, kein Fremdkörper, der den Blick versperrt.

### AnazhRealms Meta-Vorteil — den KEIN Riese hat

Jeder Riese onboarded eine STATISCHE Welt (der Designer hat das Tutorial handgebaut, einmal,
für alle gleich). AnazhRealm trägt zwei Dinge, die kein anderes Spiel hat:

1. **Eine lebende KI im Werk** (Eins / der Nexus) — sie IST der Guide. Kein Modal nötig: die
   KI sieht, was du tust, und führt organisch + persönlich. Das ist die perfekte Einheit von
   Form + Inhalt — ein Werk ÜBER Mensch+KI-Schöpfung onboardet DURCH die KI.
2. **Eine Welt, die auf dein Wort reagiert** — der erste Moment ist nicht „schau, was der
   Designer baute" (BotW), sondern „schau, was DU gerade mit einem Wort erschaffen hast".

### Info ohne Flutung — die vier Kanäle

Nie alles am Anfang. Just-in-time, diegetisch, gestaffelt:

1. **Der Begleiter (just-in-time):** Eins sagt das Rechte im rechten Moment (du näherst dich
   Wasser → ein dezenter Hinweis; du hältst zum ersten Mal ein Gerät → der Equip-Hinweis).
   Die KI ist der lebende Tooltip — Wissen kommt, wenn es gebraucht wird, von einer Stimme.
2. **Die Welt selbst (diegetisch):** statt einer Stats-Anzeige → die Aura/Emotion-Tönung;
   statt eines Inventar-Fensters → der Avatar trägt sichtbar; statt einer Anleitung → die
   Welt reagiert + lehrt dadurch.
3. **Die Bibliothek als ORT (nicht Cheat-Sheet):** die DSL-Referenz / die Gesten sind kein
   „Hilfe-Tab", sondern ein illuminiertes Grimoire, ein Ort, den man betritt (Alexandria).
4. **Progressive disclosure (Apple):** die Oberfläche zeigt das Häufige, die Tiefe ist einen
   Schritt entfernt (Hover, „mehr", das eingeklappte Render-Tuning).

### Wie wir die Riesen in den Schatten stellen

Die Riesen sind genial im „show don't tell" — aber ihr Onboarding ist **eingefroren**
(handgebaut, einmal, für alle gleich). AnazhRealm geht eine Stufe weiter: **von „show don't
tell" zu „speak and it becomes".** Der erste Moment lädt nicht nur ein zu ENTDECKEN (Outer
Wilds) oder zu folgen (BotW) — er lädt ein zu ERSCHAFFEN, sofort, mit einem Wort, und die
Welt + die KI antworten lebendig + persönlich. Kein Riese kann das, weil keiner eine echte
KI + eine wort-reaktive Welt trägt. **Co-Creation als Onboarding** — das ist der Schatten,
den AnazhRealm wirft.

### Der WOW-Start (GEBAUT) + die Folge-Akte

- **GEBAUT (V18.x):** das 3-Seiten-Anleitungs-Modal (Welt/Spieler/Nexus mit Backdrop, das
  die 3D-Welt verdeckte — auch bei jedem Diagnose-Screenshot) entfiel. Die Welt ist sofort
  da; Eins lädt EINMAL diegetisch ein („Diese Welt ist still — bis du sprichst."); der Chat
  lädt ein („sprich, und die Welt antwortet …").
- **Folge-Akte:** (a) der **just-in-time-Begleiter** (kontextuelle Hinweise an realen
  Momenten — Wasser/Equip/Werkstatt, statt Vorab-Anleitung); (b) der **erste-Geste-Funke**
  (die erste Welt-Reaktion gefeiert — der WOW verstärkt, nicht stumm); (c) die **Bibliothek
  als betretbarer Wissens-Ort**; (d) die **diegetische Habe** (der Avatar trägt sichtbar,
  was du hast — statt eines versteckten Inventar-Fensters).

---

## 8. Die Kern-Räume — die neue Architektur (Schöpfer-Vision 07.06.2026)

Der Schöpfer hat die Richtung kristallisiert: von **8 verstreuten Tabs zu 5 prägnanten
Kern-Räumen**, jeder mit klarer Identität, nach Intention geordnet. Plus drei Quer-Themen
(Emotion-Klarheit · der freie Bildschirm · die sofort-Gewinne).

### Die fünf Kern-Räume

- **🏛 1. BIBLIOTHEK — das Alexandria-Portal** (entdecken · teilen · reisen). Der KERN, groß
  wie die Werkstatt, wie ein Browser / eine Social-Plattform: \*\*trendende/öffentliche Welten
    - Rezepte** (man sieht, was angesagt ist, joint mit einem Klick), daneben die **eigenen
      privaten** Welten + Rezepte. Erbt die 4 bestehenden Sektionen (KI-Übersetzer · Vendor-
      Andocken · Mesh-Katalog · Welten-Liste) UND vom Welt-Menü: **Andere Welten · Stammbaum ·
      Tagebuch\*\*.
- **⚒ 2. WERKSTATT** — die Schöpfungs-Gebärmutter (erschaffen). Bleibt das Vorbild-Design.
- **🐾 3. DER HOF — Dirigent + Orchester** (Kreaturen + Fähigkeiten vereint). Das Orchester
  (die Kreaturen) + die Partitur (Gesten/Gesetze), in einem Raum.
- **🎒 4. ICH — das Minecraft-artige Inventar** (wer ich bin + was ich trage). Das Spieler-
  Menü wird ins Inventar gefaltet: die Item-/Material-/Blueprint-Slots, die **Ausrüstung als
  Equip-Slots daneben** (die Charakter-Ansicht), die Seele, die Stats, die **Emotionen mit
  Legende**. (Soul-Editor → Werkstatt; Hotbar-Belegung hier/kontextuell.)
- **⚙ 5. HAUPTMENÜ — System + Welt-Verwaltung** (das Meta). Einstellungen + der
  Verwaltungs-Teil des Welt-Menüs (Diese-Welt-Info · Speichern/Laden · Welt-Beziehung) +
  **Vibe-Pass** + **Hilfe (einklappbar, alle Befehle — die DSL-Liste ist aktuell, kommt aus
  `chatDslPatterns`)** + ganz unten **„Erweiterte Einstellungen"** (eingeklappt: Logbuch ·
  Tuning · Atmosphäre/Render · Tastenbelegung).

→ **8 Tabs → 5.** Welt-Menü aufgelöst (social → Bibliothek, Verwaltung → Hauptmenü), Hilfe-
Tab → Hauptmenü-Sektion, Spieler-Tab → Inventar, Kreaturen+Fähigkeiten → Hof.

### Die drei Quer-Themen

- **A — Emotion-Klarheit (das Aura-Problem, GEMESSEN):** die Aura zeigt die 10 **Substanz-
  Tags** (Hue lebendig/dichte/…), die Emotion-Balken die 6 **Emotionen** (joy/awe/…) — zwei
  nicht-gemappte Systeme, keine Legende, Aura unsichtbar in First-Person. Lösung: (1) die
  dominante **Emotion** wird FP-sichtbar (ein sanfter Bildschirmrand-Schimmer in der
  Emotion-Farbe + ein kleines Glyph/Label „Freude") — man fühlt die Stimmung, ohne in
  3rd-Person zu wechseln; (2) eine **Legende** (die 6 Emotionen mit Name + Farbe + einer
  Zeile Bedeutung) im Ich-Raum; (3) die Substanz-Aura (Tag-Hue) bleibt der Avatar-Schimmer,
  aber benannt als das, was sie ist (Material-Aura), getrennt von der Emotion.
- **B — Der freie Bildschirm:** Chat (Konsole), Topbar-Titel + Welteninfo (Statusbar)
  belegen den Spiel-Bildschirm permanent. → der Chat auto-schmal/einklappbar (expandiert bei
  Fokus), der Titel dezent, die Welteninfo auf Abruf. Der Bildschirm gehört der Welt.
- **C — Die sofort-Gewinne (laufend):** die fortgeschrittenen Settings (Tastenbelegung ·
  Logbuch · Tuning · Atmosphäre) default eingeklappt (GEBAUT V18.x); die Dev-Sektionen
  gebündelt ans Ende („Erweiterte Einstellungen"); die Hilfe in die Einstellungen.

### Die Reihenfolge (Merge-Rhythmus — jeder Raum ein verifizierter Bogen)

1. **Einstellungen → Hauptmenü** (Dev gestaffelt + gebündelt, Hilfe rein, Vibe-Pass +
   Welt-Verwaltung — die sofort-Gewinne + erste Tab-Reduktion).
2. **Ich / Inventar** (Spieler-Menü ins Inventar, Equip-Slots, Emotion-Legende —
   trägt auch die 🔴-Erreichbarkeit Ausrüstung/Fertigen).
3. **Der Hof** (Kreaturen + Fähigkeiten).
4. **Bibliothek-Social** (trending/public, Welt-Menü-Migration).
5. **Emotion-FP-Feedback** (der Bildschirmrand-Schimmer + Glyph).
6. **Der freie Bildschirm** (HUD zähmen).

### Verbleibende Klärung

- **Der 3D-Tag-Nacht-ZYKLUS** (Sonne/Mond — nicht das UI-Theme, das ist weg): auf Nacht-
  Stimmung biasen, oder der volle atmende Zyklus? Berührt „die Welt atmet". Default: Zyklus
  bleibt, evtl. Nacht-Default-Tageszeit.

---

_Dieser Plan ist der aktive UI-Bogen. Der Code-Builder (Phase 1) läuft; die UX-Phasen
warten auf den Schöpfer-Sign-off der Richtung (§8), dann Akt für Akt, verifiziert,
gemergt._

---

# DER ZWEITE BOGEN — Omnibox + Tags + die durchdachten Räume (Plan, 07.06.2026)

> Schöpfer-Auftrag (07.06.2026): „Die ultimative Lösung: Omnibox + Tags. Hotkey öffnet
> die Alles-Suche, du tippst `w:eisen` (Waffe + Eisen), das System filtert WÄHREND des
> Tippens, 0.2 s zum exakten Ergebnis. Die Werkstatt aktuell am besten — doch man muss
> scrollen, der Bauplan-Bereich genialer (weniger Platz, schneller, auch bei HUNDERTEN
> Blueprints), die Ausgabe-Tabelle ist erst nach Scrollen sichtbar, nutzt die Breite +
> Höhe nicht effizient; das Fenster ragt übers Hauptbild (zu groß). Den anderen Menüs
> fehlt die Gruppierung — durchdenke die Systeme: wie interagiert man, was klickt/sucht
> man, was gehört zusammen, nutzt es den Platz, ist der Fluss natürlich, was klickt man
> davor/danach, wie ist das Erlebnis. Gehe präzise einen Gamezyklus durch. Vergleiche mit
> wie sich Tools geändert, was bewährt, was gefeiert wird. Höchst detailiert, am Schluss
> den Plan selbst prüfen — mit allen Learnings + der Vision."

**Stand: PLAN (ungebaut). GEMESSEN: alle 6 Räume per `diag-room.cjs` screenshottet (+
`PAGE`-Modus = volles Viewport über der Welt) + GELESEN.** Was bis V18.36 GEBAUT ist:
de-dup (Welt-Aktionen) · drei durchsuchbare Listen (Befehle/Rezepte/Baupläne) · eine
Fenster-Sprache (Hof+Einstellungen vollbreit mehrspaltig). Dieser Bogen ist die Tiefe
darunter.

## Z1. Der Gamezyklus, präzise — wo die Reibung WIRKLICH sitzt

Ein Durchlauf, in dem man alles einmal braucht. Pro Schritt: was man tut, was man
klickt/sucht, die Reibung (gemessen aus den Screenshots + dem Code).

1. **Ankommen.** Welt lädt, Eins (Begleiter) lädt diegetisch ein. ✓ (WOW-Start sitzt.)
   Reibung: der Chat/die Konsole klebt links im Bild — der erste Eindruck ist „App", nicht
   „Welt".
2. **Orientieren / bewegen.** WASD + Maus. ✓ HUD dezent (H blendet aus). Reibung: keine.
3. **Abbauen / sammeln.** LMB auf Architektur → Material ins Inventar. Reibung: man weiß
   nicht, was man schon hat, ohne das Ich-Overlay zu öffnen (Modal, unterbricht).
4. **Werkstatt öffnen** (Tab/Hotkey). Man will EIN Gerät bauen. Reibung (die Hauptlast,
   §Z4): die Bauplan-Liste oben, das 3D-Preview riesig in der Mitte, die **Ausgabe-Tabelle
   erst NACH Scrollen** — man sieht Werte + den FERTIGEN-Knopf nicht, während man die Form
   formt. Das ist ein vertikaler Stapel, wo ein 3-Spalten-Werktisch hingehört.
5. **Bauplan finden.** Bei 6 Bauplänen ok (jetzt 2-spaltig + Suche). Bei HUNDERTEN: die
   Liste skaliert nicht (kein Tag-Filter „nur Waffen aus Eisen", kein Kategorie-Sprung).
6. **Formen + Prozess.** Drag-Form aus der Palette, Drop-Prozess auf Part/Baugruppe. ✓
   Schöpfer: „farblich, vom Fluss mit Drop relativ stark." Das ist das Vorbild — behalten.
7. **FERTIGEN** → ins Inventar. Reibung: der Sprung Werkstatt→Inventar ist ein Tab-Wechsel
    - ein Modal; kein durchgehender Fluss „gemacht → da".
8. **Ausrüsten / nutzen** (Ich-Overlay). Reibung (§Z5): drei Spalten, aber **unbalancierte
   Höhen + dunkle Leeren** — rechts die lange Rezept-Spalte, links/mitte kurz. Nicht „auf
   Niveau".
9. **Kreaturen dirigieren** (Hof). Reibung (§Z5): die Kreatur-Liste ist NUR Anzeige
   (read-only Task-Label, `_renderCreatureListUI`), die Befehle leben in einer SEPARATEN
   Knopf-Reihe (Aufträge/Sammeln) — die GEMESSEN ein Duplikat der durchsuchbaren Befehle
   ist. Das „richtige Format" wäre INLINE am Wesen (wähle Kreatur → befiehl ihr), nicht ein
   globaler Knopf-Block + ein Duplikat in der Befehle-Liste + Chat.
10. **Welt-Regel setzen** (Hof → Gesetze). ✓ vorhanden. Reibung: zwischen Spawn-Knöpfen +
    Befehlen vergraben.
11. **Welt teilen / besuchen** (Bibliothek). Reibung: Karten in unausgewogenen Spalten;
    Welt-Suche ist ein Textfeld, kein Tag-Filter (`welt:terrain trust:hoch`).
12. **Einstellungen** (Modus/Steuerung/Render/Audio/Pass). ✓ jetzt mehrspaltig. Reibung:
    Gruppierung ad-hoc, kein roter Faden „erst Modus, dann Welt, dann Steuerung".

**Die EINE wiederkehrende Reibung über ALLE Schritte:** um irgendETWAS zu TUN (Befehl,
Bauplan, Rezept, Kreatur-Auftrag, Welt-Sprung, Einstellung) klickt man sich durch Tabs +
Sektionen ODER tippt frei in einen immer-sichtbaren Chat. Es gibt keinen EINEN, schnellen,
beschwörbaren Ort für Absicht. **Das ist exakt, was die Omnibox löst.**

## Z2. Wie sich Tools verändert haben — was bewährt, was gefeiert (die Riesen)

Die Evolution der Werkzeug-Bedienung, präzise:

- **1990er–2000er:** Menüleiste + Toolbar + modale Dialoge. Tiefe Verschachtelung; man
  MUSS wissen, wo etwas liegt. (Unser jetziger Zustand ähnelt dem: Tabs + Sektionen.)
- **2010er:** Ribbon (Office), kontextuelle Paletten, „Suche im Menü". Erste Linderung.
- **Die Befehlspaletten-Revolution (~2013+):** Sublime Text `Cmd+Shift+P` → VSCode →
  ÜBERALL. Eine Liste aller Befehle, fuzzy-durchsuchbar, tastatur-getrieben. **Das meist-
  kopierte UI-Muster der Dekade.**
- **Launcher:** Spotlight (2009), Alfred, **Raycast** (gefeiert ~2021+) — eine Box öffnet
  alles: Suche + Aktion + Erweiterungen.
- **Die Omnibox (Chrome 2008):** EINE Leiste = suchen + navigieren + handeln. Heute Standard
  in jedem Browser. Der Punkt: der Nutzer unterscheidet nicht „Suche" von „Adresse" von
  „Befehl" — er tippt seine ABSICHT, das System erkennt sie.
- **Token-/Tag-Suche (bewährt für Tempo + Macht):** Gmail (`from:`, `has:attachment`),
  GitHub (`is:open label:bug`), **Linear** (Filter-Tokens), Slack (`in:`, `from:`). Kurze
  Präfixe → exakte Treffer ohne Maus. GENAU der Schöpfer-`w:eisen`-Wunsch.
- **Keyboard-first, gefeiert:** **Linear** (das Gold-Standard-`Cmd+K`-überall, „die schönste
  produktive App"), **Superhuman** (E-Mail per Tastatur), **Notion** (`/` Slash-Befehle).
  Der Trend: weniger persistentes Chrome, mehr beschwörbare Absicht.
- **Spiele:** **Minecraft** Rezeptbuch (Suche + Auto-Füllen, Kategorien-Tabs); **Zelda BotW
  / Genshin** (minimales HUD, die WELT ist der Star, Radial-Schnellwahl); **Dwarf Fortress**
  (Steam-Version fügte SUCHE in die Listen ein → gefeiert); **Die Sims** Build/Buy (Katalog
  mit Suche + Kategorie-Icons). Pro-3D: **Blender / Figma / CAD** — der **3-Spalten-Werktisch**
  (Outliner/Liste LINKS · Viewport MITTE · Eigenschaften/Ausgabe RECHTS), alles gleichzeitig
  im Blick, kein Scrollen zwischen „formen" und „Werte sehen".

**Das destillierte Prinzip (was ALLE Gefeierten teilen):** (a) EIN beschwörbarer Ort für
Absicht (Palette/Omnibox), (b) SUCHE schlägt Navigation, (c) Tastatur schlägt Maus für
Tempo, (d) Token/Tags für Präzision, (e) progressive disclosure (Tiefe erst auf Abruf), (f)
das Werk/die Welt ist der Star, Chrome tritt zurück, (g) Pro-Werkzeuge: alles-im-Blick statt
scrollen (3-Spalten).

## Z3. Die Lösung — die Omnibox + Tags (der Schlüsselstein)

**EINE beschwörbare Leiste, die JEDE Absicht aufnimmt.** Sie verdichtet, was heute auf
Chat + Befehle-Liste + drei Such-Felder + Tab-Navigation verteilt ist (die Heilige Lektion:
EINE Quelle, nicht fünf Pfade).

**Beschwören:** `Ctrl/Cmd+K` (Standard) · zusätzlich ein dezenter HUD-Knopf (🔍/„sprich")
für Maus-Spieler · `/` wie Notion. **`Esc`** schließt. Zentriert (Spotlight-Form), nicht
links-angeklebt → **der Bildschirm ist frei**, der Chat ist nicht mehr Dauer-Möbel.

**Die Tag-Grammatik (`praefix:wert`, filtert WÄHREND des Tippens, Ziel <0.2 s):**

| Präfix      | Domäne             | Beispiel                | Wirkung                                   |
| ----------- | ------------------ | ----------------------- | ----------------------------------------- |
| `b:`        | Bauplan            | `b:tempel`              | Bauplan finden → Werkstatt/Hand           |
| `w:` `r:` … | Bauplan nach ROLLE | `w:eisen` (Waffe+Eisen) | rollen-gefilterte Baupläne (Schöpfer-Bsp) |
| `rez:`      | Rezept             | `rez:trank`             | Rezeptbuch → fertigen/nutzen              |
| `c:`        | Befehl (DSL)       | `c:wetter`              | Welt-Befehl ausführen                     |
| `k:`        | Kreatur            | `k:folge` / `k:<name>`  | Kreatur-Auftrag (siehe Z5 inline)         |
| `welt:`     | Bibliothek         | `welt:terrain`          | Welt entdecken/betreten                   |
| `geh:`      | Navigation/Raum    | `geh:werkstatt`         | Raum öffnen (statt Tab-Suche)             |
| (kein Tag)  | Freitext → Nexus   | `mach es nacht`         | spricht zur KI (der diegetische Kern)     |

Die Rollen-Präfixe (`w:`=Waffe, `s:`=Schutz/Rüstung, `t:`=Trank, `a:`=Avatar, `g:`=Gerät,
`p:`=Portal) leiten sich aus den BESTEHENDEN Rollen-Signaturen ab (`FORM_ROLE_SIGNATURES`,
`computeBlueprintRole`) — KEINE neue Taxonomie, die Omnibox liest die Resonanz-Rolle, die
schon emergiert (Konsum-Disziplin: ein echter Leser des bestehenden Vektors).

**Fluss (tastatur-getrieben):** Box öffnen → tippen → Treffer-Liste filtert live, beste
zuerst → `↑↓` wählt → `Enter` führt aus → schließt. Leerer Zustand: zuletzt/oft Benutztes +
ein Hinweis auf die Tags. Freitext ohne Präfix + kein Befehls-Treffer → an den Nexus (Chat).

**Ranking:** exakter Präfix-Treffer > Präfix+Teilstring > fuzzy über Label > Freitext-Nexus.
Domänen-Reihenfolge bei tag-losem Query: Befehl → Bauplan → Rezept → Raum → Welt.

**Der Chat wird beschwörbar (Screen-Freiheit, Minecraft-Modell):** die Konsole ist nicht
mehr Dauer-Panel. Neue Nachrichten (Nexus-Antworten) erscheinen als **kurz einblendender,
verblassender Feed** (unten, BotW/Minecraft); die volle Historie + Eingabe lebt in der
Omnibox (Freitext-Modus) bzw. einem beschwörbaren Log. **Bedacht:** der Nexus-Chat ist das
Herz (V7.66) — die Omnibox wird ADDITIV gebaut (sie ruft `processChatCommand` +
`chatDslPatterns`, beide unangetastet); erst wenn sie trägt, wird die Konsole vom Dauer-
Panel zum beschwörbaren Log (Tests wandern mit dem Code, V9.56-i).

## Z4. Die Werkstatt — von „am besten" zu „genial" (SPIELERSICHT: maximierter Viewport + dünnes Chrome)

**Schöpfer-Korrektur (07.06., die wichtige):** „den Viewer nur ein BISSCHEN [reduzieren] — die
Haupt-Ersparnis muss in der Bauplan-Suche OBEN sein; man ist 90 % der Zeit im Viewer am
Konstruieren; du hast dir keine Gedanken zur SPIELERSICHT gemacht." → mein erster Reflex
(Viewer schrumpfen, Ausgabe nach rechts) war mechanisch, nicht spieler-zentriert. **Verworfen.**

**Die Spielersicht (die Grundlage des Designs):**

- **~5 % — einen Bauplan wählen** (kurz, am Anfang). → braucht MINIMALEN Platz.
- **~90 % — im Viewer konstruieren** (Formen ziehen, Prozesse droppen, orbiten). → der Viewer
  ist das ZUHAUSE, er bleibt GROSS, der dominante Pane.
- **laufender Blick — die Ausgabe lesen + FERTIGEN.** → glanceable UNTEN (Schöpfer: „die
  Ausgabe-Tabelle scheint unten am meisten Platz, am übersichtlichsten"), nicht in eine
  schmale rechte Spalte gequetscht.

**Die brilliante Form = maximierter Viewport + dünnes funktionales Chrome (Pro-3D-Tool):**

```
┌─ WERKSTATT ──────────────────────────────────────────────── × ┐
│ [⌕ Bauplan wählen/suchen]      (Top: Undo Redo Klon Neu Löschen) │  ← DÜNN (5%); Liste = Dropdown
├───┬───────────────────────────────────────────────────┬───────┤
│ F │                                                     │ F     │
│ o │              3D-VIEWER  (das ZUHAUSE, GROSS)         │ a     │  ← Form-Palette links,
│ r │              + Modus-Bar · Drop-Prozess-Fluss        │ r     │     Farben rechts (flankieren,
│ m │              (der starke Fluss — behalten)           │ b     │     keine vertikale Höhe)
├───┴───────────────────────────────────────────────────┴───────┤
│ ROLLE · FÄHIGKEIT │ RESONANZ · BAU-KOSTEN   (2-spaltig, breit)  │  ← AUSGABE unten, glanceable
│ TAGS … · QUALITÄT │            ⚒ FERTIGEN (voll)                │
└────────────────────────────────────────────────────────────────┘
```

- **Oben (dünn, die Haupt-Ersparnis):** die Bauplan-Wahl ist ein dünner Such-Balken; die
  Liste klappt als **Dropdown** nur bei Fokus/Tippen auf (`b:`/`w:eisen`, omnibox-Seed) →
  NULL Dauer-Fußabdruck, skaliert auf HUNDERTE (nur Treffer). Der gewonnene Platz (~110 px)
  geht an Viewer + Ausgabe — NICHT vom Viewer genommen.
- **Mitte (GROSS, das Zuhause):** der Viewer, `height: clamp(300px, 46vh, 520px)` — der
  dominante Pane (90 % der Zeit). Form-Palette links, Farben rechts flankieren (keine Höhe).
  Der Drop-Prozess-Fluss + die Farbe bleiben (Schöpfer-gelobt).
- **Unten (glanceable, 2-spaltig, breit):** die Ausgabe nutzt die volle Breite (CSS-Multi-
  Column 2-spaltig → halb so hoch), **FERTIGEN spannt voll** als prominenter Abschluss. Im
  Bild ohne Scrollen, weil das OBEN schrumpfte.
- **Fenster-Größe:** Padding straffen, bündige Ränder (Schöpfer-Befund linker Rand), ein
  Hauch Welt am Rand = „in der Welt".
- Umsetzung (Container verschieben, nicht neu bauen — V18.32): `#workshop-list` →
  `position:absolute`-Dropdown (`.workshop-picker.open`); Canvas-Höhe-Clamp (Renderer folgt
  via `_workshopSyncCanvasSize`); `#workshop-stats-panel` → `column-count:2` +
  `.workshop-fertigen-row{column-span:all}`. Die Render-Methoden unverändert.

## Z5. Die anderen Räume — durchdacht (Gruppierung · Fluss · Format)

Pro Raum die Schöpfer-Fragen (interagieren/klicken/suchen · zusammengehörig · Platz · Fluss
· davor/danach · Erlebnis), dann die Form.

**DER HOF — Dirigent + Orchester.** Heute: read-only Kreatur-Liste + separate Aufträge-/
Sammeln-Knopf-Reihen (Duplikat der Befehle) + Spawnen + Gesetze + die Befehle-Liste.

- _Was klickt man?_ Eine Kreatur, dann ein Auftrag. _Was gehört zusammen?_ Die Kreatur +
  IHRE Befehle. → **Format: INLINE.** Jede Zeile der Kreatur-Liste bekommt ihre Aktionen
  (folge · komm · warte · sammle…) direkt am Wesen (wähle → befiehl). Das löst das Duplikat
  (die globale Aufträge-Reihe entfällt) UND ist der natürliche Fluss.
- Gruppierung: **Wesen** (Liste + inline Befehle + Spawn) · **Gesetze** (Welt-Regeln) ·
  die freien Welt-Befehle wandern in die **Omnibox** (`c:`/`k:`). Der Hof wird der Ort, wo
  man Leben dirigiert — nicht eine Knopf-Halde.

**DAS ICH — Minecraft-Charakterbogen.** Heute: 3 Spalten, unbalancierte Höhen, dunkle Leeren.

- Gruppierung ist richtig (Habe · Charakter · Ausrüstung+Rezepte), die BALANCE nicht.
- Fix: die Spalten-Höhen angleichen (die kurze Charakter-Spalte füllt mit dem geplanten
  **lebendigen 3D-Avatar-Mittelpunkt** — der WebGPU-Sub-Renderer, der eh offen ist; er ist
  der natürliche Mittelpunkt „wer bin ich"); die Rezept-Spalte deckelt die Höhe + scrollt
  intern (Suche trägt den Überblick). Keine dunklen Leeren mehr.
- _Davor/danach:_ man kommt aus der Werkstatt (fertigen) → Ich (anlegen/tragen) → zurück in
  die Welt (nutzen). Der FERTIGEN→Rezeptbuch→tragen-Fluss (V18.34) ist die Naht — sie soll
  EIN Bogen sein, kein Tab-Hüpfen (perspektivisch: fertigen kann direkt anlegen anbieten).

**DIE BIBLIOTHEK — der Welt-Browser.** Heute: Karten in unausgewogenen Spalten, Text-Suche.

- Gruppierung: **Entdecken** (Welt-Karten, ein balanciertes Masonry-Raster) · **Schöpfen/
  Teilen** · **Provenienz** (Stammbaum/Tagebuch, erst bei Auswahl). Die Welt-Suche wird
  Tag-fähig (`welt:terrain trust:hoch`) über die Omnibox. Man BETRITT Welten (Karten mit
  Vorschau), scrollt nicht Text.

**DIE EINSTELLUNGEN — ein roter Faden.** Heute: mehrspaltig (gut), Gruppierung ad-hoc.

- Ordnen nach Häufigkeit/Logik: **Spielmodus → Welt(-Beziehung/Diese Welt) → Steuerung
  (Keybinds) → Darstellung (Render/Dev, eingeklappt) → Audio → Identität (Vibe-Pass/Version)**.
  Jede Gruppe eine Pergament-Karte (schon der Fall). Selten-Genutztes (Dev-Render) bleibt
  eingeklappt (progressive disclosure).

**Die EINE Fenster-Sprache (über alle):** vollbreit, mehrspaltig, eingemittet, Pergament-
Karten, ein Suchfeld auf jeder Liste, bündige Ränder, ein Hauch Welt am Rand. Was in einem
Raum gilt, gilt in allen (V18.36-Lehre: uniform oder gar nicht).

## Z6. Reihenfolge + Verifikation

1. **Omnibox-Kern** (Schlüsselstein, additiv): die Leiste + Tag-Parser + Ranking, ruft
   `processChatCommand`/`chatDslPatterns`/`computeBlueprintRole`. Verifizierbar headless
   (Tag→Treffer→Ausführung als Invarianten). Tilgt die Duplikate strukturell.
2. **Werkstatt 3-Spalten-Grid** (unabhängig, hoher Wert): Container-Umzug ins Grid, Ausgabe
   rechts immer sichtbar. Verifizierbar (Layout rastert treu) + Schöpfer-Auge fürs Feel.
3. **Hof inline** (Kreatur-Befehle ans Wesen) — tilgt das letzte Befehls-Duplikat.
4. **Ich-Balance** (Spalten-Höhen + Avatar-Mittelpunkt, WebGPU → Schöpfer-Go).
5. **Bibliothek-Masonry + Einstellungen-Faden** (Feinschliff).
6. **Chat → beschwörbar** (zuletzt, wenn die Omnibox trägt — das Herz behutsam).

Jeder Schritt: Playtest-Gate + `diag-room.cjs` (+ `PAGE`) gelesen + ein Merge pro
bestätigtem Bogen (pixel-blinde Shader → Schöpfer-Browser).

## Z7. Selbst-Prüfung des Plans — gegen die Learnings + die Vision

- **Heilige Lektion (Komplexität ohne Fundament):** Die Omnibox SENKT Komplexität — sie
  verdichtet fünf Eingabe-Pfade (Chat · Befehle-Liste · 3 Such-Felder · Tab-Navigation) zu
  EINEM. Kein Parallel-System (V9.82). ✓ Risiko: sie darf kein SECHSTER Pfad NEBEN den
  alten werden → die alten Pfade müssen weichen, sobald sie trägt (sonst Duplikat-Sünde).
- **Verdichte zu EINER Quelle (V9.82, 6×):** die Omnibox IST das. ✓
- **Verifiziere KONSUM, nicht Existenz (V17.31):** jeder Tag liest einen BESTEHENDEN Vektor
  (`computeBlueprintRole`/`chatDslPatterns`) → kein Passagier; jede Omnibox-Aktion braucht
  eine Invariante „Tag X → führt Befehl/Treffer Y aus". ✓
- **Headless-grün ≠ vision-aligned (V17.59):** die Omnibox-LOGIK ist headless beweisbar; das
  FEEL (Tempo, Eleganz, der freie Bildschirm) braucht den Schöpfer-Browser. Markiert. ✓
- **Test wandert mit dem Code (V9.56-i):** Konsole→beschwörbar + Hof-Inline migrieren Tests
  (`#console`-im-DOM, `quickButtonRoutesToChat`, die Aufträge-Reihe). Eingeplant. ✓
- **Container verschieben, nicht neu bauen (V18.32):** der Werkstatt-Grid-Umzug + die ID-
  Erhaltung (`grep -c id=`). ✓
- **Eine Lehre gilt UNIFORM (V18.36):** die Fenster-Sprache + das Suchfeld in JEDEN Raum;
  die Omnibox bedient ALLE Domänen, nicht nur Befehle. ✓
- **Mutig + bedacht (Verifikation, nicht Kleinheit):** der Chat (das Herz) wird ADDITIV
  umgebaut, mit der Omnibox als Sicherung, erst dann das Dauer-Panel ablösen. Nicht klein —
  aber durch die additive Naht + Tests verifiziert. ✓
- **Die Vision (`das-lebendige-feld.md`): die Welt als EIN Feld, das alle lesen·schreiben·
  WERTEN; die KI als Co-Schöpferin.** Die Omnibox ist DIEGETISCH: Freitext spricht zum Nexus
  (lesen/schreiben/werten der Welt durch Sprache), die Tags sind die präzise Geste daneben.
  Der freie Bildschirm = „die Welt ist der Star" (BotW). Die Omnibox ist nicht „App-Chrome",
  sie ist die STIMME, mit der Mensch + KI die Welt formen. ✓ Tiefen-Kohärenz mit dem wahren
  Norden.
- **Restrisiko (ehrlich):** (a) `column-count`-Fragilität bei sehr hohen Sektionen (Fallback
  testen); (b) der Chat-Umbau ist der riskanteste Akt (das Herz) — darum zuletzt + additiv;
  (c) Tag-Präfix-Kollisionen (`w:` Waffe vs. Wort) → Präfix nur am Token-Anfang + Freitext-
  Fallback. Alle drei sind benannt + haben einen Pfad.

**Fazit der Selbst-Prüfung:** der Plan verdichtet (senkt Komplexität), liest bestehende
Vektoren (kein Passagier), gilt uniform, ist diegetisch (vision-treu), und staffelt das
Riskante (das Herz) ans Ende mit additiver Sicherung. Er ist baubar Akt für Akt, jeder
verifiziert. Der Schlüsselstein ist die Omnibox; die Werkstatt-Werkbank ist der größte
sofort-sichtbare Sprung.

---

# DER WERKSTATT-ABSCHLUSS + DIE DENKMUSTER FÜR ALLE MENÜS (Plan, 07.06.2026)

> Schöpfer: „erstelle einen umfassenden Plan, um das Werkstatt-Fenster abzuschliessen; danach
> reflektierst du jede Änderung — wieso wir gegangen — und wendest es auf die anderen Menüs an,
> damit du einen perfekten Plan hast und nachhaltig aus diesem Prozess lernst: WIE du soetwas
> angehst, welche DENKMUSTER. Die Werkstatt soll uns die Wege für ALLE Menüs zeigen."

**Stand (ehrlich, ~70%):** GEBAUT = dünner Such-Dropdown · grosser Viewer · FORMEN 3×3 · Pille
unten-links · FERTIGEN kompakt · Klon-Sprung gedeckelt · Chips-Container (resoniert). UNVERIFIZIERT
/ OFFEN = der Rahmen (in V18.39 ÜBER-BEHAUPTET — meine Überlauf-Diagnose war ein Diag-Fehler, der
den geschlossenen Drawer mass) · die Mode-Bar (nur getrimmt, nicht neu gedacht) · die Farben-Zone ·
die Ausgabe-Ordnung · resoniert (nicht mit dem Auge geprüft).

## A. Der Abschluss — die funktionale Zonen-Ordnung (mit dem WARUM je Schritt)

**Das EINE Prinzip, das die Werkstatt lehrt: funktionale Zonen nach dem mentalen Modell des
Nutzers.** Ein Bauer stellt vier Fragen → vier Zonen:

- „Was füge ich hinzu / wie sieht es aus?" → **LINKS** (Formen + Farben).
- „Ich forme es." → **MITTE** (Viewer + Manipulations-Werkzeuge).
- „Woraus + womit + welcher Akt?" → **RECHTS** (Materialien + Werkzeuge + Mach/Verwalt-Aktionen).
- „Was IST es?" → **UNTEN** (reine Ausgabe).

| Schritt | Änderung                                                                                                                                                                                     | WARUM (das Denkmuster)                                                                                                                                               |
| ------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **A-1** | Farben → links (unter „Part entfernen")                                                                                                                                                      | Formen + Farben sind beide „was ich hinzufüge / wie es aussieht" → sie gehören ins selbe mentale Bündel. **ZONE NACH MENTALEM MODELL.**                              |
| **A-2** | Aktionen (Neu/Klonen/Löschen + FERTIGEN) → EINE Aktions-Zone (rechts, im von den Farben freigegebenen Platz, bei Material/Werkzeug = „womit ich mache"); aus Mode-Bar + Ausgabe herausgelöst | Werkzeug (manipulieren) ≠ Aktion (machen/verwalten) ≠ Ausgabe (lesen) — drei Funktionen, drei Orte. **EINE ZONE, EINE AUFGABE.**                                     |
| **A-3** | Ausgabe-Tabelle → NUR Ausgabe (FERTIGEN raus) → kürzer, einheitlicher, spart Höhe                                                                                                            | Ein Readout liest, es handelt nicht. **EINE ZONE, EINE AUFGABE.**                                                                                                    |
| **A-4** | Mode-Bar → NUR Werkzeuge (Move/Rotate/Scale/Connect/Snap/Zentrieren; Datei-Aktionen wandern raus)                                                                                            | Die Misch-Leiste war „nicht synergetisch, Luft-Spalte". Eine reine Werkzeug-Leiste hat EINEN Rhythmus. **GRUPPIEREN NACH FUNKTION + VISUELLER RHYTHMUS (Chunking).** |
| **A-5** | Ausgabe-Reihenfolge nach den Nutzer-Fragen: IDENTITÄT (Rolle·Fähigkeit) → GÜTE (Qualität·Tags) → PREIS (Bau-Kosten) → WACHSTUM (Resonanz·Hinweis, sekundär)                                  | Ein Nutzer fragt in dieser Reihenfolge; Fortgeschrittenes zuletzt. **ORDNE NACH DER NUTZER-FRAGE / ENTSCHEIDUNGS-RELEVANZ (nicht Code-Reihenfolge).**                |
| **A-6** | Rahmen VERIFIZIEREN (Diag reparieren, das den Drawer wirklich öffnet → Open-State left/right/Überlauf messen)                                                                                | Meine V18.39-Behauptung fusste auf dem geschlossenen Drawer. **MESSEN VOR BEHAUPTEN.**                                                                               |
| **A-7** | resoniert + Feinheiten mit eigenem Auge (Fokus-Screenshot, lesbar)                                                                                                                           | Nicht pixelblind — richtig rahmen. **VERIFIZIERE MIT DEM AUGE, DAS DU HAST.**                                                                                        |

Reihenfolge: A-6 (messen) + A-7 zuerst (Wahrheit), dann A-1..A-5 (als EIN System-Umbau, nicht
einzeln), dann erneut messen/verifizieren, dann Schöpfer-Browser für das GPU-Feel.

## B. Die DENKMUSTER, die die Werkstatt destilliert (die „Wege" für alle Menüs)

1. **CONTENT-FIRST** — der primäre Inhalt (Viewer = 90% der Zeit) ist gross, der Star; das Chrome
   tritt zurück (dünn). _Werkstatt: Viewer max, Picker dünn._
2. **ZONE NACH MENTALEM MODELL** — was der Nutzer als zusammengehörig DENKT, liegt zusammen.
   _Formen + Farben links._
3. **EINE ZONE, EINE AUFGABE** — Eingabe/Aktion getrennt von Ausgabe/Lesen. _Ausgabe = nur Readout._
4. **GRUPPIEREN NACH FUNKTION + RHYTHMUS** — gleiche Funktion = eine Gruppe, klar getrennt.
   _Mode-Bar = nur Werkzeuge._
5. **ORDNE NACH DER NUTZER-FRAGE** — Reihenfolge = Entscheidungs-Relevanz/Häufigkeit. _Ausgabe-Folge._
6. **PROGRESSIVE DISCLOSURE** — Seltenes beschwörbar, Häufiges sichtbar. _Bauplan-Dropdown; das „?"._
7. **STABILES LAYOUT** — feste Zonen, interner Scroll, kein Sprung bei Zustandswechsel. _Rechte Palette
   gedeckelt + scrollt (kein Klon-Sprung)._
8. **SYMMETRIE + RASTER** — gleiche Insets, konsistente Abstands-Tokens, eingemittet. _Rahmen left/right
   gleich (left:12/right:12, nie width:calc(100vw−X) → Scrollbar)._
9. **SUCHEN STATT SCROLLEN** — Listen sind durchsuchbar. _Such-Dropdown._
10. **MESSEN VOR BEHAUPTEN** — jede Aussage gegen eine verlässliche Messung; Unverifiziertes als solches
    markieren; GPU-Feel → Schöpfer-Browser. _Die Prozess-Lehre (V18.39: der über-behauptete Rahmen)._

## C. Die Anwendung auf ALLE Menüs (die Werkstatt zeigt den Weg)

Pro Raum: das mentale Modell → die Zonen → die Prinzipien.

**DER HOF (Dirigent + Orchester).** Fragen: „welche Wesen?" „was sollen sie tun?" „welche Gesetze?".

- _Content-first (P1):_ die Wesen-Liste ist der Star.
- _Eine Zone, eine Aufgabe (P3):_ jedes Wesen + SEINE Befehle INLINE (wähle Wesen → befiehl), statt
  globaler Knopf-Block + Duplikat in der Befehls-Liste.
- _Zonen (P2):_ Wesen (Liste + inline) · Gesetze (Welt-Regeln) · die freien Befehle → Omnibox (P6).
- _Ordne (P5):_ Wesen (häufig) zuerst, Gesetze (selten) sekundär.

**DAS ICH (Charakterbogen).** Fragen: „was habe ich?" „wer bin ich?" „was trage ich?".

- _Content-first (P1):_ der lebendige 3D-Avatar-Mittelpunkt (wer ich bin) als Star (WebGPU-Sub-Renderer).
- _Zonen (P2):_ Habe (Inventar + Hotbar) · Charakter (Seele/Stats/Emotionen) · Ausrüstung + Rezepte.
- _Stabil + Symmetrie (P7/P8):_ die Spalten gleich hoch (kein dunkler Leerraum — der V18.33-Befund).
- _Eine Zone, eine Aufgabe (P3):_ Anlegen (Aktion) getrennt von „was ich trage" (Anzeige).

**DIE BIBLIOTHEK (Welt-Browser).** Fragen: „welche Welten?" „was ist diese?" „wie teilen?".

- _Content-first (P1):_ die Welt-Karten (man BETRITT Welten) als Star, balanciertes Masonry (P8).
- _Zonen (P2):_ Entdecken · Schöpfen/Teilen · Provenienz (Stammbaum/Tagebuch auf Abruf, P6).
- _Suchen (P9):_ Welt-Suche, Tag-fähig (`welt:terrain`) über die Omnibox.

**DIE EINSTELLUNGEN (roter Faden).** Fragen nach Häufigkeit.

- _Ordne (P5):_ Spielmodus → Welt → Steuerung → Darstellung → Audio → Identität.
- _Progressive disclosure (P6):_ Selten-Genutztes (Dev-Render) eingeklappt.
- _Symmetrie + Raster (P8):_ mehrspaltig, Pergament-Karten, gleiche Insets.

## D. Der PROZESS — wie ich JEDEN Raum angehe (die nachhaltige Methodik, gegen das reaktive Patchen)

1. **ZIEL + Nutzer-Reise** — was tut der Nutzer hier, wie oft, in welcher Reihenfolge? (Die 90%-Regel:
   wo LEBT er? → das wird der Star.)
2. **MESSEN** — den Ist-Zustand verlässlich erfassen (gerahmter Screenshot, Rects, Überlauf, Open-State),
   nicht raten, nicht den nächsten Pixel schieben.
3. **ZONEN nach mentalem Modell** — gruppiere Zusammengehöriges; trenne die Funktionen
   (Eingabe / Werkzeug / Aktion / Ausgabe).
4. **CONTENT-FIRST** — maximiere den primären Inhalt, das Chrome tritt zurück.
5. **ORDNE nach Nutzer-Frage** — Reihenfolge = Relevanz; Seltenes beschwörbar.
6. **SYMMETRIE + Raster** — gleiche Insets, konsistente Tokens, eingemittet.
7. **STABIL** — feste Zonen, interner Scroll, kein Sprung.
8. **ALS SYSTEM, NICHT ALS PATCH** — das Ganze entwerfen; ein Befund ist ein SIGNAL für das Ziel, keine
   isolierte TODO.
9. **VERIFIZIEREN VOR BEHAUPTEN** — jede Aussage gegen die Messung; Unverifiziertes markieren;
   GPU-Feel → Schöpfer-Browser. (Die Wand gegen den Schwamm.)

**Die Kern-Lehre, die bleibt:** ein Schöpfer-Befund ist nie nur „fix dieses Pixel" — er ist ein SIGNAL
für ein verletztes PRINZIP. Wer das Prinzip findet + das ganze System danach ordnet, heilt den Befund
UND die zehn ungenannten Geschwister. Wer nur das Pixel schiebt, gebärt den nächsten Riss (der Schwamm).
Die Werkstatt war die Schule; diese neun Schritte + zehn Denkmuster sind, was sie uns für JEDEN Raum lehrt.
