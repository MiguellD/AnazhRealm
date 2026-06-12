# DER RÜCKMELDUNGS-KORPUS — jede Schöpfer-Rückmeldung, verfolgbar bis zur Abnahme

> **Das Gesetz (meister-plan §8.8b):** vor JEDER Session-Planung diesen Korpus lesen.
> KEIN „GEBAUT ✓" ohne (1) Korpus-Update der berührten IDs + (2) Nachbau-Szenario im
> Nutzer-ZUSTAND (frieden · leeres Inventar · Konsole zu · 1366px — §8.7). Eine
> Rückmeldung gilt erst als GESCHLOSSEN, wenn der Schöpfer sie im Browser abgenommen
> hat (S-Abnahme) oder sie BEANTWORTET/ENTSCHIEDEN markiert wurde.
>
> Status-Sprache: **offen** (Wurzel gemessen, Welle zugeteilt) · **gebaut** (Code da,
> S-Abnahme offen) · **S-Abnahme** (wartet nur aufs Schöpfer-Auge) · **beantwortet**
> (Wissens-Frage, keine Welle) · **Entscheid** (braucht ein Schöpfer-Wort).

## Korpus v1 — der zweite Schöpfer-Audit (12.06.2026 abend)

Wurzeln: meister-plan §8.1 (GEMESSEN via `diag-audit2.cjs`); Zweitmessung: Tiefen-Audit §8.8.

| ID | Rückmeldung (Kurzform) | Status | Wurzel | Welle |
|---|---|---|---|---|
| R-001 | Konsole nach Resize „komplett komisch"; Griff wirkt am falschen Ort | offen | Inline-Höhe übersteuert `.collapsed`-CSS; Griff oben-rechts an unten-links-Panel (§8.1#1) | W-A |
| R-002 | Hof: Emotionen statt Natur, mit intuitiven Balken; Werte-Balken „weg" | offen | Balken existieren, im Hof-Kontext unsichtbar (CSS); Emotionen nur 1 Gemüts-Balken (§8.1#2) | W-B |
| R-003 | Boosts doppelt + überlagern + „(ausgelaufen)" bleibt; gehören zu den Emotionen rechts | offen | ZWEI Renderer (Equip + Sheet-Fußzeile); Tick relabelt statt entfernt (§8.1#3) | W-C |
| R-004 | „Faust"-Feld unterm Viewer interferiert mit G-Offhand | offen | Haupthand-Slot vs Nebenhand (G) ohne Benennungs-Klarheit (§8.1#4) | W-C |
| R-005 | Rüstung anziehen ändert Stats nicht (auch nach Rückmeldung!) | offen | GEMESSEN: Web-Akt scheitert in frieden STILL am Material-Tor (4× eisen, 1× bronze fehlen); angelegt wäre Abwehr +8.1; Feedback nur in zugeklappter Konsole (§8.1#5) | W-C |
| R-006 | Emotion-Schriften im Ich unlesbar | offen | Label rgb(58,46,74) auf dunkel — M5 heilte nur den Track (§8.1#6) | W-C |
| R-007 | Wagen-Karte sagt „In die Hand" | offen | `_recipeRow`-Label-Switch kennt vehicle-Gruppe nicht; Label lügt, Tat stimmt (§8.1#7) | W-C |
| R-008 | Umwidmen im Ich „gottlos"; wozu überhaupt — der Prozess fixt doch die Rolle? | offen | Ich-Rest lebt (index.html:7707); legitim bleiben NUR die 3 Intent-Akte: Portal-Ziel · Werkstatt-Designation · Emergent-Reset (§8.1#8) | W-C |
| R-009 | Überlagerter Emotions-Text unter der Statusleiste | offen | `#emotion-label` (fixed top:92px); Schöpfer-Wort: in die Leiste oder weg (§8.1#9) | W-C |
| R-010 | Reiter schwebt überm Sattel (Wagen + Holzross) | offen | hartes `+0.9` auf den Sitzpunkt statt Hüfthöhe der Sitz-Pose; Schwebe GEMESSEN 0.90 m (§8.1#10) | W-D |
| R-011 | Holzross clippt in den Boden | offen | Mess-Schritt M-D2: animierte Bein-Pose vs `_compoundBottomY` (Bauplan-Pose) | W-D |
| R-012 | Nacht-Boden hochdrehen frisst jede Struktur; Ebenen nicht harmonisch; „Frequenzband wie Aura?" | offen | max()-Clamp + 5 Ebenen-Familien mit eigener Licht-Antwort (A/B-Shots); Sende-Feld ist EINS, Empfang fragmentiert (§8.1#11, §8.3) | **W-E** |
| R-013 | Nacht-Boden + Mond-Rim Standard 0.06 | offen | Schöpfer-Wort als Default übernommen (§8.3) | W-E |
| R-014 | Fluss „Häuschenpapier", keine wilde Strömung; Tauchhöhe versetzt; Moiré-Linien | offen | Lauffläche erbt Terrain-Beulen; Tauch-Trigger liest Terrain statt geglätteter Fläche; Narben-Wand: NIE der Querschnitt (§8.1#12, §8.8e) | W-F |
| R-015 | Anker/Sitz nicht verschieb-/begreifbar; Drehachsen unklar; „Hälfte der Verbindungen überflüssig?" | offen | Anker nur via Dialog-Pick (kein Drag/Gizmo); Gelenk-Achse unsichtbar; 8 gleichwertige Kacheln ohne Vorrang (§8.1#13, §8.4) | W-G |
| R-016 | Wald enttäuscht — „da-Vinci-Pinsel" erwartet; Trennung „durch Verstümmelung statt natürliche Baupläne" | offen | 2 Arten × 1 Gestalt; Trank-Trennung kam über Signatur-Achsen statt reichere Baupläne (§8.1#14, §8.5) | W-H |
| R-017 | „Nexus spawnt wieder auf mir" | teil-gemessen | Struktur-Klemme WIRKT (17.9 m GEMESSEN); Kreatur/Flora ungeklemmt → M-F1 + Min-Abstand ~3 m (§8.1#15) | W-D |
| R-018 | LOD-Start-Loch / Fog an die Kante / Sichtkegel | gebaut | Lade-Nebel V18.164 (fog deckt GEBAUTE Kante; A/B 796→98 m); LOD0↔1-Übergangs-LOOK = U-Kaskaden-Pass | S-Abnahme |
| R-019 | Baum-/Deko-Abbau gibt keine Rohstoffe | gebaut | M6/V18.159 Ertrags-Sockel (GEMESSEN holz 4 + laub 61); Deko-Pflück-REICHWEITE bleibt Vermerk | S-Abnahme |
| R-020 | Terrain-Abbau instant; nachts schwarz; Cel-Kontrast-Regler | gebaut | M6 Grabe-Mühe · M7 Nacht-Boden · V18.163 Cel-Kontrast ECHT | S-Abnahme |
| R-021 | Räder falsche Achse; Spieler sitzt nicht (Pose) | gebaut | M3/V18.155 (Zylinder-Eigenachse + Sitz-Pose) — Rest-Schwebe = R-010 | S-Abnahme |
| R-022 | Brennkolben/Drehbank als „Bauwerk"; Eiche/Kiefer als „Trank"; Holzross=Seele/nicht fertigbar; Fahrzeug rutscht in Hand (Hotbar) | gebaut | M2/V18.154 + V18.162 + V18.164-Bank (46 Fälle) + Spektrum-Spiegel | S-Abnahme |
| R-023 | Verbindungs-Dialog Textwand/nicht intuitiv; Sitz-Position wie definieren | gebaut | M1 Kacheln+Face-Snap · §7.1 Auto-Verbindung · §7.2 Sattel+Ghost — die BEGREIFBARKEIT (R-015) bleibt offen | S-Abnahme |
| R-024 | Suche/Tags nicht überall gleich (Omnibox/Werkstatt/Inventar) | gebaut | M4/V18.158 EIN Such-Kern (GEMESSEN: „fa" → FAHRZEUG-Gruppe im Ich ✓ Screenshot) | S-Abnahme |
| R-025 | Bauplan vs Werk unklar („erst fertigen") | gebaut | M2 „Bauplan/Werk ✓"-Zeile (Screenshot zeigt sie) — Plan→Werk ist KORREKT so | S-Abnahme |
| R-026 | Auseinanderziehen verbessert Werte | gebaut | M2 Σ-Substanz-Volumen (Exploit strukturell tot, GEMESSEN konstant) | S-Abnahme |
| R-027 | Vibe-Pass sichern / neuer PC / Duplizierung? | beantwortet | §0: Export/Import (R2-Geste); der Pass ist SCHLÜSSEL, kein Wert — Kopie dupliziert Identität, nicht Besitz. NEU als M9-Sprosse: Schlüssel-Verwahrung (Rotation/Widerruf-UX) (§8.8g) | M9 |
| R-028 | Modus-Wechsel bricht Ökonomie? Perpetuum? | beantwortet | Ω5 `freeBorn` + `diag-ledger-cycles` (kein Zyklus netto-positiv, GEMESSEN) | — |
| R-029 | Online-Übersicht Makrosystem | gebaut | M8 WS-Stats (smoke-bewiesen) | S-Abnahme |
| R-030 | Nutzern folgen / public vs privat | gebaut/teil | F4-Folgen + M8-Identitäts-Seite; PUBLIC=signiert+geteilt, PRIVAT=localStorage; Privatheits-STUFEN = M9-Sprosse | S-Abnahme + M9 |
| R-031 | Werkzeug-Abnutzung / Robustheit derselben Thematik | Entscheid | Gesamt-Abnahme 11.06.: ∞-Katalysator GILT (Erst-Wurf). Alternative wäre Mühe-Senke + „Reparieren"-Geste (taille-konform). Will der Schöpfer drehen → eigenes Wort hier eintragen (§8.8f) | W5 |
| R-032 | „Zu viel Reibung, du verlierst die Übersicht; Architektur synergetischer" | offen | GEMESSEN: 60'854 Zeilen / 4 Marker; 220 createElement·331 getElementById·54 innerHTML → Stamm-Atlas (W6) + UI-Puls (W3) + Frequenzband (W-E) + Ψ0/Ψ1 (§8.8a,c,f) | W6/W3/W-E |
| R-033 | Aufstiegs-Leiter = der Kern, der Gigant; „siehst du den Pfad?" | beantwortet/Plan | §3 + §8.6: die gewinnbaren Achsen (Schöpfungs-Emergenz · Souveränität) fühlbar machen statt alle Achsen; M9-Sprossen am Tisch | M9 |
| R-034 | „GTA/Fortnite/Minecraft/X in den Schatten" | beantwortet/Plan | §8.6/§8.8f: die ehrliche Matrix — Minecraft gewann 2011 keine Grafik, es ÖFFNETE eine Achse; unsere Achse ist gemessen real. v1.0-DoD inkl. Erste-5-Minuten-Geste + FPS-Sockel | v1.0-DoD |

## Korpus v1.1 — die SWOT-Inversionen (12.06., meister-plan §8.9)

| ID | Rückmeldung/Faden | Status | Wurzel/Form | Welle |
|---|---|---|---|---|
| R-035 | Souveränität beweisbar machen: jeder kann seinen Leuchtturm betreiben | offen | Ein-Befehl-Self-Host (beide Ein-Datei-Server) + SELF-HOST-Doku + Broker-Protokoll in die Taille-Spec + EN-Spiegel `taille-spec.en.md`; Föderation = M9-Sprosse (§8.9a/e) — die Angriffs-Inversion #1 | Leuchtturm-Welle (früh, parallel-fähig) |
| R-036 | Erklärbare Emergenz: „Warum ist mein Ding ein Trank?" | offen | „Warum?"-Chip an JEDER Rollen-Anzeige — top-3 Resonanz-Achsen mit Zahlen (die `_blueprintRoleGapHint`/Spektrum-Spur zu Ende; §8.9b) — die Angriffs-Inversion #2 | W-C (eingewoben) |
| R-037 | Typ-Sicherheit ohne Build/Split | offen | T-Welle: JSDoc + `// @ts-check` + `tsc --checkJs` als RATSCHEN-Band (Baseline messen, monoton fallend — nie ein Block; §8.9c) | nach W6 |
| R-038 | Pausierbarkeit als Eigenschaft + Probe | Prozess (sofort gültig) | Kaltstart-Probe = Prozess-Wand §8.7#5 (Session nach 90 Tagen kalt aufsetzbar?); Burnout-PHYSIK bleibt ehrlich Schöpfer-Domäne (§8.9d/g) | §8.7 |
| R-039 | Devlog/„Welle-Schau" gegen das Versanden | Entscheid | Schöpfer-Option: monatliche Welle-Schau („Mensch+KI bauen ein Ultiversum" ist Content, den es nicht gibt) — Audience-Arbeit darf das Bauen nicht fressen; Wort hier eintragen (§8.9f) | — |
| R-040 | Moderations-Haltung, falls je öffentlich | dokumentiert | „Welten sind Wohnzimmer, keine Marktplätze" (Klein-N + Einladungs-Welten) = bewusste Entscheidung GEGEN den öffentlichen Platz, kein Sieg über dessen Probleme (§8.9g) | M9-Kontext |

## Pflege-Regeln

1. Neue Rückmeldung → neue ID (fortlaufend), Roh-Wortlaut darf gekürzt, der SINN nie.
2. Status-Wechsel nur mit Beleg (Mess-Diag/Commit/S-Wort) — der Beleg steht in der Wurzel-Spalte.
3. „S-Abnahme"-Einträge sammeln sich zur nächsten Schöpfer-Browser-Runde; nach der Abnahme → Eintrag auf GESCHLOSSEN + Datum.
4. Ein abgelehnter Punkt bekommt **abgelehnt + Grund** — nie stilles Streichen (die GEMERKTEN-FÄDEN-Regel).
