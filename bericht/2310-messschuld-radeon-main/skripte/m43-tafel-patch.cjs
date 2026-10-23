// fügt der Albedo-Tafel des Mess-Baums (Scratch, nie committet) die Fels-Stufen-Zeilen fels-l1/fels-l2 hinzu (exemplar.stufe 1/2,
// stufeVon fels) — dieselbe Form wie haus-l1/haus-l2. Rücknahme: git -C <WT> checkout spec/farbe/albedo-tafel.json
const fs = require("fs");
const p = process.argv[2];
const t = JSON.parse(fs.readFileSync(p, "utf8"));
const fels = t.zeilen.find((z) => z.id === "fels");
for (const n of [1, 2]) {
    if (t.zeilen.some((z) => z.id === "fels-l" + n)) continue;
    const z = JSON.parse(JSON.stringify(fels));
    z.id = "fels-l" + n;
    z.titel = "Derselbe Felsbogen in seiner Stufe " + n + " (M43): die Welt-Albedo gegen die der Zeile fels";
    z.labor = { studio: "terrain" };
    z.welt.exemplar = Object.assign({}, z.welt.exemplar, { stufe: n });
    z.welt.stufeVon = "fels";
    z.ist = null;
    z.ratsche = null;
    t.zeilen.splice(t.zeilen.indexOf(fels) + n, 0, z);
}
fs.writeFileSync(p, JSON.stringify(t, null, 2) + "\n");
console.log("zeilen", t.zeilen.map((z) => z.id).join(","));
