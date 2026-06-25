#!/usr/bin/env node
// ─────────────────────────────────────────────────────────────────────────
// cut-method.cjs — DER AST-PRÄZISE METHODEN-SCHNITT (die V17.20-Klasse strukturell heilen)
//
// DIE WURZEL (CLAUDE.md, V17.20-Lehre, GEMESSEN): ein Line-Range-Delete
// (`sed 'A,Bd'`) eines „toten Clusters" kann eine NICHT-passende Methode
// ENTHALTEN, die der Pattern-Grep nie sieht (damals `_configureRenderer`
// mitten zwischen zwei `_voxelGpu*` → mit-gelöscht → die ganze Welt tot,
// und `node --check` fängt es NICHT, weil die Syntax valide bleibt).
//
// DIE HEILUNG (Gesetz #0 — die Linse statt der Wachsamkeit): man löscht
// NICHT mehr per Zeilen-Range, sondern per AST-SPANNE. acorn (eslint-Dep)
// liefert die EXAKTEN Grenzen jeder Methode → ein Schnitt kann per
// Konstruktion keinen Nachbarn mehr fangen. Plus build-before-dispose:
// nach dem Schnitt `node --check`; bricht es, wird die Datei restauriert.
//
// NUTZUNG:
//   node scripts/cut-method.cjs <methodName>              → zeigt die exakte Spanne (Dry-Run)
//   node scripts/cut-method.cjs <methodName> --apply      → schneidet NUR diese Spanne raus
//   node scripts/cut-method.cjs <methodName> --with-comment → inkl. des Kopf-Kommentar-Blocks
//   node scripts/cut-method.cjs <methodName> --nth 2      → bei mehreren Treffern den N-ten
//   node scripts/cut-method.cjs <methodName> --file bake-core.js
// ─────────────────────────────────────────────────────────────────────────
const fs = require("fs");
const path = require("path");
const acorn = require("acorn");

const args = process.argv.slice(2);
const name = args.find((a) => !a.startsWith("--"));
const apply = args.includes("--apply");
const withComment = args.includes("--with-comment");
const fileArg = args.indexOf("--file") >= 0 ? args[args.indexOf("--file") + 1] : "anazhRealm.js";
const nthArg = args.indexOf("--nth") >= 0 ? parseInt(args[args.indexOf("--nth") + 1], 10) : null;
const file = path.resolve(__dirname, "..", fileArg);

if (!name) {
    console.error(
        "Nutzung: node scripts/cut-method.cjs <methodName> [--apply] [--with-comment] [--nth N] [--file <f>]"
    );
    process.exit(2);
}

const src = fs.readFileSync(file, "utf8");

// Zeilen-Offset-Tabelle: char-Offset → (1-indizierte) Zeile.
const lineStarts = [0];
for (let i = 0; i < src.length; i++) if (src[i] === "\n") lineStarts.push(i + 1);
const lineOf = (off) => {
    let lo = 0,
        hi = lineStarts.length - 1;
    while (lo < hi) {
        const mid = (lo + hi + 1) >> 1;
        if (lineStarts[mid] <= off) lo = mid;
        else hi = mid - 1;
    }
    return lo + 1;
};

const comments = [];
let ast;
try {
    ast = acorn.parse(src, { ecmaVersion: "latest", sourceType: "script", onComment: comments });
} catch (e) {
    console.error(`⛔ acorn konnte ${fileArg} nicht parsen: ${e.message}`);
    process.exit(2);
}

// Alle MethodDefinition-Knoten (jeder Klasse) mit passendem Namen sammeln.
const hits = [];
const walk = (node) => {
    if (!node || typeof node.type !== "string") return;
    if (node.type === "MethodDefinition" && node.key && node.key.name === name) hits.push(node);
    for (const k of Object.keys(node)) {
        const v = node[k];
        if (Array.isArray(v)) v.forEach((c) => c && typeof c.type === "string" && walk(c));
        else if (v && typeof v.type === "string") walk(v);
    }
};
walk(ast);

if (hits.length === 0) {
    console.error(`⛔ Keine Methode '${name}' in ${fileArg} gefunden.`);
    process.exit(1);
}
if (hits.length > 1 && nthArg === null) {
    console.error(`⚠ ${hits.length} Methoden namens '${name}':`);
    hits.forEach((h, i) => console.error(`   --nth ${i + 1} → Zeile ${lineOf(h.start)}`));
    console.error("Wähle mit --nth N. (Sicherheit: nie blind die erste schneiden.)");
    process.exit(1);
}
const node = nthArg !== null ? hits[nthArg - 1] : hits[0];
if (!node) {
    console.error(`⛔ --nth ${nthArg} existiert nicht (nur ${hits.length} Treffer).`);
    process.exit(1);
}

let startLine = lineOf(node.start);
const endLine = lineOf(node.end);

// Optional: den unmittelbar darüber liegenden Kommentar-Block mitnehmen
// (die V17.20-Lehre „der Kopf-Kommentar gehört zur Methode"). Nur kontigu-
// ierliche Kommentar-Zeilen direkt über der Signatur, durch nichts getrennt.
let commentFrom = null;
if (withComment) {
    const leading = comments.filter((c) => lineOf(c.end) < startLine).sort((a, b) => b.end - a.end);
    let probe = startLine;
    for (const c of leading) {
        if (lineOf(c.end) === probe - 1) {
            probe = lineOf(c.start);
        } else break;
    }
    if (probe < startLine) {
        commentFrom = probe;
        startLine = probe;
    }
}

const lines = src.split("\n");
const sig = lines[lineOf(node.start) - 1].trim();
const lineCount = endLine - startLine + 1;

// Sicherheits-Wand: zwischen startLine+1 und endLine-1 darf KEINE weitere
// Top-Level-Methoden-Signatur liegen (eine MethodDefinition kann das per
// AST nicht — aber wir prüfen es als sichtbaren Beweis gegen die V17.20-Angst).
const innerHits = hits.filter((h) => h !== node && lineOf(h.start) > startLine && lineOf(h.start) < endLine);

console.log(`Datei:    ${fileArg}`);
console.log(`Methode:  ${name}  (${sig})`);
console.log(
    `Spanne:   Zeile ${startLine}–${endLine}  (${lineCount} Zeilen)${commentFrom ? "  [inkl. Kopf-Kommentar]" : ""}`
);
console.log(`Treffer:  ${hits.length} Methode(n) namens '${name}'`);
if (innerHits.length) console.log(`⚠ ACHTUNG: ${innerHits.length} weitere Methode in der Spanne — NICHT schneiden!`);

if (!apply) {
    console.log("\n(Dry-Run — nichts verändert. Mit --apply schneiden.)");
    process.exit(0);
}

if (innerHits.length) {
    console.error("⛔ Schnitt abgebrochen: die Spanne enthält eine andere Methode (genau die V17.20-Falle).");
    process.exit(1);
}

// build-before-dispose: Original behalten, schneiden, node --check, bei Bruch restaurieren.
const backup = src;
// trailing-Leerzeile mitnehmen, wenn vorhanden (sauberer Schnitt, kein Doppel-Blank)
let cutEnd = endLine;
if (lines[cutEnd] !== undefined && lines[cutEnd].trim() === "") cutEnd = endLine + 1;
const kept = lines.slice(0, startLine - 1).concat(lines.slice(cutEnd));
const out = kept.join("\n");
fs.writeFileSync(file, out, "utf8");

const { execFileSync } = require("child_process");
try {
    execFileSync(process.execPath, ["--check", file], { stdio: "pipe" });
    console.log(
        `\n✅ Geschnitten: ${lineCount} Zeilen raus, node --check grün (${lines.length} → ${kept.length} Zeilen).`
    );
    console.log("   Nächster Schritt: node scripts/diag-page-error.cjs (Runtime-Wurzel) → dann playtest.");
} catch (e) {
    fs.writeFileSync(file, backup, "utf8");
    console.error("⛔ node --check ROT nach dem Schnitt → Datei RESTAURIERT (kein Schaden).");
    console.error((e.stderr || e.message || "").toString().split("\n").slice(0, 6).join("\n"));
    process.exit(1);
}
