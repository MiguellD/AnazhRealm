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
    // Der Vorlagen-RNG (phytogenesis mulberry32) — die geteilte Quelle für die
    // deterministischen Zufalls-Muster der Rezepte (Fels-Speckle, künftig mehr), damit
    // AnazhRealm das EXAKTE Vorlagen-Korn erbt, nicht ein zweites LCG-Muster.
    function mulberry32(a) {
        return function () {
            a |= 0;
            a = (a + 0x6d2b79f5) | 0;
            let t = Math.imul(a ^ (a >>> 15), 1 | a);
            t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
            return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
        };
    }
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

    // ── MODUL-HELFER (für die Asset-Montage, geteilt von den Bau-Funktionen unten) ──
    function _vnorm(a) {
        const l = Math.hypot(a[0], a[1], a[2]) || 1e-9;
        return [a[0] / l, a[1] / l, a[2] / l];
    }
    function _vcross(a, b) {
        return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
    }
    function _atlasRnd(a) {
        return function () {
            a |= 0;
            a = (a + 0x6d2b79f5) | 0;
            let t = Math.imul(a ^ (a >>> 15), 1 | a);
            t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
            return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
        };
    }

    // DAS NEUE KLEID Welle 1 — DER BLATT-ATLAS aus der Vorlage (`bakeLeafAtlas`, byte-treu).
    // Der Atlas trägt NUR den WERT (grau-warm, Mittel ~1), die Artfarbe kommt aus der Vertex-
    // Farbe (albedo = Vertex-Blatt × Atlas-Wert) — kein Doppel-Tönen. 4 Zellen: 0..2 =
    // Breitblatt-Cluster (die Vorlage), 3 = Nadel-Spray (Wert-only, für Koniferen). Der
    // Aufrufer übergibt `doc` (document) — Canvas ist eine Main-Thread-Ressource; im Worker
    // wird der Atlas NICHT gemalt (nur die Geometrie), darum kein `doc` → null.
    function bakeLeafAtlasCanvas(doc, opts) {
        if (!doc || typeof doc.createElement !== "function") return null;
        opts = opts || {};
        // DIVERGENZ-AUFLÖSUNG (Vorlage `bakeLeafAtlas`): die Vorlage malt 4 BREITBLATT-Zellen,
        // AnazhRealm braucht Zelle 3 als NADEL-Spray (seine Koniferen). `opts.cell3`:
        //   'needle' (default → AnazhRealm unverändert) — 3 Breitblatt + 1 Nadel-Zelle.
        //   'broadleaf' → 4 Breitblatt-Cluster wie die Vorlage (byte-treu).
        // Der RNG: AnazhRealm erbt seinen bisherigen Strom (`_atlasRnd`), die Vorlage-Treue
        // verlangt DENSELBEN Strom wie ihr `mulberry32(0xBEEF)` → im broadleaf-Modus (oder
        // explizit via opts.mulberry) mulberry32; sonst _atlasRnd. So bleibt jeder Leser
        // byte-identisch zu SEINER heutigen Ausgabe.
        const cell3 = opts.cell3 || "needle";
        const useMulberry = opts.mulberry != null ? opts.mulberry : cell3 === "broadleaf";
        const cv = doc.createElement("canvas");
        cv.width = 1024;
        cv.height = 256;
        const x = cv.getContext("2d");
        if (!x) return null;
        const rg = useMulberry ? mulberry32(0xbeef) : _atlasRnd(0xbeef); // eigener Strom (verbraucht kein Welt-RNG)
        // Zellen 0..2 (bzw. 0..3 im broadleaf-Modus) — Breitblatt-Cluster (Vorlage FIX v37: Wert um Mittel ~1, nahe weiß).
        const broadCells = cell3 === "broadleaf" ? 4 : 3;
        for (let c = 0; c < broadCells; c++) {
            const ox = c * 256 + 128,
                oy = 150;
            const n = 8 + (c & 1);
            for (let i = 0; i < n; i++) {
                const a = (i / n) * 6.2831 + rg() * 0.9,
                    R = i === 0 ? 0 : 22 + rg() * 38;
                const lx = ox + Math.cos(a) * R,
                    ly = oy + Math.sin(a) * R * 0.72 - 18;
                const rot = a + 1.5708 + (rg() - 0.5) * 0.8,
                    L = 76 + rg() * 30,
                    W = L * (0.46 + rg() * 0.16);
                const v = 0.88 + rg() * 0.34;
                x.save();
                x.translate(lx, ly);
                x.rotate(rot);
                const g = x.createLinearGradient(0, -L * 0.5, 0, L * 0.5);
                const cs = (r, gg, bb) =>
                    "rgba(" +
                    Math.min(255, Math.round(r * v)) +
                    "," +
                    Math.min(255, Math.round(gg * v)) +
                    "," +
                    Math.min(255, Math.round(bb * v)) +
                    ",1)";
                g.addColorStop(0, cs(250, 255, 238));
                g.addColorStop(1, cs(206, 220, 186));
                x.fillStyle = g;
                x.beginPath();
                x.moveTo(0, -L * 0.5);
                x.quadraticCurveTo(W * 0.62, -L * 0.14, 0, L * 0.5);
                x.quadraticCurveTo(-W * 0.62, -L * 0.14, 0, -L * 0.5);
                x.closePath();
                x.fill();
                x.strokeStyle = "rgba(90,104,78,0.40)"; // Mittelrippe (Wert-Detail, entsättigt)
                x.lineWidth = 2;
                x.beginPath();
                x.moveTo(0, -L * 0.42);
                x.lineTo(0, L * 0.42);
                x.stroke();
                x.restore();
            }
        }
        // Zelle 3 — Nadel-Spray (Wert-only) für Koniferen (die Vorlage macht Nadeln als
        // Geometrie; AnazhRealm rendert einatlasig → eine Nadel-Zelle hält das eine Material).
        // Im broadleaf-Modus (Vorlage-Treue) ist Zelle 3 bereits als Breitblatt gemalt.
        if (cell3 !== "broadleaf") {
            const ox = 3 * 256 + 128,
                oy = 128;
            const nn = 70;
            for (let i = 0; i < nn; i++) {
                const a = (i / nn) * 6.2831 * 3.2 + rg() * 0.5,
                    R = 4 + Math.sqrt(rg()) * 78;
                const lx = ox + Math.cos(a) * R,
                    ly = oy + Math.sin(a) * R;
                const rot = Math.atan2(ly - oy, lx - ox) + 1.5708;
                const L = 40 + rg() * 54,
                    v = 0.82 + rg() * 0.32;
                x.save();
                x.translate(lx, ly);
                x.rotate(rot);
                x.strokeStyle =
                    "rgba(" + Math.round(236 * v) + "," + Math.round(244 * v) + "," + Math.round(224 * v) + ",0.96)";
                x.lineWidth = 4;
                x.lineCap = "round";
                x.beginPath();
                x.moveTo(0, 0);
                x.lineTo(0, -L);
                x.stroke();
                x.restore();
            }
        }
        return cv;
    }

    // DAS NEUE KLEID Welle 1 — DIE LAUB-GEOMETRIE aus der Vorlage (`pushLeafClusterQuad`, byte-
    // treu): ein Quad je Blatt (2 Dreiecke), die Achsen aus dir/up + Roll aus phase, die UV in
    // die Atlas-Zelle geroutet. REIN (plain Arrays raus) — der Aufrufer (Main + Portal) wickelt
    // sie in eine BufferGeometry + hängt sein Material an (das dieselben Attribute liest). Die
    // Attribut-Namen matchen AnazhRealms Laub-Material: position/normal/color/aFlex/aPhase/uv.
    // `leaves`: [{pos:[x,y,z], dir:[..], up:[..], scale, needle, sway, phase}] (aus growSkeleton).
    // `opts`: { leafColor:[r,g,b] 0..1, scale (Breitblatt ~2.35), needleScale (~1.3) }.
    function buildFoliageQuads(leaves, opts) {
        opts = opts || {};
        const col = opts.leafColor || [0.29, 0.48, 0.17];
        const bScale = opts.scale != null ? opts.scale : 2.35;
        const nScale = opts.needleScale != null ? opts.needleScale : 1.3;
        const list = leaves || [];
        const M = list.length;
        const positions = new Float32Array(M * 4 * 3);
        const normals = new Float32Array(M * 4 * 3);
        const colors = new Float32Array(M * 4 * 3);
        const aFlex = new Float32Array(M * 4);
        const aPhase = new Float32Array(M * 4);
        const uvs = new Float32Array(M * 4 * 2);
        const indices = new Uint32Array(M * 6);
        const corner = [
            [-1, -1],
            [1, -1],
            [1, 1],
            [-1, 1],
        ];
        let vw = 0,
            iw = 0,
            qi = 0;
        for (let li = 0; li < M; li++) {
            const l = list[li];
            if (!l || !l.pos || !l.dir) continue;
            const e1 = _vnorm([l.dir[0], l.dir[1], l.dir[2]]);
            const up = l.up && Math.abs(l.up[0]) + Math.abs(l.up[1]) + Math.abs(l.up[2]) > 1e-4 ? l.up : [0, 1, 0];
            let r = _vcross(up, e1);
            let rl = Math.hypot(r[0], r[1], r[2]);
            if (rl < 1e-4) {
                r = _vcross([1, 0, 0], e1);
                rl = Math.hypot(r[0], r[1], r[2]) || 1e-9;
            }
            r = [r[0] / rl, r[1] / rl, r[2] / rl];
            const ph = l.phase || 0;
            const roll = Math.sin(ph * 3.7) * 0.45,
                ca = Math.cos(roll),
                sa = Math.sin(roll);
            const r1 = [e1[0] * ca + r[0] * sa, e1[1] * ca + r[1] * sa, e1[2] * ca + r[2] * sa];
            const r2 = [r[0] * ca - e1[0] * sa, r[1] * ca - e1[1] * sa, r[2] * ca - e1[2] * sa];
            const nrm = _vnorm(_vcross(r1, r2));
            const needle = !!l.needle;
            const cell = needle ? 3 : li % 3;
            const s = (l.scale || 0.5) * (needle ? nScale : bScale) * 0.5;
            const u0 = cell * 0.25,
                u1 = u0 + 0.25;
            const fx = Math.max(0, Math.min(1, l.sway != null ? l.sway : 0.7));
            const base = qi * 4;
            for (let i = 0; i < 4; i++) {
                const cx = corner[i][0] * s,
                    cy = corner[i][1] * s;
                const v3 = vw * 3;
                positions[v3] = l.pos[0] + r1[0] * cx + r2[0] * cy;
                positions[v3 + 1] = l.pos[1] + r1[1] * cx + r2[1] * cy;
                positions[v3 + 2] = l.pos[2] + r1[2] * cx + r2[2] * cy;
                normals[v3] = nrm[0];
                normals[v3 + 1] = nrm[1];
                normals[v3 + 2] = nrm[2];
                colors[v3] = col[0];
                colors[v3 + 1] = col[1];
                colors[v3 + 2] = col[2];
                aFlex[vw] = fx;
                aPhase[vw] = ph + i * 0.3;
                uvs[vw * 2] = i === 0 || i === 3 ? u0 : u1;
                uvs[vw * 2 + 1] = i < 2 ? 0 : 1;
                vw++;
            }
            indices[iw++] = base;
            indices[iw++] = base + 1;
            indices[iw++] = base + 2;
            indices[iw++] = base;
            indices[iw++] = base + 2;
            indices[iw++] = base + 3;
            qi++;
        }
        return { positions, normals, colors, aFlex, aPhase, uvs, indices, count: qi };
    }

    // EINS W4 (P1) — DIE SUPERFORMEL (Gielis, Vorlage `superR` Z.240): EIN Gesetz, riesige
    // Blatt-Morphologie. r(phi) = (|cos(m·phi/4)/a|^n2 + |sin(m·phi/4)/b|^n3)^(-1/n1).
    function superR(phi, m, n1, n2, n3, a, b) {
        const t = (m * phi) / 4;
        const p1 = Math.pow(Math.abs(Math.cos(t) / a), n2);
        const p2 = Math.pow(Math.abs(Math.sin(t) / b), n3);
        return Math.pow(p1 + p2, -1 / n1);
    }
    // Die Vorlagen-Blatt-Formen (phytogenesis Z.923-926) + die Nadel aus dem Grown-Pfad
    // (Z.964: lwsc=0.085 für Koniferen — lanzettlich-schmal).
    const LEAF_SHAPES = {
        oak: { m: 9, n1: 0.7, n2: 0.6, n3: 0.6, a: 1, b: 1, wsc: 0.42 }, // gelappt
        ovate: { m: 2, n1: 1.0, n2: 1.0, n3: 1.0, a: 1, b: 1, wsc: 0.4 }, // eiförmig
        lance: { m: 2, n1: 1.0, n2: 1.0, n3: 1.0, a: 1, b: 1, wsc: 0.18 }, // lanzettlich (Weide)
        petal: { m: 2, n1: 1.0, n2: 1.0, n3: 1.0, a: 1, b: 1, wsc: 0.28 },
        needle: { m: 2, n1: 1.0, n2: 1.0, n3: 1.0, a: 1, b: 1, wsc: 0.085 },
    };

    // EINS W4 (P1) — DIE 30-VERT-BLATT-KLINGE (der `pushLeaf`-Port, Vorlage Z.247-275): das
    // L0-Blatt ist echte 3D-GEOMETRIE — eine Superformel-Kontur über 14 Segmente (30 Verts,
    // 28 Tris je Blatt), QUER-GEMULDET (cupZ = −cup·(s−s²)·scale, cup 0.5) → die Klinge fängt
    // Licht als gekrümmte Fläche, nicht als bemalte Karte. Die Vorlage nimmt Karten NUR für
    // L1 (`useTexL = __lod===1`, Z.647); L0 sind Klingen — exakt diese Teilung stellt W4 her.
    // REIN (plain Arrays raus, kein THREE); die Attribute im SELBEN Layout wie
    // `buildFoliageQuads` (position/normal/color/aFlex/aPhase/uv + indices — die Float32-Naht,
    // der Aufrufer wickelt sie identisch in eine BufferGeometry). Normalen = Face-Akkumulation
    // pro Blatt (das THREE-`computeVertexNormals`-Gesetz, ohne THREE).
    // `leaves`: [{pos, dir, up, scale, needle, sway, phase}] (aus growSkeleton).
    // `opts`: { leafColor:[r,g,b], scale (Multiplikator, Vorlage roh=1), cup (~0.5),
    //           leafShape: Key in LEAF_SHAPES ODER {m,n1,n2,n3,a,b,wsc} }.
    function buildLeafBlades(leaves, opts) {
        opts = opts || {};
        const col = opts.leafColor || [0.29, 0.48, 0.17];
        const sMul = opts.scale != null ? opts.scale : 1.0;
        const cup = opts.cup != null ? opts.cup : 0.5;
        const shape =
            opts.leafShape && typeof opts.leafShape === "object"
                ? opts.leafShape
                : LEAF_SHAPES[opts.leafShape] || LEAF_SHAPES.ovate;
        const SEG = 14; // (SEG+1)·2 = 30 Verts, SEG·2 = 28 Tris je Blatt (Vorlage pushLeaf)
        const VPL = (SEG + 1) * 2;
        const IPL = SEG * 6;
        const list = leaves || [];
        const M = list.length;
        const positions = new Float32Array(M * VPL * 3);
        const normals = new Float32Array(M * VPL * 3);
        const colors = new Float32Array(M * VPL * 3);
        const aFlex = new Float32Array(M * VPL);
        const aPhase = new Float32Array(M * VPL);
        const uvs = new Float32Array(M * VPL * 2);
        const indices = new Uint32Array(M * IPL);
        let vw = 0,
            iw = 0,
            bladeCount = 0;
        for (let li = 0; li < M; li++) {
            const l = list[li];
            if (!l || !l.pos || !l.dir) continue;
            const dirOut = _vnorm([l.dir[0], l.dir[1], l.dir[2]]);
            const up = l.up && Math.abs(l.up[0]) + Math.abs(l.up[1]) + Math.abs(l.up[2]) > 1e-4 ? l.up : [0, 1, 0];
            let right = _vcross(dirOut, up);
            let rl = Math.hypot(right[0], right[1], right[2]);
            if (rl < 1e-4) {
                right = _vcross(dirOut, [1, 0, 0]);
                rl = Math.hypot(right[0], right[1], right[2]) || 1e-9;
            }
            right = [right[0] / rl, right[1] / rl, right[2] / rl];
            const u2 = _vnorm(_vcross(right, dirOut));
            const sh = l.needle ? LEAF_SHAPES.needle : shape;
            const scale = (l.scale || 0.5) * sMul;
            const cx = l.pos[0],
                cy = l.pos[1],
                cz = l.pos[2];
            const fx = Math.max(0, Math.min(1, l.sway != null ? l.sway : 0.7));
            const ph = l.phase || 0;
            const base = vw;
            for (let i = 0; i <= SEG; i++) {
                const s = i / SEG;
                const phi = Math.PI * s; // halber Umlauf → Tropfen
                const w = superR(phi, sh.m, sh.n1, sh.n2, sh.n3, sh.a, sh.b) * sh.wsc;
                const along = s * scale;
                const cupZ = -cup * (s - s * s) * scale; // die Quer-MULDE (Vorlage cupZ)
                const mx = cx + dirOut[0] * along + u2[0] * cupZ;
                const my = cy + dirOut[1] * along + u2[1] * cupZ;
                const mz = cz + dirOut[2] * along + u2[2] * cupZ;
                const ox = right[0] * w * scale,
                    oy = right[1] * w * scale,
                    oz = right[2] * w * scale;
                // linke + rechte Konturspalte (2 Verts je Segment-Reihe)
                let v3 = vw * 3;
                positions[v3] = mx - ox;
                positions[v3 + 1] = my - oy;
                positions[v3 + 2] = mz - oz;
                colors[v3] = col[0];
                colors[v3 + 1] = col[1];
                colors[v3 + 2] = col[2];
                aFlex[vw] = fx;
                aPhase[vw] = ph;
                uvs[vw * 2] = 0;
                uvs[vw * 2 + 1] = s;
                vw++;
                v3 = vw * 3;
                positions[v3] = mx + ox;
                positions[v3 + 1] = my + oy;
                positions[v3 + 2] = mz + oz;
                colors[v3] = col[0];
                colors[v3 + 1] = col[1];
                colors[v3 + 2] = col[2];
                aFlex[vw] = fx;
                aPhase[vw] = ph;
                uvs[vw * 2] = 1;
                uvs[vw * 2 + 1] = s;
                vw++;
            }
            for (let i = 0; i < SEG; i++) {
                const a0 = base + i * 2,
                    b0 = a0 + 1,
                    a1 = a0 + 2,
                    b1 = a0 + 3;
                indices[iw++] = a0;
                indices[iw++] = b0;
                indices[iw++] = a1;
                indices[iw++] = b0;
                indices[iw++] = b1;
                indices[iw++] = a1;
            }
            // Normalen: Face-Akkumulation über die 28 Tris DIESES Blatts (computeVertexNormals-
            // Gesetz: n += (pC−pB)×(pA−pB) je Face, dann normalisieren) → die Mulde schattiert.
            for (let t = iw - IPL; t < iw; t += 3) {
                const A = indices[t] * 3,
                    B = indices[t + 1] * 3,
                    C = indices[t + 2] * 3;
                const cbx = positions[C] - positions[B],
                    cby = positions[C + 1] - positions[B + 1],
                    cbz = positions[C + 2] - positions[B + 2];
                const abx = positions[A] - positions[B],
                    aby = positions[A + 1] - positions[B + 1],
                    abz = positions[A + 2] - positions[B + 2];
                const nx = cby * abz - cbz * aby,
                    ny = cbz * abx - cbx * abz,
                    nz = cbx * aby - cby * abx;
                normals[A] += nx;
                normals[A + 1] += ny;
                normals[A + 2] += nz;
                normals[B] += nx;
                normals[B + 1] += ny;
                normals[B + 2] += nz;
                normals[C] += nx;
                normals[C + 1] += ny;
                normals[C + 2] += nz;
            }
            for (let v = base; v < vw; v++) {
                const v3 = v * 3;
                const nl = Math.hypot(normals[v3], normals[v3 + 1], normals[v3 + 2]) || 1e-9;
                normals[v3] /= nl;
                normals[v3 + 1] /= nl;
                normals[v3 + 2] /= nl;
            }
            bladeCount++;
        }
        // kompaktieren, falls Blätter übersprungen wurden (leere pos/dir)
        const out =
            bladeCount === M
                ? { positions, normals, colors, aFlex, aPhase, uvs, indices }
                : {
                      positions: positions.subarray(0, vw * 3).slice(),
                      normals: normals.subarray(0, vw * 3).slice(),
                      colors: colors.subarray(0, vw * 3).slice(),
                      aFlex: aFlex.subarray(0, vw).slice(),
                      aPhase: aPhase.subarray(0, vw).slice(),
                      uvs: uvs.subarray(0, vw * 2).slice(),
                      indices: indices.subarray(0, iw).slice(),
                  };
        out.count = bladeCount;
        out.vertsPerLeaf = VPL;
        return out;
    }

    // DAS NEUE KLEID Welle 2 — DER STEIN aus der Vorlage (`buildBoulder`, Zingg/Wadell). Ein
    // subdividiertes Ikosaeder, radial per fbm3 + ridged verschoben (Bruch-Struktur), Zingg-
    // Formraum (elong/sph), Sediment-Bänke (strat), Wadell-Facetten-Clipping (round) + Laplace-
    // Rundung. THREE + eine noise3-Funktion werden INJIZIERT (kein Perm-Tabellen-Port; Main gibt
    // seine SimplexNoise, das Portal seine simplex3 — die Form ist gesetz-gleich, nicht byte-
    // gleich, was für Fels genügt [kein Lockstep]). Optional geologische Vertex-Farben
    // (opts.withColor + THREE.Color) für Materialien, die vertexColors lesen. `seq` (0..1) treibt
    // die Facetten-Ebenen deterministisch. Rückgabe: eine THREE.BufferGeometry (Radius ~size).
    function buildBoulderGeometry(THREE, noise3, P, seq) {
        if (!THREE || !THREE.IcosahedronGeometry) return null;
        const rnd = typeof seq === "function" ? seq : Math.random;
        const rrange = (a, b) => a + (b - a) * rnd();
        const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
        const vadd = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
        const vscl = (a, s) => [a[0] * s, a[1] * s, a[2] * s];
        const vsub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
        const vdot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
        const n3 = typeof noise3 === "function" ? noise3 : (x, y, z) => Math.sin(x * 1.7 + y * 2.3 + z * 3.1) * 0.5;
        const fbm3 = (p, oct, off) => {
            let f = 1,
                a = 0.5,
                sum = 0,
                nrm = 0;
            for (let i = 0; i < oct; i++) {
                sum += a * n3(p[0] * f + off, p[1] * f + off * 1.7, p[2] * f + off * 2.3);
                nrm += a;
                a *= 0.5;
                f *= 2.0;
            }
            return sum / nrm;
        };
        const ridged = (p, oct, off) => {
            let f = 1,
                a = 0.5,
                s = 0,
                nrm = 0;
            for (let i = 0; i < oct; i++) {
                const v = 1 - Math.abs(n3(p[0] * f + off, p[1] * f + off * 1.7, p[2] * f + off * 2.3));
                s += a * v * v;
                nrm += a;
                a *= 0.5;
                f *= 2.0;
            }
            return s / nrm;
        };
        const elong = P.elong != null ? P.elong : 0.3,
            sph = P.sph != null ? P.sph : 0.6,
            round = P.round != null ? P.round : 0.42,
            rough = P.rough != null ? P.rough : 0.55,
            strat = P.strat != null ? P.strat : 0.1,
            off = (P.seed || 0) * 13.7;
        const detail = Math.max(1, (P.detail || 4) - 1);
        let geo = THREE.IcosahedronGeometry ? new THREE.IcosahedronGeometry(1, detail) : null;
        if (THREE.BufferGeometryUtils && THREE.BufferGeometryUtils.mergeVertices) {
            geo = THREE.BufferGeometryUtils.mergeVertices(geo);
        }
        const pos = geo.attributes.position,
            n = pos.count;
        const idxAttr = geo.index;
        const adj = Array.from({ length: n }, () => new Set());
        if (idxAttr) {
            const idx = idxAttr.array;
            for (let i = 0; i < idx.length; i += 3) {
                const a = idx[i],
                    b = idx[i + 1],
                    c = idx[i + 2];
                adj[a].add(b);
                adj[a].add(c);
                adj[b].add(a);
                adj[b].add(c);
                adj[c].add(a);
                adj[c].add(b);
            }
        }
        const sx = 1 + 0.75 * elong,
            sz = 1 - 0.35 * elong,
            sy = 1 - 0.62 * (1 - sph);
        const V = [],
            dn = [];
        const vn = (a) => {
            const l = Math.hypot(a[0], a[1], a[2]) || 1e-9;
            return [a[0] / l, a[1] / l, a[2] / l];
        };
        for (let i = 0; i < n; i++) {
            const x = pos.getX(i),
                y = pos.getY(i),
                z = pos.getZ(i);
            dn.push(vn([x, y, z]));
            V.push([x * sx, y * sy, z * sz]);
        }
        const ampF = 0.12 + rough * 0.34,
            ridgeW = 1 - round * 0.6;
        for (let i = 0; i < n; i++) {
            const p = V[i];
            const base = fbm3([p[0] * 1.05, p[1] * 1.05, p[2] * 1.05], 4, off);
            const base2 = fbm3([p[0] * 2.2, p[1] * 2.2, p[2] * 2.2], 3, off + 2.2);
            const rg = ridged([p[0] * 1.8, p[1] * 1.8, p[2] * 1.8], 4, off + 5.1);
            const grain = fbm3([p[0] * 7.0, p[1] * 7.0, p[2] * 7.0], 3, off + 11.3);
            const sDamp = strat > 0.5 ? 0.55 : 1.0;
            let disp =
                ampF * sDamp * (0.62 * base + 0.16 * base2 + 0.6 * (rg - 0.5) * ridgeW) + grain * ampF * 0.42 * sDamp;
            if (strat > 0.02) {
                const step = Math.sin(V[i][1] * 7.6 + off);
                disp += (step > 0.22 ? 0.16 : step < -0.22 ? -0.12 : step * 0.22) * strat;
            }
            V[i] = vadd(V[i], vscl(dn[i], disp));
        }
        const K = round < 0.55 ? Math.round(((0.55 - round) / 0.55) * 6) : 0;
        for (let pl = 0; pl < K; pl++) {
            let pn;
            if (strat > 0.5) pn = vn([rrange(-0.3, 0.3), (rnd() < 0.5 ? 1 : -1) * rrange(0.7, 1), rrange(-0.3, 0.3)]);
            else pn = vn([rrange(-1, 1), rrange(-1, 0.6), rrange(-1, 1)]);
            const d0 = rrange(0.58, 0.86);
            for (let i = 0; i < n; i++) {
                const dd = vdot(V[i], pn) - d0;
                if (dd > 0) V[i] = vsub(V[i], vscl(pn, dd * 0.95));
            }
        }
        if (round > 0.78) {
            const NV = V.map((v, i) => {
                let a = vscl(v, 3),
                    c = 3;
                adj[i].forEach((j) => {
                    a = vadd(a, V[j]);
                    c++;
                });
                return vscl(a, 1 / c);
            });
            for (let i = 0; i < n; i++) V[i] = NV[i];
        }
        for (let i = 0; i < n; i++) pos.setXYZ(i, V[i][0], V[i][1], V[i][2]);
        pos.needsUpdate = true;
        geo.computeVertexNormals();
        // Optional: geologische Vertex-Farben (AO in Mulden · Sediment-Bänke · Eisen-Schlieren).
        if (P.withColor && THREE.Color) {
            const nor = geo.attributes.normal;
            const ao = new Float32Array(n);
            for (let i = 0; i < n; i++) {
                let mean = [0, 0, 0],
                    c = 0;
                adj[i].forEach((j) => {
                    mean = vadd(mean, V[j]);
                    c++;
                });
                mean = vscl(mean, 1 / Math.max(1, c));
                const toMean = vsub(mean, V[i]),
                    nv = [nor.getX(i), nor.getY(i), nor.getZ(i)];
                ao[i] = clamp(0.5 + vdot(vn(toMean), nv) * 1.2, 0.12, 1);
            }
            const cols = new Float32Array(n * 3);
            const base = new THREE.Color(P.rockA || 0x8a8278),
                dark = new THREE.Color(P.rockB || 0x4a463e),
                acc = new THREE.Color(P.rockC || 0x9a9286);
            const quartz = new THREE.Color(0xe8e0d2),
                feld = new THREE.Color(0xc69a86),
                mica = new THREE.Color(0x2c2a26),
                bleach = new THREE.Color(0xccc7b6),
                moss = new THREE.Color(0x6f8a3e),
                iron = new THREE.Color(0x7a4a26);
            const rockLichen = P.rockLichen != null ? P.rockLichen : 0;
            const sr = mulberry32(Math.floor((P.seed || 1) * 9973));
            for (let i = 0; i < n; i++) {
                let c = base.clone();
                const up = nor.getY(i);
                if (P.speckle) {
                    const m = sr();
                    if (m < 0.14) c.lerp(quartz, 0.6);
                    else if (m < 0.26) c.lerp(feld, 0.45);
                    else if (m < 0.34) c.lerp(mica, 0.65);
                }
                c.lerp(dark, ao[i] * 0.7);
                if (ao[i] < 0.42 && up > 0.1) c.lerp(bleach, ((0.42 - ao[i]) / 0.42) * 0.4 * clamp(up, 0, 1));
                if (strat > 0.02) {
                    const band = Math.sin(V[i][1] * 7.0 + off);
                    if (band > 0.4) c.lerp(acc, 0.55 * strat);
                    else if (band < -0.4) c.lerp(dark, 0.6 * strat);
                }
                const stain = fbm3([V[i][0] * 1.4, V[i][1] * 3.2, V[i][2] * 1.4], 3, off + 21.0);
                if (stain > 0.22) c.lerp(iron, (stain - 0.22) * 0.6);
                // Vorlagen-Flechte/Moos (phytogenesis buildBoulder): auf sonnigen Kuppen, feucht-
                // gemustert. Tag-neutral gegated (rockLichen default 0 → AnazhRealm-Fels unverändert;
                // die Portal-Vorlage reicht 0.6 → ihr Moos bleibt). Byte-treu zur Vorlage.
                if (rockLichen > 0 && up > 0.22) {
                    const patch = fbm3([V[i][0] * 2.4, V[i][1] * 2.4, V[i][2] * 2.4], 3, off + 33.0);
                    const lf = clamp((up - 0.22) / 0.5, 0, 1) * rockLichen;
                    if (patch > -0.05) c.lerp(moss, clamp((patch + 0.05) * 1.8, 0, 1) * lf * 0.6);
                }
                const mott = fbm3([V[i][0] * 0.8, V[i][1] * 0.8, V[i][2] * 0.8], 3, off + 7.7);
                c.multiplyScalar(1 + mott * 0.22);
                c.multiplyScalar(0.88 + sr() * 0.22);
                cols[i * 3] = c.r;
                cols[i * 3 + 1] = c.g;
                cols[i * 3 + 2] = c.b;
            }
            geo.setAttribute("color", new THREE.BufferAttribute(cols, 3));
        }
        const size = P.size != null ? P.size : 0.5;
        geo.scale(size, size, size);
        return geo;
    }

    // DAS NEUE KLEID Welle „RINDE" — DIE STAMM-RINDE aus der Vorlage (`buildTube`
    // barkBase→barkTip). Ein Ring-Tube entlang jeder Skelett-Polylinie (branch.points
    // [{x,y,z,r}]): Frenet-freie Up-Referenz-Basis, radiale Ringe, Fuß-Flare mit Lobes
    // (Strebepfeiler), axiale Borke-Maserung (grain) + der barkA→barkB-Höhen-Gradient
    // (Fuß-dunkel → Wipfel-hell, wie die Vorlage `col=barkBase.lerp(barkTip, sun*..)`).
    // REIN + THREE-FREI: gibt pro Branch plain-Arrays zurück (der Consumer wickelt sie in
    // BufferGeometry + merged). ATTRIBUT-VERTRAG des Consumers EXAKT: position/normal/color/
    // aFlex/aPhase + index (kein uv — das Rinden-Material liest keins). Der Part bleibt
    // holz/cylinder → Tags unberührt (nur Vertex-Positionen/Farben ändern sich).
    // `branches`: [{ points:[{x,y,z,r}], isTrunk }]. `opts`: { radialSegs=6, totalH,
    //   barkColorA:[r,g,b] 0..1 (Fuß), barkColorB:[r,g,b] (Wipfel), flareAmp=0.45,
    //   flareLobes=5 }. Rückgabe: [{ positions,normals,colors,aFlex,aPhase,indices }, ...].
    function _barkHashPhase(a, b, c) {
        let h = (a * 73856093) ^ (b * 19349663) ^ (c * 83492791);
        h = (h ^ (h >>> 13)) >>> 0;
        return ((h * 0.00000000023283) % 1) * Math.PI * 2;
    }
    function buildBarkTubeArrays(branches, opts) {
        opts = opts || {};
        const radialSegs = opts.radialSegs || 6;
        const totalH = Math.max(1, opts.totalH || 10);
        const bA = opts.barkColorA || [0.23, 0.17, 0.12];
        const bB = opts.barkColorB || [0.42, 0.35, 0.27];
        const bAr = bA[0],
            bAg = bA[1],
            bAb = bA[2];
        const bBr = bB[0],
            bBg = bB[1],
            bBb = bB[2];
        const dFlareAmp = opts.flareAmp != null ? opts.flareAmp : 0.45;
        const dFlareLobes = opts.flareLobes != null ? opts.flareLobes : 5;
        const out = [];
        const list = branches || [];
        for (let bi = 0; bi < list.length; bi++) {
            const br = list[bi];
            const pts = br && br.points;
            if (!Array.isArray(pts) || pts.length < 2) continue;
            const isTrunk = !!br.isTrunk;
            const nP = pts.length;
            const nV = nP * radialSegs;
            const positions = new Float32Array(nV * 3);
            const normals = new Float32Array(nV * 3);
            const colors = new Float32Array(nV * 3);
            const flex = new Float32Array(nV);
            const phase = new Float32Array(nV);
            const indices = new Uint32Array((nP - 1) * radialSegs * 6);
            for (let i = 0; i < nP; i++) {
                const p = pts[i];
                let tx, ty, tz;
                if (i === 0) {
                    tx = pts[1].x - p.x;
                    ty = pts[1].y - p.y;
                    tz = pts[1].z - p.z;
                } else if (i === nP - 1) {
                    tx = p.x - pts[i - 1].x;
                    ty = p.y - pts[i - 1].y;
                    tz = p.z - pts[i - 1].z;
                } else {
                    tx = pts[i + 1].x - pts[i - 1].x;
                    ty = pts[i + 1].y - pts[i - 1].y;
                    tz = pts[i + 1].z - pts[i - 1].z;
                }
                const tlen = Math.sqrt(tx * tx + ty * ty + tz * tz) || 1;
                tx /= tlen;
                ty /= tlen;
                tz /= tlen;
                let upX = 0,
                    upY = 1,
                    upZ = 0;
                if (Math.abs(ty) > 0.99) {
                    upX = 1;
                    upY = 0;
                    upZ = 0;
                }
                let bx = ty * upZ - tz * upY;
                let by = tz * upX - tx * upZ;
                let bz = tx * upY - ty * upX;
                const blen = Math.sqrt(bx * bx + by * by + bz * bz) || 1;
                bx /= blen;
                by /= blen;
                bz /= blen;
                const nx = by * tz - bz * ty;
                const ny = bz * tx - bx * tz;
                const nz = bx * ty - by * tx;
                let radius = p.r;
                if (isTrunk && i < Math.max(2, Math.floor(nP * 0.18))) {
                    const flareT = 1 - i / Math.max(1, Math.floor(nP * 0.18));
                    const ease = flareT * flareT * (3 - 2 * flareT);
                    radius = p.r * (1 + dFlareAmp * ease * 0.4);
                }
                const lobes = dFlareLobes;
                const flareActive = isTrunk && i < Math.max(2, Math.floor(nP * 0.18));
                const flareT = flareActive ? 1 - i / Math.max(1, Math.floor(nP * 0.18)) : 0;
                const flareEase = flareT * flareT * (3 - 2 * flareT);
                const flareAmp = dFlareAmp * flareEase;
                const flexVal = Math.max(0, Math.min(1, p.y / totalH));
                for (let j = 0; j < radialSegs; j++) {
                    const a = (j / radialSegs) * Math.PI * 2;
                    const ca = Math.cos(a);
                    const sa = Math.sin(a);
                    const lobedMul = 1 + flareAmp * Math.sin((j * lobes * 2 * Math.PI) / radialSegs);
                    const rEff = radius * (flareActive ? lobedMul : 1.0);
                    const vx = p.x + (nx * ca + bx * sa) * rEff;
                    const vy = p.y + (ny * ca + by * sa) * rEff;
                    const vz = p.z + (nz * ca + bz * sa) * rEff;
                    const vnx = nx * ca + bx * sa;
                    const vny = ny * ca + by * sa;
                    const vnz = nz * ca + bz * sa;
                    const vIdx = (i * radialSegs + j) * 3;
                    positions[vIdx] = vx;
                    positions[vIdx + 1] = vy;
                    positions[vIdx + 2] = vz;
                    normals[vIdx] = vnx;
                    normals[vIdx + 1] = vny;
                    normals[vIdx + 2] = vnz;
                    const grainFreq = isTrunk ? 2.1 : 3.6;
                    const grain =
                        1 -
                        0.15 * (Math.sin(i * grainFreq) * 0.5 + 0.5) -
                        0.08 * (Math.sin(j * 1.9 + i * 0.5) * 0.5 + 0.5);
                    const hMix = Math.max(0, Math.min(1, p.y / totalH));
                    colors[vIdx] = (bAr + (bBr - bAr) * hMix) * grain;
                    colors[vIdx + 1] = (bAg + (bBg - bAg) * hMix) * grain;
                    colors[vIdx + 2] = (bAb + (bBb - bAb) * hMix) * grain;
                    const vF = i * radialSegs + j;
                    flex[vF] = flexVal * (isTrunk ? 0.45 : 0.85);
                    phase[vF] = _barkHashPhase(bi, i, j);
                }
            }
            let triIdx = 0;
            for (let i = 0; i < nP - 1; i++) {
                for (let j = 0; j < radialSegs; j++) {
                    const j1 = (j + 1) % radialSegs;
                    const a = i * radialSegs + j;
                    const b = i * radialSegs + j1;
                    const c = (i + 1) * radialSegs + j;
                    const d = (i + 1) * radialSegs + j1;
                    indices[triIdx++] = a;
                    indices[triIdx++] = c;
                    indices[triIdx++] = b;
                    indices[triIdx++] = b;
                    indices[triIdx++] = c;
                    indices[triIdx++] = d;
                }
            }
            out.push({ positions, normals, colors, aFlex: flex, aPhase: phase, indices });
        }
        return out;
    }

    // DAS NEUE KLEID Welle (KRISTALL) — DER KRISTALL aus der Vorlage (`pushCrystal`/`emitCrystals`,
    // phytogenesis v38, Schöpfer-justiert). Ein M-seitiges PRISMA (M=6 → Quarz hexagonal) mit
    // SCHULTER (Radius-Verjüngung shoulderScale=0.9 bei shF=1−termFrac der Länge) + pyramidaler
    // TERMINATION (Apex-Spitze) — die charakteristische Quarz-Silhouette, NIE eine Kugel. Die
    // Facetten sind SCHARF (jede Wand eigene 4 Verts → per-Face-Normalen, wie die Vorlage). THREE
    // wird INJIZIERT (kein Import). Geometrie zentriert um den Ursprung (yBot=−L/2..yTop=+L/2), damit
    // der Consumer sie 1:1 als crystalPoint-Part-Geometrie nutzt (position/normal indexed; der
    // Consumer liest KEINE Vertex-Farbe → withColor ist optional für den Standalone-/Portal-Pfad).
    // Rückgabe: eine THREE.BufferGeometry. opts: {facets, rX, rZ, length, termFrac, shoulderScale,
    // angleOffset, withColor, colBase, colTip}.
    function buildCrystalPointGeometry(THREE, opts) {
        if (!THREE || !THREE.BufferGeometry) return null;
        const o = opts || {};
        const M = Math.max(3, Math.min(12, o.facets | 0 || 6));
        const rX = Math.max(0.01, o.rX != null ? o.rX : 0.5);
        const rZ = Math.max(0.01, o.rZ != null ? o.rZ : 0.5);
        const L = Math.max(0.05, o.length != null ? o.length : 1);
        const termFrac = Number.isFinite(o.termFrac) ? Math.max(0.05, Math.min(0.9, o.termFrac)) : 0.32;
        // Vorlage pushCrystal: Schulter bei shF=0.70 (= 1−termFrac der Länge), Radius ×0.9, Apex.
        const shF = 1 - termFrac;
        const shoulderScale = Number.isFinite(o.shoulderScale) ? o.shoulderScale : 0.9;
        const angOff = Number.isFinite(o.angleOffset) ? o.angleOffset : 0.26;
        const yBot = -L / 2,
            yTop = L / 2,
            yShoulder = yBot + shF * L;
        const ringB = [],
            ringS = [];
        for (let k = 0; k < M; k++) {
            const a = (k / M) * Math.PI * 2 + angOff;
            ringB.push([Math.cos(a) * rX, yBot, Math.sin(a) * rZ]);
            ringS.push([Math.cos(a) * rX * shoulderScale, yShoulder, Math.sin(a) * rZ * shoulderScale]);
        }
        const withColor = !!(o.withColor && THREE.Color && o.colBase != null && o.colTip != null);
        let cB = null,
            cT = null;
        if (withColor) {
            cB = new THREE.Color(o.colBase);
            cT = new THREE.Color(o.colTip);
        }
        const pos = [],
            idx = [],
            cols = [];
        let vb = 0;
        // Prisma-Wände — je Facette eigene 4 Verts (scharfe Facetten, wie die Vorlage).
        for (let k = 0; k < M; k++) {
            const k2 = (k + 1) % M;
            const b0 = ringB[k],
                b1 = ringB[k2],
                s1 = ringS[k2],
                s0 = ringS[k];
            pos.push(b0[0], b0[1], b0[2], b1[0], b1[1], b1[2], s1[0], s1[1], s1[2], s0[0], s0[1], s0[2]);
            idx.push(vb, vb + 1, vb + 2, vb, vb + 2, vb + 3);
            if (withColor) for (let q = 0; q < 4; q++) cols.push(cB.r, cB.g, cB.b);
            vb += 4;
        }
        // Termination — Apex + eigene Schulter-Ring-Kopie (die Spitze), Farbe cT.
        const apex = vb;
        pos.push(0, yTop, 0);
        if (withColor) cols.push(cT.r, cT.g, cT.b);
        vb++;
        const ss = vb;
        for (let k = 0; k < M; k++) {
            const s = ringS[k];
            pos.push(s[0], s[1], s[2]);
            if (withColor) cols.push(cT.r, cT.g, cT.b);
            vb++;
        }
        for (let k = 0; k < M; k++) idx.push(apex, ss + k, ss + ((k + 1) % M));
        // Boden-Kappe — eigenes Zentrum + Boden-Ring-Kopie (schließt die Silhouette, unten weisend).
        const botC = vb;
        pos.push(0, yBot, 0);
        if (withColor) cols.push(cB.r, cB.g, cB.b);
        vb++;
        const bs = vb;
        for (let k = 0; k < M; k++) {
            const b = ringB[k];
            pos.push(b[0], b[1], b[2]);
            if (withColor) cols.push(cB.r, cB.g, cB.b);
            vb++;
        }
        for (let k = 0; k < M; k++) idx.push(botC, bs + ((k + 1) % M), bs + k);
        const g = new THREE.BufferGeometry();
        g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
        g.setIndex(idx);
        g.computeVertexNormals();
        if (withColor) g.setAttribute("color", new THREE.Float32BufferAttribute(cols, 3));
        return g;
    }

    root.__phytoCore = {
        growSkeleton: growSkeleton,
        bakeLeafAtlasCanvas: bakeLeafAtlasCanvas,
        buildFoliageQuads: buildFoliageQuads,
        buildLeafBlades: buildLeafBlades, // Eins W4 (P1): die 30-Vert-Superformel-Klinge für L0
        superR: superR,
        LEAF_SHAPES: LEAF_SHAPES,
        buildBoulderGeometry: buildBoulderGeometry,
        buildCrystalPointGeometry: buildCrystalPointGeometry,
        buildBarkTubeArrays: buildBarkTubeArrays,
    };
})(typeof self !== "undefined" ? self : typeof globalThis !== "undefined" ? globalThis : this);
