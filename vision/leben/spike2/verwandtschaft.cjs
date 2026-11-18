// SPIKE 2 „Sichtbare Verwandtschaft" — welches Gesetz lässt Verwandte sich im BILD ähneln? Nur LESEN des Repos.
// Lauf: node verwandtschaft.cjs [repoPfad]   (≤ 60 s)
// Baum = DAS Gesetz der ersten Runde, wörtlich: der Text von spike/stammbaum.cjs (welt, GESETZ) wird gelesen und mit EINER
// benannten Ersetzung (E0: welt gibt seine Innereien hk/u/nz/alterH/spaltH zurück) ausgewertet — Topologie, Alter und ln M
// bleiben byte-gleich (geprüft in Abschnitt 0). Die sichtbaren Merkmale sind neue Funktionen DERSELBEN Adresse (Knoten-Hash,
// Zweck-Nummern ≥ 200, die das Gesetz nicht benutzt).
"use strict";
const fs = require("fs"), path = require("path");
const REPO = process.argv[2] || "C:/Users/micha/AnazhRealm-profiband";
const SPIKE = path.join(__dirname, "..", "spike", "stammbaum.cjs");
const P = require(path.join(REPO, "planet-core.js"));
require(path.join(REPO, "tetrapoda-core.js"));
const T = globalThis.__tetrapodaCore;
const now = () => Number(process.hrtime.bigint()) / 1e6;
const T0 = now();
const f = (x, d = 2) => (Number.isFinite(x) ? x.toFixed(d) : String(x));
const say = (s) => console.log(s);

// ───── Kern-KOPIE mit benannten Ersetzungen (nie ein Zweit-Modell) ─────
let src = fs.readFileSync(SPIKE, "utf8");
const a0 = src.indexOf("// ───────────────────────────── DAS GESETZ"), a1 = src.indexOf("// ───────────────────────────── Mess-Hilfen");
if (a0 < 0 || a1 < 0) throw new Error("Anker im Spike-Text nicht gefunden");
let body = src.slice(a0, a1);
const ERSETZ = [
  ["E0 Innereien zeigen", "return { N, r, lam, Tm, g, wandHoch, aWurzel, spalt, alter, blatt, mrca, artenAm };",
    "return { N, r, lam, Tm, g, wandHoch, aWurzel, spalt, alter, blatt, mrca, artenAm, hk, u, nz, spaltH, alterH };"],
];
for (const [name, alt, neu] of ERSETZ) { const n = body.split(alt).length - 1; if (n !== 1) throw new Error(name + ": " + n + " Treffer"); body = body.replace(alt, neu); }
const { welt, GESETZ } = new Function("P", "T", body + "\nreturn { welt, GESETZ };")(P, T);
function mix32(h) { h ^= h >>> 16; h = Math.imul(h, 0x7feb352d); h ^= h >>> 15; h = Math.imul(h, 0x846ca68b); h ^= h >>> 16; return h >>> 0; }

// ───── Mess-Hilfen (wörtlich aus spike/richter/rf.cjs: upgma, splits, Zufall der Stichprobe) ─────
const mean = (a) => a.reduce((x, y) => x + y, 0) / a.length;
const sd = (a) => { const m = mean(a); return Math.sqrt(a.reduce((x, y) => x + (y - m) ** 2, 0) / (a.length - 1)); };
let lcg = 12345; const rnd = () => ((lcg = (Math.imul(lcg, 1664525) + 1013904223) >>> 0) / 4294967296);
function upgma(D, n) {
  let cl = Array.from({ length: n }, (_, i) => ({ m: [i], s: 1 })); const kl = [];
  const d = (a, b) => { let s = 0; for (const i of a.m) for (const j of b.m) s += D[i][j]; return s / (a.m.length * b.m.length); };
  while (cl.length > 1) { let best = Infinity, bi = 0, bj = 1; for (let i = 0; i < cl.length; i++) for (let j = i + 1; j < cl.length; j++) { const v = d(cl[i], cl[j]); if (v < best) { best = v; bi = i; bj = j; } }
    const m = { m: cl[bi].m.concat(cl[bj].m) }; if (m.m.length > 1 && m.m.length < n) kl.push(m.m.slice().sort((a, b) => a - b).join(",")); cl = cl.filter((_, k) => k !== bi && k !== bj); cl.push(m); }
  return new Set(kl);
}
function splits(set, n) { const o = new Set(); for (const s of set) { const a = s.split(",").map(Number); if (a.length < 2 || a.length > n - 2) continue; const inA = new Set(a); const b = []; for (let i = 0; i < n; i++) if (!inA.has(i)) b.push(i); const key = (a.includes(0) ? a : b).join(","); o.add(key); } return o; }
// Neighbor-Joining (Saitou & Nei 1987) als zweiter Gestalt-Baum-Bauer: gibt die Kladen (Blatt-Mengen) unbewurzelt → splits()
function nj(D0, n) {
  let nodes = Array.from({ length: n }, (_, i) => [i]); let D = D0.map((r) => r.slice()); const kl = [];
  while (nodes.length > 3) {
    const m = nodes.length, R = D.map((r) => r.reduce((a, b) => a + b, 0)); let best = Infinity, bi = 0, bj = 1;
    for (let i = 0; i < m; i++) for (let j = i + 1; j < m; j++) { const q = (m - 2) * D[i][j] - R[i] - R[j]; if (q < best) { best = q; bi = i; bj = j; } }
    const neu = nodes[bi].concat(nodes[bj]); kl.push(neu.slice().sort((a, b) => a - b).join(","));
    const dn = []; for (let k = 0; k < m; k++) if (k !== bi && k !== bj) dn.push((D[bi][k] + D[bj][k] - D[bi][bj]) / 2);
    const keep = []; for (let k = 0; k < m; k++) if (k !== bi && k !== bj) keep.push(k);
    const D2 = keep.map((a) => keep.map((b) => D[a][b])); D2.forEach((r, q) => r.push(dn[q])); D2.push(dn.concat([0]));
    nodes = keep.map((k) => nodes[k]).concat([neu]); D = D2;
  }
  return new Set(kl);
}
const rfVon = (A, B) => { let diff = 0; for (const s of A) if (!B.has(s)) diff++; for (const s of B) if (!A.has(s)) diff++; return diff / (A.size + B.size || 1); };
const quant = (a, q) => { const s = Array.from(a).sort((x, y) => x - y); return s[Math.min(s.length - 1, Math.floor(q * s.length))]; };
function pearson(x, y) { const n = x.length; let mx = 0, my = 0; for (let i = 0; i < n; i++) { mx += x[i]; my += y[i]; } mx /= n; my /= n; let sxy = 0, sxx = 0, syy = 0; for (let i = 0; i < n; i++) { const a = x[i] - mx, b = y[i] - my; sxy += a * b; sxx += a * a; syy += b * b; } return sxy / Math.sqrt(sxx * syy); }

// ───── PFAD: Wurzel → Blatt als Folge von Ästen {hP, seite, hc, t1, t2} (dieselbe Adresse wie welt.blatt) ─────
function pfad(W, i) {
  const out = []; let lo = 0, n = W.N, ma = W.Tm;
  while (n > 1) {
    const h = W.hk(lo, n), k = W.spaltH(h, n), links = i < lo + k;
    const clo = links ? lo : lo + k, cn = links ? k : n - k, hc = W.hk(clo, cn);
    const cma = cn === 1 ? 0 : W.alterH(hc, clo, cn, ma);
    out.push({ hP: h, seite: links ? 0 : 1, hc, t1: cma, t2: ma });
    lo = clo; n = cn; ma = cma;
  }
  return out;
}
// Versteckte Artbildungen auf einem rekonstruierten Ast (Seitenlinie starb aus): Rate λ·p0(τ), p0 = μ(1−e^{−rτ})/(λ−μe^{−rτ})
// (Geburt-Tod, Kendall 1948; Nee et al. 1994). Integral geschlossen: Λ = μ(τ2−τ1) + ln((λ−μe^{−rτ1})/(λ−μe^{−rτ2})).
function versteckt(W, t1, t2) { const lam = W.lam, r = W.r, mu = lam - r; return Math.max(0, mu * (t2 - t1) + Math.log((lam - mu * Math.exp(-r * t1)) / (lam - mu * Math.exp(-r * t2)))); }
function poisson(m, u) { let k = 0, p = Math.exp(-m), c = p; while (u > c && k < 60) { k++; p *= m / k; c += p; } return k; }

// ───── DIE KANDIDATEN-GESETZE (je eine Funktion des Pfads; Zweck-Nummern ≥ 200) ─────
// Ereignisse eines Asts: die beobachtete Spaltung trifft EINE Tochter (peripatrisch: die neue Art wandelt sich, die alte
// bleibt; welche, zieht der Elter-Knoten), dazu die versteckten Spaltungen, von denen die Hälfte die überlebende Linie wandelt.
function ereignisse(W, a, nurBeob) { const obs = (W.u(a.hP, 210) < 0.5 ? 0 : 1) === a.seite ? 1 : 0; if (nurBeob) return obs; return obs + poisson(versteckt(W, a.t1, a.t2) / 2, W.u(a.hc, 211)); }
const HWZ = (j, A) => Math.pow(10, 3 * j / Math.max(1, A - 1)); // Halbwertszeiten 1 … 1 000 Ma log-gleich verteilt (gewählt)
function merkmale(W, P, cfg) {
  const A = cfg.achsen || 0, out = new Float64Array(A), Wn = cfg.woerter || 0, wort = new Array(Wn).fill(0);
  let lnRate = 0;
  for (const a of P) {
    const dt = a.t2 - a.t1, hc = a.hc;
    const ne = (cfg.art === "punkt" || cfg.wUhr === "spaltung") ? ereignisse(W, a, cfg.nurBeob) : 0;
    if (cfg.art === "brown") for (let j = 0; j < A; j++) out[j] += Math.sqrt(dt) * W.nz(hc, 300 + 2 * j);
    else if (cfg.art === "klade") { lnRate += 0.15 * Math.sqrt(dt) * W.nz(hc, 290); const s = Math.sqrt(dt * Math.exp(lnRate)); for (let j = 0; j < A; j++) out[j] += s * W.nz(hc, 300 + 2 * j); } // Rate je Klade erblich (σ_ln 0,15/√Ma, gewählt)
    else if (cfg.art === "frei") for (let j = 0; j < A; j++) out[j] += Math.sqrt(dt * HWZ(j, A)) * W.nz(hc, 300 + 2 * j); // Raten je Achse ×10³ gespreizt, ohne Grenze
    else if (cfg.art === "ou") for (let j = 0; j < A; j++) { const al = Math.LN2 / HWZ(j, A), e = Math.exp(-al * dt); out[j] = out[j] * e + Math.sqrt(1 - e * e) * W.nz(hc, 300 + 2 * j); } // OU, stationäre SD 1
    else if (cfg.art === "eb") { const a2 = Math.LN2 / 50, s1 = W.Tm - a.t2, s2 = W.Tm - a.t1, v = (Math.exp(-a2 * s1) - Math.exp(-a2 * s2)) / a2; for (let j = 0; j < A; j++) out[j] += Math.sqrt(v) * W.nz(hc, 300 + 2 * j); } // früher Ausbruch, Rate halbiert je 50 Ma (gewählt)
    else if (cfg.art === "punkt") for (let e = 0; e < Math.min(ne, 40); e++) for (let j = 0; j < A; j++) out[j] += W.nz(hc, 600 + 40 * e + 2 * j);
    // Wörter: K Zustände (K = 0 heißt ∞, jedes Ereignis ein neuer Zustand); Uhr „spaltung" (je Ereignis Wechsel mit p) oder „zeit" (Mk, μ je Ma)
    for (let w = 0; w < Wn; w++) {
      const muW = cfg.muSpanne ? cfg.muSpanne[0] * Math.pow(cfg.muSpanne[1] / cfg.muSpanne[0], w / Math.max(1, Wn - 1)) : cfg.mu; // je Wort eine Zeitskala
      const n = cfg.wUhr === "spaltung" ? ne : poisson(muW * dt, W.u(hc, 1500 + w));
      for (let e = 0; e < Math.min(n, 60); e++) {
        if (cfg.wUhr === "spaltung" && W.u(hc, 1000 + 64 * w + e) >= cfg.p) continue;
        if (!cfg.K) wort[w] = mix32((hc ^ Math.imul(w + 1, 0x9e3779b1) ^ Math.imul(e + 7, 0x85ebca6b)) >>> 0) + 1;
        else wort[w] = (wort[w] + 1 + Math.floor(W.u(hc, 2000 + 64 * w + e) * (cfg.K - 1))) % cfg.K;
      }
    }
  }
  return { c: out, w: wort };
}
// Sichtbare Distanz: kontinuierliche Achsen standardisiert über die Menge, je Wort 0 oder 2 (= E[(z₁−z₂)²] eines
// standardisierten Paars — jedes Zeichen zählt gleich; VOR jeder Messung gesetzt, nicht nachgestellt)
function distanzen(F, mitLnM) {
  const n = F.length, A = F[0].c.length + (mitLnM ? 1 : 0), Wn = F[0].w.length;
  const X = F.map((x) => (mitLnM ? [x.lnM, ...x.c] : Array.from(x.c)));
  const sg = []; for (let j = 0; j < A; j++) { sg.push(sd(X.map((x) => x[j])) || 1); }
  return X.map((a, p) => X.map((b, q) => { let s = 0; for (let j = 0; j < A; j++) s += ((a[j] - b[j]) / sg[j]) ** 2; for (let w = 0; w < Wn; w++) if (F[p].w[w] !== F[q].w[w]) s += 2; return Math.sqrt(s); }));
}

// ═════ 0. Der Baum ist DERSELBE: E0 ändert keine Zahl ═════
const W6 = welt("erde", 1e6, { achsen: 12 });
{ const o = {}; let gleich = 0; const Wa = welt("erde", 1e6, { achsen: 12 });
  for (let q = 0; q < 200; q++) { const i = (q * 4999) % 1e6; W6.blatt(i, true, false, o); const x = Array.from(o.x); Wa.blatt(i, true, false, o); if (x.every((v, j) => v === o.x[j])) gleich++; }
  say("SPIKE 2 verwandtschaft — Repo " + REPO + " · node " + process.version + " · Baum aus " + path.basename(SPIKE) + " mit Ersetzung " + ERSETZ.map((e) => e[0]).join(", "));
  say("0. E0 byte-gleich: 200/200 Blätter gleiche Merkmale: " + gleich + "/200 · r = " + f(W6.r, 4) + "/Ma · λ = " + f(W6.lam, 4) + " · μ = " + f(W6.lam - W6.r, 4)); }

// ═════ A. ANKER: die Richter-Probe rf.cjs wörtlich (Kladen 10–60, 10 Blätter gleichmäßig, Brown der ersten Runde) ═════
{ lcg = 12345; const W20 = welt("erde", 1e6, { achsen: 20 }); const z = [];
  for (const D of [5, 8, 12]) { const rfs = [];
    for (let rep = 0; rep < 300; rep++) {
      let lo = 0, n = 1e6; const i0 = Math.floor(rnd() * 1e6); const ziel = 10 + Math.floor(rnd() * 50);
      while (n > ziel) { const k = W20.spalt(lo, n); if (i0 < lo + k) n = k; else { lo += k; n -= k; } }
      if (n < 10) { rep--; continue; }
      const leaves = Array.from({ length: 10 }, (_, q) => lo + Math.floor(q * n / 10));
      const X = leaves.map((i) => { const o = {}; W20.blatt(i, true, false, o); return Array.from(o.x).slice(0, D); });
      const mu = [], sg = []; for (let j = 0; j < D; j++) { const c = X.map((x) => x[j]); mu.push(mean(c)); sg.push(sd(c) || 1); }
      const Dm = X.map((a) => X.map((b) => Math.sqrt(a.reduce((s, v, j) => s + ((v - b[j]) / sg[j]) ** 2, 0))));
      const Pm = leaves.map((a) => leaves.map((b) => (a === b ? 0 : 2 * W20.mrca(a, b).ma)));
      rfs.push(rfVon(splits(upgma(Pm, 10), 10), splits(upgma(Dm, 10), 10)));
    }
    rfs.sort((a, b) => a - b); z.push(D + " Achsen p50 " + f(rfs[150]) + " (≤ 0,3: " + f(100 * rfs.filter((r) => r <= 0.3).length / 300, 0) + " %)"); }
  say("A. Anker rf.cjs (Welle-2-3-Tafel: 5 → 0,71 · 8 → 0,57 · 12 → 0,43): " + z.join(" · ")); }

// ═════ Stichproben: 10 Arten aus einer Klade der Größe ~Z ═════
function stichprobe(W, Z) {
  for (;;) {
    let lo = 0, n = W.N; const i0 = Math.floor(rnd() * W.N);
    while (n > Z) { const k = W.spalt(lo, n); if (i0 < lo + k) n = k; else { lo += k; n -= k; } }
    if (Z === 10 ? n !== 10 : n < Z / 2) continue;
    return Array.from({ length: 10 }, (_, q) => lo + Math.floor((q + (Z === 10 ? 0 : rnd() * 0.999)) * n / 10));
  }
}
// Äste des induzierten 10-Arten-Baums (ultrametrisch): Kladen aus UPGMA der patristischen Distanz, Alter = halbe Distanz
function astLaengen(Pm) {
  const n = Pm.length; let cl = Array.from({ length: n }, (_, i) => ({ m: [i], h: 0 })); const inn = [], term = [];
  while (cl.length > 1) { let best = Infinity, bi = 0, bj = 1; for (let i = 0; i < cl.length; i++) for (let j = i + 1; j < cl.length; j++) { let s = 0; for (const a of cl[i].m) for (const b of cl[j].m) s += Pm[a][b]; const v = s / (cl[i].m.length * cl[j].m.length); if (v < best) { best = v; bi = i; bj = j; } }
    const h = best / 2; for (const c of [cl[bi], cl[bj]]) (c.m.length === 1 ? term : inn).push(h - c.h);
    const m = { m: cl[bi].m.concat(cl[bj].m), h }; cl = cl.filter((_, k) => k !== bi && k !== bj); cl.push(m); }
  return { inn, term };
}

// ═════ B. URSACHE: die Ast-Gestalt des Baums — und ein Geburt-Tod-Bezugsbaum mit DENSELBEN λ, μ und Kronen-Alter ═════
// Bezug: der rekonstruierte Geburt-Tod-Baum als Coalescent-Point-Process (Popovic 2004; Lambert & Stadler 2013):
// n−1 Knoten-Tiefen iid mit P(H > t) = 1/(1 + λ/r·(e^{rt} − 1)) — dieselbe Funktion, aus der das Gesetz N und alter() ableitet.
function cppBaum(W, Tkrone, seed) {
  const n = 10, Fk = 1 + W.lam / W.r * (Math.exp(W.r * Tkrone) - 1), H = new Float64Array(n); let s = seed;
  const ur = () => ((s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296);
  const wo = 1 + Math.floor(ur() * (n - 1));
  for (let i = 1; i < n; i++) { if (i === wo) { H[i] = Tkrone; continue; } const g = 1 - ur() * (1 - 1 / Fk); H[i] = Math.log(1 + (1 / g - 1) * W.r / W.lam) / W.r; }
  const Pm = Array.from({ length: n }, (_, a) => Array.from({ length: n }, (_, b) => { if (a === b) return 0; let m = 0; for (let k = Math.min(a, b) + 1; k <= Math.max(a, b); k++) m = Math.max(m, H[k]); return 2 * m; }));
  // Pfade je Blatt (für dieselben Merkmals-Gesetze): Knoten = Intervall [a,b), Spalt an argmax H
  const pf = Array.from({ length: n }, () => []);
  (function geh(a, b, alter, hP) { if (b - a === 1) return; let m = a + 1; for (let k = a + 1; k < b; k++) if (H[k] > H[m]) m = k;
    for (const [x, y, seite] of [[a, m, 0], [m, b, 1]]) { const t1 = y - x === 1 ? 0 : (() => { let mm = x + 1; for (let k = x + 1; k < y; k++) if (H[k] > H[mm]) mm = k; return H[mm]; })();
      const hc = mix32((seed ^ Math.imul(x + 1, 0x9e3779b1) ^ Math.imul(y + 3, 0x85ebca6b)) >>> 0);
      for (let i = x; i < y; i++) pf[i].push({ hP, seite, hc, t1, t2: alter }); geh(x, y, t1, hc); } })(0, n, Tkrone, mix32(seed >>> 0));
  return { Pm, pf };
}
function brownMVN(Pm, D, ur) { // Brown auf ultrametrischem Baum: Kovarianz = gemeinsamer Weg = T − Tiefe(MRCA)
  const n = Pm.length, Tk = Math.max(...Pm.flat()) / 2, C = Pm.map((r) => r.map((d) => Tk - d / 2));
  const L = C.map(() => new Float64Array(n)); for (let i = 0; i < n; i++) for (let j = 0; j <= i; j++) { let s = C[i][j]; for (let k = 0; k < j; k++) s -= L[i][k] * L[j][k]; L[i][j] = i === j ? Math.sqrt(Math.max(s, 1e-12)) : s / L[j][j]; }
  const nz = () => Math.sqrt(-2 * Math.log(1 - ur())) * Math.cos(6.283185307179586 * ur());
  const X = Array.from({ length: n }, () => new Float64Array(D)); for (let d = 0; d < D; d++) { const z = Array.from({ length: n }, nz); for (let i = 0; i < n; i++) { let s = 0; for (let k = 0; k <= i; k++) s += L[i][k] * z[k]; X[i][d] = s; } }
  return X.map((c) => ({ c, w: [] }));
}
const STUFEN = [[10, "Klade 10"], [1e3, "Klade 10³"], [1e6, "Klade 10⁶"]];
const PROBEN = {}; // Z → [{leaves, Pm, P (Pfade), lnM}]
for (const [Z] of STUFEN) { lcg = 777 + Z % 97; const L = [];
  for (let rep = 0; rep < 300; rep++) { const lv = stichprobe(W6, Z); const Pm = lv.map((a) => lv.map((b) => (a === b ? 0 : 2 * W6.mrca(a, b).ma)));
    const o = {}; const lnM = lv.map((i) => { W6.blatt(i, true, false, o); return o.x[0]; });
    L.push({ lv, Pm, P: lv.map((i) => pfad(W6, i)), lnM }); }
  PROBEN[Z] = L; }
{ say("\nB. URSACHE — Ast-Gestalt des induzierten 10-Arten-Baums (Mittel innen ÷ Mittel Blatt-Ast) und Brown-RF (UPGMA, 300 Proben):");
  for (const [Z, nm] of STUFEN) { const q = PROBEN[Z].map((p) => { const a = astLaengen(p.Pm); return mean(a.inn) / mean(a.term); });
    const sh = PROBEN[Z].map((p) => { const a = astLaengen(p.Pm); return Math.min(...a.inn) / mean(a.term); });
    say("  " + nm.padEnd(10) + " Gesetz: innen/Blatt p50 " + f(quant(q, 0.5), 3) + " · kürzester Innen-Ast/Blatt p50 " + f(quant(sh, 0.5), 3) + " · Kronen-Alter p50 " + f(quant(PROBEN[Z].map((p) => Math.max(...p.Pm.flat()) / 2), 0.5), 1) + " Ma"); }
  let s = 99; const ur = () => ((s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296);
  const zeile = (nm, baeume) => { const q = baeume.map((b) => { const a = astLaengen(b.Pm); return mean(a.inn) / mean(a.term); });
    const r = {}; for (const D of [8, 12, 20]) { const v = baeume.map((b) => rfVon(splits(upgma(b.Pm, 10), 10), splits(upgma(distanzen(brownMVN(b.Pm, D, ur), false), 10), 10))); r[D] = f(quant(v, 0.5)) + " (" + f(100 * v.filter((x) => x <= 0.3).length / v.length, 0) + " %)"; }
    say("  " + nm.padEnd(44) + " innen/Blatt p50 " + f(quant(q, 0.5), 3) + " · Brown RF p50 (≤ 0,3) 8: " + r[8] + " · 12: " + r[12] + " · 20: " + r[20]); };
  zeile("Gesetz Klade 10 (Brown per Kovarianz)", PROBEN[10]);
  zeile("Geburt-Tod-Bezug (CPP, gleiches λ μ Kronen-Alter)", PROBEN[10].map((p, k) => cppBaum(W6, Math.max(...p.Pm.flat()) / 2, 4242 + k)));
  zeile("Gesetz Klade 10³", PROBEN[1e3]); zeile("Gesetz Klade 10⁶", PROBEN[1e6]); }

// ═════ C. DIE KANDIDATEN am selben Baum ═════
// Achsen-Budget: ln M (das Gesetz der ersten Runde) + 11 Achsen des Kandidaten = 12 sichtbare Achsen; Wörter ≤ 6.
function rfReihe(Z, cfg, bauer, gegen) {
  const v = PROBEN[Z].map((p) => { let F = p.P.map((pa, q) => Object.assign(merkmale(W6, pa, cfg), { lnM: p.lnM[q] }));
    if (gegen === "misch") { const perm = F.map((_, i) => i); for (let i = 9; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [perm[i], perm[j]] = [perm[j], perm[i]]; } F = perm.map((i) => F[i]); }
    const Dm = distanzen(F, cfg.lnM !== false); return rfVon(splits(upgma(p.Pm, 10), 10), splits((bauer || upgma)(Dm, 10), 10)); });
  return { p50: quant(v, 0.5), anteil: v.filter((x) => x <= 0.3).length / v.length, mittel: mean(v) };
}
const zeig = (r) => f(r.p50) + " (" + f(100 * r.anteil, 0) + " %)";
const KAND = [
  ["B  Brown 11", { art: "brown", achsen: 11 }],
  ["c  Raten je Achse ×10³, ohne Grenze", { art: "frei", achsen: 11 }],
  ["c  Raten je Klade erblich", { art: "klade", achsen: 11 }],
  ["c  OU, Halbwertszeit je Achse 1–1000 Ma", { art: "ou", achsen: 11 }],
  ["b  früher Ausbruch (Rate ½ je 50 Ma)", { art: "eb", achsen: 11 }],
  ["b  Punktualismus (Schritt je Artbildung)", { art: "punkt", achsen: 11 }],
  ["b  Punktualismus nur beobachtete Knoten (κ=0)", { art: "punkt", achsen: 11, nurBeob: true }],
];
lcg = 4711;
say("\nC. KANDIDATEN am selben Baum — RF p50 (Anteil ≤ 0,3), UPGMA, 300 Proben je Stufe; 12 Achsen = ln M + 11 (B = d: viele billige Achsen):");
for (const [nm, cfg] of KAND) say("  " + nm.padEnd(46) + STUFEN.map(([Z, s]) => s + " " + zeig(rfReihe(Z, cfg))).join(" · "));
say("  (a) Wörter allein (6 Wörter, Hamming), Uhr × Zustände × Rate an Klade 10 / 10³ / 10⁶:");
const WORT = [];
// volles Raster (16 Zeilen) nur mit VOLL=1 (sprengt sonst die 60 s); Standard: die Ränder und das Beste je Uhr × K
const VOLL = process.env.VOLL === "1";
for (const K of [3, 0]) for (const p of (VOLL ? [0.05, 0.1, 0.2, 0.35] : K ? [0.1] : [0.35])) WORT.push(["Spaltung K=" + (K || "∞") + " p=" + p, { woerter: 6, wUhr: "spaltung", K, p, achsen: 0, lnM: false }]);
for (const K of [3, 0]) for (const mu of (VOLL ? [0.003, 0.01, 0.03, 0.1] : K ? [0.003, 0.03] : [0.003, 0.1])) WORT.push(["Zeit K=" + (K || "∞") + " μ=" + mu + "/Ma", { woerter: 6, wUhr: "zeit", K, mu, achsen: 0, lnM: false }]);
for (const [nm, cfg] of WORT) say("    " + nm.padEnd(26) + STUFEN.map(([Z, s]) => s + " " + zeig(rfReihe(Z, cfg))).join(" · "));
say("  KOMBINATION (≤ 12 Achsen + ≤ 6 Wörter):");
const KOMBI = [];
for (const K of [3, 0]) KOMBI.push(["Punkt 11 + 6 Wörter Spaltung K=" + (K || "∞") + " p=0.2", { art: "punkt", achsen: 11, woerter: 6, wUhr: "spaltung", K, p: 0.2 }]);
KOMBI.push(["OU 11 + 6 Wörter Spaltung K=∞ p=0.2", { art: "ou", achsen: 11, woerter: 6, wUhr: "spaltung", K: 0, p: 0.2 }]);
for (const mu of [0.01, 0.03, 0.1]) KOMBI.push(["Brown 11 + 6 Wörter Zeit K=3 μ=" + mu, { art: "brown", achsen: 11, woerter: 6, wUhr: "zeit", K: 3, mu }]);
// DAS GESETZ (vor dem Lauf benannt): je Wort EINE Zeitskala, log-gleich zwischen 1/Wurzel-Alter und 0,1/Ma (gewählt ≈ λ/3)
const SPANNE = [1 / GESETZ.wurzelMa, 0.1];
const DAS = { art: "brown", achsen: 11, woerter: 6, wUhr: "zeit", K: 3, muSpanne: SPANNE };
KOMBI.push(["DAS: Brown 11 + 6 Wörter K=3 Zeit μ_w gestreut", DAS]);
KOMBI.push(["Brown 11 + 6 Wörter K=∞ Zeit μ_w gestreut", Object.assign({}, DAS, { K: 0 })]);
KOMBI.push(["Brown 11 + 3 Wörter K=3 Zeit μ_w gestreut", Object.assign({}, DAS, { woerter: 3 })]);
KOMBI.push(["Brown 6 + 6 Wörter K=3 Zeit μ_w gestreut (7 Achsen = Welle 2)", Object.assign({}, DAS, { achsen: 6 })]);
const kombiRes = [];
for (const [nm, cfg] of KOMBI) { const r = STUFEN.map(([Z]) => rfReihe(Z, cfg)); kombiRes.push([nm, cfg, r]); say("    " + nm.padEnd(62) + STUFEN.map(([, s], q) => s + " " + zeig(r[q])).join(" · ")); }
// die beste Kombination (nach Klade 10) — dazu NJ als zweiter Bauer, Gegenproben, und die Obergrenze bei 20 / 40 Achsen
const best = ["DAS: Brown 11 + 6 Wörter K=3 Zeit μ_w gestreut", DAS];
const zweit = kombiRes.slice().sort((a, b) => b[2][0].anteil - a[2][0].anteil)[0];
say("  Höchster Anteil an Klade 10: „" + zweit[0] + "“ " + zeig(zweit[2][0]) + " — geprüft wird DAS (vor dem Lauf benannt):");
// Robustheit: drei frische Stichproben-Sätze Klade 10 und die Stichprobe der ersten Runde (Kladen 10–60, rf.cjs)
{ const z = [];
  for (const seed of [1001, 2002, 3003]) { lcg = seed; const L = []; for (let rep = 0; rep < 300; rep++) { const lv = stichprobe(W6, 10); const o = {}; L.push({ lv, Pm: lv.map((a) => lv.map((b) => (a === b ? 0 : 2 * W6.mrca(a, b).ma))), P: lv.map((i) => pfad(W6, i)), lnM: lv.map((i) => { W6.blatt(i, true, false, o); return o.x[0]; }) }); }
    PROBEN["s" + seed] = L; z.push("Satz " + seed + " " + zeig(rfReihe("s" + seed, DAS)) + " / Brown 11 " + zeig(rfReihe("s" + seed, KAND[0][1]))); }
  lcg = 12345; const L = []; for (let rep = 0; rep < 300; rep++) { let lo = 0, n = 1e6; const i0 = Math.floor(rnd() * 1e6); const ziel = 10 + Math.floor(rnd() * 50);
    while (n > ziel) { const k = W6.spalt(lo, n); if (i0 < lo + k) n = k; else { lo += k; n -= k; } } if (n < 10) { rep--; continue; }
    const lv = Array.from({ length: 10 }, (_, q) => lo + Math.floor(q * n / 10)); const o = {}; L.push({ lv, Pm: lv.map((a) => lv.map((b) => (a === b ? 0 : 2 * W6.mrca(a, b).ma))), P: lv.map((i) => pfad(W6, i)), lnM: lv.map((i) => { W6.blatt(i, true, false, o); return o.x[0]; }) }); }
  PROBEN.rf = L; const qa = L.map((p) => { const a = astLaengen(p.Pm); return mean(a.inn) / mean(a.term); });
  say("    Robustheit Klade 10 (DAS / Brown 11): " + z.join(" · "));
  say("    Stichprobe der ersten Runde (Kladen 10–60, rf.cjs): DAS " + zeig(rfReihe("rf", DAS)) + " · Brown 11 " + zeig(rfReihe("rf", KAND[0][1])) + " · innen/Blatt p50 " + f(quant(qa, 0.5), 3)); }
say("    NJ statt UPGMA:          " + STUFEN.map(([Z, s]) => s + " " + zeig(rfReihe(Z, best[1], nj))).join(" · "));
say("    Gegenprobe gemischt:     " + STUFEN.map(([Z, s]) => s + " " + zeig(rfReihe(Z, best[1], null, "misch"))).join(" · ") + "  (soll ≈ Zufall)");
say("    über dem Budget, Brown 39 + 6 Wörter:  " + STUFEN.map(([Z, s]) => s + " " + zeig(rfReihe(Z, Object.assign({}, best[1], { achsen: 39 })))).join(" · "));
say("    über dem Budget, Brown 11 + 24 Wörter: " + STUFEN.map(([Z, s]) => s + " " + zeig(rfReihe(Z, Object.assign({}, best[1], { woerter: 24 })))).join(" · "));
// Zufalls-Bezug: RF zweier unabhängiger Bäume (Gestalt-Baum aus reinem Rauschen)
{ const v = PROBEN[10].map((p) => { const X = Array.from({ length: 10 }, () => ({ c: Float64Array.from({ length: 12 }, () => rnd()), w: [] })); return rfVon(splits(upgma(p.Pm, 10), 10), splits(upgma(distanzen(X, false), 10), 10)); });
  say("    Zufalls-Bezug (Rauschen statt Erbe), Klade 10: RF p50 " + f(quant(v, 0.5)) + " · Anteil ≤ 0,3 " + f(100 * v.filter((x) => x <= 0.3).length / v.length, 0) + " %"); }
// Geburt-Tod-Bezugsbaum mit derselben besten Kombination (prüft: liegt die Grenze am Merkmals-Gesetz oder am Alters-Gesetz?)
{ const v = PROBEN[10].map((p, k) => { const b = cppBaum(W6, Math.max(...p.Pm.flat()) / 2, 4242 + k); const F = b.pf.map((pa) => Object.assign(merkmale(W6, pa, best[1]), { lnM: 0 })); return rfVon(splits(upgma(b.Pm, 10), 10), splits(upgma(distanzen(F, false), 10), 10)); });
  say("    dieselbe Kombination am Geburt-Tod-Bezug (CPP), Klade 10: RF p50 " + f(quant(v, 0.5)) + " · Anteil ≤ 0,3 " + f(100 * v.filter((x) => x <= 0.3).length / v.length, 0) + " %"); }

// ═════ D. MANTEL an 10⁴ Blättern (stammbaum#4), Welt N = 10⁴, alle Blätter, 10⁵ Paare ═════
{ const W4 = welt("erde", 1e4, { achsen: 12 }); const alle = Array.from({ length: 1e4 }, (_, i) => i);
  const PF = alle.map((i) => pfad(W4, i)), o = {}; const LN = alle.map((i) => { W4.blatt(i, true, false, o); return o.x[0]; });
  lcg = 99; const paare = 100000, pa = new Int32Array(2 * paare), dT = new Float64Array(paare);
  for (let q = 0; q < paare; q++) { const a = Math.floor(rnd() * 1e4); let b = Math.floor(rnd() * 1e4); if (a === b) b = (b + 1) % 1e4; pa[2 * q] = a; pa[2 * q + 1] = b; dT[q] = 2 * W4.mrca(a, b).ma; }
  const mantel = (cfg, perm) => { const F = PF.map((p, i) => merkmale(W4, p, cfg)); const A = cfg.achsen || 0, mit = cfg.lnM !== false;
    const sg = []; for (let j = 0; j < A; j++) sg.push(sd(F.map((x) => x.c[j])) || 1); const sgM = sd(LN);
    const d = new Float64Array(paare); for (let q = 0; q < paare; q++) { let a = pa[2 * q], b = pa[2 * q + 1]; if (perm) { a = perm[a]; b = perm[b]; } let s = mit ? ((LN[a] - LN[b]) / sgM) ** 2 : 0;
      for (let j = 0; j < A; j++) s += ((F[a].c[j] - F[b].c[j]) / sg[j]) ** 2; for (let w = 0; w < F[a].w.length; w++) if (F[a].w[w] !== F[b].w[w]) s += 2; d[q] = Math.sqrt(s); }
    return pearson(d, dT); };
  say("\nD. MANTEL r (sichtbare Distanz ↔ patristisch), N = 10⁴ alle Blätter, 10⁵ Paare (stammbaum#4 verlangt ≥ 0,5):");
  const reihe = [["Brown 11 + ln M", { art: "brown", achsen: 11 }], ["OU 11 + ln M", { art: "ou", achsen: 11 }], ["Punkt 11 + ln M", { art: "punkt", achsen: 11 }],
    ["6 Wörter Zeit K=3 μ_w gestreut (allein)", Object.assign({}, DAS, { achsen: 0, lnM: false })],
    ["Brown 11 + 6 Wörter Zeit K=3 μ=0.03 (alle schnell)", { art: "brown", achsen: 11, woerter: 6, wUhr: "zeit", K: 3, mu: 0.03 }],
    ["Brown 11 + 6 Wörter Zeit K=3 μ=0.003 (alle langsam)", { art: "brown", achsen: 11, woerter: 6, wUhr: "zeit", K: 3, mu: 0.003 }],
    ["Brown 6 + 6 Wörter K=3 μ_w gestreut (7 Achsen = Welle 2)", Object.assign({}, DAS, { achsen: 6 })],
    ["DAS: Brown 11 + 6 Wörter K=3 μ_w gestreut", DAS]];
  for (const [nm, cfg] of reihe) say("  " + nm.padEnd(58) + " r = " + f(mantel(cfg), 3));
  const perm = alle.slice(); for (let i = perm.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [perm[i], perm[j]] = [perm[j], perm[i]]; }
  say("  Gegenprobe gemischt (DAS): r = " + f(mantel(best[1], perm), 3) + " (soll ≈ 0)"); }
// Mantel-Streuung über Saaten (erste Runde: r(20) an vier Planeten 0,42–0,57): DAS und Brown 11 an drei weiteren Saaten, 5·10⁴ Paare
{ const z = [];
  for (const samen of ["saat-a", "saat-b", "saat-c"]) { const W4 = welt(samen, 1e4, { achsen: 12 }); const PF = []; const LN = []; const o = {};
    for (let i = 0; i < 1e4; i++) { PF.push(pfad(W4, i)); W4.blatt(i, true, false, o); LN.push(o.x[0]); }
    lcg = 7; const paare = 50000, pa = new Int32Array(2 * paare), dT = new Float64Array(paare);
    for (let q = 0; q < paare; q++) { const a = Math.floor(rnd() * 1e4); let b = Math.floor(rnd() * 1e4); if (a === b) b = (b + 1) % 1e4; pa[2 * q] = a; pa[2 * q + 1] = b; dT[q] = 2 * W4.mrca(a, b).ma; }
    const r = (cfg) => { const F = PF.map((p) => merkmale(W4, p, cfg)); const sg = []; for (let j = 0; j < cfg.achsen; j++) sg.push(sd(F.map((x) => x.c[j])) || 1); const sgM = sd(LN);
      const d = new Float64Array(paare); for (let q = 0; q < paare; q++) { const a = pa[2 * q], b = pa[2 * q + 1]; let s = ((LN[a] - LN[b]) / sgM) ** 2; for (let j = 0; j < cfg.achsen; j++) s += ((F[a].c[j] - F[b].c[j]) / sg[j]) ** 2; for (let w = 0; w < F[a].w.length; w++) if (F[a].w[w] !== F[b].w[w]) s += 2; d[q] = Math.sqrt(s); }
      return pearson(d, dT); };
    z.push(samen + " DAS " + f(r(DAS), 3) + " / Brown 11 " + f(r({ art: "brown", achsen: 11 }), 3)); }
  say("  Mantel über Saaten: " + z.join(" · ")); }
// PREIS je Blatt bei N = 10⁶: Pfad allein ↔ Pfad + DAS-Merkmale (11 Achsen + 6 Wörter), 2 000 Blätter, 0 Byte gehalten
{ lcg = 3; const idx = Array.from({ length: 2000 }, () => Math.floor(rnd() * 1e6)); for (const i of idx.slice(0, 300)) merkmale(W6, pfad(W6, i), DAS);
  let t0 = now(); for (const i of idx) pfad(W6, i); const tP = (now() - t0) * 1000 / idx.length;
  t0 = now(); for (const i of idx) merkmale(W6, pfad(W6, i), DAS); const tM = (now() - t0) * 1000 / idx.length;
  t0 = now(); for (const i of idx) merkmale(W6, pfad(W6, i), Object.assign({}, DAS, { woerter: 0 })); const tB = (now() - t0) * 1000 / idx.length;
  say("\nPREIS je Blatt (N = 10⁶, 2 000 Blätter): Pfad " + f(tP, 1) + " µs · + Brown 11 " + f(tB, 1) + " µs · + Brown 11 + 6 Wörter " + f(tM, 1) + " µs (Spike-JS, Objekt je Ast; 0 Byte gehalten)"); }

// ═════ E. BAUM-GESTALT und GRÖSSE unberührt (die Kandidaten lesen nur, sie schreiben weder Spaltung noch ln M) ═════
{ const n = 100, norm = (n - 1) * (n - 2) / 2; const C = [];
  for (let s = 0; s < 30; s++) { const W = welt("saat-" + s, n); let c = 0; const st = [[0, n]]; while (st.length) { const [lo, m] = st.pop(); if (m === 1) continue; const k = W.spalt(lo, m); c += Math.abs(m - 2 * k); st.push([lo, k], [lo + k, m - k]); } C.push(c / norm); }
  const o = {}; const lg = []; lcg = 5; for (let q = 0; q < 4000; q++) { W6.blatt(Math.floor(rnd() * 1e6), true, false, o); lg.push(o.x[0] / Math.LN10 + 3); }
  const m = mean(lg), s = sd(lg), sk = lg.reduce((x, y) => x + ((y - m) / s) ** 3, 0) / lg.length;
  say("\nE. Colless (n = 100, 30 Saaten) " + f(mean(C), 4) + " (Band 0,072–0,266, erste Runde 0,1316) · log10 M[g] Schiefe " + f(sk, 3) + " Median " + f(quant(lg, 0.5), 2) + " (erste Runde 0,937 · 1,43)"); }
say("\nLaufzeit gesamt " + f((now() - T0) / 1000, 1) + " s");
