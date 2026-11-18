const { KA, KB, setzeSkala } = require("./wuchsformen.cjs");
const PC = KB.PC;
const mk = (fB, rReq) => ({ kind: "tree", panel: "plant", s: { api: 0.68, delta: 2.3, slim: 0.5, trop: -0.3, leaf: 0.5 }, ph: { kind: "tree", height: 1.5, maxDepth: 2, roots: 0, flare: 0, crownBase: 0, gesetz: { trunkR: rReq, stammAnteil: 0.55, speicher: { form: "saeule", rReq, taper: 0.995, fBlatt: fB, rippen: 8 } } } });
for (const [fB, r] of [[0.5, 0.03], [0, 0.03], [0.02, 0.03]]) {
  const pre = mk(fB, r); KB.PRESETS.d = pre; setzeSkala(KB, "d", 1);
  const P = PC.treeParams(pre.s, 1, 0, pre, 0);
  let n = 0; const seq = (() => { let a = 7; return () => { a = (a * 16807) % 2147483647; return a / 2147483647; }; })();
  const sk = PC.growSkeleton(P, seq);
  let tris = 0; let err = null; try { const g = KB.buildInstance("d", 1, 0); g.traverse(o => { if (o.isMesh) tris += (o.geometry.index ? o.geometry.index.count : o.geometry.attributes.position.count) / 3; }); } catch (e) { err = e.message; }
  console.log("fBlatt", fB, "segs", sk.segs.length, "leaves", sk.leaves.length, "trunkR", sk.trunkR, "tris", tris, err || "", "P.kind", P.kind, "conif", P.conifer, "height", P.height.toFixed(2));
}
