const puppeteer = require("puppeteer"),
    http = require("http"),
    fs = require("fs"),
    path = require("path");
const PORT = 4411,
    root = path.resolve("/home/user/AnazhRealm");
const mime = {
    ".html": "text/html",
    ".js": "application/javascript",
    ".json": "application/json",
    ".css": "text/css",
    ".wasm": "application/wasm",
    ".woff2": "font/woff2",
    ".png": "image/png",
};
const server = http.createServer((req, res) => {
    let p = req.url.split("?")[0];
    if (p === "/") p = "/index.html";
    const fp = path.join(root, p);
    if (!fp.startsWith(root)) {
        res.statusCode = 403;
        return res.end();
    }
    fs.readFile(fp, (e, d) => {
        if (e) {
            res.statusCode = 404;
            return res.end();
        }
        res.setHeader("Content-Type", mime[path.extname(fp)] || "application/octet-stream");
        res.end(d);
    });
});
(async () => {
    await new Promise((r) => server.listen(PORT, r));
    const browser = await puppeteer.launch({
        headless: true,
        protocolTimeout: 160000,
        args: ["--disable-gpu", "--disable-software-rasterizer", "--no-sandbox", "--disable-setuid-sandbox"],
    });
    const page = await browser.newPage();
    page.on("pageerror", (e) => console.log("[PAGE-ERR]", (e.stack || e.message).split("\n")[0]));
    await page.evaluateOnNewDocument(() => {
        window.__anazhHeadlessNullRenderer = true;
    });
    await page.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: "domcontentloaded", timeout: 30000 });
    await page.evaluate(async () => {
        const r = window.anazhRealm;
        if (r && r.state) r.state.voxelWorker = null;
        const s = performance.now();
        let l = -1,
            st = 0;
        while (performance.now() - s < 70000) {
            if (r && typeof r._gameLoopTick === "function") {
                try {
                    r._gameLoopTick(performance.now());
                } catch (_) {}
                const z = r.state.voxelChunks ? r.state.voxelChunks.size : 0;
                if (z === l) st++;
                else {
                    st = 0;
                    l = z;
                }
                if (z >= 60 && st > 25) break;
            }
            await new Promise((x) => setTimeout(x, 4));
        }
    });
    const out = await page.evaluate(() => {
        const r = window.anazhRealm,
            s = r.state;
        const wL = (s.terrainBaseHeight || 0) - 3;
        const seed = (s.worldMeta && s.worldMeta.seed) || "?";
        const probe = (wx, wz) => {
            const wl = r._waterLevelAt ? r._waterLevelAt(wx, wz) : -Infinity;
            const surf = r._voxelSurfaceY ? r._voxelSurfaceY(wx, wz) : null;
            const river = r._hydroRiverAt ? r._hydroRiverAt(wx, wz) : null;
            let sfx = 0,
                sfz = 0,
                fc = 0;
            for (let dz = -1; dz <= 1; dz++)
                for (let dx = -1; dx <= 1; dx++) {
                    const rv = r._hydroRiverAt(wx + dx * 9, wz + dz * 9);
                    if (rv) {
                        const mg = Math.hypot(rv.flowX || 0, rv.flowZ || 0);
                        if (mg > 1e-4) {
                            fc++;
                            sfx += rv.flowX / (mg || 1);
                            sfz += rv.flowZ / (mg || 1);
                        }
                    }
                }
            const coh = Math.max(0, Math.min(1, (Math.hypot(sfx, sfz) / 9 - 0.04) / 0.46));
            const hr = surf != null ? Math.max(0, Math.min(1, 1 - (Math.abs(surf - wL) - 0.8) / 2.0)) : null;
            return {
                wx,
                wz,
                wl: wl && wl.toFixed ? wl.toFixed(1) : wl,
                surf: surf != null ? surf.toFixed(1) : null,
                isWater: surf != null && surf < wl - 0.1,
                depth: surf != null ? (wl - surf).toFixed(1) : null,
                coherence: +coh.toFixed(2),
                presence: +(fc / 9).toFixed(2),
                flowCells: fc,
                heightRamp: hr != null ? +hr.toFixed(2) : null,
                isLake: r._hydrosphereLakeAt ? r._hydrosphereLakeAt(wx, wz) : null,
                riverHasFlow: river ? Math.hypot(river.flowX || 0, river.flowZ || 0) > 1e-4 : null,
                centerness: river && river.centerness != null ? +river.centerness.toFixed(2) : null,
            };
        };
        // der Schöpfer-Spot + ein 5×5-Raster drumherum (±20 m)
        const grid = [];
        for (let dz = -20; dz <= 20; dz += 10)
            for (let dx = -20; dx <= 20; dx += 10) grid.push(probe(71.5 + dx, -73.6 + dz));
        return { seed, spot: probe(71.5, -73.6), grid: grid.filter((g) => g.isWater) };
    });
    console.log("\n=== SCHÖPFER-CHEVRON-SPOT (71.5, -73.6) — seed:", out.seed, "===\n");
    console.log("  SPOT:", JSON.stringify(out.spot));
    console.log("\n  WASSER-NACHBARN (±20m, " + out.grid.length + " nasse):");
    out.grid.forEach((g) =>
        console.log(
            `    (${g.wx.toFixed(0)},${g.wz.toFixed(0)}) depth=${g.depth} coh=${g.coherence} pres=${g.presence} hRamp=${g.heightRamp} lake=${g.isLake} aWave≈${g.heightRamp != null ? (g.isLake ? 0 : g.heightRamp * (1 - g.coherence * g.coherence * (3 - 2 * g.coherence))).toFixed(2) : "?"}`
        )
    );
    await browser.close();
    server.close();
})();
