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
    // Der Vorlagen-RNG (mulberry32) — die geteilte Quelle für die deterministischen Zufalls-Muster der Rezepte (Fels-Speckle,
    // Wuchs, Atlas, Wald), damit AnazhRealm das EXAKTE Vorlagen-Korn erbt, nicht ein zweites LCG-Muster. DER GENERATOR LEBT
    // EINMAL (Welle SAMEN): im Samen-Kern (samen-core.js `__samenCore`), gelesen je Ruf am globalen Namen — die Lese-Spur der
    // Platte (`_foundrySchale`) sieht ihn, sein Gesetz steht im Schlüssel jeder Lieferung, die zieht.
    function samenKern() {
        const S = root.__samenCore;
        if (!S) throw new Error("phyto-core: der Samen-Kern fehlt (samen-core.js lädt vor jedem Kern)");
        return S;
    }
    function mulberry32(a) {
        return samenKern().mulberry32(a);
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
        // Individuums in der Größe 1 — das Laub steht 1–2,5 m darüber —, `P.weltSkala` Meter je Vorlagen-Einheit), wächst in
        // der Welt so hoch: die Höhe trägt der Schaft (`schaftHub`, unten). Die Formel oben in Vorlagen-Einheiten las H/D 13–18
        // für jeden Baum (gate:pflanzen-nah (H)); sie bleibt das Maß der FORM — die Quirl-Teilung der Konifere liest sie —,
        // alle übrigen Radien sind relativ zum Stamm (da Vinci): das Skelett und der Zufalls-Strom hängen nicht an ihm. Ohne
        // Welt-Maß (der Bauplan-Baum der Werkstatt, das stehende Totholz — die Bruch-Höhe ist sein Maß) wächst der Stamm nach
        // der Formel oben.
        // DER STAMM AUS DER KRONE (w28-stamm-krone, STAMM_KRONE unten): der Stamm eines Laubbaums misst, was er trägt — sein
        // Querschnitt folgt aus dem Schirm der gewachsenen Krone (`stammAusKrone`, nach Wuchs und Hub), nie aus der Höhe. Der
        // Wuchs rechnet darum in der Form-Einheit `trunkForm`, und die Radien aller Stränge reisen danach mit dem Stamm
        // (da Vinci von der Wurzel: jeder Radius ist ein Anteil des Stamms — die EINE Randbedingung steht jetzt an der Krone).
        // H/D ist damit ein Mess-Ergebnis (gate:pflanzen-nah (H) hält es im Band), der Solitär trägt seinen dicken Stamm, weil
        // sein Schirm breit ist (kein eigener Faktor).
        // DIE KONIFERE trägt ihren Stamm weiter aus der Höhe (`P.hd` die Schlankheit H/D ihres Standorts, Bestand 40–100 —
        // waldwissen, McMahon 1973; der Solitär hd · FREISTAND.hd): ihr Schirm misst im Kern 19–23 m bei 22–25 m Höhe, und ihr
        // Solitär trägt den kleineren (Fichte Same 3 9,7 m Radius gegen 11,5 im Bestand) — aus ihm folgte ein Stamm von über
        // einem Meter und ein Solitär, der schlanker ist als sein Bestand. Offen, bis die Krone der Konifere ihr Maß trägt.
        // DER SOLITÄR UND DER TRAUF (K20, `P.freistand`, FREISTAND unten): ein Baum mit Licht von der Seite trägt seine Krone
        // tief — ihr tiefster Blatt-Anker bei FREISTAND.fuss seiner gewachsenen Höhe (kein Hub auf die Bestandshöhe).
        const weltMass = P.weltSkala > 0 && P.hoeheM > 0;
        const frei = weltMass && P.freistand === 1;
        const kroneTraegt = weltMass && !P.conifer;
        if (weltMass && P.conifer && !(P.hd > 0))
            throw new Error("[phyto] die Konifere im Welt-Maß trägt keine Schlankheit hd");
        // DER BESTAND (T2, BESTAND unten): ein Laubbaum im Bestand wächst kurze Seitenäste und trägt seine Krone hoch und schmal.
        const bestand = kroneTraegt && !frei && bestandArt(P);
        const horst = P.basalStems > 1; // der Strauch (STRAUCH_WUCHS unten)
        const seitenast = bestand ? BESTAND.seitenast : horst ? STRAUCH_WUCHS.seitenast : 1;
        const trunkR =
            !weltMass || kroneTraegt
                ? trunkForm
                : frei
                  ? (P.height / (P.hd * FREISTAND.hd) / 2) * (P.trunkMul || 1)
                  : (P.hoeheM / P.hd / 2 / P.weltSkala) * (P.trunkMul || 1);
        // die Höhe, an der die Krone der Konifere ihr Maß nimmt (Vorlagen-Einheiten): im Welt-Maß die Höhe der Art, sonst die Form
        const kegelHoehe = P.conifer
            ? (weltMass ? P.hoeheM / P.weltSkala : P.height) * (frei ? KONIFERE_KEGEL.frei : 1)
            : 0;
        // DER AST AUS DEM KEGEL (laub-kante): ein Ast am Stamm der Konifere (der Quirl und die Seitenäste des ersten
        // Stamm-Laufs) wächst so lang, dass er mit seinen Fortsetzungen (das Leit-Kind trägt `fAst` seiner Länge je Stufe: die
        // Reihe 1 / (1 − fAst)) den Kegel seiner Art an seiner Höhe `uy` (Anteil der Form-Höhe) erreicht, quer zum Stamm unter
        // dem Winkel `wb` — unten lang, zum Wipfel kurz; `koniferenKegel` stellt ihn danach genau an den Mantel.
        const kegelAst = (uy, wb) => {
            const fAst = lerp(0.72, 0.8, P.apical),
                cb = P.crownBase || 0;
            const reich = P.kroneAnteil * kegelHoehe * clamp((1 - uy) / Math.max(1e-3, 1 - cb), 0, 1);
            return (reich * (1 - fAst)) / Math.max(0.2, Math.sin(wb));
        };

        // DER SCHIRM KENNT KEINE KAPPE (w28-stamm-krone): `countCap` schneidet Detail (der gefühlte Baum der Werkstatt wächst mit
        // 3 600 · 600 · 90 Strängen), der Stamm aber trägt die Krone des GANZEN Wuchses. Ein Lauf über der Kappe wächst darum als
        // Maß weiter (`ueberKappe`: kein Strang, kein Lauf, kein Schwung — nur die Blatt-Anker seines Schirms, `schirmNur`):
        // die Stufen eines Plans tragen denselben Stamm (Eiche 0,330 m bei 8 800 und 3 600; die Kappe 600 las 0,287, 90 las
        // 0,118 m). Nur der Laubbaum im Welt-Maß misst so; jeder andere Wuchs endet an der Kappe wie zuvor.
        const schirmNur = [];
        let ueberKappe = false;
        const grow = (pos, dir, radius, length, depth, accSway, parentRun, isLead) => {
            if (count > countCap || ueberKappe) {
                if (!kroneTraegt) return;
                if (!ueberKappe) {
                    ueberKappe = true;
                    grow(pos, dir, radius, length, depth, accSway, parentRun, isLead);
                    ueberKappe = false;
                    return;
                }
            }
            const myRun = ueberKappe ? -2 : runId++;
            if (!ueberKappe) runMeta[myRun] = { parentRun: parentRun == null ? -1 : parentRun, isLead: !!isLead };
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
                if (sw1 > maxSway && !ueberKappe) maxSway = sw1;
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
                            grow(p2, cd, brad, kegelAst(uy, wb), depth + 1, sw1, myRun, false);
                        }
                    }
                }
                if (!ueberKappe) {
                    segs.push({ p0: p, p1: p2, r0, r1, depth, sway0: sw0, sway1: sw1, phase, omega, runId: myRun });
                    count++;
                }
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
                    const wRun = ueberKappe ? -2 : runId++;
                    if (!ueberKappe) runMeta[wRun] = { parentRun: myRun, isLead: false };
                    for (let s = 0; s < wseg; s++) {
                        wd = vnorm(vadd(wd, [0, -0.7, 0]));
                        const np = vadd(wp, vscl(wd, whipLen / wseg));
                        const sw0 = tipSway + s * 0.2,
                            sw1 = tipSway + (s + 1) * 0.2;
                        if (sw1 > maxSway && !ueberKappe) maxSway = sw1;
                        if (!ueberKappe)
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
                            (ueberKappe ? schirmNur : leaves).push({
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
                        (ueberKappe ? schirmNur : leaves).push({
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
                for (let i = 0; i < nW; i++) {
                    const bend = P.conifer ? lerp(1.0, 0.5, depth / P.maxDepth) : lerp(0.6, 1.15, distal);
                    children.push({
                        area: ((1 - f) * parentArea) / nW,
                        bend,
                        // der Seitenast am Stamm der Konifere (Tiefe 0) ist ein Ast der Krone: sein Maß aus dem Kegel
                        len:
                            P.conifer && depth === 0
                                ? kegelAst(clamp(tip[1] / P.height, 0, 1), bend)
                                : length *
                                  (P.conifer ? lerp(0.4, 0.52, P.apical) : lerp(0.55, 0.72, P.apical) * seitenast),
                        lead: false,
                    });
                }
            } else if (lift) {
                children.push({ area: parentArea, bend: 0.08, len: length * 0.82, lead: true });
            } else {
                // DEKURRENT: der Leittrieb verliert sich, breit spreizende Arme bilden die Kuppel
                // (breiter als hoch — die Eiche). Die Spreizung skaliert mit der Apikaldominanz.
                children.push({
                    area: parentArea * (horst ? STRAUCH_WUCHS.leit[0] : 0.3),
                    bend: lerp(0.12, 0.3, 1 - P.apical),
                    len: length * (horst ? STRAUCH_WUCHS.leit[1] : 0.6),
                    lead: true,
                });
                const nLat = rnd() < 0.55 ? 3 : 2;
                const spread = horst ? STRAUCH_WUCHS.spreizung : lerp(0.55, 1.05, 1 - P.apical);
                for (let i = 0; i < nLat; i++)
                    children.push({
                        area: (parentArea * (horst ? 1 - STRAUCH_WUCHS.leit[0] : 0.7)) / nLat,
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

        if (horst) {
            // DER STRAUCH (STRAUCH_WUCHS): mehrere basale Triebe statt eines Stamms, jeder nach seinem Rang ρ — innen steil
            // und lang, außen bogig und kurz, im Querschnitt nach dem Pipe-Modell; jeder trägt seine Partie (ein Lappen).
            const SW = STRAUCH_WUCHS;
            for (let i = 0; i < P.basalStems; i++) {
                const a = (i / P.basalStems) * 6.28 + rnd();
                const rang = rnd();
                const lean = lerp(SW.neigung[0], SW.neigung[1], rang);
                const dir = vnorm([Math.cos(a) * Math.sin(lean), Math.cos(lean), Math.sin(a) * Math.sin(lean)]);
                grow(
                    [Math.cos(a) * trunkR * 1.5, 0, Math.sin(a) * trunkR * 1.5],
                    dir,
                    trunkR * Math.pow(1 / P.basalStems, 1 / P.delta) * rrange(SW.staerke[0], SW.staerke[1]),
                    P.height * 0.5 * lerp(SW.laenge[0], SW.laenge[1], rang),
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
        // Der Solitär und der Baum am Trauf (FREISTAND.fuss): die Krone streckt sich lotrecht bis zum Wipfel seiner gewachsenen
        // Höhe h0, ihr tiefster Blatt-Anker steht bei fuss · h0 — der Stamm bleibt kurz (das Seitenlicht hält die unteren Äste).
        // Der Bestand (T2) hebt Stamm UND Krone: die Krone reicht über BESTAND.krone der Höhe (kein Ballen auf dem Stiel).
        const hVor = schirmNur.length ? segs.reduce((h, q) => Math.max(h, q.p0[1], q.p1[1]), 0) : 0;
        const schaft = !weltMass
            ? 0
            : frei
              ? schaftHub(segs, leaves, runMeta, null, 0, P.alter > 0, FREISTAND.fuss[P.conifer ? "nadel" : "laub"])
              : schaftHub(
                    segs,
                    leaves,
                    runMeta,
                    P.hoeheM / P.weltSkala,
                    bestand || P.conifer ? BESTAND.krone : 0,
                    P.alter > 0
                );
        // (die Konifere im Bestand trägt ihre Krone über BESTAND.krone der Höhe wie der Laubbaum — der Kronen-Ansatz folgt dem
        // Stand: frei und am Trauf ab FREISTAND.fuss, im Bestand über BESTAND.krone; laub-kante)
        if (P.conifer)
            koniferenKegel(
                segs,
                leaves,
                runMeta,
                P.kroneAnteil * (frei ? KONIFERE_KEGEL.frei : 1),
                P.whorlSpacing * P.height
            );
        // DER STAMM AUS DER KRONE: der Radius des Stamms aus dem Schirm, den die Krone nach Wuchs und Hub spannt (vor dem
        // Blatt-Budget: jede Stufe misst dieselben Anker), jeder Strang reist mit seinem Anteil.
        // (die Anker über der Kappe wuchsen ohne den Hub: lotrecht ändert er den Schirm nicht, die Jugend wächst um den Fuß —
        // ihr Maßstab ist die Höhe nach ÷ vor dem Hub)
        if (schirmNur.length && P.alter > 0 && hVor > 0) {
            const k = segs.reduce((h, q) => Math.max(h, q.p0[1], q.p1[1]), 0) / hVor;
            for (const l of schirmNur) l.pos = [l.pos[0] * k, l.pos[1] * k, l.pos[2] * k];
        }
        const stammR = kroneTraegt
            ? stammAusKrone(schirmNur.length ? leaves.concat(schirmNur) : leaves, P._ls) * (P.trunkMul || 1)
            : trunkR;
        if (kroneTraegt) {
            const k = stammR / trunkR;
            for (const s of segs) {
                s.r0 *= k;
                s.r1 *= k;
            }
        }
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
        return { segs, leaves, trunkR: stammR, trunkForm, height: P.height, runMeta, schaftHub: schaft };
    }
    // DER STAMM AUS DER KRONE (w28-stamm-krone): der Radius des Stamms eines Laubbaums aus dem Schirm seiner Krone, in der
    // Einheit der Blatt-Anker `leaves` (das Verhältnis ist skalenfrei). Der Schirm ist die Breite der Krone, wie der Förster
    // sie misst und wie die Kronen-Tafel FOREST_PACK.crown sie trägt: das Mittel ihrer Breite über `azimute` Richtungen (der
    // Abstand ihrer zwei äußersten Blätter je Richtung) — jeder Anker samt seinem Blatt: die Karte zeigt ihr Laub bis zum
    // Kern ihrer Zelle (BLATT_ATLAS_BREIT.kern × die Blatt-Größe über ihren Anker; `blattMass` = das Blatt-Maß der Stufe,
    // treeParams `_ls`: jede Stufe misst das Blatt der L0). Der Stamm: BHD = Schirm-⌀ ÷ `kd`.
    //   kd  das Verhältnis Kronen-⌀ ÷ BHD frei gewachsener Laubbäume: die Mitte des Bands 17–26 (Hemery, Savill & Pryor 2005,
    //       For. Ecol. Manage. 215: 285–294 — das Band wie am BESTAND unten zitiert; die Zeile je Art ist nicht nachgelesen:
    //       UNGEPRÜFT).
    // Der Schirm gegen die sichtbare Krone (Atlas-Alpha ≥ 0,5, dasselbe Maß über 8 Azimute, gate:pflanzen-nah (H), L0
    // Gestalt 1 im Bestand und frei, acht Bäume aus fünf Arten): im Mittel +1,8 %, −3 bis +8 % (ohne das Blatt −16 %, mit
    // der ganzen Blatt-Größe +9 %). gate:pflanzen-nah (H) „Krone/BHD" hält das Ergebnis an der sichtbaren Krone im Band.
    const STAMM_KRONE = Object.freeze({ kd: 21.5, azimute: 8 });
    // DER KEGEL DER KONIFERE (laub-kante, 18.11.): die Krone der Konifere trägt ihr Maß — jeder Ast (der Lauf am Stamm samt allem, was
    // aus ihm wächst) steht im Kegel um die Stamm-Achse, der am Kronen-Fuß (dem tiefsten Ansatz eines Asts, nach dem Hub des Schafts)
    // den Radius `anteil` · H trägt und am Wipfel der Nadeln (H, die Nadel-Masse — nie der kahle Leit-Trieb) spitz endet. `anteil`
    // ist die Zeile der Art in der EINEN Kronen-Tafel des Pflanz-Gesetzes (FOREST_PACK.crown ÷ die Höhe der Größe 1, treeParams
    // `kroneAnteil`) — derselbe Radius, mit dem der Wald seine Stämme stellt (`forestTooClose`): die Krone schließt im Bestand, weil
    // Plan und Wuchs dieselbe Zahl lesen. Jeder Ast reicht um seinen Ansatz am Stamm bis an den Mantel: der Faktor, mit dem sein
    // weitester Punkt oder Nadel-Anker den Mantel berührt — wer ihn durchstößt, wird gestaucht, seine Nadeln mit ihm (`scale`: der
    // gestauchte Ast ist ein kleinerer Ast, seine Wedel-Karte folgt seinem Maß), wer vor ihm endet, gestreckt (die Reihe seiner
    // Fortsetzungen bricht am kleinsten Ast der Form ab, `growSkeleton` `kegelAst`) — Gestalt, Verzweigung, Nadel-Zahl und
    // Zufalls-Strom bleiben. Die Äste wachsen in Quirlen den Stamm hinab bis zum Kronen-Fuß, nach unten länger (der Kegel).
    // Befund (Kern, Same 1–3, r/H der Nadel-Anker je Zehntel der Höhe): bis hier wuchs der Quirl-Ast als Rekursion des Laub-Asts
    // (das Leit-Kind 0,72–0,8 seiner Länge je Stufe bis maxDepth) — der Schirm der Fichte maß r/H 0,42–0,51, der Tanne 0,30–0,46
    // gegen ihre Tafel 0,105 / 0,110 (gate:pflanzen-nah (H) nahm die Konifere aus); aus dem Dorf stand jede Fichte und Tanne als
    // runder Laub-Ballen vor dem Himmel (fimp:fichte:L2 kante 0,32, tanne 0,30). Ein Ast endet nie am Mantel (der Schnitt nahm der
    // Fichte 83 % ihrer Nadeln: die Spitzen der Rekursion lagen jenseits). `frei`: der Solitär trägt die breitere Krone
    // (UNGEPRÜFT, die Tafel kennt nur den Bestand).
    const KONIFERE_KEGEL = Object.freeze({ frei: 1.4, streck: 2.5 });
    function koniferenKegel(segs, leaves, runMeta, anteil, trieb) {
        if (!(anteil > 0))
            throw new Error("[phyto] der Kegel der Konifere: die Krone ihrer Art fehlt (kroneAnteil, KERN-PFLICHT)");
        let H = 0;
        for (const l of leaves) H = Math.max(H, l.pos[1]);
        if (!(H > 0)) return;
        // die Spitze des Kegels steht einen Jahrestrieb (`trieb`, der Quirl-Abstand) über der Nadel-Masse: der oberste Quirl trägt
        // seine kurzen Äste (ein Kegel, der an der Nadel-Spitze endet, nahm ihnen jedes Maß — kahle Stange)
        const Hk = H + (trieb > 0 ? trieb : 0);
        const stamm = new Map();
        const istStamm = (r) => {
            if (r < 0) return true;
            let v = stamm.get(r);
            if (v === undefined) {
                const m = runMeta[r];
                v = !m || m.parentRun < 0 || (m.isLead && istStamm(m.parentRun));
                stamm.set(r, v);
            }
            return v;
        };
        const astVon = (r) => {
            while (r >= 0 && runMeta[r] && !istStamm(runMeta[r].parentRun)) r = runMeta[r].parentRun;
            return r;
        };
        const aeste = new Map(); // Ast → { a: Ansatz, pkt: Set der Punkte (Arrays, je eines nur einmal) }
        const ast = (r) => {
            const w = astVon(r);
            if (w < 0 || istStamm(w)) return null;
            let A = aeste.get(w);
            if (!A) aeste.set(w, (A = { a: null, pkt: new Set(), nadeln: [] }));
            return A;
        };
        for (const s of segs) {
            const A = ast(s.runId);
            if (!A) continue;
            if (!A.a && s.runId === astVon(s.runId)) A.a = s.p0.slice();
            A.pkt.add(s.p0);
            A.pkt.add(s.p1);
        }
        for (const l of leaves) {
            const A = l.run == null ? null : ast(l.run);
            if (A) {
                A.pkt.add(l.pos);
                A.nadeln.push(l);
            }
        }
        let yFuss = H;
        for (const A of aeste.values()) if (A.a && A.nadeln.length) yFuss = Math.min(yFuss, A.a[1]);
        if (!(yFuss < H)) return;
        const R = (y) => anteil * H * Math.min(1, Math.max(0, (Hk - y) / (Hk - yFuss)));
        for (const A of aeste.values()) {
            if (!A.a) continue;
            const a = A.a;
            const P = [...A.pkt];
            const haelt = (f) =>
                P.every((q) => {
                    const x = a[0] + (q[0] - a[0]) * f,
                        y = a[1] + (q[1] - a[1]) * f,
                        z = a[2] + (q[2] - a[2]) * f;
                    return Math.hypot(x - a[0], z - a[2]) <= R(y) + 1e-9; // um den Stamm an seinem Ansatz (der Leit-Trieb wankt)
                });
            // der Ast reicht bis an den Mantel: zu lang gestaucht, zu kurz gestreckt (höchstens `KONIFERE_KEGEL.streck`, die
            // Reihe seiner Fortsetzungen endet am kleinsten Ast der Form vor ihrer Summe)
            let lo = 0,
                hi = 1;
            if (haelt(1)) {
                if (haelt(KONIFERE_KEGEL.streck)) lo = hi = KONIFERE_KEGEL.streck;
                else ((lo = 1), (hi = KONIFERE_KEGEL.streck));
            }
            for (let i = 0; i < 12; i++) {
                const m = (lo + hi) / 2;
                if (haelt(m)) lo = m;
                else hi = m;
            }
            for (const q of P) {
                q[0] = a[0] + (q[0] - a[0]) * lo;
                q[1] = a[1] + (q[1] - a[1]) * lo;
                q[2] = a[2] + (q[2] - a[2]) * lo;
            }
            if (lo < 1) for (const l of A.nadeln) l.scale *= lo; // (gestreckt behält die Nadel ihr Maß, wie der Ast seine Stärke)
        }
    }
    function stammAusKrone(leaves, blattMass) {
        const N = STAMM_KRONE.azimute,
            ls = blattMass > 0 ? blattMass : 1;
        let breite = 0;
        for (let k = 0; k < N; k++) {
            const c = Math.cos((k * Math.PI) / N),
                s = Math.sin((k * Math.PI) / N);
            let lo = Infinity,
                hi = -Infinity;
            for (const l of leaves) {
                const u = l.pos[0] * c + l.pos[2] * s,
                    b = (BLATT_ATLAS_BREIT.kern * l.scale) / ls;
                if (u - b < lo) lo = u - b;
                if (u + b > hi) hi = u + b;
            }
            breite += hi - lo;
        }
        if (!(breite > 0)) throw new Error("[phyto] der Stamm aus der Krone: die Krone spannt keinen Schirm");
        return breite / N / 2 / STAMM_KRONE.kd;
    }

    // DER STROM EINES GENOMS (w4-b-pflanzen): xorshift32 über dem FNV-1a-Zustand `h` seines Namens (`<Raum>|<Same>#<Strom>`,
    // 0 → 1) — die EINE Quelle des Sub-Stroms für den Wirt (`_rollGenome(...).seq`) und den Wald-Faden (der Wuchs eines
    // Bauplans, voxel-worker `wuchs`: der Wirt schickt nur den Zustand).
    function genomStrom(h) {
        h = h || 1;
        return () => {
            h ^= h << 13;
            h >>>= 0;
            h ^= h >> 17;
            h ^= h << 5;
            h >>>= 0;
            return h / 4294967296;
        };
    }
    // DER WUCHS ALS ZAHLEN (w4-b-pflanzen, Lehre 24): das Skelett von `growSkeleton` in EINEM Float64Array — der Kopf
    // (Segmente · Blätter · Läufe · trunkR · trunkForm · height · schaftHub), je Segment 14, je Blatt 15, je Lauf 2 Zahlen
    // (ein Lauf ohne Eintrag NaN). Per Transfer vom Wald-Faden zum Wirt; `wuchsEntpacken` gibt dasselbe Skelett zurück, Feld für
    // Feld in derselben Reihe (gate:worker-dichte Teil B vergleicht Faden und Haupt-Faden Wort für Wort).
    const WUCHS_ZAHLEN = Object.freeze({ kopf: 7, seg: 14, blatt: 15, lauf: 2 });
    function wuchsPacken(w) {
        const Z = WUCHS_ZAHLEN;
        let nL = 0;
        for (const k in w.runMeta) nL = Math.max(nL, Number(k) + 1);
        const f = new Float64Array(Z.kopf + w.segs.length * Z.seg + w.leaves.length * Z.blatt + nL * Z.lauf);
        f.set([w.segs.length, w.leaves.length, nL, w.trunkR, w.trunkForm, w.height, w.schaftHub]);
        let o = Z.kopf;
        for (const s of w.segs) {
            f.set([s.p0[0], s.p0[1], s.p0[2], s.p1[0], s.p1[1], s.p1[2], s.r0, s.r1, s.depth], o);
            f.set([s.sway0, s.sway1, s.phase, s.omega, s.runId], o + 9);
            o += Z.seg;
        }
        for (const l of w.leaves) {
            f.set([l.pos[0], l.pos[1], l.pos[2], l.dir[0], l.dir[1], l.dir[2], l.up[0], l.up[1], l.up[2]], o);
            f.set([l.scale, l.sway, l.phase, l.omega, l.needle ? 1 : 0, l.run], o + 9);
            o += Z.blatt;
        }
        for (let i = 0; i < nL; i++, o += Z.lauf) {
            const m = w.runMeta[i];
            f[o] = m ? m.parentRun : NaN;
            f[o + 1] = m && m.isLead ? 1 : 0;
        }
        return f;
    }
    function wuchsEntpacken(f) {
        const Z = WUCHS_ZAHLEN;
        const [nS, nB, nL] = [f[0], f[1], f[2]];
        const segs = new Array(nS);
        const leaves = new Array(nB);
        const runMeta = {};
        let o = Z.kopf;
        for (let i = 0; i < nS; i++, o += Z.seg)
            segs[i] = {
                p0: [f[o], f[o + 1], f[o + 2]],
                p1: [f[o + 3], f[o + 4], f[o + 5]],
                r0: f[o + 6],
                r1: f[o + 7],
                depth: f[o + 8],
                sway0: f[o + 9],
                sway1: f[o + 10],
                phase: f[o + 11],
                omega: f[o + 12],
                runId: f[o + 13],
            };
        for (let i = 0; i < nB; i++, o += Z.blatt)
            leaves[i] = {
                pos: [f[o], f[o + 1], f[o + 2]],
                dir: [f[o + 3], f[o + 4], f[o + 5]],
                up: [f[o + 6], f[o + 7], f[o + 8]],
                scale: f[o + 9],
                sway: f[o + 10],
                phase: f[o + 11],
                omega: f[o + 12],
                needle: f[o + 13] === 1,
                run: f[o + 14],
            };
        for (let i = 0; i < nL; i++, o += Z.lauf)
            if (!Number.isNaN(f[o])) runMeta[i] = { parentRun: f[o], isLead: f[o + 1] === 1 };
        return { segs, leaves, trunkR: f[3], trunkForm: f[4], height: f[5], runMeta, schaftHub: f[6] };
    }

    // ── MODUL-HELFER (für die Asset-Montage, geteilt von den Bau-Funktionen unten) ──
    function _vnorm(a) {
        const l = Math.hypot(a[0], a[1], a[2]) || 1e-9;
        return [a[0] / l, a[1] / l, a[2] / l];
    }
    function _vcross(a, b) {
        return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
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
        let rb = mulberry32(ZB.strom);
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
            if (zb !== ZB) rb = mulberry32(zb.strom); // jeder Zweig-Typ sein eigener Strom
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
            const rg = mulberry32(WZ.strom); // eigener Strom (verbraucht kein Welt-RNG)
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
    // Die zwei Schleifen über die Leinwand als kleine Kerne (w28-blatt-atlas-kalt; der Grund steht an `mipBox`): das lineare
    // Mittel der deckenden Texel der Spalten [xa, xb) — oder 1, 1, 1 — und eine Zeile der Stufe 0 (`gleich` · `leer`).
    function atlasMittel(px, W, H, xa, xb, LIN) {
        let n = 0,
            s0 = 0,
            s1 = 0,
            s2 = 0;
        for (let y = 0; y < H; y++)
            for (let x = xa; x < xb; x++) {
                const i = (y * W + x) * 4;
                if (px[i + 3] < 128) continue;
                n++;
                s0 += LIN[px[i]];
                s1 += LIN[px[i + 1]];
                s2 += LIN[px[i + 2]];
            }
        return n ? [s0 / n, s1 / n, s2 / n] : [1, 1, 1];
    }
    function atlasZeile(px, lin, i, o, W, zelle, gleich, leer) {
        for (let x = 0; x < W; x++, i += 4, o += 4) {
            const a = px[i + 3];
            if (a >= 128) {
                const t = zelle[x] * 768;
                lin[o] = gleich[t + px[i]];
                lin[o + 1] = gleich[t + 256 + px[i + 1]];
                lin[o + 2] = gleich[t + 512 + px[i + 2]];
            } else {
                lin[o] = leer[0];
                lin[o + 1] = leer[1];
                lin[o + 2] = leer[2];
            }
            lin[o + 3] = a;
        }
    }
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
        for (let c = 0; c < 4; c++) mittel.push(atlasMittel(px, W, H, c * Z, (c + 1) * Z, LIN));
        const wert = [0, 1, 2].map((k) => Math.min(mittel[0][k], mittel[1][k], mittel[2][k], mittel[3][k]));
        // Stufe 0 linear in Textur-Ordnung: deckend gleichgezogen, sonst `wert`; Alpha roh. Das Byte eines deckenden Texels
        // hängt nur an (Zelle, Kanal, Leinwand-Byte): die 4 · 3 · 256 Werte stehen EINMAL in der Tafel `gleich`, mit derselben
        // Formel gerechnet, die bis w28-blatt-atlas-kalt je Texel und Kanal lief (eine Million Texel, drei Rundungen je Texel)
        const gleich = new Uint8Array(4 * 3 * 256),
            leer = new Uint8Array(3),
            zelle = new Uint8Array(W);
        for (let c = 0; c < 4; c++)
            for (let k = 0; k < 3; k++)
                for (let b = 0; b < 256; b++)
                    gleich[(c * 3 + k) * 256 + b] = Math.round(Math.min(1, (LIN[b] * wert[k]) / mittel[c][k]) * 255);
        for (let k = 0; k < 3; k++) leer[k] = Math.round(Math.min(1, wert[k]) * 255);
        for (let x = 0; x < W; x++) zelle[x] = Math.min(3, Math.floor(x / Z));
        const lin = new Uint8Array(W * H * 4);
        for (let y = 0; y < H; y++) atlasZeile(px, lin, y * W * 4, (H - 1 - y) * W * 4, W, zelle, gleich, leer);
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
    // DIE TAFEL DER VORMULTIPLIKATION (w28-blatt-atlas-kalt): das vormultiplizierte Byte hängt nur an (Alpha, Farb-Byte) —
    // 254 · 256 Werte, je Fracht EINMAL mit der Formel gerechnet, die bis dahin je Texel und Kanal lief (eine Potenz je
    // Kanal jedes Texels mit Teil-Deckung, und jede Stufe ab 1 zweimal: für die rgba-Kette und für die BC-Kette). Kein
    // Zustand im Kern: die Tafel lebt im Ruf (die Fracht entsteht einmal je Boot).
    function vorTafel() {
        const t = new Uint8Array(65536);
        for (let a = 1; a < 255; a++)
            for (let b = 0; b < 256; b++) t[(a << 8) | b] = linZuSrgb8((LIN_AUS_SRGB8[b] * a) / 255);
        return t;
    }
    function blattAtlasFracht(bild, mitBc) {
        if (!bild || !Array.isArray(bild.mips) || bild.mips.length < 2) return null;
        const T = vorTafel();
        const vor = (m) => {
            const d = new Uint8Array(m.data);
            for (let i = 0; i < d.length; i += 4) {
                const a = d[i + 3];
                if (a === 255) continue;
                if (a === 0) {
                    d[i] = d[i + 1] = d[i + 2] = 0;
                    continue;
                }
                const t = a << 8;
                d[i] = T[t | d[i]];
                d[i + 1] = T[t | d[i + 1]];
                d[i + 2] = T[t | d[i + 2]];
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
            // Die vormultiplizierte Stufe ab 1 ist die der rgba-Kette (`r`, EINMAL gerechnet): der Kodierer liest sie nur.
            const bc = [];
            for (let i = 0; i < bild.mips.length; i++) {
                const m = bild.mips[i];
                if (m.width / 4 < 4 * KARTEN_GESETZ.minSeite || m.height < 4 * KARTEN_GESETZ.minSeite) break;
                const v = i ? r[i - 1] : vor(m);
                bc.push({ data: bc3Kodiere(v.data, m.width, m.height), width: m.width, height: m.height });
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
    // DIE PROBE NUR AM RAND (w28-ankunft-faden): das Raster zählt je Pixel die Lagen, das Ergebnis ist die Summe ganzer
    // Zahlen — bit-gleich, solange jedes Pixel dasselbe Urteil trägt. Bis hier fragte jedes Dreieck JEDES Pixel seines Rechtecks
    // von floor(min) bis ceil(max) mit zwei Divisionen (die Karten einer Krone sind groß: 261 Proben je Dreieck für 96 Treffer;
    // GTX 1050 kalt 6,2 CPU-s Selbstzeit auf den beiden Foundry-Fäden vor dem ersten Bild, die Hälfte jedes Laub-Körpers).
    // Jetzt je Zeile des Dreiecks — die drei Gewichte sind entlang einer Zeile LINEAR, g_i(x) = m_i + x · s_i:
    //   (1) Tragen zwei Pixel einer Zeile alle drei Gewichte ≥ LAGEN_FEST (die Rundung der Probe liegt ≥ 6-fach darunter),
    //       tragen es alle Pixel dazwischen: sie zählen ohne Probe. Die Kandidaten kommen aus den Nullstellen der Gewichte,
    //       der Beweis ist allein die Probe der zwei Enden.
    //   (2) Von dort nach links und nach rechts trägt jedes Pixel das Urteil, wie es stand — im Saum |g| < LAGEN_FEST mit den
    //       Quotienten selbst (n/fl < 0 ⟺ n und fl tragen verschiedene Vorzeichen: der Zähler ist 0 oder ≥ 2⁻¹⁵⁸, der Quotient
    //       läuft nie unter), außerhalb des Saums entscheidet das Vorzeichen allein —, bis ein Gewicht ≤ −LAGEN_FEST steht,
    //       das in der Lauf-Richtung weiter fällt: dahinter fällt jedes Pixel. Eine Zeile ohne festes Inneres (die Spitze,
    //       die flache Kante) läuft so von ihrer Mitte aus.
    //   (3) Spalten und Zeilen, deren Pixel-Mitte ≥ LAGEN_RAND außerhalb des Rechtecks der Ecken liegt, tragen ein Gewicht
    //       ≤ −LAGEN_RAND/(2·D) (D die Raster-Kante) und fielen immer.
    //   (4) Wo der Beweis nicht trägt — der Splitter (|fl| < LAGEN_SPLITTER·D³: dort urteilt die Rundung), eine Ecke ohne
    //       Zahl —, bleibt das Urteil je Pixel über das ganze Rechteck, wie es stand.
    // Die Lagen stehen als Stufen je Zeile (+1 am Anfang einer Spanne, −1 dahinter), die Summe läuft am Ende einmal durch.
    // `lagenZaehler` zählt Dreiecke, Proben und Treffer (Leser: gate:asset-contract, die Wand der Lagen-Kosten).
    const LAGEN_RAND = 0.25;
    const LAGEN_FEST = 1e-6;
    const LAGEN_SPLITTER = 1e-9;
    const _lagenZahl = { rufe: 0, dreiecke: 0, proben: 0, treffer: 0 };
    function lagenZaehler(leeren) {
        const z = {
            rufe: _lagenZahl.rufe,
            dreiecke: _lagenZahl.dreiecke,
            proben: _lagenZahl.proben,
            treffer: _lagenZahl.treffer,
        };
        if (leeren) _lagenZahl.rufe = _lagenZahl.dreiecke = _lagenZahl.proben = _lagenZahl.treffer = 0;
        return z;
    }
    function quadLagen(P, n, aufl) {
        if (!n) return 0;
        const U = new Float32Array(n * 4),
            V = new Float32Array(n * 4);
        const X = new Float64Array(n * 4),
            Y = new Float64Array(n * 4);
        const Z = _lagenZahl;
        const boden = Math.floor,
            decke = Math.ceil,
            fern = Infinity;
        Z.rufe++;
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
            const buf = new Int32Array(W * H + 1); // die Stufen: +1 am Anfang einer Spanne, −1 hinter ihr
            for (let i = 0; i < n * 4; i++) {
                X[i] = (U[i] - u0) / px;
                Y[i] = (V[i] - v0) / px;
            }
            const D = Math.max(W, H);
            const splitter = Math.max(LAGEN_SPLITTER * D * D * D, 1e-6);
            let proben = 0;
            for (let c = 0; c < n; c++)
                for (let d = 0; d < 2; d++) {
                    const a = c * 4,
                        b = c * 4 + 1 + d,
                        f = c * 4 + 2 + d;
                    const ax = X[a],
                        ay = Y[a],
                        bx = X[b],
                        by = Y[b],
                        qx = X[f],
                        qy = Y[f];
                    const fl = (bx - ax) * (qy - ay) - (by - ay) * (qx - ax);
                    if (Math.abs(fl) < 1e-12) continue;
                    const x0 = Math.min(ax, bx, qx),
                        x1 = Math.max(ax, bx, qx),
                        y0 = Math.min(ay, by, qy),
                        y1 = Math.max(ay, by, qy);
                    let xa = Math.max(0, Math.floor(x0)),
                        xb = Math.min(W - 1, Math.ceil(x1)),
                        ya = Math.max(0, Math.floor(y0)),
                        yb = Math.min(H - 1, Math.ceil(y1));
                    Z.dreiecke++;
                    if (!(Math.abs(fl) >= splitter) || fl - fl !== 0) {
                        // der Splitter und die Ecke ohne Zahl: das Urteil der Quotienten über das ganze Rechteck, wie es stand
                        for (let y = ya; y <= yb; y++)
                            for (let x = xa; x <= xb; x++) {
                                const sx = x + 0.5,
                                    sy = y + 0.5;
                                const w0 = ((bx - sx) * (qy - sy) - (by - sy) * (qx - sx)) / fl,
                                    w1 = ((qx - sx) * (ay - sy) - (qy - sy) * (ax - sx)) / fl;
                                proben++;
                                if (w0 < 0 || w1 < 0 || 1 - w0 - w1 <= 0) continue;
                                buf[y * W + x]++;
                                buf[y * W + x + 1]--;
                            }
                        continue;
                    }
                    if (x0 - (xa + 0.5) >= LAGEN_RAND) xa++;
                    if (xb + 0.5 - x1 >= LAGEN_RAND) xb--;
                    if (xb + 0.5 - x1 >= LAGEN_RAND) xb--;
                    if (y0 - (ya + 0.5) >= LAGEN_RAND) ya++;
                    if (yb + 0.5 - y1 >= LAGEN_RAND) yb--;
                    if (yb + 0.5 - y1 >= LAGEN_RAND) yb--;
                    if (xb < xa || yb < ya) continue;
                    // mit dem Vorzeichen der Fläche: g_i = sg · n_i, innen ⟺ jedes g_i ≥ 0, ihre Summe ist fa
                    const sg = fl > 0 ? 1 : -1,
                        fa = sg * fl,
                        fest = LAGEN_FEST * fa;
                    const s0 = sg * (by - qy),
                        s1 = sg * (qy - ay),
                        s2 = sg * (ay - by);
                    const i0 = s0 !== 0 ? -1 / s0 : 0,
                        i1 = s1 !== 0 ? -1 / s1 : 0,
                        i2 = s2 !== 0 ? -1 / s2 : 0;
                    for (let y = ya; y <= yb; y++) {
                        const sy = y + 0.5,
                            zeile = y * W;
                        const m0 = sg * (bx * (qy - sy) - (by - sy) * qx),
                            m1 = sg * (qx * (ay - sy) - (qy - sy) * ax),
                            m2 = sg * (ax * (by - sy) - (ay - sy) * bx);
                        // die Kandidaten des festen Inneren: zwischen den Nullstellen der drei Gewichte
                        let lo = -fern,
                            hi = fern,
                            w;
                        if (s0 > 0) lo = m0 * i0;
                        else if (s0 < 0) hi = m0 * i0;
                        else if (m0 < 0) hi = -fern;
                        if (s1 > 0) {
                            if ((w = m1 * i1) > lo) lo = w;
                        } else if (s1 < 0) {
                            if ((w = m1 * i1) < hi) hi = w;
                        } else if (m1 < 0) hi = -fern;
                        if (s2 > 0) {
                            if ((w = m2 * i2) > lo) lo = w;
                        } else if (s2 < 0) {
                            if ((w = m2 * i2) < hi) hi = w;
                        } else if (m2 < 0) hi = -fern;
                        let cl = decke(lo - 0.5),
                            cr = boden(hi - 0.5);
                        if (!(cl >= xa)) cl = xa;
                        if (!(cr <= xb)) cr = xb;
                        let innen = cl <= cr;
                        if (innen) {
                            // der Beweis: beide Enden tragen alle drei Gewichte ≥ LAGEN_FEST (× |fl|, ohne Division)
                            const sl = cl + 0.5,
                                sr = cr + 0.5;
                            proben += 2;
                            innen =
                                m0 + sl * s0 >= fest &&
                                m1 + sl * s1 >= fest &&
                                m2 + sl * s2 >= fest &&
                                m0 + sr * s0 >= fest &&
                                m1 + sr * s1 >= fest &&
                                m2 + sr * s2 >= fest;
                        }
                        if (innen) {
                            buf[zeile + cl]++;
                            buf[zeile + cr + 1]--;
                        } else {
                            // kein festes Inneres: die Zeile läuft von ihrer Mitte aus
                            cr = boden((lo + hi) * 0.5);
                            if (!(cr >= xa)) cr = xa;
                            if (cr > xb) cr = xb;
                            cl = cr + 1;
                        }
                        for (let x = cl - 1; x >= xa; x--) {
                            const sx = x + 0.5;
                            const n0 = (bx - sx) * (qy - sy) - (by - sy) * (qx - sx),
                                n1 = (qx - sx) * (ay - sy) - (qy - sy) * (ax - sx);
                            const g0 = sg * n0,
                                g1 = sg * n1,
                                g2 = fa - g0 - g1;
                            proben++;
                            if (g0 >= fest && g1 >= fest && g2 >= fest) {
                                buf[zeile + x]++;
                                buf[zeile + x + 1]--;
                            } else if (g0 > -fest && g1 > -fest && g2 > -fest) {
                                // der Saum: das Urteil der Quotienten, wie es stand
                                if (!(g0 < 0 || g1 < 0 || 1 - n0 / fl - n1 / fl <= 0)) {
                                    buf[zeile + x]++;
                                    buf[zeile + x + 1]--;
                                }
                            } else if ((g0 <= -fest && s0 >= 0) || (g1 <= -fest && s1 >= 0) || (g2 <= -fest && s2 >= 0))
                                break;
                        }
                        for (let x = cr + 1; x <= xb; x++) {
                            const sx = x + 0.5;
                            const n0 = (bx - sx) * (qy - sy) - (by - sy) * (qx - sx),
                                n1 = (qx - sx) * (ay - sy) - (qy - sy) * (ax - sx);
                            const g0 = sg * n0,
                                g1 = sg * n1,
                                g2 = fa - g0 - g1;
                            proben++;
                            if (g0 >= fest && g1 >= fest && g2 >= fest) {
                                buf[zeile + x]++;
                                buf[zeile + x + 1]--;
                            } else if (g0 > -fest && g1 > -fest && g2 > -fest) {
                                if (!(g0 < 0 || g1 < 0 || 1 - n0 / fl - n1 / fl <= 0)) {
                                    buf[zeile + x]++;
                                    buf[zeile + x + 1]--;
                                }
                            } else if ((g0 <= -fest && s0 <= 0) || (g1 <= -fest && s1 <= 0) || (g2 <= -fest && s2 <= 0))
                                break;
                        }
                    }
                }
            // die Stufen laufen durch: je Pixel seine Lagen (gezählt wie zuvor in 16 Bit)
            let lagen = 0,
                treffer = 0;
            for (let i = 0; i < W * H; i++) {
                lagen += buf[i];
                treffer += lagen;
                const z = lagen & 65535;
                if (z) {
                    sQ += z;
                    nQ++;
                }
            }
            Z.proben += proben;
            Z.treffer += treffer;
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
    // die Facetten-Ebenen deterministisch — er ist Pflicht (G2.3, Welle SAMEN: bis hier zog ein Ruf ohne ihn still aus
    // Math.random). Rückgabe: eine THREE.BufferGeometry (Radius ~size).
    function buildBoulderGeometry(THREE, noise3, P, seq) {
        if (!THREE || !THREE.IcosahedronGeometry) return null;
        if (typeof seq !== "function")
            throw new Error("phyto-core buildBoulderGeometry: ohne Strom `seq` (der Stein zieht nur aus seinem Samen)");
        const rnd = seq;
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
        geo = eckenVerschmelzen(geo); // die Ecken teilen sich (w5-pipeline: das Gesetz, kein Addon — bis hier nur, wo eines geladen war)
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

    // DER FELSTURM (landmarken-geologie-5, erleben.spieler.wegfindung#1): die Gestalt der Landmarke in ihrer Größe, in Welt-Metern
    // — bis hier zeichnete das Studio den Turm als `zacken` (ein Block ≤ 0,48 m). Ein Ring-Körper über der Höhe: der Querschnitt ist
    // das Rechteck zweier senkrechter Kluft-Scharen (gerundet als Superellipse, Exponent `kluft`); die Schichtung teilt ihn in Bänke
    // ungleicher Dicke (0,5–1,5 · `bankM`), jede gegen die nächste versetzt, die Fugen wittern als Kehlen aus; 2–4 Klüfte reißen als
    // senkrechte Rinnen von oben ein; das Profil verjüngt sich und neigt sich, die härtere Deckschicht kragt als Kopf aus, der Gipfel
    // ist flach gerundet; der Fuß reicht 0,6 m unter den Boden. `P`: { hoehe, breite, tiefe, bankM, strat, rough, seed, detail,
    // dreiecke } (Meter; `dreiecke` die Zeile der Stufe). Die Form ist gesetz-gleich je noise3 wie der Stein (`buildBoulderGeometry`).
    // `seq` (0..1) ist Pflicht. → eine THREE.BufferGeometry, Boden y 0, Gipfel y = hoehe. Leser: foundry-core `buildFelsturm`.
    function buildFelsturmGeometry(THREE, noise3, P, seq) {
        if (!THREE || !THREE.BufferGeometry) return null;
        if (typeof seq !== "function")
            throw new Error("phyto-core buildFelsturmGeometry: ohne Strom `seq` (der Turm zieht nur aus seinem Samen)");
        const H = P.hoehe,
            A = P.breite / 2,
            B = P.tiefe / 2;
        if (!(H > 0 && A > 0 && B > 0))
            throw new Error(`phyto-core buildFelsturmGeometry: Maß fehlt (hoehe ${H}, breite ${P.breite}, tiefe ${P.tiefe})`);
        const n3 = typeof noise3 === "function" ? noise3 : (x, y, z) => Math.sin(x * 1.7 + y * 2.3 + z * 3.1) * 0.5;
        const detail = Math.max(1, P.detail || 6);
        const NS = detail >= 6 ? 16 : detail >= 4 ? 12 : 8; // Segmente je Ring
        // Die Ringe stehen im halben Bank-Abstand (jede Fuge trifft einen Ring), höchstens so viele, wie die Zeile der Stufe trägt
        // (`P.dreiecke`: 2 · NS je Band und 2 · NS die Kappen); darüber teilt die Höhe gleich.
        const bankM = P.bankM > 0 ? P.bankM : 1.6;
        const NRmax = P.dreiecke > 0 ? Math.max(6, Math.floor((P.dreiecke - 2 * NS) / (2 * NS)) - 1) : 12 * detail;
        const NR = Math.max(6, Math.min(NRmax, Math.ceil(H / (bankM / 2))));
        const dR = H / NR;
        const off = (P.seed || 0) * 13.7;
        const strat = P.strat != null ? P.strat : 0.6,
            rough = P.rough != null ? P.rough : 0.5;
        const kluft = 3 + 3 * seq(); // die Ecken der Kluft-Scharen: 3 rund … 6 kantig
        const dreh = seq() * Math.PI; // die Richtung der Scharen
        const verj = 0.12 + 0.2 * seq(); // die Verjüngung zum Gipfel
        const neig = (seq() - 0.5) * 0.5, // die Neigung: der Gipfel steht bis ± ¼ Breite neben dem Fuß
            neigR = seq() * 2 * Math.PI;
        const kopf = 0.03 + 0.09 * seq(); // die Deckschicht kragt aus
        const baenke = [];
        for (let y = 0; y < H; ) {
            const b = bankM * (0.5 + seq());
            baenke.push({ y0: y, kehle: strat * (0.04 + 0.1 * seq()), dx: (seq() - 0.5) * 0.12, dz: (seq() - 0.5) * 0.12 });
            y += b;
        }
        const klueft = [];
        for (let k = 0, NK = 2 + Math.floor(seq() * 3); k < NK; k++)
            klueft.push({ i: Math.floor(seq() * NS), tief: 0.08 + 0.14 * seq(), bis: 0.3 + 0.7 * seq() });
        const kappe = Math.min(0.1, 2 / H);
        const FUSS = -0.6;
        const profil = (t) => {
            let s = 1 - verj * t;
            if (t > 0.78) s += kopf * Math.min(1, (t - 0.78) / 0.05);
            if (t >= 1 - kappe) s *= Math.cbrt(Math.max(0, 1 - ((t - (1 - kappe)) / kappe) ** 3));
            return s;
        };
        const bankBei = (y) => {
            let k = 0;
            while (k + 1 < baenke.length && baenke[k + 1].y0 <= y) k++;
            return k;
        };
        const fbm = (x, y, z) => n3(x, y, z) * 0.6 + n3(x * 2.3, y * 2.3, z * 2.3) * 0.3 + n3(x * 5.1, y * 5.1, z * 5.1) * 0.1;
        const pos = [];
        const mitte = (t, bk) => [
            neig * A * t ** 1.5 * Math.cos(neigR) + bk.dx * A,
            neig * B * t ** 1.5 * Math.sin(neigR) + bk.dz * B,
        ];
        const NRinge = NR + 2;
        for (let j = 0; j < NRinge; j++) {
            const y = j === 0 ? FUSS : ((j - 1) / NR) * H;
            const t = Math.max(0, y) / H;
            const k = bankBei(y);
            const bk = baenke[k];
            // die Fuge: der Ring, der ihr am nächsten steht, trägt die Kehle der Bank über ihr
            const naechste = k + 1 < baenke.length && baenke[k + 1].y0 - y < dR / 2 ? baenke[k + 1] : y - bk.y0 < dR / 2 && k > 0 ? bk : null;
            const s = profil(t) * (naechste ? 1 - naechste.kehle : 1) * (j === 0 ? 1.08 : 1);
            const [cx, cz] = mitte(t, bk);
            for (let i = 0; i < NS; i++) {
                const th = (i / NS) * 2 * Math.PI;
                const c = Math.cos(th),
                    d = Math.sin(th);
                let r = 1 / ((Math.abs(c) / A) ** kluft + (Math.abs(d) / B) ** kluft) ** (1 / kluft);
                for (const kl of klueft) {
                    if (t < 1 - kl.bis) continue;
                    const di = Math.min((i - kl.i + NS) % NS, (kl.i - i + NS) % NS);
                    if (di === 0) r *= 1 - kl.tief;
                    else if (di === 1) r *= 1 - kl.tief * 0.35;
                }
                const x0 = r * c,
                    z0 = r * d;
                const rr = s * (1 + rough * 0.18 * fbm(x0 / 6 + off, y / 5, z0 / 6));
                const x = x0 * rr + cx,
                    z = z0 * rr + cz;
                pos.push(x * Math.cos(dreh) - z * Math.sin(dreh), y, x * Math.sin(dreh) + z * Math.cos(dreh));
            }
        }
        const unten = pos.length / 3;
        const [fx, fz] = mitte(0, baenke[0]);
        pos.push(fx * Math.cos(dreh) - fz * Math.sin(dreh), FUSS, fx * Math.sin(dreh) + fz * Math.cos(dreh));
        const oben = unten + 1;
        const [gx, gz] = mitte(1, baenke[baenke.length - 1]);
        pos.push(gx * Math.cos(dreh) - gz * Math.sin(dreh), H, gx * Math.sin(dreh) + gz * Math.cos(dreh));
        const idx = [];
        for (let j = 0; j < NRinge - 1; j++)
            for (let i = 0; i < NS; i++) {
                const a = j * NS + i,
                    b = j * NS + ((i + 1) % NS),
                    c = a + NS,
                    d = b + NS;
                idx.push(a, c, b, b, c, d);
            }
        const L = (NRinge - 1) * NS;
        for (let i = 0; i < NS; i++) {
            idx.push(unten, i, (i + 1) % NS);
            idx.push(oben, L + ((i + 1) % NS), L + i);
        }
        const geo = new THREE.BufferGeometry();
        geo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
        geo.setIndex(idx);
        geo.computeVertexNormals();
        return geo;
    }

    // DER FELSBOGEN (landmarken-geologie-5, erleben.spieler.wegfindung#1): das Felstor in seiner Größe, in Welt-Metern — bis hier
    // zeichnete das Studio ihn als `zacken` (ein Block ≤ 0,48 m, ohne Öffnung). Ein Block mit Loch, wie der Sandstein ihn
    // auswittert: Ringe um die Mitte der Öffnung von Fuß zu Fuß, innen die halbe Ellipse der Öffnung (halbe Spannweite · lichte
    // Höhe), außen die kantige Superellipse des Blocks (Exponent 2,6–4,5: halbe Spannweite + Pfeiler-Stärke · lichte Höhe +
    // Scheitel-Stärke), die Deckschicht leicht geneigt; der Querschnitt ist die Superellipse aus Stärke (radial) und Tiefe (quer, z),
    // die Füße sind tiefer als der Scheitel; die Schichtung kerbt waagrechte Fugen ungleicher Bänke (0,5–1,5 · `bankM`), das
    // Rauschen wittert; die Füße reichen 0,6 m unter den Boden. `P`: { spann, lichte, staerke,
    // tiefe, bankM, strat, rough, seed, detail, dreiecke } (Meter; `dreiecke` die Zeile der Stufe). `seq` (0..1) ist Pflicht.
    // → eine THREE.BufferGeometry, Boden y 0, die Öffnung um x 0. Leser: foundry-core `buildFelsbogen`.
    function buildFelsbogenGeometry(THREE, noise3, P, seq) {
        if (!THREE || !THREE.BufferGeometry) return null;
        if (typeof seq !== "function")
            throw new Error("phyto-core buildFelsbogenGeometry: ohne Strom `seq` (der Bogen zieht nur aus seinem Samen)");
        const S = P.spann,
            Hl = P.lichte,
            T = P.staerke,
            D = P.tiefe;
        if (!(S > 0 && Hl > 0 && T > 0 && D > 0))
            throw new Error(`phyto-core buildFelsbogenGeometry: Maß fehlt (spann ${S}, lichte ${Hl}, staerke ${T}, tiefe ${D})`);
        const n3 = typeof noise3 === "function" ? noise3 : (x, y, z) => Math.sin(x * 1.7 + y * 2.3 + z * 3.1) * 0.5;
        const detail = Math.max(1, P.detail || 6);
        const NS = detail >= 6 ? 16 : detail >= 4 ? 12 : 8; // Segmente je Ring
        const strat = P.strat != null ? P.strat : 0.6,
            rough = P.rough != null ? P.rough : 0.5,
            bankM = P.bankM > 0 ? P.bankM : 1.6;
        const off = (P.seed || 0) * 13.7;
        const TF = T * (1.8 + 0.8 * seq()); // die Pfeiler-Stärke am Fuß
        const DF = 1 + 0.4 * seq(); // die Füße sind tiefer als der Scheitel
        const kluft = 3 + 3 * seq(); // die Ecken des Querschnitts: 3 rund … 6 kantig
        const nO = 2.6 + 1.9 * seq(); // die Kanten des Blocks: 2,6 rund … 4,5 kantig
        const kipp = (seq() - 0.5) * 0.12; // die Deckschicht neigt sich (± 6 % je Seite)
        const [Ai, Bi, Ao, Bo] = [S / 2, Hl, S / 2 + TF, Hl + T];
        // je Winkel θ um die Mitte der Öffnung: innen die Ellipse, außen der Block — Mitte, Stärke und Tiefe des Rings
        const lage = (th) => {
            const c = Math.cos(th),
                s = Math.sin(th);
            const ri = 1 / Math.sqrt((c / Ai) ** 2 + (s / Bi) ** 2);
            const ro = (1 + kipp * c) / ((Math.abs(c) / Ao) ** nO + (Math.abs(s) / Bo) ** nO) ** (1 / nO);
            return { c, s, rm: (ri + ro) / 2, t: ro - ri, d: D * (1 + (DF - 1) * (1 - Math.abs(s))) };
        };
        const fugen = [];
        for (let y = bankM * (0.5 + seq()); y < Bo * 1.1; y += bankM * (0.5 + seq())) fugen.push({ y, kehle: strat * (0.04 + 0.1 * seq()) });
        const [a, b] = [(Ai + Ao) / 2, (Bi + Bo) / 2];
        // die Ringe längs der Linie (Umfang der halben Ellipse nach Ramanujan) im halben Bank-Abstand, höchstens so viele, wie die
        // Zeile der Stufe trägt (`P.dreiecke`: 2 · NS je Band und 2 · NS die Kappen der Füße)
        const L = (Math.PI / 2) * (3 * (a + b) - Math.sqrt((3 * a + b) * (a + 3 * b)));
        const NRmax = P.dreiecke > 0 ? Math.max(12, Math.floor((P.dreiecke - 2 * NS) / (2 * NS)) - 1) : 12 * detail;
        const NR = Math.max(12, Math.min(NRmax, Math.ceil(L / (bankM / 2))));
        const FUSS = -0.6;
        const fbm = (x, y, z) => n3(x, y, z) * 0.6 + n3(x * 2.3, y * 2.3, z * 2.3) * 0.3 + n3(x * 5.1, y * 5.1, z * 5.1) * 0.1;
        const pos = [];
        const ring = (cx, cy, nx, ny, t, d) => {
            // der Querschnitt in der Ebene (−n, z): −n zeigt zur Öffnung, so dreht der Ring wie der des Turms (Fuß → oben)
            for (let i = 0; i < NS; i++) {
                const ph = (i / NS) * 2 * Math.PI;
                const c = Math.cos(ph),
                    s = Math.sin(ph);
                const r = 1 / ((Math.abs(c) / (t / 2)) ** kluft + (Math.abs(s) / (d / 2)) ** kluft) ** (1 / kluft);
                let x = cx - nx * r * c,
                    y = cy - ny * r * c,
                    z = r * s;
                let k = 1;
                for (const f of fugen) {
                    const dj = Math.abs(y - f.y);
                    if (dj < 0.35) k = Math.min(k, 1 - f.kehle * (1 - dj / 0.35));
                }
                const rr = k * (1 + rough * 0.18 * fbm(x / 6 + off, y / 5, z / 6));
                pos.push(cx + (x - cx) * rr, cy + (y - cy) * rr, z * rr);
            }
        };
        // Ring 0 der linke Fuß unter dem Boden, Ringe 1..NR um die Öffnung (θ von π bis 0), Ring NR + 1 der rechte Fuß
        const [fl, fr] = [lage(Math.PI), lage(0)];
        ring(-fl.rm, FUSS, -1, 0, fl.t * 1.08, fl.d);
        for (let j = 0; j < NR; j++) {
            const R = lage(Math.PI * (1 - j / (NR - 1)));
            ring(R.rm * R.c, R.rm * R.s, R.c, R.s, R.t, R.d);
        }
        ring(fr.rm, FUSS, 1, 0, fr.t * 1.08, fr.d);
        const NRinge = NR + 2;
        const links = pos.length / 3;
        pos.push(-fl.rm, FUSS, 0);
        const rechts = links + 1;
        pos.push(fr.rm, FUSS, 0);
        const idx = [];
        for (let j = 0; j < NRinge - 1; j++)
            for (let i = 0; i < NS; i++) {
                const p = j * NS + i,
                    q = j * NS + ((i + 1) % NS),
                    c = p + NS,
                    d = q + NS;
                idx.push(p, c, q, q, c, d);
            }
        const E = (NRinge - 1) * NS;
        for (let i = 0; i < NS; i++) {
            idx.push(links, i, (i + 1) % NS);
            idx.push(rechts, E + ((i + 1) % NS), E + i);
        }
        const geo = new THREE.BufferGeometry();
        geo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
        geo.setIndex(idx);
        geo.computeVertexNormals();
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
    // Mit `ziel` null und `fuss` (der Solitär und der Trauf, FREISTAND.fuss) behält der Baum seine gewachsene Höhe h0, und die
    // Krone streckt sich lotrecht über [kb, h0], bis ihr tiefster Punkt (Ast-Ansatz oder hängendes Blatt, yk) bei fuss · h0 steht:
    // mit a = (yk − yb) / (h0 − yb) ist kb = (fuss · h0 − a · h0) / (1 − a) — der Stamm unter ihr wird kürzer (laub-kante-4,
    // der Waldmantel; bis dahin hob der Ansatz die Krone nur und senkte sie nie).
    // Mit `krone` (der Bestand, BESTAND.krone) hebt der Hub Stamm UND Krone: der Ast-Ansatz yb steht danach bei (1 − krone) ×
    // ziel, der Stamm streckt sich bis dorthin, und die Krone [yb, h0] streckt sich lotrecht über [(1 − krone) · ziel, ziel] —
    // ein Bestandsbaum trägt seine Krone über den oberen Teil seiner Höhe, nie als Ballen auf dem Stiel (Spike T1). Dann
    // ist der Hub DES SCHAFTS nur, was der Stamm unter der Krone wuchs (kb − yb): die gestreckte Krone ist Krone, und die
    // Sichthöhe (Höhe ohne Hub, der Wirt `_foundryGruppenHoehe`) misst sie mit — sonst las die Stufenwahl die Bestands-
    // Buche mit 8–9 statt 16–18 m und die Eiche unter der Referenz-Höhe (T2-Nachbesserung, gate:foundry-crossfade).
    // DIE JUGEND TRÄGT KEINEN SCHAFT (`jung`, stoffe.K5#2, JUGEND in `treeParams`): den Schaft schuf der Schatten des
    // Bestands, der die unteren Äste nahm — der Jungwuchs steht im Licht, seine Krone reicht zum Grund. Er wächst in seiner
    // Form auf dieselbe Höhe h0 + dh (das Maß der Art, die Welt pflanzt ihn in `alter` × seiner Größe, gekappt auf das Maß seiner
    // Kohorte: `SUKZESSION.kappe` im Stamm, w13-jung-gestalt): jeder Punkt × (h0 +
    // dh) / h0 um den Fuß, die Radien bleiben die des Welt-Maßes (der Stamm aus der Krone, die Konifere H/D = hd); kein Hub (Rückgabe 0, die Sichthöhe misst die
    // ganze Gestalt). Bis w12-riesenhalm hob der Hub das junge Skelett — weniger Ordnungen, die halbe Form-Höhe — auf die
    // Höhe des gewachsenen: je jünger, desto länger der kahle Schaft unter einer kleinen Krone (Kronen-Fuß der Tanne @0,06
    // bei 0,51 H, gewachsen 0,34 H; die Fichte 0,40 gegen 0,26) — aus dem Jungwuchs der Narbe ragten Riesenhalme.
    function schaftHub(segs, leaves, runMeta, ziel, krone, jung, fuss) {
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
        const dh = ziel === null ? 0 : ziel - h0;
        const frei = ziel === null && fuss > 0 && fuss < 1;
        if (!(dh > 0) && !frei) return 0;
        if (jung) {
            const [k, gewachsen] = [(h0 + dh) / h0, new Set()];
            const wachse = (q) => gewachsen.has(q) || (gewachsen.add(q), (q[0] *= k), (q[1] *= k), (q[2] *= k));
            for (const q of segs) (wachse(q.p0), wachse(q.p1));
            for (const l of leaves) wachse(l.pos);
            return 0;
        }
        const streck = (yb + dh) / yb;
        let kb = krone > 0 ? (1 - krone) * (h0 + dh) : 0;
        if (frei) {
            let yk = yb;
            for (const l of leaves) yk = Math.min(yk, l.pos[1]);
            const a = (yk - yb) / (h0 - yb);
            kb = Math.max(1e-3 * h0, (fuss * h0 - a * h0) / (1 - a));
        }
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
            birch: 0x6a8e37, // Laubkrone im Band der Karte 0,15–0,26 (Betts & Ball 1997, BOREAS: Espe 0,15): 0x8ab84a trug den Baum auf 0,294, derselbe Ton linear × 0,57
            willow: 0x6a9a3a,
            smooth: 0x4a7a2c,
        };
        const bc = BC[barkType];
        const ph = {
            kind: isShrub ? "shrub" : "tree",
            conifer: isCon,
            height,
            barkType,
            leafShape,
            barkA: bc[0],
            barkB: bc[1],
            leafCol: LC[barkType],
            coniferDroop: isCon ? clamp(0.13 + trop * 0.25, 0.05, 0.5) : undefined,
            // der Quirl-Abstand (Anteil der Form-Höhe): Fichte 0,0395 · Tanne 0,0385 → ~1 m im Welt-Maß, ein Quirl je zwei bis drei
            // Jahrestrieben (Picea abies / Abies alba im Altbestand 0,3–0,5 m je Jahr; UNGEPRÜFT je Art) — bis laub-kante
            // 0,10–0,15 (2,9 m, sieben Quirle je Baum: im Kegel standen sie als Büschel am kahlen Stamm)
            whorlSpacing: isCon ? lerp(0.035, 0.05, 1 - leaf) : undefined,
            crownBase: isCon
                ? lerp(0.1, 0.48, clamp((0.55 - slim) / 0.45, 0, 1))
                : isShrub
                  ? 0
                  : lerp(0, 0.32, clamp((api - 0.25) * 1.6, 0, 1)),
            flare: isShrub ? 0.14 : lerp(0.16, 0.52, 1 - slim),
            roots: Math.round(lerp(4, 6, 1 - slim)),
            basalStems: isShrub ? Math.round(lerp(STRAUCH_WUCHS.triebe[0], STRAUCH_WUCHS.triebe[1], api / 0.22)) : 1,
            maxDepth: Math.round(lerp(7, 10, leaf * 0.4 + slim * 0.3 + api * 0.3)),
            windGain: isCon ? lerp(0.45, 0.7, slim) : lerp(0.85, 1.3, slim * 0.5 + weep * 0.5),
        };
        // DIE KRONE DER KONIFERE AUS IHREM PHÄNOTYP (fachwerk-buehne, gate:studio-huelle H3): die Dials machen jeden Baum zur
        // Konifere (api > 0,72), ihre Zeile der Kronen-Tafel trug bis hier nur die Art (`art.ph.krone`) — die Eiche des Terrain-
        // Studios mit api 1 brach im Bau (`konifereKroneAnteil`), der Zug schrieb keinen Rückgängig-Schritt. Die Rinde nennt die
        // Zeile (Mammut die Sequoia, sonst die Fichte, FOREST_PACK.crown); die Zeile der Art gilt darüber (`artPhaenotyp`).
        if (isCon) ph.krone = barkType === "sequoia" ? "mammut" : "fichte";
        return ph;
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
    // danach nur beim Totholz die Bruch-Höhe — derselbe Same ⇒ dieselbe Gestalt. `alter` (stoffe.K5#2, optional): die
    // Jugend-Gestalt desselben Individuums (JUGEND unten); ohne sie der gewachsene Baum, byte-gleich. `gestalten` (K20,
    // optional): die Bestand-Gestalten V der Art (lod.budget.gestalten, die Render-Zeile trägt der Wirt) — der Same V+1 IST
    // ihr Solitär (`solitaerGestalt`) und wächst frei, für jeden Leser derselbe Baum: Bühne, Werk und Wald des Studios, die
    // Welt, ihr Bäcker der Karte und der gefühlte Baum (bis w12-eiche-same prägte ihn der Wirt, die Bühne nie: die Eiche
    // Same 3 stand im Studio als Bestand, in der Welt als Solitär). Ohne `gestalten` kein Solitär, byte-gleich.
    function konifereKroneAnteil(ph) {
        const r = ph.krone && FOREST_PACK.crown[ph.krone];
        if (!(r > 0) || !(ph.hoeheM > 0))
            throw new Error(
                `[phyto] die Konifere trägt keine Zeile der Kronen-Tafel (ph.krone ${ph.krone}, hoeheM ${ph.hoeheM})`
            );
        return r / ph.hoeheM;
    }
    function treeParams(dials, seedInt, stufe, art, weltSkala, alter, gestalten) {
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
        const lf =
                rezept === 0
                    ? 1
                    : rezept === 1
                      ? ph.conifer
                          ? 0.0265
                          : ph.kind === "shrub"
                            ? STRAUCH_WUCHS.blatt[0]
                            : 0.21
                      : 0.16,
            ls =
                rezept === 0
                    ? 1
                    : rezept === 1
                      ? ph.conifer
                          ? 1.62
                          : ph.kind === "shrub"
                            ? STRAUCH_WUCHS.blatt[1]
                            : 2.05
                      : 4.0;
        const lcol = hexOffsetHSL(ph.leafCol, (IR() - 0.5) * 0.05, (IR() - 0.5) * 0.1, (IR() - 0.5) * 0.08);
        const P = {
            kind: ph.kind,
            apical: clamp(api + O(0.1), 0, 1),
            delta: delta + O(0.1),
            slim: clamp(slim + O(0.1), 0, 1),
            trop: trop + O(0.1),
            leafD: clamp(leaf * J(0.16), 0.05, 1),
            _lf: lf,
            _ls: ls, // das Blatt-Maß der Stufe — die Laub-Krone der Baum-L1 rechnet es zurück (foundry-core, die Krone der L0)
            height: ph.height * J(0.16),
            conifer: ph.conifer,
            coniferDroop: ph.coniferDroop,
            crownBase: ph.crownBase,
            whorlSpacing: ph.whorlSpacing,
            // DIE KRONE DER KONIFERE (laub-kante): ihr Radius am Kronen-Fuß als Anteil der Höhe — die Zeile ihrer Art (`ph.krone`)
            // in der EINEN Kronen-Tafel FOREST_PACK.crown (m, Größe 1) durch die Höhe der Größe 1 (`ph.hoeheM`); growSkeleton
            // `koniferenKegel` stellt jeden Ast in diesen Kegel. Eine Konifere ohne ihre Zeile bricht laut (KERN-PFLICHT).
            kroneAnteil: ph.conifer ? konifereKroneAnteil(ph) : undefined,
            flare: ph.flare,
            // Das Totholz trägt seine L1 mit den Wurzeln seiner L0 (w28-nadel-stufe, lod.K5): ohne Krone ist der Fuß die halbe
            // Silhouette — vier dickere Wurzeln statt fünf standen am Haushalt 12 m über einen Bildpunkt neben der L0.
            roots: ph.roots * (rezept === 0 || (ph.tot && rezept === 1) ? 1 : rezept === 1 ? 0.8 : 0.6),
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
        // mit dem Höhen-Wurf seiner Gestalt) und die Welt-Skala, mit der der Wald ihn pflanzt (`weltSkala`, Meter je
        // Vorlagen-Einheit — die Render-Zeile trägt der Wirt) — `growSkeleton` lässt ihn so hoch wachsen. Der Stamm des
        // Laubbaums folgt aus seiner Krone (w28-stamm-krone, STAMM_KRONE; `ph.solitaer`: die Art steht nie im Bestand — Weide
        // und Karst), die Konifere trägt die Schlankheit H/D ihres Standorts (`ph.hd`). Kein Wurf (der Zufalls-Strom bleibt);
        // ohne Welt-Skala baut er in der Form-Höhe.
        if (ph.kind === "tree" && ph.hoeheM > 0 && !ph.tot && weltSkala > 0) {
            P.hoeheM = ph.hoeheM * (P.height / ph.height);
            if (ph.conifer) P.hd = FOREST_PACK.schlank[ph.krone];
            else if (ph.hd != null)
                throw new Error("[phyto] der Laubbaum trägt keine Schlankheit hd: sein Stamm folgt aus der Krone");
            if (ph.solitaer) P.solitaer = 1;
            P.weltSkala = weltSkala;
        }
        // DIE JUGEND-GESTALT (stoffe.K5#2): `alter` ∈ (0, 1) ist der Jungwuchs desselben Individuums (derselbe Same, derselbe
        // Strom, kein Wurf mehr) — der Sämling aus dem Stubben, der Wald nach dem Brand; seine Größe ist `alter` × die des
        // gewachsenen (die Welt pflanzt ihn in dieser Skala, die Vorlage bleibt im Maß der Art: Raster, Naht und Wind messen in
        // ihr). Die Gestalt der Jugend: die Krone reicht zum Grund (der Kronenansatz × alter: kein Schatten hat die unteren Äste
        // genommen), er verzweigt in weniger Ordnungen (die Tiefe fällt bis auf JUGEND.tiefeAb ihrer selbst, nie unter
        // JUGEND.tiefe), der Anlauf wächst mit, und das Blatt wächst langsamer als der Baum (in der Vorlage × alter^−¼ — der
        // Sämling trägt wenige, große Blätter). Den Schaft des Bestands trägt die Jugend nie (`schaftHub` mit `jung`). Unter
        // fünf Ordnungen trägt ein Sämling sein Laub nur am Wipfel: der Karst @0,06 mit vier stand mit dem Kronen-Fuß bei
        // 0,34–0,47 H, gewachsen 0,12–0,25 H (gate:phyto-core „Jugend", w12-riesenhalm) — bis dahin hielt JUGEND.tiefe 3.
        if (alter > 0 && alter < 1 && ph.kind === "tree" && !ph.tot) {
            P.alter = alter;
            if (P.crownBase) P.crownBase *= alter;
            if (P.flare) P.flare *= alter;
            P.leafSize *= Math.pow(alter, -0.25);
            P.maxDepth = Math.max(
                JUGEND.tiefe,
                Math.round(P.maxDepth * (JUGEND.tiefeAb + (1 - JUGEND.tiefeAb) * alter))
            );
        }
        const T = solitaerGestalt(art && art.kind, gestalten);
        if (T && Math.floor(seedInt) === T) P.freistand = 1;
        return P;
    }
    const JUGEND = Object.freeze({ tiefe: 5, tiefeAb: 0.5 });

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
    // DIE TIEFE DER KARTE (w4-laub-karte): je Texel, wie weit die gezeichnete Fläche der Gestalt vor (+) oder hinter (−) der
    // Ebene durch die Mitte des Rahmens quer zum Blick ihrer Ansicht liegt — w in Metern der Vorlage, gespeichert als
    // t = ½ + w / (2·(hW + hH)) ∈ [0, 1] (kein Punkt des Rahmen-Zylinders liegt weiter als hW + hH von seiner Mitte). Die Bühne
    // schreibt t aus ihrer Kamera (`_karteBuehne`), die Karte liest w daraus (`karteTiefeVersatz`): als Tiefe ihrer Fläche
    // (Pixel-Tiefen-Versatz) und als Ort ihres empfangenen Schattens — eine Blick-Parallaxe trägt EINE Schicht nicht (die zwei
    // Ansichten 45° auseinander suchten einander im Schatten). EINE Formel über einer Algebra (WIND_ZAHLEN: Linse und CPU, die
    // TSL-Algebra: Bühne und Stoff).
    function karteTiefe(A, w, hW, hH) {
        return A.add(A.k(0.5), A.mul(w, A.pow(A.mul(A.k(2), A.add(hW, hH)), A.k(-1))));
    }
    function karteTiefeVersatz(A, t, hW, hH) {
        return A.mul(A.add(A.mul(t, A.k(2)), A.k(-1)), A.add(hW, hH));
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

    // DAS VERSCHMELZEN DER KERNE (w5-pipeline, pipeline.K5): die Kerne bauen auf der Engine der Welt (three r184 im
    // Foundry-Faden wie im Haupt-Faden) und hängen an keinem Addon — r128 hieß es mergeBufferGeometries, r184
    // mergeGeometries, und das Addon ist in keinem der beiden Fäden geladen. Das Gesetz ist die Rechnung, die jede
    // Golden-Stufe trägt (spec/asset-contract/v1, gemünzt unter r128 BufferGeometryUtils): die Attribute Teil um Teil
    // hintereinander (Typ, itemSize, normalized je Name gleich), der Index um die Ecken davor versetzt, `mergedUserData`
    // die userData der Teile. Ungleiche Teile (Index, Namen, Zahl) brechen laut beim Namen.
    function geoVerschmelzen(geos) {
        const T = root.THREE;
        const mitIndex = geos[0].index !== null;
        const namen = Object.keys(geos[0].attributes);
        const aus = new T.BufferGeometry();
        const ud = (aus.userData.mergedUserData = []);
        for (let i = 0; i < geos.length; i++) {
            const g = geos[i];
            const n = Object.keys(g.attributes);
            if ((g.index !== null) !== mitIndex || n.length !== namen.length || n.some((k) => !namen.includes(k)))
                throw new Error(
                    "VERSCHMELZEN: Teil " + i + " trägt andere Attribute/Index als Teil 0 (" + n.join(",") + ")"
                );
            if (Object.keys(g.morphAttributes).length)
                throw new Error("VERSCHMELZEN: Teil " + i + " trägt Morph-Attribute");
            ud.push(g.userData);
        }
        if (mitIndex) {
            const idx = [];
            let vor = 0;
            for (const g of geos) {
                const a = g.index.array;
                for (let j = 0; j < g.index.count; j++) idx.push(a[j] + vor);
                vor += g.attributes.position.count;
            }
            aus.setIndex(idx);
        }
        for (const k of namen) {
            const a0 = geos[0].attributes[k];
            let n = 0;
            for (const g of geos) {
                const a = g.attributes[k];
                if (
                    a.isInterleavedBufferAttribute ||
                    a.array.constructor !== a0.array.constructor ||
                    a.itemSize !== a0.itemSize ||
                    a.normalized !== a0.normalized
                )
                    throw new Error("VERSCHMELZEN: das Attribut " + k + " ist ungleich gebaut");
                n += a.array.length;
            }
            const arr = new a0.array.constructor(n);
            let o = 0;
            for (const g of geos) {
                arr.set(g.attributes[k].array, o);
                o += g.attributes[k].array.length;
            }
            aus.setAttribute(k, new T.BufferAttribute(arr, a0.itemSize, a0.normalized));
        }
        return aus;
    }
    // Gleiche Ecken teilen einen Index (das Gesetz der Golden-Stufen, r128 mergeVertices): je Ecke ein Schlüssel aus
    // jedem Attribut-Wert × 10^log10(1/tol), ganzzahlig abgeschnitten (~~), die erste Ecke eines Schlüssels gewinnt; gelesen
    // wird das rohe Array (r184 `getX` entnormalisiert, r128 nie).
    function eckenVerschmelzen(geo, tol) {
        const T = root.THREE;
        tol = Math.max(tol == null ? 1e-4 : tol, Number.EPSILON);
        const mul = Math.pow(10, Math.log10(1 / tol));
        const ix = geo.getIndex();
        const namen = Object.keys(geo.attributes);
        if (Object.keys(geo.morphAttributes).length) throw new Error("VERSCHMELZEN: Morph-Attribute an den Ecken");
        const n = ix ? ix.count : geo.attributes.position.count;
        const neu = {};
        for (const k of namen) {
            if (geo.attributes[k].isInterleavedBufferAttribute)
                throw new Error("VERSCHMELZEN: " + k + " ist verschränkt");
            neu[k] = [];
        }
        const schluessel = {};
        const idx = [];
        let naechste = 0;
        for (let i = 0; i < n; i++) {
            const e = ix ? ix.array[i] : i;
            let h = "";
            for (const k of namen) {
                const a = geo.attributes[k];
                for (let c = 0; c < a.itemSize; c++) h += `${~~(a.array[e * a.itemSize + c] * mul)},`;
            }
            if (h in schluessel) idx.push(schluessel[h]);
            else {
                for (const k of namen) {
                    const a = geo.attributes[k];
                    for (let c = 0; c < a.itemSize; c++) neu[k].push(a.array[e * a.itemSize + c]);
                }
                schluessel[h] = naechste;
                idx.push(naechste++);
            }
        }
        const aus = geo.clone();
        for (const k of namen) {
            const a = geo.attributes[k];
            aus.setAttribute(k, new T.BufferAttribute(new a.array.constructor(neu[k]), a.itemSize, a.normalized));
        }
        aus.setIndex(idx);
        return aus;
    }

    // ===================== DER WALD-PLAN (Vorlagen-Ökologie, „Drähte statt Kopien" 08.07.) =====================
    // Die Pflanz-LOGIK des Waldes (Poisson-Darts · Stand-Dichte · Arten-Nische · reverse-J-
    // Größe · Mammut-Promotion) lebt EINMAL hier — im Vorlagen-Kern, neben den Rezepten, die
    // sie pflanzt. AnazhRealm ist nur noch der Boden: seine Welt-Reads (Oberfläche · Wasser ·
    // Slope · Feuchte · fbm) reisen als ctx-Funktionen herein. Γ5-treu: aller Zufall aus dem
    // seed-gebundenen Zell-Hash (forestCellRng), kein Math.random, keine Zeit.
    // Der Zell-Hash-RNG: reine Funktion von (cx,cz,seed) — alle Peers sehen denselben Wald. Die Saat der Zelle ist dieser Hash,
    // der Strom der EINE Generator (samen-core `mulberry32`).
    function forestCellRng(cx, cz, seedInt) {
        return mulberry32((Math.imul(cx | 0, 73856093) ^ Math.imul(cz | 0, 19349663) ^ seedInt) >>> 0);
    }
    // Vorlagen-`standDensity`: glatter Wald-↔-Lichtung-Gradient [0,1].
    // Shared fbm-Mix; Kontrast/Mittel per Mode (Host-Default byte-same bei 3-Arg-Aufruf).
    // Lab-Vorlage: clamp((d-0.5)*1.9+0.5,0,1) · Host-Studio: (d-0.5)*1.35+0.72.
    const FOREST_STAND = {
        lab: { contrast: 1.9, mid: 0.5 },
        host: { contrast: 1.35, mid: 0.72 },
    };
    // DER SOLITÄR (K20, nordstern §4.5: „Solitär gedrungener", Solitäreiche Marbach): der frei stehende Laubbaum trägt den
    // dicken Stamm seines breiten Schirms (STAMM_KRONE, w28-stamm-krone); die Schlankheit einer frei stehenden Konifere ist
    // hd · FREISTAND.hd ihrer Art im Bestand (Fichte 70 → 31,5; Bestand H/D 40–100) — growSkeleton liest `P.freistand`.
    // DER WALDMANTEL (laub-kante-4): frei steht ein Baum, der Licht von der Seite hat — die Richtungen seiner stehenden
    // Nachbarn näher als FREISTAND.abstand × die Summe der Kronen (der Wirt, `_forestStehtFrei`; Lichtkonkurrenz reicht über
    // die Kronen-Berührung, pack 1,16, hinaus, ab dem Doppelten fehlt sie) lassen eine Lücke von mindestens FREISTAND.seite
    // (`forestSeitenlicht`). Der Solitär (kein Nachbar, Lücke 2π) und der Baum am Trauf (der Bestand auf einer Seite, offen
    // zur anderen ≥ 120°) sind EIN Fall: das Seitenlicht hält die unteren Äste. Im Innern (Nachbarn ringsum, die größte
    // Lücke < 120°) trägt er den kahlen Schaft des Bestands. Bis laub-kante-4 machte JEDER Nachbar den Baum zum Bestand:
    // der Trauf stand mit kahlen Stämmen zur Wiese (Tafel-Pose, laub-kante Spielgang 6 rote Klassen).
    // fuss: der tiefste Blatt-Anker des freien Baums je Laub und Nadel als Anteil seiner Höhe — die Karten des Laubs hängen
    // tiefer als die Nadel-Quirle: der sichtbare Kronen-Fuß (L0, gate:pflanzen-nah) Buche 0,10 · Eiche 0,12 · Birke 0,18 ·
    // Fichte 0,10 (Marbach: kurzer dicker Stamm unter der tiefen Krone; ohne ihn stand die Krone als Busch auf dem Boden,
    // Blick-Sonde 12.10.). Bis laub-kante-4 hob der Ansatz 0,3 die Krone nur und senkte sie nie: die freie Fichte trug 0,28.
    // ab: die Gestalt des Solitärs (`solitaerGestalt`) — eine Baum-Art mit mindestens `ab` Bestand-Gestalten
    // (budget.gestalten, die Massen-Arten des Walds) trägt DAZU ihren Solitär als Gestalt V+1: der Bestand behält alle
    // V Individuen (kein Klon), der Solitär ist ein eigenes. Die Arten mit einer Gestalt (Weide, Mammut) tragen keinen.
    const FREISTAND = Object.freeze({
        hd: 0.45,
        abstand: 2,
        fuss: Object.freeze({ laub: 0.32, nadel: 0.12 }),
        seite: (2 * Math.PI) / 3,
        ab: 2,
    });
    // DAS SEITENLICHT (der Waldmantel): die größte Lücke (rad) zwischen den Richtungen `winkel` (rad, je stehendem Nachbarn)
    // rund um den Baum — ohne Nachbarn 2π. Rein; der EINE Leser des Freistands (`_forestStehtFrei`, gate:fernwald H).
    function forestSeitenlicht(winkel) {
        const n = winkel.length;
        if (!n) return 2 * Math.PI;
        const w = Array.from(winkel, (a) => a - 2 * Math.PI * Math.floor(a / (2 * Math.PI))).sort((a, b) => a - b);
        let gap = w[0] + 2 * Math.PI - w[n - 1];
        for (let i = 1; i < n; i++) gap = Math.max(gap, w[i] - w[i - 1]);
        return gap;
    }
    // DER BESTAND (T2, 16.10., nordstern §4.5 „hohe, schlanke Stämme im Bestand, breite Solitäre im Offenen"): ein Laubbaum,
    // der im Bestand steht (Welt-Maß, nicht frei, keine Konifere, keine Solitär-Art — Weide und Karst tragen `ph.solitaer`,
    // `bestandArt` ist der EINE Leser), wächst seine Seitenäste × BESTAND.seitenast (der
    // Nachbar nimmt die Seite, das Licht kommt von oben), und der Hub des Schafts hebt Stamm UND Krone: die Krone reicht über
    // BESTAND.krone der Höhe (schaftHub `krone`). Spike T1 (Mess-Wiese, Eiche · Birke · Buche): Kronenbreite/BHD 48–84 → 23–36
    // (Natur frei 17–26, Hemery 2005), Breite/Höhe 0,74–1,06 → 0,35–0,45, Kronen-Anteil 0,60–0,63, Karten −44 bis −60 %;
    // die Seitenäste ohne den Hub der Krone trugen 0,42–0,46 Kronen-Anteil (der Ballen auf dem Stiel).
    const BESTAND = Object.freeze({ seitenast: 0.6, krone: 0.6 });
    // Steht die Art im Bestand? Der Phänotyp `d` (artPhaenotyp) eines Laubbaums ohne `solitaer` — der EINE Leser für den
    // Wuchs (`growSkeleton`: P trägt dieselben Felder) und die Kamm-Krone des Wirts (`_kammKroneArten`).
    function bestandArt(d) {
        return !!d && !d.conifer && !d.solitaer;
    }
    // DER WUCHS DES STRAUCHS (w28-strauch-gestalt): ein Strauch ist kein Baum ohne Stamm, er ist ein Horst aus Trieben — jeder
    // basale Trieb trägt seine eigene Partie, die Krone liest als Lappen über einem unregelmäßigen Wipfel, belaubt bis zum Boden.
    // `triebe` die Zahl der Stockausschläge bei api 0 … 0,22 (Hasel, Holunder: 5–15); je Trieb sein Rang ρ ∈ [0, 1) — der
    // innere (ρ 0) steht steil und lang, der äußere bogig und kurz: `neigung` aus der Senkrechten (rad), `laenge` die erste
    // Rute je Rang (Anteil der halben Höhe); `staerke` der Trieb nach dem Pipe-Modell (der Wurzelhals teilt seine Fläche auf
    // die Triebe: r = trunkR · (1/N)^(1/Δ) · staerke); `leit` [Flächen-Anteil, Länge] des Leittriebs, der weiterwächst (der
    // Laubbaum verliert ihn: 0,3 / 0,6) — der Trieb belaubt sich entlang, keine kahle Rute unter einem schwebenden Ballen;
    // `spreizung` der Winkel seiner Seitenäste (rad; der Laubbaum 0,55–1,05 zur Kuppel), `seitenast` ihre Länge.
    // `blatt` [Stride, Maß] der Karten-Stufe (Rezept 1, Wahrnehmung ~ n·s²): mit dem Blatt-Maß des Baums (0,21 / 2,05) maß die
    // Karte 0,43 der Strauch-Höhe (Bäume 0,16–0,23) und schmolz jeden Lappen zur Hülle; die Schranke ist das Blatt selbst —
    // 4–16 cm am Strauch (gate:pflanzen-nah; Hasel 5–12 cm): bei 1,7 misst es 4,2 cm (0,9 trug 2,3 cm), die Karte 0,35 der Höhe.
    // Die Höhe des Horsts hält die des Laibs (5,0 Vorlagen-Einheiten mit den Karten), das Reisig der Mittel-Stufe ≥ 50 % ihrer
    // Dreiecke (57 %), die Nah-Stufe trägt die Zeile ihres Budgets (6 460 / 12 000), die Mittel-Stufe 704 / 1 100.
    // Bis hier: 4 Triebe à 0,6–0,85·trunkR, 0,12–0,3 rad, gleich lang, die Kuppel des Laubbaums — der Laib auf Beinen
    // (gate:laub-kante fimp:strauch:L2 0,348 Tafel-Pose / 0,273 Spielgang, Soll ≤ 0,22).
    const STRAUCH_WUCHS = Object.freeze({
        triebe: [12, 10],
        neigung: [0.15, 1.25],
        laenge: [0.75, 0.35],
        spreizung: 0.35,
        seitenast: 0.9,
        leit: [0.5, 0.95],
        staerke: [0.9, 1.1],
        blatt: [0.3, 1.7],
    });
    // Die Gestalt des Solitärs einer Art mit V Bestand-Gestalten (V+1), 0 = die Art trägt keinen. Leser: die Ableitung
    // (`treeParams`: der Same V+1 wächst frei), der Wirt (`_foundryGestalten`, `_ortWaehlt`), gate:asset-contract (jede
    // Gestalt der Welt unter ihrer Zeile).
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
    // wW = wet²·(1-dry)·0.8 im Saum (wet ≥ FOREST_PACK.ufer), sonst 0; Caller addiert waterProx²·6 (Host: feu im Saum, Lab: _wp).
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
        // Weide→erle: nur im Saum (`FOREST_PACK.ufer`, die Feuchte `wet` ist dort der Wasser-Abstand); Caller + waterProx²·6 im Saum
        const wW = wet >= FOREST_PACK.ufer ? wet * wet * (1 - dry) * 0.8 : 0;
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
    // Selbst-Ausdünnung (`forestSteht`: es stirbt, wen ein STEHENDER besserer Nachbar näher als pack·Schluss·(Ti+Tj) überwächst)
    // ist ein Matérn-III-Prozess: die Stehenden einer Krone T wachsen mit der Geburt t ∈ [0, 1] wie dρ/dt = λ·e^(−ρA) (die
    // Stehenden um einen Dart als Poisson-Feld genähert), ρ = ln(1 + λA)/A, A = π·(pack·Schluss)²·E[(T+Tj)²]; die Kronen greifen
    // im Schluss ineinander, die Deckung ist die Vereinigung ihrer Flächen Σ: 1 − e^(−Σ). Genähert (flach, Stand −0,2…0,8,
    // gepflanzt gegen Modell): 0 / 0 · 0,32 / 0,38 · 0,48 / 0,53 · 0,77 / 0,70 · 0,83 / 0,73 — UNSICHER ±0,1. Bis w28-laub-kante
    // (Matérn II, (1 − e^(−λA))/A, die Summe der Flächen) sättigte das Modell wie der Wald bei 1/A.
    // Die Kronen: T = Art-Krone × Größe — die Größe folgt dem Lebenslauf des Bestands (FOREST_ERTRAG): im Fleck der Phase u trägt
    // jede Art ihre Tafel-Größe (`forestErtragGroesse`), die Flecken einer Fläche sind gleichverteilt über u; die Deckung ist das
    // Mittel der Deckung je Phase (`_deckNP` Phasen in der Mitte ihrer Klasse), in jeder Phase der Matérn-Faktor je Art.
    // Befund 11.10.: das Dach las die
    // Geburt (0,90) als Deckung, der gepflanzte Bestand deckt 0,16 — die Ferne stand als geschlossenes Grün vor offenem Wald.
    // kronen = [[Gewicht, Kronen-Radius bei Größe 1, Art], …] (die Arten-Mischung am Ort; die Art nennt ihre Tafel, KERN-PFLICHT);
    // F = { cell, dartsPerCell, pack }. OHNE GARBAGE (K60): die Fern-Farbe ruft die Deckung je Abtastung einer Masche (Radeon kalt
    // bis zum ersten Bild ~70 000 Rufe) — die Größen je Art und Phase rechnet der Kern EINMAL je Art (`_deckGroessen`), je Ruf
    // nur die Summen: je Phase und Art EIN Logarithmus, je Phase EIN Exponential.
    const _deckNP = 12;
    const _deckGroessen = new Map();
    function _deckGroessenVon(sp) {
        let g = _deckGroessen.get(sp);
        if (!g) {
            g = new Float64Array(_deckNP);
            for (let p = 0; p < _deckNP; p++) g[p] = forestErtragGroesse(sp, (p + 0.5) / _deckNP);
            _deckGroessen.set(sp, g);
        }
        return g;
    }
    function forestKronenDeckung(sd, geburt, kronen, F, st, schnee, ort, wald, hang) {
        // der Bestand am Standort (FOREST_PACK.bestand, `st` der Stand): Lichtung und Schluss wie in planForestCell / forestSteht;
        // die Waldgrenze im Schnee des Sommers und im Klima des Orts (`forestWaldgrenze`, `schnee` der Anteil des Gelände-Kerns zur
        // Sommer-Mitte, `wald` der Wald-Anteil seines Ort-Gesetzes); der Saum am Siedlungsrand (`forestOrt`, `ort` der Abstand
        // jenseits des nächsten Rands, `forestOrtAbstand`; `hang` die Steilheit, über der Pflug-Grenze rodet der Ort nicht)
        const schluss = forestSchluss(st);
        // die Lichtung nimmt NACH der Selbst-Ausdünnung (`gelichtet`, planForestCell): die Stämme des gedünnten Bestands × Lichtung
        const g = geburt * forestWaldgrenze(schnee, wald) * forestOrt(ort, hang);
        const licht = forestLichtung(st);
        const lambda = (F.dartsPerCell / (F.cell * F.cell)) * (g > 0 ? g : 0);
        if (!(lambda > 0) || !(licht > 0) || !kronen || !kronen.length) return 0;
        let wSumme = 0;
        for (let k = 0; k < kronen.length; k++) wSumme += kronen[k][0] > 0 ? kronen[k][0] : 0;
        if (!(wSumme > 0)) return 0;
        const NP = _deckNP;
        const P2 = Math.PI * F.pack * F.pack * schluss * schluss;
        let summe = 0;
        for (let p = 0; p < NP; p++) {
            let mT = 0;
            let mT2 = 0;
            for (let k = 0; k < kronen.length; k++) {
                const w = kronen[k][0] > 0 ? kronen[k][0] / wSumme : 0;
                if (!(w > 0)) continue;
                const t = kronen[k][1] * _deckGroessenVon(kronen[k][2])[p];
                mT += w * t;
                mT2 += w * t * t;
            }
            let deckung = 0;
            for (let k = 0; k < kronen.length; k++) {
                const w = kronen[k][0] > 0 ? kronen[k][0] / wSumme : 0;
                if (!(w > 0)) continue;
                const t = kronen[k][1] * _deckGroessenVon(kronen[k][2])[p];
                const A = P2 * (t * t + 2 * t * mT + mT2);
                deckung += w * Math.PI * t * t * (Math.log1p(lambda * A) / A);
            }
            summe += 1 - Math.exp(-licht * deckung);
        }
        return summe / NP;
    }

    // DIE NISCHE EINES ORTS (EINE Formel für den gepflanzten und den fernen Wald): Klima, Bestands-Mosaik, Feuchte,
    // Höhen-Trockenheit und Offenheit am Ort (x, z) auf der Oberfläche surfaceY bei Bestandsdichte sd → die Arten-
    // Gewichte der fünf Wald-Arten (wF Kiefer · wT Tanne · wE Eiche · wB Birke · wW Erle, ohne die Auto-Arten) samt
    // clim/patch/feu. planForestCell würfelt daraus die Art, die Fernform des Hosts mischt daraus die Kronen-Farbe.
    // Keine rng-Aufrufe. ctx = { F (dryScale), baseH, fbm(px,pz), feuchteAt(x,z,surfY), wuchs, fussM? }.
    // DER WUCHS DES ORTS (Reise, Welle 3 — `ctx.wuchs`, Pflicht: gelaende-core `ortGesetz(teil).wuchs`): das Nadelholz (Kiefer,
    // Tanne) trägt den Faktor `nadel` (es meidet die Tropen), der Laubbaum (Eiche, Birke, Erle) `laub` (vor der Zeit der
    // Bedecktsamer steht Nadelholz) — in der Heimat beide 1, jedes Gewicht Bit für Bit wie zuvor.
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
        const W = forestWuchs(ctx);
        return {
            wF: NW.wF * W.nadel,
            wT: NW.wT * W.nadel,
            wE: NW.wE * W.laub,
            wB: NW.wB * W.laub,
            wW: (feu >= FOREST_PACK.ufer ? NW.wW + feu * feu * 6.0 : 0) * W.laub, // Host: waterProx = feu, nur im Saum
            clim,
            patch,
            feu,
        };
    }
    // Der Wuchs des Orts im ctx des Walds — Pflicht wie Schnee und Ort: ohne ihn bricht der Wald beim Namen, nie der der Heimat als Ersatz.
    function forestWuchs(ctx) {
        const W = ctx && ctx.wuchs;
        if (!W || !Number.isFinite(W.wald) || !Number.isFinite(W.laub) || !Number.isFinite(W.nadel))
            throw new Error(
                "phyto-core: der Wuchs des Orts fehlt im ctx des Walds (wuchs: wald · laub · nadel, KERN-PFLICHT)"
            );
        return W;
    }

    // DER LEBENSLAUF DES BESTANDS (Bahn mischwald, karte2.leben.pflanzen.lebenslauf#1): der Wald ist ein Mosaik gleichaltriger
    // Flecken (Mosaik-Zyklus; die Kante `fleck` GEWÄHLT, unbelegt), jeder Fleck in seiner Phase u ∈ [0, 1) (`forestFleckPhase`,
    // gleichverteilt: der Normalwald). Jede Art durchläuft in ihm ihre Ertragstafel von der Größe, in der der Wald sie zeichnet
    // (FOREST_PACK.groesse[0], Alter A₀), bis zum Ende der Tafel: A = A₀ + u·(A_end − A₀), die Größe s = h(A) / hoeheM — die Höhe
    // folgt der Tafel. Die Stammzahl folgt der Selbst-Ausdünnung, die der Wald schon trägt (Matérn III, `forestDachFenster`):
    // gleichaltrige Kronen T = Krone·s dünnen sich mit dem Alter aus, N ~ D^−1,6 (Reineke 1933, J. Agric. Res. 46: 627–638:
    // log N = −1,605·log D + k). Wer in der Konkurrenz starb und vor `tau` Jahren noch stand, STEHT als Totholz (`forestStehende`).
    // Die Tafeln: WBR 86 Tab. 3 (Niedersachsen), Bestandesmittelhöhen, untere Grenzwerte je Leistungsklasse — Eiche JÜTTNER 1955,
    // Buche SCHOBER 1967 (auch Karst, „sonstige Laubbäume“ → Buche), Birke SCHWAPPACH 1903/26, Erle MITSCHERLICH 1945 (die Weide
    // der Erlen-Nische), Fichte WIEDEMANN 1936/42 (auch Kiefer-Nische), Tanne SCHMIDT 1955. `r` = h(A)/hoeheM in 5-Jahres-Schritten
    // ab `ab` (hoeheM: die Höhe der Größe 1, foundry PRESETS; gate:phyto-core hält beide gleich). DIE BONITÄT `kl`: die Klasse,
    // deren Tafel-Ende die Mitte der Natur-Spanne trägt (nordstern §4.5, gate:pflanzen-nah H: Buche 30–45 · Fichte 30–50 · Eiche
    // 15–35 · Birke 15–25 m; Fichte über der obersten Klasse → Lkl 13); die Tanne ohne Spanne: hoeheM im Alter 100; die Solitäre
    // (Weide, Karst) tragen die Form der untersten Klasse, Größe 1 im Alter 100. `tau`: die Standzeit des Totholz, 45 a Zerfall
    // (Buche 30–60 a) × 1/(1 + 5) aus stehend : liegend = 1 : 5 (Commarmot et al. 2013, Uholka-Inventur, WSL). Der Mammut steht
    // außerhalb der Tafel (sein Wurf `forestMammutRoll`; WBR führt Seqg unter der Fichte, 39,9 m liegen über Lkl 13).
    const FOREST_ERTRAG = Object.freeze({
        fleck: 40,
        tau: 7.5,
        schritt: 5,
        kurven: Object.freeze({
            eiche: Object.freeze({
                tafel: "eiche",
                kl: 4.03,
                hoeheM: 15.55,
                ab: 15,
                r: Object.freeze([
                    0.1496, 0.1954, 0.2734, 0.3514, 0.4356, 0.5321, 0.6157, 0.6931, 0.764, 0.8348, 0.8991, 0.9567,
                    1.002, 1.047, 1.0918, 1.1304, 1.169, 1.2076, 1.2461, 1.2847, 1.3231, 1.3615, 1.3936, 1.4196, 1.4455,
                    1.4712, 1.4907, 1.504, 1.5171, 1.5299, 1.5428, 1.5559, 1.5687, 1.5816, 1.5882, 1.5949, 1.6013,
                    1.6077,
                ]),
            }),
            fichte: Object.freeze({
                tafel: "fichte",
                kl: 13,
                hoeheM: 26.2,
                ab: 15,
                r: Object.freeze([
                    0.1985, 0.2786, 0.3588, 0.4504, 0.5534, 0.6489, 0.7443, 0.8244, 0.9008, 0.9618, 1.0153, 1.0649,
                    1.1107, 1.1527, 1.1908, 1.2252, 1.2595, 1.2901, 1.3206, 1.3473, 1.3664, 1.3855, 1.4008, 1.4122,
                    1.4237, 1.4351,
                ]),
            }),
            tanne: Object.freeze({
                tafel: "tanne",
                kl: 10,
                hoeheM: 26.9,
                ab: 20,
                r: Object.freeze([
                    0.1375, 0.223, 0.316, 0.4089, 0.5019, 0.5799, 0.6506, 0.71, 0.7584, 0.803, 0.8401, 0.8736, 0.9033,
                    0.9294, 0.9554, 0.9777, 1, 1.0186, 1.0372, 1.0558, 1.0743, 1.0892, 1.1041, 1.119, 1.1338,
                ]),
            }),
            birke: Object.freeze({
                tafel: "birke",
                kl: 4,
                hoeheM: 13,
                ab: 10,
                r: Object.freeze([
                    0.3, 0.4462, 0.5769, 0.7, 0.8231, 0.9308, 1.0308, 1.1231, 1.2, 1.2769, 1.3462, 1.4, 1.4538, 1.5,
                    1.5385,
                ]),
            }),
            weide: Object.freeze({
                tafel: "erle",
                kl: 4,
                hoeheM: 7,
                ab: 15,
                r: Object.freeze([
                    0.2186, 0.3934, 0.4699, 0.5355, 0.5847, 0.6284, 0.6721, 0.7158, 0.7541, 0.7923, 0.8251, 0.8579,
                    0.8907, 0.9235, 0.9508, 0.9672, 0.9836, 1,
                ]),
            }),
            buche: Object.freeze({
                tafel: "buche",
                kl: 8.64,
                hoeheM: 23.55,
                ab: 20,
                r: Object.freeze([
                    0.1719, 0.2422, 0.3406, 0.4268, 0.5198, 0.6159, 0.7021, 0.7839, 0.8534, 0.9155, 0.975, 1.0329,
                    1.0866, 1.136, 1.1854, 1.2306, 1.2731, 1.3113, 1.348, 1.3819, 1.4144, 1.4426, 1.468, 1.492, 1.5175,
                    1.5372, 1.5584, 1.5796, 1.5924,
                ]),
            }),
            karst: Object.freeze({
                tafel: "buche",
                kl: 3,
                hoeheM: 8.5,
                ab: 35,
                r: Object.freeze([
                    0.0226, 0.0902, 0.203, 0.2932, 0.3759, 0.4662, 0.5714, 0.6541, 0.7293, 0.7895, 0.8496, 0.9023,
                    0.9549, 1, 1.0602, 1.1053, 1.1579, 1.188, 1.2105, 1.2481, 1.2707, 1.3008, 1.3308, 1.3383, 1.3534,
                    1.3684,
                ]),
            }),
        }),
        // die Art des Walds (Wirts-Name) → ihre Kurve; „sonstige Laubbäume“ (WBR) → Buche; der Mammut trägt keine
        art: Object.freeze({
            baum_kiefer: "fichte",
            baum_fichte: "fichte",
            baum_tanne: "tanne",
            baum_eiche: "eiche",
            baum_birke: "birke",
            baum_erle: "weide",
            baum_weide: "weide",
            baum_buche: "buche",
            baum_karst: "karst",
        }),
        sonst: "buche",
        ohne: Object.freeze(["mammut", "baum_mammut"]),
    });
    const _ertragMemo = new Map();
    // DIE KURVE EINER ART (Wirts- oder Labor-Name) mit ihren Rändern: A₀ (die Größe groesse[0]), A_end (das Tafel-Ende), R(A), A(R);
    // null für den Mammut (außerhalb der Tafel)
    function forestErtragKurve(sp) {
        let K = _ertragMemo.get(sp);
        if (K !== undefined) return K;
        const E = FOREST_ERTRAG;
        if (E.ohne.indexOf(sp) >= 0) K = null;
        else {
            const name = E.kurven[sp] ? sp : E.art[sp] || E.sonst;
            const C = E.kurven[name];
            const r = C.r;
            const ab = C.ab;
            const st = E.schritt;
            const n = r.length;
            // R(A): linear in den Schritten der Tafel, unter ihrem ersten Alter zur Höhe 0 bei A = 0, über ihrem Ende ihr Ende
            const R = (A) => {
                if (A <= ab) return A > 0 ? (r[0] * A) / ab : 0;
                const f = (A - ab) / st;
                const k = Math.floor(f);
                return k >= n - 1 ? r[n - 1] : r[k] + (r[k + 1] - r[k]) * (f - k);
            };
            // A(R): das Alter einer Größe (die Tafel steigt streng), über dem Ende ihr Ende
            const alter = (s) => {
                if (s <= r[0]) return s > 0 ? (s / r[0]) * ab : 0;
                for (let k = 1; k < n; k++)
                    if (s <= r[k]) return ab + (k - 1 + (s - r[k - 1]) / (r[k] - r[k - 1])) * st;
                return ab + (n - 1) * st;
            };
            const a0 = alter(FOREST_PACK.groesse[0]);
            K = Object.freeze({ name, tafel: C.tafel, R, alter, a0, aEnd: ab + (n - 1) * st });
        }
        _ertragMemo.set(sp, K);
        return K;
    }
    // DIE GRÖSSE EINER ART IN DER PHASE u ihres Flecks (KERN-PFLICHT: ohne Phase, für den Mammut oder ohne Art bricht sie laut)
    function forestErtragGroesse(sp, u) {
        const K = forestErtragKurve(sp);
        if (!K || !(u >= 0 && u <= 1))
            throw new Error(
                `phyto-core: die Größe der Ertragstafel braucht Art und Phase (${sp}, u ${u}, KERN-PFLICHT)`
            );
        return K.R(K.a0 + u * (K.aEnd - K.a0));
    }
    // DIE PHASE DES FLECKS am Ort (x, z): das Mosaik ist ein Voronoi gezitterter Saat-Punkte im Raster `fleck` (je Raster-Zelle ein
    // Punkt und seine Phase aus dem Welt-Samen, mulberry32), die Phase des nächsten Punkts (3 × 3 Zellen) — rein, ohne rng des Darts.
    function forestFleckPhase(x, z, seedInt) {
        const L = FOREST_ERTRAG.fleck;
        const gx = Math.floor(x / L);
        const gz = Math.floor(z / L);
        let best = Infinity;
        let u = 0;
        for (let a = -1; a <= 1; a++)
            for (let b = -1; b <= 1; b++) {
                const cx = gx + a;
                const cz = gz + b;
                const h = mulberry32(
                    (Math.imul(cx, 73856093) ^ Math.imul(cz, 19349663) ^ Math.imul(seedInt | 0, 83492791)) >>> 0
                );
                const px = (cx + h()) * L - x;
                const pz = (cz + h()) * L - z;
                const d2 = px * px + pz * pz;
                const v = h();
                if (d2 < best) {
                    best = d2;
                    u = v;
                }
            }
        return u;
    }
    // DIE GRÖSSE EINES DARTS: die Tafel seiner Art in der Phase seines Flecks (`forestErtragGroesse`). RNG-REIHENFOLGE heilig
    // (Host-Determinismus): die Würfe der reverse-J-Größe (ue, der Überhälter-Wurf, seine Größe bei 5 %) bleiben im Strom, ihre
    // Zahl fällt — jeder Ort, jede Art und jeder Vorrang eines Darts bleibt, wie er war; nur seine Größe folgt dem Lebenslauf.
    function forestTreeSize(rng, sp, u) {
        rng();
        if (rng() < 0.05) rng();
        return forestErtragGroesse(sp, u);
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
    // Convenience: size first (die Tafel der Art `sp` in der Phase `u`), then mammut — SAME order as today.
    // Nur aufrufen wenn Species Mammut erlaubt (nicht weide/baum_erle).
    function forestSizeAndMammut(rng, sd, clim, sp, u) {
        let s = forestTreeSize(rng, sp, u);
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
        // DIE SCHLANKHEIT H/D DER KONIFERE je Zeile ihrer Krone (`ph.krone`, treeParams `P.hd`): Bestand 40–100 (waldwissen,
        // McMahon 1973), der Mammut gedrungen — EINE Quelle für die Art und die Konifere der Dials (bis fachwerk-buehne je Art
        // in foundry-core; die Eiche mit api 1 trug keine und brach im Bau, gate:studio-huelle H3)
        schlank: { fichte: 70, tanne: 65, mammut: 18 },
        // DIE SCHICHTEN DES BESTANDS (vegetation.K3, w16-wald-innen): ein Dart, den die Kronen-Schüchternheit aus dem Dach
        // nimmt (`forestSteht`), stirbt nicht, wenn er unter dem Schirm einer Dach-Krone steht — er wächst im Zwischen- und
        // Unterstand (Kraft'sche Baumklassen 3–5) im größten Alter `alter` (die Stufen der Jugend-Gestalt, stamm
        // SUKZESSION.jugend), in dem seine Krone T·alter gegen jeden besseren geborenen Dart (T·alter) frei steht; unter dem Dach
        // berühren sich die Kronen (`pack` 1): die Lücke der Schüchternheit reibt nur der Wind am offenen Dach (Putz et al. 1984).
        // Gemessen mit dem Bestand (`bestand` unten, flacher Grund, Stand ≥ 0,4): Dach 105 + Zwischen-/Unterstand 244 = 349
        // Stämme/ha (vorher 42) — REF spec/abnahme/real-mischwald.json 370–900; im Wirt 1 km² um das Dorf 90 % 501, max 716.
        // DIE SKALA-GRENZE (w20-wald-kosten, Täter-Matrix z289): kein Baum einer Schicht ist kleiner als der kleinste des Walds
        // (`groesse[0]`) — die Schicht trägt max(alter, groesse[0] / s) seiner Größe. Bis hierher stand der Unterstand in
        // s · alter: 96 % seiner Bäume unter 0,55 (Median 0,30), die Invariante W-H GRÖSSEN-SPAN fiel. Gemessen (Stand 0,5,
        // flach): Dach 106,5 + Schicht 246,9 = 353,4 → 106,5 + 35,6 = 142,1 Stämme/ha.
        schicht: { alter: [0.7, 0.4], pack: 1 },
        // DAS UFER (`ufer`): die Feuchte des Bodens (Wirt `_feuchteAt`: die Nähe des Flusses über `flussReichweite`, die Niederung),
        // ab der die Uferart steht — die Erle des Walds (`forestNicheWeights` wW) und der Streu, der Farn des Krautstratums. Die Erle
        // wurzelt im Grundwasser des Saums (Alnus glutinosa: Bruch- und Auwald, der Wasserspiegel nah unter dem Grund; Ellenberg F 9),
        // nie im trockenen Hang: bis hier trug wW einen Sockel 0,01 überall und den Feuchte-Term schon im äußeren Saum (feu 0,25 in
        // 17 m) — an der Mess-Wiese 29 von 89 Erlen ohne Wasser in 15 m (64,7 % am Wasser). 0,6 ist die Feuchte in 11 m vom Fluss.
        ufer: 0.6,
        // DER GRÖSSEN-SPAN DES WALDS (die Invariante W-H, scripts/playtest/siedlung.cjs liest ihn hier): die reverse-J-Größe des
        // Darts (`forestTreeSize`, ihr Boden und ihre Klemme) und jede Schicht des Bestands (`forestSchicht`) stehen darin.
        groesse: [0.55, 1.95],
        // DER BESTAND AUS DEM STANDORT (vegetation.K3 Nacharbeit, w16-wald-innen): der Stand `st` ∈ [−1, 1] ist das EINE Feld
        // „Wald ↔ Lichtung" des Wirts (`_placementStandAt(…, "forest")`, λ ~170 m, Saat `:forest` — dasselbe, das Streu,
        // Strauch-Teppich und Boden lesen; der Faden zieht es aus derselben Saat). LICHTUNG: unter `lichtung[0]` wird kein Baum
        // geboren, bis `lichtung[1]` wächst die Geburt an (Wiesen und Blößen als Klasse des Gesetzes, nie ein Loch des Zufalls).
        // SCHLUSS: der Mindestabstand zweier Kronen (Dach und Schichten) ist pack × (Ti + Tj) × min(ci, cj), c = 1 bis
        // `schluss[0]`, `min` ab `schluss[1]` — im geschlossenen Bestand greifen die Kronen ineinander, die Stammzahl folgt dem
        // Standort wie in der Ertragstafel (BWI 4). Bis hierher sättigte Matérn II bei fester Packung: 36–48 Stämme/ha bei
        // jeder Dichte, das Dach deckte 0,16, die Mess-Wiese war ein Loch des Zufalls. Gemessen (flach, 3 600 Zellen, Stand-Bänder
        // < −0,1 · −0,1–0,15 · 0,15–0,4 · ≥ 0,4): 1 · 61 · 131 · 349 Stämme/ha; Mess-Wiese Kronen-Deckung 0,108 → 0,116 (≤ 0,12).
        // Das Urteil blieb Matérn II (der Tote nahm dem Nachbarn den Stand): flach, Stand 0,5, Dach 107 + Schicht 58 Stämme/ha,
        // Deckung 0,43. Mit der Selbst-Ausdünnung (`forestSteht`, w28-laub-kante; flach, Stand 0,5 / 0,8): Dach 261 / 296 + Schicht
        // 123 / 168 = 384 / 464 Stämme/ha, Kronen-Deckung 0,77 / 0,83 — im Band der REF 370–900; Stand 0 – 0,3 (Lichtungs-Saum)
        // 0,32–0,48, die Lichtung selbst (Stand < −0,1) 0.
        // DIE WALDGRENZE (`forestWaldgrenze`): `waldgrenze` ist der Schnee-Anteil des Sommers, ab dem kein Baum mehr geboren wird —
        // darunter die Kampfzone (die Geburt fällt glatt von 1 bei 0). Der Wald endet unter dem Schnee, nie in ihm: wo ein
        // Zehntel des Sommer-Bodens Schnee trägt, ist die Vegetationszeit zu kurz für Holz (Körner 2012, Alpine Treelines: die
        // Baumgrenze liegt unter der Schneegrenze). Gemessen (Land ±4 km, 50 m): die Grenze wirkt auf 2,0 %, baumlos 1,2 % — die
        // höchsten Gipfel; mit 0,25 stand am gipfel-blick noch eine Tanne in 28 m im Blick-Strahl zur Stadt.
        // DER SAUM AM SIEDLUNGSRAND (`forestOrt`, w20-wald-kosten): `saum` ist die Tiefe des gestuften Waldrands jenseits des Rands
        // eines Orts (m) — innen kein Baum, über die Tiefe steigt die Geburt glatt auf ihren Bestand (Krautsaum 5–10 m,
        // Strauchgürtel ≥ 5 m, Waldmantel 15–20 m; das ganze Profil 25–40 m: WWF Schweiz 2012, Naturschutzbund AT 2017, Bio
        // Austria 2023).
        // DIE RODUNG DES ORTS (`forestOrt`, der Hangwald): `rodung` ist die Neigung (|∇h|), über die der Ort sein Land vom Acker
        // bis zur Weide rodet — darunter voll gerodet, darüber Wald. 0,36 die Pflug-Grenze (die Hang-Stufe 35 % der Schweizer
        // Direktzahlungsverordnung DZV Art. 43, ab der Ackerbau mit dem Gespann endet; GEWÄHLT innerhalb 0,27–0,36), 0,58 die
        // Weide-Grenze (~30°, GEWÄHLT; die Steillagen-Stufe 50 % der DZV mäht noch, über 30° beweidet nur noch Kleinvieh).
        bestand: {
            lichtung: [-0.1, 0.15],
            schluss: [0.15, 0.6],
            min: 0.6,
            waldgrenze: 0.1,
            saum: 40,
            rodung: [0.36, 0.58],
        },
    };
    function forestLichtung(st) {
        const B = FOREST_PACK.bestand;
        let t = (st - B.lichtung[0]) / (B.lichtung[1] - B.lichtung[0]);
        t = t < 0 ? 0 : t > 1 ? 1 : t;
        return t * t * (3 - 2 * t);
    }
    function forestSchluss(st) {
        const B = FOREST_PACK.bestand;
        let t = (st - B.schluss[0]) / (B.schluss[1] - B.schluss[0]);
        t = t < 0 ? 0 : t > 1 ? 1 : t;
        return 1 - (1 - B.min) * t * t * (3 - 2 * t);
    }
    // DIE WALDGRENZE (w16-wald-innen-pm, der Befund am gipfel-blick vp-0611h): der Wald endet unter dem Schnee des Sommers —
    // `schnee` ist der Anteil der Schneegrenze des Gelände-Kerns (gelaende-core `schnee` zur Sommer-Mitte, Versatz 0: die
    // Null-Grad-Linie des Sommer-Mittels, ihre Zungen in Mulden und auf Rücken), dieselbe Quelle, die die Boden-Farbe weißt; die
    // Geburt fällt glatt von 1 (kein Schnee) auf 0 bei `bestand.waldgrenze`. Unterhalb der Grenze (schnee 0) ist der Wald
    // byte-gleich. Bis hierher wuchs der geschlossene Bestand bis auf den höchsten Gipfel (gipfel-blick 172,2 m, Schnee 0,48:
    // 46 Bäume binnen 25 m, Kronen-Deckung 0,285 — der Blick vom Gipfel stand im Wald; jetzt 0 Bäume binnen 25 m, der
    // Blick-Strahl zur Stadt frei bis 120 m); die Geburt allein (1 − schnee) hob ihn auf 49 (Matérn sättigt: weniger Dach,
    // mehr freie Darts).
    // DIE TROCKENGRENZE (Reise, Welle 3): `wald` ist der Wald-Anteil, den das Klima des Orts trägt (gelaende-core
    // `ortGesetz(teil).wuchs.wald`: der Niederschlag gegen die Verdunstung, in der Heimat 1) — die Geburt trägt ihn als Faktor:
    // die Wüste gebiert keinen Baum, die Savanne wenige. In der Heimat (× 1) ist jeder Wurf, wie er war.
    function forestWaldgrenze(schnee, wald) {
        if (!Number.isFinite(schnee))
            throw new Error("phyto-core forestWaldgrenze: der Schnee-Anteil fehlt (KERN-PFLICHT)");
        if (!Number.isFinite(wald))
            throw new Error("phyto-core forestWaldgrenze: der Wald-Anteil des Klimas fehlt (KERN-PFLICHT)");
        let t = schnee / FOREST_PACK.bestand.waldgrenze;
        t = t < 0 ? 0 : t > 1 ? 1 : t;
        return (1 - t * t * (3 - 2 * t)) * wald;
    }
    // DER WALD AM SIEDLUNGSRAND (w20-wald-kosten, der Befund KOSTEN der vp-0611h: das Dorf trug 1 117 statt 486 Bäume binnen
    // 150 m): ein Ort trägt seine Dichte — sein Rand ist die Reichweite nach dem Ort-Gesetz (fachwerk `siedlungsReich`: 30 +
    // 22·√nH m um die Mitte seines Plans, nH die Häuser des Plans), drinnen liegt sein Land (Hof, Garten, Flur), draußen der
    // gestufte Waldrand (`bestand.saum`). `d` ist der Abstand jenseits des nächsten Rands (m; drinnen negativ, ohne Ort
    // Infinity, `forestOrtAbstand`), die Geburt steigt glatt von 0 am Rand auf 1 in der Tiefe des Saums. Ohne Ort (∞) und
    // jenseits des Saums ist der Wald byte-gleich. Bis hierher wuchs der geschlossene Bestand bis an die Höfe: die Dorf-Pose
    // stand 21 m hinter dem Rand im Bestand mit Unterstand (Bildzeit im CPU-Raster 7 964 ms gegen main 3 965).
    // DER HANGWALD (w28-laub-kante): ein Dorf rodet, was es bebauen oder beackern kann — `hang` ist die Steilheit des Bodens
    // (|∇h|, derselbe Leser wie die Hang-Regel der Geburt); jenseits der beackerbaren Neigung (`bestand.rodung`) rodet der Ort
    // seinen Saum nicht, der Bestand steht als Hang- und Bannwald bis an seinen Rand. Die Rodung (1 − Saum) fällt glatt mit der
    // Neigung; unter der Pflug-Grenze ist jeder Wurf, wie er war.
    // DER GRUND DES ORTS (laub-kante, Bildpaar paar4): drinnen (`d` < 0, die Reichweite des Ort-Gesetzes, fachwerk
    // `siedlungsReich`) liegt sein Land — Platz, Gassen, Lose, Höfe; dort wächst kein Baum, wie steil es auch ist. Bis hier hob
    // die Neigung die Rodung auch drinnen auf: am Dorf standen Fichte, Tanne, Eiche binnen 5–24 m der Dorf-Pose auf Platz und
    // Gasse (18 L0-Bäume, 130 k Dreiecke; Vordergrund der Probe bild:dorf 0,254 > 0,25), main trug dort 0.
    function forestOrt(d, hang) {
        if (typeof d !== "number" || Number.isNaN(d))
            throw new Error("phyto-core forestOrt: der Abstand zum Siedlungsrand fehlt (KERN-PFLICHT)");
        if (!Number.isFinite(hang))
            throw new Error("phyto-core forestOrt: die Steilheit des Bodens fehlt (KERN-PFLICHT)");
        if (d < 0) return 0;
        const B = FOREST_PACK.bestand;
        let t = d / B.saum;
        t = t > 1 ? 1 : t;
        const saum = t * t * (3 - 2 * t);
        let h = (hang - B.rodung[0]) / (B.rodung[1] - B.rodung[0]);
        h = h < 0 ? 0 : h > 1 ? 1 : h;
        return saum + (1 - saum) * h * h * (3 - 2 * h);
    }
    // Der Abstand von (x, z) jenseits des nächsten Siedlungsrands: `raender` je Ort [x, z, rand] (die Mitte seines Plans und
    // seine Reichweite, m) — der Wirt legt sie mit dem Erdbau des Orts (`_ortRaender`), der Faden trägt dieselbe Liste.
    function forestOrtAbstand(raender, x, z) {
        let d = Infinity;
        if (raender)
            for (let i = 0; i < raender.length; i++) {
                const o = raender[i];
                const e = Math.hypot(x - o[0], z - o[1]) - o[2];
                if (e < d) d = e;
            }
        return d;
    }
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

    // DAS URTEIL DER KRONEN-SCHÜCHTERNHEIT (Host-Topologie "cell", w4-b-pflanzen): ein geborener Dart `d` der Zelle (gx, gz)
    // steht, wenn KEIN STEHENDER besserer Dart (`forestPrioWins`) der Zellen ±2 ihm zu nah ist (`forestTooClose`, Packung `pk`;
    // die Selbst-Ausdünnung unten). Rein: eine Funktion der geborenen Darts seiner Zelle und ihrer Nachbarn (`geboren(cx, cz)` →
    // die Darts von `planForestCell`), reihenfolge-frei. DIE REIHE (`FOREST_URTEIL_REIHE`): die eigene Zelle, dann Ring 1,
    // dann Ring 2 — das Fenster des Urteils. Die EINE Quelle des Urteils für den Wald-Faden (der
    // Bestand je Zelle, voxel-worker `waldDarts`) und den Wirt ohne Faden; bis w4-b-pflanzen urteilte der Haupt-Faden jeden
    // geborenen Dart selbst (`_forestDartSteht`): headless kalt bis zum Bild 58 398 Urteile über 58 562 entpackte Darts.
    const FOREST_URTEIL_REIHE = Object.freeze(
        [-2, -1, 0, 1, 2]
            .flatMap((a) => [-2, -1, 0, 1, 2].map((b) => [a, b]))
            .sort((p, q) => Math.max(Math.abs(p[0]), Math.abs(p[1])) - Math.max(Math.abs(q[0]), Math.abs(q[1])))
            .flat()
    );
    // DIE REICHWEITE DES BESTANDS (w16-wald-innen): die Zellen um eine Zelle, deren geborene Darts ihr Bestand liest — das Urteil
    // des Dachs ±2 (FOREST_URTEIL_REIHE), der Schirm des Unterstands ±1 darüber (`forestSchicht`). Der Wirt plant und lädt sie
    // (stamm WALD_PLAN.urteil).
    const FOREST_URTEIL_REICH = 3;
    // DIE SELBST-AUSDÜNNUNG (w28-laub-kante): es stirbt, wen ein LEBENDER Nachbar überwächst — ein geborener Dart steht, wenn kein
    // STEHENDER besserer Dart ihm zu nah ist (Matérn III; die Konkurrenz im Bestand geht von lebenden Kronen aus: Yoda et al. 1963,
    // die −3/2-Regel der Selbst-Ausdünnung; Kenkel 1988, Ecology 69: die Überlebenden eines Bestands stehen regelmäßig, ihr Abstand
    // folgt der Krone des Nachbarn). Bis hier urteilte der Wald Matérn II: auch ein Dart, der selbst fiel, nahm jedem schwächeren
    // Nachbarn den Stand — der Bestand sättigte bei 1/A, wie viele Darts die Geburt auch stellte (flach, Stand 0,5: 2 256 geborene
    // Darts/ha → 107 Stämme/ha im Dach, Kronen-Deckung 0,41; der Dorf-Hang 0,15). Gerechnet in der Reihe des Vorrangs
    // (`forestPrioWins`) über die geborenen Darts des Fensters der EIGENEN Zelle (±2, `FOREST_URTEIL_REIHE`): rein und
    // reihenfolge-frei — das Urteil eines Darts ist eine Funktion seiner Zelle und ihrer Nachbarn, jeder Leser (Wald-Faden, Wirt,
    // Kamm) rechnet dasselbe. Das Fenster merkt `_fensterMemo` je Zelle, gültig, solange jede ihrer 25 Nachbar-Listen dieselbe ist.
    const _fensterMemo = typeof WeakMap === "function" ? new WeakMap() : null;
    // DER GANG DES URTEILS (die Wurzel der Kosten): das Urteil eines Darts der eigenen Zelle fragt nur, was es braucht — ein
    // Dart steht, wenn kein besserer (`forestPrioWins`) STEHENDER Dart des Fensters ihm näher ist als (T + T') · pk · min(Schluss);
    // ob der bessere steht, fragt derselbe Gang (gemerkt je Fenster), bis der Beste der Kette ohne Besseren in Reichweite steht.
    // Dasselbe Urteil wie die Reihe des Vorrangs über alle Darts des Fensters, Wort für Wort — ohne sie zu sortieren und ohne die
    // Darts zu urteilen, die keinen Dart der eigenen Zelle erreichen (bis hier je Zelle alle ~900 Darts des Fensters sortiert
    // und geurteilt: 0,43 ms je Zelle). Die Nachbarn eines Darts: die Fächer (`FENSTER_FACH` m) der Zellen des Fensters, je Liste
    // der Geburt EINMAL gelegt (`zellFaecher`) mit Kasten, größter Krone und größtem Schluss — ein Fach zählt, wenn es in der
    // Reichweite pk · min(Schluss, seinem) · (T + seiner größten Krone) liegt.
    const FENSTER_FACH = 4;
    const _zellFaecher = typeof WeakMap === "function" ? new WeakMap() : null;
    function zellFaecher(a) {
        let f = _zellFaecher ? _zellFaecher.get(a) : undefined;
        if (f) return f;
        const B = FENSTER_FACH;
        let x0 = Infinity;
        let z0 = Infinity;
        let x1 = -Infinity;
        let z1 = -Infinity;
        for (let i = 0; i < a.length; i++) {
            const d = a[i];
            if (d.x < x0) x0 = d.x;
            if (d.z < z0) z0 = d.z;
            if (d.x > x1) x1 = d.x;
            if (d.z > z1) z1 = d.z;
        }
        const nx = a.length ? Math.floor((x1 - x0) / B) + 1 : 0;
        const nz = a.length ? Math.floor((z1 - z0) / B) + 1 : 0;
        const fach = [];
        const idx = new Array(nx * nz);
        for (let i = 0; i < a.length; i++) {
            const d = a[i];
            const q = Math.floor((d.x - x0) / B) * nz + Math.floor((d.z - z0) / B);
            let e = idx[q];
            if (!e) {
                e = idx[q] = { x0: d.x, z0: d.z, x1: d.x, z1: d.z, tMax: 0, sMax: 0, d: [], i: [], w: null };
                fach.push(e);
            }
            e.d.push(d);
            e.i.push(i);
            if (d.x < e.x0) e.x0 = d.x;
            if (d.z < e.z0) e.z0 = d.z;
            if (d.x > e.x1) e.x1 = d.x;
            if (d.z > e.z1) e.z1 = d.z;
            if (d.T > e.tMax) e.tMax = d.T;
            if (d.schluss > e.sMax) e.sMax = d.schluss;
        }
        f = { x0, z0, x1, z1, tMax: 0, sMax: 0, fach };
        for (const e of fach) {
            // das Fach in der Reihe des Vorrangs (der Beste zuerst), gepackt: je Dart x, z, T, Schluss, Vorrang und sein Platz
            const o = e.i
                .map((_, k) => k)
                .sort((p, q) => (forestPrioWins(e.d[p], e.d[q]) ? -1 : forestPrioWins(e.d[q], e.d[p]) ? 1 : 0));
            e.d = o.map((k) => e.d[k]);
            e.i = Int32Array.from(o, (k) => e.i[k]);
            e.w = new Float64Array(o.length * 5);
            for (let k = 0; k < o.length; k++) {
                const d = e.d[k];
                e.w.set([d.x, d.z, d.T, d.schluss, d.prio], k * 5);
            }
            if (e.tMax > f.tMax) f.tMax = e.tMax;
            if (e.sMax > f.sMax) f.sMax = e.sMax;
        }
        if (_zellFaecher) _zellFaecher.set(a, f);
        return f;
    }
    function forestDachFenster(gx, gz, geboren, pk) {
        const R = FOREST_URTEIL_REIHE;
        const nN = R.length >> 1;
        const own = geboren(gx, gz);
        const nb = new Array(nN);
        for (let q = 0; q < R.length; q += 2) nb[q >> 1] = geboren(gx + R[q], gz + R[q + 1]);
        const m = _fensterMemo ? _fensterMemo.get(own) : undefined;
        if (m && m.pk === pk) {
            let gleich = true;
            for (let i = 0; i < nN && gleich; i++) gleich = m.nb[i] === nb[i];
            if (gleich) return m.steht;
        }
        const FA = new Array(nN);
        for (let i = 0; i < nN; i++) FA[i] = zellFaecher(nb[i]);
        // das Urteil je Dart, gemerkt im Fenster (je Zelle ein Feld in der Reihe ihrer Geburt: 0 offen, 1 steht, 2 fällt)
        const U = new Array(nN);
        const urteile = (c, i) => {
            let u = U[c];
            if (!u) u = U[c] = new Uint8Array(nb[c].length);
            if (u[i]) return u[i] === 1;
            const d = nb[c][i];
            const dx = d.x;
            const dz = d.z;
            const dT = d.T;
            const ds = d.schluss;
            const dp = d.prio;
            let v = true;
            // die eigene Zelle zuerst (dort steht meist der Nachbar, der den Dart überwächst), dann die übrigen des Fensters
            for (let w = -1; w < nN && v; w++) {
                const cc = w < 0 ? c : w;
                if (w === c) continue;
                const k = FA[cc];
                const rc = pk * (ds < k.sMax ? ds : k.sMax) * (dT + k.tMax);
                if (dx + rc < k.x0 || dx - rc > k.x1 || dz + rc < k.z0 || dz - rc > k.z1) continue;
                for (let e = 0; e < k.fach.length && v; e++) {
                    const f = k.fach[e];
                    const r = pk * (ds < f.sMax ? ds : f.sMax) * (dT + f.tMax);
                    if (dx + r < f.x0 || dx - r > f.x1 || dz + r < f.z0 || dz - r > f.z1) continue;
                    const W = f.w;
                    for (let j = 0, n = f.i.length; j < n; j++) {
                        const ox = W[j * 5];
                        const oz = W[j * 5 + 1];
                        const op = W[j * 5 + 4];
                        // das Fach steht in der Reihe des Vorrangs (`forestPrioWins`): ab dem ersten Schwächeren nur Schwächere
                        if (!(op > dp || (op === dp && (ox > dx || (ox === dx && oz > dz))))) break;
                        const os = W[j * 5 + 3];
                        const md = (dT + W[j * 5 + 2]) * pk * (ds < os ? ds : os);
                        const ex = dx - ox;
                        const ez = dz - oz;
                        if (ex * ex + ez * ez < md * md && urteile(cc, f.i[j])) {
                            v = false;
                            break;
                        }
                    }
                }
            }
            u[i] = v ? 1 : 2;
            return v;
        };
        const steht = new Set();
        for (let k = 0; k < nb[0].length; k++) if (urteile(0, k)) steht.add(nb[0][k]); // nb[0]: die eigene Zelle (die Reihe beginnt bei ihr)
        if (_fensterMemo) _fensterMemo.set(own, { pk, nb, steht });
        return steht;
    }
    function forestSteht(d, gx, gz, geboren, pk) {
        return forestDachFenster(gx, gz, geboren, pk).has(d);
    }
    // DIE SCHICHT EINES DARTS (FOREST_PACK.schicht): 1 im Dach (`forestSteht`), sonst — nur UNTER DEM SCHIRM: der Dart steht
    // unter der Krone (|d − o| < o.T) eines Baums des Dachs der Zellen ±1 (Unterstand wächst im Schatten des Altholzes, nie auf der
    // Lichtung: die Mess-Wiese trug ohne den Schirm 117 statt 8 Bäume im Ring von 25 m) — das größte Alter der Schicht, in dem
    // seine Krone T·alter gegen jeden besseren geborenen Dart der Zellen ±2 (T·alter, Packung `schicht.pack`) frei steht, 0 ohne
    // Platz; das Alter je Dart nie unter der Skala-Grenze (max(alter, groesse[0] / s), FOREST_PACK.groesse). Rein,
    // reihenfolge-frei wie das Urteil des Dachs; es liest die geborenen Darts ±FOREST_URTEIL_REICH (das Dach des
    // Schirms ±1 urteilt über seine ±2). Das Urteil des Dachs je Dart merkt `_dachMemo` (rein je Dart-Objekt).
    const _dachMemo = typeof WeakMap === "function" ? new WeakMap() : null;
    function forestImDach(o, gx, gz, geboren, pk) {
        let v = _dachMemo ? _dachMemo.get(o) : undefined;
        if (v === undefined) {
            // das Fenster urteilt über alle Darts seiner Zelle: jeder trägt sein Urteil ins Gedächtnis
            const S = forestDachFenster(gx, gz, geboren, pk);
            v = S.has(o);
            if (_dachMemo) {
                const own = geboren(gx, gz);
                for (let k = 0; k < own.length; k++) _dachMemo.set(own[k], S.has(own[k]));
                _dachMemo.set(o, v);
            }
        }
        return v;
    }
    function forestSchicht(d, gx, gz, geboren, pk) {
        if (forestImDach(d, gx, gz, geboren, pk)) return 1;
        const S = FOREST_PACK.schicht;
        const R = FOREST_URTEIL_REIHE;
        const dx = d.x;
        const dz = d.z;
        // die Fächer der Zellen (`zellFaecher`): gefragt wird nur ein Fach, dessen Kasten in der Reichweite liegt
        const fern = (f, r) => dx + r < f.x0 || dx - r > f.x1 || dz + r < f.z0 || dz - r > f.z1;
        let schirm = false;
        for (let q = 0; q < 18 && !schirm; q += 2) {
            const K = zellFaecher(geboren(gx + R[q], gz + R[q + 1]));
            if (fern(K, K.tMax)) continue;
            for (let e = 0; e < K.fach.length && !schirm; e++) {
                const f = K.fach[e];
                if (fern(f, f.tMax)) continue;
                for (let k = 0; k < f.d.length && !schirm; k++) {
                    const o = f.d[k];
                    const ex = dx - o.x;
                    const ez = dz - o.z;
                    schirm =
                        o !== d &&
                        ex * ex + ez * ez < o.T * o.T &&
                        !o.gelichtet &&
                        forestImDach(o, gx + R[q], gz + R[q + 1], geboren, pk);
                }
            }
        }
        if (!schirm) return 0;
        const G = FOREST_PACK.groesse[0]; // die Skala-Grenze: kein Baum der Schicht kleiner als der kleinste des Walds
        for (let i = 0; i < S.alter.length; i++) {
            const sz = Math.max(d.s * S.alter[i], G); // die Größe in der Schicht
            if (!(sz < d.s)) return 0; // schon der Boden des Spans ist seine ganze Größe: unter dem Dach kein Platz
            const a = sz / d.s;
            const dT = d.T * a;
            let frei = true;
            for (let q = 0; q < R.length && frei; q += 2) {
                const K = zellFaecher(geboren(gx + R[q], gz + R[q + 1]));
                // die Krone der Schicht ist nie größer als die ganze (ao ≤ 1): die Reichweite (T·a + T) · pack · min(Schluss)
                if (fern(K, (dT + K.tMax) * S.pack * Math.min(d.schluss, K.sMax))) continue;
                for (let e = 0; e < K.fach.length && frei; e++) {
                    const f = K.fach[e];
                    if (fern(f, (dT + f.tMax) * S.pack * Math.min(d.schluss, f.sMax))) continue;
                    for (let k = 0; k < f.d.length; k++) {
                        const o = f.d[k];
                        const pa = S.pack * Math.min(d.schluss, o.schluss);
                        const ao = Math.min(Math.max(o.s * S.alter[i], G) / o.s, 1);
                        if (o !== d && forestTooClose(dx - o.x, dz - o.z, dT, o.T * ao, pa) && forestPrioWins(o, d)) {
                            frei = false;
                            break;
                        }
                    }
                }
            }
            if (frei) return a;
        }
        return 0;
    }
    // DER BESTAND EINER ZELLE: ihre geborenen Darts, die stehen — in der Reihe ihrer Geburt. Das Dach (`forestSteht`) trägt
    // den geborenen Dart selbst; Zwischen- und Unterstand (`forestSchicht` < 1) ein Abbild mit `alter`, der Größe `s` seiner
    // Schicht (nie unter FOREST_PACK.groesse[0] — der Wirt setzt sie, wie sie ist) und der Krone T·alter.
    // `nurDach`: nur die Kronen des Dachs (die Kamm-Krone der Ferne — kein Unterstand reicht über das Dach in den Himmel).
    // DAS STEHENDE TOTHOLZ (Bahn mischwald): ein Dart, der heute weder im Dach noch in der Schicht steht, aber vor
    // FOREST_ERTRAG.tau Jahren im Dach stand (dasselbe Urteil über die Kronen jener Zeit, `forestVorher`), starb in der
    // Konkurrenz — er STEHT als `baum_totholz` in der Größe, die er zuletzt trug (die Tafel seiner Art bei A − tau; die Gestalt
    // `totholz`: kahler Stamm, gebrochen bei 42–68 % ihrer Höhe), ohne Krone (T 0: er schirmt nichts). Der Tod ist eine Folge des
    // Gesetzes, kein Wurf. Ein Dart, der vor tau Jahren noch unter der Größe des Walds war, stand nie als Baum (kein Totholz).
    function forestStehende(gx, gz, geboren, pk, nurDach) {
        // die Zellen ±FOREST_URTEIL_REICH, die Fenster und Schirm dieser Zelle lesen, je EINMAL beim Rufer geholt (sein
        // Gedächtnis trägt Schlüssel-Text: je Dart der Schicht 59 Rufe)
        const RR = FOREST_URTEIL_REICH;
        const WW = 2 * RR + 1;
        const nah = new Array(WW * WW);
        const geb = geboren;
        geboren = (cx, cz) => {
            const a = cx - gx + RR;
            const b = cz - gz + RR;
            if (a < 0 || b < 0 || a >= WW || b >= WW) return geb(cx, cz);
            const q = a * WW + b;
            return nah[q] || (nah[q] = geb(cx, cz));
        };
        const own = geboren(gx, gz);
        const out = [];
        const S = nurDach ? forestDachFenster(gx, gz, geboren, pk) : null;
        const G0 = FOREST_PACK.groesse[0];
        let V = null; // das Dach vor tau Jahren (erst gefragt, wenn ein Dart heute nicht steht)
        for (let k = 0; k < own.length; k++) {
            const d = own[k];
            if (d.gelichtet) continue; // die Lichtung nahm ihn nach dem Wuchs (`planForestCell`)
            const a = S ? +S.has(d) : forestSchicht(d, gx, gz, geboren, pk);
            if (a === 1) out.push(d);
            else if (a > 0) out.push(Object.assign({}, d, { s: Math.max(d.s * a, G0), T: d.T * a, alter: a }));
            else if (!S) {
                const K = forestErtragKurve(d.sp);
                const sv = K ? K.R(K.alter(d.s) - FOREST_ERTRAG.tau) : 0;
                if (!(sv >= G0)) continue;
                if (!V) V = forestDachFenster(gx, gz, (cx, cz) => forestVorher(geboren(cx, cz)), pk);
                if (V.has(forestVorher(own)[k])) out.push(Object.assign({}, d, { sp: "baum_totholz", s: sv, T: 0 }));
            }
        }
        return out;
    }
    // DIE GEBORENEN EINER ZELLE VOR tau JAHREN (FOREST_ERTRAG): dieselben Darts — Ort, Vorrang, Schluss — mit der Krone ihrer Art
    // bei A − tau (T · R(A − tau) / R(A), isometrisch wie T = Krone · s), je Feld der Geborenen EINMAL (rein je Feld-Objekt).
    // Der Mammut (außerhalb der Tafel) trägt seine Krone unverändert.
    const _vorherMemo = typeof WeakMap === "function" ? new WeakMap() : null;
    function forestVorher(arr) {
        let v = _vorherMemo ? _vorherMemo.get(arr) : undefined;
        if (v) return v;
        const tau = FOREST_ERTRAG.tau;
        v = new Array(arr.length);
        for (let i = 0; i < arr.length; i++) {
            const d = arr[i];
            const K = forestErtragKurve(d.sp);
            const f = K ? K.R(K.alter(d.s) - tau) / d.s : 1;
            v[i] = { x: d.x, z: d.z, s: d.s * f, T: d.T * f, prio: d.prio, schluss: d.schluss, gelichtet: d.gelichtet };
        }
        if (_vorherMemo) _vorherMemo.set(arr, v);
        return v;
    }

    // DIE KAMM-KRONE (ferne.K3, w10-ferne): die Bäume DESSELBEN Bestands (`planForestCell` → `forestStehende`), deren Krone über
    // den Kamm in den Himmel ragt — der Umriss der Ferne, wie ihn ein Auge über dem Anker (ax, az) sieht. Bis w10 trug die Ferne
    // den Wald nur als Farbe (das Kronendach des Rings): der Kamm in 0,4–4 km war die glatte Linie des Gesetzes (Radeon 2674ff9a:
    // Kohärenz 0,8669, REF real-mischwald 0,160). Rein, ohne rng außer dem des Plans:
    //   DER MARSCH je Azimut (azN über [azVon, azBis)): das Gesetz `hoehe` von 40 m bis dBis (Faktor `marsch`), je Auge (Höhe über
    //     `grundY`, Liste `augen`) der höchste Winkel Θ (der Kamm, den das Auge gegen den Himmel sieht);
    //   DAS BAND: die Zone des Kamms je Auge (± tiefeM um den Punkt des höchsten Winkels, der Kamm in [dVon, dBis]), darin, wo ein
    //     Baum der Höhe hMax den Kamm erreicht (θ(d) + hMax/d ≥ Θ) — im Schritt der Zelle, je Probe die Zelle und quer ihre
    //     Nachbarn bis zur halben Azimut-Breite;
    //   DER BESTAND der Band-Zellen: `geboren(cx, cz)` (der Plan des Rufers, sein Gedächtnis) und das EINE Urteil der
    //     Kronen-Schüchternheit (`forestStehende`, Packung pk);
    //   DER UMRISS: je stehendem Dart die Krone seiner Art (`art(sp)` → { h: Wipfel-Höhe der Größe 1 in m, ansatz: Kronen-Ansatz
    //     als Anteil der Höhe, nadel }) × seine Größe s, ihr Radius T des Plans; er bleibt, wenn sein Wipfel für ein Auge über
    //     Θ − `saumM`/d steht (er trägt den Umriss gegen den Himmel).
    // Zurück: { baeume: Float64Array je Baum [x, z, y (Fuß), H, T, ansatz, nadel, artIdx], arten, zellen, rufe }.
    function forestKammKronen(o) {
        const azVon = o.azVon || 0;
        const azBis = o.azBis == null ? 2 * Math.PI : o.azBis;
        const nAz = o.azN;
        const dAz = (azBis - azVon) / nAz;
        const augen = o.augen;
        const nA = augen.length;
        const cell = o.cell;
        let rufe = 0;
        const H = (x, z) => (rufe++, o.hoehe(x, z));
        const ds = [];
        for (let d = 40; d <= o.dBis; d *= o.marsch) ds.push(d);
        const theta = new Float64Array(nAz * nA).fill(-Infinity);
        const zellen = new Map();
        const markiere = (x, z, quer, ux, uz) => {
            const n = Math.ceil(quer / cell);
            for (let k = -n; k <= n; k++) {
                const px = x + ux * k * (quer / Math.max(1, n));
                const pz = z + uz * k * (quer / Math.max(1, n));
                const cx = Math.floor(px / cell);
                const cz = Math.floor(pz / cell);
                zellen.set(cx * 1048576 + cz, [cx, cz]);
            }
        };
        const prof = new Float64Array(ds.length);
        for (let i = 0; i < nAz; i++) {
            const a = azVon + (i + 0.5) * dAz;
            const [sx, sz] = [Math.sin(a), Math.cos(a)];
            for (let k = 0; k < ds.length; k++) prof[k] = H(o.ax + sx * ds[k], o.az + sz * ds[k]);
            for (let e = 0; e < nA; e++) {
                const y = o.grundY + augen[e];
                let T = -Infinity;
                for (let k = 0; k < ds.length; k++) T = Math.max(T, (prof[k] - y) / ds[k]);
                theta[i * nA + e] = T;
            }
            // DAS BAND je Auge: die Zone des Kamms (der Punkt des höchsten Winkels d*, ± `tiefeM` längs des Strahls), in ihr fein im
            // Schritt der Zelle die Proben, deren Baum der Höhe hMax den Kamm erreicht (θ(d) + hMax/d ≥ Θ); ein Kamm vor dVon
            // (der Wald selbst zeichnet ihn) oder jenseits dBis trägt keine Kamm-Krone
            for (let e = 0; e < nA; e++) {
                const y = o.grundY + augen[e];
                let ks = 0;
                for (let k = 1; k < ds.length; k++) if ((prof[k] - y) / ds[k] > (prof[ks] - y) / ds[ks]) ks = k;
                const dk = ds[ks];
                if (dk < o.dVon || dk > o.dBis) continue;
                for (let q = Math.max(o.dVon, dk - o.tiefeM); q <= Math.min(o.dBis, dk + o.tiefeM); q += cell) {
                    const [x, z] = [o.ax + sx * q, o.az + sz * q];
                    if ((H(x, z) - y + o.hMax) / q >= theta[i * nA + e])
                        markiere(x, z, Math.max(cell, 0.5 * q * dAz), sz, -sx);
                }
            }
        }
        // der Bestand der Band-Zellen und der Umriss jeder Krone; zuerst je Auge und feinem Azimut (`fein` je Azimut des Marschs)
        // der höchste Wipfel-Winkel aller Kandidaten — es bleibt, wer in einem Fach eines Auges den Umriss trägt (bis `saumM` unter
        // dem höchsten), nie die Krone, die hinter einer anderen steht
        const fein = o.fein || 4;
        const nF = nAz * fein;
        const kand = [];
        const umriss = new Float64Array(nF * nA).fill(-Infinity);
        // je Fach, das die Krone deckt, die Höhe ihres Umrisses dort (Laub: die Ellipse über [Ansatz, Wipfel], Nadel: der Kegel),
        // als Winkel über dem Auge e
        const fach = (k, e, f) => {
            const { t, d } = k;
            let a = Math.atan2(t.x - o.ax, t.z - o.az) - azVon;
            a -= 2 * Math.PI * Math.floor(a / (2 * Math.PI));
            const b = dAz / fein;
            const mitte = a / b;
            const halb = t.T / d / b;
            const y0 = t.surfaceY + k.hoch * k.p.ansatz;
            const kh = k.hoch - k.hoch * k.p.ansatz;
            for (let j = Math.floor(mitte - halb); j <= Math.floor(mitte + halb); j++) {
                if (j < 0 || j >= nF) continue;
                const v = Math.min(1, Math.abs((j + 0.5 - mitte) * b * d) / t.T);
                const top = k.p.nadel ? y0 + kh * (1 - v) : y0 + kh / 2 + (kh / 2) * Math.sqrt(1 - v * v);
                f(j * nA + e, (top - o.grundY - augen[e]) / d);
            }
        };
        const arten = [];
        const artIdx = new Map();
        const aus = [];
        const AP = new Map();
        for (const [cx, cz] of zellen.values()) {
            const stehen = forestStehende(cx, cz, o.geboren, o.pk, true);
            for (let j = 0; j < stehen.length; j++) {
                const t = stehen[j];
                let p = AP.get(t.sp);
                if (p === undefined) {
                    p = o.art(t.sp) || null;
                    AP.set(t.sp, p);
                }
                if (!p || !(p.h > 0) || !Number.isFinite(t.surfaceY)) continue;
                const hoch = p.h * t.s;
                const dx = t.x - o.ax;
                const dz = t.z - o.az;
                const d = Math.hypot(dx, dz);
                if (d < o.dVon || d > o.dBis) continue;
                let a = Math.atan2(dx, dz) - azVon;
                a -= 2 * Math.PI * Math.floor(a / (2 * Math.PI));
                const f = a / dAz - 0.5;
                const i0 = Math.floor(f);
                const w = f - i0;
                const i1 = i0 + 1;
                const inA = (i) => i >= 0 && i < nAz;
                let traegt = false;
                for (let e = 0; e < nA && !traegt; e++) {
                    const T0 = inA(i0) ? theta[i0 * nA + e] : inA(i1) ? theta[i1 * nA + e] : NaN;
                    const T1 = inA(i1) ? theta[i1 * nA + e] : T0;
                    if (!Number.isFinite(T0)) continue;
                    traegt = (t.surfaceY + hoch - o.grundY - augen[e] + (o.saumM || 0)) / d >= T0 + (T1 - T0) * w;
                }
                if (!traegt) continue;
                const k = { t, p, hoch, d };
                for (let e = 0; e < nA; e++) fach(k, e, (q, w) => (umriss[q] = Math.max(umriss[q], w)));
                kand.push(k);
            }
        }
        for (const k of kand) {
            let traegt = false;
            for (let e = 0; e < nA && !traegt; e++)
                fach(k, e, (q, w) => (traegt = traegt || w >= umriss[q] - (o.saumM || 0) / k.d));
            if (!traegt) continue;
            const { t, p } = k;
            let ai = artIdx.get(t.sp);
            if (ai === undefined) {
                ai = arten.length;
                arten.push(t.sp);
                artIdx.set(t.sp, ai);
            }
            aus.push(t.x, t.z, t.surfaceY, k.hoch, t.T, p.ansatz, p.nadel ? 1 : 0, ai);
        }
        return { baeume: new Float64Array(aus), arten, zellen: zellen.size, rufe, kandidaten: kand.length };
    }
    // die Felder eines Baums der Kamm-Krone (forestKammKronen `baeume`)
    const KAMM_FELDER = 8;

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
    // feuchteAt(x,z,surfY), stand(x,z), schnee(x,z,y), ort(x,z), wuchs, ortFrei?(x,z,T) }. Die rng()-Aufruf-REIHENFOLGE ist heilig
    // (byte-deterministisch).
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
        const wuchs = forestWuchs(ctx); // der Wuchs des Orts (Pflicht): die Trockengrenze und die Arten nach Klima und Zeit
        const out = [];
        for (let i = 0; i < F.dartsPerCell; i++) {
            const x = (cx + rng()) * CELL;
            const z = (cz + rng()) * CELL;
            // Boden + Wasser: EIN Oberflächen-Scan, die Wasser-Marge selbst hergeleitet. DER WASSER-LESER VOR JEDEM VERWERFEN
            // (w20-wald-kosten, Täter-Matrix z289): jeder Dart fragt das EINE Wasser über seinem Boden, bevor ein Wurf ihn nimmt —
            // bis hier verwarfen Geburt, Lichtung und Waldgrenze (w16) ihn davor, und am Fluss der Schau-2 rief kein Dart der
            // Zellen um den Spieler das Wasser (gate:werk-im-wasser KONSUM). Die Würfe des Darts bleiben, wie sie waren.
            const surfaceY = ctx.surfaceYAt(x, z);
            const waterY = ctx.waterYAt(x, z);
            const sd = forestStandDensity(ctx.fbm, x, z);
            const st = ctx.stand(x, z); // der Stand des Standorts (FOREST_PACK.bestand): Lichtung und Schluss
            const wurf = rng();
            // die Geburt ohne die Lichtung: die Lichtung nimmt erst nach der Selbst-Ausdünnung (`gelichtet`, unten)
            const geburt = forestGeburt(sd);
            if (wurf > geburt) continue;
            if (surfaceY === null || !Number.isFinite(surfaceY)) continue;
            // die Waldgrenze (`forestWaldgrenze`): derselbe Wurf gegen die Geburt im Schnee des Sommers am Boden des Darts —
            // ohne Schnee bleibt jeder Wurf, wie er war
            const grenze = geburt * forestWaldgrenze(ctx.schnee(x, z, surfaceY), wuchs.wald);
            if (wurf > grenze) continue;
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
            // trägt der Ort keine Art (Klima und Zeit nehmen Nadel- UND Laubholz, kein Auto-Rezept streut), steht kein Baum —
            // in der Heimat nie (jedes Gewicht trägt seinen Sockel > 0)
            if (!(wsum > 0)) continue;
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
            // GRÖSSE + optional Mammut via phyto-core Helper: die Ertragstafel der Art in der Phase ihres Flecks (der Lebenslauf
            // des Bestands, FOREST_ERTRAG). RNG-Ordnung unverändert: size (ue/Überhälter) zuerst; Mammut-Roll nur wenn
            // sp !== baum_erle (Species-Gate Caller-lokal — sonst Drift an prio/keep/…).
            let s = forestTreeSize(rng, sp, forestFleckPhase(x, z, seedInt));
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
            // DER GRUND NIMMT NACH DEM WUCHS (laub-kante, wie die Lichtung unten): der Dart wird geboren und nimmt im Urteil des
            // Dachs seinen Platz, der Grund nimmt ihn danach (`gelichtet`) — ein Haus im Wald nimmt die Kronen über seinem Grund
            // und sonst keinen Baum. Bis hier fiel er vor der Geburt: unter der Selbst-Ausdünnung (Matérn III) wuchs, wen er
            // überwuchs, in die Lücke, und wen DER überwächst, fiel — der Ort würfelte den Bestand um sich neu (gate:fernwald F,
            // Eiche −2123/−2153, ein Haus über ihrer einzigen Nachbarin, der Birke 9,8 m: frisch standen zwei Tannen im
            // Freistand-Kreis, 8,1 und 13,5 m, die vor dem Haus nicht standen — Gestalt gemerkt 3 · frisch 2).
            const amGrund = !!ctx.ortFrei && !ctx.ortFrei(x, z, T);
            // DER SAUM AM SIEDLUNGSRAND (`forestOrt`, w20-wald-kosten): derselbe Wurf gegen die Geburt jenseits des Rands eines
            // Orts (ctx.ort: der Abstand, `forestOrtAbstand` über die Ränder des Wirts) — wie K10 NACH allen Würfen des Darts:
            // ein Ort dünnt den Bestand um sich, er würfelt ihn nie neu; ohne Ort bleibt jeder Wurf, wie er war.
            const gOrt = grenze * forestOrt(ctx.ort(x, z), slope);
            if (wurf > gOrt) continue;
            const dart = { x, z, sp, s, T, prio, keep, totRoll, rotY, seed, surfaceY, schluss: forestSchluss(st) };
            // DIE LICHTUNG NIMMT NACH DEM WUCHS (w28-laub-kante): derselbe Wurf gegen die Geburt × Lichtung — der Dart wird
            // geboren und nimmt im Bestand seinen Platz (das Urteil des Dachs zählt ihn), die Lichtung (Mahd, Weide, Wurf)
            // nimmt ihn danach: er steht nicht (`forestStehende`) und schirmt keinen Unterstand. Bis hier fiel er vor der
            // Geburt — unter der Selbst-Ausdünnung (Matérn III) wuchs der gedünnte Rest in die Lücke, die Lichtung schloss
            // sich (Mess-Wiese, Ring 25 m: Kronen-Deckung 0,114 → 0,164, 12 Bäume); jetzt trägt sie Lichtung × Bestand.
            if (amGrund || wurf > gOrt * forestLichtung(st)) dart.gelichtet = true; // nur am genommenen Dart: kein Stehender trägt das Feld
            out.push(dart);
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
            // DIE STUFE HÄLT IHRE ZEILE (w28-stamm-krone, `P._roehreDetail`): steht der Baum über dem Budget seiner Stufe,
            // senkt foundry-core buildInstance das Detail, und jede Röhre gibt Seiten ab — die Seiten-Zahl folgt dem Budget.
            if (P._roehreDetail > 0 && P._roehreDetail < 1) R = Math.max(5, Math.floor(R * P._roehreDetail));
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
    // w28-licht-regen (rein additiv): sockel + sonne·sun ist das GESAMTE Licht der Zeile. Die Decke (grey) teilt es: von der
    // direkten Sonne bleibt (1 − grey)^direktHoch (unter Regen 6 %, unter Sturm 0,2 % — der harte Schatten weicht), der Himmel
    // traegt den Rest als diffuses Licht (× 1 + himmelHub·grey, wie das Hemi-Licht des Labors) und ergraut mit himmelGrau·grey
    // (wie der Himmel des Labors zur Decke lerpt).
    var WX_LICHT = { sockel: 0.35, sonne: 0.65, direktHoch: 3, himmelHub: 0.35, himmelGrau: 0.82 };

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
    // DIE VERTEILUNG DES WETTERS AM ORT (Reise, rein additiv — ohne `ort` bewegt sich kein Wert): `ort` ist das Δ des Planeten
    // zum Anker (gelaende-core `ortGesetz(teil).wetter`: `regenQuote` der Anteil der nassen Zeit, `sturmQuote` der des Sturms).
    // Die Stufe am Ort ist die Stufe der Heimat plus der Weg des Quantils der Front: Q(1 − Anteil − Δ) − Q(1 − Anteil), der Anteil
    // aus derselben Verteilung gelesen (die drei Wellen mit unabhängiger Phase, 48³ Punkte, einmal je Faden) — am Anker ist der
    // Weg Q(x) − Q(x) = 0. Gemerkt je Δ-Objekt. Leser: `wetterAt`.
    var _frontV = null;
    function frontVerteilung() {
        if (_frontV) return _frontV;
        var W = WIND_FELD.front.wellen,
            N = 48,
            sw = 0;
        for (var i = 0; i < W.length; i++) sw += W[i][1];
        var v = new Float64Array(N * N * N),
            k = 0;
        for (var a = 0; a < N; a++)
            for (var b = 0; b < N; b++)
                for (var c = 0; c < N; c++) {
                    var f =
                        W[0][1] * Math.sin((2 * Math.PI * (a + 0.5)) / N) +
                        W[1][1] * Math.sin((2 * Math.PI * (b + 0.5)) / N) +
                        W[2][1] * Math.sin((2 * Math.PI * (c + 0.5)) / N);
                    v[k++] = 0.5 + (0.5 * f) / sw;
                }
        v.sort();
        return (_frontV = v);
    }
    function frontAnteil(V, stufe) {
        var lo = 0,
            hi = V.length;
        while (lo < hi) {
            var m = (lo + hi) >> 1;
            if (V[m] < stufe) lo = m + 1;
            else hi = m;
        }
        return (V.length - lo) / V.length;
    }
    function frontQuantil(V, p) {
        if (p >= 1) return 1.01;
        if (p <= 0) return -0.01;
        return V[Math.min(V.length - 1, Math.floor(p * V.length))];
    }
    // DER NEBEL AM ORT (klima-kontinent, rein additiv — ohne `ort` bewegt sich kein Wert): `nebelQuote` ist das Δ des Anteils der
    // regenfreien Zeit mit Nebel (planet-core `planetKlimaR` o.nebel: Küstenluft, kalter Auftrieb, feuchte Luft). Die Feuchte ist EINE
    // Welle (gleichverteilte Phase): ihr Anteil über der Stufe s ist 1/2 − asin(2s − 1)/π, die Stufe zum Anteil p ist 1/2 + cos(π·p)/2;
    // der Weg der Nebel-Stufe ist Stufe(Anteil + Δ) − Stufe(Anteil), am Anker 0.
    function nebelStufe(p) {
        if (p >= 1) return -0.01;
        if (p <= 0) return 1.01;
        return 0.5 + 0.5 * Math.cos(Math.PI * p);
    }
    var _wetterVersatzJe = new WeakMap();
    function wetterVersatz(ort) {
        var vs = _wetterVersatzJe.get(ort);
        if (vs) return vs;
        if (!(Number.isFinite(ort.regenQuote) && Number.isFinite(ort.sturmQuote)))
            throw new Error("wetterAt: das Δ des Orts trägt regenQuote oder sturmQuote nicht");
        if (!Number.isFinite(ort.nebelQuote))
            throw new Error(
                "wetterAt: das Δ des Orts trägt nebelQuote nicht (der Nebel liest Meer und Auftrieb des Planeten)"
            );
        var V = frontVerteilung(),
            st = WIND_FELD.front.stufen;
        var weg = function (stufe, d) {
            var a = frontAnteil(V, stufe);
            var z = Math.min(1, Math.max(0, a + d));
            return frontQuantil(V, 1 - z) - frontQuantil(V, 1 - a);
        };
        var aN = 0.5 - Math.asin(2 * st.nebel - 1) / Math.PI;
        var zN = Math.min(1, Math.max(0, aN + ort.nebelQuote));
        vs = {
            regen: weg(st.regen, ort.regenQuote),
            sturm: weg(st.sturm, ort.sturmQuote),
            nebel: nebelStufe(zN) - nebelStufe(aN),
        };
        _wetterVersatzJe.set(ort, vs);
        return vs;
    }
    function wetterAt(saat, x, z, t, ort) {
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
        var stSturm = st.sturm,
            stRegen = st.regen,
            stNebel = st.nebel;
        if (ort) {
            var vs = wetterVersatz(ort);
            stSturm += vs.sturm;
            stRegen += vs.regen;
            stNebel += vs.nebel;
        }
        var zeile = "klar";
        if (f >= stSturm) zeile = "sturm";
        else if (f >= stRegen) zeile = "regen";
        else if (f >= st.bewoelkt) zeile = "bewoelkt";
        else if (feuchte >= stNebel) zeile = "nebel";
        return { zeile: zeile, front: f, feuchte: feuchte };
    }

    // DAS WETTER-FELD AM ORT (wetter-am-ort, rein additiv — `wetterAt`, WIND_FELD und jede Zahl davor stehen byte-gleich). Das
    // Wetter ist kein Wort der Welt, es ist ein FELD: je Ort (x, z) zur Zeit t die fünf Kanäle {fog, sun, grey, wind, rain} der
    // Front über ihm (`wetterAt`: Saat, Ort, Uhr und das Δ des Planeten `ort` — Lage und Neigung der Achse, planet-core) —
    // stetig über die Stufen der Front (die Zeile wechselt über ±`kante` der Front-Stärke, in der Mitte jeder Stufe steht ihre
    // Zeile), der Regen geformt vom Relief (`relief`: der Hang, den der Grundwind hinaufsteigt — Δh über `schrittM` windauf —
    // hebt ihn um `hub` × Steigung, im Lee sinkt er: Steigungsregen) und gelenkt vom EINGRIFF `ein.hier` {x, z, feld}: das Feld,
    // das die Region um (x, z) trägt (in der Welt das Wort am Spieler: sein Übergang, sein Wort, ein Wunsch der Welt), gilt voll
    // bis `hierM[0]` und läuft bis `hierM[1]` in die Natur aus. DIE VERLAGERUNG (same.kopplung.terraform#1): der Regen, den der
    // Eingriff an p zieht, fehlt an seinem Lee-Partner q = p + `leeM` windab (die Grundrichtung der Saat, `windGrund`, mit der die
    // Fronten ziehen) zur selben Uhr — Ort für Ort (`wetterZug`): Δ = g(p)·(T − R(p)), T das Wort vom Hang geformt (min(1, ρ·Wort)),
    // R der Regen der Natur, beide mit dem Relief ρ desselben Orts. Das Wort hält am Ziel an JEDER Uhr (im Kern Regen = T); das Lee
    // zahlt davon, was es trägt (min(Δ, R(q)); nimmt der Eingriff Regen weg, fällt er im Lee, bis es voll ist: max(Δ, R(q) − 1)) —
    // den Rest bringt die Front des Worts aus dem Dampf der Säule (Regen ist das Kondensat, nicht das Wasser der Luft: die Säule
    // trägt auch unter klarem Himmel 10–50 mm niederschlagbares Wasser, AMS Glossary „precipitable water“; WMO 2017, Weather
    // Modification: ein Eingriff wandelt Dampf, er verlagert Niederschlag). So hält jedes Paar R(p) + R(q) mit = ohne, wo das Lee
    // den Zug trägt, also jede Stichprobe, die das Lee um leeM windab verschiebt. Am Kern von main 64fcf12e kappte Δ ≤ R(q) das
    // Ziel selbst: unter trockenem Lee regnete das Wort nicht (die Schale der Werkstatt unter „rainy“ 0, gate:werkstatt-weg).
    // Bis hier war der Ausgleich EIN Faktor einer Region (c = Σ g·(Wort − Natur) ÷ Σ gL·Natur über 96 Punkte bis 6 600 m, ohne
    // Relief): der Kern der Region ist eine andere Stichprobe als ihre Summe (die Wellen der Front 6 600 · 4 100 · 2 500 m) — die
    // Bilanz der Station hielt an 12 von 200 Uhren (Mess-Wiese), und im Kern stand das Wort ohne Relief: kein Hang, den der Spieler
    // hebt, änderte dort den Regen. Das Relief formt jeden Ort, auch den Eingriff.
    // `ein.zeilen`: die Zeilen der Welt je Zeile der Front (die Welt spricht aus IHRER Tafel), ohne sie WX_GESETZ.
    // `ein.hoehe(x, z)`: die Höhe des Gesetzes (ohne sie kein Relief). `aus`: ein Leser, der je Bild hunderte Male fragt, gibt
    // sein Objekt mit. `profil`: der Wind über der Höhe (Hellmann, neutral geschichtet über offenem Land: u(h) = u(bezugM) ·
    // (h / bezugM)^alpha, unter `minM` steht der Wert von minM). `maeander`: die Zahlen des Mäanders von `windRichtung` (dort
    // stehen sie als Literale, byte-treu; gate:wetter-wache prüft d/dt `windWeg` = `windRichtung`). Leser: die Welt
    // (`_wetterFeldAm`: Wind, Wolke, Rauch, Tracht, Plan) und gate:wetter-wache (O: gleiche Saat → gleiches Feld, Bilanz, Relief).
    var WETTER_ORT = Object.freeze({
        kante: 0.04,
        hierM: Object.freeze([3300, 6600]),
        leeM: 13200,
        relief: Object.freeze({ schrittM: 600, hub: 6, min: 0.4, max: 1.8 }),
        profil: Object.freeze({ bezugM: 10, alpha: 1 / 7, minM: 1 }),
        maeander: Object.freeze({ a: 0.5, w1: 0.009, b: 0.22, w2: 0.0257, n: 7, m: 5 }),
    });
    var WX_KANAELE = Object.freeze(["fog", "sun", "grey", "wind", "rain"]);
    function wxGlatt(a, b, v) {
        if (v <= a) return 0;
        if (v >= b) return 1;
        var u = (v - a) / (b - a);
        return u * u * (3 - 2 * u);
    }
    // (eine eingefrorene Tafel prüft der Kern einmal — der Wirt reicht je Welt EINE, je Ruf des Felds; eine offene je Ruf)
    var _wxGeprueft = null;
    function wxZeilen(Z) {
        if (Z === _wxGeprueft) return Z;
        for (var z in WX_GESETZ)
            for (var i = 0; i < WX_KANAELE.length; i++)
                if (!(Z[z] && Number.isFinite(Z[z][WX_KANAELE[i]])))
                    throw new Error("wetterFeldAm: die Zeile " + z + " trägt " + WX_KANAELE[i] + " nicht");
        var fest = Object.isFrozen(Z);
        for (var k in WX_GESETZ) fest = fest && Object.isFrozen(Z[k]);
        if (fest) _wxGeprueft = Z;
        return Z;
    }
    // Die Natur am Ort: die Front (`wetterAt`) stetig über ihre Stufen — klar ↔ nebel über der Feuchte, dann bewoelkt · regen ·
    // sturm über der Front-Stärke, je Schwelle ±kante weich (die Schwellen des Orts: `wetterVersatz`).
    function wetterNatur(saat, x, z, t, ort, Z, o) {
        var w = wetterAt(saat, x, z, t, ort);
        var st = WIND_FELD.front.stufen,
            k = WETTER_ORT.kante;
        var stSturm = st.sturm,
            stRegen = st.regen,
            stNebel = st.nebel;
        if (ort) {
            var vs = wetterVersatz(ort);
            stSturm += vs.sturm;
            stRegen += vs.regen;
            stNebel += vs.nebel;
        }
        var n = wxGlatt(stNebel - k, stNebel + k, w.feuchte);
        var s1 = wxGlatt(st.bewoelkt - k, st.bewoelkt + k, w.front);
        var s2 = wxGlatt(stRegen - k, stRegen + k, w.front);
        var s3 = wxGlatt(stSturm - k, stSturm + k, w.front);
        for (var i = 0; i < WX_KANAELE.length; i++) {
            var c = WX_KANAELE[i];
            var v = Z.klar[c] + (Z.nebel[c] - Z.klar[c]) * n;
            v += (Z.bewoelkt[c] - v) * s1;
            v += (Z.regen[c] - v) * s2;
            v += (Z.sturm[c] - v) * s3;
            o[c] = v;
        }
        o.front = w.front;
        o.feuchte = w.feuchte;
        o.zeile = w.zeile;
        return o;
    }
    // Der Steigungsregen am Ort: der Faktor des Regens aus dem Hang windauf (Grundrichtung der Saat)
    function wetterRelief(saat, x, z, hoehe) {
        var R = WETTER_ORT.relief,
            g = windGrund(saat);
        var h0 = hoehe(x, z),
            h1 = hoehe(x - g.x * R.schrittM, z - g.z * R.schrittM);
        if (!(Number.isFinite(h0) && Number.isFinite(h1)))
            throw new Error("wetterFeldAm: die Höhe am Ort ist endlich (" + h0 + ", " + h1 + ")");
        var f = 1 + (R.hub * (h0 - h1)) / R.schrittM;
        return f < R.min ? R.min : f > R.max ? R.max : f;
    }
    // DER ZUG DES EINGRIFFS an p (Gewicht g > 0) und sein Lee-Partner q = p + leeM windab: `d` der Zug an p (das Wort hält dort,
    // g·(T − R(p)), was immer das Lee trägt), `zahlt` der Teil, den das Lee hergibt (sein Regen bleibt in [0, 1]), `rp`/`rq` der
    // Regen der Natur an p und q (mit Relief, wenn `E.hoehe`), die Kanäle der Natur an p in `_wxP` (Leser: `wetterFeldAm`)
    var _wxP = {},
        _wxQ = {},
        _wxZug = { d: 0, zahlt: 0, rp: 0, rq: 0 };
    function wetterZug(saat, px, pz, t, ort, Z, E, H, g) {
        var W = WETTER_ORT,
            gw = windGrund(saat),
            qx = px + gw.x * W.leeM,
            qz = pz + gw.z * W.leeM;
        var rp = wetterNatur(saat, px, pz, t, ort, Z, _wxP).rain,
            rq = wetterNatur(saat, qx, qz, t, ort, Z, _wxQ).rain,
            T = H.feld.rain;
        if (E.hoehe) {
            var fp = wetterRelief(saat, px, pz, E.hoehe);
            rp = Math.min(1, rp * fp);
            rq = Math.min(1, rq * wetterRelief(saat, qx, qz, E.hoehe));
            T = Math.min(1, T * fp);
        }
        var d = g * (T - rp);
        _wxZug.d = d;
        _wxZug.zahlt = d > 0 ? Math.min(d, rq) : Math.max(d, rq - 1);
        _wxZug.rp = rp;
        _wxZug.rq = rq;
        return _wxZug;
    }
    function wetterFeldAm(saat, x, z, t, ort, ein, aus) {
        if (!(Number.isFinite(x) && Number.isFinite(z) && Number.isFinite(t)))
            throw new Error("wetterFeldAm: Ort und Zeit sind endlich (" + x + ", " + z + ", " + t + ")");
        var E = ein || {},
            Z = E.zeilen || WX_GESETZ,
            o = aus || {},
            H = E.hier,
            W = WETTER_ORT,
            g = 0,
            i,
            V;
        if (Z !== WX_GESETZ) wxZeilen(Z);
        if (H) {
            if (!(Number.isFinite(H.x) && Number.isFinite(H.z) && H.feld))
                throw new Error("wetterFeldAm: der Eingriff trägt x, z, feld");
            for (i = 0; i < WX_KANAELE.length; i++)
                if (!Number.isFinite(H.feld[WX_KANAELE[i]]))
                    throw new Error("wetterFeldAm: das Feld des Eingriffs trägt " + WX_KANAELE[i] + " nicht");
            g = 1 - wxGlatt(W.hierM[0], W.hierM[1], Math.hypot(x - H.x, z - H.z));
        }
        o.hier = 0;
        o.lee = 0;
        // IM EINGRIFF (g > 0; bis hierM[0] voll): die Kanäle laufen ins Feld des Eingriffs, der Regen ist die Natur am Hang plus der
        // Zug — im Kern das Wort am Hang, an jeder Uhr (das Lee zahlt, was es trägt, den Rest bringt die Front des Worts)
        if (g > 0) {
            V = wetterZug(saat, x, z, t, ort, Z, E, H, g);
            for (i = 0; i < WX_KANAELE.length; i++) {
                var c = WX_KANAELE[i];
                o[c] = _wxP[c] + (H.feld[c] - _wxP[c]) * g;
            }
            o.rain = V.rp + V.d;
            o.front = _wxP.front;
            o.feuchte = _wxP.feuchte;
            o.zeile = _wxP.zeile;
            o.hier = g;
            return o;
        }
        wetterNatur(saat, x, z, t, ort, Z, o);
        if (E.hoehe) o.rain = Math.min(1, o.rain * wetterRelief(saat, x, z, E.hoehe));
        if (!H) return o;
        // IM LEE: der Partner p = (x, z) − leeM windab liegt im Eingriff — hier fehlt, was er zog
        var gw = windGrund(saat),
            px = x - gw.x * W.leeM,
            pz = z - gw.z * W.leeM;
        var gp = 1 - wxGlatt(W.hierM[0], W.hierM[1], Math.hypot(px - H.x, pz - H.z));
        if (gp > 0) {
            V = wetterZug(saat, px, pz, t, ort, Z, E, H, gp);
            o.lee = o.rain > 0 ? V.zahlt / o.rain : 0;
            o.rain = V.rq - V.zahlt;
        }
        return o;
    }
    // DER WEG DES WINDS (wetter-am-ort): ∫ windRichtung(saat, τ) dτ von t0 bis t1 in Metern je m/s — geschlossen (Jacobi–Anger:
    // e^{i·a·sin φ} = Σ J_n(a)·e^{i·n·φ}, je Glied ein Integral der Uhr, n < maeander.n, m < maeander.m: der Rest < 1e-7 m/s).
    // Eine reine Funktion von Saat und Uhr, keine Summe über Bilder: die Wolken-Schicht zieht mit dem EINEN Wind (dieselbe
    // Richtung wie Gras, Krone und Rauch), auf jeder Seite einer Uhr am selben Ort. Leser: die Welt (`_wolkenWeg`).
    function wxBessel(n, x) {
        var k = n < 0 ? -n : n,
            s = 0,
            f = 1;
        for (var j = 1; j <= k; j++) f *= j;
        var term = Math.pow(x / 2, k) / f;
        for (var i = 0; i < 12; i++) {
            s += term;
            term *= -(x * x) / 4 / ((i + 1) * (i + 1 + k));
        }
        return n < 0 && k % 2 ? -s : s;
    }
    function windWeg(saat, t0, t1) {
        if (!(Number.isFinite(t0) && Number.isFinite(t1)))
            throw new Error("windWeg: die Uhr ist endlich (" + t0 + ", " + t1 + ")");
        var w = windSaat(saat),
            Mq = WETTER_ORT.maeander;
        var re = 0,
            im = 0;
        for (var n = 1 - Mq.n; n < Mq.n; n++) {
            var jn = wxBessel(n, Mq.a);
            for (var m = 1 - Mq.m; m < Mq.m; m++) {
                var j = jn * wxBessel(m, Mq.b),
                    om = n * Mq.w1 + m * Mq.w2,
                    ph = n * w.p1 + m * w.p2;
                if (om === 0) {
                    re += j * Math.cos(ph) * (t1 - t0);
                    im += j * Math.sin(ph) * (t1 - t0);
                } else {
                    re += (j * (Math.sin(om * t1 + ph) - Math.sin(om * t0 + ph))) / om;
                    im -= (j * (Math.cos(om * t1 + ph) - Math.cos(om * t0 + ph))) / om;
                }
            }
        }
        var c = Math.cos(w.t0),
            s = Math.sin(w.t0);
        return { x: s * re + c * im, z: c * re - s * im };
    }
    // Der Wind über der Höhe h (m über Grund) als Faktor des Winds am Ort (Hellmann, `profil`)
    function windProfil(h) {
        var Pf = WETTER_ORT.profil;
        if (!Number.isFinite(h)) throw new Error("windProfil: die Höhe ist endlich (" + h + ")");
        return Math.pow(Math.max(h, Pf.minM) / Pf.bezugM, Pf.alpha);
    }

    // ===================== DIE KARTE (W6): der Codec des EINEN Karten-Atlas — rein, THREE-frei =====================
    // Die Fernstufe einer Art ist EINE Schicht im Array-Atlas des Hosts: die V Ansichten VERTIKAL gestapelt, wie der
    // Welt-Renderer sie backt (S2, `_karteWeltBacken`: Zeile 0 oben). Die GPU-Ablage des Hosts (`KARTE_RECHNER_WGSL`: Mips,
    // BC1/BC5) rechnet DIESES Gesetz, `impostorMips` ist es auf der CPU (die Linse liest es; die Kodierung der Transport-
    // Schale fiel mit S2 — `karteKodiere` las niemand mehr):
    //   schwelle      Alpha-Schwelle: Binarisierung der Karte, Mip-Deckung und der alphaTest der Welt — dort, wo der Filter der
    //                 Welt (bilinear, zwei Stufen trilinear gemischt) deckt, was Stufe 0 deckt (Castaño 2010, an der Schwelle
    //                 statt an der Alpha gemessen; gate:streu-wahrheit „am Schirm", die Scheibe: 0,34 → 1,20 · 0,42 → 1,01 ·
    //                 0,45 → 0,995 · 0,5 → 0,95). 0,34 dehnte jeden Rand des Saums und vereinte die Muster zweier Stufen: die
    //                 Karte deckte am Schirm 1,06–1,16 ihrer Stufe 0 (CPU-Zwilling, Tafel-Größen, Strauch · Birke · Eiche ·
    //                 Fichte · Tanne 1,13 · 1,16 · 1,16 · 1,13 · 1,06; bei 0,45 1,05 · 1,08 · 1,08 · 1,01 · 0,97; bei 0,5
    //                 1,00 · 0,97 · 0,97 · 0,93 · 0,94, aber an ½ verliert die Mischung ihre Teil-Ränder — Löcher im Kern der
    //                 Birke 3,4 → 9,6 %) — die Wiese stand dunkler, die Lücken zum Licht zu (w24-strauch-saum, Koordinator 08.11.:
    //                 bild:wiese@0.5 Kronen-Mitte 48,7 → 45,5)
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
    //                 Auflösung als rgba8 (das lineare Feld der Sicht über die Richtung, w14), Stufe 0 (die GPU
    //                 zieht die Mips) — ein weiches Licht-Feld der Krone
    //   saum          die Stärke des Saums im Wahl-Schlüssel JEDER Stufe (`karteSaumSchluessel`): so weit verschiebt das
    //                 Muster die geglättete Deckung eines Texels an der Höhenlinie g = ½ (der Hub fällt mit 4 g (1 − g) zum Kern
    //                 und ins Leere) — 1,8 (w28-laub-deckung; Modell, kante Stufe 0 / 1 bei 1,2 · 1,8 · 2,4 · 3,2: Scheibe Laub
    //                 0,252 / 0,153 · 0,114 / 0,105 · 0,092 / 0,111 · 0,106 / 0,139, Nadel 0,141 / 0,076 · 0,104 / 0,125 · 0,114 /
    //                 0,187 · 0,156 / 0,254; Kegel Laub 0,258 / 0,191 · 0,144 / 0,093 · 0,118 / 0,072 · 0,136 / 0,093). Bis w28 8,4
    //                 am eigenen Ort ohne Bindung: das Muster führte, das Band grenzte
    //                 (Radeon, Tafel-Pose, w24-strauch-saum: strauch bei 2,4 / 3,2 / 4 / 4,8 / 6 / 7,2 / 8,4 / 9,6 0,249 / 0,238 /
    //                 0,234 / 0,229 / 0,216 / 0,212 / 0,211 / 0,212 — sie sättigt; GTX bei 6 ein Raster am Strauch, zweiton 0,0025)
    //   saumZelle     die Zelle des Musters in Schritten der Stufe (`saumWeite`), gemessen an der gröberen Achse des Texels: die
    //                 Lappen und Buchten, die die Stufe tragen kann, ohne zu dithern (Radeon, Tafel-Pose, main 03300ec8: die Zelle aus
    //                 der Blattgröße maß beim Strauch 55, bei Birke und Eiche 21 Stufe-0-Texel — ein Wellen-Hang statt eines
    //                 Saums, laub-kante strauch 0,4023, birke 0,3293)
    //   saumBand      die Glättung des Bands in binomialen 3×3-Gängen (8: der 17 × 17-Kern, Binomial 16 / 65536), der Rand der
    //                 Ansicht leer — der Rahmen ist nie der Umriss (an der Scheibe, Kohärenz 0,944: Zelle 6 / Band 4 / Stärke
    //                 1,6 franste Stufe 0 auf 0,81 — zu zahm; Radeon 9f4459c3 mit 8 / 6 / 2,4 / 0,05: birke 0,2246, strauch
    //                 0,3317; im CPU-Modell der Tafel-Abstände trägt 6 / 8 die Birke von 0,38 auf 0,22, den Strauch nah auf 0,18)
    //   saumMin       die geglättete Deckung, ab der ein Texel im Band wählbar ist (kein Fleck, der ohne Krone schwebt; 0,01
    //                 trug am Strauch ein Raster, zweiton 0,0011)
    //   saumWeite     der Schritt des Saums in Texeln der gröberen Achse (`saumSchritt`): Band UND Zelle messen in ihm. Die Welt
    //                 liest jede verkleinerte Stufe mit einem Texel der gröberen Achse je Pixel (anisotrop), ihr Laub-Versatz
    //                 und die zeitliche Auflösung decken drei Pixel, die Linse glättet mit σ 2 px — ein Saum im Maß EINES
    //                 Texels (Zelle 6, Band σ 2) stand am Schirm als 6-px-Welle und las gerade (w24-strauch-saum: der
    //                 Strauch der Tafel steht 17–25 px hoch, verkleinert auf Stufe 1–3, Bäume vergrößert auf Stufe 0)
    // DIE TAFEL-POSE mit 2,4 / 6 / 8 / 0,05 (laub-kante je Art, main ef667956 → c61e3a9b, Radeon 890M, je zwei Läufe ±0,0007):
    // birke 0,2721 → 0,1889 · eiche 0,2044 → 0,1553 · fichte 0,2122 → 0,1575 · tanne 0,2232 → 0,1770 · strauch 0,3911 → 0,3536
    // (GTX 1060 vorher: birke 0,3324 · eiche 0,2373 · tanne 0,2226 · fichte 0,2122 · strauch 0,4076). Der Strauch steht als
    // Band unter fremdem Laub auf dem Weg: 72 % seines gezählten Rands ist seine Sohle, ohne sie 0,337 (die Flanken).
    // DER STRAUCH (w24-strauch-saum): seine Sohle war Laub im Grund (foundry-core S7 galt nur der Baum-L0: die Karte schnitt
    // Karten bis 27 % seiner Höhe unter y = 0 als Gerade), seine Flanken der Saum im Maß eines Texels (`saumWeite`). Mit 8,4 /
    // 2,5 / 8 / 0,02 / 3 (laub-kante, Tafel-Pose): Radeon c61e3a9b → 9adc557b birke 0,1887 → 0,1688 · eiche 0,1556 → 0,1438 ·
    // fichte 0,1575 → 0,1500 · tanne 0,1775 → 0,1612 · strauch 0,3515 → 0,2109; GTX 41d69a4f (der w23-Saum in derselben Welt
    // → dieser) birke 0,2056 → 0,1753 · eiche 0,1788 → 0,1417 · fichte 0,1474 → 0,1470 · tanne 0,1691 → 0,1636 · strauch
    // 0,3242 → 0,2083.
    //   lappen        DIE LAPPEN DER GLATTEN KETTE (w26-eiche-kante, lod.K1#1): die Zelle des Laub-Musters (`karteSaumMuster`, 1 − F1)
    //                 in Stufe-0-Texeln, dieselbe in jeder Stufe — ab der Stufe, auf der das Blatt des Baum-Zweigs unter zwei
    //                 Texel fällt (`lappenAb`, ZWEIG_BLATT.laenge), bis die Lappen-Zelle unter einen BC-Block fällt (`minSeite`:
    //                 Stufen 3 und 4), trägt die geglättete Deckung des Blatt-Atlas den Faktor 2^(lappenHub · (Muster − ½)) (`impostorMips`
    //                 glatt) — die Wahl folgt dem Muster, die Alpha der Lücke bleibt über 0 (die Farbe liest zwei Oktaven über der
    //                 Deckung, BLATT_FARBE_OKTAVE: ein linearer Faktor mit Lücken bei 0 trug gate:pflanzen-nah Farb-Korn bc 0,0165 →
    //                 0,0370 > 0,0358, die Lappen auf Stufe 5 die BC3-Fracht der Weide auf 16 px 3 % zu dunkel). Bis hier schmolz jede
    //                 Laub-Karte der L1 ab Stufe 3 zu ihrer Hülle (Stufe 4 ein Klecks, das „Riesenblatt" von K58 am Baum-Zweig), die
    //                 Krone aus 147 Klecksen trug runde Bögen: Radeon, Spielgang der Station, f:eiche:L1 0,3261. Kronen-Modell (147
    //                 Karten, Test an ½, kante je λ 2–4, die schlechteste): Zelle 0 · 1 · 2 · 3 main 0,243 · 0,208 · 0,202 · 0,160 →
    //                 0,175 · 0,208 (λ 2, unberührt) · 0,168 · 0,163 (Zelle 48: Zelle 0 0,210; ab Stufe 2: λ 2 0,150 → 0,201)
    //   saumGestalt   DER RAND DER GESTALT (w28-karte-stamm, `karteSaumGestalt`): die Kohärenz des eigenen Umrisses, bis zu der
    //                 die Stufe ihre eigene Deckung wählt (w = 1), und die, ab der sie den Saum erfindet (w = 0)
    //   saumEigen     die Glättung der eigenen Deckung in binomialen 3×3-Gängen (`karteSaumEigen`; 8: σ 2 Texel, das Maß der Linse)
    //   saumTensor    der Schritt des Tensor-Kerns in Texeln der gröberen Achse (`karteSaumGestalt`: der binomiale Kern des Bands,
    //                 σ 2 Schritte — 2,5: σ 5 Texel, das Fenster der Linse)
    var KARTEN_GESETZ = {
        schwelle: 0.45,
        normalTeiler: 2,
        minSeite: 4,
        minOpak: 64,
        glaette: 4,
        glaetteBis: 2,
        lichtTeiler: 4,
        saum: 1.8,
        saumZelle: 2.5,
        saumBand: 8,
        saumMin: 0.02,
        saumWeite: 3,
        lappen: 64,
        lappenHub: 8.4,
        saumGestalt: [0.15, 0.3],
        saumEigen: 8,
        saumTensor: 2.5,
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

    // Die Glätte-Gänge der deckungstreuen Mip-Stufe k — die Mips ohne Saum (die glatte Kette des Blatt-Atlas). Die Karte mit
    // Saum liest sie nicht mehr: bis w28-karte-stamm glättete sie damit ihren Stamm, im Kern und in der GPU-Ablage des Hosts
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
    // Umriss lief als Höhenlinie einer verwischten Krone, eine Hülle statt eines Saums (laub-kante: fimp:atlas:L2 0,2635 > 0,22).
    // DER SAUM AUF JEDER STUFE (w23-karte-l2, lod.K1#1): danach wählte die Stufe über dem Kronen-Fuß nach der Deckung ihres
    // Fußabdrucks, das Muster der Art (Zelle aus ihrer Blattgröße) brach nur den Gleichstand — es verschob den Umriss um kaum ein
    // Texel, die Zelle maß beim Strauch 55, bei Birke und Eiche 21 Stufe-0-Texel (ein Wellen-Hang statt eines Saums), isotrop
    // im Texel, wo das Texel 1,5- bis 3,5-mal so breit wie hoch steht, und die Stufe 0, die nah gelesen wird, trug keinen:
    // Laibe mit glatter Kuppel und gerader Sohle (Radeon, Tafel-Pose, main 03300ec8: strauch 0,4023, birke 0,3293, eiche 0,2264,
    // tanne 0,2219). Jetzt trägt JEDE Stufe den Saum (`karteSaumSchluessel`) in der Zelle der Stufe und die Art nur, was ihr
    // gehört: Laub (runde Lappen 1 − F1) oder Nadel (Grate F2 − F1). Rückgabe { nadel } oder null (keine Krone). Leser:
    // `karteSaumRinge`.
    function karteSaum(P) {
        return P && P.leafSize > 0 ? { nadel: P.conifer === true } : null;
    }
    // DER SAUM JE HEBUNGS-RING (w4-laub-saum, 31.10.): der Saum der Art (`karteSaum`) im Bild JEDES Rings der Schicht
    // (`karteRinge`) — seine Halbhöhe (`karteRingHalbe`, dieselbe Formel liest die Bühne) — mit dem SEITENMASS seiner Texel
    // (Breite durch Höhe im Rahmen: 2·halfW/(cw/τ) gegen 2·hh/(ch/τ); das Muster misst an der gröberen Achse) und seinem
    // Kronen-Fuß: die Stufe-0-Zeile des tiefsten Laubs im Bild der Bühnen-Kamera aus der Hebung e (Zeile 0 oben),
    // v = (y − halfH)·cos e − z·sin e über jede Peilung (|z| bis zum Radius R der Laub-Hülle). Unter dem Fuß steht der Stamm.
    // `laub` { minY, R } im Maß des Rahmens (halfH, halfW); Rückgabe { nadel, ringe: [{ seite, fuss }] } in der Reihe der
    // Ringe, oder null (keine Krone). Leser: der Wirt (`_karteSaumVon` → die GPU-Ablage, `saumK`) und `impostorMips` (opt.saum).
    function karteSaumRinge(P, halfH, halfW, laub, ringe, cw, ch) {
        const s0 = karteSaum(P);
        if (!s0 || !laub || !Array.isArray(ringe)) return null;
        return {
            nadel: s0.nadel,
            ringe: ringe.map((ring) => {
                const e = (ring.hebung * Math.PI) / 180;
                const hh = karteRingHalbe(WIND_ZAHLEN, halfH, halfW, e);
                const chR = ch / ring.teiler;
                const v = (laub.minY - halfH) * Math.cos(e) - laub.R * Math.abs(Math.sin(e));
                return { seite: (halfW * ch) / (hh * cw), fuss: ((hh - v) / (2 * hh)) * chR };
            }),
        };
    }
    // DER SCHLÜSSEL DER WAHL EINER STUFE k (w23-karte-l2) — EIN Gesetz für jede Art und jede Stufe, die GPU-Ablage rechnet es
    // (KARTE_RECHNER_WGSL saumK): `c` die Deckung jedes Texels einer Ansicht (w × h, Stufe 0 binär, sonst der Anteil seines
    // Fußabdrucks), `saum` { seite, fuss, nadel } ihres Rings.
    //   über dem Kronen-Fuß das BAND: g = c im binomialen Kern (`KARTEN_GESETZ.saumBand` Gänge, der Rand der Ansicht leer — der
    //     Rahmen ist nie der Umriss: die Sohle des Strauchs franst wie seine Kuppel); wählbar ab g ≥ saumMin, der Schlüssel
    //     g + saum · (Muster − ½) — ein Texel mit eigener Deckung immer (die Karte verschwindet nie, auch wo das Band über ihre
    //     Ansicht reicht), das Muster in der Zelle saumZelle · 2^k; ganz Gedecktes (g = 1) liegt 2 · saum darüber und
    //     bleibt (Lappen und Buchten nur im Band, nie ein Loch im Kern).
    //     DAS MUSTER AN DER DECKUNG (w28-laub-deckung, lod.K1): bis hier las das Texel das Muster am eigenen Ort, und es führte
    //     (saum 8,4 über einem Band von 0,02 bis 1): gewählt war jede Muster-Kuppe im Band, bis 24 Texel vor der Krone —
    //     Scheiben ohne Ast vor dem Himmel, und die Kante las ihren Zerfall als Saum. Jetzt hängt beides an der Deckung:
    //     (1) DER ORT — das Texel liest das Muster an der Höhenlinie g = ½, zu der die Deckung es zieht: längs ihres Gefälles
    //     (das erste Moment des Bands `karteSaumBand` moment 1 / 2, die Richtung zur Masse) um seinen Abstand σ · probit(g) (σ
    //     des binomialen Kerns √(saumBand / 2) Schritte, probit als ln(g / (1 − g)) / 1,702). Längs des Gefälles steht das
    //     Muster, die Wahl ist dort eine Schwelle der Deckung: wer gewählt ist, hängt über sie an der Krone — Zungen und
    //     Buchten quer zum Umriss an jeder Gestalt (ein Strahl aus der Kronen-Mitte trug die Scheibe, am Kegel der Fichte lief er
    //     längs der Flanke: Radeon, Tafel-Pose / Spielgang, fimp:fichte:L2 0,232 / 0,251, tanne 0,230 / 0,228).
    //     (2) DER HUB — saum · 4 g (1 − g) · (Muster − ½): voll an der Höhenlinie, null im Kern und im Leeren.
    //     Modell 128 × 256, Stufe 0 / 1, freie Inseln mit ihrem Anteil und kante, altes Gesetz → dieses: Scheibe Laub 8 / 4 mit
    //     0,024 / 0,052 → 1 / 0 mit 0,0004 / 0, kante 0,125 / 0,087 → 0,114 / 0,105 · Nadel 48 / 16 mit 0,105 / 0,124 → 2 / 0 mit
    //     0,0004 / 0, kante 0,104 / 0,070 → 0,104 / 0,125 · Kegel (40 breit, 210 hoch) Laub 17 / 29 mit 0,104 / 0,711 → 2 / 0 mit
    //     0,0006 / 0, kante 0,119 / 0,079 → 0,144 / 0,093 · Nadel 68 / 30 mit 0,125 / 0,426 → 7 / 6 mit 0,0047 / 0,088 (der Kegel
    //     der Stufe 1 ist schmaler als das Band: er reiht Büschel). Band und Zelle messen IN DER WELT, in Texeln der gröberen Achse
    //     (`saumSchritt`): beim Strauch (das Texel 3,5-mal so breit wie hoch) schritt das Muster sonst in der feinen Achse, seine
    //     Lappen standen 3,5-mal kleiner als die der Bäume, und die Messung sah sie nicht (Radeon 5c26df02: strauch 0,3909 →
    //     0,3919, die Bäume 0,17–0,21)
    //   unter ihm der STAMM (w28-karte-stamm): JEDE Stufe wählt ihn ZEILENWEISE MASSENTREU — je Zeile der Ansicht so viele
    //     Texel, wie die Deckung der Zeile trägt (round(Σ c)), die deckendsten zuerst, der Gleichstand nach der Lage; ein
    //     gewähltes trägt 3 + c: über jedem Schlüssel des Bands (≤ 1 + saum / 2), unter dem ganz Gedeckten (1 + 2 · saum),
    //     reicht M nicht, fällt zuerst, was am wenigsten deckt. Stufe 0 bleibt, wie sie backt (c = 1: jedes deckende Texel, 4).
    //     Bis hier trug der Stamm ab Stufe 1 seine GEGLÄTTETE Deckung (vier binomiale Gänge: ein Stamm von ein, zwei Texeln
    //     liest ≤ ½) in dieselbe Sortierung wie das Band, dessen Grenze um g = ½ liegt — er unterlag ganz, seine Masse fiel
    //     der Krone zu, die Krone schwebte (Abzug der Bühne, Radeon, Ring 0°, 8 Peilungen — Buche: Stufe 1 / 2 hielt 3 % /
    //     0 % seiner Masse, 321 von 328 Zeilen gerissen; jetzt 124 % / 129 % ohne Riss, bei gleichem M, Stufe 0 Byte für
    //     Byte wie zuvor; Fichte 55 % / 0 % → 104 % / 190 %. Über 100 %: die Zeile rundet auf ganze Texel).
    // Gewählt werden je Ansicht die M größten Schlüssel (M wie Stufe 0 deckt, deckungstreu); 0 heißt nie.
    // Der Schritt je Achse in feinen Texeln für EIN Texel der gröberen Achse (seite = Breite durch Höhe des Texels)
    function saumSchritt(seite) {
        const w = KARTEN_GESETZ.saumWeite;
        return [w * Math.max(1 / seite, 1), w * Math.max(seite, 1)];
    }
    // `moment` 1 / 2: das erste Moment des Kerns längs x / y in Schritten — die Richtung zur Masse, das Gefälle der Deckung
    function karteSaumBand(c, w, h, schritt, moment) {
        const n = 2 * KARTEN_GESETZ.saumBand,
            B = [1];
        for (let j = 0; j < n; j++) B.push((B[j] * (n - j)) / (j + 1));
        const s = B.reduce((a, b) => a + b, 0);
        const lauf = (q, schritt, laenge, wo, weit, arm) => {
            const out = new Float64Array(q.length);
            for (let i = 0; i < q.length; i++) {
                const a = wo(i);
                let v = 0;
                for (let j = 0; j <= n; j++) {
                    const t = a + Math.round((j - n / 2) * weit);
                    if (t >= 0 && t < laenge) v += B[j] * (arm ? j - n / 2 : 1) * q[i + (t - a) * schritt];
                }
                out[i] = v / s;
            }
            return out;
        };
        const zeilen = lauf(c, 1, w, (i) => i % w, schritt[0], moment === 1);
        return lauf(zeilen, w, h, (i) => (i / w) | 0, schritt[1], moment === 2);
    }
    //     (3) DER RAND DER GESTALT (w28-karte-stamm): erfunden wird nur, was die Gestalt im Maß der Karte nicht
    //     trägt. Je Texel die Geradheit des EIGENEN Umrisses im Band — die Kohärenz des Struktur-Tensors der eigenen Deckung im
    //     Maß der Linse (klassenMasse kante: die Maske im Gauß σ 2 px, der Tensor im Fenster 17 px; hier `karteSaumEigen`: c in acht
    //     binomialen 3×3-Gängen, σ 2 Texel, der Tensor im binomialen Kern σ 5 Texel der gröberen Achse) —, daraus das Gewicht der
    //     Gestalt w = 1 bei Kohärenz ≤ saumGestalt[0], 0 ab saumGestalt[1]: der Schlüssel g + w · (c̃ − g) + (1 − w) · Hub ·
    //     (Muster − ½). Wo die Gestalt fransig ist, wählt die Stufe ihre eigene Deckung (keine Verlegung, kein erfundener Lappen);
    //     wo sie gerade ist (die Scheibe, ein glatter Laib), wählt sie wie (1)/(2). Bis hier las der Schlüssel im Band nur das
    //     verwischte g, die eigene Deckung brach den Gleichstand (1e-6 · c): an der echten Fichte verlegte Stufe 0 29 % ihrer
    //     Fläche, obwohl ihr eigener Umriss 0,21 las (Befund im Zweig w28-samen-karten-stufe, Ordner samen/karten-stufe). Die
    //     GPU-Ablage rechnet dasselbe (KARTE_RECHNER_WGSL `eigenK` die Gänge, `gestaltW` das Gewicht in `saumK`; die Zahlen reicht
    //     `_karteSaumVon`): der Rand der Ansicht geklemmt, das Gefälle auf ihrem Rahmen 0, der Abgriff des Kerns bei ⌊d · Schritt + ½⌋.
    function karteSaumEigen(c, w, h) {
        let a = Float64Array.from(c);
        const b = new Float64Array(w * h);
        for (let gang = 0; gang < KARTEN_GESETZ.saumEigen; gang++) {
            mipGlaette(a, b, w, h, 0, w, 0, h);
            a = Float64Array.from(b);
        }
        return a;
    }
    function karteSaumGestalt(e, w, h, seite) {
        const t = KARTEN_GESETZ.saumTensor,
            st = [t * Math.max(1 / seite, 1), t * Math.max(seite, 1)];
        const gx = new Float64Array(w * h),
            gy = new Float64Array(w * h);
        for (let y = 0; y < h; y++)
            for (let x = 0; x < w; x++) {
                const i = y * w + x;
                gx[i] = x > 0 && x < w - 1 ? (e[i + 1] - e[i - 1]) / 2 : 0;
                gy[i] = y > 0 && y < h - 1 ? (e[i + w] - e[i - w]) / 2 : 0;
            }
        const jxx = karteSaumBand(
                gx.map((v) => v * v),
                w,
                h,
                st
            ),
            jyy = karteSaumBand(
                gy.map((v) => v * v),
                w,
                h,
                st
            ),
            jxy = karteSaumBand(
                gx.map((v, i) => v * gy[i]),
                w,
                h,
                st
            ),
            [k0, k1] = KARTEN_GESETZ.saumGestalt,
            out = new Float64Array(w * h);
        for (let i = 0; i < w * h; i++) {
            const tr = jxx[i] + jyy[i],
                koh = tr > 1e-12 ? ((jxx[i] - jyy[i]) ** 2 + 4 * jxy[i] * jxy[i]) / (tr * tr) : 1;
            out[i] = Math.min(1, Math.max(0, (k1 - koh) / (k1 - k0)));
        }
        return out;
    }
    function karteSaumSchluessel(c, w, h, k, saum) {
        const G = KARTEN_GESETZ,
            st = saumSchritt(saum.seite),
            g = karteSaumBand(c, w, h, st),
            f = 1 << k,
            zx = karteSaumBand(c, w, h, st, 1),
            zy = karteSaumBand(c, w, h, st, 2),
            sigma = Math.sqrt(G.saumBand / 2),
            eigen = karteSaumEigen(c, w, h),
            gestalt = karteSaumGestalt(eigen, w, h, saum.seite),
            key = new Float64Array(w * h);
        for (let i = 0; i < w * h; i++) {
            const X = ((i % w) + 0.5) * f,
                Y = (((i / w) | 0) + 0.5) * f;
            if (Y > saum.fuss) {
                // DER STAMM, zeilenweise massentreu: die Deckung der Zeile und der Rang des Texels in ihr
                if (c[i] > 0) {
                    const z0 = i - (i % w);
                    let summe = 0,
                        vor = 0;
                    for (let x = 0; x < w; x++) {
                        const q = c[z0 + x];
                        summe += q;
                        if (q > c[i] || (q === c[i] && z0 + x < i)) vor++;
                    }
                    key[i] = vor < Math.round(summe) ? 3 + c[i] : 0;
                }
            } else if (g[i] >= G.saumMin || c[i] > 0) {
                const gg = Math.min(0.999, Math.max(0.001, g[i])),
                    zug = (-sigma * f * Math.log(gg / (1 - gg))) / 1.702 / Math.max(1e-6, Math.hypot(zx[i], zy[i])),
                    hub = G.saum * 4 * gg * (1 - gg),
                    m = karteSaumMuster(X / st[0] + zx[i] * zug, Y / st[1] + zy[i] * zug, G.saumZelle * f, saum.nadel),
                    wg = gestalt[i];
                key[i] = Math.max(
                    1e-9,
                    g[i] + wg * (eigen[i] - g[i]) + (g[i] >= 1 ? 2 * G.saum : 0) + (1 - wg) * hub * (m - 0.5)
                );
            }
            if (key[i] > 0) key[i] += 1e-6 * c[i];
        }
        return key;
    }
    // Die Wahl: die M größten Schlüssel über 0, der Gleichstand nach der Lage in der Ansicht (die GPU-Ablage, grenzeK)
    function saumWahl(key, M) {
        const wahl = new Uint8Array(key.length),
            s = Float64Array.from(key).sort();
        M = Math.min(M, key.filter((x) => x > 0).length);
        if (M <= 0) return wahl;
        const grenze = s[key.length - M];
        let gleich = M;
        for (const x of key) if (x > grenze) gleich--;
        for (let i = 0; i < key.length; i++) wahl[i] = key[i] > grenze || (key[i] === grenze && gleich-- > 0) ? 1 : 0;
        return wahl;
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
    //   "bc"    Albedo BC1 (8 B je 4×4) mit voller Mip-Kette · Normale BC5 (16 B je 4×4) auf 1/normalTeiler · die Tiefe je
    //           Texel (`karteTiefe`) BC4 (8 B je 4×4) im Maß und mit der Kette der Normale
    //   "rgba8" Albedo rgba8 Stufe 0 · Normale rg8 Stufe 0 (die GPU zieht die Mips; ohne BC-Feature) — die Tiefe reist dort im
    //           vierten Kanal der Normale (kein eigenes Ziel)
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
        const t = bc ? ebene(nw, nh, n.stufen.length, 8) : { stufen: [], bytes: 0 };
        // die Sonnen-Sicht (A7; w14 ihr lineares Feld über die Richtung): rgba8, eine Stufe, in jedem Format
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
            t: t.stufen,
            aBytes: a.bytes,
            nBytes: n.bytes,
            tBytes: t.bytes,
            lw: lw,
            lh: lh,
            lBytes: lw * lh * 4,
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
    //   saum     { seite, nadel, fuss } — der Saum der Art (`karteSaumRinge` je Ring; die Karte, übereinander, nie glatt): JEDE
    //            Stufe, auch Stufe 0, wählt nach `karteSaumSchluessel`; ein gewählter Texel ohne eigene Deckung trägt die
    //            Farbe seines Bands (das Mittel der deckenden im Kern, wie der Schlüssel sie wiegt).
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
        // DIE VIERTEL (w28-blatt-atlas-kalt): die Unterproben zwischen denselben vier Texeln bilden ein Viertel (`laeufe`
        // je Achse: [i0, i1, von, bis] — die Folgen gleicher Nachbarn in der Tafel). Decken seine vier Texel alle, decken
        // alle seine Unterproben; deckt keiner, keine: die Probe liegt zwischen ihren vier Texeln, und die Rechnung ist
        // exakt (S ist 2 oder 4 — die Gewichte sind Achtel, die Alpha ganze Zahlen bis 255). Nur das Viertel auf dem Umriss
        // rechnet seine Unterproben, mit derselben Formel wie zuvor jede — bis dahin jede der S × S Proben je Texel, in
        // bis zu zwanzig Gängen der Bisektion je Zelle und Stufe.
        const laeufe = (t, n) => {
            const out = [];
            for (let j = 0; j < n;) {
                let e = j + 1;
                while (e < n && t.i0[e] === t.i0[j] && t.i1[e] === t.i1[j]) e++;
                out.push(t.i0[j], t.i1[j], j, e);
                j = e;
            }
            return Int32Array.from(out);
        };
        const lx = laeufe(tx, W),
            ly = laeufe(ty, H),
            fxT = tx.f,
            fyT = ty.f;
        const deck = (s) => {
            for (let i = 0; i < A.length; i++) A[i] = schl[i] > 0 ? Math.min(255, Math.round(schl[i] * s * 255)) : 0;
            let k = 0;
            for (let q = 0; q < ly.length; q += 4) {
                const r0 = ly[q] * nw,
                    r1 = ly[q + 1] * nw,
                    ya = ly[q + 2],
                    yb = ly[q + 3];
                for (let p = 0; p < lx.length; p += 4) {
                    const a = A[r0 + lx[p]],
                        b = A[r0 + lx[p + 1]],
                        c = A[r1 + lx[p]],
                        d = A[r1 + lx[p + 1]];
                    if (a >= thr) {
                        if (b >= thr && c >= thr && d >= thr) {
                            k += (yb - ya) * (lx[p + 3] - lx[p + 2]);
                            continue;
                        }
                    } else if (b < thr && c < thr && d < thr) continue;
                    for (let y = ya; y < yb; y++) {
                        const fy = fyT[y];
                        for (let x = lx[p + 2]; x < lx[p + 3]; x++) {
                            const fx = fxT[x];
                            const a0 = a + (b - a) * fx,
                                a1 = c + (d - c) * fx;
                            if (a0 + (a1 - a0) * fy >= thr) k++;
                        }
                    }
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

    // DIE KERNE DER MIP-STUFE (w28-blatt-atlas-kalt): die heißen Schleifen von impostorMips als kleine Funktionen. Der
    // Blatt-Atlas ruft impostorMips EINMAL je Boot, kalt — als eine Funktion von 240 Zeilen lief ihre erste Stufe unoptimiert
    // (gemessen in Node, der ganze Atlas-Auftrag: 1,0 s mit dem optimierenden Compiler, 6,4 s ohne ihn); ein kleiner Kern
    // ist nach dem ersten Ruf optimiert, die Stufe ruft ihn je Kanal, je Ansicht und je Gang. Jeder rechnet dieselbe Folge
    // wie die Schleife, die er ablöst (Byte-Beweis im Commit).
    // Die Box der vier Kinder in der Folge (0,0) (1,0) (0,1) (1,1): das float32-Feld `t` rundet jede Zwischensumme, wie es
    // sie Schritt für Schritt trug.
    function mipBox(s, t, lw, nw, nh) {
        for (let y = 0; y < nh; y++) {
            const z0 = y * 2 * lw,
                z1 = z0 + lw,
                o0 = y * nw;
            for (let x = 0; x < nw; x++) {
                const o = o0 + x,
                    a = z0 + x * 2,
                    b = z1 + x * 2;
                t[o] = s[a] + s[a + 1];
                t[o] = t[o] + s[b];
                t[o] = t[o] + s[b + 1];
            }
        }
    }
    // Der binomiale 3×3-Gang der Deckung einer Ansicht (nwA × nhA): die neun Summanden in ihrer Folge (Zeile oben · Mitte ·
    // unten, je links · Mitte · rechts; am Rand der Ansicht geklemmt), die Gewichte 1·2·1 / 2·4·2 / 1·2·1 — dieselbe Rechnung
    // wie die Schleife über (dy, dx) mit `Math.min/Math.max` je Nachbar, ohne ihre neun Index-Rechnungen je Texel (der größte
    // Posten des Blatt-Atlas: kalt 280 von 970 ms). Gerechnet wird der Ausschnitt [x0, x1) × [y0, y1) der Ansicht.
    function mipGlaette(dicht, weich, nwA, nhA, x0, x1, y0, y1) {
        for (let iy = y0; iy < y1; iy++) {
            const r1 = iy * nwA,
                r0 = iy > 0 ? r1 - nwA : r1,
                r2 = iy < nhA - 1 ? r1 + nwA : r1;
            for (let ix = x0; ix < x1; ix++) {
                const xa = ix > 0 ? ix - 1 : 0,
                    xc = ix < nwA - 1 ? ix + 1 : ix;
                let nb = 0;
                nb += dicht[r0 + xa];
                nb += dicht[r0 + ix] * 2;
                nb += dicht[r0 + xc];
                nb += dicht[r1 + xa] * 2;
                nb += dicht[r1 + ix] * 2 * 2;
                nb += dicht[r1 + xc] * 2;
                nb += dicht[r2 + xa];
                nb += dicht[r2 + ix] * 2;
                nb += dicht[r2 + xc];
                weich[r1 + ix] = nb / 16;
            }
        }
    }
    // Stufe 0 der Texel [von, bis): opak an der Schwelle → die Summen-Felder und das sRGB-Byte, sonst die Blut-Farbe;
    // Rückgabe die Zahl der deckenden.
    function mipStufe0(rgba, d0, sa, sr, sg, sb, von, bis, thr, roh0, blut) {
        let opak = 0;
        for (let i = von, p = von * 4; i < bis; i++, p += 4) {
            const a = rgba[p + 3];
            if (a >= thr) {
                const r = rgba[p],
                    g = rgba[p + 1],
                    b = rgba[p + 2];
                sa[i] = 1;
                sr[i] = r / 255;
                sg[i] = g / 255;
                sb[i] = b / 255;
                d0[p] = SRGB_AUS_LIN8[r];
                d0[p + 1] = SRGB_AUS_LIN8[g];
                d0[p + 2] = SRGB_AUS_LIN8[b];
                d0[p + 3] = roh0 ? a : 255;
                opak++;
            } else if (blut) {
                d0[p] = blut[0];
                d0[p + 1] = blut[1];
                d0[p + 2] = blut[2];
                d0[p + 3] = roh0 ? a : 0;
            }
        }
        return opak;
    }
    // Die Farbe jedes Texels einer Ansicht der blutenden Stufe: das Mittel seiner deckenden Kinder, sonst `blut`.
    function mipBlutFarbe(data, ort, nA, ta, tr, tg, tb, blut) {
        for (let i = 0; i < nA; i++) {
            const o = ort[i],
                p = o * 4,
                a = ta[o];
            if (a > 0) {
                data[p] = linZuSrgb8(tr[o] / a);
                data[p + 1] = linZuSrgb8(tg[o] / a);
                data[p + 2] = linZuSrgb8(tb[o] / a);
            } else {
                data[p] = blut[0];
                data[p + 1] = blut[1];
                data[p + 2] = blut[2];
            }
        }
    }
    // Die Alpha einer Ansicht der glatten Stufe (Deckung × σ); Rückgabe die Zahl der Texel an der Schwelle.
    function mipAlphaGlatt(data, ort, nA, schluessel, sigma, thr) {
        let opak = 0;
        for (let i = 0; i < nA; i++) {
            const p = ort[i] * 4 + 3;
            if (schluessel[i] > 0) data[p] = Math.min(255, Math.round(schluessel[i] * sigma * 255));
            if (data[p] >= thr) opak++;
        }
        return opak;
    }

    function impostorMips(rgba, w, h, V, schwelle, nStufen, opt) {
        const thr = (schwelle == null ? KARTEN_GESETZ.schwelle : schwelle) * 255;
        const quer = !!(opt && opt.quer),
            blut = opt && opt.blut ? opt.blut.map((x) => linZuSrgb8(x)) : null,
            roh0 = !!(opt && opt.alphaRoh),
            glatt = !!(opt && opt.glatt),
            saum = opt && opt.saum && !glatt && !quer ? opt.saum : null;
        if (glatt && !blut) throw new Error("impostorMips: glatt braucht blut (die Farbe jedes deckenden Texels)");
        // die Stufe, auf der das Blatt des Baum-Zweigs unter zwei Texel fällt (14 px → 3): ab ihr trägt die glatte Kette die Lappen
        const lappenAb = Math.ceil(Math.log2(ZWEIG_BLATT.laenge / 2));
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
        // Stufe 0 je Lauf einer Zeile in EINER Ansicht (`mipStufe0` zählt seine deckenden Texel): nebeneinander die Läufe
        // gleicher Zelle (dieselbe Formel je Spalte wie zuvor je Texel), übereinander die ganze Zeile
        const laufX = [];
        if (quer)
            for (let x = 0; x < w;) {
                const c = Math.min(V - 1, (x / wA) | 0);
                let e = x + 1;
                while (e < w && Math.min(V - 1, (e / wA) | 0) === c) e++;
                laufX.push(x, e, c);
                x = e;
            }
        for (let y = 0; y < h; y++) {
            if (quer)
                for (let q = 0; q < laufX.length; q += 3) {
                    const n = mipStufe0(
                        rgba,
                        d0,
                        sa,
                        sr,
                        sg,
                        sb,
                        y * w + laufX[q],
                        y * w + laufX[q + 1],
                        thr,
                        roh0,
                        blut
                    );
                    opak += n;
                    cov0[laufX[q + 2]] += n;
                }
            else {
                const n = mipStufe0(rgba, d0, sa, sr, sg, sb, y * w, y * w + w, thr, roh0, blut);
                opak += n;
                cov0[Math.min(V - 1, y / hA) | 0] += n;
            }
        }
        for (let v = 0; v < V; v++) cov0[v] /= wA * hA;
        // DER SAUM AUF STUFE 0 (w23-karte-l2): sie wählt wie jede Stufe — so viele, wie der Bäcker deckt
        if (saum)
            for (let v = 0; v < V; v++) {
                const o0 = v * wA * hA;
                const c = Float64Array.from({ length: wA * hA }, (_, i) => sa[o0 + i]);
                const st = saumSchritt(saum.seite);
                const farbe = [sr, sg, sb].map((q) =>
                    karteSaumBand(
                        c.map((x, i) => x * q[o0 + i]),
                        wA,
                        hA,
                        st
                    )
                );
                const g = karteSaumBand(c, wA, hA, st);
                const wahl = saumWahl(karteSaumSchluessel(c, wA, hA, 0, saum), Math.round(cov0[v] * wA * hA));
                for (let i = 0; i < wA * hA; i++) {
                    const o = (o0 + i) * 4;
                    if (!wahl[i]) d0[o] = d0[o + 1] = d0[o + 2] = d0[o + 3] = 0;
                    else if (!c[i]) {
                        for (let q = 0; q < 3; q++) d0[o + q] = linZuSrgb8(farbe[q][i] / g[i]);
                        d0[o + 3] = 255;
                    }
                }
            }
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
            mipBox(sa, ta, lw, nw, nh);
            mipBox(sr, tr, lw, nw, nh);
            mipBox(sg, tg, lw, nw, nh);
            mipBox(sb, tb, lw, nw, nh);
            const data = new Uint8Array(n * 4);
            const nA = nwA * nhA;
            // Texel i der Ansicht v (`ort`): übereinander zusammenhängend, nebeneinander zeilenweise je Zelle — je Ansicht EINMAL
            // als Tafel gerechnet, jede Schleife der Stufe liest sie (bis w28-blatt-atlas-kalt eine Division und ein Rest je Ruf)
            const ort = new Int32Array(nA);
            const schluessel = new Float64Array(nA),
                sortiert = new Float64Array(nA),
                dicht = new Float64Array(nA),
                weich = new Float64Array(nA);
            const fuss = 1 << (2 * k); // Stufe-0-Texel je Texel dieser Stufe
            let opakK = 0;
            for (let v = 0; v < V; v++) {
                let positiv = 0;
                if (quer) {
                    for (let y = 0, i = 0; y < nhA; y++)
                        for (let x = 0, o = y * nw + v * nwA; x < nwA; x++) ort[i++] = o++;
                } else for (let i = 0; i < nA; i++) ort[i] = v * nA + i;
                // DIE DECKUNG DES TEXELS (K20, 12.10.): der Box-Anteil c seines Stufe-0-Fußabdrucks, geglättet über die
                // Nachbarschaft (`KARTEN_GESETZ.glaette` binomiale 3×3-Gänge je Stufe — zwei Texel der Stufe, das Büschel
                // statt des Blatts, wo das Blatt unter wenige Pixel fällt). Die Wahl hält die Büschel zusammen: ein Texel
                // im dichten Zweig gewinnt gegen einen vereinzelten, die Lücke zwischen zwei Blättern füllt sich. Der
                // Gleichstand über einen Orts-Hash (bis 12.10.) säte Einzel-Texel quer über die Krone: das Korn der
                // Mittelsicht, das unter dem ½-Pixel-Versatz flimmerte (gate:pflanzen-nah (Z)).
                for (let i = 0; i < nA; i++) dicht[i] = ta[ort[i]] / fuss;
                // der Saum liest sie nicht mehr (w28-karte-stamm: der Stamm wählt zeilenweise aus seiner eigenen Deckung)
                const gaenge = saum ? 0 : karteGlaetteGaenge(k);
                // DER RAHMEN DER DECKUNG: außerhalb von ihm und seinem Rand ist jede der neun Summen 0 — jeder Gang rechnet
                // nur ihn, um einen Texel je Gang gewachsen; `weich` trägt außerhalb die Nullen, die der Gang schriebe
                let ya = nhA,
                    yb = -1,
                    xa = nwA,
                    xb = -1;
                for (let iy = 0, i = 0; iy < nhA; iy++)
                    for (let ix = 0; ix < nwA; ix++, i++)
                        if (dicht[i] !== 0) {
                            if (iy < ya) ya = iy;
                            yb = iy;
                            if (ix < xa) xa = ix;
                            if (ix > xb) xb = ix;
                        }
                weich.fill(0);
                for (let gang = 0; gang < gaenge; gang++) {
                    const g = gang + 1;
                    if (yb >= 0)
                        mipGlaette(
                            dicht,
                            weich,
                            nwA,
                            nhA,
                            Math.max(0, xa - g),
                            Math.min(nwA, xb + 1 + g),
                            Math.max(0, ya - g),
                            Math.min(nhA, yb + 1 + g)
                        );
                    dicht.set(weich);
                }
                // DER SAUM (`karteSaumSchluessel`): die Wahl jeder Stufe, der Stamm unter dem Kronen-Fuß zeilenweise massentreu
                const c = saum ? Float64Array.from({ length: nA }, (_, i) => ta[ort[i]] / fuss) : null;
                if (saum) schluessel.set(karteSaumSchluessel(c, nwA, nhA, k, saum));
                for (let i = 0; i < nA; i++) {
                    const s = ta[ort[i]];
                    // wählbar: glatt jeder Texel mit Deckung in der Nachbarschaft (er trägt die Blut-Farbe), sonst nur mit
                    // eigener (die Karte trägt die Farbe ihrer Kinder); der Gleichstand über die eigene Deckung
                    if (!saum) schluessel[i] = glatt || s > 0 ? dicht[i] + (1e-6 * s) / fuss : 0;
                    // DIE LAPPEN (KARTEN_GESETZ.lappen): unter dem Blatt trägt die glatte Deckung das Laub-Muster, am selben
                    // Stufe-0-Ort in jeder Stufe — der Filter mischt zwei Stufen, ihre Büschel decken sich
                    if (
                        glatt &&
                        k >= lappenAb &&
                        KARTEN_GESETZ.lappen >> k >= KARTEN_GESETZ.minSeite &&
                        schluessel[i] > 0
                    ) {
                        const o = ort[i];
                        schluessel[i] *= Math.pow(
                            2,
                            KARTEN_GESETZ.lappenHub *
                                (karteSaumMuster(
                                    ((o % nw) + 0.5) * (1 << k),
                                    (((o / nw) | 0) + 0.5) * (1 << k),
                                    KARTEN_GESETZ.lappen,
                                    false
                                ) -
                                    0.5)
                        );
                    }
                    if (schluessel[i] > 0) positiv++;
                }
                // die Farbe des Bands: die Summen der Kinder im Kern des Saums (ein gewählter Texel ohne eigene Deckung)
                const band = saum
                    ? [tr, tg, tb, ta].map((q) =>
                          karteSaumBand(
                              Float64Array.from({ length: nA }, (_, i) => q[ort[i]]),
                              nwA,
                              nhA,
                              saumSchritt(saum.seite)
                          )
                      )
                    : null;
                const M = Math.min(positiv, Math.round(cov0[v] * nA));
                if (blut) mipBlutFarbe(data, ort, nA, ta, tr, tg, tb, blut);
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
                if (glatt) {
                    opakK += mipAlphaGlatt(data, ort, nA, schluessel, sigma, thr);
                    continue;
                }
                for (let i = 0; i < nA; i++) {
                    const o = ort[i];
                    if (schluessel[i] > 0 && (schluessel[i] > grenze || (schluessel[i] === grenze && gleich-- > 0))) {
                        const eigen = ta[o] > 0;
                        [tr, tg, tb].forEach(
                            (q, j) => (data[o * 4 + j] = linZuSrgb8(eigen ? q[o] / ta[o] : band[j][i] / band[3][i]))
                        );
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
        for (let by = 0; by < bh; by++)
            for (let bx = 0; bx < bw; bx++) bcFarbBlock(rgba, w, h, bx, by, out, (by * bw + bx) * 8, false);
        return out;
    }
    // DER EINE FARB-BLOCK (w28-blatt-atlas-kalt): der Farb-Block des 4×4 (bx, by) nach `out` ab `o` — BC1 ruft ihn je Block,
    // BC3 mit `deckend` (jeder Texel opak gelesen; bis dahin kopierte bc3Kodiere das ganze Bild, setzte die Alpha auf 255,
    // kodierte in ein eigenes Feld und trug jeden Block einzeln um). Die Felder des Blocks stehen EINMAL (bis dahin je Bild
    // neu, die Helfer als Funktionen im Rumpf des Kodierers): der Block ist eine kleine Funktion, die nach wenigen Rufen
    // optimiert läuft — der Kodierer als EINE Schleife über das Bild lief im Blatt-Atlas einmal und kalt.
    // DER EINFARBIGE BLOCK ohne Transparenz geht den kurzen Weg: sein Mittel ist die Farbe selbst (16 gleiche Bytes, die
    // Summe exakt), die Kovarianz null, die Potenz-Iteration bricht am Start, beide Endpunkte sind q565 der Farbe, jeder
    // Index 0, und die kleinsten Quadrate brechen an det = 0 — dasselbe Ergebnis ohne die Rechnung (`out` ist frisch).
    const BC_PR = new Float64Array(16),
        BC_PG = new Float64Array(16),
        BC_PB = new Float64Array(16),
        BC_TR = new Uint8Array(16),
        BC_IDX = new Uint8Array(16),
        BC_BEST = new Uint8Array(16),
        BC_E0 = [0, 0, 0],
        BC_E1 = [0, 0, 0];
    function bcQ565(r, g, b) {
        const R = Math.max(0, Math.min(31, Math.round((r * 31) / 255))),
            G = Math.max(0, Math.min(63, Math.round((g * 63) / 255))),
            B = Math.max(0, Math.min(31, Math.round((b * 31) / 255)));
        return (R << 11) | (G << 5) | B;
    }
    function bcEx(c, s) {
        const R = (c >> 11) & 31,
            G = (c >> 5) & 63,
            B = c & 31;
        s[0] = (R << 3) | (R >> 2);
        s[1] = (G << 2) | (G >> 4);
        s[2] = (B << 3) | (B >> 2);
    }
    // Palette + Indizes zu (c0, c1) im gewählten Modus; Rückgabe der Fehler-Quadratsumme (opake Texel).
    function bcBewerte(c0, c1, drei) {
        const pr = BC_PR,
            pg = BC_PG,
            pb = BC_PB,
            tr = BC_TR,
            idx = BC_IDX,
            e0 = BC_E0,
            e1 = BC_E1;
        bcEx(c0, e0);
        bcEx(c1, e1);
        // die Palette: die zwei Endpunkte, dazu die Mitte (3 Farben) oder die zwei Drittel (4 Farben)
        const r0 = e0[0],
            g0 = e0[1],
            b0 = e0[2],
            r1 = e1[0],
            g1 = e1[1],
            b1 = e1[2];
        const r2 = drei ? Math.floor((r0 + r1) / 2) : Math.floor((2 * r0 + r1) / 3),
            g2 = drei ? Math.floor((g0 + g1) / 2) : Math.floor((2 * g0 + g1) / 3),
            b2 = drei ? Math.floor((b0 + b1) / 2) : Math.floor((2 * b0 + b1) / 3),
            r3 = drei ? 0 : Math.floor((r0 + 2 * r1) / 3),
            g3 = drei ? 0 : Math.floor((g0 + 2 * g1) / 3),
            b3 = drei ? 0 : Math.floor((b0 + 2 * b1) / 3);
        let sse = 0;
        for (let j = 0; j < 16; j++) {
            if (tr[j]) {
                idx[j] = 3;
                continue;
            }
            // der nächste Paletten-Eintrag, der erste bei Gleichstand (die Folge 0, 1, 2[, 3])
            const R = pr[j],
                G = pg[j],
                B = pb[j];
            let dr = R - r0,
                dg = G - g0,
                db = B - b0;
            let bi = 0,
                bd = dr * dr + dg * dg + db * db;
            dr = R - r1;
            dg = G - g1;
            db = B - b1;
            let d = dr * dr + dg * dg + db * db;
            if (d < bd) {
                bd = d;
                bi = 1;
            }
            dr = R - r2;
            dg = G - g2;
            db = B - b2;
            d = dr * dr + dg * dg + db * db;
            if (d < bd) {
                bd = d;
                bi = 2;
            }
            if (!drei) {
                dr = R - r3;
                dg = G - g3;
                db = B - b3;
                d = dr * dr + dg * dg + db * db;
                if (d < bd) {
                    bd = d;
                    bi = 3;
                }
            }
            idx[j] = bi;
            sse += bd;
        }
        return sse;
    }
    function bcFarbBlock(rgba, w, h, bx, by, out, o, deckend) {
        const pr = BC_PR,
            pg = BC_PG,
            pb = BC_PB,
            tr = BC_TR,
            idx = BC_IDX,
            best = BC_BEST;
        // der Block liegt ganz im Bild: seine Texel ohne Klemmen (die Klemme am Rand ist dieselbe Adresse)
        const innen = bx * 4 + 3 < w && by * 4 + 3 < h,
            s0 = (by * 4 * w + bx * 4) * 4;
        if (innen) {
            const r0 = rgba[s0],
                g0 = rgba[s0 + 1],
                b0 = rgba[s0 + 2];
            let eine = true;
            for (let jy = 0, z = s0; eine && jy < 4; jy++, z += w * 4)
                for (let t = z; t < z + 16; t += 4)
                    if (rgba[t] !== r0 || rgba[t + 1] !== g0 || rgba[t + 2] !== b0 || (!deckend && rgba[t + 3] < 128)) {
                        eine = false;
                        break;
                    }
            if (eine) {
                const c = bcQ565(r0, g0, b0);
                out[o] = out[o + 2] = c & 0xff;
                out[o + 1] = out[o + 3] = c >> 8;
                out[o + 4] = out[o + 5] = out[o + 6] = out[o + 7] = 0;
                return;
            }
        }
        let nO = 0,
            nT = 0,
            mr = 0,
            mg = 0,
            mb = 0;
        for (let j = 0; j < 16; j++) {
            const s = innen
                ? s0 + ((j >> 2) * w + (j & 3)) * 4
                : (Math.min(h - 1, by * 4 + (j >> 2)) * w + Math.min(w - 1, bx * 4 + (j & 3))) * 4;
            tr[j] = !deckend && rgba[s + 3] < 128 ? 1 : 0;
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
        if (nO === 0) {
            // ganz transparent: 3-Farben-Modus, jeder Index 3
            out[o] = out[o + 1] = out[o + 2] = out[o + 3] = 0;
            out[o + 4] = out[o + 5] = out[o + 6] = out[o + 7] = 0xff;
            return;
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
        let p = bcQ565(mr + ax * tmax, mg + ay * tmax, mb + az * tmax),
            q = bcQ565(mr + ax * tmin, mg + ay * tmin, mb + az * tmin);
        let c0 = drei ? Math.min(p, q) : Math.max(p, q),
            c1 = drei ? Math.max(p, q) : Math.min(p, q);
        let bestSse = bcBewerte(c0, c1, drei || c0 === c1);
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
            p = bcQ565((arR * bb - brR * ab) / det, (arG * bb - brG * ab) / det, (arB * bb - brB * ab) / det);
            q = bcQ565((brR * aa - arR * ab) / det, (brG * aa - arG * ab) / det, (brB * aa - arB * ab) / det);
            c0 = drei ? Math.min(p, q) : Math.max(p, q);
            c1 = drei ? Math.max(p, q) : Math.min(p, q);
            const sse = bcBewerte(c0, c1, drei || c0 === c1);
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

    // BC4 eines Kanals (8-Werte-Modus r0 > r1: Minimum und Maximum des Blocks als Endpunkte) — der Alpha-Block der BC3-Fracht.
    // Die Stufen einer Runde und die besten bisher — EIN Paar Felder für jeden Block (bis w28-blatt-atlas-kalt zwei neue
    // Felder und eine neue Funktion je Block, 175 000-mal je Atlas). `bc4Weise` weist die Stufen zu (a, b) zu und gibt die
    // Fehler-Quadratsumme zurück.
    const BC4_STUFE = new Uint8Array(16),
        BC4_BESTE = new Uint8Array(16);
    function bc4Weise(werte, a, b) {
        let sse = 0;
        for (let j = 0; j < 16; j++) {
            let s = 0;
            if (a > b) s = Math.max(0, Math.min(7, Math.round(((a - werte[j]) * 7) / (a - b))));
            BC4_STUFE[j] = s;
            const d = werte[j] - Math.round(((7 - s) * a + s * b) / 7);
            sse += d * d;
        }
        return sse;
    }
    function bc4Block(werte, out, o) {
        let mn = 255,
            mx = 0;
        for (let j = 0; j < 16; j++) {
            if (werte[j] < mn) mn = werte[j];
            if (werte[j] > mx) mx = werte[j];
        }
        // EIN Wert im ganzen Block: beide Endpunkte sind er, jede Stufe 0 (die Zuweisung trifft ihn ohne Fehler, keine Runde
        // läuft) — der leere und der volle Block des Blatt-Atlas
        if (mn === mx) {
            out[o] = out[o + 1] = mx;
            out[o + 2] = out[o + 3] = out[o + 4] = out[o + 5] = out[o + 6] = out[o + 7] = 0;
            return;
        }
        // Endpunkte: Start Maximum/Minimum, dann je Runde die Stufen zuweisen und (r0, r1) per kleinster Quadrate
        // nachziehen — das Min/Max-Paar allein ließ die Normale im Mittel 2,2° (p95 8°) kippen.
        let r0 = mx,
            r1 = mn;
        const stufe = BC4_STUFE,
            beste = BC4_BESTE;
        let besteSse = bc4Weise(werte, r0, r1);
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
            const sse = bc4Weise(werte, a, b);
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
        const out = new Uint8Array(bw * bh * 16);
        const a = new Uint8Array(16);
        // DER LEERE BLOCK (w28-blatt-atlas-kalt): 16 Texel 0,0,0,0 — die Farbe q565(0) und die Alpha 0 sind die Nullen, die
        // `out` schon trägt; gelesen als 16 Worte (wo das Bild auf vier Bytes ausgerichtet liegt), statt ihn zu kodieren. Im
        // vormultiplizierten Blatt-Atlas ist das die Mehrzahl der Blöcke.
        const u =
            rgba.buffer && rgba.BYTES_PER_ELEMENT === 1 && rgba.byteOffset % 4 === 0 && rgba.length >= w * h * 4
                ? new Uint32Array(rgba.buffer, rgba.byteOffset, rgba.length >> 2)
                : null;
        for (let by = 0; by < bh; by++)
            for (let bx = 0; bx < bw; bx++) {
                const innen = bx * 4 + 3 < w && by * 4 + 3 < h,
                    t0 = by * 4 * w + bx * 4;
                if (u && innen) {
                    let leer = true;
                    for (let jy = 0, z = t0; leer && jy < 4; jy++, z += w)
                        if (u[z] | u[z + 1] | u[z + 2] | u[z + 3]) leer = false;
                    if (leer) continue;
                }
                const o = (by * bw + bx) * 16,
                    s0 = t0 * 4 + 3;
                bcFarbBlock(rgba, w, h, bx, by, out, o + 8, true);
                for (let j = 0; j < 16; j++)
                    a[j] =
                        rgba[
                            innen
                                ? s0 + ((j >> 2) * w + (j & 3)) * 4
                                : (Math.min(h - 1, by * 4 + (j >> 2)) * w + Math.min(w - 1, bx * 4 + (j & 3))) * 4 + 3
                        ];
                bc4Block(a, out, o);
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
    // fallend bis d. Umwelt u = { licht, feucht, ufer, fels, hang, leben }: licht (Kronen-Licht 0..1) und feucht (0..1)
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
        // DAS LEBEN AM ORT (feld.K5): `leben` ist der Gewinn je Einheit des Leben-Overlays `u.leben` (die Schreib-Seite des
        // Felds über dem Substrat: die Pflege hebt, der Fraß senkt) — w · max(0, 1 + leben · u.leben); ohne Overlay (0) und
        // ohne Leser (das Labor) wirkt es neutral.
        if (zeile.leben && da(u.leben) && u.leben !== 0) w *= Math.max(0, 1 + zeile.leben * u.leben);
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
        formAttr: ["uv", "aWurzel", "aSchale", "skinIndex", "aVerband", "aLage"], // die Attribute, die der Wirt nur trägt, wo sie reisen
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
            // w4-genesis-tore: ein Stoff ohne Licht-Antwort im Labor (MeshBasic) — er leuchtet nur (`leucht`), die Albedo ist
            // schwarz (die Brücke stempelt ihn, `unbeleuchtet`); jeder andere Stoff bleibt byte-alt
            ub: !!(mp && mp.unbeleuchtet === true),
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
            // w4-genesis-tore: das Unbeleuchtete und das Stein-Gesetz (Fuge, Kante, Ton aus dem uv) sind Teil der Identität (nur wo
            // das Gesetzbuch sie trägt — sonst byte-alt)
            (R.ub ? "|ub" : "") +
            (mp && typeof mp.stein === "string" ? "|st:" + mp.stein : "") +
            // w28-haus-stoff: der Verband (fachwerk VERBAND_GESETZ, die Nummer seiner Zeile) ist Teil der Identität — der Stoff
            // webt Stein, Fuge und Ton seiner Zeile (nur wo das Gesetzbuch ihn trägt — sonst byte-alt)
            (mp && mp.verband > 0 ? "|vb:" + (mp.verband | 0) : "") +
            // die Seh-Klasse gehört zur Identität: zwei Stoffe gleicher Regler und verschiedener Funktion (Klaue und
            // Pupille, beide 0,2 matt-schwarz) sind zwei Materialien — sonst trüge die Pupille die Klaue in den Stoff
            (budgetSeh(mp) ? "|v:" + mp.seh : "")
        );
    }
    // Der Verband eines Stoffs (`mat.verband` aus dem Gesetzbuch, fachwerk VERBAND_GESETZ): die Nummer seiner Zeile — 0 ohne.
    function budgetVerband(mp) {
        return mp && mp.verband > 0 ? mp.verband | 0 : 0;
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
    // Ein TEIL DER MASCHINE (brunnen-haspel: `m.welle`, kurbel · seil · eimer der Haspel, je Teil EINE Matrix des Wirts) ist seine
    // eigene Sippe je Teil: es verschmilzt mit seinesgleichen, nie mit dem Aufbau und nie mit einem anderen Teil.
    function budgetSippe(m) {
        if (!_budgetTeil(m) || m.tuer || (m.skinIndex && m.skinIndex.array)) return null;
        return (
            (m.rad ? (m.rad.dreht ? "R:d|" : "R:s|") : "") +
            (m.welle ? "W:" + m.welle.teil + "|" : "") +
            budgetStoff(m.kind, m.mat) +
            "#" +
            _budgetForm(m)
        );
    }
    // DIE ZAHL DER BEWEGTEN TEILE (brunnen-haspel): je benanntem Teil einer Maschine (`m.welle.teil`) EIN Befehl, den die Zeile
    // ausdrücklich trägt (`bewegt`) — er zählt nie gegen die Draws des Aufbaus, die Faltung kann ihn nicht falten.
    function _budgetBewegt(meshes) {
        const t = new Set();
        for (const m of meshes || []) if (_budgetTeil(m) && m.welle) t.add(m.welle.teil);
        return t.size;
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
            if (!g) gr.set(k, (g = { n: 0, v: 0, gelenk: false, welle: !!m.welle }));
            g.n++;
            g.v += nv;
            if (m.joint) g.gelenk = true;
        }
        // `bewegt`: die Draws der Teile einer Maschine (in `draws` enthalten) — die Zeile hält sie gegen ihr `bewegt`
        let bewegt = 0;
        for (const g of gr.values()) {
            const n = g.gelenk || g.n < 2 || g.v <= BUDGET_GESETZ.verschmelzVerts ? 1 : g.n;
            draws += n;
            if (g.welle) bewegt += n;
        }
        return { tris: tris, verts: verts, draws: draws, bewegt: bewegt };
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
        // (der Verband je Ecke ist eine Nummer 0 … 255: ein Byte je Ecke, nie vier)
        for (const a of attrs) A[a.name] = a.name === "aVerband" ? new Uint8Array(nV) : new Float32Array(nV * a.size);
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
                    } else if (a.name === "aVerband" && !(m.aVerband && m.aVerband.array)) {
                        // der Verband des Teils (w28-haus-stoff): die Nummer der Zeile seines Stoffs in jede seiner Ecken
                        dst.fill(budgetVerband(m.mat), ov, ov + v);
                    } else if (a.name === "aLage" && !(m.aLage && m.aLage.array)) {
                        // ein Teil ohne Lage im Gefüge trägt 0 (der Puffer ist frisch): seine Zeile liest die Lage der Welt
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
    // DIE STÜCKE EINES EIMERS — EINE Rechnung für den Plan (`zaehle`) und die Fügung: jedes Teil in das ERSTE Stück, das es noch
    // trägt (bis `teilVertsMax`; ein Teil, das seine Rückseite mitbringt, zählt doppelt). Bis w28-putz-wand zählte der Plan
    // ceil(Ecken / teilVertsMax), die Fügung aber schloss ein Stück, sobald das nächste Teil nicht mehr passte — ein späteres
    // kleines fand das frühere Stück nicht (Haus gotisch bend=1 L0: 353 856 Ecken, Plan 2, gefügt 122 016 · 173 844 · 57 996 = 3
    // Teile, draws 13 > 12). Wo die Reihe schon aufging, bleibt die Fügung byte-gleich.
    function _budgetStuecke(ps, rueck) {
        const st = [];
        for (const p of ps) {
            const pv = (p.m.position.array.length / 3) * (rueck(p) ? 2 : 1);
            let s = st.find((x) => x.v + pv <= BUDGET_GESETZ.teilVertsMax);
            if (!s) st.push((s = { v: 0, ps: [] }));
            s.ps.push(p);
            s.v += pv;
        }
        return st;
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
                (m.tuer
                    ? "T:" + JSON.stringify(m.tuer)
                    : m.rad
                      ? m.rad.dreht
                          ? "R:d"
                          : "R:s"
                      : m.welle
                        ? "W:" + m.welle.teil
                        : haut
                          ? "H"
                          : "S") + (m.aWurzel || m.aSchale ? "|schale" : "");
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
                // der Plan zählt die Stücke, die die Fügung unten baut (dieselbe Rechnung, ohne Gelenk: ein Stoff an Gelenken ist
                // EIN Befehl, der Ofen bindet seine Eimer starr) — nie weniger als das Maß der Ecken, das er bis hier allein las
                const ecken = Math.max(1, Math.ceil(g.verts / BUDGET_GESETZ.teilVertsMax));
                n += g.teile.some((p) => p.m.joint)
                    ? ecken
                    : Math.max(ecken, _budgetStuecke(g.teile, (p) => p.seite === 2 && g.seite !== 2).length);
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
            // DER VERBAND JE ECKE (w28-haus-stoff, fachwerk VERBAND_GESETZ): faltet die Gruppe Stoffe verschiedener Verbände (das
            // Dach, den Sockel und das Holz in den Putz), trägt jede Ecke die Nummer der Zeile IHRES Stoffs (`aVerband`) — der Wirt
            // legt sie in ein freies Byte seines Satzes und webt den Verband je Fläche. Tragen alle Teile denselben (oder keinen),
            // reist kein Attribut: der Stoff der Gruppe nennt ihn (`mat.verband`) — byte-alt.
            // Ein Teil, das seine Zeile je Ecke schon trägt (die ferne Fachwerk-Wand, fachwerk `_wandLage`), zieht das Attribut mit;
            // seine Lage im Gefüge (`aLage`: Felder quer · Felder hoch) reist ebenso — die Teile ohne sie tragen 0.
            if (
                !attrs.some((x) => x.name === "aVerband") &&
                g.teile.some(
                    (p) => (p.m.aVerband && p.m.aVerband.array) || budgetVerband(p.m.mat) !== budgetVerband(g.mat)
                )
            )
                attrs.push({ name: "aVerband", size: 1 });
            if (!attrs.some((x) => x.name === "aLage") && g.teile.some((p) => p.m.aLage && p.m.aLage.array))
                attrs.push({ name: "aLage", size: 2 });
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
                for (const { ps: stueck } of _budgetStuecke(ps, (p) => p.rueck)) {
                    const e = _budgetVerbinden(stueck, g, attrs);
                    if (j) e.joint = j;
                    if (stueck[0].m.tuer) e.tuer = stueck[0].m.tuer;
                    if (stueck[0].m.rad) e.rad = stueck[0].m.rad;
                    if (stueck[0].m.welle) e.welle = stueck[0].m.welle;
                    out.push(e);
                }
            }
        }
        for (const b of beipack) out.push(b);
        return out;
    }
    // DER STEIN AUSSER DER ZEILE (Einheit E8.1, 19.11.): ein Teil, dessen Verband die Zeile nennt (`ohneVerband` — die Nummer, die
    // sein Stoff als `mat.verband` trägt, fachwerk `verbandReihe`), zählt nicht gegen ihre Dreiecke: sein Maß ist ein Gesetz
    // (fachwerk VERBAND_GESETZ.mauerwerk in jeder Zeile), nie ein Budget. Gezählt wird VOR der Faltung — ein gefaltetes Stück
    // trägt den Stoff seines größten Teils (alemannisch L0: der Backstein im Stück des Natursteins). Der Ausgang berichtet die
    // Zahl (`frei`), die Wände (gate:asset-contract, gate:regler-wirkt) lesen sie dort; der Bau des Gesetzbuchs (fachwerk
    // buildInstance) liest dasselbe Feld der Zeile. Eine Zeile ohne das Feld stellt nichts frei.
    function budgetFrei(meshes, zeile) {
        const vb = zeile && zeile.ohneVerband;
        let tris = 0;
        if (!(vb > 0)) return 0;
        for (const m of meshes || [])
            if (_budgetTeil(m) && m.teil !== "schatten" && m.mat && m.mat.verband === vb)
                tris += _budgetTris(m) * _budgetMal(m);
        return tris;
    }
    // DER AUSGANG: faltet eine gelieferte Stufe auf ihre Zeile und berichtet vorher/nachher + Bruch; die Dreiecke gegen die
    // Zeile sind die der Stufe ohne die freien (`frei`, budgetFrei).
    function budgetErzwingen(meshes, zeile) {
        const vor = budgetSippen(meshes);
        const frei = budgetFrei(meshes, zeile);
        const bericht = {
            vorher: { tris: vor.tris, draws: vor.draws },
            nachher: null,
            faltungen: [],
            bruch: [],
            frei: frei,
        };
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
        // DIE TEILE EINER MASCHINE (brunnen-haspel) tragen je Teil einen Befehl außer den Draws des Aufbaus — so viele, wie die
        // Zeile ausdrücklich nennt (`bewegt`); ohne das Feld ist jedes bewegte Teil ein Bruch beim Namen. Ohne bewegte Teile
        // faltet der Ausgang wie bis hier (die Antworten byte-alt).
        const nb = _budgetBewegt(meshes),
            bz = zeile.bewegt | 0,
            ziel = zeile.draws + Math.min(nb, bz);
        const out = vor.draws > ziel ? _budgetFalten(meshes || [], ziel, bericht) : meshes;
        const nach = budgetSippen(out);
        bericht.nachher = { tris: nach.tris, draws: nach.draws };
        if (nb) bericht.nachher.bewegt = nach.bewegt;
        if (nach.draws - nach.bewegt > zeile.draws)
            bericht.bruch.push({ feld: "draws", ist: nach.draws - nach.bewegt, soll: zeile.draws });
        if (nach.bewegt > bz) bericht.bruch.push({ feld: "bewegt", ist: nach.bewegt, soll: bz });
        if (nach.tris - frei > zeile.tris)
            bericht.bruch.push({ feld: "tris", ist: nach.tris - frei, soll: zeile.tris });
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
    // (f0 4 Hz) zittert nicht mit dem Hub der Fichte (0,4 Hz), er folgt der Böe. Die Böe selbst wandert mit dem Wind (λ ≈ 164 m,
    // `boeTempo`: im Sturm 15 m/s, Periode ≈ 11 s) — dieselben Zahlen lesen Gras, Streu und das Ohr der Welt (`AnazhRealm.WIND_BOE`).
    // Die Formel rechnet über einer Algebra A (TSL im Welt-Stoff, GLSL-Text im Labor, Zahlen in der Linse — wie
    // `_durchsichtGewicht`): EIN Term, drei Leser.
    var WIND_GESETZ = Object.freeze({
        kF: 720, // m/s — f0 = kF · D / H²
        vogel: 1.4, // Last ∝ U^vogel (2 + B, B = −0,6)
        stamm: Object.freeze({ neig: 0.035, pendel: 0.45 }), // Spitzen-Auslenkung / H bei Sturm · Pendel-Anteil um die Neigung
        ast: Object.freeze({ faktor: 2.4, hub: 0.06, heben: 0.03 }), // f_Ast = faktor · f0 · Hub je Hebel · Heben je Hebel
        blatt: Object.freeze({ f: 4.5, ueberAst: 1.5, hub: 0.035 }), // Hz · Abstand zum Ast · Hub (m) bei Sturm
        spektrum: Object.freeze({ fRef: 0.4, exp: 5 / 6 }), // Antwort = min(1, (fRef / f)^exp) — fRef die Fichte, exp = ½ · 5/3
        // g = sin(k·(s(t) − x·w))·amp + mitte — die Böe ist ein Muster, das MIT dem Wind wandert (`boeTempo`, s der Weg des Musters)
        boe: Object.freeze({ k: 0.0384, amp: 0.45, mitte: 0.7, taylor: 0.9 }),
        dbh: 1.3, // m — die Brusthöhe, in der D gemessen wird
    });
    // DAS TEMPO DER BÖE (wind-saison, Karte 2 leben.pflanzen.kraft#2): die Böe ist eingefrorene Turbulenz (Taylor 1938, Proc. R.
    // Soc. A 164: f(x − U_c·t)) — ihr Muster zieht mit der Konvektions-Geschwindigkeit U_c = taylor × dem mittleren Wind über dem
    // Ort (Böen und Wirbel der Grenzschicht ziehen mit 0,8–1,0 × dem mittleren Wind ihrer Höhe), nie mit einem eigenen ω/k. Der
    // mittlere Wind ist der Wind-Kanal U des Wetters (0,06 ruhig … 1 Sturm) × der mittleren Böe × WIND_FELD.sturmMS. Bis
    // wind-saison zog die Böe mit ω/k = 10,4 m/s in jedem Wetter: im Sturm (16 m/s am Ort) kam sie 100 m windab 9,5 s statt
    // 6,2 s nach (Laufzeit +53 %), in der Ruhe überholte sie den Wind 7-fach. → m/s. Leser: die Welt (`_boeWeg`: der Weg des
    // Musters, den Gras, Krone, Karte, Tuch, Rauch und Ohr über `_windAt` und `uBoePhase` lesen), das Labor (`baumWindGlsl`).
    function boeTempo(U) {
        if (!Number.isFinite(U)) throw new Error("boeTempo: der Wind-Kanal ist endlich (" + U + ")");
        var B = WIND_GESETZ.boe;
        return B.taylor * B.mitte * WIND_FELD.sturmMS * Math.max(0, U);
    }
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
    // DIE KRONE IM JAHR (w21-laub-jahr-fern, additiv): das Kronendach der Ferne (Ring, Boden, Kamm, Panorama — jenseits der
    // Karte stehen keine Gestalten mehr) trägt das Jahr nach DEMSELBEN Gesetz wie die Gestalt: das Laub (aType 1) zieht sich um
    // die Präsenz auf seine Mitte (`_jahrLage`), die Nadel (2) und die Rinde stehen, nur Laub tönt. Gemessen an der Gestalt
    // (kronen-linse, 24 Ansichten, die Formel von `_jahrLage` auf die gebauten Puffer; Same 1, Hebung 0°): die Bild-Deckung des
    // Laubs folgt der Präsenz linear — L1 Eiche 0,72 → 0,737 · 0,55 → 0,579 · 0,30 → 0,315, Birke 0,747 · 0,588 · 0,332, Weide
    // 0,734 · 0,566 · 0,277, das Holz abgezogen —, und das Holz der kahlen Krone deckt `holz` ihrer Sommer-Krone (Eiche 0,061 ·
    // Birke 0,048 · Weide 0,047: die Karte backt die L1, das Gerüst). Je Einheit Kronen-Deckung: K das Kronendach (Laub aller
    // Arten), D sein Anteil der Laub werfenden Arten, delta deren Anteil an der Deckung, R deren Rinde × delta (alle wie das Dach
    // × Selbstbeschattung), p die Präsenz, S die Tönung des Laubs. Rückgabe: { farbe (vormultipliziert), deckung } — Sommer
    // (p 1, S 1) exakt { K, 1 }. Über einer Algebra wie `windAusschlag` (WIND_ZAHLEN: Faden und CPU; die TSL-Algebra: der Stoff).
    // Mit f = 1 − p (das gefallene Laub): farbe = K + D·(p·S − 1) + R·f·holz, deckung = 1 + delta·f·(holz − 1). p liegt nach
    // seinem Gesetz in [0, 1] (`_saisonPraesenz`: linear zwischen den Stützen `pr` des SAISON_GESETZ) — keine Klemme; f baut
    // jeder Leser frisch: im Stoff wird kein Knoten geteilt, das Boden-Programm trägt keine Variable des Jahrs mehr als nötig.
    var KRONE_JAHR = Object.freeze({ holz: 0.05 });
    function kroneImJahr(A, p, S, K, D, delta, R) {
        const fiel = (x) => A.mul(A.add(A.k(1), A.mul(p, A.k(-1))), A.k(x));
        return {
            farbe: A.add(A.add(K, A.mul(D, A.add(A.mul(p, S), A.k(-1)))), A.mul(R, fiel(KRONE_JAHR.holz))),
            deckung: A.add(A.k(1), A.mul(delta, fiel(KRONE_JAHR.holz - 1))),
        };
    }
    // DIE GESTALT DES HALMS IM JAHR (w26-winter-fichte, vegetation.K5#2, additiv): SAISON_GESETZ `ha` ist der Anteil der
    // Sommer-LÄNGE, den der Halm im Jahr trägt — er kürzt sich längs seiner eigenen Achse um seinen Fuß (Höhe UND Neigung ×
    // ha), seine Breite bleibt: die Blatt-Fläche fällt genau linear mit ha, wie das Gesetz sagt. Bis hierher staute der Leser
    // nur y: die Neigung und der Fußabdruck jedes Halms blieben, die Fläche des Büschels fiel bei ha 0,35 nur auf 0,44 (L1) bzw.
    // 0,46 (L2) und die Krone der Wiese deckte von oben wie im Sommer (Fläche von oben × 1,00) — Radeon 87537d3f, Mess-Wiese Ego:
    // LAI 2–10 m Winter 0,567 × Sommer. Die Breite des Halms liegt waagrecht quer zu seiner Ebene (emitGrass: rt = dir × Y), die
    // Normale steht senkrecht auf ihr — ihr waagrechter Teil (nx, nz) nennt die Ebene, q = (nz, 0, −nx) die Breite. Eingang: der
    // Versatz (ox, oy, oz) der Ecke von ihrem Fuß AM BODEN (aCenter x/z, y 0), die Normale der Vorlage, `aehre` 1 an der Ähre (sie
    // kürzt als Ganzes um den Fuß ihres Stängels — ihr Anker, geboren in emitGrass), 0 am Halm; ein fast flach liegendes
    // Stück (|q| < quer) kürzt auch quer (ohne Ebene keine Breite). Rückgabe der Versatz im Jahr; Sommer (ha 1) exakt die Ecke. Über einer Algebra wie
    // `kroneImJahr` (WIND_ZAHLEN die Linse, die TSL-Algebra Welt-Stoff, Ferne und Schale, WIND_GLSL das Labor).
    var HALM_JAHR = Object.freeze({ quer: [0.02, 0.12] });
    function halmImJahr(A, ha, ox, oy, oz, nx, nz, aehre) {
        const Q = HALM_JAHR.quer;
        const q2 = A.add(A.mul(nx, nx), A.mul(nz, nz));
        const breit = A.mul(
            A.min(A.max(A.mul(A.add(A.sqrt(q2), A.k(-Q[0])), A.k(1 / (Q[1] - Q[0]))), A.k(0)), A.k(1)),
            A.add(A.k(1), A.mul(aehre, A.k(-1)))
        );
        // w · q ist der Teil des Versatzes längs der Breite: er kürzt nicht (× (1 − ha) zurück auf die volle Breite)
        const w = A.mul(
            A.mul(A.add(A.mul(ox, nz), A.mul(A.mul(oz, nx), A.k(-1))), A.pow(A.max(q2, A.k(1e-8)), A.k(-1))),
            A.mul(breit, A.add(A.k(1), A.mul(ha, A.k(-1))))
        );
        return {
            x: A.add(A.mul(ox, ha), A.mul(nz, w)),
            y: A.mul(oy, ha),
            z: A.add(A.mul(oz, ha), A.mul(A.mul(nx, w), A.k(-1))),
        };
    }
    // DIE PHÄNOLOGIE JE ART (Meisterkarte 2 leben.pflanzen.jahreslauf#2, additiv): jede Art erwacht im Frühling, wenn die WÄRME
    // ihres Orts ihre Schwelle erreicht — die Grünland-Temperatursumme (GTS, Ernst & Loeper 1976, die Agrarmeteorologie des DWD:
    // die positiven Tagesmittel ab dem 1. Januar, Januar × 0,5, Februar × 0,75, danach × 1; GTS 200 °C ≈ Vegetationsbeginn) aus der
    // EINEN Jahres-Welle der Luft des Orts (gelaende-core `temperaturFeld`: Mittel, Amplitude, Gipfel, Verspätung). Die Schwellen
    // sind die GTS der beobachteten Eintritts-Tage im Bezugs-Klima: das Phänologie-Netz des DWD (Jahresmelder, 1991–2020, Mittel
    // der Tage: Hasel Blüte 47,1 · Schwarz-Erle Blüte 66,1, Blattentfaltung 105,7 · Hänge-Birke Austrieb 95,8, Blattentfaltung
    // 105,3, Blüte 108,9 · Rotbuche Blattentfaltung 114,0 · Stiel-Eiche Blattentfaltung 119,9; Hasel Blüte-Ende 76,1, Sofortmelder)
    // über dem Gebietsmittel Deutschland 1991–2020 (DWD, regional_averages_tm: 9,30 °C, die erste Harmonische 8,85 K, der kälteste
    // Tag 17,6). Gesetz, keine Tabelle: in einem kälteren Ort steigt die Summe später, und jede Art erwacht später, in der Reihe
    // ihrer Schwellen (Hasel vor Erle vor Birke vor Buche vor Eiche). `laub` die GTS der Blattentfaltung (die Präsenz des Laubs geht
    // dort durch 0,5; `austriebKd` die Spanne von 0 bis 1 = 2 × Austrieb → Blattentfaltung der Birke), `bluete` die GTS der Blüte
    // (`bluehKd` die Dauer der Blüte: Beginn → Ende der Hasel; sie steigt und fällt über je die halbe Dauer). Eine Art ohne Zeile
    // des Laubs trägt das Laub des `bestand` (die Rotbuche: der Buchenwald ist die natürliche Waldgesellschaft Mitteleuropas,
    // Ellenberg 1996) — die Hasel meldet das Netz nur in der Blüte; eine Art ohne Zeile der Blüte die Blüte des SAISON_GESETZ.
    // Der Herbst ist das Licht, nicht die Wärme (der Laubfall folgt der Tageslänge, Delpierre et al. 2009): ihn trägt das
    // SAISON_GESETZ für jede Art; im Herbst steht die Summe auf ihrem Wert zur Mitte des Sommers.
    var PHAENO_GESETZ = Object.freeze({
        kaltTag: 17.6, // der kälteste Tag des Bezugs-Jahrs nach dem 1. Januar (der Anfang der Summe vor der Kälte)
        gewicht: Object.freeze([
            [31, 0.5],
            [59, 0.75],
        ]), // [bis Tag, Gewicht] — Januar, Februar; danach 1
        laub: Object.freeze({ baum_erle: 297, baum_birke: 294, baum_buche: 376, baum_eiche: 438 }),
        bluete: Object.freeze({ busch_hazel: 22, baum_erle: 61, baum_birke: 326 }),
        bestand: "baum_buche",
        austriebKd: 153,
        bluehKd: 79,
        bluehMax: 0.85, // die volle Blüte (SAISON_GESETZ bl des Frühlings)
    });
    // Die Schwellen einer Art: [GTS des Laubs, GTS der Blüte oder −1 (die Blüte des SAISON_GESETZ)]
    function phaenoArt(art) {
        const P = PHAENO_GESETZ;
        const l = P.laub[art];
        const b = P.bluete[art];
        return [Number.isFinite(l) ? l : P.laub[P.bestand], Number.isFinite(b) ? b : -1];
    }
    // Die GTS zur Welt-Phase `phase` an der Jahres-Welle `welle` { mittel, amp, gipfel, spaet } (gelaende-core `temperaturFeld`:
    // mittel und jahr) in einem Jahr von `jahrTage` Tagen. `sommer` die Phase der Mitte des Sommers, `winter` die des Winters (die
    // Phase des Frühlings liegt dazwischen): im Herbst steht die Summe auf ihrem Wert zur Mitte des Sommers. Tagesmittel = Mittel +
    // die Jahres-Welle (der Tagesgang mittelt sich weg); der 1. Januar liegt `kaltTag` Tage vor dem kältesten Tag der Welle.
    function gruenSumme(welle, phase, jahrTage, sommer, winter) {
        const N = jahrTage > 0 ? jahrTage : 365;
        const ring = (v) => ((v % 1) + 1) % 1;
        const imFruehling = ring(phase - winter) <= ring(sommer - winter);
        const bis = imFruehling ? phase : sommer;
        const kalt = welle.gipfel + welle.spaet / (2 * Math.PI) + 0.5;
        const jan = kalt - PHAENO_GESETZ.kaltTag / N;
        const tage = ring(bis - jan) * N;
        const G = PHAENO_GESETZ.gewicht;
        let s = 0;
        for (let d = 0; d < tage; d++) {
            const dt = Math.min(1, tage - d);
            const p = jan + (d + 0.5 * dt) / N;
            const t = welle.mittel + welle.amp * Math.cos(2 * Math.PI * (p - welle.gipfel) - welle.spaet);
            if (t <= 0) continue;
            const g = d < G[0][0] ? G[0][1] : d < G[1][0] ? G[1][1] : 1;
            s += t * g * dt;
        }
        return s;
    }
    // Das Laub einer Art im Jahr über einer Algebra (WIND_ZAHLEN die CPU, die TSL-Algebra der Stoff): `G` die GTS, `F` die Schwelle
    // des Laubs, `herbst` das Laub des SAISON_GESETZ im Herbst (im Frühling 1), `w` die kahle Krone (SAISON_GESETZ pr des Winters).
    function laubImJahr(A, G, F, herbst, w) {
        const r = A.min(
            A.max(A.add(A.k(0.5), A.mul(A.add(G, A.mul(F, A.k(-1))), A.k(1 / PHAENO_GESETZ.austriebKd))), A.k(0)),
            A.k(1)
        );
        return A.min(A.add(A.k(w), A.mul(r, A.k(1 - w))), herbst);
    }
    // Die Blüte einer Art im Jahr (Schwelle `Fb` ≥ 0): steigt über die halbe Dauer ab der Schwelle, fällt nach der Dauer
    function bluehImJahr(A, G, Fb) {
        const P = PHAENO_GESETZ;
        const h = 2 / P.bluehKd;
        const d = A.add(G, A.mul(Fb, A.k(-1)));
        const auf = A.min(A.max(A.mul(d, A.k(h)), A.k(0)), A.k(1));
        const ab = A.min(A.max(A.mul(A.add(d, A.k(-P.bluehKd)), A.k(h)), A.k(0)), A.k(1));
        return A.mul(A.mul(auf, A.add(A.k(1), A.mul(ab, A.k(-1)))), A.k(P.bluehMax));
    }
    // DER ACKER UND SEINE FRUCHT (Meisterkarte 2 mensch.nahrung frucht S1 · hand S2, additiv): ein bestellter Acker trägt die Spur
    // der Arbeit und den Wuchs der Kulturpflanze als FUNKTION der Tage seit seiner Saat — kein Zustand, keine Liste. `furche`: die
    // Kämme des Pflugs quer zur Zugrichtung gereiht (Abstand der Furchen eines Beetpflugs 0,25–0,35 m, der frisch gewendete Kamm
    // 15–25 cm über der Sohle); `frucht`: die Kulturpflanze (Sommerweizen, Mitteleuropa) gedrillt in Reihen auf den Kämmen, ihr Wuchs über die
    // Stützen [Tag, Höhe m, Reife 0 grün … 1 gelb, Deckung der Reihe] nach dem BBCH-Gang (Auflaufen BBCH 10 nach ~12 Tagen,
    // Bestockung 21–29 bis ~45, Schossen 30–39 bis ~75, Ähre und Blüte 51–69 bis ~95, Milch- und Teigreife 71–87 bis ~125,
    // Vollreife 89 ~135), am `ernteTag` gemäht: dann steht die Stoppel bis zur nächsten Saat. `saatPhase` ist die Phase des Jahrs,
    // in der das Dorf sät (SAISON_GESETZ: 0 Frühling) — wer selbst bestellt, setzt die Saat seiner Stunde. Farben sRGB (der
    // Wirt linearisiert). Leser: der Wirt (`_ackerStand`, `_ackerKoerperTakt`) und gate:koerper-kern (die Kurve).
    var ACKER_GESETZ = Object.freeze({
        furche: Object.freeze({ abstandM: 0.3, hoeheM: 0.2, breiteM: 0.3 }),
        frucht: Object.freeze({
            art: "weizen",
            stuetzen: Object.freeze([
                Object.freeze([0, 0, 0, 0]),
                Object.freeze([12, 0.04, 0, 0.12]),
                Object.freeze([45, 0.18, 0, 0.45]),
                Object.freeze([75, 0.6, 0, 0.7]),
                Object.freeze([95, 0.9, 0.1, 0.8]),
                Object.freeze([125, 0.9, 0.6, 0.8]),
                Object.freeze([135, 0.85, 1, 0.8]),
            ]),
            ernteTag: 140,
            stoppel: Object.freeze({ hoeheM: 0.14, deckung: 0.35 }),
            gruen: 0x55732e,
            reif: 0xc9a456,
            stoppelFarbe: 0xb3a174,
        }),
        saatPhase: 0,
    });
    // DER STAND DES ACKERS `tage` nach seiner Saat (rein): { tage, hoeheM, reife, deckung, stoppel, farbe (sRGB-Zahl) } — vor der
    // Saat (tage < 0) und nie bestellt: null (der Acker liegt brach, nur sein gemalter Grund)
    function ackerStand(tage) {
        if (!(tage >= 0)) return null;
        var F = ACKER_GESETZ.frucht,
            S = F.stuetzen;
        var mische = function (a, b, t) {
            var r = 0,
                k;
            for (k = 0; k < 3; k++) {
                var s = 16 - 8 * k,
                    ca = (a >> s) & 255,
                    cb = (b >> s) & 255;
                r = r * 256 + Math.round(ca + (cb - ca) * t);
            }
            return r;
        };
        if (tage >= F.ernteTag)
            return {
                tage: tage,
                hoeheM: F.stoppel.hoeheM,
                reife: 1,
                deckung: F.stoppel.deckung,
                stoppel: true,
                farbe: F.stoppelFarbe,
            };
        var i = 0;
        while (i < S.length - 2 && tage >= S[i + 1][0]) i++;
        var a = S[i],
            b = S[i + 1],
            t = Math.max(0, Math.min(1, (tage - a[0]) / (b[0] - a[0])));
        var reife = a[2] + (b[2] - a[2]) * t;
        return {
            tage: tage,
            hoeheM: a[1] + (b[1] - a[1]) * t,
            reife: reife,
            deckung: a[3] + (b[3] - a[3]) * t,
            stoppel: false,
            farbe: mische(F.gruen, F.reif, reife),
        };
    }
    // DIE TAGE SEIT DER SAAT DES DORFS zur Phase des Jahrs `phase` (0–1, SAISON_GESETZ) in einem Jahr von `jahrTage` Tagen
    function ackerTage(phase, jahrTage) {
        var p = (((phase - ACKER_GESETZ.saatPhase) % 1) + 1) % 1;
        return p * jahrTage;
    }
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
    //   trieb      DER TRIEB (w28-halm-trieb): ein Fuß trägt keinen Einzel-Halm, er trägt einen TRIEB — schmale Blätter, die
    //              sich die Blatt-Fläche des Fußes teilen (`flaeche`: Labor-Breiten × Halm-Länge je Fuß bei Halm-Anteil 1 — die
    //              Fläche, die die L1 bis hier trug: 0,92 × 3,0 × 0,74 × 0,763, der Stängel 0,92 × 3,0 × 0,5 × 0,719; eine
    //              Stufe mit weniger Füßen trägt je Fuß entsprechend mehr, eine mit weniger Blättern je Blatt). Die MITTELLINIE
    //              jedes Blatts ist Gesetz in Halm-Koordinaten (`halmLinie`): die Neigung gegen das Lot θ(s) = θ0 + Θ · s² über
    //              dem Bogen-Anteil s — jede Stufe TASTET sie an ihren Stützen ab, keine integriert sie neu (bis hier fiel die
    //              Biegung je SCHRITT an: K 3 las 6,7°, K 10 17,2° Bogen am selben Halm). `blaetter`: je Blatt `laenge`
    //              [von, bis] der Halm-Länge, `bogen` [von, bis] Θ in Einheiten der Art-Biegung (droop), `neigung` × die
    //              Fuß-Neigung des Halms, `breit` relativ; das erste ist das lange Blatt im Bogen, die weiteren die jungen,
    //              geraden. `faecher` [Grund, Wurf] rad: wechselständig um die Richtung des Triebs; `fuss` der Abstand der
    //              Blatt-Füße (Labor-Einheiten). `staengel`: der Ähren-Stängel ist ein Trieb aus EINEM Blatt (seine Fläche,
    //              sein flacher Bogen), die Spindel der Ähre läuft auf DERSELBEN Linie über s = 1 hinaus.
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
        trieb: Object.freeze({
            flaeche: 1.559,
            faecher: Object.freeze([0.7, 1.1]),
            fuss: 0.015,
            neigungWurf: 0.25,
            bogenWurf: 1.5,
            blaetter: Object.freeze([
                Object.freeze({
                    laenge: Object.freeze([0.95, 1.25]),
                    bogen: Object.freeze([1.0, 3.9]),
                    neigung: 1.0,
                    breit: 1,
                }),
                Object.freeze({
                    laenge: Object.freeze([0.5, 0.85]),
                    bogen: Object.freeze([0.3, 1.0]),
                    neigung: 0.6,
                    breit: 0.8,
                }),
                Object.freeze({
                    laenge: Object.freeze([0.6, 1.0]),
                    bogen: Object.freeze([0.3, 1.0]),
                    neigung: 1.6,
                    breit: 0.8,
                }),
            ]),
            staengel: Object.freeze({ flaeche: 0.992, bogen: 0.18 }),
        }),
        dach: Object.freeze({ px: Object.freeze([0.001, 0.003]), oben: 0.9 }),
    });
    // DIE MITTELLINIE DES HALMS (w28-halm-trieb, HALM_GESETZ.trieb): Ort und Neigung bei Bogen-Anteil s der Linie θ(u) = th0 +
    // TH · u² — [quer, hoch, θ] in Blatt-Längen, quer in der Lot-Ebene der Blatt-Richtung. Simpson über 16 Teile bis s (der
    // Fehler unter 1e-6 Blatt-Längen bis Θ 4): EIN Wert je (th0, TH, s) für jede Stufe, die Ähre liest s > 1.
    function halmLinie(th0, TH, s) {
        const n = 16,
            h = s / n;
        let x = 0,
            y = 0;
        for (let i = 0; i <= n; i++) {
            const u = i * h,
                th = th0 + TH * u * u,
                w = i === 0 || i === n ? 1 : i % 2 ? 4 : 2;
            x += w * Math.sin(th);
            y += w * Math.cos(th);
        }
        return [(x * h) / 3, (y * h) / 3, th0 + TH * s * s];
    }
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
    // DER WUCHS DES ORTS (Reise, Welle 3 — `a.wuchs`, Pflicht: gelaende-core `ortGesetz(teil).wuchs`): der Wurf der Baum-Schicht
    // trägt den Wald-Anteil des Orts (`wald`), der der Kraut- und Strauch-Schicht den der Krautschicht (`decke`), der Fels keinen —
    // in der Heimat 1, jeder Wurf wie zuvor.
    function streuRegion(a) {
        const SC = a.SC;
        const W = a.wuchs;
        if (!W || !Number.isFinite(W.wald) || !Number.isFinite(W.decke))
            throw new Error(
                "phyto-core streuRegion: der Wuchs des Orts fehlt im Auftrag (wuchs: wald · decke, KERN-PFLICHT)"
            );
        const feld = streuFelder(a.bake, a.leser);
        return a.layers.map((layer) => {
            const out = [];
            const klima = layer.kind === "rock" ? 1 : layer.kind === "tree" ? W.wald : W.decke;
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
                    if (streuPcgFloat(cellX ^ salt, cellZ, 9) >= prob * a.fdScale * klima) continue;
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
        karteTiefe: karteTiefe, // w4-laub-karte — die Tiefe je Texel der Karte (vor/hinter der Mitte des Rahmens) über einer Algebra
        karteTiefeVersatz: karteTiefeVersatz, // ihr Rückweg: der Versatz in Metern der Vorlage
        scanRadialXZ: scanRadialXZ,
        geoVerschmelzen: geoVerschmelzen, // w5-pipeline — die Teile hintereinander (das Gesetz der Golden-Stufen, kein Addon)
        eckenVerschmelzen: eckenVerschmelzen, // w5-pipeline — gleiche Ecken teilen einen Index
        forestCellRng: forestCellRng,
        FOREST_STAND: FOREST_STAND,
        FREISTAND: FREISTAND,
        forestSeitenlicht: forestSeitenlicht,
        BESTAND: BESTAND, // T2: der Laubbaum im Bestand (Seitenast-Länge und Kronen-Hub)
        bestandArt: bestandArt, // steht die Art im Bestand (Laubbaum ohne `solitaer`)?
        STAMM_KRONE: STAMM_KRONE, // w28-stamm-krone: der Stamm des Laubbaums aus dem Schirm seiner Krone
        stammAusKrone: stammAusKrone,
        solitaerGestalt: solitaerGestalt,
        forestStandDensity: forestStandDensity,
        forestGeburt: forestGeburt,
        forestBestand: forestBestand,
        forestKronenDeckung: forestKronenDeckung, // K16: die Kronen-Deckung des gepflanzten Bestands (das Dach des Rings liest sie)
        forestOktavMittel: forestOktavMittel, // K16: die Blende einer Oktave unter einem Fußabdruck (Wert → Mittel) // K16: Bestandsdichte + Deckung unter einem Fußabdruck (die Fern-Farbe)
        forestNicheWeights: forestNicheWeights,
        forestNische: forestNische,
        forestTreeSize: forestTreeSize,
        // der Lebenslauf des Bestands (Bahn mischwald): die Tafeln, die Kurve je Art, die Größe in der Phase, die Phase des Flecks
        FOREST_ERTRAG: FOREST_ERTRAG,
        forestErtragKurve: forestErtragKurve,
        forestErtragGroesse: forestErtragGroesse,
        forestFleckPhase: forestFleckPhase,
        forestVorher: forestVorher,
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
        FOREST_URTEIL_REIHE: FOREST_URTEIL_REIHE, // w4-b-pflanzen — die Reihe des Urteils: die eigene Zelle, Ring 1, Ring 2
        forestSteht: forestSteht, // w4-b-pflanzen — DAS EINE Urteil der Kronen-Schüchternheit (Wald-Faden und Wirt)
        forestStehende: forestStehende, // w4-b-pflanzen — der Bestand einer Zelle: ihre geborenen Darts, die stehen
        forestSchluss: forestSchluss, // w16-wald-innen — der Kronen-Schluss des Bestands aus dem Stand (Mindestabstand × c)
        forestLichtung: forestLichtung, // w16-wald-innen — die Geburt des Walds am Stand (0 = Lichtung/Wiese)
        forestWaldgrenze: forestWaldgrenze, // w16-wald-innen-pm — die Geburt im Schnee des Sommers (gelaende-core `schnee`)
        forestOrt: forestOrt, // w20-wald-kosten — die Geburt im Saum jenseits des Siedlungsrands (fachwerk `siedlungsReich`)
        forestOrtAbstand: forestOrtAbstand, // w20-wald-kosten — der Abstand jenseits des nächsten Siedlungsrands [x, z, rand]
        forestSchicht: forestSchicht, // w16-wald-innen — die Schicht eines Darts: 1 Dach, das Alter im Zwischen-/Unterstand, 0
        FOREST_URTEIL_REICH: FOREST_URTEIL_REICH, // w16-wald-innen — die Zellen ±n, deren geborene Darts ein Bestand liest
        forestKammKronen: forestKammKronen, // w10-ferne — die Bäume des Bestands, deren Krone den Kamm gegen den Himmel trägt
        KAMM_FELDER: KAMM_FELDER,
        planForestCell: planForestCell,
        growSkeleton: growSkeleton,
        genomStrom: genomStrom, // w4-b-pflanzen — der Sub-Strom eines Genoms (xorshift32 über dem FNV-Zustand seines Namens)
        WUCHS_ZAHLEN: WUCHS_ZAHLEN, // w4-b-pflanzen — das Maß des gepackten Wuchses (Kopf · Segment · Blatt · Lauf)
        wuchsPacken: wuchsPacken, // w4-b-pflanzen — das Skelett als EIN Float64Array (der Transfer des Wald-Fadens)
        wuchsEntpacken: wuchsEntpacken, // w4-b-pflanzen — dasselbe Skelett zurück, Feld für Feld
        PHYLO_GESETZ: PHYLO_GESETZ,
        PHYLO_VIS: PHYLO_VIS,
        WX_GESETZ: WX_GESETZ,
        WX_VIS: WX_VIS,
        WX_LICHT: WX_LICHT,
        WIND_FELD: WIND_FELD, // wetter.K5 · K1 — der Wind am Ort in m/s und die Front
        windRichtung: windRichtung, // wetter.K5 — DIE EINE Wind-Richtung (Saat, Zeit)
        windGrund: windGrund, // wetter.K1 — die Grundrichtung, mit der die Fronten ziehen
        wetterAt: wetterAt, // wetter.K1 — DAS Wetter am Ort (Saat, Ort, Zeit) → Zeile von WX_GESETZ
        WETTER_ORT: WETTER_ORT, // wetter-am-ort — das Maß des Felds am Ort (Kante, Eingriff, Lee, Relief, Profil, Mäander)
        wetterFeldAm: wetterFeldAm, // wetter-am-ort — DAS Feld am Ort {fog, sun, grey, wind, rain} mit Relief und Eingriff
        windWeg: windWeg, // wetter-am-ort — ∫ windRichtung dτ geschlossen (der Zug der Wolken-Schicht)
        windProfil: windProfil, // wetter-am-ort — der Wind über der Höhe (Hellmann) als Faktor des Winds am Ort
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
        lagenZaehler: lagenZaehler, // die Arbeit des Lagen-Rasters: Rufe · Dreiecke · Proben · Treffer (gate:asset-contract)
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
        buildFelsturmGeometry: buildFelsturmGeometry, // die Gestalt der Landmarke in ihrer Größe (landmarken-geologie-5)
        buildFelsbogenGeometry: buildFelsbogenGeometry, // das Felstor in seiner Größe, mit Öffnung (landmarken-geologie-5)
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
        karteSaumRinge: karteSaumRinge, // w4-laub-saum — der Saum je Hebungs-Ring: Seitenmaß der Texel und Kronen-Fuß
        karteSaumSchluessel: karteSaumSchluessel, // w23-karte-l2 — der Schlüssel der Wahl jeder Stufe (Band, Muster, Stamm)
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
        budgetFrei: budgetFrei, // E8.1: die Dreiecke, die die Zeile frei stellt (`ohneVerband`, vor der Faltung gezählt)
        boeTempo: boeTempo, // wind-saison — die Böe zieht mit dem Wind (Taylor 1938)
        WIND_GESETZ: WIND_GESETZ, // K19 — das Wind-Gesetz des Baums (f0 = kF·D/H², Stamm < Ast < Blatt, Last ∝ U^vogel)
        stammDurchmesser: stammDurchmesser, // K19 — der Fuß-Durchmesser der gelieferten Gestalt (Ring des Stamm-Strangs)
        windSchlankheit: windSchlankheit, // K19 — δ = D(Brusthöhe) / H der gelieferten Gestalt
        windSchlankheitAchse: windSchlankheitAchse, // K19 — dasselbe δ an der Stamm-Achse eines Skeletts (Werkstatt-Baum)
        windAusschlag: windAusschlag, // K19 — DER EINE Wind-Term über einer Algebra (Welt-Stoff, Labor-Shader, Linse)
        WIND_ZAHLEN: WIND_ZAHLEN, // K19 — die Zahlen-Algebra des Terms
        KRONE_JAHR: KRONE_JAHR, // w21 — das Holz der kahlen Krone (Anteil ihrer Sommer-Deckung)
        kroneImJahr: kroneImJahr, // w21 — DIE KRONE IM JAHR über einer Algebra (Fern-Krone: Ring, Boden, Kamm, Panorama)
        HALM_JAHR: HALM_JAHR, // w26 — die Gestalt des Halms im Jahr: ab welcher waagrechten Normale er seine Breite trägt
        halmImJahr: halmImJahr, // w26 — DER HALM IM JAHR über einer Algebra (Nah-Wiese, Ferne, Schale, Labor): Länge × ha, Breite bleibt
        PHAENO_GESETZ: PHAENO_GESETZ, // jahreslauf#2 — die Phänologie je Art: GTS-Schwellen von Laub und Blüte (DWD 1991–2020)
        phaenoArt: phaenoArt, // jahreslauf#2 — die Schwellen einer Art [Laub, Blüte oder −1]
        gruenSumme: gruenSumme, // jahreslauf#2 — die Grünland-Temperatursumme zur Phase aus der Jahres-Welle des Orts
        laubImJahr: laubImJahr, // jahreslauf#2 — das Laub einer Art im Jahr über einer Algebra (CPU, Stoff)
        bluehImJahr: bluehImJahr, // jahreslauf#2 — die Blüte einer Art im Jahr über einer Algebra (CPU, Stoff)
        ACKER_GESETZ: ACKER_GESETZ, // acker-kette — der bestellte Acker: Furchen des Pflugs, die Kulturpflanze in Reihen, ihr Wuchs je Tag
        ackerStand: ackerStand, // acker-kette — der Stand des Ackers n Tage nach der Saat (Höhe, Reife, Deckung, Stoppel, Farbe)
        ackerTage: ackerTage, // acker-kette — die Tage seit der Saat des Dorfs zur Phase des Jahrs
        WIND_GLSL: WIND_GLSL, // K19 — die GLSL-Algebra des Terms (Labor)
        LAUB_LICHT: LAUB_LICHT, // K19 — Durchlass des Blatts (tau = T/R je Laub/Nadel) und die Vorwärts-Keule
        laubDurchlass: laubDurchlass, // K19 — DER EINE Laub-Licht-Term über einer Algebra (Welt-Stoff, Labor-Shader, Linse)
        HALM_GESETZ: HALM_GESETZ, // w4-wiese-nah — der Halm: Querschnitt, Adern, Spitze, Narbe, Cuticula, Ähre
        halmLinie: halmLinie, // w28-halm-trieb — die Mittellinie eines Blatts (Ort und Neigung bei Bogen-Anteil s)
        halmQuer: halmQuer, // die Steigung des Querschnitts (Kiel + Rippen) über einer Algebra
        halmAder: halmAder, // der Faktor der Adern und der Mittel-Rippe auf die Albedo über einer Algebra
        halmNarbe: halmNarbe, // das Licht in der Narbe (direkt · Himmel) über einer Algebra — Halm und Boden darunter
    };
})(typeof self !== "undefined" ? self : typeof globalThis !== "undefined" ? globalThis : this);
