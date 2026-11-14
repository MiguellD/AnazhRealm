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
    if (v.art === P.VULKAN_ART.hotspot) { const h = Math.floor((id - 800000000) / 100); if (!ketten.has(h)) ketten.set(h, []); ketten.get(h).push(v); }
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

// ── Kosten ─────────────────────────────────────────────────────────────────────────────────────────────
function ns() { return Number(process.hrtime.bigint()); }
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
  return out;
}

function drucken(titel, U) { console.log('── ' + titel); for (const u of U) console.log((u.urteil + '     ').slice(0, 6) + ' ' + u.name.padEnd(22) + ' ' + u.wert + (u.schwelle ? '   [Schwelle ' + u.schwelle + ']' : '')); }

// ── Haupt ──────────────────────────────────────────────────────────────────────────────────────────────
if (!isMainThread) {
  const r = workerData.saaten.map(s => saatStatistik(s));
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
    for (const [samen, t, breite, pre] of liste) {
      const plan = planVon(samen); const S = P.planetScheibe(plan, t);
      for (const schicht of ['relief', 'platten', 'alter']) {
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
    Promise.all(teile.map(t => new Promise((res, rej) => { const w = new Worker(__filename, { workerData: { saaten: t } }); w.on('message', res); w.on('error', rej); }))).then(rs => {
      const R = rs.flat().sort((x, y) => (x.samen < y.samen ? -1 : 1));
      if (argv.includes('--roh')) for (const r of R) console.log(JSON.stringify(r));
      drucken('Richter bau1 · ' + R.length + ' Saaten · ' + ((ns() - a) / 1e9).toFixed(0) + ' s', urteilBau1(R));
    });
  } else if (argv[0] === '--kosten') drucken('Kosten', kosten());
  else if (argv[0] === '--bytes') drucken('Bytes', bytes());
  else if (argv[0] === '--selbsttest') { const U = selbsttest(); drucken('Selbsttest', U); if (U.some(u => u.urteil !== 'GRÜN')) process.exit(1); }
  else console.log('diag-planet: --karte | --karten | --bildsaaten | --richter bau1 | --kosten | --bytes | --selbsttest');
}
module.exports = { png, crc32, sha, planVon, saatStatistik, urteilBau1 };
