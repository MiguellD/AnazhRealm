// lib.cjs — gemeinsame Werkzeuge der Spikes (nur lesen, nie im Kern). Laedt einen Kern (Original oder gepatchte Kopie),
// baut Plaene wie der Richter (erde-* mit Erd-Schluessel), schreibt PNG, misst Gestalt-Masse auf der Kugel.
'use strict';
const path = require('path'), fs = require('fs'), zlib = require('zlib');
const ORIGINAL = path.resolve(__dirname, '../../../../../../.claude/worktrees/w28-planet-kern/planet-core.js');
function kern(name) {
  const p = !name || name === 'heute' ? ORIGINAL : path.join(__dirname, 'kern-' + name + '.js');
  delete require.cache[p]; delete globalThis.__planetCore;
  return require(p);
}
function planVon(P, samen) { return P.planetPlan(samen, /^erde-/.test(samen) ? Object.assign({}, P.PLANET_ERDE) : undefined); }
const CRC = (() => { const t = new Uint32Array(256); for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; } return t; })();
function crc32(b) { let c = 0xffffffff; for (let i = 0; i < b.length; i++) c = CRC[(c ^ b[i]) & 0xff] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; }
function chunk(t, d) { const l = Buffer.alloc(4); l.writeUInt32BE(d.length); const td = Buffer.concat([Buffer.from(t, 'ascii'), d]); const c = Buffer.alloc(4); c.writeUInt32BE(crc32(td)); return Buffer.concat([l, td, c]); }
function png(rgb, w, h) {
  const ih = Buffer.alloc(13); ih.writeUInt32BE(w, 0); ih.writeUInt32BE(h, 4); ih[8] = 8; ih[9] = 2;
  const roh = Buffer.alloc((w * 3 + 1) * h);
  for (let y = 0; y < h; y++) Buffer.from(rgb.buffer, rgb.byteOffset + y * w * 3, w * 3).copy(roh, y * (w * 3 + 1) + 1);
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', ih), chunk('IDAT', zlib.deflateSync(roh, { level: 6 })), chunk('IEND', Buffer.alloc(0))]);
}
function median(a) { const b = [...a].filter(Number.isFinite).sort((x, y) => x - y); const n = b.length; return n ? (n % 2 ? b[(n - 1) / 2] : 0.5 * (b[n / 2 - 1] + b[n / 2])) : NaN; }

// Gitter W x H (equirektangulaer), je Pixel Hoehe km und Punkt-Felder
function gitter(P, S, W, fuss) {
  const H = W >> 1, h = new Float32Array(W * H), akt = new Uint8Array(W * H), oro = new Float32Array(W * H), o = {};
  for (let r = 0; r < H; r++) {
    const phi = Math.PI / 2 - Math.PI * (r + 0.5) / H, cp = Math.cos(phi), sp = Math.sin(phi);
    for (let i = 0; i < W; i++) {
      const lam = -Math.PI + 2 * Math.PI * (i + 0.5) / W;
      h[r * W + i] = P.planetPunktR(S, cp * Math.cos(lam), sp, cp * Math.sin(lam), fuss || 40, o) / 1000;
      akt[r * W + i] = o.orogenAktiv; oro[r * W + i] = o.orogenStaerke;
    }
  }
  return { W, H, h, akt, oro, R: S.R };
}
// Flaeche je Pixel (km^2) je Zeile
function pixKm2(G) { const a = new Float64Array(G.H); for (let r = 0; r < G.H; r++) { const phi = Math.PI / 2 - Math.PI * (r + 0.5) / G.H; a[r] = (2 * Math.PI * G.R / G.W) * (Math.PI * G.R / G.H) * Math.cos(phi); } return a; }
function komponenten(m, W, H) {
  const lab = new Int32Array(W * H).fill(-1), K = [], st = [];
  for (let s = 0; s < W * H; s++) {
    if (!m[s] || lab[s] >= 0) continue;
    const id = K.length, pix = []; lab[s] = id; st.push(s);
    while (st.length) { const p = st.pop(); pix.push(p); const r = (p / W) | 0, i = p - r * W;
      for (let dr = -1; dr <= 1; dr++) for (let di = -1; di <= 1; di++) { const rr = r + dr; if (rr < 0 || rr >= H) continue; const q = rr * W + (i + di + W) % W; if (m[q] && lab[q] < 0) { lab[q] = id; st.push(q); } } }
    K.push(pix);
  }
  return { lab, K };
}
// Abstand zur Kueste (km) ueber 8-Nachbarn auf der Kugel (Dijkstra-Naeherung mit Eimer-Schritten)
function kuestenAbstand(m, G) {
  const { W, H, R } = G, d = new Float64Array(W * H).fill(Infinity), dy = Math.PI * R / H;
  const dx = new Float64Array(H); for (let r = 0; r < H; r++) dx[r] = 2 * Math.PI * R / W * Math.cos(Math.PI / 2 - Math.PI * (r + 0.5) / H);
  // Quellen: Land-Pixel mit Meer-Nachbar
  let front = [];
  for (let r = 0; r < H; r++) for (let i = 0; i < W; i++) { const p = r * W + i; if (!m[p]) continue;
    const nb = [r * W + (i + 1) % W, r * W + (i + W - 1) % W, r > 0 ? p - W : -1, r < H - 1 ? p + W : -1];
    if (nb.some(q => q >= 0 && !m[q])) { d[p] = 0; front.push(p); } }
  // mehrfache Relaxation (Chamfer), genuegt fuer Anteile
  for (let pass = 0; pass < 4; pass++) {
    for (let r = 0; r < H; r++) for (let i = 0; i < W; i++) { const p = r * W + i; if (!m[p]) continue;
      for (const [dr, di] of [[-1, -1], [-1, 0], [-1, 1], [0, -1]]) { const rr = r + dr; if (rr < 0) continue; const q = rr * W + (i + di + W) % W; if (!m[q]) continue; const c = Math.hypot(di * dx[r], dr * dy); if (d[q] + c < d[p]) d[p] = d[q] + c; } }
    for (let r = H - 1; r >= 0; r--) for (let i = W - 1; i >= 0; i--) { const p = r * W + i; if (!m[p]) continue;
      for (const [dr, di] of [[1, 1], [1, 0], [1, -1], [0, 1]]) { const rr = r + dr; if (rr >= H) continue; const q = rr * W + (i + di + W) % W; if (!m[q]) continue; const c = Math.hypot(di * dx[r], dr * dy); if (d[q] + c < d[p]) d[p] = d[q] + c; } }
  }
  return d;
}
// Abstand (km) jedes Pixels in 'erlaubt' zur Quell-Menge 'quelle' (Chamfer, 4 Durchgaenge)
function abstandZu(quelle, erlaubt, G) {
  const { W, H, R } = G, d = new Float64Array(W * H).fill(Infinity), dy = Math.PI * R / H;
  const dx = new Float64Array(H); for (let r = 0; r < H; r++) dx[r] = 2 * Math.PI * R / W * Math.cos(Math.PI / 2 - Math.PI * (r + 0.5) / H);
  for (let p = 0; p < W * H; p++) if (quelle[p]) d[p] = 0;
  for (let pass = 0; pass < 4; pass++) {
    for (let r = 0; r < H; r++) for (let i = 0; i < W; i++) { const p = r * W + i; if (!erlaubt[p]) continue;
      for (const [dr, di] of [[-1, -1], [-1, 0], [-1, 1], [0, -1]]) { const rr = r + dr; if (rr < 0) continue; const q = rr * W + (i + di + W) % W; const c = Math.hypot(di * dx[r], dr * dy); if (d[q] + c < d[p]) d[p] = d[q] + c; } }
    for (let r = H - 1; r >= 0; r--) for (let i = W - 1; i >= 0; i--) { const p = r * W + i; if (!erlaubt[p]) continue;
      for (const [dr, di] of [[1, 1], [1, 0], [1, -1], [0, 1]]) { const rr = r + dr; if (rr >= H) continue; const q = rr * W + (i + di + W) % W; const c = Math.hypot(di * dx[r], dr * dy); if (d[q] + c < d[p]) d[p] = d[q] + c; } }
  }
  return d;
}
// Formzahl (Solidity) einer Komponente: Flaeche / Flaeche der konvexen Huelle in der gnomonischen Projektion um ihre Mitte
function solidity(pix, G, gew) {
  const { W, H } = G; let cx = 0, cy = 0, cz = 0; const v = [];
  for (const p of pix) { const r = (p / W) | 0, i = p - r * W, phi = Math.PI / 2 - Math.PI * (r + 0.5) / H, lam = -Math.PI + 2 * Math.PI * (i + 0.5) / W; const x = Math.cos(phi) * Math.cos(lam), y = Math.sin(phi), z = Math.cos(phi) * Math.sin(lam); v.push([x, y, z, gew[r]]); cx += x; cy += y; cz += z; }
  const l = Math.hypot(cx, cy, cz); cx /= l; cy /= l; cz /= l;
  let ux = -cz, uy = 0, uz = cx; let ul = Math.hypot(ux, uy, uz); if (ul < 1e-9) { ux = 1; uy = 0; uz = 0; ul = 1; } ux /= ul; uy /= ul; uz /= ul;
  const vx = cy * uz - cz * uy, vy = cz * ux - cx * uz, vz = cx * uy - cy * ux;
  const pts = []; let A = 0;
  for (const [x, y, z, g] of v) { const d = x * cx + y * cy + z * cz; if (d < 0.2) return NaN; pts.push([(x * ux + y * uy + z * uz) / d, (x * vx + y * vy + z * vz) / d]); A += g / (d * d * d); }
  pts.sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const cr = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const lo = [], hi = [];
  for (const p of pts) { while (lo.length >= 2 && cr(lo[lo.length - 2], lo[lo.length - 1], p) <= 0) lo.pop(); lo.push(p); }
  for (let k = pts.length - 1; k >= 0; k--) { const p = pts[k]; while (hi.length >= 2 && cr(hi[hi.length - 2], hi[hi.length - 1], p) <= 0) hi.pop(); hi.push(p); }
  const hull = lo.slice(0, -1).concat(hi.slice(0, -1)); let ah = 0;
  for (let k = 0; k < hull.length; k++) { const a = hull[k], b = hull[(k + 1) % hull.length]; ah += a[0] * b[1] - a[1] * b[0]; }
  ah = Math.abs(ah) / 2 * G.R * G.R; // Flaeche in der Tangentialebene (km^2), A ebenso gewichtet (1/d^3)
  // Pixel-Flaeche in der Ebene: gew/d^3; plus halbe Pixel-Kante am Rand vernachlaessigt
  return Math.min(1, A / ah);
}
// Gestalt-Masse einer Landmaske
function gestalt(G, maske) {
  const { W, H } = G, gew = pixKm2(G);
  const C = komponenten(maske, W, H);
  const fl = C.K.map(pix => pix.reduce((s, p) => s + gew[(p / W) | 0], 0));
  const land = fl.reduce((a, b) => a + b, 0);
  const idx = fl.map((a, i) => i).sort((a, b) => fl[b] - fl[a]);
  // Korcak: N(>A) ueber 2e4 .. 2e7 km^2, Steigung in log-log
  const xs = [], ys = [];
  for (const a of [2e4, 5e4, 1e5, 2e5, 5e5, 1e6, 2e6, 5e6, 1e7, 2e7]) { const n = fl.filter(f => f > a).length; if (n > 0) { xs.push(Math.log10(a)); ys.push(Math.log10(n)); } }
  let korcak = NaN; if (xs.length >= 3) { const n = xs.length, mx = xs.reduce((a, b) => a + b) / n, my = ys.reduce((a, b) => a + b) / n; let sxy = 0, sxx = 0; for (let i = 0; i < n; i++) { sxy += (xs[i] - mx) * (ys[i] - my); sxx += (xs[i] - mx) ** 2; } korcak = -sxy / sxx; }
  const sol = []; for (const i of idx) { if (fl[i] < 1e6) break; const s = solidity(C.K[i], G, gew); if (Number.isFinite(s)) sol.push(s); }
  const ab = kuestenAbstand(maske, G); let fern = 0;
  // schmal300: Land, das eine Scheibe vom Radius 300 km nicht erreicht (morphologische Oeffnung) — Halbinseln, Isthmen, Inseln
  // schmaler als 600 km und die Zipfel. Mitten = Land mit Kuesten-Abstand >= 300 km; Abstand zu den Mitten ueber das ganze Gitter.
  const mitte = new Uint8Array(W * H); for (let p = 0; p < W * H; p++) mitte[p] = maske[p] && ab[p] >= 300 ? 1 : 0;
  const alle = new Uint8Array(W * H).fill(1);
  const dm = abstandZu(mitte, alle, G); let schmal = 0;
  for (let p = 0; p < W * H; p++) if (maske[p] && !(dm[p] <= 300)) schmal += gew[(p / W) | 0];
  for (let p = 0; p < W * H; p++) if (maske[p] && ab[p] > 1000) fern += gew[(p / W) | 0];
  // Kuesten-Entwicklung D_L = Umfang / (2 sqrt(pi A)) der grossen Komponenten (Umfang aus Kuesten-Pixel-Kanten in km)
  const dy = Math.PI * G.R / H;
  const um = new Float64Array(C.K.length);
  for (let r = 0; r < H; r++) { const dx = 2 * Math.PI * G.R / W * Math.cos(Math.PI / 2 - Math.PI * (r + 0.5) / H);
    for (let i = 0; i < W; i++) { const p = r * W + i; if (!maske[p]) continue; const id = C.lab[p];
      if (!maske[r * W + (i + 1) % W]) um[id] += dy; if (!maske[r * W + (i + W - 1) % W]) um[id] += dy;
      if (r > 0 && !maske[p - W]) um[id] += dx; if (r < H - 1 && !maske[p + W]) um[id] += dx; } }
  const dl = []; for (const i of idx) { if (fl[i] < 1e6) break; dl.push(um[i] * Math.PI / 4 / (2 * Math.sqrt(Math.PI * fl[i]))); } // pi/4: Treppen-Korrektur der Pixel-Kanten
  return {
    landAnteil: land / (4 * Math.PI * G.R * G.R), stuecke1e4: fl.filter(f => f > 1e4).length, stuecke1e5: fl.filter(f => f > 1e5).length,
    groesster: fl[idx[0]] / land, zweiter: idx.length > 1 ? fl[idx[1]] / land : 0, korcak, solidityMedian: median(sol), solidityN: sol.length,
    fern1000: fern / land, schmal300: schmal / land, kuestenEntwicklung: median(dl), ab,
  };
}
// Innen-Relief: Hoehe der Land-Pixel > 500 km von der Kueste, ohne aktives Orogen
function innen(G, maske, ab) {
  const hs = [], gew = pixKm2(G); let alt = 0, n = 0;
  for (let p = 0; p < G.W * G.H; p++) { if (!maske[p] || ab[p] < 500 || G.akt[p]) continue; hs.push(G.h[p]); n++; if (G.oro[p] > 0.1) alt++; }
  const m = hs.reduce((a, b) => a + b, 0) / Math.max(1, hs.length);
  const sd = Math.sqrt(hs.reduce((a, b) => a + (b - m) * (b - m), 0) / Math.max(1, hs.length));
  const s = [...hs].sort((a, b) => a - b);
  return { n, mittelKm: m, streuungKm: sd, p10: s[Math.floor(0.1 * s.length)], p90: s[Math.floor(0.9 * s.length)], altGuertel: n ? alt / n : NaN };
}
module.exports = { kern, planVon, png, median, gitter, gestalt, innen, komponenten, kuestenAbstand, pixKm2, ORIGINAL };
