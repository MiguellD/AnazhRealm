"use strict";
/* global process, console, __dirname */
// scripts/stamm-umzug.cjs — der Umzug des Stamms NACH DOMÄNE (D2). Die Karte spec/stamm/modul-karte.json ordnet jedes Glied der
// Klasse und jede Außen-Anweisung einem Modul[/teil] zu; `ordne` (scripts/lib/stamm.cjs) stellt den virtuellen Stamm danach,
// S schreibt stamm/<modul>[-<teil>].js. DETERMINISTISCH: gleiche Karte und gleicher Stamm geben dieselben Dateien — der
// Integrator fährt den Umzug am Merge-Tag am dann aktuellen Kopf neu (der Zweig trägt ihn als EINEN Commit obenauf).
//
//   --nach-karte [--trocken]
//        heilt die Karte (ein Name ohne Karte folgt seinem Vorgänger, ein toter fällt — beide benannt), ordnet, schreibt die
//        Dateien, die Stamm-Tags in index.html und die Karte, zieht die Stamm-Quellen der Tafeln mit (frisch bleibt frisch,
//        veraltet bleibt veraltet) und beweist wie --beweis. Eine Datei über der Decke teilt die Karte (Modul/teil), nie a/b/c.
//   --beweis [--rev HEAD~1] [--liste <datei>]
//        vm-Fingerabdruck alt (der Stamm an rev als EIN Skript) ↔ neu (die Dateien des Baums): je Glied Deskriptor-Art,
//        toString-sha, name/length, Datenwert — 0 Abweichungen; die Schlüssel-Ordnung zählt nicht (sie IST der Umzug).
//        --liste schreibt die Rumpf-Hash-Liste (je Glied: Seite|Name|Art|sha alt|sha neu).
//   --fmt | --lint [--basis origin/main]
//        prettier --write bzw. eslint NUR auf den Stamm-Dateien, die gegen die Merge-Basis geändert sind (samt Arbeitsbaum
//        und neuen Dateien) — npm run stamm:fmt / stamm:lint
//   --selftest
const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");
const stamm = require("./lib/stamm.cjs");

const ROOT = path.resolve(__dirname, "..");
const argv = process.argv.slice(2);
const opt = (n, d) => (argv.includes(n) ? argv[argv.indexOf(n) + 1] : d);
const TAFELN = ["spec/abnahme/soll-tafel.json", "spec/farbe/albedo-tafel.json"];
const VERALTET = "c:0000000000000000"; // ein Abdruck, den kein Code trägt: die Messung bleibt „veraltet seit …"

// ── die Karte heilen und den Baum schreiben ───────────────────────────────────────────────────────────────────────────
function heile(T, K) {
    const r = stamm.ordne(T, K);
    const mod = Object.assign({}, K.mod);
    for (const n of r.neu) mod[n.name] = n.soll;
    for (const n of r.tot) delete mod[n];
    const sortiert = {};
    for (const n of Object.keys(mod).sort()) sortiert[n] = mod[n];
    return { karte: Object.assign({}, K, { mod: sortiert }), neu: r.neu, tot: r.tot };
}
function schreibeZonen(ziel, T) {
    const S = stamm.schneide(T);
    const soll = new Set(S.map((x) => x.pfad));
    for (const f of fs.readdirSync(path.join(ziel, stamm.DIR)))
        if (f.endsWith(".js") && !soll.has(`${stamm.DIR}/${f}`)) fs.unlinkSync(path.join(ziel, stamm.DIR, f));
    for (const x of S) fs.writeFileSync(path.join(ziel, x.pfad), x.text);
    const html = path.join(ziel, "index.html");
    fs.writeFileSync(
        html,
        stamm.tagsSetzen(
            fs.readFileSync(html, "utf8"),
            S.map((x) => x.pfad)
        )
    );
    return S;
}

// ── die Tafeln: jede Stamm-Quelle einer Messung zieht in die Dateien, die ihre Glieder jetzt tragen ──────────────────
// Je Datei die Namen ihrer Glieder und Außen-Anweisungen; alt → neu über den Namen.
function namenJeDatei(teile) {
    const acorn = require("acorn");
    const out = new Map();
    for (const x of teile) {
        const n = stamm.glieder(x.text).map((g) => g.name);
        for (const s of acorn.parse(x.text, { ecmaVersion: "latest", sourceType: "script" }).body) n.push(stamm.aussenName(s));
        out.set(x.pfad, n.filter(Boolean));
    }
    return out;
}
function tafelnMitziehen(root, alt, neu) {
    const { codeAbdruck } = require("./lib/abnahme-urteil.cjs");
    const wo = new Map();
    for (const [p, ns] of namenJeDatei(neu)) for (const n of ns) wo.set(n, p);
    const reihe = neu.map((x) => x.pfad);
    const ziel = new Map(
        [...namenJeDatei(alt)].map(([p, ns]) => [p, new Set(ns.map((n) => wo.get(n)).filter(Boolean))])
    );
    const altText = new Map(alt.map((x) => [x.pfad, x.text]));
    const neuText = new Map(neu.map((x) => [x.pfad, x.text]));
    const nach = (liste) => {
        const fremd = liste.filter((p) => !ziel.has(p));
        if (fremd.length) throw new Error(`Tafel nennt ${fremd.join(", ")} — keine Stamm-Datei des Stands vor dem Umzug`);
        const s = new Set(liste.flatMap((p) => [...ziel.get(p)]));
        return reihe.filter((p) => s.has(p));
    };
    const MAP = /^(\s*)"(stamm\/[^"]+)": "([^"]*)"(,?)$/;
    const ARR = /^(\s*)"(stamm\/[^"]+)"(,?)$/;
    const bericht = [];
    for (const t of TAFELN) {
        const datei = path.join(root, t);
        if (!fs.existsSync(datei)) continue;
        const L = fs.readFileSync(datei, "utf8").split("\n");
        const out = [];
        let laeufe = 0;
        for (let i = 0; i < L.length; ) {
            const rx = MAP.test(L[i]) ? MAP : ARR.test(L[i]) ? ARR : null;
            if (!rx) {
                // eine Zeilen-Reihe ["…", "stamm/…", …] (die Form der Soll-Tafel)
                out.push(
                    L[i].replace(/\[("[^\]]*")\]/g, (m, innen) => {
                        const a = JSON.parse(`[${innen}]`);
                        if (!a.some((p) => /^stamm\//.test(p))) return m;
                        laeufe++;
                        const k = a.findIndex((p) => /^stamm\//.test(p));
                        const b = a.filter((p) => !/^stamm\//.test(p));
                        b.splice(k, 0, ...nach(a.filter((p) => /^stamm\//.test(p))));
                        return JSON.stringify(b).replace(/","/g, '", "');
                    })
                );
                i++;
                continue;
            }
            const lauf = [];
            while (i < L.length && rx.test(L[i])) lauf.push(rx.exec(L[i++]));
            laeufe++;
            const einzug = lauf[0][1];
            const komma = lauf[lauf.length - 1][rx === MAP ? 4 : 3];
            const neuL = nach(lauf.map((m) => m[2]));
            const frisch = rx === MAP && lauf.every((m) => altText.has(m[2]) && codeAbdruck(altText.get(m[2]), m[2]) === m[3]);
            neuL.forEach((p, j) => {
                const wert = rx === MAP ? `: "${frisch ? codeAbdruck(neuText.get(p), p) : VERALTET}"` : "";
                out.push(`${einzug}"${p}"${wert}${j + 1 < neuL.length ? "," : komma}`);
            });
        }
        const text = out.join("\n");
        JSON.parse(text);
        fs.writeFileSync(datei, text);
        bericht.push(`${t}: ${laeufe} Quellen-Listen`);
    }
    return bericht;
}

// ── --beweis ──────────────────────────────────────────────────────────────────────────────────────────────────────────
function beweise(root, T, teile) {
    const alt = stamm.ladeKlasse(root, { monolith: T });
    const neu = stamm.ladeKlasse(root, { teile });
    const fa = stamm.fingerabdruck(alt.AnazhRealm).zeilen.map((z) => z.split("|"));
    const fb = stamm.fingerabdruck(neu.AnazhRealm).zeilen.map((z) => z.split("|"));
    const schl = (x) => x[0] + "|" + x[1];
    const mb = new Map(fb.map((x) => [schl(x), x]));
    const ma = new Map(fa.map((x) => [schl(x), x]));
    const ab = { art: 0, quelle: 0, namelen: 0, daten: 0, nurAlt: 0, nurNeu: 0 };
    const namen = [];
    const liste = [];
    for (const x of fa) {
        const y = mb.get(schl(x));
        liste.push([x[0], x[1], x[2], (x[3] || "") + (x[5] || ""), y ? (y[3] || "") + (y[5] || "") : "-"].join("|"));
        if (!y) (ab.nurAlt++, namen.push(`nur alt: ${x[1]}`));
        else
            for (const [k, i] of [
                ["art", 2],
                ["quelle", 3],
                ["namelen", 4],
                ["daten", 5],
            ])
                if (x[i] !== y[i]) (ab[k]++, namen.push(`${k}: ${x[1]}`));
    }
    for (const y of fb) if (!ma.has(schl(y))) (ab.nurNeu++, namen.push(`nur neu: ${y[1]}`));
    const ordnung = fa.filter((x, i) => !fb[i] || schl(x) !== schl(fb[i])).length;
    const summe = Object.values(ab).reduce((s, v) => s + v, 0);
    return { n: fa.length, ab, summe, namen, liste, ordnung, msAlt: alt.ms, msNeu: neu.ms, dateien: teile.length };
}
const beweisZeile = (r) =>
    `Fingerabdruck: ${r.n} Glieder, Abweichungen ${r.summe} (Art ${r.ab.art}, Rumpf ${r.ab.quelle}, name/length ${r.ab.namelen}, ` +
    `Daten ${r.ab.daten}, nur alt ${r.ab.nurAlt}, nur neu ${r.ab.nurNeu}) · ${r.ordnung} Schlüssel umgeordnet · ` +
    `${r.dateien} Dateien · vm-Laden ${r.msAlt.toFixed(0)} ↔ ${r.msNeu.toFixed(0)} ms`;
const teileVon = (root) => stamm.dateien(root).map((p) => ({ pfad: p, text: fs.readFileSync(path.join(root, p), "utf8") }));

// ── --nach-karte ──────────────────────────────────────────────────────────────────────────────────────────────────────
function nachKarte(root, trocken) {
    const t0 = Date.now();
    const T = stamm.text(root);
    const alt = teileVon(root);
    const h = heile(T, stamm.karteVon(root));
    const T1 = stamm.ordne(T, h.karte).text;
    const S = stamm.schneide(T1);
    const zeilen = S.map((x) => x.text.split("\n").length - 1);
    console.log(
        `Karte: ${Object.keys(h.karte.mod).length} Namen · neu ${h.neu.length} (je beim Vorgänger) · tot ${h.tot.length}` +
            `\nnach Domäne: ${alt.length} → ${S.length} Dateien, größte ${Math.max(...zeilen)} Z., ${Date.now() - t0} ms`
    );
    for (const n of h.neu) console.log(`  neu  ${n.name} → ${n.soll}`);
    for (const n of h.tot) console.log(`  tot  ${n}`);
    const b = beweise(root, T, S);
    console.log(beweisZeile(b));
    for (const n of b.namen.slice(0, 20)) console.log("  ✗ " + n);
    if (b.summe || trocken) return b.summe ? 1 : 0;
    fs.writeFileSync(path.join(root, stamm.KARTE), JSON.stringify(h.karte, null, 1) + "\n");
    schreibeZonen(root, T1);
    for (const z of tafelnMitziehen(root, alt, S)) console.log("Tafel " + z);
    return 0;
}

// ── --fmt / --lint: nur die geänderten Stamm-Dateien ──────────────────────────────────────────────────────────────────
function werkzeugLauf(root, art, basis) {
    const git = (args) => execFileSync("git", ["-C", root, ...args], { encoding: "utf8" });
    const mb = git(["merge-base", "HEAD", basis]).trim();
    const geaendert = new Set(
        git(["diff", "--name-only", mb])
            .split("\n")
            .concat(git(["ls-files", "--others", "--exclude-standard"]).split("\n"))
            .filter(Boolean)
    );
    const dateien = stamm.dateien(root).filter((p) => geaendert.has(p));
    if (!dateien.length) {
        console.log(`stamm:${art}: keine Stamm-Datei gegen ${basis} (${mb.slice(0, 8)}) geändert`);
        return 0;
    }
    const befehl = art === "fmt" ? ["prettier", "--write", ...dateien] : ["eslint", ...dateien];
    console.log(`stamm:${art}: ${dateien.length} Datei(en) gegen ${basis} (${mb.slice(0, 8)}): ${dateien.join(" ")}`);
    const t0 = Date.now();
    const r = require("child_process").spawnSync("npx", befehl, { cwd: root, stdio: "inherit", shell: true });
    console.log(`stamm:${art}: EXIT ${r.status} in ${((Date.now() - t0) / 1000).toFixed(1)} s`);
    return r.status === 0 ? 0 : 1;
}

// ── Selbsttest ────────────────────────────────────────────────────────────────────────────────────────────────────────
function selbsttest() {
    const os = require("os");
    let rot = 0;
    const pruef = (name, ok, info) => {
        console.log(`${ok ? "  ok " : "  ROT"} ${name}${info ? " — " + info : ""}`);
        if (!ok) rot++;
    };
    const T = stamm.text(ROOT);
    const K = stamm.karteVon(ROOT);
    const t0 = Date.now();
    const r = stamm.ordne(T, K);
    const S = stamm.schneide(r.text);
    // 1) der Umzug ist ein Fixpunkt und trägt sich um
    pruef(
        "ordne: Fixpunkt, S∘S⁻¹ = id, keine Datei über der Decke",
        stamm.ordne(r.text, K).text === r.text &&
            stamm.fuege(S) === r.text &&
            S.every((x) => x.text.split("\n").length - 1 <= 4000),
        `${S.length} Dateien, ${Date.now() - t0} ms`
    );
    // 2) dieselbe Klasse (der Rumpf-Hash je Glied)
    const b = beweise(ROOT, T, S);
    pruef("--beweis: der Umzug ist dieselbe Klasse", b.summe === 0 && b.n > 3000, beweisZeile(b));
    // 3) der injizierte Zwilling wirft an der Naht
    const q = S.findIndex((x) => /\n {4}_bodenSichtAt\(/.test(x.text));
    const m = /\n( {4}_bodenSichtAt\([\s\S]*?\n {4}\}\n)/.exec(S[q].text);
    const z = q === 2 ? 3 : 2;
    const zw = S.map((x, i) => (i === z ? { pfad: x.pfad, text: x.text.replace(/\n\}\n_stammZonen/, `\n\n${m[1]}}\n_stammZonen`) } : x));
    let wurf = "";
    try {
        stamm.ladeKlasse(ROOT, { teile: zw });
    } catch (e) {
        wurf = e.message;
    }
    pruef("injizierter Zwilling → ROT an der Naht", /Stamm-Zwilling: _bodenSichtAt/.test(wurf), wurf);
    // 4) die Karte heilt benannt: ein Name ohne Karte folgt seinem Vorgänger, ein toter Name fällt
    const fx = [
        "class AnazhRealm {",
        "    constructor() {}",
        "    a() {}",
        "    neu() {}",
        "    b() {}",
        "}",
        "AnazhRealm.X = 1;",
        "",
    ].join("\n");
    const Kf = {
        ordnung: [
            ["Dirigent/kern", "k"],
            ["Wasser", "w"],
        ],
        mod: { constructor: "Dirigent/kern", a: "Wasser", b: "Dirigent/kern", "AnazhRealm.X": "Wasser", weg: "Wasser" },
    };
    const hf = heile(fx, Kf);
    const of = stamm.ordne(fx, hf.karte).text;
    pruef(
        "Karte heilen: neu beim Vorgänger, tot fällt, Außen-Ziel zieht mit",
        hf.karte.mod.neu === "Wasser" &&
            !("weg" in hf.karte.mod) &&
            /ATLAS · Wasser — w =====\n {4}a\(\) \{\}\n {4}neu\(\) \{\}/.test(of) &&
            /ATLAS · Wasser — Außen-Konstanten =====\nAnazhRealm\.X = 1;/.test(of) &&
            stamm.schneide(of).map((x) => x.pfad).join() === "stamm/dirigent-kern.js,stamm/wasser.js",
        stamm.schneide(of).map((x) => x.pfad).join(" ")
    );
    // 5) die Tafeln: eine frische Quelle zieht frisch um, eine veraltete bleibt veraltet, die Zeilen-Reihe folgt
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "stamm-umzug-"));
    try {
        const { codeAbdruck } = require("./lib/abnahme-urteil.cjs");
        const altT = [
            { pfad: "stamm/01.js", text: "class AnazhRealm {\n    constructor() {}\n    a() {}\n}\n" },
            { pfad: "stamm/02.js", text: "class AnazhRealm_Z02 {\n    b() {}\n}\n" },
        ];
        const neuT = stamm.schneide(of);
        const tafel = [
            "{",
            '    "f": {"quellen": {',
            '        "x-core.js": "c:1",',
            `        "stamm/01.js": "${codeAbdruck(altT[0].text, "stamm/01.js")}",`,
            `        "stamm/02.js": "${codeAbdruck(altT[1].text, "stamm/02.js")}"`,
            "    }},",
            '    "v": {"quellen": {',
            '        "stamm/02.js": "c:00000000000000ff"',
            "    }},",
            '    "r": {"quellen": ["x-core.js", "stamm/02.js"]}',
            "}",
            "",
        ].join("\n");
        fs.mkdirSync(path.join(tmp, "spec", "abnahme"), { recursive: true });
        fs.writeFileSync(path.join(tmp, TAFELN[0]), tafel);
        tafelnMitziehen(tmp, altT, neuT);
        const j = JSON.parse(fs.readFileSync(path.join(tmp, TAFELN[0]), "utf8"));
        const kern = neuT[0].pfad;
        pruef(
            "Tafeln: frisch bleibt frisch, veraltet bleibt veraltet, die Reihe folgt den Gliedern",
            j.f.quellen[kern] === codeAbdruck(neuT[0].text, kern) &&
                j.f.quellen["stamm/wasser.js"] === codeAbdruck(neuT[1].text, "stamm/wasser.js") &&
                j.f.quellen["x-core.js"] === "c:1" &&
                j.v.quellen[kern] === VERALTET &&
                j.r.quellen.join() === `x-core.js,${kern}`,
            JSON.stringify(j)
        );
    } finally {
        fs.rmSync(tmp, { recursive: true, force: true });
    }
    console.log(rot ? `stamm-umzug: ${rot} ROT` : "stamm-umzug: Selbsttest grün");
    return rot;
}

// ── CLI ───────────────────────────────────────────────────────────────────────────────────────────────────────────────
function main() {
    if (argv.includes("--selftest")) return selbsttest() ? 1 : 0;
    if (argv.includes("--nach-karte")) return nachKarte(ROOT, argv.includes("--trocken"));
    if (argv.includes("--beweis")) {
        const r = beweise(ROOT, stamm.textAusRev(ROOT, opt("--rev", "HEAD~1")), teileVon(ROOT));
        console.log(beweisZeile(r));
        for (const n of r.namen.slice(0, 20)) console.log("  ✗ " + n);
        if (opt("--liste")) fs.writeFileSync(path.resolve(opt("--liste")), r.liste.join("\n") + "\n");
        return r.summe ? 1 : 0;
    }
    if (argv.includes("--fmt") || argv.includes("--lint"))
        return werkzeugLauf(ROOT, argv.includes("--fmt") ? "fmt" : "lint", opt("--basis", "origin/main"));
    console.log("stamm-umzug: --nach-karte [--trocken] | --beweis [--rev] [--liste <datei>] | --fmt | --lint | --selftest");
    return 2;
}

if (require.main === module) process.exit(main());
module.exports = { heile, beweise, tafelnMitziehen };
