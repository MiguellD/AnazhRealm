#!/usr/bin/env node
// ============================================================================
// DIE RÜCKKEHR-WAND — gate:altlasten (ALTLASTEN-NULL W4, 11.07.2026)
//
// Gesetz #0: Struktur statt Wachsamkeit. Jeder vollzogene Abschied hinterlässt
// hier seine Zeile — ein gefallener Name kann strukturell nicht in den Stamm
// zurückkehren (grep = 0 auf dem KOMMENTAR-BEREINIGTEN Code; Kommentare dürfen
// die Geschichte erzählen, der CODE darf das Wort nicht mehr tragen — die
// V18.267-Disziplin). Wächst mit jedem künftigen Abschied: eine Zeile je Name.
//
// Selbst-Test: --selftest injiziert einen verbotenen Namen in eine Kopie und
// beweist, dass die Linse feuert (kein vakuöses Grün).
// ============================================================================
"use strict";
const fs = require("fs");
const path = require("path");

// Die gefallenen Namen (ALTLASTEN-NULL, V18.449). Jede Zeile: Token + wo er
// fiel. PRÄZISE Tokens (keine generischen Wörter — "sprite" allein wäre
// THREE.Sprite-falsch-positiv; die Seelen-Schlüssel sterben über die
// CREATURE_SOULS-Schlüssel-Prüfung unten).
const FORBIDDEN = [
    { token: "tickPhoenixDeath", fiel: "W1a — der Tod ist feld-nativ (_playerDeathRespawn)" },
    { token: "triggerPhoenixDeath", fiel: "W1a" },
    { token: "preDeathSoul", fiel: "W1a — kein Gestalt-Tausch beim Tod" },
    { token: "phoenixUntil", fiel: "W1a — respawnGraceUntil trägt" },
    { token: "phoenixDurationSeconds", fiel: "W1a" },
    { token: '"phoenix"', fiel: "W1a — die Fantasie-Seele" },
    { token: '"dragon"', fiel: "W1a — die Fantasie-Seele" },
    { token: "glutwesen", fiel: "W1b — der Wolf trägt das Raubtier (Gattung)" },
    { token: "_waechterSoulParts", fiel: "W1b — der koerperstudio-Mensch ist DER Menschkörper" },
    { token: "avatar_waechter", fiel: "W1b" },
    { token: "WAECHTER_DIALS", fiel: "W1b" },
    { token: "_p2pMsgAura", fiel: "W1c — aura ist dem Dispatcher unbekannt" },
    { token: "_p2pEnsurePeerAura", fiel: "V18.448 — die Avatar-Aura" },
    { token: "_p2pBroadcastAura", fiel: "V18.448" },
    { token: "tickPlayerAura", fiel: "V18.448" },
    { token: "_ensureAuraSkinShells", fiel: "V18.448" },
    { token: "AURA_TAG_HUE", fiel: "V18.448 (CREATURE_TASK_AURA_HUE lebt — anderes System)" },
    // KONVERGENZ III (V18.456) — die Metaball-KREATUR-Klasse ist gefallen: die vier
    // Gattungen tragen den Studio-Baum (tetrapoda-core.bauTier), die Skin-Isosurface
    // (bake-core/bake-worker) + Gesichts-LOD + Bäcker-Protokoll sind physisch raus.
    { token: "_buildCreatureSkinGeometry", fiel: "KONVERGENZ III — der Baum trägt die Gestalt" },
    { token: "__bakeSkinGeometry", fiel: "KONVERGENZ III — bake-core/bake-worker sind gefallen" },
    { token: "_bakeSkinRequest", fiel: "KONVERGENZ III — das Bäcker-Protokoll" },
    { token: "_ensureBakeWorker", fiel: "KONVERGENZ III — der Bäcker-Worker" },
    { token: "_attachCreatureSkin", fiel: "KONVERGENZ III — die Haut-Anhäng-Naht" },
    { token: "_addCreatureFace", fiel: "KONVERGENZ III — der Baum trägt das ECHTE Gesicht" },
    { token: "_creatureFaceLOD", fiel: "KONVERGENZ III — die Gesichts-LOD-Gruppe" },
    { token: "CREATURE_FACE_LOD_DIST_SQ", fiel: "KONVERGENZ III" },
    { token: "__anazhHeadlessSkinResCap", fiel: "KONVERGENZ III — der Headless-Skin-Res-Knopf" },
    // DER GRAS-ABSCHIED GANZ (V18.492) — die Wiese ist Boden-Funktion (21.07.); die
    // Halm-Maschinerie, die den Schnitt überlebte (Mesh-Pool, Studio-Halm-Geometrie,
    // Stufen-Tick — jeden Frame ein No-op), ist physisch raus und kommt nicht zurück.
    { token: "_acquireGrassMesh", fiel: "V18.492 — kein Halm-Mesh, kein Pool" },
    { token: "_releaseGrassMesh", fiel: "V18.492" },
    { token: "_drainGrassMeshPool", fiel: "V18.492" },
    { token: "_grassMeshPool", fiel: "V18.492" },
    { token: "_grassConeGeometry", fiel: "V18.492" },
    { token: "GRASS_POOL_CAP", fiel: "V18.492" },
    { token: "GRASS_MAX_BLADES", fiel: "V18.492" },
    { token: "_grassStudioGeometry", fiel: "V18.492 — die Studio-Halm-Geometrie" },
    { token: "_tickGrassStage", fiel: "V18.492 — der Stufen-Tick lief ins Leere" },
    { token: "voxelChunkGrassStage", fiel: "V18.492" },
    // DIE EINE PIPE (V18.458) — die Stamm-Tunnel neben der Foundry sind gefallen:
    // die Kreatur ist ein Pipe-Asset (Gattungs-Bäcker BAKERS_BY_KIND in foundry-core,
    // Ofen-Assemblierung + Memo/Clone im Stamm). Kein Inline-Baum-Bau, kein eigenes
    // Fern-System, keine Look-Interpretation mehr.
    { token: "_buildTierBaum", fiel: "DIE EINE PIPE — der Stamm-Inline-Baum-Tunnel" },
    { token: "_tierFernTeile", fiel: "DIE EINE PIPE — das Stamm-eigene Fern-System (lod1 kommt aus der Pipe)" },
    { token: "_buildCreatureHideMaterial", fiel: "DIE EINE PIPE — die Look-Interpretation (mp/Studio-Zahlen führen)" },
    // P0-INVENTUR 18.07. — der Phantom-Leser der Augen-Glut: das Vertrags-Feld
    // heisst `ei` (tetrapoda TIER_MATERIAL_KLASSEN); der erfundene Name las nie
    // einen Schreiber und der 0.85-Default gab jedem Kreatur-Auge 2.8x Glut.
    { token: "emissivIntensitaet", fiel: "AUGEN-GLUT-SCHNITT — der Bäcker liest kl.ei (die Gesetzbuch-Wahrheit)" },
    // DIE DRAW-WAHRHEIT (V18.510) — der BatchedMesh-Pfad ist gefallen: r184-WebGPU kennt kein Multi-Draw,
    // ein Batch gab je INSTANZ einen drawIndexed aus (29 191 von 29 943 GPU-Befehlen an der Mess-Wiese).
    // Jedes Leaf ist eine InstancedMesh; der Name kommt nicht zurück.
    { token: "BatchedMesh", fiel: "V18.510 — je Instanz ein Draw unter WebGPU; die InstancedMesh trägt" },
    { token: "_archBatchGroupFor", fiel: "V18.510" },
    { token: "_archBatchAddGeometry", fiel: "V18.510" },
    { token: "_tickBatchStagingEntlassung", fiel: "V18.510 — kein Batch-Staging mehr" },
    { token: "useBatchedArch", fiel: "V18.510" },
    { token: "archBatches", fiel: "V18.510" },
    // V18.511 — der Haupt-Thread fasst den Asset-Cache nie mehr an: Platte, Stempel, Get und Put leben in der
    // Transport-Schale IM Worker (`_foundrySchale`).
    { token: "_foundryIdbInit", fiel: "V18.511 — die Platte lebt in der Transport-Schale" },
    { token: "_foundryIdbGet", fiel: "V18.511" },
    { token: "_foundryIdbPut", fiel: "V18.511" },
    // BOOT-LITERAL-ABSCHIED 18.07. — die palettenfremden Haut-/Haar-Töne des
    // Boot-Menschen: Haut/Haar kommen aus koerper-core SKIN_TONES/HAIR_COLORS
    // (Anker-Farben Γ5 aus dem Welt-Seed bzw. benannte Kern-Anker im Bäcker).
    { token: "0xc89372", fiel: "BOOT-LITERAL-ABSCHIED — die Haut zieht aus der SKIN_TONES-Palette" },
    { token: "0x241712", fiel: "BOOT-LITERAL-ABSCHIED — das Haar zieht aus der HAIR_COLORS-Palette" },
    // DIAL-ZWILLINGS-ABSCHIED 18.07. — die Literal-Kopien der Pflanzen-Tafel:
    // die EINE Quelle ist foundry-core PRESETS (__terrainCore.PHYTO_PRESETS,
    // Leser _phytoStudioDials); nur SPECIES_PALETTE_DEFAULT (neutral) lebt.
    { token: "SPECIES_PHYTO_DIALS", fiel: "DIAL-ZWILLINGS-ABSCHIED — die Studio-Tafel führt (gefühlt == gesehen)" },
    { token: "SPECIES_PALETTE_GIGANT", fiel: "DIAL-ZWILLINGS-ABSCHIED — der Gigant trägt den mammut-Ton der Tafel" },
    { token: "SPECIES_PALETTE[", fiel: "DIAL-ZWILLINGS-ABSCHIED — die Art-Palette wohnt in der Studio-Tafel" },
    // ZWILLINGS-ABSCHIED 18.07. (M3): der per-Feld-fail-soft-Helfer des
    // Fahr-Profils — jedes Feld trug seinen Literal-Zwilling. Der EINE
    // fail-closed Leser ist AnazhRealm._fahrGesetz (Gültigkeits-Wand).
    { token: "_heN(", fiel: "FAHR-ZWILLINGS-ABSCHIED — _fahrGesetz liest fail-closed, kein Misch-Gesetz" },
    // ZWILLINGS-ABSCHIED 19.07. — der State-Zwilling des Begehbarkeits-
    // Winkels: das Steilhang-Gesetz wohnt im koerperstudio-Gesetzbuch
    // (fx.bewegung.hang.maxSlopeY), die Leser lesen den fail-closed
    // _bewegungsBlock direkt (kein Boot-Seed, kein State-Feld).
    {
        token: "maxWalkableSlopeY",
        fiel: "ZWILLINGS-ABSCHIED 19.07. — hang.maxSlopeY via _bewegungsBlock (fail-closed)",
    },
    // FLÄCHEN-STUFE (V18.500): der Host-Umweg um ein L1, das nicht reduzierte, ist gefallen —
    // das Studio liefert die Stufe selbst (Kosten gehören ins Asset, nie in den Host).
    { token: "lodServe", fiel: "V18.500 — fachwerk-core L1 = Flächen-Stufe, kindStages [0,1,2] alle serviert" },
    // DAS STUDIO-FÜLL-RIG IN DER WELT (V18.503): Fill · Rim · Back ersetzen im Labor den Himmel — die Welt
    // hat ihn (Himmels-Umgebung aus dem sichtbaren Himmel); doppelt gezählt lasen Schattenseiten so hell
    // wie Sonnenseiten.
    { token: "fillLight", fiel: "V18.503 — die Welt-Schattenseite trägt der Himmel (_ensureSkyEnvironment)" },
    { token: "rimLight", fiel: "V18.503 — die Welt-Schattenseite trägt der Himmel (_ensureSkyEnvironment)" },
    { token: "backLight", fiel: "V18.503 — die Welt-Schattenseite trägt der Himmel (_ensureSkyEnvironment)" },
    { token: "FILL_LIGHT", fiel: "V18.503 — Studio-Füll-Rig nur im Labor" },
    { token: "RIM_LIGHT", fiel: "V18.503 — Studio-Füll-Rig nur im Labor" },
    { token: "BACK_LIGHT", fiel: "V18.503 — Studio-Füll-Rig nur im Labor" },
    // ABSCHIED DER VOXEL-BRICKS (V18.528): der Welt-March trägt EINE Payload — Analog-Primitive (Kapsel+Box)
    // und Gesetz-Plätze. Der 128-MB-3D-Atlas, der Brick-Zweig im Feld-Pass-WGSL, der Region-Ziegel (Fern-Cache)
    // und die toten Reste der Fern-Schicht fielen in EINER Welle.
    { token: "_weltBrickAlloc", fiel: "V18.528 — kein Voxel-Atlas mehr, Felder sind Analog-Sätze" },
    { token: "_weltBrickHolen", fiel: "V18.528 — kein Brick-Dedup, der Kapsel-Cache dedupliziert" },
    { token: "_weltFeldSpawn", fiel: "V18.528 — Feld-Einträge entstehen nur als Kapsel-Satz (_baumKapselFit)" },
    { token: "_weltFeldRegister", fiel: "V18.528 — kein Brick-Register" },
    { token: "brickCache", fiel: "V18.528 — der Kapsel-Cache ist der EINE Dedup" },
    { token: "freiGross", fiel: "V18.528 — kein 64³-Block-Allokator" },
    { token: "freiKlein", fiel: "V18.528 — kein 32³-Einheiten-Allokator" },
    { token: "atlasDaten", fiel: "V18.528 — der 512×512×128-RGBA8-Atlas (128 MB) fiel" },
    { token: "feldTriAbtast", fiel: "V18.528 — der trilineare Brick-March im WGSL fiel" },
    { token: "feldTriGrad", fiel: "V18.528 — der trilineare Brick-Gradient im WGSL fiel" },
    {
        token: "_bundleZiegelTick",
        fiel: "V18.528 — der Region-Ziegel (Fern-Cache) fiel, das Ferne trägt der Welt-March",
    },
    { token: "_bundleZiegelTod", fiel: "V18.528" },
    { token: "_ziegelBackenAusGruppe", fiel: "V18.528 — der Gruppen-Bäcker fiel mit dem Region-Ziegel" },
    { token: "_waldZiegelBacken", fiel: "V18.528 — der Einzel-Baum-Brick war fail-closed, nun physisch fort" },
    { token: "WALD_ZIEGEL", fiel: "V18.528" },
    { token: "FERN_SCHICHT", fiel: "V18.528 — EIN Szene-Pass (Trace .36)" },
    { token: "FERN_LAYER", fiel: "V18.528 — EIN Szene-Pass, die Schalen leben auf Layer 0" },
    { token: "fernSchicht", fiel: "V18.528 — EIN Szene-Pass (Trace .36)" },
    // DER SATZ (Welle B) — der Boden ist EIN Satz je Material (ein Befehl je Pass für den ganzen Ring), die
    // Chunk-Geometrie trägt Views auf ihn: die Boden-Entlassung (CPU-Arrays nullen, aus IDB re-hydrieren) hat
    // keinen Gegenstand mehr und kommt nicht zurück.
    { token: "_chunkBodenGpuHat", fiel: "Welle B — der Boden-Satz hält die CPU-Arrays (Views)" },
    { token: "_chunkBodenNulle", fiel: "Welle B" },
    { token: "_tickChunkBodenEntlassung", fiel: "Welle B" },
    { token: "_chunkBodenReHydrieren", fiel: "Welle B" },
    { token: "_chunkEntlass", fiel: "Welle B — Entlass-Schlange und -Bytes" },
    { token: "CHUNK_ENTLASS_GNADE_MS", fiel: "Welle B" },
    { token: "_entlassBytes", fiel: "Welle B" },
    { token: "_chunkRehydrierLauf", fiel: "Welle B" },
    // Das Chunk-Wasser ist EIN Satz ausserhalb jedes Bundles (der Pass-Bruch des viewportLinearDepth) — das
    // Bundle-Flag hatte keinen Leser, der es je setzte.
    { token: "wasserImBundle", fiel: "Welle B — das Wasser des Rings ist der Wasser-Satz" },
    // Das Ufer-Band des Wasser-Shaders las ein Attribut, das jeder Schreiber mit 0 füllte (je Pixel zwei Rauschen und ein
    // Sinus für ×0); den Ufer-Saum trägt der optische Weg (WASSER_GESETZ.schaum.ufer). Mit ihm fiel der Strähnen-Schaum
    // ohne Gesetz-Grund (Welle L, W-B1/W-kD11).
    { token: "aShore", fiel: "Welle L Q7 — die tote Ufer-Spalte; der Saum ist der optische Weg" },
    { token: "riverFoam", fiel: "Welle L Q7 — der Strähnen-Schaum ohne Gesetz-Grund (W-B1)" },
    // Der Körper im Wasser liest EINE Wahrheit (`_koerperWasser`: die Lauf-Fläche des Gesetzes über seinem Grund + die
    // Abweichung des Live-Automaten), nie das 1,8-m-Zell-Dach; die Strömung ist das Gesetz (wellen.adv) und koppelt additiv.
    { token: "_playerWaterContext", fiel: "Welle L Q6 — das Zell-Dach als Körper-Spiegel (W-K2)" },
    { token: "_waterCellAt", fiel: "Welle L Q6 — der Zell-Leser als dritte Wahrheit, nur noch von einer Probe gerufen" },
    { token: "FLOW_ADVECT_SPEED", fiel: "Welle L Q6 — die Host-Strömung 3,2 m/s neben dem Gesetz 1,2 (W-kD4)" },
    { token: "FLOW_ADVECT_K", fiel: "Welle L Q6 — die Schlupf-Kopplung des Spielers neben der additiven des Tiers" },
    // Der Fluss-Spiegel ist das Gesetz (`_hydroRiverSpiegel`: stromab nie steigend, quer waagrecht; das Bett folgt ihm) —
    // die Makro-Höhe des Orts mit Buckel und die geglättete Lauf-Fläche darüber sind gefallen (Main und Worker).
    { token: "convexBulge", fiel: "Welle L Q7 — der 1,55-m-Buckel des Querschnitts (W-F2)" },
    { token: "waterRunSurfaceAt", fiel: "Welle L Q7 — die geglättete Lauf-Fläche; der Spiegel selbst ist monoton" },
    // Der Wasser-Automat wacht nur, wo die Welt abweicht (Graben · Füllen · Damm) — das Wecken beim Einstreamen und bei
    // Annäherung rechnete den ruhenden Fluss in ganzen Zellen nach und flutete die Ufer (W-W1).
    { token: "_tickWaterCANearWake", fiel: "Welle L Q6 — die Annäherungs-Weckung (Ufer-Flut W-W1)" },
    { token: "_wakeWaterCAOnce", fiel: "Welle L Q6 — die Einstream-Weckung" },
    { token: "WAKE_CA_RADIUS", fiel: "Welle L Q6" },
    { token: "_voxelChunkNearPlayer", fiel: "Welle L Q6 — der Nah-Test der Weckung" },
    { token: "_caWoken", fiel: "Welle L Q6" },
    // Der Wasser-Render hat EINEN Pfad (das Zell-Oberkanten-Sheet); der Debug-Zwilling „Zell-Iso" hinter einem
    // Einstellungs-Schalter, im Save persistiert, ist gefallen (Welle L, W-kD7).
    { token: "waterRenderMode", fiel: "Welle L Q7 — der Render-Schalter Zell-Sheet/Zell-Iso" },
    { token: "_cullWaterUndersides", fiel: "Welle L Q7 — die Unterseiten-Schere der Zell-Iso" },
    { token: '"chunk-water-iso"', fiel: "Welle L Q7 — der Kind-Stempel der Zell-Iso" },
    { token: "select-waterrender", fiel: "Welle L Q7 — die Auswahl im Einstellungs-Band" },
    // Das Wasserfall-Material ohne Leser (nur Tests riefen es) fiel ganz (W-kD11).
    { token: "_ensureWaterfallMaterial", fiel: "Welle L Q7 — die Saat ohne Leser" },
    { token: "waterfallUniforms", fiel: "Welle L Q7" },
    { token: "waterfallMaterial", fiel: "Welle L Q7" },
    // DER REGEN ist EIN Gesetz für Labor und Welt (foundry-core REGEN_GESETZ): die Welt zeichnet Schlieren, deren Lage der
    // Vertex aus Saat und Zeit rechnet; die Punktwolke (Math.random-Saat, je Frame im Haupt-Thread gefallen, 1 Pixel groß)
    // und die eigenen Zahlen des Labors sind gefallen (W-R1/W-kD5).
    { token: "sys.lastT", fiel: "Welle L Q7 — der Regen fiel je Frame im Haupt-Thread; die Lage rechnet der Vertex" },
    { token: "dt * 42", fiel: "Welle L Q7 — die Fall-Zahl des Labors wohnt im REGEN_GESETZ", auch: ["worlds/terrain/phytogenesis.js"] },
    // DIE UFER-BÄNDER sind stetig: Strand, Schlick, Pfad und Höhen-Feuchte lesen beide Bezüge (`_waterLevelAt` → see ·
    // fluss · ufer); das Strand-Fenster schnitt die Glocke bei 2,0 m, die Worker-Feuchte las eine Halbbreite, die kein
    // Segment trägt (2137 von 7578 Ufer-Vertices anders gefärbt als im Main).
    { token: "aboveWater < 2.0", fiel: "Welle L Q7 — die Strand-Glocke trägt bis 0,6 + 1,9 m (imStrand)" },
    { token: "seg.halfW || 0", fiel: "Welle L Q7 — die Halbbreite am Fußpunkt wie im Main (hwA/hwB)" },
    // DIE BANK läuft mit ihrer Neigung ins Gelände (Kanal und Damm, `_hydrosphereCarveAt` → { P, L, k }); die Krone nach
    // 0,6 der Bank-Rampe und die Gleit-Zone dahinter (eine Wand bis ≈ 73° mit Fels-Rauten) sind gefallen (Main und Worker).
    { token: "kroneAnteil", fiel: "Gegenprüfung 07.10. — die Krone nach 0,6 der Bank-Rampe (die Steilwand)" },
    { token: "carveBankSlope", fiel: "Gegenprüfung 07.10. — die Bank-Rampe Tiefe × 1,4; die Bank ist bankNeigung" },
    { token: "kn.T - y", fiel: "Gegenprüfung 07.10. — das Gewicht der Gleit-Zone; die Dichte nimmt Kanal und Damm" },
    // DER SCHILF-BEZUG der Nah-Streu liest beide Bezüge (`_nahStreuBodenGewicht`: das Band über See und das über dem Fluss
    // mit seiner Kronen-Blende), jede andere Art die EINE Wahrheit am Körper; das Maximum der Spiegel sprang an der Krone.
    { token: "_nahStreuSpiegel", fiel: "Gegenprüfung 07.10. — der Kronen-Sprung des Schilf-Bands (13 Sprünge bis 1,0)" },
    // Die Chunk-Einbürgerung in Region-Bundles hat keinen Bürger mehr (Boden · Stitch · Wasser sind Sätze, die
    // Klein-Streu ist EINE InstancedMesh je Art); der Streu-Pool je Chunk und der Deck-Zwilling des Fernfelds
    // sind gefallen.
    { token: "_chunkBundleAnker", fiel: "Welle B — der Satz ist der EINE Eintritt (_chunkSatzEin / _streuNahEin)" },
    // Der Satz zeichnete den ganzen Ring in JEDEM Pass (ein Bereich lag an EINER Index-Stelle, `b.iStart`, der ganze Satz
    // bis `s.iVoll`): seit Welle 6 trägt der Index je Pass einen Abschnitt — die Zellen im Frustum der Pass-Kamera
    // (_chunkSatzAbschnitt), für Boden, Wasser UND Bau-Sätze. Die zweite Werfer-Wahl des Bau-Satzes (der Lauf vom ersten bis
    // zum letzten Bereich im Frustum) fiel in dieselbe Mechanik; die Verdrängung der Kaskaden-Abschnitte (sie schrieben
    // einander je Frame neu, 06.10. Mess-Wiese beim Drehen 2,2 MB je Frame) fiel ins Wachsen.
    { token: ".iStart", fiel: "Welle 6 Boden-Schatten — je Pass ein Abschnitt (_chunkSatzPass), kein Ring-Index" },
    { token: ".iVoll", fiel: "Welle 6 — der ganze Satz zeichnet nie; je Pass ein Abschnitt (_chunkSatzAbschnitt)" },
    {
        token: "_satzWerferWahl",
        fiel: "Welle 6 — die Werfer-Wahl der Bau-Sätze ist der Abschnitt je Pass (_chunkSatzPass)",
    },
    {
        token: "_chunkSatzVerdraeng",
        fiel: "Welle 6 — kein Abschnitt verdrängt einen anderen; der Index wächst (_chunkSatzUmlegen)",
    },
    { token: "_chunkBundleRegionKey", fiel: "Welle B" },
    { token: "_bundleKugelWeite", fiel: "Welle B — kein Chunk-Bürger wächst eine Region-Kugel mehr" },
    { token: "_acquireScatterMesh", fiel: "Welle B — der Streu-Satz je Art (_streuNahArt)" },
    { token: "_releaseScatterMesh", fiel: "Welle B" },
    { token: "_drainScatterMeshPools", fiel: "Welle B" },
    { token: "_scatterMeshPools", fiel: "Welle B" },
    { token: '"deck-streu"', fiel: "Welle B — die Deck-Streu ist der zweite Block der Fern-Mesh je Art" },
    // Der platzierte Bau keyt nicht mehr regional: die 256-m-Region (`p:x,z`) brachte keinen Cull (ihre Kugel
    // schneidet das Frustum praktisch immer), sie vervielfachte nur die Gruppen je Leaf.
    {
        token: "_archPlacedRegionKey",
        fiel: "Welle B — der platzierte Bau ist global, ein Studio-Leaf keyt nach Geometrie",
    },
    { token: "useRegionArchCull", fiel: "Welle B" },
    { token: "ARCH_REGION_CULL_MAX_SPAN", fiel: "Welle B" },
    { token: "p:s:", fiel: "Welle B — die platzierte Fern-Superregion" },
    { token: '"@p:"', fiel: "Welle B" },
    { token: "_archGroupKeyReapable", fiel: "Welle B — jede leere Gruppe fällt durch den Leer-Chokepoint" },
    // DIE BUNDLE-WAHRHEIT (04.10.): die Region-Bundles sind der EINE Weg (gegen den direkten Pfad gemessen), ihr Replay
    // trägt die Kamera über den Aufnahme-Stapel am Chokepoint `_renderScene` und die Diät je Programm. Gefallen: die
    // Bundle-Abkürzung der Diät mit Render-Stempel (V18.518 — je Render schrieb nur das Stempel-Objekt die geteilte
    // Gruppe), ihr Nachziehen aus welle-bild-wahrheit (8cf8cb5, nie integriert) und der Kill-Switch (ein Flag = ein
    // zweiter Weg).
    { token: "_anazhDiaetRid", fiel: "Bundle-Wahrheit — die Diät schreibt je Programm und Render, kein Stempel" },
    {
        token: "_diaetGeteilteOffen",
        fiel: "Bundle-Wahrheit — das Nachziehen der Abkürzung (8cf8cb5) wird nie integriert",
    },
    { token: "useRegionRenderBundles", fiel: "Bundle-Wahrheit — kein Kill-Switch, die Bundles sind der EINE Weg" },
    // DIE ZEITLICHE AUFLÖSUNG (04.10.) — FXAA am Ende der Post-Kette fiel ganz: die Kantenglättung ist TRAA (vendor/
    // TRAANode.js) als erste Stufe, die Dither-Blende rotiert hinter dem Knoten (state.traaNode), nie hinter einem Flag.
    { token: "_fxaa", fiel: "04.10. — TRAA trägt die Kantenglättung (_ensurePostProcessing)" },
    { token: "taaLite", fiel: "04.10. — das nie gesetzte TAA-Flag; uDitherT rotiert, wo state.traaNode steht" },
    // DIE INTEGRATION der Bild-Wahrheit (04.10.): der Gruppen-Schlüssel mit Saison war ein Zwilling des saisonfreien
    // Körper-Schlüssels (V18.527) und traf im Cache nie; die Höhe eines Baum-Körpers lebt im Höhen-Buch.
    {
        token: "_foundryGruppenKey",
        fiel: "Integration bild-wahrheit — _foundryKoerperKey ist der EINE Körper-Schlüssel",
    },
    // DIE BILDZIELE JE LESER (W7, integriert 04.10.): der Modul-Knoten der linearen Szenen-Tiefe hielt seinen EIGENEN
    // Tiefen-Klon und kopierte je Frame neben dem Feld-Pass ein zweites Mal — die Szenen-Tiefe ist der EINE Knoten
    // `_szeneTiefe` (gate:schatten-werfer Z2 zählt die Leser).
    { token: "viewportLinearDepth", fiel: "W7 — _szeneTiefe ist die EINE Szenen-Tiefe (Wasser und Feld-Pass)" },
    // W1 — DIE FERNFORM AUS DEM BUDGET: der Zellen-Chokepoint liest B2c `fern` VOR jedem Mesh-Zug; die geklemmte
    // Stufe als Fern-Tor (und mit ihr der stille L0-Rückfall über die Instanz-Bahn) ist gefallen. Die Streu-Schicht
    // litter (→ baum_totholz, eine belaubte Alias-Eiche) fiel final — Totholz kommt als Studio-Art, nie als Schicht.
    { token: "_cellLodF", fiel: "W1 — die Fernform je Art (`_foundryFernForm`), nie die geklemmte Stufe" },
    { token: '"litter"', fiel: "W1 — die Streu-Schicht litter fiel final (kein Totholz-Körper im Studio)" },
    // Integration mittel-klumpen + W1 (05.10.): die Gesetz-Bahn-Wand der Streu war eine Kopie der Backend-Wand des
    // Feld-Passes.
    {
        token: "_streuGesetzBahnOffen",
        fiel: "Integration 05.10. — _weltMarchGezeichnet, dieselbe Wand wie der Feld-Pass",
    },
    // Integration 05.10.: die Fallback-Karte der Stufen ohne Config war tot (ohne Config bricht der Wurf-Leser, Buch und
    // Config docken in EINER Nachricht).
    { token: "FOUNDRY_KIND_LOD", fiel: "Integration 05.10. — _foundryServierStufe, ohne Config KERN-PFLICHT" },
    // Die Grammatik-Art Totholz hatte nach dem Fall der litter-Schicht keinen Erzeuger mehr; ihr Foundry-Alias zeichnete
    // sie als belaubte Eiche.
    { token: 'baum_totholz: "eiche"', fiel: "Integration 05.10. — Totholz als belaubte Alias-Eiche kehrt nie zurück" },
    { token: "baum_totholz: Object.freeze", fiel: "Integration 05.10. — die Grammatik-Art Totholz fiel final" },
    // W6 — DER EINE KARTEN-ATLAS: je Karte zwei CanvasTextures, ein Material, eine Gruppe und ein Programm (die
    // Sichthöhe als Fragment-Konstante), das Umdrehen je Karte im Haupt-Thread, die Silhouette, der Re-Frame mit
    // Bundle-Neuaufnahme und das Rahmen-Quad je Karte sind gefallen; die Karte ist eine Schicht (`_impostorAtlas`).
    { token: "_ensureImpostorAtlas", fiel: "W6 — der Canvas-Atlas je Karte (_impostorAtlas: EINE Array-Textur)" },
    { token: "_impostorAtlasMap", fiel: "W6 — die Record-Map je Karte (_impostorAtlas().zellen)" },
    { token: "_paintStudioAtlasCells", fiel: "W6 — das Umdrehen im Haupt-Thread (Studio-Layout lädt ohne Umdrehen)" },
    { token: "_reframeImpostorFlat", fiel: "W6 — der Rahmen reist je Instanz (aRahmen)" },
    { token: "_bakeImpostorSilhouetteCanvas", fiel: "W6 — die Silhouette erreichte das Auge nie" },
    { token: "_buildImpostorCrossGeometry", fiel: "W6 — EIN Einheits-Quad (_impostorQuad)" },
    { token: "impostorKey", fiel: "W6 — EIN Karten-Material (impostorAtlas)" },
    { token: "_rec.frame", fiel: "W6 — die Programm-Konstante der Sichthöhe (|aKarte.w|, der Stempel der L1-Höhe)" },
    { token: "rttBaked", fiel: "W6 — die Zelle ist gebacken" },
    { token: "rttFailed", fiel: "W6 — die Zelle ist gescheitert" },
    { token: "silhouetteWartend", fiel: "W6 — der Zensus zählt wartende Zellen" },
    // Integration W6: die Karten-Farbe kodiert der Codec (phyto-core impostorMips, SRGB_AUS_LIN8) — die Host-Tafel war
    // nach dem Fall des Canvas-Malers ein Zwilling ohne Leser.
    { token: "_linearZuSrgb8", fiel: "Integration W6 — der Karten-Codec kodiert linear → sRGB (phyto-core)" },
    // W6 Echt-GPU: zehn Vertex-Puffer (WebGPU-Grenze 8) machten das @global-Bundle ungültig — die Karte trägt drei
    // Vertex-Attribute (position · normal · uv) und EIN Instanz-vec4 aKarte (Schicht, Halbbreite, Höhe, ±Sichthöhe).
    { token: "aOccl", fiel: "W6 — die Verdeckung ist das Vorzeichen von aKarte.w" },
    { token: "aZelle", fiel: "W6 — die Schicht ist aKarte.x" },
    { token: "aRahmen", fiel: "W6 — der Rahmen ist aKarte.yz" },
    { token: "aImpX", fiel: "W6 — die Ecke ist 2·uv.x − 1" },
    // W5/S7 (Wald-L0): die Welt liest die Studio-Distanzen d0/d1 — der Host-Umweg, der 20/40 auf 12/26 m umrechnete
    // (die Kosten der Nahstufe lebten im Host statt im Asset), ist gefallen; das Studio trägt 12/26, das Budget tree[0].
    { token: "LOD_TRI_BUDGET_MUL", fiel: "W5 — die Kosten wohnen im Asset (lod.budget.tree[0]), Lehre 19" },
    // W8 (Integration): jede Art mit Gestalt trägt ihr Budget — die Wirt-Stufen-Tafel für Arten ohne Zeile hat keinen
    // Leser mehr; `_foundryBudgetZeile` bricht fail-closed, wo eine Art keine Zeile trägt.
    {
        token: "_WIRT_WURF",
        fiel: "Integration W8 — das Budget aller Kerne trägt den Wurf (lod.budget[kind][stufe].schatten)",
    },
    // Integration W8 (Seh-Klasse): die Zwillinge des Budget-Gesetzes im Wirt fallen — die Look-Liste, die Verschmelz-
    // Zahl, die Material-Defaults und die Füll-Farbe liest der Wirt aus phyto-core (LOOK_KLASSEN · BUDGET_GESETZ ·
    // budgetRegler · budgetFuellFarbe).
    {
        token: "AnazhRealm.LOOK_KLASSEN",
        fiel: "Integration W8 — phyto-core LOOK_KLASSEN / budgetLook ist die EINE Liste",
    },
    { token: "FOUNDRY_VERSCHMELZ_VERTS", fiel: "Integration W8 — phyto-core BUDGET_GESETZ.verschmelzVerts" },
    // Integration W8 (Prüfer W8 (c)): die Verschmelz-Signaturen des Wirts (Flatten: Material · Schatten · Index · alle
    // Attribute; Ofen: Material · Schatten · Look-Klasse · Attribute) waren Zwillinge der Sippe des Gesetzes — beide
    // gruppieren nach phyto-core `budgetSippe` (gate:sippen-wirt misst Gesetz gegen Leaves an jeder Art und Stufe).
    { token: "(lf.castShadow ? 1 : 0)", fiel: "Integration W8 — der Flatten verschmilzt nach budgetSippe" },
    { token: "(n.receiveShadow ? 1 : 0)", fiel: "Integration W8 — die Starr-Bindung bindet nach budgetSippe" },
    // DER WALDBODEN INS STUDIO (04.10.) — der Host erzeugt nichts, was ein Studio kann: die Klein-Vegetation (eigene
    // Strip-/Kreuz-Geometrie je Art, das Art-Material mit eigenem Wind, die Chunk-Streu, das Deko-Fernfeld, die
    // Deck-Streu, die Host-Ökologie Nische/Bodendecker/Kronen-Lesart) ist gefallen; die Nah-Streu liest das
    // Boden-Gesetz des Studios und baut über die Foundry (`_tickNahStreu`).
    { token: "KLEIN_VEGETATION_SPECIES", fiel: "Waldboden — die Arten sind Studio-Zeilen (placement.boden)" },
    { token: "_scatterSpeciesGeometry", fiel: "Waldboden — die Gestalt baut das Studio (Foundry)" },
    { token: "_scatterImpostorGeometry", fiel: "Waldboden — das Kreuz-Fernfeld fiel" },
    { token: "_scatterMaterial(", fiel: "Waldboden — der Studio-Stoff (`_foundryTreeMaterial`)" },
    { token: "_applyScatterMotion", fiel: "Waldboden" },
    { token: "_buildVoxelChunkScatter", fiel: "Waldboden — die Nah-Streu hängt am Schirm (`_nahStreuKachel`)" },
    { token: "_disposeVoxelChunkScatter", fiel: "Waldboden" },
    { token: "_enqueueScatter", fiel: "Waldboden" },
    { token: "_tickPendingScatter", fiel: "Waldboden" },
    { token: "pendingScatter", fiel: "Waldboden" },
    { token: "voxelChunkScatter", fiel: "Waldboden — die Kachel trägt ihre Pflanzen (nahStreu.kacheln)" },
    { token: "_streuNahArt", fiel: "Waldboden — die Senke je Art × Gestalt × Stufe × Teil (_streuNahSenke)" },
    { token: "DEKO_FERNFELD", fiel: "Waldboden — jenseits der Nah-Streu trägt der Boden" },
    { token: "_tickDekoFernfeld", fiel: "Waldboden" },
    { token: "_buildDekoFernfeldSpecies", fiel: "Waldboden" },
    { token: "_dekoFernfeldZustand", fiel: "Waldboden" },
    { token: "_dekoFernSetzen", fiel: "Waldboden" },
    { token: '"deko-fernfeld"', fiel: "Waldboden" },
    { token: "_tickDeckStreu", fiel: "Waldboden" },
    { token: "_buildDeckStreuSpecies", fiel: "Waldboden" },
    { token: "_scatterChunkRng", fiel: "Waldboden — der Wurf-Strom je (Zelle, Art) lebt in _nahStreuKachel" },
    { token: "dekoDensity", fiel: "Waldboden — die Last-Dichte ist _effectiveFoliageDensity" },
    { token: "dekoDichte", fiel: "Waldboden — die Kaskade trägt keine Deko-Bänder" },
    { token: "_understoryNiche", fiel: "Waldboden — das Boden-Gesetz ist die EINE Platzierung (bodenGewicht)" },
    { token: "_undergrowthGroundFactor", fiel: "Waldboden" },
    { token: "_kronenMult", fiel: "Waldboden" },
    { token: "AnazhRealm.KRONEN", fiel: "Waldboden" },
    { token: "blumeFloor", fiel: "Waldboden" },
    { token: "farnFloor", fiel: "Waldboden" },
    // Die Arten-Namen des Zwillings als nackte Namen (ein Tafel-Schlüssel `blume_tulpe: "blume"` trägt keine Anführung —
    // die gequotete Form traf ihn nicht, Integration 05.10.).
    { token: "blume_tulpe", fiel: "Waldboden — die Blume ist die Studio-Blume" },
    { token: "blume_klee", fiel: "Waldboden — die Blume ist die Studio-Blume" },
    { token: "blume_mohn", fiel: "Waldboden — die Blume ist die Studio-Blume" },
    { token: "gestruepp_stecher", fiel: "Waldboden — das Gestrüpp ist das Studio-Gestrüpp" },
    { token: "schilf_rohr", fiel: "Waldboden — das Schilf ist das Studio-Schilf" },
    { token: 'farn_busch: "strauch"', fiel: "Integration Waldboden — das Kraut-Stratum ist der Studio-Farn" },
    // Das Farb-Gesetz der Host-Streu hatte nach dem Fall beider Host-Bauer keinen Leser mehr — die Studio-Arten backen
    // ihre Farbe im Studio (vegFarbe, gate:streu-wahrheit).
    { token: "_streuAlbedo", fiel: "Integration Waldboden — die Studio-Arten backen ihre Farbe im Studio (vegFarbe)" },
    // Die Alias-Arten fielen: Buche, Karst-Baum und stehendes Totholz sind eigene Studio-Arten; die Mammut-Nische des
    // Wald-Generators heißt baum_mammut (die Lab-Host-Tafel FOREST_SPECIES hält das, checkAliasArten).
    { token: 'baum_buche: "mammut"', fiel: "Waldboden — baum_buche ist die Studio-Buche" },
    { token: 'baum_karst: "eiche"', fiel: "Waldboden — baum_karst ist der Studio-Karst-Baum" },
    // DIE LUFT (V18.530) — der Nebel war eine lineare Wand an der Wald-Kante und verdeckte die gebaute Fernform;
    // die EINE Luftperspektive (`_luftEnsure` → scene.fogNode) ist Physik. Die Nebel-Kulisse ist ganz fort.
    { token: "new THREE.Fog(", fiel: "V18.530 — die Luft ist scene.fogNode, kein linearer Nebel" },
    { token: "_dayNightApplyHemiAndFog", fiel: "V18.530 — _dayNightApplyHemiUndLuft" },
    { token: "_smoothFogEdge", fiel: "V18.530 — kein Lade-Nebel, der Fern-Ring deckt Ungebautes" },
    { token: "_fogEdgeSmooth", fiel: "V18.530" },
    { token: "_builtGrassRingRadius", fiel: "V18.530 — die Gras-Front trieb nur den Lade-Nebel" },
    { token: "_builtWaterRingRadius", fiel: "V18.530 — die Wasser-Front trieb nur den Lade-Nebel" },
    { token: "AWAKEN_FOG_FAR", fiel: "V18.530 — kein Erwachen-Kokon" },
    { token: "FOG_EDGE", fiel: "V18.530 — keine Nebel-Kanten-Trägheit" },
    { token: "sichtOeffnungM", fiel: "V18.530 — keine Höhen-Öffnung, die Luft trägt in jeder Höhe" },
    { token: "_oeffnungUmgebung", fiel: "V18.530" },
    { token: "_syncAtmoToViewDistance", fiel: "V18.530 — kein Ring-gekoppelter Schleier" },
    { token: "_detailViewDistance", fiel: "V18.530" },
    { token: "hazeFar", fiel: "V18.530 — kein Höhen-Melt neben der Luft" },
    { token: "hazeNear", fiel: "V18.530" },
    { token: "setFogDistance", fiel: "V18.530 — der tote Fog-Distanz-Regler" },
    { token: "fogDistance", fiel: "V18.530" },
    { token: "slider-fog", fiel: "V18.530" },
    { token: "uFogNear", fiel: "V18.530 — kein Wasser-eigener Nebel" },
    { token: "_fernRingFarbe", fiel: "V18.530 — die Fern-Farbe liest die Boden-Farbe + den Wald (_fernFarbeAt)" },
    // DER HIMMEL (V18.530) — die drei Math.random-Planeten-Kugeln fielen: die Wandelsterne sind Punkte des
    // Sternfelds, die Dämmerung setzt die Grenzgröße.
    { token: "_buildSkyPlanets", fiel: "V18.530 — die Wandelsterne leben im Sternfeld" },
    { token: "_loopSkyboxPlanets", fiel: "V18.530 — _loopSkyboxZeit" },
    { token: "state.planets", fiel: "V18.530" },
    { token: "numPlanets", fiel: "V18.530" },
    // DER WEG IST BODEN (V18.530) — Straßen/Feldwege/Platz/Äcker fielen als Box-Streifen in die Wege-Karte; der
    // Pool trägt nur noch die hüfthohen Zäune (Zaun-Pool).
    { token: "_stlWegeAddStrip", fiel: "V18.530 — Wege malen in die Wege-Karte, Zäune in _stlZaunAddStrip" },
    { token: "_stlWegeEnsurePool", fiel: "V18.530 — _stlZaunEnsurePool" },
    { token: "_stlWegeDisposePool", fiel: "V18.530 — _stlWegeDispose (Zaun-Pool + Wege-Karte)" },
    { token: "state.stlWege", fiel: "V18.530 — state.stlZaun / state.wegeKarte" },
    // Integration 05.10.: EIN Fenster sicherte nur ~120 m — die Wege-Karte ist eine Clipmap aus zwei Stufen, die
    // Formen leben je Siedlung mit Hülle (der Umzug verwirft ferne Siedlungen in O(1)).
    { token: "wk.formen", fiel: "Integration 05.10. — wk.siedlungen (Formen je Siedlung, Hülle)" },
    {
        token: "Math.max(f.ex, f.ez)",
        fiel: "Integration 05.10. — _wegeFormRadius: die Diagonale des gedrehten Kastens",
    },
    // Integration 05.10.: das Kronendach der Ferne ist die Studio-Laubfarbe der Arten am Ort (phyto-core forestNische)
    // × die Selbstbeschattung, die Saison legt uSeasonMul auf — die feste Sommer-Konstante kehrt nicht zurück.
    {
        token: "kronendach: Object.freeze",
        fiel: "Integration 05.10. — _fernFarbeTeile (Art × kronenSchatten), uSeasonMul",
    },
    { token: "farbeJeTakt", fiel: "Integration 05.10. — das Fern-Farb-Budget (FERN_FARBE.msJeTakt, _fernFarbTakt)" },
    // V18.331 fiel Ammo.js (die Physik ist feld-nativ); V18.530 fiel mit ihr der CI-Schritt „Ammo-Memory-Leak-Indikator",
    // der btVector3 gegen destroy zählte und seit dem Abschied an „0\n0" rechnete (rot hinter continue-on-error).
    { token: "new Ammo.", fiel: "V18.331 — Feld-Physik; die Leck-Linse der CI fiel V18.530" },
    { token: "Ammo.destroy(", fiel: "V18.331 — Feld-Physik; die Leck-Linse der CI fiel V18.530" },
    // Welle 5 (05.10.): die schlanke Trauer-Klinge der Baum-L1 (tree[1].klinge Kontur-Segmente) las auf 12–26 m als
    // Papier-Streifen (Blick-Tour Bild 01, f:weide|1|1:2) — die Trauer-L1 trägt Strähnen aus dem Atlas (tree[1].straehne).
    { token: "_b1.klinge", fiel: "Welle 5 — die Trauer-L1 trägt Strähnen (tree[1].straehne), keine Klinge" },
    // Präzise Tokens (Integration 05.10.): `_klinge` als Teilstring hätte jeden künftigen Klingen-Bezeichner der
    // Schmiede getroffen — gefallen sind die Budget-Wand des Felds und der Kontur-Parameter von pushLeaf.
    {
        token: '".klinge fehlt"',
        fiel: "Welle 5 — die Budget-Wand von tree[1].klinge ist mit der Trauer-Klinge gefallen",
    },
    { token: "cup, seg)", fiel: "Welle 5 — die Segment-Zahl der Trauer-Klinge (pushLeaf seg) ist mit ihr gefallen" },
    // Der Grammatik-Pfad malte bei einem Atlas-Fehler still eine Ellipsen-Maske (fail-soft) — er bricht laut wie der
    // Laub-Stoff der Welt (KERN-PFLICHT).
    { token: "__foliageAtlasError", fiel: "Integration Welle 5 — kein Stoff ohne seinen Atlas (_blattAtlasProbe)" },
    // DER FERNWALD (05.10.) — ein Karten-Ding (Baum, Strauch: B2c fernform karte) ist jenseits der Mesh-Zone seine Karte
    // (B2c `fernform`, `_archKartenPreset`); der Baum-Satz aus Grammatik-Kegeln und Kronen-Lappen fiel ganz: sein Fit,
    // sein Beipack (Kern + Brücke), sein Schlüssel und der Kegel-Stumpf im Welt-March.
    { token: "_baumGrammatikFit", fiel: "05.10. — fern ist der Baum seine Karte (gate:fernwald)" },
    { token: "_baumKapselFit", fiel: "05.10. — _gestaltKapselFit (Fels, Blume der Gesetz-Streu)" },
    {
        token: "__baumGrammatik",
        fiel: "05.10. — der Grammatik-Beipack hatte keinen Leser mehr",
        auch: ["worlds/terrain/phytogenesis.js"], // die Brücke legte ihn in den Umschlag
    },
    { token: "sdCappedCone", fiel: "05.10. — kein Kegel-Stumpf im Welt-March (nur der Baum-Satz trug ihn)" },
    { token: "abaum:", fiel: "05.10. — die Gesetz-Streu heißt agesetz:, Bäume haben keinen Satz" },
    // Integration 05.10.: der Horizont-Schwund der Karten-Maske (jede Karte, die im Band STAND, blieb ein Geist — am Grat
    // die ganze Streu) und die Zonen-Klemme am Radius (ein Riese sprang dort ohne Band; jenseits des Bands wählt die EINE
    // Stufen-Wahl die Karte selbst) fielen: der Rand des gesetzten Waldes ist je Eintrag ein CPU-Rand im Saum.
    {
        token: "opts.fernNode",
        fiel: "Integration 05.10. — kein Distanz-Schwund in der Karten-Maske (_archKartenHorizont)",
    },
    { token: "KARTEN_HORIZONT_SCHWUND_M", fiel: "Integration 05.10. — KARTEN_HORIZONT_SAUM_M (Rand je Eintrag)" },
    {
        token: "_archInKartenZone",
        fiel: "Integration 05.10. — die EINE Stufen-Wahl (_chooseLODForDistance) trägt fern",
    },
    { token: "entry._fernKarte", fiel: "Integration 05.10. — kein Zonen-Voll-Stempel (_lodSlotVoll)" },
    // WELLE 5 BODEN + WASSER (05.10.): das Wasser deckt nach dem Durchlass-Gesetz (Beer-Lambert über den optischen Weg in
    // Metern, R∞ aus Absorption und Rückstreuung) — die Viewport-Regler des Ufers und der Tiefen-Farbe sind gefallen,
    // der Spiegel liest die Himmels-Umgebung statt der Zenit-Tönung, ruhiges Wasser trägt keinen Schimmer-Schaum, ein
    // Sheet liest das GEZEICHNETE Dach seiner Nachbarn (nie den Live-Pegel); der Boden trägt die Studio-Palette nach dem
    // Farb-Gesetz (kein Zwilling im Stamm/Worker, kein Buch-Umschlag-Cache), die Dürre-Flecken und der Fragment-
    // Waldkern sind gefallen, das tiefe Anzeige-Blau des Studios ist nicht der Wasser-Körper.
    { token: "setWaterShoreWidth", fiel: "Welle 5 — der optische Weg in Metern trägt das Ufer" },
    { token: "setWaterDepthRange", fiel: "Welle 5 — der Durchlass trägt die Tiefen-Farbe" },
    { token: '"slider-watershore"', fiel: "Welle 5 — kein Ufer-Regler" },
    { token: '"slider-waterdepth"', fiel: "Welle 5 — kein Tiefen-Regler" },
    { token: "waterShoreWidth", fiel: "Welle 5" },
    { token: "waterDepthRange", fiel: "Welle 5" },
    { token: "uShoreWidth", fiel: "Welle 5" },
    { token: "uDepthRange", fiel: "Welle 5" },
    { token: "waterThick", fiel: "Welle 5 — wegM (optischer Weg in Metern)" },
    { token: "lakeBaseFoam", fiel: "Welle 5 — ruhiges Wasser schäumt nicht" },
    // Präzise Tokens (Integration 06.10.): die nackten Namen getLevel/floorMax/uSkyCol/_dryW wären Teilstrings
    // künftiger fremder Namen (getLevelOfDetail, uSkyColor, _dryWind) — die Wand nennt die gefallene Gestalt.
    { token: "const uSkyCol ", fiel: "Welle 5 — das Wasser spiegelt die Himmels-Umgebung (_himmelUmgebungTex)" },
    { token: "skyCol: uSkyCol", fiel: "Welle 5 — der Spiegel liest die Himmels-Umgebung" },
    { token: "WG.tief", fiel: "Welle 5 — der Wasser-Körper ist R∞ = 0,33·b_b/(wK+b_b) (WASSER_GESETZ.koerperStreu)" },
    { token: "ctx.getLevel(", fiel: "Welle 5 — das Sheet liest das gezeichnete Dach (getDach, _caDach)" },
    { token: "getLevel: (", fiel: "Welle 5 — der Sheet-Kontext trägt getDach, keinen Live-Pegel" },
    { token: "_studioGround", fiel: "Welle 5 — die Boden-Palette liegt synchron im Terrain-Namensraum (BODEN_FARBE)" },
    { token: "0.42, 0.44, 0.49", fiel: "Welle 5 — der Stein-Zwilling; die Palette ist Studio PORTAL_GROUND linear" },
    { token: "litTint", fiel: "Welle 5 — der Fragment-Waldkern; die Laubstreu folgt den Kronen (_kronenStreuNeu)" },
    { token: "G.floorMax", fiel: "Welle 5 — der Fragment-Waldkern" },
    { token: "floorMax: 0.55", fiel: "Welle 5 — der Deckel des Fragment-Waldkerns" },
    { token: "const _dryW ", fiel: "Welle 5 — die Dürre-Flecken (Albedo × 1,32/1,12/0,6) färbten die Streu orange" },
    { token: ".sub(_dryW)", fiel: "Welle 5 — die Dürre-Flecken" },
    // Integration 06.10.: die Insel trug eine eigene Literal-Palette (Absichts-Farben roh als linear, im Stoff ein
    // zweites Mal mit der Vertex-Farbe multipliziert), der Substanz-Kern ein eigenes Moos — die EINE Boden-Palette
    // (BODEN_FARBE: mead · dirt · rock, Moos = TERRAIN_GEOLOGY.mossTint) trägt beide.
    { token: "[0.3, 0.52, 0.22]", fiel: "Integration 06.10. — die Insel-Wiese ist BODEN_FARBE.mead" },
    { token: "[0.4, 0.3, 0.18]", fiel: "Integration 06.10. — der Insel-Hang ist BODEN_FARBE.dirt" },
    { token: "[0.34, 0.32, 0.3]", fiel: "Integration 06.10. — der Insel-Fels ist BODEN_FARBE.rock" },
    { token: "[0.26, 0.38, 0.18]", fiel: "Integration 06.10. — das EINE Moos ist TERRAIN_GEOLOGY.mossTint" },
    // Integration 06.10.: die Kronen-Karte ist der Bestand — der Wald-Baum trägt sich in spawnArchitecture ein (a:<id>),
    // nie beim Wurf (der Zweit-Boot pflanzt nicht neu); die Summe nimmt eine Krone exakt heraus, kein Voll-Neumalen.
    { token: "_kronenStreuNeu(`w:", fiel: "Integration 06.10. — spawnArchitecture trägt die Krone ein (a:<id>)" },
    { token: "kronen.neuMalen", fiel: "Integration 06.10. — _kronenStreuWeg nimmt eine Krone exakt aus der Summe" },
    // WELLE L KREATUR (06.10., Leben-Prüfung Q1/Q2): der Hüpf-Würfel je Frame (R-D3: 21–26 % Luft-Frames, 2,4 % der
    // Sprünge aus einer Aktion), der feste 0,05-s-Schritt des Hüpfers (bei 144 Hz ein Sechstel der Flugzeit) und das
    // Wachsen-Relikt V7.66 (×1,01 je 5-%-Würfel, ohne Deckel; R-D2) kehren nicht zurück — der Hüpfer ist EIN Integrator
    // auf dem Takt (v0 = √(2·g·h)), er startet nur aus einer Aktion, die Größe ist die Achse bodySize.
    { token: '(emotion === "happy" ? 0.02 : 0.01)', fiel: "Welle L kreatur — der Hüpfer startet nur aus bound/pounce" },
    { token: "_hopV * 0.05", fiel: "Welle L kreatur — der Hüpfer integriert auf delta (updateCreatures)" },
    // DAS SPRUNG-GESETZ (Nachbesserung 07.10., Vertrags-Akt): die Huepf-Hoehe der Freude ist die EINE Quelle eines
    // Sprungs (creatureJump, v0 = √(2·g·h)) — der lineare Faktor Hoehe → m/s und der Abflug in m/s der Aktionen (bound
    // 3,2, pounce 4,5: der frohe Sprung stieg 0,52 statt 1,2 m) kehren weder im Stamm noch im Gesetzbuch zurueck.
    { token: "impulsProM", fiel: "Welle L kreatur — der Abflug ist v0 = √(2·g·h) (creatureJump)", auch: ["tetrapoda-core.js"] },
    { token: "_hopV = def.hop", fiel: "Welle L kreatur — eine Aktion springt über creatureJump (das Sprung-Gesetz)" },
    { token: "updateGrowth", fiel: "Welle L kreatur — die Größe ist bodySize aus der Identität, kein Wachsen-Würfel" },
    { token: "lastGrowthUpdate", fiel: "Welle L kreatur — das Wachsen-Relikt fiel" },
    // WELLE L KREATUR (Q3): die Witterungs-Jagd auf vier Himmelsachsen (R-D12) und die Sicht-Kopie, die die Gier des
    // Senders hart setzt und nicht geht, kehren nicht zurück — der Gradient ist die zentrale Differenz, die Kopie zieht
    // auf dem kurzen Bogen nach und läuft durch den Baum-Gang.
    { token: "out.set(bestDx, 0, bestDz)", fiel: "Welle L kreatur — der Geruchs-Gradient (zentrale Differenz)" },
    { token: "m.rotation.y = rc.tyaw || 0", fiel: "Welle L kreatur — _p2pTickRemoteCreatures zieht die Gier nach" },
    // WELLE L KREATUR (Q11 + CPU): der Hindernis-Strahl je Tier und Frame (feste Diagonale, nur im Blick, Antwort ein
    // Math.random-Stoß; 29–37 % der CPU im OMEN-Profil) kehrt nicht zurück — jedes Tier löst seine Achse über den EINEN
    // Kontakt-Löser gegen die Hüllen (_kreaturHuellenKontakt), die Herde ist die Form des Kerns (herdeZug).
    // WELLE LF RUDEL (Leben-Schau 07.10., Neu 1): der Nexus würfelt kein Körper-Gesetz — der absolute Gang- und Sprung-
    // Würfel (Gehen 4–12, Sprungkraft 8–20), die Tier-Skala ohne bodySize-Achse und die Spieler-Skala ohne Gesetz-Achse
    // (player_size_mul) kehren nicht zurück; ein Op wiegt nur im Gesetz-Band (_koerperHauch, _kreaturGroesseSetzen).
    { token: '"player_jump_power", Number((8', fiel: "Welle LF rudel — kein Würfel schreibt die Sprungkraft" },
    { token: '"player_speed", Number((4', fiel: "Welle LF rudel — kein Würfel schreibt das Lauf-Tempo" },
    { token: '"creatures_size_mul", Number(', fiel: "Welle LF rudel — kein Würfel schreibt die Tier-Größe" },
    { token: "cr.scale.multiplyScalar(f)", fiel: "Welle LF rudel — die Tier-Größe ist die bodySize-Achse" },
    { token: "player_size_mul", fiel: "Welle LF rudel — die Spieler-Skala ohne Gesetz-Achse fiel" },
    { token: "cr.userData.speedMul =", fiel: "Welle LF rudel — der Tempo-Hauch wird gelesen (tempoHauch)" },
    // WELLE LF RUDEL (D16/K-D12, Vertrags-Akt 08.10.): das Temperament aus der Substanz (Resonanz-Signaturen, Floor, die
    // Substanz-Gewichte der Furcht, der predator-Stempel als Gemüt) kehrt weder im Stamm noch im Gesetzbuch zurück — die
    // Tiere sind tag-gleich (Lehre 8), das Gemüt ist temperamentDerGattung (Ernährung × Masse).
    { token: "TG.signaturen", fiel: "Welle LF rudel — das Temperament ist temperamentDerGattung" },
    { token: "_temperamentSoul", fiel: "Welle LF rudel — das Temperament ist je Gattung × Größe gecacht" },
    { token: "boldFromDichte", fiel: "Welle LF rudel — die Natur ist der Mut des Temperaments", auch: ["tetrapoda-core.js"] },
    { token: "shyFromLebendig", fiel: "Welle LF rudel — die Natur ist der Mut des Temperaments", auch: ["tetrapoda-core.js"] },
    // WELLE LF RUDEL (Vertrags-Akt 08.10., der persönliche Raum): der feste Paar-Radius jeder Art, das feste Herden-Fenster
    // und der feste Neugier-Stopp kehren nicht zurück — der Raum ist die Körper-Kugel des Leibs × raumKugel.
    { token: "radiusBaseM", fiel: "Welle LF rudel — der Raum je Leib (separation.raumKugel)", auch: ["tetrapoda-core.js"] },
    { token: "minAbstSq", fiel: "Welle LF rudel — die Herde zieht jenseits des Paar-Raums", auch: ["tetrapoda-core.js"] },
    { token: "fensterSq", fiel: "Welle LF rudel — das Herden-Fenster misst im Paar-Raum", auch: ["tetrapoda-core.js"] },
    { token: "neugierStoppM", fiel: "Welle LF rudel — die Neugier hält am Paar-Raum", auch: ["tetrapoda-core.js"] },
    // WELLE LF RUDEL (Vertrags-Akt 08.10., die Jagd schließt sich): der Gradient der Witterung über vier Proben (nah an
    // der Quelle zeigte er vom Ziel fort), der Trab der Flucht und der Biss-Takt auf der Wand-Uhr kehren nicht zurück.
    { token: "scentProbeM", fiel: "Welle LF rudel — die Witterung wählt die Beute an der Nase", auch: ["tetrapoda-core.js"] },
    { token: "this._scentAt(cx + probeStep", fiel: "Welle LF rudel — kein Gradient der Witterung" },
    { token: "fleeSpeedBoost", fiel: "Welle LF rudel — die Flucht ist der Sprint der Gestalt", auch: ["tetrapoda-core.js"] },
    // WELLE LF RUDEL (Leben-Schau 07.10., D11/D1-Rest): das Fuß-Ziel in der Ebene des Leibs (das Ziel im Gruppen-Raum,
    // per Rumpf-Quaternion zurückgedreht — am Querhang kippten die Beine mit dem Leib) kehrt nicht zurück.
    { token: "_gangQ", fiel: "Welle LF rudel — das Fuß-Ziel liegt in der Welt (Pfoten-IK _animateTierBaum)" },
    { token: "OBSTACLE_RAYCAST_MAX_DIST_SQ", fiel: "Welle L kreatur — _kreaturHuellenKontakt (kein Strahl je Frame)" },
    { token: "hasHit = this._runRaycast(", fiel: "Welle L kreatur — _kreaturHuellenKontakt" },
    // Nachbesserung 06.10.: der Umzug der fernen Stufe vergaß jede Krone jenseits seines Fensters — auch die Eintrags-
    // Kronen (a:), die nur beim Entstehen eintragen; der Raum-Index `kronenZellen` bindet die Kosten an den Streifen.
    {
        token: "this._kronenStreuUmzug(stufe, war, S === fernS)",
        fiel: "Nachbesserung 06.10. — kein Umzug vergisst eine Krone",
    },
    // Integration 06.10.: kein Kronendach in der Boden-Albedo (Lehre 21: nie doppelt) — weder das Platzierungs-Feld im
    // Vertex (Main + Worker-Spiegel samt seinem Kronenlicht-Zwilling) noch die Labor-Abdunklung der Streu.
    { token: "const _cShade =", fiel: "Integration 06.10. — der Schatten der echten Krone dunkelt, nie das Feld" },
    { token: "function canopyLightAt(", fiel: "Integration 06.10. — der Worker färbt ohne Kronenlicht-Feld" },
    { token: "function placementStandForest(", fiel: "Integration 06.10. — der Worker-Spiegel des Wald-Stands fiel" },
    {
        token: "_p2pDisposeMesh",
        fiel: "Frost-Nachbesserung 08.10. — der Mitspieler-Leib entsorgt über die EINE Regel _disposeSoulGroup",
    },
    { token: "UNDERGROWTH_CANOPY_K", fiel: "Integration 06.10. — der Worker-Spiegel des Kronenlicht-Felds fiel" },
    {
        token: "_k.mul(_T.float(0.42))",
        fiel: "Integration 06.10. — die Streu trägt ihre Albedo, die Krone ihren Schatten",
    },
    // Integration 06.10. — was die Welle 5 im Wasser-Stoff des Hosts ohne Namen strich (Prüfer-Urteil): die empirische
    // Schattierung l0 + l1·diff + l2·Welle (WASSER_GESETZ.licht), die Zenit-Dimmung des Spiegels (spiegel.dim) und die
    // Noise-Tönung zwischen Tief und Flach (baseN/mixT). Der Host trägt dafür das physikalische Modell (R∞-Körper,
    // Beer-Lambert-Durchlass, Schlick-Fresnel, Himmels-Umgebung); das Studio-GLSL liest die alten Felder weiter.
    { token: "WG.licht[0]", fiel: "Welle 5 — der Wasser-Körper ist R∞ im Licht des Orts (koerperAlbedo × uIrr)" },
    { token: "WG.spiegel.dim", fiel: "Welle 5 — der Spiegel ist die Himmels-Umgebung × Schlick-Fresnel" },
    { token: "const mixT = mix(", fiel: "Welle 5 — Tief und Flach trennt der Durchlass, kein Noise-Mix" },
    { token: "vnoise(xz.mul(0.05).add(uTime.mul(0.03)))", fiel: "Welle 5 — die Noise-Tönung baseN des Wassers" },
    // Integration 06.10. — DIE GLUT GEHÖRT INS STUDIO (der Default E-E „glut = Nicht-Studio-Silhouette" fiel): das
    // Glut-Genom des Wirts (sechs Formationen glut_var0..5, eigener Streu-Pool) ist gefallen, die Feuerstelle baut das
    // Gesetzbuch (fachwerk `feuerstelle`); gespeicherte glut_var-Einträge führt BAUPLAN_UMZUG zur Feuerstelle.
    { token: "_glutVariant(", fiel: "Welle 5 architektur — die Feuerstelle trägt ihre Gestalten im Gesetzbuch" },
    { token: "GLUT_VARIANTS", fiel: "Welle 5 architektur — glutbrunnen streut ohne Formations-Pool" },
    { token: 'prefix: "glut"', fiel: "Welle 5 architektur — kein Glut-Pool im SCATTER_VARIANT_POOL" },
    // Integration 06.10. (W5-Körper) — DIE DECKUNG FOLGT DER HAUT: der Ofen deckte den Rumpf über Ellipsoide mit festen
    // Radien um sechs Stationen (die Wirte-Liste des Deck-Mantels) und den Hals über EINE Zeile an der Hals-Mitte; nach
    // der Anatomie-Welle lagen Bär-Rumpf, Läufe und Hirsch-Hals kahl. Die Zeilen sitzen auf bauTier.fellOrt.
    {
        token: "row.wirte",
        fiel: "Integration W5-Körper — der Deck-Mantel liegt auf der Haut der Wurzel (Strähnen je Fläche)",
    },
    { token: "Math.sqrt(anteil * 3)", fiel: "Integration W5-Körper — kein fester Mantel-Radius je Wirt" },
    {
        token: "T.neckMid",
        fiel: "Integration W5-Körper — der Hals-Mantel ist eine Röhre entlang des Halses",
        auch: ["tetrapoda-core.js", "worlds/tetrapoda/tetrapoda.js"],
    },
    // Integration 06.10. (W5-Körper) — DIE AUGEN-FARBE HAT EINE QUELLE (tetrapoda tierAuge): das Lab las das feste
    // Bernstein der Material-Tabelle, der Ofen rechnete die Art-Farbe selbst um.
    { token: "art.kopf.auge", fiel: "Integration W5-Körper — der Ofen liest kern.tierAuge" },
    {
        token: "__TK.tierauge.c,",
        fiel: "Integration W5-Körper — das Lab liest tierAuge",
        auch: ["worlds/tetrapoda/tetrapoda.js"],
    },
    {
        token: "__TK.tierauge.emissiv",
        fiel: "Integration W5-Körper — die Glut ist ein Anteil der Iris (tierAuge)",
        auch: ["worlds/tetrapoda/tetrapoda.js"],
    },
    {
        token: "emissiv: 0x442200",
        fiel: "Integration W5-Körper — tierauge trägt glut, keine eigene Farbe",
        auch: ["tetrapoda-core.js"],
    },
    // Integration 06.10. (W5-Körper) — DIE HAND-MITTE TRÄGT DIE HAND: die Welt-Konstante der Faust (die Hand vor Welle 5)
    // ließ den Griff 0,072 m neben der neuen Hand; der Ofen gibt den Schwerpunkt der Hand-Haut im Beipack mit.
    { token: "faustOffset", fiel: "Integration W5-Körper — der Griff sitzt auf rig.handMitte (Ofen-Beipack)" },
    // Integration 06.10. (W5-Körper) — die Galileo-Allometrie des Wirts (√L auf die Glied-Kinder) lief für kein Studio-Tier
    // mehr (es trägt keine Teil-Kinder); die Glied-Dicke ist Gesetz der Art, die Körpergröße skaliert uniform.
    { token: "_applyCreatureAllometry", fiel: "Integration W5-Körper — die Glied-Dicke trägt ART_GESTALT.bein" },
    // Welle 5 Klang: die Klang-Welt ist das klang-Gesetzbuch (klang:UMWELT über umweltGraph). Der 110-Hz-Drohn ohne
    // Gesetz, die Regen-Schicht mit zwei Schreibern (0,014 vs 0,045), die Hydro-Schicht, die je Takt jedes Fluss-Segment
    // der Welt vermaß, und die Sinus-Pings statt Tier-Stimmen kehren nicht zurück (gate:klang-zensus nennt jeden Täter).
    // Präzise Tokens (Integration 06.10.): `s.ambient` traf jedes `lights.ambient`/`uniforms.ambient`, `ambientGain` und
    // `_pointSegDist2D` sind Namen, die ein künftiges Bus-/Geometrie-Werkzeug legitim tragen darf, `symphony.weather`
    // wäre der Anfang jedes künftigen Wetter-Reglers der Symphonie — die Wand nennt die gefallene Gestalt.
    { token: "ambient.osc1", fiel: "Welle 5 Klang — der Drohn; die Welt rauscht aus klang:UMWELT (wind/laub/…)" },
    { token: "ambient.ambientGain", fiel: "Welle 5 Klang — der Drohn" },
    { token: "symphony.weather)", fiel: "Welle 5 Klang — Regen = UMWELT.stimmen.regen aus dem rain-Kanal" },
    { token: "symphony.weather;", fiel: "Welle 5 Klang — Regen = UMWELT.stimmen.regen aus dem rain-Kanal" },
    { token: "_symphonyWeatherTarget", fiel: "Welle 5 Klang — Regen = UMWELT.stimmen.regen" },
    { token: "hydroAudio", fiel: "Welle 5 Klang — Ufer/Fluss/Fall aus dem Hör-Ring (_umweltRingProbe)" },
    { token: "_buildHydroAudioLayer", fiel: "Welle 5 Klang — _umweltKlangBauen" },
    { token: "_tickHydrosphereAudio", fiel: "Welle 5 Klang — _umweltKlangTick (Kosten je Frame konstant)" },
    {
        token: "_pointSegDist2D(px, pz, pts[k]",
        fiel: "Welle 5 Klang — der Fluss-Segment-Scan je Takt (Kosten ∝ Weltgröße)",
    },
    { token: "playCreaturePing", fiel: "Welle 5 Klang — _tierRuf (die Stimme folgt dem Körper)" },
    { token: "creaturePingCount", fiel: "Welle 5 Klang — symphony.tierRufe" },
    { token: "_tagToFrequency", fiel: "Welle 5 Klang — UMWELT.tier (Grundton ∝ Körperlänge^−0,9)" },
    // Die Körperlänge des Rufs maß eine Box3 über den GERENDERTEN Körper (skinnte jede Haut-Ecke auf der CPU) neben
    // der Seelen-Teile-Länge des Hangs: EINE Quelle ist _creatureKoerperLaenge (Hang + Stimme).
    { token: "_tierKoerperLaenge", fiel: "Welle 5 Klang — _creatureKoerperLaenge (EINE Körperlänge)" },
    // Integration 06.10. (W5-Klang) — DIE KLASSE „Sinus-Ping statt Tier-Stimme" fällt ganz: die Antwort eines Tiers auf
    // einen Auftrag, sein Trink-Beginn und sein Aufstieg sind seine Stimme (`_tierRuf`, klang:UMWELT.tier), das Inventar
    // klingt aus klang:SUBSTANZ.inventar (gate:klang-zensus nennt jede Quell-Stelle des Stamms ohne Wirt-Leser).
    { token: "_playCreatureTaskPing", fiel: "Integration W5-Klang — das Tier antwortet mit seiner Stimme (_tierRuf)" },
    { token: "CREATURE_TASK_PING_FREQ", fiel: "Integration W5-Klang — keine Ping-Tonhöhe je Auftrag" },
    { token: "CREATURE_SPECIALIZATION_PING_FREQ", fiel: "Integration W5-Klang — der Aufstieg ist ein Freuden-Ruf" },
    // Die Glut klingt mit ihrer BRENN-Fläche (Bezug: das Glutbett der Studio-Feuerstelle, Ø 0,76 m), nie mit dem
    // Volumen einer Glut-Hülle.
    { token: "_glutVolumen", fiel: "Integration W5-Klang — _glutFlaeche (die Brenn-Fläche)" },
    {
        token: "vRefM3",
        fiel: "Integration W5-Klang — UMWELT.stimmen.glut.bettRefM (das Glutbett der Studio-Feuerstelle)",
        auch: ["klang-core.js", "worlds/klang/klang.js"],
    },
    // Das Ohr liest die Kronen-Karte der STEHENDEN Bäume (`_kronenStreuAt`), nie das Kronenlicht-Feld der Platzierung.
    {
        token: "1 - this._canopyLightAt(px, pz, fussY)",
        fiel: "Integration W5-Klang — die Laub-Deckung ist _kronenStreuAt",
    },
    // Der Wasser-Hauch klingt nur, wo Wasser ist: jeder Bau und Abbau reicht seine Fußabdrücke (`_nassAt`) — der Aufruf
    // ohne Fußabdruck hauchte bis 06.10. auch fern jedes Ufers (der Stein-Abbau war nie stumm).
    { token: "this._playWaterReactionPing()", fiel: "Integration W5-Klang — _playWaterReactionPing(fussabdruecke)" },
    // DER FELD-CULL FÄLLT (05.10.) — sein Ziel, die @s:-Fernstufen der Streu, gibt es nicht mehr (die Streu beginnt
    // erst jenseits ANALOG_NAH_M, ihre Fernstufe ist die Karte im EINEN Atlas oder ein Gesetz-Platz). Gemessen an der
    // Mess-Wiese (echte GPU): im Stand 0 Adoptionen in 2600 Takten; beim Wandern griff er nur an Geröll-L0-Familien und
    // verwarf dort vor allem freie Slots (57 Instanzen, 12 lebend) — im Hauptbild allein, die Kaskaden zeichneten weiter
    // alle. Der Konsument zeichnete indirekt, die Band-Linse zählte ihn mit der Kapazität. Name kommt nicht zurück.
    { token: "feldCull", fiel: "05.10. — der Feld-Cull (Compute-Kompaktierung + indirekte Draws) fiel ganz" },
    { token: "FeldCull", fiel: "05.10. — die Linsen-Haken __anazhFeldCull/__anazhFeldCullExtern" },
    { token: "FELD_CULL", fiel: "05.10." },
    { token: "IndirectStorageBufferAttribute", fiel: "05.10. — kein indirekter Draw, den die Band-Linse nicht zählt" },
    // W6 (05.10.) — der GPU-Abschied: `InstancedMesh.dispose()` gab in r184 nichts frei (kein Objekt-Ereignis), die Instanz-
    // Puffer jeder gefallenen Senke blieben in r184s Register (Mess-Wiese nach drei Wander-Schleifen: 1 530 Instanz-Matrizen
    // ohne Halter, dazu 55,6 MB ruhende Foundry-Gestalten und der gewachsene Boden-Satz). Eine Senke fällt über
    // `_instanzAbschied`, was den Graphen verlässt über den Kehraus (`_gpuKehraus`); gate:freie-slots (A) prüft den Abschied.
    { token: "g.mesh.dispose()", fiel: "W6 — _instanzAbschied (die Instanz-Gruppe)" },
    { token: "P.mesh.dispose()", fiel: "W6 — _instanzAbschied (Fundament- und Zaun-Pool)" },
    { token: "R.mesh.dispose()", fiel: "W6 — _instanzAbschied (der Rauch-Satz des Dorfs)" },
    { token: "a.mesh.dispose()", fiel: "W6 — _instanzAbschied (die Senken der Nah-Wiese und der Nah-Streu)" },
    // Integration W6 (06.10.): die Senke der Nah-Wiese war eine Kopie der Senke der Nah-Streu — beide wachsen über EINEN
    // Bauer (`_senkeMesh`, Eltern-Knoten als Argument).
    { token: "_streuNahMesh", fiel: "Integration W6 — EINE Senke (_senkeMesh)" },
    { token: "_nahWieseMesh", fiel: "Integration W6 — EINE Senke (_senkeMesh)" },
    // DIE NAH-WIESE IST EIN SATZ (Welle 6, 05.10.): je Kachel × Vorlage eine InstancedMesh (56 Meshes, 20 Befehle, die
    // Kachel cullte nur als Ganzes, die Stufe hing an der Kachel-Mitte) — jetzt EINE Senke je Vorlage × Stufe × Teil,
    // gefüllt vom Sicht-Satz je Büschel (`_nahWieseSicht`). Der Kachel-Mesh-Bau und sein Entsorgen kehren nie zurück.
    { token: "_nahWieseKachelMeshes", fiel: "Welle 6 — die Senken der Nah-Wiese (_nahWieseSenken, _nahWieseSicht)" },
    { token: "_nahWieseKachelEntsorgen", fiel: "Welle 6 — die Kachel trägt nur Daten (_nahWieseKachelFaellt)" },
    { token: '"nahWiese:" + key', fiel: "Welle 6 — kein Mesh je Kachel (nahWiese:<v>:L<stufe>:<teil>)" },
    // DIE STUFE 0 HAT EINE BEDEUTUNG (Welle 6, 06.10.): buildInstance baute den Strauch über die Steuer-Globale
    // `__strauchZeile` als Nah-Stufe, das Labor (build() → emitTree, Knopf L0) als Klingen-Krone (~175k Dreiecke, kein
    // Golden, kein Empfänger). Die Abbildung Stufe → Rezept wohnt in `stufenRezept` (die Stufen-Wand unten); die Globale
    // und das Blatt-Budget des Strauch-Rezepts 0 kehren nie zurück.
    {
        token: "__strauchZeile",
        fiel: "Welle 6 — die Holz-Zeile ist die Stufe selbst (stufenRezept, emitTree)",
        auch: ["worlds/terrain/phytogenesis.js"],
    },
    { token: "[4000, 1500, 1400]", fiel: "Welle 6 — der Strauch hat kein Rezept 0 (die Klingen-Krone)" },
    // DER SATZ FOLGT SEINEM INHALT (W7): der leere Satz war ein Sonderfall, der nur auf die Start-Kapazität zurückkehrte —
    // ein belegter Satz hielt sein Hochwasser (Boden 24,9 statt 16,4 MB, Bau 12,0 statt 1,3 MB nach dem Wandern).
    // `_chunkSatzVerdichten` schrumpft jeden Satz auf seinen Inhalt; der Leer-Takt und sein Feld kehren nie zurück.
    { token: "_chunkSatzLeert", fiel: "W7 — _chunkSatzVerdichten (der leere Satz ist der Fall Inhalt 0)" },
    {
        token: "s.leerSeit",
        fiel: "W7 — s.ueberSeit (die Frist zählt ab dem Überschreiten der Schwelle, für jeden Satz)",
    },
    // W7 (06.10.) — DIE NAH-STREU ZEICHNET JE STOFF: je Art × Gestalt × Stufe × Teil zeichnete eine InstancedMesh den ganzen
    // Ring (echte GPU, Mess-Wiese: 15 Befehle, 46k Dreiecke, auch hinter dem Blick); der wiegende Stoff war je Studio-Skala
    // ein eigener und las die Höhe aus der Vorlage (r184 rechnet den positionNode VOR der Instanzierung). Die Senke ist
    // Daten, ihr Block ein Bereich im Streu-Satz ihres Stoffs (`_streuSatzArt`), die Höhe reist als `aWiege` (m).
    {
        token: "this._senkeMesh(a, 64, this.state.scene)",
        fiel: "W7 — die Nah-Streu-Senke zeichnet nie selbst (_streuSatzArt)",
    },
    { token: "positionGeometry.y.mul(wiegen)", fiel: "W7 — die Höhe der wiegenden Nah-Streu ist aWiege (_satzBlock)" },
    { token: '"|wiegt:"', fiel: "W7 — EIN wiegender Stoff je Regler, nie je Studio-Skala (|wiegt)" },
    // W7-VEREINIGUNG — DAS EINE GESETZ DER PASS-WAHL: im selben Haken wählten drei Wege (Sätze und Bündel-Werfer nach der
    // Box, die Pflanzen-Stufen nach Kugel · Kapsel · Fenster, die Karten als Senken-Kopie ihrer Sicht); die Box der fernen
    // Kaskade zog den nahen Boden (boden k1 173 784 über der Ratsche 90 845). Jetzt urteilt `_passTrifft` über jeden Körper
    // jedes Passes, die Karten sind eine Gruppe der Instanz-Wahl, die Kanten des Fensters kommen aus dem Blend-Gesetz.
    { token: "kartenSicht", fiel: "W7-Vereinigung — die Karten sind eine Gruppe der Instanz-Wahl (_instanzWahlPass)" },
    { token: "_sichtKugel", fiel: "W7-Vereinigung — das EINE Gesetz der Pass-Wahl (_passTrifft)" },
    { token: "_instanzKapselTrifft", fiel: "W7-Vereinigung — die Licht-Kapsel gilt jedem Leser (_passTrifft)" },
    { token: "_instanzWahlLage", fiel: "W7-Vereinigung — EINE Lage je Pass für jeden Leser (_passWahlLage)" },
    { token: "INSTANZ_WAHL", fiel: "W7-Vereinigung — die Konstanten des Gesetzes (PASS_WAHL)" },
    { token: "SICHT_RAND", fiel: "W7-Vereinigung — der Rand ist ein Teil des Gesetzes (PASS_WAHL.sichtRand)" },
    // DIE SPERRE STATT DES URTEILS (Welle 7, 06.10.): die Horizont-Probe sagte nur „verdeckt" und nahm an, der Strahl laufe
    // bis zur Mündung in Himmels-Luft — aus der Höhle hinaus fehlten 3 Zellen (2,8 % des Bilds). Sie misst die fernste
    // Sperre (`_hoehlenSperre`), und der Lauf geht aus jeder erreichten Zelle hinaus (`_hoehlenHinaus`).
    { token: "_hoehlenVerdeckt", fiel: "Welle 7 — die Horizont-Sperre (_hoehlenSperre) und der Weg hinaus" },
    { token: "tor.verdeckt", fiel: "Welle 7 — die Mündung trägt ihre Sperre (tor.sperre)" },
    // DIE SPERRE GILT JE BODEN (W7-Vereinigung): das Gedächtnis der Sperre galt je Auge allein — ein neuer Boden im Stand
    // (Graben, Ring, Geomorph) erreichte es nicht. `_hoehlenAugeGleich` liest die Generation des Bodens (`H.boden`).
    { token: "_hoehlenAugeGleich(tor,", fiel: "W7-Vereinigung — die Sperre gilt je Auge UND je Boden (H.boden)" },
    // DIE EINE SHADER-KOSTEN-LINSE (Welle G, 06.10.): zwei Zweige brachten je einen WGSL-Zähler — `werkbank shader`
    // (scripts/lib/shader-kosten.cjs, Frame-Zensus je Programm) und `werkbank stoff` (scripts/lib/stoff-linse.cjs, Budget
    // des Boden-Stoffs, eigener Funktions-Parser, eigene Rausch-Regel). Es zählt EINE Bibliothek mit EINEM Befehl: das
    // Budget je Stoff (`shader --stoff`) und die Rausch-Probe (`--rauschprobe`) sind Teile der Shader-Kosten-Linse.
    {
        token: "lib/stoff-linse",
        fiel: "Welle G — EINE Shader-Kosten-Linse (scripts/lib/shader-kosten.cjs)",
        auch: ["scripts/werkbank.cjs", "scripts/playtest.cjs", "scripts/diag-post-kette.cjs"],
    },
    {
        token: "__stoffProgramm",
        fiel: "Welle G — das Programm eines Stoffs liest der Frame-Zensus (__shaderKosten, stoffe)",
        auch: ["scripts/werkbank.cjs", "scripts/playtest.cjs"],
    },
    { token: 'cmd === "stoff"', fiel: "Welle G — `werkbank shader --stoff`", auch: ["scripts/werkbank.cjs"] },
    { token: 'req.url === "/stoff"', fiel: "Welle G — der Weg /shader", auch: ["scripts/werkbank.cjs"] },
    // WELLE G (06.10.): der Feld-Pass war EIN Vollbild-Draw mit Fragment-Tiefe — kein früher Tiefentest, jedes Pixel lief
    // die Seiten-Schleife (OMEN: 2,40 ms für 1,3 % des Bildes). Der March rasterisiert je Satz einen Stellvertreter, das
    // Panorama zeichnet ohne Fragment-Tiefe; die SEITEN-EBENE (Hüllen je 32 Einträge, Hilbert-Ordnung, Folge nah→fern)
    // fiel ganz (gate:feld-stellvertreter).
    {
        token: "feldPassBlick",
        fiel: "Welle G — feldMarch (EIN Satz je Stellvertreter) und feldPanorama (früher Tiefentest)",
    },
    { token: "_weltSeitenOrdnen", fiel: "Welle G — die Stellvertreter brauchen keine räumliche Ordnung" },
    { token: "_weltSeitenPflegen", fiel: "Welle G — die Hülle trägt jeder Eintrag selbst (Texel 0/1)" },
    { token: "_weltSeitenFolge", fiel: "Welle G — der Tiefentest der Hardware wählt den nächsten Treffer" },
    { token: "_weltSeiteDirty", fiel: "Welle G — die Seiten-Ebene fiel (auch der Aufruf der Fernwald-Linse)" },
    // die Ratsche des Profi-Bands führt keinen VRAM-Erzeuger, den es nicht mehr gibt
    { token: "welt-march-seiten", fiel: "Welle G — die Seiten-Textur fiel", auch: ["spec/profiband/ratsche.json"] },
    { token: "welt-march-folge", fiel: "Welle G — die Folge-Textur fiel", auch: ["spec/profiband/ratsche.json"] },
    // DIE BRÜCKE HAT EINEN RICHTER (Studio-Welle S1): smoke-labs trieb die Studio-DSL mit der Form [[w]], die die Heimat
    // nie sendet, und meldete grün, während das Einzelwort der Heimat in 7 Studios stumm blieb. Die Konformitäts-Probe
    // der Brücke betritt jede Welt über die echte Heimat (gate:portal-konformanz, samt Probefahrt der Garage).
    {
        token: "smoke-labs",
        fiel: "Studio-Welle S1 — gate:portal-konformanz (die echte Heimat, die echte Form)",
        auch: ["package.json"],
    },
    // DIE LAGE STEHT (Welle C): die Nah-Wiese trug eine eigene Kamera-Signatur, jeder andere Leser rechnete je Pass neu. EIN
    // Gesetz der Lage (`_passLageGen`, `L.gen`) gilt allen Lesern der Sicht-Kette.
    { token: "_sichtSteht", fiel: "Welle C — EIN Gesetz der Lage je Pass (_passLageGen, L.gen)" },
    // WELLE L (koerper-haus, 06.10.) — die gefallenen Namen je Klasse (Q4 Stand der Sicht · Q5 Haus-Hülle · Q15 Siedlung).
    { token: "_hausTuerBlockerParts", fiel: "Welle L — die Haus-Hülle der Stufe (_hausBlockerBoxen, OBB)" },
    { token: "_slopeProbeV", fiel: "Welle L — vier Proben im Leib-Rahmen (_slopeProben, _standSicht)" },
    { token: "_slopeProbeH", fiel: "Welle L — vier Proben im Leib-Rahmen (_slopeProben, _standSicht)" },
    { token: "_siedlungGesetzMemo || AnazhRealm.AUTO_SETTLEMENT", fiel: "Welle L — kein Siedlungs-Zwilling (fachwerk SIEDLUNG)" },
    { token: "_settlementCount", fiel: "Welle L — der Bau-Same je Art (_bauSame)" },
    // DER SAME DES WERKS (Gegenprüfung 08.10.): der Zähler des Welt-Stroms ist Welt-Gedächtnis, der Same eines Werks EINER.
    { token: "_bauSameZaehler", fiel: "Gegenprüfung 08.10. — der Zähler des Welt-Stroms reist in worldMeta.bauSame" },
    { token: "Math.imul(seedNum, 131)", fiel: "Gegenprüfung 08.10. — EIN Same je Werk (_werkSame), vier Kopien fielen" },
    // D5 (Integration Welle L, 07.10.): das Tier am gedrehten Haus — der OBB-Zweig des Kapsel-Lösers ließ den Kontakt-
    // Empfänger des Tiers fallen und drehte die Parkour-Wand des Spielers über eine Zeit-Gleichheit zurück; die Gier-Ordnung
    // YXZ setzte der Takt je Frame neu. Der Kontakt reist im Empfänger (`_wandKontaktSetzen`), YXZ setzt `spawnCreatureAt`.
    { token: "kontaktVorher", fiel: "D5 — der Kontakt reist im Empfänger zurück (_wandKontaktSetzen)" },
    { token: 'creature.rotation.order !== "YXZ"', fiel: "D5 — die Gier-Ordnung YXZ an EINER Stelle (spawnCreatureAt)" },
    // DER EINE FAHR-SCHRITT (Welle L, Q13, 06.10.): die zweite Kopie des Zweispur-Modells im Stamm fiel (Längs-Antrieb als
    // exp-Lerp, gemessene Längs-Beschleunigung, eigene Federn je Werk) — der Ritt fährt vehicle-core fahrSchritt, die
    // Probefahrt auch (`FlatF` lebt nur im Kern: gate:fahr-leben K1).
    { token: "_fahrVLongPrev", fiel: "Welle L Q13 — die Längs-Beschleunigung ist die Reifen-Kraft des Kerns (z.aLong)" },
    { token: "_ridePitchV", fiel: "Welle L Q13 — die Nick-Feder lebt im Fahr-Zustand des Kerns (fNickV)" },
    { token: "_rideKurvenRollV", fiel: "Welle L Q13 — die Wank-Feder lebt im Fahr-Zustand des Kerns (fWankV)" },
    { token: "_rideHeaveV", fiel: "Welle L Q13 — die Hub-Feder lebt im Fahr-Zustand des Kerns (fHubV)" },
    { token: "_rideYawPrev", fiel: "Welle L Q13 — die Quer-Beschleunigung ist die Reifen-Kraft des Kerns (z.aLat)" },
    { token: "Spring.prototype.step", fiel: "Welle L Q13 — die Probefahrt-Feder ist fahrFeder im Kern", auch: ["worlds/garage/garage.js"] },
    // DAS EINE TREFFER-URTEIL (Welle L, Klasse Q8): fünf Phantom-Leser ohne Definition im Kern (zone = null in 222 von
    // 222 Treffern), die gattungs- und höhenblinde Säule, die Schadens-Klemme und die Wirts-Eichung des Pfeils sind
    // gefallen — das Urteil fällt schmiede trefferUrteil, getroffen wird die Gestalt (_kreaturGliedTreffer).
    { token: "zoneMulAt", fiel: "Welle L Q8 — die Zone trägt das Urteil (ARENA.zonen, tetrapoda trefferZone)" },
    { token: "zoneKindAt", fiel: "Welle L Q8" },
    { token: "zoneJuiceAt", fiel: "Welle L Q8 — der Hit-Stop liest die Energie des Urteils" },
    { token: "handlingMul", fiel: "Welle L Q8 — ein Phantom-Leser (0 Definitionen)" },
    { token: "handlingWindF", fiel: "Welle L Q8 — die Ausholzeit ist der Anteil der EINEN Dauer ∝ √I" },
    { token: "_heldSchmiedeFaktor", fiel: "Welle L Q8 — die Wirkung des Urteils (_trefferWirkung) statt der Klemme" },
    { token: "kapselRK", fiel: "Welle L Q8 — die Säule fiel, getroffen wird die Gestalt (_kreaturGliedTreffer)" },
    { token: "kapselY0", fiel: "Welle L Q8" },
    { token: "kapselY1", fiel: "Welle L Q8" },
    { token: "kapselRMin", fiel: "Welle L Q8" },
    { token: "mEffDmgMin", fiel: "Welle L Q8 — keine Schadens-Klemme" },
    { token: "mEffDmgMax", fiel: "Welle L Q8" },
    { token: "mEffRefKg", fiel: "Welle L Q8 — die Wirkung ist Energie gegen keRefJ" },
    { token: "zugJouleRef", fiel: "Welle L Q8 — E = ableitenBogen(task).energie (die Studio-Energie)" },
    // KEIN DRITTER LEIB (Integration Welle L, Stufe kampf-maus, Gesetz #0): Klinge und Pfeil schätzten den Leib des Tiers je
    // selbst als 2 × Skala; das Grob-Tor liest den EINEN Leib (_kreaturLeib.reichweite, _trefferErreichbar). Die Gattung
    // eines Tiers liest jeder Leser aus _kreaturGattung (Herden-Zug, Analog-Zensus), nie aus einer eigenen Kette.
    { token: "Math.max(0.3, c.scale.x", fiel: "Integration L — das Grob-Tor liest den Leib (_trefferErreichbar)" },
    { token: "Math.max(0.3, cr.scale.x", fiel: "Integration L — das Grob-Tor liest den Leib (_trefferErreichbar)" },
    { token: "o.userData && o.userData.gattung", fiel: "Integration L — EINE Gattungs-Quelle (_kreaturGattung)" },
    { token: "creature.userData.gattung", fiel: "Integration L — EINE Gattungs-Quelle (_kreaturGattung)" },
    { token: "u.gattung || u.recipe", fiel: "Integration L — EINE Gattungs-Quelle (_kreaturGattung)" },
    // DIE LICHTUNG IST EIN GRUNDRISS (Integration Welle L, Stufe auge-v1, Entscheid D3): der Pflanz-Gang des Walds hielt die
    // Genesis-Scheibe mit einem eigenen Filter frei — die Streu, die Promotion, die Nah-Streu und der Hain der KI standen über
    // ihr. Die Plattform trägt ihre Lichtung im Bauplan (`_grundrissVon`), die EINE Natur-Wand fragt die Krone (`_naturKrone`).
    { token: "_genesisLichtung", fiel: "Integration L D3 — die Lichtung ist ein Grundriss der Natur-Wand (_grundrissVon)" },
    { token: "_forestKroneWelt", fiel: "Integration L D3 — die Krone eines Wurfs ist _naturKrone (jede Quelle)" },
    // DIE ERST-ZEICHNUNG (Welle K, Hänger): die erste Zeichnung baut den Stoff im Pass (je Render-Aufruf einer) und lässt die
    // Pipeline asynchron entstehen — am EINEN Ort (`_configureRenderer`). Die Vorwärmer daneben fallen: das r184-compileAsync
    // baute die Knoten ohnehin synchron (Attribute vor dem asynchronen Bau), der Boot-Schuss trug 40 Bauten in einem Fenster.
    { token: "compileAsync", fiel: "Welle K — die Erst-Zeichnung (kein Kompilat neben dem Render)" },
    { token: "_warmCompilePipeline", fiel: "Welle K — die Erst-Zeichnung" },
    { token: "_bootWarmCompileScene", fiel: "Welle K — die Erst-Zeichnung" },
    { token: "_kompiliere", fiel: "Welle K — die Erst-Zeichnung" },
    { token: "_imKompilat", fiel: "Welle K — kein Kompilat, keine Wache" },
    { token: "_pipeOfenMerke", fiel: "Welle K — die Erst-Zeichnung (der Warm-Ofen)" },
    { token: "_pipeOfenTick", fiel: "Welle K — die Erst-Zeichnung (der Warm-Ofen)" },
    { token: "_pipeOfenDone", fiel: "Welle K — die Erst-Zeichnung (der Warm-Ofen)" },
    { token: "_bundleReifeWache", fiel: "Welle K — die Erst-Zeichnung nimmt das Bundle neu auf, wenn die Pipeline steht" },
    { token: "_foundryWarmedMats", fiel: "Welle K — die Erst-Zeichnung" },
    // DIE BEREITSCHAFT AM ZUSTAND (Welle K, Nachbesserung): die Neuaufnahme hing am Vendor-Versprechen (es wartet auf
    // popErrorScope: auf der Spielseite > 5 s, auf Windows-swiftshader nie) und der Neubau meldete sich nie an — EINE
    // Warteschlange `_erstWartet`, bereit ist die Pipeline, sobald r184 sie in seinen Zustand schreibt.
    { token: "_erstPipeline", fiel: "Welle K — die Bereitschaft liest den Zustand (_erstWartet), nie das Versprechen" },
    { token: "_erstNeuAufnehmen", fiel: "Welle K — EINE Warteschlange (_erstWartet ohne Pipeline)" },
];

// Die Wald-Nischen-Tafel des Gesetzbuchs (phyto-core FOREST_SPECIES): der Mammut des Labors ist in der Welt
// baum_mammut — nie mehr die Buche (die Buche ist eine eigene Studio-Art, Waldboden 04.10.).
function checkAliasArten(core) {
    if (!core) require("../phyto-core.js");
    const pc = core || globalThis.__phytoCore;
    if (!pc || typeof pc.forestLabToHost !== "function") return ["phyto-core forestLabToHost fehlt"];
    const e = [];
    if (pc.forestLabToHost("mammut") !== "baum_mammut")
        e.push(`FOREST_SPECIES: mammut → ${pc.forestLabToHost("mammut")} (Soll baum_mammut)`);
    if (pc.forestHostToLab("baum_buche") !== "baum_buche")
        e.push(
            `FOREST_SPECIES: baum_buche → ${pc.forestHostToLab("baum_buche")} (die Buche ist keine Lab-Wald-Nische)`
        );
    return e;
}

// Die Seelen-Schlüssel-Wahrheit: CREATURE_SOULS = exakt die vier Tiere.
const SOUL_KEYS_EXPECTED = ["wesen", "wolf", "fuchs", "baer"];

// Kommentare strippen, Strings BEWAHREN (die diag-source-probes-Methode:
// zeichenweise, string-bewusst — ein naiver Regex frisst echten Code).
function stripComments(src) {
    let out = "";
    let i = 0;
    const n = src.length;
    let mode = "code"; // code | line | block | sq | dq | tpl
    while (i < n) {
        const c = src[i];
        const c2 = src[i + 1];
        if (mode === "code") {
            if (c === "/" && c2 === "/") {
                mode = "line";
                i += 2;
                continue;
            }
            if (c === "/" && c2 === "*") {
                mode = "block";
                i += 2;
                continue;
            }
            if (c === "'") mode = "sq";
            else if (c === '"') mode = "dq";
            else if (c === "`") mode = "tpl";
            out += c;
            i++;
            continue;
        }
        if (mode === "line") {
            if (c === "\n") {
                mode = "code";
                out += c;
            }
            i++;
            continue;
        }
        if (mode === "block") {
            if (c === "*" && c2 === "/") {
                mode = "code";
                i += 2;
                continue;
            }
            if (c === "\n") out += c;
            i++;
            continue;
        }
        // Strings: Escapes respektieren, Inhalt BEHALTEN
        if (c === "\\") {
            out += c + (c2 || "");
            i += 2;
            continue;
        }
        if ((mode === "sq" && c === "'") || (mode === "dq" && c === '"') || (mode === "tpl" && c === "`")) {
            mode = "code";
        }
        out += c;
        i++;
        continue;
    }
    return out;
}

// `auch`: ein Name, der zusätzlich in einer Studio-Datei außerhalb der Stamm-Liste fiel (dort gilt NUR er — das Labor
// trägt eigene Namen, die im Stamm gefallen sind).
function scan(files) {
    const errs = [];
    const root = path.join(__dirname, "..");
    const pruefe = (f, liste) => {
        const code = stripComments(fs.readFileSync(f, "utf8"));
        for (const { token, fiel } of liste) {
            let idx = code.indexOf(token);
            if (idx >= 0) {
                const line = code.slice(0, idx).split("\n").length;
                errs.push(`${path.basename(f)}:${line} trägt "${token}" (fiel: ${fiel})`);
            }
        }
    };
    for (const f of files) pruefe(f, FORBIDDEN);
    for (const z of FORBIDDEN) for (const a of z.auch || []) pruefe(path.join(root, a), [z]);
    return errs;
}

function checkSoulKeys() {
    // Die Schlüssel-Menge aus dem lebenden Literal ziehen (klammer-bewusst).
    const src = fs.readFileSync(path.join(__dirname, "..", "anazhRealm.js"), "utf8");
    const start = src.indexOf("AnazhRealm.CREATURE_SOULS = Object.freeze({");
    if (start < 0) return ["CREATURE_SOULS-Literal nicht gefunden"];
    let depth = 0;
    let i = src.indexOf("{", start);
    const from = i;
    for (; i < src.length; i++) {
        if (src[i] === "{") depth++;
        else if (src[i] === "}") {
            depth--;
            if (depth === 0) break;
        }
    }
    const block = src.slice(from, i + 1);
    const keys = [];
    // Top-Level-Schlüssel: "    <name>: Object.freeze({" auf Tiefe 1
    const re = /\n    (\w+): Object\.freeze\(\{/g;
    let m;
    while ((m = re.exec(block))) keys.push(m[1]);
    const errs = [];
    if (keys.length !== SOUL_KEYS_EXPECTED.length || !SOUL_KEYS_EXPECTED.every((k) => keys.includes(k))) {
        errs.push(
            `CREATURE_SOULS-Schlüssel = [${keys.join(", ")}] — erwartet exakt [${SOUL_KEYS_EXPECTED.join(", ")}]`
        );
    }
    return errs;
}

// ULTRAGUSS U2 — DIE ZWILLINGS-WAND: getötete Formel-Zwillinge dürfen nicht
// nachwachsen. Je Zeile: der Formel-Fingerabdruck darf NUR im Gesetzbuch leben.
const ZWILLINGE = [
    {
        fingerprint: "conif = clamp((api - 0.62)",
        gesetzbuch: "phyto-core.js",
        verboten: ["foundry-core.js"],
        fiel: "U2 — der Phänotyp-Zwilling (foundry-core delegiert an treePhenotype)",
    },
    {
        fingerprint: "ridges: 14, depth: 0.52",
        gesetzbuch: "phyto-core.js",
        verboten: ["foundry-core.js", "anazhRealm.js"],
        fiel: "U2b (V18.467) — das Rinden-Gesetz (barkProfile/buildTubeGesetz) wohnt im Pflanzen-Gesetzbuch, foundry-core delegiert",
    },
    {
        fingerprint: "Math.pow(size / 2.4, 0.67)",
        gesetzbuch: "tetrapoda-core.js",
        verboten: ["worlds/tetrapoda/tetrapoda.js", "anazhRealm.js"],
        fiel: "U4 — die Tier-Allometrie wohnt im Gesetzbuch (deriveTierParams)",
    },
    {
        fingerprint: "Math.sin(phases[j] - phases[i])",
        gesetzbuch: "tetrapoda-core.js",
        verboten: ["worlds/tetrapoda/tetrapoda.js", "anazhRealm.js"],
        fiel: "U4 — der CPG-Phasen-Schritt wohnt im Gesetzbuch (cpgStep)",
    },
    {
        fingerprint: "0.818 * H",
        gesetzbuch: "koerper-core.js",
        verboten: ["worlds/koerperstudio/koerperstudio.js", "anazhRealm.js"],
        fiel: "U3 — die 6-KH-Loomis-Proportionen wohnen im Gesetzbuch (labProportionen)",
    },
    {
        fingerprint: "(0.62 + p.tone * 0.53) * (1 - p.age * 0.35)",
        gesetzbuch: "koerper-core.js",
        verboten: ["worlds/koerperstudio/koerperstudio.js", "anazhRealm.js"],
        fiel: "U3 — die morph()-Dial-Mathe wohnt im Gesetzbuch (labMorph)",
    },
    {
        fingerprint: "reg('glute'+(sd===1?'1':'-1')",
        gesetzbuch: "koerper-core.js",
        verboten: ["worlds/koerperstudio/koerperstudio.js", "anazhRealm.js"],
        fiel: "KONVERGENZ — der Da-Vinci-Teile-Baum (bauMensch) wohnt NUR im Gesetzbuch; Shell + Stamm bauen per Fabrik-Haken (kein Nachbau, nie wieder)",
    },
    {
        fingerprint: "iris: Object.freeze({ c: 0x2a4a6a",
        gesetzbuch: "koerper-core.js",
        verboten: ["worlds/koerperstudio/koerperstudio.js", "anazhRealm.js"],
        fiel: "KONVERGENZ II — die Material-Klassen-Farben wohnen im Gesetzbuch (MATERIAL_KLASSEN); Shell + Stamm LESEN",
    },
    {
        fingerprint: "mahagoni:{hex:0x5f3826",
        gesetzbuch: "koerper-core.js",
        verboten: ["worlds/koerperstudio/koerperstudio.js", "anazhRealm.js"],
        fiel: "KONVERGENZ II — die Haut-/Haar-Paletten wohnen im Gesetzbuch (SKIN_TONES/HAIR_COLORS); der Genom-Roller pickt aus der Lab-Wahrheit",
    },
    {
        fingerprint: "wristFrac: 1.36",
        gesetzbuch: "koerper-core.js",
        verboten: ["worlds/koerperstudio/koerperstudio.js", "anazhRealm.js"],
        fiel: "U3 — das Landmarken-Urteil wohnt im Gesetzbuch (labLandmarks)",
    },
    {
        fingerprint: "Math.abs(lz)>Math.min(Di,Dj)*0.45",
        gesetzbuch: "fachwerk-core.js",
        verboten: ["worlds/fachwerk/fachwerk.js", "anazhRealm.js"],
        fiel: "U6c — das REIHEN-SNAP-Gesetz wohnt im Gesetzbuch (reihenSnap)",
    },
    {
        fingerprint: "A.p.brandwand[lx>0?'x1':'x0']=1",
        gesetzbuch: "fachwerk-core.js",
        verboten: ["worlds/fachwerk/fachwerk.js", "anazhRealm.js"],
        fiel: "U6c — das BRANDWAND-Gesetz wohnt im Gesetzbuch (brandwand)",
    },
    {
        fingerprint: "jahr<1150?'romanik'",
        gesetzbuch: "fachwerk-core.js",
        verboten: ["worlds/fachwerk/fachwerk.js", "anazhRealm.js"],
        fiel: "U6c — das META-Gesetz (Jahr×Klima×Personen×Wohlstand → Form) wohnt im Gesetzbuch (metaParams)",
    },
    {
        fingerprint: "_SNED=[[0,1],[2,3],[4,5],[6,7]",
        gesetzbuch: "koerper-core.js",
        verboten: ["worlds/koerperstudio/koerperstudio.js", "anazhRealm.js", "foundry-core.js"],
        fiel: "V18.463 — die Hüllen-Maschine (Voxel-Ops + Surface-Nets) wohnt im Gesetzbuch; Shell UND Bäcker LESEN",
    },
    {
        fingerprint: "burgundy:{hex:0x5a2530",
        gesetzbuch: "koerper-core.js",
        verboten: ["worlds/koerperstudio/koerperstudio.js", "anazhRealm.js"],
        fiel: "V18.461 — die Stoff-Palette wohnt im Gesetzbuch (CLOTH_COLORS); die Kleid-Zonen (kleidZonen) und die Haar-Streu (haarStreu) sind Kern-Gesetz, beide Leser LESEN",
    },
    {
        fingerprint: "(1 - tipFrac) * Math.pow(t, 1.3)",
        gesetzbuch: "schmiede-core.js",
        verboten: ["anazhRealm.js"],
        fiel: "U6d — die distale Klingen-Verjüngung (bladeProfile) wohnt im Gesetzbuch (klingenProfil)",
    },
    {
        fingerprint: "Math.pow(w / 0.4, 2)",
        gesetzbuch: "schmiede-core.js",
        verboten: ["anazhRealm.js"],
        fiel: "U6d — die Hohlkehle des Wirts-Schnitts (bladeProfile) wohnt im Gesetzbuch (klingenProfil)",
    },
    {
        fingerprint: "bladeLen: 1.45",
        gesetzbuch: "schmiede-core.js",
        verboten: ["anazhRealm.js"],
        fiel: "U6d — die Oakeshott-Proportions-Tabelle wohnt im Gesetzbuch (OAKESHOTT_TYPES, Stamm = Getter-Delegat)",
    },
];

function scanZwillinge() {
    const root = path.join(__dirname, "..");
    const errs = [];
    for (const z of ZWILLINGE) {
        const home = fs.readFileSync(path.join(root, z.gesetzbuch), "utf8");
        if (home.indexOf(z.fingerprint) < 0)
            errs.push(`Zwillings-Wand: Fingerabdruck "${z.fingerprint}" fehlt im Gesetzbuch ${z.gesetzbuch}`);
        for (const f of z.verboten) {
            const src = stripComments(fs.readFileSync(path.join(root, f), "utf8"));
            if (src.indexOf(z.fingerprint) >= 0)
                errs.push(`Zwillings-Wand: ${f} trägt wieder "${z.fingerprint}" (fiel: ${z.fiel})`);
        }
    }
    return errs;
}

// ULTRAGUSS U3 — DIE BUSTER-LINSE (Lehre 10 als Klasse): JEDER Lab-Kern-Script-
// Tag trägt die AKTUELLE Version — ein stale ?v= serviert den Studios altes
// Gesetz aus dem HTTP-Cache (gemessen 11.07.: alle acht Labs stale).
function scanLabBuster() {
    // V18.461: die Wand deckt JEDEN Buster (Kern UND Shell UND Wurzel-Seite) —
    // die Shell-Buster standen bei 18.446 während tetrapoda.js/koerperstudio.js
    // sich bewegten (Cache-Lüge-Klasse). EIN Gesetz: alle ?v= == package.json.
    const root = path.join(__dirname, "..");
    const version = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8")).version;
    const errs = [];
    const seiten = [path.join(root, "index.html")];
    for (const w of fs.readdirSync(path.join(root, "worlds"))) {
        const idx = path.join(root, "worlds", w, "index.html");
        if (fs.existsSync(idx)) seiten.push(idx);
    }
    for (const idx of seiten) {
        const src = fs.readFileSync(idx, "utf8");
        const re = /\?v=([0-9.]+)/g;
        let m;
        while ((m = re.exec(src))) {
            if (m[1] !== version) errs.push(`${path.relative(root, idx)} trägt stale ?v=${m[1]} (aktuell ${version})`);
        }
    }
    // V18.472 (Perf-Panel-Linse fing es): AnazhRealm.VERSION driftete vier Wellen lang
    // (18.467 während package.json 18.471 trug) — jeder Flugschreiber-Trace + Panel-Kopf
    // log über die Version. DIESELBE Wand deckt jetzt die Runtime-Konstante: EIN Gesetz,
    // alle Versions-Träger == package.json.
    const stammSrc = fs.readFileSync(path.join(root, "anazhRealm.js"), "utf8");
    const vm = stammSrc.match(/AnazhRealm\.VERSION = "([0-9.]+)"/);
    if (!vm) errs.push("AnazhRealm.VERSION nicht gefunden (die Versions-Wand braucht den Anker)");
    else if (vm[1] !== version)
        errs.push(
            `AnazhRealm.VERSION trägt stale "${vm[1]}" (package.json ${version}) — Trace/Panel lügen über die Version`
        );
    // DOKU=VERSION (19.07., Schöpfer-Karte §5.6 „Doku = Version"): der Stand-Kopf
    // von CLAUDE.md ist die Chronik-Spitze — trägt er eine andere Version als
    // package.json, LÜGT die Doku relativ zum Code (die 18.490/18.491-Drift-
    // Klasse). DIESELBE Wand, ein weiterer Träger.
    const claude = fs.readFileSync(path.join(root, "CLAUDE.md"), "utf8");
    const cm = claude.match(/## Stand \(V([0-9.]+)/);
    if (!cm) errs.push("CLAUDE.md Stand-Kopf nicht gefunden (## Stand (V… — die Doku-Wand braucht den Anker)");
    else if (cm[1] !== version)
        errs.push(
            `CLAUDE.md Stand-Kopf trägt stale V${cm[1]} (package.json ${version}) — die Chronik lügt relativ zum Code`
        );
    return errs;
}

// DIE INSTANZ-WAND (V18.510): jede InstancedMesh der Welt entsteht im EINEN Chokepoint
// `AnazhRealm._instanzMesh` (Instanz-Matrix als Storage). Ein Bau daran vorbei trägt die Kapazität
// wieder als Uniform-Array-Länge in den Vertex-Shader — ein Programm + eine Pipeline je Kapazität
// (gemessen 02.10.: 756 Vertex- auf 60 Fragment-Programme). Erlaubt: genau EIN `new THREE.InstancedMesh(`
// (der Chokepoint selbst). Gezählt wird JEDER Bau, auch über einen Alias (`const T = THREE; new T.InstancedMesh(`):
// bis 05.10. sah die Wand nur die THREE-Schreibweise — der Feld-Cull-Konsument und die Werkstatt-Vorschau bauten an
// ihr vorbei.
const INSTANZ_BAU = /new\s+(?:[A-Za-z_$][\w$]*\.)?InstancedMesh\(/g;
function scanInstanzWand(srcRoh) {
    const code = stripComments(srcRoh);
    const treffer = [];
    for (const m of code.matchAll(INSTANZ_BAU)) treffer.push(code.slice(0, m.index).split("\n").length);
    const errs = [];
    if (treffer.length !== 1)
        errs.push(
            `Instanz-Wand: eine InstancedMesh entsteht ${treffer.length}× im Stamm (erlaubt: 1, der Chokepoint _instanzMesh) — Zeilen ${treffer.join(", ")}`
        );
    const kopf = code.indexOf("static _instanzMesh(geom, mat, cap) {");
    if (kopf < 0 || code.indexOf("new THREE.InstancedMesh(", kopf) - kopf > 200)
        errs.push("Instanz-Wand: der Chokepoint `static _instanzMesh(geom, mat, cap)` trägt den Bau nicht");
    if (!/StorageInstancedBufferAttribute\(m\.instanceMatrix\.array, 16\)/.test(code))
        errs.push("Instanz-Wand: _instanzMesh legt die Matrix nicht als StorageInstancedBufferAttribute an");
    return errs;
}

// DIE ENTSORGUNGS-WAND (Frost-Nachbesserung 08.10., AST seit der vierten Nachbesserung): wer Geometrie oder Stoff eines
// Objekts entsorgt, muss ihr BESITZER sein. Befund: vier Bühnen und der Mitspieler-Leib trugen je eine eigene Schleife, die
// die Geteilt-Markierung überging — 3 Seelenwechsel legten den Kopf des Spieler-Leibs und die Haut in die Entsorgung; die
// Text-Wand der dritten Nachbesserung sah nur `.traverse(` + direktes `x.geometry` und verfehlte Kind-Schleifen
// (`for…of`, `children.forEach`), Zwischen-Variablen (`const g = o.geometry; g.dispose()`) und reine Stoff-Schleifen
// (`o.material.forEach((m) => m.dispose())`). Jetzt liest acorn den Stamm: jede Entsorgung (`.dispose()` oder
// `_queueDispose`/`_queueGeometryDispose`), deren Ziel aus `.geometry` oder `.material` eines Objekts stammt (direkt, über
// eine Variable, ein Schleifen- oder Rückruf-Element), steht in ihrer Methode — und die Methode in der Besitzer-Liste mit
// genau dieser Art. Rot ist jede Entsorgung außerhalb der Liste und jede tote Zeile der Liste (der Besitzer entsorgt die
// Art nicht mehr). Gruppen mit Welt-Vorlagen entsorgen über `_disposeSoulGroup`; die übrigen Zeilen sind die Besitzer
// eigener frischer Objekte.
const ENTSORGUNG_BESITZER = {
    _disposeSoulGroup: {
        arten: ["geometry"],
        grund: "die EINE Regel jeder Gruppe mit Welt-Vorlagen (geteilte Geometrie nie, Stoffe nie)",
    },
    _workshopRebuildPreviewMesh: {
        arten: ["geometry", "material"],
        grund: "die Bauplan-Vorschau: nur ihre eigenen Teile (geteilte stehen, die Gestalt des Ofens rührt sie nie an)",
    },
    _ofenMemoRaeumen: {
        arten: ["geometry"],
        grund: "das Ofen-Memo: eine Vorlage ohne lebenden Leib fällt (das Memo ist ihr Eigentümer)",
    },
    _disposeFoundryGroupGeom: {
        arten: ["geometry"],
        grund: "der Foundry-Cache: eine geräumte Quell-Gruppe ohne lebende Referenz",
    },
    _p2pRefreshPeerNameLabel: { arten: ["material"], grund: "das Namensschild des Peers (Sprite-Stoff je Schild)" },
    _p2pRemovePeer: { arten: ["material"], grund: "das Namensschild des Peers beim Abschied" },
    createGalaxySkybox: { arten: ["geometry", "material"], grund: "die Himmels-Kugel (je Bau frisch)" },
    _canopyDisposeChunkByKey: { arten: ["geometry", "material"], grund: "die Kronen-Kachel (je Kachel frisch)" },
    removeCreature: { arten: ["material"], grund: "Aufgaben-Aura und Trage-Sprite der Kreatur (je Kreatur frisch)" },
    _refreshCreatureTaskAura: { arten: ["material"], grund: "die Aufgaben-Aura (je Aufgabe frisch)" },
    _refreshCreatureCarryingVisual: { arten: ["material"], grund: "das Trage-Sprite (je Last frisch)" },
    _spawnVoxelTestChunk: { arten: ["geometry", "material"], grund: "der Test-Chunk" },
    _disposeVoxelChunkWaterIso: { arten: ["geometry"], grund: "das Wasser-Iso-Mesh des Chunks" },
    _rebuildLodStitchBand: { arten: ["geometry"], grund: "das LOD-Naht-Band des Chunks" },
    _disposeVoxelChunk: {
        arten: ["geometry"],
        grund: "Chunk-Mesh und Naht-Band (der Stoff ist das geteilte Singleton und bleibt)",
    },
    _disposeHydrosphereMeshes: { arten: ["geometry"], grund: "die Hydrosphären-Meshes" },
    _ensureFarWaterSheet: { arten: ["geometry"], grund: "das Fern-Wasser-Blatt beim Neubau" },
    _disposeFarWaterSheet: { arten: ["geometry"], grund: "das Fern-Wasser-Blatt" },
    _feldPassDispose: { arten: ["geometry", "material"], grund: "der Feld-Pass (Quad und Stoff)" },
    _fernRingDispose: { arten: ["geometry", "material"], grund: "der Fern-Ring" },
    verifyComputeContribution: { arten: ["geometry", "material"], grund: "das Prüf-Mesh der Compute-Probe" },
    _tickPortalMembranes: {
        arten: ["material"],
        grund: "Membran- und Nebel-Stoff je Tor (die Geometrie gehört dem Memo je Gestalt)",
    },
};
// Die Entsorgungen des Stamms beim Namen: [{ methode, art: "geometry" | "material", zeile, text }].
function entsorgungen(srcRoh) {
    const acorn = require("acorn");
    const ast = acorn.parse(srcRoh, { ecmaVersion: "latest", sourceType: "script", locations: true });
    const kinder = (n, f) => {
        for (const k in n) {
            if (k === "loc") continue;
            const v = n[k];
            if (Array.isArray(v)) {
                for (const c of v) if (c && typeof c.type === "string") f(c);
            } else if (v && typeof v.type === "string") f(v);
        }
    };
    const ueberall = (n, f) => {
        f(n);
        kinder(n, (c) => ueberall(c, f));
    };
    const traeger = (n) =>
        n &&
        n.type === "MemberExpression" &&
        !n.computed &&
        n.property &&
        (n.property.name === "geometry" || n.property.name === "material")
            ? n.property.name
            : null;
    const artVon = (e, bind) => {
        if (!e) return null;
        if (e.type === "Identifier") return bind.get(e.name) || (/Memo$/.test(e.name) ? "memo" : null);
        // ein Memo-Eintrag (`this._xMemo.get(k)`, ein Element von `memo.values()`): er gehört dem Memo, nie dem Leser
        if (e.type === "MemberExpression")
            return (
                traeger(e) ||
                artVon(e.object, bind) ||
                (!e.computed && e.property && /Memo$/.test(e.property.name) ? "memo" : null)
            );
        if (e.type === "ConditionalExpression") return artVon(e.consequent, bind) || artVon(e.alternate, bind);
        if (e.type === "LogicalExpression") return artVon(e.left, bind) || artVon(e.right, bind);
        if (e.type === "ArrayExpression") {
            for (const el of e.elements) {
                const a = artVon(el && el.type === "SpreadElement" ? el.argument : el, bind);
                if (a) return a;
            }
            return null;
        }
        if (e.type === "CallExpression" && e.callee.type === "MemberExpression") {
            const a = artVon(e.callee.object, bind);
            if (a) return a;
            for (const x of e.arguments) {
                const b = artVon(x, bind);
                if (b) return b;
            }
        }
        return null;
    };
    const funde = [];
    const pruefe = (methode, fn) => {
        const bind = new Map();
        for (let runde = 0; runde < 3; runde++)
            ueberall(fn.body, (n) => {
                const setze = (id, a) => {
                    if (id && id.type === "Identifier" && a) bind.set(id.name, a);
                };
                if (n.type === "VariableDeclarator") setze(n.id, artVon(n.init, bind));
                if (n.type === "AssignmentExpression") setze(n.left, artVon(n.right, bind));
                if (n.type === "ForOfStatement" || n.type === "ForInStatement")
                    setze(
                        n.left.type === "VariableDeclaration" ? n.left.declarations[0].id : n.left,
                        artVon(n.right, bind)
                    );
                if (
                    n.type === "CallExpression" &&
                    n.callee.type === "MemberExpression" &&
                    ["forEach", "map", "filter", "some", "every"].includes(n.callee.property.name) &&
                    n.arguments[0] &&
                    /Function/.test(n.arguments[0].type)
                )
                    setze(n.arguments[0].params[0], artVon(n.callee.object, bind));
            });
        ueberall(fn.body, (n) => {
            if (n.type !== "CallExpression" || n.callee.type !== "MemberExpression") return;
            const p = n.callee.property && n.callee.property.name;
            let art = null;
            if (p === "dispose" && n.arguments.length === 0) art = artVon(n.callee.object, bind);
            else if ((p === "_queueDispose" || p === "_queueGeometryDispose") && n.arguments[0])
                art = artVon(n.arguments[0], bind);
            if (art)
                funde.push({ methode, art, zeile: n.loc.start.line, text: srcRoh.slice(n.start, n.end).slice(0, 90) });
        });
    };
    const besuche = (n) => {
        if (n.type === "MethodDefinition") return pruefe(n.key.name || n.key.value, n.value);
        if (n.type === "FunctionDeclaration" && n.id) return pruefe(n.id.name, n);
        // Feld- und Objekt-Methoden (`build: () => …`, `x = () => …`) tragen den Namen ihres Schlüssels
        if ((n.type === "Property" || n.type === "PropertyDefinition") && n.value && /Function/.test(n.value.type))
            return pruefe(n.key.name || n.key.value || "?", n.value);
        if (
            n.type === "AssignmentExpression" &&
            n.left.type === "MemberExpression" &&
            n.right &&
            /Function/.test(n.right.type)
        )
            return pruefe(n.left.property.name, n.right);
        kinder(n, besuche);
    };
    besuche(ast);
    return funde;
}
function scanEntsorgungsWand(srcRoh, besitzer = ENTSORGUNG_BESITZER) {
    const errs = [];
    const funde = entsorgungen(srcRoh);
    const deutsch = { geometry: "Geometrie", material: "Stoff", memo: "Memo-Eintrag" };
    for (const f of funde) {
        const b = besitzer[f.methode];
        if (b && b.arten.includes(f.art)) continue;
        errs.push(
            `Entsorgungs-Wand: anazhRealm.js:${f.zeile} \`${f.methode}\` entsorgt ${deutsch[f.art]} (\`${f.text}\`) — nicht ihr Besitz: ` +
                `Gruppen mit Welt-Vorlagen entsorgen über \`_disposeSoulGroup\`, eigene frische Objekte ` +
                `nur ihr Besitzer (ENTSORGUNG_BESITZER)`
        );
    }
    for (const [m, b] of Object.entries(besitzer))
        for (const a of b.arten)
            if (!funde.some((f) => f.methode === m && f.art === a))
                errs.push(
                    `Entsorgungs-Wand: tote Zeile der Besitzer-Liste — \`${m}\` entsorgt keine ${deutsch[a]} mehr`
                );
    return errs;
}

// DIE KARTEN-WAND (W6): die Karten-Methoden malen nichts im Haupt-Thread — keine CanvasTexture, kein Canvas, kein
// getContext/putImageData (bis V18.528: je Karte zwei 1024×256-Canvases, Pixel je Zelle umgedreht). Die Schicht
// kommt kodiert aus dem Worker und wird kopiert (`_impostorAtlasSchreibe`).
const KARTEN_METHODEN = [
    "_impostorAtlas() {",
    "_impostorAtlasTexturen(at, bedarf) {",
    "_impostorAtlasSchreibe(at, idx, payload) {",
    "_impostorZelleNeu(at, key, preset, variant, ov) {",
    "_impostorQuad(at) {",
    "_impostorAtlasMaterial() {",
    "_impostorLeaf(z, localMatrix, sicht) {",
    "_tickImpostorBake() {",
    "_applyStudioImpostorPayload(z, payload) {",
    "_buildImpostorLeaf(bp, skel) {",
    "_foundryEnsureImpostorRecord(preset, variant, ov) {",
    "_foundryBuildImpostorFlat(entry, preset) {",
];
function scanKartenWand(srcRoh) {
    const code = stripComments(srcRoh);
    const errs = [];
    for (const kopf of KARTEN_METHODEN) {
        const a = code.indexOf("\n    " + kopf);
        const b = a < 0 ? -1 : code.indexOf("\n    }\n", a);
        if (a < 0 || b < 0) {
            errs.push(`Karten-Wand: die Methode \`${kopf.split("(")[0]}\` fehlt (der Atlas braucht den Anker)`);
            continue;
        }
        const rumpf = code.slice(a, b);
        for (const t of ["CanvasTexture", 'createElement("canvas")', "getContext(", "putImageData", "drawImage("])
            if (rumpf.indexOf(t) >= 0) errs.push(`Karten-Wand: \`${kopf.split("(")[0]}\` malt wieder (${t})`);
    }
    return errs;
}

// DIE NORMAL-WAND (06.10.): ein normalNode ist VIEW-space (r184 NodeMaterial.setupNormal → normalView). Welt/Lokal →
// Sicht ist MATRIX.transformDirection(n) (= M·n, three's transformNormalToView); n.transformDirection(MATRIX) rechnet
// Mᵀ·n (three's normalWorld: Sicht → Welt). So standen Boden, Karte und Laub bis 06.10.: von Süden gesehen lag der Boden
// ohne Sonne (Boden-Licht-Sonde Sonne/Umgebung 1,12 statt 2,16), die Krone drehte ihr Licht mit dem Blick.
function scanNormalWand(srcRoh) {
    const code = stripComments(srcRoh);
    const errs = [];
    const re = /normalNode\s*=[^;]*?\.transformDirection\(\s*[\w$.]*(?:ViewMatrix|WorldMatrix)\s*\)/g;
    let m;
    while ((m = re.exec(code)))
        errs.push(
            `Normal-Wand: anazhRealm.js:${code.slice(0, m.index).split("\n").length} dreht die Normale mit der ` +
                `transponierten Matrix (n.transformDirection(M) = Mᵀ·n) — Welt → Sicht ist M.transformDirection(n)`
        );
    // DIE QUELLE (V18.532): ein normalNode-Graph liest nie r184s `normalWorld` — es ist EINE Variable je Programm; las der
    // normalNode (NORMAL-Stufe) sie zuerst, lasen Schatten-Lookup (normalBias), Halbkugel- und Umgebungslicht ihre
    // NORMAL-Fassung (die Geometrie-Normale mit Flächen-Vorzeichen: am Boden nach unten, der Boden lag im eigenen
    // Schatten). Die Geometrie-Normale heißt im Graphen `normalWorldGeometry` (× `faceDirection`). Geprüft wird der
    // Rechte-Hand-Ausdruck jeder normalNode-Zuweisung und transitiv jede lokale Größe (`_name`), die er in seiner Methode liest.
    const zuweisung = /([\w$.]+)\.normalNode\s*=\s*([^;]+);/g;
    const kopfRe = /\n {4}[_a-zA-Z$][\w$]*\([^)\n]*\)\s*\{\n/g;
    const quelleRe = /\.normalWorld\b(?!Geometry)/;
    while ((m = zuweisung.exec(code))) {
        let anfang = 0,
            k;
        kopfRe.lastIndex = 0;
        while ((k = kopfRe.exec(code)) && k.index < m.index) anfang = k.index;
        const rumpf = code.slice(anfang, m.index);
        const offen = [m[2]];
        const gesehen = new Set();
        let treffer = null;
        while (offen.length && !treffer) {
            const ausdruck = offen.pop();
            if (quelleRe.test(ausdruck)) treffer = ausdruck.trim().slice(0, 80);
            for (const n of ausdruck.match(/\b_[A-Za-z0-9]+\b/g) || []) {
                if (gesehen.has(n)) continue;
                gesehen.add(n);
                const def = new RegExp(`(?:^|[^\\w$.])${n}\\s*=(?!=)\\s*([^;]+);`, "g");
                let d;
                while ((d = def.exec(rumpf))) offen.push(d[1]);
            }
        }
        if (treffer)
            errs.push(
                `Normal-Wand: anazhRealm.js:${code.slice(0, m.index).split("\n").length} — der normalNode-Graph liest ` +
                    `r184s \`normalWorld\` (${treffer}); die Geometrie-Normale ist \`normalWorldGeometry\` × \`faceDirection\``
            );
    }
    return errs;
}

// DIE STUFEN-WAND (Welle 6, 06.10.): eine Bau-Stufe hat EINE Bedeutung, für das Labor (build(), Knopf L0/L1/L2) wie für
// die Welt (buildInstance). Die Abbildung Stufe → Rezept wohnt in `stufenRezept` (foundry-core); `__lod` schreiben nur
// buildInstance (die Stufe, roh, wie der Labor-Knopf) und emitTree (das Rezept für den Bau, danach zurück auf die Stufe),
// deriveParamsPlant liest dieselbe Abbildung. Jede weitere Zuweisung an `__lod` im Kern ist eine zweite Bedeutung — rot
// mit Zeile; fehlt ein Anker, ist die Abbildung aus emitTree oder deriveParamsPlant gewandert.
const STUFEN_ANKER = [
    "__lod = lod;",
    "__lod = sLod;",
    "__lod = stufenRezept(P.kind, stufe);",
    "__lod = stufe;",
    "const rezept = stufenRezept(ph.kind, __lod);",
];
function scanStufenWand(srcRoh) {
    const code = stripComments(srcRoh);
    const errs = [];
    for (const a of STUFEN_ANKER) {
        const n = code.split(a).length - 1;
        if (n !== 1) errs.push(`Stufen-Wand: \`${a}\` steht ${n}× in foundry-core (Soll 1)`);
    }
    for (const m of code.matchAll(/__lod\s*=(?!=)[^;\n]*;?/g)) {
        if (STUFEN_ANKER.includes(m[0])) continue;
        const zeile = code.slice(0, m.index).split("\n").length;
        errs.push(
            `Stufen-Wand: foundry-core.js:${zeile} \`${m[0]}\` gibt der Bau-Stufe eine zweite Bedeutung (stufenRezept)`
        );
    }
    return errs;
}

// DIE PORT-WAND (Integration W6, 06.10.): jedes Gate liest seinen Port aus EINER eigenen Variable (`<GATE>_PORT`,
// Standard sein fester Port) — zwei Formen nebeneinander (die geteilte `DIAG_PORT` in 21 Gates, je-Gate-Variablen in den
// übrigen) waren ein Zwilling: eine Serie, die DIAG_PORT setzt, gab allen 21 denselben Port. Rot mit Datei.
function scanPortWand(dateien) {
    const errs = [];
    for (const [name, src] of dateien)
        if (/process\.env\.DIAG_PORT\b/.test(stripComments(src)))
            errs.push(`Port-Wand: ${name} liest DIAG_PORT — je Gate EINE Variable (<GATE>_PORT)`);
    return errs;
}
function gateDateien(root) {
    const aus = [];
    for (const d of ["scripts", "scripts/lib"])
        for (const f of fs.readdirSync(path.join(root, d)))
            if (/\.cjs$/.test(f)) aus.push([d + "/" + f, fs.readFileSync(path.join(root, d, f), "utf8")]);
    return aus;
}

// DIE LINSEN TRAGEN DIE WAND MIT (Welle G, 06.10.): eine Linse in scripts/lib ruft die Stamm-Methoden in der Seite — ein
// gefallener Name dort ist ein toter Aufruf, den erst ein Lauf findet (`werkbank fernwald` rief `_weltSeiteDirty` nach dem
// Abschied der Seiten-Ebene; vier weitere Reste älterer Abschiede lagen dort). Die Gates in scripts/ bleiben draußen: ihre
// Absenz-Proben tragen die gefallenen Namen als Suchtext.
function linsenDateien(root) {
    const d = path.join(root, "scripts", "lib");
    return fs
        .readdirSync(d)
        .filter((f) => /\.c?js$/.test(f))
        .map((f) => path.join(d, f));
}

function main() {
    const root = path.join(__dirname, "..");
    // AUGEN-GLUT-SCHNITT (18.07.): foundry-core (der Ofen/Bäcker) steht mit in
    // der Wand — Phantom-Leser-Namen dürfen auch dort nicht nachwachsen. feld-wgsl.js (der Welt-March im WGSL) steht
    // mit drin: der trilineare Brick-March (feldTriAbtast/feldTriGrad, V18.528) fiel dort (Integration W0 — die
    // Band-Wand trug dieselbe Liste ein zweites Mal, die Rückkehr-Wand ist die EINE).
    const files = [
        "anazhRealm.js",
        "voxel-worker.js",
        "index.html",
        "signaling-server.js",
        "foundry-core.js",
        "feld-wgsl.js",
    ]
        .map((f) => path.join(root, f))
        .concat(linsenDateien(root));

    if (process.argv.includes("--selftest")) {
        // Die Instanz-Wand muss feuern: ein zweiter Bau am Chokepoint vorbei.
        const stamm = fs.readFileSync(path.join(root, "anazhRealm.js"), "utf8");
        const instanzFeuert =
            scanInstanzWand(stamm).length === 0 &&
            scanInstanzWand(stamm + "\nconst x = new THREE.InstancedMesh(g, m, 64);\n").length === 1 &&
            scanInstanzWand(stamm + "\nconst T = THREE;\nconst x = new T.InstancedMesh(g, m, 1);\n").length === 1;
        if (!instanzFeuert) {
            console.log("❌ SELBST-TEST: die Instanz-Wand feuert nicht (oder steht heute rot)");
            process.exit(1);
        }
        // Die Entsorgungs-Wand muss feuern — je Form ein Täter, jeder beim Namen (und ein Kommentar darf sie erzählen):
        //   A die alte Ich-Schleife (traverse) · B Kind-Schleife for…of mit direktem geometry.dispose() · C children.forEach ·
        //   D Zwischen-Variable · E reine Stoff-Schleife material.forEach · F for…of über die Stoff-Liste · G der Regel-
        //   Besitzer entsorgt einen Stoff (Stoffe nie) · H eine tote Zeile der Besitzer-Liste
        const ichNeu = "            this._disposeSoulGroup(stage.pivot);\n            stage.pivot = null;";
        const iIch = stamm.indexOf("    _ichStageShow(soul) {");
        const jIch = iIch < 0 ? -1 : stamm.indexOf(ichNeu, iIch);
        const formA =
            jIch < 0
                ? null
                : stamm.slice(0, jIch) +
                  "            stage.pivot.traverse((obj) => {\n" +
                  "                if (obj.geometry) this._queueDispose(obj.geometry);\n" +
                  "                if (obj.material) this._queueDispose(obj.material);\n" +
                  "            });\n            stage.pivot = null;" +
                  stamm.slice(jIch + ichNeu.length);
        const taeter = (name, rumpf) =>
            stamm.replace(
                "class AnazhRealm {\n",
                `class AnazhRealm {\n    // früher: o.geometry.dispose() in jeder Bühne\n    ${name}(o) {\n${rumpf}\n    }\n`
            );
        const regelAnker =
            "            if (node.geometry && !(node.userData && node.userData.sharedGeom)) this._queueDispose(node.geometry);";
        const formen = [
            ["A", formA, /`_ichStageShow` entsorgt/],
            [
                "B",
                taeter("_frostFormB", "        for (const c of o.children) c.geometry.dispose();"),
                /`_frostFormB` entsorgt Geometrie/,
            ],
            [
                "C",
                taeter("_frostFormC", "        o.children.forEach((c) => this._queueDispose(c.geometry));"),
                /`_frostFormC` entsorgt Geometrie/,
            ],
            [
                "D",
                taeter("_frostFormD", "        const g = o.geometry;\n        g.dispose();"),
                /`_frostFormD` entsorgt Geometrie/,
            ],
            [
                "E",
                taeter("_frostFormE", "        o.material.forEach((m) => m.dispose());"),
                /`_frostFormE` entsorgt Stoff/,
            ],
            [
                "F",
                taeter(
                    "_frostFormF",
                    "        const ms = Array.isArray(o.material) ? o.material : [o.material];\n        for (const m of ms) m.dispose();"
                ),
                /`_frostFormF` entsorgt Stoff/,
            ],
            [
                "G",
                stamm.includes(regelAnker)
                    ? stamm.replace(
                          regelAnker,
                          regelAnker + "\n            if (node.material) this._queueDispose(node.material);"
                      )
                    : null,
                /`_disposeSoulGroup` entsorgt Stoff/,
            ],
            // I ein Memo-Eintrag, direkt entsorgt (die Membran-Geometrie gehört allen Toren ihrer Gestalt)
            [
                "I",
                taeter("_frostFormI", "        this._membranGeoMemo.get(o).dispose();"),
                /`_frostFormI` entsorgt Memo-Eintrag/,
            ],
        ];
        const entsorgungHeil = scanEntsorgungsWand(stamm);
        const formFeuert = formen.map(([id, src, muster]) => {
            const e = src ? scanEntsorgungsWand(src) : [];
            // jede Meldung nennt den Täter (A entsorgt Geometrie UND Stoff: zwei Meldungen, beide beim Namen)
            return { id, ok: e.length >= 1 && e.every((x) => muster.test(x)), e };
        });
        const tot = scanEntsorgungsWand(
            stamm,
            Object.assign({}, ENTSORGUNG_BESITZER, { _gibtEsNicht: { arten: ["geometry"], grund: "Selbsttest" } })
        );
        const totFeuert = tot.length === 1 && /tote Zeile .*`_gibtEsNicht`/.test(tot[0]);
        if (entsorgungHeil.length || formFeuert.some((f) => !f.ok) || !totFeuert) {
            console.log("❌ SELBST-TEST: die Entsorgungs-Wand feuert nicht je Form (oder steht heute rot)", {
                heute: entsorgungHeil,
                formen: formFeuert.filter((f) => !f.ok),
                tot,
            });
            process.exit(1);
        }
        console.log(
            `✅ SELBST-TEST: die Entsorgungs-Wand feuert je Form (A traverse · B for…of · C children.forEach · D Zwischen-Variable · E Stoff-forEach · F Stoff-for…of · G Stoff in der Regel · H tote Zeile · I Memo-Eintrag), heute 0 — ${formFeuert[1].e[0]}`
        );
        // Die Karten-Wand muss feuern: ein Canvas im Schicht-Schreiber.
        const kartenFeuert =
            scanKartenWand(stamm).length === 0 &&
            scanKartenWand(
                stamm.replace(
                    "    _impostorAtlasSchreibe(at, idx, payload) {",
                    '    _impostorAtlasSchreibe(at, idx, payload) {\n        const cv = document.createElement("canvas");'
                )
            ).length === 1;
        if (!kartenFeuert) {
            console.log("❌ SELBST-TEST: die Karten-Wand feuert nicht (oder steht heute rot)");
            process.exit(1);
        }
        // Die Normal-Wand muss feuern: eine Welt-Normale, mit der transponierten Kamera-Matrix gedreht.
        // Dazu die Quelle: der Boden-Graph liest wieder r184s `normalWorld` (der Fall vor V18.532), transitiv über `_nGeo`.
        const quelleAlt = stamm.replace(
            "const _nGeo = _Tn.normalWorldGeometry.mul(_Tn.faceDirection);",
            "const _nGeo = _Tn.normalWorld;"
        );
        const normalFeuert =
            scanNormalWand(stamm).length === 0 &&
            scanNormalWand(stamm + "\nmat.normalNode = _T.normalize(n).transformDirection(_T.cameraViewMatrix);\n")
                .length === 1 &&
            scanNormalWand(stamm + "\nmat.normalNode = _T.cameraViewMatrix.transformDirection(_T.normalize(n));\n")
                .length === 0 &&
            quelleAlt !== stamm &&
            scanNormalWand(quelleAlt).filter((e) => /liest r184s `normalWorld`/.test(e)).length === 1;
        if (!normalFeuert) {
            console.log("❌ SELBST-TEST: die Normal-Wand feuert nicht (oder steht heute rot)");
            process.exit(1);
        }
        // Die Stufen-Wand muss feuern: buildInstance bildet die Stufe selbst ab (der Fall vom 05.10.), und emitTree
        // verliert die Abbildung (das Labor bekäme wieder ein anderes Rezept als die Welt).
        const kern = fs.readFileSync(path.join(root, "foundry-core.js"), "utf8");
        const zweite = scanStufenWand(kern.replace("__lod = lod;", "__lod = lod <= 1 ? 1 : lod;"));
        const ohne = scanStufenWand(
            kern
                .replace("__lod = stufenRezept(P.kind, stufe);", "")
                .replace("const rezept = stufenRezept(ph.kind, __lod);", "const rezept = __lod;")
        );
        const stufenFeuert =
            scanStufenWand(kern).length === 0 &&
            zweite.some((e) => /zweite Bedeutung/.test(e) && /__lod = lod <= 1/.test(e)) &&
            ohne.some((e) => /stufenRezept\(P\.kind, stufe\);` steht 0×/.test(e)) &&
            ohne.some((e) => /stufenRezept\(ph\.kind, __lod\);` steht 0×/.test(e));
        if (!stufenFeuert) {
            console.log("❌ SELBST-TEST: die Stufen-Wand feuert nicht (oder steht heute rot)", zweite, ohne);
            process.exit(1);
        }
        console.log(
            `✅ SELBST-TEST: die Stufen-Wand feuert (${zweite.find((e) => /zweite Bedeutung/.test(e))} · ${ohne.length} fehlende Anker)`
        );
        // Die Port-Wand muss feuern: ein Gate, das wieder die geteilte Variable liest (ein Kommentar darf sie nennen).
        const gates = gateDateien(root);
        const geteilt = "process.env." + "DIAG_PORT"; // zusammengesetzt: diese Datei ist selbst ein Gate der Wand
        const portFeuert =
            scanPortWand(gates).length === 0 &&
            scanPortWand([["scripts/diag-x.cjs", `const PORT = Number(${geteilt} || 4400);\n`]]).length === 1 &&
            scanPortWand([["scripts/diag-y.cjs", `// früher: ${geteilt}\nconst PORT = 1;\n`]]).length === 0;
        if (!portFeuert) {
            console.log("❌ SELBST-TEST: die Port-Wand feuert nicht (oder steht heute rot)", scanPortWand(gates));
            process.exit(1);
        }
        console.log(`✅ SELBST-TEST: die Port-Wand feuert (${gates.length} Gate-Dateien, DIAG_PORT erkannt)`);
        // Die Linsen stehen in der Wand: der tote Aufruf der Fernwald-Linse (Welle G) kehrt in eine Kopie zurück und
        // wird beim Namen genannt.
        const fernwald = files.find((f) => /[\\/]scripts[\\/]lib[\\/]fernwald-linse\.cjs$/.test(f));
        const tmpLinse = path.join(require("os").tmpdir(), "altlasten-selftest-linse.cjs");
        let linsenFeuert = false;
        if (fernwald) {
            const quelle = fs.readFileSync(fernwald, "utf8");
            const anker = "                    delete h.__fw;\n                }\n";
            fs.writeFileSync(
                tmpLinse,
                quelle.replace(anker, anker + "                r._weltSeiteDirty(wm, h.feld);\n")
            );
            const t = scan([tmpLinse]);
            fs.unlinkSync(tmpLinse);
            linsenFeuert =
                quelle.includes(anker) &&
                scan([fernwald]).length === 0 &&
                t.length === 1 &&
                /_weltSeiteDirty/.test(t[0]);
        }
        if (!linsenFeuert) {
            console.log(
                "❌ SELBST-TEST: die Linsen (scripts/lib) stehen nicht in der Wand, oder sie feuert dort nicht"
            );
            process.exit(1);
        }
        console.log(
            `✅ SELBST-TEST: die Linsen stehen in der Wand (${linsenDateien(root).length} Dateien in scripts/lib, der tote Aufruf der Fernwald-Linse erkannt)`
        );
        // Die Linse muss feuern: verbotenen Token in eine Kopie injizieren.
        const tmp = path.join(require("os").tmpdir(), "altlasten-selftest.js");
        fs.writeFileSync(tmp, 'const x = 1;\nfunction tickPhoenixDeath() {}\n// Kommentar darf "glutwesen" sagen\n');
        const hits = scan([tmp]);
        fs.unlinkSync(tmp);
        const fired = hits.length === 1 && /tickPhoenixDeath/.test(hits[0]);
        console.log(
            fired
                ? "✅ SELBST-TEST: die Wand feuert (1 Injektion erkannt, Kommentar ignoriert)"
                : `❌ SELBST-TEST: ${JSON.stringify(hits)}`
        );
        // Die Alias-Wand muss feuern: eine Tafel, die den Mammut wieder als Buche führt.
        const aliasFeuert =
            checkAliasArten({
                forestLabToHost: (id) => (id === "mammut" ? "baum_buche" : id),
                forestHostToLab: (id) => (id === "baum_buche" ? "mammut" : id),
            }).length === 2;
        console.log(
            aliasFeuert
                ? "✅ SELBST-TEST: die Alias-Wand feuert (der Mammut als Buche erkannt)"
                : "❌ SELBST-TEST: die Alias-Wand feuert nicht"
        );
        process.exit(fired && aliasFeuert ? 0 : 1);
    }

    const errs = scan(files)
        .concat(checkSoulKeys())
        .concat(scanZwillinge())
        .concat(scanLabBuster())
        .concat(scanInstanzWand(fs.readFileSync(path.join(root, "anazhRealm.js"), "utf8")))
        .concat(scanEntsorgungsWand(fs.readFileSync(path.join(root, "anazhRealm.js"), "utf8")))
        .concat(scanKartenWand(fs.readFileSync(path.join(root, "anazhRealm.js"), "utf8")))
        .concat(scanNormalWand(fs.readFileSync(path.join(root, "anazhRealm.js"), "utf8")))
        .concat(scanStufenWand(fs.readFileSync(path.join(root, "foundry-core.js"), "utf8")))
        .concat(scanPortWand(gateDateien(root)))
        .concat(checkAliasArten());
    if (errs.length) {
        console.log("⛔ DIE RÜCKKEHR-WAND — gefallene Namen im Stamm und in den Linsen:");
        for (const e of errs) console.log("   ❌ " + e);
        process.exit(1);
    }
    console.log(
        `✅ DIE RÜCKKEHR-WAND steht — ${FORBIDDEN.length} gefallene Namen grep=0 in ${files.length} Dateien (Stamm + Linsen in scripts/lib), CREATURE_SOULS = exakt [${SOUL_KEYS_EXPECTED.join(" · ")}], ${ZWILLINGE.length} Zwillings-Fingerabdrücke wohnen nur im Gesetzbuch, jede InstancedMesh entsteht im EINEN Chokepoint, ${KARTEN_METHODEN.length} Karten-Methoden malen nichts im Haupt-Thread, kein normalNode dreht mit der transponierten Matrix oder liest r184s normalWorld, die Bau-Stufe hat EINE Bedeutung (stufenRezept), jedes Gate liest seinen Port aus EINER eigenen Variable, jede Gruppe mit Welt-Vorlagen entsorgt über die EINE Regel (_disposeSoulGroup).`
    );
}

main();
