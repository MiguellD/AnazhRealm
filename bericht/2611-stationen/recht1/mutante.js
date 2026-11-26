// node mutante.js <an|aus> [K] → Code: setzt die Mutante M1+K als `_bewohnerWeichOrt` der Welt (eigene Eigenschaft), oder nimmt sie fort
const fs = require("fs");
const [wie, K] = process.argv.slice(2);
const roh = fs.readFileSync(__dirname + "/weichort-main.txt", "utf8");
const body = roh.slice(roh.indexOf("{") + 1, roh.lastIndexOf("}"));
const alt = "fort.sort((a, c) => a[0] - c[0]).find(([, q]) => fern(this._bewohnerStrecke(S, { ...p }, q, 0)))";
if (!body.includes(alt)) throw new Error("Basis-Zeile nicht gefunden");
const neu = `fort.sort((a, c) => a[0] - c[0])${K ? `.slice(0, ${Number(K)})` : ""}.find(([, q]) => fern(this._bewohnerStrecke(S, p, q, 0)))`;
process.stdout.write(wie === "an"
  ? `const AnazhRealm = r.constructor; r._bewohnerWeichOrt = function (S, b, o, stunde, belegt) {${body.replace(alt, neu)}}; window.__rechtMutante = "M1${K ? "+K" + K : ""}"; return { an: window.__rechtMutante };`
  : `delete r._bewohnerWeichOrt; const m = window.__rechtMutante; delete window.__rechtMutante; return { aus: m || null, basis: !Object.prototype.hasOwnProperty.call(r, "_bewohnerWeichOrt") };`);
