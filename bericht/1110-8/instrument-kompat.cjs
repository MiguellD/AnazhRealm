// 1110-1: welche Welt-Methoden ruft das Instrument aus B (werkbank, omen-messfolge, lib), die A nicht kennt?
const fs = require("fs");
const BASE = "C:/Users/micha/Desktop/AnazhRealm-OMEN/";
const A = fs.readFileSync(BASE + "abab-b539/anazhRealm.js", "utf8");
const B = fs.readFileSync(BASE + "abab-b541/anazhRealm.js", "utf8");
const lib = BASE + "abab-b541/scripts/lib/";
const dateien = [BASE + "abab-b541/scripts/werkbank.cjs", BASE + "abab-b541/scripts/omen-messfolge.cjs"].concat(
    fs.readdirSync(lib).map((f) => lib + f)
);
const esc = (n) => n.replace(/[$]/g, "\\$");
const hat = (src, n) =>
    new RegExp("^    (?:async |static |get )?" + esc(n) + "\\(", "m").test(src) ||
    new RegExp("AnazhRealm\\." + esc(n) + "\\s*=").test(src) ||
    new RegExp("\\.prototype\\." + esc(n) + "\\s*=").test(src);
const fehlt = new Map();
for (const d of dateien) {
    const s = fs.readFileSync(d, "utf8");
    for (const m of s.matchAll(/\br\.(_?[A-Za-z][A-Za-z0-9_]*)\(/g)) {
        const n = m[1];
        if (!hat(A, n) && hat(B, n)) {
            if (!fehlt.has(n)) fehlt.set(n, new Set());
            fehlt.get(n).add(d.split("/").pop());
        }
    }
    for (const m of s.matchAll(/\bAnazhRealm\.([A-Z_][A-Z0-9_]+)\b|\br\.constructor\.([A-Z_][A-Z0-9_]+)\b/g)) {
        const n = m[1] || m[2];
        if (!hat(A, n) && hat(B, n)) {
            if (!fehlt.has(n)) fehlt.set(n, new Set());
            fehlt.get(n).add(d.split("/").pop());
        }
    }
}
for (const [n, s] of fehlt) console.log(n, [...s].join(","));
console.log("geprüft", dateien.length, "Dateien");
