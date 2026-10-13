// 1310-11: die Lagen aller Instanzen der stehenden Nah-Streu (Geröll · Totholz · Stumpf) — je Instanz ein Blick von oben.
// node alle.cjs <port>
"use strict";
const http = require("http");
const code = `
const ns = r.state.nahStreu, out = [];
for (const [k, a] of ns.senken) {
  if (a.wiegt) continue;
  for (const [kk, b] of a.bloecke) {
    const m = b.matrizen;
    for (let i = 0; i + 15 < m.length; i += 16) {
      const x = m[i + 12], y = m[i + 13], z = m[i + 14];
      out.push({ key: k, kachel: kk, lage: [x, y, z].map((v) => +v.toFixed(2)),
        oben: [x + 0.5, y + 4, z + 0.5, x, y, z].map((v) => +v.toFixed(2)).join(" ") });
    }
  }
}
return { anzahl: out.length, instanzen: out };`;
const q = http.request({ host: "127.0.0.1", port: Number(process.argv[2]), path: "/eval", method: "POST", headers: { "Content-Type": "application/json" } }, (res) => {
    let d = "";
    res.on("data", (c) => (d += c));
    res.on("end", () => console.log(d));
});
q.end(JSON.stringify({ code }));
