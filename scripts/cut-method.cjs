#!/usr/bin/env node
// ─────────────────────────────────────────────────────────────────────────
// cut-method.cjs — DER AST-PRÄZISE METHODEN-SCHNITT (die Klasse strukturell heilen)
//
// Ein Line-Range-Delete eines toten Clusters kann eine NICHT-passende Methode ENTHALTEN, die der Pattern-Grep
// nie sieht (`node --check` fängt es nicht) — darum schneidet dieses Werkzeug per AST-SPANNE. acorn (eslint-Dep)
// liefert die EXAKTEN Grenzen jeder Methode → ein Schnitt kann per
// Konstruktion keinen Nachbarn mehr fangen. Plus build-before-dispose:
// nach dem Schnitt `node --check`; bricht es, wird die Datei restauriert.
//
// NUTZUNG:
//   node scripts/cut-method.cjs <methodName>              → zeigt die exakte Spanne (Dry-Run)
//   node scripts/cut-method.cjs <methodName> --apply      → schneidet NUR diese Spanne raus
//   node scripts/cut-method.cjs <methodName> --with-comment → inkl. des Kopf-Kommentar-Blocks
//   node scripts/cut-method.cjs <methodName> --nth 2      → bei mehreren Treffern den N-ten
//   node scripts/cut-method.cjs <methodName> --file phyto-core.js
// ─────────────────────────────────────────────────────────────────────────
const fs = require("fs");
const path = require("path");
const acorn = require("acorn");

const args = process.argv.slice(2);
const name = args.find((a) => !a.startsWith("--"));
const apply = args.includes("--apply");
const withComment = args.includes("--with-comment");
// ohne --file: die Stamm-Datei, die die Methode trägt (scripts/lib/stamm.cjs; findet sie keine, die erste — dort meldet
// der Schnitt „nicht gefunden")
const stammLib = require("./lib/stamm.cjs");
const fileArg =
    args.indexOf("--file") >= 0
        ? args[args.indexOf("--file") + 1]
        : (name && stammLib.dateiVon(path.resolve(__dirname, ".."), name)) ||
          stammLib.dateien(path.resolve(__dirname, ".."))[0];
const nthArg = args.indexOf("--nth") >= 0 ? parseInt(args[args.indexOf("--nth") + 1], 10) : null;
const file = path.resolve(__dirname, "..", fileArg);

if (!name) {
    console.error(
        "Nutzung: node scripts/cut-method.cjs <methodName> [--apply] [--with-comment] [--nth N] [--file <f>]"
    );
    process.exit(2);
}

const src = fs.readFileSync(file, "utf8");

// char-Offset → (1-indizierte) Zeile: der EINE Zeilen-Zähler (scripts/lib/stamm.cjs `zeileVon`)
const lineOf = (off) => stammLib.zeileVon(src, off);

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
stammLib.wandere(ast, (node) => {
    if (node.type === "MethodDefinition" && node.key && node.key.name === name) hits.push(node);
});

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
// (die Lehre „der Kopf-Kommentar gehört zur Methode"). Nur kontigu-
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
// AST nicht — aber wir prüfen es als sichtbaren Beweis gegen die Angst).
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
    console.log("   Nächster Schritt: npm run playtest:fast (Runtime-Wurzel: jeder Seitenfehler ROT) → dann playtest.");
} catch (e) {
    fs.writeFileSync(file, backup, "utf8");
    console.error("⛔ node --check ROT nach dem Schnitt → Datei RESTAURIERT (kein Schaden).");
    console.error((e.stderr || e.message || "").toString().split("\n").slice(0, 6).join("\n"));
    process.exit(1);
}
