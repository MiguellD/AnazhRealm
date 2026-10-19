// 1910 B-Kette (OMEN, Messer): EIN Instrument-Eingriff in den Wald-Faden (voxel-worker.js, Auftrag `wald-darts`): zwei
// Stempel in Epoch-ms (performance.timeOrigin + now) — Studio-Start der Zellen · Antwort gebaut — als Feld `b5` der Antwort;
// der Haupt-Faden (kette-patch, `_nebenAuftrag`-Hülle) rechnet sie auf seine Uhr um.
// Zurück: git -c core.autocrlf=false checkout -- voxel-worker.js        node wald-patch.cjs <baum>
"use strict";
const fs = require("fs");
const path = require("path");
const f = path.join(process.argv[2], "voxel-worker.js");
let s = fs.readFileSync(f, "utf8");
if (s.includes("OMEN 1910 Kette")) {
    console.log(f, "schon gepatcht");
    process.exit(0);
}
const ers = (a, n) => {
    if (s.split(a).length !== 2) throw new Error(`Anker nicht eindeutig: ${JSON.stringify(a)}`);
    s = s.replace(a, n);
};
ers(
    "            const z = msg.zellen;\n",
    "            const b5t0 = performance.timeOrigin + performance.now(); // OMEN 1910 Kette (Instrument): Start im Faden\n            const z = msg.zellen;\n"
);
ers(
    '                    type: "wald-darts-result",\n',
    '                    type: "wald-darts-result",\n                    b5: [b5t0, performance.timeOrigin + performance.now()],\n'
);
fs.writeFileSync(f, s);
console.log(f, "gepatcht (1910 Wald-Stempel)");
