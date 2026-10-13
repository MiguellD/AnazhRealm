#!/usr/bin/env node
// diag-tier-anatomie.cjs — DIE ANATOMIE-LINSE DER TIERE (Welle 5, Tour 09: „der Rumpf ist ein Sack auf dünnen Beinen")
// (npm run gate:tier-anatomie). Sie misst die GEBACKENE Gestalt — denselben Bäcker, den Worker und Wirt rufen
// (foundry-core BAKERS_BY_KIND.kreatur, three r128 im node-vm wie im Foundry-Worker) — an der Haut der Ruhe-Pose,
// normiert auf den Widerrist W, gegen das SOLL des Gesetzbuchs (tetrapoda-core ANATOMIE_SOLL, die Natur-Bänder je Art):
//   widerristM · brustTiefe · aufzug · rumpf · unterarm · kopfHoehe · ohr · rute   (die Gestalt)
//   kontrast (Bauch/Rücken) · lauf (Läufe/Flanke) · spitze (Rutenspitze/Flanke)    (das Fell-Muster am Vertex)
// Rot nennt den Täter: `fox rute 0.62 < 0.7`. Dazu je Art die Dreiecke beider Stufen gegen die Budget-Zeile
// (PORTAL_RENDER_CONFIG.lod.budget.kreatur) — die Gestalt hält ihr Budget.
//   --selftest: (S1) der Rumpf 1,4× gestreckt → brustTiefe rot · (S2) das Muster einfarbig → kontrast rot ·
//   (S3) der Maßstab 1 → widerristM rot · (S4) der Hals 1,8× breit → halsBreite rot · (S5) der Kopf in den Hals
//   geschoben → kopfFrei rot · (S6) die Läufe ohne ihre Fell-Zeilen → beinUnten kahl · (S7) die Wurzel ohne
//   Deck-Mantel und Rumpf-Zeilen → rumpf kahl. Die Linse feuert, sonst ist sie vakuös.
// Dazu kopfFrei (Anteil der Kopf-Länge vor der Leib-Haut) und halsBreite (die Leib-Haut auf 60 % Schulter → Kopf).
// DIE KAHL-LINSE (Integration W5-Körper: die Anatomie-Welle ließ 28 % des Bär-Rumpfs, 87 % seiner Läufe und 34 % des
// Hirsch-Halses kahl, unbenannt): je Region (rumpf · hals · beinOben · beinUnten · rute — nach dem dominanten Bone
// der Schale) der Anteil der innersten Fell-Schale, deren Dichte unter der Wolle-Schwelle des Welt-Materials liegt
// (aSchale.y < 0,05: dort deckt keine Unterwolle — anazhRealm.js, Klasse fellSchale). Rot über KAHL_MAX.
// Der Kopf trägt keinen Mantel (das Gesetz gibt ihm EINE Zeile): ihn richtet die KOPF-ZEILE (K28) — die Karten im
// Schalen-Stapel (Zellen 0) gegen die Zeile headGroup des Gesetzes (fellStreu, so wie der Bäcker sie liest), gestreut wie
// im Lab: Zahl auf der Kappe (n · P(cos φ ≥ −0,05) ± 3,3 σ), jede Wurzel auf der Kappe, auf der gezeichneten Haut (Kopf- oder
// Leib-Haut) und nie unter der Leib-Haut, keine Strähne läuft in eine Haut, Länge, Ton des Musters an der Wurzel, die
// Gewichte der Haut dort. Rot vor K28: `wolf Kopf-Zeile 0 Strähnen gegossen`.
//   --selftest (S8) die Karten ins Raster → Zahl rot · (S9) 5 cm tiefer → Haut rot · (S10) Ton D der Zeile → Ton rot ·
//   (S11) die Strähnen der Leib-Haut 3 cm zurück → unter der Leib-Haut rot.
//   node scripts/diag-tier-anatomie.cjs [--selftest] [--json]
"use strict";
const fs = require("fs");
const vm = require("vm");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const ARTEN = ["wolf", "fox", "bear", "deer"];
const WOLLE_SCHWELLE = 0.05; // aSchale.y, ab der die inneren Schalen decken (Welt-Material fellSchale)
const KAHL_MAX = 0.02; // höchster kahler Anteil je Region
const BEIN_OBEN = new Set(["flU", "frU", "hlT", "hrT", "legFL", "legFR", "legHL", "legHR"]);
const BEIN_UNTEN = new Set(["flL", "flP", "frL", "frP", "hlC", "hlP", "hrC", "hrP"]);

// Der kahle Anteil der innersten Fell-Schale je Region (Bind-Raum der Wurzel: aWurzel, Bein-Gelenke aus dem Skelett).
function kahlAnteile(g) {
    const sk = g.userData.__skelett;
    const pos = {};
    for (const j of sk.joints) pos[j.name] = j.pos;
    const zS = pos.legFL[2],
        zH = pos.legHL[2],
        span = zS - zH;
    let schale = null;
    g.traverse((o) => {
        if (o.isMesh && o.material.userData.__klasse === "fellSchale") schale = o.geometry;
    });
    if (!schale) return { fehlt: 1 };
    const S = schale.attributes.aSchale.array,
        Wz = schale.attributes.aWurzel.array,
        SI = schale.attributes.skinIndex.array,
        SW = schale.attributes.skinWeight.array;
    let tmin = Infinity;
    for (let i = 0; i < S.length; i += 3) if (S[i + 2] !== 0) tmin = Math.min(tmin, S[i]); // die Karten (Zellen 0) tragen kein Raster
    const zahl = {},
        kahl = {};
    for (let i = 0; i < S.length / 3; i++) {
        if (S[i * 3 + 2] === 0 || Math.abs(S[i * 3] - tmin) > 1e-6) continue;
        let best = 0,
            bw = -1;
        for (let k = 0; k < 4; k++)
            if (SW[i * 4 + k] > bw) {
                bw = SW[i * 4 + k];
                best = SI[i * 4 + k];
            }
        const j = sk.skinJoints[best];
        const r =
            j === sk.root
                ? Wz[i * 3 + 2] > zS + 0.05 * span
                    ? "hals"
                    : "rumpf"
                : BEIN_OBEN.has(j)
                  ? "beinOben"
                  : BEIN_UNTEN.has(j)
                    ? "beinUnten"
                    : /^tail/.test(j)
                      ? "rute"
                      : "sonst";
        zahl[r] = (zahl[r] || 0) + 1;
        if (!(S[i * 3 + 1] >= WOLLE_SCHWELLE)) kahl[r] = (kahl[r] || 0) + 1;
    }
    const out = {};
    for (const r of Object.keys(zahl)) out[r] = (kahl[r] || 0) / zahl[r];
    return out;
}

// DIE KOPF-ZEILE (K28): die Karten im Schalen-Stapel (aSchale.z = 0 — Zellen 0, die Karte ist das Haar), je Strähne ihre
// Wurzel (aWurzel) und Spitze (die Ecken mit t = 1), gegen die Zeile des Gesetzes und die GEZEICHNETEN Häute gelegt — die
// Kopf-Haut (Kopf-Raum, das Skelett der Ruhe-Pose) UND die Leib-Haut (Root-Raum), die beim Wolf Hinterhaupt und Scheitel
// deckt: Zahl wie die Lab-Streu (die Kappe cos φ ≥ −0,05), jede Wurzel auf der Kappe (vom Zeilen-Zentrum aus), auf einer
// der beiden Häute und NIE unter der Leib-Haut (Parität dreier Strahlen), keine Strähne läuft in eine Haut, Länge l + Streu
// lj im 4-mm-Raster, der Ton das Muster an der Wurzel (tetrapoda fellFarbe mit den Gelenken der Strähne, wie jede Schale),
// die Gewichte die der Haut an der Wurzel (Kopf-Haut: 1 am Kopf-Knochen; Leib-Haut: baryzentrisch am nächsten Punkt).
// Rot vor K28: `wolf Kopf-Zeile 0 Strähnen gegossen`; rot am ersten Guss (47241157): `wolf Kopf-Zeile: 14 von 19 Wurzeln
// unter der Leib-Haut`.
const KAPPE = 0.5 + Math.asin(0.05) / Math.PI; // der Anteil der Streu-Winkel auf der Kappe (cos φ ≥ −0,05)
function kopfUrteil(sb, art, g, zeilen, P) {
    const T = sb.THREE;
    const TC = sb.__tetrapodaCore;
    const v = [];
    const row = (zeilen || []).find((z) => z.teil === "headGroup");
    if (!row || !(row.n > 0))
        return { gesetz: 0, gegossen: 0, v: [`${art} Kopf-Zeile: das Gesetz gibt dem Kopf keine Zeile`] };
    const erwartet = row.n * KAPPE,
        band = 3.3 * Math.sqrt(row.n * KAPPE * (1 - KAPPE));
    const { sk, welt } = teileDerRuhe(sb, g);
    let schale = null,
        haut = null,
        leib = null;
    g.traverse((o) => {
        if (!o.isMesh) return;
        const kl = o.material.userData.__klasse;
        if (kl === "fellSchale") schale = o.geometry;
        if (kl === "fell" && o.userData.__assetJoint === "headGroup") haut = o.geometry;
        if (
            kl === "fell" &&
            o.geometry.attributes.skinIndex &&
            (!leib || o.geometry.attributes.position.count > leib.attributes.position.count)
        )
            leib = o.geometry;
    });
    if (!schale || !haut || !leib)
        return {
            gesetz: row.n,
            gegossen: 0,
            v: [`${art} Kopf-Zeile: kein Schalen-Stapel, keine Kopf-Haut oder keine Leib-Haut`],
        };
    // eine Haut als Dreiecks-Fläche: der nächste Punkt (Abstand, Dreieck, baryzentrisch), ob ein Strahl sie vor der Weite
    // trifft, und die Zahl der Schnitte eines Strahls (ungerade: der Punkt liegt innen)
    const flaeche = (geo) => {
        const HP = geo.attributes.position.array,
            HX = geo.index.array;
        // die Dreiecke einmal je Fläche, mit Umkugel (Mitte, Radius) — der nächste Punkt überspringt, was ferner liegt
        const dreiecke = [];
        for (let q = 0; q < HX.length; q += 3) {
            const d3 = new T.Triangle(
                new T.Vector3().fromArray(HP, HX[q] * 3),
                new T.Vector3().fromArray(HP, HX[q + 1] * 3),
                new T.Vector3().fromArray(HP, HX[q + 2] * 3)
            );
            const m = d3.getMidpoint(new T.Vector3());
            dreiecke.push({ d3, q, m, r: Math.max(m.distanceTo(d3.a), m.distanceTo(d3.b), m.distanceTo(d3.c)) });
        }
        const nahPunkt = new T.Vector3(),
            treffer = new T.Vector3();
        return {
            naechst(p) {
                let best = Infinity,
                    bq = -1;
                const bary = new T.Vector3();
                for (const { d3, q, m, r } of dreiecke) {
                    if (m.distanceTo(p) - r >= best) continue;
                    const d = d3.closestPointToPoint(p, nahPunkt).distanceTo(p);
                    if (d < best) {
                        best = d;
                        bq = q;
                        d3.getBarycoord(nahPunkt, bary);
                    }
                }
                return { d: best, ecken: bq < 0 ? [] : [HX[bq], HX[bq + 1], HX[bq + 2]], bary: bary.toArray() };
            },
            trifft(o, u, weite) {
                const strahl = new T.Ray(o, u);
                for (const { d3 } of dreiecke)
                    if (strahl.intersectTriangle(d3.a, d3.b, d3.c, false, treffer) && treffer.distanceTo(o) < weite)
                        return true;
                return false;
            },
            schnitte(o, u) {
                const strahl = new T.Ray(o, u);
                let n = 0;
                for (const { d3 } of dreiecke) if (strahl.intersectTriangle(d3.a, d3.b, d3.c, false, treffer)) n++;
                return n;
            },
        };
    };
    const K = flaeche(haut),
        L = flaeche(leib);
    const innen = (p) =>
        [
            [0.123, 0.991, 0.051],
            [0.97, 0.1, 0.22],
            [-0.2, 0.3, -0.93],
        ].filter((u) => L.schnitte(p, new T.Vector3(...u).normalize()) % 2 === 1).length >= 2;
    const S = schale.attributes.aSchale.array,
        Wz = schale.attributes.aWurzel.array,
        Pa = schale.attributes.position.array,
        C = schale.attributes.color.array,
        SI = schale.attributes.skinIndex.array,
        SW = schale.attributes.skinWeight.array;
    const lSI = leib.attributes.skinIndex.array,
        lSW = leib.attributes.skinWeight.array;
    const straehnen = new Map();
    for (let i = 0; i < S.length / 3; i++) {
        if (S[i * 3 + 2] !== 0) continue;
        const key = [Wz[i * 3], Wz[i * 3 + 1], Wz[i * 3 + 2]].map((x) => x.toFixed(5)).join(",");
        let s = straehnen.get(key);
        if (!s)
            straehnen.set(key, (s = { w: [Wz[i * 3], Wz[i * 3 + 1], Wz[i * 3 + 2]], sp: [0, 0, 0], n: 0, ecken: [] }));
        s.ecken.push(i);
        if (S[i * 3] > 0.999) {
            s.sp[0] += Pa[i * 3];
            s.sp[1] += Pa[i * 3 + 1];
            s.sp[2] += Pa[i * 3 + 2];
            s.n++;
        }
    }
    const gewichte = (i) => {
        const m = new Map();
        for (let k = 0; k < 4; k++) if (SW[i * 4 + k] > 0) m.set(sk.skinJoints[SI[i * 4 + k]], SW[i * 4 + k]);
        return m;
    };
    const gleich = (a, b) => a.size === b.size && [...a].every(([nm, w]) => Math.abs((b.get(nm) || 0) - w) <= 1e-3);
    const lin = (c) => (c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
    const Mk = new T.Matrix4().copy(welt(sk.root)).invert().multiply(welt("headGroup"));
    const MkI = new T.Matrix4().copy(Mk).invert();
    const sK = Mk.getMaxScaleOnAxis();
    const lj = row.lj != null ? row.lj : 0.015;
    let neben = 0,
        laenge = 0,
        abseits = 0,
        unter = 0,
        liegt = 0,
        tonFalsch = 0,
        lose = 0;
    for (const s of straehnen.values()) {
        const wR = new T.Vector3(...s.w),
            spR = new T.Vector3(s.sp[0] / s.n, s.sp[1] / s.n, s.sp[2] / s.n);
        const w = wR.clone().applyMatrix4(MkI),
            sp = spR.clone().applyMatrix4(MkI);
        const ax = sp.clone().sub(w);
        const l = ax.length();
        ax.normalize();
        const axR = spR.clone().sub(wR);
        const lR = axR.length();
        axR.normalize();
        const q = [
            (w.x - row.c[0]) / (row.r * row.sc[0]),
            (w.y - row.c[1]) / (row.r * row.sc[1]),
            (w.z - row.c[2]) / (row.r * row.sc[2]),
        ];
        if (!(q[1] / Math.hypot(...q) >= -0.05 - 2e-3)) neben++;
        // die Haut der Wurzel: die nähere der Kopf-Haut (Kopf-Raum, × die Skala des Kopfs) und der Leib-Haut (Root-Raum)
        const dK = K.naechst(w).d * sK;
        const nL = L.naechst(wR);
        const aufLeib = nL.d < dK;
        if (!(Math.min(dK, nL.d) <= 1e-3)) abseits++;
        if (innen(wR.clone().addScaledVector(axR, 2e-4))) unter++;
        if (
            K.trifft(w.clone().addScaledVector(ax, 2e-4), ax, l) ||
            L.trifft(wR.clone().addScaledVector(axR, 2e-4), axR, lR)
        )
            liegt++;
        if (!(l >= row.l - 0.0021 && l <= row.l + lj + 0.0021)) laenge++;
        // die Gewichte der Haut an der Wurzel, und der Ton des Musters mit ihnen
        let soll = new Map([["headGroup", 1]]);
        if (aufLeib) {
            const m = new Map();
            nL.ecken.forEach((e, k) => {
                for (let j = 0; j < 4; j++) {
                    const ww = nL.bary[k] * lSW[e * 4 + j];
                    if (ww > 0) m.set(lSI[e * 4 + j], (m.get(lSI[e * 4 + j]) || 0) + ww);
                }
            });
            const vier = [...m].sort((x, y) => y[1] - x[1] || x[0] - y[0]).slice(0, 4);
            const ganz = vier.reduce((a, x) => a + x[1], 0);
            soll = new Map(vier.map(([j, ww]) => [sk.skinJoints[j], ww / ganz]));
        }
        const ist = gewichte(s.ecken[0]);
        let r = 0,
            gg = 0,
            b = 0,
            sw = 0;
        for (const [nm, ww] of ist) {
            const f = TC.fellFarbe(P, sk.masse, wR.x, wR.y, wR.z, nm);
            r += ww * f[0];
            gg += ww * f[1];
            b += ww * f[2];
            sw += ww;
        }
        const ton = [lin(r / sw / 255), lin(gg / sw / 255), lin(b / sw / 255)];
        for (const i of s.ecken) {
            if (!gleich(gewichte(i), soll)) lose++;
            if (
                Math.abs(C[i * 3] - ton[0]) + Math.abs(C[i * 3 + 1] - ton[1]) + Math.abs(C[i * 3 + 2] - ton[2]) >
                1e-4
            )
                tonFalsch++;
        }
    }
    const n = straehnen.size;
    if (!(Math.abs(n - erwartet) <= band))
        v.push(
            `${art} Kopf-Zeile ${n} Strähnen gegossen — das Gesetz streut ${row.n}, auf der Kappe ${erwartet.toFixed(1)} ± ${band.toFixed(1)}`
        );
    if (neben) v.push(`${art} Kopf-Zeile: ${neben} von ${n} Wurzeln neben der Kappe des Gesetzes`);
    if (abseits) v.push(`${art} Kopf-Zeile: ${abseits} von ${n} Wurzeln auf keiner Haut`);
    if (unter) v.push(`${art} Kopf-Zeile: ${unter} von ${n} Wurzeln unter der Leib-Haut`);
    if (liegt) v.push(`${art} Kopf-Zeile: ${liegt} von ${n} Strähnen laufen in eine Haut`);
    if (laenge)
        v.push(`${art} Kopf-Zeile: ${laenge} von ${n} Längen außerhalb ${row.l.toFixed(3)}…${(row.l + lj).toFixed(3)}`);
    if (n && tonFalsch) v.push(`${art} Kopf-Zeile: ${tonFalsch} Ecken nicht im Ton des Musters an ihrer Wurzel`);
    if (lose) v.push(`${art} Kopf-Zeile: ${lose} Ecken nicht mit den Gewichten der Haut an ihrer Wurzel`);
    return { gesetz: row.n, gegossen: n, v };
}

function ladeWelt() {
    const sb = { console, Math, performance: { now: () => Date.now() }, setTimeout, clearTimeout };
    sb.self = sb;
    sb.globalThis = sb;
    sb.window = sb;
    vm.createContext(sb);
    for (const f of [
        "worlds/terrain/lib/three-r128.min.js",
        "phyto-core.js",
        "koerper-core.js",
        "tetrapoda-core.js",
        "foundry-core.js",
    ])
        vm.runInContext(fs.readFileSync(path.join(ROOT, f), "utf8"), sb, { filename: f });
    // Die Zeilen, die der Bäcker vom Gesetz liest (je Guss die letzten) — die Kopf-Zeile richtet gegen sie.
    const TC = sb.__tetrapodaCore;
    const streu = TC.fellStreu;
    TC.fellStreu = function () {
        sb.__fellP = arguments[0];
        sb.__fellZeilen = streu.apply(this, arguments);
        return sb.__fellZeilen;
    };
    return sb;
}

// Die gebackene Gruppe → Teile in der Ruhe-Pose (Gelenk-Welt aus dem __skelett-Beipack).
function teileDerRuhe(sb, g) {
    const T = sb.THREE;
    const sk = g.userData.__skelett;
    const by = {};
    for (const j of sk.joints) by[j.name] = j;
    const memo = {};
    const welt = (n) => {
        if (memo[n]) return memo[n];
        const j = by[n];
        const m = new T.Matrix4().compose(
            new T.Vector3(...j.pos),
            new T.Quaternion(...j.quat),
            new T.Vector3(...j.scale)
        );
        memo[n] = j.parent && by[j.parent] ? new T.Matrix4().multiplyMatrices(welt(j.parent), m) : m;
        return memo[n];
    };
    const teile = [];
    const v = new T.Vector3();
    g.traverse((m) => {
        if (!m.isMesh) return;
        const geo = m.geometry;
        const pa = geo.attributes.position;
        const jn = m.userData.__assetJoint || sk.root;
        const MW = welt(jn);
        const P = new Float32Array(pa.count * 3);
        for (let i = 0; i < pa.count; i++) {
            v.fromBufferAttribute(pa, i).applyMatrix4(MW);
            P[i * 3] = v.x;
            P[i * 3 + 1] = v.y;
            P[i * 3 + 2] = v.z;
        }
        teile.push({
            kl: m.material.userData.__klasse,
            joint: jn,
            P,
            n: geo.index ? geo.index.count / 3 : pa.count / 3,
            C: geo.attributes.color ? geo.attributes.color.array : null,
            SI: geo.attributes.skinIndex ? geo.attributes.skinIndex.array : null,
            SW: geo.attributes.skinWeight ? geo.attributes.skinWeight.array : null,
        });
    });
    const lage = (n) => new T.Vector3().setFromMatrixPosition(welt(n));
    return { teile, sk, lage, welt };
}

const sRGB = (l) => (l <= 0.0031308 ? 12.92 * l : 1.055 * Math.pow(l, 1 / 2.4) - 0.055) * 255;
const lum = (c) => 0.2126 * sRGB(c[0]) + 0.7152 * sRGB(c[1]) + 0.0722 * sRGB(c[2]);

function messe(sb, g) {
    const { teile, sk, lage } = teileDerRuhe(sb, g);
    const zS = lage("legFL").z,
        zH = lage("legHL").z,
        xS = Math.abs(lage("legFL").x),
        span = zS - zH;
    let haut = null;
    for (const t of teile) if (t.kl === "fell" && t.SI && (!haut || t.n > haut.n)) haut = t;
    if (!haut) throw new Error("keine geskinnte Haut");
    let minY = Infinity;
    for (const t of teile)
        if (t.kl !== "fellSchale") for (let i = 1; i < t.P.length; i += 3) minY = Math.min(minY, t.P[i]);
    const P = haut.P,
        nV = P.length / 3;
    const dominant = (i) => {
        let best = -1,
            bw = -1;
        for (let k = 0; k < 4; k++)
            if (haut.SW[i * 4 + k] > bw) {
                bw = haut.SW[i * 4 + k];
                best = haut.SI[i * 4 + k];
            }
        return sk.skinJoints[best];
    };
    // Ober-/Unterlinie im Mittelstreifen
    const NB = 40,
        z0 = zH - 0.4 * span,
        z1 = zS + 0.3 * span;
    const top = new Array(NB).fill(-Infinity),
        bot = new Array(NB).fill(Infinity);
    for (let i = 0; i < nV; i++) {
        const x = P[i * 3],
            y = P[i * 3 + 1] - minY,
            z = P[i * 3 + 2];
        if (z < z0 || z > z1 || Math.abs(x) >= 0.25 * xS) continue;
        const b = Math.min(NB - 1, Math.floor(((z - z0) / (z1 - z0)) * NB));
        top[b] = Math.max(top[b], y);
        bot[b] = Math.min(bot[b], y);
    }
    const zb = (b) => z0 + ((b + 0.5) / NB) * (z1 - z0);
    let W = 0,
        brust = Infinity,
        aufzug = -Infinity;
    for (let b = 0; b < NB; b++) {
        if (zb(b) > zS - 0.35 * span && zb(b) < zS - 0.02 * span) W = Math.max(W, top[b]);
        if (zb(b) > zS - 0.35 * span && zb(b) < zS + 0.05 * span) brust = Math.min(brust, bot[b]);
        if (zb(b) > zH + 0.1 * span && zb(b) < (zS + zH) / 2) aufzug = Math.max(aufzug, bot[b]);
    }
    // Rumpf-Länge: Haut-Punkte der Wurzel im Band 0,55–0,78 W
    let za = Infinity,
        ze = -Infinity;
    for (let i = 0; i < nV; i++) {
        const y = P[i * 3 + 1] - minY;
        if (y > 0.55 * W && y < 0.78 * W && dominant(i) === sk.root) {
            za = Math.min(za, P[i * 3 + 2]);
            ze = Math.max(ze, P[i * 3 + 2]);
        }
    }
    // Unterarm: Tiefe des rechten Vorderlaufs bei 0,3 W
    let ua = Infinity,
        ue = -Infinity;
    for (let i = 0; i < nV; i++) {
        const x = P[i * 3],
            y = P[i * 3 + 1] - minY,
            z = P[i * 3 + 2];
        if (x > 0 && Math.abs(y - 0.3 * W) < 0.015 * W && Math.abs(z - zS) < 0.4 * span) {
            ua = Math.min(ua, z);
            ue = Math.max(ue, z);
        }
    }
    let kopf = -Infinity,
        o0 = Infinity,
        o1 = -Infinity;
    for (const t of teile) {
        if (t.joint === "headGroup" && t.kl === "fell")
            for (let i = 1; i < t.P.length; i += 3) kopf = Math.max(kopf, t.P[i] - minY);
        if (t.joint === "earL")
            for (let i = 1; i < t.P.length; i += 3) {
                o0 = Math.min(o0, t.P[i]);
                o1 = Math.max(o1, t.P[i]);
            }
    }
    const tn = sk.tailSegs || [];
    const rute = tn.length ? lage("tailRoot").distanceTo(lage(tn[tn.length - 1])) : 0;
    // DER KOPF VOR DEM HALS: wie viel der Kopf-Länge (die starren Kopf-Häute) ragt vor die Leib-Haut in seiner
    // Höhe? (der Bär mit dem Brustkorb-dicken Hals trug den Kopf IN sich: nur die Nase sah heraus)
    let hz0 = Infinity,
        hz1 = -Infinity,
        hy0 = Infinity,
        hy1 = -Infinity;
    for (const t of teile)
        if ((t.joint === "headGroup" || t.joint === "jawGroup") && t.kl === "fell")
            for (let i = 0; i < t.P.length; i += 3) {
                hz0 = Math.min(hz0, t.P[i + 2]);
                hz1 = Math.max(hz1, t.P[i + 2]);
                hy0 = Math.min(hy0, t.P[i + 1]);
                hy1 = Math.max(hy1, t.P[i + 1]);
            }
    let leibVorn = -Infinity;
    for (let i = 0; i < nV; i++) {
        const y = P[i * 3 + 1];
        if (y >= hy0 && y <= hy1) leibVorn = Math.max(leibVorn, P[i * 3 + 2]);
    }
    const kopfFrei = (hz1 - Math.max(hz0, leibVorn)) / Math.max(1e-6, hz1 - hz0);
    // DER HALS: die Breite der Leib-Haut auf 60 % des Wegs vom Schulter-Gelenk zum Kopf (eine Scheibe ±0,04 W)
    const pS = lage("legFL"),
        pK = lage("headGroup");
    pS.x = 0;
    const pN = pS.clone().lerp(pK, 0.6);
    let hx0 = Infinity,
        hx1 = -Infinity;
    for (let i = 0; i < nV; i++) {
        if (Math.abs(P[i * 3 + 2] - pN.z) > 0.04 * W || Math.abs(P[i * 3 + 1] - pN.y) > 0.15 * W) continue;
        hx0 = Math.min(hx0, P[i * 3]);
        hx1 = Math.max(hx1, P[i * 3]);
    }
    // DAS MUSTER: mittlere Farbe je Region der Haut (der Vertex trägt sie — die Welt liest nur ihn)
    const region = {
        ruecken: [0, 0, 0, 0],
        bauch: [0, 0, 0, 0],
        flanke: [0, 0, 0, 0],
        lauf: [0, 0, 0, 0],
        spitze: [0, 0, 0, 0],
    };
    const add = (r, i) => {
        region[r][0] += haut.C[i * 3];
        region[r][1] += haut.C[i * 3 + 1];
        region[r][2] += haut.C[i * 3 + 2];
        region[r][3]++;
    };
    const unten = new Set(["flL", "flP", "frL", "frP", "hlC", "hlP", "hrC", "hrP"]);
    const letzte = tn[tn.length - 1];
    if (haut.C)
        for (let i = 0; i < nV; i++) {
            const y = P[i * 3 + 1] - minY,
                z = P[i * 3 + 2];
            const d = dominant(i);
            if (unten.has(d)) {
                if (y < 0.3 * W) add("lauf", i);
                continue;
            }
            if (d === letzte) {
                add("spitze", i);
                continue;
            }
            if (d !== sk.root || z < zH || z > zS) continue;
            const b = Math.min(NB - 1, Math.max(0, Math.floor(((z - z0) / (z1 - z0)) * NB)));
            const v = (y - bot[b]) / Math.max(1e-6, top[b] - bot[b]);
            if (v > 0.85) add("ruecken", i);
            else if (v < 0.15) add("bauch", i);
            else if (v > 0.35 && v < 0.6) add("flanke", i);
        }
    const L = {};
    for (const [k, s] of Object.entries(region)) L[k] = s[3] ? lum([s[0] / s[3], s[1] / s[3], s[2] / s[3]]) : NaN;
    let tris = 0;
    for (const t of teile) tris += t.n;
    return {
        W,
        brustTiefe: (W - brust) / W,
        aufzug: aufzug / W,
        rumpf: (ze - za) / W,
        unterarm: (ue - ua) / W,
        kopfHoehe: kopf / W,
        ohr: (o1 - o0) / W,
        rute: rute / W,
        kopfFrei,
        halsBreite: (hx1 - hx0) / W,
        kontrast: L.bauch / L.ruecken,
        lauf: L.lauf / L.flanke,
        spitze: L.spitze / L.flanke,
        tris,
    };
}

function urteile(sb, art, m, M) {
    const S = sb.__tetrapodaCore.ANATOMIE_SOLL[art];
    const roh = Object.assign({}, m, { widerristM: m.W * M });
    const v = [];
    for (const [k, band] of Object.entries(S)) {
        const x = roh[k];
        if (!Number.isFinite(x)) v.push(`${art} ${k} nicht messbar`);
        else if (x < band[0]) v.push(`${art} ${k} ${x.toFixed(3)} < ${band[0]}`);
        else if (x > band[1]) v.push(`${art} ${k} ${x.toFixed(3)} > ${band[1]}`);
    }
    return { roh, v };
}

function lauf(sb, opts) {
    const TC = sb.__tetrapodaCore;
    const M = opts && opts.massstab != null ? opts.massstab : TC.MASSSTAB.meterJeEinheit;
    const budget = TC.PORTAL_RENDER_CONFIG.lod.budget.kreatur;
    const ergebnis = {};
    const fehler = [];
    for (const art of ARTEN) {
        sb.__fellZeilen = null;
        const g = sb.BAKERS_BY_KIND.kreatur(TC, art, 0, 0, null);
        const zeilen = sb.__fellZeilen;
        if (opts && opts.verzerre) opts.verzerre(sb, g);
        const m = messe(sb, g);
        const u = urteile(sb, art, m, M);
        m.kahl = kahlAnteile(g);
        for (const [r, x] of Object.entries(m.kahl))
            if (!(x <= KAHL_MAX)) u.v.push(`${art} kahl ${r} ${x.toFixed(3)} > ${KAHL_MAX}`);
        u.roh.kahl = m.kahl;
        const kz = kopfUrteil(sb, art, g, zeilen, sb.__fellP);
        u.v.push(...kz.v);
        u.roh.kopfZeile = [kz.gegossen, kz.gesetz];
        // die zweite Stufe (die gelenkige Grobstufe) gegen ihre Budget-Zeile
        const g1 = sb.BAKERS_BY_KIND.kreatur(TC, art, 0, 1, null);
        let t1 = 0;
        g1.traverse((o) => {
            if (o.isMesh)
                t1 += o.geometry.index ? o.geometry.index.count / 3 : o.geometry.attributes.position.count / 3;
        });
        if (m.tris > budget[0].tris) u.v.push(`${art} L0 ${m.tris} Dreiecke > ${budget[0].tris}`);
        if (t1 > budget[1].tris) u.v.push(`${art} L1 ${t1} Dreiecke > ${budget[1].tris}`);
        u.roh.trisL1 = t1;
        ergebnis[art] = u.roh;
        fehler.push(...u.v);
    }
    return { ergebnis, fehler };
}

function zeige(ergebnis) {
    const r3 = (x) => (Number.isFinite(x) ? x.toFixed(3) : String(x));
    for (const [art, m] of Object.entries(ergebnis)) {
        const kahl = Object.entries(m.kahl)
            .map(([r, x]) => `${r} ${r3(x)}`)
            .join(" ");
        console.log(
            `  ${art.padEnd(5)} W ${m.widerristM.toFixed(2)} m · Brust ${r3(m.brustTiefe)} · Aufzug ${r3(m.aufzug)} · Rumpf ${r3(m.rumpf)} · Unterarm ${r3(m.unterarm)} · Kopf ${r3(m.kopfHoehe)} · Ohr ${r3(m.ohr)} · Rute ${r3(m.rute)} · Kopf frei ${r3(m.kopfFrei)} · Hals ${r3(m.halsBreite)} · Kontrast ${r3(m.kontrast)} · Lauf ${r3(m.lauf)} · Spitze ${r3(m.spitze)} · L0 ${m.tris} / L1 ${m.trisL1} Dreiecke · kahl ${kahl} · Kopf-Zeile ${m.kopfZeile[0]} Strähnen (Gesetz ${m.kopfZeile[1]})`
        );
    }
}

if (process.argv.includes("--selftest")) {
    console.log("=== SELBST-TEST: die Anatomie-Linse feuert ===");
    let rot = 0;
    const pruefe = (name, fehler, muster) => {
        const ok = fehler.some((f) => muster.test(f));
        console.log(`  ${ok ? "✅" : "❌"} ${name}${ok ? " — " + fehler.find((f) => muster.test(f)) : ""}`);
        if (!ok) rot++;
    };
    // S1: der Rumpf (Wurzel-Haut) 1,4× in die Tiefe gestreckt — der Sack kehrt zurück
    {
        const sb = ladeWelt();
        const r = lauf(sb, {
            verzerre: (sb2, g) =>
                g.traverse((o) => {
                    if (!o.isMesh || !o.geometry.attributes.skinIndex || o.userData.__assetJoint !== "wolf") return;
                    const pa = o.geometry.attributes.position;
                    for (let i = 0; i < pa.count; i++) {
                        const y = pa.getY(i);
                        if (y > 0.45 * 2.4) pa.setY(i, 0.45 * 2.4 + (y - 0.45 * 2.4) * 1.0);
                        else pa.setY(i, 0.45 * 2.4 - (0.45 * 2.4 - y) * 1.4);
                    }
                }),
        });
        pruefe("S1 der gestreckte Rumpf wird erkannt", r.fehler, /brustTiefe/);
    }
    // S2: das Muster einfarbig (fellFarbe = Grund) — der Fuchs ohne Strümpfe, der Wolf ohne Sattel
    {
        const sb = ladeWelt();
        const TC = sb.__tetrapodaCore;
        const alt = TC.fellFarbe;
        TC.fellFarbe = (P) => TC.artGestalt(P).muster.basis.slice();
        const r = lauf(sb);
        TC.fellFarbe = alt;
        pruefe("S2 das einfarbige Fell wird erkannt", r.fehler, /kontrast/);
    }
    // S3: der Maßstab 1 (Lab-Einheit = Meter — der Wolf stand 2,5 m hoch)
    {
        const sb = ladeWelt();
        const r = lauf(sb, { massstab: 1 });
        pruefe("S3 der Riesen-Wolf (Maßstab 1) wird erkannt", r.fehler, /wolf widerristM/);
    }
    // S4: der Hals 1,8× breit (die Kapuze kehrt zurück) — die Leib-Haut vor den Schultern seitlich gedehnt
    // S5: der Kopf um die halbe Länge in den Hals geschoben (der Bär vor dieser Welle)
    {
        const sb = ladeWelt();
        const r = lauf(sb, {
            verzerre: (sb2, g) =>
                g.traverse((o) => {
                    if (!o.isMesh) return;
                    const pa = o.geometry.attributes.position;
                    if (o.geometry.attributes.skinIndex && o.userData.__assetJoint === "wolf") {
                        let zMax = -Infinity;
                        for (let i = 0; i < pa.count; i++) zMax = Math.max(zMax, pa.getZ(i));
                        for (let i = 0; i < pa.count; i++)
                            if (pa.getZ(i) > zMax - 0.25 * 2.4) pa.setX(i, pa.getX(i) * 1.8);
                    }
                    if (o.userData.__assetJoint === "headGroup" || o.userData.__assetJoint === "jawGroup") {
                        let z0 = Infinity,
                            z1 = -Infinity;
                        for (let i = 0; i < pa.count; i++) {
                            z0 = Math.min(z0, pa.getZ(i));
                            z1 = Math.max(z1, pa.getZ(i));
                        }
                        for (let i = 0; i < pa.count; i++) pa.setZ(i, pa.getZ(i) - 0.6 * (z1 - z0));
                    }
                }),
        });
        pruefe("S4 der Kapuzen-Hals wird erkannt", r.fehler, /wolf halsBreite/);
        pruefe("S5 der Kopf im Hals wird erkannt", r.fehler, /wolf kopfFrei/);
    }
    // S6: die Läufe ohne ihre Fell-Zeilen (Unterarm, Unterschenkel, Mittelfuß) — ihre Haut trägt keine Strähne
    // S7: die Wurzel ohne Deck-Mantel und Rumpf-Zeilen — der Rumpf trägt keine Strähne
    for (const [name, weg, muster] of [
        [
            "S6 die kahlen Läufe werden erkannt",
            (row) => /^(fl|fr)[LP]$|^(hl|hr)[CP]$/.test(row.teil || ""),
            /wolf kahl beinUnten/,
        ],
        ["S7 der kahle Rumpf wird erkannt", (row) => row.art === "deck" || row.teil === "wolf", /wolf kahl rumpf/],
    ]) {
        const sb = ladeWelt();
        const TC = sb.__tetrapodaCore;
        const alt = TC.fellStreu;
        TC.fellStreu = (P, M, O) => alt(P, M, O).filter((row) => !weg(row));
        const r = lauf(sb);
        TC.fellStreu = alt;
        pruefe(name, r.fehler, muster);
    }
    // S8: die Karten fallen ins Raster (Zellen 1 — der Stand vor K28: die Zeile fiel still) · S9: die Karten 5 cm tiefer
    // (auf keiner Haut) · S10: die Karten im Ton D der Zeile statt im Muster an ihrer Wurzel (der erste Guss 47241157) ·
    // S11: die Strähnen der Leib-Haut 3 cm zurück zum Kopf (unter den Hals-Mantel — der erste Guss: 14 von 19). Ein Guss des
    // Wolfs L0, die Linse am Ausgang.
    {
        const sb = ladeWelt();
        const TC = sb.__tetrapodaCore;
        const karten = (schale, tu) => {
            const S = schale.attributes.aSchale.array;
            for (let i = 0; i < S.length / 3; i++) if (S[i * 3 + 2] === 0) tu(i, schale.attributes);
        };
        for (const [name, eingriff, muster] of [
            [
                "S8 die fehlende Kopf-Zeile wird erkannt",
                (schale) => karten(schale, (i, A) => (A.aSchale.array[i * 3 + 2] = 1)),
                /wolf Kopf-Zeile 0 Strähnen gegossen/,
            ],
            [
                "S9 die Kopf-Zeile neben der Haut wird erkannt",
                (schale) =>
                    karten(schale, (i, A) => {
                        A.position.array[i * 3 + 1] -= 0.05;
                        A.aWurzel.array[i * 3 + 1] -= 0.05;
                    }),
                /wolf Kopf-Zeile: \d+ von \d+ Wurzeln auf keiner Haut/,
            ],
            [
                "S10 die Kopf-Zeile im Ton der Zeile wird erkannt",
                (schale, sb2) =>
                    karten(schale, (i, A) => {
                        const hx = sb2.__fellP.cD;
                        const lin = (c) => (c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
                        A.color.array.set(
                            [lin(((hx >> 16) & 255) / 255), lin(((hx >> 8) & 255) / 255), lin((hx & 255) / 255)],
                            i * 3
                        );
                    }),
                /wolf Kopf-Zeile: \d+ Ecken nicht im Ton des Musters an ihrer Wurzel/,
            ],
            [
                "S11 die Kopf-Zeile unter dem Hals-Mantel wird erkannt",
                (schale, sb2, g) => {
                    const { sk, lage } = teileDerRuhe(sb2, g);
                    const jK = sk.skinJoints.indexOf("headGroup");
                    const hc = lage("headGroup");
                    karten(schale, (i, A) => {
                        if (A.skinIndex.array[i * 4] === jK && A.skinWeight.array[i * 4] === 1) return;
                        const w = new sb2.THREE.Vector3().fromArray(A.aWurzel.array, i * 3);
                        const d = hc.clone().sub(w).normalize().multiplyScalar(0.03);
                        for (const arr of [A.position.array, A.aWurzel.array]) {
                            arr[i * 3] += d.x;
                            arr[i * 3 + 1] += d.y;
                            arr[i * 3 + 2] += d.z;
                        }
                    });
                },
                /wolf Kopf-Zeile: \d+ von \d+ Wurzeln unter der Leib-Haut/,
            ],
        ]) {
            sb.__fellZeilen = null;
            const g = sb.BAKERS_BY_KIND.kreatur(TC, "wolf", 0, 0, null);
            const zeilen = sb.__fellZeilen,
                P = sb.__fellP;
            g.traverse((o) => {
                if (o.isMesh && o.material.userData.__klasse === "fellSchale") eingriff(o.geometry, sb, g);
            });
            pruefe(name, kopfUrteil(sb, "wolf", g, zeilen, P).v, muster);
        }
    }
    if (rot) {
        console.error(`\n❌ SELBST-TEST ROT — ${rot} Linse(n) vakuös.`);
        process.exit(1);
    }
    console.log("\n✅ SELBST-TEST GRÜN.");
    process.exit(0);
}

console.log("=== DIE ANATOMIE-LINSE: die gebackene Gestalt gegen das Soll der Art (tetrapoda ANATOMIE_SOLL) ===");
const sb = ladeWelt();
const { ergebnis, fehler } = lauf(sb);
zeige(ergebnis);
if (process.argv.includes("--json")) console.log(JSON.stringify(ergebnis, null, 1));
if (fehler.length) {
    console.error(`\n❌ ROT — ${fehler.length} Abweichung(en):\n  ` + fehler.join("\n  "));
    process.exit(1);
}
console.log("\n✅ GRÜN — jede Art steht in ihren Natur-Bändern (Gestalt + Fell-Muster) und hält ihr Budget.");
process.exit(0);
