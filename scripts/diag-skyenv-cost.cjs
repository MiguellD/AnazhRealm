// diag-skyenv-cost.cjs — DIE KAUSAL-MESSUNG (V18.322), SAUBERES SIGNAL: zählt die echten GPU-
// Pipeline-(Re)Kompilierungen statt der swiftshader-verrauschten Frame-ZEIT. Frage: zwingt ein
// scene.environment-IDENTITÄTS-Wechsel Three.js, `device.createRenderPipeline(Async)` erneut zu
// rufen (= Recompile-Cascade = der Stall)? Wir wrappen das GPUDevice + zählen. ALT (Identität
// wechselt pro Regen) vs NEU (Identität stabil, der Fix). Steigt der ALT-Compile-Zähler und der
// NEU-Zähler bleibt ~0, ist der Identitäts-Wechsel KAUSAL der Stall → der Fix trifft die Wurzel.
// Bleiben beide ~0, war der Identitäts-Wechsel NICHT der Recompile-Auslöser → ich suche weiter
// (ehrlich). Pipeline-Compile-Zählung ist mechanisch hardware-unabhängig (Dawn ruft es auch unter
// swiftshader); winziges Viewport (Rasterung schnell, Compile resolution-unabhängig).
const puppeteer = require("puppeteer");
const http = require("http");
const fs = require("fs");
const path = require("path");
const PORT = Number(process.env.DIAG_PORT) || 4391;
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
    await page.setViewport({ width: 320, height: 240 }); // klein → schnelle Rasterung; Compile ist res-unabhängig
    page.on("pageerror", (e) => console.log("[PAGE-ERROR]", (e.stack || e.message).split("\n")[0]));
    await page.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: "domcontentloaded", timeout: 30000 });
    // settle MIT gestubbtem Render (Tempo)
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
        for (const id of ["dialogue-box", "intro-overlay", "onboarding", "start-overlay", "modal-overlay"]) { const el = document.getElementById(id); if (el) el.style.display = "none"; }
    });

    // PHASE 1: die Pipeline-/Programm-Kompilierung auf PROTOTYP-Ebene wrappen (backend-agnostisch:
    // echtes WebGPU → GPUDevice.createRenderPipeline(Async); WebGL2-Fallback → linkProgram) + Warmup.
    const setup = await page.evaluate(async () => {
        const r = window.anazhRealm, s = r.state;
        if (!s.rendererReady || !window.__origRender) return { err: "renderer nicht bereit" };
        if (s.renderer._isHeadlessNull) return { err: "Null-Renderer — der Test braucht den echten Renderer" };
        const renderer = s.renderer;
        window.__cc = { gpuPipeline: 0, glLink: 0 };
        // robust: den PROTOTYP patchen → zählt ALLE Kompilierungen, egal wo das Device-Objekt liegt
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
        // Backend-Typ bestimmen (für die Lesart: WebGPU vs WebGL2-Fallback)
        let backend = "?";
        try { const b = renderer.backend; if (b) backend = b.isWebGPUBackend ? "WebGPU" : b.isWebGLBackend ? "WebGL2" : (b.constructor && b.constructor.name) || "?"; } catch (_e) {}
        renderer.render = window.__origRender; // ECHTER Render
        s.postProcessingFailed = true;
        const cam = s.camera, pm = s.playerMesh;
        if (cam && pm) { cam.position.set(pm.position.x, pm.position.y + 1.6, pm.position.z); cam.lookAt(pm.position.x + 30, pm.position.y + 1, pm.position.z); cam.updateMatrixWorld(true); }
        // Warmup: erst-Env + ein paar Renders → alle Pipelines/Programme kompilieren EINMAL
        try { r._ensureSkyEnvironment(true); } catch (_e) {}
        for (let i = 0; i < 5; i++) { try { r._loopRender(performance.now()); } catch (_e) {} }
        return { backend, warmup: { ...window.__cc } };
    });
    if (setup.err) { await browser.close(); server.close(); console.error("❌", setup.err); process.exit(1); }

    // ein Render-Schritt + Compile-Delta, gekapselt (eigener evaluate je Schritt → kein protocolTimeout-Stau)
    const step = async (mode, rgb) => {
        return await page.evaluate((mode, rgb) => {
            const r = window.anazhRealm, s = r.state, u = s.skyboxUniforms;
            const tot = () => window.__cc.gpuPipeline + window.__cc.glLink;
            const before = tot();
            u.nebulaColor.value.setRGB(rgb[0], rgb[1], rgb[2]);
            s._skyEnvLastRegenMs = -1e9; // Raten-Drossel umgehen → fairer A/B (nur die Identität unterscheidet)
            if (mode === "old") { try { if (s._skyEnvRT && s._skyEnvRT.dispose) s._skyEnvRT.dispose(); } catch (_e) {} s._skyEnvRT = null; } // → neue Identität
            try { r._ensureSkyEnvironment(true); } catch (_e) {}
            const afterRegen = tot(); // Compiles durch die Regenerierung selbst (PMREM-Pipelines)
            try { r._loopRender(performance.now()); } catch (_e) {} // der Frame, der bei Identitäts-Wechsel rekompiliert
            const afterRender = tot();
            return { regenCompiles: afterRegen - before, renderCompiles: afterRender - afterRegen, total: afterRender - before };
        }, mode, rgb);
    };
    const colors = [[0.85, 0.55, 0.30], [0.55, 0.75, 0.95], [0.30, 0.10, 0.15], [0.70, 0.80, 0.70]];
    const old = [], neu = [];
    for (let i = 0; i < colors.length; i++) old.push(await step("old", colors[i]));
    for (let i = 0; i < colors.length; i++) neu.push(await step("new", [colors[i][1], colors[i][2], colors[i][0]]));

    await browser.close();
    server.close();
    const sum = (a, k) => a.reduce((s, x) => s + x[k], 0);
    const oldRender = sum(old, "renderCompiles"), newRender = sum(neu, "renderCompiles");
    const oldRegen = sum(old, "regenCompiles"), newRegen = sum(neu, "regenCompiles");
    console.log("===== SKY-ENV KAUSAL: Pipeline-/Programm-(Re)Kompilierungen pro Env-Regenerierung =====\n");
    console.log(`  Backend: ${setup.backend}  ·  Warmup-Compiles (einmalig, gpuPipeline/glLink): ${setup.warmup.gpuPipeline}/${setup.warmup.glLink}`);
    if (setup.backend === "WebGL2") console.log("  (HINWEIS: headless nutzt den WebGL2-Fallback → linkProgram zählt; auf der echten WebGPU-GPU des Schöpfers wären es Pipeline-Recompiles — ein PROXY, kein 1:1-Beweis.)");
    console.log("");
    console.log(`  ALT (Identität wechselt): regen-compiles ${old.map((x) => x.regenCompiles).join("/")}  ·  RENDER-compiles ${old.map((x) => x.renderCompiles).join("/")}  (Σ render ${oldRender})`);
    console.log(`  NEU (Identität stabil):   regen-compiles ${neu.map((x) => x.regenCompiles).join("/")}  ·  RENDER-compiles ${neu.map((x) => x.renderCompiles).join("/")}  (Σ render ${newRender})\n`);
    console.log(`  Render-Pipeline-Recompiles: ALT Σ${oldRender}  vs  NEU Σ${newRender}   (Regen-eigene: ALT ${oldRegen} / NEU ${newRegen})`);
    if (oldRender >= 3 && oldRender >= newRender * 2 + 2) {
        console.log("\n✅ KAUSAL BESTÄTIGT — der Identitäts-Wechsel löst beim nächsten Render eine Pipeline-Recompile-");
        console.log("   Cascade aus (Σ" + oldRender + "), die stabile Identität nicht (Σ" + newRender + ") → der Multi-Sekunden-Stall");
        console.log("   auf der echten GPU; der Fix (Target-Wiederverwendung) tilgt ihn an der Wurzel.");
        process.exit(0);
    } else if (oldRender <= newRender + 1 && oldRender < 3) {
        console.log("\n⚠ NICHT BESTÄTIGT — kein Render-Recompile beim Identitäts-Wechsel (ALT≈NEU≈0). Der Identitäts-");
        console.log("   Wechsel ist NICHT der Stall-Auslöser → die Wurzel liegt woanders. EHRLICH: weitersuchen,");
        console.log("   der Flugschreiber (anazhRealmPerf.json) von der echten GPU muss den periodischen GPU-Op zeigen.");
        process.exit(2);
    } else {
        console.log("\n≈ UNEINDEUTIG — ALT " + oldRender + " vs NEU " + newRender + ". Kein klares Signal; der Flugschreiber entscheidet.");
        process.exit(3);
    }
})().catch((e) => { console.error("Crash:", e); process.exit(1); });
