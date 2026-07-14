// diag-membran-gesetz.cjs — DIE MEMBRAN ALS GESETZ (V18.464, W9-Muster).
// Beweist in drei Wänden, dass die Portal-Passage EINE Zahlen-Quelle hat:
//
//   1. ZWILLINGS-WAND: porta-core.MEMBRAN_GESETZ trägt EXAKT die eingefrorenen
//      Alt-Literale der Lab-Shell (worlds/portale/porta.js buildMembrane,
//      Stand V18.463 — hier als Fingerabdruck-Tabelle hart kodiert). Drift
//      in eine Richtung = ROT (wer das Gesetz ändert, ändert bewusst BEIDE
//      Leser + diese Wand — ein Vertrags-Akt, kein Drift).
//   2. ABLEITUNGS-WAND: membranUniforms(p) == die alten Inline-Formeln der
//      Shell (hier verbatim nachgerechnet aus deriveGate) für alle 7 Presets
//      UND einen deterministischen Dial-Fächer (mulberry32-Strom).
//   3. KONSUM-WAND: die Shell LIEST das Gesetz (MEMBRAN_GESETZ/membranUniforms/
//      GN-Injektion vorhanden; die kritischen Alt-Literale [13.8-Wellenzahl
//      etc.] stehen NICHT mehr roh im Shell-Text) UND der Stamm-Leser
//      (anazhRealm.js) konsumiert dieselben Flächen.
//
//   node scripts/diag-membran-gesetz.cjs
"use strict";
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
global.THREE = require(path.join(root, "worlds/terrain/lib/three-r128.min.js"));
require(path.join(root, "porta-core.js"));
const PC = globalThis.__portaCore;

const errs = [];
function check(name, ok, detail) {
    console.log(`  ${ok ? "✅" : "❌"} ${name}${detail ? " — " + detail : ""}`);
    if (!ok) errs.push(name);
}
function eq(a, b, tol) {
    if (Array.isArray(a) && Array.isArray(b))
        return a.length === b.length && a.every((v, i) => eq(v, b[i], tol));
    if (typeof a === "number" && typeof b === "number")
        return Math.abs(a - b) <= (tol || 0);
    return a === b;
}

console.log("— MEMBRAN-GESETZ (porta-core ⇄ Lab-Shell ⇄ Welt) —");

// ── Wand 1: die Zwillings-Tabelle (Alt-Literale V18.463, eingefroren) ──
const FROZEN = {
    profilW: 64,
    seg: 90,
    eps: 0.06,
    om: 3.0,
    kk: 13.8,
    refl: 0.72,
    damp: 0.7,
    twistK: 2.0,
    swirlR0: 0.25,
    pierce: [2.2, 6.0, 1.5],
    micro: [3.0, 0.3, 0.1],
    hGain: [0.55, 0.62],
    waveDepthK: [0.65, 0.35],
    waveDepthMin: 0.05,
    waveDepthZ: 0.1,
    stepK: [0.06, 0.2],
    rimAyK: 0.52,
    swirlK: 0.5,
    openK: [0.4, 0.6],
    centerK: 0.55,
    march: {
        steps: 12,
        t0: 0.04,
        depK: [1.6, 0.1],
        spK: [0.3, 0.6],
        lpK: 2.0,
        frqK: [1.0, 2.2],
        win: 0.4,
        winC: [0.0, 0.34, 0.67, 1.0],
        vCut: [0.1, 1.4],
        gDen: [2.2, 0.35],
        att: 0.9,
        wurm: [3.0, 2.0, 4.0, 0.15, 0.5],
        facet: [8.0, 9.0, 4.0, 1.5, 0.1],
        plasma: [0.7, 0.6, 0.2, 2.4, 3.5, 1.4, 0.5, 3.0, 1.25, 1.3, 0.08, 0.15],
        nebel: [1.0, 0.6, 0.7, 0.12, 2.2, 1.5, 1.3, 0.2, 2.0, 2.0, 1.0, 1.2, 0.18],
    },
    look: {
        star: [0.955, 95.0, 5.0, 0.42],
        skyK: [0.5, 0.5, 0.3],
        fresPow: 3.0,
        specDir: [0.4, 0.7, 0.6],
        specPow: 60.0,
        specCol: [1.0, 0.95, 0.85],
        specK: 1.5,
        core: [12.0, 0.5, 0.5, 0.7, 0.3, 1.4],
        corePal: 0.1,
        mixK: [1.35, 0.55, 1.5, 1.0],
        finalK: [1.4, 0.55, 0.55, 0.9, 0.13],
    },
    puls: 1.25,
    aktivDepth: [0.1, 0.85],
};
const MG = PC.MEMBRAN_GESETZ;
check("MEMBRAN_GESETZ existiert im Gesetzbuch", !!MG);
let drift = [];
(function walk(a, b, pfad) {
    for (const k of Object.keys(a)) {
        const va = a[k];
        const vb = b ? b[k] : undefined;
        if (va && typeof va === "object" && !Array.isArray(va)) walk(va, vb, pfad + k + ".");
        else if (!eq(vb, va, 0)) drift.push(`${pfad}${k}: Gesetz=${JSON.stringify(vb)} ≠ eingefroren=${JSON.stringify(va)}`);
    }
})(FROZEN, MG, "");
check("Zwillings-Wand: alle Gesetz-Zahlen == Alt-Literale", drift.length === 0, drift.slice(0, 4).join(" · "));

// ── Wand 2: membranUniforms == die alten Inline-Formeln der Shell ──
function altUniforms(p) {
    // VERBATIM die V18.463-Shell-Zeilen (buildMembrane Z.36–51) — die Referenz.
    const D = PC.deriveGate(p);
    // VERBATIM die V18.463-buildGate-Staffelung (Z.213–216) — zFace-Referenz.
    const frameDepth = Math.max(0.4, D.M * 0.7);
    const depthStep = frameDepth * 0.6 * (0.4 + p.depth);
    const ordersUser = Math.max(1, Math.round(p.orders));
    const orders = p.wLace > 0.03 ? Math.max(ordersUser, 1 + Math.ceil(1.0 / Math.max(0.18, depthStep))) : ordersUser;
    D.zFace = (orders - 1) * depthStep + 0.06;
    const clamp = PC.clamp;
    const left = D.leftSpringX,
        right = D.rightSpringX,
        apexY = D.apexY,
        baseY = D.baseY,
        springY = D.springY;
    const spanW = right - left,
        height = apexY - baseY;
    const W = 64;
    const profil = [];
    for (let i = 0; i < W; i++) {
        const xx = left + (spanW * i) / (W - 1);
        const ty = PC.interpTop(D.prof, xx) + springY;
        profil.push(clamp((ty - baseY) / Math.max(0.001, height), 0, 1));
    }
    return {
        left,
        spanW,
        height,
        midY: (baseY + apexY) / 2,
        springX: Math.max(Math.abs(left), Math.abs(right)),
        wave: clamp(p.wave, 0, 1),
        waveDepth: Math.max(0.05, D.zFace * 0.1),
        rimAx: Math.abs(D.leftSpringX),
        rimAy: (D.apexY - D.baseY) * 0.52,
        step: 0.06 + p.tunnel * 0.2,
        open: clamp(0.4 + p.energy * 0.6, 0, 1),
        centerY: baseY + D.jambH * 0.55,
        swirl: p.swirl * 0.5,
        profil,
        pal: PC.membranPalette(p),
    };
}
const FELDER = ["left", "spanW", "height", "midY", "springX", "wave", "waveDepth", "rimAx", "rimAy", "step", "open", "centerY", "swirl"];
let abl = [];
const faelle = Object.keys(PC.PRESETS).map((id) => ({ name: id, p: PC.gateParams(PC.PRESETS[id]) }));
// deterministischer Dial-Fächer (mulberry32 — kein Math.random)
const rng = PC.mulberry32(0xa11e);
for (let f = 0; f < 8; f++) {
    const s = {};
    PC.SLIDERS.forEach((row) => {
        if (row[1] === "h") return;
        s[row[0]] = row[2] + rng() * (row[3] - row[2]);
    });
    faelle.push({ name: `faecher${f}`, p: PC.gateParams({ s }) });
}
for (const fall of faelle) {
    const neu = PC.membranUniforms(fall.p);
    const alt = altUniforms(fall.p);
    for (const feld of FELDER)
        if (!eq(neu[feld], alt[feld], 0)) abl.push(`${fall.name}.${feld}: ${neu[feld]} ≠ ${alt[feld]}`);
    if (!eq(neu.profil, alt.profil, 0)) abl.push(`${fall.name}.profil weicht ab`);
    if (!eq(neu.pal.core, alt.pal.core, 0) || !eq(neu.pal.PD, alt.pal.PD, 0)) abl.push(`${fall.name}.pal weicht ab`);
}
check(`Ableitungs-Wand: membranUniforms == Alt-Formeln (${faelle.length} Fälle)`, abl.length === 0, abl.slice(0, 3).join(" · "));

// ── Wand 3: KONSUM (Shell + Stamm lesen das Gesetz; Alt-Literale sind raus) ──
const shell = fs.readFileSync(path.join(root, "worlds/portale/porta.js"), "utf8");
check("Shell liest MEMBRAN_GESETZ", shell.includes("MEMBRAN_GESETZ"));
check("Shell liest membranUniforms", shell.includes("membranUniforms"));
check("Shell injiziert per GN(", /GN\(MG\./.test(shell));
check("Shell: Wellenzahl 13.8 steht nicht mehr roh im Text", !/13\.8/.test(shell));
check("Shell: Puls 1.25 nur noch als Gesetz", !/Math\.sin\(t\s*\*\s*1\.25\)/.test(shell));
const stamm = fs.readFileSync(path.join(root, "anazhRealm.js"), "utf8");
check("Stamm konsumiert membranUniforms (Welt-Leser)", stamm.includes("membranUniforms"));
check("Stamm konsumiert MEMBRAN_GESETZ (Welt-Leser)", stamm.includes("MEMBRAN_GESETZ"));
const idx = fs.readFileSync(path.join(root, "index.html"), "utf8");
check("porta-core lädt main-seitig (mit ?v=-Buster)", /porta-core\.js\?v=/.test(idx));

// ── Selbst-Test: eine injizierte Drift MUSS rot erkannt werden ──
const kaputt = JSON.parse(JSON.stringify(FROZEN));
kaputt.kk = 14.0;
let selbst = [];
(function walk(a, b, pfad) {
    for (const k of Object.keys(a)) {
        const va = a[k];
        const vb = b ? b[k] : undefined;
        if (va && typeof va === "object" && !Array.isArray(va)) walk(va, vb, pfad + k + ".");
        else if (!eq(vb, va, 0)) selbst.push(pfad + k);
    }
})(kaputt, MG, "");
check("SELBST-TEST: injizierte kk-Drift wird erkannt", selbst.length === 1 && selbst[0] === "kk");

if (errs.length) {
    console.log(`\n❌ ROT — ${errs.length} Verletzung(en): ${errs.join(" · ")}`);
    process.exit(1);
}
console.log("\n✅ GRÜN — die Membran hat EINE Zahlen-Quelle: das Gesetzbuch trägt die eingefrorenen Shell-Zahlen, die Ableitung ist formel-identisch, Shell UND Welt konsumieren dieselben Flächen.");
