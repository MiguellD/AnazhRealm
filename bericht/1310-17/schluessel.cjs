// 1310-17: WARUM GLEICHE STOFFE GETRENNT BAUEN — in der laufenden Werkbank-Welt je Stoff der Szene sein Programm-Schlüssel
// (`customProgramCacheKey`), gruppiert; für zwei Stoffe derselben Art mit verschiedenem Schlüssel die Eigenschaften, die sich
// unterscheiden. node schluessel.cjs <port> [muster]
"use strict";
const http = require("http");
const [port, muster = "portalMembran|portalNebel|foundryCrossfade"] = process.argv.slice(2);
const code = `
const st = r.state, re = new RegExp(${JSON.stringify(muster)});
const stoffe = new Map();
st.scene.traverse((o) => {
  if (!o.isMesh || !o.material) return;
  const mats = Array.isArray(o.material) ? o.material : [o.material];
  for (const m of mats) {
    const u = m.userData || {};
    const tag = Object.keys(u).find((k) => re.test(k)) || null;
    if (!tag) continue;
    if (!stoffe.has(m)) stoffe.set(m, { tag, obj: (o.userData && (o.userData.inventar || o.userData.archInstanceKey)) || o.name });
  }
});
const je = new Map();
for (const [m, info] of stoffe) {
  let key = "?";
  try { key = m.customProgramCacheKey(); } catch (e) { key = "FEHLER " + e.message; }
  const g = info.tag + " | " + key;
  if (!je.has(g)) je.set(g, []);
  je.get(g).push({ m, obj: info.obj });
}
const gruppen = [...je].map(([g, l]) => ({ gruppe: g.slice(0, 140), n: l.length, beispiele: l.slice(0, 3).map((x) => x.obj) }));
// zwei Stoffe gleicher Art (tag), verschiedener Schlüssel: die abweichenden Eigenschaften
const nachTag = new Map();
for (const [g, l] of je) { const tag = g.split(" | ")[0]; if (!nachTag.has(tag)) nachTag.set(tag, []); nachTag.get(tag).push(l[0].m); }
const diffs = {};
for (const [tag, ms] of nachTag) {
  if (ms.length < 2) continue;
  const a = ms[0], b = ms[1], d = [];
  const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
  for (const k of keys) {
    const va = a[k], vb = b[k];
    if (va === vb) continue;
    if (va && vb && typeof va === "object" && typeof vb === "object") {
      if (va.isNode && vb.isNode) { const ka = va.getCacheKey ? va.getCacheKey() : "?", kb = vb.getCacheKey ? vb.getCacheKey() : "?"; if (ka !== kb) d.push(k + ": Knoten-Schlüssel " + String(ka).slice(0, 60) + " ≠ " + String(kb).slice(0, 60)); continue; }
      if (va.isColor && vb.isColor) { if (!va.equals(vb)) d.push(k + ": Farbe"); continue; }
      continue;
    }
    d.push(k + ": " + String(va).slice(0, 40) + " ≠ " + String(vb).slice(0, 40));
  }
  diffs[tag] = d.slice(0, 20);
}
return { stoffe: stoffe.size, gruppen: gruppen.sort((x, y) => y.n - x.n).slice(0, 30), diffs };`;
const q = http.request({ host: "127.0.0.1", port: Number(port), path: "/eval", method: "POST", headers: { "Content-Type": "application/json" } }, (res) => {
    let d = "";
    res.on("data", (c) => (d += c));
    res.on("end", () => console.log(d));
});
q.end(JSON.stringify({ code }));
