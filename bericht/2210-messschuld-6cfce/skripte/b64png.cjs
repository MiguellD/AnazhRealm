// b64png.cjs <eval-ausgabe.txt> <bild.png> — das Ausgabe-Bild (RGBA top-down, 1920×1080) aus einer werkbank-eval-Antwort als PNG; die Zahlen ohne b64 nach <txt>.json
const fs = require("fs");
const png = require(__dirname + "/png.cjs");
const o = JSON.parse(fs.readFileSync(process.argv[2], "utf8"));
const e = o.ergebnis;
fs.writeFileSync(process.argv[3], png(new Uint8Array(Buffer.from(e.b64, "base64")), 1920, 1080));
delete e.b64;
fs.writeFileSync(process.argv[2] + ".json", JSON.stringify(o, null, 1));
fs.writeFileSync(process.argv[2], JSON.stringify(o, null, 1));
console.log(JSON.stringify(e));
