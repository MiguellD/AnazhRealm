const { KA, KB, setzeSkala, baue } = require("./wuchsformen.cjs");
const mk = (fB, rReq, maxD) => ({ kind: "tree", panel: "plant", s: { api: 0.68, delta: 2.3, slim: 0.5, trop: -0.3, leaf: 0.5 }, ph: { kind: "tree", height: 1.5, maxDepth: maxD, roots: 0, flare: 0, crownBase: 0, gesetz: { trunkR: rReq, stammAnteil: 0.55, speicher: { form: "saeule", rReq, taper: 0.995, fBlatt: fB, rippen: 8 } } } });
for (const [fB, r, md] of [[0, 0.03, 2], [0, 0.03, 0], [0.5, 0.03, 2], [1, 0.005, 6]]) for (const lod of [0, 1]) {
  KB.PRESETS.d = mk(fB, r, md); setzeSkala(KB, "d", 1);
  const x = baue(KB, "d", 1, lod); console.log("fB", fB, "r", r, "maxD", md, "lod", lod, "tris", x.tris, "fehler", x.fehler, "D", x.D && x.D.toFixed(3), "form", x.form);
}
