// Baut scripts/lib/vram-abgriff.cjs aus dem ausgeschnittenen Block der Werkbank und dem Zensus-Grund.
const fs = require("fs");
const path = require("path");
const wt = process.argv[2];
const L = fs.readFileSync(path.join(wt, "scratch-vram-block.txt"), "utf8").replace(/\n$/, "").split("\n");
const grund = fs.readFileSync(path.join(__dirname, "grund.txt"), "utf8").replace(/\n$/, "").split("\n");
const i = L.findIndex((z) => z.startsWith("    for (const K of [GPUBuffer, GPUTexture])"));
if (i < 0) throw new Error("Einfuegestelle fehlt");
const kopf = [
    "// vram-abgriff.cjs — DER VRAM-ABGRIFF der Werkbank und jeder Linse, die die GPU beim Namen zählt (bis 07.10. ein Teil",
    "// von scripts/werkbank.cjs; gate:ziel-zensus fährt ihn headless, darum lebt er hier als EINE Quelle). Er läuft vor jedem",
    "// Seiten-Skript: page.evaluateOnNewDocument(vramAbgriff).",
    '"use strict";',
    "",
];
fs.writeFileSync(
    path.join(wt, "scripts", "lib", "vram-abgriff.cjs"),
    [...kopf, ...L.slice(0, i), ...grund, ...L.slice(i), "", "module.exports = { vramAbgriff };", ""].join("\n")
);
console.log("geschrieben, Grund vor Zeile", i + kopf.length + 1);
