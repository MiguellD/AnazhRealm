// WIP (w25-leib-raum, zieht vor der Abgabe in die Familie diag-mensch-anatomie)
// Probe des Leib-Raums IM OFEN (w25-leib-raum): bakeMenschInstance mit ov.raum liefert Vorlage + Tafel (Beipack raum); jede
// Person = Vorlage + Σ je Achse der stückweise lineare Weg zwischen ihren Knoten. Gegen den direkten Guss der Person (ihr echter
// Haar-Schnitt, kein __kappe) gemessen, Ecke→Fläche und Fläche→Ecke, in mm; dazu ms von Tafel und Guss.
import * as T from "/home/user/AnazhRealm/vendor/three.module.min.js";
import fs from "node:fs";
import vm from "node:vm";
globalThis.THREE = T;
globalThis.self = globalThis;
globalThis.window = globalThis;
const ROOT = "/home/user/AnazhRealm/";
for (const f of ["koerper-core.js", "foundry-core.js"]) vm.runInThisContext(fs.readFileSync(ROOT + f, "utf8"), { filename: f });
const kern = globalThis.__koerperCore;
const LOD = Number(process.argv[2] || 2);
const PERSONEN = Number(process.argv[3] || 6);
const HK = kern.HAAR_KAPPE;
const kap = [0, 1, 2].map((j) => Object.values(HK).map((t) => t[j]));
const spanne = (lo, hi, n) => Array.from({ length: n }, (_, i) => lo + ((hi - lo) * i) / (n - 1));
const ACHSEN = [
    { achse: "mass", knoten: spanne(0, 1, 5) },
    { achse: "tone", knoten: spanne(0, 1, 5) },
    { achse: "age", knoten: spanne(0.05, 0.5, 4) },
    { achse: "gender", knoten: spanne(0.75, 1, 3) },
    { achse: "hairVol", knoten: spanne(0.8, 1.3, 3) },
    { achse: "haaransatz", knoten: spanne(0, 1, 3) },
    ...[0, 1, 2].map((j) => ({ achse: "__kappe" + j, knoten: spanne(Math.min(...kap[j]), Math.max(...kap[j]), 4) })),
];
const mitte = (a) => a.knoten[Math.floor(a.knoten.length / 2)];
const basis = Object.fromEntries(ACHSEN.filter((a) => !a.achse.startsWith("__")).map((a) => [a.achse, (a.knoten[0] + a.knoten[a.knoten.length - 1]) / 2]));
basis.__kappe = [0, 1, 2].map((j) => (Math.min(...kap[j]) + Math.max(...kap[j])) / 2);

const leib = (g) => {
    let m = null;
    g.traverse((o) => { if (o.isMesh && o.geometry && o.geometry.attributes.skinIndex && !m) m = o; });
    const ga = m.geometry;
    return { v: Float64Array.from(ga.attributes.position.array), t: Uint32Array.from(ga.index.array) };
};
let t0 = performance.now();
const GV = bakeMenschInstance(kern, "mensch", 0, LOD, { dials: basis, raum: { achsen: ACHSEN } });
const tafelMs = performance.now() - t0;
const R = GV.userData.__skelett.raum;
const V = leib(GV);
if (R.n !== V.v.length / 3) throw new Error("Tafel " + R.n + " gegen " + V.v.length / 3 + " Ecken");
const slots = R.ziele.length / 3 / R.n;
console.log(`VORLAGE L${LOD}: ${R.n} Ecken, ${V.t.length / 3} Dreiecke, ${slots} Knoten auf ${R.achsen.length} Achsen, Tafel ${(R.ziele.byteLength / 1024).toFixed(0)} KB, Guss+Tafel ${tafelMs.toFixed(0)} ms`);

function vorhersage(d) {
    const P = Float64Array.from(V.v);
    let s0 = 0;
    for (const a of R.achsen) {
        const K = a.knoten;
        const x = Math.max(K[0], Math.min(K[K.length - 1], d[a.achse]));
        let j = 0;
        while (j < K.length - 2 && x > K[j + 1]) j++;
        const u = (x - K[j]) / (K[j + 1] - K[j]);
        for (let i = 0; i < R.n; i++)
            for (let c = 0; c < 3; c++) {
                const o0 = (i * slots + s0 + j) * 3 + c, o1 = o0 + 3;
                P[i * 3 + c] += (1 - u) * R.ziele[o0] + u * R.ziele[o1];
            }
        s0 += K.length;
    }
    return P;
}
// der Weg der Vorlage selbst (alle Achsen an der Vorlage) muss 0 sein — die Tafel trägt am Mittel-Knoten die Vorlage
function abstand(P, M) {
    const { v, t } = M, tri = new T.Triangle(), pt = new T.Vector3(), o = new T.Vector3(), d = [];
    for (let i = 0; i < P.length; i += 3) {
        pt.set(P[i], P[i + 1], P[i + 2]);
        let best = Infinity;
        for (let f = 0; f < t.length; f += 3) {
            tri.a.fromArray(v, t[f] * 3); tri.b.fromArray(v, t[f + 1] * 3); tri.c.fromArray(v, t[f + 2] * 3);
            tri.closestPointToPoint(pt, o);
            const q = o.distanceToSquared(pt);
            if (q < best) best = q;
        }
        d.push(Math.sqrt(best) * 1000);
    }
    d.sort((a, b) => a - b);
    return { mittel: +(d.reduce((a, b) => a + b, 0) / d.length).toFixed(1), p95: +d[Math.floor(0.95 * d.length)].toFixed(1), max: +d[d.length - 1].toFixed(1) };
}
let s = 4242;
const Z = () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
const schnitte = Object.keys(HK);
const E_M = (8 * 0.2125) / 6; // Meter je Lab-Einheit (der Guss steht in E, H = 6)
const mm = (a) => ({ mittel: +(a.mittel * E_M).toFixed(1), p95: +(a.p95 * E_M).toFixed(1), max: +(a.max * E_M).toFixed(1) });
const zufallsDials = () => {
    const d = {};
    for (const a of ACHSEN) if (!a.achse.startsWith("__")) d[a.achse] = a.knoten[0] + (a.knoten[a.knoten.length - 1] - a.knoten[0]) * Z();
    return Object.assign(d, { hairStyle: schnitte[Math.floor(Z() * schnitte.length)] });
};
// heute: 8 Gestalten einer Siedlung aus derselben Verteilung, je ein Guss
const typen = Array.from({ length: 8 }, () => leib(bakeMenschInstance(kern, "mensch", 0, LOD, { dials: zufallsDials() })));
const zeilen = [];
for (let p = 0; p < PERSONEN; p++) {
    const d = zufallsDials();
    const schnitt = d.hairStyle;
    t0 = performance.now();
    const G = leib(bakeMenschInstance(kern, "mensch", 0, LOD, { dials: d }));
    const gussMs = performance.now() - t0;
    const t = HK[schnitt];
    for (let j = 0; j < 3; j++) d["__kappe" + j] = t[j];
    t0 = performance.now();
    const P = vorhersage(d);
    const raumMs = performance.now() - t0;
    let typ = null;
    for (const ty of typen) { const a = abstand(ty.v, G); if (!typ || a.mittel < typ.mittel) typ = a; }
    const z = { schnitt, raumMm: mm(abstand(P, G)), heuteBesterTypMm: mm(typ), vorlageMm: mm(abstand(V.v, G)), gussMs: Math.round(gussMs), raumMs: +raumMs.toFixed(2) };
    zeilen.push(z);
    console.log(`PERSON ${p}: ` + JSON.stringify(z));
}
console.log("ERGEBNIS " + JSON.stringify({ lod: LOD, ecken: R.n, tafelKB: Math.round(R.ziele.byteLength / 1024), tafelMs: Math.round(tafelMs), zeilen }));
