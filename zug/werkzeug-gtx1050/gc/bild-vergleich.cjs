// bild-vergleich.cjs <a.png> <b.png> … — je Paar (a gegen jedes weitere) der Luma-Abstand je Pixel (0–255, Rec. 709 auf den
// sRGB-Werten): Mittel, p99, Höchstwert und der Anteil der Pixel mit Abstand > 2 und > 8. Gleiche Größe ist Pflicht.
const fs = require("fs");
const path = require("path");
const { pngLesen } = require(path.resolve("C:/AnazhRealm/scripts/lib/abnahme-urteil.cjs"));
const [a, ...rest] = process.argv.slice(2);
const luma = (b) => {
    const n = b.W * b.H;
    const k = b.u8.length / n;
    const L = new Float32Array(n);
    for (let i = 0; i < n; i++) L[i] = 0.2126 * b.u8[i * k] + 0.7152 * b.u8[i * k + 1] + 0.0722 * b.u8[i * k + 2];
    return L;
};
const A = pngLesen(fs.readFileSync(a));
const La = luma(A);
for (const f of rest) {
    const B = pngLesen(fs.readFileSync(f));
    if (B.W !== A.W || B.H !== A.H) {
        console.log(`${path.basename(f)}: andere Größe ${B.W}×${B.H} gegen ${A.W}×${A.H}`);
        continue;
    }
    const Lb = luma(B);
    const d = new Float32Array(La.length);
    let s = 0, gt2 = 0, gt8 = 0, max = 0;
    for (let i = 0; i < d.length; i++) {
        d[i] = Math.abs(La[i] - Lb[i]);
        s += d[i];
        if (d[i] > 2) gt2++;
        if (d[i] > 8) gt8++;
        if (d[i] > max) max = d[i];
    }
    const sort = Array.from(d).sort((x, y) => x - y);
    console.log(`${path.basename(a)} ↔ ${path.basename(f)}: Mittel ${(s / d.length).toFixed(3)} · p99 ${sort[Math.floor(d.length * 0.99)].toFixed(2)} · max ${max.toFixed(1)} · > 2: ${((100 * gt2) / d.length).toFixed(2)} % · > 8: ${((100 * gt8) / d.length).toFixed(2)} %`);
}
