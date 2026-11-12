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
const lab = (r, g, b) => cielab([r, g, b]);
const linHex = (hx) => [(hx >> 16) & 255, (hx >> 8) & 255, hx & 255].map(srgbLin);
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
    return {
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

// DER KANON (w28-leib-kanon, koerper-core `leibKanon`, die Bänder LEIB_SOLL.kanon): am Ofen L0 nackt der Mann (gender 1) und die Frau
// (gender 0) an den Start-Dials — die Maße des Rumpfs, der Schulter und der Hüfte als Anteil von H; `--kanon <ordner>` legt die
// Umrisse vorn und seitlich als PNG ab (rot die Zehntel von H, blau die Soll-Höhen von Schulter und Schritt). Täter: `{ kern }`.
// Die Breiten von Brust und Taille misst er wie ANSUR mit vom Leib gelösten Armen (derselbe Guss, arms 0,5).
const messeKanon = (so, taeter = {}, K = taeter.kern ? taeter.kern(so.__koerperCore) : so.__koerperCore) =>
    Object.fromEntries(["mann", "frau"].map((gs) => {
        const d = { top: "none", bottom: "none", shoes: "none", gender: +(gs === "mann") };
        return [gs, so.__koerperCore.leibKanon(...[d, { ...d, arms: 0.5 }].map((dials) => so.BAKERS_BY_KIND.koerper(K, "mensch", 1, 0, { dials })))]; // prettier-ignore
    }));
const urteileKanon = (so, K, S = so.__koerperCore.LEIB_SOLL.kanon) =>
    Object.entries(K).flatMap(([gs, { m }]) => Object.entries(S[gs]).flatMap(([k, s]) => (Math.abs(m[k] / s - 1) <= S.toleranz ? [] : [`kanon.${gs} ${k} ${+m[k].toFixed(4)} ${m[k] < s ? "<" : ">"} ${+(s * (1 + (m[k] < s ? -1 : 1) * S.toleranz)).toFixed(4)}`]))); // prettier-ignore
function kanonBilder(K, ordner, S) {
    const zlib = require("zlib"), fs = require("fs"), farbe = [[255, 255, 255], [160, 120, 100], [90, 110, 170], [110, 145, 100], [200, 160, 120]]; // prettier-ignore
    const teil = (t, d) => { const l = Buffer.alloc(4), c = Buffer.alloc(4), td = Buffer.concat([Buffer.from(t), d]); l.writeUInt32BE(d.length); c.writeUInt32BE(zlib.crc32(td) >>> 0); return Buffer.concat([l, td, c]); }; // prettier-ignore
    fs.mkdirSync(ordner, { recursive: true });
    for (const [gs, k] of Object.entries(K))
        for (const ansicht of ["front", "seite"]) {
            const { w, h, px } = k[ansicht], roh = Buffer.alloc((3 * w + 1) * h), ih = Buffer.alloc(13);
            for (let r = 0; r < h; r++)
                for (let c = 0; c < w; c++) {
                    const y = h - 1 - r, linie = y % 50 === 0 ? [220, 0, 0] : [S[gs].schulterHoehe, S[gs].schritt].some((s) => Math.round(s * h) === y) ? [0, 0, 230] : null; // prettier-ignore
                    roh.set(px[y * w + c] ? farbe[px[y * w + c]] : linie && c % 3 ? linie : farbe[0], r * (3 * w + 1) + 1 + 3 * c);
                }
            ih.writeUInt32BE(w, 0), ih.writeUInt32BE(h, 4), (ih[8] = 8), (ih[9] = 2);
            fs.writeFileSync(require("path").join(ordner, `${gs}-${ansicht}.png`), Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), teil("IHDR", ih), teil("IDAT", zlib.deflateSync(roh)), teil("IEND", Buffer.alloc(0))])); // prettier-ignore
        }
}

// DIE GESTALT (w28-leib-kanon, koerper-core `leibFormUrteil`, die Bänder LEIB_FORM_SOLL): am Ofen nackt der Mann an den Start-Dials
// (L0) — die VERJÜNGUNG der Glieder (Umfang Oberarm ÷ Handgelenk, Oberschenkel ÷ Knie, Wade ÷ Knöchel) und die LANDMARKEN als Tiefe
// mit Vorzeichen in mm (Wirbel-Furche, Brustbein-Rinne, Kniekehle negativ; Kniescheibe, Ellbogen-Spitze positiv) — und an der
// Vorlage der Menge (Stufe 2, 1 700 Dreiecke) die Verjüngung des Beins: dieselbe Liste (koerper LEIB_RELIEF), dieselbe Gestalt.
// Am Kopf vor dem Gesetz: Arm 2,90 · Schenkel 1,12 · Wade 1,36, die Kniescheibe eine Kugel (+16,5 mm), keine Furche (−1,8 mm).
// Täter: `{ kern }` (der Kern, mit dem der Ofen gießt).
const messeForm = (so, taeter = {}, lod = 0, K = taeter.kern ? taeter.kern(so.__koerperCore) : so.__koerperCore) => so.__koerperCore.leibFormUrteil(so.BAKERS_BY_KIND.koerper(K, "mensch", 1, lod, { dials: { top: "none", bottom: "none", shoes: "none" } })); // prettier-ignore
const urteileForm = (so, m, nur) => urteile(so, nur ? Object.fromEntries(nur.map((k) => [k, m[k]])) : m, "LEIB_FORM_SOLL").map((x) => (nur ? "form.menge " : "form ") + x); // prettier-ignore

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
function messeMenge(eingriff) {
    const { AnazhRealm: A, ctx } = require("./lib/stamm.cjs").ladeKlasse(require("path").join(__dirname, ".."));
    if (eingriff) eingriff(A, ctx);
    const r = Object.assign(Object.create(A.prototype), { state: {} });
    const px = (1080 / (2 * Math.tan((A.KAM_FOV_GRAD * Math.PI) / 360)) / A.BEWOHNER.nahM) * ((8 * A.PLAYER_KH) / 6);
    const m = { gleich: 0, min: Infinity, paar: null };
    for (const seed of MENGE_PLAENE) {
        const S = { plan: ctx.__fachwerkCore.exportSettlement({ seed, nH: 12 }), liste: [...Array(50)].map((_, i) => ({ seed: `${seed}:${i >> 1}:${i & 1}` })) }; // prettier-ignore
        S.gestalten = r._bewohnerGestalten(S);
        r._bewohnerGenome(S);
        // die Vorlage der Stufe 2 in der Tracht des Plans samt Tafel, wie der Ofen sie der Welt gießt (Beipack `raum`)
        const R = ctx.BAKERS_BY_KIND.koerper(ctx.__koerperCore, "mensch", 1, 2, { dials: S.raum.dK }).userData.__skelett.raum;
        const je = S.liste.map((b) => [A._leibRaumLeib(R, b.raumPunkt).map((x) => x * b.raumSkala * px), b.seed]);
        je.forEach(([a, s], i) =>
            je.slice(i + 1).forEach(([c, t]) => {
                const d = Math.max(...a.map((x, e) => (e % 3 ? 0 : Math.hypot(x - c[e], a[e + 1] - c[e + 1], a[e + 2] - c[e + 2]))));
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
            kopf === "menge" ? urteileMenge(messeMenge(verzerre)) : kopf === "form" ? urteileForm(sb, messeForm(sb, verzerre)) : kopf === "kanon" ? urteileKanon(sb, messeKanon(sb, verzerre)) : kopf === "schnitte" ? kopfJe(sb, verzerre.kern) : kopf === "stand" ? urteileRuhe(sb, messeStand(sb, verzerre, 1)) : kopf === "ruhe" ? urteileRuhe(sb, messeRuhe(sb, verzerre.kern)) : kopf === "leib" ? urteile(sb, messeLeib(sb, verzerre), "LEIB_SOLL") : kopf ? urteileKopf(sb, messeKopf(sb, verzerre)) : urteile(sb, messe(sb, verzerre)); // prettier-ignore
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
    pruefe("S8 der Hals-Deckel im Kopf (die Falte unter dem Mund) wird erkannt", { kern: mitDeckel }, /^mundFalte /, true);
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
    pruefe("KA1 der Brustkorb anderthalbfach tief wird erkannt", amBau((b) => (b.ribcage.z *= 1.5)), /^kanon\.mann brustT /, "kanon"); // prettier-ignore
    pruefe("KA2 das Becken tief hängend wird erkannt", amBau((b, p) => ((b.pelvis.y *= 1.6), (p.pelvis.position.y -= 0.3))), /^kanon\.(mann|frau) schritt .* </, "kanon"); // prettier-ignore
    // DIE GESTALT (w28-leib-kanon): der Guss ohne den Leser (die Kugel-Ketten: Wurst-Glieder, Kugel-Knie) und der Rumpf ohne seine
    // Lappen (die Normale null: keine Furche)
    pruefe("F1 der Guss ohne das Relief (die Kugel-Ketten vor w28-leib-kanon) wird erkannt", { kern: (K) => ({ ...K, leibRelief: () => {} }) }, /^form (armZuHandgelenk|schenkelZuKnie|wadeZuKnoechel|kniescheibe) /, "form"); // prettier-ignore
    pruefe("F2 der Rumpf ohne seine Lappen (keine Wirbel-Furche) wird erkannt", { kern: (K) => ({ ...K, leibRelief: (p, n, ...r) => K.leibRelief(p, new Float32Array(n.length), ...r) }) }, /^form wirbelFurche .* > /, "form"); // prettier-ignore
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
const mm = messeMenge();
const mr = messeRuhe(so);
zeige(Object.fromEntries(mr.map((r, i) => ["spreizGrad" + i, r.spreizGrad])));
const ml = messeLeib(so);
zeige(ml);
const ms = messeStand(so);
zeige(Object.fromEntries(ms.map((r, i) => ["innenStand" + i, r.innenStand])));
const mkn = messeKanon(so);
for (const [gs, k] of Object.entries(mkn)) console.log(`  kanon.${gs}:`, Object.entries(k.m).map(([n, x]) => `${n} ${x.toFixed(3)}`).join(" · ")); // prettier-ignore
const mf = messeForm(so), mf2 = messeForm(so, {}, 2);
console.log("  form:", Object.entries(mf.umfang).map(([n, x]) => `${n} ${x.toFixed(1)} cm`).join(" · "), "|", Object.entries(mf).filter(([, x]) => typeof x === "number").map(([n, x]) => `${n} ${x.toFixed(2)}`).join(" · ")); // prettier-ignore
console.log(`  form.menge: schenkelZuKnie ${mf2.schenkelZuKnie.toFixed(2)} · wadeZuKnoechel ${mf2.wadeZuKnoechel.toFixed(2)}`);
const iKanon = process.argv.indexOf("--kanon");
if (iKanon > 0) kanonBilder(mkn, process.argv[iKanon + 1] || "artifacts/kanon", so.__koerperCore.LEIB_SOLL.kanon);
const fehler = urteile(sb, m).concat(urteileKopf(so, mk), urteileMenge(mm), kopfJe(so), urteileRuhe(so, mr), urteileRuhe(so, ms), urteile(so, ml, "LEIB_SOLL"), urteileKanon(so, mkn), urteileForm(so, mf), urteileForm(so, mf2, ["schenkelZuKnie", "wadeZuKnoechel"])); // prettier-ignore
urteilEnde(
    fehler.length,
    `\n❌ ROT — ${fehler.length} Abweichung(en):\n  ` + fehler.join("\n  "),
    "\n✅ GRÜN — der Mensch steht in seinen Anthropometrie-Bändern (Hand · Arm · Kopf · Gesicht · Fuß · Kanon · Verjüngung · Landmarken) und in EINER Haut, die Arme hängen außerhalb des Rumpfs."
);
