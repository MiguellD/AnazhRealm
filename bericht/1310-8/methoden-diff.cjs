// 1310-8: die Methoden der Klasse AnazhRealm, die sich zwischen zwei Ständen unterscheiden (AST, Quelltext ohne Kommentare
// und Leerraum verglichen). node methoden-diff.cjs <A/anazhRealm.js> <B/anazhRealm.js>
"use strict";
const fs = require("fs");
const espree = require("C:/Users/micha/Desktop/AnazhRealm-OMEN/abab-b544/node_modules/espree");
function methoden(datei) {
    const src = fs.readFileSync(datei, "utf8");
    const ast = espree.parse(src, { ecmaVersion: "latest", sourceType: "script", range: true });
    const out = new Map();
    const besuch = (n) => {
        if (!n || typeof n !== "object") return;
        if (n.type === "ClassBody") {
            for (const m of n.body)
                if (m.type === "MethodDefinition" && m.key && (m.key.name || m.key.value)) {
                    const name = (m.static ? "static " : "") + (m.key.name || m.key.value);
                    const text = src.slice(m.range[0], m.range[1]).replace(/\/\/[^\n]*|\/\*[\s\S]*?\*\//g, "").replace(/\s+/g, " ");
                    out.set(name, text);
                }
            return;
        }
        for (const k in n) if (k !== "parent" && n[k] && typeof n[k] === "object") besuch(n[k]);
    };
    besuch(ast);
    return out;
}
const [a, b] = process.argv.slice(2).map(methoden);
const geaendert = [], neu = [], weg = [];
for (const [k, v] of b) if (!a.has(k)) neu.push(k); else if (a.get(k) !== v) geaendert.push(k);
for (const k of a.keys()) if (!b.has(k)) weg.push(k);
console.log(JSON.stringify({ geaendert, neu, weg }, null, 1));
