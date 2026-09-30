// DAS NEUE KLEID — DIE „EIN WUCHS"-PARITÄTS-LINSE (GPU-frei, reines Node, im check-Gate-Stil).
// Macht die ZWEI Wände explizit, damit kein künftiger Agent versucht, die zwei KONSUMENTEN
// (der Richter `_phytoGrowSkeleton`/anazhRealm.js UND die Foundry `growTreeNodes`/foundry-core.js)
// byte-gleich zu machen — das ist per Konstruktion unmöglich + wäre eine Regression.
//
// DER STAND (gemessen, Gesetz #0): der Baum-WUCHS ist bereits EINE Quelle. Beide Konsumenten
// rufen dieselbe reine Funktion `growSkeleton(P, seq)` aus phyto-core.js (`diag-phyto-core-parity`
// beweist Main==Worker byte-identisch; `gate:constitution` GESETZ 2 beweist, dass der alte
// ~275-Zeilen-Inline-Parallel-Wuchs in growTreeNodes geschnitten ist → er delegiert an
// `__core.growSkeleton`). ABER die zwei Konsumenten SPEISEN growSkeleton VERSCHIEDEN (by design):
//   • seq:  Richter = xorshift32 aus FNV-1a von `<species>|<seed>|…#phyto-growth`
//           (anazhRealm `_rollGenome().seq`); Foundry = mulberry32 aus `Math.floor(seed)>>>0`
//           (foundry-core `RNG = mulberry32(Math.floor(seed) >>> 0)`).
//   • P.countCap:   Richter 3600 (L0)  vs  Foundry 8800 (growSkeleton-Default).
//   • P.leafBudget: Richter 480 (L0)   vs  Foundry 20000 (L0, non-shrub).
//
// ZWEI WÄNDE:
//   (a) EIN WUCHS: growSkeleton(P, seq) ist DETERMINISTISCH — identisches P + identisch geseedeter
//       seq → byte-identische segs/leaves (zweimal gerufen, Distanz 0), über Arten × Seeds.
//   (b) DIE DISTANZ ALS ZAHL: dieselbe Wuchs-Funktion mit Richter-Eingang vs Foundry-Eingang
//       → verschiedene segs (Länge + Geometrie) → Distanz ≫ 0. Das beweist: EINE Funktion, zwei
//       Zwecke, kein Parallelpfad — die Konsumenten byte-gleich zu wollen wäre der Fehler.
"use strict";

const SELFTEST = process.argv.includes("--selftest");

// MAIN-Pfad: require() → der IIFE-Seiteneffekt setzt globalThis.__phytoCore (wie die Parität-Linse).
require("../phyto-core.js");
const core = globalThis.__phytoCore;

// ── DIE ZWEI KONSUMENTEN-STRÖME, JEDER SEINER QUELLE TREU ──
// Foundry-treu: mulberry32(Math.floor(n) >>> 0) — foundry-core.js `RNG` (Zeile ~2718).
function mulberry32(a) {
    return function () {
        a |= 0;
        a = (a + 0x6d2b79f5) | 0;
        let t = Math.imul(a ^ (a >>> 15), 1 | a);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}
const seqFromInt = (n) => mulberry32(Math.floor(n) >>> 0);

// Richter-treu: FNV-1a → xorshift32 — anazhRealm `_rollGenome().seq(name)` (Zeile ~53418).
function fnv1a(str) {
    let h = 2166136261;
    for (let i = 0; i < str.length; i++) {
        h ^= str.charCodeAt(i);
        h = Math.imul(h, 16777619);
    }
    return h >>> 0; // UNSIGNED — die EINE Vorzeichen-Wand
}
function seqFromStr(s) {
    let h = fnv1a(s) || 1;
    return () => {
        h ^= h << 13;
        h >>>= 0;
        h ^= h >> 17;
        h ^= h << 5;
        h >>>= 0;
        return h / 4294967296;
    };
}

// ── DIE P-PALETTE (aus diag-phyto-core-parity — gültige, im check-Gate erprobte Phänotyp-Vektoren) ──
const eiche = () => ({
    height: 9,
    slim: 0.42,
    apical: 0.32,
    trop: -0.1,
    delta: 2.3,
    leafD: 0.6,
    leafSize: 0.5,
    conifer: false,
    barkType: "smooth",
    maxDepth: 5,
    crownBase: 0.24,
    whorlSpacing: 0.12,
    coniferDroop: 0.05,
    basalStems: 0,
    windGain: 1,
});
const tanne = () =>
    Object.assign(eiche(), {
        height: 12,
        slim: 0.74,
        apical: 0.9,
        trop: 0.05,
        conifer: true,
        barkType: "conifer",
        maxDepth: 4,
        crownBase: 0.12,
        coniferDroop: 0.22,
    });
const weide = () => Object.assign(eiche(), { trop: 0.8, apical: 0.28, leafSize: 0.35 });
const strauch = () => Object.assign(eiche(), { basalStems: 5, height: 4 });
const arten = [
    ["eiche", eiche],
    ["tanne", tanne],
    ["weide", weide],
    ["strauch", strauch],
];

// Der RICHTER-Eingang (L0-Budgets aus anazhRealm.js ~51838) und der FOUNDRY-Eingang
// (growSkeleton-Default-countCap 8800 + L0-non-shrub-leafBudget 20000 aus foundry-core.js ~754).
const richterP = (mk) => Object.assign(mk(), { trunkMul: 1, countCap: 3600, leafBudget: 480 });
const foundryP = (mk) => Object.assign(mk(), { countCap: 8800, leafBudget: 20000 });
const richterKey = (name, seed) => `${name}|${seed}|v5#phyto-growth`;

// ── HELFER ──
// Voll-Signatur (Byte-Vergleich für Determinismus): die kompletten Arrays + trunkR.
const fullSig = (res) => JSON.stringify({ segs: res.segs, leaves: res.leaves, trunkR: res.trunkR });
// Skalar-Distanz zweier Ergebnisse: Längen-Delta (segs+leaves) + mittlere Geometrie-Divergenz
// über den gemeinsamen Präfix (beweist: nicht nur die Caps, auch der RNG-Strom divergiert).
function distScalar(rA, rB) {
    const segsD = Math.abs(rA.segs.length - rB.segs.length);
    const leavesD = Math.abs(rA.leaves.length - rB.leaves.length);
    const nseg = Math.min(rA.segs.length, rB.segs.length);
    let acc = 0;
    for (let i = 0; i < nseg; i++) {
        const a = rA.segs[i].p1,
            b = rB.segs[i].p1;
        acc += Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
    }
    const geo = nseg ? acc / nseg : 0;
    return { segsD, leavesD, geo, total: segsD + leavesD + geo };
}

let fails = 0;
const ok = (name, cond, detail) => {
    console.log((cond ? "  ✅ " : "  ⛔ ") + name + (detail ? " — " + detail : ""));
    if (!cond) fails++;
};

if (!core || typeof core.growSkeleton !== "function") {
    console.log("⛔ phyto-core.js exportiert kein growSkeleton — Linse kann nicht laufen.");
    process.exit(1);
}

// ── SELBST-TEST: beweist, dass BEIDE Prüfungen FEUERN (nicht vakuös grün) ──
if (SELFTEST) {
    console.log("=== SELBST-TEST — feuern die Wände? ===");
    const k = richterKey("eiche", 1);
    const a1 = core.growSkeleton(richterP(eiche), seqFromStr(k));
    const a2 = core.growSkeleton(richterP(eiche), seqFromStr(k)); // identisch geseedet
    const dSame = distScalar(a1, a2);
    ok("Determinismus-Wand: identisches P + identischer seq → Distanz 0", dSame.total === 0, "total=" + dSame.total);

    const bDiff = core.growSkeleton(richterP(eiche), seqFromStr(richterKey("eiche", 2))); // anderer Seed
    const dDiff = distScalar(a1, bDiff);
    ok(
        "Determinismus-Wand feuert: ANDERER seq-Seed → Distanz > 0 (fiele als 'nicht deterministisch' auf)",
        dDiff.total > 0,
        "total=" + dDiff.total.toFixed(3)
    );

    // Distanz-Wand (b): machte man die zwei Konsumenten IDENTISCH (gleiches P + gleicher seq),
    // wäre die Distanz 0 → der 'muss differieren'-Assert bräche → die Regression würde gefangen.
    const idA = core.growSkeleton(richterP(eiche), seqFromStr(k));
    const idB = core.growSkeleton(richterP(eiche), seqFromStr(k));
    const dId = distScalar(idA, idB);
    ok(
        "Distanz-Wand feuert: fälschlich vereinte Konsumenten → Distanz 0 (b-Assert bräche)",
        dId.total === 0,
        "total=" + dId.total
    );

    console.log(
        fails === 0
            ? "\n✅ SELBST-TEST GRÜN — beide Wände feuern nachweislich (identisch→0, verschieden→>0)."
            : "\n⛔ SELBST-TEST ROT — " + fails + " Erwartung(en) verfehlt."
    );
    process.exit(fails === 0 ? 0 : 1);
}

// ── (a) EIN WUCHS: growSkeleton ist DETERMINISTISCH über Arten × Seeds × beide RNG-Ströme ──
console.log("=== DAS NEUE KLEID — die 'EIN Wuchs'-Parität (growSkeleton eine Quelle, zwei Konsumenten) ===");
let detTested = 0,
    detFails = 0;
for (const [name, mk] of arten) {
    for (let s = 0; s < 6; s++) {
        const seed = 4242 + s * 131;
        // Richter-Strom (xorshift32 aus String)
        const r1 = core.growSkeleton(richterP(mk), seqFromStr(richterKey(name, seed)));
        const r2 = core.growSkeleton(richterP(mk), seqFromStr(richterKey(name, seed)));
        detTested++;
        if (fullSig(r1) !== fullSig(r2)) detFails++;
        // Foundry-Strom (mulberry32 aus Int)
        const f1 = core.growSkeleton(foundryP(mk), seqFromInt(seed));
        const f2 = core.growSkeleton(foundryP(mk), seqFromInt(seed));
        detTested++;
        if (fullSig(f1) !== fullSig(f2)) detFails++;
    }
}
ok(
    "growSkeleton DETERMINISTISCH (identisch P + seq → byte-identisch)",
    detFails === 0,
    detTested + " Läufe (Richter+Foundry-Strom), " + detFails + " nicht-deterministisch"
);

// ── (b) DIE DISTANZ ALS ZAHL: Richter-Eingang vs Foundry-Eingang → verschiedene segs (≫ 0) ──
let distTested = 0,
    distSame = 0,
    minTotal = Infinity,
    sumTotal = 0;
const sample = [];
for (const [name, mk] of arten) {
    for (let s = 0; s < 6; s++) {
        const seed = 4242 + s * 131;
        const rR = core.growSkeleton(richterP(mk), seqFromStr(richterKey(name, seed)));
        const rF = core.growSkeleton(foundryP(mk), seqFromInt(seed));
        const d = distScalar(rR, rF);
        distTested++;
        if (d.total <= 0) distSame++;
        if (d.total < minTotal) minTotal = d.total;
        sumTotal += d.total;
        if (s === 0)
            sample.push(
                "      " +
                    name.padEnd(8) +
                    " segs " +
                    rR.segs.length +
                    " vs " +
                    rF.segs.length +
                    " (Δ" +
                    d.segsD +
                    ") · leaves " +
                    rR.leaves.length +
                    " vs " +
                    rF.leaves.length +
                    " (Δ" +
                    d.leavesD +
                    ") · geoØ " +
                    d.geo.toFixed(3) +
                    " → Distanz " +
                    d.total.toFixed(2)
            );
    }
}
for (const line of sample) console.log(line);
ok(
    "Richter-Eingang ≠ Foundry-Eingang (die zwei Konsumenten differieren, by design)",
    distSame === 0,
    distTested + " Paare, min-Distanz " + minTotal.toFixed(2) + ", Ø-Distanz " + (sumTotal / distTested).toFixed(2)
);

console.log(
    fails === 0
        ? "\n✅ GRÜN — EIN Wuchs (growSkeleton deterministisch) + die zwei Konsumenten-Eingänge differieren dokumentiert (Ø-Distanz " +
              (sumTotal / distTested).toFixed(2) +
              "). Die Konsumenten byte-gleich zu wollen wäre die Regression."
        : "\n⛔ ROT — " + fails + " Verletzung(en)."
);
process.exit(fails === 0 ? 0 : 1);
