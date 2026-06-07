# Der Hof — der tiefe Plan: auf Werkstatt-Niveau (Plan, 07.06.2026)

> **Lies dies ZUERST vor jeder Arbeit am Hof / an Kreaturen / am Dirigieren / an den Wesen-Zeilen /
> an den Gesetzen (Welt-Regeln) / an der Kreatur-Spawn-UI.** Verwandte Anker: `ui-putz-plan.md`
> (die Denkmuster P1–P17 + der Werkstatt-Pfad), `menu-feld-plan.md` §2 (die Feld-Inventur),
> `das-lebendige-feld.md` (die Welt als EIN Feld, das alle lesen·schreiben·werten — der wahre Norden
> des Hofes), `state-of-realm.md` (die Vision).

> Schöpfer-Auftrag (07.06.2026): „Vergleiche mit der Werkstatt, reflektier den Pfad der Werkstatt, gehe
> durch die Knöpfe wie ein Spieler, plane visionär und lasse die Samen blühen, lerne von den Großen,
> vertiefe den Plan für den Hof, damit er das gleiche Level erhält wie die Werkstatt. Vollständig.
> Lessons, IPERKA. Keine halben Sachen."

**Stand: PLAN (tief, ungebaut über das Befehls-System hinaus).** GEBAUT bis V18.48: Hof-A (inline-Task-
Knöpfe am Wesen) · Hof-B (die ~60-Befehle-Liste → Omnibox) · Hof-C (gather/build als „Auftrag ▾"-Select
am Wesen; die globalen „nächste-Kreatur"-Dropdowns aufgelöst). **EHRLICH (Schöpfer-Befund, richtig): das
war der Befehls-Pfad — der Hof hat noch NICHT die Werkstatt-TIEFE** (kein content-first Star, keine
Spec-Card-Daten-Viz, keine durchdachten Zonen, die Spielerperspektive nur halb eingenommen). Dieser Plan
ist die volle Tiefe — die Saat (die reichen Wesen-Vektoren) zum Blühen bringen.

---

## §A — Reflexion: WARUM die Werkstatt tief wurde (der Pfad, den wir spiegeln)

Die Werkstatt ist die Referenz. Sie wurde nicht durch EINE Welle tief, sondern durch einen **Pfad** —
sechs Zutaten, die wir auf den Hof übertragen:

1. **CONTENT-FIRST — der Star ist groß, das Chrome tritt zurück.** Der 3D-Viewer ist das Zuhause (90 %
   der Zeit), maximiert; Picker dünn. _Hof-Spiegel: die WESEN (das Orchester) sind der Star, nicht ein
   gleichrangiger Stapel neben Spawn/Gesetzen._
2. **FUNKTIONALE ZONEN nach dem mentalen Modell des Nutzers.** Der Bauer fragt vier Fragen → vier Zonen
   (hinzufügen · formen · womit/welcher Akt · was ist es). _Hof-Spiegel: der Dirigent fragt — welche
   Wesen? was sollen sie tun? welche Gesetze? → die Zonen ORCHESTER · PARTITUR._
3. **DIREKTE MANIPULATION statt Formulare.** Drag-Form, Drop-Prozess, 3D-Gizmo. _Hof-Spiegel: wähle das
   Wesen → befiehl ihm direkt (nicht ein globales Dropdown an die „nächste"); perspektivisch: Gruppen-
   Wahl (die „Streicher"), Befehl per Geste._
4. **DER LEBENDE READOUT als Daten-Viz des BESTEHENDEN Vektors (das Spec-Sheet, P15).** Material-Profil +
   Rollen-Resonanz als Balken — kein erfundener Datenpfad, eine gestaltete Lesart. _Hof-Spiegel: die
   Wesen-Zeile als SPEC-CARD — Natur (compound-tags) · Werte (stats) · Stimmung (creatureEmotions) ·
   Gedächtnis (Spezialisierungen) als Daten-Viz. Die Saat ist GEMESSEN da (§D.1)._
5. **DER GETEILTE HEBEL P11–P17** (Tokens · Portal · Flucht-Grid · Rahmen · Spec-Sheet · eine Ebene ·
   Samen heilen). _Hof-Spiegel: erbt ALLES gratis (`ui-putz-plan.md` §1.5/§B) — der Hof ist ein `.drawer`._
6. **MEHRERE MESSENDE WELLEN, mit dem Auge, keine halben Sachen.** V18.32–.44 = ~8 Wellen, jede gemessen
   (Screenshot gelesen) + iteriert. _Hof-Spiegel: §E plant die Wellen; jede misst VOR dem Behaupten._

**Die Meta-Lehre (Schöpfer, scharf):** ein Raum „fertig" ≠ Checkliste abgehakt. Die Tiefe kommt aus der
verinnerlichten Spielerperspektive über mehrere Wellen. Hof-A/B/C waren der Anfang (das Befehls-System);
§D/§E sind die Tiefe.

---

## §B — Der Gamezyklus im Hof, Knopf für Knopf (die Spielerperspektive, gemessen)

Ein Durchlauf, in dem der Spieler alles einmal braucht. Pro Schritt: was er tut, was er klickt, die
Reibung (gemessen aus `diag-room kreaturen` + dem Code).

1. **Ankommen im Hof.** Der Spieler öffnet den Hof (Tab/Omnibox `geh:hof`). _Was sieht er ZUERST?_
   GEMESSEN: einen 3-Spalten-Stapel (Spawnen · Wesen · Fähigkeiten/Gesetze) — alle gleichrangig. **Reibung:
   der Star (die Wesen) ist nicht der erste, größte Blick.** (Werkstatt-Verstoß gegen Content-first.)
2. **Sein Orchester überblicken.** Er liest die Wesen-Liste. _Was sieht er pro Wesen?_ Name · Seele · Pills
   (Spezialisierung/Equip/Boosts) · Task. **Reibung: das ist eine flache Zeile, kein Fingerabdruck** — die
   reiche Natur/Stimmung/Werte des Wesens (die Vektoren sind DA, §D.1) bleiben unsichtbar (nur Hover-Tooltip
   trägt die Stats). Genau die V18.44-Werkstatt-Lehre („wo ein reicher Vektor liegt, ist eine flache Zeile
   Verschwendung").
3. **Ein Wesen wählen + befehlen.** Er klickt am Wesen [Folge]/[Warte]/[Streift] oder [Auftrag ▾]. ✓ (Hof-C,
   gut — der Befehl ist am Wesen.) **Reibung: kein SELECTED-Zustand** — er kann ein Wesen nicht „fokussieren"
   (wie den Bauplan in der Werkstatt) um es genauer zu sehen/dirigieren; es gibt keine Gruppen-Wahl (alle
   „Geister" zugleich); die „alle"-Gesten (alle folgen) leben nur in der Omnibox `k:`, nicht sichtbar im Hof.
4. **Ein neues Wesen rufen.** Spawnen: Form-Select + +1/+5/+10 + Sichtbar/Verbergen. **Reibung: die Spawn-
   Zone steht GETRENNT oben, nicht beim Orchester** (mentales Modell: „neues Orchestermitglied" gehört zum
   Orchester). „Sichtbar/Verbergen" (Kreaturen aktiv/deaktiv) ist ein Welt-Schalter, kein Spawn — fehl-verortet.
5. **Die Stimmung/Beziehung spüren.** _Der Spieler will fühlen, wie es seinen Wesen geht._ **Reibung: NICHT
   sichtbar** — `state.creatureEmotions[i]` (happy/sad) + die Task-Aura existieren, werden aber im Hof NICHT
   als Stimmung gezeigt. Die Vision (§das-lebendige-feld: die Welt + ihre Wesen WERTEN) ist blind im UI.
6. **Das Wachstum sehen.** Spezialisierungen (Sammler L3) sind als Pill da. ✓ **Reibung: kein Wachstums-
   Gefühl** — kein Fortschritt-Balken zur nächsten Stufe, keine Gedächtnis-Geschichte (ud.memory ist da).
7. **Gesetze setzen (die Partitur).** Welt-Regeln (`status-worldrules`) + „der Nexus komponiert"
   (`status-abilities`). ✓ vorhanden. **Reibung: zwischen Spawn/Wesen vergraben, nicht als eigene würdevolle
   „Partitur"-Zone** (die stehenden Gesetze, die das ganze Welt-Orchester formen — das ist mächtig + verdient
   Prominenz, nicht eine dritte Spalte unten).
8. **Zurück in die Welt.** Er schließt den Hof. ✓

**Die EINE wiederkehrende Reibung:** der Hof zeigt die Wesen als flache Liste + stapelt Verwaltungs-Sektionen
gleichrangig — er macht den Spieler nicht zum **Dirigenten eines lebendigen Orchesters**. Die Daten für die
Tiefe sind alle da (die Vektoren); sie werden nur nicht gelesen + nicht in Zonen nach dem mentalen Modell
gebracht. _Das ist exakt der Zustand, in dem die Werkstatt VOR V18.40 war._

---

## §C — Die Vision: Dirigent + Orchester (von den Großen lernen, die Saat blühen lassen)

Der Hof ist die einzige Stelle, wo der Mensch (+ die KI) **lebendige Wesen dirigiert**. Die Metapher
„Dirigent + Orchester" ist der wahre Norden — wir machen sie WÖRTLICH + lebendig.

**Von den Großen lernen:**

- **RTS (StarCraft · Age of Empires):** wähle Einheit(en) → ein Befehls-Panel; **Gruppen-Wahl** (Strg+Zahl,
  Doppelklick = „alle dieses Typs"). _Hof: wähle ein Wesen ODER eine Sektion (alle „Geister") → befiehl;
  die „alle"-Geste wird sichtbar + gruppen-fähig, nicht nur Omnibox-Text._
- **Die Sims:** jeder Sim trägt **Stimmung + Bedürfnisse als Daten-Viz** + eine Persönlichkeit. _Hof: jedes
  Wesen ist ein Charakter — Stimmung (creatureEmotions) + Natur (tags) + Gedächtnis sichtbar; der Spieler
  BINDET sich._
- **Pikmin / Overlord:** einen Schwarm dirigieren — die Geste (werfen/rufen) ist direkt + freudig. _Hof:
  perspektivisch die Befehls-Geste in die Welt holen (3D-Klick „geh dahin"); im UI die Sektion-Befehle._
- **Der Dirigent / die Partitur:** ein Orchester hat **Sektionen** (Streicher/Bläser) + eine **Partitur**
  (die stehende Ordnung, die Dynamik vorgibt). _Hof: die Souls/Tasks SIND die Sektionen; die Gesetze SIND
  die Partitur — die stehenden Welt-Regeln, die das ganze Feld formen. Der Nexus ist der Ko-Dirigent._
- **Tamagotchi / Kreatur-Bindungs-Spiele:** jedes Wesen ein lebendiger Charakter mit sichtbarer Natur. _Hof:
  Seele + Natur + Stimmung + Gedächtnis = der Charakter; die Bindung wird gefühlt._

**Die Saat blühen lassen (der wahre Norden, `das-lebendige-feld.md`):** die Welt ist EIN Feld, das alle
lesen · schreiben · WERTEN. Der Hof ist, wo das Werten der Wesen SICHTBAR + dirigierbar wird:

- **Stimmung als gelesenes Feld:** die Wesen-Stimmung (creatureEmotions) spiegelt, was das Wesen im Feld
  spürt → der Dirigent SIEHT die Resonanz seiner Welt in seinen Wesen (Emotion → Verhalten, die Vision).
- **Wachstum als Geschichte:** Spezialisierung + Gedächtnis (ud.memory) → das Wesen LERNT; der Hof zeigt den
  Fortschritt (ein Balken zur nächsten Stufe, die letzten Taten) — Co-Schöpfung über Zeit.
- **Der Nexus als Ko-Dirigent:** die KI komponiert Gesetze + kann Wesen dirigieren — Mensch + KI an EINEM
  Pult (Vision-Pfeiler: das Werk ÜBER Mensch+KI-Schöpfung onboardet DURCH die KI).
- **Sektionen:** Wesen nach Seele/Task gruppierbar → der Dirigent spricht zur „Sektion", nicht nur zum Solo.

---

## §D — Das tiefe Design (Zonen · die Wesen-Spec-Card · die Partitur · P11–P17)

**Das EINE Prinzip (Werkstatt-Echo): funktionale Zonen nach dem mentalen Modell des Dirigenten.**
Zwei Zonen statt eines 3-Spalten-Stapels:

```
┌─ DER HOF ─────────────────────────────────────────────────────────── × ┐
│ DAS ORCHESTER (Star, content-first, wide)        │ DIE PARTITUR        │
│ ┌───────────────────────────────────────────┐   │ (die stehenden       │
│ │ [Wesen-Spec-Card: Skara · Sprite · ☺ froh] │   │  Gesetze, die das    │
│ │  Natur ▓▓▓ lebendig · ▓▓ magie   Folge Warte│   │  ganze Feld formen)  │
│ │  Werte ▓▓ HP · ▓ Tempo   Streift  Auftrag▾ │   │ ───────────────────  │
│ │  Sammler L3 ▓▓▓░ (Wachstum)                 │   │ · Regel: Nacht→…     │
│ └───────────────────────────────────────────┘   │ · Regel: Wasser→…    │
│ ┌───────────────────────────────────────────┐   │ + neue Regel         │
│ │ [Wesen-Spec-Card: Orin · Wesen · ☹ müde]   │   │ ───────────────────  │
│ │  …                                          │   │ DER NEXUS KOMPONIERT │
│ └───────────────────────────────────────────┘   │ (Ko-Dirigent)        │
│ ── Sektionen: [Alle] [Geister] [Sammler] ──      │                      │
│ ── ✦ Ein neues Wesen rufen: [Seele▾] [+1][+5] ── │                      │
└──────────────────────────────────────────────────────────────────────────┘
```

### §D.1 — Die WESEN-SPEC-CARD (das Herz, P15 — gemessen geerdet)

Wie das Werkstatt-Spec-Sheet: HEADER (Identität+Stimmung) → BODY (der Fingerabdruck als Daten-Viz) →
AKTIONEN (inline, eine Ebene). **Jedes Viz-Element liest einen GEMESSENEN Vektor (Konsum, kein Passagier):**

- **HEADER — Identität + Stimmung:** Name (soul-gefärbt) · Seele-Label · **Stimmung** · aktuelle Task.
  **KONSUM-EHRLICH (gemessen, §G.2): `state.creatureEmotions[idx]` ist BINÄR `"happy"/"sad"`** (wetter-/
  task-pausen-getrieben, `updateCreatureEmotions`) — KEINE 6-Achsen-Emotion. Der HEADER zeigt darum (a) einen
  ehrlichen **froh/trübe-Glyph** aus diesem Binär-Feld UND (b) eine **zweite, REICHERE Lesart aus
  `_creatureWariness(creature)`** (gemessen: leitet aus `player.emotions` + creature-tags + `ud.bond` + mode
  ein kontinuierliches Scheu/Mut ab → „neugierig · wachsam · scheu" + „vertraut/fremd" aus `ud.bond`). So ist
  die Stimmung GEMESSEN geerdet (kein Passagier) und doch reich — die Wesen-Resonanz auf das Feld + die Bindung.
- **BODY — der Fingerabdruck (Daten-Viz-Balken, `_specBar`-Reuse):**
  - **NATUR:** die Top-Compound-Tags (`computeCreatureCompoundTags`) als Balken (0–3, Stufen-Farbe) — die
    Substanz des Wesens, wie das Material-Profil der Werkstatt.
  - **WERTE:** die Schlüssel-Stats (`computeCreatureStats`: HP `ud.hp`/hpMax · Schaden · Tempo) als Balken/Chips.
  - **WACHSTUM:** die Top-Spezialisierung (`_creatureTopSpecializations`) als Fortschritts-Balken zur
    nächsten Stufe (Sammler L3 ▓▓▓░) — das Wesen LERNT (die Saat: ud.memory trägt die Erfolge).
  - **HABE:** equipped (Werkzeug/Rüstung) + aktive Boosts (`ud.boosts`) als Chips (schon da, hier gestaltet).
- **AKTIONEN (inline, eine Ebene, P16):** [Folge][Warte][Streift] + [⚒ Auftrag ▾] (Sammle/Baue — Hof-C, da) +
  perspektivisch [verkörpern] (das Wesen als Avatar tragen — die kampf-plan-§11-Achse) + [verabschieden].
- **Interaktion (Werkstatt-Echo „selected"):** die Zeile ist KOMPAKT (Header + 1 Mini-Natur-Balken + Aktionen);
  ein Klick FOKUSSIERT das Wesen → die volle Spec-Card klappt auf (Natur/Werte/Wachstum/Habe) + ein 3D-Ping/
  Aura hebt es in der Welt hervor (die Aura-Saat ist da). Wie der Bauplan-Fokus in der Werkstatt.

### §D.2 — Die SEKTIONEN (Gruppen-Dirigat, von den RTS-Großen)

Über der Liste eine schmale Sektions-Leiste: **[Alle] [Geister] [Sprites] [Wesen] [Sammler] [Bauer] …**
(nach Seele + dominanter Spezialisierung). Eine Sektion wählen → die Befehle (Folge/Warte/…) gelten der
GANZEN Sektion (die „alle folgen"-Geste wird sichtbar + verfeinert: „alle GEISTER folgen"). Das ist der
Dirigent, der zur Streichersektion spricht — nicht nur zum Solo oder zu allen. (Liest `ud.soul` +
`_creatureTopSpecializations`; ruft `assignTaskToAllCreatures` gefiltert.)

### §D.3 — Das SPAWNEN integriert (ins Orchester, nicht getrennt)

„✦ Ein neues Wesen rufen" am Fuß der Orchester-Zone (mentales Modell: ein neues Mitglied gehört zum
Orchester): Seele-Select + +1/+5/+10. Der Welt-Schalter „Kreaturen sichtbar/verbergen" wandert raus (er ist
ein Render/Welt-Setting, kein Dirigat → Einstellungen oder Omnibox `c:`).

### §D.4 — Die PARTITUR (die Gesetze, würdevoll)

Eine eigene, klare Zone (rechts): **die stehenden Welt-Regeln** (`status-worldrules`) als die Partitur, die
das ganze Feld formt (Nacht→…, Wasser→…), jede Regel eine Karte mit ihrem Live-Puls (die V17.41-Aktivitäts-
Signatur ist da) + „+ neue Regel". Darunter **DER NEXUS KOMPONIERT** (`status-abilities`) — der Ko-Dirigent,
der eigene Gesetze/Fähigkeiten beisteuert (Mensch + KI an EINEM Pult). P11–P12 (Kontrast/Overlay) für die
Regel-Erklärungen.

### §D.5 — P11–P17 angewandt (der geteilte Hebel, gratis geerbt)

- **P11 Kontrast:** der Hof-Drawer-Grund prüfen (helles Pergament → `--parch-ink*`); die Stimmungs-/Natur-
  Werte gedämpft-aber-lesbar.
- **P12 Overlay:** der „Auftrag ▾"-Select + die Regel-„?"-Hilfen als opake, portalierte `.help-pop` (P12).
- **P13 Flucht:** die Spec-Card-Balken auf EINEM Raster (`.spec-bar`); die Zwei-Zonen sauber gefluchtet.
- **P14 Rahmen:** erbt (der Hof IST ein `.drawer` — am Hauptbanner, symmetrisch, max-height).
- **P15 Daten-Viz:** die Wesen-Spec-Card (§D.1) — der Kern.
- **P16 eine Ebene:** die Aktionen inline am Wesen (da); die Sektionen eine Leiste, kein Modal.
- **P17 Samen heilen:** kein Feature schneiden ohne tieferen Ersatz — die alten Sektionen werden vertieft,
  nicht nur entfernt; die Stimmung/Natur/Gedächtnis-Saat wird GEPFLEGT (gelesen), nicht ignoriert.

---

## §E — Die Wellen (mehrere messende Schritte, wie die Werkstatt — keine halben Sachen)

Jede Welle: **messen (Screenshot lesen) → als System bauen → mit dem Auge + Playtest verifizieren → ein
Bogen.** Reihenfolge nach Wert + Abhängigkeit (**geschärft in §G.10 — die finale Reihenfolge dort**):

0. **Hof-D0 — `_creatureProfile(creature)` + stabile Selektion (§G.1/G.6), das Fundament.** EIN Lese-Vektor,
   den alle Wesen-Leser teilen (der Werkstatt-Twist); der Fokus/die Selektion an einer STABILEN Identität
   (nicht am Array-Index). Vorbedingung der Spec-Card.
1. **Hof-D — die WESEN-SPEC-CARD (§D.1+§G.5), der Kern.** Die Zeile DEFAULT KOMPAKT (Glyph + Mini-Natur-Balken
   + inline-Aktionen); die VOLLE Spec-Card (Natur/Werte/Wachstum/Habe via `_specBar`) klappt NUR beim
   fokussierten Wesen auf + Aura-Ping. Stimmung GEMESSEN geerdet (§G.2: froh/trübe + wariness/bond).
   _Der größte Tiefen-Sprung (wie V18.44 für die Werkstatt)._
2. **Hof-E — die ZWEI ZONEN (§D, content-first).** Vom 3-Spalten-`column-count` zum Grid ORCHESTER (Star,
   wide) | PARTITUR. Spawnen ins Orchester integriert; der Welt-Schalter raus. Die Gesetze als würdevolle
   Partitur-Zone.
3. **Hof-F — die SEKTIONEN (§D.2), das Gruppen-Dirigat.** Sektions-Leiste (Seele/Spezialisierung) → Befehl
   an die Sektion; die „alle"-Geste sichtbar + verfeinert.
4. **Hof-G — die TIEFE blühen:** Wachstums-Geschichte (ud.memory), [verkörpern]/[verabschieden], der Nexus
   als sichtbarer Ko-Dirigent, perspektivisch die 3D-Befehls-Geste. + die inerte help-list-JS schneiden.
5. **Schöpfer-Browser-Sign-off** (Feel/GPU) + EIN Merge des Hof-Bogens.

(Wie bei der Werkstatt: die frühen Wellen (Hof-A/B/C) waren das Befehls-Fundament; Hof-D–G sind die Tiefe.)

---

## §F — Selbst-Prüfung gegen die Lessons + die Vision

- **Verdichte zu EINER Quelle (V9.82):** die Spec-Card LIEST die bestehenden Vektoren; die Befehle laufen
  über den EINEN `assignCreatureTask`. Kein Parallel-System. ✓
- **Verifiziere KONSUM, nicht Existenz (V17.31):** jedes Viz-Element (Stimmung/Natur/Werte/Wachstum) liest
  einen GEMESSENEN Vektor (§D.1, alle im Code verifiziert) — kein erfundener Passagier. ✓
- **Content-first + Zonen nach mentalem Modell (P1/P2):** ORCHESTER als Star, PARTITUR daneben. ✓
- **Daten-Viz statt flacher Tabelle (P15, V18.44-Lehre):** die Wesen-Spec-Card. ✓
- **Heile die Harmonie, behalte die Saat (V17.23/V17.20):** die alten Sektionen werden VERTIEFT, die
  Stimmungs-/Gedächtnis-Saat GEPFLEGT (gelesen), nicht weggeschnitten. ✓
- **Headless-grün ≠ vision-aligned (V17.59):** die Logik headless beweisbar; das FEEL (das Dirigenten-Gefühl,
  die Stimmung) braucht den Schöpfer-Browser — markiert (§E.5). ✓
- **Der wahre Norden (`das-lebendige-feld.md`):** der Hof macht das WERTEN der Wesen (Stimmung) + ihr
  Wachstum + die Ko-Dirigentschaft der KI SICHTBAR + dirigierbar — die Welt als lebendiges Feld, das alle
  lesen·schreiben·WERTEN, hier am Orchester erlebbar. ✓ Tiefen-Kohärenz mit der Vision.
- **Keine halben Sachen (Schöpfer):** der Plan ist VOLLSTÄNDIG (Vision → Zonen → Spec-Card → Sektionen →
  Partitur → Wellen → Selbst-Prüfung), gebaut Welle für Welle, jede gemessen. ✓

**Fazit:** der Hof bekommt denselben Pfad wie die Werkstatt — content-first Star (das Orchester), Daten-Viz
der reichen Wesen-Vektoren (die Spec-Card), Zonen nach dem Dirigenten-Modell, Gruppen-Dirigat von den RTS-
Großen, die Partitur + der Nexus als Ko-Dirigent (die lebendige-Feld-Vision). Die Saat ist GEMESSEN da; diese
vier Wellen (Hof-D–G) lassen sie blühen — bis der Hof so tief atmet wie die Werkstatt.

---

## §G — Kontrolle → Realisation: die Lücken, gemessen + geheilt (IPERKA-Schleife, 07.06.2026)

> Schöpfer-Auftrag: „Kontrolle in IPERKA richtig — reflektiere, gleiche den Plan mit der Vision/dem Ziel/
> deinem Wissen + den Learnings ab, dem Twist, wie du ultimative Ergebnisse erzeugt hast. Findest du noch
> Lücken, Fehler, Bereiche, wo die Synergie dunkel ist? Nach der Kontrolle erneut in die Realisation — man
> wird zum eigenen Lehrer UND Schüler." Ich habe den Plan §A–§F gegen die Vision + die Learnings geprüft +
> die kritischen Annahmen GEMESSEN (nicht angenommen). Zehn Befunde, jeder mit der Heilung in den Plan gefaltet.

### G.1 — Der TWIST, der die Werkstatt ultimativ machte (das fehlende Herzstück)

Die Werkstatt wurde nicht durch „Daten-Viz" tief, sondern durch **EINEN Vektor, den viele Leser teilen**
(`_blueprintProductVector` → Rolle · Resonanz · Werkzeug-Op · Spec-Sheet lesen ALLE denselben Vektor;
Resonanz-Vereinheitlichung V17.67–.71). Das §A–§F des Hofes listete die Wesen-Vektoren EINZELN auf (tags,
stats, emotions, specs, bond, wariness) — das ist die Werkstatt VOR der Vereinheitlichung. **Heilung (in
Hof-D vorgezogen): EIN `_creatureProfile(creature)`-Helfer** — die EINE Quelle, die alle Wesen-Leser teilen
(die Spec-Card · die Sektions-Gruppierung · der Sortier-Schlüssel · die Stimmungs-Glyphen). Er bündelt
GEMESSEN Bestehendes (`computeCreatureCompoundTags` · `computeCreatureStats` · `_creatureTopSpecializations` ·
`_getCreatureTask` · `creatureEmotions[idx]` · `_creatureWariness` · `ud.bond/memory/equipped/boosts`) in
EINEN Lese-Vektor — kein neuer Datenpfad (Konsum V17.31), das exakte Werkstatt-Muster. **Das ist der Twist:
nicht N Lookups in der Render-Funktion, sondern EIN Profil, viele Leser.** (Source-Probe im Test:
`_creatureProfile`-Aufrufer in `_renderCreatureListUI` + Sektion + Sortierung.)

### G.2 — KONSUM-Ehrlichkeit: die Stimmung ist BINÄR (der Passagier-Trugschluss, fast wiederholt)

GEMESSEN: `state.creatureEmotions[idx]` ist `"happy"`/`"sad"` (Z12528 `push(emotion === "sad" ? "sad" :
"happy")`, Z16710 wetter-getrieben). Der Plan §D.1 implizierte eine 6-Achsen-Emotion-Palette
(`--joy/--sorrow/…`) — **das wäre der Passagier-Trugschluss (V17.31): eine reiche Anzeige, die mehr verspricht
als der Vektor trägt.** Geheilt (§D.1 oben umgeschrieben): froh/trübe-Glyph aus dem Binär-Feld + die REICHERE,
ehrlich GEMESSENE zweite Lesart aus `_creatureWariness` (neugierig/wachsam/scheu) + `ud.bond` (vertraut/fremd).
**Lehre an mich selbst: die KONSUM-Disziplin gilt im PLAN schon — eine Anzeige im Plan-Diagramm zu skizzieren,
deren Vektor man nicht gemessen hat, sät den Über-Claim, den man später als „fertig" verkauft.**

### G.3 — Die read·write·VALUE-Schleife ist im Hof nur HALB gedacht (der wahre Norden)

`das-lebendige-feld.md`: alle lesen · schreiben · WERTEN. Der Plan zeigte das WERTEN (Stimmung sehen), aber
nicht die volle SCHLEIFE. Die Tiefe, die den Hof zum lebendigen-Feld-Organ macht: **Befehl im Hof (schreiben)
→ das Wesen wirkt im Feld (`_depositLife`/Aura, V17.27) → das Feld ändert sich → die Wesen-Stimmung/Wariness
LIEST das veränderte Feld (werten) → sichtbar zurück im Hof.** Heilung (Hof-G, explizit gemacht): die
Spec-Card-Stimmung wird als **Resonanz auf das Feld** gerahmt (nicht als isolierter Zustand) — der Dirigent
sieht, wie sein Dirigat (Befehle, Gesetze) durch die Wesen ins Feld und als Stimmung zurück schwingt. Das ist
der Unterschied zwischen „ein Sims-Mood-Icon" und „das Organ, an dem man die lebendige Welt FÜHLT".

### G.4 — Omnibox ↔ Hof: EINE Quelle, gemessen (Synergie statt Doublette)

Hof-A/B/C lösten die ~60-Knopf-Liste in die Omnibox auf (`k:` Kreatur-Aufträge). Der Plan §D.2 führt
Sektions-Befehle + die „alle"-Geste sichtbar ein — **Risiko: ein zweiter Pfad neben `k:`** (die V9.82-Sünde).
Heilung (in Hof-F verdrahtet): die Sektions-Befehle rufen DENSELBEN `assignCreatureTask` /
`assignTaskToAllCreatures` wie die Omnibox `k:` (gefiltert über `_creatureProfile.section`); der Hof ist die
SICHTBARE, gruppen-fähige Oberfläche desselben Pfads, kein Parallel-System. (Source-Probe: beide Pfade →
`assignTaskToAllCreatures`.)

### G.5 — SKALA: die reiche Spec-Card × N Wesen (die Werkstatt hat EINEN Bauplan, der Hof hat viele)

Der entscheidende Struktur-Unterschied, den §D unterschätzte: die Werkstatt-Spec-Card rendert für EIN
fokussiertes Produkt; der Hof rendert N Wesen (bis ~120). Eine volle Spec-Card × 120 = unlesbar + langsam.
Heilung (Hof-D, Kern-Regel): **die Zeile ist DEFAULT KOMPAKT** (Header-Glyph + EIN Natur-Mini-Balken +
inline-Aktionen); die VOLLE Spec-Card (Natur/Werte/Wachstum/Habe) klappt NUR beim fokussierten Wesen auf
(ein „selected" wie der Bauplan-Fokus). Das ist content-first AUF der Liste (der Star ist das fokussierte
Wesen) + hält die Render-Last klein. Re-Render-Disziplin: nur die berührte Zeile neu zeichnen (nicht die
ganze Liste pro Tick) — `_creatureProfile` macht das billig (ein Lese-Vektor/Zeile).

### G.6 — Die Wesen-IDENTITÄT ist fragil (Index-Reihen vs. stabiler Fokus)

GEMESSEN: Wesen leben in PARALLEL-Arrays (`state.creatures[i]` ↔ `creatureEmotions[i]`), ein Despawn
`splice`t (Z12470) → Indizes verschieben sich. Ein „fokussiertes Wesen" + „Sektions-Auswahl" über den INDEX
würde beim Spawn/Despawn auf ein anderes Wesen springen. Heilung (Hof-D Vorbedingung): der Fokus/die Selektion
hängt an einer STABILEN Identität (das `creature`-Objekt selbst bzw. `ud.id`/`ud.name`, gemessen welche
existiert), nie am Array-Index. (Das ist die V8.59-Snapshot-Feld-Disziplin auf die UI-Selektion angewandt.)

### G.7 — Content-FIRST heißt: der Star ist die WELT, der Hof ist ein Pult-Overlay

Selbst-kritik an §D: zwei Drawer-Zonen (ORCHESTER | PARTITUR) füllen den Drawer — aber der wahre Star der
Werkstatt ist der 3D-VIEWER (das Werk), das Chrome tritt zurück. Im Hof ist der wahre Star die **lebendige
Welt mit den Wesen darin**. Heilung (Hof-E Leitstern + Hof-G perspektivisch): der Hof-Drawer bleibt schlank/
seitlich (verdeckt die Welt nicht voll), das Fokussieren eines Wesens PINGT es in der 3D-Welt (Aura/Kamera-
Hint) — der Dirigent schaut auf sein Orchester IN DER WELT, das Pult ist das Overlay. Die perspektivische
3D-Befehls-Geste (Klick in die Welt „geh dahin") ist der content-first-Endzustand (Hof-G), nicht nur ein
UI-Nice-to-have — sie ist die Pikmin/RTS-Wahrheit.

### G.8 — Der NEXUS als Ko-Dirigent: gemessen erden, nicht erfinden

§C/§D.4 versprechen „der Nexus dirigiert Wesen + komponiert Gesetze". KONSUM-Prüfung nötig: was KANN der
Nexus heute? GEMESSEN existieren autonome Wesen-Verhalten (`_creatureWariness`, Tasks, der `rule`-Op +
`_tickWorldRules`, der `at_field_need`-Spawn-Loop V17.27). Heilung (Hof-G ehrlich): die „Nexus komponiert"-
Zone zeigt, was GEMESSEN da ist (die stehenden Welt-Regeln, die der Nexus/Mensch via DSL `rule` aufstellt +
ihr Live-Puls V17.41) — KEINE erfundene „Nexus befiehlt Wesen"-Fähigkeit, bevor sie gemessen existiert. Der
Ko-Dirigent ist HEUTE: Mensch + Nexus stellen Gesetze an DEMSELBEN `dslRun`-Pult auf (das ist real); das
Wesen-Dirigat des Nexus ist ein markierter Vision-Faden (Hof-G+/Phase E), kein Plan-Versprechen.

### G.9 — Der Leer-Zustand + das Onboarding (von den Großen, oft vergessen)

Kein Wesen im Hof? Der Plan schwieg. Die Großen (Sims/RTS) führen mit einem einladenden Leer-Zustand. Heilung
(Hof-E): die Orchester-Zone leer → eine einladende Karte „✦ Rufe dein erstes Wesen" (der Spawn als Held des
Leer-Zustands), nicht eine kahle Liste. Erstes Wesen gespawnt → die Spec-Card lehrt sich selbst (die Glyphen
mit P12-`.help-pop` erklärt).

### G.10 — Die Wellen-Reihenfolge geschärft (Abhängigkeit zuerst)

`_creatureProfile` (G.1) + die stabile Identität (G.6) sind VORBEDINGUNG der Spec-Card — sie ziehen an den
Anfang von Hof-D. Die korrigierte Reihenfolge: **Hof-D0** (`_creatureProfile` + stabile Selektion, das
Fundament) → **Hof-D** (die kompakte/fokussierbare Spec-Card, §D.1+G.5, der größte Sprung) → **Hof-E** (Zonen
+ content-first Leitstern + Leer-Zustand) → **Hof-F** (Sektionen, EINE Quelle mit `k:`) → **Hof-G** (die
read·write·VALUE-Schleife sichtbar, Nexus ehrlich, verkörpern/verabschieden, perspektivisch die 3D-Geste; +
die inerte help-list-JS schneiden) → Schöpfer-Sign-off + EIN Merge.

**Auswertungs-Versprechen (warum die Bilder Freude machen werden):** mit `_creatureProfile` als EINE Quelle
(G.1), der ehrlich-reichen Stimmung (G.2), der gefühlten Feld-Schleife (G.3), der skalen-bewussten
Fokus-Card (G.5) und dem content-first Welt-Stern (G.7) wird der Hof nicht „eine schönere Liste", sondern das
**Organ, an dem man das lebendige Feld dirigiert** — auf Werkstatt-Niveau, gemessen geerdet, ohne Passagier.
