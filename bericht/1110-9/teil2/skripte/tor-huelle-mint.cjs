// Prägt NUR die Zahlen der TOR_HUELLE neu, die die Mint-Treue reißen (aufCm der gebauten Zahl); die übrigen bleiben.
const fs = require("fs"), path = require("path");
const root = process.argv[2];
global.THREE = require(path.join(root, "worlds/terrain/lib/three-r128.min.js"));
require(path.join(root, "porta-core.js"));
const PC = globalThis.__portaCore;
const { torHuelleMessen, aufCm } = require(path.join(root, "scripts/lib/tor-huelle.cjs"));
const datei = path.join(root, "porta-core.js");
let src = fs.readFileSync(datei, "utf8");
const neu = [];
const treu = (a, b) => a >= b - 1e-9 && a - b <= 0.01 + 1e-9;
for (const id of Object.keys(PC.TOR_HUELLE)) {
    const t = JSON.parse(JSON.stringify(PC.TOR_HUELLE[id]));
    const m = torHuelleMessen(PC, THREE, id);
    if (!treu(t.oberkante, m.oberkante)) { neu.push(`${id}.oberkante ${t.oberkante}→${aufCm(m.oberkante)}`); t.oberkante = aufCm(m.oberkante); }
    const namen = ["pfostenX", "pfostenZ", "obenX", "obenZ"];
    for (let k = 0; k < 2; k++) for (let j = 0; j < 4; j++) if (!treu(t.seiten[k][j], m.seiten[k][j])) { neu.push(`${id}.seiten[${k}].${namen[j]} ${t.seiten[k][j]}→${aufCm(m.seiten[k][j])}`); t.seiten[k][j] = aufCm(m.seiten[k][j]); }
    const zeile = `        ${id}: { seiten: ${JSON.stringify(t.seiten).replace(/,/g, ", ")}, oberkante: ${t.oberkante} },`;
    const re = new RegExp(`^        ${id}: \{ seiten: .*\},$`, "m");
    if (!re.test(src)) throw new Error("Zeile fehlt: " + id);
    src = src.replace(re, zeile);
}
if (process.argv[3] === "--schreiben") fs.writeFileSync(datei, src);
console.log(neu.length + " Zahlen neu geprägt:\n  " + neu.join("\n  "));
