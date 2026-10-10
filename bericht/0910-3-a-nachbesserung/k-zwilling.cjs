const fs = require("fs");
for (const [n, f] of [["rf-alt (1457bfa9)", "../rf-alt/anazhRealm.js"], ["main", "../rf-main/anazhRealm.js"], ["Kopf", "anazhRealm.js"]]) {
    const src = fs.readFileSync(f, "utf8");
    const i = src.indexOf('window.addEventListener("resize"');
    const k = src.slice(i, src.indexOf("});", i)).replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/.*$/gm, "");
    console.log(n, "K Zwilling im Handler:", /_tiefenKnotenTausch|_tiefenLeserNeuBinden|_ensureHydroSurfaceMaterial|_feldPassDispose|hydroSurfaceMaterial\s*=/.test(k));
}
