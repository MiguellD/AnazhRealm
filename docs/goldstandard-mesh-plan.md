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

**G1 — SAME-LOD auf ~100 % geteilte Vertices (der Bett-Naht-Tod, headless voll beweisbar).**
Die Wasser-Bett-Naht (Schöpfer-Befund) sitzt hier. Heute teilen Nachbarn ~50 % ihrer Rand-
Vertices. Ziel: die Rand-Zeile beider Chunks erzeugt IDENTISCHE Vertices (gemeinsame Rand-
Zellen, identische Surface-Nets-Platzierung). Weg: die Pad+Crop-Überlappung so legen, dass die
GETEILTE Rand-Zell-Ebene von beiden Chunks bit-identisch gemesht wird (die Vertex-Position ist
schon eine reine Funktion der Zell-Dichten — die Aufgabe ist, dass beide dieselben Zellen mit
derselben Crop-Grenze meshen). Verifiziert `gate:seam` (same-LOD → ~100 %) + `diag-worker-chunk`
(maxDiff 0). **Das ist der erste Phönix-Flug: voll headless-beweisbar, kein Fern-LOD nötig.**

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
- **G0–G3**: offen, der aktive nächste Arc. G0+G1 sind voll headless-verifizierbar (der erste
  mutige, sichere Flug); G2 ist der grosse Lengyel-Schritt; G3 der Rückbau.
