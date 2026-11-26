// node: baut den Code einer TAT mit Uhren (Takt sync/rAF, Spawn, Schlag, Ganzes) — node lauf.js <gesehen 0|1> <i> [x z]
const fs = require("fs");
const tat = fs.readFileSync(__dirname + "/tat.js", "utf8");
const [ges, i, x, z] = process.argv.slice(2);
const code = `
const TAT = ${tat};
const st = r.state, pm = st.playerMesh.position;
const uhr = { takte: 0, sync: 0, raf: 0, max: 0, spawn: null, schlag: null };
const wt = window.__werkTakt;
window.__werkTakt = async () => { const a = performance.now(); const p = wt(); const b = performance.now(); await p; const c = performance.now(); uhr.takte++; uhr.sync += b - a; uhr.raf += c - b; uhr.max = Math.max(uhr.max, c - a); };
const eig = (k) => Object.prototype.hasOwnProperty.call(r, k);
const [eS, eD] = [eig("spawnCreatureAt"), eig("damageCreature")];
const [sp, dm] = [r.spawnCreatureAt, r.damageCreature];
r.spawnCreatureAt = function (...a) { const t = performance.now(); try { return sp.apply(this, a); } finally { uhr.spawn = +(performance.now() - t).toFixed(1); } };
r.damageCreature = function (...a) { const t = performance.now(); try { return dm.apply(this, a); } finally { uhr.schlag = +(performance.now() - t).toFixed(1); } };
const start = ${x !== undefined ? `[${x}, ${z}]` : "[+pm.x.toFixed(2), +pm.z.toFixed(2)]"};
const t0 = performance.now();
let p;
try { p = await TAT(r, T, { gesehen: ${ges === "1"}, fensterS: 4, start, i: ${Number(i) || 0} }); }
catch (e) { p = { wurf: String(e && e.stack || e).slice(0, 400) }; }
finally {
  window.__werkTakt = wt;
  if (eS) r.spawnCreatureAt = sp; else delete r.spawnCreatureAt;
  if (eD) r.damageCreature = dm; else delete r.damageCreature;
}
const ganz = performance.now() - t0;
return { p, uhr: { ganzMs: +ganz.toFixed(0), takte: uhr.takte, syncMs: +uhr.sync.toFixed(0), rafMs: +uhr.raf.toFixed(0), maxTaktMs: +uhr.max.toFixed(0), spawnMs: uhr.spawn, schlagMs: uhr.schlag, rest: +(ganz - uhr.sync - uhr.raf - (uhr.spawn || 0) - (uhr.schlag || 0)).toFixed(0) } };
`;
process.stdout.write(code);
