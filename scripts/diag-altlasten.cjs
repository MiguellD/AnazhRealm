#!/usr/bin/env node
// ============================================================================
// DIE RÜCKKEHR-WAND — gate:altlasten (ALTLASTEN-NULL W4)
//
// Gesetz #0: Struktur statt Wachsamkeit. Jeder vollzogene Abschied hinterlässt
// hier seine Zeile — ein gefallener Name kann strukturell nicht in den Stamm
// zurückkehren (grep = 0 auf dem KOMMENTAR-BEREINIGTEN Code; Kommentare dürfen
// die Geschichte erzählen, der CODE darf das Wort nicht mehr tragen — die
// Disziplin). Wächst mit jedem künftigen Abschied: eine Zeile je Name.
//
// Selbst-Test: --selftest injiziert einen verbotenen Namen in eine Kopie und
// beweist, dass die Linse feuert (kein vakuöses Grün).
// ============================================================================
"use strict";
const fs = require("fs");
const path = require("path");
const stammLib = require("./lib/stamm.cjs");
const { scanWarteWand } = require("./lib/welt-boot.cjs");

// Die gefallenen Namen: je Eintrag ein PRÄZISER Token (nie ein generisches Wort — "sprite" träfe THREE.Sprite) und was
// ihn trägt (`fiel`); die Geschichte jedes Schnitts steht in git (Lehre 15).
// ein gefallener Name: sein Token, was ihn trägt (`fiel`), wo außer dem Stamm er nie wiederkehrt (`auch`)
const ab = (token, fiel, auch) => ({ token, fiel, auch });
const FORBIDDEN = [
    ab("tickPhoenixDeath", "W1a — der Tod ist feld-nativ (_playerDeathRespawn)"),
    ab("triggerPhoenixDeath", "W1a"),
    ab("preDeathSoul", "W1a — kein Gestalt-Tausch beim Tod"),
    ab("phoenixUntil", "W1a — respawnGraceUntil trägt"),
    ab("phoenixDurationSeconds", "W1a"),
    ab('"phoenix"', "W1a — die Fantasie-Seele"),
    ab('"dragon"', "W1a — die Fantasie-Seele"),
    ab("glutwesen", "W1b — der Wolf trägt das Raubtier (Gattung)"),
    ab("_waechterSoulParts", "W1b — der koerperstudio-Mensch ist DER Menschkörper"),
    ab("avatar_waechter", "W1b"),
    ab("WAECHTER_DIALS", "W1b"),
    ab("_p2pMsgAura", "W1c — aura ist dem Dispatcher unbekannt"),
    ab("_p2pEnsurePeerAura", "V18.448 — die Avatar-Aura"),
    ab("_p2pBroadcastAura", "V18.448"),
    ...[
        "_nachtAnteil",
        "_celestialHorizonFade",
        "_daemmerung",
        "_himmelHell",
        "_himmelGrenzgroesse",
        "_interpolateDayNight",
        "DAY_NIGHT_STOPS",
    ].map((t) => ab(t, "S7 — die EINE Tag-Achse (_tagAchse)")),
    ab("modify_terrain", "V9.36 — voxel_carve/voxel_fill; KI2 16.10.: der letzte Name in RULE_FORBIDDEN_EFFECT_OPS"),
    ab("_chunksTouchedByDisc", "V9.36 — die Heightfield-Schicht von modify_terrain"),
    ab("_appendChunkDeltaOp", "V9.36"),
    ab("_sanitizeChunkDeltas", "V9.36"),
    ab("_applyModifyOpToChunk", "V9.36"),
    ab("_rebuildChunkPhysics", "V9.36"),
    ab("applyChunkDelta", "V9.36"),
    ab("CHUNK_DELTA_OPS_CAP", "V9.36"),
    ab("chunkDeltas", "V9.36 — Edits sind EINE Karte je Chunk (_voxelEditKarte)"),
    ...[
        "generateChunk",
        "addTerrainPhysics",
        "extendTerrain",
        "caveData",
        "volcanoData",
        "setVoxelTerrainActive",
        "_setHeightfieldDormant",
        "_restoreVoxelTerrain",
        "calculateTerrainSteepness",
        "ensureChunkAt",
        "_buildChunkGrass",
        "_disposeChunkGrass",
        "_terrainHeightAtWorld",
        "_disposeChunkPhysics",
        "pruneDistantChunks",
        "_chunkGeometry",
        "_buildVoxelChunkWaterfalls",
        "_disposeVoxelChunkWaterfalls",
        "voxelChunkWaterfalls",
        "_buildHydroWaterfall",
        "_waterfallIsRealWall",
        "setWaterfallSteep",
        "_setVoxelWaterIsoVisible",
        "_ensureHorizonMantle",
        "_disposeHorizonMantle",
        "_ensureCanopyShell",
        "_buildCanopyShell",
        "_disposeCanopyShell",
    ].map((t) => ab(t, "V9.30–V9.39 — das Heightfield fiel, der Boden ist Voxel")),
    ...["_buildIslandCollision", "_disposeStaticCollision", "_buildTreeCollision", "spawnTreeAt"].map((t) => ab(t, "Welle 6.G — die Kollision ist feld-nativ, der Baum ein Bauplan")),
    ...["initIntroDialog", "_introPages", "createDynamicAbility", "codeParser", "developAdvancedPhysics", "developAdvancedRenderer"].map(
        (token) => ({ token, fiel: "UI-Putz und Phase 5 — kein Anleitungs-Modal, kein Laufzeit-Code, der Nexus spricht DSL" })
    ),
    ...["_equipAppendHeldRow", "_equipAppendWeaponRow", "_workshopRenderActions"].map((t) => ab(t, "V17.91/V18.66 — der EINE Halte-Pfad (wieldBlueprint), der EINE FERTIGEN-Akt")),
    ...["_chatTryWorldCommand", "_chatTrySystemCommand", "_chatTryAbilityCommand", "_chatTryPersistenceCommand"].map(
        (token) => ({ token, fiel: "E1 — der Chat-Dispatch ist die EINE Tabelle (chatSystemPatterns)" })
    ),
    ab("tickPlayerAura", "V18.448"),
    ab("_auraHueOut", "V18.448 — kein Aura-Cache am Spieler"),
    ab("_ensureAuraSkinShells", "V18.448"),
    ab("AURA_TAG_HUE", "V18.448 (CREATURE_TASK_AURA_HUE lebt — anderes System)"),
    ab("_buildCreatureSkinGeometry", "KONVERGENZ III — der Baum trägt die Gestalt"),
    ab("__bakeSkinGeometry", "KONVERGENZ III — bake-core/bake-worker sind gefallen"),
    ab("_bakeSkinRequest", "KONVERGENZ III — das Bäcker-Protokoll"),
    ab("_ensureBakeWorker", "KONVERGENZ III — der Bäcker-Worker"),
    ab("_attachCreatureSkin", "KONVERGENZ III — die Haut-Anhäng-Naht"),
    ab("_addCreatureFace", "KONVERGENZ III — der Baum trägt das ECHTE Gesicht"),
    ab("_creatureFaceLOD", "KONVERGENZ III — die Gesichts-LOD-Gruppe"),
    ab("CREATURE_FACE_LOD_DIST_SQ", "KONVERGENZ III"),
    ab("__anazhHeadlessSkinResCap", "KONVERGENZ III — der Headless-Skin-Res-Knopf"),
    ab("_acquireGrassMesh", "V18.492 — kein Halm-Mesh, kein Pool"),
    ab("_releaseGrassMesh", "V18.492"),
    ab("_drainGrassMeshPool", "V18.492"),
    ab("_grassMeshPool", "V18.492"),
    ab("_grassConeGeometry", "V18.492"),
    ab("GRASS_POOL_CAP", "V18.492"),
    ab("GRASS_MAX_BLADES", "V18.492"),
    ab("_grassStudioGeometry", "V18.492 — die Studio-Halm-Geometrie"),
    ab("_tickGrassStage", "V18.492 — der Stufen-Tick lief ins Leere"),
    ab("GRASS_TUFT_BLADES", "N7.4 — die Wiese ist Boden-Funktion"),
    ab("voxelChunkGrassDensity", "N7.4"),
    ab("voxelChunkGrassStage", "V18.492"),
    ab("_buildTierBaum", "DIE EINE PIPE — der Stamm-Inline-Baum-Tunnel"),
    ab("_tierFernTeile", "DIE EINE PIPE — das Stamm-eigene Fern-System (lod1 kommt aus der Pipe)"),
    ab("_buildCreatureHideMaterial", "DIE EINE PIPE — die Look-Interpretation (mp/Studio-Zahlen führen)"),
    ab("emissivIntensitaet", "AUGEN-GLUT-SCHNITT — der Bäcker liest kl.ei (die Gesetzbuch-Wahrheit)"),
    ab("BatchedMesh", "V18.510 — je Instanz ein Draw unter WebGPU; die InstancedMesh trägt"),
    ab("_archBatchGroupFor", "V18.510"),
    ab("_archBatchAddGeometry", "V18.510"),
    ab("_tickBatchStagingEntlassung", "V18.510 — kein Batch-Staging mehr"),
    ab("useBatchedArch", "V18.510"),
    ab("archBatches", "V18.510"),
    ab("_foundryIdbInit", "V18.511 — die Platte lebt in der Transport-Schale"),
    ab("_foundryIdbGet", "V18.511"),
    ab("_foundryIdbPut", "V18.511"),
    ab("0xc89372", "BOOT-LITERAL-ABSCHIED — die Haut zieht aus der SKIN_TONES-Palette"),
    ab("0x241712", "BOOT-LITERAL-ABSCHIED — das Haar zieht aus der HAIR_COLORS-Palette"),
    ab("SPECIES_GRAMMAR", "K24 — der Richter wächst aus treeParams der Art (_phytoArt), keine Stamm-Grammatik"),
    ab("_phytoDialsFor", "K24 — der dritte Dial-Zwilling (Grammatik-Krone → P)"),
    ab("_phytoStudioDials", "K24 — die Art liest _phytoArt, ihr Phänotyp artPhaenotyp"),
    ab("_ensureVariantSeedPool", "K24 — der Pool wächst je Art (_variantSeedsFor)"),
    ab("_generateVariantSeedPool", "K24 — der Pool wächst je Art (_variantSeedsFor)"),
    ab("skeleton.grammar", "K24 — das Laub der Art am Skelett heißt skeleton.laub (aus P)"),
    ab("SPECIES_PALETTE_DEFAULT", "K24-N1 — die Rinde des Skeletts ist P.barkA/barkB der Art, kein Ersatz"),
    ab("DEFAULT_TREE_FLARE", "K24-N1 — der Wurzelanlauf ist P.flare der Art, die Rippen STAMM_RIPPEN"),
    ab("foliageScale", "K24-N1 — ein nie geschriebenes Skelett-Feld, die Leser setzten still 1"),
    ab("totalH || 10", "K24-N1 — die Höhe des Skeletts ist P.height, kein Ersatz"),
    ab("flareAmp || 0.45", "K24-N1 — der Farn mit Anlauf 0 bekam still 0,45"),
    ab('test(sp) ? "oak"', "K24-N1 — die Blatt-Form ist P.leafShape der Art, nie ihr Name"),
    ab("SPECIES_PHYTO_DIALS", "DIAL-ZWILLINGS-ABSCHIED — die Studio-Tafel führt (gefühlt == gesehen)"),
    ab("SPECIES_PALETTE_GIGANT", "DIAL-ZWILLINGS-ABSCHIED — der Gigant trägt den mammut-Ton der Tafel"),
    ab("SPECIES_PALETTE[", "DIAL-ZWILLINGS-ABSCHIED — die Art-Palette wohnt in der Studio-Tafel"),
    ab("_heN(", "FAHR-ZWILLINGS-ABSCHIED — _fahrGesetz liest fail-closed, kein Misch-Gesetz"),
    ab("maxWalkableSlopeY", "ZWILLINGS-ABSCHIED 19.07. — hang.maxSlopeY via _bewegungsBlock (fail-closed)"),
    ab("lodServe", "V18.500 — fachwerk-core L1 = Flächen-Stufe, kindStages [0,1,2] alle serviert"),
    ab("fillLight", "V18.503 — die Welt-Schattenseite trägt der Himmel (_ensureSkyEnvironment)"),
    ab("rimLight", "V18.503 — die Welt-Schattenseite trägt der Himmel (_ensureSkyEnvironment)"),
    ab("backLight", "V18.503 — die Welt-Schattenseite trägt der Himmel (_ensureSkyEnvironment)"),
    ab("FILL_LIGHT", "V18.503 — Studio-Füll-Rig nur im Labor"),
    ab("RIM_LIGHT", "V18.503 — Studio-Füll-Rig nur im Labor"),
    ab("BACK_LIGHT", "V18.503 — Studio-Füll-Rig nur im Labor"),
    ab("_weltBrickAlloc", "V18.528 — kein Voxel-Atlas mehr, Felder sind Analog-Sätze"),
    ab("_weltBrickHolen", "V18.528 — kein Brick-Dedup, der Kapsel-Cache dedupliziert"),
    ab("_weltFeldSpawn", "V18.528 — Feld-Einträge entstehen nur als Kapsel-Satz (_baumKapselFit)"),
    ab("_weltFeldRegister", "V18.528 — kein Brick-Register"),
    ab("brickCache", "V18.528 — der Kapsel-Cache ist der EINE Dedup"),
    ab("freiGross", "V18.528 — kein 64³-Block-Allokator"),
    ab("freiKlein", "V18.528 — kein 32³-Einheiten-Allokator"),
    ab("atlasDaten", "V18.528 — der 512×512×128-RGBA8-Atlas (128 MB) fiel"),
    ab("feldTriAbtast", "V18.528 — der trilineare Brick-March im WGSL fiel"),
    ab("feldTriGrad", "V18.528 — der trilineare Brick-Gradient im WGSL fiel"),
    ab("_bundleZiegelTick", "V18.528 — der Region-Ziegel (Fern-Cache) fiel, das Ferne trägt der Welt-March"),
    ab("_bundleZiegelTod", "V18.528"),
    ab("_ziegelBackenAusGruppe", "V18.528 — der Gruppen-Bäcker fiel mit dem Region-Ziegel"),
    ab("_waldZiegelBacken", "V18.528 — der Einzel-Baum-Brick war fail-closed, nun physisch fort"),
    ab("WALD_ZIEGEL", "V18.528"),
    ab("FERN_SCHICHT", "V18.528 — EIN Szene-Pass (Trace .36)"),
    ab("FERN_LAYER", "V18.528 — EIN Szene-Pass, die Schalen leben auf Layer 0"),
    ab("fernSchicht", "V18.528 — EIN Szene-Pass (Trace .36)"),
    ab("_chunkBodenGpuHat", "Welle B — der Boden-Satz hält die CPU-Arrays (Views)"),
    ab("_chunkBodenNulle", "Welle B"),
    ab("_tickChunkBodenEntlassung", "Welle B"),
    ab("_chunkBodenReHydrieren", "Welle B"),
    ab("_chunkEntlass", "Welle B — Entlass-Schlange und -Bytes"),
    ab("CHUNK_ENTLASS_GNADE_MS", "Welle B"),
    ab("_entlassBytes", "Welle B"),
    ab("_chunkRehydrierLauf", "Welle B"),
    ab("wasserImBundle", "Welle B — das Wasser des Rings ist der Wasser-Satz"),
    ab("aShore", "Welle L Q7 — die tote Ufer-Spalte; der Saum ist der optische Weg"),
    ab("riverFoam", "Welle L Q7 — der Strähnen-Schaum ohne Gesetz-Grund (W-B1)"),
    ab("_playerWaterContext", "Welle L Q6 — das Zell-Dach als Körper-Spiegel (W-K2)"),
    ab("_waterCellAt", "Welle L Q6 — der Zell-Leser als dritte Wahrheit, nur noch von einer Probe gerufen"),
    ab("FLOW_ADVECT_SPEED", "Welle L Q6 — die Host-Strömung 3,2 m/s neben dem Gesetz 1,2 (W-kD4)"),
    ab("FLOW_ADVECT_K", "Welle L Q6 — die Schlupf-Kopplung des Spielers neben der additiven des Tiers"),
    ab("convexBulge", "Welle L Q7 — der 1,55-m-Buckel des Querschnitts (W-F2)"),
    ab("waterRunSurfaceAt", "Welle L Q7 — die geglättete Lauf-Fläche; der Spiegel selbst ist monoton"),
    ab("_tickWaterCANearWake", "Welle L Q6 — die Annäherungs-Weckung (Ufer-Flut W-W1)"),
    ab("_wakeWaterCAOnce", "Welle L Q6 — die Einstream-Weckung"),
    ab("_caEvaporateSettled", "F3 — die Verdunstung der Zungen über dem Spiegel (die Haut fiel)"),
    ab("_preSeedWaterCAForEdit", "F3 — die Vor-Saat des Grabens aus den alten Zellen (sein Dach war die zweite Fläche)"),
    ab("WAKE_CA_RADIUS", "Welle L Q6"),
    ab("_voxelChunkNearPlayer", "Welle L Q6 — der Nah-Test der Weckung"),
    ab("_caWoken", "Welle L Q6"),
    ab("waterRenderMode", "Welle L Q7 — der Render-Schalter Zell-Sheet/Zell-Iso"),
    ab("_cullWaterUndersides", "Welle L Q7 — die Unterseiten-Schere der Zell-Iso"),
    ab('"chunk-water-iso"', "Welle L Q7 — der Kind-Stempel der Zell-Iso"),
    ab("select-waterrender", "Welle L Q7 — die Auswahl im Einstellungs-Band"),
    ab("_ensureWaterfallMaterial", "Welle L Q7 — die Saat ohne Leser"),
    ab("waterfallUniforms", "Welle L Q7"),
    ab("waterfallMaterial", "Welle L Q7"),
    ab("sys.lastT", "Welle L Q7 — der Regen fiel je Frame im Haupt-Thread; die Lage rechnet der Vertex"),
    ab("dt * 42", "Welle L Q7 — die Fall-Zahl des Labors wohnt im REGEN_GESETZ", ["worlds/terrain/phytogenesis.js", "foundry-bruecke.js"]),
    ab("aboveWater < 2.0", "Welle L Q7 — die Strand-Glocke trägt bis 0,6 + 1,9 m (imStrand)"),
    ab("seg.halfW || 0", "Welle L Q7 — die Halbbreite am Fußpunkt wie im Main (hwA/hwB)"),
    ab("kroneAnteil", "Gegenprüfung 07.10. — die Krone nach 0,6 der Bank-Rampe (die Steilwand)"),
    ab("carveBankSlope", "Gegenprüfung 07.10. — die Bank-Rampe Tiefe × 1,4; die Bank ist bankNeigung"),
    ab("kn.T - y", "Gegenprüfung 07.10. — das Gewicht der Gleit-Zone; die Dichte nimmt Kanal und Damm"),
    ab("_nahStreuSpiegel", "Gegenprüfung 07.10. — der Kronen-Sprung des Schilf-Bands (13 Sprünge bis 1,0)"),
    ab("_chunkBundleAnker", "Welle B — der Satz ist der EINE Eintritt (_chunkSatzEin / _streuNahEin)"),
    ab(".iStart", "Welle 6 Boden-Schatten — je Pass ein Abschnitt (_chunkSatzPass), kein Ring-Index"),
    ab(".iVoll", "Welle 6 — der ganze Satz zeichnet nie; je Pass ein Abschnitt (_chunkSatzAbschnitt)"),
    ab("_satzWerferWahl", "Welle 6 — die Werfer-Wahl der Bau-Sätze ist der Abschnitt je Pass (_chunkSatzPass)"),
    ab("_chunkSatzVerdraeng", "Welle 6 — kein Abschnitt verdrängt einen anderen; der Index wächst (_chunkSatzUmlegen)"),
    ab("_chunkBundleRegionKey", "Welle B"),
    ab("_bundleKugelWeite", "Welle B — kein Chunk-Bürger wächst eine Region-Kugel mehr"),
    ab("_acquireScatterMesh", "Welle B — der Streu-Satz je Art (_streuNahArt)"),
    ab("_releaseScatterMesh", "Welle B"),
    ab("_drainScatterMeshPools", "Welle B"),
    ab("_scatterMeshPools", "Welle B"),
    ab('"deck-streu"', "Welle B — die Deck-Streu ist der zweite Block der Fern-Mesh je Art"),
    ab("_archPlacedRegionKey", "Welle B — der platzierte Bau ist global, ein Studio-Leaf keyt nach Geometrie"),
    ab("useRegionArchCull", "Welle B"),
    ab("ARCH_REGION_CULL_MAX_SPAN", "Welle B"),
    ab("p:s:", "Welle B — die platzierte Fern-Superregion"),
    ab('"@p:"', "Welle B"),
    ab("_archGroupKeyReapable", "Welle B — jede leere Gruppe fällt durch den Leer-Chokepoint"),
    ab("_anazhDiaetRid", "Bundle-Wahrheit — die Diät schreibt je Programm und Render, kein Stempel"),
    ab("_diaetGeteilteOffen", "Bundle-Wahrheit — das Nachziehen der Abkürzung (8cf8cb5) wird nie integriert"),
    ab("useRegionRenderBundles", "Bundle-Wahrheit — kein Kill-Switch, die Bundles sind der EINE Weg"),
    ab("_fxaa", "04.10. — TRAA trägt die Kantenglättung (_ensurePostProcessing)"),
    ab("taaLite", "04.10. — das nie gesetzte TAA-Flag; uDitherT rotiert, wo state.traaNode steht"),
    ab("_foliageResScale", "K50 — die Szenen-Skala ist EINE Größe (_szeneSkalaWirk), kein Stellglied des Reglers"),
    ab("foliageResCeiling", "K50 — state.szeneSkala (der Regler „Szene-Auflösung“)"),
    ab("_camMotion01", "K50 — die Wahrnehmung las nur der gefallene Laub-Faktor"),
    ab("PERF_SCENE_RES_", "K50"),
    ab("PERF_FOLIAGE_RES_", "K50 — SZENE_SKALA_MIN"),
    ab("PERF_RENDER_SCALE_", "K50 — die Pixel-Kappe trägt _applyRenderScale ohne Skala"),
    ab("RES_SCALE_DWELL_MS", "K50"),
    ab("_traaVortiefe", "K50 — die Vortiefe im Kanal a der Geschichte (_zeitAufloesung)"),
    ab("_traaNeustartZug", "K50 — der Neustart ist ein Frame ohne Geschichte"),
    ab("_foundryGruppenKey", "Integration bild-wahrheit — _foundryKoerperKey ist der EINE Körper-Schlüssel"),
    ab("viewportLinearDepth", "W7 — _szeneTiefe ist die EINE Szenen-Tiefe (Wasser und Feld-Pass)"),
    ab("_cellLodF", "W1 — die Fernform je Art (`_foundryFernForm`), nie die geklemmte Stufe"),
    ab('"litter"', "W1 — die Streu-Schicht litter fiel final (kein Totholz-Körper im Studio)"),
    ab("_streuGesetzBahnOffen", "Integration 05.10. — _weltMarchGezeichnet, dieselbe Wand wie der Feld-Pass"),
    ab("FOUNDRY_KIND_LOD", "Integration 05.10. — _foundryServierStufe, ohne Config KERN-PFLICHT"),
    ab('baum_totholz: "eiche"', "Integration 05.10. — Totholz als belaubte Alias-Eiche kehrt nie zurück"),
    ab("baum_totholz: Object.freeze", "Integration 05.10. — die Grammatik-Art Totholz fiel final"),
    ab("_ensureImpostorAtlas", "W6 — der Canvas-Atlas je Karte (_impostorAtlas: EINE Array-Textur)"),
    ab("_impostorAtlasMap", "W6 — die Record-Map je Karte (_impostorAtlas().zellen)"),
    ab("_paintStudioAtlasCells", "W6 — das Umdrehen im Haupt-Thread (Studio-Layout lädt ohne Umdrehen)"),
    ab("_reframeImpostorFlat", "W6 — der Rahmen reist je Instanz (aRahmen)"),
    ab("_bakeImpostorSilhouetteCanvas", "W6 — die Silhouette erreichte das Auge nie"),
    ab("_buildImpostorCrossGeometry", "W6 — EIN Einheits-Quad (_impostorQuad)"),
    ab("impostorKey", "W6 — EIN Karten-Material (impostorAtlas)"),
    ab("_rec.frame", "W6 — die Programm-Konstante der Sichthöhe (|aKarte.w|, der Stempel der L1-Höhe)"),
    ab("rttBaked", "W6 — die Zelle ist gebacken"),
    ab("rttFailed", "W6 — die Zelle ist gescheitert"),
    ab("silhouetteWartend", "W6 — der Zensus zählt wartende Zellen"),
    ab("_linearZuSrgb8", "Integration W6 — der Karten-Codec kodiert linear → sRGB (phyto-core)"),
    ab("aOccl", "W6 — die Verdeckung ist das Vorzeichen von aKarte.w"),
    ab("aZelle", "W6 — die Schicht ist aKarte.x"),
    ab("aRahmen", "W6 — der Rahmen ist aKarte.yz"),
    ab("aImpX", "W6 — die Ecke ist 2·uv.x − 1"),
    ab("LOD_TRI_BUDGET_MUL", "W5 — die Kosten wohnen im Asset (lod.budget.tree[0]), Lehre 19"),
    ab("_WIRT_WURF", "Integration W8 — das Budget aller Kerne trägt den Wurf (lod.budget[kind][stufe].schatten)"),
    ab("AnazhRealm.LOOK_KLASSEN", "Integration W8 — phyto-core LOOK_KLASSEN / budgetLook ist die EINE Liste"),
    ab("FOUNDRY_VERSCHMELZ_VERTS", "Integration W8 — phyto-core BUDGET_GESETZ.verschmelzVerts"),
    ab("(lf.castShadow ? 1 : 0)", "Integration W8 — der Flatten verschmilzt nach budgetSippe"),
    ab("(n.receiveShadow ? 1 : 0)", "Integration W8 — die Starr-Bindung bindet nach budgetSippe"),
    ab("KLEIN_VEGETATION_SPECIES", "Waldboden — die Arten sind Studio-Zeilen (placement.boden)"),
    ab("_scatterSpeciesGeometry", "Waldboden — die Gestalt baut das Studio (Foundry)"),
    ab("_scatterImpostorGeometry", "Waldboden — das Kreuz-Fernfeld fiel"),
    ab("_scatterMaterial(", "Waldboden — der Studio-Stoff (`_foundryTreeMaterial`)"),
    ab("_applyScatterMotion", "Waldboden"),
    ab("_buildVoxelChunkScatter", "Waldboden — die Nah-Streu hängt am Schirm (`_nahStreuKachel`)"),
    ab("_disposeVoxelChunkScatter", "Waldboden"),
    ab("_enqueueScatter", "Waldboden"),
    ab("_tickPendingScatter", "Waldboden"),
    ab("pendingScatter", "Waldboden"),
    ab("voxelChunkScatter", "Waldboden — die Kachel trägt ihre Pflanzen (nahStreu.kacheln)"),
    ab("_streuNahArt", "Waldboden — die Senke je Art × Gestalt × Stufe × Teil (_streuNahSenke)"),
    ab("DEKO_FERNFELD", "Waldboden — jenseits der Nah-Streu trägt der Boden"),
    ab("_tickDekoFernfeld", "Waldboden"),
    ab("_buildDekoFernfeldSpecies", "Waldboden"),
    ab("_dekoFernfeldZustand", "Waldboden"),
    ab("_dekoFernSetzen", "Waldboden"),
    ab('"deko-fernfeld"', "Waldboden"),
    ab("_tickDeckStreu", "Waldboden"),
    ab("_buildDeckStreuSpecies", "Waldboden"),
    ab("_scatterChunkRng", "Waldboden — der Wurf-Strom je (Zelle, Art) lebt in _nahStreuKachel"),
    ab("dekoDensity", "Waldboden — die Last-Dichte ist _effectiveFoliageDensity"),
    ab("dekoDichte", "Waldboden — die Kaskade trägt keine Deko-Bänder"),
    ab("_understoryNiche", "Waldboden — das Boden-Gesetz ist die EINE Platzierung (bodenGewicht)"),
    ab("_undergrowthGroundFactor", "Waldboden"),
    ab("_kronenMult", "Waldboden"),
    ab("AnazhRealm.KRONEN", "Waldboden"),
    ab("blumeFloor", "Waldboden"),
    ab("farnFloor", "Waldboden"),
    ab("blume_tulpe", "Waldboden — die Blume ist die Studio-Blume"),
    ab("blume_klee", "Waldboden — die Blume ist die Studio-Blume"),
    ab("blume_mohn", "Waldboden — die Blume ist die Studio-Blume"),
    ab("gestruepp_stecher", "Waldboden — das Gestrüpp ist das Studio-Gestrüpp"),
    ab("schilf_rohr", "Waldboden — das Schilf ist das Studio-Schilf"),
    ab('farn_busch: "strauch"', "Integration Waldboden — das Kraut-Stratum ist der Studio-Farn"),
    ab("_streuAlbedo", "Integration Waldboden — die Studio-Arten backen ihre Farbe im Studio (vegFarbe)"),
    ab('baum_buche: "mammut"', "Waldboden — baum_buche ist die Studio-Buche"),
    ab('baum_karst: "eiche"', "Waldboden — baum_karst ist der Studio-Karst-Baum"),
    ab("new THREE.Fog(", "V18.530 — die Luft ist scene.fogNode, kein linearer Nebel"),
    ab("_atmosphere(", "D3 — die Sonne ist der Durchlass der EINEN Atmosphäre (_atmoSonne)"),
    ab("_fATM", "D3 — die Sonne ist der Durchlass der EINEN Atmosphäre (_atmoSonne)"),
    ab("_nebN", "D3 — die Kuppel liest die Himmels-Sicht der Tafeln (_atmoLutBau), keine Nebel-Kuppel"),
    ab("_hazeCol", "D3 — die Kuppel liest die Himmels-Sicht der Tafeln, kein Grau-Schleier"),
    ab("mieKeule", "D3 — die Keule zur Sonne trägt die Mie-Phase des Gesetzes (ATMO_GESETZ.mieG)"),
    ab("mieAnteil", "D3 — die Keule zur Sonne trägt die Mie-Phase des Gesetzes"),
    ab("mieGlanz", "D3 — die Keule zur Sonne trägt die Mie-Phase des Gesetzes"),
    ab("nebulaColor", "D3 — der Träger der Tönung heißt himmelTint (die Nebel-Kuppel fiel)"),
    ab("_skyEnvTex", "D3 — die Umgebung ist der Wandel-Pass der Himmels-Sicht (rtEq → PMREM), keine CPU-Malerei"),
    ab("RAYLEIGH_BETA", "D3 — die Rayleigh-Tiefe wohnt im Gesetz (ATMO_GESETZ.rayleighTiefe)"),
    ab("ATMOS_GESETZ", "D3 — das Labor liest ATMO_GESETZ (foundry-core)", ["phyto-core.js", "worlds/terrain/phytogenesis.js"]),
    ab("LUFT_GESETZ", "D3 — die Luftmassen-Sonne fiel, die Nacht trägt ATMO_GESETZ.nacht", ["phyto-core.js", "worlds/terrain/phytogenesis.js"]),
    ab("_AIR_SOFT", "D3 — keine Luftmassen-Glättung, der Durchlass ist Hillaire", ["worlds/terrain/phytogenesis.js"]),
    ab("_moonCol", "D3 — der Mond-Hue ist ATMO_GESETZ.nacht.mond", ["worlds/terrain/phytogenesis.js"]),
    ab("_dayNightApplyHemiAndFog", "V18.530 — _dayNightApplyHemiUndLuft"),
    ab("_smoothFogEdge", "V18.530 — kein Lade-Nebel, der Fern-Ring deckt Ungebautes"),
    ab("_fogEdgeSmooth", "V18.530"),
    ab("_builtGrassRingRadius", "V18.530 — die Gras-Front trieb nur den Lade-Nebel"),
    ab("_builtWaterRingRadius", "V18.530 — die Wasser-Front trieb nur den Lade-Nebel"),
    ab("AWAKEN_FOG_FAR", "V18.530 — kein Erwachen-Kokon"),
    ab("FOG_EDGE", "V18.530 — keine Nebel-Kanten-Trägheit"),
    ab("sichtOeffnungM", "V18.530 — keine Höhen-Öffnung, die Luft trägt in jeder Höhe"),
    ab("_oeffnungUmgebung", "V18.530"),
    ab("_syncAtmoToViewDistance", "V18.530 — kein Ring-gekoppelter Schleier"),
    ab("_detailViewDistance", "V18.530"),
    ab("hazeFar", "V18.530 — kein Höhen-Melt neben der Luft"),
    ab("hazeNear", "V18.530"),
    ab("heightWeight", "V18.530 — kein Höhen-Melt in AERIAL"),
    ab("heightCap", "V18.530"),
    ab("setFogDistance", "V18.530 — der tote Fog-Distanz-Regler"),
    ab("fogDistance", "V18.530"),
    ab("slider-fog", "V18.530"),
    ab("uFogNear", "V18.530 — kein Wasser-eigener Nebel"),
    ...["uIrr", "_feldLichtSync", "_feldEnvIrradianz"].map((t) => ab(t, "Licht K3 — Wasser, Feld und Panorama lesen das Licht der Welt (_weltLicht)")),
    ab("_fernRingFarbe", "V18.530 — die Fern-Farbe liest die Boden-Farbe + den Wald (_fernFarbeAt)"),
    ab("_buildSkyPlanets", "V18.530 — die Wandelsterne leben im Sternfeld"),
    ab("_loopSkyboxPlanets", "V18.530 — _loopSkyboxZeit"),
    ab("state.planets", "V18.530"),
    ab("numPlanets", "V18.530"),
    ab("_stlWegeAddStrip", "V18.530 — Wege malen in die Wege-Karte, Zäune in _stlZaunAddStrip"),
    ab("_stlWegeEnsurePool", "V18.530 — _stlZaunEnsurePool"),
    ab("_stlWegeDisposePool", "V18.530 — _stlWegeDispose (Zaun-Pool + Wege-Karte)"),
    ab("state.stlWege", "V18.530 — state.stlZaun / state.wegeKarte"),
    ab("wk.formen", "Integration 05.10. — wk.siedlungen (Formen je Siedlung, Hülle)"),
    ab("Math.max(f.ex, f.ez)", "Integration 05.10. — _wegeFormRadius: die Diagonale des gedrehten Kastens"),
    ab("kronendach: Object.freeze", "Integration 05.10. — _fernFarbeTeile (Art × kronenSchatten), uSeasonMul"),
    ab("farbeJeTakt", "Integration 05.10. — das Fern-Farb-Budget (FERN_FARBE.msJeTakt, _fernFarbTakt)"),
    ...[
        "_fernFarbeTeile(", "_fernFarbeMasche(", "_fernFarbeAt(", "_fernRingTeile(",
        "_fernRingFaerben(", "_fernFarbTakt(", "_fernRingGpuMal(", "_feldZeichnerHoehen(",
        "_voxelWorkerHoehen(", "_feldPassFaerben(", "_flussAbdruck(", "_fernSchuttAt(",
        "_fernRingDeckMisch(", "_fernFlussDeckung(",
    ].map((t) => ab(t, "B2 — der Horizont rechnet im Fern-Faden, der Haupt-Faden-Weg fiel")),
    ab("new Ammo.", "V18.331 — Feld-Physik; die Leck-Linse der CI fiel V18.530"),
    ab("Ammo.destroy(", "V18.331 — Feld-Physik; die Leck-Linse der CI fiel V18.530"),
    ab("_b1.klinge", "Welle 5 — die Trauer-L1 trägt Strähnen (tree[1].straehne), keine Klinge"),
    ab('".klinge fehlt"', "Welle 5 — die Budget-Wand von tree[1].klinge ist mit der Trauer-Klinge gefallen"),
    ab("cup, seg)", "Welle 5 — die Segment-Zahl der Trauer-Klinge (pushLeaf seg) ist mit ihr gefallen"),
    ab("__foliageAtlasError", "Integration Welle 5 — kein Stoff ohne seinen Atlas (_blattAtlasProbe)"),
    ab("_baumGrammatikFit", "05.10. — fern ist der Baum seine Karte (gate:fernwald)"),
    ab("_baumKapselFit", "05.10. — _gestaltKapselFit (Fels, Blume der Gesetz-Streu)"),
    // die Brücke legte ihn in den Umschlag
    ab("__baumGrammatik", "05.10. — der Grammatik-Beipack hatte keinen Leser mehr", ["worlds/terrain/phytogenesis.js", "foundry-bruecke.js"]),
    ab("sdCappedCone", "05.10. — kein Kegel-Stumpf im Welt-March (nur der Baum-Satz trug ihn)"),
    ab("abaum:", "05.10. — die Gesetz-Streu heißt agesetz:, Bäume haben keinen Satz"),
    ab("opts.fernNode", "Integration 05.10. — kein Distanz-Schwund in der Karten-Maske (_archKartenHorizont)"),
    ab("KARTEN_HORIZONT_SCHWUND_M", "Integration 05.10. — KARTEN_HORIZONT_SAUM_M (Rand je Eintrag)"),
    ab("_archInKartenZone", "Integration 05.10. — die EINE Stufen-Wahl (_chooseLODForDistance) trägt fern"),
    ab("entry._fernKarte", "Integration 05.10. — kein Zonen-Voll-Stempel (_lodSlotVoll)"),
    ab("setWaterShoreWidth", "Welle 5 — der optische Weg in Metern trägt das Ufer"),
    ab("setWaterDepthRange", "Welle 5 — der Durchlass trägt die Tiefen-Farbe"),
    ab('"slider-watershore"', "Welle 5 — kein Ufer-Regler"),
    ab('"slider-waterdepth"', "Welle 5 — kein Tiefen-Regler"),
    ab("waterShoreWidth", "Welle 5"),
    ab("waterDepthRange", "Welle 5"),
    ab("uShoreWidth", "Welle 5"),
    ab("uDepthRange", "Welle 5"),
    ab("waterThick", "Welle 5 — wegM (optischer Weg in Metern)"),
    ab("lakeBaseFoam", "Welle 5 — ruhiges Wasser schäumt nicht"),
    ab("const uSkyCol ", "Welle 5 — das Wasser spiegelt die Himmels-Umgebung (_himmelUmgebungTex)"),
    ab("skyCol: uSkyCol", "Welle 5 — der Spiegel liest die Himmels-Umgebung"),
    ab("WG.tief", "Welle 5 — der Wasser-Körper ist R∞ = 0,33·b_b/(wK+b_b) (WASSER_GESETZ.koerperStreu)"),
    ab("_fernFlussFarbe", "K16 — der Fluss der Ferne ist der Wasser-Anteil aNass, gezeichnet mit _wasserBlick"),
    ab("FERN_FARBE.wasser", "K16 — die Ferne trägt den Wasser-Körper des Gesetzes (_wasserKoerper), kein Fern-Blau"),
    ab("0.0196, 0.0863, 0.1706", "K16 — das Fern-Blau 0x265273 fiel, R∞ aus WASSER_GESETZ"),
    ab("_flussBreite", "K16 — die Breite des Flusses ist das Gesetz des Kerns (gelaende-core flussBreite)"),
    ab("HC.widthMin", "K16 — jeder Fluss-Punkt trägt seine Breite; das Minimum ist FLUSS_BREITE.min des Kerns"),
    ab("ctx.getLevel(", "Welle 5 — das Sheet liest das gezeichnete Dach (getDach, _caDach)"),
    ab("getLevel: (", "Welle 5 — der Sheet-Kontext trägt getDach, keinen Live-Pegel"),
    ab("_studioGround", "Welle 5 — die Boden-Palette liegt synchron im Terrain-Namensraum (BODEN_FARBE)"),
    ab("0.42, 0.44, 0.49", "Welle 5 — der Stein-Zwilling; die Palette ist Studio PORTAL_GROUND linear"),
    ab("litTint", "Welle 5 — der Fragment-Waldkern; die Laubstreu folgt den Kronen (_kronenStreuNeu)"),
    ab("G.floorMax", "Welle 5 — der Fragment-Waldkern"),
    ab("floorMax: 0.55", "Welle 5 — der Deckel des Fragment-Waldkerns"),
    ab("const _dryW ", "Welle 5 — die Dürre-Flecken (Albedo × 1,32/1,12/0,6) färbten die Streu orange"),
    ab(".sub(_dryW)", "Welle 5 — die Dürre-Flecken"),
    ab("[0.3, 0.52, 0.22]", "Integration 06.10. — die Insel-Wiese ist BODEN_FARBE.mead"),
    ab("[0.4, 0.3, 0.18]", "Integration 06.10. — der Insel-Hang ist BODEN_FARBE.dirt"),
    ab("[0.34, 0.32, 0.3]", "Integration 06.10. — der Insel-Fels ist BODEN_FARBE.rock"),
    ab("[0.26, 0.38, 0.18]", "Integration 06.10. — das EINE Moos ist TERRAIN_GEOLOGY.mossTint"),
    ab("_kronenStreuNeu(`w:", "Integration 06.10. — spawnArchitecture trägt die Krone ein (a:<id>)"),
    ab("kronen.neuMalen", "Integration 06.10. — _kronenStreuWeg nimmt eine Krone exakt aus der Summe"),
    ab('(emotion === "happy" ? 0.02 : 0.01)', "Welle L kreatur — der Hüpfer startet nur aus bound/pounce"),
    ab("_hopV * 0.05", "Welle L kreatur — der Hüpfer integriert auf delta (updateCreatures)"),
    ab("impulsProM", "Welle L kreatur — der Abflug ist v0 = √(2·g·h) (creatureJump)", ["tetrapoda-core.js"]),
    ab("_hopV = def.hop", "Welle L kreatur — eine Aktion springt über creatureJump (das Sprung-Gesetz)"),
    ab("updateGrowth", "Welle L kreatur — die Größe ist bodySize aus der Identität, kein Wachsen-Würfel"),
    ab("lastGrowthUpdate", "Welle L kreatur — das Wachsen-Relikt fiel"),
    ab("out.set(bestDx, 0, bestDz)", "Welle L kreatur — der Geruchs-Gradient (zentrale Differenz)"),
    ab("m.rotation.y = rc.tyaw || 0", "Welle L kreatur — _p2pTickRemoteCreatures zieht die Gier nach"),
    ab('"player_jump_power", Number((8', "Welle LF rudel — kein Würfel schreibt die Sprungkraft"),
    ab('"player_speed", Number((4', "Welle LF rudel — kein Würfel schreibt das Lauf-Tempo"),
    ab('"creatures_size_mul", Number(', "Welle LF rudel — kein Würfel schreibt die Tier-Größe"),
    ab("cr.scale.multiplyScalar(f)", "Welle LF rudel — die Tier-Größe ist die bodySize-Achse"),
    ab('"time_of_day"', "Leben-Schau 2 — der Zwilling fiel, die Uhr stellt nur set_time_of_day"),
    ab("time_of_day: ([value])", "Leben-Schau 2 — der Zwilling time_of_day schrieb die Uhr roh"),
    ab("this.state.dayLengthMinutes = state.dayLengthMinutes", "Leben-Schau 2 — die Tag-Länge ist die Wahl des Spielers (localStorage), das Laden setzt sie nie"),
    ab("dayLengthMinutes || 8", "Leben-Schau 2 — der Standard ist DAY_LENGTH_DEFAULT_MINUTES (60)"),
    ab("player_size_mul", "Welle LF rudel — die Spieler-Skala ohne Gesetz-Achse fiel"),
    ab("cr.userData.speedMul =", "Welle LF rudel — der Tempo-Hauch wird gelesen (tempoHauch)"),
    ab("TG.signaturen", "Welle LF rudel — das Temperament ist temperamentDerGattung"),
    ab("_temperamentSoul", "Welle LF rudel — das Temperament ist je Gattung × Größe gecacht"),
    ab("boldFromDichte", "Welle LF rudel — die Natur ist der Mut des Temperaments", ["tetrapoda-core.js"]),
    ab("shyFromLebendig", "Welle LF rudel — die Natur ist der Mut des Temperaments", ["tetrapoda-core.js"]),
    ab("radiusBaseM", "Welle LF rudel — der Raum je Leib (separation.raumKugel)", ["tetrapoda-core.js"]),
    ab("minAbstSq", "Welle LF rudel — die Herde zieht jenseits des Paar-Raums", ["tetrapoda-core.js"]),
    ab("fensterSq", "Welle LF rudel — das Herden-Fenster misst im Paar-Raum", ["tetrapoda-core.js"]),
    ab("herdeZug", "S6 — die Herde ist ein Verband (tetrapoda verbandZug)", ["tetrapoda-core.js"]),
    ab("_flockGrid", "S6 — die Glieder je Verband statt der Gattungs-Zellen (_verbaende)"),
    ab("neugierStoppM", "Welle LF rudel — die Neugier hält am Paar-Raum", ["tetrapoda-core.js"]),
    ab("scentProbeM", "Welle LF rudel — die Witterung wählt die Beute an der Nase", ["tetrapoda-core.js"]),
    ab("this._scentAt(cx + probeStep", "Welle LF rudel — kein Gradient der Witterung"),
    ab("fleeSpeedBoost", "Welle LF rudel — die Flucht ist der Sprint der Gestalt", ["tetrapoda-core.js"]),
    ab("strikeRange", "Welle LF kampf — der Biss ist der Ansprung (_kreaturBissReich)", ["tetrapoda-core.js"]),
    ab("pirschStoppM", "Welle LF kampf — die Hetze hält in der Weite des Ansprungs", ["tetrapoda-core.js"]),
    ab("kippNachklangSec", "Welle LF kampf — der Leichnam liegt (gefuehl.leichnamSec)", ["schmiede-core.js"]),
    ab("_kreaturLebend", "Welle LF kampf — der Leichnam ist kein Wesen (state.leichname)"),
    ab("_kreaturZahlLebend", "Welle LF kampf — die Zahl der Wesen ist state.creatures.length"),
    ab("_egoVerborgen", "Ego-Schatten 0910-5 — die Ich-Regel ist der Ebenen-Schalter (_maskeVorEgo)"),
    ab("_egoWar", "Ego-Schatten 0910-5 — die Ich-Regel ist der Ebenen-Schalter (_maskeVorEgo)"),
    ab("_gangQ", "Welle LF rudel — das Fuß-Ziel liegt in der Welt (Pfoten-IK _animateTierBaum)"),
    ab("OBSTACLE_RAYCAST_MAX_DIST_SQ", "Welle L kreatur — _kreaturHuellenKontakt (kein Strahl je Frame)"),
    ab("hasHit = this._runRaycast(", "Welle L kreatur — _kreaturHuellenKontakt"),
    ab("this._kronenStreuUmzug(stufe, war, S === fernS)", "Nachbesserung 06.10. — kein Umzug vergisst eine Krone"),
    ab("const _cShade =", "Integration 06.10. — der Schatten der echten Krone dunkelt, nie das Feld"),
    ab("function canopyLightAt(", "Integration 06.10. — der Worker färbt ohne Kronenlicht-Feld"),
    ab("function placementStandForest(", "Integration 06.10. — der Worker-Spiegel des Wald-Stands fiel"),
    ab("_p2pDisposeMesh", "Frost-Nachbesserung 08.10. — der Mitspieler-Leib entsorgt über die EINE Regel _disposeSoulGroup"),
    ab("UNDERGROWTH_CANOPY_K", "Integration 06.10. — der Worker-Spiegel des Kronenlicht-Felds fiel"),
    ab("_k.mul(_T.float(0.42))", "Integration 06.10. — die Streu trägt ihre Albedo, die Krone ihren Schatten"),
    ab("WG.licht[0]", "Welle 5 — der Wasser-Körper ist R∞ im Licht des Orts (koerperAlbedo × uIrr)"),
    ab("WG.spiegel.dim", "Welle 5 — der Spiegel ist die Himmels-Umgebung × Schlick-Fresnel"),
    ab("const mixT = mix(", "Welle 5 — Tief und Flach trennt der Durchlass, kein Noise-Mix"),
    ab("vnoise(xz.mul(0.05).add(uTime.mul(0.03)))", "Welle 5 — die Noise-Tönung baseN des Wassers"),
    ab("_glutVariant(", "Welle 5 architektur — die Feuerstelle trägt ihre Gestalten im Gesetzbuch"),
    ab("GLUT_VARIANTS", "Welle 5 architektur — glutbrunnen streut ohne Formations-Pool"),
    ab('prefix: "glut"', "Welle 5 architektur — kein Glut-Pool im SCATTER_VARIANT_POOL"),
    ab("row.wirte", "Integration W5-Körper — der Deck-Mantel liegt auf der Haut der Wurzel (Strähnen je Fläche)"),
    ab("Math.sqrt(anteil * 3)", "Integration W5-Körper — kein fester Mantel-Radius je Wirt"),
    ab("T.neckMid", "Integration W5-Körper — der Hals-Mantel ist eine Röhre entlang des Halses", ["tetrapoda-core.js", "worlds/tetrapoda/tetrapoda.js"]),
    ab("art.kopf.auge", "Integration W5-Körper — der Ofen liest kern.tierAuge"),
    ab("__TK.tierauge.c,", "Integration W5-Körper — das Lab liest tierAuge", ["worlds/tetrapoda/tetrapoda.js"]),
    ab("__TK.tierauge.emissiv", "Integration W5-Körper — die Glut ist ein Anteil der Iris (tierAuge)", ["worlds/tetrapoda/tetrapoda.js"]),
    ab("emissiv: 0x442200", "Integration W5-Körper — tierauge trägt glut, keine eigene Farbe", ["tetrapoda-core.js"]),
    ab("faustOffset", "Integration W5-Körper — der Griff sitzt auf rig.handMitte (Ofen-Beipack)"),
    ab("_applyCreatureAllometry", "Integration W5-Körper — die Glied-Dicke trägt ART_GESTALT.bein"),
    ab("ambient.osc1", "Welle 5 Klang — der Drohn; die Welt rauscht aus klang:UMWELT (wind/laub/…)"),
    ab("ambient.ambientGain", "Welle 5 Klang — der Drohn"),
    ab("symphony.weather)", "Welle 5 Klang — Regen = UMWELT.stimmen.regen aus dem rain-Kanal"),
    ab("symphony.weather;", "Welle 5 Klang — Regen = UMWELT.stimmen.regen aus dem rain-Kanal"),
    ab("_symphonyWeatherTarget", "Welle 5 Klang — Regen = UMWELT.stimmen.regen"),
    ab("hydroAudio", "Welle 5 Klang — Ufer/Fluss/Fall aus dem Hör-Ring (_umweltRingProbe)"),
    ab("_buildHydroAudioLayer", "Welle 5 Klang — _umweltKlangBauen"),
    ab("_tickHydrosphereAudio", "Welle 5 Klang — _umweltKlangTick (Kosten je Frame konstant)"),
    ab("_pointSegDist2D(px, pz, pts[k]", "Welle 5 Klang — der Fluss-Segment-Scan je Takt (Kosten ∝ Weltgröße)"),
    ab("playCreaturePing", "Welle 5 Klang — _tierRuf (die Stimme folgt dem Körper)"),
    ab("creaturePingCount", "Welle 5 Klang — symphony.tierRufe"),
    ab("_tagToFrequency", "Welle 5 Klang — UMWELT.tier (Grundton ∝ Körperlänge^−0,9)"),
    ab("_tierKoerperLaenge", "Welle 5 Klang — _creatureKoerperLaenge (EINE Körperlänge)"),
    ab("_playCreatureTaskPing", "Integration W5-Klang — das Tier antwortet mit seiner Stimme (_tierRuf)"),
    ab("CREATURE_TASK_PING_FREQ", "Integration W5-Klang — keine Ping-Tonhöhe je Auftrag"),
    ab("CREATURE_SPECIALIZATION_PING_FREQ", "Integration W5-Klang — der Aufstieg ist ein Freuden-Ruf"),
    ab("_glutVolumen", "Integration W5-Klang — _glutFlaeche (die Brenn-Fläche)"),
    ab("vRefM3", "Integration W5-Klang — UMWELT.stimmen.glut.bettRefM (das Glutbett der Studio-Feuerstelle)", ["klang-core.js", "worlds/klang/klang.js"]),
    ab("1 - this._canopyLightAt(px, pz, fussY)", "Integration W5-Klang — die Laub-Deckung ist _kronenStreuAt"),
    ab("this._canopyLightAt(x, z, y, m)", "K70 Boden nah — das Bodenlicht der Nah-Wiese ist _bodenLichtFeld"),
    ab("(1 - streu * 0.85)", "K70 Boden nah — die Kronen-Karte wirkt einmal, im Licht (_bodenLichtFeld)"),
    ab("licht: this._canopyLightAt(", "K70 Boden nah — das Licht der Nah-Streu ist _bodenLichtFeld"),
    ab("this._playWaterReactionPing()", "Integration W5-Klang — _playWaterReactionPing(fussabdruecke)"),
    ab("feldCull", "05.10. — der Feld-Cull (Compute-Kompaktierung + indirekte Draws) fiel ganz"),
    ab("FeldCull", "05.10. — die Linsen-Haken __anazhFeldCull/__anazhFeldCullExtern"),
    ab("FELD_CULL", "05.10."),
    ab("IndirectStorageBufferAttribute", "05.10. — kein indirekter Draw, den die Band-Linse nicht zählt"),
    ab("g.mesh.dispose()", "W6 — _instanzAbschied (die Instanz-Gruppe)"),
    ab("P.mesh.dispose()", "W6 — _instanzAbschied (Fundament- und Zaun-Pool)"),
    ab("R.mesh.dispose()", "W6 — _instanzAbschied (der Rauch-Satz des Dorfs)"),
    ab("a.mesh.dispose()", "W6 — _instanzAbschied (die Senken der Nah-Wiese und der Nah-Streu)"),
    ab("_streuNahMesh", "Integration W6 — EINE Senke (_senkeMesh)"),
    ab("_nahWieseMesh", "Integration W6 — EINE Senke (_senkeMesh)"),
    ab("_nahWieseKachelMeshes", "Welle 6 — die Senken der Nah-Wiese (_nahWieseSenken, _nahWieseSicht)"),
    ab("_nahWieseKachelEntsorgen", "Welle 6 — die Kachel trägt nur Daten (_nahWieseKachelFaellt)"),
    ab('"nahWiese:" + key', "Welle 6 — kein Mesh je Kachel (nahWiese:L<stufe>:<v>:<teil>)"),
    ab("nahWiese:${v}:L${stufe}", "S3 wiese-gestalten — der Name trägt die Stufe vorn (nahWiese:L<stufe>:<v>:<teil>)"),
    ab("nw.gruppe", "S3 wiese-gestalten — keine Sammel-Gruppe der Nah-Wiese, die Senke hängt in der Szene"),
    ab("__strauchZeile", "Welle 6 — die Holz-Zeile ist die Stufe selbst (stufenRezept, emitTree)", ["worlds/terrain/phytogenesis.js", "foundry-bruecke.js"]),
    ab("[4000, 1500, 1400]", "Welle 6 — der Strauch hat kein Rezept 0 (die Klingen-Krone)"),
    ab("_chunkSatzLeert", "W7 — _chunkSatzVerdichten (der leere Satz ist der Fall Inhalt 0)"),
    ab("s.leerSeit", "W7 — s.ueberSeit (die Frist zählt ab dem Überschreiten der Schwelle, für jeden Satz)"),
    ab("this._senkeMesh(a, 64, this.state.scene)", "W7 — die Nah-Streu-Senke zeichnet nie selbst (_streuSatzArt)"),
    ab("positionGeometry.y.mul(wiegen)", "W7 — die Höhe der wiegenden Nah-Streu ist aWiege (_satzBlock)"),
    ab('"|wiegt:"', "W7 — EIN wiegender Stoff je Regler, nie je Studio-Skala (|wiegt)"),
    ab("kartenSicht", "W7-Vereinigung — die Karten sind eine Gruppe der Instanz-Wahl (_instanzWahlPass)"),
    ab("_sichtKugel", "W7-Vereinigung — das EINE Gesetz der Pass-Wahl (_passTrifft)"),
    ab("_instanzKapselTrifft", "W7-Vereinigung — die Licht-Kapsel gilt jedem Leser (_passTrifft)"),
    ab("_instanzWahlLage", "W7-Vereinigung — EINE Lage je Pass für jeden Leser (_passWahlLage)"),
    ab("INSTANZ_WAHL", "W7-Vereinigung — die Konstanten des Gesetzes (PASS_WAHL)"),
    ab("SICHT_RAND", "W7-Vereinigung — der Rand ist ein Teil des Gesetzes (PASS_WAHL.sichtRand)"),
    ab("_hoehlenVerdeckt", "Welle 7 — die Horizont-Sperre (_hoehlenSperre) und der Weg hinaus"),
    ab("tor.verdeckt", "Welle 7 — die Mündung trägt ihre Sperre (tor.sperre)"),
    ab("_hoehlenAugeGleich(tor,", "W7-Vereinigung — die Sperre gilt je Auge UND je Boden (H.boden)"),
    ab("lib/stoff-linse", "Welle G — EINE Shader-Kosten-Linse (scripts/lib/shader-kosten.cjs)", ["scripts/werkbank.cjs", "scripts/playtest.cjs", "scripts/diag-post-kette.cjs"]),
    ab("__stoffProgramm", "Welle G — das Programm eines Stoffs liest der Frame-Zensus (__shaderKosten, stoffe)", ["scripts/werkbank.cjs", "scripts/playtest.cjs"]),
    ab('cmd === "stoff"', "Welle G — `werkbank shader --stoff`", ["scripts/werkbank.cjs"]),
    ab('req.url === "/stoff"', "Welle G — der Weg /shader", ["scripts/werkbank.cjs"]),
    ab("feldPassBlick", "Welle G — feldMarch (EIN Satz je Stellvertreter) und feldPanorama (früher Tiefentest)"),
    ab("_weltSeitenOrdnen", "Welle G — die Stellvertreter brauchen keine räumliche Ordnung"),
    ab("_nebelMaterialFor", "D8 — der Portal-Nebel-Kasten (die Öffnung ist Ziel + Film)"),
    ab("_nebelGraph", "D8 — der Volumen-March des Portal-Nebels"),
    ab("rec.nebel", "D8 — die Membran trägt keinen Nebel-Kasten mehr"),
    ab("portal-nebel", "D8 — die Klasse des Nebel-Kastens", ["spec/profiband/haushalt.json"]),
    ab("NEBEL_GESETZ", "D8 — das Nebel-Gesetz (fogDefault · actBase · actOpen)", ["porta-core.js", "worlds/portale/porta.js"]),
    ab("nebelAct", "D8 — der Atem des Nebels", ["porta-core.js", "worlds/portale/porta.js"]),
    ab("NEBEL_VIS", "D8 — das duale Nebel-Gefühl (glsl-box/tsl-box)", ["porta-core.js"]),
    ab("buildFog", "D8 — der Nebel des Labors", ["worlds/portale/porta.js"]),
    ab("['fog',", "D8 — der Regler fog (Bodennebel) der Tore", ["porta-core.js", "worlds/portale/porta.js"]),
    ab("MG.march", "D8 — der 12-Schritt-March der Membran (MEMBRAN_GESETZ.film)", ["worlds/portale/porta.js"]),
    ab("_torPanorama", "D8 — das Host-Panorama der eigenen Welt (Spike); das Ziel kommt aus der Ziel-Welt"),
    ab("_torPanoMal", "D8 — die Würfel-Würfe der Heimat (Spike); die Ziel-Welt rendert sich selbst"),
    ab("_torPanoKamera", "D8 — die sechs Kameras des Host-Panoramas (Spike)"),
    ab("_torZielRahmen", "D8-n1 — der verborgene Rahmen der Ziel-Welt im Spiel; das Studio backt, die Heimat liest"),
    ab("_torZielStempel", "D8-n1 — der Stempel je Boot (jede Quelle geholt und gehasht); H5 hält ihn an den Quellen"),
    ab("_torZielPlatte", "D8-n1 — die IndexedDB der Ziele; die gebackene Datei ist die Platte"),
    ab("_torZielReihe", "D8-n1 — die Reihe der Welt-Aufträge im Spiel"),
    ab("anazhTorZiel", "D8-n1 — die IndexedDB der Ziele"),
    ab("_weltSeitenPflegen", "Welle G — die Hülle trägt jeder Eintrag selbst (Texel 0/1)"),
    ab("_weltSeitenFolge", "Welle G — der Tiefentest der Hardware wählt den nächsten Treffer"),
    ab("_weltSeiteDirty", "Welle G — die Seiten-Ebene fiel (auch der Aufruf der Fernwald-Linse)"),
    ab("welt-march-seiten", "Welle G — die Seiten-Textur fiel", ["spec/profiband/ratsche-wiese-radeon-ego.json"]),
    ab("welt-march-folge", "Welle G — die Folge-Textur fiel", ["spec/profiband/ratsche-wiese-radeon-ego.json"]),
    ab("smoke-labs", "Studio-Welle S1 — gate:portal-konformanz (die echte Heimat, die echte Form)", ["package.json"]),
    ab("_wsOvDebounce", "Studio-Hülle K41 — die Werkstatt entprellt im EINEN Generator (AnazhHuelle.regler, ruheMs)"),
    ab("function announceReady", "Studio-Hülle K41 — die ready meldet die EINE Brücke (AnazhHuelle.bruecke mit manifest)", ["worlds/skeleton/skeleton.js", "worlds/fluid/fluid.js"]),
    ab("sliderEls", "Studio-Hülle K41 — die Schieber hält der Generator (regler.eingabe / regler.sync)", ["worlds/garage/garage.js", "worlds/schmiede/schmiede.js"]),
    ab("slMap", "Studio-Hülle K41 — params schreibt der Generator, kein Id-Spiegel", ["worlds/koerperstudio/koerperstudio.js"]),
    ab("seedInput", "Studio-Hülle K41 — der Same lebt in der Sitzung (sitz.seedSetzen)", ["worlds/klang/klang.js"]),
    ab("_sichtSteht", "Welle C — EIN Gesetz der Lage je Pass (_passLageGen, L.gen)"),
    ab("_hausTuerBlockerParts", "Welle L — die Haus-Hülle der Stufe (_hausBlockerBoxen, OBB)"),
    ab("_slopeProbeV", "Welle L — vier Proben im Leib-Rahmen (_slopeProben, _standSicht)"),
    ab("_slopeProbeH", "Welle L — vier Proben im Leib-Rahmen (_slopeProben, _standSicht)"),
    ab("_siedlungGesetzMemo || AnazhRealm.AUTO_SETTLEMENT", "Welle L — kein Siedlungs-Zwilling (fachwerk SIEDLUNG)"),
    ab("_settlementCount", "Welle L — der Bau-Same je Art (_bauSame)"),
    ab("_bauSameZaehler", "Gegenprüfung 08.10. — der Zähler des Welt-Stroms reist in worldMeta.bauSame"),
    ab("_windBoeAt", "wetter.K5 — der EINE Wind am Ort (_windAt)"),
    ab("_worldWindDirAt", "wetter.K5 — der EINE Wind am Ort (_windAt)"),
    ab("Math.imul(seedNum, 131)", "Gegenprüfung 08.10. — EIN Same je Werk (_werkSame), vier Kopien fielen"),
    ab("kontaktVorher", "D5 — der Kontakt reist im Empfänger zurück (_wandKontaktSetzen)"),
    ab('creature.rotation.order !== "YXZ"', "D5 — die Gier-Ordnung YXZ an EINER Stelle (spawnCreatureAt)"),
    ab("_fahrVLongPrev", "Welle L Q13 — die Längs-Beschleunigung ist die Reifen-Kraft des Kerns (z.aLong)"),
    ab("_ridePitchV", "Welle L Q13 — die Nick-Feder lebt im Fahr-Zustand des Kerns (fNickV)"),
    ab("_rideKurvenRollV", "Welle L Q13 — die Wank-Feder lebt im Fahr-Zustand des Kerns (fWankV)"),
    ab("_rideHeaveV", "Welle L Q13 — die Hub-Feder lebt im Fahr-Zustand des Kerns (fHubV)"),
    ab("_rideYawPrev", "Welle L Q13 — die Quer-Beschleunigung ist die Reifen-Kraft des Kerns (z.aLat)"),
    ab("Spring.prototype.step", "Welle L Q13 — die Probefahrt-Feder ist fahrFeder im Kern", ["worlds/garage/garage.js"]),
    ab("zoneMulAt", "Welle L Q8 — die Zone trägt das Urteil (ARENA.zonen, tetrapoda trefferZone)"),
    ab("zoneKindAt", "Welle L Q8"),
    ab("zoneJuiceAt", "Welle L Q8 — der Hit-Stop liest die Energie des Urteils"),
    ab("handlingMul", "Welle L Q8 — ein Phantom-Leser (0 Definitionen)"),
    ab("handlingWindF", "Welle L Q8 — die Ausholzeit ist der Anteil der EINEN Dauer ∝ √I"),
    ab("_heldSchmiedeFaktor", "Welle L Q8 — die Wirkung des Urteils (_trefferWirkung) statt der Klemme"),
    ab("kapselRK", "Welle L Q8 — die Säule fiel, getroffen wird die Gestalt (_kreaturGliedTreffer)"),
    ab("kapselY0", "Welle L Q8"),
    ab("kapselY1", "Welle L Q8"),
    ab("kapselRMin", "Welle L Q8"),
    ab("mEffDmgMin", "Welle L Q8 — keine Schadens-Klemme"),
    ab("mEffDmgMax", "Welle L Q8"),
    ab("mEffRefKg", "Welle L Q8 — die Wirkung ist Energie gegen keRefJ"),
    ab("zugJouleRef", "Welle L Q8 — E = ableitenBogen(task).energie (die Studio-Energie)"),
    ab("aFlex", "K19 — der Wind liest die Gestalt (`_baumWindStoff`)", ["phyto-core.js"]),
    ab("aPhase", "K19 — der Wind liest die Gestalt (`_baumWindStoff`)", ["phyto-core.js"]),
    ab("_mergeAttributedGeometries", "K19 — ohne Wind-Attribute ein Zwilling von `_mergeGeometries`"),
    ab("useFlexAttr", "K19 — der Pflanzen-Stoff heißt `pflanzenStoff` (er liest kein aFlex)"),
    ab("Math.max(0.3, c.scale.x", "Integration L — das Grob-Tor liest den Leib (_trefferErreichbar)"),
    ab("Math.max(0.3, cr.scale.x", "Integration L — das Grob-Tor liest den Leib (_trefferErreichbar)"),
    ab("o.userData && o.userData.gattung", "Integration L — EINE Gattungs-Quelle (_kreaturGattung)"),
    ab("creature.userData.gattung", "Integration L — EINE Gattungs-Quelle (_kreaturGattung)"),
    ab("u.gattung || u.recipe", "Integration L — EINE Gattungs-Quelle (_kreaturGattung)"),
    ab("_genesisLichtung", "Integration L D3 — die Lichtung ist ein Grundriss der Natur-Wand (_grundrissVon)"),
    ab("_forestKroneWelt", "Integration L D3 — die Krone eines Wurfs ist _naturKrone (jede Quelle)"),
    ab("compileAsync", "Welle K — die Erst-Zeichnung (kein Kompilat neben dem Render)"),
    ab("_warmCompilePipeline", "Welle K — die Erst-Zeichnung"),
    ab("_bootWarmCompileScene", "Welle K — die Erst-Zeichnung"),
    ab("_kompiliere", "Welle K — die Erst-Zeichnung"),
    ab("_imKompilat", "Welle K — kein Kompilat, keine Wache"),
    ab("_pipeOfenMerke", "Welle K — die Erst-Zeichnung (der Warm-Ofen)"),
    ab("_pipeOfenTick", "Welle K — die Erst-Zeichnung (der Warm-Ofen)"),
    ab("_pipeOfenDone", "Welle K — die Erst-Zeichnung (der Warm-Ofen)"),
    ab("_bundleReifeWache", "Welle K — die Erst-Zeichnung nimmt das Bundle neu auf, wenn die Pipeline steht"),
    ab("_foundryWarmedMats", "Welle K — die Erst-Zeichnung"),
    ab("_erstPipeline", "Welle K — die Bereitschaft liest den Zustand (_erstWartet), nie das Versprechen"),
    ab("_erstNeuAufnehmen", "Welle K — EINE Warteschlange (_erstWartet ohne Pipeline)"),
    ab("_menschFern", "S3 kreatur — die Gelenk-Gestalt (_gelenk) und der EINE Schalter _gelenkStufe"),
    ab("wrap3", "S3 kreatur — beide Stufen unter EINEM Wrap (_gelenkGestalt)"),
    ab("TIER_FERN_DIST_SQ", "S3 kreatur — die Grenze ist lod.budget.kreatur[1].ab (_gelenk.abM)"),
    ab("TIER_FERN_HYST", "S3 kreatur — die Hysterese ist lod.budget.kreatur.hyst (_gelenk.hyst)"),
    ab("MENSCH_FERN_DIST_SQ", "S3 kreatur — die Grenze ist lod.budget.koerper[1].ab (_gelenk.abM)"),
    ab("_tierFernFolgt", "V18.538 — EIN Skelett: die Grobstufe trägt die Knochen der feinen (_gelenkGestalt)"),
    ab("fernStarr", "V18.538 — der Gelenk-Guss bindet die Grobstufe für Tier UND Mensch (S3), kein Tier-Sonderweg", ["foundry-core.js"]),
    ab("__wurf", "S3 — der Schatten-Teil (teil schatten) trägt den Wurf, kein Index-Vorsatz", ["foundry-core.js", "worlds/terrain/phytogenesis.js", "foundry-bruecke.js"]),
    ab("lf.wurf", "S3 — der Schatten-Teil ist selbst der Zwilling (_foundryFlattenFor)"),
    ab("wurfe", "S3 — das Verschmelzen legt keinen Wurf-Vorsatz mehr nach vorn (_geoVerbinden)"),
    ab("_wurfDreiecke", "S3 — der Wurf-Vorsatz der L1-Rinde", ["foundry-core.js"]),
    ab("barkFein", "S3 — die Rinde der L1 ist EIN Teil, der Wurf ein eigenes", ["foundry-core.js"]),
    ab("nadelKarte", "S3 — der Nadel-Ast ist sein Wedel (tree[Stufe].wedel)", ["foundry-core.js"]),
    ab("BLATT_ATLAS_NADEL", "S3 — Zelle 3 ist die Wedel-Zelle (BLATT_ATLAS_WEDEL)", ["foundry-core.js", "phyto-core.js"]),
    ab("NADEL_ZWEIG", "S3 — der Maler der Zelle 3 malt den Wedel (WEDEL_ZWEIG)", ["phyto-core.js"]),
    ab("_tiefenLeserNeuBinden", "0910-3 A — die Diät (6) trägt jeden Größenwechsel, kein Neubau im resize-Handler"),
    ab("_archFachwerkFit", "S3 haus — die Fernform ist die Hülle des Gesetzbuchs (_huelleVon → _archFoundryZiegel)"),
    ab("prismFlip", "S3 haus — der Keil trägt seinen Typ (HUELLE_KEIL_TYP: First ±x/±z, Walm)"),
    ab("diag-arch-fachwerk-fit", "S3 haus — die Linse des Wirts-Fits; der Fernkörper misst gate:haus-fern", ["package.json", ".github/workflows/check.yml"]),
    ab("_kreaturBodenUnter", "Leben-Schau 2 — jeder Körper liest seinen Boden über _koerperBodenUnter"),
    ab("_fahrTerrainBoden", "Leben-Schau 2 — die Ebene des Werks liest _werkBoden (den Boden unter ihm)"),
    ab("_baumWeltSkala", "Leben-Schau 2 — _studioWeltSkala trägt die Welt-Skala jedes Studio-Werks"),
    ab("STUDIO_WORLD_SCALE", "Leben-Schau 2 — die Welt-Skala liest der Kern (__terrainCore.PORTAL_RENDER_CONFIG)"),
    ab("STUDIO_TREE_SCALE_MUL", "Leben-Schau 2 — der Wald-Mul liest der Kern (placement.treeScaleMul)"),
    ab("_baumHuellenNachBuch", "Leben-Schau 2 — die Stamm-Hülle misst ab dem Spawn in der Welt-Skala"),
    ab("_torHuelleGemessen", "Leben-Schau 2 — der Wirt liest TOR_HUELLE, er baut kein Tor nach"),
    ab("_isAboveWaterAt", "Schau-2 — die Zwillings-Probe des Lands (jedes Werk fragt `_landAt`)"),
    ab("wasser.schuett", "Schau-2 — die zweite Wagen-Masse des Wasser-Terms", ["vehicle-core.js"]),
    ab("_wasserVerdraengt", "Schau-2 — das Merk-Feld des Damms (der Zell-Stempel fragt seine Zellen)"),
    ab("_stempelImWasser", "Schau-2 — die Weck-Frage am Gesetz samt Rand (die Zellen antworten am Stempel)"),
    ...[
        ["_wildnisY", "wildnisY"],
        ["_erbgutTermY", "termY"],
        ["_macroSurfaceContribution", "ankerBeitrag"],
        ["_ridgeAnkerNoise", "grat"],
        ["_macroRidgeNoise", "gratRauschen (der Strom folgt der Saat)"],
        ["_makeMacroAnker", "ankerAusSaat"],
        ["_erosionDeltaAt", "erosionDelta"],
        ["_erosionFor", "erosionFuer"],
        ["_tarnDeltaAt", "tarnDelta (fiel mit dem Tarn-Pass, K16)"],
        ["_hydroTileKeyFor", "kachelSchluessel"],
        ["MACRO_ANKER_", "MACRO_ANKER (die Literal-Zwillinge des Workers)"],
        ["function terrainMacroSurfaceY(", "hoehe (der Worker-Spiegel)"],
        ["function erbgutTermY(", "termY (der Worker-Spiegel)"],
        ["function macroAnker(", "die Lage reicht macroAnker (der Worker-Spiegel)"],
    ].map(([token, kern]) => ({ token, fiel: `K09a — gelaende-core ${kern}` })),
    ...[
        ["_computeErosion", "die Kachel-Erosion (36 Iterationen, ±26 m, Naht)"],
        ["_erosionIncisionPass", "der Inzisions-Pass der Erosion"],
        ["_thermalErosionPass", "der Talus-Pass der Erosion"],
        ["_worldgenComputeErosionAndTarns", "die Erosion im Worldgen (`_worldgenTarns`)"],
        ["_isValidMacroAnker", "die Anker-Wand (der Anker fiel)"],
        ["_macroSpillpointAnalysis", "die Überlauf-Analyse des Ankers (der Anker fiel)"],
        ["_hydroSeedTarns", "der Tarn-Pass (die Seen sind die Senken des Flussnetzes)"],
        ["_worldgenTarns", "der Tarn-Pass im Worldgen"],
        ["tarnMulde", "die Mulden-Form des Tarns"],
        ["tarnDelta", "die Tarn-Senkung des Wildnis-Terms"],
        ["state.tarns", "die Tarn-Liste im Zustand"],
        ["SCHNEE_PROMINENZ", "die Schnee-Prominenz (die Schneegrenze `schnee` wohnt im Gesetzbuch)"],
        ["SNOW_PROM_", "der Worker-Spiegel der Schnee-Prominenz"],
        ["kontinentBasis", "die Prominenz-Basis der Schneegrenze"],
        ["__feldWgsl", "der WGSL-Spiegel des alten Rausch-Gesetzes (der Feld-Zeichner liest den Kern)"],
    ].map(([token, kern]) => ({ token, fiel: `K16 — ${kern}` })),
    ...[
        ["_bodenFarbeUnterFels", "der Palette-Stein unter Fels (die Höhle trägt den Fels-Stoff, `_felsStoff`)"],
        ["rockTint", "der Fels-Tint des Shaders (der Vertex trägt den Fels-Stoff, die Ferne `FELS_STOFF.mittel`)"],
        ["rockLumMix", "die Säulen-Luminanz auf dem Fels"],
        ["_shadeRock", "die Hex-Abschattung des Werkstatt-Steins (die Töne leitet `felsBasis` ab)"],
        [
            "_himmelsSicht",
            "die Himmels-Sicht im Stamm (K17-2: gelaende-core `himmelsSicht`, der Worker baut sie beim Chunk-Bau)",
        ],
        ["AnazhRealm.HIMMELS_SICHT", "die Länge der Himmels-Sicht im Stamm (gelaende-core `HIMMELS_SICHT`)"],
    ].map(([token, kern]) => ({ token, fiel: `K17 — ${kern}` })),
    ab("_augenLichtKlasse", "K15 — die Licht-Klasse des Auges (der Boden-Stoff trägt den Term)"),
    ab("_augenLichtRegistrieren", "K15 — der eigene Licht-Knoten in der r184-Bibliothek"),
    ab("AugenLichtNode", "K15 — der Punkt-Licht-Knoten hinter TSL.If"),
    ab("_AugenLicht", "K15 — die Licht-Klasse des Auges"),
    ab("state.augenLicht", "K15 — das Szenen-Licht des Auges (die Uniform `atmoUniforms.augenLicht`)"),
    ab("_anazhAtlasTexe", "V18.542 — die Erklärung der Atlanten an die Diät: der Textur-Wächter (`_diaetVorTextur`) sieht jede Textur des Programms"),
    ab("atmoUniforms.augenLicht", "K11 — die eigene Uniform des Lichts des Auges (ein Platz des Licht-Pools)"),
    ab("augenLicht: TSL.uniform", "K11 — die eigene Uniform des Lichts des Auges (ein Platz des Licht-Pools)"),
    ab("_umweltGlutSweep", "K11 — der Glut-Umlauf des Klangs (das Verzeichnis „glut“)"),
    ab("bautenJeFrame", "K11 — der Glut-Umlauf des Klangs (das Verzeichnis „glut“)"),
    ab("this._portalLicht ", "K11 — das Szenen-Licht des Tors (ein Bürger des Licht-Pools)"),
    ab("new THREE.PointLight(", "K11 — jedes Punktlicht ist ein Platz des Licht-Pools (`_lichtPoolTerm`)"),
    ab("_chunkSurfaceAt", "K21 — der EINE Boden-Leser `_bodenSichtAt`"),
    ab("_chunkGruenAt", "K21 — `_bodenSichtAt(x, z, aus)` trägt den Grün-Kanal der gewinnenden Karte"),
    ab("_chunkKarteAt", "K21 — der EINE Boden-Leser `_bodenSichtAt`"),
    ab("_prefetching", "K30-N1 — `f._vorrat` nennt die Phase des Vorrats (`VORRAT_PHASE`)", [
            "scripts/playtest.cjs",
            "scripts/diag-ankunft.cjs",
            "scripts/diag-boot-stage.cjs",
            "scripts/diag-fluss.cjs",
            "scripts/diag-p2p-gestalt.cjs",
            "scripts/diag-praegung-welt.cjs",
            "scripts/diag-regler-wirkt.cjs",
            "scripts/diag-reload-treue.cjs",
            "scripts/diag-studio-uebergabe.cjs",
            "scripts/lib/pack-kanon.cjs",
            "scripts/mint-asset-packs.cjs",
        ]),
    ab("_impostorBakePending", "K60-2 — je Bäcker-Bahn eine Karte im Flug (`_impostorBakeFlug`)"),
    ab("gpuScatter", "G1 — der Schalter hieß GPU und schaltete die CPU-Streu ab; die Streu hat keinen Schalter"),
    ab("uSeite", "18.10. — das Panorama faltet EINE CPU-Faltung je Engine, die GLSL-Faltung fiel", ["worlds/huelle/huelle.js"]),
    // F6 — das additive Licht-Band der Host-Stoffe (Rim, Nacht-Boden, Mond-Rim, der sonnen-blinde Gegenlicht-Glow) leuchtete aus
    // sich selbst, am streifenden Blick der Ferne am stärksten (Karte der Fichte in der Dämmerung 8,3 ×, nachts 4,8 × ihre
    // Gestalt); das Licht ist die EINE Licht-Kette (Lehre 21)
    ...["rimStrength", "NightFloor", "nightFloor", "MoonRim", "moonRim", "responseProfile.detail"].map((t) => ab(t, "F6 — kein Stoff leuchtet ohne Licht", ["scripts/playtest.cjs"])),
];

// Die Wald-Nischen-Tafel des Gesetzbuchs (phyto-core FOREST_SPECIES): der Mammut des Labors ist in der Welt
// baum_mammut — nie mehr die Buche (die Buche ist eine eigene Studio-Art).
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

// Kommentare strippen, Strings BEWAHREN (die diag-source-probes-Methode:
// zeichenweise, string-bewusst — ein naiver Regex frisst echten Code).
const stripComments = stammLib.ohneKommentare;
const { kinder } = stammLib;

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
    const richter = (a) => (a !== "scripts/playtest.cjs" ? [a] : [a, ...fs.readdirSync(path.join(root, "scripts/playtest")).map((f) => "scripts/playtest/" + f)]);
    for (const z of FORBIDDEN) for (const a of (z.auch || []).flatMap(richter)) pruefe(path.join(root, a), [z]);
    return errs;
}

// Die Stamm-Dateien, wie index.html sie lädt (scripts/lib/stamm.cjs — die EINE Liste; vor dem Schnitt die eine Datei).
const STAMM = stammLib.dateien(path.join(__dirname, ".."));
// das Gesetzbuch der Himmels-Sicht: die Stamm-Datei, die den Wandel-Pass `_atmoLutBau` trägt (am Glied, nie am Datei-Namen)
const HIMMEL_BUCH = stammLib.dateiVon(path.join(__dirname, ".."), "_atmoLutBau");
const WORT_BUCH = stammLib.dateiVon(path.join(__dirname, ".."), "_schreibWorte");

// ULTRAGUSS U2 — DIE ZWILLINGS-WAND: getötete Formel-Zwillinge dürfen nicht
// nachwachsen. Je Zeile: der Formel-Fingerabdruck darf NUR im Gesetzbuch leben.
// ein Zwilling: sein Fingerabdruck, das Gesetzbuch, in dem allein er wohnt, wo er verboten ist, was ihn trug (`fiel`)
const zw = (fingerprint, gesetzbuch, verboten, fiel) => ({ fingerprint, gesetzbuch, verboten, fiel });
const ZWILLINGE = [
    zw("conif = clamp((api - 0.62)", "phyto-core.js", ["foundry-core.js"], "U2 — der Phänotyp-Zwilling (foundry-core delegiert an treePhenotype)"),
    zw("leafSize: lerp(0.22, 0.6, leaf)", "phyto-core.js", ["foundry-core.js", ...STAMM], "K24 — der P-Zwilling (deriveParamsPlant delegiert seinen Baum-Zweig an treeParams)"),
    zw("ridges: 14, depth: 0.52", "phyto-core.js", ["foundry-core.js", ...STAMM], "U2b (V18.467) — das Rinden-Gesetz (barkProfile/buildTubeGesetz) wohnt im Pflanzen-Gesetzbuch, foundry-core delegiert"),
    zw("Math.pow(size / 2.4, 0.67)", "tetrapoda-core.js", ["worlds/tetrapoda/tetrapoda.js", ...STAMM], "U4 — die Tier-Allometrie wohnt im Gesetzbuch (deriveTierParams)"),
    zw("Math.sin(phases[j] - phases[i] - (folge[j] - folge[i]))", "tetrapoda-core.js", ["worlds/tetrapoda/tetrapoda.js", ...STAMM], "U4 — der CPG-Phasen-Schritt wohnt im Gesetzbuch (cpgStep)"),
    zw("0.818 * H", "koerper-core.js", ["worlds/koerperstudio/koerperstudio.js", ...STAMM], "U3 — die 6-KH-Loomis-Proportionen wohnen im Gesetzbuch (labProportionen)"),
    zw("(0.62 + p.tone * 0.53) * (1 - p.age * 0.35)", "koerper-core.js", ["worlds/koerperstudio/koerperstudio.js", ...STAMM], "U3 — die morph()-Dial-Mathe wohnt im Gesetzbuch (labMorph)"),
    zw("reg('glute'+(sd===1?'1':'-1')", "koerper-core.js", ["worlds/koerperstudio/koerperstudio.js", ...STAMM], "KONVERGENZ — der Da-Vinci-Teile-Baum (bauMensch) wohnt NUR im Gesetzbuch; Shell + Stamm bauen per Fabrik-Haken (kein Nachbau, nie wieder)"),
    zw("iris: Object.freeze({ c: 0x2a4a6a", "koerper-core.js", ["worlds/koerperstudio/koerperstudio.js", ...STAMM], "KONVERGENZ II — die Material-Klassen-Farben wohnen im Gesetzbuch (MATERIAL_KLASSEN); Shell + Stamm LESEN"),
    // K57: der Ton nach KOPF_SOLL hautAlbedo (vorher 0x5f3826)
    zw("mahagoni:{hex:0x6a4230", "koerper-core.js", ["worlds/koerperstudio/koerperstudio.js", ...STAMM], "KONVERGENZ II — die Haut-/Haar-Paletten wohnen im Gesetzbuch (SKIN_TONES/HAIR_COLORS); der Genom-Roller pickt aus der Lab-Wahrheit"),
    zw("wristFrac: 1.36", "koerper-core.js", ["worlds/koerperstudio/koerperstudio.js", ...STAMM], "U3 — das Landmarken-Urteil wohnt im Gesetzbuch (labLandmarks)"),
    zw("Math.abs(lz)>Math.min(Di,Dj)*0.45", "fachwerk-core.js", ["worlds/fachwerk/fachwerk.js", ...STAMM], "U6c — das REIHEN-SNAP-Gesetz wohnt im Gesetzbuch (reihenSnap)"),
    zw("A.p.brandwand[lx>0?'x1':'x0']=1", "fachwerk-core.js", ["worlds/fachwerk/fachwerk.js", ...STAMM], "U6c — das BRANDWAND-Gesetz wohnt im Gesetzbuch (brandwand)"),
    zw("jahr<1150?'romanik'", "fachwerk-core.js", ["worlds/fachwerk/fachwerk.js", ...STAMM], "U6c — das META-Gesetz (Jahr×Klima×Personen×Wohlstand → Form) wohnt im Gesetzbuch (metaParams)"),
    zw("_SNED=[[0,1],[2,3],[4,5],[6,7]", "koerper-core.js", ["worlds/koerperstudio/koerperstudio.js", ...STAMM, "foundry-core.js"], "V18.463 — die Hüllen-Maschine (Voxel-Ops + Surface-Nets) wohnt im Gesetzbuch; Shell UND Bäcker LESEN"),
    zw("burgundy:{hex:0x5a2530", "koerper-core.js", ["worlds/koerperstudio/koerperstudio.js", ...STAMM], "V18.461 — die Stoff-Palette wohnt im Gesetzbuch (CLOTH_COLORS); die Kleid-Zonen (kleidZonen) und die Haar-Streu (haarStreu) sind Kern-Gesetz, beide Leser LESEN"),
    zw("(1 - tipFrac) * Math.pow(t, 1.3)", "schmiede-core.js", [...STAMM], "U6d — die distale Klingen-Verjüngung (bladeProfile) wohnt im Gesetzbuch (klingenProfil)"),
    zw("Math.pow(w / 0.4, 2)", "schmiede-core.js", [...STAMM], "U6d — die Hohlkehle des Wirts-Schnitts (bladeProfile) wohnt im Gesetzbuch (klingenProfil)"),
    zw("bladeLen: 1.45", "schmiede-core.js", [...STAMM], "U6d — die Oakeshott-Proportions-Tabelle wohnt im Gesetzbuch (OAKESHOTT_TYPES, Stamm = Getter-Delegat)"),
    // K09a — DAS GELÄNDE HAT SEIN GESETZBUCH: die Makro-Höhe (Wildnis-Term, Erbgut-Terme samt Normalform,
    // Makro-Anker samt Grat-Strom und Massiv-Maske, Erosions- und Tarn-Delta samt Mulden-Form, die Rauheits-Maske, die
    // kontinentale Basis der Schnee-Prominenz) lebt in gelaende-core.js; Stamm, voxel-worker und jede Linse RUFEN sie.
    // Die Abdrücke sind MUSTER, nie ein Variablen-Name: die Prüfung 1 fand `(x + _wpX) * 0.00014 + 7.2` in beiden Farb-
    // Pfaden am engen Abdruck `wx * 0.00014 + 7.2` vorbei. Verboten in jeder Wurzel-Datei und jedem Skript
    // (`gelaendeLeser`); der WGSL-Seh-Spiegel fiel (K16, der Feld-Zeichner liest den Kern), das Terrain-Studio liest ihn mit G2.
    ...[
        [/\*\s*0\.00026\s*\+\s*(?:11\.3|41\.7)\b/, "der Domain-Warp des Wildnis-Terms"],
        [/255\s*\+\s*12\s*\*\s*Math\.tanh\(/, "der Sicherheits-Deckel der Makro-Höhe"],
        // K16 — DIE LANDFORM: die Großform-Felder (Kontinentalität C, Erosion E, Stil), die Spline-Stützpunkte von OFFSET
        // und RELIEF, die drei Ebenen des Flussnetzes und die Querneigung der Aue wohnen im Gesetzbuch.
        [/\+\s*7\.2\s*,[^,;]*?\+\s*3\.8\b/, "die Kontinentalität C der Großform"],
        [/\+\s*33\.1\s*,[^,;]*?\+\s*71\.7\b/, "das Erosions-Feld E der Großform"],
        [/\*\s*0\.000192\s*\+\s*91\.3\b/, "das Stil-Feld (Tafelland) der Großform"],
        [/\[\s*-0\.55\s*,\s*(?:-26|140)\s*\]/, "die Spline-Stützpunkte OFFSET/RELIEF"],
        [/\[\s*1600\s*,\s*400\s*,\s*100\s*\]/, "die drei Ebenen des Flussnetzes"],
        [/\bAUE_QUER\s*=/, "die Querneigung der Aue"],
        [/kuppel\s*\*\s*\(/, "der Insel-Term des Erbguts"],
        [/\btan[UFWB]\s*:/, "die Normalform des Erbguts (`erbgutNormal`)"],
        // K16b — DIE MESSUNG (`MESSUNG`, `abdruckFeld`, `messStatistik`, `schichtSchritte`): das Raster der Statistik, der
        // Makro-Abdruck und der Schicht-Ort wohnen im Gesetzbuch — die Zahl-Leiste des Studios und die Gelände-Wände RUFEN
        // sie (die Prüfung K16b fand das Schicht-Verfahren als Zwilling in makro-worker und diag-worker-dichte, das Raster
        // in studio.js).
        [
            /Math\.round\(\s*2000\s*\/|\b4010\b|\b268\s*\*\s*30\b|\bn:\s*268\b/,
            "das Mess-Raster der Statistik (MESSUNG.raster)",
        ],
        [/\b852\s*(?:\+|,)\s*(?:\w+\s*\*\s*27|schritt:\s*27)\b/, "der Makro-Abdruck (MESSUNG.abdruck, abdruckFeld)"],
        [
            /\bstil\s*(?:>=|:)\s*0\.8\b|\b8000\s*,\s*8000\b|\bumkreis:\s*8000\b/,
            "der Schicht-Ort der Messung (MESSUNG.schicht, schichtSchritte)",
        ],
    ].map(([muster, was]) => ({
        muster,
        gesetzbuch: "gelaende-core.js",
        verboten: gelaendeLeser(),
        fiel: `K09a — Heimat im Gelände-Gesetzbuch: ${was}`,
    })),
    // K16 — GEFALLEN: die Landform ersetzt die Rausch-Masken, den Ein-Massiv-Anker samt Grat-Strom und Abfall-Profilen,
    // Canyon und Tafelberg als Maske und die Rauheits-Maske. Sie haben kein Zuhause mehr — auch das Gesetzbuch nie wieder.
    ...[
        [/\*\s*0\.00014\s*\+\s*7\.2\b/, "die alte kontinentale Basis (λ 7100 m)"],
        [
            /\*\s*0\.000(?:19\s*\+\s*33\.1|22\s*\+\s*91\.3|35\s*\+\s*19\.3|28\s*\+\s*19\.3)\b/,
            "die Relief-, Stil- und Hochland-Masken des Rausch-Gesetzes",
        ],
        [
            /\*\s*0\.000(?:3\s*\+\s*61\.1|34\s*\+\s*13\.7)\b|\*\s*0\.00105\s*\+\s*8\.3\b/,
            "Canyon und Tafelberg als Maske",
        ],
        // Die Canyon-Maske der Höhlen-Decke (λ 154 m): sie hob die Decke 8 m über den Boden, die Höhle brach als Grube
        // ohne Abfluss durch — am gebauten Boden 15,2 → 4,2 Senken > 1 m je km² (die Täler sind das Flussnetz).
        [/\*\s*0\.0065\s*\+\s*41\.7\b/, "die Canyon-Maske der Höhlen-Decke"],
        [/["'`]-macro-ridge["'`]/, "den Grat-Strom des Makro-Ankers"],
        [/["'`]-macro-anker["'`]/, "den Samen-Strom des Makro-Ankers"],
        [/0\.7071\s*\*\s*1\.65\b/, "die Grat-Domäne des Makro-Ankers"],
        [/\/\s*[\w.]*massivAspect\b/, "die Massiv-Maske des Makro-Ankers"],
        [
            /\/\s*\(?\s*[\w.]*\b(?:massivR|beckenR|talBreite|talTrenchBreite)\b/,
            "die Abfall-Profile des Makro-Ankers (Massiv, Becken, Tal)",
        ],
        [/noise2D\(\s*[\w.]+\s*\*\s*0\.0005\s*,/, "die Rauheits-Maske"],
        [
            /Math\.exp\(\s*-\s*[\w.]+\s*\/\s*[\w.]*twoSig2\b|\btwoSig2\s*:/,
            "die Tarn-Mulde (die Seen sind die Senken des Netzes)",
        ],
    ].map(([muster, was]) => ({
        muster,
        gefallen: true,
        verboten: gelaendeLeser().concat(["gelaende-core.js"]),
        fiel: `K16 — die Landform ersetzt ${was}`,
    })),
    // W1 (Grok-Zwilling G3-4): die Wiese hat EIN Gesetz für Labor und Welt — Labor und Stamm rufen es im Kern.
    ...["L * 1.08 - rk * 0.85 + m * 0.22", "lit * 0.5 + (1 - wet) * 0.5"].map((fingerprint) => ({
        fingerprint,
        gesetzbuch: "foundry-core.js",
        verboten: ["worlds/terrain/phytogenesis.js", ...STAMM],
        fiel: "W1 — die Bodenschicht (groundCover) und der Wiesen-Tint (wiesenTint, bis W1 FIX v27 im Labor) wohnen im Kern",
    })),
    // D3 — DIE EINE ATMOSPHÄRE als MUSTER (Lehre 7: ein Zwillings-Abdruck ist ein Muster, nie ein Variablen-Name): die Luftmasse
    // als Kehrwert der Sonnenhöhe (die Luftmassen-Sonne, `1 / (max(e, 0) + 0,06)`) in keiner Datei, und eine Equirekt-Umgebung
    // nur im Wandel-Pass der Himmels-Sicht (`_atmoLutBau`, HIMMEL_BUCH) — jede andere ist eine gemalte Umgebung neben der EINEN.
    {
        muster: /1(?:\.0)?\s*\/\s*\(\s*Math\.max\(\s*[\w.]+\s*,\s*0(?:\.0)?\s*\)\s*\+\s*0\.\d+\s*\)/,
        gefallen: true,
        verboten: gelaendeLeser().concat(["gelaende-core.js"]),
        fiel: "D3 — die Sonne ist der Durchlass der EINEN Atmosphäre (ATMO_RECHNUNG.sonne), keine Luftmasse als Kehrwert der Höhe",
    },
    {
        muster: /\bEquirectangularReflectionMapping\b/,
        gesetzbuch: HIMMEL_BUCH,
        verboten: gelaendeLeser().filter((d) => d.replace(/\\/g, "/") !== HIMMEL_BUCH),
        fiel: "D3 — die Umgebung ist der Wandel-Pass der Himmels-Sicht (_atmoLutBau), keine gemalte Equirekt-Umgebung",
    },
    // Licht K3 — DAS LICHT DER WELT als MUSTER: kein Pass rechnet sein Lambert-Licht selbst (der Faktor 1/π im WGSL, die Neigung
    // gegen die Sonnenhöhe im TSL) — Feld-March und Panorama reichen Albedo und Normale an den EINEN Baustein (`_weltLicht`).
    {
        muster: /\b1\.0\s*\/\s*PI\b|0\.31830988|max\(\s*[\w.]+\.y\s*,\s*0\.2\s*\)/,
        gefallen: true,
        verboten: STAMM,
        fiel: "Licht K3 — Spiegel, Panorama, Feld-March und Wasser rufen den EINEN Baustein weltLicht (_weltLicht)",
    },
    // ein Array-Bereich geht EINMAL in die Queue (`einmal`: der erste Fund im Gesetzbuch ist das Gesetz)
    {
        muster: /\.writeBuffer\([^;]*\.byteOffset\s*\+/,
        gesetzbuch: WORT_BUCH,
        einmal: true,
        verboten: STAMM,
        fiel: "K-ICH-BÜHNE-PUFFER — die Arena rundete neben der EINEN Wort-Schrift (_schreibWorte)",
    },
];

// Die Leser des Gelände-Gesetzes, die es nie nachrechnen: jede JS-Datei der Wurzel außer dem Gesetzbuch und dem Seh-
// Spiegel, jedes Skript und jede Linse (eine Probe misst am Gesetz, nie an ihrer Kopie) und das Gelände-Studio
// (worlds/gelaende: das Panel und sein Makro-Worker). Diese Wand trägt die Muster selbst als Proben und steht nicht in
// der Liste.
function gelaendeLeser() {
    const root = path.join(__dirname, "..");
    // der Stamm aus der EINEN Liste (nach dem Schnitt liegt er unter stamm/, kein readdir der Wurzel sähe ihn)
    const wurzel = fs
        .readdirSync(root)
        .filter((f) => /\.(?:c|m)?js$/.test(f) && f !== "gelaende-core.js" && !stammLib.istStammDatei(f))
        .concat(STAMM);
    const skripte = (d) =>
        fs
            .readdirSync(path.join(root, d))
            .filter((f) => /\.(?:c|m)?js$/.test(f) && f !== "diag-altlasten.cjs")
            .map((f) => d + "/" + f);
    return wurzel.concat(skripte("scripts"), skripte("scripts/lib"), skripte("worlds/gelaende"));
}

// `ersatz` (Selbsttest): { datei: Text } liest statt der Platte. Ein Abdruck ist ein Text (`fingerprint`) oder ein
// Muster (`muster`, ohne g-Flag); der Fund nennt Datei, Zeile und Text. Roh-Vorfilter vor dem Kommentar-Abzug, je
// Datei EIN Lesen und EIN Abzug.
function scanZwillinge(ersatz = {}) {
    const root = path.join(__dirname, "..");
    const roh = new Map();
    const lies = (f) => {
        if (f in ersatz) return ersatz[f];
        if (!roh.has(f)) roh.set(f, fs.readFileSync(path.join(root, f), "utf8"));
        return roh.get(f);
    };
    const code = new Map();
    const ohneKommentar = (f) => {
        if (f in ersatz) return stripComments(ersatz[f]);
        if (!code.has(f)) code.set(f, stripComments(lies(f)));
        return code.get(f);
    };
    const finde = (z, text) => {
        if (z.muster) {
            const m = z.muster.exec(text);
            return m ? { at: m.index, was: m[0] } : null;
        }
        const at = text.indexOf(z.fingerprint);
        return at < 0 ? null : { at, was: z.fingerprint };
    };
    const errs = [];
    for (const z of ZWILLINGE) {
        const name = z.fingerprint ? `"${z.fingerprint}"` : String(z.muster);
        if (z.gefallen) {
            // kein Zuhause: der Term fiel ganz — die verbotenen Dateien schließen das Gesetzbuch ein
        } else if (!(z.gesetzbuch in ersatz) && !fs.existsSync(path.join(root, z.gesetzbuch)))
            errs.push(`Zwillings-Wand: das Gesetzbuch ${z.gesetzbuch} fehlt — ${name} hat kein Zuhause`);
        else if (!finde(z, lies(z.gesetzbuch)))
            errs.push(`Zwillings-Wand: Fingerabdruck ${name} fehlt im Gesetzbuch ${z.gesetzbuch}`);
        for (const f of z.verboten) {
            if (!finde(z, lies(f))) continue;
            const src = ohneKommentar(f);
            const ab = z.einmal && f === z.gesetzbuch ? (finde(z, src) || { at: src.length }).at + 1 : 0;
            const hit = finde(z, src.slice(ab));
            if (!hit) continue;
            const zeile = (i) => src.slice(0, i).split("\n").length;
            errs.push(`Zwillings-Wand: ${f}:${zeile(ab + hit.at)} trägt wieder „${hit.was}"${ab ? ` neben ${zeile(ab)}` : ""} (fiel: ${z.fiel})`);
        }
    }
    return errs;
}

// ULTRAGUSS U3 — DIE BUSTER-LINSE (Lehre 10 als Klasse): JEDER Lab-Kern-Script-
// Tag trägt die AKTUELLE Version — ein stale ?v= serviert den Studios altes
// Gesetz aus dem HTTP-Cache.
function scanLabBuster() {
    // die Wand deckt JEDEN Buster (Kern UND Shell UND Wurzel-Seite) —
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
    // AnazhRealm.VERSION driftete vier Wellen lang
    // (18.467 während package.json 18.471 trug) — jeder Flugschreiber-Trace + Panel-Kopf
    // log über die Version. DIESELBE Wand deckt jetzt die Runtime-Konstante: EIN Gesetz,
    // alle Versions-Träger == package.json.
    const stammSrc = stammLib.text(root);
    const vm = stammLib.treffer(stammSrc, null, /AnazhRealm\.VERSION = "([0-9.]+)"/);
    if (!vm) errs.push("AnazhRealm.VERSION nicht gefunden (die Versions-Wand braucht den Anker)");
    else if (vm[1] !== version)
        errs.push(
            `AnazhRealm.VERSION trägt stale "${vm[1]}" (package.json ${version}) — Trace/Panel lügen über die Version`
        );
    // DOKU=VERSION (Schöpfer-Karte §5.6 „Doku = Version"): der Stand-Kopf
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

// DIE INSTANZ-WAND: jede InstancedMesh der Welt entsteht im EINEN Chokepoint
// `AnazhRealm._instanzMesh` (Instanz-Matrix als Storage). Ein Bau daran vorbei trägt die Kapazität
// wieder als Uniform-Array-Länge in den Vertex-Shader — ein Programm + eine Pipeline je Kapazität
//. Erlaubt: genau EIN `new THREE.InstancedMesh(`
// (der Chokepoint selbst). Gezählt wird JEDER Bau, auch über einen Alias (`const T = THREE; new T.InstancedMesh(`):
// keine Schreibweise baut an der Wand vorbei.
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
    const k0 = stammLib.kopf(code, "_instanzMesh"); // am Namen (gate:apparat Klinge 3), gezählt ab `static`
    const kopf = k0 < 0 ? -1 : k0 + 5;
    if (kopf < 0 || code.indexOf("new THREE.InstancedMesh(", kopf) - kopf > 200)
        errs.push("Instanz-Wand: der Chokepoint `static _instanzMesh(geom, mat, cap)` trägt den Bau nicht");
    if (!/StorageInstancedBufferAttribute\(m\.instanceMatrix\.array, 16\)/.test(code))
        errs.push("Instanz-Wand: _instanzMesh legt die Matrix nicht als StorageInstancedBufferAttribute an");
    return errs;
}

// DIE ENTSORGUNGS-WAND (AST seit der vierten Nachbesserung): wer Geometrie oder Stoff eines Objekts entsorgt, muss ihr
// BESITZER sein. Jetzt liest acorn den Stamm: jede Entsorgung (`.dispose()` oder
// `_queueDispose`/`_queueGeometryDispose`), deren Ziel aus `.geometry` oder `.material` eines Objekts stammt (direkt,
// über eine Variable, ein Schleifen- oder Rückruf-Element), steht in ihrer Methode — und die Methode in der
// Besitzer-Liste mit genau dieser Art. Rot ist jede Entsorgung außerhalb der Liste und jede tote Zeile der Liste (der
// Besitzer entsorgt die Art nicht mehr). Gruppen mit Welt-Vorlagen entsorgen über `_disposeSoulGroup`; die übrigen
// Zeilen sind die Besitzer eigener frischer Objekte.
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
    _gangSatzAbschied: { arten: ["geometry", "material"], grund: "die Gang-Sätze (`_gangSatz`, je Satz frisch)" },
    _canopyDisposeChunkByKey: { arten: ["geometry", "material"], grund: "die Kronen-Kachel (je Kachel frisch)" },
    _leibZeichenFrei: {
        arten: ["material"],
        // K13: auch am Ende von Auftrag und Last — die EINE Räum-Methode
        grund: "Aufgaben-Aura und Trage-Sprite des Leibs (je Kreatur frisch) — Fall, Abschied, Ende von Auftrag und Last",
    },
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
    const ast = stammLib.ast(srcRoh); // der EINE Parser des Stamms (je Text einmal)
    const ueberall = (n, f) => {
        f(n);
        kinder(n, (c) => ueberall(c, f));
    };
    // Die Träger einer Art beim Namen, auch in der Mehrzahl und in der Vokabel des Hauses (der Fern-Ring trägt seit K16 je
    // Schale `geos` und je Pass `stoffe` — die Wand sah nur `geometry`/`material` und nannte `_fernRingDispose` tot).
    const TRAEGER_ART = {
        geometry: "geometry",
        geos: "geometry",
        geometrien: "geometry",
        material: "material",
        materials: "material",
        stoffe: "material",
    };
    const traeger = (n) =>
        n && n.type === "MemberExpression" && !n.computed && n.property && TRAEGER_ART[n.property.name]
            ? TRAEGER_ART[n.property.name]
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
                funde.push({
                    methode,
                    art,
                    zeile: stammLib.zeileVon(srcRoh, n.start),
                    text: srcRoh.slice(n.start, n.end).slice(0, 90),
                });
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
            `Entsorgungs-Wand: ${stammLib.ort(path.join(__dirname, ".."), f.zeile)} \`${f.methode}\` entsorgt ${deutsch[f.art]} (\`${f.text}\`) — nicht ihr Besitz: ` +
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
// backt im Welt-Renderer, die GPU legt sie ab (`_karteWeltBacken`, `_karteAblage`, S2).
const KARTEN_METHODEN = [
    "_impostorAtlas",
    "_impostorAtlasTexturen",
    "_karteWeltBacken",
    "_karteAblage",
    "_impostorZelleNeu",
    "_impostorQuad",
    "_impostorAtlasMaterial",
    "_impostorLeaf",
    "_tickImpostorBake",
    "_buildImpostorLeaf",
    "_foundryEnsureImpostorRecord",
    "_foundryBuildImpostorFlat",
];
function scanKartenWand(srcRoh) {
    const code = stripComments(srcRoh);
    const errs = [];
    for (const name of KARTEN_METHODEN) {
        const a = stammLib.kopf(code, name);
        const b = a < 0 ? -1 : code.indexOf("\n    }\n", a);
        if (a < 0 || b < 0) {
            errs.push(`Karten-Wand: die Methode \`${name}\` fehlt (der Atlas braucht den Anker)`);
            continue;
        }
        const rumpf = code.slice(a, b);
        for (const t of ["CanvasTexture", 'createElement("canvas")', "getContext(", "putImageData", "drawImage("])
            if (rumpf.indexOf(t) >= 0) errs.push(`Karten-Wand: \`${name}\` malt wieder (${t})`);
    }
    return errs;
}

// DIE ABSENZ-ERBSCHAFT (V1 Prüf-Diät N1): die Diät strich im Playtest 297 Präsenz-Textproben (Lehre 6); 20 davon
// trugen neben dem Präsenz-Muster ein Absenz-Glied über den Rumpf EINER Methode — das Absenz-Urteil bleibt, hier je Methode.
const METHODEN_OHNE = [
    ["_tickCreatureDrink", ["PING_FREQ"]], // die Stimme des Tiers, kein Sinus-Ping
    ["_grassInstanceMat", ["gust"]], // die Böe lebt im EINEN Wind-Versatz
    ["_applyVegetationResponse", ["uWindTime"]], // EIN Wind-Term
    ["_foundryTreeMaterial", ['attribute("instanceColor"']], // der Stoff liest die Instanz-Tönung nativ
    ["_bodenFarbeAt", ["SNOW_PROM", "_cont0"]], // der Schnee liest die Prominenz des Gelände-Kerns
    ["_vegetationSampleSpawn", ["Math.random"]], // Γ5: Substanz aus Seed-Streams
    ["_nahStreuKachel", ["Math.random"]],
    ["_hydroRiverAt", ["_terrainMacroSurfaceY"]], // der Fluss liest das Gesetz, nie die Makro-Fläche
    ["_applySubstanceResponse", ["_T.max(_rgb"]], // das Füll-Licht ohne Helligkeits-Klemme
    ["handleJump", ["playerBody"]], // der Sprung schreibt die Geschwindigkeit, kein Physik-Körper
    ["createGalaxySkybox", ["cloudShade", "mx_noise_float"]], // EIN Himmel (D3: die Nebel-Kuppel fiel mit der EINEN Atmosphäre)
    ["_buildPbrNodeMaterial", ["__structAerialError"]], // die Luft aus EINER Quelle
    ["_ensureHydroSurfaceMaterial", ["gerstnerWave", "uSkyCol", "d.x).mul(cos(phase))"]], // die Dünung, der EINE Himmel
    ["_wasserBlick", ["uSkyCol"]],
    ["_dayNightApplyHemiUndLuft", ["playerEyesUnderwater"]],
    ["_workshopInstallShapeDragDrop", ["cards.forEach"]], // EIN delegierter Zieh-Hörer
    ["_p2pMsgCreaturePos", ["_cpRate"]], // die Kappe lebt im Takt, nie im Empfänger
    ["updateCreatures", ["_runRaycast(", "_fieldRaycast("]], // das Tier stößt mit dem Leib, nie mit dem Strahl
];
function scanAbsenzErbe(srcRoh, liste = METHODEN_OHNE) {
    const code = stripComments(srcRoh);
    const errs = [];
    for (const [name, verboten] of liste) {
        const a = stammLib.kopf(code, name);
        const b = a < 0 ? -1 : code.indexOf("\n    }\n", a);
        if (a < 0 || b < 0) {
            errs.push(`Absenz-Erbe: \`${name}\` fehlt — ihr Absenz-Urteil (${verboten.join(" · ")}) zieht mit um`);
            continue;
        }
        const rumpf = code.slice(a, b);
        for (const t of verboten) if (rumpf.includes(t)) errs.push(`Absenz-Erbe: \`${name}\` trägt wieder "${t}"`);
    }
    return errs;
}

// DIE NORMAL-WAND: ein normalNode ist VIEW-space (r184 NodeMaterial.setupNormal → normalView). Welt/Lokal →
// Sicht ist MATRIX.transformDirection(n) (= M·n, three's transformNormalToView); n.transformDirection(MATRIX) rechnet
// Mᵀ·n (three's normalWorld: Sicht → Welt) — das Licht der Krone dreht sonst mit dem Blick.
function scanNormalWand(srcRoh) {
    const code = stripComments(srcRoh);
    const errs = [];
    const re = /normalNode\s*=[^;]*?\.transformDirection\(\s*[\w$.]*(?:ViewMatrix|WorldMatrix)\s*\)/g;
    let m;
    while ((m = re.exec(code)))
        errs.push(
            `Normal-Wand: ${stammLib.ort(path.join(__dirname, ".."), code.slice(0, m.index).split("\n").length)} dreht die Normale mit der ` +
                `transponierten Matrix (n.transformDirection(M) = Mᵀ·n) — Welt → Sicht ist M.transformDirection(n)`
        );
    // DIE QUELLE: ein normalNode-Graph liest nie r184s `normalWorld` — es ist EINE Variable je Programm; las der
    // normalNode (NORMAL-Stufe) sie zuerst, lasen Schatten-Lookup (normalBias), Halbkugel- und Umgebungslicht ihre
    // NORMAL-Fassung (die Geometrie-Normale mit Flächen-Vorzeichen: am Boden nach unten, der Boden lag im eigenen
    // Schatten). Die Geometrie-Normale heißt im Graphen `normalWorldGeometry` (× `faceDirection`). Geprüft wird der
    // Rechte-Hand-Ausdruck jeder normalNode-Zuweisung und transitiv jede lokale Größe (`_name`), die er in seiner Methode liest.
    // Die Methode der Zuweisung am AST (stammLib.glieder, K38-N2): bis dahin suchte ein Kopf-Muster den letzten Kopf davor —
    // ein umbrochener Kopf oder `)` im Default-Parameter gab der Spur die Methode davor (die lokale Größe blieb ungelesen).
    const zuweisung = /([\w$.]+)\.normalNode\s*=\s*([^;]+);/g;
    const quelleRe = /\.normalWorld\b(?!Geometry)/;
    // Der Strip hält jede Zeile (er kennt keine Regex-Literale, sein Text ist kein JS mehr): das Glied liest der AST am
    // Rohtext, die Zuweisung trifft es über ihre Zeile.
    const gl = stammLib.glieder(srcRoh);
    const codeAb = [0];
    for (let i = -1; (i = code.indexOf("\n", i + 1)) !== -1; ) codeAb.push(i + 1);
    while ((m = zuweisung.exec(code))) {
        let lo = 0,
            hi = codeAb.length - 1;
        while (lo < hi) {
            const mid = (lo + hi + 1) >> 1;
            if (codeAb[mid] <= m.index) lo = mid;
            else hi = mid - 1;
        }
        const zeile = lo + 1;
        const g = gl.find((x) => x.zeile <= zeile && zeile <= x.bisZeile);
        // außerhalb jeder Methode (eine Anweisung hinter der Klasse): ab der Zeile nach dem Glied davor
        const davor = g ? null : gl.filter((x) => x.bisZeile < zeile).pop();
        const rumpf = code.slice(g ? codeAb[g.zeile - 1] : davor ? codeAb[davor.bisZeile] : 0, m.index);
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
                `Normal-Wand: ${stammLib.ort(path.join(__dirname, ".."), code.slice(0, m.index).split("\n").length)} — der normalNode-Graph liest ` +
                    `r184s \`normalWorld\` (${treffer}); die Geometrie-Normale ist \`normalWorldGeometry\` × \`faceDirection\``
            );
    }
    return errs;
}

// DIE STOFF-WAND: kein stiller Fang im Render- und Stoff-Bau. Ein FANG ist:
//   (a) ein catch im Stoff- oder Render-Bau, der weder wirft noch ERROR meldet (der Fehler verschwindet, das Bild zeichnet
//       byte-alt weiter);
//   (b) eine Fehler-Variable `window.__…Error` (der Fehler wandert in ein Fach, das kein Spiel-Leser liest);
//   (c) ein AUSSTATTUNGS-WENN: der Bau fragt, ob TSL (THREE.TSL, im Stoff T · _T · TSL …) ein Glied trägt. Der Vendor ist
//       gepinnt (three-bootstrap importiert three/tsl ganz, gate:vendor-anker), ein fehlendes Glied bricht beim ersten Ruf
//       mit seinem Namen; das Wenn machte daraus einen Stoff ohne seinen Knoten;
//   (d) ein NULL-KNOTEN: ein Knoten-Bauer, dessen Ergebnis ein Stoff in einen `…Node` setzt, gibt null zurück, oder sein
//       Aufrufer setzt den Knoten nur unter Wenn.
// Stoff-Bau = jede Methode, die TSL liest (ein Bezeichner aus THREE.TSL oder ein Parameter T/TSL, der TSL-Knoten baut);
// Render-Bau = jeder Versuch (try-Block, die Kette vor `promise.catch`), der den Render-Graphen baut oder läuft (DER
// RENDER-BAU unten: am Versuch gemessen, nie am Text des Fangs). Laut ist ein Fang, dessen jeder Pfad bricht (`_stoffBruch`,
// ERROR mit dem Glied beim Namen, oder eine begrenzte Wiederholung, deren Ende bricht) — ein bewusster Zweig steht mit
// Grund und Bild-Leser in STOFF_ZWEIGE (eine tote Zeile ist rot). Im Stoff ist auch jede stille Frage ein Fang: `"x" in T`,
// `!!T.x` frei, `T.x?.(…)`, ein aus TSL gezogenes Glied (`const { pass } = TSL; if (!pass)`), das Ergebnis eines
// Stoff-Bauers (`if (_su)`).
// Die Wand misst den Render-Bau am Versuch, nie am Rumpf-Text, samt dem Render-Lauf (`_loopRender`: r184 baut die Post-Kette
// dort). Bewusst bleibt EIN Zweig ohne Seite: `_blattAtlasProbe` gibt ohne document null, seine drei Leser stehen benannt.
// Die Hülle ist ein Fixpunkt über das, was IM Versuch läuft, der Studio-Faden zählt (`_ensureAssetFoundry` startet ihn,
// seine Antwort baut), und JEDER Pfad muss brechen; die Drossel des Loops (`_loopErrorBoundary`) meldet jeden NEUEN
// Fehler und steht als Zweig mit ihrem Bild.
// DER HÖRER DES FADENS: der Fehler eines Studio-Fadens erreicht keinen catch, sein Fehler-Hörer (`onerror`) IST sein Fang. Studio-Faden ist jeder Worker,
// dessen Antwort einen Bauer ruft oder im Leser eines Studio-Fadens landet (der Bäcker über `_foundryAntwort`); er trägt
// einen Hörer, dessen jeder Pfad bricht. Die Klang-Werkstatt baut nichts und bleibt draußen.
// Ein Fund ist Code (Kommentare geschwärzt), der
// EINE Melder `_bruchMelden` (STOFF_MELDER) ist laut, wenn er nur ERROR meldet und jeder Pfad meldet oder zählt — die Fänge
// des Loops rufen ihn über `_loopErrorBoundary` und brauchen keinen Zweig; ein catch an einem Namen misst, was der Name
// bindet; ein `.then`-Glied, das den gelieferten Wert prüft und ohne Wert zurückkehrt, ist ein Fang (für eine Kette aus
// einer Methode des Stamms spricht die Methode).
// Ein Bau, der in einer Schleife auf die Uhr wartet, geht nach dem Deckel mit halben Daten weiter — er wartet auf das
// EREIGNIS (das Buch: `buchDa`, `_foundryIngestBook` erfüllt es).
const OHNE_SEITE =
    "ohne Seite (kein document: der Node-Prüfstand) gibt es keinen Atlas und kein Bild — mit Seite liefert " +
    "`_ensureFoliageClusterAtlas` den Atlas oder bricht (KERN-PFLICHT)";
const STOFF_ZWEIGE = [
    {
        methode: "_blattAtlasProbe",
        art: "Null-Knoten",
        anker: "gibt null",
        grund: OHNE_SEITE,
        bild: "der Laub-, Schatten- und Blatt-Karten-Stoff lesen den Atlas; gate:pflanzen-nah (F) misst seine Fracht am Bild",
    },
    {
        methode: "_foundryTreeMaterial",
        art: "Null-Knoten",
        anker: "atl = this._blattAtlasProbe",
        grund: OHNE_SEITE,
        bild: "der Laub-Stoff (foliageTex) schneidet die Blattform aus dem Atlas; gate:pflanzen-nah (F)",
    },
    {
        methode: "_foundryTreeMaterial",
        art: "Null-Knoten",
        anker: "atl = this._blattAtlasProbe",
        grund: OHNE_SEITE,
        bild: "der Schatten-Stoff des Laubs wirft max(aDeckt, Atlas-Alpha) — die Blattform im Schatten; gate:pflanzen-nah (F)",
    },
    {
        methode: "_buildPbrNodeMaterial",
        art: "Null-Knoten",
        anker: "_atl = this._blattAtlasProbe",
        grund: OHNE_SEITE,
        bild: "die Blatt-Karte schneidet Alpha und Farbe aus dem Atlas (der EINE Leser); gate:pflanzen-nah (F)",
    },
    {
        methode: "_getVoxelWorker",
        art: "Fang",
        anker: "throw _workerErr; this._voxelFadenBlobWeg()",
        grund:
            "der null-origin-Sandbox verbietet `new Worker(url)` (SecurityError): der Voxel-Faden startet EINMAL über die " +
            "Blob-URL derselben Quelle (`voxel-worker.js?v=`); scheitert der Blob-Weg oder ein zweiter Start, bricht er laut " +
            "(`_stoffBruch`, der äußere Fang meldet ERROR)",
        bild:
            "bis der Blob-Faden steht, baut der Haupt-Thread den Chunk aus derselben Dichte (der bit-identische Spiegel, " +
            "gate:worker-dichte maxDiff 0), danach der Faden",
    },
];
// DER EINE MELDER (Nachbesserung 3): `_bruchMelden` meldet jede NEUE Bruch-Meldung sofort ERROR und dieselbe wieder mit ihrem
// Zähler höchstens alle 2 s (`_stoffBruch` und die Fehler-Grenze des Loops `_loopErrorBoundary` melden über ihn; der Loop
// zeichnet nach einem Frame-Fehler weiter, playtest V18.278 loopSurvivesThrow · errorCounted). Die Wand misst ihn am Code
// (DER MELDER in stoffFaenge): fehlt er, meldet er INFO/WARN oder still, ist er rot — und mit ihm jeder Fang, der ihn ruft.
const STOFF_MELDER = ["_bruchMelden"];
// DER RENDER-BAU (K22 Nachbesserung): was ein try VERSUCHT (sein Block, bei `promise.catch` die Kette davor), nie was sein
// catch sagt — ein Schnitt im catch darf die Wand nie verlassen (bis hierher entschied der Rumpf-Text der Methode, und
// der Schnitt, der `!THREE.TSL` aus `_membranBauFor` nahm, nahm die Methode aus der Wand). Ein Block baut den
// Render-Graphen, wenn er (oder ein Bauer, den er ruft, oder dessen Bauer — zwei Ruf-Glieder; tiefer liegt die
// Spiel-Logik) TSL liest, ein Render-Objekt baut (RENDER_KLASSE, gleich aus welchem Namensraum: `THREE`, `T = THREE`),
// eine Render-Quelle hochlädt (`needsUpdate = true`) oder den Graphen LÄUFT: r184 baut Post-Kette, Szenen-Pass und jede
// Pipeline erst beim ersten render() (Vendor: PostProcessing.render → _update → _quadMesh.render) — der Fang um den Lauf
// fängt den Bau. Die GEOMETRIE gehört dazu (Prüfer K22-3): ein Stoff liest ihre Attribute (`attribute("aLodLevel")`), und
// fehlt ein Attribut, liest r184 still 0 — der catch um die Stufen-Stempel aLodLevel · aH0 · aH0L in `_foundryBuildGroup`
// ließ den Baum ungemaskt doppelt mit seiner Karte stehen, und die Wand sah ihn nicht (sie zählte weder BufferAttribute noch
// setAttribute als Bau). Ein Attribut, eine Geometrie, ein Schreiben in eine Geometrie (`geo.setAttribute`, `setIndex`,
// `addGroup` an einem Träger namens …geo…) baut den Render-Graphen.
const RENDER_KLASSE =
    /^(\w*(Material|Texture|RenderTarget|Node|BufferAttribute|Geometry)|Mesh|InstancedMesh|BatchedMesh|SkinnedMesh|Line|LineSegments|LineLoop|Points|Sprite|PostProcessing|RenderPipeline|WebGPURenderer|QuadMesh)$/;
const RENDER_LAUF = /^(render|renderAsync|compile|compileAsync)$/;
const RENDER_TRAEGER = /renderer|^pp$|postProcessing|pipeline/i;
const GEO_SCHREIBEN = /^(setAttribute|setIndex|addGroup|setDrawRange|computeVertexNormals)$/;
const GEO_TRAEGER = /geo/i;
// DER GLIED-RUF: `e` ruft ein Glied mit festem Namen (`objekt.name(…)`, nicht berechnet) — `name` ein Wort, ein Muster
// oder null (jeder Name), `dies`: das Objekt ist `this`. Die EINE Prüfung, die bis hier jede Fang-Regel selbst ausschrieb.
const gliedRuf = (e, name, dies) =>
    e.type === "CallExpression" &&
    e.callee.type === "MemberExpression" &&
    !e.callee.computed &&
    (!dies || e.callee.object.type === "ThisExpression") &&
    (name == null || (name.test ? name.test(e.callee.property.name) : e.callee.property.name === name));
// DER NAME EINES KNOTENS: ein Bezeichner (`geo`) oder sein letztes Glied (`this.geo`), sonst ""
const knotenName = (k) =>
    k.type === "Identifier" ? k.name : k.type === "MemberExpression" && !k.computed ? k.property.name : "";
function stoffFaenge(srcRoh, zweige = STOFF_ZWEIGE) {
    const acorn = require("acorn");
    const kommentare = [];
    const ast = acorn.parse(srcRoh, {
        ecmaVersion: "latest",
        sourceType: "script",
        locations: true,
        onComment: (_block, _text, start, end) => kommentare.push({ start, end }),
    });
    const gehe = (n, f, eltern = null) => {
        f(n, eltern);
        kinder(n, (c) => gehe(c, f, n));
    };
    // ein Promise-Fang: `….catch((e) => …)` — sein Rückruf ist ein catch, die Kette davor sein Block
    const istPromiseFang = (n) =>
        gliedRuf(n, "catch") && n.arguments.length >= 1 && /Function/.test(n.arguments[0].type);
    // AUFGESCHOBEN läuft, was der Versuch nur ablegt: eine Funktion als Wert eines Objekts (`{ render: () => … }`), an ein
    // Glied gehängt (`el.onclick = () => …`) oder einem Zeitgeber/Hörer übergeben (rAF, setTimeout, addEventListener …) —
    // sie läuft nach dem Versuch, ihr Fehler erreicht seinen catch nie (die Hülle lief über die UI-Räume vom Chat in die
    // Kreatur-Aura). Eine Funktion als Argument (forEach, map, then …) oder in einer Variable läuft im Versuch.
    const ZEITGEBER =
        /^(setTimeout|setInterval|requestAnimationFrame|requestIdleCallback|queueMicrotask|addEventListener|on|once)$/;
    const aufgeschoben = (c, el) => {
        if (!/Function/.test(c.type) || !el) return false;
        if (el.type === "Property" && el.value === c) return true;
        if (el.type === "MethodDefinition" || el.type === "PropertyDefinition") return true;
        if (el.type === "AssignmentExpression" && el.right === c && el.left.type === "MemberExpression") return true;
        if ((el.type === "CallExpression" || el.type === "NewExpression") && el.arguments.includes(c))
            return ZEITGEBER.test(knotenName(el.callee));
        return false;
    };
    // der Versuch ohne seine Fänge: catch-Rümpfe und Promise-Rückrufe zählen nie zum Bau, Aufgeschobenes läuft nicht in ihm
    const geheVersuch = (n, f) => {
        f(n);
        if (n.type === "CatchClause") return;
        if (istPromiseFang(n)) return geheVersuch(n.callee.object, f);
        kinder(n, (c) => {
            if (!aufgeschoben(c, n)) geheVersuch(c, f);
        });
    };
    // der Text eines Funds ist CODE: Kommentare sind geschwärzt (Nachbesserung 3 — ein Zweig, dessen Anker ein Kommentar
    // war, hielt einen leeren catch grün, solange der Kommentar stand)
    const stuecke = [];
    let bis = 0;
    for (const c of kommentare) {
        stuecke.push(srcRoh.slice(bis, c.start), " ".repeat(c.end - c.start));
        bis = c.end;
    }
    stuecke.push(srcRoh.slice(bis));
    const code = stuecke.join("");
    const kurz = (n) => code.slice(n.start, n.end).replace(/\s+/g, " ").trim().slice(0, 90);
    const funde = [];
    const fund = (art, methode, n, was) => funde.push({ art, methode, zeile: n.loc.start.line, was });
    const istThreeTsl = (e) =>
        !!e &&
        e.type === "MemberExpression" &&
        !e.computed &&
        e.object.type === "Identifier" &&
        e.object.name === "THREE" &&
        e.property.name === "TSL";
    const ausTsl = (e) =>
        !!e &&
        (istThreeTsl(e) ||
            (e.type === "MemberExpression" && !e.computed && e.property.name === "TSL") ||
            (e.type === "LogicalExpression" && ausTsl(e.right)) ||
            (e.type === "ConditionalExpression" && ausTsl(e.consequent)));
    const methoden = [];
    gehe(ast, (n) => {
        if (n.type === "MethodDefinition" && n.key && n.value) methoden.push(n);
    });
    const nameVon = (m) => m.key.name || m.key.value;
    const tslApi = (name, rumpf) =>
        new RegExp(
            `\\b${name}\\.(float|vec[234]|uniform|attribute|mix|fract|positionWorld|positionLocal|screenCoordinate|texture)\\b`
        ).test(rumpf);
    // je Methode: die Namen von TSL (`T`, `_T`, `TSL` …) und die Glieder, die aus TSL gezogen sind (`const { pass } = TSL`,
    // `const f = T.fwidth`) — ein Glied als Wahrheitswert ist eine Frage an den Vendor
    const aliase = (m) => {
        const al = new Set();
        const gl = new Set();
        const rumpf = srcRoh.slice(m.value.start, m.value.end);
        for (const p of m.value.params)
            if (p.type === "Identifier" && /^(T|TSL|_T)$/.test(p.name) && tslApi(p.name, rumpf)) al.add(p.name);
        gehe(m.value, (n) => {
            if (n.type === "VariableDeclarator" && n.id.type === "Identifier" && ausTsl(n.init)) al.add(n.id.name);
            if (n.type === "VariableDeclarator" && n.id.type === "ObjectPattern" && n.init)
                for (const p of n.id.properties)
                    if (p.key && p.key.name === "TSL" && p.value && p.value.type === "Identifier") al.add(p.value.name);
        });
        const ausAl = (e) => !!e && ((e.type === "Identifier" && al.has(e.name)) || istThreeTsl(e));
        gehe(m.value, (n) => {
            if (n.type !== "VariableDeclarator" || !n.init) return;
            if (n.id.type === "ObjectPattern" && ausAl(n.init))
                for (const p of n.id.properties) if (p.value && p.value.type === "Identifier") gl.add(p.value.name);
            if (
                n.id.type === "Identifier" &&
                n.init.type === "MemberExpression" &&
                !n.init.computed &&
                ausAl(n.init.object) &&
                n.init.property.name !== "TSL"
            )
                gl.add(n.id.name);
        });
        return { al, gl };
    };
    const name2al = new Map();
    for (const m of methoden) name2al.set(m, aliase(m));
    // (Render-Bau) der direkte Bau: TSL, ein Render-Objekt, ein Hochladen, ein Render-Lauf
    const baut = (n, { al, gl }) => {
        let hit = null;
        geheVersuch(n, (e) => {
            if (hit) return;
            if (istThreeTsl(e)) hit = "liest THREE.TSL";
            else if (
                e.type === "MemberExpression" &&
                !e.computed &&
                e.object.type === "Identifier" &&
                al.has(e.object.name)
            )
                hit = "liest TSL (" + e.object.name + ")";
            else if (e.type === "CallExpression" && e.callee.type === "Identifier" && gl.has(e.callee.name))
                hit = "ruft das TSL-Glied " + e.callee.name;
            else if (
                e.type === "NewExpression" &&
                e.callee.type === "MemberExpression" &&
                !e.callee.computed &&
                e.callee.object.type === "Identifier" &&
                RENDER_KLASSE.test(e.callee.property.name)
            )
                hit = "baut " + e.callee.property.name;
            else if (
                e.type === "AssignmentExpression" &&
                e.left.type === "MemberExpression" &&
                !e.left.computed &&
                e.left.property.name === "needsUpdate"
            )
                hit = "lädt hoch (needsUpdate)";
            else if (gliedRuf(e, GEO_SCHREIBEN) && GEO_TRAEGER.test(knotenName(e.callee.object)))
                hit = "schreibt die Geometrie (" + e.callee.property.name + ")";
            else if (gliedRuf(e, "postMessage") && /worker/i.test(knotenName(e.callee.object)))
                hit = "schickt dem Faden einen Bau-Auftrag (postMessage)";
            else if (gliedRuf(e, RENDER_LAUF)) {
                const t = knotenName(e.callee.object);
                if (RENDER_TRAEGER.test(t)) hit = "läuft den Render-Graphen (" + t + "." + e.callee.property.name + ")";
            }
        });
        return hit;
    };
    const ruft = (n) => {
        const s = new Set();
        geheVersuch(n, (e) => {
            if (gliedRuf(e, null, true)) s.add(e.callee.property.name);
        });
        return s;
    };
    // DIE HÜLLE: jede Methode, die den Render-Graphen baut — direkt oder über JEDES Ruf-Glied (Fixpunkt, keine Tiefe:
    // bis zur Nachbesserung 2 endete sie nach zwei Gliedern, und ein Bauer drei Glieder tief ließ den Fang still).
    // DER STUDIO-FADEN: wer einen Worker startet, dessen Antwort (`onmessage`) einen Bauer ruft, baut den Render-Graphen
    // mit — der Faden ist seine Quelle (die Foundry: ohne Faden kein Studio-Mesh). Sein Hörer läuft aufgeschoben, darum
    // zählt er nur über den Start im Versuch.
    const startetFaden = (n) => {
        let ja = false;
        geheVersuch(n, (e) => {
            if (e.type === "NewExpression" && e.callee.type === "Identifier" && e.callee.name === "Worker") ja = true;
        });
        return ja;
    };
    const fadenRufe = (n) => {
        const s = new Set();
        if (!startetFaden(n)) return s;
        gehe(n, (e) => {
            if (
                e.type === "AssignmentExpression" &&
                e.left.type === "MemberExpression" &&
                !e.left.computed &&
                e.left.property.name === "onmessage" &&
                /Function/.test(e.right.type)
            )
                gehe(e.right, (c) => {
                    if (gliedRuf(c, null, true)) s.add(c.callee.property.name);
                });
        });
        return s;
    };
    const renderBauer = new Map(); // Methode → { was, ueber, faden } (ueber: das gerufene Glied, null = direkt)
    const rufe = new Map();
    const faeden = new Map();
    for (const m of methoden) {
        const n = nameVon(m);
        const h = baut(m.value, name2al.get(m));
        if (h && !renderBauer.has(n)) renderBauer.set(n, { was: h, ueber: null });
        const s = rufe.get(n) || new Set();
        for (const x of ruft(m.value)) s.add(x);
        rufe.set(n, s);
        const fr = fadenRufe(m.value);
        if (fr.size) faeden.set(n, fr);
    }
    for (let neu = true; neu;) {
        neu = false;
        for (const [n, xs] of rufe) {
            if (renderBauer.has(n)) continue;
            let x = [...xs].find((y) => renderBauer.has(y));
            let faden = false;
            if (!x && faeden.has(n)) {
                x = [...faeden.get(n)].find((y) => renderBauer.has(y));
                faden = !!x;
            }
            if (x) {
                renderBauer.set(n, { was: null, ueber: x, faden });
                neu = true;
            }
        }
    }
    // die Kette bis zum Bau, beim Namen: `ruft A → B → C (baut Mesh)`, ein Faden als `A ⇢ B`
    const kette = (x) => {
        let t = "ruft " + x;
        let b = renderBauer.get(x);
        for (let i = 0; b && b.ueber && i < 24; i++) {
            t += (b.faden ? " ⇢ (Studio-Faden) " : " → ") + b.ueber;
            b = renderBauer.get(b.ueber);
        }
        return t + " (" + (b ? b.was : "?") + ")";
    };
    // die Fehler-Hörer je Studio-Faden einer Methode: { w, art, fn, ort, kette } (fn null = der Faden hat keinen Hörer)
    const HOERER = /^(onerror|onmessageerror)$/;
    const fadenHoerer = (n) => {
        if (!startetFaden(n)) return [];
        const text = (e) => srcRoh.slice(e.start, e.end);
        const istWorker = (e) =>
            !!e && e.type === "NewExpression" && e.callee.type === "Identifier" && e.callee.name === "Worker";
        const faeden = new Map(); // Name des Fadens → { ort, rufe, hoerer }
        gehe(n, (e) => {
            if (e.type === "VariableDeclarator" && e.id.type === "Identifier" && istWorker(e.init))
                faeden.set(e.id.name, { ort: e.init, rufe: new Set(), hoerer: [] });
            else if (e.type === "AssignmentExpression" && istWorker(e.right) && !faeden.has(text(e.left)))
                faeden.set(text(e.left), { ort: e.right, rufe: new Set(), hoerer: [] });
        });
        gehe(n, (e) => {
            let ziel = null;
            let fn = null;
            let art = null;
            if (
                e.type === "AssignmentExpression" &&
                e.left.type === "MemberExpression" &&
                !e.left.computed &&
                /Function/.test(e.right.type)
            ) {
                ziel = text(e.left.object);
                fn = e.right;
                art = e.left.property.name;
            } else if (
                gliedRuf(e, "addEventListener") &&
                e.arguments.length >= 2 &&
                e.arguments[0].type === "Literal" &&
                /Function/.test(e.arguments[1].type)
            ) {
                ziel = text(e.callee.object);
                fn = e.arguments[1];
                art = e.arguments[0].value === "message" ? "onmessage" : "on" + e.arguments[0].value;
            }
            const f = ziel && faeden.get(ziel);
            if (!f) return;
            if (art === "onmessage")
                gehe(fn, (c) => {
                    if (gliedRuf(c, null, true)) f.rufe.add(c.callee.property.name);
                });
            else if (HOERER.test(art)) f.hoerer.push({ art, fn });
        });
        return [...faeden].map(([w, f]) => Object.assign({ w }, f));
    };
    // die Studio-Fäden des Stamms: ein Faden, dessen Antwort einen Bauer ruft, oder dessen Antwort im LESER eines
    // Studio-Fadens landet (der Bäcker liefert seine Karte über `_foundryAntwort` wie die Foundry ihr Mesh — die Antwort
    // erfüllt das Versprechen, das ein Bauer hält); Fixpunkt. Die Klang-Werkstatt bleibt draußen (ihre Antwort baut nichts).
    const studioFaeden = [];
    {
        const alle = [];
        for (const m of methoden) for (const f of fadenHoerer(m.value)) alle.push(Object.assign({ m }, f));
        const leser = new Map(); // Methode → der Studio-Faden, dessen Antwort sie liest
        for (let neu = true; neu;) {
            neu = false;
            for (const f of alle) {
                if (f.kette) continue;
                const x = [...f.rufe].find((y) => renderBauer.has(y));
                const l = x ? null : [...f.rufe].find((y) => leser.has(y));
                if (!x && !l) continue;
                f.kette = x
                    ? "(seine Antwort " + kette(x) + ")"
                    : `(seine Antwort ruft ${l}, den Leser des Studio-Fadens ${leser.get(l)})`;
                for (const y of f.rufe) if (!leser.has(y)) leser.set(y, `${f.w} in ${nameVon(f.m)}`);
                studioFaeden.push(f);
                neu = true;
            }
        }
    }
    // Ein Versuch, der NUR den Faden startet (`worker = new Worker(…)`, sein Hörer hängt danach außerhalb des Versuchs), baut
    // mit, wenn seine Methode baut (Prüfer K22-3: der Sandbox-Fang des Voxel-Fadens gab still null, und der Haupt-Thread
    // baute jeden Chunk selbst; die Klang-Werkstatt baut nichts und bleibt draußen).
    const renderBau = (block, a, methode) => {
        const h = baut(block, a);
        if (h) return h;
        for (const x of ruft(block)) if (renderBauer.has(x)) return kette(x);
        for (const x of fadenRufe(block))
            if (renderBauer.has(x)) return "startet den Studio-Faden, seine Antwort " + kette(x);
        if (startetFaden(block) && renderBauer.has(methode)) {
            const b = renderBauer.get(methode);
            return "startet den Faden der bauenden Methode " + methode + " (" + (b.was || kette(b.ueber)) + ")";
        }
        return null;
    };
    // LAUT ist ein Fang, dessen JEDER Pfad bricht (Nachbesserung 2: bis hierher reichte EIN lauter Satz irgendwo im Rumpf —
    // ein `return null` davor, ein toter Bruch nach `return`, ein Helfer, der nur bedingt wirft, blieben grün). Gezählt wird
    // je Pfad durch den Rumpf, in seiner Reihenfolge: ein Wurf, ein ERROR beim Namen (`this.log(…, "ERROR")` oder ein
    // Bruch-Helfer: eine Methode, deren JEDER Pfad bricht — `_stoffBruch`, `_blendeBruch`, `logError` …), eine BEGRENZTE
    // Wiederholung (der Auftrag kehrt in seine Schlange zurück, und der andere Zweig bricht), oder das Weiterreichen eines
    // Bruchs, der schon gemeldet ist (`if (e.stoff === true) return e`). Still ist jeder Pfad, der den Rumpf verlässt
    // (return · break · continue) oder an seinem Ende ankommt, ehe er brach.
    const flach = (n, f) => {
        f(n);
        kinder(n, (c) => {
            if (!/Function/.test(c.type)) flach(c, f);
        });
    };
    const istLog = (e) => gliedRuf(e, "log", true);
    const istErrorLog = (e) =>
        istLog(e) &&
        e.arguments.length >= 2 &&
        e.arguments[1].type === "Literal" &&
        e.arguments[1].value === "ERROR";
    const bruchHelfer = new Set();
    // DER MELDER (Nachbesserung 3): ein Melder in STOFF_MELDER (`_bruchMelden`) meldet einen Bruch, der jeden Frame
    // wiederkommt, nicht jeden Frame — er ist laut, wenn JEDER `this.log` in ihm ERROR meldet, mindestens einer steht, und
    // jeder Pfad durch ihn ERROR meldet oder den Zähler der Meldung erhöht (`e.n++`: ihr Zähler trägt die nächste Meldung).
    // Bis hierher hielt ein Zweig mit einem KOMMENTAR als Anker die Fänge des Loops grün, und die Drossel selbst durfte INFO
    // melden.
    let zaehltMit = false;
    const istZaehler = (e) =>
        e.type === "UpdateExpression" && e.operator === "++" && e.argument.type === "MemberExpression";
    const lautE = (e) =>
        !!e &&
        (istErrorLog(e) ||
            (e.type === "AwaitExpression" && lautE(e.argument)) ||
            (gliedRuf(e, null, true) && bruchHelfer.has(e.callee.property.name) && e.callee.property.name !== "log"));
    const istSchlangeZurueck = (e) =>
        gliedRuf(e, "push") &&
        /Queue|Schlange/.test(srcRoh.slice(e.callee.object.start, e.callee.object.end));
    const wiederholt = (s) =>
        !!s &&
        ((s.type === "ExpressionStatement" && istSchlangeZurueck(s.expression)) ||
            (s.type === "BlockStatement" && s.body.some(wiederholt)));
    // `if (v.stoff === true)` (oder `v && v.stoff === true`): v ist ein schon gemeldeter Bruch
    const bruchGeprueft = (test) => {
        const aus = new Set();
        gehe(test, (e) => {
            if (
                e.type === "BinaryExpression" &&
                e.operator === "===" &&
                e.right.type === "Literal" &&
                e.right.value === true &&
                e.left.type === "MemberExpression" &&
                !e.left.computed &&
                e.left.property.name === "stoff" &&
                e.left.object.type === "Identifier"
            )
                aus.add(e.left.object.name);
        });
        return aus;
    };
    // die Ausgänge eines Satzes: L (brach) · F (fällt weiter, ungebrochen) · R (verlässt still: return) · B (break/continue)
    const L = "L",
        F = "F",
        R = "R",
        B = "B";
    const vereint = (...xs) => {
        const s = new Set();
        for (const x of xs) for (const y of x) s.add(y);
        return s;
    };
    const pfade = (s, gebrochen = new Set()) => {
        if (!s) return new Set([F]);
        switch (s.type) {
            case "ThrowStatement":
                return new Set([L]);
            case "ExpressionStatement":
                return new Set([lautE(s.expression) || (zaehltMit && istZaehler(s.expression)) ? L : F]);
            case "VariableDeclaration":
                return new Set([s.declarations.some((d) => lautE(d.init)) ? L : F]);
            case "ReturnStatement":
                return new Set([
                    lautE(s.argument) ||
                    (s.argument && s.argument.type === "Identifier" && gebrochen.has(s.argument.name))
                        ? L
                        : R,
                ]);
            case "BreakStatement":
            case "ContinueStatement":
                return new Set([B]);
            case "BlockStatement": {
                let jetzt = new Set([F]);
                for (const x of s.body) {
                    if (!jetzt.has(F)) break; // was nach dem letzten Ausgang steht, ist tot
                    jetzt.delete(F);
                    jetzt = vereint(jetzt, pfade(x, gebrochen));
                }
                return jetzt;
            }
            case "IfStatement": {
                const g2 = vereint(gebrochen, bruchGeprueft(s.test));
                const a = pfade(s.consequent, g2);
                const b = s.alternate ? pfade(s.alternate, gebrochen) : new Set([F]);
                const nurL = (p) => p.size === 1 && p.has(L);
                if ((wiederholt(s.consequent) && nurL(b)) || (nurL(a) && wiederholt(s.alternate))) return new Set([L]);
                return vereint(a, b);
            }
            case "TryStatement": {
                const p = vereint(pfade(s.block, gebrochen), s.handler ? pfade(s.handler.body, gebrochen) : []);
                if (!s.finalizer) return p;
                const f = pfade(s.finalizer, gebrochen);
                return f.has(F) ? p : f;
            }
            case "ForStatement":
            case "ForInStatement":
            case "ForOfStatement":
            case "WhileStatement":
            case "DoWhileStatement": {
                // ein Lauf kann nullmal gehen; break/continue enden in ihm
                const p = pfade(s.body, gebrochen);
                p.delete(B);
                p.add(F);
                return p;
            }
            case "SwitchStatement": {
                const p = new Set([F]);
                for (const c of s.cases)
                    for (const y of pfade({ type: "BlockStatement", body: c.consequent }, gebrochen))
                        p.add(y === B ? F : y);
                return p;
            }
            case "LabeledStatement":
                return pfade(s.body, gebrochen);
            default:
                return new Set([F]);
        }
    };
    const bricht = (s) => {
        const p = pfade(s);
        return p.size === 1 && p.has(L);
    };
    // ein Bruch-Helfer ist KLEIN (≤ 12 Anweisungen, ein Melder, kein Bau) und JEDER seiner Pfade bricht
    const helferKandidat = [];
    for (const m of methoden) {
        let anw = 0;
        flach(m.value.body, (n) => {
            if (/Statement$|Declaration$/.test(n.type) && n.type !== "BlockStatement") anw++;
        });
        if (anw <= 12) helferKandidat.push(m);
    }
    // die Melder zuerst: jeder benannte Melder ist laut (ein Bruch-Helfer) oder ein Fund an seiner stillen Stelle
    const melderTot = [];
    for (const name of STOFF_MELDER) {
        const m = methoden.find((x) => nameVon(x) === name);
        if (!m) {
            melderTot.push({ methode: name, art: "Melder", anker: "die Methode fehlt" });
            continue;
        }
        const logs = [];
        flach(m.value.body, (n) => {
            if (istLog(n)) logs.push(n);
        });
        // DIE FRIST (Prüfer K22-3): ein Zähler ist nur laut, wenn eine Frist (setTimeout) ihn meldet — sonst blieb eine Folge,
        // die vor der nächsten Meldung endete, still. Jeder this.log der Frist meldet ERROR, mindestens einer steht.
        let zaehlt = null;
        const fristLogs = [];
        flach(m.value.body, (n) => {
            if (!zaehlt && istZaehler(n)) zaehlt = n;
            if (
                n.type === "CallExpression" &&
                n.callee.type === "Identifier" &&
                n.callee.name === "setTimeout" &&
                n.arguments.length &&
                /Function/.test(n.arguments[0].type)
            )
                gehe(n.arguments[0], (c) => {
                    if (istLog(c)) fristLogs.push(c);
                });
        });
        // still ist jeder this.log des Melders, der nicht ERROR meldet — auch in einer inneren Funktion (der Frist)
        const alleLogs = [];
        gehe(m.value.body, (n) => {
            if (istLog(n)) alleLogs.push(n);
        });
        const still = alleLogs.filter((n) => !istErrorLog(n));
        const fristFehlt = !!zaehlt && !fristLogs.some(istErrorLog);
        zaehltMit = true;
        const jederPfad = bricht(m.value.body);
        zaehltMit = false;
        if (logs.length && !still.length && jederPfad && !fristFehlt) {
            bruchHelfer.add(name);
            continue;
        }
        // je stille Stelle ein Fund an ihrer Zeile (eine stille Stelle verdeckt nie die nächste)
        if (!logs.length) fund("Fang", name, m, "der Melder meldet still: kein this.log");
        for (const s of still) fund("Fang", name, s, "der Melder meldet still: " + kurz(s));
        if (fristFehlt)
            fund(
                "Fang",
                name,
                zaehlt,
                "der Melder meldet still: der Zähler hat keine Frist, die ihn ERROR meldet (eine Folge, die vor der nächsten Meldung endet, bleibt still)"
            );
        if (logs.length && !still.length && !fristFehlt && !jederPfad)
            fund("Fang", name, m, "der Melder meldet still: ein Pfad meldet weder ERROR noch zählt er");
    }
    for (let neu = true; neu;) {
        neu = false;
        for (const m of helferKandidat) {
            if (bruchHelfer.has(nameVon(m))) continue;
            if (bricht(m.value.body)) {
                bruchHelfer.add(nameVon(m));
                neu = true;
            }
        }
    }
    const laut = (koerper) => (koerper.type === "BlockStatement" ? bricht(koerper) : lautE(koerper));
    // (d) die Knoten-Bauer: `const v = this._m(…)`, danach `if (v …) { x.…Node = … }` oder `x.…Node = v ? … : …`; in einem
    // Stoff jede Frage an das Ergebnis eines Stoff-Bauers (`if (_su)`, `!v`, `v?.x`)
    const stoffMethode = new Set();
    for (const m of methoden) {
        const { al } = name2al.get(m);
        if (al.size > 0 || /\bTHREE\.TSL\b/.test(srcRoh.slice(m.value.start, m.value.end))) stoffMethode.add(m);
    }
    const stoffName = new Set([...stoffMethode].map(nameVon));
    const wirft = (s) =>
        !!s &&
        (s.type === "ThrowStatement" ||
            (s.type === "BlockStatement" && s.body.some((x) => x.type === "ThrowStatement")));
    const bauer = new Map(); // name → [{ methode, zeile }]
    const wennKnoten = [];
    for (const m of methoden) {
        const vars = new Map();
        gehe(m.value, (n) => {
            if (
                n.type === "VariableDeclarator" &&
                n.id.type === "Identifier" &&
                n.init &&
                gliedRuf(n.init, null, true)
            )
                vars.set(n.id.name, n.init.callee.property.name);
        });
        if (!vars.size) continue;
        // gefragt ist der Knoten selbst (`if (v)`, `v ? … : …`, `v && …`), nie ein Glied seines Vertrags (`v.roughNode` trägt
        // der Bauer nur, wenn sein Auftrag es verlangt)
        const nennt = (test) => {
            const t = [];
            gehe(test, (e, el) => {
                if (
                    e.type === "Identifier" &&
                    vars.has(e.name) &&
                    !(el && el.type === "MemberExpression" && el.object === e && !el.optional)
                )
                    t.push(e.name);
            });
            return t;
        };
        const setztKnoten = (n) => /\.\w*Node\s*=(?!=)/.test(srcRoh.slice(n.start, n.end));
        const imStoff = stoffMethode.has(m);
        // jeder Bauer, dessen Ergebnis in einen `…Node` fließt, steht unter der Wand — auch ohne Wenn beim Aufrufer
        gehe(m.value, (n) => {
            if (
                n.type === "AssignmentExpression" &&
                n.left.type === "MemberExpression" &&
                /Node$/.test(n.left.property.name || "")
            )
                gehe(n.right, (e) => {
                    if (e.type === "Identifier" && vars.has(e.name) && !bauer.has(vars.get(e.name)))
                        bauer.set(vars.get(e.name), []);
                });
        });
        const gesehen = new Set();
        const lautGefragt = new Set();
        gehe(m.value, (n) => {
            if (n.type === "ThrowStatement") gehe(n, (c) => lautGefragt.add(c));
            if (n.type === "IfStatement" && wirft(n.consequent)) gehe(n.test, (c) => lautGefragt.add(c));
        });
        gehe(m.value, (n, eltern) => {
            let t = [];
            if (lautGefragt.has(n) || (n.type === "IfStatement" && wirft(n.consequent))) return;
            if (n.type === "IfStatement" && setztKnoten(n.consequent)) t = nennt(n.test);
            else if (
                n.type === "ConditionalExpression" &&
                eltern &&
                eltern.type === "AssignmentExpression" &&
                eltern.left.type === "MemberExpression" &&
                /Node$/.test(eltern.left.property.name || "")
            )
                t = nennt(n.test);
            else if (imStoff) {
                // im Stoff: jede Frage an das Ergebnis eines Stoff-Bauers
                let test = null;
                if (n.type === "IfStatement" || n.type === "ConditionalExpression") test = n.test;
                else if (n.type === "LogicalExpression") test = n.left;
                else if (n.type === "UnaryExpression" && n.operator === "!") test = n.argument;
                else if (n.type === "BinaryExpression" && /^[!=]==?$/.test(n.operator)) test = n;
                else if (n.type === "ChainExpression") test = n;
                if (test)
                    t = nennt(test).filter((v) => stoffName.has(vars.get(v)) && !gesehen.has(v + ":" + test.start));
                if (test) for (const v of t) gesehen.add(v + ":" + test.start);
            }
            for (const v of new Set(t)) {
                const b = vars.get(v);
                if (!bauer.has(b)) bauer.set(b, []);
                bauer.get(b).push({ methode: nameVon(m), zeile: n.loc.start.line });
                wennKnoten.push({
                    methode: nameVon(m),
                    n,
                    was: `${v} = this.${b}(…) setzt seinen Knoten nur unter Wenn`,
                });
            }
        });
    }
    // ein Knoten wird je Stelle einmal genannt (ein `if (!v)` ist ein Wenn, nicht zwei)
    const wennOrt = new Set();
    for (const w of wennKnoten) {
        const k = w.methode + ":" + w.n.loc.start.line + ":" + w.was;
        if (wennOrt.has(k)) continue;
        wennOrt.add(k);
        fund("Null-Knoten", w.methode, w.n, w.was);
    }
    for (const m of methoden) {
        const name = nameVon(m);
        const a = name2al.get(m);
        const { al, gl } = a;
        const stoff = stoffMethode.has(m);
        // (b) die Fehler-Variable — im ganzen Stamm
        gehe(m.value, (n) => {
            if (
                n.type === "AssignmentExpression" &&
                n.left.type === "MemberExpression" &&
                !n.left.computed &&
                n.left.object.type === "Identifier" &&
                n.left.object.name === "window" &&
                /^__\w*(Error|Fehler)/.test(n.left.property.name)
            )
                fund("Fehler-Variable", name, n, `window.${n.left.property.name} (kein Spiel-Leser)`);
        });
        // (a) der Fang: im Stoff jeder catch, sonst jeder catch, dessen Versuch den Render-Graphen baut (try-Block,
        // bei `promise.catch` die Kette davor — hängt der catch an einem Namen, ist der Versuch, was der Name bindet:
        // `const rr = this._buehneRender(…); rr.catch(…)`, Nachbesserung 3)
        const bindung = new Map();
        gehe(m.value, (n) => {
            if (n.type === "VariableDeclarator" && n.id.type === "Identifier" && n.init) bindung.set(n.id.name, n.init);
        });
        gehe(m.value, (n) => {
            let koerper = null;
            let versuch = null;
            let ort = null;
            if (n.type === "TryStatement" && n.handler) {
                koerper = n.handler.body;
                versuch = n.block;
                ort = n.handler;
            } else if (istPromiseFang(n)) {
                koerper = n.arguments[0].body;
                versuch = n.callee.object;
                if (versuch.type === "Identifier" && bindung.has(versuch.name)) versuch = bindung.get(versuch.name);
                ort = n.arguments[0];
            } else return;
            const bau = stoff ? "im Stoff" : renderBau(versuch, a, name);
            if (bau && !laut(koerper)) fund("Fang", name, ort, `catch ${kurz(koerper)} — der Versuch ${bau}`);
            // der stille Ausstieg der Kette (Nachbesserung 3): ein `.then`-Glied eines bauenden Versuchs prüft den GELIEFERTEN
            // Wert und kehrt ohne Wert zurück (`if (!x) return;` · `return null;`) — die Kette endet erfüllt, kein Bau, kein
            // Bruch, der catch sieht nie etwas (das Kern-Manifest ohne Kern ließ die Foundry so still ungebootet). Für den
            // Wert spricht, wer ihn liefert: eine Kette aus einer Methode des Stamms (`this._x(…)`, auch in Promise.all)
            // meldet dort; geprüft werden Ketten aus fremder Quelle (fetch, ein Versprechen von außen).
            const glieder = [];
            let wurzel = istPromiseFang(n) ? n.callee.object : null;
            while (wurzel && gliedRuf(wurzel, /^(then|catch|finally)$/)) {
                if (wurzel.callee.property.name === "then") glieder.push(wurzel.arguments[0]);
                wurzel = wurzel.callee.object;
            }
            const stammRuf = (e) =>
                !!e &&
                e.type === "CallExpression" &&
                e.callee.type === "MemberExpression" &&
                e.callee.object.type === "ThisExpression";
            const stammQuelle =
                stammRuf(wurzel) ||
                (wurzel &&
                    wurzel.type === "CallExpression" &&
                    wurzel.callee.type === "MemberExpression" &&
                    wurzel.callee.object.type === "Identifier" &&
                    wurzel.callee.object.name === "Promise" &&
                    wurzel.arguments[0] &&
                    wurzel.arguments[0].type === "ArrayExpression" &&
                    wurzel.arguments[0].elements.some(stammRuf));
            if (bau && !stammQuelle)
                for (const cb of glieder) {
                    if (!cb || !/Function/.test(cb.type) || cb.body.type !== "BlockStatement") continue;
                    const namen = new Set();
                    for (const p of cb.params) gehe(p, (x) => x.type === "Identifier" && namen.add(x.name));
                    // was aus dem Gelieferten abgeleitet ist, ist geliefert (`const manifest = JSON.parse(text)`)
                    flach(cb.body, (d) => {
                        if (d.type !== "VariableDeclarator" || !d.init) return;
                        let aus = false;
                        gehe(d.init, (x) => {
                            if (x.type === "Identifier" && namen.has(x.name)) aus = true;
                        });
                        if (aus) gehe(d.id, (x) => x.type === "Identifier" && namen.add(x.name));
                    });
                    const leer = (s) =>
                        !!s &&
                        ((s.type === "ReturnStatement" &&
                            (!s.argument || (s.argument.type === "Literal" && s.argument.value === null))) ||
                            (s.type === "BlockStatement" && s.body.length === 1 && leer(s.body[0])));
                    flach(cb.body, (s) => {
                        if (s.type !== "IfStatement" || !leer(s.consequent)) return;
                        let liest = false;
                        gehe(s.test, (x) => {
                            if (x.type === "Identifier" && namen.has(x.name)) liest = true;
                        });
                        if (liest) fund("Fang", name, s, `.then steigt still aus: ${kurz(s)} — der Versuch ${bau}`);
                    });
                }
        });
        // (a') DER HÖRER DES STUDIO-FADENS: der Fehler eines Fadens erreicht keinen catch — sein Fehler-Hörer (`onerror`,
        // `onmessageerror`, `addEventListener("error", …)`) IST sein Fang. Ein Faden, dessen Antwort einen Bauer ruft, trägt
        // einen Hörer, dessen jeder Pfad bricht; ohne Hörer fällt sein Bruch still (bis zur Nachbesserung 2 schwieg der
        // Bäcker-Hörer, und jede Karte wartete für immer in der Schlange).
        for (const f of studioFaeden) {
            if (f.m !== m) continue;
            if (!f.hoerer.length)
                fund("Fang", name, f.ort, `Hörer fehlt: der Studio-Faden ${f.w} ${f.kette} — sein Bruch fällt still`);
            for (const h of f.hoerer)
                if (!laut(h.fn.body))
                    fund("Fang", name, h.fn, `Hörer ${f.w}.${h.art} ${kurz(h.fn.body)} — der Studio-Faden ${f.kette}`);
        }
        // (a'') DER UHR-DECKEL (Nachbesserung 4): ein Bau, der in einer Schleife auf die Uhr wartet (`await new Promise((r) =>
        // setTimeout(r, …))`), geht nach dem Deckel mit dem weiter, was gerade da ist. Der Vorrat wartete 2 s auf das
        // Studio-Buch und wärmte danach ohne Rezepte (FOUNDRY WARM: fünf kritische Presets fehlen, der Wald am Dorf fiel je
        // nach Takt). Ein Bau wartet auf das EREIGNIS (ein Versprechen), nie auf die Uhr.
        if (renderBauer.has(name))
            gehe(m.value, (n) => {
                if (!/^(For|While|DoWhile)Statement$/.test(n.type)) return;
                let uhr = false;
                gehe(n.body, (x) => {
                    if (
                        x.type === "AwaitExpression" &&
                        x.argument &&
                        x.argument.type === "NewExpression" &&
                        x.argument.callee.type === "Identifier" &&
                        x.argument.callee.name === "Promise"
                    )
                        gehe(x.argument, (y) => {
                            if (
                                y.type === "CallExpression" &&
                                y.callee.type === "Identifier" &&
                                y.callee.name === "setTimeout"
                            )
                                uhr = true;
                        });
                });
                if (uhr) fund("Uhr-Deckel", name, n, `wartet in der Schleife auf die Uhr: ${kurz(n)} — ${kette(name)}`);
            });
        if (!stoff) continue;
        // (c) das Ausstattungs-Wenn: ein Glied von TSL als Wahrheitswert
        const ausAlias = (e) => !!e && ((e.type === "Identifier" && al.has(e.name)) || istThreeTsl(e));
        const glied = (e) => {
            if (!e) return false;
            if (e.type === "ChainExpression") return glied(e.expression);
            return (
                (e.type === "Identifier" && (al.has(e.name) || gl.has(e.name))) ||
                istThreeTsl(e) ||
                (e.type === "MemberExpression" &&
                    !e.computed &&
                    (ausAlias(e.object) || (e.object.type === "Identifier" && gl.has(e.object.name))))
            );
        };
        // `wert`: der Ausdruck liefert seinen Wert (`opts.pos || T.positionLocal` — das letzte Glied ist ein Wert, keine
        // Frage); in einer Bedingung ist jedes Glied eine Frage.
        const glieder = (e, aus, wert) => {
            if (!e) return aus;
            if (e.type === "LogicalExpression") {
                glieder(e.left, aus, false);
                glieder(e.right, aus, wert);
            } else if (e.type === "UnaryExpression" && (e.operator === "!" || e.operator === "typeof"))
                glieder(e.argument, aus, false);
            else if (e.type === "BinaryExpression" && e.operator === "in") {
                if (glied(e.right)) aus.push(kurz(e));
            } else if (e.type === "BinaryExpression" && /^[!=]==?$/.test(e.operator)) {
                if (e.left.type === "UnaryExpression" && e.left.operator === "typeof")
                    glieder(e.left.argument, aus, false);
                else if ((glied(e.left) && nichts(e.right)) || (glied(e.right) && nichts(e.left))) aus.push(kurz(e));
            } else if (!wert && glied(e)) aus.push(kurz(e));
            return aus;
        };
        // eine Existenz-Frage vergleicht mit nichts (`T.x == null`, `T.x === undefined`)
        const nichts = (e) =>
            !!e && ((e.type === "Literal" && e.value === null) || (e.type === "Identifier" && e.name === "undefined"));
        // ein optionales Glied fragt still: `T.x?.(…)`, `T?.x`, `T.x?.y` — fehlt es, wird der Knoten undefined
        const optionalFrage = (e) => {
            const aus = [];
            gehe(e, (x) => {
                if (x.type === "MemberExpression" && x.optional && (glied(x.object) || ausAlias(x.object)))
                    aus.push(kurz(x));
                else if (x.type === "CallExpression" && x.optional && glied(x.callee)) aus.push(kurz(x));
            });
            return aus;
        };
        // eine Frage, die laut bricht, fängt nicht: `if (!T) throw …` und alles im Wurf selbst
        const imWurf = new Set();
        gehe(m.value, (n) => {
            if (n.type === "ThrowStatement") gehe(n, (c) => imWurf.add(c));
        });
        const erledigt = new Set();
        gehe(m.value, (n, eltern) => {
            if (imWurf.has(n) || erledigt.has(n)) return;
            if (n.type === "IfStatement" && wirft(n.consequent)) {
                gehe(n.test, (c) => erledigt.add(c));
                return;
            }
            let test = null;
            let wert = false;
            let g = [];
            if (n.type === "IfStatement" || n.type === "ConditionalExpression") test = n.test;
            else if (
                n.type === "LogicalExpression" &&
                !(eltern && /^(LogicalExpression|UnaryExpression)$/.test(eltern.type)) &&
                !(
                    eltern &&
                    (eltern.type === "IfStatement" || eltern.type === "ConditionalExpression") &&
                    eltern.test === n
                )
            ) {
                test = n;
                wert = true;
            } else if (
                (n.type === "UnaryExpression" && (n.operator === "!" || n.operator === "typeof")) ||
                (n.type === "BinaryExpression" && (n.operator === "in" || /^[!=]==?$/.test(n.operator)))
            )
                test = n; // die Frage steht frei (`const has = !!T.x`, `"x" in T`)
            else if (n.type === "ChainExpression") g = optionalFrage(n);
            if (test) {
                g = glieder(test, [], wert).concat(optionalFrage(test));
                gehe(test, (c) => erledigt.add(c));
            }
            if (g.length)
                fund("Ausstattungs-Wenn", name, n, `fragt ${g.slice(0, 4).join(" · ")}${g.length > 4 ? " …" : ""}`);
        });
    }
    // (d) der Knoten-Bauer gibt null
    for (const m of methoden) {
        const name = nameVon(m);
        if (!bauer.has(name)) continue;
        flach(m.value.body, (n) => {
            if (
                n.type === "ReturnStatement" &&
                (!n.argument || (n.argument.type === "Literal" && n.argument.value === null))
            )
                fund(
                    "Null-Knoten",
                    name,
                    n,
                    `${name} gibt ${n.argument ? "null" : "nichts"} (sein Knoten fehlt still im Stoff)`
                );
        });
    }
    // die bewussten Zweige: je Zeile genau ein Fund (eine tote Zeile ist rot)
    const rest = [];
    const tot = [];
    for (const z of zweige) {
        const i = funde.findIndex((f) => f.methode === z.methode && f.art === z.art && f.was.includes(z.anker));
        if (i < 0) tot.push(z);
        else funde.splice(i, 1);
    }
    for (const f of funde) rest.push(f);
    return { funde: rest, tot: tot.concat(melderTot) };
}
function scanStoffWand(srcRoh, zweige = STOFF_ZWEIGE) {
    const { funde, tot } = stoffFaenge(srcRoh, zweige);
    return funde
        .map((f) => `Stoff-Wand: ${f.art} — Stamm-Zeile ${f.zeile} \`${f.methode}\` ${f.was}`)
        .concat(
            tot.map(
                (z) =>
                    `Stoff-Wand: tote Zeile in STOFF_ZWEIGE — \`${z.methode}\` ${z.art} „${z.anker}" fängt nichts mehr`
            )
        );
}

// DIE TOTEN MARKER (K22 Nachbesserung): ein Prüf-Skript, das `window.__…Error`/`…Fehler` liest, misst nur, solange jemand
// den Marker SCHREIBT (eine Zuweisung, die kein Rücksetzen ist, oder ein push). Der Stamm schreibt keinen mehr (Stoff-Wand
// (b)); ein Marker ohne Schreiber machte eine Prüfzeile vakuös (playtest Opsis S1 D2 · E2 · F3, W-G(b), V17.J, T2 und
// diag-chunk-seam lasen gefallene Marker — dort zählt jetzt der Stoff-Zeuge den Bruch).
function toteMarker(dateien) {
    const re = /window\.(__\w*(?:Error|Fehler)\w*)/g;
    const lebt = new Set();
    const lesen = [];
    for (const { datei, text } of dateien) {
        re.lastIndex = 0;
        let m;
        while ((m = re.exec(text))) {
            const nach = text.slice(m.index + m[0].length, m.index + m[0].length + 24);
            if (/^\s*=(?!=)\s*(?!null\b|undefined\b)/.test(nach) || /^\.push\(/.test(nach)) lebt.add(m[1]);
            else lesen.push({ datei, name: m[1], zeile: text.slice(0, m.index).split("\n").length });
        }
    }
    return lesen
        .filter((l) => !lebt.has(l.name))
        .map(
            (l) =>
                `Stoff-Wand: toter Fehler-Marker — ${l.datei}:${l.zeile} liest window.${l.name}, niemand schreibt ihn (die Prüfzeile misst nichts)`
        );
}
function markerDateien(root) {
    const out = [];
    for (const dir of ["scripts", path.join("scripts", "lib")])
        for (const f of fs.readdirSync(path.join(root, dir))) {
            if (!/\.c?js$/.test(f) || f === "diag-altlasten.cjs") continue;
            out.push({
                datei: path.join(dir, f).split(path.sep).join("/"),
                text: fs.readFileSync(path.join(root, dir, f), "utf8"),
            });
        }
    return out;
}

// DIE STUFEN-WAND: eine Bau-Stufe hat EINE Bedeutung, für das Labor (build(), Knopf L0/L1/L2) wie für
// die Welt (buildInstance). Die Abbildung Stufe → Rezept wohnt in `stufenRezept` (foundry-core); `__lod` schreiben nur
// buildInstance (die Stufe, roh, wie der Labor-Knopf) und emitTree (das Rezept für den Bau, danach zurück auf die Stufe),
// deriveParamsPlant reicht die rohe Stufe an das Gesetz `treeParams` (phyto-core), das sie über dieselbe Abbildung liest
//. Jede weitere Zuweisung an `__lod` im Kern ist eine zweite Bedeutung — rot mit Zeile; fehlt ein Anker, ist die
// Abbildung aus emitTree gewandert oder deriveParamsPlant reicht dem Gesetz eine andere als die rohe Stufe.
const STUFEN_ANKER = [
    "__lod = lod;",
    "__lod = sLod;",
    "__lod = stufenRezept(P.kind, stufe);",
    "__lod = stufe;",
    "return core.treeParams({ api, delta, slim, trop, leaf }, SEED, __lod, pre, __weltSkalaArt(CURRENT));",
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

// DIE PORT-WAND (Integration W6): jedes Gate liest seinen Port aus EINER eigenen Variable (`<GATE>_PORT`,
// Standard sein fester Port) — zwei Formen nebeneinander (die geteilte `DIAG_PORT` in 21 Gates, je-Gate-Variablen in den
// übrigen) waren ein Zwilling: eine Serie, die DIAG_PORT setzt, gab allen 21 denselben Port. Rot mit Datei.
// K-WANDUHR: kein Gate steht auf den Ports der Server des Schöpfers (4312, 4313) außer im ANSCHLUSS (die Werkzeuge an seiner
// offenen Welt; die Liste schrumpft nur) — der eigene Port ist welt-boot `eigenePorte`.
const ANSCHLUSS = ["scripts/werkbank.cjs", "scripts/omen-messfolge.cjs", "scripts/leuchtturm.cjs"];
const SCHOEPFER = [/\|\|\s*431[23]\b/, /(?:127\.0\.0\.1|localhost):431[23](?:\/index\.html|\/?["'`])/, /wss?:\/\/(?:127\.0\.0\.1|localhost):431[23]\b/];
function scanPortWand(dateien, anschluss = ANSCHLUSS) {
    const errs = [];
    for (const [name, src] of dateien) {
        const code = stripComments(src);
        if (/process\.env\.DIAG_PORT\b/.test(code))
            errs.push(`Port-Wand: ${name} liest DIAG_PORT — je Gate EINE Variable (<GATE>_PORT)`);
        const m = SCHOEPFER.map((re) => code.match(re)).find(Boolean);
        if (!m !== !anschluss.includes(name)) errs.push(`Port-Wand: ${name} ${m ? "steht auf " + m[0] : "steht im ANSCHLUSS ohne Port"}`);
    }
    return errs;
}
// DIE BOOT-WAND (Z2b-1): Server und Browser jeder Linse startet scripts/lib/welt-boot.cjs (statikServer · starteBrowser)
// — mit dem EINEN Fehler-Sammler, der jeden Seitenfehler, jeden Absturz und jedes console.error ROT mit
// Namen macht. Ein eigener Start (`puppeteer.launch(` · `http.createServer(` · ein `spawn` des save- oder
// signaling-servers, K-WANDUHR: der EINE ist `startProc`, am Ereignis; Kommentare und Texte zählen nicht) ist ROT mit
// Datei; die Rest-Liste nennt die noch nicht gezogenen und darf nur SCHRUMPFEN: eine Zeile, deren Datei nicht mehr
// selbst startet, ist ebenfalls ROT (streichen). Ein neuer Eintrag ist ein Vertrags-Akt im Commit.
const BOOT_REST = [
    // die Werkbank: ihr Steuer-Server ist der JSON-Kanal einer offenen Mess-Welt (kein Statik-Boot), ihre Seiten-Fehler sind das
    // Urteil der Wache der Mess-Folge (omen-messfolge `wachenUrteil`) — der Zug in den Fehler-Sammler schärft dieses Urteil
    // (console.error zählt dann mit) und braucht ein OMEN-ABAB der Mess-Folge, kein Gate
    "scripts/werkbank.cjs",
];
// Gezählt am AST (acorn): ein Aufruf puppeteer.launch(…) oder http.createServer(…) — Kommentare und Texte sind keine Knoten.
function eigenBoots(dateien) {
    const startet = (src) => {
        if (!/\b(?:launch|createServer|spawn)\b/.test(src)) return false;
        let ja = false;
        try {
            stammLib.wandere(stammLib.ast(src), (n) => {
                const c = n.callee || {};
                const [o, p] = [c.object && c.object.name, c.property && c.property.name];
                if ((o === "puppeteer" && p === "launch") || (o === "http" && p === "createServer")) ja = true;
                if (/spawn/.test(c.name || p) && /(?:save|signaling)-server\.js/.test(src.slice(n.start, n.end))) ja = true;
            });
        } catch {
            return /\bpuppeteer\s*\.\s*launch\s*\(|\bhttp\s*\.\s*createServer\s*\(/.test(stripComments(src));
        }
        return ja;
    };
    return dateien.filter(([name, src]) => name !== "scripts/lib/welt-boot.cjs" && startet(src)).map(([name]) => name);
}
function scanBootWand(dateien, rest = BOOT_REST) {
    const eigen = eigenBoots(dateien);
    const errs = [];
    for (const n of eigen)
        if (!rest.includes(n))
            errs.push(`Boot-Wand: ${n} startet Server/Browser selbst — nimm scripts/lib/welt-boot.cjs (statikServer · starteBrowser)`);
    for (const n of rest)
        if (!eigen.includes(n))
            errs.push(`Boot-Wand: ${n} steht auf der Rest-Liste, startet aber nicht mehr selbst — Zeile streichen (sie schrumpft nur)`);
    return errs;
}
// DIE REKURSIONS-WAND (boe-zeit f5851596: `const ergebnis = (a) => ergebnis(a);` brach `werkbank licht` still): ein Helfer, dessen ERSTE
// Tat der Ruf seiner selbst ist (Pfeil-Ausdruck, erste Anweisung, Methode über this), endet nie; ein Basisfall steht davor. Am AST, rot mit Datei:Zeile.
function scanRekursionsWand(dateien, errs = []) {
    const kern = (e) => (e && /^(Await|Chain)Expression$/.test(e.type) ? kern(e.argument || e.expression) : e);
    const erste = (f) => (f.body.type !== "BlockStatement" ? f.body : f.body.body[0] && (f.body.body[0].argument || f.body.body[0].expression));
    for (const [name, src] of dateien)
        stammLib.wandere(stammLib.ast(src), (n) => {
            const [fn, wer] = n.type === "VariableDeclarator" ? [n.init, n.id.name] : n.type === "FunctionDeclaration" ? [n, n.id.name] : n.type === "MethodDefinition" ? [n.value, "this." + n.key.name] : [];
            const c = fn && /Function/.test(fn.type) && kern(erste(fn));
            if (c && c.type === "CallExpression" && src.slice(c.callee.start, c.callee.end) === wer) errs.push(`Rekursions-Wand: ${name}:${src.slice(0, n.start).split("\n").length} \`${wer}\` ruft als erste Tat sich selbst — endet nie`);
        });
    return errs;
}
// DIE HÜLLEN-FORM-WAND (S3 haus, K08): der Wirt liest die Hülle eines Baus in der EINEN Form (N5: `{ stufe, teile }`,
// der Leser `_huelleVon`, fail-closed) — die Zahlen-Zeile `{ stufe, boxen }` fiel mit ee37daf7 als Wirts-Form (sie lebt nur
// im Gesetzbuch, fachwerk-core `huelleAusBoxen`). Die Probe `sockel` kam mit V18.538 und gab dem Wirt noch die alte Zeile —
// ein KERN-PFLICHT-Bruch, den erst playtest 2/3 der CI fand. Kein Wirts-Code (Stamm, Gates, Linsen) trägt `boxen` als
// Objekt-Schlüssel; Kommentare und Texte (die Kern-Ersetzungen von diag-haus-welt) zählen nicht. Rot mit Datei:Zeile.
function ohneTexte(src) {
    const code = stripComments(src);
    let out = "";
    let mode = "code";
    for (let i = 0; i < code.length; i++) {
        const c = code[i];
        if (mode === "code") {
            if (c === "'") mode = "sq";
            else if (c === '"') mode = "dq";
            else if (c === "`") mode = "tpl";
            out += c;
            continue;
        }
        if (c === "\\") {
            out += " " + (code[i + 1] === "\n" ? "\n" : " ");
            i++;
            continue;
        }
        if ((mode === "sq" && c === "'") || (mode === "dq" && c === '"') || (mode === "tpl" && c === "`")) {
            mode = "code";
            out += c;
            continue;
        }
        out += c === "\n" ? c : " ";
    }
    return out;
}
function scanHuellenFormWand(dateien) {
    const errs = [];
    const alt = /[{,]\s*boxen\s*:|[{,]\s*boxen\s*\}|\{\s*boxen\s*,/g;
    for (const [name, src] of dateien) {
        const code = ohneTexte(src);
        for (const m of code.matchAll(alt)) {
            const zeile = code.slice(0, m.index + m[0].indexOf("boxen")).split("\n").length;
            errs.push(
                `Hüllen-Form-Wand: ${name}:${zeile} gibt dem Wirt die alte Hüllen-Zeile (boxen) — die EINE Form trägt teile (N5, _huelleVon)`
            );
        }
    }
    return errs;
}
// DIE ORTS-WAND: eine Probe, die Spieler, Kamera oder Tier an ein Zahlen-Literal (x, z) setzt, trägt
// einen Ort der Welt, in der sie geschrieben wurde — die Landform des Kerns verschob ihn, und drei Gruppen der CI wurden rot
// (der Biss am Hang, der Baum im Haus, die Ankunft im Ursprung). Der Ort kommt aus der Welt (die nächste ebene Stelle, der
// nächste See, `_weltBetreten`), oder die Zeile ist als Bühnen-Station deklariert: `// BÜHNE: <Grund>` auf ihr oder in den
// zwei Zeilen darüber (der Grund sagt, warum der Ort nichts trägt — eigene Szene, Mechanik, nur der Abstand zählt).
// Gelesen wird der Code ohne Kommentare; rot mit Datei:Zeile.
// DIE KLASSE, nicht der Aufruf (Prüfung K16 Runde 2): der Ort reist selten als Literal IM Aufruf — er steht als Orts-
// Tabelle (`{ id: "ufer", x: -872, z: -1127 }`, kamera-laub), als Versatz-Liste (`[[-50, 60], [30, 0]]` um den Start,
// kampf-gefuehl), als Messort-Konstante (`const MESS = { x: -640, z: -410 }`, `o.mess || [-640, -410]`) und wird erst Zeilen
// später gesetzt. In einer Setz-Probe (die Datei setzt Spieler, Kamera oder Tier: `.position.set(`, `.position.x =`,
// `spawnCreatureAt(`) ist darum JEDES Orts-Paar aus Zahlen-Literalen rot — ein Objekt mit x und z, ein Paar als Wert,
// Vorgabe oder Glied einer Liste —, sobald es weiter als `ORT_NAH_M` vom Ursprung seines Bezugs zeigt (darunter liegt die
// Mechanik am gelesenen Ort: der Wolf 1,3 m vor dem Reh). Ein Bau-Ort (`spawnArchitecture`, `spawnSettlement`) trägt das
// Platz-Gesetz des Stamms und ist nicht gemeint. Der Messort der Band-Serie kommt aus EINER Quelle (spec/profiband/
// haushalt.json, `scripts/lib/messort.cjs`), nie als Abschrift.
const ORT_LIT = String.raw`-?\d+(?:\.\d+)?`;
const ORT_MITTE = String.raw`(?:[^,;()]|\((?:[^()]|\([^()]*\))*\))*?`;
const ORT_NAH_M = 20;
const ORTS_MUSTER = [
    new RegExp(
        String.raw`\b(?:playerMesh|pm|camera|cam|kam|kamera|character|tier|wolf|reh|creature|kreatur|phantom)\.position\.set\(\s*${ORT_LIT}\s*,${ORT_MITTE},\s*${ORT_LIT}\s*\)`,
        "g"
    ),
    new RegExp(String.raw`\bspawnCreatureAt\(\s*${ORT_LIT}\s*,${ORT_MITTE},\s*${ORT_LIT}\s*[,)]`, "g"),
    new RegExp(String.raw`\b(?:playerMesh|pm)\.position\.[xz]\s*=\s*${ORT_LIT}\s*;`, "g"),
];
const ORT_SENKE = /\.position\.(?:set\s*\(|[xz]\s*=(?!=))|\bspawnCreatureAt\s*\(/;
const ORT_BAU = /\b(?:spawnArchitecture|spawnSettlement|_spawnSettlementFromExport|materializePortalHall)\s*\(/;
const ORTS_PAARE = [
    // die Orts-Tabelle und die Messort-Konstante: ein Objekt mit x und z aus Literalen
    new RegExp(String.raw`\{[^{}]*?\bx\s*:\s*(${ORT_LIT})\s*,(?:[^{}]*?,)?\s*z\s*:\s*(${ORT_LIT})\s*[,}]`, "g"),
    // das Paar als Wert, Vorgabe oder Listen-Glied (die Versatz-Liste) — nur unter einem Orts-Namen (`ORT_NAME`): ein Paar
    // unter `hue`, `dolch` oder `SONNEN` ist ein Band, kein Ort
    new RegExp(String.raw`(?:[=:(,[]|\|\||\?\?)\s*\[\s*(${ORT_LIT})\s*,\s*(${ORT_LIT})\s*\]`, "g"),
];
// ein Orts-Name ist ein Wort-Glied (ganz, am Anfang vor einem Groß-Glied, oder ein Groß-Glied im camelCase): `ortR`, `mess`,
// `startOrte`, `MESS_ORT` — nie ein Teil (`SEEDS`, `sorted`); die Wasser-Wörter fehlen bewusst (in klang tragen `ufer` und
// `fluss` Frequenz-Bänder, die Orte des Wassers liefert `__wasserOrte`)
const ORT_WORT =
    "ort|orte|mess|messort|spieler|start|ziel|pos|anker|stelle|lichtung|hang|versatz|station|wiese|platz|kandidat|kandidaten";
const ORT_NAME = {
    test: (n) =>
        new RegExp(String.raw`^(?:${ORT_WORT})$`, "i").test(n) ||
        new RegExp(String.raw`^(?:${ORT_WORT})[A-Z0-9_]`).test(n) ||
        new RegExp(String.raw`^(?:${ORT_WORT.toUpperCase()})_`).test(n) ||
        new RegExp(
            String.raw`[a-z0-9](?:${ORT_WORT.replace(/(^|\|)(\w)/g, (_, a, b) => a + b.toUpperCase())})(?:[A-Z0-9_]|$)`
        ).test(n),
};
// der Name, unter dem ein Paar steht: der Schlüssel oder die Bindung direkt davor, im Listen-Glied die der Liste (die
// erste offene Klammer rückwärts), in der Vorgabe (`a.mess || [...]`) der linke Name
function ortsName(code, i) {
    let tiefe = 0;
    let j = i;
    const kopf = code.slice(Math.max(0, i - 80), i + 2);
    const direkt = /([A-Za-z_$][\w$]*)\s*(?:[:=]|\|\||\?\?)\s*\[?$/.exec(kopf.replace(/\s+$/, ""));
    if (direkt) return direkt[1];
    for (; j > 0 && i - j < 4000; j--) {
        const c = code[j];
        if (c === "]") tiefe++;
        else if (c === "[") {
            if (tiefe === 0) break;
            tiefe--;
        }
    }
    const m = /([A-Za-z_$][\w$]*)\s*[:=]\s*(?:\w+\s*\?\s*)?$/.exec(code.slice(Math.max(0, j - 80), j));
    return m ? m[1] : "";
}
// DIE ABSCHRIFT DES MESSORTS: der Platz eines Band-Orts ohne Anker und ohne eigene Welt (die Mess-Wiese, das
// Dorf) steht NUR im Haushalt (spec/profiband/haushalt.json, gelesen über scripts/lib/welt-orte.cjs `messort`) — und
// ein gefallener Platz nirgends mehr. Zwei Zahlen-Literale, die ihn nennen (x, dann z binnen 60 Zeichen, Code ohne
// Kommentare), sind eine Abschrift, gleich in welcher Form und ob die Datei setzt: `stelle(x, z)`, `umstellen(x, z)`,
// `const X = x, Z = z`, die Blick-Tabelle einer Linse.
const MESSORT_GEFALLEN = [[-900, -850]]; // die Mess-Wiese bis K55
function messortPaare() {
    const h = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "spec", "profiband", "haushalt.json"), "utf8"));
    return h.messorte
        .filter((o) => !o.anker && !o.bank && Array.isArray(o.spieler))
        .map((o) => o.spieler)
        .concat(MESSORT_GEFALLEN);
}
const zahlRe = (v) => String.raw`(?<![\w.])` + String(v).replace(/[.]/g, String.raw`\.`) + String.raw`(?![\d.])`;
function scanOrtsWand(dateien) {
    const errs = [];
    const abschrift = messortPaare().map((p) => ({ p, re: new RegExp(zahlRe(p[0]) + String.raw`[\s\S]{0,60}?` + zahlRe(p[1]), "g") }));
    for (const [name, src] of dateien) {
        if (name === "scripts/diag-altlasten.cjs") continue; // die Wand selbst trägt ihre Selbsttest-Sätze als Text
        const code = stripComments(src);
        const roh = src.split("\n");
        const zeilen = code.split("\n");
        const buehne = (zeile) => /\/\/\s*BÜHNE:\s*\S/.test(roh.slice(Math.max(0, zeile - 3), zeile).join("\n"));
        for (const { p, re } of abschrift)
            for (const m of code.matchAll(re)) {
                const zeile = code.slice(0, m.index).split("\n").length;
                if (buehne(zeile)) continue;
                errs.push(
                    `Orts-Wand: ${name}:${zeile} Abschrift des Messorts ${p.join("/")} (${m[0].replace(/\s+/g, " ").slice(0, 60)}) — der Ort kommt aus spec/profiband/haushalt.json (scripts/lib/welt-orte.cjs messort), oder die Zeile trägt // BÜHNE: <Grund>`
                );
            }
        for (const re of ORTS_MUSTER)
            for (const m of code.matchAll(re)) {
                const zeile = code.slice(0, m.index).split("\n").length;
                if (buehne(zeile)) continue;
                errs.push(
                    `Orts-Wand: ${name}:${zeile} setzt an ein Zahlen-Literal (${m[0].replace(/\s+/g, " ").slice(0, 60)}) — der Ort kommt aus der Welt, oder die Zeile trägt // BÜHNE: <Grund>`
                );
            }
        if (!ORT_SENKE.test(code)) continue;
        for (const re of ORTS_PAARE)
            for (const m of code.matchAll(re)) {
                if (Math.max(Math.abs(Number(m[1])), Math.abs(Number(m[2]))) < ORT_NAH_M) continue;
                if (re === ORTS_PAARE[1] && !ORT_NAME.test(ortsName(code, m.index))) continue;
                // die Zeile des Paars selbst (das Listen-Glied beginnt mit dem Komma der Zeile davor)
                const at = re === ORTS_PAARE[1] ? m.index + m[0].lastIndexOf("[") : m.index;
                const zeile = code.slice(0, at).split("\n").length;
                const vor = zeilen[zeile - 1].slice(0, at - code.lastIndexOf("\n", at - 1) - 1 + m[0].length);
                if (ORT_BAU.test(vor) || buehne(zeile)) continue;
                errs.push(
                    `Orts-Wand: ${name}:${zeile} trägt einen Ort als Zahlen-Paar (${m[0].replace(/\s+/g, " ").trim().slice(0, 60)}) in einer Setz-Probe — der Ort kommt aus der Welt, oder die Zeile trägt // BÜHNE: <Grund>`
                );
            }
    }
    return errs;
}
function wirtsDateien(root, files) {
    const gesehen = new Set();
    const aus = [];
    for (const f of files.concat(gateDateien(root).map(([n]) => path.join(root, n)))) {
        const n = path.relative(root, f).split(path.sep).join("/");
        if (gesehen.has(n)) continue;
        gesehen.add(n);
        aus.push([n, fs.readFileSync(f, "utf8")]);
    }
    return aus;
}
// die Kapitel des Playtests (scripts/playtest) — die Warte-Wand liest sie mit
function playtestDateien(root) {
    const d = "scripts/playtest";
    return fs.readdirSync(path.join(root, d)).filter((f) => /\.cjs$/.test(f)).map((f) => [`${d}/${f}`, fs.readFileSync(path.join(root, d, f), "utf8")]);
}
function gateDateien(root) {
    const aus = [];
    for (const d of ["scripts", "scripts/lib"])
        for (const f of fs.readdirSync(path.join(root, d)))
            if (/\.cjs$/.test(f)) aus.push([d + "/" + f, fs.readFileSync(path.join(root, d, f), "utf8")]);
    return aus;
}

// DIE LINSEN TRAGEN DIE WAND MIT: eine Linse in scripts/lib ruft die Stamm-Methoden in der Seite — ein
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

// DIE STAMM-LESER-WAND (Stamm-Zerlegung): der Name der Stamm-Datei steht als Lese-Ziel — ein String-
// Literal, das die Datei nennt („anazhRealm.js", „/anazhRealm.js", „http://…/anazhRealm.js", mit ?v=) — nur in
// scripts/lib/stamm.cjs. Jeder andere Leser liest den Stamm über die EINE Schnittstelle (stammLib.text · dateien · liefere
// · dateiMit · ort): ein Leser am Namen vorbei sähe nach dem Schnitt nur den Kern (vakuum-grün) oder bräche erst im
// Fenster. Kommentare und Meldungen („anazhRealm.js: … fehlt") dürfen den Namen tragen; gezählt wird je Literal-Token.
const STAMM_NAME_RX = new RegExp(
    "^(?:\\.{0,2}/|https?://[^/]*/)?" + stammLib.ALT.replace(/\./g, "\\.") + "(?:\\?[^\"'`]*)?$"
);
// Ausgenommen: die Schnittstelle selbst.
const STAMM_WERKZEUG = ["scripts/lib/stamm.cjs"];
function stammLeserDateien(root) {
    const aus = [];
    for (const f of fs.readdirSync(root)) if (/\.(?:c|m)?js$/.test(f) && !stammLib.istStammDatei(f)) aus.push(f);
    const geh = (d) => {
        for (const e of fs.readdirSync(path.join(root, d), { withFileTypes: true })) {
            const rel = d + "/" + e.name;
            if (e.isDirectory()) geh(rel);
            else if (/\.(?:c|m)?js$/.test(e.name) && !STAMM_WERKZEUG.includes(rel)) aus.push(rel);
        }
    };
    geh("scripts");
    return aus;
}
function scanStammLeser(root, ersatz = {}) {
    const acorn = require("acorn");
    const errs = [];
    const dateien = stammLeserDateien(root).concat(
        Object.keys(ersatz).filter((f) => !fs.existsSync(path.join(root, f)))
    );
    for (const rel of dateien) {
        const src = rel in ersatz ? ersatz[rel] : fs.readFileSync(path.join(root, rel), "utf8");
        // Vorfilter: der Name als Text oder als Regex-Quelle (anazhRealm\.js)
        if (!src.includes(stammLib.ALT) && !src.includes(stammLib.ALT.replace(".", "\\."))) continue;
        let toks = null;
        for (const sourceType of ["script", "module"])
            try {
                toks = [
                    ...acorn.tokenizer(src, {
                        ecmaVersion: "latest",
                        sourceType,
                        locations: true,
                        allowHashBang: true,
                        allowReturnOutsideFunction: true,
                    }),
                ];
                break;
            } catch {
                toks = null;
            }
        if (!toks) {
            errs.push(`Stamm-Leser-Wand: ${rel} ist für acorn unlesbar — die Wand sähe ihre Leser nicht`);
            continue;
        }
        for (const t of toks) {
            if (
                (t.type === acorn.tokTypes.string || t.type === acorn.tokTypes.template) &&
                STAMM_NAME_RX.test(String(t.value))
            )
                errs.push(
                    `Stamm-Leser-Wand: ${rel}:${t.loc.start.line} nennt ${JSON.stringify(t.value)} als Lese-Ziel — der Stamm ` +
                        `liest sich über scripts/lib/stamm.cjs (stammLib.text · dateien · liefere · dateiMit · ort)`
                );
            // ein Stapel-Leser (Rahmen „…/anazhRealm.js:12:5" im Error-Stack, in der Seite) sieht auch die Zonen-Dateien
            if (
                t.type === acorn.tokTypes.regexp &&
                t.value.pattern.includes("anazhRealm\\.js") &&
                !t.value.pattern.includes("stamm\\/")
            )
                errs.push(
                    `Stamm-Leser-Wand: ${rel}:${t.loc.start.line} liest Rahmen nur an /${t.value.pattern}/ — nach dem Schnitt ` +
                        `stehen sie in den Dateien unter stamm/ (das Muster trägt \`\\/stamm\\/[a-z0-9-]+\\.js\` mit)`
                );
        }
    }
    return errs;
}

function main() {
    const root = path.join(__dirname, "..");
    // AUGEN-GLUT-SCHNITT: foundry-core (der Ofen/Bäcker) steht mit in
    // der Wand — Phantom-Leser-Namen dürfen auch dort nicht nachwachsen. Der Welt-March im WGSL (feld-wgsl.js) fiel
    // mit K16 samt dem trilinearen Brick-March (feldTriAbtast/feldTriGrad; die Rückkehr-Wand ist die EINE).
    const files = [...STAMM, "voxel-worker.js", "index.html", "signaling-server.js", "foundry-core.js"]
        .map((f) => path.join(root, f))
        .concat(linsenDateien(root));

    if (process.argv.includes("--selftest")) {
        // Die Instanz-Wand muss feuern: ein zweiter Bau am Chokepoint vorbei.
        const stamm = stammLib.text(root);
        const instanzFeuert =
            scanInstanzWand(stamm).length === 0 &&
            scanInstanzWand(stamm + "\nconst x = new THREE.InstancedMesh(g, m, 64);\n").length === 1 &&
            scanInstanzWand(stamm + "\nconst T = THREE;\nconst x = new T.InstancedMesh(g, m, 1);\n").length === 1;
        if (!instanzFeuert) {
            console.log("❌ SELBST-TEST: die Instanz-Wand feuert nicht (oder steht heute rot)");
            process.exit(1);
        }
        // Die Entsorgungs-Wand muss feuern — je Form ein Täter, jeder beim Namen (und ein Kommentar darf sie erzählen):
        //   A traverse-Schleife · B Kind-Schleife for…of mit direktem geometry.dispose() · C children.forEach ·
        //   D Zwischen-Variable · E reine Stoff-Schleife material.forEach · F for…of über die Stoff-Liste · G der Regel-
        //   Besitzer entsorgt einen Stoff (Stoffe nie) · H eine tote Zeile der Besitzer-Liste
        const taeter = (name, rumpf) =>
            stammLib.ersetze(stamm, null,
                "class AnazhRealm {\n",
                `class AnazhRealm {\n    // früher: o.geometry.dispose() in jeder Bühne\n    ${name}(o) {\n${rumpf}\n    }\n`
            );
        const regelAnker =
            "            if (node.geometry && !(node.userData && node.userData.sharedGeom)) this._queueDispose(node.geometry);";
        const formen = [
            ["A", taeter("_frostFormA", "        o.traverse((x) => x.geometry && this._queueDispose(x.geometry));"), /`_frostFormA` entsorgt Geometrie/],
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
                    ? stammLib.ersetze(stamm, "_disposeSoulGroup",
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
                stammLib.ersetze(stamm, null,
                    /(\n {4}_karteAblage\([^)]*\) \{)/,
                    '$1\n        const cv = document.createElement("canvas");'
                )
            ).length === 1;
        if (!kartenFeuert) {
            console.log("❌ SELBST-TEST: die Karten-Wand feuert nicht (oder steht heute rot)");
            process.exit(1);
        }
        // Das Absenz-Erbe muss feuern: der Sprung greift wieder zum Physik-Körper.
        const erbeFeuert =
            scanAbsenzErbe(stamm).length === 0 &&
            scanAbsenzErbe(stammLib.ersetze(stamm, null, /(\n {4}handleJump\([^)]*\) \{)/, "$1\n        const k = this.playerBody;"))
                .length === 1;
        if (!erbeFeuert) {
            console.log("❌ SELBST-TEST: das Absenz-Erbe feuert nicht (oder steht heute rot)");
            process.exit(1);
        }
        // Die Normal-Wand muss feuern: eine Welt-Normale, mit der transponierten Kamera-Matrix gedreht.
        // Dazu die Quelle: der Boden-Graph liest wieder r184s `normalWorld`, transitiv über `_nWG` (die
        // Geometrie-Normale des Graphen, beim Boden die des Stufen-Morphs, K51-2).
        const quelleAlt = stammLib.ersetze(stamm, "_buildPbrNodeMaterial",
            "const _nWG = opts.geomorph ? this._bodenStufenKnoten().normalWelt : _Tn.normalWorldGeometry;",
            "const _nWG = _Tn.normalWorld;"
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
        // Die Stufen-Wand muss feuern: buildInstance bildet die Stufe selbst ab, und emitTree
        // verliert die Abbildung (das Labor bekäme wieder ein anderes Rezept als die Welt).
        const kern = fs.readFileSync(path.join(root, "foundry-core.js"), "utf8");
        const zweite = scanStufenWand(kern.replace("__lod = lod;", "__lod = lod <= 1 ? 1 : lod;"));
        const ohne = scanStufenWand(
            kern
                .replace("__lod = stufenRezept(P.kind, stufe);", "")
                .replace(
                    "return core.treeParams({ api, delta, slim, trop, leaf }, SEED, __lod, pre, __weltSkalaArt(CURRENT));",
                    'return core.treeParams({ api, delta, slim, trop, leaf }, SEED, stufenRezept("tree", __lod), pre, __weltSkalaArt(CURRENT));'
                )
        );
        const stufenFeuert =
            scanStufenWand(kern).length === 0 &&
            zweite.some((e) => /zweite Bedeutung/.test(e) && /__lod = lod <= 1/.test(e)) &&
            ohne.some((e) => /stufenRezept\(P\.kind, stufe\);` steht 0×/.test(e)) &&
            ohne.some((e) => /SEED, __lod, pre, __weltSkalaArt\(CURRENT\)\);` steht 0×/.test(e));
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
            scanPortWand([["scripts/diag-y.cjs", `// früher: ${geteilt}\nconst PORT = 1;\n`]]).length === 0 &&
            scanPortWand([["scripts/diag-z.cjs", "const PORT = Number(process.env.Z_PORT || 4" + "312);\n"]]).length === 1 &&
            scanPortWand([["scripts/werkbank.cjs", "const s = 1;\n"]]).length === 1;
        // Die Warte-Wand muss feuern: die Bau-Schleife von gate:fahr-leben bis K-WANDUHR, ein eigener Server-Start; still bleibt das EINE Warten
        // und die Frist: eine neue Frist-Schleife ist rot, der REST steht genau auf seiner Zahl (darunter: senken), ein Zähler auf Takte still
        const warte = (src, rest = {}) => scanWarteWand([["scripts/diag-w.cjs", src]], rest).length;
        const frist = "async () => { const dl = performance.now() + 30000; while (!e.fertig && performance.now() < dl) await tick(); };";
        const warteFeuert =
            scanWarteWand(gates.concat(playtestDateien(root))).length === 0 &&
            warte("async () => { for (let i = 0; i < 60 && !e.instanced && !e.mesh; i++) await sleep(50); };") === 1 &&
            warte("for (let s = 0; s < g.mesh.count; s++) n++;") === 0 &&
            warte(frist) === 1 &&
            warte("async () => { while (Date.now() - t0 < FRIST) await sleep(150); };") === 1 &&
            warte("async () => { for (;;) { if (Date.now() - t0 > 9000) break; await tick(); } };") === 1 &&
            warte('async () => { await window.__gebautNach("x").catch(() => {}); };') === 1 &&
            ["8000 }).catch(() => {})", "0 }).catch(() => {})", "9 }).catch((e) => { throw e; })"].map((f) => warte(`page.waitForFunction(() => 1, { timeout: ${f};`)).join() === "1,0,0" &&
            warte(frist, { "scripts/diag-w.cjs": 1 }) === 0 &&
            warte(frist, { "scripts/diag-w.cjs": 2 }) === 1 &&
            warte("async () => { for (let n = 0; !e.fertig && n < 120; n++) await tick(); };") === 0 &&
            eigenBoots([["scripts/diag-s.cjs", 'spawn("node", ["save-server.js"]);']]).length === 1;
        if (!warteFeuert) {
            console.log("❌ SELBST-TEST: die Warte-Wand feuert nicht (oder steht heute rot)", scanWarteWand(gates));
            process.exit(1);
        }
        if (!portFeuert) {
            console.log("❌ SELBST-TEST: die Port-Wand feuert nicht (oder steht heute rot)", scanPortWand(gates));
            process.exit(1);
        }
        console.log(`✅ SELBST-TEST: die Port-Wand feuert (${gates.length} Gate-Dateien, DIAG_PORT erkannt)`);
        // Die Boot-Wand muss feuern: ein neuer Eigen-Start (Browser oder Server) ist rot, ein Kommentar und ein Text still,
        // eine Rest-Zeile ohne eigenen Start ist rot (die Liste schrumpft nur), der Baum heute grün.
        const start = "puppeteer" + ".launch({ args: [] })"; // zusammengesetzt: diese Datei trägt selbst keinen Start
        const bootFeuert =
            scanBootWand(gates).length === 0 &&
            scanBootWand([["scripts/diag-neu.cjs", `const b = await ${start};\n`]], []).length === 1 &&
            scanBootWand([["scripts/diag-srv.cjs", "const s = http" + ".createServer((q, r) => r.end());\n"]], []).length === 1 &&
            scanBootWand([["scripts/diag-k.cjs", `// früher: ${start}\nconst t = "${start}";\n`]], []).length === 0 &&
            scanBootWand([["scripts/diag-alt.cjs", "const x = 1;\n"]], ["scripts/diag-alt.cjs"]).length === 1;
        if (!bootFeuert) {
            console.log("❌ SELBST-TEST: die Boot-Wand feuert nicht (oder steht heute rot)", scanBootWand(gates));
            process.exit(1);
        }
        console.log(
            `✅ SELBST-TEST: die Boot-Wand feuert (Eigen-Start und Eigen-Server rot, Kommentar/Text still, tote Rest-Zeile rot; Rest ${BOOT_REST.length})`
        );
        // Die Rekursions-Wand muss feuern: Pfeil (der Täter von f5851596), await, Funktion, Methode über this — Basisfall, Kommentar und fremder Ruf still
        const rek = (src) => scanRekursionsWand([["scripts/diag-r.cjs", src]]).length;
        if (scanRekursionsWand(gateDateien(root)).length || rek("const e = (a) => e(a);\nconst f = async (o) => await f(o);\nfunction g(x) {\n    return g(x);\n}\nclass K {\n    m(a) {\n        return this.m(a);\n    }\n}\n") !== 4 || rek("// const e = (a) => e(a);\nconst h = (n) => (n ? h(n - 1) : 0);\nconst k = (a) => a.e || k2(a);\n"))
            process.exit(console.log("❌ SELBST-TEST: die Rekursions-Wand feuert nicht (oder steht heute rot)") || 1);
        console.log("✅ SELBST-TEST: die Rekursions-Wand feuert (Pfeil, await, Funktion, Methode rot; Basisfall, Kommentar, fremder Ruf still)");
        // Die Hüllen-Form-Wand muss feuern: die alte Zeile als Schlüssel und als Kurzform, über eine Variable gereicht —
        // ein Kommentar und ein Text (die Kern-Ersetzung) dürfen sie tragen, die Form mit teile ist still.
        const wirt = wirtsDateien(root, files);
        const sockel = "r._hausHuelleSetzen(e, { stufe: 0, boxen: [-2, u, -2, 2, o, 2] });\n";
        const huelleRot = scanHuellenFormWand([
            ["scripts/lib/x.cjs", "const a = 1;\n" + sockel],
            ["scripts/y.cjs", "const h = { stufe, boxen };\nr._hausHuelleSetzen(e, h);\n"],
        ]);
        const huelleStill = scanHuellenFormWand([
            ["scripts/z.cjs", "// " + sockel + "const k = " + JSON.stringify(sockel) + ";\nconst n = boxen.length;\n"],
            ["scripts/w.cjs", 'r._hausHuelleSetzen(e, { stufe: 0, teile: [{ art: "box", rolle: "fest" }] });\n'],
        ]);
        const huelleFeuert =
            scanHuellenFormWand(wirt).length === 0 &&
            huelleRot.length === 2 &&
            /x\.cjs:2 /.test(huelleRot[0]) &&
            /y\.cjs:1 /.test(huelleRot[1]) &&
            huelleStill.length === 0;
        if (!huelleFeuert) {
            console.log(
                "❌ SELBST-TEST: die Hüllen-Form-Wand feuert nicht (oder steht heute rot)",
                scanHuellenFormWand(wirt),
                huelleRot,
                huelleStill
            );
            process.exit(1);
        }
        console.log(
            `✅ SELBST-TEST: die Hüllen-Form-Wand feuert (${wirt.length} Wirts-Dateien, ${huelleRot[0]} · Kurzform erkannt)`
        );
        // Die Orts-Wand: ein eingeschmuggelter Satz an ein Zahlen-Literal wird beim Namen und der Zeile genannt; derselbe Satz
        // als Bühnen-Station deklariert, und ein Ort aus der Welt, bleiben still; die Gates von heute stehen grün.
        // Die KLASSE (Prüfung K16 Runde 2): die drei Formen der echten Täter — die Orts-Tabelle (kamera-laub), die
        // Versatz-Liste (kampf-gefuehl), die Messort-Konstante samt Vorgabe (sicht-arbeit, wasser-linse) — werden in einer
        // Setz-Probe beim Namen rot; ein Frequenz-Band unter `ufer`, ein Bau-Anker im Aufruf und ein Paar ohne Setzen bleiben
        // still.
        const SETZT = "pm.position.set(o.x, 0, o.z);\n";
        const ortsRot = scanOrtsWand([
            ["scripts/o.cjs", "const r = window.anazhRealm;\nr.state.playerMesh.position.set(512, 40, -300);\n"],
            ["scripts/p.cjs", 'r.spawnCreatureAt(80, r.getTerrainHeightAt(80, 80) + 1, -80, "calm");\n'],
            ["scripts/t.cjs", 'const ORTE = [\n    { id: "ufer", x: -872, z: -1127 },\n];\n' + SETZT],
            ["scripts/v.cjs", "const ortR = [\n    [-14, 14],\n    [70, 0],\n].find(eben);\n" + SETZT],
            ["scripts/m.cjs", "const MESS = { x: -640, z: -410 };\n" + SETZT],
            ["scripts/d.cjs", "const [MX, MZ] = o.mess || [-640, -410];\n" + SETZT],
        ]);
        const ortsStill = scanOrtsWand([
            ["scripts/q.cjs", "// BÜHNE: eigene Szene\npm.position.set(512, 40, -300);\n"],
            ["scripts/u.cjs", "const O = r.__ebeneStelle();\npm.position.set(O.x, O.y, O.z);\n"],
            ["scripts/k.cjs", "const BAND = { ufer: [60, 900], SEEDS: [7, 12345] };\n" + SETZT],
            ["scripts/b.cjs", 'r.spawnArchitecture("haus", { x: 400, y: 0, z: 400 });\n' + SETZT],
            ["scripts/w.cjs", "const MESS = { x: -640, z: -410 };\n"],
        ]);
        // DIE ABSCHRIFT DES MESSORTS: der Platz der Mess-Wiese aus dem Haushalt und der gefallene Platz, je als Aufruf und
        // als Konstanten-Paar über zwei Zeilen — rot, auch ohne Setzen; derselbe Platz um 1 m versetzt und hinter BÜHNE still.
        const MW = messortPaare()[0];
        const MG = MESSORT_GEFALLEN[0];
        const abschriftRot = scanOrtsWand([
            ["scripts/a.cjs", `umstellen(${MW[0]}, ${MW[1]});\n`],
            ["scripts/g.cjs", `const X = ${MG[0]},\n    Z = ${MG[1]};\n`],
        ]);
        const abschriftStill = scanOrtsWand([
            ["scripts/e.cjs", `umstellen(${MW[0] + 1}, ${MW[1]});\n`],
            ["scripts/f.cjs", `// BÜHNE: der gefallene Ort als Probe\nstelle(${MG[0]}, ${MG[1]});\n`],
        ]);
        if (
            abschriftRot.length !== 2 ||
            !abschriftRot.every((x) => /Abschrift des Messorts/.test(x)) ||
            abschriftStill.length !== 0
        ) {
            console.log("❌ SELBST-TEST: die Abschrift des Messorts feuert nicht", abschriftRot, abschriftStill);
            process.exit(1);
        }
        const ortsHeute = scanOrtsWand(gateDateien(root));
        const ortsFeuert =
            ortsRot.length === 6 &&
            /o\.cjs:2 /.test(ortsRot[0]) &&
            /p\.cjs:1 /.test(ortsRot[1]) &&
            /t\.cjs:2 /.test(ortsRot[2]) &&
            /v\.cjs:3 /.test(ortsRot[3]) &&
            /m\.cjs:1 /.test(ortsRot[4]) &&
            /d\.cjs:1 /.test(ortsRot[5]) &&
            ortsStill.length === 0 &&
            ortsHeute.length === 0;
        if (!ortsFeuert) {
            console.log(
                "❌ SELBST-TEST: die Orts-Wand feuert nicht (oder steht heute rot)",
                ortsRot,
                ortsStill,
                ortsHeute
            );
            process.exit(1);
        }
        console.log(
            `✅ SELBST-TEST: die Orts-Wand feuert (${ortsRot[0].split(" setzt")[0]} · spawnCreatureAt, Orts-Tabelle, Versatz-Liste, Messort-Konstante und Vorgabe erkannt; BÜHNE, Welt-Ort, Band, Bau-Anker und Paar ohne Setzen still; ${gateDateien(root).length} Gate-Dateien heute grün)`
        );
        // Die Linsen stehen in der Wand: der tote Aufruf der Fernwald-Linse kehrt in eine Kopie zurück und
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
        // Die Stoff-Wand muss feuern: (1) JEDER laute Bruch des Stamms, wieder still gemacht
        // (sein catch meldet nur WARN, die Zeilen bleiben), ist rot an seiner Zeile — die Wand sieht jeden ihrer Schnitte,
        // gleich ob der Versuch TSL liest, ein Render-Objekt baut, den Graphen läuft oder einen Bauer ruft (bis hierher
        // prüfte der Selbsttest drei Methoden, und vier Schnitte fielen still aus der Wand); (2) je Art ein eingeschmuggelter
        // Fang, auch die stillen Fragen (`in`, `!!` frei, `?.`, ein aus TSL gezogenes Glied, das Ergebnis eines
        // Stoff-Bauers), jeder an seiner Zeile; (3) eine tote Zeile der bewussten Zweige ist rot; (4) ein toter
        // Fehler-Marker in einem Prüf-Skript ist rot; der Stamm heute steht ohne Fang. Zwei Läufe der Wand.
        {
            const ast = stammLib.ast(stamm);
            const brueche = [];
            const geh = (n) => {
                let k = null;
                let ort = null;
                if (n.type === "TryStatement" && n.handler) {
                    k = n.handler.body;
                    ort = n.handler;
                } else if (gliedRuf(n, "catch") && n.arguments.length >= 1 && /Function/.test(n.arguments[0].type)) {
                    k = n.arguments[0].body;
                    ort = n.arguments[0];
                } else if (
                    n.type === "AssignmentExpression" &&
                    n.left.type === "MemberExpression" &&
                    !n.left.computed &&
                    /^(onerror|onmessageerror)$/.test(n.left.property.name) &&
                    /Function/.test(n.right.type)
                ) {
                    // der Fehler-Hörer eines Fadens (Fortsetzung der Nachbesserung 2): sein Fang ist sein Rumpf
                    k = n.right.body;
                    ort = n.right;
                }
                if (k && /this\._(stoffBruch|blendeBruch)\(/.test(stamm.slice(k.start, k.end)))
                    brueche.push({ k, zeile: stammLib.zeileVon(stamm, ort.start) });
                kinder(n, geh);
            };
            geh(ast);
            // nur die äußeren Rümpfe: ein innerer Bruch fällt mit seinem äußeren
            const aussen = brueche.filter(
                (b) => !brueche.some((c) => c !== b && c.k.start <= b.k.start && b.k.end <= c.k.end)
            );
            let stumm = stamm;
            for (const b of aussen.slice().sort((x, y) => y.k.start - x.k.start)) {
                const nl = "\n".repeat((stamm.slice(b.k.start, b.k.end).match(/\n/g) || []).length);
                const still =
                    b.k.type === "BlockStatement"
                        ? `{ this.log("still", "WARN");${nl} }`
                        : `this.log("still", "WARN")${nl}`;
                stumm = stumm.slice(0, b.k.start) + still + stumm.slice(b.k.end);
            }
            const erwartet = aussen.map((b) => ({ name: "still gemacht", zeile: b.zeile, muster: /^Fang$/ }));
            const schmuggel = [
                [
                    "in",
                    "const bn = TSL.mx_noise_float(positionWorld.mul(float(0.8)));",
                    'const _hatMx = "mx_noise_float" in TSL; const bn = TSL.mx_noise_float(positionWorld.mul(float(0.8)));',
                    /^Ausstattungs-Wenn$/,
                ],
                [
                    "!! frei",
                    'if (_p("micro") > 0) {',
                    'const _hatF = !!_T.fwidth; if (_p("micro") > 0 && _hatF) {',
                    /^Ausstattungs-Wenn$/,
                ],
                [
                    "?.",
                    "        const ny = T.normalFlat.transformDirection(T.cameraViewMatrix).y;",
                    "        const ny = T.normalFlat?.transformDirection(T.cameraViewMatrix).y;",
                    /^Ausstattungs-Wenn$/,
                ],
                [
                    "Glied aus TSL",
                    "} = TSL;\n            const pp = new PPCtor(",
                    "} = TSL; if (!pass) return null;\n            const pp = new PPCtor(",
                    /^Ausstattungs-Wenn$/,
                ],
                [
                    "Stoff-Bauer gefragt",
                    "albedo = albedo.mul(this._ensureSeasonUniforms().uSeasonMul);",
                    "const _su = this._ensureSeasonUniforms(); if (_su) albedo = albedo.mul(_su.uSeasonMul);",
                    /^Null-Knoten$/,
                ],
                [
                    "Null-Knoten (Aufrufer)",
                    "mat.maskNode = _durch;",
                    "if (_durch) mat.maskNode = _durch;",
                    /^Null-Knoten$/,
                ],
                [
                    "Null-Knoten (Bauer)",
                    "const lu = this._ensureLodUniforms();\n        const A = {",
                    "const lu = this._ensureLodUniforms(); if (!lu.uKamAuge) return null;\n        const A = {",
                    /^Null-Knoten$/,
                ],
                [
                    "Fehler-Variable",
                    "mat.alphaTest = globalThis.__phytoCore.KARTEN_GESETZ.schwelle;",
                    "window.__karteError = null; mat.alphaTest = globalThis.__phytoCore.KARTEN_GESETZ.schwelle;",
                    /^Fehler-Variable$/,
                ],
                // Nachbesserung 3: der Fang des Loops ohne Melder (sein Kommentar bleibt stehen), der Melder meldet INFO, der
                // tote catch an r184s synchronem render(), der stille Ausstieg der Manifest-Kette
                [
                    "Loop-Fang ohne Melder",
                    "            } catch (err) {\n                // Ein Frame-Fehler erstarrt die Welt NICHT mehr (V18.278) — abfangen, loggen, weiter.\n                this._loopErrorBoundary(err);",
                    '            } catch (err) {\n                // Ein Frame-Fehler erstarrt die Welt NICHT mehr (V18.278) — abfangen, loggen, weiter.\n                this.log(String(err), "WARN");',
                    /^Fang$/,
                ],
                [
                    "Melder meldet INFO",
                    '            this.log(text, "ERROR");\n            return;',
                    '            this.log(text, "INFO");\n            return;',
                    /^Fang$/,
                ],
                [
                    "toter Render-catch",
                    '        this._buehneRender(p.renderer, p.scene, p.camera, "Werkstatt-Vorschau");',
                    '        const rr = this._buehneRender(p.renderer, p.scene, p.camera, "Werkstatt-Vorschau"); if (rr && typeof rr.catch === "function") rr.catch((e) => this.log(String(e), "INFO"));',
                    /^Fang$/,
                ],
                [
                    // (B3a: die Manifest-Kette fiel — der Faden liest sein Manifest selbst; die Kette des Voxel-Fadens trägt den Fall)
                    "stiller Ausstieg der Kette",
                    "            .then((src) => {\n                // V18.112",
                    "            .then((src) => { if (!src) return;\n                // V18.112",
                    /^Fang$/,
                ],
                // Prüfer K22-3: der Melder ohne Frist und die Frist, die INFO meldet (die Fänge um die Stufen-Stempel, die
                // Buch-Anfrage und den Faden-Start prüft (1): jeder laute Bruch still gemacht)
                [
                    "Melder ohne Frist",
                    "        e.n++;\n        e.still++;\n        if (e.frist != null) return;\n        e.frist = setTimeout(() => {",
                    "        e.n++;\n        e.still++;\n        if (e.frist != null) return;\n        e.frist = (() => {",
                    /^Fang$/,
                ],
                [
                    "Frist meldet INFO",
                    '            this.log(`${text} (wieder: ${e.still}× seit der letzten Meldung, ${e.n}× insgesamt)`, "ERROR");',
                    '            this.log(`${text} (wieder: ${e.still}× seit der letzten Meldung, ${e.n}× insgesamt)`, "INFO");',
                    /^Fang$/,
                ],
                [
                    "Uhr-Deckel",
                    "        await f.buchDa;",
                    "        for (let _w = 0; _w < 40 && !f.recipes; _w++) await new Promise((r) => setTimeout(r, 50));",
                    /^Uhr-Deckel$/,
                ],
            ];
            const fehltAnker = [];
            for (const [name, alt, neu, muster] of schmuggel) {
                const t = stammLib.treffer(stumm, null, alt);
                if (!t) {
                    fehltAnker.push(name);
                    continue;
                }
                const i = t.index;
                erwartet.push({ name, zeile: stumm.slice(0, i).split("\n").length, muster });
                stumm = stumm.slice(0, i) + neu + stumm.slice(i + alt.length);
            }
            const heute = scanStoffWand(stamm);
            const { funde, tot } = stoffFaenge(
                stumm,
                STOFF_ZWEIGE.concat([{ methode: "_gibtEsNicht", art: "Fang", anker: "catch", grund: "Selbsttest" }])
            );
            const blind = erwartet.filter((e) => !funde.some((f) => f.zeile === e.zeile && e.muster.test(f.art)));
            const totFeuert = tot.length === 1 && tot[0].methode === "_gibtEsNicht";
            const marker = toteMarker([
                { datei: "probe.cjs", text: "out.ok = !window.__probeError;\nwindow.__lebtFehler = [];" },
            ]);
            const markerFeuert = marker.length === 1 && /__probeError/.test(marker[0]);
            // (5) DIE TIEFE UND DER PFAD (Nachbesserung 2): eingeschmuggelte Methoden — ein Bauer drei Ruf-Glieder unter
            // dem Versuch (die Hülle hat keine Tiefe), ein `return null` vor dem Bruch, ein toter Bruch nach `return`, ein
            // Helfer, der nur bedingt wirft, ein Bruch, der erst im Zeitgeber läuft: jeder ist rot. Und die Gegenprobe: ein
            // Bauer, den der Versuch nur ABLEGT (`{ render: () => … }`, ein Hörer), ist nie ein Fund (die Hülle lief sonst
            // über die UI-Räume vom Chat bis in die Kreatur-Aura).
            const MESH = "this.state.scene.add(new THREE.Mesh(g, new THREE.MeshBasicMaterial()));";
            const tiefSchmuggel = [
                ["drei Ruf-Glieder tief", 'try { this._sgTief1(g); } catch (e) { this.log("still", "WARN"); }'],
                [
                    "return null vor dem Bruch",
                    `try { ${MESH} } catch (e) { if (!this.state.scene) return null; this._stoffBruch("x", e); }`,
                ],
                ["toter Bruch nach return", `try { ${MESH} } catch (e) { return null; this._stoffBruch("x", e); }`],
                ["Helfer wirft nur bedingt", `try { ${MESH} } catch (e) { this._sgHelfer(e); }`],
                [
                    "Bruch erst im Zeitgeber",
                    `try { ${MESH} } catch (e) { setTimeout(() => this._stoffBruch("x", e), 1); }`,
                ],
                ["Bruch nur im Zweig", `try { ${MESH} } catch (e) { if (e && e.stoff) throw e; }`],
                // der Studio-Faden: ohne Fehler-Hörer, und ein stiller Hörer an einem Faden, der nur den Leser des
                // Foundry-Fadens ruft (der Bäcker liefert so seine Karte)
                ["Faden ohne Hörer", 'const w = new Worker("x"); w.onmessage = () => this._sgTief3(g);'],
                [
                    "Hörer schweigt am Leser",
                    'const w = new Worker("x"); w.onerror = () => {}; w.onmessage = (ev) => this._foundryAntwort(g, ev.data);',
                ],
            ];
            const helfer =
                "    _sgTief1(g) { return this._sgTief2(g); }\n    _sgTief2(g) { return this._sgTief3(g); }\n" +
                "    _sgTief3(g) { return new THREE.Mesh(g, null); }\n" +
                "    _sgHelfer(e) { if (this.state.strikt) throw e; return null; }\n" +
                '    _sgAblage(g) { try { this._uiRooms = { x: { render: () => this._sgTief1(g) } }; window.addEventListener("x", () => this._sgTief3(g)); } catch (e) {} }\n' +
                '    _sgKlang(g) { const w = new Worker("k"); w.onerror = () => {}; w.onmessage = (ev) => { this._sgZahl = ev.data; }; }\n';
            const tiefAnker = (stammLib.treffer(stamm, null, "    // Studio-Dither-Blende als TSL-Knoten") || { index: -1 }).index;
            const tiefQuelle =
                stamm.slice(0, tiefAnker) +
                helfer +
                tiefSchmuggel.map(([, k], i) => `    _sgFang${i}(g) { ${k} }\n`).join("") +
                stamm.slice(tiefAnker);
            const tiefFunde = tiefAnker < 0 ? [] : stoffFaenge(tiefQuelle).funde.filter((f) => /^_sg/.test(f.methode));
            const pfadBlind = tiefSchmuggel
                .filter((_, i) => !tiefFunde.some((f) => f.methode === `_sgFang${i}` && f.art === "Fang"))
                .map(([n]) => n);
            const ablageRot = tiefFunde
                .filter((f) => !/^_sgFang\d$/.test(f.methode))
                .map((f) => `${f.methode}: ${f.was}`);
            if (
                heute.length ||
                blind.length ||
                fehltAnker.length ||
                !totFeuert ||
                !markerFeuert ||
                aussen.length < 20 ||
                tiefAnker < 0 ||
                pfadBlind.length ||
                ablageRot.length
            ) {
                console.log("❌ SELBST-TEST: die Stoff-Wand ist blind (oder steht heute rot)", {
                    heute: heute.slice(0, 5),
                    blind: blind.slice(0, 8).map((e) => `${e.name} :${e.zeile}`),
                    fehltAnker,
                    tot,
                    marker,
                    brueche: aussen.length,
                    tiefAnker,
                    pfadBlind,
                    ablageRot,
                });
                process.exit(1);
            }
            console.log(
                `✅ SELBST-TEST: die Stoff-Wand sieht jeden ihrer ${aussen.length} lauten Brüche still gemacht an seiner Zeile, ` +
                    `${schmuggel.length} Schmuggel je Art (${schmuggel.map((x) => x[0]).join(" · ")}), ` +
                    `${tiefSchmuggel.length} Schmuggel in Tiefe und Pfad (${tiefSchmuggel.map((x) => x[0]).join(" · ")}), ` +
                    `die Ablage (Objekt-Wert, Hörer) und den Faden ohne Bau still, die tote Zweig-Zeile und den toten Fehler-Marker; heute 0`
            );
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
        // Die Zwillings-Wand muss feuern (K09a, Prüfung 1): die kontinentale Basis in der Schreibweise der Farb-Pfade
        // (`(x + _wpX) * 0.00014 + 7.2`), die Massiv-Maske im Stamm und eine Linse mit eigener Tarn-Mulde — je beim Namen
        // samt Zeile; ein Kommentar darf jeden Abdruck zitieren.
        const probe = "const state = {};\n";
        const feuert = (datei, zeile, re) =>
            scanZwillinge({ [datei]: probe + zeile + "\n" }).some((e) =>
                new RegExp(`${datei.replace(/[.]/g, "\\.")}:2 trägt wieder .*${re}`).test(e)
            );
        const still = (datei, zeile) =>
            !scanZwillinge({ [datei]: probe + "// " + zeile + "\n" }).some((e) => e.includes(datei + ":"));
        const cont0 = "const c = sandNoise.noise2D((x + _wpX) * lc + 7.2, (z + _wpZ) * lc + 3.8);";
        const maske = "const ax = rxA / anker.massivAspect;";
        const mulde = "tarns.push({ x, z, reach2: r * r, twoSig2: 2 * s * s });";
        // K16b: das Schicht-Verfahren im Makro-Worker des Studios, das Raster im Panel und in der Linse
        const schicht = "maske[k] = G.grossform(L, x, z).stil >= 0.8 ? 1 : 0;";
        const zwillingFeuert =
            feuert("worlds/gelaende/makro-worker.js", schicht, "Schicht-Ort der Messung") &&
            feuert("worlds/gelaende/studio.js", "const k = cv.width / (268 * 30);", "Mess-Raster der Statistik") &&
            feuert("scripts/diag-worker-dichte.cjs", "const RAND = Math.round(2000 / SCHRITT);", "Mess-Raster") &&
            still("worlds/gelaende/makro-worker.js", schicht) &&
            feuert("voxel-worker.js", cont0, "Kontinentalität C") &&
            feuert(STAMM[0], maske, "Massiv-Maske") &&
            feuert("gelaende-core.js", maske, "Massiv-Maske") &&
            feuert("scripts/playtest.cjs", mulde, "Tarn-Mulde") &&
            feuert("gelaende-core.js", mulde, "Tarn-Mulde") &&
            feuert("worlds/terrain/phytogenesis.js", "const t = lit * 0.5 + (1 - wet) * 0.5;", "Wiesen-Tint") &&
            feuert(STAMM[0], "const p = L * 1.08 - rk * 0.85 + m * 0.22;", "Bodenschicht") &&
            still("voxel-worker.js", cont0) &&
            still(STAMM[0], maske) &&
            feuert(WORT_BUCH, "q.writeBuffer(b, 0, a.buffer, a.byteOffset + 0, 4);".repeat(2), "neben 2 .*Wort-Schrift") &&
            feuert(STAMM[0], '"return vec4<f32>(pT.rgb * ((l0c * max(l0d.y, 0.0) + ambientFarbe) * (1.0 / PI)), pT.a);"', "weltLicht") &&
            still(STAMM[0], '"return vec4<f32>(pT.rgb * ((l0c * max(l0d.y, 0.0) + ambientFarbe) * (1.0 / PI)), pT.a);"');
        console.log(
            zwillingFeuert
                ? "✅ SELBST-TEST: die Zwillings-Wand feuert (Kontinentalität im Worker, die gefallene Massiv-Maske in Stamm und Gesetzbuch, die gefallene Tarn-Mulde in Linse und Gesetzbuch, der Wiesen-Tint im Labor, die Bodenschicht im Stamm, die zweite Wort-Schrift, der Lambert-Zwilling im Panorama — je mit Zeile; der Kommentar nicht)"
                : "❌ SELBST-TEST: die Zwillings-Wand feuert nicht"
        );
        if (!zwillingFeuert) process.exit(1);
        // Die Stamm-Leser-Wand muss feuern: ein kanonischer Leser am Namen vorbei, ein Server-Patcher am Pfad und ein
        // Stapel-Leser ohne die Zonen-Dateien in einer Kopie — je beim Namen samt Zeile; Kommentar und Meldung bleiben still.
        const leserDatei = "scripts/diag-stamm-leser-probe.cjs";
        const n = stammLib.ALT;
        const leserRot = scanStammLeser(root, {
            [leserDatei]:
                `const fs = require("fs");\nconst path = require("path");\n` +
                `const s = fs.readFileSync(path.join(__dirname, "..", "${n}"), "utf8");\n` +
                `if (p === "/${n}") x();\n` +
                `if (/${n.replace(".", "\\.")}/.test(rahmen)) y();\n`,
        });
        const leserStill = scanStammLeser(root, {
            [leserDatei]: `// liest ${n}\nconsole.log("${n}: der Leser fehlt");\nif (/${n.replace(".", "\\.")}|\\/stamm\\/\\d\\d[a-z]?\\.js/.test(r)) y();\n`,
        });
        const amOrt = (z) => leserRot.some((e) => e.startsWith(`Stamm-Leser-Wand: ${leserDatei}:${z} `));
        const leserFeuert =
            scanStammLeser(root).length === 0 &&
            leserRot.length === 3 &&
            amOrt(3) &&
            amOrt(4) &&
            amOrt(5) &&
            leserStill.length === 0;
        console.log(
            leserFeuert
                ? `✅ SELBST-TEST: die Stamm-Leser-Wand feuert (Leser am Namen · Patcher am Pfad · Stapel-Leser ohne stamm/ — je mit Zeile; Kommentar, Meldung und das volle Stapel-Muster still; ${stammLeserDateien(root).length} Dateien gesehen)`
                : `❌ SELBST-TEST: die Stamm-Leser-Wand feuert nicht — ${JSON.stringify(leserRot.concat(leserStill)).slice(0, 400)}`
        );
        if (!leserFeuert) process.exit(1);
        process.exit(fired && aliasFeuert ? 0 : 1);
    }

    const errs = scan(files)
        .concat(scanZwillinge())
        .concat(scanLabBuster())
        .concat(scanInstanzWand(stammLib.text(root)))
        .concat(scanEntsorgungsWand(stammLib.text(root)))
        .concat(scanKartenWand(stammLib.text(root)))
        .concat(scanAbsenzErbe(stammLib.text(root)))
        .concat(scanNormalWand(stammLib.text(root)))
        .concat(scanStoffWand(stammLib.text(root)))
        .concat(toteMarker(markerDateien(root)))
        .concat(scanStufenWand(fs.readFileSync(path.join(root, "foundry-core.js"), "utf8")))
        .concat(scanPortWand(gateDateien(root)))
        .concat(scanWarteWand(gateDateien(root).concat(playtestDateien(root))))
        .concat(scanBootWand(gateDateien(root)))
        .concat(scanRekursionsWand(gateDateien(root)))
        .concat(scanOrtsWand(gateDateien(root)))
        .concat(scanHuellenFormWand(wirtsDateien(root, files)))
        .concat(scanStammLeser(root))
        .concat(checkAliasArten());
    if (errs.length) {
        console.log("⛔ DIE RÜCKKEHR-WAND — gefallene Namen im Stamm und in den Linsen:");
        for (const e of errs) console.log("   ❌ " + e);
        process.exit(1);
    }
    console.log(
        `✅ DIE RÜCKKEHR-WAND steht — ${FORBIDDEN.length} gefallene Namen grep=0 in ${files.length} Dateien (Stamm + Linsen in scripts/lib), ${ZWILLINGE.length} Zwillings-Fingerabdrücke wohnen nur im Gesetzbuch, jede InstancedMesh entsteht im EINEN Chokepoint, ${KARTEN_METHODEN.length} Karten-Methoden malen nichts im Haupt-Thread, kein normalNode dreht mit der transponierten Matrix oder liest r184s normalWorld, kein Stoff fängt still (Stoff-Wand: kein schluckender catch im Render-Bau (am Versuch gemessen, die Hülle ohne Tiefe samt Studio-Faden, jeder Pfad bricht, jeder Studio-Faden trägt einen lauten Hörer), keine Fehler-Variable und kein toter Fehler-Marker, kein Wenn um ein TSL-Glied, kein Null-Knoten; ${STOFF_ZWEIGE.length} benannte Zweige mit ihrem Bild (ohne Seite · der Sandbox-Weg des Voxel-Fadens), der EINE Melder meldet jede Meldung ERROR und dieselbe wieder mit Zähler, keine Kette steigt still aus, kein Bau wartet in einer Schleife auf die Uhr), die Bau-Stufe hat EINE Bedeutung (stufenRezept), jedes Gate liest seinen Port aus EINER eigenen Variable, keine Probe setzt Spieler, Kamera oder Tier an ein Zahlen-Literal ohne BÜHNE, kein Wirt gibt eine Hülle in der alten Zeile (boxen statt teile), jede Gruppe mit Welt-Vorlagen entsorgt über die EINE Regel (_disposeSoulGroup), der Name der Stamm-Datei steht als Lese-Ziel nur in scripts/lib/stamm.cjs (${stammLeserDateien(root).length} Dateien gesehen).`
    );
}

main();
