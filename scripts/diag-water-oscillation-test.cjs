// Test for water front oscillation during streaming + CA activity
const puppeteer = require("puppeteer");
const http = require("http");
const fs = require("fs");
const path = require("path");
const PORT = 4405;
const root = path.resolve(__dirname, "..");

const mime = { ".html": "text/html", ".js": "application/javascript", ".json": "application/json", ".css": "text/css", ".wasm": "application/wasm", ".woff2": "font/woff2", ".png": "image/png" };
const server = http.createServer((req, res) => {
    let p = req.url.split("?")[0];
    if (p === "/") p = "/index.html";
    const fp = path.join(root, p);
    if (!fp.startsWith(root)) { res.statusCode = 403; return res.end(); }
    fs.readFile(fp, (err, data) => {
        if (err) { res.statusCode = 404; return res.end(); }
        res.setHeader("Content-Type", mime[path.extname(fp)] || "application/octet-stream");
        res.end(data);
    });
});

(async () => {
    await new Promise((r) => server.listen(PORT, r));
    const browser = await puppeteer.launch({
        headless: true, protocolTimeout: 300000,
        args: ["--disable-gpu", "--no-sandbox"],
    });
    const page = await browser.newPage();
    await page.evaluateOnNewDocument(() => { window.__anazhHeadlessNullRenderer = true; });
    await page.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: "domcontentloaded", timeout: 30000 });

    // Wait for boot + first streaming stabilization
    await page.evaluate(async () => {
        const start = performance.now();
        let stable = 0;
        while (performance.now() - start < 80000) {
            const r = window.anazhRealm;
            if (r && typeof r._gameLoopTick === "function") {
                try { r._gameLoopTick(performance.now()); } catch (_e) { }
                const sz = r.state && r.state.voxelChunks ? r.state.voxelChunks.size : 0;
                if (sz > 30) stable++;
                if (sz > 30 && stable > 50) break;
            }
            await new Promise((res) => setTimeout(res, 6));
        }
    });

    // Now observe 20 frames of fog/water state during CA activity
    const observations = await page.evaluate(() => {
        const r = window.anazhRealm;
        const st = r.state;
        const out = [];
        for (let frame = 0; frame < 20; frame++) {
            try { r._gameLoopTick(performance.now()); } catch (_e) { }
            const builtK = r._builtRingRadius();
            const waterK = r._builtWaterRingRadius();
            const pendSize = st.pendingWaterIso ? st.pendingWaterIso.size : 0;
            const caActive = st.waterCAActive ? st.waterCAActive.size : 0;
            const fogEdgeSmooth = st._fogEdgeSmooth || null;
            out.push({
                frame,
                builtK, waterK, pendSize, caActive, fogEdgeSmooth
            });
        }
        return out;
    });

    console.log("\n===== WASSER-FRONT OSZILLATION (20 Frames) =====\n");
    console.log("Frame | builtK | waterK | pendSize | caActive | fogEdgeSmooth");
    for (const o of observations) {
        console.log(
            `${o.frame.toString().padStart(5)} | ${
                (o.builtK ?? 'null').toString().padStart(6)} | ${
                (o.waterK ?? 'null').toString().padStart(6)} | ${
                o.pendSize.toString().padStart(8)} | ${
                o.caActive.toString().padStart(8)} | ${
                (o.fogEdgeSmooth ? o.fogEdgeSmooth.toFixed(1) : 'null')}`
        );
    }

    // Check for oscillation
    const waterKs = observations.map(o => o.waterK);
    const transitions = [];
    for (let i = 1; i < waterKs.length; i++) {
        if (waterKs[i] !== waterKs[i-1]) {
            transitions.push(`Frame ${i-1}→${i}: ${waterKs[i-1]} → ${waterKs[i]}`);
        }
    }
    
    console.log(`\nWater-Ring Transitions: ${transitions.length > 0 ? transitions.join("; ") : "NONE (stable)"}`);
    if (transitions.length > 0) {
        console.log("⚠️  WATER-FRONT OSCILLATES — changes between frames!");
    } else {
        console.log("✅ waterK is monotonically stable");
    }

    await browser.close();
    server.close();
    process.exit(0);
})();
