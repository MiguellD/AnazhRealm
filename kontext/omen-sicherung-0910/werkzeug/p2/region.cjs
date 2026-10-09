// Mittlere Farbe einer Region: node region.cjs x0 y0 x1 y1 datei...
const fs = require("fs"), zlib = require("zlib");
function lies(datei) {
    const b = fs.readFileSync(datei); let o = 8, w = 0, h = 0, typ = 0; const idat = [];
    while (o < b.length) { const n = b.readUInt32BE(o), t = b.toString("ascii", o + 4, o + 8), d = b.subarray(o + 8, o + 8 + n);
        if (t === "IHDR") { w = d.readUInt32BE(0); h = d.readUInt32BE(4); typ = d[9]; } else if (t === "IDAT") idat.push(d); else if (t === "IEND") break; o += 12 + n; }
    const kan = typ === 6 ? 4 : 3, roh = zlib.inflateSync(Buffer.concat(idat)), z = w * kan, px = new Uint8Array(h * z); let vor = new Uint8Array(z);
    for (let y = 0; y < h; y++) { const f = roh[y * (z + 1)], s = roh.subarray(y * (z + 1) + 1, (y + 1) * (z + 1)), a2 = px.subarray(y * z, (y + 1) * z);
        for (let x = 0; x < z; x++) { const a = x >= kan ? a2[x - kan] : 0, bb = vor[x], c = x >= kan ? vor[x - kan] : 0; let v = s[x];
            if (f === 1) v += a; else if (f === 2) v += bb; else if (f === 3) v += (a + bb) >> 1; else if (f === 4) { const p = a + bb - c, pa = Math.abs(p - a), pb = Math.abs(p - bb), pc = Math.abs(p - c); v += pa <= pb && pa <= pc ? a : pb <= pc ? bb : c; }
            a2[x] = v & 255; } vor = a2; }
    return { w, kan, px };
}
const [x0, y0, x1, y1, ...dateien] = process.argv.slice(2);
for (const d of dateien) { const I = lies(d); const s = [0, 0, 0]; let n = 0;
    for (let y = +y0; y < +y1; y++) for (let x = +x0; x < +x1; x++) { const i = (y * I.w + x) * I.kan; s[0] += I.px[i]; s[1] += I.px[i + 1]; s[2] += I.px[i + 2]; n++; }
    console.log(d.padEnd(34), s.map((v) => (v / n).toFixed(0)).join(" ")); }
