// Nebenprobe: dieselbe Spike-Konifere am Kopf des Zweigs laub-kante (afb90b8e; Kerne per `git show` nach ./lk gelegt, nur gelesen).
"use strict";
const ROOT = "C:/Users/micha/AnazhRealm-profiband", fs = require("fs"), path = require("path");
const W = require(ROOT + "/scripts/lib/welt-boot.cjs"), vm = W.vm;
const absorber = () => { const a = new Proxy(function () {}, { get: (_t, k) => (k === Symbol.toPrimitive ? () => 0 : a), apply: () => a, construct: () => a }); return a; };
function lade(dir) {
    const sb = { console: { log() {}, warn() {}, error() {} }, Math, performance: { now: () => Date.now() }, setTimeout, clearTimeout };
    sb.self = sb.globalThis = sb.window = sb; sb.THREE = W.ENGINE_THREE();
    sb.OffscreenCanvas = function () { this.getContext = () => new Proxy({}, { get: (t, k) => (k === "createImageData" || k === "getImageData" ? (a, b, c, d) => ({ data: new Uint8ClampedArray((c || a) * (d || b) * 4) }) : k in t ? t[k] : () => absorber()), set: (t, k, v) => ((t[k] = v), true) }); };
    vm.createContext(sb);
    for (const f of ["phyto-core.js", "foundry-core.js", "foundry-bruecke.js"]) vm.runInContext(fs.readFileSync(path.join(dir, f), "utf8"), sb, { filename: f });
    vm.runInContext("self.__K = { PRESETS, skelettDerGestalt, PRC: PORTAL_RENDER_CONFIG }", sb);
    return sb.__K;
}
const wh = (K, id) => { try { const s = K.skelettDerGestalt(id, 1, 0); let yM = 0, lo = Infinity, hi = -Infinity; for (const l of s.nodes.leaves) { yM = Math.max(yM, l.pos[1]); lo = Math.min(lo, l.pos[0]); hi = Math.max(hi, l.pos[0]); } return `⌀/H ${((hi - lo) / yM).toFixed(2)}`; } catch (e) { return "WIRFT: " + String(e.message).slice(0, 110); } };
const art = (krone) => ({ kind: "tree", panel: "plant", s: { api: 0.8, delta: 2.0, slim: 0.62, trop: 0.1, leaf: 0.2 }, ph: Object.assign({ hoeheM: 25, hd: 60 }, krone ? { krone } : {}) });
for (const [nm, dir] of [["main 18058dba", ROOT], ["laub-kante afb90b8e", path.join(__dirname, "lk")]]) {
    const K = lade(dir);
    for (const [id, a] of [["neu_ohne_zeile", art()], ["neu_mit_fichte", art("fichte")], ["fichte", null]]) {
        if (a) { K.PRESETS[id] = a; K.PRC.placement.scale[id] = 25 / 6 / K.PRC.placement.treeScaleMul; }
        console.log(nm.padEnd(20), id.padEnd(16), wh(K, id));
    }
}
