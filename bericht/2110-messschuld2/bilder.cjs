// zerlegt antwort.txt der Kugel-Probe: Bilder als Dateien, der Rest als kugel.json
const fs = require("fs"), path = require("path"), d = __dirname;
const t = fs.readFileSync(path.join(d, "antwort.txt"), "utf8");
let j = JSON.parse(t.slice(t.indexOf("{"))); j = j.ergebnis !== undefined ? j.ergebnis : j;
for (const b of j.bilder || []) { const [kopf, roh] = b.jpg.split(","); const ext = kopf.includes("png") ? ".png" : ".jpg"; fs.writeFileSync(path.join(d, b.name + ext), Buffer.from(roh, "base64")); b.datei = b.name + ext; delete b.jpg; }
fs.writeFileSync(path.join(d, "kugel.json"), JSON.stringify(j, null, 1));
console.log(JSON.stringify({ ende: j.ende, fehler: j.fehler, stand: j.stand, puffer: j.puffer, belicht: j.belicht, kurve: j.kurve, sonne: j.sonne, h: j.sonnenHoeheGrad, bilanz: j.bilanz }, null, 0));
for (const [i, s] of (j.schuesse || []).entries()) console.log("schuss " + i + " " + JSON.stringify(s));
