// node pixdiff.cjs <a.png> <b.png> — Pixel mit |Δ| > 0 / > 2 / > 8 (max über RGB), max Δ, mittleres |Δ|
// (PNG-Decoder aus p3/hv2/vergleich.cjs: 8 bit, RGB/RGBA, alle Filter)
const fs = require("fs");
const path = require("path");
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
    return { w, h, kan, px };
}

const A = png(process.argv[2]);
const B = png(process.argv[3]);
let n0 = 0,
    n2 = 0,
    n8 = 0,
    mx = 0,
    sum = 0;
const N = A.w * A.h;
for (let i = 0; i < N; i++) {
    let d = 0;
    for (let c = 0; c < 3; c++) d = Math.max(d, Math.abs(A.px[i * A.kan + c] - B.px[i * B.kan + c]));
    if (d > 0) n0++;
    if (d > 2) n2++;
    if (d > 8) n8++;
    if (d > mx) mx = d;
    sum += d;
}
const pz = (n) => ((100 * n) / N).toFixed(3) + " %";
console.log(
    `${path.basename(process.argv[2])} ↔ ${path.basename(process.argv[3])}: Δ>0 ${pz(n0)}, Δ>2 ${pz(n2)}, Δ>8 ${pz(n8)}, ` +
        `max ${mx}, Mittel ${(sum / N).toFixed(4)}`
);
