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

- **T4a-1 — das Level-Feld + die GRAVITÄT (Wasser fällt).** `entry.waterLevel` (seed aus der Flood);
  `_tickWaterCA`: pro aktiver WATER-Zelle, wenn die Zelle DARUNTER nicht voll/solide ist, fliesst Level nach
  unten. **Headless-Beweis (`diag-water-flow-ca.cjs`, neu): carve ein Loch UNTER einem Wasser-Körper → tick
  → das Level fällt oben, steigt unten** (vorher: statisch, kein Fluss). Lokal-reaktiv, kein Render nötig.
- **T4a-2 — LATERAL + Niveau suchen.** Wasser spreizt zu niedriger-gefüllten Nachbarn (gleiche/abwärts),
  sucht sein Niveau. Beweis: ein umgegrabener Kanal NEBEN Wasser → das Level strömt hinein + gleicht sich aus.
- **T4a-3 — CROSS-CHUNK-WAKE.** Ein Level-Update an der Chunk-Grenze weckt die Nachbar-Chunk-Zellen
  (möglich, WEIL T1/T2 die Grenze kohärent machten — die Nachbar-Zell-Wahrheit ist jetzt konsistent). Beweis:
  Fluss über eine Chunk-Grenze (das Level propagiert nahtlos in den Nachbarn).
- **T4a-4 — die PHYSIK liest das Level** (`_playerWaterContext` nutzt das CA-Level statt der binären Zelle)
  → Auftrieb folgt dem echten Wasserstand. Headless-Physik-Probe.
- **T4b — der RENDER** (das Surface-Mesh aus dem CA-Level; das gefaltete `L`-Mesh stirbt, weil das Level
  jetzt die Wahrheit ist) → Regel #0, Browser-Loop, Merge. **Hier heilt auch Ebene B (das Mesh-Falten):
  ein CA-Level pro Zelle springt nicht wie das Multi-Segment-`L` → keine Faltung.**

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
