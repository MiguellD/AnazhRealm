// TEST: läuft der Null-Renderer-Gate OHNE GPU (kein swiftshader)? Der Gate ist Null-Renderer →
// er BRAUCHT keinen GPU; swiftshader ist nur die dokumentierte Tail-Crash-Quelle. Wenn die Welt
// OHNE GPU baut (chunks>0, keine page-errors), ist der Fix sicher: GPU aus dem Gate-Launch nehmen.
const puppeteer = require("puppeteer");
const http = require("http");
const fs = require("fs");
const path = require("path");
const PORT = 4407;
const root = path.resolve(__dirname, "..");
const mime = { ".html": "text/html", ".js": "application/javascript", ".json": "application/json", ".css": "text/css", ".wasm": "application/wasm", ".woff2": "font/woff2", ".png": "image/png" };
const server = http.createServer((req, res) => {
    let p = req.url.split("?")[0]; if (p === "/") p = "/index.html";
    const fp = path.join(root, p);
    if (!fp.startsWith(root)) { res.statusCode = 403; return res.end(); }
    fs.readFile(fp, (err, data) => { if (err) { res.statusCode = 404; return res.end(); } res.setHeader("Content-Type", mime[path.extname(fp)] || "application/octet-stream"); res.end(data); });
});
const MODE = process.argv[2] || "nogpu"; // nogpu | swiftshader
(async () => {
    await new Promise((r) => server.listen(PORT, r));
    const args = MODE === "swiftshader"
        ? ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--enable-webgl", "--ignore-gpu-blocklist", "--no-sandbox", "--disable-setuid-sandbox"]
        : ["--disable-gpu", "--disable-software-rasterizer", "--no-sandbox", "--disable-setuid-sandbox"];
    const browser = await puppeteer.launch({ headless: true, protocolTimeout: 120000, args });
    const page = await browser.newPage();
    const errs = [];
    page.on("pageerror", (e) => errs.push((e.stack || e.message).split("\n")[0]));
    page.on("console", (m) => { if (m.type() === "error") errs.push("[console] " + m.text().slice(0, 120)); });
    await page.evaluateOnNewDocument(() => { window.__anazhHeadlessNullRenderer = true; window.__anazhHeadlessSkinResCap = 64; });
    await page.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: "domcontentloaded", timeout: 30000 });
    const out = await page.evaluate(async () => {
        const start = performance.now();
        let lastSize = -1, stableFor = 0, hadTick = false;
        while (performance.now() - start < 60000) {
            const r = window.anazhRealm;
            if (r && r.state && r.state.voxelWorker) r.state.voxelWorker = null;
            if (r && typeof r._gameLoopTick === "function") {
                hadTick = true;
                try { r._gameLoopTick(performance.now()); } catch (_e) {}
                const sz = r.state && r.state.voxelChunks ? r.state.voxelChunks.size : 0;
                if (sz === lastSize) stableFor++; else { stableFor = 0; lastSize = sz; }
                if (sz >= 40 && stableFor > 25) break;
            }
            await new Promise((res) => setTimeout(res, 5));
        }
        const r = window.anazhRealm, s = r && r.state;
        // Heavy ops wie die Bänder: Avatar + ein paar Bauten + Bauplan.
        let avatarOk = false, archOk = false, bpOk = false;
        try { if (r._buildHumanGroup) { r._buildHumanGroup(); avatarOk = true; } } catch (_e) {}
        try { const p = s.playerMesh.position; archOk = !!r.spawnArchitecture("stein_block", { x: p.x + 6, y: p.y, z: p.z + 6 }); } catch (_e) {}
        try { bpOk = !!(s && s.blueprints && Object.keys(s.blueprints).length > 0); } catch (_e) {}
        return {
            hadTick, chunks: s && s.voxelChunks ? s.voxelChunks.size : 0,
            terrainGen: !!(s && s.terrainEverGenerated), avatarOk, archOk, bpOk,
            rendererType: s && s.renderer ? (s.renderer._isHeadlessNull ? "null" : s.renderer.constructor.name) : "?",
        };
    });
    console.log(`\n===== GATE OHNE GPU? (Modus: ${MODE}) =====\n`);
    console.log(`  renderer: ${out.rendererType} · gameLoopTick: ${out.hadTick} · chunks: ${out.chunks} · terrainGen: ${out.terrainGen}`);
    console.log(`  avatar baut: ${out.avatarOk} · spawnArchitecture: ${out.archOk} · Baupläne da: ${out.bpOk}`);
    console.log(`  page/console-errors (${errs.length}):`); errs.slice(0, 8).forEach((e) => console.log("    " + e));
    const ok = out.hadTick && out.chunks >= 40 && out.terrainGen && out.avatarOk && out.archOk && out.bpOk && errs.length === 0;
    console.log(`\n  ${ok ? "✅ Der Gate läuft VOLL OHNE GPU — swiftshader ist unnötig + die Tail-Crash-Quelle → aus dem Launch nehmen." : "⚠️ Ohne GPU fehlt etwas (s.o.) — der Gate braucht doch einen Kontext, anderer Fix nötig."}\n`);
    await browser.close(); server.close(); process.exit(ok ? 0 : 1);
})();
