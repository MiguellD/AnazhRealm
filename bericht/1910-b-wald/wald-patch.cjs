// 1910 B-Wald (OMEN, Schneider): das Wald-Faden-Instrument des Messers (p3/n1910/kette/wald-patch.cjs) mit Ankern ohne feste
// Einrückung — dieselben zwei Stempel in Epoch-ms (Start der Zellen im Faden · Antwort gebaut) als Feld `b5` der Antwort, an
// main (die Zellen im Zweig der Nachricht) wie an b-wald (die Zellen in `waldDarts`, der Schlange im Faden). An main ist das
// Ergebnis byte-gleich dem Messer-Instrument (sha 54d96d04…).  Zurück: git -c core.autocrlf=false checkout -- voxel-worker.js
//   node wald-patch.cjs <baum>
"use strict";
const fs = require("fs");
const path = require("path");
const f = path.join(process.argv[2], "voxel-worker.js");
let s = fs.readFileSync(f, "utf8");
if (s.includes("OMEN 1910 Kette")) {
    console.log(f, "schon gepatcht");
    process.exit(0);
}
const ers = (re, fn) => {
    const m = s.match(new RegExp(re.source, "gm"));
    if (!m || m.length !== 1) throw new Error(`Anker nicht eindeutig: ${re}`);
    s = s.replace(new RegExp(re.source, "m"), fn);
};
ers(/^( *)const z = msg\.zellen;\n/, (a, e) => `${e}const b5t0 = performance.timeOrigin + performance.now(); // OMEN 1910 Kette (Instrument): Start im Faden\n${a}`);
ers(/^( *)type: "wald-darts-result",\n/, (a, e) => `${a}${e}b5: [b5t0, performance.timeOrigin + performance.now()],\n`);
fs.writeFileSync(f, s);
console.log(f, "gepatcht (1910 Wald-Stempel)");
