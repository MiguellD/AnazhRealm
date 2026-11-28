// Messung (scratch, nicht im Repo): die Auslese der Größe im Gau-Kern — W×W Reviere, Takt taktS, mit/ohne Wolf.
// node auslese.cjs <root> <W> <taktS|std> <generationen> [saat]
const path = require("path"), fs = require("fs");
const [root, Ws, taktArg, genS, saatS] = process.argv.slice(2);
const W = +Ws, GEN = +genS, saat = +(saatS || 1);
global.self = global;
require(path.join(root, "tetrapoda-core.js"));
const core = global.__tetrapodaCore;
require(path.join(root, "gelaende-core.js"));
require(path.join(root, "leben-core.js"));
require(path.join(root, "samen-core.js"));
const SAMEN_STROM = global.__samenCore.samenStrom;
const L = global.__lebenCore;
const src = fs.readFileSync(path.join(root, "scripts/diag-kreatur-leben.cjs"), "utf8");
const a = src.indexOf("function bestandTreiber("), b = src.indexOf("function bestandUrteil(");
const bestandTreiber = new Function("SAMEN_STROM", src.slice(a, b) + "; return bestandTreiber;")(SAMEN_STROM);
const B0 = core.BESTAND_GESETZ;
const taktS = taktArg === "std" ? B0.taktS : +taktArg;
const T = Object.create(core);
T.BESTAND_GESETZ = Object.freeze(Object.assign({}, B0, { taktS }));
const { K, TJ, M_ART, welt } = bestandTreiber(T, L);
const lebenHirsch = L.lebensdauerS(M_ART.deer);
const takte = Math.ceil((GEN * lebenHirsch) / taktS);
function lnM(z) {
    let s = 0, n = 0;
    for (const l of z.beute) for (const t of l) (s += Math.log(t.M / M_ART.deer)), n++;
    return [n ? s / n : NaN, n];
}
function lauf(jaeger) {
    const feld = welt(W, W);
    let z = K.anfang({ W, H: W, saat, jaeger }, feld);
    const [l0] = lnM(z);
    const t0 = Date.now();
    let wolf = 0;
    for (let k = 0; k < takte; k++) {
        feld.takt();
        z = K.schritt(z, saat, k, feld);
        feld.aesen(z.frass);
    }
    for (const R of z.rudel) wolf += R.tiere.length;
    const [l1, n] = lnM(z);
    return { dLnM: +(l1 - l0).toFixed(4), beute: n, wolf, s: (Date.now() - t0) / 1000 };
}
const mit = lauf(true), ohne = lauf(false);
console.log(JSON.stringify({ root: path.basename(root), W, taktS, TJ: +TJ.toFixed(3), lebenHirschS: Math.round(lebenHirsch), generationen: GEN, takte, mit, ohne, gegenlauf: +(mit.dLnM - ohne.dLnM).toFixed(4), msJeGeneration: Math.round((1000 * (mit.s + ohne.s)) / GEN) }));
