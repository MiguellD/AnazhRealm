# Die lebendige Wertung — das Feld, das URTEILT (Vorhersagefehler als die EINE Gleichung)

> **Lies das ZUERST, wenn du an „Regel-Fitness", „der Psychologie / Emotion des
> Spielers", „selbst-lernende / wachsende Regeln", „macht-die-Welt-schöner-Fitness"
> oder „die Welt lernt, was den Spieler glücklich macht" arbeitest.** Es hält die
> Reflexion vom 02.06.2026 fest: WARUM die zwei Wertungs-Systeme (Regel-Fitness +
> Emotion) heute flach sind — gemessen, nicht behauptet —, wie es die GRÖSSTEN
> lösten, und der EINE Hebel (Vorhersagefehler gegen eine gleitende Baseline), der
> beide mit einer bewährten Gleichung echt macht, bei minimalem Hardcode. Stand:
> nach **V17.41** (der Gesetzes-Faden — die Regeln sind jetzt SICHTBAR; dieser Bogen
> macht sie WERTVOLL). Verwandte Anker: `das-lebendige-feld.md` (der wahre Norden —
> das dritte Verb „werten" gehört dorthin), `dsl-weltregeln-plan.md` (der Regel-Satz,
> auf dem dies aufsetzt), `state-of-realm.md` (Pfeiler 2: „Emotion treibt alles").

---

## 0. Reflexion — die zwei flachen Wertungen (GEMESSEN, ehrlich)

Der DSL-Weltregeln-Bogen (V17.33–.40) baute den **Körper der Evolution**: Variation
(`dslComposeRule`), Heredität (`_composeNexusRule` mutiert Überlebende), Selektion
(`_worldRuleFitness` am ttl-Ende), Lebenszyklus (renew/decay). Korrekt gebaut. **Aber
der Selektionsdruck ist ein Platzhalter, und die Emotion ist ein Reflex.**

**(1) Die Regel-Fitness selektiert auf VIABILITÄT, nicht WERT — gemessen-durchgerechnet.**
`_worldRuleFitness` = `0.4·costScore + 0.6·successScore`, gegated auf `fires>0`. Ein
Regel-Effekt (Wetter setzen, Leben deponieren) kostet < 0.1 ms → `costScore = 1 −
avgMs/4ms ≈ 0.98`; keine Exception → `successScore = 1 − errors/fires = 1.0` → **jede
feuernde, nicht-crashende Regel bekommt Fitness ≈ 0.99** (`renewFitness` ist 0.5). Die
Fitness hat **unter den lebenden Regeln praktisch keine Auflösung** — sie ist ~1.0 für
alles, was billig läuft. „Selektion" heißt in Wahrheit nur: das Inerte (`fires==0`,
Bedingung nie wahr) + das Kaputte (häufige Exceptions) ausräumen. **Kein Gradient
Richtung GUT.** Eine Regel, die Leben in den Mangel trägt (echt heilend), und eine,
die sinnlos das Wetter umklappt, haben **identische Fitness**, solange beide billig
feuern. Evolution ohne wertenden Druck = Zufallsbewegung in einem festen Pool — sie
SIEHT lebendig aus (Regeln erscheinen, feuern, verfallen), aber sie **lernt nicht** und
**verbessert nicht**. Karl Sims (1994) hatte Fitness = „kann es schwimmen / laufen"
(Welt-Ergebnis); wir haben „kostet der Code wenig" (Code-Gesundheit). **Wir sind hinter
30 Jahre alter Genetic Programming**, weil deren Fitness die Leistung in der WELT maß,
unsere die Gesundheit des CODES.

**(2) Die Emotion ist ein Reflex, kein Geist.** `ACTION_TO_EMOTION` ist eine feste
Tabelle: `build → joy+0.1`, IMMER. Das 100. Haus ist so freudig wie das erste — keine
Gewöhnung, kein Kontext, keine Sättigung. Sechs unabhängige, additive Achsen (sorrow
UND joy können gleichzeitig 0.9 sein = inkohärent — es gibt keinen emotionalen ZUSTAND,
nur sechs zerfallende Akkumulatoren), uniformer Decay (Ehrfurcht verfliegt so langsam
wie Trauer), eine 0.7-Stufen-Schwelle (bis 0.69 passiert auf Regel-Ebene NICHTS, dann
schnappt ein diskreter Effekt). Es evaluiert **Reiz, nicht Erleben** — Pawlow, kein
Affekt. The Sims (Sättigung, Bedürfnis-Decay-Kurven, sozialer Kontext) + Black & White
(die Kreatur LERNT eine Wertfunktion aus Feedback) sind psychologisch realer.

**Das Urteil (ohne Glätte):** Wir haben die **bessere BÜHNE** als irgendwer gebaut (das
vereinte read+write-Feld, der Drei-Autoren-Regel-Satz in EINER Sprache) — und ein
**flacheres STÜCK** darauf gestellt (Viabilitäts-Selektion + Reflex-Emotion). Das
Substrat ist voraus, die Wertung ist zurück. **Und der Schlüssel:** das Substrat selbst
(räumliches Feld mit Gedächtnis, V17.27/.32) ist genau das, was die Wertung echt macht.
Der Vorgänger nannte „die emotionale Fitness wartet auf eine ehrliche Wurzel-Lösung" —
er sah nicht, dass das **räumliche** Feld sie schon möglich macht (lokale, kausale
Attribution statt globalem Passagier-Trugschluss).

---

## 1. Was BESTEHT (gemessen aus dem Code, 02.06.2026)

- **`auraAt(x,z,t)`** — die Lese-Seite (frozen Kern `worldFieldAt` + `_lifeOverlay` +
  `_emotionOverlay`). Das Maß, das die Wertung liest.
- **`_lifeField` / `_emotionField`** — sparse 16-m-Zell-Maps, lazy-Decay, `_depositLife`/
  `_depositEmotion` schreiben, `_pruneLifeField`/`_pruneEmotionField` halten sie bounded.
  **Das exakte Muster für die Baseline-Map** (kein neues Strukturen-Design nötig).
- **`_worldRuleFitness(rule)`** — die heutige Viabilitäts-Fitness; im `_tickWorldRules`-
  ttl-Zweig konsumiert (renew wenn ≥ `renewFitness` UND `fires>0`, sonst decay).
- jede Regel trägt schon `fires` / `costMsSum` / `errors` / `lastFired` / `fitness` —
  die Akkumulatoren, an die `rule.value` (das Wert-Signal) andockt.
- **`updatePlayerEmotions`** — Decay (0.005/s) + Feld-Drift (`FIELD_TO_EMOTION`) +
  HP-Zustand + die sechs 0.7-Trigger. Hier dockt der Appraisal-Kanal an.
- **`_feelAction` / `ACTION_TO_EMOTION`** (V17.30) — die Taten→Emotion-Tabelle; wird
  zum „Sofort-Appraisal"-Keim verdichtet (nicht ersetzt — V17.9-Disziplin).
- **Russell-Valenz ist IMPLIZIT schon da:** die Trigger zeigen es — joy/peace/hope sind
  positiv (warmer Himmel, ruhige Kreaturen), sorrow/chaos negativ (Regen, Hast). Die
  Vorzeichen sind also nicht neuer Hardcode, sondern die schon gelebte Affekt-Struktur.

---

## 2. Wie die GRÖSSTEN es lösten — die bewährten Gleichungen (eine Idee, viele Felder)

**ALLE konvergieren auf EINE Idee:** _ein gleitender Referenzpunkt + die Abweichung
davon = die universelle Währung von Lernen UND Affekt._ Das ist nicht meine Erfindung
— es ist die übereinstimmende Antwort von Reinforcement Learning, Neurowissenschaft,
Verhaltensökonomie und Spiel-KI:

| Disziplin             | Wer (Referenz)                                   | Die Gleichung / die Lehre                                                                                                                                       |
| --------------------- | ------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Reinforcement L.      | Sutton & Barto; Williams 1992 (REINFORCE)        | TD-Fehler `δ = r + γ·V(s′) − V(s)`; **Advantage** `A = R − b` (Baseline b subtrahiert → nur die ABWEICHUNG über das Erwartete zählt, das reduziert die Varianz) |
| Neurowissenschaft     | Schultz / Montague / Dayan 1997                  | Dopamin = **Reward Prediction Error**: Belohnung MINUS Erwartung — buchstäblich der TD-Fehler im Hirn. **Gefühl = Überraschung**, nicht Niveau.                 |
| Verhaltensökonomie    | Kahneman & Tversky 1979 (Prospect Theory)        | Wert wird über VERÄNDERUNGEN relativ zu einem **Referenzpunkt** definiert (nicht über absolute Niveaus), mit abnehmender Empfindlichkeit.                       |
| Hedonische Adaptation | Helson 1964 (Adaptation-Level); Brickman (Tretmühle) | Wohlbefinden adaptiert an eine **gleitende Baseline** (die „hedonic treadmill") — DER exakte Mechanismus für „das 100. Haus berührt nicht mehr".          |
| Affekt-Struktur       | Russell 1980 (Circumplex)                        | Affekt = **Valenz × Erregung**. Die Vorzeichen der 6 Achsen sind PRINZIPIELL (joy/peace/hope +, sorrow/chaos −, awe ambivalent), kein willkürlicher Hardcode.  |
| Appraisal             | Ortony/Clore/Collins 1988 (OCC)                  | Emotion = **Bewertung** eines Ereignisses gegen Ziele/Erwartung — kein Reiz-Reflex.                                                                            |
| Spiel-KI              | The Sims (utility/needs); Black & White (Evans 2002); Karl Sims 1994 | Nutzen = erwartete Bedürfnis-Änderung; die Kreatur **LERNT** ihre Wertfunktion aus Feedback; Fitness = Welt-ERGEBNIS, nicht Code-Gesundheit.    |

**Das Lehrstück:** das 60 Jahre alte **EMA-Tiefpassfilter** (ein Ein-Pol-IIR)

```
baseline ← baseline + α·(x − baseline)        // α = 1 − exp(−Δt/τ), τ = Zeitkonstante
```

plus die Differenz `δ = x − baseline` ist die EINE Gleichung. Sie ist **parameterarm**
(ein α pro Zeitskala), bewährt über Jahrzehnte, und sie **subsumiert beide flachen
Systeme** — Regel-Fitness UND Emotion sind dasselbe `δ`, an verschiedenen Orten gemessen.
Das ist der „profi-der-profis"-Hebel: nicht ein cleverer neuer Mechanismus, sondern die
EINE Gleichung, auf die alle Großen unabhängig kamen.

---

## 3. Die VISION — das DRITTE Verb des Feldes: WERTEN

Das lebendige Feld **LIEST** (V17.21: `auraAt`) und **SCHREIBT** (V17.27/.32:
`_depositLife`/`_depositEmotion`). Der fehlende dritte Verb ist **WERTEN**:

```
   LESEN  (auraAt)          →   die Welt SPÜRT sich         (V17.21)
   SCHREIBEN (deposit*)     →   die Welt VERÄNDERT sich     (V17.27/.32)
   WERTEN  (δ = x−baseline) →   die Welt URTEILT über sich  (dieser Bogen)
```

Das Feld erinnert sich, wie ein Ort / der Spieler USUALLY ist (die Baseline) → es misst,
was sich wo ÄNDERTE (der Vorhersagefehler) → daraus **selektiert es seine Regeln** (was
hebt das Wohl?) UND **fühlt es seine Emotion** (was ist besser/schlechter als erwartet?).
Erst mit dem dritten Verb wird `das-lebendige-feld` wirklich erreicht: die Welt versteht
nicht nur, sie **wertet** — und wächst dadurch Richtung GUT, nicht nur Richtung lauffähig.

---

## 4. Die EINE Gleichung — konkret (zwei Skalen, ein Filter, minimaler Hardcode)

**(a) Das Wohl-Maß.** Zwei Schichten, bewusst getrennt (der Anti-Gaming-Schlüssel, §6):

- **`_fieldWohlStruktur(aura) = lebendig`** — das OBJEKTIVE, strukturelle Wohl eines
  Ortes. `lebendig` ist schwer zu faken (es ist eine ÖKOLOGISCHE Folge — eine Regel hebt
  es nur, indem sie Leben spawnt, das dann lebt + tendet [V17.29-Trickle]; es sättigt +
  zerfällt). **Das ist das Fitness-Maß für Regeln.**
- **`_fieldWohlErlebt(aura) = valenz(emotion)`** mit `valenz = joy + peace + hope −
  sorrow − chaos` (Russell-Vorzeichen, prinzipiell). Das SUBJEKTIVE, gefühlte Wohl. **Das
  ist das Appraisal-Maß für die Spieler-Emotion.**

**(b) Die gleitende Baseline** (eine sparse Map wie `_lifeField`, lazy-EMA pro 16-m-Zelle
für das Struktur-Wohl; ein Skalar für das Spieler-Erleben):

```
baseline_zelle ← baseline_zelle + α_feld·(wohlStruktur(aura@zelle) − baseline_zelle)
baseline_spieler ← baseline_spieler + α_spieler·(wohlErlebt(aura@spieler) − baseline_spieler)
```

τ_feld ~ Minuten (ein Ort re-normalisiert langsam), τ_spieler ~ zig Sekunden (Gewöhnung
in einer Sitzung). Zwei Zeitkonstanten — der GESAMTE neue „Hardcode".

**(c) Regel-Fitness = lokaler struktureller Vorhersagefehler (das Advantage-Signal).**
Wenn eine Regel an Ort P feuert (ihr Effekt hat eine Position — `at_field_need`/
`at_player`/`at_player`-Default):

```
reward = wohlStruktur(aura@P)_nach_Fenster − baseline_P     // wie weit über die Erwartung des Orts?
rule.value ← rule.value + β·(reward − rule.value)            // EMA über das Lebens-Fenster
```

`rule.value` ist ein per-Regel **Advantage-Schätzer** (REINFORCE-mit-Baseline). Die
Fitness wird wert-dominant: `_worldRuleFitness` → `value` ist die diskriminierende Achse,
`successScore`/`fires>0` bleiben als **Wächter** (eine crashende/inerte Regel stirbt
weiter). Jetzt hat `renewFitness` echte Auflösung: eine heilende Regel (`value>0`) wird
erneuert, eine sinnlose (`value≈0`) verfällt.

**(d) Spieler-Emotion = Appraisal (Vorhersagefehler des Erlebens).** In
`updatePlayerEmotions`:

```
δ = wohlErlebt(aura@spieler) [+ hp-Term + Sofort-Appraisal der Tat] − baseline_spieler
δ > 0 → joy += k·δ, hope += k′·δ       // positive Überraschung → Freude/Hoffnung
δ < 0 → sorrow += k·|δ|, chaos += k′·|δ|  // negative Überraschung → Trauer/Unruhe
```

**Gewöhnung fällt UMSONST heraus:** anhaltend Gutes hebt `baseline_spieler` → `δ`
schrumpft → das 100. Haus bewegt joy kaum, eine plötzliche Besserung nach einer Flaute
gibt einen joy-Puls (Prospect Theory + Dopamin-RPE, exakt). `ACTION_TO_EMOTION` bleibt
als kleiner **Sofort-Appraisal-Keim** (die Tat selbst ist ein Mikro-Vorhersagefehler:
„ich tat etwas Konstruktives" → kleiner Sofort-+), aber die ANHALTENDE Stimmung ist
δ-getrieben. V17.30 wird VERTIEFT, nicht ersetzt (Verdichtung).

---

## 5. Der PHASEN-PLAN (die Teilschritte — additiv, je gemessen, kein Urknall)

Wie der DSL-Bogen: kleine Wellen unter V17 (V17.42, .43, …), jede ein Commit + ein
Test-Band + ein `handover.md`-Eintrag; bei Bogen-Abschluss + Schöpfer-Sign-off der
MAJOR-Kandidat V18.

**Phase 1 (V17.42) — Das Wohl-Maß + die gleitende Baseline (das Fundament der Wertung).**
`_fieldWohlStruktur`/`_fieldWohlErlebt` + die Baseline-Map (reuse `_lifeField`-Muster) +
der Spieler-Baseline-Skalar; lazy-EMA, im bestehenden Emotion-/Welt-Tick aktualisiert.
**Noch KEIN Konsument** (reine Mess-Schicht). KONSUM-Test: die Baseline verfolgt eine
anhaltende Änderung mit der RICHTIGEN Zeitkonstante (eine Stufe → exponentielle
Annäherung, Halbwertszeit ≈ ln2·τ); `wohlStruktur` steigt mit `lebendig`, `wohlErlebt`
mit Valenz (joy hebt, sorrow senkt). Das ist „miss, bevor du selektierst".

**Phase 2 (V17.43) — Lokal-attribuierte Regel-Fitness (die Regeln werden ECHT).**
Snapshot-bei-Feuern (Ort + `baseline_P`) → verzögerte Messung (nächstes Fenster) →
`reward` → EMA in `rule.value`; `_worldRuleFitness` umverdrahtet (wert-dominant, Wächter
behalten). **KONSUM-Test (das Genie der Messung — was die alte Fitness NICHT konnte):**
eine heilende Regel (`deposit_life at_field_need`) akkumuliert positives `value` + wird
am ttl-Ende erneuert; eine sinnlose Churner-Regel (Wetter-Flip ohne Wohl-Gewinn)
akkumuliert `value≈0` + verfällt → über ein Fenster ist der ÜBERLEBENDE Regel-Satz
**angereichert für Wert** vs. einem Zufalls-Baseline. Das ist der erste echte
Selektions-Gradient.

**Phase 3 (V17.44) — Emotion als Appraisal (Psychologie statt Reflex).**
Spieler-Baseline + der δ-Kanal in `updatePlayerEmotions`; `ACTION_TO_EMOTION` schrumpft
zum Sofort-Keim. **KONSUM-Test (psychologische Signaturen, gemessen):** Gewöhnung
(dieselbe Tat wiederholt → abnehmende joy-Hebung), Erleichterung (Erholung aus niedriger
HP / aus einer trüben Region → joy-Puls aus dem Vorzeichen-Wechsel von δ), Überraschung
(plötzliche Feld-Besserung → joy-Puls). Echte Affekt-Dynamik, nicht eine flache Tabelle.

**Phase 4 (V17.45, KÜR) — Der Kreis: die Welt lernt, was DICH glücklich macht.**
Die Klammer: `rule.value` und `δ_spieler` sind DASSELBE Vorhersagefehler-Signal an
verschiedenen Orten. Eine Regel, die nahe dem Spieler feuert UND mit einem positiven
`δ_spieler` zusammenfällt, bekommt Bonus-Credit → der Nexus **evolviert Regeln, die das
Erleben des Spielers heben** (Black & Whites Kreatur, generalisiert auf Welt-Logik). Das
ist der Punkt, an dem es „besser als die Profis" wird: ein selbst-evolvierender Regel-
Satz, selektiert durch die affektive Antwort des Spielers, alles aus EINER Gleichung.
**Vorsichtig + ehrlich** (Reward-Hacking-Gefahr, §6); „fühlt es sich richtig an" ist der
Schöpfer-Browser-Audit.

---

## 6. Die harten Probleme + Lösungen (profi der profis — die Wurzeln, nicht Pflaster)

1. **Reward-Hacking: „lass die Regel nicht ihre eigene Hausaufgabe benoten"** (der
   tiefste Punkt, der Cousin des V17.31-Passagier-Trugschlusses). Eine Regel, deren
   Effekt `deposit_emotion(joy)` ist, würde ein Wohl-Maß, das Emotion enthält, TRIVIAL
   heben → sie gamt die Fitness. **Lösung durch Konstruktion (die Schicht-Trennung §4a):**
   die Regel-Fitness misst `wohlStruktur = lebendig` (ÖKOLOGISCH, schwer zu faken — eine
   Regel hebt Leben nur, indem sie Leben spawnt, das lebt+tendet+sättigt+zerfällt), NICHT
   die direkt-gestempelte Emotion. Eine reine `deposit_emotion`-Regel hebt `lebendig`
   nicht → `value≈0` → kein Gaming. **Zweite Verteidigung — die Homöostase-Baseline:**
   die Baseline absorbiert den EIGENEN anhaltenden Effekt einer Regel → um zu punkten,
   muss sie NETTO über die (steigende) Erwartung liefern, nicht coasten. Die volle
   Anti-Gaming-Form (kontrafaktisch: „was wäre das Wohl OHNE diese Regel") ist
   Counterfactual/Shapley → bewusst NICHT jetzt (Over-Engineering); die lokale Baseline
   ist „ehrlich + gut genug", weit besser als ein globales Signal.

2. **Credit-Assignment-Rest:** zwei Regeln am selben Ort teilen sich den Credit (die
   Baseline-Subtraktion trennt das AMBIENTE, nicht zwei gleichzeitige absichtliche
   Regeln). Ehrliche Grenze, benannt — die lokale Attribution ist trotzdem ein
   Quantensprung über das globale joy-Signal (das der Passagier-Trugschluss ist).

3. **Determinismus / Multi-User:** `baseline` + `value` sind die REAKTIVE Schicht (wie
   die Overlays) — nicht persistiert, kein Worker-Mirror. Über Peers können die
   LEBENSDAUERN ephemerer Nexus-Regeln divergieren (jede Welt wertet aus IHREM lokalen
   Erleben). Das ist **vision-treu, kein Bug** (jede Welt evolviert Richtung IHRES
   Spielers); die Mensch-/gepinnten Regeln bleiben permanent = der geteilte Anker. Regeln
   FEUERN weiter deterministisch (die `_worldRuleSeed`-RNG, V17.33); nur ihr renew/decay
   hängt am lokalen Wert.

4. **Performance (heilig):** die Baseline-EMA ist O(1) pro Zelle, lazy (das Overlay-
   Muster); die Reward-Messung ist verzögert (ein Snapshot bei Feuern, ein Read im
   nächsten Eval-Fenster) — kein per-Frame-Sweep, lebt in den bestehenden Ticks. Die 119
   FPS bleiben unberührt.

5. **Cold-Start = korrektes Verhalten:** eine frische Baseline = die erste Beobachtung
   (anfangs keine Überraschung) → die ersten Taten fühlen sich STARK an (Baseline
   niedrig), dann Gewöhnung. Eine neue Welt ist voller Staunen, dann normalisiert sie —
   genau richtig, kein Sonderfall.

6. **Maintenance-vs-Gaming-Spannung (Phase-2-Messung):** die Homöostase-Baseline
   bestraft Coasten — aber eine GUTE Erhaltungs-Regel (halte diese Region lebendig)
   punktet irgendwann ~0 (die Baseline schließt sie ein). Das exakte Reward-Fenster +
   ob `value` über `wohl − baseline` (Advantage) oder `Δwohl` (rohe Änderung) läuft, ist
   eine **Phase-2-MESSUNG** (welche Form gibt echte Diskriminierung OHNE Gaming/
   Oszillation), nicht im Plan festgelegt — die Gleichung steht, die Konstante wird im
   Bau gemessen (V9.58-Empirie-Disziplin).

---

## 7. Die SYNERGIEN (warum das maximal effizient ist — und WENIGER Hardcode)

- **Reuse pur:** `auraAt` (Lesen), das `_lifeField`-Sparse-Map-Muster (Baseline), die
  Regel-Akkumulatoren, `updatePlayerEmotions`, `_worldRuleFitness`, `_tickWorldRules`.
  Kein neues Modul, kein Parallelpfad (V17.9 / Heilige Lektion).
- **EINE Gleichung heilt ZWEI flache Systeme** — das ist die geniale Vereinfachung, das
  Gegenteil von Re-Komplexifizierung: `ACTION_TO_EMOTION` (7 Einträge) + die
  Stichwort-Listen werden SEKUNDÄR; der PRIMÄRE Treiber ist die gemessene Welt-Änderung.
  **Weniger Hardcode, nicht mehr** (eine prinzipielle Valenz + zwei Zeitkonstanten
  ersetzen eine Tabelle voller Magie-Zahlen).
- **Die geniale Klammer (Phase 4):** Regel-Wert UND Spieler-Emotion sind DASSELBE δ →
  die Welt evolviert Regeln, die den Spieler-Appraisal heben. Das ist der Punkt, an dem
  das vereinte Feld + der Drei-Autoren-Regel-Satz ihre wahre Frucht tragen: die Welt
  LERNT, was dich freut — eine Fähigkeit, die kein kommerzielles Spiel auf komponierbarer
  Welt-LOGIK hat.

---

## 8. Was NICHT in dieses Vorhaben gehört (Scope-Grenzen, heilig)

- **Keine ML-Bibliothek, kein neuronales Netz, kein Gradient-Descent-Training.** Die
  „bewährte Gleichung" ist ein EMA + eine Differenz — bewusst minimal (TF.js wurde 2026
  als toter Code entfernt; das hier braucht keinen Tensor). Wer ein RL-Framework
  einziehen will → STOP, das ist die Heilige-Lektion-Sünde.
- **Kein Anfassen des frozen Worldgen / Determinismus / Multi-User-Seeds.** Baseline +
  Wert sind reaktiv (nicht persistiert, kein Mirror).
- **Keine neue Welt-Achse, kein neues `_tickX`.** Das Wert-Signal lebt in den
  bestehenden Emotion-/Regel-Ticks; `wohl` ist ein Read über `auraAt`.
- **Kein per-Frame-Sweep über alle Zellen.** Lazy-EMA, verzögerte Reward-Messung.

---

## 9. Reihenfolge + Abnahme (der konkrete nächste Schritt)

**Phase 1 zuerst (V17.42):** `_fieldWohlStruktur`/`_fieldWohlErlebt` + die Baseline-Map
+ der Spieler-Baseline-Skalar, lazy-EMA, im bestehenden Tick. Reine Mess-Schicht, kein
Konsument → null Verhaltens-Risiko, das Fundament steht. KONSUM-Test: die Baseline
verfolgt eine Stufe mit der richtigen Halbwertszeit; `wohl` steigt/fällt korrekt.
node-check/format/lint + voller Playtest grün. Dann Phase 2 (Regel-Fitness), 3 (Emotion-
Appraisal), 4 (die Klammer). Jede Welle: miss-vorher/nachher, KONSUM verifizieren (nicht
Existenz — V17.31-Lehre), Schöpfer-Browser für „fühlt es sich richtig an" (die psycho-
logische/affektive Wahrheit ist headless nur in der Mechanik beweisbar, nicht im Erleben).

**Damit wird die Vision wahr, die die Bühne schon trägt:** die Welt liest, schreibt UND
**urteilt** — die Regeln wachsen Richtung GUT (nicht nur lauffähig), die Emotion wird
gefühlt (nicht gezählt), und am Ende lernt die Welt, was DICH freut. Profi der Profis:
nicht durch einen cleveren Trick, sondern durch die EINE Gleichung, auf die alle Großen
kamen — minimal, bewährt, auf dem einen Stamm.
