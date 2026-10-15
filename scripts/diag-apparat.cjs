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
// Dritte Aufgabe (Klinge 3, K38-N2): jede Linse findet eine Methode am NAMEN, nie an ihrer Parameter-Liste.
//
// Selbst-Test: --selftest beweist alle drei Klingen (kein vakuöses Grün):
// (1) eine injizierte .toString()-Probe hebt den Zähler über den Ratchet,
//     ein bloßer Kommentar hebt ihn NICHT; (2) ein erfundenes Katalog-Symbol
// feuert die Katalog-Prüfung; (3) ein Regex- und ein Text-Anker mit Parameter-Liste
// werden mit Datei:Zeile genannt, der Name allein, ein Aufruf und eine fremde Methode schweigen.
// ============================================================================
"use strict";
const fs = require("fs");
const path = require("path");
const stammLib = require("./lib/stamm.cjs");

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

// KLINGE 3 (K38-N2, 15.10.) — die Linse findet eine Methode an ihrem NAMEN, nie an ihrer Parameter-Liste. Ein Anker, der
// die Liste festnagelt (im Regex `_x\(a, b\)\s*\{`, als Text "    _x(a, b) {"), bricht bei jedem neuen Parameter, obwohl das
// geprüfte Gesetz steht: gate:foundry-crossfade fiel so an `_foundryBaumHoehe(preset, entry, wer)` (Zweig-CI 38651527401,
// voll 4/11). Der Name wandert mit: im Regex `_x\([^)]*\)`, im Text `stammLib.kopf(text, "_x")`. Die Klinge liest JEDE Linse
// (scripts/, spec/) Token für Token (acorn) und nennt jede Stelle mit Datei:Zeile; der Bestand ist 0 und bleibt 0.
const PARAM_ANKER_RX = /(_[\w$]+)\\\(((?:[^\\)\n]|\\[^()])*?)\\\)(?:\\s\*|\\s\+| )?\\\{/g;
const PARAM_FREI = "[^)]*";
const KOPF_TEXT_RX = /^\n?[ ]*(?:static\s+|async\s+)*([A-Za-z_$][\w$]*)\(([^()]*)\)\s*\{\s*$/;
function parameterAnker(name, src, stammSrc) {
    const acorn = require("acorn");
    let toks;
    try {
        toks = [
            ...acorn.tokenizer(src, {
                ecmaVersion: "latest",
                locations: true,
                allowHashBang: true,
                allowReturnOutsideFunction: true,
            }),
        ];
    } catch (e) {
        return [`${name}: nicht lesbar (${e.message}) — die Klinge urteilt über jede Linse`];
    }
    const errs = [];
    for (const t of toks) {
        const z = `${name}:${t.loc.start.line}`;
        if (t.type.label === "regexp") {
            for (const m of t.value.pattern.matchAll(PARAM_ANKER_RX))
                if (m[2] !== PARAM_FREI)
                    errs.push(
                        `${z} nagelt die Parameter-Liste von ${m[1]} fest (/${m[0]}/) — am Namen: ${m[1]}\\(${PARAM_FREI}\\)`
                    );
        } else if (t.type.label === "string" || t.type.label === "template") {
            const k = KOPF_TEXT_RX.exec(String(t.value));
            if (k && stammLib.kopf(stammSrc, k[1]) >= 0)
                errs.push(
                    `${z} sucht ${k[1]} an seinem Kopf-Text (${JSON.stringify(String(t.value).trim())}) — am Namen: stammLib.kopf(text, "${k[1]}")`
                );
        }
    }
    return errs;
}
function scanParameterAnker(root, stammSrc) {
    const dateien = [];
    const lauf = (d) => {
        for (const e of fs.readdirSync(d, { withFileTypes: true })) {
            if (e.name === "node_modules" || e.name.startsWith(".")) continue;
            const p = path.join(d, e.name);
            if (e.isDirectory()) lauf(p);
            else if (/\.(c?js|mjs)$/.test(e.name)) dateien.push(p);
        }
    };
    for (const d of ["scripts", "spec"]) if (fs.existsSync(path.join(root, d))) lauf(path.join(root, d));
    const errs = [];
    for (const p of dateien)
        errs.push(...parameterAnker(path.relative(root, p).replace(/\\/g, "/"), fs.readFileSync(p, "utf8"), stammSrc));
    return { n: dateien.length, errs };
}

function selftest() {
    const fails = [];
    // Klinge 3: ein Regex-Anker mit Parameter-Liste und ein Kopf-Text einer Stamm-Methode feuern beim Namen, der Name
    // allein, ein Aufruf und der Kopf einer fremden Methode schweigen.
    const stammFake = "class A {\n    _echt(a, b) {\n        return a;\n    }\n}\n";
    const rot = [
        "const r = /\\n {4}_echt\\(a, b\\)\\s*\\{/;",
        'const k = s.indexOf("    _echt(a, b) {");',
        "const r = /_echt\\(\\) \\{/;",
    ];
    for (const q of rot) {
        const e = parameterAnker("probe.cjs", q, stammFake);
        if (e.length !== 1 || !/probe\.cjs:1 .*_echt/.test(e[0])) fails.push(`Klinge 3 nennt den Anker nicht: ${q}`);
    }
    const gruen = [
        "const r = /\\n {4}_echt\\([^)]*\\)\\s*\\{/;",
        "const r = /this\\._echt\\(a, b\\);/;",
        'const k = stammLib.kopf(s, "_echt");',
        'const k = s.indexOf("    _fremd(a, b) {");',
        "// const r = /\\n {4}_echt\\(a, b\\) \\{/;",
    ];
    for (const q of gruen)
        if (parameterAnker("probe.cjs", q, stammFake).length) fails.push(`Klinge 3 feuert am Namen-Anker: ${q}`);
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
    if (fails.length) {
        console.log("❌ SELBST-TEST: " + fails.join(" · "));
        process.exit(1);
    }
    console.log(
        "✅ SELBST-TEST: alle drei Klingen feuern (Ratchet + Katalog + Parameter-Anker beim Namen), Kommentare zählen nicht"
    );
    process.exit(0);
}

function main() {
    if (process.argv.includes("--selftest")) selftest();
    const root = path.join(__dirname, "..");
    const playtestSrc = fs.readFileSync(path.join(root, "scripts", "playtest.cjs"), "utf8");
    const stammSrc = stammLib.text(root);
    const ratchet = scanRatchet(playtestSrc);
    const anker = scanAnker(playtestSrc, stammSrc);
    const param = scanParameterAnker(root, stammSrc);
    const errs = ratchet.errs.concat(anker.errs, param.errs);
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
            `${anker.entries.length} Anker zeigen auf lebenden Stamm-Code, __consumes + __anker installiert, ` +
            `${param.n} Linsen finden jede Methode am Namen (0 Parameter-Anker).`
    );
}

main();
