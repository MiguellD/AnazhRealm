// PNG-STATS — objektive Pixel-Wahrheit (wahreranblick §1.3). Dekodiert ein PNG
// (RGB/RGBA, 8-bit, nicht-interlaced — was Puppeteer schreibt) und meldet die
// Durchschnitts-/Dominant-Farbe der Pixel, die vom Hintergrund abweichen. So lese
// ich „Grün? Creme? Weiß? Schwarz?" als ZAHL, nicht als Augen-Eindruck.
// Aufruf: node scripts/png-stats.cjs artifacts/krone-eiche.png [bgHex] [x0 y0 x1 y1]
const fs = require("fs");
const zlib = require("zlib");

function decodePNG(buf) {
    if (buf.readUInt32BE(0) !== 0x89504e47) throw new Error("kein PNG");
    let off = 8, width = 0, height = 0, bitDepth = 0, colorType = 0;
    const idat = [];
    while (off < buf.length) {
        const len = buf.readUInt32BE(off);
        const type = buf.toString("ascii", off + 4, off + 8);
        const data = buf.subarray(off + 8, off + 8 + len);
        if (type === "IHDR") {
            width = data.readUInt32BE(0); height = data.readUInt32BE(4);
            bitDepth = data[8]; colorType = data[9];
        } else if (type === "IDAT") idat.push(data);
        else if (type === "IEND") break;
        off += 12 + len;
    }
    if (bitDepth !== 8) throw new Error("nur 8-bit unterstützt, ist " + bitDepth);
    const channels = colorType === 6 ? 4 : colorType === 2 ? 3 : colorType === 0 ? 1 : colorType === 4 ? 2 : 0;
    if (!channels) throw new Error("colorType " + colorType + " nicht unterstützt");
    const raw = zlib.inflateSync(Buffer.concat(idat));
    const stride = width * channels;
    const out = Buffer.alloc(height * stride);
    const paeth = (a, b, c) => { const p = a + b - c, pa = Math.abs(p - a), pb = Math.abs(p - b), pc = Math.abs(p - c); return pa <= pb && pa <= pc ? a : pb <= pc ? b : c; };
    let pos = 0;
    for (let y = 0; y < height; y++) {
        const filter = raw[pos++];
        for (let x = 0; x < stride; x++) {
            const v = raw[pos++];
            const a = x >= channels ? out[y * stride + x - channels] : 0;
            const b = y > 0 ? out[(y - 1) * stride + x] : 0;
            const c = x >= channels && y > 0 ? out[(y - 1) * stride + x - channels] : 0;
            let r;
            if (filter === 0) r = v; else if (filter === 1) r = v + a; else if (filter === 2) r = v + b;
            else if (filter === 3) r = v + ((a + b) >> 1); else r = v + paeth(a, b, c);
            out[y * stride + x] = r & 0xff;
        }
    }
    return { width, height, channels, data: out };
}

const file = process.argv[2];
const bgHex = process.argv[3] ? parseInt(process.argv[3].replace("#", ""), 16) : 0x4a4a52;
const bgR = (bgHex >> 16) & 0xff, bgG = (bgHex >> 8) & 0xff, bgB = bgHex & 0xff;
const clip = process.argv.length >= 8 ? process.argv.slice(4, 8).map(Number) : null;
const img = decodePNG(fs.readFileSync(file));
const { width, height, channels, data } = img;
const x0 = clip ? clip[0] : 0, y0 = clip ? clip[1] : 0, x1 = clip ? clip[2] : width, y1 = clip ? clip[3] : height;
let r = 0, g = 0, b = 0, n = 0, total = 0;
const buckets = {}; // grobe Farb-Buckets (R,G,B auf 64er gerundet)
for (let y = y0; y < y1; y++) {
    for (let x = x0; x < x1; x++) {
        const i = (y * width + x) * channels;
        const R = data[i], G = data[i + 1], B = channels >= 3 ? data[i + 2] : data[i];
        total++;
        if (Math.abs(R - bgR) + Math.abs(G - bgG) + Math.abs(B - bgB) > 40) {
            r += R; g += G; b += B; n++;
            const key = `${R >> 6}_${G >> 6}_${B >> 6}`;
            buckets[key] = (buckets[key] || 0) + 1;
        }
    }
}
const top = Object.entries(buckets).sort((a, b) => b[1] - a[1]).slice(0, 5)
    .map(([k, c]) => { const [r, g, b] = k.split("_").map((v) => v * 64 + 32); return `rgb(${r},${g},${b})×${c}`; });
console.log(`${file}  ${width}×${height} ch=${channels}`);
console.log(`  non-bg pixels: ${n}/${total} (${((n / total) * 100).toFixed(1)}%)`);
console.log(`  avg non-bg: rgb(${n ? Math.round(r / n) : 0}, ${n ? Math.round(g / n) : 0}, ${n ? Math.round(b / n) : 0})`);
console.log(`  top buckets: ${top.join("  ")}`);
