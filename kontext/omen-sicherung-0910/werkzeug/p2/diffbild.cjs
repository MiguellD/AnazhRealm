// Differenz-Karte zweier PNGs (1920×1080): node diffbild.cjs a.png b.png aus-prefix
// schreibt <prefix>-diff.png (|ΔLuma| × 6, Graustufen), nennt die heißesten Zellen (16×9-Raster) und schneidet die
// heißeste Zelle aus beiden Bildern (2× vergrößert) als <prefix>-a.png / <prefix>-b.png.
const fs = require("fs");
const zlib = require("zlib");
const path = require("path");
const { execFileSync } = require("child_process");

function lies(datei) {
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
            typ = d[9];
        } else if (t === "IDAT") idat.push(d);
        else if (t === "IEND") break;
        o += 12 + n;
    }
    const kan = typ === 6 ? 4 : 3;
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
    return { w, h, kan, px };
}

const crcTab = new Int32Array(256).map((_, n) => {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    return c;
});
const crc = (b) => {
    let c = -1;
    for (const x of b) c = crcTab[(c ^ x) & 255] ^ (c >>> 8);
    return (c ^ -1) >>> 0;
};
function schreib(datei, w, h, kan, px) {
    const chunk = (t, d) => {
        const l = Buffer.alloc(4);
        l.writeUInt32BE(d.length);
        const td = Buffer.concat([Buffer.from(t, "ascii"), d]);
        const c = Buffer.alloc(4);
        c.writeUInt32BE(crc(td));
        return Buffer.concat([l, td, c]);
    };
    const ih = Buffer.alloc(13);
    ih.writeUInt32BE(w, 0);
    ih.writeUInt32BE(h, 4);
    ih[8] = 8;
    ih[9] = kan === 4 ? 6 : kan === 3 ? 2 : 0;
    const roh = Buffer.alloc(h * (w * kan + 1));
    for (let y = 0; y < h; y++) Buffer.from(px.buffer, px.byteOffset + y * w * kan, w * kan).copy(roh, y * (w * kan + 1) + 1);
    fs.writeFileSync(
        datei,
        Buffer.concat([
            Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
            chunk("IHDR", ih),
            chunk("IDAT", zlib.deflateSync(roh)),
            chunk("IEND", Buffer.alloc(0)),
        ])
    );
}

const [fa, fb, pre] = process.argv.slice(2);
const A = lies(fa),
    B = lies(fb);
const { w, h } = A;
const lum = (I, i) => 0.2126 * I.px[i * I.kan] + 0.7152 * I.px[i * I.kan + 1] + 0.0722 * I.px[i * I.kan + 2];
const d = new Uint8Array(w * h);
const zel = new Float64Array(16 * 9);
for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) {
        const i = y * w + x;
        const v = Math.abs(lum(A, i) - lum(B, i));
        d[i] = Math.min(255, v * 6);
        zel[Math.floor((y * 9) / h) * 16 + Math.floor((x * 16) / w)] += v;
    }
schreib(pre + "-diff.png", w, h, 1, d);
const zw = w / 16,
    zh = h / 9;
const top = [...zel].map((v, i) => [v / (zw * zh), i]).sort((a, b) => b[0] - a[0]).slice(0, 6);
console.log("heißeste Zellen (|ΔLuma| mittel, Spalte/Zeile im 16×9-Raster):", top.map(([v, i]) => `${(i % 16)}/${Math.floor(i / 16)}:${v.toFixed(1)}`).join("  "));
const [, best] = top[0];
const cx = (best % 16) * zw,
    cy = Math.floor(best / 16) * zh;
const S = 2,
    CW = Math.round(zw * 2),
    CH = Math.round(zh * 2);
const x0 = Math.max(0, Math.min(w - CW, Math.round(cx - zw / 2))),
    y0 = Math.max(0, Math.min(h - CH, Math.round(cy - zh / 2)));
for (const [I, suf] of [
    [A, "a"],
    [B, "b"],
]) {
    const out = new Uint8Array(CW * S * CH * S * 3);
    for (let y = 0; y < CH * S; y++)
        for (let x = 0; x < CW * S; x++) {
            const si = ((y0 + Math.floor(y / S)) * w + x0 + Math.floor(x / S)) * I.kan;
            const di = (y * CW * S + x) * 3;
            out[di] = I.px[si];
            out[di + 1] = I.px[si + 1];
            out[di + 2] = I.px[si + 2];
        }
    schreib(`${pre}-${suf}.png`, CW * S, CH * S, 3, out);
}
console.log(`Ausschnitt x ${x0}–${x0 + CW}, y ${y0}–${y0 + CH} (2×)`);
