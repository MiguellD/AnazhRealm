# Das lebendige Feld — der wahre Norden (Vision-Anker)

> **Lies dieses Dokument ZUERST, wenn du an „der lebendigen Welt", „Emotion ↔ Welt",
> „Kreaturen lebendiger", „dem Nexus", „der DSL", „fraktalem Wachstum" oder „der KI
> als Co-Schöpfer" arbeiten willst.** Es hält das Verständnis fest, das der Schöpfer
> und der Agent in der Reflexion vom 01.06.2026 erarbeitet haben — damit der nächste
> Agent NICHT wieder ein Pflaster-System baut, sondern das Vorhandene zu EINEM
> lebendigen Feld verdichtet. Stand: nach V17.27 — die Heilung ist DURCH (V17.19 Werkstatt-Auge, V17.20 tote Glieder), und der ERSTE Feld-Bogen ist RUND, mit BEIDEN Hälften (lesen UND schreiben): `auraAt(x,z,t)` (die Lese-Seite, V17.21) + der geschlossene Kreis Welt→Spieler-Emotion (V17.21, via `FIELD_TO_EMOTION` — §3.2/§3.3 sind nicht mehr offen, der Rückweg existiert) + der Nexus LIEST das Feld + komponiert resonant (V17.22, §3.1 „blinder Nexus" geheilt) + drei Kräfte verschmelzen in HARMONIE statt Revert (V17.23: Wille führt, Feld weicht/füllt) + nichts snappt mehr (V17.24: Sky-Farb-Cross-Fade) + VIELE Leser teilen das Feld (V17.25, §5: die Logik-Konsumenten lesen `auraAt` + die VOLLEN Achsen — glut DÄMPFT die Fauna) + der Nexus heilt GEZIELT den Mangel (V17.26: Resolver `at_field_need` → er trägt Leben in die ÄRMSTE Region) + **die SCHREIB-Seite ist gebaut (V17.27): ein sparse, lazy-zerfallendes Leben-Overlay über dem frozen Kern — `_depositLife` schreibt, `auraAt` blendet (`min(1, frozen+overlay)`); eine Geburt hebt lebendig → der at_field_need-Loop schließt sich ECHT (Leben spreizt, der Mangel sinkt, Sättigung statt rich-get-richer) → „die Welt heilt sich" ist jetzt eine geschlossene REGEL, kein Vektor.** Damit: die Welt spürt + versteht + schreibt + heilt sich. **Nächste Feld-Tiefen (Backlog):** Kreatur-Trickle (Leben sustainiert, wo es wohnt — eine echte Ökologie, mit Anti-Runaway-Design) + die Spieler-Pflege als zweiter Schreib-Pfad + joy/sorrow aus echtem Spiel-Verhalten (heute nur Chat-Lexik) + eine räumlich-dynamische Emotion-Achse in `auraAt` + die KI als DSL-Schreiberin (§3.4, der tiefste offene Fleck).

Verwandte Anker: `state-of-realm.md` (die Vision/Testamente), `world-portal.md`
(die Bibliothek von Alexandria — das Fern-Ziel), `archiv/nexus-dsl.md` (das alte
DSL-Design, Ring 2), `crafting-konzept.md` (Hylomorphismus = das Material/Form-Substrat).

---

## 1. Die Vision in einem Satz

Die Welt soll **EIN lebendiges, fraktales, sich-selbst-verstehendes und -wachsendes
Feld** sein — von allen **gelesen** und durch eine Sprache von allen **geschrieben** —,
in dem Mensch, KI, Kreaturen und die Welt selbst Co-Autoren **derselben Quelle** sind.
Niemals einzelne hand-codierte Pfade (Pflaster); **Effizienz durch Einheit.**

Das ist die wörtliche Erfüllung der Testament-Pfeiler (`state-of-realm.md` §1):
_„Emotion treibt — Spieler-Emotionen formen Wetter, Kreaturen, Materie, Klang"_ (Pfeiler 2)

- _„Fraktales Wachstum — aus Seed entstehen alle Skalen"_ (Pfeiler 3)
- _„Symbiose Mensch + KI — beide schreiben in dieselbe Realität"_ (Pfeiler 1).

---

## 2. Der geniale Twist — Lesen (Aura-Feld) und Schreiben (DSL/Nexus) sind DASSELBE

Die zwei Dinge, die getrennt aussehen, sind eine:

- **Das Aura-Feld** = die LESE-Seite. Eine Quelle, viele Leser.
- **Die DSL / der Nexus** = die SCHREIB-Seite. Mensch + KI + Welt schreiben hinein.
- **Der geschlossene Kreis** = das „verstehend": der Nexus/die KI **liest** das Feld,
  um zu entscheiden, was er **schreibt**. Die Welt spürt sich selbst und wächst.

```
            ┌──────────────────────────────────────────────┐
            │            EIN lebendiges Feld                │
            │   auraAt(x, z, t)  —  fraktal + reaktiv       │
            │   Achsen: lebendig · dichte · glut ·          │
            │   magieleitung · emotion(awe/peace/…) ·       │
            │   resonanz · …                                │
            └──────────────────────────────────────────────┘
              ▲ schreiben                    │ lesen ▼
   ┌──────────┴───────────┐      ┌───────────┴────────────────────┐
   │ Mensch (Chat→DSL)     │      │ Wasser-Schaum · Licht · Musik   │
   │ Nexus (DSL, autonom)  │      │ Kreaturen (wandern/fühlen)      │
   │ KI-Schöpfer (DSL)     │      │ Vegetation · Spawn-Affinität    │
   │ die Welt selbst       │      │ DER NEXUS / DIE KI (verstehen)  │
   │ (Carve/Damm/Cluster)  │      │ → schreiben geleitet vom Lesen  │
   └───────────────────────┘      └────────────────────────────────┘
```

Damit wird die Vision wörtlich wahr: _„Emotion treibt alles"_ = alle lesen die
Emotion-Achse des Felds (das Pflaster löst sich auf). _„Aus Seed alle Skalen"_ =
das Feld IST fraktales Rauschen, unendlich, + der Nexus wächst es. _„Mensch + KI
schreiben dieselbe Realität"_ = beide schreiben DSL ins selbe Feld; die KI liest es,
um mit-zu-schöpfen. **Das ist die wahre Effizienz: ein Feld, viele Leser — nicht zehn
`_tickX`-Funktionen.**

---

## 3. Wo die Vision hinwollte — und wohin sie driftete (GEMESSEN)

Der Ursprung (`archiv/nexus-dsl.md` §1, Ring 2): _„eine Welt, die sich selbst
weiterentwickelt, gesteuert durch Chat"_ — Mensch UND Nexus schreiben dieselbe DSL,
die Welt **wächst**. Gebaut wurde das Skelett (es ist mehr als „nur Hülle"), aber an
**vier Stellen blieb es flach und entkoppelt** (kartiert im Code, 01.06.2026):

1. **Der Nexus ist BLIND.** Er existiert real (`nexusTick`, komponiert DSL via
   `dslCompose`/`dslComposeAtomic`, lernt per Fitness `dslSelectByFitness`, mutiert
   `dslMutate`, broadcastet). Aber er **liest die Welt nicht** — er würfelt Atome aus
   einer fixen Liste, biased nur durch Spieler-Emotion. Er spürt nicht „dieser Wald
   stirbt / hier ist es zu dicht / hier resoniert Magie" → er wächst nicht aus
   Verständnis, er spamt Gesten. **Am weitesten von _fraktalem Wachstum_ weg.**

2. **Emotion ist ein EINWEG-Ventil.** `state.player.emotions` (joy/awe/sorrow/hope/
   peace/chaos) ist EIN Vektor (gut), aber die Kopplungen sind hand-codiert
   (`sorrow→rainy`, `joy→gelber Himmel`, in `updatePlayerEmotions`) und gehen **nur
   Spieler→Welt**. Der Rückweg fehlt: Regen erhöht keine Trauer, eine friedliche
   Lichtung gibt keinen Frieden. Der Kreis schließt sich nie.

3. **Die Felder sind PARALLEL und EINGEFROREN.** `worldFieldAt(x,z)` (4 Achsen:
   lebendig/dichte/glut/magieleitung) ist schön vereint — aber **read-only**, beim
   Worldgen eingefroren. Der Spieler kann `lebendig` nicht durch Pflanzen heben;
   Emotion moduliert es nicht; Carve/Edit ändert es nicht. Und es lebt PARALLEL neben
   Hydrosphäre, Erosion, Emotion, Kreatur-Population — **nicht EIN Feld, sondern
   fünf.** Die DSL kann es nur lesen (`compound_has_tag`), nie schreiben.
   **→ TEILWEISE GEHEILT (V17.27): die `lebendig`-Achse hat jetzt eine SCHREIB-Seite**
   — ein Leben-Overlay über dem frozen Kern (`_depositLife` → `auraAt`-Blend), das eine
   Geburt hebt + das zerfällt. `lebendig` ist also NICHT mehr read-only; der frozen Kern
   bleibt (worldgen/cachebar), das Overlay ist die reaktive Schicht. **Noch offen:** die
   ANDEREN drei Achsen (dichte/glut/magieleitung) sind weiter frozen; das Feld lebt noch
   PARALLEL neben Hydrosphäre/Erosion (nicht zu EINEM verschmolzen); und die DSL schreibt
   das Overlay nur indirekt (über `spawn_creature` → `_depositLife`), nicht als direkte
   Feld-Schreib-Op.

4. **Der KI-Schöpfer schreibt noch nicht.** Grok ist hardcodierte Phrasen-Pools; das
   LLM (`state.llm`) ist verdrahtet aber opt-in, nicht Kern. Die Symbiose-Hälfte „die
   KI ist Co-Autor, der DSL ins Feld schreibt" ist Skizze.

**Plus die Architektur-Wahrheit (die Schöpfer selbst spürte): die DSL ist eine
GESTEN-Sprache, kein Welt-DEFINITIONS-Substrat.** 73 Ops, ALLE imperativ-einmalig
(spawn/modify/weather/equip). Schon das alte Design (`archiv/nexus-dsl.md` §15) ließ
Terrain/Physik/Kreatur-Verhalten/Shader bewusst AUSSERHALB der DSL. Aber die
Bibliotheks-Vision (`state-of-realm.md` §4.2) sagt _„eine Welt IST ein Set von
DSL-Bäumen"_. **Da klafft die größte Lücke: die Vision will Welten als komponierbare
Regel-Programme, real ist es ein hardcodierter Kern + Seed + dünne DSL-Gesten-Schicht.**
Die Welt wird aus einem Seed GENERIERT (fixe Funktionen), aber sie WÄCHST/EVOLVIERT
nicht. (Warum die DSL bewusst dünn blieb: Performance + Determinismus + die Heilige
Lektion — siehe §6.)

---

## 4. Schon hier, nur nicht tief/stabil genug

Das ist die präzise, ehrliche Lage: **die Teile existieren alle** — `worldFieldAt`
(das Feld-Skelett), der Emotion-Vektor, die DSL (die Schreib-Sprache), der Nexus (der
autonome Schreiber), die Fitness-Schleife, die Hylomorphismus-Tags (das emergente
Stat/Affordanz-Substrat). Sie waren **flach und unverbunden** — und der V17.21–V17.27-Bogen
hat sie verbunden: `auraAt` umhüllt den frozen `worldFieldAt`-Kern als living Lese-API
(V17.21), der Kreis Welt→Spieler-Emotion ist geschlossen (V17.21), der Nexus liest +
komponiert resonant (V17.22) + heilt gezielt den Mangel (V17.26), viele Leser teilen das
Feld (V17.25), und **seit V17.27 hat das Feld eine SCHREIB-Seite**: die `lebendig`-Achse
ist nicht mehr nur frozen — ein Leben-Overlay (`_depositLife` → `auraAt`-Blend) macht sie
schreibbar (eine Geburt hebt sie, sie zerfällt zurück), und der at_field_need-Loop
schließt sich dadurch ECHT. **Noch offen** (die tieferen Schreib-Pfade): die ANDEREN
Achsen sind weiter frozen, joy/sorrow nur Chat-Lexik (kein Spiel-Verhalten), die DSL
stumm als Welt-Definition (§3.4). **Der geniale Twist ist KEIN neues System — er ist das
Vertiefen + Verbinden des Vorhandenen zu einem lebendigen Feld-Kreis.**

---

## 5. Was schon EMERGENT ist (nicht anfassen — das ist das Vorbild)

Damit der nächste Agent das Muster sieht, das er fortsetzt (nicht durchbricht):

- **Hylomorphismus** (`computeCompoundTags` = MAX über Parts von Form × Material):
  ALLE Stats, Affordanzen, Spawn-Affinität emergieren daraus. EINE Quelle, viele
  Konsumenten. **Das ist die Blaupause des Felds — eine Ebene höher anwenden.**
- **`worldFieldAt`** ist schon „ein Feld, viele Leser" (Terrain-Farbe, Spawn-Affinität,
  Fauna-Ziel, Gras-Dichte) — es muss nur **lebendig + vollständig gelesen** werden
  (heute lesen die meisten nur `lebendig`, nicht alle 4 Achsen).
- **Die DSL** ist schon die geteilte Schreib-Sprache von Mensch + Nexus, persistier-/
  broadcast-bar. Das Fundament für „beide schreiben dieselbe Realität" steht.

---

## 6. Die Reihenfolge (Schöpfer-bestätigt) + die Heilige-Lektion-Sicherheit

**Erst Heilung + Ordnung + Effizienz, dann das Chaos höherer Ordnung** (Schöpfer,
01.06.2026). Konkret:

1. **Heilung des Stamms** — das blinde Werkstatt-Auge öffnen (Bauplan-Preview auf
   WebGPU, siehe §7) + tote Infrastruktur entfernen (GPU-Density-WGSL ~500 Z.
   abgeklemmt, Hot-Swap-Reste, `mxFractal`). Ein sauberer Stamm, bevor die Seele
   darauf wächst.
2. **Das lebendige Feld** — Schritt für Schritt, durch VERDICHTUNG:
   (a) `worldFieldAt` → `auraAt(x,z,t)` erweitern (die dynamischen Achsen: lokale
   Emotion, Resonanz, Edit-Delta — das eingefrorene Worldgen-Substrat bleibt der Kern);
   (b) die verstreuten Pflaster-Kopplungen EINE nach der anderen auf „lies das Feld"
   umstellen (jede ersetzt einen hand-codierten Pfad durch einen Feld-Read = WENIGER
   Zeilen); (c) dem Nexus Augen geben (er liest das Feld, bevor er schreibt → der Kreis
   schließt sich); (d) optional die KI als DSL-Schreiber wecken.
3. **Fundament schließen** parallel/danach: die ±1024-Wasser-Region, effiziente Höhe,
   und — der tiefste Fleck — **die DSL Richtung Welt-Regeln** (damit die Bibliothek
   wirklich auf komponierbaren Welt-Programmen steht, nicht auf Hardcode).

**Heilige-Lektion-Sicherheit (kritisch):** das ist **Emergenz durch Verdichtung, kein
Urknall-Rewrite.** Das 19-Modul-System kollabierte 2025 an Komplexität-ohne-Fundament.
Das Feld existiert SCHON (`worldFieldAt`); wir erweitern + verbinden, wir ersetzen NIE
den ganzen Kern auf einmal. Jede Welle: ein Pflaster fällt, ein Feld-Read entsteht,
playtest-grün, ein Commit. Performance bleibt heilig (das Feld wird gesampelt wie
heute, nicht pro-Frame-pro-Entity neu erfunden). Wer hier ein großes neues
„LivingWorldManager"-Modul bauen will — **stop**, das ist die Sünde. Das Feld ist eine
Methode auf dem einen Stamm.

---

## 7. Die dunklen Flecken / offene Baustellen (ehrlich, gemessen)

| Fleck                                            | Was                                                                                                                                                                                                                                                                                                                                         | Tiefe / Status                                                                                                                                                                             |
| ------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Werkstatt-Preview tot seit GPU-Umstellung**    | Der 3D-Bauplan-Editor (`_workshopEnsurePreview`, Z~36331) spinnt einen eigenen `THREE.WebGLRenderer` auf + baut über `_buildFromBlueprint` → NodeMaterials, die laut Vendor-Bootstrap (Z24-25) „seit r164 NUR auf WebGPURenderer laufen". Die V12-Migration zog die Haupt-Pipeline um, den Preview nicht → **das Crafting-Auge ist blind.** | **Heilung-Phase, zuerst.** Crafting ist der Symbiose-Pfeiler. Fix: Preview-Renderer auf `WebGPURenderer` (eigenes Canvas, eigene `renderAsync`-Schleife).                                  |
| **DSL = Geste, nicht Welt-Regel**                | Vision (§4.2) will Welten als komponierbare DSL-Programme; real ist die DSL 73 imperative Gesten auf einem hardcodierten Kern. Der tiefste, vision-fernste Fleck.                                                                                                                                                                           | **Tiefe Arbeit (Phase 3).** Der geniale Twist hier: das lebendige Feld IST der erste Schritt — wenn die DSL ins Feld schreibt (statt nur Gesten zu feuern), nähert sich „Welt = Programm". |
| **Emotion einweg + Felder eingefroren/parallel** | §3.2/§3.3 oben.                                                                                                                                                                                                                                                                                                                             | **Kern der Feld-Phase.** Der eigentliche „lebendige Welt"-Inhalt.                                                                                                                          |
| **Nexus blind, KI stumm**                        | §3.1/§3.4 oben.                                                                                                                                                                                                                                                                                                                             | **Feld-Phase (c)/(d).**                                                                                                                                                                    |
| **Tote/parallele Infra**                         | GPU-Density-WGSL (~500 Z., abgeklemmt seit V14.6, 3-Mirror-Wartung), V10.0-e-Hot-Swap-Reste, `mxFractal` (Lint-Warnung Z9978).                                                                                                                                                                                                              | **Heilung-Phase.** Entfernen oder bewusst besitzen.                                                                                                                                        |
| **Fundament-Lücken**                             | ±1024-Hydrosphäre-Region (ferne Welt trocken), Höhen-Clamp (V14.6, Berge gedeckelt statt adaptives Chunk-Band), frame-sauberer Sub-Region-Carve (6× verschoben).                                                                                                                                                                            | **Parallel/danach.** Roadmap §1.1 (V18) + Backlog (g).                                                                                                                                     |

Der Code ist sonst **gut** (die Giganten — `constructor` 956 Z., `_defaultBlueprints`
985 Z. — sind Daten-Konstruktion, kein Logik-Sumpf; Scratch-Pools, Spatial-Hash,
Worker-Determinismus sind sauber). Die Haupt-Reibung ist NICHT die Code-Qualität,
sondern die **konzeptionelle Lücke** (Feld lebendig machen) + die **toten Glieder**
(Werkstatt, GPU-Density).

---

## 8. Für den nächsten Agenten — die Disziplin

1. **Lies diesen Anker + `state-of-realm.md` + `world-portal.md`, BEVOR du an der
   lebendigen Welt baust.** Du sollst verstehen wie der Agent vor dir, nicht raten.
2. **Jede „lebendige Welt"-Behauptung ist ein FELD-READ, kein neues `_tickX`.** Wenn du
   eine Emotion-/Resonanz-/Cluster-Wirkung baust und sie ist eine neue hand-codierte
   Kopplung statt eines Reads aus dem einen Feld → STOP, das ist das Pflaster, das wir
   gerade abschaffen. Verdichte, baue nie parallel (V17.9-Lehre, eine Ebene höher).
3. **Kein Flag, kein Sonderfall, kein neues Modul.** Schärfe die emergente Regel
   (V17.11-Lehre). Das Feld ist eine Methode auf dem einen Stamm (Heilige Lektion).
4. **Reihenfolge halten:** erst Heilung (Werkstatt, tote Infra), dann das Feld, dann
   das Fundament + die DSL-Tiefe. Performance + Determinismus bleiben heilig.
5. **Miss, rate nicht** (die durchgängige Projekt-Lehre): Reproducer mit Output-Lesen,
   vorher/nachher messen, der Schöpfer-Browser ist die visuelle Wahrheit.
6. **Harmonie statt Revert** (V17.23-Schöpfer-Lehre): wenn das Feld eine Sache
   beeinflusst, die schon eine andere Kraft formt (Emotion → Wetter, Tag-Nacht →
   Himmel), und ein Test bricht — nimm das Feld NICHT wieder heraus (das ist
   oberflächlich). Die Wurzel ist fehlende Harmonie: heile in eine **nachgebende
   Hierarchie** — der intentionale Wille (Spieler) FÜHRT, das ambiente Feld WEICHT
   wo der Wille stark ist (×`(1−emoSignal)`) + FÜLLT wo er schweigt; nie
   überschreiben, immer verschmelzen, immer FADEN (kein Snap). Frage bei jeder
   Feld-Kraft: harmonisch oder abrupt? überschreibt sie oder verschmilzt sie?
7. **Ein Feedback-Loop über ein FROZEN Feld ist KEIN Loop** (V17.27-Schöpfer-Lehre):
   wenn du eine „die-Welt-reagiert/heilt-sich"-Schleife baust, frag — schreibt der Akt
   in dasselbe Feld zurück, das die Entscheidung liest? Wenn nicht (`at_field_need` las
   `auraAt.lebendig`, das aus dem frozen `worldFieldAt` kam, das nie geschrieben wurde),
   ist es nur eine wiederholte Messung eines unveränderlichen Feldes = ein hardcodierter
   Vektor, kein selbstlernendes System. Die Heilung ist eine **Schreib-Seite**: ein
   Overlay über dem frozen Kern (`auraAt = min(1, frozen + overlay)`, nie überschreiben),
   in das NUR intentionale Akte schreiben (die Geburt via `spawn_creature`), NICHT die
   FOLGEN des Feldes (ambiente Fauna → sonst positives Feedback-Runaway); lazy-Decay
   (kein per-Frame-Sweep) + Sättigung (kein rich-get-richer). Das Feld bleibt frozen-Kern
    - mutables Overlay (V12.0-perf.b-Trennung) — der frozen Teil cachebar/worldgen, das
      Overlay reaktiv (nicht persistiert, kein Worker-Mirror, V9.67). Wer eine neue Welt-
      Achse schreibbar macht (glut/dichte/magie, Spieler-Pflege), erweitert `_depositLife`
      um die Achse — baut KEINEN Parallelpfad (V17.9).
