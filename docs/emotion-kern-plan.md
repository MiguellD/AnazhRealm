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

**W1 — Das dimensionale Substrat + die FUSION (die Geometrie).** `AnazhRealm.EMOTION_
GEOMETRY` (frozen: jede Achse → `{valenz, erregung}`) + `_emotionState()` → der fusionierte
READOUT: das DOMINANTE Gefühl + der Valenz/Erregung-Schwerpunkt + die INTENSITÄT (Abstand
vom Neutralen). Plus eine SANFTE Kohärenz in `updatePlayerEmotions` (gegensätzliche Achsen
dämpfen sich mild → der Zustand ist ein kohärenter Punkt, nicht 6 unabhängige Maxima) —
ADDITIV + gentle, getestet dass die 0.7-Trigger erreichbar BLEIBEN (V17.30-Wächter).
KONSUM: bittersüß (joy+sorrow hoch) → Valenz ~0 ABER Intensität hoch + ein dominantes
Gefühl emergiert (die Fusion, messbar); der Readout speist Journal/UI/KI mit einem
REICHEN Zustand statt 6 Zahlen. *Risiko niedrig (Geometrie ist Daten; Kohärenz gentle +
getestet).* — **Das Substrat, auf dem L2/L3 stehen.**

**W2 — Die Appraisal-Brücke + der Hylomorphismus (EVENT → Appraisal → Emotion). DER
KEYSTONE.** `_appraise(event)` → Appraisal-Vektor (Valenz/Magnitude/Agency/Gewissheit/
Neuheit/Norm), gespeist aus (a) dem Ereignis-Typ, (b) der SUBSTANZ (`TAG_TO_EMOTION` über
`computeCompoundTags` — lebendig→+Valenz/Pflege, härte/scharf→+Erregung/Potenz, glut→
+Erregung/Bedrohung, resoniert→+Neuheit/Wunder, dichte→+Magnitude/Solidität), (c) dem δ
(V17.44). `APPRAISAL_TO_EMOTION` projiziert den Vektor auf die Achsen (über die W1-
Geometrie). `_feelAction` wird ein dünner Wrapper, der ein Event baut + appraised; die
bestehenden 6 Tat-Stellen wandern auf diesen Pfad (kein Regress: build mit Stein gibt
weiter joy, ABER build mit lebendigem Holz gibt peace/joy, eine Kathedrale mehr als eine
Box). `ACTION_TO_EMOTION` bleibt als FALLBACK für tag-lose Events. KONSUM: build(Holz) ≠
build(Stein) ≠ harvest(Glut) — die Emotion EMERGIERT aus der Substanz (gemessen); die
Werkstatt-Schöpfung (Bauplan speichern) feuert Stolz ∝ Komplexität. *Heilt Schatten 1+5.*

**W3 — Fast/Slow: EMOTION vs. STIMMUNG + pro-Achse-Decay + Stimmungs-Kongruenz.** Trenne
die schnelle Emotion (akuter Spike) von der langsamen Stimmung (`mood`, ein EMA-Vektor
über Minuten — das Temperament). Pro-Achse-Decay (`EMOTION_DECAY[axis]` — Furcht/chaos
schnell, sorrow/peace langsam, awe mittel) statt uniform 0.005. Stimmungs-kongruente
Bewertung: die Stimmung biast die Valenz neuer Appraisals (traurige Stimmung → neutrales
Event negativer) — GEBOUNDED (mild, kein Runaway; die V17.44-Feedback-Lehre). KONSUM:
Furcht spiked + verfliegt schnell, Trauer bleibt; eine trübe Stimmung färbt das nächste
Erleben (gemessen); die Stimmung ist die „Person mit Geschichte" (speist den LLM-Prompt +
das Journal). *Heilt die zeitliche Flachheit.*

**W4 — Das Soziale: Contagion + Bindung + die KI als KO-REGULATOR.** (a) **Contagion:** die
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

**W5 — Die volle Tat-Abdeckung über die Brücke: ABENTEUER + KAMPF.** Jetzt billig, weil
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
