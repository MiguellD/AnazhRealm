# T4 — Wasser-Kohärenz: der zelluläre Automat (Wasser fliesst) — DETAIL-PLAN

> **Status: VOLLENDET + GEMERGT (10.06.2026, V18.84–.94).** Der ganze Bogen ist GEBAUT + GEMESSEN +
> Schöpfer-bestätigt („genial, L-Sheet kann raus" · „die Richtung stimmt"): T4a-Kern · Welt-Verdrahtung ·
> Physik-Read · W-B (Quellen-Pin · Pre-Carve-Seed · Receiver-Support · y-Band) · W-A Zell-Sheet (seit
> V18.92 der EINE Default-Render, der L-Film ist ENTFERNT) · die Flow-Regel (V18.93: Decay + Spiegel-
> Kappe + EPS-Fixpunkt → Wake-on-Stream AN). Dieses Dokument ist jetzt die CHRONIK des Bogens + die
> Referenz seiner Entscheidungen. **Offene Reste leben in `docs/roadmap.md` §4 „Wasser"** (Wasserfall-
> Plane-Überlapp · Schelf-Konsolidierung · Hoch-Becken über `L` · Unterwasser-Pass B5 · U2 Wasser-LOD).
> Der Folge-Bogen des Terrain-Kohärenz-Plans (§4 T4); er brauchte die kohärente Grenze (T0–T3) — die
> These des ganzen Bogens hielt. **Vor jeder Wasser-Arbeit ZUERST `wasser-render-architektur-plan.md`
> (die EINE Wahrheit + die 30-Wellen-Spirale) lesen.**
>
> **Das ist „Option A" der Schöpfer-Entscheidung (06.06., wasser-plan §157): ECHTE FLUID-DYNAMIK.**
> Die Grenz-Heilung (T0–T2) war die fehlende Vorbedingung; jetzt kann das Wasser auf kohärentem Boden
> fliessen. **Disziplin (heilig, aus 30 Wellen): hören nicht jagen · den vollen Bogen verstehen BEVOR
> man tweakt · Regel #0 (Wasser-Render ist pixel-blind → Browser-Sign-off + Merge pro bestätigtem
> Schritt) · eine vom Schöpfer revertierte Architektur NICHT wieder anfassen.**

---

## 0 · DIE WURZEL (gemessen, wasser-plan §3 — die in 30 Wellen NIE benannte)

**Das Wasser ist ein STATISCHES 2.5D-Höhenfeld `colL` + eine binäre Zell-FÜLLUNG (AIR/WATER/SOLID)
bis `colL`. Es gibt NIRGENDS eine Fluid-Dynamik. Wasser FLIESST NIE NACH.** Ein Carve füllt nur bis
zum frozen Spiegel; es sucht kein neues Niveau, strömt nicht in den Kanal. Minecraft (das Vorbild):
ein zellulärer Automat, Wasser-Level 0–N, breitet sich pro Tick zu Nachbarn aus (bergab-Priorität,
sucht sein Niveau). **Das ist die EINE fehlende Sache — eine ARCHITEKTUR, kein Render-Tweak.**

## 1 · DIE SUBSTANZ, MIT DER WIR UNS VEREINEN (kein Parallel-Pfad, V17.9)

- `entry.waterCells` (Uint8Array, `CELL_STATE` AIR/WATER/SOLID) pro Chunk — `_buildVoxelChunkWaterCells`
  (:19285, + Worker-Mirror, bit-identisch). SOLID aus Density → Architektur-Stempel → BFS-Flood von
  echten Quellen bis `colL[Spalte]` (V13.8). Die WAHRHEIT, die die Physik (`_playerWaterContext` :23060)
  + der Render (Surface-Mesh) lesen.
- `colL` (pro Spalte, aus `_atlasWaterLevelAt` = der frozen Atlas-Spiegel) — der STATISCHE Ziel-Spiegel.
- Die REAKTIVE-SCHICHT-Familie (das Muster, dem der CA folgt): `_tickWorldRules` (V17.33), `_lifeOverlayAt`
  (V17.27), das Wetter — **lokal-reaktiv, NICHT persistiert, KEIN Worker-Mirror**, im Game-Loop getickt.

## 2 · DIE ENTSCHEIDUNGEN (die der Plan VOR dem Bau klären muss — hier getroffen)

1. **Determinismus/Persistenz → LOKAL-REAKTIV (wie Wetter/Life-Overlay).** Der CA ist eine reaktive
   Schicht über den Zellen: **nicht im Snapshot, kein Worker-Mirror, nicht im Determinismus-Test.** Begründung:
   (a) das ist das bewährte Muster (V9.67/V17.27/V17.33 — die lebendige Schicht reagiert, der Worldgen
   bleibt frozen); (b) es hält die Determinismus-Wand (T3/Density) UNANGETASTET; (c) die statische Flood
   bleibt der seed-deterministische BODEN (peer-konsistent), der CA ist das lokale LEBEN darüber. Multi-User-
   Wasser-Fluss-Sync ist ein späterer eigener Faden (wenn überhaupt — Minecraft synct Fluid auch nicht hart).
2. **Modell → LEVEL pro Zelle (0..N) über dem Zell-Feld, NICHT Ersatz der Flood.** Ein neues
   `entry.waterLevel` (Float32Array, parallel zu `waterCells`): die statische Flood SEEDET es (WATER→voll),
   der CA bewegt das Level dynamisch. Die Flood bleibt der Ruhe-Zustand; der CA ist das Delta in Bewegung.
3. **Tick → ACTIVE-CELL-ONLY (die Großen: 30→1100 FPS).** Nur „dirty" Zellen ticken (eine Zelle wird
   dirty bei Edit/Carve in ihrer Region ODER wenn ein Nachbar sein Level änderte = cross-chunk-wake). Ein
   globales Budget/Frame; im Game-Loop neben `_tickPendingWaterIso` (:39176).
4. **Render → der EIGENE Schritt T4b (pixel-blind, Browser-Sign-off).** T4a (die Zell-Dynamik) ist
   HEADLESS-beweisbar (das Level-Feld bewegt sich messbar in einen Carve). T4b (das Surface-Mesh speist sich
   aus dem CA-Level statt `colL`) ist Regel-#0-Arbeit — getrennt, browser-validiert, gemergt.

## 3 · DER VERIFIZIERBARE PFAD (klein, gemessen, merge pro Schritt — die Anti-Spirale)

- **T4a-1 — der Automat-KERN (Gravität + Niveau-suchen + Erhaltung). GEBAUT ✓.** `_tickWaterCA(level,
  cells, dim, dimY)` — reine, deterministische Tick-Funktion (Gravität top-down + lateral Niveau-suchen,
  Delta-Puffer = exakte Erhaltung; `moved` = bewegte MAGNITUDE für den Settle). **`diag-water-flow-ca` GRÜN:
  ERHALTUNG exakt + FLUSS (Blob fällt · 5er-Säule spreizt zur Lache 1→64).** 3 Playtest-Inv.
- **T4a-2 — der Automat in die WELT verdrahtet (reaktive Schicht + Welt-Tick + cross-chunk-wake). GEBAUT ✓.**
  `state.waterLevelCells` (lokal-reaktiv, überlebt Rebuilds); `_tickWorldWaterCA` (active-cell-only, Settle
  via Magnitude → ruht); `_exchangeWaterBoundary` (Level über die +x/+z-Naht — der **cross-chunk-wake**,
  möglich WEIL T1/T2 die Grenze kohärent machten); `_addVoxelEdit` WECKT die Carve-Region. **`diag-water-
  world-flow` GRÜN: ERHALTUNG exakt (Σ A+B konstant) · Wasser fliesst über die Chunk-GRENZE (B erhielt 2.7) ·
  active-Set settled auf 0.** 3 Playtest-Inv. Im Game-Loop getickt (kostenlos wenn nichts perturbiert).
- **T4a-4 — die PHYSIK liest das Level. GEBAUT ✓ (V18.90):** `_playerWaterContext` — wo ein
  Live-Level existiert, trägt eine Zelle ab Level > 0.5 (Render + Physik lesen DIESELBE
  Live-Schicht → kein Schwimmen im sichtbar leeren Carve-Loch); ohne Eintrag die statische
  Zell-Wahrheit (unverändert).
- **W-B-KERN — der CA als FÜLL-WAHRHEIT. GEBAUT ✓ (V18.90, `diag-water-sources` exit 0):**
  **(a) PRE-CARVE-SEED** (`_preSeedWaterCAForEdit` in `_addVoxelEdit`, VOR dem Rebuild): die
  Level-Einträge halten die PRE-Carve-Ruhe fest → das Nachfließen ist DETERMINISTISCH sichtbar
  (GEMESSEN: neuer Carve-Raum Füllung 0 → 1.0 über Ticks; vorher timing-abhängig instant).
  **(b) QUELLEN-PIN** (`_ensureWaterCALevel` markiert Atlas-Wasser-Spalten [+Inf-Probe, 576/Chunk];
  der Welt-Tick füllt ihre WATER-Zellen pro Tick zur Flood-Ruhe): unendliche Reservoirs
  (Minecraft-Source-Semantik) — der See ENTLEERT sich nicht in einen Kanal (GEMESSEN: Quell-Mittel
  ≥0.97 unter Dauerabfluss, See-Zellen 0.98 voll nach Carve+240 Ticks). Die EINE bewusste
  Nicht-Erhaltung; überall sonst bleibt der Kern erhaltungs-exakt (Σ 6→6).
  **(c) RECEIVER-SUPPORT** (die semantische Wurzel-Erkenntnis): ein Lateral-Transfer braucht
  einen GESTÜTZTEN Empfänger (darunter SOLID oder ≥0.9) — Wasser schiebt sich nicht seitwärts
  in die freie Luft, es fällt zuerst. OHNE die Regel diffundiert die OBERSTE Schicht jedes
  ruhenden Körpers ewig in die Ufer-Luft (GEMESSEN: der Pin fand jede Runde neu zu füllen →
  nie settled = Dauer-Leck; DARUM hat Minecraft Fluss-REGELN statt purer Diffusion). Ein Carve
  füllt jetzt SCHICHT für SCHICHT von unten. NEBENEFFEKT (gewollt): der CA füllt die
  Flood-Schelf-Lücken unter `L` (die T7d-Klasse) beim Wecken nach — Betten werden VOLLER;
  der Settle-Tail der Schelf-Konvergenz ist asymptotisch (W-C-Notiz: Flood-Gates vs CA-Schelf
  konsolidieren). **(d) y-BAND** (§6.4): der Tick läuft nur über die belegten Zeilen
  (Gravitations-Kaskade folgt dynamisch, Band selbst-messend, exchange-touch-geweitet) —
  GEMESSEN BIT-IDENTISCH zum Voll-Sweep bei **8–13×** Tempo.
  **AUFGELÖSTE §6-ENTSCHEIDUNG:** „Flood → Seed-only" heißt NICHT, den Zell-Flood zu entkernen —
  die Flood bleibt das deterministische RUHE-Substrat (Zellen/Worker unberührt); das LIVE-Level
  FÜHRT, wo es existiert (Render liveTop + Physik + Pre-Seed garantiert den sichtbaren Verzug),
  die Quellen speisen es. Damit ist „fliesst nach wie Minecraft" im Modell VOLL da.
- **V18.91 — DIE OBERFLÄCHE GEHT MIT (Schöpfer-Browser-Befunde am Canyon):** live-only-Spalten
  (CA-Wasser ohne Flood — die Ausbreitung) rendern im Zell-Sheet (Top = Live-Dach sub-zellig;
  das Gate akzeptiert Level-Einträge auch ohne Atlas-Wasser → die Ausbreitung über Chunk-Grenzen
  in trockene Chunks ist sichtbar). GEMESSEN: 477/477 live-only-Spalten gedeckt. Plus
  OBERFLÄCHENSPANNUNG: 4 Glätt-Pässe (browser-justierbar 0..6 via `atmosphere.waterSheetSmooth`),
  Naht bleibt EXAKT (PAD=Pässe+1). **Der „Schlauch"-Befund ist korrekt:** Flüsse sind heute
  parametrische Bänder des frozen Netzes (D8-Kurse × Breiten-Profil; Zuflüsse existieren, aber
  als feste Ribbons) — das organische Wachsen („wie ein Baum") = Quellen-only + CA-Transport
  entlang des Bettes = der nächste tiefe Bogen (Phase A-tief), für den W-B die Vorstufen baute.
- **T4b — der RENDER. HYBRID GEBAUT ✓ (V18.84):** das Surface-Mesh liest den LIVE-Delta
  (`surfY = L + _caWaterTopDelta`, Clamp −14..+4; im Ruhe-Zustand exakt die statische `L`).
- **W-A — das ZELL-OBERKANTEN-SHEET. GEBAUT ✓ (V18.89, A/B-Modus "cells"):**
  `_buildVoxelChunkWaterCellSheet` — die Render-DOMÄNE kommt aus den ZELLEN (+1-Zell-Anker-Ring,
  der UNTER das Terrain taucht; MIN der 4 Nachbar-Böden — das MAX griffe an Klippen die Wand),
  die RUHE-Höhe ist sub-zellig `L` (Flood = „gefüllt bis L" → Bett gefüllt, die V18.87-Lehre),
  der LIVE-CA-Delta obendrauf (`_caColumnScan` — EIN Spalten-Kern, zwei Leser), wet-only-Glätten
  (PAD=3, naht-symmetrisch per Konstruktion). **GEMESSEN (`diag-water-cellsheet`, exit 0):**
  Parität Ø 0.003 m (>1 m: 0.03 % = die ALTE Flood-vs-Atlas-Lücke T7d, das Sheet rendert die
  Zell-Wahrheit treu) · Naht max Δy = 0 über 451 geteilte Grenz-Positionen · Anker 98.8 % unter
  Terrain · A/B-Screenshots `artifacts/water-ab-{surface,cells}.png` — der L-Film schnitt am
  Mess-Ort PHANTOM-Platten durchs Dorf, das Sheet zeigt Wasser nur wo Zellen Wasser TRAGEN.
  Default bleibt "surface" — **der Schöpfer-Browser-A/B (Einstellungen → Wasser-Render →
  „Zell-Sheet (W-A, neu)") ist das Merge-Gate.** OFFEN (W-C): Anker an ÜBERHÄNGEN (11/955 —
  erster SOLID UNTER dem Wasser-Dach statt von oben) · konvexer Quer-Droop am Ufer (heute
  Glätten+Tauch-Ring) · Wasserfall-Plane-Überlapp im cells-Modus prüfen.

## 6 · DIE VIER GEMESSENEN W-B-BEFUNDE (Code-Audit 09.06.2026 — vor W-B heilen/entscheiden)

1. **`state.waterLevelCells` ist UNBOUNDED** — kein Prune/Decay nirgends; jeder je geweckte Chunk
   hält für immer ein Float32Array (24·24·232 ≈ **534 KB**). Verletzt die eigene §5-Wand („bounded,
   sparse, lazy-decay") + V17.27. **Heilung: Prune in `_pruneDistantVoxelChunks`** (Chunk fällt aus
   dem Ring → Level-Eintrag + active-Key fallen mit; Re-Stream seedet aus der Flood neu —
   konsistent mit „lokal-reaktiv wie Wetter"). ✓ GEBAUT (V18.88).
2. **`_caWaterTopDelta`-FERNKANTE bricht die V18.18-Lehre** — der Guard gab für `ci >= dim` 0
   zurück → der ferne Rand-Vertex rendert STATISCH, während der Nachbar an derselben Welt-Position
   seinen Live-Delta rendert → transienter Höhen-Riss an jeder Chunk-Grenze, solange Wasser fließt.
   **Heilung: Nachbar-Redirect** (das `colDepthAt`-Muster) + die V18.0-Folge: ein bewegter Chunk
   re-enqueued AUCH die drei Leser-Nachbarn (−x · −z · −x−z), „wer N Nachbarn liest, re-enqueued N".
   ✓ GEBAUT (V18.88).
3. **+x/+z-ASYMMETRIE der Ausbreitung** — `_tickWorldWaterCA` tauschte nur über die +x/+z-Grenzen
   AKTIVER Chunks: ist der West/Nord-Nachbar inaktiv, wird das Grenz-Paar NIE ausgeführt → Wasser
   propagiert über den initialen Wake-Ring hinaus nur nach Ost/Süd (die V13.3-Isotropie-Klasse).
   **Heilung: aktive Chunks tauschen auch mit INAKTIVEN −x/−z-Nachbarn** (ist der Nachbar aktiv,
   führt ER das Paar als sein +x/+z — keine Doppel-Ausführung). ✓ GEBAUT (V18.88).
4. **„active-cell-only" ist active-CHUNK-Vollsweep** — pro aktivem Chunk tickt der CA ALLE
   133.632 Zellen inkl. der vollen dimY=232-Säule (überwiegend Luft; das `hydroBand`-Wissen
   ungenutzt). Für Carve-Reaktivität ok (settled schnell); für Phase A (weiträumige Flüsse)
   skaliert es nicht. **W-B-Arbeit: y-Band-Limit pro Chunk (min/max belegtes j ± 1) und/oder echte
   active-cell-Listen.** OFFEN.

**Plus die EINE W-B-Architektur-Entscheidung (heute implizit + timing-abhängig):** der statische
Re-Flood füllt einen Carve UNTER `L` weiterhin INSTANT (beim sync gebauten Footprint-Chunk seedet
der CA aus den schon-vollen Zellen → kein sichtbares Fließen dort); sichtbares Nachfließen entsteht
v. a. AUSSERHALB der `L`-Domäne (+4-m-Befund) + bei async-Nachbarn (Seed vor Rebuild). **W-B muss
entscheiden: die Flood wird SEED-ONLY (Erst-Zustand), der CA der einzige Füller — und dann braucht
es QUELLEN/SENKEN-Semantik (das frozen Hydro-Netz als Quell-Emitter, der Ozean unendlich; Minecraft:
Source-Blocks), sonst entleert ein gegrabener Abfluss per Erhaltung den See.** Nicht benennen =
der Keim der nächsten Spirale.

## 4 · DIE SYNERGIE (warum das den Samen nährt — das lebendige Feld)

Wasser, das fliesst, ist die Welt, die LEBT (das-lebendige-feld.md — lesen·schreiben·WERTEN). Der CA ist
eine reaktive Schicht wie die Emotion, das Life-Overlay, das Wetter: die Welt reagiert auf die Tat (ein
Carve → das Wasser strömt). Und er VOLLENDET den Bogen: T0–T2 (kohärente Grenze) trägt den cross-chunk-
wake, T3 (kantiger Mesher) trägt die scharfen Kanäle, durch die das Wasser fliesst. EIN Fluss, fünf Phasen.

## 5 · DIE WÄNDE (gegen die Spirale)

- **Headless beweist die DYNAMIK (Zell-Level über Zeit) — das ist GEOMETRIE/Zustand, nicht pixel-blind**
  (der Schöpfer bestätigte: „du siehst es wie ich"). Der LOOK (T4b) ist sein Auge.
- **Eine vom Schöpfer revertierte Architektur NICHT wieder anfassen** (flacher Fluss V18.12/.26, Zell-Maske
  V18.8, Auslauf-skirt V18.25/.30/.31) — der CA ist ein NEUER Weg (Level-Dynamik), kein altes Pflaster.
- **Merge pro bestätigtem Schritt** (Regel #0) — kein 30-Wellen-Stapel mehr.
- **Performance:** active-cell-only + Budget/Frame; das CA-Level ist eine reaktive Schicht (bounded, sparse,
  lazy-decay wo ruhig), kein Voll-Sweep — das V17.27-Overlay-Muster.

## 7 · DIE FLOW-REGEL — ENTSCHIEDEN + GEBAUT (V18.93: Decay + Spiegel-Kappe + Fixpunkt; V18.129: + der STAU-SPIEGEL)

> **V18.129 — die VIERTE Regel (das Hoch-Becken, gigant-plan §5-A4-Rest):** ein
> SPIELER-WERK (Fill-Edit / solide Architektur, Krone über rim) öffnet die
> Spiegel-Kappe LOKAL über einen bounded SPILL-SCAN (`_stauSpillLevels` — PURE
> Priority-Flood im Werk-Fenster, `CA_STAU`): die Kappe steigt auf den ehrlichen
> HALTE-Pegel (billigster Ausweg — Krone · Ufer · die V18.93-Außenwelt am
> Fensterrand). Ein Pfeiler staut damit strukturell NICHT (Ausweg auf rim);
> gepinnte Quell-Spalten im Stau-Bereich (src=2) TROPFEN den Pool voll
> (`FEED`/Tick, gestützt, bis zur Kappe) → der Fixpunkt settled den vollen See.
> GEMESSEN (`diag-stau.cjs`): Pfeiler 0.00 m · Damm-Pool +2.68 m über rim als
> EBENE Fläche · settled · Welt unverändert. Felder werk-zentriert gecacht
> (keine Kappen-Naht), Invalidation via `_invalidateWaterCapsAround`
> (Edit/Spawn/Remove). Offene Kür: der ÜBERLAUF über die Krone als Wasserfall.

**GEMESSEN (V18.92, frische Welt, `diag-water-cellsheet` mit 4000-Tick-Vorlauf):** „Wake-on-Stream"
(jeder einstreamende Wasser-Chunk weckt den CA — der Versuch, „die Ausbreitung des Flusses zu
integrieren") FLUTET die Welt: unendliche Quellen (Pin) in einer GESCHLOSSENEN Domäne — der
LOD-Ring-Rand ist ein unsichtbarer DAMM (der CA tickt nur LOD0) — poolte 12.5 m Wasser ÜBER `L`,
1409 live-Spalten OHNE einen Carve. Das ist korrekte Hydraulik (infinite Springs + Becken = es
füllt sich bis zur Quell-Höhe) und falsches Spiel. **DARUM hat Minecraft Fluss-DISTANZ-Regeln
statt purer Hydraulik.** ZURÜCKGENOMMEN — der CA bleibt CARVE-getrieben (die Spieler-Aufmerksamkeit
ist die natürliche Grenze; genau diese Ausbreitung fand der Schöpfer „genial").

**V18.93 — GEBAUT + GEMESSEN (`diag-water-sources` E, Wake-ALL + 2500 Ticks): Regel 1 ALLEIN
REICHTE NICHT** (12.5 → 9 m: Decay begrenzt die FERNE, aber ein Pool NEBEN der Quelle steigt
hydrostatisch trotzdem). Die GEBAUTE Lösung sind DREI Regeln zusammen:
1. **Distanz-Decay** (`AnazhRealm.CA_FLOW_KEEP` = 0.95): jeder Lateral-Transfer liefert nur 95 %
   ab → ferne Zungen sterben geometrisch (Gravitation verlustfrei — Fälle tragen volle Stärke).
2. **Spiegel-Kappe** (`waterCapJ`, pro Spalte bei `_ensureWaterCALevel` berechnet): ZUFLUSS nur bis
   rim-L + 0.5 m (im Atlas-Gebiet — Wasser steigt nie über seinen Spiegel, die Minecraft-Wahrheit)
   bzw. Boden + 2 Zellen (jenseits — die fließende „Skin" am Canyon). Reine EMPFÄNGER-Regel im
   Lateral-Pass + Exchange → kein Lösch-Pass, kein Dauer-Pump; der Carve refresht die Kappe
   (`_preSeedWaterCAForEdit`).
3. **EPS_FLOW-Fixpunkt** (Lateral-Schwelle ≈ 1−KEEP): schluckt das permanente Decay-Gefälle an
   jeder Quell-Grenze — sonst pumpt der Automat EWIG (GEMESSEN: active=4 für immer + Dauer-
   Re-Meshing + cm-Naht-Jitter); mit Schwelle ist der Decay-Zustand ein echter FIXPUNKT → Settle.
**GEMESSEN: max 2.29 m über Rim-L (Zell-Quantisierung) · active → 0 (settled ~1100–2500 Ticks) ·
See voll 0.992 · Carve-Füllung 0→1.0 · Naht Δy=0 (+ der SYMMETRIE-Fallback: ein fehlender/trockener
Pad-Nachbar zählt TROCKEN statt eigene-Rand-Spalte — der alte Clamp gab zwei Chunks am 4-Ecken-
Punkt verschiedene Werte = 6.6-cm-Naht). DAMIT IST WAKE-ON-STREAM AN: jeder einstreamende
Wasser-Chunk weckt den CA einmal — die Welt-Wasser-Substanz lebt von allein und ruht dann.**

Die ursprünglichen Optionen (Historie des Entscheids):

1. **Distanz-Decay (der Minecraft-Weg, EMPFEHLUNG):** jeder Lateral-Transfer verliert einen
   kleinen Anteil (Dissipation) → Wasser DÜNNT mit der Entfernung von der Quelle, Pooling fern
   der Quelle stirbt geometrisch ab; die Carve-Füllung nahe der Quelle bleibt voll.
   Nicht-konservativ (bewusst, wie das Minecraft-Despawn). Eigene messbare Welle, Browser-A/B
   am Canyon.
2. **Emissions-Budget pro Quelle:** der Pin speist nur mit Rate ≤ r/Tick — verlangsamt das
   Pooling stark, beendet es aber nicht (schwächer als 1).
3. **Beim Carve-getriebenen Modell bleiben** (der heutige Stand): die Welt-Substanz ruht, bis
   der Spieler eingreift; das volle „Flüsse leben von allein" wartet auf Regel 1.
