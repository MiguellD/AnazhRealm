// node kante.cjs <G.png> <F.png> x0,y0,x1,y1,dx,dy:name … — sucht im Fenster die stärkste Kante von G entlang (dx,dy) und misst dort G und F:
// Sprung (±1…4 px) und Hof je Seite (Mittel ±1…4 gegen ±5…8).
const fs = require("fs"), path = require("path");
const U = require(path.resolve("scripts/lib/abnahme-urteil.cjs"));
const lade = (f) => { const b = U.pngLesen(fs.readFileSync(f)); const ch = b.u8.length / (b.W * b.H); return (x, y) => { x = Math.max(0, Math.min(b.W - 1, x)); y = Math.max(0, Math.min(b.H - 1, y)); const i = (y * b.W + x) * ch; return 0.2126 * b.u8[i] + 0.7152 * b.u8[i + 1] + 0.0722 * b.u8[i + 2]; }; };
const G = lade(process.argv[2]), F = lade(process.argv[3]);
const m = (a) => a.reduce((s, v) => s + v, 0) / a.length;
const mess = (B, x, y, dx, dy) => { const p = []; for (let t = -8; t <= 8; t++) { const z = []; for (let q = -2; q <= 2; q++) z.push(B(x + t * dx - q * dy, y + t * dy + q * dx)); p.push(m(z)); } return { sprung: +(m(p.slice(9, 13)) - m(p.slice(4, 8))).toFixed(1), hofDavor: +(m(p.slice(4, 8)) - m(p.slice(0, 4))).toFixed(1), hofDanach: +(m(p.slice(9, 13)) - m(p.slice(13, 17))).toFixed(1), profil: p.map((v) => Math.round(v)).join(" ") }; };
for (const a of process.argv.slice(4)) { const [r, n] = a.split(":"); const [x0, y0, x1, y1, dx, dy] = r.split(",").map(Number); let best = null;
  for (let y = y0; y < y1; y += 2) for (let x = x0; x < x1; x += 2) { const s = Math.abs(mess(G, x, y, dx, dy).sprung); if (!best || s > best.s) best = { s, x, y }; }
  console.log(n, "bei", best.x, best.y, "\n  G", JSON.stringify(mess(G, best.x, best.y, dx, dy)), "\n  F", JSON.stringify(mess(F, best.x, best.y, dx, dy))); }
