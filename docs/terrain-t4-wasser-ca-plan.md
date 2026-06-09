# T4 — Wasser-Kohärenz: der zelluläre Automat (Wasser fliesst) — DETAIL-PLAN

> **Status:** AKTIVER DETAIL-PLAN (09.06.2026). Der Folge-Bogen des Terrain-Kohärenz-Plans (§4 T4),
> jetzt ENTRIEGELT — die Grenze ist kohärent (T0–T3 GEBAUT: T1 zeitlich · T2 räumlich · T3 Mesher),
> und ein CA mit cross-chunk-wake brauchte genau diese konsistente Nachbar-Zell-Wahrheit (die These
> des ganzen Bogens). **Vor jeder Wasser-Arbeit ZUERST `docs/archiv/wasser-render-architektur-plan.md`
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
- **T4a-4 — die PHYSIK liest das Level** (`_playerWaterContext` nutzt das CA-Level statt der binären Zelle)
  → Auftrieb folgt dem echten Wasserstand. Headless-Physik-Probe. **OFFEN (W-B).**
- **T4b — der RENDER. HYBRID GEBAUT ✓ (V18.84):** das Surface-Mesh liest den LIVE-Delta
  (`surfY = L + _caWaterTopDelta`, Clamp −14..+4; im Ruhe-Zustand exakt die statische `L`). Die
  VOLLE Form (Höhe aus den ZELL-OBERKANTEN, das frozen `L` stirbt als Render-Quelle — wasser-plan
  §0 W-A) ist der nächste Bau → Regel #0, A/B-Browser-Loop, Merge. **Dort heilt auch Ebene B (das
  Mesh-Falten): ein Zell-Top pro Spalte springt nicht wie das Multi-Segment-`L` → keine Faltung.**

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
