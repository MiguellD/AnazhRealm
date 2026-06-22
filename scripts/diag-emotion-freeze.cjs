// diag-emotion-freeze.cjs — JAGT den kurzen Freeze bei einem Emotions-Welt-Effekt (Schöpfer
// „Emotionen triggert neben dem Welt-Effekt einen kurzen Freeze"). Die Emotion feuert DSL-Ops
// (skybox_color · weather rainy/sunny · creatures_*). Welcher löst beim nächsten Render eine
// Pipeline-/Programm-(Re)Kompilierung aus (= der Stall)? Wir zählen die Compiles pro Effekt UND
// feuern jeden ZWEIMAL → einmalig (erst-Compile, vorwärmbar) vs jedesmal (Churn wie die Sky-Env).
// Backend-agnostisch (GPUDevice ODER WebGL2-linkProgram), winziges Viewport für Tempo.
const puppeteer = require("puppeteer");
const http = require("http");
const fs = require("fs");
const path = require("path");
const PORT = Number(process.env.DIAG_PORT) || 4393;
const root = path.resolve(__dirname, "..");
const mime = { ".html": "text/html", ".js": "application/javascript", ".wasm": "application/wasm", ".json": "application/json", ".woff2": "font/woff2", ".css": "text/css", ".png": "image/png" };
const server = http.createServer((req, res) => {
    let p = req.url.split("?")[0];
    if (p === "/") p = "/index.html";
    const fp = path.join(root, p);
    if (!fp.startsWith(root)) { res.statusCode = 403; return res.end(); }
    fs.readFile(fp, (e, d) => {
        if (e) { res.statusCode = 404; return res.end(); }
        res.setHeader("Content-Type", mime[path.extname(fp)] || "application/octet-stream");
        res.end(d);
    });
});
(async () => {
    await new Promise((r) => server.listen(PORT, r));
    const browser = await puppeteer.launch({ headless: true, protocolTimeout: 300000, args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--enable-webgl", "--ignore-gpu-blocklist", "--no-sandbox", "--disable-setuid-sandbox"] });
    const page = await browser.newPage();
    await page.setViewport({ width: 320, height: 240 });
    page.on("pageerror", (e) => console.log("[PAGE-ERROR]", (e.stack || e.message).split("\n")[0]));
    await page.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: "domcontentloaded", timeout: 30000 });
    await page.evaluate(async () => {
        const start = performance.now();
        let stubbed = false, lastSize = -1, stableFor = 0;
        while (performance.now() - start < 120000) {
            const r = window.anazhRealm;
            if (r && !stubbed && r.state && r.state.renderer) {
                window.__origRender = r.state.renderer.render.bind(r.state.renderer);
                r.state.renderer.render = function () {};
                if (typeof r.state.renderer.renderAsync === "function") r.state.renderer.renderAsync = () => Promise.resolve();
                r.state.postProcessingFailed = true;
                stubbed = true;
            }
            if (r && r.state && r.state.rendererReady && typeof r._gameLoopTick === "function") {
                try { r._gameLoopTick(performance.now()); } catch (_e) {}
                const sz = r.state.voxelChunks ? r.state.voxelChunks.size : 0;
                if (sz === lastSize) stableFor++; else { stableFor = 0; lastSize = sz; }
                if (sz > 30 && stableFor > 30) break;
            }
            await new Promise((res) => setTimeout(res, 6));
        }
        const r = window.anazhRealm;
        try { r._drainPendingWaterIso && r._drainPendingWaterIso(); r._drainPendingGrass && r._drainPendingGrass(); } catch (_e) {}
    });

    const setup = await page.evaluate(async () => {
        const r = window.anazhRealm, s = r.state;
        if (!s.rendererReady || !window.__origRender) return { err: "renderer nicht bereit" };
        if (s.renderer._isHeadlessNull) return { err: "Null-Renderer — der Test braucht den echten Renderer" };
        window.__cc = { gpuPipeline: 0, glLink: 0 };
        if (typeof GPUDevice !== "undefined" && GPUDevice.prototype) {
            for (const m of ["createRenderPipeline", "createRenderPipelineAsync"]) {
                const o = GPUDevice.prototype[m];
                if (typeof o === "function") GPUDevice.prototype[m] = function (...a) { window.__cc.gpuPipeline++; return o.apply(this, a); };
            }
        }
        if (typeof WebGL2RenderingContext !== "undefined" && WebGL2RenderingContext.prototype && WebGL2RenderingContext.prototype.linkProgram) {
            const o = WebGL2RenderingContext.prototype.linkProgram;
            WebGL2RenderingContext.prototype.linkProgram = function (...a) { window.__cc.glLink++; return o.apply(this, a); };
        }
        let backend = "?";
        try { const b = s.renderer.backend; if (b) backend = b.isWebGPUBackend ? "WebGPU" : b.isWebGLBackend ? "WebGL2" : (b.constructor && b.constructor.name) || "?"; } catch (_e) {}
        s.renderer.render = window.__origRender;
        s.postProcessingFailed = true;
        const cam = s.camera, pm = s.playerMesh;
        if (cam && pm) { cam.position.set(pm.position.x, pm.position.y + 1.6, pm.position.z); cam.lookAt(pm.position.x + 30, pm.position.y + 1, pm.position.z); cam.updateMatrixWorld(true); }
        for (let i = 0; i < 6; i++) { try { r._loopRender(performance.now()); } catch (_e) {} }
        return { backend, warmup: { ...window.__cc } };
    });
    if (setup.err) { await browser.close(); server.close(); console.error("❌", setup.err); process.exit(1); }

    // einen DSL-Welt-Effekt feuern + den Folge-Frame messen (eigener evaluate je Schritt)
    const fire = async (label, program) => {
        return await page.evaluate((label, program) => {
            const r = window.anazhRealm;
            const tot = () => window.__cc.gpuPipeline + window.__cc.glLink;
            const before = tot();
            try { r.dslRun(program, { source: "emotion-test" }); } catch (e) { return { label, err: (e && e.message) || String(e) }; }
            // ein paar Frames: Weather-Transition + Sky-Env brauchen Folge-Ticks
            for (let i = 0; i < 4; i++) { try { r._gameLoopTick(performance.now()); } catch (_e) {} try { r._loopRender(performance.now()); } catch (_e) {} }
            return { label, compiles: tot() - before };
        }, label, program);
    };

    const seq = [
        ["joy→skybox_color (1.)", ["skybox_color", "#f7d358"]],
        ["joy→skybox_color (2.)", ["skybox_color", "#f7d358"]],
        ["awe→skybox_color (1.)", ["skybox_color", "#d4a3ff"]],
        ["sorrow→weather rainy (1.)", ["weather", "rainy"]],
        ["weather sunny (1.)", ["weather", "sunny"]],
        ["sorrow→weather rainy (2.)", ["weather", "rainy"]],
        ["weather sunny (2.)", ["weather", "sunny"]],
    ];
    const out = [];
    for (const [label, prog] of seq) out.push(await fire(label, prog));

    await browser.close();
    server.close();
    console.log("===== EMOTIONS-WELT-EFFEKT: Pipeline-/Programm-(Re)Kompilierungen pro Effekt =====\n");
    console.log(`  Backend: ${setup.backend}  ·  Warmup-Compiles (gpuPipeline/glLink): ${setup.warmup.gpuPipeline}/${setup.warmup.glLink}`);
    if (setup.backend === "WebGL2") console.log("  (HINWEIS: WebGL2-Fallback → linkProgram; auf der echten WebGPU-GPU wären es Pipeline-Recompiles — Proxy.)");
    console.log("");
    for (const o of out) {
        if (o.err) { console.log(`  ${o.label.padEnd(30)} FEHLER: ${o.err}`); continue; }
        const flag = o.compiles >= 20 ? "  ⚠ FREEZE-VERDÄCHTIG" : o.compiles > 0 ? "  · klein" : "";
        console.log(`  ${o.label.padEnd(30)} recompiles ${String(o.compiles).padStart(5)}${flag}`);
    }
    console.log("\nLESART: ein hoher Wert beim 1. Mal + ~0 beim 2. Mal = einmaliger Erst-Compile (vorwärmbar).");
    console.log("Ein hoher Wert JEDES Mal = ein Churn (wie die Sky-Env-Identität — an der Wurzel zu heilen).");
    process.exit(0);
})().catch((e) => { console.error("Crash:", e); process.exit(1); });
