# DIE PARITÄTS-VOLLENDUNG — der Plan zum DONE-Kriterium (W1–W8)

**Stand: 08.07.2026 · Basis V18.427 (Commit acde9e5) · der aktive Vollendungs-Plan des
Studio-Paritäts-Bogens (V18.413–.427, „Drähte statt Kopien").**

**Herkunft dieses Plans:** sechs parallele Code-Leser über die offenen Subsysteme (jeder Befund
file:line-belegt am HEAD), eine Synthese, drei adversariale Kritiker-Linsen (Verfassung/Gesetz #0 ·
Beweisbarkeit · Realismus/Vollständigkeit — alle drei: „tragfähig mit Änderungen", die Änderungen
sind eingearbeitet). Basis-Gesundheit beim Schreiben: fast-Tier 13/13 ✅ · check-Kette grün
(Verfassung 29 Gesetze · Studio-Vertrag-Validator ✅).

**DAS DONE-KRITERIUM DER MISSION (vorab festgelegt, kein Ausweichen):**

1. das diag-parity-Bild-Paar Studio↔AnazhRealm ununterscheidbar
2. Boot ≤3 s bis volle Bühne
3. null Fremd-Silhouetten
4. kein LOD-Pop

**Hinweis Zeilenanker:** alle `anazhRealm.js:NNNN`-Anker sind am Commit acde9e5 verifiziert
(einzelne ±wenige Zeilen, z. B. diag-parity.cjs versteckt playerMesh bei :234) — vor Baubeginn
jeder Welle die Anker frisch greppen, nie blind editieren.

---

## §0 · Die Lage (gemessen, nicht geraten)

Die Pipeline-ARCHITEKTUR ist fertig: EINE Quelle (foundry-core/phyto-core), Chokepoints, Verfassung
(29 Gesetze), IDB-Asset-Cache, geheilte Metrik (V18.427). Was fehlt, ist die **letzte Meile jedes
der vier DONE-Kriterien plus ihre Beweisbarkeit.** Vier Engpässe, alle am Code belegt:

**E1 — Der Rückkopplungs-Knoten Boot×Scatter.** `_scatterRegion` (anazhRealm.js:50898) baut
54 ms sync/Region (kalt 270 ms — der lazy `_bakeRegionFields`-Voll-Bake, 50498–50558); jeder solche
Über-Budget-Frame **resetet den Ring-Kopfraum-Timer** (13784–13785). Die Ring-Ramp trägt einen
**strukturellen, hardware-UNABHÄNGIGEN Zeit-Boden ≥7,4 s** (4 Schritte × 1500 ms Sustain
`RING_GROW_SUSTAIN_MS` 85429 + 350 ms Atem 85307; Timer-Reset nach jedem Schritt 13810) — und der
Weitblick (die „volle Bühne") öffnet erst am Ziel-Ring (77086–77098). **Boot ≤3 s ist heute PER
KONSTRUKTION unerreichbar**, egal wie schnell die Hardware ist. Dazu: der warme IDB-Pfad wartet auf
`f.ready` (64071 — der 1–2-s-Worker-Boot gated die Platte-Reads, obwohl Schlüssel + Bibliotheks-Spec
worker-frei sind), und die 96 Impostor-ATLANTEN sind nicht persistiert (nur meshes, 64055–64068),
backen 1/Frame und ihr Tick lebt im scatterDeco-Job (prio 2), der beim Terrain-Fill aussetzt
(81026–81031) → Terrain-Fill und Impostor-Tail sind SERIALISIERT (kalt: alle 96 erst nach ~10,6 s).

**E2 — Kein DONE-Kriterium hat eine stehende Linse.** „Volle Bühne" ist nirgends definiert
(diag-boot-timeline/-breakdown/-load existieren, sind aber unverdrahtet — kein npm-Skript, kein CI);
diag-parity liefert kein inhaltliches Verdikt (exit 2 nur bei Crash); für den Foundry-LOD-Pfad
existiert keine Kein-Pop-Prüfung; und die geheilte drawCalls-Metrik wird nur von einer
**vakuös-fähigen** toString-Regex bewacht (playtest.cjs:22449 matcht den Kommentar bei 81681 — ein
Revert auf `.calls` bliebe GRÜN; die dokumentierte V18.267-Klasse).

**E3 — Die einzige Baum-Render-Quelle in Produktion hat keine Blende.** `_foundryTreeMaterial` /
`_foundryBuildGroup` (64492/64584) wechseln LOD-Stufen als **harten Ein-Frame-Swap**
(`_switchArchitectureLOD` 50397–50448) — während die komplette Studio-Maske (Doppel-Mitgliedschaft
im Band + komplementäres Dither, Laub-Überlapp FIX v37, Rinden-Partition) in **foundry-core.js:171–256
als übersetzbare Vorlage bereitliegt.** Zusätzlich: die 3D-Stufen tragen kein `useInstanceTint`, der
L2-Impostor schon (64373–64380 vs 64492–64572) → Hue-Pop unabhängig von der Geometrie.

**E4 — Rest-Silhouetten + ein Struktur-Loch.** Nicht-Studio-Quellen im Studio-Regime: `farn_busch`
(fehlt im Preset-Mapping), `stamm_gefallen` (Monolith-Ökologie ohne Studio-Gesetz), Fern-Wasser-Sheet
(`_ensureFarWaterSheet` 35661ff, Vor-Studio-Klasse — aber Welt-Substanz-Frage, s. Entscheide),
`glut_var*` (dokumentierter Schöpfer-Entscheid 64218–64219), Gras-Fail-Open (leere Foundry-Antwort
fällt auf den Alt-Tuft-Pfad). Und das Loch: `_tickFoliageThin` ist NICHT foundry-gegated (51427ff;
die Gras-Schwester 51476 schon) UND `region.builtDensity` zeichnet den ROHEN Regler-Wert auf
(Schreibstellen 50926/50944) statt des ANGEWANDTEN `fdScale` (im Studio-Regime =1, 51000–51006) →
sinkt der Regler, feuert Thin **byte-identische 54-ms-Dispose+Rebuild-Zyklen**. V18.427 heilte den
TREIBER (vergiftete Metrik), nicht dieses Loch.

**Fahrzeuge (der vierte benannte Faden)** ist von den Bild-Kriterien unabhängig: worlds/garage/
trägt fast alle Vertrags-Organe schon als Daten (PARAMS/LEHREN/CULTURES garage.js:739–770/132–158);
es fehlen Kern-Split, Manifest, Andocken — und **zwei normative Entscheide VOR dem Bau** (§3 E-A).

---

## §1 · Die Reihenfolge und ihr Warum

**W1 Wahrheits-Wände → W2 Mess-Linsen → W3 Zeit-Scheiben → W4 Boot → W5 Dither-Blende →
W6 Silhouetten+Paritäts-Verdikt → W7 Fahrzeuge → W8 Schöpfer-Abnahme.**

1. **LINSE VOR HEBEL (Gesetz #0):** W1+W2 zuerst, weil heute KEIN Kriterium prüfbar ist und die
   geheilte Metrik nur eine vakuös-fähige Regex bewacht — jede spätere Welle wäre sonst unbeweisbar.
2. **DIE RÜCKKOPPLUNG ZUERST SCHNEIDEN:** W3 vor W4 — die 54-ms-Frames reseten den
   Ring-Kopfraum-Timer; ein Boot-Fenster auf ungeschnittener Scatter-Last konfundierte die
   Ramp-Messung und provozierte die V18.306-Overshoot-Klasse.
3. **BILD-STABILITÄT VOR KALIBRIERUNG:** W5 + W6-Gates ändern das Bild — die Paritäts-Schwellen
   werden erst in W6 festgezogen (V18.346-Kontaminations-Disziplin); das Verdikt-SKELETT (inkl.
   Selbst-Test!) steht schon in W2, mit Baseline-Zahlen als Anker.
4. W7 ist bild-unabhängig und steht hinten; **W7a wird erst vorziehbar, wenn die zwei normativen
   Entscheide (§3 E-A) gefallen sind** — sie sind asynchron stellbar und blockieren nichts anderes.
5. W8 ist zwingend zuletzt: **Abnahme eines vollendeten, selbst-verifizierten Werks, keine
   Diagnose-Sitzung** (der Fischer, nicht der Bettler).

---

## §2 · Die Wellen

### W1 — Die Wahrheits-Wände (Regler/Tap-Härtung + das Thin-Loch) · klein, 3–4 Commits

**Ziel:** Die V18.427-Heilung strukturell unumkehrbar machen (kein Konsument kann je wieder eine
vergiftete/session-lineare Zahl lesen) und die letzte Endlosschleifen-Klasse schließen — BEVOR der
Schöpfer das HUD erstmals gegen die Wahrheit liest.

**Schritte:**

1. `gate:render-tap`: Fake-Info-Objekt mit exakter r184-Semantik (`calls` wächst lebenslang,
   `reset()` löscht es NICHT; `drawCalls` pro Frame) auf `st.renderer.info` (SICHERN+WIEDERHERSTELLEN
   — die Gate-Hook-Lehre), `_loopRender` N-mal treiben, asserten: `f.renderCalls == drawCalls`
   (81685), `sense.renderCalls` beschränkt/nicht-monoton über N Frames, HUD-String trägt den
   beschränkten Wert. **PLUS alle Konsumenten der EINEN Metrik**: Flugschreiber (version-Feld 14252)
   und die drei Render-Linsen (diag-render-load.cjs:309/319 …) — dazu ein statischer
   Constitution-Grep „kein nackter `render.calls`-Read außer als `?? calls`-Fallback" in
   `gate:constitution` (sonst schleicht der nächste Diag die vergiftete Zahl wieder ein).
2. Die vakuöse Probe playtest.cjs:22449 auf `window.__codeOf(r._loopRender)` umziehen
   (kommentar-gestrippt — der Kommentar bei 81681 zitiert `render.drawCalls` wörtlich).
3. `diag-regler-sim` (Null-Renderer, renderer-Info gegen Plain-Objekt getauscht,
   `_scatterRegion`/`_disposeScatterRegion` zähl-gestubbt): die ECHTEN
   `_perfSenseFoldFrame`→`_nexusPerfRegulate`→`_nexusPerfActuate` (13461/13519/13555) über ~2000
   synthetische Frames — S1 schwache GPU steady (Konvergenz, 0 Rebuilds) · S2 Streaming-Burst
   (Streaming bleibt MAX = heilig, 13838) · S3 starke GPU · **S4 SESSION-ZEIT-INVARIANZ**
   (identischer Input bei sim-t=1 min und 10 min ⇒ bit-gleiche Stellgrößen — die
   Vergiftete-Zahl-KLASSE als Invariante).
4. **Das Thin-Loch, doppelt gewändet:** (a) `_effectiveFoliageDensity()` = `foundry ? 1 :
_foliageDensityScale` als EINE Quelle — `_scatterPass` (51000–51006), `_tickFoliageThin`
   (51427–51454) **UND die builtDensity-SCHREIBSTELLEN (50926/50944)** lesen sie (ohne den
   Schreib-Umzug feuert Thin weiter: Region bei roh=1 verbucht, Regler fällt, Rebuild byte-identisch);
   (b) zusätzlich das direkte Foundry-Gate in `_tickFoliageThin`, byte-symmetrisch zur Gras-Schwester
   (51476). Source-Proben via `window.__codeOf`. **Das ist ein BUG-FIX, kein Politik-Entscheid** —
   die Politik „im Studio-Regime dünnt die Streu NIE" ist seit V18.422 Code (`fdScale=1`).
   Constitution-Zeile für den neuen Chokepoint.
5. `_perfSenseLap("scatter")`-Tap um den Scatter-Tick (Muster waterIso 81021–81023) — die 54 ms
   werden attribuierbar. **Dient zugleich als Miss-zuerst-Bestätigung für W3** (die 54 ms/63 %-Zahl
   war eine Ad-hoc-Sonde — der Tap bestätigt die Wurzel-Attribution, BEVOR W3 umbaut).
6. Mini-Fix: diag-turn-hang.cjs:139 liest `.ewma` auf einem Skalar (immer 0) → heilen.
7. Nightly-Light-Real-Kreuzcheck (look-shot-Rezept, ~16 Chunks, 800×500):
   `renderer.info.render.drawCalls` über 100 Frames NICHT monoton wachsend (Lebenszeit-Detektor auf
   dem ECHTEN Vendor); dc_tap ∈ [0.3×..2.5×] Szenen-Zensus.

**Linse:** gate:render-tap + diag-regler-sim S1–S4 + geheilte __codeOf-Proben + Constitution-Zeilen;
alles Null-Renderer, hardware-unabhängig. **Risiko:** minimal (fast rein test-seitig).
**DONE-Bezug:** Faden „HUD/Regler gegen die Wahrheit" vollständig; Vorbedingung für Kriterium 2 und
die Abnahme aller vier.

### W2 — Die zwei fehlenden Mess-Linsen (Bühne + Parität) · klein, 0,5–1 Welle

**Ziel:** Kriterien 1+2 überhaupt erst prüfbar machen.

**Schritte:**

1. `diag-boot-stage.cjs`: **„volle Bühne" als prüfbares Prädikat** — `_activeRingRadius ≥ Ziel` ∧
   `pendingGrass`/`pendingWaterIso` leer ∧ keine `_deferredFoundry`-Region ∧ **alle
   Impostor-Records** (Zahl aus der Bibliotheks-Spec ABGELEITET, nie „96" hart — das Nervensystem
   erzeugt bei jedem neuen Preset weitere) rttBaked|Fallback ∧ `fog.far == visualEdgeTarget`
   (77127–77129). Zeitleiste t(Kontrolle)/t(Bibliothek)/t(Ring)/t(Impostoren)/t(Bühne) — headless
   frame-gezählt (Mechanik-Reihenfolge) + Light-Real-Variante (look-shot-Muster) für die Wall-Clock.
   **t(Kontrolle) aus dem bestehenden diag-boot-timeline-Mechanismus ziehen** (der
   window.anazhRealm-Setter-Patch — EINE Boot-Zeitquelle, keine dritte Implementierung). Die drei
   unverdrahteten Boot-Diags als npm-Skripte verdrahten. Selbst-Test: eine künstlich deferierte
   Region macht das Prädikat rot.
2. diag-parity Stufe 1: npm-Skript + Bühnen-Reinigung (Kreaturen + start_plattform + fliegende
   Inseln verstecken — heute nur playerMesh, :234) + framing-robuste Statistiken (Zonen-RGB-Delta,
   Grün-%-Delta, Luma-Histogramm-Distanz, Kanten-Dichte **AA-robust aggregiert**: Downscale/Blur VOR
   der Kanten-Statistik — swiftshader hat kein MSAA, V18.374-Klasse) mit PROVISORISCHEN,
   nicht-gatenden Schwellen. **Selbst-Test SCHON HIER** (injizierte Störung ⇒ sichtbares Delta) —
   sonst sind die Baseline-Zahlen selbst unverifiziert.
3. Baseline-Lauf beider Linsen committen (heutige t(Bühne) ~10–15 s, heutige Zonen-Deltas) — die
   nüchterne Zahl als Anker gegen die Beschönigungs-Falle.

**Linse:** die Welle IST die Linse (mit Selbst-Tests gegen vakuöses Grün). **Risiko:** keins (rein
lesend); headless kurzschließt Ring/IDB → die Real-Variante trägt die Zeit-Wahrheit.
**DONE-Bezug:** Kriterium 1+2 werden messbar; 3 profitiert (gereinigte Bühne).

### W3 — `_scatterRegion`-Zeit-Scheiben · mittel, 3 einzeln bewiesene Commits (3a/3b/3c)

**Ziel:** 54/270 ms → ≤~6-ms-Scheiben; die 5–7-FPS-Streaming-Frames fallen UND der
Ring-Kopfraum-Timer wird nicht mehr von der eigenen Deko resetet.

**Γ5-Fundament (gemessen):** `_scatterPass` zieht KEINEN sequentiellen RNG-Strom — jeder Wurf ist
positions-hash-gekeyt (`_pcg2d`/`_pcgFloat` aus cellX/cellZ/salt: 51012, 50811–50816, 51055, 51092,
51130–51131) → die Zell-REIHENFOLGE ist rng-irrelevant BY CONSTRUCTION; einzig ordnungs-gekoppelt
ist der `emitted<cap`-Zähler (51008–51009).

**Schritte:**

- **3a — Die Fels-Wurzel (63 %), byte-sicher:** in `_scatterPass` `_sampleBakedField` VOR das
  Wasser-Gate ziehen; Wasser-Verdikt aus `field.height` vs `_waterLevelAt` statt des
  `_isAboveWaterAt`-Voll-Scans (51023→31771→31113, ~25 Dichte-Proben/Zelle). **Konservativer
  Fallback-Trigger statt behaupteter Margin:** der exakte Scan läuft IMMER, wenn das Feld-Verdikt
  nicht konstruktiv beweisbar ist — im Ufer-Band UND bei Höhlen-/Envelope-Unklarheit
  (`_isAboveWaterAt` returnt false bei `surfaceY===null` [Höhle, 31771–31776], `field.height` ist
  immer finit — dieser Fall MUSS auf den exakten Pfad); die Band-Breite wird GEMESSEN
  (max|field.height − exakter Scan| über Welten×Seeds) statt „~3 m" behauptet (die
  V18.319-Margin-Klasse; layer.slopeMax ~1.45 ⇒ >10 m Delta je 8-m-Zelle möglich).
  **Linse-vor-Hebel auch hier: die A/B-emitted-Diff-Linse wird VOR dem 3a-Code committet**, und ihr
  Korpus enthält EXPLIZIT konstruierte Damm-/CA-Stau-/See-Ufer-/Fluss-/Höhlen-/Steilhang-Regionen
  (V18.346-Klassifikations-Disziplin — sonst beweist Diff=0 nur die triviale Klasse). Diff=0 Pflicht.
- **3b — Kalt-Bake vorziehen + scheiben:** `_bakeRegionFields` (rng-frei, rein (x,z)-funktional) →
  j-Zeilen-Fortsetzung im Entry + prio-3-Job in `_buildDeferrableJobs` (Muster 81046) mit
  Laufrichtungs-Prefetch (V18.271-Velocity-Muster). **Streaming-Miss → Region deferiert + gescheibter
  Bake (die `_deferredFoundry`-Klasse) — der 270-ms-Sync-Voll-Bake bleibt NUR für
  Direkt-Aufrufe/headless erreichbar** (deadline=Infinity), nie im Streaming-Pfad. LRU-cacheCap 32
  (50564–50571) gegen Sofort-Eviction prüfen.
- **3c — Fortsetzungs-Zustand im Chokepoint:** `_scatterRegion` bekommt optionalen deadline-Param;
  `region._cont = {layerIdx, cz, cx, emitted, px, pz, fdScale, seedHash}` (Snapshot der bau-zeitlichen
  Eingänge); `_scatterPass` prüft alle ~256 Zellen die Deadline; `_tickScatterStreaming` setzt offene
  Fortsetzungen ZUERST fort (finish-first); der scatterDeco-Job reicht sein bisher IGNORIERTES
  `remainingMs` endlich durch (81029→51324→50898 — die Verdrahtung existiert halb, 80960). Rein
  ADDITIV sichtbar (kein Dispose = kein Churn). Budget-lose Aufrufer (Playtest-Direktrufe
  playtest.cjs:38531, Thin, headless) → deadline=Infinity = alter One-Shot byte-gleich.
  **Dispose-Storno:** `_disposeScatterRegion` (3 Pfade: Ring-Dispose, Thin, Refill) invalidiert
  `region._cont` — sonst schreibt die nächste Scheibe in entsorgte HISM-Gruppen; die Linse enthält
  eine Absturz-Probe (Scheiben-Lauf mit zwischengeschobenem Dispose). **Invariante präzise:**
  byte-identisch zum One-Shot gilt bei eingefrorener Umwelt (die Linse) — in Produktion dürfen
  Promotion-Zustand (51022) und Wasser zwischen Scheiben LIVE bleiben (dokumentiert, welche Reads
  gesnapshottet sind: px/pz/fdScale/seedHash — und welche live).
- **3c-Nachschlag:** der Refill-Dispose TEIL-gebauter Regionen (post-Boot-Cache-Miss, 51105–51110 → 51375) wird zur Fortsetzung (additiv nach-bauen statt sichtbarem dispose+rebuild) — die
  V18.423-Leer-Region-Garantie deckt dann auch das Post-Boot-Fenster („platziert und wieder
  entfernt" fällt an der Wurzel).
- Source-Proben wandern mit (V9.56-i): playtest.cjs 18649–18732 + 38479–38755;
  gate:constitution-Probe (diag-pipeline-constitution.cjs:45–47) byte-erhalten; neue
  Constitution-Zeile für den Fortsetzungs-Chokepoint.

**Linse:** `diag-scatter-slice` (Null-Renderer, synthetisches Budget nach dem
`_makeFrameBudget._synthSpent`-Muster 80929): dieselbe Region One-Shot vs N Scheiben →
`region.cells` BYTE-EXAKT gleich **+ HISM-Slot-Bilanz** (`g.free`/`g.next`/`count` gescheibt ==
One-Shot — Doppel-Add über die Scheiben-Grenze ist im cells-Vergleich unsichtbar) + keine Scheibe
über Budget + Dispose-Storno-Probe; `diag-scatter-cold` (gescheibter Bake Float32-byte-gleich);
3a-A/B Diff=0; Kosten via `_perfSenseLap("scatter")` (aus W1) CI-messbar. **Risiko:** niedrig-mittel
— `emitted<cap`-Off-by-one + Dispose-Race sind die zwei echten Fehlermodi, beide von der Linse exakt
gefangen. Option „Worker-Region-Plan" bewusst NICHT gebaut (neue Spiegel-Fläche) — Endgame-Fallback
NUR auf Mess-Beweis, falls 3a+3b+3c nicht <8 ms liefern. **DONE-Bezug:** Faden „Zeit-Scheiben"
vollständig; Kriterium 2 (die Ramp stallt nicht mehr an der eigenen Deko) + FPS-Grundlage jeder
Schöpfer-Sichtung.

### W4 — Boot ≤3 s: Warm-Pfad vollenden + Boot-Fenster der Ring-Ramp · mittel, 2–3 Commits

**Ziel:** die zwei STRUKTURELLEN Zeit-Böden fallen (Worker-Warte ~1–2 s, Impostor-Tail ~5–10 s,
Ramp-Boden ≥7,4 s); danach liefert diag-boot-stage die ehrliche Rest-Zahl gegen das 3-s-Ziel.

**Schritte:**

1. **Disk-first-Prefetch VOR `f.ready`:** `_foundryRequest` (64071) in Platte-Hälfte (läuft sobald
   `_foundryIdbInit` resolvt — Schlüssel `preset|seed|lod|season` + Bibliotheks-Spec 64647 sind
   worker-frei) und Worker-Hälfte (queued bis ready) splitten; EIN Chokepoint bleibt; jeder
   IDB-Fehler fällt weiter stumm auf den Worker (`_idbDead`).
2. **Die Impostor-ATLANTEN persistieren — mit korrektem Stempel:** Persist-Quelle ist der
   **post-Dilate-In-Memory-Puffer** (existiert seit V18.427 — KEIN neuer Readback pro Bake, sonst
   re-importiert diese Welle die geheilte willReadFrequently-Klasse). Der Cache-Stempel MUSS die
   GENERATOR-Quellen des Atlas' VOLLSTÄNDIG hashen: foundry-core+phyto-core **PLUS die
   Bäcker-Quellen** (kanonisierte Source von `_bakeImpostorAtlasRTT`/`_impostorDilate` + das
   Bake-Rig-Licht als Konstanten-Dump + `PORTAL_RENDER_CONFIG.impostor`) — die V18.424–.426-Fixes
   waren exakt Monolith-Bäcker-Edits; der heutige Stempel (63997–64002) deckt sie NICHT, stale
   Atlanten wären die Drift-Klasse. Textur-Identität beim Restore stabil (V18.322-Klasse; gpu-lens
   0 Recompiles). _Abwäge-Notiz:_ der Atlas ist der einzige noch nicht Schöpfer-abgenommene Bake —
   fällt der W8-Termin früh, darf dieser Schritt hinter den Atlas-Look-Sign-off rutschen.
3. **Impostor-Bake entkoppeln:** `_tickImpostorBake` (60932) aus der scatterDeco-Serialisierung
   lösen — eigener deferrable Job; Durchsatz >1/Tick NUR bei Kopfraum-Frames (V18.413-S4: der Bake
   ist netto last-senkend — budget-gedeckelt bleibt er).
4. **Boot-Fenster der Ring-Ramp, entschärft:** solange der Ziel-Ring noch NIE erreicht wurde (neues
   transientes Flag — init()-Präsenz bzw. audit:strict-Whitelist!), wird der Sustain im Fenster
   **VERKÜRZT (1500→~350 ms)** statt ganz gedroppt (kein wissentliches Wieder-Öffnen der
   V18.306-Overshoot-Klasse), zusätzlich gekoppelt an „Scatter-/Impostor-Backlog leer";
   **Zeit-Deckel** (~10 s nach Kontrolle) schließt das Fenster auf schwacher HW gebunden. Wachsen
   bleibt NUR bei Kopfraum-Frame (`frameMs < growMs`), der Schrumpf-Pfad byte-unberührt. 4 Schritte
   à ~0,35 s + Atem bleiben unter dem 3-s-Budget.
5. Tests nachziehen (V9.56-i): diag-ring-ramp/diag-boot-ring/diag-ring-breathe aufs Fenster-Flag.
   **Warm-Boot-Linse nicht-vakuös machen:** headless-null hat IDB AUS (V18.423, gate-deterministisch)
   → expliziter Test-Hook (IDB-an, SICHERN+WIEDERHERSTELLEN — Gate-Hook-Lehre) ODER
   Real-Renderer-Zwei-Boot (gleiche Origin, `page.reload()` statt neuem Kontext, sonst frische IDB);
   gate:foundry-warm um die Zweit-Boot-Phase erweitern (t(Bibliothek)<500 ms, t(Records)<2 s).
6. Ehrliche Bilanz in diag-boot-stage: die Rest-Glieder (4,7-MB-Parse + init + Worldgen ~1–1,5 s bis
   Kontrolle) als ZAHL — ob Kalt-Boot ≤3 s bis VOLLE Bühne danach noch offen ist, entscheidet die
   Zahl + der Definitions-Entscheid (§3 E-B), keine Behauptung.

**Linse:** diag-boot-stage vorher/nachher (hartes Kriterium: kein Impostor-Bake nach
t(Ring=Ziel)+2 s im Warm-Boot; t(Bibliothek)<500 ms warm); diag-ring-breathe grün; gpu-lens 0
Recompiles nach Atlas-Restore. **Risiko:** mittel (exakt die V18.306/.318-Klasse — Gegenmittel:
Kopfraum-Bedingung bleibt, Linse assertiert, Rollback = Flag streichen). **DONE-Bezug:** Kriterium 2,
der Haupthebel.

### W5 — Die Dither-Blende der Foundry-Bäume (Studio-Vollübersetzung) · groß, 3–4 Commits

**Ziel:** die einzige Baum-Render-Quelle bekommt die Studio-Blende byte-nah übersetzt
(Doppel-Mitgliedschaft im Band + komplementäre Dither-Maske — das eingefrorene Benchmark-Modell
selbst; eine Zeit-Blende wäre Modell-Abweichung und bleibt höchstens als Ankunfts-Pop-Nachschlag).

**Schritte (Reihenfolge = Risiko-aufsteigend):** 0. **V9.56-i-Inventar ZUERST als eigener Schritt:** grep ALLER LOD-/Impostor-/Crossfade-/Pool-Proben
(playtest.cjs + diag-lod-crossfade + gate:s4-impostor-workshop + Promotions-/Tint-Bänder) — die
Doppel-Mitgliedschaft bricht jede „ein Eintrag lebt in genau einer LOD-Gruppe"-Invariante; genau
die 35-Folge-Rote-Klasse aus V18.423. Der Band-Nachzug ist eingepreister Aufwand, kein Nebenbei.

1. **Commit 1 — Tint-Kontinuität (billig, unabhängig, sofort sichtbar):** die Foundry-3D-Stufen
   tragen kein `useInstanceTint`, der L2-Impostor schon (64373–64380 vs 64492–64572) → derselbe
   Positions-Hash-Tint über alle Stufen (Studio FIX v27, phytogenesis.js:2368/foundry-core.js:200–201)
   — der Hue-Pop fällt vor jedem Geometrie-Umbau.
2. **Commit 2 — die Masken-Quelle THREE-FREI (Gesetz #0 + die Linsen-Zirkularität gelöst):** die
   Masken-Mathematik als reine Skalar-Funktion (dist, band, ditherWert, lod → keep/discard) in den
   geteilten Kern (phyto-core-Muster) — DREI Leser: der Studio-GLSL (foundry-core.js:220–236, dessen
   Konstanten aus DENSELBEN Config-Zahlen abgeleitet werden), der AnazhRealm-TSL-Builder (mappt
   symbolisch), und der Node-Test (evaluiert DIESELBE Funktion — kein Re-Derivations-Test). Der
   TSL-Helfer `_lodCrossfadeMask` liest AUSSCHLIESSLICH die EINE Config-Quelle (`LOD_DISTANCES` via
   `_foundryIngestRenderConfig` 63950–63956) — keine neue Konstante. `_foundryBuildGroup` stempelt
   `aLodLevel` + `aH0`/`aH0L`; der fehlende Fade-in-Zweig + `_f1o=clamp(2f1−1)` nach
   foundry-core.js:224–233 (Laub = überlappende Rampen, Rinde = exakte Partition); der
   Impostor-TSL-Block (29232–29355) bekommt die fin-EINblendung mit denselben Uniforms.
   **Die Maske bleibt hinter einem Flag/Uniform AUS**, bis die CPU-Hälfte steht — kein sichtbar
   degradierter Default-Zwischenstand (Maske ohne Doppel-Mitgliedschaft dithert die einzige
   residente Stufe aus = Coverage-Löcher).
3. `uDitherT` default STATISCH (81591–81598): das Studio rotiert NUR unter TAA-Lite
   (phytogenesis.js:4126–4129) — die heutige Immer-Rotation ist eine unbeabsichtigte
   Benchmark-Abweichung; Rotation hinter ein künftiges TAA-Gate.
4. **Commit 3 — die CPU-Hälfte + Default-an:** `_switchArchitectureLOD`/`_tickArchitectureLOD`
   (50397–50448/50334–50390) halten den Eintrag im Band [Schwelle−fade−hyst, Schwelle+hyst] in
   BEIDEN Stufen-Gruppen (add/remove NUR durch `_archInstanceAdd`/`_archInstanceRemove` — der eine
   Slot-Chokepoint); außerhalb exakt eine Stufe; `castShadow=lod<1` (65017) lernt die
   Doppel-Mitgliedschaft. Dann Maske+Band ZUSAMMEN default-an (vollendeter Bogen, kein Hedge).
   Doppelte Draw-Last im Band ist Benchmark-konform (das Studio zahlt dieselbe).

**Linse:** `gate:foundry-crossfade`, zweiteilig: (a) Node-pur DIESELBE geteilte Masken-Funktion auf
einem synthetischen 64×64-Raster übers Band — Rinde: `keepL0 XOR keepL1 == 1` pro Pixel, Laub:
Union-Deckung ≥ max(Einzelstufe) an jedem Band-Punkt (kein Loch), numerische Äquivalenz gegen die
foundry-core-GLSL-Konstanten; (b) headless Distanz-Sweep über thresh01/thresh12 — im Band Slots in
BEIDEN Gruppen, außerhalb genau einer, nie 0; `g.free`-Slot-Bilanz (kein Leck). **Risiko:** mittel —
Slot-Buchhaltung (Bilanz-Linse) + Test-Nachzug (Schritt 0 preist ihn ein); der LOOK der Blende ist
W8. **DONE-Bezug:** Kriterium 4 + Faden „Dither-Blende" vollständig; stützt Kriterium 1.
**Wort-Schärfung nötig (§3 E-C):** „kein LOD-Pop" = kein LOD-WECHSEL-Pop; der
Materialisierungs-Pop kalter Bäume (`_foundryRewarmColdTrees` 64791–64866) ist ein separater
Entscheid — früh stellbar, nicht erst W8.

### W6 — Null Fremd-Silhouetten + das Paritäts-Verdikt scharf · klein-mittel, 1 Welle

**Ziel:** die Silhouetten-QUELLEN-Liste als endliche Liste schließen und DANACH — auf dem stabilen
Bild — die Paritäts-Schwellen kalibrieren und gaten.

**Schritte:**

1. **Die Zensus-Sonde wird die stehende Silhouetten-Linse (Gesetz #0 — Linse statt Liste-im-Kopf):**
   die V18.427-Szenen-Zensus-Sonde klassifiziert JEDEN Emitter → Studio-Pipeline / Welt-Substanz /
   dokumentierter Entscheid / **VERLETZUNG**; Kriterium 3 wird abzählbar-beweisbar und fängt künftige
   neue Quellen von selbst.
2. `farn_busch` → `strauch` mappen: 1 Zeile in `_foundryPresetFor` (64111–64187; deckt beide
   Spawn-Pfade 50787 + 65860).
3. `stamm_gefallen` im Studio-Regime AUS (Spawn-Chokepoint-Gate, HORIZON_MANTLE-Muster 35509–35512;
   Alt-Mechanik-Band via `__anazhGateNoFoundry`-Hook — SICHERN+WIEDERHERSTELLEN, nie löschen).
4. **Fern-Wasser als markiertes PROVISORIUM, nicht als neues Gate:** die BESTEHENDE saubere
   Ausschalt-Naht nutzen (`atmosphere.farWater===false` disposed sauber, 35664–35667) als
   reversiblen Default im Studio-Regime — UND die „verdeckt"-Behauptung als Zahl in die Linse
   (Assert: Sheet-Innenkante jenseits der Voll-Nebel-Distanz in ALLEN fog-Zuständen inkl.
   Weitblick-Zweig — `outR = max((ringR+2.5)·span, fogFar+60)` ragt über fog.far hinaus, die
   Behauptung ist heute UNBEWIESEN). Endgültig entscheidet der Wasser-Scope-Entscheid (§3 E-D) —
   Fern-Wasser ist ECHTE Hydro-Wahrheit, keine Kulisse; das eigene Inseln/Plattform-Argument
   („Render-Regime-Gate auf Welt-Inhalt = falsche Naht") trifft es strukturell ebenso.
5. **Gras-Fail-Open präzise schließen (die V18.380-has-vs-null-Falle):** null/undefined = MISS →
   `pendingGrass` warten (fail-closed); `[]` = RESOLVED-LEER → leer akzeptieren (NICHT Alt-Tuft,
   NICHT ewig warten — sonst Deadlock-Klasse). `_grassStudioGeometry` 33725–33750.
6. `glut_var*`, fliegende Inseln, start_plattform NICHT eigenmächtig gaten — Schöpfer-Entscheide
   (§3 E-E/E-F); im Parity-Shot sind sie seit W2 versteckt.
7. **Parity-Verdikt kalibrieren** (jetzt, nach den bild-ändernden Wellen): Schwellen festziehen,
   ⛔/✅-Verdikt + exit≠0, Selbst-Test, npm-Gate (nightly, swiftshader-light).

**Linse:** Zensus-Klassifikation (0 VERLETZUNG) + diag-parity-Verdikt + je ein Mechanik-Band pro
neuem Gate. **Risiko:** niedrig (bewährte Chokepoint-Muster); die Falle ist die
Schwellen-Kalibrierung (V18.346: Teilmenge unabhängig vom Signal klassifizieren).
**DONE-Bezug:** Kriterium 3 vollständig bis auf benannte Entscheide; Kriterium 1 messbar geschlossen.

### W7 — Studio-Vertrag Phase 1: Fahrzeuge (Manifest-first) · mittel-groß, 2 Wellen

**VORBEDINGUNG (blockiert W7a UND W7b):** die zwei normativen Entscheide §3 E-A sind gefallen —
die `__vehicleCore`-Namespace-IIFE bricht die WÖRTLICHE eingefrorene Vertrags-Form (§3 B1
Top-Level-`PRESETS` + G2.1; der Validator extrahiert Top-Level-Symbole, diag-studio-vertrag.cjs:64–71),
und nach G4.3 wachsen unter v1 nur SOLL/DARF — die Form-Änderung eines MUSS-Blocks ist ein
v1.1-Akt und prägt ALLE kommenden Domänen (Tore, Bauwerke, Kreaturen). Beide Fragen sind asynchron
stellbar und blockieren W1–W6 nicht.

**Schritte:**

- **W7a (berührt anazhRealm.js NICHT):** Kern-Split worlds/garage/garage.js → vehicle-core.js —
  PRESETS mit normalisierten IDs + `kind:'vehicle'` + PARAMS/LEHREN/CULTURES (liegen als Daten vor,
  garage.js:739–770/132–158) + `buildInstance(rezeptId,seed,lod,ov?)` mit typed-array-Sink
  (deterministisch; Math.random bleibt in der Shell-Deko 911/935) + `STUDIO_VERTRAG=1`; Form gemäß
  Entscheid E-A (Empfehlung: namespaced IIFE `__vehicleCore` — löst die const-Kollisions-Wand
  foundry-core.js:94/96/2248 OHNE foundry-core-Edit); Vertrag-Doc v1.1 (Namensraum-Regel +
  **Multi-Kern-Merge-Regel**, s. W7b); CORES-Eintrag + Symbol-Mapping im Validator;
  spec/asset-contract/v3/ (sha256-Goldens über Gattungen×Seeds×LODs); Shell-Byte-Parität
  vor/nach Split; smoke:labs grün.
- **W7b — Andocken, mit dem Merge-Chokepoint als Kern:** `importScripts vehicle-core.js?v=` in den
  Foundry-Worker; vehicle-core in den IDB-Stempel-Hash (63999 — PFLICHT, sonst stale
  Fahrzeug-Assets = Drift-Klasse); `kind:'vehicle'`-Zweig am EINEN Auto-Register-Chokepoint
  (`_foundryAutoRegisterSpecies` 63868 → `fahrzeug_<id>`, Donor 56628); `fahrzeug_`-Präfix in
  `_foundryPresetFor` (64183). **DER MERGE-CHOKEPOINT (ohne ihn ist „L1=L0 per Clamp" FALSCH):**
  der kindStages-Clamp liest heute AUSSCHLIESSLICH `AnazhRealm._studioRenderConfig` aus dem
  foundry-core-Reply (`_foundryIngestRenderConfig` 63942–63963) — ein vehicle-core-eigener B2-Block
  erreicht den Leser (64960–64973) nie. Also: Merge disjunkter kind-Blöcke am EINEN Ingest,
  must-ignore-fest, **unbekannter kind → [0] fail-closed**; als Vertrag-v1.1-Regel normiert, im
  Validator als Selbst-Test-Injektion, Mutation-wins-Probe im `gate:nervensystem-vehicle`.
  B6-Anschluss: `fahrprofil` als Daten-Override in `_vehicleProfile` (49248–49300) mit emergentem
  Fallback (0 Regress).
- **NICHT Phase 1 (benannt, nicht gestrichen):** L2-Auto-Impostor für kind:vehicle (RTT-Bäcker via
  frameOverride 61293 fast agnostisch) · settlement-Streuen (B3-Später) · generische
  PARAMS-Werkstatt-UI · **Vertrag Phase 2 (Tore/Porta)** als benannte Folge-Welle.

**Linse:** gate:studio-vertrag validiert vehicle-core automatisch + v3-Goldens byte-exakt +
gate:nervensystem-vehicle (kind:vehicle-Preset im Buch → Auto-Blueprint → Werkstatt-/Katalog-Bau
ohne eine Zeile AnazhRealm-Edit) + Merge-Selbst-Test. **Risiko:** W7a minimal · W7b mittel
(typed-array-Serialisierung hat ihr Muster: phytogenesis.js:4584–4590). **DONE-Bezug:** Faden
„Vertrag Phase 1" vollständig; beweist „EINE Pipeline für alle Domänen".

### W8 — Die Schöpfer-Runde: Abnahme + Goldens einfrieren · 0,5 Tage Vorbereitung + 1 Session

**Vorbedingung:** W1–W7 haben alle Zahlen-Hälften grün geliefert — hier fallen NUR die Urteile, die
nur das Schöpfer-Auge/die echte GPU fällen kann.

1. **VOR der Session:** eine kurze HUD-Lese-Notiz in docs/ (die W1-dokumentierte Semantik: dc = Σ
   aller Pässe seit dem EINEN reset → erwartet ~900–1600, nicht 436, nicht 38108; das
   Zensus-Ratio als Lesehilfe) — sonst wiederholt sich die 38108-Fehldeutung mit der korrekten,
   aber unintuitiven neuen Zahl IN der Abnahme.
2. diag-parity-Bild-Paar sichten — das originale DONE-Wort „nicht mehr unterscheidbar" (Kriterium 1);
   die W6-Verdikt-Zahlen als Vorlage.
3. `npm run look-golden --mint` auf echter GPU (aussteht seit V18.359; optional zweites Golden für
   den parity-Spot) → die 0.92-MSSIM-Wache bewacht künftige Drift automatisch.
4. HUD/Regler gegen die Wahrheit; Flugschreiber-Trace ziehen (version ≥ V18.427 trennt alte
   vergiftete Traces, 14252).
5. Boot-Wall-Clock (kalt + warm) gegen diag-boot-stage; LOOK-Urteile: Dither-Blende im Band ·
   stiller Saug/Ankunfts-Pop · Wiese-bis-Kante/Busch-Teppich/Back-Licht (V18.422-Reste).
6. Die offenen Entscheide (§3) in EINER Sitzung schließen — jede Antwort wird benannte Folge-Welle
   oder dokumentierter Bewusst-Entscheid.

---

## §3 · Offene Schöpfer-Entscheide

- **E-A (VOR W7, asynchron stellbar):** (1) Zweit-Kern-Form: namespaced IIFE `__vehicleCore` +
  Validator-Symbol-Mapping + Vertrag-v1.1-Namensraum-Regel (Empfehlung) — oder foundry-core-Edit
  unter Byte-Beweis / eigener Garage-Worker? (2) kindStages-Erweiterung: Merge disjunkter
  kind-Blöcke am EINEN Ingest, unbekannter kind → [0] fail-closed (Empfehlung) — beides prägt die
  normative Form ALLER kommenden Domänen.
- **E-B:** Boot-≤3s-DEFINITION: ab Kontrolle oder ab Navigation (4,7-MB-Parse + init + Worldgen
  ~1–1,5 s sind ein harter Kalt-Boden)? Zählt der Warm-Boot (IDB)? Die diag-boot-stage-Zahl nach W4
  entscheidet, wie viel Rest-Härte akzeptiert oder weiter gebaut wird.
- **E-C (früh stellbar, vor W5-Ende):** „kein LOD-Pop" = kein LOD-WECHSEL-Pop (W5 deckt es) — gilt
  der Materialisierungs-Pop kalter Bäume (`_foundryRewarmColdTrees`) als eigener Fall? Falls ja:
  Zeit-Fade NUR für die Materialisierung als Nachschlag (erst nach dem W8-Boot-Eindruck).
- **E-D:** SCOPE von Kriterium 1+3 bei Himmel/Wasser: zählen der eigene Wolken-Dome
  (14617–14675 vs Studio-GLSL-Himmel phytogenesis.js:602–650) und die Wasser-Oberfläche (das Studio
  HAT Teich/Bach, 1078–1191) zum „ununterscheidbar" (→ eigene Folge-Wellen) — oder sind
  Himmel/Wasser AnazhRealm-Domänen (Boden·Speicher·Spieler)? Hieran hängt auch das
  Fern-Wasser-Provisorium (W6.4).
- **E-E:** `glutbrunnen`/`glut_var*`: bestätigen als bewusste Nicht-Studio-Silhouette (Kriterium 3
  nimmt sie aus) oder künftige Vertrags-Domäne?
- **E-F:** Fliegende Inseln + start_plattform: Welt-SUBSTANZ, die bleibt (Empfehlung — ein
  Render-Regime-Gate auf Worldgen-Inhalt koppelte Welt an Präsentation, die falsche Naht)?
- **E-G:** Falls W3 die Scatter-Kosten NICHT unter ~8 ms drückt: Freigabe für das Endgame
  „Region-Plan im voxel-worker als geteilter Kern" — neue Spiegel-Fläche, nur auf Mess-Beweis.

## §4 · Benannte Folge-Fäden (nicht Teil dieses Bogens — nie still gestrichen)

- **Pflanzen-B4/B5 als Datenblöcke** in den Kern (offen seit V18.416/.422).
- **plantForest↔planForestCell-Merge** — NUR unter Byte-Beweis (die Benchmark bewegt sich nie).
- **Vertrag Phase 2: Tore/Porta** (worlds/portale/ steht als Labor bereit).
- **Foundry-Baum-Geometrie-Last** (~76k Verts/L0 · 31,5 M Szene-Tris ungecullt — die Szene ist
  VERTEX-gebunden, V18.413-S3): Dezimierungs-/Dichte-Faden; W5 hilft nur im Band. Betrifft die
  Schöpfer-FPS bei jeder Sichtung — nach W8-Befund priorisieren.
- **TAA-Lite** (dann darf `uDitherT` wieder rotieren — das Studio-Gate, W5.3).
- Der Zwei-Pass-Laub-Composite als flicker-freier Auflösungs-Regler (ruhender Faden, V18.414).
