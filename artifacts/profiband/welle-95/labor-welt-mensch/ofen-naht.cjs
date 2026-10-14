// K45-2 Ofen-Naht-Sonde: der Mensch-Guss (foundry-core BAKERS_BY_KIND.koerper, Saat 0) in node, je Stufe die Dreiecke,
// der sha256 der Bytes und DIE NAHT zwischen Haut und Stoff in den sechs ROM-Posen des Labors (ruhe · guard · punch ·
// jubel · hocke · kick, koerperstudio `_romTest`): je Stoff-Vertex (Oberteil, Hose) der Versatz gegen das Haut-Feld an
// derselben Stelle (Drift = |LBS(Stoff-Gewichte) − LBS(Haut-Gewichte der 4 nächsten Haut-Ecken)|, Lab-Einheiten) und
// DURCHSTOSS = Haut-Ecken, die in der Ruhe im Stoff liegen und in der Pose aus ihm treten (Strahl-Parität gegen die
// posierte Stoff-Hülle). node ofen-naht.cjs <wurzel> [--json datei]
"use strict";
const fs = require("fs"),
    vm = require("vm"),
    path = require("path"),
    crypto = require("crypto");
const ROOT = path.resolve(process.argv[2] || ".");
const JSON_OUT = process.argv.indexOf("--json") > 0 ? process.argv[process.argv.indexOf("--json") + 1] : null;
const sb = { console, Math, performance: { now: () => Date.now() }, setTimeout, clearTimeout };
sb.self = sb;
sb.globalThis = sb;
sb.window = sb;
vm.createContext(sb);
for (const f of ["worlds/terrain/lib/three-r128.min.js", "koerper-core.js", "tetrapoda-core.js", "foundry-core.js"])
    vm.runInContext(fs.readFileSync(path.join(ROOT, f), "utf8"), sb, { filename: f });
const T = sb.THREE,
    K = sb.__koerperCore;

function baum(sk) {
    const teile = {},
        root = new T.Group();
    for (const j of sk.joints) {
        const b = new T.Bone();
        b.name = j.name;
        teile[j.name] = b;
    }
    for (const j of sk.joints) {
        const b = teile[j.name];
        if (j.parent && teile[j.parent]) teile[j.parent].add(b);
        else if (j.name === sk.root) root.add(b);
        else (teile[sk.root] || root).add(b);
        b.position.fromArray(j.pos);
        b.quaternion.fromArray(j.quat);
        b.scale.fromArray(j.scale);
    }
    return { root, teile };
}

function guss(lod, dials) {
    const g = sb.BAKERS_BY_KIND.koerper(K, "mensch", 0, lod, { dials });
    const sk = g.userData.__skelett;
    const h = crypto.createHash("sha256");
    let tris = 0;
    for (const m of g.children) {
        const geo = m.geometry;
        for (const a of Object.keys(geo.attributes).sort())
            h.update(Buffer.from(geo.attributes[a].array.buffer, geo.attributes[a].array.byteOffset, geo.attributes[a].array.byteLength));
        h.update(Buffer.from(geo.index.array.buffer, geo.index.array.byteOffset, geo.index.array.byteLength));
        tris += geo.index.count / 3;
    }
    return { g, sk, tris, sha: h.digest("hex").slice(0, 16) };
}

// Weltlage der Ecken je Hülle in der aktuellen Pose (LBS über die Bones), die Ruhe als Bind
function welt(mesh, bones, inv0, w, gew) {
    const pa = mesh.geometry.attributes.position,
        si = mesh.geometry.attributes.skinIndex.array,
        sw = (gew || mesh.geometry.attributes.skinWeight.array);
    const out = new Float32Array(pa.count * 3);
    const M = bones.map((b, i) => new T.Matrix4().multiplyMatrices(b.matrixWorld, inv0[i]));
    const v = new T.Vector3(),
        a = new T.Vector3(),
        t = new T.Vector3();
    for (let i = 0; i < pa.count; i++) {
        v.fromBufferAttribute(pa, i).applyMatrix4(w);
        a.set(0, 0, 0);
        for (let k = 0; k < 4; k++) {
            const ww = sw[i * 4 + k];
            if (!ww) continue;
            t.copy(v).applyMatrix4(M[si[i * 4 + k]]);
            a.addScaledVector(t, ww);
        }
        out[i * 3] = a.x;
        out[i * 3 + 1] = a.y;
        out[i * 3 + 2] = a.z;
    }
    return out;
}

// Strahl +x gegen die Dreiecke (Parität), Dreiecke je (y,z)-Zelle
// DIE DECKUNG (Blick von außen): von der Haut-Ecke entlang ihrer (posierten) Normale nach außen — trifft der Strahl binnen
// REICH den Stoff, deckt er sie; sonst sieht man die Haut (Durchstoß). Robust gegen Falten (keine Parität).
const REICH = 0.35;
function normalen(P, idx) {
    const N = new Float32Array(P.length);
    for (let t = 0; t < idx.length; t += 3) {
        const a = idx[t] * 3,
            b = idx[t + 1] * 3,
            c = idx[t + 2] * 3;
        const ux = P[b] - P[a],
            uy = P[b + 1] - P[a + 1],
            uz = P[b + 2] - P[a + 2],
            vx = P[c] - P[a],
            vy = P[c + 1] - P[a + 1],
            vz = P[c + 2] - P[a + 2];
        const nx = uy * vz - uz * vy,
            ny = uz * vx - ux * vz,
            nz = ux * vy - uy * vx;
        for (const o of [a, b, c]) {
            N[o] += nx;
            N[o + 1] += ny;
            N[o + 2] += nz;
        }
    }
    for (let i = 0; i < N.length; i += 3) {
        const l = Math.hypot(N[i], N[i + 1], N[i + 2]) || 1;
        N[i] /= l;
        N[i + 1] /= l;
        N[i + 2] /= l;
    }
    return N;
}
function deckTester(P, idx) {
    const C = 0.1,
        zellen = new Map();
    for (let t = 0; t < idx.length; t += 3) {
        const lo = [1e9, 1e9, 1e9],
            hi = [-1e9, -1e9, -1e9];
        for (let k = 0; k < 3; k++) for (let d = 0; d < 3; d++) {
            const v = P[idx[t + k] * 3 + d];
            lo[d] = Math.min(lo[d], v);
            hi[d] = Math.max(hi[d], v);
        }
        for (let a = Math.floor(lo[0] / C); a <= Math.floor(hi[0] / C); a++)
            for (let b = Math.floor(lo[1] / C); b <= Math.floor(hi[1] / C); b++)
                for (let c = Math.floor(lo[2] / C); c <= Math.floor(hi[2] / C); c++) {
                    const k = a + "_" + b + "_" + c;
                    if (!zellen.has(k)) zellen.set(k, []);
                    zellen.get(k).push(t);
                }
    }
    return (o, d) => {
        const e = [o[0] + d[0] * REICH, o[1] + d[1] * REICH, o[2] + d[2] * REICH];
        const gesehen = new Set();
        for (let a = Math.floor(Math.min(o[0], e[0]) / C); a <= Math.floor(Math.max(o[0], e[0]) / C); a++)
            for (let b = Math.floor(Math.min(o[1], e[1]) / C); b <= Math.floor(Math.max(o[1], e[1]) / C); b++)
                for (let c = Math.floor(Math.min(o[2], e[2]) / C); c <= Math.floor(Math.max(o[2], e[2]) / C); c++) {
                    const L = zellen.get(a + "_" + b + "_" + c);
                    if (!L) continue;
                    for (const t of L) {
                        if (gesehen.has(t)) continue;
                        gesehen.add(t);
                        // Möller-Trumbore
                        const i0 = idx[t] * 3,
                            i1 = idx[t + 1] * 3,
                            i2 = idx[t + 2] * 3;
                        const e1 = [P[i1] - P[i0], P[i1 + 1] - P[i0 + 1], P[i1 + 2] - P[i0 + 2]],
                            e2 = [P[i2] - P[i0], P[i2 + 1] - P[i0 + 1], P[i2 + 2] - P[i0 + 2]];
                        const p = [d[1] * e2[2] - d[2] * e2[1], d[2] * e2[0] - d[0] * e2[2], d[0] * e2[1] - d[1] * e2[0]];
                        const det = e1[0] * p[0] + e1[1] * p[1] + e1[2] * p[2];
                        if (Math.abs(det) < 1e-12) continue;
                        const s = [o[0] - P[i0], o[1] - P[i0 + 1], o[2] - P[i0 + 2]];
                        const u = (s[0] * p[0] + s[1] * p[1] + s[2] * p[2]) / det;
                        if (u < 0 || u > 1) continue;
                        const q = [s[1] * e1[2] - s[2] * e1[1], s[2] * e1[0] - s[0] * e1[2], s[0] * e1[1] - s[1] * e1[0]];
                        const v = (d[0] * q[0] + d[1] * q[1] + d[2] * q[2]) / det;
                        if (v < 0 || u + v > 1) continue;
                        const tt = (e2[0] * q[0] + e2[1] * q[1] + e2[2] * q[2]) / det;
                        if (tt >= 0 && tt <= REICH) return true;
                    }
                }
        return false;
    };
}
function innenTester(P, idx) {
    const C = 0.08,
        zellen = new Map();
    for (let t = 0; t < idx.length; t += 3) {
        let y0 = 1e9,
            y1 = -1e9,
            z0 = 1e9,
            z1 = -1e9;
        for (let k = 0; k < 3; k++) {
            const y = P[idx[t + k] * 3 + 1],
                z = P[idx[t + k] * 3 + 2];
            y0 = Math.min(y0, y);
            y1 = Math.max(y1, y);
            z0 = Math.min(z0, z);
            z1 = Math.max(z1, z);
        }
        for (let a = Math.floor(y0 / C); a <= Math.floor(y1 / C); a++)
            for (let b = Math.floor(z0 / C); b <= Math.floor(z1 / C); b++) {
                const k = a + "_" + b;
                if (!zellen.has(k)) zellen.set(k, []);
                zellen.get(k).push(t);
            }
    }
    return (x, y, z) => {
        const L = zellen.get(Math.floor(y / C) + "_" + Math.floor(z / C));
        if (!L) return false;
        let n = 0;
        for (const t of L) {
            const a = idx[t] * 3,
                b = idx[t + 1] * 3,
                c = idx[t + 2] * 3;
            // Schnitt der Geraden (y,z) mit dem Dreieck in der yz-Projektion, dann x des Schnittpunkts > x
            const ay = P[a + 1] - y,
                az = P[a + 2] - z,
                by = P[b + 1] - y,
                bz = P[b + 2] - z,
                cy = P[c + 1] - y,
                cz = P[c + 2] - z;
            const w0 = by * cz - bz * cy,
                w1 = cy * az - cz * ay,
                w2 = ay * bz - az * by;
            if (!((w0 >= 0 && w1 >= 0 && w2 >= 0) || (w0 <= 0 && w1 <= 0 && w2 <= 0))) continue;
            const s = w0 + w1 + w2;
            if (!s) continue;
            const px = (w0 * P[a] + w1 * P[b] + w2 * P[c]) / s;
            if (px > x) n++;
        }
        return n % 2 === 1;
    };
}

const POSEN = [
    ["bind", {}],
    ["ruhe", { aZ: 0.1, aX: 0.05, el: 0.14 }],
    ["guard", { aZ: 0.14, aX: -0.45, el: 1.35 }],
    ["punch", { aZ: 0.15, aX: -1.05, el: 0.1 }],
    ["jubel", { aZ: 2.1, aX: -0.3, el: 0.5 }],
    ["hocke", { aZ: 0.12, aX: 0.05, el: 0.2, hX: -0.85, kX: 1.35, hZ: 0.1 }],
    ["kick", { aZ: 0.3, aX: -0.25, el: 0.6, hX: -1.35, kX: 0.15, hZ: 0.06, one: true }],
];

function naht(lod, dials) {
    const G = guss(lod, dials);
    const { root, teile } = baum(G.sk);
    const bones = G.sk.skinJoints.map((n) => teile[n]);
    const huellen = G.g.children.filter((m) => m.geometry.attributes.skinIndex);
    for (const m of huellen) (teile[m.userData.__assetJoint] || root).add(m);
    root.updateMatrixWorld(true);
    const inv0 = bones.map((b) => new T.Matrix4().copy(b.matrixWorld).invert());
    const W = huellen.map((m) => m.matrixWorld.clone());
    const kl = (m) => m.material.userData.__klasse;
    const haut = huellen.find((m) => kl(m) === "haut" && m.userData.__assetJoint === G.sk.root);
    // die Stoffe in der Reihenfolge der Kleid-Zonen (Oberteil, Hose, Schuh) — der Schuh nimmt nicht teil
    const zonen = K.kleidZonen(Object.assign({}, K.START_PARAMS, dials));
    const stoffe = [];
    for (const z of zonen) {
        if (z.teile.length === 2 && z.teile[0] === "ankle1") continue;
        const km = "stoff_" + (z.hex >>> 0).toString(16);
        const m = huellen.find((h) => kl(h) === km);
        if (m) stoffe.push({ m, z });
    }
    const hI = huellen.indexOf(haut);
    // DIE BAU-POSE (foundry-core bakeMenschInstance SPREIZ): Arme ±1,05, Hüften ±0,14 um z — dort entstanden Haut und Stoff,
    // dort liegt die Haut unter ihrem Stoff (hängende Arme berühren das Hemd nur, sie liegen nicht unter ihm)
    const SPREIZ = { arm1: 1.05, "arm-1": -1.05, hip1: 0.14, "hip-1": -0.14 };
    for (const [n, w] of Object.entries(SPREIZ)) teile[n].rotation.z += w;
    root.updateMatrixWorld(true);
    const hautRuhe = welt(haut, bones, inv0, W[hI]);
    // je Stoff-Ecke die 4 nächsten Haut-Ecken (Ruhe) → das Haut-Gewicht an der Stelle (1/d², wie die Lab-Vererbung)
    const hsi = haut.geometry.attributes.skinIndex.array,
        hsw = haut.geometry.attributes.skinWeight.array;
    const CELL = 0.1,
        grid = new Map();
    for (let i = 0; i < hautRuhe.length / 3; i++) {
        const k = Math.floor(hautRuhe[i * 3] / CELL) + "_" + Math.floor(hautRuhe[i * 3 + 1] / CELL) + "_" + Math.floor(hautRuhe[i * 3 + 2] / CELL);
        if (!grid.has(k)) grid.set(k, []);
        grid.get(k).push(i);
    }
    const res = { lod, tris: G.tris, sha: G.sha, posen: {} };
    const stoffDaten = stoffe.map(({ m, z }) => {
        const sI = huellen.indexOf(m);
        const ruhe = welt(m, bones, inv0, W[sI]);
        const n = ruhe.length / 3;
        const hw = new Float32Array(n * 4),
            hi = new Float32Array(n * 4),
            nah = new Uint8Array(n);
        for (let i = 0; i < n; i++) {
            const px = ruhe[i * 3],
                py = ruhe[i * 3 + 1],
                pz = ruhe[i * 3 + 2];
            const gx = Math.floor(px / CELL),
                gy = Math.floor(py / CELL),
                gz = Math.floor(pz / CELL);
            const best = [];
            for (let r = 1; r <= 5 && best.length === 0; r += 2)
                for (let dx = -r; dx <= r; dx++)
                    for (let dy = -r; dy <= r; dy++)
                        for (let dz = -r; dz <= r; dz++) {
                            const L = grid.get(gx + dx + "_" + (gy + dy) + "_" + (gz + dz));
                            if (!L) continue;
                            for (const q of L) {
                                const d = (hautRuhe[q * 3] - px) ** 2 + (hautRuhe[q * 3 + 1] - py) ** 2 + (hautRuhe[q * 3 + 2] - pz) ** 2;
                                best.push([d, q]);
                            }
                        }
            if (!best.length) continue;
            best.sort((a, b) => a[0] - b[0]);
            if (best[0][0] > 0.55 * 0.55) continue;
            nah[i] = 1;
            const acc = new Map();
            for (const [d, q] of best.slice(0, 4)) {
                const dw = 1 / (d + 1e-4);
                for (let k = 0; k < 4; k++) if (hsw[q * 4 + k]) acc.set(hsi[q * 4 + k], (acc.get(hsi[q * 4 + k]) || 0) + dw * hsw[q * 4 + k]);
            }
            const e = [...acc].sort((a, b) => b[1] - a[1]).slice(0, 4);
            const s = e.reduce((x, y) => x + y[1], 0);
            e.forEach(([j, w], k) => {
                hi[i * 4 + k] = j;
                hw[i * 4 + k] = w / s;
            });
        }
        return { m, z, sI, ruhe, hw, hi, nah, n };
    });
    // in der Ruhe von einem Stoff bedeckte Haut-Ecken
    const hIdx = haut.geometry.index.array;
    const hautN0 = normalen(hautRuhe, hIdx);
    const bedeckt = stoffDaten.map((s) => {
        const tst = deckTester(s.ruhe, s.m.geometry.index.array);
        const liste = [];
        for (let i = 0; i < hautRuhe.length / 3; i++)
            if (tst([hautRuhe[i * 3], hautRuhe[i * 3 + 1], hautRuhe[i * 3 + 2]], [hautN0[i * 3], hautN0[i * 3 + 1], hautN0[i * 3 + 2]])) liste.push(i);
        return liste;
    });
    for (const [n, w] of Object.entries(SPREIZ)) teile[n].rotation.z -= w;
    root.updateMatrixWorld(true);
    res.hautEcken = hautRuhe.length / 3;
    res.bedeckt = bedeckt.map((l, i) => stoffDaten[i].z.schnitt + ":" + l.length);
    let maxAll = 0;
    const alleDrift = [];
    let durchAll = 0;
    for (const [name, p] of POSEN) {
        const alt = [];
        const st = (o, ax, v) => {
            if (!o) return;
            alt.push([o, ax, o.rotation[ax]]);
            o.rotation[ax] = v;
        };
        for (const sd of name === "bind" ? [] : ["1", "-1"]) {
            const s = sd === "1" ? 1 : -1;
            if (p.one && sd === "-1") continue;
            st(teile["arm" + sd], "z", s * p.aZ);
            st(teile["arm" + sd], "x", p.aX);
            st(teile["elbow" + sd], "x", -p.el);
            if (p.hX !== undefined) {
                st(teile["hip" + sd], "x", p.hX);
                st(teile["hip" + sd], "z", s * (p.hZ || 0));
                st(teile["knee" + sd], "x", p.kX || 0);
            }
        }
        root.updateMatrixWorld(true);
        const hautP = welt(haut, bones, inv0, W[hI]);
        let maxD = 0,
            durch = 0;
        const dl = [];
        stoffDaten.forEach((s, si) => {
            const sp = welt(s.m, bones, inv0, W[s.sI]);
            // Haut-Feld an der Stoff-Stelle: dieselbe Ruhe-Ecke mit den Haut-Gewichten
            const geoH = { geometry: { attributes: { position: s.m.geometry.attributes.position, skinIndex: { array: s.hi } } } };
            const hp = welt(geoH, bones, inv0, W[s.sI], s.hw);
            for (let i = 0; i < s.n; i++) {
                if (!s.nah[i]) continue;
                const d = Math.hypot(sp[i * 3] - hp[i * 3], sp[i * 3 + 1] - hp[i * 3 + 1], sp[i * 3 + 2] - hp[i * 3 + 2]);
                dl.push(d);
                if (d > maxD) maxD = d;
            }
            const tst = deckTester(sp, s.m.geometry.index.array);
            const hN = normalen(hautP, hIdx);
            for (const q of bedeckt[si])
                if (!tst([hautP[q * 3], hautP[q * 3 + 1], hautP[q * 3 + 2]], [hN[q * 3], hN[q * 3 + 1], hN[q * 3 + 2]])) durch++;
        });
        dl.sort((a, b) => a - b);
        const p95 = dl.length ? dl[Math.floor(dl.length * 0.95)] : 0;
        res.posen[name] = { driftMax: +maxD.toFixed(4), driftP95: +p95.toFixed(4), durchstoss: durch };
        alleDrift.push(...dl);
        maxAll = Math.max(maxAll, maxD);
        durchAll += durch;
        for (let u = alt.length - 1; u >= 0; u--) alt[u][0].rotation[alt[u][1]] = alt[u][2];
        root.updateMatrixWorld(true);
    }
    alleDrift.sort((a, b) => a - b);
    res.driftMax = +maxAll.toFixed(4);
    res.driftP95 = +(alleDrift[Math.floor(alleDrift.length * 0.95)] || 0).toFixed(4);
    res.durchstoss = durchAll;
    return res;
}

const t0 = Date.now();
const out = { kopf: null, start: [] };
try {
    out.kopf = require("child_process").execSync("git rev-parse --short HEAD", { cwd: ROOT }).toString().trim();
} catch (_e) {}
for (const lod of [0, 1]) {
    const r = naht(lod, {});
    out.start.push(r);
    console.log(JSON.stringify(r));
}
// die Schnitt-Varianten (Pullover + Shorts, Tank + Hose lang) auf L0
for (const d of [{ top: "pullover", bottom: "shorts" }, { top: "tank", bottom: "pants", shoes: "boot" }]) {
    const r = naht(0, d);
    r.dials = d;
    out.start.push(r);
    console.log(JSON.stringify(r));
}
out.ms = Date.now() - t0;
if (JSON_OUT) fs.writeFileSync(JSON_OUT, JSON.stringify(out, null, 1));
console.log("ms", out.ms);
