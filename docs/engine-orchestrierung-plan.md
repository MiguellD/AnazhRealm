# DER ENGINE-ORCHESTRIERUNGS-BOGEN — der Dirigent zum Giganten

> **Status: ✅ VOLLENDET (V18.353–.355) — Phase A + B + C GEBAUT.** Geschrieben nach einer
> gemessenen Kartierung des echten Codes (vier Explore-Agenten + eigene Verifikation — KEINE Annahmen).
>
> **FORTSCHRITT:** **Phase A ✅ (V18.353)** — A.1 die platzierte Architektur region-gecullt
> (`_archPlacedRegionKey`, `p:`-Namensraum, Toggle `useRegionArchCull` Default an, `diag-arch-cull`
> grün) + A.2 die Region-BatchedMesh (`_archBatchGroupFor` region-gekeyt + refcountet, Toggle
> `useBatchedArch` Default AUS bis Schöpfer-Browser, **3,31× Draw-Call-Kollaps headless bewiesen**,
> `diag-arch-batch` grün). **Phase B ✅ (V18.354)** — der Frame-Budget-Scheduler (`_makeFrameBudget`
> + der pure `_dispatchFrameJobs` + `_buildDeferrableJobs` + `_runFrameScheduler`, Toggle
> `useFrameScheduler` Default AUS bis Schöpfer-Browser, das `!chunksBuilt`-Gate bewahrt, Streaming
> heilig prio 0, `diag-frame-scheduler` grün). **Phase C ✅ (V18.355)** — der Fixed-Timestep Sim/
> Render-Split (`_loopPlayerMovement`-dt-Override + `_stepFixedSim` + `_loopFixedStep`-Akkumulator +
> `_applyFixedInterpolation`, Toggle `fixedTimestep` Default AUS bis Schöpfer-Browser, **30/60/120 fps
> → BIT-IDENTISCHER Sim-State** = das Lockstep-Fundament, `diag-fixed-timestep` + `diag-walk-feel` +
> `diag-replay-determinism` grün). **DER DIRIGENT STEHT.** Offen: die Toggles am Schöpfer-Auge
> default-an drehen (der echte FPS-/Feel-Gewinn) + Lockstep-MP Stufe 2/3 (auf Phase C aufbauend).
> Schöpfer-Auftrag: „lerne tief von den besten der besten · wie die Last verteilt wird, die Logik der
> Reihenfolge · der Nutzer das ultimative Gefühl · eine Engine die alles in den Schatten stellt, damit
> wir darauf aufbauen können · ihr Wissen verbunden und einen Giganten geschaffen."

---

## 0. DIE EHRLICHE LAGE (gemessen, nicht behauptet)

Das **Fundament ist schon Profi.** Was fehlt, ist der **Dirigent**, der die guten Instrumente zum Orchester macht. Die Trennung exakt:

**Schon Profi-Niveau (verifiziert):**
- **EIN Perf-Regelkreis** (`_nexusPerfRegulate`→`_nexusPerfActuate`, velocity-PID): EIN loadScale fährt alle Qualitäts-Stellgrößen. Gesetz #0, kein Parallel-Pflaster. Mit V18.352 ist der Schatten-Pass drin.
- **Feld-native Determinismus** (V18.331): Kollision/Bewegung sind eine REINE Funktion des Dichtefelds → bit-identischer Replay bewiesen (`diag-replay-determinism`).
- **Off-thread + kapazitäts-gewachsen**: Chunks/Skins/Wasser-Sheet backen im Worker; Ring/Laub wachsen nach gemessener Hardware.
- **Gesetz #0**: aura · perfSense · surfMap · slope · die Merge-/Blueprint-Cache — kanonische Quellen, die alle lesen.

**Die drei Lücken des Dirigenten (gemessen):**
1. **Die Reihenfolge ist eine HARTKODIERTE Sequenz, kein Scheduler.** `startEternalLoop` (anazhRealm.js:72432–72669) ruft ~40 Ticks in fester Ordnung. Die zeit-budgetierten Ticks (Streaming, Wasser-Iso, Vorbacken) prüfen JEDER `performance.now() - tStart > budget` LOKAL — **kein geteilter Frame-Budget-Pool, keine Within-Frame-Priorität.** Der Regler tunt die Parameter am Frame-ENDE (wirkt nächsten Frame). → Kein Dirigent, der das Rest-Budget nach Priorität verteilt.
2. **Der Render-Pfad hat keine Batching-/Cull-Schicht über den Draw-Calls.** ~1149 Draw-Calls (gemessen), dominiert von den instanzierten Architektur-Gruppen. **Die GLOBAL platzierte Architektur ist `frustumCulled=false` (anazhRealm.js:57950) → NIE gecullt**, die ganze Welt rendert egal wohin man schaut. BatchedMesh existiert, ist aber DEAKTIVIERT (`useBatchedFoliage=false`, anazhRealm.js:1133 — der 1-GB-Vorab-Alloc-OOM). Kein GPU-Indirect-Draw.
3. **Sim und Render sind EIN variabler Loop.** `delta = Math.max(0.001, (time-lastTime)/1000)` (anazhRealm.js:72432), `setAnimationLoop` variabel. Der Replay ist deterministisch NUR für eine aufgenommene dt-Sequenz — NICHT framerate-unabhängig (zwei Maschinen bei verschiedenen FPS divergieren). → Kein fixed-timestep, also kein echtes Lockstep-MP + die Optik ruckelt bei schwankender FPS.

**Disziplin-Wahrheit:** Das ist **Verfeinerung eines guten Systems**, kein Reparieren eines kaputten. Jede Phase macht den Dirigenten weltklasse, OHNE das laufende System zu brechen — inkrementell, behavior-preserving wo es zählt, headless-beweisbar, jede Phase ein grünes Gate.

---

## 1. DAS WISSEN DER GIGANTEN (die Profi-Pattern, auf DIESE Engine gemünzt)

| Pattern | Quelle (die Besten) | Hier angewandt |
| --- | --- | --- |
| **Job-System / kooperatives Scheduling nach Priorität** | Naughty Dog — Christian Gyrling, „Parallelizing the Naughty Dog Engine Using Fibers" | Single-Thread-JS hat keine Fibers, aber das PRINZIP überträgt sich: ein **zeit-geschnittener Prioritäts-Dispatcher** zieht aus EINEM Frame-Budget-Pool die höchst-priore wartende Arbeit, bis das Budget leer ist (Phase B). |
| **Frame-Graph / Render-Graph** | Frostbite — Yuriy O'Donnell, „FrameGraph: Extensible Rendering Architecture" | Wenige deklarierte Pässe (Schatten · Haupt · Post) als Liste mit explizitem Cull/Enable; PLUS die DOD-Draw-Call-Kollaps-Schicht (Phase A). |
| **Fix Your Timestep** | Glenn Fiedler — „Fix Your Timestep!" | Akkumulator: die SIM steppt fix (60 Hz, deterministisch), der RENDER interpoliert (`alpha`) → glatte Optik bei jeder FPS + framerate-unabhängiger Determinismus = das Lockstep-MP-Fundament (Phase C). |
| **Data-Oriented Design** | Mike Acton — „Data-Oriented Design and C++" | Die Draw-Call-Kollaps-Schicht denkt in BULK (eine BatchedMesh pro Region statt N InstancedMeshes); der Scheduler in Job-Records, nicht verstreuten Closures. |
| **Single Source of Truth** | DAS PROJEKT SELBST — Gesetz #0 (`docs/archiv/handover.md`) | JEDE neue Schicht ist EINE Quelle, die in den bestehenden Regler EINKLINKT — NIE ein zweites Parallel-System. |

---

## 2. DIE WÄNDE (jede Phase gehorcht ihnen — verbindlich)

1. **GESETZ #0 — kein Parallel-System.** Der Scheduler ist KEIN zweiter Regler. Der Regler setzt die QUALITÄTS-Ziele (wie viel Arbeit zu QUEUEN: foliageRadius/dichte/ring); der Scheduler verteilt die GEQUEUTE Arbeit im Frame-Budget nach Priorität. Zwei Schichten EINES Systems. Das `_frameOverBudget`-Flag wird zur FOLGE des Schedulers (Budget leer), kein Sentinel daneben.
2. **STREAMING IST HEILIG (V18.282).** Bewegung/Terrain wird NIE vom Render-/Deko-Druck verhungert. Im Scheduler bekommt Streaming die höchste Priorität + Rückstau → volles Budget.
3. **DETERMINISMUS** — die SIM bleibt eine REINE Funktion (kein `Math.random`/Zeit im Step-Pfad; seed-/input-getrieben). Phase C macht sie framerate-UNABHÄNGIG (stärker). `diag-replay-determinism` bleibt grün, gewinnt Framerate-Unabhängigkeit.
4. **GATE-TREU + HEADLESS-BEWEISBAR.** Jede Phase hat eine HARDWARE-UNABHÄNGIGE Linse (Dispatch-Logik · Draw-Call-Zahl · framerate-unabhängige Bit-Gleichheit). Der ECHTE FPS-Gewinn ist Schöpfer-Browser (die render-gebundene Wand, Regel #0) — aber der PROXY ist headless bewiesen. Der volle `npm run playtest` bleibt nach jeder Phase grün.
5. **INKREMENTELL + GEFLAGGT.** Jede Phase hinter einem Toggle (`state.useFrameScheduler` / `useBatchedArch` / `fixedTimestep`), Default AUS bis verifiziert, dann an. Behavior-preserving wo es zählt; ein Toggle-aus revertiert sofort (das V18.349-Muster).
6. **DIE HEILIGE LEKTION — im STAMM.** Loop, Scheduler, Render-Graph sind STAMM-Logik (der Kontrollfluss-Kern), kein neuer Datei-Split (keine echte Laufzeit-/Sicherheits-Grenze). Eine Kontrollfluss-Methode > ~200 Zeilen → in kleinere benannte Methoden DERSELBEN Klasse (V9.44), nicht in ein Modul.

---

## 3. PHASE A — DER RENDER-GRAPH / DRAW-CALL-KOLLAPS

**Warum zuerst:** am SICHERSTEN (berührt die Loop-Struktur NICHT), höchster sofortiger FPS-Wert (Draw-Calls sind der Schwach-GPU-Killer), HEADLESS-MESSBAR (die Draw-Call-/Caster-Zahl). De-risked den Render-Pfad vor den tieferen Phasen.

### A.1 — Die global platzierte Architektur frustum-cullen (das V18.300-Muster ausgedehnt)

**Befund:** `_archInstanceGroupFor(name, leafIdx, leaf, regionKey)` (anazhRealm.js:57934) setzt `frustumCulled = regional` — TRUE nur wenn `regionKey != null`. Die STREU ist region-gekeyt (V18.300, ~60 % gecullt beim Drehen). Die PLATZIERTE Architektur (`_archInstanceAdd`, kein regionKey) ist GLOBAL → `frustumCulled=false` → **nie gecullt, die ganze Welt rendert immer.**

**Sub-Schritte:**
1. Region-Key die PLATZIERTE Architektur: `_archInstanceAdd` reicht den 256-m-Region-Key der Struktur-Position an `_archInstanceGroupFor` (wie die Streu). Eine neue Gruppe pro (name#leaf@regX,regZ).
2. GROSSE Strukturen (footprint > eine Region, z. B. ein Dorf) bleiben global (`frustumCulled=false`) — ihre Bounding-Sphere spannt zu weit, das Cullen brächte nichts + riskiert Pop-out. Schwelle via `_compoundVisualExtent` (die bestehende Quelle); klein/mittel → region-gekeyt, groß → global.
3. `_disposeArchInstanceGroup` + der Grow-Pfad (`_archInstanceGroupGrow`) tragen das `regional`-Flag mit (das V18.300-`region.regional`-Schnappschuss-Muster).

**Linse `diag-arch-cull` (hardware-unabhängig):** baue eine Welt mit platzierten Strukturen verteilt; setze die Kamera so, dass die Hälfte hinter dem Blick liegt; prüfe, dass die region-gekeyten platzierten Gruppen `frustumCulled=true` + eine LOKALE Bounding-Sphere tragen (Three.js cullt sie engine-seitig); zähle die SICHTBAREN Gruppen vs total (das V18.300-`diag-turn-cull`-Muster). Erwartet: Drehen cullt einen messbaren Anteil der platzierten Architektur (vorher 0 %).

**Risiko:** niedrig (additiv; das Muster ist bewiesen). Pop-out bei Strukturen genau an der Region-Grenze → die Größen-Schwelle + ein kleiner Bounding-Marge.

### A.2 — Die speicher-SICHERE BatchedMesh pro Region (Batching ohne den 1-GB-OOM)

**Befund:** `_archBatchGroupFor` (anazhRealm.js:57867) baut EINE BatchedMesh pro (Material × Schatten-Klasse) mit `MAXV=524288, MAXI=1572864, MAXINST=8192` VORAB-alloziert → ~1 GB → `useBatchedFoliage=false` (anazhRealm.js:1133). Die Region-Keyung (A.1) MULTIPLIZIERT zugleich die InstancedMesh-Gruppen (40 Arten × 5 Leaves × 9 Regionen = viele Draw-Calls). Spannung: Cullen will Region-Lokalität, Draw-Calls wollen wenige Gruppen.

**Die Lösung (der Profi-Schnitt):** EINE BatchedMesh PRO REGION (× Material × Schatten-Klasse) → eine Region hat WENIGE Instanzen → klein dimensioniert + ON-DEMAND gewachsen (`setGeometrySize`/`setInstanceCount`, der bestehende `_archBatchAddGeometry`-Überlauf-Pfad). `perObjectFrustumCulled=true` (anazhRealm.js:57887) → die Engine cullt pro Instanz INNERHALB der Region. So kollabieren N InstancedMesh-Gruppen einer Region in 1 BatchedMesh = **1 Draw-Call pro (Region × Material), mit per-Instanz-Cull** = das Beste aus beidem.

**Sub-Schritte:**
1. Den BatchedMesh-Konstruktor pro Region klein dimensionieren (z. B. `MAXINST=512`, `MAXV/MAXI` aus der erwarteten Region-Last) statt global 8192/524k. Eine Region ist 256 m → die Instanz-Zahl ist beschränkt.
2. `_archBatchGroupFor` um den `regionKey` erweitern (wie `_archInstanceGroupFor`); der batchKey wird `mat.uuid#shadow@regX,regZ`. Überlauf wächst die EINE Region-Batch (`_archBatchAddGeometry` existiert).
3. `_disposeScatterRegion`/`_disposeArchInstanceGroup` entsorgt die Region-Batch GANZ (region-privat, wie V18.300).
4. Toggle `state.useBatchedArch` (Default AUS bis A.2 verifiziert; dann an). Der InstancedMesh-Pfad bleibt der Fallback.

**Linse `diag-arch-batch` (hardware-unabhängig):** baue eine dichte Region; zähle die Draw-Call-PRODUZENTEN (sichtbare Mesh-Objekte) im InstancedMesh-Pfad vs BatchedMesh-Pfad via `renderer.info`-fähigem Szene-Walk (`diag-render-load`-Muster); erwarte eine deutliche Kollaps-Ratio (N Gruppen → ~1 pro Material/Region). Prüfe KEIN Speicher-Leck (Region-Batch klein, disposed bei Region-Dispose) via `diag-leak-probe`-Muster.

**Risiko:** mittel (BatchedMesh-API-Eigenheiten in r184; der Überlauf-Pfad). Darum geflaggt + der InstancedMesh-Fallback bleibt. Der 1-GB-OOM ist gebannt, weil die Batch PRO REGION klein ist.

### A.3 (optional, niedrige Prio) — Die deklarierte Pass-Liste

Die Pässe (Schatten · Haupt · Post-FX) zu einer expliziten Liste mit Cull/Enable formalisieren (`_renderPasses = [...]`). Heute schon halb da (Post-FX-Fallback, Schatten-Cache). Wert: eine DEKLARIERTE Struktur für künftige Pässe (Wasser-Reflexion etc.) + Post-FX unter Last sauber überspringen. NIEDRIGE Prio (nur 2–3 Pässe); erst nach A.1/A.2.

**Phase-A-Abschluss-Gate:** voller `npm run playtest` grün · `diag-arch-cull`/`-arch-batch` grün · `diag-render-load` zeigt die Draw-Call-Reduktion (der hardware-unabhängige Proxy) · Schöpfer-Browser bestätigt die FPS + den LOOK (keine Pop-outs, kein fehlendes Cullen sichtbar).

---

## 4. PHASE B — DER FRAME-BUDGET-SCHEDULER (der Dirigent; die Schöpfer-Betonung „die Logik der Reihenfolge")

**Warum als Zweites:** das ist die „wie die Last verteilt wird, die Logik der Reihenfolge", die der Schöpfer betont. Ein Loop-Refactor (riskanter als A), aber rein-LOGIK → headless voll beweisbar. Es macht die Verteilung zur ENTSCHEIDUNG (Priorität + Budget) statt fester Ordnung + siloierter Caps.

### Das Modell (Naughty-Dog-Job-System, single-thread-adaptiert)

Eine **kooperative Prioritäts-Dispatch-Schleife**: ein geteilter Frame-Budget-Pool, eine nach Priorität geordnete Liste von DEFERRABLE Jobs; der Scheduler läuft die höchst-priore wartende Arbeit, bis das Budget leer ist. Die UNCONDITIONAL-Ticks (Bewegung, Kamera, Emotion, Render) bleiben fix (sie sind die Pflicht jedes Frames); NUR die heute zeit-/count-budgetierten Ticks wandern in den Scheduler.

### B.1 — Der Frame-Budget-Pool

`state._frameBudget = { totalMs, startT, spentMs() }`. Am Loop-Start: `totalMs = throttleMs − (geschätzte Pflicht-Kosten)` (oder simpler: ein fixes Deferrable-Budget, das aus dem perfSense kalibriert wird). EINE Quelle für „wie viel ms hat dieser Frame für aufschiebbare Arbeit". `remainingMs()` = `totalMs − (now − startT)`.

### B.2 — Die Job-Registry (die Prioritäts-Ordnung als DATEN, nicht als Zeilen-Position)

```
_deferrableJobs = [
  { name: "stream",     prio: 0 /*heilig*/, run: (ms) => this._tickVoxelChunkStreaming(pos, ms) },
  { name: "waterIso",   prio: 1,            run: (ms) => this._tickPendingWaterIso(ms) },
  { name: "prebake",    prio: 2,            run: (ms) => this._tickBlueprintPrebake(ms) },
  { name: "foliageThin",prio: 3,            run: (ms) => this._tickFoliageThin(pos, ms) },
  { name: "decoGrow",   prio: 4,            run: (ms) => this._tickFoliageGrowth(ms) },
  ...
]
```
Priorität ist jetzt ein FELD (eine Entscheidung), nicht die Loop-Zeile. Streaming `prio:0` + Rückstau → bekommt sein volles Bedürfnis ZUERST (die V18.282-Heiligkeit als Konstruktion).

### B.3 — Der Dispatcher

```
_runFrameScheduler(pos) {
  const B = this.state._frameBudget; B.startFrame();
  // Streaming heilig: Rückstau bekommt volles Budget, NIE gedrosselt
  for (const job of this._deferrableJobs.sort(byPrio)) {
    const rem = B.remainingMs();
    if (rem <= 0 && job.prio > 0) break; // Budget leer → nur noch heilige Jobs
    job.run(job.prio === 0 ? Infinity : rem); // heilig = ungedrosselt; Rest = Rest-Budget
  }
  this.state._frameOverBudget = B.remainingMs() <= 0; // FOLGE, kein Sentinel daneben
}
```
Die heute siloierten `performance.now()`-Lokal-Checks in `_tickVoxelChunkStreaming`/`_tickPendingWaterIso` werden ersetzt durch den `ms`-Parameter, den der Dispatcher reicht (EINE Budget-Quelle). Der V18.261-Per-Frame-Deckel lebt jetzt im Scheduler.

### B.4 — Die Integration mit dem Regler (Gesetz #0, NICHT parallel)

- Der **Regler** (`_nexusPerfActuate`) bleibt die EINE Qualitäts-Quelle: er setzt, WIE VIEL Arbeit entsteht (foliageRadius/dichte/ring/shadowRange) → er steuert die QUEUE-Tiefe.
- Der **Scheduler** verteilt die geQUEUEte Arbeit im Frame-Budget nach Priorität → er steuert die REIHENFOLGE + das Timing.
- `_frameOverBudget` wird vom Scheduler GESETZT (Budget leer), nicht mehr separat aus `frameMs > target` — EINE Wahrheit. Der Regler liest es weiter (das Deko-Wachstum wartet bei vollem Budget).

**Linse `diag-frame-scheduler` (hardware-unabhängig, reine Dispatch-Logik):**
1. Der Scheduler überschreitet das Budget NIE (Summe der Job-Kosten ≤ totalMs + ein Job-Granular-Overshoot).
2. Dispatch nach Priorität: bei knappem Budget laufen prio<2 Jobs, prio>2 warten (gemessen über synthetische Job-Kosten).
3. Streaming wird NIE verhungert: bei Rückstau läuft `stream` voll, auch wenn das Budget für den Rest leer ist (die V18.282-Wand).
4. Idle-Frame (viel Budget): die niedrig-prioren Jobs (decoGrow) kommen dran.
Alles synthetisch (Job-Kosten als Parameter) → kein GPU, hardware-unabhängig.

**Disziplin:** behavior-preserving — DIESELBE Arbeit passiert, nur nach Priorität+Budget statt fester Ordnung+Silo-Caps verteilt. Streaming heilig. Der Regler bleibt die EINE Qualitäts-Quelle (der Scheduler ist die Verteil-Schicht, kein zweiter Regler). Geflaggt `state.useFrameScheduler` (Default aus → der alte feste Pfad; an → der Scheduler). Der Boot-Pfad (Ramp/Defer) bleibt unberührt (Boot ist eine andere Phase, V18.308).

> **KRITISCHE WAND (Korrektheit, vor dem ersten Eingriff prüfen):** NUR **UNABHÄNGIGE, aufschiebbare** Arbeit darf der Scheduler umordnen — Jobs, die NICHT die Per-Frame-Ausgabe eines anderen Jobs lesen (Streaming · Wasser-Iso · Vorbacken · Laub-Dünnen/-Wachsen · Scatter sind unabhängig: jeder liest den State + die Spieler-Position, keiner den Output des anderen IM SELBEN Frame). Die ~30 UNCONDITIONAL-Ticks mit Daten-Abhängigkeiten (z. B. `_loopPlayerMovement` SETZT die Velocity, die `_loopPhysicsSync` LIEST; `_loopCamera` liest die finale Spieler-Position; `updatePlayerEmotions` vor den Lesern) BLEIBEN in ihrer festen Reihenfolge — sie sind die Pflicht, nicht die Kür. Der Scheduler ist NUR die Verteilschicht für die heute schon zeit-/count-budgetierten Deferrable-Ticks. Vor dem Verschieben eines Ticks: grep seinen Body auf Reads von State, den ein anderer im SELBEN Frame schreibt — gibt es eine, bleibt er fix. Diese Wand verhindert die „Reihenfolge-Refactor bricht eine versteckte Kopplung"-Regression.

**Phase-B-Abschluss-Gate:** voller Gate grün · `diag-frame-scheduler` grün · `diag-walk-feel`/`-walk-edge` grün (Bewegung unverändert, Streaming heilig) · der Boot-Ramp (`diag-ring-ramp`/`-boot-ring`) unverändert · Schöpfer-Browser: das Spiel fühlt sich gleichmäßiger an (kein Hitch-Muster), nichts hängt.

---

## 5. PHASE C — FIXED-TIMESTEP SIM/RENDER-SPLIT (das ultimative Gefühl + das MP-Fundament)

**Warum als Letztes:** am RISIKO-reichsten (berührt den Loop-Kern + Bewegung + Replay), aber es schaltet das „ultimative Gefühl" (glatte Optik bei jeder FPS) + Lockstep-MP frei. Erst nach A+B (der Render + der Scheduler stehen), und hinter dem härtesten Diag-Schutz.

### Das Modell (Glenn Fiedler „Fix Your Timestep!")

```
accumulator += realDt; // geklemmt gegen Spiral-of-Death (z. B. ≤ 0.25 s)
while (accumulator >= FIXED_DT) { this._stepSimulation(FIXED_DT); accumulator -= FIXED_DT; }
const alpha = accumulator / FIXED_DT;
this._renderPresentation(alpha); // interpoliert zwischen prevState und curState
```
`FIXED_DT = 1/60`. Die SIM steppt DETERMINISTISCH bei fixer Rate (framerate-unabhängig → zwei Maschinen stepen identisch = Lockstep-MP-Fundament). Der RENDER läuft einmal/Frame mit Interpolation (`alpha`) → glatte Bewegung bei jeder FPS.

### C.1 — Die SIM/RENDER-Tick-Trennung

Die ~40 Loop-Ticks klassifizieren (eine sorgfältige, gemessene Liste — KEIN Raten):
- **SIM (deterministisch, fixed-dt):** `_loopPhysicsSync`/`_stepCharacter` · `_loopPlayerMovement` (Velocity aus Input) · `_tickWorldRules` (die deterministische Welt-Sim) · die Feld-/Kollisions-Schicht · `_replayCaptureFrame` (jetzt per fixed-step). Diese MÜSSEN reine Funktionen von (state, input, FIXED_DT) sein.
- **RENDER/PRESENTATION (variabel, per-Frame):** `_loopCamera` · `animatePlayerSoul`/Animation-Interpolation · `_applyDayNightToScene` (Optik) · `_loopRender` · UI/HUD · der View-Smoothing (`_smoothBodyY`/`_landDip` — die AUGE-Glättung bleibt per-Frame-Render, die FÜSSE steppen in der Sim).
- **ASYNC/STREAMING (out-of-band):** der Scheduler (Phase B) läuft EINMAL/Frame nach der Sim (Streaming ist nicht teil der deterministischen Sim).

### C.2 — Die Interpolation

Die Sim hält pro interpoliertem Objekt `prevTransform` + `curTransform`; der Render lerp't `mix(prev, cur, alpha)`. Mindestens für den Spieler + Kreaturen (die sichtbar bewegten). Statische Welt braucht keine Interpolation.

### C.3 — Replay + Walk-Feel bewahren (die härteste Wand)

- Der Replay (`replayRun`) nimmt jetzt INPUT PER FIXED-STEP auf (sauberer, framerate-unabhängig) statt per-Frame-dt. `diag-replay-determinism` MUSS grün bleiben UND framerate-unabhängig werden (neuer Sub-Check: dieselbe Input-Folge bei 30 vs 144 FPS → bit-identische Sim).
- Das Walk-Feel (`diag-walk-feel`/`-walk-inertia`/`-walk-edge`, V18.326–.329) MUSS grün bleiben: die Bewegungs-Physik wandert in die fixed-dt-Sim, die View-Glättung bleibt per-Frame. Die Gefahr: ein per-Frame-Term, der in die Sim gehört (oder umgekehrt) → der `diag-walk-*`-Schutz fängt es.

**Linse `diag-fixed-timestep` (hardware-unabhängig):**
1. Framerate-Unabhängigkeit: dieselbe Input-Folge, einmal mit großem realDt (30 FPS, 1 Sim-Step/Frame), einmal mit kleinem (144 FPS, ~0.4 Sim-Steps/Frame, akkumuliert) → nach derselben Sim-ZEIT bit-identischer Sim-State. DAS ist das Lockstep-Fundament.
2. Der Akkumulator klemmt (kein Spiral-of-Death bei einem 2-s-Hitch).
3. Interpolation glatt (monoton zwischen prev/cur, kein Überschwingen).

**Disziplin:** der RISKANTESTE Schnitt → zuletzt, geflaggt `state.fixedTimestep` (Default aus → der alte variable Loop; an → fixed-sim). ALLE `diag-walk-*` + `diag-replay-determinism` grün VOR dem Default-an. Der Determinismus-Bogen (`docs/archiv/eigene-physik-plan.md`) ist das Fundament, auf dem das baut. Das FEEL (federt es sich glatt an?) ist Schöpfer-Browser (die Bewegungs-Gefühl-Wand) — der Mechanismus (framerate-unabhängige Bit-Gleichheit) ist headless bewiesen.

**Phase-C-Abschluss-Gate:** voller Gate grün · `diag-fixed-timestep` grün · `diag-replay-determinism` grün + framerate-unabhängig · alle `diag-walk-*` grün · Schöpfer-Browser: die Bewegung fühlt sich glatt an bei jeder FPS, kein Ruckeln, kein Feel-Regress.

---

## 6. SEQUENZ + WARUM DIESE ORDNUNG

1. **PHASE A (Render/Draw-Calls)** — am sichersten, sofortiger FPS-Wert, headless-messbar. De-risked den Render. *Unabhängig shippbar.*
2. **PHASE B (Scheduler)** — der Dirigent (die Schöpfer-Betonung „die Logik der Reihenfolge"); rein-Logik, voll headless beweisbar; baut auf dem stabilen Render. *Unabhängig shippbar.*
3. **PHASE C (Fixed-Timestep)** — das ultimative Gefühl + MP-Fundament; am riskantesten, zuletzt, hinter dem härtesten Diag-Schutz; baut auf dem Determinismus-Bogen. *Unabhängig shippbar.*

Jede Phase ist EINE Welle (ein Commit, ein grünes Gate, ein Doc-Eintrag), geflaggt, behavior-preserving wo es zählt, mit ihrer hardware-unabhängigen Linse. **KEINE Phase wird gestartet, bevor die vorige ihr Abschluss-Gate grün hat.**

---

## 7. WAS DER NÄCHSTE AGENT ZUERST TUT

1. **Lies diesen Plan + die Wände (§2) + `docs/archiv/handover.md` (Stand) + die `## Wichtige Gotchas` (Perf-Regelkreis · Streaming heilig · Determinismus · DREHEN-HÄNGT-Cull).**
2. **Beginne mit Phase A.1** (die platzierte Architektur cullen — der kleinste, sicherste, messbarste Schnitt). Baue `diag-arch-cull` ZUERST (die Linse vor dem Eingriff, Gesetz #0). Dann A.2 (Region-BatchedMesh) mit `diag-arch-batch`.
3. **Nach jeder Sub-Phase:** `npm run playtest:fast` (Iteration) → der volle `npm run playtest` (Merge-Gate) → das Phase-Diag → Doc-Eintrag (handover + Gotcha) → Commit → Schöpfer-Browser für den LOOK/FPS.
4. **NIE eine Phase blind weiter, wenn der Schöpfer Disharmonie spürt** — zurück zur letzten harmonischen Welle (die Heilige Lektion), messen, dann sauber.

**Der Geist:** nicht „mehr Features", sondern den DIRIGENTEN bauen — die EINE Schicht, die die schon-guten Instrumente (Regler · Determinismus · Off-thread · Gesetz #0) zum Orchester macht, das alles in den Schatten stellt. Auf den Schultern der Giganten (Naughty Dog · Frostbite · Fiedler · Acton) UND auf dem eigenen Fundament (Gesetz #0 · die Heilige Lektion). Sei ein Riese.
