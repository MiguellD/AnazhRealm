// Schreibt in anazhRealm.js (Arbeitsbaum) die Diagnose-Variante des Tiefen-Abbilds: volle Auflösung, exakte Kopie.
const fs = require("fs");
const f = process.argv[2];
let s = fs.readFileSync(f, "utf8");
const r = (a, b) => {
    if (s.split(a).length !== 2) throw new Error("Anker: " + a.slice(0, 60));
    s = s.replace(a, b);
};
r("const w = Math.max(1, Math.ceil(quelle.width / 2)),\n            h = Math.max(1, Math.ceil(quelle.height / 2));", "const w = quelle.width,\n            h = quelle.height;");
r('"    let b = vec2i(p.xy) * 2;\\n" +', '"    let b = vec2i(p.xy);\\n" +');
r('"    for (var j = 0; j < 2; j++) {\\n" +', '"    for (var j = 0; j < 1; j++) {\\n" +');
r('"        for (var i = 0; i < 2; i++) {', '"        for (var i = 0; i < 1; i++) {');
fs.writeFileSync(f, s);
console.log("Variante voll geschrieben");
