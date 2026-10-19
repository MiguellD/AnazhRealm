// 1910 F1: EIN Instrument (A = n1910-f1a) für beide Seiten — fehlt in B eine Stamm-Methode, die das Instrument ruft?
//   node methoden.cjs <A-baum> <B-baum>
// Methoden je Seite: Klassen-Methoden (`    name(`) und statische Zuweisungen (`AnazhRealm.name = `) in index.html-Skripten
// (stamm/*.js + Kern-Dateien *.js im Wurzel-Ordner). Gerufen: jedes `r.<name>`, `P.<name>`, `anazhRealm.<name>`,
// `AnazhRealm.<name>` in scripts/werkbank.cjs, scripts/omen-messfolge.cjs und scripts/lib/*.cjs des Instruments.
"use strict";
const fs = require("fs");
const path = require("path");
const [A, B] = process.argv.slice(2);
const dateien = (wt) => {
    const s = fs.readdirSync(path.join(wt, "stamm")).filter((f) => f.endsWith(".js")).map((f) => path.join(wt, "stamm", f));
    return s.concat(fs.readdirSync(wt).filter((f) => /\.js$/.test(f)).map((f) => path.join(wt, f)));
};
const methoden = (wt) => {
    const m = new Set();
    for (const f of dateien(wt)) {
        const t = fs.readFileSync(f, "utf8");
        for (const x of t.matchAll(/^\s{4}(?:async\s+|static\s+|get\s+|set\s+)*([A-Za-z_$][\w$]*)\s*\([^)]*\)\s*\{/gm)) m.add(x[1]);
        for (const x of t.matchAll(/AnazhRealm(?:\.prototype)?\.([A-Za-z_$][\w$]*)\s*=/g)) m.add(x[1]);
        for (const x of t.matchAll(/\.prototype\.([A-Za-z_$][\w$]*)\s*=/g)) m.add(x[1]);
    }
    return m;
};
const mA = methoden(A);
const mB = methoden(B);
const fehltInB = [...mA].filter((x) => !mB.has(x)).sort();
const neuInB = [...mB].filter((x) => !mA.has(x)).sort();
const ins = [path.join(A, "scripts", "werkbank.cjs"), path.join(A, "scripts", "omen-messfolge.cjs")].concat(
    fs.readdirSync(path.join(A, "scripts", "lib")).filter((f) => f.endsWith(".cjs")).map((f) => path.join(A, "scripts", "lib", f))
);
const gerufen = new Map();
for (const f of ins) {
    const t = fs.readFileSync(f, "utf8");
    for (const x of t.matchAll(/\b(?:r|P|anazhRealm|AnazhRealm|realm|rr|w)\.([A-Za-z_$][\w$]*)/g)) {
        if (!gerufen.has(x[1])) gerufen.set(x[1], new Set());
        gerufen.get(x[1]).add(path.basename(f));
    }
}
const treffer = fehltInB.filter((x) => gerufen.has(x)).map((x) => `${x} (${[...gerufen.get(x)].join(", ")})`);
const out = [
    `Instrument A = ${A}, Seite B = ${B}`,
    `Methoden A ${mA.size} · B ${mB.size}`,
    `in B entfernt (${fehltInB.length}): ${fehltInB.join(", ") || "keine"}`,
    `in B neu (${neuInB.length}): ${neuInB.join(", ") || "keine"}`,
    `vom Instrument gerufen und in B fehlend (${treffer.length}): ${treffer.join("; ") || "KEINE"}`,
].join("\n");
console.log(out);
