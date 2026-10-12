// W zerlegt: je Sonne IoU, fehlende Zellen (L0 wirft, Hülle nicht) je L0-Mesh, überschüssige Zellen (Hülle wirft, L0 nicht) je Hüllen-Teil.
// node w-zerlegung.cjs <worktree> <rezept> [seed]
const path = require("path");
const root = process.argv[2], id = process.argv[3] || "geisttor", seed = Number(process.argv[4] || 7);
global.THREE = require(path.join(root, "worlds/terrain/lib/three-r128.min.js"));
require(path.join(root, "porta-core.js"));
const PC = globalThis.__portaCore;
const R = 0.05;
const SONNEN = [];
for (const h of [25, 40, 60, 74]) for (const az of [0, 120, 240]) {
    const e = (h * Math.PI) / 180, a = (az * Math.PI) / 180;
    SONNEN.push({ name: h + "°/" + az, d: [Math.cos(e) * Math.sin(a), Math.sin(e), Math.cos(e) * Math.cos(a)] });
}
const tri = (o) => {
    const out = [], v = new THREE.Vector3();
    const P = o.geometry.attributes.position, I = o.geometry.index, n = I ? I.count : P.count;
    for (let i = 0; i < n; i++) { v.fromBufferAttribute(P, I ? I.getX(i) : i).applyMatrix4(o.matrixWorld); out.push(v.x, v.y, v.z); }
    return out;
};
function zellen(D, d) {
    const S = new Set();
    const pr = (i) => { const t = Math.max(0, D[i + 1]) / d[1]; return [D[i] - d[0] * t, D[i + 2] - d[2] * t]; };
    const ar = (a, b, c) => (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0]);
    for (let i = 0; i < D.length; i += 9) {
        const P = [pr(i), pr(i + 3), pr(i + 6)];
        const A = ar(P[0], P[1], P[2]);
        if (Math.abs(A) < 1e-12) continue;
        const x0 = Math.floor(Math.min(P[0][0], P[1][0], P[2][0]) / R), x1 = Math.floor(Math.max(P[0][0], P[1][0], P[2][0]) / R);
        const y0 = Math.floor(Math.min(P[0][1], P[1][1], P[2][1]) / R), y1 = Math.floor(Math.max(P[0][1], P[1][1], P[2][1]) / R);
        for (let x = x0; x <= x1; x++) for (let y = y0; y <= y1; y++) {
            const c = [(x + 0.5) * R, (y + 0.5) * R];
            const w0 = ar(P[1], P[2], c) / A, w1 = ar(P[2], P[0], c) / A, w2 = ar(P[0], P[1], c) / A;
            if (w0 >= 0 && w1 >= 0 && w2 >= 0) S.add(x + "," + y);
        }
    }
    return S;
}
const g0 = PC.buildInstance(id, seed, 0); g0.updateMatrixWorld(true);
const L0m = [];
g0.traverse((o) => { if (o.isMesh && o.castShadow) L0m.push({ o, name: (o.name || o.material && o.material.name || "?") , D: tri(o) }); });
const H = PC.huelle(id, seed);
const teile = H.teile;
// je Hüllen-Teil sein Gitter: huelleGruppe je einzelnes Teil
const Tm = teile.map((t, i) => { const g = PC.huelleGruppe([t]); g.updateMatrixWorld(true); let D = []; g.traverse((o) => { if (o.isMesh) D = D.concat(tri(o)); }); return { i, t, D }; });
const nurSonne = process.argv[5] || null;
for (const s of SONNEN) {
    if (nurSonne && s.name !== nurSonne) continue;
    const A = new Set(), B = new Set();
    const aJe = L0m.map((m) => { const z = zellen(m.D, s.d); z.forEach((k) => A.add(k)); return z; });
    const bJe = Tm.map((m) => { const z = zellen(m.D, s.d); z.forEach((k) => B.add(k)); return z; });
    let sch = 0; A.forEach((k) => { if (B.has(k)) sch++; });
    const iou = sch / (A.size + B.size - sch);
    console.log(`${s.name.padEnd(7)} IoU ${iou.toFixed(3)} · L0 ${A.size} · Hülle ${B.size} · fehlt ${A.size - sch} · zuviel ${B.size - sch}`);
    if (!nurSonne && iou > 0.85) continue;
    const fehlt = aJe.map((z, i) => { let n = 0; z.forEach((k) => { if (!B.has(k)) n++; }); return { i, n, tot: z.size }; }).filter((x) => x.n > 0).sort((a, b) => b.n - a.n).slice(0, 8);
    for (const f of fehlt) {
        const m = L0m[f.i]; const bb = new THREE.Box3().setFromObject(m.o); const sz = bb.getSize(new THREE.Vector3());
        console.log(`    fehlt ${String(f.n).padStart(5)} / ${f.tot} — L0 ${m.name} [${m.o.geometry.type}] Größe ${sz.x.toFixed(2)}×${sz.y.toFixed(2)}×${sz.z.toFixed(2)} bei ${bb.min.x.toFixed(2)},${bb.min.y.toFixed(2)},${bb.min.z.toFixed(2)}`);
    }
    const zuviel = bJe.map((z, i) => { let n = 0; z.forEach((k) => { if (!A.has(k)) n++; }); return { i, n, tot: z.size }; }).filter((x) => x.n > 0).sort((a, b) => b.n - a.n).slice(0, 6);
    for (const f of zuviel) { const t = teile[f.i]; console.log(`    zuviel ${String(f.n).padStart(5)} / ${f.tot} — Teil ${f.i} ${t.art} ${t.rolle} ${t.art === "kapsel" ? "r " + t.r.toFixed(3) : "h " + (t.h ? [t.h.x, t.h.y, t.h.z].map((v) => v.toFixed(3)).join("×") : "?")}`); }
}
