// AnazhRealm — phyto-core.js: DER GESETZ-WAHRE PHYTO-WUCHS-KERN (DAS NEUE KLEID, Welle 0).
// EINE Quelle für die Baum-Skelett-Wuchs-Mathematik — geladen vom Main-Thread (index.html),
// vom voxel-worker (importScripts) UND vom Terrain-Portal (phytogenesis.js). KEINE THREE-
// Referenz (läuft im Worker + headless). Wortgetreue Extraktion aus `_phytoGrowSkeleton`
// (byte-identisch aus phytogenesis v38 portiert) — jede Formel/Konstante EXAKT gleich.
//
// Der Kern ist REIN: `growSkeleton(P, seq)` nimmt den Phänotyp-Reglervektor `P` + einen
// injizierten deterministischen Strom `seq` (0..1-Generator) und gibt reine Arrays zurück
// (`{segs, leaves, trunkR, height, runMeta}`) — kein `this`, kein State, keine Zeit, kein
// Math.random. Die Gesetze: McMahon (H→D), da Vinci (r^Δ an jeder Gabel), Apikaldominanz
// (exkurrent/dekurrent), Gravitropismus, Phyllotaxis (GOLDEN-Winkel), Konifere-Whorls+Droop,
// basalStems (Strauch), Blatt-Terminierung (Nadel/Peitsche/Laub), Blatt-Budget (Card-Cap).
// Die Bake-/Farb-/Atlas-Rezepte reiten in späteren Wellen oben auf DIESER einen Quelle.
(function (root) {
    function growSkeleton(P, seq) {
        const rnd = seq;
        const rrange = (a, b) => a + (b - a) * rnd();
        const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
        const lerp = (a, b, t) => a + (b - a) * t;
        const GOLDEN = Math.PI * (3 - Math.sqrt(5)); // 137.50776° Phyllotaxis
        // Vektor-Helfer (THREE-frei, aus phytogenesis portiert).
        const vadd = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
        const vscl = (a, s) => [a[0] * s, a[1] * s, a[2] * s];
        const vdot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
        const vlen = (a) => Math.hypot(a[0], a[1], a[2]);
        const vnorm = (a) => {
            const l = vlen(a) || 1e-9;
            return [a[0] / l, a[1] / l, a[2] / l];
        };
        const vcross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
        const vlerp = (a, b, t) => [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];
        const vrot = (vec, axis, ang) => {
            const k = vnorm(axis),
                c = Math.cos(ang),
                s = Math.sin(ang),
                d = vdot(k, vec);
            const cr = vcross(k, vec);
            return [
                vec[0] * c + cr[0] * s + k[0] * d * (1 - c),
                vec[1] * c + cr[1] * s + k[1] * d * (1 - c),
                vec[2] * c + cr[2] * s + k[2] * d * (1 - c),
            ];
        };
        const perp = (d) => {
            const a = Math.abs(d[1]) < 0.9 ? [0, 1, 0] : [1, 0, 0];
            return vnorm(vcross(d, a));
        };
        // 2D-Value-Noise (deterministischer Hash, seedfrei — für den Gnarl-Dick-Modulator).
        const vn2 = (x, y) => {
            const xi = Math.floor(x),
                yi = Math.floor(y),
                xf = x - xi,
                yf = y - yi;
            const h = (a, b) => {
                let nH = (Math.imul(a, 1597) + Math.imul(b, 51749)) | 0;
                nH = (nH << 13) ^ nH;
                const nn = Math.imul(nH, nH);
                const t = (Math.imul(nn, 15731) + 789221) | 0;
                const m = (Math.imul(nH, t) + 1376312589) | 0;
                return 1 - (m & 0x7fffffff) / 1073741824;
            };
            const u = xf * xf * (3 - 2 * xf),
                v = yf * yf * (3 - 2 * yf);
            const x1 = h(xi, yi) + (h(xi + 1, yi) - h(xi, yi)) * u,
                x2 = h(xi, yi + 1) + (h(xi + 1, yi + 1) - h(xi, yi + 1)) * u;
            return (x1 + (x2 - x1) * v) * 0.5 + 0.5;
        };

        const segs = [],
            leaves = [];
        let maxSway = 1e-6,
            count = 0,
            runId = 0;
        const azim = { v: 0 },
            runMeta = {};
        const countCap = Number.isFinite(P.countCap) ? P.countCap : 8800;
        // McMahon: der Stammradius FOLGT aus Höhe/Schlankheit (Sicherheitsfaktor ~4 gegen
        // die Euler-Knickgrenze — echte Bäume sind viel dicker als kritisch).
        const k = lerp(13, 22, P.slim);
        const D = Math.pow((P.height / k) * 2, 1.5);
        const trunkR = clamp(D * 0.5, 0.07, 1.25) * (P.trunkMul || 1);

        const grow = (pos, dir, radius, length, depth, accSway, parentRun, isLead) => {
            if (count > countCap) return;
            const myRun = runId++;
            runMeta[myRun] = { parentRun: parentRun == null ? -1 : parentRun, isLead: !!isLead };
            const rMin = trunkR * 0.045,
                lMin = P.height * 0.012;
            const NSEG = depth < 2 ? 5 : 3;
            let p = pos.slice(),
                d = vnorm(dir.slice()),
                aSw = accSway;
            const rEnd = radius * (P.conifer && isLead ? 0.975 : depth < 2 ? 0.93 : 0.86);
            const distal = clamp(1 - radius / trunkR, 0, 1);
            // Gravitropismus: der Ast biegt zur Vertikalen (aufrecht bei trop<0, hängend bei trop>0).
            const tropW = clamp(Math.abs(P.trop) * Math.pow(distal, 1.2) * 0.7, 0, 0.85);
            const tgt = [0, P.trop > 0 ? -1 : 1, 0];
            for (let i = 0; i < NSEG; i++) {
                const segLen = length / NSEG;
                d = vnorm(vlerp(d, tgt, tropW / NSEG));
                const wob = perp(d);
                d = vnorm(vadd(d, vscl(wob, (rnd() - 0.5) * 0.08 * (0.2 + 0.8 * distal))));
                if (!isLead) {
                    d = vnorm(vadd(d, [0, -0.016 * (0.3 + 0.7 * (i / NSEG)) * Math.pow(distal, 0.9), 0]));
                }
                const p2 = vadd(p, vscl(d, segLen));
                // Gnarl: dicke/ältere Äste knorrig, Zweige + Stammfuß glatt (kein Poolnudel-Look).
                const gnA = 0.05 + 0.1 * (1 - distal) * clamp(p[1] / (P.height * 0.5), 0.25, 1);
                const gnf = (pp) =>
                    1 +
                    gnA *
                        ((vn2(pp[0] * 2.1 + pp[1] * 1.3, pp[2] * 2.1 - pp[1] * 0.9) - 0.5) * 1.5 +
                            Math.sin(pp[1] * 2.7 + pp[0] * 1.8 + depth) * 0.3);
                const r0 = lerp(radius, rEnd, i / NSEG) * gnf(p),
                    r1 = lerp(radius, rEnd, (i + 1) / NSEG) * gnf(p2);
                const dSw = segLen * Math.pow(trunkR / Math.max(r0, rMin), 1.05) * 0.9;
                const sw0 = aSw,
                    sw1 = aSw + dSw;
                aSw = sw1;
                if (sw1 > maxSway) maxSway = sw1;
                const omega = clamp(0.18 + 1.7 * (r0 / trunkR), 0.18, 2.4); // f ~ r/L²
                const phase = depth * 1.7 + i * 0.6 + azim.v * 0.3;
                // Konifere-Whorls: der Leittrieb setzt in Intervallen Quirle aus Seitenästen.
                if (
                    isLead &&
                    P.conifer &&
                    P.apical > 0.62 &&
                    count < countCap - 300 &&
                    p2[1] > (P.crownBase || 0) * P.height
                ) {
                    const intn = P.height * (P.whorlSpacing || 0.12);
                    if (Math.floor(p2[1] / intn) > Math.floor(p[1] / intn)) {
                        const nWh = Math.round(lerp(5, 7, P.apical)),
                            uy = clamp(p2[1] / P.height, 0, 1);
                        const wShare = clamp(0.42 - 0.37 * clamp(trunkR / 1.2, 0, 1), 0.05, 0.42);
                        const brad = r1 * Math.pow(wShare / nWh, 1 / P.delta);
                        for (let w = 0; w < nWh; w++) {
                            azim.v += GOLDEN;
                            const sd = vrot(perp(d), d, azim.v);
                            const wb = lerp(1.18, 0.62, uy);
                            let cd = vnorm(vadd(vscl(d, Math.cos(wb)), vscl(sd, Math.sin(wb))));
                            cd = vnorm(vadd(cd, [0, -(P.coniferDroop == null ? 0.22 : P.coniferDroop), 0]));
                            grow(
                                p2,
                                cd,
                                brad,
                                P.height * lerp(0.15, 0.06, uy) * (P.barkType === "sequoia" ? 0.95 : 1.0),
                                depth + 1,
                                sw1,
                                myRun,
                                false
                            );
                        }
                    }
                }
                segs.push({ p0: p, p1: p2, r0, r1, depth, sway0: sw0, sway1: sw1, phase, omega, runId: myRun });
                count++;
                p = p2;
            }
            const tip = p,
                tipDir = d,
                tipR = rEnd,
                tipSway = aSw;
            if (tipR < rMin * 1.4 || length < lMin || depth >= P.maxDepth) {
                // Blatt-Terminierung: Nadel-Büschel (Konifere) · Weiden-Peitsche (trop>0.6) · Laub-Cluster.
                if (P.conifer) {
                    const nN = Math.round(lerp(18, 32, P.leafD));
                    for (let i = 0; i < nN; i++) {
                        azim.v += GOLDEN;
                        const sd = vrot(perp(tipDir), tipDir, azim.v);
                        const ndir = vnorm(vadd(vscl(tipDir, 0.4), vscl(sd, 0.9)));
                        const bp = vadd(tip, vscl(tipDir, -length * 0.5 * rnd()));
                        leaves.push({
                            pos: bp,
                            dir: ndir,
                            up: perp(ndir),
                            scale: lerp(0.1, 0.2, P.leafD),
                            sway: tipSway,
                            phase: rnd() * 6.28,
                            omega: clamp(0.18 + 1.7 * (tipR / trunkR), 0.18, 2.4),
                            needle: true,
                        });
                    }
                } else if (P.trop > 0.6) {
                    let wp = tip.slice(),
                        wd = tipDir.slice();
                    const whipLen = P.height * rrange(0.2, 0.38),
                        wseg = 9,
                        wr = tipR * 0.6;
                    const wRun = runId++;
                    runMeta[wRun] = { parentRun: myRun, isLead: false };
                    for (let s = 0; s < wseg; s++) {
                        wd = vnorm(vadd(wd, [0, -0.7, 0]));
                        const np = vadd(wp, vscl(wd, whipLen / wseg));
                        const sw0 = tipSway + s * 0.2,
                            sw1 = tipSway + (s + 1) * 0.2;
                        if (sw1 > maxSway) maxSway = sw1;
                        segs.push({
                            p0: wp,
                            p1: np,
                            r0: wr * (1 - s / wseg),
                            r1: wr * (1 - (s + 1) / wseg),
                            depth: depth + 1,
                            sway0: sw0,
                            sway1: sw1,
                            phase: s * 0.5 + azim.v * 0.2,
                            omega: 0.45,
                            runId: wRun,
                        });
                        if (s > 0) {
                            azim.v += GOLDEN;
                            const lp = vlerp(wp, np, 0.5);
                            leaves.push({
                                pos: lp,
                                dir: [0, -1, 0.0001],
                                up: [0.0001, 0, 1],
                                scale: P.leafSize * rrange(0.55, 0.8),
                                sway: sw1,
                                phase: rnd() * 6.28,
                                omega: 0.45,
                                needle: false,
                            });
                        }
                        wp = np;
                    }
                } else {
                    const nL = Math.round(lerp(8, 16, P.leafD));
                    for (let i = 0; i < nL; i++) {
                        azim.v += GOLDEN;
                        const sd = vrot(perp(tipDir), tipDir, azim.v);
                        let ldir = vnorm(vadd(vscl(tipDir, 0.5), vscl(sd, 0.85)));
                        if (P.trop > 0.5) ldir = vnorm(vadd(ldir, [0, -0.9, 0]));
                        const bp = vadd(tip, vscl(tipDir, -length * (0.2 + 0.6 * rnd())));
                        leaves.push({
                            pos: bp,
                            dir: ldir,
                            up: vnorm(vadd(perp(ldir), vscl(tipDir, 0.3))),
                            scale: P.leafSize * rrange(0.8, 1.15),
                            sway: tipSway,
                            phase: rnd() * 6.28,
                            omega: clamp(0.18 + 1.7 * (tipR / trunkR), 0.18, 2.4),
                            needle: false,
                        });
                    }
                }
                return;
            }
            // da Vinci / Pipe-Modell: die Querschnittsfläche (r^Δ) wird an der Gabel erhalten.
            const parentArea = Math.pow(tipR, P.delta);
            let children = [];
            const lift = tip[1] < (P.crownBase || 0) * P.height; // Selbst-Astung: Schattenäste unten sterben
            if (P.apical > 0.62) {
                // EXKURRENT: starker Leittrieb + laterale Whorls (Nadelbaum-Kegel).
                const f = P.conifer
                    ? isLead
                        ? 0.94
                        : lerp(0.5, 0.72, P.apical)
                    : lerp(0.55, 0.9, (P.apical - 0.62) / 0.38);
                const nW = lift ? 0 : P.conifer ? (isLead ? 0 : Math.round(lerp(2, 4, P.apical))) : 3;
                children.push({
                    area: (lift ? 1 : f) * parentArea,
                    bend: lerp(0.04, 0.16, 1 - P.apical),
                    len: length * lerp(0.72, 0.8, P.apical),
                    lead: true,
                });
                for (let i = 0; i < nW; i++)
                    children.push({
                        area: ((1 - f) * parentArea) / nW,
                        bend: P.conifer ? lerp(1.0, 0.5, depth / P.maxDepth) : lerp(0.6, 1.15, distal),
                        len: length * (P.conifer ? lerp(0.4, 0.52, P.apical) : lerp(0.55, 0.72, P.apical)),
                        lead: false,
                    });
            } else if (lift) {
                children.push({ area: parentArea, bend: 0.08, len: length * 0.82, lead: true });
            } else {
                // DEKURRENT: der Leittrieb verliert sich, breit spreizende Arme bilden die Kuppel
                // (breiter als hoch — die Eiche). Die Spreizung skaliert mit der Apikaldominanz.
                children.push({
                    area: parentArea * 0.3,
                    bend: lerp(0.12, 0.3, 1 - P.apical),
                    len: length * 0.6,
                    lead: true,
                });
                const nLat = rnd() < 0.55 ? 3 : 2;
                const spread = lerp(0.55, 1.05, 1 - P.apical);
                for (let i = 0; i < nLat; i++)
                    children.push({
                        area: (parentArea * 0.7) / nLat,
                        bend: spread * rrange(0.85, 1.12),
                        len: length * lerp(0.82, 0.96, P.apical),
                        lead: false,
                    });
            }
            for (const ch of children) {
                const cr = Math.pow(ch.area, 1 / P.delta);
                let cdir;
                if (!ch.lead) {
                    azim.v += GOLDEN;
                    const side = vrot(perp(tipDir), tipDir, azim.v);
                    cdir = vnorm(vadd(vscl(tipDir, Math.cos(ch.bend)), vscl(side, Math.sin(ch.bend))));
                    if (P.conifer) cdir = vnorm(vadd(cdir, [0, -(P.coniferDroop == null ? 0.22 : P.coniferDroop), 0]));
                } else {
                    const side = vrot(perp(tipDir), tipDir, rnd() * 6.28);
                    cdir = vnorm(vadd(vscl(tipDir, Math.cos(ch.bend)), vscl(side, Math.sin(ch.bend))));
                }
                grow(tip, cdir, cr, ch.len, depth + 1, tipSway, myRun, ch.lead);
            }
        };

        if (P.basalStems > 1) {
            // Strauch: mehrere basale Triebe statt eines Stamms.
            for (let i = 0; i < P.basalStems; i++) {
                const a = (i / P.basalStems) * 6.28 + rnd();
                const lean = rrange(0.12, 0.3);
                const dir = vnorm([Math.cos(a) * Math.sin(lean), Math.cos(lean), Math.sin(a) * Math.sin(lean)]);
                grow(
                    [Math.cos(a) * trunkR * 1.5, 0, Math.sin(a) * trunkR * 1.5],
                    dir,
                    trunkR * rrange(0.6, 0.85),
                    P.height * 0.5,
                    0,
                    0,
                    -1,
                    false
                );
            }
        } else {
            grow([0, 0, 0], [0, 1, 0], trunkR, P.height * (P.conifer ? 0.2 : 0.3), 0, 0, -1, false);
        }
        // Wind-Schwung normieren (der Card-Builder liest sway0/sway1 als aFlex).
        const gain = Number.isFinite(P.windGain) ? P.windGain : 1;
        for (const s of segs) {
            s.sway0 = (s.sway0 / maxSway) * gain;
            s.sway1 = (s.sway1 / maxSway) * gain;
        }
        for (const l of leaves) l.sway = (l.sway / maxSway) * gain;
        // Blatt-Budget (SpeedTree-Praxis): die Terminal-Zahl wächst ~Δ^Tiefe + explodiert; ein
        // gleichmäßiges Subsampling deckelt die Card-Zahl, die Silhouette bleibt. Per LOD gesetzt.
        const budget = Number.isFinite(P.leafBudget) ? P.leafBudget : 20000;
        if (leaves.length > budget) {
            const st = leaves.length / budget,
                kp = [];
            for (let t = 0; t < budget; t++) kp.push(leaves[Math.floor(t * st)]);
            leaves.length = 0;
            for (const _k of kp) leaves.push(_k);
        }
        return { segs, leaves, trunkR, height: P.height, runMeta };
    }

    root.__phytoCore = { growSkeleton: growSkeleton };
})(typeof self !== "undefined" ? self : typeof globalThis !== "undefined" ? globalThis : this);
