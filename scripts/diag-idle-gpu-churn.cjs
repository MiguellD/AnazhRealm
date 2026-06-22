// diag-idle-gpu-churn.cjs — DIE STEHENDE LINSE gegen die V18.322-Fehlerklasse (Gesetz #0):
// „eine pro-Frame/periodisch neu kompilierte GPU-Pipeline im Steady-State". Der Bug, der 50+
// Versionen überlebte (scene.environment-Identitäts-Churn → Recompile-Cascade = der Idle-Freeze),
// war für das Gate STRUKTURELL unsichtbar: der Null-Renderer stubt den GPU-Pfad UND
// _ensureSkyEnvironment hat ein `if (_isHeadlessNull) return` VOR dem PMREM. Diese Linse läuft
// auf dem ECHTEN Renderer (swiftshader) und zählt `createRenderPipeline`/`linkProgram` (WebGPU
// bzw. WebGL2-Fallback) — beide hardware-unabhängig im MECHANISMUS (Dawn ruft es auch unter
// swiftshader). VERDIKT: nach Warmup darf weder reines Idle noch eine Env-Regenerierung eine
// einzige Pipeline NEU kompilieren. Schlägt das fehl → exit≠0 → die CI macht den Build ROT,
// bevor irgendwer den Freeze spürt. Die Struktur trägt die Disziplin, nicht das Gedächtnis.
//
// Lauf: node scripts/diag-idle-gpu-churn.cjs   (CI: npm run gpu-lens)
const puppeteer = require("puppeteer");
const http = require("http");
const fs = require("fs");
const path = require("path");
const PORT = Number(process.env.DIAG_PORT) || 4395;
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
// generöse Schwelle: ein Recompile-CASCADE ist Dutzende+ (Sky-Env-Bug war ~270/Regen); ein paar
// Erst-Compile-Nachzügler im Idle-Fenster (eine neue Animations-/LOD-Variante) sind kein Churn.
const IDLE_THRESHOLD = 8; // reines Idle (kein Env-Trigger) — sollte ~0 sein
const REGEN_THRESHOLD = 4; // Env-Regenerierung — MUSS ~0 sein (die scharfe Wand gegen V18.322)
(async () => {
    await new Promise((r) => server.listen(PORT, r));
    const browser = await puppeteer.launch({ headless: true, protocolTimeout: 300000, args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--enable-webgl", "--ignore-gpu-blocklist", "--no-sandbox", "--disable-setuid-sandbox"] });
    const page = await browser.newPage();
    await page.setViewport({ width: 320, height: 240 }); // klein → schnelle Rasterung; Compile ist res-unabhängig
    let pageErr = null;
    page.on("pageerror", (e) => { pageErr = (e.stack || e.message).split("\n")[0]; console.log("[PAGE-ERROR]", pageErr); });
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
    });

    // PHASE 1 — Compiler auf Prototyp-Ebene wrappen + Warmup (alle Pipelines EINMAL kompilieren)
    const setup = await page.evaluate(async () => {
        const r = window.anazhRealm, s = r.state;
        if (!s.rendererReady || !window.__origRender) return { err: "renderer nicht bereit" };
        if (s.renderer._isHeadlessNull) return { err: "Null-Renderer — die Linse braucht den ECHTEN Renderer (sonst blind, das ist der ganze Punkt)" };
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
        // Warmup: Env setzen + viele Frames + ein paar Game-Ticks → ALLE Steady-State-Pipelines compilen
        try { r._ensureSkyEnvironment(true); } catch (_e) {}
        for (let i = 0; i < 10; i++) { try { r._gameLoopTick(performance.now()); } catch (_e) {} try { r._loopRender(performance.now()); } catch (_e) {} }
        const tot = () => window.__cc.gpuPipeline + window.__cc.glLink;
        return { backend, warmupCompiles: tot() };
    });
    if (setup.err) { await browser.close(); server.close(); console.error("⛔ LINSE NICHT LAUFFÄHIG:", setup.err); process.exit(1); }
    if (setup.warmupCompiles === 0) { await browser.close(); server.close(); console.error("⛔ LINSE UNGÜLTIG: 0 Warmup-Compiles → der Zähler greift nicht (kein Compiler gewrappt) → die Linse wäre blind grün."); process.exit(1); }

    // CHECK A — REINES IDLE: nach Warmup N Idle-Frames; KEINE Pipeline darf neu kompilieren.
    const idle = await page.evaluate(async () => {
        const r = window.anazhRealm;
        const tot = () => window.__cc.gpuPipeline + window.__cc.glLink;
        const before = tot();
        for (let i = 0; i < 16; i++) { try { r._gameLoopTick(performance.now()); } catch (_e) {} try { r._loopRender(performance.now()); } catch (_e) {} }
        return tot() - before;
    });

    // CHECK B — ENV-REGENERIERUNG (die scharfe V18.322-Wand): die Himmelsfarbe wechselt (wie die
    // Tag-Nacht-Uhr es im Stehen tut) → die Env regeneriert. Eine KORREKTE Implementierung nutzt
    // das Target wieder (stabile Identität → 0 Recompiles); der alte Churn rekompilierte ~270/Regen.
    const regen = await page.evaluate(async () => {
        const r = window.anazhRealm, s = r.state, u = s.skyboxUniforms;
        if (!u || !u.nebulaColor) return { err: "keine skyboxUniforms.nebulaColor" };
        const tot = () => window.__cc.gpuPipeline + window.__cc.glLink;
        const before = tot();
        const colors = [[0.85, 0.55, 0.30], [0.55, 0.75, 0.95], [0.30, 0.10, 0.15], [0.70, 0.80, 0.70]];
        for (const c of colors) {
            u.nebulaColor.value.setRGB(c[0], c[1], c[2]);
            s._skyEnvLastRegenMs = -1e9; // die Raten-Drossel umgehen → mehrere echte Regenerierungen erzwingen
            try { r._ensureSkyEnvironment(true); } catch (_e) {}
            try { r._loopRender(performance.now()); } catch (_e) {}
        }
        return { compiles: tot() - before };
    });

    await browser.close();
    server.close();
    console.log("===== STEHENDE LINSE — Idle/Env-GPU-Pipeline-Churn (echter Renderer) =====\n");
    if (pageErr) { console.error("⛔ Page-Error während des Laufs:", pageErr); process.exit(1); }
    if (regen.err) { console.error("⛔ LINSE NICHT LAUFFÄHIG:", regen.err); process.exit(1); }
    console.log(`  Backend: ${setup.backend}  ·  Warmup-Compiles (einmalig): ${setup.warmupCompiles}\n`);
    const idleOk = idle <= IDLE_THRESHOLD;
    const regenOk = regen.compiles <= REGEN_THRESHOLD;
    console.log(`  CHECK A — reines Idle (16 Frames):      ${idle} Recompiles   (Schwelle ≤${IDLE_THRESHOLD})  ${idleOk ? "✅" : "❌ CHURN"}`);
    console.log(`  CHECK B — Env-Regenerierung (4 Farben): ${regen.compiles} Recompiles   (Schwelle ≤${REGEN_THRESHOLD})  ${regenOk ? "✅" : "❌ RECOMPILE-CASCADE (die V18.322-Klasse!)"}`);
    console.log("");
    if (idleOk && regenOk) {
        console.log("✅ KEINE Steady-State-Pipeline-Rekompilierung — der periodische Idle-Freeze KANN nicht zurückkehren,");
        console.log("   ohne diese Linse rot zu machen. (Die Struktur trägt die Disziplin, nicht das Gedächtnis.)");
        process.exit(0);
    }
    console.log("⛔ GPU-PIPELINE-CHURN IM STEADY-STATE — eine Operation kompiliert pro Frame/Regen neu.");
    console.log("   Das ist die V18.322-Fehlerklasse (ein per-Drift wechselndes scene.environment ODER eine andere");
    console.log("   pro-Frame neu allokierte Render-Ressource). Heile sie identitäts-stabil + rate-gedeckelt,");
    console.log("   NICHT durch Wegdrosseln des Symptoms. (CLAUDE.md: Rendering · scene.environment IDENTITÄTS-STABIL.)");
    process.exit(2);
})().catch((e) => { console.error("Crash:", e); process.exit(1); });
