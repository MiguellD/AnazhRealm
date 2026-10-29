#!/usr/bin/env node
// diag-mensch-anatomie.cjs — DIE ANATOMIE-LINSE DES MENSCHEN („der Mensch nah: Hände, Gesicht, Augen")
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
const { urteilEnde } = require("./lib/welt-boot.cjs");
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
    const ohren = new Set(
        kopf.children.filter((c) => !c.isMesh && c.children.length && Math.abs(c.position.x) > 0.8 * rS)
    );
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

// DER KOPF (K57, koerper-core KOPF_SOLL): die Verhältnisse des Gesichts. Die Lage-Verhältnisse (Augenlinie, Abstände,
// Mund, Ohr) misst das Gesetz (bauMensch, wie oben); was erst der Guss zeigt — die Hornhaut vor der Haut, die Töne von
// Lippe, Höhle und Haar, die Dreiecke — misst der OFEN L0 (foundry-core BAKERS_BY_KIND.koerper, wie Welt und Labor ihn
// zeichnen). Farben in CIELAB (D65) aus den linearen Stoff- und Vertex-Farben.
const OFEN_QUELLEN = [
    "worlds/terrain/lib/three-r128.min.js",
    "phyto-core.js",
    "koerper-core.js",
    "tetrapoda-core.js",
    "foundry-core.js",
];
function ladeOfen() {
    const sb = { console, Math, performance: { now: () => Date.now() }, setTimeout, clearTimeout };
    sb.self = sb;
    sb.globalThis = sb;
    sb.window = sb;
    vm.createContext(sb);
    for (const f of OFEN_QUELLEN) vm.runInContext(fs.readFileSync(path.join(ROOT, f), "utf8"), sb, { filename: f });
    return sb;
}
const lab = (r, g, b) => {
    const X = 0.4124 * r + 0.3576 * g + 0.1805 * b,
        Y = 0.2126 * r + 0.7152 * g + 0.0722 * b,
        Z = 0.0193 * r + 0.1192 * g + 0.9505 * b;
    const f = (t) => (t > 216 / 24389 ? Math.cbrt(t) : ((24389 / 27) * t + 16) / 116);
    const fx = f(X / 0.95047),
        fy = f(Y),
        fz = f(Z / 1.08883);
    return [116 * fy - 16, 500 * (fx - fy), 200 * (fy - fz)];
};
const linHex = (hx) =>
    [(hx >> 16) & 255, (hx >> 8) & 255, hx & 255].map((v) =>
        v / 255 <= 0.04045 ? v / 255 / 12.92 : Math.pow((v / 255 + 0.055) / 1.055, 2.4)
    );
const farbKey = (c) => c.map((x) => x.toFixed(5)).join(",");
function messeKopf(sb, eingriff) {
    const T = sb.THREE;
    const K = sb.__koerperCore;
    const S = K.KOPF_SOLL || {};
    // (1) das Gesetz: die Lage-Verhältnisse
    const { B } = baue(sb, eingriff && eingriff.gesetz);
    const P = B.parts;
    const lage = (n) => new T.Vector3().setFromMatrixPosition(n.matrixWorld);
    const Hk = spanne(punkte(T, B.character), 1).l;
    const kopf = P.head;
    const kp = punkte(T, kopf);
    const kH = spanne(kp, 1).l,
        yKinn = spanne(kp, 1).a;
    const aug = B.augen;
    const eL = lage(aug.eyeL),
        eR = lage(aug.eyeR);
    const ipd = eL.distanceTo(eR);
    const augW = spanne(punkte(T, aug.eyeL), 0).l;
    const lippen = punkte(T, aug.upperLipRef).concat(punkte(T, aug.lowerLipRef));
    const schaedel = kopf.children.find((c) => c.isMesh);
    const rS = schaedel.geometry.parameters.radius * Math.abs(schaedel.scale.x);
    const ohr = kopf.children.find((c) => !c.isMesh && c.children.length && c.position.x > 0.8 * rS);
    const op = spanne(punkte(T, ohr), 1);
    const nase = [P.noseTip, P.noseA1, P["noseA-1"]].filter(Boolean).reduce((a, n) => a.concat(punkte(T, n)), []);
    const yNase = spanne(nase, 1).a;
    const yAuge = (eL.y + eR.y) / 2;
    // (2) der Ofen L0: die Hornhaut vor der Haut, die Töne, das Haar, die Dreiecke
    const kern = eingriff && eingriff.kern ? eingriff.kern(K) : K;
    const g = sb.BAKERS_BY_KIND.koerper(kern, "mensch", 1, 0, null);
    g.updateMatrixWorld(true);
    const W = {};
    const sk = g.userData.__skelett;
    const welt = (name) => {
        if (W[name]) return W[name];
        const j = sk.joints.find((x) => x.name === name);
        if (!j) return (W[name] = new T.Matrix4());
        const L = new T.Matrix4().compose(
            new T.Vector3(...j.pos),
            new T.Quaternion(...j.quat),
            new T.Vector3(...j.scale)
        );
        return (W[name] = j.parent ? new T.Matrix4().multiplyMatrices(welt(j.parent), L) : L);
    };
    const ms = [];
    g.traverse((n) => n.isMesh && ms.push(n));
    const kl = (n) => n.material.userData.__klasse,
        jn = (n) => n.userData.__assetJoint || "";
    const hautK = ms.find((n) => kl(n) === "haut" && jn(n) === "head");
    const v = new T.Vector3();
    const hp = [],
        hc = [];
    const pa = hautK.geometry.attributes.position,
        ca = hautK.geometry.attributes.color;
    for (let i = 0; i < pa.count; i++) {
        v.fromBufferAttribute(pa, i)
            .applyMatrix4(hautK.matrixWorld)
            .applyMatrix4(welt(jn(hautK)));
        hp.push([v.x, v.y, v.z]);
        hc.push([ca.getX(i), ca.getY(i), ca.getZ(i)]);
    }
    const bkH = spanne(hp, 1).l,
        byK = spanne(hp, 1).a,
        zVorn = spanne(hp, 2).b;
    const zaehl = (filter) => {
        const z = new Map();
        hp.forEach((p, i) => {
            if (!filter(p, i)) return;
            const k = farbKey(hc[i]);
            z.set(k, (z.get(k) || 0) + 1);
        });
        const top = [...z.entries()].sort((a, b) => b[1] - a[1])[0];
        return top ? top[0] : null;
    };
    // die Haut = der häufigste Ton im Gesicht (unter der Haarlinie); die Lippe = der häufigste andere Ton am Mund
    const hautKey = zaehl((p) => (p[1] - byK) / bkH < 0.6);
    const hautC = hautKey.split(",").map(Number);
    const lippeKey = zaehl((p, i) => {
        const h = (p[1] - byK) / bkH;
        return farbKey(hc[i]) !== hautKey && h > 0.12 && h < 0.4 && p[2] > zVorn - 0.12 * bkH;
    });
    const lH = lab(...hautC);
    const lL = lippeKey ? lab(...lippeKey.split(",").map(Number)) : [NaN, NaN, NaN];
    // die Augenhöhle: ein eigener Stoff (Klasse socket) oder ein Ton der Haut am Auge
    const sock = ms.find((n) => kl(n) === "socket");
    let lS = sock ? lab(sock.material.color.r, sock.material.color.g, sock.material.color.b) : null;
    // die Hornhaut vor der Haut: der Augapfel-Scheitel gegen den Median der Haut im Ring 1,0–1,8 Augapfel-Radien
    let vorstand = -Infinity;
    for (const n of ms.filter((n) => kl(n) === "eye")) {
        const Mj = welt(jn(n));
        const bp = punkte(T, n).map((p) =>
            v
                .set(...p)
                .applyMatrix4(Mj)
                .toArray()
        );
        const sx = spanne(bp, 0),
            sy = spanne(bp, 1),
            sz = spanne(bp, 2);
        const cx = (sx.a + sx.b) / 2,
            cy = (sy.a + sy.b) / 2,
            rb = sx.l / 2;
        const ring = [];
        hp.forEach((p, i) => {
            const d = Math.hypot(p[0] - cx, p[1] - cy);
            if (d >= rb && d <= 1.8 * rb && p[2] > sz.a) ring.push(i);
        });
        const zs = ring.map((i) => hp[i][2]).sort((a, b) => a - b);
        const zMed = zs.length ? zs[zs.length >> 1] : NaN;
        vorstand = Math.max(vorstand, (sz.b - zMed) / bkH);
        if (!lS) {
            const k = zaehl((p, i) => ring.includes(i) && farbKey(hc[i]) !== hautKey);
            if (k) lS = lab(...k.split(",").map(Number));
        }
    }
    // das freie Auge: je Punkt der Iris-Vorderseite ein Strahl nach vorn (+z) gegen die Dreiecke der Kopf-Haut
    const idx = hautK.geometry.index ? hautK.geometry.index.array : null;
    const tri = [];
    for (let t = 0; t < (idx ? idx.length : hp.length) / 3; t++)
        tri.push(
            idx ? [hp[idx[3 * t]], hp[idx[3 * t + 1]], hp[idx[3 * t + 2]]] : [hp[3 * t], hp[3 * t + 1], hp[3 * t + 2]]
        );
    const trifft = (o) => {
        for (const [a, b, c] of tri) {
            const e1 = [b[0] - a[0], b[1] - a[1]],
                e2 = [c[0] - a[0], c[1] - a[1]];
            const det = e1[0] * e2[1] - e1[1] * e2[0];
            if (Math.abs(det) < 1e-12) continue;
            const px = o[0] - a[0],
                py = o[1] - a[1];
            const u = (px * e2[1] - py * e2[0]) / det,
                w = (e1[0] * py - e1[1] * px) / det;
            if (u < 0 || w < 0 || u + w > 1) continue;
            if (a[2] + u * (b[2] - a[2]) + w * (c[2] - a[2]) > o[2]) return true;
        }
        return false;
    };
    let irisN = 0,
        irisFrei = 0;
    for (const n of ms.filter((n) => kl(n) === "iris")) {
        const ip = punkte(T, n).map((p) =>
            v
                .set(...p)
                .applyMatrix4(welt(jn(n)))
                .toArray()
        );
        const zc = (spanne(ip, 2).a + spanne(ip, 2).b) / 2;
        for (const p of ip) {
            if (p[2] <= zc) continue;
            irisN++;
            if (!trifft(p)) irisFrei++;
        }
    }
    // das Haar als Volumen: die Kopf-Haut über der Haarlinie in Haar-Farbe (näher am Haar-Ton als am Haut-Ton)
    const haarC = linHex(K.HAIR_COLORS[K.START_PARAMS.hairColor].base);
    const d2 = (a, b) => (a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2 + (a[2] - b[2]) ** 2;
    // die Haarlinie aus der Kopfhöhe OHNE Haar (das Gesetz), in den Ofen-Raum über den Pupillen-Abstand
    const iz = ms
        .filter((n) => kl(n) === "iris")
        .map((n) => {
            const b = spanne(
                punkte(T, n).map((p) =>
                    v
                        .set(...p)
                        .applyMatrix4(welt(jn(n)))
                        .toArray()
                ),
                0
            );
            return (b.a + b.b) / 2;
        });
    const skala = Math.abs(iz[0] - iz[1]) / ipd;
    const yHaar = byK + (S.haarLinie || 0.8) * kH * skala;
    let kal = 0,
        bedeckt = 0;
    hp.forEach((p, i) => {
        if (p[1] < yHaar) return;
        kal++;
        if (d2(hc[i], haarC) < d2(hc[i], hautC)) bedeckt++;
    });
    let tris = 0;
    for (const n of ms)
        if (/^(head|eye[LR]|iris[LR]|lid[TB][LR])$/.test(jn(n)))
            tris += (n.geometry.index ? n.geometry.index.count : n.geometry.attributes.position.count) / 3;
    const luma = Object.values(K.SKIN_TONES).map((t) => {
        const c = linHex(t.hex);
        return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
    });
    return {
        kopfAnteil: kH / Hk,
        augenLinie: (yAuge - yKinn) / kH,
        augenSpalt: (ipd - augW) / augW,
        mundZuPupille: spanne(lippen, 0).l / ipd,
        ohrOben: (op.b - yAuge) / kH,
        ohrUnten: (op.a - yNase) / kH,
        ohrLaenge: op.l / kH,
        augenVorstand: vorstand,
        augeFrei: irisN ? irisFrei / irisN : NaN,
        lippeL: lL[0] - lH[0],
        lippeA: lL[1] - lH[1],
        hoehleL: lS ? lS[0] - lH[0] : NaN,
        hoehleA: lS ? lS[1] - lH[1] : NaN,
        hautAlbedoMin: Math.min(...luma),
        hautAlbedoMax: Math.max(...luma),
        haarDeckung: kal ? bedeckt / kal : NaN,
        kopfDreiecke: tris,
    };
}
function urteileKopf(sb, m) {
    const S = sb.__koerperCore.KOPF_SOLL;
    if (!S) return ["koerper-core KOPF_SOLL fehlt"];
    const v = [];
    for (const [k, x] of Object.entries(m)) {
        const band = S[k.replace(/(Min|Max)$/, "")];
        if (!Array.isArray(band)) continue;
        if (!Number.isFinite(x)) v.push(`${k} nicht messbar`);
        else if (x < band[0]) v.push(`${k} ${+x.toFixed(4)} < ${band[0]}`);
        else if (x > band[1]) v.push(`${k} ${+x.toFixed(4)} > ${band[1]}`);
    }
    return v;
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
    // die EINE Probe: laden, mit dem Eingriff messen, urteilen — der Leib (Welt) und der Kopf (Ofen) teilen sie
    const pruefeMit = (laden, urteil, messen) => (name, eingriff, muster) => {
        const sb = laden();
        const f = urteil(sb, messen(sb, eingriff));
        const ok = f.some((x) => muster.test(x));
        console.log(`  ${ok ? "✅" : "❌"} ${name}${ok ? " — " + f.find((x) => muster.test(x)) : ""}`);
        if (!ok) rot++;
    };
    const pruefe = pruefeMit(ladeWelt, urteile, messe),
        pruefeKopf = pruefeMit(ladeOfen, urteileKopf, messeKopf);
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
    const ohren = (B) =>
        B.parts.head.children.filter((c) => !c.isMesh && c.children.length && Math.abs(c.position.x) > 0.3);
    pruefeKopf(
        "S4 das um ein Viertel Kopfhöhe gehobene Ohr wird erkannt",
        { gesetz: (B) => ohren(B).forEach((o) => (o.position.y += 0.25)) },
        /^ohrOben/
    );
    const vor = (K) => (F) => {
        const B = K.bauMensch(F);
        for (const e of [B.augen.eyeL, B.augen.eyeR]) e.position.z += 0.12;
        return B;
    };
    pruefeKopf(
        "S5 der aufgesetzte Augapfel (eine Augapfel-Breite vor) wird erkannt",
        { kern: (K) => Object.assign({}, K, { bauMensch: vor(K) }) },
        /^augenVorstand/
    );
    const begrabe = (K) => (F) => {
        const B = K.bauMensch(F);
        for (const e of [B.augen.eyeL, B.augen.eyeR]) e.position.z -= 0.12;
        return B;
    };
    pruefeKopf(
        "S7 das begrabene Auge (eine Augapfel-Breite zurück) wird erkannt",
        { kern: (K) => Object.assign({}, K, { bauMensch: begrabe(K) }) },
        /^(augeFrei|augenVorstand)/
    );
    const rot0 = (K) => (h) => Object.assign({}, K.kopfToene(h), { lips: 0xaa5544 });
    pruefeKopf(
        "S6 die rote Lippe (die alte Klassen-Farbe 0xaa5544) wird erkannt",
        { kern: (K) => Object.assign({}, K, { kopfToene: rot0(K) }) },
        /^lippe[LA]/
    );
    urteilEnde(rot, `\n❌ SELBST-TEST ROT — ${rot} Linse(n) vakuös.`, "\n✅ SELBST-TEST GRÜN.");
}

console.log(
    "=== DIE MENSCH-ANATOMIE-LINSE: das Gesetz (bauMensch + morphAuf, Start-Dials) gegen MENSCH_SOLL und KOPF_SOLL ==="
);
const sb = ladeWelt();
const m = messe(sb);
zeige(m);
const so = ladeOfen();
const mk = messeKopf(so);
console.log(
    "  KOPF: " +
        Object.entries(mk)
            .map(([k, x]) => `${k} ${+x.toFixed(4)}`)
            .join(" · ")
);
if (process.argv.includes("--json")) console.log(JSON.stringify(Object.assign({}, m, mk), null, 1));
const fehler = urteile(sb, m).concat(urteileKopf(so, mk));
urteilEnde(fehler.length, `\n❌ ROT — ${fehler.length} Abweichung(en):\n  ` + fehler.join("\n  "), "\n✅ GRÜN — der Mensch steht in seinen Anthropometrie-Bändern (Hand · Arm · Kopf · Gesicht · Fuß).");
