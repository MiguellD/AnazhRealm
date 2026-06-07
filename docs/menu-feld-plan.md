# Der Menü-Feld-Plan — die Inventur + wohin jedes klickbare Feld gehört (07.06.2026)

> **Lies dies ZUSAMMEN mit `ui-putz-plan.md`** (dort die Vision §1–2, die Omnibox §Z3, die
> Denkmuster + der Prozess „DER WERKSTATT-ABSCHLUSS"). Dieses Doc ist die **Ausführungs-Ebene**:
> der GEMESSENE Ist-Stand jedes Raums (jedes klickbare Feld) + die Entscheidung „wohin / welches
> Format / welches Prinzip" pro Feld. Schöpfer-Auftrag: „keine halben Sachen — Stand messen, wo
> muss es hin, wende die Learnings + den Prozess auf JEDES klickbare Feld an."

## 0. Der gemessene Ist-Stand (`scripts/diag-menu-audit.cjs`)

| Raum              | klickbare Felder | Kern-Befund                                                         |
| ----------------- | ---------------- | ------------------------------------------------------------------- |
| Topbar (global)   | 8                | 5 Tabs + 3 Toggles (Stimme/Klang/Sicht) — ok, schlank               |
| Konsole (global)  | 3                | Einklappen · Logbuch · Chat-Eingabe — **immer im Bild** (→ Omnibox) |
| **Hof**           | **92**           | die „Befehle"-Liste (~60 CMD) **dupliziert ALLES**                  |
| **Ich**           | 76               | 27 Slots + 9 Hotbar + Seele + Rezeptbuch (~22) + „Mehr"             |
| **Werkstatt**     | 41               | Mode-Bar mischt Werkzeug + Datei-Akt + FERTIGEN                     |
| **Bibliothek**    | 30               | Andocken (Formular) + Welt-Karten (Portal/Signieren/Teilen)         |
| **Einstellungen** | 86               | 14 Sektionen; Speicher + „Diese Welt" **duplizieren**               |

## 1. Der Querschnitt: die DUPLIKATE (die Heilige Lektion — eine Quelle, viele Pfade)

Die GEMESSENE Triplizierung. Jeder Befehl bekommt EINE Heimat; die Duplikate lösen sich auf.

| Befehl(e)                                                             | heute (Duplikate)                                                  | EINE Heimat                                                               | Prinzip                   |
| --------------------------------------------------------------------- | ------------------------------------------------------------------ | ------------------------------------------------------------------------- | ------------------------- |
| folge/komm/warte/erkunde/sammle/baue                                  | Hof: Aufträge + Sammeln + Bauen **UND** Befehle-Liste **UND** Chat | **INLINE am Wesen** (wähle Kreatur → befiehl) + Omnibox `k:`              | P3 eine Zone eine Aufgabe |
| werde mensch/phönix/drache                                            | Hof Befehle (Spieler-Seele) **UND** Ich (Seele-Select)             | **Ich → Seele** + Omnibox `c:`                                            | P2 zone nach Modell       |
| baue dorf/tempel · pflanze baum · setze insel · rufe ufo · grabe loch | Hof Befehle (Bauwerke) + Chat                                      | **Omnibox `b:`/`c:`** (kreative Welt-Akte = gesprochen, kein Dauer-Knopf) | P6 progressive disclosure |
| setze wetter · heile welt · terrain · sprungkraft · sternenhimmel     | Hof Befehle (Welt-Effekte) + Chat                                  | **Omnibox `c:`**                                                          | P6                        |
| kreaturen aktiv/deaktiv                                               | Hof: Spawnen **UND** Befehle                                       | **Hof → Spawnen** (Kontext) + Omnibox `c:`                                | P3                        |
| speichere/lade Zustand · lade Datei                                   | Hof Befehle (System) **UND** Einstellungen (Speicher)              | **Einstellungen → Speicher** + Omnibox `c:`                               | P2                        |
| Welt teilen/empfangen                                                 | Einstellungen („Diese Welt") **UND** Bibliothek                    | **Bibliothek** (das soziale Zuhause)                                      | P2                        |
| rüste werkzeug/rüstung/waffe                                          | Hof Befehle + Chat                                                 | **Ich → Ausrüstung** + Omnibox `c:`                                       | P2                        |

**Die EINE Konsequenz: die Hof-„Befehle"-Liste (der ~60-Knopf-Katch-all) STIRBT.** Sie wird die
**Omnibox** (`Ctrl+K`, durchsuchbar, `ui-putz-plan.md` §Z3). Die kontextuellen Akte leben dort, wo
man HANDELT (am Wesen, an der Seele, an der Ausrüstung); die freien/kreativen Welt-Akte spricht man
in die Omnibox. **Das löst ~60 Duplikat-Knöpfe + den Dauer-Chat auf einmal.**

---

## 1.5 Die GETEILTEN BAUSTEINE + DENKMUSTER aus der Werkstatt (P11–P17) — für JEDES Menü von Anfang an

Die Werkstatt ist VOLLENDET (V18.41–44) + ist die REFERENZ. Sie hat GETEILTE Bausteine + Denkmuster
destilliert, die JEDER Raum erbt — sie sind GEBAUT, kein neuer Aufwand pro Raum. Vor jedem Raum prüfen.

**A — die geteilten BAUSTEINE (gebaut, wiederverwendbar — nicht neu erfinden):**

- **P11 Kontrast — die Ton-Tokens (GEBAUT):** `--ink-on-dark` / `--ink-on-dark-soft` = der lesbare
  Primär-/Sekundärtext auf DUNKLEM Grund (`--parch-ink*` ist dunkel → dunkel-auf-dunkel-Falle). **Disziplin:
  „auf welchem Grund sitzt der Text?" ZUERST fragen — dunkles Panel (`rgba(20,12,4,…)`) → `--ink-on-dark*`;
  helle Pergament-Palette → `--parch-ink*`. Der ink-Ton folgt dem ECHTEN Grund, nicht der Annahme** (V18.41/.42
  Fehler: die Signatur lag auf hellem Grund, ich nahm dunkel an).
- **P12 Overlay — das Body-Portal (GEBAUT):** `.help-pop` wird bei Hover/Fokus nach `document.body`
  PORTALIERT (`_installHelpPopovers`, ein delegierter Listener) + opak + `z-index:9999`. **Reines CSS reicht
  NICHT, wenn ein Vorfahr `transform` trägt** (der `.drawer` hat `transform` für die Slide → Containing-Block
  für `position:fixed` UND Clip) → nur das Body-Portal entkommt. JEDES „?"/Dropdown erbt `.help-pop`/`.help-dot`.
- **P13 Flucht — das Grid-Muster (GEBAUT):** wo Werte/Labels fluchten müssen, ein explizites `grid` mit
  fixen Spalten (NIE `column-count` — das driftet). Die `.spec-bar` (78px Label | 1fr Track | 34px Wert) ist
  das Daten-Viz-Flucht-Muster.
- **P14 Rahmen — die EINE Fenster-Sprache (GEBAUT, ALLE Drawer erben sie):** jeder `.drawer` sitzt
  `top:70` (direkt am Hauptbanner, DECKT den Statusbar beim Öffnen) · `left:12;right:12;width:auto`
  (symmetrisch) · `max-height:calc(100vh−84px)` (kein Überlauf unten) · Inhalt im `.drawer-scroll` · ein
  HÖHEN-only Resize-Griff (`.resize-b`, symmetrie-treu). **Ein neuer Raum braucht KEINE eigene Rahmen-CSS —
  er IST ein `.drawer`, er erbt alles.** Disziplin bei „Rahmen falsch": ZUERST `el.getAttribute('style')`
  messen (ein Legacy-Inline-Style schlägt jede CSS-Regel) + die Rects NACH der Slide-Transition.
- **P15 Daten-Viz — das Spec-Sheet-Muster (GEBAUT, `_specBar` + `_el`):** wo das System schon einen reichen
  VEKTOR liefert (Tags · Rollen-Resonanz · Stats · **Emotionen** · Aura), liest man ihn als DATEN-VIZ (Balken,
  Hierarchie, Fingerabdruck) statt als flache Label/Wert-Tabelle. Header (Identität) → Body (der Fingerabdruck
  in Balken) → Footer (sekundär). `_specBar(label, frac, val, levelClass)` + die `.spec-*`-Klassen sind
  WIEDERVERWENDBAR (Ich-Stats/Emotionen, Hof-Wesen-Profil, Bibliothek-Welt-Tags).

**B — die DENKMUSTER (das WIE):**

- **P16 EINE Ebene, kein Scroll-Durchlauf:** gleichwertige Dinge gehören in EINEN Fluss auf EINE Ebene.
  Ein Sticky/Footer, hinter dem Inhalt durchscrollt, ist KEINE Synergie (V18.42: die WERK-Zone). Eine Sektion
  ist eine Sektion wie die anderen (gleicher Heading-Stil), kein floatender Fremdkörper.
- **P17 Heile den Samen, schneide ihn nicht:** eine User-Fähigkeit (Resize, ein Akt) nimmt man nicht weg —
  man gibt ihre FUNKTION symmetrie-treu zurück (V18.43: Resize → HÖHEN-only Griff). Und ein großer
  Präsentations-Rewrite ERSETZT die alten Render-Helfer (löschen, kein Parallel-Pfad — V18.44: ~430 Z. raus).

**Der geteilte Hebel (die Kern-Idee):** die Werkstatt-Schmerzen wurden GETEILTE Bausteine (Tokens · Portal ·
Grid · Rahmen · `_specBar`/Spec-Sheet), nicht pro-Raum-Wiederholungen. „Um die Ecke gedacht": jeder neue Raum
erbt sie + wendet nur die Denkmuster an. Vor jedem Raum der Check: **Grund (P11) · Overlay (P12) · Flucht (P13) ·
Rahmen (P14, erbt) · Vektor-als-Viz (P15) · eine Ebene (P16) · Samen heilen (P17)** — im Screenshot messen.

---

## 2. HOF — feld für feld (Dirigent + Orchester)

**Mentales Modell / Reise:** „welche Wesen habe ich → was sollen sie tun → welche Gesetze gelten".
Der Spieler dirigiert Leben. **Content-first = die Wesen-Liste.**

**Zonen (statt 8 gestapelter Sektionen):**

| Feld heute                                                      | → Heimat / Format                                                                                                                | Prinzip · WARUM                                                                             |
| --------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| **Wesen in der Welt** (Liste, read-only)                        | **Zone 1 (Star): Wesen** — Liste mit per-Wesen **inline** Aktionen (folge/komm/warte/sammle/baue als kleine Knöpfe an der Zeile) | P1 content-first · P3: das Wesen + SEINE Befehle gehören zusammen, nicht ein globaler Block |
| Aufträge (6 CMD) · Sammeln (select+2) · Bauen lassen (select+2) | **aufgelöst** → inline am Wesen (oben)                                                                                           | P3 eine Zone eine Aufgabe — der globale Block war die Trennung von Wesen + Befehl           |
| Spawnen (select + +1/+5/+10 + aktiv/deaktiv)                    | **Zone 1 unten: „Neues Wesen"** (der Spawn gehört zur Wesen-Verwaltung)                                                          | P2 zone nach Modell                                                                         |
| Gesetze · Welt-Regeln                                           | **Zone 2: Gesetze** (die stehenden Regeln — eigene, klare Zone)                                                                  | P2                                                                                          |
| Fähigkeiten · der Nexus komponiert                              | **Zone 2 daneben** (Nexus-Komposition = Welt-Regel-verwandt)                                                                     | P2                                                                                          |
| **Befehle (~60 CMD + Suche)**                                   | **GELÖSCHT → Omnibox**                                                                                                           | P6 + Heilige Lektion (eine Quelle)                                                          |

**Ergebnis:** Hof von 92 → ~drei klare Zonen (Wesen+inline · Gesetze/Nexus · [Omnibox für den Rest]).
Die 60 Duplikat-Knöpfe weg.

**Werkstatt-Lehren angewandt (§1.5):** der Rahmen erbt (P14, der Hof IST ein `.drawer`). Jede Wesen-Zeile
ist eine kleine **Spec-Card** (P16 eine Ebene): Name + die per-Wesen-Daten als kompakte Daten-Viz — das
Wesen trägt einen VEKTOR (Compound-Tags · Task · Aura/Emotion), den man wie das Material-Profil als Balken/
Chips lesen kann (P15 `_specBar`-Wiederverwendung: z.B. ein dünner Aura-/Stimmungs-Balken statt eines rohen
Worts), die inline-Befehle (folge/komm/…) auf derselben Zeile. Die Gesetze-Liste: jede Regel eine Zeile,
das „?" als `.help-pop` (P12). Kontrast auf dem dunklen Hof-Panel über `--ink-on-dark*` (P11).

---

## 3. ICH — feld für feld (der Charakterbogen, Minecraft-Modell)

**Mentales Modell:** „was habe ich → wer bin ich → was trage/braue ich". **Content-first = der
lebendige Avatar (wer ich bin).**

| Feld heute                                                               | → Heimat / Format                                                                                                                                           | Prinzip · WARUM                                                 |
| ------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------- |
| 27 Inventar-Slots + 9 Hotbar-Selects                                     | **Zone „Habe"** (links): das 9-breite Raster + die Hotbar als 3×3-Karte                                                                                     | P2 · bleibt (Minecraft-Modell)                                  |
| Hotbar als 9 `<select>`                                                  | → **Klick-Zuweisung** statt Dropdowns (Slot wählen → Inventar-Item klicken)                                                                                 | P3 · ein Select pro Slot ist umständlich; direkte Manipulation  |
| Seele-Select · Stats · Emotionen                                         | **Zone „Charakter"** (Mitte) + der **3D-Avatar-Mittelpunkt** (WebGPU-Sub-Renderer) als Star                                                                 | P1 content-first — „wer bin ich" wird sichtbar                  |
| Eigene Seele formen (Klonen/Neu)                                         | → **in die Werkstatt** (Avatar formen = ein Mach-Akt, gehört an die Werkbank)                                                                               | P2 zone nach Modell                                             |
| Rezeptbuch (Suche + ~22 In-die-Hand/Anlegen/Brauen+Trinken/**Fertigen**) | **Zone „Ausrüstung & Rezepte"** (rechts)                                                                                                                    | P5                                                              |
| die ~16 „Fertigen"-Knöpfe (einer pro Rezept)                             | **überdenken:** „Fertigen" hier dupliziert die Werkstatt-FERTIGEN. Das Rezeptbuch sollte **tragen/brauen** (Gebrauch), das **Machen** lebt in der Werkstatt | P3 · Gebrauch (frei) ≠ Werk (kostet) — die kampf-plan §11-Achse |
| „Mehr: Wechseln & Markieren" (eingeklappt)                               | bleibt eingeklappt (selten)                                                                                                                                 | P6 progressive disclosure                                       |
| „Was du trägst (Klick legt ab)"                                          | bleibt — Anzeige + Ablegen                                                                                                                                  | P3 (Anzeige getrennt von Anlegen)                               |

**Werkstatt-Lehren angewandt (§1.5) — der größte Synergie-Gewinn:** das Ich trägt die REICHSTEN Vektoren
(Stats · **Emotionen** · Aura · Compound-Tags der Seele) → genau der Spec-Sheet-Fall (P15). Statt flacher
Werte + roher Emotions-Balken: die **Charakter-Zone als Spec-Sheet** (`_specRender*`/`_specBar`-Wiederverwendung) —
**Stats als Balken**, die **6 Emotionen als farbcodierte Balken** (die Emotion-Achse hat eine feste Palette
`--joy/--awe/…` → perfekt für Daten-Viz + heilt das gemessene Aura-/Emotion-Klarheits-Problem, `ui-putz §8.A`),
die **Seele/Material-Tags als Profil**. Das ist der „Wer bin ich"-Fingerabdruck. Der Rahmen erbt (P14); die
Spalten-Balance (V18.33-Leerraum) ist P7/P8; der 3D-Avatar-Mittelpunkt bleibt ein eigener WebGPU-Bogen
(erst Schöpfer-Go). Kontrast über `--ink-on-dark*` (P11), die Stat-Erklärungen als `.help-pop` (P12).

---

## 4. WERKSTATT — feld für feld (der Abschluss, die funktionalen Zonen)

**Stand: VOLLENDET (V18.40–44, Playtest grün + mit dem Auge verifiziert) — die REFERENZ.** Gebaut: die vier
funktionalen Zonen (Formen+Farben links · Viewer+Werkzeuge mitte · Material/Werkzeug+WERK rechts · Ausgabe
unten) · der Detail-Hebel P11–P13 (V18.41) · die WERK-Zone auf EINER Ebene (V18.42, P16) · der Rahmen am
Hauptbanner + Viewer +10% + Höhen-Resize (V18.43, P14/P17) · **die Ausgabe als PROFI-SPEC-SHEET (V18.44, P15):**
Header (Rolle+Fähigkeit·Qualität) → Body (Material-Profil-Tags + Rollen-Resonanz als Daten-Viz-Balken + Werte)
→ Footer (Kosten·Wachstum), liest das bestehende Vektor-System; ~430 Z. alte Tabellen-Helfer ersetzt+gelöscht.
OFFEN: nur der Schöpfer-Browser-Sign-off (GPU-Feel) + die Seiten-Paletten-Balance (V18.33). **Die Werkstatt ist
die Vorlage — alle Bausteine (P11–P17, §1.5) sind hier gebaut + von hier geerbt.**

Siehe `ui-putz-plan.md` §A (das WARUM). Hier feld-konkret:

| Feld heute (41)                                                 | → Zone / Format                                                                        | Prinzip                     |
| --------------------------------------------------------------- | -------------------------------------------------------------------------------------- | --------------------------- |
| Such-Dropdown (Baupläne)                                        | **bleibt** links oben (P6 progressive disclosure, P9 suchen)                           | ✓                           |
| Formen (8 Primitive, 3×3) + Part entfernen                      | **Zone LINKS: „Hinzufügen"**                                                           | P2                          |
| **Farben** (~12 drag)                                           | **→ LINKS** (unter Part entfernen) — „was ich hinzufüge/wie es aussieht"               | P2 zone nach Modell         |
| Mode-Bar: Move/Rotate/Scale/Connect/Snap/Zentrieren             | **Zone MITTE: nur Werkzeuge**                                                          | P4 gruppieren nach Funktion |
| Mode-Bar: Klonen/Neu/Löschen + Undo/Redo + FERTIGEN             | **→ Zone „Aktionen"** (rechts, im von den Farben freigegebenen Platz)                  | P3 eine Zone eine Aufgabe   |
| Materialien (13 drag) + Werkzeuge (drag)                        | **Zone RECHTS: „Woraus/Womit"**                                                        | P2                          |
| Ausgabe-Tabelle (Rolle/Fähigkeit/Resonanz/Kosten/Tags/Qualität) | **Zone UNTEN: NUR Ausgabe** (FERTIGEN raus), Reihenfolge Identität→Güte→Preis→Wachstum | P3 + P5                     |

---

## 5. BIBLIOTHEK — feld für feld (der Welt-Browser)

**Mentales Modell:** „welche Welten gibt es → was ist diese → wie teile/hole ich". **Content-first
= die Welt-Karten (man BETRITT Welten).**

| Feld heute (30)                                                                              | → Zone / Format                                                                    | Prinzip                                                             |
| -------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| Welt-Karten (Portal holen/Signieren/Teilen ×N)                                               | **Zone 1 (Star): Entdecken** — balanciertes Masonry-Raster, je Karte eine Vorschau | P1 content-first · P8 raster                                        |
| pro Karte: Portal/Signieren/Teilen                                                           | **inline an der Karte** (die Welt + ihre Akte zusammen)                            | P3                                                                  |
| KI-Übersetzer (textarea + Übersetzen) · Welt andocken (5 Inputs + 2 Checks + Datei + GitHub) | **Zone 2: Schöpfen/Andocken** (das Formular — selten, eingeklappt)                 | P6 progressive disclosure (ein Power-Formular, nicht im Dauer-Bild) |
| Stammbaum/Tagebuch (Provenienz)                                                              | **Zone 3: erst bei Karten-Auswahl**                                                | P6                                                                  |
| Welt-Suche                                                                                   | **Omnibox `welt:`** (tag-fähig)                                                    | P9                                                                  |
| Neue Welt… / Verschmelzen…                                                                   | **Zone „Verwalten"** (klar getrennt von Entdecken)                                 | P2                                                                  |

**Werkstatt-Lehren angewandt (§1.5):** der Rahmen erbt (P14). Jede Welt-Karte ist eine **Spec-Card** — die
Welt trägt einen Vektor (Trust · Provenienz · ggf. Terrain-/Stimmungs-Tags) → als kompakte Daten-Viz (P15),
die Akte (Portal/Signieren/Teilen) inline auf der Karte (P16 eine Ebene). Welt-Suche + Andock-Formular als
opake, portalierte Overlays (P12); das Masonry auf EINEM Flucht-Raster (P13); Provenienz/Tagebuch gedämpft-
aber-lesbar (P11 `--ink-on-dark*`).

---

## 6. EINSTELLUNGEN — feld für feld (ein roter Faden, 14 Sektionen → geordnet)

**Mentales Modell:** nach Häufigkeit/Logik geordnet. Heute 14 ad-hoc Sektionen.

| Sektion(en) heute                                                  | → Gruppe / Reihenfolge                                 | Prinzip                                            |
| ------------------------------------------------------------------ | ------------------------------------------------------ | -------------------------------------------------- |
| Welt-Beziehung (3 Radios: frieden/pfad/schöpfer)                   | **1. Spielmodus** (zuerst — die wichtigste Wahl)       | P5 ordne nach Relevanz                             |
| Diese Welt (teilen/empfangen)                                      | **→ Bibliothek** (Duplikat raus); hier nur ein Verweis | P2 + Heilige Lektion                               |
| Speicher (Speichere/Lade/Export)                                   | **2. Welt & Speicher**                                 | P5                                                 |
| Tastenbelegung (11 Keybinds + Reset)                               | **3. Steuerung**                                       | P5                                                 |
| Lautstärke+Sicht · Kreaturen-Stimmen · Logbuch                     | **4. Ton & Sicht**                                     | P2                                                 |
| Tag-Nacht-Zyklus                                                   | **4. Ton & Sicht** (Welt-Darstellung)                  | P2                                                 |
| Tuning (Emotionen) · Atmosphäre/Render (18 Regler)                 | **5. Feinschliff (Dev)** — eingeklappt                 | P6 progressive disclosure (selten, für Entwickler) |
| Vibe-Pass · Begleiter+Avatar · Begleiter-Stimme (LLM) · Multi-User | **6. Identität & Begleiter**                           | P2                                                 |

**Befund:** die 18 Render-Regler (alle `~` = default eingeklappt, gut) — sie bleiben unter
„Feinschliff". Die LLM-Felder (API-Key etc.) gehören zu „Begleiter".

**Werkstatt-Lehren angewandt (§1.5):** der Rahmen erbt (P14) — Einstellungen sitzt am Hauptbanner, mehrspaltig,
symmetrisch. Die 6 Gruppen als Pergament-Karten auf EINEM Flucht-Raster (P13). Die Render-/Tuning-REGLER sind
schon Daten-Viz (Slider) — Werte gedämpft-aber-lesbar auf ihrem Grund (P11); die LLM-/Dev-Hinweise als
`.help-pop` (P12) statt Dauer-Fließtext. Eingeklappte Dev-Sektionen = P6 progressive disclosure.

---

## 7. Der globale Eingang — die Omnibox (wohin die ~60 Befehle wandern)

Die Konsole (Dauer-Chat, immer im Bild) + die Hof-Befehle-Liste verdichten zu EINER beschwörbaren
Omnibox (`ui-putz-plan.md` §Z3): `Ctrl+K`, Tag-Grammatik (`c:`/`b:`/`k:`/`welt:`/`geh:`), Freitext →
Nexus. Sie ist die Heimat aller freien/kreativen Befehle + macht den Bildschirm frei (P6, P9).

## 8. Die Bau-Reihenfolge (verifiziert, ein System pro Schritt)

0. ✅ **Die WERKSTATT VOLLENDET = die Referenz + alle geteilten Bausteine GEBAUT (V18.41–44, §1.5):**
   P11 Ton-Tokens · P12 `.help-pop` Body-Portal · P13 Flucht-Grid · **P14 die EINE Fenster-Sprache (jeder
   `.drawer` erbt: top:70 am Hauptbanner, symmetrisch, max-height-bound, Höhen-Resize)** · **P15 das Spec-Sheet
   (`_specBar`/`_el`, Daten-Viz aus den bestehenden Vektoren)** · P16 eine Ebene · P17 Samen heilen. Mit dem
   Auge verifiziert (`scripts/diag-workshop-ui.cjs`), Playtest grün. OFFEN: nur der Schöpfer-Browser-Sign-off.
1. ✅ **Omnibox-Kern GEBAUT (V18.45, §7)** — Ctrl/Cmd+K, Spotlight, Tag-Grammatik c/b/w/s/t/a/g/p/geh/welt/k,
   Freitext→Nexus; liest die bestehenden Vektoren + ruft `processChatCommand`/`selectBlueprintForEdit` (additiv).
   10 KONSUM-Invarianten + mit dem Auge verifiziert (`diag-omnibox.cjs`). OFFEN: die alten Pfade ablösen
   (Hof-Schritt) + Browser-Sign-off.
2. **Hof** (§2) — inline-Wesen (Spec-Cards, P16) + Gesetze; die Befehle-Liste stirbt (Omnibox trägt).
3. **Ich** (§3) — der Spec-Sheet-Gewinn (Stats + 6 Emotionen + Seele-Tags als Daten-Viz, `_specBar`-Reuse);
   Klick-Hotbar; Avatar-Mittelpunkt (WebGPU → Schöpfer-Go); Seele-formen → Werkstatt.
4. **Bibliothek** (§5) — Masonry-Spec-Cards + Andock-Formular eingeklappt; „Diese Welt" zieht aus Einstellungen.
5. **Einstellungen** (§6) — die 6 Gruppen ordnen; das Welt-teilen-Duplikat raus.

(Ich vor Bibliothek/Einstellungen vorgezogen: der Spec-Sheet-Reuse ist dort der größte Synergie-Gewinn + frisch
aus der Werkstatt.) Jeder Raum erbt P11–P14 GRATIS (geteilte Bausteine) + wendet P15–P17 an; VOR dem Bauen der
Check: Grund · Overlay · Flucht · Rahmen · Vektor-als-Viz · eine Ebene · Samen (im Screenshot messen).

Jeder Schritt: **messen → als System bauen → verifizieren (Behauptung zuletzt) → Schöpfer-Browser
fürs GPU-Feel.** Kein reaktives Patchen.
