// Hilfen der Urteile (stationen/gN.js): lesen die Ausgabe EINES Laufs, rechnen nichts dazu.
// Der Text dieser Datei geht in den Abdruck jeder Station ein: wer hier etwas ändert, macht jede Messung alt.
"use strict";

// Der erste JSON-Block in stdout, der als ganze Zeile "{" beginnt und als ganze Zeile "}" endet
// (console.log(JSON.stringify(x, null, n))). Fehlt er oder ist er kaputt: null.
function jsonBlock(text) {
    const z = String(text || "").split(/\r?\n/);
    const a = z.findIndex((l) => l === "{");
    if (a < 0) return null;
    for (let e = a + 1; e < z.length; e++)
        if (z[e] === "}")
            try {
                return JSON.parse(z.slice(a, e + 1).join("\n"));
            } catch (_e) {
                return null;
            }
    return null;
}

// Das JSON am Ende der ersten Zeile, die `re` trifft (z. B. "  ✅ bewohner {…}"). Fehlt es: null.
function jsonZeile(text, re) {
    for (const l of String(text || "").split(/\r?\n/)) {
        if (!re.test(l)) continue;
        const i = l.indexOf("{");
        if (i < 0) continue;
        try {
            return JSON.parse(l.slice(i));
        } catch (_e) {
            return null;
        }
    }
    return null;
}

module.exports = { jsonBlock, jsonZeile };
