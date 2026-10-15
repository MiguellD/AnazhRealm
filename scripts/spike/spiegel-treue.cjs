// SPIKE gesetz-strahl — die Spiegel-Treue r eines Bilds (die Rechnung aus dem Durchbruch-Plan D7, mess-spiegel): Pearson r der
// Luma (8×8-Blockmittel) zwischen Wasser-Pixel (x, y) und seinem Partner (x, 2·h0 − y) über der Uferlinie h0.
//   node scripts/spike/spiegel-treue.cjs <bild.png> <h0> <x0> <x1> <y0> <y1>
"use strict";
const fs = require("fs");
const AU = require("../lib/abnahme-urteil.cjs");
const [datei, h0, x0, x1, y0, y1] = process.argv.slice(2);
const { W, u8 } = AU.pngLesen(fs.readFileSync(datei));
const L = (x, y) => 0.2126 * u8[(y * W + x) * 4] + 0.7152 * u8[(y * W + x) * 4 + 1] + 0.0722 * u8[(y * W + x) * 4 + 2];
const B = 8;
const a = [],
    b = [];
for (let y = +y0; y + B <= +y1; y += B)
    for (let x = +x0; x + B <= +x1; x += B) {
        let s = 0,
            t = 0,
            ok = true;
        for (let j = 0; j < B && ok; j++)
            for (let i = 0; i < B; i++) {
                const yy = 2 * h0 - (y + j);
                if (yy < 0) {
                    ok = false;
                    break;
                }
                s += L(x + i, y + j);
                t += L(x + i, yy);
            }
        if (!ok) continue;
        a.push(s / 64);
        b.push(t / 64);
    }
const n = a.length;
const ma = a.reduce((p, q) => p + q) / n;
const mb = b.reduce((p, q) => p + q) / n;
let sab = 0,
    saa = 0,
    sbb = 0;
for (let i = 0; i < n; i++) {
    sab += (a[i] - ma) * (b[i] - mb);
    saa += (a[i] - ma) ** 2;
    sbb += (b[i] - mb) ** 2;
}
console.log(JSON.stringify({ datei, bloecke: n, r: +(sab / Math.sqrt(saa * sbb)).toFixed(3), wasserLuma: +ma.toFixed(1), partnerLuma: +mb.toFixed(1) }));
