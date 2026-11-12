// WEGWERF (w28-samen-wiese): das Radius-Profil des Stamms aus den Ringen des Kerns (aCenter = die Ring-Mitte, phyto-core.js:3883).
"use strict";
const fs = require("fs");
const f32 = (b) => new Float32Array(new Uint8Array(Buffer.from(b, "base64")).buffer);
function ringe(datei, s) {
    const r = JSON.parse(fs.readFileSync(datei, "utf8"));
    const R = new Map();
    for (const m of r.meshes) {
        if (m.kind !== "bark" || !m.attrs.aCenter) continue;
        const p = f32(m.attrs.position.b64), c = f32(m.attrs.aCenter.b64);
        for (let i = 0; i < p.length; i += 3) {
            if (Math.hypot(c[i], c[i + 2]) * s > 0.35) continue; // nur Ringe nahe der Achse (der Stamm)
            const k = c[i].toFixed(5) + "|" + c[i + 1].toFixed(5) + "|" + c[i + 2].toFixed(5);
            const d = Math.hypot(p[i] - c[i], p[i + 1] - c[i + 1], p[i + 2] - c[i + 2]) * s;
            const e = R.get(k) || { y: c[i + 1] * s, n: 0, sum: 0, min: 1e9, max: 0 };
            e.n++; e.sum += d; e.min = Math.min(e.min, d); e.max = Math.max(e.max, d);
            R.set(k, e);
        }
    }
    return [...R.values()].filter((e) => e.n >= 5).map((e) => ({ y: e.y, r: e.sum / e.n, min: e.min, max: e.max, n: e.n })).sort((a, b) => a.y - b.y);
}
module.exports = { ringe, f32 };
if (require.main === module) {
    const [datei, sk] = process.argv.slice(2);
    for (const e of ringe(datei, +sk)) if (e.y < 9) console.log(`y ${e.y.toFixed(2)} m · ⌀ mittel ${(2 * e.r).toFixed(3)} · min ${(2 * e.min).toFixed(3)} · max ${(2 * e.max).toFixed(3)} · Ecken ${e.n}`);
}
