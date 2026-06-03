# Der emotionale Kern — wie Gefühl WIRKLICH funktioniert (der fundamentale Plan)

> **Lies das ZUERST vor jeder Arbeit an „der Emotion des Spielers", „wie sich etwas
> anfühlt", „Stimmung/Gefühl/Affekt", „der KI als Gefährte" oder „Kampf-/Abenteuer-/
> Schöpfungs-Gefühl".** Es ist die fundamentale Architektur des Fühlens — gegründet auf
> dem, wie Emotion in der Affekt-Wissenschaft WIRKLICH funktioniert (Appraisal-Theorie +
> dimensionale Modelle + Emotions-Dynamik + soziale Emotion), FUSIONIERT mit dem
> Projekt-Genie (Hylomorphismus) + dem Vorhersagefehler (V17.44). Stand: nach V17.44
> (die Wertungs-MECHANIK steht; HIER wird die EINGABE — das Fühlen selbst — fundamental).
> Verwandte Anker: `lebendige-wertung-plan.md` §10 (die fünf grauen Schatten — die
> DIAGNOSE; dies ist die HEILUNG an der Wurzel), `das-lebendige-feld.md` (Pfeiler 2:
> „Emotion treibt alles"), `crafting-konzept.md` (Hylomorphismus = das Tag-Substrat).

---

## 0. Die Frage + die Disziplin

**Schöpfer (02.06.):** „durchdenke wirklich tief, wie funktionieren Emotionen, wie
fusionieren sie, wie bringst du das optimal herein, so echt wie irgend möglich … ein
fundamentaler, stabiler, weitsichtiger Plan." Die ehrliche Lage: Phase 1–4 (`lebendige-
wertung-plan.md`) bauen die WERTUNGS-Mechanik (der δ-Vorhersagefehler). Aber die
EMOTION SELBST — das, was die Welt fühlt — ist heute ein FLICKENTEPPICH (eine flache
Tat-Tabelle + ein Feld-Read + eine δ-Appraisal + Chat-Stichwörter), kein KERN. Dieser
Plan baut den Kern.

**Die Disziplin (Heilige Lektion):** das ist die VISION + der Wellen-Plan, NICHT ein
Urknall-Rewrite. Die sechs Achsen (joy/awe/sorrow/hope/peace/chaos), die bestehenden
Kanäle (`updatePlayerEmotions`, `_feelAction`, `FIELD_TO_EMOTION`, der Chat-Sentiment,
das räumliche Emotion-Overlay V17.32, Grok-`emotionShift`) und `computeCompoundTags`
BLEIBEN — sie werden VERDICHTET, nicht ersetzt. Jede Welle: ein gemessener Schatten
geheilt, ein VERIFIZIERTER Konsument (V17.31-Lehre — Konsum, nicht Existenz), playtest-
grün, ein Commit. Kein neues „EmotionManager"-Modul — der Kern sind Methoden + frozen
Daten-Tabellen auf dem einen Stamm.

**Ehrlich vorweg:** kein Spiel-Modell ist „echter als ein Mensch". Der Anspruch ist
bescheidener UND größer: die best-belegten Befunde der Affekt-Wissenschaft TREU in EIN
kohärentes, laufendes System zu FUSIONIEREN — was weder ein einzelnes akademisches
Modell noch ein einzelnes Spiel voll tut — plus den Hylomorphismus + den Vorhersage-
fehler. Die MECHANIK ist headless beweisbar; ob es sich „echt anfühlt", ist der
Schöpfer-Browser (die affektive Wahrheit lebt im Erleben, V13-Render-Lehre auf Gefühl).

---

## 1. Wie Gefühl WIRKLICH funktioniert (die Affekt-Wissenschaft, kondensiert)

Fünf Wahrheiten, jede mit dem, was das heutige System VERFEHLT:

**(1) Emotion ist APPRAISAL (Bewertung), nicht Reiz-Reflex.** (Arnold, Lazarus, Ortony/
Clore/Collins [OCC], Scherer [Component Process Model].) Ein Ereignis löst kein Gefühl
durch seinen TYP aus, sondern durch seine BEWERTUNG entlang weniger Dimensionen:
- **Valenz** (gut/schlecht für meine Ziele) · **Magnitude** (wie sehr es mich angeht) ·
  **Agency/Ursache** (ich / ein anderer / die Umstände + Absicht) · **Gewissheit**
  (sicher/ungewiss) · **Neuheit/Erwartung** (der Vorhersagefehler) · **Norm/Selbst**
  (richtig/falsch, passt zu meinem Ideal) · **Bewältigung** (kann ich es ändern?).
- **Die Schlüssel-Erkenntnis:** DASSELBE schlechte Ereignis → ZORN (anderer verursacht +
  ich kann handeln), FURCHT (Bedrohung + ich kann NICHT), oder TRAUER (Verlust +
  unabänderlich) — je nach Agency + Bewältigung. Eine flache Tabelle „schlechtes Ding →
  sorrow" verfehlt die ganze Differenzierung des Fühlens. **Das heutige `ACTION_TO_
  EMOTION` ist genau diese flache Tabelle.**

**(2) Unter den diskreten Gefühlen liegt ein KONTINUIERLICHER Raum.** (Russell
[Circumplex], Mehrabian [PAD: Pleasure-Arousal-Dominance], Watson/Tellegen.) Jedes
Gefühl ist ein PUNKT in **Valenz × Erregung [× Dominanz]**: joy = +Valenz/+Erregung,
peace = +Valenz/−Erregung, sorrow = −Valenz/−Erregung, chaos = −Valenz/+Erregung, awe =
+Valenz/hohe-Erregung/Weite, hope = +Valenz/sanfte-Erregung/Zukunft. **Die Achsen sind
NICHT unabhängig:** man kann nicht zugleich maximal friedlich UND maximal chaotisch sein
(gegensätzliche Erregung). **Das heutige System behandelt die 6 als unabhängige Schieber
→ inkohärente Zustände (joy=1 UND sorrow=1 zugleich = bedeutungslos).** Im Raum leben
Fusion + Kohärenz.

**(3) Gefühle FUSIONIEREN.** (Plutchik [Dyaden], Scherer [Blends], die Forschung zu
gemischten Emotionen.) Bittersüß = joy + sorrow (Valenz hebt sich ~auf, aber die
INTENSITÄT bleibt hoch — ein voller, ambivalenter Zustand, kein neutraler). Awe = Furcht
+ Wunder. Nostalgie, Erleichterung, Sehnsucht. Fusion ist KEINE Addition (die sich
auslöscht), sondern eine KOEXISTENZ im Raum: ein DOMINANTES Gefühl + eine Färbung. **Das
heutige additive Modell kann nur auslöschen oder übersättigen, nicht bittersüß fühlen.**

**(4) Gefühl hat eine ZEIT-Struktur — schnelle EMOTION vs. langsame STIMMUNG.** (Frijda,
Kuppens [emotion dynamics], Davidson [affective chronometry].) Eine EMOTION ist akut (ein
schneller Spike aus einem Ereignis, schnelle Onset, charakteristischer Decay); eine
STIMMUNG ist der langsame Hintergrund (das Temperament, in das Emotionen zerfallen).
**Verschiedene Gefühle zerfallen verschieden schnell** (Furcht/Überraschung kurz, Trauer/
Zufriedenheit lang, Zorn schwelt). Die Stimmung färbt NEUE Bewertungen (**stimmungs-
kongruente Bewertung**: in trauriger Stimmung wird ein neutrales Ereignis negativer
bewertet — der Mechanismus, der Stimmungen klebrig + real macht). Plus **Inertia/
Regulation** (man bleibt in einer Stimmung hängen [Rumination] oder reguliert sie um).
**Das heutige System: ein uniformer Decay (0.005/s für ALLES), keine Stimmung-vs-
Emotion-Trennung, keine Kongruenz.**

**(5) Gefühl ist SOZIAL.** (Hatfield [emotional contagion], Bowlby [attachment], Gross
[co-regulation], de Waal [empathy].) Emotionen FLIESSEN zwischen Wesen (ein freudiges
Wesen neben dir hebt dich; ein leidendes betrübt dich). BINDUNG: der Verlust eines
gebundenen Wesens → Trauer ∝ der Bindungs-Stärke. KO-REGULATION: ein Gefährte LIEST dein
Gefühl + PFLEGT es (tröstet, teilt, beruhigt) — das ist das Herz von Beziehung. **Das
heutige System: Kreaturen HABEN Emotion, aber sie fließt nicht zum Spieler; die KI
(Grok) KOMMENTIERT Emotion-Shifts, aber sie TENDET nicht.**

---

## 2. Was BESTEHT (gemessen) + die EINE Lücke

Vorhanden + gut: die **6 Achsen** (ein Vektor, schon ein dimensionaler Keim); das
**räumliche Emotion-Overlay** (V17.32 — Gefühl ist schon ortsgebunden); die **V17.44-
Situations-Appraisal** (`δ = situation − baseline` — das EINZIGE schon appraisal-korrekte
Stück, der Brückenkopf); `computeCompoundTags` (**das Hylomorphismus-Substrat, bereit**);
der **0.7-Trigger** (Emotion → Welt, der Konsument); Grok-`emotionShift` (die KI sieht
schon Shifts). **Die Lücke:** alles außer V17.44 ist FLACH/Flickenteppich — `ACTION_TO_
EMOTION` (Tabelle), `FIELD_TO_EMOTION` (Level-Drift), Chat-Stichwort, je ein eigener Pfad.
KEINE Appraisal-Differenzierung, KEINE dimensionale Fusion, KEINE schnell/langsam-
Dynamik, KEIN sozialer Fluss. Die Teile sind da — sie sind nicht zu EINEM Kern fusioniert.

---

## 3. Die fundamentale Architektur — die EINE Idee: EVENT → APPRAISAL → EMOTION

Alle Affekt-Theorien konvergieren auf EINE Pipeline; sie ist auch die Vereinigung aller
heutigen Flicken:

```
   EVENT  ──►  APPRAISAL  ──►  EMOTION  ──►  STIMMUNG
 (eine Tat,   (ein Vektor:    (ein Punkt im   (der langsame
  ein Welt-    Valenz·Magni-   Valenz×Erregung- Hintergrund,
  Wechsel,     tude·Agency·    Raum, projiziert färbt die
  ein Wort,    Gewissheit·     auf die Achsen,  nächste
  ein Wesen)   Neuheit·Norm)   FUSIONIERT)      Bewertung)
                   ▲                                │
        ┌──────────┴───────────┐                   │
        │ SUBSTANZ (Hylomorph.) │  die SITUATION (δ, V17.44)
        │ computeCompoundTags    │  + die STIMMUNG (Kongruenz) ◄──┘
        │ → TAG_TO_EMOTION       │
        └────────────────────────┘
```

- **Jedes Ereignis** (Tat / Welt-Wechsel / Wort / Wesen) wird zu EINEM Appraisal-Vektor.
- Die **Substanz** (die Tags des beteiligten Bauplans/Materials/Werkzeugs via
  `computeCompoundTags`) speist den Vektor (Hylomorphismus: WAS du tust färbt das Gefühl).
- Der **Vorhersagefehler** (V17.44) speist die Valenz/Neuheit (besser/schlechter als
  erwartet).
- Der Vektor **projiziert** über eine frozen `APPRAISAL_TO_EMOTION`-Geometrie auf die 6
  (später mehr) Achsen — DIFFERENZIERT (Zorn ≠ Furcht ≠ Trauer beim selben schlechten Ding).
- Die Emotion **fusioniert** im dimensionalen Raum (dominantes Gefühl + Färbung) und
  **zerfällt** pro-Achse in die **STIMMUNG**, die die nächste Bewertung **kongruent färbt**.
- **Soziale Ereignisse** (Kreatur/KI-Emotion) speisen über Contagion denselben Pfad.

**EINE Pipeline subsumiert ALLE heutigen Kanäle:** die Tat-Tabelle, der Feld-Read, der
Chat, die Situation — alle werden EVENTS, die durch dieselbe Appraisal-Brücke laufen. Das
ist die Vereinheitlichung (Effizienz durch Einheit, §2 des wahren Nordens) UND die Tiefe
(Appraisal-Differenzierung) zugleich.

---

## 4. Die WELLEN (jede Verdichtung, foundation-first, mit VERIFIZIERTEM Konsumenten)

**W1 — Das dimensionale Substrat + die FUSION (die Geometrie). ✅ GEBAUT (V17.45).**
`AnazhRealm.EMOTION_GEOMETRY` (frozen: jede Achse → `{valenz, erregung}`) + `_emotionState()`
→ der fusionierte READOUT: das DOMINANTE Gefühl + der Valenz/Erregung-Schwerpunkt + die
INTENSITÄT (Abstand vom Neutralen). Plus eine SANFTE Kohärenz in `updatePlayerEmotions`
(gegensätzliche Achsen dämpfen sich mild → der Zustand ist ein kohärenter Punkt, nicht 6
unabhängige Maxima) — ADDITIV + gentle, getestet dass die 0.7-Trigger erreichbar BLEIBEN
(V17.30-Wächter). KONSUM: bittersüß (joy+sorrow hoch) → Valenz ~0 ABER Intensität hoch + ein
dominantes Gefühl emergiert (die Fusion, messbar); der Readout speist Journal/UI/KI mit einem
REICHEN Zustand statt 6 Zahlen. *Risiko niedrig (Geometrie ist Daten; Kohärenz gentle +
getestet).* — **Das Substrat, auf dem L2/L3 stehen.**

> **GEBAUT (V17.45):** `EMOTION_GEOMETRY` + `EMOTION_LABEL` (frozen, Russell-Werte: joy/hope/
> peace +Valenz, sorrow/chaos −Valenz, awe ambivalent/höchste Erregung; peace↔chaos Erregungs-
> Gegenpol) + `_emotionState()` (Schwerpunkt + INTENSITÄT). **Der Schlüssel-Konstruktions-Punkt
> (in der adversarialen Selbstprüfung gefunden): die Intensität ist die 6-dim Vektor-Magnitude,
> NICHT die des Schwerpunkts** — sonst läse bittersüß als „low-intensity neutral" (Schwerpunkt
> ~0); mit der 6-dim-Magnitude hat bittersüß Valenz~0 ABER hohe Intensität → ein voller Zustand
> (Label „Zwiespalt (Freude und Trauer)", `mix`). Die KOHÄRENZ in `updatePlayerEmotions` ist
> geometrie-deriviert (negativer Dot → mild dämpfen), rein DISSIPATIV (kein Runaway) +
> proportional zur Gegen-Achse → eine EINZELNE klare Emotion bleibt unberührt (0.7-Trigger heil).
> **KONSUMENT (kein Passagier, V17.31): `llmBuildSystemPrompt` trägt jetzt die Spieler-Stimmung**
> — vorher kannte die KI-Persona die Spieler-Emotion GAR NICHT (eine Symbiose-Lücke). GEMESSEN
> (`checkBandV1745EmotionCore`, 13 grün: Geometrie + Vorzeichen, klares dominantes Gefühl,
> bittersüß [Valenz~0, Intensität HOCH, Zwiespalt+mix], Ruhe, **KONSUM die KI kennt Freude/
> Zwiespalt/Ruhe**, Kohärenz [Gegenpol dämpft, EINZELNE Emotion nicht]). Plus zwei seit V17.44
> latente KONFOUNDER geheilt (gemessen, kein „Last-Flake": die Ring-3-Decay-Probe — der
> Appraisal hob joy über die 10s-delta → auf reinen Decay isoliert; 6.G3.c — gesättigtes sorrow
> clampt den +0.2-Stempel → auf den Intent isoliert). node-check/format/lint grün, „Alle
> Invarianten OK". EHRLICH: W1 beweist die MECHANIK (Fusion + Kohärenz rechnen richtig + werden
> konsumiert); ob es sich „echt anfühlt" ist der Schöpfer-Browser. **Nächst: W2 (der Keystone).**

**W2 — Die Appraisal-Brücke + der Hylomorphismus (EVENT → Appraisal → Emotion). DER
KEYSTONE. ✅ GEBAUT (V17.46).** `_appraise(event)` → Appraisal-Vektor (Valenz/Magnitude/Agency/Gewissheit/
Neuheit/Norm), gespeist aus (a) dem Ereignis-Typ, (b) der SUBSTANZ (`TAG_TO_EMOTION` über
`computeCompoundTags` — lebendig→+Valenz/Pflege, härte/scharf→+Erregung/Potenz, glut→
+Erregung/Bedrohung, resoniert→+Neuheit/Wunder, dichte→+Magnitude/Solidität), (c) dem δ
(V17.44). `APPRAISAL_TO_EMOTION` projiziert den Vektor auf die Achsen (über die W1-
Geometrie). `_feelAction` wird ein dünner Wrapper, der ein Event baut + appraised; die
bestehenden 6 Tat-Stellen wandern auf diesen Pfad (kein Regress: build mit Stein gibt
weiter joy, ABER build mit lebendigem Holz gibt peace/joy, eine Kathedrale mehr als eine
Box). `ACTION_TO_EMOTION` bleibt als FALLBACK für tag-lose Events. KONSUM: build(Holz) ≠
build(Stein) ≠ harvest(Glut) — die Emotion EMERGIERT aus der Substanz (gemessen, auf den 6
Achsen sichtbar); die Werkstatt-Schöpfung (Bauplan speichern) feuert Stolz ∝ Komplexität.
**EHRLICH (kein Passagier, V17.31):** der BEWEISBARE W2-Konsument ist die SUBSTANZ-
Differenzierung auf den 6 Achsen. Die Dimensionen Agency/Norm werden berechnet, aber sind
noch LATENT (das SUBSTRAT für W4/W5 — Zorn/Furcht/Schuld brauchen die sozialen/Kampf-
Konsumenten); W2 behauptet NICHT, sie schon zu konsumieren. *Heilt Schatten 1+5.*

> **GEBAUT (V17.46):** `AnazhRealm.TAG_TO_EMOTION` (frozen Resonanz-Tabelle über die 10
> Compound-Tags, GENAU wie `FIELD_TO_EMOTION` — Regel über Tabelle: lebendig→peace/joy,
> dichte→hope, brennbar→chaos/awe, magieleitung/resoniert→awe, …; sorrow erzeugt KEIN Tag) +
> `_appraiseSubstance(tags, magnitude)` (die Emotion EMERGIERT aus `computeCompoundTags` ×
> Magnitude) + `_substanceMagnitude(bp)` (∝ Part-Zahl, ~0.78–1.6, saturierend). **`_feelAction(type, opts)`
> ist die BRÜCKE:** base (ACTION_TO_EMOTION × Magnitude) + Substanz-Appraisal; ohne `opts`
> exakt V17.30 (kein Regress). Verdrahtet: confirmBuild `{blueprint}`, harvestArchitecture
> `{blueprint}`, assignCreatureTask `{creature}`, spawn_creature `{creature, magnitude∝count}`,
> + ein NEUER Akt `create` (define_blueprint-Op, NUR `ctx.source==="human"`) → Stolz ∝ Komplexität.
> **GEMESSEN-KONSUM (`checkBandV1746EmotionSubstance`, 14 grün):** lebendig→peace / dichte→hope /
> brennbar→chaos+awe, Achsen sauber getrennt, Magnitude linear + Tags>1 geklemmt, **END-TO-END
> build(lebendiges Holz) > peace als build(toter Stein) + build(Stein) > hope** (die Substanz-
> Differenzierung auf den 6 Achsen, der beweisbare Konsum), Magnitude end-to-end (Kathedrale >
> Box), der create-Akt → Stolz+Magie-awe + Source-Gate (Nexus löst KEINEN Stolz aus),
> confirmBuild übergibt die Substanz, KEIN Regress (build ohne opts = joy 0.1/hope 0.1), Fallback
> (explore tag-los). node-check/format/lint grün, „Alle Invarianten OK". **EHRLICH (Scope, kein
> Passagier):** gebaut ist die SUBSTANZ→Emotion-Brücke (Valenz via Tag-Resonanz + Magnitude via
> Komplexität — die konsumierten Dimensionen); der VOLLE Appraisal-Vektor (Agency/Norm/Gewissheit
> → Zorn/Furcht/Schuld differenziert) ist NICHT gebaut (er wäre ein Passagier ohne Konsument) —
> er kommt in W4/W5, wenn das Soziale/der Kampf ihn konsumieren. Ob es sich „echt anfühlt" ist der
> Schöpfer-Browser. **Nächst: W3 (Fast/Slow — Emotion vs. Stimmung, pro-Achse-Decay, Kongruenz).**

**W3 — Fast/Slow: EMOTION vs. STIMMUNG + pro-Achse-Decay + Stimmungs-Kongruenz. ✅ GEBAUT (V17.47).** Trenne
die schnelle Emotion (akuter Spike) von der langsamen Stimmung (`mood`, ein EMA-Vektor
über Minuten — das Temperament). Pro-Achse-Decay (`EMOTION_DECAY[axis]` — Furcht/chaos
schnell, sorrow/peace langsam, awe mittel) statt uniform 0.005. Stimmungs-kongruente
Bewertung: die Stimmung biast die Valenz neuer Appraisals (traurige Stimmung → neutrales
Event negativer) — GEBOUNDED (mild, kein Runaway; die V17.44-Feedback-Lehre). KONSUM:
Furcht spiked + verfliegt schnell, Trauer bleibt; eine trübe Stimmung färbt das nächste
Erleben (gemessen); die Stimmung ist die „Person mit Geschichte" (speist den LLM-Prompt +
das Journal). *Heilt die zeitliche Flachheit.*

> **GEBAUT (V17.47):** **(1)** `EMOTION_DECAY` (frozen, per-Achse-MULTIPLIKATOR auf
> `emotionDecayPerSec`: chaos 2.2 / awe 1.4 / joy 1.0 / hope 0.9 / peace 0.6 / sorrow 0.55 —
> Furcht verfliegt ~4× schneller als Trauer; Multiplikator 1 = exakt der alte uniforme Decay,
> der UI-Schieber bleibt der globale Tempo-Knopf). **(2)** `state.player.mood` (6-Achsen-EMA,
> `moodTau` 120 s, im `updatePlayerEmotions`-Tick aktualisiert, liest die FINALE Emotion des
> Ticks; reaktiv/nicht-persistiert, lazy-init für jeden Load-Pfad). **(3)** Stimmungs-Kongruenz
> in der V17.44-Appraisal: `_moodValence()` (∈[−1,1] via EMOTION_GEOMETRY) tönt den δ — ABER
> **NUR wenn ein REALER δ vorliegt (`|dsig| > deadzone`)** → bei konstanter Situation KEINE
> Kongruenz → **kein spontaner Stimmungs-Runaway** (die teure V17.44-Lehre an der Wurzel
> gewahrt: die Stimmung färbt die Interpretation eines EREIGNISSES, manufakturiert keines).
> `EMOTION_MOOD_CONGRUENCE` 0.08. **KONSUMENT:** `_emotionState(vec)` generalisiert (mit `p.mood`
> übergeben → der Stimmungs-Readout), `llmBuildSystemPrompt` trägt jetzt AKUT (Emotion) UND
> GRUNDSTIMMUNG (mood) getrennt — die KI kennt die „Person mit Geschichte". **GEMESSEN
> (`checkBandV1747FastSlow`, 9 grün):** Decay-Tabelle, **Furcht verfliegt schneller als Trauer**
> (pro-Achse end-to-end), die mood lagt + KONVERGIERT (das Temperament wächst), **eine trübe
> Stimmung dämpft die Freude eines guten Ereignisses** (Kongruenz), **KEIN Runaway** (trübe
> Stimmung + konstante Situation → keine Emotion), die KI kennt Grundstimmung (Trauer) ≠ akut
> (Freude), V17.30 heil (0.7 erreichbar). node-check/format/lint grün, „Alle Invarianten OK".
> EHRLICH: die Mechanik (Fast/Slow + Kongruenz, feedback-frei) ist bewiesen; ob das Temperament
> sich „echt anfühlt" ist der Schöpfer-Browser. **Nächst: W4 (das Soziale + die KI als Ko-Regulator
> — der freischaltet den vollen Appraisal-Vektor Agency/Norm, das in W2 bewusst Aufgeschobene).**

**W4 — Das Soziale: Contagion + Bindung + die KI als KO-REGULATOR. ✅ GEBAUT (V17.48).** (a) **Contagion:** die
Emotion naher Kreaturen fließt sanft in den Spieler (∝ Nähe × Bindung) + umgekehrt (der
Spieler-Affekt färbt nahe Kreaturen — teils da, vereinheitlicht). (b) **Bindung:** eine
`bond`-Stärke pro Kreatur (wächst mit gemeinsamer Zeit/Aufträgen); der Verlust einer
gebundenen Kreatur (`removeCreature`) → Trauer ∝ Bindung (ein echtes Event, kein flaches
peace). (c) **Die KI TENDET:** Grok liest die STIMMUNG (W3) + den Spieler-Text (echtes
NLU statt Stichwort, wenn das LLM aktiv ist) + gibt einen sanften Emotion-Nudge / eine
tröstende Geste (`deposit_emotion hope` nahe dem Spieler bei anhaltender Trauer; ein
Teilen bei Freude). KONSUM: ein freudiges Wesen nah hebt joy (gemessen); eine gebundene
Kreatur verlieren → sorrow ∝ bond; der Tend-Pfad feuert bei anhaltend niedriger Stimmung
(die VERDRAHTUNG headless; das echte NLU = Schöpfer-Browser + API-Key, V17.40-Lehre).
*Heilt Schatten 4 + den Beziehungs-Pfeiler (Symbiose).*

> **GEBAUT (V17.48):** **(a) Contagion** — `_tickEmotionContagion(delta)` (im KREATUR-Tick
> `updateCreatures`, NICHT im Emotion-Tick → die Emotion-Kern-Tests bleiben isoliert): die
> binäre Kreatur-Emotion (`creatureEmotions[i]` happy/sad) → ein Spieler-Ziel (`CONTAGION_TARGET`:
> happy→joy/peace, sad→sorrow), als RELAXATION zum Ziel (HEBEND, gebounded ≤ 0.5 → kann nicht
> runaway-en, die V17.44/V17.47-Disziplin ein drittes Mal); ∝ Nähe × Bindung. Der Spieler→Kreatur-
> Rückweg ist „teils da" (der 0.7-hope-Trigger setzt die Kreaturen happy) — hier der NEUE Vorweg.
> **(b) Bindung** — `creature.userData.bond` ∈ [0,1] (reaktiv, nicht persistiert wie der Task);
> wächst, während eine FOLGENDE Kreatur nah ist (gemeinsame Zeit) + bei der „folge mir"-Geste
> (bondFollowBump); gewichtet die Contagion + den Verlust. **(b2) Bond-Loss** — `_creatureNaturalDeath`
> feuert jetzt `_feelAction("loss", {magnitude})` mit `griefMag = 0.3 + bond·1.2 + lebendig·0.4`
> (statt flach +0.2): der Verlust einer GEBUNDENEN, lebendigen Gefährtin schmerzt VIEL mehr.
> **Der Appraisal-Punkt (OCC/§1.1): derselbe `lebendig`-Tag wird im VERLUST-Kontext zu SORROW,
> nicht zu joy wie in der W2-Bau-Brücke** — dasselbe Ding, anders bewertet je nach Kontext (darum
> ein expliziter Magnitude statt der Tag-Brücke). **(c) Ko-Regulation** — `_aiTendPlayer()` (aus
> `grokTick`): liest die langsame STIMMUNG (`_moodValence` W3) und TENDET bei anhaltend trüber
> Stimmung (< −0.35) eine tröstende Geste (Hoffnung + ein warmes Wort `comfort` + ein Emotion-
> Abdruck am Ort) — die KI PFLEGT, nicht nur kommentiert; self-limiting (der Hoffnungs-Schub hebt
> die Valenz → über der Schwelle stoppt der Trost → stabil). GEMESSEN (`checkBandV1748Social`, 13
> grün: Contagion happy→joy+peace / sad→sorrow, gebounded ≤0.5, die Bindung gewichtet + WÄCHST
> [folgen, nicht warten], der Verlust einer gebundenen Kreatur schmerzt MEHR, die KI tröstet bei
> Trübsal + NICHT ohne). node-check/format/lint grün, „Alle Invarianten OK". **EHRLICH (Scope,
> kein Passagier):** gebaut sind die sozialen FLÜSSE + die kontext-abhängige Verlust-Bewertung.
> Der VOLLE Agency/Norm-Vektor (die DIFFERENZIERUNG Zorn vs. Furcht vs. Schuld) ist NICHT gebaut
> — er braucht eine klare URSACHE (wer/was), die erst der KAMPF (W5) liefert; W4 hat dafür keinen
> Konsumenten (der Verlust hier ist „Umstand → Trauer", ein Agency-Typ, undifferenziert). Das
> echte NLU der KI = Schöpfer-Browser + API-Key (headless LLM-taub). **Nächst: W5 (Abenteuer +
> KAMPF über die Brücke — hier bekommt der Agency/Norm-Vektor endlich seinen Konsumenten).**

**W5 — Die volle Tat-Abdeckung über die Brücke: ABENTEUER ✅ GEBAUT (V17.49) + KAMPF (wartet).** Jetzt billig, weil
die Brücke (W2) steht: **Abenteuer** = ein Neuheits-Appraisal (ein grob-gerastertes
`visitedRegions`-Set → echte Neuheit > Wiederkehr; Distanz vom Ursprung; Kühnheit = in
karge/unwirtliche Aura) → awe + Mut (graduiert statt binär). **Kampf** (wenn die Mechanik
landet, von Anfang an über die Brücke): Angreifen → ein Agency+Potenz-Appraisal (chaos/
resolve ∝ Waffen-härte/scharf, Hylomorphismus); Bedroht-werden + keine Bewältigung →
Furcht; Besiegen → ein positiver δ (Triumph/Erleichterung); ein friedliches lebendig-Wesen
töten → Schuld (norm-negativ + self-agency → sorrow ∝ dessen lebendig). KONSUM: kühnes
Erkunden ≠ Pendeln (gemessen); Kampf-Affekt differenziert. *Heilt Schatten 2+3.* (Die
neuen Achsen — Zorn/Furcht/Stolz/Schuld — kommen HIER als Achsen dazu, wenn die Welt
Konsumenten hat [Kampf/Sozial]; bis dahin projizieren sie auf die 6.)

> **GEBAUT (V17.49) — die ABENTEUER-Hälfte:** `_exploreMagnitude(pcx, pcz)` (in
> `_setLastPlayerVoxelChunk`, dem explore-Hook): die Magnitude EMERGIERT aus (1) NEUHEIT
> (`state.visitedRegions`, ein Set, reaktiv + bounded: erste Begegnung `noveltyNew` 0.7 >
> Wiederkehr 0.05), (2) DISTANZ vom Ursprung (`min(1, dist/600)·0.4` — das epische Reisen),
> (3) KÜHNHEIT (`(1−lebendig)·0.5 + glut·0.5` aus `auraAt` × 0.5 — in das Karge/Glühende wagen
> = Mut, die Synergie mit dem Feld). `_feelAction("explore", {magnitude})` skaliert das base
> awe/hope → graduiert statt binär. GEMESSEN (`checkBandV1749Adventure`, 8 grün: Neuheit [neu >
> Wiederkehr], **HOLISTISCH kühnes Erkunden [neu+fern+karg] ≫ vertrautes Pendeln [Wiederkehr+
> nah+üppig]**, Kühnheit liest das Feld [karg > üppig], Distanz wired, die explore-Tat skaliert
> mit der Magnitude [awe graduiert], Hook wired, visitedRegions bounded). node-check/format/lint
> grün, „Alle Invarianten OK".
>
> **EHRLICH (Scope, gemessen): der KAMPF-Affekt ist NICHT gebaut — weil die Kampf-MECHANIK NICHT
> EXISTIERT** (gemessen: `damagePlayer` wird nur per DSL-Op gerufen; kein Spieler-Angriff, keine
> feindlichen Kreaturen, kein Kill-Pfad). Einen Zorn/Furcht/Schuld-Affekt ohne Kampf-Konsumenten
> zu bauen wäre der Passagier-Trugschluss (V17.31). Das SUBSTRAT ist fertig + wartet: die W1-
> Geometrie projiziert jede neue Achse auf den Raum, die W2-Brücke (`_feelAction(type, opts)` +
> `TAG_TO_EMOTION`) wertet jede Substanz (Waffen-härte/scharf → chaos/resolve), der W3-δ trägt
> Triumph/Erleichterung, der V17.44-δ die Bedrohung. **Wenn die Kampf-Mechanik landet, wird der
> Affekt von Anfang an eingewebt** (`_feelAction("attack", {weapon})` → Zorn ∝ härte; bedroht +
> keine-Bewältigung → Furcht; besiegen → δ-Triumph; ein friedliches lebendig-Wesen töten → Schuld
> ∝ dessen lebendig — derselbe Kontext-abhängige Appraisal wie der W4-Verlust). **Damit ist der
> Emotion-Kern-Bogen (W1–W5) in seiner BAUBAREN Tiefe KOMPLETT** (dimensional · Substanz · Zeit ·
> Sozial · Abenteuer); der Kampf-Affekt ist das EINE dokumentierte Future-Hook, das auf sein
> Feature wartet. **Nächst (jenseits des Emotion-Kerns): die Wertungs-Phase 4 (die Klammer) —
> jetzt ist `δ_spieler` REICH (differenziert, fusioniert, zeitlich, sozial) → die Welt kann
> LERNEN, was den Spieler freut (Black & White, generalisiert).**

---

## 5. Warum das alle Systeme FUSIONIERT (die „profi der profis"-Synthese, ehrlich)

Kein einzelnes akademisches Modell noch ein einzelnes Spiel tut ALL dies KOHÄRENT
zusammen: Appraisal-Differenzierung (FAtiMA/EMA/WASABI tun Appraisal, aber nicht die
dimensionale Fusion + die Welt-Substanz) · der dimensionale Raum + Fusion (PAD-Modelle
tun den Raum, aber nicht die reiche Appraisal-Ableitung) · die schnell/langsam-Dynamik +
Kongruenz (Emotions-Dynamik-Forschung, selten in Spielen) · das Soziale (Sims tut Needs,
nicht Appraisal-Emotion; Black & White tut Lernen, nicht Fusion) · **plus** der
Hylomorphismus (die Substanz speist das Appraisal — die Projekt-Eigenheit) **plus** der
Vorhersagefehler (V17.44). **Die Genialität ist nicht ein neuer Trick, sondern die TREUE
FUSION des Besten aus vier Disziplinen in EINE laufende Pipeline auf dem einen Stamm** —
und das ist es, was selten ist. (Ehrlich: „echter als Psychologen" ist Hyperbel — wir
implementieren TREU, was sie entdeckten, vollständiger fusioniert als üblich.)

**Die Synergie mit dem Wertungs-Bogen:** ein REICHES, differenziertes `δ_spieler` (aus
diesem Kern) macht die Phase-4-Klammer (`die Welt lernt, was dich freut`) erst MÄCHTIG —
sie selektiert dann Regeln nach echtem, differenziertem Erleben, nicht nach einer flachen
Valenz. Darum kommt dieser Kern VOR / NEBEN Phase 4.

---

## 6. Scope-Grenzen + Risiko (heilig)

- **Kein neues Modul, kein Parallelpfad, kein ML/Tensor.** Der Kern = Methoden (`_appraise`,
  `_emotionState`, `_feelEvent`) + frozen Daten (`EMOTION_GEOMETRY`, `APPRAISAL_TO_EMOTION`,
  `TAG_TO_EMOTION`, `EMOTION_DECAY`) auf dem einen Stamm. Die 6 Achsen + die Kanäle bleiben.
- **Die 0.7-Trigger + V17.30/V17.21/V17.44 bleiben heil** (jede Welle hat den Regressions-
  Wächter — der Emotion→Welt-Pfad darf nicht verstummen).
- **Reaktive Schicht** (Stimmung/Emotion sind nicht-persistiert wie heute, V9.67; das
  räumliche Overlay V17.32 bleibt die Welt-Spur). Determinismus: kein Worker-Mirror.
- **Feedback-Disziplin** (V17.44-Lehre): die Stimmungs-Kongruenz (W3) + die Contagion (W4)
  sind RÜCKKOPPLUNGEN → gebounded + getestet (keine Runaways; gegensätzlich gedämpft).
- **Die affektive WAHRHEIT ist der Schöpfer-Browser.** Headless beweist die MECHANIK
  (Differenzierung, Fusion, Dynamik rechnen richtig); ob es sich „echt anfühlt", ist das
  Erleben (V13-Render-Lehre auf Gefühl angewandt). Jede Welle benennt, was bewiesen ist
  (Mechanik) und was wartet (das Gefühl).

---

## 7. Reihenfolge + Abnahme

**W1 zuerst** (das dimensionale Substrat + Fusion — Daten + ein gentle Kohärenz-Term,
niedriges Risiko, der Boden für alles). Dann **W2** (die Appraisal-Brücke + Hylomorphismus
— der Keystone, der die flache Tabelle an der Wurzel heilt), **W3** (Fast/Slow + Dynamik),
**W4** (das Soziale + die KI-Ko-Regulation), **W5** (Abenteuer + Kampf über die Brücke).
Jede Welle: miss-vorher/nachher, KONSUM verifizieren (nicht Existenz), Regressions-Wächter
(die Trigger bleiben), playtest-grün, ein Commit, der Schöpfer-Browser für „fühlt es sich
richtig an". **Damit fühlt die Welt nicht 6 Zahlen, sondern ein differenziertes,
fusionierendes, atmendes, soziales Gefühl — das den Spieler, seine Taten, seine Substanz,
seine Kühnheit, seine Bindungen und seine Gespräche WIRKLICH liest.**

---

## 8. Abgleich — Vision · alte Lehren · bestehende Pfade (die Prüfung, dass es WIRKLICH genial + sicher ist)

**Vision (`state-of-realm.md`):**

- **Pfeiler 2 „Emotion treibt — formt Wetter, Kreaturen, Materie, Klang":** der Kern
  vertieft die EINGABE → ein reiches, differenziertes Gefühl treibt die bestehenden
  Konsumenten (0.7-Trigger, Welt-Tint, Wasser, die Phase-4-Klammer) STÄRKER. Dient dem
  Pfeiler direkt.
- **Die Achsen-Drift gelöst:** die Vision nennt „joy, awe, sorrow, hope, **longing,
  melancholy**"; implementiert sind joy/awe/sorrow/hope/**peace/chaos**. Die DIMENSIONALE
  Geometrie (W1) heilt das elegant — longing (+Valenz/−Erregung/Zukunft-Sehnen) und
  melancholy (−Valenz/−Erregung/wehmütig) sind PUNKTE im selben Raum wie peace/chaos ODER
  die Appraisal-Achsen (Zorn/Furcht/Stolz/Schuld). Die Geometrie macht den Achsen-Satz
  FLEXIBEL: die Vision-Achsen + die Kampf-/Sozial-Achsen sind nur weitere Punkte, KEINE
  neue Architektur. (Damit ist der Plan vision-treuER als der heutige fixe 6-Satz.)
- **Pfeiler 1 „Symbiose" + Pfeiler 5 „Grok spricht":** W4 (die KI als Ko-Regulator)
  erfüllt die im Vision-Doc NAMENTLICH-OFFENEN Fäden `interpretEmotionalSpeech` +
  `dreamWithPlayer` (state-of-realm §3) — die KI liest das emotionale Sprechen + antwortet/
  pflegt. Direkter Vision-Einlös, kein neuer Wildwuchs.

**Alte Lehren (CLAUDE.md / handover Gotchas):**

- **Heilige Lektion** (kein Re-Komplexifizieren; Stamm + Ringe): KEIN neues Modul —
  Methoden + frozen Daten auf dem einen Stamm; die 6 Achsen + Kanäle bleiben. ✓
- **„Verdichte, baue nie parallel" (V17.9):** die EINE Pipeline subsumiert die vier
  heutigen Kanäle (Tat/Feld/Chat/Situation), statt einen fünften daneben zu stellen. ✓
- **„Verify KONSUM, nicht Existenz" (V17.31):** jede Welle hat einen verifizierten
  Konsumenten; W2 behauptet NUR die Substanz-Differenzierung (nicht den vollen Vektor) als
  konsumiert — kein Passagier. ✓
- **„Harmonie statt Revert" (V17.23):** die W1-Kohärenz ist eine nachgebende Dämpfung
  (gentle, additiv), kein Überschreiben; getestet, dass die 0.7-Trigger erreichbar bleiben
  (notfalls separat/später, falls sie je in Spannung geraten). ✓
- **„Feedback-frei / Runaway-Disziplin" (V17.44 — die teuerste Lehre dieses Bogens):**
  W3 (Stimmungs-Kongruenz) + W4 (Contagion) sind RÜCKKOPPLUNGEN → gebounded + getestet
  (genau die Disziplin, die Phase 3 lehrte: die Situation/das Andere treibt, nicht das
  eigene Gefühl sich selbst). ✓
- **„Tabelle IST die Regel / Hylomorphismus":** EMOTION_GEOMETRY / APPRAISAL_TO_EMOTION /
  TAG_TO_EMOTION sind DATEN-Tabellen wie FIELD_TO_EMOTION — browser-justierbar, kein
  Sonderfall-Code. ✓
- **„Keine halben Schritte" (V17.30):** der Plan geht an die WURZEL (die Appraisal-Brücke),
  nicht ein Pflaster auf die flache Tabelle. ✓

**Bestehende Pfade (der Code, gemessen):** `updatePlayerEmotions` (der EINE Emotion-Tick —
die Pipeline lebt DARIN, kein zweiter Tick) · die 6 Achsen (der Readout, bleiben) ·
`_feelAction` (wird der Event-Wrapper) · `computeCompoundTags` (das Tag-Substrat, DA) · das
räumliche Overlay (V17.32, die Welt-Spur bleibt) · der 0.7-Trigger + die kontinuierlichen
Kopplungen (V17.31, bleiben) · die V17.44-Baseline (wird zur Stimmung in W3) · Grok-
`emotionShift` (wird zu W4 vertieft). **KEIN Pfad wird gebrochen; jeder wird verdichtet.**

**Fazit:** genial NICHT durch einen Trick, sondern durch die treue Fusion von vier
Disziplinen + die Vereinheitlichung der Kanäle; ROBUST durch die Feedback-Disziplin + die
Regressions-Wächter + die reaktive Schicht; STRUKTURIERT foundation-first (W1→W5);
SYNERGETISCH mit dem Wertungs-Bogen (ein reiches `δ_spieler` macht die Phase-4-Klammer erst
mächtig). Vision-treu (löst sogar die Achsen-Drift + erfüllt named-offene Fäden), lehren-
konform, pfad-kompatibel. Sauber.
