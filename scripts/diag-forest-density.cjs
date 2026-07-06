// WO GEHEN DIE BAEUME VERLOREN? (Schöpfer „der Wald ist leer, 2-3 Baeume auf kahler Erde"). Echter
// Renderer + Foundry, kein Render. Instrumentiert _forestCellDarts: pro Chunk die Kandidaten (dartsPerCell*
// Zellen), die Ueberlebenden + die Ablehnungsgruende (bimodal/wasser/slope/nische). Plus: Gesamt-Baum-
// Eintraege (kalt + platziert) + Chunks. Studio-Vergleich: plantForest R=64 = ~hunderte Baeume.
const puppeteer = require("puppeteer");
const http = require("http");
const fs = require("fs");
const path = require("path");
const PORT = 4555;
const root = path.resolve(__dirname, "..");
const mime = { ".html": "text/html", ".js": "application/javascript", ".wasm": "application/wasm", ".json": "application/json", ".css": "text/css", ".png": "image/png" };
const server = http.createServer((req, res) => {
    let p = req.url.split("?")[0];
    if (p === "/") p = "/index.html";
    const fp = path.join(root, p);
    if (!fp.startsWith(root)) { res.statusCode = 403; return res.end(); }
    fs.readFile(fp, (err, data) => { if (err) { res.statusCode = 404; return res.end(); } res.setHeader("Content-Type", mime[path.extname(fp)] || "application/octet-stream"); res.end(data); });
});
(async () => {
    await new Promise((r) => server.listen(PORT, r));
    const browser = await puppeteer.launch({ headless: true, protocolTimeout: 200000, args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--enable-webgl", "--ignore-gpu-blocklist", "--no-sandbox", "--disable-setuid-sandbox"] });
    const page = await browser.newPage();
    page.on("pageerror", (e) => console.log("[ERR]", (e.stack || e.message).split("\n")[0]));
    await page.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: "domcontentloaded", timeout: 30000 });
    const out = await page.evaluate(async () => {
        const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
        let stub = false;
        const s0 = performance.now();
        while (performance.now() - s0 < 50000) {
            const r = window.anazhRealm;
            if (r && !stub && r.state && r.state.renderer && !r.state.renderer._isHeadlessNull) {
                r.state.renderer.render = function () {};
                if (r.state.renderer.renderAsync) r.state.renderer.renderAsync = () => Promise.resolve();
                r.state.postProcessingFailed = true; r._bootWarmDone = true; stub = true;
            }
            if (r && typeof r._gameLoopTick === "function") { try { r._gameLoopTick(performance.now()); } catch (_e) {} if (r.state.voxelChunks && r.state.voxelChunks.size >= 16) break; }
            await sleep(5);
        }
        const r = window.anazhRealm;
        const s = r.state;
        // Instrumentiere _forestCellDarts: zaehle Kandidaten + Ablehnungen nach Grund.
        const tally = { candidates: 0, survived: 0, chunks: 0 };
        const orig = r._forestCellDarts.bind(r);
        // Wir koennen die internen continue-Gruende nicht direkt greifen; stattdessen die Ueberlebenden zaehlen
        // + parallel die Roh-Kandidaten (dartsPerCell) und die Boden-/Wasser-/Slope-Verfuegbarkeit an Stichproben.
        const F = r.constructor.FOREST;
        // Stichprobe: 25 Zellen um Spawn, klassifiziere jede nach Boden/Wasser/Slope/standDensity.
        const px = s.playerMesh ? s.playerMesh.position.x : 0, pz = s.playerMesh ? s.playerMesh.position.z : 0;
        let aboveWater = 0, flatEnough = 0, denseCore = 0, sampleN = 0;
        for (let gx = -8; gx <= 8; gx++) for (let gz = -8; gz <= 8; gz++) {
            const x = px + gx * F.cell, z = pz + gz * F.cell;
            sampleN++;
            const surfaceY = r._voxelSurfaceY ? r._voxelSurfaceY(x, z) : null;
            if (surfaceY === null || !Number.isFinite(surfaceY)) continue;
            const waterY = r._waterLevelAt ? r._waterLevelAt(x, z) : -Infinity;
            if (surfaceY - waterY > 0.4) aboveWater++;
            const slope = r._slopeAt ? r._slopeAt(x, z, (a, b) => r.getTerrainHeightAt(a, b), 2) : 0;
            if (slope < F.slopeHi) flatEnough++;
            const sd = r._forestStandDensity ? r._forestStandDensity(x, z) : 0;
            if (sd > 0.5) denseCore++;
        }
        // Zaehle die Baeume, die _forestCellDarts an einer Reihe von Chunks um Spawn zurueckgibt.
        const pcx = Math.floor(px / F.cell), pcz = Math.floor(pz / F.cell);
        let dartsTrees = 0, dartsCells = 0;
        for (let cx = pcx - 8; cx <= pcx + 8; cx++) for (let cz = pcz - 8; cz <= pcz + 8; cz++) {
            try { const res = orig(cx, cz, (s.worldSeed || 12345) >>> 0); if (Array.isArray(res)) { dartsTrees += res.length; dartsCells++; } } catch (_e) {}
        }
        // Gesamt-Baum-Eintraege (kalt + platziert).
        let totalTrees = 0, placed = 0, cold = 0;
        for (const e of s.architectures || []) {
            const sp = ((e._lodSpecies || e.type || "") + "").toLowerCase();
            if (!/baum/.test(sp)) continue;
            totalTrees++;
            if (e.instanced || e.mesh || e.instFoundry) placed++; else cold++;
        }
        return {
            chunks: s.voxelChunks ? s.voxelChunks.size : 0,
            dartsPerCell: F.dartsPerCell, cell: F.cell, slopeHi: F.slopeHi,
            probe17x17: { sampleN, aboveWater, flatEnough, denseCore },
            forestCellDarts: { cells: dartsCells, treesReturned: dartsTrees, perCell: +(dartsTrees / Math.max(1, dartsCells)).toFixed(3) },
            architectureTrees: { total: totalTrees, placed, cold },
        };
    });
    console.log(JSON.stringify(out, null, 2));
    console.log("\nLESART: forestCellDarts.perCell = Baeume/Zelle. Studio ~ dicht. aboveWater/flatEnough/denseCore = wo Boden taugt.");
    await browser.close(); server.close(); process.exit(0);
})();
