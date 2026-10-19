// 1910 F1: zerlegt die Antwort von blick.js (werkbank eval) — je Schuss das JPEG als <ordner>/<name>.jpg, die Zahlen ohne Bild
// als <ordner>/blick.json; druckt je Schuss eine Zeile.   node jpg.cjs <antwort.txt> <ordner>
"use strict";
const fs = require("fs");
const path = require("path");
const [f, d] = process.argv.slice(2);
const t = fs.readFileSync(f, "utf8");
let j = null;
try {
    j = JSON.parse(t.slice(t.indexOf("{")));
    j = j.ergebnis !== undefined ? j.ergebnis : j;
} catch (_e) {}
if (!j || !j.bilder) {
    console.log("FEHLER " + t.slice(0, 400));
    process.exit(1);
}
for (const b of j.bilder) {
    if (b.jpg) fs.writeFileSync(path.join(d, b.name + ".jpg"), Buffer.from(b.jpg.split(",")[1], "base64"));
    b.datei = b.jpg ? b.name + ".jpg" : null;
    delete b.jpg;
}
fs.writeFileSync(path.join(d, "blick.json"), JSON.stringify(j, null, 1));
console.log(`ende=${j.ende} steil=${JSON.stringify(j.steil)} welt=${j.weltStandS}s/${j.weltSteht} mount=${j.mount} gpuFehler=${JSON.stringify(j.gpuFehler)}`);
for (const b of j.bilder)
    console.log(`${b.name} sicht=${b.sicht} v=${b.v} imBild=${b.imBild} ndc=${b.ndc} abstand=${b.abstandM} az=${b.azimutGegenKursGrad} lod=${b.lod}/${b.lodBand} stufen=${JSON.stringify(b.stufen)} ego=${b.egoGedrehtGrad || ""} fehler=${b.fehler || ""} datei=${b.datei}`);
