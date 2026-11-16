// diag-vehicle-einspur.cjs — DAS SCHNITT-GATE DES EINSPUR-GESETZES (Fahrzeug-Familie neben gate:vehicle-contract).
// Der Leser: vehicle-core `einspurPruefling` — dieselben Teile (`einspurTeile`) und Räder (`einspurRaeder`), die
// `buildInstance` je Stoff faltet und der Foundry-Faden als `fahrzeug_motorrad_*` in die Welt stempelt, hier getaggt und
// ungefaltet. Je Gattung × Kultur (5 × 5) und Feder-Pose (Ruhe · Bremsnick · Squat · beides · Ausfedern) prüft die Linse
// die verbotenen Paare des Entwurfs „ANATOMIE · MOTORRAD": SCHNITT = zwei Dreiecke durchdringen sich (SAT, 11+ Achsen),
// KONTAKT = der zertifizierte Abstand (Punkt↔Dreieck und Kante↔Kante) liegt unter 4 mm. ROT nennt Gattung × Kultur ×
// Paar × Pose. Selbsttest: die Kette einer Zweiarm-Kombination um 30 mm nach innen verschoben MUSS „chain×swing" ROT melden.
//   node scripts/diag-vehicle-einspur.cjs [--selbsttest]
const { studioKern } = require("./lib/welt-boot.cjs");
const VC = studioKern("vehicle-core.js", "__vehicleCore");

const RULES = [
    ["chain", "shock"],
    ["chain", "pipe"],
    ["chain", "swing"],
    ["pipe", "ftube"],
    ["pipe", "swing"],
    ["pipe", "tire"],
    ["pipe", "shock"],
    ["pipe", "fenderR"],
    ["shock", "fenderR"],
    ["shock", "fstay"],
    ["shock", "tire"],
    ["fenderR", "tire"],
    ["fenderR", "ftube"],
    ["fenderR", "plate"],
    ["fenderR", "tail"],
    ["fstay", "tire"],
    ["fstay", "pipe"],
    ["chain", "fstay"],
];
// [federwegV, federwegH] in m, eingefedert > 0 — der Federweg, den der Kern jedem Einspur gibt (EINSPUR_FEDERWEG): Ruhe ·
// Bremsnick · Squat · beides · Ausfedern
const FW = VC.EINSPUR_FEDERWEG;
const POSES = [
    [0, 0],
    [FW.vorn, 0],
    [0, FW.hinten],
    [FW.vorn, FW.hinten],
    [-FW.aus, -FW.aus],
];
const KONTAKT_M = 0.004;

const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cr = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const len = (a) => Math.hypot(a[0], a[1], a[2]);
const d2 = (p, q) => (p[0] - q[0]) ** 2 + (p[1] - q[1]) ** 2 + (p[2] - q[2]) ** 2;
function projTri(t, ax) {
    const a = t[0] * ax[0] + t[1] * ax[1] + t[2] * ax[2],
        b = t[3] * ax[0] + t[4] * ax[1] + t[5] * ax[2],
        c = t[6] * ax[0] + t[7] * ax[1] + t[8] * ax[2];
    return [Math.min(a, b, c), Math.max(a, b, c)];
}
function pts(t) {
    return [
        [t[0], t[1], t[2]],
        [t[3], t[4], t[5]],
        [t[6], t[7], t[8]],
    ];
}
function satTriTri(t1, t2) {
    const P1 = pts(t1),
        P2 = pts(t2);
    const E1 = [sub(P1[1], P1[0]), sub(P1[2], P1[1]), sub(P1[0], P1[2])],
        E2 = [sub(P2[1], P2[0]), sub(P2[2], P2[1]), sub(P2[0], P2[2])];
    const n1 = cr(E1[0], E1[1]),
        n2 = cr(E2[0], E2[1]);
    const axes = [n1, n2];
    for (const a of E1) for (const b of E2) axes.push(cr(a, b));
    if (len(cr(n1, n2)) < 1e-9 * Math.max(len(n1) * len(n2), 1e-30))
        for (const e of E1.concat(E2)) axes.push(cr(n1, e));
    const scale = Math.max(...t1.map(Math.abs), ...t2.map(Math.abs), 1e-30);
    for (const ax of axes) {
        const L = len(ax);
        if (L < 1e-14 * scale * scale) continue;
        const [a0, a1] = projTri(t1, ax),
            [b0, b1] = projTri(t2, ax),
            tol = 1e-10 * L * scale;
        if (a0 > b1 + tol || b0 > a1 + tol) return false;
    }
    return true;
}
function cpTri(p, t) {
    const a = [t[0], t[1], t[2]],
        b = [t[3], t[4], t[5]],
        c = [t[6], t[7], t[8]];
    const ab = sub(b, a),
        ac = sub(c, a),
        ap = sub(p, a);
    const d1 = dot(ab, ap),
        e2 = dot(ac, ap);
    if (d1 <= 0 && e2 <= 0) return a;
    const bp = sub(p, b),
        d3 = dot(ab, bp),
        d4 = dot(ac, bp);
    if (d3 >= 0 && d4 <= d3) return b;
    const vc = d1 * d4 - d3 * e2;
    if (vc <= 0 && d1 >= 0 && d3 <= 0) {
        const v = d1 / (d1 - d3);
        return [a[0] + v * ab[0], a[1] + v * ab[1], a[2] + v * ab[2]];
    }
    const cp = sub(p, c),
        d5 = dot(ab, cp),
        d6 = dot(ac, cp);
    if (d6 >= 0 && d5 <= d6) return c;
    const vb = d5 * e2 - d1 * d6;
    if (vb <= 0 && e2 >= 0 && d6 <= 0) {
        const w = e2 / (e2 - d6);
        return [a[0] + w * ac[0], a[1] + w * ac[1], a[2] + w * ac[2]];
    }
    const va = d3 * d6 - d5 * d4;
    if (va <= 0 && d4 - d3 >= 0 && d5 - d6 >= 0) {
        const w = (d4 - d3) / (d4 - d3 + (d5 - d6));
        return [b[0] + w * (c[0] - b[0]), b[1] + w * (c[1] - b[1]), b[2] + w * (c[2] - b[2])];
    }
    const den = 1 / (va + vb + vc),
        v = vb * den,
        w = vc * den;
    return [a[0] + ab[0] * v + ac[0] * w, a[1] + ab[1] * v + ac[1] * w, a[2] + ab[2] * v + ac[2] * w];
}
function segSeg(p1, q1, p2, q2) {
    const u = sub(q1, p1),
        v = sub(q2, p2),
        r = sub(p1, p2);
    const a = dot(u, u),
        e = dot(v, v),
        f = dot(v, r),
        E = 1e-30;
    let s, t;
    if (a <= E && e <= E) s = t = 0;
    else if (a <= E) {
        s = 0;
        t = Math.min(1, Math.max(0, f / e));
    } else {
        const c = dot(u, r);
        if (e <= E) {
            t = 0;
            s = Math.min(1, Math.max(0, -c / a));
        } else {
            const b = dot(u, v),
                den = a * e - b * b;
            s = den > E ? Math.min(1, Math.max(0, (b * f - c * e) / den)) : 0;
            t = (b * s + f) / e;
            if (t < 0) {
                t = 0;
                s = Math.min(1, Math.max(0, -c / a));
            } else if (t > 1) {
                t = 1;
                s = Math.min(1, Math.max(0, (b - c) / a));
            }
        }
    }
    return d2(
        [p1[0] + u[0] * s, p1[1] + u[1] * s, p1[2] + u[2] * s],
        [p2[0] + v[0] * t, p2[1] + v[1] * t, p2[2] + v[2] * t]
    );
}
function triTriDist2(t1, t2) {
    const P1 = pts(t1),
        P2 = pts(t2);
    let best = Infinity;
    for (const p of P1) best = Math.min(best, d2(p, cpTri(p, t2)));
    for (const p of P2) best = Math.min(best, d2(p, cpTri(p, t1)));
    for (let i = 0; i < 3; i++)
        for (let j = 0; j < 3; j++) best = Math.min(best, segSeg(P1[i], P1[(i + 1) % 3], P2[j], P2[(j + 1) % 3]));
    return best;
}
function bbDist2(a, b) {
    const dx = Math.max(a[0] - b[3], 0, b[0] - a[3]),
        dy = Math.max(a[1] - b[4], 0, b[1] - a[4]),
        dz = Math.max(a[2] - b[5], 0, b[2] - a[5]);
    return dx * dx + dy * dy + dz * dz;
}
// die Suppe eines Tags: Welt-Dreiecke + Boxen je Dreieck und gesamt
function suppen(g) {
    const je = {},
        v = new THREE.Vector3();
    g.traverse((o) => {
        if (!o.isMesh) return;
        let n = o,
            t = null;
        while (n && !t) {
            t = n.userData && n.userData.tag;
            n = n.parent;
        }
        if (!t) return;
        const s = (je[t] = je[t] || {
            tris: [],
            tri: [],
            box: [Infinity, Infinity, Infinity, -Infinity, -Infinity, -Infinity],
        });
        const p = o.geometry.attributes.position,
            idx = o.geometry.index;
        const N = idx ? idx.count : p.count;
        const w = [];
        for (let i = 0; i < p.count; i++) {
            v.fromBufferAttribute(p, i).applyMatrix4(o.matrixWorld);
            w.push(v.x, v.y, v.z);
        }
        for (let i = 0; i < N; i += 3) {
            const tr = [];
            for (let k = 0; k < 3; k++) {
                const j = idx ? idx.getX(i + k) : i + k;
                tr.push(w[j * 3], w[j * 3 + 1], w[j * 3 + 2]);
            }
            const b = [
                Math.min(tr[0], tr[3], tr[6]),
                Math.min(tr[1], tr[4], tr[7]),
                Math.min(tr[2], tr[5], tr[8]),
                Math.max(tr[0], tr[3], tr[6]),
                Math.max(tr[1], tr[4], tr[7]),
                Math.max(tr[2], tr[5], tr[8]),
            ];
            s.tris.push(tr);
            s.tri.push(b);
            for (let k = 0; k < 3; k++) {
                s.box[k] = Math.min(s.box[k], b[k]);
                s.box[k + 3] = Math.max(s.box[k + 3], b[k + 3]);
            }
        }
    });
    return je;
}
function paar(A, B) {
    if (bbDist2(A.box, B.box) > 0.02 * 0.02) return { hit: false, d: Infinity };
    for (let i = 0; i < A.tris.length; i++) {
        if (bbDist2(A.tri[i], B.box) > 0) continue;
        for (let j = 0; j < B.tris.length; j++)
            if (bbDist2(A.tri[i], B.tri[j]) <= 0 && satTriTri(A.tris[i], B.tris[j])) return { hit: true, d: 0 };
    }
    let best = Infinity;
    for (let i = 0; i < A.tris.length; i++) {
        if (bbDist2(A.tri[i], B.box) >= best) continue;
        for (let j = 0; j < B.tris.length; j++) {
            if (bbDist2(A.tri[i], B.tri[j]) >= best) continue;
            best = Math.min(best, triTriDist2(A.tris[i], B.tris[j]));
        }
    }
    return { hit: false, d: Math.sqrt(best) };
}
// Eine Kombination über alle Posen: die Verletzungen (SCHNITT / KONTAKT) je Paar, der schlimmste Fall; mutiere(g) = Selbsttest
function pruefe(rezept, kultur, mutiere) {
    const out = [];
    let eng = { d: Infinity };
    const worst = {};
    for (const [fV, fH] of POSES) {
        const pr = VC.einspurPruefling(rezept, { moKultur: kultur, federwegV: fV, federwegH: fH });
        if (mutiere) mutiere(pr.g);
        const S = suppen(pr.g);
        for (const [a, b] of RULES) {
            if (!S[a] || !S[b]) continue;
            const r = paar(S[a], S[b]),
                lab = a + "×" + b,
                sc = r.hit ? 2 : r.d < KONTAKT_M ? 1 : 0;
            const w = worst[lab];
            if (!w || sc > w.sc || (sc === w.sc && r.d < w.d)) worst[lab] = { sc, d: r.d, pose: [fV, fH] };
            if (!r.hit && r.d < eng.d) eng = { d: r.d, wo: `${rezept}×${kultur} ${lab} Pose [${fV}, ${fH}]` };
        }
    }
    for (const lab in worst)
        if (worst[lab].sc)
            out.push({
                rezept,
                kultur,
                paar: lab,
                urteil: worst[lab].sc === 2 ? "SCHNITT" : "KONTAKT",
                mm: +(worst[lab].d * 1000).toFixed(2),
                pose: worst[lab].pose,
            });
    return { out, eng };
}

const t0 = Date.now();
const REZEPTE = Object.keys(VC.PRESETS).filter((id) => VC.PRESETS[id].fx && VC.PRESETS[id].fx.einspur);
const KULTUREN = Object.keys(VC.EINSPUR_KULTUR);
if (process.argv.includes("--selbsttest")) {
    // die Kette der Zweiarm-Kombination 30 mm nach innen (in den Arm): das Gate MUSS chain×swing beim Namen nennen
    const r = pruefe("motorrad_naked", "klinge", (g) =>
        g.traverse((o) => {
            if (o.userData.tag === "chain") {
                o.position.z += 0.03;
                o.updateMatrixWorld(true);
            }
        })
    );
    const rot = r.out.find((x) => x.paar === "chain×swing" && x.urteil === "SCHNITT");
    const sauber = pruefe("motorrad_naked", "klinge").out.length === 0;
    console.log(
        `SELBSTTEST ${rot && sauber ? "GRUEN" : "ROT"}: verschobene Kette → ${rot ? "SCHNITT chain×swing (motorrad_naked×klinge)" : "nicht erkannt"}, unverschoben ${sauber ? "frei" : "NICHT frei"} (${((Date.now() - t0) / 1000).toFixed(1)} s)`
    );
    process.exit(rot && sauber ? 0 : 1);
}
if (REZEPTE.length !== 5 || KULTUREN.length !== 5) {
    console.log(`ROT: das Einspur-Gesetz trägt ${REZEPTE.length} Gattungen × ${KULTUREN.length} Kulturen (Soll 5 × 5)`);
    process.exit(1);
}
const alle = [];
let eng = { d: Infinity },
    frei = 0;
for (const r of REZEPTE)
    for (const k of KULTUREN) {
        const e = pruefe(r, k);
        if (!e.out.length) frei++;
        alle.push(...e.out);
        if (e.eng.d < eng.d) eng = e.eng;
    }
const schnitte = alle.filter((x) => x.urteil === "SCHNITT").length,
    kontakte = alle.length - schnitte;
for (const x of alle) console.log(`  ${x.urteil} ${x.rezept}×${x.kultur} ${x.paar} ${x.mm} mm Pose [${x.pose}]`);
console.log(
    `EINSPUR-SCHNITT ${alle.length ? "ROT" : "GRUEN"}: ${frei}/${REZEPTE.length * KULTUREN.length} Kombinationen frei über ${POSES.length} Feder-Posen · ${schnitte} Schnitte / ${kontakte} Kontakte · ${RULES.length} Paare · engste Stelle ${(eng.d * 1000).toFixed(2)} mm (${eng.wo}) · ${((Date.now() - t0) / 1000).toFixed(1)} s`
);
process.exit(alle.length ? 1 : 0);
