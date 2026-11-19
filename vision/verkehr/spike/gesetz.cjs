"use strict";
// gesetz.cjs — DAS GESETZ DES VERKEHRS als reine Funktion (vision/verkehr/gesetz.md, Sätze 1–5), Spike-Prototyp.
// Liest die ECHTEN Kerne des Hauptzweigs (ANAZH_MAIN, Vorgabe /home/user/AnazhRealm): fachwerk-core (`viertelWort`,
// `kachelNetz`, `kachelMassen`), koerper-core (`TAGES_GESETZ`). Kein Zustand der Stadt: jeder Wert ist eine Funktion von
// (Same, nH, Adresse, Uhr); die Maps unten sind verwerfbare Merker am Schirm (ihre Größe misst der Spike).
// Rechnung nur mit + − × / und Math.sqrt (IEEE-exakt in jeder Engine) — kein exp/log/sin/atan im Gesetz.
const path = require("path");
const fs = require("fs");
const MAIN = process.env.ANAZH_MAIN || "/home/user/AnazhRealm";
for (const f of ["fachwerk-core.js", "koerper-core.js"]) {
    const p = path.join(MAIN, f);
    if (!fs.existsSync(p)) throw new Error("Kern fehlt: " + p + " (ANAZH_MAIN auf einen Klon von main setzen)");
    require(p);
}
const FC = globalThis.__fachwerkCore, KC = globalThis.__koerperCore;
if (!FC || !FC.kachelNetz || !FC.viertelWort || !FC.kachelMassen) throw new Error("fachwerk-core ohne Kachel-Funktion");
if (!KC || !KC.TAGES_GESETZ) throw new Error("koerper-core ohne TAGES_GESETZ");

const TG = KC.TAGES_GESETZ;
// die Gesetz-Parameter (gesetz.md, Tafel der Größen)
const GV = {
    mu: 0.5, // Motorisierung: Anteil der Haushalte mit Wagen, Person 0 pendelt
    ellM: 1000, // Reichweite der Gravitation
    rMaxK: 8, // Radius der Ziele in Kacheln (2 048 m)
    vHaupt: 13.9, // freie Fahrt gen 0 (50 km/h)
    vGasse: 8.3, // freie Fahrt gen 1 (30 km/h)
    eckR: 6, // jeder Knick ≥ 2° einer Linie wird ein Bogen, dessen innere Spur R = 6 m fährt (die engste Kurve)
    aQuer: 2.5, // Querbeschleunigung in Kurven → vEin = √(aQuer · eckR) = 3,87 m/s
    aAn: 1.5, // Anfahren
    aAb: 2.0, // Bremsen
    parkM: 2.15, // Parkstreifen der Hausseite: Rand der Gasse (1,95) + Saum (1,2) − halbe Wagenbreite (0,905) − 0,1
    rampeM: 6, // auf diesem Bogen führt der Versatz von der Spur zum Parkstreifen (Tür)
    refS: 90, // Bezugszeit der Gasse am Werk: die Uhr ist am Tor der Werk-Kachel um W − refS
    werk: TG.werk, // [8, 17] h, koerper-core
    streuH: TG.streuH, // 0,5 h, koerper-core
};
GV.vEin = Math.sqrt(GV.aQuer * GV.eckR);
const M = 256; // SIEDLUNG.cellM (fwc:3662) — die Kachel
const N = 5; // STADT_NETZ.tore (fwc:3819)

// der Hash des Gesetzes (fmix32 über die Argumente, Math.imul: in jeder Engine gleich)
function hash() {
    let h = 0x9e3779b9;
    for (let q = 0; q < arguments.length; q++) {
        h = (h ^ (arguments[q] | 0)) >>> 0;
        h ^= h >>> 16;
        h = Math.imul(h, 0x85ebca6b) >>> 0;
        h ^= h >>> 13;
        h = Math.imul(h, 0xc2b2ae35) >>> 0;
        h ^= h >>> 16;
    }
    return h >>> 0;
}
const u01 = (h) => h / 4294967296;
const key = (i, k) => (i + 4096) * 8192 + (k + 4096);
const ki = (K) => Math.floor(K / 8192) - 4096;
const kk = (K) => (K % 8192) - 4096;

// ── Die Polylinie: Punkte (x, z) Welt, kumulierte Länge, je Punkt die Spur (w/4 der Straße, auf der er liegt) ──
function linie(xs, zs, spur) {
    const n = xs.length, s = new Float64Array(n);
    for (let q = 1; q < n; q++) {
        const dx = xs[q] - xs[q - 1], dz = zs[q] - zs[q - 1];
        s[q] = s[q - 1] + Math.sqrt(dx * dx + dz * dz);
    }
    return { x: Float64Array.from(xs), z: Float64Array.from(zs), sp: Float64Array.from(spur), s, L: s[n - 1] };
}
// DIE ECKE: jeder innere Knick ≥ 2° einer Linie wird ein Bogen; Sollmaß R = eckR + Spur (die innere Spur fährt R = eckR),
// Tangentenlänge Tl = R·tan(θ/2) entlang der Linie (über mehrere Stücke — die Straßen sind in ~3 m abgetastet), der spitzeste
// Knick zuerst, kein Bogen greift in einen anderen. Der Bogen ist die rationale quadratische Kurve zwischen den Tangenten-
// punkten mit dem Schnitt ihrer Tangenten als Kontrollpunkt (Gewicht cos(θ'/2), nur √; bei gleichen Schenkeln ein Kreis),
// in Punkten ≤ 1 m und ≤ 6°. map[q]: der neue Index des alten Punktes q (in einem Bogen: seine Mitte). zaehl.eng: Bögen
// unter 90 % ihres Sollmaßes (Platz fehlt: Linien-Ende oder Nachbar-Knick); wenden: Knicke über 150° (das Gesetz soll keine
// erzeugen).
const RUND = { eng: 0, boegen: 0, wenden: 0 };
function rund(xs, zs, sp, vg) {
    const n = xs.length, s = new Float64Array(n);
    for (let q = 1; q < n; q++) s[q] = s[q - 1] + Math.sqrt((xs[q] - xs[q - 1]) * (xs[q] - xs[q - 1]) + (zs[q] - zs[q - 1]) * (zs[q] - zs[q - 1]));
    const L = s[n - 1], kand = [];
    for (let q = 1; q < n - 1; q++) {
        const e1x = xs[q] - xs[q - 1], e1z = zs[q] - zs[q - 1], e2x = xs[q + 1] - xs[q], e2z = zs[q + 1] - zs[q];
        const l1 = Math.sqrt(e1x * e1x + e1z * e1z), l2 = Math.sqrt(e2x * e2x + e2z * e2z);
        const cos = l1 > 1e-9 && l2 > 1e-9 ? (e1x * e2x + e1z * e2z) / (l1 * l2) : 1;
        if (cos <= 0.99939) kand.push([cos, q]);
        if (cos < -0.866) RUND.wenden++;
    }
    kand.sort((a, b) => a[0] - b[0] || a[1] - b[1]);
    const boegen = [];
    for (const [cos, q] of kand) {
        let lo = 0, hi = L, drin = false;
        for (const b of boegen) {
            if (s[q] >= b[0] && s[q] <= b[1]) {
                drin = true;
                break;
            }
            if (b[1] <= s[q]) lo = Math.max(lo, b[1]);
            if (b[0] >= s[q]) hi = Math.min(hi, b[0]);
        }
        if (drin) continue;
        const soll = (GV.eckR + sp[q]) * Math.sqrt((1 - cos) / Math.max(1 + cos, 1e-12));
        const Tl = Math.min(soll, s[q] - lo, hi - s[q]);
        if (Tl < 1e-3) continue;
        if (Tl < 0.9 * soll) RUND.eng++;
        RUND.boegen++;
        boegen.push([s[q] - Tl, s[q] + Tl, q]);
    }
    boegen.sort((a, b) => a[0] - b[0]);
    // Ort und Richtung bei Bogenmaß u (vor: das Stück, das in u endet; sonst das, das in u beginnt)
    const bei = (u, vor) => {
        let j = 0;
        while (j < n - 2 && (vor ? s[j + 1] < u : s[j + 1] <= u)) j++;
        const l = s[j + 1] - s[j] || 1, f = Math.min(1, Math.max(0, (u - s[j]) / l));
        return { x: xs[j] + (xs[j + 1] - xs[j]) * f, z: zs[j] + (zs[j + 1] - zs[j]) * f, dx: (xs[j + 1] - xs[j]) / l, dz: (zs[j + 1] - zs[j]) / l, sp: sp[j] + (sp[j + 1] - sp[j]) * f, vg: vg ? Math.min(vg[j], vg[j + 1]) : 0 };
    };
    const X = [], Z = [], SP = [], VG = [], map = new Int32Array(n);
    const push = (x, z, a, v) => {
        const m = X.length;
        if (m && (x - X[m - 1]) * (x - X[m - 1]) + (z - Z[m - 1]) * (z - Z[m - 1]) < 1e-8) return;
        X.push(x);
        Z.push(z);
        SP.push(a);
        VG.push(v);
    };
    let b = 0;
    for (let q = 0; q < n; q++) {
        while (b < boegen.length && boegen[b][0] <= s[q] && q > 0) {
            const [sa, sb] = boegen[b], A = bei(sa, true), B = bei(sb, false);
            // der Kontrollpunkt: Schnitt der Tangenten A + λ·dA = B − μ·dB
            const det = A.dx * B.dz - A.dz * B.dx, rx = B.x - A.x, rz = B.z - A.z;
            let cx = xs[boegen[b][2]], cz = zs[boegen[b][2]];
            if (Math.abs(det) > 1e-9) {
                const lam = (rx * B.dz - rz * B.dx) / det;
                if (lam > 0) {
                    cx = A.x + lam * A.dx;
                    cz = A.z + lam * A.dz;
                }
            }
            const c = A.dx * B.dx + A.dz * B.dz, w = Math.sqrt(Math.max(0, (1 + c) / 2)), v = Math.min(A.vg, B.vg);
            const m = Math.max(2, Math.ceil(sb - sa), Math.ceil(20 * Math.sqrt(Math.max(0, 1 - c))));
            for (let j = 0; j <= m; j++) {
                const u = j / m, a = 1 - u, n0 = a * a, n1 = 2 * a * u * w, n2 = u * u, D = n0 + n1 + n2;
                push((n0 * A.x + n1 * cx + n2 * B.x) / D, (n0 * A.z + n1 * cz + n2 * B.z) / D, A.sp + (B.sp - A.sp) * u, v);
                if (j === m >> 1) boegen[b].mitte = X.length - 1;
            }
            b++;
        }
        const im = boegen.find((g) => s[q] >= g[0] && s[q] <= g[1] && q > 0 && q < n - 1);
        if (im) map[q] = im.mitte != null ? im.mitte : X.length;
        else {
            push(xs[q], zs[q], sp[q], vg ? vg[q] : 0);
            map[q] = X.length - 1;
        }
    }
    return { xs: X, zs: Z, sp: SP, vg: VG, map };
}
// die Knoten-Normalen (Mittel der Nachbar-Stücke): der Versatz quer ist über jeden Knick der Linie stetig
function normalen(P) {
    if (P.nx) return;
    const n = P.x.length, nx = new Float64Array(n), nz = new Float64Array(n);
    for (let q = 0; q < n; q++) {
        let sx = 0, sz = 0;
        for (let r = q - 1; r <= q; r++) {
            if (r < 0 || r + 1 >= n) continue;
            const dx = P.x[r + 1] - P.x[r], dz = P.z[r + 1] - P.z[r], l = Math.sqrt(dx * dx + dz * dz);
            if (l > 1e-9) {
                sx += -dz / l;
                sz += dx / l;
            }
        }
        const l = Math.sqrt(sx * sx + sz * sz);
        nx[q] = l > 1e-9 ? sx / l : 0;
        nz[q] = l > 1e-9 ? sz / l : 0;
    }
    P.nx = nx;
    P.nz = nz;
}
// Punkt, Richtung und Spur bei Bogen u; versatz(u, spur) → Versatz quer (rechts der Fahrt positiv im Sinn der Normalen)
function punktAuf(P, u, versatz) {
    const s = P.s, n = s.length;
    if (u <= 0) u = 0;
    if (u >= P.L) u = P.L;
    let lo = 0, hi = n - 1;
    while (hi - lo > 1) {
        const m = (lo + hi) >> 1;
        if (s[m] <= u) lo = m;
        else hi = m;
    }
    normalen(P);
    const l = s[hi] - s[lo] || 1, f = (u - s[lo]) / l;
    let dx = P.x[hi] - P.x[lo], dz = P.z[hi] - P.z[lo];
    const d = Math.sqrt(dx * dx + dz * dz) || 1;
    dx /= d;
    dz /= d;
    const x = P.x[lo] + (P.x[hi] - P.x[lo]) * f, z = P.z[lo] + (P.z[hi] - P.z[lo]) * f, sp = P.sp[lo] + (P.sp[hi] - P.sp[lo]) * f;
    const v = versatz ? versatz(u, sp) : 0;
    const nx = P.nx[lo] + (P.nx[hi] - P.nx[lo]) * f, nz = P.nz[lo] + (P.nz[hi] - P.nz[lo]) * f;
    // die Richtung folgt den gemischten Knoten-Normalen (stetig über jeden Punkt der Linie), d = (n.z, −n.x)
    const nl = Math.sqrt(nx * nx + nz * nz);
    if (nl > 0.5) {
        dx = nz / nl;
        dz = -nx / nl;
    }
    return { x: x + nx * v, z: z + nz * v, dx, dz, mx: x, mz: z, v };
}

// ── Das Tempo-Profil einer Strecke: Grenze je Punkt (Straße, Kurve), vor- und rückwärts (aAn, aAb), Zeit je Punkt ──
// v0, v1: Tempo an Anfang und Ende. → { t, v, T } (t[q] = Zeit bei Bogen s[q]; zwischen den Punkten gleichförmig beschleunigt)
function profil(P, vGrenze, v0, v1) {
    return profilG(P, grenzV(P, vGrenze), v0, v1);
}
// die Grenze je Punkt: die Straße (vGrenze) und die Kurve (Krümmung der inneren Spur)
function grenzV(P, vGrenze) {
    const n = P.s.length, v = new Float64Array(n);
    for (let q = 0; q < n; q++) {
        let g = vGrenze[q];
        if (q > 0 && q < n - 1) {
            const ax = P.x[q] - P.x[q - 1], az = P.z[q] - P.z[q - 1], bx = P.x[q + 1] - P.x[q], bz = P.z[q + 1] - P.z[q];
            const la = Math.sqrt(ax * ax + az * az), lb = Math.sqrt(bx * bx + bz * bz);
            if (la > 1e-6 && lb > 1e-6) {
                const kr = Math.abs(ax * bz - az * bx) / (la * lb), dot = (ax * bx + az * bz) / (la * lb);
                const sinK = dot < 0 ? 1 : kr; // ein Knick über 90° liest als volle Wende
                const kappa = sinK / ((la + lb) / 2);
                // die innere Spur (Versatz sp zur Kurvenmitte) fährt κ/(1 − sp·κ); ein Knick zählt als Bogen eckR
                const kl = Math.min(kappa / Math.max(0.2, 1 - P.sp[q] * kappa), 1 / GV.eckR);
                if (kappa > 1e-9) g = Math.min(g, Math.sqrt(GV.aQuer / kl));
            }
        }
        v[q] = g;
    }
    return v;
}
// das Profil zur Grenze g: vor- und rückwärts, die Zeit je Punkt
function profilG(P, g, v0, v1) {
    const n = P.s.length, v = Float64Array.from(g);
    v[0] = Math.min(v[0], v0);
    v[n - 1] = Math.min(v[n - 1], v1);
    for (let q = 1; q < n; q++) v[q] = Math.min(v[q], Math.sqrt(v[q - 1] * v[q - 1] + 2 * GV.aAn * (P.s[q] - P.s[q - 1])));
    for (let q = n - 2; q >= 0; q--) v[q] = Math.min(v[q], Math.sqrt(v[q + 1] * v[q + 1] + 2 * GV.aAb * (P.s[q + 1] - P.s[q])));
    const t = new Float64Array(n);
    for (let q = 1; q < n; q++) {
        const ds = P.s[q] - P.s[q - 1], vs = v[q] + v[q - 1];
        t[q] = t[q - 1] + (vs > 1e-9 ? (2 * ds) / vs : 0);
    }
    return { t, v, T: t[n - 1] };
}
// Bogen und Tempo zur Zeit tau im Profil
function bogenZu(P, F, tau) {
    const t = F.t, n = t.length;
    if (tau <= 0) return { u: 0, v: F.v[0] };
    if (tau >= F.T) return { u: P.L, v: F.v[n - 1] };
    let lo = 0, hi = n - 1;
    while (hi - lo > 1) {
        const m = (lo + hi) >> 1;
        if (t[m] <= tau) lo = m;
        else hi = m;
    }
    const dt = t[hi] - t[lo];
    if (dt <= 1e-12) return { u: P.s[lo], v: F.v[lo] };
    const a = (F.v[hi] - F.v[lo]) / dt, r = tau - t[lo];
    return { u: Math.min(P.s[hi], P.s[lo] + F.v[lo] * r + 0.5 * a * r * r), v: F.v[lo] + a * r };
}
// die Zeit im Profil, zu der der Bogen u erreicht ist (Umkehrung von bogenZu)
function zeitBei(P, F, u) {
    const s = P.s, n = s.length;
    if (u <= 0) return 0;
    if (u >= P.L) return F.T;
    let lo = 0, hi = n - 1;
    while (hi - lo > 1) {
        const m = (lo + hi) >> 1;
        if (s[m] <= u) lo = m;
        else hi = m;
    }
    const dt = F.t[hi] - F.t[lo], ds = u - s[lo], v0 = F.v[lo];
    if (dt <= 1e-12) return F.t[lo];
    const a = (F.v[hi] - v0) / dt;
    if (Math.abs(a) < 1e-9) return F.t[lo] + ds / Math.max(v0, 1e-9);
    const disk = Math.max(0, v0 * v0 + 2 * a * ds);
    return F.t[lo] + (Math.sqrt(disk) - v0) / a;
}
// kürzeste Wege über die Knoten der Kachel von den Startknoten [[knoten, d0], …]
function dijkstra(kanten, nn, starts) {
    const dist = new Float64Array(nn).fill(Infinity), via = new Int32Array(nn).fill(-1), zu = new Uint8Array(nn);
    for (const [k, d0] of starts) if (d0 < dist[k]) dist[k] = d0;
    for (let r = 0; r < nn; r++) {
        let b = -1;
        for (let q = 0; q < nn; q++) if (!zu[q] && (b < 0 || dist[q] < dist[b])) b = q;
        if (b < 0 || dist[b] === Infinity) break;
        zu[b] = 1;
        for (let e = 0; e < kanten.length; e++) {
            const P = kanten[e], o = P.a === b ? P.b : P.b === b ? P.a : -1;
            if (o >= 0 && dist[b] + P.L < dist[o]) {
                dist[o] = dist[b] + P.L;
                via[o] = e;
            }
        }
    }
    return { dist, via };
}

// ═══ DIE STADT ═══
class Stadt {
    constructor(samen, nH, opt) {
        this.samen = samen;
        this.nH = nH;
        this.ox = (opt && opt.ox) || 0;
        this.oz = (opt && opt.oz) || 0;
        this.mu = opt && opt.mu != null ? opt.mu : GV.mu;
        this.R = FC.stadtRinge(nH);
        for (const n of ["_k", "_n", "_h", "_z", "_b", "_g", "_r", "_x"]) this[n] = new Map();
        this.zaehl = { wort: 0, netz: 0, haeuser: 0, ziele: 0, haupt: 0, wege: 0, index: 0, indexMs: 0, sprungStoss: 0, knickStoss: 0, tempoStoss: 0 };
    }
    // „Am Schirm, verwerfbar“ (Gesetz, Daten 2): jeder Merker darf jederzeit fallen — die nächste Frage baut, was sie braucht, neu
    vergessen() {
        for (const n of ["_k", "_n", "_h", "_z", "_b", "_g", "_r", "_x"]) this[n].clear();
    }
    // Satz 1 — die Kachel (i, k): ob sie Stadt ist, ihre Haushalte H und ihre Arbeit J
    kachel(i, k) {
        const K = key(i, k);
        let c = this._k.get(K);
        if (c) return c;
        this.zaehl.wort++;
        const w = Math.abs(i) <= this.R && Math.abs(k) <= this.R ? FC.viertelWort(this.samen, this.nH, i, k) : null;
        const hoch = w && w.erbe && w.erbe.hoch > 0 ? w.erbe.hoch : 1;
        c = { i, k, K, stadt: !!w, H: w ? w.nH : 0, J: w ? w.nH * hoch : 0 };
        this._k.set(K, c);
        return c;
    }
    mitte(i, k) {
        return { x: this.ox + i * M, z: this.oz + k * M };
    }
    // das Netz der Kachel (fwc `kachelNetz`) in Welt-Koordinaten; die Hauptstraßen-Stücke kanonisch (RW: Tor W → Knoten 0, RO:
    // Knoten 0 → Tor O, SN, SS); die vier Tore der Hauptstraßen; je Tor die kürzesten Wege und die längste Fahrt (die Grenze der
    // Fenster); die Wege zu Knoten 0
    netz(i, k) {
        const K = key(i, k);
        let c = this._n.get(K);
        if (c) return c;
        this.zaehl.netz++;
        const G = FC.kachelNetz(this.samen, i, k), m = this.mitte(i, k);
        let j0 = -1, i0 = -1;
        for (let q = 0; q < N; q++) {
            if (G.edges[q * 6].gen === 0) j0 = q;
            if (G.edges[30 + q * 6].gen === 0) i0 = q;
        }
        if (j0 < 0 || i0 < 0) throw new Error("Kachel " + i + "," + k + ": keine Hauptstraße");
        const kanten = G.edges.map((e) => {
            const xs = [], zs = [], sp = [];
            for (const p of e.pts) {
                xs.push(m.x + p.x);
                zs.push(m.z + p.z);
                sp.push(e.w / 4);
            }
            const P = linie(xs, zs, sp);
            P.a = e.a;
            P.b = e.b;
            P.gen = e.gen;
            P.w = e.w;
            return P;
        });
        const nn = G.nodes.length;
        const stueck = (es) => {
            const xs = [], zs = [], sp = [];
            es.forEach((e, q) => {
                const P = kanten[e];
                for (let r = q === 0 ? 0 : 1; r < P.x.length; r++) {
                    xs.push(P.x[r]);
                    zs.push(P.z[r]);
                    sp.push(P.sp[r]);
                }
            });
            return linie(xs, zs, sp);
        };
        const reihe = (a, b) => Array.from({ length: b - a + 1 }, (_, q) => j0 * 6 + a + q);
        const spalte = (a, b) => Array.from({ length: b - a + 1 }, (_, q) => 30 + i0 * 6 + a + q);
        const tor = { W: G.edges[j0 * 6].a, O: G.edges[j0 * 6 + 5].b, N: G.edges[30 + i0 * 6].a, S: G.edges[30 + i0 * 6 + 5].b };
        const wege = { K0: dijkstra(kanten, nn, [[0, 0]]) };
        for (const t of ["W", "O", "N", "S"]) wege[t] = dijkstra(kanten, nn, [[tor[t], 0]]);
        // die längste Strecke einer Tür zu einem Ziel-Knoten: max über Kanten (L + d(a) + d(b)) / 2
        const lMax = {};
        for (const t in wege) {
            let l = 0;
            for (const P of kanten) l = Math.max(l, (P.L + wege[t].dist[P.a] + wege[t].dist[P.b]) / 2);
            lMax[t] = l;
        }
        c = { i, k, j0, i0, kanten, nn, tor, wege, lMax, RW: stueck(reihe(0, i0)), RO: stueck(reihe(i0 + 1, 5)), SN: stueck(spalte(0, j0)), SS: stueck(spalte(j0 + 1, 5)) };
        this._n.set(K, c);
        return c;
    }
    // die Grenze der Fahrzeit eines Weges der Länge ≤ L in der Kachel: jede Kurve ≥ vEin, Anfahren und Bremsen an den Enden
    // (aus `profil`: v ≥ min(vEin, √(2·a·s)) — die Zeit je Stück ≤ 2·ds / vEin, die Rampen ≤ 10 s)
    grenze(i, k, ziel) {
        const Z = this.netz(i, k), L = ziel === "quer" ? 2 * Z.lMax.K0 : Z.lMax[ziel];
        return (2 * L) / GV.vEin + 10;
    }
    // die Häuser der Kachel (fwc `kachelMassen`) und je Haus seine Tür an der Straße (Kante, Bogen) und die Seite
    haeuser(i, k) {
        const K = key(i, k);
        let c = this._h.get(K);
        if (c) return c;
        this.zaehl.haeuser++;
        const Mm = FC.kachelMassen(this.samen, this.nH, i, k), m = this.mitte(i, k), NZ = this.netz(i, k);
        if (!Mm) throw new Error("Kachel " + i + "," + k + " ist keine Stadt");
        const n = Mm.n, tuer = [];
        for (let r = 0; r < n; r++) {
            const hx = m.x + Mm.lage[r * 7], hz = m.z + Mm.lage[r * 7 + 1];
            let best = Infinity, be = -1, bu = 0;
            NZ.kanten.forEach((P, e) => {
                for (let q = 1; q < P.x.length; q++) {
                    const ax = P.x[q - 1], az = P.z[q - 1], bx = P.x[q] - ax, bz = P.z[q] - az, l2 = bx * bx + bz * bz;
                    let f = l2 > 0 ? ((hx - ax) * bx + (hz - az) * bz) / l2 : 0;
                    f = f < 0 ? 0 : f > 1 ? 1 : f;
                    const px = ax + bx * f - hx, pz = az + bz * f - hz, d2 = px * px + pz * pz;
                    if (d2 < best) {
                        best = d2;
                        be = e;
                        bu = P.s[q - 1] + (P.s[q] - P.s[q - 1]) * f;
                    }
                }
            });
            tuer.push({ e: be, u: bu, hx, hz });
        }
        c = { n, lage: Mm.lage, tuer, m };
        this._h.set(K, c);
        return c;
    }
    // Satz 2 — die Ziel-Tafel der Heim-Kachel o: die Werk-Kacheln d im Radius (Gravitation, Ecke der Route in der Stadt),
    // n_od nach größten Resten, die Reihe π_o der Haushalte (Hash), die Phase φ_od
    ziele(o) {
        let c = this._z.get(o.K);
        if (c) return c;
        this.zaehl.ziele++;
        const R = GV.rMaxK, C = Math.round(this.mu * o.H), D = [], W = [];
        let sw = 0;
        for (let di = -R; di <= R; di++)
            for (let dk = -R; dk <= R; dk++) {
                if (di * di + dk * dk > R * R) continue;
                const d = this.kachel(o.i + di, o.k + dk);
                if (!d.stadt || d.J <= 0) continue;
                if (!this.kachel(d.i, o.k).stadt) continue; // die Ecke der Route (Reihe zuerst) liegt in der Stadt
                const q = ((di * di + dk * dk) * M * M) / (GV.ellM * GV.ellM);
                const w = d.J / (1 + q);
                D.push(d.K);
                W.push(w);
                sw += w;
            }
        const n = new Int32Array(D.length), off = new Int32Array(D.length), phi = new Float64Array(D.length);
        if (C > 0 && sw > 0) {
            const rest = [];
            let summe = 0;
            for (let q = 0; q < D.length; q++) {
                const soll = (C * W[q]) / sw;
                n[q] = Math.floor(soll);
                summe += n[q];
                rest.push([soll - n[q], q]);
            }
            rest.sort((a, b) => b[0] - a[0] || a[1] - b[1]);
            for (let q = 0; summe < C; q++, summe++) n[rest[q][1]]++;
        }
        for (let q = 1; q < D.length; q++) off[q] = off[q - 1] + n[q - 1];
        for (let q = 0; q < D.length; q++) phi[q] = u01(hash(this.samen, 71, o.K, D[q]));
        const pi = Array.from({ length: o.H }, (_, h) => h).sort((a, b) => hash(this.samen, 61, o.K, a) - hash(this.samen, 61, o.K, b) || a - b);
        const rang = new Int32Array(o.H);
        pi.forEach((h, q) => (rang[h] = q));
        const index = new Map();
        D.forEach((K, q) => index.set(K, q));
        c = { o, C, D: Int32Array.from(D), n, off, phi, pi: Int32Array.from(pi), rang, index };
        this._z.set(o.K, c);
        return c;
    }
    // der Haushalt h der Kachel o → seine Fahrt (oder null: ohne Wagen)
    haushalt(i, k, h) {
        const o = this.kachel(i, k);
        if (!o.stadt || h < 0 || h >= o.H) return null;
        const Z = this.ziele(o), q = Z.rang[h];
        if (q >= Z.C) return null;
        let lo = 0, hi = Z.D.length - 1;
        while (lo < hi) {
            const m = (lo + hi + 1) >> 1;
            if (Z.off[m] <= q) lo = m;
            else hi = m - 1;
        }
        while (lo < Z.D.length - 1 && Z.n[lo] === 0) lo++;
        return this.fahrt(o, this.kachel(ki(Z.D[lo]), kk(Z.D[lo])), q - Z.off[lo]);
    }
    // Satz 2 — die r-te Fahrt des Paares (o, d): Werk-Beginn W, Feierabend E, der Haushalt (Rang → Index), das Werk-Haus
    fahrt(o, d, r) {
        const Z = this.ziele(o), q = Z.index.get(d.K);
        if (q == null || r < 0 || r >= Z.n[q]) return null;
        const n = Z.n[q], streuS = GV.streuH * 3600, w0 = GV.werk[0] * 3600;
        const W = w0 - streuS + (2 * streuS * (r + Z.phi[q])) / n;
        const E = W + (GV.werk[1] - GV.werk[0]) * 3600;
        const h = Z.pi[Z.off[q] + r];
        return { o, d, r, n, W, E, h, id: o.K * 4096 + h, typ: hash(this.samen, 73, o.K, h) % 3, werkH: hash(this.samen, 67, o.K, d.K, r) };
    }
    // Satz 2 — die ROUTE des Paares (o, d): Reihe zuerst (die Hauptstraße der Heim-Reihe bis zur Spalte des Werks), dann die
    // Spalte. Heim-Tor: Richtung der Reihe zum Werk (sonst der Spalte); Werk-Tor: Richtung der Spalte vom Heim (sonst der Reihe).
    route(o, d) {
        const K = o.K * 67108864 + d.K;
        let c = this._r.get(K);
        if (c) return c;
        const reihe = o.i !== d.i, spalte = o.k !== d.k;
        c = reihe || spalte ? { quer: false, torH: reihe ? (d.i > o.i ? "O" : "W") : d.k > o.k ? "S" : "N", torW: spalte ? (d.k > o.k ? "N" : "S") : d.i > o.i ? "W" : "O" } : { quer: true };
        this._r.set(K, c);
        return c;
    }
    // das STÜCK der Hauptstraße einer Kachel von Tor zu Tor über Knoten 0 (typ = Eintritt + Austritt: "WO" gerade, "WS" die Ecke
    // einer Route): die Tore sind feste Punkte, jeder Knick dazwischen wird ein Bogen (`rund`); qK: der Index an Knoten 0
    stueck(i, k, typ) {
        const Z = this.netz(i, k);
        if (!Z.st) Z.st = {};
        let c = Z.st[typ];
        if (c) return c;
        const xs = [], zs = [], sp = [];
        const nehmen = (P, um) => {
            const n = P.x.length;
            for (let q = xs.length === 0 ? 0 : 1; q < n; q++) {
                const r = um ? n - 1 - q : q;
                xs.push(P.x[r]);
                zs.push(P.z[r]);
                sp.push(P.sp[r]);
            }
        };
        const ein = typ[0], aus = typ[1];
        if (ein === "W") nehmen(Z.RW, false);
        else if (ein === "O") nehmen(Z.RO, true);
        else if (ein === "N") nehmen(Z.SN, false);
        else nehmen(Z.SS, true);
        const qK = xs.length - 1;
        if (aus === "O") nehmen(Z.RO, false);
        else if (aus === "W") nehmen(Z.RW, true);
        else if (aus === "S") nehmen(Z.SS, false);
        else nehmen(Z.SN, true);
        const r = rund(xs, zs, sp, null);
        c = { xs: r.xs, zs: r.zs, sp: r.sp, qK: r.map[qK] };
        Z.st[typ] = c;
        return c;
    }
    // die Linie der Hauptstraße einer Route morgens (Heim-Tor → Werk-Tor): die Stücke ihrer Kacheln aneinander (Polylinie wie
    // `linie`). naht: je Übergang [Kachel aus, Kachel ein, Index des Tores]; qE: die Ecke (Knoten 0 der Eck-Kachel) oder −1
    _hLinie(o, d) {
        const si = d.i > o.i ? 1 : -1, sk = d.k > o.k ? 1 : -1, reihe = o.i !== d.i, spalte = o.k !== d.k, kach = [];
        if (reihe) {
            for (let c = o.i + si; c !== d.i; c += si) kach.push([c, o.k, si > 0 ? "WO" : "OW", false]);
            if (spalte) kach.push([d.i, o.k, (si > 0 ? "W" : "O") + (sk > 0 ? "S" : "N"), true]);
        }
        if (spalte) for (let c = o.k + sk; c !== d.k; c += sk) kach.push([d.i, c, sk > 0 ? "NS" : "SN", false]);
        const naht = [], st = kach.map(([i, k, typ]) => this.stueck(i, k, typ));
        let n = 1;
        for (const S of st) n += S.xs.length - 1;
        const x = new Float64Array(n), z = new Float64Array(n), sp = new Float64Array(n), s = new Float64Array(n);
        let qE = -1, vorK = o.K, m = 0;
        if (!kach.length) {
            // Nachbarn ohne Ecke: die Linie ist das Tor zwischen ihnen
            const Z = this.netz(o.i, o.k), t = this.route(o, d).torH, P = t === "W" ? Z.RW : t === "O" ? Z.RO : t === "N" ? Z.SN : Z.SS;
            const q = t === "W" || t === "N" ? 0 : P.x.length - 1;
            x[0] = P.x[q];
            z[0] = P.z[q];
            sp[0] = P.sp[q];
        }
        kach.forEach(([i, k, , ecke], j) => {
            const S = st[j], K = key(i, k), q0 = j ? m - 1 : 0; // das Tor: der letzte Punkt der Kachel davor
            naht.push([vorK, K, q0]);
            for (let q = j ? 1 : 0; q < S.xs.length; q++) {
                x[m] = S.xs[q];
                z[m] = S.zs[q];
                sp[m] = S.sp[q];
                if (m) {
                    const dx = x[m] - x[m - 1], dz = z[m] - z[m - 1];
                    s[m] = s[m - 1] + Math.sqrt(dx * dx + dz * dz);
                }
                m++;
            }
            if (ecke) qE = q0 + S.qK;
            vorK = K;
        });
        naht.push([vorK, d.K, n - 1]);
        return { P: { x, z, sp, s, L: s[n - 1] }, naht, qE };
    }
    // Satz 2 — DIE HAUPTSTRASSE einer Route: EINE Linie von Tor zu Tor samt Ecke (morgens Heim → Werk, abends dieselbe Linie
    // rückwärts) und ihr freies Profil Ff. Ihr Anfang gehört der Gasse: vom Tor bis J, wo ein Wagen aus dem Stand am Tor Ff
    // eingeholt hat (der ANLAUF); ebenso ihr Ende ab J′, von wo ein Wagen bis zum Stand am Tor bremsen kann (der AUSLAUF).
    // Dazwischen ist die Fahrt jedes Wagens des Paares dieselbe Funktion der Uhr (Ff). Reicht die Linie nicht (J′ ≤ J: kurz, oder
    // das Tor zweier Nachbarn), ist sie leer: die Gassen treffen einander in Jm, wo Anlauf und Auslauf am schnellsten sind, mit dem
    // Tempo, das beide dort fahren können. kach: je Kachel der Linie das Fenster der Uhr relativ zu J (Eintritt, Austritt).
    // Beide Gänge entstehen zusammen aus derselben Linie (abends: rückwärts, die Normalen gespiegelt).
    haupt(o, d, morgens) {
        const K0 = (o.K * 67108864 + d.K) * 2;
        let c = this._b.get(K0 + (morgens ? 1 : 0));
        if (c) return c;
        this.zaehl.haupt++;
        const L = this._hLinie(o, d), P = L.P, n = P.x.length;
        normalen(P);
        if (n === 1) {
            // das Tor zweier Nachbarn: seine Normale mischt die Hauptstraße davor (Kachel o) und danach (Kachel d)
            const t = this.route(o, d).torH, Zo = this.netz(o.i, o.k), Zd = this.netz(d.i, d.k);
            const st = (Q, ende) => {
                const m = Q.x.length, a = ende ? m - 2 : 0, dx = Q.x[a + 1] - Q.x[a], dz = Q.z[a + 1] - Q.z[a], l = Math.sqrt(dx * dx + dz * dz);
                return [dx / l, dz / l];
            };
            const neg = (e) => [-e[0], -e[1]];
            const e1 = t === "O" ? st(Zo.RO, true) : t === "W" ? neg(st(Zo.RW, false)) : t === "S" ? st(Zo.SS, true) : neg(st(Zo.SN, false));
            const e2 = t === "O" ? st(Zd.RW, false) : t === "W" ? neg(st(Zd.RO, true)) : t === "S" ? st(Zd.SN, false) : neg(st(Zd.SS, true));
            const nx = -(e1[1] + e2[1]), nz = e1[0] + e2[0], l = Math.sqrt(nx * nx + nz * nz);
            P.nx[0] = nx / l;
            P.nz[0] = nz / l;
        }
        const g = n >= 2 ? grenzV(P, new Float64Array(n).fill(GV.vHaupt)) : null;
        // abends: dieselbe Linie rückwärts — Bogen L − s, die Normalen gespiegelt (die Spur bleibt rechts der Fahrt), die Grenze
        // der Kurven gleich
        const um = (A) => A.slice().reverse();
        const R = { x: um(P.x), z: um(P.z), sp: um(P.sp), s: new Float64Array(n), L: P.L, nx: um(P.nx).map((v) => -v), nz: um(P.nz).map((v) => -v) };
        for (let q = 0; q < n; q++) R.s[q] = P.L - P.s[n - 1 - q];
        const nahtR = L.naht
            .slice()
            .reverse()
            .map(([a, b, q]) => [b, a, n - 1 - q]);
        this._b.set(K0 + 1, this._schnitt(P, g, L.naht, L.qE));
        this._b.set(K0, this._schnitt(R, g && um(g), nahtR, L.qE >= 0 ? n - 1 - L.qE : -1));
        return this._b.get(K0 + (morgens ? 1 : 0));
    }
    // der Schnitt einer Linie Hr (Grenze g): Ff, J und J′, Anlauf und Auslauf, die Hauptstraße J..J′, die Fenster je Kachel
    _schnitt(Hr, g, naht, qE) {
        const n = Hr.x.length, V = GV.vHaupt;
        const c = { typ: "bein", Hr, naht, qE, _g: new Map(), kach: new Map(), leer: true, ja: 0, jz: 0, T: 0, anlaufT: 0, auslaufT: 0, P: null, F: null };
        const sicht = (a, b) => ({ x: Hr.x.subarray(a, b + 1), z: Hr.z.subarray(a, b + 1), sp: Hr.sp.subarray(a, b + 1), s: Hr.s.subarray(a, b + 1) });
        if (n >= 2) {
            const Ff = profilG(Hr, g, V, V), aA = 2 * GV.aAn, aB = 2 * GV.aAb;
            // J: der Wagen aus dem Stand am Tor (vorwärts, Grenze g) holt Ff ein; J′ ebenso rückwärts bis zum Stand am Tor
            let J = 0, J2 = n - 1, v = 0;
            while (J < n - 1 && v < Ff.v[J] - 1e-9) {
                J++;
                v = Math.min(g[J], Math.sqrt(v * v + aA * (Hr.s[J] - Hr.s[J - 1])));
            }
            v = 0;
            while (J2 > 0 && v < Ff.v[J2] - 1e-9) {
                J2--;
                v = Math.min(g[J2], Math.sqrt(v * v + aB * (Hr.s[J2 + 1] - Hr.s[J2])));
            }
            c.leer = !(J2 > J);
            if (c.leer) {
                const F0 = profilG(Hr, g, 0, V), Fz = profilG(Hr, g, V, 0);
                let best = -1;
                for (let q = 0; q < n; q++) {
                    const m = Math.min(F0.v[q], Fz.v[q]);
                    if (m > best) {
                        best = m;
                        J = q;
                    }
                }
                J2 = J;
            }
            c.ja = J;
            c.jz = J2;
            // die längste Zeit auf Anlauf und Auslauf (aus dem Stand am Tor, bis zum Stand am Tor): die Grenze der Fenster
            c.anlaufT = profilG(sicht(0, J), g.subarray(0, J + 1), 0, c.leer ? 0 : Ff.v[J]).T;
            c.auslaufT = profilG(sicht(J2, n - 1), g.subarray(J2, n), c.leer ? 0 : Ff.v[J2], 0).T;
            if (!c.leer) {
                const m = J2 - J + 1, s = new Float64Array(m), t = new Float64Array(m);
                for (let q = 0; q < m; q++) {
                    s[q] = Hr.s[J + q] - Hr.s[J];
                    t[q] = Ff.t[J + q] - Ff.t[J];
                }
                c.P = { x: Hr.x.subarray(J, J2 + 1), z: Hr.z.subarray(J, J2 + 1), sp: Hr.sp.subarray(J, J2 + 1), nx: Hr.nx.subarray(J, J2 + 1), nz: Hr.nz.subarray(J, J2 + 1), s, L: s[m - 1] };
                c.F = { t, v: Ff.v.subarray(J, J2 + 1), T: t[m - 1] };
                c.T = c.F.T;
            }
        }
        const tau = (q, ein) => (q < c.ja ? (ein ? -c.anlaufT : 0) : q > c.jz ? (ein ? c.T : c.T + c.auslaufT) : c.leer ? 0 : c.F.t[q - c.ja]);
        for (let j = 0; j + 1 < naht.length; j++) c.kach.set(naht[j][1], [tau(naht[j][2], true), tau(naht[j + 1][2], false)]);
        return c;
    }
    // der rohe WEG in der Kachel, gerundet: Tür (Haus h1) → Tor auf dem kürzesten Weg; quer: Tür → Tür (h1 nach h2). Tür und Tor
    // sind feste Punkte. → { xs, zs, sp, vg } (Arrays)
    _rohWeg(i, k, h1, ziel, h2) {
        const quer = ziel === "quer", code = quer ? 31 : ["W", "O", "N", "S"].indexOf(ziel);
        const K = ((key(i, k) * 1024 + h1) * 1024 + (quer ? h2 : 0)) * 32 + code;
        let c = this._g.get(K);
        if (c) return c;
        const Z = this.netz(i, k), H = this.haeuser(i, k), T = H.tuer[h1 % H.n], P0 = Z.kanten[T.e];
        const xs = [], zs = [], sp = [], vg = [];
        const vOf = (P) => (P.gen === 0 ? GV.vHaupt : GV.vGasse);
        const add = (x, z, s, v) => {
            const n = xs.length;
            if (n && (x - xs[n - 1]) * (x - xs[n - 1]) + (z - zs[n - 1]) * (z - zs[n - 1]) < 1e-6) return;
            xs.push(x);
            zs.push(z);
            sp.push(s);
            vg.push(v);
        };
        // die Tür auf ihrer Kante → über die Knoten (via) → das Ziel
        const tp = punktAuf(P0, T.u, null);
        let W, T2 = null, P2 = null;
        if (quer) {
            T2 = H.tuer[h2 % H.n];
            P2 = Z.kanten[T2.e];
            W = dijkstra(Z.kanten, Z.nn, [[P2.a, T2.u], [P2.b, P2.L - T2.u]]);
        } else W = Z.wege[ziel];
        const viaA = T.u + W.dist[P0.a], viaB = P0.L - T.u + W.dist[P0.b];
        add(tp.mx, tp.mz, P0.sp[0], vOf(P0));
        const direkt = quer && T2.e === T.e && Math.abs(T2.u - T.u) <= Math.min(viaA, viaB);
        if (direkt) {
            // beide Türen an derselben Kante: entlang der Kante
            const vor = T2.u > T.u;
            for (let q = vor ? 0 : P0.x.length - 1; vor ? q < P0.x.length : q >= 0; q += vor ? 1 : -1) if (vor ? P0.s[q] > T.u && P0.s[q] < T2.u : P0.s[q] < T.u && P0.s[q] > T2.u) add(P0.x[q], P0.z[q], P0.sp[q], vOf(P0));
        } else {
            let knoten;
            if (viaA <= viaB) {
                for (let q = P0.x.length - 1; q >= 0; q--) if (P0.s[q] < T.u) add(P0.x[q], P0.z[q], P0.sp[q], vOf(P0));
                knoten = P0.a;
            } else {
                for (let q = 0; q < P0.x.length; q++) if (P0.s[q] > T.u) add(P0.x[q], P0.z[q], P0.sp[q], vOf(P0));
                knoten = P0.b;
            }
            const zielK = quer ? -1 : Z.tor[ziel];
            for (let sicher = 0; knoten !== zielK && W.via[knoten] >= 0 && sicher < 64; sicher++) {
                const e = W.via[knoten], P = Z.kanten[e], vorwaerts = P.a === knoten, n = P.x.length;
                if (quer && e === T2.e) break;
                for (let q = 1; q < n; q++) {
                    const r = vorwaerts ? q : n - 1 - q;
                    add(P.x[r], P.z[r], P.sp[r], vOf(P));
                }
                knoten = vorwaerts ? P.b : P.a;
            }
            if (quer) {
                // die letzte Kante bis zur zweiten Tür
                const vonA = knoten === P2.a;
                for (let q = vonA ? 0 : P2.x.length - 1; vonA ? q < P2.x.length : q >= 0; q += vonA ? 1 : -1) if (vonA ? P2.s[q] < T2.u : P2.s[q] > T2.u) add(P2.x[q], P2.z[q], P2.sp[q], vOf(P2));
            }
        }
        if (quer) {
            const t2 = punktAuf(P2, T2.u, null);
            add(t2.mx, t2.mz, P2.sp[0], vOf(P2));
        }
        if (xs.length < 2) {
            const P = Z.kanten[T.e], d = punktAuf(P, Math.min(P.L, T.u + 1), null);
            add(d.mx, d.mz, P.sp[0], vOf(P));
            if (xs.length < 2) add(xs[0] + 1, zs[0], sp[0], vg[0]);
        }
        c = rund(xs, zs, sp, vg);
        this._g.set(K, c);
        return c;
    }
    // ein WEG als Teil einer Fahrt: der rohe Weg (`_rohWeg`) und, mit der Hauptstraße H, hin der Anlauf dahinter (Tor → J), her der
    // Auslauf davor (J′ → Tor, dann Tor → Tür) — Punkte, Spur und Normale der Linie H, so stößt die Gasse an J ohne Knick an die
    // Hauptstraße. Die Tür-Enden tragen die Seite des Hauses (dort parkt der Wagen). qTor: der Index des Tores.
    _wegGeo(i, k, h1, ziel, hin, h2, H) {
        const quer = ziel === "quer";
        const code = quer ? 31 : ["W", "O", "N", "S"].indexOf(ziel) * 2 + (hin ? 1 : 0);
        const K = ((key(i, k) * 1024 + h1) * 1024 + (quer ? h2 : 0)) * 32 + code, merk = H ? H._g : this._g;
        const KK = H ? K : -1 - K; // im Merker der Stadt neben den rohen Wegen
        let c = merk.get(KK);
        if (c) return c;
        this.zaehl.wege++;
        const Hs = this.haeuser(i, k), T = Hs.tuer[h1 % Hs.n], rd = this._rohWeg(i, k, h1, ziel, h2);
        const X = [], Z = [], SP = [], VG = [];
        const add = (x, z, s, v) => {
            X.push(x);
            Z.push(z);
            SP.push(s);
            VG.push(v);
        };
        let qTor = -1;
        const n0 = rd.xs.length, Hr = H ? H.Hr : null, nH = Hr ? Hr.x.length : 0;
        if (quer || !H) for (let q = 0; q < n0; q++) add(rd.xs[q], rd.zs[q], rd.sp[q], rd.vg[q]);
        else if (hin) {
            for (let q = 0; q < n0; q++) add(rd.xs[q], rd.zs[q], rd.sp[q], rd.vg[q]);
            qTor = n0 - 1;
            for (let q = 1; q <= H.ja; q++) add(Hr.x[q], Hr.z[q], Hr.sp[q], GV.vHaupt);
        } else {
            for (let q = H.jz; q < nH; q++) add(Hr.x[q], Hr.z[q], Hr.sp[q], GV.vHaupt);
            qTor = nH - 1 - H.jz;
            for (let q = n0 - 2; q >= 0; q--) add(rd.xs[q], rd.zs[q], rd.sp[q], rd.vg[q]);
        }
        const P = linie(X, Z, SP);
        normalen(P);
        const n = P.x.length;
        if (H && !quer) {
            // die Normale an J (J′) ist die der Linie H: die Richtung läuft stetig über den Stoß
            const qa = hin ? n - 1 : 0, qh = hin ? H.ja : H.jz;
            P.nx[qa] = Hr.nx[qh];
            P.nz[qa] = Hr.nz[qh];
        }
        const seite = (q, H0) => (P.nx[q] * (H0.hx - P.x[q]) + P.nz[q] * (H0.hz - P.z[q]) >= 0 ? 1 : -1);
        const tuerA = quer || hin, tuerB = quer || !hin;
        c = { P, vg: VG, typ: "weg", tuerA, tuerB, seiteA: tuerA ? seite(0, T) : 0, seiteB: tuerB ? seite(n - 1, quer ? Hs.tuer[h2 % Hs.n] : T) : 0, var: new Map(), qTor, vFrei: 0 };
        // ist die Hauptstraße leer, treffen die Gassen einander: das freie Tempo am Treffpunkt (was der Weg dort höchstens fährt)
        if (H && H.leer && !quer) {
            const F = profil(P, VG, tuerA ? 0 : GV.vHaupt, tuerB ? 0 : GV.vHaupt);
            c.vFrei = hin ? F.v[n - 1] : F.v[0];
        }
        merk.set(KK, c);
        return c;
    }
    // der Weg mit dem Tempo vJ an seinem Anschluss (J, J′ oder Jm): das Profil
    weg(i, k, h1, ziel, hin, h2, H, vJ) {
        const G = this._wegGeo(i, k, h1, ziel, hin, h2, H), v = ziel === "quer" ? 0 : vJ;
        let c = G.var.get(v);
        if (c) return c;
        c = { P: G.P, typ: "weg", tuerA: G.tuerA, tuerB: G.tuerB, seiteA: G.seiteA, seiteB: G.seiteB, geo: G };
        c.F = profil(G.P, G.vg, G.tuerA ? 0 : v, G.tuerB ? 0 : v);
        c.T = c.F.T;
        G.var.set(v, c);
        return c;
    }
    // der Versatz quer am Bogen u: die Spur der Straße (w/4), an der Tür auf den Parkstreifen der Hausseite gemischt — die Rampe
    // endet im Weg (≤ seine Länge, quer ≤ die Hälfte): am Anschluss fährt der Wagen auf der Spur
    versatz(S) {
        if (S._vs) return S._vs;
        if (S.typ === "bein") return (S._vs = (u, sp) => sp);
        const L = S.P.L, r = Math.min(GV.rampeM, S.tuerA && S.tuerB ? L / 2 : L) || 1;
        return (S._vs = (u, sp) => {
            let v = sp;
            if (S.tuerA) {
                const f = Math.min(1, u / r);
                v = v * f + S.seiteA * GV.parkM * (1 - f);
            }
            if (S.tuerB) {
                const f = Math.min(1, (L - u) / r);
                v = v * f + S.seiteB * GV.parkM * (1 - f);
            }
            return v;
        });
    }
    werkHaus(f) {
        return f.werkH % this.haeuser(f.d.i, f.d.k).n;
    }
    // die Gassen eines Ganges (morgens Heim → Werk, abends Werk → Heim) als Fabrik { H, A(), B() } — faul gebaut. A endet an J mit
    // dem Tempo Ff(J), B beginnt an J′ mit Ff(J′); ist H leer, treffen sie einander in Jm mit dem Tempo, das beide fahren können.
    _gassen(f, morgens) {
        const o = f.o, d = f.d, wh = this.werkHaus(f), R = this.route(o, d), H = this.haupt(o, d, morgens);
        const a = morgens ? [o.i, o.k, f.h, R.torH] : [d.i, d.k, wh, R.torW], b = morgens ? [d.i, d.k, wh, R.torW] : [o.i, o.k, f.h, R.torH];
        let vA, vB;
        if (!H.leer) {
            vA = H.F.v[0];
            vB = H.F.v[H.F.v.length - 1];
        } else vA = vB = Math.min(this._wegGeo(a[0], a[1], a[2], a[3], true, 0, H).vFrei, this._wegGeo(b[0], b[1], b[2], b[3], false, 0, H).vFrei);
        return { H, A: () => this.weg(a[0], a[1], a[2], a[3], true, 0, H, vA), B: () => this.weg(b[0], b[1], b[2], b[3], false, 0, H, vB) };
    }
    // die Uhr an J: morgens erreicht der Wagen J′ um W − refS, abends ist er an J um E + refS
    _uhrA(f, H, morgens) {
        return morgens ? f.W - GV.refS - H.T : f.E + GV.refS;
    }
    // die Teile einer Fahrt um die Uhr t (faul: eine Gasse wird nur gebaut, wenn die Uhr in ihr oder vor ihrer Tür liegt)
    // → { teile: [{S, t0, t1, teil}], parkA: [S, t] (vor dem ersten Teil), parkB: [S, t] (nach dem letzten) } oder { park }
    _teile(f, t) {
        const teile = [], refS = GV.refS, morgens = t <= f.W + 1800;
        if (!morgens && t < f.E - 1800) return { teile, park: true };
        const R = this.route(f.o, f.d);
        if (R.quer) {
            const S = morgens ? this.weg(f.o.i, f.o.k, f.h, "quer", true, this.werkHaus(f)) : this.weg(f.d.i, f.d.k, this.werkHaus(f), "quer", true, f.h);
            const tE = morgens ? f.W - refS : f.E + refS + S.T;
            teile.push({ S, t0: tE - S.T, t1: tE, teil: "gasse" });
            return { teile, parkA: [S, tE - S.T], parkB: [S, tE] };
        }
        const g = this._gassen(f, morgens), H = g.H, tA = this._uhrA(f, H, morgens), tB = tA + H.T;
        const namA = morgens ? "gasse-heim" : "gasse-werk", namB = morgens ? "gasse-werk" : "gasse-heim";
        let parkA = null, parkB = null;
        if (t <= tA || H.leer) {
            const S = g.A();
            teile.push({ S, t0: tA - S.T, t1: tA, teil: namA });
            parkA = [S, tA - S.T];
        }
        if (!H.leer) teile.push({ S: H, t0: tA, t1: tB, teil: "haupt" });
        if (t >= tB || H.leer) {
            const S = g.B();
            teile.push({ S, t0: tB, t1: tB + S.T, teil: namB });
            parkB = [S, tB + S.T];
        }
        for (let q = 1; q < teile.length; q++) this._pruefe(teile[q - 1].S, teile[q].S);
        return { teile, parkA, parkB };
    }
    // DER STOSS zweier Teile: dieselbe Stelle, dieselbe Richtung, dasselbe Tempo — sonst gezählt (sprungStoss ab 1 µm, knickStoss
    // ab 2°, tempoStoss ab 0,01 m/s), nie still geglättet. Eine Funktion der beiden Teile: geprüft einmal je Paar.
    _pruefe(a, b) {
        if (!a._st) a._st = new Set();
        if (a._st.has(b)) return;
        a._st.add(b);
        const pa = punktAuf(a.P, a.P.L, this.versatz(a)), pb = punktAuf(b.P, 0, this.versatz(b));
        if ((pa.x - pb.x) * (pa.x - pb.x) + (pa.z - pb.z) * (pa.z - pb.z) > 1e-12) this.zaehl.sprungStoss++;
        if (pa.dx * pb.dx + pa.dz * pb.dz < 0.99939) this.zaehl.knickStoss++;
        if (Math.abs(a.F.v[a.F.v.length - 1] - b.F.v[0]) > 0.01) this.zaehl.tempoStoss++;
    }
    _ortS(S, tau) {
        const b = bogenZu(S.P, S.F, tau), q = punktAuf(S.P, b.u, this.versatz(S));
        return { x: q.x, z: q.z, dx: q.dx, dz: q.dz, v: b.v, u: b.u };
    }
    // Satz 2 — DIE LAGE der Fahrt f zur Uhr t (Sekunde des Tages): { x, z, dx, dz, v, teil, u } (u < 0: geparkt)
    lage(f, t) {
        const T = this._teile(f, t);
        const stehe = (S, amEnde, teil) => {
            const u = amEnde ? S.P.L : 0, p = punktAuf(S.P, u, this.versatz(S));
            return { x: p.x, z: p.z, dx: p.dx, dz: p.dz, v: 0, teil, u: -1 };
        };
        if (T.park) {
            const R = this.route(f.o, f.d);
            const S = R.quer ? this.weg(f.o.i, f.o.k, f.h, "quer", true, this.werkHaus(f)) : this._gassen(f, true).B();
            return stehe(S, true, "parkt-werk");
        }
        const morgens = t <= f.W + 1800;
        if (T.parkA && t < T.parkA[1]) return stehe(T.parkA[0], false, morgens ? "parkt-heim" : "parkt-werk");
        if (T.parkB && t > T.parkB[1]) return stehe(T.parkB[0], true, morgens ? "parkt-werk" : "parkt-heim");
        const L = T.teile;
        let q = 0;
        while (q < L.length - 1 && t > L[q].t1) q++;
        const p = L[q], o = this._ortS(p.S, t - p.t0);
        return { x: o.x, z: o.z, dx: o.dx, dz: o.dz, v: o.v, teil: p.teil, u: o.u };
    }
    // die Uhr, zu der die Fahrt f den Punkt q der Linie ihrer Hauptstraße (morgens oder abends) passiert — auf Anlauf und Auslauf
    // in der Gasse ihres Haushalts
    zeitAmHr(f, morgens, q) {
        const G = this._gassen(f, morgens), H = G.H, tA = this._uhrA(f, H, morgens);
        if (!H.leer && q >= H.ja && q <= H.jz) return tA + H.F.t[q - H.ja];
        if (q <= H.ja) {
            const A = G.A();
            return tA - A.T + A.F.t[A.geo.qTor + q];
        }
        const B = G.B();
        return tA + H.T + B.F.t[q - H.jz];
    }
    // die Uhr der Teile einer Fahrt (für Proben und Leser): je Gang (morgens, abends) fünf Zeiten — Abfahrt an der Tür, Tor der
    // Abfahrt-Kachel, Ecke (ohne Ecke: die Mitte zwischen den Toren), Tor der Ziel-Kachel, Ankunft an der Tür (quer: Abfahrt,
    // Abfahrt, Abfahrt, Ankunft, Ankunft)
    grenzen(f) {
        const g = [], refS = GV.refS, R = this.route(f.o, f.d), wh = this.werkHaus(f);
        for (const morgens of [true, false]) {
            if (R.quer) {
                const S = morgens ? this.weg(f.o.i, f.o.k, f.h, "quer", true, wh) : this.weg(f.d.i, f.d.k, wh, "quer", true, f.h);
                const t1 = morgens ? f.W - refS : f.E + refS + S.T, t0 = t1 - S.T;
                g.push(t0, t0, t0, t1, t1);
                continue;
            }
            const G = this._gassen(f, morgens), H = G.H, A = G.A(), B = G.B(), tA = this._uhrA(f, H, morgens), tB = tA + H.T;
            const tor0 = tA - A.T + A.F.t[A.geo.qTor], tor1 = tB + B.F.t[B.geo.qTor];
            g.push(tA - A.T, tor0, H.qE >= 0 ? this.zeitAmHr(f, morgens, H.qE) : (tor0 + tor1) / 2, tor1, tB + B.T);
        }
        return g;
    }
    // Satz 3 — der INDEX der Kachel (i, k): jedes Paar (o, d) mit Wagen, dessen Route die Kachel berührt (Heim oder Werk hier, oder
    // die Linie seiner Hauptstraße), mit dem Fenster relativ zum Werk-Beginn W, in dem seine Fahrt hier ist (morgens lo..hi,
    // abends lo2..hi2). Begrenzt durch R_max.
    index(i, k) {
        const K = key(i, k);
        let c = this._x.get(K);
        if (c) return c;
        this.zaehl.index++;
        const tIdx = process.hrtime.bigint();
        const rK = GV.rMaxK, dauer = (GV.werk[1] - GV.werk[0]) * 3600, refS = GV.refS, relE = dauer + refS;
        const eO = [], eD = [], eQ = [], LO = [], HI = [], LO2 = [], HI2 = [];
        const zw = (x, a, b) => (a <= b ? x >= a && x <= b : x >= b && x <= a);
        const gr = {};
        const G = (z) => (gr[z] != null ? gr[z] : (gr[z] = this.grenze(i, k, z)));
        for (let oi = i - rK; oi <= i + rK; oi++)
            for (let ok = k - rK; ok <= k + rK; ok++) {
                const o = this.kachel(oi, ok);
                if (!o.stadt) continue;
                const Zo = this.ziele(o), heim = o.K === K, inReihe = ok === k;
                for (let q = 0; q < Zo.D.length; q++) {
                    if (!Zo.n[q]) continue;
                    const di = ki(Zo.D[q]), dk = kk(Zo.D[q]);
                    const werk = Zo.D[q] === K, reihe = inReihe && zw(i, oi, di), spalte = di === i && zw(k, ok, dk);
                    if (!heim && !werk && !reihe && !spalte) continue;
                    const d = this.kachel(di, dk), R = this.route(o, d);
                    let lo = Infinity, hi = -Infinity;
                    const add = (a, b) => {
                        if (a < lo) lo = a;
                        if (b > hi) hi = b;
                    };
                    let lo1, hi1;
                    if (R.quer) {
                        add(-refS - G("quer"), -refS);
                        lo1 = lo;
                        hi1 = hi;
                        lo = Infinity;
                        hi = -Infinity;
                        add(relE, relE + G("quer"));
                    } else {
                        const H1 = this.haupt(o, d, true), H2 = this.haupt(o, d, false), relA = -(H1.T + refS);
                        if (heim) add(relA - G(R.torH) - H1.anlaufT, relA);
                        let w = H1.kach.get(K);
                        if (w) add(relA + w[0], relA + w[1]);
                        if (werk) add(-refS, -refS + G(R.torW) + H1.auslaufT);
                        lo1 = lo;
                        hi1 = hi;
                        lo = Infinity;
                        hi = -Infinity;
                        if (werk) add(relE - G(R.torW) - H2.anlaufT, relE);
                        w = H2.kach.get(K);
                        if (w) add(relE + w[0], relE + w[1]);
                        if (heim) add(relE + H2.T, relE + H2.T + G(R.torH) + H2.auslaufT);
                    }
                    eO.push(o);
                    eD.push(d);
                    eQ.push(q);
                    LO.push(lo1);
                    HI.push(hi1);
                    LO2.push(lo);
                    HI2.push(hi);
                }
            }
        c = { n: eO.length, eO, eD, eQ: Int32Array.from(eQ), LO: Float64Array.from(LO), HI: Float64Array.from(HI), LO2: Float64Array.from(LO2), HI2: Float64Array.from(HI2) };
        this._x.set(K, c);
        this.zaehl.indexMs += Number(process.hrtime.bigint() - tIdx) / 1e6;
        return c;
    }
    // Satz 3 — DIE UMKEHRUNG: welche Wagen fahren zur Uhr t im Kreis (X, Z, R)? Je Kachel des Kreises ihr Index, je Paar die Ränge
    // r aus der Umkehrung von W in O(1) — nur sie werden ausgewertet. Geparkte Wagen zählen nicht als fahrend.
    imKreis(X, Z, R, t) {
        const zaehl = { kacheln: 0, paare: 0, raenge: 0 };
        const rand = R + GV.eckR + 1; // ein Wagen versetzt (Spur, Parkstreifen) steht bis eckR jenseits der Kachel seines Fensters
        const iA = Math.floor((X - rand - this.ox) / M + 0.5), iB = Math.floor((X + rand - this.ox) / M + 0.5);
        const kA = Math.floor((Z - rand - this.oz) / M + 0.5), kB = Math.floor((Z + rand - this.oz) / M + 0.5);
        const streuS = GV.streuH * 3600, wA = GV.werk[0] * 3600 - streuS, R2 = R * R, rand2 = rand * rand;
        const gesehen = new Set(), out = [];
        for (let i = iA; i <= iB; i++)
            for (let k = kA; k <= kB; k++) {
                const m = this.mitte(i, k), cx = Math.max(m.x - M / 2, Math.min(X, m.x + M / 2)), cz = Math.max(m.z - M / 2, Math.min(Z, m.z + M / 2));
                if ((cx - X) * (cx - X) + (cz - Z) * (cz - Z) > rand2) continue;
                zaehl.kacheln++;
                const E = this.index(i, k);
                for (let e = 0; e < E.n; e++) {
                    const o = E.eO[e], Zo = this.ziele(o), q = E.eQ[e], n = Zo.n[q], f = n / (2 * streuS), phi = Zo.phi[q];
                    zaehl.paare++;
                    for (let p = 0; p < 2; p++) {
                        const lo = p ? E.LO2[e] : E.LO[e], hi = p ? E.HI2[e] : E.HI[e];
                        if (!(lo <= hi)) continue;
                        // gesucht: lo ≤ t − W ≤ hi  ⇔  t − hi ≤ W ≤ t − lo;  W = wA + 2·streu·(r + φ)/n
                        let rLo = Math.ceil((t - hi - wA) * f - phi), rHi = Math.floor((t - lo - wA) * f - phi);
                        if (rLo < 0) rLo = 0;
                        if (rHi > n - 1) rHi = n - 1;
                        for (let r = rLo; r <= rHi; r++) {
                            zaehl.raenge++;
                            const fa = this.fahrt(o, E.eD[e], r);
                            if (gesehen.has(fa.id)) continue;
                            const L = this.lage(fa, t);
                            if (L.u < 0) continue;
                            const dx = L.x - X, dz = L.z - Z;
                            if (dx * dx + dz * dz <= R2) {
                                gesehen.add(fa.id);
                                out.push({ f: fa, L });
                            }
                        }
                    }
                }
            }
        out.sort((a, b) => a.f.id - b.f.id);
        return { wagen: out, zaehl };
    }
}

module.exports = { Stadt, GV, FC, KC, hash, u01, key, ki, kk, linie, rund, RUND, punktAuf, normalen, profil, grenzV, profilG, bogenZu, zeitBei, M, MAIN };
