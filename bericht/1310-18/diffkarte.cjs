// 1310-18: wo zwei Bilder sich unterscheiden — je 120×120-Block die mittlere |ΔLuma| (×255), die Blöcke über der Schwelle
// node diffkarte.cjs a.png b.png [schwelle 3]
const fs = require('fs');
const zlib = require('zlib');
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

const A = png(process.argv[2]), B = png(process.argv[3]);
const S = +(process.argv[4] || 3), K = 120;
const zeilen = [];
for (let by = 0; by < A.h; by += K) { let z = ''; for (let bx = 0; bx < A.w; bx += K) { let s = 0, n = 0; for (let y = by; y < Math.min(by + K, A.h); y++) for (let x = bx; x < Math.min(bx + K, A.w); x++) { s += Math.abs(A.L[y * A.w + x] - B.L[y * A.w + x]); n++; } const m = (s / n) * 255; z += m >= S ? (m >= 10 ? '#' : '+') : '.'; } zeilen.push(z); }
console.log(zeilen.join(String.fromCharCode(10)));
