// Diagnose T6 — die DETERMINISMUS-WAND (V9.42-b) für die NEUEN Code-Pfade. Die Playtest-Band sampelt nur
// am Ursprung (0,0,0) — aber T6a/T6b/T6c/T6d feuern REGIONAL (canyonRegion/mesaRegion/Höhlen). Hier wird
// Worker `terrainDensityAt` gegen Main `_terrainDensityAt` an den DRAMATISCHEN Orten bit-identisch geprüft
// (wo die neuen Zweige aktiv sind). Exit 1 bei JEDEM Mismatch (die Wand ist heilig).
const puppeteer = require("puppeteer");
const http = require("http");
const fs = require("fs");
const path = require("path");
const PORT = 4372;
const root = path.resolve(__dirname, "..");
const mime = {
    ".html": "text/html",
    ".js": "application/javascript",
    ".wasm": "application/wasm",
    ".json": "application/json",
    ".woff2": "font/woff2",
    ".css": "text/css",
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
    fs.readFile(fp, (err, data) => {
        if (err) {
            res.statusCode = 404;
            return res.end();
        }
        res.setHeader("Content-Type", mime[path.extname(fp)] || "application/octet-stream");
        res.end(data);
    });
});
(async () => {
    await new Promise((r) => server.listen(PORT, r));
    const browser = await puppeteer.launch({
        headless: true,
        args: [
            "--use-angle=swiftshader",
            "--enable-unsafe-swiftshader",
            "--enable-webgl",
            "--ignore-gpu-blocklist",
            "--no-sandbox",
            "--disable-setuid-sandbox",
        ],
    });
    const page = await browser.newPage();
    page.on("pageerror", (e) => console.log("[PAGE-ERROR]", (e.stack || e.message).split("\n")[0]));
    await page.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: "domcontentloaded", timeout: 30000 });
    await page.evaluate(async () => {
        const start = performance.now();
        while (performance.now() - start < 40000) {
            const r = window.anazhRealm;
            if (
                r &&
                r.state &&
                typeof r._voxelWorkerComputeDensity === "function" &&
                r.state.hydrosphere &&
                r.state.hydrosphere.ready
            )
                break;
            await new Promise((res) => setTimeout(res, 50));
        }
    });

    const out = await page.evaluate(async () => {
        const r = window.anazhRealm;
        const o = {};
        const worker = r._getVoxelWorker();
        if (!worker) return { error: "kein Worker" };
        await r._voxelWorkerSyncState({ op: "init" });
        const cfg = r._voxelChunkConfig(0);
        const step = cfg.step;
        const base = r.state.terrainBaseHeight || 0;
        // Die DRAMATISCHEN Orte (wo T6 feuert) — 8³-Grid je Ort, Surface-zentriert (oy ~ surf-20).
        const spots = [
            [1000, -800],
            [2000, 1500],
            [250, 250],
            [-1500, 600],
            [600, -1700],
        ];
        let totalMism = 0,
            maxDelta = 0,
            totalCells = 0;
        const perSpot = [];
        for (const [ox, oz] of spots) {
            const surf = r._terrainMacroSurfaceY(ox, oz);
            const oy = Math.round(surf) - 28; // umfasst Oberfläche + Höhlen-Band
            const dimX = 8,
                dimY = 16,
                dimZ = 8;
            const mainGrid = r._voxelSampleDensityGrid(ox, oy, oz, dimX, dimY, dimZ, step, (x, y, z) =>
                r._terrainDensityAt(x, y, z)
            );
            const workerGrid = await r._voxelWorkerComputeDensity(ox, oy, oz, dimX, dimY, dimZ, step);
            let mism = 0,
                md = 0;
            const len = Math.min(mainGrid.length, workerGrid.length);
            for (let i = 0; i < len; i++) {
                if (mainGrid[i] !== workerGrid[i]) {
                    mism++;
                    const d = Math.abs(mainGrid[i] - workerGrid[i]);
                    if (d > md) md = d;
                }
            }
            totalMism += mism;
            totalCells += len;
            if (md > maxDelta) maxDelta = md;
            perSpot.push({ spot: [ox, oz], mism, md: +md.toFixed(6), len });
        }
        o.perSpot = perSpot;
        o.totalMism = totalMism;
        o.totalCells = totalCells;
        o.maxDelta = +maxDelta.toFixed(6);
        return o;
    });

    await browser.close();
    await new Promise((r) => server.close(r));

    console.log("\n=== T6 — DETERMINISMUS-WAND (Worker vs Main, die NEUEN Pfade) ===\n");
    if (out.error) {
        console.log("FEHLER:", out.error, "\n");
        process.exit(1);
    }
    for (const s of out.perSpot) {
        console.log(
            `  (${s.spot[0]},${s.spot[1]}): ${s.mism}/${s.len} Mismatches, maxΔ=${s.md}  ${s.mism === 0 ? "✓" : "✗"}`
        );
    }
    console.log(`\n  GESAMT: ${out.totalMism}/${out.totalCells} Mismatches, maxΔ=${out.maxDelta}\n`);
    if (out.totalMism === 0) {
        console.log("GRÜN — Worker == Main bit-identisch an allen dramatischen Orten. Die Wand HÄLT.\n");
        process.exit(0);
    } else {
        console.log("ROT — die Determinismus-Wand ist GEBROCHEN (Worker-Mirror weicht ab). Naht-/Multi-User-Gefahr.\n");
        process.exit(1);
    }
})();
