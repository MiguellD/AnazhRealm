// V18.121 — B6-MESSUNG: das Frame-Profil (G7 „der neue Maßstab" — gemessen,
// nicht geraten). Wrappt die großen per-Frame-Methoden + zählt THREE-
// Allokationen pro Tick (Vector3/Color — GC-Druck-Proxys). Output: Ø/Max ms
// je Phase + Allocs/Tick, bei Spieler-Stand UND in Kreaturen-Nähe.
//   node scripts/diag-frame-profile.cjs
const puppeteer = require("puppeteer");
const http = require("http");
const fs = require("fs");
const path = require("path");
const PORT = 4392;
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
        protocolTimeout: 480000,
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
    page.setDefaultTimeout(420000);
    page.on("pageerror", (e) => console.log("[PAGE-ERROR]", (e.stack || e.message).split("\n")[0]));
    await page.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: "domcontentloaded", timeout: 30000 });
    await page.evaluate(async () => {
        let stubbed = false;
        const start = performance.now();
        let lastSize = -1,
            stableFor = 0;
        while (performance.now() - start < 120000) {
            const r = window.anazhRealm;
            if (r && !stubbed && r.state && r.state.renderer) {
                r.state.renderer.render = function () {};
                if (typeof r.state.renderer.renderAsync === "function")
                    r.state.renderer.renderAsync = () => Promise.resolve();
                r.state.postProcessingFailed = true;
                stubbed = true;
            }
            if (r && typeof r._gameLoopTick === "function") {
                try {
                    r._gameLoopTick(performance.now());
                } catch (_e) {}
                const sz = r.state && r.state.voxelChunks ? r.state.voxelChunks.size : 0;
                if (sz === lastSize) stableFor++;
                else {
                    stableFor = 0;
                    lastSize = sz;
                }
                if (sz > 40 && stableFor > 80) break;
            }
            await new Promise((res) => setTimeout(res, 4));
        }
    });

    const rep = await page.evaluate(async () => {
        const r = window.anazhRealm;
        // Allokations-Zähler: Vector3/Color/Quaternion-Subclass-Hook.
        const counters = { v3: 0, col: 0, quat: 0 };
        const OV3 = THREE.Vector3;
        THREE.Vector3 = class extends OV3 {
            constructor(...a) {
                super(...a);
                counters.v3++;
            }
        };
        const OC = THREE.Color;
        THREE.Color = class extends OC {
            constructor(...a) {
                super(...a);
                counters.col++;
            }
        };
        // Phasen-Wrapper (Ø/Max je Methode).
        const phases = [
            "_loopPhysicsSync",
            "updateCreatures",
            "_loopWeatherAndGrowth",
            "_loopVoxelStreaming",
            "_tickPendingWaterIso",
            "tickArchitectures",
            "_loopPlayerMovement",
            "_loopSelfAnalysis",
            "tickPlayerAura",
            "_loopFrustumCulling",
            "p2pTick",
            "_loopSkyboxPlanets",
            "_ensureHorizonMantle",
            // V18.290 — die Sub-Ticks von _loopVoxelStreaming (im Stand: welcher ist heiß?)
            "_tickVoxelChunkStreaming",
            "_tickArchitectureLOD",
            "_tickScatterStreaming",
            "_tickCanopyStreaming",
            "_tickWorldWaterCA",
            "_tickPendingVegSpawns",
            "_loopRender",
            "_loopNexusUpdate",
        ];
        const stats = {};
        for (const name of phases) {
            if (typeof r[name] !== "function") continue;
            const orig = r[name].bind(r);
            stats[name] = { sum: 0, max: 0, n: 0 };
            r[name] = (...a) => {
                const t0 = performance.now();
                const out = orig(...a);
                const dt = performance.now() - t0;
                stats[name].sum += dt;
                if (dt > stats[name].max) stats[name].max = dt;
                stats[name].n++;
                return out;
            };
        }
        const runProfile = async (ticks) => {
            const perTick = [];
            let allocStart = { ...counters };
            const tickTimes = [];
            for (let i = 0; i < ticks; i++) {
                const c0 = { v3: counters.v3, col: counters.col };
                const t0 = performance.now();
                try {
                    r._gameLoopTick(performance.now());
                } catch (_e) {}
                tickTimes.push(performance.now() - t0);
                perTick.push({ v3: counters.v3 - c0.v3, col: counters.col - c0.col });
                await new Promise((res) => setTimeout(res, 2));
            }
            const med = (arr) => arr.slice().sort((a, b) => a - b)[Math.floor(arr.length / 2)];
            void allocStart;
            return {
                tickMed: +med(tickTimes).toFixed(2),
                tickMax: +Math.max(...tickTimes).toFixed(2),
                v3Med: med(perTick.map((p) => p.v3)),
                v3Max: Math.max(...perTick.map((p) => p.v3)),
                colMed: med(perTick.map((p) => p.col)),
                colMax: Math.max(...perTick.map((p) => p.col)),
            };
        };
        // Profil A: Stand am Spawn (settled).
        for (const k of Object.keys(stats)) ((stats[k].sum = 0), (stats[k].max = 0), (stats[k].n = 0));
        const qBefore = {
            iso: r.state.pendingWaterIso ? r.state.pendingWaterIso.size : 0,
            mesh: r.state.voxelMeshPending ? r.state.voxelMeshPending.size : 0,
            caActive: r.state.waterCAActive ? r.state.waterCAActive.size : -1,
        };
        const profA = await runProfile(240);
        const qAfter = {
            iso: r.state.pendingWaterIso ? r.state.pendingWaterIso.size : 0,
            mesh: r.state.voxelMeshPending ? r.state.voxelMeshPending.size : 0,
            caActive: r.state.waterCAActive ? r.state.waterCAActive.size : -1,
        };
        const phasesA = {};
        for (const k of Object.keys(stats))
            if (stats[k].n)
                phasesA[k] = { avg: +(stats[k].sum / stats[k].n).toFixed(3), max: +stats[k].max.toFixed(2) };
        const nCreatures = r.state.creatures ? r.state.creatures.length : 0;
        return { profA, phasesA, nCreatures, chunks: r.state.voxelChunks.size, qBefore, qAfter };
    });

    console.log(`Kreaturen=${rep.nCreatures}  Chunks=${rep.chunks}`);
    console.log(
        `\nQUEUE-DRAINAGE über 240 Stand-Ticks (leert sich = settled · bleibt = churnt ewig):\n` +
            `  pendingWaterIso:  ${rep.qBefore.iso} → ${rep.qAfter.iso}\n` +
            `  voxelMeshPending: ${rep.qBefore.mesh} → ${rep.qAfter.mesh}\n` +
            `  waterCAActive:    ${rep.qBefore.caActive} → ${rep.qAfter.caActive}`
    );
    console.log(
        `\nTICK gesamt: median=${rep.profA.tickMed} ms  max=${rep.profA.tickMax} ms\n` +
            `Allokationen/Tick: Vector3 med=${rep.profA.v3Med} max=${rep.profA.v3Max} · Color med=${rep.profA.colMed} max=${rep.profA.colMax}`
    );
    console.log("\nPhasen (Ø ms | max ms):");
    const rows = Object.entries(rep.phasesA).sort((a, b) => b[1].avg - a[1].avg);
    for (const [k, v] of rows) console.log(`  ${k.padEnd(24)} ${String(v.avg).padStart(7)} | ${v.max}`);
    await browser.close();
    server.close();
    process.exit(0);
})();
