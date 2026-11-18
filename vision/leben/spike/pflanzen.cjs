// SPIKE „Pflanzenarten aus EINEM Merkmalsraum" (Sprosse leben.pflanzen.arten#2) — liest die Kerne des Repos (main 18058dba),
// schreibt nichts ins Repo. Lauf: node pflanzen.cjs [--alle]   (ohne: ~25 s, Holz = Skelett aller + jede 4. voll; --alle: jede der
// 100 Arten voll als Geometrie, gemessen 31–82 s je nach Last des Laptops)
// Kerne: phyto-core.js + foundry-core.js + foundry-bruecke.js im vm (wie scripts/lib/welt-boot.cjs fadenScope, dazu ein
// OffscreenCanvas-Stummel: der Blatt-Atlas wird gemalt, aber nicht gelesen — die Geometrie hängt nicht am Bild, foundry-core:2582),
// planet-core.js per require (module.exports).
"use strict";
const ROOT = "C:/Users/micha/AnazhRealm-profiband";
const fs = require("fs"), path = require("path");
const T0 = Date.now();
const ALLE = process.argv.includes("--alle");
const W = require(ROOT + "/scripts/lib/welt-boot.cjs");
const vm = W.vm;
const absorber = () => { const a = new Proxy(function () {}, { get: (_t, k) => (k === Symbol.toPrimitive ? () => 0 : a), apply: () => a, construct: () => a }); return a; };
const sb = { console: { log() {}, warn() {}, error() {} }, Math, performance: { now: () => Date.now() }, setTimeout, clearTimeout };
sb.self = sb.globalThis = sb.window = sb;
sb.THREE = W.ENGINE_THREE();
sb.OffscreenCanvas = function (w, h) {
    this.width = w; this.height = h;
    this.getContext = () => new Proxy({}, {
        get: (t, k) => (k === "createImageData" || k === "getImageData" ? (a, b, c, d) => ({ data: new Uint8ClampedArray((c || a) * (d || b) * 4) }) : k in t ? t[k] : () => absorber()),
        set: (t, k, v) => ((t[k] = v), true),
    });
};
vm.createContext(sb);
for (const f of ["phyto-core.js", "foundry-core.js", "foundry-bruecke.js"]) vm.runInContext(fs.readFileSync(path.join(ROOT, f), "utf8"), sb, { filename: f });
vm.runInContext("self.__K = { PRESETS, buildInstance, skelettDerGestalt, PRC: PORTAL_RENDER_CONFIG, welt: __weltSkalaArt }", sb);
const K = sb.__K, THREE = sb.THREE, PC = sb.__phytoCore;
const PL = require(ROOT + "/planet-core.js");
let WARN = null;
sb.console.warn = (...a) => { WARN = a.map(String).join(" ").slice(0, 160); };
try { K.buildInstance("eiche", 1, 0); } catch (e) {} // Start des Fadens: der erste Bau legt die Stoffe an (sonst „setting 'map'")
WARN = null;
const tLade = Date.now() - T0;

// ───────────────────────── Werkzeug ─────────────────────────
const mulberry = (a) => () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
const R = mulberry(20161); // Díaz 2016 — der EINE Strom des Spikes
const normal = (r) => Math.sqrt(-2 * Math.log(1 - r())) * Math.cos(2 * Math.PI * r());
const clamp = (x, a, b) => Math.max(a, Math.min(b, x)), lerp = (a, b, t) => a + (b - a) * t;
const sig = (x) => 1 / (1 + Math.exp(-x));
const f1 = (x, n = 1) => (Number.isFinite(x) ? x.toFixed(n) : String(x));
const pct = (a, p) => { const s = [...a].sort((x, y) => x - y); return s[Math.min(s.length - 1, Math.floor(p * (s.length - 1) + 0.5))]; };
const hsl = (hex) => { const c = new THREE.Color(hex), o = {}; c.getHSL(o); return o; };
const hexL = (hex, dl) => { const c = new THREE.Color(hex), o = {}; c.getHSL(o); c.setHSL(o.h, o.s, clamp(o.l + dl, 0.05, 0.9)); return c.getHex(); };
const rgbAbst = (a, b) => { const A = new THREE.Color(a), B = new THREE.Color(b); return Math.hypot(A.r - B.r, A.g - B.g, A.b - B.b) * 255; };
const out = (s = "") => console.log(s);

// ───────────────────────── (0) DER RAUM — Díaz et al. 2016 (Nature 529:167) ─────────────────────────
// Sechs Merkmale, log10. Mittel/Streuung: Größenordnung aus Díaz 2016 Abb. 1/ED (46 085 Arten, 2 214 vollständig) — UNSICHER (±0,1–0,2
// in log). Korrelationen: Moles 2005 (H–SM), Wright 2004 LES (LMA–Nmass), Chave 2009 (SSD), Wright 2017 (LA) — UNSICHER (±0,15).
const ACHSEN = ["H", "SM", "SSD", "LA", "LMA", "N"]; // m · mg · g/cm³ · mm² · g/m² · mg/g
const MU = [0.35, 0.5, -0.3, 3.0, 1.95, 1.3];
const SD = [0.8, 1.3, 0.15, 0.85, 0.22, 0.17];
const RK = [
    [1, 0.5, 0.3, 0.3, 0.15, -0.15],
    [0.5, 1, 0.15, 0.4, 0.1, -0.05],
    [0.3, 0.15, 1, -0.05, 0.3, -0.25],
    [0.3, 0.4, -0.05, 1, 0.05, 0.05],
    [0.15, 0.1, 0.3, 0.05, 1, -0.6],
    [-0.15, -0.05, -0.25, 0.05, -0.6, 1],
];
const chol = (A) => { const n = A.length, L = A.map(() => Array(n).fill(0)); for (let i = 0; i < n; i++) for (let j = 0; j <= i; j++) { let s = A[i][j]; for (let k = 0; k < j; k++) s -= L[i][k] * L[j][k]; if (i === j) { if (s <= 0) throw new Error("R nicht positiv definit"); L[i][i] = Math.sqrt(s); } else L[i][j] = s / L[j][j]; } return L; };
const LR = chol(RK);
const ziehe = (r) => { const n = ACHSEN.map(() => normal(r)); const z = LR.map((row) => row.reduce((s, v, k) => s + v * n[k], 0)); return z; };
const merkmal = (z) => { const o = { z }; ACHSEN.forEach((a, i) => (o[a] = Math.pow(10, MU[i] + SD[i] * z[i]))); return o; };

// ───────────────────────── (1) DAS GESETZ merkmal → Kern ─────────────────────────
// Bauplan (die WURZEL der Adresse artId(wurzel, pfad)): holzig ⇔ SSD ≥ 0,35 ∧ H ≥ 0,6 m; Baum ⇔ holzig ∧ H ≥ 5 m; Nadel ⇔ Baum ∧
// LA ≤ 60 mm² ∧ LMA ≥ 150 g/m²; Kraut: Gras ⇔ LA ≤ 400 ∧ H < 1,5 · Röhricht ⇔ H ≥ 1,5 · Farn ⇔ LA ≥ 5 000 · sonst Blume (Platzhalter,
// die Klade sagt es — Monokotyle sind im Díaz-Raum nicht getrennt).
function bauplan(m) {
    const holzig = m.SSD >= 0.35 && m.H >= 0.6;
    if (holzig) return m.H >= 5 ? (m.LA <= 60 && m.LMA >= 150 ? "nadel" : "laub") : "strauch";
    if (m.H >= 1.5) return "roehricht";
    if (m.LA <= 400) return "gras";
    if (m.LA >= 5000) return "farn";
    return "blume";
}
// Greenhill/McMahon: H_krit = 0,792·(E/w)^(1/3)·D^(2/3); E_grün = 22 GPa·SSD·0,65 (Niklas 1992, UNSICHER), w = SSD·1000·1,8·g (Frischholz).
// D = c·D_krit(H); c = 1,77 geeicht an der Fichte (H 26,2 m, SSD 0,38 → hd 70, PRESETS) — EINE Eichzahl.
const GREEN_C = 1.77;
const hdGreenhill = (H, SSD) => { const E = 22e9 * SSD * 0.65, w = SSD * 1000 * 1.8 * 9.81; const Dk = Math.pow(H / (0.792 * Math.cbrt(E / w)), 1.5); return H / (GREEN_C * Dk); };
const zFast = (m) => (m.z[5] - m.z[4] - m.z[2]) / Math.sqrt(3); // schnell: hohe N, kleine LMA, leichtes Holz (Reich 2014 „fast–slow")
const hashFrei = (i, k) => mulberry((i + 1) * 7919 + k * 104729)(); // der FREIE Wurf je Art (kein Gesetz dahinter — benannt)
// Klassen je Kern-Parameter: G = Gesetz (Physik/Allometrie mit Quelle), K = Korrelat (empirisch, unsicher), B = Bauplan (Wurzel der Adresse),
// O = Ort, A = abgeleitet im Kern aus G/K-Größen, F = FREI (kein Gesetz), W = Kern-Formel widerspricht dem Gesetz (Kern muss sich ändern).
const KLASSE = {
    kind: ["B", "Bauplan aus H, SSD (Raunkiær-Schwellen)"],
    apical: ["K", "Nadel: 0,72–0,92 aus H; Laub: 0,25 + 0,35·σ(1,5·zFast) (Pionier exkurrent) — Korrelat an 3 Presets"],
    delta: ["G", "Rohr-Modell Δ = 2 (da Vinci, WBE 1999), konstant — keine Art-Varianz mehr"],
    slim: ["G", "aus H/D nach Greenhill(H, SSD), linear an Fichte↔Mammut geeicht"],
    trop: ["F", "Trauerwuchs: kein Díaz-Merkmal; Ast-Durchhang δ/L ∝ (ρ/E)·L²/r² ist SSD-frei (E ∝ SSD)"],
    leafD: ["W", "Kern: leafD ∝ leaf (gleichsinnig mit der Blattgröße); Gesetz: Zahl ∝ 1/Größe (Kleiman & Aarssen 2007)"],
    height: ["A", "Form-Höhe aus den Reglern (treePhenotype:2307)"],
    hoeheM: ["G", "H (Díaz-Achse 1) direkt"],
    hd: ["G", "Greenhill(H, SSD) — nur die Konifere liest es (phyto-core:104)"],
    conifer: ["B", "Bauplan Nadel (LA ≤ 60 ∧ LMA ≥ 150)"],
    coniferDroop: ["A", "aus trop (F) — erbt die Freiheit"],
    crownBase: ["K", "Selbst-Astung: Kompensationslicht ∝ Atmung ∝ N (zN − zLMA)"],
    whorlSpacing: ["K", "Jahrestrieb ∝ Tempo zFast"],
    flare: ["A", "aus slim (G)"],
    roots: ["A", "aus slim (G)"],
    basalStems: ["B", "Strauch = Horst (Bauplan)"],
    maxDepth: ["W", "Kern: ↑ mit leaf (treePhenotype:2364); Corner: ↓ mit LA — überschrieben per ph.maxDepth"],
    barkA: ["F", "Rindenfarbe: 6 Paletten an Schwellen, kein Merkmal"],
    barkB: ["F", "dito"],
    leafCol: ["K", "N_Fläche = N·LMA → Chlorophyll → Helligkeit (PROSPECT-Richtung)"],
    leafShape: ["O", "Zähnung ∝ 1/MAT (Wolfe 1979) — Karten-Stufen L0/L1 lesen sie NICHT (foundry-core:2659 nur ohne Atlas)"],
    leafSize: ["K", "aus LA über den Regler leaf (die Karte wächst, das gemalte Blatt nicht)"],
    windGain: ["A", "aus slim/Trauer; f0 = kF·D/H² (WIND_GESETZ) liest D und H"],
    barkType: ["A", "Stufe aus slim/conif/weep (6 Klassen)"],
    solitaer: ["O", "Stand im Offenen (Ort, FREISTAND)"],
    weltSkala: ["A", "H ÷ Form-Höhe"],
    kroneM: ["A", "FOREST_PACK.crown ist TAFEL je Name (Auto-Art 4 m) → aus dem gewachsenen Schirm messen (stammAusKrone misst ihn schon)"],
    nische: ["O", "Nische(Merkmal, Ort) statt forestNicheWeights-Fach"],
};
function artAusMerkmal(m, i) {
    const bp = bauplan(m), lgLA = Math.log10(m.LA), zf = zFast(m);
    const hd = hdGreenhill(m.H, m.SSD);
    const slim = clamp(0.18 + (hd - 18) * (0.54 / 52), 0.05, 0.95);
    const leaf = clamp((lgLA - 1.5) / 3.0, 0.05, 1);
    const trop = -0.15 + 0.75 * hashFrei(i, 1); // FREI
    const nArea = (m.N * m.LMA) / 1000; // g/m²
    const leafCol = hexL(0x4a7a2c, -0.07 * Math.log2(nArea / 1.8));
    const maxDepth = Math.round(clamp(11 - 1.2 * (lgLA - 1.5), 5, 10));
    if (bp === "laub" || bp === "nadel" || bp === "strauch") {
        const api = bp === "nadel" ? 0.74 + 0.18 * clamp((Math.log10(m.H) - 0.7) / 1, 0, 1) : bp === "laub" ? 0.25 + 0.35 * sig(1.5 * zf) : 0.04 + 0.14 * sig(zf);
        const s = { api, delta: 2.0, slim, trop, leaf };
        const ph = { leafCol, maxDepth };
        if (bp !== "strauch") ph.hoeheM = m.H;
        if (bp === "nadel") { ph.hd = hd; ph.whorlSpacing = lerp(0.1, 0.15, sig(zf)); }
        if (bp === "laub") ph.crownBase = clamp(0.05 + 0.25 * sig((m.z[5] - m.z[4]) * 1.2), 0, 0.4);
        const pre = { kind: bp === "strauch" ? "shrub" : "tree", panel: "plant", s, ph };
        const form = PC.artPhaenotyp(s, pre).height;
        return { bp, pre, zielWelt: bp === "strauch" ? m.H / Math.max(0.5, form) : m.H / form, form };
    }
    // Kräuter: die Kern-Arten Gras/Blume/Farn/Schilf mit Reglern aus den Merkmalen (api ↔ Feinheit aus LMA, leaf aus LA)
    const basis = { gras: "gras", blume: "blume", farn: "farn", roehricht: "schilf" }[bp];
    const B = K.PRESETS[basis];
    const s = { api: clamp(0.3 + 0.8 * (Math.log10(m.LMA) - 1.7), 0.05, 0.95), delta: 2.0, slim: 0.5, trop, leaf };
    return { bp, pre: { kind: B.kind, panel: "plant", s, fx: JSON.parse(JSON.stringify(B.fx || {})), ph: B.ph }, zielWelt: null, basis };
}
const setzeSkala = (id, ziel) => { const mul = K.PRC.placement.treeScaleMul; K.PRC.placement.scale[id] = ziel >= mul ? ziel / mul + 1e-9 : ziel; };

// ───────────────────────── Bau über den echten Kern ─────────────────────────
const zaehle = (g) => { let tris = 0, bytes = 0, netze = 0; g.traverse((o) => { if (!o.isMesh) return; netze++; const ge = o.geometry; tris += (ge.index ? ge.index.count : ge.attributes.position.count) / 3; for (const a of Object.values(ge.attributes)) bytes += a.array.byteLength; if (ge.index) bytes += ge.index.array.byteLength; }); return { tris, bytes, netze }; };
function bau(id, seed = 1, lod = 0) {
    WARN = null;
    const t = process.hrtime.bigint();
    const g = K.buildInstance(id, seed, lod);
    const ms = Number(process.hrtime.bigint() - t) / 1e6;
    const box = new THREE.Box3().setFromObject(g), sz = box.getSize(new THREE.Vector3());
    return { ms, fehler: WARN, ...zaehle(g), hT: sz.y, wT: Math.max(sz.x, sz.z) };
}
function skelett(id, seed = 1, lod = 0) {
    WARN = null;
    const t = process.hrtime.bigint();
    let s, fehler = null;
    try { s = K.skelettDerGestalt(id, seed, lod); } catch (e) { fehler = String(e.message || e).slice(0, 160); }
    const ms = Number(process.hrtime.bigint() - t) / 1e6;
    if (!s) return { fehler: fehler || "kein Skelett", ms };
    const { segs, leaves } = s.nodes;
    let yMax = 0, yMin = Infinity, rx = 0;
    for (const q of segs) yMax = Math.max(yMax, q.p1[1]);
    for (const l of leaves) { yMax = Math.max(yMax, l.pos[1]); yMin = Math.min(yMin, l.pos[1]); }
    // Schirm wie stammAusKrone (8 Azimute, Blatt-Ausdehnung)
    const ls = s.P._ls > 0 ? s.P._ls : 1;
    let breite = 0;
    for (let k = 0; k < 8; k++) { const c = Math.cos((k * Math.PI) / 8), sn = Math.sin((k * Math.PI) / 8); let lo = Infinity, hi = -Infinity; for (const l of leaves) { const u = l.pos[0] * c + l.pos[2] * sn, b = (PC.BLATT_ATLAS_BREIT.kern * l.scale) / ls; lo = Math.min(lo, u - b); hi = Math.max(hi, u + b); } breite += hi - lo; }
    const welt = s.P.weltSkala > 0 ? s.P.weltSkala : K.welt(id);
    return { ms, fehler, P: s.P, yT: yMax, wT: breite / 8, wh: breite / 8 / yMax, segs: segs.length, blaetter: leaves.length, hM: yMax * welt, schirmM: (breite / 8) * welt, ansatz: leaves.length ? yMin / yMax : 0, welt, blattM: leaves.length ? (leaves.reduce((a, l) => a + l.scale, 0) / leaves.length) * welt : 0 };
}

// ───────────────────────── (2) 100 ARTEN ─────────────────────────
const N_ART = 100;
const arten = [];
for (let i = 0; i < N_ART; i++) {
    const m = merkmal(ziehe(R));
    const a = artAusMerkmal(m, i);
    const id = "spike" + i;
    K.PRESETS[id] = a.pre;
    if (a.zielWelt) setzeSkala(id, a.zielWelt);
    arten.push({ i, id, m, ...a });
}
const holz = (a) => a.bp === "laub" || a.bp === "nadel" || a.bp === "strauch";
// die Zeile der nächsten Stufe der Art (Gras beginnt bei Stufe 1: lod.budget.grass trägt keine 0)
const BUDGET = (kind) => { const B = K.PRC.lod.budget[kind]; if (!B) return NaN; const st = Object.keys(B).filter((k) => /^\d+$/.test(k) && B[k] && Number.isFinite(B[k].tris)).map(Number).sort((a, b) => a - b); return st.length ? B[st[0]].tris : NaN; };
const ERSTE = (kind) => { const B = K.PRC.lod.budget[kind]; const st = B ? Object.keys(B).filter((k) => /^\d+$/.test(k) && B[k] && Number.isFinite(B[k].tris)).map(Number).sort((a, b) => a - b) : []; return st.length ? st[0] : 0; };
const ZEILEN = ["tree", "shrub", "grass", "flower", "fern", "reed"].map((k) => `${k} ${BUDGET(k)}`).join(" · ");
const tBau0 = Date.now();
for (const a of arten) {
    if (holz(a)) a.sk = skelett(a.id, 1, 0);
    const voll = ALLE || !holz(a) || a.i % 4 === 0; // ohne --alle: jede 4. Holz-Art voll, jedes Kraut voll
    if (voll) a.geo = bau(a.id, 1, ERSTE(a.pre.kind)); // die erste Stufe der Art (Gras beginnt bei 1)
    // Welt-Maß: Holz aus dem Skelett, Kraut aus der Geometrie × Skala (Skala so gesetzt, dass H trifft → Höhe dort KEIN Test)
    if (!holz(a) && a.geo) { setzeSkala(a.id, a.m.H / Math.max(1e-3, a.geo.hT)); a.hM = a.geo.hT * K.welt(a.id); a.wM = a.geo.wT * K.welt(a.id); }
    else if (a.sk && !a.sk.fehler) {
        // Strauch: kein Welt-Maß im Kern (nur der Baum liest hoeheM) — die Skala ist H ÷ gebaute Form-Höhe (abgeleitet, kein Test)
        if (a.bp === "strauch") setzeSkala(a.id, a.m.H / a.sk.yT);
        const w = a.bp === "strauch" ? K.welt(a.id) : a.sk.welt;
        a.hM = a.sk.yT * w; a.wM = a.sk.wT * w;
    }
}
const tBau = Date.now() - tBau0;
// Ist-Wuchsform aus der GEBAUTEN Gestalt (nicht aus dem Bauplan): Stämme, Höhe, Kronen-Ansatz, Kronenform
function istForm(a) {
    if (!holz(a)) return a.geo && !a.geo.fehler && a.geo.tris > 0 ? { gras: "gras", blume: "blume", farn: "farn", roehricht: "roehricht" }[a.bp] : "kaputt";
    const s = a.sk; if (!s || s.fehler) return "kaputt";
    if (s.P.basalStems > 1) return "strauch";
    if (s.hM >= 3 && s.ansatz >= 0.05) return s.P.conifer ? "nadel" : "laub";
    return "strauch";
}
const BAND_WH = { laub: [0.25, 1.3], nadel: [0.15, 0.7], strauch: [0.5, 2.5] }; // Kronen-⌀/Höhe der Erde (Pretzsch 2015; Strauch breit) — UNSICHER
for (const a of arten) {
    a.ist = istForm(a);
    const geoOk = !a.geo || (!a.geo.fehler && a.geo.tris > 0 && a.geo.tris <= BUDGET(a.pre.kind) * 1.0001);
    const hOk = !Number.isFinite(a.hM) ? false : Math.abs(Math.log(a.hM / a.m.H)) <= Math.log(1.5);
    const band = BAND_WH[a.ist];
    const wh = a.wM / a.hM;
    const whOk = band ? wh >= band[0] && wh <= band[1] : true;
    a.wh = wh; a.geoOk = geoOk; a.hOk = hOk; a.whOk = whOk;
    a.plausibel = a.ist === a.bp && geoOk && hOk && whOk;
}
const zaehl = (f) => arten.filter(f).length;
const formen = ["laub", "nadel", "strauch", "gras", "blume", "farn", "roehricht"];

out(`=== SPIKE leben.pflanzen.arten#2 — Pflanzenarten aus EINEM Merkmalsraum (main 18058dba, nur gelesen) ===`);
out(`Kerne geladen in ${tLade} ms (vm: phyto-core · foundry-core · foundry-bruecke; planet-core per require)`);
out(`\n(1) ABBILDUNG merkmal → Kern-Parameter (${Object.keys(KLASSE).length} Parameter, die eine Art heute trägt oder erzwingt)`);
const kz = {}; for (const [k, [c]] of Object.entries(KLASSE)) (kz[c] = kz[c] || []).push(k);
const NAMEN = { G: "Gesetz", K: "Korrelat", B: "Bauplan/Wurzel", O: "Ort", A: "abgeleitet im Kern", F: "FREI", W: "Kern widerspricht Gesetz" };
for (const c of ["G", "K", "B", "A", "O", "F", "W"]) out(`  ${c} ${NAMEN[c].padEnd(24)} ${String((kz[c] || []).length).padStart(2)}  ${(kz[c] || []).join(", ")}`);
const nP = Object.keys(KLASSE).length, nF = (kz.F || []).length, nW = (kz.W || []).length, nK = (kz.K || []).length;
out(`  FREI ${nF}/${nP} = ${f1((100 * nF) / nP)} %  ·  FREI + widersprochen ${nF + nW}/${nP} = ${f1((100 * (nF + nW)) / nP)} %  ·  streng (F+W+K) ${nF + nW + nK}/${nP} = ${f1((100 * (nF + nW + nK)) / nP)} %`);
out(`  Merkmale OHNE Kern-Leser: SM (Samenmasse) — kein Feld, keine Verjüngung in der Welt; Blatt-Lebensdauer (LMA→immergrün) — SAISON_GESETZ ist EINE Kurve für alle Arten`);

out(`\n(2) ${N_ART} ARTEN gezogen (korreliert, Cholesky), gebaut über buildInstance/skelettDerGestalt (Bau ${tBau} ms${ALLE ? ", alle voll" : ", Holz: Skelett alle + jede 4. voll; Kraut: alle voll"})`);
out(`  Bauplan (Soll):  ` + formen.map((f) => `${f} ${zaehl((a) => a.bp === f)}`).join(" · "));
out(`  Gestalt (Ist):   ` + formen.map((f) => `${f} ${zaehl((a) => a.ist === f)}`).join(" · ") + ` · kaputt ${zaehl((a) => a.ist === "kaputt")}`);
const nSk = zaehl((a) => a.sk), nSkOk = zaehl((a) => a.sk && !a.sk.fehler), nGeo = zaehl((a) => a.geo), nGeoOk = zaehl((a) => a.geo && !a.geo.fehler && a.geo.tris > 0);
out(`  ohne Fehler: Skelett ${nSkOk}/${nSk} · volle Geometrie L0 ${nGeoOk}/${nGeo}`);
for (const a of arten.filter((a) => (a.sk && a.sk.fehler) || (a.geo && (a.geo.fehler || !(a.geo.tris > 0)))).slice(0, 4)) out(`    FEHLER ${a.id} ${a.bp}: ${(a.sk && a.sk.fehler) || (a.geo && a.geo.fehler) || "0 Dreiecke"}`);
out(`  Ist = Soll ${zaehl((a) => a.ist === a.bp)} · Höhe ±50 % ${zaehl((a) => a.hOk)} · Krone/Höhe im Band ${zaehl((a) => a.whOk)} · Tris ≤ Zeile ${zaehl((a) => a.geoOk)}`);
const nPl = zaehl((a) => a.plausibel);
out(`  PLAUSIBLE WUCHSFORM: ${nPl}/${N_ART}`);
for (const a of arten.filter((a) => !a.plausibel).slice(0, 8)) out(`    nicht: ${a.id} Soll ${a.bp} Ist ${a.ist} H ${f1(a.m.H)}→${f1(a.hM)} m  ⌀/H ${f1(a.wh, 2)}${a.geo ? " tris " + a.geo.tris : ""}`);
const hT = arten.map((a) => a.m.H), hB = arten.filter((a) => Number.isFinite(a.hM)).map((a) => a.hM);
out(`  Höhe [m] Merkmal p5/p50/p95 ${f1(pct(hT, 0.05), 2)}/${f1(pct(hT, 0.5), 2)}/${f1(pct(hT, 0.95), 1)}  ·  gebaut ${f1(pct(hB, 0.05), 2)}/${f1(pct(hB, 0.5), 2)}/${f1(pct(hB, 0.95), 1)}`);
const laA = arten.map((a) => Math.sqrt(a.m.LA)), bm = arten.filter((a) => a.sk && !a.sk.fehler && !a.sk.P.conifer && a.bp !== "strauch").map((a) => a.sk.blattM);
out(`  Blatt: √LA Merkmal p5/p95 ${f1(pct(laA, 0.05))}–${f1(pct(laA, 0.95))} mm (×${f1(pct(laA, 0.95) / pct(laA, 0.05))}) · Laub-Karte (Blatt-Anker × Welt) ${f1(pct(bm, 0.05), 2)}–${f1(pct(bm, 0.95), 2)} m (×${f1(pct(bm, 0.95) / pct(bm, 0.05))}); das GEMALTE Blatt der Zelle ist für jede Laub-Art dasselbe (BLATT_ATLAS_BREIT, 1 Zelle)`);
const lgLA = arten.filter((a) => a.sk && !a.sk.fehler).map((a) => [Math.log10(a.m.LA), a.sk.segs, a.sk.blaetter]);
const korr = (xs, ys) => { const n = xs.length, mx = xs.reduce((s, v) => s + v, 0) / n, my = ys.reduce((s, v) => s + v, 0) / n; let sxy = 0, sxx = 0, syy = 0; for (let k = 0; k < n; k++) { sxy += (xs[k] - mx) * (ys[k] - my); sxx += (xs[k] - mx) ** 2; syy += (ys[k] - my) ** 2; } return sxy / Math.sqrt(sxx * syy); };
out(`  Corner-Probe (Holz, gebaut): r(log LA, Glieder) = ${f1(korr(lgLA.map((v) => v[0]), lgLA.map((v) => v[1])), 2)} · r(log LA, Blatt-Anker) = ${f1(korr(lgLA.map((v) => v[0]), lgLA.map((v) => v[2])), 2)}  (Gesetz: beide < 0)`);
const KANN_NICHT = [["Kletterer/Liane", "~10 %", "Schnitzer & Bongers 2002; kein Stütz-Gesetz, kein Wirt im Kern"], ["Epiphyt", "~9 %", "Zotz 2013 (27 614 Arten)"], ["Sukkulente/Kaktus", "~3 %", "~12 500 Arten; Wasser-Speicher-Leib fehlt"], ["Palme/Schopfbaum (Monokotylen-Baum)", "~0,7 %", "~2 600 Palmen; Wirt-Alias baum_palme → weide, studio-bruecke.js:3844"], ["Wasserpflanze (Schwimmblatt)", "<1 %", "kein Kern-Zweig"], ["Moos (Bryophyt)", "~5 %", "~20 000 Arten neben ~390 000 Gefäßpflanzen; kein Kern-Zweig"], ["Polster/Rosette", "?", "kein Kern-Zweig"]];
out(`  KANN DER KERN NICHT BAUEN (kein kind in PRESETS/deriveParamsPlant):`);
for (const [f, a, q] of KANN_NICHT) out(`    ${f.padEnd(36)} Erde ${a.padEnd(6)} ${q}`);
out(`  Die Liste der Sprosse (Baum, Strauch, Gras, Kletterer, Sukkulente, Farn, Moos): der Kern baut 4 von 7; nach Erd-Anteil fehlen Kletterer ~10 + Sukkulente ~3 + Moos ~5 ≈ 18 % → Decke ≈ 82 % < 90 % — der Díaz-Raum allein enthält diese Formen nicht (kein Merkmal trennt sie), darum traf die Ziehung 92/100`);

// ───────────────────────── (3) SCHWESTERARTEN ─────────────────────────
out(`\n(3) SCHWESTERARTEN — zwei Punkte im Abstand 0,3 SD (Díaz-Raum), je 6 Gestalten (Saat 1–6) gewachsen`);
const SAAT = [1, 2, 3, 4, 5, 6];
function schwester(basisM, dz, tag) {
    const z2 = basisM.z.map((v, k) => v + dz[k]);
    const mA = basisM, mB = merkmal(z2);
    const res = [];
    for (const [m, nm] of [[mA, "A"], [mB, "B"]]) {
        const a = artAusMerkmal(m, 900 + (nm === "A" ? 0 : 0)); // gleicher FREIER Wurf: Schwestern teilen ihn (Abstammung)
        const id = "schw_" + tag + nm;
        K.PRESETS[id] = a.pre; if (a.zielWelt) setzeSkala(id, a.zielWelt);
        const g = SAAT.map((s) => skelett(id, s, 0));
        res.push({ nm, a, g, m });
    }
    const met = ["hM", "wh", "segs", "blaetter", "ansatz"];
    const zeile = met.map((k) => {
        const A = res[0].g.map((x) => x[k]), B = res[1].g.map((x) => x[k]);
        const mean = (v) => v.reduce((s, x) => s + x, 0) / v.length, sd = (v) => Math.sqrt(v.reduce((s, x) => s + (x - mean(v)) ** 2, 0) / (v.length - 1));
        const dp = Math.abs(mean(A) - mean(B)) / Math.max(1e-9, Math.sqrt((sd(A) ** 2 + sd(B) ** 2) / 2));
        return { k, A: mean(A), B: mean(B), dp };
    });
    const PA = res[0].g[0].P, PB = res[1].g[0].P;
    const farbe = rgbAbst(res[0].a.pre.ph.leafCol, res[1].a.pre.ph.leafCol);
    const stufe = ["kind", "conifer", "barkType", "maxDepth"].filter((k) => PA[k] !== PB[k]);
    return { tag, zeile, farbe, stufe, bpA: res[0].a.bp, bpB: res[1].a.bp, dz };
}
const basisLaub = arten.find((a) => a.bp === "laub" && a.plausibel) || arten.find((a) => a.bp === "laub");
const basisStrauch = arten.find((a) => a.bp === "strauch" && a.plausibel) || arten.find((a) => a.bp === "strauch");
const zNadel = [Math.log10(25) - MU[0], Math.log10(10) - MU[1], Math.log10(0.4) - MU[2], Math.log10(40) - MU[3], Math.log10(220) - MU[4], Math.log10(12) - MU[5]].map((v, k) => v / SD[k]);
const zSchwelle = [Math.log10(20) - MU[0], 0, Math.log10(0.45) - MU[2], Math.log10(55) - MU[3], Math.log10(160) - MU[4], Math.log10(14) - MU[5]].map((v, k) => v / SD[k]);
const dzR = (r) => { const v = ACHSEN.map(() => normal(r)); const n = Math.hypot(...v); return v.map((x) => (0.3 * x) / n); };
const RS = mulberry(4242);
const faelle = [
    schwester(basisLaub.m, dzR(RS), "laub"),
    schwester(merkmal(zNadel), dzR(RS), "nadel"),
    schwester(basisStrauch.m, dzR(RS), "strauch"),
    schwester(merkmal(zSchwelle), [0, 0, 0, 0.3, 0, 0], "schwelle"), // +0,3 SD Blattfläche über LA 60 mm²
];
for (const f of faelle) {
    out(`  ${f.tag.padEnd(8)} ${f.bpA}→${f.bpB}  ` + f.zeile.map((z) => `${z.k} ${f1(z.A, z.k === "ansatz" ? 2 : 1)}/${f1(z.B, z.k === "ansatz" ? 2 : 1)} d'=${f1(z.dp, 2)}`).join(" · ") + `  · Laubfarbe ΔRGB ${f1(f.farbe)}${f.stufe.length ? " · SPRUNG " + f.stufe.join(",") : ""}`);
}
const nGeoTrennt = faelle.filter((f) => f.zeile.some((z) => z.dp >= 1)).length;
out(`  geometrisch trennbar (ein Maß mit d' ≥ 1 über 6 Gestalten): ${nGeoTrennt}/${faelle.length}`);
// Silhouetten-Paare (Richter der Sprosse: unterscheidbar ≥ 95 %) — STELLVERTRETER aus Maßen, kein Bild: ein Paar ist trennbar, wenn der
// Bauplan wechselt ODER |Δ ln H| > 0,32 (2 × Höhen-Wurf ±16 %) ODER |Δ ⌀/H| > 0,2 ODER |Δ Kronen-Ansatz| > 0,1.
{
    const S = arten.filter((a) => Number.isFinite(a.hM) && Number.isFinite(a.wh));
    let n = 0, t = 0, nurMass = 0;
    for (let x = 0; x < S.length; x++) for (let y = x + 1; y < S.length; y++) {
        const A = S[x], B = S[y]; n++;
        const ans = (a) => (a.sk ? a.sk.ansatz : 0);
        const form = A.bp !== B.bp || Math.abs(A.wh - B.wh) > 0.2 || Math.abs(ans(A) - ans(B)) > 0.1;
        const mass = Math.abs(Math.log(A.hM / B.hM)) > 0.32;
        if (form || mass) t++;
        if (!form && mass) nurMass++;
    }
    out(`  Silhouetten-Paare (Stellvertreter) der ${S.length} Arten: trennbar ${t}/${n} = ${f1((100 * t) / n)} % · davon NUR über die Größe ${nurMass} (${f1((100 * nurMass) / n)} %) — im Spiel streut s = 0,55–1,95 je Baum (forestTreeSize), die Größe trennt dort keine Art`);
    let tf = 0; for (let x = 0; x < S.length; x++) for (let y = x + 1; y < S.length; y++) { const A = S[x], B = S[y], ans = (a) => (a.sk ? a.sk.ansatz : 0); if (A.bp !== B.bp || Math.abs(A.wh - B.wh) > 0.2 || Math.abs(ans(A) - ans(B)) > 0.1) tf++; }
    out(`  ohne die Größe (Form allein): ${tf}/${n} = ${f1((100 * tf) / n)} %; im selben Bauplan: ${(() => { let a = 0, b = 0; for (let x = 0; x < S.length; x++) for (let y = x + 1; y < S.length; y++) { const A = S[x], B = S[y]; if (A.bp !== B.bp) continue; b++; const ans = (q) => (q.sk ? q.sk.ansatz : 0); if (Math.abs(A.wh - B.wh) > 0.2 || Math.abs(ans(A) - ans(B)) > 0.1) a++; } return `${a}/${b} = ${f1((100 * a) / b)} %`; })()}`);
}
const AUF = [["api (Laub 0,22–0,62)", 0.4, 0.2], ["slim 0–1", 1, 0.2], ["trop −0,4–0,9", 1.3, 0.2], ["Höhe 5–60 m (ln)", Math.log(12), 0.32], ["leafD/leaf (×1±0,16)", 1, 0.32]];
let prod = 1; for (const [, sp, w] of AUF) prod *= sp / w;
out(`  Auflösung der Regler gegen den IR-Wurf (Spanne ÷ 2·Wurf): ` + AUF.map(([n, sp, w]) => `${n} ${f1(sp / w)}`).join(" · ") + ` → Produkt ≈ ${Math.round(prod)} unterscheidbare Gestalt-Zellen je Bauplan`);

// ───────────────────────── (4) PREIS ─────────────────────────
out(`\n(4) PREIS je Art (Node, vm, Haupt-Faden-frei gerechnet; die Karte backt auf der GPU — hier NICHT gelaufen)`);
const gb = arten.filter((a) => a.geo && !a.geo.fehler && a.geo.tris > 0);
for (const grp of [["Holz (Baum/Strauch)", (a) => holz(a)], ["Kraut", (a) => !holz(a)]]) {
    const g = gb.filter(grp[1]); if (!g.length) continue;
    const ms = g.map((a) => a.geo.ms), tr = g.map((a) => a.geo.tris), mb = g.map((a) => a.geo.bytes / 1048576);
    out(`  ${grp[0].padEnd(20)} n=${g.length}  Bau L0 p50/p95 ${f1(pct(ms, 0.5), 0)}/${f1(pct(ms, 0.95), 0)} ms · Tris p50/max ${Math.round(pct(tr, 0.5))}/${Math.max(...tr)} · Netz L0 p50/max ${f1(pct(mb, 0.5), 2)}/${f1(Math.max(...mb), 2)} MB`);
}
const sms = arten.filter((a) => a.sk && !a.sk.fehler).map((a) => a.sk.ms);
out(`  Skelett allein p50 ${f1(pct(sms, 0.5), 0)} ms (der Wuchs ist ~7 % des Baus; Rinde h()/quadLagen tragen ihn — Profil der Probe)`);
const V = K.PRC.lod.budget.gestalten["*"];
const BC = 0.55, RGBA = 2.8, KARTE_MS = 55, VRAM = 118, DRAW = 208;
const holzMB = pct(gb.filter(holz).map((a) => a.geo.bytes / 1048576), 0.5);
const szen = (arten50, gest, stufen) => ({ karten: arten50 * gest, bc: arten50 * gest * BC, rgba: arten50 * gest * RGBA, bakeS: (arten50 * gest * KARTE_MS) / 1000, draws: arten50 * stufen * 3, netzMB: arten50 * gest * holzMB });
const heute = szen(50, 3, 2), wurzel = szen(6, 2, 2);
out(`  50 Arten zugleich, HEUTIGES Modell (je Art V=2 Bestand + 1 Solitär, L0+L1 je 2 Draws + Schatten): Karten ${heute.karten} → ${f1(heute.bc)} MiB BC / ${f1(heute.rgba)} MiB rgba8 · Bake ${f1(heute.bakeS)} s Haupt-Faden (55 ms je Karte GTX, stoff-karte.js:905) · Draws ~${heute.draws} · Netze ${f1(heute.netzMB)} MB`);
out(`     gegen das Band: VRAM ${VRAM} MB, Draws ${DRAW}, Ankunft ≤ 5 s → Karten allein ${f1((100 * heute.bc) / VRAM, 0)} % des VRAM-Bands (BC) / ×${f1(heute.rgba / VRAM, 1)} (rgba8, reißt), Draws ×${f1(heute.draws / DRAW, 1)} (reißt), Bake ${f1(heute.bakeS)} s (reißt B allein)`);
out(`  Was gelten muss: Kosten ∝ WURZELN × Gestalten, Art = Instanz-Parameter. 6 Wurzeln × V 2: Karten ${wurzel.karten} → ${f1(wurzel.bc, 1)} MiB BC, Bake ${f1(wurzel.bakeS, 2)} s, Draws ~${wurzel.draws}; die 50 Arten reisen als (Skala x/y, Ton, Krone/H) je Instanz`);
out(`  Gestalten je Art heute: '*' ${V} (Auto-Art) — jede neue Art ohne Zeile in lod.budget.gestalten bekäme 16 Gestalten (×${V / 2} gegen eiche)`);

// ───────────────────────── (5) STANDORT ─────────────────────────
out(`\n(5) STANDORT — Nische(Merkmal, Ort) an echten Orten des Planeten (planet-core planetKlima/planetBiom, Same "anazh", Körper PLANET_ERDE)`);
const plan = PL.planetPlan("anazh", PL.PLANET_ERDE), S = PL.planetScheibe(plan, 0);
const wbName = (b) => Object.keys(PL.WHITTAKER).find((k) => PL.WHITTAKER[k] === b);
const orte = {};
for (let b = -70; b <= 70; b += 5) for (let l = -180; l < 180; l += 10) { const Kl = PL.planetKlima(S, b, l, -1, {}); if (!(Kl.hoeheKm > 0)) continue; const Bi = PL.planetBiom(Kl, Kl.hoeheKm * 1000, {}); const n = wbName(Bi.biom); if (!orte[n]) orte[n] = { b, l, K: Kl }; }
// Nische (Kikuzawa 1991: Nutzen des Blatts über seine Lebensdauer gegen seinen Ersatz · N-Haushalt · Wasser · Höhe · Blattgröße).
// Konstanten GESETZT, nicht geeicht (UNSICHER). Erwartungen (Richtung, aus der Literatur, VOR dem Lauf festgeschrieben): E1 LA tropen > gemäßigt
// > boreal (Wright 2017) · E2 LMA busch > gemäßigt (Wright 2005) · E3 H tropen > boreal (Moles 2009) · E4 immergrün-Anteil boreal > gemäßigt
// (Givnish 2002) · E5 Strauch-Anteil busch > gemäßigt.
function nische(m, bp, Kl, schulter) {
    const tS = Kl.tSommerC, tW = Kl.tWinterC, P = Kl.niederschlagMm, tJ = Kl.tJahrC;
    const pet = 400 + 45 * Math.max(0, tJ); // dieselbe PET wie planet-core pflanzenDeckung
    const AI = P / pet;
    const mt = 0.5 * (tS + tW), am = 0.5 * (tS - tW);
    const g = am < 1e-9 ? (mt > 10 ? 12 : 0) : (12 * Math.acos(clamp((10 - mt) / am, -1, 1))) / Math.PI; // Monate > 10 °C (wie planetBiom)
    const LL = 0.06 * Math.pow(m.LMA, 1.1); // Blatt-Lebensdauer [Monate] ∝ LMA^1,1 (Wright 2004) — UNSICHER
    const tau = 1 / Math.pow(m.N / 20, 1.4); // Amortisation [Monate] ∝ 1/A_mass, A_mass ∝ N^1,4 (Wright 2004) — UNSICHER
    const aKrit = 0.9 * (0.6 / m.SSD) * Math.sqrt(100 / m.LMA); // Trockenheit: dichtes Holz + derbes Blatt arbeiten tiefer (Hacke 2001)
    const immer = LL >= 12;
    // SCHULTER (Nachtrag nach Lauf 1, E4 verfehlt — benannt, nicht versteckt): das immergrüne Blatt arbeitet auch in den Monaten
    // 0–10 °C, das sommergrüne nur im belaubten Sommer > 10 °C (Givnish 2002). Lauf 1 rechnete beide mit > 10 °C.
    const g0 = am < 1e-9 ? (mt > 0 ? 12 : 0) : (12 * Math.acos(clamp((0 - mt) / am, -1, 1))) / Math.PI;
    const gW = (schulter && immer ? 0.6 * g0 + 0.4 * g : g) * clamp(AI / aKrit, 0, 1); // produktive Monate (kalt arbeitet das Blatt mit 0,6)
    const ersatz = immer ? 12 / LL : 1; // Blatt-Masse je Jahr neu
    const netto = (immer ? gW : Math.min(LL, gW)) / tau - ersatz; // Kikuzawa: Ertrag − Ersatz, je Einheit Blatt-Masse und Jahr
    const nAngebot = 25 * Math.pow(2, (tJ - 10) / 10) * clamp(AI, 0.2, 1); // Mineralisierung, Q10 = 2 — UNSICHER
    const nFak = Math.min(1, nAngebot / (m.N * ersatz * 0.5)); // die Hälfte wird vor dem Fall zurückgeholt (Aerts 1996)
    const hMax = 50 * (1 - Math.exp(-AI * AI)) * (1 - Math.exp(-g / 4)); // Wasser- und Saison-Grenze der Höhe — UNSICHER
    const hFak = m.H <= hMax ? Math.pow(m.H / hMax, 0.3) : Math.pow(hMax / m.H, 2); // Licht-Wettlauf bis zur Grenze
    const laMax = 1.8 + 0.07 * tS + 0.8 * Math.log10(Math.max(0.05, AI)); // Wright 2017: Nacht-Kälte + Trockenheit kappen die Blattgröße
    const laFak = sig(3 * (laMax - Math.log10(m.LA)));
    const frost = immer && bp !== "nadel" && tW < -5 ? 0.15 : 1; // immergrünes Breitblatt im harten Winter
    return { w: Math.max(0, netto) * nFak * hFak * laFak * frost, g, AI, hMax, immer };
}
const wahl = ["boreal", "gemaessigtSaison", "busch", "tropenRegen"].filter((n) => orte[n]);
const TOPK = 15;
const GEM = {};
const lauf = (schulter) => {
for (const k in GEM) delete GEM[k];
for (const n of wahl) {
    const o = orte[n], Kl = o.K;
    const r = arten.map((a) => ({ a, ...nische(a.m, a.bp, Kl, schulter) })).sort((x, y) => y.w - x.w);
    const top = r.slice(0, TOPK).filter((x) => x.w > 0);
    const sumW = top.reduce((s, x) => s + x.w, 0) || 1;
    const anteil = {}; for (const x of top) anteil[x.a.bp] = (anteil[x.a.bp] || 0) + x.w / sumW;
    const immerA = top.reduce((s, x) => s + (x.immer ? x.w : 0), 0) / sumW;
    const cwm = (k) => Math.pow(10, top.reduce((s, x) => s + (x.w / sumW) * Math.log10(x.a.m[k]), 0));
    GEM[n] = { H: cwm("H"), LA: cwm("LA"), LMA: cwm("LMA"), immer: immerA, strauch: anteil.strauch || 0, anteil };
    if (schulter) { out(`    ${n.padEnd(16)} ${Object.entries(anteil).sort((p, q) => q[1] - p[1]).slice(0, 3).map(([k, v]) => `${k} ${f1(100 * v, 0)} %`).join(" · ")} · immergrün ${f1(100 * immerA, 0)} % · LMA ${f1(cwm("LMA"), 0)}`); continue; }
    out(`  ${n.padEnd(16)} (${o.b}°, ${o.l}°) T ${f1(Kl.tJahrC)} °C [${f1(Kl.tWinterC)}…${f1(Kl.tSommerC)}] P ${f1(Kl.niederschlagMm, 0)} mm · AI ${f1(r[0].AI, 2)} · Saison ${f1(r[0].g)} Mo · H_max ${f1(r[0].hMax)} m · lebend ${r.filter((x) => x.w > 0).length}/100`);
    out(`      Gemeinschaft (die ${TOPK} Stärksten, gewichtet): ${Object.entries(anteil).sort((p, q) => q[1] - p[1]).map(([k, v]) => `${k} ${f1(100 * v, 0)} %`).join(" · ")} · immergrün ${f1(100 * immerA, 0)} %`);
    out(`      CWM: H ${f1(cwm("H"))} m · LA ${f1(cwm("LA"), 0)} mm² · LMA ${f1(cwm("LMA"), 0)} g/m² · N ${f1(cwm("N"))} mg/g · SSD ${f1(cwm("SSD"), 2)}`);
}
const G_ = (n) => GEM[n] || {};
const ERW = [
    ["E1 LA tropen > gemäßigt > boreal", G_("tropenRegen").LA > G_("gemaessigtSaison").LA && G_("gemaessigtSaison").LA > G_("boreal").LA],
    ["E2 LMA busch > gemäßigt", G_("busch").LMA > G_("gemaessigtSaison").LMA],
    ["E3 H tropen > boreal", G_("tropenRegen").H > G_("boreal").H],
    ["E4 immergrün boreal > gemäßigt", G_("boreal").immer > G_("gemaessigtSaison").immer],
    ["E5 Strauch busch > gemäßigt", G_("busch").strauch > G_("gemaessigtSaison").strauch],
];
const treffer = ERW.filter((e) => e[1]).length;
out(`  Erwartungen ${schulter ? "Lauf 2 (mit Schulter)" : "Lauf 1"}: ` + ERW.map(([t, ok]) => `${t} ${ok ? "JA" : "NEIN"}`).join(" · "));
return treffer;
};
const treffer1 = lauf(false);
out(`  Nachtrag Schulter-Saison (immergrün arbeitet 0–10 °C mit 0,6):`);
const treffer2 = lauf(true);
out(`  Treffer: Lauf 1 ${treffer1}/5 · Lauf 2 ${treffer2}/5 Erwartungen`);
out(`  Nadel-Bäume im Pool: ${arten.filter((a) => a.bp === "nadel").length}/100 (Erde ~615 Koniferen unter ~60 000 Baumarten ≈ 1 %) — der boreale Nadelwald ist mit EINER Art nicht zu tragen`);
const nw = PC.forestNicheWeights(0.5, 0.3, 0.5, 0.3, 0.5);
out(`  HEUTE forestNicheWeights(clim 0,5 · dry 0,3 · wet 0,5 · open 0,3 · patch 0,5) — Eingänge ohne T und P, an allen ${wahl.length} Orten byte-gleich: ` + Object.entries(nw).map(([k, v]) => `${k} ${f1(v, 3)}`).join(" · "));
out(`  (dry = relative Höhe, clim/patch = fbm; T und P des Planeten erreichen die Wahl der Art nur über wuchs.laub/nadel = Erdzeit-Tafel ORT_WUCHS)`);

// ───────────────────────── URTEIL ─────────────────────────
const falsF = nPl < 70 || nF / nP > 0.5;
out(`\nFALSIFIKATION: < 70 plausible (${nPl}) ODER > 50 % frei (${f1((100 * nF) / nP)} %, streng ${f1((100 * (nF + nW + nK)) / nP)} %) → ${falsF ? "WIDERLEGT" : "NICHT widerlegt"}`);
out(`Laufzeit ${((Date.now() - T0) / 1000).toFixed(1)} s`);
