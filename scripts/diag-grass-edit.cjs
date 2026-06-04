// Diagnose Welle G-fix — Gras-Reset nur bei Oberflächen-Änderung. Beweist:
// (1) ein Rebuild OHNE Oberflächen-Änderung (Nexus/Skirt/LOD) BEHÄLT das Gras
//     (gleiche Mesh-Referenz, kein Dispose → kein Flackern);
// (2) ein Carve markiert den Chunk grass-dirty → Rebuild baut Gras SYNCHRON neu
//     (sofort präsent, NICHT über die deferred Queue → kein Flackern).
const puppeteer = require("puppeteer"),
    http = require("http"),
    fs = require("fs"),
    path = require("path");
const PORT = 4323,
    root = path.resolve(__dirname, "..");
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
    page.on("pageerror", (e) => console.log("[PAGE-ERROR]", (e.stack || e.message).split("\n")[0]));
    await page.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: "domcontentloaded", timeout: 30000 });
    await page.evaluate(async () => {
        const s = performance.now();
        while (performance.now() - s < 25000) {
            const r = window.anazhRealm;
            if (r && r._gameLoopTick) {
                try {
                    r._gameLoopTick(performance.now());
                } catch (_) {}
                if (r.state && r.state.playerMesh && r.state.voxelChunks && r.state.voxelChunks.size > 10) break;
            }
            await new Promise((z) => setTimeout(z, 16));
        }
        // Gras der gestreamten Chunks materialisieren (deferred Queue leeren).
        const r = window.anazhRealm;
        if (r._drainDirtyVoxelChunks) r._drainDirtyVoxelChunks();
        if (r._drainPendingGrass) r._drainPendingGrass();
    });
    const rep = await page.evaluate(() => {
        const r = window.anazhRealm,
            out = {};
        const { span } = r._voxelChunkConfig();
        // Einen Chunk MIT Gras nahe dem Spieler finden.
        let gkey = null;
        for (const k of r.state.voxelChunkGrass.keys()) {
            if (r.state.voxelChunks.has(k)) {
                gkey = k;
                break;
            }
        }
        out.foundGrassChunk = !!gkey;
        if (gkey) {
            const c = gkey.indexOf(","),
                cx = parseInt(gkey.slice(0, c)),
                cz = parseInt(gkey.slice(c + 1));
            const meshBefore = r.state.voxelChunkGrass.get(gkey);
            // (1) Rebuild OHNE Oberflaechen-Aenderung (nicht grass-dirty) → Gras behalten.
            if (r.state.grassDirtyChunks) r.state.grassDirtyChunks.delete(gkey);
            r._rebuildVoxelChunk(cx, cz, null, { forceSync: true });
            const meshAfterKeep = r.state.voxelChunkGrass.get(gkey);
            out.keptSameMesh = meshAfterKeep === meshBefore && !!meshAfterKeep; // gleiche Referenz = nicht disposed
            // (2) Carve im Chunk-Zentrum → grass-dirty → Rebuild baut SYNCHRON neu.
            const surfY = r._voxelSurfaceY(cx * span + span / 2, cz * span + span / 2);
            if (typeof surfY === "number") {
                r.carveVoxelSphere(cx * span + span / 2, surfY - 1, cz * span + span / 2, 3.5);
                out.markedDirty = r.state.grassDirtyChunks && r.state.grassDirtyChunks.has(gkey);
                // pendingGrass VOR dem Drain: der Carve darf NICHT auf die deferred Queue
                // setzen (sonst Flackern) — er baut sync im Rebuild.
                if (r._drainDirtyVoxelChunks) r._drainDirtyVoxelChunks();
                const meshAfterCarve = r.state.voxelChunkGrass.get(gkey);
                out.grassPresentAfterCarve = !!meshAfterCarve;
                out.dirtyCleared = !(r.state.grassDirtyChunks && r.state.grassDirtyChunks.has(gkey));
                out.notInPendingQueue = !(r.state.pendingGrass && r.state.pendingGrass.has(gkey));
            }
        }
        return out;
    });
    await browser.close();
    server.close();
    console.log("\n===== WELLE G-FIX — GRAS-RESET-DIAGNOSE =====\n");
    const line = (l, ok) => console.log(`  [${ok ? "OK" : "XX"}] ${l}`);
    line("ein Gras-Chunk gefunden", rep.foundGrassChunk);
    line("(1) Rebuild ohne Oberflaechen-Aenderung BEHAELT das Gras (gleiche Mesh-Ref)", rep.keptSameMesh);
    line("(2) Carve markiert den Chunk grass-dirty", rep.markedDirty);
    line("(2) nach Carve+Drain ist Gras praesent (sync neu gebaut)", rep.grassPresentAfterCarve);
    line("(2) grass-dirty Flag nach dem Rebuild geleert", rep.dirtyCleared);
    line("(2) Carve setzt NICHT auf die deferred pendingGrass-Queue (kein Flackern)", rep.notInPendingQueue);
    const ok =
        rep.foundGrassChunk &&
        rep.keptSameMesh &&
        rep.markedDirty &&
        rep.grassPresentAfterCarve &&
        rep.dirtyCleared &&
        rep.notInPendingQueue;
    console.log(
        "\n  VERDIKT:",
        ok ? "GRÜN — Gras bleibt bei Nicht-Oberflaechen-Rebuilds, resettet sync nur beim Carve." : "ROT — siehe oben."
    );
    console.log("\n============================================\n");
})();
