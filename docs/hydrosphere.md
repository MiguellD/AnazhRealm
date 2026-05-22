# Das Wasser-Ultiversum — Hydrosphären-Design (V9.43)

**Stand**: 22.05.2026 — **V9.43-b ✅ + V9.43-c ✅ + V9.43-c.2 ✅ + V9.43-d ✅ + V9.43-e ✅ gebaut** (der
Hydrosphären-Atlas, das Rendering, die Synergie mit dem Meer, das Carven echter Betten,
der Klang; siehe §8 + §9). **V9.45-b** löste danach den See-Carve ab — die Seebecken sind
jetzt flach gesculptete, wasserdichte Töpfe (`_hydrosphereLakeAt` statt des V9.43-d-
`lakeCutCell`-Schnitts; siehe §8). **V9.46** heilte die kurzen Flüsse — sie fliessen jetzt
durch Seen HINDURCH (§10a; längster Fluss 45 m → 1361 m). **V9.47** formt das Gelände
via fluviale Stream-Power-Erosion um — dendritische Täler, halbierte See-Fläche, die
Gipfel erhalten (§10b). **V9.48** schloss die zwei kosmetischen Politur-Reste —
See-Ufer-Schaum + Flow-Speed nach Gefälle (§9). Schöpfer-Wahl war: **volles
Drainage-Netz mit echten Fluss-Betten**. Dieses Dokument ist die ausführliche Planung des
Wasser-Systems — der Profi-Weg, ehrlich in Phasen geschnitten. **V9.49 ist gebaut**:
das vereinte Wasser-System (Architektur-Bogen) — Wasser wurde ein Feld statt N Körper;
voller Entwurf, die Lernschlüsse + das Geliefert-Protokoll in **§12**. Offen davor blieb die tiefere Netz-
CHARAKTERISTIK-Frage (die Welt ist see-dominant — §10b). Die kanonische Versions-
Chronik lebt in `docs/handover.md`; der Wellen-Plan im Überblick in `docs/roadmap.md` §3.
Dieses Doc ist die *Tiefe* — Algorithmus, Datenstrukturen, Risiken.

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
Gefälle blieben als optionale visuelle Mikro-Politur offen — ✅ **V9.48 geschlossen**
(siehe unten). Die Hydrosphäre ist funktional + sensorisch vollständig.

### V9.48 — kosmetische Politur ✅ (22.05.2026)
Die zwei seit V9.43-e benannten Mikro-Politur-Reste, geschlossen — kein eigener Bogen,
eine Nicety.

**(1) See-Ufer-Schaum.** `_lakeShoreFoamField` baut per Multi-Source-BFS ein Zell-
Distanz-Feld: die Ring-Zellen (gedeckt, aber keine echte See-Zelle — sie liegen unter
dem ansteigenden Ufer) sind die Distanz-0-Quellen, die Distanz wächst ins Becken hinein,
ein Schaum-Wert ∈ [0,1] fällt mit der Distanz (`1.3 − d·0.5`, geclamped). `_buildLakeMesh`
mittelt das Zell-Feld auf die Quad-Ecken (jede Ecke teilt bis zu 4 Zellen → ein weiches
Band statt einer Zell-Treppe) und schreibt es ins neue `aShore`-Vertex-Attribut. Der
Shader rendert in seinem Stilles-Wasser-Zweig ein wellen-pulsierendes Schaum-Band:
animiertes Welt-Raum-Noise × einem langsamen `sin`-Lap-Puls, auf das `aShore`-Band
(`smoothstep`) geclamped.

**(2) Flow-Speed nach Gefälle.** `_buildRiverRibbon` rechnet je Fluss-Punkt das mittlere
Gefälle (aus dem geglätteten strikt-fallenden `ry` und der kumulativen Horizontaldistanz
`cum`) in einen Speed-Faktor ∈ [0.55, 2.2] (`0.55 + slope·3.2`, geclamped). Der Faktor
reist im **Betrag** des `aFlow`-Vektors — kein neues Attribut nötig: der Shader liest
`length(aFlow)` als Speed (`scroll = uTime · uFlowSpeed · fmag`), `aFlow/length` als
Richtung. Ein steiles Segment scrollt den Schaum sichtbar schneller als ein flacher Lauf.

**Geteilte-Material-Disziplin**: `_ensureHydroSurfaceMaterial` speist See-Plane UND
Fluss-Ribbon. Das `aShore`-Attribut sitzt auf beiden — am Ribbon explizit 0 (Ufer-Schaum
nur am See) — sonst läse der ShaderMaterial bei der einen Geometrie Müll. 9 Invarianten
grün, Audit-Strict 0 Failures.

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
  (bzw. den Ziel-See-Level) aus — der Fluss erreicht sein Wasser. Die Feinpolitur
  (See-Ufer-Schaum, Flow-Speed nach Gefälle) ist mit V9.48 geschlossen — siehe §9.
- **V9.43-a-Ablösung.** Der per-Chunk-Wasserfall-Spawner ist mit V9.43-c abgelöst
  (`_buildVoxelChunkWaterfalls`/`_disposeVoxelChunkWaterfalls` gelöscht). Das ist kein
  Wegwerfen — das Material + die Plane-Geometrie bleiben (von `_buildHydroWaterfall`
  reuset); nur die Spawn-Quelle wanderte vom Zufall zum Fluss-Netz. Ehrlich benannt.
- **(a) Netz-VERBINDUNG — ✅ V9.46 geheilt.** Befund (V9.43-c, gemessen): das Netz war
  see-zerstückelt — 6 Flüsse, längster 45 m, 4 von 6 endeten an einem See, weil
  `_hydroExtractRivers` einen Fluss an JEDER See-Zelle beendete. Heilung V9.46: ein Fluss
  fliesst durch einen See HINDURCH als EINE logische Polylinie. Kein BFS nötig — der
  Walk folgt schlicht `flowTo` durch die See-Zellen (das Priority-Flood-ε legt selbst im
  Becken ein Mini-Gefälle → `flowTo` routet zum Überlauf). Ein „Conduit" ist jede
  Durchfluss-Zelle, OB See oder nicht; die Quell-Suche bleibt aber LAND-only (`isLand-
  Conduit`) — sonst spawnt das fein verzweigte ε-Flow-Tree eines Beckens Geister-Quellen.
  See-Punkte tragen `inLake`: der Renderer überspringt ihre Ribbon-Quads, der Carve lässt
  sie aus. Ergebnis: längster Fluss 45 m → 1361 m, alle münden ins Meer.
- **(b) Netz-CHARAKTERISTIK — ✅ V9.47 (fluviale Erosion).** Befund: die Welt war
  see-dominant, die Becken 12-20 m tief (echte Topographie — kein Blur-Trick hilft).
  Heilung: fluviale **Stream-Power-Inzision** (`_computeErosion`, Braun & Willett /
  Fastscape — das geomorphologische Standard-Modell). 36 Iterationen ko-evolvieren
  Terrain + Drainage: je Iteration Priority-Flood → Flow-Accumulation → Inzision
  `Δh = k·A^m·S^n`, NUR in Kanälen (`accum ≥ channelMinArea`). Grate (A≈1) bleiben
  unberührt — die scharfen Gipfel überleben, das Relief wächst. Ein erster Tröpfchen-
  Erosions-Versuch hatte einen harten Zielkonflikt (Blanket-Erosion: entwässern ⟺
  Gipfel abtragen); Stream-Power mit der Kanal-Schwelle hat ihn nicht. Ergebnis:
  Gipfel exakt erhalten, See-Fläche halbiert, dendritische Tal-Netze gecarvt, Flüsse
  länger + offener. Ehrliche Rest-Grenze: die Inzision carvt einen Kanal DURCH ein
  breites Becken, leert es aber nicht restlos (der Becken-Boden bleibt ein kleinerer
  See — geomorphologisch korrekt). Volle Begründung: die `handover.md`-V9.47-Chronik.

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
V9.46 heilte die Netz-VERBINDUNG (§10a), V9.47 die Netz-CHARAKTERISTIK (§10b), V9.48
schloss die kosmetische Rest-Naht (See-Ufer-Schaum, Flow-Speed nach Gefälle — §9). Der
Wasser-Bogen ist damit funktional + sensorisch + kosmetisch vollständig; offen die in
§10b benannte Becken-Restleerung als optionaler Schritt — und, als der nächste echte
Schnitt, die **Render-Architektur**: vier getrennte Wasser-Meshes werden ein Feld
(§12, V9.49).

---

## 12. Das vereinte Wasser-System (V9.49) — Wasser ist ein Feld, kein Körper

**Stand**: gebaut V9.49-a/b/c (22.05.2026), playtest-grün; der Schöpfer-Browser-Audit
steht aus (wie bei jeder Wasser-Welle). Schöpfer-Browser-Befund nach V9.48: das Wasser
„schliesst nicht" — Meer, Seen, Flüsse, Wasserfälle wirken als gestapelte, durchscheinende
Sheets, nicht als *ein* Wasserkörper. V9.48 hat Schaum + Flow poliert; die Wurzel liegt
tiefer. Schöpfer-Wort: *„was wird mit Begeisterung betrachtet, welches ist weitsichtig
die bessere, sauberere Lösung, was erfüllt die Vision?"* Das Geliefert-Protokoll +
die ehrliche Plan-Abweichung stehen unten in §12.10.

### 12.1 Der Befund — die alte Architektur

Heute sind es vier getrennte Render-Schichten:

- die globale 900×900-Gerstner-Meeres-Plane (V8.30), die der Kamera folgt;
- N See-Planes (`_buildLakeMesh`, eine je See);
- N Fluss-Ribbons (`_buildRiverRibbon`, dünne Quad-Streifen je Polylinie);
- N Wasserfall-Planes (V9.43-a, vertikal).

Alle transparent mit `depthWrite:false` → sie scheinen durcheinander. Sie dürfen sich per
Vertrag nicht überlappen (`bedY ≥ waterLevel`, §8) — ein Vertrag IST eine Naht, die reissen
kann. Folge-Bugs ehrlich benannt: ein absorbierter See > ~450 m vom Ursprung rendert
trocken (die Meeres-Plane folgt der Kamera nur 900 m weit, ein ferner See hat keine eigene
Plane mehr). Das ist „globale Platte + Ausnahmen".

Eine Naht-Politur (depthWrite an, Y-Abgleich an den Mündungen) wäre Symptom-Heilung —
Roadmap-Lehre 1 (V9.40): „eine Symptom-Heilung wird in einer späteren Welle Schuld."
Und V9.47-Lehre: „wenn ein Verfahren einen harten Zielkonflikt hat, ist das *Verfahren*
falsch, nicht die Parameter." Der Zielkonflikt „N durchscheinende Sheets schliessen nie
sauber" ist das falsche Verfahren — Wasser als Körper.

### 12.2 Die Wurzel-Einsicht — `filled` IST schon das eine Feld

Die Hydrosphäre rechnet im Priority-Flood (§5 Phase 2) ein `filled`-Feld: die Flut-
Oberfläche je Zelle. Das ist **per Konstruktion EINE kontinuierliche Höhen-Funktion** über
die ganze Region — sie fällt sanft entlang eines Flusses, ist flach über einem See, liegt
bei `waterLevel` im Ozean. Priority-Flood erzeugt eine *zusammenhängende* Flut-Fläche; ein
Fluss, der in einen See mündet, hat dort `filled` = See-Level (er flutet hinein), am
Auslass fällt `filled` weiter. Fluss, See, Meer sind nicht drei Geometrien — sie sind
*dieses eine Feld an drei Punkten des Gefälles*. Das ist §1.1 wörtlich.

Heute wirft `_computeHydrosphere` das `filled`-Feld nach der Netz-Extraktion weg. V9.49
hebt es: Wasser wird als **ein Feld** modelliert, nicht als N Körper.

### 12.3 Das vereinte Wasser-Mesh

Ein einziges, spieler-folgendes Höhenfeld-Mesh ersetzt die Meeres-Plane + alle See-Planes
+ alle Fluss-Ribbons:

- **Geometrie**: ein Raster (~384 m Kantenlänge, ~3 m Zelle → ~128²), das der Kamera
  folgt — auf das Zell-Raster gesnappt (sonst kriechen die Sample-Punkte → Flimmern). Das
  Meeres-Plane-Muster (folgt schon der Kamera) ist erprobt. `fogFar` ist 150 m, die halbe
  Mesh-Kante ~192 m → der Mesh-Rand liegt im Voll-Nebel, unsichtbar. Darum genügt ein
  spieler-folgendes Mesh — kein 2-km-Region-Mesh (das wäre bei flussfähiger ~2-3-m-
  Auflösung Millionen Vertices).
- **Je Vertex zwei Abfragen**: die Flut-Höhe `Wy = bilinear(filled, x, z)` und das
  gecarvte Gelände `Ty(x,z)`. Nass ⟺ `Wy − Ty > ε`. Nasse Zellen emittieren ein Quad auf
  `Wy`, trockene werden ausgelassen → das Mesh trägt nur Wasser. Beide Abfragen sind
  billig (O(1)-Bilinear + Makro-Surface ein paar Noise-Calls) → der Rebuild bei jeder
  Zell-Kreuzung des Spielers kostet nichts. **Kein** `_voxelSurfaceY`-Vollscan.
- **Der Fluss folgt seinem Bett**: die Fluss-Zellen kommen aus dem `riverBuckets`-
  Polylinien-Index (fein, mäandernd — Distanz ≤ halbe Fluss-Breite). Die Oberfläche eines
  Fluss-Vertex ist `terrainY` (das Makro-Gelände), NICHT `filled` — fliessendes Wasser
  hugt den Hang, sonst schwebt es an steilen Stellen (der Priority-Flood hält `filled`
  fast flach, V9.49-d). Der V9.43-d-Carve hat die echte Rinne in hydraulischer √A-Breite
  gegraben; das Wasser bei `terrainY` füllt sie. Kein 16-m-Klotz-Fluss, keine Ribbon-Naht.
- **Keine Nähte mehr**: ein Höhenfeld kann sich nicht selbst überlappen. Das „Sheets
  übereinander" ist *strukturell* weg — nicht mit depthWrite überdeckt.
- **Der ferne See rendert**: das Mesh ist feld-getrieben und folgt dem Spieler — wo immer
  er steht, deckt es das Wasser im Sicht-Radius. Der absorbierter-See-Bug ist behoben.

### 12.4 Ein Shader

Der vereinte Wasser-Shader trägt alle Skalen, pro-Vertex moduliert über Attribute —
§1.3 fraktal, wörtlich:

- **Gerstner-Wellen** (Ozean) — die V8.30-Wellen wandern in diesen Shader. Ein `aWave`-
  Attribut (1 auf offenem Ozean, weich auf 0 am Ufer/See) verhindert einen Riss an der
  Küste, wo ein wellender Ozean-Vertex an einen ruhigen See-Vertex grenzt.
- **Still-Schimmer** (See) — `aWave ≈ 0`, der bestehende Stilles-Wasser-Zweig.
- **Flow-Schaum** (Kanal) — das `aFlow`-Attribut (V9.43-c) trägt die Gefälle-Tangente,
  V9.48 ihren Speed im Betrag; unverändert übernommen.
- **Ufer-Schaum** — im Feld ist „Ufer" einfach `Wassertiefe ≈ 0` (`Wy − Ty` klein). Der
  V9.48-`_lakeShoreFoamField`-BFS wird damit überflüssig: der Schaum wird *tiefen-
  getrieben*, je Vertex, glatt. Das ist kein verlorenes V9.48 — die Architektur leistet
  jetzt gratis, was die Politur von Hand tat. Genau das ist der Lernschluss: die V9.48-
  Politur war richtig, sie hat nur die kaputte Architektur sichtbar gemacht.

### 12.5 Die eine ehrliche Ausnahme — der Wasserfall

Ein Höhenfeld kann nichts Vertikales darstellen. Der Wasserfall bleibt eine vertikale
Plane (V9.43-a) — das ist kein Schummeln: ein Wasserfall ist Wasser im *freien Fall*, ein
anderer Zustand der Bewegung, keine Pfütze. Er bekommt `depthWrite:true` + sauberen
Anschluss ans Feld oben (Kanal-Kante) und unten (Becken-Oberfläche). Er ist nicht eine
„Ausnahme" im Sinne von „globale Platte + Ausnahmen" — er ist der eine Punkt des
Gefälles, an dem das Wasser die Fläche verlässt; das ist §1.1, nicht ein Bruch davon.

### 12.6 Was die Physik NICHT anfasst

`state.waterLevel` (Skalar) + `_hydroWaterLevelAt` (Auftrieb, §V9.43-c.2) lesen Daten,
kein Mesh. Schwimmen/Tauchen bleiben unverändert. Der Blast-Radius ist Rendering + die
`_applyDayNightToScene`-Wasser-Uniforms (auf das vereinte Material umgehängt) + ~4
Playtest-Invarianten (`_buildWaterPlane`-Existenz/-Höhe). Bewusst eng.

### 12.7 Datenstruktur — das Feld auf `state.hydrosphere`

`_computeHydrosphere` legt nach der Netz-Extraktion zusätzlich ab:

```
state.hydrosphere.water = {
  waterY:    Float32Array(dim*dim),  // flacher Spiegel je Wasser-Körper (Ozean/See)
  waterKind: Uint8Array(dim*dim),    // 0 Land · 1 Ozean · 2 See
}
```

Aus `ctx` der bestehenden Berechnung: `waterKind` aus `isOcean`/`lakeOf`, `waterY` als
flacher Spiegel je Körper (Ozean → `waterLevel`, See → `lake.level`; eine trockene Zelle
trägt den Meeresspiegel-Default). Rein deterministisch, headless-prüfbar — wie das ganze
restliche Hydrosphären-Feld nicht im Save persistiert. **V9.49-d hatte hier zusätzlich
ein `terrainY`-Feld** (Makro-Gelände, für die Fluss-Vertices); V9.49-e hat es wieder
entfernt — der Fluss liest sein Bett live aus `_terrainMacroSurfaceY` minus der
Carve-Tiefe, das Feld trägt nur noch `waterY` + `waterKind` (§13.10).

### 12.8 Die Wellen-Schneidung

| Sub-Welle | Inhalt |
|---|---|
| **V9.49-a** | Das Wasser-Feld (`state.hydrosphere.water`) — reine Daten, headless-prüfbar. |
| **V9.49-b** | `_buildUnifiedWaterMesh` — das spieler-folgende Höhenfeld-Mesh; ersetzt `_buildLakeMesh` + `_buildRiverRibbon` + die Gerstner-Meeres-Plane (`_buildWaterPlane` bleibt der Einstieg: setzt `waterLevel`, baut dann das vereinte Mesh). `depthWrite:true`. |
| **V9.49-c** | Der vereinte Shader (Gerstner/Schimmer/Flow/Ufer-Schaum) + Wasserfall-Anschluss. |

### 12.9 Vision-Pfeiler-Check

- **§1.1 / §1.3 fraktal** — der Fluss IST das Feld, das in einen Kanal taucht; „dieselbe
  Materie an verschiedenen Punkten des Gefälles" wird in der Geometrie wörtlich. Ein
  Mesh, ein Shader, ein Feld — über alle Wasser-Skalen.
- **Heilige Lektion** — drei Bau-Funktionen werden EINE; kein neues Modul, keine neue
  Abstraktion. Konsolidierung, nicht Re-Komplexifizierung. Weniger Stamm.
- **Roadmap-Lehre 3 (V9.43)** — „Vereinheitlichung ist Vision-Arbeit, nicht Cosmetik."
  V9.49 ist genau das: ein Browser-Audit fand, was 3000 headless-Invarianten nie fingen.
- **Roadmap-Lehre 1 + V9.47-Lehre** — nicht die Naht polieren (Symptom), das Verfahren
  wechseln (Wurzel). Das Feld IST der Verfahrens-Wechsel.

### 12.10 Geliefert (V9.49-a/b/c) — und die ehrliche Plan-Abweichung

Gebaut in drei playtest-grünen Sub-Wellen, netto **−117 Zeilen** (vier Bau-Pfade →
einer — Konsolidierung, nicht Re-Komplexifizierung):

- **V9.49-a** — `_hydroBuildWaterField` legt `state.hydrosphere.water = {waterY,
  waterKind}` ab. +4 Invarianten; das Feld deckt sich EXAKT mit den Netz-Extraktions-
  Zählern (5403 Ozean + 1489 See).
- **V9.49-b** — `_buildUnifiedWaterMesh` / `_buildUnifiedWaterGeometry` /
  `_tickUnifiedWater` / `_unifiedNearestRiverSeg`; `_buildLakeMesh`, `_buildRiverRibbon`,
  `_lakeShoreFoamField` + der alte Gerstner-Plane-Block gelöscht.
- **V9.49-c** — `_ensureHydroSurfaceMaterial` mit Gerstner + `aWave`/`aShore`,
  `depthWrite:true`.

**Die ehrliche Plan-Abweichung** (V9.43-Disziplin — „an der echten Messung erzwungen"):
§12.3 entwarf das Nass-Kriterium als `bilinear(filled) > Ty` mit `Ty` = gecarvtes
Gelände. Die Implementierung nutzt KEINEN `Ty`-Vergleich — Ozean/See kommen aus
`waterKind`, die Fluss-Zellen aus dem `riverBuckets`-Polylinien-Index (`_unifiedNearest-
RiverSeg`, Distanz ≤ halbe Fluss-Breite). **Grund**: eine billige, exakte „gecarvtes
Gelände"-Funktion existiert nicht — der Carve ist eine Dichte-Modulation in
`_terrainDensityAt`, und `_voxelSurfaceY` für ~16 000 Vertices je Mesh-Rebuild (alle
3 m Spieler-Bewegung) wäre Sekunden statt Millisekunden. Das Ergebnis ist gleichwertig:
die Fluss-Breite kommt aus derselben Polylinie, die auch der Carve nutzt; die Wasser-
Oberfläche aus dem Feld (`waterY` = `filled`). Ein Mesh, ein Shader, kein Stapeln —
das Vision-Ziel ist erreicht, nur der Weg zur Fluss-Maske ist ein anderer als skizziert.

**V9.49-d — erster Browser-Audit (Schöpfer, 22.05.2026).** Befund: „deutlich besser",
aber an steilen Stellen schwebt die Fluss-Oberfläche/-kante in der Luft statt am Terrain.
Wurzel: ein Fluss-Vertex sass auf `waterY` (= `filled`, der fast flachen Flut-Oberfläche
— der Priority-Flood erlaubt nur ε-Gefälle je Zelle). An einem steilen Hang fällt das
Gelände schnell, `filled` nicht → die Wasserfläche schwebt. Fix: `_hydroBuildWaterField`
hebt zusätzlich `terrainY` (das Makro-Gelände); `_buildUnifiedWaterGeometry` setzt
See/Ozean-Vertices auf `waterY` (flach gepoolt), Fluss-Vertices + den trockenen
Dilatations-Ring auf `terrainY` → der Fluss folgt dem Hang, die Ufer-Kante taucht ins
Terrain. +1 Invariante (`waterY ≥ terrainY`). Das ist exakt, was das alte Fluss-Ribbon
mit `_voxelSurfaceY` tat — nur feld-getrieben + billig. Ein zweiter Audit-Befund → V9.49-e.

---

## 13. V9.49-e — die Naht schliessen: das Wasser taucht, das Land schneidet

**Stand**: geplant (22.05.2026), noch kein Code. Auslösung ist der zweite Schöpfer-
Browser-Audit — „das Wasser, das Ufer, der Flusslauf teils in der Luft und
unnatürlich; ein Flickenteppich?". Dieser Abschnitt ist die Wurzel-Antwort — und der
bewusste Verzicht auf eine fünfte Naht-Politur.

### 13.1 Der Befund — zwei Gelände-Wahrheiten, die sich nie versöhnen

V9.49 hat die vier Wasser-Schichten zu einem Feld vereint — die richtige, vision-treue
Idee. Der Rest-Fehler ist NICHT das Feld, sondern seine Datenquelle. Der Stamm trägt
zwei Gelände-Wahrheiten:

- **das gerenderte Voxel-Gelände** (`_voxelSurfaceY` / `_terrainDensityAt`): Makro-
  Surface + zwei 3D-Roughness-Bänder (`noise3D·7 + noise3D·5`, zusammen ±12 m Crags) +
  der Fluss-Carve + der See-Topf-Blend + Spieler-Edits;
- **das Hydrosphären-Raster** (`_hydroInit`): 128² Zellen à 16 m, gesampelt aus
  `_terrainMacroSurfaceY` OHNE Detail-Oktave und OHNE die 3D-Roughness, dann 3×3 verwischt.

Das vereinte Mesh interpoliert das 16-m-Raster bilinear auf sein 3-m-Gitter — es trägt
3-m-Auflösung, aber 16-m-Daten, und diese Daten beschreiben ein glatteres, ANDERES
Gelände als das gemeshte. V9.49-d versuchte, die trockenen Ufer-/Fluss-Vertices auf
dieses Makro-Gelände (`terrainY`) zu legen, damit sie das Terrain „küssen". Diese
Koinzidenz KANN nicht halten — die zwei Wahrheiten driften per Konstruktion um bis zu
±12 m. Das IST die Naht; jedes „in der Luft" ist sie. V9.43-d (Carve), V9.45-b (See-
Topf), V9.49-d (`terrainY`-Sprung), der Dilatations-Ring — vier Anläufe an DERSELBEN
Naht. Roadmap-Lehre 1 + V9.47-Lehre: hat ein Verfahren einen harten Konflikt, ist das
*Verfahren* falsch, nicht der Parameter. Das Verfahren „die Wasser-Kante soll die
Terrain-Kante treffen" IST der Konflikt.

### 13.2 Wie es die Vorbilder tun — das Wasser berührt die Uferlinie nie

Die professionelle Wasser-Darstellung (Sea of Thieves, Witcher 3, jede gute Engine-
Wasser-Pipeline) löst die Uferlinie NICHT, indem das Wasser-Mesh an genau der richtigen
Stelle endet. Sie lösen es umgekehrt:

> Das Wasser ist eine simple Fläche, die UNTER das opake Gelände taucht. Das Gelände
> wird zuerst gezeichnet und schreibt Tiefe; das Wasser (transparent, danach
> gezeichnet) wird per Tiefen-Test überall dort verdeckt, wo Land davor liegt. Die
> Uferlinie ist damit der **emergente Schnitt** von Wasser-Spiegel und Gelände —
> pixelgenau, gratis, und so fein wie das Gelände-Mesh (das feine Voxel-Mesh).

Man AUTORISIERT die Wasser-Kante nie. Man lässt das Land sie schneiden. Der Ufer-Schaum
entsteht im Shader aus der Tiefen-Differenz (Wassertiefe ≈ 0 am Ufer) — V9.48 hat den
Schaum schon tiefen-getrieben pro Vertex gemacht, das passt exakt dazu.

Die Vorbedingung steht schon: `depthWrite:true` (V9.49-c) + das Wasser nach den opaken
Objekten gezeichnet (`renderOrder 1`). Es fehlt nur der eine Schritt: **aufhören, den
Rand-Vertex anzuheben.** Er bleibt auf dem Wasser-Spiegel und taucht unter das
ansteigende Land — `terrainY` für stehendes Wasser wird damit überflüssig.

### 13.3 Stehendes Wasser — die flache Platte taucht unter

Jede Ozean-/See-Zelle emittiert ein Quad auf dem flachen Spiegel ihres Wasser-Körpers
(`waterLevel` bzw. `lake.level`). Die nasse Maske wird um ~2 Zellen ins Land dilatiert;
ALLE diese Vertices — nass UND der Dilatations-Skirt — sitzen auf dem flachen Spiegel.
Das ansteigende opake Terrain verdeckt den Skirt; die Uferlinie emergiert dort, wo das
Voxel-Gelände den Spiegel kreuzt. Gelöscht: die `terrSurf`-Platzierung der trockenen
Ringe, das `terrainY`-Feld (für stehendes Wasser), die Ecken-Höhen-Logik. Netto weniger
Code — Konsolidierung, Heilige Lektion.

### 13.4 Fliessendes Wasser — das Ribbon liegt im gecarvten Trog

Ein Fluss ist nicht flach — er folgt dem Gefälle. Sein Wasser gehört in den Trog, den
`_hydrosphereCarveAt` schon gräbt (Flachboden-Profil, Tiefe `D = 1.4 + 0.16·Breite`,
je Segment in `dA`/`dB` abgelegt). Die Fluss-Vertices sitzen darum auf
`_terrainMacroSurfaceY(x,z) − D + flacheTiefe`: die Makro-Surface ist billig, `D` kommt
aus dem nächsten Fluss-Segment — `_unifiedNearestRiverSeg` liefert schon `t` + die
Breite, es bekommt zusätzlich `D`. Das Ribbon ist etwas breiter als der Kanal; die
un-gecarvten Crag-Ufer verdecken den Überstand. Der Fluss folgt so dem Bett-Gefälle und
liegt IN seiner Rinne — kein flacher Flut-Spiegel (V9.49-b), keine un-gecarvte
Makro-Oberkante (V9.49-d).

### 13.5 Warum die 16-m-Grobheit aufhört zu zählen

Sobald die Uferlinie der Terrain-Schnitt ist, braucht das 16-m-Feld nur noch zweierlei:
(a) die nasse MASKE — welcher Wasser-Körper deckt eine Zelle (grob genügt: der Skirt +
die Terrain-Verdeckung schlucken die 16-m-Zacken); (b) den SPIEGEL je Körper — ein
flacher Skalar, dessen 16-m-Abtastung exakt ist. Die Verfeinerung — die „lokale
Annäherung", die der Schöpfer benannte — leistet das feine Voxel-Gelände, indem es
schneidet. Gratis. Kein feineres Wasser-Feld nötig, kein `_voxelSurfaceY`-Vollscan
(der §12.10-Einwand entfällt — man braucht die echte Surface gar nicht, man braucht das
Land, das verdeckt).

### 13.6 Bergseen — der additive Tarn-Pass (eigene Mini-Welle)

„Flüsse ja, Bergseen nein" hat einen eigenen Grund: die Stream-Power-Erosion (V9.47)
ist ein drainage-PERFEKTIONIERENDES Verfahren — sie senkt Kanäle, füllt nie Becken,
entwässert über 36 Iterationen jedes Hochbecken. Echte Bergseen (Kar-Seen, Moränen-/
Bergsturz-Stauungen, Krater) kommen aus STÖR-Ereignissen, die geschlossene Hochmulden
hinterlassen — kein Erosions-Nebenprodukt. Man bekämpft die Erosion nicht, man ADDIERT:
ein `_hydroSeedTarns`-Pass setzt nach der Erosion ein paar kleine Gauss-Mulden an
hohen, sanft geneigten Stellen (Tief-Frequenz-Noise-Gate + Höhen-Gate + Hang-Gate). Die
Mulde fliesst als Term ins erodierte Makro-Feld → das bestehende Priority-Flood
ENTDECKT das geschlossene Becken und füllt es zum See, durch die schon gebaute
Maschinerie. Eine Wasser-Sprache: eine Mulde wird zum See, gratis. Das ist eine eigene
kleine Welle (V9.49-g), NICHT Teil der Naht-Heilung — ehrlich getrennt.

### 13.7 Die Wellen-Schneidung

| Sub-Welle | Inhalt |
|---|---|
| **V9.49-e** | Die tauchende Platte. `_buildUnifiedWaterGeometry`: der Dilatations-Skirt bleibt auf dem Wasser-Spiegel (kein `terrainY`-Sprung mehr); das Fluss-Ribbon auf `Makro − D`; `_unifiedNearestRiverSeg` um `D` erweitert. `terrainY` aus dem Wasser-Feld entfernt. depthWrite ist schon true (V9.49-c). |
| **V9.49-f** | ✅ Die Wasser-Fläche an die Terrain-Wahrheit klemmen (§13.11) — die nasse Maske liest `_terrainMacroSurfaceY`, kein Grat-Bleed mehr; `polygonOffset`. |
| **V9.49-g** | Der Tarn-Pass — Bergseen als additive Hochmulden (separat, optional). |

*Test-Invarianten V9.49-e*: kein See-/Ozean-Vertex liegt über seinem Spiegel; ein
Fluss-Vertex liegt unter der un-gecarvten Makro-Surface an seiner xz-Position; das Mesh
bleibt ein geschweisstes Höhenfeld; eine Welt ohne Hydrosphäre ist bit-identisch zu
heute; der Rebuild bleibt im Perf-Budget (kein Vollscan dazugekommen).

### 13.8 Risiken, ehrlich benannt

- **Z-Fighting an der Schnitt-Linie.** Wo Wasser-Spiegel und Terrain tiefen-gleich
  liegen, kann die Uferlinie flimmern. Üblich; ein kleiner `polygonOffset` / eine
  Tiefen-Bias am Wasser-Material heilt es — beim Browser-Audit prüfen.
- **Fluss-Crag-Leck.** Die ±12-m-Roughness kann ein Ufer lokal unter `Makro − D`
  drücken → das Ribbon quillt seitlich heraus. Die Carve-Bank-Rampe dämpft es; eine
  optionale Roughness-Dämpfung im Kanal-Band (wie der See-Topf) bleibt als Reserve.
- **Ultra-flaches Ufer.** Steigt das Terrain über den 2-Zell-Skirt nicht über den
  Spiegel, bleibt ein schmaler Wasser-Saum sichtbar — das ist echtes Flachwasser,
  korrekt, kein Bug.
- **Der Wasserfall** bleibt die vertikale Ausnahme (§12.5), unverändert.

### 13.9 Vision-Pfeiler-Check

- **§1.1 / §1.3 fraktal** — das Feld hat keine Kanten; das LAND hat Kanten. Die
  Uferlinie ist emergent, nicht autorisiert. „Wasser ist ein Feld" wird wörtlich: ein
  Feld endet nicht, es taucht.
- **Heilige Lektion** — V9.49-e LÖSCHT Code (`terrainY`-Feld, die Ecken-Höhen-Logik).
  Konsolidierung, keine Re-Komplexifizierung.
- **Roadmap-Lehre 1 + V9.47-Lehre** — nicht die Naht polieren (das wäre der fünfte
  Anlauf), das Verfahren wechseln: die Wasser-Kante wird nicht mehr autorisiert.

### 13.10 Geliefert (V9.49-e) — und die ehrliche Plan-Abweichung

Gebaut 22.05.2026, playtest-grün („Alle Invarianten OK"); der Schöpfer-Browser-Audit
steht aus (wie bei jeder Wasser-Welle). Vier Code-Stellen, netto schlanker:

- **`_hydroBuildWaterField`** legt nur noch `{waterY, waterKind}` ab — `terrainY` ist
  entfallen. `waterY` trägt den flachen Spiegel je Wasser-Körper (Ozean → `waterLevel`,
  See → `lake.level`), eine trockene Zelle den Meeresspiegel-Default.
- **`_buildUnifiedWaterGeometry`** — der trockene Rand-Skirt bleibt auf dem Spiegel
  (kein `terrainY`-Sprung mehr); ein Boundary-Quad fällt zum Meeresspiegel-Default ab
  und taucht unter das opake Ufer. Fluss-Vertices sitzen auf `_terrainMacroSurfaceY −
  0.4·D` — im gecarvten Bett, dem Gefälle folgend.
- **`_unifiedNearestRiverSeg`** liefert zusätzlich die Carve-Tiefe `D` und greift bis
  zur vollen Carve-Breite (`halfW + bankW`) — das Ribbon deckt den ganzen Kanal, die
  ansteigende Bank-Rampe verdeckt seinen Rand.
- **Playtest**: das `waterY ≥ terrainY`-Invariant (V9.49-d) ist entfallen, ersetzt
  durch „alle Ozean-Zellen teilen EINEN flachen Spiegel" — netto ±0 Invarianten.

**Die ehrliche Plan-Abweichung**: §13.3 entwarf einen ~2-Zell-Skirt, dessen Vertices
ALLE explizit auf dem Spiegel sitzen. Die Implementierung braucht keinen expliziten
Skirt-Ring: weil eine trockene Zelle im Feld den Meeresspiegel-Default trägt, fällt
jedes Boundary-Quad von selbst dorthin ab und taucht unter das ansteigende Ufer. Der
Skirt ist keine Zähl-Konstante, sondern eine Konsequenz des Defaults — einfacher als
geplant, dasselbe Ergebnis (das Quad ist verdeckt, ob es bei einem See zum Meeres-
spiegel kippt oder flach auf dem See-Level läge). Der Tarn-Pass (§13.6, V9.49-g)
bleibt offen.

### 13.11 Geliefert (V9.49-f) — die Wasser-Fläche an die Terrain-Wahrheit geklemmt

Gebaut 22.05.2026, playtest-grün. **Zweiter Schöpfer-Browser-Audit nach V9.49-e**:
„direkt auf der anderen Seite eines Hügels, wieder ein Tal — die Wasseroberfläche
durchschiesst, die andere Seite sieht unsauber aus, es ragt hervor." Befund: die nasse
Maske kam allein aus der 16-m-`waterKind`-Klassifikation plus einer blinden Dilatation
(die 4-Ecken-Abtastung weitet die nasse Region ~16 m ins Land). Über einen schmalen
Grat bleeded die flache Fläche so ins nächste Tal. §13.5 hatte gehofft, die 16-m-Maske
genüge — der Audit zeigte: die MASKE braucht die Terrain-Wahrheit (nur die HÖHE bleibt
flach).

Der Profi-Weg: **das Wasser an das submerse Gelände klemmen.** `_buildUnifiedWater-
Geometry` fragt je Vertex `_terrainMacroSurfaceY` (billig — ein paar Noise-Calls, NICHT
der `_voxelSurfaceY`-Säulen-March) und ist nass nur, wo `macroY < waterSpiegel +
RIDGE_MARGIN` (12 m, die 3D-Roughness-Amplitude — so deckt das Wasser die ganze
mögliche Ufer-Bandbreite, klemmt aber jeden Grat darüber ab). Das gilt auch fürs
Fallback-Meer ausserhalb der Region (sonst läge dort eine Platte auf trockenem
Hochland — exakt der Bug, den die neue Invariante beim ersten Wurf fing). Plus
`polygonOffset` am Wasser-Material: an einer streifenden Schnitt-Linie gewinnt jetzt
verlässlich das opake Terrain den Tiefen-Test → keine flimmernden Splitter mehr.

Ein neues Geometrie-Attribut `aWet` (1 nass, 0 trockener Skirt) — der Shader nutzt es
nicht, aber der Playtest trennt damit nasse Vertices vom Skirt (der bewusst abtaucht):
+1 Invariante (kein nasser Vertex liegt > RIDGE_MARGIN unter dem Makro-Gelände).

**Plan-Korrektur zu §13.5**: „die 16-m-Grobheit hört auf zu zählen" galt für die HÖHE
(die bleibt der flache Spiegel) — nicht für die MASKE. Eine flache Fläche, deren Rand
allein eine 16-m-Klassifikation + blinde Dilatation bestimmt, ragt über schmale Grate.
Die Maske braucht je Vertex `macroY` — das ist die „lokale Verfeinerung", die der
Schöpfer von Anfang an benannte, jetzt am rechten Ort: an der Maske, nicht der Höhe.

---

## 14. Wasser aus der Terrain-Wahrheit (V9.50) — der letzte Ring

**Stand**: geplant (22.05.2026), noch kein Code — Plan zur Durchsicht. Auslöser: der
Schöpfer-Befund nach V9.49-f — „bei Verengungen, in Bereichen die kleiner und dann
wieder grösser werden, gibt es noch Probleme … wir bewegen uns im Kreis." Der Befund
ist richtig. Dieser Abschnitt ist die Antwort — das Ende einer Bug-Klasse, nicht ihr
nächster Patch.

### 14.1 Warum V9.49-d/e/f kreiste — ehrlich

V9.49-d (Fluss schwebt), -e (Ufer schwebt), -f (Bleed über den Grat), die Verengungen —
das sind nicht vier Bugs. Es ist EIN Bug, vier Mal, auf vier Auflösungs-Ebenen: **das
Wasser wird auf einem Modell gerechnet** (16-m-Raster, Makro-Surface — glatt, grob),
**das gerenderte Terrain ist ein anderes** (Voxel, ±12-m-Crags, gecarvt). Zwei
Gelände-Wahrheiten; sie decken sich nie — an einer Verengung, wo die Voxel-Wände am
schärfsten sind, am wenigsten.

§13.1 hat genau das diagnostiziert — „zwei Gelände-Wahrheiten, die sich nie versöhnen".
Und dann hielten -e und -f BEIDE Wahrheiten. V9.49-e war als „Verfahrenswechsel"
benannt, wechselte aber nur den Render-Trick (das Wasser taucht unter); das VERFAHREN —
Wasser als getrenntes Modell — blieb. -e und -f waren Naht-Politur des neuen Verfahrens,
genau was die V9.47-Lehre verbietet. Der Kreis war: eine korrekt benannte Wurzel nicht
bis zum Schluss zu denken.

### 14.2 Das Prinzip — das Projekt kennt die Lösung schon

`CLAUDE.md`-Gesetz: **„Visual = Collision per Konstruktion — jeder Chunk hat ein
Collision-Shape aus EXAKT denselben Triangle-Indices wie seine Geometrie."** Das Terrain
hat sein Visual-vs-Collision-Problem nicht poliert — es hat beide zu DERSELBEN Geometrie
gemacht. Deckungsgleich per Konstruktion.

Das Wasser hat ein Visual-vs-Terrain-Problem. Dieselbe Kur: **das Wasser aus DERSELBEN
Quelle meshen wie das Terrain** — der Voxel-Oberfläche `_voxelSurfaceY`. Dann ist die
Uferlinie der exakte Schnitt auf der Zell-Ebene des Terrains. Schweben, Bleed,
Schnitt-Splitter, Verengungs-Bugs sind dann nicht geheilt — sie sind strukturell
unmöglich.

### 14.3 Was bleibt — bewusst eng

- **Die Hydrosphäre** (`_computeHydrosphere` — Drainage-Netz, Seen, Flüsse, Ozean-Maske,
  Carve, Erosion). Sie ist das **Wasser-Level-Feld**: WO Wasser ist + auf welcher Höhe.
  Reine Daten, deterministisch. Unangetastet.
- **Der Wasser-Shader** (`_ensureHydroSurfaceMaterial` — Gerstner/Flow/Schaum,
  welt-verankert). Je Chunk-Wasser-Mesh wiederverwendet.
- **Der Wasserfall** — die vertikale Ausnahme. Unverändert.
- **Die Auftrieb-Physik** (`_hydroWaterLevelAt`, `state.waterLevel`). Liest Daten, kein
  Mesh. Unangetastet.

V9.50 fasst NUR das Wasser-Oberflächen-MESH an.

### 14.4 Das Wasser-Level-Feld — `_waterLevelAt(x, z)`

Eine Funktion bündelt „welches Wasser deckt (x,z), auf welcher Höhe": Ozean →
`waterLevel`; See → `lake.level`; Fluss → das Fluss-Oberflächen-Profil (Bett + flache
Tiefe, entlang der Polylinie interpoliert); sonst → trocken. Ein dünner Leser über
`hydrosphere.water` + `riverBuckets`. Deterministisch, headless-prüfbar.

### 14.5 Weg B (empfohlen) — Wasser im Voxel-Chunk-Pipeline

Beim Chunk-Bau (`_ensureVoxelChunkAt`) entsteht — geschwisterlich zu
`_buildVoxelChunkGrass` — ein Wasser-Mesh DES Chunks: je Chunk-Zelle, wo
`_voxelSurfaceY(zelle) < _waterLevelAt(zelle)`, ein Quad auf `_waterLevelAt`. Die
Geometrie kommt aus DERSELBEN Voxel-Oberfläche, die der Chunk gerade gemesht hat. Das
Wasser-Mesh lebt im Chunk-`entry` (`entry.waterMesh`), `_disposeVoxelChunk` räumt es
mit. Geteiltes Shader-Material. Die Spieler-Folge fällt gratis aus dem bestehenden
Chunk-Streaming.

- **Exakt**: Wasser + Terrain teilen das Zell-Raster → die Uferlinie ist der echte
  Schnitt. Kein Schweben, kein Bleed, keine Splitter, kein Verengungs-Bug — strukturell.
- **Kein zweites Modell**: kein 16-m-Raster fürs Mesh, kein spieler-folgendes 384-m-
  Mesh, keine Dilatation, kein Clip, kein `polygonOffset`-Hack, kein `aWet`, kein
  Makro-Proxy.
- **Kosten**: ein per-Zelle-`_voxelSurfaceY`-Scan je wasser-berührtem Chunk — genau das
  Muster, das `_buildVoxelChunkGrass` schon fährt, einmal je Chunk-Leben amortisiert.
  Über die Hydrosphäre gegatet: ein Chunk ohne Ozean/See/Fluss im Fussabdruck baut KEIN
  Wasser.

### 14.6 Weg C (verworfen) — der geteilte Echt-Oberflächen-Cache

Das vereinte Mesh (V9.49) bliebe, läse aber statt Makro einen `_voxelSurfaceY`-Cache,
den die Chunk-Builds füllen. **Verworfen**: C tut dieselbe Oberflächen-Scan-Arbeit wie B
(den Cache füllen = derselbe per-Zelle-Scan), BEHÄLT aber das vereinte Mesh als
jetzt-redundante Schicht UND fügt Cache-Buchhaltung dazu — mehr Maschinerie für dieselbe
Wahrheit. Der scheinbare Vorteil „weniger invasiv, das Mesh bleibt" ist Schein: die
Clip/Dilatations/`polygonOffset`-Workarounds des Meshes waren NUR da, weil ihm die
Wahrheit fehlte — mit der Wahrheit gehören sie ohnehin gelöscht. C ist fast so viel
Änderung wie B, mit einem redundanten Mesh obendrauf. **B löscht, C behält.**

### 14.7 Was gelöscht wird

`_buildUnifiedWaterMesh`, `_buildUnifiedWaterGeometry`, `_tickUnifiedWater`,
`_unifiedNearestRiverSeg`, `state.waterPlane`, das `RIDGE_MARGIN`-Clip, das
`aWet`-Attribut, der `polygonOffset`-Hack, der 16-m-`waterY`-Mesh-Pfad. Netto deutlich
weniger Stamm. 4 Meshes (V9.43) → 1 (V9.49) → 0 getrennte Wasser-Modelle (V9.50) —
derselbe Konsolidierungs-Pfeil, ein Ring weiter.

### 14.8 Die Wellen-Schneidung

| Sub-Welle | Inhalt |
|---|---|
| **V9.50-a** | `_waterLevelAt(x,z)` — das Wasser-Level-Feld als eine Funktion. Reine Daten, headless-prüfbar. |
| **V9.50-b** | `_buildVoxelChunkWater` — das per-Chunk-Wasser-Mesh aus `_voxelSurfaceY` vs `_waterLevelAt`; in `_ensureVoxelChunkAt`/`_disposeVoxelChunk` eingehängt, über die Hydrosphäre gegatet. |
| **V9.50-c** | Das V9.49-Vereinte-Mesh + seine Workarounds löschen; die V9.49-b/e/f-Playtest-Invarianten durch Chunk-Wasser-Invarianten ersetzen. |

### 14.9 Risiken, ehrlich

- **Chunk-Bau wird schwerer.** Ein per-Zelle-Scan je Wasser-Chunk. Gemildert: nur
  wasser-berührte Chunks, amortisiert über das Chunk-Leben (wie das Gras). Im Playtest
  am Perf-Budget messen.
- **Hydrosphäre-Rebuild.** Wird die Hydrosphäre neu gerechnet (neue Welt), brauchen die
  schon gestreamten Chunks ein Wasser-Rebuild — `_buildHydrosphereMeshes` triggert es
  über die `voxelChunks`-Map.
- **Fluss über Chunk-Grenzen.** Jeder Chunk mesht seinen Anteil; `_waterLevelAt` ist
  welt-stetig, der Shader welt-verankert → die Nähte sind nahtlos (wie die
  Terrain-Chunk-Nähte). Kein Sonder-Code.
- **Wellen-Animation.** Der Shader ist welt-verankert (`position` trägt Welt-xz) →
  per-Chunk-Meshes wogen deckungsgleich. Erprobt — heute schon so.
- **Der Wasserfall** bleibt die vertikale Ausnahme.

### 14.10 Vision-Pfeiler-Check

- **§1.1 — Wasser ist ein Feld**: das Feld endet nicht; das Land schneidet es — jetzt
  aus EINER Geometrie-Wahrheit, exakt.
- **„Visual = Collision per Konstruktion"**: das Projekt-Gesetz, aufs Wasser angewandt —
  kein Abgleich, Deckung per Konstruktion.
- **Heilige Lektion**: V9.50 LÖSCHT (das getrennte Wasser-Modell). Konsolidierung,
  4 → 1 → 0.
- **V9.47-Lehre, endlich zu Ende gedacht**: nicht die Naht polieren — das Verfahren
  wechseln. Diesmal das echte Verfahren: das Wasser hört auf, ein eigenes Modell zu sein.
