#!/usr/bin/env node
/*
 * gate:source-probes — DIE QUELL-PROBEN-LINSE (rein statisch, in `npm run check`, Sekunden). Drei Wände, Gesetz #0:
 *  1) STALE: jedes geprobte `r.<symbol>` der Richter-Dateien (scripts/playtest*) lebt im Stamm (+ Worker-Spiegel) — eine
 *     Absenz an einem toten Symbol passte vakuös (die c1c1271-Klasse); seit D3d wirft der Absenz-Helfer dort auch im Lauf.
 *  2) NEBENWELT-QUELL-WAND (Studio-Welle S1): keine Richter-Datei liest eine Datei unter worlds/ (readFile*, fetch,
 *     require) — eine Welt beweist ihr KONSUM (gate:portal-konformanz), nie ein Quelltext-Zitat.
 *  3) QUELLTEXT-WAND (PFLICHT-OFFEN D3 Teil 3, Karte D3d): keine Präsenz-Probe liest Quelltext. Ein LESER ist in scripts/
 *     (ohne Kommentare, Literale bleiben) jeder Griff nach Spiel-Quelltext als Text — in der Seite `__codeOf`/`__dokuOf`
 *     (Ruf oder Alias), `<r|P|A|…>.x.toString()` und `String(r._x)`; in Node der virtuelle Stamm (`stammLib.text`,
 *     `textAusRev`) und `readFileSync` bzw. `ausDatei` auf Spiel-Code (*.js, index.html). Eine Absenz liest über den EINEN Helfer
 *     (`window.__fehlt` aus scripts/lib/welt-boot.cjs, `stammLib.fehlt`) und zählt nie. Jeder andere Leser steht je Datei
 *     und Art in spec/profiband/ratsche-quelltext.json: `liste` die Struktur- und Mess-Leser mit Zweck, `ratsche` die
 *     Präsenz-Reste beim Namen (sie sinkt nur). ROT beim Namen (Datei:Zeile): ein Leser über der Zahl seiner Datei; ROT:
 *     eine Zahl über dem Ist (sie sinkt nach), eine Datei in Liste und Ratsche.
 * Kommentare fallen ZUERST (der EINE Stripper): ein Doku-Zitat ist kein Leser. Der Immer-Selbsttest läuft vor jedem Scan,
 * `--selftest` nennt jede Wand einzeln.
 */
"use strict";

const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");
const stammLib = require("./lib/stamm.cjs");

const ROOT = path.resolve(__dirname, "..");
const lies = (f) => fs.readFileSync(path.join(ROOT, f), "utf8");
const ohne = (src, ohneLiterale) => stammLib.ohneKommentare(src, ohneLiterale);
const GATE_FILES = ["scripts/playtest.cjs", "scripts/playtest-fast.cjs", ...fs.readdirSync(path.join(ROOT, "scripts/playtest")).map((f) => "scripts/playtest/" + f)];
const CODE_FILES = [...stammLib.dateien(ROOT), "voxel-worker.js"];

// 1) STALE — die Ketten `r.<a.b>` an `.toString()`, `__codeOf(…)` und `__fehlt(…)` gegen die Wörter des Code-Korpus.
const KETTE = String.raw`r\.([A-Za-z_$][\w$]*(?:\.[A-Za-z_$][\w$]*)*)`;
const PROBE_RX = [
    new RegExp(String.raw`\b${KETTE}\s*\.toString\s*\(`, "g"),
    new RegExp(String.raw`__(?:codeOf|fehlt)\(\s*${KETTE}\s*[),]`, "g"),
];
function extractProbes(code) {
    const chains = new Map();
    for (const rx of PROBE_RX) for (const m of code.matchAll(rx)) chains.set(m[1], (chains.get(m[1]) || 0) + 1);
    return chains;
}
const praesenzVon = (korpus) => new Set(korpus.match(/[A-Za-z_$][\w$]*/g));
function staleBefund(gateFiles, present) {
    const probes = new Map();
    for (const f of gateFiles.filter((g) => fs.existsSync(path.join(ROOT, g))))
        for (const [chain, n] of extractProbes(ohne(lies(f), true))) {
            const e = probes.get(chain) || { n: 0, files: new Set() };
            (e.n += n), e.files.add(f), probes.set(chain, e);
        }
    const stale = [...probes]
        .map(([chain, e]) => ({ chain, ...e, fehlt: chain.split(".").filter((s) => !present.has(s)) }))
        .filter((s) => s.fehlt.length);
    return { probes, stale };
}

// 2) NEBENWELT — jeder Lese-Aufruf, dessen Argument (Klammern gezählt) ein Literal `worlds` bzw. `worlds/…` trägt; ein
// Pfad als Datenwert (`{ world: "worlds/x/index.html" }`) ist kein Lesen.
function findWorldSourceReads(code) {
    const hits = [];
    const re = /\b(readFileSync|readFile|ausDatei|fetch|require)\s*\(/g;
    for (let m; (m = re.exec(code)) !== null; ) {
        let depth = 1,
            j = re.lastIndex;
        for (; j < code.length && depth > 0 && j - re.lastIndex < 400; j++) depth += code[j] === "(" ? 1 : code[j] === ")" ? -1 : 0;
        const arg = code.slice(re.lastIndex, j);
        if (/["'`]worlds(?:["'`]|\/)/.test(arg))
            hits.push({ line: code.slice(0, m.index).split("\n").length, call: m[1], arg: arg.replace(/\s+/g, " ").slice(0, 110) });
    }
    return hits;
}
const scanWorldSourceReads = (gateFiles) =>
    gateFiles.filter((f) => fs.existsSync(path.join(ROOT, f))).flatMap((f) => findWorldSourceReads(ohne(lies(f), false)).map((h) => ({ file: f, ...h })));

// 3) QUELLTEXT-WAND — die Leser je Art, die Tafel, das Urteil.
const TAFEL = "spec/profiband/ratsche-quelltext.json";
const HEIM = "scripts/lib/welt-boot.cjs"; // trägt __codeOf, __dokuOf und __fehlt in jede Seite
const ARG = String.raw`\((?:[^()\n]|\((?:[^()\n]|\([^()\n]*\))*\))*\)`;
const SPIEL = String.raw`\b(?:r|P|A|R|proto|realm)(?:\.[\w$]+|\[[^\]\n]+\])*`;
const LESER = {
    seite: new RegExp(String.raw`\b__(?:code|doku)Of\b(?!\s*=[^=>])|${SPIEL}\.toString\(\)|\bString\(\s*${SPIEL}\._[\w$]*\s*\)`, "g"),
    stamm: /\b(?:stammLib|stamm|S|L)\.(?:text|textAusRev)\(/g,
    datei: new RegExp("(?:readFileSync|ausDatei)" + ARG, "g"), // der EINE Datei-Leser (welt-boot `ausDatei`) ist ein Leser wie readFileSync
};
const SPIEL_DATEI = /\.(?:c|m)?js["'`]|index\.html|versionsDatei/;
const HELFER = /__fehlt\(|(?<!function )\bfehlt\(/g;
function leserIn(text) {
    const out = [];
    ohne(text, false)
        .split("\n")
        .forEach((z, i) => {
            for (const [art, rx] of Object.entries(LESER))
                for (const m of z.matchAll(rx))
                    if (art !== "datei" || SPIEL_DATEI.test(m[0])) out.push({ art, zeile: i + 1, was: m[0].slice(0, 70) });
        });
    return out;
}
function quelltextBefund(dateien, tafel) {
    const errs = [];
    const ist = new Map();
    for (const { pfad, text } of dateien) if (pfad !== HEIM && leserIn(text).length) ist.set(pfad, leserIn(text));
    const L = tafel.liste || {},
        R = tafel.ratsche || {};
    for (const pfad of new Set([...ist.keys(), ...Object.keys(L), ...Object.keys(R)])) {
        if (L[pfad] && R[pfad]) {
            errs.push(`QUELLTEXT-WAND: ${pfad} steht in Liste UND Ratsche — eine Datei, eine Zugehörigkeit`);
            continue;
        }
        const soll = L[pfad] || R[pfad] || {};
        const st = ist.get(pfad) || [];
        for (const art of Object.keys(LESER)) {
            const da = st.filter((s) => s.art === art);
            const s = soll[art] || 0;
            if (da.length > s)
                for (const x of da)
                    errs.push(
                        `QUELLTEXT-WAND: ${pfad}:${x.zeile} liest Quelltext (${art} ${da.length} > ${s}: ${x.was}) — eine Absenz ` +
                            `liest über __fehlt / stammLib.fehlt, ein Struktur-Leser steht mit Zweck in der Liste, Präsenz beweist Konsum`
                    );
            else if (da.length < s)
                errs.push(`QUELLTEXT-WAND: ${pfad} trägt ${s} ${art}-Leser in der ${L[pfad] ? "Liste" : "Ratsche"}, gelesen ${da.length} — die Zahl sinkt nach (${TAFEL})`);
        }
    }
    return { errs, ist };
}

// DIE SELBSTTESTS — aus Stücken gebaut (die Wand liest auch diese Datei).
function selbsttest() {
    const C = "__code" + "Of",
        F = "__fe" + "hlt",
        TS = ".to" + "String()",
        T = "stammLib.te" + "xt";
    const present = new Set(["realA", "realB"]);
    const tot = (chain) => chain.split(".").filter((s) => !present.has(s));
    const stale =
        tot("ghostSym").length === 1 &&
        tot("realA").length === 0 &&
        extractProbes(`const y = r.realA${TS};`).has("realA") &&
        extractProbes(`window.${F}(r.realB, /x/);`).has("realB") &&
        !extractProbes(ohne(`// ${C}(r.ghostSym)\n`, true)).has("ghostSym");
    const fang = [
        `const src = fs.readFile` + `Sync(path.join(__dirname, "..", "worlds", "fluid/fluid.js"), "utf8");`,
        "const b = await (await fetch('worlds/skeleton/skeleton.js')).text();",
        `const t = aus` + `Datei("worlds/fluid/fluid.js");`,
        `const m = JSON.parse(fs.readFile` + `Sync(\n  path.join(__dirname, "..", "worlds", file),\n  "utf8"));`,
    ];
    const frei = [
        'r._sanitizePortalMeta({ world: "worlds/skeleton/index.html" }, "fb");',
        `// fs.readFile` + `Sync(path.join(__dirname, "..", "worlds", "x.js"))\nconst y = 1;`,
        'const src = await fetch("voxel-worker.js").then((x) => x.text());',
    ];
    const welt =
        fang.every((c) => findWorldSourceReads(ohne(c, false)).length === 1) && frei.every((c) => !findWorldSourceReads(ohne(c, false)).length);
    const w = (text, tafel = {}) => quelltextBefund([{ pfad: "scripts/x-probe.cjs", text }], tafel).errs;
    const faelle = {
        praesenz: w(`out.ok = window.${C}(r._x).includes("y");`),
        absenz: w(`out.ok = window.${F}(r._x, /y/) && stammLib.${"fe" + "hlt"}("_x", /y/);`),
        kommentar: w(`// window.${C}(r._x) erklärt nur\nconst x = 1;`),
        roh: w(`const s = r._x${TS};\nconst t = Str` + `ing(r._y);`),
        node: w(`const q = ${T}(root);\nconst h = fs.readFile` + `Sync(path.join(root, "index.html"), "utf8");\nconst k = aus` + `Datei("phyto-core.js");`),
        gelistet: w(`const q = ${T}(root);`, { liste: { "scripts/x-probe.cjs": { stamm: 1 } } }),
        hoch: w(`const q = ${T}(root);`, { ratsche: { "scripts/x-probe.cjs": { stamm: 2 } } }),
        beide: w("", { liste: { "scripts/x-probe.cjs": {} }, ratsche: { "scripts/x-probe.cjs": {} } }),
    };
    const f = faelle;
    const wand =
        f.praesenz.length === 1 &&
        f.praesenz[0].startsWith("QUELLTEXT-WAND: scripts/x-probe.cjs:1 ") &&
        !f.absenz.length &&
        !f.kommentar.length &&
        f.roh.length === 2 &&
        f.node.length === 3 &&
        !f.gelistet.length &&
        f.hoch.length === 1 &&
        /sinkt nach/.test(f.hoch[0]) &&
        f.beide.length === 1;
    const zahl = Object.entries(f).map(([k, v]) => `${k}=${v.length}`).join(" ");
    return { ok: stale && welt && wand, zeile: `stale ${stale} · nebenwelt ${welt} · quelltext ${wand} (${zahl})` };
}

function main() {
    const t0 = Date.now();
    const st = selbsttest();
    if (process.argv.includes("--selftest")) {
        console.log(`${st.ok ? "✅" : "❌"} SELBSTTEST gate:source-probes — ${st.zeile}`);
        process.exit(st.ok ? 0 : 1);
    }
    if (!st.ok) {
        console.error(`❌ SELBSTCHECK FEHLGESCHLAGEN — die Linse ist blind (${st.zeile}). Kein verlässliches Grün.`);
        process.exit(2);
    }
    const korpus = CODE_FILES.map((f) => {
        if (!fs.existsSync(path.join(ROOT, f))) throw new Error(`source-probes: der Korpus ${f} fehlt`);
        return ohne(lies(f), true);
    }).join("\n");
    const { probes, stale } = staleBefund(GATE_FILES, praesenzVon(korpus));
    const welt = scanWorldSourceReads(GATE_FILES);
    const skripte = execFileSync("git", ["ls-files", "--cached", "--others", "--exclude-standard", "scripts"], { cwd: ROOT, encoding: "utf8" })
        .split("\n")
        .filter((p) => /\.(c|m)?js$/.test(p) && fs.existsSync(path.join(ROOT, p)))
        .map((p) => ({ pfad: p, text: lies(p) }));
    const tafel = JSON.parse(lies(TAFEL));
    const wand = quelltextBefund(skripte, tafel);
    const helfer = skripte.reduce((s, d) => s + (ohne(d.text, false).match(HELFER) || []).length, 0);
    const summe = (T) => Object.values(T || {}).reduce((s, e) => s + Object.keys(LESER).reduce((a, k) => a + (e[k] || 0), 0), 0);
    const errs = [
        ...stale.map((s) => `STALE: r.${s.chain} (${s.n}× in ${[...s.files].join(", ")}) — fehlt im Code: ${s.fehlt.join(", ")}`),
        ...welt.map((h) => `NEBENWELT: ${h.file}:${h.line} ${h.call}(${h.arg}) — eine Welt beweist ihr Konsum, nie ein Zitat`),
        ...wand.errs,
    ];
    console.log(
        `gate:source-probes — ${probes.size} geprobte r.<symbol> · Nebenwelt ${welt.length} Lese-Aufrufe · Quelltext-Wand: ` +
            `${helfer} Absenzen über den Helfer, ${summe(tafel.liste)} Struktur-/Mess-Leser auf der Liste ` +
            `(${Object.keys(tafel.liste || {}).length} Dateien), ${summe(tafel.ratsche)} Präsenz-Reste in der Ratsche ` +
            `(${Object.keys(tafel.ratsche || {}).length} Dateien) · ${skripte.length} Skripte in ${Date.now() - t0} ms · Selbsttest feuert`
    );
    if (errs.length) {
        console.error(`gate:source-probes ROT (${errs.length})`);
        for (const e of errs) console.error("  - " + e);
        process.exit(1);
    }
}

main();
