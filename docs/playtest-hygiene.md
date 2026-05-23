# Der Playtest-Pflege-Bogen — Test-Hygiene

Stand: 21.05.2026. **Planungs-Anker** für den Hygiene-Bogen, der `scripts/playtest.cjs`
von einer 31 000-Zeilen-Funktion in benannte Sektions-Funktionen DERSELBEN Datei
zerlegt — analog dem Stamm-Pflege-Bogen V9.44 (`docs/archiv/code-hygiene.md`), aber
auf die Test-Schicht angewandt. Eine Session, die den Bogen baut, liest ZUERST dieses
Dokument ganz. Die echte Commit-Nummer vergibt die bauende Session chronologisch.

Der Bogen löst den `roadmap.md`-§1-Punkt „Stamm-Hygiene über den Code hinaus" ein:
seit V9.44 sind Tests Teil des Stamms und tragen dieselbe Hygiene-Disziplin wie der Code.

---

## 1. Warum dieser Bogen — der Befund

Vermessung am echten Quellcode (`scripts/playtest.cjs`, Stand 21.05.2026):

- **31 065 Zeilen, EINE Funktion.** Die ganze Suite ist eine async-IIFE (Zeile 42 bis
  Datei-Ende) mit einem `try`-Block. `startEternalLoop` — der schlimmste Gegner des
  V9.44-Bogens — hatte 696 Zeilen; `playtest.cjs` ist eine Funktion, die 45× so lang
  ist. Strukturell ist die Test-Datei in schlechterer Verfassung, als `anazhRealm.js`
  je war (36 272 Zeilen, aber 761 Methoden).
- **Median-Einrückung 20 Spaces.** 13 676 Zeilen stehen exakt 20 Spaces tief, weitere
  ~8 600 noch tiefer — über 70 % der Datei ist ≥ 20 Spaces eingerückt. Jede Zeile zahlt
  20 Zeichen Tax; das ist der visuelle Fingerabdruck des Ein-Riesen-Block-Problems.
- **196 `### `-Sektionen, kein Gruppierungs-Helfer.** Die Datei IST thematisch
  gegliedert — 196 `// ### …`-Kommentar-Bänder, je eine Welle / ein Feature (Ring 1,
  Ring 2, Welle 4-6, W7, W12-17, der Voxel-Bogen, die Hydrosphäre …). Aber die Marker
  sind bloße Inline-Kommentare, keine Funktionsgrenzen — nicht navigierbar, nicht
  aufrufbar.
- **3 157 `check()`-Invarianten, ~200 `page.evaluate`-Roundtrips.** `check()` ist ein
  einziger Inline-Helfer (Zeile 76). Jede `### `-Sektion folgt demselben Muster: ein
  `await page.evaluate(() => { const r = window.anazhRealm; …; return {…}; }).catch(…)`
  holt ein Ergebnis-Objekt, dann ein Block Node-seitiger `check()`-Aufrufe. Das
  `evaluate`-Boilerplate (`window.anazhRealm` greifen, null-guard, `.catch`-Wrap)
  wiederholt sich ~200×.

**Die Wurzel** — identisch zur V9.44-Wurzel, eine Schicht versetzt: ein Wachstumsmuster
ohne Funktions-Größengrenze. Jede Welle hängt +6-35 Invarianten an die eine IIFE an,
statt eine benannte Funktion zu bilden. Der Code-Stamm bekam mit V9.44 seine Grenze;
der Test-Stamm hat sie nie bekommen.

**Was das KOSTET:** ein neuer Agent navigiert 31 000 Zeilen einer Funktion auf 20 Spaces
Tiefe, um zu finden, wo seine Invarianten hingehören. Das `### `-Band ist die einzige
Orientierung. Jede Welle verteuert die nächste — exakt der V9.40-Schuld-Mechanismus.

---

## 2. Vision-Abgleich — kein Heilige-Lektion-Verstoß

Der erste Reflex bei „eine 31 000-Zeilen-Test-Datei" wäre: ein **Test-Runner**
(Jest/Mocha/Vitest) + ein **Split in `tests/*.cjs`**. Beides ist der
Re-Komplexifizierungs-Fehler:

1. **Kein Test-Runner.** Jest/Mocha wären eine schwere neue Dependency, ein neues
   Ausführungs-Modell, und sie kämpften gegen das Puppeteer-Ein-Browser-sequenziell-
   Modell. Das aktuelle Modell — ein Browser, eine Welt, sequenzielle `evaluate`-dann-
   `check`-Sektionen — ist richtig, CI-erprobt, zero-runner-dep. Es bleibt.
2. **Kein Datei-Split.** `playtest.cjs` bleibt EINE Datei. Die IIFE wird in benannte
   Funktionen DERSELBEN Datei zerlegt — exakt wie `anazhRealm.js` eine Datei mit 761
   Methoden ist. Der Stamm bleibt ein Stamm; der Test-Stamm auch.
3. **Eine 31 000-Zeilen-Funktion IST Komplexität ohne Fundament.** Der Bogen REDUZIERT
   Komplexität (benannte Struktur), er fügt keine hinzu. Reines verhaltensneutrales
   Refactoring — derselbe Wellen-Typ + dasselbe Risiko-Profil wie V9.44.
4. **Es ist die `roadmap.md`-§1-Disziplin eingelöst** — „Stamm-Hygiene über den Code
   hinaus" + die V9.44-Lehre „Test + Doku sind seit V9.44 Teil des Stamms".

---

## 3. Die Disziplin — das Netz refactort sich selbst

Hier ist der Bogen RISKANTER als V9.44, und das wird ehrlich benannt: V9.44 hatte die
~3000 Playtest-Invarianten als Sicherheitsnetz — sie BEWIESEN die Verhaltensneutralität.
Bei diesem Bogen ist das Netz das, was umgebaut wird. Es gibt keinen Meta-Test.

**Der Beweis** — der Playtest beweist sich über seine eigene Ausgabe:

- VOR dem Bogen: 2-3 Baseline-Läufe `PLAYTEST_STRICT=0 npm run playtest`, die volle
  geordnete `✅/❌ <name>`-Liste capturen. Daraus den **stabilen Satz** (jeder Lauf
  identisch) vs. den **Drift-Satz** (lauf-abhängige Invarianten — der Konsolen-Zähler
  driftet ±2-3, `CLAUDE.md`) bestimmen.
- NACH JEDEM Sub-Schnitt: erneut laufen, die geordnete Namen-Liste diffen. Der stabile
  Satz MUSS bit-identisch sein; der Drift-Satz bleibt in seinem bekannten Band.
- Reine **mechanische Extraktion** (Block → Funktion, `ctx` übergeben, NULL Logik-
  Änderung) lässt die Ausgabe deterministisch identisch. Zeigt der Diff eine NEUE
  Abweichung, hat die Extraktion Verhalten geändert — zurück, neu schneiden.

**Bau-Regeln:**

- **Ein Sub-Schnitt = ein Commit, diff-sauber, playtest-grün.** `npm run check` + lint
  + format jedes Mal.
- **Die Sektions-Reihenfolge ist bindend.** Manche Sektion lässt Browser-Rest-Zustand
  (eine, die Voxel-Terrain togglet); die nächste baut darauf. Niemals Sektionen
  umordnen.
- **Geteilte Akkumulatoren über `ctx`.** `logs`, `errors`, `check`, `failures` werden
  über den ganzen Lauf gesammelt — sie wandern in ein `ctx`-Objekt, das jede Sektions-
  Funktion liest. Keine Sektion mutiert `ctx` außer über `check`.
- **Deckt der Bogen einen flaky / pre-existing Bug auf**, wird er in einem GETRENNTEN
  Commit geheilt (V9.44-d-Disziplin — die drei flaky Journal-Tests), nicht im
  Extraktions-Commit versteckt.

---

## 4. Die Sub-Wellen

Reihenfolge-Prinzip wie V9.44: vom Gerüst zum Detail, jede Sub-Welle ein Commit.

| # | Welle | Was | Aufwand | Risiko | Status |
|---|---|---|---|---|---|
| a | **Gerüst + Beweis-Schnitt** | `ctx`-Objekt + `safeEvaluate`-Helfer; die ersten drei extrahierbaren Sektionen (Initial-State-Basis, Ring 1 Grok, Ring 2 DSL+Terrain-Erweiterung) als benannte Module-Scope-Funktionen, vom Orchestrator `await`-et. Etabliert Muster + Beweis-Methode. | ~1 Session | niedrig | ✅ V9.52-a (23.05.2026, vier Baseline-Läufe bit-identisch; nur pre-existing Drift-Bänder verbleiben) |
| b | **Band 1 — Ringe + frühe Hylomorphismus-Wellen** | Welle 1-5, Ring 8-11.5 (41 Sektionen) als 11 Band-Funktionen | ~1-1.5 Sessions | niedrig | ✅ V9.52-b (23.05.2026, 11 Band-Funktionen je 265-1260 Z., sechs Baseline-Läufe bit-identisch; mechanisches Skript `/tmp/extract-band1-grouped.cjs`) |
| c | **Band 2 — Welle 6 + Voxel-Bogen + Hydrosphäre** | Welle 6.A bis 6.H Phase 2C (53 Sektionen) als 8 Band-Funktionen (475-1567 Z.); 6.X Audit-Fixes verschoben nach Band 3 | ~1.5 Sessions | niedrig | ✅ V9.52-c (23.05.2026, 8 Band-Funktionen `checkBandWelle6APolish` .. `checkBandWelle6HCreatures`, sieben Baseline-Läufe bit-identisch; Skript `/tmp/extract-band2-c.cjs`) |
| d | **Band 3 — Welle 6.X Audit + Atmosphäre + Fremd-Engine-Bogen** | Welle 6.X.1-X.5 + 6.G3/G4 + V8.24-V8.49 + W12-W14 + KI-Übersetzer + V8.70-72 (50 Sektionen) als 8 Band-Funktionen (498-1190 Z.) | ~1.5 Sessions | niedrig | ✅ V9.52-d (23.05.2026, 8 Band-Funktionen `checkBandWelle6XAudit` .. `checkBandV8LatePolishAnd6XContinued`, acht Baseline-Läufe bit-identisch; Skript `/tmp/extract-band3-d.cjs`) |
| e | **Band 4 — Rest + Schluss** | die übrigen Sektionen, der Report-Block, `finally`/Exit | ~1 Session | niedrig | offen |
| f | **Politur — Helfer-Durchzug** | jede Sektion, die das `evaluate`-Boilerplate noch inline trägt, durch `safeEvaluate` routen; `### `-Header-Stil vereinheitlichen; Orchestrator schlank ziehen; Rest-Grenze dokumentieren | ~1 Session | niedrig | offen |

**Sub-Welle a — das Gerüst.** Der Orchestrator wird: Setup (Server-Start, Browser-Launch,
Log-Sammlung — Zeile 1-114, bleibt unangetastet) → Report → eine geordnete Liste
`await checkX(ctx)` → `finally`/Exit. `ctx = { page, check, logs, errors }`.
`safeEvaluate(page, fn)` kapselt das `await page.evaluate(fn).catch(err => ({error:
err.message}))` + den `if (!res || res.error)`-Guard. Das erste Band beweist das Muster
UND dass die Ausgabe bit-identisch bleibt.

**Sub-Wellen b-e — die Bänder.** Vier zusammenhängende Bänder von ~6-7k Zeilen, je
~45-55 `### `-Sektionen. Die Band-Grenze wird IMMER an einer `### `-Sektions-Kante
gezogen, nie mitten in einer Sektion. Jedes Band wird eine (oder wenige) benannte
Funktion(en) — Granularität: **Band-/Bogen-Ebene, NICHT per-Sektion** (siehe §5).

**Sub-Welle f — der Helfer-Durchzug.** Nach b-e ist jede Sektion in einer benannten
Funktion; f vereinheitlicht: das `evaluate`-Boilerplate konsequent durch `safeEvaluate`,
ein konsistenter Sektions-Header, der Orchestrator auf seine reine Liste reduziert. Ein
letzter voller Diff gegen die Baseline.

---

## 5. Bewusst NICHT im Bogen — ehrlich benannt

- **Kein Test-Runner, kein Datei-Split** — §2.
- **Keine per-Sektion-Funktionen.** 196 winzige Funktionen wären Über-Zerlegung. Eine
  `### `-Sektion ist meist eine FLACHE Folge von `check()`-Aufrufen — das ist *Daten-
  Länge*, kein Kontrollfluss (dieselbe `code-hygiene`-§5-Logik, die `dslEffects` 892 Z.
  nicht zerlegte). Ziel: **Band-/Bogen-Funktionen** (~25-35 Funktionen, je ~500-1200 Z.,
  intern eine flache, jetzt spalten-0-nahe Liste von `### `-Blöcken). Eine 1000-Zeilen-
  Test-Band-Funktion mit 50 flachen `evaluate+check`-Blöcken ist navigierbar; sie in 50
  Mini-Funktionen zu sprengen fügt Aufruf-Indirektion ohne Komplexitäts-Gewinn hinzu.
- **Die Invarianten selbst werden NICHT umgeschrieben.** Die `check()`-Aufrufe + ihre
  Pass/Fail-Logik bleiben bit-identisch. Reine strukturelle Extraktion, kein Test-
  Rewrite. Ein gefundener flaky Test → getrennter Commit (§3).
- **Das Puppeteer-Setup + der FPS-Report (Zeile 1-114)** — klein, funktioniert; in den
  Orchestrator wickeln genügt, nicht zerlegen.
- **`smoke-*.cjs` (153-792 Z.) + `audit-strict.cjs` (749 Z.)** — schon klein, nicht im
  Scope.
- **Die Invarianten-ZAHL** — der Bogen macht das Anhängen leichter, er deckelt das
  Wachstum nicht.

---

## 6. Akzeptanz + Bau-Reihenfolge

**Reihenfolge:** a (Gerüst) zuerst — es etabliert Muster + Beweis-Methode; dann b-e (die
Bänder); f (Politur) zuletzt. Mirror V9.44. Ein ~7-8-Session-Bogen.

**Wann:** der `roadmap.md`-§1-Disziplin folgend — terminiert, sobald die nächste
Feature-Welle den Playtest substanziell anfasst, ODER als bewusster Standalone-Bogen.
Nicht „irgendwann" (V9.40-Schuld-Lehre).

**Akzeptanz nach f:** `playtest.cjs` ist ein schlanker Orchestrator (~150-250 Z.: Setup
+ Report + geordnete `await checkX(ctx)`-Liste + `finally`/Exit) + ~25-35 benannte
Band-Funktionen + 2-3 Helfer. Keine Funktion über ~1200 Zeilen. Die Median-Einrückung
fällt von 20 auf ~4-8. Die geordnete Invarianten-Namen-Liste + ihr Pass/Fail ist
bit-identisch zum Vor-Bogen-Stand (modulo dem dokumentierten ±2-3-Drift-Satz). Gleiche
Laufzeit, gleiches CI-Verhalten, gleiches `npm run playtest`-Interface.

**Ehrliche Rest-Grenze:** die `playtest.cjs`↔`anazhRealm.js`-Ko-Evolution bleibt — jede
Code-Zeile verlangt weiter eine Test-Zeile (der bewusste Preis der Test-Disziplin,
`code-hygiene` §5). Der Bogen heilt die STRUKTUR der Test-Datei, nicht ihre Größe; sie
wächst weiter, aber in benannten Funktionen statt in einem Monolithen.
