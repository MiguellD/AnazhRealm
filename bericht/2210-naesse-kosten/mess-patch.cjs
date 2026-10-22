// naesse-kosten (Zerlegung beim Namen): Mess-Patch an stamm/stoff-material.js (nur lokal, danach checkout) — eine Uniform `dachAn`
// (1 = wie im Spiel); 0 schaltet im NASSEN Zweig den Dach-Pool ab (die Himmels-Sicht 1, die 8 Kästen fallen aus dem Programm-Pfad).
// Die Bedingung liest den Welt-Ort wie das Original (r184 schreibt dann ein if/else, nie ein select beider Seiten).
const fs = require("fs"), f = process.argv[2];
let t = fs.readFileSync(f, "utf8"); const t0 = t;
const rep = (a, b) => { if (!t.includes(a)) { console.error("FEHLT: " + a.slice(0, 90)); process.exit(1); } t = t.replace(a, b); };
rep("            naesse: TSL.uniform(0),\n", "            naesse: TSL.uniform(0),\n            dachAn: TSL.uniform(1),\n");
rep("        this._naesseHimmelK = T.select(nass, T.float(1).sub(unter), T.float(0));",
    "        const mitDach = U.dachAn.greaterThan(0.5).and(p.y.greaterThan(-1e9));\n" +
    "        this._naesseHimmelK = T.select(nass, T.select(mitDach, T.float(1).sub(unter), T.float(1)), T.float(0));");
fs.writeFileSync(f, t); console.log("gepatcht Δ=" + (t.length - t0.length));
