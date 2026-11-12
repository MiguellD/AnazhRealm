// WEGWERF (w28-samen-wiese): Maße der echten Kern-Bäume aus dem Brücken-Bau (bau.cjs) — Höhe, Stamm-Durchmesser je Höhe, Krone.
"use strict";
const fs = require("fs");
const path = require("path");
const D = process.argv[2];
const SK = { eiche: 4.16, fichte: 4.85, birke: 4.03, buche: 4.0 }; // placement.scale (foundry-core.js:681–687), × treeScaleMul 0,82
const f32 = (b) => new Float32Array(new Uint8Array(Buffer.from(b, "base64")).buffer);
for (const [art, same] of [["eiche", 1], ["eiche", 2], ["eiche", 3], ["buche", 1], ["buche", 3], ["birke", 1], ["birke", 3], ["fichte", 1]]) {
    const r = JSON.parse(fs.readFileSync(path.join(D, `${art}-s${same}-l0.json`), "utf8"));
    const s = SK[art] * 0.82;
    let H = 0, kb = [1e9, -1e9, 1e9, -1e9], laubMin = 1e9, tris = { bark: 0, foliageTex: 0 };
    const rinde = [];
    for (const m of r.meshes) {
        if (!m.attrs || !m.attrs.position) continue;
        const p = f32(m.attrs.position.b64);
        tris[m.kind] = (tris[m.kind] || 0) + Buffer.from(m.index, "base64").length / 12;
        for (let i = 0; i < p.length; i += 3) {
            const x = p[i] * s, y = p[i + 1] * s, z = p[i + 2] * s;
            if (y > H) H = y;
            if (m.kind === "foliageTex") {
                kb = [Math.min(kb[0], x), Math.max(kb[1], x), Math.min(kb[2], z), Math.max(kb[3], z)];
                if (y < laubMin) laubMin = y;
            } else rinde.push(x, y, z);
        }
    }
    // der Stamm-Durchmesser in der Höhe h: die Rinden-Ecken nahe der Achse im schmalsten Band um h, das ≥ 10 Ecken trägt
    const dm = (h) => {
        for (let band = 0.03; band <= 0.6; band *= 1.5) {
            const P = [];
            for (let i = 0; i < rinde.length; i += 3) if (Math.abs(rinde[i + 1] - h) < band && Math.hypot(rinde[i], rinde[i + 2]) < (h < 2 ? 0.45 : 1.0)) P.push(rinde[i], rinde[i + 2]);
            if (P.length < 20) continue;
            let sx = 0, sz = 0;
            const n = P.length / 2;
            for (let i = 0; i < P.length; i += 2) (sx += P[i]), (sz += P[i + 1]);
            sx /= n; sz /= n;
            // die Hülle: je Sektor (16) der äußerste Abstand zur Mitte, darüber gemittelt (Wurzel-Rohre innen zählen nicht)
            const sek = new Float64Array(16);
            for (let i = 0; i < P.length; i += 2) {
                const k = Math.floor(((Math.atan2(P[i + 1] - sz, P[i] - sx) + Math.PI) / (2 * Math.PI)) * 16) & 15;
                sek[k] = Math.max(sek[k], Math.hypot(P[i] - sx, P[i + 1] - sz));
            }
            const voll = Array.from(sek).filter((x) => x > 0);
            return (2 * voll.reduce((x, y) => x + y, 0)) / voll.length;
        }
        return NaN;
    };
    // die Krone: das 95. Perzentil des Achs-Abstands ihrer Karten-Ecken × 2
    const ab = [];
    for (const m of r.meshes) if (m.kind === "foliageTex") { const p = f32(m.attrs.position.b64); for (let i = 0; i < p.length; i += 3) ab.push(Math.hypot(p[i], p[i + 2]) * s); }
    ab.sort((x, y) => x - y);
    kb = [0, 2 * ab[Math.floor(ab.length * 0.95)], 0, 0];
    const kr = Math.max(kb[1] - kb[0], kb[3] - kb[2]);
    const d13 = dm(1.3);
    console.log(
        `${art} s${same}: H ${H.toFixed(2)} m · D(0,05) ${dm(0.05).toFixed(3)} · D(0,3) ${dm(0.3).toFixed(3)} · BHD ${d13.toFixed(3)} m · D(3) ${dm(3).toFixed(3)} · D(5) ${dm(5).toFixed(3)} · D(0,5H) ${dm(H * 0.5).toFixed(3)}` +
            ` · H/BHD ${(H / d13).toFixed(1)} · BHD/H ${(d13 / H).toFixed(4)} · Krone ⌀ ${kr.toFixed(2)} m ab ${laubMin.toFixed(2)} m · Krone/BHD ${(kr / d13).toFixed(1)} · Dreiecke Rinde ${tris.bark} Laub ${tris.foliageTex}`
    );
}
