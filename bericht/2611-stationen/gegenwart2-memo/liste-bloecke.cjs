// liste-bloecke.cjs — welche Stations-Blöcke von `node punkte.cjs liste` sich zwischen Basis und Kandidat ändern (Leser 2, 26.11.).
// Ein Block beginnt an der Kopf-Zeile „  <kriterium>#<staffel> · “ und reicht bis zur nächsten. Gedruckt: die Zahl der Blöcke vorher ↔
// nachher, die geänderten je Perspektive (die zwei Glieder nach „karte2.“) und je Leiter (das dritte Glied), die neuen und die entfallenen.
//   node liste-bloecke.cjs <liste-basis.txt> <liste-kandidat.txt>
"use strict";
const fs = require("fs");
const bloecke = (datei) => {
    const m = new Map();
    let k = null;
    let buf = [];
    for (const z of fs.readFileSync(datei, "utf8").split("\n")) {
        const h = /^ {2}([\w.]+#\d+) · /.exec(z);
        if (h) {
            if (k) m.set(k, (m.get(k) || "") + buf.join("\n"));
            k = h[1];
            buf = [z];
        } else if (k) buf.push(z);
    }
    if (k) m.set(k, (m.get(k) || "") + buf.join("\n"));
    return m;
};
const [a, b] = process.argv.slice(2).map(bloecke);
const glied = (name) => name.replace(/^karte2\./, "").replace(/#\d+$/, "").split(".");
const je = {};
const leitern = new Set();
let geaendert = 0;
for (const [k, v] of b)
    if (a.has(k) && a.get(k) !== v) {
        geaendert++;
        const g = glied(k);
        je[g.slice(0, 2).join(".")] = (je[g.slice(0, 2).join(".")] || 0) + 1;
        leitern.add(g[2]);
    }
const neu = [...b.keys()].filter((k) => !a.has(k));
const weg = [...a.keys()].filter((k) => !b.has(k));
console.log("Blöcke " + a.size + " → " + b.size + " · geändert " + geaendert + " · neu " + neu.length + " · entfallen " + weg.length + " " + JSON.stringify(je));
console.log("Leitern (" + leitern.size + "): " + [...leitern].sort().join(" · "));
if (neu.length || weg.length) console.log("neu: " + neu.join(" ") + " · entfallen: " + weg.join(" "));
