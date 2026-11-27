// front-ein-geraet.cjs <leser-aus> — je Leiter die UNTERSTE ungebuchte Sprosse; druckt die, die nur EIN Gerät hält (das andere nennt die Zeile nicht)
const fs = require("fs");
const z = fs.readFileSync(process.argv[2], "utf8").split(/\r?\n/);
const leitern = new Map();
for (const l of z) {
    const m = l.match(/^\s+([a-z0-9.\-]+) S (\d+): (PUNKT|KERN|0)\b(.*)$/i);
    if (!m) continue;
    if (!leitern.has(m[1])) leitern.set(m[1], []);
    leitern.get(m[1]).push({ n: Number(m[2]), stand: m[3], rest: m[4] });
}
const aus = { radeon: [], gtx: [], beide: 0, sonst: [] };
for (const [name, sp] of leitern) {
    sp.sort((a, b) => a.n - b.n);
    const f = sp.find((s) => s.stand !== "PUNKT");
    if (!f) continue;
    const r = /Richter ROT an Radeon 890M am ([0-9a-f]{8})/.exec(f.rest), g = /Richter ROT an GTX 1060 am ([0-9a-f]{8})/.exec(f.rest);
    const zeile = name + "#" + f.n + " [" + f.stand + "]" + f.rest.slice(0, 230);
    if (r && !g) aus.radeon.push(zeile);
    else if (g && !r) aus.gtx.push(zeile);
    else if (r && g) aus.beide++;
    else aus.sonst.push(zeile);
}
console.log("Leitern " + leitern.size + " · Front hält NUR Radeon " + aus.radeon.length + " · NUR GTX 1060 " + aus.gtx.length + " · beide ROT " + aus.beide + " · sonst " + aus.sonst.length);
console.log("== NUR Radeon hält (Hand-Lauf an der Radeon am main):"); for (const l of aus.radeon) console.log("  " + l);
console.log("== NUR GTX 1060 hält (Auftrag an OMEN):"); for (const l of aus.gtx) console.log("  " + l);
console.log("== sonst (kein ROT genannt):"); for (const l of aus.sonst.slice(0, 40)) console.log("  " + l);
