// diag-foundry-parity.cjs — P0 KILL-OR-COMMIT: die Foundry OHNE iframe == die Foundry MIT iframe?
//
// EINE Chromium-Seite fährt beide Produzenten NEBENEINANDER:
//   (a) das bestehende Studio-iframe  (worlds/terrain/index.html?asset-foundry=1)
//   (b) einen Web-WORKER, der dieselben Studio-Dateien lädt (three-r128 + libs + phyto-core +
//       phytogenesis) — self.__PHYTO_FOUNDRY_WORKER=true schaltet denselben Foundry-Modus.
// Beide bekommen IDENTISCHE build-asset-Anfragen in IDENTISCHER Reihenfolge (setSeasonColors ist
// stateful — gleiche Sequenz ⇒ gleiche Zustands-Trajektorie) und werden BYTE-verglichen:
// jede Attribut-Puffer-Byte, der Index, kind, die Material-Regler. Dazu recipes/world-params/
// render-config als JSON-Gleichheit, plus Boot- und Bau-Zeiten beider Seiten.
//
// AUSSER SCOPE (bewusst, Plan P5): bake-impostor / render-native — die brauchen den GL-Bäcker.
//
// GRÜN  ⇒ der Generator ist iframe-frei identisch → P2 (Kern-Split) + P3 (in-process) sind GO,
//          der iframe-Produktionsweg und der Grammatik-Fallback sind tote Männer.
// ROT   ⇒ der Report nennt die ERSTE Divergenz (Preset·Seed·LOD·Saison·Mesh·Attribut·Byte) —
//          das ist dann eine benannte Abhängigkeit mit Ort, keine Meinung.
//
//   node scripts/diag-foundry-parity.cjs
//   PARITY_SEEDS="1,7" PARITY_LODS="0,2" PARITY_SEASONS="summer" node scripts/diag-foundry-parity.cjs

const puppeteer = require("puppeteer");
const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = Number(process.env.PARITY_PORT || 4521);
const root = path.resolve(__dirname, "..");
const SEEDS = (process.env.PARITY_SEEDS || "1,7,12345,999983").split(",").map(Number);
const LODS = (process.env.PARITY_LODS || "0,1,2").split(",").map(Number);
const SEASONS = (process.env.PARITY_SEASONS || "spring,summer,autumn,winter").split(",");

const mime = {
    ".html": "text/html",
    ".js": "application/javascript",
    ".json": "application/json",
    ".css": "text/css",
    ".png": "image/png",
    ".woff2": "font/woff2",
};

// Die Studio-Script-Kette EXAKT wie worlds/terrain/index.html (Reihenfolge trägt: FoliagePass
// extends THREE.Pass braucht EffectComposer davor; phytogenesis liest __phytoCore).
const WORKER_SCRIPTS = [
    "/worlds/terrain/lib/three-r128.min.js",
    "/worlds/terrain/lib/OrbitControls.js",
    "/worlds/terrain/lib/PointerLockControls.js",
    "/worlds/terrain/lib/BufferGeometryUtils.js",
    "/worlds/terrain/lib/CopyShader.js",
    "/worlds/terrain/lib/LuminosityHighPassShader.js",
    "/worlds/terrain/lib/FXAAShader.js",
    "/worlds/terrain/lib/EffectComposer.js",
    "/worlds/terrain/lib/RenderPass.js",
    "/worlds/terrain/lib/MaskPass.js",
    "/worlds/terrain/lib/ShaderPass.js",
    "/worlds/terrain/lib/UnrealBloomPass.js",
    "/phyto-core.js",
    "/worlds/terrain/phytogenesis.js",
];

const PAGE = `<!doctype html><meta charset="utf-8"><title>P0 Foundry-Parität</title><body>
<script>
(() => {
    const T0 = performance.now();
    const S = (window.__PARITY = { phase: "boot", done: false, fails: [], cases: 0, ok: 0 });

    // ---------- Seite (a): das bestehende Studio-iframe ----------
    const iframe = document.createElement("iframe");
    iframe.setAttribute("sandbox", "allow-scripts allow-same-origin");
    iframe.style.cssText = "position:absolute;width:8px;height:8px;left:-9999px;visibility:hidden";
    iframe.src = "/worlds/terrain/index.html?asset-foundry=1&v=parity";
    const iframePending = new Map();
    let iframeReadyAt = 0;
    window.addEventListener("message", (ev) => {
        if (ev.source !== iframe.contentWindow) return;
        const m = ev.data;
        if (!m || typeof m !== "object") return;
        if (m.type === "ready" && m.world === "terrain" && !iframeReadyAt) iframeReadyAt = performance.now();
        const p = iframePending.get(m.reqId);
        if (p) { iframePending.delete(m.reqId); p(m); }
    });
    document.body.appendChild(iframe);
    let seq = 1;
    const askIframe = (msg) =>
        new Promise((res) => {
            const reqId = "i" + seq++;
            iframePending.set(reqId, res);
            iframe.contentWindow.postMessage(Object.assign({ reqId }, msg), "*");
        });

    // ---------- Seite (b): DIESELBEN Dateien als Worker ----------
    const boot =
        "self.__PHYTO_FOUNDRY_WORKER=true;" +
        "importScripts(" + ${JSON.stringify(WORKER_SCRIPTS)}.map((p) => JSON.stringify(location.origin + p)).join(",") + ");" +
        "init();"; // init() nimmt den Foundry-Zweig (Worker-Flag) und kehrt vor jedem Renderer zurück
    const worker = new Worker(URL.createObjectURL(new Blob([boot], { type: "text/javascript" })));
    const workerPending = new Map();
    let workerReadyAt = 0;
    let workerError = null;
    worker.onerror = (e) => { workerError = (e && e.message) || "Worker-Fehler"; };
    worker.onmessage = (ev) => {
        const m = ev.data;
        if (!m || typeof m !== "object") return;
        if (m.type === "ready" && m.world === "terrain" && !workerReadyAt) workerReadyAt = performance.now();
        const p = workerPending.get(m.reqId);
        if (p) { workerPending.delete(m.reqId); p(m); }
    };
    const askWorker = (msg) =>
        new Promise((res) => {
            const reqId = "w" + seq++;
            workerPending.set(reqId, res);
            worker.postMessage(Object.assign({ reqId }, msg));
        });

    // ---------- Byte-Vergleich ----------
    function firstDiffByte(a, b) {
        const x = new Uint8Array(a.buffer, a.byteOffset, a.byteLength);
        const y = new Uint8Array(b.buffer, b.byteOffset, b.byteLength);
        if (x.length !== y.length) return { at: -2, la: x.length, lb: y.length };
        for (let i = 0; i < x.length; i++) if (x[i] !== y[i]) return { at: i };
        return null;
    }
    function compareMeshes(tag, A, B) {
        if (A.length !== B.length) return tag + ": Mesh-Zahl " + A.length + " vs " + B.length;
        for (let i = 0; i < A.length; i++) {
            const a = A[i], b = B[i];
            if (a.kind !== b.kind) return tag + " Mesh" + i + ": kind " + a.kind + " vs " + b.kind;
            if (JSON.stringify(a.mat || null) !== JSON.stringify(b.mat || null))
                return tag + " Mesh" + i + ": mat " + JSON.stringify(a.mat) + " vs " + JSON.stringify(b.mat);
            const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
            keys.delete("kind"); keys.delete("mat"); keys.delete("index");
            for (const k of keys) {
                const av = a[k], bv = b[k];
                if (!av || !bv || !av.array || !bv.array)
                    return tag + " Mesh" + i + ": Attribut '" + k + "' fehlt auf einer Seite";
                if (av.itemSize !== bv.itemSize)
                    return tag + " Mesh" + i + "." + k + ": itemSize " + av.itemSize + " vs " + bv.itemSize;
                const d = firstDiffByte(av.array, bv.array);
                if (d) return tag + " Mesh" + i + "." + k + ": Byte-Divergenz " + JSON.stringify(d);
            }
            const ai = a.index || null, bi = b.index || null;
            if (!!ai !== !!bi) return tag + " Mesh" + i + ": index nur auf einer Seite";
            if (ai) { const d = firstDiffByte(ai, bi); if (d) return tag + " Mesh" + i + ".index: " + JSON.stringify(d); }
        }
        return null;
    }

    // ---------- Der Lauf ----------
    (async () => {
        // Beide Seiten booten lassen (das ready des iframes kommt nach seinem Studio-Boot,
        // das des Workers nach importScripts+init — die Differenz IST die erste Messzahl).
        S.phase = "warten auf ready";
        const t0 = performance.now();
        while ((!iframeReadyAt || !workerReadyAt) && performance.now() - t0 < 60000) {
            if (workerError) break;
            await new Promise((r) => setTimeout(r, 50));
        }
        if (workerError) { S.fails.push("WORKER-BOOT: " + workerError); S.done = true; return; }
        if (!iframeReadyAt || !workerReadyAt) { S.fails.push("ready-Timeout (iframe " + !!iframeReadyAt + ", worker " + !!workerReadyAt + ")"); S.done = true; return; }
        S.bootIframeMs = Math.round(iframeReadyAt - T0);
        S.bootWorkerMs = Math.round(workerReadyAt - T0);

        // Daten-Kanäle: recipes / world-params / render-config müssen JSON-identisch sein.
        S.phase = "daten-kanäle";
        const [rI, rW] = [await askIframe({ type: "get-recipes" }), await askWorker({ type: "get-recipes" })];
        if (JSON.stringify(rI.book) !== JSON.stringify(rW.book)) S.fails.push("recipes divergieren");
        const [pI, pW] = [await askIframe({ type: "get-world-params" }), await askWorker({ type: "get-world-params" })];
        if (JSON.stringify(pI.params) !== JSON.stringify(pW.params)) S.fails.push("world-params divergieren");
        const [cI, cW] = [await askIframe({ type: "get-render-config" }), await askWorker({ type: "get-render-config" })];
        if (JSON.stringify(cI.config) !== JSON.stringify(cW.config)) S.fails.push("render-config divergieren");

        const presets = Object.keys(rI.book || {});
        S.presets = presets.length;

        // Die Asset-Matrix — STRENG sequenziell, beide Seiten in identischer Reihenfolge.
        S.phase = "assets";
        const seeds = ${JSON.stringify(SEEDS)}, lods = ${JSON.stringify(LODS)}, seasons = ${JSON.stringify(SEASONS)};
        let msI = 0, msW = 0;
        for (const season of seasons)
            for (const presetId of presets)
                for (const seed of seeds)
                    for (const lod of lods) {
                        const tag = presetId + "·s" + seed + "·L" + lod + "·" + season;
                        const q = { type: "build-asset", presetId, seed, lod, season };
                        let a = performance.now();
                        const w = await askWorker(q); msW += performance.now() - a;
                        a = performance.now();
                        const f = await askIframe(q); msI += performance.now() - a;
                        S.cases++;
                        const err = compareMeshes(tag, w.meshes || [], f.meshes || []);
                        if (err) { S.fails.push(err); if (S.fails.length >= 5) { S.phase = "abbruch nach 5 fails"; S.done = true; return; } }
                        else S.ok++;
                        if ((w.meshes || []).length === 0) S.fails.push(tag + ": 0 Meshes (beide Seiten leer?)");
                    }
        S.msIframe = Math.round(msI); S.msWorker = Math.round(msW);
        S.done = true;
    })().catch((e) => { S.fails.push("HARNESS: " + (e && e.message)); S.done = true; });
})();
</script></body>`;

const server = http.createServer((req, res) => {
    let p = req.url.split("?")[0];
    if (p === "/" || p === "/__parity.html") {
        res.setHeader("Content-Type", "text/html");
        return res.end(PAGE);
    }
    const fp = path.join(root, p);
    if (!fp.startsWith(root)) return ((res.statusCode = 403), res.end());
    fs.readFile(fp, (err, data) => {
        if (err) return ((res.statusCode = 404), res.end());
        res.setHeader("Content-Type", mime[path.extname(fp)] || "application/octet-stream");
        res.end(data);
    });
});

(async () => {
    await new Promise((r) => server.listen(PORT, "127.0.0.1", r));
    const browser = await puppeteer.launch({
        headless: true,
        protocolTimeout: 240000,
        args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--no-sandbox", "--disable-setuid-sandbox"],
    });
    const page = await browser.newPage();
    const pageErrors = [];
    page.on("pageerror", (e) => pageErrors.push(String((e && e.message) || e)));
    page.on("console", (m) => {
        const t = m.text();
        if (/error|Fehler|divergier/i.test(t)) console.log("  [seite]", t.slice(0, 200));
    });
    await page.goto("http://127.0.0.1:" + PORT + "/__parity.html", { waitUntil: "domcontentloaded" });
    await page.waitForFunction("window.__PARITY && window.__PARITY.done === true", {
        timeout: 20 * 60 * 1000,
        polling: 500,
    });
    const S = await page.evaluate(() => window.__PARITY);
    await browser.close();
    server.close();

    console.log("=== P0 FOUNDRY-PARITÄT (Worker == iframe, byte-genau) ===");
    console.log("Presets:", S.presets, "· Fälle:", S.cases, "· identisch:", S.ok);
    console.log("Boot: iframe", S.bootIframeMs + " ms", "· Worker", S.bootWorkerMs + " ms");
    if (S.msIframe != null) console.log("Bau gesamt: iframe", S.msIframe + " ms", "· Worker", S.msWorker + " ms");
    if (pageErrors.length) console.log("Seiten-Fehler:", pageErrors.slice(0, 3));
    if (S.fails.length || pageErrors.length) {
        console.error("\\n❌ ROT — erste Befunde:");
        for (const f of S.fails.slice(0, 5)) console.error("  • " + f);
        process.exit(1);
    }
    console.log("\\n✅ GRÜN — der Generator ist iframe-frei byte-identisch. P2/P3 sind GO;");
    console.log("   der iframe-Produktionsweg und der Grammatik-Fallback sind ab hier tote Männer.");
    process.exit(0);
})().catch((e) => {
    console.error("Harness-Fehler:", (e && e.stack) || e);
    process.exit(2);
});
