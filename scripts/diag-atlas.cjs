// diag-atlas.cjs — DER STAMM-ATLAS und seine RATSCHE (W6, R-032; Stamm-Zerlegung 13.10., plan §7). Pures fs + acorn,
// kein Browser. Der Stamm ist `stamm/NN[x].js` — EINE Klasse (`AnazhRealm`, der Kern stamm/01.js), ihre Glieder in den
// Zonen-Klassen `AnazhRealm_Z<NN[x]>`, die Naht trägt sie beim Laden auf den EINEN Prototyp; die Liste ist die der
// Stamm-Tags in index.html (scripts/lib/stamm.cjs).
//
//   node scripts/diag-atlas.cjs              → die LIVE-Karte (Datei · Zone · Zeilen · Methoden · Themen)
//   node scripts/diag-atlas.cjs --find <rx>  → verortet Methoden-Definitionen (Datei:Zeile, Zone)
//   node scripts/diag-atlas.cjs --check      → die RATSCHE (exit 1 = rot; in npm run check:statik)
//   node scripts/diag-atlas.cjs --selftest   → je Regel ein Fixture, das ROT wird
//
// DIE RATSCHE (spec/stamm/ratsche.json):
//   R1 KERN    stamm/01.js trägt genau `kern_glieder` Glieder — mehr ist rot, weniger zieht die Zahl nach (sie fällt nur).
//   R2 DECKE   keine Datei über `decke_zeilen` Zeilen; rot mit dem Befehl `stamm-umzug --teile §NN <methode>`.
//   R3 LISTE   Tags in index.html = Dateien unter stamm/ = je Datei genau EIN Marker mit ihrer Nummer = die Naht-Liste;
//              die Nummern steigen streng; die Klasse jeder Zonen-Datei heißt nach ihr; S∘S⁻¹ = id.
//   R4 ZWILLING AST über alle Dateien: jeder Glied-Schlüssel (Prototyp/statisch) und jedes `AnazhRealm.X =`-Ziel ist
//              eindeutig, kein statisches Glied ist zugleich Ziel einer Außen-Zuweisung (§26 ist sloppy: die Zuweisung auf
//              einen Getter schluckte still), keine Außen-Anweisung liest beim Laden eine Konstante, die erst später
//              gesetzt wird, kein Konstruktor außerhalb des Kerns (die Naht trägt ihn nicht).
//   R5 NAME    die alte Stamm-Datei existiert nicht (Lese-Ziel nur in scripts/lib/stamm.cjs: diag-altlasten).
//   R6 CACHE   jeder Stamm-Tag trägt `?v=` = package.json version.
//   Dazu SYNTAX je Datei (V8, wie `node --check`).
"use strict";
const fs = require("fs");
const path = require("path");
const vm = require("vm");
const acorn = require("acorn");
const stammLib = require("./lib/stamm.cjs");

const ROOT = path.resolve(__dirname, "..");
const RATSCHE = "spec/stamm/ratsche.json";

const MARKER_RX = /^\s*\/\/ ===== ATLAS §(\d\d)([a-z]?) · ([^—]+) — (.+?) =====\s*$/;
const METHOD_RX =
    /^ {4}(?:async )?(?:static (?:get )?)?([a-zA-Z_$][a-zA-Z0-9_$]*)\(.*\) \{|^ {4}static (?:get )?([a-zA-Z_$][a-zA-Z0-9_$]*)\b/;
// die Datei-Nummer: stamm/02b.js → "02b"; die Zone selbst heißt §NN, ihre Datei NNa, wenn sie Unter-Schnitte trägt
const idVon = (p) => p.replace(/^.*\/|\.js$/g, "");
const ordnung = (id) => Number(id.slice(0, 2)) * 32 + Math.max(0, (id.charCodeAt(2) || 97) - 96);

// ── die Teile eines Baums ────────────────────────────────────────────────────────────────────────────────────────
function lies(root) {
    const liste = stammLib.dateien(root);
    return liste.map((p) => {
        const text = fs.readFileSync(path.join(root, p), "utf8");
        const lines = text.split("\n");
        const marker = [];
        lines.forEach((l, i) => {
            const m = l.match(MARKER_RX);
            if (m)
                marker.push({
                    id: m[1] + m[2],
                    nn: m[1],
                    x: m[2],
                    name: m[3].trim(),
                    themen: m[4].trim(),
                    line: i + 1,
                });
        });
        return { pfad: p, text, lines, marker, zeilen: text.endsWith("\n") ? lines.length - 1 : lines.length };
    });
}

// ── die Karte ────────────────────────────────────────────────────────────────────────────────────────────────────
function zonenVon(teile) {
    const out = [];
    for (const t of teile)
        t.marker.forEach((m, i) => {
            const ende = i + 1 < t.marker.length ? t.marker[i + 1].line - 1 : t.zeilen;
            let methoden = 0;
            for (let ln = m.line; ln < ende; ln++) if (METHOD_RX.test(t.lines[ln])) methoden++;
            out.push({ ...m, pfad: t.pfad, ende, zeilen: ende - m.line + 1, methoden });
        });
    return out;
}

// ── AST: Glieder, Außen-Zuweisungen, Lese-Zugriffe beim Laden ───────────────────────────────────────────────────
const schluessel = (k) => (k.type === "Identifier" ? k.name : k.type === "Literal" ? String(k.value) : null);
const istAnazh = (n) =>
    n && n.type === "MemberExpression" && n.object.type === "Identifier" && n.object.name === "AnazhRealm";
const eigenschaft = (n) =>
    n.computed ? (n.property.type === "Literal" ? String(n.property.value) : null) : n.property.name;
// was beim Laden läuft: der Ausdruck selbst, ein sofort gerufener Funktions-Ausdruck und die Rückrufe der Feld-Methoden
const SOFORT = new Set([
    "forEach",
    "map",
    "filter",
    "reduce",
    "some",
    "every",
    "find",
    "flatMap",
    "sort",
    "fromEntries",
]);
function ladeLeser(knoten, aus) {
    const out = [];
    const geh = (n, sofort) => {
        if (!n || typeof n.type !== "string") return;
        if (n === aus) return;
        if (/Function/.test(n.type) && !sofort) return;
        if (n.type === "ClassExpression" || n.type === "ClassDeclaration") return;
        if (istAnazh(n)) {
            const y = eigenschaft(n);
            if (y) out.push({ name: y, at: n.start });
        }
        if (n.type === "CallExpression") {
            const callee = n.callee;
            const iife = /Function/.test(callee.type);
            const feld = callee.type === "MemberExpression" && SOFORT.has(eigenschaft(callee) || "");
            geh(callee, iife);
            for (const a of n.arguments) geh(a, feld && /Function/.test(a.type));
            return;
        }
        for (const k of Object.keys(n)) {
            if (k === "type" || k === "start" || k === "end" || k === "loc") continue;
            const v = n[k];
            if (Array.isArray(v)) for (const c of v) geh(c, false);
            else if (v && typeof v.type === "string") geh(v, false);
        }
    };
    geh(knoten, false); // eine Funktions-Deklaration oben läuft nicht beim Laden
    return out;
}

// ── die Ratsche ──────────────────────────────────────────────────────────────────────────────────────────────────
function pruefe(root, opt = {}) {
    const fehler = [];
    const R = opt.ratsche || JSON.parse(fs.readFileSync(path.join(root, RATSCHE), "utf8"));
    const info = {};
    // R5 der Name ist tot
    if (fs.existsSync(path.join(root, stammLib.ALT)))
        fehler.push(
            `R5 NAME: ${stammLib.ALT} lebt — der Stamm ist ${stammLib.DIR}/ (die Datei fällt, Lese-Ziel nur in scripts/lib/stamm.cjs)`
        );
    // R3 die EINE Liste (Tags = Platte; die lib wirft mit den fremden und fehlenden Pfaden)
    let teile;
    try {
        if (stammLib.layout(root) !== "zonen")
            throw new Error(`Layout ${stammLib.layout(root)} statt ${stammLib.DIR}/`);
        teile = lies(root);
    } catch (e) {
        fehler.push(`R3 LISTE: ${e.message}`);
        return { fehler, info };
    }
    // SYNTAX je Datei — V8 wie `node --check`
    for (const t of teile) {
        try {
            new vm.Script(t.text, { filename: t.pfad });
        } catch (e) {
            fehler.push(`SYNTAX ${t.pfad}: ${e.message}`);
        }
    }
    // R3 je Datei genau EIN Marker mit ihrer Nummer, streng steigend; S∘S⁻¹ = id (die Naht-Liste = die Zonen-Klassen)
    const teilt = new Set(teile.filter((t) => /[b-z]$/.test(idVon(t.pfad))).map((t) => idVon(t.pfad).slice(0, 2)));
    for (let i = 0; i < teile.length; i++) {
        const t = teile[i];
        const id = idVon(t.pfad);
        const soll = /a$/.test(id) ? id.slice(0, 2) : id;
        if (t.marker.length !== 1) fehler.push(`R3 LISTE: ${t.pfad} trägt ${t.marker.length} Marker statt genau einem`);
        else if (t.marker[0].id !== soll)
            fehler.push(`R3 LISTE: ${t.pfad} trägt den Marker §${t.marker[0].id} statt §${soll}`);
        if (/^\d\d$/.test(id) && teilt.has(id)) fehler.push(`R3 LISTE: ${t.pfad} neben Unter-Schnitten heißt ${id}a`);
        if (i > 0 && ordnung(id) <= ordnung(idVon(teile[i - 1].pfad)))
            fehler.push(`R3 LISTE: die Ordnung bricht — ${teile[i - 1].pfad} → ${t.pfad}`);
    }
    try {
        const T = stammLib.fuege(teile);
        const S = stammLib.schneide(T);
        const ab =
            S.length !== teile.length
                ? `${S.length} statt ${teile.length} Dateien`
                : (S.find((x, i) => x.pfad !== teile[i].pfad || x.text !== teile[i].text) || {}).pfad;
        if (ab)
            fehler.push(
                `R3 LISTE: S∘S⁻¹ ≠ id (${ab}) — die Naht-Liste, die Klassen-Namen und die Marker folgen den Dateien`
            );
    } catch (e) {
        fehler.push(`R3 LISTE: ${e.message}`);
    }
    // R6 Cache: jeder Stamm-Tag trägt ?v= = package.version
    const version = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8")).version;
    for (const tag of stammLib.tagsVon(fs.readFileSync(path.join(root, "index.html"), "utf8")))
        if (tag.v !== `?v=${version}`)
            fehler.push(`R6 CACHE: ${tag.pfad}${tag.v || " (ohne ?v=)"} statt ?v=${version}`);
    // R2 die Decke
    for (const t of teile)
        if (t.zeilen > R.decke_zeilen) {
            const mitte = Math.round(t.zeilen / 2);
            let methode = "<methode>";
            for (let ln = mitte; ln < t.zeilen; ln++) {
                const m = t.lines[ln].match(METHOD_RX);
                if (m) {
                    methode = m[1] || m[2];
                    break;
                }
            }
            fehler.push(
                `R2 DECKE: ${t.pfad} trägt ${t.zeilen} Zeilen > ${R.decke_zeilen} — node scripts/stamm-umzug.cjs --teile §${idVon(t.pfad).slice(0, 2)} ${methode}`
            );
        }
    // R1 + R4 über den AST
    const glieder = new Map(); // "P|name" → [ort]
    const statisch = new Map(); // name → ort (statische Glieder: Methoden, Getter, Felder)
    const ziele = new Map(); // name → [{ ort, idx }]
    const aussen = []; // { t, s, idx }
    let kern = 0;
    let idx = 0;
    for (const t of teile) {
        let ast;
        try {
            ast = acorn.parse(t.text, { ecmaVersion: "latest", sourceType: "script", locations: true });
        } catch (e) {
            fehler.push(`R4 ZWILLING: ${t.pfad} parst nicht (${e.message})`);
            continue;
        }
        for (const s of ast.body) {
            if (s.type === "ClassDeclaration" && /^AnazhRealm(_Z\d\d[a-z]?)?$/.test(s.id.name)) {
                const istKern = s.id.name === "AnazhRealm";
                for (const g of s.body.body) {
                    const ort = `${t.pfad}:${g.loc.start.line}`;
                    if (istKern) kern++;
                    if (g.type === "StaticBlock") {
                        fehler.push(`R4 ZWILLING: ${ort} ein static-Block (die Naht trägt nur Glieder)`);
                        continue;
                    }
                    const n = g.computed ? null : schluessel(g.key);
                    if (n == null) {
                        fehler.push(`R4 ZWILLING: ${ort} ein berechneter Schlüssel`);
                        continue;
                    }
                    if (g.kind === "constructor") {
                        if (!istKern)
                            fehler.push(`R4 ZWILLING: ${ort} ein Konstruktor in einer Zone (die Naht trägt ihn nicht)`);
                        continue;
                    }
                    const k = `${g.static ? "S" : "P"}|${n}`;
                    const art = g.kind === "get" || g.kind === "set" ? g.kind : "w";
                    const schon = glieder.get(k) || [];
                    // ein Paar get/set desselben Namens ist EIN Glied; alles andere doppelt ist ein Zwilling
                    if (schon.some((x) => x.art === "w" || x.art === art || art === "w"))
                        fehler.push(
                            `R4 ZWILLING: ${g.static ? "static " : ""}${n} in ${schon.map((x) => x.ort).join(", ")} und ${ort}`
                        );
                    glieder.set(k, schon.concat({ ort, art }));
                    if (g.static) statisch.set(n, ort);
                }
                continue;
            }
            if (s.type === "ClassDeclaration") continue;
            // außerhalb: die Außen-Konstanten (§26) und der Boot
            const e = s.type === "ExpressionStatement" ? s.expression : null;
            const ziel = e && e.type === "AssignmentExpression" && istAnazh(e.left) ? eigenschaft(e.left) : null;
            const ort = `${t.pfad}:${s.loc.start.line}`;
            if (ziel) ziele.set(ziel, (ziele.get(ziel) || []).concat({ ort, idx }));
            aussen.push({ s, ort, idx, aus: ziel ? e.left : null });
            idx++;
        }
    }
    info.kern = kern;
    info.glieder = glieder.size;
    info.ziele = ziele.size;
    if (kern > R.kern_glieder)
        fehler.push(
            `R1 KERN: stamm/01.js trägt ${kern} Glieder > ${R.kern_glieder} — der Kern wächst nie, das Glied gehört in seine Zone`
        );
    else if (kern < R.kern_glieder)
        fehler.push(
            `R1 KERN: stamm/01.js trägt ${kern} Glieder < ${R.kern_glieder} — die Ratsche fällt mit: ${RATSCHE} kern_glieder ${kern}`
        );
    for (const [n, os] of ziele) {
        if (os.length > 1)
            fehler.push(`R4 ZWILLING: AnazhRealm.${n} = steht ${os.length}× (${os.map((o) => o.ort).join(", ")})`);
        if (statisch.has(n))
            fehler.push(
                `R4 ZWILLING: AnazhRealm.${n} = (${os[0].ort}) trifft das statische Glied ${statisch.get(n)} — die Zuweisung schluckte still`
            );
    }
    info.lese = 0; // die Lade-Leser von Außen-Zielen (die Regel sieht sie — eine Zahl 0 hieße blind)
    for (const a of aussen)
        for (const l of ladeLeser(a.s, a.aus)) {
            if (statisch.has(l.name)) continue;
            const z = ziele.get(l.name);
            if (z) info.lese++;
            if (z && z.every((o) => o.idx > a.idx))
                fehler.push(`R4 ZWILLING: ${a.ort} liest beim Laden AnazhRealm.${l.name}, gesetzt erst in ${z[0].ort}`);
        }
    return { fehler, info };
}

// ── Selbsttest: je Regel ein Fixture, das ROT wird ──────────────────────────────────────────────────────────────
function selbsttest() {
    const os = require("os");
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "atlas-ratsche-"));
    const R = { kern_glieder: 2, decke_zeilen: 40 };
    const fx = [
        "// Kopf",
        "class AnazhRealm {",
        "    // ===== ATLAS §01 · KERN — a =====",
        "    constructor() {}",
        "    init() {}",
        "",
        "    // ===== ATLAS §02 · ZWEI — b =====",
        "    zwei() {}",
        "    static get FROZEN() {",
        "        return 1;",
        "    }",
        "",
        "    // ===== ATLAS §02b · ZWEI — Block X =====",
        "    zweiB() {}",
        "",
        "    // ===== ATLAS §03 · DREI — c =====",
        "    drei() {}",
        "}",
        "",
        "// ===== ATLAS §26 · AUSSEN — d =====",
        'AnazhRealm.VERSION = "1.2.3";',
        "",
        "// ===== ATLAS §26b · AUSSEN — Block Y =====",
        "AnazhRealm.X = 1;",
        "AnazhRealm.Y = AnazhRealm.X + 1;",
        "",
    ].join("\n");
    const html = (pfade, v = "1.2.3") =>
        "<html>\n" + pfade.map((p) => `        <script src="${p}?v=${v}" defer></script>`).join("\n") + "\n</html>\n";
    let n = 0;
    const baum = (mut = {}) => {
        const d = path.join(tmp, `b${n++}`);
        fs.mkdirSync(path.join(d, stammLib.DIR), { recursive: true });
        const S = stammLib.schneide(mut.fx ? mut.fx(fx) : fx).map((x) => ({ ...x }));
        if (mut.teile) mut.teile(S);
        for (const x of S) fs.writeFileSync(path.join(d, x.pfad), x.text);
        let pfade = S.map((x) => x.pfad);
        if (mut.pfade) pfade = mut.pfade(pfade);
        fs.writeFileSync(path.join(d, "index.html"), html(pfade, mut.v));
        fs.writeFileSync(path.join(d, "package.json"), JSON.stringify({ version: "1.2.3" }));
        if (mut.alt) fs.writeFileSync(path.join(d, stammLib.ALT), fx);
        return d;
    };
    let rot = 0;
    const fall = (name, rx, mut, r = R) => {
        const { fehler } = pruefe(baum(mut), { ratsche: r });
        const ok = rx ? fehler.some((f) => rx.test(f)) : fehler.length === 0;
        console.log(`${ok ? "  ok " : "  ROT"} ${name}${ok ? "" : " — " + (fehler.join(" | ") || "kein Fehler")}`);
        if (!ok) rot++;
    };
    try {
        fall("das Fixture ist grün", null, {});
        fall("SYNTAX: ein Bruch in einer Zone nennt die Datei", /^SYNTAX stamm\/02b\.js/, {
            teile: (S) => (S[2].text = S[2].text.replace("zweiB() {}", "zweiB() { return ) }")),
        });
        fall("R1 KERN: ein Glied mehr im Kern", /^R1 KERN: .* 3 Glieder > 2/, {
            fx: (t) => t.replace("    init() {}", "    init() {}\n    neu() {}"),
        });
        fall("R1 KERN: ein Glied weniger zieht die Ratsche nach", /^R1 KERN: .* 1 Glieder < 2/, {
            fx: (t) => t.replace("    init() {}\n", ""),
        });
        fall("R2 DECKE: eine Datei über der Decke nennt --teile", /^R2 DECKE: stamm\/03\.js .*--teile §03 /, {
            fx: (t) =>
                t.replace(
                    "    drei() {}",
                    Array.from({ length: 30 }, (_, i) => `    drei${i}() {\n        return ${i};\n    }`).join("\n")
                ),
        });
        fall("R3 LISTE: ein Tag fehlt", /^R3 LISTE: .*ohne Tag: stamm\/03\.js/, {
            pfade: (p) => p.filter((x) => x !== "stamm/03.js"),
        });
        fall("R3 LISTE: die Naht-Liste trägt eine Zone nicht", /^R3 LISTE: .*Naht-Ruf/, {
            teile: (S) => (S[4].text = S[4].text.replace("    AnazhRealm_Z03,\n", "")),
        });
        fall("R3 LISTE: ein zweiter Marker in einer Datei", /^R3 LISTE: stamm\/03\.js trägt 2 Marker/, {
            teile: (S) =>
                (S[3].text = S[3].text.replace(
                    "    drei() {}",
                    "    drei() {}\n\n    // ===== ATLAS §03 · DREI — c ====="
                )),
        });
        fall(
            "R4 ZWILLING: dieselbe Methode in zwei Zonen",
            /^R4 ZWILLING: zwei in stamm\/02a\.js:\d+ und stamm\/03\.js/,
            {
                fx: (t) => t.replace("    drei() {}", "    drei() {}\n    zwei() {}"),
            }
        );
        fall("R4 ZWILLING: AnazhRealm.X = zweimal", /^R4 ZWILLING: AnazhRealm\.X = steht 2×/, {
            fx: (t) => t.replace('AnazhRealm.VERSION = "1.2.3";', 'AnazhRealm.VERSION = "1.2.3";\nAnazhRealm.X = 0;'),
        });
        fall(
            "R4 ZWILLING: static get FROZEN und AnazhRealm.FROZEN =",
            /^R4 ZWILLING: AnazhRealm\.FROZEN = .*statische Glied/,
            {
                fx: (t) => t.replace("AnazhRealm.X = 1;", "AnazhRealm.X = 1;\nAnazhRealm.FROZEN = 2;"),
            }
        );
        fall(
            "R4 ZWILLING: Lesen vor dem Setzen (über die Datei-Grenze)",
            /^R4 ZWILLING: stamm\/26a\.js:\d+ liest beim Laden AnazhRealm\.X/,
            {
                fx: (t) =>
                    t.replace(
                        'AnazhRealm.VERSION = "1.2.3";',
                        'AnazhRealm.VERSION = "1.2.3";\nAnazhRealm.W = [AnazhRealm.X].map((x) => x);'
                    ),
            }
        );
        fall("R4 ZWILLING: ein Konstruktor in einer Zone", /^R4 ZWILLING: stamm\/03\.js:\d+ ein Konstruktor/, {
            fx: (t) => t.replace("    drei() {}", "    constructor() {}\n    drei() {}"),
        });
        fall("R5 NAME: die alte Datei lebt", /^R5 NAME: \S+ lebt — der Stamm ist stamm\//, { alt: true });
        fall("R6 CACHE: ein Tag ohne die Version", /^R6 CACHE: stamm\/01\.js\?v=1\.2\.2 statt \?v=1\.2\.3/, {
            v: "1.2.2",
        });
        // die Lade-Leser: Funktions-Körper laufen später, sofort gerufene und Feld-Rückrufe beim Laden
        const ast = acorn.parse(
            "AnazhRealm.A = function () { return AnazhRealm.B; };\n" +
                "AnazhRealm.C = (() => AnazhRealm.D)();\n" +
                "AnazhRealm.E = [1].map(() => AnazhRealm.F);\n",
            { ecmaVersion: "latest" }
        );
        const ls = ast.body.map((s) =>
            ladeLeser(s, s.expression.left)
                .map((l) => l.name)
                .join(",")
        );
        const ok = ls.join(";") === ";D;F";
        console.log(
            `${ok ? "  ok " : "  ROT"} Lade-Leser: Funktion später, IIFE und Feld-Rückruf sofort — ${ls.join(";")}`
        );
        if (!ok) rot++;
    } finally {
        fs.rmSync(tmp, { recursive: true, force: true });
    }
    return rot;
}

// ── Aufruf ───────────────────────────────────────────────────────────────────────────────────────────────────────
const argv = process.argv.slice(2);
if (argv.includes("--selftest")) {
    console.log("=== ATLAS-RATSCHE — Selbsttest (je Regel ein Fixture, das ROT wird) ===");
    const rot = selbsttest();
    console.log(rot ? `❌ ${rot} Fall/Fälle feuern nicht` : "✅ die Ratsche feuert an jeder Regel");
    process.exit(rot ? 1 : 0);
}
if (argv.includes("--check")) {
    const t0 = Date.now();
    const { fehler, info } = pruefe(ROOT);
    if (fehler.length) {
        console.error("ATLAS-RATSCHE ROT:");
        for (const f of fehler) console.error("  ✗ " + f);
        process.exit(1);
    }
    const R = JSON.parse(fs.readFileSync(path.join(ROOT, RATSCHE), "utf8"));
    const teile = lies(ROOT);
    console.log(
        `Atlas-Ratsche OK — ${teile.length} Dateien (größte ${Math.max(...teile.map((t) => t.zeilen))} ≤ ${R.decke_zeilen} Z.), ` +
            `Kern ${info.kern} Glieder, ${info.glieder} Glied-Schlüssel und ${info.ziele} Außen-Ziele ohne Zwilling, ` +
            `${info.lese} Lade-Leser nach ihrem Ziel, ` +
            `Liste = Tags = Platte = Marker = Naht, ?v= je Tag (${Date.now() - t0} ms)`
    );
    process.exit(0);
}
const teile = lies(ROOT);
const zonen = zonenVon(teile);
const findIdx = argv.indexOf("--find");
if (findIdx >= 0) {
    const rx = new RegExp(argv[findIdx + 1] || "$^");
    let hits = 0;
    for (const t of teile)
        t.lines.forEach((l, i) => {
            const m = l.match(METHOD_RX);
            const name = m && (m[1] || m[2]);
            if (name && rx.test(name)) {
                const z = zonen.filter((z) => z.pfad === t.pfad && z.line <= i + 1).pop();
                console.log(`  ${(t.pfad + ":" + (i + 1)).padEnd(20)} ${name}  →  §${z ? z.id + " " + z.name : "?"}`);
                hits++;
            }
        });
    if (!hits) console.log("  (kein Treffer)");
    process.exit(0);
}
const gesamt = teile.reduce((s, t) => s + t.zeilen, 0);
console.log(`STAMM-ATLAS — ${teile.length} Dateien unter ${stammLib.DIR}/ (${gesamt} Zeilen, ${zonen.length} Zonen)\n`);
for (const z of zonen)
    console.log(
        `  ${z.pfad.padEnd(14)} §${z.id.padEnd(3)} ${z.name.padEnd(28)} ${String(z.zeilen).padStart(5)} Z. ` +
            `${String(z.methoden).padStart(4)} M.  ${z.themen}`
    );
