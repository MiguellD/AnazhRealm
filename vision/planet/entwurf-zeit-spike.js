// Spike "Zeit zuerst": Kratone auf Schluesselbildern (Superkontinent <-> verstreut), Slerp dazwischen,
// Gebirge als Gauss-Laguerre-Strahl durch die Geschichte des Materialpunkts, Meeresspiegel aus Wasservolumen.
// Nur zum Messen der Kosten und zum Ansehen; kein Repo-Code.
"use strict";
const MIT_STRAHL = process.env.STRAHL !== "0", MIT_KOLL = process.env.KOLL !== "0";
const zlib = require("zlib"), fs = require("fs"), path = require("path");
const OUT = __dirname;

// ---- Zufall aus dem Samen: zaehlerbasiert h(samen, pfad) ----
function hash32(s) { let h = 2166136261 >>> 0; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
function mix(a, b) { let h = Math.imul(a ^ (b + 0x9e3779b9), 0x85ebca6b); h ^= h >>> 13; h = Math.imul(h, 0xc2b2ae35); h ^= h >>> 16; return h >>> 0; }
const U = (h) => h / 4294967296;
function rng(seed, pfad) { let h = mix(hash32(seed), hash32(pfad)); return () => { h = mix(h, 0x1234567); return U(h); }; }

// ---- Vektoren, Quaternionen ----
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const norm = (a) => { const l = Math.hypot(a[0], a[1], a[2]); return [a[0] / l, a[1] / l, a[2] / l]; };
const qmul = (a, b) => [a[0] * b[0] - a[1] * b[1] - a[2] * b[2] - a[3] * b[3], a[0] * b[1] + a[1] * b[0] + a[2] * b[3] - a[3] * b[2], a[0] * b[2] - a[1] * b[3] + a[2] * b[0] + a[3] * b[1], a[0] * b[3] + a[1] * b[2] - a[2] * b[1] + a[3] * b[0]];
const qconj = (q) => [q[0], -q[1], -q[2], -q[3]];
function qrot(q, v) { const p = qmul(qmul(q, [0, v[0], v[1], v[2]]), qconj(q)); return [p[1], p[2], p[3]]; }
function qaxis(ax, ang) { const s = Math.sin(ang / 2); return [Math.cos(ang / 2), ax[0] * s, ax[1] * s, ax[2] * s]; }
function qfromTo(a, b) { const c = cross(a, b), d = dot(a, b); const q = norm4([1 + d, c[0], c[1], c[2]]); return q; }
function norm4(q) { const l = Math.hypot(q[0], q[1], q[2], q[3]); return [q[0] / l, q[1] / l, q[2] / l, q[3] / l]; }
function slerp(a, b, u) {
  let d = a[0] * b[0] + a[1] * b[1] + a[2] * b[2] + a[3] * b[3];
  if (d < 0) { b = [-b[0], -b[1], -b[2], -b[3]]; d = -d; }
  if (d > 0.9995) return norm4([a[0] + u * (b[0] - a[0]), a[1] + u * (b[1] - a[1]), a[2] + u * (b[2] - a[2]), a[3] + u * (b[3] - a[3])]);
  const th = Math.acos(d), s = Math.sin(th);
  const wa = Math.sin((1 - u) * th) / s, wb = Math.sin(u * th) / s;
  return [wa * a[0] + wb * b[0], wa * a[1] + wb * b[1], wa * a[2] + wb * b[2], wa * a[3] + wb * b[3]];
}
const randDir = (r) => { const z = 2 * r() - 1, ph = 2 * Math.PI * r(), s = Math.sqrt(1 - z * z); return [s * Math.cos(ph), s * Math.sin(ph), z]; };

// ---- Rauschen auf der Kugel (Wert-Rauschen 3D, Ganzzahl-Hash) ----
function vnoise(x, y, z, k) {
  const xi = Math.floor(x), yi = Math.floor(y), zi = Math.floor(z);
  const fx = x - xi, fy = y - yi, fz = z - zi;
  const f = (t) => t * t * t * (t * (t * 6 - 15) + 10);
  const ux = f(fx), uy = f(fy), uz = f(fz);
  const g = (i, j, l) => U(mix(mix(mix(k, xi + i), yi + j), zi + l)) * 2 - 1;
  const l1 = (a, b, t) => a + (b - a) * t;
  return l1(l1(l1(g(0, 0, 0), g(1, 0, 0), ux), l1(g(0, 1, 0), g(1, 1, 0), ux), uy), l1(l1(g(0, 0, 1), g(1, 0, 1), ux), l1(g(0, 1, 1), g(1, 1, 1), ux), uy), uz);
}
const fbm = (v, k, o) => { let s = 0, a = 0.5, fr = 2; for (let i = 0; i < o; i++) { s += a * vnoise(v[0] * fr, v[1] * fr, v[2] * fr, k + i); a *= 0.5; fr *= 2; } return s; };

// ---- Der Plan aus dem Samen (Vorab-Rechnung) ----
function plan(seed) {
  const r = rng(seed, "plan");
  const nK = 7 + Math.floor(r() * 3);               // Kratone
  const nO = 5 + Math.floor(r() * 3);               // ozeanische Platten
  const kr = []; for (let i = 0; i < nK; i++) kr.push(0.26 + 0.2 * r());
  // Schluesselbilder: Wilson-Zyklus, Periode 400-550 Ma, je Zyklus: versammelt, verstreut
  const keys = []; let t = -4000; let phase = 0;
  while (t <= 1000) {
    const versammelt = phase % 2 === 0;
    const poses = [];
    if (versammelt) {
      const P = randDir(r); let tries = 0;
      const ctrs = [];
      for (let i = 0; i < nK; i++) {
        // spiral um den Pol, dicht gepackt
        const ang = 0.55 * Math.sqrt(i + 0.3) + 0.05 * r(), az = i * 2.39996 + r() * 0.3;
        const ax = norm(cross(P, Math.abs(P[2]) < 0.9 ? [0, 0, 1] : [1, 0, 0]));
        let c = qrot(qaxis(ax, ang), P); c = qrot(qaxis(P, az), c); ctrs.push(c);
      }
      for (let i = 0; i < nK; i++) poses.push(qmul(qaxis(ctrs[i], r() * 6.283), qfromTo([0, 0, 1], ctrs[i])));
    } else {
      const ctrs = [];
      for (let i = 0; i < nK; i++) { let c, ok, n = 0; do { c = randDir(r); ok = ctrs.every((d, j) => Math.acos(Math.min(1, dot(c, d))) > kr[i] + kr[j] + 0.25); n++; } while (!ok && n < 200); ctrs.push(c); }
      for (let i = 0; i < nK; i++) poses.push(qmul(qaxis(ctrs[i], r() * 6.283), qfromTo([0, 0, 1], ctrs[i])));
    }
    const oc = []; for (let j = 0; j < nO; j++) oc.push(randDir(r));
    keys.push({ t, poses, oc });
    t += (200 + 75 * r()); phase++;
  }
  // Hotspots im Mantel-Rahmen (fest)
  const hs = []; for (let i = 0; i < 12; i++) hs.push({ d: randDir(r), t0: -4000 + 5000 * r(), dur: 50 + 250 * r() });
  return { seed, nK, nO, kr, keys, hs, k: hash32(seed) };
}

// ---- Zeitscheibe: alle Platten-Lagen zu EINER Zeit (je Bild einmal, nicht je Punkt) ----
const smooth = (u) => u * u * (3 - 2 * u);
function scheibe(P, t) {
  const K = P.keys; let i = 0; let lo = 0, hi = K.length - 2;
  while (lo < hi) { const m = (lo + hi + 1) >> 1; if (K[m].t <= t) lo = m; else hi = m - 1; } i = lo;
  const a = K[i], b = K[i + 1]; const u0 = Math.max(0, Math.min(1, (t - a.t) / (b.t - a.t))); const u = smooth(u0);
  const du = 6 * u0 * (1 - u0) / (b.t - a.t); // d u / d t je Ma
  const q = [], ctr = [], inv = [], om = [];
  for (let k = 0; k < P.nK; k++) {
    const qk = slerp(a.poses[k], b.poses[k], u); q.push(qk); inv.push(qconj(qk)); ctr.push(qrot(qk, [0, 0, 1]));
    // Winkelgeschwindigkeit: Achse/Winkel von b*a^-1, mal du/dt (rad je Ma)
    let rel = qmul(b.poses[k], qconj(a.poses[k])); if (rel[0] < 0) rel = rel.map((x) => -x);
    const ang = 2 * Math.acos(Math.min(1, rel[0])); const s = Math.sqrt(Math.max(1e-12, 1 - rel[0] * rel[0]));
    om.push([rel[1] / s * ang * du, rel[2] / s * ang * du, rel[3] / s * ang * du]);
  }
  for (let j = 0; j < P.nO; j++) {
    const c = norm([a.oc[j][0] * (1 - u) + b.oc[j][0] * u, a.oc[j][1] * (1 - u) + b.oc[j][1] * u, a.oc[j][2] * (1 - u) + b.oc[j][2] * u]);
    ctr.push(c); const ax = cross(a.oc[j], b.oc[j]); const ang = Math.acos(Math.min(1, dot(a.oc[j], b.oc[j])));
    const l = Math.hypot(ax[0], ax[1], ax[2]) || 1; om.push([ax[0] / l * ang * du, ax[1] / l * ang * du, ax[2] / l * ang * du]);
  }
  return { t, q, inv, ctr, om };
}
// Kraton-Maske (im Kraton-Rahmen): 0..1
function kratonMaske(P, S, k, p) {
  const b = qrot(S.inv[k], p); const ang = Math.acos(Math.max(-1, Math.min(1, b[2])));
  const rr = P.kr[k] + 0.22 * fbm([b[0] * 1.6, b[1] * 1.6, b[2] * 1.6], P.k + 100 * k, 5);
  return Math.max(0, Math.min(1, (rr - ang) / 0.035 + 0.5));
}
function kratonRand(P, S, k, p, okt) {
  const b = qrot(S.inv[k], p); const ang = Math.acos(Math.max(-1, Math.min(1, b[2])));
  return P.kr[k] + 0.22 * fbm([b[0] * 1.6, b[1] * 1.6, b[2] * 1.6], P.k + 100 * k, okt) - ang; // >0 innen, rad
}
// Platte an p: gewichtetes Voronoi (Kratone groesser), mit Rausch-Verzug der Grenze
function platte(P, S, p) {
  const w = [p[0] + 0.08 * vnoise(p[0] * 4, p[1] * 4, p[2] * 4, P.k + 7), p[1] + 0.08 * vnoise(p[0] * 4 + 9, p[1] * 4, p[2] * 4, P.k + 7), p[2] + 0.08 * vnoise(p[0] * 4, p[1] * 4 + 9, p[2] * 4, P.k + 7)];
  let b1 = -1, d1 = 9, b2 = -1, d2 = 9;
  for (let k = 0; k < S.ctr.length; k++) {
    const sc = k < P.nK ? 1.0 / (0.6 + P.kr[k]) : 1.15;
    const d = Math.acos(Math.max(-1, Math.min(1, dot(w, S.ctr[k])))) * sc;
    if (d < d1) { d2 = d1; b2 = b1; d1 = d; b1 = k; } else if (d < d2) { d2 = d; b2 = k; }
  }
  // Konvergenz: relative Geschwindigkeit gegen die Normale zur Nachbarplatte
  const va = cross(S.om[b1], p), vb = cross(S.om[b2], p);
  const n = norm(cross(cross(p, S.ctr[b2]), p));
  const conv = (va[0] - vb[0]) * n[0] + (va[1] - vb[1]) * n[1] + (va[2] - vb[2]) * n[2]; // rad/Ma, >0 = aufeinander zu
  return { a: b1, b: b2, dist: (d2 - d1) * 0.5, conv };
}
// Gauss-Laguerre (8 Knoten): Integral_0^inf e^-s f(s) ds
const GL = { x: [0.170279632305, 0.903701776799, 2.251086629866, 4.266700170288, 7.045905402393, 10.758516010181, 15.740678641278, 22.863131736889], w: [0.369188589342, 0.418786780814, 0.175794986637, 0.033343492261, 0.002794536235, 9.07650877e-5, 8.48574672e-7, 1.04800117e-9] };
const TAU_E = 60; // Ma, Abtrag-Zeitkonstante der Gebirge
function knotenScheiben(P, t) { return GL.x.map((s) => scheibe(P, t - TAU_E * s)); }

// Hoehe in km an p zur Zeit t (S = Scheibe bei t, KS = Scheiben an den Laguerre-Knoten)
function hoehe(P, S, KS, p) {
  let kont = 0, kk = -1;
  for (let k = 0; k < P.nK; k++) { const m = kratonMaske(P, S, k, p); if (m > kont) { kont = m; kk = k; } }
  const pl = platte(P, S, p);
  const vcm = Math.abs(pl.conv) * 6371 * 0.1; // cm/a
  let h;
  // ozeanisch: Alter aus Abstand zum Ruecken / halbe Spreizrate
  let oz;
  if (pl.conv < 0) { const age = (pl.dist * 6371) / Math.max(5, vcm * 10 * 0.5); oz = -(2.6 + 0.33 * Math.sqrt(Math.min(age, 180))); }
  else { oz = -(2.6 + 0.33 * Math.sqrt(120)) - 2.5 * Math.exp(-(((pl.dist * 6371) / 120) ** 2)) * Math.min(1, vcm / 3); }
  oz += 0.25 * fbm([p[0] * 6, p[1] * 6, p[2] * 6], P.k + 55, 3);
  // kontinental: Sockel + Gebirge aus der Geschichte (Strahl durch die Zeit, im Kraton-Rahmen)
  let ko = 0.35 + 0.3 * fbm([p[0] * 5, p[1] * 5, p[2] * 5], P.k + 77, 4);
  if (MIT_STRAHL && kk >= 0 && kont > 0.01) {
    const q = qrot(S.inv[kk], p); // Materialpunkt im Kraton-Rahmen
    let oro = 0;
    for (let j = 0; j < 8; j++) {
      const T = KS[j]; const x = qrot(T.q[kk], q); // wo der Punkt zur Knotenzeit lag
      const pj = platte(P, T, x);
      if (pj.conv > 0) { const v = Math.min(12, pj.conv * 637.1); const dkm = pj.dist * 6371; oro += GL.w[j] * v * Math.exp(-(((dkm - 150) / 250) ** 2)); }
      // Kollision Kraton-Kraton: anderer Kraton nahe
      if (MIT_KOLL) for (let k = 0; k < P.nK; k++) if (k !== kk) { const e = kratonRand(P, T, k, x, 2); if (e > -0.2) oro += GL.w[j] * 3.0 * Math.exp(-((e / 0.07) ** 2)); }
    }
    ko += 0.55 * oro * (0.8 + 0.4 * fbm([q[0] * 9, q[1] * 9, q[2] * 9], P.k + 99, 4));
  }
  h = oz + (ko - oz) * kont;
  // Hotspots (Mantel-Rahmen), nur der aktive Kopf (Spike: ohne Spur)
  for (const H of P.hs) if (P._t >= H.t0 && P._t <= H.t0 + H.dur) { const d = Math.acos(Math.min(1, dot(p, H.d))) * 6371; if (d < 200) h += 3.5 * Math.exp(-((d / 70) ** 2)); }
  return h;
}
// Meeresspiegel: Wasservolumen fest -> Pegel aus der Hypsometrie (Fibonacci-Stichprobe)
function pegel(P, S, KS, n, Vw) {
  const z = new Float64Array(n);
  for (let i = 0; i < n; i++) { const y = 1 - (2 * i + 1) / n, r = Math.sqrt(1 - y * y), ph = i * 2.39996323; z[i] = hoehe(P, S, KS, [r * Math.cos(ph), y, r * Math.sin(ph)]); }
  let lo = -8, hi = 4; for (let it = 0; it < 50; it++) { const m = (lo + hi) / 2; let v = 0; for (let i = 0; i < n; i++) if (z[i] < m) v += m - z[i]; v /= n; if (v > Vw) hi = m; else lo = m; }
  let land = 0; const L = (lo + hi) / 2; for (let i = 0; i < n; i++) if (z[i] > L) land++;
  return { L, land: land / n, z };
}
// ---- PNG ohne Fremd-Pakete ----
function crc32(buf) { let c, crc = 0xffffffff; for (let n = 0; n < buf.length; n++) { c = (crc ^ buf[n]) & 0xff; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; crc = (crc >>> 8) ^ c; } return (crc ^ 0xffffffff) >>> 0; }
function chunk(type, data) { const l = Buffer.alloc(4); l.writeUInt32BE(data.length); const td = Buffer.concat([Buffer.from(type), data]); const c = Buffer.alloc(4); c.writeUInt32BE(crc32(td)); return Buffer.concat([l, td, c]); }
function png(w, h, rgb) { const raw = Buffer.alloc((w * 3 + 1) * h); for (let y = 0; y < h; y++) { raw[y * (w * 3 + 1)] = 0; rgb.copy(raw, y * (w * 3 + 1) + 1, y * w * 3, (y + 1) * w * 3); } const ih = Buffer.alloc(13); ih.writeUInt32BE(w, 0); ih.writeUInt32BE(h, 4); ih[8] = 8; ih[9] = 2; return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk("IHDR", ih), chunk("IDAT", zlib.deflateSync(raw)), chunk("IEND", Buffer.alloc(0))]); }
function farbe(z, L) {
  const d = z - L;
  if (d < 0) { const s = Math.max(0, Math.min(1, -d / 6)); return [Math.round(30 - 20 * s), Math.round(110 - 70 * s), Math.round(200 - 90 * s)]; }
  const s = Math.min(1, d / 4.5); const st = [[60, 140, 70], [160, 170, 90], [150, 110, 70], [240, 240, 240]];
  const f = s * 3, i = Math.min(2, Math.floor(f)), u = f - i; return st[i].map((c, j) => Math.round(c + (st[i + 1][j] - c) * u));
}

// ---- Lauf ----
const seed = process.argv[2] || "erde-saat-1";
const t0 = process.hrtime.bigint();
const P = plan(seed);
const tPlan = Number(process.hrtime.bigint() - t0) / 1e6;
const planBytes = P.keys.length * (P.nK * 4 + P.nO * 3) * 8 + P.hs.length * 5 * 8 + P.nK * 8;
console.log(`Saat ${seed}: Kratone ${P.nK}, ozean. Platten ${P.nO}, Schluesselbilder ${P.keys.length}, Plan ${tPlan.toFixed(2)} ms, ${planBytes} B (Float64)`);
const W = 360, H = 180;
const zeiten = (process.argv[3] || "-600,-300,0,250").split(",").map(Number);
const Vw = +(process.env.VW || 2.4); // km mittlere Wassersaeule ueber die Kugel (Erde ~ 1,37e9 km3 / 5,1e8 km2 = 2,69)
const rows = [];
for (const t of zeiten) {
  P._t = t;
  const ts = process.hrtime.bigint(); const S = scheibe(P, t); const KS = knotenScheiben(P, t); const tScheibe = Number(process.hrtime.bigint() - ts) / 1e6;
  const tp = process.hrtime.bigint(); const pg = pegel(P, S, KS, 4096, Vw); const tPeg = Number(process.hrtime.bigint() - tp) / 1e6;
  const img = Buffer.alloc(W * H * 3); const zs = new Float64Array(W * H);
  const tm = process.hrtime.bigint();
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const lat = Math.PI / 2 - (y + 0.5) / H * Math.PI, lon = (x + 0.5) / W * 2 * Math.PI - Math.PI;
    const p = [Math.cos(lat) * Math.cos(lon), Math.sin(lat), Math.cos(lat) * Math.sin(lon)];
    const z = hoehe(P, S, KS, p); zs[y * W + x] = z;
    const c = farbe(z, pg.L); // Schummerung
    img[(y * W + x) * 3] = c[0]; img[(y * W + x) * 3 + 1] = c[1]; img[(y * W + x) * 3 + 2] = c[2];
  }
  const tMap = Number(process.hrtime.bigint() - tm) / 1e6;
  // Schummerung von Westen
  for (let y = 0; y < H; y++) for (let x = 1; x < W; x++) { const g = (zs[y * W + x] - zs[y * W + x - 1]) * 18; for (let c = 0; c < 3; c++) { const i = (y * W + x) * 3 + c; img[i] = Math.max(0, Math.min(255, img[i] + g)); } }
  // Hypsometrie: Histogramm der Stichprobe, 0,5-km-Klassen
  const hist = new Array(24).fill(0); for (const z of pg.z) { const b = Math.max(0, Math.min(23, Math.floor((z + 8) / 0.5))); hist[b]++; }
  const f = path.join(OUT, `karte_${seed}_${t}.png`); fs.writeFileSync(f, png(W, H, img));
  const usPt = (tMap * 1000) / (W * H);
  rows.push({ t, pegel: pg.L.toFixed(2), land: (pg.land * 100).toFixed(1) + "%", scheibe_ms: tScheibe.toFixed(3), pegel_ms: tPeg.toFixed(1), karte_ms: tMap.toFixed(0), us_je_punkt: usPt.toFixed(2), hist: hist.map((v) => Math.round(v / 41)).join(" ") });
}
console.table(rows);
// Determinismus: dieselbe Abfrage zweimal
P._t = 0; const S0 = scheibe(P, 0), K0 = knotenScheiben(P, 0); const a = hoehe(P, S0, K0, norm([0.3, 0.4, 0.5])); const b = hoehe(P, scheibe(P, 0), knotenScheiben(P, 0), norm([0.3, 0.4, 0.5]));
console.log("gleiche Bytes:", Object.is(a, b), a);
// Driftrate: Kraton-Zentren, cm/a ueber alle Scheiben
let vmax = 0, vs = []; for (let t = -3000; t < 900; t += 10) { const S = scheibe(P, t); for (let k = 0; k < P.nK; k++) { const v = Math.hypot(...S.om[k]) * 6371e5 / 1e6; vs.push(v); vmax = Math.max(vmax, v); } }
vs.sort((x, y) => x - y); console.log(`Kraton-Drift cm/a: median ${vs[vs.length >> 1].toFixed(1)}, p95 ${vs[Math.floor(vs.length * 0.95)].toFixed(1)}, max ${vmax.toFixed(1)}`);
