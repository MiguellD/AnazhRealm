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

## 1.5 Die DETAIL-LEHREN aus der Werkstatt (P11–P13) — für JEDES Menü von Anfang an

Die letzten Werkstatt-Befunde (V18.40) sind die Vorlage. Drei Querschnitt-Regeln, die in JEDEM Raum
geprüft werden, BEVOR ich ihn baue (gegen das reaktive Nachbessern):

- **P11 Lesbarkeit/Kontrast.** GEMESSEN-Falle: Synergie/Wachstum + das „?"-Info waren zu blass auf dem
  dunklen Panel. → In ALLEN Menüs: sekundärer/kursiver/farbiger Text (Hints, Provenienz-Tagebuch in der
  Bibliothek, die Stat-Erklärungen im Ich, die LLM-Hinweise in den Einstellungen) muss gedämpft-ABER-lesbar
  sein. Vor jedem Raum: jeden Text-auf-Grund-Kontrast prüfen (Screenshot lesen, nicht annehmen).
- **P12 Overlay-Integrität.** JEDES Menü hat „?"-Popovers (Werkstatt · Hof-Gesetze · Ich-Stats ·
  Einstellungen-Render) + Dropdowns (die Omnibox, der Bauplan-Picker, die Bibliothek-Suche). ALLE müssen
  OPAK + nicht-geclippt (`overflow:hidden`-Vorfahr beachten → ggf. `position:fixed`/Portal) + z-index-korrekt
  sein. Das Werkstatt-„?" schimmerte durch + schnitt ab — das darf in KEINEM Raum passieren. Die `.help-dot`/
  `.help-pop`-Klasse (geteilt) EINMAL opak + clip-frei machen → alle Räume erben es.
- **P13 Raster-Flucht.** Mehrspaltige Räume (Ich 3-Spalten, Hof-Zonen, Bibliothek-Masonry, Einstellungen-
  Gruppen, die Werkstatt-Ausgabe) fluchten auf EINEM Raster, links UND rechts bündig. `column-count` driftet
  → wo Werte/Labels fluchten müssen, ein explizites `grid` mit fixen Spalten. Vor jedem Raum: die Kanten messen.

**Der geteilte Hebel:** P11–P13 leben in WIEDERVERWENDETEN Klassen (`.help-pop` opak+clip-frei · eine
Sekundär-Text-Farbe mit Kontrast · ein Flucht-Grid-Muster). EINMAL richtig → jeder Raum erbt es (die
`.library-columns`/`.help-search`-Disziplin auf die Detail-Ebene). Das ist „um die Ecke gedacht": die
Werkstatt-Schmerzen werden zu geteilten Bausteinen, nicht zu pro-Raum-Wiederholungen.

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

**Offen-ehrlich:** der 3D-Avatar-Mittelpunkt ist ein eigener WebGPU-Bogen (erst Schöpfer-Go); die
Spalten-Balance (kein dunkler Leerraum, V18.33) ist P7/P8.

---

## 4. WERKSTATT — feld für feld (der Abschluss, die funktionalen Zonen)

**Stand: GEBAUT (V18.40, Playtest grün) — die vier Zonen stehen** (Farben→links · Mach-Zone „⚒ FERTIGEN"
rechts · Ausgabe = nur Readout, nutzerfrage-geordnet · Werkzeug-Mode-Bar). **OFFEN (der Polish-Pass, im Plan
festgehalten, NICHT mehr im jetzigen Code — der Merge-Stand trägt sie als bekannte To-dos):** (1) das
**Signatur-Feld** in die Mach-Zone ÜBER FERTIGEN, unter ein sauberes **„Werk"-Heading** (statt `stat-label`);
(2) **Synergie/Wachstum lesbar** (P11 Kontrast); (3) die **rechte Flucht** der Ausgabe (P13, Grid statt
`column-count`); (4) das **Werkzeug-„?"-Popover** opak + nicht abgeschnitten + z-index (P12). Diese vier sind
die VORLAGE, wie die anderen Räume es von Anfang an richtig machen (P11–P13, §1.5).

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

---

## 7. Der globale Eingang — die Omnibox (wohin die ~60 Befehle wandern)

Die Konsole (Dauer-Chat, immer im Bild) + die Hof-Befehle-Liste verdichten zu EINER beschwörbaren
Omnibox (`ui-putz-plan.md` §Z3): `Ctrl+K`, Tag-Grammatik (`c:`/`b:`/`k:`/`welt:`/`geh:`), Freitext →
Nexus. Sie ist die Heimat aller freien/kreativen Befehle + macht den Bildschirm frei (P6, P9).

## 8. Die Bau-Reihenfolge (verifiziert, ein System pro Schritt)

0. **Der geteilte Detail-Hebel ZUERST (P11–P13, §1.5):** EINMAL die `.help-pop` opak + clip-frei + z-index
   machen, EINE lesbare Sekundär-Text-Farbe, EIN Flucht-Grid-Muster — als geteilte Bausteine, die alle Räume
   erben (so wiederholt sich der Werkstatt-Schmerz nirgends).
1. ✅ **Werkstatt-Abschluss GEBAUT (V18.40)** — die Referenz; **+ der Polish-Pass** (Signatur über FERTIGEN ·
   „Werk"-Heading · Synergie/Wachstum-Kontrast · rechte Flucht · „?"-Popover) als erster Akt, wenn der Code
   wieder dran ist (er nutzt direkt den Hebel 0).
2. **Omnibox-Kern** (§7) — löst die Hof-Duplikation strukturell, bevor der Hof umgebaut wird.
3. **Hof** (§2) — inline-Wesen + Gesetze; die Befehle-Liste stirbt (Omnibox trägt).
4. **Bibliothek** (§5) — Masonry + Andock-Formular eingeklappt; „Diese Welt" zieht aus Einstellungen her.
5. **Einstellungen** (§6) — die 6 Gruppen ordnen; das Welt-teilen-Duplikat raus.
6. **Ich** (§3) — Klick-Hotbar, Avatar-Mittelpunkt (WebGPU → Schöpfer-Go), Seele-formen → Werkstatt.

Jeder Raum durchläuft VOR dem Bauen den P11–P13-Check (Kontrast · Overlay · Flucht messen), damit die
Werkstatt-Detail-Lehren nie wieder als Befund zurückkommen.

Jeder Schritt: **messen → als System bauen → verifizieren (Behauptung zuletzt) → Schöpfer-Browser
fürs GPU-Feel.** Kein reaktives Patchen.
