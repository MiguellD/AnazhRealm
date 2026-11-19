// phase: wie weit liegt jeder Stein der L0 neben der Zelle, die der Stoff an seiner Stelle webt? — je Stein (Bauteil der Rolle
// `backstein`, verschweißt) seine Mitte in der Vorlage, die gewebte Zelle (`_verbandStoff`: u = Lage längs t ÷ lM, v = Lage längs der
// Falllinie ÷ hM, jede zweite Lage um den Versatz geschoben) und der Abstand der Mitte zur Mitte der Zelle in Zellen (0 deckungsgleich,
// 0,5 auf der Fuge). node phase.cjs <kern.js> <haus> <same>
const fs = require("fs"), vm = require("vm");
const WB = require("C:/AnazhRealm/scripts/lib/welt-boot.cjs");
const [kern, haus = "alemannisch", seedS = "1"] = process.argv.slice(2);
const sb = { console, Math, performance: { now: () => Date.now() }, setTimeout, clearTimeout };
sb.self = sb.globalThis = sb.window = sb;
sb.THREE = WB.ENGINE_THREE();
vm.createContext(sb);
vm.runInContext(fs.readFileSync(kern, "utf8"), sb, { filename: kern });
const C = sb.__fachwerkCore;
const Z = C.verbandZeilen ? C.verbandZeilen() : null;
const zeile = Z ? Z[C.VERBAND_GESETZ.reihe.indexOf("mauerwerk")] : null;
const lM = zeile ? zeile.lM : C.VERBAND_GESETZ.mauerwerk.steinM + C.VERBAND_GESETZ.mauerwerk.fugeM;
const hM = zeile ? zeile.hM : C.VERBAND_GESETZ.mauerwerk.hoeheM + C.VERBAND_GESETZ.mauerwerk.fugeM;
const versatz = zeile ? zeile.versatz : 0.5;
const g = C.buildInstance(haus, +seedS, 0);
g.updateMatrixWorld(true);
const stein = C._MM && C._MM.backstein;
const fu = [], fv = [];
g.traverse((o) => {
    if (!o.isMesh || (stein && o.material !== stein)) return;
    const P = o.geometry.attributes.position, I = o.geometry.index, e = o.matrixWorld.elements, n = P.count;
    const w = (i) => { const x = P.getX(i), y = P.getY(i), z = P.getZ(i); return [e[0] * x + e[4] * y + e[8] * z + e[12], e[1] * x + e[5] * y + e[9] * z + e[13], e[2] * x + e[6] * y + e[10] * z + e[14]]; };
    // verschweißt je 1 mm, je Bauteil sein Kasten
    const key = new Map(), eltern = [];
    const id = new Int32Array(n);
    for (let i = 0; i < n; i++) {
        const q = w(i), k = q.map((v) => Math.round(v * 1000)).join(",");
        let x = key.get(k);
        if (x === undefined) { key.set(k, (x = key.size)); eltern.push(x); }
        id[i] = x;
    }
    const finde = (x) => { while (eltern[x] !== x) x = eltern[x] = eltern[eltern[x]]; return x; };
    const cnt = I ? I.count : n, ix = (j) => (I ? I.getX(j) : j);
    for (let t = 0; t < cnt; t += 3) { const a = finde(id[ix(t)]); eltern[finde(id[ix(t + 1)])] = a; eltern[finde(id[ix(t + 2)])] = a; }
    const box = new Map();
    for (let i = 0; i < n; i++) {
        const r = finde(id[i]), q = w(i);
        let b = box.get(r);
        if (!b) box.set(r, (b = [1e9, 1e9, 1e9, -1e9, -1e9, -1e9]));
        for (let j = 0; j < 3; j++) { b[j] = Math.min(b[j], q[j]); b[j + 3] = Math.max(b[j + 3], q[j]); }
    }
    for (const b of box.values()) {
        const dx = b[3] - b[0], dz = b[5] - b[2], dy = b[4] - b[1];
        // nur volle Steine (ein am Gefach geklippter hat seine Mitte nie in der Zellmitte)
        const fuge = C.VERBAND_GESETZ.mauerwerk.fugeM, breit = Math.max(dx, dz);
        if (Math.abs(breit - (lM - fuge)) > 0.005 || Math.abs(dy - (hM - fuge)) > 0.005) continue;
        // die Normale der Wand: die dünnste waagrechte Achse des Steins
        const nrm = dx < dz ? [1, 0, 0] : [0, 0, 1];
        const t = [nrm[2], 0, -nrm[0]];
        const c = [(b[0] + b[3]) / 2, (b[1] + b[4]) / 2, (b[2] + b[5]) / 2];
        const v = c[1] / hM, u = (c[0] * t[0] + c[2] * t[2]) / lM + (((Math.floor(v) * 0.5) % 1) + 1) % 1 * 2 * versatz;
        const ab = (x) => Math.abs((((x % 1) + 1) % 1) - 0.5);
        fu.push(ab(u)); fv.push(ab(v));
    }
});
const mittel = (a) => a.reduce((s, x) => s + x, 0) / Math.max(1, a.length);
console.log(`${haus} Same ${seedS}: ${fu.length} Steine · Abstand der Stein-Mitte zur Mitte der gewebten Zelle (in Zellen, 0 deckungsgleich, 0,5 auf der Fuge): längs ${mittel(fu).toFixed(3)} · hoch ${mittel(fv).toFixed(3)}`);
