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
    { token: "maxWalkableSlopeY", fiel: "ZWILLINGS-ABSCHIED 19.07. — hang.maxSlopeY via _bewegungsBlock (fail-closed)" },
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
    { token: "_bundleZiegelTick", fiel: "V18.528 — der Region-Ziegel (Fern-Cache) fiel, das Ferne trägt der Welt-March" },
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
    // Die Chunk-Einbürgerung in Region-Bundles hat keinen Bürger mehr (Boden · Stitch · Wasser sind Sätze, die
    // Klein-Streu ist EINE InstancedMesh je Art); der Streu-Pool je Chunk und der Deck-Zwilling des Fernfelds
    // sind gefallen.
    { token: "_chunkBundleAnker", fiel: "Welle B — der Satz ist der EINE Eintritt (_chunkSatzEin / _streuNahEin)" },
    { token: "_chunkBundleRegionKey", fiel: "Welle B" },
    { token: "_bundleKugelWeite", fiel: "Welle B — kein Chunk-Bürger wächst eine Region-Kugel mehr" },
    { token: "_acquireScatterMesh", fiel: "Welle B — der Streu-Satz je Art (_streuNahArt)" },
    { token: "_releaseScatterMesh", fiel: "Welle B" },
    { token: "_drainScatterMeshPools", fiel: "Welle B" },
    { token: "_scatterMeshPools", fiel: "Welle B" },
    { token: '"deck-streu"', fiel: "Welle B — die Deck-Streu ist der zweite Block der Fern-Mesh je Art" },
    // Der platzierte Bau keyt nicht mehr regional: die 256-m-Region (`p:x,z`) brachte keinen Cull (ihre Kugel
    // schneidet das Frustum praktisch immer), sie vervielfachte nur die Gruppen je Leaf.
    { token: "_archPlacedRegionKey", fiel: "Welle B — der platzierte Bau ist global, ein Studio-Leaf keyt nach Geometrie" },
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
    { token: "_diaetGeteilteOffen", fiel: "Bundle-Wahrheit — das Nachziehen der Abkürzung (8cf8cb5) wird nie integriert" },
    { token: "useRegionRenderBundles", fiel: "Bundle-Wahrheit — kein Kill-Switch, die Bundles sind der EINE Weg" },
    // DIE ZEITLICHE AUFLÖSUNG (04.10.) — FXAA am Ende der Post-Kette fiel ganz: die Kantenglättung ist TRAA (vendor/
    // TRAANode.js) als erste Stufe, die Dither-Blende rotiert hinter dem Knoten (state.traaNode), nie hinter einem Flag.
    { token: "_fxaa", fiel: "04.10. — TRAA trägt die Kantenglättung (_ensurePostProcessing)" },
    { token: "taaLite", fiel: "04.10. — das nie gesetzte TAA-Flag; uDitherT rotiert, wo state.traaNode steht" },
    // DIE INTEGRATION der Bild-Wahrheit (04.10.): der Gruppen-Schlüssel mit Saison war ein Zwilling des saisonfreien
    // Körper-Schlüssels (V18.527) und traf im Cache nie; die Höhe eines Baum-Körpers lebt im Höhen-Buch.
    { token: "_foundryGruppenKey", fiel: "Integration bild-wahrheit — _foundryKoerperKey ist der EINE Körper-Schlüssel" },
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
    { token: "_streuGesetzBahnOffen", fiel: "Integration 05.10. — _weltMarchGezeichnet, dieselbe Wand wie der Feld-Pass" },
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
    { token: "_WIRT_WURF", fiel: "Integration W8 — das Budget aller Kerne trägt den Wurf (lod.budget[kind][stufe].schatten)" },
    // Integration W8 (Seh-Klasse): die Zwillinge des Budget-Gesetzes im Wirt fallen — die Look-Liste, die Verschmelz-
    // Zahl, die Material-Defaults und die Füll-Farbe liest der Wirt aus phyto-core (LOOK_KLASSEN · BUDGET_GESETZ ·
    // budgetRegler · budgetFuellFarbe).
    { token: "AnazhRealm.LOOK_KLASSEN", fiel: "Integration W8 — phyto-core LOOK_KLASSEN / budgetLook ist die EINE Liste" },
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
    { token: "Math.max(f.ex, f.ez)", fiel: "Integration 05.10. — _wegeFormRadius: die Diagonale des gedrehten Kastens" },
    // Integration 05.10.: das Kronendach der Ferne ist die Studio-Laubfarbe der Arten am Ort (phyto-core forestNische)
    // × die Selbstbeschattung, die Saison legt uSeasonMul auf — die feste Sommer-Konstante kehrt nicht zurück.
    { token: "kronendach: Object.freeze", fiel: "Integration 05.10. — _fernFarbeTeile (Art × kronenSchatten), uSeasonMul" },
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
    { token: '".klinge fehlt"', fiel: "Welle 5 — die Budget-Wand von tree[1].klinge ist mit der Trauer-Klinge gefallen" },
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
    { token: "opts.fernNode", fiel: "Integration 05.10. — kein Distanz-Schwund in der Karten-Maske (_archKartenHorizont)" },
    { token: "KARTEN_HORIZONT_SCHWUND_M", fiel: "Integration 05.10. — KARTEN_HORIZONT_SAUM_M (Rand je Eintrag)" },
    { token: "_archInKartenZone", fiel: "Integration 05.10. — die EINE Stufen-Wahl (_chooseLODForDistance) trägt fern" },
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
    // Nachbesserung 06.10.: der Umzug der fernen Stufe vergaß jede Krone jenseits seines Fensters — auch die Eintrags-
    // Kronen (a:), die nur beim Entstehen eintragen; der Raum-Index `kronenZellen` bindet die Kosten an den Streifen.
    { token: "this._kronenStreuUmzug(stufe, war, S === fernS)", fiel: "Nachbesserung 06.10. — kein Umzug vergisst eine Krone" },
    // Integration 06.10.: kein Kronendach in der Boden-Albedo (Lehre 21: nie doppelt) — weder das Platzierungs-Feld im
    // Vertex (Main + Worker-Spiegel samt seinem Kronenlicht-Zwilling) noch die Labor-Abdunklung der Streu.
    { token: "const _cShade =", fiel: "Integration 06.10. — der Schatten der echten Krone dunkelt, nie das Feld" },
    { token: "function canopyLightAt(", fiel: "Integration 06.10. — der Worker färbt ohne Kronenlicht-Feld" },
    { token: "function placementStandForest(", fiel: "Integration 06.10. — der Worker-Spiegel des Wald-Stands fiel" },
    { token: "UNDERGROWTH_CANOPY_K", fiel: "Integration 06.10. — der Worker-Spiegel des Kronenlicht-Felds fiel" },
    { token: "_k.mul(_T.float(0.42))", fiel: "Integration 06.10. — die Streu trägt ihre Albedo, die Krone ihren Schatten" },
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
    { token: "row.wirte", fiel: "Integration W5-Körper — der Deck-Mantel liegt auf der Haut der Wurzel (Strähnen je Fläche)" },
    { token: "Math.sqrt(anteil * 3)", fiel: "Integration W5-Körper — kein fester Mantel-Radius je Wirt" },
    { token: "T.neckMid", fiel: "Integration W5-Körper — der Hals-Mantel ist eine Röhre entlang des Halses", auch: ["tetrapoda-core.js", "worlds/tetrapoda/tetrapoda.js"] },
    // Integration 06.10. (W5-Körper) — DIE AUGEN-FARBE HAT EINE QUELLE (tetrapoda tierAuge): das Lab las das feste
    // Bernstein der Material-Tabelle, der Ofen rechnete die Art-Farbe selbst um.
    { token: "art.kopf.auge", fiel: "Integration W5-Körper — der Ofen liest kern.tierAuge" },
    { token: "__TK.tierauge.c,", fiel: "Integration W5-Körper — das Lab liest tierAuge", auch: ["worlds/tetrapoda/tetrapoda.js"] },
    { token: "__TK.tierauge.emissiv", fiel: "Integration W5-Körper — die Glut ist ein Anteil der Iris (tierAuge)", auch: ["worlds/tetrapoda/tetrapoda.js"] },
    { token: "emissiv: 0x442200", fiel: "Integration W5-Körper — tierauge trägt glut, keine eigene Farbe", auch: ["tetrapoda-core.js"] },
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
    { token: "_pointSegDist2D(px, pz, pts[k]", fiel: "Welle 5 Klang — der Fluss-Segment-Scan je Takt (Kosten ∝ Weltgröße)" },
    { token: "playCreaturePing", fiel: "Welle 5 Klang — _tierRuf (die Stimme folgt dem Körper)" },
    { token: "creaturePingCount", fiel: "Welle 5 Klang — symphony.tierRufe" },
    { token: "_tagToFrequency", fiel: "Welle 5 Klang — UMWELT.tier (Grundton ∝ Körperlänge^−0,9)" },
    // Die Körperlänge des Rufs maß eine Box3 über den GERENDERTEN Körper (skinnte jede Haut-Ecke auf der CPU) neben
    // der Seelen-Teile-Länge des Hangs: EINE Quelle ist _creatureKoerperLaenge (Hang + Stimme).
    { token: "_tierKoerperLaenge", fiel: "Welle 5 Klang — _creatureKoerperLaenge (EINE Körperlänge)" },
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
        e.push(`FOREST_SPECIES: baum_buche → ${pc.forestHostToLab("baum_buche")} (die Buche ist keine Lab-Wald-Nische)`);
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
        errs.push(`AnazhRealm.VERSION trägt stale "${vm[1]}" (package.json ${version}) — Trace/Panel lügen über die Version`);
    // DOKU=VERSION (19.07., Schöpfer-Karte §5.6 „Doku = Version"): der Stand-Kopf
    // von CLAUDE.md ist die Chronik-Spitze — trägt er eine andere Version als
    // package.json, LÜGT die Doku relativ zum Code (die 18.490/18.491-Drift-
    // Klasse). DIESELBE Wand, ein weiterer Träger.
    const claude = fs.readFileSync(path.join(root, "CLAUDE.md"), "utf8");
    const cm = claude.match(/## Stand \(V([0-9.]+)/);
    if (!cm) errs.push("CLAUDE.md Stand-Kopf nicht gefunden (## Stand (V… — die Doku-Wand braucht den Anker)");
    else if (cm[1] !== version)
        errs.push(`CLAUDE.md Stand-Kopf trägt stale V${cm[1]} (package.json ${version}) — die Chronik lügt relativ zum Code`);
    return errs;
}

// DIE INSTANZ-WAND (V18.510): jede InstancedMesh der Welt entsteht im EINEN Chokepoint
// `AnazhRealm._instanzMesh` (Instanz-Matrix als Storage). Ein Bau daran vorbei trägt die Kapazität
// wieder als Uniform-Array-Länge in den Vertex-Shader — ein Programm + eine Pipeline je Kapazität
// (gemessen 02.10.: 756 Vertex- auf 60 Fragment-Programme). Erlaubt: genau EIN `new THREE.InstancedMesh(`
// (der Chokepoint selbst) + der Feld-Cull-Konsument (Kapazität fest 1, eigene Storage-Matrix).
function scanInstanzWand(srcRoh) {
    const code = stripComments(srcRoh);
    const n = (code.match(/new THREE\.InstancedMesh\(/g) || []).length;
    const errs = [];
    if (n !== 1) errs.push(`Instanz-Wand: \`new THREE.InstancedMesh(\` steht ${n}× im Stamm (erlaubt: 1, der Chokepoint _instanzMesh)`);
    const kopf = code.indexOf("static _instanzMesh(geom, mat, cap) {");
    if (kopf < 0 || code.indexOf("new THREE.InstancedMesh(", kopf) - kopf > 200)
        errs.push("Instanz-Wand: der Chokepoint `static _instanzMesh(geom, mat, cap)` trägt den Bau nicht");
    if (!/StorageInstancedBufferAttribute\(m\.instanceMatrix\.array, 16\)/.test(code))
        errs.push("Instanz-Wand: _instanzMesh legt die Matrix nicht als StorageInstancedBufferAttribute an");
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
    return errs;
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
    ].map((f) => path.join(root, f));

    if (process.argv.includes("--selftest")) {
        // Die Instanz-Wand muss feuern: ein zweiter Bau am Chokepoint vorbei.
        const stamm = fs.readFileSync(path.join(root, "anazhRealm.js"), "utf8");
        const instanzFeuert =
            scanInstanzWand(stamm).length === 0 &&
            scanInstanzWand(stamm + "\nconst x = new THREE.InstancedMesh(g, m, 64);\n").length === 1;
        if (!instanzFeuert) {
            console.log("❌ SELBST-TEST: die Instanz-Wand feuert nicht (oder steht heute rot)");
            process.exit(1);
        }
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
        const normalFeuert =
            scanNormalWand(stamm).length === 0 &&
            scanNormalWand(stamm + "\nmat.normalNode = _T.normalize(n).transformDirection(_T.cameraViewMatrix);\n")
                .length === 1 &&
            scanNormalWand(stamm + "\nmat.normalNode = _T.cameraViewMatrix.transformDirection(_T.normalize(n));\n")
                .length === 0;
        if (!normalFeuert) {
            console.log("❌ SELBST-TEST: die Normal-Wand feuert nicht (oder steht heute rot)");
            process.exit(1);
        }
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
        .concat(scanKartenWand(fs.readFileSync(path.join(root, "anazhRealm.js"), "utf8")))
        .concat(scanNormalWand(fs.readFileSync(path.join(root, "anazhRealm.js"), "utf8")))
        .concat(checkAliasArten());
    if (errs.length) {
        console.log("⛔ DIE RÜCKKEHR-WAND — gefallene Namen im Stamm:");
        for (const e of errs) console.log("   ❌ " + e);
        process.exit(1);
    }
    console.log(
        `✅ DIE RÜCKKEHR-WAND steht — ${FORBIDDEN.length} gefallene Namen grep=0, CREATURE_SOULS = exakt [${SOUL_KEYS_EXPECTED.join(" · ")}], ${ZWILLINGE.length} Zwillings-Fingerabdrücke wohnen nur im Gesetzbuch, jede InstancedMesh entsteht im EINEN Chokepoint, ${KARTEN_METHODEN.length} Karten-Methoden malen nichts im Haupt-Thread, kein normalNode dreht mit der transponierten Matrix.`
    );
}

main();
