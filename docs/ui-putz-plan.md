# Der UI-Putz — die Bibliothek von Alexandria der Moderne (Plan)

> **Lies dies ZUERST vor jeder Arbeit am UI / an der Bedien-Oberfläche / am HUD / an den
> Drawern / Tabs / am Inventar / an der Ausrüstung / am Theme / an der Erreichbarkeit von
> Spieler-Funktionen.** Es hält die gemessene Bestandsaufnahme (06.06.2026), die
> Design-Philosophie und den geordneten Plan fest. Verwandte Anker: `kampf-plan.md` §11
> (die Werkstatt — das Vorbild-Subdesign), `das-lebendige-feld.md` (die Welt, die das UI
> trägt), `state-of-realm.md` (die Vision).

**Stand: GEBAUT + VEREDELT (V18.33, 07.06.2026).** Zehn Bögen verifiziert + gepusht
(`_el`-Builder · Tag/Nacht weg · WOW-Start · Hilfe→Einstellungen+Dev gestaffelt ·
Emotion-Klarheit · Rezeptbuch+Equip · Der Hof · Bibliothek von Alexandria · Das Ich/Inventar
· freier Bildschirm); dann die VEREDELUNG (V18.33): die GEMESSEN-Wurzel der hässlichen Räume
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
