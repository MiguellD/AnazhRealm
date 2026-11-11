// karte-name.cjs <modul> <name> … — trägt Namen in ein Modul der Modul-Karte ein und normalisiert sie auf ihren Fixpunkt
const fs = require("fs");
const path = require("path");
const stamm = require(path.resolve("scripts/lib/stamm.cjs"));
const datei = path.resolve("spec/stamm/modul-karte.json");
const [modul, ...namen] = process.argv.slice(2);
const k0 = JSON.parse(fs.readFileSync(datei, "utf8"));
const k = k0.module;
if (!Array.isArray(k[modul])) throw new Error("kein Modul " + modul);
for (const n of namen) if (!k[modul].includes(n)) k[modul].push(n);
const roh = JSON.stringify(k0, null, 2);
const fix = stamm.karteText(stamm.karteAus(roh));
fs.writeFileSync(datei, fix);
const k2 = JSON.parse(fs.readFileSync(datei, "utf8")).module;
console.log(modul, namen.map((n) => n + ":" + k2[modul].includes(n)).join(" "), "· Fixpunkt", stamm.karteText(stamm.karteAus(fix)) === fix);
