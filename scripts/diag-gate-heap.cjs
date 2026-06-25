// MISS DEN GATE-TOD — er ist OOM, kein "swiftshader" (das Gate ist Null-Renderer, kein GPU).
// Bootet die Gate-Welt (Null-Renderer, Warmup), misst Heap + Szene-Gewicht, simuliert dann die
// BAND-AKKUMULATION (viele spawnArchitecture + Avatar-Bauten wie die echten Bänder) und misst den
// Heap-WACHSTUM. → ich weiss, ob die Welt zu schwer ist (Dichte senken) oder ob es ein LECK ist
// (Bänder akkumulieren ohne Cleanup) — die WURZEL der 15 "detached frame"-Fehler.
const puppeteer = require("puppeteer");
const http = require("http");
const fs = require("fs");
const path = require("path");
const PORT = 4406;
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
        headless: true, protocolTimeout: 180000,
        args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--enable-webgl", "--ignore-gpu-blocklist", "--no-sandbox", "--disable-setuid-sandbox", "--enable-precise-memory-info", "--js-flags=--expose-gc"],
    });
    const page = await browser.newPage();
    let pageErr = null;
    page.on("pageerror", (e) => { pageErr = (e.stack || e.message).split("\n")[0]; });
    // GENAU wie das Gate: Null-Renderer + Skin-Res-Cap.
    await page.evaluateOnNewDocument(() => { window.__anazhHeadlessNullRenderer = true; window.__anazhHeadlessSkinResCap = 64; });
    await page.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: "domcontentloaded", timeout: 30000 });

    const mem = async (label) => {
        return await page.evaluate((label) => {
            const m = performance.memory ? performance.memory.usedJSHeapSize : 0;
            const r = window.anazhRealm, s = r && r.state;
            let sceneKids = 0, instTris = 0, instMeshes = 0;
            if (s && s.scene) s.scene.traverse((o) => {
                sceneKids++;
                if (o.isInstancedMesh) { instMeshes++; const g = o.geometry; if (g && g.index) instTris += (g.index.count / 3) * (o.count || 0); }
            });
            return {
                label,
                heapMB: +(m / 1048576).toFixed(1),
                sceneKids,
                instMeshes,
                instTrisM: +(instTris / 1e6).toFixed(2),
                chunks: s && s.voxelChunks ? s.voxelChunks.size : 0,
                creatures: s && s.creatures ? s.creatures.length : 0,
                arches: s && s.architecture ? (s.architecture.size || s.architecture.length || 0) : 0,
            };
        }, label);
    };

    // Warmup wie das Gate (count-basiert, Null-Renderer baut sync).
    await page.evaluate(async () => {
        const r = window.anazhRealm;
        if (r && r.state) r.state.voxelWorker = null; // sync-Bau (wie der Gate-Warmup)
        const start = performance.now();
        let lastSize = -1, stableFor = 0;
        while (performance.now() - start < 70000) {
            if (r && typeof r._gameLoopTick === "function") {
                try { r._gameLoopTick(performance.now()); } catch (_e) {}
                const sz = r.state && r.state.voxelChunks ? r.state.voxelChunks.size : 0;
                if (sz === lastSize) stableFor++; else { stableFor = 0; lastSize = sz; }
                if (sz >= 60 && stableFor > 30) break;
            }
            await new Promise((res) => setTimeout(res, 4));
        }
    });

    const base = await mem("nach Warmup (Welt-Basis)");
    if (page.evaluate) { try { await page.evaluate(() => window.gc && window.gc()); } catch (_e) {} }
    const baseGc = await mem("nach Warmup + GC");

    // Simuliere die BAND-AKKUMULATION: 150 spawnArchitecture (wie die Bänder über den Lauf).
    const spawnGrow = await page.evaluate(() => {
        const r = window.anazhRealm, s = r.state;
        const p = s.playerMesh.position;
        let spawned = 0;
        for (let i = 0; i < 150; i++) {
            try {
                const a = r.spawnArchitecture("stein_block", { x: p.x + 6 + (i % 25), y: p.y, z: p.z + 6 + Math.floor(i / 25) * 3 });
                if (a) spawned++;
            } catch (_e) {}
        }
        return { spawned };
    });
    const afterSpawn = await mem("nach 150 spawnArchitecture (Band-Sim)");

    // Simuliere die Avatar-/Soul-Bauten (wie checkBandRing5Soul, das Heaviest).
    const soulGrow = await page.evaluate(() => {
        const r = window.anazhRealm;
        let built = 0;
        for (let i = 0; i < 8; i++) {
            try { if (typeof r._buildHumanGroup === "function") { r._buildHumanGroup(); built++; } } catch (_e) {}
        }
        return { built };
    });
    const afterSoul = await mem("nach 8 Avatar-Bauten (Ring5Soul-Sim)");
    try { await page.evaluate(() => window.gc && window.gc()); } catch (_e) {}
    const afterSoulGc = await mem("nach Avatar-Bauten + GC (= echtes Leck?)");

    console.log("\n===== GATE-HEAP — DIE WURZEL DES 'DETACHED FRAME' =====\n");
    if (pageErr) console.log("PAGE-ERROR:", pageErr);
    const row = (m) => console.log(`  ${m.label.padEnd(38)} heap ${String(m.heapMB).padStart(7)} MB · scene ${String(m.sceneKids).padStart(4)} · instMesh ${String(m.instMeshes).padStart(4)} · instTris ${String(m.instTrisM).padStart(6)}M · chunks ${m.chunks} · creat ${m.creatures} · arch ${m.arches}`);
    row(base); row(baseGc);
    console.log(`  [+150 spawnArchitecture, ${spawnGrow.spawned} erfolgreich]`);
    row(afterSpawn);
    console.log(`  [+8 Avatar-Bauten, ${soulGrow.built} erfolgreich]`);
    row(afterSoul); row(afterSoulGc);
    const baseH = baseGc.heapMB, spawnDelta = afterSpawn.heapMB - baseGc.heapMB, soulDelta = afterSoulGc.heapMB - afterSpawn.heapMB;
    console.log(`\n  WELT-BASIS: ${baseH} MB · +150 Arch: +${spawnDelta.toFixed(1)} MB (${(spawnDelta / 150).toFixed(2)} MB/Spawn) · Avatar-Rest nach GC: +${soulDelta.toFixed(1)} MB`);
    console.log(`  ANALYSE: ${baseH > 800 ? "die WELT-BASIS ist schwer → Dichte senken (Schöpfer-Weg)" : "Welt-Basis ok"}; ${spawnDelta / 150 > 0.5 ? "Spawns akkumulieren stark → Band-Cleanup/Cap" : "Spawns leicht"}; ${soulDelta > 30 ? "Avatar-Bauten LECKEN trotz GC → Skin-Cache/Dispose prüfen" : "Avatar-Bauten sauber"}\n`);
    await browser.close();
    server.close();
})();
