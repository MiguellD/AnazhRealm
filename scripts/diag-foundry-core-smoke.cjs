// diag-foundry-core-smoke.cjs — der SCHNELLE Vorab-Beweis OHNE Browser (Sekunden, node-only):
// die Foundry (phytogenesis + Studio-Libs) läuft im self-Scope (node vm) wie in einem Worker —
// kein window, kein document — und beantwortet das volle Protokoll: recipes · world-params ·
// render-config · build-asset, plus DETERMINISMUS (gleicher Seed ⇒ byte-identische Puffer).
// Die Canvas-/Event-Stubs unten sind NUR node-Ersatz: ein echter Browser-Worker HAT
// OffscreenCanvas/addEventListener nativ (der Browser-Beweis ist diag-foundry-parity.cjs).
//   node scripts/diag-foundry-core-smoke.cjs
const fs = require("fs"),
    vm = require("vm"),
    path = require("path");
const ROOT = path.resolve(__dirname, "..");
const TERR = path.join(ROOT, "worlds", "terrain");
const posts = [];
function makeCtx2D(w, h) {
    const store = { fillStyle: "#000", strokeStyle: "#000", globalAlpha: 1, lineWidth: 1 };
    const grad = { addColorStop() {} };
    return new Proxy(store, {
        get(t, k) {
            if (k === "createImageData" || k === "getImageData")
                return (a, b, c2, d) => {
                    const W = k === "createImageData" ? a : c2,
                        H = k === "createImageData" ? b : d;
                    return { width: W, height: H, data: new Uint8ClampedArray(W * H * 4) };
                };
            if (k === "createLinearGradient" || k === "createRadialGradient") return () => grad;
            if (k === "measureText") return () => ({ width: 1 });
            if (k in t) return t[k];
            return () => {};
        },
        set(t, k, v) {
            t[k] = v;
            return true;
        },
    });
}
class OffscreenCanvas {
    constructor(w, h) {
        this.width = w;
        this.height = h;
    }
    getContext() {
        return makeCtx2D(this.width, this.height);
    }
}
const sandbox = {
    console,
    setTimeout,
    clearTimeout,
    setInterval,
    clearInterval,
    performance: { now: () => Date.now() },
    OffscreenCanvas,
    fetch: () => Promise.reject(new Error("kein fetch im Smoke")),
    postMessage: (p) => posts.push(p),
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => {},
    requestAnimationFrame: (f) => setTimeout(() => f(Date.now()), 16),
    cancelAnimationFrame: clearTimeout,
};
sandbox.self = sandbox;
sandbox.globalThis = sandbox;
sandbox.__PHYTO_FOUNDRY_WORKER = true;
vm.createContext(sandbox);
const LIBS = [
    "three-r128.min.js",
    "OrbitControls.js",
    "PointerLockControls.js",
    "BufferGeometryUtils.js",
    "CopyShader.js",
    "LuminosityHighPassShader.js",
    "FXAAShader.js",
    "EffectComposer.js",
    "RenderPass.js",
    "MaskPass.js",
    "ShaderPass.js",
    "UnrealBloomPass.js",
];
for (const f of LIBS) vm.runInContext(fs.readFileSync(path.join(TERR, "lib", f), "utf8"), sandbox, { filename: f });
vm.runInContext(fs.readFileSync(path.join(ROOT, "phyto-core.js"), "utf8"), sandbox, { filename: "phyto-core.js" });
// P2: der Studio-Generator-Kern (foundry-core.js) VOR phytogenesis.js (die Shell liest seine Globals).
vm.runInContext(fs.readFileSync(path.join(ROOT, "foundry-core.js"), "utf8"), sandbox, { filename: "foundry-core.js" });
vm.runInContext(fs.readFileSync(path.join(TERR, "phytogenesis.js"), "utf8"), sandbox, { filename: "phytogenesis.js" });
if (typeof sandbox.onmessage !== "function") {
    console.error("❌ Brücke hat self.onmessage nicht verdrahtet");
    process.exit(1);
}
const send = (msg) => sandbox.onmessage({ data: msg });
send({ type: "get-book", reqId: "r" }); // SYNERGIE-WELLE: der EINE Umschlag
send({ type: "build-asset", reqId: "a1", presetId: "eiche", seed: 7, lod: 0, season: "summer" });
send({ type: "build-asset", reqId: "a2", presetId: "eiche", seed: 7, lod: 0, season: "summer" });
send({ type: "build-asset", reqId: "a3", presetId: "tanne", seed: 12345, lod: 1, season: "autumn" });
const by = {};
for (const p of posts) by[p.reqId || p.type] = p;
const rec = by.r,
    a1 = by.a1,
    a2 = by.a2,
    a3 = by.a3;
console.log("Rezepte:", rec && rec.book ? Object.keys(rec.book).length + " Presets ✅" : "❌");
console.log(
    "World-Params:",
    by.r && by.r.worldParams && by.r.worldParams.ground ? "✅" : "❌",
    "· Render-Config:",
    by.r && by.r.renderConfig ? "✅" : "❌"
);
const tot = (m, f) => m.reduce((s, x) => s + (x[f] && x[f].array ? x[f].array.length : 0), 0);
if (!a1 || !a1.meshes || !a1.meshes.length) {
    console.error("❌ build-asset eiche leer");
    process.exit(1);
}
console.log(
    "eiche L0:",
    a1.meshes.length,
    "Meshes ·",
    tot(a1.meshes, "position") / 3,
    "Verts · kinds:",
    a1.meshes.map((m) => m.kind).join(",")
);
console.log("tanne L1:", a3.meshes.length, "Meshes ·", tot(a3.meshes, "position") / 3, "Verts");
let ok = a1.meshes.length === a2.meshes.length;
for (let i = 0; ok && i < a1.meshes.length; i++) {
    const A = a1.meshes[i],
        B = a2.meshes[i];
    for (const k of Object.keys(A)) {
        if (A[k] && A[k].array) {
            ok = B[k] && Buffer.from(A[k].array.buffer).equals(Buffer.from(B[k].array.buffer));
            if (!ok) {
                console.error("  Divergenz in", k, "Mesh", i);
                break;
            }
        }
    }
    if (ok && A.index) ok = B.index && Buffer.from(A.index.buffer).equals(Buffer.from(B.index.buffer));
}
console.log("Determinismus (seed 7, 2 Läufe, byte-Vergleich):", ok ? "✅ identisch" : "❌ DIVERGENT");
process.exit(ok ? 0 : 1);
