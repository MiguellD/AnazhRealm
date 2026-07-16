# DAS FELD ZEICHNET (normativ) — der Render-Bogen des lebendigen Feldes

> Der wahre Norden sagt: das Feld **liest · schreibt · wertet** (`das-lebendige-feld.md`).
> Dieser Bogen fügt den vierten Vers: **das Feld ZEICHNET.** Der Renderer wird ein
> LESER des Feldes — wie die Physik es seit dem Determinismus-Bogen P3 ist (die
> Spieler-Kollision liest das Dichtefeld; kein Body, kein Anker, kein Durchfallen).

## §1 · Die Einsicht (Schöpfer, 16.07.2026)

Klassische Engines wissen nicht, was wo ist — sie verwalten Säcke voller Dinge
(Streaming, Szenengraphen, Gigabyte-Assets), nur um „was ist hier?" zu beantworten.
**Unsere Welt ist kein Sack, sie ist eine Funktion:** `welt(x, y, z, seed, t)`
antwortet sofort, überall, für immer gleich (Γ5). Daraus folgen zwei Vorteile,
die kein klassisches System hat:

1. **Kein Lade-Problem, nur ein Auswerte-Problem.** Die „Daten" der Welt sind
   Gesetze + Seed (Kilobytes). Jede Detailstufe jedes Ortes ist jederzeit
   synthetisierbar — und jeder Cache ist PERFEKT (gleiche Bytes für immer,
   nie invalide, außer die Gesetz-Version selbst steigt).
2. **Die Render-Kosten binden an den SCHIRM, nicht an die Welt.** Der Schirm hat
   konstant ~2M Pixel — egal wie tief die Welt ist. Nanite, Dreams und die
   Demoszene bauen mühsam nach, was wir per Geburt haben: eine befragbare Welt.

## §2 · Die drei Stufen (jede mit eigenem DONE)

**STUFE 1 — DAS FELD URTEILT, was gezeichnet wird.** Sichtbarkeit ist eine
Feld-Frage, keine Objekt-Pflicht: ferne/verdeckte Instanzen werden NICHT
gezeichnet (Instanz-Cull am bestehenden Chokepoint; später GPU-Cull per
Compute + indirekte Draws). Erst-Konsument: der Dither-Wal — Foliage-Batches,
deren Shader fern Pixel verwirft, aber Vertex-Arbeit weiter bezahlt.
DONE: Tri-Zensus steady ≤ 8M in der Standard-Szene (roadmap §0.0 T2-Maß).

**STUFE 2 — DIE FERNE IST FELD, keine Geometrie.** Jenseits des Voxel-Rings
zeichnet das Höhen-GESETZ selbst den Horizont (Fern-Ring-Schalen / später ein
Fullscreen-Feld-Pass): unbegrenzte Sichtweite zu ~festen Kosten. DONE: der
Blick reicht über den Streaming-Ring hinaus (Bild-Beweis), Draw-Calls des
Horizonts gedeckelt (Schalen-Anzahl), Höhen == das EINE Gesetz (Linse).

**STUFE 3 — AUCH DIE NÄHE ZIEHT DER SCHIRM.** Studio-Assets sind deterministische
Funktionen (Rezept+Seed+Stufe→Mesh) — virtualisierte Geometrie/SDF-Hybride,
vom Schirm nach Bedarf gezogen statt als Klumpen geschoben. Forschungskante;
beginnt erst, wenn Stufe 1+2 GEMESSEN stehen.

## §3 · DER DRITTE SPIEGEL (das Fundament — Lehre 7 erweitert)

Heute halten wir Main ↔ voxel-worker **bit-identisch** (f64, dieselbe Quelle).
Damit das Feld auf der GPU zeichnet, reisen die Gesetze ein drittes Mal: nach
**WGSL**. Normativ:

- Der WGSL-Spiegel ist ein **SEH-Spiegel, nie Physik-Wahrheit**: f32 statt f64 —
  die Abweichung ist ein GEMESSENES Toleranz-Band (`gate:dritter-spiegel`,
  maxDiff über ein deterministisches Proben-Gitter), kein Versprechen.
  Kollision/Sim lesen weiter NUR die f64-Quelle.
- **EINE Quelle je Gesetz:** der WGSL-Text wohnt in `feld-wgsl.js` (Root, neben
  den Kernen), Konstanten werden aus derselben Stelle gespeist wie die
  JS-Leser — driftet das JS-Gesetz, MUSS die Linse rot werden (Selbsttest:
  injizierte Abweichung wird erkannt).
- **voxelEdits sind ein CPU-Overlay** (≤256 lokale Kugeln): der Seh-Spiegel v1
  zeichnet das BASIS-Feld; editierte Zonen liegen ohnehin im nahen Voxel-Ring
  (echte Geometrie). Reist der Overlay später, dann als Uniform-Liste.

## §4 · LADEN IST EIN KLACKS (der Warm-Start-Grundsatz)

Γ5 macht jeden Bau-Schritt cachebar: **gebaute, uneditierte Chunk-Geometrie
reist als GPU-fertige Bytes** (typed arrays) in IDB, Key = `seed|chunk|lod|
gesetzVersion`. Hit → Bytes → BufferGeometry (kein Meshing); Miss → bauen +
stiften; Edits im Footprint → ehrlicher Bypass (die Wahrheit schlägt den Cache).
Ziel-Erlebnis: der zweite Boot einer Welt zeigt den Ring aus dem Cache,
Erst-Berechnung ist ein Einmal-Preis. DONE: Boot-Linse misst Cache-Hit-Quote +
Zeit-Differenz kalt/warm.

## §5 · Die Ehrlichkeits-Klauseln

1. **Messen vor Bauen:** kein Stufen-Ausbau ohne Trace-/Zensus-Urteil (die
   Hitch-Telemetrie — LongTasks · GC · Pipeline-Compiles · Upload-Bytes — ist
   Teil dieses Bogens, nicht Beiwerk).
2. **Kein Parallelpfad:** jede Stufe konsumiert bestehende Chokepoints
   (Instanz-Registry, Foundry-Cache, Flugschreiber) — fällt ein Alt-Pfad,
   fällt er GANZ (Lehre 3).
3. **Browser-Wahrheit:** kein Bindless, keine Mesh-Shader — Compute + indirekte
   Draws reichen für Stufe 1+2. Was WebGPU heute nicht trägt, wird benannt,
   nicht simuliert.
4. **Das Spiel bleibt CPU-Wahrheit:** Verhalten, Physik, Lockstep unberührt —
   das Feld zeichnet, es würfelt nicht das Spiel um.

## §6 · Stand

- **V18.484 — DER GRUNDSTEIN:** Doktrin (dies) · dritter Spiegel + Linse ·
  Hitch-Telemetrie · Stufe-1-Erstkonsument (Dither-Wal) · Fern-Ring v1 ·
  Warm-Start v1. Chronik = git log; Offenes = roadmap §0.
