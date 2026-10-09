// node hunks.cjs <datei> <indizes,komma> > teil.patch — nur die gewählten Hunks (0-basiert) aus `git diff <datei>`
const { execSync } = require("child_process");
const [datei, ix] = process.argv.slice(2);
const d = execSync(`git diff -- ${datei}`, { encoding: "utf8", maxBuffer: 1 << 28 });
const teile = d.split(/^(?=@@ )/m);
const kopf = teile.shift();
const wahl = new Set(ix.split(",").map(Number));
process.stdout.write(kopf + teile.filter((_, i) => wahl.has(i)).join(""));
