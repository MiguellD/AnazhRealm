// VERIFIZIERT DEN INSTANCING-FIX AUF DEM ECHTEN FOUNDRY-PFAD (Schöpfer „1:1 auf die GPU, der Katalysator").
// Der Null-Renderer schaltet die Foundry AUS (_foundryEnabled braucht einen echten Renderer) → er misst nur
// die klassischen gewachsenen Bäume. Diese Linse bootet den ECHTEN swiftshader-Renderer + Foundry AN, RENDERT
// aber NIE (wie diag-pipeline-truth → kein Haenger), und misst die Baum-Szene: sind die Foundry-Bäume jetzt
// GETEILTE InstancedMeshes (EINE geom je Variante, N Matrizen = Studio-Katalysator) statt kopierte Batches?
const puppeteer = require("puppeteer");
const http = require("http");
const fs = require("fs");
const path = require("path");
const PORT = 4531;
const root = path.resolve(__dirname, "..");
const mime = {
    ".html": "text/html",
    ".js": "application/javascript",
    ".wasm": "application/wasm",
    ".json": "application/json",
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
        protocolTimeout: 200000,
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
    page.on("pageerror", (e) => console.log("[ERR]", (e.stack || e.message).split("\n")[0]));
    await page.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: "domcontentloaded", timeout: 30000 });
    const out = await page.evaluate(async () => {
        const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
        // Echter Renderer, aber RENDER GESTUBT (kein Pixel → kein Haenger); Foundry bleibt AN (nicht null).
        let stub = false;
        const s0 = performance.now();
        while (performance.now() - s0 < 60000) {
            const r = window.anazhRealm;
            if (r && !stub && r.state && r.state.renderer && !r.state.renderer._isHeadlessNull) {
                r.state.renderer.render = function () {};
                if (r.state.renderer.renderAsync) r.state.renderer.renderAsync = () => Promise.resolve();
                r.state.postProcessingFailed = true;
                r._bootWarmDone = true;
                stub = true;
            }
            if (r && typeof r._gameLoopTick === "function") {
                try {
                    r._gameLoopTick(performance.now());
                } catch (_e) {}
                if (r.state.voxelChunks && r.state.voxelChunks.size >= 12) break;
            }
            await sleep(5);
        }
        const r = window.anazhRealm;
        const s = r.state;
        // Foundry ready + Bäume konvertieren lassen (Budget gesund erzwingen → Rewarm baut die Foundry-Geometrie).
        const f = r._ensureAssetFoundry();
        const t0 = performance.now();
        while (f && !f.ready && performance.now() - t0 < 30000) await sleep(100);
        for (let i = 0; i < 60; i++) {
            s._frameOverBudget = false;
            try {
                r._foundryRewarmColdTrees();
                r._gameLoopTick(performance.now());
            } catch (_e) {}
            if (i % 15 === 0) await sleep(20);
        }
        const triOf = (g) => {
            if (!g) return 0;
            const idx = g.index;
            if (idx) return idx.count / 3;
            const p = g.attributes && g.attributes.position;
            return p ? p.count / 3 : 0;
        };
        // Baum-Meshes messen: Batched (kopiert) vs InstancedMesh (geteilt). UNIQUE geom = Speicher.
        const seen = new Set();
        let batched = 0,
            batchedTris = 0,
            instanced = 0,
            instancedDrawn = 0,
            uniqueTris = 0,
            heavyInst = 0,
            heavyBatch = 0;
        if (s.scene)
            s.scene.traverse((o) => {
                if (!o.visible || !(o.isMesh || o.isInstancedMesh || o.isBatchedMesh) || !o.geometry) return;
                const t = triOf(o.geometry);
                const heavy = t > 20000;
                if (o.isBatchedMesh) {
                    batched++;
                    batchedTris += t;
                    if (heavy) heavyBatch++;
                }
                if (o.isInstancedMesh) {
                    instanced++;
                    instancedDrawn += t * (o.count || 0);
                    if (heavy) heavyInst++;
                }
                const gid = o.geometry.uuid;
                if (!seen.has(gid)) {
                    seen.add(gid);
                    uniqueTris += t;
                }
            });
        // Foundry-Bäume zaehlen
        let baumFoundry = 0,
            baum = 0;
        for (const e of s.architectures || []) {
            const sp = ((e._lodSpecies || e.type || "") + "").toLowerCase();
            if (/baum/.test(sp)) {
                baum++;
                if (e.instFoundry) baumFoundry++;
            }
        }
        return {
            foundryReady: !!(f && f.ready),
            baeume: baum,
            baeumeFoundry: baumFoundry,
            batchedMeshes: batched,
            batchedTris: Math.round(batchedTris),
            instancedMeshes: instanced,
            instancedDrawnTris: Math.round(instancedDrawn),
            schwereBatched: heavyBatch,
            schwereInstanced: heavyInst,
            uniqueGeomTris: Math.round(uniqueTris),
        };
    });
    console.log(JSON.stringify(out, null, 2));
    console.log("\nLESART: schwereBatched=0 + schwereInstanced>0 → schwere Baum-Geometrie ist GETEILT (Fix wirkt).");
    console.log(
        "        uniqueGeomTris << baeume×170k → wenige geteilte Geometrien statt N Kopien (Studio-Katalysator)."
    );
    await browser.close();
    server.close();
    process.exit(0);
})();
