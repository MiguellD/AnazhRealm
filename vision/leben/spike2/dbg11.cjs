const { KB, setzeSkala } = require("./wuchsformen.cjs");
const sb = KB.sb;
const am = sb.addMerged; sb.addMerged = function (geos) { if (geos && geos.length) { const s = {}; geos.forEach((g, i) => { const k = (g.attributes.aWind.array instanceof Float32Array) ? "haupt" : "vm"; (s[k] = s[k] || []).push(i); }); console.log(JSON.stringify(s)); } return am.apply(this, arguments); };
KB.PRESETS.d = { kind: "tree", panel: "plant", s: { api: 0.68, delta: 2.3, slim: 0.5, trop: -0.3, leaf: 0.5 }, ph: { kind: "tree", height: 1.5, maxDepth: 2, roots: 0, flare: 0, crownBase: 0, gesetz: { trunkR: 0.03, stammAnteil: 0.55, speicher: { form: "saeule", rReq: 0.03, taper: 0.995, fBlatt: 0, rippen: 8 } } } };
setzeSkala(KB, "d", 1); KB.buildInstance("d", 1, 0);
console.log("eiche:"); KB.buildInstance("eiche", 1, 0);
