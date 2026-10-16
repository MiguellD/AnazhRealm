// sprung-raster.cjs — wo springt das Bild in den 10 s nach der Ankunft? Je Boot <N>.png (Ankunft) gegen <N>-10s.png, auf einem
// 4 × 4-Raster der Anteil der Pixel mit |Δ| > 24 (max über RGB), je Seite gemittelt; dazu B − A je Zelle.
//   node sprung-raster.cjs [ordner]
"use strict";
const fs = require("fs");
const path = require("path");
const zlib = require("zlib");
const DIR = process.argv[2] || __dirname;
function png(datei) {
    const b = fs.readFileSync(datei);
    let o = 8, w = 0, h = 0, typ = 0;
    const idat = [];
    while (o < b.length) {
        const len = b.readUInt32BE(o), art = b.toString("ascii", o + 4, o + 8), d = b.subarray(o + 8, o + 8 + len);
        if (art === "IHDR") { w = d.readUInt32BE(0); h = d.readUInt32BE(4); typ = d[9]; if (d[8] !== 8 || d[12] !== 0) throw new Error("nur 8 bit, ohne Interlace"); }
        else if (art === "IDAT") idat.push(d);
        else if (art === "IEND") break;
        o += 12 + len;
    }
    const bpp = typ === 6 ? 4 : typ === 2 ? 3 : 0;
    if (!bpp) throw new Error("Farbtyp " + typ);
    const roh = zlib.inflateSync(Buffer.concat(idat)), z = w * bpp, aus = Buffer.alloc(h * z);
    for (let y = 0; y < h; y++) {
        const f = roh[y * (z + 1)], q = roh.subarray(y * (z + 1) + 1, (y + 1) * (z + 1));
        for (let x = 0; x < z; x++) {
            const a = x >= bpp ? aus[y * z + x - bpp] : 0, o2 = y ? aus[(y - 1) * z + x] : 0, c = x >= bpp && y ? aus[(y - 1) * z + x - bpp] : 0;
            let v = q[x];
            if (f === 1) v += a; else if (f === 2) v += o2; else if (f === 3) v += (a + o2) >> 1;
            else if (f === 4) { const p = a + o2 - c, pa = Math.abs(p - a), pb = Math.abs(p - o2), pc = Math.abs(p - c); v += pa <= pb && pa <= pc ? a : pb <= pc ? o2 : c; }
            aus[y * z + x] = v & 255;
        }
    }
    return { w, h, bpp, d: aus };
}
const N = 4;
const je = { A: [], B: [] };
for (const n of fs.readdirSync(DIR).filter((x) => /^[AB]\d+\.png$/.test(x)).sort()) {
    const nach = path.join(DIR, n.replace(".png", "-10s.png"));
    if (!fs.existsSync(nach)) continue;
    const p = png(path.join(DIR, n)), q = png(nach);
    const zelle = Array.from({ length: N * N }, () => [0, 0]);
    for (let y = 0; y < p.h; y++)
        for (let x = 0; x < p.w; x++) {
            const i = (y * p.w + x) * p.bpp;
            const d = Math.max(Math.abs(p.d[i] - q.d[i]), Math.abs(p.d[i + 1] - q.d[i + 1]), Math.abs(p.d[i + 2] - q.d[i + 2]));
            const k = Math.floor((y * N) / p.h) * N + Math.floor((x * N) / p.w);
            zelle[k][1]++;
            if (d > 24) zelle[k][0]++;
        }
    je[n[0]].push(zelle.map(([a, b]) => (100 * a) / b));
}
const mittel = (S) => Array.from({ length: N * N }, (_, k) => je[S].reduce((s, z) => s + z[k], 0) / je[S].length);
const mA = mittel("A"), mB = mittel("B");
const tafel = (titel, m) => {
    console.log(`\n${titel} (Zeilen oben → unten, Spalten links → rechts, % der Pixel |Δ| > 24)`);
    for (let r = 0; r < N; r++) console.log("  " + m.slice(r * N, r * N + N).map((v) => v.toFixed(1).padStart(6)).join(" "));
};
console.log(`Boots: A ${je.A.length}, B ${je.B.length}`);
tafel("A (Grundlinie: Wolken, Membranen, Wind)", mA);
tafel("B", mB);
tafel("B − A (der Sprung der Verfeinerung)", mB.map((v, k) => v - mA[k]));
