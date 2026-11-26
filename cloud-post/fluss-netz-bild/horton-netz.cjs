"use strict";
const DN = {}, DL = {}, STUB = [];
// STRAHLER/HORTON AM NETZ DES KERNS (fluss-netz): die Läufe der Ebenen 0 und 1 (`flussLaeufe`) als Baum der Glieder —
// Knoten-Zusammenflüsse (zwei Glieder enden am Start eines dritten) und Mündungen auf der Bahn (das letzte Glied eines Laufs
// mit ende "muendung" trifft die Bahn eines anderen Glieds bei t). Ordnung nach Strahler, Ströme = Ketten gleicher Ordnung;
// gezählt nur „bekannte" Glieder (der ganze Oberlauf beginnt an echten Quellen in der Reichweite).
//   node horton-netz.cjs <root> [W=3072] [saaten...]
const path = require("path"), fs = require("fs");
const root = path.resolve(process.env.HN_ROOT || process.argv[2] || ".");
const harness = require(path.join(root, "scripts/lib/asset-worker-harness.cjs"));
const W = +(process.env.HN_W || process.argv[3] || 3072);
let saaten = process.argv.slice(4);
const c = harness.kernAusText([fs.readFileSync(path.join(root, "vendor/simplex-noise.js"), "utf8"), fs.readFileSync(path.join(root, "gelaende-core.js"), "utf8")]);
const G = c.__gelaendeCore; const g0 = G.GRUND;
if (!saaten.length) saaten = ["anazh-realm-seed", "same-saat-0", "same-saat-29", "same-saat-33"];
if (saaten[0] === "101") saaten = ["anazh-realm-seed", ...Array.from({ length: 100 }, (_, i) => "same-saat-" + i)];
function lage(saat) {
  return G.lageAus({ seed: saat, baseHeight: g0.basis, waterLevel: g0.basis - g0.meerUnterBasis, ort: null, erbgut: { terme: G.erbgutNormal(undefined), wildnis: 1 }, regionSize: g0.kachel }, c.SimplexNoise);
}
function mass(saat) {
  const L = lage(saat);
  const la = G.flussLaeufe(L, -W, -W, W, W, 40);
  const K = (k, gl) => k + ":" + gl.ax.toFixed(2) + "," + gl.az.toFixed(2);
  const GL = new Map();
  for (const l of la)
    l.glieder.forEach((gl, i) => {
      const key = K(l.k, gl);
      let n = GL.get(key);
      if (!n) {
        n = { key, k: l.k, gl, len: gl.bahn[gl.bahn.length - 1].s, next: null, prev: new Set(), seite: [], quelle: false, laeufe: 0, stk: [] };
        GL.set(key, n);
      }
      n.laeufe++;
      if (i === 0 && l.quelle) n.quelle = true;
      if (i === 0 && !l.quelle) n.rand = true;
      if (i + 1 < l.glieder.length) n.next = K(l.k, l.glieder[i + 1]);
    });
  for (const n of GL.values()) if (n.next && GL.has(n.next)) GL.get(n.next).prev.add(n.key);
  // Mündungen auf der Bahn
  const hash = new Map();
  const hk = (x, z) => Math.floor(x / 8) + "," + Math.floor(z / 8);
  for (const n of GL.values())
    for (let i = 0; i + 1 < n.gl.bahn.length; i++) {
      const p = n.gl.bahn[i], q2 = n.gl.bahn[i + 1];
      const seen = new Set();
      const m = Math.max(1, Math.ceil(Math.hypot(q2.x - p.x, q2.z - p.z) / 4));
      for (let u = 0; u <= m; u++) {
        const h = hk(p.x + ((q2.x - p.x) * u) / m, p.z + ((q2.z - p.z) * u) / m);
        if (seen.has(h)) continue;
        seen.add(h);
        if (!hash.has(h)) hash.set(h, []);
        hash.get(h).push([n, p, q2]);
      }
    }
  let ohneZiel = 0;
  for (const l of la) {
    if (l.ende !== "muendung") continue;
    const e = l.glieder[l.glieder.length - 1];
    const eig = GL.get(K(l.k, e));
    if (eig.mzu) continue; // dasselbe Ende aus einem zweiten Lauf (geteilter Unterlauf)
    const mine = new Set(l.glieder.map((gl) => K(l.k, gl)));
    let best = null, bd = 3;
    for (let di = -1; di <= 1; di++)
      for (let dj = -1; dj <= 1; dj++)
        for (const [n, p, q2] of hash.get(Math.floor(e.bx / 8) + di + "," + (Math.floor(e.bz / 8) + dj)) || []) {
          if (mine.has(n.key)) continue;
          const ux = q2.x - p.x, uz = q2.z - p.z, ll = ux * ux + uz * uz || 1;
          const t = Math.max(0, Math.min(1, ((e.bx - p.x) * ux + (e.bz - p.z) * uz) / ll));
          const d = Math.hypot(p.x + ux * t - e.bx, p.z + uz * t - e.bz);
          if (d < bd) { bd = d; best = [n, p.s + (q2.s - p.s) * t]; }
        }
    eig.mzu = true;
    if (best) best[0].seite.push([best[1], eig.key]);
    else ohneZiel++;
  }
  // WANG: das Einzugsgebiet je Ende der Ebene 0 (Meer oder See), je Endglied einmal
  const endA = { meer: 0, see: 0 };
  const endGes = new Set();
  for (const l of la) {
    if (l.k !== 0 || (l.ende !== "meer" && l.ende !== "see")) continue;
    const e = l.glieder[l.glieder.length - 1];
    const key = K(0, e);
    if (endGes.has(key)) continue;
    endGes.add(key);
    endA[l.ende] += e.A;
  }
  // Strahler: Ordnung am Ende je Glied (rekursiv, Gedächtnis)
  const ende = new Map(), bek = new Map();
  const N = {}, Ls = {};
  const strom = (o, b, k) => { if (b) { N[o] = (N[o] || 0) + 1; DN[o + "/" + k] = (DN[o + "/" + k] || 0) + 1; } };
  const laenge = (o, d, b, k) => { if (b) { Ls[o] = (Ls[o] || 0) + d; DL[o + "/" + k] = (DL[o + "/" + k] || 0) + d; } };
  let zykel = 0;
  const auf = (key) => {
    if (ende.has(key)) return ende.get(key);
    ende.set(key, NaN);
    const n = GL.get(key);
    const ins = [...n.prev].map((p) => [auf(p), bek.get(p)]);
    const seite = n.seite.map(([s, p]) => [s, auf(p), bek.get(p)]).sort((a, b) => a[0] - b[0]);
    let b = ins.length ? ins.every((x) => x[1]) : !!n.quelle;
    b = b && seite.every((x) => x[2]);
    if ([...ins.map((x) => x[0]), ...seite.map((x) => x[1])].some((v) => v !== v)) { zykel++; b = false; }
    let o;
    if (!ins.length) { o = 1; strom(1, b, n.k + (n.quelle ? "q" : "")); }
    else {
      const os = ins.map((x) => x[0]).sort((a, c2) => c2 - a);
      if (os.length >= 2 && os[0] === os[1]) { o = os[0] + 1; strom(o, b, n.k); }
      else o = os[0];
    }
    if (!ins.length && n.k === 0 && b) STUB.push(seite.length ? seite[0][0] : n.len);
    let s0 = 0;
    for (const [s, t] of seite) {
      laenge(o, s - s0, b, n.k); n.stk.push([s0, s, o, b]); s0 = s;
      if (t === o) { o++; strom(o, b, n.k); }
      else if (t > o) o = t;
    }
    laenge(o, n.len - s0, b, n.k); n.stk.push([s0, n.len, o, b]);
    ende.set(key, o); bek.set(key, b);
    return o;
  };
  for (const key of GL.keys()) auf(key);
  // HACK am Graph: L = der längste Lauf stromauf bis zu einer echten Quelle (Bahn-Bogen; ein Zufluss zählt ab seiner Mündung),
  // A = das Einzugsgebiet des Glieds (`A`, m²) — je bekanntem Glied ein Punkt (log A km², log L km) am Start des Glieds
  const lEnde = new Map();
  const lStart = (key) => {
    const n = GL.get(key);
    let v = n.prev.size ? -Infinity : 0;
    for (const p of n.prev) v = Math.max(v, lE(p));
    return v;
  };
  const lE = (key) => {
    if (lEnde.has(key)) return lEnde.get(key);
    lEnde.set(key, NaN);
    const n = GL.get(key);
    let v = lStart(key) + n.len;
    for (const [s2, p] of n.seite) v = Math.max(v, lE(p) + (n.len - s2));
    lEnde.set(key, v);
    return v;
  };
  const hack = [];
  for (const [key, n] of GL) {
    if (!bek.get(key) || !(n.gl.A > 0)) continue;
    const l0 = lStart(key);
    if (l0 > 0 && Number.isFinite(l0)) hack.push([Math.log(n.gl.A / 1e6), Math.log(l0 / 1000)]);
  }
  // Knoten-Grad: Glieder mit ≥ 3 Zuflüssen am Start
  let stern = 0;
  for (const n of GL.values()) if (n.prev.size >= 3) stern++;
  return { saat, endA, hack, glieder: GL.size, laeufe: la.length, ohneZiel, zykel, stern, N, Ls, GL, L };
}
function reg(pts) {
  if (pts.length < 3) return NaN;
  const mx = pts.reduce((a, p) => a + p[0], 0) / pts.length, my = pts.reduce((a, p) => a + p[1], 0) / pts.length;
  let sxy = 0, sxx = 0, syy = 0;
  for (const [x, y] of pts) { sxy += (x - mx) * (y - my); sxx += (x - mx) ** 2; syy += (y - my) ** 2; }
  reg.r2 = (sxy * sxy) / (sxx * syy);
  return sxy / sxx;
}
function fit(N, Ls, ohneTop) {
  let os = Object.keys(N).map(Number).sort((a, b) => a - b);
  if (ohneTop) os = os.slice(0, -1);
  const f = (ys) => {
    const xs = os.filter((o) => ys(o) > 0);
    if (xs.length < 2) return NaN;
    const mx = xs.reduce((a, b) => a + b, 0) / xs.length, my = xs.reduce((a, o) => a + Math.log(ys(o)), 0) / xs.length;
    let sxy = 0, sxx = 0;
    for (const o of xs) { sxy += (o - mx) * (Math.log(ys(o)) - my); sxx += (o - mx) ** 2; }
    return Math.exp(sxy / sxx);
  };
  return { RB: +(1 / f((o) => N[o])).toFixed(3), RL: +f((o) => Ls[o] / N[o]).toFixed(3) };
}
if (require.main === module) {
const NN = {}, LL = {}, je = [], HK = [];
  const EA = { meer: 0, see: 0 };
for (const s of saaten) {
  const m = mass(s);
  for (const o in m.N) { NN[o] = (NN[o] || 0) + m.N[o]; LL[o] = (LL[o] || 0) + (m.Ls[o] || 0); }
  EA.meer += m.endA.meer; EA.see += m.endA.see;
  HK.push(...m.hack); je.hack = je.hack || []; je.hack.push(reg(m.hack));
  const v = fit(m.N, m.Ls);
  const v2 = fit(m.N, m.Ls, true);
  je.push({ saat: s, ...v, RB2: v2.RB, RL2: v2.RL, L21: (m.Ls[2] / m.N[2]) / (m.Ls[1] / m.N[1]) });
  if (saaten.length <= 8) console.log(s.padEnd(18), "glieder", m.glieder, "ohneZiel", m.ohneZiel, "zykel", m.zykel, "stern", m.stern, "N", JSON.stringify(m.N), "Lm", JSON.stringify(Object.fromEntries(Object.keys(m.N).map((o) => [o, Math.round((m.Ls[o] || 0) / m.N[o])]))), "RB", v.RB, "RL", v.RL);
}
const gs = fit(NN, LL), go = fit(NN, LL, true);
console.log("GESAMT N", JSON.stringify(NN), "Lm", JSON.stringify(Object.fromEntries(Object.keys(NN).map((o) => [o, Math.round(LL[o] / NN[o])]))));
console.log("RB", gs.RB, "RL", gs.RL, " ohne höchste Ordnung: RB", go.RB, "RL", go.RL);
const q = (a, p) => { const s = a.filter((x) => x === x).sort((x, y) => x - y); return s[Math.floor(p * (s.length - 1))]; };
console.log("je Saat RB p10/p50/p90", q(je.map((x) => x.RB), 0.1), q(je.map((x) => x.RB), 0.5), q(je.map((x) => x.RB), 0.9), " RL", q(je.map((x) => x.RL), 0.1), q(je.map((x) => x.RL), 0.5), q(je.map((x) => x.RL), 0.9));
console.log("je Saat ohne höchste: RB p10/p50/p90", q(je.map((x) => x.RB2), 0.1), q(je.map((x) => x.RB2), 0.5), q(je.map((x) => x.RB2), 0.9), " RL", q(je.map((x) => x.RL2), 0.1), q(je.map((x) => x.RL2), 0.5), q(je.map((x) => x.RL2), 0.9), " L2/L1 p50", q(je.map((x) => x.L21), 0.5).toFixed(3));
  const hg = reg(HK);
  console.log("HACK am Graph: h", hg.toFixed(3), "r²", reg.r2.toFixed(2), "n", HK.length, " je Saat p10/p50/p90", q(je.hack, 0.1).toFixed(3), q(je.hack, 0.5).toFixed(3), q(je.hack, 0.9).toFixed(3));
  console.log("WANG Anteil ins Meer (Fläche der Enden)", (EA.meer / (EA.meer + EA.see)).toFixed(3), "meer km²", Math.round(EA.meer / 1e6), "see km²", Math.round(EA.see / 1e6));
  console.log("DN", JSON.stringify(DN));
console.log("DL(km)", JSON.stringify(Object.fromEntries(Object.entries(DL).map(([k, v]) => [k, Math.round(v / 1000)]))));
STUB.sort((a, b) => a - b);
console.log("E0-Quellen bis zum ersten Zufluss: n", STUB.length, "p10/50/90", Math.round(STUB[Math.floor(STUB.length * 0.1)]), Math.round(STUB[Math.floor(STUB.length * 0.5)]), Math.round(STUB[Math.floor(STUB.length * 0.9)]));
}
module.exports = { mass, lage, G, fit };
