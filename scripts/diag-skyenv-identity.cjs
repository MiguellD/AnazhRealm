// diag-skyenv-identity.cjs — DER BEWEIS DER IDENTITÄTS-STABILITÄT (V18.322, ECHTER Renderer).
// Die Wurzel des periodischen Idle-Freezes: _ensureSkyEnvironment allokierte pro Farb-Drift ein
// NEUES PMREM-Render-Target → ein NEUES scene.environment-Texture-Objekt → WebGPU rekompilierte
// die Pipelines ALLER env-samplenden PBR-Materialien (synchroner Multi-Sekunden-Stall). Die
// Heilung rendert in das BESTEHENDE Target (fromEquirectangular(equirekt, rt)). Diese Linse bootet
// den ECHTEN WebGPURenderer (NICHT den Null-Renderer — nur er nimmt den PMREM-Pfad), erzwingt
// mehrere Neugenerierungen mit STARK verschiedenen Himmelsfarben und beweist: scene.environment
// behält über alle Regenerierungen hinweg DIESELBE Texture-Identität (= kein Pipeline-Cascade).
// Die Objekt-Identität ist hardware-unabhängig (ein JS-===-Vergleich), der swiftshader genügt.
const puppeteer = require("puppeteer");
const http = require("http");
const fs = require("fs");
const path = require("path");
const PORT = Number(process.env.DIAG_PORT) || 4386;
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
    page.on("pageerror", (e) => console.log("[PAGE-ERROR]", (e.stack || e.message).split("\n")[0]));
    await page.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: "domcontentloaded", timeout: 30000 });
    // ECHTER Renderer (kein Null-Renderer) — auf rendererReady warten, Render gestubbt für Tempo.
    await page.evaluate(async () => {
        const start = performance.now();
        let stubbed = false;
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
                break;
            }
            await new Promise((res) => setTimeout(res, 50));
        }
    });

    const out = await page.evaluate(async () => {
        const r = window.anazhRealm, s = r.state;
        if (!s.rendererReady) return { err: "rendererReady nie erreicht" };
        if (s.renderer._isHeadlessNull) return { err: "Null-Renderer (PMREM-Pfad übersprungen) — der Test braucht den echten Renderer" };
        const u = s.skyboxUniforms;
        if (!u || !u.nebulaColor || !u.nebulaColor.value) return { err: "keine skyboxUniforms.nebulaColor" };

        const ids = []; // gesammelte scene.environment-Texture-Objekte
        const rtIds = []; // gesammelte _skyEnvRT-Objekte
        const seen = []; // (texture, rt) per Regen, zum ===-Vergleich
        let threw = null;
        // stark verschiedene Himmelsfarben → garantiert Drift >> 0.04 → echte Regenerierung
        const colors = [
            { r: 0.20, g: 0.22, b: 0.60 }, // nacht-blau
            { r: 0.85, g: 0.55, b: 0.30 }, // sonnenaufgang
            { r: 0.55, g: 0.75, b: 0.95 }, // tag-himmel
            { r: 0.30, g: 0.10, b: 0.15 }, // dämmerung-rot
            { r: 0.70, g: 0.80, b: 0.70 }, // dunst-grün
        ];
        for (let i = 0; i < colors.length; i++) {
            u.nebulaColor.value.setRGB(colors[i].r, colors[i].g, colors[i].b);
            try {
                // force=true erzwingt die Regenerierung (umgeht Drift- + Raten-Drossel) →
                // wir prüfen, dass SELBST bei jeder Regenerierung die Identität stabil bleibt.
                r._ensureSkyEnvironment(true);
            } catch (e) { threw = (e && e.message) || String(e); break; }
            const env = s.scene.environment;
            const rt = s._skyEnvRT;
            seen.push({
                envTexId: env ? (env.__diagId || (env.__diagId = ++window.__diagCtr || (window.__diagCtr = 1))) : null,
                rtId: rt ? (rt.__diagId || (rt.__diagId = ++window.__diagCtr || (window.__diagCtr = 1))) : null,
                envIsRtTexture: !!(env && rt && env === rt.texture),
            });
        }
        // Identitäts-Stabilität: alle env-Texturen müssen DASSELBE Objekt sein (= keine Churn)
        const firstEnv = seen.length ? seen[0].envTexId : null;
        const firstRt = seen.length ? seen[0].rtId : null;
        const envStable = seen.every((x) => x.envTexId === firstEnv && firstEnv != null);
        const rtStable = seen.every((x) => x.rtId === firstRt && firstRt != null);
        const envIsRt = seen.every((x) => x.envIsRtTexture);
        return { regens: seen.length, seen, envStable, rtStable, envIsRt, threw };
    });

    await browser.close();
    server.close();
    if (out.err) { console.error("❌", out.err); process.exit(1); }
    console.log("===== SKY-ENV IDENTITÄTS-STABILITÄT (echter Renderer, V18.322) =====\n");
    if (out.threw) { console.error(`❌ _ensureSkyEnvironment warf: ${out.threw}`); process.exit(1); }
    console.log(`  Regenerierungen (force, je andere Himmelsfarbe): ${out.regens}`);
    console.log(`  scene.environment-Texture-IDs je Regen: ${out.seen.map((x) => x.envTexId).join(", ")}`);
    console.log(`  _skyEnvRT-IDs je Regen:                  ${out.seen.map((x) => x.rtId).join(", ")}`);
    console.log(`  scene.environment === _skyEnvRT.texture:  ${out.seen.every((x) => x.envIsRtTexture)}\n`);
    const ok = out.envStable && out.rtStable && out.envIsRt && out.regens >= 3;
    if (ok) {
        console.log("✅ IDENTITÄT STABIL — scene.environment bleibt über alle Regenerierungen DASSELBE");
        console.log("   Texture-Objekt (das Target wird wiederverwendet) → kein WebGPU-Pipeline-Recompile-");
        console.log("   Cascade → der periodische Idle-Freeze ist an der Wurzel geheilt.");
    } else {
        console.log("❌ IDENTITÄT INSTABIL — scene.environment wechselt das Objekt (envStable=" + out.envStable + " rtStable=" + out.rtStable + " envIsRt=" + out.envIsRt + ") → Churn.");
    }
    process.exit(ok ? 0 : 1);
})().catch((e) => { console.error("Crash:", e); process.exit(1); });
