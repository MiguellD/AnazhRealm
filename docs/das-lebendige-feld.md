# Das lebendige Feld — der wahre Norden (Vision-Anker)

> **Lies dieses Dokument ZUERST, wenn du an „der lebendigen Welt", „Emotion ↔ Welt",
> „Kreaturen lebendiger", „dem Nexus", „der DSL", „fraktalem Wachstum" oder „der KI
> als Co-Schöpfer" arbeiten willst.** Es hält den wahren Norden des Projekts fest —
> die EWIGE Vision (§1–§2), wie sie GEMESSEN im Code verkörpert ist (§3–§5), und den
> Vektor, der noch vorwärts zeigt (§6–§7). Damit der nächste Agent NICHT wieder ein
> Pflaster-System baut, sondern auf dem Vorhandenen weiterwächst.

Die drei Verben des Feldes stehen im Code:

- **LESEN:** `auraAt(x,z,t)` ist die EINE Lese-API (frozen Kern + reaktives Overlay).
- **SCHREIBEN:** `_depositLife` + `_depositEmotion` schreiben in sparse, lazy zerfallende
  Overlays über dem frozen Kern — der Heilungs-Loop schließt sich echt.
- **WERTEN:** ein Vorhersagefehler-δ gegen eine gleitende Baseline, auf zwei Ebenen
  (Spieler-Appraisal + lokale Feld-Struktur) — die Welt lernt, was den Spieler freut.

Darauf stehen der Emotion-Kern (dimensional · Substanz-Brücke · Mood · Contagion), die
DSL-Weltregeln (Mensch · Nexus · KI am selben Regel-Satz), der Kampf-/Interaktions-Bogen, die
Resonanz („ein Produkt-Vektor, viele Leser") und der Wasser-CA (Wasser fließt nach und ruht).
Das Offene steht in `docs/roadmap.md` §0; die Chronik aller Bögen in `git log`.

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

## 3. Warum die Architektur ihre Form hat

Fünf Flecken, an denen die Vision einst flach war, erklären die heutige Form:

1. **Der Nexus liest die Welt** (`auraAt`) und komponiert resonant (`dslComposeRule`,
   Resolver `at_field_need` → die ärmste Region) — statt Atome zu würfeln.
2. **Emotion ist zweiseitig:** Welt→Spieler über `FIELD_TO_EMOTION`, Spieler aus TATEN
   (`ACTION_TO_EMOTION`), ZUSTAND (HP) und UMGEBUNG — über alle sechs Achsen.
3. **Schreibbare Achsen sind Overlays** über dem frozen Kern (`auraAt = min(1, frozen +
   overlay)`, nie überschreiben); dichte/glut/magieleitung bleiben bewusst frozen.
4. **Eine Welt ist ihr Regel-Satz + Seed:** `rule` = ein nicht verfallendes `when`;
   Mensch · Nexus · KI (`source:"llm:grok"` → `dslRun`) schreiben in EINER Sprache.
5. **Werten ist Vorhersagefehler** (TD-Fehler/Dopamin-Muster) — anti-gaming by construction,
   Gewöhnung fällt umsonst heraus (§4.3).

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
kein Flag (außer den gemessen nicht-emergenten Intent-Overrides).

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

**Der Körper:** der Wasser-CA fließt (`_tickWaterCA`, Quellen-Pin, Flow-Regel; das Zell-Sheet
ist der EINE Render). Offen: Seen/Flüsse jenseits ±1024 m · die Vereinigung der zwei
Wasser-Naturen · Licht+Terrain-Einheit.

**Die Seele (wenn das Fundament trägt):**

- **Furcht und Triumph erleben:** die Jagd steht (wild jagt den Spieler und andere Kreaturen
  über den `_scentAt`-Gradient); offen ist, das Bedrohtsein und den Fall eines Jägers als
  Spieler-Affekt fühlbar zu knüpfen.
- **Emotion → Regel-EMERGENZ.** Die einzelnen Kopplungen (`sorrow→rainy` etc.) sind noch
  hand-codiert. Die Weltregeln-DSL (§4.5) macht sie ausdrückbar — der Vektor: sie als
  emergente, evolvierbare Regeln neu fassen, nicht als feste Trigger.
- **Die anderen Feld-Achsen schreibbar — und der Spieler als Pfleger.** Heute schreiben
  Geburt/Nexus/Kreatur ins lebendig-Overlay; der Vektor: **DU trägst Leben** (Spieler-Pflege
  als zweiter Schreib-Pfad = echte Co-Schöpfung). glut/dichte/magieleitung bleiben frozen,
  bis die Vision sie verlangt (dann via `_depositLife`-Muster, kein Parallelpfad).
- **Die KI als vollwertige Co-Schöpferin.** Das LLM schreibt schon Regeln (`source:"llm"`),
  aber opt-in. Der Vektor: die KI tiefer in den Kreis weben (sie liest das gewertete Feld,
  schlägt Regeln vor, lernt aus dem δ) — die Symbiose-Hälfte von Pfeiler 1 vollenden.
- **In fremden Welten leben:** Ko-Präsenz-Injektion in Single-Player-Fremdwelten.

---

## 7. Die offenen Flecken (Vertiefung, kein Fundament)

- Emotion-Kopplungen (`sorrow→rainy` u. ä.) sind noch feste Trigger statt aus Weltregeln emergent.
- Der Spieler hat keinen eigenen Leben-Schreib-Pfad (Pflege = Co-Schöpfung).
- Die KI ist opt-in; der Co-Schöpfer spricht seit V18.493 die Studio-Rezepte (`spawn_studio`),
  der echte Lauf mit Schlüssel steht aus (Drehbuch Schritt 18).
- Wasser trägt noch zwei Naturen (statisches `L`-Substrat + CA) — die Vereinigung ist offen.

---

## 8. Für den nächsten Agenten — die Disziplin

1. **Lies diesen Anker + `state-of-realm.md`, BEVOR du an der lebendigen Welt baust.** Du sollst verstehen wie der Agent vor dir, nicht raten.
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
8. **Miss, rate nicht — und sieh selbst:** settled swiftshader-Schüsse sind farbtreu
   (`diag-blick`, `diag-beweis-e`); eine headless-Zahl beweist Mechanik, das Bild den Look.
9. **Keine halben Schritte** (V17.30): ist der Plan klar + das Gap benannt → baue das
   GANZE Subsystem an die Wurzel, mit voller Verifikation, nicht ein Pflaster nach dem
   nächsten. Der Mut kommt aus der Verifikation, nicht aus der Kleinheit.
