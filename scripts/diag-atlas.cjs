// diag-atlas.cjs — DER STAMM-ATLAS und seine RATSCHE (W6, R-032). Pures fs + acorn,
// kein Browser. Der Stamm ist `stamm/<modul>[-<teil>].js` nach der Modul-Karte (spec/stamm/modul-karte.json) — EINE Klasse
// (`AnazhRealm`, im Kern die erste Datei), ihre Glieder in den Zonen-Klassen `AnazhRealm_<modul>[_<teil>]`, deren Naht-Ruf sie
// beim Laden auf den EINEN Prototyp trägt; die Liste ist die der Stamm-Tags in index.html (scripts/lib/stamm.cjs).
//
//   node scripts/diag-atlas.cjs              → die LIVE-Karte (Datei · Zone · Zeilen · Glieder · Themen)
//   node scripts/diag-atlas.cjs --find <rx>  → verortet Glieder, Außen-Ziele, zugewiesene Methoden (`this.x = …` in einem
//                                              Glied) und die Funktionen der Kerne (cores.manifest.json)
//   node scripts/diag-atlas.cjs --check      → die RATSCHE (exit 1 = rot; in npm run check:statik)
//   node scripts/diag-atlas.cjs --selftest   → je Regel ein Fixture, das ROT wird
//
// DIE RATSCHE (spec/stamm/ratsche.json):
//   R2 DECKE   keine Datei über `decke_zeilen` Zeilen; der Weg: die Karte teilt das Modul (Modul/teil), dann der Umzug.
//   R3 LISTE   Tags in index.html = Dateien unter stamm/ = S(Stamm) Byte für Byte (S∘S⁻¹ = id: Marker, Klassen, Naht-Rufe).
//   R4 ZWILLING AST über alle Dateien: jeder Glied-Schlüssel (Prototyp/statisch) und jedes `AnazhRealm.X =`-Ziel ist
//              eindeutig, kein statisches Glied ist zugleich Ziel einer Außen-Zuweisung (die Zuweisung auf einen Getter
//              schluckte still), keine Außen-Anweisung liest beim Laden eine Konstante oder ein statisches Glied, das erst
//              eine spätere Datei setzt, kein Konstruktor außerhalb des Kerns (die Naht trägt ihn nicht).
//   R5 NAME    die alte Stamm-Datei existiert nicht (Lese-Ziel nur in scripts/lib/stamm.cjs: diag-altlasten).
//   R6 CACHE   jeder Stamm-Tag trägt `?v=` = package.json version.
//   R7 DOMÄNE  der Stamm ist der Fixpunkt der Karte (scripts/lib/stamm.cjs `ordne`): jedes Glied und jede Außen-Anweisung
//              steht in der Datei ihres Moduls — ein Fremder ist ROT beim Namen (Datei ist → soll), ebenso ein Name ohne
//              Karte und ein Karten-Name ohne Glied; der Weg: `node scripts/stamm-umzug.cjs --nach-karte`.
//   Dazu SYNTAX je Datei (V8, wie `node --check`).
"use strict";
/* global process, console, __dirname */
const fs = require("fs");
const path = require("path");
const vm = require("vm");
const acorn = require("acorn");
const stammLib = require("./lib/stamm.cjs");

const ROOT = path.resolve(__dirname, "..");
const RATSCHE = "spec/stamm/ratsche.json";
const UMZUG = "node scripts/stamm-umzug.cjs --nach-karte";

// ── die Teile eines Baums: je Datei Text, Zeilen und Marker (mit Zeile) ──────────────────────────────────────────
const zeileAn = (text, at) => text.slice(0, at).split("\n").length;
function lies(root) {
    return stammLib.dateien(root).map((p) => {
        const text = fs.readFileSync(path.join(root, p), "utf8");
        const marker = stammLib.marker(text).map((m) => ({
            id: m.schluessel,
            name: m.schluessel,
            themen: m.themen,
            line: zeileAn(text, m.at),
        }));
        return { pfad: p, text, marker, zeilen: text.split("\n").length - (text.endsWith("\n") ? 1 : 0) };
    });
}
const gliederVon = (t) => t.glieder || (t.glieder = stammLib.glieder(t.text).map((g) => ({ name: g.name, zeile: g.zeile })));

// ── die Karte ────────────────────────────────────────────────────────────────────────────────────────────────────
function zonenVon(teile) {
    const out = [];
    for (const t of teile)
        t.marker.forEach((m, i) => {
            const ende = i + 1 < t.marker.length ? t.marker[i + 1].line - 1 : t.zeilen;
            const methoden = gliederVon(t).filter((g) => g.zeile > m.line && g.zeile <= ende).length;
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
        stammLib.kinder(n, (c) => geh(c, false));
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
    // R3 die EINE Liste (Tags = Platte; die lib wirft mit den fremden und fehlenden Pfaden und an der Form vor dem Schnitt)
    let teile;
    try {
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
    // R3 S∘S⁻¹ = id: die Dateien sind das Bild von S (Namen, Marker, Klassen, Naht-Rufe folgen dem Stamm)
    let T = null;
    try {
        T = stammLib.fuege(teile);
        const S = stammLib.schneide(T);
        const ab =
            S.length !== teile.length
                ? `${S.length} statt ${teile.length} Dateien`
                : S.find((x, i) => x.pfad !== teile[i].pfad || x.text !== teile[i].text)?.pfad;
        if (ab) fehler.push(`R3 LISTE: S∘S⁻¹ ≠ id (${ab}) — Namen, Marker, Klassen und Naht-Rufe folgen dem Stamm`);
    } catch (e) {
        fehler.push(`R3 LISTE: ${e.message}`);
    }
    // R7 die Domäne: der Stamm ist der Fixpunkt der Karte
    if (T) {
        try {
            const K = opt.karte || stammLib.karteVon(root);
            const r = stammLib.ordne(T, K);
            const datei = (s) => stammLib.pfadVon(s || "?");
            for (const f of r.fremd)
                fehler.push(`R7 DOMÄNE: ${f.name} steht in ${datei(f.ist)}, gehört nach ${datei(f.soll)} (Karte: ${f.soll}) — ${UMZUG}`);
            for (const n of r.neu)
                fehler.push(`R7 DOMÄNE: ${n.name} fehlt in der Karte (${stammLib.KARTE}; beim Vorgänger: ${n.soll}) — ${UMZUG}`);
            for (const n of r.tot) fehler.push(`R7 DOMÄNE: die Karte nennt ${n}, das kein Glied ist — ${UMZUG}`);
            if (!r.fremd.length && !r.neu.length && !r.tot.length && r.text !== T)
                fehler.push(`R7 DOMÄNE: der Stamm ist nicht der Fixpunkt der Karte (Marker, Themen oder Ordnung) — ${UMZUG}`);
            info.karte = r.namen.size;
        } catch (e) {
            fehler.push(`R7 DOMÄNE: ${e.message}`);
        }
    }
    // R6 Cache: jeder Stamm-Tag trägt ?v= = package.version
    const version = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8")).version;
    for (const tag of stammLib.tagsVon(fs.readFileSync(path.join(root, "index.html"), "utf8")))
        if (tag.v !== `?v=${version}`)
            fehler.push(`R6 CACHE: ${tag.pfad}${tag.v || " (ohne ?v=)"} statt ?v=${version}`);
    // R2 die Decke
    for (const t of teile)
        if (t.zeilen > R.decke_zeilen)
            fehler.push(
                `R2 DECKE: ${t.pfad} trägt ${t.zeilen} Zeilen > ${R.decke_zeilen} — die Karte teilt ihr Modul (Modul/teil, ein Name der Domäne), dann ${UMZUG}`
            );
    // R4 über den AST
    const glieder = new Map(); // "P|name" → [ort]
    const statisch = new Map(); // name → { ort, d } (statische Glieder: Methoden, Getter, Felder; d = Datei-Index)
    const ziele = new Map(); // name → [{ ort, idx }]
    const aussen = []; // { s, ort, idx, d }
    let idx = 0;
    teile.forEach((t, d) => {
        let ast;
        try {
            ast = acorn.parse(t.text, { ecmaVersion: "latest", sourceType: "script", locations: true });
        } catch (e) {
            fehler.push(`R4 ZWILLING: ${t.pfad} parst nicht (${e.message})`);
            return;
        }
        for (const s of ast.body) {
            if (s.type === "ClassDeclaration" && /^AnazhRealm(_\w+)?$/.test(s.id.name)) {
                const istKern = s.id.name === "AnazhRealm";
                for (const g of s.body.body) {
                    const ort = `${t.pfad}:${g.loc.start.line}`;
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
                    if (g.static) statisch.set(n, { ort, d });
                }
                continue;
            }
            if (s.type === "ClassDeclaration") continue;
            // außerhalb: die Außen-Konstanten, die Naht-Rufe und der Boot
            const e = s.type === "ExpressionStatement" ? s.expression : null;
            const ziel = e && e.type === "AssignmentExpression" && istAnazh(e.left) ? eigenschaft(e.left) : null;
            const ort = `${t.pfad}:${s.loc.start.line}`;
            if (ziel) ziele.set(ziel, (ziele.get(ziel) || []).concat({ ort, idx }));
            aussen.push({ s, ort, idx, d, aus: ziel ? e.left : null });
            idx++;
        }
    });
    info.glieder = glieder.size;
    info.ziele = ziele.size;
    for (const [n, os] of ziele) {
        if (os.length > 1)
            fehler.push(`R4 ZWILLING: AnazhRealm.${n} = steht ${os.length}× (${os.map((o) => o.ort).join(", ")})`);
        if (statisch.has(n))
            fehler.push(
                `R4 ZWILLING: AnazhRealm.${n} = (${os[0].ort}) trifft das statische Glied ${statisch.get(n).ort} — die Zuweisung schluckte still`
            );
    }
    info.lese = 0; // die Lade-Leser von Außen-Zielen (die Regel sieht sie — eine Zahl 0 hieße blind)
    for (const a of aussen)
        for (const l of ladeLeser(a.s, a.aus)) {
            const st = statisch.get(l.name);
            if (st && st.d > a.d)
                fehler.push(`R4 ZWILLING: ${a.ort} liest beim Laden AnazhRealm.${l.name}, getragen erst in ${st.ort}`);
            if (st) continue;
            const z = ziele.get(l.name);
            if (z) info.lese++;
            if (z?.every((o) => o.idx > a.idx))
                fehler.push(`R4 ZWILLING: ${a.ort} liest beim Laden AnazhRealm.${l.name}, gesetzt erst in ${z[0].ort}`);
        }
    return { fehler, info };
}

// ── --find: Glieder, Außen-Ziele, zugewiesene Methoden und die Funktionen der Kerne ─────────────────────────────────
function finde(root, rx) {
    const treffer = [];
    const teile = lies(root);
    const zonen = zonenVon(teile);
    const zoneAn = (p, z) => zonen.filter((x) => x.pfad === p && x.line <= z).pop()?.id || "?";
    for (const t of teile) {
        const ast = acorn.parse(t.text, { ecmaVersion: "latest", sourceType: "script", locations: true });
        const nimm = (name, n, wie) => {
            if (name && rx.test(name)) treffer.push(`  ${(t.pfad + ":" + n.loc.start.line).padEnd(32)} ${name}  →  ${wie}`);
        };
        for (const s of ast.body) {
            if (s.type === "ClassDeclaration")
                for (const g of s.body.body) {
                    nimm(schluessel(g.key), g, zoneAn(t.pfad, g.loc.start.line));
                    // die zugewiesene Methode: `this.x = (…) => …` oder `this.x = f` mit `const f = (…) => …` im selben Glied
                    const fn = new Set();
                    const zu = [];
                    stammLib.wandere(g, (n) => {
                        if (n.type === "VariableDeclarator" && n.id.type === "Identifier" && /Function/.test(n.init?.type || ""))
                            fn.add(n.id.name);
                        const l = n.type === "AssignmentExpression" ? n.left : null;
                        if (l && l.type === "MemberExpression" && l.object.type === "ThisExpression" && !l.computed) zu.push(n);
                    });
                    for (const n of zu)
                        if (/Function/.test(n.right.type) || (n.right.type === "Identifier" && fn.has(n.right.name)))
                            nimm(n.left.property.name, n, `zugewiesen in ${schluessel(g.key)} (${zoneAn(t.pfad, g.loc.start.line)})`);
                }
            else {
                const an = stammLib.aussenName(s) || "";
                if (rx.test(an.replace(/^AnazhRealm\./, "")))
                    treffer.push(`  ${(t.pfad + ":" + s.loc.start.line).padEnd(32)} ${an}  →  außen (${zoneAn(t.pfad, s.loc.start.line)})`);
            }
        }
    }
    // die Kerne: benannte Funktionen, Methoden und Funktions-Felder — in ein sofort gerufenes Gehäuse hinein, in keinen Rumpf; dazu
    // die Gesetzbücher neben dem Spiel-Manifest (`worlds/<buch>/*-core.js`, sie docken über die Kern-Zeile an) und je Buch
    // seine Arten (PARAMS_BY_KIND): eine Art in zwei Büchern hat zwei Quellen
    const kerne = JSON.parse(fs.readFileSync(path.join(root, "cores.manifest.json"), "utf8")).flatMap((c) => c.scripts);
    const daneben = fs.readdirSync(path.join(root, "worlds"), { recursive: true }).map((f) => "worlds/" + f.replace(/\\/g, "/"))
        .filter((f) => /^worlds\/[^/]+\/[^/]+-core\.js$/.test(f));
    for (const k of [...new Set(kerne), ...daneben]) {
        const text = fs.readFileSync(path.join(root, k), "utf8");
        const ast = acorn.parse(text, { ecmaVersion: "latest", sourceType: "script", locations: true, allowHashBang: true });
        stammLib.wandere(ast, (n, ahnen) => {
            const fnWert = (v) => v && /Function/.test(v.type);
            const name =
                n.type === "FunctionDeclaration"
                    ? n.id && n.id.name
                    : (n.type === "Property" || n.type === "MethodDefinition") && fnWert(n.value)
                      ? schluessel(n.key)
                      : n.type === "VariableDeclarator" && fnWert(n.init)
                        ? n.id.name
                        : null;
            if (name && rx.test(name)) treffer.push(`  ${(k + ":" + n.loc.start.line).padEnd(32)} ${name}  →  Kern ${k}`);
            const arten = schluessel(n.key || n.id || {}) === "PARAMS_BY_KIND" && (n.value || n.init);
            for (const p of arten?.properties || [])
                if (rx.test(schluessel(p.key)) || rx.test(k))
                    treffer.push(`  ${(k + ":" + p.loc.start.line).padEnd(32)} ${schluessel(p.key)}  →  Gesetzbuch ${daneben.includes(k) ? "neben dem" : "im"} Spiel-Manifest`);
            const iife = /Function/.test(n.type) && ahnen.length && ahnen[ahnen.length - 1].type === "CallExpression";
            return !(/Function/.test(n.type) && !iife) && !(n.type === "VariableDeclarator" && fnWert(n.init));
        });
    }
    return treffer;
}

// ── Selbsttest: je Regel ein Fixture, das ROT wird ──────────────────────────────────────────────────────────────
function selbsttest() {
    const os = require("os");
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "atlas-ratsche-"));
    const R = { decke_zeilen: 40 };
    const karte = {
        ordnung: [
            ["Kern", "a"],
            ["Zwei", "b"],
            ["Zwei/teil", "c"],
            ["Drei", "d"],
        ],
        mod: { constructor: "Kern", init: "Kern", zwei: "Zwei", FROZEN: "Zwei", zweiB: "Zwei/teil", drei: "Drei" },
    };
    Object.assign(karte.mod, { "AnazhRealm.VERSION": "Kern", "AnazhRealm.X": "Zwei", "AnazhRealm.Y": "Zwei" });
    const fx = [
        "// Kopf",
        "class AnazhRealm {",
        "    // ===== ATLAS · Kern — a =====",
        "    constructor() {}",
        "    init() {}",
        "",
        "    // ===== ATLAS · Zwei — b =====",
        "    zwei() {}",
        "    static get FROZEN() {",
        "        return 1;",
        "    }",
        "",
        "    // ===== ATLAS · Zwei/teil — c =====",
        "    zweiB() {}",
        "",
        "    // ===== ATLAS · Drei — d =====",
        "    drei() {}",
        "}",
        "",
        "// ===== ATLAS · Kern — Außen-Konstanten =====",
        'AnazhRealm.VERSION = "1.2.3";',
        "",
        "// ===== ATLAS · Zwei — Außen-Konstanten =====",
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
    const fall = (name, rx, mut, k = karte) => {
        const { fehler } = pruefe(baum(mut), { ratsche: R, karte: k });
        const ok = rx ? fehler.some((f) => rx.test(f)) : fehler.length === 0;
        console.log(`${ok ? "  ok " : "  ROT"} ${name}${ok ? "" : " — " + (fehler.join(" | ") || "kein Fehler")}`);
        if (!ok) rot++;
    };
    const mit = (extra) => ({ ordnung: karte.ordnung, mod: Object.assign({}, karte.mod, extra) });
    try {
        fall("das Fixture ist grün", null, {});
        fall("SYNTAX: ein Bruch in einer Zone nennt die Datei", /^SYNTAX stamm\/zwei-teil\.js/, {
            teile: (S) => (S[2].text = S[2].text.replace("zweiB() {}", "zweiB() { return ) }")),
        });
        fall("R2 DECKE: eine Datei über der Decke nennt den Weg", /^R2 DECKE: stamm\/drei\.js .*Modul\/teil.*--nach-karte/, {
            fx: (t) =>
                t.replace(
                    "    drei() {}",
                    Array.from({ length: 30 }, (_, i) => `    drei${i}() {\n        return ${i};\n    }`).join("\n")
                ),
        }, mit(Object.fromEntries(Array.from({ length: 30 }, (_, i) => [`drei${i}`, "Drei"]))));
        fall("R3 LISTE: ein Tag fehlt", /^R3 LISTE: .*ohne Tag: stamm\/drei\.js/, {
            pfade: (p) => p.filter((x) => x !== "stamm/drei.js"),
        });
        fall("R3 LISTE: ein Naht-Ruf fehlt", /^R3 LISTE: .*Naht-Ruf/, {
            teile: (S) => (S[3].text = S[3].text.replace(/_stammZonen\(AnazhRealm, \[AnazhRealm_drei\]\);\n/, "")),
        });
        fall("R4 ZWILLING: dieselbe Methode in zwei Zonen", /^R4 ZWILLING: zwei in stamm\/zwei\.js:\d+ und stamm\/drei\.js/, {
            teile: (S) => (S[3].text = S[3].text.replace("    drei() {}", "    drei() {}\n    zwei() {}")),
        });
        fall("R4 ZWILLING: AnazhRealm.X = zweimal", /^R4 ZWILLING: AnazhRealm\.X = steht 2×/, {
            teile: (S) => (S[1].text = S[1].text.replace("AnazhRealm.X = 1;", "AnazhRealm.X = 1;\nAnazhRealm.X = 0;")),
        });
        fall("R4 ZWILLING: static get FROZEN und AnazhRealm.FROZEN =", /^R4 ZWILLING: AnazhRealm\.FROZEN = .*statische Glied/, {
            teile: (S) => (S[1].text = S[1].text.replace("AnazhRealm.X = 1;", "AnazhRealm.X = 1;\nAnazhRealm.FROZEN = 2;")),
        });
        fall("R4 ZWILLING: Lesen vor dem Setzen (über die Datei-Grenze)", /^R4 ZWILLING: stamm\/kern\.js:\d+ liest beim Laden AnazhRealm\.X/, {
            teile: (S) =>
                (S[0].text = S[0].text.replace(
                    'AnazhRealm.VERSION = "1.2.3";',
                    'AnazhRealm.VERSION = "1.2.3";\nAnazhRealm.W = [AnazhRealm.X].map((x) => x);'
                )),
        });
        fall("R4 ZWILLING: ein statisches Glied einer späteren Datei beim Laden", /^R4 ZWILLING: stamm\/kern\.js:\d+ liest beim Laden AnazhRealm\.FROZEN, getragen erst/, {
            teile: (S) => (S[0].text = S[0].text.replace('AnazhRealm.VERSION = "1.2.3";', 'AnazhRealm.VERSION = "1.2.3";\nAnazhRealm.V = AnazhRealm.FROZEN;')),
        });
        fall("R4 ZWILLING: ein Konstruktor in einer Zone", /^R4 ZWILLING: stamm\/drei\.js:\d+ ein Konstruktor/, {
            teile: (S) => (S[3].text = S[3].text.replace("    drei() {}", "    constructor() {}\n    drei() {}")),
        });
        fall("R5 NAME: die alte Datei lebt", /^R5 NAME: \S+ lebt — der Stamm ist stamm\//, { alt: true });
        fall("R6 CACHE: ein Tag ohne die Version", /^R6 CACHE: stamm\/kern\.js\?v=1\.2\.2 statt \?v=1\.2\.3/, { v: "1.2.2" });
        fall("R7 DOMÄNE: ein Glied in der Datei eines fremden Moduls", /^R7 DOMÄNE: drei steht in stamm\/zwei\.js, gehört nach stamm\/drei\.js/, {
            fx: (t) => t.replace("    drei() {}\n", "    neu() {}\n").replace("    zwei() {}\n", "    zwei() {}\n    drei() {}\n"),
        }, mit({ neu: "Drei" }));
        fall("R7 DOMÄNE: ein Glied ohne Karte", /^R7 DOMÄNE: neu fehlt in der Karte .*beim Vorgänger: Drei/, {
            fx: (t) => t.replace("    drei() {}\n", "    drei() {}\n    neu() {}\n"),
        });
        fall("R7 DOMÄNE: ein Karten-Name ohne Glied", /^R7 DOMÄNE: die Karte nennt weg, das kein Glied ist/, {}, mit({ weg: "Drei" }));
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
        console.log(`${ok ? "  ok " : "  ROT"} Lade-Leser: Funktion später, IIFE und Feld-Rückruf sofort — ${ls.join(";")}`);
        if (!ok) rot++;
        // --find: die zugewiesene Methode, der Kern und die Art bei ihrem Gesetzbuch sind sichtbar
        const f = finde(ROOT, /^(_gameLoopTick|treeParams|haus)$/).join("\n");
        const fok = /_gameLoopTick {2}→ {2}zugewiesen in startEternalLoop/.test(f) && /phyto-core\.js:\d+ +treeParams {2}→ {2}Kern/.test(f) && /fachwerk-core\.js:\d+ +haus {2}→ {2}Gesetzbuch im/.test(f);
        console.log(`${fok ? "  ok " : "  ROT"} --find: _gameLoopTick (zugewiesen), treeParams (Kern), haus (Gesetzbuch) — ${f.replace(/\s+/g, " ")}`);
        if (!fok) rot++;
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
        for (const f of fehler.slice(0, 60)) console.error("  ✗ " + f);
        if (fehler.length > 60) console.error(`  … und ${fehler.length - 60} weitere`);
        process.exit(1);
    }
    const R = JSON.parse(fs.readFileSync(path.join(ROOT, RATSCHE), "utf8"));
    const teile = lies(ROOT);
    console.log(
        `Atlas-Ratsche OK — ${teile.length} Dateien (größte ${Math.max(...teile.map((t) => t.zeilen))} ≤ ${R.decke_zeilen} Z.), ` +
            `${info.karte} Namen je in der Datei ihres Moduls (Fixpunkt der Karte), ${info.glieder} Glied-Schlüssel und ` +
            `${info.ziele} Außen-Ziele ohne Zwilling, ${info.lese} Lade-Leser nach ihrem Ziel, Liste = Tags = Platte = S, ` +
            `?v= je Tag (${Date.now() - t0} ms)`
    );
    process.exit(0);
}
const findIdx = argv.indexOf("--find");
if (findIdx >= 0) {
    const t = finde(ROOT, new RegExp(argv[findIdx + 1] || "$^"));
    console.log(t.length ? t.join("\n") : "  (kein Treffer)");
    process.exit(0);
}
const teile = lies(ROOT);
const zonen = zonenVon(teile);
const gesamt = teile.reduce((s, t) => s + t.zeilen, 0);
console.log(`STAMM-ATLAS — ${teile.length} Dateien unter ${stammLib.DIR}/ (${gesamt} Zeilen, ${zonen.length} Zonen)\n`);
for (const z of zonen)
    console.log(
        `  ${z.pfad.padEnd(28)} ${z.id.padEnd(20)} ${String(z.zeilen).padStart(5)} Z. ` +
            `${String(z.methoden).padStart(4)} G.  ${z.themen}`
    );
