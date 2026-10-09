// 0710-8 ROT 1 + ROT 2 (Spiel-Seite)
"use strict";
const fs = require("fs");
const p = process.argv[2] + "/anazhRealm.js";
let s = fs.readFileSync(p, "utf8");
function ers(a, b) {
    if (s.split(a).length !== 2) throw new Error("TREFFER: " + a.slice(0, 120));
    s = s.replace(a, b);
}
// ROT 2: die Werkzeuge des Spielers verlangen wie sein Chat
ers(
    `    // WER VERLANGT? Die DSL-Quelle eines Akts (\`ctx.source\`): der Spieler selbst ist „human" (sein Chat, seine Werkzeuge,
    // der Befehl „dorf") und der Begleiter, der seinen Satz ausführt („llm:<name>"); Nexus, Welt-Regeln, Resonanz und
    // Mitspieler („remote-…") handeln für die Welt, nicht für ihn.
    _spielerVerlangt(quelle) {
        return quelle === "human" || (typeof quelle === "string" && quelle.startsWith("llm:"));
    }`,
    `    // WER VERLANGT? Die DSL-Quelle eines Akts (\`ctx.source\`): der Spieler selbst — „human" (sein Chat, der Befehl „dorf"),
    // seine Werkzeuge (\`AnazhRealm.SPIELER_QUELLEN\`: die Fähigkeit per Taste „ability:<name>", das Wirken „capability:<key>",
    // der Verzehr „consume:<bauplan>") — und der Begleiter, der seinen Satz ausführt („llm:<name>"); Nexus, Welt-Regeln,
    // Resonanz und Mitspieler („remote-…") handeln für die Welt, nicht für ihn.
    _spielerVerlangt(quelle) {
        if (quelle === "human") return true;
        if (typeof quelle !== "string") return false;
        for (const vor of AnazhRealm.SPIELER_QUELLEN) if (quelle.startsWith(vor)) return true;
        return false;
    }`
);
ers(
    `AnazhRealm.DSL_WELTAKTE = Object.freeze([`,
    `// DIE QUELLEN DES SPIELERS (\`_spielerVerlangt\`, neben „human"): der Begleiter, der seinen Satz ausführt, und seine Werkzeuge —
// die Fähigkeit per Taste, das Wirken, der Verzehr (gate:settlement C7).
AnazhRealm.SPIELER_QUELLEN = Object.freeze(["llm:", "ability:", "capability:", "consume:"]);
AnazhRealm.DSL_WELTAKTE = Object.freeze([`
);
fs.writeFileSync(p, s);
console.log("ok");
