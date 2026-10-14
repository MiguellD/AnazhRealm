// 1310-18: die Erst-Bau-Serie lesen — je Lauf (A1/B1/A2/B2 × kalt/zweit): Weltbild, echte Bauten bis zum Bild (Haupt ·
// Schatten) und ihre Zeit, je Klasse (Membran · Nebel · Foundry instanziert · Foundry Mesh · Rest).
//   node auswertung.cjs <ordner>
const fs = require("fs");
const path = require("path");
const ord = process.argv[2] || path.join(__dirname, "bau");
const klasse = (b) => {
    if (/portal-membran/.test(b.ou)) return "membran";
    if (/portal-nebel/.test(b.ou)) return "nebel";
    if (b.kind && b.art === "inst") return "foundry-inst";
    if (b.kind) return "foundry-mesh";
    return b.schatten ? "schatten-rest" : "rest";
};
const zeilen = [];
for (const f of fs.readdirSync(ord).filter((f) => /^[AB]\d-(kalt|zweit)\.json$/.test(f)).sort()) {
    const d = JSON.parse(fs.readFileSync(path.join(ord, f), "utf8"));
    const vor = d.liste.filter((b) => b.t <= d.weltbild && b.gebaut);
    const sum = (a) => a.reduce((s, b) => s + b.ms, 0) / 1000;
    const k = {};
    for (const b of vor) {
        const n = klasse(b);
        (k[n] = k[n] || { n: 0, s: 0 }).n++;
        k[n].s += b.ms / 1000;
    }
    zeilen.push({
        lauf: f.replace(".json", ""),
        weltbild: +(d.weltbild / 1000).toFixed(2),
        bauten: vor.length,
        sek: +sum(vor).toFixed(2),
        haupt: vor.filter((b) => !b.schatten).length,
        schatten: vor.filter((b) => b.schatten).length,
        klassen: Object.fromEntries(Object.entries(k).map(([n, v]) => [n, `${v.n}/${v.s.toFixed(2)}s`])),
        welt: d.erst,
        fehler: (d.fehler || []).filter((t) => !/Galaxy-Skybox/.test(t)).length,
    });
}
for (const z of zeilen) console.log(JSON.stringify(z));
