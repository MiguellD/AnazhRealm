// person.cjs — DER PROTOTYP DES PERSONEN-GESETZES (vision/person/gesetz.md §1–§6), nur im Spike, kein Spiel-Code.
// Jede Zahl steht in gesetz.md mit Quelle; was hier zusätzlich steht, gehört der PRÜF-STADT (dem Stellvertreter des Plans) und ist
// als solche benannt. Rein: kein Math.random, keine Wanduhr, kein Speicher je Person — jede Person ist ein Wert ihrer Adresse.
"use strict";
const { laden } = require("./lade.cjs");
const WHO = require("./who-referenz.json");
const { leben: LC, bau: BAU } = laden();
const LG = LC.gesetz();
const G = 9.81; // die Welt-Schwerkraft (zensus b17)

// ── §1 Hash: (Same, a, b, c, d) → u ∈ [0, 1) ─────────────────────────────────────────────────────────────────────────────────────
function fnv(s) {
    let h = 0x811c9dc5;
    for (let i = 0; i < s.length; i++) {
        h ^= s.charCodeAt(i);
        h = Math.imul(h, 0x01000193);
    }
    return h >>> 0;
}
function fmix(h) {
    h ^= h >>> 16;
    h = Math.imul(h, 0x85ebca6b);
    h ^= h >>> 13;
    h = Math.imul(h, 0xc2b2ae35);
    h ^= h >>> 16;
    return h >>> 0;
}
function hz(s, a, b, c, d) {
    let h = fmix(s ^ Math.imul(a | 0, 0x9e3779b1));
    h = fmix((h + Math.imul(b | 0, 0x85ebca6b)) | 0);
    h = fmix(h ^ Math.imul(c | 0, 0xc2b2ae35));
    return fmix((h + Math.imul(d | 0, 0x27d4eb2f)) | 0);
}
const u01 = (s, a, b, c, d) => hz(s, a, b, c, d) / 4294967296;
// Zwecke (der vierte Schlüssel)
const Z = { geschlecht: 1, tod: 2, seg1: 3, seg2: 4, mut1: 5, mut2: 6, e1: 7, e2: 8, gr1: 9, gr2: 10, alter: 11, versatz: 12, bett: 13, herd: 14, werk: 15, platz: 16, gasse: 17, kirche: 18 };
const H_ZWECK = { gewerbe: 21, gruppe: 22, klasse: 23, baujahr: 24, werkDx: 25, werkDz: 26, werkL: 27 };

// ── §2 Hauslauf ─────────────────────────────────────────────────────────────────────────────────────────────────────────────────
const HL = Object.freeze({
    heiratW: 24.5, // Cinnirella et al. 2017
    heiratM: 27, // Wrigley et al. 1997 S. 146 f. (sekundär)
    abstandJ: 924 / 365.25, // Cinnirella et al. 2017
    letzteW: 35.68, // Cinnirella et al. 2017
    pJunge: 105 / 205, // WHO (sekundär)
    auszug: 15, // Kussmaul 1981
    dienstAb: 15, // Kussmaul 1981: 15–24
    dienstSpanne: 10,
});
// Siler (Gurven & Kaplan 2007 Tab. 2, !Kung, über Nachdruck gesehen): h(x) = a1 e^(−b1 x) + a2 + a3 e^(b3 x)
const SILER = Object.freeze({ a1: 0.34, b1: 0.943, a2: 0.01, a3: 3.31e-4, b3: 0.077 });
const SILER_DX = 1 / 64;
const SILER_N = 130 * 64 + 1;
const SILER_H = new Float64Array(SILER_N); // kumulative Gefahr H(x) — eine Tafel der reinen Funktion, kein Zustand
for (let i = 0; i < SILER_N; i++) {
    const x = i * SILER_DX, S = SILER;
    SILER_H[i] = (S.a1 / S.b1) * (1 - Math.exp(-S.b1 * x)) + S.a2 * x + (S.a3 / S.b3) * (Math.exp(S.b3 * x) - 1);
}
function silerH(x) {
    const f = x / SILER_DX, i = Math.min(SILER_N - 2, Math.floor(f));
    return SILER_H[i] + (SILER_H[i + 1] - SILER_H[i]) * (f - i);
}
function silerInv(y) {
    if (y >= SILER_H[SILER_N - 1]) return (SILER_N - 1) * SILER_DX;
    let lo = 0, hi = SILER_N - 1;
    while (hi - lo > 1) {
        const m = (lo + hi) >> 1;
        if (SILER_H[m] <= y) lo = m;
        else hi = m;
    }
    return (lo + (y - SILER_H[lo]) / (SILER_H[hi] - SILER_H[lo])) * SILER_DX;
}

// ── §3 Leib: Art-Daten aus WHO ──────────────────────────────────────────────────────────────────────────────────────────────────
function reifeJ(o) {
    const M19 = o.masseKg[228];
    for (let i = 1; i <= 228; i++)
        if (o.masseKg[i] >= LG.reifeMasse * M19) {
            const a = o.masseKg[i - 1], b = o.masseKg[i];
            return (i - 1 + (LG.reifeMasse * M19 - a) / (b - a)) / 12;
        }
    throw new Error("person: WHO-Masse erreicht die Reife nicht");
}
const ART = [WHO.m, WHO.w].map((o) => ({
    Mbar: o.masseKg[228],
    Hbar: o.hoeheCm[228] / 100,
    h0: o.hoeheCm[0] / 100,
    beta: Math.log(o.hoeheCm[0] / o.hoeheCm[228]) / Math.log(LG.geburtAnteil),
    reifeWHO: reifeJ(o),
}));
const K = LC.reifeS(ART[0].Mbar) / ART[0].reifeWHO; // s je Jahr — der EINE Zeit-Anker der Art (Mann)
const LEIB = Object.freeze({
    bein: 0.53, // Hüfte im Kanon (zensus g13)
    fMus: [0.384, 0.306], // Janssen et al. 2000
    cT: 0.121e6 / 1060, // N·m je kg Strecker: 0,121 N·m/cm³ (PMC7372756) ÷ 1,06 g/cm³
    fQuad: (2 * (244.8 / 0.121) * 1.06) / 33000, // PMC7372756 × Janssen 2000 (33,0 kg)
    hillK: 0.25, // Hill 1938
    omega0: (() => {
        const r = (52.3 / 107.7 + 49.8 / 97.7) / 2; // Cybex 300 °/s (nsj.org.sa 9:165)
        return ((300 * Math.PI) / 180) / ((1 - r) / (1 + r / 0.25));
    })(),
});
function alterskraft(J) {
    if (J <= 50) return 1;
    if (J <= 60) return Math.pow(0.985, J - 50);
    return Math.pow(0.985, 10) * Math.pow(0.97, J - 60);
}
const lebensdauerJ = (M) => LC.lebensdauerS(M) / K;

// ── Person (lazy Erbe) ──────────────────────────────────────────────────────────────────────────────────────────────────────────
// herkunft: 0 Gründer (von außen) · 1 Kind des Hauses · 2 Gesinde. key = (adr, g, slot) bzw. (adr, −1−s, y)
function nv(S, adr, a, b, z1, z2) {
    return [LC.normal(u01(S, adr, a, b, z1), u01(S, adr, a, b, z2))];
}
function erbeA(S, P) {
    if (P._a) return P._a;
    if (P.herkunft === 1) P._a = LC.kind(erbeA(S, P.mutter), erbeA(S, P.vater), nv(S, P.adr, P.g, P.slot, Z.seg1, Z.seg2), nv(S, P.adr, P.g, P.slot, Z.mut1, Z.mut2), null);
    else P._a = LC.gruender(nv(S, P.adr, P.g, P.slot, Z.gr1, Z.gr2));
    return P._a;
}
function masseInf(S, P) {
    if (P._M) return P._M;
    const e = LC.umwelt(nv(S, P.adr, P.g, P.slot, Z.e1, Z.e2));
    P._e = e;
    P._M = LC.masseAdult(ART[P.sex].Mbar, erbeA(S, P), e);
    return P._M;
}
// Tod: Siler, bedingt am Leben bis A0, gedeckelt durch den Alterstod des Leibs
function setzeTod(S, P, A0) {
    const u = u01(S, P.adr, P.g, P.slot, Z.tod);
    let x = silerInv(silerH(A0) - Math.log(1 - u));
    if (x > 40) x = Math.min(x, lebensdauerJ(masseInf(S, P)));
    P.tod = P.geburt + x;
}
function neu(S, adr, g, slot, herkunft, geburt, sex, mutter, vater, A0) {
    const P = { adr, g, slot, herkunft, geburt, sex, mutter, vater, tod: 0, erbe: false, _a: null, _e: null, _M: 0 };
    setzeTod(S, P, A0);
    return P;
}
const sexVon = (S, adr, g, slot) => (u01(S, adr, g, slot, Z.geschlecht) < HL.pJunge ? 0 : 1);

// Der Hauslauf eines Hauses bis zum Jahr Y: Generationen [{T, mann, frau, kinder, erbe}]
function hauslauf(S, adr, T0, Y) {
    const gens = [];
    let T = T0, g = 0;
    let mann = neu(S, adr, 0, 0, 0, T - HL.heiratM, 0, null, null, HL.heiratM);
    let frau = neu(S, adr, 0, 1, 0, T - HL.heiratW, 1, null, null, HL.heiratW);
    for (;;) {
        const kinder = [];
        for (let k = 0; ; k++) {
            const geb = T + (k + 1) * HL.abstandJ;
            if (geb - frau.geburt > HL.letzteW + 1e-9 || frau.tod <= geb || mann.tod <= geb) break;
            kinder.push(neu(S, adr, g, k + 2, 1, geb, sexVon(S, adr, g, k + 2), frau, mann, 0));
        }
        let erbe = null;
        for (const c of kinder) if (c.sex === 0 && c.tod > c.geburt + HL.heiratM) { erbe = c; break; }
        if (!erbe) for (const c of kinder) if (c.sex === 1 && c.tod > c.geburt + HL.heiratW) { erbe = c; break; }
        if (erbe) erbe.erbe = true;
        gens.push({ g, T, mann, frau, kinder, erbe });
        // die nächste Generation
        let Tn, mn, fn;
        if (erbe && erbe.sex === 0) {
            Tn = erbe.geburt + HL.heiratM;
            mn = erbe;
            fn = neu(S, adr, g + 1, 1, 0, Tn - HL.heiratW, 1, null, null, HL.heiratW);
        } else if (erbe) {
            Tn = erbe.geburt + HL.heiratW;
            fn = erbe;
            mn = neu(S, adr, g + 1, 0, 0, Tn - HL.heiratM, 0, null, null, HL.heiratM);
        } else {
            Tn = Math.max(mann.tod, frau.tod);
            mn = neu(S, adr, g + 1, 0, 0, Tn - HL.heiratM, 0, null, null, HL.heiratM);
            fn = neu(S, adr, g + 1, 1, 0, Tn - HL.heiratW, 1, null, null, HL.heiratW);
        }
        if (Tn > Y) break;
        T = Tn;
        g++;
        mann = mn;
        frau = fn;
    }
    return gens;
}

// Bewohner zur Zeit Y mit Rolle: "vater" "mutter" "alt" "erbe" "kind" "klein" "gesinde"
function bewohner(S, stadt, adr, Y) {
    const H = stadt.haus(adr);
    if (H.sonderbau) return [];
    const gens = hauslauf(S, adr, H.baujahr, Y);
    const out = [];
    if (gens[0].T > Y) return out; // noch nicht gegründet
    let gc = 0;
    for (const x of gens) if (x.T <= Y) gc = x.g;
    for (const x of gens) {
        if (x.T > Y) continue;
        for (const P of [x.mann, x.frau]) {
            if (P.herkunft !== 0) continue; // der Erbe zählt als Kind seines Hauses
            if (Y >= x.T && Y < P.tod) out.push(P);
        }
        for (const c of x.kinder) {
            if (Y < c.geburt || Y >= c.tod) continue;
            if (!c.erbe && Y >= c.geburt + HL.auszug) continue;
            out.push(c);
        }
    }
    const cur = gens[gc];
    for (const P of out) {
        const J = Y - P.geburt;
        if (P === cur.mann) P.rolle = "vater";
        else if (P === cur.frau) P.rolle = "mutter";
        else if (P.herkunft === 0 || gens.some((x) => x.g < gc && (x.mann === P || x.frau === P))) P.rolle = "alt";
        else if (J < 6) P.rolle = "klein";
        else if (J < HL.auszug) P.rolle = "kind";
        else P.rolle = "erbe";
    }
    // Gesinde des Dienstjahres (Plätze aus dem Bau-Gesetz)
    const y = Math.floor(Y);
    for (let s = 0; s < H.gesinde; s++) {
        const alter = HL.dienstAb + HL.dienstSpanne * u01(S, adr, -1 - s, y, Z.alter);
        const P = { adr, g: -1 - s, slot: y, herkunft: 2, geburt: y - alter, sex: sexVon(S, adr, -1 - s, y), mutter: null, vater: null, tod: Infinity, erbe: false, _a: null, _e: null, _M: 0, rolle: "gesinde" };
        out.push(P);
    }
    for (const P of out) P.haus = H;
    return out;
}
const personId = (P) => P.adr + "." + P.g + "." + P.slot;

// ── §3 Leib zur Zeit Y ──────────────────────────────────────────────────────────────────────────────────────────────────────────
function leib(S, P, Y) {
    const J = Y - P.geburt;
    const A = ART[P.sex], Minf = masseInf(S, P);
    const m = LC.masseZurZeit(Minf, J * K);
    const w = m / Minf;
    const H = A.Hbar * Math.cbrt(Minf / A.Mbar) * Math.pow(w, A.beta);
    const L = LEIB.bein * H;
    const mMus = LEIB.fMus[P.sex] * m;
    const phi = alterskraft(J);
    return { J, sex: P.sex, Minf, m, w, H, L, mMus, phi, T0: LEIB.cT * LEIB.fQuad * mMus * phi };
}

// ── §4 Regler ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────
// Gang: Froude 0,25 (Kram 1997, Schepens 2004); Schritt nach Alexander 1976: λ/L = 2,3 (v²/gL)^0,3, Schritt = λ/2
const GANG = Object.freeze({ froude: 0.25, alexA: 2.3, alexB: 0.3 });
function gang(B) {
    const v = Math.sqrt(GANG.froude * G * B.L);
    const schritt = 0.5 * B.L * GANG.alexA * Math.pow((v * v) / (G * B.L), GANG.alexB);
    return { v, schritt, frequenz: v / schritt };
}
// Der Stoß: n Beine, Knie-Start φs, Richtung θ (vom Boden). Zwei-Glied-Bein (Alexander 1995), Hill-Knie.
function stoss(B, n, phiS, theta, dt) {
    const L = B.L, l = L / 2, m = B.m, T0n = (n * B.T0) / 2, w0 = LEIB.omega0, k = LEIB.hillK, gs = G * Math.sin(theta);
    const h = dt || 1e-4;
    let ell = L * Math.sin(phiS / 2), v = 0, t = 0, imp = 0;
    const ell0 = ell;
    for (let i = 0; i < 2e6; i++) {
        const s = ell / L;
        if (s >= 0.99995) break;
        const arm = l * Math.sqrt(1 - s * s);
        const x = v / arm / w0;
        if (x >= 1) break;
        const F = (T0n * (1 - x)) / (1 + x / k) / arm;
        const a = F / m - gs;
        if (a <= 0 && v <= 0) return { v: 0, ell0, ellEnd: ell0, t: 0, Fmittel: 0 };
        v += a * h;
        ell += v * h;
        t += h;
        imp += F * h;
    }
    return { v, ell0, ellEnd: ell, t, Fmittel: t > 0 ? imp / t : 0 };
}
const GRAD = Math.PI / 180;
function standSprung(B) {
    let best = { weite: 0 };
    for (let p = 30; p <= 175; p += 5)
        for (let th = 15; th <= 85; th += 2.5) {
            const r = stoss(B, 2, p * GRAD, th * GRAD);
            if (r.v <= 0) continue;
            const c = Math.cos(th * GRAD), s = Math.sin(th * GRAD), vz = r.v * s;
            const tf = (vz + Math.sqrt(vz * vz + 2 * G * (r.ellEnd - r.ell0) * s)) / G;
            const weite = (r.ellEnd - r.ell0) * c + r.v * c * tf;
            if (weite > best.weite) best = { weite, phiS: p, theta: th, v: r.v };
        }
    return best;
}
function hochSprung(B) {
    let best = { hoehe: 0 };
    for (let p = 30; p <= 175; p += 5) {
        const r = stoss(B, 2, p * GRAD, 90 * GRAD);
        const hoehe = r.ellEnd - r.ell0 + (r.v * r.v) / (2 * G);
        if (hoehe > best.hoehe) best = { hoehe, phiS: p };
    }
    return best;
}
// Sprint: Weyand et al. 2000; L_c und t_sw aus Weyands Zahlen beim WHO-Mann (Beinlänge L_ref), skaliert mit L und √(L/g)
const WEYAND = Object.freeze({ vMitte: (6.2 + 11.1) / 2, tAer: 0.12, tSw: 0.35 });
const L_REF = LEIB.bein * ART[0].Hbar;
const KAPPA_C = (WEYAND.vMitte * (WEYAND.tSw - 2 * WEYAND.tAer)) / L_REF;
const TAU_SW = WEYAND.tSw / Math.sqrt(L_REF / G);
function beinKraft(B) {
    // die mittlere Kraft des einbeinigen senkrechten Stoßes, beim Knie-Start, der den Abflug maximiert
    let best = { v: -1 };
    for (let p = 30; p <= 175; p += 5) {
        const r = stoss(B, 1, p * GRAD, 90 * GRAD);
        if (r.v > best.v) best = { v: r.v, phiS: p, Fmittel: r.Fmittel, t: r.t };
    }
    return best;
}
function sprint(B) {
    const bk = beinKraft(B);
    const FW = bk.Fmittel / (B.m * G);
    if (!(FW > 1)) return { vTop: 0, t100: Infinity, FW };
    const Lc = KAPPA_C * B.L, tSw = TAU_SW * Math.sqrt(B.L / G);
    const vTop = (Lc * (2 * FW - 1)) / tSw;
    const a0 = (G * Math.sqrt(FW * FW - 1)) / FW; // Tastgrad W/F (Impuls-Bilanz) × waagrechter Anteil
    const tau = vTop / a0;
    // Furusawa et al. 1927: v = V(1 − e^(−t/τ)), Weg = V(t − τ(1 − e^(−t/τ))) = 100
    let t = 100 / vTop + tau;
    for (let i = 0; i < 50; i++) {
        const f = vTop * (t - tau * (1 - Math.exp(-t / tau))) - 100, df = vTop * (1 - Math.exp(-t / tau));
        const dtn = f / df;
        t -= dtn;
        if (Math.abs(dtn) < 1e-12) break;
    }
    return { vTop, t100: t, FW, tau, a0, Lc, tSw };
}
// Weitsprung: Stemmen — starre Strebe unter α vor der Hüfte, unelastisch; Absprung quer zum Bein, Flug auf Absprunghöhe
function weitSprung(B) {
    const sp = sprint(B);
    let best = { weite: 0 };
    for (let a = 1; a <= 89; a += 0.5) {
        const al = a * GRAD, vq = sp.vTop * Math.cos(al);
        const weite = (vq * vq * Math.sin(2 * al)) / G;
        if (weite > best.weite) best = { weite, alpha: a, vAbsprung: vq };
    }
    return best;
}
// Wurf: kein Primitiv (gesetz.md §4) — der Regler trägt ihn nicht
function wurf() {
    return null;
}

// ── PRÜF-STADT (Stellvertreter des Plans, KEIN Gesetz) ────────────────────────────────────────────────────────────────────────────
// Los = BAU_GESETZ.hofstaette (15 × 30 m); Block 2 Reihen × 8 Lose; Gasse 8 m; Viertel 3 × 3 Blöcke, der mittlere ist Platz + Kirche.
// Gewerbe nach GEWERBE_ANTEIL.stadt, Klasse nach BAU_GESETZ.klasse, Baujahr 1300–1650, Werk-Los des Tagelöhners ±2 Blöcke: Prüf-Werte.
const LB = BAU.BAU_GESETZ.hofstaette[0], LT = BAU.BAU_GESETZ.hofstaette[1], GASSE = 8;
const BX = 8 * LB + GASSE, BZ = 2 * LT + GASSE, QX = 3 * BX, QZ = 3 * BZ;
const ZELLEN = [0, 1, 2, 3, 5, 6, 7, 8];
const ZELLE_B = [0, 1, 2, 3, -1, 4, 5, 6, 7];
function machStadt(S, QW, QH) {
    const lose = QW * QH * 128;
    const anteil = BAU.GEWERBE_ANTEIL.stadt, gruppen = Object.keys(anteil);
    const hausCache = new Map(); // nur ein Rechen-Puffer je Lauf (reine Funktion, jederzeit verwerfbar)
    function geo(adr) {
        const q = Math.floor(adr / 128), b = (adr >> 4) & 7, l = adr & 15;
        const qx = q % QW, qz = Math.floor(q / QW), cell = ZELLEN[b], bi = cell % 3, bj = Math.floor(cell / 3);
        const x0 = qx * QX + bi * BX + GASSE / 2, z0 = qz * QZ + bj * BZ + GASSE / 2, r = l >> 3, c = l & 7;
        const lx = x0 + LB * c, lz = z0 + LT * r;
        const dz = r === 0 ? lz : lz + LT, sz = r === 0 ? lz - GASSE / 2 : lz + LT + GASSE / 2;
        return { q, qx, qz, bgx: qx * 3 + bi, bgz: qz * 3 + bj, r, lx, lz, x1: lx + LB, z1: lz + LT, door: { x: lx + LB / 2, z: dz }, street: { x: lx + LB / 2, z: sz } };
    }
    function haus(adr) {
        let H = hausCache.get(adr);
        if (H) return H;
        let acc = 0, gr = gruppen[gruppen.length - 1];
        const ug = u01(S, adr, 0, 0, H_ZWECK.gruppe);
        for (const x of gruppen) {
            acc += anteil[x];
            if (ug < acc) {
                gr = x;
                break;
            }
        }
        const liste = BAU.GRUPPE_GEWERBE[gr];
        const gewerbe = liste[Math.floor(u01(S, adr, 0, 0, H_ZWECK.gewerbe) * liste.length)];
        const uk = u01(S, adr, 0, 0, H_ZWECK.klasse), kl = BAU.BAU_GESETZ.klasse;
        const klasse = uk < kl[0] ? 0 : uk < kl[1] ? 1 : 2;
        const hh = BAU.haushalt(gewerbe, klasse);
        H = { adr, gewerbe, klasse, gesinde: hh.gesinde, baujahr: 1300 + 350 * u01(S, adr, 0, 0, H_ZWECK.baujahr), sonderbau: false, geo: geo(adr) };
        H.werkAdr = gewerbe === "tageloehner" ? werkLos(adr, H.geo) : adr;
        hausCache.set(adr, H);
        return H;
    }
    function adrVon(bgx, bgz, l) {
        const qx = Math.floor(bgx / 3), qz = Math.floor(bgz / 3), bi = bgx - qx * 3, bj = bgz - qz * 3;
        const b = ZELLE_B[bj * 3 + bi];
        if (b < 0 || qx < 0 || qz < 0 || qx >= QW || qz >= QH) return -1;
        return (qz * QW + qx) * 128 + b * 16 + l;
    }
    function werkLos(adr, g) {
        for (let i = 0; i < 16; i++) {
            const dx = Math.floor(u01(S, adr, i, 0, H_ZWECK.werkDx) * 5) - 2, dz = Math.floor(u01(S, adr, i, 0, H_ZWECK.werkDz) * 5) - 2;
            const a = adrVon(g.bgx + dx, g.bgz + dz, Math.floor(u01(S, adr, i, 0, H_ZWECK.werkL) * 16));
            if (a >= 0) return a;
        }
        return adr;
    }
    function viertelMitte(q) {
        const qx = q % QW, qz = Math.floor(q / QW);
        const x0 = qx * QX + BX + GASSE / 2, z0 = qz * QZ + BZ + GASSE / 2, cx = x0 + 4 * LB;
        return {
            platz: { p: { x: cx, z: z0 + LT / 2 }, door: { x: cx, z: z0 }, street: { x: cx, z: z0 - GASSE / 2 } },
            kirche: { p: { x: cx, z: z0 + LT * 1.5 }, door: { x: cx, z: z0 + 2 * LT }, street: { x: cx, z: z0 + 2 * LT + GASSE / 2 } },
            rect: [qx * QX, qz * QZ, (qx + 1) * QX, (qz + 1) * QZ],
        };
    }
    // alle Lose, deren Rechteck den Kreis (c, R) berührt
    function loseImKreis(cx, cz, R, f) {
        const bx0 = Math.max(0, Math.floor((cx - R) / BX)), bx1 = Math.min(QW * 3 - 1, Math.floor((cx + R) / BX));
        const bz0 = Math.max(0, Math.floor((cz - R) / BZ)), bz1 = Math.min(QH * 3 - 1, Math.floor((cz + R) / BZ));
        for (let bz = bz0; bz <= bz1; bz++)
            for (let bx = bx0; bx <= bx1; bx++)
                for (let l = 0; l < 16; l++) {
                    const a = adrVon(bx, bz, l);
                    if (a < 0) continue;
                    const g = geo(a);
                    const dx = Math.max(g.lx - cx, 0, cx - g.x1), dz = Math.max(g.lz - cz, 0, cz - g.z1);
                    if (dx * dx + dz * dz <= R * R) f(a);
                }
    }
    return { S, QW, QH, lose, geo, haus, viertelMitte, loseImKreis, adrVon, breite: QW * QX, tiefe: QH * QZ };
}

// ── §5 Tag: Ort(t) ──────────────────────────────────────────────────────────────────────────────────────────────────────────────
const TAG = Object.freeze({ wach: 6.5, platzMorgen: 7, werk: 8, mahl: 12, werk2: 13, feierabend: 17, abend: 18, abendDauer: 0.75, ruhe: 22, markt: 9, marktDauer: 1, gasse: 14, gasseBis: 17, altPlatz: 15, altDauer: 0.75, kirche: 9, kircheDauer: 1.5, versatz: 0.5 });
const tagVon = (Y) => (Y - 1700) * 365.25;
const jahrVon = (d, h) => 1700 + (d + h / 24) / 365.25;
function versatz(S, P, d) {
    return (2 * u01(S, P.adr, P.g * 1024 + (P.slot & 1023), d, Z.versatz) - 1) * TAG.versatz;
}
function off(S, P, z, ax, az) {
    return { x: (2 * u01(S, P.adr, P.g, P.slot, z) - 1) * ax, z: (2 * u01(S, P.adr, P.slot, P.g, z) - 1) * az };
}
// die Orte einer Person: {p, door, street, los, innen}
function orte(S, stadt, P) {
    if (P._orte) return P._orte;
    const H = P.haus, g = H.geo, vm = stadt.viertelMitte(g.q);
    const mitteX = (g.lx + g.x1) / 2, hinten = g.r === 0 ? g.lz + 22 : g.lz + 8, vorn = g.r === 0 ? g.lz + 6 : g.lz + LT - 6;
    const o1 = off(S, P, Z.bett, 5, 4), o2 = off(S, P, Z.herd, 2, 2), o3 = off(S, P, Z.werk, 5, 3), o4 = off(S, P, Z.platz, 10, 6), o5 = off(S, P, Z.gasse, 5, 2), o6 = off(S, P, Z.kirche, 12, 8);
    const imLos = (p) => ({ p, door: g.door, street: g.street, los: H.adr, innen: true });
    let werk;
    if (H.werkAdr === H.adr || P.rolle === "gesinde") werk = imLos({ x: mitteX + o3.x, z: vorn + o3.z });
    else {
        const wg = stadt.haus(H.werkAdr).geo, wv = wg.r === 0 ? wg.lz + 6 : wg.lz + LT - 6;
        werk = { p: { x: (wg.lx + wg.x1) / 2 + o3.x, z: wv + o3.z }, door: wg.door, street: wg.street, los: H.werkAdr, innen: true };
    }
    P._orte = {
        bett: imLos({ x: mitteX + o1.x, z: hinten + o1.z }),
        herd: imLos({ x: mitteX + o2.x, z: (g.lz + g.z1) / 2 + o2.z }),
        werk,
        gasse: { p: { x: g.street.x + o5.x, z: g.street.z + o5.z }, door: g.street, street: g.street, los: -1, innen: false },
        platz: { p: { x: vm.platz.p.x + o4.x, z: vm.platz.p.z + o4.z }, door: vm.platz.door, street: vm.platz.street, los: -2 - g.q, innen: true },
        kirche: { p: { x: vm.kirche.p.x + o6.x, z: vm.kirche.p.z + o6.z }, door: vm.kirche.door, street: vm.kirche.street, los: -2 - g.q, innen: true },
    };
    return P._orte;
}
function route(A, B) {
    if (A.los === B.los && A.innen && B.innen) return [A.p, B.p];
    if (A.street.z === B.street.z) return [A.p, A.door, A.street, B.street, B.door, B.p];
    const xv = Math.round(B.street.x / BX) * BX;
    return [A.p, A.door, A.street, { x: xv, z: A.street.z }, { x: xv, z: B.street.z }, B.street, B.door, B.p];
}
function laenge(R) {
    let s = 0;
    for (let i = 1; i < R.length; i++) s += Math.hypot(R[i].x - R[i - 1].x, R[i].z - R[i - 1].z);
    return s;
}
function aufRoute(R, s) {
    for (let i = 1; i < R.length; i++) {
        const d = Math.hypot(R[i].x - R[i - 1].x, R[i].z - R[i - 1].z);
        if (s <= d) {
            const f = d > 0 ? s / d : 0;
            return { x: R[i - 1].x + (R[i].x - R[i - 1].x) * f, z: R[i - 1].z + (R[i].z - R[i - 1].z) * f };
        }
        s -= d;
    }
    return R[R.length - 1];
}
// der Plan eines Tages: [[Stunde, Ort-Name]], beginnend mit [0, "bett"]
function plan(P, d, dl) {
    const T = TAG, son = ((d % 7) + 7) % 7 === 0, r = P.rolle, e = [[0, "bett"], [T.wach + dl, "herd"]];
    const arbeiter = r === "vater" || r === "erbe" || r === "gesinde";
    if (r === "klein") {
        // im Haus
    } else if (son) {
        e.push([T.kirche + dl, "kirche"], [T.kirche + T.kircheDauer + dl, "herd"]);
        if (arbeiter) e.push([T.abend + dl, "platz"], [T.abend + T.abendDauer + dl, "herd"]);
    } else if (arbeiter) {
        e.push([T.platzMorgen + dl, "platz"], [T.werk + dl, "werk"], [T.mahl + dl, "herd"], [T.werk2 + dl, "werk"], [T.feierabend + dl, "herd"], [T.abend + dl, "platz"], [T.abend + T.abendDauer + dl, "herd"]);
    } else if (r === "mutter") e.push([T.markt + dl, "platz"], [T.markt + T.marktDauer + dl, "herd"]);
    else if (r === "kind") e.push([T.gasse + dl, "gasse"], [T.gasseBis + dl, "herd"]);
    else if (r === "alt") e.push([T.altPlatz + dl, "platz"], [T.altPlatz + T.altDauer + dl, "herd"]);
    e.push([T.ruhe + dl, "bett"]);
    return e;
}
const V_MIN = 1.0; // Schranke für die Abkürzung „angekommen“ (geprüft: jeder Gehende ist schneller, sonst wirft tempo())
function tempo(S, P, Y) {
    if (P._v) return P._v;
    const v = gang(leib(S, P, Y)).v;
    if (!(v >= V_MIN)) throw new Error("person: Gehtempo " + v + " < V_MIN bei " + personId(P));
    P._v = v;
    return v;
}
// Ort(t) — d = Tag seit 1700-01-01, h = Stunde
function ort(S, stadt, P, d, h) {
    const O = orte(S, stadt, P), e = plan(P, d, versatz(S, P, d));
    let i = 0;
    while (i + 1 < e.length && e[i + 1][0] <= h) i++;
    const ziel = O[e[i][1]];
    if (i === 0) return { x: ziel.p.x, z: ziel.p.z, ort: e[i][1], weg: false };
    const von = O[e[i - 1][1]], R = route(von, ziel), len = laenge(R), dt = (h - e[i][0]) * 3600;
    if (dt * V_MIN >= len) return { x: ziel.p.x, z: ziel.p.z, ort: e[i][1], weg: false };
    const v = tempo(S, P, jahrVon(d, h));
    if (dt * v >= len) return { x: ziel.p.x, z: ziel.p.z, ort: e[i][1], weg: false };
    const p = aufRoute(R, dt * v);
    return { x: p.x, z: p.z, ort: e[i][1], weg: true };
}

// ── §6 Die Abfrage und der Sack-Scan ────────────────────────────────────────────────────────────────────────────────────────────
const RAND = 1.0; // h: Versatz 0,5 + Weg (≤ 0,25 h bei ≥ 1 m/s über ≤ 800 m) — weit gezogen; die Treue prüft der Sack-Scan
function inFenster(h, a, b) {
    return h >= a - RAND && h <= b + RAND;
}
function viertelFenster(d, h) {
    const T = TAG, son = ((d % 7) + 7) % 7 === 0;
    if (son) return inFenster(h, T.kirche, T.kirche + T.kircheDauer) || inFenster(h, T.abend, T.abend + T.abendDauer);
    return inFenster(h, T.platzMorgen, T.werk) || inFenster(h, T.markt, T.markt + T.marktDauer) || inFenster(h, T.altPlatz, T.altPlatz + T.altDauer) || inFenster(h, T.abend, T.abend + T.abendDauer);
}
function rechteckKreis(x0, z0, x1, z1, cx, cz, r) {
    const dx = Math.max(x0 - cx, 0, cx - x1), dz = Math.max(z0 - cz, 0, cz - z1);
    return dx * dx + dz * dz <= r * r;
}
function abfrage(stadt, cx, cz, r, d, h) {
    const S = stadt.S, Y = jahrVon(d, h), kand = new Set();
    if (r > 200) throw new Error("abfrage: r > 200 m sprengt die Schranke der Tagelöhner-Suche");
    stadt.loseImKreis(cx, cz, r + 6, (a) => kand.add(a)); // 1. Wohnen + Gasse
    if (viertelFenster(d, h)) {
        // 2. alle Häuser der Viertel, die den Kreis berühren
        const q0x = Math.max(0, Math.floor((cx - r) / QX)), q1x = Math.min(stadt.QW - 1, Math.floor((cx + r) / QX));
        const q0z = Math.max(0, Math.floor((cz - r) / QZ)), q1z = Math.min(stadt.QH - 1, Math.floor((cz + r) / QZ));
        for (let qz = q0z; qz <= q1z; qz++) for (let qx = q0x; qx <= q1x; qx++) for (let i = 0; i < 128; i++) kand.add((qz * stadt.QW + qx) * 128 + i);
    }
    const son = ((d % 7) + 7) % 7 === 0;
    if (!son && h >= TAG.platzMorgen - RAND && h <= TAG.abend + TAG.abendDauer + RAND) {
        // 3. Tagelöhner, deren Weg-Rechteck (Heim, Platz, Werk) ± ein Block den Kreis berührt
        const qcx = Math.floor(cx / QX), qcz = Math.floor(cz / QZ);
        for (let qz = Math.max(0, qcz - 2); qz <= Math.min(stadt.QH - 1, qcz + 2); qz++)
            for (let qx = Math.max(0, qcx - 2); qx <= Math.min(stadt.QW - 1, qcx + 2); qx++)
                for (let i = 0; i < 128; i++) {
                    const a = (qz * stadt.QW + qx) * 128 + i;
                    const H = stadt.haus(a);
                    if (H.werkAdr === a) continue;
                    const g = H.geo, w = stadt.haus(H.werkAdr).geo, vm = stadt.viertelMitte(g.q).platz.p;
                    const x0 = Math.min(g.lx, w.lx, vm.x) - BX, x1 = Math.max(g.x1, w.x1, vm.x) + BX;
                    const z0 = Math.min(g.lz, w.lz, vm.z) - BZ, z1 = Math.max(g.z1, w.z1, vm.z) + BZ;
                    if (rechteckKreis(x0, z0, x1, z1, cx, cz, r)) kand.add(a);
                }
    }
    const treffer = [];
    for (const a of kand) {
        for (const P of bewohner(S, stadt, a, Y)) {
            const o = ort(S, stadt, P, d, h);
            if ((o.x - cx) * (o.x - cx) + (o.z - cz) * (o.z - cz) <= r * r) treffer.push(P);
        }
    }
    return { treffer, kandidaten: kand.size };
}
function sackScan(stadt, cx, cz, r, d, h) {
    const S = stadt.S, Y = jahrVon(d, h), treffer = [];
    for (let a = 0; a < stadt.lose; a++)
        for (const P of bewohner(S, stadt, a, Y)) {
            const o = ort(S, stadt, P, d, h);
            if ((o.x - cx) * (o.x - cx) + (o.z - cz) * (o.z - cz) <= r * r) treffer.push(P);
        }
    return treffer;
}

module.exports = {
    LC, BAU, G, ART, K, LEIB, HL, SILER, GANG, WEYAND, KAPPA_C, TAU_SW, TAG, Z,
    fnv, u01, silerH, silerInv, lebensdauerJ, alterskraft,
    hauslauf, bewohner, personId, masseInf, erbeA, leib,
    gang, stoss, standSprung, hochSprung, beinKraft, sprint, weitSprung, wurf,
    machStadt, orte, plan, route, laenge, ort, tempo, versatz, tagVon, jahrVon,
    abfrage, sackScan, geoKonst: { LB, LT, GASSE, BX, BZ, QX, QZ },
};
