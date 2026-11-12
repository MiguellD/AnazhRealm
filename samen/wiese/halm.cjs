// WEGWERF (w28-samen-wiese) — DER HALM-SPIKE: EIN Büschel (dieselben Füße, Richtungen, Längen), drei Formen.
//   heute     der Schritt-Halm des Kerns (foundry-core.js:3174–3248, ohne Ähre): K gleich lange Schritte, die Biegung fällt JE
//             SCHRITT an (dd = f^1,8 · droop; dir += bendDir · dd · 0,12; dir.y −= dd · 0,1), Breite bladeW · wMul · 0,74 · (1 − f^4)
//   mehr      dieselbe Regel mit K = 10 (die naheliegende Gegenprobe: HALM_STUFEN[1].segmente 3 → 10)
//   trieb     der Kandidat: je Fuß ein TRIEB aus schmalen Blättern — die Mittellinie ist ein Gesetz in Halm-Koordinaten
//             (Neigung θ(s) = θ0 + Θ · s², s der Bogen-Anteil; jede Stufe TASTET sie ab, keine integriert sie neu), die Fläche
//             des breiten Halms verteilt sich auf seine Blätter (Fläche und Dreiecke des Triebs = die des Halms von heute)
"use strict";
const mulberry32 = (a) => () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};
const vadd = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const vscl = (a, s) => [a[0] * s, a[1] * s, a[2] * s];
const vsub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const vlen = (a) => Math.hypot(a[0], a[1], a[2]);
const vnorm = (a) => vscl(a, 1 / (vlen(a) || 1));
const vcross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const GOLDEN = 2.399963229728653;
// Die Vorlage der Art `gras` ohne Individual-Wurf (foundry-core.js:4683, 5036–5044): slim 0,5 · api 0,5 · trop 0,2 · leaf 0,7
const P = { bladeLen: 1.72, bladeW: 0.0675, density: 0.7, clump: ((0.72 * 0.7) / 0.24) * 1.04, droop: 0.49 };
const SKALA = 0.24; // placement.scale.gras
const SPITZE = 4; // HALM_GESETZ.spitze
const farbe = (f) => {
    // Sommer: Fuß 0,6 × 0x4f7a30, Spitze 1,08 × 0x6f9a3a (linear, FARB-GESETZ) — nur für das Farb-Bild
    const lin = (h) => [(h >> 16) & 255, (h >> 8) & 255, h & 255].map((v) => Math.pow(v / 255, 2.2));
    const a = lin(0x4f7a30).map((v) => v * 0.6), b = lin(0x6f9a3a).map((v) => v * 1.08);
    return a.map((v, k) => v + (b[k] - v) * f);
};

// die Würfe des Büschels (EIN Individuum für alle Formen): Fuß, Neigung, Richtung, Länge, Breiten-Wurf, Kandidaten-Würfe
function wuerfe(seed, anteil = 0.92) {
    const rnd = mulberry32(seed);
    const rr = (a, b) => a + (b - a) * rnd();
    const N = Math.max(3, Math.round((50 + 100 * P.density) * anteil));
    const H = [];
    for (let i = 0; i < N; i++) {
        const a = i * GOLDEN, r = Math.sqrt(i / N) * P.clump;
        H.push({
            fuss: [Math.cos(a) * r, 0, Math.sin(a) * r],
            L: P.bladeLen * rr(0.6, 1.15),
            wf: rr(0.8, 1.1),
            lean: rr(0.1, 0.4),
            la: rnd() * 6.28,
            k: Array.from({ length: 24 }, () => rnd()),
        });
    }
    return H;
}
function sammler() {
    return { pos: [], idx: [], col: [], n: 0, tris: 0, flaeche: 0, halme: 0, schlank: [], winkel: [], wA: 0, breit: [], ecken: 0 };
}
// ein Band aus Zeilen [Mitte, Richtung, halbe Breite]; die letzte Zeile ist die Spitze (eine Ecke)
function band(S, zeilen, fs) {
    const v0 = S.n;
    const K = zeilen.length - 1;
    for (let s = 0; s <= K; s++) {
        const [p, dir, hw] = zeilen[s];
        const rt = vnorm(vcross(dir, [0, 1, 0]));
        const c = farbe(fs[s]);
        if (s < K) {
            const l = vadd(p, vscl(rt, -hw)), r = vadd(p, vscl(rt, hw));
            S.pos.push(l[0], l[1], l[2], r[0], r[1], r[2]);
            S.col.push(...c, ...c);
            S.n += 2;
        } else {
            S.pos.push(p[0], p[1], p[2]);
            S.col.push(...c);
            S.n += 1;
        }
    }
    for (let s = 0; s < K; s++) {
        const a0 = v0 + s * 2, b0 = a0 + 1, a1 = a0 + 2, b1 = a0 + 3;
        if (s < K - 1) S.idx.push(a0, b0, a1, b0, b1, a1), (S.tris += 2);
        else S.idx.push(a0, b0, a1), (S.tris += 1);
    }
    // Maße: Fläche (einseitig), Schlankheit Länge / größte Breite, Winkel zwischen Fuß- und Spitzen-Richtung
    let L = 0, A = 0, wMax = 0;
    for (let s = 0; s < K; s++) {
        const d = vlen(vsub(zeilen[s + 1][0], zeilen[s][0]));
        L += d;
        A += d * (zeilen[s][2] + zeilen[s + 1][2]);
        wMax = Math.max(wMax, 2 * zeilen[s][2]);
    }
    S.flaeche += A;
    S.halme++;
    S.schlank.push(L / wMax);
    S.breit.push(wMax);
    S.ecken += 2 * K + 1;
    const d0 = zeilen[0][1], d1 = vnorm(vsub(zeilen[K][0], zeilen[K - 1][0]));
    const wk = (Math.acos(Math.max(-1, Math.min(1, d0[0] * d1[0] + d0[1] * d1[1] + d0[2] * d1[2]))) * 180) / Math.PI;
    S.winkel.push(wk);
    S.wA += wk * A;
}
// DER SCHRITT-HALM (der Kern): K Schritte, die Biegung je Schritt
function schrittHalm(S, h, K, wMul) {
    const w = P.bladeW * wMul * 0.74 * h.wf;
    const bendDir = [Math.cos(h.la), 0, Math.sin(h.la)];
    let p = h.fuss.slice();
    let dir = vnorm([Math.sin(h.lean) * Math.cos(h.la), Math.cos(h.lean), Math.sin(h.lean) * Math.sin(h.la)]);
    const Z = [], F = [];
    for (let s = 0; s <= K; s++) {
        const f = s / K, dd = Math.pow(f, 1.8) * P.droop;
        if (s > 0) {
            dir = vnorm(vadd(dir, vscl(bendDir, dd * 0.12)));
            dir = vnorm(vadd(dir, [0, -dd * 0.1, 0]));
            p = vadd(p, vscl(dir, h.L / K));
        }
        Z.push([p, dir, w * (1 - Math.pow(f, SPITZE)) * 0.5]);
        F.push(f);
    }
    band(S, Z, F);
}
// DIE MITTELLINIE ALS GESETZ: θ(s) = θ0 + Θ · s² gegen die Senkrechte in der Ebene der Richtung `la`; Ort und Richtung bei s
// (fein integriert, 48 Schritte — die Stufe tastet ab)
function linie(fuss, la, th0, TH, L) {
    const n = 48, pts = [fuss.slice()], dirs = [];
    for (let i = 0; i <= n; i++) {
        const s = i / n, th = th0 + TH * s * s;
        dirs.push([Math.sin(th) * Math.cos(la), Math.cos(th), Math.sin(th) * Math.sin(la)]);
        if (i > 0) {
            const m = vnorm(vadd(dirs[i - 1], dirs[i]));
            pts.push(vadd(pts[i - 1], vscl(m, L / n)));
        }
    }
    return (s) => {
        const x = Math.min(n - 1e-9, Math.max(0, s) * n), j = Math.floor(x), t = x - j;
        return [vadd(pts[j], vscl(vsub(pts[j + 1], pts[j]), t)), vnorm(vadd(vscl(dirs[j], 1 - t), vscl(dirs[j + 1], t)))];
    };
}
// die Fläche eines Blatts der Breite 1 und Länge 1 über den Stützen `st` (Trapeze, die letzte Stütze die Spitze)
const profil = (st, wf) => {
    let a = 0;
    for (let i = 0; i + 1 < st.length; i++) a += (st[i + 1] - st[i]) * (wf(st[i]) + (i + 1 < st.length - 1 ? wf(st[i + 1]) : 0)) * 0.5;
    return a;
};
// DER TRIEB (Kandidat): je Fuß `blaetter` — jedes mit Stützen `st` (K = st.length − 1), Längen-Anteil, eigenem Bogen. Die
// Breite folgt aus der Fläche: Σ Fläche der Blätter = die Fläche des Halms von heute (K 3, wMul 3,0) an diesem Fuß.
function trieb(S, h, rezept) {
    const wHeute = P.bladeW * 3.0 * 0.74 * h.wf;
    const AHeute = wHeute * h.L * 0.7634; // __halmProfil(3, 4)
    const wf = (s) => 1 - Math.pow(s, rezept.spitze || 2.5);
    let nenner = 0;
    const B = rezept.blaetter.map((b, i) => {
        const L = h.L * (b.laenge[0] + (b.laenge[1] - b.laenge[0]) * h.k[i * 4]);
        nenner += L * profil(b.st, wf) * (b.breit || 1);
        return { b, L };
    });
    const w0 = AHeute / nenner; // die Breite des Blatts mit breit 1
    B.forEach(({ b, L }, i) => {
        // der Fächer: die Blätter eines Triebs stehen wechselständig um seine Richtung, das äußerste hängt am weitesten über
        const la = h.la + (i === 0 ? 0 : (i % 2 ? 1 : -1) * (rezept.faecher[0] + rezept.faecher[1] * h.k[i * 4 + 1]) * Math.ceil(i / 2));
        const th0 = Math.max(0.03, h.lean * (b.neigung || 1) + (h.k[i * 4 + 2] - 0.5) * 0.25);
        const TH = b.bogen[0] + (b.bogen[1] - b.bogen[0]) * Math.pow(h.k[i * 4 + 3], 1.5);
        const fuss = vadd(h.fuss, [Math.cos(la) * rezept.fuss * i, 0, Math.sin(la) * rezept.fuss * i]);
        const C = linie(fuss, la, th0, TH, L);
        const Z = b.st.map((s) => {
            const [p, d] = C(s);
            return [p, d, w0 * (b.breit || 1) * wf(s) * 0.5];
        });
        band(S, Z, b.st);
    });
}
// die Rezepte des Kandidaten (alle 5 Dreiecke je Fuß wie der Halm von heute: K 3 = 2 + 2 + 1)
const REZEPTE = {
    // fünf gerade Nadeln (je 1 Dreieck)
    nadeln: { spitze: 2.5, fuss: 0.02, faecher: [0.5, 0.9], blaetter: [0, 1, 2, 3, 4].map((i) => ({ st: [0, 1], laenge: [0.55, 1.15], bogen: [0, 0], neigung: 1 + i * 0.35 })) },
    // ein langes Blatt im Bogen (K 2 = 3 Dreiecke) + zwei junge, gerade (je 1)
    trieb3: {
        spitze: 2.5, fuss: 0.015, faecher: [0.7, 1.1],
        blaetter: [
            { st: [0, 0.62, 1], laenge: [0.95, 1.25], bogen: [0.5, 1.9], neigung: 1.0 },
            { st: [0, 1], laenge: [0.5, 0.85], bogen: [0, 0], neigung: 0.6, breit: 0.8 },
            { st: [0, 1], laenge: [0.6, 1.0], bogen: [0, 0], neigung: 1.6, breit: 0.8 },
        ],
    },
    // zwei Blätter im Bogen (K 2 + K 1 gebogen ist nicht möglich: 3 + 1 + 1) — ein Bogen-Blatt und zwei Nadeln, breiter gefächert
    bogen1: { spitze: 2.5, fuss: 0, faecher: [0, 0], blaetter: [{ st: [0, 0.5, 0.8, 1], laenge: [1, 1], bogen: [0.5, 1.9], neigung: 1.0 }] },
};

function bueschel(form, seed, opt = {}) {
    const S = sammler();
    const t0 = process.hrtime.bigint();
    const H = wuerfe(seed, opt.anteil);
    for (const h of H) {
        if (form === "heute") schrittHalm(S, h, 3, 3.0);
        else if (form === "mehr") schrittHalm(S, h, 10, 3.0);
        else if (form === "labor") schrittHalm(S, h, 10, 1.0);
        else trieb(S, h, REZEPTE[form]);
    }
    const ms = Number(process.hrtime.bigint() - t0) / 1e6;
    const med = (a) => a.slice().sort((x, y) => x - y)[a.length >> 1];
    // in Welt-Metern
    const pos = new Float32Array(S.pos.length);
    for (let i = 0; i < pos.length; i++) pos[i] = S.pos[i] * SKALA;
    return {
        position: pos, index: new Uint32Array(S.idx), color: new Float32Array(S.col),
        mass: {
            fuesse: H.length, blaetter: S.halme, dreiecke: S.tris, bauMs: ms,
            flaecheM2: S.flaeche * SKALA * SKALA,
            lai: (S.flaeche * SKALA * SKALA) / (0.72 * 0.72), // je Raster-Zelle der Wiese (understory.grassStep), Büschel-Skala 1
            breiteMm: med(S.breit) * SKALA * 1000, ecken: S.ecken,
            schlank: med(S.schlank), winkel: S.wA / S.flaeche, // der Bogen flächen-gewichtet (Grad zwischen Fuß- und Spitzen-Richtung)
        },
    };
}
module.exports = { bueschel, REZEPTE, SKALA, P };
