# DER GOLD-STANDARD: das KONFORME Mesh (Transvoxel) — der wahre Naht-Tod

**Schöpfer-Wort (V18.371):** „das System ist deterministisch, wieso haben wir überhaupt
diese Chunk-Naht? muss man das Mesh nicht an der LOD-Grenze übernehmen und dann grob werden
wie bei einem FEM-Mesh? was ist der Profiweg? … aDepth-getriebene Amplitude an der Naht und
DANN der Goldstandard. habe Mut, sei ein Phönix."

Der Schöpfer hat den Profiweg selbst benannt: ein **konformes Mesh** (FEM-Sprache) — feine
Elemente gehen über Transitions-Elemente nahtlos in grobe über, **geteilte Knoten, keine
hängenden Knoten**. Für Marching-Cubes/Surface-Nets ist das **Transvoxel** (Eric Lengyel,
2010). Das ist die WURZEL-Heilung für ALLE Naht-Befunde (Sterne durch Berge · Bett-Naht unter
dem Wasser · der Lade-Kanten-Flicker), die wir bisher mit Geomorph + Skirt (Arme-Leute-
Transvoxel, V18.370) nur ÜBERBRÜCKT haben.

## Warum es die Naht überhaupt gibt (die ehrliche Diagnose)

**Determinismus = reproduzierbar, NICHT nahtlos.** Jeder Chunk mesht ALLEIN (Surface-Nets pro
Chunk, im Worker isoliert). Zwei Nachbarn rechnen ihre gemeinsame Kante GETRENNT. Same-LOD:
~50 % der Rand-Vertices sind float-exakt geteilt (Pad+Crop-Overlap, V9.79); die anderen 50 %
landen knapp neben der Naht-Ebene → nicht geteilt. Cross-LOD: 0 % geteilt (fundamental
verschiedene Gitter → T-Junctions). GEMESSEN `diag-chunk-seam` (auf Ring 4 geZWUNGEN):
cross-LOD roh ~24,5 % sichtbare >1-m-Spalten (max 11,57 m); der Geomorph + das Skirt-Band
schliessen die SETTLED Naht (0 ungedeckte >1-m-Spalten), aber das ist eine Brücke, kein
konformes Mesh.

## Die heilige Wand (verbindlich)

Der Iso-Mesher ist der **deterministische, worker-gespiegelte Kern**, den ALLE Chunks teilen
— der höchste Blast-Radius im Projekt. JEDE Änderung hier:
1. **Worker-Mirror 1:1** — `_voxelExtractSurfaceVertices`/`_voxelEmitQuadIndices` haben einen
   bit-identischen Zwilling in `voxel-worker.js`. Beide wandern GEMEINSAM.
2. **Determinismus-Byte-Test als Gate** — `diag-worker-chunk` (Worker == Main, maxDiff 0)
   MUSS nach jedem Schritt grün bleiben. Die Position-Attribute tragen Physik + Kollision +
   den Naht-Test → ein Vertex-Versatz ist ein Determinismus-Bruch.
3. **Headless-Verifikation pro Schritt** — `diag-chunk-seam` (same-LOD geteilte % · cross-LOD
   ungedeckte Spalten) ist die ZAHL; der LOOK (Fern-LOD, swiftshader-unmessbar) ist der
   Schöpfer-Browser. KEIN Schritt gilt ohne grüne Zahl.
4. **Kein Parallelpfad** — Transvoxel ERSETZT Geomorph+Skirt an der cross-LOD-Grenze, es liegt
   nicht daneben (sonst zwei Naht-Systeme = die Anti-Synergie-Sünde). Erst wenn Transvoxel die
   Naht trägt, fällt der Skirt.

## Der Pfad (risiko-geordnet, jeder Schritt eine grüne Zahl)

**G0 — die LINSE härten (Fundament, NULL Risiko).** `diag-chunk-seam` ist heute ein manueller
Befund. Mach daraus ein echtes Gate `npm run gate:seam` (Ring-4-erzwungen): assertiert
(a) same-LOD geteilte % ≥ Baseline, (b) cross-LOD 0 ungedeckte >1-m-Spalten. So MISST jeder
folgende Schritt sich selbst (Gesetz #0 — baue die Linse, bevor du den Mesher anfasst).

**G1 — SAME-LOD KONFORM (V18.372 ERLEDIGT — der echte Befund: es waren die NORMALEN, nicht die
Positionen).** Die Wasser-Bett-Naht (Schöpfer „die Chunknaht im Fluss, scheint direkt darunter
zu liegen") sitzt hier. Die GEMESSENE Wahrheit (neue Linse `diag-seam-normal`, an zwei Face-
Paaren): **die POSITIONEN teilen Nachbarn schon ~95–100 % bit-exakt** (nn-Median 0) — der
pad+crop-Overlap (1 Zelle) deckt den 1-Ring der geteilten Rand-Zelle, also glätten BEIDE Chunks
den Rand-Vertex mit IDENTISCHER Nachbarschaft → er konvergiert von selbst (kein Positions-Riss;
die „~50 %" der alten `gate:seam`-Metrik war ein MESS-ARTEFAKT — sie bint nach Ebenen-Abstand und
fängt die NICHT-geteilten INNEREN Verts mit ein). Der echte Riss war die **NORMALE**: an den
geteilten Rand-Verts divergierten die Normalen **bis 69° (18 % der Verts > 5°)** = eine
LICHTUNGS-Naht (gleiche Geometrie, andere Schattierung). Wurzel: der `_voxelGradientNormals`-
Trilinear liest das CHUNK-LOKALE Grid; am geteilten Rand deckt der EINE Chunk die eps-Box ab
(Trilinear), der NACHBAR läuft out-of-bounds aus und fällt auf `sample()` zurück → andere
Methode, andere Normale. **Heilung (V18.372):** in der Rand-SCHALE (≤3 Zellen vom Grid-Rand)
rechnet der Gradient den GANZEN Wert via `sample()` — eine REINE Funktion der Welt-Position →
beide Nachbarn rechnen die IDENTISCHE Normale; das Innere bleibt schneller Trilinear. Worker-
Mirror (`gradientNormals`). VERIFIZIERT: `diag-seam-normal` (x+z-Face Rand-Normalen 69°→**0.022°**,
0 Verts >1°) · `diag-worker-chunk` (maxDiff 0, bit-deterministisch) · `diag-normals` (Band-Skip
unverzerrt) · `gate:seam` (50.7 % / 0 ungedeckte Spalten, unverändert). **Der erste Phönix-Flug:
voll headless-bewiesen mit einer ZAHL, kein Fern-LOD nötig. LEHRE: die Naht war nie eine fehlende
geteilte Position — sie war eine divergierende Normale; miss die GEOMETRIE-GRÖSSE getrennt von der
SHADING-GRÖSSE, sonst heilt man das Falsche (der Positions-Freeze war ein No-op gegen ein
Nicht-Problem, verworfen).**

**G2 — CROSS-LOD Transvoxel-Transitions-Zellen (der Sterne-durch-Berge-Tod).** Der feine Chunk
erzeugt an jeder Grenze zu einem GRÖBEREN Nachbarn eine Transitions-Zell-Schicht (Lengyels
half-resolution face): die Lookup-Tabellen (regular + transition cell classes) bauen ein
wasserdichtes, hängende-Knoten-freies Mesh, das die feine Auflösung an die grobe heftet.
Determinismus-/Worker-Wand wie oben. Verifiziert `gate:seam` (cross-LOD 0 T-Junctions OHNE
Geomorph/Skirt) — dann fällt der Skirt (G3).

**G3 — Geomorph + Skirt zurückbauen.** Wenn G2 die Naht KONFORM trägt, sind `_applyCrossLodGeomorph`
+ das Stitch-Band-Skirt redundant → schneiden (kein Parallelpfad). Die Saat-Disziplin: erst
schneiden, wenn der Ersatz BEWIESEN trägt.

## Stand

- **V18.371**: die aDepth-getriebene Kräuselungs-Amplitude an der Naht geglättet (Floor + weite
  Rampe) — der Wasser-Oberflächen-Anteil des Befunds, shader-only. ERLEDIGT.
- **V18.372 — G0 + G1 ERLEDIGT (der erste Phönix-Flug):** G0 (`gate:seam`) härtet die Linse;
  G1 fand + heilte den ECHTEN same-LOD-Riss — die divergierende RAND-NORMALE (Lichtungs-Naht,
  69°→0.022°), NICHT die Position (die teilt schon ~95–100 %). Die Heilung ist die konforme
  Rand-Schalen-Normale (`sample()`-Gradient = reine Funktion der Welt-Position), worker-gespiegelt,
  bit-deterministisch (`diag-worker-chunk` maxDiff 0), gegated (`gate:seam-normal`, im per-push-CI).
  Der ursprünglich geplante Positions-Freeze war ein No-op gegen ein Nicht-Problem → verworfen.
- **G2 (cross-LOD) — die ehrliche Profi-Wertung, NICHT vertagt aus Angst:** der Cross-LOD-Rand ist
  HEUTE SCHON konform an 0 ungedeckten >1-m-Spalten (`gate:seam`), getragen vom **DEKOPPELTEN**
  Geomorph (Render-Morph, neighbor-LOD-abhängig, main-only) + Stitch-Band/Skirt. Ein INTRINSISCHES
  Transvoxel würde den DETERMINISTISCHEN Worker-Bau an die Nachbar-LODs KOPPELN (Rebuild bei jedem
  LOD-Wechsel + Nachbar-LOD-Plumbing in den Byte-Test) = architektonisch SCHLECHTER als der heutige
  dekoppelte Morph (der Per-Chunk-Bau bleibt nachbar-unabhängig + cachebar) — für einen Fern-LOD-
  Gewinn, der im swiftshader-Container NICHT verifizierbar ist (Schöpfer-Browser). Der dekoppelte
  Vertex-Clamp-Morph IST die übliche Profi-Render-Zeit-Konformanz (geshippte Voxel-Engines). →
  G2-als-intrinsisches-Transvoxel ist KEIN synergetischer Schritt; der Cross-LOD-Look bleibt der
  Schöpfer-Browser-Gate.
- **G3 (Geomorph/Skirt-Rückbau):** gilt nur, wenn G2 sie ERSETZT. Da der dekoppelte Morph die
  korrekte Architektur IST (nicht zu ersetzen), bleibt der Skirt der bewiesene 0-Spalt-Netz
  (Saat-Disziplin: erst schneiden, wenn der Ersatz bewiesen trägt). Kein blinder Schnitt.
