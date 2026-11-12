// WEGWERF-SPIKE (w28-samen-fahrzeug) — DER KANDIDAT: die Haut als EINE geschlossene Fläche aus Schnitten.
// Heute (vehicle-core.js buildSkin): ~250 dünne Platten auf den Ebenen eines Quaders, danach verbogen (taperBody · bowEnds).
// Hier: Stationen längs x, je Station EIN Schnitt mit fester Punkt-Folge (Boden · Schweller · Flanke · Schulter · Absatz ·
// Glas · Dachholm · Dachrinne · Scheitel); jede Kante ist ein Punkt der Folge mit Verrundung, jede Fuge eine Gitter-Linie,
// das Glas eine Zone derselben Fläche, der Radlauf ein Kreis um die Nabe. Maße: dieselben P des Rezepts, `derive`,
// `wheelClearance`, `crossSection` (Coke-Grundriss), Räder und Sitze aus dem Kern.

const sst = (a, b, x) => {
    const t = Math.max(0, Math.min(1, (x - a) / (b - a)));
    return t * t * (3 - 2 * t);
};
const lerp = (a, b, t) => a + (b - a) * t;

// Die verrundete Punkt-Folge: pts [[z, y]…], a[i] die Schnittweite der Ecke i (m), nSeg[i] Zellen der Geraden i → i+1,
// nArc[i] Zellen der Ecke i. Feste Zahl von Punkten, egal wie die Maße stehen (eine Ecke ohne Platz fällt in sich zusammen).
function rund(pts, a, nSeg, nArc) {
    const n = pts.length,
        A = [],
        B = [];
    for (let i = 0; i < n; i++) {
        if (i === 0 || i === n - 1 || !a[i] || !nArc[i]) {
            A.push(pts[i]);
            B.push(pts[i]);
            continue;
        }
        const p = pts[i],
            q = pts[i - 1],
            r = pts[i + 1];
        const l0 = Math.hypot(p[0] - q[0], p[1] - q[1]),
            l1 = Math.hypot(r[0] - p[0], r[1] - p[1]);
        const c = Math.min(a[i], 0.45 * l0, 0.45 * l1);
        A.push(l0 > 1e-9 ? [p[0] + ((q[0] - p[0]) / l0) * c, p[1] + ((q[1] - p[1]) / l0) * c] : p);
        B.push(l1 > 1e-9 ? [p[0] + ((r[0] - p[0]) / l1) * c, p[1] + ((r[1] - p[1]) / l1) * c] : p);
    }
    const out = [];
    for (let i = 0; i < n; i++) {
        const k = nArc[i] || 0;
        if (i > 0 && i < n - 1 && k) {
            for (let s = 0; s <= k; s++) {
                const t = s / k,
                    u = 1 - t;
                out.push([u * u * A[i][0] + 2 * u * t * pts[i][0] + t * t * B[i][0], u * u * A[i][1] + 2 * u * t * pts[i][1] + t * t * B[i][1]]);
            }
        } else out.push(pts[i]);
        if (i < n - 1) for (let s = 1; s < nSeg[i]; s++) out.push([lerp(B[i][0], A[i + 1][0], s / nSeg[i]), lerp(B[i][1], A[i + 1][1], s / nSeg[i])]);
    }
    return out;
}
// der Index des ersten Punkts der Ecke i in der Ausgabe von `rund`
function eckIndex(nSeg, nArc, n) {
    const ix = [];
    let k = 0;
    for (let i = 0; i < n; i++) {
        ix.push(k);
        const arc = i > 0 && i < n - 1 ? nArc[i] || 0 : 0;
        k += arc; // Ecke: arc Zellen
        if (i < n - 1) k += nSeg[i];
    }
    return ix;
}

export function bauKandidat(THREE, VC, rezept, seed, opt) {
    opt = opt || {};
    const pre = VC.PRESETS[rezept];
    const P = Object.assign({}, VC.DEFAULT_P, VC.BASE_P, pre.s, pre.fx);
    const D = VC.derive(P),
        H = VC.hardpoints(P),
        S = VC.scal(H, P),
        M = VC.materials();
    const lack = VC.lackStoff(VC.lackIndex(seed));
    const { noseX, tailX, cowlX, roofF, roofR, backX, fAx, rAx } = D;
    const hz = P.spur / 2,
        bw = hz + 0.13,
        R = P.radR,
        yBelt = P.guertel,
        yRoof = P.dach;
    const G = 0.004, // halbe Fugen-Breite (Fuge 8 mm)
        GT = 0.007; // Fugen-Tiefe
    const xN = noseX + 0.12,
        xT = tailX - 0.13, // die Spitzen: der Kern wölbt Bug und Heck 0,13–0,15 m über die Stationen (`gestaltMass`)
        Ln = 0.4,
        Lt = 0.34;
    const zIn0 = hz - 0.16; // Innenkante des Reifens (der Radkasten endet dort)
    const yb0 = P.fahrhoehe + 0.03; // Unterkante der Haut = die Bodenfreiheit, die die Lehre misst (heute: fahrhoehe + 0,18)
    const hoodDrop = Math.min(0.18, (noseX - cowlX) * 0.22),
        yNose = yBelt - hoodDrop;
    const tueren = P.tueren || 2;

    // ── die Oberlinie (Seitenriss des Dachholms): Schlüsselpunkte des Kerns, Ecken verrundet ──
    const steil = (P.heck || "stufe") === "steil";
    const top = rund(
        [
            [xT, yBelt - 0.1],
            [Math.min(backX, roofR - 0.05), yBelt + 0.01],
            [roofR, yRoof],
            [roofF, yRoof],
            [cowlX, yBelt + 0.005],
            [xN, yNose - 0.03],
        ],
        [0, steil ? 0.03 : 0.1, 0.16, 0.22, 0.09, 0],
        [8, 8, 8, 8, 8],
        [0, 6, 8, 8, 6, 0]
    );
    const yT0 = (x) => {
        if (x <= top[0][0]) return top[0][1];
        for (let i = 1; i < top.length; i++)
            if (x <= top[i][0]) {
                const w = top[i][0] - top[i - 1][0];
                return w < 1e-9 ? top[i][1] : lerp(top[i - 1][1], top[i][1], (x - top[i - 1][0]) / w);
            }
        return top[top.length - 1][1];
    };
    // ── der Radlauf: ein Kreis um die Nabe, Spalt = der Freigang aus der Fahrphysik des Kerns ──
    const RAD = [
        [fAx, true],
        [rAx, false],
    ].map(([ax, front]) => ({ ax, yh: R, Ra: R + Math.max(0.035, Math.min(0.07, VC.wheelClearance(P, ax, front).gap)) + 0.005 }));
    const radOben = (x) => {
        let y = 0;
        for (const r of RAD) {
            const d = Math.abs(x - r.ax);
            if (d < r.Ra + 0.05) y = Math.max(y, r.yh + Math.sqrt((r.Ra + 0.05) ** 2 - d * d));
        }
        return y;
    };
    const kappe = (x) => {
        let c = 1;
        if (x > xN - Ln) c = Math.pow(Math.max(0, 1 - Math.pow((x - (xN - Ln)) / Ln, 2.6)), 1 / 2.6);
        if (x < xT + Lt) c = Math.pow(Math.max(0, 1 - Math.pow((xT + Lt - x) / Lt, 3.2)), 1 / 3.2);
        return c;
    };
    // Fugen und Zonen längs x
    const dFx = Math.min(cowlX - 0.02, fAx - RAD[0].Ra - 0.07),
        dBx = P.kabineMitte,
        dRx = tueren >= 4 ? Math.max(backX + 0.1, rAx + RAD[1].Ra + 0.07) : null;
    const tuerEnde = tueren >= 4 ? dRx : dBx - 0.9 > rAx + RAD[1].Ra + 0.07 ? dBx - 0.9 : rAx + RAD[1].Ra + 0.07;
    const xHoodR = cowlX + 0.06,
        xHoodF = xN - 0.3;

    // ── EIN Schnitt an der Station x: die feste Punkt-Folge (halb, z ≥ 0), unten Mitte → oben Mitte ──
    const NSEG = [2, 1, 1, 1, 1, 6, 1, 3, 1, 1, 1, 1, 5],
        NARC = [0, 0, 2, 0, 0, 0, 2, 1, 0, 3, 0, 0, 0, 0];
    const EI = eckIndex(NSEG, NARC, 14);
    const J = { c1: EI[1], c2: EI[2], r0: EI[4], c4: EI[6], c5: EI[7] + 1, c6: EI[8], c7: EI[9], d0: EI[11], dP: EI[12], ende: EI[13] };
    function schnitt(x) {
        const c = kappe(x);
        const zx = VC.crossSection(yBelt, x, S, P); // der Coke-Grundriss des Kerns (am Gürtel: reine Grundriss-Zahl)
        const wB = bw * zx;
        const yb = yb0 + 0.1 * sst(xN - 0.5, xN, x) + 0.13 * sst(xT + 0.45, xT, x);
        let yT = yT0(x);
        const k = Math.max(0, Math.min(1, (yT - yBelt - 0.03) / 0.14)); // 0 = Haube/Deck, 1 = Glashaus
        let ySh = Math.min(yBelt, yT - 0.045 * (1 - k));
        {
            const ro = radOben(x) + 0.035; // weiches Maximum: der Kotflügel hebt sich über dem Rad ohne Knick
            if (ro > ySh - 0.06) ySh = 0.5 * (ySh + ro + Math.sqrt((ySh - ro) * (ySh - ro) + 0.0012));
            ySh = Math.max(ySh, yb + 0.25);
        }
        yT = Math.max(yT, ySh + 0.045 * (1 - k));
        const shelf = 0.03 * k;
        const f = Math.max(0, Math.min(1, (yT - yBelt) / Math.max(0.05, yRoof - yBelt)));
        const wG = wB - shelf - 0.002,
            wR = wB - shelf - 0.05 * (1 - k) - P.tumblehome * f - 0.015 * k;
        const crown = lerp(0.03, 0.045, k) * (wR / bw);
        const yTop = (z) => yT + crown * (1 - Math.pow(z / Math.max(0.05, wR), 2));
        const wS = wB - 0.035 - (P.taille || 0) * 0.5;
        const yRk = yb + 0.115;
        const side = (y) => {
            const s = (y - yb) / Math.max(0.05, ySh - yb);
            return lerp(wS, wB, s) + 0.012 * 4 * s * (1 - s);
        };
        // Dachholm: die Säule ist das Band um die Ecke C7 — unten 6 cm auf der Flanke, innen bis zur Rinne
        const l57 = Math.hypot(wR - wG, yT - (ySh + 0.022 * k + 0.003));
        const tP = l57 > 1e-6 ? Math.max(0.55, 1 - 0.07 / l57) : 0.6;
        const y5 = ySh + 0.022 * k + 0.003;
        const wD = wR - 0.075;
        const pts = [
            [0, yb],
            [Math.min(zIn0, wS - 0.1), yb],
            [wS, yb],
            [side(yRk - G), yRk - G],
            [side(yRk), yRk],
            [side(yRk + G), yRk + G],
            [wB, ySh],
            [wG, y5],
            [lerp(wG, wR, tP), lerp(y5, yT, tP)],
            [wR, yT],
            [wD + G, yTop(wD + G)],
            [wD, yTop(wD)],
            [wD - G, yTop(wD - G)],
            [0, yTop(0)],
        ];
        const aE = [0, 0, 0.05, 0, 0, 0, lerp(0.035, 0.022, k), 0.006, 0, lerp(0.035, 0.05, k), 0, 0, 0, 0];
        const q = rund(pts, aE, NSEG, NARC);
        // die Kappe: z schrumpft auf die Mittellinie, die Höhe zieht leicht ein
        const yM = (yb + ySh) / 2,
            cy = 1 - 0.22 * (1 - c) * (1 - c);
        return { q: q.map(([z, y]) => [z * c, yM + (y - yM) * cy]), c, k, yT, ySh, yb };
    }

    // ── die Stationen: Schlüssel-Stellen, Fugen als Dreier (Kante · Grund · Kante), dicht am Radlauf und an den Kappen ──
    const fugenU = []; // [x, jVon, jBis] — der Grund der Fuge sinkt um GT ein
    const xsBasis = [];
    for (let i = 0; i <= 10; i++) xsBasis.push(xT + Lt * (1 - Math.cos((i / 10) * (Math.PI / 2))));
    for (let i = 0; i <= 12; i++) xsBasis.push(xN - Ln * (1 - Math.cos((i / 12) * (Math.PI / 2))));
    for (const x of [cowlX, roofF, roofR, backX, dBx]) if (x > xT + Lt && x < xN - Ln) xsBasis.push(x);
    for (let x = xT + Lt; x < xN - Ln; x += 0.02) {
        const amRad = RAD.some((r) => Math.abs(x - r.ax) < r.Ra + 0.07);
        const letzt = xsBasis.filter((v) => v <= x + 1e-9 && v >= xT + Lt).reduce((m, v) => Math.max(m, v), xT + Lt);
        if (x - letzt >= (amRad ? 0.04 : 0.085) - 1e-9 && !xsBasis.some((v) => Math.abs(v - x) < 0.03)) xsBasis.push(x);
    }
    const fuge = (x, jA, jB) => fugenU.push([x, jA, jB]);
    fuge(dFx, J.r0, J.c5); // Tür vorn
    if (tueren >= 4) fuge(dBx, J.r0, J.c5); // Türen-Stoß (B-Säule)
    fuge(tuerEnde, J.r0, J.c5); // Tür hinten
    fuge(xHoodR, J.d0, J.ende); // Haube hinten (quer über die Mitte)
    fuge(xHoodF, J.d0, J.ende); // Haube vorn
    if (steil) fuge(roofR - 0.06, J.c6, J.ende); // Heckklappe am Dach
    let xs = xsBasis.filter((x) => !fugenU.some((f) => Math.abs(f[0] - x) < 0.022));
    for (const f of fugenU) xs.push(f[0] - G, f[0], f[0] + G);
    xs = Array.from(new Set(xs.map((x) => Math.round(x * 1e5) / 1e5))).sort((a, b) => a - b);
    const nU = xs.length,
        nHalb = J.ende, // Zellen je Halb-Schnitt
        nV = 2 * nHalb; // Punkte je Ring (Mitte unten und oben geteilt)

    // ── das Gitter ──
    const pos = new Float32Array(nU * nV * 3);
    const St = [];
    const vid = (i, j) => i * nV + (((j % nV) + nV) % nV);
    for (let i = 0; i < nU; i++) {
        const Z = schnitt(xs[i]);
        St.push(Z);
        for (let j = 0; j < nV; j++) {
            const jj = j <= nHalb ? j : nV - j,
                sd = j <= nHalb ? 1 : -1;
            const o = vid(i, j) * 3;
            pos[o] = xs[i];
            pos[o + 1] = Z.q[jj][1];
            pos[o + 2] = sd * Z.q[jj][0];
        }
    }
    const halb = (j) => (j <= nHalb ? j : nV - j);
    // Fugen: der Grund sinkt entlang der Schnitt-Normale ein. u-Fuge = die mittlere Station des Dreiers; v-Fuge = der mittlere Punkt.
    let fugenM = 0;
    const senke = (i, j, t) => {
        const a = vid(i, j - 1) * 3,
            b = vid(i, j + 1) * 3,
            o = vid(i, j) * 3;
        let ny = -(pos[b + 2] - pos[a + 2]),
            nz = pos[b + 1] - pos[a + 1];
        const l = Math.hypot(ny, nz) || 1;
        // nach innen: zur Mitte des Schnitts
        const cy = (St[i].yb + St[i].yT) / 2;
        if (ny * (cy - pos[o + 1]) + nz * (0 - pos[o + 2]) < 0) {
            ny = -ny;
            nz = -nz;
        }
        pos[o + 1] += (ny / l) * t;
        pos[o + 2] += (nz / l) * t;
    };
    const fugeZelle = new Uint8Array(nU * nV); // Zellen, die eine Fuge tragen (für die Stoff-Wahl: nie Glas)
    for (const [x, jA, jB] of fugenU) {
        const i = xs.findIndex((v) => Math.abs(v - x) < 1e-4);
        for (let j = 0; j < nV; j++) {
            const jj = halb(j);
            if (jj < jA || jj > jB) continue;
            if (jB === J.ende && (jj === 0 || j === 0)) continue;
            senke(i, j, GT);
            if (j < nHalb && jj < jB) fugenM += 2 * Math.hypot(St[i].q[jj + 1][0] - St[i].q[jj][0], St[i].q[jj + 1][1] - St[i].q[jj][1]);
        }
    }
    const vFuge = (jj, xA, xB) => {
        for (let i = 0; i < nU; i++) {
            if (xs[i] < xA - 1e-6 || xs[i] > xB + 1e-6) continue;
            senke(i, jj, GT);
            senke(i, nV - jj, GT);
            if (i > 0 && xs[i - 1] >= xA - 1e-6) fugenM += 2 * (xs[i] - xs[i - 1]);
        }
    };
    vFuge(J.r0, tuerEnde, dFx); // Tür-Unterkante am Schweller
    vFuge(J.d0, xHoodR, xHoodF); // Hauben-Stoß längs
    vFuge(J.d0, roofR, roofF); // Dachrinne

    // ── der Radlauf: Zellen im Kreis fallen, die Rand-Ecken rücken auf den Kreis (über der Nabe radial, darunter längs x) ──
    const innen = new Int8Array(nU * nV).fill(-1);
    for (let i = 0; i < nU; i++)
        for (let j = 0; j < nV; j++) {
            const jj = halb(j);
            if (jj < J.c1 || jj > J.c4 || j === 0 || j === nHalb) continue;
            const o = vid(i, j) * 3;
            RAD.forEach((r, ri) => {
                if ((pos[o] - r.ax) ** 2 + (pos[o + 1] - r.yh) ** 2 < r.Ra * r.Ra) innen[vid(i, j)] = ri;
            });
        }
    const zelleWeg = new Uint8Array(nU * nV);
    for (let i = 0; i < nU - 1; i++)
        for (let j = 0; j < nV; j++) {
            if (j === nHalb - 1 || j === nHalb || j === nV - 1 || j === 0) {
                if (halb(j) < J.c1 && halb(j + 1) < J.c1) continue;
            }
            const ecken = [vid(i, j), vid(i, j + 1), vid(i + 1, j), vid(i + 1, j + 1)];
            if (ecken.every((e) => innen[e] >= 0)) zelleWeg[i * nV + j] = 1;
        }
    for (let i = 0; i < nU; i++)
        for (let j = 0; j < nV; j++) {
            const e = vid(i, j),
                ri = innen[e];
            if (ri < 0 || halb(j) === J.c1) continue;
            const r = RAD[ri],
                o = e * 3;
            const dx = pos[o] - r.ax,
                dy = pos[o + 1] - r.yh;
            if (dy >= 0) {
                const l = Math.hypot(dx, dy) || 1e-6;
                pos[o] = r.ax + (dx / l) * r.Ra;
                pos[o + 1] = r.yh + (dy / l) * r.Ra;
            } else pos[o] = r.ax + Math.sign(dx || 1) * Math.sqrt(Math.max(0, r.Ra * r.Ra - dy * dy));
        }

    // ── die Stoffe je Zelle: Lack · Glas · schwarze Säule · Leuchte · Grill ──
    const LACK = 0,
        GLAS = 1,
        SCHWARZ = 2,
        LW = 3,
        LR = 4,
        GRILL = 5;
    const idx = [[], [], [], [], [], []];
    const xGlasV = cowlX - 0.025,
        xGlasH = Math.min(backX, roofR - 0.05) + 0.02;
    for (let i = 0; i < nU - 1; i++) {
        const xm = (xs[i] + xs[i + 1]) / 2,
            Z = St[i],
            Z1 = St[i + 1],
            k = Math.min(Z.k, Z1.k),
            c = Math.min(Z.c, Z1.c);
        const istFuge = fugenU.some((f) => Math.abs(f[0] - xm) < 0.02);
        for (let j = 0; j < nV; j++) {
            if (zelleWeg[i * nV + j]) continue;
            const jj = Math.min(halb(j), halb(j + 1));
            let stoff = LACK;
            const hoehe = Z.q[J.c6][1] - Z.q[J.c5][1];
            if (jj >= J.c5 && jj < J.c6 && k > 0.6 && hoehe > 0.07 && xm < xGlasV && xm > xGlasH - 0.02) stoff = istFuge || Math.abs(xm - dBx) < 0.03 ? SCHWARZ : GLAS; // Seitenglas, die B-Säule schwarz
            else if (jj >= J.dP && ((xm < xGlasV && xm > roofF + 0.05) || (xm < roofR - (steil ? 0.085 : 0.05) && xm > xGlasH))) stoff = GLAS; // Windschutz, Heckscheibe
            else if (jj >= J.c4 - 4 && jj < J.c4 - 1 && xm > xN - Ln * 0.72 && c > 0.5 && c < 0.985) stoff = LW; // Scheinwerfer: Band unter der Schulter, um die Ecke
            else if (jj >= J.c4 - 4 && jj < J.c4 - 2 && xm < xT + Lt * 0.6 && c > 0.3 && c < 0.985) stoff = LR; // Rückleuchte
            else if (jj >= J.c2 + 3 && jj < J.c4 - 5 && xm > xN - Ln * 0.5 && c < 0.6) stoff = GRILL; // Kühl-Öffnung
            const a = vid(i, j),
                b = vid(i, j + 1),
                d = vid(i + 1, j),
                e = vid(i + 1, j + 1);
            idx[stoff].push(a, b, d, b, e, d);
        }
    }
    // die Außenseite: Drehsinn über das Vorzeichen des Volumens
    {
        let vol = 0;
        for (const L of idx)
            for (let t = 0; t < L.length; t += 3) {
                const a = L[t] * 3,
                    b = L[t + 1] * 3,
                    c = L[t + 2] * 3;
                vol += pos[a] * (pos[b + 1] * pos[c + 2] - pos[b + 2] * pos[c + 1]) - pos[a + 1] * (pos[b] * pos[c + 2] - pos[b + 2] * pos[c]) + pos[a + 2] * (pos[b] * pos[c + 1] - pos[b + 1] * pos[c]);
            }
        if (vol < 0)
            for (const L of idx)
                for (let t = 0; t < L.length; t += 3) {
                    const s = L[t + 1];
                    L[t + 1] = L[t + 2];
                    L[t + 2] = s;
                }
    }
    const haut = new THREE.Group();
    haut.name = "samenHaut";
    const voll = new THREE.BufferGeometry();
    voll.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    voll.setIndex([].concat(...idx));
    voll.computeVertexNormals();
    const schwarz = M.pillar.clone();
    schwarz.userData.__spikeHaut = true;
    const stoffe = [lack, M.glass, schwarz, M.lensW, M.lensR, M.grille];
    idx.forEach((L, s) => {
        if (!L.length) return;
        const g = new THREE.BufferGeometry();
        g.setAttribute("position", voll.attributes.position);
        g.setAttribute("normal", voll.attributes.normal);
        g.setIndex(L);
        const me = new THREE.Mesh(g, stoffe[s]);
        me.userData.__spikeStoff = ["lack", "glas", "schwarz", "licht", "licht", "grill"][s];
        haut.add(me);
    });

    // ── die Radkästen: vom Kreis-Rand der Haut nach innen (3 cm Lack-Falz, dann die Wanne bis zur Reifen-Innenkante), dazu die Rückwand ──
    {
        const pL = [],
            iL = [],
            pW = [],
            iW = [];
        const quad = (P_, I_, a, b, c, d) => {
            const n = P_.length / 3;
            P_.push(...a, ...b, ...c, ...d);
            I_.push(n, n + 1, n + 2, n, n + 2, n + 3);
        };
        const V = (e) => [pos[e * 3], pos[e * 3 + 1], pos[e * 3 + 2]];
        const rand = (ea, eb) => {
            if (innen[ea] < 0 || innen[eb] < 0) return;
            const r = RAD[innen[ea]];
            const a = V(ea),
                b = V(eb);
            if (Math.abs(a[2]) < 0.05 || Math.abs(b[2]) < 0.05) return;
            const sd = Math.sign(a[2]);
            const zI = sd * Math.min(zIn0, Math.abs(a[2]) - 0.05, Math.abs(b[2]) - 0.05);
            const f = (p, d) => [p[0], p[1], p[2] - sd * d];
            const fa = f(a, Math.min(0.03, Math.abs(a[2] - zI))),
                fb = f(b, Math.min(0.03, Math.abs(b[2] - zI)));
            quad(pL, iL, a, b, fb, fa);
            quad(pW, iW, fa, fb, [b[0], b[1], zI], [a[0], a[1], zI]);
            const n = pW.length / 3;
            pW.push(r.ax, r.yh, zI, a[0], a[1], zI, b[0], b[1], zI);
            iW.push(n, n + 1, n + 2);
        };
        for (let i = 0; i < nU - 1; i++)
            for (let j = 0; j < nV; j++) {
                if (!zelleWeg[i * nV + j]) continue;
                // Nachbar-Zellen: wo die Nachbarin steht, läuft der Rand
                const nb = [
                    [i - 1, j, vid(i, j), vid(i, j + 1)],
                    [i + 1, j, vid(i + 1, j), vid(i + 1, j + 1)],
                    [i, j - 1, vid(i, j), vid(i + 1, j)],
                    [i, j + 1, vid(i, j + 1), vid(i + 1, j + 1)],
                ];
                for (const [ni, nj, ea, eb] of nb) {
                    const njj = ((nj % nV) + nV) % nV;
                    if (ni < 0 || ni >= nU - 1 || !zelleWeg[ni * nV + njj]) {
                        if (halb(ea % nV) === J.c1 && halb(eb % nV) === J.c1) continue; // die Innenkante am Boden: kein Falz
                        rand(ea, eb);
                    }
                }
            }
        const mk = (P_, I_, mat, tag) => {
            const g = new THREE.BufferGeometry();
            g.setAttribute("position", new THREE.Float32BufferAttribute(P_, 3));
            g.setIndex(I_);
            g.computeVertexNormals();
            const m2 = mat.clone();
            m2.side = THREE.DoubleSide;
            if (tag) m2.userData.__lack = lack.userData.__lack;
            const me = new THREE.Mesh(g, m2);
            me.userData.__spikeStoff = tag ? "lack" : "wanne";
            haut.add(me);
        };
        mk(pL, iL, lack, true);
        mk(pW, iW, M.liner, false);
    }

    // ── Innen: nur, was durch das Glas zu sehen ist (Sitze, Brett, Lenkrad, Boden) — Akku, Rahmen, Motoren, Wellen bleiben weg ──
    const innenG = new THREE.Group();
    {
        const pkg = VC.buildPackage(H, P, { M: M, bodyMat: lack });
        VC.taperBody(pkg, S, P);
        pkg.updateMatrixWorld(true);
        const halt = [];
        pkg.traverse((o) => {
            if (o.isMesh && (o.material === M.seat || o.material === M.trim)) halt.push(o);
        });
        for (const o of halt) {
            o.geometry.applyMatrix4(o.matrixWorld);
            o.position.set(0, 0, 0);
            o.rotation.set(0, 0, 0);
            o.scale.set(1, 1, 1);
            o.updateMatrix();
            innenG.add(o);
        }
    }
    const raeder = VC.buildWheels(H, P, { M: M, corners: [] });
    const g = new THREE.Group();
    g.add(innenG, haut, raeder);
    g.userData = { kind: "vehicle", rezeptId: rezept, seed: seed, lod: 0 };
    g.userData.__spike = {
        stationen: nU,
        zellenJeRing: nV,
        fugenM: Math.round(fugenM * 100) / 100,
        fugeMm: [G * 2000, GT * 1000],
        eckenMm: { schulter: 22, dachholm: 50, schweller: 50, absatz: 6 },
        radlaufRa: RAD.map((r) => Math.round(r.Ra * 1000)),
        unterkanteM: yb0,
    };
    g.updateMatrixWorld(true);
    return g;
}
