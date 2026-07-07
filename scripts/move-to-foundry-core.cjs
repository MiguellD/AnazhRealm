// move-to-foundry-core.cjs — P2 KERN-SPLIT-WERKZEUG (deterministisch, acorn-AST).
// Verschiebt (NICHT kopiert) eine Liste benannter Top-Level-Deklarationen aus
// worlds/terrain/phytogenesis.js in eine neue klassische Script-Datei foundry-core.js
// (Repo-Wurzel), die VOR phytogenesis.js geladen wird → die Symbole bleiben global,
// die Shell-Aufrufer ändern sich NULL. Reihenfolge im Zielfile = Quell-Reihenfolge
// (Eval-Abhängigkeiten der const-Deklarationen bleiben erhalten).
//
//   node scripts/move-to-foundry-core.cjs --check   # nur Recon: findet es alle Symbole?
//   node scripts/move-to-foundry-core.cjs --apply    # verschiebt + node --check beide Dateien
const fs = require("fs");
const path = require("path");
const acorn = require("acorn");

const ROOT = path.resolve(__dirname, "..");
const SRC = path.join(ROOT, "worlds", "terrain", "phytogenesis.js");
const DST = path.join(ROOT, "foundry-core.js");

// Die P2-Symbol-Liste (Playbook §P2). Reine Daten + Utilities + Geometrie-Erzeuger + Rezept->
// Parameter. NICHT dabei (bleibt Shell): FoliagePass, gv, Display/Welt/Wetter/UI, die GL-Bäcker,
// __replyBuildAsset/__replyRecipes/... + __portalOnMessage/__post/announceReady (Protokoll: eigene
// Welle, weil sie an init/Verdrahtung hängen). DIESE Welle: der reine GENERATOR-Kern.
const SYMBOLS = [
    // Daten
    "WIND",
    "SEASON",
    "PORTAL_GROUND",
    "PORTAL_SKY",
    "PORTAL_RENDER_CONFIG",
    "SHAPE",
    "PRESETS",
    // Utilities
    "mulberry32",
    "nearestFib",
    "vrot",
    "perp",
    "fbm3",
    "vn2",
    "fbm2",
    "ridged",
    "lerpHex",
    "clipPolygon",
    "__mkCanvas",
    // Material/Atlas
    "injectWind",
    "makeBarkNormal",
    "buildMaterials",
    "bakeLeafAtlas",
    "barkProfile",
    "setSeasonColors",
    // Geometrie-Erzeuger
    "weldNormals",
    "addMerged",
    "pushSegment",
    "superR",
    "pushLeaf",
    "pushNeedle",
    "pushLeafClusterQuad",
    "growTreeNodes",
    "pushJointSphere",
    "growRoot",
    "emitRoots",
    "buildTube",
    "emitTree",
    "emitFlower",
    "emitGrass",
    "buildBoulder",
    "emitColumns",
    "emitScree",
    "pushCrystal",
    "emitCrystals",
    "emitRock",
    // Rezept -> Parameter
    "phenotype",
    "deriveParamsPlant",
    "rockPhenotype",
    "deriveParamsRock",
    "buildInstance",
];

const src = fs.readFileSync(SRC, "utf8");
const ast = acorn.parse(src, { ecmaVersion: "latest", sourceType: "script", locations: true });

// Top-Level-Deklarationen sammeln: FunctionDeclaration + VariableDeclaration (const/let/var).
const found = new Map(); // name -> {start,end,type,line}
for (const node of ast.body) {
    if (node.type === "FunctionDeclaration" && node.id) {
        found.set(node.id.name, { start: node.start, end: node.end, type: "fn", line: node.loc.start.line });
    } else if (node.type === "VariableDeclaration") {
        // nur EINZEL-Deklaratoren (const X = ...); ein `const A=…, B=…` mit einem Ziel-Symbol wäre riskant.
        for (const d of node.declarations) {
            if (d.id && d.id.type === "Identifier") {
                found.set(d.id.name, {
                    start: node.start,
                    end: node.end,
                    type: node.kind,
                    line: node.loc.start.line,
                    multi: node.declarations.length > 1,
                });
            }
        }
    }
}

const missing = SYMBOLS.filter((s) => !found.has(s));
const multi = SYMBOLS.filter((s) => found.has(s) && found.get(s).multi);
console.log(`Symbole gesucht: ${SYMBOLS.length} · gefunden: ${SYMBOLS.length - missing.length}`);
if (missing.length) console.log("  FEHLEN (nicht top-level oder anderer Name):", missing.join(", "));
if (multi.length) console.log("  ⚠️ MULTI-Deklarator (riskant, manuell prüfen):", multi.join(", "));

// die Spans in QUELL-Reihenfolge
const spans = SYMBOLS.filter((s) => found.has(s))
    .map((s) => Object.assign({ name: s }, found.get(s)))
    .sort((a, b) => a.start - b.start);

if (process.argv.includes("--check")) {
    console.log("\nSpans (Quell-Reihenfolge):");
    for (const s of spans) console.log(`  ${String(s.line).padStart(5)}  ${s.type.padEnd(5)}  ${s.name}`);
    process.exit(missing.length || multi.length ? 1 : 0);
}

if (process.argv.includes("--apply")) {
    if (missing.length || multi.length) {
        console.error("\n❌ Abbruch: fehlende/riskante Symbole — erst --check klären.");
        process.exit(1);
    }
    // Ausschneiden von HINTEN nach VORNE (Offsets bleiben gültig).
    const ordered = spans.slice().sort((a, b) => b.start - a.start);
    let out = src;
    const chunks = [];
    for (const s of ordered) {
        chunks.unshift(src.slice(s.start, s.end)); // vorne einfügen -> am Ende Quell-Reihenfolge
        // die Zeile inkl. folgendem Newline entfernen
        let end = s.end;
        if (out[end] === "\n") end++;
        out = out.slice(0, s.start) + out.slice(end);
    }
    const header =
        "// AnazhRealm — foundry-core.js: DER STUDIO-GENERATOR-KERN (DAS NEUE KLEID, P2 Kern-Split).\n" +
        "// Klassisches Script (KEINE IIFE) — die Top-Level-Symbole bleiben global, geladen VOR\n" +
        "// worlds/terrain/phytogenesis.js (Shell) + im Foundry-Worker (importScripts) VOR phytogenesis.\n" +
        "// Verschoben (nicht kopiert) aus phytogenesis.js via scripts/move-to-foundry-core.cjs; die\n" +
        "// Wuchs-/Asset-Mathematik lebt hier, phytogenesis.js ist die Display-/Welt-/UI-Shell + der\n" +
        "// GL-Bäcker. THREE/BufferGeometryUtils/__phytoCore sind zur Laufzeit global (Ladereihenfolge).\n\n";
    fs.writeFileSync(DST, header + chunks.join("\n\n") + "\n");
    fs.writeFileSync(SRC, out);
    console.log(`\n✅ ${spans.length} Symbole verschoben → foundry-core.js (${chunks.join("\n\n").length} B)`);
    console.log("   phytogenesis.js geschrumpft. Jetzt: Ladereihenfolge verdrahten + node --check + Gates.");
    process.exit(0);
}

console.log("\n(kein --check/--apply — nur Inventar gedruckt)");
