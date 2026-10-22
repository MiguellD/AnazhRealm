// vorrat-pingpong (Decke, freigegeben: Existenz-Proben): `if (typeof r.X === "function") {` um eine Methode, die der Stamm trägt
// (Liste proben.txt: Datei:Zeile:Text) — die Zeile fällt, der Rumpf rückt um 4 aus, die schließende Klammer fällt. Nur ein Block
// ohne else; sonst bleibt er. Aufruf im Baum: node huelle-weg.cjs <proben.txt>
const fs = require("fs");
const je = new Map();
for (const z of fs.readFileSync(process.argv[2], "utf8").trim().split("\n")) {
    const m = /^(.+?\.cjs):(\d+):(\s*)if \(typeof r\.\w+ === "function"\) \{$/.exec(z);
    if (m) (je.get(m[1]) || je.set(m[1], []).get(m[1])).push([+m[2], m[3]]);
}
let n = 0;
for (const [datei, liste] of je) {
    const L = fs.readFileSync(datei, "utf8").split("\n");
    for (const [nr, ein] of liste.sort((a, b) => b[0] - a[0])) {
        const i = nr - 1;
        let e = i + 1;
        while (e < L.length && L[e] !== ein + "}") e++;
        if (e >= L.length || /^\s*else\b/.test(L[e + 1] || "") || L.slice(i + 1, e).some((l) => l && !l.startsWith(ein + "    "))) {
            console.log("bleibt", datei, nr);
            continue;
        }
        const rumpf = L.slice(i + 1, e).map((l) => (l ? l.slice(4) : l));
        L.splice(i, e - i + 1, ...rumpf);
        n++;
    }
    fs.writeFileSync(datei, L.join("\n"));
}
console.log("Hüllen gefallen:", n);
