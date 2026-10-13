// 1310-4: alle Tür-Flügel-Gruppen (g.tuer) der Tore aus/an — die Obergrenze des Flügel-Schnitts in EINER Sitzung.
// node toggle.cjs <port> <aus|an>
"use strict";
const http = require("http");
const [port, wie] = process.argv.slice(2);
const code = `
const aus = ${JSON.stringify(wie === "aus")};
let n = 0, inst = 0;
const tore = ["drachentor","kathedrale","maschine","geisttor","verkalkt","ruine","maurentor"];
for (const [k, g] of r.state.archInstanceGroups || []) {
  if (!g || !g.tuer || !g.mesh) continue;
  if (!tore.some((t) => String(k).startsWith("f:" + t + "|"))) continue;
  g.mesh.visible = !aus; n++; inst += g.liveCount | 0;
}
return { aus, gruppen: n, instanzen: inst };`;
const q = http.request({ host: "127.0.0.1", port: Number(port), path: "/eval", method: "POST", headers: { "Content-Type": "application/json" } }, (res) => {
    let d = "";
    res.on("data", (c) => (d += c));
    res.on("end", () => console.log(d.slice(0, 300)));
});
q.end(JSON.stringify({ code }));
