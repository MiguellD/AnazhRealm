const zlib = require("zlib");
const fs = require("fs");
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
// 8-fache Streckung des Blau-Kanals in einem Ausschnitt: (B − min) × 8, als Graustufen-PNG (für das Auge).
function schreibPng(datei, w, h, grau) {
    const crcT = new Int32Array(256).map((_, n) => { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; return c; });
    const crc = (b) => { let c = -1; for (const x of b) c = crcT[(c ^ x) & 255] ^ (c >>> 8); return (c ^ -1) >>> 0; };
    const chunk = (t, d) => { const l = Buffer.alloc(4); l.writeUInt32BE(d.length); const td = Buffer.concat([Buffer.from(t, "ascii"), d]); const c = Buffer.alloc(4); c.writeUInt32BE(crc(td)); return Buffer.concat([l, td, c]); };
    const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4); ihdr[8] = 8; ihdr[9] = 0;
    const roh = Buffer.alloc((w + 1) * h); for (let y = 0; y < h; y++) { roh[y * (w + 1)] = 0; for (let x = 0; x < w; x++) roh[y * (w + 1) + 1 + x] = grau[y * w + x]; }
    fs.writeFileSync(datei, Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk("IHDR", ihdr), chunk("IDAT", zlib.deflateSync(roh)), chunk("IEND", Buffer.alloc(0))]));
}
const [ein, aus, x0, y0, bw, bh] = process.argv.slice(2);
const I = png(ein);
const X0 = +x0, Y0 = +y0, W = +bw, H = +bh;
let min = 255;
for (let y = Y0; y < Y0 + H; y++) for (let x = X0; x < X0 + W; x++) min = Math.min(min, I.px[(y * I.w + x) * I.kan + 2]);
const g = new Uint8Array(W * H);
for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) g[y * W + x] = Math.min(255, (I.px[((Y0 + y) * I.w + X0 + x) * I.kan + 2] - min) * 8);
schreibPng(aus, W, H, g);
console.log(aus, "min", min);
