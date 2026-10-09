const zlib = require("zlib");
const fs = require("fs");
const path = require("path");
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
// DAS BLAU-MASS (0910-3 B): Banding im Blau-Kanal (5 Bit Mantisse im 11/11/10-Ziel). In GLATTEN Flächen (R und G zu allen vier
// Nachbarn innerhalb ±1 Stufe) zählt jeder Sprung des Blau-Kanals zum rechten Nachbarn um ≥ 2 Stufen; das Maß ist ihr Anteil an
// den glatten Pixeln (‰). Ein feineres Format stuft einen glatten Verlauf in 1er-Schritten, ein gröberes springt in 2ern.
function blau(datei) {
    const I = png(datei);
    const { w, h, px, kan } = I;
    const c = (x, y, k) => px[(y * w + x) * kan + k];
    let glatt = 0, zwei = 0, eins = 0;
    for (let y = 1; y < h - 1; y++)
        for (let x = 1; x < w - 1; x++) {
            let ok = true;
            for (const k of [0, 1]) {
                const v = c(x, y, k);
                if (Math.abs(c(x + 1, y, k) - v) > 1 || Math.abs(c(x - 1, y, k) - v) > 1 || Math.abs(c(x, y + 1, k) - v) > 1 || Math.abs(c(x, y - 1, k) - v) > 1) {
                    ok = false;
                    break;
                }
            }
            if (!ok) continue;
            glatt++;
            const j = Math.abs(c(x + 1, y, 2) - c(x, y, 2));
            if (j >= 2) zwei++;
            else if (j === 1) eins++;
        }
    return { glatt, zwei, eins, promille: glatt ? (1000 * zwei) / glatt : 0, hell: I.L.reduce((a, b) => a + b, 0) * 255 / I.L.length };
}
const [ordner, A1, A2, B1, B2] = process.argv.slice(2);
const blicke = fs.readdirSync(path.join(ordner, A1)).filter((f) => f.endsWith(".png")).sort();
const aus = {};
console.log("Blick        | Helligkeit A / B | Zweier-Sprünge Blau ‰ der glatten Pixel: A1 · A2 · B1 · B2 | Rauschen A · B (‰) | B / A");
for (const f of blicke) {
    const m = {};
    for (const s of [A1, A2, B1, B2]) m[s] = blau(path.join(ordner, s, f));
    const a = (m[A1].promille + m[A2].promille) / 2, b = (m[B1].promille + m[B2].promille) / 2;
    aus[f] = m;
    console.log(
        `${f.replace(".png", "").padEnd(12)} | ${((m[A1].hell + m[A2].hell) / 2).toFixed(1)} / ${((m[B1].hell + m[B2].hell) / 2).toFixed(1)} | ` +
            `${[A1, A2, B1, B2].map((s) => m[s].promille.toFixed(3)).join(" · ")} | ${Math.abs(m[A1].promille - m[A2].promille).toFixed(3)} · ` +
            `${Math.abs(m[B1].promille - m[B2].promille).toFixed(3)} | ×${a > 0 ? (b / a).toFixed(2) : "–"}  (glatt ${m[A1].glatt} / ${m[B1].glatt})`
    );
}
fs.writeFileSync(path.join(ordner, `blau-${A1}-${B1}.json`), JSON.stringify(aus, null, 1));
