// diag-membran-gesetz.cjs — DIE MEMBRAN ALS GESETZ.
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
//   3. ABSENZ-WAND: die Alt-Literale der Shell [13.8-Wellenzahl, Puls 1.25,
//      der Nebel] stehen NICHT mehr roh im Shell-Text.
//
//   node scripts/diag-membran-gesetz.cjs
"use strict";
const stammLib = require("./lib/stamm.cjs");
const path = require("path");

const root = path.resolve(__dirname, "..");
global.THREE = require(path.join(root, "worlds/terrain/lib/three-r128.min.js"));
require(path.join(root, "porta-core.js"));
const PC = globalThis.__portaCore;

const { errs, check, wandEnde } = require("./lib/welt-boot.cjs").pruefer();
function eq(a, b, tol) {
    if (Array.isArray(a) && Array.isArray(b))
        return a.length === b.length && a.every((v, i) => eq(v, b[i], tol));
    if (typeof a === "number" && typeof b === "number")
        return Math.abs(a - b) <= (tol || 0);
    return a === b;
}

console.log("— MEMBRAN-GESETZ (porta-core ⇄ Lab-Shell ⇄ Welt) —");

// ── Wand 1: die Zwillings-Tabelle ──
const FROZEN = {
    profilW: 64,
    seg: 45, // 1310-3: von 90 (Vertex-Welle bildgleich bei 45, Genesis −47k Dreiecke, −1,0 ms GPU) — ein erklärter Akt
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
    // D8 (ein erklärter Vertrags-Akt): der 12-Schritt-March, die vier Innenwelt-Modi und der Look-Block fallen —
    // die Öffnung zeigt das Ziel-Panorama über die Stellvertreter-Kugel, darüber der Seifenfilm (Rand gezähmt)
    film: {
        kugel: 4.0,
        n: 1.33,
        brechung: 0.12,
        dicke: [0.3, 0.45, 0.22, 0.06, 0.37, 0.9],
        fresnel: [0.04, 5.0],
        rand: [0.6, 1.0, 0.3],
        basis: 0.24,
        gewichtMax: 0.55,
        act: [0.65, 0.35],
        glanz: [0.8, 0.9, 0.15],
        welle: [1.0, 1.22, 1.44],
        farbe: 2.6,
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
const fremd = Object.keys(MG || {}).filter((k) => !(k in FROZEN));
check("Zwillings-Wand: das Gesetz trägt kein Feld außerhalb der Tabelle (march/look fielen mit D8)", fremd.length === 0, fremd.join(", "));

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

// ── Wand 3: die Alt-Literale sind raus, über den EINEN Absenz-Helfer (den Konsum der Welt und das Laden des Kerns
// beweist gate:portal-membran am Verhalten, den ?v=-Buster gate:charakter-achsen V) ──
const shell = (re) => [stammLib.fehlt(null, re, { datei: "worlds/portale/porta.js" }), stammLib.fehlt.wo];
check("Shell: Wellenzahl 13.8 steht nicht mehr roh im Text", ...shell(/13\.8/));
check("Shell: Puls 1.25 nur noch als Gesetz", ...shell(/Math\.sin\(t\s*\*\s*1\.25\)/));
// DER NEBEL FIEL (D8): Kasten, Gesetz und Regler hält gate:altlasten beim Namen
check("porta-core: membranUniforms trägt kein fog", !("fog" in PC.membranUniforms(PC.gateParams(PC.PRESETS.kathedrale))));
check("Shell: buildFog ist fort", ...shell(/buildFog|fogMat/));

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

wandEnde(errs, "die Membran hat EINE Zahlen-Quelle: das Gesetzbuch trägt die eingefrorenen Zahlen (Welle + Film), die Ableitung ist formel-identisch, die Alt-Literale der Shell und der Nebel sind fort.");
