#!/usr/bin/env node
// diag-mensch-anatomie.cjs — DIE ANATOMIE-LINSE DES MENSCHEN („der Mensch nah: Hände, Gesicht, Augen")
// (npm run gate:mensch-anatomie). Sie misst das GESETZ, aus dem Lab und Welt den Menschen bauen — koerper-core
// bauMensch + morphAuf mit den Start-Dials (START_PARAMS), three r184 im node-vm wie der Foundry-Worker —, die Arme
// gerade hängend (Arm-Gelenke auf 0 gedreht), normiert auf die Körperhöhe Hk, gegen die Anthropometrie-Bänder des
// Gesetzbuchs (koerper-core MENSCH_SOLL, erwachsener Mann 1,80 m):
//   handL · handB · handgelenk (Hand-Länge, Mittelhand-Breite, Handgelenk-Breite)
//   unterarm (Unterarm-Breite / Oberarm-Breite) · kopfH · kopfB (Schädel-Höhe/-Breite ohne Ohren)
//   augenAbstand (Pupillen-Abstand) · augapfel · iris · mund · fuss
// Rot nennt den Täter: `handL 0.151 > 0.115`.
//   --selftest: (S1) die Hand 1,5× → handL rot · (S2) die Augäpfel 2× → augapfel rot · (S3) der Pupillen-Abstand
//   doppelt → augenAbstand rot. Die Linse feuert, sonst ist sie vakuös.
//   node scripts/diag-mensch-anatomie.cjs [--selftest]
"use strict";
const { urteilEnde, fadenScope, SELBSTTEST, OFEN_KERNE } = require("./lib/welt-boot.cjs");

const ladeWelt = () => fadenScope(["koerper-core.js"]);

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
    const leib = spanne(punkte(T, B.character), 1),
        kopf = spanne(punkte(T, P.head), 1),
        Hk = leib.l;
    // DER KANON DES LEIBS (w21-leib-bau): die Höhe eines Gelenks über der Sohle als Anteil von Hk
    const an = (n) => (lage(n).y - leib.a) / Hk;
    // die rechte Hand (hand1, ohne den Daumen tA_1 ihre Breite) und der rechte Arm
    const ellG = P.elbow1;
    const unterP = punkte(T, ellG, new Set([P.hand1]));
    const yE = lage(ellG).y;
    // Handgelenk: das untere Ende des Unterarms (ohne Hand) — die Scheibe 3–10 % der Unterarm-Länge darüber
    const yW = spanne(unterP, 1).a,
        lU = yE - yW;
    const armP = punkte(T, P.arm1, new Set([ellG]));
    const yS = lage(P.arm1).y;
    // der Kopf: Höhe des Teilbaums; Breite ohne die Ohren (Gruppen-Kinder seitlich jenseits 0,8 Schädel-Radius)
    const aug = B.augen;
    const ball = aug.eyeL.children.find((c) => c.isMesh && c.material.userData.__klasse === "eye");
    return {
        Hk,
        handL: spanne(punkte(T, P.hand1), 1).l / Hk,
        handB: spanne(punkte(T, P.hand1, new Set([P["tA_1"]].filter(Boolean))), 0).l / Hk,
        handgelenk: maxBreite(unterP, yW + 0.03 * lU, yW + 0.1 * lU, 1) / Hk,
        unterarm: maxBreite(unterP, yE - lU * 0.2, yE - lU * 0.7, 10) / Math.max(1e-6, maxBreite(armP, yS - (yS - yE) * 0.4, yS - (yS - yE) * 0.85, 10)), // prettier-ignore
        kopfH: kopf.l / Hk,
        kopfB: spanne(punkte(T, P.head, new Set(ohrenVon(P.head))), 0).l / Hk,
        augenAbstand: lage(aug.eyeL).distanceTo(lage(aug.eyeR)) / Hk,
        augapfel: spanne(punkte(T, ball), 0).l / Hk,
        iris: spanne(punkte(T, aug.irisL), 0).l / Hk,
        mund: spanne(punkte(T, aug.upperLipRef).concat(punkte(T, aug.lowerLipRef)), 0).l / Hk,
        fuss: spanne(punkte(T, P.ankle1), 2).l / Hk,
        schulter: an(P.arm1),
        huefte: an(P.hip1),
        knie: an(P.knee1),
        hals: (kopf.a - lage(P.arm1).y) / Hk,
    };
}

// DER KOPF (K57, koerper-core KOPF_SOLL): die Verhältnisse des Gesichts. Die Lage-Verhältnisse (Augenlinie, Abstände,
// Mund, Ohr) misst das Gesetz (bauMensch, wie oben); was erst der Guss zeigt — die Hornhaut vor der Haut, die Töne von
// Lippe, Höhle und Haar, die Dreiecke — misst der OFEN L0 (foundry-core BAKERS_BY_KIND.koerper, wie Welt und Labor ihn
// zeichnen). Farben in CIELAB (D65) aus den linearen Stoff- und Vertex-Farben.
const ladeOfen = () => fadenScope(OFEN_KERNE);
// CIELAB, sRGB und Luma: die EINEN der Linsen (abnahme-urteil)
const { cielab, srgbLin, luma709 } = require("./lib/abnahme-urteil.cjs");
const { rasterDreieck } = require("./lib/kronen-linse.cjs");
const lab = (r, g, b) => cielab([r, g, b]);
const linHex = (hx) => [(hx >> 16) & 255, (hx >> 8) & 255, hx & 255].map(srgbLin);
// DIE SCHULTER DER LIDSPALTE (w28-gesicht, KOPF_SOLL lidSchulter): am NETZ des Gusses, von vorn — Augapfel und Iris gegen Lider und
// Kopf-Haut im Tiefen-Puffer, je Spalte Ober- und Unterkante der freien Fläche. Ein Lidrand ist ein Bogen: er liegt AUF seiner
// gewölbten Hülle. Greift das Netz des Lids zu kurz (Ecken auf der Schale, die Facette darunter), steht das Weiß an den Winkeln
// als eckiger Lappen über den Rand — der Rand fällt dort unter seine Hülle. Der größte Abstand ÷ die Höhe der Spalte (das
// Gesetz misst die Schale, `lidSpalt`; das Bild zeigt das Netz).
// DAS WEISS DER LIDSPALTE (w28-auge, KOPF_SOLL augeWeiss): im selben Raster — der Anteil der freien Fläche (Sklera, Iris, Pupille),
// den die Sklera HELL trägt: je Bildpunkt der Sklera ihr Ton (die Luma der Ecken-Farbe gegen die hellste Ecke des Augapfels,
// der Schatten des Lids). Auf 6 m ist die Spalte zwei Bildpunkte hoch: trägt die Sklera dort Grau (der Saum des Lid-Schattens
// IN der Spalte, auf dem Raster 12 × 8 nur der Ring der Mitte hell), verschwindet das Auge in der Höhle; steht das Weiß rings
// um die Iris (flache Lider), starrt es. Rückgabe { schulter, weiss }.
function lidSchulterAmGuss(K, g) {
    const netze = K.gussNetze(g, false).filter((n) => n.I);
    const auge = netze.filter((n) => n.j === "eyeL" || n.j === "irisL");
    const deck = netze.filter((n) => n.j === "lidTL" || n.j === "lidBL" || (n.k === "haut" && n.j === "head"));
    const ball = auge.find((n) => n.k === "eye");
    if (!ball || deck.length < 3) return { schulter: NaN, weiss: NaN };
    let [x0, x1, y0, y1] = [Infinity, -Infinity, Infinity, -Infinity];
    for (let i = 0; i < ball.P.length; i += 3) [x0, x1, y0, y1] = [Math.min(x0, ball.P[i]), Math.max(x1, ball.P[i]), Math.min(y0, ball.P[i + 1]), Math.max(y1, ball.P[i + 1])]; // prettier-ignore
    const W = 240,
        sk = W / (x1 - x0),
        H = Math.ceil((y1 - y0) * sk);
    const tiefe = new Float32Array(W * H).fill(-Infinity),
        wer = new Uint8Array(W * H),
        ton = new Float32Array(W * H);
    const luma = (c, e) => luma709(c.array, 3 * e);
    // das EINE Dreiecks-Raster (kronen-linse `rasterDreieck`), der Tiefen-Puffer wählt das vorderste Netz
    const male = (n, id) => {
        const p = (e) => [(n.P[3 * e] - x0) * sk, (y1 - n.P[3 * e + 1]) * sk, n.P[3 * e + 2]];
        // der Ton je Ecke: nur die Sklera (id 1) trägt ihn, gegen ihre hellste Ecke
        const c = id === 1 ? n.o.geometry.attributes.color : null;
        let hell = 0;
        for (let e = 0; c && e < c.count; e++) hell = Math.max(hell, luma(c, e));
        for (let t = 0; t < n.I.length; t += 3) {
            const [A, B, C] = [p(n.I[t]), p(n.I[t + 1]), p(n.I[t + 2])];
            const [la, lb, lc] =
                c && hell > 0
                    ? [luma(c, n.I[t]) / hell, luma(c, n.I[t + 1]) / hell, luma(c, n.I[t + 2]) / hell]
                    : [0, 0, 0];
            rasterDreieck(A[0], A[1], B[0], B[1], C[0], C[1], { nu: W, nv: H }, (o, w0, w1, w2) => {
                const z = w0 * A[2] + w1 * B[2] + w2 * C[2];
                if (z > tiefe[o]) [tiefe[o], wer[o], ton[o]] = [z, id, w0 * la + w1 * lb + w2 * lc];
            });
        }
    };
    // 1 die Sklera, 3 Iris und Pupille (frei, nie Weiß), 2 was deckt
    for (const n of auge) male(n, n.k === "eye" ? 1 : 3);
    for (const n of deck) male(n, 2);
    let [freiPx, weiss] = [0, 0];
    for (let o = 0; o < W * H; o++) if (wer[o] === 1 || wer[o] === 3) (freiPx++, (weiss += wer[o] === 1 ? ton[o] : 0));
    // je Spalte der längste Lauf freier Fläche: Ober- und Unterkante (y nach oben)
    const oben = [],
        unten = [];
    for (let x = 0; x < W; x++) {
        let best = null,
            a = -1;
        for (let y = 0; y <= H; y++) {
            const frei = y < H && (wer[y * W + x] === 1 || wer[y * W + x] === 3);
            if (frei && a < 0) a = y;
            if (!frei && a >= 0) {
                if (!best || y - a > best[1] - best[0]) best = [a, y];
                a = -1;
            }
        }
        if (best) (oben.push([x, -best[0]]), unten.push([x, best[1]]));
    }
    if (oben.length < 8) return { schulter: NaN, weiss: NaN };
    const hoehe = Math.max(...oben.map((o, i) => unten[i][1] + o[1]));
    // der größte Abstand einer Kante unter ihrer gewölbten Hülle (monotone Kette)
    const unterHuelle = (p) => {
        const h = [];
        for (const q of p) {
            while (h.length >= 2 && (h[h.length - 1][0] - h[h.length - 2][0]) * (q[1] - h[h.length - 2][1]) - (h[h.length - 1][1] - h[h.length - 2][1]) * (q[0] - h[h.length - 2][0]) >= 0) h.pop(); // prettier-ignore
            h.push(q);
        }
        let m = 0,
            j = 0;
        for (const q of p) {
            while (j < h.length - 2 && h[j + 1][0] <= q[0]) j++;
            const [a, b] = [h[j], h[Math.min(j + 1, h.length - 1)]];
            m = Math.max(m, (b[0] === a[0] ? a[1] : a[1] + ((b[1] - a[1]) * (q[0] - a[0])) / (b[0] - a[0])) - q[1]);
        }
        return m;
    };
    return { schulter: Math.max(unterHuelle(oben), unterHuelle(unten)) / hoehe, weiss: weiss / freiPx };
}
// DAS AUGE SITZT IN SEINER HÖHLE, DIE WANGE STEHT DAVOR (w28-wange — die Bänder KOPF_SOLL orbitaOben · orbitaUnten · wangeVor ·
// lidHinterRand; die Quelle des Solls nennt der Kern dort: Matros/Momoh/Yaremchuk 2009, Jelks & Jelks): am Guss des Ofens
// L0, im Profil der Kopf-Haut durch die Mitte des linken Augapfels (die Dreiecke, die die Ebene x = Mitte ± R/2 schneiden; je Höhen-Band
// R/4 ihr vorderster Punkt), in Augapfel-Radien R (die Halbachse nach vorn; 1 R ≙ 12 mm). Der Rand über dem Auge (die Brauenwulst: der
// vorderste Punkt 1,2–4 R über der Mitte) steht vor der Hornhaut (orbitaOben, am Menschen 8–10 mm), die Hornhaut (der Scheitel von Iris
// und Pupille) steht nur wenig vor dem Rand unter dem Auge (die Haut über dem unteren Höhlenrand: der vorderste Punkt 1–1,5 R unter der
// Mitte; orbitaUnten, 3 mm), die Kuppe der Wange darunter (der vorderste Punkt 1,5–4,5 R unter der Mitte) steht in oder vor der Ebene
// der Hornhaut (wangeVor, 2 mm) — ein Lineal von der Braue auf die Wange berührt das geschlossene Lid nicht: lidHinterRand = der Scheitel des geschlossenen
// Oberlids (Gesetz `lidLage(1)`, die Schale des Lids) HINTER dieser Linie auf Augenhöhe. Liegt die Haut unter dem Auge weit zurück,
// steht der Augapfel als Buckel vor der Fläche von Stirn und Wange (bei tiefer Sonne zwei runde Wülste um das Auge).
function orbitaAmGuss(K, kern, g, P) {
    const netze = K.gussNetze(g, false).filter((n) => n.I);
    const [ball, haut] = [
        netze.find((n) => n.k === "eye" && n.j === "eyeL"),
        netze.find((n) => n.k === "haut" && n.j === "head"),
    ];
    if (!ball || !haut) return { orbitaOben: NaN, orbitaUnten: NaN, wangeVor: NaN, lidHinterRand: NaN };
    const kasten = (n) => {
        const b = [Infinity, -Infinity, Infinity, -Infinity, Infinity, -Infinity];
        for (let i = 0; i < n.P.length; i += 3)
            for (let d = 0; d < 3; d++)
                [b[2 * d], b[2 * d + 1]] = [Math.min(b[2 * d], n.P[i + d]), Math.max(b[2 * d + 1], n.P[i + d])];
        return b;
    };
    const bb = kasten(ball);
    const [cx, cy, cz, R] = [(bb[0] + bb[1]) / 2, (bb[2] + bb[3]) / 2, (bb[4] + bb[5]) / 2, (bb[5] - bb[4]) / 2];
    const hornhaut = Math.max(
        ...netze.filter((n) => /^(iris|pupil)$/.test(n.k) && /L$/.test(n.j)).map((n) => kasten(n)[5])
    );
    const prof = new Map();
    for (let t = 0; t < haut.I.length; t += 3) {
        const e = [haut.I[t], haut.I[t + 1], haut.I[t + 2]].map((i) => [
            haut.P[3 * i],
            haut.P[3 * i + 1],
            haut.P[3 * i + 2],
        ]);
        if (Math.min(...e.map((p) => p[0])) > cx + R / 2 || Math.max(...e.map((p) => p[0])) < cx - R / 2) continue;
        for (const p of e) {
            const band = Math.round((p[1] - cy) / (R / 4));
            if (Math.abs(p[0] - cx) <= R && (!prof.has(band) || prof.get(band)[1] < p[2])) prof.set(band, [p[1], p[2]]);
        }
    }
    const vorn = (a, b) => [...prof.entries()].filter(([k]) => k * 0.25 >= a && k * 0.25 <= b).map(([, p]) => p).sort((p, q) => q[1] - p[1])[0]; // prettier-ignore
    // der Rand über dem Auge · der Rand unter dem Auge (1–1,5 R unter der Mitte: die Haut über dem unteren Höhlenrand) · die Kuppe der
    // Wange (der vorderste Punkt 1,5–4,5 R darunter) · der vorderste Punkt unter dem Auge überhaupt (das Lineal liegt auf ihm)
    const [oben, rand, kuppe, unten] = [vorn(1.2, 4), vorn(-1.5, -1), vorn(-4.5, -1.5), vorn(-4.5, -1)];
    if (!oben || !rand || !kuppe) return { orbitaOben: NaN, orbitaUnten: NaN, wangeVor: NaN, lidHinterRand: NaN };
    // der Scheitel des geschlossenen Oberlids: seine Schale im Raum des Auges (Gesetz), in den Guss über den Radius des Augapfels
    const kug = P.lidTL.parent.children.find((c) => c.isMesh && c.material.userData.__klasse === "eye");
    const lidZu =
        cz +
        ((kern.lidLage(1)[1] + P.lidTL.geometry.parameters.radius * P.lidTL.scale.z) * R) /
            (kug.geometry.parameters.radius * kug.scale.z);
    const linie = unten[1] + ((cy - unten[0]) / (oben[0] - unten[0])) * (oben[1] - unten[1]);
    return {
        orbitaOben: (oben[1] - hornhaut) / R,
        orbitaUnten: (hornhaut - rand[1]) / R,
        wangeVor: (kuppe[1] - hornhaut) / R,
        lidHinterRand: (linie - lidZu) / R,
    };
}
// DIE HÖHLE STEHT VORN (w28-iris-frei, KOPF_SOLL hoehleVorn): am Guss des Ofens L0, von vorn — der Anteil der Haut um das linke
// Auge (der Kasten ±0,9 R quer und −1,5 R … +0,5 R hoch um die Mitte des Augapfels, im Tiefen-Puffer über jedes Netz, ohne Augapfel,
// Iris und Pupille), der den Ton der Höhle trägt (`aTon`, koerper `menschTon`). Die Kamera des Spiels steht vor dem Gesicht: nur was
// vorn den Ton trägt, liest das Bild als Höhle. Der Saum im Raum (`hoehleSaum`) trug ihn seit den Lid-Schalen nur noch am äußeren
// Augenwinkel — hoehleVorn 0,000 am Kopf von w28-wange (0,023 an 41ec3a96), die Station mensch.K4#1 las dort zwei Flecken im
// Streiflicht (hoehleL 0,04 · hoehleA 7,87–10,2).
function hoehleVornAmGuss(K, g) {
    const netze = K.gussNetze(g, false).filter((n) => n.I);
    const ball = netze.find((n) => n.k === "eye" && n.j === "eyeL");
    if (!ball) return NaN;
    const tS = K.menschTon("socket");
    const c = [0, 0];
    let R = 0;
    for (let i = 0; i < ball.P.length; i += 3) for (let k = 0; k < 2; k++) c[k] += ball.P[i + k] / (ball.P.length / 3);
    for (let i = 0; i < ball.P.length; i += 3) R = Math.max(R, Math.abs(ball.P[i] - c[0]));
    const [x0, x1, y0, y1] = [c[0] - 0.9 * R, c[0] + 0.9 * R, c[1] - 1.5 * R, c[1] + 0.5 * R];
    const W = 180,
        sk = W / (x1 - x0),
        H = Math.round((y1 - y0) * sk);
    const tiefe = new Float32Array(W * H).fill(-Infinity),
        wer = new Int8Array(W * H).fill(-1);
    for (const n of netze) {
        const ta = n.o.geometry.attributes.aTon;
        const auge = /^(eye|iris|pupil|cornea)$/.test(n.k);
        for (let t = 0; t < n.I.length; t += 3) {
            const e = [n.I[t], n.I[t + 1], n.I[t + 2]];
            const [A, B, C] = e.map((i) => [(n.P[3 * i] - x0) * sk, (y1 - n.P[3 * i + 1]) * sk, n.P[3 * i + 2]]);
            if (Math.max(A[0], B[0], C[0]) < 0 || Math.min(A[0], B[0], C[0]) > W) continue;
            if (Math.max(A[1], B[1], C[1]) < 0 || Math.min(A[1], B[1], C[1]) > H) continue;
            rasterDreieck(A[0], A[1], B[0], B[1], C[0], C[1], { nu: W, nv: H }, (o, w0, w1, w2) => {
                const z = w0 * A[2] + w1 * B[2] + w2 * C[2];
                if (z <= tiefe[o]) return;
                const i = e[w0 >= w1 && w0 >= w2 ? 0 : w1 >= w2 ? 1 : 2];
                [tiefe[o], wer[o]] = [z, auge ? 2 : ta && Math.round(ta.getX(i)) === tS ? 1 : 0];
            });
        }
    }
    let [haut, hoehle] = [0, 0];
    for (let o = 0; o < W * H; o++) if (wer[o] === 0 || wer[o] === 1) (haut++, (hoehle += wer[o]));
    return haut ? hoehle / haut : NaN;
}
// DAS GESICHT DER MENGE (w28-satz-menge, KOPF_SOLL mengeGesicht): der Leib der Menge (Ofen L2) ist EINE Hülle ohne Auge, Braue und
// Lippe — die Züge seines Baus reisen als Beipack der Stufe (foundry `__gesichtFern`: `__skelett.gesicht`), der Stoff des Satzes
// zeichnet sie (stoff-gang `_gangSeite`; der Wirt bricht laut, wo die Stufe sie nicht trägt: `_bewohnerSatz`). Gemessen gegen den
// Guss der NAHEN Stufe (L0) desselben Genoms, im selben Rahmen: (1) der Radius des Augapfels ±5 %, (2) beide Augen-Mitten an den
// Mitten der Augäpfel (≤ 0,5 R: die Vorlage des Leib-Raums trägt den Kopf 0,26 R tiefer und 0,36 R weiter vorn als der nahe Guss), (3) die Lidspalte und die Iris sind die des Gesetzes (auge.lid, die Iris-Kugel), (4) der Mund im
// Kasten der Lippen-Ecken der nahen Haut, seine Breite ±30 %, (5) jede Braue im Kasten der Brauen-Ecken ihrer Seite, (6) die festen
// Farben stehen (das Weiß heller als die Iris). mengeGesicht = der Anteil der sechs, der hält. Am Stand davor (main 2b826a89) trug
// der Beipack kein Gesicht: 0 — der Satz der Bewohner zeigte EINE Fläche unter der Haar-Kappe.
function messeMengeGesicht(sb, eingriff) {
    const K = sb.__koerperCore;
    const kern = eingriff && eingriff.kern ? eingriff.kern(K) : K;
    const G = sb.BAKERS_BY_KIND.koerper(kern, "mensch", 1, 2, null).userData.__skelett.gesicht;
    if (!G) return { mengeGesicht: 0 };
    const netze = K.gussNetze(sb.BAKERS_BY_KIND.koerper(kern, "mensch", 1, 0, null), false).filter((n) => n.I);
    const kasten = (P, wahl) => {
        const b = [Infinity, -Infinity, Infinity, -Infinity, Infinity, -Infinity];
        for (let i = 0; i < P.length / 3; i++)
            if (!wahl || wahl(i))
                for (let d = 0; d < 3; d++) [b[2 * d], b[2 * d + 1]] = [Math.min(b[2 * d], P[3 * i + d]), Math.max(b[2 * d + 1], P[3 * i + d])]; // prettier-ignore
        return b;
    };
    const mitte = (b) => [(b[0] + b[1]) / 2, (b[2] + b[3]) / 2, (b[4] + b[5]) / 2];
    const innen = (b, p, rand = 0) => p[0] >= b[0] - rand && p[0] <= b[1] + rand && p[1] >= b[2] - rand && p[1] <= b[3] + rand;
    const baelle = ["eyeL", "eyeR"].map((j) => kasten(netze.find((n) => n.k === "eye" && n.j === j).P));
    const R = (baelle[0][1] - baelle[0][0]) / 2;
    const haut = netze.find((n) => n.k === "haut" && n.j === "head");
    const ton = haut.o.geometry.attributes.aTon;
    const zone = (klasse, seite) => kasten(haut.P, (i) => Math.round(ton.getX(i)) === K.menschTon(klasse) && (!seite || seite * haut.P[3 * i] > 0)); // prettier-ignore
    const [lippen, brauL, brauR] = [zone("lips"), zone("braue", -1), zone("braue", 1)];
    const AU = K.MENSCH_GESTALT.auge;
    const nah = (a, b, tol) => Math.abs(a - b) <= tol;
    const haelt = [
        nah(G.r, R, 0.05 * R),
        [0, 1].every((s) => Math.hypot(...mitte(baelle[s]).map((x, d) => x - G.augen[3 * s + d])) <= 0.5 * R),
        nah(G.spalt[0], AU.lid.winkel / 0.12, 1e-3) && nah(G.spalt[1], AU.lid.oben / 0.12, 1e-3) && nah(G.spalt[2], AU.lid.unten / 0.12, 1e-3) && G.iris[0] > 0.3 && G.iris[0] < 0.6 && G.iris[2] > 0 && G.iris[2] < G.iris[0], // prettier-ignore
        innen(lippen, G.mund, 0.2 * R) && nah(G.mund[3], (lippen[1] - lippen[0]) / 2, 0.3 * G.mund[3]),
        innen(brauL, G.brauen, 0.2 * R) && innen(brauR, G.brauen.slice(5), 0.2 * R),
        G.fest.length === 9 && luma709(G.fest, 0) > luma709(G.fest, 3) && G.mundLinie.length === 3,
    ];
    return { mengeGesicht: haelt.filter(Boolean).length / haelt.length, mengeGesichtZuege: +haelt.map((x) => +x).join("") };
}
// die Frau (der Mann steht in `messeKopf`, jedes Genom der Menge in `kopfJe`)
const messeOrbitaFrau = (so, taeter = {}) => {
    const K = so.__koerperCore,
        kern = taeter.kern ? taeter.kern(K) : K;
    const dials = { ...K.START_PARAMS, gender: 0 };
    return orbitaAmGuss(
        K,
        kern,
        so.BAKERS_BY_KIND.koerper(kern, "mensch", 1, 0, { dials }),
        baue(so, null, dials).B.parts
    );
};
function messeKopf(sb, eingriff) {
    const T = sb.THREE;
    const K = sb.__koerperCore;
    const S = K.KOPF_SOLL || {};
    // (1) das Gesetz: die Lage-Verhältnisse
    const { B } = baue(sb, eingriff && eingriff.gesetz, eingriff && eingriff.dials);
    const P = B.parts;
    const lage = (n) => new T.Vector3().setFromMatrixPosition(n.matrixWorld);
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
    // (2) der Ofen L0: die Hornhaut vor der Haut, das freie Auge, das Haar als Volumen und die Dreiecke urteilt das Gesetz am Guss
    // (koerper-core `kopfGussUrteil`; die Haarlinie aus der Kopfhöhe OHNE Haar, in Pupillen-Abständen), die Töne die Linse
    const kern = eingriff && eingriff.kern ? eingriff.kern(K) : K;
    const g = sb.BAKERS_BY_KIND.koerper(kern, "mensch", 1, 0, eingriff && eingriff.dials ? { dials: eingriff.dials } : null); // prettier-ignore
    let hautK;
    g.traverse((n) => n.isMesh && n.material.userData.__klasse === "haut" && n.userData.__assetJoint === "head" && (hautK = n)); // prettier-ignore
    // DIE TÖNE DES GUSSES (mensch.K4): je Ton der Kopf-Haut (`aTon`, koerper `menschTon`) seine Albedo in CIELAB — die Farbe
    // seiner hellsten Ecke (die Verdeckung der Haut dunkelt nur, die Mund-Linie ist dunkler: die hellste trägt den Ton genau):
    // die Haut, die Lippe, die Augenhöhle (der Ton der Haut am Auge) und die Braue
    const { color: ca, aTon: tonA } = hautK.geometry.attributes;
    const labTon = (k) => lab(...(Array.from({ length: ca.count }, (_, i) => [ca.getX(i), ca.getY(i), ca.getZ(i)]).filter((c, i) => tonA && tonA.getX(i) === K.menschTon(k)).sort((a, b) => luma709(b) - luma709(a))[0] || [NaN, NaN, NaN])); // prettier-ignore
    const [lH, lL, lS, lB] = ["skin", "lips", "socket", "braue"].map(labTon);
    const luma = Object.values(K.SKIN_TONES).map((t) => luma709(linHex(t.hex)));
    // DIE LIDSPALTE (w28-gesicht, KOPF_SOLL lidSpalt): am Gesetz, im Raum des Auges — die Vorderseite des Augapfels, die kein Lid
    // deckt (das Lid ist eine Schale um ihn, koerper `_lidSchale`), ihre Höhe / ihre Breite: die Mandel. Zwei flache Lider über
    // und unter dem Augapfel ließen ihn rings um die Iris frei (der Starr-Blick: die Höhe der freien Fläche nahe der des Augapfels).
    const lidSpalt = (() => {
        const kug = aug.eyeL.children.find((c) => c.isMesh);
        const R = kug.geometry.parameters.radius,
            sy = kug.scale.y;
        const lider = [P.lidTL, P.lidBL].map((l) => ({ c: l.position, a: l.geometry.parameters.radius * l.scale.x, b: l.geometry.parameters.radius * l.scale.y, cz: l.geometry.parameters.radius * l.scale.z })); // prettier-ignore
        let [xa, xb, ya, yb] = [Infinity, -Infinity, Infinity, -Infinity];
        const n = 240;
        for (let i = 0; i <= n; i++)
            for (let j = 0; j <= n; j++) {
                const x = R * ((2 * i) / n - 1),
                    y = R * sy * ((2 * j) / n - 1),
                    q = 1 - (x / R) ** 2 - (y / (R * sy)) ** 2;
                if (q <= 0) continue;
                const z = R * Math.sqrt(q);
                const imLid = (l) =>
                    ((x - l.c.x) / l.a) ** 2 + ((y - l.c.y) / l.b) ** 2 + ((z - l.c.z) / l.cz) ** 2 < 1;
                if (lider.some(imLid)) continue;
                [xa, xb, ya, yb] = [Math.min(xa, x), Math.max(xb, x), Math.min(ya, y), Math.max(yb, y)];
            }
        return (yb - ya) / (xb - xa);
    })();
    // DAS LID ZU (w28-gesicht, KOPF_SOLL lidZu): am Gesetz, im Raum des Auges — der Anteil der Vorderseite von Iris und Pupille, der bei
    // geschlossenem Lid (koerper `lidLage(1)`) vor BEIDEN Lidern steht. Die Schale hinter dem Augapfel deckte die Wölbung der
    // Iris nie: sie stand durch das geschlossene Lid.
    const lidZu = (() => {
        const [ly, lz] = kern.lidLage(1);
        const ell = (l, c) => ({ c, a: l.geometry.parameters.radius * l.scale.x, b: l.geometry.parameters.radius * l.scale.y, cz: l.geometry.parameters.radius * l.scale.z }); // prettier-ignore
        const lider = [ell(P.lidTL, { x: 0, y: ly, z: lz }), ell(P.lidBL, P.lidBL.position)];
        const kugeln = aug.eyeL.children.filter((c) => c.isMesh && /^(iris|pupil)$/.test(c.material.userData.__klasse));
        let n = 0,
            frei = 0;
        for (const k of kugeln) {
            const r = k.geometry.parameters.radius;
            for (let i = 0; i <= 24; i++)
                for (let j = 0; j <= 48; j++) {
                    const th = (i / 24) * (Math.PI / 2),
                        ph = (j / 48) * 2 * Math.PI;
                    const p = [k.position.x + r * k.scale.x * Math.sin(th) * Math.cos(ph), k.position.y + r * k.scale.y * Math.sin(th) * Math.sin(ph), k.position.z + r * k.scale.z * Math.cos(th)]; // prettier-ignore
                    n++;
                    if (
                        !lider.some(
                            (l) =>
                                ((p[0] - l.c.x) / l.a) ** 2 +
                                    ((p[1] - l.c.y) / l.b) ** 2 +
                                    ((p[2] - l.c.z) / l.cz) ** 2 <
                                1
                        )
                    )
                        frei++;
                }
        }
        return frei / n;
    })();
    // DER WULST DES GESCHLOSSENEN LIDS (w28-auge, KOPF_SOLL lidWulst): am Gesetz, im Raum des Auges — die Front des geschlossenen
    // Oberlids (koerper `lidLage(1)`) vor der Front des Augapfels, in Augapfel-Radien. Ein Lid ist Haut über dem Auge: mit 0,29
    // (die Schale ritt 0,04 vor, um die Iris-Kugel 0,150 zu decken) stand es als Kugel vor dem Gesicht.
    const lidWulst = (() => {
        const ball = aug.eyeL.children.find((c) => c.isMesh && c.material.userData.__klasse === "eye");
        const R = ball.geometry.parameters.radius * ball.scale.z;
        return (kern.lidLage(1)[1] + P.lidTL.geometry.parameters.radius * P.lidTL.scale.z - R) / R;
    })();
    const spalte = lidSchulterAmGuss(kern, g);
    return {
        lidSpalt,
        lidZu,
        lidWulst,
        lidSchulter: spalte.schulter,
        augeWeiss: spalte.weiss,
        ...orbitaAmGuss(K, kern, g, P),
        hoehleVorn: hoehleVornAmGuss(K, g),
        augenLinie: (yAuge - yKinn) / kH,
        augenSpalt: (ipd - augW) / augW,
        mundZuPupille: spanne(lippen, 0).l / ipd,
        ohrOben: (op.b - yAuge) / kH,
        ohrUnten: (op.a - yNase) / kH,
        ohrLaenge: op.l / kH,
        ...K.kopfGussUrteil(g, ((S.haarLinie || 0.8) * kH) / ipd),
        lippeL: lL[0] - lH[0],
        lippeA: lL[1] - lH[1],
        hoehleL: lS[0] - lH[0],
        hoehleA: lS[1] - lH[1],
        hautAlbedoMin: Math.min(...luma),
        hautAlbedoMax: Math.max(...luma),
        // DIE BRAUE (mensch.K4): ihr Ton gegen die Haut (|ΔL*|)
        brauKontrast: Math.abs(lB[0] - lH[0]),
    };
}
// DAS GESICHT DER GROBSTUFE (w28-gesicht-grob — die Bänder KOPF_SOLL grobAugeFrei · grobLose · grobToene · grobKopfDreiecke): am Guss
// des Ofens L1, dem Leib, den die Welt ab 40 m und vor dem ersten Weltbild zeigt. Der Kopf ist, was STARR am Gelenk head oder an
// einem Gelenk des Auges hängt (jede Ecke des Dreiecks trägt es ganz: die Haut des Kopfs über der Naht, Augen, Lider). grobAugeFrei = der Anteil des Kastens um
// den linken Augapfel (von vorn, das EINE Dreiecks-Raster), in dem Sklera, Iris oder Pupille vorn stehen — 0, wenn die Haut das
// Auge deckt (die Blase des Leib-Rasters), über dem Band ohne Lider (der Starr-Blick). grobLose = die Dreiecke am Kopf, die weder
// Haut noch Auge noch Lid sind (Nasen-Kugeln, Lippen-Scheiben, Falten-Stäbe, Höhlen-Kugeln, die Kappe als Primitiv: was die
// Haut trägt, lebt in ihr). grobToene = der Anteil der vier Töne des Gesichts (Lippe, Höhle, Braue, Haar), die die Haut des Kopfs
// trägt. grobKopfDreiecke = die Dreiecke des Kopfs (der Deckel des Ofens). Der Täter: `{ kern }` (der Kern, mit dem der Ofen gießt).
const messeGrob = (so, taeter = {}) => {
    const K = so.__koerperCore;
    const g = so.BAKERS_BY_KIND.koerper(taeter.kern ? taeter.kern(K) : K, "mensch", 1, 1, null);
    const sj = g.userData.__skelett.skinJoints;
    const [jK, jLid] = [/^(head|eye[LR]|iris[LR]|lid[TB][LR])$/, /^lid/].map(
        (re) => new Set(sj.map((nm, i) => (re.test(nm) ? i : -1)))
    );
    const netze = K.gussNetze(g, false).filter((n) => n.I);
    const amKopf = (n) => {
        const { skinIndex: si, skinWeight: sw } = n.o.geometry.attributes;
        const ecke = (e, J) => [0, 1, 2, 3].some((k) => J.has(si.array[4 * e + k]) && sw.array[4 * e + k] > 0.999);
        return (t, J = jK) => ecke(n.I[t], J) && ecke(n.I[t + 1], J) && ecke(n.I[t + 2], J);
    };
    const mitte = (n, t) =>
        [0, 1, 2].map((d) => (n.P[3 * n.I[t] + d] + n.P[3 * n.I[t + 1] + d] + n.P[3 * n.I[t + 2] + d]) / 3);
    // die Dreiecke des Kopfs je Netz
    const kopf = netze
        .map((n) => ({ n, an: amKopf(n) }))
        .map(({ n, an }) => ({
            n,
            an,
            T: Array.from({ length: n.I.length / 3 }, (_, i) => 3 * i).filter((t) => an(t)),
        }));
    // die Augäpfel (Klasse eye): je Seite ihr Kasten
    const kasten = [1, -1].map((seite) => {
        const b = [Infinity, -Infinity, Infinity, -Infinity, Infinity, -Infinity];
        for (const { n, T } of kopf)
            if (n.k === "eye")
                for (const t of T)
                    if (mitte(n, t)[0] * seite > 0)
                        for (const e of [n.I[t], n.I[t + 1], n.I[t + 2]])
                            for (let d = 0; d < 3; d++)
                                [b[2 * d], b[2 * d + 1]] = [
                                    Math.min(b[2 * d], n.P[3 * e + d]),
                                    Math.max(b[2 * d + 1], n.P[3 * e + d]),
                                ];
        return b;
    });
    if (!kasten.every((b) => b[1] > b[0]))
        return { grobAugeFrei: 0, grobLose: NaN, grobToene: 0, grobKopfDreiecke: NaN };
    let [alle, lose] = [0, 0];
    const toene = new Map();
    for (const { n, an, T } of kopf) {
        alle += T.length;
        const auge = /^(eye|iris|pupil)$/.test(n.k);
        const tA = n.o.geometry.attributes.aTon;
        for (const t of T) {
            if (n.k === "haut") toene.set(tA.array[n.I[t]], (toene.get(tA.array[n.I[t]]) || 0) + 1);
            else if (!auge && !(n.k === "skin" && an(t, jLid))) lose++;
        }
    }
    // das Auge von vorn: der Kasten des linken Augapfels, jedes Dreieck des Gusses im Tiefen-Puffer
    const [x0, x1, y0, y1] = kasten[0];
    const W = 96,
        sk = W / (x1 - x0),
        H = Math.ceil((y1 - y0) * sk);
    const tiefe = new Float32Array(W * H).fill(-Infinity),
        wer = new Uint8Array(W * H);
    for (const n of netze) {
        const id = /^(eye|iris|pupil)$/.test(n.k) ? 1 : 2;
        const p = (e) => [(n.P[3 * e] - x0) * sk, (y1 - n.P[3 * e + 1]) * sk, n.P[3 * e + 2]];
        for (let t = 0; t < n.I.length; t += 3) {
            const [A, B, C] = [p(n.I[t]), p(n.I[t + 1]), p(n.I[t + 2])];
            if (
                Math.max(A[0], B[0], C[0]) < 0 ||
                Math.min(A[0], B[0], C[0]) > W ||
                Math.max(A[1], B[1], C[1]) < 0 ||
                Math.min(A[1], B[1], C[1]) > H
            )
                continue;
            rasterDreieck(A[0], A[1], B[0], B[1], C[0], C[1], { nu: W, nv: H }, (o, w0, w1, w2) => {
                const z = w0 * A[2] + w1 * B[2] + w2 * C[2];
                if (z > tiefe[o]) [tiefe[o], wer[o]] = [z, id];
            });
        }
    }
    const gesicht = ["lips", "socket", "braue", "haarKappe"].map((k) => K.menschTon(k));
    return {
        grobAugeFrei: wer.reduce((a, w) => a + (w === 1 ? 1 : 0), 0) / (W * H),
        grobLose: lose,
        grobToene: gesicht.filter((t) => toene.get(t) >= 8).length / gesicht.length,
        grobKopfDreiecke: alle,
    };
};
// DIE KALOTTE (w28-kopf-kalotte, koerper-core `kalotteUrteil` — die Bänder KOPF_SOLL kalotteBreite · kalotteHalt · scheitelHalt ·
// ohrStand): am KAHLEN Guss des Ofens L0 (hairStyle glatze, nackt; die Kappe des Haars gießt sonst in die Kopf-Haut) je Geschlecht.
// Die Kuppel hält ihre Breite bis unter den Scheitel (das spitze Ei mit Schläfen-Lappen verlor sie: 0,760 und 0,628 an main
// 4c1b5dc5), das Ohr steht vor der Seite des Kopfs. Der Täter: `{ kern }` (der Kern, mit dem der Ofen gießt).
const messeKalotte = (so, taeter = {}) => {
    const K = taeter.kern ? taeter.kern(so.__koerperCore) : so.__koerperCore;
    return Object.fromEntries(
        [1, 0].map((gender) => {
            const g = so.BAKERS_BY_KIND.koerper(K, "mensch", 1, 0, { dials: { top: "none", bottom: "none", shoes: "none", hairStyle: "glatze", gender } }); // prettier-ignore
            return [gender ? "mann" : "frau", so.__koerperCore.kalotteUrteil(g)];
        })
    );
};
const urteileKalotte = (so, m) => Object.entries(m).flatMap(([wer, x]) => (Object.keys(x).length ? urteile(so, x, "KOPF_SOLL") : ["nicht messbar (keine Kopf-Haut im Guss)"]).map((f) => `kalotte.${wer} ${f}`)); // prettier-ignore
// DIE EINE HAUT IM GUSS (w21-leib-bau, koerper-core `leibUrteil` — die Bänder LEIB_SOLL): am Ofen L0 die Naht der Kopf-Haut an der
// Haut des Leibs in Ruhe und unter dem Kopf in Pose, die Säume der Stoffe aus der Haut, die Splitter der Haut, nackt der Bauch. Der
// Täter: `guss(g)` am Guss, oder `{ kern }` (der Kern, mit dem der Ofen gießt).
const messeLeib = (so, taeter = () => {}) => {
    const K = taeter.kern ? taeter.kern(so.__koerperCore) : so.__koerperCore;
    return so.__koerperCore.leibUrteil(
        ...[null, { dials: { top: "none", bottom: "none", shoes: "none" } }].map((ov) => {
            const g = so.BAKERS_BY_KIND.koerper(K, "mensch", 1, 0, ov);
            if (typeof taeter === "function") taeter(g);
            return g;
        })
    );
};

// DAS KLEID (w28-leib-nah, koerper-core `kleidUrteil` — die Bänder KLEID_SOLL): am Ofen L0 je Tracht (Hemd, Pullover, Poncho, über
// der kurzen Hose) der EINE Saum des Oberteils als Linie und der Bund der Hose; dazu die Tracht-Verhältnisse — der Poncho fällt
// tiefer und weiter als das Hemd, im Guss (`guss`) und im Satz der Menge (`menge`, Stufe 2: die Tiefe des Leibs von Brust zu
// Rücken — seine Breite tragen die Arme). Bis w28-leib-nah
// war der Poncho eine geschlossene Hülle über den Teil-Kugeln (kein Rand), der Rand des Hemds lief als zwei Ringe um die Schenkel.
// DER SCHUH (am Hemd, gegen denselben Leib ohne Schuh): seine Lage über der Fuß-Haut, seine Sohle auf ihrer Unterkante, die Linie
// seines Schafts — er ist der Guss des Fußes, um seine Dicke gehoben (bis w28-leib-nah eine Voxel-Hülle über den Teil-Punkten).
// Der Täter: `{ kern }` (der Kern, mit dem der Ofen gießt) oder eine Funktion am Guss.
const KLEID_TRACHTEN = ["tshirt", "pullover", "poncho"];
const messeKleid = (
    so,
    taeter = {},
    was = "alles",
    K = taeter.kern ? taeter.kern(so.__koerperCore) : so.__koerperCore
) => {
    const guss = (top, lod, shoes) => { const g = so.BAKERS_BY_KIND.koerper(K, "mensch", 1, lod, { dials: { top, bottom: "shorts", ...(shoes ? { shoes } : {}) } }); if (typeof taeter === "function") taeter(g); return g; }; // prettier-ignore
    const tiefe = (g, [a, b] = [Infinity, -Infinity]) => { for (const n of so.__koerperCore.gussNetze(g, false)) for (let i = 2; i < n.P.length; i += 3) [a, b] = [Math.min(a, n.P[i]), Math.max(b, n.P[i])]; return b - a; }; // prettier-ignore
    const m = was === "menge" ? {} : Object.fromEntries((was === "schuh" ? ["tshirt"] : KLEID_TRACHTEN).map((t) => [t, so.__koerperCore.kleidUrteil(guss(t, 0), { top: t, bottom: "shorts" }, t === "tshirt" ? guss(t, 0, "none") : null)])); // prettier-ignore
    if (was === "schuh") return m;
    m.tracht = {
        ...(was === "menge"
            ? {}
            : {
                  ponchoTiefer: m.tshirt.saumY - m.poncho.saumY,
                  ponchoWeiter: m.poncho.saumUmfang / m.tshirt.saumUmfang,
              }),
        ...(was === "guss" ? {} : { ponchoMengeWeiter: tiefe(guss("poncho", 2)) / tiefe(guss("tshirt", 2)) }),
    };
    return m;
};
const urteileKleid = (so, m) =>
    Object.entries(m).flatMap(([t, x]) => urteile(so, x, "KLEID_SOLL").map((f) => `kleid.${t} ${f}`));

// DIE HAND DER MENGE (w28-satz-hand): der Satz trägt die Hand des nahen Leibs. Am Ofen derselbe Leib (der Mann im Hemd, im
// Pullover und im Poncho, die Frau im Pullover — die langen Ärmel nennen den Ellbogen, unter dem die Hand hängt) nah (L0: die
// Hand-Haut am Gelenk) und in der Menge (L2: die Dreiecke, deren Ecken mehrheitlich am Gelenk der Hand hängen), je Hand entlang
// des Unterarms: die Länge über das Handgelenk hinaus und jenseits der Naht zum Unterarm (ab einem Fünftel der nahen Länge —
// dort hängt nah die Haut des Arms über der Hand, fern die Naht des Gusses) die BEDECKTE FLÄCHE von vorn (die Ebene der
// Handfläche: die Lücken der Finger, der Daumen) und von der Seite (die flache Hand), als Abweichung der Menge in %. Die
// Ausdehnung allein unterscheidet die Faust nicht von der offenen Hand: der Klumpen füllt denselben Kasten (das Dorf im Poncho:
// Länge +2,7 %, Breite +1,4 %, Dicke −2,2 % — im Bild die Faust). Bis w28-satz-hand erbte die Hand der Menge zudem die Zone des
// Ärmels (foundry-core `__mengenPrims`), wo ein Oberteil den Ellbogen nennt.
// Der Täter: `{ kern }` (der Kern, mit dem der Ofen gießt).
// das Band je Maß in % gegen die nahe Hand: der Klumpen (die Faust: +24…+42 % Fläche) liegt über ihm, die zerfallenen Finger
// (ohne Verrundung und Zuschlag auf dem Raster der Menge: −51…−61 %) unter ihm; 20 % der Hand sind bei 9 m 1–2 Bildpunkte
const HAND_MENGE_SOLL = { laenge: [-20, 20], vorn: [-20, 10], seite: [-20, 10] };
const HAND_MENGE_ZELLE = 0.004; // E, das Raster der bedeckten Fläche (die Hand misst ~0,46 E)
const messeHandMenge = (so, taeter = {}, K = taeter.kern ? taeter.kern(so.__koerperCore) : so.__koerperCore) => {
    const KC = so.__koerperCore;
    const m = {};
    for (const [wer, dials] of [["hemd", {}], ["pullover", { top: "pullover" }], ["poncho", { top: "poncho" }], ["frauPullover", { gender: 0, top: "pullover" }]]) { // prettier-ignore
        const netze = (lod, g = so.BAKERS_BY_KIND.koerper(K, "mensch", 1, lod, { dials })) => Object.assign(KC.gussNetze(g, false), { namen: g.userData.__skelett.skinJoints }); // prettier-ignore
        const [nah, fern] = [netze(0), netze(2)];
        for (const sd of ["1", "-1"]) {
            // die Dreiecke der Hand im Raum des Unterarms: [s entlang, w quer in der Handfläche, t durch sie] je Ecke
            const hand = (N) => {
                const [W, E] = [N.lage("hand" + sd), N.lage("elbow" + sd)];
                const nz = ([x, y, z], l = Math.hypot(x, y, z)) => [x / l, y / l, z / l];
                const a = nz([W[0] - E[0], W[1] - E[1], W[2] - E[2]]);
                const w = nz([a[1], -a[0], 0]); // a × z
                const t = [a[1] * w[2] - a[2] * w[1], a[2] * w[0] - a[0] * w[2], a[0] * w[1] - a[1] * w[0]];
                const T = [];
                for (const n of N) {
                    const ecke = (i) => [a, w, t].map((ax) => ax.reduce((s, c, d) => s + c * (n.P[3 * i + d] - W[d]), 0));
                    const I = n.I || Array.from({ length: n.P.length / 3 }, (_, i) => i);
                    // die geskinnte Hülle (die Menge) zählt ihre Ecken am stärksten Gewicht, die starre (nah) an ihrem Gelenk
                    let amGelenk = null;
                    if (n.haut) {
                        const [si, sw] = [n.o.geometry.attributes.skinIndex, n.o.geometry.attributes.skinWeight];
                        amGelenk = (i) => {
                            let [b, bw] = [0, -1];
                            for (let k = 0; k < 4; k++) if (sw.getComponent(i, k) > bw) [bw, b] = [sw.getComponent(i, k), si.getComponent(i, k)];
                            return N.namen[b] === "hand" + sd;
                        };
                    } else if (!(n.j === "hand" + sd && n.k === "haut")) continue;
                    for (let f = 0; f < I.length; f += 3) {
                        const ix = [I[f], I[f + 1], I[f + 2]];
                        if (amGelenk && ix.filter(amGelenk).length < 2) continue;
                        T.push(ix.map(ecke));
                    }
                }
                return T;
            };
            const [hn, hf] = [hand(nah), hand(fern)];
            const L = (T) => Math.max(0, ...T.flat().map((q) => q[0]));
            const s0 = 0.2 * L(hn);
            // die bedeckte Fläche jenseits von s0 in der Ebene (s, k): die Zellen, deren Mitte in einem Dreieck liegt
            const flaeche = (T, k, c = HAND_MENGE_ZELLE) => {
                const zellen = new Set();
                for (const d of T) {
                    const [p, q, r] = d.map((e) => [e[0], e[k]]);
                    const det = (q[0] - p[0]) * (r[1] - p[1]) - (r[0] - p[0]) * (q[1] - p[1]);
                    if (!det) continue;
                    const [u0, u1] = [Math.max(s0, Math.min(p[0], q[0], r[0])), Math.max(p[0], q[0], r[0])];
                    const [v0, v1] = [Math.min(p[1], q[1], r[1]), Math.max(p[1], q[1], r[1])];
                    for (let i = Math.floor(u0 / c); i * c <= u1; i++)
                        for (let j = Math.floor(v0 / c); j * c <= v1; j++) {
                            const [x, y] = [(i + 0.5) * c, (j + 0.5) * c];
                            if (x < s0) continue;
                            const l1 = ((q[0] - x) * (r[1] - y) - (r[0] - x) * (q[1] - y)) / det;
                            const l2 = ((r[0] - x) * (p[1] - y) - (p[0] - x) * (r[1] - y)) / det;
                            if (l1 >= 0 && l2 >= 0 && l1 + l2 <= 1) zellen.add(i * 4096 + j);
                        }
                }
                return zellen.size * c * c;
            };
            const pct = (f, n) => (n > 0 ? +(((f - n) / n) * 100).toFixed(1) : null);
            m[`${wer}${sd === "1" ? "R" : "L"}`] = { laenge: pct(L(hf), L(hn)), vorn: pct(flaeche(hf, 1), flaeche(hn, 1)), seite: pct(flaeche(hf, 2), flaeche(hn, 2)), dreiecke: hf.length }; // prettier-ignore
        }
    }
    return m;
};
const urteileHandMenge = (m) =>
    Object.entries(m).flatMap(([wer, x]) => [
        ...(x.dreiecke < 8 ? [`menge.hand ${wer} ohne Hand (${x.dreiecke} Dreiecke am Gelenk)`] : []),
        ...["laenge", "vorn", "seite"]
            .filter((k) => !(x[k] >= HAND_MENGE_SOLL[k][0] && x[k] <= HAND_MENGE_SOLL[k][1]))
            .map((k) => `menge.hand ${wer} ${k} ${x[k]} % gegen die nahe Hand (Soll ${HAND_MENGE_SOLL[k][0]} … +${HAND_MENGE_SOLL[k][1]} %)`),
    ]);

// DIE FLANKE DER MENGE (w28-gestalt-norm): der Rumpf des Satzes weicht dem ruhenden Arm wie der des nahen Leibs. Am Ofen
// derselbe Leib (die Vorlage des Leib-Raums) im Poncho und im Pullover nah (L0) und in der Menge (L2), in der Ruhe: je Höhe der Flanke
// (y 3,1 … 3,8 E, zwischen Hüfte und Ellbogen) die BEDECKTE Strecke quer durch die Mitte des Leibs — der Rumpf samt Stoff bis zur
// ersten Luft neben ihm; schließt der Satz die Luft zum Arm, läuft sie bis an seine Außenkante. Das Maß: die größte Abweichung
// der Menge in % (`breit`, wo beide Luft zeigen) und die Zahl der Höhen, an denen nah sichtbare Luft steht und fern keine (`zu`). Bis w28-gestalt-norm wich
// erst das Netz der Zeile (Kante 0,21 E, keine Ecke unter dem Arm, keine Entspannung): die Lappen des Ponchos standen vor und
// hinter dem Arm (Vorlage des Poncho-Dorfs 0x51ed: Rumpf +0,05…+0,13 E je Seite, die Luft an zwei von acht Höhen zu).
// Der Täter: `{ kern }` (der Kern, mit dem der Ofen gießt).
const FLANKE_MENGE_SOLL = { breit: [-12, 12], zu: [0, 0] };
const FLANKE_MENGE_LUFT = 0.05; // E (~1,6 cm, bei 9 m knapp zwei Bildpunkte): ab dieser Luft des nahen Leibs zählt eine geschlossene Höhe
const messeFlankeMenge = (so, taeter = {}, K = taeter.kern ? taeter.kern(so.__koerperCore) : so.__koerperCore) => {
    const KC = so.__koerperCore;
    const m = {};
    for (const [wer, tracht] of [["poncho", { top: "poncho" }], ["pullover", { top: "pullover" }]]) { // prettier-ignore
        // (die Stufe der Menge gießt die Vorlage ihres Leib-Raums: der nahe Leib steht an denselben Dials, koerper `leibRaumVorlage`)
        const dials = KC.leibRaumVorlage(tracht);
        const mitte = (lod) => {
            const N = KC.gussNetze(so.BAKERS_BY_KIND.koerper(K, "mensch", 1, lod, { dials }), false);
            const T = [];
            for (const n of N) {
                if (!n.I) continue;
                for (let f = 0; f < n.I.length; f += 3) T.push([0, 1, 2].map((k) => [n.P[3 * n.I[f + k]], n.P[3 * n.I[f + k] + 1]]));
            }
            // je Höhe die Strecken des Schnitts, verschmolzen; die Strecke über x = 0 ist der Rumpf, [Breite, Zahl der Strecken]
            const aus = [];
            for (let y = 3.1; y < 3.85; y += 0.1) {
                const seg = [];
                for (const t of T) {
                    let [a, b] = [Infinity, -Infinity];
                    for (let k = 0; k < 3; k++) {
                        const [p, q] = [t[k], t[(k + 1) % 3]];
                        if ((p[1] - y) * (q[1] - y) > 0 || p[1] === q[1]) continue;
                        const x = p[0] + ((y - p[1]) / (q[1] - p[1])) * (q[0] - p[0]);
                        [a, b] = [Math.min(a, x), Math.max(b, x)];
                    }
                    if (b >= a) seg.push([a, b]);
                }
                seg.sort((p, q) => p[0] - q[0]);
                const M = [];
                for (const q of seg) M.length && q[0] <= M[M.length - 1][1] + 0.005 ? (M[M.length - 1][1] = Math.max(M[M.length - 1][1], q[1])) : M.push(q.slice());
                const ri = M.findIndex((q) => q[0] <= 0 && q[1] >= 0);
                const r = M[ri];
                // die Luft neben dem Rumpf: der kleinere Abstand zur nächsten Strecke links und rechts (ohne Nachbar keine)
                aus.push([r ? r[1] - r[0] : 0, r && ri > 0 && ri < M.length - 1 ? Math.min(r[0] - M[ri - 1][1], M[ri + 1][0] - r[1]) : 0]);
            }
            return aus;
        };
        const [nah, fern] = [mitte(0), mitte(2)];
        // die Breite zählt, wo beide Luft zeigen; `zu`: nah steht sichtbare Luft (ab FLANKE_MENGE_LUFT), fern keine
        const pct = nah.map((n, i) => (n[1] > 0 && fern[i][1] > 0 ? ((fern[i][0] - n[0]) / n[0]) * 100 : 0));
        m[wer] = { breit: +pct.reduce((a, b) => (Math.abs(b) > Math.abs(a) ? b : a), 0).toFixed(1), zu: nah.filter((n, i) => n[1] >= FLANKE_MENGE_LUFT && !(fern[i][1] > 0)).length, luft: +Math.max(...nah.map((n) => n[1])).toFixed(3) };
    }
    return m;
};
const urteileFlankeMenge = (m) =>
    Object.entries(m).flatMap(([wer, x]) =>
        ["breit", "zu"]
            .filter((k) => !(x[k] >= FLANKE_MENGE_SOLL[k][0] && x[k] <= FLANKE_MENGE_SOLL[k][1]))
            .map((k) => `menge.flanke ${wer} ${k} ${x[k]} gegen den nahen Leib (Soll ${FLANKE_MENGE_SOLL[k][0]} … ${FLANKE_MENGE_SOLL[k][1]})`)
    );

// DER KANON (w28-leib-kanon, koerper-core `leibKanon`, die Bänder LEIB_SOLL.kanon): am Ofen L0 nackt der Mann (gender 1) und die Frau
// (gender 0) an den Start-Dials — die Maße des Rumpfs, der Schulter und der Hüfte als Anteil von H; `--kanon <ordner>` legt die
// Umrisse vorn und seitlich als PNG ab (rot die Zehntel von H, blau die Soll-Höhen von Schulter und Schritt). Täter: `{ kern }`.
// Die Breiten von Brust und Taille misst er wie ANSUR mit vom Leib gelösten Armen (derselbe Guss, arms 0,5).
const messeKanon = (so, taeter = {}, K = taeter.kern ? taeter.kern(so.__koerperCore) : so.__koerperCore) =>
    Object.fromEntries(
        ["mann", "frau"].map((gs) => {
            const d = { top: "none", bottom: "none", shoes: "none", gender: +(gs === "mann") };
            return [gs, so.__koerperCore.leibKanon(...[d, { ...d, arms: 0.5 }].map((dials) => so.BAKERS_BY_KIND.koerper(K, "mensch", 1, 0, { dials })))]; // prettier-ignore
        })
    );
const urteileKanon = (so, K, S = so.__koerperCore.LEIB_SOLL.kanon) =>
    Object.entries(K).flatMap(([gs, { m }]) => Object.entries(S[gs]).flatMap(([k, s]) => (Math.abs(m[k] / s - 1) <= S.toleranz ? [] : [`kanon.${gs} ${k} ${+m[k].toFixed(4)} ${m[k] < s ? "<" : ">"} ${+(s * (1 + (m[k] < s ? -1 : 1) * S.toleranz)).toFixed(4)}`]))); // prettier-ignore
function kanonBilder(K, ordner, S) {
    const zlib = require("zlib"), fs = require("fs"), farbe = [[255, 255, 255], [160, 120, 100], [90, 110, 170], [110, 145, 100], [200, 160, 120]]; // prettier-ignore
    const teil = (t, d) => { const l = Buffer.alloc(4), c = Buffer.alloc(4), td = Buffer.concat([Buffer.from(t), d]); l.writeUInt32BE(d.length); c.writeUInt32BE(zlib.crc32(td) >>> 0); return Buffer.concat([l, td, c]); }; // prettier-ignore
    fs.mkdirSync(ordner, { recursive: true });
    for (const [gs, k] of Object.entries(K))
        for (const ansicht of ["front", "seite"]) {
            const { w, h, px } = k[ansicht],
                roh = Buffer.alloc((3 * w + 1) * h),
                ih = Buffer.alloc(13);
            for (let r = 0; r < h; r++)
                for (let c = 0; c < w; c++) {
                    const y = h - 1 - r, linie = y % 50 === 0 ? [220, 0, 0] : [S[gs].schulterHoehe, S[gs].schritt].some((s) => Math.round(s * h) === y) ? [0, 0, 230] : null; // prettier-ignore
                    roh.set(
                        px[y * w + c] ? farbe[px[y * w + c]] : linie && c % 3 ? linie : farbe[0],
                        r * (3 * w + 1) + 1 + 3 * c
                    );
                }
            (ih.writeUInt32BE(w, 0), ih.writeUInt32BE(h, 4), (ih[8] = 8), (ih[9] = 2));
            fs.writeFileSync(require("path").join(ordner, `${gs}-${ansicht}.png`), Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), teil("IHDR", ih), teil("IDAT", zlib.deflateSync(roh)), teil("IEND", Buffer.alloc(0))])); // prettier-ignore
        }
}

// DIE GESTALT (w28-leib-kanon, koerper-core `leibFormUrteil`, die Bänder LEIB_FORM_SOLL): am Ofen nackt der Mann an den Start-Dials
// (L0) — die VERJÜNGUNG der Glieder (Umfang Oberarm ÷ Handgelenk, Oberschenkel ÷ Knie, Wade ÷ Knöchel) und die LANDMARKEN als Tiefe
// mit Vorzeichen in mm (Wirbel-Furche, Brustbein-Rinne, Kniekehle negativ; Kniescheibe, Ellbogen-Spitze positiv) — und an der
// Vorlage der Menge (Stufe 2, 1 700 Dreiecke) die Verjüngung des Beins: dieselbe Liste (koerper LEIB_RELIEF), dieselbe Gestalt.
// Am Kopf vor dem Gesetz: Arm 2,90 · Schenkel 1,12 · Wade 1,36, die Kniescheibe eine Kugel (+16,5 mm), keine Furche (−1,8 mm).
// Täter: `{ kern }` (der Kern, mit dem der Ofen gießt).
// DIE FRAU GEHÖRT DAZU (w28-leib-kanon Nummer 4c): dieselben Bänder an der Frau nackt (gender 0) — ohne die Unterkante des
// Brustmuskels: sie ist eine Landmarke des Mannes (LEIB_RELIEF.grate wiegt sie an der Frau 0,1; dort misst die Stelle s 0,49 · 28°
// die Brust, +12 mm). Bis Nummer 4c maß die Gestalt nur den Mann: die hintere Achselfalte der Frau stand 18,4 mm (Band 1–15) ungerügt.
const FORM_FRAU_OHNE = ["brustUnterkante"];
const messeForm = (so, taeter = {}, lod = 0, K = taeter.kern ? taeter.kern(so.__koerperCore) : so.__koerperCore, gender = 1) => so.__koerperCore.leibFormUrteil(so.BAKERS_BY_KIND.koerper(K, "mensch", 1, lod, { dials: { top: "none", bottom: "none", shoes: "none", gender } })); // prettier-ignore
const messeFormFrau = (so, taeter = {}) => messeForm(so, taeter, 0, undefined, 0);
const urteileForm = (so, m, nur, vor) => urteile(so, nur ? Object.fromEntries(nur.map((k) => [k, m[k]])) : m, "LEIB_FORM_SOLL").map((x) => (vor || (nur ? "form.menge " : "form ")) + x); // prettier-ignore
const urteileFormFrau = (so, m) => urteileForm(so, m, Object.keys(so.__koerperCore.LEIB_FORM_SOLL).filter((k) => !FORM_FRAU_OHNE.includes(k)), "form.frau "); // prettier-ignore

// DAS URTEIL DER BÄNDER (MENSCH_SOLL, KOPF_SOLL): je Maß sein Band (…Min/…Max im Band des Maßes), nicht messbar ist ROT
function urteile(sb, m, soll = "MENSCH_SOLL") {
    const S = sb.__koerperCore[soll];
    if (!S) return [`koerper-core ${soll} fehlt`];
    return Object.entries(m).flatMap(([k, x]) => {
        const band = S[k.replace(/(Min|Max)$/, "")];
        if (!Array.isArray(band)) return [];
        if (!Number.isFinite(x)) return [`${k} nicht messbar`];
        return x < band[0]
            ? [`${k} ${+x.toFixed(4)} < ${band[0]}`]
            : x > band[1]
              ? [`${k} ${+x.toFixed(4)} > ${band[1]}`]
              : [];
    });
}
const urteileKopf = (sb, m) => urteile(sb, m, "KOPF_SOLL");
// DER KOPF JEDES SCHNITTS (mensch.K4): die Menge trägt jeden Stil der Haar-Kappe (koerper HAAR_KAPPE) und jedes Gesicht ihres
// Genoms — KOPF_SOLL und MENSCH_SOLL gelten an jedem Stil, je an beiden Rändern von GESICHT_GENOM (Auge, Mund, Braue groß, der
// Haar-Ansatz tief — und umgekehrt). Bis w7-gesicht maß die Linse nur den Start-Stil mittel: afro begrub das Auge (augeFrei
// 0,40), afro, locken und lang trugen 12 146–12 440 Kopf-Dreiecke, kurz, zopf und dutt augenVorstand 0,0357. Jeder Stil GIESST
// dabei ganz (L0: Kopf-Haut, Kappe, jede Zeile von haarStreu mit ihrer Zone) — bis w7-gesicht goss gate:ofen-contract (3b) je Stil
// nur die Strähnen: seit haar.K2 brach die Quaste (zopf: ohne Schale `sc`), der Bewohner mit Zopf fiel aus dem Dorf.
const kopfJe = (so, kern) =>
    Object.keys(so.__koerperCore.HAAR_KAPPE).flatMap((st) =>
        [0, 1].flatMap((g) => {
            const d = { hairStyle: st, auge: g, mund: g, braue: g, haaransatz: 1 - g };
            let f;
            try {
                f = urteileKopf(so, messeKopf(so, { dials: d, kern })).concat(urteile(so, messe(so, null, d)));
            } catch (e) {
                f = [`Guss bricht: ${e.message}`];
            }
            return f.map((x) => `${st}/rand${g} ${x}`);
        })
    );

// DIE MENGE (mensch.K4 Staffel 2): 50 Bewohner aus 50 Samen je Siedlung, gerechnet von DENSELBEN Gliedern wie in der Welt
// (`_bewohnerGestalten`, `_bewohnerRaum`, `_bewohnerGenome`; der Stamm im vm, stamm.cjs `ladeKlasse`), je Plan des Fachwerk-Kerns
// seine Tracht. DIE FORM ALLEIN (w26-leib-raum): jeder Bewohner ist in der Menge sein Punkt im Leib-Raum (die Vorlage der Stufe 2
// seiner Siedlung samt Formzielen, `_leibRaumLeib` — dieselbe Rechnung wie der Knoten des Satzes) × seine Skala; die Gestalt-
// Distanz eines Paars ist der größte Weg einer Ecke zwischen ihren Leibern (dieselbe Vorlage, dieselben Ecken) in Bildpunkten am
// Rand der Nah-Wahl (BEWOHNER.nahM, 1080 Zeilen, KAM_FOV_GRAD), die Farben zählen nicht — unter 1 px ist gleich. Bis w26-leib-raum
// zählte die Linse Typ und Farbe (die Vorlage des Typs × Höhe · Breite · Tiefe): zwei Bewohner eines Typs in derselben Form trug
// nur ihre Farbe auseinander. `eingriff(A)` verzerrt die Klasse.
const MENGE_PLAENE = [0x51ed, 0x7a11]; // die Samen der Pläne (je Plan seine Epoche und Tracht)
// DIE SIEDLUNG DER MENGE (EIN Baustein für die Linsen der Menge und des Baus): der Stamm im vm, je Plan 50 Bewohner aus 50 Samen
// (`_bewohnerGestalten`, `_bewohnerGenome`) und die Vorlage der Stufe 2 in der Tracht des Plans samt Tafel, wie der Ofen sie der
// Welt gießt (Beipack `raum`). `eingriff(A, ctx)` verzerrt die Klasse oder den Kern.
function mengeWelt(eingriff, plaene = MENGE_PLAENE) {
    const { AnazhRealm: A, ctx } = require("./lib/stamm.cjs").ladeKlasse(require("path").join(__dirname, ".."));
    if (eingriff) eingriff(A, ctx);
    const r = Object.assign(Object.create(A.prototype), { state: {} });
    const siedlungen = plaene.map((seed) => {
        // je Haus zwei Leute wie `_bewohnerListe` sie stellt: der Same und die Epoche (das Jahr des Plans, Rang im Haus — koerper
        // ALTER_GESETZ ist fail-closed ohne Jahr)
        const plan = ctx.__fachwerkCore.exportSettlement({ seed, nH: 12 });
        const S = { plan, liste: [...Array(50)].map((_, i) => ({ seed: `${seed}:${i >> 1}:${i & 1}`, epoche: { jahr: plan.jahr, rang: i & 1, n: 2 } })) }; // prettier-ignore
        S.gestalten = r._bewohnerGestalten(S);
        r._bewohnerGenome(S);
        const vorlage = ctx.BAKERS_BY_KIND.koerper(ctx.__koerperCore, "mensch", 1, 2, { dials: S.raum.dK });
        return { S, vorlage, R: vorlage.userData.__skelett.raum };
    });
    return { A, ctx, r, siedlungen };
}
function messeMenge(eingriff, W = mengeWelt(eingriff)) {
    const { A } = W;
    const px = (1080 / (2 * Math.tan((A.KAM_FOV_GRAD * Math.PI) / 360)) / A.BEWOHNER.nahM) * ((8 * A.PLAYER_KH) / 6);
    const m = { gleich: 0, min: Infinity, paar: null };
    for (const { S, R } of W.siedlungen) {
        // die Ecke, wie die Matrix seines Satzes sie stellt (w28-gestalt): seine Größe, Breite und Tiefe seines Genoms
        const mal = (b) => [b.raumSkala * b.breite * px, b.raumSkala * px, b.raumSkala * b.tiefe * px];
        const je = S.liste.map((b) => [A._leibRaumLeib(R, b.raumPunkt).map((x, e) => x * mal(b)[e % 3]), b.seed]);
        je.forEach(([a, s], i) =>
            je.slice(i + 1).forEach(([c, t]) => {
                const d = Math.max(
                    ...a.map((x, e) => (e % 3 ? 0 : Math.hypot(x - c[e], a[e + 1] - c[e + 1], a[e + 2] - c[e + 2])))
                );
                if (d < 1) m.gleich++;
                if (d < m.min) [m.min, m.paar] = [d, `${s}/${t}`];
            })
        );
    }
    return m;
}
// das Urteil der Menge: Paare gleicher Gestalt (unter 1 px) höchstens MENGE_GLEICH_SOLL. Seit w28-gestalt steht im Satz die
// Form des nahen Leibs (das Weiche seiner Gestalt auf seinen Knochen, Breite und Tiefe ±restMax) — bis dahin trug der Satz den
// Punkt des eigenen Genoms, eine Vielfalt, die der nahe Leib nie hatte. Gemessen: 1 Paar von 2 450 (20973:4:0 / 20973:10:0,
// eine Gestalt, 0,91 px: Arm 1 cm), das nächste 1,55 px. Die Ratsche fällt auf 0, sobald der nahe Leib sein eigenes Weiches trägt.
const MENGE_GLEICH_SOLL = 1;
const urteileMenge = (m) => (m.gleich > MENGE_GLEICH_SOLL ? [`menge.gleich ${m.gleich} Paare unter 1 px (${m.paar}), Soll ≤ ${MENGE_GLEICH_SOLL}`] : []); // prettier-ignore

// DER BAU (w28-leib-genom, koerper BAU_GESETZ; die Bänder BAU_SOLL): das Skelett jedes Bewohners ist sein eigenes — gemessen am
// GELESENEN, mit Vorzeichen. (1) DIE STREUUNG IN DER MENGE: je Bewohner sein gezeichneter Leib der Menge (die Vorlage der Stufe 2 an
// seinem Punkt, `_leibRaumLeib`: was der Satz zeichnet), an seinen Ecken je nach dem Gelenk ihres Gewichts — bein = die Oberkante
// der Bein-Haut über der Sohle, arm = Oberkante der Arm-Haut bis Fingerspitze, schulter = die Breite über die Kappen der Oberarme,
// schulterHoehe = die Oberkante der Arm-Haut über der Sohle, je als Anteil der Höhe H des Gesetzes; gezählt wird, was SEIN BAU daran
// bewegt (sein Leib gegen denselben Punkt im Kanon des Skeletts), über die Menge als Variations-Koeffizient (%) je Maß gegen sein
// Band — „kein Paar gleich" hielt auch eine Menge von Geschwistern (derselbe Bau, verschieden beleibt). (2) DAS VORZEICHEN: je Maß
// die Korrelation dieses Wegs mit der Achse des Genoms, die es stellt (`vorzeichen`: der lange Hals senkt die Schulter). (3) DIE LESER lesen denselben Bau wie das Bild — am Bewohner mit dem weitesten Bau: der Guss
// seines Baus (Ofen L0 nackt, die Dials seiner Gestalt und seine Achsen: das Bild) gegen · knochen: der Guss seiner Gestalt auf den
// Knochen seines Baus (koerper `leibBauAuf`, der nahe Leib der Welt) — jedes Gelenk (E) und die Haut (Bein-Ansatz, Schulter,
// Fingerspitze im Umriss, H) · gang: die Beinlänge, die der Gang der Welt am Rig misst (`_gaitBeinMass`) · kette: Hüfte,
// Schulter, Reichweite und Griff, die Sitz und Griff lesen (`leibKette`) · menge: der Weg seiner Ecken im Leib-Raum gegen den
// des Gesetzes · hoehe: die Körperhöhe (die Kapsel der Kollision liest sie: der Bau ändert sie nicht) · masse: das Volumen der
// gezeichneten Haut gegen das seiner Gestalt (der nahe Leib wiegt mit dem Volumen seiner Gestalt). `eingriff(A, ctx)` verzerrt.
function messeBau(eingriff, nur, W = mengeWelt(eingriff, nur ? MENGE_PLAENE.slice(0, nur) : MENGE_PLAENE)) {
    const { A, ctx, r } = W, K = ctx.__koerperCore, T = ctx.THREE, H0 = K.labProportionen().H; // prettier-ignore
    const stat = (v) => { const n = v.length, m = v.reduce((a, b) => a + b, 0) / n; return { m, sd: Math.sqrt(v.reduce((a, b) => a + (b - m) * (b - m), 0) / (n - 1)) }; }; // prettier-ignore
    const korr = (x, y) => { const a = stat(x), b = stat(y); return x.reduce((s, xi, i) => s + (xi - a.m) * (y[i] - b.m), 0) / ((x.length - 1) * a.sd * b.sd); }; // prettier-ignore
    // die Maße eines Leibs der Menge an seinen Ecken P (Raum der Vorlage): je Ecke das Gewicht ihrer Arm- und Bein-Kette
    const ecken = (vorlage) => {
        let mesh = null;
        vorlage.traverse((o) => (mesh = mesh || (o.isMesh && o.geometry.attributes.skinIndex ? o : null)));
        const sj = vorlage.userData.__skelett.skinJoints, si = mesh.geometry.attributes.skinIndex.array, sw = mesh.geometry.attributes.skinWeight.array, n = si.length / 4; // prettier-ignore
        const gew = (re) =>
            Float32Array.from({ length: n }, (_, i) =>
                [0, 1, 2, 3].reduce((s, k) => s + (re.test(sj[si[4 * i + k]]) ? sw[4 * i + k] : 0), 0)
            );
        return {
            n,
            bein: gew(/^(hip|knee|ankle)/),
            arm: gew(/^(arm|elbow|hand)/),
            oberarm: gew(/^arm/),
            hand: gew(/^hand/),
        };
    };
    const masse = (P, E) => {
        let y0 = Infinity, beinO = -Infinity, armO = -Infinity, handU = Infinity; // prettier-ignore
        for (let i = 0; i < E.n; i++) {
            const y = P[3 * i + 1];
            y0 = Math.min(y0, y);
            if (E.bein[i] > 0.5) beinO = Math.max(beinO, y);
            if (E.arm[i] > 0.5) armO = Math.max(armO, y);
            if (E.hand[i] > 0.5) handU = Math.min(handU, y);
        }
        let sx = 0, sn = 0; // prettier-ignore
        for (let i = 0; i < E.n; i++)
            if (E.oberarm[i] > 0.5 && P[3 * i + 1] > armO - 0.05 * H0) ((sx += Math.abs(P[3 * i])), sn++);
        return {
            bein: (beinO - y0) / H0,
            arm: (armO - handU) / H0,
            schulter: (2 * sx) / sn / H0,
            schulterHoehe: (armO - y0) / H0,
        };
    };
    // (was der BAU an einem Leib der Menge bewegt: sein Leib an seinem Punkt gegen denselben Punkt im Kanon des Skeletts — das
    // Weiche, Geschlecht und Fett, trägt jeder Leib in beiden; seine Streuung halten die anderen Bänder dieser Linse)
    const SV = K.BAU_SOLL.vorzeichen, je = [], aus = { vk: {}, r: {}, leser: {} }; // prettier-ignore
    // die Bau-Achsen des Punkts beim NAMEN (LEIB_RAUM), nie als die letzten nB — der Raum trägt nach ihnen den Kreuzterm Ton × Masse
    const istBau = K.LEIB_RAUM.achsen.map((a) => K.BAU_GESETZ.achsen.some((g) => g.achse === a.achse));
    const imKanon = (p) => p.map((x, i) => (istBau[i] ? 1 : x));
    for (const { S, vorlage, R } of W.siedlungen) {
        const E = ecken(vorlage);
        for (const b of S.liste) {
            const [m, mK] = [
                masse(A._leibRaumLeib(R, b.raumPunkt), E),
                masse(A._leibRaumLeib(R, imKanon(b.raumPunkt)), E),
            ];
            je.push({ b, m, d: Object.fromEntries(Object.keys(m).map((k) => [k, m[k] - mK[k]])) });
        }
    }
    for (const k in SV) {
        const st = stat(je.map((z) => z.d[k]));
        aus.vk[k] = (100 * st.sd) / stat(je.map((z) => z.m[k])).m;
        aus.r[k] = st.sd > 0 ? SV[k][1] * korr(je.map((z) => (z.b.bau ? z.b.bau[SV[k][0]] : 0)), je.map((z) => z.d[k])) : 0; // prettier-ignore
    }
    // DIE LESER am Bewohner mit dem weitesten Bau der ersten Siedlung
    const { S, vorlage, R } = W.siedlungen[0];
    const weit = (c) => Object.values(c.bau || {}).reduce((s, x) => s + Math.abs(x), 0);
    const b = S.liste.reduce((a, c) => (weit(c) > weit(a) ? c : a));
    const G = S.gestalten[b.gestalt], dG = { ...G.dK, top: "none", bottom: "none", shoes: "none", hairStyle: "glatze" }, dB = { ...dG, ...b.bau }; // prettier-ignore
    const guss = (d) => ctx.BAKERS_BY_KIND.koerper(K, "mensch", 1, 0, { dials: d });
    const [gG, gB] = [guss(dG), guss(dB)];
    const teile = (rig) => ({ mensch: rig.hips, torso: rig.spine, head: rig.head, arm1: rig.armL.shoulder, elbow1: rig.armL.elbow, hand1: rig.armL.wrist, "arm-1": rig.armR.shoulder, "elbow-1": rig.armR.elbow, "hand-1": rig.armR.wrist, hip1: rig.legL.hip, knee1: rig.legL.knee, ankle1: rig.legL.ankle, "hip-1": rig.legR.hip, "knee-1": rig.legR.knee, "ankle-1": rig.legR.ankle }); // prettier-ignore
    // (wie der Wirt: die Gelenke bei der Geburt, die Ruhe der Arme, sobald der Leib nah gezeigt wird)
    const stelleBau = (rig) => (
        K.leibBauAuf(teile(rig), dG, dB),
        K.leibBauArme(rig, K.leibBauRuhe(dG), K.leibBauRuhe(dB))
    );
    // der nahe Leib: der Guss der Gestalt, jede geskinnte Ecke auf den Knochen seines Baus (koerper `leibGussGestellt`), die Wurzel gehoben
    const wurzel = [0, 0];
    const gest = K.leibGussGestellt(
        gG,
        (rig) => ((wurzel[0] = rig.hips.position.y), stelleBau(rig), (wurzel[1] = rig.hips.position.y))
    );
    const netze = [];
    gest.traverse((n) => netze.push(n));
    const gN = gG.clone(true);
    let ni = 0;
    gN.traverse((o) => { if (o.isMesh && o.geometry.attributes.skinIndex) (o.geometry = o.geometry.clone()).attributes.position.array.set(netze[ni++].geometry.attributes.position.array); }); // prettier-ignore
    const skN = gest.userData.__skelett;
    gN.userData.__skelett = { ...skN, joints: skN.joints.map((j) => (j.name === skN.root ? { ...j, pos: [j.pos[0], j.pos[1] + wurzel[1] - wurzel[0], j.pos[2]] } : j)) }; // prettier-ignore
    // das Bild eines Gusses: die Gelenke (E) und der Umriss von vorn (leibKanon: je Bildpunkt die Klasse seines Dreiecks)
    const bild = (g) => {
        const Kn = K.leibKanon(g), L = K.gussNetze(g, false), F = Kn.front, n = F.h, w = F.w; // prettier-ignore
        let y0 = Infinity, y1 = -Infinity, hand = NaN; // prettier-ignore
        L.forEach((x) => { if (!x.I || /^(hair|eye|iris|pupil|cornea)$/.test(x.k)) return; for (let i = 1; i < x.P.length; i += 3) (y0 = Math.min(y0, x.P[i])), (y1 = Math.max(y1, x.P[i])); }); // prettier-ignore
        const oben = (c) => { for (let q = Math.round(0.64 * n); q > 0.3 * n; q--) if (F.px[q * w + c] === 3) return q / n; return NaN; }; // prettier-ignore
        for (let q = 0; q < n && !(hand >= 0); q++) for (let c = 0; c < w; c++) if (F.px[q * w + c] === 4) { hand = q / n; break; } // prettier-ignore
        return { H: y1 - y0, gelenk: Object.fromEntries(K.KETTE_GELENKE.filter((nm) => nm !== "torso").map((nm) => [nm, L.lage(nm)])), haut: { beinAnsatz: (oben(Math.round(w / 2 - 0.045 * n)) + oben(Math.round(w / 2 + 0.045 * n))) / 2, schulterHoehe: Kn.m.schulterHoehe, breiteAkromion: Kn.m.breiteAkromion, fingerspitze: hand } }; // prettier-ignore
    };
    const [bB, bN, bG] = [bild(gB), bild(gN), bild(gG)];
    aus.leser.wer = `${b.seed} ${Object.entries(b.bau)
        .map(([k, x]) => k.slice(3) + " " + x.toFixed(2))
        .join(" · ")}`;
    aus.leser.knochenGelenk = Math.max(
        ...Object.keys(bB.gelenk).flatMap((nm) => bB.gelenk[nm].map((x, i) => Math.abs(x - bN.gelenk[nm][i])))
    );
    aus.leser.knochenHaut = Math.max(...Object.keys(bB.haut).map((k) => Math.abs(bB.haut[k] - bN.haut[k])));
    // (der Bau ist im Bild: sein Guss weicht an der Haut von dem seiner Gestalt ab — sonst mäße jeder Leser gegen den Kanon)
    aus.leser.bauImBild = Math.max(...Object.keys(bB.haut).map((k) => Math.abs(bB.haut[k] - bG.haut[k])));
    aus.leser.hoehe = Math.abs(bB.H / bG.H - 1);
    aus.leser.masse = Math.abs(K.leibMasse(gB.userData.__skelett) / K.leibMasse(gG.userData.__skelett) - 1);
    // der Gang der Welt am Rig des nahen Leibs: THREE-Knochen in der Ruhe des Gusses seiner Gestalt, darauf sein Bau
    const PB = K.labProportionen(dB), P0 = K.labProportionen(dG), kn = {}; // prettier-ignore
    for (const j of gG.userData.__skelett.joints) {
        const o = (kn[j.name] = new T.Object3D());
        (o.position.set(...j.pos), o.quaternion.set(...j.quat), o.scale.set(...j.scale));
    }
    for (const j of gG.userData.__skelett.joints) if (kn[j.parent]) kn[j.parent].add(kn[j.name]);
    const rig = K.leibRig(kn), L0 = r._gaitBeinMass(rig).L; // prettier-ignore
    stelleBau(rig);
    delete rig._beinMass;
    kn[gG.userData.__skelett.root].updateMatrixWorld(true);
    aus.leser.gang = Math.abs(r._gaitBeinMass(rig).L / L0 - (PB.thighLen + PB.calfLen) / (P0.thighLen + P0.calfLen));
    // Sitz und Griff: die Kette des Leibs aus dem Skelett des Gusses seines Baus und aus den Knochen des nahen Leibs
    const kette = (sk) => K.leibKette({ ...sk, sitz: { von: 0, schritt: 1, tiefe: [0.1, 0.1] }, glieder: { oberarm: 0.05, unterarm: 0.04, oberschenkel: 0.08, unterschenkel: 0.05 } }).mass; // prettier-ignore
    const [kB, kN, kG] = [kette(gB.userData.__skelett), kette(gN.userData.__skelett), kette(gG.userData.__skelett)];
    const kMass = ["huefteM", "schulterM", "schulterBreiteM", "reichM", "greifM"];
    aus.leser.kette = Math.max(...kMass.map((k) => Math.abs(kB[k] - kN[k])));
    aus.leser.ketteBau = Math.max(...kMass.map((k) => Math.abs(kB[k] - kG[k])));
    // die Menge: der Weg seiner Ecken im Leib-Raum (sein Punkt gegen denselben Punkt im Kanon des Baus) gegen den des Gesetzes
    const E = ecken(vorlage);
    const [mP, mK] = [masse(A._leibRaumLeib(R, b.raumPunkt), E), masse(A._leibRaumLeib(R, imKanon(b.raumPunkt)), E)];
    const gesetz = { bein: (PB.trochanterY - P0.trochanterY) / H0, schulterHoehe: (PB.acromionY - P0.acromionY) / H0 };
    aus.leser.menge = Math.max(...Object.keys(gesetz).map((k) => Math.abs(mP[k] - mK[k] - gesetz[k])));
    return aus;
}
// das Urteil des Baus: je Maß die Streuung in ihrem Band und das Vorzeichen, je Leser sein Abstand zum Bild
function urteileBau(sb, m, S = sb.__koerperCore.BAU_SOLL) {
    const f = [];
    for (const k in S.streuung) if (!(m.vk[k] >= S.streuung[k][0] && m.vk[k] <= S.streuung[k][1])) f.push(`bau.streuung ${k} VK ${m.vk[k].toFixed(2)} % ${m.vk[k] < S.streuung[k][0] ? "<" : ">"} ${m.vk[k] < S.streuung[k][0] ? S.streuung[k][0] : S.streuung[k][1]} (die Menge trägt ${m.vk[k] < S.streuung[k][0] ? "denselben Bau" : "Zerrbilder"})`); // prettier-ignore
    for (const k in S.vorzeichen)
        if (!(m.r[k] >= S.vorzeichen[k][2]))
            f.push(
                `bau.vorzeichen ${k} folgt ${S.vorzeichen[k][0]} mit r ${m.r[k].toFixed(2)} < ${S.vorzeichen[k][2]}`
            );
    for (const k in S.leser)
        if (!(m.leser[k] <= S.leser[k]))
            f.push(`bau.leser ${k} ${m.leser[k].toExponential(2)} > ${S.leser[k]} (${m.leser.wer})`);
    if (!(m.leser.bauImBild >= S.bauImBild))
        f.push(
            `bau.leser das Bild trägt den Bau nicht: ${m.leser.bauImBild.toFixed(4)} H < ${S.bauImBild} (${m.leser.wer})`
        );
    if (!(m.leser.ketteBau >= S.ketteBau))
        f.push(
            `bau.leser die Kette liest den Kanon: ${m.leser.ketteBau.toFixed(4)} m < ${S.ketteBau} (${m.leser.wer})`
        );
    return f;
}

// DIE ARME IN DER HALTUNG (a-haltung, koerper `leibRigPose`; Leiter mensch.leib.ausdruck S1): je Bewohner der Menge sein naher
// Leib — die Gelenke des Gusses seiner Gestalt, sein Bau darauf (`leibBauAuf`, `leibBauArme`), gestellt wie der Wirt ihn stellt
// (`_animateHumanoidRig` mit dem Gemüt jedes Stands, `_bewohnerStaende`: neutral, die Haltungen des Tags, die Zeilen des Gemüts;
// der Satz der Menge backt dieselben Stände) — die Abspreizung des Oberarms: Schulter → Ellbogen im Raum des Rumpfs, der Winkel
// aus der Sagittal-Ebene (der Vorschwung zählt nicht), je Seite — zur Uhr des Leibs (`atem` aus seinem Samen, wie die Welt sie
// reicht: `uhr + atem`), wo das Profil vom Lot mehr nennt als das Band der Ruhe an HALTUNG_UHREN Uhren (die Geste, a-haltung 2).
// Vier Urteile je Stand: (band) das Mittel der Abspreizung jedes Leibs über die Zeit hält das Band der Ruhe (ARM_RUHE.spreizGrad) —
// über ALLE Stände, auch die Geste; (moment) im selben Moment hebt höchstens HALTUNG_MOMENT_SOLL der Menge die Arme über das Band
// (jeder zu seiner Uhr: die gehaltene Haltung hebt alle zugleich, die Schaufensterpuppen); (fern) wo das Profil eine Geste trägt,
// liest im Satz höchstens HALTUNG_MOMENT_SOLL der Menge dieselbe Zeile (`_bewohnerStandVon`: die ferne Menge zeigt jede gleich);
// (ueber) die Abspreizung steht nie über der größeren von der Ruhe des Leibs (`leibRigNeutral`) und dem Winkel, den das Profil vom
// Lot nennt (`armL` gegen das Labor-idle) — die Ruhe ist der Boden, kein Sockel. Bis a-haltung legte die Pose die Abspreizung des
// Profils AUF die Ruhe: mittags (showcase, 0,15 rad) stand die Menge mit p95 29° in der A-Haltung, das spielende Kind (joy, 0,6 rad)
// mit 58,5°; bis a-haltung 2 hielt joy die Abspreizung: jedes spielende Kind stand mit 34° im selben Moment, im Satz in EINER Zeile.
// Der Selbsttest dieses Teils fährt im Hauptlauf an derselben Welt (`pruefeHaltung`: kein eigener Bau).
const HALTUNG_UEBER_SOLL = 0.5; // Grad: die Rechnung der Gelenke (Euler XYZ, der Vorhalt der Schulter) — kein Stand legt etwas auf
const HALTUNG_MOMENT_SOLL = 0.5; // Anteil der Menge: höchstens die Hälfte hebt im selben Moment die Arme über das Band
const HALTUNG_UHREN = 24; // die Uhren je Leib, wo das Profil eine Geste nennt (Schritt 0,83 s: über ~20 s, jede Phase des Takts)
function messeHaltung(eingriff, W = mengeWelt(eingriff), nur = W.siedlungen.length) {
    const { A, ctx, r } = W, K = ctx.__koerperCore, M = K.MOTION; // prettier-ignore
    r._foundry = { recipes: { [A.KOERPER_HOST_RECIPE]: { fx: { motion: { presets: M } } } } };
    const band = K.ARM_RUHE.spreizGrad;
    const qMul = (a, b) => [a[3] * b[0] + a[0] * b[3] + a[1] * b[2] - a[2] * b[1], a[3] * b[1] - a[0] * b[2] + a[1] * b[3] + a[2] * b[0], a[3] * b[2] + a[0] * b[1] - a[1] * b[0] + a[2] * b[3], a[3] * b[3] - a[0] * b[0] - a[1] * b[1] - a[2] * b[2]]; // prettier-ignore
    const qRot = (q, v) => { const p = qMul(qMul(q, [v[0], v[1], v[2], 0]), [-q[0], -q[1], -q[2], q[3]]); return [p[0], p[1], p[2]]; }; // prettier-ignore
    // je Seite die Abspreizung (Grad) eines gestellten Skeletts: Lage und Drehung im Raum der Gestalt (ohne die Wurzel)
    const spreiz = (sk) => {
        const J = Object.fromEntries(sk.joints.map((j) => [j.name, j]));
        const lage = (n) => { let p = [0, 0, 0]; for (let j = J[n]; j && j.name !== sk.root; j = J[j.parent]) { p = qRot(j.quat, [p[0] * j.scale[0], p[1] * j.scale[1], p[2] * j.scale[2]]); p = [p[0] + j.pos[0], p[1] + j.pos[1], p[2] + j.pos[2]]; } return p; }; // prettier-ignore
        let q = [0, 0, 0, 1];
        for (let j = J.torso; j && j.name !== sk.root; j = J[j.parent]) q = qMul(j.quat, q);
        const qi = [-q[0], -q[1], -q[2], q[3]];
        return ["1", "-1"].map((sd) => {
            const [S, E] = [lage("arm" + sd), lage("elbow" + sd)];
            const d = qRot(qi, [E[0] - S[0], E[1] - S[1], E[2] - S[2]]);
            return (Math.asin(Math.min(1, Math.abs(d[0]) / Math.hypot(d[0], d[1], d[2]))) * 180) / Math.PI;
        });
    };
    const teile = (rig) => ({ mensch: rig.hips, torso: rig.spine, head: rig.head, arm1: rig.armL.shoulder, elbow1: rig.armL.elbow, hand1: rig.armL.wrist, "arm-1": rig.armR.shoulder, "elbow-1": rig.armR.elbow, "hand-1": rig.armR.wrist, hip1: rig.legL.hip, knee1: rig.legL.knee, ankle1: rig.legL.ankle, "hip-1": rig.legR.hip, "knee-1": rig.legR.knee, "ankle-1": rig.legR.ankle }); // prettier-ignore
    const zeilen = A._bewohnerStaende(); // die Zeilen des Satzes (seit a-haltung 2: je Geste ihre Phasen hinten an)
    const staende = [...new Set(zeilen)];
    const gruppe = (J) => (J < 15 ? "kind" : J < 60 ? "erwachsen" : "greis");
    const C = W.haltung || (W.haltung = { sk0: new Map(), ruheG: new Map() }); // die Gelenke je Gestalt: einmal je Welt
    const aus = { je: [], staende };
    const uhrZeile = (h) => (typeof r._bewohnerStandZeit === "function" ? r._bewohnerStandZeit(h) : 0);
    const gemAlt = r._bewohnerGemuet;
    for (const { S } of W.siedlungen.slice(0, nur))
        for (const b of S.liste) {
            const G = S.gestalten[b.gestalt];
            // (die Gelenke des Gusses allein: `leibGussGestellt` an einem Guss ohne Netz stellt nur das Skelett)
            if (!C.sk0.has(G)) C.sk0.set(G, { userData: { __skelett: ctx.BAKERS_BY_KIND.koerper(K, "mensch", 1, 0, { dials: G.dK }).userData.__skelett }, traverse() {} }); // prettier-ignore
            if (!C.ruheG.has(G)) C.ruheG.set(G, K.leibBauRuhe(G.dK));
            const zu = Object.assign({}, G.dK, b.bau), ruheB = K.leibBauRuhe(zu); // prettier-ignore
            const stelle = (fn) => (rig) => (K.leibBauAuf(teile(rig), G.dK, zu), K.leibBauArme(rig, C.ruheG.get(G), ruheB), fn(rig)); // prettier-ignore
            const winkel = (fn) => spreiz(K.leibGussGestellt(C.sk0.get(G), stelle(fn)).userData.__skelett);
            const ruhe = winkel((rig) => K.leibRigNeutral(rig));
            // seine Uhr (die Welt: `atem` aus seinem Samen, `_bewohnerListe`)
            if (b.atem === undefined) b.atem = r._rollGenome(b.seed, "bewohner").axis("atem") * 10;
            for (const nm of staende) {
                const h = zeilen.indexOf(nm);
                const gem = r._bewohnerStandGemuet(h);
                const p = M[nm] || M.idle;
                // der Winkel, den das Profil vom Lot nennt (Grad, je Seite: MOTION_RIG_MAP armL / armR gegen das Labor-idle)
                const profil = ["armL", "armR"].map((k) => ((p[k] - M.idle[k]) * 180) / Math.PI);
                const uhren = Math.max(...profil) > band[1] ? HALTUNG_UHREN : 1;
                const ist = [...Array(uhren)].map((_, j) => winkel((rig) => r._animateHumanoidRig(rig, b.atem + 0.83 * j, 0, false, false, gem))); // prettier-ignore
                // die Zeile, die er im Satz liest (sein Gemüt in diesem Stand), und ihr Winkel — gestellt wie das Backen sie stellt (ein
                // Stand ohne Geste steht zu jeder Uhr gleich: sein naher Winkel)
                r._bewohnerGemuet = () => ({ haltung: nm, sorrow: 0, chaos: 0 });
                const zeile = r._bewohnerStandVon(b);
                r._bewohnerGemuet = gemAlt;
                const fern = uhren > 1 ? winkel((rig) => r._animateHumanoidRig(rig, uhrZeile(zeile), 0, false, false, r._bewohnerStandGemuet(zeile))) : ist[0]; // prettier-ignore
                const je = ist.map((x) => Math.max(...x));
                aus.je.push({ seed: b.seed, gruppe: gruppe(G.gen.jahre), stand: nm, profil: Math.max(...profil), uhren: je, mittel: je.reduce((a, x) => a + x, 0) / je.length, ruhe: Math.max(...ruhe), ueber: Math.max(...ist.map((s) => Math.max(...s.map((x, i) => x - Math.max(ruhe[i], profil[i]))))), zeile, fern: Math.max(...fern) }); // prettier-ignore
            }
        }
    return aus;
}
const quantil = (v, p) => {
    const s = v.slice().sort((a, b) => a - b);
    return s[Math.min(s.length - 1, Math.floor(p * (s.length - 1) + 0.5))];
};
// je Stand: das Mittel jedes Leibs (max), der größte Anteil der Menge über dem Band im selben Moment (je Uhr j), der größte
// Anteil in EINER Zeile des Satzes
function haltungJe(m, nm, band) {
    const Z = m.je.filter((z) => z.stand === nm);
    const U = Math.max(...Z.map((z) => z.uhren.length));
    const moment = Math.max(...[...Array(U)].map((_, j) => Z.filter((z) => z.uhren[j % z.uhren.length] > band[1]).length / Z.length)); // prettier-ignore
    const zahl = new Map();
    for (const z of Z) zahl.set(z.zeile, (zahl.get(z.zeile) || 0) + 1);
    return { Z, moment, gleich: Math.max(...zahl.values()) / Z.length, zeilen: zahl.size };
}
function urteileHaltung(sb, m, band = sb.__koerperCore.ARM_RUHE.spreizGrad) {
    const f = [];
    for (const nm of m.staende) {
        const { Z, moment, gleich, zeilen } = haltungJe(m, nm, band);
        const ue = Z.reduce((a, z) => (z.ueber > a.ueber ? z : a));
        if (ue.ueber > HALTUNG_UEBER_SOLL) f.push(`haltung.ueber ${nm} ${ue.ueber.toFixed(2)}° > ${HALTUNG_UEBER_SOLL}° (${ue.seed} ${ue.gruppe}: ${Math.max(...ue.uhren).toFixed(1)}° gegen Ruhe ${ue.ruhe.toFixed(1)}°, Profil ${ue.profil.toFixed(1)}° — die Haltung legt ihre Abspreizung auf die Ruhe)`); // prettier-ignore
        const hoch = Z.reduce((a, z) => (z.mittel > a.mittel ? z : a));
        if (hoch.mittel > band[1]) f.push(`haltung.band ${nm} Mittel p95 ${quantil(Z.map((z) => z.mittel), 0.95).toFixed(1)}° max ${hoch.mittel.toFixed(1)}° > ${band[1]}° (${hoch.seed} ${hoch.gruppe} — die Arme der Menge stehen im Mittel über dem Band der Ruhe: die A-Haltung)`); // prettier-ignore
        if (moment > HALTUNG_MOMENT_SOLL) f.push(`haltung.moment ${nm} ${(100 * moment).toFixed(0)} % > ${100 * HALTUNG_MOMENT_SOLL} % (im selben Moment heben so viele der Menge die Arme über ${band[1]}°: die Haltung ohne eigene Phase — ein Platz voller Schaufensterpuppen)`); // prettier-ignore
        if (Math.max(...Z.map((z) => z.profil)) > band[1] && gleich > HALTUNG_MOMENT_SOLL) f.push(`haltung.fern ${nm} ${(100 * gleich).toFixed(0)} % in einer Zeile von ${zeilen} > ${100 * HALTUNG_MOMENT_SOLL} % (die Geste ohne Phase im Satz: die ferne Menge steht jede gleich)`); // prettier-ignore
    }
    return f;
}
const zeigeHaltung = (m, band) => {
    for (const nm of m.staende) {
        const { moment, gleich, zeilen } = haltungJe(m, nm, band);
        const je = (g, k) => { const v = m.je.filter((z) => z.stand === nm && z.gruppe === g).map(k); return v.length ? `${g} p50 ${quantil(v, 0.5).toFixed(1)}° p95 ${quantil(v, 0.95).toFixed(1)}° max ${Math.max(...v).toFixed(1)}°` : `${g} —`; }; // prettier-ignore
        console.log(`  haltung ${nm.padEnd(9)} Mittel ${["kind", "erwachsen", "greis"].map((g) => je(g, (z) => z.mittel)).join(" · ")} · Moment über ${band[1]}° max ${(100 * moment).toFixed(0)} % · fern ${zeilen} Zeilen, ${(100 * gleich).toFixed(0)} % in einer · ueber max ${Math.max(...m.je.filter((z) => z.stand === nm).map((z) => z.ueber)).toFixed(2)}°`); // prettier-ignore
        if (m.je.some((z) => z.stand === nm && z.uhren.length > 1)) console.log(`    ${nm} je Uhr (alle Uhren, alle Leiber) ${["kind", "erwachsen", "greis"].map((g) => je(g, (z) => Math.max(...z.uhren))).join(" · ")} · im Satz ${["kind", "erwachsen", "greis"].map((g) => je(g, (z) => z.fern)).join(" · ")}`); // prettier-ignore
    }
};
// DER SELBSTTEST DER HALTUNG (an der Welt des Hauptlaufs, ihre Gelenke gemerkt — kein eigener Bau): je Täter der Stand davor, er
// muss sein Urteil beim Namen rot machen — (HA1) die Haltung des Tags AUF der Ruhe (vor a-haltung: die A-Haltung) · (HA2) joy
// gehalten (vor a-haltung 2: die Schulter auf der größeren von Ruhe und Profil zu jeder Uhr, jedes Kind mit 34° im selben Moment)
// · (HA3) der Satz ohne die Phase der Geste (jeder ferne Leib in der ersten Zeile seines Stands)
function pruefeHaltung(W, so) {
    const K = W.ctx.__koerperCore, roh = K.leibRigPose, rohVon = W.r._bewohnerStandVon; // prettier-ignore
    const schulter = (f) => function (r, t, wp, mov, gait, mp, mref, ...x) { roh.call(this, r, t, wp, mov, gait, mp, mref, ...x); if (!mp || !mref) return; const [uL, uR] = [r.armRuhe[0].shoulder, r.armRuhe[1].shoulder]; r.armL.shoulder.rotation.z = f(uL[2], mp.armL - mref.armL, 1); r.armR.shoulder.rotation.z = -f(-uR[2], mp.armR - mref.armR, -1); }; // prettier-ignore
    const faelle = [
        ["HA1 die Arme der Menge im Mittel über dem Band (die Haltung des Tags auf der Ruhe: die A-Haltung) werden erkannt", () => (K.leibRigPose = schulter((u, p) => Math.max(u, u + p))), /^haltung\.band showcase /], // prettier-ignore
        ["HA2 joy gehalten (jedes spielende Kind mit 34° im selben Moment: die Schaufensterpuppen) wird erkannt", () => (K.leibRigPose = schulter((u, p) => Math.max(u, p))), /^haltung\.moment joy /], // prettier-ignore
        ["HA3 der Satz ohne die Phase der Geste (jeder ferne Leib in der ersten Zeile seines Stands) wird erkannt", () => (W.r._bewohnerStandVon = function (b) { return W.A._bewohnerStaende().indexOf(this._koerperMotionName(false, this._bewohnerGemuet(b))); }), /^haltung\.fern joy /], // prettier-ignore
    ];
    let rot = 0;
    for (const [name, taeter, muster] of faelle) {
        taeter();
        let f;
        try {
            f = urteileHaltung(so, messeHaltung(null, W, 1));
        } finally {
            [K.leibRigPose, W.r._bewohnerStandVon] = [roh, rohVon];
        }
        const ok = f.some((x) => muster.test(x));
        console.log(`  ${ok ? "✅" : "❌"} ${name}${ok ? " — " + f.find((x) => muster.test(x)) : ""}`);
        if (!ok) rot++;
    }
    return rot ? [`haltung.selbsttest ${rot} Täter ohne Urteil (die Linse der Haltung ist vakuös)`] : [];
}

const zeige = (m) =>
    console.log(
        "  " +
            Object.entries(m)
                .map(([k, x]) => `${k} ${k === "Hk" ? x.toFixed(2) : x.toFixed(4)}`)
                .join(" · ")
    );

// DIE RUHE DER ARME (w11-koerper, koerper-core ARM_RUHE · armRuheUrteil): in der Ruhe-Pose des Gusses (Ofen L0) liegt an keinem
// Körper des Gesetzes (ARM_RUHE.koerper: der Start und die Ränder von mass, tone, age, gender) eine Arm-Ecke in der Rumpf-Hülle.
// Am Labor-Kern (2674ff9a) lagen am Gitter aus mass × tone × age × gender 24 von 24 Körpern mit 284–526 Arm-Ecken bis 71 mm im
// Rumpf. Täter (Selbsttest R1): der Guss ohne die Anlage (`armAnlage`, die Rumpf-Hülle weicht dem Arm nicht). Und der Arm HÄNGT (w12-arme): seine
// Abspreizung in Ruhe (Schulter → Ellbogen gegen das Lot, Grad) hält ihr Band ARM_RUHE.spreizGrad — bis w12-arme hielt die
// Ruhe die Hüllen beider Seiten und das Fett-Depot, der muskulöse Mann bei mass 1 stand mit 54° fast in T-Pose (9ab928c6).
// Täter (R2): der um 0,6 rad gespreizte Arm. Die Bänder (innen, spreizGrad) urteilt `urteile` wie MENSCH_SOLL.
const messeRuhe = (sb, kern = (K) => K, K = sb.__koerperCore) => K.ARM_RUHE.koerper.map((dials) => ({ dials, ...K.armRuheUrteil(sb.BAKERS_BY_KIND.koerper(kern(K), "mensch", 1, 0, { dials })) })); // prettier-ignore
const urteileRuhe = (so, R) => R.flatMap((r) => urteile(so, r, "ARM_RUHE").map((x) => `ruhe ${JSON.stringify(r.dials)}: ${x}`)); // prettier-ignore
// DIE RUHE IN DER STAND-ZEILE (w28-mensch-samen, ARM_RUHE.innenStand): derselbe Guss, gestellt wie die Welt ihren Leib stellt — der
// Stamm im vm (`_animateHumanoidRig`) auf dem Rig des Kerns (koerper `leibGussGestellt`) —, am Ofen L0 je Körper des Gesetzes und an
// der Vorlage der Menge (Stufe 2). Bis hier urteilte die Ruhe an der Bind-Pose allein, die kein Bild der Welt zeigt: der Stand trug
// 174–261 Arm-Ecken im Rumpf (die Hände im Schritt), das Urteil blieb GRÜN. Täter (R3): das Rig ohne die Ruhe seiner Arme.
function messeStand(sb, taeter, nur) {
    const { AnazhRealm: A, ctx } = require("./lib/stamm.cjs").ladeKlasse(require("path").join(__dirname, ".."));
    const [K, r] = [ctx.__koerperCore, Object.assign(Object.create(A.prototype), { state: {} })];
    const stelle = (rig) => (taeter && taeter(rig), r._animateHumanoidRig(rig, 0, 0, false, false, null));
    const je = (dials, lod) => ({ dials: { ...dials, stufe: lod }, innenStand: K.armRuheUrteil(K.leibGussGestellt(sb.BAKERS_BY_KIND.koerper(sb.__koerperCore, "mensch", 1, lod, { dials }), stelle)).innen }); // prettier-ignore
    return [...K.ARM_RUHE.koerper.slice(0, nur).map((d) => je(d, 0)), je({}, 2)];
}

// DIE LESER DIESER LINSE als Modul: die Station mensch.K4#2 (Zweig punkte-maschine, meisterkarte-quelle/punkte/stationen/g2.js)
// misst die Gesichter der Typen ihrer Menge mit `ladeWelt` und `messe` — sie lebt nicht in main: bis w7-gesicht strich
// w4-stufen-gesetz (98177d01) den Export „ohne Leser“ (git grep in main), und die Station endete „ohne Menge oder Gesicht“.
module.exports = { ladeWelt, messe };
if (require.main !== module) return;
if (SELBSTTEST) {
    console.log("=== SELBST-TEST: die Mensch-Anatomie-Linse feuert ===");
    let rot = 0;
    // je Fall der Eingriff am Gesetz (`verzerre`) oder am Kopf (`eingriff`, mit `kopf`): er muss sein Maß beim Namen rot machen
    const pruefe = (name, verzerre, muster, kopf) => {
        const sb = kopf ? ladeOfen() : ladeWelt();
        const f =
            kopf === "handMenge" ? urteileHandMenge(messeHandMenge(sb, verzerre)) : kopf === "flankeMenge" ? urteileFlankeMenge(messeFlankeMenge(sb, verzerre)) : kopf === "bau" ? urteileBau(sb, messeBau(verzerre, 1)) : kopf === "menge" ? urteileMenge(messeMenge(verzerre)) : kopf === "form" ? urteileForm(sb, messeForm(sb, verzerre)) : kopf === "formFrau" ? urteileFormFrau(sb, messeFormFrau(sb, verzerre)) : kopf === "kanon" ? urteileKanon(sb, messeKanon(sb, verzerre)) : kopf === "schnitte" ? kopfJe(sb, verzerre.kern) : kopf === "stand" ? urteileRuhe(sb, messeStand(sb, verzerre, 1)) : kopf === "ruhe" ? urteileRuhe(sb, messeRuhe(sb, verzerre.kern)) : kopf === "leib" ? urteile(sb, messeLeib(sb, verzerre), "LEIB_SOLL") : kopf === "kalotte" ? urteileKalotte(sb, messeKalotte(sb, verzerre)) : kopf === "grob" ? urteileKopf(sb, messeGrob(sb, verzerre)) : /^kleid/.test(kopf) ? urteileKleid(sb, messeKleid(sb, verzerre, { kleid: "guss", kleidMenge: "menge", kleidSchuh: "schuh" }[kopf])) : kopf ? urteileKopf(sb, messeKopf(sb, verzerre)) : urteile(sb, messe(sb, verzerre)); // prettier-ignore
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
        kern: (K) => ({
            ...K,
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
        { kern: (K) => ({ ...K, brauTon: (haut) => haut }) },
        /^brauKontrast/,
        true
    );
    // DIE MENGE (mensch.K4): die Farben der Gestalt statt der eigenen (der Stand vor mensch.K4)
    // der Leib-Raum ohne Punkt (jeder Bewohner auf der Vorlage, nur seine Größe) und die Gestalt statt des Punkts (8 Formen je
    // Siedlung, der Weg vor w26-leib-raum) — beide machen Paare gleich
    for (const [n, d] of [["M1 der Bewohner ohne seinen Punkt (die Vorlage für jeden) wird erkannt", (S) => S.raum.dK], ["M2 der Punkt seiner Gestalt (8 Formen je Siedlung) wird erkannt", (S, b) => S.gestalten[b.gestalt].dK]]) // prettier-ignore
        pruefe(n, (A, ctx, roh = A.prototype._bewohnerGenome) => (A.prototype._bewohnerGenome = function (S) { roh.call(this, S); S.liste.forEach((b) => (b.raumPunkt = ctx.__koerperCore.leibRaumPunkt(d(S, b)))); }), /^menge\.gleich/, "menge"); // prettier-ignore
    // DER BAU (w28-leib-genom): (BA1) alle lesen denselben Bau — die Menge steht im Kanon des Skeletts (der Punkt jedes Bewohners
    // ohne die Achsen seines Baus: der Stand vor dem Gesetz) · (BA2) das Vorzeichen verkehrt (der Punkt am anderen Rand seiner Achse:
    // lange Beine werden kurz) · (BA3) die Knochen des nahen Leibs lesen den Kanon (der Bau erreicht sie nicht: Bild, Gang und Griff
    // gehen auseinander) · (BA4) die Knochen heben das Becken nicht (der Rumpf des nahen Leibs bleibt, die Beine wachsen in den Boden)
    // · (BA5) die Arme hängen in der Ruhe der Gestalt (Ellbogen und Hand stehen nicht, wo der Guss seines Baus sie hängt)
    const bauPunkt = (f) => (A, ctx, roh = A.prototype._bewohnerGenome) => (A.prototype._bewohnerGenome = function (S) { roh.call(this, S); const kc = ctx.__koerperCore, bau = kc.LEIB_RAUM.achsen.map((a) => kc.BAU_GESETZ.achsen.some((g) => g.achse === a.achse)); S.liste.forEach((b) => (b.raumPunkt = b.raumPunkt.map((x, i) => (bau[i] ? f(x) : x)))); }); // prettier-ignore
    pruefe("BA1 alle lesen denselben Bau (die Menge im Kanon des Skeletts) wird erkannt", bauPunkt(() => 1), /^bau\.streuung bein .*denselben Bau/, "bau"); // prettier-ignore
    pruefe("BA2 das verkehrte Vorzeichen (lange Beine werden in der Menge kurz) wird erkannt", bauPunkt((x) => 2 - x), /^bau\.vorzeichen bein /, "bau"); // prettier-ignore
    pruefe("BA3 die Knochen des nahen Leibs im Kanon (der Bau erreicht sie nicht) werden erkannt", (A, ctx) => (ctx.__koerperCore.leibBauAuf = () => {}), /^bau\.leser knochenGelenk /, "bau"); // prettier-ignore
    pruefe("BA4 das Becken, das die Knochen nicht heben, wird erkannt", (A, ctx, roh = ctx.__koerperCore.leibBauAuf) => (ctx.__koerperCore.leibBauAuf = (t, ...a) => { const y = t.mensch.position.y; roh(t, ...a); t.mensch.position.y = y; }), /^bau\.leser knochen(Gelenk|Haut) /, "bau"); // prettier-ignore
    pruefe("BA5 die Arme des nahen Leibs in der Ruhe seiner Gestalt (der Löser erreicht sie nicht) werden erkannt", (A, ctx) => (ctx.__koerperCore.leibBauArme = () => {}), /^bau\.leser knochenGelenk /, "bau"); // prettier-ignore
    // (DIE ARME IN DER HALTUNG, a-haltung: ihr Selbsttest fährt im Hauptlauf an dessen Welt — `pruefeHaltung`, kein eigener Bau)
    // DIE KAPPE VOR DEM SCHÄDEL (vor w7-gesicht: afro um sein zurueck 0,05 gesetzt, ohne die Dicke) begräbt sein Auge
    pruefe("K1 die Kappe vor dem Schädel (afro) wird erkannt", { kern: (K) => ({ ...K, haarKappe: (d) => K.haarKappe(d).map((k) => ({ ...k, c: [0, k.c[1], -0.05] })) }) }, /^afro\/rand\d augeFrei/, "schnitte"); // prettier-ignore
    pruefe("S5 der aufgesetzte Augapfel (eine Augapfel-Breite vor) wird erkannt", auge(0.12), /^augenVorstand/, true);
    // DER LEIB (w21-leib-bau): der Kopf über H — so stand er im Gesetz vor dem Kanon (der Scheitel 0,21 E über H, der Hals zu lang)
    pruefe("L1 der Scheitel 0,21 E über H (der Kopf vor w21-leib-bau) wird erkannt", (B) => (B.parts.head.position.y += 0.21), /^(hals|kopfH) /); // prettier-ignore
    // je Täter am Guss (Ofen L0) die Haut, wie sie vor w21-leib-bau stand: (L2) die Kopf-Haut schwebt über dem Hals (zwei Häute
    // ohne Ring), (L3) der Hals trägt kein Gewicht des Kopfs (die Bindung gibt es dem Rumpf: die Naht reißt unter der Pose), (L4)
    // jede Haut rechnet die Normale am Ring aus ihren Dreiecken (die Schattierung springt), (L5) der Saum gezackt (jede zweite
    // Ecke eines Stoffs um 0,03 E versetzt: die Treppe der Dreiecke), (L6) die Delle im Bauch (die Haut vorn um 0,1 E eingedrückt)
    const amGuss = (f) => (g) => g.traverse((m) => m.isMesh && f(m, m.material.userData.__klasse, m.userData.__assetJoint, m.geometry.attributes.position)); // prettier-ignore
    pruefe("L3 der Hals ohne Gewicht des Kopfs wird erkannt", (g, sj = g.userData.__skelett.skinJoints) => (sj[sj.indexOf("head")] = "torso"), /^nahtPose/, "leib"); // prettier-ignore
    for (const [name, f, muster] of [
        [
            "L2 die schwebende Kopf-Haut",
            (m, k, j) => k === "haut" && j === "head" && (m.position.y += 0.07),
            /^naht(Spalt|Ring)/,
        ],
        [
            "L4 die einseitige Normale am Ring",
            (m, k) => k === "haut" && m.geometry.computeVertexNormals(),
            /^nahtNormale/,
        ],
        ["L5 der gezackte Saum", (m, k, j, pa) => { for (let i = 1; /^stoff_/.test(k) && i < pa.count; i += 2) pa.setY(i, pa.getY(i) + 0.03); }, /^saumUmlauf/], // prettier-ignore
        // (die Delle trifft die Ecke, die dem Punkt am nächsten liegt, und jede im Umkreis: am Netz nach den Trägern aus dem Profil
        // lag keine Ecke mehr im Umkreis von 0,08 — der Täter traf nichts, die Probe blieb stumm)
        ["L6 die Delle im Bauch", (m, k, j, pa) => { if (k !== "haut" || j !== "mensch") return; let bi = -1, bd = Infinity; for (let i = 0; i < pa.count; i++) { const d = Math.hypot(pa.getX(i), pa.getY(i) - 3.9); if (pa.getZ(i) > 0 && d < bd) [bd, bi] = [d, i]; } for (let i = 0; i < pa.count; i++) if (pa.getZ(i) > 0 && (i === bi || Math.hypot(pa.getX(i), pa.getY(i) - 3.9) < 0.08)) pa.setZ(i, pa.getZ(i) - 0.1); }, /^bauchKnick/], // prettier-ignore
    ])
        pruefe(name + " wird erkannt", amGuss(f), muster, "leib");
    // (L7) der Guss vor der Nacharbeit: die Dicke des Halses schwindet über der Naht nie (ihr Band unendlich) — sie stößt hinter dem Ohr
    // und unter dem Mund durch die Haut des Kopfs (Überschläge, Kanten mit vier Dreiecken; gate:kamera-leib:echt K6)
    const ohneBand = (K) => ({ ...K, MENSCH_GESTALT: { ...K.MENSCH_GESTALT, leibHaut: { ...K.MENSCH_GESTALT.leibHaut, naht: { ...K.MENSCH_GESTALT.leibHaut.naht, band: 1e9 } } } }); // prettier-ignore
    pruefe("L7 die Dicke des Halses im Kopf (der Guss vor der Nacharbeit) wird erkannt", { kern: ohneBand }, /^haut(Mehrfach|Ueberschlag) /, "leib"); // prettier-ignore
    // DAS KLEID (w28-leib-nah): je Täter das Gesetz, wie es bis dahin stand — (KL1) der Poncho ohne Dicke (der Ofen bläst ihn als
    // Hülle über den Teil-Kugeln auf: kein Rand), (KL2) das Oberteil ohne die Linie seines Saums (sein Rand die Grenze der
    // Haut-Region: zwei Ringe um die Schenkel), (KL3) die Hose ohne die Linie ihres Bunds, (KL4/KL5) der Poncho ohne Weite (ein
    // zweiter Pullover) — im Guss und im Satz der Menge, die dasselbe Gesetz liest
    const zonen = (f) => ({
        kern: (K) => ({ ...K, kleidZonen: (d) => K.kleidZonen(d).map((z) => ({ ...z, ...f(z) })) }),
    });
    // (KL1, seit dem Schuh aus dem Guss des Fußes: eine Zone ohne Dicke hat im Ofen keinen Weg mehr — er wirft beim Namen der Zone)
    {
        let wurf = "";
        try {
            messeKleid(
                ladeOfen(),
                zonen((z) => (z.schnitt === "poncho" ? { dicke: 0 } : {})),
                "guss"
            );
        } catch (e) {
            wurf = e.message;
        }
        const ok = /Kleid-Zone „poncho“ trägt keine Dicke/.test(wurf);
        console.log(
            `  ${ok ? "✅" : "❌"} KL1 der Poncho ohne Dicke (bis w28-leib-nah die Hülle über den Teil-Kugeln) bricht laut${ok ? " — " + wurf : ""}`
        );
        if (!ok) rot++;
    }
    pruefe("KL2 das Oberteil ohne die Linie seines Saums (der Rand um die Schenkel: der Body) wird erkannt", zonen((z) => (z.saum ? { saum: null, reicht: [] } : {})), /^kleid\.tshirt saum(Ring 0 < 1|Eben .* > )/, "kleid"); // prettier-ignore
    pruefe("KL3 die Hose ohne die Linie ihres Bunds (der gezackte Rand der Haut-Region) wird erkannt", zonen((z) => (z.bund ? { bund: null } : {})), /^kleid\.\w+ bundEben .* > /, "kleid"); // prettier-ignore
    pruefe("KL4 der Poncho ohne Weite (ein zweiter Pullover) wird im Guss erkannt", zonen(() => ({ weite: null })), /^kleid\.tracht ponchoWeiter .* < /, "kleid"); // prettier-ignore
    pruefe("KL5 der Poncho ohne Weite wird im Satz der Menge erkannt (die Menge liest dasselbe Gesetz)", zonen(() => ({ weite: null })), /^kleid\.tracht ponchoMengeWeiter .* < /, "kleidMenge"); // prettier-ignore
    pruefe("HM1 der Ärmel, der die Hand schluckt (die Zone des Oberteils nennt die Hand: die Faust), wird im Satz der Menge erkannt", { kern: (K) => ({ ...K, kleidZonen: (d) => (K.kleidZonen(d) || []).map((z) => ((z.teile || []).includes("elbow1") ? { ...z, teile: [...z.teile, "hand1", "hand-1"] } : z)) }) }, /^menge.hand (frau)?[pP]ullover[RL] (vorn|seite) /, "handMenge"); // prettier-ignore
    pruefe("FM1 die Anlage, die an der dichten Hülle der Menge nichts rechnet (der Rumpf weicht dem Arm nicht: die Lappen des Ponchos schließen die Luft), wird im Satz der Menge erkannt", { kern: (K) => ({ ...K, armAnlage: (B, H, G) => (H.length === 1 && H[0].n > 4000 ? 0 : K.armAnlage(B, H, G)) }) }, /^menge.flanke poncho (breit|zu) /, "flankeMenge"); // prettier-ignore
    // DER SCHUH: (KL6) dreifach dick (der Ballon am Fuß), (KL7) ohne Auflage (ein Zehntel der Dicke: der Schuh liegt in der
    // Haut), (KL8) ohne die Linie seines Schafts (sie liegt über jeder Form: der Rand sind die Ohren über den Knöcheln), (KL9, am
    // Guss) die Sohle um die Dicke unter dem Fuß (der Schuh vor Gelände H5: sie steht im Boden)
    pruefe("KL6 der dreifach dicke Schuh (der Ballon am Fuß) wird erkannt", zonen((z) => (z.sohle ? { dicke: 3 * z.dicke } : {})), /^kleid\.tshirt schuhLage .* > /, "kleidSchuh"); // prettier-ignore
    pruefe("KL7 der Schuh ohne Auflage (ein Zehntel der Dicke) wird erkannt", zonen((z) => (z.sohle ? { dicke: 0.1 * z.dicke } : {})), /^kleid\.tshirt schuhLage .* < /, "kleidSchuh"); // prettier-ignore
    pruefe("KL8 der Schuh ohne die Linie seines Schafts (die Ohren über den Knöcheln) wird erkannt", zonen((z) => (z.sohle ? { schaft: 1 } : {})), /^kleid\.tshirt schuhSchaft .* > /, "kleidSchuh"); // prettier-ignore
    pruefe("KL9 die Sohle unter dem Fuß (der Schuh um seine Dicke tiefer) wird erkannt", amGuss((m, k, j) => /^stoff_/.test(k) && /^ankle/.test(j) && (m.position.y -= 0.05)), /^kleid\.tshirt schuhSohle .* < /, "kleidSchuh"); // prettier-ignore
    // DIE KALOTTE (w28-kopf-kalotte): je Täter am Bau, mit dem der Ofen gießt — (KAL1) die Kugel des Schädels ohne ihre Breite (so
    // stand sie bis main 4c1b5dc5: die Schläfen tragen die Breite, die Kuppel läuft spitz zu), (KAL2) das Ohr in der Seite des
    // Kopfs begraben (so fiel es in der ersten Fassung des Schnitts: die breite Kugel schluckte es)
    const amKopfBau = (f) => ({ kern: (K) => ({ ...K, bauMensch: (F) => { const B = K.bauMensch(F); f(B.parts.head); return B; } }) }); // prettier-ignore
    pruefe("KAL1 die Kalotte ohne ihre Breite (das spitze Ei) wird erkannt", amKopfBau((kopf) => (kopf.children.find((c) => c.isMesh).scale.x = 1)), /^kalotte\.mann (kalotteHalt|scheitelHalt) .* < /, "kalotte"); // prettier-ignore
    pruefe("KAL2 das in der Seite des Kopfs begrabene Ohr wird erkannt", amKopfBau((kopf) => ohrenVon(kopf).forEach((o) => (o.position.x -= Math.sign(o.position.x) * 0.07))), /^kalotte\.mann ohrStand .* < /, "kalotte"); // prettier-ignore
    // DAS GESICHT (w28-gesicht): (GE1) die zwei flachen Lider über und unter dem Augapfel, wie sie bis main standen (der Starr-Blick),
    // (GE2) die Kappe ohne die Grenze des Haars (der Afro trägt seinen Ton über Wange und Kiefer: die Sturmhaube), (GE3) die
    // Verdeckung der Kopf-Haut, die jeden Strahl ganz zählt (die fleckige Haut, der Schlitz unter dem Kinn)
    pruefe("GE1 die flachen Lider (der Starr-Blick) werden erkannt", { gesetz: (B) => [[B.parts.lidTL, 0.1, 0.049], [B.parts.lidBL, -0.115, 0.063]].forEach(([l, y, b]) => { const r = l.geometry.parameters.radius; l.position.set(0, y, 0); l.scale.set(0.161 / r, b / r, 0.126 / r); }) }, /^lidSpalt .* > /, true); // prettier-ignore
    pruefe("GE2 die Kappe ohne die Grenze des Haars (die Sturmhaube am Afro) wird erkannt", { kern: (K) => ({ ...K, haarGrenze: () => -1e9 }) }, /^afro\/rand\d haarHaube .* > /, "schnitte"); // prettier-ignore
    pruefe("GE4 das Lid auf dem groben Raster ohne Umschreibung (die Lappen des Weiß an den Winkeln) wird erkannt", { kern: (K) => ({ ...K, MENSCH_GESTALT: { ...K.MENSCH_GESTALT, lidRaster: { w: 12, h: 8, um: 1 } } }) }, /^lidSchulter .* > /, true); // prettier-ignore
    pruefe("GE5 das Lid ohne die Wölbung (die Iris steht durch das geschlossene Lid) wird erkannt", { kern: (K) => ({ ...K, lidLage: (zu) => [K.lidLage(zu)[0], -K.MENSCH_GESTALT.auge.lid.hinten] }) }, /^lidZu .* > /, true); // prettier-ignore
    pruefe("GE6 das Lid, das weit vor den Augapfel reitet (die Kugel vor dem Gesicht), wird erkannt", { kern: (K) => ({ ...K, lidLage: (zu) => [K.lidLage(zu)[0], K.lidLage(zu)[1] + 0.027 * Math.max(0, Math.min(1, zu))] }) }, /^lidWulst .* > /, true); // prettier-ignore
    pruefe("GE7 die Sklera unter vollem Lid-Schatten (das Auge ohne Weiß) wird erkannt", { kern: (K) => ({ ...K, MENSCH_GESTALT: { ...K.MENSCH_GESTALT, auge: { ...K.MENSCH_GESTALT.auge, schatten: { saum: 0.2, tief: 0.15 } } } }) }, /^augeWeiss .* < /, true); // prettier-ignore
    pruefe("GG1 der Kopf der Grobstufe auf dem Raster des Leibs (Nase und Flügel fallen aus dem Guss und stehen lose davor) wird erkannt", { kern: (K) => ({ ...K, MENSCH_GESTALT: { ...K.MENSCH_GESTALT, kopfHaut: { ...K.MENSCH_GESTALT.kopfHaut, voxGrob: 3.7 } } }) }, /^grobLose .* > /, "grob"); // prettier-ignore
    pruefe("GG2 die Haut, die sich über das Auge der Grobstufe schließt (die Blase), wird erkannt", { kern: (K) => ({ ...K, MENSCH_GESTALT: { ...K.MENSCH_GESTALT, kopfHaut: { ...K.MENSCH_GESTALT.kopfHaut, blend: 0.2 } } }) }, /^grobAugeFrei .* < /, "grob"); // prettier-ignore
    // (w28-iris-frei: die Höhle trägt ihren Ton über den Saum im Raum UND vorn über ihre Öffnung, `inOrbita` — der Täter nimmt beide:
    // ohne Saum, der Brauen-Bogen über die ganze Augen-Partie; ohne Saum allein blieb die Mutante vakuös)
    pruefe("GG3 die Haut der Grobstufe ohne den Ton der Höhle wird erkannt", { kern: (K) => ({ ...K, MENSCH_GESTALT: { ...K.MENSCH_GESTALT, kopfHaut: { ...K.MENSCH_GESTALT.kopfHaut, hoehleSaum: 0, brauBogen: 0.6 } } }) }, /^grobToene .* < /, "grob"); // prettier-ignore
    pruefe("GG4 der Kopf der Grobstufe über seinem Deckel (er nähme Haut und Stoff die Dreiecke) wird erkannt", { kern: (K) => ({ ...K, MENSCH_GESTALT: { ...K.MENSCH_GESTALT, haushalt: { ...K.MENSCH_GESTALT.haushalt, kopfGrob: 6000 } } }) }, /^grobKopfDreiecke .* > /, "grob"); // prettier-ignore
    pruefe("GE3 die volle Verdeckung der Kopf-Haut (die fleckige Haut) wird erkannt", { kern: (K) => ({ ...K, MENSCH_GESTALT: { ...K.MENSCH_GESTALT, kopfHaut: { ...K.MENSCH_GESTALT.kopfHaut, verdeckung: { ...K.MENSCH_GESTALT.kopfHaut.verdeckung, staerke: 2 } } } }) }, /^hautFleck .* > /, true); // prettier-ignore
    // (S8) der Hals-Deckel zurück (der Bau vor der Nacharbeit: ein flacher Zylinder 0,10/0,11 × 0,05 am oberen Ende der Röhre, im Kopf
    // auf Höhe der Lippen) — sein Rand läuft als dunkle Falte von den Mundwinkeln zum Kiefer
    const mitDeckel = (K) => ({ ...K, bauMensch: (F) => {
        const B = K.bauMensch(F), r = B.parts.neckMain;
        const oben = new r.position.constructor(0, r.geometry.parameters.height / (2 * K.MENSCH_GESTALT.hals.laenge), 0).applyQuaternion(r.quaternion).add(r.position); // prettier-ignore
        const d = F.zylinder(0.1, 0.11, 0.05, "skin");
        d.position.set(0, oben.y - 0.025, 0);
        r.parent.add(d);
        return B;
    } }); // prettier-ignore
    pruefe(
        "S8 der Hals-Deckel im Kopf (die Falte unter dem Mund) wird erkannt",
        { kern: mitDeckel },
        /^mundFalte /,
        true
    );
    // DAS STACHELHAAR (w28-mensch-samen, KOPF_SOLL haarStachel): jede Zeile des Stils steht wieder in der Normale ihrer Schale
    pruefe("S9 das stehende Haar (afro, jede Strähne eine Kreuz-Karte in der Normale ihrer Schale)", { dials: { hairStyle: "afro" }, kern: (K) => ({ ...K, haarStreu: (d) => K.haarStreu(d).map((z) => ({ ...z, radial: 1 })) }) }, /^haarStachel /, true); // prettier-ignore
    pruefe(
        "S7 das begrabene Auge (eine Augapfel-Breite zurück) wird erkannt",
        auge(-0.12),
        /^(augeFrei|augenVorstand)/,
        true
    );
    // DIE RUHE DER ARME: der Guss ohne die Anlage (der Arm im Rumpf) und der gespreizte Arm (der Regler arms 0,5: +0,65 rad)
    pruefe("R1 der Arm im Rumpf", { kern: (K) => ({ ...K, armAnlage: () => 0 }) }, /innen/, "ruhe");
    pruefe("R2 der gespreizte Arm", { kern: (K) => ({ ...K, morphAuf: (B, d) => K.morphAuf(B, { ...d, arms: 0.5 }) }) }, /spreizGrad/, "ruhe"); // prettier-ignore
    // (R4, seit w28-leib-kanon auf der Bühne des beleibten Rumpfs — Masse 2,5 im Gesetz —: der Kanon-Rumpf liegt an keinem Körper des
    // Gitters unter dem Arm, ohne Täter misst dieselbe Bühne durch 0)
    pruefe("R4 die Lagen des Rumpfs ohne Folge unter dem Arm (Haut und Stoff weichen gleich tief)", { kern: (K) => ({ ...K, morphAuf: (B, d) => K.morphAuf(B, { ...d, mass: 2.5 }), armAnlage: (B, hu, gel) => (hu.forEach((h) => (h.lage = 0)), K.armAnlage(B, hu, gel)) }) }, /durch/, "ruhe"); // prettier-ignore
    pruefe("R3 das Rig ohne die Ruhe seiner Arme (jede Schulter auf 0: der Stand der Welt vor w28-mensch-samen)", (rig) => (rig.armRuhe = [{}, {}]), /stufe":2.*innenStand/, "stand"); // prettier-ignore
    // DER KANON (w28-leib-kanon): der Brustkorb anderthalbfach tief (der Ballon-Rumpf vor w28-leib-kanon) und das Becken tief
    // hängend (der Schritt auf der Höhe der Windel)
    const amBau = (f) => ({ kern: (K) => ({ ...K, bauMensch: (F) => { const B = K.bauMensch(F); f(B.base, B.parts); return B; } }) }); // prettier-ignore
    // (Nummer 4: der Rumpf ist das Profil der Liste — eine Kugel des Baus zu verzerren bewegt nichts mehr, der Leser stellt die Haut
    // auf den Schnitt: die Täter greifen am Leser und an den Trägern des Morphs)
    const nachLeser = (f) => ({ kern: (K) => ({ ...K, leibRelief: (p, n, si, sw, sj, lage, ...r) => { K.leibRelief(p, n, si, sw, sj, lage, ...r); const yH = lage.hip1[1], L = lage.head[1] - yH; for (let i = 0; i < p.length; i += 3) f(p, i, (p[i + 1] - yH) / L); } }) }); // prettier-ignore
    // DIE WANGE (w28-wange): ohne ihre Kuppe fällt die Haut unter dem Auge zurück (der Stand davor: wangeVor −0,96, orbitaUnten 0,63,
    // lidHinterRand −0,13 — das Untergesicht als dunkle Maske unter der Mittags-Sonne); als Polster vor der Hornhaut versinkt das Auge
    const kuppe = (f) => amBau((_b, P) => ["malar1", "malar-1"].forEach((n) => f(P[n])));
    pruefe("OW1 die Wange ohne ihre Kuppe (unter dem Auge eingefallen) wird erkannt", kuppe((k) => k.scale.setScalar(0.01)), /^wangeVor .* </, true); // prettier-ignore
    pruefe("OW2 der eingefallene untere Höhlenrand (dieselbe Wange) wird erkannt", kuppe((k) => k.scale.setScalar(0.01)), /^orbitaUnten .* >/, true); // prettier-ignore
    pruefe("OW3 das Lid vor dem Lineal Braue–Wange (das Auge als Buckel) wird erkannt", kuppe((k) => k.scale.setScalar(0.01)), /^lidHinterRand .* </, true); // prettier-ignore
    pruefe("OW4 die Wange als Polster vor der Hornhaut (das Auge versinkt) wird erkannt", kuppe((k) => (k.position.z += 0.06)), /^(wangeVor .* >|orbitaUnten .* <)/, true); // prettier-ignore
    // DIE HÖHLE VORN (w28-iris-frei): der Brauen-Bogen über die ganze Augen-Partie gezogen nimmt der Haut vorn den Ton der Höhle —
    // der Stand am Kopf von w28-wange (dort nahm ihn der Saum im Raum: hoehleVorn 0,000)
    pruefe("OH1 die Höhle ohne Ton vorn um das Auge wird erkannt", { kern: (K) => ({ ...K, MENSCH_GESTALT: { ...K.MENSCH_GESTALT, kopfHaut: { ...K.MENSCH_GESTALT.kopfHaut, brauBogen: 0.6 } } }) }, /^hoehleVorn .* </, true); // prettier-ignore
    // DAS GESICHT DER MENGE (w28-satz-menge): der Guss der Menge ohne das Gesetz seiner Züge (der Stand davor: kein Beipack) — der
    // Ofen bricht laut, oder die Linse nennt das Maß
    {
        let wurf = "";
        try {
            wurf = urteileKopf(ladeOfen(), messeMengeGesicht(ladeOfen(), { kern: (K) => ({ ...K, KOPF_TON: { ...K.KOPF_TON, mundLinie: null } }) })).find((x) => /^mengeGesicht /.test(x)) || ""; // prettier-ignore
        } catch (e) {
            wurf = /MENGEN-LEIB: das Gesetz des Gesichts fehlt/.test(e.message) ? e.message : "";
        }
        console.log(`  ${wurf ? "✅" : "❌"} SG1 der Guss der Menge ohne das Gesetz seines Gesichts bricht laut${wurf ? " — " + wurf : ""}`);
        if (!wurf) rot++;
    }
    pruefe("KA1 der Brustkorb anderthalbfach tief wird erkannt", nachLeser((p, i, s) => { if (s > 0.4 && s < 0.7) p[i + 2] *= 1.5; }), /^kanon\.mann brustT /, "kanon"); // prettier-ignore
    pruefe("KA2 das Becken tief hängend wird erkannt", { kern: (K) => ({ ...K, morphAuf: (B, d) => { const M = K.morphAuf(B, d); B.parts.rumpfa.position.y -= 0.3; B.parts.rumpfa.scale.y *= 1.6; return M; } }) }, /^kanon\.(mann|frau) schritt .* </, "kanon"); // prettier-ignore
    // DIE GESTALT (w28-leib-kanon): der Guss ohne den Leser (die Kugel-Ketten: Wurst-Glieder, Kugel-Knie) und der Rumpf ohne seine
    // Lappen (die Normale null: keine Furche)
    // F1 nennt eine LANDMARKE als Zeugen (w28-leib-kanon Nummer 3): seit die Träger der Glieder aus dem Profil gießen, liegt die Verjüngung
    // des Gusses ohne Leser nah am Band (Arm 1,49 gegen 1,65) — die Lappen aber fehlen ihm ganz, zwei Landmarken wechseln das
    // Vorzeichen: die Kniekehle +0,85 mm (Band ≤ −1,5) und die Ellbogen-Spitze −0,21 mm (Band ≥ 1)
    pruefe("F1 der Guss ohne das Relief (kein Lappen: Kniekehle und Ellbogen-Spitze ohne ihr Vorzeichen) wird erkannt", { kern: (K) => ({ ...K, leibRelief: () => {} }) }, /^form (kniekehle|ellbogenSpitze) /, "form"); // prettier-ignore
    const ohneRelief = { kern: (K) => ({ ...K, leibRelief: (p, n, ...r) => K.leibRelief(p, new Float32Array(n.length), ...r) }) }; // prettier-ignore
    pruefe("F2 der Rumpf ohne seine Lappen (keine Wirbel-Furche) wird erkannt", ohneRelief, /^form wirbelFurche .* > /, "form"); // prettier-ignore
    // die Landmarken des Rumpfs (Nummer 4): derselbe Täter — der Rumpf ohne Schnitt, Lappen und Grate — verliert jede beim Namen
    pruefe("F3 der Rumpf ohne seine Grate (keine Rinne unter dem Brustmuskel) wird erkannt", ohneRelief, /^form brustUnterkante .* > /, "form"); // prettier-ignore
    // DIE SCHULTER UND IHRE GRUBE (Nummer 4c): je Landmarke ein EIGENER Täter nach dem Leser, in cm des Gusses (der Rumpf ohne Normale
    // traf die Grube seit Nummer 4b nicht mehr: der Leser stellt das Dach seither auf den Hang der Schulter, nicht auf die Normale)
    const nachLeserL = (f) => ({ kern: (K) => ({ ...K, leibRelief: (p, n, si, sw, sj, lage, ...r) => { K.leibRelief(p, n, si, sw, sj, lage, ...r); const yH = lage.hip1[1], L = lage.head[1] - yH, cm = 1 / (K.leibMassstab() * 100), gx = Math.abs(lage.arm1[0]), yJ = lage.arm1[1]; for (let i = 0; i < p.length; i += 3) f(p, i, (p[i + 1] - yH) / L, cm, gx, yJ); } }) }); // prettier-ignore
    pruefe("F4 die Grube über dem Schlüsselbein gefüllt (das Dach zwischen Schlüsselbein und Trapez 0,8 cm gehoben) wird erkannt", nachLeserL((p, i, s, cm, gx, yJ) => { if (Math.abs(p[i]) > 0.3 * gx && Math.abs(p[i]) < 0.75 * gx && p[i + 2] > 2 * cm && p[i + 2] < 6.5 * cm && p[i + 1] > yJ - cm) p[i + 1] += 0.8 * cm; }), /^form schluesselbeinGrube .* > /, "form"); // prettier-ignore
    pruefe("F5 der Rücken ohne das Schulterblatt wird erkannt", ohneRelief, /^form schulterblatt .* < /, "form"); // prettier-ignore
    pruefe("F6 das Gesäß ohne seine Spalte wird erkannt", ohneRelief, /^form gesaessSpalte .* > /, "form"); // prettier-ignore
    pruefe("F8 die Schulter als Stange (die Kappe oben flach auf 1,5 cm über dem Gelenk) wird erkannt", nachLeserL((p, i, s, cm, gx, yJ) => { if (Math.abs(p[i]) > gx - 2 * cm && p[i + 1] > yJ - 6 * cm) p[i + 1] = Math.max(p[i + 1], yJ + 1.5 * cm); }), /^form schulterEcke .* > /, "form"); // prettier-ignore
    pruefe("F9 die Kerbe am Akromion (das Dach bei 0,85 des Gelenk-Abstands 1,5 cm gesenkt) wird erkannt", nachLeserL((p, i, s, cm, gx, yJ) => { if (Math.abs(Math.abs(p[i]) - 0.85 * gx) < 1.2 * cm && p[i + 1] > yJ - 2 * cm) p[i + 1] -= 1.5 * cm; }), /^form akromionKerbe .* > /, "form"); // prettier-ignore
    pruefe("F10 der Keil der Achsel (der Arm um 0,25 vom Leib gespreizt) wird erkannt", { kern: (K) => ({ ...K, morphAuf: (B, d) => K.morphAuf(B, { ...d, arms: 0.25 }) }) }, /^form achselSpalt .* > /, "form"); // prettier-ignore
    pruefe("F11 die vordere Achselfalte gefüllt (vorn eben auf 11 cm) wird erkannt", nachLeserL((p, i, s, cm, gx) => { if (s > 0.6 && s < 0.8 && Math.abs(p[i]) > 0.3 * gx && Math.abs(p[i]) < 1.3 * gx && p[i + 2] > 0) p[i + 2] = 11 * cm; }), /^form achselfalteVorn .* < /, "form"); // prettier-ignore
    pruefe("F12 die hintere Achselfalte gefüllt (hinten eben auf 12 cm) wird erkannt", nachLeserL((p, i, s, cm, gx) => { if (s > 0.6 && s < 0.8 && Math.abs(p[i]) > 0.4 * gx && Math.abs(p[i]) < 1.3 * gx && p[i + 2] < 0) p[i + 2] = -12 * cm; }), /^form achselfalteHinten .* < /, "form"); // prettier-ignore
    pruefe("F13 der gezackte Arm (jede zweite Ecke 0,8 cm hinaus) wird erkannt", nachLeserL((p, i, s, cm, gx) => { if (Math.abs(p[i]) > gx && s > 0.4 && s < 0.75 && (i / 3) % 2) p[i] += Math.sign(p[i]) * 0.8 * cm; }), /^form armKnicke .* > /, "form"); // prettier-ignore
    pruefe("F14 an der Frau: die hintere Achselfalte gefüllt wird erkannt", nachLeserL((p, i, s, cm, gx) => { if (s > 0.6 && s < 0.8 && Math.abs(p[i]) > 0.4 * gx && Math.abs(p[i]) < 1.3 * gx && p[i + 2] < 0) p[i + 2] = -12 * cm; }), /^form.frau achselfalteHinten .* < /, "formFrau"); // prettier-ignore
    pruefe("F7 die Falte unter dem Gesäß gefüllt wird erkannt", nachLeser((p, i, s) => { if (s > -0.2 && s < -0.16 && p[i + 2] < 0) { p[i] *= 1.18; p[i + 2] *= 1.18; } }), /^form gesaessfalte .* > /, "form"); // prettier-ignore
    const rot0 = (K) => (h) => ({ ...K.kopfToene(h), lips: 0xaa5544 });
    pruefe(
        "S6 die rote Lippe (die alte Klassen-Farbe 0xaa5544) wird erkannt",
        { kern: (K) => ({ ...K, kopfToene: rot0(K) }) },
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
zeige(mk);
const mmg = messeMengeGesicht(so);
zeige(mmg);
const mW = mengeWelt();
const mm = messeMenge(null, mW);
const mb = messeBau(null, 0, mW);
console.log(`  bau.streuung (VK % über ${mW.siedlungen.reduce((n, x) => n + x.S.liste.length, 0)} Leiber der Menge): ${Object.entries(mb.vk).map(([k, x]) => `${k} ${x.toFixed(2)}`).join(" · ")} | vorzeichen r: ${Object.entries(mb.r).map(([k, x]) => `${k} ${x.toFixed(2)}`).join(" · ")}`); // prettier-ignore
const mh = messeHaltung(null, mW);
zeigeHaltung(mh, so.__koerperCore.ARM_RUHE.spreizGrad);
const mhs = pruefeHaltung(mW, so);
console.log(`  bau.leser (${mb.leser.wer}):${Object.entries(mb.leser).filter(([, x]) => typeof x === "number").map(([k, x]) => `${k} ${x < 1e-3 ? x.toExponential(1) : x.toFixed(4)}`).join(" · ")}`); // prettier-ignore
const mr = messeRuhe(so);
zeige(Object.fromEntries(mr.map((r, i) => ["spreizGrad" + i, r.spreizGrad])));
const ml = messeLeib(so);
zeige(ml);
const ms = messeStand(so);
zeige(Object.fromEntries(ms.map((r, i) => ["innenStand" + i, r.innenStand])));
const mkl = messeKleid(so);
const mhm = messeHandMenge(so);
console.log("  menge.hand (Satz gegen die nahe Hand, %):", Object.entries(mhm).map(([w, x]) => `${w} L ${x.laenge} vorn ${x.vorn} Seite ${x.seite}`).join(" · ")); // prettier-ignore
const mfm = messeFlankeMenge(so);
console.log("  menge.flanke (Rumpf des Satzes gegen den nahen, % · Höhen ohne Luft):", Object.entries(mfm).map(([w, x]) => `${w} ${x.breit} · ${x.zu}`).join(" · ")); // prettier-ignore
const mka = messeKalotte(so);
const mgr = messeGrob(so);
const mof = messeOrbitaFrau(so);
console.log("  orbita.frau:", Object.entries(mof).map(([n, v]) => `${n} ${+v.toFixed(4)}`).join(" · ")); // prettier-ignore
console.log("  grob (Ofen L1):", Object.entries(mgr).map(([n, v]) => `${n} ${+v.toFixed(4)}`).join(" · ")); // prettier-ignore
for (const [wer, x] of Object.entries(mka)) console.log(`  kalotte.${wer}:`, Object.entries(x).map(([n, v]) => `${n} ${+v.toFixed(4)}`).join(" · ")); // prettier-ignore
for (const [t, x] of Object.entries(mkl)) console.log(`  kleid.${t}:`, Object.entries(x).map(([n, v]) => `${n} ${+v.toFixed(4)}`).join(" · ")); // prettier-ignore
const mkn = messeKanon(so);
for (const [gs, k] of Object.entries(mkn)) console.log(`  kanon.${gs}:`, Object.entries(k.m).map(([n, x]) => `${n} ${x.toFixed(3)}`).join(" · ")); // prettier-ignore
const mf = messeForm(so),
    mf2 = messeForm(so, {}, 2),
    mfF = messeFormFrau(so);
console.log("  form:", Object.entries(mf.umfang).map(([n, x]) => `${n} ${x.toFixed(1)} cm`).join(" · "), "|", Object.entries(mf).filter(([, x]) => typeof x === "number").map(([n, x]) => `${n} ${x.toFixed(2)}`).join(" · ")); // prettier-ignore
console.log(
    `  form.menge: schenkelZuKnie ${mf2.schenkelZuKnie.toFixed(2)} · wadeZuKnoechel ${mf2.wadeZuKnoechel.toFixed(2)}`
);
console.log("  form.frau:", Object.entries(mfF).filter(([, x]) => typeof x === "number").map(([n, x]) => `${n} ${x.toFixed(2)}`).join(" · ")); // prettier-ignore
const iKanon = process.argv.indexOf("--kanon");
if (iKanon > 0) kanonBilder(mkn, process.argv[iKanon + 1] || "artifacts/kanon", so.__koerperCore.LEIB_SOLL.kanon);
const fehler = urteile(sb, m).concat(urteileKopf(so, mk), urteileKopf(so, mmg), urteileKopf(so, mof).map((x) => "orbita.frau " + x), urteileMenge(mm), urteileHandMenge(mhm), urteileFlankeMenge(mfm), urteileBau(so, mb), urteileHaltung(so, mh), mhs, kopfJe(so), urteileRuhe(so, mr), urteileRuhe(so, ms), urteile(so, ml, "LEIB_SOLL"), urteileKleid(so, mkl), urteileKalotte(so, mka), urteileKopf(so, mgr), urteileKopf(so, mof).map((x) => "orbita.frau " + x), urteileKanon(so, mkn), urteileForm(so, mf), urteileFormFrau(so, mfF), urteileForm(so, mf2, ["schenkelZuKnie", "wadeZuKnoechel"])); // prettier-ignore
urteilEnde(
    fehler.length,
    `\n❌ ROT — ${fehler.length} Abweichung(en):\n  ` + fehler.join("\n  "),
    "\n✅ GRÜN — der Mensch steht in seinen Anthropometrie-Bändern (Hand · Arm · Kopf · Gesicht · Fuß · Kanon · Verjüngung · Landmarken) und in EINER Haut, die Arme hängen außerhalb des Rumpfs, jeder Bewohner trägt den Bau seines Genoms und jeder Leser liest ihn."
);
