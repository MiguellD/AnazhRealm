#!/usr/bin/env node
// SPIKE „Baupläne Luft und Wasser“ (nur lesend gegen das Repo, main 18058dba). Lädt die Ofen-Kerne wie gate:tier-anatomie
// (welt-boot fadenScope, three r184 im node-vm) — tetrapoda-core.js und foundry-core.js als KOPIE im vm mit BENANNTEN Ersetzungen
// (unten `ERSETZUNGEN`), nie ein Zweit-Modell. Misst:
//  (1) BAU     — baut der echte Ofen (BAKERS_BY_KIND.kreatur = bakeTierInstance) Vogel und Fisch aus dem Primitiv-Wortschatz von
//                bauTier (F.kugel/F.gruppe/F.kugelFein)? Tris je Stufe gegen das Budget tetrapoda-core.js:45–46, Haut geschlossen?
//                Liegen Flügel/Flosse in der Haut oder fallen sie unter TIER_HAUT.minVox (foundry-core.js:8379) heraus?
//  (2) PHYSIK  — Punkte derselben Vorlage: Spatz ↔ Adler ↔ Albatros, Hering ↔ Thun ↔ Aal; Silhouetten-Maße am GEGOSSENEN Mesh
//                gegen die Eingabe (Bau-Treue, tautologisch benannt) und die Physik gegen Literatur (nicht tautologisch)
//  (3) MISCHUNG— lineare Formziele zwischen den Punkten (Refit des Leib-Raums, foundry __leibRaumRefit) gegen den echten Refit
//  (4) BEWEGUNG— Schlag-Frequenz (Pennycuick) und Schwanzschlag (Strouhal); die Leser im Kern mit Datei:Zeile (live gegrept)
//  (5) PREIS   — Instanz-Floats, Pose-Tafel, Tris im Schirm für 10³ Vögel und 10⁴ Fische nach einem Stufen-Gesetz; fischSchritt-Takt
// Aufruf: node luftwasser.cjs [--repo <pfad>]   (~20–40 s, ein Faden, kein GPU)
"use strict";
const path = require("path");
const fs = require("fs");
const vm = require("vm");
const t0 = Date.now();
const arg = (n, d) => {
    const i = process.argv.indexOf(n);
    return i > 0 ? process.argv[i + 1] : d;
};
const REPO = arg("--repo", "C:/Users/micha/AnazhRealm-profiband");
const { fadenScope } = require(path.join(REPO, "scripts/lib/welt-boot.cjs"));
const log = (...a) => console.log(...a);
const f1 = (x) => (Math.round(x * 10) / 10).toFixed(1);
const f2 = (x) => (Math.round(x * 100) / 100).toFixed(2);
const f3 = (x) => x.toFixed(3);
const H_BAU = 2.4; // gewählt: jede Vorlage wird im Rahmen des Wolfs gebaut (H = Körperlänge = 2,4 Lab-Einheiten); die Skala trägt die Instanz

// ════════════════════════ DIE VORLAGE (wird in die Kern-KOPIE von tetrapoda-core.js eingesetzt) ════════════════════════
// bauLuftWasser(F, d): derselbe Fabrik-Wortschatz wie bauTier (tetrapoda-core.js:4193–4199: F.gruppe · F.kugel(r, klasse, sc) ·
// F.kugelFein), dieselben Gelenk-Namen wie der Ofen sie bindet (foundry-core.js:8297–8322): der Flügel IST die Vordergliedmaße
// (legFL → flU Humerus → flL Elle → flP Hand), die Brustflosse ebenso; der Fisch-Rumpf hinter dem Kopf IST die Rute (tailRoot +
// 10 tailSegs, die Kette, die tierPose :3681–3682 schon als laufende Welle dreht). d = der Punkt (normiert auf die Körperlänge).
function bauLuftWasser(F, d) {
    var H = 2.4;
    var root = F.gruppe();
    var T = { wolf: root };
    var tailSegs = [],
        neckSegs = [];
    var ell = function (par, k, hx, hy, hz, x, y, z, rx, ry, rz, fl) {
        var r = Math.max(hx, hy, hz);
        var m = F.kugel(r, k, [hx / r, hy / r, hz / r]);
        if (fl) {
            m.userData.__station = fl;
            if (d.flaeche) m.userData.__flaeche = true; // DIE FLÄCHE gießt nie in die Haut (E6), sie bleibt starr an ihrem Gelenk
        } else if (d.flaeche && k === "fell") m.userData.__haut = true; // E7: das Haut-Primitiv des Bauplans fällt nie unter minVox heraus
        m.position.set(x, y, z);
        if (rx || ry || rz) m.rotation.set(rx || 0, ry || 0, rz || 0);
        par.add(m);
        return m;
    };
    var grp = function (par, x, y, z) {
        var g = F.gruppe();
        g.position.set(x, y, z);
        par.add(g);
        return g;
    };
    var masse = { H: H, bauplan: d.bauplan };
    if (d.bauplan === "vogel") {
        var a = d.a * H,
            r = d.rT * H,
            rh = d.kopf * H;
        masse.hoch = r;
        // DER RUMPF: Leib, Brust (Kiel), Bürzel
        ell(root, "fell", r * 0.95, r * 1.05, a, 0, 0, 0);
        ell(root, "fell", r * 0.8, r * 0.85, a * 0.55, 0, -r * 0.25, a * 0.35);
        ell(root, "fell", r * 0.7, r * 0.7, a * 0.45, 0, r * 0.1, -a * 0.6);
        // DER HALS (3 Glieder) und DER KOPF (Schädel + Gesicht, Schnabel als Horn, Unterschnabel am Kiefer)
        var h0 = [0, r * 0.5, a * 0.75],
            h1 = [0, r * 0.75, a + rh * 0.9];
        for (var i = 0; i < 3; i++) {
            var u = (i + 0.5) / 3;
            var ng = grp(root, h0[0], h0[1] + (h1[1] - h0[1]) * u, h0[2] + (h1[2] - h0[2]) * u);
            ell(ng, "fell", rh * 0.62, rh * 0.62, rh * 0.62, 0, 0, 0);
            neckSegs.push(ng);
        }
        var kopf = (T.headGroup = grp(root, h1[0], h1[1], h1[2]));
        ell(kopf, "fell", rh, rh, rh, 0, 0, 0);
        ell(kopf, "fell", rh * 0.8, rh * 0.75, rh, 0, -0.1 * rh, 0.35 * rh);
        ell(kopf, "klaue", rh * 0.32, rh * 0.3, (d.schnabel * H) / 2, 0, -0.1 * rh, rh * 0.9 + (d.schnabel * H) / 2);
        var kiefer = (T.jawGroup = grp(kopf, 0, -0.28 * rh, 0.7 * rh));
        ell(kiefer, "klaue", rh * 0.28, rh * 0.16, d.schnabel * H * 0.45, 0, 0, d.schnabel * H * 0.45);
        kiefer.add(F.kugel(rh * 0.3, "fell"));
        for (var se = -1; se <= 1; se += 2) {
            var au = F.kugelFein(0.18 * rh, "tierauge", 16);
            au.position.set(se * 0.75 * rh, 0.15 * rh, 0.35 * rh);
            kopf.add(au);
        }
        // DIE FLÜGEL = die Vordergliedmaße: Schulter (legF*) → Humerus (f*U) → Elle (f*L) → Hand (f*P); die Fläche als Kette
        // flacher Ellipsoide (12 Stationen, Sehne elliptisch, Dicke tc·c), die Hand-Stationen im Feder-Fall als dünne Schwungfedern
        var w = d.s * H - r * 0.75,
            e1 = d.arm[0] * w,
            e2 = d.arm[1] * w,
            cR = d.cR * H,
            NW = 12,
            dx = w / NW;
        for (var side = 1; side >= -1; side -= 2) {
            var L = side > 0 ? "L" : "R",
                l = side > 0 ? "l" : "r";
            var sh = (T["legF" + L] = grp(root, side * r * 0.75, r * 0.45, a * 0.45));
            var U = (T["f" + l + "U"] = grp(sh, 0, 0, 0));
            var El = (T["f" + l + "L"] = grp(U, side * e1, 0, 0));
            var Ha = (T["f" + l + "P"] = grp(El, side * (e2 - e1), 0, 0));
            for (var k = 0; k < NW; k++) {
                var eta = (k + 0.5) / NW,
                    x = eta * w;
                var c = cR * Math.sqrt(Math.max(0.06, 1 - eta * eta));
                var hand = d.flaeche ? k >= 7 : x > e2;
                var th = d.flaeche && hand ? d.federTc * c : (0.11 - 0.07 * eta) * c;
                var arm1 = d.flaeche ? k < 4 : x < e1;
                var par = arm1 ? U : hand ? Ha : El,
                    jx = arm1 ? 0 : hand ? e2 : e1;
                ell(par, "fell", dx, th / 2, c / 2, side * (x - jx), 0, 0.25 * cR - c / 2, 0, 0, 0, "fluegel");
            }
        }
        // DER SCHWANZ: tailRoot + 2 Glieder (Pygostyl), der Fächer der Steuerfedern am letzten Glied
        var tr = (T.tailRoot = grp(root, 0, r * 0.25, -a * 0.85));
        var s0 = grp(tr, 0, 0, 0),
            s1 = grp(s0, 0, 0, -0.04 * H);
        tailSegs.push(s0, s1);
        ell(s0, "fell", r * 0.4, r * 0.3, r * 0.4, 0, 0, 0);
        var lt = d.schwanz * H,
            wt = d.schwanzB * H;
        for (var q = -1; q <= 1; q++) {
            var phi = q * 0.26;
            var tt = d.flaeche ? d.federTc * wt : 0.12 * wt;
            ell(s1, "fell", wt / 2, tt / 2, lt / 2, Math.sin(phi) * lt * 0.5, 0, -Math.cos(phi) * lt * 0.5, 0, phi, 0, "schwanz");
        }
        // DIE BEINE: Hüfte → Oberschenkel (im Leib) → Lauf, im Flug angelegt
        for (side = 1; side >= -1; side -= 2) {
            L = side > 0 ? "L" : "R";
            l = side > 0 ? "l" : "r";
            var hu = (T["legH" + L] = grp(root, side * r * 0.4, -r * 0.55, -a * 0.1));
            var ht = (T["h" + l + "T"] = grp(hu, 0, 0, 0));
            ell(ht, "fell", r * 0.3, r * 0.3, r * 0.3, 0, 0, 0);
            var hc = (T["h" + l + "C"] = grp(ht, 0, -r * 0.2, 0));
            ell(hc, "fell", r * 0.14, r * 0.14, d.bein * H * 0.5, 0, 0, -d.bein * H * 0.5);
            var hp = (T["h" + l + "P"] = grp(hc, 0, 0, -d.bein * H));
            ell(hp, "klaue", r * 0.06, r * 0.06, d.bein * H * 0.3, 0, 0, -d.bein * H * 0.3);
        }
    } else {
        // ── DER FISCH: Kopf (3 Stationen) · Rumpf (3) · Rute = der Schwanzstiel als Kette (tailRoot + 10 Glieder) ──
        var SL = d.SL * H,
            D = d.D * H,
            W = d.W * H;
        masse.hoch = D / 2;
        var y0 = function (xx) {
            // NACA-00xx-Dicke, normiert auf Maximum 1, das Maximum nach d.peak geschoben (die Form des geringsten Widerstands)
            var xs = Math.pow(Math.max(1e-6, Math.min(1, xx)), Math.log(0.3) / Math.log(d.peak));
            var yy = (0.2969 * Math.sqrt(xs) - 0.126 * xs - 0.3516 * xs * xs + 0.2843 * xs * xs * xs - 0.1015 * xs * xs * xs * xs) / 0.100031;
            return Math.pow(Math.max(d.pmin, yy), d.voll);
        };
        var zOf = function (xx) {
            return SL * (0.5 - xx);
        };
        var station = function (par, xx, sp, zRel) {
            var g = y0(xx);
            return ell(par, "fell", (W / 2) * g, (D / 2) * g, sp * SL * 0.9, 0, 0, zRel);
        };
        var kopfF = (T.headGroup = grp(root, 0, 0, zOf(0.1)));
        [0.035, 0.09, 0.15].forEach(function (xx) {
            station(kopfF, xx, xx < 0.05 ? 0.035 : 0.06, zOf(xx) - zOf(0.1));
        });
        var kf = (T.jawGroup = grp(kopfF, 0, -(D / 2) * y0(0.06) * 0.4, zOf(0.06) - zOf(0.1)));
        ell(kf, "fell", (W / 2) * y0(0.06) * 0.8, (D / 2) * y0(0.06) * 0.3, 0.05 * SL, 0, 0, -0.01 * SL);
        kf.add(F.kugel((D / 2) * y0(0.06) * 0.2, "fell"));
        for (var sa = -1; sa <= 1; sa += 2) {
            var auF = F.kugelFein(0.16 * (D / 2) * y0(0.09), "tierauge", 16);
            auF.position.set(sa * (W / 2) * y0(0.09) * 0.85, (D / 2) * y0(0.09) * 0.3, zOf(0.09) - zOf(0.1));
            kopfF.add(auF);
        }
        var tf = d.flaeche ? d.flosseDuenn * H : d.flosseHaut * H;
        var flosse = function (par, xx, u, unten, hz, zRel) {
            // ein Element des Rücken- (unten = false) oder After-Flossensaums an der Station xx: die Basis im Leib, die Höhe aus dem Punkt
            var hy = (D / 2) * y0(xx);
            var hd = xx >= u[0] && xx <= u[1] ? u[2] * H : 0;
            var base = 0.5 * hy,
                top = hy + hd;
            var sg = unten ? -1 : 1;
            ell(par, "fell", tf, (top - base) / 2, hz, 0, (sg * (top + base)) / 2, zRel, 0, 0, 0, "flosse");
        };
        [0.22, 0.3, 0.38].forEach(function (xx) {
            station(root, xx, 0.08, zOf(xx));
            flosse(root, xx, d.ruecken, false, 0.08 * SL * 0.8, zOf(xx));
        });
        var trF = (T.tailRoot = grp(root, 0, 0, zOf(0.41)));
        var prev = trF;
        for (var si = 0; si < 10; si++) {
            var xs = 0.44 + si * 0.06;
            var sg = grp(prev, 0, 0, si === 0 ? zOf(0.44) - zOf(0.41) : -0.06 * SL);
            tailSegs.push(sg);
            station(sg, xs, 0.06, 0);
            flosse(sg, xs, d.ruecken, false, 0.06 * SL * 0.8, 0);
            flosse(sg, xs, d.after, true, 0.06 * SL * 0.8, 0);
            prev = sg;
        }
        // DIE SCHWANZFLOSSE als Strahlen-Fächer am letzten Glied: je Lappen ein äußerer und ein innerer Strahl (Gabel)
        var lc = d.lc * H,
            hc = d.caudal.h * H,
            Sc = (hc * hc) / d.caudal.AR;
        var Ro = Math.sqrt((hc / 2) * (hc / 2) + lc * lc),
            th0 = Math.atan2(hc / 2, lc);
        var Ri = (lc * d.caudal.gabel) / Math.cos(th0 / 2);
        var B = (1.25 * Sc) / (Math.PI * (Ro + Ri));
        var c9 = tailSegs[9];
        for (var lo = -1; lo <= 1; lo += 2) {
            [
                [Ro, th0],
                [Ri, th0 / 2],
            ].forEach(function (st) {
                var R = st[0],
                    al = lo * st[1];
                ell(c9, "fell", tf, B, R / 2, 0, Math.sin(al) * (R / 2), -0.03 * SL - Math.cos(al) * (R / 2), al, 0, 0, "flosse");
            });
        }
        // BRUST- (legF* → f*U) und BAUCHFLOSSEN (legH* → h*T): Fächer aus Strahlen
        for (var sd = 1; sd >= -1; sd -= 2) {
            var Ls = sd > 0 ? "L" : "R",
                ls = sd > 0 ? "l" : "r";
            var pg = (T["legF" + Ls] = grp(root, sd * (W / 2) * y0(0.2) * 0.8, -(D / 2) * y0(0.2) * 0.4, zOf(0.22)));
            var pu = (T["f" + ls + "U"] = grp(pg, 0, 0, 0));
            var pl = d.brust * H;
            [0.6, 1.05].forEach(function (an) {
                ell(pu, "fell", pl * 0.25, tf, pl / 2, sd * Math.sin(an) * pl * 0.5, 0, -Math.cos(an) * pl * 0.5, 0, sd * an, 0, "flosse");
            });
            var bg = (T["legH" + Ls] = grp(root, sd * (W / 4) * y0(0.45), -(D / 2) * y0(0.45) * 0.8, zOf(0.45)));
            var bu = (T["h" + ls + "T"] = grp(bg, 0, 0, 0));
            var bl = Math.max(0.01, d.bauch) * H;
            ell(bu, "fell", bl * 0.25, tf, bl / 2, sd * bl * 0.15, -bl * 0.1, -bl * 0.45, 0, sd * 0.3, 0, "flosse");
        }
    }
    return { teile: T, tailSegs: tailSegs, spineSegs: [], neckSegs: neckSegs, pawOffsets: [0, 0, 0, 0], masse: masse, fellOrt: null };
}
// DIE FARBE: Gegenschattierung (Thayer 1896) — der Rücken dunkel, der Bauch hell, über die Höhe am Leib (0–255, wie fellFarbe)
function luftWasserFarbe(M, x, y, z) {
    var ss = function (a, b, v) {
        var t = Math.max(0, Math.min(1, (v - a) / (b - a)));
        return t * t * (3 - 2 * t);
    };
    var v = ss(-0.3, 0.5, y / Math.max(1e-6, M.hoch));
    var R = M.bauplan === "vogel" ? [92, 70, 48] : [46, 70, 74],
        Bc = M.bauplan === "vogel" ? [196, 184, 160] : [205, 210, 214];
    return [Bc[0] + (R[0] - Bc[0]) * v, Bc[1] + (R[1] - Bc[1]) * v, Bc[2] + (R[2] - Bc[2]) * v];
}

// ════════════════════════ DIE KERN-KOPIE (benannte Ersetzungen) ════════════════════════
const ERSETZUNGEN = [];
function kopie(datei, liste) {
    let src = fs.readFileSync(path.join(REPO, datei), "utf8");
    for (const [name, a, b] of liste) {
        if (src.split(a).length !== 2) throw new Error(`Anker nicht eindeutig (${name}): ${a}`);
        src = src.replace(a, b);
        ERSETZUNGEN.push(`${datei}: ${name}`);
    }
    return src;
}
const tetraSrc = kopie("tetrapoda-core.js", [
    [
        "E1 bauTier verzweigt am Bauplan (dials.bauplan) in die Vorlage Luft/Wasser",
        "    function bauTier(F, dials) {",
        `    ${bauLuftWasser.toString()}\n    ${luftWasserFarbe.toString()}\n    function bauTier(F, dials) {\n        if (dials && dials.bauplan) return bauLuftWasser(F, dials);`,
    ],
    ["E2 fellStreu: ein Leib mit Bauplan trägt kein Haar (Feder/Schuppe fehlen als Gesetz)", "    function fellStreu(P, M, O) {", "    function fellStreu(P, M, O) {\n        if (M && M.bauplan) return [];"],
    ["E3 fellFarbe: ein Leib mit Bauplan liest die Gegenschattierung", "    function fellFarbe(P, M, x, y, z, gelenk) {", "    function fellFarbe(P, M, x, y, z, gelenk) {\n        if (M && M.bauplan) return luftWasserFarbe(M, x, y, z);"],
    ["E4 Export bauLuftWasser", "    root.__tetrapodaCore = {", "    root.__tetrapodaCore = {\n        bauLuftWasser: bauLuftWasser,"],
]);
const foundrySrc = kopie("foundry-core.js", [
    [
        "E6 __tierHaut: ein Primitiv mit userData.__flaeche (Feder, Flosse) gießt nie in die Haut — es bleibt starr an seinem Gelenk wie Ohr und Lid",
        "    const nimmHaut = (n) => fein || !unterKopf(n);",
        "    const nimmHaut = (n) => !n.userData.__flaeche && (fein || !unterKopf(n));",
    ],
    [
        "E7 __tierPrims: ein Haut-Primitiv des Bauplans (userData.__haut) fällt nie unter minVox aus der Haut — es wächst auf minDicke",
        "        if (minHalb < TIER_HAUT.minVox * vox) return;",
        "        if (minHalb < TIER_HAUT.minVox * vox && !(node.userData && node.userData.__haut)) return;",
    ],
    [
        "E5 bakeTierInstance: kein Fell-Schalen-Guss für einen Leib mit Bauplan (die Schale ist Haar-Gesetz)",
        "    if (!fein) {\n        if (typeof kern.fellStreu",
        "    if (!fein && !(B.masse && B.masse.bauplan)) {\n        if (typeof kern.fellStreu",
    ],
]);
const sb = fadenScope(["phyto-core.js", "koerper-core.js"]);
vm.runInContext(tetraSrc, sb, { filename: "tetrapoda-core.kopie.js" });
vm.runInContext(foundrySrc, sb, { filename: "foundry-core.kopie.js" });
const TC = sb.__tetrapodaCore,
    T3 = sb.THREE,
    TH = sb.TIER_HAUT;
log(`# Spike Baupläne Luft und Wasser — Kerne (Kopie) geladen in ${Date.now() - t0} ms`);
for (const e of ERSETZUNGEN) log(`  Ersetzung ${e}`);
const BUDGET = TC.PORTAL_RENDER_CONFIG.lod.budget.kreatur;
log(`  Budget (tetrapoda-core.js:45–46): L0 tris ${BUDGET[0].tris} · Band ${BUDGET[0].band} · Draws ${BUDGET[0].draws} | L1 tris ${BUDGET[1].tris} · Band ${BUDGET[1].band} · Draws ${BUDGET[1].draws}`);

// ════════════════════════ DIE PUNKTE (Literatur — aus dem Gedächtnis, „unsicher“) ════════════════════════
// Vögel: Masse M, Spannweite b, Flügelfläche S (inkl. Rumpf-Abschnitt), Körperlänge Lk. Pennycuick 1982 (Phil Trans B 300:75,
// Albatros), Pennycuick 2008 (Modelling the Flying Bird), Rayner 1988 — alle Zahlen unsicher.
const VOEGEL = {
    Spatz: { Lk: 0.15, M: 0.03, b: 0.23, S: 0.0091, arm: [0.3, 0.55], schwanz: 0.38, schwanzB: 0.07, schnabel: 0.08, kopf: 0.085, bein: 0.16 },
    Adler: { Lk: 0.85, M: 4.5, b: 2.05, S: 0.7, arm: [0.3, 0.58], schwanz: 0.35, schwanzB: 0.09, schnabel: 0.07, kopf: 0.07, bein: 0.18 },
    Albatros: { Lk: 1.15, M: 8.7, b: 3.03, S: 0.611, arm: [0.36, 0.68], schwanz: 0.17, schwanzB: 0.06, schnabel: 0.13, kopf: 0.06, bein: 0.12 },
};
// Fische: Länge L, Schlankheit FR = SL/√(D·W), W/D, Lage des Dicken-Maximums, Schwanzflossen-Spanne h und Streckung AR,
// Flossen-Säume [von, bis, Höhe] als Anteil von SL bzw. L, Literatur-Masse M_lit (Prüfung: Masse aus dem gegossenen Volumen).
// FR: Hering ~7, Thun ~4,2 (Hoerner 1965: Widerstand je Volumen minimal bei FR ≈ 4,5), Aal ~17; caudal AR Thun 6–8 (Magnuson 1978),
// Hering ~3, Aal ~1 (gesäumt) — alles unsicher.
const FISCHE = {
    Hering: { L: 0.3, M: 0.2, SLf: 0.84, FR: 7.0, wd: 0.5, peak: 0.4, voll: 1, pmin: 0.12, caudal: { h: 0.22, AR: 3.0, gabel: 0.5 }, ruecken: [0.4, 0.56, 0.07], after: [0.76, 0.9, 0.04], brust: 0.1, bauch: 0.06 },
    Thun: { L: 2.0, M: 150, SLf: 0.87, FR: 4.2, wd: 0.78, peak: 0.38, voll: 1, pmin: 0.06, caudal: { h: 0.3, AR: 7.5, gabel: 0.35 }, ruecken: [0.3, 0.46, 0.1], after: [0.62, 0.74, 0.06], brust: 0.18, bauch: 0.07 },
    Aal: { L: 0.6, M: 0.35, SLf: 0.97, FR: 17, wd: 0.85, peak: 0.45, voll: 0.35, pmin: 0.25, caudal: { h: 0.06, AR: 1.0, gabel: 1.0 }, ruecken: [0.35, 1.0, 0.025], after: [0.5, 1.0, 0.02], brust: 0.04, bauch: 0 },
};
const RHO_VOGEL = 800; // kg/m³ — Vogel-Leib mit Luftsäcken (unsicher, Band 700–900)
const RUMPF_ANTEIL = 0.8; // gewählt: der Rumpf trägt 80 % des Volumens
const RHO_FISCH = 1050; // kg/m³ (unsicher, Meer 1025–1070)
// DER PUNKT AUS DER PHYSIK (gehört als Funktion in tetrapoda-core: vogelPunkt/fischPunkt; das Erbe/Achsen liefert leben-core)
function vogelPunkt(v, ov) {
    const L = v.Lk,
        a = 0.21; // gewählt: Rumpf = 0,42 Lk
    const Vt = (RUMPF_ANTEIL * v.M) / RHO_VOGEL;
    const r = Math.sqrt(Vt / ((4 / 3) * Math.PI * a * L * 0.9975)) / L; // Rumpf-Radius aus der MASSE
    const s = v.b / 2 / L,
        w = s - 0.75 * r;
    // S(cR) linear in cR: 2·Σ Sehnen der 12 Stationen · dx + Rumpf-Abschnitt 2·0,75 r·cR (Pennycuick zählt ihn mit)
    let sum = 0;
    for (let k = 0; k < 12; k++) {
        const eta = (k + 0.5) / 12;
        sum += Math.sqrt(Math.max(0.06, 1 - eta * eta)) * (w / 12);
    }
    const cR = v.S / (L * L) / (2 * sum + 2 * 0.75 * r);
    return Object.assign({ bauplan: "vogel", a, rT: r, s, cR, arm: v.arm, schwanz: v.schwanz, schwanzB: v.schwanzB, schnabel: v.schnabel, kopf: v.kopf, bein: v.bein, federTc: 0.02 }, ov || {});
}
function fischPunkt(f, ov) {
    const D = f.SLf / (f.FR * Math.sqrt(f.wd));
    return Object.assign(
        { bauplan: "fisch", SL: f.SLf, lc: 1 - f.SLf, D, W: f.wd * D, peak: f.peak, voll: f.voll, pmin: f.pmin, caudal: f.caudal, ruecken: f.ruecken, after: f.after, brust: f.brust, bauch: f.bauch, flosseHaut: 0.006, flosseDuenn: 0.0015 },
        ov || {}
    );
}
// lineare Mischung zweier Punkte (jede Zahl, auch in Arrays/Objekten)
function mischPunkt(A, B, t) {
    const m = (a, b) => (typeof a === "number" ? a + t * (b - a) : Array.isArray(a) ? a.map((x, i) => m(x, b[i])) : a && typeof a === "object" ? Object.fromEntries(Object.keys(a).map((k) => [k, m(a[k], b[k])])) : a);
    return m(A, B);
}

// ════════════════════════ (1) BAU am echten Ofen ════════════════════════
function geschlossen(geo) {
    // Rand-Kanten (eine Kante in genau einem Dreieck) und Zusammenhangs-Komponenten — nach dem Verschweißen gleicher Lagen (die
    // Kugel-Naht der SphereGeometry trägt doppelte Ecken; ohne Schweißen zählte sie als Rand)
    const pa = geo.attributes.position;
    const key = new Map(),
        canon = new Int32Array(pa.count);
    for (let i = 0; i < pa.count; i++) {
        const k = `${Math.round(pa.getX(i) * 1e5)},${Math.round(pa.getY(i) * 1e5)},${Math.round(pa.getZ(i) * 1e5)}`;
        if (!key.has(k)) key.set(k, i);
        canon[i] = key.get(k);
    }
    const ix = Array.from(geo.index.array, (i) => canon[i]),
        kant = new Map();
    const n = pa.count;
    const par = new Int32Array(n).map((_, i) => i);
    const fnd = (i) => (par[i] === i ? i : (par[i] = fnd(par[i])));
    for (let t = 0; t < ix.length; t += 3)
        for (let e = 0; e < 3; e++) {
            if (ix[t] === ix[t + 1] || ix[t + 1] === ix[t + 2] || ix[t] === ix[t + 2]) break;
            const a = ix[t + e],
                b = ix[t + ((e + 1) % 3)];
            const k = a < b ? a * n + b : b * n + a;
            kant.set(k, (kant.get(k) || 0) + 1);
            par[fnd(a)] = fnd(b);
        }
    let rand = 0;
    for (const c of kant.values()) if (c === 1) rand++;
    // degenerierte Dreiecke (zwei gleiche Ecken nach dem Schweißen: die Pole der Kugel) tragen keine Kante
    const komp = new Set();
    for (let t = 0; t < ix.length; t++) komp.add(fnd(ix[t]));
    return { rand, komp: komp.size };
}
function guss(punkt, lod) {
    const t = Date.now();
    const g = sb.BAKERS_BY_KIND.kreatur(TC, "wolf", 0, lod, punkt);
    const st = { ms: Date.now() - t, tris: 0, meshes: 0, haut: null, hautTris: 0, starrFell: 0, starrTris: 0, geos: [] };
    g.updateMatrixWorld(true);
    g.traverse((o) => {
        if (!o.isMesh) return;
        st.meshes++;
        const ixn = o.geometry.index ? o.geometry.index.count : o.geometry.attributes.position.count;
        st.tris += ixn / 3;
        st.geos.push(o);
        const k = o.material.userData.__klasse;
        if (k === "fell" && o.geometry.attributes.skinWeight && o.geometry.attributes.position.count > 500 && !st.haut) {
            st.haut = o;
            st.hautTris = ixn / 3;
        }
    });
    return { g, st };
}
// die Primitive des Baums vor dem Guss: wie viele Fell-Kugeln trägt die Haut, wie viele fallen unter minVox heraus (Stufe 1 / 0)
function primZahl(punkt, fein) {
    const F = grobFabrik();
    const B = TC.bauTier(F, punkt);
    const root = B.teile.wolf;
    root.updateMatrixWorld(true);
    let fell = 0;
    root.traverse((o) => o.isMesh && o.material.userData.__klasse === "fell" && fell++);
    // die Rasterweite des echten Gusses (die Haut kostet ihr Ziel: die Weite wächst, bis die Dreiecke halten, foundry-core.js:8435–8442)
    let vox = (fein ? TH.voxFern : TH.voxNah) * H_BAU;
    const nimm = (n) => !n.userData.__flaeche;
    let P = sb.__tierPrims(root, root, nimm, vox, TH.blend * H_BAU, () => "wolf");
    const feld = sb.__tierFeld(P, vox, TH.blend * H_BAU);
    const dr = 2 * sb.__tierKanten(feld.f, feld.nx, feld.ny, feld.nz);
    const ziel = fein ? TH.dreieckeFern : TH.dreieckeNah;
    if (dr > ziel) {
        for (const p of P) p.node.userData.__nichtGiessen = false;
        vox *= Math.sqrt(dr / ziel);
        P = sb.__tierPrims(root, root, nimm, vox, TH.blend * H_BAU, () => "wolf");
    }
    let station = 0,
        stationHaut = 0;
    root.traverse((o) => o.isMesh && o.userData.__station && station++);
    for (const p of P) if (p.node.userData.__station) stationHaut++;
    return { fell, inHaut: P.length, vox, station, stationHaut };
}
function grobFabrik() {
    const mat = {};
    const M = (k) => mat[k] || (mat[k] = Object.assign(new T3.MeshBasicMaterial(), { userData: { __klasse: k } }));
    return {
        gruppe: () => new T3.Group(),
        kugel: (r, k, sc) => {
            const m = new T3.Mesh(new T3.SphereGeometry(r, 4, 3), M(k));
            if (sc) m.scale.set(sc[0], sc[1], sc[2]);
            return m;
        },
        zylinder: (rt, rb, h, k) => new T3.Mesh(new T3.CylinderGeometry(rt, rb, h, 4, 1), M(k)),
        kugelFein: (r, k) => new T3.Mesh(new T3.SphereGeometry(r, 4, 3), M(k)),
        v3: (x, y, z) => new T3.Vector3(x, y, z),
        richte: (node, dir) => node.quaternion.setFromUnitVectors(new T3.Vector3(0, 1, 0), dir.clone().normalize()),
        fellSchweif: () => {},
    };
}
// Projektion aller Dreiecke (Stufe 1: alles im Wurzel-Raum, foundry-core.js:9211–9212) auf eine Ebene, gerastert
function projektion(geos, ax0, ax1, zelle, filter) {
    const belegt = new Set();
    projektion.zellen = new Map();
    const p = [new T3.Vector3(), new T3.Vector3(), new T3.Vector3()];
    for (const o of geos) {
        const pa = o.geometry.attributes.position,
            ix = o.geometry.index ? o.geometry.index.array : null;
        const n = ix ? ix.length : pa.count;
        for (let t = 0; t < n; t += 3) {
            for (let e = 0; e < 3; e++) p[e].fromBufferAttribute(pa, ix ? ix[t + e] : t + e).applyMatrix4(o.matrixWorld);
            const A = p.map((v) => [v.getComponent(ax0), v.getComponent(ax1)]);
            const lo0 = Math.floor(Math.min(A[0][0], A[1][0], A[2][0]) / zelle),
                hi0 = Math.floor(Math.max(A[0][0], A[1][0], A[2][0]) / zelle),
                lo1 = Math.floor(Math.min(A[0][1], A[1][1], A[2][1]) / zelle),
                hi1 = Math.floor(Math.max(A[0][1], A[1][1], A[2][1]) / zelle);
            const den = (A[1][1] - A[2][1]) * (A[0][0] - A[2][0]) + (A[2][0] - A[1][0]) * (A[0][1] - A[2][1]);
            if (Math.abs(den) < 1e-14) continue;
            for (let i = lo0; i <= hi0; i++)
                for (let j = lo1; j <= hi1; j++) {
                    const x = (i + 0.5) * zelle,
                        y = (j + 0.5) * zelle;
                    const l1 = ((A[1][1] - A[2][1]) * (x - A[2][0]) + (A[2][0] - A[1][0]) * (y - A[2][1])) / den;
                    const l2 = ((A[2][1] - A[0][1]) * (x - A[2][0]) + (A[0][0] - A[2][0]) * (y - A[2][1])) / den;
                    if (l1 < 0 || l2 < 0 || l1 + l2 > 1) continue;
                    if (filter && !filter(x, y)) continue;
                    belegt.add(i * 100003 + j);
                    (projektion.zellen || (projektion.zellen = new Map())).set(i * 100003 + j, [i, j]);
                }
        }
    }
    return belegt.size * zelle * zelle;
}
function ausdehnung(geos, filterVert) {
    const lo = [1e9, 1e9, 1e9],
        hi = [-1e9, -1e9, -1e9];
    const v = new T3.Vector3();
    for (const o of geos) {
        const pa = o.geometry.attributes.position;
        for (let i = 0; i < pa.count; i++) {
            v.fromBufferAttribute(pa, i).applyMatrix4(o.matrixWorld);
            if (filterVert && !filterVert(v)) continue;
            for (let d = 0; d < 3; d++) {
                lo[d] = Math.min(lo[d], v.getComponent(d));
                hi[d] = Math.max(hi[d], v.getComponent(d));
            }
        }
    }
    return { lo, hi, d: [hi[0] - lo[0], hi[1] - lo[1], hi[2] - lo[2]] };
}
// das Volumen einer geschlossenen Haut (Divergenz-Satz)
function volumen(o) {
    const pa = o.geometry.attributes.position,
        ix = o.geometry.index.array;
    let V = 0;
    const a = new T3.Vector3(),
        b = new T3.Vector3(),
        c = new T3.Vector3();
    for (let t = 0; t < ix.length; t += 3) {
        a.fromBufferAttribute(pa, ix[t]).applyMatrix4(o.matrixWorld);
        b.fromBufferAttribute(pa, ix[t + 1]).applyMatrix4(o.matrixWorld);
        c.fromBufferAttribute(pa, ix[t + 2]).applyMatrix4(o.matrixWorld);
        V += a.dot(b.clone().cross(c)) / 6;
    }
    return Math.abs(V);
}

log("\n## (1) BAU — der echte Ofen (bakeTierInstance) gießt die Vorlage; Tris gegen das Budget, Haut geschlossen?");
const ERG = { bau: {} };
// zwei Fassungen je Art: HAUT = Flügel/Flossen als Fell-Ellipsoide mit Arm-/Basis-Dicke, die Haut nimmt, was über minVox liegt;
// FLÄCHE = dieselben Stationen mit wahrer Dicke (Schwungfeder 2 % der Sehne, Flossen-Haut 0,15 % L), markiert __flaeche (E6)
const FAELLE = [];
for (const [n, v] of Object.entries(VOEGEL)) for (const fl of [false, true]) FAELLE.push({ n, medium: "Luft", art: v, punkt: vogelPunkt(v, { flaeche: fl }), fl, Lk: v.Lk });
for (const [n, f] of Object.entries(FISCHE)) for (const fl of [false, true]) FAELLE.push({ n, medium: "Wasser", art: f, punkt: fischPunkt(f, { flaeche: fl }), fl, Lk: f.L });
const vn = (F) => (F.fl ? "Fläche" : "Haut  ");
for (const F of FAELLE) {
    const z = {};
    for (const lod of [0, 1]) {
        const { g, st } = guss(F.punkt, lod);
        const gz = st.haut ? geschlossen(st.haut.geometry) : { rand: -1, komp: 0 };
        z[lod] = { st, gz, g };
    }
    const p1 = primZahl(F.punkt, true),
        p0 = primZahl(F.punkt, false);
    F.guss = z;
    F.prim = { p0, p1 };
    const ok0 = z[0].st.tris <= BUDGET[0].tris,
        ok1 = z[1].st.tris <= BUDGET[1].tris;
    log(
        `  ${F.n.padEnd(8)} ${vn(F)} L0 ${String(Math.round(z[0].st.tris)).padStart(6)} tris (${ok0 ? "≤" : ">"} ${BUDGET[0].tris}, Band ${z[0].st.tris <= BUDGET[0].band ? "≤" : ">"} ${BUDGET[0].band}) · Haut ${Math.round(z[0].st.hautTris)} Rand ${z[0].gz.rand} Komp ${z[0].gz.komp} · ${z[0].st.ms} ms` +
            ` | L1 ${String(Math.round(z[1].st.tris)).padStart(5)} tris (${ok1 ? "≤" : ">"} ${BUDGET[1].tris}, Band ${z[1].st.tris <= BUDGET[1].band ? "≤" : ">"} ${BUDGET[1].band}) · Fell-Eimer Rand ${z[1].gz.rand} Komp ${z[1].gz.komp} · ${z[1].st.ms} ms` +
            ` | Flügel-/Flossen-Stationen ${p0.station}: in der Haut L0 ${p0.stationHaut} · L1 ${p1.stationHaut} (Raster L0 ${f1((p0.vox / H_BAU) * F.Lk * 1000)} mm, L1 ${f1((p1.vox / H_BAU) * F.Lk * 1000)} mm; minVox-Grenze L1 Halbdicke ${f1(((TH.minVox * p1.vox) / H_BAU) * F.Lk * 1000)} mm)`
    );
}

// Dicke/Sehne am gegossenen Flügel (Stufe 1, Wurzel-Raum) und Silhouetten-Maße
log("\n### Flügel und Flosse am Guss (Stufe 1, alles im Wurzel-Raum): BAU-TREUE gegen die Eingabe — tautologisch bis auf die markierten Zahlen");
for (const F of FAELLE) {
    const st = F.guss[1].st;
    const H = H_BAU,
        Lk = F.Lk;
    const m = (u) => (u / H) * Lk * 1000; // mm bei der wahren Größe
    if (F.medium === "Luft") {
        const p = F.punkt;
        const xsh = 0.75 * p.rT * H,
            w = p.s * H - xsh,
            zSchwanz = -0.8 * p.a * H;
        const dick = (eta) => ausdehnung(st.geos, (v) => Math.abs(v.x - (xsh + eta * w)) < 0.012 * H && v.z > zSchwanz);
        const span = ausdehnung(st.geos).d[0];
        const Sfl = projektion(st.geos, 0, 2, H / 300, (x, z) => Math.abs(x) >= xsh && z > zSchwanz);
        const zellenW = projektion.zellen;
        const cRoot = dick(0.02).d[2];
        // LÖCHER im Umriss: je Spann-Streifen (48 über die Fläche, beide Seiten) die bedeckte Sehne gegen die Sehne der Eingabe
        const zell = H / 300;
        const streifen = Array.from({ length: 48 }, () => new Set());
        for (const [i, j] of zellenW.values()) {
            const eta = (Math.abs((i + 0.5) * zell) - xsh) / w;
            if (eta < 0 || eta >= 1) continue;
            streifen[Math.floor(eta * 48)].add(j * (i < 0 ? -1 : 1));
        }
        let minAnteil = 1e9,
            minEta = 0;
        streifen.forEach((st2, k) => {
            const eta = (k + 0.5) / 48;
            if (eta > 0.94) return; // die Spitze: die Eingabe-Sehne klemmt auf √0,06
            const soll = 2 * p.cR * H * Math.sqrt(Math.max(0.06, 1 - eta * eta));
            const ist = st2.size * zell;
            if (ist / soll < minAnteil) ((minAnteil = ist / soll), (minEta = eta));
        });
        const S = Sfl + 2 * xsh * cRoot;
        const arm = dick(0.3),
            hand = dick(0.75);
        const istB = (span / H) * Lk,
            istS = S * (Lk / H) ** 2;
        const AR = (istB * istB) / istS;
        // das Vieleck der Kugel am Umriss: SphereGeometry(r, w, h) zeigt die flache Station als w-Eck — Flächen-Anteil (w/2π)·sin(2π/w)
        const raster = (fein) => {
            const B = TC.bauTier(grobFabrik(), p);
            let su = 0,
                n = 0;
            B.teile.wolf.traverse((o) => {
                if (!o.isMesh || o.userData.__station !== "fluegel") return;
                const r = o.geometry.parameters.radius;
                const [ws] = sb.__kugelRaster(r, [o.scale.x, o.scale.y, o.scale.z], H, fein ? 8 : 20, fein ? 6 : 14, fein ? 5 : 8, fein ? 4 : 6);
                su += (ws / (2 * Math.PI)) * Math.sin((2 * Math.PI) / ws);
                n++;
            });
            return su / n;
        };
        F.mass = { b: istB, S: istS, AR };
        log(
            `  ${F.n.padEnd(8)} ${vn(F)} Spannweite ${f2(istB)} m (${f1((100 * (istB - F.art.b)) / F.art.b)} %) · Fläche ${istS.toFixed(4)} m² (${f1((100 * (istS - F.art.S)) / F.art.S)} %) · Streckung ${f1(AR)} (Eingabe ${f1(F.art.b ** 2 / F.art.S)})` +
                ` · bedeckte Sehne min ×${f2(minAnteil)} bei η ${f2(minEta)}` +
                ` · Umriss-Anteil des Kugel-Vielecks L0 ${f2(raster(false))} / L1 ${f2(raster(true))}` +
                ` | Dicke/Sehne Arm η0,3 ${f3(arm.d[1] / arm.d[2])} (Eingabe ${f3(0.11 - 0.07 * 0.3)}; ${f1(m(arm.d[1]))} mm) · Hand η0,75 ${f3(hand.d[1] / hand.d[2])} (Eingabe ${F.fl ? f3(0.02) : f3(0.11 - 0.07 * 0.75)}; ${f1(m(hand.d[1]))} mm bei Sehne ${f1(m(hand.d[2]))} mm)`
        );
    } else {
        const p = F.punkt;
        const Ltot = (ausdehnung(st.geos).d[2] / H) * Lk;
        // Schlankheit am Guss: je Scheibe Δz Breite (x) und Höhe (y) der Fell-Ecken, ohne die Ecken der Flossen-Fläche (|x| ≤ 1,5·tf in
        // der Mittel-Ebene; die Brustflossen liegen außerhalb der Stiel-Scheiben, aber in der Breite — darum Breite nur aus Ecken mit
        // |y| < 0,3·Höhe der Scheibe)
        const tfx = (F.fl ? p.flosseDuenn : p.flosseHaut) * H;
        const SLz = p.SL * H,
            zSn = SLz / 2,
            bins = 60,
            bw = SLz / bins;
        const Wb = new Float64Array(bins),
            Dlo = new Float64Array(bins).fill(1e9),
            Dhi = new Float64Array(bins).fill(-1e9);
        const v = new T3.Vector3();
        const ecken = [];
        // die reine Haut der Stufe 0 (Wurzel-Raum, Identität; ohne Kopf-Haut und ohne jedes starre Primitiv — die Flossen liegen nie darin)
        {
            const o = F.guss[0].st.haut;
            const pa = o.geometry.attributes.position;
            for (let i = 0; i < pa.count; i++) ecken.push(v.fromBufferAttribute(pa, i).applyMatrix4(o.matrixWorld).clone());
        }
        for (const q of ecken) {
            const b = Math.floor((zSn - q.z) / bw);
            if (b < 0 || b >= bins || Math.abs(q.x) <= 1.5 * tfx) continue;
            Dlo[b] = Math.min(Dlo[b], q.y);
            Dhi[b] = Math.max(Dhi[b], q.y);
        }
        for (const q of ecken) {
            const b = Math.floor((zSn - q.z) / bw);
            if (b < 0 || b >= bins || !(Dhi[b] > Dlo[b])) continue;
            const mid = (Dhi[b] + Dlo[b]) / 2;
            if (Math.abs(q.y - mid) < 0.3 * (Dhi[b] - Dlo[b])) Wb[b] = Math.max(Wb[b], 2 * Math.abs(q.x));
        }
        let Wm = 0,
            Dm = 0;
        for (let b = 0; b < bins; b++) {
            Wm = Math.max(Wm, Wb[b]);
            if (Dhi[b] > Dlo[b]) Dm = Math.max(Dm, Dhi[b] - Dlo[b]);
        }
        const FR = SLz / Math.sqrt(Wm * Dm);
        const zSt = -SLz / 2;
        const Sc = projektion(st.geos, 1, 2, H / 300, (y, z) => z < zSt);
        const ec = ausdehnung(st.geos, (q) => q.z < zSt);
        const ARc = (ec.d[1] * ec.d[1]) / Sc;
        // Masse aus dem Volumen des Fell-Eimers der Stufe 1 (Haut samt Kopf; in der Fassung FLÄCHE ohne Flossen-Aufdickung)
        const V1 = volumen(st.haut) * (Lk / H) ** 3;
        F.mass = { FR, ARc, M: V1 * RHO_FISCH, Ltot };
        log(
            `  ${F.n.padEnd(8)} ${vn(F)} Länge ${f2(Ltot)} m · Schlankheit am Guss ${f1(FR)} (Eingabe ${F.art.FR}, ${f1((100 * (FR - F.art.FR)) / F.art.FR)} %) · Schwanzflosse Spanne ${f1(m(ec.d[1]))} mm, AR ${f1(ARc)} (Eingabe ${F.art.caudal.AR})` +
                ` · MASSE aus dem Volumen ${f2(F.mass.M)} kg gegen Literatur ${F.art.M} kg (×${f2(F.mass.M / F.art.M)}) ← nicht tautologisch`
        );
    }
}

// ════════════════════════ (2) PHYSIK gegen Literatur (nicht tautologisch) ════════════════════════
log("\n## (2) PHYSIK — was die Masse allein trägt und was eine zweite Achse braucht");
{
    log("### Vögel: Rayner 1988 (alle Vögel; b = 1,17·M^0,39, S = 0,16·M^0,72 — unsicher) und Isometrie ab dem Spatz (b ∝ M^⅓, S ∝ M^⅔)");
    const sp = VOEGEL.Spatz;
    for (const [n, v] of Object.entries(VOEGEL)) {
        const bR = 1.17 * v.M ** 0.39,
            SR = 0.16 * v.M ** 0.72;
        const k = (v.M / sp.M) ** (1 / 3);
        const bI = sp.b * k,
            SI = sp.S * k * k;
        const Q = (v.M * 9.81) / v.S,
            QI = (sp.M * 9.81) / sp.S * k;
        log(
            `  ${n.padEnd(8)} M ${v.M} kg · Lit b ${v.b} m, S ${v.S} m², AR ${f1(v.b ** 2 / v.S)}, Flächenlast ${f1(Q)} N/m²` +
                ` | Rayner b ${f2(bR)} (${f1((100 * (bR - v.b)) / v.b)} %), S ${SR.toFixed(4)} (${f1((100 * (SR - v.S)) / v.S)} %) | Isometrie b ${f2(bI)} (${f1((100 * (bI - v.b)) / v.b)} %), S ${SI.toFixed(4)} (${f1((100 * (SI - v.S)) / v.S)} %), Flächenlast ∝ M^⅓ ${f1(QI)} (${f1((100 * (QI - Q)) / Q)} %)`
        );
    }
    log("  → Spatz und Adler AR ≈ 6, Albatros 15: die Streckung folgt der LEBENSWEISE (Segeln über dem Meer), nicht der Masse — die Vorlage braucht ≥ 2 Achsen (ln M, Streckung).");
    log("### Fische: Widerstand je Volumen minimal bei FR ≈ 4,5 (Hoerner 1965, unsicher) — die Masse aus dem Guss gegen die Literatur prüft die Form");
    for (const [n, f] of Object.entries(FISCHE)) {
        const G = FAELLE.find((x) => x.n === n && x.fl);
        log(`  ${n.padEnd(8)} FR ${f.FR} (Abstand zum Optimum ${f1(f.FR - 4.5)}) · Schwimmweise ${n === "Thun" ? "thunniform" : n === "Aal" ? "anguilliform" : "subcarangiform"} · Masse aus dem Guss ${f2(G.mass.M)} kg gegen Literatur ${f.M} kg (×${f2(G.mass.M / f.M)})`);
    }
    log("  → nur der Thun liegt am Widerstands-Optimum; Hering und Aal weichen nach ihrer Schwimmweise ab: Schlankheit ist eine eigene Achse, die Masse setzt sie nicht.");
}

// ════════════════════════ (3) MISCHUNG — Formziele am Refit (Weg des Leib-Raums) ════════════════════════
log("\n## (3) MISCHUNG — lineare Formziele zwischen den Punkten gegen den echten Refit (Stufe-1-Raster, Rahmen mit Radius wie R1)");
const surfaceNets = sb.__koerperCore.surfaceNets;
function baum(punkt) {
    const B = TC.bauTier(grobFabrik(), punkt);
    const root = B.teile.wolf;
    root.updateMatrixWorld(true);
    const nodeName = new Map();
    for (const [k, n] of Object.entries(B.teile)) nodeName.set(n, k);
    B.tailSegs.forEach((s, i) => nodeName.set(s, "tailSeg" + i));
    const gelenkVon = (n) => {
        for (let c = n; c; c = c.parent) if (nodeName.has(c)) return nodeName.get(c);
        return "wolf";
    };
    return { B, root, gelenkVon, H: B.masse.H };
}
function prims(b) {
    let vox = TH.voxFern * b.H;
    const blend = TH.blend * b.H;
    let P = sb.__tierPrims(b.root, b.root, (n) => !n.userData.__flaeche, vox, blend, b.gelenkVon);
    let feld = sb.__tierFeld(P, vox, blend);
    const dr = 2 * sb.__tierKanten(feld.f, feld.nx, feld.ny, feld.nz);
    if (dr > TH.dreieckeFern) {
        for (const p of P) p.node.userData.__nichtGiessen = false;
        vox *= Math.sqrt(dr / TH.dreieckeFern);
        P = sb.__tierPrims(b.root, b.root, (n) => !n.userData.__flaeche, vox, blend, b.gelenkVon);
        feld = sb.__tierFeld(P, vox, blend);
    }
    for (const p of P) {
        p.blend = blend;
        const M = Float64Array.from(p.Mi);
        for (let col = 0; col < 4; col++) for (let row = 0; row < 3; row++) M[col * 4 + row] /= p.r;
        p.Mi = M;
        p.r = 1;
    }
    return { P, vox, blend, feld };
}
function kennungen(b, pr) {
    const platz = new Map();
    let i = 0;
    b.root.traverse((o) => platz.set(o, i++));
    for (const p of pr.P) p.ti = platz.get(p.node);
}
function vorlage(punkt) {
    const b = baum(punkt);
    const pr = prims(b);
    kennungen(b, pr);
    const Fd = pr.feld;
    const sn = surfaceNets(Fd.f, Fd.nx, Fd.ny, Fd.nz, 0, Fd.lo[0], Fd.lo[1], Fd.lo[2], pr.vox);
    const vs = sn.verts.filter((_, i) => i % 3 === 0);
    const V = new Float64Array(vs.length * 3);
    vs.forEach((v, i) => V.set(v, i * 3));
    return { b, pr, V, n: vs.length };
}
function refit(Tv, punkt) {
    const b = baum(punkt);
    const pr = prims(b);
    kennungen(b, pr);
    const t1 = new Set(pr.P.map((p) => p.ti)),
        t0s = new Set(Tv.pr.P.map((p) => p.ti));
    const fehlt = Tv.pr.P.filter((p) => !t1.has(p.ti)).length,
        neu = pr.P.filter((p) => !t0s.has(p.ti)).length;
    const W = sb.__leibRaumRefit(Tv.V, Tv.pr.P, pr.P, pr.vox);
    return { N: W.map((x) => x / b.H), b, pr, fehlt, neu };
}
function flaechenAbstand(X, ziel) {
    const H = ziel.b.H,
        out = new Float64Array(X.length / 3);
    for (let i = 0; i < out.length; i++) out[i] = Math.abs(sb.__leibRaumFeld(ziel.pr.P, ziel.pr.vox, X[i * 3] * H, X[i * 3 + 1] * H, X[i * 3 + 2] * H));
    return out;
}
function stat(arr) {
    const a = Float64Array.from(arr).sort();
    return { p50: a[Math.floor(a.length * 0.5)], p95: a[Math.floor(a.length * 0.95)], max: a[a.length - 1] };
}
// die dünnen Primitive (außerhalb der Haut): ihre Fläche ist affin — Mischung der Matrizen gegen den Bau am Mittelpunkt
function duennePunkte(punkt) {
    const b = baum(punkt);
    const vox = TH.voxFern * b.H;
    const out = [];
    const dirs = [];
    for (let i = 0; i < 26; i++) {
        const th = Math.acos(1 - (2 * (i + 0.5)) / 26),
            ph = i * 2.399963;
        dirs.push(new T3.Vector3(Math.sin(th) * Math.cos(ph), Math.cos(th), Math.sin(th) * Math.sin(ph)));
    }
    b.root.traverse((o) => {
        if (!o.isMesh || o.material.userData.__klasse !== "fell") return;
        const r = o.geometry.parameters.radius;
        const minHalb = r * Math.min(o.scale.x, o.scale.y, o.scale.z);
        if (punkt.flaeche ? !o.userData.__flaeche : minHalb >= TH.minVox * vox) return;
        for (const d of dirs) out.push(d.clone().multiplyScalar(r).applyMatrix4(o.matrixWorld).divideScalar(b.H));
    });
    return out;
}
const PAARE = [
    ["Luft", "Spatz", "Adler"],
    ["Luft", "Adler", "Albatros"],
    ["Wasser", "Hering", "Thun"],
    ["Wasser", "Thun", "Aal"],
];
ERG.misch = [];
for (const [med, a, b2] of PAARE) {
    const src = med === "Luft" ? VOEGEL : FISCHE;
    const pk = med === "Luft" ? vogelPunkt : fischPunkt;
    for (const duenn of [false, true]) {
        const PA = pk(src[a], { flaeche: duenn }),
            PB = pk(src[b2], { flaeche: duenn });
        const Lm = Math.sqrt((src[a].Lk || src[a].L) * (src[b2].Lk || src[b2].L)); // die Länge am Mittelpunkt (geometrisch)
        const mmU = (u) => u * Lm * 1000; // normierte Einheit (/H) → mm bei der Mittel-Länge
        const tv = Date.now();
        const VA = vorlage(PA);
        const N0 = refit(VA, PA).N;
        const RB = refit(VA, PB),
            RM = refit(VA, mischPunkt(PA, PB, 0.5));
        const lin = N0.map((x, i) => x + 0.5 * (RB.N[i] - x));
        const fa = stat(Array.from(flaechenAbstand(lin, RM), (u) => mmU(u / RM.b.H)));
        const zielB = stat(Array.from(flaechenAbstand(RB.N, RB), (u) => mmU(u / RB.b.H)));
        // dünne Primitive
        const dA = duennePunkte(PA),
            dB = duennePunkte(PB),
            dM = duennePunkte(mischPunkt(PA, PB, 0.5));
        let dz = "keine";
        if (dA.length && dA.length === dB.length && dA.length === dM.length) {
            const e = dA.map((p, i) => mmU(p.clone().add(dB[i]).multiplyScalar(0.5).distanceTo(dM[i])));
            const s = stat(e);
            dz = `${dA.length / 26} Primitive · p95 ${f1(s.p95)} / max ${f1(s.max)} mm`;
        } else if (dA.length || dB.length || dM.length) dz = `Zahl springt (${dA.length / 26} / ${dM.length / 26} / ${dB.length / 26}) — kein fester Satz`;
        ERG.misch.push({ med, a, b: b2, duenn, fa, dz });
        log(
            `  ${(a + " ↔ " + b2).padEnd(18)} ${duenn ? "Fläche" : "Haut  "} Haut-Refit t=½: linear → Fläche p50 ${f1(fa.p50)} · p95 ${f1(fa.p95)} · max ${f1(fa.max)} mm (bei Länge ${f2(Lm)} m; ${VA.n} Ecken, ${VA.pr.P.length} Primitive in der Haut, Partner fehlt ${RM.fehlt}/${RB.fehlt}, neu ${RM.neu}/${RB.neu})` +
                ` · Refit am Ziel → Fläche p95 ${f1(zielB.p95)} mm · dünne Primitive (affin gemischt): ${dz} · ${Date.now() - tv} ms`
        );
    }
}

// ════════════════════════ (4) BEWEGUNG ════════════════════════
log("\n## (4) BEWEGUNG — Schlag-Gesetz und die Leser im Kern");
{
    const g = 9.81,
        rho = 1.23;
    // Pennycuick 1996/2001 (J Exp Biol 199:1613): f = M^⅜ · g^½ · b^(−23/24) · S^(−⅓) · ρ^(−⅜) — unsicher (Gedächtnis)
    const fP = (M, b, S) => M ** 0.375 * g ** 0.5 * b ** (-23 / 24) * S ** (-1 / 3) * rho ** -0.375;
    const beob = { Spatz: "~13–16 Hz", Adler: "~2,5–3,5 Hz", Albatros: "~2–3 Hz (meist Segeln)" }; // unsicher
    for (const [n, v] of Object.entries(VOEGEL)) log(`  ${n.padEnd(8)} Pennycuick f ${f1(fP(v.M, v.b, v.S))} Hz (beobachtet ${beob[n]}, unsicher) · isometrisch ∝ M^−⅙ (Pennycuick) bzw. ∝ M^−⅓ (Hill, Gang): Spatz→Adler ×${f2((4.5 / 0.03) ** (-1 / 6))} bzw. ×${f2((4.5 / 0.03) ** (-1 / 3))}`);
    const VL = TC.VOGEL_GESETZ.leib;
    const SAm = 2 * 0.5 * VL.fluegel.groesse[0] * VL.fluegel.groesse[2] + 0.06 * 0.16;
    log(`  Kern heute: VOGEL_GESETZ.leib.schlagHz ${VL.schlagHz} für JEDEN Vogel (Amsel-Leib 0,32 m Spanne) — Pennycuick für Amsel (M 0,1 kg unsicher, b 0,32, S ${SAm.toFixed(4)} aus den Keilen) ${f1(fP(0.1, 0.32, SAm))} Hz`);
    const FG = TC.FISCH_GESETZ;
    const St = 0.3; // Taylor, Nudds & Thomas 2003 (Nature 425:707): 0,2–0,4 — gewählt die Mitte
    const fS = (U, L) => (St * U) / (0.2 * L); // Amplitude Spitze-Spitze 0,2·L (Bainbridge 1958, unsicher)
    log(`  Fisch: f = St·U/A, St ${St}, A 0,2 L → Bachforelle des Kerns (0,3 m, tempoMs ${FG.tempoMs}) ${f1(fS(FG.tempoMs, 0.3))} Hz gegen FISCH_GESETZ.schlagHz ${FG.schlagHz} (starrer Leib, schlagRad ${FG.schlagRad})`);
    for (const [n, f] of Object.entries(FISCHE)) {
        const U = { Hering: 1.0, Thun: 1.0, Aal: 0.5 }[n] * f.L; // Reise-Tempo in Körperlängen/s — unsicher
        log(`  ${n.padEnd(8)} Reise ${f2(U)} m/s → Schwanzschlag ${f2(fS(U, f.L))} Hz · Wellenlänge der Körperwelle ${n === "Aal" ? "~0,6 L (anguilliform)" : "~1,0 L (carangiform)"} (unsicher)`);
    }
    // die Leser, live gegrept
    const zeile = (datei, needle) => {
        const L = fs.readFileSync(path.join(REPO, datei), "utf8").split("\n");
        const i = L.findIndex((l) => l.includes(needle));
        return i < 0 ? `${datei}: NICHT GEFUNDEN „${needle}“` : `${datei}:${i + 1}`;
    };
    log("  Leser (Datei:Zeile, live):");
    log(`    Körperwelle trägt schon: ${zeile("tetrapoda-core.js", "ts[iS].rotation.y = Math.sin(t * tRate - iS * 0.5) * amp")} — rotation.y der Rute als laufende Welle, Phase 0,5 rad je Glied, Amplitude KONSTANT (P.tailAmp), Takt P.tailRate (MOTION-Profil)`);
    log(`    die Bein-Kette erzwingt Boden: ${zeile("tetrapoda-core.js", "var folge = zust === \"schwimmen\" ? core.GANG_FOLGE.paddeln : gs.folge;")} (vier Bein-Ketten, Pfoten-IK auf dem Boden des Wirts; kein Zweig „fliegen“/„tauchen“)`);
    log(`    Flügelschlag nur am Oktaeder: ${zeile("stamm/kreatur-fauna.js", "const cf = Math.cos(seite * v.schlag);")} ← ${zeile("tetrapoda-core.js", "out.schlag = V.leib.schlagRad * Math.sin(")}`);
    log(`    Fisch-Schlag nur als Gier des starren Leibs: ${zeile("tetrapoda-core.js", "return f.gier + F.schlagRad * (eilt ? 2 : 1)")}`);
    log(`    der Satz backt Bänder der GANG_FOLGE: ${zeile("stamm/kreatur-leben.js", "baender: Object.freeze([\"schritt\", \"trab\", \"galopp\"])")} an Froude ${zeile("stamm/kreatur-leben.js", "froude: Object.freeze([0.25, 1.5, 4])")}`);
}

// ════════════════════════ (5) PREIS ════════════════════════
log("\n## (5) PREIS — je Individuum im Schwarm (10³ Vögel, 10⁴ Fische im Schirm)");
{
    const JOINTS = {};
    for (const F of FAELLE.filter((x) => x.fl)) {
        const sk = F.guss[1].g.userData.__skelett || {};
        JOINTS[F.medium] = Math.max(JOINTS[F.medium] || 0, (sk.skinJoints || []).length || 0);
    }
    const stoffGang = fs.readFileSync(path.join(REPO, "stamm/stoff-gang.js"), "utf8");
    const hatBytes = stoffGang.includes("bytes: 3 * J * (B * N + H) * 16");
    for (const med of ["Luft", "Wasser"]) {
        const J = JOINTS[med] || (med === "Luft" ? 18 : 20);
        const B = 2,
            N = 32;
        log(`  ${med}: Gelenke der Haut ${J} · Pose-Tafel je Gestalt 3·J·(B·N+1)·16 = ${(3 * J * (B * N + 1) * 16 / 1024).toFixed(0)} KiB (B = 2 Bänder gewählt: Schlag/Gleiten bzw. Reise/Flucht; Formel stoff-gang.js ${hatBytes ? "gefunden" : "NICHT gefunden"})`);
    }
    const ACH = 8; // gewählt: ln M + 4 Medien-Achsen + 3 Erb-Achsen → 2 RGBA-Texel (wie der Leib-Raum-Spike)
    const floats = 16 + 4 + ACH;
    log(`  je Individuum: instanceMatrix 16 + aGang 4 (stoff-gang.js:199–200) + Raum-Punkt ${ACH} = ${floats} Floats = ${floats * 4} B → 10³ Vögel ${(floats * 4 * 1e3 / 1024).toFixed(0)} KiB · 10⁴ Fische ${(floats * 4 * 1e4 / 1048576).toFixed(2)} MiB; bewegt sich jedes je Bild: ×60 /s = ${((floats * 4 * 1e4 * 60) / 1048576).toFixed(0)} MiB/s Upload`);
    // Tris im Schirm nach einem Stufen-Gesetz in Bildpunkten (gewählt): L0 ≥ 150 px · L1 25–150 · L2 6–25 (die Primitive der Vorlage
    // als 4×3-Ellipsoide, 16 Dreiecke je Primitiv) · darunter ein Punkt-Keil (8 Dreiecke, der Oktaeder von heute)
    const fpx = 540 / Math.tan(Math.PI / 6); // 1080p, 60° vertikal
    const stufe = (L, d) => {
        const px = (fpx * L) / d;
        return px >= 150 ? 0 : px >= 25 ? 1 : px >= 6 ? 2 : 3;
    };
    for (const [med, n, L, d0, d1, Fn] of [
        ["Luft", 1000, 0.15, 10, 150, "Spatz"],
        ["Luft", 1000, 0.85, 10, 150, "Adler"],
        ["Wasser", 10000, 0.3, 2, 40, "Hering"],
    ]) {
        const F = FAELLE.find((x) => x.n === Fn && x.fl);
        const nPrim = primZahl(F.punkt, true).fell;
        const tr = [F.guss[0].st.tris, F.guss[1].st.tris, 16 * nPrim, 8];
        const trF = [F.guss[0].st.tris, F.guss[1].st.tris, 16 * 4, 8]; // gewählt: der Fern-Leib = die 4 größten Primitive
        const zahl = [0, 0, 0, 0];
        // gleich verteilt im Volumen eines 60°-Kegels zwischen d0 und d1 (deterministisch, Schichtung)
        for (let i = 0; i < n; i++) {
            const u = (i + 0.5) / n;
            const d = Math.cbrt(d0 ** 3 + u * (d1 ** 3 - d0 ** 3));
            zahl[stufe(L, d)]++;
        }
        const tris = zahl.reduce((s, z, k) => s + z * tr[k], 0);
        const trisF = zahl.reduce((s, z, k) => s + z * trF[k], 0);
        const triL1 = n * tr[1];
        log(
            `  ${String(n).padStart(5)} × ${Fn.padEnd(7)} (${L} m) im Kegel ${d0}–${d1} m: L0 ${zahl[0]} · L1 ${zahl[1]} · L2 ${zahl[2]} · Punkt ${zahl[3]} → ${(tris / 1e6).toFixed(2)} M Tris (L2 = ${tr[2]} Tris aus ${nPrim} Primitiven) · mit Fern-Leib (4 Primitive, 64 Tris) ${(trisF / 1e6).toFixed(2)} M · alle auf L1 wären ${(triL1 / 1e6).toFixed(1)} M Tris`
        );
    }
    // der Takt des Fischs heute: fischSchritt je Fisch (CPU)
    const FG = TC.FISCH_GESETZ;
    const fische = Array.from({ length: 10000 }, (_, i) => ({ x: i % 100, y: 0, z: Math.floor(i / 100), gier: 0, vx: 0, vz: 0 }));
    const ziel = { x: 0, y: 0, z: 0 },
        w = { x: 0.3, z: 0.1 };
    let tt = Date.now(),
        acc = 0;
    for (let k = 0; k < 20; k++) for (let i = 0; i < fische.length; i++) acc += TC.fischSchritt(fische[i], ziel, w, false, i / 1e4, k * 0.016, 0.016, FG);
    const msTakt = (Date.now() - tt) / 20;
    log(`  fischSchritt (tetrapoda-core.js:2853) für 10⁴ Fische: ${msTakt.toFixed(2)} ms je Takt (node, ein Faden, ohne _waterFlowAt; Prüfsumme ${acc.toFixed(1)})`);
}

// ════════════════════════ DIE SPROSSEN (wörtlich aus origin/koordination:vision/meisterkarte-2.json) ════════════════════════
try {
    const mk = path.join(__dirname, "..", "mk2.json");
    const K = JSON.parse(fs.readFileSync(mk, "utf8"));
    const finde = (o, id) => {
        if (o && typeof o === "object") {
            if (o.id === id) return o;
            for (const k in o) {
                const r = finde(o[k], id);
                if (r) return r;
            }
        }
        return null;
    };
    log("\n## SPROSSEN (Karte 2, wörtlich)");
    for (const [id, nrs] of [
        ["leben.tiere.arten", [2, 3]],
        ["leben.tiere.bewegung", [2, 3]],
    ]) {
        const L = finde(K, id);
        for (const s of L.sprossen.filter((x) => nrs.includes(x.nr))) log(`  ${id}#${s.nr} — Umfang „${s.umfang}“ · Tiefe „${s.tiefe}“ · Richter „${s.richter}“`);
    }
} catch (e) {
    log(`  Karte 2 nicht gelesen: ${e.message}`);
}
log(`\n# Laufzeit ${Date.now() - t0} ms`);
