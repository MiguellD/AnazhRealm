#!/usr/bin/env node
// diag-planet.cjs — Richter-Werkzeug des Kerns planet-core.js (Entscheid im Zweig koordination, vision/planet/ENTSCHEID §3, bau1).
// node ohne Fremd-Pakete. PNG selbst geschrieben (Signatur, IHDR, IDAT über zlib.deflateSync, IEND, CRC-32 aus eigener Tafel).
//
//   --karte <samen> <zeitMa> <schicht> <breitePx> <aus.png>   eine Karte (relief | platten | alter); erde-* trägt den Erd-Schlüssel
//   --karten <samen> <zeitMa> <breitePx> <praefix>            alle drei Schichten einer Saat
//   --bildsaaten <breitePx> <ordner>                          die fünf aus dem Hash der Saat-Liste gezogenen Saaten, drei Schichten
//   --richter bau1 [--saaten N]                               Erd-Statistik über erde-01 … erde-30, Urteil je Messname
//   --richter gesicht [--saaten N]                            Gestalt des Landes (ENTSCHEID-2 G1), Gitter 720×360, t = 0
//   (ohne Argument)                                           Richter welle1: je Bahn der Bau-Welle 1 die Linse am Kern (B1 … B5, FÄLLT)
//   --richter ort [--saaten N]                                die Brücke gezielt: ort.delta.null am Anker jeder Saat (samt Jahres-Phase), ort.leser
//   --bildpaar <alt-kern.js> <samen> <zeitMa> <schicht> <px> <aus.png>   oben der alte Kern, unten der Kern im Baum
//   Umgebung PLANET_KERN=<kern.js>: der Richter liest diesen Kern statt des Baums (vorher ↔ nachher unter gleicher Last)
//   --kosten                                                  Kosten-Schwellen (Punkt, Platten-Zahl, Radius, Plan, Scheibe, Meer, Karte, Wasser)
//   --bytes                                                   Determinismus (Absenz, Mathe-Genauigkeit, SHA über Prozesse/jitless/Reihenfolge)
//   --anker [--selftest]                                      die Wand in der CI (gate:worker-dichte, Familie K6): die Zeile anker.jede-saat allein —
//                                                             jede Saat des Spiels trägt eine Heimat; der Selbsttest pflanzt beide Täter der Treppe;
//                                                             dazu ort.neigung (Karte 2 bahn-klima#2): ohne Neigung kein Jahres-Gang am Ort
//   --selftest (= --selbsttest, die Schreibung der Familie)   gepflanzte Fehler (Transzendente, gerade Küste, Facette) müssen ROT werden;
//                                                             der Kern vor der Welle 1 (b7ed8419, aus git) macht jede Zeile welle1 ROT
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
require('./lib/welt-boot.cjs'); /* global rang */ // der EINE Rang der Prüf-Skripte (welt-boot legt ihn global)
const { Worker, isMainThread, parentPort, workerData } = require('worker_threads');

const KERN = process.env.PLANET_KERN ? path.resolve(process.env.PLANET_KERN) : path.join(__dirname, '..', 'planet-core.js'); // PLANET_KERN: Vergleichs-Kern für vorher ↔ nachher (nur der Richter)
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

// R5 der Richter baut seinen Plan mit dem Körper der Erde (PLANET_ERDE trägt das Jahr des Ort-Gesetzes, 365 — Gegner Reise F4), nie mit einem eigenen Jahr
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
function quantil(a, q) { return rang([...a].sort((x, y) => x - y), q); }

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
    meer: { abweichung: Math.abs(wasser - (plan.koerper.wasserKm - S.eisKm)) / (plan.koerper.wasserKm - S.eisKm), stufen, monoton }, // flüssiges Wasser: Volumen minus Eis (bau3)
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
  // Nach dem Angriff: Meereis (eis 2) ist Winter-Eis — es widerspricht einem warmen WINTER, nicht einem warmen Sommer (Ochotsk);
  // Land-Eis (eis 1, EF) bleibt an den Sommer gebunden.
  return { eisWarm: (B.eis === 1 && K.tSommerC > 5) || (B.eis === 2 && K.tWinterC >= -12) ? 1 : 0, wuesteNass: (B.koeppen === 3 || B.koeppen === 4) && K.niederschlagMm > 1500 ? 1 : 0, regenOhneMeer: land && K.niederschlagMm >= 1500 && !K.meerLuv ? 1 : 0 };
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
  // Nach dem Angriff (Gegner 2): eine reine Obergrenze ließ einen Planeten ohne Wüste GRÜN — die heiße Wüste trägt eine Untergrenze
  // (BWh Median ≥ 7 %, die Hälfte von Peel 2007 14,2 %, Literatur aus dem Gedächtnis, ungeprüft).
  const bwh = med(r => r.koeppen[3]);
  zeile('klima.wueste', z(r => r.haupt[1] <= 0.45) >= Math.ceil(0.9 * n) && bwh >= 0.07, 'B ≤ 45 % in ' + z(r => r.haupt[1] <= 0.45) + '/' + n + ' (B Median ' + (100 * hm[1]).toFixed(1) + ' %, max ' + (100 * Math.max(...R.map(r => r.haupt[1]))).toFixed(1) + ' %) · BWh Median ' + (100 * bwh).toFixed(1) + ' % (Band ' + (100 * Math.min(...R.map(r => r.koeppen[3]))).toFixed(1) + '–' + (100 * Math.max(...R.map(r => r.koeppen[3]))).toFixed(1) + ' %)', '≥ 27/30 · BWh ≥ 7 %');
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
function ortGesetz() { // das Ort-Gesetz ist die EINE Tafel des Gelände-Kerns (Export `ortGesetz()`): der Richter liest sie wie der Faden des Spiels, kein Nachbau
  require(path.join(__dirname, '..', 'gelaende-core.js')); const G = globalThis.__gelaendeCore;
  if (!G || typeof G.ortGesetz !== 'function') throw new Error('gelaende-core: der Export ortGesetz fehlt');
  return G.ortGesetz();
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
// G3.2 die Linse nennt den Täter: je Material-Punkt die Terme der Höhe (Kern _intern.terme, Summe + Spiegel = Höhe); je Sprung > 1 km
// der Term mit dem größten |Δ|. Gebirge heißt Orogen oder Gedächtnis, je nachdem welcher der beiden sich mehr bewegt.
const TERME = ['boden', 'profil', 'mantel', 'schablone', 'trapp', 'orogen', 'gedaechtnis', 'kegel', 'nachklang', 'spiegel'];
function materialTerme(plan, M, t) {
  const S = P.planetScheibe(plan, t), T = {}, o = {};
  return M.map(([s, x, y, z]) => { const h = P.planetPunktR(S, ...qRot(S.qS, 4 * s, x, y, z), 40, o) / 1000; P._intern.terme(T);
    const summe = T.boden + T.profil + T.mantel + T.schablone + T.trapp + T.gebirge + T.kegel + T.nachklang;
    return { h, boden: T.boden, profil: T.profil, mantel: T.mantel, schablone: T.schablone, trapp: T.trapp, gebirge: T.gebirge, oro: T.orogen, mem: T.gedaechtnis, kegel: T.kegel, nachklang: T.nachklang, spiegel: h - summe, eigen: o.platte === S.sgrp[s] }; });
}
function taeterVon(a, b) { // a, b: Terme eines Punkts zu zwei Zeiten → Name des Terms mit dem größten |Δ|
  const d = { boden: b.boden - a.boden, profil: b.profil - a.profil, mantel: b.mantel - a.mantel, schablone: b.schablone - a.schablone, trapp: b.trapp - a.trapp,
    gebirge: b.gebirge - a.gebirge, kegel: b.kegel - a.kegel, nachklang: b.nachklang - a.nachklang, spiegel: b.spiegel - a.spiegel };
  let best = 'boden'; for (const k in d) if (Math.abs(d[k]) > Math.abs(d[best])) best = k;
  const name = best === 'gebirge' ? (Math.abs(b.oro - a.oro) >= Math.abs(b.mem - a.mem) ? 'orogen' : 'gedaechtnis') : best;
  return (a.eigen && b.eigen) ? name : 'fremd·' + name;   // fremd: der Punkt liegt nicht auf der Platte seiner Scholle (kein Material dieser Platte)
}
function stetigTaeter(A, B, zaehler) { for (let i = 0; i < A.length; i++) if (Math.abs(B[i].h - A[i].h) > 1) { const n = taeterVon(A[i], B[i]); zaehler[n] = (zaehler[n] || 0) + 1; } return zaehler; }
// G3.3 Küsten-Pixel ohne Partner nach der Größe ihres Landstücks (≥ 10⁴ km² · darunter); Meer-Pixel lesen ihr größtes Nachbar-Stück
function ohnePartnerNachGroesse(m, W, H, R, ds) {
  const gew = new Float64Array(H); for (let r = 0; r < H; r++) gew[r] = Math.cos(Math.PI / 2 - Math.PI * (r + 0.5) / H) * (2 * Math.PI * R / W) * (Math.PI * R / H);
  const K = komponenten(m, W, H, gew), L = kuestenPixel(m, W, H); let gross = 0, klein = 0;
  L.forEach((p, j) => { if (ds[j] < 1e8) return; const r = Math.floor(p / W), i = p - r * W; let f = 0;
    for (let dr = -1; dr <= 1; dr++) for (let di = -1; di <= 1; di++) { const rr = r + dr; if (rr < 0 || rr >= H) continue; const q = rr * W + (i + di + W) % W; if (m[q]) f = Math.max(f, K.K[K.lab[q]].flaeche); }
    if (f >= 1e4) gross++; else klein++; });
  return { gross, klein };
}
// zeit.schritt: Land-IoU in 5-Ma-Schritten über [−200, +50] Ma (256×128, |Breite| < 70°): kleinster Schritt ÷ Median der Saat
function iouSchritte(masken, W, H) { const out = []; for (let k = 1; k < masken.length; k++) { const a = masken[k - 1], b = masken[k]; let u = 0, s = 0;
  for (let r = 0; r < H; r++) { if (Math.abs(90 - 180 * (r + 0.5) / H) >= 70) continue; const g = Math.cos(Math.PI / 2 - Math.PI * (r + 0.5) / H); for (let i = 0; i < W; i++) { const p = r * W + i; if (a[p] || b[p]) u += g; if (a[p] && b[p]) s += g; } }
  out.push(u > 0 ? s / u : 1); } return out; }
function schrittVerhaeltnis(iou) { return Math.min(...iou) / median(iou); }
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
  const plan = planVon(samen), og = ortGesetz(), R = plan.R, k = P.planetHash('bau3|' + samen), out = { samen };
  // drift.cm_a
  out.drift = []; for (let i = 0; i < 20; i++) out.drift.push(...driftJe(plan, -540 + 790 * P.planetZufall(k, 1, i, 0)));
  // zeit.stetig: 400 Materialpunkte je Saat × 20 Zeiten (10 zufällig, 10 Schlüsselbilder in [−540; +250]), Schritt 0,1 Ma
  const M = materialPunkte(plan, 400, 'stetig|' + samen), zeiten = [];
  for (let i = 0; i < 10; i++) zeiten.push(-540 + 790 * P.planetZufall(k, 2, i, 0));
  const bl = []; for (let i = 0; i < plan.nB; i++) if (plan.bilder[i] > -540 && plan.bilder[i] < 250) bl.push(plan.bilder[i]);
  for (let i = 0; i < 10 && bl.length; i++) zeiten.push(bl[i % bl.length]);
  out.stetig = { mx: 0, ueber: 0, n: 0, bildMx: 0, taeter: {} };
  zeiten.forEach((t, j) => { const A = materialTerme(plan, M, t - 0.05), B = materialTerme(plan, M, t + 0.05); const r = stetigZaehlen(A.map(v => v.h), B.map(v => v.h)); stetigTaeter(A, B, out.stetig.taeter);
    out.stetig.n += r.n; out.stetig.ueber += r.ueber; out.stetig.mx = Math.max(out.stetig.mx, r.mx); if (j >= 10) out.stetig.bildMx = Math.max(out.stetig.bildMx, r.mx); });
  // Küsten-Versatz zwischen Karten im Abstand 1 Ma: an einer Zufalls-Zeit und am Schlüsselbild nächst 0 (über das Bild hinweg)
  out.kueste = [];
  for (const t of [-540 + 790 * P.planetZufall(k, 3, 0, 0), bildNaechst(plan, 0, 0) - 0.5]) {
    const W = 512, H = 256, a = landMaske(P.planetScheibe(plan, t), W, H), b = landMaske(P.planetScheibe(plan, t + 1), W, H);
    const dAB = kuestenVersatz(a, b, W, H, R), dBA = kuestenVersatz(b, a, W, H, R), ds = dAB.concat(dBA), gef = ds.filter(d => d < 1e8);
    const ga = ohnePartnerNachGroesse(a, W, H, R, dAB), gb = ohnePartnerNachGroesse(b, W, H, R, dBA);
    out.kueste.push({ t, max: Math.max(...ds), maxGef: Math.max(0, ...gef), ohne: ds.length - gef.length, ohneGross: ga.gross + gb.gross, ohneKlein: ga.klein + gb.klein, p99: quantil(ds, 0.99), n: ds.length });
  }
  // zeit.schritt: Land-IoU in 5-Ma-Schritten über [−200, +50] Ma
  { const Ws = 256, Hs = 128, mk = []; for (let t = -200; t <= 50; t += 5) mk.push(landMaske(P.planetScheibe(plan, t), Ws, Hs)); const iou = iouSchritte(mk, Ws, Hs);
    out.schritt = { min: Math.min(...iou), median: median(iou), verh: schrittVerhaeltnis(iou), wo: -195 + 5 * iou.indexOf(Math.min(...iou)) }; }
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
  out.deltaNull = deltaNull(o0.delta);
  out.reise = zeitReise(plan, samen);
  out.anker = { breite: A.breite, laenge: A.laenge, sommer: o0.klima.sommer, winter: o0.klima.winter, kueste: A.kuesteKm, randNah, wl: Object.is(o0.meer.waterLevelM, -3), land: P.planetPunkt(S0, A.breite, A.laenge, 16) > 0 };   // B5 Land im Band des Orts (fuss 16)
  const ids = ['land', 'hoehe', 'rauhLambda', 'trog', 'ks', 'tafel'];   // FÄLLT e217/e222/e223: die drei Δ ≡ 0 reisen nicht mehr
  let orte = 0, inBereich = 0; const ko = P.planetHash('orte|' + samen), oO = {};
  for (let i = 0; orte < 256 && i < 20000; i++) { const y = 2 * P.planetZufall(ko, 1, i, 0) - 1, lam = 2 * Math.PI * P.planetZufall(ko, 2, i, 0) - Math.PI, phi = Math.asin(y);
    if (!(P.planetPunkt(S0, phi, lam, 40) > 0)) continue; orte++; P.planetOrt(S0, phi, lam, og, oO);
    if (ids.every(id => { const r = og.regler.find(z => z.id === id); const v = oO.wildnis[id]; return Number.isFinite(v) && v >= r.min && v <= r.max; })) inBereich++; }
  out.bereich = { orte, inBereich };
  return out;
}
// R2 ort.delta.null: am Anker (t = 0) ist jedes Feld von planetOrt().delta Object.is(…, 0), das Verhältnis der Spende und des Wuchses (Krautschicht,
// Wald) genau 1 und jede der 81 Stützen 0
function deltaNull(dl) { if (!dl || !dl.leit) return false; const z = (v) => Object.is(v, 0);
  return Object.values(dl.wildnis).every(z) && z(dl.meer.waterLevelM) && ['sommer', 'winter', 'tagAmp', 'sommerPhase'].every(f => z(dl.klima[f])) && dl.klima.spendeVerh === 1 &&
    !!dl.wuchs && dl.wuchs.decke === 1 && dl.wuchs.wald === 1 && !!dl.eis && z(dl.eis.zeit) &&
    ['windX', 'windZ', 'regenQuote', 'sturmQuote'].every(f => z(dl.wetter[f])) && Array.from(dl.leit.huelleM).every(z) && Array.from(dl.leit.landC).every(z); }
// R3 zeit.reise: 256 Orte je Saat, t0 = 0 → t1 = −100 Ma mit planetOrtDerZeit; Kruste bleibt Kruste; hin und zurück (Kruste) ≤ 10⁻⁹ rad
// (Sehne der Einheitsvektoren); wo die Rückreise eine andere Scholle findet (Überdeckung zweier Krusten), steht es beim Namen
function zeitReise(plan, samen, Q = P) { const t0 = 0, t1 = -100, S1 = Q.planetScheibe(plan, t1), k = Q.planetHash('zeitreise|' + samen), o = {}, b = {}, q = {};
  let n = 0, nicht = 0, krN = 0, krOk = 0, rtN = 0, rtOk = 0, ueber = 0, mx = 0;
  for (let i = 0; i < 256; i++) { const y = 2 * Q.planetZufall(k, 1, i, 0) - 1, lam = 2 * Math.PI * Q.planetZufall(k, 2, i, 0) - Math.PI, phi = Math.asin(y); n++;
    Q.planetOrtDerZeit(plan, phi, lam, t0, t1, o); if (!o.existiert) { nicht++; continue; } if (o.scholle < 0) continue;
    krN++; Q.planetPunkt(S1, o.breite, o.laenge, 40, q); if (q.scholle >= 0) krOk++;
    Q.planetOrtDerZeit(plan, o.breite, o.laenge, t1, t0, b); rtN++; if (b.scholle !== o.scholle) { ueber++; continue; }
    const a3 = Q.planetRichtung(phi, lam), b3 = Q.planetRichtung(b.breite, b.laenge), d = Math.hypot(a3[0] - b3[0], a3[1] - b3[1], a3[2] - b3[2]); if (d <= 1e-9) rtOk++; mx = Math.max(mx, d); }
  return { n, nicht, krN, krOk, rtN, rtOk, ueber, mx }; }
function taeterText(R) { const T = {}; for (const r of R) for (const k in r.stetig.taeter || {}) T[k] = (T[k] || 0) + r.stetig.taeter[k];
  const L = Object.keys(T).sort((a, b) => T[b] - T[a]).map(k => k + ' ' + T[k]); return L.length ? L.join(' · ') : 'keine'; }
function urteilBau3(R, extra) {
  const n = R.length, z = (f) => R.filter(f).length, U = [];
  const zeile = (name, ok, wert, schwelle) => U.push({ name, urteil: ok === null ? 'OFFEN' : (ok ? 'GRÜN' : 'ROT'), wert, schwelle });
  const dr = R.flatMap(r => r.drift);
  zeile('drift.cm_a', quantil(dr, 0.05) >= 1 && quantil(dr, 0.95) <= 15 && median(dr) >= 2 && median(dr) <= 8, 'p05 ' + quantil(dr, 0.05).toFixed(2) + ' · Median ' + median(dr).toFixed(2) + ' · p95 ' + quantil(dr, 0.95).toFixed(2) + ' cm/a (' + dr.length + ' Kontinent × Zeit)', 'p05 ≥ 1, p95 ≤ 15, Median 2–8');
  const sn = R.reduce((a, r) => a + r.stetig.n, 0), su = R.reduce((a, r) => a + r.stetig.ueber, 0), smx = Math.max(...R.map(r => r.stetig.mx)), sbm = Math.max(...R.map(r => r.stetig.bildMx));
  const kv = R.flatMap(r => r.kueste), kmx = Math.max(...kv.map(k => k.max)), kmg = Math.max(...kv.map(k => k.maxGef)), kohne = kv.reduce((a, k) => a + k.ohne, 0), kn = kv.reduce((a, k) => a + k.n, 0), kp = median(kv.map(k => k.p99));
  zeile('zeit.stetig', su === 0 && kmx <= 150, 'Höhe: ' + su + '/' + sn + ' Material-Schritte > 1 km je 0,1 Ma (' + (100 * (1 - su / sn)).toFixed(3) + ' % ≤ 1 km), max ' + smx.toFixed(2) + ' km, an Schlüsselbildern max ' + sbm.toFixed(2) + ' km; Küsten-Versatz 1 Ma (Hausdorff): ' + (kohne ? kohne + '/' + kn + ' Küsten-Pixel ohne Partner im ±470-km-Fenster (an Stücken ≥ 10⁴ km² ' + kv.reduce((a, k) => a + (k.ohneGross || 0), 0) + ' · darunter ' + kv.reduce((a, k) => a + (k.ohneKlein || 0), 0) + '), ' : '') + 'max gepaart ' + kmg.toFixed(0) + ' km, p99 Median ' + kp.toFixed(0) + ' km (' + kv.length + ' Kartenpaare); Täter der Höhen-Sprünge: ' + taeterText(R), '≤ 1 km je 0,1 Ma; ≤ 150 km');
  if (R.every(r => r.schritt)) { const sv = R.map(r => r.schritt.verh), ok = z(r => r.schritt.verh >= 0.9);
    zeile('zeit.schritt', ok >= Math.ceil(0.9 * n), 'kleinster ÷ Median der Land-IoU je 5 Ma über −200 … +50 Ma: Median ' + median(sv).toFixed(3) + ' (min ' + Math.min(...sv).toFixed(3) + '), ≥ 0,90 in ' + ok + '/' + n + '; IoU je Schritt Median ' + median(R.map(r => r.schritt.median)).toFixed(3) + ', schlechtester ' + Math.min(...R.map(r => r.schritt.min)).toFixed(3), '≥ 0,90 in ≥ 27/30'); }
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
  { const s = (f) => R.reduce((a, r) => a + r.reise[f], 0); zeile('zeit.reise', s('krOk') === s('krN') && s('rtOk') === s('rtN'), 'Kruste bei 0 Ma ist Kruste bei −100 Ma: ' + s('krOk') + '/' + s('krN') + '; hin und zurück ≤ 10⁻⁹ rad ' + s('rtOk') + '/' + s('rtN') + ' (davon ' + s('ueber') + ' mit anderer Scholle auf dem Rückweg: Überdeckung zweier Krusten; größte Sehne der übrigen ' + Math.max(...R.map(r => r.reise.mx)).toExponential(1) + '); Ozean-Boden, den es bei −100 Ma nicht gab: ' + s('nicht') + '/' + s('n'), 'Kruste 100 %; hin und zurück ≤ 10⁻⁹ rad'); }
  zeile('ort.delta.null', z(r => r.deltaNull) === n, 'am Anker t = 0 jedes Δ-Feld +0, Spende-Verhältnis 1, 81 Leit-Stützen 0 in ' + z(r => r.deltaNull) + '/' + n, '30/30');
  if (extra.ortKosten) zeile('ort.kosten', extra.ortKosten.ok, extra.ortKosten.wert, 'planetOrt ≤ 1 ms, planetAnker ≤ 10 ms, gleiche Bytes');
  if (extra.leser) leserZeile(zeile, extra.leser);
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
  const og = ortGesetz(), an = [], ort = []; let gleich = true;
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
function leserZeile(zeile, L) { zeile('ort.leser', L.n >= 1, 'Leser des Kerns im Spiel ' + L.n + ' (' + L.wert + '); den Ort als Differenz (planetOrt) lesen ' + L.ort.length + (L.ort.length ? ' (' + L.ort.join(', ') + ')' : ' — gelesen wird der Anker (Lage, Küste, VERSION), von den 23 gelieferten Feldern des Orts 0'), '≥ 1, beim Namen'); }
// Richter ort (Reise): die zwei Zeilen der Brücke gezielt, ohne die Zeit-Statistik von bau3 — ort.delta.null über jedes Δ-Feld samt der Jahres-Phase
// am Anker jeder Saat (dieselbe Funktion deltaNull wie bau3), und ort.leser
function urteilOrt(saaten) { const og = ortGesetz(), U = [], zeile = (name, ok, wert, schwelle) => U.push({ name, urteil: ok ? 'GRÜN' : 'ROT', wert, schwelle }); let n = 0, sued = 0;
  for (const s of saaten) { const plan = planVon(s), S0 = P.planetScheibe(plan, 0), A = P.planetAnker(plan, 0, og); if (A.breite < 0) sued++; if (deltaNull(P.planetOrt(S0, A.breite, A.laenge, og).delta)) n++; }
  zeile('ort.delta.null', n === saaten.length, 'am Anker t = 0 jedes Δ-Feld +0 (samt der Jahres-Phase), Spende-Verhältnis 1, 81 Leit-Stützen 0 in ' + n + '/' + saaten.length + ' (davon ' + sued + ' Anker auf der Süd-Halbkugel)', saaten.length + '/' + saaten.length);
  leserZeile(zeile, leserImSpiel()); landungZeile(zeile); return U; }
// ort.landung (K5, w28-reise-ort): 400 Land-Ziele des Samens der Welt (gleichverteilt auf der Kugel, Land im Relief des Planeten, fuss
// 16 km wie der Satz „reise"), je Ziel die Geburt wie im Spiel — das Erbgut des Orts (`ortErbgut` aus der Heimat), die Reihe der
// Ort-Saaten (gelaende-core `ortSaatWahl`) — und das Urteil des Makro-Gesetzes an der Ankunft (`ortLandung`). Küste: |Abstand zur Küste|
// < 100 km. Daneben die erste Saat allein (die Reihe von vor w28-reise-ort) als Lesewert.
function landungZeile(zeile) {
  require(path.join(__dirname, '..', 'gelaende-core.js')); const G = globalThis.__gelaendeCore, RN = require(path.join(__dirname, '..', 'vendor', 'simplex-noise.js'));
  const SN = RN.SimplexNoise || RN.default || RN, samen = 'anazh-realm-seed', og = G.ortGesetz(), S = P.planetScheibe(P.planetPlan(samen, P.PLANET_ERDE), 0), RAD = Math.PI / 180, k = P.planetHash('landung|' + samen), heim = G.erbgutNormal(undefined);
  let n = 0, ja = 0, erste = 0, kN = 0, kJa = 0, kmax = 0;
  for (let i = 0; n < 400 && i < 20000; i++) {
    const br = Math.round(Math.asin(2 * P.planetZufall(k, 1, i, 0) - 1) / RAD * 100) / 100, la = Math.round((P.planetZufall(k, 2, i, 0) * 360 - 180) * 100) / 100, p = {};
    P.planetPunkt(S, br * RAD, la * RAD, 16, p); if (!(p.hoeheM > 0)) continue; n++;
    const d = P.planetOrt(S, br * RAD, la * RAD, og).delta, teil = { samen, version: P.VERSION, breite: br, laenge: la, zeitMa: 0, delta: { klima: d.klima, meer: d.meer, wetter: d.wetter, wuchs: d.wuchs, eis: d.eis, wildnis: d.wildnis } };
    const w = G.ortSaatWahl(teil, G.erbgutNormal(G.ortErbgut(heim, d.wildnis)), SN), kueste = Math.abs(p.kont) < 100;
    if (kueste) kN++; if (w.landung) { ja++; if (kueste) kJa++; if (w.k === 0) erste++; kmax = Math.max(kmax, w.k); }
  }
  zeile('ort.landung', ja === n && kJa === kN, n + ' Land-Ziele: Grund an der Ankunft ' + ja + '/' + n + ' (Küste ' + kJa + '/' + kN + '), die erste Saat allein ' + erste + '/' + n + ', die längste Reihe ' + kmax + ' von ' + G.LANDUNG.reihe, n + '/' + n);
}
function leserImSpiel() { // die Spiel-Dateien (*.js außerhalb scripts/ und des Kerns), die den Namensraum des Kerns lesen, und die, die den Ort als Differenz lesen
  const wurzel = path.join(__dirname, '..');
  const grep = (muster) => { let out = ''; try { out = execFileSync('git', ['-C', wurzel, 'grep', '-l', '-E', muster, '--', '*.js', ':!scripts', ':!planet-core.js'], { encoding: 'utf8' }); } catch (e) { out = e.stdout || ''; } return out.split('\n').filter(Boolean); };
  const L = grep('__planetCore');
  return { n: L.length, wert: L.length ? L.join(', ') : 'git grep __planetCore in *.js außerhalb scripts/ und des Kerns: 0 Treffer', ort: grep('planetOrt\\(') };
}

// Kontaktbogen (Kacheln 1 248 px gerechnet, 4:1 gemittelt): EIN Samen — Reihe 1 bei t = 0 relief · platten · temperatur · niederschlag · biom; Reihe 2 relief und Reihe 3 biom an
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
// Kachel aus der 4-fachen Karte gemittelt (4×4-Kasten): dieselbe Abtast-Dichte wie die großen Karten, nur verkleinert
function verkleinern(rgb, W, f) { const w = W / f, h = W / 2 / f, o = new Uint8Array(w * h * 3); for (let r = 0; r < h; r++) for (let i = 0; i < w; i++) for (let c = 0; c < 3; c++) { let s = 0; for (let dy = 0; dy < f; dy++) for (let dx = 0; dx < f; dx++) s += rgb[((r * f + dy) * W + i * f + dx) * 3 + c]; o[(r * w + i) * 3 + c] = Math.floor(s / (f * f) + 0.5); } return o; }
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
    const S = P.planetScheibe(plan, t), k = verkleinern(P.planetKarte(S, 4 * TW, schicht), 4 * TW, 4), x0 = M + si * (TW + M), y0 = M + zi * (LB + TH + M);
    schreiben(rgb, Wb, x0 + 2, y0 + 2, titel, 2);
    for (let r = 0; r < TH; r++) Buffer.from(k.buffer, r * TW * 3, TW * 3).copy(Buffer.from(rgb.buffer), ((y0 + LB + r) * Wb + x0) * 3);
  }));
  fs.mkdirSync(path.dirname(aus), { recursive: true }); const buf = png(rgb, Wb, Hb); fs.writeFileSync(aus, buf);
  console.log(JSON.stringify({ samen, versammelt: tv, breite: Wb, hoehe: Hb, sha256: sha(buf).slice(0, 16) }));
}
function orteDrucken(samen) { // die Brücke an drei Orten vorgerechnet: Anker · Gebirge · Trockenland, dazu der Anker bei −100 Ma
  const plan = planVon(samen), og = ortGesetz(), S0 = P.planetScheibe(plan, 0), A = P.planetAnker(plan, 0, og), k = P.planetHash('orte-drei|' + samen);
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
function kostenG1(altKern) { // ENTSCHEID-2 G1 Kosten-Deckel: Punkt ≤ 1,10 ×, Hülle ≤ 1,05 × Kern d660f478 (ABAB im selben Prozess, 7 Durchgänge); Plan ≤ 25 ms
  const out = []; const zeile = (name, ok, wert, schwelle) => out.push({ name, urteil: ok ? 'GRÜN' : 'ROT', wert, schwelle });
  const A = require(path.resolve(altKern)), saaten = ['erde-01', 'erde-05', 'erde-09'];
  const SA = saaten.map(s => A.planetScheibe(A.planetPlan(s, Object.assign({}, A.PLANET_ERDE)), 0)), SN = saaten.map(s => P.planetScheibe(planVon(s), 0));
  const huelle = (Q, S, n, saat) => { const k = Q.planetHash(saat), t = new Float64Array(n); for (let i = 0; i < n; i++) { const y = 2 * Q.planetZufall(k, 1, i, 1) - 1, ph = 6.283185307179586 * Q.planetZufall(k, 1, i, 2), q = Math.sqrt(1 - y * y); const a = ns(); Q.planetHuelle(S, q * Math.cos(ph), y, q * Math.sin(ph)); t[i] = ns() - a; } return quantil(t, 0.5) / 1000; };
  const pA = [], pN = [], hA = [], hN = [];
  for (let d = 0; d < 7; d++) for (let j = 0; j < saaten.length; j++) {
    pA.push(punktKostenMit(A, SA[j], 8000, 'g' + d)); pN.push(punktKostenMit(P, SN[j], 8000, 'g' + d));
    hA.push(huelle(A, SA[j], 8000, 'h' + d)); hN.push(huelle(P, SN[j], 8000, 'h' + d));
  }
  const vP = median(pN) / median(pA), vH = median(hN) / median(hA);
  zeile('kosten.punkt.g0', vP <= 1.10, 'd660f478 ' + median(pA).toFixed(2) + ' µs ↔ jetzt ' + median(pN).toFixed(2) + ' µs (×' + vP.toFixed(3) + ', ABAB, 7 × 3 Saaten × 8 000)', '≤ 1,10 ×');
  zeile('kosten.huelle.g0', vH <= 1.05, 'd660f478 ' + median(hA).toFixed(2) + ' µs ↔ jetzt ' + median(hN).toFixed(2) + ' µs (×' + vH.toFixed(3) + ')', '≤ 1,05 ×');
  const plA = [], plN = []; for (let d = 0; d < 5; d++) for (const s of saaten) { let a = ns(); A.planetPlan(s + '-k' + d, Object.assign({}, A.PLANET_ERDE)); plA.push((ns() - a) / 1e6); a = ns(); P.planetPlan(s + '-k' + d, Object.assign({}, P.PLANET_ERDE)); plN.push((ns() - a) / 1e6); }
  zeile('kosten.plan', median(plN) <= 25, 'd660f478 ' + median(plA).toFixed(1) + ' ms ↔ jetzt ' + median(plN).toFixed(1) + ' ms (Median 15 Pläne)', '≤ 25 ms');
  const kA = [], kN = []; for (let d = 0; d < 3; d++) for (const s of saaten) { const pa = A.planetPlan(s + '-s' + d, Object.assign({}, A.PLANET_ERDE)), pn = P.planetPlan(s + '-s' + d, Object.assign({}, P.PLANET_ERDE)); let a = ns(); A.planetScheibe(pa, 0); kA.push((ns() - a) / 1e6); a = ns(); P.planetScheibe(pn, 0); kN.push((ns() - a) / 1e6); }
  zeile('kosten.scheibe.kalt', null, 'd660f478 ' + median(kA).toFixed(0) + ' ms ↔ jetzt ' + median(kN).toFixed(0) + ' ms (Median 9, t = 0)', 'G3 richtet');
  return out.map(u => (u.urteil === 'ROT' && u.name === 'kosten.scheibe.kalt' ? Object.assign(u, { urteil: 'INFO' }) : u));
}
function kostenG2(altKern) { // ENTSCHEID-2 G2 Kosten-Deckel: planetKlima Land ≤ +12 µs, planetPunkt ≤ +1 µs gegen den Vergleichs-Kern (ABAB im selben Prozess, 7 Durchgänge)
  const out = []; const zeile = (name, ok, wert, schwelle) => out.push({ name, urteil: ok === null ? 'INFO' : (ok ? 'GRÜN' : 'ROT'), wert, schwelle });
  delete globalThis.__planetCore; const A = require(path.resolve(altKern)); delete globalThis.__planetCore; const saaten = ['erde-01', 'erde-05', 'erde-09'];
  const SA = saaten.map(s => A.planetScheibe(A.planetPlan(s, Object.assign({}, A.PLANET_ERDE)), 0)), SN = saaten.map(s => P.planetScheibe(planVon(s), 0));
  const landProben = (Q, S, saat) => { const k = Q.planetHash('klima-' + saat), L = []; for (let i = 0; L.length < 4000; i++) { const y = 2 * Q.planetZufall(k, 1, i, 1) - 1, ph = 6.283185307179586 * Q.planetZufall(k, 1, i, 2), q = Math.sqrt(1 - y * y), pt = {}; if (Q.planetPunktR(S, q * Math.cos(ph), y, q * Math.sin(ph), 40, pt) > 0) L.push([q * Math.cos(ph), y, q * Math.sin(ph), pt]); } return L; };
  const LA = saaten.map((s, j) => landProben(A, SA[j], s)), LN = saaten.map((s, j) => landProben(P, SN[j], s));
  const klima = (Q, S, L) => { const t = new Float64Array(L.length), K = {}; let i = 0; for (const [x, y, z, pt] of L) { const a = ns(); Q.planetKlimaR(S, x, y, z, -1, K, pt); t[i++] = ns() - a; } return quantil(t, 0.5) / 1000; };
  const pA = [], pN = [], kA = [], kN = [];
  for (let d = 0; d < 7; d++) for (let j = 0; j < saaten.length; j++) {
    pA.push(punktKostenMit(A, SA[j], 8000, 'g' + d)); pN.push(punktKostenMit(P, SN[j], 8000, 'g' + d));
    kA.push(klima(A, SA[j], LA[j])); kN.push(klima(P, SN[j], LN[j]));
  }
  const dP = median(pN) - median(pA), dK = median(kN) - median(kA);
  zeile('kosten.punkt.g2', dP <= 1, 'Vergleich ' + median(pA).toFixed(2) + ' µs ↔ jetzt ' + median(pN).toFixed(2) + ' µs (' + (dP >= 0 ? '+' : '') + dP.toFixed(2) + ' µs, ×' + (median(pN) / median(pA)).toFixed(3) + '; ABAB 7 × 3 Saaten × 8 000)', '≤ +1 µs');
  zeile('kosten.klima.g2', dK <= 12, 'Vergleich ' + median(kA).toFixed(2) + ' µs ↔ jetzt ' + median(kN).toFixed(2) + ' µs (' + (dK >= 0 ? '+' : '') + dK.toFixed(2) + ' µs, ×' + (median(kN) / median(kA)).toFixed(3) + '; Land, Zusatz zur Punkt-Abfrage, ABAB 7 × 3 Saaten × 4 000)', '≤ +12 µs');
  return out;
}
// ── G3 Kosten: Referenzfahrt (feste Rechen-Last aus dem Kern selbst) und Verhältnis gegen den Kern d660f478 im selben Prozess ──
// REF0: die kleinste von 20 Fahrten am Messplatz (--kosten ref0), eingefroren mit Gerät und Datum (Laptop AMD Ryzen AI 9 HX 370 /
// Radeon 890M, unter fremder Last). Die normierte Zeit ist t · REF0 ÷ Mittel(Fahrt vor, Fahrt nach); ein Paar mit mehr als 10 %
// Unterschied wird verworfen und wiederholt.
const REF0_MS = { wert: 104.59, geraet: 'Laptop AMD Ryzen AI 9 HX 370 (24 Fäden)', datum: '15.11.2026 01:12' };
function referenzFahrt() { const M = P.planetMathe; let s = 0; const a = ns(); for (let i = 0; i < 1400000; i++) { const u = P.planetZufall(0x5eed, i, 7, 3); s += M.ksin(6 * u) * M.kexp(-u) + M.katan2(u, 1 - u); } const ms = (ns() - a) / 1e6; if (!Number.isFinite(s)) throw new Error('Referenzfahrt'); return ms; }
function referenzWarm() { const f = []; for (let i = 0; i < 40; i++) { f.push(referenzFahrt()); if (f.length >= 5) { const l = f.slice(-5), m = l.reduce((a, b) => a + b) / 5; if (l.every(v => Math.abs(v - m) <= 0.05 * m)) return m; } } return median(f.slice(-5)); }
function sprungRef(ref0) { // planetScheibe kalt nach der Vorschrift von sprung(): Plan warm bei 0, neuer Abschnitt + Meer-Fächer
  // Gegner 2 (Zahl §3): G3.6 verlegte die Ketten in den ersten Punkt — gezählt wird auch das Bild: Scheibe + erster Punkt + 2 048 Punkte
  referenzWarm(); const roh = [], norm = [], fahrten = [], bild = [], F = P._intern.fib(2048);
  for (let i = 0; i < 5; i++) { for (let v = 0; v < 4; v++) { const plan = planVon('erde-sprung-' + i); P.planetScheibe(plan, 0); const t = -137.3 - 61 * i;
    const r1 = referenzFahrt(); const a = ns(); const S = P.planetScheibe(plan, t); const ms = (ns() - a) / 1e6;
    for (let j = 0; j < 2048; j++) P.planetPunktR(S, F[3 * j], F[3 * j + 1], F[3 * j + 2], 40); const msB = (ns() - a) / 1e6; const r2 = referenzFahrt();
    if (Math.abs(r1 - r2) > 0.1 * Math.min(r1, r2) && v < 3) continue; roh.push(ms); fahrten.push(0.5 * (r1 + r2)); norm.push(ms * ref0 / (0.5 * (r1 + r2))); bild.push(msB * ref0 / (0.5 * (r1 + r2))); break; } }
  return { roh, norm, fahrten, bild };
}
function kostenG3(altKern, ref0) {
  const out = []; const zeile = (name, ok, wert, schwelle) => out.push({ name, urteil: ok === null ? 'INFO' : (ok ? 'GRÜN' : 'ROT'), wert, schwelle });
  const og = ortGesetz();
  delete globalThis.__planetCore; const A = require(path.resolve(altKern)); delete globalThis.__planetCore; const saaten = ['erde-01', 'erde-05', 'erde-09'];
  const SA = saaten.map(s => A.planetScheibe(A.planetPlan(s, Object.assign({}, A.PLANET_ERDE)), 0)), SN = saaten.map(s => P.planetScheibe(planVon(s), 0));
  const landProben = (Q, S, saat) => { const k = Q.planetHash('klima-' + saat), L = []; for (let i = 0; L.length < 3000; i++) { const y = 2 * Q.planetZufall(k, 1, i, 1) - 1, ph = 6.283185307179586 * Q.planetZufall(k, 1, i, 2), q = Math.sqrt(1 - y * y), pt = {}; if (Q.planetPunktR(S, q * Math.cos(ph), y, q * Math.sin(ph), 40, pt) > 0) L.push([q * Math.cos(ph), y, q * Math.sin(ph), pt]); } return L; };
  const LA = saaten.map((s, j) => landProben(A, SA[j], s)), LN = saaten.map((s, j) => landProben(P, SN[j], s));
  const klima = (Q, S, L) => { const t = new Float64Array(L.length), K = {}; let i = 0; for (const [x, y, z, pt] of L) { const a = ns(); Q.planetKlimaR(S, x, y, z, -1, K, pt); t[i++] = ns() - a; } return quantil(t, 0.5) / 1000; };
  const AA = saaten.map((s, j) => A.planetAnker(SA[j].plan, 0, og)), AN = saaten.map((s, j) => P.planetAnker(SN[j].plan, 0, og));
  const ort = (Q, S, An) => { const t = [], o = {}; for (let j = 0; j < 200; j++) { const a = ns(); Q.planetOrt(S, An.breite + 0.0004 * j, An.laenge - 0.0002 * j, og, o); t.push((ns() - a) / 1e6); } return median(t); };
  const pA = [], pN = [], kA = [], kN = [], oA = [], oN = [];
  for (let d = 0; d < 7; d++) for (let j = 0; j < saaten.length; j++) {
    // Gegner 2 (Zahl §1): das Band ≤ 1,03 × trug die Herkunft „Streuung des ABAB", gemessen streute das Verhältnis der Mediane ±8 % (Klima)
    // und ±14 % (Ort). Jetzt: Reihenfolge je Durchgang gewechselt (AB, BA), das Urteil ist der Median der 21 Paar-Verhältnisse (die Last
    // eines Blocks trifft beide Seiten), Ort 200 statt 40 Orte je Block. Das Band bleibt.
    const ab = d % 2 === 0;
    if (ab) { pA.push(punktKostenMit(A, SA[j], 8000, 'g' + d)); pN.push(punktKostenMit(P, SN[j], 8000, 'g' + d)); } else { pN.push(punktKostenMit(P, SN[j], 8000, 'g' + d)); pA.push(punktKostenMit(A, SA[j], 8000, 'g' + d)); }
    if (ab) { kA.push(klima(A, SA[j], LA[j])); kN.push(klima(P, SN[j], LN[j])); } else { kN.push(klima(P, SN[j], LN[j])); kA.push(klima(A, SA[j], LA[j])); }
    if (ab) { oA.push(ort(A, SA[j], AA[j])); oN.push(ort(P, SN[j], AN[j])); } else { oN.push(ort(P, SN[j], AN[j])); oA.push(ort(A, SA[j], AA[j])); }
  }
  const v = (a, b) => median(a.map((x, i) => b[i] / x));
  zeile('kosten.punkt.g0', v(pA, pN) <= 1.03, 'd660f478 ' + median(pA).toFixed(2) + ' µs ↔ jetzt ' + median(pN).toFixed(2) + ' µs (×' + v(pA, pN).toFixed(3) + '; ABAB 7 × 3 Saaten × 8 000, Median der Paar-Verhältnisse)', '≤ 1,03 ×');
  zeile('kosten.klima.g0', v(kA, kN) <= 1.03, 'd660f478 ' + median(kA).toFixed(2) + ' µs ↔ jetzt ' + median(kN).toFixed(2) + ' µs (×' + v(kA, kN).toFixed(3) + '; Land, Zusatz zur Punkt-Abfrage, 7 × 3 Saaten × 3 000)', '≤ 1,03 ×');
  zeile('ort.kosten.g0', v(oA, oN) <= 1.03, 'd660f478 ' + median(oA).toFixed(3) + ' ms ↔ jetzt ' + median(oN).toFixed(3) + ' ms (×' + v(oA, oN).toFixed(3) + '; planetOrt warm, 7 × 3 Saaten × 200 Orte, Median der Paar-Verhältnisse)', '≤ 1,03 ×');
  const r0 = ref0 || REF0_MS.wert, sp = sprungRef(r0 || 1);
  zeile('zeit.sprung.bild', r0 ? median(sp.bild) <= 5000 : null, 'Scheibe + erster Punkt + 2 048 Punkte, normiert Median ' + median(sp.bild).toFixed(0) + ' ms (' + sp.bild.map(x => x.toFixed(0)).join(' · ') + ')', '≤ 5 000 ms (Preis-Treppe, REGELN)');
  zeile('zeit.sprung.ref', r0 ? median(sp.norm) <= 250 : null, r0 ? ('normiert Median ' + median(sp.norm).toFixed(0) + ' ms (' + sp.norm.map(x => x.toFixed(0)).join(' · ') + '; roh ' + sp.roh.map(x => x.toFixed(0)).join(' · ') + ' ms; Fahrt ' + median(sp.fahrten).toFixed(1) + ' ms gegen REF0 ' + r0.toFixed(1) + ' ms, ' + REF0_MS.geraet + ', ' + REF0_MS.datum + ')') : ('REF0 nicht eingefroren; roh ' + sp.roh.map(x => x.toFixed(0)).join(' · ') + ' ms'), '≤ 250 ms');
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
function kostenSkala(Q) { // die Kosten des Punkts wachsen nicht mit der Platten-Zahl und nicht mit dem Radius (Q: der gemessene Kern)
  const out = [], zeile = (name, ok, wert, schwelle) => out.push({ name, urteil: ok ? 'GRÜN' : 'ROT', wert, schwelle });
  const Sk = Q.planetScheibe(Q.planetPlan('erde-01', Object.assign({}, Q.PLANET_ERDE, { schollenZahl: 10, ozeanPlatten: 4 })), 0), Sg = Q.planetScheibe(Q.planetPlan('erde-01', Object.assign({}, Q.PLANET_ERDE, { schollenZahl: 40, ozeanPlatten: 8 })), 0);
  // Verhältnis-Richter nach dem Schätzer von G3 (Gegner 2, Zahl §1): je Durchgang die Aufbauten dicht hintereinander, die Reihenfolge
  // wechselt; das Urteil ist der Median der Verhältnisse je Durchgang — eine Last-Phase der Maschine trifft alle Seiten EINES Durchgangs.
  // Vorher das Minimum je Aufbau über 7 Durchgänge à 12 000: am selben Kern flackerte kosten.radius über Prozesse 1,29 ↔ 1,39 und
  // platten +37 ↔ +43 %, sechs frische Mond-Scheiben in einem Prozess liefen gleich schnell, die Maschine sprang in Phasen 4,7 ↔ 6,2 µs (19.11.)
  const Sr = [1737, 6371, 12742].map(R => Q.planetScheibe(Q.planetPlan('erde-01', Object.assign({}, Q.PLANET_ERDE, { radiusKm: R, g: 9.81 * R / 6371 })), 0));
  const tk = [], tg = [], rad = [[], [], []];
  for (let durchgang = 0; durchgang < 21; durchgang++) {
    const vor = durchgang % 2 === 0, s = 'p' + durchgang, r = 'r' + durchgang;
    if (vor) { tk.push(punktKostenMit(Q, Sk, 4000, s)); tg.push(punktKostenMit(Q, Sg, 4000, s)); } else { tg.push(punktKostenMit(Q, Sg, 4000, s)); tk.push(punktKostenMit(Q, Sk, 4000, s)); }
    for (const i of (vor ? [0, 1, 2] : [2, 1, 0])) rad[i].push(punktKostenMit(Q, Sr[i], 4000, r));
  }
  const vPl = median(tg.map((g, i) => g / tk[i])), vR = [0, 2].map(i => median(rad[i].map((t, d) => t / rad[1][d]))), vRad = Math.max(1, ...vR) / Math.min(1, ...vR);
  zeile('kosten.platten', vPl <= 1.4, 'nP ' + Sk.nP + ': ' + median(tk).toFixed(2) + ' µs ↔ nP ' + Sg.nP + ': ' + median(tg).toFixed(2) + ' µs (+' + (100 * (vPl - 1)).toFixed(0) + ' %, Median der Paar-Verhältnisse, 21 Durchgänge × 4 000)', '≤ +40 % (nP 9 ↔ 17)');
  // Radius bei gleichem Samen: je Durchgang Mond und Doppel-Erde gegen die Erde
  zeile('kosten.radius', vRad <= 1.35, rad.map(a => median(a).toFixed(2)).join(' · ') + ' µs (R 1 737 · 6 371 · 12 742), ÷ Erde je Durchgang ' + vR[0].toFixed(3) + ' · ' + vR[1].toFixed(3) + ', max/min ' + vRad.toFixed(3), '≤ 1,35');
  return out;
}
function kosten() {
  const out = [];
  const zeile = (name, ok, wert, schwelle) => { out.push({ name, urteil: ok ? 'GRÜN' : 'ROT', wert, schwelle }); };
  const plan = planVon('erde-01'); const S = P.planetScheibe(plan, 0);
  const pk = []; for (let i = 0; i < 5; i++) pk.push(punktKosten(S, 40000, 'kosten-' + i));
  const best = pk.reduce((a, b) => (a.median <= b.median ? a : b));
  zeile('kosten.punkt', best.median <= 8 && best.p95 <= 20, 'Median ' + best.median.toFixed(2) + ' µs, p95 ' + best.p95.toFixed(2) + ' µs (5 × 40 000, bestes)', '≤ 8 µs, p95 ≤ 20 µs');
  out.push(...kostenSkala(P));   // Platten-Zahl und Radius
  // Plan
  const pp = bestVon5(i => P.planetPlan('erde-plan-' + i, P.PLANET_ERDE));
  const pb = P._intern.planBytes(pp.wert);
  zeile('kosten.plan', pp.ms <= 25 && pb <= 96 * 1024, pp.ms.toFixed(1) + ' ms, ' + (pb / 1024).toFixed(1) + ' KB', '≤ 25 ms, ≤ 96 KB');
  const pa = bestVon5(i => { const pl = P.planetPlan('erde-abs-' + i, P.PLANET_ERDE); const a = ns(); P._intern.abschnitt(pl, pl.nB - 2); return (ns() - a) / 1e6; });
  zeile('kosten.abschnitt', pa.wert <= 25, pa.wert.toFixed(1) + ' ms (letzter Abschnitt kalt, mit Rand-Gedächtnis über alle Vorgänger)', '≤ 25 ms');
  // Scheibe warm: Abschnitt und Meer-Fächer warm, neue Zeit im selben Fach
  const ws = bestVon5(i => { const a = ns(); const s = P.planetScheibe(plan, 0.137 * (i + 1)); return { ms: (ns() - a) / 1e6, bytes: P._intern.scheibeBytes(s) }; });
  // B0 die Zell-Listen (Kruste, Platten, Ketten) wachsen mit den gelesenen Zellen, nie mit der Welt: S trägt nach den 210 000 Adressen
  // von kosten.punkt jede der 6·16² Zellen — die Zahl steht neben der warmen
  const vollKB = P._intern.scheibeBytes(S) / 1024;
  zeile('kosten.scheibe', ws.wert.ms <= 5 && ws.wert.bytes <= 64 * 1024 && vollKB <= 512, ws.wert.ms.toFixed(2) + ' ms, ' + (ws.wert.bytes / 1024).toFixed(1) + ' KB warm, ' + vollKB.toFixed(1) + ' KB mit allen Zellen', 'warm ≤ 5 ms, ≤ 64 KB; alle Zellen ≤ 512 KB');
  const mf = bestVon5(i => { const a = ns(); P.planetMeer(plan, -300 - 10 * i, 0.001 * (i + 1)); return (ns() - a) / 1e6; });
  zeile('kosten.meer', mf.wert <= 40, mf.wert.toFixed(1) + ' ms je Fach (Zusatz-Wasser erzwingt neue Lösung, Proben warm)', '≤ 40 ms');
  const kk = bestVon5(() => P.planetKarte(S, 1024, 'relief'));
  zeile('kosten.karte', kk.ms <= 5000, (kk.ms / 1000).toFixed(2) + ' s', '≤ 5 s (1024×512 relief, ein Faden)');
  out.push(...kostenWasser(P));
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
// R4 bytes.version: Tafel VERSION → SHA-256 der Relief-Karte erde-09, 256 px, t = 0 (RGB-Bytes). Ein geänderter SHA bei gleicher VERSION
// ist ROT (der gespeicherte Ort trägt den Kern-SHA, D5): wer die Bytes bewegt, hebt VERSION und trägt die neue Zeile hier ein.
const VERSION_SHA = { 'planet-g3-2': '553f0a6918332df9d1589834559598eb22d65df5c66cabed6e4a0278141d3dfb', 'planet-h2-1': 'cc2f82842589df547d13caf171a738fdb57fac5e2af6763fcd852a63739a2c6f',
  'planet-h2-2': 'cc2f82842589df547d13caf171a738fdb57fac5e2af6763fcd852a63739a2c6f',
  'planet-h2-3': 'cc2f82842589df547d13caf171a738fdb57fac5e2af6763fcd852a63739a2c6f',
  'planet-h2-4': 'cc2f82842589df547d13caf171a738fdb57fac5e2af6763fcd852a63739a2c6f',
  'planet-h2-5': '6fb0213d5cf02126c8c0eb9556822f1d1256d3183eda9252943598161ceb9a89',
  'planet-h2-6': '5c937970b7de4796d8b916f8cee2811c83dd80a6aa15de14777be9af0f2c26ee',
  'planet-h2-7': '5c937970b7de4796d8b916f8cee2811c83dd80a6aa15de14777be9af0f2c26ee',
  'planet-h2-8': '5c937970b7de4796d8b916f8cee2811c83dd80a6aa15de14777be9af0f2c26ee',
  'planet-h2-9': '5c937970b7de4796d8b916f8cee2811c83dd80a6aa15de14777be9af0f2c26ee',
  'planet-h2-10': '5c937970b7de4796d8b916f8cee2811c83dd80a6aa15de14777be9af0f2c26ee',
  'planet-h2-11': '5c937970b7de4796d8b916f8cee2811c83dd80a6aa15de14777be9af0f2c26ee',
  'planet-h2-12': '5c937970b7de4796d8b916f8cee2811c83dd80a6aa15de14777be9af0f2c26ee' };   // h2-12 (die Treppe der Suche des Ankers: jede Saat des Spiels trägt eine Heimat; eine Saat mit Ort bei 512 Proben bitgleich) — das Relief steht   // h2-11 (Bau-Welle 1, Jahreszeiten-Vertrag): das Δ des Jahres-Gangs zur selben Zeit des Jahres, „Sommer“ die wärmere Jahreszeit mit ihrer Phase — das Relief steht   // h2-10 (Bau-Welle 1, FÄLLT): die drei Δ ≡ 0 der Wildnis (kontinentLambda, schichtDicke, hartAnteil) reisen nicht mehr — das Relief steht   // h2-9 (Bau-Welle 1, B5): der Anker im Band des Orts (fuss 16), er trägt Spende, Wuchs und kein E — das Relief steht   // h2-8 (Bau-Welle 1, B3): S5 Wasser im Kern (planetWasserGitter · planetWasserR, DIE PET) — Relief und Klima stehen   // h2-7 (Bau-Welle 1, B2): das Klima ohne Land-Schalter (EIN Land-Gewicht, EINE PET, die Feuchte-Knoten auf den Hüllen-Schritten) — das Relief steht   // h2-6 (Bau-Welle 1, B4): der Anden-Bogen eine Schürze + 150 km hinter dem Graben, EINE Lage je Platte — das Relief bewegt sich   // h2-5 (Bau-Welle 1, B1): die Naht gehört dem Paar — ω_p über ξ(p, j), stetig über Platte, Scholle und Kruste; das Relief bewegt sich   // h2-4 (Reise, Welle 3): der Wuchs als Verhältnis-Feld des Orts, EINE Rechnung mit der Farbe des Atlas — Relief und Biom-Karte bewegen sich nicht   // h2-3 (Reise, Gegner F4): EIN Jahr — PLANET_ERDE trägt 365, die Normierung liest es; das Relief bewegt sich nicht   // h2-2 (Reise K): die Jahres-Phase als Δ-Feld des Orts — das Relief bewegt sich nicht
function versionUrteil(version, s, tafel) { const soll = tafel[version];
  if (!soll) return { ok: false, wert: 'VERSION ' + version + ' fehlt in der Tafel (SHA ' + s.slice(0, 16) + ')' };
  return { ok: soll === s, wert: 'VERSION ' + version + ' → ' + s.slice(0, 16) + (soll === s ? ' = Tafel' : ' ≠ Tafel ' + soll.slice(0, 16)) }; }
function versionSha() { return sha(Buffer.from(P.planetKarte(P.planetScheibe(planVon('erde-09'), 0), 256, 'relief'))); }
// R1 bytes.streifen: die Karte in 16-Zeilen-Streifen hat die Bytes am Stück (relief, biom, 256 px); der Mittel-Pixel eines Fensters
// (ungerade Pixelzahl) trägt die Höhe von planetPunktR am selben Ort (Float32 wie die Karte)
function streifenProbe(samen) {
  const S = P.planetScheibe(planVon(samen), 0); let ok = true; const teile = []; let mx = 0;
  for (const sch of ['relief', 'biom']) { const ganz = sha(Buffer.from(P.planetKarte(S, 256, sch))), z = new Uint8Array(256 * 128 * 3), teil = {};
    for (let r = 0; r < 128; r += 16) { const a = ns(); P.planetKarte(S, 256, sch, z, Object.assign(teil, { zeile0: r, zeile1: r + 16 })); mx = Math.max(mx, (ns() - a) / 1e6); }
    const s2 = sha(Buffer.from(z)); if (s2 !== ganz) ok = false; teile.push(sch + ' ' + ganz.slice(0, 12) + (s2 === ganz ? ' = ' : ' ≠ ') + s2.slice(0, 12)); }
  const m = P.planetRichtung(0.4, 1.1), teil = { zeile0: 0, zeile1: 65 }; P.planetKarteAusschnitt(S, m, 2000, 65, 'relief', null, teil);
  const hz = teil.zustand.hoehe[32 * 65 + 32], hp = Math.fround(P.planetPunktR(S, m[0], m[1], m[2], 2000 / 65)), mitte = Object.is(hz, hp);
  // das Urteil sind die Bytes; die Zeit je Streifen ist Lesewert (Gegner Reise F10: unter Last fiel die Zeile bei gleichen SHA an
  // einer Wanduhr-Schwelle von 150 ms — die Kosten richtet `--kosten` relativ zur Referenzfahrt)
  return { ok: ok && mitte, wert: teile.join(' · ') + '; Streifen max ' + mx.toFixed(0) + ' ms (Lesewert); Fenster-Mitte ' + (mitte ? '= planetPunktR' : '≠ planetPunktR (' + hz + ' / ' + hp + ')') };
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
  const st = streifenProbe('erde-09'); zeile('bytes.streifen', st.ok, st.wert, 'SHA Streifen = am Stück; Mitte des Fensters = planetPunktR');
  const vu = versionUrteil(P.VERSION, versionSha(), VERSION_SHA); zeile('bytes.version', vu.ok, vu.wert, 'SHA = Tafel je VERSION');
  out.push({ name: 'planet.bytes.engines', urteil: 'OFFEN', wert: 'ungemessen (keine zweite Engine am Platz)', schwelle: 'Hash gleich' });
  return out;
}

// ── Selbsttest: gepflanzte Fehler müssen ROT werden ─────────────────────────────────────────────────
// ── Richter gesicht (ENTSCHEID-2 G1): die Gestalt des Landes, am Gitter 720×360, fuss 40 km, t = 0 ─────────────────────────
// Jede Linse ist eine Funktion einer Maske bzw. eines Gitters, damit der Selbsttest denselben Leser mit einem gepflanzten
// Täter füttert. Herkunft der Bänder: ENTSCHEID-2 §G1 (Pflicht + Richt-Zahlen), eingefroren vor dem ersten Schnitt.
function gesichtGitter(S, W) {
  const H = W >> 1, n = W * H, h = new Float32Array(n), akt = new Uint8Array(n), kont = new Float32Array(n), scholle = new Int16Array(n), platte = new Int16Array(n), oro = new Float32Array(n), o = {};
  for (let r = 0; r < H; r++) {
    const phi = Math.PI / 2 - Math.PI * (r + 0.5) / H, cp = Math.cos(phi), sp = Math.sin(phi);
    for (let i = 0; i < W; i++) { const lam = -Math.PI + 2 * Math.PI * (i + 0.5) / W, p = r * W + i;
      h[p] = P.planetPunktR(S, cp * Math.cos(lam), sp, cp * Math.sin(lam), 40, o) / 1000; akt[p] = o.orogenAktiv; kont[p] = o.kont; scholle[p] = o.scholle; platte[p] = o.platte; oro[p] = o.orogenStaerke; }
  }
  const gew = new Float64Array(H); for (let r = 0; r < H; r++) gew[r] = (2 * Math.PI * S.R / W) * (Math.PI * S.R / H) * Math.cos(Math.PI / 2 - Math.PI * (r + 0.5) / H);
  return { W, H, R: S.R, nG: S.nG, h, akt, kont, scholle, platte, oro, gew };
}
function pixVek(p, W, H) { const r = (p / W) | 0, i = p - r * W, phi = Math.PI / 2 - Math.PI * (r + 0.5) / H, lam = -Math.PI + 2 * Math.PI * (i + 0.5) / W; return [Math.cos(phi) * Math.cos(lam), Math.sin(phi), Math.cos(phi) * Math.sin(lam)]; }
function chamfer(quelle, erlaubt, G) { // Abstand (km) jedes erlaubten Pixels zur Quell-Menge, 4 Durchgänge über 8 Nachbarn auf der Kugel
  const { W, H, R } = G, d = new Float64Array(W * H).fill(Infinity), dy = Math.PI * R / H, dx = new Float64Array(H);
  for (let r = 0; r < H; r++) dx[r] = 2 * Math.PI * R / W * Math.cos(Math.PI / 2 - Math.PI * (r + 0.5) / H);
  for (let p = 0; p < W * H; p++) if (quelle[p]) d[p] = 0;
  for (let pass = 0; pass < 4; pass++) {
    for (let r = 0; r < H; r++) for (let i = 0; i < W; i++) { const p = r * W + i; if (!erlaubt[p]) continue;
      for (const [dr, di] of [[-1, -1], [-1, 0], [-1, 1], [0, -1]]) { const rr = r + dr; if (rr < 0) continue; const q = rr * W + (i + di + W) % W; const c = Math.hypot(di * dx[r], dr * dy); if (d[q] + c < d[p]) d[p] = d[q] + c; } }
    for (let r = H - 1; r >= 0; r--) for (let i = W - 1; i >= 0; i--) { const p = r * W + i; if (!erlaubt[p]) continue;
      for (const [dr, di] of [[1, 1], [1, 0], [1, -1], [0, 1]]) { const rr = r + dr; if (rr >= H) continue; const q = rr * W + (i + di + W) % W; const c = Math.hypot(di * dx[r], dr * dy); if (d[q] + c < d[p]) d[p] = d[q] + c; } }
  }
  return d;
}
function kuestenAbstand(maske, G) { // Land-Pixel: Abstand zur Küste (Land mit Meer-Nachbar = 0)
  const { W, H } = G, q = new Uint8Array(W * H);
  for (let r = 0; r < H; r++) for (let i = 0; i < W; i++) { const p = r * W + i; if (!maske[p]) continue;
    if (!maske[r * W + (i + 1) % W] || !maske[r * W + (i + W - 1) % W] || (r > 0 && !maske[p - W]) || (r < H - 1 && !maske[p + W])) q[p] = 1; }
  return chamfer(q, maske, G);
}
function projiziert(pix, G) { // flächentreue Azimutal-Projektion (Lambert) um den Schwerpunkt; [a, b, Gewicht] in km
  const { W, H } = G; let cx = 0, cy = 0, cz = 0; const v = [];
  for (const p of pix) { const [x, y, z] = pixVek(p, W, H), g = G.gew[(p / W) | 0]; v.push([x, y, z, g]); cx += x * g; cy += y * g; cz += z * g; }
  const l = Math.hypot(cx, cy, cz); cx /= l; cy /= l; cz /= l;
  let ux = -cz, uy = 0, uz = cx; let ul = Math.hypot(ux, uy, uz); if (ul < 1e-9) { ux = 1; uz = 0; ul = 1; } ux /= ul; uz /= ul;
  const vx = cy * uz - cz * uy, vy = cz * ux - cx * uz, vz = cx * uy - cy * ux;
  return v.map(([x, y, z, g]) => { const d = x * cx + y * cy + z * cz, k = Math.sqrt(2 / (1 + d)); return [k * (x * ux + y * uy + z * uz) * G.R, k * (x * vx + y * vy + z * vz) * G.R, g]; });
}
function ellipseIoU(pts) { // IoU eines Stücks mit der Ellipse gleicher Momente und gleicher Fläche
  let A = 0, mx = 0, my = 0; for (const [a, b, g] of pts) { A += g; mx += a * g; my += b * g; } mx /= A; my /= A;
  let sxx = 0, syy = 0, sxy = 0; for (const [a, b, g] of pts) { sxx += g * (a - mx) * (a - mx); syy += g * (b - my) * (b - my); sxy += g * (a - mx) * (b - my); }
  sxx /= A; syy /= A; sxy /= A; const det = sxx * syy - sxy * sxy; if (!(det > 0)) return NaN; const c = A / (Math.PI * Math.sqrt(det));
  let innen = 0; for (const [a, b, g] of pts) { const dx = a - mx, dy = b - my; if ((syy * dx * dx - 2 * sxy * dx * dy + sxx * dy * dy) / det <= c) innen += g; }
  return innen / (2 * A - innen);
}
function formzahl(pts) { // Fläche ÷ konvexe Hülle in der Lambert-Ebene (Pixel-Gewichte sind flächentreu)
  let A = 0; for (const p of pts) A += p[2];
  const s = pts.map(p => [p[0], p[1]]).sort((a, b) => a[0] - b[0] || a[1] - b[1]), cr = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const lo = [], hi = []; for (const p of s) { while (lo.length >= 2 && cr(lo[lo.length - 2], lo[lo.length - 1], p) <= 0) lo.pop(); lo.push(p); }
  for (let k = s.length - 1; k >= 0; k--) { const p = s[k]; while (hi.length >= 2 && cr(hi[hi.length - 2], hi[hi.length - 1], p) <= 0) hi.pop(); hi.push(p); }
  const hu = lo.slice(0, -1).concat(hi.slice(0, -1)); let ah = 0; for (let k = 0; k < hu.length; k++) { const a = hu[k], b = hu[(k + 1) % hu.length]; ah += a[0] * b[1] - a[1] * b[0]; }
  return Math.min(1, A / (Math.abs(ah) / 2));
}
function gestaltMasse(G, maske) { // land.* und meer.binnen einer Landmaske
  const { W, H } = G, n = W * H, C = komponenten(maske, W, H, G.gew), fl = C.K.map(k => k.flaeche), land = fl.reduce((a, b) => a + b, 0);
  const idx = fl.map((_, i) => i).sort((a, b) => fl[b] - fl[a]);
  const ell = [], sol = []; for (const i of idx) { if (fl[i] < 1e6) break; const pts = projiziert(C.K[i].pix, G); const e = ellipseIoU(pts); if (Number.isFinite(e)) ell.push(e); sol.push(formzahl(pts)); }
  const xs = [], ys = []; for (const a of [2e4, 5e4, 1e5, 2e5, 5e5, 1e6, 2e6, 5e6, 1e7, 2e7]) { const k = fl.filter(f => f > a).length; if (k > 0) { xs.push(Math.log10(a)); ys.push(Math.log10(k)); } }
  let korcak = NaN; if (xs.length >= 3) { const m = xs.length, mx = xs.reduce((a, b) => a + b) / m, my = ys.reduce((a, b) => a + b) / m; let sxy = 0, sxx = 0; for (let i = 0; i < m; i++) { sxy += (xs[i] - mx) * (ys[i] - my); sxx += (xs[i] - mx) ** 2; } korcak = -sxy / sxx; }
  const ab = kuestenAbstand(maske, G); let fern = 0; for (let p = 0; p < n; p++) if (maske[p] && ab[p] > 1000) fern += G.gew[(p / W) | 0];
  const mitte = new Uint8Array(n); for (let p = 0; p < n; p++) mitte[p] = maske[p] && ab[p] >= 300 ? 1 : 0;
  const dm = chamfer(mitte, new Uint8Array(n).fill(1), G); let schmal = 0; for (let p = 0; p < n; p++) if (maske[p] && !(dm[p] <= 300)) schmal += G.gew[(p / W) | 0];
  const um = new Float64Array(C.K.length), dyk = Math.PI * G.R / H;
  for (let r = 0; r < H; r++) { const dxk = 2 * Math.PI * G.R / W * Math.cos(Math.PI / 2 - Math.PI * (r + 0.5) / H);
    for (let i = 0; i < W; i++) { const p = r * W + i; if (!maske[p]) continue; const id = C.lab[p];
      if (!maske[r * W + (i + 1) % W]) um[id] += dyk; if (!maske[r * W + (i + W - 1) % W]) um[id] += dyk; if (r > 0 && !maske[p - W]) um[id] += dxk; if (r < H - 1 && !maske[p + W]) um[id] += dxk; } }
  const dl = []; for (const i of idx) { if (fl[i] < 1e6) break; dl.push(um[i] * Math.PI / 4 / (2 * Math.sqrt(Math.PI * fl[i]))); }
  const meer = new Uint8Array(n); for (let p = 0; p < n; p++) meer[p] = maske[p] ? 0 : 1;
  const M = komponenten(meer, W, H, G.gew), mf = M.K.map(k => k.flaeche), gr = Math.max(...mf), binnen = mf.filter(f => f < gr);
  return { land: land / (4 * Math.PI * G.R * G.R), ellipse: ell.length ? Math.max(...ell) : NaN, stuecke4: fl.filter(f => f >= 1e4).length, stuecke5: fl.filter(f => f >= 1e5).length,
    formzahl: median(sol), fern1000: fern / land, groesster: fl[idx[0]] / land, korcak, schmal300: schmal / land, entwicklung: median(dl),
    binnen: binnen.reduce((a, b) => a + b, 0) / land, binnenZahl: binnen.filter(f => f >= 1e4).length, ab };
}
function kontMasse(G, maske, ab) { // kont.naht (Sprung > 100 km über eine Schollen-Naht im Inland) · kont.kueste (Küste, die kont nicht sieht)
  const { W, H } = G; let naht = 0, kue = 0, kueN = 0;
  for (let r = 0; r < H; r++) for (let i = 0; i < W; i++) { const p = r * W + i; if (!maske[p]) continue;
    if (ab[p] < 110) { kueN++; if (G.kont[p] > 300) kue++; }
    const q = r * W + (i + 1) % W; if (!maske[q] || ab[p] < 150 || ab[q] < 150) continue;
    if (G.scholle[p] >= 0 && G.scholle[q] >= 0 && G.scholle[p] !== G.scholle[q] && Math.abs(G.kont[p] - G.kont[q]) > 100) naht++; }
  return { naht, kueste: kueN ? kue / kueN : 0 };
}
function kruemel(G) { // Fläche über 1,5 km in Stücken < 5·10⁴ km² ÷ Fläche über 1,5 km
  const m = new Uint8Array(G.W * G.H); for (let p = 0; p < m.length; p++) m[p] = G.h[p] > 1.5 ? 1 : 0;
  const C = komponenten(m, G.W, G.H, G.gew); let alle = 0, klein = 0; for (const k of C.K) { alle += k.flaeche; if (k.flaeche < 5e4) klein += k.flaeche; }
  return alle > 0 ? klein / alle : 0;
}
function eigenKlein(C) { // Eigenvektor zum kleinsten Eigenwert einer symmetrischen 3×3 (Jacobi)
  const A = C.map(r => r.slice()), V = [[1, 0, 0], [0, 1, 0], [0, 0, 1]];
  for (let it = 0; it < 60; it++) {
    let p = 0, q = 1; for (let a = 0; a < 3; a++) for (let b = a + 1; b < 3; b++) if (Math.abs(A[a][b]) > Math.abs(A[p][q])) { p = a; q = b; }
    if (Math.abs(A[p][q]) < 1e-20) break;
    const th = 0.5 * Math.atan2(2 * A[p][q], A[q][q] - A[p][p]), c = Math.cos(th), s = Math.sin(th);
    for (let k = 0; k < 3; k++) { const akp = A[k][p], akq = A[k][q]; A[k][p] = c * akp - s * akq; A[k][q] = s * akp + c * akq; }
    for (let k = 0; k < 3; k++) { const apk = A[p][k], aqk = A[q][k]; A[p][k] = c * apk - s * aqk; A[q][k] = s * apk + c * aqk; }
    for (let k = 0; k < 3; k++) { const vkp = V[k][p], vkq = V[k][q]; V[k][p] = c * vkp - s * vkq; V[k][q] = s * vkp + c * vkq; }
  }
  let m = 0; for (let k = 1; k < 3; k++) if (A[k][k] < A[m][m]) m = k; return [V[0][m], V[1][m], V[2][m]];
}
function kleinkreisGrad(vs) { // Ebenen-Passung n·p = c an Punkte auf der Kugel: Radius des Kleinkreises acos|c| in Grad (Großkreis 90°)
  let mx = 0, my = 0, mz = 0; for (const v of vs) { mx += v[0]; my += v[1]; mz += v[2]; } mx /= vs.length; my /= vs.length; mz /= vs.length;
  const C = [[0, 0, 0], [0, 0, 0], [0, 0, 0]]; for (const v of vs) { const d = [v[0] - mx, v[1] - my, v[2] - mz]; for (let a = 0; a < 3; a++) for (let b = 0; b < 3; b++) C[a][b] += d[a] * d[b]; }
  const nv = eigenKlein(C), c = Math.abs(nv[0] * mx + nv[1] * my + nv[2] * mz); return Math.acos(Math.min(1, c)) * 180 / Math.PI;
}
function grenzBogen(G) { // je Grenze Ozean–Ozean: Fenster ±2 000 km um jeden 25. Grenz-Pixel (Spanne im Fenster ≥ 3 000 km), Kleinkreis-Radius in Grad; Median je Grenze
  const { W, H } = G, paare = new Map();
  for (let r = 0; r < H; r++) for (let i = 0; i < W; i++) { const p = r * W + i, a = G.platte[p]; if (a < G.nG) continue;
    for (const q of [r * W + (i + 1) % W, r < H - 1 ? p + W : -1]) { if (q < 0) continue; const b = G.platte[q]; if (b < G.nG || b === a) continue;
      const key = Math.min(a, b) * 100 + Math.max(a, b); if (!paare.has(key)) paare.set(key, []); paare.get(key).push(pixVek(p, W, H)); } }
  const radien = [];
  const cos2000 = Math.cos(2000 / G.R);
  for (const [, vs] of paare) {
    if (vs.length < 40) continue; const je = [];
    for (let c = 0; c < vs.length; c += 25) {
      const m = vs[c], win = vs.filter(v => v[0] * m[0] + v[1] * m[1] + v[2] * m[2] >= cos2000); if (win.length < 30) continue;
      let sp = 0, far = m; for (const v of win) { const d = Math.acos(Math.min(1, v[0] * m[0] + v[1] * m[1] + v[2] * m[2])); if (d > sp) { sp = d; far = v; } }
      let sp2 = 0; for (const v of win) sp2 = Math.max(sp2, Math.acos(Math.min(1, v[0] * far[0] + v[1] * far[1] + v[2] * far[2])));
      if (sp2 * G.R >= 3000) je.push(kleinkreisGrad(win));
    }
    if (je.length) radien.push(median(je));
  }
  return radien;
}
// ── Richter gesicht, Teil G2 (ENTSCHEID-2 §G2): das Innere, die Messer-Kanten, die Grenz-Stufen, die Klima-Kanten ────────────────
// Definitionen und Gitter wie in den Proben des Befunds (spike-gesicht: mass.cjs/lib.cjs innen, sprung-mass.cjs, grenz-stufe.cjs,
// klima-mass.cjs), damit „heute“ dort und hier dieselbe Zahl ist. Jede Linse ist eine Funktion von Gittern bzw. einer Höhen-Funktion,
// damit der Selbsttest denselben Leser mit einem gepflanzten Täter füttert.
function innenMasse(G, maske, ab) { // Land > 500 km von der Küste, ohne aktives Orogen: Streuung, Anteil alter Gürtel; Median der Landhöhe; Kerne je Scholle (ohne Gürtel)
  const hs = [], land = [], je = new Map(); let alt = 0;
  for (let p = 0; p < G.W * G.H; p++) { if (!maske[p]) continue; land.push(G.h[p]); if (ab[p] < 500 || G.akt[p]) continue; hs.push(G.h[p]); if (G.oro[p] > 0.1) { alt++; continue; }
    const s = G.scholle[p]; if (s < 0) continue; if (!je.has(s)) je.set(s, []); je.get(s).push(G.h[p]); }
  const sd = (v) => { const m = v.reduce((a, b) => a + b, 0) / v.length; return Math.sqrt(v.reduce((a, b) => a + (b - m) * (b - m), 0) / v.length); };
  const kerne = []; for (const [s, v] of je) if (v.length >= 40) kerne.push([s, sd(v)]);
  return { streuung: hs.length ? sd(hs) : 0, altguertel: hs.length ? alt / hs.length : 0, median: land.length ? median(land) : NaN, kerne };
}
function messerStufe(hf, W, H) { // relief.messer (Land derselben Platte, Sprung > 0,4 km auf ~1 km, je Million Land-Paare) · grenze.stufe (Ozean-Grenz-Paare je Rand-Art)
  const xyz = (p) => pixVek(p, W, H), h = new Float32Array(W * H), pl = new Int16Array(W * H), art = new Uint8Array(W * H), o = {};
  for (let p = 0; p < W * H; p++) { const [x, y, z] = xyz(p); h[p] = hf(x, y, z, o); pl[p] = o.platte; art[p] = o.randArt; }
  const schritt = (a, b, n) => { let mx = 0, prev = h[a]; const A = xyz(a), B = xyz(b);
    for (let k = 1; k <= n; k++) { const u = k / n; const x = A[0] + (B[0] - A[0]) * u, y = A[1] + (B[1] - A[1]) * u, z = A[2] + (B[2] - A[2]) * u, l = Math.hypot(x, y, z); const v = hf(x / l, y / l, z / l, o); if (Math.abs(v - prev) > mx) mx = Math.abs(v - prev); prev = v; }
    return mx; };
  const nStufe = Math.max(8, Math.round(40 * W / 1024)); let li = 0, si = 0; const st = [0, 0, 0, 0].map(() => ({ n: 0, k: 0 }));
  for (let r = 0; r < H - 1; r++) { if (Math.abs(90 - 180 * (r + 0.5) / H) > 75) continue;
    for (let i = 0; i < W; i++) { const p = r * W + i; for (const q of [r * W + (i + 1) % W, p + W]) {
      const d = Math.abs(h[p] - h[q]);
      if (pl[p] === pl[q]) { if (h[p] > 0 && h[q] > 0) { li++; if (d > 1 && schritt(p, q, nStufe) > 0.4) si++; } }
      else if (h[p] < -1 && h[q] < -1) { const e = st[art[h[p] < h[q] ? p : q]]; e.n++; if (schritt(p, q, nStufe) > 0.4) e.k++; } } } }
  const an = (e) => (e.n ? e.k / e.n : 0);
  return { messer: li ? si / li * 1e6 : 0, stufeKonv: an(st[3]), stufeDiv: an(st[1]), stufeTrans: an(st[2]), stufeN: st.map(e => e.n) };
}
function klimaKanteFlach(pr, hh, W, H, R) { // Flachland-Paare (beide < 1 km, |dh| < 0,3 km), an denen der Niederschlag sich auf < 100 km verdoppelt
  let paare = 0, kanten = 0; const dy = Math.PI * R / H;
  for (let r = 0; r < H - 1; r++) { const dx = 2 * Math.PI * R / W * Math.cos(Math.PI / 2 - Math.PI * (r + 0.5) / H);
    for (let i = 0; i < W; i++) { const p = r * W + i;
      for (const [q, d] of [[r * W + (i + 1) % W, dx], [p + W, dy]]) { const a = pr[p], b = pr[q]; if (!(a > 0 && b > 0)) continue;
        if (hh[p] > 1 || hh[q] > 1 || Math.abs(hh[p] - hh[q]) > 0.3) continue; paare++; if (Math.abs(Math.log(a / b)) / d > Math.LN2 / 100) kanten++; } } }
  return paare ? kanten / paare : 0;
}
function klimaGitter(S, W) { // 480×240 wie die Probe: Niederschlag (NaN über Meer) und Höhe
  const H = W >> 1, pr = new Float32Array(W * H).fill(NaN), hh = new Float32Array(W * H), K = {}, pt = {};
  for (let p = 0; p < W * H; p++) { const [x, y, z] = pixVek(p, W, H); P.planetPunktR(S, x, y, z, 40, pt); hh[p] = pt.hoeheKm; if (pt.hoeheKm <= 0) continue; P.planetKlimaR(S, x, y, z, -1, K, pt); pr[p] = K.niederschlagMm; }
  return { pr, hh, W, H };
}
function sprung20Folge(S, samen) { // 30 Großkreise je Saat, Schritt 20 km: |ΔP| an Flachland-Paaren (beide Land, |Δh| < 0,2 km)
  const k = P.planetHash('sprung20-' + samen), R = S.R, n = Math.ceil(2 * Math.PI * R / 20), a = 2 * Math.PI / n, d = [], K = {}, pt = {};
  for (let s = 0; s < 30; s++) {
    const y = 2 * P.planetZufall(k, 1, s, 1) - 1, ph = 2 * Math.PI * P.planetZufall(k, 1, s, 2), q = Math.sqrt(1 - y * y), N = [q * Math.cos(ph), y, q * Math.sin(ph)];
    let e1 = Math.abs(N[0]) < 0.9 ? [0, -N[2], N[1]] : [-N[1], N[0], 0]; const l1 = Math.hypot(...e1); e1 = e1.map(v => v / l1);
    const e2 = [N[1] * e1[2] - N[2] * e1[1], N[2] * e1[0] - N[0] * e1[2], N[0] * e1[1] - N[1] * e1[0]];
    const hs = new Float64Array(n + 1), ps = new Float64Array(n + 1);
    for (let i = 0; i <= n; i++) { const c = Math.cos(i * a), si = Math.sin(i * a), x = c * e1[0] + si * e2[0], yy = c * e1[1] + si * e2[1], z = c * e1[2] + si * e2[2];
      P.planetPunktR(S, x, yy, z, 40, pt); hs[i] = pt.hoeheKm; ps[i] = NaN; if (hs[i] > 0) { P.planetKlimaR(S, x, yy, z, -1, K, pt); ps[i] = K.niederschlagMm; } }
    flachSpruenge(hs, ps, d);
  }
  return d;
}
function flachSpruenge(hs, ps, d) { for (let i = 1; i < hs.length; i++) if (hs[i] > 0 && hs[i - 1] > 0 && Math.abs(hs[i] - hs[i - 1]) < 0.2) d.push(Math.abs(ps[i] - ps[i - 1])); return d; }
function schildPaare(alter, G, maske, ab) { return innenMasse(G, maske, ab).kerne.map(([s, sd]) => [alter[s], sd]); } // alter: Etikett je Scholle (im Gegenlauf das UNgespiegelte)
function saatGesicht(samen) {
  const plan = planVon(samen), S = P.planetScheibe(plan, 0), G = gesichtGitter(S, 720);
  const maske = new Uint8Array(G.W * G.H); for (let p = 0; p < maske.length; p++) maske[p] = G.h[p] > 0 ? 1 : 0;
  const g = gestaltMasse(G, maske), k = kontMasse(G, maske, g.ab), inn = innenMasse(G, maske, g.ab);
  const schild = inn.kerne.map(([s, sd]) => [plan.schollen[8 * s + 4], sd]);
  // Gegenlauf (R7): dieselbe Saat mit gespiegeltem Schollen-Alter (1 500 ↔ 4 000 Ma) — die Folge muss mit der Ursache kippen
  const planG = planVon(samen); for (let s = 0; s < planG.nS; s++) planG.schollen[8 * s + 4] = 5500 - planG.schollen[8 * s + 4];
  const GG = gesichtGitter(P.planetScheibe(planG, 0), 720), mG = new Uint8Array(GG.W * GG.H); for (let p = 0; p < mG.length; p++) mG[p] = GG.h[p] > 0 ? 1 : 0;
  const alter0 = Array.from({ length: plan.nS }, (_, s) => plan.schollen[8 * s + 4]);
  const schildG = schildPaare(alter0, GG, mG, kuestenAbstand(mG, GG)); // die Ursache gespiegelt, das Etikett nicht: die Folge muss das Vorzeichen wechseln
  delete g.ab;
  const bo = grenzBogen(G);
  const KG = klimaGitter(S, 480), kante = klimaKanteFlach(KG.pr, KG.hh, KG.W, KG.H, S.R), s20 = sprung20Folge(S, samen);
  const ms = [0, -50].map(t => { const St = P.planetScheibe(plan, t); return messerStufe((x, y, z, o) => P.planetPunktR(St, x, y, z, 16, o) / 1000, 1024, 512); });
  return Object.assign({ samen }, g, { kontNaht: k.naht, kontKueste: k.kueste, kruemel: kruemel(G), bogenMedian: bo.length ? median(bo) : NaN, bogenN: bo.length, platten: S.nP,
    innenStreuung: inn.streuung, innenAlt: inn.altguertel, landMedian: inn.median, schild, schildG, kanteFlach: kante,
    sprung20p99: s20.length ? quantil(s20, 0.99) : NaN, sprung20max: s20.length ? Math.max(...s20) : NaN, sprung20n: s20.length,
    messer: ms.map(m => m.messer), stufeKonv: ms.map(m => m.stufeKonv), stufeDiv: ms.map(m => m.stufeDiv), stufeTrans: ms.map(m => m.stufeTrans) });
}
function urteilGesicht(R) {
  const med = (f) => median(R.map(f).filter(Number.isFinite)), mi = (f) => Math.min(...R.map(f)), ma = (f) => Math.max(...R.map(f)), pc = (v) => (100 * v).toFixed(1) + ' %';
  const U = [], z = (name, ok, wert, schwelle) => U.push({ name, urteil: ok === null ? 'INFO' : (ok ? 'GRÜN' : 'ROT'), wert, schwelle });
  z('land.ellipse', med(r => r.ellipse) <= 0.85, 'Median ' + med(r => r.ellipse).toFixed(3) + ' (' + mi(r => r.ellipse).toFixed(3) + '–' + ma(r => r.ellipse).toFixed(3) + ')', '≤ 0,85');
  z('land.stuecke4', med(r => r.stuecke4) >= 40 && med(r => r.stuecke4) <= 100, 'Median ' + med(r => r.stuecke4) + ' (' + mi(r => r.stuecke4) + '–' + ma(r => r.stuecke4) + ')', '40–100');
  z('land.formzahl', med(r => r.formzahl) >= 0.70 && med(r => r.formzahl) <= 0.88, 'Median ' + med(r => r.formzahl).toFixed(3), '0,70–0,88');
  z('land.fern1000', med(r => r.fern1000) >= 0.08 && med(r => r.fern1000) <= 0.22, 'Median ' + pc(med(r => r.fern1000)), '8–22 %');
  z('meer.binnen', med(r => r.binnen) >= 0.015 && med(r => r.binnen) <= 0.06 && med(r => r.binnenZahl) <= 30, 'Median ' + pc(med(r => r.binnen)) + ', Stücke ≥ 10⁴ km² ' + med(r => r.binnenZahl), '1,5–6 %, Zahl ≤ 30');
  z('kont.naht', ma(r => r.kontNaht) === 0, 'Median ' + med(r => r.kontNaht) + ' (' + mi(r => r.kontNaht) + '–' + ma(r => r.kontNaht) + ') je Saat', '0');
  z('kont.kueste', med(r => r.kontKueste) <= 0.03, 'Median ' + pc(med(r => r.kontKueste)) + ' (' + pc(mi(r => r.kontKueste)) + '–' + pc(ma(r => r.kontKueste)) + ')', '≤ 3 %');
  z('gebirge.kruemel', null, 'Median ' + pc(med(r => r.kruemel)), '≤ Kern d660f478 (vorher ↔ nachher im Bericht)');
  z('grenze.bogen', med(r => r.bogenMedian) >= 70, 'Median ' + med(r => r.bogenMedian).toFixed(1) + '° (' + R.reduce((a, r) => a + r.bogenN, 0) + ' Grenzen Ozean–Ozean, Fenster ±2 000 km)', 'Median ≥ 70°');
  z('land.anteil.g', null, 'Median ' + pc(med(r => r.land)) + ' (' + pc(mi(r => r.land)) + '–' + pc(ma(r => r.land)) + ')', 'bau1 richtet');
  z('land.groesster', null, 'Median ' + med(r => r.groesster).toFixed(3), 'Richt-Zahl 0,40–0,65');
  z('land.korcak', null, 'Median ' + med(r => r.korcak).toFixed(2), 'Richt-Zahl 0,45–0,75');
  z('land.stuecke5', null, 'Median ' + med(r => r.stuecke5), 'Richt-Zahl 12–30');
  z('land.schmal300', null, 'Median ' + pc(med(r => r.schmal300)), 'Richt-Zahl 8–18 %');
  z('kueste.entwicklung', null, 'Median ' + med(r => r.entwicklung).toFixed(2), 'Richt-Zahl 1,5–3,5');
  z('platten.zahl.g', null, 'Median ' + med(r => r.platten) + ' (' + mi(r => r.platten) + '–' + ma(r => r.platten) + ')', 'bau1 richtet');
  // G2 (ENTSCHEID-2 §G2, Bänder dort mit Herkunft)
  const alle = (f) => R.flatMap(f).filter(Number.isFinite), pm = (v) => (100 * v).toFixed(2) + ' %';
  z('klima.kante.flach', med(r => r.kanteFlach) <= 0.01 && ma(r => r.kanteFlach) <= 0.04, 'Median ' + pm(med(r => r.kanteFlach)) + ' (' + pm(mi(r => r.kanteFlach)) + '–' + pm(ma(r => r.kanteFlach)) + '; 480×240)', 'Median ≤ 1,0 %, jede Saat ≤ 4 %');
  z('klima.sprung20', med(r => r.sprung20p99) <= 40 && ma(r => r.sprung20max) <= 80, 'p99 Median ' + med(r => r.sprung20p99).toFixed(1) + ' mm (max ' + ma(r => r.sprung20p99).toFixed(1) + '), größter Sprung ' + ma(r => r.sprung20max).toFixed(1) + ' mm (' + R.reduce((a, r) => a + r.sprung20n, 0) + ' Flachland-Paare, 30 Großkreise je Saat)', 'p99 ≤ 40 mm, max ≤ 80 mm');
  const mes = alle(r => r.messer);
  z('relief.messer', median(mes) <= 200, 'Median ' + median(mes).toFixed(0) + ' je Million Land-Paare (max ' + Math.max(...mes).toFixed(0) + '; 1024×512, fuss 16, t = 0 und −50 Ma)', '≤ 200');
  const sk = alle(r => r.stufeKonv), sdv = alle(r => r.stufeDiv), st = alle(r => r.stufeTrans);
  z('grenze.stufe', median(sk) <= 0.10 && median(sdv) <= 0.05, 'konvergent ' + pc(median(sk)) + ' · divergent ' + pc(median(sdv)) + ' · Transform ' + pc(median(st)) + ' (ohne Band) der Ozean-Grenz-Paare mit Sprung > 0,4 km je km', 'konvergent ≤ 10 % · divergent ≤ 5 %');
  z('innen.streuung', med(r => r.innenStreuung) >= 0.40 && med(r => r.innenStreuung) <= 0.65, 'Median ' + med(r => r.innenStreuung).toFixed(3) + ' km', '0,40–0,65 km');
  z('innen.altguertel', med(r => r.innenAlt) >= 0.05 && med(r => r.innenAlt) <= 0.25, 'Median ' + pc(med(r => r.innenAlt)), '5–25 %');
  const sp = R.flatMap(r => r.schild), spG = R.flatMap(r => r.schildG);
  const rs = sp.length >= 5 ? spearman(sp.map(v => v[0]), sp.map(v => v[1])) : NaN, rsG = spG.length >= 5 ? spearman(spG.map(v => v[0]), spG.map(v => v[1])) : NaN;
  z('innen.schild', rs <= -0.5 && rsG >= 0.5, 'Rang(Schollen-Alter, Kern-Streuung) ' + rs.toFixed(2) + ' über ' + sp.length + ' Schollen-Kerne; Gegenlauf (Alter gespiegelt) ' + rsG.toFixed(2) + ' über ' + spG.length, 'Rang ≤ −0,5; Gegenlauf ≥ +0,5');
  z('land.median', med(r => r.landMedian) >= 0.2 && med(r => r.landMedian) <= 0.6, 'Median ' + med(r => r.landMedian).toFixed(3) + ' km', '0,2–0,6 km');
  return U;
}
function gesichtSelbsttest(zeile) { // gepflanzte Täter: jeder macht seine Zeile ROT
  const W = 720, H = 360, R = 6371, gew = new Float64Array(H); for (let r = 0; r < H; r++) gew[r] = (2 * Math.PI * R / W) * (Math.PI * R / H) * Math.cos(Math.PI / 2 - Math.PI * (r + 0.5) / H);
  const G = { W, H, R, nG: 1, gew, h: new Float32Array(W * H), kont: new Float32Array(W * H), scholle: new Int16Array(W * H).fill(-1), platte: new Int16Array(W * H) };
  const ei = new Uint8Array(W * H); for (let r = 0; r < H; r++) for (let i = 0; i < W; i++) { const a = (i - 360) / 110, b = (r - 180) / 60; ei[r * W + i] = a * a + b * b <= 1 ? 1 : 0; }
  const gE = gestaltMasse(G, ei);
  zeile('land.ellipse feuert', gE.ellipse > 0.85, 'gepflanzt: ein Ellipsen-Kontinent → IoU ' + gE.ellipse.toFixed(3) + ' → ROT');
  zeile('land.stuecke4 feuert', gE.stuecke4 < 40, 'gepflanzt: ein einziges Stück → ' + gE.stuecke4 + ' → ROT');
  zeile('meer.binnen feuert', gE.binnen < 0.015, 'gepflanzt: Kontinent ohne Binnenmeer → ' + (100 * gE.binnen).toFixed(2) + ' % → ROT');
  const ring = new Uint8Array(W * H); for (let p = 0; p < ring.length; p++) ring[p] = ei[p];
  for (let r = 172; r < 188; r++) for (let i = 352; i < 368; i++) ring[r * W + i] = 0;
  const gR = gestaltMasse(G, ring); zeile('meer.binnen misst', gR.binnen > 0 && gR.binnenZahl === 1, 'gepflanzt: ein See im Ei → ' + gR.binnenZahl + ' Stück, ' + (100 * gR.binnen).toFixed(2) + ' %');
  const band = new Uint8Array(W * H); for (let r = 175; r < 185; r++) for (let i = 100; i < 600; i++) band[r * W + i] = 1;
  const gB = gestaltMasse(G, band); zeile('land.fern1000 feuert', gB.fern1000 < 0.08, 'gepflanzt: schmaler Streifen → ' + (100 * gB.fern1000).toFixed(1) + ' % → ROT');
  zeile('land.formzahl misst', gE.formzahl > 0.95, 'gepflanzt: Ellipse → Formzahl ' + gE.formzahl.toFixed(3) + ' (konvex ≈ 1)');
  for (let r = 0; r < H; r++) for (let i = 0; i < W; i++) { const p = r * W + i; if (!ei[p]) continue; G.scholle[p] = i < 360 ? 0 : 1; G.kont[p] = i < 360 ? 100 : 900; }
  const kE = kontMasse(G, ei, gE.ab); zeile('kont.naht feuert', kE.naht > 0, 'gepflanzt: kont springt an der Naht um 800 km → ' + kE.naht + ' Paare → ROT');
  zeile('kont.kueste feuert', kE.kueste > 0.03, 'gepflanzt: kont 900 km an der Küste → ' + (100 * kE.kueste).toFixed(0) + ' % → ROT');
  for (let p = 0; p < W * H; p++) G.h[p] = (p % 37 === 0) ? 2 : 0;
  zeile('gebirge.kruemel feuert', kruemel(G) > 0.9, 'gepflanzt: verstreute Einzel-Gipfel → ' + (100 * kruemel(G)).toFixed(0) + ' %');
  G.nG = 0; for (let r = 0; r < H; r++) for (let i = 0; i < W; i++) { const [x, y, z] = pixVek(r * W + i, W, H); G.platte[r * W + i] = Math.acos(Math.max(-1, Math.min(1, y))) < 40 * Math.PI / 180 ? 0 : 1; }
  const kb = grenzBogen(G); zeile('grenze.bogen feuert', kb.length === 1 && kb[0] < 70, 'gepflanzt: Kappen-Grenze 40° um den Pol → Radius ' + (kb.length ? kb[0].toFixed(1) : '—') + '° → ROT');
  for (let r = 0; r < H; r++) for (let i = 0; i < W; i++) G.platte[r * W + i] = i < 360 ? 0 : 1;
  const kg = grenzBogen(G); zeile('grenze.bogen misst', kg.length >= 1 && kg.every(v => v > 85), 'gepflanzt: Meridian-Grenzen → ' + kg.map(v => v.toFixed(1)).join(' · ') + '° (Großkreis 90°)');
  // G2: je Linse ein gepflanzter Täter
  const Wk = 480, Hk = 240, pr = new Float32Array(Wk * Hk).fill(NaN), hh = new Float32Array(Wk * Hk);
  for (let r = 60; r < 180; r++) for (let i = 100; i < 300; i++) { pr[r * Wk + i] = (i % 10) < 5 ? 300 : 900; hh[r * Wk + i] = 0.2; }
  const kf = klimaKanteFlach(pr, hh, Wk, Hk, R); zeile('klima.kante.flach feuert', kf > 0.04, 'gepflanzt: Fächer-Streifen 300 ↔ 900 mm im Flachland → ' + (100 * kf).toFixed(1) + ' % → ROT');
  const hs = new Float64Array(50).fill(0.3), ps = new Float64Array(50).map((_, i) => (i < 25 ? 400 : 500)), fs20 = flachSpruenge(hs, ps, []);
  zeile('klima.sprung20 feuert', Math.max(...fs20) > 80, 'gepflanzt: 100 mm Sprung auf 20 km im Flachland → max ' + Math.max(...fs20) + ' mm → ROT');
  const mL = messerStufe((x, y, z, o) => { o.platte = 0; o.randArt = 0; return 0.5 + (x > 0 ? 1.5 : 0); }, 128, 64);
  zeile('relief.messer feuert', mL.messer > 200, 'gepflanzt: 1,5-km-Stufe mitten in einer Land-Platte → ' + mL.messer.toFixed(0) + ' je Million → ROT');
  const mO = messerStufe((x, y, z, o) => { o.platte = x > 0 ? 1 : 0; o.randArt = 3; return -4 - (x > 0 ? 2 : 0); }, 128, 64);
  zeile('grenze.stufe feuert', mO.stufeKonv > 0.10, 'gepflanzt: 2-km-Stufe an einer konvergenten Ozean-Grenze → ' + (100 * mO.stufeKonv).toFixed(0) + ' % → ROT');
  const mS = messerStufe((x, y, z, o) => { o.platte = x > 0 ? 1 : 0; o.randArt = 3; return -4 - 2 * Math.max(0, Math.min(1, x * 20 + 0.5)); }, 128, 64);
  zeile('grenze.stufe misst', mS.stufeKonv === 0, 'gepflanzt: stetige Flanke 2 km über ~600 km → ' + (100 * mS.stufeKonv).toFixed(0) + ' % (stetig = 0)');
  const GI = { W, H, h: new Float32Array(W * H), akt: new Uint8Array(W * H), oro: new Float32Array(W * H), scholle: new Int16Array(W * H).fill(-1) }, ab = new Float64Array(W * H).fill(1000), mI = new Uint8Array(W * H);
  for (let r = 100; r < 260; r++) for (let i = 100; i < 700; i++) { const p = r * W + i; mI[p] = 1; GI.h[p] = 2; GI.scholle[p] = Math.floor((i - 100) / 100); GI.h[p] = 2 + ((r + i) % 2) * 0.05 * GI.scholle[p]; }
  const iI = innenMasse(GI, mI, ab);
  zeile('innen.streuung feuert', iI.streuung < 0.40, 'gepflanzt: flaches Inneres → ' + iI.streuung.toFixed(3) + ' km → ROT');
  zeile('innen.altguertel feuert', iI.altguertel < 0.05, 'gepflanzt: Inneres ohne Gürtel → ' + (100 * iI.altguertel).toFixed(1) + ' % → ROT');
  zeile('land.median feuert', iI.median > 0.6, 'gepflanzt: Land auf 2 km → ' + iI.median.toFixed(2) + ' km → ROT');
  const kr = iI.kerne.map(([s, sd]) => [1500 + 400 * s, sd]), rk = spearman(kr.map(v => v[0]), kr.map(v => v[1]));
  zeile('innen.schild feuert', kr.length === 6 && rk > -0.5, 'gepflanzt: alte Schollen rauer als junge → Rang ' + rk.toFixed(2) + ' über ' + kr.length + ' Kerne → ROT');
}

// Bildpaar: oben der alte Kern (Datei), unten der Kern im Baum, dieselbe Saat, Zeit, Schicht, Breite
function bildpaar(altKern, samen, t, schicht, breite, aus) {
  delete globalThis.__planetCore; const PA = require(path.resolve(altKern)); delete globalThis.__planetCore;
  const plA = /^erde-/.test(samen) ? PA.planetPlan(samen, Object.assign({}, PA.PLANET_ERDE)) : PA.planetPlan(samen);
  const a = PA.planetKarte(PA.planetScheibe(plA, t), breite, schicht), b = P.planetKarte(P.planetScheibe(planVon(samen), t), breite, schicht);
  const h = breite >> 1, o = new Uint8Array(breite * (2 * h + 4) * 3).fill(255); o.set(a, 0); o.set(b, breite * (h + 4) * 3);
  fs.mkdirSync(path.dirname(aus), { recursive: true }); fs.writeFileSync(aus, png(o, breite, 2 * h + 4));
  return { samen, t, schicht, aus, shaAlt: sha(Buffer.from(a)).slice(0, 12), shaNeu: sha(Buffer.from(b)).slice(0, 12) };
}

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
  // G3: je neue Zeile ein gepflanzter Täter
  const tA = { h: 0.5, boden: 0, profil: 0.5, mantel: 0, schablone: 0, trapp: 0, gebirge: 0, oro: 0, mem: 0, kegel: 0, nachklang: 0, spiegel: 0, eigen: true }, tB = Object.assign({}, tA, { h: 3, gebirge: 2.5, oro: 2.5 });
  zeile('zeit.stetig nennt', taeterVon(tA, tB) === 'orogen' && taeterVon(tA, Object.assign({}, tB, { eigen: false })) === 'fremd·orogen', 'gepflanzt: 2,5-km-Orogen in 0,1 Ma → Täter ' + taeterVon(tA, tB) + ' · auf fremder Platte ' + taeterVon(tA, Object.assign({}, tB, { eigen: false })));
  { const Wz = 256, Hz = 128, mk = []; for (let k = 0; k < 10; k++) { const m = new Uint8Array(Wz * Hz); const x0 = k < 6 ? 60 + k : 160; for (let r2 = 40; r2 < 90; r2++) for (let i = x0; i < x0 + 40; i++) m[r2 * Wz + i] = 1; mk.push(m); }
    const sv = schrittVerhaeltnis(iouSchritte(mk, Wz, Hz)); zeile('zeit.schritt feuert', sv < 0.9, 'gepflanzt: Kontinent springt um 100 Pixel in einem Schritt → kleinster ÷ Median ' + sv.toFixed(3) + ' → ROT'); }
  { const Wi = 512, Hi = 256, mI0 = new Uint8Array(Wi * Hi), mI1 = new Uint8Array(Wi * Hi); for (let r2 = 100; r2 < 160; r2++) for (let i = 100; i < 200; i++) { mI0[r2 * Wi + i] = 1; mI1[r2 * Wi + i] = 1; } mI1[128 * Wi + 300] = 1;
    const dI = kuestenVersatz(mI1, mI0, Wi, Hi, 6371), gI = ohnePartnerNachGroesse(mI1, Wi, Hi, 6371, dI); zeile('zeit.insel teilt', gI.klein > 0 && gI.gross === 0, 'gepflanzt: Insel aus einem Pixel taucht auf → ohne Partner an Stücken ≥ 10⁴ km² ' + gI.gross + ' · darunter ' + gI.klein); }
  { const dl = { wildnis: { land: 0 }, meer: { waterLevelM: 0 }, klima: { sommer: 0, winter: 0, tagAmp: 0, sommerPhase: 0, spendeVerh: 1 }, wetter: { windX: 0, windZ: 0, regenQuote: 0, sturmQuote: 0 }, wuchs: { decke: 1, wald: 1 }, eis: { zeit: 0 }, leit: { huelleM: new Float64Array(81), landC: new Float64Array(81) } };
    const vorher = deltaNull(dl); dl.leit.huelleM[40] = 1e-12; zeile('ort.delta.null feuert', vorher && !deltaNull(dl), 'gepflanzt: eine Leit-Stütze 10⁻¹² m neben dem Anker → ROT');
    // Reise, Welle 3: der Wuchs ist ein Verhältnis-Feld — gepflanzt: am Anker trägt der Wald 0,999 statt 1 → ROT
    dl.leit.huelleM[40] = 0; const vorW = deltaNull(dl); dl.wuchs.wald = 0.999; zeile('ort.delta.wuchs feuert', vorW && !deltaNull(dl), 'gepflanzt: das Wald-Verhältnis am Anker 0,999 → ROT'); }
  // Reise K: die Jahres-Phase ist ein Δ-Feld. erde-01 trägt seinen Anker auf der Süd-Halbkugel — dort ist das Δ am Anker +0 (die Heimat
  // behält ihre Phase), jenseits des Äquators 0,5 (Jahreszeiten-Vertrag: 0 oder 0,5, die Phase der wärmeren Jahreszeit); gepflanzt: die
  // Phase als Ort − Tafel (absolut gelesen) gäbe am Süd-Anker 0,5 → ROT
  { const og = ortGesetz(), pl = planVon('erde-01'), S = P.planetScheibe(pl, 0), A = P.planetAnker(pl, 0, og), oA = P.planetOrt(S, A.breite, A.laenge, og), dA = oA.delta.klima.sommerPhase, absA = oA.klima.sommerPhase;
    const dN = P.planetOrt(S, -A.breite, A.laenge, og).delta.klima.sommerPhase, grad = (A.breite * 180 / Math.PI).toFixed(2);
    zeile('ort.delta.phase', A.breite < 0 && Object.is(dA, 0) && dN === 0.5 && absA === (og.klimaHeute.sommerPhase + 0.5) % 1, 'Süd-Anker erde-01 (' + grad + '°): Phase-Δ am Anker ' + (Object.is(dA, 0) ? '+0' : dA) + ', auf der Nord-Halbkugel ' + dN + ' (absolut am Anker ' + absA + ', Tafel ' + og.klimaHeute.sommerPhase + ')');
    const am = P.planetOrt(S, A.breite, A.laenge, og).delta, mut = Object.assign({}, am, { klima: Object.assign({}, am.klima, { sommerPhase: absA - og.klimaHeute.sommerPhase }) });
    zeile('ort.delta.phase feuert', deltaNull(am) && !deltaNull(mut), 'gepflanzt: Phase als Ort − Tafel statt Ort − Anker (' + mut.klima.sommerPhase + ' am Süd-Anker) → ROT'); }
  { const Q = Object.assign({}, P, { planetOrtDerZeit: (pl, b, l, t0, t1, o) => { P.planetOrtDerZeit(pl, b, l, t0, t1, o); if (t1 === 0) o.laenge += 1e-6; return o; } });
    const zr = zeitReise(planVon('erde-01'), 'erde-01', Q); zeile('zeit.reise feuert', zr.rtOk < zr.rtN, 'gepflanzt: Rückweg um 10⁻⁶ rad versetzt → hin und zurück ≤ 10⁻⁹ rad ' + zr.rtOk + '/' + zr.rtN + ' → ROT'); }
  let jahrBrach = false; try { const og = ortGesetz(), pl = P.planetPlan('erde-01', Object.assign({}, P.PLANET_ERDE, { jahrTage: og.klimaHeute.jahrTage + 0.25 })); P.planetOrt(P.planetScheibe(pl, 0), 0.8, 0.1, og); } catch (e) { jahrBrach = /R5/.test(e.message); }
  zeile('ort.jahr bricht', jahrBrach, 'gepflanzt: Körper mit Jahr ' + (P.PLANET_ERDE.jahrTage + 0.25) + ' gegen das Ort-Gesetz ' + ortGesetz().klimaHeute.jahrTage + ' → bricht beim Namen (R5)');
  const bv = versionUrteil('planet-x', 'abc', { 'planet-x': 'abd' }); zeile('bytes.version feuert', !bv.ok, 'gepflanzt: SHA abc bei VERSION planet-x, Tafel abd → ' + bv.wert);
  gesichtSelbsttest(zeile);
  gegner2Selbsttest(zeile);
  welle1Selbsttest(zeile);
  return out;
}

// ── Richter gegner2: die Funde der zwei Gegner vom 15.11. als Maß (Zweig koordination, vision/planet: gegner2-bild, gegner2-zahl) ──────────────
// rand.stern (F1): Knick-Summe Σ|g(i+1) − 2g(i) + g(i−1)| des Gedächtnis-Terms auf einem Ring von 64 Punkten im Abstand 0,25·r um die
//   Mitte jeder Scholle (t = 0, fuss 16) — die Strahlen des Sterns sind Knicke im Azimut. Summe je Saat in km.
// rand.ueber (F9): Land-Anteil mit Gedächtnis > 1 km gegen Orogen > 1 km, t = 0 und +50 Ma (Gitter 240 × 120, Fläche gewichtet).
// eis.kante (F5): je Halbkugel und Länge (120) die erste Breite ab 45° in 0,5°-Schritten, an der das Meer im Winter < −12 °C hat;
//   Spanne p05–p95 in Grad über den Umfang (nur Spalten mit Meer an der Kante).
// zeit.wechsel (Gegner Zahl §5): an jedem Abschnitt-Wechsel 64 feste Punkte; ein Sprung ist |h(t_b + 10⁻⁵) − h(t_b − 10⁻⁵)| > 5 m UND
//   größer als die Änderung über die 0,01 Ma davor (dieselbe Regel wie die Sonde des Gegners).
function knickSumme(a) { let s = 0; const n = a.length; for (let i = 0; i < n; i++) s += Math.abs(a[(i + 1) % n] - 2 * a[i] + a[(i + n - 1) % n]); return s; }
function spanne(a) { return a.length ? quantil(a, 0.95) - quantil(a, 0.05) : NaN; }
function saatGegner2(samen) {
  const plan = planVon(samen), S0 = P.planetScheibe(plan, 0), T = {}, o = {}, R = S0.R;
  // F1 Stern
  let stern = 0, sternMax = 0;
  for (let s = 0; s < plan.nS; s++) {
    const cx = S0.sw[3 * s], cy = S0.sw[3 * s + 1], cz = S0.sw[3 * s + 2], r = 0.25 * S0.sr[s];
    const ex = Math.abs(cx) < 0.9 ? 1 : 0, ey = 1 - ex; let ax = ey * cz, ay = -ex * cz, az = ex * cy - ey * cx; const la = Math.hypot(ax, ay, az); ax /= la; ay /= la; az /= la;
    const bx = cy * az - cz * ay, by = cz * ax - cx * az, bz = cx * ay - cy * ax;
    const g = new Float64Array(64); let land = 0;
    for (let i = 0; i < 64; i++) {
      const th = i / 64 * 2 * Math.PI, c = Math.cos(r), sn = Math.sin(r), dx = Math.cos(th) * ax + Math.sin(th) * bx, dy = Math.cos(th) * ay + Math.sin(th) * by, dz = Math.cos(th) * az + Math.sin(th) * bz;
      if (P.planetPunktR(S0, c * cx + sn * dx, c * cy + sn * dy, c * cz + sn * dz, 16, o) > 0) land++;
      P._intern.terme(T); g[i] = T.gedaechtnis;
    }
    if (land < 48) continue;
    const k = knickSumme(g); stern += k; if (k > sternMax) sternMax = k;
  }
  // F9 Gedächtnis über dem lebenden Gebirge
  const ueber = {};
  for (const t of [0, 50]) {
    const S = P.planetScheibe(plan, t); let wL = 0, wM = 0, wO = 0;
    for (let j = 0; j < 120; j++) { const phi = (j + 0.5) / 120 * Math.PI - Math.PI / 2, w = Math.cos(phi);
      for (let i = 0; i < 240; i++) { const lam = (i + 0.5) / 240 * 2 * Math.PI - Math.PI; if (!(P.planetPunkt(S, phi, lam, 60, o) > 0)) continue; P._intern.terme(T); wL += w; if (T.gedaechtnis > 1) wM += w; if (T.orogen > 1) wO += w; } }
    ueber[t] = { mem: wM / wL, oro: wO / wL };
  }
  // F5 Eis-Kante
  const K = {}, kanten = { nord: [], sued: [] };
  for (const sg of [1, -1]) for (let i = 0; i < 120; i++) {
    const lam = (i + 0.5) / 120 * 2 * Math.PI - Math.PI;
    for (let b = 45; b < 89.5; b += 0.5) {
      const phi = sg * b * Math.PI / 180, h = P.planetPunkt(S0, phi, lam, 40, o); if (h > 0) break;   // Land vor der Kante: Spalte zählt nicht
      P.planetKlima(S0, phi, lam, -1, K, o); if (K.tWinterC < -12) { kanten[sg > 0 ? 'nord' : 'sued'].push(b); break; }
    }
  }
  // Abschnitt-Wechsel (Höhen in Meter)
  let wechsel = 0, wechselMax = 0, paare = 0; const F = P._intern.fib(64);
  for (let b = 1; b < plan.bilder.length; b++) {
    const tb = plan.bilder[b]; if (!(tb > -4000 && tb < 1000)) continue;
    const Sc = P.planetScheibe(plan, tb - 1e-2), Sa = P.planetScheibe(plan, tb - 1e-5), Sb = P.planetScheibe(plan, tb + 1e-5);
    for (let i = 0; i < 64; i++) { const x = F[3 * i], y = F[3 * i + 1], z = F[3 * i + 2], ha = P.planetPunktR(Sa, x, y, z, 16), d = Math.abs(P.planetPunktR(Sb, x, y, z, 16) - ha), vor = Math.abs(ha - P.planetPunktR(Sc, x, y, z, 16)); paare++; if (d > 5 && d > vor) { wechsel++; if (d > wechselMax) wechselMax = d; } }
  }
  return { samen, stern, sternMax, ueber, eisNord: spanne(kanten.nord), eisSued: spanne(kanten.sued), eisN: kanten.nord.length + kanten.sued.length, wechsel, wechselMax, paare };
}
function ortMemo() { // Gegner Zahl §6: planetOrt nach einem Ruf mit dem alten Gesetz = planetOrt am frischen Plan (Regler ×1,2)
  const og = ortGesetz(), og2 = Object.assign({}, og, { regler: og.regler.map(r => Object.assign({}, r, { min: r.min * 1.2, max: r.max * 1.2 })) });
  const p1 = planVon('erde-36'), S1 = P.planetScheibe(p1, 0), A = P.planetAnker(p1, 0, og);
  P.planetOrt(S1, A.breite + 0.01, A.laenge, og); const a = JSON.stringify(P.planetOrt(S1, A.breite + 0.01, A.laenge, og2));
  const p2 = planVon('erde-36'), S2 = P.planetScheibe(p2, 0); const b = JSON.stringify(P.planetOrt(S2, A.breite + 0.01, A.laenge, og2));
  return { gleich: a === b, la: a.length, lb: b.length };
}
function urteilGegner2(R) {
  const out = []; const zeile = (name, ok, wert, schwelle) => out.push({ name, urteil: ok === null ? 'INFO' : (ok ? 'GRÜN' : 'ROT'), wert, schwelle });
  const f = (x, n) => (Number.isFinite(x) ? x.toFixed(n) : '—');
  zeile('rand.stern', null, 'Knick-Summe je Saat Median ' + f(median(R.map(r => r.stern)), 2) + ' km (' + f(Math.min(...R.map(r => r.stern)), 2) + '–' + f(Math.max(...R.map(r => r.stern)), 2) + '), stärkster Ring Median ' + f(median(R.map(r => r.sternMax)), 3) + ' km', '');
  for (const t of [0, 50]) zeile('rand.ueber.' + (t > 0 ? '+' : '') + t, null, 'Land mit Gedächtnis > 1 km ' + f(100 * median(R.map(r => r.ueber[t].mem)), 1) + ' % · Orogen > 1 km ' + f(100 * median(R.map(r => r.ueber[t].oro)), 1) + ' % (Mediane über die Saaten)', '');
  zeile('eis.kante', null, 'Spanne p05–p95 über den Umfang: Nord Median ' + f(median(R.map(r => r.eisNord).filter(Number.isFinite)), 2) + '° · Süd ' + f(median(R.map(r => r.eisSued).filter(Number.isFinite)), 2) + '° (Spalten ' + R.reduce((s, r) => s + r.eisN, 0) + ')', '');
  const w = R.reduce((s, r) => s + r.wechsel, 0), p = R.reduce((s, r) => s + r.paare, 0);
  zeile('zeit.wechsel', w === 0, w + ' Sprünge > 5 m von ' + p + ' Paaren, max ' + f(Math.max(...R.map(r => r.wechselMax)), 1) + ' m', '0');
  const m = ortMemo(); zeile('ort.memo', m.gleich, (m.gleich ? 'gleich' : 'VERSCHIEDEN') + ' (' + m.la + ' ↔ ' + m.lb + ' Zeichen; Regler ×1,2 nach einem Ruf mit dem alten Gesetz gegen den frischen Plan)', 'gleich');
  return out;
}
function gegner2Selbsttest(zeile) {
  const stern = Array.from({ length: 64 }, (_, i) => (i % 2 ? 0.8 : 0)), glatt = Array.from({ length: 64 }, (_, i) => 0.8 * Math.sin(i / 64 * 2 * Math.PI));
  zeile('rand.stern Täter', knickSumme(stern) > 10 * knickSumme(glatt), 'Fächer-Stern ' + knickSumme(stern).toFixed(2) + ' ↔ glatt ' + knickSumme(glatt).toFixed(3) + ' km');
  const breitenkreis = Array.from({ length: 120 }, () => 67), welle = Array.from({ length: 120 }, (_, i) => 67 + 6 * Math.sin(i / 120 * 4 * Math.PI));
  zeile('eis.kante Täter', spanne(breitenkreis) === 0 && spanne(welle) > 8, 'Breitenkreis ' + spanne(breitenkreis).toFixed(2) + '° ↔ Welle ' + spanne(welle).toFixed(2) + '°');
}

// ── Richter welle1 (der Lauf ohne Argument): die Bau-Welle 1 im Kern (Zweig zensus-planet, vision/planet: bahnen, welle-1) ─────
// Je Bahn die Linse am Kern selbst, sie nennt den Täter beim Namen (die Spike-Proben a–f bleiben der Richter der Bahn). Der Selbsttest
// lädt den Kern vor der Welle (main WELLE1_BASIS) aus git: an ihm ist jede Zeile ROT.
//  naht.stetig   B1  Querungen Platte · Scholle · Kruste auf 1 cm (Paare 20 km, Halbierung; erde-01, t = 0, fuss 16): |Δh| > 1 cm
//  kueste.stetig B2  Querungen Land ↔ Meer: |ΔT| > 10⁻³ K oder |ΔP| > 0,1 mm/a auf 1 cm
//  pet.eine      B2  DIE PET: der Kern trägt planetPet, ihre Formel steht EINMAL im Kern
//  wasser.*      B3  das Gitter des Kerns (planetWasserGitter) je Saat erde-01 … erde-10: Kreise 0 · Endsee-Land Median [10, 30] % ·
//                    P/PET Endsee ÷ Meer-Zufluss ≤ 0,8 · Abfluss ins Meer Median [18 600, 74 600] km³/a (Erde ~37 000) · Querungen der
//                    nächsten Zelle (planetWasserR) |ΔQ|/Q ≤ 10⁻³ auf 1 cm
//  anden.bogen   B4  c3 je Saat erde-01 … erde-10 (40 000 Adressen, fuss 16): Anteil Land > 2 km nah konvergentem Rand (≤ 500 km) ÷
//                    Anteil Land nah Rand ≥ 2 in 10/10
//  anker.traegt  B5  erde-01 … erde-30: der Anker bei fuss 16 Land, Wald > 0, Decke > 0, Spende > 0, kein Köppen E
//  ort.faellt    FÄLLT planetOrt trägt kontinentLambda, schichtDicke, hartAnteil nicht mehr (Zensus e217/e222/e223)
//  ort.jahreszeit    der Jahreszeiten-Vertrag Planet ↔ Ort-Gesetz, gelesen durch den Leser des Spiels (gelaende-core `ortGesetz(teil)`,
//                    `schneePegel`): Raster 4° × 10° (±80°) der Samen JZ_SAMEN, Land-Ziele bei fuss 16 — Sommer < Winter 0 · Schnee zur
//                    Sommer-Mitte auf der Höhe des Orts (Pegel ≥ `SCHMELZE.deckt`) bei Sommer > 10 °C dort 0. ROT nennt Samen, Lage und
//                    beide Temperaturen. Der Kern vor der Welle hält sie (0 von 1 751: seine vier Anker tragen eine Rest-Spanne ≤ 0) —
//                    der Selbsttest pflanzt die Täter: die Spanne gedreht, und das Δ am Namen (Sommer − Sommer, die Regel bis h2-10)
//  anker.jede-saat B5 (h2-12, die Treppe der Suche): Saaten in der Form des Spiels (`w-<12 hex>-<6 base36>`, speicher-welten.js). Die
//                    sieben ohne Ort bei 512 Proben (gefunden unter 1 000, 22.11.: ihre Welt verlor die Reise, K10) tragen einen Anker
//                    auf Land im Band des Orts, Küste ≤ 300 km; die drei MIT Ort bei 512 behalten ihn bitgleich (gedruckt am Kern
//                    h2-11) — eine Treppe, die immer dicht sucht, verlegte die Heimat jeder bestehenden Welt.
const ANKER_OHNE = ['w-01af28a3778c-joh5qy', 'w-4e5d1f6f6c95-0p5egg', 'w-acbdeb135043-eck84s', 'w-490e6c4ee7e2-tru1nr', 'w-631d83066edb-tnlitu', 'w-7200c43edddf-x7ej0i', 'w-7ce3cc43db86-85pjtx'];
const ANKER_512 = { 'w-d10e897e3fad-azvhsr': [-0.8198373003353616, 2.82245394031362], 'w-e6ea6c6b804e-mr4t9z': [0.7873001940494889, 1.7348001157121467], 'w-4a2768b6253a-h4uio8': [-0.7858054509523461, 0.38204771205551397] };
const WELLE1_BASIS = 'b7ed8419', W1_SAATEN = SAATEN.slice(0, 10), W1_ZIEL = 400, PET_FORMEL = /\b400\s*\+\s*45\s*\*/g;
function basisKern() { // der Kern vor der Welle: git show WELLE1_BASIS:planet-core.js → tmp; fehlt das Objekt, bricht der Selbsttest beim Namen
  const aus = path.join(os.tmpdir(), 'planet-core-' + WELLE1_BASIS + '-' + process.pid + '.js');
  const text = execFileSync('git', ['show', WELLE1_BASIS + ':planet-core.js'], { cwd: path.join(__dirname, '..'), maxBuffer: 1 << 26, encoding: 'utf8' });
  fs.writeFileSync(aus, text); delete globalThis.__planetCore; const Q = require(aus); delete globalThis.__planetCore; fs.unlinkSync(aus);
  return { Q, text };
}
function planQ(Q, samen) { return Q.planetPlan(samen, Object.assign({}, Q.PLANET_ERDE)); }
function ankerJedeSaat(Q, og) { // die Zeile anker.jede-saat: EIN Leser für den Richter welle1 und für die Wand `--anker` (gate:worker-dichte)
  const ohne = [], meer = [], fremd = [], nL = (l) => l.length + (l.length ? ' (' + l.join(', ') + ')' : '');
  for (const s of ANKER_OHNE) { try { const pl = planQ(Q, s), An = Q.planetAnker(pl, 0, og), p = {}; Q.planetPunkt(Q.planetScheibe(pl, 0), An.breite, An.laenge, 16, p); if (!(p.hoeheM > 0) || !(An.kuesteKm <= 300)) meer.push(s); } catch (e) { ohne.push(s); } }
  for (const s of Object.keys(ANKER_512)) { try { const An = Q.planetAnker(planQ(Q, s), 0, og); if (An.breite !== ANKER_512[s][0] || An.laenge !== ANKER_512[s][1]) fremd.push(s); } catch (e) { fremd.push(s); } }
  return { ok: !ohne.length && !meer.length && !fremd.length, ohne, meer, fremd, wert: 'von ' + ANKER_OHNE.length + ' Saaten ohne Ort bei 512 Proben ohne Anker ' + nL(ohne) + ' · Anker im Meer oder Küste > 300 km ' + nL(meer) + ' · von ' + Object.keys(ANKER_512).length + ' Saaten mit Ort bei 512 verlegt ' + nL(fremd) };
}
// die Täter der Treppe, gepflanzt in den Kern des Baums (sein Text, EINE Zeile getauscht, ohne git): `[512]` ist der Kern vor der
// Treppe (jede der sieben Saaten bricht), `[2048, 8192, 32768]` die Treppe, die immer dicht sucht (sie verlegt bestehende Heimaten)
function ankerMutant(proben) {
  return kernMutant(/const ANKER_PROBEN = \[[^\]]*\];/, 'const ANKER_PROBEN = [' + proben.join(', ') + '];', 'anker-' + proben.length);
}
function kernMutant(re, ersatz, marke) { // der Kern des Baums mit EINER getauschten Zeile (sein Text, ohne git); null, wenn die Zeile fehlt
  const text = fs.readFileSync(KERN, 'utf8');
  if (!re.test(text)) return null; // der Kern trägt die Zeile nicht: der Aufrufer nennt es
  const aus = path.join(os.tmpdir(), 'planet-core-' + marke + '-' + process.pid + '.js'), halt = globalThis.__planetCore;
  fs.writeFileSync(aus, text.replace(re, ersatz)); delete globalThis.__planetCore;
  try { return require(aus); } finally { if (halt === undefined) delete globalThis.__planetCore; else globalThis.__planetCore = halt; fs.unlinkSync(aus); }
}
// DIE NEIGUNG AM ORT (Karte 2 planet.kopplung.bahn-klima#2): der Ort (45°, Länge des Ankers) am Samen des Spiels, der Körper der Erde
// gegen die Neigung 0 — gelesen wie der Richter (Heimat + Δ, Sommer − Winter) und wie der Faden (`planetOrtAuftrag`: das Δ gegen den
// Anker der HEIMAT, 6. Parameter). Ohne Neigung kein Jahres-Gang: die Spanne ≤ 10 % der Erde, die Antwort ≠ die der Erde, und
// dieselbe Saat gibt dasselbe Feld (der Plan zweimal gebaut, byte-gleich). `ohneHeimat`: der Täter vor dem Schnitt (eigener Anker).
function neigungZeile(Q, og, ohneHeimat) {
  const samen = 'anazh-realm-seed', kh = og.klimaHeute, RAD = Math.PI / 180, heim = planQ(Q, samen), A = Q.planetAnker(heim, 0, og);
  const am = (n) => { const pl = n === undefined ? heim : Q.planetPlan(samen, Object.assign({}, Q.PLANET_ERDE, { neigungRad: n })), S = Q.planetScheibe(pl, 0);
    const d = (ohneHeimat ? Q.planetOrt(S, 45 * RAD, A.laenge, og) : Q.planetOrt(S, 45 * RAD, A.laenge, og, undefined, heim)).delta.klima;
    return { amp: kh.sommer + d.sommer - (kh.winter + d.winter), json: JSON.stringify(d) }; };
  const e = am(), n0 = am(0), n0b = am(0), n45 = am(0.7854), proz = 100 * n0.amp / e.amp;
  return { ok: proz <= 10 && n0.json !== e.json && n0.json === n0b.json, proz,
    wert: 'Spanne an 45° (' + samen + '): Erde ' + e.amp.toFixed(3) + ' K · Neigung 0 ' + n0.amp.toFixed(3) + ' K (' + proz.toFixed(1) + ' %) · Neigung 45° ' + n45.amp.toFixed(3) + ' K (' + (n45.amp / e.amp).toFixed(3) + '×) · dieselbe Saat ' + (n0.json === n0b.json ? 'byte-gleich' : 'ANDERS') };
}
function ankerWand(selbst) { // `--anker`: die Zeile am Kern des Baums · `--anker --selftest`: beide Täter fallen beim Namen
  const og = ortGesetz(), U = [], zeile = (name, ok, wert, schwelle) => U.push({ name, urteil: ok ? 'GRÜN' : 'ROT', wert, schwelle });
  if (!selbst) { const J = ankerJedeSaat(P, og); zeile('anker.jede-saat', J.ok, J.wert, '0 · 0 · 0 (B5, die Treppe)');
    const N = neigungZeile(P, og); zeile('ort.neigung', N.ok, N.wert, 'Neigung 0 ≤ 10 % der Erd-Spanne, ≠ Erde, Saat byte-gleich'); return U; }
  // die Täter der Neigung: der eigene Anker (vor dem Schnitt) und die Zuschläge der Küsten ohne den Gang der Neigung (jG = 1)
  const N1 = neigungZeile(P, og, true), QG = kernMutant(/const jG = sb \/ ksin\(PLANET_ERDE\.neigungRad\);/, 'const jG = 1;', 'neigung');
  zeile('ort.neigung feuert', !N1.ok, 'gepflanzt: das Δ gegen den eigenen Anker → ' + N1.wert);
  if (!QG) zeile('ort.neigung nennt', false, 'der Kern ' + P.VERSION + ' trägt keine Zeile jG — der Täter lässt sich nicht pflanzen');
  else { const N2 = neigungZeile(QG, og); zeile('ort.neigung nennt', !N2.ok, 'gepflanzt: die Küsten-Zuschläge ohne den Gang der Neigung (jG = 1) → ' + N2.wert); }
  const Q1 = ankerMutant([512]), Q2 = ankerMutant([2048, 8192, 32768]);
  if (!Q1 || !Q2) { zeile('anker.jede-saat feuert', false, 'der Kern ' + P.VERSION + ' trägt keine Tafel ANKER_PROBEN — die Täter lassen sich nicht pflanzen'); return U; }
  const J1 = ankerJedeSaat(Q1, og), J2 = ankerJedeSaat(Q2, og);
  zeile('anker.jede-saat feuert', !J1.ok && J1.ohne.length === ANKER_OHNE.length, 'gepflanzt: die Suche endet bei 512 Proben (der Kern vor der Treppe) → ' + J1.wert);
  zeile('anker.jede-saat nennt', !J2.ok && J2.fremd.length > 0 && !J2.ohne.length, 'gepflanzt: die Suche beginnt bei 2 048 Proben (immer dicht) → ' + J2.wert);
  return U;
}
function naechsteZelle(W, x, y, z) { // die nächste Zelle des Wasser-Gitters über seinen Raum-Index (27 Würfel)
  const I = W.idx, K = I.K, ze = I.ze, F = W.F, a = Math.floor((x + 1) / ze) + 1, b = Math.floor((y + 1) / ze) + 1, c = Math.floor((z + 1) / ze) + 1; let best = -1, bd = -2;
  for (let dz = -1; dz <= 1; dz++) for (let dy = -1; dy <= 1; dy++) { const k0 = a + K * ((b + dy) + K * (c + dz)); for (let e = I.kopf[k0 - 1], e1 = I.kopf[k0 + 2]; e < e1; e++) { const i = I.liste[e], cc = x * F[3 * i] + y * F[3 * i + 1] + z * F[3 * i + 2]; if (cc > bd) { bd = cc; best = i; } } }
  return best;
}
function querungen(Q, ziel) { // erde-01, t = 0: Paare 20 km, je Art die ersten `ziel` Querungen, halbiert auf 1 cm; Werte beidseits
  const S = Q.planetScheibe(planQ(Q, 'erde-01'), 0), R = S.R, W = typeof Q.planetWasserGitter === 'function' ? Q.planetWasserGitter(S) : null;
  const ARTEN = W ? ['platte', 'scholle', 'kruste', 'kueste', 'zelle'] : ['platte', 'scholle', 'kruste', 'kueste'], funde = Object.fromEntries(ARTEN.map(a => [a, []]));
  const o = {}, pA = {}, pB = {}, kA = {}, kB = {}, wA = {}, wB = {}, k = P.planetHash('welle1|querung'), d0 = 20 / R, cm = 1e-5 / R;
  const klasse = (x, y, z) => { const h = Q.planetPunktR(S, x, y, z, 16, o); return { platte: o.platte, scholle: o.scholle, kruste: o.kruste, kueste: h > 0, zelle: W ? naechsteZelle(W, x, y, z) : -1 }; };
  const u = [0, 0, 0], t = [0, 0, 0], am = (s, out) => { const c = Math.cos(s), si = Math.sin(s); for (let j = 0; j < 3; j++) out[j] = c * u[j] + si * t[j]; return out; }, m = [0, 0, 0], lo = [0, 0, 0], hi = [0, 0, 0];
  let paare = 0;
  while (ARTEN.some(a => funde[a].length < ziel) && paare < 400000) {
    const yy = 2 * P.planetZufall(k, 1, paare, 1) - 1, ph = 2 * Math.PI * P.planetZufall(k, 1, paare, 2), q = Math.sqrt(1 - yy * yy); u[0] = q * Math.cos(ph); u[1] = yy; u[2] = q * Math.sin(ph);
    const r0 = [P.planetZufall(k, 2, paare, 1) - 0.5, P.planetZufall(k, 2, paare, 2) - 0.5, P.planetZufall(k, 2, paare, 3) - 0.5], dp = r0[0] * u[0] + r0[1] * u[1] + r0[2] * u[2];
    for (let j = 0; j < 3; j++) t[j] = r0[j] - dp * u[j]; const tn = Math.hypot(t[0], t[1], t[2]); for (let j = 0; j < 3; j++) t[j] /= tn;
    paare++;
    const ku = klasse(u[0], u[1], u[2]); am(d0, m); const kv = klasse(m[0], m[1], m[2]);
    for (const art of ARTEN) {
      if (funde[art].length >= ziel || ku[art] === kv[art]) continue;
      let a = 0, b = d0; const ka = ku[art];
      while (b - a > cm) { const c = 0.5 * (a + b); am(c, m); if (klasse(m[0], m[1], m[2])[art] === ka) a = c; else b = c; }
      am(a, lo); am(a + cm, hi);
      const f = { dh: Math.abs(Q.planetPunktR(S, hi[0], hi[1], hi[2], 16, pB) - Q.planetPunktR(S, lo[0], lo[1], lo[2], 16, pA)) };
      // das Klima der Adresse mit ihrem Punkt (fuss 16): der Lese-Pfad des Orts
      if (art === 'kueste') { Q.planetKlimaR(S, lo[0], lo[1], lo[2], -1, kA, pA); Q.planetKlimaR(S, hi[0], hi[1], hi[2], -1, kB, pB); f.dT = Math.abs(kB.tJahrC - kA.tJahrC); f.dP = Math.abs(kB.niederschlagMm - kA.niederschlagMm); }
      if (art === 'zelle') { Q.planetWasserR(W, lo[0], lo[1], lo[2], wA); Q.planetWasserR(W, hi[0], hi[1], hi[2], wB); f.dQ = Math.abs(wB.qM3s - wA.qM3s) / (wA.qM3s + 1e-3); }
      funde[art].push(f);
    }
  }
  return { funde, paare, W: !!W };
}
function anker30(Q, og) { // B5: was der Ort am Anker trägt, gelesen bei fuss 16
  const F = { meer: [], wald: [], decke: [], spende: [], e: [] };
  for (const s of SAATEN) {
    const plan = planQ(Q, s), S = Q.planetScheibe(plan, 0), A = Q.planetAnker(plan, 0, og), p = {}; Q.planetPunkt(S, A.breite, A.laenge, 16, p); const o = Q.planetOrt(S, A.breite, A.laenge, og);
    if (!(p.hoeheM > 0)) F.meer.push(s); if (!(o.wuchs.wald > 0)) F.wald.push(s); if (!(o.wuchs.decke > 0)) F.decke.push(s); if (!(o.klima.spendeMm > 0)) F.spende.push(s); if (/^E/.test(Q.KOEPPEN[o.biom.koeppen])) F.e.push(s);
  }
  return F;
}
function saatWelle1(Q, samen) { // c3 über 40 000 Adressen, c6 über das Gitter des Kerns
  const S = Q.planetScheibe(planQ(Q, samen), 0), N = 40000, Fb = Q._intern.fib(N), o = {}; let land = 0, hoch = 0, hochRand = 0, landRand = 0;
  for (let i = 0; i < N; i++) {
    if (!(Q.planetPunktR(S, Fb[3 * i], Fb[3 * i + 1], Fb[3 * i + 2], 16, o) > 0)) continue; land++;
    const nah = o.randArt === Q.RAND_ART.konvergent && o.randAbstandKm <= 500; if (nah) landRand++; if (o.hoeheM > 2000) { hoch++; if (nah) hochRand++; }
  }
  const r = { samen, c3: hoch && landRand ? (hochRand / hoch) / (landRand / land) : NaN };
  if (typeof Q.planetWasserGitter !== 'function') return r;
  const W = Q.planetWasserGitter(S), NW = W.N; let wLand = 0, wEnd = 0, tEnd = 0, tExo = 0, qMeer = 0, kreise = 0;
  for (let i = 0; i < NW; i++) {
    if (W.h[i] <= 0) continue; wLand++; const ar = W.pM[i] / Q.planetPet(W.tJ[i]);
    if (W.zielMeer[i] < 0) { wEnd++; tEnd += ar; } else tExo += ar;
    if (W.h[W.emp[i]] <= 0 && W.zielMeer[i] >= 0) qMeer += W.acc[i];
    let c = i, n = 0; while (c >= 0 && W.h[c] > 0 && W.endseeVon[c] < 0 && n <= NW) { c = W.emp[c]; n++; } if (n > NW || c < 0) kreise++;
  }
  return Object.assign(r, { N: NW, endsee: wEnd / wLand, trocken: (tEnd / wEnd) / (tExo / (wLand - wEnd)), abflussKm3a: qMeer / 1e9, kreise });
}
const JZ_SAMEN = ['anazh-realm-seed', 'erde-01', '7', '42'], JZ_PLAENE = new Map();
function jahreszeit(Q, og, ortVon) { // ortVon (Selbsttest): der gepflanzte Täter an der Stelle von planetOrt
  require(path.join(__dirname, '..', 'gelaende-core.js')); const G = globalThis.__gelaendeCore, RAD = Math.PI / 180, a = ns(), p = {};
  const F = { land: 0, inv: [], schnee: [], bruch: [], spanneMin: Infinity };
  for (const s of JZ_SAMEN) {
    const key = Q.VERSION + '|' + s; if (!JZ_PLAENE.has(key)) JZ_PLAENE.set(key, Q.planetPlan(s, Q.PLANET_ERDE));   // der Plan des Spiels (voxel-worker `planetPlanVon`)
    const S = Q.planetScheibe(JZ_PLAENE.get(key), 0);
    for (let b = -80; b <= 80; b += 4) for (let l = -180; l < 180; l += 10) {
      Q.planetPunkt(S, b * RAD, l * RAD, 16, p); if (!(p.hoeheM > 0)) continue;
      F.land++;
      const o = (ortVon || Q.planetOrt)(S, b * RAD, l * RAD, og), d = o.delta, wo = s + ' ' + b + '°/' + l + '°';
      // der Teil `ort`, wie ihn der Faden des Spiels reicht (voxel-worker `planetOrtAuftrag`)
      const teil = { samen: s, version: Q.VERSION, breite: b, laenge: l, zeitMa: 0, delta: { klima: { sommer: d.klima.sommer, winter: d.klima.winter, tagAmp: d.klima.tagAmp, sommerPhase: d.klima.sommerPhase, spendeVerh: d.klima.spendeVerh },
        meer: { waterLevelM: d.meer.waterLevelM }, wetter: { regenQuote: d.wetter.regenQuote, sturmQuote: d.wetter.sturmQuote }, wuchs: { decke: d.wuchs.decke, wald: d.wuchs.wald }, eis: { zeit: d.eis.zeit }, wildnis: Object.assign({}, d.wildnis) } };
      let O; try { O = G.ortGesetz(teil); } catch (e) { F.bruch.push(wo + ' ' + e.message.split('\n')[0]); continue; }
      const K = O.klimaHeute, y = o.stauchung * p.hoeheM, tOrt = K.sommer - O.kuehlungKJeM * y, T = wo + ' Sommer ' + K.sommer.toFixed(1) + ' / Winter ' + K.winter.toFixed(1) + ' °C';
      if (K.sommer - K.winter < F.spanneMin) F.spanneMin = K.sommer - K.winter;
      if (K.sommer < K.winter) F.inv.push(T);
      if (tOrt > 10 && G.schneePegel({ waterLevel: 0, ort: O }, y, K.sommerPhase) >= G.SCHMELZE.deckt) F.schnee.push(T + ' (am Ort ' + tOrt.toFixed(1) + ' °C auf ' + y.toFixed(0) + ' m)');
    }
  }
  F.s = (ns() - a) / 1e9; return F;
}
function jahreszeitZeile(zeile, F) {
  const nenn = (l) => l.length + (l.length ? ' (' + l.slice(0, 3).join(' · ') + (l.length > 3 ? ' · …' : '') + ')' : '');
  zeile('ort.jahreszeit', F.inv.length + F.schnee.length + F.bruch.length === 0, 'von ' + F.land + ' Land-Zielen (' + JZ_SAMEN.join(', ') + '; 4° × 10°): Sommer < Winter ' + nenn(F.inv) + ' · Schnee zur Sommer-Mitte bei > 10 °C am Ort ' + nenn(F.schnee) +
    (F.bruch.length ? ' · vom Ort-Gesetz abgelehnt ' + nenn(F.bruch) : '') + ' · kleinste Spanne ' + F.spanneMin.toFixed(3) + ' K · ' + F.s.toFixed(1) + ' s', '0 · 0 (Jahreszeiten-Vertrag)');
}
function welle1(Q, text) {
  const U = [], zeile = (name, ok, wert, schwelle) => U.push({ name, urteil: ok ? 'GRÜN' : 'ROT', wert, schwelle }), pc = (v) => (100 * v).toFixed(1) + ' %';
  const Qr = querungen(Q, W1_ZIEL), fu = Qr.funde, sp = (a) => fu[a].filter(f => f.dh > 0.01).length, mx = (a, key) => Math.max(...fu[a].map(f => f[key]));
  zeile('naht.stetig', sp('platte') + sp('scholle') + sp('kruste') === 0, 'Sprünge |Δh| > 1 cm über 1 cm: Platte ' + sp('platte') + '/' + fu.platte.length + ' · Scholle ' + sp('scholle') + '/' + fu.scholle.length + ' · Kruste ' + sp('kruste') + '/' + fu.kruste.length + ' (max ' + ['platte', 'scholle', 'kruste'].map(a => mx(a, 'dh').toExponential(1)).join(' · ') + ' m; ' + Qr.paare + ' Paare)', '0 (B1)');
  const ks = fu.kueste.filter(f => f.dT > 1e-3 || f.dP > 0.1).length;
  zeile('kueste.stetig', ks === 0, 'Klima-Sprünge an ' + ks + '/' + fu.kueste.length + ' Querungen Land ↔ Meer (|ΔT| max ' + mx('kueste', 'dT').toExponential(1) + ' K · |ΔP| max ' + mx('kueste', 'dP').toExponential(1) + ' mm/a)', '|ΔT| ≤ 10⁻³ K, |ΔP| ≤ 0,1 mm/a auf 1 cm (B2)');
  const nPet = (text.match(PET_FORMEL) || []).length;
  zeile('pet.eine', nPet === 1 && typeof Q.planetPet === 'function', 'PET-Formel im Kern ' + nPet + '× · planetPet ' + (typeof Q.planetPet === 'function' ? 'gelesen (Wuchs, Wasser, Richter)' : 'FEHLT'), '1×, planetPet (B2)');
  const R = W1_SAATEN.map(s => saatWelle1(Q, s)), c3ok = R.filter(r => r.c3 >= 2).length;
  zeile('anden.bogen', c3ok === R.length, 'c3 ≥ ×2 in ' + c3ok + '/' + R.length + ' Saaten (min ×' + Math.min(...R.map(r => r.c3)).toFixed(2) + '; je Saat ' + R.map(r => r.c3.toFixed(2)).join(' · ') + ')', '10/10 (B4)');
  if (!Qr.W) for (const n of ['wasser.kreise', 'wasser.endsee', 'wasser.trocken', 'wasser.abfluss', 'wasser.stetig']) zeile(n, false, 'der Kern trägt kein Wasser-Gitter (planetWasserGitter fehlt; S5 lebte im Spike)', 'S5 im Kern (B3)');
  else {
    const med = (k) => median(R.map(r => r[k]));
    zeile('wasser.kreise', R.every(r => r.N === 40000) && R.reduce((s, r) => s + r.kreise, 0) === 0, R.reduce((s, r) => s + r.kreise, 0) + ' Läufe ohne Meer und Endsee über ' + R.length + ' Saaten · N_W ' + [...new Set(R.map(r => r.N))].join('/'), '0 · N_W = 40 000 (B3)');
    zeile('wasser.endsee', med('endsee') >= 0.10 && med('endsee') <= 0.30, 'Endsee-Land Median ' + pc(med('endsee')) + ' (' + pc(Math.min(...R.map(r => r.endsee))) + ' … ' + pc(Math.max(...R.map(r => r.endsee))) + ')', '[10, 30] % (B3)');
    zeile('wasser.trocken', med('trocken') <= 0.8, 'P/PET Endsee ÷ Meer-Zufluss Median ' + med('trocken').toFixed(2) + ' (PET: planetPet)', '≤ 0,8 (B3)');
    zeile('wasser.abfluss', med('abflussKm3a') >= 18600 && med('abflussKm3a') <= 74600, 'Abfluss ins Meer Median ' + med('abflussKm3a').toFixed(0) + ' km³/a', '[18 600, 74 600] km³/a (B3)');
    const dq = mx('zelle', 'dQ');
    zeile('wasser.stetig', dq <= 1e-3, '|ΔQ|/Q max ' + dq.toExponential(1) + ' an ' + fu.zelle.length + ' Querungen der nächsten Zelle auf 1 cm', '≤ 10⁻³ (B3)');
  }
  const og = ortGesetz(), F = anker30(Q, og), nA = (k) => F[k].length + (F[k].length ? ' (' + F[k].join(', ') + ')' : '');
  zeile('anker.traegt', Object.values(F).every(l => l.length === 0), 'von ' + SAATEN.length + ' Ankern bei fuss 16 im Meer ' + nA('meer') + ' · Wald 0 ' + nA('wald') + ' · Decke 0 ' + nA('decke') + ' · Spende 0 ' + nA('spende') + ' · Köppen E ' + nA('e'), '0 je Fall (B5)');
  { const J = ankerJedeSaat(Q, og); zeile('anker.jede-saat', J.ok, J.wert, '0 · 0 · 0 (B5, die Treppe)'); }
  const plan = planQ(Q, 'erde-01'), S0 = Q.planetScheibe(plan, 0), A = Q.planetAnker(plan, 0, og), wl = Q.planetOrt(S0, A.breite, A.laenge, og), FAELLT = ['kontinentLambda', 'schichtDicke', 'hartAnteil'];
  const traegt = FAELLT.filter(k => k in wl.wildnis || k in wl.delta.wildnis);
  zeile('ort.faellt', traegt.length === 0, 'planetOrt trägt ' + (traegt.length ? traegt.join(', ') : 'keinen der drei Δ ≡ 0') + ' · wildnis ' + Object.keys(wl.wildnis).join(', '), 'keiner (Zensus e217/e222/e223)');
  jahreszeitZeile(zeile, jahreszeit(Q, og));
  return U;
}
function kostenWasser(Q) { // B3 an der Adresse und am Gitter: Wasser je Adresse ≤ 8 µs · Gitter 4R ÷ R ≤ 1,35 (N_W fest, nie die Weltgröße)
  const U = [], zeile = (name, ok, wert, schwelle) => U.push({ name, urteil: ok ? 'GRÜN' : 'ROT', wert, schwelle });
  if (typeof Q.planetWasserGitter !== 'function' || typeof Q.planetWasserR !== 'function') { for (const n of ['kosten.wasser.adresse', 'kosten.wasser.radius']) zeile(n, false, 'der Kern trägt kein Wasser (planetWasserGitter/planetWasserR fehlen)', 'S5 im Kern (B3)'); return U; }
  const S = Q.planetScheibe(planQ(Q, 'erde-01'), 0), W = Q.planetWasserGitter(S), k = P.planetHash('kosten-wasser'), o = {}, med = [];
  for (let durchgang = 0; durchgang < 5; durchgang++) {
    const n = 20000, tt = new Float64Array(n);
    for (let i = 0; i < n; i++) { const y = 2 * P.planetZufall(k, durchgang, i, 1) - 1, ph = 2 * Math.PI * P.planetZufall(k, durchgang, i, 2), q = Math.sqrt(1 - y * y), x = q * Math.cos(ph), z = q * Math.sin(ph); const a = ns(); Q.planetWasserR(W, x, y, z, o); tt[i] = ns() - a; }
    med.push(quantil(tt, 0.5) / 1000);
  }
  zeile('kosten.wasser.adresse', Math.min(...med) <= 8, 'Median ' + Math.min(...med).toFixed(2) + ' µs (5 × 20 000, bestes; ' + med.map(v => v.toFixed(2)).join(' · ') + ')', '≤ 8 µs (B3)');
  const Sr = [6371, 4 * 6371].map(R => Q.planetScheibe(Q.planetPlan('erde-01', Object.assign({}, Q.PLANET_ERDE, { radiusKm: R, g: 9.81 * R / 6371 })), 0)), t = [Infinity, Infinity];
  for (let durchgang = 0; durchgang < 3; durchgang++) for (let j = 0; j < 2; j++) { const a = ns(); Q.planetWasserGitter(Sr[j]); t[j] = Math.min(t[j], (ns() - a) / 1e6); }
  zeile('kosten.wasser.radius', t[1] / t[0] <= 1.35, 'Gitter R ' + t[0].toFixed(0) + ' ms ↔ 4R ' + t[1].toFixed(0) + ' ms (×' + (t[1] / t[0]).toFixed(2) + ', verschränkt, Minimum von 3; N_W ' + Q.PLANET_WASSER_N + ')', '4R ÷ R ≤ 1,35 (B3)');
  return U;
}
function welle1Selbsttest(zeile) { // der Kern vor der Welle macht jede Welle-1-Zeile ROT
  let B; try { B = basisKern(); } catch (e) { zeile('welle1.basis', false, 'Kern ' + WELLE1_BASIS + ' nicht lesbar aus git: ' + e.message.split('\n')[0]); return; }
  // dazu der Schätzer von kosten.platten/radius (G3, 19.11.): main trug +82 % und 1,382 (Zweig zensus-planet, vision/planet: bahnen), an ihm muss er ROT stehen
  for (const u of [...welle1(B.Q, B.text), ...kostenWasser(B.Q), ...kostenSkala(B.Q)]) if (u.name !== 'ort.jahreszeit') zeile(u.name + ' feuert', u.urteil === 'ROT', 'Kern ' + WELLE1_BASIS + ' (' + B.Q.VERSION + '): ' + u.wert);
  // ort.jahreszeit: der Kern vor der Welle hält den Vertrag an diesen vier Samen (Rest-Spanne seiner Anker ≤ 0) — gepflanzt werden die
  // Täter selbst. (1) die Spanne gedreht: Heimat + Δ trägt Sommer und Winter getauscht bei gleicher Phase. (2) das Δ am Namen, die
  // Regel bis h2-10: Sommer − Sommer, Winter − Winter, die Phase nach der Halbkugel — die Rest-Spanne des Ankers zieht in den Tropen
  // den Sommer unter den Winter.
  const og = ortGesetz(), kh = og.klimaHeute, rot = (F) => { const U = []; jahreszeitZeile((name, ok, wert) => U.push({ ok, wert }), F); return U[0]; };
  const gedreht = (S, b, l, g) => { const o = P.planetOrt(S, b, l, g), k = o.delta.klima, so = kh.sommer + k.sommer, wi = kh.winter + k.winter; k.sommer = wi - kh.sommer; k.winter = so - kh.winter; return o; };
  const ankerKlima = new Map(), amAnker = (S, A, g) => { if (!ankerKlima.has(S)) ankerKlima.set(S, Object.assign({}, P.planetOrt(S, A.breite, A.laenge, g).klima)); return ankerKlima.get(S); };
  const amNamen = (S, b, l, g) => { const A = P.planetAnker(S.plan, 0, g), a = amAnker(S, A, g), o = P.planetOrt(S, b, l, g), k = o.delta.klima, sued = b < 0, warmHoch = (o.klima.sommerPhase === kh.sommerPhase) !== sued;
    const hoch = warmHoch ? o.klima.sommer : o.klima.winter, tief = warmHoch ? o.klima.winter : o.klima.sommer;
    k.sommer = hoch - a.sommer; k.winter = tief - a.winter; k.sommerPhase = (sued ? 0.5 : 0) - (A.breite < 0 ? 0.5 : 0); return o; };
  const u1 = rot(jahreszeit(P, og, gedreht)), u2 = rot(jahreszeit(P, og, amNamen));
  zeile('ort.jahreszeit feuert', !u1.ok, 'gepflanzt: die Spanne des Jahres-Gangs gedreht → ' + u1.wert);
  zeile('ort.jahreszeit nennt', !u2.ok && /Sommer < Winter [1-9]/.test(u2.wert), 'gepflanzt: das Δ am Namen (Sommer − Sommer, die Regel bis h2-10) → ' + u2.wert);
}

function drucken(titel, U) { console.log('── ' + titel); for (const u of U) console.log((u.urteil + '     ').slice(0, 6) + ' ' + u.name.padEnd(22) + ' ' + u.wert + (u.schwelle ? '   [Schwelle ' + u.schwelle + ']' : '')); }

// ── Haupt ──────────────────────────────────────────────────────────────────────────────────────────────
if (require.main !== module && isMainThread) { /* als Modul geladen: nur Exporte */ } else if (!isMainThread) {
  const r = workerData.saaten.map(s => (workerData.modus === 'bau3' ? saatZeit(s) : (workerData.modus === 'bau2' ? saatKlima(s) : (workerData.modus === 'gesicht' ? saatGesicht(s) : (workerData.modus === 'gegner2' ? saatGegner2(s) : saatStatistik(s))))));
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
  } else if (argv[0] === '--richter' && argv[1] === 'ort') {
    const i = argv.indexOf('--saaten'), saaten = SAATEN.slice(0, i > 0 ? Number(argv[i + 1]) : 30), U = urteilOrt(saaten);
    drucken('Richter ort · ' + saaten.length + ' Saaten · Kern ' + P.VERSION, U); if (U.some(u => u.urteil !== 'GRÜN')) process.exit(1);
  } else if (argv[0] === '--richter') {
    const i = argv.indexOf('--saaten'); const saaten = SAATEN.slice(0, i > 0 ? Number(argv[i + 1]) : 30);
    const nw = Math.max(1, Math.min(saaten.length, os.cpus().length - 4));
    const teile = Array.from({ length: nw }, (_, w) => saaten.filter((_, j) => j % nw === w));
    const a = ns();
    const modus = ['bau2', 'bau3', 'gesicht', 'gegner2'].includes(argv[1]) ? argv[1] : 'bau1';
    Promise.all(teile.map(t => new Promise((res, rej) => { const w = new Worker(__filename, { workerData: { saaten: t, modus } }); w.on('message', res); w.on('error', rej); }))).then(rs => {
      const R = rs.flat().sort((x, y) => (x.samen < y.samen ? -1 : 1));
      if (argv.includes('--roh')) for (const r of R) console.log(JSON.stringify(r));
      const sek = ((ns() - a) / 1e9).toFixed(0);
      if (modus === 'bau3') { const extra = { rueckkehr: rueckkehr(), sprung: sprung(), ortKosten: ortKosten(), leser: leserImSpiel() }; drucken('Richter bau3 · ' + R.length + ' Saaten · ' + sek + ' s (Saaten) + ' + ((ns() - a) / 1e9 - sek).toFixed(0) + ' s (Haupt)', urteilBau3(R, extra)); return; }
      drucken('Richter ' + modus + ' · ' + R.length + ' Saaten · ' + sek + ' s', modus === 'bau2' ? urteilBau2(R) : (modus === 'gesicht' ? urteilGesicht(R) : (modus === 'gegner2' ? urteilGegner2(R) : urteilBau1(R))));
    });
  } else if (argv[0] === '--kosten') { if (argv[1] === 'bau2') drucken('Kosten bau2', kostenBau2(argv[2])); else if (argv[1] === 'g1') drucken('Kosten G1 (ABAB gegen ' + argv[2] + ')', kostenG1(argv[2])); else if (argv[1] === 'g2') drucken('Kosten G2 (ABAB gegen ' + argv[2] + ')', kostenG2(argv[2])); else if (argv[1] === 'g3') drucken('Kosten G3 (ABAB gegen ' + argv[2] + ')', kostenG3(argv[2])); else if (argv[1] === 'ref0') { referenzWarm(); const f = []; for (let i = 0; i < 20; i++) f.push(referenzFahrt()); console.log('REF0 ' + Math.min(...f).toFixed(2) + ' ms (min von 20; Median ' + median(f).toFixed(2) + ')'); } else drucken('Kosten', kosten()); }
  else if (argv[0] === '--zeitkarten') { // <samen> <breitePx> <ordner>: relief + biom an den fünf Zeiten und am versammelten Bild nächst 0
    const [samen, breite, ordner] = argv.slice(1); const plan = planVon(samen); const tv = bildNaechst(plan, 1, 0);
    for (const t of [...ZEITEN, tv]) { const S = P.planetScheibe(plan, t); for (const schicht of ['relief', 'biom']) {
      const name = (t === tv ? 'versammelt' : 'zeit') + (t >= 0 ? '+' : '') + Math.round(t) + '-' + schicht + '.png', rgb = P.planetKarte(S, Number(breite), schicht), buf = png(rgb, Number(breite), Number(breite) >> 1);
      fs.mkdirSync(ordner, { recursive: true }); fs.writeFileSync(path.join(ordner, samen + '-' + name), buf);
      console.log(JSON.stringify({ samen, t, schicht, sha256: sha(buf).slice(0, 16), land: +S.landAnteil.toFixed(4), meerKm: +S.meerKm.toFixed(3), eisKm: +S.eisKm.toFixed(4), nachklang: S.nk ? +S.nk.w.toFixed(3) : 0 })); } } }
  else if (argv[0] === '--bildpaar') console.log(JSON.stringify(bildpaar(argv[1], argv[2], Number(argv[3]), argv[4], Number(argv[5]), argv[6])));
  else if (argv[0] === '--kontaktbogen') kontaktbogen(argv[1], argv[2]);
  else if (argv[0] === '--orte') orteDrucken(argv[1]);
  else if (argv[0] === '--bytes') drucken('Bytes', bytes());
  else if (argv[0] === '--anker') { const selbst = argv.includes('--selftest') || argv.includes('--selbsttest'), a = ns(), U = ankerWand(selbst); drucken('Anker' + (selbst ? ' Selbsttest' : '') + ' · Kern ' + P.VERSION + ' · ' + ((ns() - a) / 1e9).toFixed(1) + ' s', U); if (U.some(u => u.urteil !== 'GRÜN')) process.exit(1); }
  else if (argv[0] === '--selftest' || argv[0] === '--selbsttest') { const U = selbsttest(); drucken('Selbsttest', U); if (U.some(u => u.urteil !== 'GRÜN')) process.exit(1); }
  else if (argv.length === 0) { const a = ns(), U = welle1(P, fs.readFileSync(KERN, 'utf8')); drucken('Richter welle1 · Kern ' + P.VERSION + ' · ' + ((ns() - a) / 1e9).toFixed(0) + ' s', U); if (U.some(u => u.urteil !== 'GRÜN')) process.exit(1); }
  else { console.log('diag-planet: (ohne Argument: Richter welle1) | --karte | --karten | --bildsaaten [--schichten a,b] | --richter bau1|bau2|bau3|gesicht|gegner2|ort | --kosten [bau2 <alt-kern.js>] | --bytes | --anker [--selftest] | --selftest (= --selbsttest)'); process.exit(2); }
}
module.exports = { materialPunkte, materialTerme, stetigTaeter, taeterVon, png, crc32, sha, planVon, saatStatistik, urteilBau1, saatKlima, urteilBau2, saatGesicht, urteilGesicht, messerStufe, gesichtGitter, innenMasse, kuestenAbstand, klimaGitter, klimaKanteFlach, gestaltMasse, P };
