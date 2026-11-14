// Spike: kinematische Platten auf der Kugel, Relief aus den Raendern, Klima, Biome, Weltkarte als PNG.
// node spike.cjs <samen> <breite px> -> karte-<samen>.png + Statistik. Keine Fremd-Pakete.
"use strict";
const zlib = require("zlib");
const fs = require("fs");
const samen = process.argv[2] || "erde-1";
const W = +(process.argv[3] || 1024), H = W / 2;
const T_MA = +(process.argv[4] || 0); // Zeit in Ma (negativ = Vergangenheit), nur Drift innerhalb einer Epoche
const DEG = Math.PI / 180;

// ---- Zufall aus dem Samen (zaehlerbasiert) ----
function fnv(s) { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
function mix(a, b) { let h = (a ^ Math.imul(b, 0x9e3779b9)) >>> 0; h ^= h >>> 16; h = Math.imul(h, 0x85ebca6b); h ^= h >>> 13; h = Math.imul(h, 0xc2b2ae35); h ^= h >>> 16; return h >>> 0; }
const S0 = fnv(samen);
const u01 = (pfad, k) => mix(mix(S0, pfad), k) / 4294967296;
function einheit(pfad) { const z = 2 * u01(pfad, 1) - 1, a = 2 * Math.PI * u01(pfad, 2), r = Math.sqrt(1 - z * z); return [r * Math.cos(a), r * Math.sin(a), z]; }
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const norm = (a) => { const l = Math.hypot(a[0], a[1], a[2]); return [a[0] / l, a[1] / l, a[2] / l]; };
function rot(v, e, ang) { // Rodrigues
  const c = Math.cos(ang), s = Math.sin(ang), d = dot(e, v), x = cross(e, v);
  return [v[0] * c + x[0] * s + e[0] * d * (1 - c), v[1] * c + x[1] * s + e[1] * d * (1 - c), v[2] * c + x[2] * s + e[2] * d * (1 - c)];
}

// ---- 3D-Gradientenrauschen (Wert-Rauschen glatt, aus dem Samen) ----
function h3(ix, iy, iz, k) { return mix(mix(mix(S0 ^ k, ix), iy), iz); }
function grad(ix, iy, iz, k, x, y, z) { const h = h3(ix, iy, iz, k); const g = [(h & 255) / 127.5 - 1, ((h >>> 8) & 255) / 127.5 - 1, ((h >>> 16) & 255) / 127.5 - 1]; return g[0] * x + g[1] * y + g[2] * z; }
const fade = (t) => t * t * t * (t * (t * 6 - 15) + 10);
function noise3(x, y, z, k) {
  const ix = Math.floor(x), iy = Math.floor(y), iz = Math.floor(z), fx = x - ix, fy = y - iy, fz = z - iz;
  const u = fade(fx), v = fade(fy), w = fade(fz);
  let r = 0;
  for (let c = 0; c < 8; c++) {
    const dx = c & 1, dy = (c >> 1) & 1, dz = (c >> 2) & 1;
    const wt = (dx ? u : 1 - u) * (dy ? v : 1 - v) * (dz ? w : 1 - w);
    r += wt * grad(ix + dx, iy + dy, iz + dz, k, fx - dx, fy - dy, fz - dz);
  }
  return r;
}
function fbm(p, f, okt, k) { let s = 0, a = 1, n = 0; for (let o = 0; o < okt; o++) { s += a * noise3(p[0] * f, p[1] * f, p[2] * f, k + o); n += a; a *= 0.5; f *= 2.03; } return s / n; }

// ---- VORAB (Funktion des Samens): Platten, Kratone, Hotspots ----
const R_KM = 6371;
const N = process.env.PLATTEN ? +process.env.PLATTEN : 14 + Math.floor(u01(1, 0) * 10); // Plattenzahl
const platten = [];
for (let i = 0; i < N; i++) {
  const c = einheit(100 + i);
  const pol = einheit(200 + i);
  const rate = (0.3 + 1.2 * u01(300 + i, 0)) * DEG; // Grad je Ma (1 Grad/Ma ~ 11 cm/a)
  platten.push({ c, w: 0.25 * (u01(400 + i, 0) - 0.5), om: [pol[0] * rate, pol[1] * rate, pol[2] * rate], pol, rate, alt: u01(500 + i, 0) });
}
const K = 6 + Math.floor(u01(2, 0) * 4); // Kratone: die ersten K Platten tragen je einen Kontinentkern um ihr Zentrum
const kratone = [];
for (let k = 0; k < K; k++) for (let m = 0; m < 3; m++) { const ri = (16 + 16 * u01(700 + k, 0)) * DEG; const r2 = m ? ri * (0.35 + 0.3 * u01(710 + k * 3 + m, 0)) : ri; const off = rot(platten[k].c, einheit(650 + k * 3 + m), (m ? 0.8 : 0.2) * ri); kratone.push({ c: off, r: r2, platte: k }); if (!m) platten[k].w += 0.06 + 0.12 * (ri / DEG - 16) / 16; }
const HS = 4 + Math.floor(u01(3, 0) * 6);
const hotspots = [];
for (let h = 0; h < HS; h++) hotspots.push({ q: einheit(800 + h), st: 0.6 + 0.8 * u01(900 + h, 0) });

// Platten-Zentren und Kratone zur Zeit t: starre Drehung um den eigenen Euler-Pol (eine Epoche).
function zentrum(i, t) { const P = platten[i]; return t === 0 ? P.c : rot(P.c, P.pol, P.rate * t); }
// Kraton gehoert der Platte, deren Zentrum ihm zur Zeit 0 am naechsten ist; er dreht mit ihr.

for (const P of platten) P.kont = 0;
for (const kr of kratone) platten[kr.platte].kont += kr.r * kr.r;

const tV = process.hrtime.bigint();
const ZC = platten.map((_, i) => zentrum(i, T_MA));

// ---- DIE PUNKT-ABFRAGE ----
const out = { platte: 0, h: 0, kont: 0, rand: 0, art: 0, alter: 0, rate: 0 };
function punkt(p) {
  // verwirbelter Punkt fuer gekruemmte Raender
  const wv = 0.16;
  const q = norm([p[0] + wv * noise3(p[0] * 2.1, p[1] * 2.1, p[2] * 2.1, 11), p[1] + wv * noise3(p[0] * 2.1 + 5, p[1] * 2.1, p[2] * 2.1, 12), p[2] + wv * noise3(p[0] * 2.1, p[1] * 2.1 + 9, p[2] * 2.1, 13)]);
  // gewichtete Zelle: Score = q.c + w
  let b1 = -9, i1 = 0;
  for (let i = 0; i < N; i++) { const s = dot(q, ZC[i]) + platten[i].w; if (s > b1) { b1 = s; i1 = i; } }
  const P = platten[i1], ci = ZC[i1];
  // Kruste: Kratone im Platten-Rahmen (zurueckgedreht), Rand verrauscht
  const pf = T_MA === 0 ? p : rot(p, P.pol, -P.rate * T_MA);
  let kont = -1;
  for (const kr of kratone) if (kr.platte === i1) {
    const a = Math.acos(Math.max(-1, Math.min(1, dot(pf, kr.c))));
    const v = (kr.r - a) / (7 * DEG) + 1.5 * fbm(pf, 2.2, 8, 31) + 0.6 * fbm(pf, 7, 5, 37);
    if (v > kont) kont = v;
  }
  const kontinental = kont > 0;
  // Raender: je Nachbar Abstand zur Bisektor-Ebene, Relativ-Bewegung
  let relief = 0, minRand = 9, randArt = 0, ozAlter = 999, randRate = 0;
  const vi = cross(P.om, p);
  for (let j = 0; j < N; j++) {
    if (j === i1) continue;
    const cj = ZC[j];
    const dvec = [ci[0] - cj[0], ci[1] - cj[1], ci[2] - cj[2]];
    const L = Math.hypot(dvec[0], dvec[1], dvec[2]);
    const d = Math.asin(Math.max(-1, Math.min(1, (dot(q, dvec) + (P.w - platten[j].w)) / L))); // Winkel zum Rand
    if (d > 0.5) continue; // > ~28 Grad: kein Einfluss
    const Pj = platten[j];
    const vj = cross(Pj.om, p);
    let n = [cj[0] - dot(cj, p) * p[0], cj[1] - dot(cj, p) * p[1], cj[2] - dot(cj, p) * p[2]];
    n = norm(n); // Richtung zum Nachbarn
    const vr = [vi[0] - vj[0], vi[1] - vj[1], vi[2] - vj[2]];
    const konv = dot(vr, n) / DEG; // Grad/Ma, >0 = konvergent
    const vt = Math.hypot(vr[0], vr[1], vr[2]) / DEG;
    const scher = Math.sqrt(Math.max(0, vt * vt - konv * konv));
    if (d < minRand) { minRand = d; randArt = konv > 0.35 * scher ? 1 : konv < -0.35 * scher ? -1 : 0; randRate = konv; }
    const dg = d / DEG; // Grad
    if (konv < 0) { // divergent: Meeresboden-Alter aus Abstand / halber Spreizrate
      const age = dg / Math.max(0.05, -konv / 2);
      if (age < ozAlter) ozAlter = age;
      if (kontinental) relief += -1.2 * Math.exp(-dg / 1.2) * Math.min(1, -konv); // Rift
    } else if (konv > 0) {
      const s = Math.min(1.6, konv);
      // Kruste des Nachbarn am Rand (vereinfacht: Nachbar hat Kratone?)
      const jKont = Pj.kont > 0.02 && kontNahe(j, p);
      if (kontinental && jKont) relief += 5.5 * s * Math.exp(-((dg - 1.5) ** 2) / (2 * 3.5 * 3.5)); // Kollision: breites Orogen
      else if (kontinental && !jKont) relief += 4.2 * s * Math.exp(-((dg - 2.5) ** 2) / (2 * 1.3 * 1.3)); // Anden: Bogen
      else if (!kontinental && jKont) relief += -6.5 * s * Math.exp(-((dg - 0.4) ** 2) / (2 * 0.5 * 0.5)); // Graben vor dem Kontinent
      else { // ozean-ozean: die aeltere Platte taucht ab
        if (P.alt > Pj.alt) relief += -6 * s * Math.exp(-((dg - 0.4) ** 2) / 0.5);
        else relief += 3.2 * s * Math.exp(-((dg - 2.0) ** 2) / (2 * 0.8 * 0.8)) * (0.5 + 0.5 * fbm(p, 9, 3, 41)); // Inselbogen
      }
    } else relief += -0.6 * Math.exp(-dg / 0.4) * (scher > 0.3 ? 1 : 0);
  }
  let h;
  if (kontinental) {
    const schelf = Math.min(1, kont / 0.35);
    const alt = 1 - Math.abs(fbm(pf, 4, 6, 71)); h = -0.15 + 0.6 * schelf + relief + 0.5 * fbm(p, 6, 6, 51) * (0.4 + Math.max(0, relief) / 3) + 1.6 * schelf * Math.max(0, alt - 0.72) / 0.28 * (0.5 + 0.5 * fbm(pf, 1.5, 3, 73));
  } else {
    const age = Math.min(ozAlter > 500 ? 70 : ozAlter, 120);
    h = -2.5 - 0.3 * Math.sqrt(age) + Math.min(0, relief) + Math.max(0, relief) * 0.9 + 0.25 * fbm(p, 12, 4, 61);
    if (kont > -0.35) h = h * (1 - (kont + 0.35) / 0.35) + (-0.15) * ((kont + 0.35) / 0.35); // Kontinentalhang
  }
  // Hotspots: Spur = Kleinkreis um den Euler-Pol der Platte, alter mit Abstand
  for (const hs of hotspots) {
    const e = P.pol;
    const cq = Math.acos(dot(hs.q, e)), cp = Math.acos(Math.max(-1, Math.min(1, dot(p, e))));
    const dc = Math.abs(cp - cq);
    if (dc > 1.2 * DEG) continue;
    // Azimut von p relativ zu q um e
    const a1 = norm(cross(e, hs.q)), b1v = cross(e, a1);
    const qp = [hs.q[0] - dot(hs.q, e) * e[0], hs.q[1] - dot(hs.q, e) * e[1], hs.q[2] - dot(hs.q, e) * e[2]];
    const pp = [p[0] - dot(p, e) * e[0], p[1] - dot(p, e) * e[1], p[2] - dot(p, e) * e[2]];
    const phi = Math.atan2(dot(pp, a1), dot(pp, norm(qp))); // Drehwinkel
    const tau = phi / P.rate; // Ma
    if (tau < -1 || tau > 70) continue;
    const ab = Math.exp(-((dc / DEG) ** 2) / 0.12) * hs.st;
    const kette = 0.5 + 0.5 * Math.cos((tau / 3.5) * 2 * Math.PI); // Seamounts im Takt
    h += ab * kette * Math.max(0, 6.5 - 0.09 * tau) * Math.exp(-Math.max(0, tau) / 40);
  }
  out.platte = i1; out.h = h; out.kont = kont; out.rand = minRand; out.art = randArt; out.alter = ozAlter; out.rate = randRate;
  return h;
}
function kontNahe(j, p) { // hat Platte j einen Kraton in der Naehe von p?
  const P = platten[j];
  const pf = T_MA === 0 ? p : rot(p, P.pol, -P.rate * T_MA);
  for (const kr of kratone) if (kr.platte === j && Math.acos(Math.max(-1, Math.min(1, dot(pf, kr.c)))) < kr.r + 8 * DEG) return true;
  return false;
}

if (process.env.BENCH) {
  const M = 200000, pts = []; for (let i = 0; i < M; i++) pts.push(einheit(5e6 + i));
  let best = 1e9; for (let r = 0; r < 5; r++) { const a = process.hrtime.bigint(); let acc = 0; for (const p of pts) acc += punkt(p); const ns = Number(process.hrtime.bigint() - a) / M; if (ns < best) best = ns; }
  const v0 = process.hrtime.bigint(); for (let r = 0; r < 100; r++) { /* Vorab nachbauen */ const pl = []; for (let i = 0; i < N; i++) { const c = einheit(100 + i), pol = einheit(200 + i); pl.push({ c, pol }); } }
  console.log(JSON.stringify({ platten: N, usJePunktBest: +(best / 1000).toFixed(2), vorabUsJeSamen: +(Number(process.hrtime.bigint() - v0) / 100 / 1000).toFixed(1) })); process.exit(0);
}
// ---- Bild ----
const t0 = process.hrtime.bigint();
const hoehe = new Float32Array(W * H), art = new Int8Array(W * H), rand = new Float32Array(W * H);
for (let y = 0; y < H; y++) {
  const lat = (0.5 - (y + 0.5) / H) * Math.PI;
  for (let x = 0; x < W; x++) {
    const lon = ((x + 0.5) / W) * 2 * Math.PI - Math.PI;
    const p = [Math.cos(lat) * Math.cos(lon), Math.cos(lat) * Math.sin(lon), Math.sin(lat)];
    hoehe[y * W + x] = punkt(p); art[y * W + x] = out.art; rand[y * W + x] = out.rand;
  }
}
const t1 = process.hrtime.bigint();
const nsPunkt = Number(t1 - t0) / (W * H);
// Meeresspiegel: so, dass das Wasser-Volumen (Samen) passt -- hier: Land-Anteil-Ziel aus dem Samen nur zur Kontrolle 0
const ML = 0;
// Klima je Pixel: Breite, Hoehe, Luv/Lee entlang der Zonal-Winde (6 Proben stromauf), Saison weggelassen (Jahresmittel)
function klima(lat, lon, h) {
  const al = Math.abs(lat) / DEG;
  const T = 29 - 44 * Math.sin(lat) ** 2 - 6.5 * Math.max(0, h); // Jahresmittel C
  // Windrichtung (Zonal): Passat (Ost) 0-30, Westwind 30-60, polar Ost
  const dir = al < 30 ? -1 : al < 60 ? 1 : -1;
  let meer = 0, hang = 0, hmax = 0;
  for (let k = 1; k <= 6; k++) {
    const dl = -dir * k * 4 * DEG / Math.max(0.2, Math.cos(lat)); // stromauf
    const lo = lon + dl;
    const pp = [Math.cos(lat) * Math.cos(lo), Math.cos(lat) * Math.sin(lo), Math.sin(lat)];
    const hh = punkt(pp);
    if (hh < ML) meer += 1 / k; else hmax = Math.max(hmax, hh);
  }
  meer /= 2.45;
  const band = 0.35 + 1.6 * Math.exp(-((al / 9) ** 2)) - 0.55 * Math.exp(-(((al - 26) / 8) ** 2)) + 0.6 * Math.exp(-(((al - 52) / 10) ** 2)) - 0.3 * (al > 70);
  const lee = Math.exp(-Math.max(0, hmax - Math.max(0, h) - 0.6) / 1.2);
  const Pmm = Math.max(0, 1600 * band * (0.25 + 0.75 * meer) * lee);
  return { T, P: Pmm };
}
function biom(T, P) {
  if (T < -10) return [240, 244, 248]; // Eis
  if (T < -2) return [150, 160, 140]; // Tundra
  if (T < 5) return P > 300 ? [52, 92, 62] : [140, 140, 110]; // Taiga / kalte Steppe
  if (T < 18) return P > 700 ? [58, 118, 58] : P > 300 ? [150, 160, 90] : [200, 185, 130]; // Wald / Steppe / Wueste
  return P > 1500 ? [28, 100, 40] : P > 600 ? [140, 160, 70] : P > 250 ? [195, 175, 105] : [225, 200, 145]; // Regenwald/Savanne/Busch/Wueste
}
const t2 = process.hrtime.bigint();
const px = Buffer.alloc((W * 3 + 1) * H);
let land = 0, hist = new Array(26).fill(0), gipfel = 0, gipfelKonv = 0;
for (let y = 0; y < H; y++) {
  const lat = (0.5 - (y + 0.5) / H) * Math.PI, wgt = Math.cos(lat);
  px[y * (W * 3 + 1)] = 0;
  for (let x = 0; x < W; x++) {
    const i = y * W + x, h = hoehe[i];
    const lon = ((x + 0.5) / W) * 2 * Math.PI - Math.PI;
    let c;
    const hx = hoehe[y * W + ((x + 1) % W)] - h, hy = hoehe[Math.min(H - 1, y + 1) * W + x] - h;
    const shade = Math.max(0.55, Math.min(1.3, 1 + 3.0 * (-hx + hy)));
    if (h < ML) { const d = Math.min(1, -h / 7); c = [Math.round(20 + 50 * (1 - d)), Math.round(50 + 90 * (1 - d)), Math.round(110 + 100 * (1 - d))]; if (h > -0.4) c = [70, 150, 190]; }
    else {
      const k = klima(lat, lon, h); c = biom(k.T, k.P);
      if (h > 3.0 && k.T > -10) c = [140, 125, 115];
      c = c.map((v) => Math.max(0, Math.min(255, Math.round(v * shade))));
      land += wgt;
      if (h > 2.5) { gipfel += wgt; if (art[i] === 1 && rand[i] < 7 * DEG) gipfelKonv += wgt; }
    }
    const o = y * (W * 3 + 1) + 1 + x * 3; px[o] = c[0]; px[o + 1] = c[1]; px[o + 2] = c[2];
    hist[Math.max(0, Math.min(25, Math.floor(h * 2 + 16)))] += wgt;
  }
}
const t3 = process.hrtime.bigint();
let gesamt = 0; for (let y = 0; y < H; y++) gesamt += Math.cos((0.5 - (y + 0.5) / H) * Math.PI) * W;
// PNG
function crc32(buf) { let c, crc = 0xffffffff; for (let n = 0; n < buf.length; n++) { c = (crc ^ buf[n]) & 0xff; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; crc = (crc >>> 8) ^ c; } return (crc ^ 0xffffffff) >>> 0; }
function chunk(t, d) { const l = Buffer.alloc(4); l.writeUInt32BE(d.length); const td = Buffer.concat([Buffer.from(t), d]); const c = Buffer.alloc(4); c.writeUInt32BE(crc32(td)); return Buffer.concat([l, td, c]); }
const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(W, 0); ihdr.writeUInt32BE(H, 4); ihdr[8] = 8; ihdr[9] = 2;
const png = Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk("IHDR", ihdr), chunk("IDAT", zlib.deflateSync(px, { level: 6 })), chunk("IEND", Buffer.alloc(0))]);
const datei = `karte-${samen}${T_MA ? "-t" + T_MA : ""}.png`;
fs.writeFileSync(datei, png);
console.log(JSON.stringify({
  samen, platten: N, kratone: K, hotspots: HS, px: W * H,
  usJePunktRelief: +(nsPunkt / 1000).toFixed(2),
  usJePunktKlimaInkl6Proben: +(Number(t3 - t2) / (W * H) / 1000).toFixed(2),
  landAnteil: +(land / gesamt).toFixed(3),
  gipfelUeber2500mAnKonvergenzRand: +(gipfelKonv / Math.max(1e-9, gipfel)).toFixed(3),
  hypsometrie_km_halbschritt: hist.map((v, i) => [((i - 16) / 2), +(100 * v / gesamt).toFixed(1)]).filter((x) => x[1] > 0.2),
  datei,
}));
