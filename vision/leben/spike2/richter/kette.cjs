// RICHTER-PROBE landbauplan: ist das smin der Haut (foundry-core.js:8700–8707) dichte-abhängig? Ruft den ECHTEN __tierFeld
// und __feldWert des Repos (nur gelesen, kein Zweit-Modell): eine gerade Kette gleicher Kugeln, Länge L, n Glieder,
// gemessen wird der Radius der Null-Fläche quer zur Kette (Mittel über die Kette, ohne die Enden).
// Gewählt: H = 1, vox = TIER_HAUT.voxNah·H, blend = TIER_HAUT.blend·H, L = 0,30 H, r = 0,05 H (Hals-artig).
"use strict";
const path = require("path");
const REPO = process.argv[2] || "C:/Users/micha/AnazhRealm-profiband";
const { fadenScope, OFEN_KERNE } = require(path.join(REPO, "scripts/lib/welt-boot.cjs"));
const sb = fadenScope(OFEN_KERNE);
const TH = sb.TIER_HAUT || sb.eval("TIER_HAUT");
const vox = TH.voxNah, bl = TH.blend, L = 0.30;
function kette(n, r) {
  const P = [];
  for (let i = 0; i < n; i++) {
    const x = n === 1 ? 0 : -L / 2 + (L * i) / (n - 1);
    const Mi = new Float64Array([1,0,0,0, 0,1,0,0, 0,0,1,0, -x,0,0,1]);
    P.push({ node: { userData: {} }, r, Mi, c: [x, 0, 0], ext: r + bl + 2 * vox, auf: 0 });
  }
  return P;
}
function radius(F, x) { // Null-Durchgang entlang +y bei (x, ·, 0), Halbierung
  let a = 0, b = 0.3; if (sb.__feldWert(F, vox, x, a, 0) >= 0) return 0;
  for (let k = 0; k < 40; k++) { const m = (a + b) / 2; if (sb.__feldWert(F, vox, x, m, 0) < 0) a = m; else b = m; } return (a + b) / 2;
}
for (const r of [0.05, 0.035]) {
  console.log(`r = ${r} H (vox ${vox}, blend ${bl}, L ${L}):`);
  for (const n of [4, 6, 8, 10, 12, 16]) {
    const F = sb.__tierFeld(kette(n, r), vox, bl);
    const xs = []; for (let q = 0; q <= 40; q++) xs.push(-0.3 * L + (0.6 * L * q) / 40); // mittlere 60 % der Kette
    const rr = xs.map((x) => radius(F, x)); const m = rr.reduce((s, v) => s + v, 0) / rr.length;
    const d = L / (n - 1);
    console.log(`  n ${String(n).padStart(2)}  Abstand/Radius ${(d / r).toFixed(2)}  Röhre mittel ${(m / r).toFixed(3)}·r  min ${(Math.min(...rr) / r).toFixed(3)}  max ${(Math.max(...rr) / r).toFixed(3)}   (Kugel-Vereinigung ohne smin: Tal ${(Math.sqrt(Math.max(0, r * r - d * d / 4)) / r).toFixed(3)}·r)`);
  }
}
