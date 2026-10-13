// node lauf-p50.cjs <lauf.txt> — die Frame-p50 aus der JSON-Ausgabe von `werkbank lauf` (NaN, wenn nicht lesbar)
"use strict";
try {
    const t = require("fs").readFileSync(process.argv[2], "utf8");
    const j = JSON.parse(t.slice(t.indexOf("{"), t.lastIndexOf("}") + 1));
    const e = j.ergebnis || j;
    console.log(e.frameMs && Number.isFinite(e.frameMs.p50) ? e.frameMs.p50 : "NaN");
} catch (_e) {
    console.log("NaN");
}
