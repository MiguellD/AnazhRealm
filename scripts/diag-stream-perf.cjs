// Diagnose V12.0-perf.h — Streaming-Hitch (der Entdeck-FPS-Einbruch).
// Der Schöpfer-Browser-Audit (perf.g) zeigte: Steady-State 119 FPS (Instancing
// wirkt), aber Einbrüche auf 8-9 FPS beim Laufen in eine NEUE Region (Chunks +
// Vegetation streamen). Dieses Tool misst die CPU-Zeit-Aufschlüsselung der
// Streaming-Komponenten (V9.96-Disziplin: die Wurzel ist in der Korrelation,
// nicht im Bauchgefühl). Headless misst keine GPU-FPS, aber die Main-Thread-
// CPU-Zeit der Streaming-Arbeit — und der Hitch ist Main-Thread-CPU.
const puppeteer = require("puppeteer");
const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = 4321;
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
    const filePath = path.join(root, p);
    if (!filePath.startsWith(root)) {
        res.statusCode = 403;
        return res.end();
    }
    fs.readFile(filePath, (err, data) => {
        if (err) {
            res.statusCode = 404;
            return res.end();
        }
        res.setHeader("Content-Type", mime[path.extname(filePath)] || "application/octet-stream");
        res.end(data);
    });
});

(async () => {
    await new Promise((r) => server.listen(PORT, r));
    const browser = await puppeteer.launch({
        headless: true,
        protocolTimeout: 300000,
        args: [
            "--use-angle=swiftshader",
            "--enable-unsafe-swiftshader",
            "--enable-webgl",
            "--ignore-gpu-blocklist",
            "--no-sandbox",
            "--disable-setuid-sandbox",
            "--autoplay-policy=no-user-gesture-required",
        ],
    });
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 720 });
    page.on("pageerror", (err) => console.log("[PAGE-ERROR]", (err.stack || err.message).split("\n")[0]));
    await page.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: "domcontentloaded", timeout: 30000 });
    await page.evaluate(async () => {
        const start = performance.now();
        while (performance.now() - start < 20000) {
            const r = window.anazhRealm;
            if (r && typeof r._gameLoopTick === "function") {
                try {
                    r._gameLoopTick(performance.now());
                } catch (_e) {
                    /* */
                }
                if (r.state && r.state.playerMesh && r.state.voxelChunks && r.state.voxelChunks.size > 8) break;
            }
            await new Promise((resolve) => setTimeout(resolve, 16));
        }
    });
    const report = await page.evaluate(async () => {
        const r = window.anazhRealm;
        const out = {};
        // --- Komponenten-Timing via Method-Wrapping ---
        const acc = {};
        const origs = {};
        const wrap = (name) => {
            if (typeof r[name] !== "function") return;
            const orig = r[name].bind(r);
            origs[name] = r[name];
            acc[name] = { ms: 0, n: 0 };
            r[name] = (...args) => {
                const t = performance.now();
                const res = orig(...args);
                acc[name].ms += performance.now() - t;
                acc[name].n++;
                return res;
            };
        };
        for (const m of [
            "_buildVoxelChunkData",
            "_voxelSampleDensityGrid",
            "_buildStaticTriMeshCollision",
            "_buildVoxelChunkWaterIsoSurface",
            "_buildWaterSheetStreaming",
            "_workerBuildWaterSheet",
            "_buildVoxelChunkGrass",
            "_populateVoxelChunkVegetation",
            "_tickPendingVegSpawns",
            "_finalizeVoxelChunkBuild",
            "spawnArchitecture",
            "_populateBlockerAABBs",
            "computeBlueprintAffordances",
            "computeAffordanceStrength",
            "tickArchitectureCulling",
            "_rebuildArchitectureMesh",
            "_archInstanceAdd",
            "_buildArchitectureCollisionFromLeaves",
            "_buildArchitectureCollision",
        ]) {
            wrap(m);
        }

        // --- Den Spieler in eine FRISCHE, FERNE Region versetzen (triggert
        //     Streaming + Vegetations-Population). Wir treiben die Streaming-
        //     Ticks DIREKT (nicht den vollen Loop), damit die Physik-Sync den
        //     Override nicht zurücksetzt — isoliert die Streaming-CPU-Kosten. ---
        const pm = r.state.playerMesh.position;
        const tx = pm.x + 600;
        const tz = pm.z + 600;
        let frames = 0;
        const wallStart = performance.now();
        // ~400 Streaming-Frames pumpen (oder bis Wall-Budget), Player-Pos je
        // Frame ein Stück Richtung Ziel schieben (simuliert Laufen ~7 m/s).
        for (let i = 0; i < 400; i++) {
            pm.x += 1.6;
            pm.z += 1.6;
            try {
                if (typeof r._tickVoxelChunkStreaming === "function") r._tickVoxelChunkStreaming();
            } catch (_e) {
                /* */
            }
            try {
                if (typeof r._tickPendingVegSpawns === "function") r._tickPendingVegSpawns();
            } catch (_e) {
                /* */
            }
            try {
                if (typeof r.tickArchitectureCulling === "function") r.tickArchitectureCulling(performance.now());
            } catch (_e) {
                /* */
            }
            frames++;
            if (performance.now() - wallStart > 120000) break;
            if (i % 8 === 0) await new Promise((resolve) => setTimeout(resolve, 0));
            void tx;
            void tz;
        }
        out.frames = frames;
        out.wallMs = +(performance.now() - wallStart).toFixed(0);
        out.components = {};
        for (const k of Object.keys(acc)) {
            out.components[k] = {
                totalMs: +acc[k].ms.toFixed(1),
                calls: acc[k].n,
                avgMs: +(acc[k].ms / Math.max(1, acc[k].n)).toFixed(2),
                msPerFrame: +(acc[k].ms / Math.max(1, frames)).toFixed(2),
            };
        }
        out.archTotal = r.state.architectures.length;
        out.chunkCount = r.state.voxelChunks ? r.state.voxelChunks.size : 0;
        for (const m of Object.keys(origs)) r[m] = origs[m];
        return out;
    });

    console.log("\n========= V12.0-perf.h DIAGNOSE — Streaming-Hitch =========\n");
    console.log(
        `Streaming-Frames: ${report.frames}  Wall: ${report.wallMs} ms  (~${(report.wallMs / report.frames).toFixed(1)} ms/Frame)`
    );
    console.log(`Chunks: ${report.chunkCount}  Architekturen: ${report.archTotal}`);
    console.log("\n--- Komponenten (über alle Streaming-Frames kumuliert), sortiert nach Gesamt-ms ---");
    const comps = Object.entries(report.components).sort((a, b) => b[1].totalMs - a[1].totalMs);
    for (const [name, c] of comps) {
        if (c.calls === 0) continue;
        console.log(
            `  ${name.padEnd(36)} total=${String(c.totalMs).padStart(8)}ms  calls=${String(c.calls).padStart(4)}  avg=${String(c.avgMs).padStart(7)}ms  ms/Frame=${c.msPerFrame}`
        );
    }
    console.log("\n--- Top-Hog (was den Streaming-Frame frisst) ---");
    const top = comps.filter(([, c]) => c.calls > 0).slice(0, 4);
    for (const [name, c] of top) {
        console.log(`  ${name}: ${((c.totalMs / report.wallMs) * 100).toFixed(0)}% der Streaming-Wall-Zeit`);
    }
    console.log("\n===========================================================\n");
    await browser.close();
    server.close();
})();
