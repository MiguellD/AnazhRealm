// WIP (w25-leib-raum, zieht vor der Abgabe in die Familie diag-mensch-anatomie): Re-Fit-Probe des Leib-Raums: der Mengen-Leib (Stufe 2) als Vorlage an Mittel-Dials, je Person die Ecken der
// Vorlage mit den Primitiven getragen und per Newton auf das Nullniveau des neuen smin-Felds projiziert (dieselben Primitive,
// dasselbe smin wie `__tierFeld`). Gemessen gegen den direkten Guss: Treue (mm), Linearität der Formziele, ms je Person.
import * as T from "/home/user/AnazhRealm/vendor/three.module.min.js";
import fs from "node:fs";
import vm from "node:vm";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);

globalThis.THREE = T;
globalThis.self = globalThis;
globalThis.window = globalThis;
const ROOT = "/home/user/AnazhRealm/";
vm.runInThisContext(fs.readFileSync(ROOT + "koerper-core.js", "utf8"), { filename: "koerper-core.js" });
vm.runInThisContext(fs.readFileSync(ROOT + "foundry-core.js", "utf8"), { filename: "foundry-core.js" });
const kern = globalThis.__koerperCore;
const MM = MENSCH_MENGE;
const PERSONEN = Number(process.argv[2] || 6);

const DIALS = [
    ["height", 0.03, 0.92, 1.08],
    ["mass", 0.1, 0, 1],
    ["tone", 0.1, 0, 1],
    ["age", 0.1, 0.05, 0.5],
    ["gender", 0.1, 0.75, 1],
    ["hairVol", 0.05, 0.8, 1.3],
    ["haaransatz", 0.1, 0, 1],
    ["auge", 0.1, 0, 1],
    ["mund", 0.1, 0, 1],
];
const SPREIZ = { arm1: 1.05, "arm-1": -1.05, hip1: 0.14, "hip-1": -0.14 };
const skinJoints = ["mensch", "torso", "head", "arm1", "arm-1", "elbow1", "elbow-1", "hand1", "hand-1", "hip1", "hip-1", "knee1", "knee-1", "ankle1", "ankle-1"];

// der Leib der Menge wie im Ofen (bakeMenschInstance, Stufe 2): Teile-Baum, Dials, Shorts, Spreiz-Pose, `__mengenLeib`
function leibVon(dialsOv, giessen) {
    const dials = Object.assign({}, kern.START_PARAMS, dialsOv);
    const mats = {};
    const matFuer = (k) => mats[k] || (mats[k] = Object.assign(new T.MeshStandardMaterial(), { userData: { __klasse: k } }));
    const F = {
        gruppe: () => new T.Group(),
        kugel: (r, k, sc) => {
            if (k === "cornea") return new T.Group();
            const m = new T.Mesh(new T.SphereGeometry(r, 6, 4), matFuer(k));
            if (sc) m.scale.set(sc[0], sc[1], sc[2]);
            return m;
        },
        zylinder: (rt, rb, h, k) => new T.Mesh(new T.CylinderGeometry(rt, rb, h, 6, 1), matFuer(k)),
    };
    const B = kern.bauMensch(F);
    kern.morphAuf(B, dials);
    for (const pn of ["pelvis", "glute1", "glute-1"]) if (B.parts[pn] && B.parts[pn].material) B.parts[pn].material = matFuer("shorts");
    const namen = new Map([[B.character, "mensch"]]);
    for (const n of skinJoints.slice(1)) if (B.parts[n]) namen.set(B.parts[n], n);
    const gelenkVon = (node) => {
        for (let c = node; c; c = c.parent) if (namen.has(c)) return namen.get(c);
        return "mensch";
    };
    for (const jn of Object.keys(SPREIZ)) if (B.parts[jn]) B.parts[jn].rotation.z += SPREIZ[jn];
    B.character.updateMatrixWorld(true);
    // die Reihenfolge des Baums ist die Identität eines Primitivs über alle Dials
    const ti = new Map();
    let i = 0;
    B.character.traverse((o) => o.isMesh && ti.set(o, i++));
    if (!giessen) {
        // nur die Primitive (dieselbe Rechnung wie `__mengenLeib` vor dem Feld: Kappen, Klassen, Zonen-Auflage)
        const L = __mengenLeibPrims(B, dials, matFuer, gelenkVon);
        for (const p of L) p.ti = ti.get(p.node);
        return { prims: L };
    }
    const t0 = performance.now();
    const r = __mengenLeib(kern, B, dials, matFuer, gelenkVon, skinJoints, false, 1700);
    const ms = performance.now() - t0;
    for (const p of r.prims) p.ti = ti.get(p.node);
    const g = r.mesh.geometry;
    return { prims: r.prims, v: Float64Array.from(g.attributes.position.array), t: Uint32Array.from(g.index.array), ms };
}

// `__mengenLeib` bis vor das Feld (die Primitive samt Zonen-Auflage), ohne Guss
function __mengenLeibPrims(B, dials, matFuer, gelenkVon) {
    const kopf = B.parts.head;
    const kappen = kern.haarKappe(dials).map((k) => {
        const m = new T.Mesh(new T.SphereGeometry(k.r, 8, 6), matFuer("haarKappe"));
        m.position.set(k.c[0], k.c[1], k.c[2]);
        m.scale.set(k.sc[0], k.sc[1], k.sc[2]);
        kopf.add(m);
        return m;
    });
    B.character.updateMatrixWorld(true);
    const prims = __tierPrims(B.character, B.character, () => true, MM.vox, MM.blend, gelenkVon, MM.klassen, true);
    const zonen = kern.kleidZonen(dials) || [];
    const teilVon = new Map();
    for (const nm of Object.keys(B.parts)) if (B.parts[nm] && !teilVon.has(B.parts[nm])) teilVon.set(B.parts[nm], nm);
    const gruppen = new Set();
    for (const z of zonen) for (const t of z.teile || []) if (B.parts[t] && !B.parts[t].isMesh) gruppen.add(t);
    for (const p of prims) {
        p.teil = teilVon.has(p.node) ? teilVon.get(p.node) : null;
        for (let c = p.node.parent; p.teil === null && c; c = c.parent) if (gruppen.has(teilVon.get(c))) p.teil = teilVon.get(c);
    }
    const benannt = prims.filter((p) => p.teil !== null);
    for (const p of prims) {
        if (p.teil !== null) continue;
        let bd = Infinity;
        for (const q of benannt) {
            const d = (q.c[0] - p.c[0]) ** 2 + (q.c[1] - p.c[1]) ** 2 + (q.c[2] - p.c[2]) ** 2;
            if (d < bd) [bd, p.teil] = [d, q.teil];
        }
    }
    for (const p of prims) {
        const kl = p.node.material.userData.__klasse;
        p.zone = kl === "haarKappe" ? 1 : 0;
        if (kl !== "haarKappe" && kl !== "lips")
            for (let i = 0; i < zonen.length && p.zone === 0; i++) if ((zonen[i].teile || []).includes(p.teil)) p.zone = 2 + i;
        if (p.zone >= 2) {
            const z = zonen[p.zone - 2];
            const auf = z.dicke > 0 ? z.dicke : z.abstand || 0;
            p.auf += auf;
            p.ext += auf;
            if (!(z.dicke > 0) && !z.sohle) [p.blend, p.ext] = [MM.fall, p.ext + MM.fall - MM.blend];
        }
    }
    for (const m of kappen) kopf.remove(m);
    return prims;
}

// das smin-Feld der Primitive an einem Punkt (wie `__tierFeld`, ohne Raster)
function feld(prims, x, y, z) {
    let a = 8 * MM.vox;
    for (const p of prims) {
        const bl = p.blend || MM.blend;
        const b = __tierAbstand(p, x, y, z);
        const dab = Math.abs(a - b);
        if (dab >= bl) {
            if (b < a) a = b;
            continue;
        }
        const h = (bl - dab) / bl;
        a = Math.min(a, b) - h * h * bl * 0.25;
    }
    return a;
}

// Re-Fit: jede Ecke mit den Primitiven getragen (Gewicht nach ihrem Abstand), dann per Newton auf das Nullniveau des neuen Felds
function refit(V, P0, P1) {
    const nach = new Map(P1.map((p) => [p.ti, p]));
    const paare = P0.filter((p) => nach.has(p.ti)).map((p) => {
        const q = nach.get(p.ti);
        const M1 = new T.Matrix4().fromArray(Array.from(q.Mi)).invert();
        const A = new T.Matrix4().multiplyMatrices(M1, new T.Matrix4().fromArray(Array.from(p.Mi))); // Welt0 → Welt1
        return { p, A: A.elements };
    });
    const out = new Float64Array(V.length);
    const s = 0.03;
    for (let i = 0; i < V.length; i += 3) {
        const x = V[i], y = V[i + 1], z = V[i + 2];
        let W = 0, nx = 0, ny = 0, nz = 0;
        let dmin = Infinity;
        const ds = paare.map(({ p }) => {
            const d = Math.max(0, __tierAbstand(p, x, y, z));
            if (d < dmin) dmin = d;
            return d;
        });
        for (let k = 0; k < paare.length; k++) {
            const w = Math.exp(-(ds[k] - dmin) / s);
            if (w < 1e-4) continue;
            const e = paare[k].A;
            nx += w * (e[0] * x + e[4] * y + e[8] * z + e[12]);
            ny += w * (e[1] * x + e[5] * y + e[9] * z + e[13]);
            nz += w * (e[2] * x + e[6] * y + e[10] * z + e[14]);
            W += w;
        }
        let px = nx / W, py = ny / W, pz = nz / W;
        const h = 1e-3;
        for (let it = 0; it < 8; it++) {
            const f = feld(P1, px, py, pz);
            if (Math.abs(f) < 1e-4) break;
            const gx = (feld(P1, px + h, py, pz) - feld(P1, px - h, py, pz)) / (2 * h);
            const gy = (feld(P1, px, py + h, pz) - feld(P1, px, py - h, pz)) / (2 * h);
            const gz = (feld(P1, px, py, pz + h) - feld(P1, px, py, pz - h)) / (2 * h);
            const g2 = gx * gx + gy * gy + gz * gz;
            if (!(g2 > 1e-12)) break;
            let st = f / g2;
            const L = Math.abs(st) * Math.sqrt(g2);
            if (L > 0.05) st *= 0.05 / L;
            px -= st * gx; py -= st * gy; pz -= st * gz;
        }
        out[i] = px; out[i + 1] = py; out[i + 2] = pz;
    }
    return out;
}

// Abstand Punkte → Fläche (Raster über die Dreiecke), in mm
function abstand(P, M) {
    const { v, t } = M;
    const lo = [Infinity, Infinity, Infinity], hi = [-Infinity, -Infinity, -Infinity];
    for (let i = 0; i < v.length; i += 3) for (let d = 0; d < 3; d++) { lo[d] = Math.min(lo[d], v[i + d]); hi[d] = Math.max(hi[d], v[i + d]); }
    const zel = 0.05, n = lo.map((l, d) => Math.max(1, Math.ceil((hi[d] - l) / zel) + 1));
    const R = new Map(), key = (a, b, c) => a + n[0] * (b + n[1] * c), zi = (x, d) => Math.max(0, Math.min(n[d] - 1, Math.floor((x - lo[d]) / zel)));
    for (let f = 0; f < t.length; f += 3) {
        const mn = [0, 1, 2].map((d) => zi(Math.min(v[t[f] * 3 + d], v[t[f + 1] * 3 + d], v[t[f + 2] * 3 + d]), d));
        const mx = [0, 1, 2].map((d) => zi(Math.max(v[t[f] * 3 + d], v[t[f + 1] * 3 + d], v[t[f + 2] * 3 + d]), d));
        for (let a = mn[0]; a <= mx[0]; a++) for (let b = mn[1]; b <= mx[1]; b++) for (let c = mn[2]; c <= mx[2]; c++) { const k = key(a, b, c); (R.get(k) || R.set(k, []).get(k)).push(f); }
    }
    const tri = new T.Triangle(), pt = new T.Vector3(), o = new T.Vector3();
    const d = [];
    for (let i = 0; i < P.length; i += 3) {
        pt.set(P[i], P[i + 1], P[i + 2]);
        const c = [zi(P[i], 0), zi(P[i + 1], 1), zi(P[i + 2], 2)];
        let best = Infinity;
        for (let r = 0; r < 40; r++) {
            for (let a = c[0] - r; a <= c[0] + r; a++) for (let b = c[1] - r; b <= c[1] + r; b++) for (let cc = c[2] - r; cc <= c[2] + r; cc++) {
                if (Math.max(Math.abs(a - c[0]), Math.abs(b - c[1]), Math.abs(cc - c[2])) !== r) continue;
                const L = R.get(key(a, b, cc));
                if (!L) continue;
                for (const f of L) {
                    tri.a.fromArray(v, t[f] * 3); tri.b.fromArray(v, t[f + 1] * 3); tri.c.fromArray(v, t[f + 2] * 3);
                    tri.closestPointToPoint(pt, o);
                    best = Math.min(best, o.distanceToSquared(pt));
                }
            }
            if (best < Infinity && Math.sqrt(best) < (r - 1) * zel) break;
        }
        d.push(Math.sqrt(best) * 1000);
    }
    d.sort((a, b) => a - b);
    return { mittel: +(d.reduce((a, b) => a + b, 0) / d.length).toFixed(1), p95: +d[Math.floor(0.95 * d.length)].toFixed(1), max: +d[d.length - 1].toFixed(1) };
}

let s = 20251108;
const R = () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
const basis = Object.fromEntries(DIALS.map(([k, , lo, hi]) => [k, (lo + hi) / 2]));
const V0 = leibVon(basis, true);
console.log(`VORLAGE: ${V0.v.length / 3} Ecken, ${V0.t.length / 3} Dreiecke, ${V0.prims.length} Primitive, Guss ${V0.ms.toFixed(0)} ms`);
const ziele = [];
const N0 = refit(V0.v, V0.prims, V0.prims); // die Vorlage auf ihr eigenes Feld: der Versatz Raster ↔ analytisch
const delta = (W) => { const o = Float64Array.from(V0.v); for (let i = 0; i < o.length; i++) o[i] += W[i] - N0[i]; return o; };
for (const [k, dd] of DIALS) {
    const P = leibVon(Object.assign({}, basis, { [k]: basis[k] + dd }), false).prims;
    const t0 = performance.now();
    const W = delta(refit(V0.v, V0.prims, P));
    const Z = new Float64Array(W.length);
    let mx = 0;
    for (let i = 0; i < Z.length; i++) Z[i] = W[i] - V0.v[i];
    for (let i = 0; i < Z.length; i += 3) mx = Math.max(mx, Math.hypot(Z[i], Z[i + 1], Z[i + 2]));
    ziele.push({ k, dd, Z });
    console.log(`FORMZIEL ${k} +${dd}: größte Verschiebung ${(mx * 1000).toFixed(1)} mm, Re-Fit ${(performance.now() - t0).toFixed(0)} ms`);
}
// die heutigen 8 Gestalten einer Siedlung: 8 Dial-Sätze aus derselben Verteilung, je ein Guss
const typen = [];
for (let g = 0; g < 8; g++) typen.push(leibVon(Object.fromEntries(DIALS.map(([k, , lo, hi]) => [k, lo + (hi - lo) * R()])), true));
const erg = [];
for (let p = 0; p < PERSONEN; p++) {
    const d = Object.fromEntries(DIALS.map(([k, , lo, hi]) => [k, lo + (hi - lo) * R()]));
    const G = leibVon(d, true);
    const P = leibVon(d, false).prims;
    const t0 = performance.now();
    const F = delta(refit(V0.v, V0.prims, P));
    const msFit = performance.now() - t0;
    const L = Float64Array.from(V0.v);
    for (const z of ziele) {
        const b = (d[z.k] - basis[z.k]) / z.dd;
        for (let i = 0; i < L.length; i++) L[i] += b * z.Z[i];
    }
    // das getrennte Modell: je Dial sein eigener Re-Fit-Verlauf (nur dieser Dial auf den Wert der Person), summiert
    const S = Float64Array.from(V0.v);
    for (const [k] of DIALS) {
        const Pk = leibVon(Object.assign({}, basis, { [k]: d[k] }), false).prims;
        const Wk = delta(refit(V0.v, V0.prims, Pk));
        for (let i = 0; i < S.length; i++) S[i] += Wk[i] - V0.v[i];
    }
    // heute: die geometrisch beste der 8 Gestalten (optimistisch: das Spiel wählt nach dem Genom, nicht nach der Fläche)
    let typBest = null;
    for (const ty of typen) { const a = abstand(ty.v, G); if (!typBest || a.mittel < typBest.mittel) typBest = a; }
    const zeile = {
        heuteBesterTyp: typBest,
        getrennt: abstand(S, G), getrenntRueck: abstand(G.v, { v: S, t: V0.t }),
        roh: abstand(V0.v, G),
        fit: abstand(F, G), fitRueck: abstand(G.v, { v: F, t: V0.t }),
        linear: abstand(L, G), linearRueck: abstand(G.v, { v: L, t: V0.t }),
        gussMs: Math.round(G.ms), fitMs: Math.round(msFit),
    };
    erg.push(zeile);
    console.log(`PERSON ${p}: ` + JSON.stringify(zeile));
}
console.log("ERGEBNIS " + JSON.stringify(erg));
