// 1310-5/7: die Bäume EINER Art an/aus (oder "alle", "nadel" = fichte/tanne/mammut, "laub" = der Rest) und je Art die Instanzen samt mittlerer Welt-Skala (Länge der
// x-Achse der Instanz-Matrix) und Dreiecke je Instanz. node art.cjs <port> <an|aus|mass> [art]
"use strict";
const http = require("http");
const [port, wie, art] = process.argv.slice(2);
const code = `
const ARTEN = ["eiche","fichte","birke","tanne","weide","strauch","buche","kiefer","mammut","karst","totholz"];
const artVon = (k) => { const m = /^(?:f|fscatter|fimp):(?:atlas:)?([a-z_]+)/.exec(String(k)); return m && ARTEN.includes(m[1]) ? m[1] : null; };
const wie = ${JSON.stringify(wie)}, ziel = ${JSON.stringify(art || "alle")};
const M = new T.Matrix4(), v = new T.Vector3();
const mass = {};
for (const [k, g] of r.state.archInstanceGroups || []) {
  const a = artVon(k); if (!a || !g || !g.mesh) continue;
  if (wie === "mass") {
    const s = mass[a] || (mass[a] = { gruppen: 0, inst: 0, skala: 0, tris: 0 });
    s.gruppen++;
    const geo = g.mesh.geometry; const tri = geo.index ? geo.index.count / 3 : geo.attributes.position.count / 3;
    for (let i = 0; i < g.liveCount; i++) { g.mesh.getMatrixAt(i, M); v.setFromMatrixColumn(M, 0); s.skala += v.length(); s.inst++; s.tris += tri; }
    continue;
  }
  const NADEL = ["fichte","tanne","mammut","kiefer"];
  if (ziel === "nadel" ? !NADEL.includes(a) : ziel === "laub" ? NADEL.includes(a) : ziel !== "alle" && a !== ziel) continue;
  g.mesh.visible = wie === "an";
  let p = g.mesh.parent; while (p) { if (p.isBundleGroup) p.needsUpdate = true; p = p.parent; }
}
if (wie === "mass") { for (const a in mass) { const s = mass[a]; s.skala = +(s.skala / Math.max(1, s.inst)).toFixed(3); s.trisJe = Math.round(s.tris / Math.max(1, s.inst)); delete s.tris; } return mass; }
return { wie, ziel };`;
const q = http.request({ host: "127.0.0.1", port: Number(port), path: "/eval", method: "POST", headers: { "Content-Type": "application/json" } }, (res) => {
    let d = "";
    res.on("data", (c) => (d += c));
    res.on("end", () => console.log(d.slice(0, 1500)));
});
q.end(JSON.stringify({ code }));
