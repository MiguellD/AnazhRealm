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
    function bakeLeafAtlasCanvas(doc) {
        if (!doc || typeof doc.createElement !== "function") return null;
        const cv = doc.createElement("canvas");
        cv.width = 1024;
        cv.height = 256;
        const x = cv.getContext("2d");
        if (!x) return null;
        const rg = _atlasRnd(0xbeef); // eigener Strom (verbraucht kein Welt-RNG)
        // Zellen 0..2 — Breitblatt-Cluster (Vorlage FIX v37: Wert um Mittel ~1, nahe weiß).
        for (let c = 0; c < 3; c++) {
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
        {
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

    root.__phytoCore = {
        growSkeleton: growSkeleton,
        bakeLeafAtlasCanvas: bakeLeafAtlasCanvas,
        buildFoliageQuads: buildFoliageQuads,
    };
})(typeof self !== "undefined" ? self : typeof globalThis !== "undefined" ? globalThis : this);
