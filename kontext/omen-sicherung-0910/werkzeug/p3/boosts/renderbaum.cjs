// Aufrufbaum (this.<m>() transitiv) ab den Render-Wurzeln, je Methode: gleich / geändert / neu — V18.535 gegen V18.536
const fs = require("fs");
const acorn = require(process.argv[4] + "/node_modules/acorn");
const lies = (f) => {
  const q = fs.readFileSync(f, "utf8");
  const ast = acorn.parse(q, { ecmaVersion: "latest", sourceType: "script" });
  const m = new Map();
  const lauf = (n) => {
    if (!n || typeof n.type !== "string") return;
    if (n.type === "MethodDefinition" && n.key) m.set(n.key.name || String(n.key.value), { src: q.slice(n.start, n.end), node: n });
    for (const k in n) { const v = n[k]; if (Array.isArray(v)) v.forEach(lauf); else if (v && typeof v.type === "string") lauf(v); }
  };
  lauf(ast);
  return m;
};
const A = lies(process.argv[2]), B = lies(process.argv[3]);
const rufe = (src) => [...src.matchAll(/this\.([A-Za-z_$][\w$]*)\s*\(/g)].map((x) => x[1]);
const baum = (M, wurzeln) => { const s = new Set(); const o = [...wurzeln]; while (o.length) { const n = o.pop(); if (s.has(n) || !M.has(n)) continue; s.add(n); o.push(...rufe(M.get(n).src)); } return s; };
const W = ["_loopShadowUpdate", "_loopRender"];
const ba = baum(A, W), bb = baum(B, W);
const alle = new Set([...ba, ...bb]);
const zeilen = [];
for (const n of alle) {
  const a = A.get(n), b = B.get(n);
  const st = !ba.has(n) ? "NEU im Baum" : !bb.has(n) ? "fiel aus dem Baum" : a.src === b.src ? "gleich" : "GEÄNDERT";
  if (st !== "gleich") zeilen.push(`${st.padEnd(18)} ${n} (${a ? a.src.split("\n").length : 0} → ${b ? b.src.split("\n").length : 0} Zeilen)`);
}
console.log(`Baum V18.535 ${ba.size} Methoden, V18.536 ${bb.size}; gleich ${[...alle].filter((n) => ba.has(n) && bb.has(n) && A.get(n).src === B.get(n).src).length}`);
console.log(zeilen.sort().join("\n"));
