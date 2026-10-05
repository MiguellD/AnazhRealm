#!/usr/bin/env node
// diag-mensch-anatomie.cjs — DIE ANATOMIE-LINSE DES MENSCHEN (Welle 5, „der Mensch nah: Hände, Gesicht, Augen")
// (npm run gate:mensch-anatomie). Sie misst das GESETZ, aus dem Lab und Welt den Menschen bauen — koerper-core
// bauMensch + morphAuf mit den Start-Dials (START_PARAMS), three r128 im node-vm wie der Foundry-Worker —, die Arme
// gerade hängend (Arm-Gelenke auf 0 gedreht), normiert auf die Körperhöhe Hk, gegen die Anthropometrie-Bänder des
// Gesetzbuchs (koerper-core MENSCH_SOLL, erwachsener Mann 1,80 m):
//   handL · handB · handgelenk (Hand-Länge, Mittelhand-Breite, Handgelenk-Breite)
//   unterarm (Unterarm-Breite / Oberarm-Breite) · kopfH · kopfB (Schädel-Höhe/-Breite ohne Ohren)
//   augenAbstand (Pupillen-Abstand) · augapfel · iris · mund · fuss
// Rot nennt den Täter: `handL 0.151 > 0.115`.
//   --selftest: (S1) die Hand 1,5× → handL rot · (S2) die Augäpfel 2× → augapfel rot · (S3) der Pupillen-Abstand
//   doppelt → augenAbstand rot. Die Linse feuert, sonst ist sie vakuös.
//   node scripts/diag-mensch-anatomie.cjs [--selftest] [--json]
"use strict";
const fs = require("fs");
const vm = require("vm");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");

function ladeWelt() {
    const sb = { console, Math };
    sb.self = sb;
    sb.globalThis = sb;
    sb.window = sb;
    vm.createContext(sb);
    for (const f of ["worlds/terrain/lib/three-r128.min.js", "koerper-core.js"])
        vm.runInContext(fs.readFileSync(path.join(ROOT, f), "utf8"), sb, { filename: f });
    return sb;
}

// Der Mensch aus dem Gesetz (THREE-Fabrik wie der Bäcker; die Hornhaut ist im Bäcker keine Fläche).
function baue(sb, verzerre) {
    const T = sb.THREE;
    const K = sb.__koerperCore;
    const mats = {};
    const mat = (k) => mats[k] || (mats[k] = Object.assign(new T.MeshBasicMaterial(), { userData: { __klasse: k } }));
    const F = {
        gruppe: () => new T.Group(),
        kugel: (r, k, sc) => {
            if (k === "cornea") return new T.Group();
            const m = new T.Mesh(new T.SphereGeometry(r, 16, 12), mat(k));
            if (sc) m.scale.set(sc[0], sc[1], sc[2]);
            return m;
        },
        zylinder: (rt, rb, h, k) => new T.Mesh(new T.CylinderGeometry(rt, rb, h, 12, 1), mat(k)),
    };
    const B = K.bauMensch(F);
    K.morphAuf(B, Object.assign({}, K.START_PARAMS));
    for (const k of ["arm1", "arm-1"]) if (B.parts[k]) B.parts[k].rotation.set(0, 0, 0);
    if (verzerre) verzerre(B, T);
    B.character.updateMatrixWorld(true);
    return { B, T };
}

// Alle Vertices eines Teilbaums in Welt-Koordinaten (ohne die Teilbäume in `ohne`).
function punkte(T, wurzel, ohne) {
    const out = [];
    const v = new T.Vector3();
    const geh = (n) => {
        if (ohne && ohne.has(n)) return;
        if (n.isMesh) {
            const pa = n.geometry.attributes.position;
            for (let i = 0; i < pa.count; i++) {
                v.fromBufferAttribute(pa, i).applyMatrix4(n.matrixWorld);
                out.push([v.x, v.y, v.z]);
            }
        }
        for (const c of n.children) geh(c);
    };
    geh(wurzel);
    return out;
}
const spanne = (P, d) => {
    let a = Infinity,
        b = -Infinity;
    for (const p of P) {
        if (p[d] < a) a = p[d];
        if (p[d] > b) b = p[d];
    }
    return { a, b, l: b - a };
};
// Breite (x-Spanne) je Höhen-Scheibe zwischen y0 und y1, das Maximum
function maxBreite(P, y0, y1, n) {
    let best = 0;
    for (let s = 0; s < n; s++) {
        const ya = y0 + ((y1 - y0) * s) / n,
            yb = y0 + ((y1 - y0) * (s + 1)) / n;
        const sl = P.filter((p) => p[1] >= Math.min(ya, yb) && p[1] <= Math.max(ya, yb));
        if (sl.length > 8) best = Math.max(best, spanne(sl, 0).l);
    }
    return best;
}

function messe(sb, verzerre) {
    const { B, T } = baue(sb, verzerre);
    const P = B.parts;
    const lage = (n) => new T.Vector3().setFromMatrixPosition(n.matrixWorld);
    const alle = punkte(T, B.character);
    const Hk = spanne(alle, 1).l;
    // die rechte Hand (hand1) und der rechte Arm
    const hand = P.hand1;
    const daumen = new Set([P["tA_1"]].filter(Boolean));
    const handP = punkte(T, hand);
    const handOhneDaumen = punkte(T, hand, daumen);
    const handL = spanne(handP, 1).l;
    const handB = spanne(handOhneDaumen, 0).l;
    const ellG = P.elbow1;
    const unterP = punkte(T, ellG, new Set([hand]));
    const yE = lage(ellG).y;
    // Handgelenk: das untere Ende des Unterarms (ohne Hand) — die Scheibe 3–10 % der Unterarm-Länge darüber
    const yW = spanne(unterP, 1).a,
        lU = yE - yW;
    const wrist = maxBreite(unterP, yW + 0.03 * lU, yW + 0.1 * lU, 1);
    const unterarm = maxBreite(unterP, yE - lU * 0.2, yE - lU * 0.7, 10);
    const armP = punkte(T, P.arm1, new Set([ellG]));
    const yS = lage(P.arm1).y;
    const oberarm = maxBreite(armP, yS - (yS - yE) * 0.4, yS - (yS - yE) * 0.85, 10);
    // der Kopf: Höhe des Teilbaums; Breite ohne die Ohren (Gruppen-Kinder seitlich jenseits 0,8 Schädel-Radius)
    const kopf = P.head;
    const kopfP = punkte(T, kopf);
    const schaedel = kopf.children.find((c) => c.isMesh);
    const rS = schaedel.geometry.parameters.radius * Math.abs(schaedel.scale.x);
    const ohren = new Set(kopf.children.filter((c) => !c.isMesh && c.children.length && Math.abs(c.position.x) > 0.8 * rS));
    const kopfOhneOhren = punkte(T, kopf, ohren);
    const kopfH = spanne(kopfP, 1).l;
    const kopfB = spanne(kopfOhneOhren, 0).l;
    const aug = B.augen;
    const augenAbstand = lage(aug.eyeL).distanceTo(lage(aug.eyeR));
    const ball = aug.eyeL.children.find((c) => c.isMesh && c.material.userData.__klasse === "eye");
    const augapfel = spanne(punkte(T, ball), 0).l;
    const iris = spanne(punkte(T, aug.irisL), 0).l;
    const lippen = punkte(T, aug.upperLipRef).concat(punkte(T, aug.lowerLipRef));
    const mund = spanne(lippen, 0).l;
    const fuss = spanne(punkte(T, P.ankle1), 2).l;
    return {
        Hk,
        handL: handL / Hk,
        handB: handB / Hk,
        handgelenk: wrist / Hk,
        unterarm: unterarm / Math.max(1e-6, oberarm),
        kopfH: kopfH / Hk,
        kopfB: kopfB / Hk,
        augenAbstand: augenAbstand / Hk,
        augapfel: augapfel / Hk,
        iris: iris / Hk,
        mund: mund / Hk,
        fuss: fuss / Hk,
    };
}

function urteile(sb, m) {
    const S = sb.__koerperCore.MENSCH_SOLL;
    const v = [];
    if (!S) return ["koerper-core MENSCH_SOLL fehlt"];
    for (const [k, band] of Object.entries(S)) {
        const x = m[k];
        if (!Number.isFinite(x)) v.push(`${k} nicht messbar`);
        else if (x < band[0]) v.push(`${k} ${x.toFixed(4)} < ${band[0]}`);
        else if (x > band[1]) v.push(`${k} ${x.toFixed(4)} > ${band[1]}`);
    }
    return v;
}

const zeige = (m) =>
    console.log(
        "  " +
            Object.entries(m)
                .map(([k, x]) => `${k} ${k === "Hk" ? x.toFixed(2) : x.toFixed(4)}`)
                .join(" · ")
    );

if (process.argv.includes("--selftest")) {
    console.log("=== SELBST-TEST: die Mensch-Anatomie-Linse feuert ===");
    let rot = 0;
    const pruefe = (name, verzerre, muster) => {
        const sb = ladeWelt();
        const f = urteile(sb, messe(sb, verzerre));
        const ok = f.some((x) => muster.test(x));
        console.log(`  ${ok ? "✅" : "❌"} ${name}${ok ? " — " + f.find((x) => muster.test(x)) : ""}`);
        if (!ok) rot++;
    };
    pruefe("S1 die 1,5-fache Hand wird erkannt", (B) => B.parts.hand1.scale.multiplyScalar(1.5), /^handL/);
    pruefe(
        "S2 die doppelten Augäpfel werden erkannt",
        (B) => {
            const b = B.augen.eyeL.children.find((c) => c.isMesh && c.material.userData.__klasse === "eye");
            b.scale.multiplyScalar(2);
        },
        /^augapfel/
    );
    pruefe(
        "S3 der doppelte Pupillen-Abstand wird erkannt",
        (B) => {
            B.augen.eyeL.position.x *= 2;
            B.augen.eyeR.position.x *= 2;
        },
        /^augenAbstand/
    );
    if (rot) {
        console.error(`\n❌ SELBST-TEST ROT — ${rot} Linse(n) vakuös.`);
        process.exit(1);
    }
    console.log("\n✅ SELBST-TEST GRÜN.");
    process.exit(0);
}

console.log("=== DIE MENSCH-ANATOMIE-LINSE: das Gesetz (bauMensch + morphAuf, Start-Dials) gegen MENSCH_SOLL ===");
const sb = ladeWelt();
const m = messe(sb);
zeige(m);
if (process.argv.includes("--json")) console.log(JSON.stringify(m, null, 1));
const fehler = urteile(sb, m);
if (fehler.length) {
    console.error(`\n❌ ROT — ${fehler.length} Abweichung(en):\n  ` + fehler.join("\n  "));
    process.exit(1);
}
console.log("\n✅ GRÜN — der Mensch steht in seinen Anthropometrie-Bändern (Hand · Arm · Kopf · Gesicht · Fuß).");
process.exit(0);
