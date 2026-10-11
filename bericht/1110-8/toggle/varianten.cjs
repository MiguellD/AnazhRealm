const fs = require("fs");
const d = "C:/Users/micha/Desktop/AnazhRealm-OMEN/p3/bk541/";
const src = fs.readFileSync(d + "b0-wie.js", "utf8");
const K = "                mat.emissiveNode = _Te.select(_zweig, _E.mul(_diffus.add(_glanz)), _Te.vec3(0));\n";
if (src.split(K).length !== 2) throw new Error("Anker des Augen-Terms nicht eindeutig");
fs.writeFileSync(d + "bK-ohneAugenTerm.js", src.replace(K, ""));
console.log("ok");
