const { KB } = require("./wuchsformen.cjs");
const PC = KB.PC;
const pre = { kind: "tree", panel: "plant", s: { api: 0.68, delta: 2.3, slim: 0.5, trop: -0.3, leaf: 0.5 }, ph: { kind: "tree", height: 1.5, maxDepth: 2, roots: 0, flare: 0, crownBase: 0, gesetz: { trunkR: 0.03, stammAnteil: 0.55, speicher: { form: "saeule", rReq: 0.03, taper: 0.995, fBlatt: 0, rippen: 8 } } } };
const P = PC.treeParams(pre.s, 1, 0, pre, 0);
let a = 7; const sk = PC.growSkeleton(P, () => { a = (a * 16807) % 2147483647; return a / 2147483647; });
const bad = sk.segs.filter(s => ![...s.p0, ...s.p1, s.r0, s.r1, s.sway0, s.sway1].every(Number.isFinite));
console.log("segs", sk.segs.length, "nicht endlich", bad.length, bad[0] && JSON.stringify(bad[0]).slice(0, 200));
console.log("runMeta", Object.keys(sk.runMeta).length, "maxSway?", sk.segs.map(s=>s.sway1).slice(0,5));
