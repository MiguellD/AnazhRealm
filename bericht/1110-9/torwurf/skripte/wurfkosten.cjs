// je Tor-Flat in der Welt: Stufe, wurfKosten (eigen · zwilling · von) — die Kosten-Regel des Wirts am echten Flat
"use strict";
const http = require("http");
const port = Number(process.argv[2] || 7907);
const code = `
const G = ["drachentor", "kathedrale", "maschine", "geisttor", "verkalkt", "ruine", "maurentor"];
const out = [];
for (const [key, grp] of r._foundry.cache) {
  if (!grp || !grp._foundryFlat || !G.some((n) => String(key).indexOf(n) >= 0)) continue;
  const f = grp._foundryFlat;
  out.push({ key: String(key).slice(0, 60), lod: f.lod, wurfKosten: f.wurfKosten || null, werfer: f.leaves.filter((l) => l.castShadow).length, zwillinge: f.leaves.filter((l) => l.shadowTwin).length });
}
return out;`;
const q = http.request({ host: "127.0.0.1", port, path: "/eval", method: "POST", headers: { "Content-Type": "application/json" } }, (res) => {
    let d = ""; res.on("data", (c) => (d += c)); res.on("end", () => console.log(d));
});
q.end(JSON.stringify({ code }));
