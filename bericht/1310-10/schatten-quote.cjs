// 1310-10: das Schatten-Verhältnis am Bild — je Blick zwei Aufnahmen mit und zwei ohne Sonnenschatten (Ausgabe-Pfad, sRGB).
// Maske: untere 55 % (Boden), linear ohne ≥ 1,6 × linear mit (deutlich beschattet), ohne > 0,02. Je Maske: linear Σmit/Σohne,
// sRGB-Luma mit/ohne (0–255), Anteil der Pixel. node schatten-quote.cjs <ordner> <blick>
"use strict";
const fs = require("fs");
const zlib = require("zlib");
function png(datei) {
    const b = fs.readFileSync(datei);
    let o = 8,
        w = 0,
        h = 0,
        typ = 0;
    const idat = [];
    while (o < b.length) {
        const n = b.readUInt32BE(o);
        const t = b.toString("ascii", o + 4, o + 8);
        const d = b.subarray(o + 8, o + 8 + n);
        if (t === "IHDR") {
            w = d.readUInt32BE(0);
            h = d.readUInt32BE(4);
            if (d[8] !== 8) throw new Error("nur 8 bit");
            typ = d[9];
        } else if (t === "IDAT") idat.push(d);
        else if (t === "IEND") break;
        o += 12 + n;
    }
    const kan = typ === 6 ? 4 : typ === 2 ? 3 : 0;
    if (!kan) throw new Error("Farbtyp " + typ);
    const roh = zlib.inflateSync(Buffer.concat(idat));
    const zeile = w * kan;
    const px = new Uint8Array(h * zeile);
    let vor = new Uint8Array(zeile);
    for (let y = 0; y < h; y++) {
        const f = roh[y * (zeile + 1)];
        const z = roh.subarray(y * (zeile + 1) + 1, (y + 1) * (zeile + 1));
        const aus = px.subarray(y * zeile, (y + 1) * zeile);
        for (let x = 0; x < zeile; x++) {
            const a = x >= kan ? aus[x - kan] : 0,
                bb = vor[x],
                c = x >= kan ? vor[x - kan] : 0;
            let v = z[x];
            if (f === 1) v += a;
            else if (f === 2) v += bb;
            else if (f === 3) v += (a + bb) >> 1;
            else if (f === 4) {
                const p = a + bb - c,
                    pa = Math.abs(p - a),
                    pb = Math.abs(p - bb),
                    pc = Math.abs(p - c);
                v += pa <= pb && pa <= pc ? a : pb <= pc ? bb : c;
            }
            aus[x] = v & 255;
        }
        vor = aus;
    }
    const L = new Float64Array(w * h);
    for (let i = 0; i < w * h; i++)
        L[i] = (0.2126 * px[i * kan] + 0.7152 * px[i * kan + 1] + 0.0722 * px[i * kan + 2]) / 255;
    return { w, h, L, px, kan };
}
const lin = (c) => (c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
const [dir, blick] = process.argv.slice(2);
const lade = (n) => png(`${dir}/bild/${n}/${blick}.png`);
const mit = [lade("mit1"), lade("mit2")], ohne = [lade("ohne1"), lade("ohne2")];
const { w, h } = mit[0];
const linY = (b, i) => {
    const p = b.px, k = b.kan;
    return 0.2126 * lin(p[i * k] / 255) + 0.7152 * lin(p[i * k + 1] / 255) + 0.0722 * lin(p[i * k + 2] / 255);
};
let sm = 0, so = 0, lm = 0, lo = 0, n = 0, boden = 0;
const y0 = Math.floor(h * 0.45);
for (let y = y0; y < h; y++)
    for (let x = 0; x < w; x++) {
        const i = y * w + x;
        boden++;
        const m = (linY(mit[0], i) + linY(mit[1], i)) / 2;
        const o = (linY(ohne[0], i) + linY(ohne[1], i)) / 2;
        if (!(o > 0.02 && o >= 1.6 * m)) continue;
        sm += m; so += o; n++;
        lm += (mit[0].L[i] + mit[1].L[i]) / 2; lo += (ohne[0].L[i] + ohne[1].L[i]) / 2;
    }
console.log(JSON.stringify({ blick, pixel: n, anteilBoden: +(n / boden).toFixed(3), linearQuote: +(sm / so).toFixed(3), lumaMit: +((lm / n) * 255).toFixed(1), lumaOhne: +((lo / n) * 255).toFixed(1), lumaQuote: +(lm / lo).toFixed(3) }));
