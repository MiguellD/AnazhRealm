#!/usr/bin/env node
// SPIKE „EIN Land-Bauplan“ (nur lesend gegen das Repo, main 18058dba). Baut an einer KOPIE von tetrapoda-core.js im Scratch-vm
// EINEN Primitiv-Baum fester Gliederzahl (benannte Ersetzungen R1–R8, jede am eindeutigen Anker; das Repo bleibt byte-gleich) und misst:
//  (1) TREUE      — der EINE Baum gegen die Güsse von main je Gattung: (1a) sichtbare L0-Fläche (Haut-Feld mit Verrundung ∪ starre
//                   Primitive) beidseitig je Körperteil; (1b) der Refit der Vorlage Wolf (L1, Weg des Menschen) gegen das Feld von main
//  (2) MISCHUNG   — Wolf→Bär, Wolf→Hirsch linear auf den neuen stetigen Achsen, t = ¼ ½ ¾: Haut (L1-Refit) und starre Teile (Ohr, Fuß)
//  (3) HALB-FORM  — Wolf|Hirsch und Wolf|Bär bei ½: Zusammenhang, Durchdringen der Glieder, Fuß auf dem Boden
//  (4) PREIS      — Meshes, Ecken und Dreiecke je Stufe aus dem echten Ofen (BAKERS_BY_KIND.kreatur), Tafel-MB
//  (5) REICHWEITE — Hase, Pferd, Maus, Elefant als Punkte: baut er, wo bricht er
// Aufruf: node landbauplan.cjs [--repo <pfad>] [--ohr-k <K>] [--hals-n 12] [--rute-n 10] [--dichte] [--nur-treue]   (≤ 60 s, ein Faden, kein GPU)
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
const OHR_K = +arg("--ohr-k", 5); // Ohr-Scheiben je Lage (gewählt; die Messung unten wählt nicht nach)
const OHR_UEB = 1.5; // Überlapp der Ohr-Scheiben (gewählt)
const HALS_N = +arg("--hals-n", 12),
    RUTE_N = +arg("--rute-n", 10); // die feste Gliederzahl des Bauplans (Runde 1: 12 / 10)
const NUR_TREUE = process.argv.includes("--nur-treue");
const { fadenScope, OFEN_KERNE } = require(path.join(REPO, "scripts/lib/welt-boot.cjs"));
const log = (...a) => console.log(...a);
const f1 = (x) => (x === Infinity ? "∞" : (Math.round(x * 10) / 10).toFixed(1));
const ARTEN = ["wolf", "fox", "bear", "deer"];
const DIALS = ["size", "neck", "leg", "diet", "build"];

// ════════════════════════ die zwei Kerne ════════════════════════
const KM = (() => {
    const sb = fadenScope(OFEN_KERNE);
    return { name: "main", sb, TC: sb.__tetrapodaCore, T: sb.THREE };
})();
const MJE = KM.TC.MASSSTAB.meterJeEinheit;
const mm = (u) => u * MJE * 1000;
log(`# Spike EIN Land-Bauplan — main geladen in ${Date.now() - t0} ms (Maßstab ${MJE.toFixed(4)} m/E, Ohr-Scheiben K ${OHR_K})`);

const ERSETZUNGEN = [];
function kopieKern(DICHTE) {
    let src = fs.readFileSync(path.join(REPO, "tetrapoda-core.js"), "utf8");
    const ersetze = (name, a, b) => {
        const n = src.split(a).length - 1;
        if (n !== 1) throw new Error(`${name}: Anker ${n}× statt 1×: ${a.slice(0, 70)}`);
        src = src.replace(a, () => b);
        ERSETZUNGEN.push(name);
    };
    const ersetzeBereich = (name, von, bis, neu) => {
        const i = src.indexOf(von),
            j = src.indexOf(bis, i);
        if (i < 0 || j < 0 || src.indexOf(von, i + 1) >= 0) throw new Error(`${name}: Bereich nicht eindeutig`);
        src = src.slice(0, i) + neu + src.slice(j);
        ERSETZUNGEN.push(name);
    };
    // R1 Hals: 12 Glieder fest (vorher ceil(nLen/(0,75·nR0)), :4755) — dieselbe Kurve, dieselbe Radius-Regel, dichter abgetastet
    ersetze(`R1 Hals ${HALS_N}`, "var nN = Math.max(4, Math.ceil(nLen / (0.75 * nR[0])));", `var nN = ${HALS_N};`);
    // R2 Rute: 10 Glieder fest, abgetastet auf DER Kurve von main (Glied i bei s = (n−1)·i/9, n = segs der Art, stetig; :4833)
    ersetzeBereich(
        `R2 Rute ${RUTE_N} auf der Kurve`,
        "var nSeg = Math.max(1, Math.round(A.schwanz.segs));",
        "        // Die Kopf-Größe der Art",
        `var nSeg = ${RUTE_N}, __n = Math.max(1, A.schwanz.segs), __sV = 0;
        var __fy = function (q) { return (q * (q + 3)) / 2; };
        for (var i = 0; i < nSeg; i++) {
            var segG = F.gruppe();
            var tt = i / (nSeg - 1);
            var __s = (__n - 1) * tt;
            var segR = H * (A.schwanz.wurzel * (1 - tt) + A.schwanz.spitze * tt + (A.schwanz.mitte - (A.schwanz.wurzel + A.schwanz.spitze) / 2) * Math.sin(Math.PI * tt));
            var seg = s(segR, "fell", [0.95, 1.18, 1.18]);
            seg.position.z = -A.schwanz.segL * 1.15 * H;
            segG.add(seg);
            F.fellSchweif(segG, segR, i);
            segG.position.z = -A.schwanz.segL * H * (__s - __sV);
            segG.position.y = -0.003 * H * (__fy(__s) - __fy(__sV));
            tailParent.add(segG);
            tailParent = segG;
            tailSegs.push(segG);
            __sV = __s;
        }
`
    );
    // R3 Art-Gewichte als Achse (wie 2b der ersten Runde): globalThis.__wFest statt des Gauß-Wurfs aus den Dials (:4062)
    ersetze(
        "R3 w als Achse",
        "function artGewichte(P) {",
        "function artGewichte(P) { var __w = globalThis.__wFest; if (__w) { var __b = null; for (var __k in __w) if (!__b || __w[__k] > __w[__b]) __b = __k; return { w: Object.assign({}, __w), art: __b }; }"
    );
    // R4 Fuß: EIN Primitiv-Satz (Ballen, Mittelfuß-Polster, 4 Zehen × [Zehe, Kralle, Zehen-Ballen], Daumen vorn); die Achse huf ∈ [0, 1]
    // trägt jedes Primitiv stetig von der Zehe zum Huf: die inneren Zehen III/IV werden die Schalen (ihre Kralle wächst zur Klaue),
    // die äußeren II/V die Afterklauen, das Mittelfuß-Polster der Fesselkopf; Ballen und Zehen-Fleisch ziehen IN die Klauen
    // (verdeckt). spreiz ∈ [0, 1] führt die Schalen zusammen (0 = Einhufer). Endpunkte = main: huf 0 → baueFuss „zehe“, huf 1 → „huf“.
    ersetzeBereich(
        "R4 Fuß stetig",
        "var baueFuss = function (paw, side, vorn) {",
        "        var xVorn = 0.78 * breite(uZ(zS)) + 0.03 * H,",
        `var baueFuss = function (paw, side, vorn) {
            paw.scale.setScalar(A.bein.pfoteGross);
            var h = Math.max(0, Math.min(1, A.bein.huf)), sp = A.bein.spreiz;
            var L = function (a, b) { return a + (b - a) * h; };
            var LV = function (a, b) { return [L(a[0], b[0]), L(a[1], b[1]), L(a[2], b[2])]; };
            var setze = function (r0, r1, kl, sc0, sc1, p0, p1, rx0, rx1) {
                var m = s(L(r0, r1), kl, LV(sc0, sc1));
                var p = LV(p0, p1);
                m.position.set(p[0], p[1], p[2]);
                m.rotation.x = L(rx0 || 0, rx1 || 0);
                paw.add(m);
                return m;
            };
            var kr = A.bein.kralle;
            var fes = [0, 0.018 * H, 0.002 * H];
            setze((vorn ? 0.015 : 0.013) * H, 0.008 * H, "ballen", [1.6, vorn ? 0.28 : 0.26, 1.2], [1, 1, 1], [0, (vorn ? -0.01 : -0.008) * H, (vorn ? 0.01 : 0.008) * H], fes);
            var rMx = 0.028 * H * Math.pow(bt, 1.3);
            setze(rMx * (vorn ? 1.05 : 1.02), 0.02 * H, "fell", [1.0, vorn ? 0.3 : 0.28, 1.0], [1.0, 1.1, 1.0], [0, 0.002 * H, 0.012 * H], fes);
            for (var i = 0; i < 4; i++) {
                var tx = (i - 1.5) * (vorn ? 0.022 : 0.018) * H;
                var innen = i === 1 || i === 2, hs = i < 2 ? -1 : 1;
                var ziel = innen ? [hs * 0.0085 * H * sp, -0.004 * H, 0.008 * H] : [hs * 0.011 * H, 0.02 * H, -0.012 * H];
                setze((vorn ? 0.01 : 0.009) * H, innen ? 0.009 * H : 0.002 * H, "fell", [1.0, vorn ? 0.58 : 0.52, vorn ? 1.5 : 1.4], innen ? [0.5, 0.7, 1.0] : [1, 1, 1], [tx, -0.002 * H, (vorn ? 0.024 : 0.022) * H], ziel, 0, innen ? -0.12 : 0);
                setze((vorn ? 0.003 : 0.0028) * H, innen ? 0.018 * H : 0.0045 * H, "klaue", [1.0, 1.3 * kr, 1.0], innen ? [0.55, 0.85, 1.35] : [0.8, 1.2, 0.8], [tx, -0.012 * H + 0.003 * H * (kr - 1), (vorn ? 0.048 : 0.042) * H + 0.004 * H * (kr - 1)], ziel, 0.42 + 0.25 * (kr - 1), innen ? -0.12 : 0);
                setze((vorn ? 0.006 : 0.005) * H, innen ? 0.006 * H : 0.0015 * H, "ballen", [vorn ? 1.5 : 1.4, 0.28, 1.2], [1, 1, 1], [tx, (vorn ? -0.01 : -0.008) * H, (vorn ? 0.022 : 0.02) * H], ziel, 0, innen ? -0.12 : 0);
            }
            if (vorn) setze(0.005 * H, 0.005 * H, "fell", [1, 1, 1], [1, 1, 1], [side * 0.024 * H, 0, -0.01 * H], fes);
        };
`
    );
    // R5 Ohr: EINE Fläche aus K Scheiben je Lage (Fell außen, Zahnfleisch innen) + Rand-Strich; stetig in Länge ohrH, Breite ohrB,
    // Spitzen-Rundung ohrSpitz (1 = Kegel von main „spitz“, 0 = Ellipsoid von main „rund“/„blatt“), Lage und Stellung als Zahlen.
    ersetzeBereich(
        "R5 Ohr stetig",
        "        function buildEar(side) {",
        "        earL = buildEar(-1);",
        `        function buildEar(side) {
            var e = F.gruppe();
            var K = ${OHR_K}, UEB = ${OHR_UEB};
            var kk = A.kopf, sp = Math.max(0, Math.min(1, kk.ohrSpitz));
            var lage = function (ell, keg) {
                for (var k = 0; k < K; k++) {
                    var t = (k + 0.5) / K, y = keg.y0 + t * keg.h, r = keg.rb + (keg.rt - keg.rb) * t;
                    var c = [0, sp * y + (1 - sp) * ell.c[1], sp * keg.z + (1 - sp) * ell.c[2]];
                    var a = [sp * r + (1 - sp) * ell.a[0], sp * ((0.5 * keg.h) / K) * UEB + (1 - sp) * ell.a[1], sp * keg.zs * r + (1 - sp) * ell.a[2]];
                    var rr = Math.max(a[0], a[1], a[2], 1e-9);
                    var m = s(rr, ell.kl, [a[0] / rr, a[1] / rr, a[2] / rr]);
                    m.position.set(c[0], c[1], c[2]);
                    e.add(m);
                }
            };
            lage({ kl: "fell", c: [0, kk.ohrCy * oH, 0], a: [kk.ohrAx * oB, kk.ohrAy * oH, kk.ohrAz * H] }, { y0: 0.02 * oH, h: oH, rb: oB, rt: 0.003 * H, zs: 0.32, z: 0 });
            lage({ kl: "zahnfleisch", c: [0, kk.ohrIcy * oH, kk.ohrIz * oB], a: [kk.ohrIax * oB, kk.ohrIay * oH, kk.ohrIaz * H] }, { y0: 0.03 * oH, h: 0.84 * oH, rb: 0.73 * oB, rt: 0.002 * H, zs: 0.28, z: -0.004 * H });
            var rim = cH(0.0022 * H * sp, 0.0018 * H * sp, oH, "straehneD");
            rim.position.set(side * 0.002 * (H / 2.4), oH * 0.52, 0.002 * (H / 2.4));
            rim.scale.z = 0.3;
            e.add(rim);
            e.position.set(side * oX, oY + kk.ohrDy * H, kk.ohrZ * H);
            e.rotation.z = side * kk.ohrRoll;
            e.rotation.x = kk.ohrPitch;
            return e;
        }
`
    );
    // R6 Fänge stetig: immer gebaut, Radius × min(1, fangF/0,1) (vorher Schalter fangF > 0,1 an zwei Schleifen :4943/:4976)
    ersetze("R6a Fang oben", "for (var sd = -1; sd <= 1 && fangF > 0.1; sd += 2) {\n            var fang = cH(0.004 * H, 0.0015 * H,", "var __fz = Math.min(1, fangF / 0.1);\n        for (var sd = -1; sd <= 1; sd += 2) {\n            var fang = cH(0.004 * H * __fz, 0.0015 * H * __fz,");
    ersetze("R6b Reißzahn oben", 'var carn = cH(0.0045 * H, 0.002 * H, 0.024 * H, "zahn");', 'var carn = cH(0.0045 * H * __fz, 0.002 * H * __fz, 0.024 * H, "zahn");');
    ersetze("R6c Fang unten", "for (var sd = -1; sd <= 1 && fangF > 0.1; sd += 2) {\n            var fangL = cH(0.0035 * H, 0.0012 * H,", "for (var sd = -1; sd <= 1; sd += 2) {\n            var fangL = cH(0.0035 * H * __fz, 0.0012 * H * __fz,");
    ersetze("R6d Reißzahn unten", 'var carnL = cH(0.004 * H, 0.0018 * H, 0.022 * H, "zahn");', 'var carnL = cH(0.004 * H * __fz, 0.0018 * H * __fz, 0.022 * H, "zahn");');
    // R7 Kiefer-Länge stetig: stückweise linear durch dieselben Werte an diet 0 · ½ · 1 (vorher Stufen bei 0,3/0,7, :4963)
    ersetze("R7 Kiefer stetig", "var jawLen = P.diet > 0.7 ? 1.6 : P.diet > 0.3 ? 1.5 : 1.65;", "var jawLen = P.diet < 0.5 ? 1.65 - 0.3 * P.diet : 1.5 + 0.2 * (P.diet - 0.5);");
    // R8 die neuen Zahlen der Wurzeln (die Wörter pfote/ohrForm bleiben stehen, NIEMAND liest sie mehr) + Punkt-Achsen (__achsen)
    const ohrSpitz = (az, iaz, iz) => `ohrSpitz: 1, ohrCy: 0.52, ohrAy: 0.5, ohrAx: 0.6, ohrAz: ${az}, ohrIcy: 0.45, ohrIay: 0.42, ohrIax: 0.44, ohrIaz: ${iaz}, ohrIz: ${iz}, ohrDy: -0.012, ohrZ: -0.052, ohrRoll: 0.15, ohrPitch: -0.08, `;
    ersetze("R8a Wolf", 'pfote: "zehe", pfoteGross: 1.55,', 'pfote: "zehe", huf: 0, spreiz: 1, pfoteGross: 1.55,');
    ersetze("R8b Fuchs", 'pfote: "zehe", pfoteGross: 1.4,', 'pfote: "zehe", huf: 0, spreiz: 1, pfoteGross: 1.4,');
    ersetze("R8c Bär", 'pfote: "sohle",', 'pfote: "sohle", huf: 0, spreiz: 1,');
    ersetze("R8d Hirsch", 'pfote: "huf",', 'pfote: "huf", huf: 1, spreiz: 1,');
    ersetze("R8e Ohr Wolf", 'ohrForm: "spitz", ohrH: 0.1,', `ohrForm: "spitz", ${ohrSpitz(0.32 * 0.6 * 0.03, 0.28 * 0.44 * 0.03, -0.004 / 0.03)}ohrH: 0.1,`);
    ersetze("R8f Ohr Fuchs", 'ohrForm: "spitz", ohrH: 0.15,', `ohrForm: "spitz", ${ohrSpitz(0.32 * 0.6 * 0.042, 0.28 * 0.44 * 0.042, -0.004 / 0.042)}ohrH: 0.15,`);
    ersetze("R8g Ohr Bär", 'ohrForm: "rund",', 'ohrForm: "rund", ohrSpitz: 0, ohrCy: 0.55, ohrAy: 1.0, ohrAx: 1.0, ohrAz: 0.015, ohrIcy: 0.55, ohrIay: 0.72, ohrIax: 0.72, ohrIaz: 0.0054, ohrIz: 0.12, ohrDy: -0.012, ohrZ: -0.07, ohrRoll: -0.35, ohrPitch: 0,');
    ersetze("R8h Ohr Hirsch", 'ohrForm: "blatt",', 'ohrForm: "blatt", ohrSpitz: 0, ohrCy: 0.5, ohrAy: 0.5, ohrAx: 1.0, ohrAz: 0.0128, ohrIcy: 0.52, ohrIay: 0.42, ohrIax: 0.8, ohrIaz: 0.005376, ohrIz: 0.08, ohrDy: -0.01, ohrZ: -0.065, ohrRoll: -0.7, ohrPitch: -0.25,');
    ersetze("R8i Punkt-Achsen", "        out.ref = ref;\n        return out;", "        out.ref = ref;\n        var __a = globalThis.__achsen; if (__a) for (var __t in __a) for (var __f in __a[__t]) out[__t][__f] = __a[__t][__f];\n        return out;");
    if (DICHTE) {
        // R9 DAS DICHTE-GESETZ der Kette: die Verrundung der Haut (polynomiales smin, __tierFeld foundry-core.js:8701–8707) ist nicht
        // idempotent — eine dichtere Kette gleicher Ellipsoide bläht auf. Der Glied-Radius trägt darum die Aufblähung seiner Dichte
        // gegen die Dichte der Art (Hals: der stetige Ersatz der Stufen-Regel von main :4755, Rute: segL der Art); 1-D-Kette, 9 Glieder,
        // sichtbarer Radius in Glied-Mitte und Lücke, Verrundung 0,035 H (TIER_HAUT.blend foundry-core.js:8384).
        ersetze("R9a Aufblähung", "function bauTier(F, dials) {", `function __aufblaehung(rr, ra, d, bl) {
        var n = 9, zc = 4 * d, sum = 0;
        for (var m = 0; m < 2; m++) {
            var z = zc + (m * d) / 2, lo = 0, hi = 3 * rr + bl;
            for (var it = 0; it < 40; it++) {
                var rho = (lo + hi) / 2, a = Infinity;
                for (var k = 0; k < n; k++) {
                    var qx = rho / rr, qz = (z - k * d) / ra, ql = Math.sqrt(qx * qx + qz * qz) || 1e-12;
                    var gx = qx / ql / rr, gz = qz / ql / ra;
                    var b = (ql - 1) / Math.sqrt(gx * gx + gz * gz);
                    var dab = Math.abs(a - b);
                    if (dab >= bl) { if (b < a) a = b; continue; }
                    var hh = (bl - dab) / bl;
                    a = Math.min(a, b) - hh * hh * bl * 0.25;
                }
                if (a < 0) lo = rho; else hi = rho;
            }
            sum += (lo + hi) / 2 - rr;
        }
        return sum / 2;
    }
    function bauTier(F, dials) {`);
        ersetze("R9b Hals-Radius aus der Dichte", "var nS = s(nRi, \"fell\", [0.9, 1.18, 0.94]);", "var __dS = nLen / Math.max(3, nLen / (0.75 * nR[0]) - 0.5), __dN = nLen / (nN - 1);\n            var nS = s(Math.max(0.3 * nRi, nRi - (__aufblaehung(0.92 * nRi, 1.18 * nRi, __dN, 0.035 * H) - __aufblaehung(0.92 * nRi, 1.18 * nRi, __dS, 0.035 * H)) / 0.92), \"fell\", [0.9, 1.18, 0.94]);");
        ersetze("R9c Ruten-Radius aus der Dichte", "var seg = s(segR, \"fell\", [0.95, 1.18, 1.18]);", "var __rS = A.schwanz.segL * H * 1.6, __rN = A.schwanz.segL * H * 1.6 * Math.max(1e-3, (__n - 1) / (nSeg - 1));\n            var seg = s(Math.max(0.3 * segR, segR - (__aufblaehung(1.06 * segR, 1.888 * segR, __rN, 0.035 * H) - __aufblaehung(1.06 * segR, 1.888 * segR, __rS, 0.035 * H)) / 1.06), \"fell\", [0.95, 1.18, 1.18]);");
    }
    const sb = fadenScope(["phyto-core.js", "koerper-core.js"]);
    vm.runInContext(src, sb, { filename: "tetrapoda-core.landbauplan.js" });
    vm.runInContext(fs.readFileSync(path.join(REPO, "foundry-core.js"), "utf8"), sb, { filename: "foundry-core.js" });
    return { name: "EIN", sb, TC: sb.__tetrapodaCore, T: sb.THREE };
}
const KN = kopieKern(process.argv.includes("--dichte")); // R9 nur auf Ruf: die 1-D-Form überschießt und bricht den Fell-Guss (Blatt)
log(`Kern-KOPIE im Scratch-vm mit ${ERSETZUNGEN.length} benannten Ersetzungen: ${ERSETZUNGEN.join(" · ")}  [${Date.now() - t0} ms]`);
const setW = (w) => (KN.sb.__wFest = w || null);
const setA = (a) => (KN.sb.__achsen = a || null);
const einsW = (art) => Object.fromEntries(ARTEN.map((a) => [a, a === art ? 1 : 0]));
const dialsVon = (K, art, ov) => Object.assign({}, K.TC.GATTUNGEN[art], ov || {});
const lerpDials = (a, b, t) => Object.fromEntries(DIALS.map((k) => [k, KM.TC.GATTUNGEN[a][k] + t * (KM.TC.GATTUNGEN[b][k] - KM.TC.GATTUNGEN[a][k])]));

// ── der Baum eines Dial-Satzes: dieselben Fabriken wie bakeTierInstance (Kugeln/Zylinder grob; die Primitive zählen, nicht das Raster) ──
function baum(K, dials) {
    const T = K.T;
    const mat = {};
    const M = (k) => mat[k] || (mat[k] = Object.assign(new T.MeshBasicMaterial(), { userData: { __klasse: k } }));
    const F = {
        gruppe: () => new T.Group(),
        kugel: (r, k, sc) => {
            const m = new T.Mesh(new T.SphereGeometry(r, 4, 3), M(k));
            if (sc) m.scale.set(sc[0], sc[1], sc[2]);
            return m;
        },
        zylinder: (rt, rb, h, k) => new T.Mesh(new T.CylinderGeometry(rt, rb, h, 4, 1), M(k)),
        kugelFein: (r, k) => (k === "hornhaut" ? new T.Group() : new T.Mesh(new T.SphereGeometry(r, 4, 3), M(k))),
        v3: (x, y, z) => new T.Vector3(x, y, z),
        richte: (node, dir) => node.quaternion.setFromUnitVectors(new T.Vector3(0, 1, 0), dir.clone().normalize()),
        fellSchweif: () => {},
    };
    const B = K.TC.bauTier(F, dials);
    const root = B.teile.wolf;
    root.updateMatrixWorld(true);
    const namen = ["wolf", "legFL", "legFR", "legHL", "legHR", "flU", "flL", "flP", "frU", "frL", "frP", "hlT", "hlC", "hlP", "hrT", "hrC", "hrP", "headGroup", "jawGroup", "earL", "earR", "lidTL", "lidTR", "tailRoot"];
    const nodeName = new Map();
    for (const n of namen) if (B.teile[n]) nodeName.set(B.teile[n], n);
    (B.tailSegs || []).forEach((s, i) => nodeName.set(s, "tailSeg" + i));
    const gelenkVon = (n) => {
        for (let c = n; c; c = c.parent) if (nodeName.has(c)) return nodeName.get(c);
        return "wolf";
    };
    // Körperteil je Knoten (für die Zuordnung der Abweichung)
    const t = B.teile;
    const halsSet = new Set([...(B.neckSegs || []), t.mane, t.throat, t.throatLower, t.larynx, t.larynxUp].filter(Boolean));
    const pfoteSet = new Set([t.flP, t.frP, t.hlP, t.hrP]);
    const beinSet = new Set([t.legFL, t.legFR, t.legHL, t.legHR]);
    const teil = (n) => {
        for (let c = n; c; c = c.parent) {
            if (c === t.earL || c === t.earR) return "ohr";
            if (c === t.headGroup) return "kopf";
            if (c === t.tailRoot) return "rute";
            if (pfoteSet.has(c)) return "pfote";
            if (beinSet.has(c)) return "bein";
            if (halsSet.has(c)) return "hals";
        }
        return "rumpf";
    };
    const gruppe = (n) => {
        for (let c = n; c; c = c.parent) {
            if (c === t.headGroup) return "KOPF";
            if (c === t.tailRoot) return "RUTE";
            // die DISTALEN Glieder (Unterarm/Unterschenkel samt Pfote): Gesäß, Schulter-Brücke und Oberarm überlappen den Rumpf und
            // einander gewollt (bauTier :4579, :4709) — durchdringen dürfen sich nur die freien Läufe nicht
            if (c === t.flL) return "FL";
            if (c === t.frL) return "FR";
            if (c === t.hlC) return "HL";
            if (c === t.hrC) return "HR";
        }
        return "LEIB";
    };
    const pfoteVon = (n) => {
        for (let c = n; c; c = c.parent) if (pfoteSet.has(c)) return nodeName.get(c);
        return null;
    };
    let meshes = 0;
    root.traverse((o) => o.isMesh && meshes++);
    return { K, B, root, nodeName, gelenkVon, teil, gruppe, pfoteVon, meshes, H: B.masse.H, dials };
}

// ════════════════════════ das SICHTBARE Feld (L0) ════════════════════════
// V(x) = min( Haut(x), Starr(x) ): Haut = die glatte Vereinigung der Leib-Primitive, wie __tierHaut sie für Stufe 0 gießt
// (__tierPrims ohne Kopf, Raster 0,02 H, Verrundung 0,035 H, Raster-Anpassung an dreieckeNah; das Feld ohne Raster =
// __leibRaumFeld); Starr = jedes andere Mesh als exakte Fläche (Ellipsoid erster Ordnung wie __tierAbstand, Kegelstumpf
// exakt im lokalen Raum, durch den Gradienten in die Welt). Kopf-Häute (vox 0,008 H) sind in beiden Bäumen dieselben Primitive
// und als harte Vereinigung genähert — ihr Unterschied ist in beiden Bäumen null.
function sichtbar(b) {
    const { sb, T } = b.K;
    const TH = sb.TIER_HAUT;
    const H = b.H;
    let vox = TH.voxNah * H;
    const blend = TH.blend * H;
    const unterKopf = (n) => {
        for (let c = n; c; c = c.parent) if (c === b.B.teile.headGroup) return true;
        return false;
    };
    const nimm = (n) => !unterKopf(n);
    let P = sb.__tierPrims(b.root, b.root, nimm, vox, blend, b.gelenkVon);
    let feld = sb.__tierFeld(P, vox, blend);
    const dr = 2 * sb.__tierKanten(feld.f, feld.nx, feld.ny, feld.nz);
    if (dr > TH.dreieckeNah) {
        vox *= Math.sqrt(dr / TH.dreieckeNah);
        P = sb.__tierPrims(b.root, b.root, nimm, vox, blend, b.gelenkVon);
    }
    for (const p of P) p.blend = blend;
    const haut = new Set(P.map((p) => p.node));
    // alle Primitive (für Abtastung und Starr-Feld)
    const inv = new T.Matrix4().copy(b.root.matrixWorld).invert();
    const alle = [];
    b.root.traverse((node) => {
        if (!node.isMesh || !node.geometry || !node.geometry.parameters) return;
        const gp = node.geometry.parameters;
        const zyl = node.geometry.type === "CylinderGeometry";
        const M = new T.Matrix4().multiplyMatrices(inv, node.matrixWorld);
        const e = M.elements;
        const sx = Math.hypot(e[0], e[1], e[2]),
            sy = Math.hypot(e[4], e[5], e[6]),
            sz = Math.hypot(e[8], e[9], e[10]);
        const r = zyl ? Math.max(gp.radiusTop, gp.radiusBottom) : gp.radius;
        const ext = zyl ? Math.max(gp.radiusTop, gp.radiusBottom, gp.height / 2) * Math.max(sx, sy, sz) : r * Math.max(sx, sy, sz);
        if (!(ext > 1e-6 * H)) return; // Null-Primitiv (R6 an diet 0: Fang mit Radius 0) — gießt keine Fläche
        const Mi = Float64Array.from(new T.Matrix4().copy(M).invert().elements);
        alle.push({
            node,
            zyl,
            r,
            rt: zyl ? gp.radiusTop : 0,
            rb: zyl ? gp.radiusBottom : 0,
            hh: zyl ? gp.height / 2 : 0,
            M: Float64Array.from(e),
            Mi,
            c: [e[12], e[13], e[14]],
            ext,
            sc: [sx, sy, sz],
            haut: haut.has(node),
            teil: b.teil(node),
            gruppe: b.gruppe(node),
            pfote: b.pfoteVon(node),
            kl: node.material.userData.__klasse,
        });
    });
    alle.forEach((p, i) => (p.i = i));
    const starr = alle.filter((p) => !p.haut);
    const gitter = baueGitter(starr, H);
    // das Haut-Feld je Zelle nur mit den Primitiven, deren Kugel `ext` die Zelle berührt (in der Reihenfolge von P): exakt dasselbe
    // wie __leibRaumFeld über alle P (jedes andere Primitiv überspringt der Kern selbst über d2 > ext²)
    const HC = 0.05 * H,
        hg = new Map();
    for (const p of P)
        for (let i = Math.floor((p.c[0] - p.ext) / HC); i <= Math.floor((p.c[0] + p.ext) / HC); i++)
            for (let j = Math.floor((p.c[1] - p.ext) / HC); j <= Math.floor((p.c[1] + p.ext) / HC); j++)
                for (let k = Math.floor((p.c[2] - p.ext) / HC); k <= Math.floor((p.c[2] + p.ext) / HC); k++) {
                    const key = i + "," + j + "," + k;
                    (hg.get(key) || hg.set(key, []).get(key)).push(p);
                }
    const LEER = [];
    const hautFeld = (x, y, z) => sb.__leibRaumFeld(hg.get(Math.floor(x / HC) + "," + Math.floor(y / HC) + "," + Math.floor(z / HC)) || LEER, vox, x, y, z);
    const V = (x, y, z, ohne) => Math.min(hautFeld(x, y, z), starrFeld(gitter, starr, x, y, z, ohne));
    return { b, P, vox, blend, alle, starr, gitter, V, H };
}
// lokales SDF eines Primitivs, in die Welt in erster Ordnung (exakt auf der Fläche)
function lokal(p, x, y, z) {
    const m = p.Mi;
    return [m[0] * x + m[4] * y + m[8] * z + m[12], m[1] * x + m[5] * y + m[9] * z + m[13], m[2] * x + m[6] * y + m[10] * z + m[14]];
}
function sdKegel(qx, qy, qz, hh, r1, r2) {
    // IQ sdCappedCone: Achse y, unten (−hh) Radius r1 = radiusBottom, oben (+hh) Radius r2 = radiusTop
    const q0 = Math.hypot(qx, qz),
        q1 = qy;
    const k1x = r2,
        k1y = hh,
        k2x = r2 - r1,
        k2y = 2 * hh;
    const cax = q0 - Math.min(q0, q1 < 0 ? r1 : r2),
        cay = Math.abs(q1) - hh;
    const tt = Math.max(0, Math.min(1, ((k1x - q0) * k2x + (k1y - q1) * k2y) / (k2x * k2x + k2y * k2y)));
    const cbx = q0 - k1x + k2x * tt,
        cby = q1 - k1y + k2y * tt;
    const sg = cbx < 0 && cay < 0 ? -1 : 1;
    return sg * Math.sqrt(Math.min(cax * cax + cay * cay, cbx * cbx + cby * cby));
}
function primAbstand(p, x, y, z) {
    const q = lokal(p, x, y, z);
    const m = p.Mi;
    if (!p.zyl) {
        const ql = Math.hypot(q[0], q[1], q[2]) || 1e-12;
        const ux = q[0] / ql,
            uy = q[1] / ql,
            uz = q[2] / ql;
        const gx = m[0] * ux + m[1] * uy + m[2] * uz,
            gy = m[4] * ux + m[5] * uy + m[6] * uz,
            gz = m[8] * ux + m[9] * uy + m[10] * uz;
        return (ql - p.r) / (Math.hypot(gx, gy, gz) || 1e-12);
    }
    const d = sdKegel(q[0], q[1], q[2], p.hh, p.rb, p.rt);
    const e = 1e-4 * Math.max(p.hh, p.rb, p.rt, 1e-6);
    const lx = (sdKegel(q[0] + e, q[1], q[2], p.hh, p.rb, p.rt) - sdKegel(q[0] - e, q[1], q[2], p.hh, p.rb, p.rt)) / (2 * e),
        ly = (sdKegel(q[0], q[1] + e, q[2], p.hh, p.rb, p.rt) - sdKegel(q[0], q[1] - e, q[2], p.hh, p.rb, p.rt)) / (2 * e),
        lz = (sdKegel(q[0], q[1], q[2] + e, p.hh, p.rb, p.rt) - sdKegel(q[0], q[1], q[2] - e, p.hh, p.rb, p.rt)) / (2 * e);
    const gx = m[0] * lx + m[1] * ly + m[2] * lz,
        gy = m[4] * lx + m[5] * ly + m[6] * lz,
        gz = m[8] * lx + m[9] * ly + m[10] * lz;
    return d / (Math.hypot(gx, gy, gz) || 1e-12);
}
function baueGitter(prims, H) {
    const C = 0.05 * H,
        R = 0.05 * H; // Kappe: weiter als 0,05 H (Wolf 40 mm) von jedem starren Primitiv zählt als 0,05 H — über jeder Schwelle des Urteils
    const g = new Map();
    for (const p of prims) {
        const rr = p.ext + R;
        for (let i = Math.floor((p.c[0] - rr) / C); i <= Math.floor((p.c[0] + rr) / C); i++)
            for (let j = Math.floor((p.c[1] - rr) / C); j <= Math.floor((p.c[1] + rr) / C); j++)
                for (let k = Math.floor((p.c[2] - rr) / C); k <= Math.floor((p.c[2] + rr) / C); k++) {
                    const key = i + "," + j + "," + k;
                    (g.get(key) || g.set(key, []).get(key)).push(p);
                }
    }
    return { C, R, g };
}
function starrFeld(G, prims, x, y, z, ohne) {
    const l = G.g.get(Math.floor(x / G.C) + "," + Math.floor(y / G.C) + "," + Math.floor(z / G.C));
    let a = Infinity;
    if (l) for (const p of l) if (p !== ohne) a = Math.min(a, primAbstand(p, x, y, z));
    return Math.min(a, G.R);
}
// Punkte auf der Fläche eines Primitivs (Fibonacci auf der Einheits-Kugel bzw. Mantel + Deckel des Kegels), Dichte σ je Punkt
function flaechenPunkte(p, sigma) {
    const e = p.M,
        out = [];
    const welt = (a, b, c) => [e[0] * a + e[4] * b + e[8] * c + e[12], e[1] * a + e[5] * b + e[9] * c + e[13], e[2] * a + e[6] * b + e[10] * c + e[14]];
    if (!p.zyl) {
        const A = p.r * p.sc[0],
            B = p.r * p.sc[1],
            C = p.r * p.sc[2];
        const pp = 1.6075,
            area = 4 * Math.PI * Math.pow((Math.pow(A * B, pp) + Math.pow(A * C, pp) + Math.pow(B * C, pp)) / 3, 1 / pp);
        const n = Math.max(12, Math.ceil(area / (sigma * sigma)));
        const g = Math.PI * (3 - Math.sqrt(5));
        for (let i = 0; i < n; i++) {
            const yy = 1 - (2 * (i + 0.5)) / n,
                rr = Math.sqrt(1 - yy * yy),
                th = g * i;
            out.push(welt(p.r * rr * Math.cos(th), p.r * yy, p.r * rr * Math.sin(th)));
        }
        return out;
    }
    const smax = Math.max(p.sc[0], p.sc[1], p.sc[2]);
    const area = (Math.PI * (p.rt + p.rb) * Math.hypot(2 * p.hh, p.rb - p.rt) + Math.PI * (p.rt * p.rt + p.rb * p.rb)) * smax * smax;
    const n = Math.max(16, Math.ceil(area / (sigma * sigma)));
    const nh = Math.max(2, Math.round(Math.sqrt(n / 4))),
        nu = Math.max(8, Math.round(n / nh));
    for (let j = 0; j < nh; j++) {
        const t = (j + 0.5) / nh,
            y = -p.hh + 2 * p.hh * t,
            r = p.rb + (p.rt - p.rb) * t;
        for (let i = 0; i < nu; i++) {
            const th = (2 * Math.PI * (i + 0.5 * (j % 2))) / nu;
            out.push(welt(r * Math.cos(th), y, r * Math.sin(th)));
        }
    }
    for (const [y, r] of [[-p.hh, p.rb], [p.hh, p.rt]])
        for (let i = 0; i < 6; i++) for (let k = 0; k < 6; k++) {
            const rr = r * Math.sqrt((i + 0.5) / 6),
                th = (2 * Math.PI * (k + 0.5 * i)) / 6;
            out.push(welt(rr * Math.cos(th), y, rr * Math.sin(th)));
        }
    return out;
}
// die sichtbare Fläche als Punktwolke: Primitiv-Punkte nahe am Nullniveau von V, per Newton auf V = 0 gelegt
function flaeche(S, sigmaH) {
    const H = S.H,
        sig = sigmaH * H,
        h = 0.002 * H;
    const pts = [];
    for (const p of S.alle) {
        for (const x of flaechenPunkte(p, sig)) {
            let v = S.V(x[0], x[1], x[2]);
            if (v < -0.012 * H) continue;
            let q = x;
            for (let it = 0; it < 3 && Math.abs(v) > 2e-4 * H; it++) {
                const gx = (S.V(q[0] + h, q[1], q[2]) - S.V(q[0] - h, q[1], q[2])) / (2 * h),
                    gy = (S.V(q[0], q[1] + h, q[2]) - S.V(q[0], q[1] - h, q[2])) / (2 * h),
                    gz = (S.V(q[0], q[1], q[2] + h) - S.V(q[0], q[1], q[2] - h)) / (2 * h);
                const g2 = gx * gx + gy * gy + gz * gz;
                if (!(g2 > 1e-12)) break;
                q = [q[0] - (v * gx) / g2, q[1] - (v * gy) / g2, q[2] - (v * gz) / g2];
                v = S.V(q[0], q[1], q[2]);
            }
            if (Math.abs(v) < 1e-3 * H) pts.push({ x: q, teil: p.teil });
        }
    }
    return pts;
}
function stat(arr) {
    if (!arr.length) return { p50: 0, p95: 0, max: 0, n: 0 };
    const a = Float64Array.from(arr).sort();
    return { p50: a[Math.floor(a.length * 0.5)], p95: a[Math.floor(a.length * 0.95)], max: a[a.length - 1], n: a.length };
}
const fmt = (s) => `p95 ${f1(s.p95)} · max ${f1(s.max)} mm`;
const TEILE = ["rumpf", "bein", "pfote", "hals", "kopf", "ohr", "rute"];
// beidseitiger Abstand der sichtbaren Flächen zweier Leiber (in mm beim Maßstab des Leibs), je Körperteil
function vergleich(SA, SB, sigmaH) {
    const FA = flaeche(SA, sigmaH),
        FB = flaeche(SB, sigmaH);
    const je = {};
    for (const t of TEILE) je[t] = [];
    const alle = [];
    const innen = {};
    for (const t of TEILE) innen[t] = [0, 0];
    for (const p of FA) {
        const v = SB.V(p.x[0], p.x[1], p.x[2]);
        const d = mm(Math.abs(v));
        je[p.teil].push(d);
        alle.push(d);
        if (d > 1) innen[p.teil][v < 0 ? 0 : 1]++;
    }
    for (const p of FB) {
        const d = mm(Math.abs(SA.V(p.x[0], p.x[1], p.x[2])));
        je[p.teil].push(d);
        alle.push(d);
    }
    return { gesamt: stat(alle), je: Object.fromEntries(TEILE.map((t) => [t, stat(je[t])])), nA: FA.length, nB: FB.length, innen };
}

// ════════════════════════ (1a) TREUE der sichtbaren Fläche ════════════════════════
log("\n## (1) TREUE — der EINE Baum gegen die Güsse von main (Ruhe-Pose, Gattungs-Dials)");
const SIGMA = 0.02; // Punkt-Abstand × H (gewählt; Wolf 16 mm — die Punkte liegen per Newton AUF der Fläche, das Raster bestimmt nur die Dichte)
const treue = {};
const S_MAIN = {},
    S_EIN = {},
    B_MAIN = {},
    B_EIN = {};
log("### 1a sichtbare L0-Fläche (Haut-Feld mit Verrundung ∪ starre Primitive), beidseitig; Soll je Teil p95 ≤ 5 / max ≤ 20 mm");
for (const art of ARTEN) {
    const ta = Date.now();
    setW(einsW(art));
    B_MAIN[art] = baum(KM, dialsVon(KM, art));
    B_EIN[art] = baum(KN, dialsVon(KN, art));
    S_MAIN[art] = sichtbar(B_MAIN[art]);
    S_EIN[art] = sichtbar(B_EIN[art]);
    const r = vergleich(S_MAIN[art], S_EIN[art], SIGMA);
    treue[art] = r;
    const fail = TEILE.filter((t) => r.je[t].n && (r.je[t].p95 > 5 || r.je[t].max > 20));
    log(`  ${art.padEnd(5)} Meshes main ${B_MAIN[art].meshes} → EIN ${B_EIN[art].meshes} · Hals ${B_MAIN[art].B.neckSegs.length}→${B_EIN[art].B.neckSegs.length} · Rute ${B_MAIN[art].B.tailSegs.length}→${B_EIN[art].B.tailSegs.length} · Punkte ${r.nA}/${r.nB} · GESAMT ${fmt(r.gesamt)}   [${Date.now() - ta} ms]`);
    log(`        ${TEILE.map((t) => `${t} ${f1(r.je[t].p95)}/${f1(r.je[t].max)}`).join(" · ")}   → ${fail.length ? "ÜBER dem Soll: " + fail.join(", ") : "alle Teile im Soll"}`);
    log(`        Vorzeichen (main-Punkte > 1 mm neben EIN): ${["hals", "rute", "ohr"].map((t) => `${t} ${r.innen[t][0]} innen / ${r.innen[t][1]} außen`).join(" · ")}   (innen = der EIN-Leib ist dort DICKER)`);
}
setW(null);
// Boden der Methode: main gegen main selbst (zweimal gebaut) — muss 0 sein
{
    const b2 = baum(KM, dialsVon(KM, "wolf"));
    const r = vergleich(S_MAIN.wolf, sichtbar(b2), 0.05);
    log(`  Boden: main-Wolf gegen main-Wolf ${fmt(r.gesamt)}`);
}

// ════════════════════════ (1b) der Refit der Vorlage (L1, der Weg des Menschen) gegen main ════════════════════════
// wie spike/leibraum.cjs: Stufe-1-Primitive, der Rahmen trägt den Radius (Mi/r, r = 1), Paarung über den Baum-Platz
function primsL1(b) {
    const sb = b.K.sb,
        TH = sb.TIER_HAUT;
    let vox = TH.voxFern * b.H;
    const blend = TH.blend * b.H;
    let P = sb.__tierPrims(b.root, b.root, () => true, vox, blend, b.gelenkVon);
    let feld = sb.__tierFeld(P, vox, blend);
    const dr = 2 * sb.__tierKanten(feld.f, feld.nx, feld.ny, feld.nz);
    if (dr > TH.dreieckeFern) {
        vox *= Math.sqrt(dr / TH.dreieckeFern);
        P = sb.__tierPrims(b.root, b.root, () => true, vox, blend, b.gelenkVon);
        feld = sb.__tierFeld(P, vox, blend);
    }
    for (const p of P) {
        p.blend = blend;
        const M = Float64Array.from(p.Mi);
        for (let col = 0; col < 4; col++) for (let row = 0; row < 3; row++) M[col * 4 + row] /= p.r;
        p.Mi = M;
        p.r = 1;
    }
    const platz = new Map();
    let i = 0;
    b.root.traverse((o) => platz.set(o, i++));
    for (const p of P) p.ti = platz.get(p.node);
    return { P, vox, blend, feld };
}
const SCHRITT = 3;
function vorlage(K, art, ov) {
    const b = baum(K, dialsVon(K, art, ov));
    const pr = primsL1(b);
    const F = pr.feld;
    const sn = K.sb.__koerperCore.surfaceNets(F.f, F.nx, F.ny, F.nz, 0, F.lo[0], F.lo[1], F.lo[2], pr.vox);
    const vs = sn.verts.filter((_, i) => i % SCHRITT === 0);
    const V = new Float64Array(vs.length * 3);
    vs.forEach((v, i) => V.set(v, i * 3));
    return { b, pr, V, n: vs.length };
}
// Refit der Vorlage T (EIN-Baum) auf den EIN-Leib mit w und Dials; Lage normiert (/H)
function refitEIN(Tv, w, dials) {
    setW(w);
    const b = baum(KN, dials);
    const pr = primsL1(b);
    const W = KN.sb.__leibRaumRefit(Tv.V, Tv.pr.P, pr.P, pr.vox);
    const t1 = new Set(pr.P.map((p) => p.ti));
    const fehlt = Tv.pr.P.filter((p) => !t1.has(p.ti)).length;
    const N = new Float64Array(W.length);
    for (let i = 0; i < W.length; i++) N[i] = W[i] / b.H;
    return { N, b, pr, fehlt };
}
const feldAbstand = (X, H, P, vox, sb) => {
    const out = new Float64Array(X.length / 3);
    for (let i = 0; i < out.length; i++) out[i] = mm(Math.abs(sb.__leibRaumFeld(P, vox, X[i * 3] * H, X[i * 3 + 1] * H, X[i * 3 + 2] * H)));
    return out;
};
log(`  [Zeit 1a: ${Date.now() - t0} ms]`);
if (NUR_TREUE) process.exit(0);
log("### 1b Refit der EIN-Vorlage Wolf (L1) auf den EIN-Leib der Gattung, gemessen am Feld des main-Gusses derselben Gattung");
setW(einsW("wolf"));
const WV = vorlage(KN, "wolf");
const W0N = refitEIN(WV, einsW("wolf"), dialsVon(KN, "wolf")).N;
log(`  Vorlage EIN-Wolf: ${WV.n} Ecken, ${WV.pr.P.length} Primitive (L1)`);
const MAIN_L1 = {};
for (const art of ARTEN) {
    const r = refitEIN(WV, einsW(art), dialsVon(KN, art));
    const mb = baum(KM, dialsVon(KM, art));
    const mp = primsL1(mb);
    MAIN_L1[art] = { b: mb, pr: mp };
    const gegenMain = stat(feldAbstand(r.N, r.b.H, mp.P, mp.vox, KM.sb));
    const gegenSelbst = stat(feldAbstand(r.N, r.b.H, r.pr.P, r.pr.vox, KN.sb));
    log(`  ${art.padEnd(5)} Paarung Baum (Primitive der Vorlage ohne Partner im Ziel: ${r.fehlt}) · Refit → eigene Fläche ${fmt(gegenSelbst)} · → Fläche des main-Gusses ${fmt(gegenMain)}`);
}
log(`  [Zeit bis 1b: ${Date.now() - t0} ms]`);
// ════════════════════════ (2) MISCHUNG auf den stetigen Achsen ════════════════════════
log("\n## (2) MISCHUNG Wolf → Bär, Wolf → Hirsch (w und Dials linear in t; huf, ohrSpitz, Ohr-Lage folgen w)");
log("### 2a Haut: L1-Formziele am Refit, zwei Knoten (0, 1) und drei Knoten (0, ½, 1) gegen den echten Refit am Punkt t (sichtbar = |Feld des echten Leibs|)");
const mischW = (a, z, t) => Object.fromEntries(ARTEN.map((x) => [x, (x === a ? 1 - t : 0) + (x === z ? t : 0)]));
const MISCH = {},
    HALB_WEG = {};
const tM = Date.now();
for (const nach of ["bear", "deer"]) {
    const R = {};
    for (const t of [0.25, 0.5, 0.75, 1]) R[t] = refitEIN(WV, mischW("wolf", nach, t), lerpDials("wolf", nach, t));
    const Z1 = R[1].N.map((x, i) => x - W0N[i]),
        Zh = R[0.5].N.map((x, i) => x - W0N[i]);
    {
        const Hh = R[0.5].b.H;
        const weg = (A, B) => stat(Array.from({ length: A.length / 3 }, (_, i) => mm(Math.hypot(A[i * 3] - B[i * 3], A[i * 3 + 1] - B[i * 3 + 1], A[i * 3 + 2] - B[i * 3 + 2]) * Hh)));
        HALB_WEG[nach] = { zuA: weg(R[0.5].N, W0N), zuB: weg(R[0.5].N, R[1].N) };
    }
    MISCH[nach] = {};
    for (const t of [0.25, 0.5, 0.75]) {
        const e = R[t];
        const lin2 = W0N.map((x, i) => x + t * Z1[i]);
        const lin3 = W0N.map((x, i) => (t <= 0.5 ? x + (t / 0.5) * Zh[i] : x + Zh[i] + ((t - 0.5) / 0.5) * (Z1[i] - Zh[i])));
        const s2 = stat(feldAbstand(lin2, e.b.H, e.pr.P, e.pr.vox, KN.sb));
        const s3 = stat(feldAbstand(lin3, e.b.H, e.pr.P, e.pr.vox, KN.sb));
        MISCH[nach][t] = { s2, s3 };
        log(`  Wolf → ${nach === "bear" ? "Bär   " : "Hirsch"} t = ${t}: zwei Knoten ${fmt(s2)} · drei Knoten ${t === 0.5 ? "(Knoten selbst) 0" : fmt(s3)}`);
    }
}
// 2b die starren Teile (Ohr-Scheiben, Fuß-Primitive): je Primitiv feste Punkte der Einheits-Fläche, ihre Lage linear zwischen den
// Knoten gemischt (wie die Tafel es täte) gegen die sichtbare Fläche des echten Leibs am Punkt t; gezählt nur Punkte, die am echten
// Leib außen liegen (nicht in einem anderen Primitiv verdeckt)
log("### 2b starre Teile (Ohr, Pfote): Primitiv-Punkte linear gemischt gegen die sichtbare Fläche des echten Leibs bei t");
function starrePunkte(b, teile) {
    // je Primitiv der Teile: Punkte auf der Einheitsfläche (fester Satz), in Wurzel-Koordinaten
    const T = b.K.T;
    const inv = new T.Matrix4().copy(b.root.matrixWorld).invert();
    const out = [];
    let idx = 0;
    b.root.traverse((node) => {
        if (!node.isMesh) return;
        const i = idx++;
        if (!teile.includes(b.teil(node))) return;
        const gp = node.geometry.parameters;
        const M = new T.Matrix4().multiplyMatrices(inv, node.matrixWorld).elements;
        const zyl = node.geometry.type === "CylinderGeometry";
        const loc = [];
        const n = 40,
            g = Math.PI * (3 - Math.sqrt(5));
        for (let k = 0; k < n; k++) {
            const yy = 1 - (2 * (k + 0.5)) / n,
                rr = Math.sqrt(1 - yy * yy),
                th = g * k;
            if (!zyl) loc.push([gp.radius * rr * Math.cos(th), gp.radius * yy, gp.radius * rr * Math.sin(th)]);
            else {
                const rad = gp.radiusBottom + ((gp.radiusTop - gp.radiusBottom) * (yy + 1)) / 2;
                loc.push([rad * Math.cos(th), (yy * gp.height) / 2, rad * Math.sin(th)]);
            }
        }
        out.push({ i, pts: loc.map((q) => [M[0] * q[0] + M[4] * q[1] + M[8] * q[2] + M[12], M[1] * q[0] + M[5] * q[1] + M[9] * q[2] + M[13], M[2] * q[0] + M[6] * q[1] + M[10] * q[2] + M[14]].map((v) => v / b.H)) });
    });
    return out;
}
const STARR = {};
for (const nach of ["bear", "deer"]) {
    const knot = {};
    const leib = {};
    for (const t of [0, 0.25, 0.5, 0.75, 1]) {
        setW(mischW("wolf", nach, t));
        const b = baum(KN, lerpDials("wolf", nach, t));
        knot[t] = starrePunkte(b, ["ohr", "pfote"]);
        if (t > 0 && t < 1) leib[t] = sichtbar(b);
    }
    STARR[nach] = {};
    for (const t of [0.25, 0.5, 0.75]) {
        const S = leib[t],
            H = S.H;
        const d2 = [],
            d3 = [];
        knot[t].forEach((pr, j) => {
            pr.pts.forEach((x, k) => {
                const wahr = x.map((v) => v * H);
                // verdeckt am echten Leib? (der Punkt des echten Primitivs liegt in einem anderen)
                const other = S.V(wahr[0], wahr[1], wahr[2]);
                if (other < -0.002 * H) return;
                const a = knot[0][j].pts[k],
                    z = knot[1][j].pts[k],
                    m = knot[0.5][j].pts[k];
                const l2 = a.map((v, c) => (v + t * (z[c] - v)) * H);
                const l3 = a.map((v, c) => (t <= 0.5 ? v + (t / 0.5) * (m[c] - v) : m[c] + ((t - 0.5) / 0.5) * (z[c] - m[c])) * H);
                d2.push(mm(Math.abs(S.V(l2[0], l2[1], l2[2]))));
                d3.push(mm(Math.abs(S.V(l3[0], l3[1], l3[2]))));
            });
        });
        STARR[nach][t] = { s2: stat(d2), s3: stat(d3) };
        log(`  Wolf → ${nach === "bear" ? "Bär   " : "Hirsch"} t = ${t}: Ohr+Pfote zwei Knoten ${fmt(stat(d2))} · drei Knoten ${t === 0.5 ? "(Knoten selbst) 0" : fmt(stat(d3))}   (${d2.length} Punkte)`);
    }
}
setW(null);
log(`  [Zeit bis 2: ${Date.now() - t0} ms]`);
// ════════════════════════ (3) die HALB-FORMEN ════════════════════════
log("\n## (3) HALB-FORM — Zusammenhang, Durchdringen der Glieder, Fuß auf dem Boden (Ruhe-Pose)");
// Zusammenhang: Primitive verbunden, wenn ein Flächen-Punkt des einen im anderen liegt (Toleranz 0,004 H); Komponenten der Vereinigung
function pruefeLeib(S) {
    const H = S.H,
        tol = 0.004 * H;
    const alleG = baueGitter(S.alle, H);
    const eltern = S.alle.map((_, i) => i);
    const finde = (i) => (eltern[i] === i ? i : (eltern[i] = finde(eltern[i])));
    const punkte = S.alle.map((p) => flaechenPunkte(p, 0.012 * H));
    S.alle.forEach((p, i) => {
        for (const x of punkte[i]) {
            const l = alleG.g.get(Math.floor(x[0] / alleG.C) + "," + Math.floor(x[1] / alleG.C) + "," + Math.floor(x[2] / alleG.C)) || [];
            for (const q of l) {
                if (q === p) continue;
                if (finde(q.i) === finde(i)) continue;
                if (primAbstand(q, x[0], x[1], x[2]) <= tol) eltern[finde(q.i)] = finde(i);
            }
        }
    });
    const komp = new Map();
    S.alle.forEach((p, i) => {
        const r = finde(i);
        (komp.get(r) || komp.set(r, []).get(r)).push(p);
    });
    const liste = [...komp.values()].sort((a, b) => b.length - a.length);
    const lose = liste.slice(1).map((k) => `${k[0].teil}:${k[0].kl}×${k.length}`);
    // Durchdringen: Tiefe der Punkte von Gruppe A in der harten Vereinigung von Gruppe B
    const gr = (g) => S.alle.filter((p) => p.gruppe === g);
    const tiefe = (ga, gb) => {
        const B = gr(gb);
        let t = 0;
        gr(ga).forEach((p) => {
            for (const x of punkte[p.i]) {
                let d = Infinity;
                for (const q of B) d = Math.min(d, primAbstand(q, x[0], x[1], x[2]));
                if (-d > t) t = -d;
            }
        });
        return mm(t);
    };
    const paare = [["FL", "FR"], ["HL", "HR"], ["FL", "HL"], ["FR", "HR"], ["KOPF", "FL"], ["KOPF", "FR"], ["RUTE", "HL"], ["RUTE", "HR"]];
    const durch = Object.fromEntries(paare.map(([a, b]) => [a + "|" + b, Math.max(tiefe(a, b), tiefe(b, a))]));
    const selbsttest = tiefe("KOPF", "LEIB"); // gewollt > 0: der Kopf sitzt im Hals-Ansatz — misst die Probe überhaupt?
    // Fuß auf dem Boden: tiefster Punkt je Pfote (alle Primitive der Pfoten-Gruppe), in mm über y = 0
    const boden = {};
    S.alle.forEach((p) => {
        if (!p.pfote) return;
        for (const x of punkte[p.i]) boden[p.pfote] = Math.min(boden[p.pfote] ?? Infinity, x[1]);
    });
    let tiefstAlles = Infinity;
    S.alle.forEach((p) => {
        for (const x of punkte[p.i]) tiefstAlles = Math.min(tiefstAlles, x[1]);
    });
    return { komp: liste.length, lose, durch, selbsttest, boden: Object.fromEntries(Object.entries(boden).map(([k, v]) => [k, mm(v)])), tiefst: mm(tiefstAlles) };
}
const zeigeLeib = (name, r) =>
    log(
        `  ${name.padEnd(22)} Komponenten ${r.komp}${r.lose.length ? " (lose: " + r.lose.slice(0, 6).join(", ") + (r.lose.length > 6 ? " …" : "") + ")" : ""} · Durchdringen max ${f1(Math.max(...Object.values(r.durch)))} mm [${Object.entries(r.durch)
            .filter(([, v]) => v > 0.05)
            .map(([k, v]) => `${k} ${f1(v)}`)
            .join(", ") || "—"}] · Pfote tiefster Punkt ${Object.values(r.boden).map(f1).join("/")} mm · Selbsttest Kopf|Leib ${f1(r.selbsttest)} mm`
    );
const HALB = {};
for (const art of ["wolf", "bear", "deer"]) {
    HALB["main." + art] = pruefeLeib(S_MAIN[art]);
    zeigeLeib("main " + art, HALB["main." + art]);
}
for (const art of ["wolf", "bear", "deer"]) {
    HALB["EIN." + art] = pruefeLeib(S_EIN[art]);
    zeigeLeib("EIN " + art, HALB["EIN." + art]);
}
for (const nach of ["deer", "bear"]) {
    setW(mischW("wolf", nach, 0.5));
    const b = baum(KN, lerpDials("wolf", nach, 0.5));
    const S = sichtbar(b);
    HALB["halb." + nach] = pruefeLeib(S);
    const P = KN.TC.deriveTierParams(lerpDials("wolf", nach, 0.5));
    const A = KN.TC.artGestalt(P);
    zeigeLeib(`HALB Wolf|${nach === "deer" ? "Hirsch" : "Bär"}`, HALB["halb." + nach]);
    log(`        Hals-Winkel ${P.neckAng.toFixed(1)}° (Wolf ${KM.TC.deriveTierParams(KM.TC.GATTUNGEN.wolf).neckAng.toFixed(1)}°, ${nach} ${KM.TC.deriveTierParams(KM.TC.GATTUNGEN[nach]).neckAng.toFixed(1)}°) · huf ${A.bein.huf.toFixed(2)} · ohrSpitz ${A.kopf.ohrSpitz.toFixed(2)} · Rute segs ${A.schwanz.segs.toFixed(2)} · Gelenk-Winkel der Ruhe = STAND_POSE (art-unabhängig, tetrapoda-core.js:65)`);
    const g = HALB_WEG[nach];
    log(`        eigene Gestalt: Weg der Ecken (Form, normiert auf H der Halb-Form) zum Wolf p50 ${f1(g.zuA.p50)} · p95 ${f1(g.zuA.p95)} mm, zum ${nach} p50 ${f1(g.zuB.p50)} · p95 ${f1(g.zuB.p95)} mm`);
}
setW(null);
log(`  [Zeit bis 3: ${Date.now() - t0} ms]`);
// ════════════════════════ (4) PREIS ════════════════════════
log("\n## (4) PREIS — aus dem echten Ofen (BAKERS_BY_KIND.kreatur) beider Kerne");
function guss(K, art, lod) {
    const ta = Date.now();
    const g = K.sb.BAKERS_BY_KIND.kreatur(K.TC, art, 0, lod, null);
    const st = { ms: Date.now() - ta, meshes: 0, ecken: 0, tris: 0, haut: 0, starrEcken: 0 };
    g.traverse((o) => {
        if (!o.isMesh) return;
        st.meshes++;
        const n = o.geometry.attributes.position.count,
            ix = o.geometry.index ? o.geometry.index.count : n;
        st.ecken += n;
        st.tris += ix / 3;
        if (o.material.userData.__klasse === "fell" && o.geometry.attributes.skinWeight && n > 500) st.haut += n;
        else if (o.material.userData.__klasse !== "fellSchale") st.starrEcken += n;
    });
    return st;
}
const PREIS = {};
for (const art of ARTEN) {
    setW(einsW(art));
    const m1 = guss(KM, art, 1),
        n1 = guss(KN, art, 1);
    PREIS[art] = { m1, n1 };
    log(`  ${art.padEnd(5)} L1: Gelenk-Teile ${m1.meshes} → ${n1.meshes} · Ecken ${m1.ecken} → ${n1.ecken} · Dreiecke ${Math.round(m1.tris)} → ${Math.round(n1.tris)} · Guss ${m1.ms} → ${n1.ms} ms`);
}
for (const art of ["deer"]) {
    setW(einsW(art));
    const m0 = guss(KM, art, 0),
        n0 = guss(KN, art, 0);
    PREIS[art].m0 = m0;
    PREIS[art].n0 = n0;
    log(`  ${art.padEnd(5)} L0: Gelenk-Teile ${m0.meshes} → ${n0.meshes} · Ecken ${m0.ecken} → ${n0.ecken} (Haut ${m0.haut} → ${n0.haut}, starr ${m0.starrEcken} → ${n0.starrEcken}) · Dreiecke ${Math.round(m0.tris)} → ${Math.round(n0.tris)} · Guss ${m0.ms} → ${n0.ms} ms`);
}
setW(null);
{
    const KNOT = 24,
        B = 8; // Halb-Float RGBA je Knoten und Ecke (wie spike/leibraum.cjs, _gangZielTafel)
    const mb = (n) => (n * KNOT * B) / 1e6;
    const tafel = (p) => mb(p.n0.haut + p.n0.starrEcken + p.n1.ecken);
    const tm = (p) => mb(p.m0.haut + p.m0.starrEcken + p.m1.ecken);
    log(`  Tafel je Bauplan (24 Knoten × 8 B je Ecke, L0-Haut + L0-starr + L1, am Hirsch = der Leib mit den meisten verdeckten Primitiven): main ${tm(PREIS.deer).toFixed(2)} → EIN ${tafel(PREIS.deer).toFixed(2)} MB`);
    log(`  Vorlagen für die 4 Wurzeln: Baum mit fester Gliederzahl ohne stetige Wörter 3 (hund · bär · hirsch, erste Runde) → EIN 1; Tafel-Summe ≈ ${(3 * tm(PREIS.deer)).toFixed(2)} → ${tafel(PREIS.deer).toFixed(2)} MB`);
}
log(`  [Zeit bis 4: ${Date.now() - t0} ms]`);
// ════════════════════════ (5) REICHWEITE ════════════════════════
log("\n## (5) REICHWEITE — derselbe Baum an vier Punkten außerhalb der Wurzeln (Werte gewählt, unsicher; size = Widerrist in E = 1/3 m)");
const PUNKTE = {
    hase: { w: einsW("fox"), d: { size: 0.85, neck: 0.2, leg: 0.26, diet: 0, build: 0.2 }, a: { kopf: { ohrH: 0.4, ohrB: 0.05, ohrSpitz: 0.3 }, schwanz: { segs: 1.5, segL: 0.03, wurzel: 0.04, mitte: 0.045, spitze: 0.03 } } },
    pferd: { w: einsW("deer"), d: { size: 4.8, neck: 0.36, leg: 0.3, diet: 0, build: 0.35 }, a: { bein: { huf: 1, spreiz: 0 }, kopf: { ohrH: 0.09, ohrB: 0.03, ohrSpitz: 0.8 } } },
    maus: { w: einsW("fox"), d: { size: 0.12, neck: 0.15, leg: 0.16, diet: 0.3, build: 0.3 }, a: { kopf: { ohrH: 0.14, ohrB: 0.08, ohrSpitz: 0, ohrCy: 0.55, ohrAy: 1, ohrAx: 1, ohrAz: 0.02 }, schwanz: { segs: 10, segL: 0.09, wurzel: 0.012, mitte: 0.012, spitze: 0.006 } } },
    elefant: { w: einsW("bear"), d: { size: 9, neck: 0.1, leg: 0.32, diet: 0, build: 0.8 }, a: { kopf: { ohrH: 0.45, ohrB: 0.35, ohrSpitz: 0, ohrCy: 0.5, ohrAy: 0.5, ohrAx: 1, ohrAz: 0.01 }, schwanz: { segs: 6, segL: 0.05, wurzel: 0.012, mitte: 0.01, spitze: 0.006 } } },
};
const REICH = {};
for (const [name, p] of Object.entries(PUNKTE)) {
    setW(p.w);
    setA(p.a);
    let r;
    try {
        const b = baum(KN, p.d);
        let endlich = true;
        b.root.traverse((o) => {
            if (o.isMesh && !o.matrixWorld.elements.every(Number.isFinite)) endlich = false;
        });
        const S = sichtbar(b);
        const pr = pruefeLeib(S);
        // Ketten-Lücke: Abstand aufeinander folgender Glieder ÷ Summe ihrer Radien (> 1 = Perlenkette mit Lücke)
        const kette = (segs) => {
            let m = 0;
            const wp = (n) => {
                const v = new b.K.T.Vector3();
                return n.children[0] ? n.children[0].getWorldPosition(v) : n.getWorldPosition(v);
            };
            for (let i = 1; i < segs.length; i++) {
                const a = wp(segs[i - 1]),
                    c = wp(segs[i]);
                const ra = segs[i - 1].children[0] ? segs[i - 1].children[0].geometry.parameters.radius : 0,
                    rc = segs[i].children[0] ? segs[i].children[0].geometry.parameters.radius : 0;
                m = Math.max(m, a.distanceTo(c) / (ra + rc || 1e-9));
            }
            return m;
        };
        r = { endlich, meshes: b.meshes, H: b.H, pr, rute: kette(b.B.tailSegs), hals: kette(b.B.neckSegs) };
        REICH[name] = r;
        zeigeLeib(name, pr);
        log(`        baut: ${endlich ? "ja" : "NaN"} · Meshes ${b.meshes} · Widerrist ${(b.H * MJE).toFixed(2)} m · Glied-Abstand ÷ Radien-Summe Rute ${r.rute.toFixed(2)} · Hals ${r.hals.toFixed(2)}${r.rute > 1 ? " → RUTE ZERFÄLLT (Lücke)" : ""}`);
    } catch (e) {
        REICH[name] = { fehler: String(e.message || e) };
        log(`  ${name}: BRICHT — ${e.message}`);
    }
}
setW(null);
setA(null);

// ════════════════════════ Zusammenfassung ════════════════════════
log("\n## URTEIL");
const ueber = [];
for (const art of ARTEN) for (const t of TEILE) {
    const s = treue[art].je[t];
    if (s.n && (s.p95 > 5 || s.max > 20)) ueber.push(`${art}.${t} ${f1(s.p95)}/${f1(s.max)}`);
}
const rumpfBein = ueber.filter((x) => /\.(rumpf|bein)\b/.test(x));
log(`  (1) Teile über p95 5 / max 20 mm: ${ueber.length ? ueber.join(" · ") : "keine"}`);
log(`  Falsifikation Rumpf/Bein max > 20 mm: ${rumpfBein.length ? "EINGETRETEN (" + rumpfBein.join(", ") + ")" : "nicht eingetreten"}`);
const halbDurch = ["halb.deer", "halb.bear"].map((k) => Math.max(...Object.values(HALB[k].durch)) - Math.max(...Object.values(HALB["main.wolf"].durch), ...Object.values(HALB[k === "halb.deer" ? "main.deer" : "main.bear"].durch)));
log(`  Falsifikation Halb-Form durchdringt über die Eltern hinaus: Wolf|Hirsch ${f1(halbDurch[0])} mm · Wolf|Bär ${f1(halbDurch[1])} mm über dem größeren Eltern-Wert`);
log(`\n# Laufzeit ${Date.now() - t0} ms`);
