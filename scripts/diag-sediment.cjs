// AnazhRealm — Exhaustiver Sediment-Sweep (Mess-Werkzeug, V18.285)
//
// WARUM: `audit:strict` prüft nur, ob ein state-Feld in init() STEHT — nie, ob
// es noch INFORMATION TRÄGT. Darum kann ein Feld grün UND tot sein (ein Regler,
// der ins Leere schreibt; ein Container, der nie gefüllt wird; ein null-Feld,
// dessen einzige Leser falsy-Fallbacks sind). Dieses Werkzeug schliesst die
// Lücke: es geht den GANZEN Stamm kommentar-/string-bereinigt durch (die
// `groundHeightField`-Falle: seine "Leser" waren Kommentare) und klassifiziert
// jedes Feld + jede Methode nach echtem Konsum.
//
// Lauf: `node scripts/diag-sediment.cjs`  (rein lesend, ändert nichts)
// Voll-Detail nach: artifacts/sediment-report.json

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const MAIN = path.join(ROOT, "anazhRealm.js");
const WORKER = path.join(ROOT, "voxel-worker.js");
const SCRIPTS_DIR = __dirname;
const ART_DIR = path.join(ROOT, "artifacts");

// ── Kommentar-/String-Stripper ───────────────────────────────────────────────
// Ersetzt Kommentare + String-Literal-Inhalte durch Leerzeichen (Zeilen bleiben
// erhalten für Zeilennummern). Code INNERHALB von Template-`${…}` bleibt Code
// (ein `${state.X}` ist ein echter Leser). Das ist die EINE Quelle der Wahrheit,
// gegen die alle Treffer gezählt werden — kein Kommentar zählt als Leser.
function stripCommentsAndStrings(src) {
    let out = "";
    let i = 0;
    const n = src.length;
    // template-Stack für verschachtelte `${ ` `}`
    const tmplDepthStack = [];
    let state = "code";
    while (i < n) {
        const c = src[i];
        const c2 = src[i + 1];
        if (state === "code") {
            if (c === "/" && c2 === "/") {
                state = "line";
                out += "  ";
                i += 2;
                continue;
            }
            if (c === "/" && c2 === "*") {
                state = "block";
                out += "  ";
                i += 2;
                continue;
            }
            if (c === "'") {
                state = "sq";
                out += " ";
                i++;
                continue;
            }
            if (c === '"') {
                state = "dq";
                out += " ";
                i++;
                continue;
            }
            if (c === "`") {
                state = "tmpl";
                out += " ";
                i++;
                continue;
            }
            // Innerhalb eines template-${…}: schliessende } poppt zurück
            if (c === "}" && tmplDepthStack.length > 0) {
                const top = tmplDepthStack[tmplDepthStack.length - 1];
                if (top.depth === 0) {
                    tmplDepthStack.pop();
                    state = "tmpl";
                    out += " ";
                    i++;
                    continue;
                } else {
                    top.depth--;
                }
            }
            if (c === "{" && tmplDepthStack.length > 0) {
                tmplDepthStack[tmplDepthStack.length - 1].depth++;
            }
            out += c;
            i++;
            continue;
        }
        if (state === "line") {
            if (c === "\n") {
                state = "code";
                out += "\n";
            } else {
                out += " ";
            }
            i++;
            continue;
        }
        if (state === "block") {
            if (c === "*" && c2 === "/") {
                state = "code";
                out += "  ";
                i += 2;
            } else {
                out += c === "\n" ? "\n" : " ";
                i++;
            }
            continue;
        }
        if (state === "sq" || state === "dq") {
            const q = state === "sq" ? "'" : '"';
            if (c === "\\") {
                out += "  ";
                i += 2;
                continue;
            }
            if (c === q) {
                state = "code";
                out += " ";
                i++;
                continue;
            }
            out += c === "\n" ? "\n" : " ";
            i++;
            continue;
        }
        if (state === "tmpl") {
            if (c === "\\") {
                out += "  ";
                i += 2;
                continue;
            }
            if (c === "`") {
                state = "code";
                out += " ";
                i++;
                continue;
            }
            if (c === "$" && c2 === "{") {
                tmplDepthStack.push({ depth: 0 });
                state = "code";
                out += " {"; // das `{` zählt für die code-depth, $ -> space
                i += 2;
                continue;
            }
            out += c === "\n" ? "\n" : " ";
            i++;
            continue;
        }
    }
    return out;
}

const mainRaw = fs.readFileSync(MAIN, "utf8");
const mainCode = stripCommentsAndStrings(mainRaw);
const workerCode = fs.existsSync(WORKER) ? stripCommentsAndStrings(fs.readFileSync(WORKER, "utf8")) : "";
let scriptCode = "";
for (const f of fs.readdirSync(SCRIPTS_DIR)) {
    if (!f.endsWith(".cjs") || f === "diag-sediment.cjs") continue;
    scriptCode += stripCommentsAndStrings(fs.readFileSync(path.join(SCRIPTS_DIR, f), "utf8")) + "\n";
}

// Zeilennummer aus Index (im ROHEN main, für Berichte)
function lineAt(idx) {
    return mainRaw.slice(0, idx).split("\n").length;
}

// ── 1) init()-Feld-Deklarationen parsen (this.state = { … }) ──────────────────
function parseInitFields() {
    const anchor = mainCode.indexOf("this.state = {");
    if (anchor < 0) return {};
    let i = mainCode.indexOf("{", anchor);
    const fields = {};
    let depth = 0;
    let expectKey = false;
    for (; i < mainCode.length; i++) {
        const c = mainCode[i];
        if (c === "{" || c === "[" || c === "(") {
            depth++;
            if (c === "{" && depth === 1) expectKey = true;
            continue;
        }
        if (c === "}" || c === "]" || c === ")") {
            depth--;
            if (depth === 0) break;
            continue;
        }
        if (depth === 1) {
            if (c === ",") {
                expectKey = true;
                continue;
            }
            if (expectKey && /[A-Za-z_$]/.test(c)) {
                let j = i;
                while (j < mainCode.length && /[\w$]/.test(mainCode[j])) j++;
                let k = j;
                while (k < mainCode.length && /\s/.test(mainCode[k])) k++;
                if (mainCode[k] === ":") {
                    const name = mainCode.slice(i, j);
                    // Wert-Typ klassifizieren
                    let v = k + 1;
                    while (v < mainCode.length && /\s/.test(mainCode[v])) v++;
                    const tail = mainCode.slice(v, v + 12);
                    let kind = "expr";
                    if (tail[0] === "[") kind = "array";
                    else if (tail[0] === "{") kind = "object";
                    else if (/^new Map/.test(tail)) kind = "map";
                    else if (/^new Set/.test(tail)) kind = "set";
                    else if (/^null\b/.test(tail)) kind = "null";
                    else if (/^(true|false)\b/.test(tail)) kind = "bool";
                    else if (/^-?\d/.test(tail)) kind = "number";
                    else if (tail[0] === " " || tail[0] === ")") kind = "empty";
                    fields[name] = { kind, declLine: lineAt(i) };
                }
                expectKey = false;
                i = j - 1;
                continue;
            }
            if (!/\s/.test(c)) expectKey = false;
        }
    }
    return fields;
}

// ── 2) Feld-Universum + Konsum-Klassifikation ────────────────────────────────
const EMPTY_RHS =
    /^\s*(\[\s*\]|\{\s*\}|null\b|undefined\b|0\b|false\b|""|''|``|new Map\(\)|new Set\(\)|new Map\(|new Set\()/;

function classifyOccurrences(code) {
    // pro Feldname: Zähler
    // `.state` fängt this.state UND r.state (Playtest-Alias) — der frühere
    // `this.state`-only-Regex übersah `r.state.X`-Test-Leser (blinder Fleck,
    // GEMESSEN: _cameraDesiredY wurde fälschlich als tot geflaggt).
    const fieldRe = /(?:\.state|(?<![\w.$])state|(?<![\w.$])st)\.([A-Za-z_$][\w$]*)/g;
    const acc = {};
    let m;
    while ((m = fieldRe.exec(code))) {
        const name = m[1];
        const a = (acc[name] = acc[name] || {
            contentWrite: 0,
            emptyWrite: 0,
            otherWrite: 0,
            fallbackRead: 0,
            realRead: 0,
        });
        const after = code.slice(m.index + m[0].length);
        // WRITE-Muster
        const mut = /^\s*\.(push|unshift|set|add|splice|fill)\s*\(/.test(after);
        const idxAssign = /^\s*\[[^\]]*\]\s*=(?![=])/.test(after);
        const otherMut = /^\s*\.(pop|shift|delete|clear|sort|reverse)\s*\(/.test(after);
        const counter =
            /^\s*(\+\+|--)/.test(after) || /(\+\+|--)\s*$/.test(code.slice(Math.max(0, m.index - 3), m.index));
        const assign = /^\s*([-+*/%]?=)(?![=>])/.exec(after);
        if (mut || idxAssign) {
            a.contentWrite++;
            continue;
        }
        if (otherMut || counter) {
            a.otherWrite++;
            continue;
        }
        if (assign) {
            if (assign[1] === "=") {
                // RHS prüfen: leer oder Daten?
                const rhs = after.slice(assign.index + assign[0].length);
                if (EMPTY_RHS.test(rhs)) a.emptyWrite++;
                else a.contentWrite++;
            } else {
                // +=, -= … = Daten-mutierender Write
                a.contentWrite++;
            }
            continue;
        }
        // READ
        if (/^\s*(\|\||\?\?)/.test(after)) a.fallbackRead++;
        else a.realRead++;
    }
    return acc;
}

const initFields = parseInitFields();
const mainOcc = classifyOccurrences(mainCode);
const workerOcc = classifyOccurrences(workerCode);
const scriptOcc = classifyOccurrences(scriptCode);

const allFieldNames = new Set([...Object.keys(initFields), ...Object.keys(mainOcc), ...Object.keys(workerOcc)]);

const fieldReport = [];
for (const name of allFieldNames) {
    const mo = mainOcc[name] || { contentWrite: 0, emptyWrite: 0, otherWrite: 0, fallbackRead: 0, realRead: 0 };
    const wo = workerOcc[name] || { contentWrite: 0, emptyWrite: 0, otherWrite: 0, fallbackRead: 0, realRead: 0 };
    const so = scriptOcc[name] || { contentWrite: 0, emptyWrite: 0, otherWrite: 0, fallbackRead: 0, realRead: 0 };
    const prodContentWrite = mo.contentWrite + wo.contentWrite;
    const prodRealRead = mo.realRead + wo.realRead;
    const prodFallbackRead = mo.fallbackRead + wo.fallbackRead;
    const prodAnyRead = prodRealRead + prodFallbackRead;
    const scriptRead = so.realRead + so.fallbackRead;
    const decl = initFields[name];
    const containerInit =
        decl && (decl.kind === "array" || decl.kind === "object" || decl.kind === "map" || decl.kind === "set");
    const nullishInit =
        decl && (decl.kind === "null" || decl.kind === "number" || decl.kind === "bool" || decl.kind === "empty");

    let verdict = "ALIVE";
    let why = "";
    if (decl && prodAnyRead === 0 && prodContentWrite === 0 && mo.otherWrite === 0 && wo.otherWrite === 0) {
        verdict = "DEAD-DECLARED-UNREAD";
        why = "in init() deklariert, 0 Reads + 0 Daten-Writes in Produktion";
    } else if (prodAnyRead === 0 && (prodContentWrite > 0 || mo.emptyWrite > 0 || mo.otherWrite > 0)) {
        verdict = "DEAD-WRITTEN-UNREAD";
        why = "wird geschrieben, 0 Reads in Produktion";
    } else if (prodContentWrite === 0 && prodAnyRead > 0 && (containerInit || (decl && decl.kind === "empty"))) {
        verdict = "VESTIGIAL-EMPTY-CONTAINER";
        why = "Container, NIE gefüllt (kein push/set/add/index-Write) — Leser laufen auf Leerem";
    } else if (prodContentWrite === 0 && prodRealRead === 0 && prodFallbackRead > 0 && nullishInit) {
        verdict = "VESTIGIAL-NULLISH";
        why = "null/0/false-Feld, nie auf Daten gesetzt, nur falsy-Fallback-Leser (tragen keine Info)";
    } else if (prodAnyRead === 0 && scriptRead > 0) {
        verdict = "TEST-ONLY";
        why = "0 Produktions-Reads, nur scripts/ lesen es";
    }

    if (verdict !== "ALIVE") {
        fieldReport.push({
            name,
            verdict,
            why,
            declKind: decl ? decl.kind : "(lazy/none)",
            declLine: decl ? decl.declLine : null,
            prodContentWrite,
            prodEmptyWrite: mo.emptyWrite + wo.emptyWrite,
            prodOtherWrite: mo.otherWrite + wo.otherWrite,
            prodRealRead,
            prodFallbackRead,
            scriptRead,
        });
    }
}

// ── 3) 0-Aufrufer-Methoden ───────────────────────────────────────────────────
function parseMethods() {
    const lines = mainRaw.split("\n");
    const defs = [];
    for (let i = 0; i < lines.length; i++) {
        // Klassen-Methode: exakt 4 Space Einrückung, name( … , kein Keyword
        const mm = /^ {4}(async )?(static )?(get |set )?([A-Za-z_$][\w$]*)\s*\(/.exec(lines[i]);
        if (!mm) continue;
        const name = mm[4];
        if (["if", "for", "while", "switch", "catch", "return", "constructor"].includes(name)) continue;
        defs.push({ name, line: i + 1 });
    }
    return defs;
}
const methodDefs = parseMethods();
// Pro Name: Anzahl Referenzen im stripped main (ausser der Def selbst), worker, scripts
function countRefs(code, name) {
    // .name( oder .name<wordbreak> (gebundene Ref) oder name: (closure-Registrierung)
    const re = new RegExp(`\\.${name}\\b|\\b${name}\\s*:`, "g");
    const mm = code.match(re);
    return mm ? mm.length : 0;
}
const methodReport = [];
const seenMethod = new Set();
for (const d of methodDefs) {
    if (seenMethod.has(d.name)) continue; // mehrfache Defs (Overloads gibt es nicht) — erste zählt
    seenMethod.add(d.name);
    // Def selbst erzeugt KEINE `.name(`-Referenz (sie ist `name(`), also sind alle Treffer Aufrufer/Refs
    const mainRefs = countRefs(mainCode, d.name);
    const workerRefs = countRefs(workerCode, d.name);
    const scriptRefs = countRefs(scriptCode, d.name);
    if (mainRefs + workerRefs === 0) {
        methodReport.push({
            name: d.name,
            line: d.line,
            prodRefs: mainRefs + workerRefs,
            scriptRefs,
            verdict: scriptRefs > 0 ? "ZERO-CALLER-TEST-ANCHORED" : "ZERO-CALLER",
        });
    }
}

// ── Ausgabe ──────────────────────────────────────────────────────────────────
function group(rep, v) {
    return rep.filter((r) => r.verdict === v);
}
const order = [
    "DEAD-DECLARED-UNREAD",
    "DEAD-WRITTEN-UNREAD",
    "VESTIGIAL-EMPTY-CONTAINER",
    "VESTIGIAL-NULLISH",
    "TEST-ONLY",
];
console.log("=== SEDIMENT-SWEEP (exhaustiv, kommentar-/string-bereinigt) ===\n");
console.log(`Feld-Universum: ${allFieldNames.size} state-Felder referenziert/deklariert`);
console.log(`init()-Deklarationen: ${Object.keys(initFields).length}`);
console.log(`Methoden-Defs (4-Space): ${methodDefs.length}\n`);

console.log("── STATE-SEDIMENT (geflaggt) ──");
for (const v of order) {
    const g = group(fieldReport, v);
    if (!g.length) continue;
    console.log(`\n[${v}] (${g.length})  — ${g[0].why}`);
    for (const r of g.sort((a, b) => (a.declLine || 1e9) - (b.declLine || 1e9))) {
        console.log(
            `  state.${r.name}  (init:${r.declKind}${r.declLine ? "@" + r.declLine : ""})  ` +
                `cWrite=${r.prodContentWrite} eWrite=${r.prodEmptyWrite} oWrite=${r.prodOtherWrite} ` +
                `realRead=${r.prodRealRead} fbRead=${r.prodFallbackRead} scriptRead=${r.scriptRead}`
        );
    }
}

console.log(`\n── 0-AUFRUFER-METHODEN (${methodReport.length}) ──`);
for (const r of methodReport.sort((a, b) => a.line - b.line)) {
    console.log(`  ${r.name}  @${r.line}  prodRefs=${r.prodRefs} scriptRefs=${r.scriptRefs}  [${r.verdict}]`);
}

// Voll-Detail als Artefakt
if (!fs.existsSync(ART_DIR)) fs.mkdirSync(ART_DIR, { recursive: true });
fs.writeFileSync(
    path.join(ART_DIR, "sediment-report.json"),
    JSON.stringify(
        {
            fields: fieldReport,
            methods: methodReport,
            fieldCount: allFieldNames.size,
            initCount: Object.keys(initFields).length,
            methodCount: methodDefs.length,
        },
        null,
        2
    )
);
console.log("\nVoll-Detail → artifacts/sediment-report.json");
console.log(`\n=== ${fieldReport.length} State-Felder + ${methodReport.length} Methoden geflaggt (zur Prüfung) ===`);
