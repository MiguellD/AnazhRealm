# Das lebendige Feld — der wahre Norden (Vision-Anker)

> **Lies dieses Dokument ZUERST, wenn du an „der lebendigen Welt", „Emotion ↔ Welt",
> „Kreaturen lebendiger", „dem Nexus", „der DSL", „fraktalem Wachstum" oder „der KI
> als Co-Schöpfer" arbeiten willst.** Es hält das Verständnis fest, das der Schöpfer
> und der Agent in der Reflexion vom 01.06.2026 erarbeitet haben — damit der nächste
> Agent NICHT wieder ein Pflaster-System baut, sondern das Vorhandene zu EINEM
> lebendigen Feld verdichtet. **Stand: nach V17.71 — der ganze Feld-Bogen ist DURCH** (lesen·schreiben·WERTEN), plus der Emotion-Kern (V17.45–.49), der Kampf-Bogen (V17.51–.58) und der Schöpfungs-Fluss + die Resonanz-Vereinheitlichung (V17.59–.71); der geordnete Rest-Backlog lebt in `docs/roadmap.md` „OFFENE FÄDEN". Die Heilung war DURCH (V17.19 Werkstatt-Auge, V17.20 tote Glieder), der ERSTE Feld-Bogen ist RUND, mit BEIDEN Hälften (lesen UND schreiben), und die Spawn-Harmonie ist geheilt (V17.28: GROSSE Strukturen spawnen footprint-bewusst nicht mehr AUF dem Spieler — „der Ort, an dem ich stehe, ist besetzt" — kein Fall-durch-den-Boden mehr; plus ein Void-Boden): `auraAt(x,z,t)` (die Lese-Seite, V17.21) + der geschlossene Kreis Welt→Spieler-Emotion (V17.21, via `FIELD_TO_EMOTION` — §3.2/§3.3 sind nicht mehr offen, der Rückweg existiert) + der Nexus LIEST das Feld + komponiert resonant (V17.22, §3.1 „blinder Nexus" geheilt) + drei Kräfte verschmelzen in HARMONIE statt Revert (V17.23: Wille führt, Feld weicht/füllt) + nichts snappt mehr (V17.24: Sky-Farb-Cross-Fade) + VIELE Leser teilen das Feld (V17.25, §5: die Logik-Konsumenten lesen `auraAt` + die VOLLEN Achsen — glut DÄMPFT die Fauna) + der Nexus heilt GEZIELT den Mangel (V17.26: Resolver `at_field_need` → er trägt Leben in die ÄRMSTE Region) + **die SCHREIB-Seite ist gebaut (V17.27): ein sparse, lazy-zerfallendes Leben-Overlay über dem frozen Kern — `_depositLife` schreibt, `auraAt` blendet (`min(1, frozen+overlay)`); eine Geburt hebt lebendig → der at_field_need-Loop schließt sich ECHT (Leben spreizt, der Mangel sinkt, Sättigung statt rich-get-richer) → „die Welt heilt sich" ist jetzt eine geschlossene REGEL, kein Vektor.** + **der Kreatur-Trickle (V17.29): die Schreib-Seite wird eine ATMENDE Ökologie** — eine Nexus/Spieler-getragene Kreatur (`tendsLife`) träufelt fortlaufend Leben in ihre Zelle → die geheilte Region BLEIBT lebendig (statt nach dem Geburts-Puls zu verblassen); Leben sustainiert sich, wo es wohnt; die ambiente Fauna träufelt NICHT (kein Runaway, V17.27-Disziplin) + **Pfeiler 2 wird WAHR (V17.30): die Emotion leitet sich aus dem echten SEIN-IN-DER-WELT ab** — über ALLE sechs Achsen, aus TATEN (`ACTION_TO_EMOTION` an jeder Handlungs-Stelle: bauen/Leben-spawnen/ernten/erkunden/verbünden/Schaden) + ZUSTAND (niedrige HP) + UMGEBUNG (Feld-Read V17.21), nicht mehr nur Chat-Stichwörter (§3.2 „Emotion ist ein Einweg-Ventil" damit weiter geheilt — die Emotion liest jetzt den Spieler) + **die Reflexion deckt zwei tote Emotions-Haken auf + heilt sie (V17.31): die `auraAt.emotion`-Achse war ein PASSAGIER** (niemand las sie, die Welt las `player.emotions` direkt — der §2-Diagramm-Anspruch „eine Feld-Achse, die alle lesen" war Deko), und der Wasser-`uEmotion`-Haken (V14) blieb stumm auf 0.0; jetzt liest der Welt-Tint `aura.emotion` (die Achse ist ein echter Leser → wird emotion künftig RÄUMLICH, färbt der Welt-Tint automatisch lokal mit) und das Wasser wird gefüttert → die Emotion treibt die Welt KONTINUIERLICH (Licht + Wasser), nicht nur in 0.7-Sprüngen + **die RÄUMLICH-dynamische Emotion-Achse (V17.32): das Feld bekommt ein emotionales GEDÄCHTNIS** — `_depositEmotion` prägt die Tat-Emotion an der Spieler-Zelle ein (dieselbe Maschinerie wie das Leben-Overlay), `auraAt.emotion` blendet den lokalen Abdruck über die globale Stimmung, der V17.31-Welt-Tint färbt den Ort automatisch räumlich (konsumiert, kein Passagier) → die Welt erinnert sich, wo du fühltest. **Emotion ist damit die ZWEITE schreibbare Feld-Achse nach lebendig — §3.3 „die Felder sind PARALLEL + EINGEFROREN" ist für emotion geheilt (sie ist jetzt INS Feld geschrieben, nicht parallel daneben).** Damit: die Welt spürt + versteht + schreibt + heilt + ERHÄLT sich + ERINNERT sich, und die Emotion treibt sie — kontinuierlich + räumlich. **UPDATE (nach V17.71 — die drei §3.4/§3.5-Flecken sind GEHEILT):** der DSL-Weltregeln-Bogen (§3.4) ist DURCH (V17.33–.41: Mensch · Nexus · KI schreiben am selben Regel-Satz, sichtbar via Gesetzes-Faden); die **WERTUNG (§3.5)** ist DURCH (V17.42–.50, das dritte Verb LESEN → SCHREIBEN → **WERTEN**: die Regel-Fitness wurde der lokale strukturelle δ am Ort, die Emotion der Appraisal-δ gegen eine gleitende Baseline — die Welt LERNT was den Spieler freut, by-construction anti-gaming; voll dokumentiert in `docs/archiv/lebendige-wertung-plan.md`). Dazu kamen der Emotion-Kern (V17.45–.49), der Kampf-Bogen (V17.51–.58, der dem Emotion-Kern den letzten Affekt-Konsumenten gibt) und der Schöpfungs-Fluss + die Resonanz-Vereinheitlichung (V17.59–.71, „ein Produkt-Vektor, viele Leser"). **Was vom alten Feld-Backlog BLEIBT:** die Spieler-Pflege als zweiter Leben-Schreib-Pfad (DU trägst Leben — Co-Schöpfung) + die anderen Feld-Achsen schreibbar machen, falls die Vision sie braucht (dichte/glut/magie sind heute absichtlich frozen = geologische Identität) + Emotion→Regel-EMERGENZ (die einzelnen Kopplungen wie `sorrow→rainy` sind noch hand-codiert, via die Weltregeln-DSL emergent machbar). Der vollständige geordnete Gesamt-Backlog (A Crafting · B Kampf · C Fundament · D Vision) lebt in **`docs/roadmap.md` „OFFENE FÄDEN".**

Verwandte Anker: `state-of-realm.md` (die Vision/Testamente), `world-portal.md`
(die Bibliothek von Alexandria — das Fern-Ziel), `archiv/dsl-weltregeln-plan.md` (der
Regel-Satz, V17.33–.40 GEBAUT), `archiv/lebendige-wertung-plan.md` (das DRITTE Verb —
WERTEN: Regel-Fitness + Emotion via Vorhersagefehler, GEBAUT V17.42–.50),
`archiv/nexus-dsl.md` (das alte DSL-Design, Ring 2), `crafting-konzept.md`
(Hylomorphismus = das Material/Form-Substrat).

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
   **→ GEHEILT (V17.21 + V17.30): der Rückweg Welt→Spieler existiert** (V17.21:
   die Aura nährt peace/hope/awe via `FIELD_TO_EMOTION`), **und die Emotion liest
   jetzt den Spieler über ALLE Achsen** (V17.30: `ACTION_TO_EMOTION` — Taten
   [bauen/ernten/Leben/erkunden/verbünden/Schaden] + ZUSTAND [HP] + UMGEBUNG
   [Feld]; nicht mehr nur Chat-Stichwörter, joy bewegt sich endlich aus echtem
   Spiel). Damit feuern die Spieler→Welt-Kopplungen wieder (Pfeiler 2 wacht auf).
   **Noch offen:** die einzelnen Kopplungen (`sorrow→rainy` etc.) sind weiter
   hand-codierte Trigger, nicht aus dem Feld emergent — der DSL-/Regel-Schritt (§3.4).

3. **Die Felder sind PARALLEL und EINGEFROREN.** `worldFieldAt(x,z)` (4 Achsen:
   lebendig/dichte/glut/magieleitung) ist schön vereint — aber **read-only**, beim
   Worldgen eingefroren. Der Spieler kann `lebendig` nicht durch Pflanzen heben;
   Emotion moduliert es nicht; Carve/Edit ändert es nicht. Und es lebt PARALLEL neben
   Hydrosphäre, Erosion, Emotion, Kreatur-Population — **nicht EIN Feld, sondern
   fünf.** Die DSL kann es nur lesen (`compound_has_tag`), nie schreiben.
   **→ TEILWEISE GEHEILT (V17.27 + V17.32): ZWEI Achsen haben jetzt eine SCHREIB-Seite**
   — `lebendig` (V17.27: ein Leben-Overlay, `_depositLife` → `auraAt`-Blend, eine Geburt
   hebt + es zerfällt) UND `emotion` (V17.32: ein Emotions-Overlay, `_depositEmotion` am
   Ort des Fühlens → `auraAt.emotion`-Blend über die globale Stimmung, der Welt-Tint färbt
   den Ort räumlich). Beide sind RÄUMLICH, reaktiv, konsumiert; der frozen Kern bleibt
   (worldgen/cachebar), die Overlays sind die reaktive Schicht. **Noch offen:** die drei
   geologischen Achsen (dichte/glut/magieleitung) sind ABSICHTLICH frozen (die geologische
   Identität — eine Schreib-Seite bräuchten sie nur, wenn die Vision sie verlangt); das
   Feld lebt noch PARALLEL neben Hydrosphäre/Erosion (nicht zu EINEM verschmolzen); und die
   DSL schreibt die Overlays nur indirekt (über `spawn_creature`/`_feelAction`), nicht als
   direkte Feld-Schreib-Op (§3.4).

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
**→ VOLL GEPLANT (01.06.2026): `docs/archiv/dsl-weltregeln-plan.md`** — der Weg von der
Gesten-Sprache zu stehenden `Bedingung→Effekt`-WELT-REGELN, die das (jetzt
schreibbare, V17.27/.32) Feld lesen+schreiben. Der geniale Leap ist EIN Primitiv:
ein `rule` = ein `when`, das nicht verfällt (im Registry steht, im Welt-Tick
fortlaufend geprüft). Eine Welt = ihr Regel-Satz + Seed → die Bibliothek wird wahr
(merge = Vereinigung der Regel-Sätze). Der V17-Feld-Bogen schuf den fehlenden Stein:
einen deterministisch-sicheren Schreib-Raum (die reaktiven Overlays), in den Regeln
schreiben, ohne den Seed zu brechen. Fünf Phasen (A–E), reine Verdichtung, kein
Urknall. **Vor der DSL-Arbeit den Plan ZUERST lesen.**
**→ GEBAUT (V17.33–.40): der ganze DSL-Weltregeln-Bogen ist DURCH** (A das `rule`-
Primitiv · B Feld-Kopplung · C Nexus evolviert · D Mensch gibt Gesetze · E Persistenz/
Merge · die KI/das LLM als dritte Schreiberin); **+ SICHTBAR (V17.41): der Gesetzes-
Faden** (die Console geht live „⚡ feuert", das Erwachen einer Mensch-Regel wird eine
Welt-Erinnerung). Mensch · Nexus · KI schreiben am SELBEN Regel-Satz, in EINER Sprache.

5. **Die WERTUNG ist flach — das dritte Verb fehlt (GEMESSEN, 02.06.2026).** Der DSL-
   Bogen baute den KÖRPER der Evolution (Variation/Heredität/Selektion/Lebenszyklus),
   aber der Selektionsdruck ist ein Platzhalter: `_worldRuleFitness` = `0.4·Kosten +
   0.6·Erfolg` → **≈ 0.99 für JEDE feuernde, nicht-crashende Regel** (durchgerechnet) →
   keine Auflösung, kein Gradient Richtung GUT (eine heilende und eine sinnlose Regel
   haben dieselbe Fitness — Selektion auf VIABILITÄT, nicht WERT). Und die Emotion ist
   ein REFLEX: `ACTION_TO_EMOTION` ist eine feste Tabelle (`build → joy+0.1`, das 100.
   Haus so freudig wie das erste — keine Gewöhnung/Kontext/Sättigung), sechs additive
   Achsen, eine 0.7-Stufen-Schwelle. **Das Substrat ist voraus, die WERTUNG ist zurück.**
   **→ VOLL GEPLANT (02.06.2026): `docs/archiv/lebendige-wertung-plan.md`** — das DRITTE Verb
   des Feldes (LESEN → SCHREIBEN → **WERTEN**). Der Hebel ist die EINE bewährte Gleichung,
   auf die RL (TD-Fehler/Advantage), Neurowissenschaft (Dopamin = Reward Prediction
   Error), Verhaltensökonomie (Prospect Theory) und Spiel-KI (Sims/Black & White)
   unabhängig kamen: **Vorhersagefehler gegen eine gleitende Baseline** (`baseline ←
   baseline + α·(x − baseline)`, `δ = x − baseline`). Sie subsumiert BEIDE flachen
   Systeme: die Regel-Fitness wird der lokale strukturelle δ am Ort der Regel (Regeln
   überleben, weil der Ort, den sie berühren, AUFBLÜHT — lokale, kausale Attribution,
   die der Passagier-Trugschluss NICHT konnte, jetzt möglich weil das Feld RÄUMLICH ist),
   und die Emotion wird der δ des Erlebens (Gewöhnung fällt umsonst heraus). Phase 4 ist
   die Klammer: beide sind DASSELBE δ → die Welt LERNT, was den Spieler freut. Minimaler
   Hardcode (eine prinzipielle Valenz + zwei Zeitkonstanten ersetzen eine Magie-Tabelle).
   **Vor jeder Fitness-/Emotion-Arbeit den Plan ZUERST lesen.**

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
| **Die WERTUNG ist flach (Fitness + Emotion)**    | §3.5 oben. Die Regel-Fitness selektiert auf VIABILITÄT (≈0.99 für jede laufende Regel, gemessen), nicht WERT; die Emotion ist ein REFLEX (feste `ACTION_TO_EMOTION`-Tabelle, keine Gewöhnung/Kontext). Das Substrat ist voraus, die Wertung zurück.                                                                                            | **DER NEUE tiefste Fleck (nach V17.41).** Voll geplant: `archiv/lebendige-wertung-plan.md` — das dritte Verb WERTEN via Vorhersagefehler/gleitende Baseline (eine bewährte Gleichung, 4 Phasen).  |
| **Werkstatt-Preview tot seit GPU-Umstellung**    | → GEHEILT (V17.19): Preview auf `WebGPURenderer` umgestellt; die visuelle Wahrheit bleibt Schöpfer-Browser (headless pixel-blind).                                                                                                                                                                                                            | **Heilung-Phase DURCH.** Crafting-Auge offen.                                                                                                                                             |
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
