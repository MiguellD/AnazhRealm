const { execSync } = require("child_process");
const ref = "origin/punkte-maschine";
const dateien = execSync(`git -C /home/user/AnazhRealm ls-tree --name-only ${ref} meisterkarte-quelle/punkte/messung/`).toString().split("\n").filter((f) => /\.json$/.test(f));
const z = { da: 0, wache: 0, gemessen: 0, sonst: 0, aus: { da: 0, gemessen: 0, offenWache: 0, andere: {} } };
for (const f of dateien) {
  let j; try { j = JSON.parse(execSync(`git -C /home/user/AnazhRealm show ${ref}:${f}`, { maxBuffer: 1 << 30 }).toString()); } catch (e) { continue; }
  const find = (o, k) => { if (!o || typeof o !== "object") return null; if (o[k] && typeof o[k] === "object" && "zahl" in o[k]) return o[k]; for (const v of Object.values(o)) { const r = find(v, k); if (r) return r; } return null; };
  const e = find(j, "profiband.K4#1");
  if (e) { z.da++; if (/hält noch: .* — Heap ungemessen/.test(e.zahl)) z.wache++; else if (!e.ungemessen) z.gemessen++; else z.sonst++; }
  const a = find(j, "karte2.same.preis.ausdauer#1");
  if (a) { z.aus.da++; if (!a.ungemessen) z.aus.gemessen++; else if (/Wirt-Wache/.test(a.zahl)) z.aus.offenWache++; else { const k = String(a.zahl).slice(0, 50); z.aus.andere[k] = (z.aus.andere[k] || 0) + 1; } }
}
console.log(JSON.stringify(z, null, 1));
