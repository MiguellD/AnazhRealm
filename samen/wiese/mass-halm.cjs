// VERGLEICHS-WERKZEUG (w28-halm-trieb): die Form-Maße des Befunds an den ECHTEN Puffern des Kerns (bau.cjs, gras-s<same>-l<stufe>.json).
// Ein Blatt = die Zeilen-Paare einer Folge (uv.x < 0, > 0) bis zu seiner Spitze (uv.x = 0), ohne die Ährchen (aCenter.y > 0).
// Schlankheit = Länge ÷ größte Breite (Median), Bogen = Winkel erster ↔ letzter Abschnitt der Mittellinie (flächen-gewichtet),
// Knick = der größte Winkel zwischen zwei Abschnitten eines Blatts (Median · Maximum), LAI = Fläche ÷ Raster-Zelle 0,72² m².
// node samen/wiese/mass-halm.cjs <dump-ordner>
"use strict";
const fs = require("fs"), path = require("path");
const D = process.argv[2], SK = 0.24;
const f32 = (b) => new Float32Array(new Uint8Array(Buffer.from(b, "base64")).buffer);
const med = (a) => a.slice().sort((x, y) => x - y)[a.length >> 1];
const out = [];
for (const same of [1, 2]) for (const stufe of [1, 2]) {
    const r = JSON.parse(fs.readFileSync(path.join(D, `gras-s${same}-l${stufe}.json`), "utf8")), m = r.meshes.find((x) => x.attrs && x.attrs.position);
    const p = f32(m.attrs.position.b64), uv = f32(m.attrs.uv.b64), c = f32(m.attrs.aCenter.b64), n = p.length / 3;
    const tris = Buffer.from(m.index, "base64").length / 12;
    const P = (i) => [p[i * 3] * SK, p[i * 3 + 1] * SK, p[i * 3 + 2] * SK];
    const blaetter = [];
    let z = [];
    for (let i = 0; i < n; i++) {
        if (c[i * 3 + 1] > 1e-6) { z = []; continue; }
        if (uv[i * 2] === 0) { if (z.length) { z.push([P(i), 0]); blaetter.push(z); } z = []; continue; }
        if (uv[i * 2] < 0 && i + 1 < n && uv[i * 2 + 2] > 0) { const a = P(i), b = P(i + 1); z.push([[0, 1, 2].map((k) => (a[k] + b[k]) / 2), Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2])]); i++; }
    }
    let A = 0, wA = 0;
    const schlank = [], breit = [], knick = [];
    for (const z of blaetter) {
        let L = 0, a = 0, w = 0, kn = 0;
        const d = [];
        for (let s = 0; s + 1 < z.length; s++) {
            const v = [0, 1, 2].map((k) => z[s + 1][0][k] - z[s][0][k]), l = Math.hypot(...v);
            L += l; a += (l * (z[s][1] + z[s + 1][1])) / 2; w = Math.max(w, z[s][1]); d.push(v.map((x) => x / l));
        }
        const wk = (u, v) => (Math.acos(Math.max(-1, Math.min(1, u[0] * v[0] + u[1] * v[1] + u[2] * v[2]))) * 180) / Math.PI;
        for (let s = 0; s + 1 < d.length; s++) kn = Math.max(kn, wk(d[s], d[s + 1]));
        A += a; wA += wk(d[0], d[d.length - 1]) * a; schlank.push(L / w); breit.push(w); if (d.length > 1) knick.push(kn);
    }
    const z0 = { gras: `Same ${same} L${stufe}`, dreiecke: tris, ecken: n, blaetter: blaetter.length, breiteMm: +(med(breit) * 1000).toFixed(1), schlank: +med(schlank).toFixed(1), bogenGrad: +(wA / A).toFixed(1), knickGrad: knick.length ? [+med(knick).toFixed(1), +Math.max(...knick).toFixed(1)] : null, laiBlatt: +(A / (0.72 * 0.72)).toFixed(2) };
    out.push(z0);
    console.log(JSON.stringify(z0));
}
if (process.argv[3]) fs.writeFileSync(process.argv[3], JSON.stringify(out, null, 1));
