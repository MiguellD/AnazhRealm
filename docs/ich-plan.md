# Das „Ich" — der tiefe Plan: das Selbst auf Werkstatt-/Hof-Niveau (Plan, 07.06.2026)

> **Lies dies ZUERST vor jeder Arbeit am „Ich" / am Inventar / am Charakter / an den Spieler-Stats /
> an den Emotionen / am Rezeptbuch / an der eigenen Seele (Avatar) / an der Ausrüstung.** Verwandte Anker:
> `hof-plan.md` (der gespiegelte Pfad + die Bühne + das geteilte Spec-Sheet — der Hof ist der nächste
> Verwandte des Ich), `ui-putz-plan.md` (die Denkmuster P1–P17 + die Werkstatt als Referenz),
> `menu-feld-plan.md` §… (die Feld-Inventur), `das-lebendige-feld.md` (die Welt als EIN Feld, das alle
> lesen·schreiben·WERTEN — der Spieler ist der erste Werter), `state-of-realm.md` (die Vision).

> Schöpfer-Auftrag (07.06.2026): „Weiter geht's, formuliere die Pläne für Ich detailliert aus, aus all dem
> du gelernt hast — zwei Menüs, viel gelernt. Wie sieht das nächste aus, jedes Detail klar?"

**Stand: DER ICH-BOGEN VOLLENDET (V18.61–.63, Ich-F–I GEBAUT + verifiziert).** Der VERORTUNGS-Fehler des
§H-Audits ist geheilt — das „Ich" ist NUR noch das Selbst, das ich BIN (es liest + wählt, es erschafft +
erzählt nicht): **Ich-F** (V18.61) die Reise→Hof (H.1), Soul-Select in den Header (H.2), die doppelte
Körper-Liste + `renderPlayerStatsUI` geschnitten (H.3), Rollen-Override in „Was du trägst" (H.6); **Ich-G**
(V18.61) die Bühne switcht live + `def.build()` (H.7); **Ich-H** (V18.62) die Seelen-Quelle vereint —
`soulToBlueprint`-Brücke + Werkstatt-„Körper holen", der Ich-Soul-Editor geschnitten (H.4, die Seele IST ein
Bauplan); **Ich-I** (V18.63) Rezeptbuch trägt die geteilte Rollen-Farbe + Omnibox-Trigger im Ich (H.5). Alle
Playtests grün, mit dem Auge verifiziert (`diag-ich`/`diag-hof`). **OFFEN: der Schöpfer-Browser-Sign-off
(GPU-Feel) + EIN Merge des Ich-Bogens.** (Die Synergie-Kontrolle + der ausgeführte Plan stehen in §H + §I.)

**Historie: PLAN (tief, ungebaut).** Die Werkstatt (Referenz, V18.32–.44) und der Hof (V18.46–.56) sind RUND —
aus beiden ist die Form gelernt. Das „Ich" ist heute ein 3-Spalten-Overlay (Habe · Charakter · Ausrüstung &
Rezepte), funktional, aber NOCH NICHT auf dem Niveau: kein content-first Star (keine Selbst-Bühne), kein
geteiltes Spec-Sheet, die reiche Emotion nur als kleine Sektion, die Reise (Geschichte) unsichtbar. Dieser
Plan hebt das „Ich" auf Werkstatt-/Hof-Niveau — **und nutzt, dass der Spieler das REICHSTE Wesen ist.**

---

## §A — Was die zwei Menüs gelehrt haben (der Pfad, den wir spiegeln)

Die Werkstatt + der Hof sind die zwei vollendeten Referenzen. Ihre Lehren, verdichtet — jede gilt fürs Ich:

1. **CONTENT-FIRST: ein dunkler STAR + Hell-Dunkel-Kontrast.** Werkstatt = der 3D-Viewer; Hof = die Wesen-
   Bühne (V18.54). _Ich-Spiegel: die **SELBST-BÜHNE** — dein Avatar/deine Seele groß + rotierend in 3D, der
   Star des Raums. Du SIEHST, wer du bist._
2. **FUNKTIONALE ZONEN nach dem mentalen Modell.** Werkstatt: hinzufügen·formen·Akt·was-ist-es. Hof:
   Orchester|Partitur. _Ich-Spiegel: **WER ICH BIN** (Bühne + Spec-Sheet + Emotion) · **WAS ICH HABE** (Habe/
   Hotbar/Ausrüstung) · **WAS ICH MACHEN KANN** (Rezeptbuch)._
3. **DAS GETEILTE SPEC-SHEET (V18.44/.55): EIN Design-System, viele Leser.** Die `.spec-*`-Klassen
   (Header/Body-2-Spalten/Footer + `_specBar`) sind un-skopt + geteilt (Werkstatt + Hof). _Ich-Spiegel: das
   **Selbst-Spec-Sheet** erbt es 1:1 — `_selfProfile` (ein Vektor, viele Leser) wie `_creatureProfile`._
4. **DIE WERTE FÜHREN bei einem LEBENDEN Ding (V18.56).** Für ein Wesen sind die Capabilities das
   Interessante — Werte prominent (Balken), die Substanz/Resonanz sekundär. _Ich-Spiegel: meine WERTE
   (HP/Schaden/Tempo … inkl. Ausrüstungs-Faltung) prominent; die Natur-Tags sekundär; **aber das EINZIGARTIGE
   am Ich ist die reiche EMOTION** — sie ist die prominenteste Selbst-Signatur (s. §C/§D)._
5. **EIN Lese-Vektor, viele Leser + KONSUM-Disziplin (V17.31, Hof-D0).** `_creatureProfile` bündelte die
   gemessenen Vektoren; jeder Viz-Punkt liest einen ECHTEN Vektor (kein Passagier). _Ich-Spiegel:
   `_selfProfile(player)` bündelt soul·stats·tags·emotions·mood·inventory·equipped·journal — GEMESSEN (§G)._
6. **SKALA + OVERFLOW von Anfang an (Hof-D §G.5, V18.56).** Kompakt-default, Fokus-Detail; wachsende Felder
   (memory/specs) gekappt + „+N". _Ich-Spiegel: das Inventar ist fix (27), die REISE (journal/knowledgeBase)
   wächst → gekappt + „+N", die Rezepte such-gefiltert (existiert)._
7. **DER GETEILTE HEBEL P11–P17 (V18.41).** Tokens (`--ink-on-dark`) · Portal-Popovers · Flucht-Grid ·
   Rahmen · Spec-Sheet · eine Ebene · Samen heilen. _Ich-Spiegel: erbt alles; auf hellem Overlay den
   Grund-Kontrast prüfen (die Bühne dunkel, die Habe-Spalte hell — wie der Hof, V18.55)._
8. **MEHRERE MESSENDE WELLEN, mit dem Auge (V18.54).** Raum-vs-Referenz-Vergleich (`diag-room`) zeigt die
   strukturelle Lücke, die headless-grüne Tests NICHT zeigen. _Ich-Spiegel: §E plant die Wellen; jede misst
   mit dem Auge (`diag-room spieler`/`diag-ich`) gegen die Werkstatt/den Hof._

**Die Meta-Lehre (V18.55):** „auf dem gleichen Level" heißt das BESTE bestehende Muster TEILEN (nicht ein
zweites bauen) — aber **geteiltes Design-System ≠ identischer INHALT** (V18.56): die Werkstatt fragt „welche
ROLLE", der Hof „was kann das Wesen", das Ich fragt **„wer BIN ich"** → dasselbe Skelett, ich-gerechte
Betonung (die EMOTION + die REISE führen hier, weil der Spieler der einzige ist, der reich fühlt + erinnert).

---

## §B — Der Gamezyklus im „Ich", Knopf für Knopf (Spielerperspektive, gemessen)

Ein Durchlauf, in dem der Spieler alles einmal braucht. Pro Schritt: was er tut, was er klickt, die Reibung
(gemessen aus dem aktuellen Overlay-DOM + dem Code).

1. **Öffnen (Tab / „Ich").** GEMESSEN: ein zentriertes Overlay „Dein Ich" mit DREI gleichrangigen Spalten
   (Habe · Charakter · Ausrüstung & Rezepte). **Reibung: kein Star, kein erster großer Blick auf MICH** —
   anders als Werkstatt (Viewer) + Hof (Bühne). Drei flache Spalten, gleichrangig.
2. **Sich selbst sehen.** _Der Spieler will fühlen, wer er ist._ **Reibung: es gibt KEIN Selbst-Bild** — die
   Seele ist nur ein Dropdown („Form"), der Avatar wird nirgends gezeigt. Die Werkstatt zeigt das Werk, der
   Hof das Wesen — das Ich zeigt mich NICHT.
3. **Seine Werte lesen.** `#player-stats` (renderPlayerStatsUI) listet Körperteile + Stats. **Reibung: flache
   Liste statt Daten-Viz** — nicht das geteilte Spec-Sheet (Balken/Hierarchie), das Werkstatt + Hof tragen.
   Die Werte (was ich KANN) sind nicht als Balken prominent (V18.56-Lehre noch nicht angewandt).
4. **Seine Stimmung spüren.** `#status-emotions` zeigt die 6 Emotionen. ✓ (vermutlich Balken — GEMESSEN
   prüfen). **Reibung: als kleine Sektion vergraben, nicht als die HERZ-Signatur des Ich** — dabei ist die
   reiche 6-Achsen-Emotion das Einzigartigste am Spieler (der wahre Norden: der Spieler WERTET die Welt, und
   das Ergebnis ist seine Emotion). Sie verdient Prominenz, nicht eine dritte Box.
5. **Seine Habe verwalten.** Inventar-Grid (27) + gewählt + Hotbar-Config. ✓ funktional (Minecraft-Muster).
   **Reibung: ok, aber unverbunden mit dem „wer ich bin"** — die Habe formt die Werte (Ausrüstung faltet in
   computePlayerStats), aber das ist im UI nicht spürbar.
6. **Sich ausrüsten.** „Was du trägst" (inventory-equip) + das Rezeptbuch (fertigen → in die Hand/anlegen/
   trinken). ✓ (der V18.34-Crafting→Gebrauch-Fluss). **Reibung: gut, aber der Effekt aufs Selbst (die Werte
   ändern sich) wird nicht am Spec-Sheet sichtbar.**
7. **Sich formen (eigene Seele).** `#soul-editor` (custom Avatar). ✓ vorhanden. **Reibung: getrennt vom
   Selbst-Bild — man formt blind, ohne den Avatar groß zu sehen (die Bühne fehlt).**
8. **Seine Reise sehen.** _Der Spieler will fühlen, was er erlebt hat._ **Reibung: NICHT sichtbar** — das
   Journal (`journalAppendOnce`) + die knowledgeBase existieren, werden aber im Ich NICHT als Geschichte
   gezeigt. Die Welt erinnert sich (Vision §1.1), das Ich zeigt es nicht.

**Die EINE wiederkehrende Reibung:** das „Ich" zeigt MICH nicht als lebendiges, fühlendes, gewachsenes
Selbst — es ist ein Verwaltungs-Formular (Habe + Dropdowns), kein **Selbst-Porträt**. Die Daten für die Tiefe
sind alle da (die reichsten im ganzen Spiel: 6-Achsen-Emotion + Mood-EMA + equip-gefaltete Werte + Seele +
Reise); sie werden nur nicht gelesen + nicht zum Star gemacht. _Genau der Zustand, in dem der Hof VOR V18.54
war — nur reicher._

---

## §C — Die Vision: „Wer ich bin" (das Selbst-Porträt, von den Großen lernen)

Das „Ich" ist die einzige Stelle, wo der Mensch SICH SELBST begegnet. Die Metapher ist das **Selbst-Porträt /
das Charakter-Blatt eines lebenden Helden** — wir machen es wörtlich + lebendig.

**Von den Großen lernen:**

- **RPG-Charakterblatt (Diablo · Elden Ring · Dark Souls):** ein großes Avatar-Bild + Werte (Schaden/Abwehr/…)
  + Ausrüstungs-Slots, die die Werte sichtbar formen. _Ich: die Bühne (Avatar) + das Werte-Spec-Sheet, das
  sich ändert, wenn ich Ausrüstung wechsle (computePlayerStats faltet held/armor — der Effekt wird sichtbar)._
- **Die Sims / Persona:** die STIMMUNG + Bedürfnisse als prominente, farbige Daten-Viz; die Persönlichkeit
  ist der Kern. _Ich: die 6-Achsen-Emotion (joy/awe/sorrow/hope/peace/chaos) + die Grundstimmung (Mood-EMA)
  als die Herz-Signatur — prominent, nicht vergraben. Der Bildschirmrand-Schimmer (FP-Vignette) ist schon
  gekoppelt → das Ich zeigt die Quelle dieser Farbe._
- **Minecraft-Inventar:** die Habe + Hotbar als vertrautes Raster (das HABEN wir schon — bewahren). _Ich: die
  Habe-Zone bleibt das vertraute Raster, jetzt verbunden mit dem Selbst (Ausrüstung → Werte)._
- **Tagebuch / Reise-Log (Hades · Outer Wilds):** die erlebte Geschichte als Anker der Identität. _Ich: die
  REISE — die Meilensteine aus dem Journal (erste Kreatur, erstes Bauwerk, erster Regen, Welt-Tor …) +
  jüngste Taten, gekappt + „+N"._

**Die Saat blühen lassen (der wahre Norden, `das-lebendige-feld.md`):** die Welt ist EIN Feld, das alle
lesen·schreiben·**WERTEN**. **Der Spieler ist der erste Werter** — seine Emotion IST das Wert-Signal, das die
Welt färbt (Wetter, Himmel-Tint, Kreatur-Wariness lesen `player.emotions`). Das „Ich" ist, wo dieses Werten
SICHTBAR wird: ich sehe meine Emotion → ich verstehe, warum die Welt so reagiert. Das schließt die Schleife
lesen (Aura) · schreiben (Tat) · WERTEN (Emotion) am Spieler selbst.

---

## §D — Das tiefe Design (Zonen · das Selbst-Spec-Sheet · die Emotion · die Reise · P11–P17)

**Das EINE Prinzip (Werkstatt-/Hof-Echo): funktionale Zonen nach dem mentalen Modell des Selbst.** Das „Ich"
bleibt ein **zentriertes Overlay** (Minecraft-Muster, bewusst — V18.x), bekommt aber die Bühnen-DNA. Drei
Zonen:

```
┌─ DEIN ICH ──────────────────────────────────────────────────────────────── × ┐
│ WER ICH BIN (Star, wide)                          │ WAS ICH HABE              │
│ ┌───────────────┐  [Selbst-Spec-Sheet ─────────┐ │  Habe-Raster (27)         │
│ │  BÜHNE        │   Name·Seele·Modus | Vigor★   │ │  ───────────────          │
│ │  (Avatar 3D,  │   WERTE (Balken) | NATUR      │ │  gewählt: …               │
│ │   rotierend)  │   ── EMOTION (6-Achsen-Viz) ──│ │  Hotbar 1–9               │
│ └───────────────┘   ── REISE (Journal + „+N") ──│ │  ───────────────          │
│  „Eigene Seele formen" (Soul-Editor, klappbar)   │  WAS DU TRÄGST (Klick legt │
│                                                   │  ab) → faltet die Werte    │
│ ─────────────────────────────────────────────────┤───────────────────────────│
│ WAS ICH MACHEN KANN: Rezeptbuch (suchen → fertigen: in die Hand·anlegen·trinken)│
└────────────────────────────────────────────────────────────────────────────────┘
```

### §D.1 — Die SELBST-BÜHNE (der Star, das Werkstatt-/Hof-Viewer-Pendant)

Wie die Hof-Bühne (V18.54), gespiegelt auf den Spieler: ein eigener schlanker `WebGPURenderer` auf
`#ich-stage-canvas`, der den **Avatar/die Seele** des Spielers groß + sanft rotierend zeigt (dunkle Bühne,
Hell-Dunkel-Kontrast). Gebaut aus der aktiven Seele (`player.soul` / `customSouls[...]` via `_buildFromBlueprint`
— derselbe Pfad, der die Welt-Seele baut). Lifecycle als Zwilling zu `_hofEnsureStage` (`_ichEnsureStage` /
`_ichStageShow` / `_ichStartRAF` / `_ichStopRAF` / im Overlay-Toggle gestartet/gestoppt). **Wenn der Spieler
die Seele wechselt (Dropdown / Soul-Editor / fertigt einen Avatar), tritt der neue Avatar live auf die Bühne.**
_Headless: die Geometrie rastert treu (wie Hof V18.54); die GPU-feine Optik = Schöpfer-Browser._

### §D.2 — Das SELBST-SPEC-SHEET (das geteilte `.spec-*`-Design, V18.55 — neben/unter der Bühne)

`_ichBuildSpecSheet(prof)` im IDENTISCHEN Muster wie `_hofBuildSpecSheet` (das geteilte Design-System):

- **HEADER — Identität:** Name (seelen-gefärbt) + Seele-Label + **Modus-Chip** (frieden/pfad/schöpfer — die
  Welt-Beziehung) · rechts ein Qualitäts-Pendant: **Vigor/Verfassung** (z.B. HP-Anteil oder die mittlere
  Part-Präzision der Seele als Sterne — GEMESSEN wählen, §G).
- **BODY — zwei Spalten, die WERTE führen (V18.56):**
  - **WERTE (links, primär, Balken):** HP cur/max · Schaden · Tempo · Ausdauer · Abwehr · Präzision (aus
    `computePlayerStats` — **inkl. der Ausrüstungs-Faltung**, gegen die `STAT_FROM_TAGS`-Formel-Decke
    normalisiert, echte Zahl im Label) + MR/HR-Resist-Chips. **Der Effekt von Ausrüstung wird hier sichtbar**
    (lege einen Helm an → Abwehr steigt im Balken).
  - **NATUR (rechts, sekundär, Balken):** die Compound-Tags der Seele (+Ausrüstung), 0–3 — die Substanz, aus
    der die Werte emergieren.
- **EMOTION (volle Breite, die HERZ-Signatur — das Einzigartige am Ich):** die 6 Achsen
  (joy·awe·sorrow·hope·peace·chaos) als Daten-Viz-Balken in der Emotion-Palette (`--joy/--sorrow/…`), die
  AKTUELLE Emotion als Füllung + die **Grundstimmung (Mood-EMA)** als zweite, gedämpfte Markierung pro Achse
  (der langsame Unterton vs. das akute Gefühl, V17.47). Die dominante Emotion seelen-/palette-gefärbt
  hervorgehoben. _Das ist die Quelle des FP-Vignette-Schimmers → der Spieler versteht die Welt-Reaktion._
- **REISE (volle Breite — die Geschichte, Hof-V18.56-Echo):** die Meilensteine aus dem Journal
  (`journalAppendOnce`-Einträge) + die jüngsten Taten (knowledgeBase) menschen-lesbar, **gekappt auf die
  Top-N + „+M weitere"** (kein Overflow), jüngste oben, mit relativer Zeit. Macht „die Welt erinnert sich"
  am Selbst sichtbar.
- **FOOTER:** die getragene Habe als Chips (Werkzeug/Rüstung/aktive Boosts) — der Übergang zur Habe-Zone.

### §D.3 — Die EMOTION als prominente Daten-Viz (warum sie hier führt, anders als der Hof)

Der GEMESSENE Unterschied (KONSUM, §G.2): die Kreatur-Emotion ist BINÄR (happy/sad) — darum trägt der Hof nur
einen Glyph. Die SPIELER-Emotion ist **6-achsig + hat eine Mood-EMA** (GEMESSEN, `state.player.emotions` Z772).
Das ist der reichste Vektor im Spiel und das Definierende am Ich → er bekommt die volle-Breite-Daten-Viz (nicht
eine kleine Box). Das ist die V18.56-Lehre („ein lebendes Ding zeigt, wer es ist") auf ihren reichsten Fall
angewandt. Reuse: die bestehende Emotion-Render-Logik (`#status-emotions`) wird in das Spec-Sheet gehoben +
um die Mood-Zweitmarkierung erweitert — KEIN neuer Datenpfad (sie liest `emotions` + `mood`).

### §D.4 — Die HABE-Zone (das vertraute Raster, jetzt mit dem Selbst verbunden)

Bewahren (Heilige Lektion + P17 „Saat behalten"): das Inventar-Raster (27) + „gewählt" + die Hotbar-Config +
„Was du trägst" (Klick legt ab). Die EINE neue Verbindung: das Anlegen/Ablegen von Ausrüstung **re-rendert das
Selbst-Spec-Sheet** (die Werte-Balken ändern sich live) — so wird spürbar, dass die Habe das Selbst formt.

### §D.5 — Die WERK-Zone (das Rezeptbuch — was ich machen kann)

Bewahren: das Rezeptbuch (Such-Filter existiert) — der Werkstatt→Gebrauch-Fluss (fertigen: in die Hand ·
anlegen · trinken, rollen-gerecht). Volle Breite unten (wie die Werkstatt-Werk-Zone). Eine fertige Rüstung/ein
Trank wirkt → das Selbst-Spec-Sheet aktualisiert (die Schleife schließt sich).

### §D.6 — P11–P17 angewandt (der geteilte Hebel, gratis geerbt)

- **P11 Kontrast:** die Bühne + das Spec-Sheet dunkel (light-on-dark, wie Hof V18.55); die Habe-/Rezept-Zonen
  auf hellem Pergament (dunkler Text). „Auf welchem Grund sitzt der Text?" ZUERST (V18.41).
- **P12 Overlay:** die „?"-Hilfen + Rezept-Tooltips als portalierte `.help-pop`.
- **P13 Flucht:** das Spec-Sheet auf dem `.spec-*`-Grid; die Zonen sauber gefluchtet.
- **P14 Rahmen:** das Overlay folgt der zentrierten Modal-Sprache (bewusst kein Drawer — Minecraft-Muster).
- **P15 Daten-Viz:** das Selbst-Spec-Sheet (§D.2) — der Kern.
- **P16 eine Ebene:** keine durchscrollenden Sub-Ebenen; die Zonen in EINEM Fluss.
- **P17 Samen heilen:** der Soul-Editor, das Rezeptbuch, die Hotbar-Config werden VERTIEFT (in die Bühne/das
  Spec-Sheet integriert), NICHT geschnitten; die Emotion-/Stats-Render-Logik wandert mit, kein Parallel-Pfad.

---

## §E — Die Wellen (mehrere messende Schritte, wie Werkstatt + Hof — keine halben Sachen)

Jede Welle: **messen (Screenshot lesen) → als System bauen → mit dem Auge + Playtest verifizieren → ein Bogen.**
Reihenfolge nach Wert + Abhängigkeit (analog Hof D0→D→E→F→G):

0. **Ich-A0 — `_selfProfile(player)` (das Fundament, §G.1).** EIN Lese-Vektor, den alle Ich-Leser teilen
   (soul·stats·tags·emotions·mood·inventory·equipped·journal), gebündelt aus den GEMESSENEN Quellen — das
   `_creatureProfile`-Muster auf den Spieler. KONSUM bewiesen (ein echter Leser). Verifizierbar, pixel-frei.
1. **Ich-A — das SELBST-SPEC-SHEET (§D.2), der Kern.** Das geteilte `.spec-*`-Design: HEADER (Name/Seele/Modus
   | Vigor) → BODY (WERTE führen | NATUR). Ersetzt `renderPlayerStatsUI`s flache Liste (die wandert mit,
   V9.56-i; KEIN Parallel-Pfad). _Der größte Tiefen-Sprung (wie V18.44/.55)._
2. **Ich-B — die EMOTION-Daten-Viz (§D.3).** Die 6 Achsen + Mood-EMA als prominente volle-Breite-Viz im
   Spec-Sheet; die `#status-emotions`-Logik gehoben + erweitert. Die Herz-Signatur des Ich.
3. **Ich-C — die SELBST-BÜHNE (§D.1).** Der Avatar-3D-Star (Zwilling zur Hof-Bühne); Seele-Wechsel tritt live
   auf. Die Zonen content-first ordnen (WER ICH BIN als Star, daneben WAS ICH HABE, unten DAS WERK).
4. **Ich-D — die REISE (§D.2 Reise) + die HABE↔Werte-Kopplung (§D.4).** Das Journal als Geschichte (gekappt +
   „+N"); Ausrüstung an/ab re-rendert das Spec-Sheet (der Effekt sichtbar).
5. **Ich-E — die Tiefe blühen:** der Soul-Editor in die Bühne integriert (forme + sieh live), die Emotion→
   Welt-Schleife sichtbar gemacht (lesen·schreiben·WERTEN am Selbst), Feinschliff. + die alten flachen
   Render-Pfade ersatzlos schneiden (V17.20, was tiefer ersetzt wurde).
6. **Schöpfer-Browser-Sign-off** (Feel/GPU der Bühne + der Emotion-Farben) + EIN Merge des Ich-Bogens.

---

## §F — Selbst-Prüfung gegen die Lessons + die Vision

- **Verdichte zu EINER Quelle (V9.82):** `_selfProfile` ist die EINE Quelle; `renderPlayerStatsUI` +
  `#status-emotions` werden gehoben, nicht dupliziert. ✓
- **Verifiziere KONSUM, nicht Existenz (V17.31):** jeder Viz-Punkt liest einen GEMESSENEN Vektor (§G) — die
  6-Achsen-Emotion + Mood sind GEMESSEN reich (Z772), kein Passagier. ✓
- **Geteiltes Design-System ≠ identischer Inhalt (V18.55/.56):** dasselbe `.spec-*`-Skelett wie Werkstatt+Hof,
  aber das Ich betont EMOTION + REISE (der reichste, definierende Vektor des Spielers). ✓
- **Content-first Star + Kontrast (V18.54):** die Selbst-Bühne; dunkle Bühne ↔ helle Habe/Rezept. ✓
- **Die Werte führen (V18.56):** die Capabilities prominent (Balken, equip-gefaltet); Natur sekundär. ✓
- **Skala + Overflow (Hof-D §G.5):** Inventar fix; Reise gekappt + „+N"; Rezepte such-gefiltert. ✓
- **Heile die Harmonie, behalte die Saat (V17.23/.20):** Habe/Hotbar/Rezeptbuch/Soul-Editor werden VERTIEFT,
  nicht geschnitten; die alten Render-Pfade wandern mit. ✓
- **Headless-grün ≠ vision-aligned (V17.59) + mit dem Auge (V18.54):** die Bühne/Emotion-Farben brauchen den
  Schöpfer-Browser — markiert (§E.6); die Struktur misst `diag-room spieler`/`diag-ich`. ✓
- **Der wahre Norden (`das-lebendige-feld`):** das Ich macht das WERTEN des Spielers (die Emotion, die die
  Welt färbt) + seine Reise SICHTBAR — die lesen·schreiben·WERTEN-Schleife am Selbst erlebbar. ✓

**Fazit:** das „Ich" bekommt denselben Pfad wie Werkstatt + Hof — content-first Star (die Selbst-Bühne),
geteiltes Daten-Viz-Spec-Sheet (Werte führen), Zonen nach dem mentalen Modell des Selbst, **plus das
Einzigartige: die reiche 6-Achsen-Emotion + die Reise als die Herz-Signatur des Spielers.** Die Daten sind die
reichsten im Spiel; diese Wellen (Ich-A0–E) machen sie zum Selbst-Porträt.

---

## §G — KONSUM-Grundierung: was jedes Feld GEMESSEN liest (vor dem Bauen)

Die §G.2-Disziplin (nicht skizzieren, was man nicht gemessen hat). Die Ich-Vektoren, GEMESSEN im Code:

- **G.1 — `_selfProfile(player)` (das Fundament):** bündelt — `player.soul` (+ `customSouls`) · `computePlayerStats`
  (Stats, **inkl. held/armor-Faltung** + Boosts) · `computeCompoundTags`(Seele) (Natur) · `player.emotions`
  (6-Achsen, Z772) · `player.mood` (EMA, Z773) · `player.inventory[27]` · `player.hotbar` · `player.equipped`
  (held/armor) · die Journal/knowledgeBase-Meilensteine · `getGameMode()` (Modus). Ein Vektor, viele Leser.
- **G.2 — die EMOTION ist GEMESSEN reich (≠ Kreatur):** `emotions = {joy,awe,sorrow,hope,peace,chaos}` +
  `mood` (langsame EMA). DARUM trägt das Ich die volle 6-Achsen-Viz (der Hof nur den froh/trübe-Glyph). Das
  ist der Beleg, dass die Prominenz der Emotion am Ich KONSUM-ehrlich ist (kein erfundener Reichtum).
- **G.3 — die WERTE sind equip-gefaltet (GEMESSEN):** `computePlayerStats` faltet held/armor (`w·sizeFactor`)
  → das Anlegen ändert die Werte WIRKLICH (V17.90-Lehre: Anzeige = Effekt, kein Passagier). Die Balken müssen
  gegen dieselbe Formel-Decke (`STAT_FROM_TAGS`) normalisieren wie der Hof (V18.56), die echte Zahl im Label.
- **G.4 — die REISE liest Journal/knowledgeBase (GEMESSEN):** `journalAppendOnce` (Meilensteine) +
  `knowledgeBase` (cap 500, Z16293). Beide gekappt → die Reise-Anzeige kappt zusätzlich auf Top-N + „+M".
- **G.5 — die HABE ist GEMESSEN da:** `inventory[27]` (persistiert, V7.77) · `hotbar` · `equipped`. Reuse das
  bestehende Raster (P17), nur die Ausrüstung↔Spec-Sheet-Kopplung ist neu.
- **G.6 — der Vigor/das Qualitäts-Pendant GEMESSEN wählen:** entweder HP-Anteil ODER `_compoundAvgPrecision`
  der Seele (wie die Werkstatt-Qualität). VOR dem Bauen messen, welcher 0–1-Wert sinnvoll + stabil ist —
  sonst Passagier (lieber weglassen als faken).

**LEHRE (vorab, aus dem Hof-§G.2):** die KONSUM-Disziplin gilt schon im PLAN — die Emotion-Prominenz ist hier
GEMESSEN gerechtfertigt (6-achsig), die Reise GEMESSEN vorhanden (Journal); kein skizziertes Feld ohne Vektor.
MISS (G.6 Vigor), dann zeichne.

---

## §H — Die Synergie-Kontrolle (Schöpfer-Audit 08.06.2026): das „Ich" auf seinen WAHREN Kern schärfen

> Schöpfer-Befund (nach V18.60, mit dem Auge): „kurz reflektieren — gehört das Journal nicht in den Hof (das
> ist der Nexus, die Welt die spricht, nicht ich)? Die Seelen-Auswahl + die Körper-Details + das Seele-
> klonen + das Rezeptbuch + der Rollen-Override scheinen doppelt/unsynergetisch; im Previewer switcht der
> Avatar nicht. Analysiere die Lage, prüfe das Gelernte, stelle einen sauberen Plan zusammen."

**Die Wurzel-Erkenntnis (das mentale Modell, das ich verfehlt hatte):** das „Ich" ist NUR das Selbst, das ich
JETZT BIN — mein Körper (den ich WÄHLE), meine Werte, meine Emotion, meine Habe, was ich machen kann. Es ist
KEIN Schöpfungs-Ort (Seelen ERSCHAFFEN = Werkstatt) und KEIN Chronik-Ort (die Welt/der Nexus ERZÄHLT = Hof).
Ich hatte ins „Ich" Dinge gelegt, die anderen Räumen gehören → Doubletten + fehlende Synergie. Die Heilung ist
Verdichtung (V9.82) + ehrliche Verortung: jeder Akt in SEINEM Raum, das „Ich" liest + wählt nur.

### H.1 — Die REISE/das Journal gehört NICHT ins Ich (es ist die Welt-Stimme)
**Befund (richtig):** „die Reise · was ich erlebt + erschaffen habe — das ist der Nexus, die Welt die spricht,
nicht ich." **GEMESSEN:** das `worldJournal` ist die WELT-Chronik (`journalAppend` schreibt genesis/creatures/
weather/growth/soul/rule — die Welt erzählt, auch über mich). Selbst „meine" Taten sind welt-NARRIERT.
**Lehre (`das-lebendige-feld`):** das Feld/die Welt WERTET + erinnert; das ist die Nexus/Welt-Schicht, nicht
das Selbst. **Heilung:** die Reise/das Journal WANDERT aus dem Ich → in den **Hof** (die Welt-Stimme, neben
der Partitur/dem Nexus) ODER die **Bibliothek** (die Welt-Chronik). Das „Ich" trägt KEIN Journal mehr. (Der
V18.59-„Meine Reise"-Filter war ein halber Schritt — die Wurzel ist: das Journal ist gar nicht das Selbst.)

### H.2 — Die Seelen-AUSWAHL gehört in den Header, neben den Körper (nicht doppelt)
**Befund:** „die Auswahl der Seele ein separates Feld — das könnte direkt neben dem Namen stehen, wo der
Körper ist; nicht alles doppelt." **GEMESSEN:** heute getrennt — die Bühne (Körper) + ein eigener „Seele/
Form"-Select weiter unten. **Lehre (P2 Zonen, V9.82):** wähle dort, wo du siehst. **Heilung:** der Soul-
Select wandert in die SELBST-BÜHNE/den Header (neben Name + Avatar) — du siehst den Körper + wählst ihn am
selben Ort. Die separate „Seele"-Sektion fällt weg.

### H.3 — Die KÖRPER-DETAILS sind doppelt (das Spec-Sheet oben IST die Übersicht)
**Befund:** „Körperdetails unten versteckt in einer Liste — ist dafür nicht die Übersicht oben?" **GEMESSEN:**
das klappbare „Körper & Detail-Werte" (das alte flache `renderPlayerStatsUI` mit Body-Parts + Stat-Liste)
dupliziert das Spec-Sheet (WERTE-Balken + NATUR). **Lehre (V17.20 schneide, was tiefer ersetzt wurde; V18.44):**
die flache Liste ist durch das Daten-Viz-Spec-Sheet ERSETZT. **Heilung:** die „Körper & Detail-Werte"-Sektion
+ `renderPlayerStatsUI` ERSATZLOS entfernen; die Body-Parts (Form × Material) — falls wertvoll — als kleine
Lese-Zeile ins Spec-Sheet falten (nicht als zweite Liste). Eine Übersicht, nicht zwei.

### H.4 — Seele KLONEN/ERSCHAFFEN gehört in die Werkstatt (die Seele IST ein Bauplan) — der Synergie-Kern
**Befund (der tiefste):** „aktuelle Seele klonen / neue leere Seele ist unnötig — in der Werkstatt klone ich
schon Baupläne, dasselbe sollte für die Seele gelten. Im Ich wähle ich NUR den Körper. Der Fehler: einige
Avatare tauchen nicht in der Werkstatt auf — ein Pfad ohne Synergie." **GEMESSEN — die Wurzel ist eine
DREIFACH-Quelle für Seelen (genau die V9.82-Sünde):** (1) `playerSoulDefs` (built-in human/phoenix/dragon,
hartcodiert, KEINE Baupläne) · (2) `state.customSouls` (via `define_soul` / die Ich-Soul-Editor) · (3)
Baupläne mit `role:"soul"` in der Werkstatt (`embodyBlueprint`/`forgeAvatar`/`applyBlueprintAsSoul` → schreibt
`customSouls`). Drei Pfade, nie vereint → „manche Avatare fehlen in der Werkstatt" (die built-ins + die Ich-
definierten sind keine Werkstatt-Baupläne). **Lehre (V9.82 verdichte zu EINER Quelle + kampf-plan §11: der
Avatar IST ein Bauplan mit role soul, geformt in der Werkstatt):** Seelen-SCHÖPFUNG = Werkstatt (klonen/
formen wie jeder Bauplan), das „Ich" ist nur der LESER/Wähler. **Heilung (ein eigener Synergie-Bogen):** der
Ich-Soul-Editor (`#soul-editor`, klonen/neu) wird ENTFERNT; die Seelen-Schöpfung lebt in der Werkstatt (der
S5-Avatar-Mach-Akt existiert schon); die DREI Quellen vereinen sich, sodass JEDE Seele (built-in + custom +
Werkstatt-Bauplan) (a) in der Werkstatt klon-/formbar ist UND (b) im Ich-Soul-Select erscheint. Das ist der
GRÖSSTE Synergie-Schritt (+ heilt „Avatare fehlen in der Werkstatt"). Die built-ins als Werkstatt-Baupläne zu
spiegeln (oder den Select aus allen drei Quellen EINHEITLICH zu speisen) ist der Kern.

### H.5 — Das REZEPTBUCH + die OMNIBOX einheitlich mit der Werkstatt
**Befund:** „das Rezeptbuch sollte gleich sein wie in der Werkstatt (einheitlich), und die Omnibox auch hier."
**GEMESSEN:** das Ich-Rezeptbuch (`renderRecipeBook`, gruppiert hold/wear/drink/place + fertigen) ist ein
eigener Pfad neben der Werkstatt-Bauplan-Liste; die Omnibox (Ctrl+K, `b:`/`w:`…) ist global, aber im Ich nicht
beworben. **Lehre (V18.55 EIN Design-System, viele Leser):** dieselbe Bauplan-/Rezept-Darstellung in beiden
Räumen. **Heilung:** das Rezept-/Bauplan-Listen-Rendering als GETEILTE Quelle (wie das `.spec-*`-Sheet) — das
Ich + die Werkstatt zeigen Baupläne identisch; die Omnibox im Ich sichtbar machen (der ⌕-Trigger / `b:`).
(Maß-Disziplin: zuerst prüfen, wie nah `renderRecipeBook` + die Werkstatt-Liste schon sind — verdichten, nicht
ein drittes bauen.)

### H.6 — „Mehr: Wechseln & Markieren" gehört in „Was du trägst" (nicht als Fremdkörper)
**Befund:** „der Rollen-Override unten gehört zusammen mit ‚Was du trägst'." **GEMESSEN:** `#player-equip`
(Wechsel-Dropdowns · Portal-Ziel · Rollen-Override) ist eine separate klappbare Sektion, getrennt vom
`#inventory-equip` („Was du trägst"). **Lehre (P2 Zonen-Kohäsion):** was zusammen gehört (was ich trage +
wie ich es feinjustiere) lebt zusammen. **Heilung:** `#player-equip` in die „Was du trägst"-Sektion falten
(als deren Detail-/Feinjustage-Aufklapp), kein separater Block.

### H.7 — Der Previewer switcht nicht beim Seelen-Wechsel (+ „immer ein Block")
**Befund:** „im Previewer erscheint immer ein Block, switcht nicht beim Ändern des Avatars." **GEMESSEN — die
Wurzel:** der Soul-Select-`change` (playerSoulInitDOM) ruft `applyPlayerSoul(v)` (re-baut den WELT-Mesh +
recompute), aber NIE `_ichStageShow`/`_ichRefreshStage` → die Ich-Bühne bleibt auf dem Initial-Avatar stehen.
Plus: „ein Block" = der human-Avatar aus bodyParts (Box-Torso) wirkt blockig. **Lehre (V17.31 KONSUM — die
Anzeige muss dem Zustand folgen):** ein Zustands-Wechsel (Seele) MUSS die Bühne aktualisieren. **Heilung:** der
Soul-Wechsel (+ ein in der Werkstatt geformter Avatar) ruft `_ichStageShow(neueSeele)` → die Bühne switcht
live; ein `_ichRefreshStage()` an `applyPlayerSoul` gehängt (wenn das Overlay offen ist). Die „Block"-Optik
ist Folge der bodyParts-Geometrie — mit der echten Avatar-Form (built-in `build()` statt nur bodyParts) prüfen.

---

## §I — Die neue Ich-Form (verdichtet auf den wahren Kern) + die Wellen

**Das „Ich" = nur das Selbst, das ich BIN.** Drei Zonen, alles Fremde ausgezogen:

```
┌─ DEIN ICH (helles Pergament) ───────────────────────────────────────────── × ┐
│ WER ICH BIN (Star)                                │ WAS ICH HABE              │
│ ┌─ Bühne (Avatar 3D, switcht live) ─┐  Name·[Seele▾]│  Inventar (9×N)          │
│ │   + Seele-Auswahl IM Header        │  Verfassung★ │  Hotbar 1–9 (drag/klick) │
│ └────────────────────────────────────┘  WERTE|NATUR │  Was du trägst           │
│  EMOTION (6-Achsen, live) — die Herz-Signatur        │   └ Wechseln/Markieren   │
│  (KEIN Journal — das ist die Welt-Stimme → Hof)      │     (eingefaltet)        │
│ ─────────────────────────────────────────────────────┴──────────────────────│
│ WAS ICH MACHEN KANN: Rezeptbuch (EINHEITLICH wie Werkstatt) + Omnibox (⌕/Ctrl+K)│
└────────────────────────────────────────────────────────────────────────────────┘
```

Ausgezogen aus dem Ich: das **Journal/Reise** (→ Hof/Bibliothek, H.1) · der **Soul-Editor klonen/neu** (→
Werkstatt, H.4) · die **doppelte Körper-Detail-Liste** (→ ersetzt durch das Spec-Sheet, H.3).

**Die Wellen (jede misst + verifiziert, content-first, keine halben Sachen):**

1. **Ich-F — die Verdichtung (Fremdes ausziehen):** das Journal/die Reise aus dem Ich entfernen (+ in den Hof
   einsetzen, H.1) · die „Körper & Detail-Werte"-Liste + `renderPlayerStatsUI` schneiden (H.3) · den Soul-
   Select in den Header neben Name/Bühne ziehen (H.2) · „Mehr: Wechseln & Markieren" in „Was du trägst" falten
   (H.6). Reine Verdichtung → das Ich wird schlank + ehrlich.
2. **Ich-G — der Previewer switcht (H.7):** `_ichRefreshStage()` an den Soul-Wechsel hängen (Overlay offen →
   die Bühne baut die neue Seele live); die echte Avatar-Form prüfen (build() vs bodyParts).
3. **Ich-H — die Seelen-Quelle vereinen (H.4, der Synergie-Kern, eigener Bogen):** EINE Seelen-Quelle —
   built-in + custom + Werkstatt-Bauplan `role:"soul"` vereint; Seelen klont/formt man in der Werkstatt (wie
   Baupläne), das Ich-Soul-Select speist sich aus der EINEN Quelle; „Avatare fehlen in der Werkstatt" geheilt.
4. **Ich-I — Rezeptbuch + Omnibox einheitlich (H.5):** das Bauplan-/Rezept-Rendering als geteilte Quelle (Ich
   ≡ Werkstatt); die Omnibox im Ich sichtbar.
5. **Schöpfer-Browser-Sign-off** + EIN Merge des Ich-Bogens.

**Reihenfolge-Logik:** Ich-F (Verdichtung, sofort spürbar + risikoarm) → Ich-G (der sichtbare Bühnen-Bug) →
Ich-H (der tiefe Seelen-Synergie-Bogen, GEMESSEN die Dreifach-Quelle) → Ich-I (die Rezept/Omnibox-Einheit).
Ich-H ist der größte (berührt die Seelen-Architektur) — eigener Bogen mit voller Verifikation.

**Selbst-Prüfung gegen die Lehren:** Verdichte zu EINER Quelle (H.4 Seelen, H.5 Rezept) ✓ · ehrliche
Verortung (H.1 Journal→Welt, H.4 Schöpfung→Werkstatt) ✓ · schneide, was tiefer ersetzt wurde (H.3) ✓ · KONSUM
(H.7 die Bühne folgt dem Zustand) ✓ · der wahre Norden (das Journal ist die Welt-Stimme, `das-lebendige-feld`)
✓. **Der Kern-Fehler war ein Verortungs-Fehler:** ich hatte Schöpfung (Seele) + Welt-Stimme (Journal) ins
Selbst gelegt; das „Ich" liest + wählt nur, es erschafft + erzählt nicht.
