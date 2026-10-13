// 1310-5: alle Baum-Gruppen (Studio-Bäume f:/fscatter:/fimp: der Arten des Buchs) sichtbar an/aus — die Bündel nehmen neu auf.
// node baeume.cjs <port> <an|aus|zahl>
"use strict";
const http = require("http");
const [port, wie] = process.argv.slice(2);
const code = `
const PC = globalThis.__phytoCore;
const arten = new Set(["eiche","fichte","birke","tanne","buche","weide","mammut","karst","totholz","kiefer","laerche","ahorn","linde","pappel","esche","erle","kastanie","zeder","zypresse","olive","palme","akazie","baobab","strauch"]);
const istBaum = (k) => { const m = /^(?:f|fscatter|fimp):(?:atlas:)?([a-z_]+)/.exec(String(k)); return !!(m && arten.has(m[1])); };
const an = ${JSON.stringify(wie)} === "an";
let n = 0, inst = 0; const klassen = new Set();
for (const [k, g] of r.state.archInstanceGroups || []) {
  if (!g || !g.mesh || !istBaum(k)) continue;
  klassen.add(String(k).split("|")[0].replace(/@.*$/, "").replace(/#.*$/, ""));
  n++; inst += g.liveCount | 0;
  if (${JSON.stringify(wie)} === "zahl") continue;
  g.mesh.visible = an;
  let p = g.mesh.parent; while (p) { if (p.isBundleGroup) p.needsUpdate = true; p = p.parent; }
}
return { wie: ${JSON.stringify(wie)}, gruppen: n, instanzen: inst, klassen: [...klassen].slice(0, 40) };`;
const q = http.request({ host: "127.0.0.1", port: Number(port), path: "/eval", method: "POST", headers: { "Content-Type": "application/json" } }, (res) => {
    let d = "";
    res.on("data", (c) => (d += c));
    res.on("end", () => console.log(d.slice(0, 1500)));
});
q.end(JSON.stringify({ code }));
