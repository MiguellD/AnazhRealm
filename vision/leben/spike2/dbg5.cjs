const { KB, setzeSkala } = require("./wuchsformen.cjs");
KB.sb.console.error = (...a) => console.log("ERR", ...a.map(x => String(x && x.stack || x).slice(0, 400)));
KB.sb.console.log = (...a) => console.log("LOG", ...a.map(x => String(x).slice(0, 200)));
KB.PRESETS.d = { kind: "tree", panel: "plant", s: { api: 0.68, delta: 2.3, slim: 0.5, trop: -0.3, leaf: 0.5 }, ph: { kind: "tree", height: 1.5, maxDepth: 2, roots: 0, flare: 0, crownBase: 0, gesetz: { trunkR: 0.03, stammAnteil: 0.55, speicher: { form: "saeule", rReq: 0.03, taper: 0.995, fBlatt: 0, rippen: 8 } } } };
setzeSkala(KB, "d", 1);
const g = KB.buildInstance("d", 1, 0); let n = 0; g.traverse(o => { if (o.isMesh) n++; }); console.log("meshes", n, "children", g.children.length, JSON.stringify(g.userData));
