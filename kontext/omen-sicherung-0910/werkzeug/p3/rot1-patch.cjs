// 0710-8 ROT 1 + ROT 2 (Spiel-Seite)
"use strict";
const fs = require("fs");
const p = process.argv[2] + "/anazhRealm.js";
let s = fs.readFileSync(p, "utf8");
function ers(a, b) {
    if (s.split(a).length !== 2) throw new Error("TREFFER: " + a.slice(0, 120));
    s = s.replace(a, b);
}
// ROT 1: der Frage-Zähler läuft über jeden Neubau weiter wie die Ordnung — die Einträge tragen die Marken der alten Fragen
ers(
    `            seq: alt ? alt.seq : 0,
            gen: alt ? alt.gen + 1 : 1,
            frage: 0,
        });`,
    `            seq: alt ? alt.seq : 0,
            gen: alt ? alt.gen + 1 : 1,
            // der Zähler der Fragen läuft über jeden Neubau weiter (wie die Ordnung): die Einträge tragen die Marken der alten
            // Fragen (\`_blockerFrage\`) — ein Zähler ab 0 träfe eine alte Marke, die Frage überginge den Eintrag
            frage: alt ? alt.frage : 0,
        });`
);
fs.writeFileSync(p, s);
console.log("ok");
