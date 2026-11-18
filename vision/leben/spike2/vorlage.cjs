// SPIKE 2 „Die fehlenden Wuchsformen" (Sprosse leben.pflanzen.arten#2) — liest die Kerne des Repos (main 18058dba), schreibt
// nichts ins Repo. Lauf: node wuchsformen.cjs   (≤ 60 s; die Bauten laufen in einem Pool aus worker_threads, je Arbeiter zwei
// vm-Welten: Original und Kern-KOPIE)
// (1) Die Wuchsform wird am GEBAUTEN Netz geurteilt (Höhe, Stamm-Ø im Schnitt, Stämme, Selbst-Tragen nach Greenhill, Blatt-Anteil,
//     Achs-Dicke, Breite/Höhe, Blatt-Lage) — nie aus dem Soll. Prüfung an den PRESETS, dann 100 Arten je Wurzel BEDINGT gezogen.
// (2) Drei fehlende Gesetze an einer Kern-KOPIE von phyto-core.js (benannte Ersetzungen E0–E17, jede trifft genau einmal):
//     Stütz-Gesetz (Kletterer), Wasser-Speicher (Sukkulente), Kapillar-Grenze (Moos/Polster). Byte-Beweis: ohne `gesetz` baut die
//     Kopie die PRESETS byte-gleich zum Original.
// (3) Übergänge: Stütz-Investition q (Baum ↔ Kletterer) und Trocken-Tage (Strauch ↔ Sukkulente) als stetige Achsen.
// Nachträge nach Lauf 1 (benannt, Lauf 1 steht in lauf1-vor-nachtrag.txt; KEINE Schwelle des Richters wurde verändert):
//   N1 Messfehler: Stamm-Ø als SCHNITT der Achs-Dreiecke mit der Ebene y_b statt Ring-Ecken im Band (Ø 0 bei langen Schaft-Segmenten).
//   N2 Bau-Fehler der Gesetz-Arten: api unter der Nadel-Schwelle treePhenotype (phyto-core.js:2303; api 0,75/0,9 machte die Säule zur
//      Konifere — nur Nadel-Wedel).
//   N3 Stütz-Gesetz: Greenhill über den Fuß-Radius an der letzten Stütze (gleichförmige Säule), nicht den örtlichen Radius.
//   N4 Strauch ↔ Sukkulente im Baum-Pfad mit Horst (die Strauch-Kette Rezept 1 verliert die Speicher-Achse: 5 900 → 280 Dreiecke).
//   N5 Prüfstand: die Typed-Arrays des Haupt-Realms im vm (THREE kommt aus dem Haupt-Realm; geoVerschmelzen vergleicht
//      `array.constructor` — zwei Realms ließen den Speicher-Leib still verschwinden; im Browser gibt es einen Realm).
"use strict";
const ROOT = "C:/Users/micha/AnazhRealm-profiband";
const fs = require("fs"), path = require("path"), crypto = require("crypto");
const { Worker, isMainThread, parentPort, workerData } = require("worker_threads");
const T0 = Date.now();
const out = (s = "") => console.log(s);
const f1 = (x, n = 1) => (Number.isFinite(x) ? x.toFixed(n) : String(x));
const pct = (a, p) => { const s = [...a].filter(Number.isFinite).sort((x, y) => x - y); return s.length ? s[Math.min(s.length - 1, Math.floor(p * (s.length - 1) + 0.5))] : NaN; };
const clamp = (x, a, b) => Math.max(a, Math.min(b, x)), lerp = (a, b, t) => a + (b - a) * t;
const mulberry = (a) => () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
const normal = (r) => Math.sqrt(-2 * Math.log(1 - r())) * Math.cos(2 * Math.PI * r());

// ───────────────────────── GREENHILL und DER NETZ-RICHTER (Schwellen GEWÄHLT vor Lauf 1, unverändert) ─────────────────────────
const GH = { C: Math.cbrt(7.8373 / 4) / Math.pow(2, 2 / 3), eRhoG: 8.1e5 };
// C: Greenhill 1881, L = (7,8373·E·I/(w·A))^⅓ mit I = πr⁴/4, A = πr² → L = (7,8373/4)^⅓·(E/w)^⅓·r^⅔ = 0,7883·(E/w)^⅓·D^⅔ (geprüft).
// E/ρg = 22 GPa·SSD·0,65 / (1 800 kg/m³·SSD·g) = 8,1·10⁵ m — SSD kürzt sich (E ∝ SSD, Niklas 1992; Frischholz ×1,8) — UNSICHER.
const hKrit = (D) => GH.C * Math.cbrt(GH.eRhoG) * Math.pow(D, 2 / 3);
const Dkrit = (L) => Math.pow(L / (GH.C * Math.cbrt(GH.eRhoG)), 1.5);
const SCHWELLE = Object.freeze({ // GEWÄHLT vor Lauf 1 aus den Definitionen (Raunkiær 1934; Cornelissen et al. 2003; FAO-Baum) — nie geeicht
    holzD: 0.01, baumH: 3, tragS: 1, speicherBlatt: 0.15, speicherDicke: 0.25, moosH: 0.15, moosBreit: 3, grasNy: 0.65,
});
function wuchsform(m) {
    const S = SCHWELLE;
    if (!(m.tris > 0)) return "leer";
    const holzig = m.D >= S.holzD;
    if (!holzig) {
        if (m.H < S.moosH && m.breit >= S.moosBreit) return "moos";
        if (!(m.ny >= 0)) return "kraut"; // kein grünes Gewebe im Netz
        if (m.bluete) return "kraut";
        return m.ny < S.grasNy ? "gras" : "farn";
    }
    if (m.S > S.tragS) return "kletterer";
    if (m.blatt < S.speicherBlatt && m.dicke >= S.speicherDicke) return "sukkulente";
    if (m.H < S.moosH && m.breit >= S.moosBreit) return "moos";
    if (m.stamm >= 2 || m.H < S.baumH) return "strauch";
    return "baum";
}

// ═════════════════════════ ARBEITER: lädt die Kerne, baut, misst am Netz ═════════════════════════
if (!isMainThread) {
    const W = require(ROOT + "/scripts/lib/welt-boot.cjs");
    const vm = W.vm;
    const ORIG = fs.readFileSync(path.join(ROOT, "phyto-core.js"), "utf8");
/*ERS*/
    let KOPIE = ORIG;
    for (const [name, alt, neu] of ERS) {
        const n = KOPIE.split(alt).length - 1;
        if (n !== 1) throw new Error(`Ersetzung ${name}: ${n} Treffer statt 1`);
        KOPIE = KOPIE.replace(alt, () => neu);
    }
    if (workerData.schreibeKopie) { const KD = path.join(__dirname, "kern-kopie"); fs.mkdirSync(KD, { recursive: true }); fs.writeFileSync(path.join(KD, "phyto-core.js"), KOPIE); }
    const TYPED = ["Float32Array", "Float64Array", "Int8Array", "Int16Array", "Int32Array", "Uint8Array", "Uint8ClampedArray", "Uint16Array", "Uint32Array"];
    function welt(phyto) {
        const absorber = () => { const a = new Proxy(function () {}, { get: (_t, k) => (k === Symbol.toPrimitive ? () => 0 : a), apply: () => a, construct: () => a }); return a; };
        const sb = { console: { log() {}, warn() {}, error() {} }, Math, performance: { now: () => Date.now() }, setTimeout, clearTimeout };
        sb.self = sb.globalThis = sb.window = sb;
        sb.THREE = W.ENGINE_THREE();
        sb.OffscreenCanvas = function (w, h) { this.width = w; this.height = h; this.getContext = () => new Proxy({}, { get: (t, k) => (k === "createImageData" || k === "getImageData" ? (a, b, c, d) => ({ data: new Uint8ClampedArray((c || a) * (d || b) * 4) }) : k in t ? t[k] : () => absorber()), set: (t, k, v) => ((t[k] = v), true) }); };
        vm.createContext(sb);
        for (const k of TYPED) sb[k] = globalThis[k]; // N5: ein Realm wie im Browser
        vm.runInContext(phyto, sb, { filename: "phyto-core.js" });
        for (const f of ["foundry-core.js", "foundry-bruecke.js"]) vm.runInContext(fs.readFileSync(path.join(ROOT, f), "utf8"), sb, { filename: f });
        vm.runInContext("self.__K = { PRESETS, buildInstance, PRC: PORTAL_RENDER_CONFIG, welt: __weltSkalaArt }", sb);
        const K = sb.__K;
        let WARN = null; sb.console.warn = (...a) => { WARN = a.map((x) => String((x && x.message) || x)).join(" ").slice(0, 160); };
        try { K.buildInstance("eiche", 1, 0); } catch (e) {}
        K.warn = () => WARN; K.reset = () => { WARN = null; }; K.PC = sb.__phytoCore;
        return K;
    }
    const KW = { A: welt(ORIG), B: welt(KOPIE) };
    const setzeSkala = (K, id, ziel) => { const mul = K.PRC.placement.treeScaleMul; K.PRC.placement.scale[id] = ziel >= mul ? ziel / mul + 1e-9 : ziel; };
    const stufen = (K, kind) => { const B = K.PRC.lod.budget[kind]; return B ? Object.keys(B).filter((k) => /^\d+$/.test(k) && B[k] && Number.isFinite(B[k].tris)).map(Number).sort((a, b) => a - b) : []; };
    const ERSTE = (K, kind) => { const s = stufen(K, kind); return s.length ? s[0] : 0; };
    const BUDGET = (K, kind) => { const s = stufen(K, kind); return s.length ? K.PRC.lod.budget[kind][s[0]].tris : NaN; };
    function netzMerkmale(g, w0, hZiel) {
        // Pass 0: die Höhe; mit hZiel (Kraut/Strauch ohne Welt-Maß im Kern) setzt die Merkmals-Höhe die Skala: dort KEIN Höhen-Test
        let Hraw = 0;
        g.traverse((o) => { if (!o.isMesh) return; const P = o.geometry.attributes.position.array; for (let v = 1; v < P.length; v += 3) if (P[v] > Hraw) Hraw = P[v]; });
        const w = hZiel > 0 ? hZiel / Math.max(1e-9, Hraw) : w0;
        const H = Hraw * w;
        const yb = (H >= 3 ? 1.3 : 0.08 * H) / w; // N1: der Schnitt in Brusthöhe (≥ 3 m) bzw. bei 8 % der Höhe
        let A = { ach: 0, gruen: 0, bluete: 0 }, ny = 0, tris = 0;
        const rs = [], schnitt = []; let x0 = Infinity, x1 = -Infinity, z0 = Infinity, z1 = -Infinity;
        g.traverse((o) => {
            if (!o.isMesh) return;
            const ge = o.geometry, P = ge.attributes.position.array, T = ge.attributes.aType ? ge.attributes.aType.array : null, C = ge.attributes.aCenter ? ge.attributes.aCenter.array : null, I = ge.index ? ge.index.array : null;
            const nv = P.length / 3;
            const rad = (v) => Math.hypot(P[3 * v] - C[3 * v], P[3 * v + 1] - C[3 * v + 1], P[3 * v + 2] - C[3 * v + 2]);
            for (let v = 0; v < nv; v++) {
                if (P[3 * v + 1] < 0) continue; // Wurzeln unter dem Grund zählen nicht
                x0 = Math.min(x0, P[3 * v]); x1 = Math.max(x1, P[3 * v]); z0 = Math.min(z0, P[3 * v + 2]); z1 = Math.max(z1, P[3 * v + 2]);
                if (T && T[v] === 0 && C) rs.push(rad(v) * w);
            }
            const n = I ? I.length / 3 : nv / 3; tris += n;
            for (let t = 0; t < n; t++) {
                const a = I ? I[3 * t] : 3 * t, b = I ? I[3 * t + 1] : 3 * t + 1, c = I ? I[3 * t + 2] : 3 * t + 2;
                const ya = P[3 * a + 1], yB = P[3 * b + 1], yc = P[3 * c + 1];
                if (ya < 0 && yB < 0 && yc < 0) continue;
                const ux = P[3 * b] - P[3 * a], uy = yB - ya, uz = P[3 * b + 2] - P[3 * a + 2], vx = P[3 * c] - P[3 * a], vy = yc - ya, vz = P[3 * c + 2] - P[3 * a + 2];
                const cx = uy * vz - uz * vy, cy = uz * vx - ux * vz, cz = ux * vy - uy * vx, L = Math.hypot(cx, cy, cz);
                const Ar = 0.5 * L * w * w, ty = T ? T[a] : 0;
                if (ty === 0) {
                    A.ach += Ar;
                    if (C && Math.min(ya, yB, yc) <= yb && Math.max(ya, yB, yc) >= yb)
                        schnitt.push([((rad(a) + rad(b) + rad(c)) / 3) * w, ((C[3 * a] + C[3 * b] + C[3 * c]) / 3) * w, ((C[3 * a + 2] + C[3 * b + 2] + C[3 * c + 2]) / 3) * w]);
                } else { A.gruen += Ar; ny += (Ar * Math.abs(cy)) / (L || 1); if (ty === 3) A.bluete += Ar; }
            }
        });
        const rMaxB = schnitt.reduce((m, q) => Math.max(m, q[0]), 0), lk = Math.max(0.004, 1.5 * rMaxB);
        const cl = [];
        for (const q of schnitt) { let h = cl.find((c) => Math.hypot(c.x - q[1], c.z - q[2]) <= lk); if (!h) { h = { x: q[1], z: q[2], r: [] }; cl.push(h); } h.r.push(q[0]); }
        const med = cl.map((c) => pct(c.r, 0.5)).sort((a, b) => b - a);
        const D = med.length ? 2 * med[0] : 0;
        const Atot = A.ach + A.gruen;
        return { H, D, stamm: med.filter((r) => r >= 0.35 * med[0]).length, S: D > 0 ? H / hKrit(D) : 0, blatt: Atot > 0 ? A.gruen / Atot : 0,
            dicke: rs.length ? pct(rs, 0.1) / Math.max(1e-9, pct(rs, 0.99)) : 0, breit: H > 0 ? ((x1 - x0 + z1 - z0) / 2) * w / H : 0,
            ny: A.gruen > 0 ? ny / A.gruen : NaN, bluete: A.bluete > 0, tris, hd: D > 0 ? H / D : Infinity };
    }
    const sha = (g) => { const Hh = crypto.createHash("sha1"); g.traverse((o) => { if (o.isMesh) for (const a of Object.values(o.geometry.attributes)) Hh.update(Buffer.from(a.array.buffer, a.array.byteOffset, a.array.byteLength)); }); return Hh.digest("hex").slice(0, 12); };
    const erg = [];
    for (const t of workerData.aufgaben) {
        const K = KW[t.welt];
        if (t.pre) K.PRESETS[t.id] = t.pre;
        const pre = K.PRESETS[t.id];
        if (t.baumH) setzeSkala(K, t.id, t.baumH / K.PC.artPhaenotyp(pre.s, pre).height); // Welt-Maß des Kerns (hoeheM trägt die Höhe)
        else if (t.skala != null) setzeSkala(K, t.id, t.skala);
        const lod = t.lod == null ? ERSTE(K, pre.kind) : t.lod;
        K.reset();
        const t0 = process.hrtime.bigint();
        let g = null, fehler = null;
        try { g = K.buildInstance(t.id, t.seed || 1, lod); } catch (e) { fehler = String(e.message || e).slice(0, 140); }
        const ms = Number(process.hrtime.bigint() - t0) / 1e6;
        if (t.hash) { erg.push({ k: t.k, sha: g ? sha(g) : null }); continue; }
        const m = g ? netzMerkmale(g, K.welt(t.id), t.hZiel || 0) : { tris: 0 };
        erg.push({ k: t.k, ...m, ms, fehler: fehler || K.warn(), budget: BUDGET(K, pre.kind) });
    }
    parentPort.postMessage(erg);
    return;
}

// ═════════════════════════ HAUPT: zieht die Arten, verteilt die Bauten, urteilt ═════════════════════════
const AUFG = []; // { k, welt, id, pre?, skala?, baumH?, hZiel?, seed?, lod?, hash? }
const auf = (t) => { AUFG.push(t); return t.k; };
// ── (0) Byte-Beweis: Original ↔ Kopie ohne `gesetz`
const BYTE_IDS = ["eiche", "fichte", "birke", "strauch", "farn", "gras"];
for (const id of BYTE_IDS) for (const w of ["A", "B"]) auf({ k: `byte:${id}:${w}`, welt: w, id, seed: 2, hash: true });
// ── (1a) PRESETS
const SOLL = { eiche: "baum", fichte: "baum", birke: "baum", weide: "baum", mammut: "baum", tanne: "baum", buche: "baum", karst: "baum", totholz: "baum", strauch: "strauch", gestruepp: "strauch", gras: "gras", schilf: "gras", farn: "farn", blume: "kraut" };
for (const id of Object.keys(SOLL)) for (const s of [1, 2]) auf({ k: `pre:${id}:${s}`, welt: "A", id, seed: s });
// ── (1b) 100 Arten je Wurzel BEDINGT
// μ_Wurzel/σ_Wurzel je Díaz-Achse (log10; H m · SM mg · SSD g/cm³ · LA mm² · LMA g/m² · N mg/g) — GEWÄHLT nach der Größenordnung der
// Wuchsform-Mittel (Díaz 2016 Abb. 2, Wright 2004/2017, Chave 2009) aus dem Gedächtnis: UNSICHER ±0,1–0,3. R ist die globale Matrix der
// Runde 1 (UNSICHER) — innerhalb einer Wurzel vermutlich schwächer.
const ACH = ["H", "SM", "SSD", "LA", "LMA", "N"];
const MUW = {
    laub:    { n: 22, mu: [1.05, 1.5, -0.24, 3.5, 1.9, 1.35],  sd: [0.2, 1.0, 0.08, 0.5, 0.15, 0.1] },
    nadel:   { n: 13, mu: [1.3, 1.0, -0.38, 1.4, 2.3, 1.05],   sd: [0.2, 0.5, 0.06, 0.4, 0.12, 0.1] },
    strauch: { n: 20, mu: [0.2, 1.0, -0.22, 2.8, 1.95, 1.3],   sd: [0.2, 1.0, 0.08, 0.6, 0.2, 0.15] },
    gras:    { n: 20, mu: [-0.4, 0.0, -0.6, 2.3, 1.75, 1.35],  sd: [0.3, 0.6, 0.1, 0.5, 0.15, 0.15] },
    farn:    { n: 15, mu: [-0.25, -3, -0.6, 3.8, 1.6, 1.35],   sd: [0.25, 0.3, 0.1, 0.4, 0.15, 0.1] },
    kraut:   { n: 10, mu: [-0.4, 0.0, -0.6, 3.0, 1.6, 1.45],   sd: [0.3, 0.8, 0.1, 0.5, 0.15, 0.12] },
};
const ERW = { laub: "baum", nadel: "baum", strauch: "strauch", gras: "gras", farn: "farn", kraut: "kraut" };
const RK = [[1, 0.5, 0.3, 0.3, 0.15, -0.15], [0.5, 1, 0.15, 0.4, 0.1, -0.05], [0.3, 0.15, 1, -0.05, 0.3, -0.25], [0.3, 0.4, -0.05, 1, 0.05, 0.05], [0.15, 0.1, 0.3, 0.05, 1, -0.6], [-0.15, -0.05, -0.25, 0.05, -0.6, 1]];
const chol = (A) => { const n = A.length, L = A.map(() => Array(n).fill(0)); for (let i = 0; i < n; i++) for (let j = 0; j <= i; j++) { let s = A[i][j]; for (let k = 0; k < j; k++) s -= L[i][k] * L[j][k]; if (i === j) L[i][i] = Math.sqrt(s); else L[i][j] = s / L[j][j]; } return L; };
const LR = chol(RK);
const sig = (x) => 1 / (1 + Math.exp(-x));
const hdGreenhill = (H, SSD) => { const E = 22e9 * SSD * 0.65, w = SSD * 1000 * 1.8 * 9.81; const Dk = Math.pow(H / (0.792 * Math.cbrt(E / w)), 1.5); return H / (1.77 * Dk); }; // Runde 1, c = 1,77 an der Fichte
const PRE_KRAUT = { // die Kraut-Zeilen der PRESETS (foundry-core.js:4763–4769, 4979–4984), wörtlich
    gras: { kind: "grass", fx: {} }, farn: { kind: "fern", fx: { leafCol: 0x3f6f2a, tipCol: 0x7aa244 } }, blume: { kind: "flower", fx: { flowerCol: 0xf2efe6, petalShape: "petal" } } };
function presetAus(m, wz, i) { // die Abbildung der Runde 1 (pflanzen.cjs:118–143) — OHNE bauplan(): die Wurzel ist gegeben
    const lgLA = Math.log10(m.LA), zf = (m.z[5] - m.z[4] - m.z[2]) / Math.sqrt(3);
    const slim = clamp(0.18 + (hdGreenhill(m.H, m.SSD) - 18) * (0.54 / 52), 0.05, 0.95), leaf = clamp((lgLA - 1.5) / 3.0, 0.05, 1);
    const trop = -0.15 + 0.75 * mulberry((i + 1) * 7919 + 104729)();
    if (wz === "laub" || wz === "nadel" || wz === "strauch") {
        const api = wz === "nadel" ? 0.74 + 0.18 * clamp((Math.log10(m.H) - 0.7) / 1, 0, 1) : wz === "laub" ? 0.25 + 0.35 * sig(1.5 * zf) : 0.04 + 0.14 * sig(zf);
        const ph = {};
        if (wz !== "strauch") ph.hoeheM = m.H;
        if (wz === "nadel") { ph.hd = hdGreenhill(m.H, m.SSD); ph.whorlSpacing = lerp(0.1, 0.15, sig(zf)); }
        if (wz === "laub") ph.crownBase = clamp(0.05 + 0.25 * sig((m.z[5] - m.z[4]) * 1.2), 0, 0.4);
        return { kind: wz === "strauch" ? "shrub" : "tree", panel: "plant", s: { api, delta: 2.0, slim, trop, leaf }, ph };
    }
    const B = PRE_KRAUT[{ gras: "gras", farn: "farn", kraut: "blume" }[wz]];
    return { kind: B.kind, panel: "plant", s: { api: clamp(0.3 + 0.8 * (Math.log10(m.LMA) - 1.7), 0.05, 0.95), delta: 2.0, slim: clamp(0.5 + 0.5 * (Math.log10(m.H) + 0.4), 0.05, 0.95), trop, leaf }, fx: B.fx };
}
const R = mulberry(20162);
const arten = [];
for (const wz of Object.keys(MUW)) for (let k = 0; k < MUW[wz].n; k++) {
    const i = arten.length, M = MUW[wz], n = ACH.map(() => normal(R)), z = LR.map((row) => row.reduce((s, v, j) => s + v * n[j], 0));
    const m = { z }; ACH.forEach((a, j) => (m[a] = Math.pow(10, M.mu[j] + M.sd[j] * z[j])));
    const id = "w2_" + i, pre = presetAus(m, wz, i), baum = wz === "laub" || wz === "nadel";
    arten.push({ i, id, wz, m, k: auf(baum ? { k: `art:${i}`, welt: "A", id, pre, baumH: m.H } : { k: `art:${i}`, welt: "A", id, pre, skala: 1, hZiel: m.H }) });
}
// ── (2) DIE DREI GESETZE (Kern-KOPIE, Welt-Skala 1: Vorlagen-Einheit = Meter). Jede Gesetz-Art fährt den Baum-Pfad (ph.kind "tree");
//     api bleibt unter der Nadel-Schwelle (N2).
const gesetzPre = (ph, s) => ({ kind: "tree", panel: "plant", s: Object.assign({ api: 0.3, delta: 2.3, slim: 0.5, trop: 0, leaf: 0.5 }, s || {}), ph: Object.assign({ kind: "tree" }, ph) });
const RG = mulberry(31337);
// (2a) KLETTERER — D = D_krit(L)·e^q; die Achse trägt sich bis H_krit(D_Fuß) über ihrer letzten Stütze (N3), dann sucht sie den Wirt
//      (Zylinder x, z, r, h — der Eingang aus der Welt), windet sich mit der Steigung 1,0 rad (GEWÄHLT) hoch, hängt über seine Krone;
//      ohne Wirt knickt sie oberhalb H_krit und wächst zum Grund.
const klPre = (L, q, wirt) => gesetzPre({ height: L / 1.25, maxDepth: 10, roots: 0, flare: 0, crownBase: 0, barkA: 0x5a4632, barkB: 0x7a6248,
    gesetz: { trunkR: (Dkrit(L) * Math.exp(q)) / 2, stammAnteil: 0.12, stuetz: { C: GH.C, eRhoG: GH.eRhoG, steig: 1.0, wirt } } }, { api: 0.7, slim: 0.6, leaf: 0.55 });
const kl = [];
for (let k = 0; k < 8; k++) {
    const L = Math.pow(10, 1.1 + 0.2 * normal(RG)), q = -0.9 + 0.3 * normal(RG); // GEWÄHLT: Achse 5–30 m, q um −0,9 (Schnitzer & Bongers 2002, Größenordnung)
    kl.push({ L, q, D: Dkrit(L) * Math.exp(q), k: auf({ k: `kl:${k}`, welt: "B", id: `kl${k}`, pre: klPre(L, q, { x: 0.6, z: 0, r: 0.25, h: 0.75 * L }), skala: 1 }),
        ko: auf({ k: `klo:${k}`, welt: "B", id: `klo${k}`, pre: klPre(L, q, null), skala: 1 }) });
}
// (2b) SUKKULENTE — V/A ≥ e_min·t_dry/u (e_min 0,05 mm/d, u 0,5 — GEWÄHLT, UNSICHER, Nobel 1988 Größenordnung). Säule r = 2·V/A; Kugel
//      r = 3·V/A wenn H ≤ 2 r_Kugel; Rosette (Blatt-Speicher) wenn LA ≥ 10³ mm² (GEWÄHLT). Rippen n = 2πr/λ (λ 3 cm, GEWÄHLT); Blatt-Anteil
//      f = e^(−r/1 cm) (GEWÄHLT): kein Zweig dünner als der Speicher (E10, statt da Vinci), das Blatt fällt mit dem Speicher.
const SP = { eMin: 0.05e-3, u: 0.5, lam: 0.03, rBlatt: 0.01 };
const speicher = (tDry, H, LA) => { const va = (SP.eMin * tDry) / SP.u; return { va, rS: 2 * va, rK: 3 * va, form: LA >= 1000 ? "rosette" : H <= 6 * va ? "kugel" : "saeule" }; };
const rippen = (r) => Math.round(clamp((2 * Math.PI * r) / SP.lam, 5, 30));
function suPre(tDry, H, LA) {
    const s = speicher(tDry, H, LA), gr = { barkA: 0x4e7a3a, barkB: 0x6a9a4a, roots: 0, flare: 0, crownBase: 0 };
    if (s.form === "rosette") return { s, pre: gesetzPre({ ...gr, height: H, maxDepth: 0, basalStems: Math.round(clamp(14 + 6 * Math.log10(LA / 1000), 8, 30)),
        gesetz: { trunkR: s.rS, speicher: { form: "rosette", rReq: s.rS, blattL: H * 1.3, taper: 0.25, fBlatt: 0 } } }, { api: 0.1 }) };
    if (s.form === "kugel") { const Rk = Math.max(s.rK, H / 2); return { s, pre: gesetzPre({ ...gr, height: 2 * Rk, maxDepth: 0,
        gesetz: { trunkR: Rk, stammAnteil: 1, speicher: { form: "kugel", rReq: Rk, rKugel: Rk, fBlatt: 0, rippen: rippen(Rk) } } }, { api: 0.5 }) }; }
    return { s, pre: gesetzPre({ ...gr, height: H, maxDepth: 2,
        gesetz: { trunkR: s.rS, stammAnteil: 0.55, speicher: { form: "saeule", rReq: s.rS, taper: 0.995, fBlatt: Math.exp(-s.rS / SP.rBlatt), rippen: rippen(s.rS) } } }, { api: 0.68, trop: -0.3 }) };
}
const su = [];
for (let k = 0; k < 12; k++) {
    const tDry = 60 + 240 * RG(), H = Math.pow(10, -0.1 + 0.45 * normal(RG)), LA = Math.pow(10, 2.2 + 0.8 * normal(RG)); // GEWÄHLT
    const { s, pre } = suPre(tDry, H, LA);
    su.push({ tDry, H, LA, sp: s, k: auf({ k: `su:${k}`, welt: "B", id: `su${k}`, pre, skala: 1 }) });
}
// (2c) MOOS — H_kap = 2γ/(ρ g r_k) (Jurin; γ 0,0728 N/m; Spalt r_k 0,15–0,5 mm GEWÄHLT), H = min(H_Merkmal, H_kap). Die Kolonie: n Sprosse
//      in der Vogel-Spirale über den Radius R; Polster (Kuppel, Sprosse fächern) wenn trocken, Teppich (flach) wenn feucht. n = 18 GEWÄHLT aus
//      der Kraut-Zeile (Lauf 2: 60 Sprosse = 11 856 Dreiecke > Zeile 3 800).
const hKap = (rk) => (2 * 0.0728) / (1000 * 9.81 * rk);
const mo = [];
for (let k = 0; k < 10; k++) {
    const rk = (0.15 + 0.35 * RG()) * 1e-3, Hm = Math.pow(10, -1.4 + 0.35 * normal(RG)), H = Math.min(Hm, hKap(rk)), trocken = RG() > 0.5, Rk = 0.15 + 0.2 * RG(), n = 18;
    const pre = gesetzPre({ height: H, maxDepth: 0, basalStems: n, roots: 0, flare: 0, crownBase: 0, barkA: 0x4a5a2a, barkB: 0x5e7034,
        gesetz: { trunkR: 0.0008, blattM: 1.25 * Rk * Math.sqrt(Math.PI / n), moos: { H, R: Rk, polster: trocken, rSpross: 0.0008 } } }, { api: 0.1, leaf: 0.9 });
    mo.push({ Hm, Hk: hKap(rk), H, trocken, k: auf({ k: `mo:${k}`, welt: "B", id: `mo${k}`, pre, skala: 1 }) });
}
// ── (3) ÜBERGÄNGE
const QS = [1.2, 0.8, 0.4, 0.2, 0, -0.2, -0.4, -0.8, -1.2];
const qs = QS.map((q, j) => ({ q, D: Dkrit(15) * Math.exp(q), k: auf({ k: `q:${j}`, welt: "B", id: `qs${j}`, pre: klPre(15, q, { x: 0.6, z: 0, r: 0.25, h: 11 }), skala: 1 }) }));
const TD = [0, 20, 40, 80, 120, 200, 300];
const td = TD.map((tDry, j) => {
    const s = speicher(tDry, 1.6, 100), ph = { height: 1.6, basalStems: 6, maxDepth: 6, roots: 0, crownBase: 0 };
    if (tDry > 0) ph.gesetz = { speicher: { rReq: s.rS, fBlatt: Math.exp(-s.rS / SP.rBlatt) } };
    return { tDry, s, k: auf({ k: `td:${j}`, welt: "B", id: `td${j}`, pre: gesetzPre(ph, { api: 0.15, slim: 0.3, leaf: 0.8, delta: 2.4 }), skala: 1 }) };
});

// ── der Pool
(async () => {
    const N = Math.max(2, Math.min(10, require("os").cpus().length - 4));
    // teure Bauten zuerst, reihum verteilt (Bäume, Kletterer, Moos), damit kein Arbeiter allein am Ende steht
    const gewicht = (t) => (t.welt === "B" && /^(kl|klo|q|mo)/.test(t.id) ? 3 : t.baumH ? 2 : 1);
    const sortiert = [...AUFG].sort((a, b) => gewicht(b) - gewicht(a));
    const pakete = Array.from({ length: N }, () => []); const last = Array(N).fill(0);
    for (const t of sortiert) { let j = 0; for (let x = 1; x < N; x++) if (last[x] < last[j]) j = x; pakete[j].push(t); last[j] += gewicht(t); }
    const tP = Date.now();
    const teile = await Promise.all(pakete.map((p, j) => new Promise((res, rej) => { const w = new Worker(__filename, { workerData: { aufgaben: p, schreibeKopie: j === 0 } }); w.once("message", res); w.once("error", rej); })));
    const E = {}; for (const t of teile) for (const r of t) E[r.k] = r;
    for (const k in E) if (E[k].tris != null) E[k].form = wuchsform(E[k]);
    const tPool = Date.now() - tP;
    const zeile = (m) => `H ${f1(m.H, 2)} m · Ø ${f1(m.D * 100, 1)} cm · Stämme ${m.stamm} · S ${f1(m.S, 2)} · Blatt ${f1(m.blatt, 2)} · Dicke ${f1(m.dicke, 2)} · B/H ${f1(m.breit, 1)} · |ny| ${f1(m.ny, 2)} · tris ${m.tris}`;
    const zaehl = (L, f) => L.filter(f).length;
    const verteil = (L) => Object.entries(L.reduce((o, r) => ((o[r.form] = (o[r.form] || 0) + 1), o), {})).sort((p, q) => q[1] - p[1]).map(([k, v]) => `${k} ${v}`).join(" · ");

    out(`=== SPIKE 2 leben.pflanzen.arten#2 — die fehlenden Wuchsformen (main 18058dba, nur gelesen) ===`);
    out(`${AUFG.length} Bauten in ${N} Arbeitern (je zwei vm-Welten: Original · Kopie mit benannten Ersetzungen E0–E17 → spike2/kern-kopie/phyto-core.js), Pool ${f1(tPool / 1000)} s`);
    out(`Greenhill: C = (7,8373/4)^⅓/2^⅔ = ${f1(GH.C, 4)} (Aufgabe ≈ 0,79 ✓) · E/ρg ${GH.eRhoG.toExponential(1)} m (UNSICHER) → H_krit(1 cm) ${f1(hKrit(0.01), 1)} m · (10 cm) ${f1(hKrit(0.1), 1)} m · (40 cm) ${f1(hKrit(0.4), 1)} m`);
    const byteGleich = BYTE_IDS.filter((id) => E[`byte:${id}:A`].sha && E[`byte:${id}:A`].sha === E[`byte:${id}:B`].sha).length;
    out(`Byte-Beweis Kopie ↔ Original ohne \`gesetz\` (sha1 aller Netz-Attribute, Saat 2): ${byteGleich}/${BYTE_IDS.length} gleich (${BYTE_IDS.join(", ")})`);

    out(`\n(1a) DER NETZ-RICHTER an den PRESETS (Soll = die Hand-Klasse der Zeile, NICHT aus Merkmalen; Saat 1 und 2, erste Stufe der Art)`);
    let pOk = 0, pN = 0, p4 = 0, p4N = 0; const pFehl = [];
    for (const id of Object.keys(SOLL)) for (const s of [1, 2]) {
        const r = E[`pre:${id}:${s}`]; pN++; const ok = r.form === SOLL[id]; if (ok) pOk++; else pFehl.push(`${id}@${s} → ${r.form}`);
        if (SOLL[id] !== "kraut") { p4N++; if (ok) p4++; }
        if (s === 1) out(`  ${id.padEnd(10)} Soll ${SOLL[id].padEnd(8)} Ist ${String(r.form).padEnd(10)} ${zeile(r)}`);
    }
    out(`  TRIFFT ${pOk}/${pN}${pFehl.length ? " · daneben: " + pFehl.join(", ") : ""}`);
    out(`  die vier Formen der Aufgabe (Baum/Strauch/Gras/Farn): ${p4}/${p4N} = ${f1((100 * p4) / p4N, 0)} %`);

    out(`\n(1b) 100 ARTEN, je Wurzel BEDINGT gezogen (μ_Wurzel, Strom 20162), gebaut im ECHTEN Kern, geurteilt am Netz`);
    let hit = 0;
    for (const a of arten) { a.r = E[a.k]; if (a.r.form === ERW[a.wz]) hit++; }
    for (const wz of Object.keys(MUW)) out(`  Wurzel ${wz.padEnd(8)} (soll ${ERW[wz].padEnd(7)}) n ${String(MUW[wz].n).padStart(2)}: ${verteil(arten.filter((a) => a.wz === wz).map((a) => a.r))}`);
    const hitOK = arten.filter((a) => a.wz !== "kraut" && a.r.form === ERW[a.wz]).length;
    out(`  ALS IHRE FORM GEBAUT: ${hit}/100 · ohne die Wurzel Kraut (nicht in der Liste der Sprosse) ${hitOK}/90 · Fehler ${zaehl(arten, (a) => a.r.fehler)} · Tris > Zeile ${zaehl(arten, (a) => a.r.tris > a.r.budget * 1.0001)}`);
    for (const a of arten.filter((a) => a.r.form !== ERW[a.wz] && a.wz !== "kraut").slice(0, 8)) out(`    daneben ${a.id} ${a.wz} H ${f1(a.m.H, 2)} → ${a.r.form}: ${zeile(a.r)}`);
    const holz = arten.filter((a) => ["laub", "nadel", "strauch"].includes(a.wz) && a.r.D > 0).map((a) => a.r.S);
    out(`  Selbst-Tragen der Holz-Arten S = H/H_krit(D): p5/p50/p95 ${f1(pct(holz, 0.05), 2)}/${f1(pct(holz, 0.5), 2)}/${f1(pct(holz, 0.95), 2)} · max ${f1(Math.max(...holz), 2)} (kein Baum über 1)`);
    const kurzGras = arten.filter((a) => a.wz === "gras" && a.r.form === "moos");
    if (kurzGras.length) out(`  Gras → Moos: ${kurzGras.length} Rasen unter 15 cm (H ${kurzGras.map((a) => f1(a.r.H * 100, 0)).join("/")} cm, |ny| ${kurzGras.map((a) => f1(a.r.ny, 2)).join("/")})`);

    out(`\n(2) DIE DREI FEHLENDEN GESETZE — Kern-KOPIE, gebaut über buildInstance → treeParams → growSkeleton → Röhre/Laub`);
    const zT = (L) => `tris p50/max ${Math.round(pct(L.map((r) => r.tris), 0.5))}/${Math.max(...L.map((r) => r.tris))} · Bau p50 ${f1(pct(L.map((r) => r.ms), 0.5), 0)} ms · Fehler ${zaehl(L, (r) => r.fehler)}`;
    const klR = kl.map((x) => Object.assign(E[x.k], { L: x.L, Dsoll: x.D })), klO = kl.map((x) => E[x.ko]);
    out(`  (2a) KLETTERER (Stütz-Gesetz, Wirt r 0,25 m, h 0,75·L): als Kletterer ${zaehl(klR, (r) => r.form === "kletterer")}/${klR.length} · ${zT(klR)} (Baum-Zeile ${klR[0].budget})`);
    out(`       Achse L p50 ${f1(pct(klR.map((r) => r.L), 0.5))} m · Ø Gesetz p50 ${f1(pct(klR.map((r) => r.Dsoll), 0.5) * 100, 1)} cm · Ø gemessen (1,3 m) ${f1(pct(klR.map((r) => r.D), 0.5) * 100, 1)} cm · H ${f1(pct(klR.map((r) => r.H), 0.5))} m · S ${f1(pct(klR.map((r) => r.S), 0.5), 2)}`);
    for (const r of klR.filter((r) => r.form !== "kletterer")) out(`       daneben → ${r.form}: ${zeile(r)}`);
    out(`       OHNE Wirt: ${verteil(klO)} · H p50 ${f1(pct(klO.map((r) => r.H), 0.5), 1)} m (H_krit(Ø Gesetz) p50 ${f1(pct(kl.map((x) => hKrit(x.D)), 0.5), 1)} m) · B/H p50 ${f1(pct(klO.map((r) => r.breit), 0.5), 1)}`);
    const suR = su.map((x) => Object.assign(E[x.k], { sp: x.sp, tDry: x.tDry }));
    const jeForm = (L, soll) => Object.entries(L.reduce((o, r) => { const f = r.sp.form; o[f] = o[f] || [0, 0]; o[f][0]++; if (r.form === soll) o[f][1]++; return o; }, {})).map(([f, [n, t]]) => `${f} ${t}/${n}`).join(" · ");
    out(`  (2b) SUKKULENTE (Wasser-Speicher, t_dry 60–300 d): als Sukkulente ${zaehl(suR, (r) => r.form === "sukkulente")}/${suR.length} (${jeForm(suR, "sukkulente")}) · ${zT(suR)}`);
    out(`       V/A p50 ${f1(pct(suR.map((r) => r.sp.va * 1000), 0.5))} mm · Ø p50 ${f1(pct(suR.map((r) => r.D * 100), 0.5), 1)} cm · H/D p50 ${f1(pct(suR.map((r) => r.hd), 0.5), 1)} · Dicke p50 ${f1(pct(suR.map((r) => r.dicke), 0.5), 2)} · Blatt p50 ${f1(pct(suR.map((r) => r.blatt), 0.5), 2)}`);
    for (const r of suR.filter((r) => r.form !== "sukkulente")) out(`       daneben ${r.sp.form} → ${r.form}: ${zeile(r)}`);
    const moR = mo.map((x) => Object.assign(E[x.k], { Hk: x.Hk, Hs: x.H, trocken: x.trocken }));
    out(`  (2c) MOOS (Kapillar-Grenze): als Moos ${zaehl(moR, (r) => r.form === "moos")}/${moR.length} · ${zT(moR)} (Kraut-Zeilen fern ${3800} · flower ${3600}, Baum ${moR[0].budget})`);
    out(`       H_kap p5–p95 ${f1(pct(moR.map((r) => r.Hk * 100), 0.05), 1)}–${f1(pct(moR.map((r) => r.Hk * 100), 0.95), 1)} cm · H gemessen p50 ${f1(pct(moR.map((r) => r.H * 100), 0.5), 1)} cm (Gesetz ${f1(pct(moR.map((r) => r.Hs * 100), 0.5), 1)}) · B/H p50 ${f1(pct(moR.map((r) => r.breit), 0.5), 1)} · |ny| p50 ${f1(pct(moR.map((r) => r.ny), 0.5), 2)} · Polster ${zaehl(moR, (r) => r.trocken)}/10`);
    for (const r of moR.filter((r) => r.form !== "moos")) out(`       daneben → ${r.form}: ${zeile(r)}`);

    out(`\n(3) ÜBERGÄNGE — stetige Achsen, derselbe Kern, derselbe Richter`);
    out(`  Baum ↔ Kletterer: Stütz-Investition q = ln(D/D_krit(L)), Achse L 15 m, Wirt h 11 m (Gesetz: q ≥ 0 trägt sich ganz)`);
    for (const x of qs) { const r = E[x.k]; out(`    q ${f1(x.q, 1).padStart(4)}: Ø Gesetz ${f1(x.D * 100, 1).padStart(5)} cm · Ø 1,3 m ${f1(r.D * 100, 1).padStart(5)} cm · H ${f1(r.H, 1)} m · S ${f1(r.S, 2)} → ${r.form}`); }
    out(`  Strauch ↔ Sukkulente: Trocken-Tage am Horst-Strauch 1,6 m (Baum-Pfad, N4): der Zweig wird nie dünner als der Speicher, das Blatt fällt`);
    for (const x of td) { const r = E[x.k]; out(`    t_dry ${String(x.tDry).padStart(3)} d: r_Speicher ${f1(x.s.rS * 1000, 1).padStart(5)} mm · Blatt ${f1(r.blatt, 2)} · Dicke ${f1(r.dicke, 2)} · Ø ${f1(r.D * 100, 1)} cm · Stämme ${r.stamm} · tris ${r.tris} → ${r.form}`); }

    const vier = p4 / p4N;
    const gs = { kletterer: [klR, "kletterer"], sukkulente: [suR, "sukkulente"], moos: [moR, "moos"] };
    const baubar = Object.fromEntries(Object.entries(gs).map(([k, [L]]) => [k, L.every((r) => !r.fehler && r.tris > 0)]));
    const erkannt = Object.fromEntries(Object.entries(gs).map(([k, [L, s]]) => [k, zaehl(L, (r) => r.form === s) / L.length]));
    const sieben = hitOK + zaehl(klR, (r) => r.form === "kletterer") + zaehl(suR, (r) => r.form === "sukkulente") + zaehl(moR, (r) => r.form === "moos");
    const siebenN = 90 + klR.length + suR.length + moR.length;
    out(`\nÜBER DIE SIEBEN FORMEN der Sprosse (90 Arten der heutigen Wurzeln ohne Kraut + ${klR.length + suR.length + moR.length} Gesetz-Arten): ${sieben}/${siebenN} = ${f1((100 * sieben) / siebenN, 0)} % als ihre Form am Netz`);
    out(`FALSIFIKATION (gesetzt vor Lauf 1): Netz-Richter trennt die 4 heutigen Formen < 90 % (${f1(100 * vier, 0)} %) ODER ein Gesetz ist mit dem Skelett-Apparat nicht baubar (${Object.entries(baubar).map(([k, v]) => `${k} ${v ? "baut" : "BAUT NICHT"}`).join(", ")}; am Netz erkannt ${Object.entries(erkannt).map(([k, v]) => `${k} ${f1(100 * v, 0)} %`).join(", ")})`);
    out(`  → ${vier < 0.9 || Object.values(baubar).some((v) => !v) ? "WIDERLEGT" : "NICHT widerlegt"}`);
    out(`Laufzeit ${((Date.now() - T0) / 1000).toFixed(1)} s`);
})().catch((e) => { console.error(e); process.exit(1); });
