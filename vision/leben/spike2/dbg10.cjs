const { KB, setzeSkala } = require("./wuchsformen.cjs");
const sb = KB.sb;
const am = sb.addMerged; sb.addMerged = function (geos) { if (geos && geos.length) { const s = {}; geos.forEach((g, i) => { const a = g.attributes.aWind; const k = a.array.constructor.name + "/" + a.itemSize + "/" + a.normalized + "/" + !!a.isInterleavedBufferAttribute; (s[k] = s[k] || []).push(i); }); console.log(JSON.stringify(s)); } return am.apply(this, arguments); };
const bt = sb.buildTube; sb.buildTube = function (geos, rings, P, a, b, tr, noFlute, barkThick, lodIn) { const n0 = geos.length; const r = bt.apply(this, arguments); for (let k = n0; k < geos.length; k++) geos[k].userData.__dbg = `rings ${rings.length} barkThick ${barkThick} lod ${lodIn}`; return r; };
KB.PRESETS.d = { kind: "tree", panel: "plant", s: { api: 0.68, delta: 2.3, slim: 0.5, trop: -0.3, leaf: 0.5 }, ph: { kind: "tree", height: 1.5, maxDepth: 2, roots: 0, flare: 0, crownBase: 0, gesetz: { trunkR: 0.03, stammAnteil: 0.55, speicher: { form: "saeule", rReq: 0.03, taper: 0.995, fBlatt: 0, rippen: 8 } } } };
setzeSkala(KB, "d", 1);
const am2 = sb.addMerged; sb.addMerged = function (geos) { if (geos && geos.length) geos.forEach((g,i)=>{ if (g.attributes.aWind.array.constructor.name !== geos[0].attributes.aWind.array.constructor.name) console.log("abweichend", i, g.userData.__dbg || "kein buildTube", g.attributes.position.count); }); return am2.apply(this, arguments); };
KB.buildInstance("d", 1, 0);
