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
const fs = require("fs");
const d = (a, b) => { const p = png(a), q = png(b); let s = 0, n = p.w * p.h, m8 = 0; for (let i = 0; i < n; i++) { const v = Math.abs(p.L[i] - q.L[i]) * 255; s += v; if (v > 8) m8++; } return `${(s / n).toFixed(3)} (${((100 * m8) / n).toFixed(2)} %)`; };
const B = "bilder";
console.log("Blick        | Signal C an↔aus | Wirkung C an↔D an (2048↔1024) | Kontrolle C aus↔D aus");
for (const v of ["fern", "fern-ost", "fern-flach", "flach-ost", "flach-west", "a-fern", "a-flach-west", "a-flach-ost"])
  console.log(v.padEnd(12), "|", d(`${B}/k1leer-an/${v}.png`, `${B}/k1leer-aus/${v}.png`), "|", d(`${B}/k1leer-an/${v}.png`, `${B}/k1leer-d-an/${v}.png`), "|", d(`${B}/k1leer-aus/${v}.png`, `${B}/k1leer-d-aus/${v}.png`));
