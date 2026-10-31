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
        // Der Quirl-Abstand der Konifere ist ein Wert des Gesetzes (treePhenotype → treeParams), nie ein stiller
        // Ersatz: ohne ihn bricht der Wuchs laut beim Namen (K24 — der Zwilling wuchs mit fest 0,12·H).
        if (P.conifer && !(P.whorlSpacing > 0))
            throw new Error("growSkeleton: Konifere ohne whorlSpacing (das Gesetz setzt ihn — treeParams)");
        const rnd = seq;
        const rrange = (a, b) => a + (b - a) * rnd();
        const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
        const lerp = (a, b, t) => a + (b - a) * t;
        /* V18.491.243 — Phyllotaxis golden ← PHYLO_GESETZ.golden fail-soft; Host none (PHYLO_VIS). */
        const GOLDEN_FALLBACK = Math.PI * (3 - Math.sqrt(5)); // 137.50776° Phyllotaxis
        const GOLDEN = PHYLO_GESETZ && isFinite(PHYLO_GESETZ.golden) ? PHYLO_GESETZ.golden : GOLDEN_FALLBACK;
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
        // 2D-Value-Noise des Gnarl-Dick-Modulators: DIESELBE `vn2` wie das Rinden-Gesetz unten (Modul-Funktion
        // dieses Kerns, gehoben) — der byte-gleiche Inline-Zwilling ist gefallen.

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
        const trunkForm = clamp(D * 0.5, 0.07, 1.25) * (P.trunkMul || 1);
        // DAS WELT-MASS (K20, 12.10.): ein Baum, dessen Phänotyp sein Maß in Metern trägt (`P.hoeheM` die Wipfel-Höhe des
        // Individuums in der Größe 1 — das Laub steht 1–2,5 m darüber —, `P.hd` die Schlankheit H/D seines Standorts, `P.weltSkala` Meter je Vorlagen-Einheit), wächst in
        // der Welt so hoch und so schlank: der Stamm misst H/hd (Bestand 40–100, der Solitär gedrungener —
        // waldwissen, McMahon 1973), die Höhe trägt der Schaft (`schaftHub`, unten). Die Formel oben in Vorlagen-
        // Einheiten las H/D 13–18 für jeden Baum (gate:pflanzen-nah (H)); sie bleibt das Maß der FORM — die Quirl-
        // Teilung der Konifere liest sie —, alle übrigen Radien sind relativ zum Stamm (da Vinci): das Skelett und
        // der Zufalls-Strom bleiben gleich, jeder Ast wird mit dem Stamm schlanker. Ohne Welt-Maß (der Bauplan-Baum
        // der Werkstatt, das stehende Totholz — die Bruch-Höhe ist sein Maß) wächst der Stamm nach der Formel oben.
        // DER SOLITÄR (K20, `P.freistand`, FREISTAND unten): ein Baum im Offenen trägt seine Krone tief — der Schaft hebt sie
        // nur bis zum Kronenansatz FREISTAND.ansatz (kein Hub auf die Bestandshöhe), sein Stamm misst die Höhe durch die
        // gedrungene Schlankheit hd · FREISTAND.hd (Solitäreiche Marbach: kurzer, dicker Stamm unter breiter Krone).
        const weltMass = P.weltSkala > 0 && P.hoeheM > 0 && P.hd > 0;
        const frei = weltMass && P.freistand === 1;
        // DER BESTAND (T2, BESTAND unten): ein Laubbaum im Bestand wächst kurze Seitenäste und trägt seine Krone hoch und schmal.
        const bestand = weltMass && !frei && !P.conifer && P.hd >= BESTAND.hd;
        const seitenast = bestand ? BESTAND.seitenast : 1;
        const trunkR = !weltMass
            ? trunkForm
            : frei
              ? (P.height / (P.hd * FREISTAND.hd) / 2) * (P.trunkMul || 1)
              : (P.hoeheM / P.hd / 2 / P.weltSkala) * (P.trunkMul || 1);

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
                    const intn = P.height * P.whorlSpacing;
                    if (Math.floor(p2[1] / intn) > Math.floor(p[1] / intn)) {
                        const nWh = Math.round(lerp(5, 7, P.apical)),
                            uy = clamp(p2[1] / P.height, 0, 1);
                        const wShare = clamp(0.42 - 0.37 * clamp(trunkForm / 1.2, 0, 1), 0.05, 0.42);
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
                            run: myRun,
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
                                run: wRun,
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
                            run: myRun,
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
                        len: length * (P.conifer ? lerp(0.4, 0.52, P.apical) : lerp(0.55, 0.72, P.apical) * seitenast),
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
                        len: length * lerp(0.82, 0.96, P.apical) * seitenast,
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
        // DER HUB DES SCHAFTS reist mit (K20, das Welt-Maß): die Krone wuchs in der Form-Höhe, der Schaft trägt sie um `schaftHub`
        // (Vorlagen-Einheiten) höher — das Maß ihres Details (die Sichthöhe der SSE-Stufenwahl) ist die Höhe ohne ihn.
        // Der Solitär trägt seinen kurzen Stamm (FREISTAND.ansatz): der Schaft hebt die Krone, bis ihr tiefster Blatt-Anker
        // bei ansatz × Höhe steht (der Stamm misst die Höhe seines Wuchses, H/D bleibt unter dem Bestand).
        // Der Bestand (T2) hebt Stamm UND Krone: die Krone reicht über BESTAND.krone der Höhe (kein Ballen auf dem Stiel).
        const schaft = !weltMass
            ? 0
            : frei
              ? schaftHub(segs, leaves, runMeta, 0, FREISTAND.ansatz)
              : schaftHub(segs, leaves, runMeta, P.hoeheM / P.weltSkala, 0, bestand ? BESTAND.krone : 0);
        // Wind-Schwung normieren (foundry-core trägt sway0/sway1 ins Vorlagen-Attribut aWind).
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
        return { segs, leaves, trunkR, trunkForm, height: P.height, runMeta, schaftHub: schaft };
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

    // DER ATLAS-STECKBRIEF (04.10., echte GPU): was der Maler in eine Zelle setzt, als ZAHL — damit die
    // Karte nur rastert, was der Atlas trägt. EIN Atlas, vier Zellen: 0 der Baum-Zweig (Laub-Karten der Bäume routen
    // `zelle % zellen`), 1 der Weiden-Zweig (die Strähnen der Trauerweide; BLATT_ATLAS_WEIDE), 2 der Großblatt-Zweig
    // (Strauch; BLATT_ATLAS_GROSS), 3 der Wedel (S3: die Nadel-Äste der Koniferen als Strähne; BLATT_ATLAS_WEDEL —
    // vorher Nadel-Zweiglein der Nadel-Karten, die mit der Wedel-Strähne gefallen sind). `kern` = halbe Ausdehnung
    // um die Zellmitte als Anteil der halben Zelle (Breitblatt reicht Alpha>0 höchstens bis 0,7148 — die
    // Laub-Karte schneidet auf ihn zu, gemessen verwarfen die ungeschnittenen Karten 84 % ihrer Fragmente);
    // `fuellung` = mittlere Alpha-Deckung der GANZEN Zelle (512er-Ast 05.10.: 0,1796/0,1786/0,1797 bis 0,709 — davor
    // 256er-Zweige 0,1758, Rosetten 0,1403/0,1749/0,1693; Nadel-Zweiglein 0,2537, davor die Striche 0,2446). Die
    // Nadel-Zelle reicht bis 0,92 der halben Zelle (kern 1) und wird auf ihre Zelle geschnitten — vorher blutete die
    // Spray in Zelle 2. gate:asset-contract malt den Atlas und hält jede Zahl gegen den Maler.
    // Integration 05.10.: die zweite Baum-Zelle war ein Zwilling der ersten (derselbe Zweig, derselbe Strom — Prüfer W5:
    // „die zwei Baum-Zellen sind fast gleich"); sie trägt seither den Weiden-Zweig, die Bäume lesen Zelle 0.
    const BLATT_ATLAS_BREIT = { zellen: 1, kern: 0.72, fuellung: 0.1796 };
    // Die Wedel-Zelle (S3, 09.10.): der Wedel reicht bis zum Rand der halben Zelle (kern 1), Füllung 0,2742 gemessen (gate:asset-contract
    // malt den Atlas und hält die Zahl gegen den Maler; vorher die Nadel-Zweiglein 0,2537, die Lanzette bis K58 0,2811, die Hand
    // aus Nadel-Büscheln bis L2 0,3603, die Büschel-Spitze bis L2-n1 0,2713).
    const BLATT_ATLAS_WEDEL = { zelle: 3, kern: 1, fuellung: 0.31 };
    // DIE GROSSBLATT-ZELLE (05.10.): das Blatt-Mass ist eine Eigenschaft der Art — die Baum-Karten (Zelle 0) tragen
    // das Natur-Blatt der Baeume (14 px in der 512er-Zelle), die kleine Karte des Strauchs und die gestreckte Straehne
    // der Weide trugen damit 0,026 bzw. 0,039 m (Hasel und Weide: 0,06–0,15 m). Zelle 2 traegt ihr den Zweig mit
    // doppelt so langen Blaettern (ZWEIG_GROSS); Kern wie die Baum-Zellen (dieselbe Karten-Geometrie).
    const BLATT_ATLAS_GROSS = { zelle: 2, fuellung: 0.1864 };
    // DIE WEIDEN-ZELLE (Integration 05.10.): die Strähnen der Trauerweide lasen die Großblatt-Zelle — runde Hasel-Blätter
    // an einer Weide (Prüfer W5, Bild weide-8m: ein dichter Quader aus runden Blättern). Zelle 1 trägt den Weiden-Zweig
    // (ZWEIG_WEIDE: lanzettliche Blätter, Breite 16–22 % der Länge, spitz zur Zweig-Spitze geneigt); Kern wie die
    // Baum-Zellen (dieselbe Strähnen-Geometrie).
    const BLATT_ATLAS_WEIDE = { zelle: 1, fuellung: 0.1346 };
    // DIE ZELLE des Atlas in Pixeln (05.10., dritter Schnitt des Blatt-Masses): 512 statt 256 — die Karte traegt doppelt
    // so viele Texel je Meter. Das Blatt behaelt seine Pixel (14), die Zelle traegt viermal so viele: das Blatt-Mass der
    // Welt halbiert sich bei gleicher Schaerfe je Blatt. Die Stufe 0 reist nur als BC1 (Karten-Codec, ¼ der Bytes); ein
    // Wirt ohne BC laedt die Kette ab Stufe 1 (256er-Zelle, das Byte-Mass von gestern) — `blattAtlasFracht`.
    const BLATT_ATLAS_ZELLE = 512;
    // DER BLATT-ZWEIG der Breitblatt-Zellen (05.10.), in Atlas-Pixeln (die Zelle misst BLATT_ATLAS_ZELLE): Haupt-Achse `achse`,
    // `seiten` Seitenzweige der Länge `seite` (wechselständig), an jedem `unter` Unterzweige der Länge `unterSeite`·seite,
    // Blatt-Abstand `abstand` je Achse, Blatt-Länge `laenge` (±18 %, die Spitze 8 % länger), Stiel `stiel`, Zahn-Höhe
    // `zahn` px bei `zaehne` Zähnen je Seite, `adern` Seitenadern-Paare, Rippe/Ader als Deckkraft des HELLEN Nervs,
    // `falz` = Abdunklung der geknickten Hälfte, `saum` = Abstand zum Kern-Rand, `strom` = der eigene Zufalls-Strom.
    // DAS BLATT-MASS (05.10., zweiter Schnitt): die Karte der L0 misst 2,5–3,2 m (Kante = Blattstelle × blattKarte), ein
    // Blatt von 27 px lag damit bei 0,37–0,49 m (Birke, Eiche, Buche; Natur 0,05–0,12 m). Die Karten-Zahl bleibt (die
    // Dreiecke der Krone hängen an ihr), die Füllung bleibt (die Deckung hängt an ihr) — der Zweig verzweigt sich und
    // trägt halb so lange Blätter, dreimal so viele: 0,18–0,25 m in der Welt. Dritter Schnitt (512er-Zelle): ein Ast mit
    // 9 Seitenzweigen zu je 4 Unterzweigen, ~600 Blätter von 14 px — 0,09–0,12 m in der Welt (die Natur).
    const ZWEIG_BLATT = {
        achse: 312,
        seite: 170,
        seiten: 9,
        unter: 5,
        unterSeite: 0.42,
        abstand: 5.1,
        laenge: 14,
        stiel: 2.5,
        zahn: 0.6,
        zaehne: 5,
        adern: 3,
        rippe: 0.45,
        ader: 0.26,
        falz: 0.07,
        saum: 2,
        linie: 1,
        breite: [0.5, 0.14],
        winkel: [0.7, 0.45],
        seitWinkel: [0.7, 0.35],
        strom: 0x1eaf,
    };
    // DER GROSSBLATT-ZWEIG (Zelle 2, BLATT_ATLAS_GROSS): der Zweig der 256er-Zelle von gestern, doppelt gross gemalt —
    // ~150 Blaetter von 28 px (`linie` = Faktor der Strich-Breiten).
    const ZWEIG_GROSS = {
        achse: 312,
        seite: 164,
        seiten: 6,
        unter: 2,
        unterSeite: 0.5,
        abstand: 12.4,
        laenge: 28,
        stiel: 5,
        zahn: 1.2,
        zaehne: 5,
        adern: 3,
        rippe: 0.45,
        ader: 0.26,
        falz: 0.07,
        saum: 2,
        linie: 2,
        breite: [0.5, 0.14],
        winkel: [0.7, 0.45],
        seitWinkel: [0.7, 0.35],
        strom: 0x1eb0,
    };
    // DER WEIDEN-ZWEIG (Zelle 1, BLATT_ATLAS_WEIDE; Integration 05.10.): der Bau des Großblatt-Zweigs (die Zelle füllt
    // ihren Kern gleichmäßig — ein V aus wenigen Ruten las in der Strähne als aufrechte Ähren), belaubt mit lanzettlichen
    // Blättern (`breite` = Breite/Länge [Basis, Zufall]: 0,13–0,18; `laenge` 40 px), fein gesägt, ohne Seitenadern,
    // spitz zur Ruten-Spitze geneigt (`winkel` [Basis, Zufall] rad: 0,45–0,75, die Baum-Zweige 0,7–1,15); `seitWinkel`
    // = Abgang der Seitenzweige [Basis, Zufall] rad. In der Strähne HÄNGT der Zweig (pushStraehne: der Ansatz oben).
    const ZWEIG_WEIDE = {
        achse: 312,
        seite: 164,
        seiten: 6,
        unter: 2,
        unterSeite: 0.5,
        abstand: 8.5,
        laenge: 40,
        stiel: 2,
        zahn: 0.3,
        zaehne: 12,
        adern: 0,
        rippe: 0.4,
        ader: 0.2,
        falz: 0.06,
        saum: 2,
        linie: 1.4,
        breite: [0.13, 0.05],
        winkel: [0.45, 0.3],
        seitWinkel: [0.7, 0.35],
        strom: 0x1eb1,
    };
    // DER WEDEL der Wedel-Zelle (S3, 09.10.), in Atlas-Pixeln: der Nadel-Ast einer Konifere als EIN flacher Wedel — eine
    // Rachis (Haupt-Achse) vom Ansatz (unterer Rand der Zelle: die Strähne legt ihn an den Träger) zur Spitze, daran
    // wechselständig `seiten` Zweiglein im Winkel `winkel` [Basis, Zufall] rad zur Spitze geneigt, ihre Länge fällt vom
    // Ansatz (`laenge` · Zellhalbe) zur Spitze auf 0 (die Wedel-Gestalt der Tanne von oben), jedes dicht benadelt: alle
    // `abstand` px je Seite eine Nadel von `nadel` px (±20 %), Breite `breite`, `nadelWinkel` rad nach vorn. Befund (W5,
    // Späher S3): die Nadel-Zelle trug radiale Zweiglein — auf der Krone las jeder Nadel-Ast als „kugeliges Büschel"
    // (Radial-Stern), die Nadel-Äste selbst als Röhren (Koniferen-L0 78–80 % Rinde). Der Wedel ist der Ast UND seine
    // Nadeln: die Strähne zieht ihn entlang der gewachsenen Bahn (foundry-core, budget.tree[Stufe].wedel).
    // DER UMRISS DES ZWEIGS (K58, 14.10.): die Zweiglein fielen zur Spitze auf 0 (`(1 − t)^0,85`) — der Wedel war eine
    // Lanzette mit Mittelrippe, und weil die Mips des Karten-Gesetzes die Deckung halten, las er ab 20 m als EIN Riesenblatt
    // (Augen-Befund 14.10.: „Nadelbäume als große kantige Karten"). Jetzt das Band eines Fichten-Zweigs: die Länge hält bis
    // zur Spitze und bricht stumpf (`(1 − t^stumpf)^0,5`), je Zweiglein um `streu` [Basis, Zufall] zerfranst, und statt 36 dichter
    // Zweiglein tragen 16 je `unter` Unter-Zweiglein (`unterLaenge` der Zweig-Länge): jedes Zweiglein ein eigener Sprüh-Büschel,
    // die Lücken zwischen ihnen überleben die tiefen Mips — die Karte liest als Hand aus Nadel-Büscheln, nie als Klinge.
    // DIE BÜSCHEL-SPITZE (L2, 15.10.): die Unter-Zweiglein füllten ab 0,35 jedes Zweigleins die äußere Hälfte — ab Mip 1
    // ein glattes Oval (Soll-Tafel laub-kante 0,33 an der Mess-Wiese). Jetzt 10 Zweiglein, offener (`winkel`), jedes mit
    // eigener Biegung (`biegung` [Gegen-Schwung, Zufall] rad) und ab `unterAb` in `unter` Unter-Zweiglein gefächert (Winkel
    // `unterWinkel` [Basis, Zufall], Länge `unterLaenge` × 0,6–1,4): ein Fichten-Zweig aus Büscheln mit Himmel dazwischen
    // bis Mip 3, die Kante zerfällt in Richtungen statt in parallele Striche.
    // DIE FISCHGRÄTE (L2-n1, 16.10.; Prüfer L2: ab Mip 1 lasen die Büschel als Korallen mit runden Löchern, Tanne L0 0,28):
    // 9 Unter-Zweiglein je Zweiglein mit kurzen Nadeln (9 px, Strich 2,5 px alle 2,5 px) — die Zweiglein tragen Gräten
    // statt dicker Bürsten, die Kante bleibt bis Mip 2 gezackt. Echte GPU, Tafel-Pose, dieselbe Welt (Atlas getauscht):
    // laub-kante 0,226 → 0,209 (Tanne L0 0,284 → 0,190); dickere Nadeln (3 px) 0,27, dünnere und lichtere 0,26. Der Strom
    // 0xb0a7 ist der Zweig, der auch die Mip-Deckung der Fichten-Karte hält (0xbeef 0,211, ihre Stufe 5 fiel um 4,2 %).
    const WEDEL_ZWEIG = {
        seiten: 10,
        laenge: 0.95,
        stumpf: 3,
        streu: [0.5, 0.8],
        unterLaenge: 0.45,
        unterAb: 0.3,
        unterWinkel: [0.4, 0.7],
        biegung: [0.18, 0.9],
        winkel: [0.55, 0.8],
        unter: 9,
        abstand: 2.5,
        nadel: 9,
        breite: 2.5,
        nadelWinkel: 1.05,
        rand: 0.92,
        strom: 0xb0a7,
    };

    // DER BLATT-ATLAS — EINE Quelle für jeden Leser (Studio, Foundry-Worker, Host): er trägt NUR den WERT
    // (grau-warm, Mittel ~1), die Artfarbe kommt aus der Vertex-Farbe (albedo = Vertex-Blatt × Atlas-Wert).
    // Zelle 0 = Baum-Zweig, 1 = Weiden-Zweig, 2 = Großblatt-Zweig, 3 = Nadel-Zweiglein (Koniferen). `doc` ist alles mit
    // createElement("canvas") — das document des Main-Threads oder die OffscreenCanvas-Hülle des Workers
    // (foundry-core); ohne → null. Der broadleaf-Modus (vier Breitblatt-Zellen) ist gefallen: Laub und Nadel
    // teilen EINEN Atlas, EIN Material, EINE Textur.
    function bakeLeafAtlasCanvas(doc) {
        if (!doc || typeof doc.createElement !== "function") return null;
        const cv = doc.createElement("canvas");
        const Z = BLATT_ATLAS_ZELLE;
        cv.width = 4 * Z;
        cv.height = Z;
        const x = cv.getContext("2d", { willReadFrequently: true });
        if (!x) return null;
        // Zellen 0..2 — DIE BLATT-ZWEIGE (05.10., Pflanzen-Nahbild; 0 Baum, 1 Weide, 2 Großblatt). Befund (Blick-Tour V18.530, Bild 05; Kartenmaß): eine
        // Zelle trug 8–9 Blätter von 76–106 px in einem Kern von 184 px — ein Blatt war die halbe Karte, in der Welt
        // 1–1,7 m lang (Eiche, Skala 3,4), flach, mit einer harten dunklen Mittelrippe (Wert 0,4). Jetzt malt jede Zelle
        // einen ZWEIG wie eine Laub-Karte der Profis: eine leicht gebogene Achse mit wechselständigen Seiten- und
        // Unterzweigen, ~150 Blätter von `laenge` px (ZWEIG_BLATT: das Blatt-Maß der Welt 0,18–0,25 m — die Füllung
        // bleibt im Steckbrief-Band, die Karten-Zahl bleibt), jedes mit gesägtem Rand (`zaehne` je Seite), weicher
        // HELLER Mittelrippe und Seitenadern (der Blattnerv ist heller als die Spreite), einer Falz-Hälfte (die Spreite
        // ist zur Rippe geknickt, die eine Seite fängt weniger Licht) und dem Verlauf Stiel → Spitze. Alles bleibt im
        // Kern (Steckbrief).
        let ZB = ZWEIG_BLATT; // je Zelle ihr Zweig (Baum ZWEIG_BLATT, Weide ZWEIG_WEIDE, Grossblatt ZWEIG_GROSS)
        let rb = _atlasRnd(ZB.strom);
        const rand = BLATT_ATLAS_BREIT.kern * (Z / 2) - ZB.saum; // halbe Kante des Kerns in px, abzüglich Saum
        const blatt = (bx, by, rot, L, W, v) => {
            // Ein Blatt mit Stiel: Basis (bx, by), Achse in Richtung rot (Bogenmaß, 0 = nach oben), Länge L ohne Stiel.
            const cs = (r, gg, bb, a) =>
                "rgba(" +
                Math.min(255, Math.round(r * v)) +
                "," +
                Math.min(255, Math.round(gg * v)) +
                "," +
                Math.min(255, Math.round(bb * v)) +
                "," +
                a +
                ")";
            x.save();
            x.translate(bx, by);
            x.rotate(rot);
            x.strokeStyle = cs(178, 186, 150, 1);
            x.lineWidth = 0.9 * ZB.linie;
            x.beginPath();
            x.moveTo(0, 0);
            x.lineTo(0, -ZB.stiel);
            x.stroke();
            x.translate(0, -ZB.stiel);
            // Kontur: die Spreite ist am breitesten bei ~40 % (eiförmig), gesägt — jeder Zahn steigt zur Spitze hin an
            // und fällt hart ab.
            const N = 18,
                pts = [];
            for (let s = 1; s >= -1; s -= 2)
                for (let k = 0; k <= N; k++) {
                    const t = s > 0 ? k / N : 1 - k / N;
                    const huelle = Math.pow(Math.sin(Math.PI * Math.pow(t, 0.72)), 0.9);
                    const z = (t * ZB.zaehne) % 1;
                    const w = huelle * W * 0.5 + ZB.zahn * z * Math.sin(Math.PI * Math.min(1, t * 1.15));
                    pts.push([s * w, -t * L]);
                }
            const g = x.createLinearGradient(0, 0, 0, -L);
            g.addColorStop(0, cs(206, 218, 182, 1));
            g.addColorStop(0.55, cs(232, 242, 214, 1));
            g.addColorStop(1, cs(244, 250, 230, 1));
            x.fillStyle = g;
            x.beginPath();
            x.moveTo(pts[0][0], pts[0][1]);
            for (let k = 1; k < pts.length; k++) x.lineTo(pts[k][0], pts[k][1]);
            x.closePath();
            x.fill();
            // Die Falz: die linke Spreiten-Hälfte liegt flacher zum Licht (dunkler, weich).
            x.save();
            x.clip();
            x.fillStyle = "rgba(0,0,0," + ZB.falz + ")";
            x.fillRect(-W, -L, W, L);
            // Seitenadern (paarig, zur Spitze geneigt) und die Mittelrippe — HELLER als die Spreite, weich.
            x.strokeStyle = cs(250, 255, 238, ZB.ader);
            x.lineWidth = 0.5 * ZB.linie;
            for (let k = 1; k <= ZB.adern; k++) {
                const t = k / (ZB.adern + 1),
                    y0 = -t * L * 0.92,
                    lw = W * 0.5 * Math.pow(Math.sin(Math.PI * Math.pow(t, 0.72)), 0.9);
                x.beginPath();
                x.moveTo(0, y0);
                x.lineTo(lw * 0.92, y0 - lw * 0.7);
                x.moveTo(0, y0);
                x.lineTo(-lw * 0.92, y0 - lw * 0.7);
                x.stroke();
            }
            x.strokeStyle = cs(250, 255, 238, ZB.rippe);
            x.lineWidth = 0.7 * ZB.linie;
            x.beginPath();
            x.moveTo(0, 0);
            x.lineTo(0, -L * 0.9);
            x.stroke();
            x.restore();
            x.restore();
        };
        const zweige = [];
        for (let c = 0; c < BLATT_ATLAS_BREIT.zellen; c++) zweige.push([c, ZWEIG_BLATT]);
        zweige.push([BLATT_ATLAS_WEIDE.zelle, ZWEIG_WEIDE]);
        zweige.push([BLATT_ATLAS_GROSS.zelle, ZWEIG_GROSS]);
        for (const [c, zb] of zweige) {
            if (zb !== ZB) rb = _atlasRnd(zb.strom); // jeder Zweig-Typ sein eigener Strom
            ZB = zb;
            const ox = c * Z + Z / 2,
                oy = Z / 2;
            // Die Achsen des Zweigs: die Haupt-Achse von unten nach oben (leicht gebogen) und je Zelle ihre
            // Seitenzweige, wechselständig. Jede Achse: Punkte p(t), Richtung d(t).
            const achsen = [];
            const bx = ox + (rb() - 0.5) * (Z / 16),
                by = oy + ZB.achse * 0.55,
                kr = (rb() - 0.5) * Z * 0.133;
            const haupt = (t) => [bx + kr * Math.sin(Math.PI * t), by - ZB.achse * t];
            achsen.push({ p: haupt, rot0: 0, len: ZB.achse, dicke: 1.6 * ZB.linie });
            const nSeit = ZB.seiten;
            for (let k = 0; k < nSeit; k++) {
                const t0 = 0.12 + (0.66 * k) / Math.max(1, nSeit - 1) + (rb() - 0.5) * 0.06,
                    s = (k + c) % 2 ? 1 : -1,
                    w = s * (ZB.seitWinkel[0] + rb() * ZB.seitWinkel[1]),
                    L = ZB.seite * (0.8 + rb() * 0.3) * (1 - 0.35 * t0),
                    p0 = haupt(t0);
                const seite = (t) => [p0[0] + Math.sin(w) * L * t, p0[1] - Math.cos(w) * L * t];
                achsen.push({ p: seite, rot0: w, len: L, dicke: 1.1 * ZB.linie });
                // Die Unterzweige: wechselständig am Seitenzweig, zur Spitze geneigt.
                for (let u = 0; u < ZB.unter; u++) {
                    const tu = (u + 1) / (ZB.unter + 1) + (rb() - 0.5) * 0.1,
                        su = (u + k) % 2 ? 1 : -1,
                        wu = w + su * (0.55 + rb() * 0.3),
                        Lu = L * ZB.unterSeite * (0.8 + rb() * 0.4) * (1 - 0.4 * tu),
                        q0 = seite(tu);
                    achsen.push({
                        p: (t) => [q0[0] + Math.sin(wu) * Lu * t, q0[1] - Math.cos(wu) * Lu * t],
                        rot0: wu,
                        len: Lu,
                        dicke: 0.8 * ZB.linie,
                    });
                }
            }
            // Der Zweig bleibt im Kern (Steckbrief): Holz und Blatt schneiden auf das Kern-Quadrat der Zelle.
            x.save();
            x.beginPath();
            x.rect(ox - rand, oy - rand, 2 * rand, 2 * rand);
            x.clip();
            // Erst das Holz (hinten), dann die Blätter.
            x.strokeStyle = "rgba(150,142,112,1)";
            x.lineCap = "round";
            for (const a of achsen) {
                x.lineWidth = a.dicke;
                x.beginPath();
                const p0 = a.p(0);
                x.moveTo(p0[0], p0[1]);
                for (let k = 1; k <= 8; k++) {
                    const q = a.p(k / 8);
                    x.lineTo(q[0], q[1]);
                }
                x.stroke();
            }
            x.lineCap = "butt";
            for (const a of achsen) {
                const nB = Math.max(2, Math.round(a.len / ZB.abstand));
                for (let k = 0; k <= nB; k++) {
                    const t = k === nB ? 1 : (k + 0.5) / (nB + 0.5),
                        q = a.p(t),
                        q2 = a.p(Math.min(1, t + 0.02)),
                        q1 = a.p(Math.max(0, t - 0.02));
                    const dr = Math.atan2(q2[0] - q1[0], -(q2[1] - q1[1])); // Achsen-Richtung (0 = nach oben)
                    const s = k % 2 ? 1 : -1;
                    const rot = k === nB ? dr : dr + s * (ZB.winkel[0] + rb() * ZB.winkel[1]);
                    let L = ZB.laenge * (0.82 + rb() * 0.36) * (k === nB ? 1.08 : 1);
                    const W = L * (ZB.breite[0] + rb() * ZB.breite[1]),
                        v = 0.86 + rb() * 0.3;
                    // Im Kern bleiben: das Blatt kürzt sich, bis Spitze und Flanken im Rand liegen (sonst fällt es).
                    const reicht = (Lx) => {
                        const ex = Math.sin(rot),
                            ey = -Math.cos(rot);
                        for (const f of [0.4, 1]) {
                            const r = (ZB.stiel + Lx * f) * 1,
                                h = f < 1 ? W * 0.5 + ZB.zahn : 0;
                            for (const sg of [-1, 1]) {
                                const px = q[0] + ex * r + sg * -ey * h - ox,
                                    py = q[1] + ey * r + sg * ex * h - oy;
                                if (Math.abs(px) > rand || Math.abs(py) > rand) return false;
                            }
                        }
                        return true;
                    };
                    while (L > ZB.laenge * 0.5 && !reicht(L)) L *= 0.9;
                    if (!reicht(L)) continue;
                    blatt(q[0], q[1], rot, L, Math.min(W, L * 0.64), v);
                }
            }
            x.restore();
        }
        // Zelle 3 — DER WEDEL (Wert-only, WEDEL_ZWEIG) für die Nadel-Äste der Koniferen (L0 distal, L1 ganz, als Strähne),
        // auf IHRE Zelle geschnitten: die Rachis vom Ansatz (unten) zur Spitze (oben), wechselständige benadelte
        // Zweiglein, deren Länge zur Spitze fällt — jede Nadel ein kurzer Strich schräg nach vorn, je Achse EIN Pfad.
        {
            const WZ = WEDEL_ZWEIG;
            const rg = _atlasRnd(WZ.strom); // eigener Strom (verbraucht kein Welt-RNG)
            const z0 = BLATT_ATLAS_WEDEL.zelle * Z;
            const ox = z0 + Z / 2,
                halbe = (Z / 2) * WZ.rand,
                yA = Z / 2 + halbe,
                yS = Z / 2 - halbe;
            x.save();
            x.beginPath();
            x.rect(z0, 0, Z, Z);
            x.clip();
            x.lineCap = "round";
            // Eine Achse (Start p0, Richtung w — 0 = zur Spitze —, Länge L, Krümmung k): das Holz und ihre Nadeln.
            const achse = (p0, w, L, k, dicke, nadelMul) => {
                const p = (t) => {
                    const a = w + k * t;
                    return [p0[0] + Math.sin(a) * L * t, p0[1] - Math.cos(a) * L * t];
                };
                x.strokeStyle = "rgba(150,142,112,1)";
                x.lineWidth = dicke;
                x.beginPath();
                x.moveTo(p0[0], p0[1]);
                for (let i = 1; i <= 6; i++) {
                    const q = p(i / 6);
                    x.lineTo(q[0], q[1]);
                }
                x.stroke();
                const v = 0.84 + rg() * 0.24;
                x.strokeStyle =
                    "rgba(" + Math.round(236 * v) + "," + Math.round(244 * v) + "," + Math.round(224 * v) + ",1)";
                x.lineWidth = WZ.breite;
                x.beginPath();
                const n = Math.max(2, Math.round(L / WZ.abstand));
                for (let i = 0; i < n; i++) {
                    const t = (i + 0.5) / n,
                        q = p(t),
                        a = w + k * t;
                    for (const sg of [-1, 1]) {
                        const r = a + sg * (WZ.nadelWinkel + (rg() - 0.5) * 0.4),
                            l = WZ.nadel * nadelMul * (0.8 + rg() * 0.4) * (1 - 0.3 * t);
                        x.moveTo(q[0], q[1]);
                        x.lineTo(q[0] + Math.sin(r) * l, q[1] - Math.cos(r) * l);
                    }
                }
                x.stroke();
                return p;
            };
            // Die Rachis (leicht gebogen) trägt die Zweiglein; ihre eigenen Nadeln sind kürzer (sie liegt im Wedel).
            const kr = (rg() - 0.5) * 0.12;
            const rachis = achse([ox, yA], 0, yA - yS, kr, 2.2, 0.8);
            for (let i = 0; i < WZ.seiten; i++) {
                const t = 0.04 + (0.9 * (i + 0.5)) / WZ.seiten,
                    sg = i % 2 ? 1 : -1,
                    q = rachis(t),
                    w = kr * t + sg * (WZ.winkel[0] + rg() * WZ.winkel[1]),
                    L =
                        halbe *
                        WZ.laenge *
                        Math.pow(1 - Math.pow(t, WZ.stumpf), 0.5) *
                        (WZ.streu[0] + rg() * WZ.streu[1]);
                if (L < WZ.nadel) continue;
                const kz = -sg * WZ.biegung[0] + (rg() - 0.5) * WZ.biegung[1];
                const pz = achse(q, w, L, kz, 1.3, 1);
                // Unter-Zweiglein am äußeren Teil der langen Zweiglein: die Spitze des Zweigleins fächert zum Büschel.
                for (let u = 0; u < WZ.unter && L > 6 * WZ.nadel; u++) {
                    const tu = WZ.unterAb + ((0.9 - WZ.unterAb) * u) / Math.max(1, WZ.unter - 1),
                        su = (u + i) % 2 ? 1 : -1;
                    achse(
                        pz(tu),
                        w + kz * tu + su * (WZ.unterWinkel[0] + rg() * WZ.unterWinkel[1]),
                        L * WZ.unterLaenge * (0.6 + rg() * 0.8) * (1 - 0.4 * tu),
                        (rg() - 0.5) * WZ.biegung[1],
                        0.9,
                        0.9
                    );
                }
            }
            x.restore();
        }
        return cv;
    }

    // DAS ATLAS-BILD (04.10., W5; S7: EIN Mip-Gesetz): was jeder Leser als TEXTUR hochlädt — die gemalte Leinwand,
    // gelesen und für die GPU vorbereitet, mit ihrer ganzen Mip-Kette. Befund (Lab, echte GPU): die Leinwand reicht
    // ungerade Alpha-Texel mit der Farbe 0 (schwarz) weiter — die bilineare Filterung und die Mips mischten dieses Schwarz
    // in jeden Rand (die 4-px-Nadelstriche lasen auf Armlänge mit 47 % ihrer Albedo), und die Box-Mips mittelten die
    // dünnen Striche unter die Alpha-Schwelle (Nadel-Deckung 0,24 → 0,14 auf Stufe 4). Darum:
    //   (1) jede Zelle trägt dasselbe lineare Mittel `wert` ihrer deckenden Texel (Alpha ≥ 0,5) — gleichgezogen auf
    //       das kleinste Zell-Mittel je Kanal (nur abwärts skaliert, kein Kappen);
    //   (2) die Mips sind die des Karten-Gesetzes (impostorMips, die vier Zellen als Ansichten NEBENEINANDER): je Zelle
    //       und Stufe deckt derselbe Texel-Anteil wie auf Stufe 0, die nicht deckenden Texel tragen `wert` (der Atlas
    //       „blutet"), Stufe 0 behält die Kantenglättung des Malers; unter einem Texel je Zelle mitteln die letzten
    //       Stufen die Box (die Kette reicht bis 1×1, sonst ist die Textur unvollständig);
    //   (3) die Zeilen liegen in Textur-Ordnung (Zeile 0 = v 0 = der untere Leinwand-Rand, wie eine Leinwand-Textur
    //       mit flipY), damit jede Karte dieselben UV liest wie zuvor.
    // Leser (Studio-Stoff, Host-Stoff) laden `mips` (Stufe 0 = `daten`) und teilen die Atlas-Farbe durch `wert`: der
    // Atlas trägt NUR den Wert um 1, die Albedo der Karte ist im Mittel die Vertex-Farbe (FARB-GESETZ) — wie die
    // Klinge. Ohne Leinwand → null.
    function bakeLeafAtlasBild(doc) {
        const cv = bakeLeafAtlasCanvas(doc);
        if (!cv) return null;
        const W = cv.width,
            H = cv.height,
            Z = W / 4;
        const px = cv.getContext("2d").getImageData(0, 0, W, H).data;
        const LIN = new Float32Array(256);
        for (let c = 0; c < 256; c++) {
            const v = c / 255;
            LIN[c] = v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
        }
        const mittel = [];
        for (let c = 0; c < 4; c++) {
            let n = 0;
            const sm = [0, 0, 0];
            for (let y = 0; y < H; y++)
                for (let x = c * Z; x < (c + 1) * Z; x++) {
                    const i = (y * W + x) * 4;
                    if (px[i + 3] < 128) continue;
                    n++;
                    for (let k = 0; k < 3; k++) sm[k] += LIN[px[i + k]];
                }
            mittel.push(n ? sm.map((v) => v / n) : [1, 1, 1]);
        }
        const wert = [0, 1, 2].map((k) => Math.min(mittel[0][k], mittel[1][k], mittel[2][k], mittel[3][k]));
        // Stufe 0 linear in Textur-Ordnung: deckend gleichgezogen, sonst `wert`; Alpha roh.
        const lin = new Uint8Array(W * H * 4);
        for (let y = 0; y < H; y++)
            for (let x = 0; x < W; x++) {
                const i = (y * W + x) * 4,
                    o = ((H - 1 - y) * W + x) * 4,
                    c = Math.min(3, Math.floor(x / Z));
                const a = px[i + 3];
                for (let k = 0; k < 3; k++)
                    lin[o + k] = Math.round(
                        Math.min(1, a >= 128 ? (LIN[px[i + k]] * wert[k]) / mittel[c][k] : wert[k]) * 255
                    );
                lin[o + 3] = a;
            }
        const ms = impostorMips(lin, W, H, 4, 0.5, 64, { quer: true, blut: wert, alphaRoh: true, glatt: true });
        const mips = ms.stufen.map((st) => ({ data: st.data, width: st.w, height: st.h }));
        // Unter einem Texel je Zelle: die Box (gerade Alpha), bis 1×1.
        let t = mips[mips.length - 1];
        while (t.width > 1 || t.height > 1) {
            const w2 = Math.max(1, t.width >> 1),
                h2 = Math.max(1, t.height >> 1),
                d = new Uint8Array(w2 * h2 * 4);
            for (let y = 0; y < h2; y++)
                for (let x = 0; x < w2; x++)
                    for (let k = 0; k < 4; k++) {
                        let sm = 0;
                        for (let dy = 0; dy < 2; dy++)
                            for (let dx = 0; dx < 2; dx++)
                                sm +=
                                    t.data[
                                        (Math.min(t.height - 1, 2 * y + dy) * t.width +
                                            Math.min(t.width - 1, 2 * x + dx)) *
                                            4 +
                                            k
                                    ];
                        d[(y * w2 + x) * 4 + k] = Math.round(sm / 4);
                    }
            t = { data: d, width: w2, height: h2 };
            mips.push(t);
        }
        return { breite: W, hoehe: H, daten: mips[0].data, mips: mips, wert: wert };
    }

    // DIE FRACHT DES BLATT-ATLAS (05.10.): was der Wirt als Textur laedt, je Format EINE Stufe desselben Bilds —
    //   bc    die Kette ab Stufe 0 (512er-Zelle) als BC3-sRGB (K20: bc3Kodiere, 16 B je 4×4 — die glatte Alpha der Kette reist mit;
    //         der alphaTest des Laub-Stoffs schneidet zwischen den Texeln), bis die Zelle KARTEN_GESETZ.minSeite misst;
    //   rgba  die Kette ab Stufe 1 (256er-Zelle) — der Wirt ohne BC laedt die Bytes von gestern (1,3 MB statt 5,3 MB).
    // DIE FRACHT IST VORMULTIPLIZIERT, in JEDEM Format (das Karten-Gesetz, KARTEN_GESETZ): BC1 kann es nicht anders —
    // sein Index 3 ist transparent SCHWARZ —, die rgba-Kette traegt dasselbe Gesetz (rgb · alpha, linear; ein Texel
    // ohne Deckung ist 0,0,0,0), und der EINE Leser der Welt (`_blattAtlasProbe`) teilt das gefilterte rgb durch alpha:
    // das alpha-gewichtete Mittel der deckenden Texel, kein dunkler Saum auf keiner Stufe. Befund (Pruefer W5, 05.10.):
    // die BC1-Kette ohne Teilen las das Laub 4–22 % dunkler als Labor und L2-Karte (Zelle 512 → 4 px: Y 0,956 → 0,78).
    // Das Labor (foundry-core) liest das BLUTENDE Bild selbst (bakeLeafAtlasBild), nie die Fracht.
    // `mitBc` false: nur rgba (wer nie BC laedt, kodiert nie). Leser: die Transport-Schale des Foundry-Workers
    // (das Buch) und der Wirt, der vor dem Buch malt (`_ensureFoliageClusterAtlas`). Ohne Bild → null.
    function blattAtlasFracht(bild, mitBc) {
        if (!bild || !Array.isArray(bild.mips) || bild.mips.length < 2) return null;
        const vor = (m) => {
            const d = new Uint8Array(m.data);
            for (let i = 0; i < d.length; i += 4) {
                const a = d[i + 3];
                if (a === 255) continue;
                for (let k = 0; k < 3; k++) d[i + k] = a ? linZuSrgb8((LIN_AUS_SRGB8[d[i + k]] * a) / 255) : 0;
            }
            return { data: d, width: m.width, height: m.height };
        };
        const r = bild.mips.slice(1).map(vor);
        const out = { wert: bild.wert, rgba: { breite: r[0].width, hoehe: r[0].height, mips: r }, bc: null };
        if (mitBc !== false) {
            // BC3 (K20): die glatte Alpha der Kette reist mit (BC1 schnitt sie an 128 auf ein Bit), die Farbe
            // vormultipliziert wie die rgba-Kette. Die Kette endet, bevor eine Zellzeile unter vier Blöcke fällt: der
            // Vier-Farben-Block trägt die vormultiplizierte Farbe von Texeln sehr verschiedener Deckung nicht (die 8er-Zelle
            // las 7 % zu dunkel, gate:pflanzen-nah (F)); jenseits liest die Welt die letzte Stufe — die L1 endet bei λ ≈ 3.
            const bc = [];
            for (const m of bild.mips) {
                if (m.width / 4 < 4 * KARTEN_GESETZ.minSeite || m.height < 4 * KARTEN_GESETZ.minSeite) break;
                bc.push({ data: bc3Kodiere(vor(m).data, m.width, m.height), width: m.width, height: m.height });
            }
            out.bc = { format: "bc3", breite: bild.breite, hoehe: bild.hoehe, mips: bc };
        }
        return out;
    }

    // DAS NEUE KLEID Welle 1 — DIE LAUB-GEOMETRIE aus der Vorlage (`pushLeafClusterQuad`, byte-
    // treu): ein Quad je Blatt (2 Dreiecke), die Achsen aus dir/up + Roll aus phase, die UV in
    // die Atlas-Zelle geroutet. REIN (plain Arrays raus) — der Aufrufer (Main + Portal) wickelt
    // sie in eine BufferGeometry + hängt sein Material an (das dieselben Attribute liest). Die
    // Attribute: position/normal/color/uv — der Wind liest die Gestalt selbst (`windAusschlag`), kein Schwung-Attribut.
    // `leaves`: [{pos:[x,y,z], dir:[..], up:[..], scale, needle, phase}] (aus growSkeleton; phase dreht das Quad).
    // `opts`: { leafColor:[r,g,b] 0..1, scale (Breitblatt ~2.35), needleScale (~1.3), cell (erzwingt die Zelle),
    //          kern (Atlas-Kern der Breitblatt-Zellen, `BLATT_ATLAS_BREIT.kern`; ohne = 1, die ganze Zelle) }.
    // Der Kern schneidet Quad UND UV um die Zellmitte gleich zu: jeder verbleibende Punkt liest dasselbe
    // Texel wie vorher (bildgleich), nur der leere Rand wird nicht mehr gerastert. Nadel-Karten bleiben ganz.
    function buildFoliageQuads(leaves, opts) {
        opts = opts || {};
        const col = opts.leafColor || [0.0685, 0.1946, 0.0252]; // 0x4a7a2c als sRGB-Absicht (Farb-Gesetz)
        const bScale = opts.scale != null ? opts.scale : 2.35;
        const nScale = opts.needleScale != null ? opts.needleScale : 1.3;
        const kern = opts.kern != null ? opts.kern : 1;
        if (!(kern > 0 && kern <= 1)) throw new Error("buildFoliageQuads: kern muss in (0, 1] liegen, ist " + kern);
        const list = leaves || [];
        const M = list.length;
        const positions = new Float32Array(M * 4 * 3);
        const normals = new Float32Array(M * 4 * 3);
        const colors = new Float32Array(M * 4 * 3);
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
            // Die Normale zweier orthonormaler Achsen: eine Komponente, die mathematisch 0 ist, bleibt als
            // Auslöschungs-Rest (~1e-18) stehen — und dessen Wert hängt am letzten Bit von sin/cos, das die
            // Plattformen verschieden runden (V8: Linux glibc-libm, Windows fdlibm). float32 trägt den Rest
            // exakt: tanne-s12345-L1 Quad 95 war y = 2,17e-18 (Windows) gegen 3,14e-18 (Linux-CI). Reste unter
            // 1e-9 sind kein Gesetz, sondern Rauschen — sie werden 0, die Karte ist auf jeder Plattform bitgleich.
            const nrm = _vnorm(_vcross(r1, r2)).map((c) => (Math.abs(c) < 1e-9 ? 0 : c));
            const needle = !!l.needle;
            // opts.cell erzwingt die Atlas-Zelle (die Studio-Karten routen sie je Blatt); ohne opts.cell der
            // Zyklus des Steckbriefs (Nadel → ihre Zelle, sonst li % Breitblatt-Zellen).
            const cell =
                opts.cell != null ? opts.cell : needle ? BLATT_ATLAS_WEDEL.zelle : li % BLATT_ATLAS_BREIT.zellen;
            const k = needle ? BLATT_ATLAS_WEDEL.kern : kern;
            const s = (l.scale || 0.5) * (needle ? nScale : bScale) * 0.5 * k;
            // k = 1: u0 = cell·0.25, u1 = u0 + 0.25, v 0..1 — exakt die alten Werte (Byte-Treue ohne Kern).
            const u0 = cell * 0.25 + 0.125 * (1 - k),
                u1 = u0 + 0.25 * k,
                v0 = 0.5 * (1 - k),
                v1 = v0 + k;
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
                uvs[vw * 2] = i === 0 || i === 3 ? u0 : u1;
                uvs[vw * 2 + 1] = i < 2 ? v0 : v1;
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
        return { positions, normals, colors, uvs, indices, count: qi };
    }

    // DIE NORMALE DER KRONE (K68, Soll-Tafel laub): jede Karte der Krone lichtet mit der Normale des Kronen-Ellipsoids an
    // ihrer Stelle — der Gradient von Σ((p − c)/r)² über die Kartenwolke (c die Mitte, r die halben Ausdehnungen, mindestens
    // KRONEN_NORMALE.rMin) —, gemischt mit ihrer eigenen, zur Außenseite gewendeten Karten-Normale (Anteil KRONEN_NORMALE.karte):
    // die Krone hat eine Licht- und eine Schattenseite und liest als Volumen, nie als Stapel flacher Tafeln (SpeedTree,
    // Kugel-Normalen der Laub-Karten). Bis K68 trug jede Karte ihre flache Normale (buildFoliageQuads): je Karte EIN Ton, die
    // Nachbar-Karte im Gegenlicht schwarz neben einer im Licht. `teile`: [{ pos, nor }] (Float32Arrays je Geometrie, xyz je
    // Ecke), gemeinsam EINE Krone; die Normalen werden an Ort und Stelle überschrieben. Rein, kein THREE.
    // DIE PARTIEN DER KRONE (T2, 16.10.): trägt ein Teil seine Partie (`partie`, die Lauf-Id aus kronenPartien), lichtet jede
    // Partie als ihr EIGENES Ellipsoid — die Laubkrone liest als Ast-Partien mit je einer Licht- und Schattenseite, nie als
    // EIN Ballen (Spike T1: wie viel der Kronen-Helligkeit ein glattes Feld erklärt, Licht-R² 1-m-Blöcke, je Partie der Tiefe 2
    // 0,31–0,48 statt 0,83–0,93; das Soll-Bild 01 trägt 0,16–0,21). Teile ohne Partie bilden zusammen EINE Krone (Nadel,
    // Strauch, Trauer-Vorhang — bitgleich zu K68).
    const KRONEN_NORMALE = { karte: 0.3, rMin: 0.25, tiefe: 2 };
    function kronenNormalen(teile, opts) {
        const karte = opts && opts.karte != null ? opts.karte : KRONEN_NORMALE.karte;
        const rMin = opts && opts.rMin != null ? opts.rMin : KRONEN_NORMALE.rMin;
        const gruppen = new Map();
        for (const t of teile || []) {
            const k = t.partie == null ? -1 : t.partie;
            if (!gruppen.has(k)) gruppen.set(k, []);
            gruppen.get(k).push(t);
        }
        let n = 0;
        for (const g of gruppen.values()) n += kronenEllipsoid(g, karte, rMin);
        return n;
    }
    // Die Partie jedes Laufs eines gewachsenen Skeletts (`runMeta`, growSkeleton): sein Vorfahr der Tiefe `tiefe`
    // (KRONEN_NORMALE.tiefe; der Stamm-Lauf 0 hat Tiefe 0, jede Gabel eine mehr) — ein flacher sitzender Lauf ist seine
    // eigene. Die Eiche trägt so 12–16 Partien. Rückgabe: (run) → Partie. Leser: foundry-core (die Laub-Teile vor der Normale
    // der Krone) und gate:pflanzen-nah (V, je Partie).
    function kronenPartien(runMeta, tiefe) {
        const T = tiefe == null ? KRONEN_NORMALE.tiefe : tiefe;
        const M = runMeta || {};
        const memo = new Map();
        return (r) => {
            let p = memo.get(r);
            if (p !== undefined) return p;
            let d = 0;
            for (let x = r; x > 0 && M[x]; x = M[x].parentRun) d++;
            p = r;
            for (; d > T; d--) p = M[p].parentRun;
            memo.set(r, p);
            return p;
        };
    }
    function kronenEllipsoid(teile, karte, rMin) {
        const mn = [Infinity, Infinity, Infinity],
            mx = [-Infinity, -Infinity, -Infinity];
        for (const t of teile || [])
            for (let i = 0; i + 2 < t.pos.length; i += 3)
                for (let a = 0; a < 3; a++) {
                    const v = t.pos[i + a];
                    if (v < mn[a]) mn[a] = v;
                    if (v > mx[a]) mx[a] = v;
                }
        if (!(mx[0] >= mn[0])) return 0;
        const c = [0, 1, 2].map((a) => (mn[a] + mx[a]) / 2);
        const r2 = [0, 1, 2].map((a) => Math.pow(Math.max((mx[a] - mn[a]) / 2, rMin), 2));
        let n = 0;
        for (const t of teile) {
            const P = t.pos,
                N = t.nor;
            for (let i = 0; i + 2 < P.length; i += 3) {
                let dx = (P[i] - c[0]) / r2[0],
                    dy = (P[i + 1] - c[1]) / r2[1],
                    dz = (P[i + 2] - c[2]) / r2[2];
                const dl = Math.hypot(dx, dy, dz);
                if (dl < 1e-9) {
                    dx = 0;
                    dy = 1;
                    dz = 0;
                } else {
                    dx /= dl;
                    dy /= dl;
                    dz /= dl;
                }
                // die Karten-Normale zur Außenseite gewendet (eine Karte hat zwei Seiten; die Krone nur eine Außenseite)
                const s = N[i] * dx + N[i + 1] * dy + N[i + 2] * dz < 0 ? -karte : karte;
                const x = dx * (1 - karte) + N[i] * s,
                    y = dy * (1 - karte) + N[i + 1] * s,
                    z = dz * (1 - karte) + N[i + 2] * s;
                const l = Math.hypot(x, y, z) || 1;
                // Reste unter 1e-9 sind Rauschen der Plattform (vgl. buildFoliageQuads): 0, die Krone ist überall bitgleich
                N[i] = Math.abs(x / l) < 1e-9 ? 0 : x / l;
                N[i + 1] = Math.abs(y / l) < 1e-9 ? 0 : y / l;
                N[i + 2] = Math.abs(z / l) < 1e-9 ? 0 : z / l;
                n++;
            }
        }
        return n;
    }

    // DIE LAGEN EINER KRONE (S3, 09.10.) — der Bau-Regler der Karten-Wahl: wie viele Karten-Lagen ein Kronen-Pixel trägt,
    // wenn JEDE Blattstelle ihre Karte trüge (Kante `kante` Blatt-Größen, Kern `kern`; dieselbe Karten-Geometrie wie
    // buildFoliageQuads). Gerastert in 8 Ansichten (4 Azimute × Blick 0° und 45° von unten), `aufl` Pixel über die
    // Ausdehnung; gemittelt über die Pixel mit mindestens einer Lage. Die Stufe trägt dann den Anteil, der die Zeile
    // `lagen` hält (foundry-core `__lagenWahl`) — die Zeile IST der Regler, gate:asset-contract misst mit der kronen-linse
    // (24 Ansichten) nach: Schätzung/Messung 0,87–0,94 über 16 Laub-Gestalten (Kern V18.536).
    function kronenLagen(blaetter, kante, kern, aufl) {
        const q = buildFoliageQuads(
            blaetter.map((l) => ({ pos: l.pos, dir: l.dir, up: l.up, scale: l.scale * kante, phase: l.phase })),
            { scale: 1, cell: 0, kern: kern }
        );
        return quadLagen(q.positions, q.count, aufl);
    }
    // Die Lagen beliebiger Karten (je Karte vier Ecken in Bau-Reihenfolge, Dreiecke 0-1-2 und 0-2-3): die Strähnen der
    // Trauer-Krone und der Wedel lesen dasselbe Raster wie die Laub-Karten.
    function quadLagen(P, n, aufl) {
        if (!n) return 0;
        const U = new Float32Array(n * 4),
            V = new Float32Array(n * 4);
        let sQ = 0,
            nQ = 0;
        for (let k = 0; k < 8; k++) {
            const th = ((k % 4) * Math.PI) / 4,
                e = k < 4 ? 0 : Math.PI / 4;
            const cx = Math.cos(th),
                cz = Math.sin(th),
                ux = Math.sin(th) * Math.sin(e),
                uy = Math.cos(e),
                uz = -Math.cos(th) * Math.sin(e);
            let u0 = Infinity,
                u1 = -Infinity,
                v0 = Infinity,
                v1 = -Infinity;
            for (let i = 0; i < n * 4; i++) {
                U[i] = P[i * 3] * cx + P[i * 3 + 2] * cz;
                V[i] = P[i * 3] * ux + P[i * 3 + 1] * uy + P[i * 3 + 2] * uz;
                if (U[i] < u0) u0 = U[i];
                if (U[i] > u1) u1 = U[i];
                if (V[i] < v0) v0 = V[i];
                if (V[i] > v1) v1 = V[i];
            }
            const px = Math.max(u1 - u0, v1 - v0) / aufl;
            if (!(px > 0)) continue;
            const W = Math.ceil((u1 - u0) / px) + 2,
                H = Math.ceil((v1 - v0) / px) + 2;
            const buf = new Uint16Array(W * H);
            for (let c = 0; c < n; c++)
                for (let d = 0; d < 2; d++) {
                    const a = c * 4,
                        b = c * 4 + 1 + d,
                        f = c * 4 + 2 + d;
                    const ax = (U[a] - u0) / px,
                        ay = (V[a] - v0) / px,
                        bx = (U[b] - u0) / px,
                        by = (V[b] - v0) / px,
                        qx = (U[f] - u0) / px,
                        qy = (V[f] - v0) / px;
                    const fl = (bx - ax) * (qy - ay) - (by - ay) * (qx - ax);
                    if (Math.abs(fl) < 1e-12) continue;
                    const xa = Math.max(0, Math.floor(Math.min(ax, bx, qx))),
                        xb = Math.min(W - 1, Math.ceil(Math.max(ax, bx, qx))),
                        ya = Math.max(0, Math.floor(Math.min(ay, by, qy))),
                        yb = Math.min(H - 1, Math.ceil(Math.max(ay, by, qy)));
                    for (let y = ya; y <= yb; y++)
                        for (let x = xa; x <= xb; x++) {
                            const sx = x + 0.5,
                                sy = y + 0.5;
                            const w0 = ((bx - sx) * (qy - sy) - (by - sy) * (qx - sx)) / fl,
                                w1 = ((qx - sx) * (ay - sy) - (qy - sy) * (ax - sx)) / fl;
                            if (w0 < 0 || w1 < 0 || 1 - w0 - w1 <= 0) continue;
                            buf[y * W + x]++;
                        }
                }
            for (let i = 0; i < buf.length; i++)
                if (buf[i]) {
                    sQ += buf[i];
                    nQ++;
                }
        }
        return nQ ? sQ / nQ : 0;
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

    // DAS BLÜTENBLATT (05.10., Pflanzen-Nahbild). Befund (Blick-Tour V18.530, Bild 04): die Blüte nah war eine flache
    // Scheibe — jedes Blütenblatt eine einfarbige Klinge, alle in EINER Ebene um die Achse, gleich lang. Die Natur: der
    // Grund trägt das Saftmal (tiefer und satter: die Blütenfarbe linear hoch `potenz`, Verlauf bis `grundBis` der
    // Länge), die Spitze biegt zurück (`biegen`), und kein Blatt liegt wie das andere — je Blatt ±`neigung` Hebung
    // (Anteil des Achsen-Zuschlags), ±`drehung` rad um die eigene Achse und ±`laenge` Länge, gewürfelt aus dem Ort
    // (kein rnd()-Zug: L0 und L2 bleiben dasselbe Individuum). Die Drehung rechnet als Reihe (plattformgleich, kein
    // sin/cos auf dem Würfel).
    const BLUETEN_BLATT = { potenz: 1.6, grundBis: 0.38, biegen: 0.35, neigung: 0.45, drehung: 0.4, laenge: 0.14 };

    // DIE BLATT-UNTERSEITE (05.10.): die Spreite ist unten heller und matter als oben (Palisaden- gegen Schwamm-
    // Gewebe, die Behaarung) — und von unten gegen den Himmel scheint sie durch. Die Krone liest das über die
    // SICHTBARE Seite: Welt-Normale ny der gesehenen Fläche (doppelseitig: die Rückseite trägt die gespiegelte Normale)
    // nach unten gewandt = Unterseite; Gewicht clamp(0,5 − ny·steil, 0, 1), dort Albedo × `hell`, um `grau` zur
    // Luminanz entsättigt. Labor (Laub-Shader) und Welt (Laub-Stoff des Wirts) lesen DIESE Zahlen.
    const BLATT_UNTERSEITE = { hell: 1.3, grau: 0.22, steil: 1.5 };

    // EINS W4 (P1) — DIE 30-VERT-BLATT-KLINGE (der `pushLeaf`-Port, Vorlage Z.247-275): das
    // L0-Blatt ist echte 3D-GEOMETRIE — eine Superformel-Kontur über 14 Segmente (30 Verts,
    // 28 Tris je Blatt), QUER-GEMULDET (cupZ = −cup·(s−s²)·scale, cup 0.5) → die Klinge fängt
    // Licht als gekrümmte Fläche, nicht als bemalte Karte. Die Vorlage nimmt Karten NUR für
    // L1 (`useTexL = __lod===1`, Z.647); L0 sind Klingen — exakt diese Teilung stellt W4 her.
    // REIN (plain Arrays raus, kein THREE); die Attribute im SELBEN Layout wie
    // `buildFoliageQuads` (position/normal/color/uv + indices — die Float32-Naht,
    // der Aufrufer wickelt sie identisch in eine BufferGeometry). Normalen = Face-Akkumulation
    // pro Blatt (das THREE-`computeVertexNormals`-Gesetz, ohne THREE).
    // `leaves`: [{pos, dir, up, scale, needle}] (aus growSkeleton).
    // `opts`: { leafColor:[r,g,b], scale (Multiplikator, Vorlage roh=1), cup (~0.5),
    //           leafShape: Key in LEAF_SHAPES ODER {m,n1,n2,n3,a,b,wsc},
    //           grund ([r,g,b] am Klingen-Grund — die Farbe läuft bis `grundBis` (Anteil der Länge) in leafColor; die
    //                 Blüte: Saftmal und Schlund, BLUETEN_BLATT),
    //           biegen (die Spitze biegt um biegen·s²·Länge gegen die Mulde zurück — das Blütenblatt rollt sich aus der
    //                 Ebene, die Scheibe fällt) }. Ohne grund/biegen byte-gleich.
    function buildLeafBlades(leaves, opts) {
        opts = opts || {};
        const col = opts.leafColor || [0.0685, 0.1946, 0.0252]; // 0x4a7a2c als sRGB-Absicht (Farb-Gesetz)
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
            const base = vw;
            for (let i = 0; i <= SEG; i++) {
                const s = i / SEG;
                const phi = Math.PI * s; // halber Umlauf → Tropfen
                const w = superR(phi, sh.m, sh.n1, sh.n2, sh.n3, sh.a, sh.b) * sh.wsc;
                const along = s * scale;
                const cupZ0 = -cup * (s - s * s) * scale; // die Quer-MULDE (Vorlage cupZ)
                const cupZ = opts.biegen ? cupZ0 - opts.biegen * s * s * s * scale : cupZ0;
                const mx = cx + dirOut[0] * along + u2[0] * cupZ;
                const my = cy + dirOut[1] * along + u2[1] * cupZ;
                const mz = cz + dirOut[2] * along + u2[2] * cupZ;
                const ox = right[0] * w * scale,
                    oy = right[1] * w * scale,
                    oz = right[2] * w * scale;
                // Die Farbe: ohne `grund` die Blatt-Farbe, sonst der Verlauf vom Grund in sie (smoothstep bis grundBis).
                let cr = col;
                if (opts.grund) {
                    const t = Math.min(1, s / (opts.grundBis || 0.4)),
                        k = t * t * (3 - 2 * t);
                    cr = [
                        opts.grund[0] + (col[0] - opts.grund[0]) * k,
                        opts.grund[1] + (col[1] - opts.grund[1]) * k,
                        opts.grund[2] + (col[2] - opts.grund[2]) * k,
                    ];
                }
                // linke + rechte Konturspalte (2 Verts je Segment-Reihe)
                let v3 = vw * 3;
                positions[v3] = mx - ox;
                positions[v3 + 1] = my - oy;
                positions[v3 + 2] = mz - oz;
                colors[v3] = cr[0];
                colors[v3 + 1] = cr[1];
                colors[v3 + 2] = cr[2];
                uvs[vw * 2] = 0;
                uvs[vw * 2 + 1] = s;
                vw++;
                v3 = vw * 3;
                positions[v3] = mx + ox;
                positions[v3 + 1] = my + oy;
                positions[v3 + 2] = mz + oz;
                colors[v3] = cr[0];
                colors[v3 + 1] = cr[1];
                colors[v3 + 2] = cr[2];
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
                ? { positions, normals, colors, uvs, indices }
                : {
                      positions: positions.subarray(0, vw * 3).slice(),
                      normals: normals.subarray(0, vw * 3).slice(),
                      colors: colors.subarray(0, vw * 3).slice(),
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
    // gleich, was für Fels genügt [kein Lockstep]). Nur die GESTALT: den Stoff legt das Fels-Gesetz
    // auf (gelaende-core `felsNetz`, K17; die Vertex-Farben hier sind gefallen). `seq` (0..1) treibt
    // die Facetten-Ebenen deterministisch. Rückgabe: eine THREE.BufferGeometry (Radius ~size).
    function buildBoulderGeometry(THREE, noise3, P, seq) {
        if (!THREE || !THREE.IcosahedronGeometry) return null;
        const rnd = typeof seq === "function" ? seq : Math.random;
        const rrange = (a, b) => a + (b - a) * rnd();
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
    // BufferGeometry + merged). ATTRIBUT-VERTRAG des Consumers EXAKT: position/normal/color
    // + index (kein uv — das Rinden-Material liest keins; der Wind liest die Gestalt selbst). Der Part bleibt
    // holz/cylinder → Tags unberührt (nur Vertex-Positionen/Farben ändern sich).
    // `branches`: [{ points:[{x,y,z,r}], isTrunk }]. `opts`: { radialSegs=6, totalH,
    //   barkColorA:[r,g,b] 0..1 (Fuß), barkColorB:[r,g,b] (Wipfel), flareAmp=0.45,
    //   flareLobes=5 }. Rückgabe: [{ positions,normals,colors,indices }, ...].
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
            out.push({ positions, normals, colors, indices });
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
        // opts.bottomCap: default TRUE (AnazhRealm schließt die Silhouette unten). Die Vorlage
        // pushCrystal hat KEINEN Boden-Deckel (der Kristall sitzt in einem Basis-Klumpen) → sie
        // reicht bottomCap:false → byte-treu zu ihrem Prisma; AnazhRealm bleibt unverändert.
        const bottomCap = o.bottomCap !== false;
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
        if (bottomCap) {
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
        }
        const g = new THREE.BufferGeometry();
        g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
        g.setIndex(idx);
        g.computeVertexNormals();
        if (withColor) g.setAttribute("color", new THREE.Float32BufferAttribute(cols, 3));
        return g;
    }

    // ─── DIE REZEPT→PARAMETER-PIPELINE (DAS NEUE KLEID — byte-treu aus der Vorlage) ───
    // Die Vorlage baut JEDEN Baum aus 5 Reglern (api/slim/trop/delta/leaf = das Rezept) über
    // GENAU zwei Funktionen: `phenotype()` leitet den Art-Charakter ab (Höhe/Rinde/Krone/…),
    // `deriveParamsPlant()` (hier `treeParams`) fügt Saat-Jitter + LOD hinzu → der P-Vektor für
    // `growSkeleton`. KEIN Nachbauen der Rezepte mehr — die 5 Regler fliessen durch DIESE eine
    // Quelle (Studio + Foundry-Worker lesen sie; foundry-core `deriveParamsPlant` delegiert seinen
    // Baum-Zweig hierher, K24). Portiert 1:1 aus phytogenesis v38 (`phenotype` Z.1058,
    // `deriveParamsPlant` Tree-Zweig Z.1105) — THREE-frei (der Farb-Wurf ist `hexOffsetHSL`, die
    // r128-Arithmetik). Die Zufalls-Zieh-REIHENFOLGE ist exakt die der Vorlage → derselbe Same ⇒
    // dieselbe Gestalt.
    // DER SCHAFT TRÄGT DIE HÖHE (K20): der gewachsene Baum wird so hoch, dass sein Wipfel (der höchste Strang des
    // Skeletts — dasselbe Skelett in jeder Stufe, kein Sprung zwischen L0 und L1) bei `ziel` steht, und zwar im Schaft:
    // der Stamm-Lauf (Lauf 0) streckt sich unter dem tiefsten Ast-Ansatz yb, jeder andere Lauf und jedes Blatt rückt
    // starr um ziel − h0 (auch die hängende Rute). Die Krone bleibt, wie sie wuchs — Breite, Lagen, Blatt-Zahl: die
    // Kronen-Deckung von oben (forestKronenDeckung) und die Kosten bleiben —, der Bestandsbaum steht auf seinem langen
    // Schaft (die Buche trägt ihre Krone im oberen Drittel). Der gestreckte Schaft behält die Ring-Teilung seines
    // Wuchses (je gestrecktem Strang so viele Teile, wie er länger wurde — der Wurzelanlauf bleibt rund). Der Schaft
    // wächst nur: ein Baum, dessen Wipfel schon höher steht, bleibt, wie er wuchs (ein gestauchter Schaft zog die Krone
    // in den Stamm-Abschnitt der Rinden-Linse). Punkte, die sich Stränge teilen, rücken genau einmal. Rückgabe: der Hub ziel − h0
    // (Vorlagen-Einheiten; 0, wo der Schaft nicht wächst).
    // Mit `ansatz` (der Solitär, FREISTAND.ansatz) zielt der Hub statt auf eine Höhe auf den Kronenansatz: der tiefste
    // Punkt der Krone (Ast-Ansatz oder hängendes Blatt, yk) steht danach bei ansatz × Höhe, (yk + dh) / (h0 + dh) = ansatz.
    // Mit `krone` (der Bestand, BESTAND.krone) hebt der Hub Stamm UND Krone: der Ast-Ansatz yb steht danach bei (1 − krone) ×
    // ziel, der Stamm streckt sich bis dorthin, und die Krone [yb, h0] streckt sich lotrecht über [(1 − krone) · ziel, ziel] —
    // ein Bestandsbaum trägt seine Krone über den oberen Teil seiner Höhe, nie als Ballen auf dem Stiel (Spike T1). Dann
    // ist der Hub DES SCHAFTS nur, was der Stamm unter der Krone wuchs (kb − yb): die gestreckte Krone ist Krone, und die
    // Sichthöhe (Höhe ohne Hub, der Wirt `_foundryGruppenHoehe`) misst sie mit — sonst las die Stufenwahl die Bestands-
    // Buche mit 8–9 statt 16–18 m und die Eiche unter der Referenz-Höhe (T2-Nachbesserung, gate:foundry-crossfade).
    function schaftHub(segs, leaves, runMeta, ziel, ansatz, krone) {
        let h0 = 0,
            yb = Infinity;
        const erst = new Set();
        for (const s of segs) {
            h0 = Math.max(h0, s.p0[1], s.p1[1]);
            if (erst.has(s.runId)) continue;
            erst.add(s.runId);
            const m = runMeta[s.runId];
            if (m && m.parentRun === 0) yb = Math.min(yb, s.p0[1]);
        }
        if (!(yb > 1e-6) || !(h0 > yb)) return 0;
        let yk = yb;
        if (ansatz > 0) for (const l of leaves) yk = Math.min(yk, l.pos[1]);
        const dh = ansatz > 0 && ansatz < 1 ? (ansatz * h0 - yk) / (1 - ansatz) : ziel - h0;
        if (!(dh > 0)) return 0;
        const streck = (yb + dh) / yb;
        const kb = krone > 0 && !(ansatz > 0) ? (1 - krone) * (h0 + dh) : 0;
        const kStreck = kb > 0 ? (h0 + dh - kb) / (h0 - yb) : 0;
        const laenge = (q) => Math.hypot(q.p1[0] - q.p0[0], q.p1[1] - q.p0[1], q.p1[2] - q.p0[2]);
        const vorher = segs.map((q) => (q.runId === 0 ? laenge(q) : 0));
        const gesehen = new Set();
        const hebe = (q, stamm) => {
            if (gesehen.has(q)) return;
            gesehen.add(q);
            if (kb > 0) {
                if (!stamm || q[1] >= yb) q[1] = kb + (q[1] - yb) * kStreck;
                else if (q[1] > 0) q[1] *= kb / yb;
            } else if (!stamm || q[1] >= yb) q[1] += dh;
            else if (q[1] > 0) q[1] *= streck;
        };
        for (const q of segs) {
            hebe(q.p0, q.runId === 0);
            hebe(q.p1, q.runId === 0);
        }
        for (const l of leaves) hebe(l.pos, false);
        const lerp = (a, b, t) => a + (b - a) * t;
        const alle = segs.slice();
        segs.length = 0;
        alle.forEach((q, i) => {
            const n = vorher[i] > 0 ? Math.max(1, Math.round(laenge(q) / vorher[i])) : 1;
            if (n === 1) return void segs.push(q);
            let a = q.p0;
            for (let j = 1; j <= n; j++) {
                const t0 = (j - 1) / n,
                    t1 = j / n;
                const b =
                    j === n
                        ? q.p1
                        : [lerp(q.p0[0], q.p1[0], t1), lerp(q.p0[1], q.p1[1], t1), lerp(q.p0[2], q.p1[2], t1)];
                segs.push(
                    Object.assign({}, q, {
                        p0: a,
                        p1: b,
                        r0: lerp(q.r0, q.r1, t0),
                        r1: lerp(q.r0, q.r1, t1),
                        sway0: lerp(q.sway0, q.sway1, t0),
                        sway1: lerp(q.sway0, q.sway1, t1),
                    })
                );
                a = b;
            }
        });
        return kb > 0 ? Math.max(0, kb - yb) : dh;
    }

    function treePhenotype(api, slim, trop, delta, leaf) {
        const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
        const lerp = (a, b, t) => a + (b - a) * t;
        const conif = clamp((api - 0.62) / 0.2, 0, 1);
        const isCon = conif > 0.5,
            isShrub = api < 0.22;
        const weep = !isCon && !isShrub ? clamp((trop - 0.5) / 0.4, 0, 1) : 0;
        let height = lerp(2.2, 6.0, api * 0.35 + leaf * 0.3 + (1 - slim) * 0.35);
        if (isCon) height *= 1.4;
        let barkType;
        if (isShrub) barkType = "smooth";
        else if (isCon) barkType = slim < 0.4 ? "sequoia" : "conifer";
        else if (weep > 0.4) barkType = "willow";
        else if (slim > 0.66) barkType = "birch";
        else barkType = "oak";
        if (barkType === "sequoia") height *= 1.6;
        if (isShrub) height = lerp(1.5, 2.6, leaf * 0.5 + 0.5);
        const oakness = clamp((1 - slim) * 1.5, 0, 1) * (1 - conif) * (1 - weep * 0.7);
        const lwsc = isCon ? 0.085 : lerp(0.16, 0.44, clamp((1 - slim * 0.65) * (1 - weep * 0.55), 0, 1));
        const leafShape = {
            m: 2 + 7 * oakness,
            n1: lerp(1.0, 0.7, oakness),
            n2: lerp(1.0, 0.55, oakness),
            n3: lerp(1.0, 0.55, oakness),
            a: 1,
            b: 1,
            wsc: lwsc,
        };
        const BC = {
            oak: [0x3a2c1e, 0x6a5a44],
            conifer: [0x4a2c1a, 0x6a4a30],
            sequoia: [0x6a3a26, 0x9a5e3c],
            birch: [0x84837d, 0x8f8e88], // Betulin-Weiß roh 0,51/0,56 (Natur ~0,5 — 0xe6 lag bei 0,90: Gips)
            willow: [0x4a4438, 0x665e4c],
            smooth: [0x3a2c1e, 0x5a4a34],
        };
        const LC = {
            oak: 0x4a7a2c,
            conifer: 0x2e5526,
            sequoia: 0x3a6a30,
            birch: 0x8ab84a,
            willow: 0x6a9a3a,
            smooth: 0x4a7a2c,
        };
        const bc = BC[barkType];
        return {
            kind: isShrub ? "shrub" : "tree",
            conifer: isCon,
            height,
            barkType,
            leafShape,
            barkA: bc[0],
            barkB: bc[1],
            leafCol: LC[barkType],
            coniferDroop: isCon ? clamp(0.13 + trop * 0.25, 0.05, 0.5) : undefined,
            whorlSpacing: isCon ? lerp(0.1, 0.15, 1 - leaf) : undefined,
            crownBase: isCon
                ? lerp(0.1, 0.48, clamp((0.55 - slim) / 0.45, 0, 1))
                : isShrub
                  ? 0
                  : lerp(0, 0.32, clamp((api - 0.25) * 1.6, 0, 1)),
            flare: isShrub ? 0.14 : lerp(0.16, 0.52, 1 - slim),
            roots: Math.round(lerp(4, 6, 1 - slim)),
            basalStems: isShrub ? Math.round(lerp(5, 2, api / 0.22)) : 1,
            maxDepth: Math.round(lerp(7, 10, leaf * 0.4 + slim * 0.3 + api * 0.3)),
            windGain: isCon ? lerp(0.45, 0.7, slim) : lerp(0.85, 1.3, slim * 0.5 + weep * 0.5),
        };
    }
    // DIE STUFEN-ABBILDUNG (Welle 6, seit K24 im Gesetzbuch): EINE Bedeutung je Bau-Stufe — welches REZEPT die Stufe
    // fährt. Der Strauch: Nah- (0) und Mittel-Stufe (1) fahren beide das Rezept 1 (Karten-Krone, Blatt-Aggregation,
    // Ring-Dünnung); einen Strauch nach Rezept 0 gibt es nicht. Jede andere Art: Rezept = Stufe. Leser: `treeParams`
    // (Blatt-Stride, Blatt-Maß, Wurzeln) und foundry-core `emitTree` (Wuchs, Wurzeln, Rinde, Krone).
    function stufenRezept(kind, stufe) {
        return kind === "shrub" && stufe === 0 ? 1 : stufe;
    }
    // Der Farb-Wurf eines Paletten-Hex im HSL-Raum — die Arithmetik von three r128 `Color.setHex · offsetHSL · getHex`
    // (der Foundry-Worker rechnete sie über THREE): rein, renderer-frei, byte-gleich.
    function hexOffsetHSL(hex, dh, ds, dl) {
        const hx = Math.floor(hex);
        const r = ((hx >> 16) & 255) / 255,
            g = ((hx >> 8) & 255) / 255,
            b = (hx & 255) / 255;
        const max = Math.max(r, g, b),
            min = Math.min(r, g, b);
        let h, s;
        const l = (min + max) / 2;
        if (min === max) {
            h = 0;
            s = 0;
        } else {
            const d = max - min;
            s = l <= 0.5 ? d / (max + min) : d / (2 - max - min);
            switch (max) {
                case r:
                    h = (g - b) / d + (g < b ? 6 : 0);
                    break;
                case g:
                    h = (b - r) / d + 2;
                    break;
                case b:
                    h = (r - g) / d + 4;
                    break;
            }
            h /= 6;
        }
        const H = (((h + dh) % 1) + 1) % 1,
            S = Math.max(0, Math.min(1, s + ds)),
            L = Math.max(0, Math.min(1, l + dl));
        const hue = (p, q, t) => {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1 / 6) return p + (q - p) * 6 * t;
            if (t < 1 / 2) return q;
            if (t < 2 / 3) return p + (q - p) * 6 * (2 / 3 - t);
            return p;
        };
        let R, G, B;
        if (S === 0) R = G = B = L;
        else {
            const p = L <= 0.5 ? L * (1 + S) : L + S - L * S,
                q = 2 * L - p;
            R = hue(q, p, H + 1 / 3);
            G = hue(q, p, H);
            B = hue(q, p, H - 1 / 3);
        }
        return ((R * 255) << 16) ^ ((G * 255) << 8) ^ ((B * 255) << 0);
    }
    // DER PHÄNOTYP EINER ART (K24): das Gesetz aus den Reglern `dials` ⊕ die Phänotyp-Zeile der Art (`art.ph`: die
    // Buche ihre glatte graue Rinde, der Karst-Baum seinen Wurzelanlauf, das Totholz seine vergraute Borke). Die EINE
    // Quelle für Rinde, Laubfarbe, Nadel-Art und Krone jedes Baums — die Ableitung `treeParams`, die Fern-Farbe und die
    // Nadel der Karte im Wirt, die Pflanzen-Linsen lesen sie; eine Hand-Abschrift im Preset gibt es nicht mehr.
    function artPhaenotyp(dials, art) {
        const ph = treePhenotype(dials.api, dials.slim, dials.trop, dials.delta, dials.leaf);
        return art && art.ph ? Object.assign(ph, art.ph) : ph;
    }
    // DIE EINE ABLEITUNG Dials → P (K24): `dials` = {api,slim,trop,delta,leaf} (das Rezept), `seedInt` = die Saat
    // (int, treibt IR), `stufe` = die Bau-Stufe 0|1|2, `art` = das Preset der Art (seine Phänotyp-Zeile `ph`: die
    // Buche ihre glatte graue Rinde, der Karst-Baum seinen Wurzelanlauf, das Totholz seine vergraute Borke). Gibt den
    // P-Vektor für `growSkeleton` und die Bau-Stufen (foundry-core `deriveParamsPlant` delegiert hierher, Studio und
    // Foundry-Worker lesen ihn). Die Zieh-Reihenfolge ist die der Vorlage: 3 Farb-Würfe, der Wuchs-Strom, die Phase,
    // danach nur beim Totholz die Bruch-Höhe — derselbe Same ⇒ dieselbe Gestalt.
    function treeParams(dials, seedInt, stufe, art, weltSkala) {
        const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
        const lerp = (a, b, t) => a + (b - a) * t;
        const api = dials.api,
            delta = dials.delta,
            slim = dials.slim,
            trop = dials.trop,
            leaf = dials.leaf;
        const IR = mulberry32(((Math.floor(seedInt) + 1) * 2246822519) >>> 0);
        const J = (a) => 1 + (IR() - 0.5) * 2 * a,
            O = (a) => (IR() - 0.5) * 2 * a;
        const ph = artPhaenotyp(dials, art);
        const rezept = stufenRezept(ph.kind, stufe | 0);
        // Blatt-Stride `_lf` (Index-Ausdünnung NACH dem Wuchs, nie im Wuchs-Strom) und Blatt-Maß `ls` der Stufe:
        // Aggregation statt Ausdünnung (Wahrnehmung ~ n·s²); die Nadel-L1 trägt ihre Karten aus EINEM Blatt-Atlas.
        const lf = rezept === 0 ? 1 : rezept === 1 ? (ph.conifer ? 0.0265 : 0.21) : 0.16,
            ls = rezept === 0 ? 1 : rezept === 1 ? (ph.conifer ? 1.62 : 2.05) : 4.0;
        const lcol = hexOffsetHSL(ph.leafCol, (IR() - 0.5) * 0.05, (IR() - 0.5) * 0.1, (IR() - 0.5) * 0.08);
        const P = {
            kind: ph.kind,
            apical: clamp(api + O(0.1), 0, 1),
            delta: delta + O(0.1),
            slim: clamp(slim + O(0.1), 0, 1),
            trop: trop + O(0.1),
            leafD: clamp(leaf * J(0.16), 0.05, 1),
            _lf: lf,
            height: ph.height * J(0.16),
            conifer: ph.conifer,
            coniferDroop: ph.coniferDroop,
            crownBase: ph.crownBase,
            whorlSpacing: ph.whorlSpacing,
            flare: ph.flare,
            roots: ph.roots * (rezept === 0 ? 1 : rezept === 1 ? 0.8 : 0.6),
            basalStems: ph.basalStems,
            // Keine Tiefen-Reduktion je Stufe: das Skelett wächst immer voll (gleicher Same, gleicher Stamm).
            maxDepth: ph.kind === "shrub" && rezept === 2 ? 3 : Math.max(4, ph.maxDepth),
            barkA: ph.barkA,
            barkB: ph.barkB,
            leafCol: lcol,
            leafShape: ph.leafShape,
            leafSize: lerp(0.22, 0.6, leaf) * (ph.conifer ? 0.6 : 1) * J(0.12) * ls,
            windGain: ph.windGain,
            barkType: ph.barkType,
            _bphase: IR() * 6.2831,
        };
        // Totholz (stehend): die Bruch-Höhe ist ein Wurf des Individuums (nach allen anderen — jeder lebende Baum
        // zieht byte-gleich), die Krone der Fernform ist kahl.
        if (ph.tot) {
            P.tot = 1;
            P.totBruch = 0.42 + IR() * 0.26;
            P.crown = "kahl";
        }
        // DAS WELT-MASS (K20): ein lebender Baum trägt seinen Phänotyp in Metern (`ph.hoeheM` die Wipfel-Höhe der Größe 1,
        // mit dem Höhen-Wurf seiner Gestalt; `ph.hd` die Schlankheit H/D seines Standorts) und die Welt-Skala, mit der der
        // Wald ihn pflanzt (`weltSkala`, Meter je Vorlagen-Einheit — die Render-Zeile trägt der Wirt) — `growSkeleton` lässt
        // ihn so hoch und so schlank wachsen. Kein Wurf (der Zufalls-Strom bleibt); ohne Welt-Skala baut er in der Form-Höhe.
        if (ph.kind === "tree" && ph.hoeheM > 0 && ph.hd > 0 && !ph.tot && weltSkala > 0) {
            P.hoeheM = ph.hoeheM * (P.height / ph.height);
            P.hd = ph.hd;
            P.weltSkala = weltSkala;
        }
        return P;
    }

    // DER EINE IMPOSTOR-RAHMEN (Studio v36, phytogenesis bakeImpostorAtlas — „Drähte statt
    // Kopien", 08.07.): Bake-Kamera UND Billboard-Quad ALLER Leser (AnazhRealm-Main ·
    // Foundry · Studio-Portal) lesen DIESELBE Formel — eine Hand-Abschrift kann nie wieder
    // driften. Anker = Stammbasis y=0 (Wurzel-Geometrie unter 0 ist im Boden unsichtbar,
    // sie gehört NICHT in den Rahmen); halfH trägt die 2%-Luft (·0.51 = ·1.02/2); halfW =
    // max(Zell-Proportion 0.5, radiale Kronen-Spanne ·1.04) — rotations-invariant über die
    // 8 Blickwinkel, kein Seiten-Clip in keiner Ansicht.
    function impostorFrame(maxY, maxRadial) {
        const totalH = Math.max(0.5, maxY || 0);
        const halfH = totalH * 0.51;
        const halfW = Math.max(halfH * 0.5, (maxRadial || 0) * 1.04);
        return { totalH: totalH, maxR: maxRadial || 0, halfH: halfH, halfW: halfW };
    }
    // DIE HALBE BILD-HÖHE EINES HEBUNGS-RINGS (lod.K3): der Zylinder des Rahmens (Halbbreite hW, halbe Höhe hH um die Mitte
    // der Stammachse) aus der Hebung e (rad) gesehen — hH·cos e + hW·|sin e|; bei e = 0 die halbe Rahmen-Höhe. EINE Formel
    // über einer Algebra (WIND_ZAHLEN: die Bake-Kamera des Wirts, die TSL-Algebra: die gekippte Karte und ihr Ring im Stoff).
    function karteRingHalbe(A, hH, hW, e) {
        const s = A.sin(e);
        return A.add(A.mul(hH, A.sin(A.add(e, A.k(Math.PI / 2)))), A.mul(hW, A.max(s, A.mul(s, A.k(-1)))));
    }
    // Der radiale Vertex-Scan dazu (max x²+z² über ein xyz-Positions-Array, akkumulierend) —
    // die rotations-invariante Kronen-Spanne; rein, THREE-frei (nimmt attr.array).
    function scanRadialXZ(positions, prevMaxSq) {
        let m = prevMaxSq || 0;
        if (positions && positions.length) {
            for (let i = 0; i < positions.length; i += 3) {
                const x = positions[i],
                    z = positions[i + 2],
                    q = x * x + z * z;
                if (q > m) m = q;
            }
        }
        return m;
    }

    // ===================== DER WALD-PLAN (Vorlagen-Ökologie, „Drähte statt Kopien" 08.07.) =====================
    // Die Pflanz-LOGIK des Waldes (Poisson-Darts · Stand-Dichte · Arten-Nische · reverse-J-
    // Größe · Mammut-Promotion) lebt EINMAL hier — im Vorlagen-Kern, neben den Rezepten, die
    // sie pflanzt. AnazhRealm ist nur noch der Boden: seine Welt-Reads (Oberfläche · Wasser ·
    // Slope · Feuchte · fbm) reisen als ctx-Funktionen herein. Γ5-treu: aller Zufall aus dem
    // seed-gebundenen Zell-Hash (forestCellRng), kein Math.random, keine Zeit.
    // Der Zell-Hash-RNG: reine Funktion von (cx,cz,seed) — alle Peers sehen denselben Wald.
    function forestCellRng(cx, cz, seedInt) {
        let a = (Math.imul(cx | 0, 73856093) ^ Math.imul(cz | 0, 19349663) ^ seedInt) >>> 0;
        return function () {
            a = (a + 0x6d2b79f5) | 0;
            let t = Math.imul(a ^ (a >>> 15), 1 | a);
            t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
            return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
        };
    }
    // Vorlagen-`standDensity`: glatter Wald-↔-Lichtung-Gradient [0,1].
    // Shared fbm-Mix; Kontrast/Mittel per Mode (Host-Default byte-same bei 3-Arg-Aufruf).
    // Lab-Vorlage: clamp((d-0.5)*1.9+0.5,0,1) · Host-Studio: (d-0.5)*1.35+0.72.
    const FOREST_STAND = {
        lab: { contrast: 1.9, mid: 0.5 },
        host: { contrast: 1.35, mid: 0.72 },
    };
    // DER SOLITÄR (K20, nordstern §4.5: „Solitär gedrungener", Solitäreiche Marbach): die Schlankheit eines frei stehenden
    // Baums ist hd · FREISTAND.hd seiner Art im Bestand (Eiche 60 → 27; Bestand H/D 40–100) — growSkeleton liest `P.freistand`.
    // Frei steht ein Baum, wenn kein stehender Nachbar näher ist als FREISTAND.abstand × die Summe der Kronen (der Wirt,
    // `_forestStehtFrei`): Lichtkonkurrenz reicht über die Kronen-Berührung (pack 1,16) hinaus, ab dem Doppelten fehlt sie.
    // ansatz: der tiefste Blatt-Anker des Solitärs bei 0,3 × Höhe, die Karten hängen darunter: die sichtbare Krone beginnt
    // bei 0,15–0,2 der Höhe (Marbach: kurzer dicker Stamm unter der Krone — ohne ihn
    // stand die Krone als Busch auf dem Boden, Blick-Sonde 12.10.).
    // ab: die Gestalt des Solitärs (`solitaerGestalt`) — eine Baum-Art mit mindestens `ab` Bestand-Gestalten
    // (budget.gestalten, die Massen-Arten des Walds) trägt DAZU ihren Solitär als Gestalt V+1: der Bestand behält alle
    // V Individuen (kein Klon), der Solitär ist ein eigenes. Die Arten mit einer Gestalt (Weide, Mammut) tragen keinen.
    const FREISTAND = Object.freeze({ hd: 0.45, abstand: 2, ansatz: 0.3, ab: 2 });
    // DER BESTAND (T2, 16.10., nordstern §4.5 „hohe, schlanke Stämme im Bestand, breite Solitäre im Offenen"): ein Laubbaum,
    // der im Bestand steht (Welt-Maß, nicht frei, keine Konifere, die Schlankheit seines Standorts hd ≥ BESTAND.hd — das
    // Bestands-Band H/D 40–100; Weide und Karst sind Solitäre ihrer Art), wächst seine Seitenäste × BESTAND.seitenast (der
    // Nachbar nimmt die Seite, das Licht kommt von oben), und der Hub des Schafts hebt Stamm UND Krone: die Krone reicht über
    // BESTAND.krone der Höhe (schaftHub `krone`). Spike T1 (Mess-Wiese, Eiche · Birke · Buche): Kronenbreite/BHD 48–84 → 23–36
    // (Natur frei 17–26, Hemery 2005), Breite/Höhe 0,74–1,06 → 0,35–0,45, Kronen-Anteil 0,60–0,63, Karten −44 bis −60 %;
    // die Seitenäste ohne den Hub der Krone trugen 0,42–0,46 Kronen-Anteil (der Ballen auf dem Stiel).
    const BESTAND = Object.freeze({ hd: 40, seitenast: 0.6, krone: 0.6 });
    // Die Gestalt des Solitärs einer Art mit V Bestand-Gestalten (V+1), 0 = die Art trägt keinen. Leser: der Wirt
    // (`_foundryGestalten`, `_foundryGestaltOv`), gate:asset-contract (jede Gestalt der Welt unter ihrer Zeile).
    function solitaerGestalt(kind, V) {
        return kind === "tree" && Number.isInteger(V) && V >= FREISTAND.ab ? V + 1 : 0;
    }
    function forestStandDensity(fbm, x, z, opt) {
        const f1 = fbm(x * 0.014 + 30, z * 0.014 + 12);
        const f2 = fbm(x * 0.038 + 5, z * 0.038 + 20);
        let contrast = FOREST_STAND.host.contrast,
            mid = FOREST_STAND.host.mid;
        if (typeof opt === "string") {
            const m = FOREST_STAND[opt];
            if (m) {
                contrast = m.contrast;
                mid = m.mid;
            }
        } else if (opt && typeof opt === "object") {
            if (opt.contrast != null) contrast = +opt.contrast;
            if (opt.mid != null) mid = +opt.mid;
        }
        return forestStandDensityAus(f1, f2, contrast, mid);
    }
    // Die Bestandsdichte aus ihren zwei Oktaven (grob f1, fein f2) — die EINE Formel für den Ort und sein Mittel (forestBestand).
    function forestStandDensityAus(f1, f2, contrast, mid) {
        const d = f1 * 0.55 + f2 * 0.45;
        const v = (d - 0.5) * contrast + mid;
        return v < 0 ? 0 : v > 1 ? 1 : v;
    }
    // Die GEBURT eines Wald-Darts aus der Bestandsdichte: der Lichtungs-Boden hebt (0.04→0.30), auch gelichtete
    // Säume tragen Wald. planForestCell würfelt dagegen; die Fernform des Hosts liest sie als Kronen-Deckung
    // (EINE Formel für den gepflanzten und den fernen Wald).
    function forestGeburt(sd) {
        let t = (sd - 0.18) / (0.8 - 0.18);
        t = t < 0 ? 0 : t > 1 ? 1 : t;
        return 0.3 + 0.7 * (t * t * (3 - 2 * t));
    }
    // Arten-Nische Basis-Gewichte (wF/wT/wE/wB + base-wW ohne Wasser-Nähe).
    // Klima × Patch × Feuchte × Trockenheit × Offenheit — EINE Formel für Lab+Host.
    // wW = wet²·(1-dry)·0.8 + 0.01; Caller addiert waterProx²·6 (Host: feu, Lab: _wp).
    // Lab-only (pathDist→wB·1.5, species-ids) bleibt AUSSERHALB. extras-Loop bleibt in planForestCell.
    function forestNicheWeights(clim, dry, wet, open, patch, opts) {
        const ss =
            opts && typeof opts.ss === "function"
                ? opts.ss
                : (e0, e1, v) => {
                      let t = (v - e0) / (e1 - e0);
                      t = t < 0 ? 0 : t > 1 ? 1 : t;
                      return t * t * (3 - 2 * t);
                  };
        const pf = (c) => Math.max(0, 1 - Math.abs(patch - c) / 0.14);
        let pF = pf(0.15);
        let pT = pf(0.36);
        let pE = pf(0.58);
        let pB = pf(0.82);
        let sF = ss(0.4, 0.8, clim);
        let sT = ss(0.5, 0.9, clim);
        let aC = Math.abs(clim - 0.5);
        // DAS MITTEL UNTER DEM FUSSABDRUCK (`forestNische` mit ctx.fussM): jeder Term, den die Gewichte linear lesen, blendet
        // zu seinem Erwartungswert über das Mosaik (kP: Bestands-Mosaik, kC: Klima) — ohne `opts.mittel` dieselben Zahlen.
        const mi = opts && opts.mittel ? opts.mittel : null;
        if (mi) {
            const M = mi.M;
            pF += (M.pF - pF) * mi.kP;
            pT += (M.pT - pT) * mi.kP;
            pE += (M.pE - pE) * mi.kP;
            pB += (M.pB - pB) * mi.kP;
            sF += (M.sF - sF) * mi.kC;
            sT += (M.sT - sT) * mi.kC;
            aC += (M.aC - aC) * mi.kC;
        }
        const wF = (sF * 0.45 + dry * 0.5 + 0.04) * (0.18 + 4.8 * pF); // Fichte→kiefer: trockene Höhen
        const wT = (sT * 0.38 + dry * 0.3 + 0.03) * (0.16 + 4.2 * pT); // Tanne: höher/feuchter
        const wE = ((1 - dry) * 0.65 + wet * 0.35 + 0.04) * (0.18 + 4.6 * pE); // Eiche: tiefe, feuchte Lagen
        const wB = ((0.14 + 0.45 * open) * (1 - aC * 0.9) + 0.03) * (0.2 + 3.6 * pB); // Birke: Pionier in Lücken
        const wW = wet * wet * (1 - dry) * 0.8 + 0.01; // Weide→erle base; Caller + waterProx²·6
        return { wF, wT, wE, wB, wW };
    }

    // DAS MOSAIK-MITTEL eines Wald-Rauschens (K16, die Fern-Farbe): die Erwartungswerte der Terme, die forestNicheWeights
    // linear liest — pf je Patch-Zentrum, die zwei Klima-Rampen, |clim − 0,5| —, gezogen aus dem Rauschen SELBST (32 × 32
    // Proben im Raster 7,31 Rausch-Einheiten, weit über jede Korrelation; Patch und Klima lesen dasselbe fbm). Einmal je
    // fbm-Funktion (WeakMap), rein, ohne rng.
    const _mosaikMemo = typeof WeakMap === "function" ? new WeakMap() : null;
    function forestMosaikMittel(fbm) {
        const hit = _mosaikMemo && _mosaikMemo.get(fbm);
        if (hit) return hit;
        const ss = (e0, e1, v) => {
            let t = (v - e0) / (e1 - e0);
            t = t < 0 ? 0 : t > 1 ? 1 : t;
            return t * t * (3 - 2 * t);
        };
        const pf = (v, c) => Math.max(0, 1 - Math.abs(v - c) / 0.14);
        const M = { pF: 0, pT: 0, pE: 0, pB: 0, sF: 0, sT: 0, aC: 0 };
        const N = 32;
        for (let i = 0; i < N; i++)
            for (let j = 0; j < N; j++) {
                const v = fbm(i * 7.31 + 0.37, j * 7.31 + 0.71);
                M.pF += pf(v, 0.15);
                M.pT += pf(v, 0.36);
                M.pE += pf(v, 0.58);
                M.pB += pf(v, 0.82);
                M.sF += ss(0.4, 0.8, v);
                M.sT += ss(0.5, 0.9, v);
                M.aC += Math.abs(v - 0.5);
            }
        for (const k in M) M[k] /= N * N;
        if (_mosaikMemo) _mosaikMemo.set(fbm, M);
        return M;
    }
    // Die Blende einer Oktave der Wellenlänge λ unter einem Fußabdruck der Kante f: ihr Wert bis f = λ/4, ihr Mittel ab f = λ/2
    // (Nyquist: ein Raster der Kante f trägt nur Wellen ab 2 f).
    function forestOktavMittel(f, lambda) {
        let t = (f / lambda - 0.25) / 0.25;
        t = t < 0 ? 0 : t > 1 ? 1 : t;
        return t * t * (3 - 2 * t);
    }

    // DER BESTAND UNTER DEM FUSSABDRUCK (K16, die Fern-Farbe): Bestandsdichte sd und Geburt (forestGeburt(sd), die Dart-Rate) eines
    // Orts, der für eine Fläche der Kante fussM steht. forestStandDensity liest zwei Oktaven (λ 71 m und 26 m); was der Abdruck
    // nicht auflöst, trägt seinen ERWARTUNGSWERT über die Verteilung des Rauschens: die feine Oktave bedingt auf die grobe
    // (E[· | grob], 32 Quantile), beide zusammen das Mittel des Bestands. Geburt und Dichte werden je für sich gemittelt (die
    // Geburt ist nichtlinear — das Mittel der Geburt ist nie die Geburt des Mittels). fussM 0: die Zahlen von
    // forestStandDensity und forestGeburt. Die Kronen-Deckung daraus trägt forestKronenDeckung.
    const _bestandMemo = typeof WeakMap === "function" ? new WeakMap() : null;
    function forestBestand(fbm, x, z, fussM) {
        const sdAus = (f1, f2) => forestStandDensityAus(f1, f2, FOREST_STAND.host.contrast, FOREST_STAND.host.mid);
        const f1 = fbm(x * 0.014 + 30, z * 0.014 + 12);
        const f2 = fbm(x * 0.038 + 5, z * 0.038 + 20);
        const sd = sdAus(f1, f2);
        const geburt = forestGeburt(sd);
        const k2 = fussM > 0 ? forestOktavMittel(fussM, 1 / 0.038) : 0;
        if (!(k2 > 0)) return { sd, geburt };
        let Q = _bestandMemo && _bestandMemo.get(fbm);
        if (!Q) {
            const v = [];
            for (let i = 0; i < 32; i++) for (let j = 0; j < 32; j++) v.push(fbm(i * 7.31 + 0.37, j * 7.31 + 0.71));
            v.sort((a, b) => a - b);
            const q = new Float64Array(32);
            for (let i = 0; i < 32; i++) q[i] = v[i * 32 + 16];
            let sd0 = 0;
            let a0 = 0;
            for (let i = 0; i < 32; i++)
                for (let j = 0; j < 32; j++) {
                    const s = sdAus(q[i], q[j]);
                    sd0 += s;
                    a0 += forestGeburt(s);
                }
            Q = { q, sd0: sd0 / 1024, a0: a0 / 1024 };
            if (_bestandMemo) _bestandMemo.set(fbm, Q);
        }
        let sd1 = 0;
        let a1 = 0;
        for (let j = 0; j < 32; j++) {
            const s = sdAus(f1, Q.q[j]);
            sd1 += s;
            a1 += forestGeburt(s);
        }
        sd1 /= 32;
        a1 /= 32;
        const k1 = forestOktavMittel(fussM, 1 / 0.014);
        const sdM = sd1 + (Q.sd0 - sd1) * k1;
        const aM = a1 + (Q.a0 - a1) * k1;
        return { sd: sd + (sdM - sd) * k2, geburt: geburt + (aM - geburt) * k2 };
    }

    // DIE KRONEN-DECKUNG DES GEPFLANZTEN BESTANDS (K16, die Naht): der Anteil des Bodens unter Kronen, den planForestCell samt der
    // Kronen-Schüchternheit des Hosts im Mittel stehen lässt — die Fernform des Waldes (das Kronendach des Rings) liest diese
    // Zahl, nie die Geburt. Die Geburt ist die Rate der Darts (F.dartsPerCell je F.cell², Wurf gegen forestGeburt(sd)); die
    // Schüchternheit (Zentren >= F.pack·(Ti+Tj), das prio-Maximum gewinnt) ist ein Matérn-II-Prozess: ein Dart der Krone T steht
    // mit (1 − e^(−λA))/(λA), A = π·pack²·E[(T+Tj)²]; seine Krone überlappt keine andere, die Deckung ist die Summe ihrer Flächen.
    // Die Kronen: T = Art-Krone × Größe (forestTreeSize über ihre Quantile samt der Überhälter). Befund 11.10.: das Dach las die
    // Geburt (0,90) als Deckung, der gepflanzte Bestand deckt 0,16 — die Ferne stand als geschlossenes Grün vor offenem Wald.
    // kronen = [[Gewicht, Kronen-Radius bei Größe 1], …] (die Arten-Mischung am Ort); F = { cell, dartsPerCell, pack }.
    // OHNE GARBAGE, JEDE GRÖSSE EINMAL (K60): die Fern-Farbe ruft die Deckung je Abtastung einer Masche (Radeon kalt bis zum
    // ersten Bild ~70 000 Rufe, 1,3 s Selbstzeit, dazu der Sammler) — bis K60 legte jeder Ruf 61 + 300 kleine Arrays an und
    // rechnete 60 Exponentiale je Art, obwohl die 60 Quantile nur 16 Größen tragen (12 Quantile, die Überhälter sind die
    // Quantil-Größe oder eine der 4 festen). Jetzt leben Anteile und Größen in festen Puffern dieses Kerns, der Matérn-Faktor
    // (1 − e^(−λA))/A wird je Art und Größe EINMAL gerechnet, und jede Summe läuft in DERSELBEN Folge aus DENSELBEN
    // Rechnungen wie zuvor — bitgleich (Byte-Beweis K60: 300 000 Fälle samt Rand, NaN und 7 Arten, 0 ungleich).
    const _deckNQ = 12;
    const _deckNU = 4;
    const _deckG = _deckNQ * (1 + _deckNU);
    const _deckAnteil = new Float64Array(_deckG); // der Anteil je Quantil in der Folge der Summe (fest)
    for (let i = 0; i < _deckNQ; i++) {
        _deckAnteil[i * (1 + _deckNU)] = 0.95 / _deckNQ;
        for (let j = 0; j < _deckNU; j++) _deckAnteil[i * (1 + _deckNU) + 1 + j] = 0.05 / _deckNQ / _deckNU;
    }
    const _deckStufe = new Uint8Array(_deckG); // je Quantil seine Größe: 0..11 die Quantil-Größe, 12..15 ein fester Überhälter
    const _deckWert = new Float64Array(_deckNQ + _deckNU); // die geklemmte Größe je Stufe (je Ruf aus sd)
    const _deckFaktor = new Float64Array(_deckNQ + _deckNU); // der Matérn-Faktor je Stufe (je Art)
    const _deckHat = new Uint8Array(_deckNQ + _deckNU);
    function forestKronenDeckung(sd, geburt, kronen, F) {
        const lambda = (F.dartsPerCell / (F.cell * F.cell)) * (geburt > 0 ? geburt : 0);
        if (!(lambda > 0) || !kronen || !kronen.length) return 0;
        let wSumme = 0;
        for (let k = 0; k < kronen.length; k++) wSumme += kronen[k][0] > 0 ? kronen[k][0] : 0;
        if (!(wSumme > 0)) return 0;
        // Die Größen-Verteilung (forestTreeSize): ue gleichverteilt auf [0, 1 − 0,52·sd], s = 0,55 + 1,45·ue^1,45; mit 5 % ein
        // Überhälter max(s, 1,3 + 0,55·u). 12 × 4 Quantile, geklemmt auf [0,5; 1,95].
        const NQ = _deckNQ;
        const NU = _deckNU;
        const oben = 1 - 0.52 * (sd < 0 ? 0 : sd > 1 ? 1 : sd);
        const V = _deckWert;
        const S = _deckStufe;
        const klemme = (v) => (v < 0.5 ? 0.5 : v > 1.95 ? 1.95 : v);
        for (let j = 0; j < NU; j++) V[NQ + j] = klemme(1.3 + 0.55 * ((j + 0.5) / NU));
        for (let i = 0; i < NQ; i++) {
            const s = 0.55 + 1.45 * Math.pow(((i + 0.5) / NQ) * oben, 1.45);
            V[i] = klemme(s);
            S[i * (1 + NU)] = i;
            // max(s, c) ist s, wo s nicht unter c liegt (auch NaN und Gleichstand), sonst c
            for (let j = 0; j < NU; j++) S[i * (1 + NU) + 1 + j] = s < 1.3 + 0.55 * ((j + 0.5) / NU) ? NQ + j : i;
        }
        let mT = 0;
        let mT2 = 0;
        for (let k = 0; k < kronen.length; k++) {
            const w = kronen[k][0] > 0 ? kronen[k][0] / wSumme : 0;
            if (!(w > 0)) continue;
            for (let g = 0; g < _deckG; g++) {
                const tw = w * _deckAnteil[g];
                const t = kronen[k][1] * V[S[g]];
                mT += tw * t;
                mT2 += tw * t * t;
            }
        }
        let deckung = 0;
        const H = _deckHat;
        const Q = _deckFaktor;
        for (let k = 0; k < kronen.length; k++) {
            const w = kronen[k][0] > 0 ? kronen[k][0] / wSumme : 0;
            if (!(w > 0)) continue;
            H.fill(0);
            for (let g = 0; g < _deckG; g++) {
                const st = S[g];
                const t = kronen[k][1] * V[st];
                if (!H[st]) {
                    const A = Math.PI * F.pack * F.pack * (t * t + 2 * t * mT + mT2);
                    Q[st] = (1 - Math.exp(-lambda * A)) / A;
                    H[st] = 1;
                }
                deckung += w * _deckAnteil[g] * Math.PI * t * t * Q[st];
            }
        }
        return deckung > 1 ? 1 : deckung;
    }

    // DIE NISCHE EINES ORTS (EINE Formel für den gepflanzten und den fernen Wald): Klima, Bestands-Mosaik, Feuchte,
    // Höhen-Trockenheit und Offenheit am Ort (x, z) auf der Oberfläche surfaceY bei Bestandsdichte sd → die Arten-
    // Gewichte der fünf Wald-Arten (wF Kiefer · wT Tanne · wE Eiche · wB Birke · wW Erle, ohne die Auto-Arten) samt
    // clim/patch/feu. planForestCell würfelt daraus die Art, die Fernform des Hosts mischt daraus die Kronen-Farbe.
    // Keine rng-Aufrufe. ctx = { F (dryScale), baseH, fbm(px,pz), feuchteAt(x,z,surfY), fussM? }.
    // DER FUSSABDRUCK (K16, die Fern-Farbe): `ctx.fussM` = die Kante der Fläche, für die der Ort steht (eine Masche des Fern-
    // Rings, ein Texel des Feld-Passes). Das Bestands-Mosaik (λ 20 m) und das Klima (λ 83 m) tragen darunter ihr Mittel
    // (forestMosaikMittel, forestOktavMittel): ihr Wert wechselte unter einer 13 × 39-m-Masche je Punkt die Art, und jede
    // Masche zog als radialer Streifen um den Spieler. Ohne fussM (planForestCell, das Labor) dieselben Zahlen wie zuvor.
    function forestNische(x, z, surfaceY, sd, ctx) {
        const ss = (e0, e1, v) => {
            let t = (v - e0) / (e1 - e0);
            t = t < 0 ? 0 : t > 1 ? 1 : t;
            return t * t * (3 - 2 * t);
        };
        const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);
        const relH = surfaceY - (ctx.baseH || 0);
        const feu = clamp01(ctx.feuchteAt(x, z, surfaceY));
        const dry = clamp01((relH + 6) / ctx.F.dryScale);
        const wet = feu;
        const open = 1 - sd;
        const clim = ctx.fbm(x * 0.012 + 50, z * 0.012 + 9); // breiter Klima-/Trockengradient
        const patch = ctx.fbm(x * 0.05 + 200, z * 0.05 + 90); // Bestands-Mosaik (Reinbestände + Mischsäume)
        const fussM = ctx.fussM > 0 ? ctx.fussM : 0;
        const NW = forestNicheWeights(
            clim,
            dry,
            wet,
            open,
            patch,
            fussM
                ? {
                      ss,
                      mittel: {
                          M: forestMosaikMittel(ctx.fbm),
                          kP: forestOktavMittel(fussM, 1 / 0.05),
                          kC: forestOktavMittel(fussM, 1 / 0.012),
                      },
                  }
                : { ss }
        );
        return {
            wF: NW.wF,
            wT: NW.wT,
            wE: NW.wE,
            wB: NW.wB,
            wW: NW.wW + feu * feu * 6.0, // Host: waterProx = feu
            clim,
            patch,
            feu,
        };
    }

    // reverse-J Größe + Selbstausdünnung + seltene Überhälter. RNG-REIHENFOLGE heilig
    // (Host-Determinismus): ue → Überhälter-Wurf → optional Überhälter-s → clamp.
    // Byte-same Lab plantForest + Host planForestCell.
    function forestTreeSize(rng, sd) {
        const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);
        const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
        let ue = clamp01(rng() * (1 - 0.52 * sd));
        let s = 0.55 + 1.45 * Math.pow(ue, 1.45);
        if (rng() < 0.05) s = Math.max(s, 1.3 + rng() * 0.55);
        s = clamp(s, 0.5, 1.95);
        return s;
    }
    // Mammut-Promotion. Species-Gate (Lab weide / Host baum_erle) bleibt Caller-lokal —
    // NUR dann aufrufen, sonst ändert sich die Host-rng-Reihenfolge (prio/keep/totRoll/rotY).
    // Short-circuit wie heute: rng() nur wenn sd>0.72 && clim>0.5; s-rng nur bei promote.
    function forestMammutRoll(rng, sd, clim) {
        let promote = false;
        let s = 0;
        if (sd > 0.72 && clim > 0.5 && rng() < 0.02) {
            promote = true;
            s = 0.85 + rng() * 0.4;
        }
        return { promote: promote, s: s };
    }
    // Convenience: size first (inkl. Überhälter), then mammut — SAME order as today.
    // Nur aufrufen wenn Species Mammut erlaubt (nicht weide/baum_erle).
    function forestSizeAndMammut(rng, sd, clim) {
        let s = forestTreeSize(rng, sd);
        const m = forestMammutRoll(rng, sd, clim);
        if (m.promote) s = m.s;
        return { s: s, mammut: m.promote };
    }

    // FOREST_TOPOLOGY — intentional dual topology (Feel-Entscheid .116). Do NOT merge.
    // lab "disk" = plantForest sequential Poisson + ok() reject (walkable studio).
    // host "cell" = planForestCell darts + forestPrioWins shy (chunk order-independent).
    // Like NINJA_FEEL .97: naming the Feel, not Fake-zu / not topology rewrite.
    const FOREST_TOPOLOGY = {
        lab: "disk", // plantForest sequential Poisson + ok() reject
        host: "cell", // planForestCell darts + forestPrioWins shy (chunk order-independent)
    };
    // FOREST_PACK — geteilte Kronen-Schüchternheit / Poisson-Grid-Hash / Lab-Dichte-Zahlen.
    // Lab plantForest.ok + Host crown-shy Distance teilen forestTooClose.
    // pack/dartsPerM2 = Lab PORTAL_RENDER_CONFIG.density (foundry); Host behält
    // F.cell/dartsPerCell (andere Topologie + andere Species-ids) — must-ignore Host F.*.
    // Topology named FOREST_TOPOLOGY (.116 Feel); Host prio-max named forestPrioWins (.113); Species-ids → FOREST_SPECIES (.112).
    // path/garantie/saum (.110) + Verjüngung/Schatten-Zahlen (.111) → FOREST_LAB;
    // Host planForestCell liest KEIN pathDist / keine Verjüngung / keine Schattenverdängung.
    // `crown` ist DIE EINE Kronen-Tafel des Pflanz-Gesetzes (T2, 16.10.): der Radius (m, Größe 1) der GEWACHSENEN Krone —
    // je Laub-Art der sichtbare Radius ihrer L0 im Bestand (Atlas-Alpha ≥ 0,5, halbe Breite über 8 Azimute, Gestalten 1–4
    // × Welt-Skala; gate:pflanzen-nah H hält jede Zeile an ihrer Gestalt 1). Labor-Wald und Welt-Wald (stamm FOREST.crown
    // unter den Wirts-Namen) lesen sie. Vorher Eiche 5,2 gegen gewachsen 9,3 (der Ballen-Wald), mit dem Bestand 4,0.
    const FOREST_PACK = {
        pack: 1.16,
        dartsPerM2: 1.2,
        cell: 12, // Lab Poisson-Zellgröße; Host F.cell bleibt lokal (gleicher Wert, andere Nutzung)
        crown: {
            eiche: 4.0,
            birke: 3.45,
            buche: 4.05,
            karst: 4.2,
            weide: 5.65,
            tanne: 2.95,
            fichte: 2.75,
            mammut: 9.2,
        },
    };
    // FOREST_LAB — Lab-only plantForest thresholds (path/saum/garantie + Verjüngung + Schattenverdängung).
    // Host hat keine Lab-Pfade → planForestCell must-ignore; kein pathDist / keine Verj-/Schatten-Pässe.
    const FOREST_LAB = {
        pathClearM: 3.6, // skip dart if pathDist < this
        pathBirkeMulDistM: 8, // wB *= pathBirkeMul if pathDist < this
        pathBirkeMul: 1.5,
        seawardWeideM: 9, // if seaward > this && sp !== weide skip
        wetSaumM: 1.2, // _de < this → only weide
        openWaterM: -0.2, // _de < this → skip
        garantieMammutMin: 2,
        garantieTries: 2500,
        garantiePathM: 4,
        garantieSdMin: 0.55,
        garantieClearSq: 6.76, // Stammfreiheit²
        garantieSMin: 0.9,
        garantieSAdd: 0.4, // s = garantieSMin + rng()*garantieSAdd
        // Verjüngung (Sämlings-Cluster) — Lab plantForest only; Host has no pass
        parentSMin: 0.55, // skip parent if par.s < this
        parentChance: 0.82, // rng() > this → skip parent
        nseedBase: 5,
        nseedSpan: 6, // nseed = nseedBase + floor(rng()*nseedSpan)
        radMinFrac: 0.15,
        radSpanFrac: 0.45, // rad = par.T * (radMinFrac + rng()*radSpanFrac)
        verjPathM: 3.2, // ≠ pathClearM 3.6 — Verjüngung pathDist gate
        inheritSp: 0.6, // rng() < this → inherit parent.sp
        sMin: 0.5,
        sAdd: 0.24, // seedling s = sMin + rng()*sAdd
        packMul: 0.3, // ok(..., PACK*packMul) — engere Kohorten
        // Schattenverdängung — Lab plantForest only; Host has no pass
        bigS: 1.3, // mammut OR s > bigS
        shadeMulMammut: 1.7,
        shadeMulOther: 1.25, // shadeR = big.T * (mammut ? shadeMulMammut : shadeMulOther)
        killChance: 0.92, // rng() < (1 - d/shadeR) * killChance
    };
    // FOREST_SPECIES — EINE named table Lab-Kurzname ↔ Host baum_* (.112).
    // Lab hält Kurzname intern (CROWN / Verjüngung); Host pick-strings unverändert (RNG/Determinismus).
    // Optional map via forestLabToHost / forestHostToLab — fail-soft identity if unknown.
    const FOREST_SPECIES = {
        labToHost: {
            fichte: "baum_kiefer",
            tanne: "baum_tanne",
            eiche: "baum_eiche",
            birke: "baum_birke",
            weide: "baum_erle",
            mammut: "baum_mammut",
        },
        hostToLab: {
            baum_kiefer: "fichte",
            baum_tanne: "tanne",
            baum_eiche: "eiche",
            baum_birke: "birke",
            baum_erle: "weide",
            baum_mammut: "mammut",
        },
        labNames: ["fichte", "tanne", "eiche", "birke", "weide", "mammut"],
        verjPool: ["birke", "eiche", "fichte", "tanne"],
    };
    function forestLabToHost(id) {
        return FOREST_SPECIES.labToHost[id] || id;
    }
    function forestHostToLab(id) {
        return FOREST_SPECIES.hostToLab[id] || id;
    }
    // Lab K(): spatial hash für Poisson-Nachbarzellen
    function forestGridKey(cx, cz) {
        return (cx * 73856093) ^ (cz * 19349663);
    }
    // true = Zentren zu nah (Overlap unter pack*(T+tT))
    function forestTooClose(dx, dz, T, tT, pk) {
        const md = (T + tT) * pk;
        return dx * dx + dz * dz < md * md;
    }
    // true if a is better than b (a should survive, b rejected in Host shy)
    // Host today: o.prio > d.prio || (o.prio === d.prio && (o.x > d.x || (o.x === d.x && o.z > d.z)))
    // FOREST_TOPOLOGY: Lab plantForest = disk (sequential ok() reject); Host = cell (prio-max via forestPrioWins).
    // Feel-Entscheid .116 — intentional dual topology; no fake merge.
    function forestPrioWins(a, b) {
        if (!a || !b) return false;
        if (a.prio > b.prio) return true;
        if (a.prio === b.prio && (a.x > b.x || (a.x === b.x && a.z > b.z))) return true;
        return false;
    }
    // neighbors: [{x,z,T}, ...]; false wenn irgendein Nachbar überlappt
    function forestCrownClear(x, z, T, pk, neighbors) {
        if (!neighbors || !neighbors.length) return true;
        for (let i = 0; i < neighbors.length; i++) {
            const t = neighbors[i];
            if (forestTooClose(x - t.x, z - t.z, T, t.T, pk)) return false;
        }
        return true;
    }

    // SCATTER_STRATUM — ecology axes only (floor / scaleBase / scaleVar / slopeMax).
    // Host SCATTER.layers READ these; cellM/cap/kind/promotable/densityScale stay Host perf.
    // Distinct from FOREST_* / planForestCell (canopy darts). Do NOT merge into planForestCell.
    const SCATTER_STRATUM = {
        tree: { floor: 0.1, scaleBase: 0.6, scaleVar: 1.5, slopeMax: 1.45 },
        under: { floor: 0.06, scaleBase: 0.8, scaleVar: 0.5, slopeMax: 1.0 },
        rock: { floor: 0.02, scaleBase: 0.6, scaleVar: 1.0, slopeMax: 1.6 },
    };
    function scatterStratum(name) {
        return SCATTER_STRATUM[name] || null;
    }

    // Die BORN-Darts einer Zelle — reine Funktion von (cx,cz,seed,ctx). Jeder Roh-Dart läuft
    // die Vorlagen-Kette: bimodaler standDensity-Wurf → Boden/Wasser → Slope-Grundierung →
    // Arten-Nische (Klima × Patch-Mosaik × Feuchte × Höhen-Trockenheit × Offenheit, inkl. der
    // AUTO-Arten aus dem Rezeptbuch via ctx.extras) → reverse-J-Größe → Mammut-Promotion.
    // ctx = { F, baseH, extras, fbm(px,pz), surfaceYAt(x,z), waterYAt(x,z), slopeAt(x,z),
    // feuchteAt(x,z,surfY), ortFrei?(x,z,T) }. Die rng()-Aufruf-REIHENFOLGE ist heilig (byte-deterministisch).
    // FOREST_TOPOLOGY.host = "cell" — cell-darts + Host shy prio-max; Feel-Entscheid .116; no fake merge with Lab disk.
    function planForestCell(cx, cz, seedInt, ctx) {
        const F = ctx.F;
        const CELL = F.cell;
        const rng = forestCellRng(cx, cz, seedInt);
        const ss = (e0, e1, v) => {
            let t = (v - e0) / (e1 - e0);
            t = t < 0 ? 0 : t > 1 ? 1 : t;
            return t * t * (3 - 2 * t);
        };
        const extras = ctx.extras || [];
        const out = [];
        for (let i = 0; i < F.dartsPerCell; i++) {
            const x = (cx + rng()) * CELL;
            const z = (cz + rng()) * CELL;
            const sd = forestStandDensity(ctx.fbm, x, z);
            if (rng() > forestGeburt(sd)) continue;
            // Boden + Wasser: EIN Oberflächen-Scan, die Wasser-Marge selbst hergeleitet.
            const surfaceY = ctx.surfaceYAt(x, z);
            if (surfaceY === null || !Number.isFinite(surfaceY)) continue;
            const waterY = ctx.waterYAt(x, z);
            const above = surfaceY - waterY;
            if (above <= 0.4) continue; // im offenen/flachen Wasser wächst NICHTS (Vorlage _de<-0.2)
            // SLOPE-Grundierung (die Voxelwelt hat Klippen, die die Vorlage nicht kennt).
            const slope = ctx.slopeAt(x, z);
            if (rng() > 1 - ss(F.slopeLo, F.slopeHi, slope)) continue;
            // ARTEN-NISCHE (Vorlage wF/wT/wE/wB/wW) — Klima × Patch × Feuchte × Trockenheit × Offenheit, die EINE
            // Nische des Orts (`forestNische`, ohne rng — die Wurf-Reihenfolge des Darts bleibt heilig).
            const NO = forestNische(x, z, surfaceY, sd, ctx);
            const clim = NO.clim;
            const patch = NO.patch;
            const pf = (c) => Math.max(0, 1 - Math.abs(patch - c) / 0.14); // extras-Loop (AUTO-Arten)
            const wF = NO.wF;
            const wT = NO.wT;
            const wE = NO.wE;
            const wB = NO.wB;
            const wW = NO.wW;
            // NERVENSYSTEM — die AUTO-Arten (ctx.extras, aus dem LIVE-Rezeptbuch) streuen mit:
            // Patch-Nische deterministisch aus dem Namens-Hash — die neue Art bildet eigene
            // Haine, ohne dass hier je eine Zeile für sie geschrieben wird.
            let wXsum = 0;
            for (let xi = 0; xi < extras.length; xi++) {
                wXsum += extras[xi].w0 * (0.2 + 3.6 * pf(extras[xi].center));
            }
            const wsum = wF + wT + wE + wB + wW + wXsum;
            let pick = rng() * wsum;
            let sp;
            // pick strings Host-lokal (RNG heilig) — Lab-Zwilling fichte via FOREST_SPECIES.labToHost
            if ((pick -= wF) < 0) sp = "baum_kiefer";
            else if ((pick -= wT) < 0) sp = "baum_tanne";
            else if ((pick -= wE) < 0) sp = "baum_eiche";
            else if ((pick -= wB) < 0) sp = "baum_birke";
            else if ((pick -= wW) < 0) sp = "baum_erle";
            else {
                // die Auto-Arten (Reihenfolge deterministisch: extras ist sortiert)
                sp = "baum_erle";
                for (let xi = 0; xi < extras.length; xi++) {
                    if ((pick -= extras[xi].w0 * (0.2 + 3.6 * pf(extras[xi].center))) < 0) {
                        sp = extras[xi].species;
                        break;
                    }
                }
            }
            // Nur die Weide-Nische (baum_erle) steht im nassen Saum; der Rest würde versaufen.
            if (sp !== "baum_erle" && above <= 1.2) continue;
            // GRÖSSE + optional Mammut via phyto-core Helper.
            // RNG-Ordnung unverändert: size (ue/Überhälter) zuerst; Mammut-Roll nur wenn
            // sp !== baum_erle (Species-Gate Caller-lokal — sonst Drift an prio/keep/…).
            let s = forestTreeSize(rng, sd);
            let T = (F.crown[sp] || 4.0) * s; // Auto-Arten ohne Kronen-Eintrag → generischer 4-m-Radius
            // MAMMUT-Nische (baum_mammut, selten + riesig) an dichten, trockenen Kernen.
            if (sp !== "baum_erle") {
                const m = forestMammutRoll(rng, sd, clim);
                if (m.promote) {
                    sp = "baum_mammut";
                    s = m.s;
                    T = F.crown.baum_mammut * s;
                }
            }
            const prio = rng(); // Kronen-Schüchternheit: das prio-Maximum im Konflikt-Radius gewinnt
            const keep = rng(); // Perf-Kappung (separat von prio → die Form bleibt beim Dünnen)
            const totRoll = rng(); // Totholz-Sub-Spawn (Wald-Boden-Debris)
            const rotY = rng() * 6.283185307;
            const seed =
                (Math.imul((Math.round(x * 16) | 0) ^ (Math.round(z * 16) | 0), 2654435761) ^ (seedInt + i)) >>> 0;
            // DER ORT VOR DEM WALD (K10): reserviert ein Ort den Grund (ctx.ortFrei, der Erdbau des Wirts), fällt die Krone,
            // die ihn berührt — NACH allen Würfen des Darts, die folgenden Darts bleiben byte-gleich.
            if (ctx.ortFrei && !ctx.ortFrei(x, z, T)) continue;
            out.push({ x, z, sp, s, T, prio, keep, totRoll, rotY, seed, surfaceY });
        }
        return out;
    }

    // ===== W5.3 (Paritäts-Vollendung) — DIE GETEILTE LOD-CROSSFADE-MASKEN-QUELLE =====
    // Die EXAKTE Übersetzung der Studio-Dither-Blende (foundry-core.js `injectWind`,
    // Fragment-Maske Z.210–233, FIX v37 + phytogenesis `_impMat`-Fragment „fin") als reine
    // Skalar-Funktionen — DREI Leser (Gesetz #0, kein Re-Derivations-Parallelpfad):
    //   (1) der Studio-GLSL selbst (foundry-core.js — seine Konstanten kommen aus DENSELBEN
    //       Config-Zahlen `PORTAL_RENDER_CONFIG.lod` d0/d1/fade/fade0),
    //   (2) AnazhRealms TSL-Builder (`_lodCrossfadeMaskNode` mappt symbolisch auf DIESE Formeln),
    //   (3) die Node-Linse (`scripts/diag-foundry-crossfade.cjs` evaluiert DIESE Funktion gegen
    //       die per Regex aus foundry-core.js geparsten GLSL-Konstanten — die Drift-Wand).
    // KEINE eigene Konstante: `cfg` trägt d0/d1/fade/fade0 als PARAMETER (dieselben Zahlen, die
    // in AnazhRealm als LOD_DISTANCES.thresh01/thresh12/fade/fade0 leben — beide Schreibweisen
    // werden gelesen).
    //
    // Interleaved-Gradient-Noise (Jimenez) — BYTE-GENAU die foundry-core-`_dh`-Koeffizienten:
    //   _dh = fract(52.9829189 · fract(x·0.06711056 + y·0.00583715) + uDitherT)
    function lodDitherIGN(x, y, t) {
        const fr = (v) => v - Math.floor(v);
        return fr(52.9829189 * fr(x * 0.06711056 + y * 0.00583715) + (t || 0));
    }
    // Die Masken-Entscheidung EINER Stufe an EINEM Fragment (dist, ditherWert → keep/discard).
    //   dist     = Skelett-Wahrnehmungs-Distanz (GLSL vLodD = camDist·min(uLodRef/(aH0·s),1)),
    //   distLeaf = Blatt-Distanz (GLSL vLodDL, aH0L-Metrik; Default = dist — Rinde: aH0L==aH0),
    //   ditherVal = der IGN-Wert des Fragments (lodDitherIGN),
    //   cfg      = { d0, d1, fade, fade0 } (== thresh01/thresh12/fade/fade0),
    //   lod      = 0 (Stufe L0, Studio aLodLevel 1) · 1 (Stufe L1, aLodLevel 2) · 2 (Impostor/fin),
    //   isFoliage = Laub (überlappende Rampen, FIX v37) vs. Rinde (exakte Partition — die L0/L1-
    //               Zylinder liegen deckungsgleich, Union hieße Z-Fighting auf jedem Stamm).
    // Rückgabe { keep, f0, f1, f1o }: keep true = das Fragment bleibt (GLSL: kein discard).
    function lodCrossfadeMask(dist, ditherVal, cfg, lod, isFoliage, distLeaf) {
        const c01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);
        const d0 = cfg && cfg.d0 !== undefined ? cfg.d0 : cfg ? cfg.thresh01 : NaN;
        const d1 = cfg && cfg.d1 !== undefined ? cfg.d1 : cfg ? cfg.thresh12 : NaN;
        const fade = cfg ? cfg.fade : NaN;
        const fade0 = cfg ? cfg.fade0 : NaN;
        const dL = typeof distLeaf === "number" ? distLeaf : dist;
        // GLSL: _f1 = clamp((vLodD −(LOD_D1−LOD_FADE))/LOD_FADE, 0, 1)  — das L1→L2-Band,
        //       _f0 = clamp((vLodDL−(LOD_D0−LOD_FADE0))/LOD_FADE0, 0, 1) — das L0→L1-Band,
        //       _f1o = clamp(_f1·2 − 1, 0, 1) — die VERZÖGERTE Fern-Ausblendung (obere Bandhälfte;
        //       das Billboard blendet in der unteren Hälfte ein → Union, fight-frei da tiefen-versetzt).
        const f1 = c01((dist - (d1 - fade)) / fade);
        const f0 = c01((dL - (d0 - fade0)) / fade0);
        const f1o = c01(f1 * 2.0 - 1.0);
        let keep;
        if (lod >= 2) {
            // Impostor-EINblendung (phytogenesis _impMat: fin = clamp((vCD−(uD1−uFade))/uFade,0,1);
            // discard wenn max(min(fin·2,1), vOcc) < _dh — vOcc (Vorbake-Okklusion) hier 0):
            keep = Math.min(f1 * 2.0, 1.0) >= ditherVal;
        } else if (lod <= 0) {
            // Stufe L0 (GLSL vLod<1.5): Laub discard wenn clamp(2f0−1)≥dh (weicht erst in der
            // OBEREN Bandhälfte — FIX v37) · Rinde discard wenn f0≥dh (volle Rampe = Partition).
            keep = isFoliage ? c01(f0 * 2.0 - 1.0) < ditherVal : f0 < ditherVal;
        } else {
            // Stufe L1 (GLSL else): Laub-EINblendung via min(2f0,1) (discard wenn <dh, bei Band-
            // mitte VOLL da) · Rinde exakt komplementär (discard wenn f0<dh → keepL0 XOR keepL1);
            // Fern-Ausblendung beider via f1o (discard wenn f1o≥dh).
            const fadeIn = isFoliage ? Math.min(f0 * 2.0, 1.0) >= ditherVal : f0 >= ditherVal;
            keep = fadeIn && f1o < ditherVal;
        }
        return { keep: keep, f0: f0, f1: f1, f1o: f1o };
    }

    // ════════════════════════════════════════════════════════════════════
    // U2b — DAS RINDEN-GESETZ (V18.467, rein additiv): die EINE Rinden-
    // Wahrheit wohnt im Pflanzen-Gesetzbuch. VERBATIM aus foundry-core
    // gewandert (Byte-Beweis: diag:foundry-parity 720/720 + gate:asset-
    // contract Goldens byte-exakt); foundry-core DELEGIERT hierher (kein
    // Zwilling, gate:altlasten hält die Rückkehr-Wand). Inhalt: das
    // Rinden-RAUSCHEN (vn2/fbm2 — deterministisch, Math.imul-Hash), das
    // barkProfile-ARTEN-Gesetz (oak/sequoia/conifer/willow/birch/smooth —
    // Furchen · Platten · Lentizellen · papery) und die Tube-FORM
    // (buildTubeGesetz: Furchen-Profil × Sonnen-Lerp × Birken-Lentizellen;
    // Geometrie-Vokabular wird vom Wirt INJIZIERT [vok], __lod reist als
    // Parameter statt Modul-Zustand).
    // ════════════════════════════════════════════════════════════════════
    function vn2(x, y) {
        const xi = Math.floor(x),
            yi = Math.floor(y),
            xf = x - xi,
            yf = y - yi;
        const h = (a, b) => {
            let n = (Math.imul(a, 1597) + Math.imul(b, 51749)) | 0;
            n = (n << 13) ^ n;
            const nn = Math.imul(n, n);
            const t = (Math.imul(nn, 15731) + 789221) | 0;
            const m = (Math.imul(n, t) + 1376312589) | 0;
            return 1 - (m & 0x7fffffff) / 1073741824;
        };
        const u = xf * xf * (3 - 2 * xf),
            v = yf * yf * (3 - 2 * yf);
        // Vier Gitter-Hashes statt sechs — dieselben IEEE-Operationen, byte-gleich (wie der Wuchs-Zwilling oben).
        const h00 = h(xi, yi),
            h01 = h(xi, yi + 1);
        const x1 = h00 + (h(xi + 1, yi) - h00) * u,
            x2 = h01 + (h(xi + 1, yi + 1) - h01) * u;
        return (x1 + (x2 - x1) * v) * 0.5 + 0.5;
    }

    function fbm2(x, y) {
        return vn2(x, y) * 0.6 + vn2(x * 2.3 + 11, y * 2.3) * 0.27 + vn2(x * 5.1, y * 5.1 + 7) * 0.13;
    }

    function barkProfile(P) {
        const t = P.barkType || (P.conifer ? "conifer" : "oak");
        const T = {
            oak: { ridges: 9, depth: 0.4, vSharp: 1.7, plate: 0.55, hFreq: 2.4, lichen: 0.5, papery: 0 },
            sequoia: { ridges: 14, depth: 0.52, vSharp: 1.5, plate: 0.2, hFreq: 1.1, lichen: 0.18, papery: 0 },
            conifer: { ridges: 8, depth: 0.34, vSharp: 1.3, plate: 0.8, hFreq: 3.0, lichen: 0.55, papery: 0 },
            willow: { ridges: 10, depth: 0.42, vSharp: 1.6, plate: 0.45, hFreq: 2.0, lichen: 0.5, papery: 0 },
            birch: { ridges: 5, depth: 0.07, vSharp: 1.0, plate: 0.1, hFreq: 5.5, lichen: 0.12, papery: 1 },
            smooth: { ridges: 5, depth: 0.1, vSharp: 1.1, plate: 0.2, hFreq: 3.0, lichen: 0.3, papery: 0 },
        };
        return T[t] || T.oak;
    }

    // DIE BIRKEN-RINDE (05.10., Pflanzen-Nahbild) — die Zahlen der papierenen Rinde. Befund (Blick-Tour V18.530, Bilder
    // 02/06; Node-Bau der Brücke): der Birkenstamm stand gipsweiß — die Palette lag roh bei 0,90 (Betulin-Weiß der Natur
    // ~0,5), und die Lentizellen-Striche (along·10, Wellenlänge 0,1 Vorlagen-m) lagen unter dem Ring-Gitter (Stamm-Ring
    // alle 0,136): die Welt liest nur Vertex-Farben (Lehre 19), das Gitter trug keinen Strich. Jetzt TRÄGT das Gitter, was
    // die Art ausmacht:
    //   zeile        mittlerer Abstand der Lentizellen-Zeilen entlang des Strangs (Vorlagen-m; Welt ×3,1–3,4 ≈ 30 cm),
    //                gewürfelt ×[0,55 … 1,45], am Fuß dichter (bis ×0,6 über der Borke);
    //   hoehe        Zeilen-Höhe [min, max] (Vorlagen-m ≈ 1,3–4,7 cm Welt) — je Zeile in der L0 vier Ringe: weiß · dunkel ·
    //                dunkel · weiß, die Kante `naht` breit (der Strich endet hart wie am echten Stamm, nie als Verlauf);
    //                die L1 (ab 12 m) trägt nur das dunkle Paar (weiche Kante, halbe Ring-Kosten);
    //   strich       Schwelle des Strich-Rauschens je Spalte (11 Zellen je Umlauf), je Zeile ±0,1 gewürfelt: darüber ist
    //                die Zeile dunkel — Striche und mal ein langer Riss, keine Ringe;
    //   dunkel       Lentizelle, Riss und Astnarben-Keil (linear);
    //   borke        Höhe der schwarzen Fuß-Borke als Anteil der Baumhöhe, die Oberkante gezackt ±`borkeZacke`;
    //                darin vertikale Risse (`borkeRisse` je Umlauf) zwischen grauen Platten, `fussRaster` = Ring-Abstand der
    //                Fuß-Zone (die Kante liegt auf dem Gitter, nicht zwischen zwei 0,4 m entfernten Ringen);
    //   zweigR       [dunkel, weiß] in trunkR: Birkenzweige sind rotbraun (`zweig`), Betulin tragen nur Stamm und
    //                Äste — darunter läuft die Rinde ins Dunkle; Zeilen trägt ein Strang ab `zeilenAb`·trunkR (Stamm und
    //                Starkäste: Zeilen auch auf den Ästen von 0,2·trunkR kosteten die Birken-L1 11,0–11,6k > tree[1] 10k).
    // Die Totäste (barkThick) tragen kein Gitter und die dunkle Zweig-Rinde; die Fuß-Borke lesen sie nach der Höhe wie
    // jeder Strang. Nur L0/L1 verdichten (die L2 ist die Karte).
    // Der Bestand (T2, 16.10.) legt den Stamm frei (Kronen-Anteil 0,6): der reine Stamm trug 1,9 % Lentizellen (vorher deckte
    // die tief ansetzende Krone das Stamm-Band), die Krone über 0,7 H Rinden-Albedo 0,35 (der weiße Leittrieb). Jetzt `strich`
    // 0,56 → 0,45 (Stamm 5,6–5,9 %, Solitär 17,8 %) und `zweigR` [0,05; 0,14] → [0,1; 0,3] trunkR (Bestand: Zweige unter
    // ~1,4 cm dunkel, Äste über ~4 cm weiß — Betulin trägt der Stamm und der Starkast): Krone 0,14–0,15, Solitär 0,085.
    // Der Hub der Krone streckt den Leittrieb im Kronenraum: seine Zeilen auf 0,40–0,45 trunkR hoben die L0 auf 11,1–12,2k
    // Dreiecke (tree[0] 12 000); `zeilenAb` 0,4 → 0,45: L0 10,2–11,5k (Gestalten 1–5, 7, 12345), der Stamm-Band bleibt ganz.
    const BIRKEN_RINDE = {
        zeile: 0.09,
        hoehe: [0.003, 0.018],
        naht: 0.0015,
        strich: 0.45,
        dunkel: [0.052, 0.047, 0.045],
        borke: 0.085,
        borkeZacke: 0.35,
        borkeRisse: 11,
        borkeFarbe: [0.072, 0.066, 0.06],
        fussRaster: 0.03,
        zweigR: [0.1, 0.3],
        zweig: [0.1, 0.07, 0.058],
        zeilenAb: 0.45,
    };

    // DIE BILD-HÖHE EINES BAUMS an der Nahkante seiner Stufe in Pixeln (S3, 09.10.; 1080 Zeilen bei 75° Sichtfeld): die
    // L1 beginnt bei Distanz = Baumhöhe (704 px je Baumhöhe, wie tree[1].ringToleranz rechnet); die L0 beginnt auf
    // Armlänge — an ihrer Nahkante ist jedes Merkmal im Bild (unendlich). Gemessen: ohne die Naht-Ringe (1,5 mm Vorlage,
    // an einer L0-Kante von 1 408 px je Baumhöhe 0,6 px) verschmierte die Lentizelle, die Birken-L0 fiel auf Stamm-Albedo
    // 0,291 (Band 0,30–0,55, gate:pflanzen-nah) — auf 3 m ist die Naht 2–3 px. Ein Merkmal unter dem Pixel der Kante
    // trägt die Stufe nicht.
    const STUFEN_BILD_PX = [Infinity, 704];
    // Der Umkreis-Faktor des Wurf-Kants (S3): ein gleichseitiges Dreieck mit Umkreis R hat die mittlere Breite 3√3·R/π —
    // gleich der des Kreises 2r bei R = 2π/(3√3)·r.
    const WURF_KANT = (2 * Math.PI) / (3 * Math.sqrt(3));

    // Das Ring-Gitter einer Birken-Röhre: die Fuß-Zone im Raster `fussRaster`, darüber je Lentizellen-Zeile vier Ringe
    // (linear auf dem gewachsenen Strang eingesetzt — die Gestalt bleibt, das Gitter verdichtet sich). Ringe tragen
    // `zeile` (Index der Zeile, nur die dunklen) — die Farbe liest es.
    function birkenGitter(rings, P, trunkR, seed, vlen, vsub, lod) {
        const B = BIRKEN_RINDE;
        const n = rings.length;
        const sA = [0];
        for (let i = 1; i < n; i++) sA[i] = sA[i - 1] + vlen(vsub(rings[i].c, rings[i - 1].c));
        const L = sA[n - 1];
        if (!(L > 1e-6)) return rings;
        const auf = (s) => {
            let i = 1;
            while (i < n - 1 && sA[i] < s) i++;
            const a = rings[i - 1],
                b = rings[i],
                t = Math.max(0, Math.min(1, (s - sA[i - 1]) / Math.max(1e-12, sA[i] - sA[i - 1])));
            return {
                c: [a.c[0] + (b.c[0] - a.c[0]) * t, a.c[1] + (b.c[1] - a.c[1]) * t, a.c[2] + (b.c[2] - a.c[2]) * t],
                r: a.r + (b.r - a.r) * t,
                sway: a.sway + (b.sway - a.sway) * t,
                depth: a.depth,
                fuss: a.fuss && b.fuss,
            };
        };
        const neu = [];
        const borkeH = B.borke * P.height;
        // Fuß-Zone: das Raster bis über die höchste Zacke der Borke (Höhe des Ring-Zentrums).
        const fussTop = borkeH * (1 + B.borkeZacke) + B.fussRaster;
        for (let i = 0; i < n - 1; i++) {
            const y0 = rings[i].c[1],
                y1 = rings[i + 1].c[1];
            if (Math.min(y0, y1) > fussTop || Math.max(y0, y1) < 0) continue; // nur über dem Boden
            const k = Math.ceil((sA[i + 1] - sA[i]) / B.fussRaster);
            for (let j = 1; j < k; j++) neu.push({ s: sA[i] + ((sA[i + 1] - sA[i]) * j) / k, zeile: -1 });
        }
        // Die Lentizellen-Zeilen: nur wo der Strang Betulin trägt (r ≥ zeilenAb·trunkR, nie im Stammfuß-Puffer unter
        // dem Boden) und über der Borke.
        let s = 0,
            z = 0;
        const rMin = B.zeilenAb * trunkR;
        while (z < 400) {
            const p = auf(s);
            const ueber = p.c[1] - borkeH;
            const dicht = 0.6 + 0.4 * Math.max(0, Math.min(1, ueber / (2 * borkeH)));
            s += B.zeile * dicht * (0.55 + 0.9 * fbm2(z * 1.7 + seed * 0.13, 5.3));
            if (s >= L) break;
            const q = auf(s);
            const h = B.hoehe[0] + (B.hoehe[1] - B.hoehe[0]) * fbm2(z * 2.9 + seed, 1.7);
            // DAS PIXEL-GESETZ DER ZEILE (S3, 09.10.): eine Zeile ist ein Band, wo sie an der Nahkante der Stufe mindestens
            // zwei Bild-Pixel hoch ist (Nyquist, wie das Gitter-Gesetz der Ringe) — darunter flimmert sie als Linie und
            // trägt keine eigenen Ringe. Befund: die Birken-L1 trug je Stamm 87 Ringe (die L0 88) — 3,4–3,8k Dreiecke Rinde;
            // die L0 (Armlänge) trägt jede Zeile.
            if (!q.fuss && q.r >= rMin && q.c[1] > borkeH * 0.7 && h >= (2 * P.height) / STUFEN_BILD_PX[lod]) {
                const a0 = s - h * 0.5,
                    a1 = s + h * 0.5;
                neu.push({ s: a0, zeile: z }, { s: a1, zeile: z });
                // Die harte Kante (zwei Naht-Ringe) trägt eine Stufe nur, wo das Pixel sie trägt (S3, 09.10.): die Naht
                // ist mindestens ein Bild-Pixel an der Nahkante der Stufe (STUFEN_BILD_PX) — die L0 trägt sie (Armlänge),
                // die L1 (12 m) zeichnet die Zeile weich.
                if (B.naht >= P.height / STUFEN_BILD_PX[lod])
                    neu.push({ s: a0 - B.naht, zeile: -1 }, { s: a1 + B.naht, zeile: -1 });
            }
            z++;
        }
        if (!neu.length) return rings;
        neu.sort((x, y) => x.s - y.s);
        const aus = [];
        let j = 0;
        for (let i = 0; i < n; i++) {
            while (j < neu.length && neu[j].s < sA[i]) {
                if (neu[j].s > 1e-6 && (!aus.length || neu[j].s - aus[aus.length - 1]._s > 1e-6)) {
                    const r = auf(neu[j].s);
                    r._s = neu[j].s;
                    if (neu[j].zeile >= 0) r.zeile = neu[j].zeile;
                    aus.push(r);
                }
                j++;
            }
            const o = Object.assign({}, rings[i]);
            o._s = sA[i];
            aus.push(o);
        }
        return aus;
    }

    // DAS GITTER-GESETZ DER RINDE (05.10.): das Gesetz malt entlang des Strangs nur, was das Ring-Gitter trägt. Die
    // Plattenrisse (Periode 1/hFreq) liegen auf Ringen im Abstand Δ — unter zwei Ringen je Periode (Nyquist) faltet der
    // Riss in Ringel-Bänder (Fichte/Tanne: 1,95 Ringe je Periode, Node-Bau 05.10.); von 3 Ringen abwärts blendet der
    // Term in sein Mittel (∫ tri^1,3 = 1/2,3), unter 2 ist er aus. Was die Art AUSMACHT, trägt das Gitter dagegen selbst
    // (die Birken-Zeilen verdichten es, `birkenGitter`).
    const RINDEN_GITTER = { aus: 2, voll: 3, mittel: 1 / 2.3 };

    function buildTubeGesetz(vok, geos, rings, P, barkBase, barkTip, trunkR, noFlute, barkThick, lodIn) {
        // Vokabular-Injektion (U2b): die Geometrie-Helfer UND THREE bleiben Leser-Sache —
        // der Wirt (foundry-core) reicht SEINE Funktionen, das GESETZ formt (phyto-core
        // selbst bleibt THREE-frei, wie buildBoulderGeometry).
        const { perp, vcross, vlen, vnorm, vsub, clamp, lerp, THREE } = vok;
        const __lod = lodIn;
        if (rings.length < 2) return;
        const prof = barkProfile(P);
        // Der Basis-Radius ist der Strang-Fuß ÜBER dem Stammfuß-Puffer (V18.501): die Buttress-Ringe
        // (fuss) laufen auf 0,1·R0 zu — aus ihnen las das Gesetz „Zweig" (Zehneck, keine Furchen, keine
        // Narben am dicksten Stamm).
        const baseR = (rings.find((x) => !x.fuss) || rings[0]).r,
            thick = clamp((baseR - trunkR * 0.12) / (trunkR * 0.88), 0, 1); // 0 Zweig .. 1 Stamm
        // Die Birke verdichtet ihr Gitter (L0/L1, Stamm + Äste ab zweigR[0]): Fuß-Raster und Lentizellen-Zeilen. Die
        // Wurzeln tragen die Borke ganz — ihr Gitter bleibt.
        if (prof.papery && !(__lod >= 2) && barkThick === undefined && baseR >= trunkR * BIRKEN_RINDE.zweigR[0])
            rings = birkenGitter(rings, P, trunkR, rings[0].c[0] * 7.3 + rings[0].c[2] * 3.1, vlen, vsub, __lod || 0);
        const M = rings.length;
        const bthick = barkThick !== undefined ? barkThick : thick; // Wurzel/Totast erben die STAMM-Oberflaeche (gleiche Furchentiefe), nicht die duenn-glatte
        const ridges =
            barkThick !== undefined
                ? Math.max(3, Math.round(prof.ridges * clamp(baseR / trunkR, 0.28, 1)))
                : Math.round(lerp(4, prof.ridges, bthick)); // Wurzel: Furchen in WELT-Groesse des Stamms (nicht enger), nur Tiefe wie Stamm
        let R = Math.max(6, Math.round(ridges * (bthick > 0.6 ? 3.0 : 2.4)));
        // DER WURF-KANT (S3, 09.10., `lodIn` 3): das Gerüst des Schatten-Teils (foundry-core tree[1].wurf) ist ein
        // Dreikant — der Schatten-Pass sieht nur den Umriss, nie Furche, Farbe oder Licht.
        R =
            __lod === 3
                ? 3
                : typeof __lod !== "undefined" && __lod === 2
                  ? Math.max(4, Math.round(R * 0.4))
                  : Math.max(5, R - (typeof __lod !== "undefined" ? __lod * 4 : 0)); // Stamm (thick) SCHARF, Aeste sparsam
        // DAS PIXEL-GESETZ DER RÖHRE (S3, 09.10.; greift an der L1 — die L0 beginnt auf Armlänge): die Radial-Teilung
        // folgt dem Bild — so viele Seiten, wie der Umriss an der Nahkante der Stufe braucht (Sehnen-Abstand ≤ ½ px bei
        // STUFEN_BILD_PX je Baumhöhe), und
        // mindestens zwei je Furche (Nyquist, wie das Gitter-Gesetz der Ringe); nie mehr, als das Rinden-Gesetz gibt.
        // Befund: die Mammut-L1 trug ihren Stamm mit 38 Seiten (1 520 Dreiecke) — der Umriss braucht an der L1-Kante 25,
        // die 14 Furchen 28.
        if (P.kind === "tree" && (__lod === 0 || __lod === 1)) {
            let rMax = 0;
            for (const x of rings) if (!x.fuss && x.r > rMax) rMax = x.r;
            const rPx = (rMax / Math.max(1e-6, P.height)) * STUFEN_BILD_PX[__lod];
            const nUmriss = rPx > 0.5 ? Math.ceil(Math.PI / Math.acos(1 - 0.5 / rPx)) : 3;
            R = Math.min(R, Math.max(5, nUmriss, 2 * ridges));
        }
        const depth = prof.depth * lerp(0.28, 1, bthick),
            lichenA = prof.lichen * 0.6; // __lichen existierte in keinem Regime — der alte Guard fiel IMMER auf 0.6
        const lichenCol = new THREE.Color(0x8a946a),
            mossCol = new THREE.Color(0x556a3a);
        const seed = rings[0].c[0] * 7.3 + rings[0].c[2] * 3.1;
        // Bogenlaenge entlang des Strangs
        const sA = [0];
        for (let i = 1; i < M; i++) sA[i] = sA[i - 1] + vlen(vsub(rings[i].c, rings[i - 1].c));
        const totL = sA[M - 1] || 1;
        // DAS GITTER-GESETZ: je Ring der örtliche Ring-Abstand Δ und die Gewichte der Terme entlang des Strangs (Ringe je
        // Periode): Plattenrisse (hFreq) und die zwei Mikro-Oktaven (Frequenz 5 und 13 je Vorlagen-m).
        const wPlatte = [],
            wMikro5 = [],
            wMikro13 = [];
        const gw = (f, dS) =>
            clamp((1 / (f * Math.max(1e-6, dS)) - RINDEN_GITTER.aus) / (RINDEN_GITTER.voll - RINDEN_GITTER.aus), 0, 1);
        for (let i = 0; i < M; i++) {
            const dS = (sA[Math.min(M - 1, i + 1)] - sA[Math.max(0, i - 1)]) / (i === 0 || i === M - 1 ? 1 : 2);
            wPlatte.push(gw(prof.hFreq, dS));
            wMikro5.push(gw(5, dS));
            wMikro13.push(gw(13, dS));
        }
        const dirs = [];
        for (let i = 0; i < M - 1; i++) {
            const d = vsub(rings[i + 1].c, rings[i].c),
                l = vlen(d) || 1e-9;
            dirs.push([d[0] / l, d[1] / l, d[2] / l]);
        }
        dirs.push(dirs[M - 2]);
        let u = perp(dirs[0]),
            v = vnorm(vcross(dirs[0], u));
        const stride = R + 1;
        // NARBEN: der Stamm ZEICHNET seine Geschichte auf — wo die unteren Schattenaeste starben (unter crownBase), bleibt eine Wunde.
        const isTrunk = thick > 0.6,
            scarTop = (P.crownBase || 0) * P.height;
        const nScar = isTrunk ? Math.max(3, Math.min(8, Math.round(P.height * 0.6))) : 0;
        const scarH = [],
            scarA = [];
        if (isTrunk) {
            const ss = seed * 1.7 + 9.1;
            for (let k = 0; k < nScar; k++) {
                scarH.push(scarTop * (0.12 + 0.8 * (nScar > 1 ? k / (nScar - 1) : 0.5)));
                scarA.push(ss + k * 2.3999632);
            }
        } // goldener Winkel = echte Phyllotaxis
        const pos = [],
            idx = [],
            aw = [],
            ac = [],
            at = [],
            cl = [],
            uvs = [];
        const tri = (t) => {
            const f = t - Math.floor(t);
            return 1 - Math.abs(2 * f - 1);
        };
        for (let i = 0; i < M; i++) {
            if (i > 0) {
                const d1 = dirs[i];
                const du = u[0] * d1[0] + u[1] * d1[1] + u[2] * d1[2];
                u = [u[0] - d1[0] * du, u[1] - d1[1] * du, u[2] - d1[2] * du];
                const ul = vlen(u);
                u = ul < 1e-5 ? perp(d1) : [u[0] / ul, u[1] / ul, u[2] / ul];
                v = vnorm(vcross(d1, u));
            }
            const ring = rings[i],
                c = ring.c,
                sun = clamp(c[1] / P.height, 0, 1),
                sv = ring.sway,
                along = sA[i];
            const col = barkBase.clone().lerp(barkTip, sun * 0.5 + (ring.depth / Math.max(1, P.maxDepth)) * 0.32);
            const nB = Math.max(3, Math.round(P.roots || 5)),
                _fy = Math.max(0, c[1]),
                fluteOn = !noFlute && thick > 0.45 && P._bphase != null && (typeof __lod === "undefined" || __lod < 2),
                fluteY = fluteOn ? Math.exp(-_fy / (P.height * 0.3)) + 0.62 * Math.exp(-_fy / (P.height * 0.07)) : 0,
                fluteAmp = fluteY * (0.16 + (P.flare || 0) * 0.4);
            let _fd = 0,
                _fr = 0,
                _fg = 0,
                _fb = 0;
            for (let j = 0; j <= R; j++) {
                const a = j / R,
                    rad = a * 6.2831;
                let relief,
                    mB,
                    tintL = 0,
                    tintM = 0,
                    tiefe = depth,
                    pap = null;
                if (prof.papery) {
                    // DIE BIRKE (BIRKEN_RINDE): Betulin-Weiß aus der Palette, Lentizellen-Striche auf den Zeilen-Ringen,
                    // die dunkle Zweig-Rinde unter zweigR, am Fuß die schwarze Borke mit gezackter Oberkante.
                    const BR = BIRKEN_RINDE;
                    relief = 0.5 + (fbm2(a * 9, along * 0.7 + seed) - 0.5) * 0.45;
                    const peel = fbm2(a * 2.2, along * 0.5 + seed * 1.3) > 0.66 ? 0.1 : 0; // papierartige Schichtkanten
                    mB = (1.0 - peel) * (0.9 + 0.1 * fbm2(a * 5, along * 3));
                    // Der Totast (barkThick) trägt die dunkle Zweig-Rinde (ein toter Birkenast verliert sein Betulin),
                    // die Fuß-Borke aber nur nach der Höhe wie jeder Strang (Prüfer W5: die volle schwarze Fuß-Borke mit
                    // Platten und Rissen stand auf jedem Totast, auch hoch in der Krone).
                    const wz =
                        barkThick !== undefined
                            ? 0
                            : clamp((ring.r / trunkR - BR.zweigR[0]) / (BR.zweigR[1] - BR.zweigR[0]), 0, 1);
                    pap = [
                        lerp(BR.zweig[0], col.r * mB, wz),
                        lerp(BR.zweig[1], col.g * mB, wz),
                        lerp(BR.zweig[2], col.b * mB, wz),
                    ];
                    if (ring.zeile !== undefined) {
                        // Je Zeile ihre eigene Schwelle (±0,1): manche Zeile ein langer Riss, manche wenige kurze Striche.
                        const st = fbm2(a * 11 + ring.zeile * 1.31, ring.zeile * 3.7 + seed);
                        const sw = BR.strich + (fbm2(ring.zeile * 0.71 + seed, 9.4) - 0.5) * 0.2;
                        const an = clamp((st - sw) / 0.05, 0, 1) * wz;
                        for (let k = 0; k < 3; k++) pap[k] = lerp(pap[k], BR.dunkel[k], an);
                    }
                    const kante = BR.borke * P.height * (1 + BR.borkeZacke * (2 * fbm2(a * 4.3 + seed, 2.1) - 1));
                    const fB = clamp((kante - c[1]) / (BR.fussRaster * 1.5) + 0.5, 0, 1);
                    if (fB > 0) {
                        const tr = tri(a * BR.borkeRisse + fbm2(a * 1.6 + seed, c[1] * 2.2) * 1.4);
                        const platte = clamp((tr - 0.3) / 0.4, 0, 1); // 0 = Riss, 1 = graue Platte
                        const weiss = [col.r, col.g, col.b];
                        for (let k = 0; k < 3; k++)
                            pap[k] = lerp(pap[k], lerp(BR.borkeFarbe[k], weiss[k] * 0.42, platte * 0.55), fB);
                        relief = lerp(relief, 0.2 + 0.8 * platte, fB);
                        tiefe = lerp(depth, 0.32 * lerp(0.28, 1, bthick), fB);
                    }
                } else {
                    const vWarp = fbm2(a * 1.6 + seed, along * 0.35) * 1.5;
                    let vf = tri(a * ridges + vWarp);
                    vf = Math.pow(vf, prof.vSharp); // vertikale Furchen
                    const hWarp = fbm2(a * 0.6, along * 0.7 + seed) * 1.5;
                    const hf0 = Math.pow(tri(along * prof.hFreq + hWarp), 1.3); // horizontale Plattenrisse
                    const hf = wPlatte[i] >= 1 ? hf0 : RINDEN_GITTER.mittel + (hf0 - RINDEN_GITTER.mittel) * wPlatte[i]; // was das Gitter trägt
                    relief = vf * (1 - prof.plate) + vf * hf * prof.plate;
                    // Die Mikro-Oktaven sind Rauschen um 0 — was das Gitter nicht trägt, fällt in ihr Mittel (0).
                    const m5 = (fbm2(a * 5, along * 5) - 0.5) * 0.32,
                        m13 = (fbm2(a * 13, along * 13) - 0.5) * 0.16;
                    const micro = wMikro5[i] >= 1 && wMikro13[i] >= 1 ? m5 + m13 : m5 * wMikro5[i] + m13 * wMikro13[i];
                    relief = clamp(relief + micro, 0, 1);
                    mB = Math.pow(relief, 1.35) * 0.74 + 0.26; // gebackenes AO: Risse tief & dunkel
                    const lk = fbm2(a * 0.9 + 30, along * 0.55);
                    tintL = clamp((lk - 0.58) / 0.22, 0, 1) * lichenA * clamp(1.3 - along / totL, 0.2, 1) * relief;
                    tintM =
                        clamp((fbm2(a * 1.3, along * 0.4 + 50) - 0.6) / 0.2, 0, 1) *
                        clamp(1.4 - along / (totL * 0.4), 0, 1) *
                        lichenA *
                        0.7; // Moos am Fuss
                    if (barkThick !== undefined) {
                        tintL *= 0.25;
                        tintM *= 0.25;
                        mB = mB * 0.72 + 0.3;
                    } // WURZEL/TOTAST: kaum Moos, weniger AO -> gleiche Helligkeit wie der Stamm
                }
                const ridge = Math.pow(Math.max(0, Math.cos(nB * (rad - (P._bphase || 0)))), 1.8);
                const flute = Math.min(1.62, Math.max(0.7, 1 + fluteAmp * (1.45 * ridge - 0.3)));
                let scarR = 0,
                    scarDark = 0;
                for (let k = 0; k < nScar; k++) {
                    const dh = (c[1] - scarH[k]) / 0.5,
                        dth = Math.atan2(Math.sin(rad - scarA[k]), Math.cos(rad - scarA[k])) / 0.5;
                    const d2 = dh * dh + dth * dth;
                    if (d2 > 9) continue;
                    const gg = Math.exp(-d2);
                    scarR += -0.42 * gg + 0.24 * Math.max(0, d2 - 0.9) * Math.exp(-d2 * 0.6); // konkave Delle + aufgeworfener Wulst-Kragen
                    if (gg > scarDark) scarDark = gg;
                }
                // Der Wurf-Kant (`lodIn` 3): Umkreis 2π/(3√3)·r — seine mittlere Breite (Umfang/π) ist die des Rundstrangs.
                let disp = __lod === 3 ? ring.r * WURF_KANT : ring.r * (1 + (relief - 0.62) * tiefe + scarR) * flute;
                if (j === R) disp = _fd; // NAHT ZU: Position der Saumspalte = exakt Spalte 0
                const vx = c[0] + (Math.cos(rad) * u[0] + Math.sin(rad) * v[0]) * disp,
                    vy = c[1] + (Math.cos(rad) * u[1] + Math.sin(rad) * v[1]) * disp,
                    vz = c[2] + (Math.cos(rad) * u[2] + Math.sin(rad) * v[2]) * disp;
                pos.push(vx, vy, vz);
                uvs.push(a, i / (M - 1));
                aw.push(sv, sv * 1.5 + vx * 0.6 + vz * 0.6, clamp(2.6 - sv * 1.6, 0.5, 2.6));
                ac.push(c[0], c[1], c[2]);
                at.push(0);
                let r = pap ? pap[0] : col.r * mB,
                    g = pap ? pap[1] : col.g * mB,
                    b = pap ? pap[2] : col.b * mB;
                r = lerp(r, lichenCol.r, tintL);
                g = lerp(g, lichenCol.g, tintL);
                b = lerp(b, lichenCol.b, tintL);
                r = lerp(r, mossCol.r, tintM);
                g = lerp(g, mossCol.g, tintM);
                b = lerp(b, mossCol.b, tintM);
                if (pap) {
                    // Birke: die Astnarbe ist der schwarze Keil unter dem toten Ast (Lentizellen-Schwarz).
                    const wd = 0.9 * scarDark;
                    r = lerp(r, BIRKEN_RINDE.dunkel[0], wd);
                    g = lerp(g, BIRKEN_RINDE.dunkel[1], wd);
                    b = lerp(b, BIRKEN_RINDE.dunkel[2], wd);
                } else {
                    const wd = 0.6 * scarDark;
                    r = lerp(r, col.r * 0.26, wd);
                    g = lerp(g, col.g * 0.22, wd);
                    b = lerp(b, col.b * 0.2, wd); // dunkles Wundholz im Narbenzentrum
                }
                if (j === R) {
                    r = _fr;
                    g = _fg;
                    b = _fb;
                } // NAHT ZU: Farbe der Saumspalte = exakt Spalte 0
                if (j === 0) {
                    _fd = disp;
                    _fr = r;
                    _fg = g;
                    _fb = b;
                }
                cl.push(r, g, b);
            }
        }
        for (let i = 0; i < M - 1; i++)
            for (let j = 0; j < R; j++) {
                const aI = i * stride + j,
                    bI = aI + 1,
                    cI = aI + stride,
                    dI = cI + 1;
                idx.push(aI, bI, dI, aI, dI, cI);
            }
        const g = new THREE.BufferGeometry();
        g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
        g.setIndex(idx);
        g.computeVertexNormals();
        g.setAttribute("aWind", new THREE.Float32BufferAttribute(aw, 3));
        g.setAttribute("aCenter", new THREE.Float32BufferAttribute(ac, 3));
        g.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
        g.setAttribute("aType", new THREE.Float32BufferAttribute(at, 1));
        g.setAttribute("color", new THREE.Float32BufferAttribute(cl, 3));
        geos.push(g);
    }

    // V18.491.243 Lab+core Phyllotaxis; Host none (PHYLO_VIS).
    var PHYLO_GESETZ = { golden: Math.PI * (3 - Math.sqrt(5)) };
    var PHYLO_VIS = { lab: "golden-137.5", host: "none" };

    // V18.491.264 Lab weather preset table; der Host liest klar · regen · sturm als WEATHER_FIELD (K2, WX_VIS).
    // klar.wind 0.06 is WX (die Atmosphaere ist foundry-core ATMO_GESETZ, D3).
    var WX_GESETZ = {
        klar: { fog: 0.15, sun: 1.0, grey: 0.0, wind: 0.06, rain: 0.0 },
        bewoelkt: { fog: 0.4, sun: 0.32, grey: 0.74, wind: 0.3, rain: 0.12 },
        nebel: { fog: 1.0, sun: 0.48, grey: 0.46, wind: 0.1, rain: 0.0 },
        sturm: { fog: 0.7, sun: 0.15, grey: 0.88, wind: 1.0, rain: 1.0 },
        // K2 (rein additiv): der Regen der Welt — die Welt liest klar · regen · sturm aus DIESER Tafel (WEATHER_FIELD)
        regen: { fog: 0.4, sun: 0.55, grey: 0.6, wind: 0.35, rain: 0.6 },
    };
    var WX_VIS = { lab: "wx-4", host: "WEATHER_FIELD" };
    // K2 (rein additiv): das LICHT des Wetters — die Sonne der Zeile dimmt das Richtlicht auf sockel + sonne·sun (Labor:
    // keyLight und Spiegel-Farbe, Welt: WEATHER_TINTS.lightMul); den Himmel der Welt dimmt die Sonne der Zeile selbst (skyMul).
    var WX_LICHT = { sockel: 0.35, sonne: 0.65 };

    // DER EINE WIND UND DIE FRONT (wetter.K5 · wetter.K1, rein additiv — kein bestehender Wert bewegt sich). Die RICHTUNG des
    // Winds ist eine Funktion der Saat und der Zeit: θ(t) = θ0 + 0,5·sin(0,009·t + φ1) + 0,22·sin(0,0257·t + φ2), ±41° Mäander
    // um die Grundrichtung θ0; θ0 · φ1 · φ2 aus FNV-1a über saat + "-wind-dir" (ein eigener Strom der Saat). Der Vektor
    // (sin θ, cos θ) zeigt, wohin der Wind weht. Bis wetter.K5 rechnete der Stamm sie selbst (`_windDirAt`, dieselben Bytes).
    // DIE FRONT: das Wetter am Ort zur Zeit ist EINE Funktion wetterAt(saat, x, z, t) — Bänder der Saat (drei Wellen längs
    // der Grundrichtung θ0, die Front-Linie quer gebogen), die mit dem Höhenwind `zugMS` windab ziehen: was an A regnet,
    // regnet am Ort d windab nach d / zugMS. Die Front-Stärke (0…1) wählt die Zeile der Tafel WX_GESETZ — sturm · regen ·
    // bewoelkt über den `stufen`, darunter nebel, wo die Feuchte (eine Welle von `feuchteM`) über `stufen.nebel` steht, sonst
    // klar. Gerechnet über 300 Saaten × 400 Orte: klar 27 % · nebel 15 % · bewoelkt 21 % · regen 25 % · sturm 13 %; über
    // 20 min an zwei Orten 3 km windab regnet es an A bei trockenem B in 23–40 % der Zeit (403 Saaten, kein Fenster unter
    // 20 %). zugMS: der Zug der Fronten im Höhenwind (850 hPa, 30–50 km/h). `sturmMS` ist der Wind am Ort in m/s bei U = 1
    // (der Wind-Kanal der Sturm-Zeile, Böe 1): Beaufort 9–10 (20,8–28,4 m/s). Leser: die Welt (`_windAt`, `_wetterAmOrt`,
    // der Wetter-Zug) und das Labor (worlds/terrain, das Wetterspiel).
    var WIND_FELD = Object.freeze({
        sturmMS: 24,
        front: Object.freeze({
            zugMS: 11,
            wellen: Object.freeze([Object.freeze([6600, 1]), Object.freeze([4100, 0.45]), Object.freeze([2500, 0.25])]),
            biegeM: 600,
            querM: 21000,
            feuchteM: 31000,
            stufen: Object.freeze({ sturm: 0.79, regen: 0.6, bewoelkt: 0.43, nebel: 0.72 }),
        }),
    });
    function saatFnv(s) {
        var h = 2166136261 >>> 0;
        for (var i = 0; i < s.length; i++) h = ((h ^ s.charCodeAt(i)) * 16777619) >>> 0;
        return h;
    }
    var _windSaatMerk = { saat: null, w: null };
    function windSaat(saat) {
        if (_windSaatMerk.saat === saat) return _windSaatMerk.w;
        var h = saatFnv(saat + "-wind-dir");
        var g = saatFnv(saat + "-front") || 1;
        var lcg = function () {
            g = (Math.imul(g, 1664525) + 1013904223) >>> 0;
            return (g / 4294967296) * Math.PI * 2;
        };
        var w = {
            t0: (h / 4294967296) * Math.PI * 2,
            p1: (((h >>> 5) & 1023) / 1023) * Math.PI * 2,
            p2: (((h >>> 15) & 1023) / 1023) * Math.PI * 2,
            wellen: WIND_FELD.front.wellen.map(lcg),
            biege: lcg(),
            feuchte: lcg(),
        };
        _windSaatMerk.saat = saat;
        _windSaatMerk.w = w;
        return w;
    }
    function windRichtung(saat, t) {
        var w = windSaat(saat);
        var tt = Number.isFinite(t) ? t : 0;
        var theta = w.t0 + 0.5 * Math.sin(tt * 0.009 + w.p1) + 0.22 * Math.sin(tt * 0.0257 + w.p2);
        return { x: Math.sin(theta), z: Math.cos(theta) };
    }
    // Die Grundrichtung θ0 als Vektor: wohin die Fronten ziehen (das Zeit-Mittel des Mäanders)
    function windGrund(saat) {
        var w = windSaat(saat);
        return { x: Math.sin(w.t0), z: Math.cos(w.t0) };
    }
    function wetterAt(saat, x, z, t) {
        if (!(Number.isFinite(x) && Number.isFinite(z) && Number.isFinite(t)))
            throw new Error("wetterAt: Ort und Zeit sind endlich (" + x + ", " + z + ", " + t + ")");
        var F = WIND_FELD.front;
        var w = windSaat(saat);
        var dx = Math.sin(w.t0),
            dz = Math.cos(w.t0);
        var q = x * dz - z * dx;
        var s = x * dx + z * dz - F.zugMS * t + F.biegeM * Math.sin((2 * Math.PI * q) / F.querM + w.biege);
        var f = 0,
            sw = 0;
        for (var i = 0; i < F.wellen.length; i++) {
            f += F.wellen[i][1] * Math.sin((2 * Math.PI * s) / F.wellen[i][0] + w.wellen[i]);
            sw += F.wellen[i][1];
        }
        f = 0.5 + (0.5 * f) / sw;
        var feuchte = 0.5 + 0.5 * Math.sin((2 * Math.PI * s) / F.feuchteM + w.feuchte);
        var st = F.stufen;
        var zeile = "klar";
        if (f >= st.sturm) zeile = "sturm";
        else if (f >= st.regen) zeile = "regen";
        else if (f >= st.bewoelkt) zeile = "bewoelkt";
        else if (feuchte >= st.nebel) zeile = "nebel";
        return { zeile: zeile, front: f, feuchte: feuchte };
    }

    // ===================== DIE KARTE (W6): der Codec des EINEN Karten-Atlas — rein, THREE-frei =====================
    // Die Fernstufe einer Art ist EINE Schicht im Array-Atlas des Hosts: die V Ansichten VERTIKAL gestapelt, wie der
    // Welt-Renderer sie backt (S2, `_karteWeltBacken`: Zeile 0 oben). Die GPU-Ablage des Hosts (`KARTE_RECHNER_WGSL`: Mips,
    // BC1/BC5) rechnet DIESES Gesetz, `impostorMips` ist es auf der CPU (die Linse liest es; die Kodierung der Transport-
    // Schale fiel mit S2 — `karteKodiere` las niemand mehr):
    //   schwelle      Alpha-Schwelle: Binarisierung der Karte, Mip-Deckung und der alphaTest der Welt
    //   normalTeiler  die Welt-Normale liegt auf 1/normalTeiler der Albedo-Auflösung (weiche Licht-Modulation fern):
    //                 die Ablage mittelt die volle Normale der Bühne als Vektor (KARTE_RECHNER_WGSL normalK) und beginnt dort
    //   minSeite      die Mip-Kette endet, bevor eine Ansicht unter 4 px fällt (BC-Block, keine Ansichten-Mischung)
    //   minOpak       die NICHT-LEERE-WAND: eine Karte mit weniger opaken Stufe-0-Texeln ist ein Bäcker-Fehler (Clear-
    //                 Pixel) — sie reist nie auf die Platte und wird nie Schicht
    // Gespeichert wird die Karte VORMULTIPLIZIERT (transparent = 0,0,0,0; BC1 kann es nicht anders), die Welt teilt
    // das gefilterte rgb durch alpha — kein dunkler Saum, auf keiner Mip-Stufe.
    // DER FARBRAUM: der Studio-Bäcker (r128) rendert in ein Render-Target ohne Kodierung — seine Albedo-Bytes sind
    // LINEAR. Die Schicht trägt sRGB (bc1-rgba-unorm-srgb / rgba8unorm-srgb, die GPU dekodiert): der Codec mittelt
    // jede Mip-Stufe LINEAR und kodiert erst beim Schreiben. Befund Blick-Tour 04.10.: der Host las die linearen
    // Bytes als sRGB — Eichen-Laub 0,12 → 0,013 linear, die Fernkrone stand SCHWARZ und im Dunst grau.
    //   lichtTeiler   die Sonnen-Sicht der Krone (A7, das Alpha der Studio-Normale) liegt auf 1/lichtTeiler der Albedo-
    //                 Auflösung als rg8 (Zenit, 45°-Kranz; F6), Stufe 0 (die GPU zieht die Mips) — ein weiches
    //                 Licht-Feld der Krone
    //   saum          die Stärke des Saums der Art im Wahl-Schlüssel der Stufen (`karteSaum`): so weit verschiebt das Muster
    //                 der Blattgröße die Deckung eines Rand-Texels
    var KARTEN_GESETZ = {
        schwelle: 0.34,
        normalTeiler: 2,
        minSeite: 4,
        minOpak: 64,
        glaette: 4,
        glaetteBis: 2,
        lichtTeiler: 4,
        saum: 0.3,
    };
    // linear (0..1) → sRGB-Byte, und die Tabelle der 256 linearen Eingangs-Bytes
    function linZuSrgb8(x) {
        const v = x <= 0.0031308 ? 12.92 * x : 1.055 * Math.pow(x, 1 / 2.4) - 0.055;
        return Math.max(0, Math.min(255, Math.round(v * 255)));
    }
    const SRGB_AUS_LIN8 = new Uint8Array(256);
    for (let i = 0; i < 256; i++) SRGB_AUS_LIN8[i] = linZuSrgb8(i / 255);
    // und zurück: sRGB-Byte → linear (0..1) — die Vormultiplikation der Blatt-Atlas-Fracht (`blattAtlasFracht`)
    const LIN_AUS_SRGB8 = new Float64Array(256);
    for (let i = 0; i < 256; i++) {
        const v = i / 255;
        LIN_AUS_SRGB8[i] = v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    }

    // Die Mip-Stufen einer Schicht (w × hAnsicht·V): solange Breite UND Ansichts-Höhe ≥ minSeite bleiben.
    function karteMipZahl(w, hAnsicht) {
        let n = 0;
        while (w >> n >= KARTEN_GESETZ.minSeite && hAnsicht >> n >= KARTEN_GESETZ.minSeite) n++;
        return Math.max(1, n);
    }

    // Die Glätte-Gänge der deckungstreuen Mip-Stufe k — EINE Formel für die Mips im Kern und die GPU-Ablage des Hosts
    function karteGlaetteGaenge(k) {
        return k <= KARTEN_GESETZ.glaetteBis ? KARTEN_GESETZ.glaette : 1;
    }

    // DIE HEBUNGS-RINGE EINER SCHICHT (lod.K3, die Atlas-Diät): die Blick-Hebungen des Rezepts (foundry-core
    // PORTAL_RENDER_CONFIG.impostor.hebungen, Grad, aufsteigend, die 0° genau einmal) liegen als Bänder untereinander — der
    // Ring 0° in voller Zelle (cw × ch, eine Ansicht je Zeile), jeder andere in 1/teiler je Achse (bei 2 ¼ der Zellfläche,
    // zwei Ansichten je Zeile). Die Ansicht a des Rings i liegt bei x = (a mod t)·cw/t, y = y_i + ⌊a/t⌋·ch/t. Rückgabe
    // { ringe: [{ hebung, teiler, y, h }], hoehe, zelle: [Breite, Höhe] der kleinsten Ansicht } — null bei Maß-Bruch.
    function karteRinge(V, cw, ch, hebungen, teiler) {
        const hb = Array.isArray(hebungen) && hebungen.length ? hebungen : [0];
        const t = teiler == null ? 1 : teiler;
        if (!(Number.isInteger(t) && t >= 1 && V % t === 0 && cw % t === 0 && ch % t === 0)) return null;
        if (hb.filter((e) => e === 0).length !== 1) return null;
        if (hb.some((e, i) => !(e > -90 && e < 90) || (i > 0 && !(e > hb[i - 1])))) return null;
        const ringe = [];
        let y = 0;
        for (const e of hb) {
            const ti = e === 0 ? 1 : t;
            ringe.push({ hebung: e, teiler: ti, y: y, h: (V / ti) * (ch / ti) });
            y += (V / ti) * (ch / ti);
        }
        return { ringe: ringe, hoehe: y, zelle: hb.length > 1 ? [cw / t, ch / t] : [cw, ch] };
    }

    // DER SAUM DER KARTE (w4-laub-saum, lod.K1): die Stufe wählte ihre deckenden Texel nach der GEGLÄTTETEN Deckung — der
    // Umriss lief als Höhenlinie einer verwischten Krone, eine Hülle statt eines Saums (laub-kante: fimp:atlas:L2 0,2635 > 0,22,
    // die Gestalten 0,16–0,19; gerastert liegt die Kohärenz des Karten-Umrisses 17–24 % über der ihrer eigenen L1). Über dem
    // Kronen-Fuß wählt die Stufe nach der Deckung ihres Fußabdrucks selbst, und den Gleichstand am Rand bricht der Saum der Art:
    // ein Zell-Muster in Stufe-0-Texeln der Ansicht, so groß wie ihr Blatt (`treeParams` leafSize der Nah-Stufe im Rahmen der
    // Karte), nie feiner als zwei Texel der Stufe — Laub trägt runde Lappen (1 − F1), Nadel Grate zwischen den Büscheln
    // (F2 − F1). Unter dem Kronen-Fuß wählt der Stamm wie bisher geglättet: er bleibt ganz oder fällt, nie als Perlenschnur. Je
    // Ansicht decken weiter genau so viele Texel wie auf Stufe 0. Rückgabe { e (Stufe-0-Texel), nadel } oder null (keine Krone).
    // Leser: der Wirt (`_karteWeltBacken` → die GPU-Ablage) und `impostorMips` (opt.saum).
    function karteSaum(P, halfH, ch) {
        return P && P.leafSize > 0 && halfH > 0
            ? { e: (P.leafSize / (2 * halfH)) * ch, nadel: P.conifer === true }
            : null;
    }
    // Der Hash des Saums (u32 — die GPU-Ablage rechnet ihn bitgleich)
    function saumHash(ix, iy, s) {
        let h = Math.imul(ix, 0x27d4eb2d) ^ Math.imul(iy, 0x165667b1) ^ Math.imul(s, 0x9e3779b9);
        h = Math.imul(h ^ (h >>> 15), 0x85ebca6b);
        h = Math.imul(h ^ (h >>> 13), 0xc2b2ae35);
        return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
    }
    // Das Muster des Saums an (X, Y) — Stufe-0-Texel der Ansicht, Zelle e — in 0..1: Laub 1 − F1, Nadel (F2 − F1) · 1,5
    function karteSaumMuster(X, Y, e, nadel) {
        const x = X / e,
            y = Y / e,
            x0 = Math.floor(x),
            y0 = Math.floor(y);
        let f1 = 9,
            f2 = 9;
        for (let j = -1; j <= 1; j++)
            for (let i = -1; i <= 1; i++) {
                const d = Math.hypot(
                    x0 + i + saumHash(x0 + i, y0 + j, 1) - x,
                    y0 + j + saumHash(x0 + i, y0 + j, 8) - y
                );
                if (d < f1) {
                    f2 = f1;
                    f1 = d;
                } else if (d < f2) f2 = d;
            }
        return nadel ? Math.min(1, (f2 - f1) * 1.5) : Math.max(0, 1 - f1);
    }

    // Die Maße EINER Schicht je Format — Host (Array-Textur, Offsets) und Schale (Kodierung) rechnen damit:
    //   "bc"    Albedo BC1 (8 B je 4×4) mit voller Mip-Kette · Normale BC5 (16 B je 4×4) auf 1/normalTeiler
    //   "rgba8" Albedo rgba8 Stufe 0 · Normale rg8 Stufe 0 (die GPU zieht die Mips; ohne BC-Feature)
    // `R` (karteRinge): die Schicht trägt die Hebungs-Ringe — ihre Höhe ist die der Bänder, die Mip-Kette endet an der
    // kleinsten Ansicht; ohne R die eine waagrechte Reihe (V Ansichten in voller Zelle).
    function karteMasse(cw, ch, V, nt, fmt, R) {
        const w = cw | 0,
            h = R ? R.hoehe : (ch | 0) * (V | 0),
            nw = Math.max(1, (cw / nt) | 0),
            nh = Math.max(1, (h / nt) | 0);
        const zb = R ? R.zelle[0] : cw,
            zh = R ? R.zelle[1] : ch;
        const bc = fmt === "bc";
        const ebene = (bw, bh, n, bytesJe) => {
            const out = [];
            let off = 0;
            for (let k = 0; k < n; k++) {
                const lw = Math.max(1, bw >> k),
                    lh = Math.max(1, bh >> k);
                const bytes = bc ? Math.ceil(lw / 4) * Math.ceil(lh / 4) * bytesJe : lw * lh * bytesJe;
                out.push({ w: lw, h: lh, bytes: bytes, off: off });
                off += bytes;
            }
            return { stufen: out, bytes: off };
        };
        const a = ebene(w, h, bc ? karteMipZahl(zb, zh) : 1, bc ? 8 : 4);
        const n = ebene(nw, nh, bc ? karteMipZahl((zb / nt) | 0, (zh / nt) | 0) : 1, bc ? 16 : 2);
        // die Sonnen-Sicht (A7; F6 zweifach: der Zenit und der 45°-Kranz): rg8, eine Stufe, in jedem Format
        const lw = Math.max(1, (cw / KARTEN_GESETZ.lichtTeiler) | 0),
            lh = Math.max(1, (h / KARTEN_GESETZ.lichtTeiler) | 0);
        return {
            fmt: bc ? "bc" : "rgba8",
            w: w,
            h: h,
            nw: nw,
            nh: nh,
            a: a.stufen,
            n: n.stufen,
            aBytes: a.bytes,
            nBytes: n.bytes,
            lw: lw,
            lh: lh,
            lBytes: lw * lh * 2,
        };
    }

    // DECKUNGSTREUE MIPS der Albedo: Stufe 0 binarisiert an der Schwelle (opak → rgb, 255 · sonst 0,0,0,0). Jede
    // tiefere Stufe liest den ECHTEN Deckungsanteil ihres Stufe-0-Fußabdrucks und macht je Ansicht genau so viele
    // Texel opak, wie Stufe 0 deckt (Rang nach Anteil, Gleichstand über die Deckung der Nachbarschaft) — eine Box-Mip
    // dünnt die Krone sonst unter dem alphaTest aus. Die Farbe ist das alpha-gewichtete LINEARE Mittel des
    // Fußabdrucks; Eingang linear (der Bäcker), jede Stufe sRGB-kodiert (DER FARBRAUM oben).
    // EIN Mip-Gesetz für jede Karte (S7: auch der EINE Blatt-Atlas, bakeLeafAtlasBild — sein eigener Mip-Weg mit
    // Alpha-Skalierung je Zelle war ein Zwilling): `opt` (ohne = die Schicht des Karten-Atlas, unverändert)
    //   quer     die V Ansichten (Zellen) liegen NEBENEINANDER (Breite w/V), nicht übereinander;
    //   blut     lineares rgb der nicht deckenden Texel — der Atlas BLUTET (Filter und Mips mischen Blattfarbe statt
    //            Schwarz), ein nicht gewählter Texel trägt das Mittel seiner deckenden Kinder bzw. `blut`, Alpha 0;
    //   alphaRoh Stufe 0 behält ihr Eingangs-Alpha (die Kantenglättung des Malers, nah vergrößert), gezählt wird
    //            die Deckung an der Schwelle wie immer.
    //   glatt    die Alpha jeder tieferen Stufe ist die skalierte Deckung (Castaño): genau die gewählten Texel tragen
    //            die Schwelle, der Rest fällt stetig — die Kante liegt zwischen den Texeln (K20; braucht blut).
    //   saum     { e, nadel, fuss } — der Saum der Art (`karteSaum`; die Karte, übereinander, nie glatt): über der Stufe-0-
    //            Zeile `fuss` der Ansicht (dem Kronen-Fuß) ist der Schlüssel die Deckung des Fußabdrucks + saum × (Muster − ½).
    // Rückgabe: { stufen: [{ w, h, data }], deckung: [Anteil je Stufe], opak: opake Texel der Stufe 0 }.
    // DAS σ DER GLATTEN STUFE (K20): die Skala der Alpha (Deckung des Texels × σ, gerundet, bei 255 gekappt), unter der
    // die Zelle nw × nh, bilinear in S × S Unterproben je Texel gelesen (in der Zelle geklemmt), an der Schwelle `thr`
    // (Byte) den Anteil `ziel` deckt — die Deckung, die der Filter der GPU sieht. Die Deckung steigt monoton mit σ:
    // Klammer um den Startwert, dann Bisektion im Logarithmus.
    function glattSigma(schl, nw, nh, sigma0, thr, ziel) {
        const S = nw >= 128 ? 2 : 4,
            W = nw * S,
            H = nh * S;
        const tafel = (n, m) => {
            const i0 = new Int32Array(n),
                i1 = new Int32Array(n),
                f = new Float32Array(n);
            for (let j = 0; j < n; j++) {
                const x = (j + 0.5) / S - 0.5,
                    x0 = Math.floor(x);
                f[j] = x - x0;
                i0[j] = Math.min(m - 1, Math.max(0, x0));
                i1[j] = Math.min(m - 1, Math.max(0, x0 + 1));
            }
            return { i0, i1, f };
        };
        const tx = tafel(W, nw),
            ty = tafel(H, nh);
        const A = new Float32Array(nw * nh);
        const deck = (s) => {
            for (let i = 0; i < A.length; i++) A[i] = schl[i] > 0 ? Math.min(255, Math.round(schl[i] * s * 255)) : 0;
            let k = 0;
            for (let y = 0; y < H; y++) {
                const r0 = ty.i0[y] * nw,
                    r1 = ty.i1[y] * nw,
                    fy = ty.f[y];
                for (let x = 0; x < W; x++) {
                    const x0 = tx.i0[x],
                        x1 = tx.i1[x],
                        fx = tx.f[x];
                    const a0 = A[r0 + x0] + (A[r0 + x1] - A[r0 + x0]) * fx,
                        a1 = A[r1 + x0] + (A[r1 + x1] - A[r1 + x0]) * fx;
                    if (a0 + (a1 - a0) * fy >= thr) k++;
                }
            }
            return k / (W * H);
        };
        // Trifft der Startwert die Deckung auf 1 % (die großen Stufen, wo ein Rand-Texel wenig wiegt), bleibt er.
        if (Math.abs(deck(sigma0) - ziel) <= 0.01 * ziel) return sigma0;
        let lo = sigma0,
            hi = sigma0;
        while (deck(hi) < ziel && hi < sigma0 * 64) hi *= 2;
        while (deck(lo) > ziel && lo > sigma0 / 64) lo /= 2;
        if (hi <= lo) return sigma0;
        for (let it = 0; it < 14; it++) {
            const mid = Math.sqrt(lo * hi);
            if (deck(mid) < ziel) lo = mid;
            else hi = mid;
        }
        return Math.abs(deck(lo) - ziel) < Math.abs(deck(hi) - ziel) ? lo : hi;
    }

    function impostorMips(rgba, w, h, V, schwelle, nStufen, opt) {
        const thr = (schwelle == null ? KARTEN_GESETZ.schwelle : schwelle) * 255;
        const quer = !!(opt && opt.quer),
            blut = opt && opt.blut ? opt.blut.map((x) => linZuSrgb8(x)) : null,
            roh0 = !!(opt && opt.alphaRoh),
            glatt = !!(opt && opt.glatt),
            saum = opt && opt.saum && !glatt && !quer ? opt.saum : null;
        if (glatt && !blut) throw new Error("impostorMips: glatt braucht blut (die Farbe jedes deckenden Texels)");
        const hA = quer ? h : (h / V) | 0,
            wA = quer ? (w / V) | 0 : w;
        const n0 = w * h;
        let sa = new Float32Array(n0),
            sr = new Float32Array(n0),
            sg = new Float32Array(n0),
            sb = new Float32Array(n0);
        const d0 = new Uint8Array(n0 * 4);
        const cov0 = new Float64Array(V);
        let opak = 0;
        for (let i = 0; i < n0; i++) {
            if (rgba[i * 4 + 3] >= thr) {
                const r = rgba[i * 4],
                    g = rgba[i * 4 + 1],
                    b = rgba[i * 4 + 2];
                sa[i] = 1;
                sr[i] = r / 255;
                sg[i] = g / 255;
                sb[i] = b / 255;
                d0[i * 4] = SRGB_AUS_LIN8[r];
                d0[i * 4 + 1] = SRGB_AUS_LIN8[g];
                d0[i * 4 + 2] = SRGB_AUS_LIN8[b];
                d0[i * 4 + 3] = roh0 ? rgba[i * 4 + 3] : 255;
                opak++;
                cov0[quer ? Math.min(V - 1, ((i % w) / wA) | 0) : Math.min(V - 1, ((i / w) | 0) / hA) | 0]++;
            } else if (blut) {
                d0[i * 4] = blut[0];
                d0[i * 4 + 1] = blut[1];
                d0[i * 4 + 2] = blut[2];
                d0[i * 4 + 3] = roh0 ? rgba[i * 4 + 3] : 0;
            }
        }
        for (let v = 0; v < V; v++) cov0[v] /= wA * hA;
        const stufen = [{ w: w, h: h, data: d0 }];
        const deckung = [opak / n0];
        let lw = w,
            lh = h,
            lhA = hA,
            lwA = wA;
        for (let k = 1; k < nStufen; k++) {
            const nw = lw >> 1,
                nh = lh >> 1,
                nhA = lhA >> 1,
                nwA = lwA >> 1;
            if (nw < 1 || nhA < 1 || nwA < 1) break;
            const n = nw * nh;
            const ta = new Float32Array(n),
                tr = new Float32Array(n),
                tg = new Float32Array(n),
                tb = new Float32Array(n);
            for (let y = 0; y < nh; y++)
                for (let x = 0; x < nw; x++) {
                    const o = y * nw + x;
                    for (let dy = 0; dy < 2; dy++)
                        for (let dx = 0; dx < 2; dx++) {
                            const s = (y * 2 + dy) * lw + x * 2 + dx;
                            ta[o] += sa[s];
                            tr[o] += sr[s];
                            tg[o] += sg[s];
                            tb[o] += sb[s];
                        }
                }
            const data = new Uint8Array(n * 4);
            const nA = nwA * nhA;
            // Texel i der Ansicht v: übereinander zusammenhängend, nebeneinander zeilenweise je Zelle
            const tex = quer ? (v, i) => ((i / nwA) | 0) * nw + v * nwA + (i % nwA) : (v, i) => v * nA + i;
            const schluessel = new Float64Array(nA),
                sortiert = new Float64Array(nA),
                dicht = new Float64Array(nA),
                weich = new Float64Array(nA);
            const fuss = 1 << (2 * k); // Stufe-0-Texel je Texel dieser Stufe
            let opakK = 0;
            for (let v = 0; v < V; v++) {
                let positiv = 0;
                // DIE DECKUNG DES TEXELS (K20, 12.10.): der Box-Anteil c seines Stufe-0-Fußabdrucks, geglättet über die
                // Nachbarschaft (`KARTEN_GESETZ.glaette` binomiale 3×3-Gänge je Stufe — zwei Texel der Stufe, das Büschel
                // statt des Blatts, wo das Blatt unter wenige Pixel fällt). Die Wahl hält die Büschel zusammen: ein Texel
                // im dichten Zweig gewinnt gegen einen vereinzelten, die Lücke zwischen zwei Blättern füllt sich. Der
                // Gleichstand über einen Orts-Hash (bis 12.10.) säte Einzel-Texel quer über die Krone: das Korn der
                // Mittelsicht, das unter dem ½-Pixel-Versatz flimmerte (gate:pflanzen-nah (Z)).
                for (let i = 0; i < nA; i++) dicht[i] = ta[tex(v, i)] / fuss;
                const gaenge = karteGlaetteGaenge(k);
                for (let gang = 0; gang < gaenge; gang++) {
                    for (let i = 0; i < nA; i++) {
                        const ix = i % nwA,
                            iy = (i / nwA) | 0;
                        let nb = 0;
                        for (let dy = -1; dy <= 1; dy++)
                            for (let dx = -1; dx <= 1; dx++) {
                                const x = Math.min(nwA - 1, Math.max(0, ix + dx)),
                                    y = Math.min(nhA - 1, Math.max(0, iy + dy));
                                nb += dicht[y * nwA + x] * (dx ? 1 : 2) * (dy ? 1 : 2);
                            }
                        weich[i] = nb / 16;
                    }
                    dicht.set(weich);
                }
                for (let i = 0; i < nA; i++) {
                    const s = ta[tex(v, i)];
                    // DER SAUM (`karteSaum`): über dem Kronen-Fuß die Deckung des Fußabdrucks und das Muster der Art
                    const X = ((i % nwA) + 0.5) * (1 << k),
                        Y = (((i / nwA) | 0) + 0.5) * (1 << k);
                    const basis =
                        saum && s > 0 && Y <= saum.fuss
                            ? Math.max(
                                  1e-9,
                                  s / fuss +
                                      KARTEN_GESETZ.saum *
                                          (karteSaumMuster(X, Y, Math.max(saum.e, 2 << k), saum.nadel) - 0.5)
                              )
                            : dicht[i];
                    // wählbar: glatt jeder Texel mit Deckung in der Nachbarschaft (er trägt die Blut-Farbe), sonst nur mit
                    // eigener (die Karte trägt die Farbe ihrer Kinder); der Gleichstand über die eigene Deckung
                    schluessel[i] = glatt || s > 0 ? basis + (1e-6 * s) / fuss : 0;
                    if (schluessel[i] > 0) positiv++;
                }
                const M = Math.min(positiv, Math.round(cov0[v] * nA));
                if (blut)
                    for (let i = 0; i < nA; i++) {
                        const o = tex(v, i);
                        if (ta[o] > 0) {
                            data[o * 4] = linZuSrgb8(tr[o] / ta[o]);
                            data[o * 4 + 1] = linZuSrgb8(tg[o] / ta[o]);
                            data[o * 4 + 2] = linZuSrgb8(tb[o] / ta[o]);
                        } else {
                            data[o * 4] = blut[0];
                            data[o * 4 + 1] = blut[1];
                            data[o * 4 + 2] = blut[2];
                        }
                    }
                if (M <= 0) continue;
                sortiert.set(schluessel);
                sortiert.sort();
                const grenze = sortiert[nA - M];
                // GLATT (Castaño 2010, Mip-Wahl mit Erhalt der Deckung): die Alpha ist die Deckung des Texels, skaliert mit
                // σ — der Filter liest eine stetige Kante (der Umriss liegt zwischen den Texeln, nicht auf ihrem Raster).
                // σ hält die Deckung, die der FILTER sieht: bilinear abgetastet (S × S Unterproben je Texel, in der Zelle
                // geklemmt, die Alpha wie geschrieben — gerundet, bei 255 gekappt) deckt die Stufe an der Schwelle, was
                // Stufe 0 deckt. Der Startwert — genau die M gewählten Texel tragen die Schwelle — zählt Texel-Mitten: der
                // Umriss einer stetigen Alpha läuft durch die Mitten der Rand-Texel, die Stufe verlor einen halben Rand-
                // Texel je Büschel (16er-Zelle 0,160 statt 0,182; die Karte der Buche, die der Bäcker aus diesen Stufen
                // rastert, deckte 0,914 ihres Bilds — gate:asset-contract D).
                let sigma = grenze > 0 ? thr / 255 / grenze : 0;
                if (glatt && sigma > 0) sigma = glattSigma(schluessel, nwA, nhA, sigma, thr, cov0[v]);
                // DIE GRENZE IST GENAU (w4-laub-saum): M Texel decken — vom Grenzwert selbst nur so viele, wie über ihm fehlen, in
                // der Reihe ihrer Lage in der Ansicht (die GPU-Ablage wählt dieselben); bis dahin deckte jeder Gleichstand mit (das
                // alte Gesetz an der Buche, Stufe 1: +0,16 %)
                let gleich = M;
                for (let i = 0; i < nA; i++) if (schluessel[i] > grenze) gleich--;
                for (let i = 0; i < nA; i++) {
                    const o = tex(v, i);
                    if (glatt) {
                        if (schluessel[i] > 0) data[o * 4 + 3] = Math.min(255, Math.round(schluessel[i] * sigma * 255));
                        if (data[o * 4 + 3] >= thr) opakK++;
                        continue;
                    }
                    if (ta[o] > 0 && (schluessel[i] > grenze || (schluessel[i] === grenze && gleich-- > 0))) {
                        data[o * 4] = linZuSrgb8(tr[o] / ta[o]);
                        data[o * 4 + 1] = linZuSrgb8(tg[o] / ta[o]);
                        data[o * 4 + 2] = linZuSrgb8(tb[o] / ta[o]);
                        data[o * 4 + 3] = 255;
                        opakK++;
                    }
                }
            }
            stufen.push({ w: nw, h: nh, data: data });
            deckung.push(opakK / n);
            sa = ta;
            sr = tr;
            sg = tg;
            sb = tb;
            lw = nw;
            lh = nh;
            lhA = nhA;
            lwA = nwA;
        }
        return { stufen: stufen, deckung: deckung, opak: opak };
    }

    // BC1 (DXT1) einer vormultiplizierten, binären Karte: je 4×4-Block die Hauptachse der opaken Farben (PCA),
    // die Endpunkte per kleinster Quadrate nachgezogen; ein Block mit Transparenz fährt den 3-Farben-Modus (c0 ≤ c1,
    // Index 3 = transparent schwarz — dieselbe Binarisierung bitgleich zurück). Ausgabe: 8 B je Block, Zeilen-Folge.
    function bc1Kodiere(rgba, w, h) {
        const bw = Math.ceil(w / 4),
            bh = Math.ceil(h / 4);
        const out = new Uint8Array(bw * bh * 8);
        const pr = new Float64Array(16),
            pg = new Float64Array(16),
            pb = new Float64Array(16),
            tr = new Uint8Array(16);
        const pal = new Float64Array(12);
        const idx = new Uint8Array(16),
            best = new Uint8Array(16);
        const q565 = (r, g, b) => {
            const R = Math.max(0, Math.min(31, Math.round((r * 31) / 255))),
                G = Math.max(0, Math.min(63, Math.round((g * 63) / 255))),
                B = Math.max(0, Math.min(31, Math.round((b * 31) / 255)));
            return (R << 11) | (G << 5) | B;
        };
        const ex = (c, s) => {
            const R = (c >> 11) & 31,
                G = (c >> 5) & 63,
                B = c & 31;
            s[0] = (R << 3) | (R >> 2);
            s[1] = (G << 2) | (G >> 4);
            s[2] = (B << 3) | (B >> 2);
        };
        const e0 = [0, 0, 0],
            e1 = [0, 0, 0];
        // Palette + Indizes zu (c0, c1) im gewählten Modus; Rückgabe der Fehler-Quadratsumme (opake Texel).
        const bewerte = (c0, c1, drei) => {
            ex(c0, e0);
            ex(c1, e1);
            for (let k = 0; k < 3; k++) {
                pal[k] = e0[k];
                pal[3 + k] = e1[k];
                if (drei) {
                    pal[6 + k] = Math.floor((e0[k] + e1[k]) / 2);
                    pal[9 + k] = 1e9;
                } else {
                    pal[6 + k] = Math.floor((2 * e0[k] + e1[k]) / 3);
                    pal[9 + k] = Math.floor((e0[k] + 2 * e1[k]) / 3);
                }
            }
            let sse = 0;
            for (let j = 0; j < 16; j++) {
                if (tr[j]) {
                    idx[j] = 3;
                    continue;
                }
                let bi = 0,
                    bd = Infinity;
                for (let p = 0; p < (drei ? 3 : 4); p++) {
                    const dr = pr[j] - pal[p * 3],
                        dg = pg[j] - pal[p * 3 + 1],
                        db = pb[j] - pal[p * 3 + 2];
                    const d = dr * dr + dg * dg + db * db;
                    if (d < bd) {
                        bd = d;
                        bi = p;
                    }
                }
                idx[j] = bi;
                sse += bd;
            }
            return sse;
        };
        for (let by = 0; by < bh; by++)
            for (let bx = 0; bx < bw; bx++) {
                let nO = 0,
                    nT = 0,
                    mr = 0,
                    mg = 0,
                    mb = 0;
                for (let j = 0; j < 16; j++) {
                    const x = Math.min(w - 1, bx * 4 + (j & 3)),
                        y = Math.min(h - 1, by * 4 + (j >> 2));
                    const s = (y * w + x) * 4;
                    tr[j] = rgba[s + 3] < 128 ? 1 : 0;
                    pr[j] = rgba[s];
                    pg[j] = rgba[s + 1];
                    pb[j] = rgba[s + 2];
                    if (tr[j]) nT++;
                    else {
                        nO++;
                        mr += pr[j];
                        mg += pg[j];
                        mb += pb[j];
                    }
                }
                const o = (by * bw + bx) * 8;
                if (nO === 0) {
                    // ganz transparent: 3-Farben-Modus, jeder Index 3
                    out[o] = out[o + 1] = out[o + 2] = out[o + 3] = 0;
                    out[o + 4] = out[o + 5] = out[o + 6] = out[o + 7] = 0xff;
                    continue;
                }
                mr /= nO;
                mg /= nO;
                mb /= nO;
                // Hauptachse (Kovarianz, Potenz-Iteration)
                let c00 = 0,
                    c01 = 0,
                    c02 = 0,
                    c11 = 0,
                    c12 = 0,
                    c22 = 0;
                for (let j = 0; j < 16; j++) {
                    if (tr[j]) continue;
                    const dr = pr[j] - mr,
                        dg = pg[j] - mg,
                        db = pb[j] - mb;
                    c00 += dr * dr;
                    c01 += dr * dg;
                    c02 += dr * db;
                    c11 += dg * dg;
                    c12 += dg * db;
                    c22 += db * db;
                }
                let ax = 0.577,
                    ay = 0.577,
                    az = 0.577;
                for (let it = 0; it < 8; it++) {
                    const qx = c00 * ax + c01 * ay + c02 * az,
                        qy = c01 * ax + c11 * ay + c12 * az,
                        qz = c02 * ax + c12 * ay + c22 * az;
                    const l = Math.sqrt(qx * qx + qy * qy + qz * qz);
                    if (l < 1e-9) break;
                    ax = qx / l;
                    ay = qy / l;
                    az = qz / l;
                }
                let tmin = Infinity,
                    tmax = -Infinity;
                for (let j = 0; j < 16; j++) {
                    if (tr[j]) continue;
                    const t = (pr[j] - mr) * ax + (pg[j] - mg) * ay + (pb[j] - mb) * az;
                    if (t < tmin) tmin = t;
                    if (t > tmax) tmax = t;
                }
                const drei = nT > 0;
                // Modus-Ordnung: 4 Farben c0 > c1 · 3 Farben (Transparenz) c0 ≤ c1
                let p = q565(mr + ax * tmax, mg + ay * tmax, mb + az * tmax),
                    q = q565(mr + ax * tmin, mg + ay * tmin, mb + az * tmin);
                let c0 = drei ? Math.min(p, q) : Math.max(p, q),
                    c1 = drei ? Math.max(p, q) : Math.min(p, q);
                let bestSse = bewerte(c0, c1, drei || c0 === c1);
                best.set(idx);
                let b0 = c0,
                    b1 = c1;
                // Kleinste Quadrate: Endpunkte zu den Indizes nachziehen (zwei Runden)
                for (let it = 0; it < 2; it++) {
                    const g2 = drei || b0 === b1 ? 0.5 : 2 / 3,
                        g3 = drei || b0 === b1 ? 0 : 1 / 3;
                    let aa = 0,
                        bb = 0,
                        ab = 0,
                        arR = 0,
                        arG = 0,
                        arB = 0,
                        brR = 0,
                        brG = 0,
                        brB = 0;
                    for (let j = 0; j < 16; j++) {
                        if (tr[j]) continue;
                        const ix = best[j];
                        const al = ix === 0 ? 1 : ix === 1 ? 0 : ix === 2 ? g2 : g3,
                            be = 1 - al;
                        aa += al * al;
                        bb += be * be;
                        ab += al * be;
                        arR += al * pr[j];
                        arG += al * pg[j];
                        arB += al * pb[j];
                        brR += be * pr[j];
                        brG += be * pg[j];
                        brB += be * pb[j];
                    }
                    const det = aa * bb - ab * ab;
                    if (Math.abs(det) < 1e-9) break;
                    p = q565((arR * bb - brR * ab) / det, (arG * bb - brG * ab) / det, (arB * bb - brB * ab) / det);
                    q = q565((brR * aa - arR * ab) / det, (brG * aa - arG * ab) / det, (brB * aa - arB * ab) / det);
                    c0 = drei ? Math.min(p, q) : Math.max(p, q);
                    c1 = drei ? Math.max(p, q) : Math.min(p, q);
                    const sse = bewerte(c0, c1, drei || c0 === c1);
                    if (sse < bestSse) {
                        bestSse = sse;
                        best.set(idx);
                        b0 = c0;
                        b1 = c1;
                    } else break;
                }
                // c0 == c1 ohne Transparenz: der 3-Farben-Modus trägt die eine Farbe (Index 0 überall)
                out[o] = b0 & 0xff;
                out[o + 1] = b0 >> 8;
                out[o + 2] = b1 & 0xff;
                out[o + 3] = b1 >> 8;
                let bits = 0;
                for (let j = 15; j >= 0; j--) bits = (bits << 2) | best[j];
                out[o + 4] = bits & 0xff;
                out[o + 5] = (bits >>> 8) & 0xff;
                out[o + 6] = (bits >>> 16) & 0xff;
                out[o + 7] = (bits >>> 24) & 0xff;
            }
        return out;
    }

    // BC4 eines Kanals (8-Werte-Modus r0 > r1: Minimum und Maximum des Blocks als Endpunkte) — der Alpha-Block der BC3-Fracht.
    function bc4Block(werte, out, o) {
        let mn = 255,
            mx = 0;
        for (let j = 0; j < 16; j++) {
            if (werte[j] < mn) mn = werte[j];
            if (werte[j] > mx) mx = werte[j];
        }
        // Endpunkte: Start Maximum/Minimum, dann je Runde die Stufen zuweisen und (r0, r1) per kleinster Quadrate
        // nachziehen — das Min/Max-Paar allein ließ die Normale im Mittel 2,2° (p95 8°) kippen.
        let r0 = mx,
            r1 = mn;
        const stufe = new Uint8Array(16),
            beste = new Uint8Array(16);
        const weise = (a, b) => {
            let sse = 0;
            for (let j = 0; j < 16; j++) {
                let s = 0;
                if (a > b) s = Math.max(0, Math.min(7, Math.round(((a - werte[j]) * 7) / (a - b))));
                stufe[j] = s;
                const d = werte[j] - Math.round(((7 - s) * a + s * b) / 7);
                sse += d * d;
            }
            return sse;
        };
        let besteSse = weise(r0, r1);
        beste.set(stufe);
        for (let it = 0; it < 3 && besteSse > 0 && mx > mn; it++) {
            let aa = 0,
                bb = 0,
                ab = 0,
                av = 0,
                bv = 0;
            for (let j = 0; j < 16; j++) {
                const t = beste[j] / 7,
                    al = 1 - t;
                aa += al * al;
                bb += t * t;
                ab += al * t;
                av += al * werte[j];
                bv += t * werte[j];
            }
            const det = aa * bb - ab * ab;
            if (Math.abs(det) < 1e-9) break;
            const a = Math.max(0, Math.min(255, Math.round((av * bb - bv * ab) / det))),
                b = Math.max(0, Math.min(255, Math.round((bv * aa - av * ab) / det)));
            if (!(a > b)) break;
            const sse = weise(a, b);
            if (sse >= besteSse) break;
            besteSse = sse;
            beste.set(stufe);
            r0 = a;
            r1 = b;
        }
        out[o] = r0;
        out[o + 1] = r1;
        let lo = 0,
            hi = 0;
        for (let j = 0; j < 16; j++) {
            // Stufe s ∈ 0..7 zwischen r0 (s=0) und r1 (s=7); Code-Folge 0=r0, 1=r1, 2..7 = Zwischenwerte
            const s = r0 > r1 ? beste[j] : 0;
            const code = s === 0 ? 0 : s === 7 ? 1 : s + 1;
            const bit = j * 3;
            if (bit < 24) lo |= code << bit;
            else hi |= code << (bit - 24);
            if (bit < 24 && bit + 3 > 24) hi |= code >> (24 - bit);
        }
        out[o + 2] = lo & 0xff;
        out[o + 3] = (lo >> 8) & 0xff;
        out[o + 4] = (lo >> 16) & 0xff;
        out[o + 5] = hi & 0xff;
        out[o + 6] = (hi >> 8) & 0xff;
        out[o + 7] = (hi >> 16) & 0xff;
    }
    // BC3 (K20, 12.10.): die Farbe als BC1-Block im 4-Farben-Modus (jeder Texel deckend kodiert — BC3 liest den
    // Farb-Block immer so), die Alpha als BC4-Block davor (16 B je 4×4). Für die Fracht mit STETIGER Alpha (die glatte
    // Mip-Kette des Blatt-Atlas): BC1 trägt ein Bit und schnitt die Kante zurück auf das Texel-Raster.
    function bc3Kodiere(rgba, w, h) {
        const bw = Math.ceil(w / 4),
            bh = Math.ceil(h / 4);
        const deckend = new Uint8Array(rgba);
        for (let i = 3; i < deckend.length; i += 4) deckend[i] = 255;
        const farbe = bc1Kodiere(deckend, w, h);
        const out = new Uint8Array(bw * bh * 16);
        const a = new Uint8Array(16);
        for (let by = 0; by < bh; by++)
            for (let bx = 0; bx < bw; bx++) {
                for (let j = 0; j < 16; j++) {
                    const x = Math.min(w - 1, bx * 4 + (j & 3)),
                        y = Math.min(h - 1, by * 4 + (j >> 2));
                    a[j] = rgba[(y * w + x) * 4 + 3];
                }
                const b = by * bw + bx;
                bc4Block(a, out, b * 16);
                out.set(farbe.subarray(b * 8, b * 8 + 8), b * 16 + 8);
            }
        return out;
    }

    // Der Rückweg für die Linse (gate:asset-contract BC-Rundlauf): "bc1"/"bc3" → rgba · "bc5" → rg (2 B je Texel).
    function bcDekodiere(buf, w, h, fmt) {
        const bw = Math.ceil(w / 4),
            bh = Math.ceil(h / 4);
        if (fmt === "bc3") {
            const n = bw * bh;
            const farbe = new Uint8Array(n * 8),
                alpha = new Uint8Array(n * 16);
            for (let b = 0; b < n; b++) {
                farbe.set(buf.subarray(b * 16 + 8, b * 16 + 16), b * 8);
                // der Alpha-Block als erster Kanal eines BC5-Blocks (der zweite bleibt leer)
                alpha.set(buf.subarray(b * 16, b * 16 + 8), b * 16);
            }
            // Der Farb-Block im 4-Farben-Modus: BC1 dekodiert c0 ≤ c1 als 3-Farben-Modus — BC3 nie. Die Kodierung schreibt
            // ohne Transparenz c0 ≥ c1 (Gleichheit = eine Farbe, beide Lesarten gleich).
            const out = bcDekodiere(farbe, w, h, "bc1");
            const rg = bcDekodiere(alpha, w, h, "bc5");
            for (let i = 0; i < w * h; i++) out[i * 4 + 3] = rg[i * 2];
            return out;
        }
        if (fmt === "bc1") {
            const out = new Uint8Array(w * h * 4);
            const p = new Int32Array(16);
            for (let by = 0; by < bh; by++)
                for (let bx = 0; bx < bw; bx++) {
                    const o = (by * bw + bx) * 8;
                    const c0 = buf[o] | (buf[o + 1] << 8),
                        c1 = buf[o + 2] | (buf[o + 3] << 8);
                    const ex = (c, i) => {
                        const R = (c >> 11) & 31,
                            G = (c >> 5) & 63,
                            B = c & 31;
                        p[i] = (R << 3) | (R >> 2);
                        p[i + 1] = (G << 2) | (G >> 4);
                        p[i + 2] = (B << 3) | (B >> 2);
                        p[i + 3] = 255;
                    };
                    ex(c0, 0);
                    ex(c1, 4);
                    for (let k = 0; k < 3; k++) {
                        if (c0 > c1) {
                            p[8 + k] = Math.floor((2 * p[k] + p[4 + k]) / 3);
                            p[12 + k] = Math.floor((p[k] + 2 * p[4 + k]) / 3);
                        } else {
                            p[8 + k] = Math.floor((p[k] + p[4 + k]) / 2);
                            p[12 + k] = 0;
                        }
                    }
                    p[11] = 255;
                    p[15] = c0 > c1 ? 255 : 0;
                    const bits = (buf[o + 4] | (buf[o + 5] << 8) | (buf[o + 6] << 16) | (buf[o + 7] << 24)) >>> 0;
                    for (let j = 0; j < 16; j++) {
                        const x = bx * 4 + (j & 3),
                            y = by * 4 + (j >> 2);
                        if (x >= w || y >= h) continue;
                        const c = (bits >>> (j * 2)) & 3;
                        const d = (y * w + x) * 4;
                        out[d] = p[c * 4];
                        out[d + 1] = p[c * 4 + 1];
                        out[d + 2] = p[c * 4 + 2];
                        out[d + 3] = p[c * 4 + 3];
                    }
                }
            return out;
        }
        const out = new Uint8Array(w * h * 2);
        const pal = new Int32Array(8);
        for (let by = 0; by < bh; by++)
            for (let bx = 0; bx < bw; bx++)
                for (let ch = 0; ch < 2; ch++) {
                    const o = (by * bw + bx) * 16 + ch * 8;
                    const r0 = buf[o],
                        r1 = buf[o + 1];
                    pal[0] = r0;
                    pal[1] = r1;
                    if (r0 > r1) for (let s = 1; s < 7; s++) pal[s + 1] = Math.round(((7 - s) * r0 + s * r1) / 7);
                    else {
                        for (let s = 1; s < 5; s++) pal[s + 1] = Math.round(((5 - s) * r0 + s * r1) / 5);
                        pal[6] = 0;
                        pal[7] = 255;
                    }
                    const lo = buf[o + 2] | (buf[o + 3] << 8) | (buf[o + 4] << 16),
                        hi = buf[o + 5] | (buf[o + 6] << 8) | (buf[o + 7] << 16);
                    for (let j = 0; j < 16; j++) {
                        const x = bx * 4 + (j & 3),
                            y = by * 4 + (j >> 2);
                        if (x >= w || y >= h) continue;
                        const bit = j * 3;
                        let code;
                        if (bit + 3 <= 24) code = (lo >> bit) & 7;
                        else if (bit >= 24) code = (hi >> (bit - 24)) & 7;
                        else code = ((lo >> bit) | (hi << (24 - bit))) & 7;
                        out[(y * w + x) * 2 + ch] = pal[code];
                    }
                }
        return out;
    }

    // DAS BODEN-GESETZ (Waldboden 04.10.): das Gewicht einer Boden-Art an einem Ort aus den Bändern ihrer Zeile
    // (foundry-core PORTAL_RENDER_CONFIG.placement.boden) — EIN Auswerter für das Labor (buildForest) und die Welt
    // (die Nah-Streu). Ein Band ist ein Trapez [a, b, c, d]: 0 bis a, weich steigend bis b, voll bis c, weich
    // fallend bis d. Umwelt u = { licht, feucht, ufer, fels, hang }: licht (Kronen-Licht 0..1) und feucht (0..1)
    // wirken neutral, wo der Leser sie nicht misst (null); ufer (m über dem Wasser, negativ = Flachwasser) und fels
    // (Steinigkeit 0..1) sind Pflicht-Bänder — wer eines trägt, wächst nur, wo es gemessen ist. Eine Art ohne
    // Ufer-Band steht nie im Wasser (ufer < 0,1 m), hang ist die höchste Neigung |∇h|. feuchtLicht hebt die
    // Licht-Grenze mit der Feuchte (das Licht wirkt um feuchtLicht·feucht dunkler).
    function bodenBand(x, b) {
        const ss = (e0, e1, v) => {
            const t = Math.max(0, Math.min(1, (v - e0) / Math.max(1e-6, e1 - e0)));
            return t * t * (3 - 2 * t);
        };
        if (x <= b[0] || x >= b[3]) return 0;
        if (x < b[1]) return ss(b[0], b[1], x);
        if (x <= b[2]) return 1;
        return 1 - ss(b[2], b[3], x);
    }
    function bodenGewicht(zeile, u) {
        if (!zeile || !u) return 0;
        const da = (v) => v !== null && v !== undefined && isFinite(v);
        if (zeile.hang != null && da(u.hang) && u.hang > zeile.hang) return 0;
        let w = 1;
        if (zeile.ufer) {
            if (!da(u.ufer)) return 0;
            w *= bodenBand(u.ufer, zeile.ufer);
        } else if (da(u.ufer) && u.ufer < 0.1) return 0;
        if (zeile.fels) {
            if (!da(u.fels)) return 0;
            w *= bodenBand(u.fels, zeile.fels);
        }
        if (zeile.licht && da(u.licht)) {
            const fl = zeile.feuchtLicht && da(u.feucht) ? zeile.feuchtLicht * u.feucht : 0;
            w *= bodenBand(u.licht - fl, zeile.licht);
        }
        if (zeile.feucht && da(u.feucht)) w *= bodenBand(u.feucht, zeile.feucht);
        return w;
    }

    // ═══ DAS BUDGET-GESETZ (Studio-Vertrag B2c, W8): der EINE Ausgang jeder Studio-Gestalt ═══
    // Eine gelieferte Stufe kostet höchstens ihre Budget-Zeile `PORTAL_RENDER_CONFIG.lod.budget[kind][stufe]`
    // ({tris, draws, schatten}) — die Zeile ist DATEN des Kerns, dieses Gesetz ihr Konsument. Es arbeitet auf den
    // engine-neutralen Teilen der Brücke ({kind, mat, joint?, tuer?, position, normal, color, uv, skin…, index}) —
    // dieselbe Form trägt die Antwort von `build-asset` (Worker), der Sync-Guss des Wirts-Ofens (Haupt-Thread) und
    // jede Wand (Node, gate:asset-contract). Es zählt mit der Regel des Wirts:
    //   STOFF  = das Material, das der Wirt baut (`_foundryTreeMaterial` liest `budgetStoff` als Schlüssel): Art ·
    //            Rauheit · Metall · flach · Umgebung · Seite · Gewebe · Glut · Fell-/Haut-Ton. Die Farbe ist KEIN
    //            Stoff — sie reist als Vertex-Farbe.
    //   DRAW   = je (Stoff × Attribut-Form) EIN Draw: der Flatten verschmilzt Teile eines Stoffs (bis
    //            `verschmelzVerts` zusammen), der Ofen bindet starre Teile eines Stoffs über alle Gelenke (`_ofen-
    //            StarrBinden`); jedes Flügel-Teil (eigenes Scharnier) und jede Haut (eigenes SkinnedMesh) ist ein Draw.
    // FALTEN, wenn die Stufe über `draws` liegt: die Teile gehen in Bindungs-Klassen (starr · Haut · je Tür-Flügel ·
    // Schalen-Fell) — über eine Klasse hinweg faltet nichts (sonst bricht das Gelenk, die Haut oder das Scharnier) —
    // und jeder Stoff trägt seine SEH-KLASSE aus dem Gesetzbuch (`mat.seh`, `BUDGET_GESETZ.seh`: stoff · haut · haar ·
    // auge · glas · metall · glut): was dem Auge eine andere Funktion ist, faltet nie ineinander (das Auge nie in die
    // Haut, das Glas nie in den Putz, das Chrom nie in den Gummi, das Haar nie in den Stoff), auch wenn es dieselbe
    // Bindung trägt. Die Glut-Klasse (Lichtquelle) faltet nie; ein Stoff, der sichtbar leuchtet (lum(emissive)·Intensität
    // ≥ `glut`), faltet nur in seinesgleichen, als letzter (Abstand + Glut-Farbe). Innerhalb von Bindung × Seh-Klasse fällt je Schritt das Stoff-Paar mit dem kleinsten
    // Seh-Fehler = sichtbare Fläche × Seh-Abstand (Rauheit · 2×Metall · Art · flach · Umgebung · Gewebe · Seite ·
    // Rest-Glimmen) — die kleinere Fläche in die größere, deterministisch, ohne Zufall. Die Seh-Klasse gehört zur
    // Identität des Stoffs (`budgetStoff`); ein Stoff ohne Seh-Klasse ist ein BRUCH. Die Farbe des gefalteten Teils wird Vertex-Farbe (wie der
    // Wirt sie füllt, `budgetFuellFarbe`); ein beidseitiges Teil in einem einseitigen Stoff bekommt seine Rückseite
    // als Dreiecke (gleiches Bild). Danach wird je Klasse × Stoff × Gelenk EIN Teil (bis `teilVertsMax`).
    // Innerhalb der Zeile ist das Gesetz ein No-op (die Teile reisen byte-gleich). Dreiecke faltet es nicht: liegt
    // die Stufe über `tris` oder bleibt sie über `draws`, steht ein BRUCH im Bericht — der Aufrufer schreit, die
    // Wand (gate:asset-contract) wird rot. Nie still.
    var BUDGET_GESETZ = Object.freeze({
        glut: 0.05, // lum(emissive) × Intensität, ab der ein Stoff leuchtet (Tor-Rahmen 0,09–0,48 · Fenster 1,1)
        // höchstens so viele Vertices je gefaltetem Teil — unter der Wand des Wirts (`_foundryBuildMesh` verwirft ein
        // Teil über 200 000 Vertices = 600 000 Floats als Transfer-Glitch)
        teilVertsMax: 196608,
        // der Flatten verschmilzt Teile EINES Stoffs nur bis zu dieser Summe (sonst je Teil) — die EINE Zahl, der Wirt
        // liest sie (`_foundryFlatVerschmelzen`)
        verschmelzVerts: 65536,
        formAttr: ["uv", "aWurzel", "aSchale", "skinIndex"], // die Attribute, die der Wirt nur trägt, wo sie reisen
        // DIE SEH-KLASSEN (Integration W8, 05.10.): was ein Stoff dem AUGE ist. Jedes Gesetzbuch stempelt sie an seinen
        // Stoff (`material.userData.__seh`), der Extraktor reicht sie als `mat.seh`; gefaltet wird nur innerhalb EINER.
        //   stoff  Holz · Putz · Stein · Textil · Gummi · Kunststoff — das Matte, Dielektrische
        //   haut   Haut, Lippe, Ballen, Zahnfleisch, Nase — der lebende Leib
        //   haar   Haar · Fell · Strähne
        //   auge   Augapfel · Iris · Pupille · Hornhaut
        //   glas   Glas und alles Durchscheinende
        //   metall Metall · Chrom · Metall-Lack (Metallizität ≥ 0,5)
        //   glut   Lichtquelle (Lampe, Feuer, ungelitte Leucht-Linie) — faltet nie
        seh: Object.freeze(["stoff", "haut", "haar", "auge", "glas", "metall", "glut"]),
    });
    // DIE LOOK-KLASSEN (Kreatur-/Mensch-Stoffe, deren Lab-Shader-Gesetz FELL_LOOK/HAUT_LOOK/HAAR_LOOK der Wirt webt):
    // die EINE Liste — der Bäcker stempelt sie (`material.userData.__klasse`), beide Extraktoren (Brücke + Ofen) und
    // der Wirts-Material-Bau lesen sie hier.
    var LOOK_KLASSEN = Object.freeze([
        "fell",
        "fellSchale",
        "straehne",
        "straehneD",
        "straehneL",
        "skin",
        "haut",
        "hair",
    ]);
    function budgetLook(kind) {
        return LOOK_KLASSEN.indexOf(kind) >= 0;
    }
    function _budgetDoppelt(kind) {
        return kind === "foliage" || kind === "foliageTex" || kind === "grass";
    }
    // DIE REGLER EINES STOFFS — die EINE Quelle der Material-Zahlen: der Schlüssel (`budgetStoff`) und der Wirt, der
    // das Material baut (`_foundryTreeMaterial`), lesen dieselben Defaults (ohne `mp` die Baum-Defaults: Rinde 0,93 ·
    // Laub 0,62 · Gras 0,7 · Gras-Umgebung 0,18). Laub und Gras sind immer beidseitig.
    function budgetRegler(kind, mp) {
        const k = kind || "bark";
        const rinde = k === "bark" || k === "stem";
        const em = mp && Array.isArray(mp.emissive) && mp.emissive.length === 3 ? mp.emissive : null;
        return {
            k: k,
            rinde: rinde,
            // der Halm: die Cuticula des HALM_GESETZ; den Himmel trägt er ganz, die Narbe verdeckt ihn in der Tiefe
            r:
                mp && typeof mp.roughness === "number"
                    ? mp.roughness
                    : rinde
                      ? 0.93
                      : k === "grass"
                        ? HALM_GESETZ.rauheit
                        : 0.62,
            mt: mp && typeof mp.metalness === "number" ? mp.metalness : 0,
            fl: mp ? !!mp.flatShading : false,
            env: mp && typeof mp.envMapIntensity === "number" ? mp.envMapIntensity : 1,
            doppelt: _budgetDoppelt(k) || !!(mp && mp.side === 2),
            em: em,
            emI: em && typeof mp.emissiveIntensity === "number" ? mp.emissiveIntensity : em ? 1 : 0,
            look: budgetLook(k),
            // W5 Gegenstände: der Klarlack (Lack, Klingen-Stahl) und die Durchsicht (Scheibe) eines Zweit-Kern-Stoffs —
            // 0 bzw. 1, wo das Gesetzbuch sie nicht trägt (jeder Pflanzen-, Fels- und Kreatur-Stoff bleibt byte-alt).
            cc: mp && typeof mp.clearcoat === "number" && mp.clearcoat > 0 ? mp.clearcoat : 0,
            ccr: mp && typeof mp.clearcoatRoughness === "number" ? mp.clearcoatRoughness : 0,
            op: mp && typeof mp.opacity === "number" && mp.opacity < 1 ? mp.opacity : 1,
        };
    }
    // Der Stoff-Schlüssel — DIE EINE Material-Identität (der Wirt keyt seinen Material-Cache damit).
    function budgetStoff(kind, mp) {
        const R = budgetRegler(kind, mp);
        const k = R.k;
        return (
            (mp
                ? k + "|" + R.r.toFixed(2) + "|" + R.mt.toFixed(2) + "|" + (R.fl ? 1 : 0) + "|" + R.env.toFixed(2)
                : k) +
            (!_budgetDoppelt(k) && mp && mp.side === 2 ? "|s2" : "") +
            (mp && mp.webe ? "|w:" + mp.webe : "") +
            (R.em ? "|e:" + R.em.map((v) => v.toFixed(2)).join(",") + "@" + R.emI.toFixed(2) : "") +
            (mp && typeof mp.leucht === "number" ? "|l:" + mp.leucht.toFixed(2) : "") +
            // der Zeitplan des Leuchtquellen-Gesetzes (K11): ein waches Fenster ist ein anderer Stoff als ein Glas ohne Licht
            (mp && typeof mp.licht === "string" ? "|li:" + mp.licht : "") +
            (R.look && mp && Array.isArray(mp.color) && mp.color.length === 3
                ? "|t:" + mp.color.map((v) => (+v).toFixed(3)).join(",")
                : "") +
            // Klarlack und Durchsicht sind Teil der Identität (nur wo das Gesetzbuch sie trägt — sonst byte-alt)
            (R.cc > 0 ? "|cc:" + R.cc.toFixed(2) + "@" + R.ccr.toFixed(2) : "") +
            (R.op < 1 ? "|op:" + R.op.toFixed(2) : "") +
            // die Seh-Klasse gehört zur Identität: zwei Stoffe gleicher Regler und verschiedener Funktion (Klaue und
            // Pupille, beide 0,2 matt-schwarz) sind zwei Materialien — sonst trüge die Pupille die Klaue in den Stoff
            (budgetSeh(mp) ? "|v:" + mp.seh : "")
        );
    }
    // Die Seh-Klasse eines Stoffs (`mat.seh` aus dem Gesetzbuch) — null, wenn er keine gültige trägt (ein Bruch).
    function budgetSeh(mp) {
        return mp && typeof mp.seh === "string" && BUDGET_GESETZ.seh.indexOf(mp.seh) >= 0 ? mp.seh : null;
    }
    // Die Füll-Farbe eines Teils ohne Vertex-Farbe — EINE Regel für den Wirt (`_foundryBuildMesh`) und die Faltung:
    // Rinde braun, ein Zweit-Kern-/Look-Stoff seine Material-Farbe (linear), sonst Laub-Grün.
    function budgetFuellFarbe(kind, mp) {
        if (kind === "bark" || kind === "stem") return [0.32, 0.22, 0.13];
        if ((kind === "unknown" || budgetLook(kind)) && mp && Array.isArray(mp.color) && mp.color.length === 3)
            return mp.color;
        return [0.2, 0.34, 0.13];
    }
    function budgetSeite(kind, mp) {
        return _budgetDoppelt(kind) || (mp && mp.side === 2) ? 2 : 0;
    }
    function budgetGlut(mp) {
        const em = mp && Array.isArray(mp.emissive) && mp.emissive.length === 3 ? mp.emissive : null;
        if (!em) return 0;
        const emI = typeof mp.emissiveIntensity === "number" ? mp.emissiveIntensity : 1;
        return (0.2126 * em[0] + 0.7152 * em[1] + 0.0722 * em[2]) * emI;
    }
    function _budgetTeil(m) {
        return !!(m && m.position && m.position.array);
    }
    function _budgetTris(m) {
        return m.index ? m.index.length / 3 : m.position.array.length / 9;
    }
    function _budgetForm(m) {
        let f = m.index ? "i" : "x";
        for (const a of BUDGET_GESETZ.formAttr) if (m[a] && m[a].array) f += "," + a;
        return f;
    }
    // DIE SIPPE eines Teils — die EINE Verschmelz-Regel: Teile derselben Sippe (Stoff × Attribut-Form) zeichnet der
    // Wirt als EIN Leaf; er liest sie hier (`_foundryBuildMesh` stempelt sie ans Mesh, der Flatten
    // `_foundryFlatVerschmelzen` und die Starr-Bindung des Ofens `_ofenStarrBinden` gruppieren danach), das Gesetz
    // zählt mit ihr (`budgetSippen`). Ein Flügel-Teil (eigenes Scharnier) und eine Haut (eigenes SkinnedMesh) sind keine
    // Sippe (null): je Teil ein Draw. gate:sippen-wirt misst Gesetz gegen Leaves an jeder Art und Stufe.
    // Ein RAD-Teil (Welle L, Q13 F-D8: `m.rad`, die Gestalt der Ecke 0, je Ecke eine Instanz) ist seine eigene Sippe je
    // Dreh-Klasse (drehend · stehend): es verschmilzt mit seinesgleichen, nie mit dem Aufbau.
    function budgetSippe(m) {
        if (!_budgetTeil(m) || m.tuer || (m.skinIndex && m.skinIndex.array)) return null;
        return (m.rad ? (m.rad.dreht ? "R:d|" : "R:s|") : "") + budgetStoff(m.kind, m.mat) + "#" + _budgetForm(m);
    }
    // Wie oft ein Teil gezeichnet wird: ein Rad je Ecke (`m.rad.raeder`), jedes andere Teil einmal.
    function _budgetMal(m) {
        return m.rad && Array.isArray(m.rad.raeder) && m.rad.raeder.length ? m.rad.raeder.length : 1;
    }
    // DIE FLÜGEL-GESTALT (1310-4): ist b dieselbe Gestalt wie a, nur verschoben? Derselbe Index, jede Spur gleich (1e-6),
    // die Lage um EINEN Vektor versetzt (1e-5). a, b = { pos, idx, spuren: [Array | null, …] } (die Spuren in derselben
    // Reihenfolge). Gibt den Versatz [dx, dy, dz] oder null. Vorder- und Hinterflügel einer Seite (porta `makeLeaf(seite,
    // ±zFace)`) sind so gebaut: der Wirt zeichnet den zweiten als Instanz des ersten (`_foundryFluegelInstanz`), das Gesetz
    // zählt ihn mit ihm (`budgetSippen`) — EINE Regel für beide.
    function budgetGestaltVersatz(a, b) {
        const A = a.pos,
            B = b.pos;
        if (!A || !B || A === B || A.length !== B.length || A.length < 3) return null;
        if (!!a.idx !== !!b.idx || (a.idx && a.idx.length !== b.idx.length)) return null;
        if (a.idx) for (let i = 0; i < a.idx.length; i++) if (a.idx[i] !== b.idx[i]) return null;
        if (a.spuren.length !== b.spuren.length) return null;
        for (let s = 0; s < a.spuren.length; s++) {
            const x = a.spuren[s],
                y = b.spuren[s];
            if (!x !== !y) return null;
            if (!x) continue;
            if (x.length !== y.length) return null;
            for (let i = 0; i < x.length; i++) if (Math.abs(x[i] - y[i]) > 1e-6) return null;
        }
        const d = [B[0] - A[0], B[1] - A[1], B[2] - A[2]];
        for (let i = 0; i < A.length; i++) if (Math.abs(B[i] - A[i] - d[i % 3]) > 1e-5) return null;
        return d;
    }
    function _budgetGestalt(m) {
        const spuren = [m.normal && m.normal.array ? m.normal.array : null];
        for (const a of BUDGET_GESETZ.formAttr) spuren.push(m[a] && m[a].array ? m[a].array : null);
        return { pos: m.position.array, idx: m.index || null, spuren: spuren };
    }
    // Die Kosten einer gelieferten Stufe nach der Regel des Wirts (Beipack ohne Puffer zählt nicht). Der Schatten-Teil
    // (S3, `teil: "schatten"`) zeichnet nur in den Kaskaden — er zählt nicht zur Stufe, sondern zu ihrem Wurf (`budgetWurf`).
    function budgetSippen(meshes) {
        let tris = 0,
            verts = 0,
            draws = 0;
        const gr = new Map();
        const fluegel = [];
        for (const m of meshes || []) {
            if (!_budgetTeil(m) || m.teil === "schatten") continue;
            const nv = m.position.array.length / 3;
            tris += _budgetTris(m) * _budgetMal(m);
            verts += nv;
            const k = budgetSippe(m);
            if (k === null) {
                // DIE FLÜGEL-GESTALT: wiederholt ein Flügel-Teil ein früheres desselben Stoffs und derselben Form nur
                // verschoben, zeichnet der Wirt es als dessen Instanz — kein eigener Draw
                if (m.tuer && !m.rad) {
                    const art = budgetStoff(m.kind, m.mat) + "#" + _budgetForm(m);
                    const g = _budgetGestalt(m);
                    if (fluegel.some((v) => v.art === art && budgetGestaltVersatz(v.g, g))) continue;
                    fluegel.push({ art: art, g: g });
                }
                draws++;
                continue;
            }
            let g = gr.get(k);
            if (!g) gr.set(k, (g = { n: 0, v: 0, gelenk: false }));
            g.n++;
            g.v += nv;
            if (m.joint) g.gelenk = true;
        }
        for (const g of gr.values()) draws += g.gelenk || g.n < 2 || g.v <= BUDGET_GESETZ.verschmelzVerts ? 1 : g.n;
        return { tris: tris, verts: verts, draws: draws };
    }
    // Der Wurf einer gelieferten Stufe (S3, das EINE Wurf-Gesetz): die Teile `teil: "schatten"` — Dreiecke und Teile (je
    // Teil ein Befehl je Kaskade, der Wirt zeichnet es mit EINEM Schatten-Stoff).
    function budgetWurf(meshes) {
        let tris = 0,
            teile = 0;
        for (const m of meshes || [])
            if (_budgetTeil(m) && m.teil === "schatten") {
                tris += _budgetTris(m);
                teile++;
            }
        return { tris: tris, teile: teile };
    }
    // Die Zeile einer Bau-Anfrage: die GRÖSSTE deklarierte Stufe ≤ dem Wunsch (sonst die kleinste) — dieselbe Klammer,
    // mit der Kern und Wirt die Stufe wählen — und ihre Budget-Zeile (null, wenn der Kern keine trägt).
    function budgetZeile(cfg, kind, wunsch) {
        const lod = cfg && cfg.lod;
        const st = lod && lod.kindStages && lod.kindStages[kind];
        if (!Array.isArray(st) || !st.length) return null;
        let stufe = st[0];
        for (const s of st) if (s <= wunsch && s > stufe) stufe = s;
        const z = lod.budget && lod.budget[kind] ? lod.budget[kind][stufe] : null;
        return { stufe: stufe, zeile: z && typeof z === "object" ? z : null };
    }
    // DER MERGE DER ZWEIT-KERNE (N7.5 + W8): die Brücke reicht je Kern seine Stufen (`lod.zusatzKindStages[<id>]`)
    // und sein Budget (`lod.zusatzBudget[<id>]` — die Zeilen je Art UND seine Gestalten je Rezept `gestalten`)
    // getrennt — hier fallen sie in die EINEN Karten `lod.kindStages` / `lod.budget` (je Art) und
    // `lod.budget.gestalten` (je Rezept), disjunkt, first-wins (foundry-core führt), unbekannte Felder must-ignore.
    // Der Wirt ruft es NUR in `_foundryIngestRenderConfig`, die Wand auf dem Umschlag — EIN Merge, kein Zwilling.
    function kerneVereinen(cfg) {
        const L = cfg && cfg.lod;
        const zk = L && L.zusatzKindStages;
        if (zk && typeof zk === "object") {
            const ks = L.kindStages && typeof L.kindStages === "object" ? L.kindStages : (L.kindStages = {});
            for (const core in zk) {
                const blk = zk[core];
                if (!blk || typeof blk !== "object") continue;
                for (const kind in blk) if (!(kind in ks) && Array.isArray(blk[kind])) ks[kind] = blk[kind];
            }
        }
        const zb = L && L.zusatzBudget;
        if (zb && typeof zb === "object") {
            const B = L.budget && typeof L.budget === "object" ? L.budget : (L.budget = {});
            for (const core in zb) {
                const blk = zb[core];
                if (!blk || typeof blk !== "object") continue;
                for (const kind in blk) {
                    const z = blk[kind];
                    if (!z || typeof z !== "object") continue;
                    if (kind === "gestalten") {
                        const G = B.gestalten && typeof B.gestalten === "object" ? B.gestalten : (B.gestalten = {});
                        for (const id in z)
                            if (id !== "*" && !(id in G) && Number.isInteger(z[id]) && z[id] >= 1) G[id] = z[id];
                    } else if (!(kind in B)) B[kind] = z;
                }
            }
        }
        return cfg;
    }
    function _budgetAbstand(S, T) {
        // Die Seh-Klasse ist die Grenze: verschiedene (oder fehlende) Funktion faltet nie; Licht faltet nie.
        if (!S.seh || S.seh !== T.seh || S.seh === "glut") return Infinity;
        // Ein sichtbar leuchtender Stoff faltet nie in einen, der nicht leuchtet; zwei Leucht-Linien derselben Seh-Klasse
        // (die Rahmen-Metalle eines Tors, pipeline.K3) falten über der Zeile als letzte — die kleinere trägt dann das
        // Glimmen der größeren, der Abstand ist die Glut-Farbe. Die Lichtquellen (Klasse glut) falten nie.
        const leuchtet = S.glut >= BUDGET_GESETZ.glut;
        if (leuchtet !== T.glut >= BUDGET_GESETZ.glut) return Infinity;
        // Emission ist eine Seh-Funktion: ein glimmender Stoff faltet nie in einen ohne Glimmen und umgekehrt (das
        // Augen-Glimmen des Wolfs verschwand sonst in der Hornhaut, Prüfer W8 (f)).
        if (S.glut > 0 !== T.glut > 0) return Infinity;
        const a = S.mat || {},
            b = T.mat || {};
        // der Zeitplan eines Leuchtquellen-Stoffs (K11, `mat.licht`) ist eine Seh-Funktion: das wache Fenster faltet nie ins
        // Schlaf-Glas
        if ((a.licht || "") !== (b.licht || "")) return Infinity;
        const n = (v, d) => (typeof v === "number" ? v : d);
        let d =
            Math.abs(n(a.roughness, 0.7) - n(b.roughness, 0.7)) + 2 * Math.abs(n(a.metalness, 0) - n(b.metalness, 0));
        if (S.kind !== T.kind) d += 0.6;
        if (!!a.flatShading !== !!b.flatShading) d += 0.3;
        d += Math.abs(n(a.envMapIntensity, 1) - n(b.envMapIntensity, 1));
        if ((a.webe || "") !== (b.webe || "")) d += 0.4;
        if (S.seite !== T.seite) d += 0.1;
        // W5: eine Lackschicht und die Durchsicht sind sichtbare Funktion (der gefaltete Stoff erbt sie)
        d += Math.abs(n(a.clearcoat, 0) - n(b.clearcoat, 0)) + 2 * Math.abs(n(a.opacity, 1) - n(b.opacity, 1));
        if (leuchtet) {
            const ea = Array.isArray(a.emissive) ? a.emissive : [0, 0, 0],
                eb = Array.isArray(b.emissive) ? b.emissive : [0, 0, 0];
            for (let c = 0; c < 3; c++)
                d += Math.abs(ea[c] * n(a.emissiveIntensity, 1) - eb[c] * n(b.emissiveIntensity, 1));
        }
        return d + 4 * (S.glut + T.glut); // ein Rest-Glimmen geht verloren (die Leucht-Linie faltet darum als letzte)
    }
    // Normalen eines Teils ohne Normalen (flächengewichtet, wie computeVertexNormals).
    function _budgetNormalen(P, I) {
        const N = new Float32Array(P.length);
        const nT = I ? I.length : P.length / 3;
        for (let t = 0; t < nT; t += 3) {
            const a = (I ? I[t] : t) * 3,
                b = (I ? I[t + 1] : t + 1) * 3,
                c = (I ? I[t + 2] : t + 2) * 3;
            const ux = P[b] - P[a],
                uy = P[b + 1] - P[a + 1],
                uz = P[b + 2] - P[a + 2];
            const vx = P[c] - P[a],
                vy = P[c + 1] - P[a + 1],
                vz = P[c + 2] - P[a + 2];
            const nx = uy * vz - uz * vy,
                ny = uz * vx - ux * vz,
                nz = ux * vy - uy * vx;
            for (const o of [a, b, c]) {
                N[o] += nx;
                N[o + 1] += ny;
                N[o + 2] += nz;
            }
        }
        for (let i = 0; i < N.length; i += 3) {
            const l = Math.hypot(N[i], N[i + 1], N[i + 2]) || 1;
            N[i] /= l;
            N[i + 1] /= l;
            N[i + 2] /= l;
        }
        return N;
    }
    // Die sichtbare Fläche eines Teils (Summe der Dreiecks-Flächen im Gestalt-Raum) — das Gewicht der Faltung.
    function _budgetFlaeche(m) {
        const P = m.position.array,
            I = m.index || null;
        const nT = I ? I.length : P.length / 3;
        let A = 0;
        for (let t = 0; t + 2 < nT; t += 3) {
            const a = (I ? I[t] : t) * 3,
                b = (I ? I[t + 1] : t + 1) * 3,
                c = (I ? I[t + 2] : t + 2) * 3;
            const ux = P[b] - P[a],
                uy = P[b + 1] - P[a + 1],
                uz = P[b + 2] - P[a + 2];
            const vx = P[c] - P[a],
                vy = P[c + 1] - P[a + 1],
                vz = P[c + 2] - P[a + 2];
            A += 0.5 * Math.hypot(uy * vz - uz * vy, uz * vx - ux * vz, ux * vy - uy * vx);
        }
        return A;
    }
    // Verbindet Teile EINES Ziel-Stoffs zu einem Teil: Attribute, die jedes Teil trägt, reisen; Normale und Farbe
    // trägt jedes Teil (fehlt sie: berechnet bzw. die Teil-Farbe `mat.color` als Vertex-Farbe — wie der Wirt sie
    // füllt); ein beidseitiges Teil in einem einseitigen Stoff bekommt seine Rückseite als gespiegelte Dreiecke.
    function _budgetVerbinden(teile, ziel, attrs) {
        let nV = 0,
            nI = 0;
        for (const p of teile) {
            const v = p.m.position.array.length / 3;
            const i = p.m.index ? p.m.index.length : v;
            const k = p.rueck ? 2 : 1;
            nV += v * k;
            nI += i * k;
        }
        const out = { kind: ziel.kind, mat: Object.assign({}, ziel.mat) };
        const A = {};
        for (const a of attrs) A[a.name] = new Float32Array(nV * a.size);
        const index = new Uint32Array(nI);
        let ov = 0,
            oi = 0;
        for (const p of teile) {
            const m = p.m;
            const P = m.position.array;
            const v = P.length / 3;
            const I = m.index || null;
            const nT = I ? I.length : v;
            for (let pass = 0; pass < (p.rueck ? 2 : 1); pass++) {
                const vz = pass ? -1 : 1;
                for (const a of attrs) {
                    const dst = A[a.name];
                    const s = a.size;
                    if (a.name === "normal" && !(m.normal && m.normal.array)) {
                        const N = _budgetNormalen(P, I);
                        for (let q = 0; q < v * 3; q++) dst[ov * 3 + q] = N[q] * vz;
                    } else if (a.name === "color" && !(m.color && m.color.array)) {
                        const c = budgetFuellFarbe(m.kind, m.mat);
                        for (let q = 0; q < v; q++) {
                            dst[(ov + q) * 3] = c[0];
                            dst[(ov + q) * 3 + 1] = c[1];
                            dst[(ov + q) * 3 + 2] = c[2];
                        }
                    } else {
                        const src = m[a.name].array;
                        const si = m[a.name].itemSize || s;
                        const sg = a.name === "normal" ? vz : 1;
                        for (let q = 0; q < v; q++)
                            for (let c = 0; c < s; c++) dst[(ov + q) * s + c] = sg * src[q * si + c];
                    }
                }
                for (let t = 0; t < nT; t += 3) {
                    const i0 = (I ? I[t] : t) + ov,
                        i1 = (I ? I[t + 1] : t + 1) + ov,
                        i2 = (I ? I[t + 2] : t + 2) + ov;
                    index[oi++] = i0;
                    index[oi++] = pass ? i2 : i1;
                    index[oi++] = pass ? i1 : i2;
                }
                ov += v;
            }
        }
        for (const a of attrs) out[a.name] = { array: A[a.name], itemSize: a.size };
        out.index = index;
        return out;
    }
    function _budgetFalten(meshes, ziel, bericht) {
        const teile = [],
            beipack = [];
        for (const m of meshes) (_budgetTeil(m) ? teile : beipack).push(m);
        const gruppen = [];
        const nachSchluessel = new Map();
        for (const m of teile) {
            const haut = !!(m.skinIndex && m.skinIndex.array);
            const klasse =
                (m.tuer ? "T:" + JSON.stringify(m.tuer) : m.rad ? (m.rad.dreht ? "R:d" : "R:s") : haut ? "H" : "S") +
                (m.aWurzel || m.aSchale ? "|schale" : "");
            const stoff = budgetStoff(m.kind, m.mat);
            const key = klasse + "#" + stoff;
            let g = nachSchluessel.get(key);
            if (!g) {
                g = {
                    nr: gruppen.length,
                    klasse,
                    stoff,
                    kind: m.kind,
                    mat: m.mat || {},
                    teile: [],
                    tris: 0,
                    flaeche: 0,
                    verts: 0,
                    gross: -1,
                };
                g.seite = budgetSeite(m.kind, m.mat);
                g.glut = budgetGlut(m.mat);
                g.seh = budgetSeh(m.mat); // Teil der Identität (budgetStoff): jede Gruppe trägt genau EINE
                nachSchluessel.set(key, g);
                gruppen.push(g);
            }
            const t = _budgetTris(m) * _budgetMal(m);
            const fl = _budgetFlaeche(m) * _budgetMal(m);
            g.teile.push({ m, seite: budgetSeite(m.kind, m.mat), quelle: g });
            g.tris += t;
            g.flaeche += fl;
            g.verts += m.position.array.length / 3;
            if (fl > g.gross) {
                g.gross = fl;
                g.mat = m.mat || {};
            }
        }
        const lebend = () => gruppen.filter((g) => !g.in);
        // Gezählt wird in der Einheit des Wirts (`budgetSippen`): ein Flügel, dessen Teile die eines früheren desselben
        // Stoffs der Reihe nach um EINEN Vektor verschoben wiederholen (DIE FLÜGEL-GESTALT, `budgetGestaltVersatz`), wird
        // seine Instanz — er zählt nicht.
        const zwillingMemo = new Map();
        const zwilling = (a, b) => {
            const key = a.nr + ":" + b.nr + ":" + a.teile.length + ":" + b.teile.length;
            if (zwillingMemo.has(key)) return zwillingMemo.get(key);
            let d0 = null,
                ja = a.stoff === b.stoff && a.teile.length === b.teile.length;
            for (let i = 0; ja && i < a.teile.length; i++) {
                const d = budgetGestaltVersatz(_budgetGestalt(a.teile[i].m), _budgetGestalt(b.teile[i].m));
                if (!d) ja = false;
                else if (!d0) d0 = d;
                else for (let c = 0; c < 3; c++) if (Math.abs(d[c] - d0[c]) > 1e-5) ja = false;
            }
            zwillingMemo.set(key, ja);
            return ja;
        };
        const zaehle = () => {
            const vorlagen = [];
            let n = 0;
            for (const g of lebend()) {
                if (g.klasse.indexOf("T:") === 0) {
                    if (vorlagen.some((v) => zwilling(v, g))) continue;
                    vorlagen.push(g);
                }
                n += Math.max(1, Math.ceil(g.verts / BUDGET_GESETZ.teilVertsMax));
            }
            return n;
        };
        // Je Schritt fällt das Paar mit dem kleinsten SEH-FEHLER = Fläche des faltenden Stoffs × Seh-Abstand: was das
        // Auge kaum sieht (kleine Fläche) oder kaum unterscheidet (kleiner Abstand), fällt zuerst; die kleinere Fläche
        // faltet in die größere. (Die Dreiecks-Zahl ist kein Seh-Maß: eine Glas-Fassade aus 12 Dreiecken deckt 850 m².)
        while (zaehle() > ziel) {
            let best = null;
            const L = lebend();
            for (const S of L)
                for (const T of L) {
                    if (S === T || S.klasse !== T.klasse) continue;
                    if (S.flaeche > T.flaeche || (S.flaeche === T.flaeche && S.nr < T.nr)) continue; // die kleinere faltet
                    const d = _budgetAbstand(S, T);
                    if (!isFinite(d)) continue;
                    const k = S.flaeche * d;
                    if (
                        !best ||
                        k < best.k - 1e-12 ||
                        (Math.abs(k - best.k) <= 1e-12 &&
                            (d < best.d - 1e-12 || (Math.abs(d - best.d) <= 1e-12 && S.nr < best.S.nr)))
                    )
                        best = { S, T, d, k };
                }
            if (!best) break;
            const { S, T } = best;
            for (const p of S.teile) T.teile.push(p);
            T.tris += S.tris;
            T.flaeche += S.flaeche;
            T.verts += S.verts;
            S.in = T;
            bericht.faltungen.push({
                von: S.stoff,
                nach: T.stoff,
                tris: S.tris,
                flaeche: +S.flaeche.toFixed(3),
                abstand: +best.d.toFixed(3),
            });
        }
        const out = [];
        for (const g of lebend()) {
            // Die Attribut-Form der Gruppe: was JEDES Teil trägt (Normale + Farbe immer — der Wirt füllt sie).
            const attrs = [
                { name: "position", size: 3 },
                { name: "normal", size: 3 },
                { name: "color", size: 3 },
            ];
            const p0 = g.teile[0].m;
            for (const a of Object.keys(p0)) {
                if (a === "position" || a === "normal" || a === "color") continue;
                const at = p0[a];
                if (!at || !at.array || !at.itemSize) continue;
                if (g.teile.every((p) => p.m[a] && p.m[a].array && p.m[a].itemSize === at.itemSize))
                    attrs.push({ name: a, size: at.itemSize });
            }
            for (const p of g.teile) p.rueck = p.seite === 2 && g.seite !== 2;
            // Je Gelenk ein Eimer (geometrisch faltet nur, was am selben Gelenk hängt; der Ofen bindet die Eimer
            // eines Stoffs starr zu EINEM Draw). Unverändert reist ein Teil, an dem nichts zu tun ist: allein im
            // Eimer, eigener Stoff, eigene Seite, kein Attribut, das die Gruppe nicht trägt.
            const eimer = new Map();
            for (const p of g.teile) {
                const j = p.m.joint || "";
                if (!eimer.has(j)) eimer.set(j, []);
                eimer.get(j).push(p);
            }
            for (const [j, ps] of eimer) {
                const roh =
                    ps.length === 1 &&
                    ps[0].quelle === g &&
                    !ps[0].rueck &&
                    Object.keys(ps[0].m).every(
                        (a) => !(ps[0].m[a] && ps[0].m[a].array) || attrs.some((x) => x.name === a)
                    );
                if (roh) {
                    out.push(ps[0].m);
                    continue;
                }
                let stueck = [],
                    v = 0;
                const flush = () => {
                    if (!stueck.length) return;
                    const e = _budgetVerbinden(stueck, g, attrs);
                    if (j) e.joint = j;
                    if (stueck[0].m.tuer) e.tuer = stueck[0].m.tuer;
                    if (stueck[0].m.rad) e.rad = stueck[0].m.rad;
                    out.push(e);
                    stueck = [];
                    v = 0;
                };
                for (const p of ps) {
                    const pv = (p.m.position.array.length / 3) * (p.rueck ? 2 : 1);
                    if (stueck.length && v + pv > BUDGET_GESETZ.teilVertsMax) flush();
                    stueck.push(p);
                    v += pv;
                }
                flush();
            }
        }
        for (const b of beipack) out.push(b);
        return out;
    }
    // DER AUSGANG: faltet eine gelieferte Stufe auf ihre Zeile und berichtet vorher/nachher + Bruch.
    function budgetErzwingen(meshes, zeile) {
        const vor = budgetSippen(meshes);
        const bericht = { vorher: { tris: vor.tris, draws: vor.draws }, nachher: null, faltungen: [], bruch: [] };
        if (!zeile || !(zeile.draws >= 1) || !(zeile.tris > 0)) {
            bericht.nachher = bericht.vorher;
            bericht.bruch.push({ feld: "zeile" });
            return { meshes: meshes, bericht: bericht };
        }
        // Jeder Stoff trägt seine Seh-Klasse aus dem Gesetzbuch — ohne sie weiß die Faltung nicht, was dem Auge
        // eins ist (ein Bruch, auch wenn nichts zu falten ist).
        const ohne = new Set();
        for (const m of meshes || []) if (_budgetTeil(m) && !budgetSeh(m.mat)) ohne.add(budgetStoff(m.kind, m.mat));
        for (const st of ohne) bericht.bruch.push({ feld: "seh", stoff: st });
        const out = vor.draws > zeile.draws ? _budgetFalten(meshes || [], zeile.draws, bericht) : meshes;
        const nach = budgetSippen(out);
        bericht.nachher = { tris: nach.tris, draws: nach.draws };
        if (nach.draws > zeile.draws) bericht.bruch.push({ feld: "draws", ist: nach.draws, soll: zeile.draws });
        if (nach.tris > zeile.tris) bericht.bruch.push({ feld: "tris", ist: nach.tris, soll: zeile.tris });
        return { meshes: out, bericht: bericht };
    }

    // DAS WIND-GESETZ DES BAUMS (K19, 12.10.) — EIN Term für Labor und Welt, die Antwort des Baums auf den Wind des
    // EINEN Wetter-Gesetzes. Drei Glieder, jedes mit seiner Frequenz (SpeedTree: Stamm < Ast < Blatt):
    //   STAMM  die Biegelinie des Kragträgers (ζ², ζ = Höhe über der Wurzel / H) — die Neigung folgt der Böe quasi-statisch,
    //          das Pendel schwingt in der Eigenfrequenz f0 = kF · D / H² (Moore & Maguire 2004, Trees 18(2):195–203; kF
    //          geeicht an der Fichte: 0,4 Hz bei D 0,5 m und H 30 m, Plenter H/D 60, waldwissen.net).
    //   AST    der Hebel ρ (Abstand zur Stamm-Achse / H) schwingt mit ast.faktor · f0 und eigener Phase ψ.
    //   BLATT  das Laub flattert längs seiner Normale, immer schneller als sein Ast (max(blatt.f, ueberAst · f_Ast)).
    // Die Last folgt dem Wind U (die Wind-Zeile des Wetters: 0,06 ruhig · 0,35 Regen · 1 Sturm) mit dem Vogel-Exponenten
    // (Widerstand ∝ u^(2+B), B ≈ −0,6 für umformende Kronen: Vogel 1989, Vollsinger 2005) — der Sturm biegt, die Brise
    // regt nur das Laub (Flattern ∝ √U). Wie stark ein Glied in SEINER Frequenz schwingt, sagt das Böen-Spektrum: die
    // Turbulenz trägt bei f die Energie S ∝ f^(−5/3) (Kolmogorov, von Kármán), die Antwort ∝ √S — ein gedrungener Stamm
    // (f0 4 Hz) zittert nicht mit dem Hub der Fichte (0,4 Hz), er folgt der Böe. Die Böe selbst wandert (λ ≈ 164 m,
    // Periode ≈ 15,7 s) — dieselben Zahlen lesen Gras, Streu und das Ohr der Welt (`AnazhRealm.WIND_BOE`).
    // Die Formel rechnet über einer Algebra A (TSL im Welt-Stoff, GLSL-Text im Labor, Zahlen in der Linse — wie
    // `_durchsichtGewicht`): EIN Term, drei Leser.
    var WIND_GESETZ = Object.freeze({
        kF: 720, // m/s — f0 = kF · D / H²
        vogel: 1.4, // Last ∝ U^vogel (2 + B, B = −0,6)
        stamm: Object.freeze({ neig: 0.035, pendel: 0.45 }), // Spitzen-Auslenkung / H bei Sturm · Pendel-Anteil um die Neigung
        ast: Object.freeze({ faktor: 2.4, hub: 0.06, heben: 0.03 }), // f_Ast = faktor · f0 · Hub je Hebel · Heben je Hebel
        blatt: Object.freeze({ f: 4.5, ueberAst: 1.5, hub: 0.035 }), // Hz · Abstand zum Ast · Hub (m) bei Sturm
        spektrum: Object.freeze({ fRef: 0.4, exp: 5 / 6 }), // Antwort = min(1, (fRef / f)^exp) — fRef die Fichte, exp = ½ · 5/3
        boe: Object.freeze({ omega: 0.4, k: 0.0384, amp: 0.45, mitte: 0.7 }), // g = sin(ω·t − k·(x·w))·amp + mitte
        dbh: 1.3, // m — die Brusthöhe, in der D gemessen wird
    });
    // DER FUSS-DURCHMESSER DER GELIEFERTEN GESTALT: der erste Rinden-Strang ist der Stamm, seine Ringe liegen je R1 Ecken
    // hintereinander (die Naht wiederholt die erste Ecke) und steigen; D ist der mittlere doppelte Abstand der Ring-Ecken
    // von ihrer Mitte im Ring nächst der Höhe yT (Vorlagen-Einheiten). null, wenn der Strang keinen Ring trägt.
    function stammDurchmesser(pos, yT) {
        if (!pos || pos.length < 9) return null;
        let R1 = 0;
        for (let i = 1; i < 400 && i * 3 < pos.length; i++)
            if (Math.hypot(pos[i * 3] - pos[0], pos[i * 3 + 1] - pos[1], pos[i * 3 + 2] - pos[2]) < 1e-3) {
                R1 = i + 1;
                break;
            }
        if (R1 < 4) return null;
        const n = R1 - 1;
        let best = -1,
            bestD = Infinity,
            yPrev = -Infinity;
        for (let r = 0; (r + 1) * R1 <= pos.length / 3; r++) {
            let y = 0;
            for (let j = 0; j < n; j++) y += pos[(r * R1 + j) * 3 + 1];
            y /= n;
            if (y < yPrev - 1e-4) break;
            yPrev = y;
            if (Math.abs(y - yT) < bestD) {
                bestD = Math.abs(y - yT);
                best = r;
            }
        }
        if (best < 0) return null;
        let cx = 0,
            cz = 0,
            rr = 0;
        for (let j = 0; j < n; j++) {
            cx += pos[(best * R1 + j) * 3];
            cz += pos[(best * R1 + j) * 3 + 2];
        }
        cx /= n;
        cz /= n;
        for (let j = 0; j < n; j++) rr += Math.hypot(pos[(best * R1 + j) * 3] - cx, pos[(best * R1 + j) * 3 + 2] - cz);
        return (2 * rr) / n;
    }
    // Die Schlankheit δ = D / H einer gelieferten Gestalt (skalenfrei): D in Brusthöhe (dbh Meter Welt → dbh / skala in der
    // Vorlage; der Kleinwuchs unter 4·dbh misst im ersten Viertel seiner Höhe — die Brusthöhe eines 1,6-m-Strauchs läge in
    // seiner Spitze), H = ht (die Vorlagen-Höhe der Gestalt). Welt, Karte und Labor rechnen f0 = kF · δ / H_Welt je Baum.
    function brustHoehe(ht, skala) {
        return Math.min(WIND_GESETZ.dbh, 0.25 * ht * skala) / skala;
    }
    function windSchlankheit(barkPos, ht, skala) {
        if (!(ht > 0) || !(skala > 0)) return null;
        const D = stammDurchmesser(barkPos, brustHoehe(ht, skala));
        return D > 0 ? D / ht : null;
    }
    // Dieselbe Schlankheit an der Stamm-ACHSE (K19, der Werkstatt-Baum trägt sein Skelett: Punkte { y, r } aufwärts, r der
    // Radius) — D = 2 r, linear zwischen den Achsen-Punkten um dieselbe Brusthöhe. null ohne Achse.
    function windSchlankheitAchse(punkte, ht, skala) {
        if (!Array.isArray(punkte) || punkte.length < 2 || !(ht > 0) || !(skala > 0)) return null;
        const yT = brustHoehe(ht, skala);
        let r = null;
        for (let i = 1; i < punkte.length; i++) {
            const a = punkte[i - 1],
                b = punkte[i];
            if (b.y >= yT || i === punkte.length - 1) {
                const t = b.y > a.y ? Math.max(0, Math.min(1, (yT - a.y) / (b.y - a.y))) : 0;
                r = a.r + (b.r - a.r) * t;
                break;
            }
        }
        return r > 0 ? (2 * r) / ht : null;
    }
    // DER EINE TERM: e = { t, U, g (Böe), f0, H (m), zeta, rho, phi (Orts-Phase), psi (Ast-Phase) }, blatt (bool, JS).
    // Rückgabe in Metern: quer (längs der Wind-Richtung), hoch (senkrecht), flattern (längs der Normale; 0 ohne Laub).
    function windAusschlag(A, e, blatt) {
        const W = WIND_GESETZ;
        const TAU = 6.283185307179586;
        const antwort = (f, fRef) =>
            A.min(
                A.k(1),
                A.mul(A.k(Math.pow(fRef, W.spektrum.exp)), A.pow(A.max(f, A.k(0.001)), A.k(-W.spektrum.exp)))
            );
        const last = A.mul(A.pow(A.max(e.U, A.k(0)), A.k(W.vogel)), e.g);
        const aStamm = antwort(e.f0, W.spektrum.fRef); // Ast: faktor · f0 gegen faktor · fRef — dieselbe Antwort
        const fAst = A.mul(e.f0, A.k(W.ast.faktor));
        const pendel = A.sin(A.add(A.mul(A.mul(A.k(TAU), e.f0), e.t), e.phi));
        const stamm = A.mul(
            A.mul(A.mul(e.H, A.mul(e.zeta, e.zeta)), A.mul(A.k(W.stamm.neig), last)),
            A.add(A.k(1), A.mul(A.mul(A.k(W.stamm.pendel), aStamm), pendel))
        );
        const sAst = A.sin(A.add(A.mul(A.mul(A.k(TAU), fAst), e.t), A.add(e.phi, e.psi)));
        const hebel = A.mul(A.mul(A.mul(e.H, e.rho), A.mul(last, sAst)), aStamm);
        const out = {
            quer: A.add(stamm, A.mul(A.mul(hebel, e.zeta), A.k(W.ast.hub))),
            hoch: A.mul(hebel, A.k(W.ast.heben)),
            flattern: A.k(0),
        };
        if (blatt) {
            const fBl = A.max(A.k(W.blatt.f), A.mul(fAst, A.k(W.blatt.ueberAst)));
            const sBl = A.sin(A.add(A.mul(A.mul(A.k(TAU), fBl), e.t), A.mul(e.psi, A.k(2.7))));
            out.flattern = A.mul(
                A.mul(A.mul(A.k(W.blatt.hub), A.sqrt(A.max(e.U, A.k(0)))), sBl),
                antwort(fBl, W.blatt.f)
            );
        }
        return out;
    }
    // Die Zahlen-Algebra des Terms (Linse, CPU).
    var WIND_ZAHLEN = Object.freeze({
        k: (n) => n,
        add: (a, b) => a + b,
        mul: (a, b) => a * b,
        min: (a, b) => Math.min(a, b),
        max: (a, b) => Math.max(a, b),
        pow: (a, b) => Math.pow(a, b),
        sin: (a) => Math.sin(a),
        sqrt: (a) => Math.sqrt(a),
    });
    // Die GLSL-Algebra des Terms (Laub- und Rinden-Shader des Labors, r128): jeder Ausdruck ist Text.
    var WIND_GLSL = Object.freeze({
        k: (n) => "(" + (Number.isInteger(n) ? n.toFixed(1) : String(n)) + ")",
        add: (a, b) => "(" + a + "+" + b + ")",
        mul: (a, b) => "(" + a + "*" + b + ")",
        min: (a, b) => "min(" + a + "," + b + ")",
        max: (a, b) => "max(" + a + "," + b + ")",
        pow: (a, b) => "pow(" + a + "," + b + ")",
        sin: (a) => "sin(" + a + ")",
        sqrt: (a) => "sqrt(" + a + ")",
    });

    // DAS LAUB-LICHT (K19): das Blatt lässt durch, was es weder spiegelt noch schluckt — Laubholz Durchlass ≈ Reflexion,
    // Nadel Durchlass < Reflexion (PROSPECT-D: R(550 nm) ≈ 0,13, T beim dünnen Laubblatt ebenso). Die Rückseite eines
    // besonnten Blatts strahlt die Albedo × tau (= T/R) × max(−N·L, 0) — dieselbe Lambert-Normierung wie die Vorderseite —,
    // ein Anteil `g` des Durchlasses streut als Vorwärts-Keule um die Licht-Richtung: (n+1)/2 · max(V·(−L), 0)^n, über die
    // Halbkugel energietreu wie der Lambert-Teil (Integral 1). Licht-Farbe und Schatten bringt der Leser aus seiner
    // Licht-Kette (r184 `lightColor` trägt den Schatten der Kaskade, r128 `directLight.color` den der Schatten-Karte). Die
    // Nadel erkennt der Leser an ihrer Atlas-Zelle (BLATT_ATLAS_WEDEL: u ≥ nadelAbU). Gegenlicht-Laub leuchtet. tau ist Gesetz
    // (PROSPECT-D); die Keule (g, n) ist ein Modell-Regler, geeicht am Soll der Karte K19: Gegenlicht/Auflicht ≥ 1,3.
    var LAUB_LICHT = Object.freeze({
        tauLaub: 1.0,
        tauNadel: 0.5,
        // Linse (werkbank licht --laub, aus 8 m, die Sonne hinter der Kronen-Mitte, je Art das Exemplar am Messort Wiese):
        // Eiche 1,47 · Birke 1,38 (Nadel: Fichte 1,11)
        keule: Object.freeze({ g: 0.7, n: 8 }),
        nadelAbU: BLATT_ATLAS_WEDEL.zelle * 0.25,
    });
    // DER EINE TERM über einer Algebra (wie `windAusschlag`): nl = N·L (vorzeichenbehaftet, N die gesehene Seite), vl =
    // V·(−L), nadel 0…1. Rückgabe: der Faktor auf (Licht-Farbe × diffuse Lambert-Antwort des Stoffs).
    function laubDurchlass(A, nl, vl, nadel) {
        const L = LAUB_LICHT;
        const tau = A.add(A.k(L.tauLaub), A.mul(A.k(L.tauNadel - L.tauLaub), nadel));
        const hinten = A.max(A.mul(nl, A.k(-1)), A.k(0));
        const keule = A.add(
            A.k(1 - L.keule.g),
            A.mul(A.k((L.keule.g * (L.keule.n + 1)) / 2), A.pow(A.max(vl, A.k(0.0001)), A.k(L.keule.n)))
        );
        return A.mul(A.mul(tau, hinten), keule);
    }

    // DAS HALM-GESETZ (w4-wiese-nah): der Grashalm ist EIN Gesetz aus Querschnitt, Länge, Krümmung und Stoff. Die Gestalt baut
    // foundry-core `emitGrass` (Länge, Krümmung, die lineale Spitze, die Ähre, die Narbe über jeder Ecke), den Stoff lesen Welt-
    // Stoff, Labor-Shader und Linse über DIESELBEN Terme (Algebra wie `laubDurchlass`). Der Halm trägt seine Stoff-Koordinaten im
    // uv: x quer in ADERN (die Mittel-Rippe bei 0, die Ränder bei ± Breite / aderM), y die NARBE über der Ecke (Λ: Blatt-Fläche
    // der Narbe über ihrer Höhe je Boden-Fläche). Das Durchscheinen ist das Laub-Licht (tauLaub: PROSPECT-D, der dünne Halm
    // lässt durch, was er spiegelt — Jacquemoud & Baret 1990, Monokotyle N 1,2–1,5).
    //   kiel/rund  DER QUERSCHNITT gekielt: je Hälfte um `kiel` gegen die Blatt-Ebene (Knaulgras und Rispengras gekielt, der
    //              Glatthafer flach-rinnig — Conert 2000, Pareys Gräserbuch: 15–30°), der Kiel um `rund` Adern gerundet
    //   aderM      der Abstand der tragenden Rippen über den Leitbündeln (Pooideae, C3: Leitbündel 0,2–0,5 mm, die Rippen der
    //              Oberseite über jedem zweiten — Metcalfe 1960, Anatomy of the Monocotyledons I; Christin et al. 2013, PNAS
    //              110:1381); `ader` hellt die Albedo über der Ader (mittelfrei), `rippe` die Steigung der Rippe, `mitte` die
    //              hellere Mittel-Rippe über `mitteBreite` Adern
    //   spitze     die Breite 1 − f^spitze längs des Halms (lineal, spitz im letzten Fünftel)
    //   narbe      DAS LICHT IN DER NARBE (Monsi & Saeki 1953: I/I0 = exp(−K·Λ), Gras-Bestände K 0,3–0,5): die direkte Quelle
    //              nach dem Ellipsoid-Gesetz der Blatt-Winkel K(θ) = √(x² + tan²θ) / (x + 1,774 (x + 1,182)^−0,733) (Campbell 1986,
    //              Agric. For. Meteorol. 36:317), die aufrechte Narbe x 0,7 (K 0,39 senkrecht, 0,50 bei 30°); das Himmels-Licht
    //              mit kHimmel = dem Integral desselben Gesetzes über den bedeckten Himmel (0,70 bei Λ 2)
    //   rauheit    die Cuticula (GGX, α = rauheit²): die Glanz-Keule des Blatts σ 0,2–0,5 (Bousquet et al. 2005, Remote Sens.
    //              Environ. 98:201) → 0,45–0,71; die Umgebung trägt der Himmel ganz, die Tiefe der Narbe verdeckt ihn
    //   aehre      DIE ÄHRE: Ährchen wechselständig an der Spindel (zweizeilig, Lolium · Elymus), `aehrchen` die volle Zahl
    //              (die gelieferten Stufen lesen ihre Budget-Zeile), `winkel` gegen die Spindel, `laenge` je Abstand (sie decken
    //              sich), `breite` je Länge (lanzettlich 7–20 × 3–7 mm), `drehung` um die Spindel je zweitem Ährchen
    //   dach       DIE WIESE ALS DACH (licht.K1, w3v-licht): trägt der Pixel einen Halm oder mehr (Schirm-Meter je Pixel ab
    //              `px[1]`, die Halm-Breite der Natur 3–6 mm), lichtet die Narbe als Dach — die Normale zu `oben` nach oben, die
    //              Rauheit 1 (die Klingen streuen um sie, kein Spiegel einer Fläche); bis `px[0]` (drei Pixel je Halm: Armlänge,
    //              1080p und 75° bis 0,7 m) trägt der Halm seinen Querschnitt und seine Cuticula. Der Übergang folgt dem Pixel des
    //              Schirms, nie dem Abstand; ab 2,1 m (der nächste Boden des Ego-Bilds steht in 2,2 m) lichtet die Wiese als Dach.
    var HALM_GESETZ = Object.freeze({
        kiel: 0.35,
        rund: 0.6,
        aderM: 0.0007,
        ader: 0.08,
        rippe: 0.25,
        mitte: 0.15,
        mitteBreite: 0.6,
        spitze: 4,
        narbe: Object.freeze({ x: 0.7, kHimmel: 0.7 }),
        rauheit: 0.55,
        aehre: Object.freeze({ aehrchen: 16, winkel: 0.42, laenge: 1.7, breite: 0.38, drehung: 0.35 }),
        dach: Object.freeze({ px: Object.freeze([0.001, 0.003]), oben: 0.9 }),
    });
    // Der Pixel als Filter einer Welle mit ν Perioden je Ader: exp(−π² (ν·fw)² / 2) — die Gauss-Glättung des Pixels (fw: der
    // Pixel in Adern, `fwidth` des Lesers). Eine Welle unter zwei Pixeln trägt nichts mehr: kein Flimmern in der Ferne.
    function halmFilter(A, fw, nu) {
        const x = A.mul(fw, A.k(nu));
        return A.pow(A.k(Math.E), A.mul(A.mul(x, x), A.k((-Math.PI * Math.PI) / 2)));
    }
    // DER QUERSCHNITT über einer Algebra: die Steigung des Halms quer zur Mittel-Rippe bei u (Adern) — der Kiel (V, um `rund`
    // Adern gerundet, nie schärfer als der Pixel) und die Rippen der Adern (gefiltert). Der Leser kippt die Normale um sie gegen
    // die Breiten-Richtung t (u wächst längs t): n = normalize(n₀ − s · t).
    function halmQuer(A, u, fw) {
        const H = HALM_GESETZ;
        const r = A.max(A.k(H.rund), fw);
        const kiel = A.mul(A.mul(A.k(Math.tan(H.kiel)), u), A.pow(A.add(A.mul(u, u), A.mul(r, r)), A.k(-0.5)));
        const rippe = A.mul(A.mul(A.k(-H.rippe), A.sin(A.mul(u, A.k(2 * Math.PI)))), halmFilter(A, fw, 1));
        return A.add(kiel, rippe);
    }
    // DIE ADER im Stoff: der Faktor auf die Albedo bei u (Adern) — über der Ader heller, dazwischen dunkler (mittelfrei,
    // gefiltert), die Mittel-Rippe heller; ihre Linie wird mit dem Pixel breiter und blasser (flächentreu).
    function halmAder(A, u, fw) {
        const H = HALM_GESETZ;
        const ader = A.mul(
            A.mul(A.k(H.ader), A.sin(A.add(A.mul(u, A.k(2 * Math.PI)), A.k(Math.PI / 2)))),
            halmFilter(A, fw, 1)
        );
        const s = A.max(A.k(H.mitteBreite), fw);
        const ss = A.pow(A.mul(s, s), A.k(-1));
        const mitte = A.mul(
            A.mul(A.k(H.mitte * H.mitteBreite), A.pow(s, A.k(-1))),
            A.pow(A.k(Math.E), A.mul(A.mul(A.mul(u, u), ss), A.k(-0.5)))
        );
        return A.add(A.k(1), A.add(ader, mitte));
    }
    // DIE NARBE über einer Algebra: das Licht in der Tiefe λ der Narbe — `direkt` für eine Quelle unter cos θ zum Zenit, `himmel`
    // für das Himmels-Licht (Rückgabe die Faktoren auf das Licht; der Leser setzt direkt in seine Licht-Kette, himmel in die
    // Verdeckung des indirekten Lichts). Dieselbe Narbe liest der Boden unter der Nah-Wiese.
    function halmNarbe(A, lambda, cosT) {
        const N = HALM_GESETZ.narbe;
        const c = A.max(cosT, A.k(0.05));
        const tan2 = A.add(A.pow(A.mul(c, c), A.k(-1)), A.k(-1));
        const kb = A.mul(A.k(1 / (N.x + 1.774 * Math.pow(N.x + 1.182, -0.733))), A.sqrt(A.add(A.k(N.x * N.x), tan2)));
        return {
            direkt: A.pow(A.k(Math.E), A.mul(A.mul(kb, lambda), A.k(-1))),
            himmel: A.pow(A.k(Math.E), A.mul(lambda, A.k(-N.kHimmel))),
        };
    }

    // DIE STREU EINER REGION (B-Streu): ihre Felder (Steilheit · Feuchte · lebendig je Texel, Float32 wie jeder Bake) und die
    // Würfe ihrer Zellen — je Schicht in Zeilen-Reihe (cz-major, cx-minor) jede Zelle, die Abstand, Steilheit und den Dichte-Wurf
    // trägt, als STREU_WURF Zahlen [cellX, cellZ, x, z, yaw, scale, hash, lebendig, feuchte]. EINE Regel für den Haupt-Faden
    // (One-Shot) und den Streu-Faden (voxel-worker `streu-region`, die Region der Ankunft); die Leser des Orts reicht der Host
    // (`leser`: surfaceYAt · slopeAt · feuchteAt · fieldAt). Was der Zustand des Hosts urteilt (Promotion, Tat, Wasser, Asset, die
    // Zahl je Region), bleibt beim Host. Ein Texel rechnet beim ersten Lesen — dieselbe Zahl in jeder Reihe.
    function streuPcg(a, b) {
        let x = (a >>> 0) * 1664525 + 1013904223;
        let y = (b >>> 0) * 1664525 + 1013904223;
        x = (x >>> 0) + (((y >>> 0) * 1664525) >>> 0);
        y = (y >>> 0) + (((x >>> 0) * 1664525) >>> 0);
        x = (x >>> 0) ^ (x >>> 16);
        y = (y >>> 0) ^ (y >>> 16);
        x = (x >>> 0) + (((y >>> 0) * 1664525) >>> 0);
        y = (y >>> 0) + (((x >>> 0) * 1664525) >>> 0);
        x = (x >>> 0) ^ (x >>> 16);
        return x >>> 0;
    }
    function streuPcgFloat(cx, cz, salt) {
        return streuPcg((cx * 73856093) ^ ((salt | 0) * 19349663), cz * 83492791) / 4294967296;
    }
    // Der Ort einer Streu-Zelle: Jitter in der Zelle, Drehung, Größe (scaleBase + Wurf × scaleVar).
    function streuZelle(cellX, cellZ, cm, sb, sv) {
        const jx = streuPcgFloat(cellX, cellZ, 1);
        const jz = streuPcgFloat(cellX, cellZ, 2);
        return {
            x: (cellX + 0.15 + jx * 0.7) * cm,
            z: (cellZ + 0.15 + jz * 0.7) * cm,
            yaw: streuPcgFloat(cellX, cellZ, 3) * Math.PI * 2,
            scale: sb + streuPcgFloat(cellX, cellZ, 4) * sv,
        };
    }
    const STREU_WURF = 9;
    function streuFelder(B, L) {
        const R = B.res;
        const felder = new Map();
        return (x, z) => {
            const rx = Math.floor(x / B.sizeM);
            const rz = Math.floor(z / B.sizeM);
            let e = felder.get(rx + "," + rz);
            if (!e) {
                e = { ox: rx * B.sizeM, oz: rz * B.sizeM, d: new Float32Array(R * R * 3), da: new Uint8Array(R * R) };
                felder.set(rx + "," + rz, e);
            }
            const texel = (i, j) => {
                const n = j * R + i;
                if (!e.da[n]) {
                    const tx = e.ox + (i + 0.5) * B.texelM;
                    const tz = e.oz + (j + 0.5) * B.texelM;
                    const f = L.fieldAt(tx, tz);
                    e.d[n * 3] = L.slopeAt(tx, tz);
                    e.d[n * 3 + 1] = L.feuchteAt(tx, tz, L.surfaceYAt(tx, tz));
                    e.d[n * 3 + 2] = f ? +f.lebendig || 0 : 0;
                    e.da[n] = 1;
                }
                return n * 3;
            };
            const lx = (x - e.ox) / B.texelM - 0.5;
            const lz = (z - e.oz) / B.texelM - 0.5;
            const i0 = Math.max(0, Math.min(R - 1, Math.floor(lx)));
            const j0 = Math.max(0, Math.min(R - 1, Math.floor(lz)));
            const i1 = Math.min(R - 1, i0 + 1);
            const j1 = Math.min(R - 1, j0 + 1);
            const fx = Math.max(0, Math.min(1, lx - i0));
            const fz = Math.max(0, Math.min(1, lz - j0));
            const [a, b, c, d] = [texel(i0, j0), texel(i1, j0), texel(i0, j1), texel(i1, j1)];
            const w = (k) => {
                const v0 = e.d[a + k] + (e.d[b + k] - e.d[a + k]) * fx;
                return v0 + (e.d[c + k] + (e.d[d + k] - e.d[c + k]) * fx - v0) * fz;
            };
            return { slope: w(0), moisture: w(1), lebendig: w(2) };
        };
    }
    function streuRegion(a) {
        const SC = a.SC;
        const feld = streuFelder(a.bake, a.leser);
        return a.layers.map((layer) => {
            const out = [];
            const cellM = layer.cellM;
            const n = Math.round(SC.regionM / cellM);
            const bx = Math.round((a.regX * SC.regionM) / cellM);
            const bz = Math.round((a.regZ * SC.regionM) / cellM);
            const slopeMax = Number.isFinite(layer.slopeMax) ? layer.slopeMax : SC.slopeMax;
            const floor = Number.isFinite(layer.floor) ? layer.floor : SC.densityFloor;
            const dScale = Number.isFinite(layer.densityScale) ? layer.densityScale : SC.densityScale;
            let salt = 0; // je Schicht ein eigener Wurf-Strom
            for (let i = 0; i < layer.name.length; i++) salt = (salt * 131 + layer.name.charCodeAt(i)) >>> 0;
            for (let cz = 0; cz < n; cz++)
                for (let cx = 0; cx < n; cx++) {
                    const cellX = bx + cx;
                    const cellZ = bz + cz;
                    const tf = streuZelle(cellX, cellZ, cellM, layer.scaleBase, layer.scaleVar);
                    const dist = Math.sqrt((tf.x - a.px) * (tf.x - a.px) + (tf.z - a.pz) * (tf.z - a.pz));
                    if (dist < SC.innerM || dist > SC.outerM) continue;
                    const f = feld(tf.x, tf.z);
                    if (f.slope > slopeMax) continue;
                    // Fels bricht an STEILEN, TROCKENEN, KAHLEN Hängen durch, jede andere Schicht folgt dem lebendigen Feld
                    const prob =
                        layer.kind === "rock"
                            ? Math.min(
                                  0.85,
                                  floor +
                                      Math.max(0, f.slope * 1.1 + (1 - f.moisture) * 0.25 - f.lebendig * 0.5 - 0.15) *
                                          dScale
                              )
                            : Math.min(0.95, floor + f.lebendig * SC.densityScale);
                    if (streuPcgFloat(cellX ^ salt, cellZ, 9) >= prob * a.fdScale) continue;
                    const h = streuPcg((cellX ^ a.seedHash ^ salt) >>> 0, (cellZ * 2654435761) >>> 0);
                    out.push(cellX, cellZ, tf.x, tf.z, tf.yaw, tf.scale, h, f.lebendig, f.moisture);
                }
            return new Float64Array(out);
        });
    }

    root.__phytoCore = {
        streuPcg: streuPcg,
        streuPcgFloat: streuPcgFloat,
        streuZelle: streuZelle,
        streuRegion: streuRegion,
        STREU_WURF: STREU_WURF,
        vn2: vn2,
        fbm2: fbm2,
        barkProfile: barkProfile,
        buildTubeGesetz: buildTubeGesetz,
        STUFEN_BILD_PX: STUFEN_BILD_PX, // die Bild-Höhe eines Baums an der Nahkante seiner Stufe (S3; foundry-core: das Gerüst der L1 ohne Krone)
        impostorFrame: impostorFrame,
        karteRingHalbe: karteRingHalbe, // lod.K3 — die halbe Bild-Höhe eines Hebungs-Rings über einer Algebra
        scanRadialXZ: scanRadialXZ,
        forestCellRng: forestCellRng,
        FOREST_STAND: FOREST_STAND,
        FREISTAND: FREISTAND,
        BESTAND: BESTAND, // T2: der Laubbaum im Bestand (Seitenast-Länge und Kronen-Hub)
        solitaerGestalt: solitaerGestalt,
        forestStandDensity: forestStandDensity,
        forestGeburt: forestGeburt,
        forestBestand: forestBestand,
        forestKronenDeckung: forestKronenDeckung, // K16: die Kronen-Deckung des gepflanzten Bestands (das Dach des Rings liest sie)
        forestOktavMittel: forestOktavMittel, // K16: die Blende einer Oktave unter einem Fußabdruck (Wert → Mittel) // K16: Bestandsdichte + Deckung unter einem Fußabdruck (die Fern-Farbe)
        forestNicheWeights: forestNicheWeights,
        forestNische: forestNische,
        forestTreeSize: forestTreeSize,
        forestMammutRoll: forestMammutRoll,
        forestSizeAndMammut: forestSizeAndMammut,
        FOREST_TOPOLOGY: FOREST_TOPOLOGY,
        SCATTER_STRATUM: SCATTER_STRATUM,
        scatterStratum: scatterStratum,
        FOREST_PACK: FOREST_PACK,
        FOREST_LAB: FOREST_LAB,
        FOREST_SPECIES: FOREST_SPECIES,
        forestLabToHost: forestLabToHost,
        forestHostToLab: forestHostToLab,
        forestGridKey: forestGridKey,
        forestTooClose: forestTooClose,
        forestPrioWins: forestPrioWins,
        forestCrownClear: forestCrownClear,
        planForestCell: planForestCell,
        growSkeleton: growSkeleton,
        PHYLO_GESETZ: PHYLO_GESETZ,
        PHYLO_VIS: PHYLO_VIS,
        WX_GESETZ: WX_GESETZ,
        WX_VIS: WX_VIS,
        WX_LICHT: WX_LICHT,
        WIND_FELD: WIND_FELD, // wetter.K5 · K1 — der Wind am Ort in m/s und die Front
        windRichtung: windRichtung, // wetter.K5 — DIE EINE Wind-Richtung (Saat, Zeit)
        windGrund: windGrund, // wetter.K1 — die Grundrichtung, mit der die Fronten ziehen
        wetterAt: wetterAt, // wetter.K1 — DAS Wetter am Ort (Saat, Ort, Zeit) → Zeile von WX_GESETZ
        treePhenotype: treePhenotype,
        artPhaenotyp: artPhaenotyp, // K24 — der Phänotyp einer Art: Gesetz ⊕ Phänotyp-Zeile (Wirt, Linsen, treeParams)
        treeParams: treeParams, // K24 — DIE EINE Ableitung Dials → P (Studio, Foundry-Worker)
        stufenRezept: stufenRezept, // K24 — das Rezept einer Bau-Stufe (foundry-core emitTree delegiert)
        hexOffsetHSL: hexOffsetHSL, // K24 — der Farb-Wurf im HSL-Raum (r128-Arithmetik, renderer-frei)
        bakeLeafAtlasCanvas: bakeLeafAtlasCanvas,
        bakeLeafAtlasBild: bakeLeafAtlasBild, // das Textur-Bild des EINEN Atlas: blutend, Zell-Mittel gleich, deckungstreue Mips, `wert`
        blattAtlasFracht: blattAtlasFracht, // die Fracht des Atlas je Format: BC3 ab Stufe 0 (K20), rgba ab Stufe 1 (05.10.)
        BLATT_ATLAS_ZELLE: BLATT_ATLAS_ZELLE, // die Zelle des Atlas in Pixeln (512, 05.10.)
        buildFoliageQuads: buildFoliageQuads,
        kronenNormalen: kronenNormalen, // K68: die Normale der Krone (Ellipsoid × Karte) — foundry-core vor dem Laub-Merge
        kronenPartien: kronenPartien, // T2: die Ast-Partie je Lauf — die Laubkrone lichtet je Partie
        KRONEN_NORMALE: KRONEN_NORMALE,
        mulberry32: mulberry32, // der Vorlagen-RNG (der Strom des Wuchses; gate:pflanzen-nah wächst dasselbe Skelett)
        kronenLagen: kronenLagen, // S3: die Lagen einer Krone — der Bau-Regler der Karten-Wahl (foundry-core __lagenWahl)
        quadLagen: quadLagen, // S3: die Lagen beliebiger Karten (Strähnen der Trauer-Krone)
        BLATT_ATLAS_BREIT: BLATT_ATLAS_BREIT, // der Atlas-Steckbrief (Zellen + Kern + Füllung) der Breitblatt-Zellen
        BLATT_ATLAS_WEDEL: BLATT_ATLAS_WEDEL, // der Atlas-Steckbrief (Zelle + Kern + Füllung) des Wedels (S3: Zelle 3)
        buildLeafBlades: buildLeafBlades, // Eins W4 (P1): die 30-Vert-Superformel-Klinge für L0
        ZWEIG_BLATT: ZWEIG_BLATT, // der Blatt-Zweig der Baum-Zellen (Pixel-Maße des Malers, 05.10.)
        ZWEIG_GROSS: ZWEIG_GROSS, // der Großblatt-Zweig der Zelle 2 (Strauch; 05.10.)
        ZWEIG_WEIDE: ZWEIG_WEIDE, // der Weiden-Zweig der Zelle 1 (die Trauer-Strähnen; Integration 05.10.)
        BLATT_ATLAS_WEIDE: BLATT_ATLAS_WEIDE, // der Atlas-Steckbrief der Weiden-Zelle (Integration 05.10.)
        BLATT_ATLAS_GROSS: BLATT_ATLAS_GROSS, // der Atlas-Steckbrief der Großblatt-Zelle (05.10.)
        WEDEL_ZWEIG: WEDEL_ZWEIG, // der Wedel der Wedel-Zelle (Pixel-Maße des Malers, S3 09.10.)
        BLUETEN_BLATT: BLUETEN_BLATT, // das Blütenblatt: Saftmal-Grund, Rückbiegung, Würfel je Blatt (05.10.)
        BLATT_UNTERSEITE: BLATT_UNTERSEITE, // die hellere, mattere Blatt-Unterseite — Labor-Shader und Welt-Stoff (05.10.)
        BIRKEN_RINDE: BIRKEN_RINDE, // die papierene Rinde: Lentizellen-Zeilen, Fuß-Borke, Zweig-Rinde (05.10.)
        RINDEN_GITTER: RINDEN_GITTER, // das Gitter-Gesetz der Rinde: Plattenrisse nur, was die Ringe tragen (05.10.)
        superR: superR,
        LEAF_SHAPES: LEAF_SHAPES,
        buildBoulderGeometry: buildBoulderGeometry,
        buildCrystalPointGeometry: buildCrystalPointGeometry,
        buildBarkTubeArrays: buildBarkTubeArrays,
        lodDitherIGN: lodDitherIGN, // W5.3 — das foundry-core-_dh (Interleaved-Gradient-Noise), byte-genau
        lodCrossfadeMask: lodCrossfadeMask, // W5.3 — die EINE Studio-Dither-Blenden-Quelle (FIX v37)
        KARTEN_GESETZ: KARTEN_GESETZ, // W6 — der Karten-Atlas: Schwelle · Normal-Teiler · kleinste Mip-Seite
        karteMasse: karteMasse,
        karteRinge: karteRinge, // lod.K3 — die Hebungs-Ringe der Schicht (die Atlas-Diät)
        karteGlaetteGaenge: karteGlaetteGaenge,
        impostorMips: impostorMips,
        bc1Kodiere: bc1Kodiere,
        bc3Kodiere: bc3Kodiere, // die Fracht mit stetiger Alpha (der Blatt-Atlas, K20)
        bcDekodiere: bcDekodiere,
        karteSaum: karteSaum, // w4-laub-saum — der Saum der Art: Blattgröße in Stufe-0-Texeln, Laub oder Nadel
        karteSaumMuster: karteSaumMuster, // das Zell-Muster des Saums (die GPU-Ablage rechnet es bitgleich)
        bodenBand: bodenBand, // Waldboden 04.10. — das Trapez-Band des Boden-Gesetzes
        bodenGewicht: bodenGewicht, // Waldboden 04.10. — das Gewicht einer Boden-Art (Labor-Wald + Nah-Streu der Welt)
        BUDGET_GESETZ: BUDGET_GESETZ, // W8 — das Budget-Gesetz: Glut-Schwelle, Teil-Deckel, Verschmelz-Deckel, Form
        budgetStoff: budgetStoff, // die EINE Material-Identität (Wirts-Material-Cache, Faltung, Wand)
        budgetRegler: budgetRegler, // die EINEN Material-Zahlen eines Stoffs (Schlüssel + Wirts-Material)
        budgetSeh: budgetSeh, // die Seh-Klasse eines Stoffs aus dem Gesetzbuch (null = Bruch)
        budgetFuellFarbe: budgetFuellFarbe, // die Füll-Farbe eines Teils ohne Vertex-Farbe (Wirt + Faltung)
        LOOK_KLASSEN: LOOK_KLASSEN, // die EINE Liste der Look-Stoffe (FELL_LOOK/HAUT_LOOK/HAAR_LOOK)
        budgetLook: budgetLook,
        budgetSeite: budgetSeite,
        budgetGlut: budgetGlut,
        budgetSippe: budgetSippe, // die EINE Verschmelz-Regel eines Teils (Wirt: Flatten + Ofen, Gesetz: Draws)
        budgetSippen: budgetSippen, // Dreiecke + Draws einer gelieferten Stufe nach der Regel des Wirts
        budgetGestaltVersatz: budgetGestaltVersatz, // dieselbe Gestalt, nur verschoben (Flügel-Instanz des Wirts) — der Versatz oder null
        budgetWurf: budgetWurf, // S3: der Schatten-Teil einer Stufe (Dreiecke, Teile)
        budgetZeile: budgetZeile, // Stufen-Klammer + Budget-Zeile eines Kerns
        kerneVereinen: kerneVereinen, // der EINE Merge der Zweit-Kern-Blöcke (Stufen · Budget · Gestalten)
        budgetErzwingen: budgetErzwingen, // DER Ausgang: faltet auf die Zeile, berichtet vorher/nachher + Bruch
        WIND_GESETZ: WIND_GESETZ, // K19 — das Wind-Gesetz des Baums (f0 = kF·D/H², Stamm < Ast < Blatt, Last ∝ U^vogel)
        stammDurchmesser: stammDurchmesser, // K19 — der Fuß-Durchmesser der gelieferten Gestalt (Ring des Stamm-Strangs)
        windSchlankheit: windSchlankheit, // K19 — δ = D(Brusthöhe) / H der gelieferten Gestalt
        windSchlankheitAchse: windSchlankheitAchse, // K19 — dasselbe δ an der Stamm-Achse eines Skeletts (Werkstatt-Baum)
        windAusschlag: windAusschlag, // K19 — DER EINE Wind-Term über einer Algebra (Welt-Stoff, Labor-Shader, Linse)
        WIND_ZAHLEN: WIND_ZAHLEN, // K19 — die Zahlen-Algebra des Terms
        WIND_GLSL: WIND_GLSL, // K19 — die GLSL-Algebra des Terms (Labor)
        LAUB_LICHT: LAUB_LICHT, // K19 — Durchlass des Blatts (tau = T/R je Laub/Nadel) und die Vorwärts-Keule
        laubDurchlass: laubDurchlass, // K19 — DER EINE Laub-Licht-Term über einer Algebra (Welt-Stoff, Labor-Shader, Linse)
        HALM_GESETZ: HALM_GESETZ, // w4-wiese-nah — der Halm: Querschnitt, Adern, Spitze, Narbe, Cuticula, Ähre
        halmQuer: halmQuer, // die Steigung des Querschnitts (Kiel + Rippen) über einer Algebra
        halmAder: halmAder, // der Faktor der Adern und der Mittel-Rippe auf die Albedo über einer Algebra
        halmNarbe: halmNarbe, // das Licht in der Narbe (direkt · Himmel) über einer Algebra — Halm und Boden darunter
    };
})(typeof self !== "undefined" ? self : typeof globalThis !== "undefined" ? globalThis : this);
