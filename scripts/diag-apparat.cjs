#!/usr/bin/env node
// ============================================================================
// DIE APPARAT-LINSE — gate:apparat (ULTRAGUSS U1, V18.452)
//
// Gesetz #0: nach der Fehler-Klasse die LINSE bauen. Die Klasse: rohe
// `.toString()`-Quelltext-Zitate im Playtest brechen bei jeder Kern-Wanderung
// trotz identischem Verhalten UND umgehen den __codeOf-Kommentar-Stripper
// (ein zitierender Kommentar hält sie stumm grün — falsch-positiv). U1 hat den
// Bestand auf den legitimen Rest gesenkt (der Node-seitige Stream-Chunk);
// diese Linse friert ihn ein — der Bestand darf nur SINKEN (Ratchet).
//
// Zweite Aufgabe: der ANKER-KATALOG (window.__anker in playtest.cjs) ist nur
// wahr, wenn jedes katalogisierte Symbol im lebenden Stamm-CODE existiert —
// zieht ein Symbol um, wird HIER die eine Katalog-Zeile rot, nie N Proben.
//
// Selbst-Test: --selftest beweist beide Klingen (kein vakuöses Grün):
// (1) eine injizierte .toString()-Probe hebt den Zähler über den Ratchet,
//     ein bloßer Kommentar hebt ihn NICHT; (2) ein erfundenes Katalog-Symbol
// feuert die Katalog-Prüfung.
// ============================================================================
"use strict";
const fs = require("fs");
const path = require("path");

// Der eingefrorene Bestand (die U1-Nachher-Zahl, kommentar-bereinigt gezählt).
// Der EINE legitime Rest: `chunk.toString()` am Node-Stream (kein Quelltext-
// Zitat einer Realm-Methode). Sinkt der Bestand, wird diese Zahl GESENKT —
// nie erhöht (eine Erhöhung wäre ein begründeter Vertrags-Akt im Commit).
const FROZEN_TOSTRING = 1;

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
            i++;
            continue;
        }
        // String-Modi: Escapes überspringen, Ende erkennen.
        if (c === "\\") {
            out += c + (src[i + 1] || "");
            i += 2;
            continue;
        }
        if ((mode === "sq" && c === "'") || (mode === "dq" && c === '"') || (mode === "tpl" && c === "`"))
            mode = "code";
        out += c;
        i++;
    }
    return out;
}

function countToString(src) {
    return (stripComments(src).match(/\.toString\(\)/g) || []).length;
}

// V18.462 — DER typeof-RATCHET (ultraguss U1-Folge, die Voll-Wanderung ist
// tabellen-getrieben offen): 878 namens-verankerte `typeof … === "function"`-
// Existenz-Proben leben im Apparat. Der Bestand darf NUR SINKEN — jede neue
// Probe liest den Anker-Katalog (window.__anker) oder beweist KONSUM
// (window.__consumes); wandert eine Probe, sinkt die Zahl hier mit.
// Welle 5 Klang: 878 → 874 (die Proben auf _buildHydroAudioLayer · _tickHydrosphereAudio · _pointSegDist2D ·
// _tagToFrequency fielen mit ihren Methoden); Integration W5-Klang: 874 → 873 (_playCreatureTaskPing fiel — das Tier
// antwortet mit seiner Stimme).
const FROZEN_TYPEOF = 873;

function countTypeof(src) {
    return (stripComments(src).match(/typeof [^=\n]{1,80}=== "function"/g) || []).length;
}

function scanRatchet(playtestSrc) {
    const n = countToString(playtestSrc);
    const errs = [];
    if (n > FROZEN_TOSTRING)
        errs.push(
            `Ratchet: ${n} rohe .toString()-Quelltext-Zitate in scripts/playtest.cjs (eingefroren: ${FROZEN_TOSTRING}). ` +
                `Neue Proben lesen window.__codeOf (kommentar-gestrippt), beweisen KONSUM via window.__consumes ` +
                `oder proben Katalog-Existenz via window.__anker — nie rohes .toString().`
        );
    const nT = countTypeof(playtestSrc);
    if (nT > FROZEN_TYPEOF)
        errs.push(
            `typeof-Ratchet: ${nT} namens-verankerte typeof-Existenz-Proben in scripts/playtest.cjs ` +
                `(eingefroren: ${FROZEN_TYPEOF}). Neue Proben lesen window.__anker/__consumes — der Bestand darf nur sinken ` +
                `(sinkt er, FROZEN_TYPEOF mitsenken: der Ratchet klemmt nach unten nach).`
        );
    return { n, nT, errs };
}

// Den ANKER-KATALOG aus playtest.cjs lesen (die EINE frozen Tabelle).
function parseAnker(playtestSrc) {
    const m = playtestSrc.match(/window\.__anker = Object\.freeze\(\{([\s\S]*?)\}\);/);
    if (!m) return null;
    const entries = [];
    const re = /([A-Za-z_$][\w$]*):\s*"([^"]+)"/g;
    let e;
    while ((e = re.exec(m[1]))) entries.push({ anker: e[1], symbol: e[2] });
    return entries;
}

function scanAnker(playtestSrc, stammSrc) {
    const errs = [];
    if (!/window\.__consumes\s*=/.test(playtestSrc))
        errs.push("Apparat-Schlüssel fehlt: window.__consumes ist nicht mehr in scripts/playtest.cjs definiert.");
    const entries = parseAnker(playtestSrc);
    if (!entries || entries.length === 0) {
        errs.push(
            "Apparat-Schlüssel fehlt: der ANKER-KATALOG (window.__anker) ist nicht mehr in scripts/playtest.cjs."
        );
        return { entries: [], errs };
    }
    const code = stripComments(stammSrc);
    for (const { anker, symbol } of entries) {
        const re = new RegExp(`\\b${symbol.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`);
        if (!re.test(code))
            errs.push(
                `Anker-Katalog: __anker.${anker} zeigt auf "${symbol}", aber der Stamm-CODE trägt das Symbol nicht mehr ` +
                    `— die EINE Katalog-Zeile wandert auf die neue Wahrheit (nie die Probe aufweichen).`
            );
    }
    return { entries, errs };
}

// ============================================================================
// DIE VAKUUM-KLINGE (Meta-Wand der Prüf-Verdichtung 13.10., Plan §3): eine Prüfung ohne Messung ist ROT.
// Je Regel ein Detektor über den AST (acorn) der Prüf-Dateien; jeder Fund nennt Datei:Zeile und Form.
//   V3 Stumme Sonde — die EINE Sonde des Playtests (`safeEvaluate`) verbucht einen Wurf UND ein leeres Ergebnis
//      (null/undefined) als rote Prüfung im laufenden Band. Die Klinge fährt sie in einer Sandbox gegen eine
//      Seiten-Attrappe (Wurf · null · undefined · Wert), statt ihren Text zu lesen.
// ============================================================================
const acorn = require("acorn");
const vm = require("vm");

function parseJs(src) {
    const o = {
        ecmaVersion: "latest",
        locations: true,
        allowHashBang: true,
        allowReturnOutsideFunction: true,
        allowAwaitOutsideFunction: true,
    };
    try {
        return acorn.parse(src, { ...o, sourceType: "script" });
    } catch {
        return acorn.parse(src, { ...o, sourceType: "module" });
    }
}
function astWalk(n, f, anc = []) {
    f(n, anc);
    const a2 = anc.concat([n]);
    for (const k in n) {
        if (k === "loc") continue;
        const v = n[k];
        if (Array.isArray(v)) {
            for (const c of v) if (c && typeof c.type === "string") astWalk(c, f, a2);
        } else if (v && typeof v.type === "string") astWalk(v, f, a2);
    }
}

// V3: die Sonde aus dem Quelltext des Playtests in eine Sandbox heben und gegen die Attrappe fahren.
async function pruefeSonde(playtestSrc, datei = "scripts/playtest.cjs") {
    const ast = parseJs(playtestSrc);
    const teile = [];
    let aufrufe = 0;
    const baender = new Set();
    for (const s of ast.body) {
        if (s.type === "FunctionDeclaration" && /^(safeEvaluate|_sondeRot|unmessbar)$/.test(s.id.name))
            teile.push(playtestSrc.slice(s.start, s.end));
        if (s.type === "VariableDeclaration" && s.declarations.some((d) => d.id.name === "_sonde"))
            teile.push(playtestSrc.slice(s.start, s.end).replace(/^(const|let) /, "var "));
    }
    astWalk(ast, (n, anc) => {
        if (n.type !== "CallExpression" || n.callee.type !== "Identifier" || n.callee.name !== "safeEvaluate") return;
        aufrufe++;
        const band = anc.find((a) => a.type === "FunctionDeclaration" && a.id);
        if (band) baender.add(band.id.name);
    });
    const funde = [];
    if (!teile.some((t) => /function safeEvaluate\b/.test(t))) {
        funde.push(`${datei}: die Sonde safeEvaluate fehlt auf der Top-Ebene`);
        return { funde, aufrufe, baender: baender.size };
    }
    const ctx = { console: { log() {} } };
    vm.createContext(ctx);
    vm.runInContext(teile.join("\n"), ctx, { filename: datei });
    const rote = [];
    if (ctx._sonde) ctx._sonde.check = (name, ok) => (!ok ? rote.push(name) : null);
    const faelle = [
        ["Wurf", () => Promise.reject(new Error("Sonden-Attrappe wirft")), true],
        ["null", () => Promise.resolve(null), true],
        ["undefined", () => Promise.resolve(undefined), true],
        ["Wert", () => Promise.resolve({ gemessen: 1 }), false],
    ];
    for (const [fall, evaluate, sollRot] of faelle) {
        const vorher = rote.length;
        let res;
        try {
            res = await ctx.safeEvaluate({ evaluate }, () => 1);
        } catch (e) {
            funde.push(`${datei}: safeEvaluate wirft beim Fall „${fall}" (${(e && e.message) || e})`);
            continue;
        }
        const wurdeRot = rote.length > vorher;
        if (sollRot && !wurdeRot)
            funde.push(`${datei}: safeEvaluate liefert beim Fall „${fall}" still ${res} — keine rote Prüfung`);
        if (!sollRot && (wurdeRot || !res || res.gemessen !== 1))
            funde.push(`${datei}: safeEvaluate verfälscht einen gemessenen Wert (Fall „${fall}")`);
    }
    return { funde, aufrufe, baender: baender.size };
}

async function vakuumKlinge(root) {
    const playtestSrc = fs.readFileSync(path.join(root, "scripts", "playtest.cjs"), "utf8");
    const v3 = await pruefeSonde(playtestSrc);
    return { regeln: { V3: v3.funde }, v3 };
}

async function selftest() {
    const fails = [];
    // Klinge 1a: eine injizierte Probe hebt den Zähler über den Ratchet.
    const inject = "const x = 1;\n" + "y.toString();\n".repeat(FROZEN_TOSTRING + 1);
    if (scanRatchet(inject).errs.length !== 1) fails.push("Ratchet feuert nicht bei Injektion");
    // Klinge 1b: ein bloßer Kommentar zählt NICHT (die __codeOf-Disziplin).
    const comment = "const x = 1;\n" + "// y.toString() im Kommentar\n".repeat(FROZEN_TOSTRING + 5);
    if (countToString(comment) !== 0) fails.push("Ratchet zählt Kommentare mit (soll: 0)");
    // Klinge 1c (V18.462): der typeof-Ratchet feuert bei Injektion über den Bestand.
    const injectT = 'typeof r.probe === "function";\n'.repeat(FROZEN_TYPEOF + 1);
    if (!scanRatchet(injectT).errs.some((e) => /typeof-Ratchet/.test(e)))
        fails.push("typeof-Ratchet feuert nicht bei Injektion");
    if (countTypeof('// typeof r.x === "function" im Kommentar\n'.repeat(9)) !== 0)
        fails.push("typeof-Ratchet zählt Kommentare mit (soll: 0)");
    // Klinge 2: ein erfundenes Katalog-Symbol feuert die Katalog-Prüfung.
    const fakePlaytest =
        'window.__consumes = () => {};\nwindow.__anker = Object.freeze({\n    phantom: "_esGibtMichNicht9x7",\n});\n';
    const r = scanAnker(fakePlaytest, "class A { echteMethode() {} }");
    if (r.errs.length !== 1 || !/phantom/.test(r.errs[0]))
        fails.push("Katalog-Prüfung feuert nicht bei Phantom-Symbol");
    // Vakuum-Klinge V3: eine Harness-Kopie, deren safeEvaluate still null liefert, wird ROT; die laute bleibt grün.
    const still =
        "async function safeEvaluate(page, fn) {\n    return await page.evaluate(fn).catch(() => null);\n}\n";
    const v3Still = await pruefeSonde(still, "still.cjs");
    if (v3Still.funde.length !== 3) fails.push(`V3 feuert nicht an der stillen Sonde (${v3Still.funde.length}/3 Fälle)`);
    const laut =
        'const _sonde = { band: "B", check: null };\n' +
        "function _sondeRot(n, d) {\n    _sonde.check(n, false, d);\n}\n" +
        "async function safeEvaluate(page, fn) {\n    let w = null;\n" +
        "    const r = await page.evaluate(fn).catch((e) => ((w = e), null));\n" +
        '    if (w || r == null) _sondeRot("B: Sonde", "x");\n    return r;\n}\n';
    const v3Laut = await pruefeSonde(laut, "laut.cjs");
    if (v3Laut.funde.length) fails.push("V3 feuert fälschlich an der lauten Sonde: " + v3Laut.funde.join(" · "));
    if (fails.length) {
        console.log("❌ SELBST-TEST: " + fails.join(" · "));
        process.exit(1);
    }
    console.log(
        "✅ SELBST-TEST: die Klingen feuern (Ratchet + Katalog + Vakuum V3 an der stillen Sonde), Kommentare zählen nicht"
    );
    process.exit(0);
}

async function main() {
    if (process.argv.includes("--selftest")) await selftest();
    const root = path.join(__dirname, "..");
    const playtestSrc = fs.readFileSync(path.join(root, "scripts", "playtest.cjs"), "utf8");
    const stammSrc = fs.readFileSync(path.join(root, "anazhRealm.js"), "utf8");
    const ratchet = scanRatchet(playtestSrc);
    const anker = scanAnker(playtestSrc, stammSrc);
    const klinge = await vakuumKlinge(root);
    const errs = ratchet.errs.concat(anker.errs);
    for (const [regel, funde] of Object.entries(klinge.regeln))
        for (const fund of funde) errs.push(`Vakuum-Klinge ${regel}: ${fund}`);
    if (errs.length) {
        console.log("⛔ DIE APPARAT-LINSE:");
        for (const e of errs) console.log("   ❌ " + e);
        process.exit(1);
    }
    if (ratchet.n < FROZEN_TOSTRING)
        console.log(
            `ℹ️  Der Bestand sank (${ratchet.n} < ${FROZEN_TOSTRING}) — FROZEN_TOSTRING in scripts/diag-apparat.cjs nachziehen (der Ratchet darf enger).`
        );
    if (ratchet.nT < FROZEN_TYPEOF)
        console.log(
            `ℹ️  Der typeof-Bestand sank (${ratchet.nT} < ${FROZEN_TYPEOF}) — FROZEN_TYPEOF nachziehen (der Ratchet darf enger).`
        );
    console.log(
        `✅ DIE APPARAT-LINSE steht — ${ratchet.n}/${FROZEN_TOSTRING} rohe .toString()-Zitate + ` +
            `${ratchet.nT}/${FROZEN_TYPEOF} typeof-Existenz-Proben (beide Ratchets nur-sinkend), ` +
            `${anker.entries.length} Anker zeigen auf lebenden Stamm-Code, __consumes + __anker installiert.`
    );
    console.log(
        `✅ DIE VAKUUM-KLINGE steht — V3: die EINE Sonde verbucht Wurf und leeres Ergebnis rot ` +
            `(${klinge.v3.aufrufe} Aufrufe in ${klinge.v3.baender} Bändern hängen an ihr).`
    );
}

main().catch((e) => {
    console.log("⛔ DIE APPARAT-LINSE brach: " + ((e && e.stack) || e));
    process.exit(1);
});
