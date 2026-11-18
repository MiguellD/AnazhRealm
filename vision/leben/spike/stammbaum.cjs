// SPIKE „Stammbaum als Funktion des Samens" — Arten ohne Speicher. Nur LESEN des Repos; Zahlen auf stdout.
// Lauf: node stammbaum.cjs [repoPfad]   (Standard C:/Users/micha/AnazhRealm-profiband)
// Liest: planet-core.js (planetHash, planetZufall = der Zähler-Zufall des Samens; planetPlan → g, Radius; PLANET_ERDE),
//        tetrapoda-core.js (GATTUNGEN = Wurzel-Dials, KAMPF.refKg = Masse des Wolf-Gusses).
"use strict";
const path = require("path");
const REPO = process.argv[2] || "C:/Users/micha/AnazhRealm-profiband";
const P = require(path.join(REPO, "planet-core.js"));
require(path.join(REPO, "tetrapoda-core.js"));
const T = globalThis.__tetrapodaCore;
const now = () => Number(process.hrtime.bigint()) / 1e6; // ms
const T0 = now();
const out = [];
function say(s) { console.log(s); out.push(s); }
const f = (x, d = 3) => (Number.isFinite(x) ? x.toFixed(d) : String(x));

// ───────────────────────────── DAS GESETZ (Kandidat für leben-core.js §6, Welle 3) ─────────────────────────────
const G = T.GATTUNGEN, REF_KG = T.KAMPF.refKg;
const logit = (p) => Math.log(p / (1 - p));
const DIALS = ["diet", "build", "neck", "leg"];
const wurzelDial = DIALS.map((d) => { const v = Object.keys(G).map((g) => Math.min(0.97, Math.max(0.03, G[g][d]))); return logit(v.reduce((a, b) => a + b, 0) / v.length); });
const GESETZ = Object.freeze({
  epsilon: 0.9,          // Umsatz μ/λ (Band 0,5–0,9; unsicher)
  wurzelMa: 350,         // Krone der Landwirbeltiere (Erd-Anker; für fremde Planeten offen)
  alterStreu: 0.15,      // ln-Streuung des Knoten-Alters um die Erwartung je Kladen-Größe (unsicher)
  sigma2LnM: 0.05,       // Brown-Rate ln M [1/Ma]; 0,018 (Smith et al. 2003, Var/T) trägt Schiefe UND große Tiere nicht (Spike-Probe) — unsicher
  copeJeSpaltung: 0.04,  // Drift ln M je Artbildung (Clauset & Erwin 2008; unsicher)
  wurzelKg: 0.04,        // Ahnin 40 g (Clauset & Erwin 2008: Säuger-Ursprung ~40 g; unsicher)
  wandKg: 0.002,         // 2 g Untergrenze, reflektierend (Clauset & Erwin 2008)
  maxKgErde: 1e5,        // Obergrenze Landtier bei 1 g (Sauropoden ~7·10⁴ kg; unsicher), M_max ∝ g^−3
  sigma2Logit: 0.004,    // Brown-Rate der Form-Achsen (Logit) [1/Ma] (Entwurf baum; unsicher)
  sOrt: 60,              // Arten dieses Baums an einem Punkt (Tetrapoden gemäßigt, Größenordnung; unsicher)
  arealStreu: 0.7,       // Logit-Streuung der Areal-Teilung je Spaltung (unsicher) → log-schiefe Areal-Größen
  groesseSteuert: 0.65,  // P(größere Klade trägt den kleineren ln-M-Zuwachs); 0,5 = kein Zusammenhang (unsicher, Orme et al. 2002 schwach)
});
const GAMMA = 0.5772156649015329, TAU = 6.283185307179586, FOURPI = 4 * Math.PI;
const HT = new Float64Array(66); for (let i = 1; i < 66; i++) HT[i] = HT[i - 1] + 1 / i;
const H = (x) => (x < 66 ? HT[x] : Math.log(x) + GAMMA + 1 / (2 * x) - 1 / (12 * x * x));
function mix32(h) { h ^= h >>> 16; h = Math.imul(h, 0x7feb352d); h ^= h >>> 15; h = Math.imul(h, 0x846ca68b); h ^= h >>> 16; return h >>> 0; } // = planet-core.js:145

// welt(samen, N, opts) — DIE eine Funktion: Knoten (lo, n) = Blätter [lo, lo+n); nichts gespeichert außer Kopf-Konstanten.
function welt(samen, N, opts = {}) {
  const K = P.planetHash(String(samen) + "|stamm");
  const Tm = opts.wurzelMa || GESETZ.wurzelMa, eps = GESETZ.epsilon;
  const r = Math.log(1 + (N - 1) * (1 - eps)) / Tm, lam = r / (1 - eps); // N = 1 + (λ/r)(e^{rT} − 1) → r
  const g = opts.g || 9.81, achsen = opts.achsen || 5;
  const wandLo = Math.log(GESETZ.wandKg), wandHoch = Math.log(GESETZ.maxKgErde * Math.pow(9.81 / g, 3));
  const aWurzel = (opts.sOrt || GESETZ.sOrt) * FOURPI; // Σ Blatt-Areale = sOrt Planeten-Flächen (sr)
  const wurzelX = new Float64Array(achsen); wurzelX[0] = Math.log(GESETZ.wurzelKg); for (let j = 1; j < achsen; j++) wurzelX[j] = wurzelDial[(j - 1) % 4];
  // EIN Hash je Knoten, Unter-Ziehungen per mix32 (Zweck c)
  const hk = (lo, n) => (P.planetZufall(K, lo, n, 0) * 4294967296) >>> 0;
  const u = (h, c) => mix32((h ^ Math.imul(c + 1, 0x9e3779b1)) >>> 0) / 4294967296;
  const nz = (h, c) => Math.sqrt(-2 * Math.log(1 - u(h, c))) * Math.cos(TAU * u(h, c + 1));
  // β = −1 exakt: q_n(k) = (1/k + 1/(n−k)) / (2·H_{n−1}) — Seite, dann kleinstes K mit H_K ≥ u·H_{n−1}
  function spaltH(h, n) {
    const ziel = u(h, 2) * H(n - 1);
    let k = Math.max(1, Math.min(n - 1, Math.floor(Math.exp(ziel - GAMMA))));
    while (k < n - 1 && H(k) < ziel) k++;
    while (k > 1 && H(k - 1) >= ziel) k--;
    return u(h, 1) < 0.5 ? k : n - k;
  }
  const spalt = (lo, n) => spaltH(hk(lo, n), n);
  function alterH(h, lo, n, elterMa) { // Erwartung aus Kladen-Größe (Geburt-Tod), ln-Streuung, unter dem Elter
    if (n === 1) return 0;
    const a = Math.log(1 + (n - 1) * r / lam) / r * Math.exp(GESETZ.alterStreu * nz(h, 3));
    return Math.min(a, 0.98 * elterMa);
  }
  const alter = (lo, n, elterMa) => (lo === 0 && n === N ? Tm : alterH(hk(lo, n), lo, n, elterMa));
  // Merkmale wandern Elter → Kind: Brown (+Cope auf ln M, Wände 2 g und M_max(g)); Mutante erbeAus: je Blatt unabhängig
  // Größe steuert die Vielfalt: die Zuwächse von ln M beider Kinder zieht der ELTER (z_A, z_B); die größere Klade bekommt mit
  // Wahrscheinlichkeit q den kleineren Zuwachs (kleine Linien diversifizieren mehr / große sterben eher — Clauset & Erwin 2008
  // im rekonstruierten Baum). Topologie (k) bleibt β = −1, nur die Zuordnung Merkmal ↔ Seite liest die Größe.
  const q = opts.groesseSteuert !== undefined ? opts.groesseSteuert : GESETZ.groesseSteuert;
  function zLnM(h, n, k, s) { // s = 0 links (k Blätter), 1 rechts
    const zA = nz(h, 20), zB = nz(h, 22), zk = Math.min(zA, zB), zg = Math.max(zA, zB);
    const grossIst = k >= n - k ? 0 : 1, gross = u(h, 24) < q ? zk : zg, klein = gross === zk ? zg : zk;
    // NICHT zentriert (gemessen: zentriert fällt die Schiefe auf ≈ 0): der Weg der meisten Blätter driftet zur 2-g-Wand —
    // das ist der Clauset-Erwin-Mechanismus (Aussterben steigt mit der Größe), die Schiefe kommt aus Wand + Drift
    return s === grossIst ? gross : klein;
  }
  function merkmal(h, dt, x, o, zM) {
    if (opts.erbeAus) { o[0] = wurzelX[0] + Math.sqrt(GESETZ.sigma2LnM * Tm) * nz(h, 10); for (let j = 1; j < achsen; j++) o[j] = wurzelX[j] + Math.sqrt(GESETZ.sigma2Logit * Tm) * nz(h, 10 + 2 * j); return o; }
    let m = x[0] + GESETZ.copeJeSpaltung + Math.sqrt(GESETZ.sigma2LnM * dt) * zM;
    for (let it = 0; it < 4; it++) { if (m < wandLo) m = 2 * wandLo - m; else if (m > wandHoch) m = 2 * wandHoch - m; else break; }
    o[0] = m; const s = Math.sqrt(GESETZ.sigma2Logit * dt);
    for (let j = 1; j < achsen; j++) o[j] = x[j] + s * nz(h, 10 + 2 * j);
    return o;
  }
  // Areal: Kugel-Kappe (Mitte c, Fläche a sr). Spaltung = Teilung des Elter-Areals: Anteil f = σ(logit(k/n) + s·z), 1 − f;
  // die Geschwister rücken in entgegengesetzte Richtung (Vikarianz), jedes bleibt IN der Kappe des Elters (Hülle → Abstieg prunbar).
  const capCos = (a) => (a >= FOURPI ? -1 : 1 - a / (2 * Math.PI));
  function arealKinder(h, n, k, cx, cy, cz, a, L, R) { // L, R: Float64Array(6) [cx,cy,cz,a,cosθ,sinθ]
    const z = GESETZ.arealStreu * nz(h, 5);
    const fl = 1 / (1 + Math.exp(-(Math.log(k / (n - k)) + z)));
    const cP = capCos(a), sP = Math.sqrt(Math.max(0, 1 - cP * cP));
    let ax = 1, ay = 0; if (Math.abs(cx) > 0.9) { ax = 0; ay = 1; }
    let e1x = -cz * ay, e1y = cz * ax, e1z = cx * ay - cy * ax; const l = Math.sqrt(e1x * e1x + e1y * e1y + e1z * e1z); e1x /= l; e1y /= l; e1z /= l;
    const e2x = cy * e1z - cz * e1y, e2y = cz * e1x - cx * e1z, e2z = cx * e1y - cy * e1x;
    const ph = TAU * u(h, 8), cp = Math.cos(ph), sp = Math.sin(ph);
    for (let s = 0; s < 2; s++) {
      const o = s ? R : L, ac = a * (s ? 1 - fl : fl);
      const cC = capCos(ac), sC = Math.sqrt(Math.max(0, 1 - cC * cC));
      const cDiff = cP * cC + sP * sC; // cos(θP − θC)
      const cd = 1 - u(h, 6 + s) * (1 - cDiff), sd = Math.sqrt(Math.max(0, 1 - cd * cd)) * (s ? -1 : 1);
      o[0] = cx * cd + sd * (e1x * cp + e2x * sp); o[1] = cy * cd + sd * (e1y * cp + e2y * sp); o[2] = cz * cd + sd * (e1z * cp + e2z * sp);
      o[3] = ac; o[4] = cC; o[5] = sC;
    }
  }
  // (1) ADRESSE: Blatt i → Pfad Wurzel → Blatt, O(Tiefe); optional Merkmale und Areal
  const bL = new Float64Array(6), bR = new Float64Array(6);
  function blatt(i, mitMerkmal, mitAreal, o) {
    let lo = 0, n = N, ma = Tm, tiefe = 0;
    let x = Float64Array.from(wurzelX), y = new Float64Array(achsen);
    let cx = 0, cy = 0, cz = 1, a = aWurzel;
    while (n > 1) {
      const h = hk(lo, n), k = spaltH(h, n), links = i < lo + k;
      if (mitAreal) { arealKinder(h, n, k, cx, cy, cz, a, bL, bR); const b = links ? bL : bR; cx = b[0]; cy = b[1]; cz = b[2]; a = b[3]; }
      const clo = links ? lo : lo + k, cn = links ? k : n - k;
      const hc = cn > 1 || mitMerkmal ? hk(clo, cn) : 0;
      const cma = cn === 1 ? 0 : alterH(hc, clo, cn, ma);
      if (mitMerkmal) { merkmal(hc, ma - cma, x, y, zLnM(h, n, k, links ? 0 : 1)); const t = x; x = y; y = t; }
      lo = clo; n = cn; ma = cma; tiefe++;
    }
    if (o) { o.tiefe = tiefe; o.x = x; o.c = [cx, cy, cz]; o.a = a; }
    return tiefe;
  }
  // Baum-Distanz ohne Aufzählen: gemeinsamer Abstieg bis zur Gabel
  function mrca(i, j) {
    let lo = 0, n = N, ma = Tm, d = 0;
    while (n > 1) {
      const k = spalt(lo, n), li = i < lo + k, lj = j < lo + k;
      if (li !== lj) return { lo, n, ma, d };
      const clo = li ? lo : lo + k, cn = li ? k : n - k; ma = cn === 1 ? 0 : alter(clo, cn, ma); lo = clo; n = cn; d++;
    }
    return { lo, n, ma: 0, d };
  }
  // (4)/(5) ORT → ARTEN: Abstieg nur durch Knoten, deren Kappe die Region (Kappe um p mit Winkel rho) berührt.
  // zeitMa > 0: dieselbe Funktion in der Vergangenheit; ausgegeben wird die Linie, die zu t lebt (alter(v) ≤ t < alter(Elter)).
  const CAP = 1 << 16;
  const sLo = new Int32Array(CAP), sN = new Int32Array(CAP), sF = new Float64Array(CAP * 5), sX = new Float64Array(CAP * achsen);
  const kL = new Float64Array(6), kR = new Float64Array(6), xb = new Float64Array(achsen), yb = new Float64Array(achsen);
  function artenAm(px, py, pz, rho, zeitMa, mitMerkmal, aus) {
    const cr = Math.cos(rho), sr = Math.sin(rho), t = zeitMa || 0;
    let sp = 1, besucht = 0, gefunden = 0;
    sLo[0] = 0; sN[0] = N; sF[0] = 0; sF[1] = 0; sF[2] = 1; sF[3] = aWurzel; sF[4] = Tm;
    for (let j = 0; j < achsen; j++) sX[j] = wurzelX[j];
    while (sp > 0) {
      sp--; const lo = sLo[sp], n = sN[sp], b = sp * 5, ma = sF[b + 4]; besucht++;
      if (n === 1 || ma <= t) { gefunden++; if (aus) aus.push(lo, n, mitMerkmal ? sX[sp * achsen] : 0); continue; }
      const h = hk(lo, n), k = spaltH(h, n);
      arealKinder(h, n, k, sF[b], sF[b + 1], sF[b + 2], sF[b + 3], kL, kR);
      if (mitMerkmal) for (let j = 0; j < achsen; j++) xb[j] = sX[sp * achsen + j];
      for (let s = 0; s < 2; s++) {
        const o = s ? kR : kL, clo = s ? lo + k : lo, cn = s ? n - k : k;
        // Punkt in Kappe ⊕ rho ⇔ dot ≥ cos(θ + rho)
        const cosSum = o[4] * cr - o[5] * sr; // cos(θ+ρ); θ+ρ ≥ π ⇒ alles
        if (o[4] > -cr && px * o[0] + py * o[1] + pz * o[2] < cosSum) continue; // θ+ρ ≥ π ⇔ cosθ ≤ −cosρ
        const hc = cn > 1 || mitMerkmal ? hk(clo, cn) : 0;
        const cma = cn === 1 ? 0 : alterH(hc, clo, cn, ma);
        sLo[sp] = clo; sN[sp] = cn; const q = sp * 5; sF[q] = o[0]; sF[q + 1] = o[1]; sF[q + 2] = o[2]; sF[q + 3] = o[3]; sF[q + 4] = cma;
        if (mitMerkmal) { merkmal(hc, ma - cma, xb, yb, zLnM(h, n, k, s)); for (let j = 0; j < achsen; j++) sX[sp * achsen + j] = yb[j]; }
        sp++;
      }
    }
    return { besucht, gefunden };
  }
  return { N, r, lam, Tm, g, wandHoch, aWurzel, spalt, alter, blatt, mrca, artenAm };
}

// ───────────────────────────── Mess-Hilfen (nie Gesetz) ─────────────────────────────
function zufallsPunkt(u1, u2) { const z = 2 * u1 - 1, s = Math.sqrt(1 - z * z), ph = TAU * u2; return [s * Math.cos(ph), s * Math.sin(ph), z]; }
function versetzt(p, ang, az) {
  let ax = 1, ay = 0; if (Math.abs(p[0]) > 0.9) { ax = 0; ay = 1; }
  let e1 = [-p[2] * ay, p[2] * ax, p[0] * ay - p[1] * ax]; const l = Math.hypot(...e1); e1 = e1.map((v) => v / l);
  const e2 = [p[1] * e1[2] - p[2] * e1[1], p[2] * e1[0] - p[0] * e1[2], p[0] * e1[1] - p[1] * e1[0]];
  return [0, 1, 2].map((j) => p[j] * Math.cos(ang) + Math.sin(ang) * (e1[j] * Math.cos(az) + e2[j] * Math.sin(az)));
}
const mean = (a) => a.reduce((x, y) => x + y, 0) / a.length;
const sd = (a) => { const m = mean(a); return Math.sqrt(a.reduce((x, y) => x + (y - m) ** 2, 0) / (a.length - 1)); };
const quant = (a, q) => { const s = Array.from(a).sort((x, y) => x - y); return s[Math.min(s.length - 1, Math.floor(q * s.length))]; };
function pearson(x, y) { const n = x.length; let mx = 0, my = 0; for (let i = 0; i < n; i++) { mx += x[i]; my += y[i]; } mx /= n; my /= n; let sxy = 0, sxx = 0, syy = 0; for (let i = 0; i < n; i++) { const a = x[i] - mx, b = y[i] - my; sxy += a * b; sxx += a * a; syy += b * b; } return sxy / Math.sqrt(sxx * syy); }
function skew(a) { const m = mean(a), s = sd(a); return a.reduce((x, y) => x + ((y - m) / s) ** 3, 0) / a.length; }
let lcg = 12345; const rnd = () => ((lcg = (Math.imul(lcg, 1664525) + 1013904223) >>> 0) / 4294967296); // Mess-Stichprobe
function fnv(arr) { let h = 0x811c9dc5; for (const v of arr) { const s = String(v); for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193); } } return (h >>> 0).toString(16); }
const R_ERDE_KM = P.PLANET_ERDE.radiusKm;

say("SPIKE stammbaum — Repo " + REPO + " · node " + process.version);
say("Wurzel-Dials (Logit, Mittel der 4 GATTUNGEN tetrapoda-core.js:62): " + wurzelDial.map((v) => f(v)).join(" ") + " · refKg " + REF_KG + " (tetrapoda-core.js:3959)");

// ═════════════ (0) KOSTEN ORT → ARTEN im frischen Heap (vor allen Statistiken; Region 200 m, N = 10⁶) ═════════════
{
  const W = welt("erde", 1e6); const pts = []; for (let q = 0; q < 1000; q++) pts.push(zufallsPunkt(rnd(), rnd()));
  for (let q = 0; q < 200; q++) W.artenAm(pts[q][0], pts[q][1], pts[q][2], 0.1 / R_ERDE_KM, 0, false, null);
  const zt = [], kn = [], ge = []; for (const p of pts) { const t0 = now(); const r = W.artenAm(p[0], p[1], p[2], 0.1 / R_ERDE_KM, 0, false, null); zt.push(now() - t0); kn.push(r.besucht); ge.push(r.gefunden); }
  const s = kn.reduce((a, b) => a + b, 0), ts = zt.reduce((a, b) => a + b, 0);
  say("\n(0) ORT → ARTEN frisch (1 000 Orte, Region 200 m, ohne Speicher): p50 " + f(quant(zt, 0.5) * 1000, 0) + " µs · p95 " + f(quant(zt, 0.95) * 1000, 0) + " µs · p99 " + f(quant(zt, 0.99) * 1000, 0) + " µs · " + f(ts * 1e6 / s, 0) + " ns/Knoten · Knoten p50 " + quant(kn, 0.5) + " p95 " + quant(kn, 0.95) + " · Arten p50 " + quant(ge, 0.5) + " · Anteil Regionen < 1 ms " + f(zt.filter((x) => x < 1).length / zt.length, 2));
}

// ═════════════ (1) ADRESSE, N = 10⁶ ═════════════
{
  const N = 1e6, W = welt("erde", N);
  say("\n(1) ADRESSE  N = 10⁶ · r = " + f(W.r, 4) + "/Ma · λ = " + f(W.lam, 4) + "/Ma · Wurzel " + W.Tm + " Ma");
  const M = 20000, idx = new Int32Array(M); for (let i = 0; i < M; i++) idx[i] = Math.floor(rnd() * N);
  for (let q = 0; q < 3000; q++) W.blatt(idx[q], true, true, {}); // Aufwärmen
  for (const [name, mm, ma] of [["Topologie+Alter", false, false], ["+5 Merkmale", true, false], ["+5 Merkmale+Areal", true, true]]) {
    const heap0 = process.memoryUsage().heapUsed; const t0 = now(); let s = 0; const o = {};
    for (let q = 0; q < M; q++) s += W.blatt(idx[q], mm, ma, o);
    const dt = now() - t0;
    say("  Nachschlag " + name.padEnd(18) + f(dt * 1000 / M, 2) + " µs/Blatt · Tiefe Mittel " + f(s / M, 1) + " · Heap-Δ nach 2·10⁴ Nachschlägen " + f((process.memoryUsage().heapUsed - heap0) / 1e6, 2) + " MB");
  }
  const tiefen = []; for (let q = 0; q < 20000; q++) tiefen.push(W.blatt(idx[q], false, false));
  say("  Tiefe p50 " + quant(tiefen, 0.5) + " · p99 " + quant(tiefen, 0.99) + " · max " + Math.max(...tiefen) + " (β = −1: ~ ln²N/(2ζ(2)) = " + f(Math.log(N) ** 2 / (2 * Math.PI ** 2 / 6), 0) + ")");
  const A = []; const W2 = welt("erde", N); const B = []; const o = {};
  for (let q = 0; q < 3000; q++) { W.blatt(idx[q], true, true, o); A.push(...Array.from(o.x, (v) => v.toFixed(12)), ...o.c.map((v) => v.toFixed(12))); W2.blatt(idx[q], true, true, o); B.push(...Array.from(o.x, (v) => v.toFixed(12)), ...o.c.map((v) => v.toFixed(12))); }
  say("  Determinismus (3 000 Blätter, Merkmale+Areal auf 12 Stellen): Fabrik 1 " + fnv(A) + " · Fabrik 2 " + fnv(B) + " · gleich " + (fnv(A) === fnv(B)) + " · Lauf-Prüfsumme " + fnv(A));
  const tm0 = now(); let dsum = 0, dtop = 0; for (let q = 0; q < 20000; q++) { const m = W.mrca(idx[q], idx[(q + 1) % M]); dsum += 2 * m.ma; dtop += m.d; }
  say("  Baum-Distanz (MRCA ohne Aufzählen): " + f((now() - tm0) * 1000 / 20000, 2) + " µs/Paar · patristisch Mittel " + f(dsum / 20000, 1) + " Ma · MRCA-Tiefe Mittel " + f(dtop / 20000, 1));
}

// ═════════════ (2) BAUMGESTALT, n = 100, 100 Saaten ═════════════
function lgamma(z) { const c = [0.99999999999980993, 676.5203681218851, -1259.1392167224028, 771.32342877765313, -176.61502916214059, 12.507343278686905, -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7]; if (z < 0.5) return Math.log(Math.PI / Math.abs(Math.sin(Math.PI * z))) - lgamma(1 - z); z -= 1; let x = c[0]; for (let i = 1; i < 9; i++) x += c[i] / (z + i); const t = z + 7.5; return 0.5 * Math.log(TAU) + (z + 0.5) * Math.log(t) - t + Math.log(x); }
function qTafel(beta, nMax) { const Tq = []; for (let n = 2; n <= nMax; n++) { const w = []; for (let k = 1; k < n; k++) w.push(beta === -1 ? 1 / (k * (n - k)) : Math.exp(lgamma(beta + k + 1) + lgamma(beta + n - k + 1) - lgamma(k + 1) - lgamma(n - k + 1))); const s = w.reduce((a, b) => a + b, 0); Tq[n] = w.map((v) => v / s); } return Tq; }
function gestalt(spaltFn, n) { let colless = 0, sackin = 0; const splits = []; const st = [[0, n, 0]]; while (st.length) { const [lo, m, d] = st.pop(); if (m === 1) { sackin += d; continue; } const k = spaltFn(lo, m); splits.push([m, k]); colless += Math.abs(m - 2 * k); st.push([lo, k, d + 1], [lo + k, m - k, d + 1]); } return { colless, sackin, splits }; }
{
  const n = 100, S = 100, norm = (n - 1) * (n - 2) / 2;
  say("\n(2) BAUMGESTALT  n = 100 · 100 Saaten · Colless normiert C/((n−1)(n−2)/2) · Referenz-Bäume aus der Aldous-Tafel derselben Saaten");
  const res = {};
  const tafeln = { "Yule β=0": qTafel(0, n), "PDA β=−1,5": qTafel(-1.5, n) };
  const allSplits = [];
  const ref = (Tq, nm) => (s) => { const K = P.planetHash("ref-" + nm + s); return (lo, m) => { const uu = P.planetZufall(K, lo, m, 2); const q = Tq[m]; let acc = 0; for (let k = 1; k < m; k++) { acc += q[k - 1]; if (uu < acc) return k; } return m - 1; }; };
  for (const [name, mk] of [["GESETZ β=−1 (welt.spalt)", (s) => welt("saat-" + s, n).spalt], ...Object.entries(tafeln).map(([nm, Tq]) => [nm, ref(Tq, nm)])]) {
    const C = [], Sk = [];
    for (let s = 0; s < S; s++) { const g = gestalt(mk(s), n); C.push(g.colless / norm); Sk.push(g.sackin / n); if (name.startsWith("GESETZ")) allSplits.push(g.splits); }
    res[name] = C;
    say("  " + name.padEnd(26) + " Colless " + f(mean(C), 4) + " ± " + f(sd(C), 4) + " (p10 " + f(quant(C, 0.1), 3) + " · p90 " + f(quant(C, 0.9), 3) + ") · Sackin/n " + f(mean(Sk), 2) + " ± " + f(sd(Sk), 2));
  }
  const betas = []; for (let b = -1.9; b <= 2.0001; b += 0.05) betas.push(+b.toFixed(2));
  const tafB = new Map(betas.map((b) => [b, qTafel(b, n)]));
  const mlb = (spl) => { let best = null; for (const b of betas) { const Tq = tafB.get(b); let ll = 0; for (const [m, k] of spl) ll += Math.log(Tq[m][k - 1]); if (!best || ll > best.ll) best = { b, ll }; } return best.b; };
  const bAll = mlb(allSplits.flat()), bJe = allSplits.map(mlb);
  say("  ML-β̂ (Aldous-Familie) aus allen " + allSplits.flat().length + " Spaltungen: " + f(bAll, 2) + " · je Saat p10 " + f(quant(bJe, 0.1), 2) + " · p50 " + f(quant(bJe, 0.5), 2) + " · p90 " + f(quant(bJe, 0.9), 2));
  const cG = mean(res["GESETZ β=−1 (welt.spalt)"]), cY = mean(res["Yule β=0"]), cP = mean(res["PDA β=−1,5"]);
  say("  Band reale Kladen (unbalancierter als Yule, balancierter als PDA; β̂-Modus ≈ −1, Blum & François 2006): " + f(cY, 4) + " < " + f(cG, 4) + " < " + f(cP, 4) + " → " + (cG > cY && cG < cP && Math.abs(bAll + 1) <= 0.2 ? "IM BAND" : "AUSSERHALB"));
}

// ═════════════ (3) MERKMAL ↔ BAUM ═════════════
function mantel(W, leaves, paare, dims) {
  const X = leaves.map((i) => { const o = {}; W.blatt(i, true, false, o); return Float64Array.from(o.x); });
  const A = X[0].length, mu = [], sg = [];
  for (let j = 0; j < A; j++) { const col = X.map((x) => x[j]); mu.push(mean(col)); sg.push(sd(col)); }
  const Xs = X.map((x) => x.map((v, j) => (v - mu[j]) / sg[j]));
  const pa = new Int32Array(paare * 2), dT = new Float64Array(paare);
  for (let q = 0; q < paare; q++) { const a = Math.floor(rnd() * leaves.length); let b = Math.floor(rnd() * leaves.length); if (a === b) b = (b + 1) % leaves.length; pa[2 * q] = a; pa[2 * q + 1] = b; dT[q] = 2 * W.mrca(leaves[a], leaves[b]).ma; }
  const dist = (D, perm, quad) => { const d = new Float64Array(paare); for (let q = 0; q < paare; q++) { const a = perm ? perm[pa[2 * q]] : pa[2 * q], b = perm ? perm[pa[2 * q + 1]] : pa[2 * q + 1]; let s = 0; for (let j = 0; j < D; j++) s += (Xs[a][j] - Xs[b][j]) ** 2; d[q] = quad ? s : Math.sqrt(s); } return d; };
  const rs = {}; for (const D of dims) if (D <= A) rs[D] = pearson(dist(D), dT);
  const rQ = pearson(dist(Math.min(5, A), null, true), dT);
  const D5 = Math.min(5, A), r5 = rs[D5]; let ge = 0; const perm = Xs.map((_, i) => i);
  for (let p = 0; p < 49; p++) { for (let i = perm.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [perm[i], perm[j]] = [perm[j], perm[i]]; } if (pearson(dist(D5, perm), dT) >= r5) ge++; }
  return { rs, rQ, p: (ge + 1) / 50, X, dTmean: mean(dT), dTcv: sd(dT) / mean(dT) };
}
{
  say("\n(3) MERKMAL ↔ BAUM  (ln M + Form-Achsen, Brown mit Cope und Wänden; Mantel = Pearson Euklid-Distanz der standardisierten Achsen ↔ patristische Distanz)");
  const dims = [1, 2, 5, 10, 20];
  const W4 = welt("erde", 1e4, { achsen: 20 }); const alle = Array.from({ length: 1e4 }, (_, i) => i);
  const t0 = now(); const m4 = mantel(W4, alle, 100000, dims);
  say("  N = 10⁴ (alle Blätter, 10⁵ Paare): r je Achsenzahl " + dims.map((d) => d + ":" + f(m4.rs[d])).join(" · ") + " · r(D², 5 Achsen) " + f(m4.rQ) + " · Perm.-p(5) " + f(m4.p, 2) + " · CV patristisch " + f(m4.dTcv, 2) + " · " + f(now() - t0, 0) + " ms");
  const W6 = welt("erde", 1e6, { achsen: 20 }); const st = Array.from({ length: 1e4 }, () => Math.floor(rnd() * 1e6));
  const m6 = mantel(W6, st, 100000, dims);
  say("  N = 10⁶ (10⁴ Blätter Stichprobe): r je Achsenzahl " + dims.map((d) => d + ":" + f(m6.rs[d])).join(" · ") + " · r(D², 5) " + f(m6.rQ) + " · Perm.-p(5) " + f(m6.p, 2) + " · CV patristisch " + f(m6.dTcv, 2));
  // Klade-lokal: 10⁴ Blätter EINER Klade von ~10⁴ Arten in 10⁶ (der Blick des Spielers liegt in einer Region, nicht im Planeten)
  { let lo = 0, n = 1e6; const i0 = Math.floor(rnd() * 1e6); while (n > 3e4) { const k = W6.spalt(lo, n); if (i0 < lo + k) n = k; else { lo += k; n -= k; } }
    const kl = Array.from({ length: Math.min(n, 1e4) }, (_, q) => lo + Math.floor(q * n / Math.min(n, 1e4))); const mk = mantel(W6, kl, 50000, dims);
    say("  N = 10⁶, EINE Klade mit " + n + " Arten: r je Achsenzahl " + dims.map((d) => d + ":" + f(mk.rs[d])).join(" · ")); }
  const Wa = welt("erde", 1e4, { achsen: 20, erbeAus: true }); const ma = mantel(Wa, alle, 100000, dims);
  say("  Mutante „Erbe aus“ (Merkmal je Knoten unabhängig), N = 10⁴: r(5) = " + f(ma.rs[5]) + " · r(20) = " + f(ma.rs[20]) + " (soll ≈ 0)");
  const lg = m6.X.map((x) => x[0] / Math.LN10 + 3);
  const dek = {}; for (const v of lg) { const d = Math.floor(v); dek[d] = (dek[d] || 0) + 1; }
  say("  log10 M [g], 10⁴ Blätter von 10⁶: Median " + f(quant(lg, 0.5), 2) + " · p95 " + f(quant(lg, 0.95), 2) + " · max " + f(Math.max(...lg), 2) + " · Schiefe " + f(skew(lg)) + " · je Dekade " + JSON.stringify(dek));
  const sk = [], ns = [];
  while (sk.length < 30) {
    const i = Math.floor(rnd() * 1e6); let lo = 0, n = 1e6;
    while (n > 5000) { const k = W6.spalt(lo, n); if (i < lo + k) n = k; else { lo += k; n -= k; } }
    if (n < 500) continue;
    const v = []; const o = {}; for (let q = 0; q < 1500; q++) { W6.blatt(lo + Math.floor(rnd() * n), true, false, o); v.push(o.x[0] / Math.LN10 + 3); }
    sk.push(skew(v)); ns.push(n);
  }
  say("  Schiefe log10 M je Klade (30 Kladen, " + Math.min(...ns) + "–" + Math.max(...ns) + " Arten, q = " + GESETZ.groesseSteuert + "): Mittel " + f(mean(sk)) + " · Anteil > 0: " + f(sk.filter((s) => s > 0).length / sk.length, 2) + " (Erde rechtsschief, Smith et al. 2003; Band „> 0“, unsicher)");
  { const Wb = welt("erde", 1e6, { groesseSteuert: 0.5 }); const v = []; const o = {}; for (let q = 0; q < 6000; q++) { Wb.blatt(Math.floor(rnd() * 1e6), true, false, o); v.push(o.x[0] / Math.LN10 + 3); }
    say("  Gegenprobe q = 0,5 (reines Brown, Größe steuert nichts): Schiefe global " + f(skew(v)) + " · Median " + f(quant(v, 0.5), 2)); }
}

// ═════════════ (4) ORT → ARTEN ═════════════
{
  const N = 1e6, W = welt("erde", N); const R = R_ERDE_KM;
  say("\n(4) ORT → ARTEN  N = 10⁶ · Areal = Kappe je Knoten, Spaltung teilt das Elter-Areal (Vikarianz), Kind IN der Kappe des Elters");
  const rhoRegion = 0.1 / R; // Bestand-Region ≈ 200 m Seite (BESTAND_REGION kreatur-leben.js:3731) → Kappe 100 m
  const pts = []; for (let q = 0; q < 300; q++) pts.push(zufallsPunkt(rnd(), rnd()));
  for (let q = 0; q < 100; q++) W.artenAm(...pts[q], rhoRegion, 0, true, null); // Aufwärmen
  for (const [nm, mm] of [["nur Arten", false], ["Arten+5 Merkmale", true]]) {
    const zt = [], bes = [], gef = [];
    for (const p of pts) { const t0 = now(); const r = W.artenAm(p[0], p[1], p[2], rhoRegion, 0, mm, null); zt.push(now() - t0); bes.push(r.besucht); gef.push(r.gefunden); }
    say("  Region 200 m (" + nm + ", 300 Orte): p50 " + f(quant(zt, 0.5) * 1000, 0) + " µs · p95 " + f(quant(zt, 0.95) * 1000, 0) + " µs · max " + f(Math.max(...zt) * 1000, 0) + " µs · Knoten p50 " + quant(bes, 0.5) + " · p95 " + quant(bes, 0.95) + " · Arten p50 " + quant(gef, 0.5) + " (p5 " + quant(gef, 0.05) + " · p95 " + quant(gef, 0.95) + ")");
  }
  const As = [0.04, 1, 100, 1e4, 1e5, 1e6, 1e7]; const Sb = As.map(() => 0), Kb = As.map(() => 0), Tb = As.map(() => 0); const P2 = pts.slice(0, 40);
  for (const p of P2) As.forEach((A, j) => { const rho = Math.sqrt(A / Math.PI) / R; const t0 = now(); const r = W.artenAm(p[0], p[1], p[2], rho, 0, false, null); Tb[j] += now() - t0; Sb[j] += r.gefunden; Kb[j] += r.besucht; });
  say("  Arten-Areal (40 Orte, Mittel): " + As.map((A, j) => A + " km² → S " + f(Sb[j] / P2.length, 0) + " [" + f(Tb[j] / P2.length, 2) + " ms, " + f(Kb[j] / P2.length, 0) + " Kn.]").join(" · "));
  const zsl = (a, b) => Math.log(Sb[b] / Sb[a]) / Math.log(As[b] / As[a]);
  say("  z = Δlog S / Δlog A: 0,04–1 km² " + f(zsl(0, 1)) + " · 1–10² " + f(zsl(1, 2)) + " · 10²–10⁴ " + f(zsl(2, 3)) + " · 10⁴–10⁶ " + f(zsl(3, 5)) + " · 10⁶–10⁷ " + f(zsl(5, 6)) + " (Band 0,15–0,35; Festland 0,12–0,17, Inseln ~0,25, Rosenzweig 1995)");
  const ar = []; const o = {}; for (let q = 0; q < 5000; q++) { W.blatt(Math.floor(rnd() * N), false, true, o); ar.push(Math.min(o.a, FOURPI) * R * R); }
  say("  Areal je Art [km²]: p10 " + f(quant(ar, 0.1), 0) + " · p50 " + f(quant(ar, 0.5), 0) + " · p90 " + f(quant(ar, 0.9), 0) + " · Mittel " + f(mean(ar), 0) + " (Wirbeltiere: Median ~10⁵ km², log-schief; unsicher)");
  // Zielkonflikt z ↔ Preis: mittleres Areal = sOrt·A_Planet/N; größere Areale (z im Band bei 10⁴–10⁶ km²) heißen mehr Arten je Ort
  for (const sO of [600, 2000]) { const Ws = welt("erde", N, { sOrt: sO }); const Az = [1e4, 1e5, 1e6]; const Sz = [0, 0, 0]; const tz = []; const kz = [];
    for (let q = 0; q < 10; q++) { const p = pts[200 + q]; const t0 = now(); const r0 = Ws.artenAm(p[0], p[1], p[2], rhoRegion, 0, false, null); tz.push(now() - t0); kz.push(r0.besucht); Az.forEach((A, j) => { Sz[j] += Ws.artenAm(p[0], p[1], p[2], Math.sqrt(A / Math.PI) / R, 0, false, null).gefunden; }); }
    say("  sOrt " + sO + ": Region 200 m Mittel " + f(mean(tz), 1) + " ms · " + f(mean(kz), 0) + " Knoten · z 10⁴–10⁵ " + f(Math.log(Sz[1] / Sz[0]) / Math.LN10) + " · 10⁵–10⁶ " + f(Math.log(Sz[2] / Sz[1]) / Math.LN10) + " (10 Orte)"); }
  const rhoN = Math.sqrt(1e4 / Math.PI) / R;
  const blaetter = (p, rho) => { const aus = []; W.artenAm(p[0], p[1], p[2], rho, 0, false, aus); const L = []; for (let i = 0; i < aus.length; i += 3) L.push(aus[i]); return L; };
  const nahVerw = (A, B) => { let s = 0, c = 0; for (const a of A.slice(0, 30)) { let best = Infinity; for (const b of B.slice(0, 80)) { if (a === b) { best = 0; break; } const m = 2 * W.mrca(a, b).ma; if (m < best) best = m; } if (Number.isFinite(best)) { s += best; c++; } } return c ? s / c : NaN; };
  say("  Nachbarschaft (Regionen je 10⁴ km², 40 Paare je Abstand): Jaccard · Distanz der Arten von A, die B fehlen, zum nächsten Verwandten in B");
  for (const dKm of [100, 300, 1000, 3000, 10000, -1]) {
    const J = [], D = [];
    for (let q = 0; q < 40; q++) { const p = pts[q]; const A = blaetter(p, rhoN); if (!A.length) continue;
      const B = dKm < 0 ? Array.from({ length: A.length }, () => Math.floor(rnd() * N)) : blaetter(versetzt(p, dKm / R, TAU * rnd()), rhoN); if (!B.length) continue;
      const sa = new Set(A); let inter = 0; for (const b of B) if (sa.has(b)) inter++; J.push(inter / (A.length + B.length - inter));
      const sb = new Set(B); const nurA = A.filter((a) => !sb.has(a)); const d = nahVerw(nurA, B); if (Number.isFinite(d)) D.push(d); }
    say("    " + (dKm < 0 ? "Zufallsblätter global" : "d = " + dKm + " km").padEnd(22) + " Jaccard " + f(mean(J)) + " · nächster Verwandter " + f(mean(D), 1) + " Ma (" + J.length + " Paare)");
  }
}

// ═════════════ (5) ZEIT ═════════════
{
  const N = 1e6, W = welt("erde", N); const R = R_ERDE_KM; const rho = 0.1 / R;
  say("\n(5) ZEIT  dieselbe artenAm(…, zeitMa) an derselben Region (200 m): Linien, die zur Epoche leben (alter(v) ≤ t < alter(Elter))");
  const pts = []; for (let q = 0; q < 150; q++) pts.push(zufallsPunkt(rnd(), rnd()));
  for (const t of [0, 1, 5, 20, 66, 150, 300]) {
    const zt = [], gef = [], bes = [];
    for (const p of pts) { const t0 = now(); const r = W.artenAm(p[0], p[1], p[2], rho, t, false, null); zt.push(now() - t0); gef.push(r.gefunden); bes.push(r.besucht); }
    say("  t = " + String(t).padStart(3) + " Ma: p50 " + f(quant(zt, 0.5) * 1000, 0) + " µs · p95 " + f(quant(zt, 0.95) * 1000, 0) + " µs · Knoten p50 " + quant(bes, 0.5) + " · Linien am Ort p50 " + quant(gef, 0.5));
  }
  const t0 = now(); let L = 0, kanten = 0; const st = [[0, N, W.Tm]];
  while (st.length) { const [lo, n, ma] = st.pop(); if (n === 1) continue; const k = W.spalt(lo, n);
    for (const [clo, cn] of [[lo, k], [lo + k, n - k]]) { const cma = cn === 1 ? 0 : W.alter(clo, cn, ma); L += ma - cma; kanten++; st.push([clo, cn, cma]); } }
  say("  Statistik (einmalige Aufzählung, nie Spielpfad): " + kanten + " Kanten · Σ Kantenlänge " + f(L / 1e6, 2) + "·10⁶ Linien-Ma · " + f(now() - t0, 0) + " ms");
  const mu = W.lam * GESETZ.epsilon;
  for (const D of [1, 0.1]) {
    const seitenLinien = mu * L; // tote Seitenäste auf den Kanten des rekonstruierten Baums, Rate ≈ λ·ε (Nee et al. 1994, genähert)
    const alle = L / D + seitenLinien * Math.max(1, (1 / mu) / D);
    say("  Chronospezies-Dauer " + D + " Ma (unsicher): je gelebt ≈ " + alle.toExponential(2) + " · ausgestorben " + f(100 * (1 - N / alle), 2) + " % (stammbaum#6: 10⁹ und > 99 %)");
  }
}

// ═════════════ (6) FREMDER PLANET ═════════════
{
  say("\n(6) FREMDER PLANET  planetPlan(samen).koerper → g, R (planet-core.js:307); M_max ∝ g^−3; dieselbe Funktion, andere Saat");
  const wurzeln = [];
  for (const samen of ["erde", "fremd-1", "fremd-2", "fremd-3"]) {
    const t0 = now(); const ko = samen === "erde" ? P.PLANET_ERDE : P.planetPlan(samen).koerper; const tPlan = now() - t0;
    const g = ko.g, R = ko.radiusKm;
    const W = welt(samen, 1e6, { g });
    const n = 100, norm = (n - 1) * (n - 2) / 2; const C = []; for (let s = 0; s < 30; s++) C.push(gestalt(welt(samen + "/" + s, n).spalt, n).colless / norm);
    const W4 = welt(samen, 1e4, { g, achsen: 20 }); const m = mantel(W4, Array.from({ length: 3000 }, (_, i) => i * 3), 20000, [5, 20]);
    const lg = []; const o = {}; for (let q = 0; q < 4000; q++) { W.blatt(Math.floor(rnd() * 1e6), true, false, o); lg.push(o.x[0] / Math.LN10 + 3); }
    const zt = [], ge = []; for (let q = 0; q < 60; q++) { const p = zufallsPunkt(rnd(), rnd()); const a = now(); const rr = W.artenAm(p[0], p[1], p[2], 0.1 / R, 0, false, null); zt.push(now() - a); ge.push(rr.gefunden); }
    wurzeln.push(W.spalt(0, 1e6));
    say("  " + samen.padEnd(8) + " g " + f(g, 2) + " · R " + f(R, 0) + " km · Colless(n=100, 30 Saaten) " + f(mean(C), 4) + " · Mantel r(5) " + f(m.rs[5]) + " r(20) " + f(m.rs[20]) + " · log10 M[g] Median " + f(quant(lg, 0.5), 2) + " max " + f(Math.max(...lg), 2) + " (Wand " + f(W.wandHoch / Math.LN10 + 3, 2) + ") · Region p50 " + f(quant(zt, 0.5) * 1000, 0) + " µs p95 " + f(quant(zt, 0.95) * 1000, 0) + " µs · Arten p50 " + quant(ge, 0.5) + (samen === "erde" ? "" : " · planetPlan " + f(tPlan, 0) + " ms"));
  }
  say("  Wurzel-Spaltung k je Saat: " + wurzeln.join(" · "));
}
say("\nLaufzeit gesamt " + f((now() - T0) / 1000, 1) + " s");
