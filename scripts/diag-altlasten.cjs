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
];

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

function scan(files) {
    const errs = [];
    for (const f of files) {
        const raw = fs.readFileSync(f, "utf8");
        const code = stripComments(raw);
        for (const { token, fiel } of FORBIDDEN) {
            let idx = code.indexOf(token);
            if (idx >= 0) {
                const line = code.slice(0, idx).split("\n").length;
                errs.push(`${path.basename(f)}:${line} trägt "${token}" (fiel: ${fiel})`);
            }
        }
    }
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
        process.exit(fired ? 0 : 1);
    }

    const errs = scan(files)
        .concat(checkSoulKeys())
        .concat(scanZwillinge())
        .concat(scanLabBuster())
        .concat(scanInstanzWand(fs.readFileSync(path.join(root, "anazhRealm.js"), "utf8")));
    if (errs.length) {
        console.log("⛔ DIE RÜCKKEHR-WAND — gefallene Namen im Stamm:");
        for (const e of errs) console.log("   ❌ " + e);
        process.exit(1);
    }
    console.log(
        `✅ DIE RÜCKKEHR-WAND steht — ${FORBIDDEN.length} gefallene Namen grep=0, CREATURE_SOULS = exakt [${SOUL_KEYS_EXPECTED.join(" · ")}], ${ZWILLINGE.length} Zwillings-Fingerabdrücke wohnen nur im Gesetzbuch, jede InstancedMesh entsteht im EINEN Chokepoint.`
    );
}

main();
