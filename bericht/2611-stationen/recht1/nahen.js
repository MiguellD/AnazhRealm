// node nahen.js <an|aus> → Code: die Mutante „die Wache naht über den Weg“ (statt der freien Geraden genügt `_bewohnerStrecke`, wie beim Weichen)
const fs = require("fs");
const roh = fs.readFileSync(__dirname + "/nahen-main.txt", "utf8");
const body = roh.slice(roh.indexOf("{") + 1, roh.lastIndexOf("}"));
const alt = "|| this._bewohnerWand(p, q)) return false;";
if (!body.includes(alt)) throw new Error("Nahen-Zeile nicht gefunden");
const neu = "|| !this._bewohnerStrecke(S, { x: p.x, z: p.z }, q, 0)) return false;";
process.stdout.write(process.argv[2] === "an"
  ? `const AnazhRealm = r.constructor; r._bewohnerNahen = function (S, b, o, stunde) {${body.replace(alt, neu)}}; return { an: "Nahen über den Weg" };`
  : `delete r._bewohnerNahen; return { basis: !Object.prototype.hasOwnProperty.call(r, "_bewohnerNahen") };`);
