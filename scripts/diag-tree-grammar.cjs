// V18.211 — Diag: prüft die neue Skeleton-Grammatik direkt im Node-Kontext.
// Lädt anazhRealm.js minimal (mit Stub-Vendor) und ruft `_growTreeBlueprintRich`
// für jede Spezies. Zählt parts + prüft Tag-Neutralität gegen die Referenz.

const fs = require("fs");
const path = require("path");

// Vendor-Stubs: SimplexNoise mit dem echten Vendor-Code
const SimplexNoiseCode = fs.readFileSync(path.join(__dirname, "../vendor/simplex-noise.js"), "utf8");
const fakeWindow = {};
// IIFE führt das Vendor-Lib im fakeWindow-Scope aus.
new Function("window", SimplexNoiseCode)(fakeWindow);
global.SimplexNoise = fakeWindow.SimplexNoise;

// THREE-Stub: nur, was die Grammatik referenzieren KÖNNTE.
global.THREE = {};

// Lade nur den AnazhRealm-Konstruktor (großer File, aber wir brauchen nur die
// Static-Konfigurationen + die Methoden).
const arSource = fs.readFileSync(path.join(__dirname, "../anazhRealm.js"), "utf8");
// AnazhRealm hat IIFE-artige Initialisierung — wir extrahieren nur die
// SPECIES_GRAMMAR und die _growTreeBlueprintRich-Methode für den Test.

// Schnell-Ansatz: lade die ganze Datei in einem `new Function`-Sandbox-Kontext,
// instanziere eine Mini-AnazhRealm-Instanz.
try {
    // Wir können das nicht direkt eval-en wegen DOM/WebGL-Abhängigkeiten.
    // Stattdessen extrahieren wir per Regex die SPECIES_GRAMMAR-Definition + die
    // _growTreeBlueprintRich-Methode + ein Minimum-Drumherum.

    // Extrahiere SPECIES_GRAMMAR per Zeilen-Slice — Regex auf verschachteltem
    // Object.freeze ist brüchig. Wir suchen den Start und finden das End-Pattern
    // (eine Zeile mit nur "});" am Anfang).
    const lines = arSource.split("\n");
    let startLine = -1;
    for (let i = 0; i < lines.length; i++) {
        if (lines[i].startsWith("AnazhRealm.SPECIES_GRAMMAR = Object.freeze(")) {
            startLine = i;
            break;
        }
    }
    if (startLine < 0) {
        console.error("[diag] FEHLER — SPECIES_GRAMMAR Anfang nicht gefunden");
        process.exit(1);
    }
    let endLine = -1;
    for (let i = startLine + 1; i < lines.length; i++) {
        if (lines[i] === "});") {
            endLine = i;
            break;
        }
    }
    if (endLine < 0) {
        console.error("[diag] FEHLER — SPECIES_GRAMMAR Ende nicht gefunden");
        process.exit(1);
    }
    // Slice die `Object.freeze({...})`-Form raus (ohne das `AnazhRealm.X = `).
    const grammarText = lines.slice(startLine, endLine + 1).join("\n");
    // Cleanup: `AnazhRealm.SPECIES_GRAMMAR = Object.freeze(` durch `(` ersetzen.
    const grammarSource = grammarText
        .replace(/^AnazhRealm\.SPECIES_GRAMMAR\s*=\s*Object\.freeze\(/, "(")
        .replace(/\);$/, ")");

    // Extrahiere _growTreeBlueprintRich (die ganze Methode)
    const richMatch = arSource.match(
        /_growTreeBlueprintRich\(speciesKey, seed, grammar\)\s*\{[\s\S]*?\n\s{4}\}\n\n\s{4}_growTreeBlueprintLegacy/
    );
    if (!richMatch) {
        console.error("[diag] FEHLER — _growTreeBlueprintRich nicht gefunden");
        process.exit(1);
    }
    const richSource = richMatch[0].replace("_growTreeBlueprintLegacy", "_DUMMY");

    // Baue eine Mini-Instance-Klasse, die nur das benötigte trägt.
    const testCode = `
        const AnazhRealm = {};
        AnazhRealm.SPECIES_GRAMMAR = Object.freeze${grammarSource};

        class TestInstance {
            constructor() {
                this.state = { worldMeta: { seed: 'test-seed' } };
            }
            _genVersion() { return 5; }
            ${richSource.replace("_DUMMY", "_dummy")}
            _dummy() {}
        }

        const inst = new TestInstance();
        const species = Object.keys(AnazhRealm.SPECIES_GRAMMAR);
        const results = {};
        for (const sp of species) {
            const grammar = AnazhRealm.SPECIES_GRAMMAR[sp];
            const parts = inst._growTreeBlueprintRich(sp, sp + "-seed-1", grammar);
            results[sp] = {
                partCount: parts.length,
                trunkCount: parts.filter(p => p.material === "holz").length,
                foliageCount: parts.filter(p => p.material === "laub").length,
            };
        }
        return results;
    `;
    const fn = new Function("SimplexNoise", testCode);
    const results = fn(global.SimplexNoise);

    console.log("[diag] V18.211 SKELETON-GRAMMAR — Parts pro Spezies:");
    console.log("       Spezies            | Gesamt | Stamm/Ast | Foliage");
    console.log("       --------------------+--------+-----------+--------");
    for (const sp of Object.keys(results)) {
        const r = results[sp];
        console.log(
            `       ${sp.padEnd(19)}|${String(r.partCount).padStart(7)} |${String(r.trunkCount).padStart(10)} |${String(r.foliageCount).padStart(8)}`
        );
    }
    // Akzeptanz: jeder Baum hat ≥ 30 Parts (vs. ~12 Legacy) UND ≥ 10 Foliage-Cluster.
    let failed = 0;
    for (const sp of Object.keys(results)) {
        const r = results[sp];
        if (r.partCount < 30) {
            console.error(`[diag] FEHLER — ${sp}: nur ${r.partCount} Parts (Plan: ≥ 30 für die Rich-Grammatik)`);
            failed++;
        }
        if (r.foliageCount < 10) {
            console.error(`[diag] FEHLER — ${sp}: nur ${r.foliageCount} Foliage-Cluster (Plan: ≥ 10)`);
            failed++;
        }
    }
    if (failed > 0) {
        console.error(`[diag] ${failed} Akzeptanz-Failures.`);
        process.exit(1);
    }
    console.log("[diag] AKZEPTANZ GRÜN — alle Spezies haben ≥ 30 Parts + ≥ 10 Foliage-Cluster.");
    process.exit(0);
} catch (e) {
    console.error("[diag] EXCEPTION:", e.message);
    console.error(e.stack);
    process.exit(1);
}
