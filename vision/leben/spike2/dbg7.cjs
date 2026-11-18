const { KB, setzeSkala } = require("./wuchsformen.cjs");
const sb = KB.sb;
const am = sb.addMerged; sb.addMerged = function (geos, mat) { console.log("addMerged", geos.length, geos.slice(0,3).map(g => g.attributes && g.attributes.position ? g.attributes.position.count : "?")); const r = am.apply(this, arguments); console.log("  ->", !!r); return r; };
const bt = sb.buildTube; let nb = 0; sb.buildTube = function (geos, rings) { nb++; const n0 = geos.length; const r = bt.apply(this, arguments); if (nb < 4) console.log("buildTube rings", rings.length, "r0", rings[0].r.toFixed(4), "geos+", geos.length - n0); return r; };
for (const md of [0, 2]) {
KB.PRESETS.d = { kind: "tree", panel: "plant", s: { api: 0.68, delta: 2.3, slim: 0.5, trop: -0.3, leaf: 0.5 }, ph: { kind: "tree", height: 1.5, maxDepth: md, roots: 0, flare: 0, crownBase: 0, gesetz: { trunkR: 0.03, stammAnteil: 0.55, speicher: { form: "saeule", rReq: 0.03, taper: 0.995, fBlatt: 0, rippen: 8 } } } };
setzeSkala(KB, "d", 1); nb = 0; console.log("== maxDepth", md);
KB.buildInstance("d", 1, 0); console.log("buildTube calls", nb);
}
