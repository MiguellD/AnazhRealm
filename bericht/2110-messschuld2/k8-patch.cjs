// k8-sicht.diff als Ersatz (die Diff-Köpfe nennen diag-k8-first.cjs): Spalte sicht immer; `--ego` setzt dazu die Ego-Sicht
// (first), `--third` die Third-Sicht — an derselben Stelle wie der Diff. Der Kopf 1011d41d fährt K8 ohne Patch in first.
const fs = require("fs"), f = process.argv[2];
const sicht = process.argv.includes("--ego") ? "first" : process.argv.includes("--third") ? "third" : null;
let t = fs.readFileSync(f, "utf8"); const t0 = t;
const rep = (a, b) => { if (!t.includes(a)) { console.error("FEHLT: " + a); process.exit(1); } t = t.replace(a, b); };
rep('neig: ort === "hang" ? hang.neigung : 0 });', 'neig: ort === "hang" ? hang.neigung : 0, sicht: s.cameraMode });');
rep("${o[ort].neig}° · ` +", "${o[ort].neig}° ${o[ort].sicht} · ` +");
if (sicht) rep("    const o = {};\n    const W = window.__messWiese;", "    const o = {}; r.setCameraMode(" + JSON.stringify(sicht) + ");\n    const W = window.__messWiese;");
fs.writeFileSync(f, t); console.log("gepatcht sicht=" + sicht + " Δ=" + (t.length - t0.length));
