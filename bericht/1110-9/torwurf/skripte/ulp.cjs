// je Stufe-3-Fall (seed 7): die Hüllen-Liste unter Math.<fn> ±1 ULP — welcher Fall kippt, welches Teil, welcher Wert
const path = require("path");
const root = process.argv[2], fnName = process.argv[3] || "pow";
global.THREE = require(path.join(root, "worlds/terrain/lib/three-r128.min.js"));
const f64 = new Float64Array(1), u64 = new BigUint64Array(f64.buffer);
const schritt = (x, d) => { if (!Number.isFinite(x) || x === 0) return x; f64[0] = x; u64[0] = u64[0] + BigInt(d * (x > 0 ? 1 : -1)); return f64[0]; };
const orig = Math[fnName];
const KERN = path.join(root, "porta-core.js");
const laden = () => { delete require.cache[require.resolve(KERN)]; require(KERN); return globalThis.__portaCore; };
const PC0 = laden();
const ids = Object.keys(PC0.PRESETS);
const basis = {}; for (const id of ids) basis[id] = JSON.stringify(PC0.huelle(id, 7).teile);
for (const d of [1, -1]) {
    Math[fnName] = function () { return schritt(orig.apply(Math, arguments), d); };
    const PC = laden();
    for (const id of ids) {
        const t = PC.huelle(id, 7).teile, b = JSON.parse(basis[id]);
        if (JSON.stringify(t) === basis[id]) continue;
        let i = 0; while (i < Math.min(t.length, b.length) && JSON.stringify(t[i]) === JSON.stringify(b[i])) i++;
        console.log(fnName + (d > 0 ? "+1" : "-1") + " " + id + ": Teile " + b.length + " → " + t.length + ", erstes Teil " + i + ": " + JSON.stringify(b[i]) + " → " + JSON.stringify(t[i]));
    }
    Math[fnName] = orig;
}
console.log("fertig " + fnName);
