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
const { urteilEnde, fadenScope } = require("./lib/welt-boot.cjs");

const ladeWelt = () => fadenScope(["worlds/terrain/lib/three-r128.min.js", "koerper-core.js"]);

// Der Mensch aus dem Gesetz (THREE-Fabrik wie der Bäcker; die Hornhaut ist im Bäcker keine Fläche) — mit den Start-Dials oder
// den Dials eines Bewohner-Typs (mensch.K4: die Probe der Menge, `kreatur-proben`).
function baue(sb, verzerre, dials) {
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
    K.morphAuf(B, Object.assign({}, K.START_PARAMS, dials));
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

// die Ohren des Kopfs: seine Gruppen-Kinder seitlich jenseits 0,8 Schädel-Radius (der Schädel ist sein erstes Mesh)
function ohrenVon(kopf) {
    const s = kopf.children.find((c) => c.isMesh);
    const rS = s.geometry.parameters.radius * Math.abs(s.scale.x);
    return kopf.children.filter((c) => !c.isMesh && c.children.length && Math.abs(c.position.x) > 0.8 * rS);
}
function messe(sb, verzerre, dials) {
    const { B, T } = baue(sb, verzerre, dials);
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
    const kopfOhneOhren = punkte(T, kopf, new Set(ohrenVon(kopf)));
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
const ladeOfen = () => fadenScope(OFEN_QUELLEN);
// CIELAB, sRGB und Luma: die EINEN der Linsen (abnahme-urteil)
const { cielab, srgbLin, luma709 } = require("./lib/abnahme-urteil.cjs");
const lab = (r, g, b) => cielab([r, g, b]);
const linHex = (hx) => [(hx >> 16) & 255, (hx >> 8) & 255, hx & 255].map(srgbLin);
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
    const ohr = ohrenVon(kopf).find((c) => c.position.x > 0);
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
    // die Punkte eines Teils im Ofen-Raum (an seinem Gelenk)
    const imOfen = (n) => punkte(T, n).map((p) => new T.Vector3(...p).applyMatrix4(welt(jn(n))).toArray());
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
        byK = spanne(hp, 1).a;
    // DIE TÖNE DES GUSSES (mensch.K4): je Ton der Kopf-Haut (`aTon`, koerper `menschTon`) seine Albedo in CIELAB — die Farbe
    // seiner hellsten Ecke (die Verdeckung der Haut dunkelt nur, die Mund-Linie ist dunkler: die hellste trägt den Ton genau):
    // die Haut, die Lippe, die Augenhöhle (der Ton der Haut am Auge) und die Braue
    const tonA = hautK.geometry.attributes.aTon;
    const labTon = (k) => lab(...(hc.filter((c, i) => tonA && tonA.getX(i) === K.menschTon(k)).sort((a, b) => luma709(b) - luma709(a))[0] || [NaN, NaN, NaN])); // prettier-ignore
    const [lH, lL, lS, lB] = ["skin", "lips", "socket", "braue"].map(labTon);
    // die Hornhaut vor der Haut: der Augapfel-Scheitel gegen den Median der Haut im Ring 1,0–1,8 Augapfel-Radien
    let vorstand = -Infinity;
    for (const n of ms.filter((n) => kl(n) === "eye")) {
        const bp = imOfen(n);
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
        const ip = imOfen(n);
        const zc = (spanne(ip, 2).a + spanne(ip, 2).b) / 2;
        for (const p of ip) {
            if (p[2] <= zc) continue;
            irisN++;
            if (!trifft(p)) irisFrei++;
        }
    }
    // das Haar als Volumen: die Kopf-Haut über der Haarlinie im Ton des Haars (koerper `menschTon`: die Kappe)
    // die Haarlinie aus der Kopfhöhe OHNE Haar (das Gesetz), in den Ofen-Raum über den Pupillen-Abstand
    const iz = ms
        .filter((n) => kl(n) === "iris")
        .map((n) => {
            const b = spanne(imOfen(n), 0);
            return (b.a + b.b) / 2;
        });
    const skala = Math.abs(iz[0] - iz[1]) / ipd;
    const yHaar = byK + (S.haarLinie || 0.8) * kH * skala;
    let kal = 0,
        bedeckt = 0;
    hp.forEach((p, i) => {
        if (p[1] < yHaar) return;
        kal++;
        if (tonA && tonA.getX(i) === K.menschTon("haarKappe")) bedeckt++;
    });
    let tris = 0;
    for (const n of ms)
        if (/^(head|eye[LR]|iris[LR]|lid[TB][LR])$/.test(jn(n)))
            tris += (n.geometry.index ? n.geometry.index.count : n.geometry.attributes.position.count) / 3;
    const luma = Object.values(K.SKIN_TONES).map((t) => {
        return luma709(linHex(t.hex));
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
        hoehleL: lS[0] - lH[0],
        hoehleA: lS[1] - lH[1],
        hautAlbedoMin: Math.min(...luma),
        hautAlbedoMax: Math.max(...luma),
        haarDeckung: kal ? bedeckt / kal : NaN,
        // DIE BRAUE (mensch.K4): ihr Ton gegen die Haut (|ΔL*|)
        brauKontrast: Math.abs(lB[0] - lH[0]),
        kopfDreiecke: tris,
    };
}
// DAS URTEIL DER BÄNDER (MENSCH_SOLL, KOPF_SOLL): je Maß sein Band (…Min/…Max im Band des Maßes), nicht messbar ist ROT
function urteile(sb, m, soll = "MENSCH_SOLL") {
    const S = sb.__koerperCore[soll];
    if (!S) return [`koerper-core ${soll} fehlt`];
    return Object.entries(m).flatMap(([k, x]) => {
        const band = S[k.replace(/(Min|Max)$/, "")];
        if (!Array.isArray(band)) return [];
        if (!Number.isFinite(x)) return [`${k} nicht messbar`];
        return x < band[0] ? [`${k} ${+x.toFixed(4)} < ${band[0]}`] : x > band[1] ? [`${k} ${+x.toFixed(4)} > ${band[1]}`] : [];
    });
}
const urteileKopf = (sb, m) => urteile(sb, m, "KOPF_SOLL");

// DIE MENGE (mensch.K4 Staffel 2): 50 Bewohner aus 50 Samen je Siedlung, gerechnet von DENSELBEN Gliedern wie in der Welt
// (`_bewohnerGestalten`, `_bewohnerGenome`; der Stamm im vm, stamm.cjs `ladeKlasse`), je Plan des Fachwerk-Kerns seine Tracht.
// Die Gestalt-Distanz eines Paars wie die Station mensch.K4#2: gleicher Typ und gleiche Farben (Haut, Haar, Tracht — das
// Geschlecht trägt der Typ), dann der größte Unterschied der Maße (die Vorlage × Höhe · Breite · Tiefe des Genoms) in Bildpunkten
// am Rand der Nah-Wahl (BEWOHNER.nahM, 1080 Zeilen, KAM_FOV_GRAD); unter 1 px ist gleich. Die Vorlage ist der Kasten der
// Mengen-Stufe (Ofen L2, Start-Dials) im Welt-Maß (8 · PLAYER_KH / 6 je Lab-Einheit). `eingriff(A)` verzerrt die Klasse.
const MENGE_PLAENE = [0x51ed, 0x7a11]; // die Samen der Pläne (je Plan seine Epoche und Tracht)
function messeMenge(eingriff) {
    const { AnazhRealm: A, ctx } = require("./lib/stamm.cjs").ladeKlasse(require("path").join(__dirname, ".."));
    if (eingriff) eingriff(A);
    const r = Object.assign(Object.create(A.prototype), { state: {} });
    const box = new ctx.THREE.Box3().setFromObject(ctx.BAKERS_BY_KIND.koerper(ctx.__koerperCore, "mensch", 1, 2, null)).getSize(new ctx.THREE.Vector3()); // prettier-ignore
    const px = (1080 / (2 * Math.tan((A.KAM_FOV_GRAD * Math.PI) / 360)) / A.BEWOHNER.nahM) * ((8 * A.PLAYER_KH) / 6);
    const m = { gleich: 0, min: Infinity, paar: null };
    for (const seed of MENGE_PLAENE) {
        const S = { plan: ctx.__fachwerkCore.exportSettlement({ seed, nH: 12 }), liste: [...Array(50)].map((_, i) => ({ seed: `${seed}:${i >> 1}:${i & 1}` })) }; // prettier-ignore
        S.gestalten = r._bewohnerGestalten(S);
        r._bewohnerGenome(S);
        // je Bewohner seine Gestalt — der Typ und die Farben (die eigenen, sonst die des Typs, wie die Station) — und seine
        // Maße in Bildpunkten
        const je = S.liste.map((b) => [b.gestalt + JSON.stringify(b.farben || S.gestalten[b.gestalt].dK), [box.x * b.breite, box.y, box.z * b.tiefe].map((x) => x * b.groesse * px), b.seed]); // prettier-ignore
        je.forEach(([g, a, s], i) =>
            je.slice(i + 1).forEach(([h, c, t]) => {
                const d = g === h ? Math.max(...a.map((x, e) => Math.abs(x - c[e]))) : Infinity;
                if (d < 1) m.gleich++;
                if (d < m.min) [m.min, m.paar] = [d, `${s}/${t}`];
            })
        );
    }
    return m;
}
// das Urteil der Menge: kein Paar gleicher Gestalt (unter 1 px)
const urteileMenge = (m) => (m.gleich ? [`menge.gleich ${m.gleich} Paare unter 1 px (${m.paar})`] : []);

const zeige = (m) =>
    console.log(
        "  " +
            Object.entries(m)
                .map(([k, x]) => `${k} ${k === "Hk" ? x.toFixed(2) : x.toFixed(4)}`)
                .join(" · ")
    );

module.exports = { ladeWelt, messe };
if (require.main !== module) return;
if (process.argv.includes("--selftest")) {
    console.log("=== SELBST-TEST: die Mensch-Anatomie-Linse feuert ===");
    let rot = 0;
    // je Fall der Eingriff am Gesetz (`verzerre`) oder am Kopf (`eingriff`, mit `kopf`): er muss sein Maß beim Namen rot machen
    const pruefe = (name, verzerre, muster, kopf) => {
        const sb = kopf ? ladeOfen() : ladeWelt();
        const f =
            kopf === "menge" ? urteileMenge(messeMenge(verzerre)) : kopf ? urteileKopf(sb, messeKopf(sb, verzerre)) : urteile(sb, messe(sb, verzerre)); // prettier-ignore
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
    pruefe(
        "S4 das um ein Viertel Kopfhöhe gehobene Ohr wird erkannt",
        { gesetz: (B) => ohrenVon(B.parts.head).forEach((o) => (o.position.y += 0.25)) },
        /^ohrOben/,
        true
    );
    // der Augapfel eine Augapfel-Breite vor (dz +0,12) oder zurück (−0,12) — im Kern, den der Ofen liest
    const auge = (dz) => ({
        kern: (K) =>
            Object.assign({}, K, {
                bauMensch: (F) => {
                    const B = K.bauMensch(F);
                    for (const e of [B.augen.eyeL, B.augen.eyeR]) e.position.z += dz;
                    return B;
                },
            }),
    });
    // DAS GESICHT AUF 6 m (mensch.K4): die Braue ohne ihren Ton (sie ist die Haut)
    pruefe(
        "B1 die Braue ohne Ton (der Ton der Haut) wird erkannt",
        { kern: (K) => Object.assign({}, K, { brauTon: (haut) => haut }) },
        /^brauKontrast/,
        true
    );
    // DIE MENGE (mensch.K4): die Farben der Gestalt statt der eigenen (der Stand vor mensch.K4)
    pruefe("M1 die Farben der Gestalt (vor mensch.K4) werden erkannt", (A, roh = A.prototype._bewohnerGenome) => (A.prototype._bewohnerGenome = function (S) { roh.call(this, S); S.liste.forEach((b) => (b.farben = null)); }), /^menge\.gleich/, "menge"); // prettier-ignore
    pruefe("S5 der aufgesetzte Augapfel (eine Augapfel-Breite vor) wird erkannt", auge(0.12), /^augenVorstand/, true);
    pruefe("S7 das begrabene Auge (eine Augapfel-Breite zurück) wird erkannt", auge(-0.12), /^(augeFrei|augenVorstand)/, true);
    const rot0 = (K) => (h) => Object.assign({}, K.kopfToene(h), { lips: 0xaa5544 });
    pruefe(
        "S6 die rote Lippe (die alte Klassen-Farbe 0xaa5544) wird erkannt",
        { kern: (K) => Object.assign({}, K, { kopfToene: rot0(K) }) },
        /^lippe[LA]/,
        true
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
const mm = messeMenge();
console.log(`  MENGE: ${mm.gleich} gleiche Paare · Gestalt-Distanz min ${mm.min} px ${mm.paar}`);
if (process.argv.includes("--json")) console.log(JSON.stringify(Object.assign({}, m, mk, { menge: mm }), null, 1));
const fehler = urteile(sb, m).concat(urteileKopf(so, mk), urteileMenge(mm));
urteilEnde(fehler.length, `\n❌ ROT — ${fehler.length} Abweichung(en):\n  ` + fehler.join("\n  "), "\n✅ GRÜN — der Mensch steht in seinen Anthropometrie-Bändern (Hand · Arm · Kopf · Gesicht · Fuß).");
