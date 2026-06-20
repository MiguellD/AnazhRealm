// MESS-PROBE: der „ich drehe mich kaum und alles hängt"-Befund. Drehen ist
// STATIONÄR (Position fix) → kein Streaming, kein Spawn, keine Kollisions-
// Add/Free. Was bleibt, läuft JEDEN Frame: der Tick + der Render (1109 Draw-
// Calls) + GC. Diese Probe misst STATIONÄR über N Frames:
//   (1) Tick-Zeit p50/p99/max (ist die CPU jetzt sauber?)
//   (2) JS-Heap-Churn pro Frame (GC-Druck = Ruckler/„hängt")
//   (3) Ammo-Body-Zahl (hat Laub/jeder Baum Kollision? — die Schöpfer-Frage)
//   (4) Szene-Mesh/Instanz-Zahl (Bäume „unter dem Radar")
// Null-Renderer (schnell) — der Render-JS-Anteil fehlt hier bewusst (er ist
// gestubbt); diese Probe isoliert TICK + HEAP + AMMO, die headless ehrlich sind.
const puppeteer = require("puppeteer");
const http = require("http");
const fs = require("fs");
const path = require("path");
const PORT = Number(process.env.DIAG_PORT) || 4396;
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
    const browser = await puppeteer.launch({
        headless: true,
        protocolTimeout: 580000,
        args: ["--no-sandbox", "--disable-setuid-sandbox", "--js-flags=--expose-gc"],
    });
    const page = await browser.newPage();
    await page.evaluateOnNewDocument(() => {
        window.__anazhHeadlessNullRenderer = true;
        window.__anazhHeadlessSkinResCap = 64;
    });
    await page.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: "load", timeout: 30000 });
    // Warmup: pumpen bis die Welt settled (Chunk-Plateau).
    await page.evaluate(async () => {
        const start = performance.now();
        let lastSize = -1, stableFor = 0;
        while (performance.now() - start < 90000) {
            const r = window.anazhRealm;
            if (r && typeof r._gameLoopTick === "function") {
                try { r._gameLoopTick(performance.now()); } catch (_e) {}
                const sz = r.state && r.state.voxelChunks ? r.state.voxelChunks.size : 0;
                if (sz === lastSize) stableFor++; else { stableFor = 0; lastSize = sz; }
                if (sz > 40 && stableFor > 80) break;
            }
            await new Promise((res) => setTimeout(res, 4));
        }
    });
    const out = await page.evaluate(async () => {
        const r = window.anazhRealm, s = r.state;
        const o = {};
        // (3) AMMO-BODY-ZAHL — hat Laub/Baum Kollision?
        let ammoBodies = -1, archCollisions = 0, archWithMesh = 0;
        try {
            if (s.physicsWorld && typeof s.physicsWorld.getNumCollisionObjects === "function") {
                ammoBodies = s.physicsWorld.getNumCollisionObjects();
            }
        } catch (_e) {}
        // Wieviele architectures tragen einen Kollisions-Body?
        if (Array.isArray(s.architectures)) {
            for (const e of s.architectures) {
                if (e && e.collision) archCollisions++;
                if (e && e.mesh) archWithMesh++;
            }
        }
        o.ammo = {
            totalBodies: ammoBodies,
            rigidBodiesTracked: Array.isArray(s.rigidBodies) ? s.rigidBodies.length : -1,
            architectures: Array.isArray(s.architectures) ? s.architectures.length : -1,
            archWithCollision: archCollisions,
            archWithMesh,
            voxelChunksWithBVH: (() => { let n = 0; if (s.voxelChunks) for (const e of s.voxelChunks.values()) if (e && e.hasBVH) n++; return n; })(),
        };
        // (4) SZENE-INSTANZ-ZAHL (Bäume unter dem Radar)
        let instMeshes = 0, instTotal = 0, plainMeshes = 0;
        if (s.scene) {
            s.scene.traverse((n) => {
                if (n.isInstancedMesh) { instMeshes++; instTotal += n.count || 0; }
                else if (n.isMesh) plainMeshes++;
            });
        }
        o.scene = {
            instancedMeshes: instMeshes,
            instancedTotal: instTotal,
            plainMeshes,
            archInstanceGroups: s.archInstanceGroups ? s.archInstanceGroups.size : -1,
            scatterRegions: s.scatterRegions ? s.scatterRegions.size : -1,
        };
        // (1)+(2) STATIONÄR: Tick-Zeit + Heap-Churn über N Frames.
        const N = 300;
        const t = performance.now();
        const gc = () => { try { if (window.gc) window.gc(); } catch (_e) {} };
        gc();
        const heap0 = performance.memory ? performance.memory.usedJSHeapSize : -1;
        const times = [];
        let now = t;
        for (let i = 0; i < N; i++) {
            now += 16.67;
            const a = performance.now();
            try { r._gameLoopTick(now); } catch (_e) {}
            times.push(performance.now() - a);
        }
        const heap1 = performance.memory ? performance.memory.usedJSHeapSize : -1;
        gc();
        const heap2 = performance.memory ? performance.memory.usedJSHeapSize : -1;
        times.sort((a, b) => a - b);
        const pct = (p) => times[Math.min(times.length - 1, Math.floor(times.length * p))];
        o.tick = {
            frames: N,
            p50: +pct(0.5).toFixed(2),
            p90: +pct(0.9).toFixed(2),
            p99: +pct(0.99).toFixed(2),
            max: +times[times.length - 1].toFixed(2),
            sum: +times.reduce((s2, x) => s2 + x, 0).toFixed(0),
        };
        o.heap = {
            beforeMB: heap0 > 0 ? +(heap0 / 1048576).toFixed(1) : -1,
            afterMB: heap1 > 0 ? +(heap1 / 1048576).toFixed(1) : -1,
            afterGCMB: heap2 > 0 ? +(heap2 / 1048576).toFixed(1) : -1,
            churnPerFrameKB: heap0 > 0 && heap1 > 0 ? +(((heap1 - heap0) / N) / 1024).toFixed(1) : -1,
            churnTotalMB: heap0 > 0 && heap1 > 0 ? +((heap1 - heap0) / 1048576).toFixed(1) : -1,
        };
        // perfSense-Snapshot (was MISST der Nexus pro Subsystem?)
        if (s.perfSense && s.perfSense.phases) {
            const ph = {};
            for (const k of Object.keys(s.perfSense.phases)) {
                const v = s.perfSense.phases[k];
                if (v && (v.ewma > 0.05 || (v.max || 0) > 0.5)) ph[k] = { ewma: +(v.ewma || 0).toFixed(2), max: +(v.max || 0).toFixed(2) };
            }
            o.perfSense = ph;
            o.renderCalls = s.perfSense.renderCalls ? +(s.perfSense.renderCalls.ewma || 0).toFixed(0) : -1;
        }
        return o;
    });
    console.log("\n===== TURN-HANG-PROBE (stationär, Null-Renderer) =====\n");
    console.log("  (3) KOLLISION (die Schoepfer-Frage: hat jedes Blatt Kollision?):");
    console.log("      Ammo-Bodies gesamt: " + out.ammo.totalBodies);
    console.log("      davon Voxel-Chunks mit BVH: " + out.ammo.voxelChunksWithBVH);
    console.log("      architectures: " + out.ammo.architectures + " · mit Mesh: " + out.ammo.archWithMesh + " · mit Kollision: " + out.ammo.archWithCollision);
    console.log("      rigidBodies (getrackt): " + out.ammo.rigidBodiesTracked);
    console.log("\n  (4) BÄUME UNTER DEM RADAR (Szene vs Zähler):");
    console.log("      InstancedMeshes: " + out.scene.instancedMeshes + " (= Draw-Calls) · Instanzen gesamt: " + out.scene.instancedTotal);
    console.log("      plain Meshes: " + out.scene.plainMeshes);
    console.log("      archInstanceGroups (HISM): " + out.scene.archInstanceGroups + " · scatterRegions: " + out.scene.scatterRegions);
    console.log("\n  (1) STATIONÄRER TICK (CPU, " + out.tick.frames + " Frames):");
    console.log("      p50 " + out.tick.p50 + " · p90 " + out.tick.p90 + " · p99 " + out.tick.p99 + " · MAX " + out.tick.max + " ms");
    console.log("\n  (2) HEAP-CHURN (GC-Druck = Ruckler):");
    console.log("      vorher " + out.heap.beforeMB + " MB → nachher " + out.heap.afterMB + " MB (nach GC " + out.heap.afterGCMB + " MB)");
    console.log("      churn: " + out.heap.churnPerFrameKB + " KB/Frame · " + out.heap.churnTotalMB + " MB über " + out.tick.frames + " Frames");
    if (out.perfSense) {
        console.log("\n  perfSense (Nexus-Selbstmessung, ms/Frame · nur >0.05):");
        for (const [k, v] of Object.entries(out.perfSense).sort((a, b) => b[1].ewma - a[1].ewma)) {
            console.log("      " + k.padEnd(22) + " ewma " + String(v.ewma).padStart(6) + " · max " + String(v.max).padStart(6));
        }
        console.log("      renderCalls (EWMA): " + out.renderCalls);
    }
    console.log("\n======================================================\n");
    try { fs.writeFileSync(path.join(root, "artifacts", "diag-turn-hang.json"), JSON.stringify(out, null, 2)); } catch (_e) {}
    await browser.close();
    server.close();
    process.exit(0);
})().catch((e) => { console.error("CRASH:", e); process.exit(2); });
