// spleißt den neuen Abschnitt der Stützstellen in eine Kopie des Kerns: node kern-spleiss.cjs <quelle> <ziel>
const fs = require("fs");
const [q, z] = process.argv.slice(2);
let t = fs.readFileSync(q, "utf8");
const nl = t.includes("\r\n") ? "\r\n" : "\n";
t = t.split(nl).join("\n");
const a = t.indexOf("    // DIE STÜTZSTELLEN DES STANDS (stand-stuetzstellen, 26.11.)");
const b = t.indexOf("    function leibStandLage(t, K, aus) {");
if (a < 0 || b < a) throw new Error("Anker fehlt");
t = t.slice(0, a) + fs.readFileSync(__dirname + "/kern-neu.txt", "utf8").split("\r\n").join("\n") + t.slice(b);
fs.writeFileSync(z, t.split("\n").join(nl));
console.log("ok", a, b);
