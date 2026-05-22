# Das Wasser-Ultiversum — Hydrosphären-Design (V9.43)

**Stand**: 22.05.2026 — **V9.43-b ✅ + V9.43-c ✅ + V9.43-c.2 ✅ + V9.43-d ✅ + V9.43-e ✅ gebaut** (der
Hydrosphären-Atlas, das Rendering, die Synergie mit dem Meer, das Carven echter Betten,
der Klang; siehe §8 + §9). **V9.45-b** löste danach den See-Carve ab — die Seebecken sind
jetzt flach gesculptete, wasserdichte Töpfe (`_hydrosphereLakeAt` statt des V9.43-d-
`lakeCutCell`-Schnitts; siehe §8 + die `handover.md`-Chronik). Schöpfer-Wahl war: **volles
Drainage-Netz mit echten Fluss-Betten**. Dieses Dokument ist die ausführliche Planung des
Wasser-Systems — der Profi-Weg, ehrlich in Phasen geschnitten. Offen: nur zwei kosmetische
Politur-Reste (See-Ufer-Schaum, Flow-Speed nach Gefälle — §9 V9.43-e). Plus eine ehrliche
offene Netz-Qualitäts-Frage aus der V9.43-c-Browser-Verifikation — die Flüsse sind kurz
(siehe §9 + §10). Die kanonische Versions-Chronik lebt in `docs/handover.md`; der Wellen-Plan
im Überblick in `docs/roadmap.md` §3. Dieses Doc ist die *Tiefe* — Algorithmus, Datenstrukturen, Risiken.

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
if (state.hydrosphere && state.hydrosphere.ready && !this._hydroComputing)
    d -= _hydrosphereCarveAt(x, z);
return d;
```

`_hydrosphereCarveAt` fragt über den `riverBuckets`-Bucket-Index das nächste
Fluss-Segment ab + senkt im Fluss-Kanal die Dichte; See-Senken senkt ein bilinear
interpoliertes Cut-Feld. **O(1) amortisiert** dank Bucket-Grid + zweier Early-Outs —
kritisch, weil `_terrainDensityAt` beim Meshing millionenfach gerufen wird.

**Geliefert (V9.43-d, 21.05.2026)** — drei Abweichungen vom Plan oben, ehrlich benannt:

(a) **Flachboden statt reines U-Profil.** Ein flaches Wasser-Ribbon über einem
U-Profil-Bett sänke an seinen Rändern in die gewölbte Rinnen-Wand. Der Fluss-Kanal hat
darum einen flachen Boden (volle Tiefe `D` bis zur halben Fluss-Breite, exakt so breit
wie das Ribbon), dann eine smoothstep-Bank-Rampe (`bankW = D·1.4`). Bett-Tiefe
`D = 1.4 + 0.16·width`. See-Becken wurden in V9.43-d auf `level − 8` gesenkt
(`carveLakeBedDepth`).

**V9.45-b — der See-Carve abgelöst.** Der V9.43-d-See-Schnitt (`lakeCutCell`, reine
Dichte-Senkung) hatte zwei Bugs: (1) der Boden behielt die volle 3D-Roughness → löchrig,
durch die Löcher schien die globale Meeres-Plane als zweites Wasser-Layer; (2) der
Schnitt war auf `cut ≥ 0` geklemmt → tiefe Becken-Stellen blieben un-gefüllt. Neu:
`_hydrosphereLakeAt(x,z)` liefert `{bedY, w}`, `_terrainDensityAt` blendet die Dichte
zur flachen Bett-Ebene (`d = d·(1−w) + (bedY−y)·w`). `bedY` ist in
`[waterLevel+0.5, level−1.2]` geklemmt → der Boden ist lückenlos flach UND liegt
garantiert über dem Meeresspiegel (die Meeres-Plane bleibt verdeckt). Seen ≤
`waterLevel+2` werden absorbiert (keine eigene Plane). `_hydrosphereCarveAt` ist
seither fluss-only. Volle Begründung: die `handover.md`-V9.45-b-Chronik.

(b) **Zirkel-Freiheit über ein Flag, nicht über die Reihenfolge.** Der Plan hoffte „kein
Flag — die Reihenfolge IST die Trennung". Das gilt nur beim ERSTEN Worldgen; ein
Re-Compute (Welt-Regen, Test) hat `state.hydrosphere` gesetzt → der Carve läse die
gecarvte Surface → Drift. `_computeHydrosphere` setzt darum ein transientes
`this._hydroComputing` (try/finally); der Carve-Guard prüft `!this._hydroComputing`.

(c) **Das Ribbon sampelt `_voxelSurfaceY` live.** Der Plan nahm an, das Ribbon folge
automatisch; `_buildRiverRibbon` las aber den compute-zeitlich gespeicherten,
un-gecarvten `point.voxelY`. Es sampelt jetzt `_voxelSurfaceY` LIVE (`_buildHydrosphere-
Meshes` läuft nach `state.hydrosphere`, Carve aktiv) → das Ribbon sitzt an der gecarvten
Surface + 0.18-Lift in der Furche, die un-gecarvten Ufer ragen darüber.

**Spieler-Carven** (`voxel_carve`) bleibt eine separate lokale Edit-Schicht — das
Fluss-Netz ist die natürliche Drainage der *generierten* Welt und rechnet bei
Spieler-Edits nicht neu (ehrliche, dokumentierte Grenze, §10).

---

## 9. Die ehrliche Wellen-Schneidung

Eine ~4-5-Session-Welle, in vier playtest-grüne Phasen geschnitten — jede für sich
ausliefer­bar, jede vom Schöpfer-Browser-Auge prüfbar.

### V9.43-b — Der Hydrosphären-Atlas (die Berechnung, keine Sicht) ✅ (21.05.2026)
Phasen 1-5 des Algorithmus: `_computeHydrosphere()` baut `state.hydrosphere` (Surface-
Sampling → Priority-Flood → Flow-Direction → Flow-Accumulation → Netz-Extraktion). KEIN
Rendering, KEIN Carven. Reine Daten — vollständig headless-prüfbar.
*Test-Invarianten*: Determinismus (selber Seed → identisches Netz); ein Fluss-Polylinie
steigt monoton ab; ein Fluss endet am Meer oder in einem See; Flow-Accumulation ist
stromab monoton; ein See-Füll-Level liegt über dem Senken-Boden + unter der Überlauf-
Höhe; jede Land-Zelle hat nach dem Filling einen definierten Abfluss; die Berechnung
bleibt im Perf-Budget (< 500 ms, gemessen). *~1-2 Sessions.*

**Geliefert (V9.43-b)**: `_computeHydrosphere()` als Orchestrator + acht `_hydro*`-Phasen-
Methoden (`_hydroInit`/`_hydroBlur`/`_hydroMarkOcean`/`_hydroPriorityFlood`/
`_hydroFlowDirection`/`_hydroAccumulate`/`_hydroExtractLakes`/`_hydroExtractRivers`/
`_hydroExtractWaterfalls`). 12 Invarianten grün, Perf 17 ms, 6 Flüsse + 12 Seen.
**Zwei Abweichungen vom Plan, an der echten Messung erzwungen** — beide ehrlich:
(a) **Surface-Sampling nutzt `_terrainMacroSurfaceY`, nicht `_voxelSurfaceY`.** Der Plan
§5 Phase 1 nannte `_voxelSurfaceY`; dessen 3D-Crags (λ~20 m) aliasen bei der 16-m-
Abtastung zu 276 Mikro-Senken. Die Drainage sampelt jetzt die glatte 2D-Makro-Surface
(`_terrainMacroSurfaceY`, aus `_terrainDensityAt` extrahiert — eine Quelle) + ein 3×3-Blur.
Das ist die „Basis-Oberfläche" aus §1 Phase 1, treuer gelesen.
(b) **`cell` ist 16 m, `dim` 128** (Plan-Schätzung: 8 m / 250²) — der Perf-Test entschied;
ein 128²-Netz ist substanziell, V9.43-c kann nachtunen. **Plus eine nicht-geplante,
nötige Phase 1.5**: `_hydroMarkOcean` — „Meer" ist nur die rand-verbundene Komponente der
Unter-Meeresspiegel-Zellen (siehe §5 Phase 2: jede Senke als Auslass zu seeden ließ den
Abfluss versickern, maxAccum 50). **0 Wasserfälle** in V9.43-b — die Makro-Surface ist
glatt; die Wasserfall-Re-Verankerung gegen die echte Voxel-Surface ist V9.43-c (§7).

### V9.43-c — Flüsse + Seen werden sichtbar (Rendering) ✅ (21.05.2026)
Phase 6: `_buildHydrosphereMeshes()` rendert See-Planes (zur Senke geformt) + Fluss-
Ribbon-Meshes (Breite ∝ √A, `uFlowDir` = Gefälle-Tangente). Wasserfälle re-verankert:
eine V9.43-a-Plane an jedem Fluss-Klippen-Kreuz, mit Fluss oben + Becken unten. Der
per-Chunk-Zufalls-Wasserfall-Spawner wird abgelöst. Alle Wasser-Geometrien teilen die
V9.43-a-Material-Familie.
*Test-Invarianten*: Fluss-Ribbon-Breite wächst stromab; See-Plane sitzt auf Füll-Höhe;
Wasserfall-Plane sitzt an einem Fluss-Klippen-Kreuz (nicht per-Chunk-Zufall); alle
Wasser-Meshes nutzen die geteilte Material-Familie. *~1-2 Sessions.*

**Geliefert (V9.43-c)**: `_buildHydrosphereMeshes()` als Orchestrator + `_buildLakeMesh`
(ein Quad je See-Zelle, `lake.level`), `_buildRiverRibbon` (Quad-Streifen, Höhe geglättet
+ strikt fallend an `_voxelSurfaceY`), `_buildHydroWaterfall` (V9.43-a-Plane + -Material),
`_disposeHydrosphereMeshes`, `_ensureHydroSurfaceMaterial`, `_hydroSampleRiverSurfaces`.
17 Invarianten grün. **Eine Material-Wahl-Verfeinerung gegenüber dem Plan**: §7 nannte
einen `uFlowDir`-Uniform; ein gebogener Fluss hat aber je Polylinie-Knick eine andere
Tangente — ein einzelner Uniform könnte das nicht. Lösung: der Flow lebt in einem
per-Vertex-`aFlow`-Attribut (See-Vertex `(0,0)` = still, Fluss-Vertex = Gefälle-Tangente)
→ EIN Material für See + Fluss. `waterfallSlope` 0.55→0.4 gegen die echte Voxel-Surface
getunt (V9.43-b mass die glatte Makro-Surface, fand 0; die steilste Stelle ist 0.53).
Ergebnis: 12 See-Planes, 6 Fluss-Ribbons, 2 Wasserfall-Planes.

**Ehrlicher Befund (V9.43-c-Browser-Verifikation)**: das Wasser rendert sichtbar — die
Seen sind große, klare Wasser-Flächen. ABER: das V9.43-b-Drainage-Netz dieser Welt ist
**see-dominant** — 12 Seen (~20 % der Region, der größte ~1259 Zellen ≈ 570 m), die
Flüsse sind 32-48-m-Verbinder (längster 3 Punkte, Σ 14 Punkte). Die Basin-Topographie der
ridged-Makro-Surface staut das Wasser zu Seen; jeder See zerstückelt die Drainage (ein
Fluss endet an jedem See). Eine niedrigere Fluss-Schwelle / ein höheres `minLakeCells`
heilte es NICHT (gemessen — die 12 Seen sind echte grosse Becken). **Das ist eine
Netz-Qualitäts-Frage, kein Render-Bug** — V9.43-c rendert das Netz ehrlich. Heilung
(eigene Welle, siehe §10): Flüsse durch Seen hindurchführen als EINE Polylinie, ODER
eine weniger Basin-y hydrologische Surface.

**V9.43-c.2 — das Wasser wird synergetisch (Folge-Schnitt, 21.05.2026)**: Schöpfer-
Browser-Test der V9.43-c — „die Seen und Flüsse scheinen eine Fläche ein paar Meter über
dem Meer zu sein, nicht synergetisch mit dem bestehenden Wasser". Eine Höhen-Messung
trennte Bug von Hydrologie (Meer y=4.8, Seen y=5–14): Seen ÜBER dem Meer sind korrekt
(aufgesetzte Wasserkörper), aber zwei echte Bugs: (1) ein Meer-Mündungs-Fluss endete bis
2 m über der Meeresoberfläche — `_buildRiverRibbon` bekommt jetzt ein `mouthY` und blendet
die Ribbon-Höhe über die letzten ~40 % auf den Mündungs-Wasserspiegel (`waterLevel` bzw.
den Ziel-See-Level); der Fluss fließt sichtbar INS Wasser. (2) man konnte in Seen nicht
schwimmen — `_hydroWaterLevelAt(x,z)` liefert den effektiven Wasserspiegel (See-Level über
einer See-Zelle, sonst `waterLevel`), die Schwimm-Physik in `_loopPhysicsSync` nutzt ihn →
Seen sind schwimm-/tauchbar wie das Meer. Was V9.43-c.2 NICHT heilt: die Seen liegen
weiter über dem Meer (Hydrologie) und wirken als flache Sheets statt als Wasser in
gemuldeten Becken — das ist die un-gecarvte Surface, V9.43-d carvt die Becken-Furchen.

### V9.43-d — Die Flüsse carven echte Betten ✅ (21.05.2026)
Phase 7: `_terrainDensityAt` fragt die Hydrosphäre, senkt die Dichte im Fluss-Kanal +
in See-Senken. Spatial-Index (`riverBuckets`). Worldgen-Ordnung verdrahtet. Das Wasser
liegt jetzt in einer echten Rinne mit Ufern.
*Test-Invarianten*: ein Sample auf der Fluss-Mittellinie hat eine tiefere Surface als
die un-gecarvte Basis; das Fluss-Bett liegt unter den Ufern; der Carve ist während der
Hydrosphären-Berechnung übersprungen (kein Zirkel); eine Welt ohne Hydrosphäre ist
bit-identisch zu heute. *~1 Session.*

**Geliefert (V9.43-d)**: `_hydrosphereCarveAt(x, z)` (der Carve-Term) +
`_hydroBuildCarveIndex` (Bucket-Grid + See-Cut-Feld, gebaut in `_computeHydrosphere`).
14 Invarianten grün, 3000 → 3014, Carve-Perf 50k Aufrufe in 5 ms. Drei Plan-Abweichungen
in §8 „Geliefert" benannt (Flachboden statt U-Profil, `_hydroComputing`-Suppress-Flag
statt Reihenfolge-Trennung, `_buildRiverRibbon` re-sampelt live). Ehrliche Grenze:
gelegentliche 3D-Roughness-Crag-Inseln in grossen Seen (der Carve senkt die Makro-
Surface, die `±~12`-Roughness-Bänder bleiben) — eine spätere `carveLakeBedDepth`-Tuning-
Welle könnte sie heben.

### V9.43-e — Politur + Klang ✅ (21.05.2026)
Vision §1.4: Fluss-Rauschen + Wasserfall-Donnern als positions-abhängige Audio-Schicht
— das V9.32-Audio-Versprechen eingelöst.

**Geliefert (V9.43-e)**: `_buildHydroAudioLayer` baut zwei White-Noise-Layer in
`state.symphony.hydroAudio` — Fluss = heller Bandpass (2200 Hz, das Rauschen eines
Bachs), Wasserfall = dunkler Lowpass (520 Hz, das Donnern), beide am Master-Bus, Gain 0.
`_tickHydrosphereAudio` (aus `symphonyTick`, ~7 Hz gedrosselt) misst je Tick die
Spieler-Distanz zur nächsten Fluss-Mittellinie (`_pointSegDist2D` — Segment-Distanz,
damit der Klang gleichmäßig bleibt, wenn man dem Fluss entlanggeht statt zwischen weit
gesetzten Fluss-Punkten zu springen) und zum nächsten Wasserfall; ein quadratischer
Falloff (Fluss 42 m / Peak 0.10, Wasserfall 75 m / Peak 0.22 — er trägt weiter +
donnert) setzt das Gain-Ziel, der GainNode rampt sanft (0.2 s). 14 Invarianten grün.
**Eine Sentinel-Falle ehrlich benannt**: der erste Wurf initialisierte den Throttle-
Zeitstempel mit `0` — der erste Tick in den ersten 130 ms der AudioContext-Lebenszeit
throttelte fälschlich (der Headless-Playtest erzeugt die Symphonie frisch → `ctx.current-
Time` ≈ 0; im echten Spiel harmlos, aber der Test fing es). Fix: `-Infinity` als Sentinel
(die `CLAUDE.md`-Gotcha „Zeitstempel sind `-Infinity`, nie `0`").

**Ehrliche Rest-Naht** (kosmetisch, kein eigener Bogen): die Fluss-Mündung blendet seit
V9.43-c.2 schon sichtbar ins Meer; See-Ufer-Schaum + eine Flow-Speed-Feinabstimmung nach
Gefälle bleiben als optionale visuelle Mikro-Politur offen — die Hydrosphäre ist
funktional + sensorisch vollständig.

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
- **Naht zum Meer.** Fluss-Mündungen blenden seit V9.43-c.2 sichtbar auf `waterLevel`
  (bzw. den Ziel-See-Level) aus — der Fluss erreicht sein Wasser. Feinpolitur (Ufer-
  Schaum an der Mündung, Flow-Speed-Übergang) bleibt V9.43-e.
- **V9.43-a-Ablösung.** Der per-Chunk-Wasserfall-Spawner ist mit V9.43-c abgelöst
  (`_buildVoxelChunkWaterfalls`/`_disposeVoxelChunkWaterfalls` gelöscht). Das ist kein
  Wegwerfen — das Material + die Plane-Geometrie bleiben (von `_buildHydroWaterfall`
  reuset); nur die Spawn-Quelle wanderte vom Zufall zum Fluss-Netz. Ehrlich benannt.
- **Kurze Flüsse — die offene Netz-Qualitäts-Frage (V9.43-c-Befund).** Das Drainage-Netz
  der Test-Welt ist see-dominant: 12 Seen, die Flüsse sind 32-48-m-Verbinder. Wurzel: die
  ridged-Makro-Surface ist basin-y → das Priority-Flood füllt grosse Becken → die Seen
  zerstückeln die Drainage (`_hydroExtractRivers` endet einen Fluss an jedem See). Der
  Vision-Wunsch („Flüsse, die die Hänge runterfliessen") braucht lange, frei fließende
  Flüsse. Heilungs-Optionen (eine eigene Welle, NICHT V9.43-c-Render-Scope): (a) ein Fluss
  fließt durch einen See HINDURCH als eine logische Polylinie (BFS vom Zufluss zum
  Überlauf durch die See-Zellen); (b) eine glattere, weniger Basin-y hydrologische
  Surface fürs Routing; (c) hydraulische Erosion, die Täler carvt (gross). Bewusst der
  Render-Welle V9.43-c nicht aufgebürdet — V9.43-c rendert das Netz, das V9.43-b liefert.

---

## 11. Vision-Pfeiler-Check

- **§1.3 fraktal** ✅ — eine Wasser-Sprache (ein Shader + `uFlowDir`) regelt Meer, See,
  Fluss, Wasserfall. Dasselbe Welt-Feld (`worldFieldAt.lebendig`), das regelt was wo
  wächst, speist optional die Drainage-Gewichte.
- **§1.4 multisensorisch** ✅ — V9.43-e: man hört, wo Wasser fließt — Bach-Rauschen
  (heller Bandpass) + Wasserfall-Donnern (dunkler Lowpass), positions-moduliert.
- **§3 Welt-Atmen** ✅ — die Welt hat einen Wasser-Kreis; das Wasser fließt, wie in der
  echten Natur.
- **Heilige Lektion** ✅ — EIN neues Subsystem (`_computeHydrosphere` + ein Carve-Term +
  Render-Meshes), deterministisch + gut fundiert. Kein Re-Komplexifizieren — ein
  Wachstumsring auf dem Voxel-Stamm.

**Stand**: V9.43-b/c/c.2/d/e sind gebaut — der Hydrosphären-Bogen (Atlas → Rendering →
Synergie → Carven → Klang) ist abgeschlossen, das Wasser-Ultiversum V9.43 vollständig.
Offen nur die kosmetische Rest-Naht (See-Ufer-Schaum, Flow-Speed nach Gefälle — §9
V9.43-e) + die Netz-Qualitäts-Frage (kurze, see-zerstückelte Flüsse — §10) als eigene Welle.
