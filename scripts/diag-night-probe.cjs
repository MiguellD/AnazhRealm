// DIE NACHT-FARB-LINSE (V18.377/.378, stehend — CLAUDE.md-Gotcha referenziert sie): bei
// „ausgewaschene/orange/falsche Nacht" ZUERST die Farb-QUELLEN als Zahlen messen statt raten —
// nebula (Himmel) · fog (der V18.377-Befund: der warme Erd-Term dominierte nachts) · ambient ·
// hemi · directional (Sonne tags / Mond nachts: kühl b>r, gedämpft, ÜBER dem Horizont).
// Schneller Null-Renderer-Pfad (~60 s), kein Screenshot — MECHANIK braucht eine ZAHL.
const puppeteer = require("puppeteer");
const http = require("http");
const fs = require("fs");
const path = require("path");
const PORT = 4399;
const root = path.resolve(__dirname, "..");
const mime = { ".html": "text/html", ".js": "application/javascript", ".wasm": "application/wasm", ".json": "application/json", ".css": "text/css", ".png": "image/png" };
const server = http.createServer((req, res) => {
    let p = req.url.split("?")[0]; if (p === "/") p = "/index.html";
    const fp = path.join(root, p);
    if (!fp.startsWith(root)) { res.statusCode = 403; return res.end(); }
    fs.readFile(fp, (err, data) => { if (err) { res.statusCode = 404; return res.end(); } res.setHeader("Content-Type", mime[path.extname(fp)] || "application/octet-stream"); res.end(data); });
});
(async () => {
    await new Promise((r) => server.listen(PORT, r));
    const browser = await puppeteer.launch({ headless: true, protocolTimeout: 300000, args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--no-sandbox", "--disable-setuid-sandbox"] });
    const page = await browser.newPage();
    page.on("pageerror", (e) => console.log("[PAGE-ERROR]", (e.stack || e.message).split("\n")[0]));
    await page.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: "domcontentloaded", timeout: 30000 });
    await page.evaluate(async () => {
        let stubbed = false; const start = performance.now(); let n = 0;
        while (performance.now() - start < 60000) {
            const r = window.anazhRealm;
            if (r && !stubbed && r.state && r.state.renderer) { r.state.renderer.render = function () {}; if (r.state.renderer.renderAsync) r.state.renderer.renderAsync = () => Promise.resolve(); r.state.postProcessingFailed = true; stubbed = true; }
            if (r && typeof r._gameLoopTick === "function") { try { r._gameLoopTick(performance.now()); } catch (_e) {} if (++n > 200 && r.state.voxelChunks.size >= 9) break; }
            await new Promise((res) => setTimeout(res, 4));
        }
    });
    const probe = await page.evaluate(() => {
        const r = window.anazhRealm; const s = r.state;
        const out = {};
        for (const tod of [0.0, 0.5, 0.78, 0.9]) {
            r.setTimeOfDay(tod);
            for (let i = 0; i < 8; i++) r._gameLoopTick(performance.now());
            const angle = tod * Math.PI * 2 - Math.PI / 2;
            const sunDir = r._dayNightSunDirection(angle);
            const moonDir = r._dayNightSunDirection(angle + Math.PI);
            out["tod" + tod] = {
                sunDirY: +sunDir.y.toFixed(3),
                moonDirY: +moonDir.y.toFixed(3),
                nebula: s.skyboxUniforms && s.skyboxUniforms.nebulaColor ? { r: +s.skyboxUniforms.nebulaColor.value.r.toFixed(3), g: +s.skyboxUniforms.nebulaColor.value.g.toFixed(3), b: +s.skyboxUniforms.nebulaColor.value.b.toFixed(3) } : "n/a",
                fog: s.fog ? { r: +s.fog.color.r.toFixed(3), g: +s.fog.color.g.toFixed(3), b: +s.fog.color.b.toFixed(3) } : "n/a",
                ambientInt: s.ambientLight ? +s.ambientLight.intensity.toFixed(3) : "n/a",
                hemiInt: s.hemiLight ? +s.hemiLight.intensity.toFixed(3) : "n/a",
                dlInt: s.directionalLight ? +s.directionalLight.intensity.toFixed(3) : "n/a",
                dlColor: s.directionalLight ? { r: +s.directionalLight.color.r.toFixed(3), g: +s.directionalLight.color.g.toFixed(3), b: +s.directionalLight.color.b.toFixed(3) } : "n/a",
                dlPosY: s.directionalLight ? +s.directionalLight.position.y.toFixed(1) : "n/a",
                waterSunDirY: s.hydroSurfaceUniforms && s.hydroSurfaceUniforms.sunDir ? +s.hydroSurfaceUniforms.sunDir.value.y.toFixed(3) : "n/a",
            };
        }
        return out;
    });
    console.log(JSON.stringify(probe, null, 1));
    // Die drei V18.377/.378-Invarianten als ZAHLEN-Verdikt (kein CI-Gate, eine Hand-Linse):
    const n0 = probe.tod0;
    const ok = [];
    const bad = [];
    (n0.dlColor !== "n/a" && n0.dlColor.b > n0.dlColor.r ? ok : bad).push("Mitternacht: Richtlicht KÜHL (b>r, Mond)");
    (n0.dlPosY !== "n/a" && n0.dlPosY > 0 ? ok : bad).push("Mitternacht: Richtlicht ÜBER dem Horizont (Mond oben)");
    (n0.fog !== "n/a" && n0.fog.b >= n0.fog.r ? ok : bad).push("Mitternacht: Nebel KÜHL/dunkel (kein warmer Erd-Wash)");
    (n0.waterSunDirY === "n/a" || n0.waterSunDirY > 0 ? ok : bad).push("Mitternacht: Wasser-Glitzer folgt dem MOND (y>0)");
    for (const o of ok) console.log("  ✅ " + o);
    for (const b of bad) console.log("  ❌ " + b);
    await browser.close(); await new Promise((r) => server.close(r));
    process.exit(bad.length ? 1 : 0);
})();
