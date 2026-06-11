# Das lebendige Feld — der wahre Norden (Vision-Anker)

> **Lies dieses Dokument ZUERST, wenn du an „der lebendigen Welt", „Emotion ↔ Welt",
> „Kreaturen lebendiger", „dem Nexus", „der DSL", „fraktalem Wachstum" oder „der KI
> als Co-Schöpfer" arbeiten willst.** Es hält den wahren Norden des Projekts fest —
> die EWIGE Vision (§1–§2), wie sie GEMESSEN im Code verkörpert ist (§3–§5), und den
> Vektor, der noch vorwärts zeigt (§6–§7). Damit der nächste Agent NICHT wieder ein
> Pflaster-System baut, sondern auf dem Vorhandenen weiterwächst.

**Stand: V18.94 (10.06.2026) — der ganze Seelen-Bogen ist DURCH und im Code GEMESSEN; seit
V18.84–.94 FLIESST auch der Körper (der Wasser-CA-Bogen, vollendet + gemergt). Der Master-Blick
über alle Säulen vorwärts: `docs/archiv/gigant-plan.md`.**
Die Reflexion vom 01.06.2026 (Schöpfer + Agent) kartierte eine Vision, die als Hülle
stand, aber an fünf Stellen flach war. Diese fünf Stellen sind seither GEBAUT und
verifiziert — das Dokument hat sich darum von einer **Diagnose** („wohin driftete die
Vision") in eine **Verankerung** gewandelt („wie ist die Vision verkörpert, und wohin
zeigt sie weiter"). Die drei Verben des Felds stehen ALLE, gemessen:

- **LESEN** (V17.21): `auraAt(x,z,t)` ist die EINE Lese-API, 16 Konsumenten teilen sie.
- **SCHREIBEN** (V17.27/.32): `_depositLife` + `_depositEmotion` schreiben in sparse,
  lazy-zerfallende Overlays über dem frozen Kern — der Heilungs-Loop schließt sich ECHT.
- **WERTEN** (V17.42–.50): das dritte Verb — ein Vorhersagefehler-δ gegen eine gleitende
  Baseline, auf ZWEI Ebenen (Spieler-Appraisal + lokale Feld-Struktur). Die Welt LERNT,
  was den Spieler freut, by-construction anti-gaming.

Darauf stehen der **Emotion-Kern** (V17.45–.49: dimensional · Substanz-Brücke · Mood ·
Contagion · Wagnis), die **DSL-Weltregeln** (V17.33–.41: Mensch · Nexus · KI schreiben am
SELBEN Regel-Satz, persistiert + sichtbar), der **Kampf-/Interaktions-Bogen** (V17.51–.58,
der dem Affekt seinen Konsumenten gibt) und die **Resonanz-Vereinheitlichung** (V17.59–.85:
„ein Produkt-Vektor, viele Leser"). Der V17.92–.118-Tiefe-Fundament-Bogen + der V18-Wasser-
Bogen bauten den KÖRPER weiter (Terrain · Render · Wasser-Geometrie); die **echte Fluid-Dynamik
ist seit V18.84–.94 GEBAUT** (der Wasser-CA: `_tickWaterCA` + Quellen-Pin + Flow-Regel — Wasser
fliesst nach UND ruht; `docs/archiv/terrain-t4-wasser-ca-plan.md`). Der offene Körper-Vektor ist
jetzt die **Naht-Vollendung N1/N2** (`docs/archiv/terrain-koharenz-plan.md` §12). **Der geordnete
Rest-Backlog lebt in `docs/roadmap.md` „⭐ DER PLAN VORWÄRTS" + `docs/archiv/gigant-plan.md` (§5).**

Verwandte Anker: `state-of-realm.md` (die Vision/Testamente + die Stand-Matrix),
`world-portal.md` (die Bibliothek von Alexandria — das Fern-Ziel), `kampf-plan.md`
(der aktive Crafting-/Kampf-Bogen), `crafting-konzept.md` (Hylomorphismus = das
Material/Form-Substrat). Die VOLLENDETEN Arc-Pläne liegen im Archiv:
`archiv/dsl-weltregeln-plan.md`, `archiv/lebendige-wertung-plan.md` (das DRITTE Verb),
`archiv/emotion-kern-plan.md`, `archiv/resonanz-system.md`.

---

## 1. Die Vision in einem Satz

Die Welt soll **EIN lebendiges, fraktales, sich-selbst-verstehendes und -wachsendes
Feld** sein — von allen **gelesen**, durch eine Sprache von allen **geschrieben**, und
nach dem Wohl des Spielers **gewertet** —, in dem Mensch, KI, Kreaturen und die Welt
selbst Co-Autoren **derselben Quelle** sind. Niemals einzelne hand-codierte Pfade
(Pflaster); **Effizienz durch Einheit.**

Das ist die wörtliche Erfüllung der Testament-Pfeiler (`state-of-realm.md` §1):

- _„Emotion treibt — Spieler-Emotionen formen Wetter, Kreaturen, Materie, Klang"_ (Pfeiler 2)
- _„Fraktales Wachstum — aus Seed entstehen alle Skalen"_ (Pfeiler 3)
- _„Symbiose Mensch + KI — beide schreiben in dieselbe Realität"_ (Pfeiler 1).

---

## 2. Der geniale Twist — Lesen, Schreiben und Werten sind DASSELBE Feld

Die drei Dinge, die getrennt aussehen, sind eine:

- **Das Aura-Feld** = die LESE-Seite. Eine Quelle, viele Leser.
- **Die DSL / der Nexus** = die SCHREIB-Seite. Mensch + KI + Welt schreiben hinein.
- **Der Vorhersagefehler-δ** = die WERTUNG. Was den Spieler freut, blüht; was ihn nicht
  berührt, verblasst. Die Welt versteht sich selbst — und lernt.
- **Der geschlossene Kreis** = das „verstehend": der Nexus/die KI **liest** das Feld, um
  zu entscheiden, was er **schreibt**, und die WERTUNG sagt ihm, was GUT war. Die Welt
  spürt sich selbst und wächst Richtung Wert.

```
            ┌──────────────────────────────────────────────────┐
            │              EIN lebendiges Feld                  │
            │   auraAt(x, z, t)  —  fraktal + reaktiv + gewertet │
            │   frozen Kern (worldFieldAt): lebendig · dichte · │
            │   glut · magieleitung                             │
            │   + Overlays (sparse, lazy): lebendig · emotion   │
            │   WERTUNG: δ = Wohl − Baseline (Spieler + Ort)    │
            └──────────────────────────────────────────────────┘
              ▲ schreiben            │ lesen ▼          ↻ werten
   ┌──────────┴───────────┐  ┌───────┴────────────┐  ┌──┴───────────────┐
   │ Mensch (Chat→DSL)     │  │ Wasser · Licht ·    │  │ wohlBaseline      │
   │ Nexus (DSL, autonom)  │  │ Musik · Welt-Tint   │  │ (Spieler, 30 s)   │
   │ KI/Grok (DSL, llm)    │  │ Kreaturen (fühlen)  │  │ Feld-Baseline pro │
   │ die Welt (Carve/Damm) │  │ Vegetation · Spawn  │  │ 16-m-Zelle (120 s)│
   │ Kreatur-Trickle       │  │ DER NEXUS/DIE KI    │  │ → Regel-Fitness   │
   │ (tendsLife)           │  │ (verstehen)         │  │ → Emotion (joy/…) │
   └───────────────────────┘  └─────────────────────┘  └───────────────────┘
                                          ▲                       │
                                          └───── schreiben ←──────┘
                                       (der Nexus wächst Richtung δ>0)
```

Damit wird die Vision wörtlich wahr: _„Emotion treibt alles"_ = alle lesen das Feld,
die Emotion ist eine seiner Achsen (das Pflaster löst sich auf). _„Aus Seed alle Skalen"_
= das Feld IST fraktales Rauschen, unendlich, + der Nexus wächst es. _„Mensch + KI
schreiben dieselbe Realität"_ = beide schreiben DSL ins selbe Feld; die KI liest es, um
mit-zu-schöpfen; die WERTUNG selektiert, was sich bewährt. **Das ist die wahre Effizienz:
ein Feld, viele Leser, eine Gleichung der Wertung — nicht zehn `_tickX`-Funktionen.**

---

## 3. Wie die Vision verkörpert wurde — die fünf Flecken, gemessen geheilt

Der Ursprung (`archiv/nexus-dsl.md` §1, Ring 2): _„eine Welt, die sich selbst
weiterentwickelt, gesteuert durch Chat"_. Gebaut war das Skelett; an **fünf Stellen
blieb es flach und entkoppelt** (kartiert 01.06.–02.06.2026). Jede ist seither GEBAUT.
Diese Geschichte bleibt, weil sie erklärt, WARUM die Architektur ihre Form hat (frozen
Kern + Overlay, anti-gaming-δ, Whitelist-Regeln) — nicht als offene Wunde.

1. **Der Nexus war BLIND** — er würfelte Atome aus einer fixen Liste, las die Welt
   nicht. **→ GEHEILT (V17.22, .26):** er liest jetzt `auraAt` und komponiert resonant
   (`dslComposeRule` biast Bedingung + Effekt gegen die lokale Aura), und der Resolver
   `at_field_need` findet die ÄRMSTE Region und trägt Leben dorthin. Aus „Gesten würfeln"
   wurde „aus Verständnis heilen".

2. **Emotion war ein EINWEG-Ventil** (Spieler→Welt, hand-codiert, kein Rückweg).
   **→ GEHEILT (V17.21 + V17.30):** der Rückweg Welt→Spieler existiert (`FIELD_TO_EMOTION`:
   lebendig nährt peace/hope, glut nährt chaos/awe, magie nährt awe), UND die Emotion
   leitet sich jetzt aus dem echten SEIN-IN-DER-WELT ab — über ALLE sechs Achsen, aus
   TATEN (`ACTION_TO_EMOTION` an jeder Handlungs-Stelle), ZUSTAND (HP) und UMGEBUNG
   (Feld-Read). joy bewegt sich aus echtem Spiel, nicht mehr nur aus Chat-Stichwörtern.

3. **Die Felder waren PARALLEL und EINGEFROREN** — `worldFieldAt` read-only, beim
   Worldgen frozen, fünf Felder statt EINEM. **→ GEHEILT für die dynamischen Achsen
   (V17.27 + V17.32):** ZWEI Achsen haben jetzt eine SCHREIB-Seite — `lebendig`
   (`_depositLife` → `auraAt`-Blend, eine Geburt hebt, es zerfällt) und `emotion`
   (`_depositEmotion` am Ort des Fühlens → ein räumliches emotionales GEDÄCHTNIS). Beide
   sind ein Overlay über dem frozen Kern (`auraAt = min(1, frozen + overlay)`, nie
   überschreiben — V17.23-Harmonie). **Bewusst frozen bleiben dichte/glut/magieleitung**
   (die geologische Identität — eine Schreib-Seite bräuchten sie nur, wenn die Vision
   sie verlangt; sie werden von der Wertungs-Baseline ohnehin absorbiert).

4. **Der KI-Schöpfer schrieb noch nicht** + **die DSL war eine GESTEN-Sprache, kein
   Welt-DEFINITIONS-Substrat** (der damals tiefste, vision-fernste Fleck: 73 imperativ-
   einmalige Ops auf einem hardcodierten Kern, während die Bibliotheks-Vision _„eine Welt
   IST ein Set von DSL-Bäumen"_ verlangt). **→ GEHEILT (V17.33–.41):** der ganze DSL-
   Weltregeln-Bogen. Der geniale Leap war EIN Primitiv — ein `rule` = ein `when`, das
   NICHT verfällt (im Registry steht, im Welt-Tick fortlaufend geprüft). Eine Welt = ihr
   Regel-Satz + Seed (merge = Vereinigung der Regel-Sätze → die Bibliothek wird wahr).
   Mensch (Chat, permanent) · Nexus (autonom, ephemer) · **KI/Grok** (`source:"llm:grok"`
   → `dslRun`) schreiben am SELBEN Regel-Satz, in EINER Sprache, persistiert + sichtbar
   (der Gesetzes-Faden geht live „⚡ feuert", `_journalRuleAwoke`).

5. **Die WERTUNG war flach — das dritte Verb fehlte** (GEMESSEN 02.06.): die Regel-Fitness
   selektierte auf VIABILITÄT (≈0.99 für jede laufende Regel, eine heilende und eine
   sinnlose gleich), die Emotion war ein REFLEX (feste Tabelle, das 100. Haus so freudig
   wie das erste). **→ GEHEILT (V17.42–.50):** das dritte Verb via **Vorhersagefehler
   gegen eine gleitende Baseline** — die EINE Gleichung, auf die RL (TD-Fehler), die
   Neurowissenschaft (Dopamin = Reward Prediction Error), die Verhaltensökonomie
   (Prospect Theory) und die Spiel-KI (Sims/Black & White) unabhängig kamen. Sie subsumiert
   beide flachen Systeme (Details in §4.3).

**Damit ist der lange als „tiefster offener Vision-Faden" geführte Pfeiler E
substanziell eingelöst:** die Welt spürt + versteht + schreibt + heilt + ERHÄLT sich +
ERINNERT sich + WERTET — und wächst Richtung dessen, was den Spieler freut. Was bleibt,
ist VERTIEFUNG (§6), nicht Fundament.

---

## 4. Die wahre Tiefe — wie die Systeme WIRKLICH funktionieren (gemessen)

Dies ist die Architektur, die ein neuer Agent SEHEN muss, bevor er anfasst. Jeder
Eintrag ist im Code verifiziert (Methoden-/Konstanten-Namen sind real, Stand V18.31).

### 4.1 Das Feld — frozen Kern + reaktives Overlay

- **`worldFieldAt(x,z)`** — der frozen Worldgen-Kern, 4 Achsen (lebendig · dichte · glut ·
  magieleitung), aus 4 seed-deterministischen SimplexNoise-Instanzen, worldgen-cachebar.
- **`auraAt(x,z,t)`** — die EINE Lese-API. Gibt den frozen Kern zurück, geblendet mit den
  Overlays: `lebendig = min(1, frozen + _lifeOverlayAt)`, `emotion = global ⊕ _emotionOverlayAt`,
  die drei geologischen Achsen direkt frozen. **16 Konsumenten** teilen sie: Terrain-Farbe,
  Spawn-Affinität, Fauna-Ziel/-Max, Gras-Dichte, Nexus-Komposition, Welt-Tint, Appraisal,
  HUD. Wer eine neue „lebendige Welt"-Wirkung baut, liest HIER — kein neues `_tickX`.
- **Trennung frozen ↔ Overlay** (V12.0-perf.b): der teure frozen Teil ist cachebar; das
  billige mutable Overlay liegt sparse darüber (eine `Map` von 16-m-Zellen, lazy-decay
  beim Lesen, kein per-Frame-Sweep). Leerer Overlay → exakt frozen (backward-compatible).

### 4.2 Die Schreib-Seite — nur intentionale Akte, lazy-Decay, Sättigung

- **`_depositLife(x,z,amount)`** — hebt `lebendig` (3×3-Kernel), gekappt auf
  `LIFE_FIELD.max` (0.7), zerfällt exponentiell (`a·e^(−λΔt)`). Schreiber: eine Geburt
  (`_finishBirth`), die DSL-Op `deposit_life`, und der **Kreatur-Trickle** (`tendsLife`:
  eine getragene Kreatur träufelt fortlaufend Leben in ihre Zelle → die geheilte Region
  BLEIBT lebendig statt nach dem Puls zu verblassen — eine atmende Ökologie).
- **`_depositEmotion(x,z,emotionMap)`** — prägt die Tat-Emotion am Ort ein (6 Achsen,
  gekappt auf `EMOTION_FIELD.max` 0.8, schnellerer Decay als Leben). Schreiber:
  `_feelAction`, die DSL-Op `deposit_emotion`, `_giveComfort`.
- **Disziplin (V17.27-Lehre):** NUR INTENTIONALE Akte schreiben (die Geburt, die Geste) —
  NIE die FOLGEN des Feldes (ambiente Fauna liest lebendig → spawnt; würde sie auch
  schreiben, gäbe es positives Feedback-Runaway). Sättigung (`max`-Cap) → das Leben
  SPREIZT sich, kein rich-get-richer.

### 4.3 Die Wertung — das dritte Verb, eine Gleichung, zwei Ebenen

Die Konstante ist **`AnazhRealm.WERTUNG`**. Die Gleichung: `baseline += α·(x − baseline)`,
`δ = x − baseline`. Zwei Ebenen lesen denselben δ:

- **Spieler-Appraisal** (`p.wohlBaseline`, EMA mit `playerTau` 30 s): die Situation ist
  60 % lebendig (Feld unter dem Spieler) + 40 % HP — **NICHT die Emotion selbst** (sonst
  Runaway). `δ = Situation − Baseline` → joy/hope bei δ>0, sorrow/chaos bei δ<0 (über eine
  kurze EMA `appraisalEmaTau` 8 s). Weil die Baseline langsam nachzieht, fällt die
  **Gewöhnung umsonst heraus**: das 100. Haus ist weniger freudig als das erste, ohne
  jeden Hardcode.
- **Feld-Struktur** (`state.wohlBaseline`, eine Map pro 16-m-Zelle, EMA mit `fieldTau`
  120 s): `_measureRuleReward` misst `δ = Wohl(nach der Regel) − Baseline(vor der Regel)`
  = der **lokale strukturelle δ am Ort, den die Regel berührt**. Das ist die kausale
  Attribution, die der Passagier-Trugschluss nicht konnte — jetzt möglich, weil das Feld
  RÄUMLICH ist.
- **`_worldRuleFitness` = 0.6·valueScore(δ) + 0.25·success + 0.15·cost** (NICHT mehr die
  flache 0.4·Kosten + 0.6·Erfolg). `value` ist die EMA des lokal-attribuierten δ
  (`ruleValueBeta` 0.3) — Heiler-Regeln descenden öfter (`_composeNexusRule`), Schädlinge
  verfallen. **Die Welt LERNT, was den Spieler freut.**
- **Die Phase-4-Klammer + anti-gaming:** feuert eine Regel NAH am Spieler UND ist der
  Spieler-δ positiv → Bonus. Weil δ die SITUATION ist (lebendig + HP), nicht die
  gestempelte Emotion, kann eine Regel nicht „den Spieler glücklich-stempeln" — sie muss
  die Welt wirklich besser machen.

### 4.4 Der Emotion-Kern — dimensional, hylomorph, sozial

- **6 Achsen** (`EMOTION_AXES`: joy/awe/sorrow/hope/peace/chaos), dimensional projiziert
  über **`EMOTION_GEOMETRY`** (Valenz × Erregung, Russell-Circumplex). `_emotionState`
  liest Valenz/Erregung/Intensität → bittersüß (joy+sorrow) hat Valenz ≈ 0, aber hohe
  Intensität. Gegensätzliche Achsen dämpfen sich emergent.
- **Hylomorph** (V17.46): `ACTION_TO_EMOTION` (die Tat-Basis) × `TAG_TO_EMOTION`
  (`_appraiseSubstance` — die Tags der berührten Substanz) → die Emotion fällt aus der
  SUBSTANZ der Tat, nicht aus einer Etikett-Tabelle.
- **Mood** (langsame EMA, `EMOTION_MOOD_TAU` 120 s) tönt die Appraisal kongruent (ein
  gutes Ereignis fühlt sich in trüber Stimmung kleiner an). **Contagion + Bonding**
  (`_tickEmotionContagion`): nahe Kreaturen stecken den Spieler an, gewichtet nach Nähe ×
  Bindung; `bond` wächst während `follow_player`; bounded (kein Feedback-Runaway).
  Pro-Achsen-Decay (chaos verfliegt schnell, sorrow/peace bleiben).

### 4.5 Der Nexus + die Weltregeln — Mensch · Nexus · KI am selben Satz

- Der Nexus **liest** (`auraAt`), **komponiert resonant** (`dslComposeRule`, biast gegen
  die lokale Aura), **schreibt** nur reaktiv-sichere Ops, **lernt** value-gerichtet.
- **`state.worldRules`** (Registry) + **`_tickWorldRules`** (per-Frame-Evaluator): ein
  `rule`-Op REGISTRIERT statt einmal auszuführen. Vier Disziplinen an der Wurzel:
  Re-Entrancy (Array-Länge am Tick-Anfang fangen), Performance (Budget/Frame + `everySec`-
  Gate), Determinismus (deterministische Regel-RNG, multi-user-seed-sicher), Runaway-Schutz
  (Cap 64 + Dedup + Eviction des ältesten Nicht-Mensch-Eintrags).
- **Quellen:** Mensch (permanent, geschützt) · Nexus (ephemer, fitness-erneuert) · LLM
  (ephemer). Eine **Whitelist** lässt Regeln nur die reaktive Schicht schreiben (Overlays/
  Wetter/Emotion/Kreaturen), NIE den frozen Worldgen (`terrain_*`/`voxel_*`) → eine
  fremde Welt kann meine nicht umpflügen. Persistiert + merge-bar (die Bibliotheks-Vision).

### 4.6 Die Resonanz — der Hylomorphismus eine Ebene höher

Das Crafting-Substrat ist die BLAUPAUSE des Felds, eine Ebene angewandt:
**`computeCompoundTags`** (MAX über Parts von Form × Material) ist die EINE Quelle →
**`_blueprintProductVector`** (Material-Tags normalisiert auf [0..1] via
`PRODUCT_VECTOR_TAG_NORM` ⊕ Form-Achsen ⊕ Skala) ist der EINE Vektor → **vier argmax-Leser**
gegen frozen Signaturen teilen ihn: Rolle (`computeBlueprintRole`/`ROLE_SIGNATURES`),
Werkstatt-Domäne (`_computeWorkshopDomain`), Werkzeug-Op (`_computeToolOpFromForm`),
Rollen-Fit (`_blueprintRoleFit`). „Ein Produkt-Vektor, viele Leser" — kein Whitelist,
kein Flag (außer den GEMESSEN-nicht-emergenten Intent-Overrides). Details:
`docs/archiv/kampf-plan.md` §11 + `docs/archiv/resonanz-system.md`.

---

## 5. Was schon EMERGENT ist (nicht anfassen — das ist das Vorbild)

Damit der nächste Agent das Muster sieht, das er fortsetzt (nicht durchbricht). Jedes
hier ist „eine Quelle, viele Konsumenten" — die Blaupause, die jede neue Welt-Schicht
erbt:

- **Hylomorphismus** (`computeCompoundTags`): ALLE Stats, Affordanzen, Spawn-Affinität,
  Rollen emergieren daraus. Die Resonanz-Vereinheitlichung (§4.6) ist seine Krönung.
- **`auraAt`** (§4.1): ein Feld, viele Leser — jetzt lebendig (Overlays) UND voll gelesen
  (die Konsumenten lesen alle Achsen, nicht nur `lebendig`; glut DÄMPFT die Fauna).
- **Der Vorhersagefehler-δ** (§4.3): EINE Gleichung wertet zwei Welten (Spieler-Gefühl +
  Regel-Fitness). Die Gewöhnung fällt umsonst heraus — kein Hardcode pro Fall.
- **Die DSL + die Weltregeln** (§4.5): die geteilte Schreib-Sprache von Mensch + Nexus +
  KI, persistier-/broadcast-/merge-bar. „Beide schreiben dieselbe Realität" steht.

---

## 6. Der Vektor vorwärts — wohin jede Achse noch zeigt

Die Vision ist verkörpert; was bleibt, ist VERTIEFUNG — pro Achse die nächste Tiefe. Die
geordnete Reihenfolge (Fundament vor Seele) steht in `docs/roadmap.md` „⭐ DER PLAN
VORWÄRTS"; hier der Vektor, gruppiert nach Dimension:

**Der Körper (Fundament zuerst — V9.51-Disziplin):**

- **Echte Fluid-Dynamik — GEBAUT ✓ (V18.84–.94):** der zellbasierte Fluss-Automat über
  `entry.waterCells` steht end-to-end (`_tickWaterCA` + cross-chunk-wake + Quellen-Pin +
  Receiver-Support + Flow-Regel Decay/Kappe/Fixpunkt; Zell-Sheet als der EINE Render).
  Ein Carve daneben → das Wasser strömt sichtbar hinein UND die Welt ruht danach.
  Chronik: `docs/archiv/terrain-t4-wasser-ca-plan.md`; Reste in `docs/roadmap.md` §4.
- Der offene Körper-Vektor: **die Naht-Vollendung** (N1 Cross-LOD watertight · N2
  Sub-Region-Edit, `docs/archiv/terrain-koharenz-plan.md` §12) + Fundament-Reste: H3-Seen/Flüsse
  jenseits ±1024 m · die LOD-Kaskade vollenden (`docs/archiv/lod-kaskade-plan.md`
  U2/U4/U5/U6) · **Licht+Terrain-Einheit** (`docs/archiv/gigant-plan.md` G6).

**Die Seele (wenn das Fundament trägt):**

- **Phase E — Bedrohung/Furcht** (`docs/archiv/kampf-plan.md`). Der Emotion-Kern hat den
  W5-Affekt (Furcht/Triumph), aber NOCH KEINEN Konsumenten für aggressive Kreaturen — sie
  fliehen, schlagen nie zurück (explizit als Phase E markiert). Das ist der LETZTE fehlende
  Konsument des Affekts und die game-design-schwerste Phase.
- **Emotion → Regel-EMERGENZ.** Die einzelnen Kopplungen (`sorrow→rainy` etc.) sind noch
  hand-codiert. Die Weltregeln-DSL (§4.5) macht sie ausdrückbar — der Vektor: sie als
  emergente, evolvierbare Regeln neu fassen, nicht als feste Trigger.
- **Die anderen Feld-Achsen schreibbar — und der Spieler als Pfleger.** Heute schreiben
  Geburt/Nexus/Kreatur ins lebendig-Overlay; der Vektor: **DU trägst Leben** (Spieler-Pflege
  als zweiter Schreib-Pfad = echte Co-Schöpfung). glut/dichte/magieleitung bleiben frozen,
  bis die Vision sie verlangt (dann via `_depositLife`-Muster, kein Parallelpfad).
- **Mana-Symmetrie:** `magieleitung` → ein Äther/Mana, die zweite Ausdauer-Achse (Magie
  zahlt heute nichts; der Kampf-Bogen zahlt schon Stamina).
- **Die KI als vollwertige Co-Schöpferin.** Das LLM schreibt schon Regeln (`source:"llm"`),
  aber opt-in. Der Vektor: die KI tiefer in den Kreis weben (sie liest das gewertete Feld,
  schlägt Regeln vor, lernt aus dem δ) — die Symbiose-Hälfte von Pfeiler 1 vollenden.
- **W18 — in fremden Welten LEBEN** (`docs/archiv/world-portal-w18-plan.md`): Ko-Präsenz-Injektion
  in Single-Player-Fremdwelten — der nächste große Vision-Bogen jenseits des eigenen Kerns.

---

## 7. Die ehrlichen offenen Flecken (gemessen)

| Fleck | Was | Tiefe / Status |
| --- | --- | --- |
| **~~Wasser ist statisch~~ → GEBAUT (V18.84–.94)** | Der Wasser-CA fliesst im Modell+Welt+Render (Quellen-Pin · Flow-Regel · Zell-Sheet). | **VOLLENDET + gemergt.** Chronik: `archiv/terrain-t4-wasser-ca-plan.md`; Reste in `roadmap.md` §4. Der offene Körper-Vektor ist jetzt die N-Naht (`terrain-koharenz-plan.md` §12). |
| **Kreaturen fühlen flach (binär happy/sad)** | Kreatur-Emotion ist ein binäres Etikett statt der 6 Achsen; kein Lebenszyklus, keine Kreatur↔Kreatur-Contagion. Das Substrat (Feld · `_feelAction` · Contagion · Bond · `_finishBirth`) EXISTIERT — es wird nicht konsumiert. | **Vertiefung mit fertigem Substrat** (`archiv/gigant-plan.md` G4 — konsumieren statt bauen). |
| **Phase E — Bedrohung/Furcht fehlt** | Kreaturen fliehen, schlagen nie zurück. Der Emotion-Kern hat den Affekt-Hook (W5), aber keinen Aggressions-Konsumenten. | **Der tiefste offene SEELEN-Fleck.** Plan: `kampf-plan.md`. Game-design-schwerste Phase. |
| **Emotion-Kopplungen noch hand-codiert** | `sorrow→rainy` etc. sind feste Trigger, nicht aus der Weltregeln-DSL emergent. | **Vertiefung.** Das Substrat (die `rule`-Op) macht es ausdrückbar — der Schritt ist sie umzuschreiben. |
| **Die anderen Feld-Achsen frozen + Spieler pflegt nicht** | glut/dichte/magie sind absichtlich frozen; der Spieler hat noch keinen Leben-Schreib-Pfad. | **Vertiefung.** Spieler-Pflege = Co-Schöpfung. Die geologischen Achsen nur, wenn die Vision sie braucht. |
| **Die KI ist opt-in, nicht Kern** | Das LLM schreibt Regeln, aber als Option, nicht als gewobener Co-Schöpfer. | **Vertiefung** (Pfeiler 1 zu Ende). Die Schreib-Seite STEHT; die Tiefe der Symbiose fehlt. |
| **Fundament-Reste** | H3-Seen/Flüsse jenseits ±1024 m, G3-Canyons, LOD-Kaskade U2/U4/U5/U6. | **Parallel/davor.** `roadmap.md` Phase 2, `lod-kaskade-plan.md`. |

Der Code ist sonst **gut + tief**: das Feld lebt (lesen·schreiben·werten), der Emotion-Kern
ist dimensional, die Resonanz ist vereinheitlicht, die Weltregeln tragen Mensch·Nexus·KI.
Die toten Glieder von V17.71 sind GESCHNITTEN (GPU-Density-WGSL ~500 Z. raus V17.20,
`movementWorker` raus, `mxFractal` weg, Hot-Swap-Reste entfernt — der Stamm ist sauber).
Die Haupt-Reibung ist nicht mehr die konzeptionelle Lücke (die ist geschlossen), sondern
die VERTIEFUNG der gebauten Systeme + der eine offene Körper-Vektor (Fluid-Dynamik).

---

## 8. Für den nächsten Agenten — die Disziplin

1. **Lies diesen Anker + `state-of-realm.md` + `world-portal.md`, BEVOR du an der
   lebendigen Welt baust.** Du sollst verstehen wie der Agent vor dir, nicht raten.
2. **Jede „lebendige Welt"-Behauptung ist ein FELD-READ, kein neues `_tickX`.** Wenn du
   eine Emotion-/Resonanz-/Cluster-Wirkung baust und sie ist eine neue hand-codierte
   Kopplung statt eines Reads aus dem einen Feld → STOP, das ist das Pflaster, das wir
   abgeschafft haben. Verdichte, baue nie parallel (V17.9, eine Ebene höher).
3. **Verifiziere KONSUM, nicht Existenz** (V17.31, der Passagier-Trugschluss): eine
   Feld-Achse/ein Uniform/ein Hook ist erst real, wenn ein ECHTER Leser sie nutzt UND
   die Welt sich beobachtbar ändert — nicht, wenn ein Test nur prüft, dass sie „da ist".
   Die `auraAt.emotion`-Achse war einst ein toter Passagier; der Welt-Tint las sie nie.
4. **Ein Feedback-Loop über ein FROZEN Feld ist KEIN Loop** (V17.27): schreibt der Akt in
   dasselbe Feld zurück, das die Entscheidung liest? Wenn nicht, ist es nur eine wiederholte
   Messung eines unveränderlichen Feldes = ein hardcodierter Vektor. Die Heilung ist eine
   Schreib-Seite (Overlay über dem frozen Kern, nur intentionale Akte, lazy-Decay,
   Sättigung). Wer eine neue Achse schreibbar macht, erweitert `_depositLife` — kein
   Parallelpfad.
5. **Werten ist Vorhersagefehler, kein absoluter Wert** (V17.42–.50): ein neuer „Wert"
   (Fitness, Belohnung, Gefühl) gehört gegen eine gleitende Baseline gemessen (`δ = x −
   baseline`), lokal attribuiert, und gegen Gaming gehärtet (miss die SITUATION, nicht die
   gestempelte Emotion). Die Gewöhnung soll umsonst herausfallen.
6. **Harmonie statt Revert** (V17.23): wenn das Feld eine Sache beeinflusst, die schon eine
   andere Kraft formt, und ein Test bricht — nimm das Feld NICHT heraus. Heile in eine
   nachgebende Hierarchie: der intentionale Wille (Spieler) FÜHRT, das ambiente Feld WEICHT
   wo der Wille stark ist (×`(1−emoSignal)`) + FÜLLT wo er schweigt. Nie überschreiben,
   immer verschmelzen, immer FADEN (kein Snap).
7. **Kein Flag, kein Sonderfall, kein neues Modul** — schärfe die emergente Regel (V17.11).
   Das Feld ist eine Methode auf dem EINEN Stamm. Die verfeinerte Heilige Lektion (06.06.):
   die Sünde von 2025 war Kopplung ohne Kohäsion, nicht „mehr als eine Datei" — ein neuer
   File NUR an einer echten Laufzeit-/Sicherheits-/stabilen-Naht-Grenze (der Drei-JA-Test
   im `CLAUDE.md`-Kopf). Ein „LivingWorldManager"-Modul wäre die Sünde.
8. **Miss, rate nicht** — und die VISUELLE Wahrheit ist der Schöpfer-Browser (Render/
   Wasser/Hand-Optik sind GPU-untreu headless: die Geometrie rastert treu, die
   Shader-Feinheiten nicht). Bei pixel-blinder Arbeit: erst der Browser, dann die nächste
   Welle; ein bestätigter Bogen = ein Merge (die Wasser-Spirale lehrte das ZWEIMAL).
9. **Keine halben Schritte** (V17.30): ist der Plan klar + das Gap benannt → baue das
   GANZE Subsystem an die Wurzel, mit voller Verifikation, nicht ein Pflaster nach dem
   nächsten. Der Mut kommt aus der Verifikation, nicht aus der Kleinheit.
