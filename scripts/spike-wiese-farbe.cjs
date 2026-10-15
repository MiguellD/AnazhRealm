// spike-wiese-farbe.cjs — SPIKE W1 (16.10.): DIE FARB-STREUUNG DER WIESE AUS 2–5 m. Je Bild die Boden-Kacheln 2 × 2 m im
// Abstand 2–5 m (flacher Boden unter einer Kamera in Augenhöhe h, Neigung θ, horizontales Blickfeld φ), je Kachel die
// Standard-Abweichung von a* und b* (CIELAB D65) ihrer Pixel; das Maß σC = Mittel über die Kacheln von sqrt(σa*² + σb*²),
// dazu die Streuung der Kachel-Mittel (Makro, zwischen den Kacheln) und das Mittel L*a*b*. Beide Bilder werden vor dem
// Messen auf dieselbe Leinwand 960 × 540 gemittelt (Flächen-Mittel), damit Auflösung und Halm-Raster gleich zählen.
//
//   node scripts/spike-wiese-farbe.cjs <bild.png> --h 1.7 --neigung 14 --hfov 75 [--json aus.json]
/* global process, console */
"use strict";
const fs = require("fs");
const { pngLesen } = require("./lib/abnahme-urteil.cjs");

const argv = process.argv.slice(2);
const opt = (k, d) => {
    const i = argv.indexOf(k);
    return i >= 0 ? Number(argv[i + 1]) : d;
};
const datei = argv[0];
const H_AUGE = opt("--h", 1.7);
const NEIGUNG = (opt("--neigung", 14) * Math.PI) / 180;
const HFOV = (opt("--hfov", 75) * Math.PI) / 180;
const KACHEL = opt("--kachel", 2);
const D0 = opt("--d0", 2);
const D1 = opt("--d1", 5);
const ZW = 960;
const ZH = 540;

// Flächen-Mittel auf ZW × ZH (in linearem Licht, zurück nach sRGB)
const lin = (c) => (c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
function mitteln(b) {
    const out = new Float64Array(ZW * ZH * 3);
    const sx = b.W / ZW;
    const sy = b.H / ZH;
    for (let y = 0; y < ZH; y++) {
        const y0 = y * sy;
        const y1 = (y + 1) * sy;
        for (let x = 0; x < ZW; x++) {
            const x0 = x * sx;
            const x1 = (x + 1) * sx;
            let r = 0,
                g = 0,
                bl = 0,
                w = 0;
            for (let yy = Math.floor(y0); yy < Math.ceil(y1); yy++) {
                const wy = Math.min(y1, yy + 1) - Math.max(y0, yy);
                if (wy <= 0) continue;
                for (let xx = Math.floor(x0); xx < Math.ceil(x1); xx++) {
                    const wx = Math.min(x1, xx + 1) - Math.max(x0, xx);
                    if (wx <= 0) continue;
                    const o = (yy * b.W + xx) * 4;
                    const ww = wx * wy;
                    r += lin(b.u8[o] / 255) * ww;
                    g += lin(b.u8[o + 1] / 255) * ww;
                    bl += lin(b.u8[o + 2] / 255) * ww;
                    w += ww;
                }
            }
            const o = (y * ZW + x) * 3;
            out[o] = r / w;
            out[o + 1] = g / w;
            out[o + 2] = bl / w;
        }
    }
    return out;
}
// linear sRGB → CIELAB (D65)
function lab(r, g, b) {
    const X = (0.4124 * r + 0.3576 * g + 0.1805 * b) / 0.95047;
    const Y = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    const Z = (0.0193 * r + 0.1192 * g + 0.9505 * b) / 1.08883;
    const f = (t) => (t > 216 / 24389 ? Math.cbrt(t) : ((24389 / 27) * t + 16) / 116);
    const fx = f(X),
        fy = f(Y),
        fz = f(Z);
    return [116 * fy - 16, 500 * (fx - fy), 200 * (fy - fz)];
}

const bild = pngLesen(fs.readFileSync(datei));
const px = mitteln(bild);
// die Kamera: x rechts, y oben, Blick −z; geneigt um θ nach unten
const tx = Math.tan(HFOV / 2);
const ty = tx * (ZH / ZW);
const cs = Math.cos(NEIGUNG);
const sn = Math.sin(NEIGUNG);
const kacheln = new Map();
const alle = [];
for (let y = 0; y < ZH; y++) {
    const ny = 1 - ((y + 0.5) / ZH) * 2;
    for (let x = 0; x < ZW; x++) {
        const nx = ((x + 0.5) / ZW) * 2 - 1;
        // Strahl in der Kamera, gedreht um die Neigung (um x)
        const rx = nx * tx;
        const ry0 = ny * ty;
        const rz0 = -1;
        const ry = ry0 * cs + rz0 * sn;
        const rz = -ry0 * sn + rz0 * cs;
        if (ry >= -1e-6) continue; // über dem Horizont
        const t = H_AUGE / -ry;
        const gx = rx * t;
        const gz = rz * t;
        const d = Math.hypot(gx, gz);
        if (d < D0 || d > D1) continue;
        const o = (y * ZW + x) * 3;
        const L = lab(px[o], px[o + 1], px[o + 2]);
        const key = Math.floor(gx / KACHEL) + "," + Math.floor(gz / KACHEL);
        let k = kacheln.get(key);
        if (!k) kacheln.set(key, (k = []));
        k.push(L);
        alle.push(L);
    }
}
const mittel = (a, i) => a.reduce((s, v) => s + v[i], 0) / a.length;
const sigma = (a, i) => {
    const m = mittel(a, i);
    return Math.sqrt(a.reduce((s, v) => s + (v[i] - m) * (v[i] - m), 0) / a.length);
};
// die Streuung des Farbtons h = atan2(b*, a*) in Grad (zirkulär, nur Pixel mit Buntheit C* > 5)
function farbtonSigma(a) {
    let c = 0,
        sn = 0,
        n = 0;
    for (const v of a) {
        if (Math.hypot(v[1], v[2]) <= 5) continue;
        const h = Math.atan2(v[2], v[1]);
        c += Math.cos(h);
        sn += Math.sin(h);
        n++;
    }
    if (!n) return 0;
    const R = Math.hypot(c, sn) / n;
    return (Math.sqrt(-2 * Math.log(Math.max(R, 1e-9))) * 180) / Math.PI;
}
const MIN_PX = 400;
const zeilen = [];
for (const [key, k] of kacheln) {
    if (k.length < MIN_PX) continue;
    zeilen.push({
        key,
        n: k.length,
        sL: sigma(k, 0),
        sa: sigma(k, 1),
        sb: sigma(k, 2),
        mL: mittel(k, 0),
        ma: mittel(k, 1),
        mb: mittel(k, 2),
        sh: farbtonSigma(k),
    });
}
// gewichtet nach Pixelzahl (eine angeschnittene Kachel zählt nach ihrem Anteil)
const N = zeilen.reduce((s, z) => s + z.n, 0);
const gw = (f) => zeilen.reduce((s, z) => s + f(z) * z.n, 0) / N;
const sC = gw((z) => Math.hypot(z.sa, z.sb));
const makro = (f) => {
    const m = gw(f);
    return Math.sqrt(gw((z) => (f(z) - m) * (f(z) - m)));
};
const erg = {
    bild: datei,
    kamera: {
        h: H_AUGE,
        neigungGrad: +((NEIGUNG * 180) / Math.PI).toFixed(2),
        hfovGrad: +((HFOV * 180) / Math.PI).toFixed(1),
    },
    band: [D0, D1],
    kacheln: zeilen.length,
    pixel: N,
    sigmaC: +sC.toFixed(2),
    sigmaA: +gw((z) => z.sa).toFixed(2),
    sigmaB: +gw((z) => z.sb).toFixed(2),
    sigmaL: +gw((z) => z.sL).toFixed(2),
    sigmaH: +gw((z) => z.sh).toFixed(2),
    makroA: +makro((z) => z.ma).toFixed(2),
    makroB: +makro((z) => z.mb).toFixed(2),
    mittelLab: [mittel(alle, 0), mittel(alle, 1), mittel(alle, 2)].map((v) => +v.toFixed(1)),
    sigmaGesamtAB: [+sigma(alle, 1).toFixed(2), +sigma(alle, 2).toFixed(2)],
};
console.log(JSON.stringify(erg));
const j = argv.indexOf("--json");
if (j >= 0) fs.writeFileSync(argv[j + 1], JSON.stringify(erg, null, 2));
