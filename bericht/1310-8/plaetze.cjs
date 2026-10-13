// 1310-8: je Baum-Instanz Platz, Abstand zur Kamera und das Deckungs-Maß (Welt-Skala² / Abstand², nur im Blick-Kegel ±50°
// horizontal) — je Art die Summe, dazu die Plätze. node plaetze.cjs <port>
"use strict";
const http = require("http");
const code = `
const ARTEN = ["eiche","fichte","birke","tanne","weide","strauch","buche","kiefer","mammut"];
const artVon = (k) => { const m = /^(?:f|fscatter):([a-z_]+)/.exec(String(k)); return m && ARTEN.includes(m[1]) ? m[1] : null; };
const cam = r.state.camera; cam.updateMatrixWorld(true);
const cp = new T.Vector3().setFromMatrixPosition(cam.matrixWorld);
const vor = new T.Vector3(0, 0, -1).applyQuaternion(cam.quaternion); vor.y = 0; vor.normalize();
const M = new T.Matrix4(), p = new T.Vector3(), ax = new T.Vector3();
const je = {}; const plaetze = [];
for (const [k, g] of r.state.archInstanceGroups || []) {
  const a = artVon(k); if (!a || !g || !g.mesh) continue;
  for (let i = 0; i < g.liveCount; i++) {
    g.mesh.getMatrixAt(i, M); p.setFromMatrixPosition(M); ax.setFromMatrixColumn(M, 0); const s = ax.length();
    const d = p.distanceTo(cp); const h = new T.Vector3(p.x - cp.x, 0, p.z - cp.z).normalize();
    const imBlick = h.dot(vor) > Math.cos(50 * Math.PI / 180);
    const dk = imBlick ? (s * s) / Math.max(1, d * d) : 0;
    const j = je[a] || (je[a] = { inst: 0, imBlick: 0, deckung: 0, naechst: 1e9, sig: 0 });
    j.sig += Math.round(p.x * 10) * 31 + Math.round(p.z * 10);
    j.inst++; if (imBlick) { j.imBlick++; j.naechst = Math.min(j.naechst, +d.toFixed(1)); } j.deckung += dk;
    plaetze.push([a, String(k).split("|")[0], +p.x.toFixed(1), +p.z.toFixed(1), +s.toFixed(2), +d.toFixed(1), imBlick ? 1 : 0]);
  }
}
for (const a in je) je[a].deckung = +je[a].deckung.toFixed(4);
plaetze.sort((x, y) => x[5] - y[5]);
return { kamera: [+cp.x.toFixed(1), +cp.y.toFixed(1), +cp.z.toFixed(1)], je, naechste: plaetze.slice(0, 25) };`;
const q = http.request({ host: "127.0.0.1", port: Number(process.argv[2]), path: "/eval", method: "POST", headers: { "Content-Type": "application/json" } }, (res) => {
    let d = "";
    res.on("data", (c) => (d += c));
    res.on("end", () => console.log(d));
});
q.end(JSON.stringify({ code }));
