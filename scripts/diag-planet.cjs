#!/usr/bin/env node
// diag-planet.cjs — Richter-Werkzeug des Kerns planet-core.js (Entscheid vision/planet/ENTSCHEID.md §3, bau1).
// node ohne Fremd-Pakete. PNG selbst geschrieben (Signatur, IHDR, IDAT über zlib.deflateSync, IEND, CRC-32 aus eigener Tafel).
//
//   --karte <samen> <zeitMa> <schicht> <breitePx> <aus.png>   eine Karte (relief | platten | alter); erde-* trägt den Erd-Schlüssel
//   --karten <samen> <zeitMa> <breitePx> <praefix>            alle drei Schichten einer Saat
//   --bildsaaten <breitePx> <ordner>                          die fünf aus dem Hash der Saat-Liste gezogenen Saaten, drei Schichten
//   --richter bau1 [--saaten N]                               Erd-Statistik über erde-01 … erde-30, Urteil je Messname
//   --kosten                                                  Kosten-Schwellen (Punkt, Platten-Zahl, Radius, Plan, Scheibe, Meer, Karte)
//   --bytes                                                   Determinismus (Absenz, Mathe-Genauigkeit, SHA über Prozesse/jitless/Reihenfolge)
//   --selbsttest                                              gepflanzte Fehler (Transzendente, gerade Küste, Facette) müssen ROT werden
//
// Eingefroren vor dem ersten Lauf (14.11.): Saat-Liste erde-01 … erde-30 mit PLANET_ERDE; 16 384 Fibonacci-Proben je Saat, fuss 40 km;
// die Schwellen unten stehen wörtlich wie im Entscheid §5 bau1. Erd-Werte (Literatur, an der Quelle zu prüfen): Land 29,2 %
// (ETOPO1-Hypsometrie: Land-Gipfel 0…1 km, Ozean-Gipfel −4…−5 km, Schelf 0…−1 km ~8,5 %, über 2 km ~3,8 %).
'use strict';
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const os = require('os');
const crypto = require('crypto');
const { execFileSync } = require('child_process');
const { Worker, isMainThread, parentPort, workerData } = require('worker_threads');

const KERN = path.join(__dirname, '..', 'planet-core.js');
const P = require(KERN);

// ── PNG ─────────────────────────────────────────────────────────────────────────────────────────────────
const CRC = (() => { const t = new Uint32Array(256); for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; } return t; })();
function crc32(buf) { let c = 0xffffffff; for (let i = 0; i < buf.length; i++) c = CRC[(c ^ buf[i]) & 0xff] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; }
function chunk(typ, daten) {
  const len = Buffer.alloc(4); len.writeUInt32BE(daten.length);
  const td = Buffer.concat([Buffer.from(typ, 'ascii'), daten]);
  const c = Buffer.alloc(4); c.writeUInt32BE(crc32(td));
  return Buffer.concat([len, td, c]);
}
function png(rgb, w, h) {
  const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4); ihdr[8] = 8; ihdr[9] = 2;
  const roh = Buffer.alloc((w * 3 + 1) * h);
  for (let y = 0; y < h; y++) { roh[y * (w * 3 + 1)] = 0; Buffer.from(rgb.buffer, rgb.byteOffset + y * w * 3, w * 3).copy(roh, y * (w * 3 + 1) + 1); }
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', ihdr), chunk('IDAT', zlib.deflateSync(roh, { level: 9 })), chunk('IEND', Buffer.alloc(0))]);
}
const sha = (b) => crypto.createHash('sha256').update(b).digest('hex');
const SAATEN = Array.from({ length: 30 }, (_, i) => 'erde-' + String(i + 1).padStart(2, '0'));

function planVon(samen, extra) {
  const koerper = /^erde-/.test(samen) ? Object.assign({}, P.PLANET_ERDE, extra || {}) : (extra || undefined);
  return P.planetPlan(samen, koerper);
}
function bildSaaten() { // Ziehung aus dem Hash der Liste (eingefroren)
  const k = P.planetHash(SAATEN.join(',')), gezogen = [];
  for (let i = 0; gezogen.length < 5; i++) { const s = SAATEN[Math.floor(P.planetZufall(k, 7, i, 0) * 30)]; if (!gezogen.includes(s)) gezogen.push(s); }
  return gezogen;
}
function median(a) { const b = [...a].sort((x, y) => x - y); const n = b.length; return n ? (n % 2 ? b[(n - 1) / 2] : 0.5 * (b[n / 2 - 1] + b[n / 2])) : NaN; }
function quantil(a, q) { const b = [...a].sort((x, y) => x - y); return b[Math.min(b.length - 1, Math.floor(q * b.length))]; }

// ── Statistik einer Saat (bau1) ────────────────────────────────────────────────────────────────────────
function hypsBimodal(hs) {
  const lo = -11, n = 30, fach = new Float64Array(n); // 0,5-km-Fächer ab −11 km
  for (const h of hs) { const i = Math.floor((h - lo) / 0.5); if (i >= 0 && i < n) fach[i]++; }
  const mitte = (i) => lo + 0.5 * i + 0.25;
  let L = -1, O = -1;
  for (let i = 0; i < n; i++) { const m = mitte(i); if (m >= -0.5 && m <= 1.0 && (L < 0 || fach[i] > fach[L])) L = i; if (m >= -5.5 && m <= -3.5 && (O < 0 || fach[i] > fach[O])) O = i; }
  const lokal = (i) => (i === 0 || fach[i] >= fach[i - 1]) && (i === n - 1 || fach[i] >= fach[i + 1]);
  let tal = Infinity; for (let i = O + 1; i < L; i++) tal = Math.min(tal, fach[i]);
  const abstand = mitte(L) - mitte(O);
  const ok = lokal(L) && lokal(O) && tal < Math.min(fach[L], fach[O]) / 3 && abstand >= 3 && abstand <= 6;
  return { ok, landGipfel: mitte(L), ozeanGipfel: mitte(O), abstand, tal: tal / Math.min(fach[L], fach[O]) };
}
function boxDimension(maske, W, H, zeilen) { // Küstenpixel (Land mit Meer-Nachbar), Box-Zählung über 2…64 px
  const k = new Uint8Array(W * H);
  for (const r of zeilen) for (let i = 0; i < W; i++) { const a = maske[r * W + i]; if (!a) continue; if (!maske[r * W + (i + 1) % W] || !maske[r * W + (i + W - 1) % W] || (r > 0 && !maske[(r - 1) * W + i]) || (r < H - 1 && !maske[(r + 1) * W + i])) k[r * W + i] = 1; }
  const xs = [], ys = [];
  for (const s of [2, 4, 8, 16, 32, 64]) {
    const box = new Set();
    for (const r of zeilen) for (let i = 0; i < W; i++) if (k[r * W + i]) box.add(Math.floor(r / s) * 100000 + Math.floor(i / s));
    if (box.size > 0) { xs.push(Math.log(1 / s)); ys.push(Math.log(box.size)); }
  }
  const n = xs.length, mx = xs.reduce((a, b) => a + b, 0) / n, my = ys.reduce((a, b) => a + b, 0) / n;
  let sxy = 0, sxx = 0; for (let i = 0; i < n; i++) { sxy += (xs[i] - mx) * (ys[i] - my); sxx += (xs[i] - mx) ** 2; }
  return sxx > 0 ? sxy / sxx : NaN;
}
function facette(paare) { // [h, hNachbar] in km
  if (!paare.length) return { anteil: 1, n: 0 };
  let ok = 0; for (const [a, b] of paare) if (Math.abs(a - b) <= 0.25) ok++;
  return { anteil: ok / paare.length, n: paare.length };
}
function spearman(a, b) {
  const rang = (v) => { const idx = v.map((x, i) => [x, i]).sort((p, q) => p[0] - q[0]); const r = new Array(v.length); idx.forEach(([, i], k) => { r[i] = k; }); return r; };
  const ra = rang(a), rb = rang(b), n = a.length; let d2 = 0; for (let i = 0; i < n; i++) d2 += (ra[i] - rb[i]) ** 2;
  return 1 - 6 * d2 / (n * (n * n - 1));
}
function komponenten(maske, W, H, gewicht) { // 8-Nachbarschaft, Längen-Umlauf
  const lab = new Int32Array(W * H).fill(-1), K = [];
  const stapel = [];
  for (let s = 0; s < W * H; s++) {
    if (!maske[s] || lab[s] >= 0) continue;
    const id = K.length, pix = []; lab[s] = id; stapel.push(s);
    while (stapel.length) {
      const p = stapel.pop(); pix.push(p); const r = Math.floor(p / W), i = p - r * W;
      for (let dr = -1; dr <= 1; dr++) for (let di = -1; di <= 1; di++) {
        const rr = r + dr; if (rr < 0 || rr >= H) continue; const ii = (i + di + W) % W, q = rr * W + ii;
        if (maske[q] && lab[q] < 0) { lab[q] = id; stapel.push(q); }
      }
    }
    let flaeche = 0; for (const p of pix) flaeche += gewicht[Math.floor(p / W)];
    K.push({ pix, flaeche });
  }
  return { lab, K };
}
function form(pix, W, H) { // Achsen über die 3D-Kovarianz der Pixel-Richtungen
  let cx = 0, cy = 0, cz = 0; const v = [];
  for (const p of pix) { const r = Math.floor(p / W), i = p - r * W; const phi = Math.PI / 2 - Math.PI * (r + 0.5) / H, lam = -Math.PI + 2 * Math.PI * (i + 0.5) / W; const x = Math.cos(phi) * Math.cos(lam), y = Math.sin(phi), z = Math.cos(phi) * Math.sin(lam); v.push([x, y, z]); cx += x; cy += y; cz += z; }
  const n = v.length; cx /= n; cy /= n; cz /= n;
  const C = [[0, 0, 0], [0, 0, 0], [0, 0, 0]];
  for (const [x, y, z] of v) { const d = [x - cx, y - cy, z - cz]; for (let a = 0; a < 3; a++) for (let b = 0; b < 3; b++) C[a][b] += d[a] * d[b] / n; }
  // Eigenwerte (symmetrisch, Jacobi)
  const A = C.map(r => r.slice());
  for (let it = 0; it < 40; it++) {
    let p = 0, q = 1; for (let a = 0; a < 3; a++) for (let b = a + 1; b < 3; b++) if (Math.abs(A[a][b]) > Math.abs(A[p][q])) { p = a; q = b; }
    if (Math.abs(A[p][q]) < 1e-18) break;
    const th = 0.5 * Math.atan2(2 * A[p][q], A[q][q] - A[p][p]), c = Math.cos(th), s = Math.sin(th);
    for (let k = 0; k < 3; k++) { const akp = A[k][p], akq = A[k][q]; A[k][p] = c * akp - s * akq; A[k][q] = s * akp + c * akq; }
    for (let k = 0; k < 3; k++) { const apk = A[p][k], aqk = A[q][k]; A[p][k] = c * apk - s * aqk; A[q][k] = s * apk + c * aqk; }
  }
  const ev = [A[0][0], A[1][1], A[2][2]].sort((a, b) => b - a);
  const l = Math.sqrt(cx * cx + cy * cy + cz * cz);
  return { verh: Math.sqrt(Math.max(ev[0], 1e-18) / Math.max(ev[1], 1e-18)), laengeRad: Math.sqrt(12 * Math.max(ev[0], 0)), mitte: [cx / l, cy / l, cz / l] };
}

function saatStatistik(samen) {
  const plan = planVon(samen), S = P.planetScheibe(plan, 0), R = plan.R;
  const N = 16384, F = P._intern.fib(N), o = {};
  const hs = [], platte = new Map(); let land = 0, schelf = 0, hoch = 0, altS = 0, altMax = 0, nOz = 0; const facP = [];
  let hoch25 = 0, hoch25Rand = 0;
  for (let i = 0; i < N; i++) {
    const x = F[3 * i], y = F[3 * i + 1], z = F[3 * i + 2];
    const h = P.planetPunktR(S, x, y, z, 40, o) / 1000; hs.push(h);
    if (h > 0) land++; else if (h > -1) schelf++;
    if (h > 2) hoch++;
    if (h > 2.5) { hoch25++; if ((o.randArt === P.RAND_ART.konvergent && o.randAbstandKm < 700) || o.orogenAlterMa > 0 && o.orogenStaerke > 0.3 || o.vulkanAbstandKm < 300) hoch25Rand++; }
    platte.set(o.platte, (platte.get(o.platte) || 0) + 1);
    if (h < 0 && o.kruste === P.KRUSTE.ozean) { altS += o.ozeanAlterMa; altMax = Math.max(altMax, o.ozeanAlterMa); nOz++; }
    if (h < -3 && o.kruste === P.KRUSTE.ozean && o.randAbstandKm > 300 && o.vulkanAbstandKm > 300 && o.kont < -300) { // fern von Rand, Vulkan und Kontinentalrand
      // Nachbar-Pixel 40 km nach Osten
      const lam = Math.atan2(z, x), phi = Math.asin(y), dl = 40 / (R * Math.max(0.05, Math.cos(phi)));
      const o2 = {}; const h2 = P.planetPunkt(S, phi, lam + dl, 40, o2) / 1000;
      if (o2.kruste === P.KRUSTE.ozean) facP.push([h, h2]); // Nachbar auf Kruste = Kontinentalrand, keine Facette
    }
  }
  const anteile = [...platte.values()].map(v => v / N).sort((a, b) => b - a);
  // Gitter 512×256 für Gürtel und Kontinente
  const W = 512, H = 256, hg = new Float32Array(W * H), ak = new Uint8Array(W * H), kr = new Uint8Array(W * H), pl = new Int16Array(W * H), gew = new Float64Array(H);
  const pixKm2 = (2 * Math.PI * R / W) * (Math.PI * R / H);
  for (let r = 0; r < H; r++) {
    const phi = Math.PI / 2 - Math.PI * (r + 0.5) / H; gew[r] = pixKm2 * Math.cos(phi);
    for (let i = 0; i < W; i++) { const lam = -Math.PI + 2 * Math.PI * (i + 0.5) / W; hg[r * W + i] = P.planetPunkt(S, phi, lam, 40, o) / 1000; kr[r * W + i] = o.kruste; pl[r * W + i] = o.platte; ak[r * W + i] = o.orogenAktiv; }
  }
  const hochM = new Uint8Array(W * H); for (let p = 0; p < W * H; p++) hochM[p] = hg[p] > 1.5 ? 1 : 0;
  const G = komponenten(hochM, W, H, gew);
  let fGes = 0, fLang = 0, fLangKont = 0;
  const guertel = [];
  for (const k of G.K) {
    if (k.flaeche < 5e4) continue; fGes += k.flaeche;
    const f = form(k.pix, W, H); guertel.push({ ...f, k });
    if (f.verh >= 4) { fLang += k.flaeche; for (const p of k.pix) if (kr[p] === P.KRUSTE.kontinent) fLangKont += gew[Math.floor(p / W)]; }
  }
  const landM = new Uint8Array(W * H); for (let p = 0; p < W * H; p++) landM[p] = hg[p] > 0 ? 1 : 0;
  const L = komponenten(landM, W, H, gew);
  let kontGross = 0, kontMitGuertel = 0, vornN = 0, vornOk = 0, alleN = 0, alleOk = 0;
  for (const k of L.K) {
    if (k.flaeche < 3e6) continue; kontGross++;
    const geb = k.pix.filter(p => hg[p] > 1.5);
    if (geb.length) { const f = form(geb, W, H); const gm = G.lab; const ids = new Set(geb.map(p => gm[p]));
      let lang = 0; for (const id of ids) { const g = guertel.find(gg => gg.k === G.K[id]); if (g) lang = Math.max(lang, g.laengeRad * R); }
      if (lang >= 1000) kontMitGuertel++; void f; }
    // gebirge.vorn: Kontinent mit aktivem Rand (konvergenter Rand an seiner Küste)
    const plCount = new Map(); for (const p of k.pix) plCount.set(pl[p], (plCount.get(pl[p]) || 0) + 1);
    const pid = [...plCount.entries()].sort((a, b) => b[1] - a[1])[0][0];
    const fk = form(k.pix, W, H); const c = fk.mitte;
    const om = [S.pom[3 * pid], S.pom[3 * pid + 1], S.pom[3 * pid + 2]];
    const v = [om[1] * c[2] - om[2] * c[1], om[2] * c[0] - om[0] * c[2], om[0] * c[1] - om[1] * c[0]];
    const gebA = geb.filter(p => ak[p]); // aktiver Gürtel: die lebende Rand-Schablone trägt die Höhe
    if (Math.hypot(...v) > 1e-9) {
      if (gebA.length) { const gb = form(gebA, W, H).mitte; const d = [gb[0] - c[0], gb[1] - c[1], gb[2] - c[2]]; vornN++; if (d[0] * v[0] + d[1] * v[1] + d[2] * v[2] > 0) vornOk++; }
      if (geb.length) { const gb = form(geb, W, H).mitte; const d = [gb[0] - c[0], gb[1] - c[1], gb[2] - c[2]]; alleN++; if (d[0] * v[0] + d[1] * v[1] + d[2] * v[2] > 0) alleOk++; }
    }
  }
  // Vulkane, Küste: Gitter 2048×1024
  const W2 = 2048, H2 = 1024, maske = new Uint8Array(W2 * H2), ids = new Map();
  const fuss2 = 2 * Math.PI * R / W2;
  for (let r = 0; r < H2; r++) {
    const phi = Math.PI / 2 - Math.PI * (r + 0.5) / H2;
    for (let i = 0; i < W2; i++) {
      const lam = -Math.PI + 2 * Math.PI * (i + 0.5) / W2; const h = P.planetPunkt(S, phi, lam, Math.max(16, fuss2 * 0.8), o);
      maske[r * W2 + i] = h > 0 ? 1 : 0;
      if (o.vulkanArt && o.vulkanAbstandKm < fuss2 * 0.75) { const a = ids.get(o.vulkanId); if (!a || o.vulkanAbstandKm < a.d) ids.set(o.vulkanId, { d: o.vulkanAbstandKm, art: o.vulkanArt, aktiv: o.vulkanAktiv, alter: o.vulkanAlterMa, phi, lam, kr: o.kruste, h: h / 1000 }); }
    }
  }
  const zeilen = []; for (let r = 0; r < H2; r++) { const phi = 90 - 180 * (r + 0.5) / H2; if (Math.abs(phi) < 60) zeilen.push(r); }
  const dim = boxDimension(maske, W2, H2, zeilen);
  let aktiv = 0; const ketten = new Map();
  for (const [id, v] of ids) {
    if (v.aktiv) aktiv++;
    if (v.art === P.VULKAN_ART.hotspot) { const h = Math.floor((id - 800000000) / 10000); if (!ketten.has(h)) ketten.set(h, []); ketten.get(h).push(v); }
  }
  const rhos = []; let kettenOzean = 0;
  for (const [, vs] of ketten) {
    if (vs.length < 5) continue;
    const jung = vs.reduce((a, b) => (a.alter <= b.alter ? a : b));
    const ab = vs.map(v => Math.acos(Math.max(-1, Math.min(1, Math.cos(v.phi) * Math.cos(jung.phi) * Math.cos(v.lam - jung.lam) + Math.sin(v.phi) * Math.sin(jung.phi)))));
    rhos.push(spearman(vs.map(v => v.alter), ab));
    if (vs.filter(v => v.kr === P.KRUSTE.ozean).length >= vs.length / 2) kettenOzean++;
  }
  // Meer: Volumen an 65 536 unabhängigen Proben; +0,5 km Wasser über fünf Stufen
  const N3 = 65536, F3 = P._intern.fib(N3); let wasser = 0;
  for (let i = 0; i < N3; i++) { const h = P.planetPunktR(S, F3[3 * i], F3[3 * i + 1], F3[3 * i + 2], 40) / 1000; if (h < 0) wasser -= h; }
  wasser /= N3;
  const stufen = [0, 0.5, 1, 1.5, 2].map(z => P.planetMeer(plan, 0, z).landAnteil);
  let monoton = true; for (let i = 1; i < stufen.length; i++) if (!(stufen[i] < stufen[i - 1])) monoton = false;
  return {
    samen, nP: S.nP, hyps: hypsBimodal(hs), land: land / N, schelf: schelf / N, hoch: hoch / N,
    platten: { n: anteile.length, ueber5: anteile.filter(a => a > 0.05).length, groesste: anteile[0] },
    guertel: { lang: fGes ? fLang / fGes : 0, kont: fLang ? fLangKont / fLang : 0, kontGross, kontMitGuertel, flaeche: fGes },
    vorn: { n: vornN, ok: vornOk, alleN, alleOk },
    ozeanAlter: { mittel: nOz ? altS / nOz : 0, max: altMax },
    facette: facette(facP), kueste: dim, vulkane: aktiv, ketten: { n: rhos.length, median: rhos.length ? median(rhos) : NaN, ozean: kettenOzean },
    meer: { abweichung: Math.abs(wasser - plan.koerper.wasserKm) / plan.koerper.wasserKm, stufen, monoton },
    hoch25: hoch25 ? hoch25Rand / hoch25 : 1,
  };
}

function urteilBau1(R) {
  const n = R.length, z = (f) => R.filter(f).length, med = (f) => median(R.map(f));
  const U = [];
  const zeile = (name, ok, wert, schwelle) => U.push({ name, urteil: ok ? 'GRÜN' : 'ROT', wert, schwelle });
  zeile('hyps.bimodal', z(r => r.hyps.ok) >= Math.ceil(0.9 * n), z(r => r.hyps.ok) + '/' + n + ' (Abstand Median ' + med(r => r.hyps.abstand).toFixed(2) + ' km)', '≥ 27/30');
  zeile('land.anteil', Math.abs(med(r => r.land) - 0.29) <= 0.04 && z(r => r.land >= 0.2 && r.land <= 0.38) === n, 'Median ' + (100 * med(r => r.land)).toFixed(1) + ' %, Band ' + (100 * Math.min(...R.map(r => r.land))).toFixed(1) + '–' + (100 * Math.max(...R.map(r => r.land))).toFixed(1) + ' %', '29 ± 4 %, jede 20–38 %');
  zeile('schelf.anteil', med(r => r.schelf) >= 0.04 && med(r => r.schelf) <= 0.12, 'Median ' + (100 * med(r => r.schelf)).toFixed(1) + ' %', '4–12 %');
  zeile('hoch.anteil', med(r => r.hoch) >= 0.01 && med(r => r.hoch) <= 0.05, 'Median ' + (100 * med(r => r.hoch)).toFixed(2) + ' %', '1–5 %');
  zeile('platten.zahl', z(r => r.platten.n >= 8 && r.platten.n <= 20 && r.platten.ueber5 >= 3 && r.platten.groesste <= 0.35) === n, z(r => r.platten.n >= 8 && r.platten.n <= 20 && r.platten.ueber5 >= 3 && r.platten.groesste <= 0.35) + '/' + n + ' (Zahl ' + Math.min(...R.map(r => r.platten.n)) + '–' + Math.max(...R.map(r => r.platten.n)) + ', größte max ' + (100 * Math.max(...R.map(r => r.platten.groesste))).toFixed(1) + ' %)', '8–20, ≥ 3 über 5 %, größte ≤ 35 %, jede Saat');
  const kg = R.reduce((a, r) => a + r.guertel.kontGross, 0), km = R.reduce((a, r) => a + r.guertel.kontMitGuertel, 0);
  zeile('gebirge.guertel', med(r => r.guertel.lang) >= 0.7 && med(r => r.guertel.kont) >= 0.6 && km >= 0.7 * kg, 'lang ' + (100 * med(r => r.guertel.lang)).toFixed(0) + ' %, auf Kontinent ' + (100 * med(r => r.guertel.kont)).toFixed(0) + ' %, Kontinente mit Gürtel ≥ 1000 km ' + km + '/' + kg, '≥ 70 % · ≥ 60 % · ≥ 70 %');
  const vn = R.reduce((a, r) => a + r.vorn.n, 0), vo = R.reduce((a, r) => a + r.vorn.ok, 0);
  const an = R.reduce((a, r) => a + r.vorn.alleN, 0), ao = R.reduce((a, r) => a + r.vorn.alleOk, 0);
  zeile('gebirge.vorn', vn > 0 && vo >= 0.8 * vn, 'aktiver Gürtel vorn ' + vo + '/' + vn + ' (' + (vn ? (100 * vo / vn).toFixed(0) : '–') + ' %); alle Gürtel inkl. Gedächtnis ' + ao + '/' + an + ' (' + (an ? (100 * ao / an).toFixed(0) : '–') + ' %)', '≥ 80 %');
  zeile('ozean.alter', R.every(r => r.ozeanAlter.max <= 200) && med(r => r.ozeanAlter.mittel) >= 40 && med(r => r.ozeanAlter.mittel) <= 90, 'Mittel Median ' + med(r => r.ozeanAlter.mittel).toFixed(1) + ' Ma, Max ' + Math.max(...R.map(r => r.ozeanAlter.max)).toFixed(1) + ' Ma', 'Mittel 40–90, Max ≤ 200');
  zeile('ozean.facette', med(r => r.facette.anteil) >= 0.995, 'Median ' + (100 * med(r => r.facette.anteil)).toFixed(2) + ' %, schlechteste ' + (100 * Math.min(...R.map(r => r.facette.anteil))).toFixed(2) + ' %', '≥ 99,5 %');
  zeile('kueste.dimension', med(r => r.kueste) >= 1.15 && med(r => r.kueste) <= 1.35, 'Median ' + med(r => r.kueste).toFixed(3), '1,15–1,35');
  zeile('vulkan.zahl', med(r => r.vulkane) >= 300 && med(r => r.vulkane) <= 3000 && z(r => r.vulkane >= 300 && r.vulkane <= 3000) === n, 'Median ' + med(r => r.vulkane) + ', Band ' + Math.min(...R.map(r => r.vulkane)) + '–' + Math.max(...R.map(r => r.vulkane)), '300–3 000 je Saat');
  zeile('vulkan.kette', med(r => r.ketten.median) >= 0.8 && z(r => r.ketten.ozean >= 3) === n, 'Spearman Median ' + med(r => r.ketten.median).toFixed(3) + ', Saaten mit ≥ 3 Ozean-Ketten ' + z(r => r.ketten.ozean >= 3) + '/' + n, '≥ 0,8; ≥ 3 je Saat');
  zeile('meer.volumen', R.every(r => r.meer.abweichung <= 0.01) && R.every(r => r.meer.monoton), 'Abweichung max ' + (100 * Math.max(...R.map(r => r.meer.abweichung))).toFixed(2) + ' %, monoton ' + z(r => r.meer.monoton) + '/' + n, '≤ 1 %, monoton');
  U.push({ name: '(Tautologie) hoch>2,5 km an Rand/Naht/Vulkan', urteil: 'INFO', wert: (100 * med(r => r.hoch25)).toFixed(1) + ' %', schwelle: 'per Bau' });
  return U;
}

// ── bau2: Klima und Biome ──────────────────────────────────────────────────────────────────────────────
// Eingefroren vor dem ersten Lauf (14.11.): Schwellen wörtlich wie im Entscheid §5 bau2. Erd-Werte (Literatur, an der Quelle zu
// prüfen): Köppen-Anteile der Landfläche A 19,0 · B 30,2 · C 13,4 · D 24,6 · E 12,8 % (Peel et al. 2007).
// Definitionen dieses Werkzeugs (vor dem Lauf gesetzt): Kamm = Hülle > 2 km und ≥ Hülle 150 km östlich und westlich, Breite in
// den Westwind-Breiten [Zellrand, 2·Zellrand]; Luv/Lee = Niederschlag 300 km west/östlich (beide auf Land); Küste = 0…300 km
// landein, Seite aus meerWest (±0,5); „Regen ohne Feuchtequelle“ = N ≥ 1 500 mm ohne Meer in den sechs Schritten luvwärts;
// „Wüste“ = BW; Eis = Biom-Feld eis ≠ 0 (Schild EF oder Meereis).
const KOEPPEN_FAELLE = [ // [Name, tSommer, tWinter, tJahr, N, Sommer-Anteil, erwartet] — Klima-Normalwerte, gerundet (Literatur-Lage)
  ['Singapur', 28, 27, 27.5, 2340, 0.5, 'Af'], ['Kairo', 28, 14, 21.5, 25, 0.3, 'BWh'], ['London', 18, 5, 11.5, 600, 0.5, 'Cfb'],
  ['Moskau', 19, -7, 6, 700, 0.6, 'Dfb'], ['Rom', 24.5, 8, 16, 800, 0.3, 'Csa'], ['Antarktis', -25, -60, -45, 50, 0.5, 'EF'],
  ['Jakutsk', 19, -39, -8, 240, 0.7, 'Dfd'], ['Darwin', 30, 25, 28, 1700, 0.95, 'Aw'], ['Spitzbergen', 6, -14, -5, 400, 0.5, 'ET'],
];
function koeppenLinse(biomFn) {
  let falsch = 0; const o = {};
  for (const [, tS, tW, tJ, N, sa, soll] of KOEPPEN_FAELLE) { biomFn({ tSommerC: tS, tWinterC: tW, tJahrC: tJ, niederschlagMm: N, sommerAnteil: sa }, 100, o); if (P.KOEPPEN[o.koeppen] !== soll) falsch++; }
  return falsch;
}
function farbSprungBei(farbFn, dT, dN) { // größter RGB-Sprung je Schritt (dT, dN) über −30…35 °C × 0…4 000 mm
  const a = new Float64Array(3), b = new Float64Array(3); let mx = 0;
  const d = () => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
  for (let T = -30; T <= 35; T += 1) { farbFn(T, T + 10, 0, a); for (let N = dN; N <= 4000; N += dN) { farbFn(T, T + 10, N, b); mx = Math.max(mx, d()); a.set(b); } }
  for (let N = 0; N <= 4000; N += 100) { farbFn(-30, -20, N, a); for (let T = -30 + dT; T <= 35; T += dT) { farbFn(T, T + 10, N, b); mx = Math.max(mx, d()); a.set(b); } }
  return mx;
}
// stetig heißt: der größte Sprung schrumpft mit der Schrittweite (Viertel-Schritt ≤ ½ Sprung + 0,5); eine Stufe bleibt stehen
function farbSprung(farbFn) { const g = farbSprungBei(farbFn, 0.2, 20), f = farbSprungBei(farbFn, 0.05, 5); return { grob: g, fein: f, stetig: f <= 0.5 * g + 0.5 }; }
function wechselAnteil(seitenA, seitenB) { let n = 0, w = 0; for (let i = 0; i < seitenA.length; i++) { if (!seitenA[i] || !seitenB[i]) continue; n++; if (seitenA[i] !== seitenB[i]) w++; } return { n, w, anteil: n ? w / n : 0 }; }
function widerspruchZaehlen(K, B, land) {
  return { eisWarm: B.eis !== 0 && K.tSommerC > 5 ? 1 : 0, wuesteNass: (B.koeppen === 3 || B.koeppen === 4) && K.niederschlagMm > 1500 ? 1 : 0, regenOhneMeer: land && K.niederschlagMm >= 1500 && !K.meerLuv ? 1 : 0 };
}
function versatz(x, y, z, ostKm, R, out) { // ostKm entlang des Breitenkreis-Tangenten
  const c = Math.hypot(x, z) || 1e-12, ex = -z / c, ez = x / c, a = ostKm / R, ca = Math.cos(a), sa = Math.sin(a);
  out[0] = ca * x + sa * ex; out[1] = ca * y; out[2] = ca * z + sa * ez; return out;
}

function saatKlima(samen) {
  const plan = planVon(samen), S = P.planetScheibe(plan, 0), R = plan.R, G = P.planetKlimaGlobal(plan, 0);
  const planG = planVon(samen, { drehsinn: -1 }), SG = P.planetScheibe(planG, 0);
  const N = 16384, F = P._intern.fib(N), o = {}, K = {}, B = {}, o2 = {}, K2 = {}, q = new Float64Array(3);
  let land = 0, eis = 0; const haupt = [0, 0, 0, 0, 0], kc = new Array(30).fill(0), wsp = { eisWarm: 0, wuesteNass: 0, regenOhneMeer: 0 };
  let wkL = 0, wkB = 0, auL = 0, auB = 0, leeL = 0, leeB = 0, luvL = 0, luvB = 0;
  const west = [], ost = [];
  const kaemme = [];
  const w = G.zellBreite;
  const pBei = (SS, x, y, z, oo, KK) => { const h = P.planetPunktR(SS, x, y, z, 40, oo); P.planetKlimaR(SS, x, y, z, -1, KK, oo); return h > 0 ? KK.niederschlagMm : NaN; };
  const art = { hochflaeche: 0, leeSchwach: 0, luvBeschattet: 0, sonst: 0 };
  for (let i = 0; i < N; i++) {
    const x = F[3 * i], y = F[3 * i + 1], z = F[3 * i + 2];
    const h = P.planetPunktR(S, x, y, z, 40, o); P.planetKlimaR(S, x, y, z, -1, K, o); P.planetBiom(K, h, B);
    const ist = h > 0; const lat = Math.asin(y), al = Math.abs(lat);
    if (B.eis) eis++;
    const ws = widerspruchZaehlen(K, B, ist); wsp.eisWarm += ws.eisWarm; wsp.wuesteNass += ws.wuesteNass; wsp.regenOhneMeer += ws.regenOhneMeer;
    if (!ist) continue;
    land++; haupt[B.hauptklasse]++; kc[B.koeppen]++;
    const istB = B.hauptklasse === 1;
    if (al >= 15 * Math.PI / 180 && al <= 35 * Math.PI / 180) { wkL++; if (istB) wkB++; } else { auL++; if (istB) auB++; }
    if (K.lee > 0.5) { leeL++; if (istB) leeB++; } else if (K.lee < 0.1) { luvL++; if (istB) luvB++; }
    if (al >= 15 * Math.PI / 180 && al <= 35 * Math.PI / 180 && o.kont >= 0 && o.kont <= 300) { if (K.meerWest > 0.5) west.push(K.niederschlagMm); else if (K.meerWest < -0.5) ost.push(K.niederschlagMm); }
    if (al >= w && al <= 2 * w) {
      const hh = P.planetHuelle(S, x, y, z);
      if (hh > 2) {
        versatz(x, y, z, 150, R, q); const he = P.planetHuelle(S, q[0], q[1], q[2]); versatz(x, y, z, -150, R, q); const hw = P.planetHuelle(S, q[0], q[1], q[2]);
        if (hh >= he && hh >= hw) kaemme.push([x, y, z, hh]);
      }
    }
  }
  // Kämme: Luv/Lee und Gegenlauf
  let kN = 0, kOk = 0; const seiteA = [], seiteB = [];
  for (const [x, y, z, hk] of kaemme) {
    versatz(x, y, z, -300, R, q); const pw = pBei(S, q[0], q[1], q[2], o2, K2), leeW = K2.lee, pwG = pBei(SG, q[0], q[1], q[2], o2, K2);
    versatz(x, y, z, 300, R, q); const pe = pBei(S, q[0], q[1], q[2], o2, K2), leeE = K2.lee, hE = P.planetHuelle(S, q[0], q[1], q[2]), peG = pBei(SG, q[0], q[1], q[2], o2, K2);
    if (!(pw > 0 && pe > 0)) { seiteA.push(0); seiteB.push(0); continue; }
    kN++; if (pw / pe >= 2) kOk++;                       // Drehsinn +1: Westwind, Luv im Westen
    else if (hE > hk - 1) art.hochflaeche++; else if (leeE < 0.3) art.leeSchwach++; else if (leeW > 0.3) art.luvBeschattet++; else art.sonst++;
    seiteA.push(pw > pe ? 1 : -1); seiteB.push(pwG > peG ? 1 : -1);  // +1: trockene Seite im Osten
  }
  const gl = wechselAnteil(seiteA, seiteB);
  return {
    samen, land: land / N, eis: eis / N, haupt: haupt.map(v => v / Math.max(1, land)), koeppen: kc.map(v => v / Math.max(1, land)), widerspruch: wsp,
    wendekreisB: wkL ? wkB / wkL : 0, aussenB: auL ? auB / auL : 0, leeB: leeL ? leeB / leeL : 0, luvB: luvL ? luvB / luvL : 0, leeN: leeL,
    kueste: { west: west.length, ost: ost.length, verh: west.length >= 5 && ost.length >= 5 ? median(west) / median(ost) : NaN },
    kamm: { n: kN, ok: kOk, roh: kaemme.length, art }, gegenlauf: gl,
  };
}
function urteilBau2(R) {
  const n = R.length, med = (f) => median(R.map(f)), z = (f) => R.filter(f).length;
  const U = []; const zeile = (name, ok, wert, schwelle) => U.push({ name, urteil: ok ? 'GRÜN' : 'ROT', wert, schwelle });
  const G = P.planetKlimaGlobal(planVon('erde-01'), 0), grad = G.tAequatorC - G.tPolC, had = G.zellBreite * 180 / Math.PI;
  zeile('klima.global', Math.abs(G.tMittelC - 14) <= 3 && G.tAequatorC >= 24 && G.tAequatorC <= 30 && grad >= 35 && grad <= 55 && Math.abs(had - 30) <= 4,
    'Mittel ' + G.tMittelC.toFixed(1) + ' °C, Äquator ' + G.tAequatorC.toFixed(1) + ' °C, Pol ' + G.tPolC.toFixed(1) + ' °C (Gefälle ' + grad.toFixed(1) + ' K), Hadley-Rand ' + had.toFixed(1) + '°, Zellen ' + G.zellen + ', Eis-Linie ' + (G.eisBreite * 180 / Math.PI).toFixed(1) + '°', '14 ± 3 · 24–30 · 35–55 K · 30 ± 4°');
  const BAND = [['A', 0.095, 0.285], ['B', 0.15, 0.45], ['C', 0.067, 0.20], ['D', 0.123, 0.37], ['E', 0.064, 0.192]];
  const hm = [0, 1, 2, 3, 4].map(i => med(r => r.haupt[i]));
  zeile('klima.koeppen', BAND.every(([, lo, hi], i) => hm[i] >= lo && hm[i] <= hi), BAND.map(([k], i) => k + ' ' + (100 * hm[i]).toFixed(1)).join(' · ') + ' %', 'A 9,5–28,5 · B 15–45 · C 6,7–20 · D 12,3–37 · E 6,4–19,2 %');
  zeile('klima.wueste', z(r => r.haupt[1] <= 0.45) >= Math.ceil(0.9 * n), 'B ≤ 45 % in ' + z(r => r.haupt[1] <= 0.45) + '/' + n + ' (B Median ' + (100 * hm[1]).toFixed(1) + ' %, max ' + (100 * Math.max(...R.map(r => r.haupt[1]))).toFixed(1) + ' %)', '≥ 27/30');
  const kN = R.reduce((a, r) => a + r.kamm.n, 0), kO = R.reduce((a, r) => a + r.kamm.ok, 0);
  zeile('klima.regenschatten', kN > 0 && kO >= 0.8 * kN, 'Luv/Lee ≥ 2:1 an ' + kO + '/' + kN + ' Kamm-Abschnitten (' + (kN ? (100 * kO / kN).toFixed(0) : '–') + ' %)', '≥ 80 %');
  const sa = (k) => R.reduce((a, r) => a + r.kamm.art[k], 0);
  U.push({ name: 'regenschatten.fehlt', urteil: 'INFO', wert: 'Ost-Probe noch auf Kamm-Höhe (Hochfläche) ' + sa('hochflaeche') + ' · Lee schwach (lee < 0,3) ' + sa('leeSchwach') + ' · Luv-Seite selbst beschattet ' + sa('luvBeschattet') + ' · sonst ' + sa('sonst'), schwelle: 'Summe der ROT-Abschnitte' });
  const gN = R.reduce((a, r) => a + r.gegenlauf.n, 0), gW = R.reduce((a, r) => a + r.gegenlauf.w, 0);
  zeile('klima.gegenlauf', gN > 0 && gW >= 0.8 * gN, 'trockene Seite wechselt an ' + gW + '/' + gN + ' (' + (gN ? (100 * gW / gN).toFixed(0) : '–') + ' %) mit drehsinn = −1', '≥ 80 %');
  const vs = R.map(r => r.kueste.verh).filter(v => Number.isFinite(v));
  zeile('klima.kuestenseite', vs.length > 0 && median(vs) <= 0.6, 'N West/Ost 15–35° Median ' + (vs.length ? median(vs).toFixed(2) : '–') + ' über ' + vs.length + ' Saaten', '≤ 0,6');
  zeile('klima.eis', med(r => r.eis) >= 0.03 && med(r => r.eis) <= 0.15, 'Median ' + (100 * med(r => r.eis)).toFixed(1) + ' % der Kugel, Band ' + (100 * Math.min(...R.map(r => r.eis))).toFixed(1) + '–' + (100 * Math.max(...R.map(r => r.eis))).toFixed(1) + ' %', '3–15 %');
  const ws = R.reduce((a, r) => ({ eisWarm: a.eisWarm + r.widerspruch.eisWarm, wuesteNass: a.wuesteNass + r.widerspruch.wuesteNass, regenOhneMeer: a.regenOhneMeer + r.widerspruch.regenOhneMeer }), { eisWarm: 0, wuesteNass: 0, regenOhneMeer: 0 });
  zeile('klima.widerspruch', ws.eisWarm + ws.wuesteNass + ws.regenOhneMeer === 0, 'Eis bei tSommer > 5 °C ' + ws.eisWarm + ' (per Bau) · Wüste > 1 500 mm ' + ws.wuesteNass + ' (per Bau) · Regen ohne Meer luvwärts ' + ws.regenOhneMeer + ' (per Bau: Rückführung ≤ 0,5 × Gürtel ≤ 1 425 mm, Hub nur auf Meeres-Feuchte; ' + n + ' × 16 384 Proben)', '0');
  U.push({ name: 'wueste.wendekreis', urteil: 'INFO', wert: 'B-Anteil des Landes 15–35° ' + (100 * med(r => r.wendekreisB)).toFixed(0) + ' %, übrige Breiten ' + (100 * med(r => r.aussenB)).toFixed(0) + ' %', schwelle: 'Median' });
  U.push({ name: 'wueste.lee', urteil: 'INFO', wert: 'B-Anteil im Lee (lee > 0,5) ' + (100 * med(r => r.leeB)).toFixed(0) + ' %, ohne Schatten (lee < 0,1) ' + (100 * med(r => r.luvB)).toFixed(0) + ' %', schwelle: 'Median' });
  const kcm = P.KOEPPEN.map((k, i) => [k, med(r => r.koeppen[i])]).filter(([, v]) => v >= 0.005).map(([k, v]) => k + ' ' + (100 * v).toFixed(1));
  U.push({ name: 'klima.koeppen.klassen', urteil: 'INFO', wert: kcm.join(' · ') + ' % (Median, ≥ 0,5 %)', schwelle: '' });
  return U;
}

// ── bau3: die Zeit t und die Brücke ────────────────────────────────────────────────────────────────────
// Eingefroren vor dem ersten Lauf (14.11.): Schwellen wörtlich wie im Entscheid §5 bau3. Definitionen dieses Werkzeugs: Material-
// punkt = Ort im Rahmen einer Scholle (Mitte0 + bis 1,2 Radien), zur Zeit t mit der Lage der Scholle in die Welt gedreht; Drift =
// |ω_g × Schwerpunkt_g|·R je Kontinent-Gruppe; Küsten-Versatz = gerichteter Hausdorff-Abstand der Küsten-Pixel (Karte 512×256,
// |Breite| < 70°) zwischen t und t + 1 Ma; Zyklus von meer.zeit = die 20 Fächer −190 … 0 Ma; Superkontinent = Anteil der größten
// Land-Komponente am Land (512×256) am versammelten Schlüsselbild nächst t = 0.
const ZEITEN = [0, -50, -100, -200, 50];
function ortGesetzAusGelaende() { // der Aufrufer baut das Ort-Gesetz aus den Exporten von gelaende-core (gelesen, nie kopiert)
  require(path.join(__dirname, '..', 'gelaende-core.js')); const G = globalThis.__gelaendeCore;
  if (!G || !G.LANDFORM_REGLER) throw new Error('gelaende-core: Exporte fehlen');
  return { kuehlungKJeM: G.TEMPERATUR.sommer / ((G.SCHNEE.start + G.SCHNEE.voll) / 2), meerUnterBasisM: G.LAGE_GRUND.meerUnterBasis,
    regler: G.LANDFORM_REGLER, klimaHeute: Object.assign({}, G.TEMPERATUR, { spendeMm: G.PEGEL.spende * 1000 * 365.25 }) };
}
function qRot(q, o, x, y, z) { const qx = q[o], qy = q[o + 1], qz = q[o + 2], qw = q[o + 3]; const tx = 2 * (qy * z - qz * y), ty = 2 * (qz * x - qx * z), tz = 2 * (qx * y - qy * x); return [x + qw * tx + (qy * tz - qz * ty), y + qw * ty + (qz * tx - qx * tz), z + qw * tz + (qx * ty - qy * tx)]; }
function materialPunkte(plan, n, saat) {
  const k = P.planetHash(saat), M = [];
  for (let i = 0; i < n; i++) {
    const s = Math.floor(P.planetZufall(k, 1, i, 0) * plan.nS), m = [plan.schollen[8 * s], plan.schollen[8 * s + 1], plan.schollen[8 * s + 2]];
    const r = plan.schollen[8 * s + 3] * 1.2 * Math.sqrt(P.planetZufall(k, 2, i, 0));
    const a = Math.abs(m[0]) < 0.9 ? [1, 0, 0] : [0, 1, 0]; let e1 = [m[1] * a[2] - m[2] * a[1], m[2] * a[0] - m[0] * a[2], m[0] * a[1] - m[1] * a[0]]; const l = Math.hypot(...e1); e1 = e1.map(v => v / l);
    const e2 = [m[1] * e1[2] - m[2] * e1[1], m[2] * e1[0] - m[0] * e1[2], m[0] * e1[1] - m[1] * e1[0]], th = 2 * Math.PI * P.planetZufall(k, 3, i, 0);
    const d = [0, 1, 2].map(c => Math.cos(th) * e1[c] + Math.sin(th) * e2[c]);
    M.push([s, ...[0, 1, 2].map(c => Math.cos(r) * m[c] + Math.sin(r) * d[c])]);
  }
  return M;
}
function materialHoehen(plan, M, t) { const S = P.planetScheibe(plan, t); return M.map(([s, x, y, z]) => P.planetPunktR(S, ...qRot(S.qS, 4 * s, x, y, z), 40) / 1000); }
function stetigZaehlen(a, b) { let mx = 0, ueber = 0; for (let i = 0; i < a.length; i++) { const d = Math.abs(a[i] - b[i]); if (d > mx) mx = d; if (d > 1) ueber++; } return { mx, ueber, n: a.length }; }
function landMaske(S, W, H) { const m = new Uint8Array(W * H); for (let r = 0; r < H; r++) { const phi = Math.PI / 2 - Math.PI * (r + 0.5) / H; for (let i = 0; i < W; i++) m[r * W + i] = P.planetPunkt(S, phi, -Math.PI + 2 * Math.PI * (i + 0.5) / W, 40) > 0 ? 1 : 0; } return m; }
function kuestenPixel(m, W, H) { const L = []; for (let r = 0; r < H; r++) { if (Math.abs(90 - 180 * (r + 0.5) / H) >= 70) continue; for (let i = 0; i < W; i++) { const a = m[r * W + i]; if (a !== m[r * W + (i + 1) % W] || (r < H - 1 && a !== m[(r + 1) * W + i])) L.push(r * W + i); } } return L; }
function kuestenVersatz(mA, mB, W, H, R) { // gerichteter Hausdorff A → B (km), Suche im Fenster ±6 Pixel, darüber 1e9
  const kB = new Uint8Array(W * H); for (const p of kuestenPixel(mB, W, H)) kB[p] = 1;
  const ds = []; const px = 2 * Math.PI / W;
  for (const p of kuestenPixel(mA, W, H)) {
    const r = Math.floor(p / W), i = p - r * W, phi = Math.PI / 2 - Math.PI * (r + 0.5) / H; let best = 1e9;
    for (let dr = -6; dr <= 6; dr++) { const rr = r + dr; if (rr < 0 || rr >= H) continue; const phi2 = Math.PI / 2 - Math.PI * (rr + 0.5) / H;
      for (let di = -6; di <= 6; di++) { const q = rr * W + (i + di + W) % W; if (!kB[q]) continue; const d = R * Math.acos(Math.min(1, Math.sin(phi) * Math.sin(phi2) + Math.cos(phi) * Math.cos(phi2) * Math.cos(di * px))); if (d < best) best = d; } }
    ds.push(best);
  }
  return ds;
}
function driftJe(plan, t) { // cm/a je Kontinent-Gruppe
  const S = P._intern.scheibeKern(plan, t, true), v = [];
  for (let g = 0; g < S.nG; g++) { const o = [S.pom[3 * g], S.pom[3 * g + 1], S.pom[3 * g + 2]], c = [S.pz[3 * g], S.pz[3 * g + 1], S.pz[3 * g + 2]];
    v.push(Math.hypot(o[1] * c[2] - o[2] * c[1], o[2] * c[0] - o[0] * c[2], o[0] * c[1] - o[1] * c[0]) * plan.R / 10); }
  return v;
}
function vornBei(plan, t) { // gebirge.vorn an der Zeit t (512×256): aktiver Gürtel an der dann führenden Küste; Gedächtnis-Höhe
  const S = P.planetScheibe(plan, t), R = plan.R, W = 512, H = 256, o = {};
  const hg = new Float32Array(W * H), pl = new Int16Array(W * H), ak = new Uint8Array(W * H), gew = new Float64Array(H);
  for (let r = 0; r < H; r++) { const phi = Math.PI / 2 - Math.PI * (r + 0.5) / H; gew[r] = Math.cos(phi);
    for (let i = 0; i < W; i++) { hg[r * W + i] = P.planetPunkt(S, phi, -Math.PI + 2 * Math.PI * (i + 0.5) / W, 40, o) / 1000; pl[r * W + i] = o.platte; ak[r * W + i] = o.orogenAktiv; } }
  const landM = new Uint8Array(W * H); for (let p = 0; p < W * H; p++) landM[p] = hg[p] > 0 ? 1 : 0;
  const L = komponenten(landM, W, H, gew.map(c => c * (2 * Math.PI * R / W) * (Math.PI * R / H)));
  let n = 0, ok = 0, memH = 0, memN = 0, aktH = 0, aktN = 0;
  for (const k of L.K) {
    if (k.flaeche < 3e6) continue;
    const plC = new Map(); for (const p of k.pix) plC.set(pl[p], (plC.get(pl[p]) || 0) + 1);
    const pid = [...plC.entries()].sort((a, b) => b[1] - a[1])[0][0], c = form(k.pix, W, H).mitte;
    const om = [S.pom[3 * pid], S.pom[3 * pid + 1], S.pom[3 * pid + 2]], v = [om[1] * c[2] - om[2] * c[1], om[2] * c[0] - om[0] * c[2], om[0] * c[1] - om[1] * c[0]];
    const geb = k.pix.filter(p => hg[p] > 1.5), gebA = geb.filter(p => ak[p]);
    for (const p of geb) { if (ak[p]) { aktH += hg[p]; aktN++; } else { memH += hg[p]; memN++; } }
    if (Math.hypot(...v) > 1e-9 && gebA.length) { const gb = form(gebA, W, H).mitte; n++; if ((gb[0] - c[0]) * v[0] + (gb[1] - c[1]) * v[1] + (gb[2] - c[2]) * v[2] > 0) ok++; }
  }
  return { n, ok, memH: memN ? memH / memN : 0, memN, aktH: aktN ? aktH / aktN : 0, aktN };
}
function superkontinent(plan, t) {
  const S = P.planetScheibe(plan, t), W = 512, H = 256, m = landMaske(S, W, H), gew = new Float64Array(H);
  for (let r = 0; r < H; r++) gew[r] = Math.cos(Math.PI / 2 - Math.PI * (r + 0.5) / H);
  const K = komponenten(m, W, H, gew).K; const ges = K.reduce((a, k) => a + k.flaeche, 0); const gr = K.reduce((a, k) => Math.max(a, k.flaeche), 0);
  return ges ? gr / ges : 0;
}
function bildNaechst(plan, art, t) { let b = -1, d = 1e9; for (let i = 0; i < plan.nB; i++) if (plan.art[i] === art && Math.abs(plan.bilder[i] - t) < d) { d = Math.abs(plan.bilder[i] - t); b = i; } return b < 0 ? NaN : plan.bilder[b]; }
function saatZeit(samen) {
  const plan = planVon(samen), og = ortGesetzAusGelaende(), R = plan.R, k = P.planetHash('bau3|' + samen), out = { samen };
  // drift.cm_a
  out.drift = []; for (let i = 0; i < 20; i++) out.drift.push(...driftJe(plan, -540 + 790 * P.planetZufall(k, 1, i, 0)));
  // zeit.stetig: 400 Materialpunkte je Saat × 20 Zeiten (10 zufällig, 10 Schlüsselbilder in [−540; +250]), Schritt 0,1 Ma
  const M = materialPunkte(plan, 400, 'stetig|' + samen), zeiten = [];
  for (let i = 0; i < 10; i++) zeiten.push(-540 + 790 * P.planetZufall(k, 2, i, 0));
  const bl = []; for (let i = 0; i < plan.nB; i++) if (plan.bilder[i] > -540 && plan.bilder[i] < 250) bl.push(plan.bilder[i]);
  for (let i = 0; i < 10 && bl.length; i++) zeiten.push(bl[i % bl.length]);
  out.stetig = { mx: 0, ueber: 0, n: 0, bildMx: 0 };
  zeiten.forEach((t, j) => { const r = stetigZaehlen(materialHoehen(plan, M, t - 0.05), materialHoehen(plan, M, t + 0.05)); out.stetig.n += r.n; out.stetig.ueber += r.ueber; out.stetig.mx = Math.max(out.stetig.mx, r.mx); if (j >= 10) out.stetig.bildMx = Math.max(out.stetig.bildMx, r.mx); });
  // Küsten-Versatz zwischen Karten im Abstand 1 Ma: an einer Zufalls-Zeit und am Schlüsselbild nächst 0 (über das Bild hinweg)
  out.kueste = [];
  for (const t of [-540 + 790 * P.planetZufall(k, 3, 0, 0), bildNaechst(plan, 0, 0) - 0.5]) {
    const W = 512, H = 256, a = landMaske(P.planetScheibe(plan, t), W, H), b = landMaske(P.planetScheibe(plan, t + 1), W, H);
    const ds = kuestenVersatz(a, b, W, H, R).concat(kuestenVersatz(b, a, W, H, R)), gef = ds.filter(d => d < 1e8); out.kueste.push({ t, max: Math.max(...ds), maxGef: Math.max(0, ...gef), ohne: ds.length - gef.length, p99: quantil(ds, 0.99), n: ds.length });
  }
  // zeit.statistik an den fünf Zeiten
  const N = 16384, F = P._intern.fib(N);
  out.statistik = ZEITEN.map(t => { const S = P.planetScheibe(plan, t), hs = []; let land = 0; for (let i = 0; i < N; i++) { const h = P.planetPunktR(S, F[3 * i], F[3 * i + 1], F[3 * i + 2], 40) / 1000; hs.push(h); if (h > 0) land++; }
    return { t, bimodal: hypsBimodal(hs).ok, land: land / N, eisKm: S.eisKm, meerKm: S.meerKm }; });
  // superkontinent
  const tv = bildNaechst(plan, 1, 0); out.superkontinent = { t: tv, anteil: superkontinent(plan, tv) };
  // meer.zeit: 20 Fächer −190 … 0
  const ms = [], al = []; for (let i = 0; i < 20; i++) { const m = P.planetMeer(plan, -190 + 10 * i); ms.push(m.meerKm); al.push(m.ozeanAlterMa); }
  out.meer = { rho: spearman(ms, al), spanne: Math.max(...ms) - Math.min(...ms), mittelAlter: [Math.min(...al), Math.max(...al)] };
  // gebirge.vorn.zeit am verstreut-Schlüsselbild nächst 0 (Fenster −30 / +60 innerhalb der Achse)
  const tz = bildNaechst(plan, 0, 0); out.vornZeit = { t: tz, vor: vornBei(plan, tz - 30), nach: vornBei(plan, tz + 60) };
  // ort.anker und ort.bereich
  const A = P.planetAnker(plan, 0, og), S0 = P.planetScheibe(plan, 0);
  // aktiver Rand unabhängig geprüft: 64 Proben auf Kreisen 125/250/375/500 km um den Anker, je konvergenter Rand näher als der Rest bis 500 km
  let randNah = false; const tb = [0, 0, 0, 0, 0, 0], ax = A.auf;
  { const a0 = Math.abs(ax[0]) < 0.9 ? [1, 0, 0] : [0, 1, 0]; let e1 = [ax[1] * a0[2] - ax[2] * a0[1], ax[2] * a0[0] - ax[0] * a0[2], ax[0] * a0[1] - ax[1] * a0[0]]; const l = Math.hypot(...e1); e1 = e1.map(v => v / l); const e2 = [ax[1] * e1[2] - ax[2] * e1[1], ax[2] * e1[0] - ax[0] * e1[2], ax[0] * e1[1] - ax[1] * e1[0]]; tb.splice(0, 6, ...e1, ...e2); }
  const oo = {};
  for (const rk of [0, 125, 250, 375, 500]) for (let j = 0; j < (rk ? 16 : 1); j++) { const th = 2 * Math.PI * j / 16, d = rk / R; const v = [0, 1, 2].map(c => Math.cos(d) * ax[c] + Math.sin(d) * (Math.cos(th) * tb[c] + Math.sin(th) * tb[3 + c]));
    P.planetPunktR(S0, v[0], v[1], v[2], 40, oo); if (oo.randArt === P.RAND_ART.konvergent && oo.randAbstandKm < 500 - rk) randNah = true; }
  const o0 = P.planetOrt(S0, A.breite, A.laenge, og);
  out.anker = { breite: A.breite, laenge: A.laenge, sommer: o0.klima.sommer, winter: o0.klima.winter, kueste: A.kuesteKm, randNah, wl: Object.is(o0.meer.waterLevelM, -3), land: P.planetPunkt(S0, A.breite, A.laenge, 40) > 0 };
  const ids = ['land', 'hoehe', 'kontinentLambda', 'rauhLambda', 'trog', 'ks', 'tafel', 'schichtDicke', 'hartAnteil'];
  let orte = 0, inBereich = 0; const ko = P.planetHash('orte|' + samen), oO = {};
  for (let i = 0; orte < 256 && i < 20000; i++) { const y = 2 * P.planetZufall(ko, 1, i, 0) - 1, lam = 2 * Math.PI * P.planetZufall(ko, 2, i, 0) - Math.PI, phi = Math.asin(y);
    if (!(P.planetPunkt(S0, phi, lam, 40) > 0)) continue; orte++; P.planetOrt(S0, phi, lam, og, oO);
    if (ids.every(id => { const r = og.regler.find(z => z.id === id); const v = oO.wildnis[id]; return Number.isFinite(v) && v >= r.min && v <= r.max; })) inBereich++; }
  out.bereich = { orte, inBereich };
  return out;
}
function urteilBau3(R, extra) {
  const n = R.length, z = (f) => R.filter(f).length, U = [];
  const zeile = (name, ok, wert, schwelle) => U.push({ name, urteil: ok === null ? 'OFFEN' : (ok ? 'GRÜN' : 'ROT'), wert, schwelle });
  const dr = R.flatMap(r => r.drift);
  zeile('drift.cm_a', quantil(dr, 0.05) >= 1 && quantil(dr, 0.95) <= 15 && median(dr) >= 2 && median(dr) <= 8, 'p05 ' + quantil(dr, 0.05).toFixed(2) + ' · Median ' + median(dr).toFixed(2) + ' · p95 ' + quantil(dr, 0.95).toFixed(2) + ' cm/a (' + dr.length + ' Kontinent × Zeit)', 'p05 ≥ 1, p95 ≤ 15, Median 2–8');
  const sn = R.reduce((a, r) => a + r.stetig.n, 0), su = R.reduce((a, r) => a + r.stetig.ueber, 0), smx = Math.max(...R.map(r => r.stetig.mx)), sbm = Math.max(...R.map(r => r.stetig.bildMx));
  const kv = R.flatMap(r => r.kueste), kmx = Math.max(...kv.map(k => k.max)), kmg = Math.max(...kv.map(k => k.maxGef)), kohne = kv.reduce((a, k) => a + k.ohne, 0), kn = kv.reduce((a, k) => a + k.n, 0), kp = median(kv.map(k => k.p99));
  zeile('zeit.stetig', su === 0 && kmx <= 150, 'Höhe: ' + su + '/' + sn + ' Material-Schritte > 1 km je 0,1 Ma (' + (100 * (1 - su / sn)).toFixed(3) + ' % ≤ 1 km), max ' + smx.toFixed(2) + ' km, an Schlüsselbildern max ' + sbm.toFixed(2) + ' km; Küsten-Versatz 1 Ma (Hausdorff): ' + (kohne ? kohne + '/' + kn + ' Küsten-Pixel ohne Partner im ±470-km-Fenster (Insel taucht auf/ab), ' : '') + 'max gepaart ' + kmg.toFixed(0) + ' km, p99 Median ' + kp.toFixed(0) + ' km (' + kv.length + ' Kartenpaare)', '≤ 1 km je 0,1 Ma; ≤ 150 km');
  if (extra.rueckkehr) zeile('zeit.rueckkehr', extra.rueckkehr.ok, extra.rueckkehr.wert, 'SHA gleich');
  if (extra.sprung) zeile('zeit.sprung', extra.sprung.ok, extra.sprung.wert, 'kalt ≤ 120 ms, warm ≤ 5 ms, −200/−3 000 ±20 %');
  const st = (j) => z(r => r.statistik[j].bimodal && r.statistik[j].land >= 0.2 && r.statistik[j].land <= 0.38);
  zeile('zeit.statistik', ZEITEN.every((_, j) => st(j) >= Math.ceil(0.9 * n)), ZEITEN.map((t, j) => t + ' Ma ' + st(j) + '/' + n + ' (Land ' + (100 * median(R.map(r => r.statistik[j].land))).toFixed(1) + ' %)').join(' · '), '≥ 27/30 je Zeit');
  const sk = R.map(r => r.superkontinent.anteil);
  zeile('superkontinent', median(sk) >= 0.7, 'größte Land-Komponente am versammelten Bild: Median ' + (100 * median(sk)).toFixed(0) + ' %, ≥ 70 % in ' + z(r => r.superkontinent.anteil >= 0.7) + '/' + n, '≥ 70 % (per Bau, Bild)');
  const mr = R.map(r => r.meer.rho), msp = R.map(r => r.meer.spanne);
  zeile('meer.zeit', median(mr) <= -0.6 && median(msp) <= 0.6, 'Spearman(Spiegel, Bodenalter) Median ' + median(mr).toFixed(2) + ' (≤ −0,6 in ' + z(r => r.meer.rho <= -0.6) + '/' + n + '); Spanne Median ' + (1000 * median(msp)).toFixed(0) + ' m, max ' + (1000 * Math.max(...msp)).toFixed(0) + ' m', 'Rang ≤ −0,6; Spanne ≤ 600 m');
  const vv = R.reduce((a, r) => a + r.vornZeit.vor.n, 0), vo = R.reduce((a, r) => a + r.vornZeit.vor.ok, 0), nv = R.reduce((a, r) => a + r.vornZeit.nach.n, 0), no = R.reduce((a, r) => a + r.vornZeit.nach.ok, 0);
  zeile('gebirge.vorn.zeit', vv > 0 && nv > 0 && vo >= 0.8 * vv && no >= 0.8 * nv, '30 Ma vor dem verstreut-Bild ' + vo + '/' + vv + ' (' + (100 * vo / Math.max(1, vv)).toFixed(0) + ' %), 60 Ma danach ' + no + '/' + nv + ' (' + (100 * no / Math.max(1, nv)).toFixed(0) + ' %); Gedächtnis-Gürtel mittlere Höhe vorher ' + median(R.map(r => r.vornZeit.vor.memH)).toFixed(2) + ' km → nachher ' + median(R.map(r => r.vornZeit.nach.memH)).toFixed(2) + ' km', '≥ 80 % je Seite');
  const ak = (r) => r.anker.land && Math.abs(r.anker.sommer - 18) <= 4 && Math.abs(r.anker.winter + 4) <= 6 && r.anker.kueste <= 300 && !r.anker.randNah;
  zeile('ort.anker', z(ak) >= Math.ceil(0.8 * n), z(ak) + '/' + n + ' (Sommer ' + Math.min(...R.map(r => r.anker.sommer)).toFixed(1) + '…' + Math.max(...R.map(r => r.anker.sommer)).toFixed(1) + ' °C, Winter ' + Math.min(...R.map(r => r.anker.winter)).toFixed(1) + '…' + Math.max(...R.map(r => r.anker.winter)).toFixed(1) + ' °C, Küste max ' + Math.max(...R.map(r => r.anker.kueste)).toFixed(0) + ' km, konvergenter Rand < 500 km in ' + z(r => r.anker.randNah) + ')', '≥ 80 %');
  const bo = R.reduce((a, r) => a + r.bereich.orte, 0), bi = R.reduce((a, r) => a + r.bereich.inBereich, 0);
  zeile('ort.bereich', bi === bo && z(r => r.anker.wl) === n, bi + '/' + bo + ' Land-Orte mit allen Reglern in min…max (per Bau: geklemmt); waterLevelM am Anker t = 0 genau −3 in ' + z(r => r.anker.wl) + '/' + n, '100 %; Object.is −3');
  if (extra.ortKosten) zeile('ort.kosten', extra.ortKosten.ok, extra.ortKosten.wert, 'planetOrt ≤ 1 ms, planetAnker ≤ 10 ms, gleiche Bytes');
  if (extra.leser) zeile('ort.leser', extra.leser.n === 0 ? null : false, 'Leser im Spiel ' + extra.leser.n + ' (' + extra.leser.wert + '): Konsum-Tiefe 0 % — die Brücke ist Funktion, nicht Verdrahtung', '= 0, beim Namen');
  return U;
}
function rueckkehr() { // Karte bei 0 → Abfragen bei −200 → Karte bei 0; gemischte Reihenfolge der fünf Zeiten in frischem Plan
  const plan = planVon('erde-09'), karte = (pl, t) => sha(Buffer.from(P.planetKarte(P.planetScheibe(pl, t), 256, 'relief')));
  const a = karte(plan, 0); const S = P.planetScheibe(plan, -200); for (let i = 0; i < 2000; i++) P.planetPunkt(S, Math.asin(2 * P.planetZufall(7, i, 0, 0) - 1), 6.28 * P.planetZufall(7, i, 1, 0) - 3.14, 40); const b = karte(plan, 0);
  const vor = ZEITEN.map(t => karte(plan, t)); const plan2 = planVon('erde-09'); const ord = [3, 1, 4, 0, 2]; const gem = []; for (const j of ord) gem[j] = karte(plan2, ZEITEN[j]);
  const ok = a === b && vor.every((h, j) => h === gem[j]);
  return { ok, wert: '0 → −200 → 0: ' + a.slice(0, 12) + ' · ' + b.slice(0, 12) + '; fünf Zeiten vorwärts ↔ gemischt (frischer Plan): ' + vor.filter((h, j) => h === gem[j]).length + '/5 gleich' };
}
function sprung() {
  const og = null; void og;
  const kalt = [], warm = [];
  for (let i = 0; i < 5; i++) { const plan = planVon('erde-sprung-' + i); P.planetScheibe(plan, 0); const t = -137.3 - 61 * i;
    let a = ns(); P.planetScheibe(plan, t); kalt.push((ns() - a) / 1e6); a = ns(); P.planetScheibe(plan, t + 0.37); warm.push((ns() - a) / 1e6); }
  const plan = planVon('erde-01'), Sz = [0, -200, -3000].map(t => P.planetScheibe(plan, t)), c = [Infinity, Infinity, Infinity];
  for (let d = 0; d < 7; d++) for (let j = 0; j < 3; j++) c[j] = Math.min(c[j], punktKosten(Sz[j], 12000, 'sp' + d).median);
  const r1 = c[1] / c[0], r2 = c[2] / c[0];
  const nk = Sz.map(S => (S.nk ? 'Nachklang' : '-'));
  return { ok: Math.min(...kalt) <= 120 && Math.min(...warm) <= 5 && Math.abs(r1 - 1) <= 0.2 && Math.abs(r2 - 1) <= 0.2,
    wert: 'kalt (neuer Abschnitt + Meer-Fächer, Plan warm bei 0) bestes ' + Math.min(...kalt).toFixed(0) + ' ms, Median ' + median(kalt).toFixed(0) + ' ms; warm ' + Math.min(...warm).toFixed(2) + ' ms; Punkt 0 · −200 · −3 000: ' + c.map(v => v.toFixed(2)).join(' · ') + ' µs (' + (100 * (r1 - 1)).toFixed(0) + ' %, ' + (100 * (r2 - 1)).toFixed(0) + ' %; ' + nk.join('/') + ')' };
}
function ortKosten() {
  const og = ortGesetzAusGelaende(), an = [], ort = []; let gleich = true;
  for (let i = 0; i < 5; i++) { const plan = planVon('erde-ort-' + i); const S = P.planetScheibe(plan, 0); P.planetKlimaGlobal(plan, 0);
    let a = ns(); const A = P.planetAnker(plan, 0, og); an.push((ns() - a) / 1e6);
    const A2 = P.planetAnker(planVon('erde-ort-' + i), 0, og); if (A2.breite !== A.breite || A2.laenge !== A.laenge) gleich = false;
    const o = {}; P.planetOrt(S, A.breite, A.laenge, og, o);
    const t = []; for (let j = 0; j < 40; j++) { a = ns(); P.planetOrt(S, A.breite + 0.002 * j, A.laenge - 0.001 * j, og, o); t.push((ns() - a) / 1e6); }
    ort.push(median(t));
    const x1 = JSON.stringify(P.planetOrt(S, A.breite + 0.01, A.laenge, og), (k, v) => (v instanceof Float64Array ? Array.from(v) : v)), x2 = JSON.stringify(P.planetOrt(S, A.breite + 0.01, A.laenge, og), (k, v) => (v instanceof Float64Array ? Array.from(v) : v));
    if (x1 !== x2) gleich = false; }
  return { ok: median(ort) <= 1 && median(an) <= 10 && gleich, wert: 'planetOrt Median ' + median(ort).toFixed(3) + ' ms (5 Pläne × 40 Orte, warm) · planetAnker kalt Median ' + median(an).toFixed(1) + ' ms (max ' + Math.max(...an).toFixed(1) + ') · zweimal gerufen gleiche Bytes: ' + (gleich ? 'ja' : 'NEIN') };
}
function leserImSpiel() { // jeder Text, der den Kern beim Namen liest, außer ihm selbst und dem Richter-Werkzeug
  const wurzel = path.join(__dirname, '..'); let out = '';
  try { out = execFileSync('git', ['-C', wurzel, 'grep', '-l', '-E', '__planetCore|planet-core\\.js|planetOrt\\('], { encoding: 'utf8' }); } catch (e) { out = e.stdout || ''; }
  const L = out.split('\n').filter(Boolean).filter(f => f !== 'planet-core.js' && f !== 'scripts/diag-planet.cjs');
  return { n: L.length, wert: L.length ? L.join(', ') : 'git grep __planetCore · planet-core.js · planetOrt( außerhalb Kern und Richter: 0 Treffer' };
}

// Kontaktbogen: EIN Samen — Reihe 1 bei t = 0 relief · platten · temperatur · niederschlag · biom; Reihe 2 relief und Reihe 3 biom an
// −200 · −100 · −50 · 0 · +50 Ma; Reihe 4 das versammelte Bild nächst 0 (relief, biom), alter und koeppen bei 0. Schrift: 3×5-Raster.
const SCHRIFT = { A: '111101111101101', B: '110101110101110', C: '111100100100111', D: '110101101101110', E: '111100110100111', F: '111100110100100', G: '111100101101111',
  H: '101101111101101', I: '111010010010111', K: '101101110101101', L: '100100100100111', M: '101111111101101', N: '110101101101101', O: '111101101101111', P: '111101111100100',
  R: '110101110101101', S: '111100111001111', T: '111010010010010', U: '101101101101111', V: '101101101101010', W: '101101111111101', Z: '111001010100111', Ö: '101111101101111', Ä: '101111101111101',
  '0': '111101101101111', '1': '010110010010111', '2': '111001111100111', '3': '111001111001111', '4': '101101111001001', '5': '111100111001111', '6': '111100111101111', '7': '111001001001001',
  '8': '111101111101111', '9': '111101111001111', '-': '000000111000000', '+': '000010111010000', ' ': '000000000000000', '·': '000000010000000', '=': '000111000111000' };
function schreiben(rgb, W, x0, y0, text, s) {
  let x = x0;
  for (const ch of text.toUpperCase()) { const g = SCHRIFT[ch] || SCHRIFT[' '];
    for (let r = 0; r < 5; r++) for (let c = 0; c < 3; c++) if (g[r * 3 + c] === '1') for (let dy = 0; dy < s; dy++) for (let dx = 0; dx < s; dx++) { const o = ((y0 + r * s + dy) * W + x + c * s + dx) * 3; rgb[o] = 235; rgb[o + 1] = 235; rgb[o + 2] = 235; }
    x += 4 * s; }
}
function kontaktbogen(samen, aus) {
  const plan = planVon(samen), tv = bildNaechst(plan, 1, 0), TW = 312, TH = 156, M = 4, LB = 14, Wb = 5 * TW + 6 * M;
  const zeilen = [
    [[0, 'relief', 'RELIEF 0 MA'], [0, 'platten', 'PLATTEN 0 MA'], [0, 'temperatur', 'TEMPERATUR 0 MA'], [0, 'niederschlag', 'NIEDERSCHLAG 0 MA'], [0, 'biom', 'BIOM 0 MA']],
    [-200, -100, -50, 0, 50].map(t => [t, 'relief', 'RELIEF ' + (t > 0 ? '+' : '') + t + ' MA']),
    [-200, -100, -50, 0, 50].map(t => [t, 'biom', 'BIOM ' + (t > 0 ? '+' : '') + t + ' MA']),
    [[tv, 'relief', 'VERSAMMELT ' + Math.round(tv) + ' MA'], [tv, 'biom', 'VERSAMMELT BIOM'], [0, 'alter', 'BODENALTER 0 MA'], [0, 'koeppen', 'KÖPPEN 0 MA'], [-100, 'platten', 'PLATTEN -100 MA']],
  ];
  const Hb = zeilen.length * (LB + TH + M) + M, rgb = new Uint8Array(Wb * Hb * 3).fill(18);
  zeilen.forEach((z, zi) => z.forEach(([t, schicht, titel], si) => {
    const S = P.planetScheibe(plan, t), k = P.planetKarte(S, TW, schicht), x0 = M + si * (TW + M), y0 = M + zi * (LB + TH + M);
    schreiben(rgb, Wb, x0 + 2, y0 + 2, titel, 2);
    for (let r = 0; r < TH; r++) Buffer.from(k.buffer, r * TW * 3, TW * 3).copy(Buffer.from(rgb.buffer), ((y0 + LB + r) * Wb + x0) * 3);
  }));
  fs.mkdirSync(path.dirname(aus), { recursive: true }); const buf = png(rgb, Wb, Hb); fs.writeFileSync(aus, buf);
  console.log(JSON.stringify({ samen, versammelt: tv, breite: Wb, hoehe: Hb, sha256: sha(buf).slice(0, 16) }));
}
function orteDrucken(samen) { // die Brücke an drei Orten vorgerechnet: Anker · Gebirge · Trockenland, dazu der Anker bei −100 Ma
  const plan = planVon(samen), og = ortGesetzAusGelaende(), S0 = P.planetScheibe(plan, 0), A = P.planetAnker(plan, 0, og), k = P.planetHash('orte-drei|' + samen);
  let geb = null, gebW = -1, wue = null, o = {};
  for (let i = 0; i < 6000; i++) { const y = 2 * P.planetZufall(k, 1, i, 0) - 1, lam = 2 * Math.PI * P.planetZufall(k, 2, i, 0) - Math.PI, phi = Math.asin(y);
    const h = P.planetPunkt(S0, phi, lam, 40, o); if (!(h > 0)) continue;
    if (o.orogenStaerke > gebW && o.orogenAktiv) { gebW = o.orogenStaerke; geb = [phi, lam]; }
    if (!wue) { const K = P.planetKlima(S0, phi, lam, -1, {}, o); if (P.planetBiom(K, h, {}).koeppen === 3) wue = [phi, lam]; } }
  const S100 = P.planetScheibe(plan, -100);
  const fmt = (x) => JSON.stringify(x, (key, v) => (v instanceof Float64Array ? { mitte: +v[40].toFixed(3), min: +Math.min(...v).toFixed(3), max: +Math.max(...v).toFixed(3) } : (typeof v === 'number' ? +v.toFixed(4) : v)));
  for (const [name, S, ort] of [['anker', S0, [A.breite, A.laenge]], ['gebirge', S0, geb], ['wueste', S0, wue], ['anker@-100', S100, [A.breite, A.laenge]]]) {
    if (!ort) { console.log(name + ': kein Ort gefunden'); continue; }
    const r = P.planetOrt(S, ort[0], ort[1], og); console.log(name + ' (' + (ort[0] * 180 / Math.PI).toFixed(2) + '°, ' + (ort[1] * 180 / Math.PI).toFixed(2) + '°, t ' + S.zeitMa + ' Ma): ' + fmt(r));
  }
}

// ── Kosten ─────────────────────────────────────────────────────────────────────────────────────────────
function ns() { return Number(process.hrtime.bigint()); }
function kostenBau2(altKern) {
  const out = []; const zeile = (name, ok, wert, schwelle) => out.push({ name, urteil: ok ? 'GRÜN' : 'ROT', wert, schwelle });
  const plan = planVon('erde-01'), S = P.planetScheibe(plan, 0);
  const k = P.planetHash('kosten-klima'), L = [], M = [];
  for (let i = 0; L.length < 20000 || M.length < 20000; i++) {
    const y = 2 * P.planetZufall(k, 1, i, 1) - 1, ph = 6.283185307179586 * P.planetZufall(k, 1, i, 2), q = Math.sqrt(1 - y * y), x = q * Math.cos(ph), z = q * Math.sin(ph);
    const pt = {}; const h = P.planetPunktR(S, x, y, z, 40, pt); (h > 0 ? L : M).push([x, y, z, pt]);
  }
  const K = {};
  const mess = (A) => { const t = new Float64Array(A.length); let i = 0; for (const [x, y, z, pt] of A) { const a = ns(); P.planetKlimaR(S, x, y, z, -1, K, pt); t[i++] = ns() - a; } return quantil(t, 0.5) / 1000; };
  let ml = Infinity, mm = Infinity; for (let r = 0; r < 5; r++) { ml = Math.min(ml, mess(L.slice(0, 20000))); mm = Math.min(mm, mess(M.slice(0, 20000))); }
  zeile('kosten.klima.land', ml <= 25, 'Median ' + ml.toFixed(2) + ' µs (Zusatz zur Punkt-Abfrage: 7 Hüllen + Küstenseite; 20 000 Land-Proben, bestes von 5)', '≤ 25 µs');
  zeile('kosten.klima.meer', mm <= 4, 'Median ' + mm.toFixed(2) + ' µs (Zusatz zur Punkt-Abfrage)', '≤ 4 µs');
  const kg = bestVon5(i => { const pl = P.planetPlan('erde-klg-' + i, P.PLANET_ERDE); const a = ns(); P.planetKlimaGlobal(pl, 0); return (ns() - a) / 1e6; });
  zeile('kosten.klima.global', kg.wert <= 1, kg.wert.toFixed(3) + ' ms (kalt, 80 Fixpunkt-Schritte × 256 Stützen)', '≤ 1 ms');
  const a = ns(); P.planetKarte(S, 1024, 'biom'); const bk = (ns() - a) / 1e9;
  zeile('kosten.karte.biom', bk <= 15, bk.toFixed(2) + ' s (1024×512, ein Faden, ein Lauf)', '≤ 15 s');
  if (altKern) { // bau1-Punkt: dieselbe Messung am Kern von bau1 (Kopf 59c652b3), verschränkt
    const A = require(altKern), SA = A.planetScheibe(A.planetPlan('erde-01', A.PLANET_ERDE), 0);
    let mA = Infinity, mN = Infinity; for (let d = 0; d < 7; d++) { mA = Math.min(mA, punktKostenMit(A, SA, 12000, 'b' + d)); mN = Math.min(mN, punktKostenMit(P, S, 12000, 'b' + d)); }
    zeile('kosten.punkt.bau1', mN / mA <= 1.10, 'bau1 ' + mA.toFixed(2) + ' µs ↔ bau2 ' + mN.toFixed(2) + ' µs (' + (100 * (mN / mA - 1)).toFixed(1) + ' %, verschränkt, 7 Durchgänge)', '±10 %');
  }
  return out;
}
function punktKostenMit(Q, S, n, saat) {
  const k = Q.planetHash(saat), t = new Float64Array(n);
  for (let i = 0; i < n; i++) { const y = 2 * Q.planetZufall(k, 1, i, 1) - 1, ph = 6.283185307179586 * Q.planetZufall(k, 1, i, 2), q = Math.sqrt(1 - y * y); const a = ns(); Q.planetPunktR(S, q * Math.cos(ph), y, q * Math.sin(ph), 40); t[i] = ns() - a; }
  return quantil(t, 0.5) / 1000;
}
function punktKosten(S, n, saat) {
  const k = P.planetHash(saat || 'kosten'), t = new Float64Array(n), r = new Float64Array(3);
  for (let i = 0; i < 2000; i++) { const y = 2 * P.planetZufall(k, 9, i, 1) - 1, ph = 6.283185307179586 * P.planetZufall(k, 9, i, 2), q = Math.sqrt(1 - y * y); P.planetPunktR(S, q * Math.cos(ph), y, q * Math.sin(ph), 40); }
  for (let i = 0; i < n; i++) {
    const y = 2 * P.planetZufall(k, 1, i, 1) - 1, ph = 6.283185307179586 * P.planetZufall(k, 1, i, 2), q = Math.sqrt(1 - y * y);
    r[0] = q * Math.cos(ph); r[1] = y; r[2] = q * Math.sin(ph);
    const a = ns(); P.planetPunktR(S, r[0], r[1], r[2], 40); t[i] = ns() - a;
  }
  return { median: quantil(t, 0.5) / 1000, p95: quantil(t, 0.95) / 1000 };
}
function bestVon5(f) { let b = Infinity, w; for (let i = 0; i < 5; i++) { const a = ns(); const r = f(i); const d = (ns() - a) / 1e6; if (d < b) { b = d; w = r; } } return { ms: b, wert: w }; }
function kosten() {
  const out = [];
  const zeile = (name, ok, wert, schwelle) => { out.push({ name, urteil: ok ? 'GRÜN' : 'ROT', wert, schwelle }); };
  const plan = planVon('erde-01'); const S = P.planetScheibe(plan, 0);
  const pk = []; for (let i = 0; i < 5; i++) pk.push(punktKosten(S, 40000, 'kosten-' + i));
  const best = pk.reduce((a, b) => (a.median <= b.median ? a : b));
  zeile('kosten.punkt', best.median <= 8 && best.p95 <= 20, 'Median ' + best.median.toFixed(2) + ' µs, p95 ' + best.p95.toFixed(2) + ' µs (5 × 40 000, bestes)', '≤ 8 µs, p95 ≤ 20 µs');
  // Platten-Zahl
  const klein = planVon('erde-01', { schollenZahl: 10, ozeanPlatten: 4 }), gross = planVon('erde-01', { schollenZahl: 40, ozeanPlatten: 8 });
  const Sk = P.planetScheibe(klein, 0), Sg = P.planetScheibe(gross, 0);
  // Verhältnis-Richter verschränkt (ABAB über 7 Durchgänge, Minimum je Aufbau): fremde Last trifft beide Seiten gleich
  const Sr = [1737, 6371, 12742].map(R => P.planetScheibe(planVon('erde-01', { radiusKm: R, g: 9.81 * R / 6371 }), 0));
  let mk = Infinity, mg = Infinity; const rad = [Infinity, Infinity, Infinity];
  for (let durchgang = 0; durchgang < 7; durchgang++) {
    mk = Math.min(mk, punktKosten(Sk, 12000, 'p' + durchgang).median); mg = Math.min(mg, punktKosten(Sg, 12000, 'p' + durchgang).median);
    for (let i = 0; i < 3; i++) rad[i] = Math.min(rad[i], punktKosten(Sr[i], 12000, 'r' + durchgang).median);
  }
  zeile('kosten.platten', mg / mk <= 1.4, 'nP ' + Sk.nP + ': ' + mk.toFixed(2) + ' µs ↔ nP ' + Sg.nP + ': ' + mg.toFixed(2) + ' µs (+' + (100 * (mg / mk - 1)).toFixed(0) + ' %, verschränkt, 7 Durchgänge)', '≤ +40 % (nP 9 ↔ 17)');
  // Radius bei gleichem Samen
  zeile('kosten.radius', Math.max(...rad) / Math.min(...rad) <= 1.35, rad.map(v => v.toFixed(2)).join(' · ') + ' µs (R 1 737 · 6 371 · 12 742), max/min ' + (Math.max(...rad) / Math.min(...rad)).toFixed(3), '≤ 1,35');
  // Plan
  const pp = bestVon5(i => P.planetPlan('erde-plan-' + i, P.PLANET_ERDE));
  const pb = P._intern.planBytes(pp.wert);
  zeile('kosten.plan', pp.ms <= 25 && pb <= 96 * 1024, pp.ms.toFixed(1) + ' ms, ' + (pb / 1024).toFixed(1) + ' KB', '≤ 25 ms, ≤ 96 KB');
  const pa = bestVon5(i => { const pl = P.planetPlan('erde-abs-' + i, P.PLANET_ERDE); const a = ns(); P._intern.abschnitt(pl, pl.nB - 2); return (ns() - a) / 1e6; });
  zeile('kosten.abschnitt', pa.wert <= 25, pa.wert.toFixed(1) + ' ms (letzter Abschnitt kalt, mit Rand-Gedächtnis über alle Vorgänger)', '≤ 25 ms');
  // Scheibe warm: Abschnitt und Meer-Fächer warm, neue Zeit im selben Fach
  const ws = bestVon5(i => { const a = ns(); const s = P.planetScheibe(plan, 0.137 * (i + 1)); return { ms: (ns() - a) / 1e6, bytes: P._intern.scheibeBytes(s) }; });
  zeile('kosten.scheibe', ws.wert.ms <= 5 && ws.wert.bytes <= 64 * 1024, ws.wert.ms.toFixed(2) + ' ms, ' + (ws.wert.bytes / 1024).toFixed(1) + ' KB', 'warm ≤ 5 ms, ≤ 64 KB');
  const mf = bestVon5(i => { const a = ns(); P.planetMeer(plan, -300 - 10 * i, 0.001 * (i + 1)); return (ns() - a) / 1e6; });
  zeile('kosten.meer', mf.wert <= 40, mf.wert.toFixed(1) + ' ms je Fach (Zusatz-Wasser erzwingt neue Lösung, Proben warm)', '≤ 40 ms');
  const kk = bestVon5(() => P.planetKarte(S, 1024, 'relief'));
  zeile('kosten.karte', kk.ms <= 5000, (kk.ms / 1000).toFixed(2) + ' s', '≤ 5 s (1024×512 relief, ein Faden)');
  return out;
}

// ── Bytes ──────────────────────────────────────────────────────────────────────────────────────────────
const VERBOTEN = /Math\.(sin|cos|tan|asin|acos|atan|atan2|exp|expm1|log|log2|log10|log1p|pow|hypot|cbrt|sinh|cosh|tanh|random)\b|\bDate\b|\bperformance\b|\*\*/g;
function absenz(text) { const m = text.match(VERBOTEN); return m ? m.length : 0; }
function matheGenau() {
  const M = P.planetMathe, k = P.planetHash('mathe'); let fs_ = 0, fc = 0, fa = 0, fx = 0, fq = 0;
  for (let i = 0; i < 1e6; i++) {
    const u = P.planetZufall(k, 1, i, 0), v = P.planetZufall(k, 2, i, 0);
    const x = (u - 0.5) * 200; fs_ = Math.max(fs_, Math.abs(M.ksin(x) - Math.sin(x))); fc = Math.max(fc, Math.abs(M.kcos(x) - Math.cos(x)));
    const y = (v - 0.5) * 20; fa = Math.max(fa, Math.abs(M.katan2(y, x) - Math.atan2(y, x)));
    const e = (u - 0.5) * 60; fx = Math.max(fx, Math.abs(M.kexp(e) - Math.exp(e)) / Math.exp(e));
    const c = 2 * v - 1; fq = Math.max(fq, Math.abs(M.kacos(c) - Math.acos(c)));
  }
  return { sin: fs_, cos: fc, atan2: fa, expRel: fx, acos: fq };
}
function hoehenSha(S, W, ordnung) {
  const H = W >> 1, buf = new Float64Array(W * H), r = new Float64Array(3);
  const idx = Array.from({ length: W * H }, (_, i) => i);
  if (ordnung === 'rueckwaerts') idx.reverse();
  if (ordnung === 'gemischt') { const k = P.planetHash('mischung'); for (let i = idx.length - 1; i > 0; i--) { const j = Math.floor(P.planetZufall(k, i, 0, 0) * (i + 1)); const t = idx[i]; idx[i] = idx[j]; idx[j] = t; } }
  for (const p of idx) {
    const row = Math.floor(p / W), col = p - row * W, phi = Math.PI / 2 - Math.PI * (row + 0.5) / H, lam = -Math.PI + 2 * Math.PI * (col + 0.5) / W;
    P.planetRichtung(phi, lam, r); buf[p] = P.planetPunktR(S, r[0], r[1], r[2], 2 * Math.PI * S.R / W);
  }
  return sha(Buffer.from(buf.buffer));
}
function bytes() {
  const out = []; const zeile = (name, ok, wert, schwelle) => out.push({ name, urteil: ok ? 'GRÜN' : 'ROT', wert, schwelle });
  const n = absenz(fs.readFileSync(KERN, 'utf8'));
  zeile('bytes.absenz', n === 0, n + ' Treffer', '0');
  const g = matheGenau(); const mx = Math.max(g.sin, g.cos, g.atan2, g.expRel, g.acos);
  zeile('bytes.mathe', mx <= 1e-12, 'max ' + mx.toExponential(2) + ' (sin ' + g.sin.toExponential(1) + ', cos ' + g.cos.toExponential(1) + ', atan2 ' + g.atan2.toExponential(1) + ', exp rel ' + g.expRel.toExponential(1) + ', acos ' + g.acos.toExponential(1) + '; 10⁶ Argumente)', '≤ 1·10⁻¹²');
  const lauf = (extra) => execFileSync(process.execPath, [...extra, __filename, '--karte', 'erde-07', '0', 'relief', '512', ''], { encoding: 'utf8' });
  const a = JSON.parse(lauf([])).sha256, b = JSON.parse(lauf([])).sha256, c = JSON.parse(lauf(['--jitless'])).sha256;
  zeile('bytes.prozesse', a === b && a === c, 'node ' + a.slice(0, 12) + ' · node ' + b.slice(0, 12) + ' · node --jitless ' + c.slice(0, 12), 'gleich');
  const plan = planVon('erde-07'), S = P.planetScheibe(plan, 0);
  const v = hoehenSha(S, 256, 'vorwaerts'), r = hoehenSha(S, 256, 'rueckwaerts'), m = hoehenSha(S, 256, 'gemischt');
  zeile('bytes.reihenfolge', v === r && v === m, [v, r, m].map(s => s.slice(0, 12)).join(' · '), 'gleich');
  const laufB = (extra) => execFileSync(process.execPath, [...extra, __filename, '--karte', 'erde-07', '0', 'biom', '256', ''], { encoding: 'utf8' });
  const ba = JSON.parse(laufB([])).sha256, bb = JSON.parse(laufB([])).sha256, bc = JSON.parse(laufB(['--jitless'])).sha256;
  zeile('bytes.biom.prozesse', ba === bb && ba === bc, 'node ' + ba.slice(0, 12) + ' · node ' + bb.slice(0, 12) + ' · node --jitless ' + bc.slice(0, 12) + ' (biom 256×128)', 'gleich');
  out.push({ name: 'planet.bytes.engines', urteil: 'OFFEN', wert: 'ungemessen (keine zweite Engine am Platz)', schwelle: 'Hash gleich' });
  return out;
}

// ── Selbsttest: gepflanzte Fehler müssen ROT werden ─────────────────────────────────────────────────
function selbsttest() {
  const out = []; const zeile = (name, ok, wert) => out.push({ name, urteil: ok ? 'GRÜN' : 'ROT', wert });
  const text = fs.readFileSync(KERN, 'utf8');
  zeile('absenz feuert', absenz(text + '\nconst x = Math.' + 'sin(1);\n') === absenz(text) + 1, 'gepflanzte Zeile gezählt');
  // gerade Küste: Halbebene Land/Meer mit Lineal-Küste
  const W = 2048, H = 1024, maske = new Uint8Array(W * H); for (let r = 0; r < H; r++) for (let i = 0; i < W; i++) maske[r * W + i] = i < W / 2 ? 1 : 0;
  const zeilen = []; for (let r = 0; r < H; r++) if (Math.abs(90 - 180 * (r + 0.5) / H) < 60) zeilen.push(r);
  const d = boxDimension(maske, W, H, zeilen);
  zeile('kueste.dimension feuert', !(d >= 1.15 && d <= 1.35), 'Lineal-Küste D = ' + d.toFixed(3) + ' → ROT');
  const paare = Array.from({ length: 1000 }, (_, i) => [-5, i % 50 === 0 ? -5.4 : -5.01]);
  const f = facette(paare).anteil;
  zeile('ozean.facette feuert', f < 0.995, 'gepflanzte 400-m-Stufe in 2 % der Proben → Anteil ' + (100 * f).toFixed(1) + ' % → ROT');
  // bau2
  const kl = koeppenLinse(P.planetBiom);
  zeile('koeppen.tafel', kl === 0, KOEPPEN_FAELLE.length + ' Normal-Klimata, ' + kl + ' falsch');
  const gestoert = (K, h, o) => { P.planetBiom(K, h, o); if (o.koeppen === 14) o.koeppen = 13; return o; };
  zeile('koeppen.tafel feuert', koeppenLinse(gestoert) > 0, 'gepflanzt Cfb → Cfa: ' + koeppenLinse(gestoert) + ' falsch → ROT');
  const sp = farbSprung(P._intern.biomFarbe);
  zeile('farbe.stetig', sp.stetig, 'Biom-Farbe: größter Sprung ' + sp.grob.toFixed(2) + ' RGB je 0,2 K / 20 mm → ' + sp.fein.toFixed(2) + ' je 0,05 K / 5 mm');
  const stufe = (tJ, tS, N, out) => { const o = {}; P.planetBiom({ tSommerC: tS, tWinterC: tJ - 10, tJahrC: tJ, niederschlagMm: N, sommerAnteil: 0.5 }, 100, o); const c = o.biom * 23; out[0] = c; out[1] = 255 - c; out[2] = (c * 7) % 255; return out; };
  const sps = farbSprung(stufe);
  zeile('farbe.stetig feuert', !sps.stetig, 'gepflanzte Klassen-Palette: Sprung ' + sps.grob.toFixed(1) + ' → ' + sps.fein.toFixed(1) + ' (schrumpft nicht) → ROT');
  const gl = wechselAnteil([1, 1, -1, 1, -1], [1, 1, -1, 1, -1]);
  zeile('klima.gegenlauf feuert', gl.anteil < 0.8, 'gepflanzt: Drehsinn ohne Wirkung → Wechsel ' + (100 * gl.anteil).toFixed(0) + ' % → ROT');
  const wz = widerspruchZaehlen({ tSommerC: 8, niederschlagMm: 1800, meerLuv: 0 }, { eis: 1, koeppen: 3 }, true);
  zeile('klima.widerspruch feuert', wz.eisWarm === 1 && wz.wuesteNass === 1 && wz.regenOhneMeer === 1, 'gepflanzt: Eis bei 8 °C, BWh bei 1 800 mm, Regen ohne Meer → je 1 gezählt');
  // bau3
  const st = stetigZaehlen([0, 1, 2, 3], [0.2, 1, 3.5, 3]);
  zeile('zeit.stetig feuert', st.ueber === 1 && st.mx === 1.5, 'gepflanzt: 1,5-km-Sprung in einem von 4 Schritten → ' + st.ueber + ' gezählt');
  const Wm = 512, Hm = 256, mA = new Uint8Array(Wm * Hm), mB = new Uint8Array(Wm * Hm);
  for (let r2 = 0; r2 < Hm; r2++) for (let i = 0; i < Wm; i++) { mA[r2 * Wm + i] = i >= 100 && i < 200 ? 1 : 0; mB[r2 * Wm + i] = i >= 103 && i < 203 ? 1 : 0; }
  const kvs = kuestenVersatz(mA, mB, Wm, Hm, 6371), kmax = Math.max(...kvs);
  zeile('kueste.versatz feuert', kmax > 150, 'gepflanzt: Küste um 3 Pixel (234 km am Äquator) verschoben → max ' + kmax.toFixed(0) + ' km → ROT');
  const dr = driftJe(planVon('erde-01'), -100.3);
  zeile('drift misst', dr.length > 0 && dr.every(v => Number.isFinite(v) && v >= 0), dr.length + ' Kontinente bei −100,3 Ma: ' + dr.map(v => v.toFixed(1)).join(' · ') + ' cm/a');
  let brach = false; try { P.planetOrt(P.planetScheibe(planVon('erde-01'), 0), 0.8, 0.1, { kuehlungKJeM: 0.11, meerUnterBasisM: 3, regler: [{ id: 'land', min: 0, max: 1, def: 0 }], klimaHeute: { sommer: 18 } }); } catch (e) { brach = /fehlt/.test(e.message); }
  zeile('ort.pflicht bricht', brach, 'gepflanzt: Ort-Gesetz ohne Klima-Felder → bricht beim Namen (K10)');
  return out;
}

function drucken(titel, U) { console.log('── ' + titel); for (const u of U) console.log((u.urteil + '     ').slice(0, 6) + ' ' + u.name.padEnd(22) + ' ' + u.wert + (u.schwelle ? '   [Schwelle ' + u.schwelle + ']' : '')); }

// ── Haupt ──────────────────────────────────────────────────────────────────────────────────────────────
if (require.main !== module && isMainThread) { /* als Modul geladen: nur Exporte */ } else if (!isMainThread) {
  const r = workerData.saaten.map(s => (workerData.modus === 'bau3' ? saatZeit(s) : (workerData.modus === 'bau2' ? saatKlima(s) : saatStatistik(s))));
  parentPort.postMessage(r);
} else {
  const argv = process.argv.slice(2);
  if (argv[0] === '--karte') {
    const [samen, t, schicht, breite, aus] = argv.slice(1);
    const plan = planVon(samen); const S = P.planetScheibe(plan, Number(t));
    const a = ns(); const rgb = P.planetKarte(S, Number(breite), schicht); const ms = (ns() - a) / 1e6;
    const buf = png(rgb, Number(breite), Number(breite) >> 1);
    if (aus) { fs.mkdirSync(path.dirname(aus), { recursive: true }); fs.writeFileSync(aus, buf); }
    console.log(JSON.stringify({ samen, t: Number(t), schicht, breite: Number(breite), ms: Math.round(ms), sha256: sha(buf), land: +S.landAnteil.toFixed(4), meerKm: +S.meerKm.toFixed(4), platten: S.nP }));
  } else if (argv[0] === '--karten' || argv[0] === '--bildsaaten') {
    const liste = argv[0] === '--karten' ? [[argv[1], Number(argv[2]), Number(argv[3]), argv[4]]] : bildSaaten().map(s => [s, 0, Number(argv[1]), path.join(argv[2], s)]);
    const si = argv.indexOf('--schichten'), schichten = si > 0 ? argv[si + 1].split(',') : ['relief', 'platten', 'alter'];
    for (const [samen, t, breite, pre] of liste) {
      const plan = planVon(samen); const S = P.planetScheibe(plan, t);
      for (const schicht of schichten) {
        const a = ns(); const rgb = P.planetKarte(S, breite, schicht); const ms = (ns() - a) / 1e6;
        const buf = png(rgb, breite, breite >> 1); const aus = pre + '-' + schicht + '.png';
        fs.mkdirSync(path.dirname(aus), { recursive: true }); fs.writeFileSync(aus, buf);
        console.log(JSON.stringify({ samen, schicht, ms: Math.round(ms), sha256: sha(buf).slice(0, 16), land: +S.landAnteil.toFixed(4), meerKm: +S.meerKm.toFixed(3), platten: S.nP }));
      }
    }
  } else if (argv[0] === '--richter') {
    const i = argv.indexOf('--saaten'); const saaten = SAATEN.slice(0, i > 0 ? Number(argv[i + 1]) : 30);
    const nw = Math.max(1, Math.min(saaten.length, os.cpus().length - 4));
    const teile = Array.from({ length: nw }, (_, w) => saaten.filter((_, j) => j % nw === w));
    const a = ns();
    const modus = argv[1] === 'bau3' ? 'bau3' : (argv[1] === 'bau2' ? 'bau2' : 'bau1');
    Promise.all(teile.map(t => new Promise((res, rej) => { const w = new Worker(__filename, { workerData: { saaten: t, modus } }); w.on('message', res); w.on('error', rej); }))).then(rs => {
      const R = rs.flat().sort((x, y) => (x.samen < y.samen ? -1 : 1));
      if (argv.includes('--roh')) for (const r of R) console.log(JSON.stringify(r));
      const sek = ((ns() - a) / 1e9).toFixed(0);
      if (modus === 'bau3') { const extra = { rueckkehr: rueckkehr(), sprung: sprung(), ortKosten: ortKosten(), leser: leserImSpiel() }; drucken('Richter bau3 · ' + R.length + ' Saaten · ' + sek + ' s (Saaten) + ' + ((ns() - a) / 1e9 - sek).toFixed(0) + ' s (Haupt)', urteilBau3(R, extra)); return; }
      drucken('Richter ' + modus + ' · ' + R.length + ' Saaten · ' + sek + ' s', modus === 'bau2' ? urteilBau2(R) : urteilBau1(R));
    });
  } else if (argv[0] === '--kosten') { if (argv[1] === 'bau2') drucken('Kosten bau2', kostenBau2(argv[2])); else drucken('Kosten', kosten()); }
  else if (argv[0] === '--zeitkarten') { // <samen> <breitePx> <ordner>: relief + biom an den fünf Zeiten und am versammelten Bild nächst 0
    const [samen, breite, ordner] = argv.slice(1); const plan = planVon(samen); const tv = bildNaechst(plan, 1, 0);
    for (const t of [...ZEITEN, tv]) { const S = P.planetScheibe(plan, t); for (const schicht of ['relief', 'biom']) {
      const name = (t === tv ? 'versammelt' : 'zeit') + (t >= 0 ? '+' : '') + Math.round(t) + '-' + schicht + '.png', rgb = P.planetKarte(S, Number(breite), schicht), buf = png(rgb, Number(breite), Number(breite) >> 1);
      fs.mkdirSync(ordner, { recursive: true }); fs.writeFileSync(path.join(ordner, samen + '-' + name), buf);
      console.log(JSON.stringify({ samen, t, schicht, sha256: sha(buf).slice(0, 16), land: +S.landAnteil.toFixed(4), meerKm: +S.meerKm.toFixed(3), eisKm: +S.eisKm.toFixed(4), nachklang: S.nk ? +S.nk.w.toFixed(3) : 0 })); } } }
  else if (argv[0] === '--kontaktbogen') kontaktbogen(argv[1], argv[2]);
  else if (argv[0] === '--orte') orteDrucken(argv[1]);
  else if (argv[0] === '--bytes') drucken('Bytes', bytes());
  else if (argv[0] === '--selbsttest') { const U = selbsttest(); drucken('Selbsttest', U); if (U.some(u => u.urteil !== 'GRÜN')) process.exit(1); }
  else console.log('diag-planet: --karte | --karten | --bildsaaten [--schichten a,b] | --richter bau1|bau2 | --kosten [bau2 <alt-kern.js>] | --bytes | --selbsttest');
}
module.exports = { png, crc32, sha, planVon, saatStatistik, urteilBau1, saatKlima, urteilBau2 };
