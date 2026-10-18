// 1810 B5 Finder: Pixel-Unterschied zweier Ankunfts-Bilder (PNG 8-bit RGBA/RGB, nicht interlaced) — wie viel vom Bild trägt
// das, was der eine Lauf mehr hat (B = mit Start-Dorf, E = ohne). Zählt Pixel mit max. Kanal-Differenz > Schwelle und die
// Hüll-Box der Unterschiede.   node bild-diff.cjs <a.png> <b.png> [schwelle=24]
"use strict";
const fs = require("fs");
const zlib = require("zlib");
function lies(datei) {
    const b = fs.readFileSync(datei);
    let o = 8, w = 0, h = 0, ct = 0;
    const idat = [];
    while (o < b.length) {
        const len = b.readUInt32BE(o);
        const typ = b.toString("ascii", o + 4, o + 8);
        const d = b.subarray(o + 8, o + 8 + len);
        if (typ === "IHDR") {
            w = d.readUInt32BE(0);
            h = d.readUInt32BE(4);
            ct = d[9];
        } else if (typ === "IDAT") idat.push(d);
        o += 12 + len;
    }
    const bpp = ct === 6 ? 4 : 3;
    const roh = zlib.inflateSync(Buffer.concat(idat));
    const px = Buffer.alloc(w * h * bpp);
    const stride = w * bpp;
    for (let y = 0; y < h; y++) {
        const f = roh[y * (stride + 1)];
        for (let x = 0; x < stride; x++) {
            const r = roh[y * (stride + 1) + 1 + x];
            const a = x >= bpp ? px[y * stride + x - bpp] : 0;
            const up = y > 0 ? px[(y - 1) * stride + x] : 0;
            const c = y > 0 && x >= bpp ? px[(y - 1) * stride + x - bpp] : 0;
            let v;
            if (f === 0) v = r;
            else if (f === 1) v = r + a;
            else if (f === 2) v = r + up;
            else if (f === 3) v = r + ((a + up) >> 1);
            else {
                const p = a + up - c, pa = Math.abs(p - a), pb = Math.abs(p - up), pc = Math.abs(p - c);
                v = r + (pa <= pb && pa <= pc ? a : pb <= pc ? up : c);
            }
            px[y * stride + x] = v & 255;
        }
    }
    return { w, h, bpp, px };
}
const [fa, fb, sS] = process.argv.slice(2);
const S = Number(sS || 24);
const A = lies(fa), B = lies(fb);
let n = 0, x0 = 1e9, y0 = 1e9, x1 = -1, y1 = -1;
for (let y = 0; y < A.h; y++)
    for (let x = 0; x < A.w; x++) {
        let m = 0;
        for (let k = 0; k < 3; k++) m = Math.max(m, Math.abs(A.px[(y * A.w + x) * A.bpp + k] - B.px[(y * B.w + x) * B.bpp + k]));
        if (m > S) {
            n++;
            x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y);
        }
    }
console.log(`${fa} ↔ ${fb}: ${n} von ${A.w * A.h} Pixeln (${((100 * n) / (A.w * A.h)).toFixed(2)} %) über Schwelle ${S}, Hülle x ${x0}–${x1} · y ${y0}–${y1}`);
