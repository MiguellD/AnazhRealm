// Diagnose V12.0-perf — Edit/Spawn-Cluster-FPS. Misst die Komponenten-
// Aufschlüsselung EINES _rebuildVoxelChunk (Density / Surface-Nets / BVH /
// Grass / Wasser-Iso / Vegetation) + wie viele Chunks ein Struktur-Cluster
// dirty macht. Freeze-Schätzung = dirtyCount × per-Chunk-Kosten.
const puppeteer = require("puppeteer");
const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = 4318;
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
    // Welt + Avatar + Voxel-Chunks pumpen.
    await page.evaluate(async () => {
        const start = performance.now();
        while (performance.now() - start < 25000) {
            const r = window.anazhRealm;
            if (r && typeof r._gameLoopTick === "function") {
                try {
                    r._gameLoopTick(performance.now());
                } catch (_e) {
                    /* listener */
                }
                if (r.state && r.state.playerMesh && r.state.voxelChunks && r.state.voxelChunks.size > 8) break;
            }
            await new Promise((resolve) => setTimeout(resolve, 16));
        }
    });
    const report = await page.evaluate(() => {
        const r = window.anazhRealm;
        const out = {};
        const { span } = r._voxelChunkConfig();
        const pp = r.state.playerMesh.position;
        const pcx = Math.floor(pp.x / span);
        const pcz = Math.floor(pp.z / span);
        out.playerChunk = { pcx, pcz, chunkCount: r.state.voxelChunks.size };

        // --- Komponenten-Timing via Method-Wrapping (kein Source-Change) ---
        const acc = {};
        const wrap = (name) => {
            const orig = r[name].bind(r);
            acc[name] = { ms: 0, n: 0 };
            r[name] = (...args) => {
                const t = performance.now();
                const res = orig(...args);
                acc[name].ms += performance.now() - t;
                acc[name].n++;
                return res;
            };
            return orig;
        };
        const origs = {};
        for (const m of [
            "_voxelSampleDensityGrid",
            "_buildStaticTriMeshCollision",
            "_buildVoxelChunkGrass",
            "_buildVoxelChunkWaterIsoSurface",
            "_populateVoxelChunkVegetation",
            "_buildVoxelChunkData",
            "_disposeVoxelChunk",
        ]) {
            if (typeof r[m] === "function") origs[m] = wrap(m);
        }

        // --- Per-Chunk-Rebuild-Kosten: 6 nahe Chunks je 1× rebuilden ---
        const samples = [];
        let measured = 0;
        for (const key of r.state.voxelChunks.keys()) {
            if (measured >= 6) break;
            const comma = key.indexOf(",");
            const cx = parseInt(key.slice(0, comma), 10);
            const cz = parseInt(key.slice(comma + 1), 10);
            const entry = r.state.voxelChunks.get(key);
            if (!entry || entry.empty) continue;
            const t = performance.now();
            r._rebuildVoxelChunk(cx, cz);
            samples.push(+(performance.now() - t).toFixed(1));
            measured++;
        }
        out.perChunkMs = samples;
        out.perChunkAvg = +(samples.reduce((a, b) => a + b, 0) / Math.max(1, samples.length)).toFixed(1);
        out.components = {};
        for (const k of Object.keys(acc)) {
            out.components[k] = {
                totalMs: +acc[k].ms.toFixed(1),
                calls: acc[k].n,
                avgMs: +(acc[k].ms / Math.max(1, acc[k].n)).toFixed(1),
            };
        }
        // Methoden zurücksetzen, damit der Cluster-Test sauber zählt.
        for (const m of Object.keys(origs)) r[m] = origs[m];

        // --- Cluster-Test: 19 Strukturen nahe Player spawnen, dirtyCount messen ---
        if (!r.state.dirtyVoxelChunks) r.state.dirtyVoxelChunks = new Set();
        r.state.dirtyVoxelChunks.clear();
        let spawned = 0;
        if (typeof r.spawnArchitecture === "function") {
            // 19 Strukturen in einem ~30m-Radius-Cluster (fraktal-ähnlich).
            const ring = [0, ...Array.from({ length: 18 }, (_, i) => i)];
            for (let i = 0; i < 19; i++) {
                const ang = (i / 19) * Math.PI * 2;
                const rad = i === 0 ? 0 : 6 + (i % 3) * 8;
                const x = pp.x + Math.cos(ang) * rad;
                const z = pp.z + Math.sin(ang) * rad;
                try {
                    r.spawnArchitecture("baum_eiche", { x, y: pp.y, z }, { seed: 1000 + i, silent: true });
                    spawned++;
                } catch (_e) {
                    /* skip */
                }
                void ring;
            }
        }
        out.clusterSpawned = spawned;
        out.dirtyAfterCluster = r.state.dirtyVoxelChunks ? r.state.dirtyVoxelChunks.size : 0;
        out.freezeEstimateMs = +(out.dirtyAfterCluster * out.perChunkAvg).toFixed(0);
        out.framesAt1PerFrame = out.dirtyAfterCluster;
        return out;
    });

    console.log("\n========= V12.0-perf DIAGNOSE =========\n");
    console.log("Player-Chunk:", JSON.stringify(report.playerChunk));
    console.log("\n--- Per-Chunk _rebuildVoxelChunk (ms, 6 Samples) ---");
    console.log("  Werte:", report.perChunkMs.join(", "));
    console.log("  Durchschnitt:", report.perChunkAvg, "ms/Chunk");
    console.log("\n--- Komponenten-Aufschlüsselung (über 6 Rebuilds kumuliert) ---");
    const comps = Object.entries(report.components).sort((a, b) => b[1].totalMs - a[1].totalMs);
    for (const [name, c] of comps) {
        console.log(
            `  ${name.padEnd(34)} total=${String(c.totalMs).padStart(7)}ms  calls=${String(c.calls).padStart(3)}  avg=${c.avgMs}ms`
        );
    }
    console.log("\n--- Cluster-Test (19 Strukturen nahe Player) ---");
    console.log("  Strukturen gespawnt:", report.clusterSpawned);
    console.log("  Chunks dirty danach:", report.dirtyAfterCluster);
    console.log(
        `  Freeze-Schätzung: ${report.dirtyAfterCluster} Chunks × ${report.perChunkAvg}ms = ${report.freezeEstimateMs}ms`
    );
    console.log(
        `  Bei 1 Rebuild/Frame: ${report.framesAt1PerFrame} Frames mit je ~${report.perChunkAvg}ms (= ~${Math.round(1000 / Math.max(1, report.perChunkAvg))} FPS während des Drains)`
    );
    console.log("\n=======================================\n");
    await browser.close();
    server.close();
})();
