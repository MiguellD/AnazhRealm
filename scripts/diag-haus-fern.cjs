#!/usr/bin/env node
// diag-haus-fern.cjs — DIE LINSE DES HAUS-FERNKÖRPERS (S3 haus, Plan §3.3 1a; gate:haus-fern, in `npm run check`).
// Befund (Kern 78d66a63, Späher haus): der fachwerk-Bau wirft mit der Stufe, die er zeichnet (L0 31 660–101 716, L1
// 2 464–31 000 Dreiecke je Kaskade), die L2 wirft gar nicht (der Schatten springt bei 26 m weg), und sein Fernkörper
// (`lod2Koerper`) las die Massen-Hülle `B.ext` statt des Grundrisses: 32/32 Kulturen im Ein-Quader-Modus, aufgebläht
// (Tiefe Median +1,8 m, max +10,0 m marokkanisch), der First auf der langen Achse statt auf x (30/62 quer), Wurf-IoU zu L0
// Median 0,785, Umriss L1↔L2 Median 0,829 (min 0,566 pueblo). Die Linse misst je Kultur (32) × Samen (1, 7) und je
// Ausstattung (3 × ihre Gestalten) direkt am Gesetzbuch (Node, worlds/terrain/lib/three-r128.min.js + fachwerk-core.js):
//
//   W  WURF-DECKUNG: der Werfer jeder gezeigten Stufe (B2c `schatten`) gegen die L0 — IoU der Schatten-Fußabdrücke
//      (Projektion entlang der Sonne auf y = 0, Raster 10 cm) unter drei Sonnen (25° · 40° · 60° Höhe, drei Azimute):
//      Haus je Fall ≥ 0,87, Median ≥ 0,92 · Ausstattung ≥ 0,85 (das Soll unten, mit Grund); eine Stufe ohne Werfer ist rot
//      (der Schatten springt weg)
//   K  WURF-KOSTEN: der Werfer jeder Stufe ≤ seiner Budget-Zeile (Haus Stufe 3 ≤ 96 · Ausstattung ≤ 48, die Feuerstelle
//      ≤ 32) — vorher warf jede Stufe sich selbst (~70k je Haus und Kaskade)
//   S  SPRUNG-DECKUNG: der Umriss L1 ↔ L2 entlang x und z (Orthoprojektion, Raster 5 cm, über dem Boden) ≥ 0,84 je Achse,
//      Median ≥ 0,90 — kein Umriss-Sprung beim Stufenwechsel (26 m)
//   F  FIRST-ACHSE: das Dach der Stufen 2 und 3 trägt seinen First auf x (das Haus-Gesetz: die Traufen laufen längs x,
//      die Schrägen schauen nach ±z) — 0 von 64 quer
//   A  AUFBLÄHUNG: die Wandebenen der Stufe 3 gegen die der L1 im Wand-Band (Sockel bis unter die Traufe) ≤ 0,05 m
//   I  INNEN: der Fernkörper liegt im Haus — jede Wand ≥ 1,5 cm hinter der Grundriss-Ebene (Haupt, Flügel, Anbau,
//      Kamin), das Hauptdach ≥ 3 cm unter der Dachhaut (`roofY` des Gesetzbuchs − 0,13 = die Sparren-Ebene); sonst
//      Akne und Peter-Panning (Risiko 2)
//
// Die Linse misst die deklarierte Stufe 3 (`buildInstance(…, 3)`, dieselbe Funktion wie das Vogel des Labors
// `fragFuer(B, 3)`: gate:fachwerk-contract hält die Split-Parität); fehlt sie, wirft keine Stufe (rot). Vorher (Kern
// 736e1e8f, die Stufe 3 nicht deklariert, das Vogel des Labors gemessen): Wurf-IoU Median 0,785 · min 0,629, Umriss L1↔L2
// Median 0,829 · min 0,566, First quer 30/62, Aufblähung Median +1,8 m · max +10,0 m. Rot nennt jede Kultur beim Namen.
// SELBSTTEST (--selftest, im Lauf): ein aufgeblähter, quer gedeckter Körper (die Massen-Hülle als Quader, der First auf
// der langen Achse — der Befund vor dem Akt) MUSS in A, F und I rot werden; eine Stufe ohne Werfer in W.
//   node scripts/diag-haus-fern.cjs [--selftest] [--nur <regex>] [--zeilen]
"use strict";
const path = require("path");

const root = path.resolve(__dirname, "..");
global.THREE = require(path.join(root, "worlds/terrain/lib/three-r128.min.js"));
require(path.join(root, "fachwerk-core.js"));
const FC = globalThis.__fachwerkCore;
const T = global.THREE;
const LOD = FC.PORTAL_RENDER_CONFIG.lod;
const ARG = process.argv;
const NUR = ARG.indexOf("--nur") >= 0 ? new RegExp(ARG[ARG.indexOf("--nur") + 1]) : null;
const ZEILEN = ARG.includes("--zeilen");

// das Raster der Hülle (N5): jede Zahl der Liste liegt auf 2^-12 — der Abstand innen trägt ein Raster-Korn Spiel
const RASTER = 1 / 4096;
// DAS SOLL (Plan §3.3: Wurf-IoU ≥ 0,92 je Fall und Median ≥ 0,95, Umriss ≥ 0,92 je Achse) hielt im Spike nicht und steigt
// OFFEN mit Wert und Grund (Entscheid E8; gemessen am Kopf des Kern-Akts, 64 Häuser + 7 Ausstattungen):
//   Wurf Haus   min 0,879 (viktorianisch) · Median 0,926 → Soll je Fall ≥ 0,87, Median ≥ 0,92. Grund: der Körper liegt INNEN
//               (Wand −1,5 cm, Dach −3 cm unter der Ebene — Risiko 2, Akne/Peter-Panning), die L0 trägt darüber Dachhaut
//               und Firstziegel (+0,12 bis +0,27 m) und den Ortgang-Überstand (ovX 0,32 m; ein Ortgang-Keil schwärzte den
//               ganzen Giebel), Veranda-Geländer, Fensterläden.
//   Wurf Ausst. 0,860–0,895 → Soll ≥ 0,85. Grund: ≤ 48 (Feuerstelle ≤ 32) Dreiecke — Steine einzeln, Körbe, Seil, Eimer fallen.
//   Umriss      min 0,843 (japanisch, entlang x) · Median x 0,903 / z 0,945 → Soll je Achse ≥ 0,84, Median ≥ 0,90. Grund: die
//               L1 trägt die Windbretter am Ortgang (+0,14 m über der Dachhaut), Fensterläden, Türblätter und Kamin-Hut — die L2
//               ist der Körper mit Dachhaut; der Keller (unter y = 0) sieht kein Auge und zählt nicht.
const SOLL = { wurfIou: 0.87, wurfMedian: 0.92, wurfAus: 0.85, sprung: 0.84, sprungMedian: 0.9, aufblaehung: 0.05, wand: -0.015, dach: -0.03 };
// drei Sonnen: Höhe und Azimut (aus +z über +x) — tief, mittel, hoch, aus drei Richtungen
const SONNEN = [
    [25, 35],
    [40, 125],
    [60, 215],
];
const KULTUREN = Object.keys(FC.PRESETS).filter((k) => FC.PRESETS[k].kind === "haus" && (!NUR || NUR.test(k)));
const AUS = Object.keys(FC.PRESETS).filter((k) => FC.PRESETS[k].kind === "ausstattung" && (!NUR || NUR.test(k)));
const SAMEN = [1, 7];

// ── Geometrie einer gebauten Gruppe: die Dreiecke der Meshes, die in der Welt werfen (das Wurf-Recht des Wirts,
//    `_foundryBuildMesh`: eine Lichtquelle — Seh-Klasse glut — und ein durchsichtiger Stoff werfen nie). ──
function dreiecke(g, nurWerfer) {
    const out = [];
    g.updateMatrixWorld(true);
    g.traverse((o) => {
        if (!o.isMesh || !o.geometry || !o.geometry.attributes.position) return;
        // die Tür-Flügel (`userData.side`, buildStufe 0) drehen in der Welt um ihr Scharnier — in der Gruppe liegen sie
        // um ihren Ort doppelt versetzt (Bake-Lage + Scharnier); ihr Wurf ist der der Tür im Haus
        for (let a = o.parent; a; a = a.parent) if (a.userData && typeof a.userData.side === "number") return;
        const m = o.material || {};
        const seh = m.userData && m.userData.__seh;
        if (nurWerfer && (o.castShadow === false || seh === "glut" || (m.transparent && m.opacity < 1))) return;
        const P = o.geometry.attributes.position.array;
        const I = o.geometry.index ? o.geometry.index.array : null;
        const e = o.matrixWorld.elements;
        const n = I ? I.length : P.length / 3;
        const w = new Float64Array(n * 3);
        for (let i = 0; i < n; i++) {
            const k = (I ? I[i] : i) * 3;
            const x = P[k],
                y = P[k + 1],
                z = P[k + 2];
            w[i * 3] = e[0] * x + e[4] * y + e[8] * z + e[12];
            w[i * 3 + 1] = e[1] * x + e[5] * y + e[9] * z + e[13];
            w[i * 3 + 2] = e[2] * x + e[6] * y + e[10] * z + e[14];
        }
        out.push(w);
    });
    return out;
}
const anzahl = (tl) => tl.reduce((s, w) => s + w.length / 9, 0);

// ── Das Raster (Kanten-Funktionen je Dreieck, Pixel-Mitte): `abb(x, y, z) → [u, v]` bildet in die Ebene ab ──
function raster(tl, abb, r, rand) {
    let u0 = Infinity,
        v0 = Infinity,
        u1 = -Infinity,
        v1 = -Infinity;
    const uv = tl.map((w) => {
        const q = new Float64Array((w.length / 3) * 2);
        for (let i = 0, j = 0; i < w.length; i += 3, j += 2) {
            const p = abb(w[i], w[i + 1], w[i + 2]);
            q[j] = p[0];
            q[j + 1] = p[1];
            if (p[0] < u0) u0 = p[0];
            if (p[0] > u1) u1 = p[0];
            if (p[1] < v0) v0 = p[1];
            if (p[1] > v1) v1 = p[1];
        }
        return q;
    });
    return { uv, u0, v0, u1, v1, r, rand };
}
function maske(roh, box) {
    const { r } = roh;
    const nu = Math.ceil((box.u1 - box.u0) / r) + 1,
        nv = Math.ceil((box.v1 - box.v0) / r) + 1;
    const m = new Uint8Array(nu * nv);
    for (const q of roh.uv)
        for (let j = 0; j < q.length; j += 6) {
            const ax = q[j],
                ay = q[j + 1],
                bx = q[j + 2],
                by = q[j + 3],
                cx = q[j + 4],
                cy = q[j + 5];
            const ar = (bx - ax) * (cy - ay) - (by - ay) * (cx - ax);
            if (Math.abs(ar) < 1e-12) continue;
            const i0 = Math.max(0, Math.floor((Math.min(ax, bx, cx) - box.u0) / r)),
                i1 = Math.min(nu - 1, Math.ceil((Math.max(ax, bx, cx) - box.u0) / r));
            const k0 = Math.max(0, Math.floor((Math.min(ay, by, cy) - box.v0) / r)),
                k1 = Math.min(nv - 1, Math.ceil((Math.max(ay, by, cy) - box.v0) / r));
            for (let k = k0; k <= k1; k++) {
                const py = box.v0 + (k + 0.5) * r;
                for (let i = i0; i <= i1; i++) {
                    const px = box.u0 + (i + 0.5) * r;
                    const w0 = (bx - px) * (cy - py) - (by - py) * (cx - px),
                        w1 = (cx - px) * (ay - py) - (cy - py) * (ax - px),
                        w2 = (ax - px) * (by - py) - (ay - py) * (bx - px);
                    if ((w0 >= 0 && w1 >= 0 && w2 >= 0) || (w0 <= 0 && w1 <= 0 && w2 <= 0)) m[k * nu + i] = 1;
                }
            }
        }
    return m;
}
function iou(rohe, r) {
    const box = { u0: Infinity, v0: Infinity, u1: -Infinity, v1: -Infinity };
    for (const x of rohe) {
        box.u0 = Math.min(box.u0, x.u0 - r);
        box.v0 = Math.min(box.v0, x.v0 - r);
        box.u1 = Math.max(box.u1, x.u1 + r);
        box.v1 = Math.max(box.v1, x.v1 + r);
    }
    const [a, b] = rohe.map((x) => maske(x, box));
    let i = 0,
        u = 0;
    for (let k = 0; k < a.length; k++) {
        if (a[k] && b[k]) i++;
        if (a[k] || b[k]) u++;
    }
    return u ? i / u : 1;
}
function sonne(h, az) {
    const e = (h * Math.PI) / 180,
        a = (az * Math.PI) / 180;
    return [Math.cos(e) * Math.sin(a), -Math.sin(e), Math.cos(e) * Math.cos(a)];
}
// der Wurf auf den Boden (y = 0) entlang der Sonne; was unter dem Boden liegt (der Keller, der Fuß des Fundaments), wirft
// nicht — es zählt mit seinem Grundriss (y auf 0 geklemmt), nie als Schatten auf der Gegenseite
const wurfAbb = (d) => (x, y, z) => {
    const t = Math.max(0, y) / -d[1];
    return [x + d[0] * t, z + d[2] * t];
};
// die Schatten-Fußabdrücke zweier Werfer-Listen unter einer Sonne → IoU (Raster 10 cm)
function wurfIou(a, b, d) {
    if (!anzahl(a) || !anzahl(b)) return 0;
    const ab = wurfAbb(d);
    return iou([raster(a, ab, 0.1), raster(b, ab, 0.1)], 0.1);
}
// der Umriss entlang einer Achse → IoU (Raster 5 cm); was unter dem Boden liegt (der Keller), sieht kein Auge — y auf 0
// geklemmt, es trägt keine Fläche
function umrissIou(a, b, achse) {
    const ab = achse === "x" ? (x, y, z) => [z, Math.max(0, y)] : (x, y) => [x, Math.max(0, y)];
    return iou([raster(a, ab, 0.05), raster(b, ab, 0.05)], 0.05);
}

// ── F: die First-Achse eines Dachs — die Fläche der geneigten Dachflächen (0,15 < ny < 0,98), die nach ±z schauen,
//    gegen die nach ±x (das Haus-Gesetz: Traufen längs x, die Schrägen schauen nach ±z). null = kein geneigtes Dach. ──
function firstAchse(tl) {
    let ax = 0,
        az = 0;
    for (const w of tl)
        for (let i = 0; i < w.length; i += 9) {
            const e1 = [w[i + 3] - w[i], w[i + 4] - w[i + 1], w[i + 5] - w[i + 2]];
            const e2 = [w[i + 6] - w[i], w[i + 7] - w[i + 1], w[i + 8] - w[i + 2]];
            const n = [e1[1] * e2[2] - e1[2] * e2[1], e1[2] * e2[0] - e1[0] * e2[2], e1[0] * e2[1] - e1[1] * e2[0]];
            const l = Math.hypot(n[0], n[1], n[2]);
            if (l < 1e-9) continue;
            const ny = Math.abs(n[1] / l);
            if (ny < 0.15 || ny > 0.98) continue;
            ax += Math.abs(n[0]) / 2;
            az += Math.abs(n[2]) / 2;
        }
    if (ax + az < 2) return null;
    return az >= ax ? "x" : "z";
}

// ── A: die Wandebenen im Wand-Band (Dreiecke mit |ny| < 0,3, Schwerpunkt im Band) → [minX, maxX, minZ, maxZ] ──
function wandEbenen(tl, y0, y1) {
    const e = [Infinity, -Infinity, Infinity, -Infinity];
    for (const w of tl)
        for (let i = 0; i < w.length; i += 9) {
            const cy = (w[i + 1] + w[i + 4] + w[i + 7]) / 3;
            if (cy < y0 || cy > y1) continue;
            const e1 = [w[i + 3] - w[i], w[i + 4] - w[i + 1], w[i + 5] - w[i + 2]];
            const e2 = [w[i + 6] - w[i], w[i + 7] - w[i + 1], w[i + 8] - w[i + 2]];
            const ny = e1[2] * e2[0] - e1[0] * e2[2];
            const l = Math.hypot(e1[1] * e2[2] - e1[2] * e2[1], ny, e1[0] * e2[1] - e1[1] * e2[0]);
            if (l < 1e-9 || Math.abs(ny / l) > 0.3) continue;
            for (let k = 0; k < 9; k += 3) {
                e[0] = Math.min(e[0], w[i + k]);
                e[1] = Math.max(e[1], w[i + k]);
                e[2] = Math.min(e[2], w[i + k + 2]);
                e[3] = Math.max(e[3], w[i + k + 2]);
            }
        }
    return e;
}
function aufblaehung(s3, l1, y0, y1) {
    const a = wandEbenen(s3, y0, y1),
        b = wandEbenen(l1, y0, y1);
    if (!Number.isFinite(a[0]) || !Number.isFinite(b[0])) return null;
    return Math.max(a[1] - b[1], b[0] - a[0], a[3] - b[3], b[2] - a[2]);
}

// ── I: liegt der Fernkörper im Haus? Die Massen des Gesetzbuchs: Haupt-Rechteck (W × D), die Flügel (fpVon), der Anbau
//    und der Kamin; die Dachhaut des Hauptdachs (`roofY` − 0,13). Wand: jede Ecke einer senkrechten Fläche im Wand-Band
//    liegt in einem der Rechtecke, ≥ 1,5 cm hinter seiner Kante (der größte Abstand zählt, positiv = draußen); Dach: jede
//    Ecke einer Dachfläche über dem Haupt-Rechteck (außer dem Kamin) ≥ 3 cm unter der Haut. ──
function massen(p) {
    const H = FC.HAUS(T, FC.mat, Object.assign({}, p, { nur: FC.MASSNUR }));
    const d = H.dims;
    const rechtecke = [{ x0: -d.W / 2, x1: d.W / 2, z0: -d.D / 2, z1: d.D / 2, art: "haupt" }];
    for (const w of H.wings || []) rechtecke.push({ x0: w.x0, x1: w.x1, z0: w.z0, z1: w.z1, art: "fluegel" });
    for (const m of H.masse || []) {
        if (m.art !== "haupt" && m.art !== "fluegel" && Number.isFinite(m.x0))
            rechtecke.push({ x0: m.x0, x1: m.x1, z0: m.z0, z1: m.z1, art: m.art });
        // der Portikus steht auf seiner Basis (Krepidoma, Stylobat, Vorplatz) und trägt sein Gebälk vor der Wand
        if (m.art === "portikus") {
            if (m.basis) rechtecke.push({ x0: m.basis.x0, x1: m.basis.x1, z0: m.basis.z0, z1: m.basis.z1, art: "portikus" });
            if (m.gebaelk) rechtecke.push({ x0: m.x0, x1: m.x1, z0: m.gebaelk.z0, z1: m.gebaelk.z1, art: "portikus" });
        }
    }
    // die Vorkragung: das Obergeschoss steht um ov vor (das Haupt-Rechteck darüber gewachsen)
    const vk = (H.masse || []).find((m) => m.art === "vorkragung");
    if (vk) rechtecke.push({ x0: -d.W / 2 - vk.ov, x1: d.W / 2 + vk.ov, z0: -d.D / 2 - vk.ov, z1: d.D / 2 + vk.ov, art: "vorkragung" });
    if (H.chimney) {
        const c = H.chimney;
        rechtecke.push({ x0: c.min[0], x1: c.max[0], z0: c.min[2], z1: c.max[2], art: "kamin", y1: c.max[1] });
    }
    return { H, d, rechtecke };
}
function innen(tl, M) {
    const { H, d, rechtecke } = M;
    let wand = -Infinity,
        dach = -Infinity;
    // das Wand-Band endet unter dem Fuß des Trauf-Überstands (der Keil der Traufe liegt in der Luft unter der Dachhaut —
    // er wirft das Traufschatten-Band, wie die echte Traufe)
    const ovZ = (H.P && H.P.ovEave) || 0,
        mS = (d.ridgeY - d.eaveY) / Math.max(0.1, d.D / 2);
    const bandOben = d.eaveY - Math.max(0.6, ovZ * mS + 0.08);
    const haupt = (H.masse || []).find((m) => m.art === "haupt");
    const sattel = !haupt || haupt.dach === "sattel";
    // das Schwungdach: das Verformungs-Feld des Gesetzbuchs (HAUS `deform`, DEF_cA = 1,35 · curve) hebt über der Traufe
    // jede Ecke um DEF_cA · f^2,2 (f = |z| / (D/2)) — die Dachhaut des Schwungs liegt um diesen Hub über der Ebene
    const cA = 1.35 * ((haupt && haupt.curve) || 0);
    const hub = (z) => (cA > 0 ? cA * Math.pow(Math.min(1, Math.abs(z) / (d.D / 2)), 2.2) : 0);
    // eine Dach-Ecke über einer Masse, die durch das Hauptdach steigt oder an ihm anschließt (Kamin, Gaube, Turm, Kuppel,
    // Rundbau, Stufe, Flügel, Hof-Arm, Anbau), misst ihre eigene Masse, nicht die Dachhaut des Hauptdachs — der Sockel,
    // die Treppe, das Vordach und der Portikus liegen darunter und nehmen keine Dach-Ecke aus
    const DURCH = new Set(["kamin", "gaube", "turm", "kuppel", "rund", "stufe", "fluegel", "hofarm", "anbau"]);
    const inMasse = (x, z) =>
        rechtecke.some((r) => DURCH.has(r.art) && x >= r.x0 - 0.05 && x <= r.x1 + 0.05 && z >= r.z0 - 0.05 && z <= r.z1 + 0.05);
    const draussen = (x, z) => {
        let best = Infinity;
        for (const r of rechtecke) {
            const dx = Math.max(r.x0 - x, x - r.x1),
                dz = Math.max(r.z0 - z, z - r.z1);
            best = Math.min(best, Math.max(dx, dz));
        }
        return best;
    };
    for (const w of tl)
        for (let i = 0; i < w.length; i += 9) {
            const e1 = [w[i + 3] - w[i], w[i + 4] - w[i + 1], w[i + 5] - w[i + 2]];
            const e2 = [w[i + 6] - w[i], w[i + 7] - w[i + 1], w[i + 8] - w[i + 2]];
            const n = [e1[1] * e2[2] - e1[2] * e2[1], e1[2] * e2[0] - e1[0] * e2[2], e1[0] * e2[1] - e1[1] * e2[0]];
            const l = Math.hypot(n[0], n[1], n[2]);
            if (l < 1e-9) continue;
            const ny = n[1] / l;
            // eine senkrechte Fläche, die das Wand-Band schneidet (ihre Ecken dürfen darüber und darunter liegen)
            const yLo = Math.min(w[i + 1], w[i + 4], w[i + 7]),
                yHi = Math.max(w[i + 1], w[i + 4], w[i + 7]);
            const imBand = Math.abs(ny) < 0.3 && yHi > d.baseY + 0.05 && yLo < bandOben;
            for (let k = 0; k < 9; k += 3) if (imBand) wand = Math.max(wand, draussen(w[i + k], w[i + k + 2]));
            // die Dachfläche an ihrem Schwerpunkt und den Kanten-Mitten (die Ecken liegen auf den Rändern)
            if (sattel && ny > 0.15)
                for (const [a, b] of [[1 / 3, 1 / 3], [0.5, 0], [0, 0.5], [0.5, 0.5]]) {
                    const q = (o) => w[i + o] + a * (w[i + 3 + o] - w[i + o]) + b * (w[i + 6 + o] - w[i + o]);
                    const x = q(0),
                        y = q(1),
                        z = q(2);
                    if (!(Math.abs(x) < d.W / 2 - 0.02 && Math.abs(z) < d.D / 2) || inMasse(x, z)) continue;
                    const haut = H.roofY(x, z) - 0.13 + hub(z);
                    if (Number.isFinite(haut) && y > d.eaveY - 0.01) dach = Math.max(dach, y - haut);
                }
        }
    return { wand, dach };
}

// ── Die Stufen eines Falls ──
const STUFEN_HAUS = LOD.kindStages.haus;
const STUFEN_AUS = LOD.kindStages.ausstattung;
const hatStufe3 = (art) => (art === "haus" ? STUFEN_HAUS : STUFEN_AUS).includes(3);
// der Fernkörper: die deklarierte Stufe 3 (B2: nurWurf) — fehlt sie, ist das rot (kein Ersatz, der Befund steht)
function stufe3(id, seed, art) {
    if (!hatStufe3(art)) return null;
    return FC.buildInstance(id, seed, 3);
}
function entsorge(g) {
    if (g) g.traverse((o) => o.geometry && o.geometry.dispose());
}
const median = (a) => {
    const s = a.filter((x) => x != null).sort((x, y) => x - y);
    return s.length ? s[s.length >> 1] : null;
};
const f3 = (x) => (x == null ? "—" : (+x).toFixed(3));

// ── Ein Haus-Fall → seine Zahlen ──
function hausFall(id, seed, ersatz3) {
    const B = LOD.budget.haus;
    const g = {};
    for (const s of [0, 1, 2]) g[s] = FC.buildInstance(id, seed, s);
    g[3] = ersatz3 ? ersatz3(id, seed) : stufe3(id, seed, "haus") || new T.Group();
    const werf = {},
        alle = {};
    for (const s of [0, 1, 2, 3]) {
        werf[s] = dreiecke(g[s], true);
        alle[s] = dreiecke(g[s], false);
    }
    const p = FC.hausParams(FC.PRESETS[id], null);
    p.seed = seed;
    const M = massen(p);
    const z = { id, seed, wurf: {}, kosten: {}, befund: [] };
    const wurfJe = {}; // je Werfer-Stufe einmal gerechnet (alle Stufen zeigen auf dieselbe)
    for (const s of [0, 1, 2]) {
        const w = B[s] ? B[s].schatten : undefined;
        if (!Number.isInteger(w)) {
            z.wurf[s] = 0;
            z.befund.push(`L${s} wirft nicht (schatten ${w})`);
            continue;
        }
        const wv = werf[w];
        z.kosten[s] = { stufe: w, tris: anzahl(wv) };
        const soll = B[w] && B[w].nurWurf ? B[w].tris : null;
        if (w !== 3) z.befund.push(`L${s} wirft sich selbst über L${w} (${anzahl(wv)} Dreiecke je Kaskade)`);
        else if (soll != null && anzahl(wv) > soll) z.befund.push(`Stufe 3 wirft ${anzahl(wv)} > ${soll} Dreiecke`);
        if (wurfJe[w] == null) wurfJe[w] = Math.min(...SONNEN.map(([h, az]) => wurfIou(wv, werf[0], sonne(h, az))));
        z.wurf[s] = wurfJe[w];
    }
    z.sprung = { x: umrissIou(alle[1], alle[2], "x"), z: umrissIou(alle[1], alle[2], "z") };
    // das Haus-Gesetz (First auf x) gilt dem Satteldach — Kuppel, Terrassen, Flachdach tragen keinen First
    const sattelDach = ((M.H.masse || []).find((m) => m.art === "haupt") || {}).dach === "sattel";
    z.first = sattelDach ? { 2: firstAchse(alle[2]), 3: firstAchse(alle[3]) } : { 2: null, 3: null };
    z.aufbl = aufblaehung(alle[3], alle[1], M.d.baseY + 0.3, M.d.eaveY - 0.6);
    z.innen = innen(alle[3], M);
    z.tris3 = anzahl(alle[3]);
    for (const s of [0, 1, 2, 3]) entsorge(g[s]);
    return z;
}
function hausUrteil(z) {
    const f = z.befund.slice();
    for (const s of [0, 1, 2])
        if (z.wurf[s] < SOLL.wurfIou) f.push(`Wurf L${s} IoU ${f3(z.wurf[s])} < ${SOLL.wurfIou}`);
    for (const a of ["x", "z"])
        if (z.sprung[a] < SOLL.sprung) f.push(`Umriss L1↔L2 entlang ${a} ${f3(z.sprung[a])} < ${SOLL.sprung}`);
    for (const s of [2, 3]) if (z.first[s] === "z") f.push(`First der Stufe ${s} quer (längs z)`);
    if (z.aufbl == null || z.aufbl > SOLL.aufblaehung) f.push(`Aufblähung ${f3(z.aufbl)} m > ${SOLL.aufblaehung}`);
    if (!(z.innen.wand <= SOLL.wand + RASTER)) f.push(`Wand ${f3(z.innen.wand)} m (Soll ≤ ${SOLL.wand})`);
    if (!(z.innen.dach <= SOLL.dach + RASTER)) f.push(`Dach ${f3(z.innen.dach)} m über der Haut − 3 cm`);
    return f;
}

// ── Ein Ausstattungs-Fall: Wurf je gezeigter Stufe, Kosten der Stufe 3 ──
function ausFall(id, seed) {
    const B = LOD.budget.ausstattung;
    const g = { 0: FC.buildInstance(id, seed, 0), 1: FC.buildInstance(id, seed, 1) };
    if (hatStufe3("ausstattung")) g[3] = FC.buildInstance(id, seed, 3);
    const werf = {};
    for (const s in g) werf[s] = dreiecke(g[s], true);
    const z = { id, seed, wurf: {}, kosten: {}, befund: [] };
    for (const s of STUFEN_AUS.filter((x) => x !== 3)) {
        const w = B[s] ? B[s].schatten : undefined;
        if (!Number.isInteger(w) || !werf[w]) {
            z.wurf[s] = 0;
            z.befund.push(`L${s} wirft nicht (schatten ${w})`);
            continue;
        }
        const t = anzahl(werf[w]);
        z.kosten[s] = { stufe: w, tris: t };
        const soll = w === 3 ? (id === "feuerstelle" ? Math.min(32, B[3].tris) : B[3].tris) : B[s].tris;
        // die L0 wirft selbst (Plan §3.3: nah, höchstens drei im Bild, ≤ 3 400), jede andere Stufe über die Stufe 3
        if (w !== 3 && !(s === 0 && w === 0)) z.befund.push(`L${s} wirft über L${w} (${t} Dreiecke je Kaskade)`);
        else if (t > soll) z.befund.push(`Stufe 3 wirft ${t} > ${soll} Dreiecke`);
        z.wurf[s] = Math.min(...SONNEN.map(([h, az]) => wurfIou(werf[w], werf[0], sonne(h, az))));
        if (z.wurf[s] < SOLL.wurfAus) z.befund.push(`Wurf L${s} IoU ${f3(z.wurf[s])} < ${SOLL.wurfAus}`);
    }
    for (const s in g) entsorge(g[s]);
    return z;
}

// ── SELBSTTEST: der Befund vor dem Akt als gebauter Körper (die Massen-Hülle als Quader, der First auf der langen Achse:
//    alemannisch W 7 / D 8,5 → First längs z) muss in A, F und I rot werden; eine Stufe ohne Werfer in W. ──
function selbsttest() {
    const fehler = [];
    const aufgeblaeht = (id, seed) => {
        const p = FC.hausParams(FC.PRESETS[id], null);
        p.seed = seed;
        const Bm = FC.massBau(p);
        const e = Bm.ext,
            d = Bm.dims;
        const grp = new T.Group();
        const W = e.x1 - e.x0,
            D = e.z1 - e.z0;
        const wand = new T.Mesh(new T.BoxGeometry(W, d.eaveY, D), new T.MeshBasicMaterial());
        wand.position.set((e.x0 + e.x1) / 2, d.eaveY / 2, (e.z0 + e.z1) / 2);
        grp.add(wand);
        // Satteldach mit dem First längs z (die lange Achse von alemannisch)
        const xm = (e.x0 + e.x1) / 2,
            v = [
                e.x0, d.eaveY, e.z0, e.x0, d.eaveY, e.z1, xm, d.ridgeY, e.z1,
                e.x0, d.eaveY, e.z0, xm, d.ridgeY, e.z1, xm, d.ridgeY, e.z0,
                e.x1, d.eaveY, e.z1, e.x1, d.eaveY, e.z0, xm, d.ridgeY, e.z0,
                e.x1, d.eaveY, e.z1, xm, d.ridgeY, e.z0, xm, d.ridgeY, e.z1,
            ]; // prettier-ignore
        const bg = new T.BufferGeometry();
        bg.setAttribute("position", new T.Float32BufferAttribute(v, 3));
        grp.add(new T.Mesh(bg, new T.MeshBasicMaterial()));
        grp.updateMatrixWorld(true);
        return grp;
    };
    const z = hausFall("alemannisch", 1, aufgeblaeht);
    const u = hausUrteil(z);
    if (!u.some((x) => /Aufblähung/.test(x))) fehler.push("A: ein aufgeblähter Körper (Massen-Hülle) ist nicht rot");
    if (!u.some((x) => /First der Stufe 3 quer/.test(x))) fehler.push("F: ein quer gedeckter Körper ist nicht rot");
    if (!u.some((x) => /^Wand /.test(x))) fehler.push("I: eine Wand vor der Grundriss-Ebene ist nicht rot");
    // eine Stufe ohne Werfer: das Budget nimmt der L2 ihren Werfer
    const alt = LOD.budget.haus[2].schatten;
    LOD.budget.haus[2].schatten = false;
    const z2 = hausFall("holzhuette", 1);
    LOD.budget.haus[2].schatten = alt;
    if (!hausUrteil(z2).some((x) => /L2 wirft nicht/.test(x))) fehler.push("W: eine Stufe ohne Werfer ist nicht rot");
    return fehler;
}

(function main() {
    const t0 = Date.now();
    console.log("=== DIE LINSE DES HAUS-FERNKÖRPERS (gate:haus-fern) ===");
    if (!hatStufe3("haus") || !hatStufe3("ausstattung")) {
        console.log("❌ ROT — die Stufe 3 (nurWurf) ist nicht deklariert (kindStages haus " + STUFEN_HAUS + " · ausstattung " + STUFEN_AUS + ")");
        process.exit(1);
    }
    const rot = [];
    const zeilen = [];
    for (const id of KULTUREN)
        for (const s of SAMEN) {
            const z = hausFall(id, s);
            const u = hausUrteil(z);
            zeilen.push(z);
            if (u.length) rot.push(`${id}/s${s}: ${u.join(" · ")}`);
            if (ZEILEN)
                console.log(
                    `  ${id}/s${s} Wurf ${[0, 1, 2].map((x) => f3(z.wurf[x])).join("/")} · Umriss ${f3(z.sprung.x)}/${f3(z.sprung.z)} · ` +
                        `First ${z.first[2] || "—"}/${z.first[3] || "—"} · Aufbl ${f3(z.aufbl)} · Wand ${f3(z.innen.wand)} · Dach ${f3(z.innen.dach)} · S3 ${z.tris3}`
                );
        }
    const aus = [];
    for (const id of AUS)
        for (let s = 1; s <= LOD.budget.gestalten[id]; s++) {
            const z = ausFall(id, s);
            aus.push(z);
            if (z.befund.length) rot.push(`${id}/s${s}: ${z.befund.join(" · ")}`);
        }
    const wurfAlle = zeilen.flatMap((z) => [0, 1, 2].map((s) => z.wurf[s]));
    const sprungMin = zeilen.map((z) => Math.min(z.sprung.x, z.sprung.z));
    const quer = zeilen.reduce((n, z) => n + (z.first[2] === "z") + (z.first[3] === "z"), 0);
    const mWurf = median(wurfAlle);
    if (zeilen.length && !(mWurf >= SOLL.wurfMedian)) rot.push(`Wurf-IoU Median ${f3(mWurf)} < ${SOLL.wurfMedian}`);
    for (const a of ["x", "z"]) {
        const mS = median(zeilen.map((z) => z.sprung[a]));
        if (zeilen.length && !(mS >= SOLL.sprungMedian)) rot.push(`Umriss L1↔L2 entlang ${a} Median ${f3(mS)} < ${SOLL.sprungMedian}`);
    }
    const kosten3 = zeilen.map((z) => (z.kosten[2] ? z.kosten[2].tris : null));
    console.log(
        `  Häuser ${zeilen.length} (${KULTUREN.length} Kulturen × Samen ${SAMEN.join("/")}): Wurf-IoU zu L0 Median ${f3(mWurf)} · min ${f3(Math.min(...wurfAlle))} · ` +
            `Umriss L1↔L2 Median ${f3(median(sprungMin))} · min ${f3(Math.min(...sprungMin))} · First quer ${quer}/${zeilen.length * 2} · ` +
            `Aufblähung Median ${f3(median(zeilen.map((z) => z.aufbl)))} m · max ${f3(Math.max(...zeilen.map((z) => z.aufbl ?? -9)))} · ` +
            `Wand max ${f3(Math.max(...zeilen.map((z) => z.innen.wand)))} · Dach max ${f3(Math.max(...zeilen.map((z) => z.innen.dach)))} · ` +
            `Wurf-Kosten L2 Median ${median(kosten3) ?? "—"}`
    );
    console.log(
        `  Ausstattung ${aus.length}: ` +
            aus.map((z) => `${z.id}/s${z.seed} Wurf ${Object.values(z.wurf).map(f3).join("/")} (${Object.values(z.kosten).map((k) => k.tris).join("/")} Dreiecke)`).join(" · ")
    );
    const st = selbsttest();
    for (const f of st) rot.push("SELBSTTEST " + f);
    console.log(`  Selbsttest: ${st.length ? "ROT" : "der aufgeblähte, quer gedeckte Körper ist rot (A · F · I), die Stufe ohne Werfer (W)"} · ${((Date.now() - t0) / 1000).toFixed(1)} s`);
    if (rot.length) {
        console.log(`\n❌ ROT — ${rot.length} Befunde:`);
        for (const r of rot.slice(0, 80)) console.log("   " + r);
        if (rot.length > 80) console.log(`   … und ${rot.length - 80} weitere`);
        process.exit(1);
    }
    console.log("\n✅ GRÜN — jede Stufe wirft den grundriss-treuen Fernkörper, kein Sprung, kein Querfirst, der Körper liegt innen.");
})();
