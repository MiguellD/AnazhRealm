# Das Wasser-Ultiversum — Hydrosphären-Design (V9.43)

**Stand**: 21.05.2026, nach V9.43-a + Schöpfer-Browser-Test. Schöpfer-Wahl: **volles
Drainage-Netz mit echten Fluss-Betten**. Dieses Dokument ist die ausführliche Planung
des Wasser-Systems — der Profi-Weg, ehrlich in Phasen geschnitten. Die kanonische
Versions-Historie lebt in `CLAUDE.md`; der Wellen-Plan im Überblick in `docs/roadmap.md`
§3. Dieses Doc ist die *Tiefe* — Algorithmus, Datenstrukturen, Risiken.

---

## 1. Vision

**Eine Wasser-Sprache.** Meer, See, Fluss, Wasserfall sind nicht vier Systeme — sie sind
**dieselbe Materie an verschiedenen Punkten des Gefälles**. Ein Tropfen fällt auf einen
Berg, sammelt sich zu einem Bach, der Bach stürzt als Wasserfall eine Klippe hinab,
sammelt sich in einem See, fließt als Fluss weiter und mündet ins Meer. Das ist die
Hydrosphäre — der Wasser-Kreis einer Welt.

- **Vision §1.3 fraktal**: eine Sprache (der Wasser-Shader + ein `uFlowDir`-Vektor)
  regelt alle Wasser-Skalen. Schon erfüllt für Meer (V8.30 Gerstner-Plane) + Wasserfall
  (V9.43-a vertikale Flow-Plane). Die Hydrosphäre fügt Fluss + See hinzu — und verbindet
  alle vier zu *einem* fließenden Ganzen.
- **Vision §1.4 multisensorisch**: man *hört*, wo Wasser fließt — ein Bach rauscht
  leiser, ein Wasserfall donnert (V9.43-e).
- **Heilige Lektion**: die Hydrosphäre ist EIN neues Subsystem auf einem soliden Stamm
  (deterministisch, gut fundiert) — kein 19-Modul-Re-Komplexifizieren. Ein Wachstumsring.

Schöpfer-Wort (21.05.2026): *„echte flüsse, seen, meere … das wasser das aktuell das
meer darstellt, die hänge runterfliessen lassen, wie in der echten natur, genial
durchgeführt, wie machen das die profis?"*

---

## 2. Der Befund — warum V9.43-a fliegende Sheets sind

V9.43-a hat die Wasserfälle von `THREE.Points`-Partikeln auf vertikale Wasser-Planes
umgestellt (richtig — die Audit-Wurzel „Partikel vs. Plane" ist geheilt). Aber jeder
Wasserfall ist eine **isolierte Plane**: er hängt allein an einer Klippe, ohne Fluss
darüber, ohne Becken darunter. Ein Wasserfall in der Natur ist EIN Abschnitt eines
Flusses; allein wirkt er wie ein aufgehängtes Tuch — *egal wie gut der Shader ist*.

**Die Wurzel ist nicht der Shader, sondern die fehlende Hydrologie.** Ein besserer
Shader heilt „kontextlos" nicht. Was fehlt, ist das Wasser-Netz: woher kommt das
Wasser, wohin fließt es.

---

## 3. Die Profi-Technik: Drainage-Netze / Flow-Accumulation

Prozedurale Welt-Generatoren (Gaea, World Machine, World Creator) und Spiele mit
prozeduralen Flüssen lösen das **nicht** mit einer Live-Fluid-Simulation. Sie berechnen
ein **Drainage-Netz** (engl. *drainage network* / *flow network*) — ein statisches,
deterministisches Fluss-Netz, aus dem Terrain abgeleitet:

1. **Surface-Sampling** — die Terrain-Oberfläche auf einem Raster abtasten.
2. **Depression-Filling** (Priority-Flood, Barnes et al. 2014) — lokale Senken auffüllen,
   damit jede Zelle einen Abfluss hat. Die aufgefüllten Senken **sind die Seen**.
3. **Flow-Direction** (D8) — jede Zelle zeigt zum tiefsten der 8 Nachbarn.
4. **Flow-Accumulation** — von hoch nach tief: jede Zelle gibt ihr Wasser (sich + alles
   von oben) an den Abfluss weiter. Wo viel zusammenkommt → ein Fluss.
5. **Netz-Extraktion** — Zellen über einem Schwellwert sind Fluss-Zellen; zu Polylinien
   verkettet. Fluss-Breite ∝ √Akkumulation (*hydraulische Geometrie* — echte Flüsse
   verbreitern sich mit der Wurzel des Durchflusses).
6. **Wasserfälle** — wo eine Fluss-Polylinie eine Klippe kreuzt (steiler Drop).
7. **Carven + Rendern** — Fluss-Betten ins Terrain schnitzen, alles mit *einem*
   Wasser-Shader rendern.

**Warum statisch, nicht Live-Sim?** Eine Live-Fluid-Simulation (à la *From Dust*) wäre
der AAA-Weg, passt aber nicht zu einer gestreamten Voxel-Welt: zu teuer pro Frame,
schwer deterministisch fürs Multiplayer (jeder Peer müsste bit-genau dieselbe Sim
rechnen), und sie kämpft gegen das Chunk-Streaming (ein globaler Sim-Zustand vs. lokal
gestreamte Chunks). Das **statische Drainage-Netz ist der Profi-Weg für *prozedurale*
Welten** — deterministisch aus dem Seed, einmal berechnet, multiplayer-sicher per
Konstruktion (jeder Peer rechnet das identische Netz).

---

## 4. Die Wurzel-Einsicht: das Wasser modulieren, nicht simulieren

Drei Einsichten machen das Design *genial* statt nur korrekt — sie fügen sich nahtlos in
die bestehende Architektur:

1. **Priority-Flood liefert Abfluss UND Seen in einem Pass.** Das Auffüllen der Senken
   ist nicht ein Vorbereitungs-Schritt *für* die Seen — die aufgefüllten Zellen *sind*
   die Seen (Zelle, deren Wasser-Level über dem echten Boden liegt → unter Wasser).

2. **Das Fluss-Netz moduliert `_terrainDensityAt` — kein Edit-Listen-Carven.** Die
   naheliegende Carve-Methode (`voxelEdits`-Liste, V9.14) hat ein FIFO-Cap von 256 —
   ein ganzes Fluss-Netz würde es sprengen. Stattdessen: die Hydrosphäre wird *Teil der
   Dichte-Funktion selbst*. `_terrainDensityAt` fragt: „liegt (x,z) in einem Fluss-Kanal
   oder einer See-Senke? dann senke die Dichte." Das Carven ist damit in das
   deterministische Dichte-Feld eingebacken — keine Edit-Liste, kein Cap, gratis beim
   Re-Mesh, multiplayer-sicher. Der Chunk-Mesher produziert die gecarvte Rinne von
   selbst. **Das ist die Schlüssel-Einsicht** — sie ist der Grund, warum „echte Betten"
   überhaupt billig machbar ist.

3. **Der Wasser-Shader existiert schon.** V9.43-a baute `_ensureWaterfallMaterial` — eine
   Flow-Plane mit `uFlowDir` + `uFlowSpeed`, geteilte Wasser-Substanz-Uniforms mit dem
   Meer. Das war Weitsicht: der Shader kam vor dem Netz. V9.43-c gibt ihm das Netz, auf
   dem er lebt — Fluss-Bänder + See-Planes nutzen dieselbe Material-Familie, nur ein
   anderer Flow-Vektor. V9.43-a war kein Sackgassen-Schnitt; es war das Fundament.

---

## 5. Der Algorithmus — sieben Phasen

### Vorbedingung: bounded domain
Ein Drainage-Netz braucht eine **endliche Domäne** (Flow-Accumulation muss eine ganze
Wasserscheide verarbeiten). Die Voxel-Welt ist chunk-gestreamt (praktisch unendlich) —
also wird die Hydrosphäre über eine **feste Region** um den Welt-Ursprung berechnet
(ca. 2 km Kantenlänge, das deckt Sicht-Ring 8 weit über). Jenseits der Region: kein
Fluss-Netz (nur Meer + trockenes Terrain) — eine ehrliche, dokumentierte Grenze (§10).

### Phase 1 — Surface-Sampling
`_voxelSurfaceY(x, z)` auf dem Region-Raster (Zell-Größe ~8 m → ~250×250 ≈ 62k Zellen).
Ergebnis: ein Heightfield `H[i][j]`. Die Surface-Funktion ist deterministisch (aus dem
Seed) → die ganze Hydrosphäre ist deterministisch → multiplayer-sicher.

**Wichtig**: gesampelt wird die **Basis-Oberfläche ohne Fluss-Carven** — sonst Zirkel
(Carven senkt die Surface, aus der die Hydrosphäre berechnet wird). Lösung: die
Hydrosphäre wird in eine lokale Variable berechnet; `state.hydrosphere` ist während der
Berechnung noch `null` → `_terrainDensityAt` überspringt das Carven natürlich. Erst
nach vollständigem Bau wird zugewiesen. Kein Flag nötig (§8).

### Phase 2 — Depression-Filling (Priority-Flood + ε)
Die Min-Heap-Variante (Barnes 2014): alle Rand-Zellen + alle Zellen ≤ `waterLevel`
(= Meer, die Basis-Senke) in einen Min-Heap (Priorität = Höhe). Pop die tiefste Zelle
`c`; für jeden unbesuchten Nachbarn `n`: `n.waterLevel = max(n.H, c.waterLevel + ε)`,
besucht markieren, mit Priorität `n.waterLevel` in den Heap. Das füllt jede Senke bis zu
ihrem Überlauf-Punkt; das `+ε` gibt jeder Zelle ein definiertes Gefälle (löst flache
See-Innenflächen für die Flow-Direction). **Zellen mit `waterLevel > H` sind See-Zellen.**

### Phase 3 — Flow-Direction (D8)
Auf der aufgefüllten Surface zeigt jede Zelle zum tiefsten der 8 Nachbarn. Auf flachen
See-Innenflächen ist die Richtung mehrdeutig — der Priority-Flood-Pass merkt sich pro
Zelle, von welchem Nachbarn sie *entdeckt* wurde; die Flow-Direction zeigt dorthin
zurück (Richtung Überlauf). So fließt auch ein See korrekt zu seinem Abfluss.

### Phase 4 — Flow-Accumulation
Zellen in absteigender `waterLevel`-Ordnung verarbeiten; jede Zelle addiert ihre
Akkumulation (Start 1) zu ihrer Abfluss-Zelle. Ergebnis `A[i][j]` = wieviel Drainage
durch jede Zelle läuft. (Optional: Start-Gewicht nach `lebendig`-Welt-Feld — feuchte
Regionen speisen mehr Wasser; Vision §1.3, dieselbe Welt-Feld-Quelle wie die Vegetation.)

### Phase 5 — Netz-Extraktion
- **Flüsse**: Zellen mit `A ≥ riverThreshold`. Von jeder Fluss-Quelle (erste Zelle über
  dem Schwellwert) entlang der Flow-Direction zu einer Polylinie verketten — bis zum
  Meer oder bis sie in einen See eintritt. Pro Punkt: Breite `w = wMin + k·√A`.
- **Seen**: zusammenhängende Komponenten der aufgefüllten Zellen. Pro See: Wasser-Level
  (Füll-Höhe), Zell-Menge, Bounding-Box, Abfluss-Fluss.
- **Wasserfälle**: entlang jeder Fluss-Polylinie die Segmente mit steilem Surface-Drop
  (`Δy / Δhoriz > slopeThreshold`) → ein Wasserfall, mit Fluss oben + Becken/Fluss unten.
- **Meer**: die bestehende flache Gerstner-Plane bei `waterLevel`. Flüsse, die
  `waterLevel` erreichen, enden dort (Fluss-Mündungen).

### Phase 6 — Rendering (§7)
### Phase 7 — Carven (§8)

---

## 6. Datenstrukturen

```
state.hydrosphere = {
  ready:   bool,
  originX, originZ: number,   // Region-Ecke in Welt-Koords
  size:    number,            // Region-Kantenlänge (m, ~2000)
  cell:    number,            // Zell-Größe (m, ~8)
  dim:     number,            // Zellen je Seite (~250)
  rivers: [
    { points: [{ x, z, y, width, flowX, flowZ }],   // Polylinie, Quelle→Mündung
      mouth:  "sea" | { lake: <id> } }
  ],
  lakes: [
    { id, level: number,                            // Wasser-Oberfläche (Füll-Höhe)
      cells:  ["i,j", ...],                          // See-Zellen
      bbox:   { minX, minZ, maxX, maxZ },
      floorY: number }                               // tiefster Basis-Punkt
  ],
  waterfalls: [
    { x, z, topY, bottomY, width, flowX, flowZ, riverIndex }
  ],
  riverBuckets: Map<"bi,bj", [segmentRef, ...]>      // Spatial-Index fürs Carven (§8)
}
```

Die Hydrosphäre wird **deterministisch aus dem Seed berechnet** — sie wird NICHT im
Save persistiert (wie das Noise-Feld). Beim Laden wird sie neu berechnet (~100-300 ms
einmalig, akzeptabel). Weitsicht: falls die Neuberechnung je zu langsam wird, kann sie
in `worldMeta` gecacht werden — kein Schema-Bruch nötig, nur eine Optimierung.

---

## 7. Rendering — eine Wasser-Sprache, vier Geometrien

Alle vier Wasser-Geometrien nutzen die V9.43-a Wasser-Material-Familie (`uFlowDir`,
`uFlowSpeed`, geteilte `uDeep`/`uShallow`/`uSunDir`/`uLight`/`fog*`-Uniforms, von
`_applyDayNightToScene` gespeist):

| Geometrie | Mesh | `uFlowDir` | Anmerkung |
|---|---|---|---|
| **Meer** | bestehende 900×900 Gerstner-Plane | ~0 (V9.43-b: sanfter Flow) | unverändert (V8.30) |
| **See** | flache Plane, geformt zur Senke, auf Füll-Höhe | ~0 / sanfter Drift | horizontaler Wasser-Shader |
| **Fluss** | Ribbon-Mesh (Quad-Streifen entlang der Polylinie), Breite ∝ √A | Gefälle-Tangente | flow-Shader, Breite wächst stromab |
| **Wasserfall** | vertikale Plane (V9.43-a) | (0,−1) | jetzt am Fluss-Klippen-Kreuz verankert |

Die V9.43-a-Methode `_buildVoxelChunkWaterfalls` (per-Chunk-Zufalls-Klippen-Spawner)
wird von V9.43-c **abgelöst**: Wasserfälle kommen jetzt aus dem Fluss-Netz (Fluss kreuzt
Klippe), nicht aus per-Chunk-Zufall. Das Material `_ensureWaterfallMaterial` + die
Plane-Geometrie werden **wiederverwendet** — nur die Spawn-Quelle wechselt. V9.43-a war
das Shader-Fundament; sein Spawn-Pfad war ein ehrlicher Zwischenschritt.

---

## 8. Das Carven — die Hydrosphäre moduliert `_terrainDensityAt`

`_terrainDensityAt(x, y, z)` bekommt am Ende einen Carve-Term:
```
let d = <bestehende Dichte-Logik>;
if (state.hydrosphere && state.hydrosphere.ready) d -= _hydrosphereChannelCut(x, y, z);
return d;
```

`_hydrosphereChannelCut`: fragt über den `riverBuckets`-Spatial-Index die nächste
Fluss-Polylinie ab — liegt (x,z) innerhalb `width/2`, wird im Oberflächen-Band ein
U-Profil-Schnitt angewandt (Bett-Tiefe ~`D`, Ufer steigen sanft an). See-Senken
analog (Boden auf `floorY` gesenkt). **O(1) amortisiert** dank Bucket-Grid — kritisch,
weil `_terrainDensityAt` beim Meshing millionenfach gerufen wird.

**Zirkel-Freiheit**: während die Hydrosphäre berechnet wird, ist `state.hydrosphere`
noch `null` → der Carve-Term ist 0 → `_voxelSurfaceY` sieht die Basis-Oberfläche. Erst
nach vollständigem Bau wird `state.hydrosphere` zugewiesen. Worldgen-Ordnung:
`waterLevel` → Hydrosphäre berechnen → `state.hydrosphere` setzen → Chunk-Streaming.
Kein Flag, kein zweiter Sampler — die Reihenfolge IST die Trennung.

**Wasser-Niveau im Fluss**: der Carve senkt das Bett um `D`; die Wasser-Oberfläche (das
Fluss-Ribbon-Mesh) sitzt ~`0.4·D` unter der Original-Oberfläche → das Wasser liegt in
einer echten Furche, die Ufer (Original-Surface) ragen darüber. Ein echtes Fluss-Bett.

**Spieler-Carven** (`voxel_carve`) bleibt eine separate lokale Edit-Schicht — das
Fluss-Netz ist die natürliche Drainage der *generierten* Welt und rechnet bei
Spieler-Edits nicht neu (ehrliche, dokumentierte Grenze, §10).

---

## 9. Die ehrliche Wellen-Schneidung

Eine ~4-5-Session-Welle, in vier playtest-grüne Phasen geschnitten — jede für sich
ausliefer­bar, jede vom Schöpfer-Browser-Auge prüfbar.

### V9.43-b — Der Hydrosphären-Atlas (die Berechnung, keine Sicht)
Phasen 1-5 des Algorithmus: `_computeHydrosphere()` baut `state.hydrosphere` (Surface-
Sampling → Priority-Flood → Flow-Direction → Flow-Accumulation → Netz-Extraktion). KEIN
Rendering, KEIN Carven. Reine Daten — vollständig headless-prüfbar.
*Test-Invarianten*: Determinismus (selber Seed → identisches Netz); ein Fluss-Polylinie
steigt monoton ab; ein Fluss endet am Meer oder in einem See; Flow-Accumulation ist
stromab monoton; ein See-Füll-Level liegt über dem Senken-Boden + unter der Überlauf-
Höhe; jede Land-Zelle hat nach dem Filling einen definierten Abfluss; die Berechnung
bleibt im Perf-Budget (< 500 ms, gemessen). *~1-2 Sessions.*

### V9.43-c — Flüsse + Seen werden sichtbar (Rendering)
Phase 6: `_buildHydrosphereMeshes()` rendert See-Planes (zur Senke geformt) + Fluss-
Ribbon-Meshes (Breite ∝ √A, `uFlowDir` = Gefälle-Tangente). Wasserfälle re-verankert:
eine V9.43-a-Plane an jedem Fluss-Klippen-Kreuz, mit Fluss oben + Becken unten. Der
per-Chunk-Zufalls-Wasserfall-Spawner wird abgelöst. Alle Wasser-Geometrien teilen die
V9.43-a-Material-Familie.
*Test-Invarianten*: Fluss-Ribbon-Breite wächst stromab; See-Plane sitzt auf Füll-Höhe;
Wasserfall-Plane sitzt an einem Fluss-Klippen-Kreuz (nicht per-Chunk-Zufall); alle
Wasser-Meshes nutzen die geteilte Material-Familie. *~1-2 Sessions.*

### V9.43-d — Die Flüsse carven echte Betten
Phase 7: `_terrainDensityAt` fragt die Hydrosphäre, senkt die Dichte im Fluss-Kanal +
in See-Senken. Spatial-Index (`riverBuckets`). Worldgen-Ordnung verdrahtet. Das Wasser
liegt jetzt in einer echten Rinne mit Ufern.
*Test-Invarianten*: ein Sample auf der Fluss-Mittellinie hat eine tiefere Surface als
die un-gecarvte Basis; das Fluss-Bett liegt unter den Ufern; der Carve ist während der
Hydrosphären-Berechnung übersprungen (kein Zirkel); eine Welt ohne Hydrosphäre ist
bit-identisch zu heute. *~1 Session.*

### V9.43-e — Politur + Klang
Vision §1.4: Fluss-Rauschen + Wasserfall-Donnern (positions-abhängige Audio-Schicht,
das V9.32-Audio-Versprechen eingelöst). Plus: Fluss-Mündung blendet sanft ins Meer,
See-Ufer-Schaum, Flow-Speed-Feinabstimmung nach Gefälle.
*~1 Session.*

---

## 10. Risiken, Grenzen, offene Fragen — ehrlich benannt

- **Bounded domain.** Flüsse existieren nur in der ~2-km-Hydrosphären-Region um den
  Ursprung. Jenseits: trockenes Terrain + Meer. Der Schöpfer spielt praktisch in einem
  begrenzten Bereich (Genesis-Plattform am Ursprung, Sicht-Ring ≤ 8 ≈ 734 m). Ehrliche
  Grenze. *Weitsicht*: später könnte die Region in groben Super-Kacheln dem Spieler
  folgen — braucht aber Wasserscheide-Naht-Behandlung über Kachel-Grenzen; bewusst
  NICHT in V9.43.
- **Carve-Timing.** Die Hydrosphäre MUSS vor dem ersten Chunk-Meshing fertig sein
  (sonst hätten frühe Chunks kein Fluss-Bett). Worldgen-Ordnung ist die Lösung; ein
  Chunk, der je vor der Hydrosphäre gebaut wird, bräuchte ein Re-Mesh — V9.43-d
  verdrahtet die Ordnung explizit.
- **Spieler-Carven vs. Fluss-Netz.** Das Netz ist aus der *generierten* Surface; ein
  `voxel_carve` des Spielers rechnet das Netz nicht neu. Akzeptiert + dokumentiert.
- **Performance.** Flow-Accumulation auf ~62k Zellen einmalig: unkritisch. Das
  Surface-Sampling (62k × ~90 Density-Evals) ist der teure Teil — ~100-300 ms beim
  Worldgen. Der Carve-Term in `_terrainDensityAt` MUSS O(1) sein (Bucket-Index) — wird
  millionenfach gerufen. Perf-Invariante in V9.43-b + V9.43-d.
- **Naht zum Meer.** Fluss-Mündungen müssen sanft auf `waterLevel` auslaufen — V9.43-e.
- **V9.43-a-Ablösung.** Der per-Chunk-Wasserfall-Spawner wird in V9.43-c abgelöst. Das
  ist kein Wegwerfen — das Material + die Plane-Geometrie bleiben; nur die Spawn-Quelle
  wandert vom Zufall zum Fluss-Netz. Ehrlich benannt, nicht still.

---

## 11. Vision-Pfeiler-Check

- **§1.3 fraktal** ✅ — eine Wasser-Sprache (ein Shader + `uFlowDir`) regelt Meer, See,
  Fluss, Wasserfall. Dasselbe Welt-Feld (`worldFieldAt.lebendig`), das regelt was wo
  wächst, speist optional die Drainage-Gewichte.
- **§1.4 multisensorisch** ✅ — V9.43-e: man hört, wo Wasser fließt.
- **§3 Welt-Atmen** ✅ — die Welt hat einen Wasser-Kreis; das Wasser fließt, wie in der
  echten Natur.
- **Heilige Lektion** ✅ — EIN neues Subsystem (`_computeHydrosphere` + ein Carve-Term +
  Render-Meshes), deterministisch + gut fundiert. Kein Re-Komplexifizieren — ein
  Wachstumsring auf dem Voxel-Stamm.

**Nächster Schritt**: V9.43-b — der Hydrosphären-Atlas (Berechnung, headless-prüfbar).
