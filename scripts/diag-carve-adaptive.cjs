#!/usr/bin/env node
// ─────────────────────────────────────────────────────────────────────────
// diag-carve-adaptive.cjs — DER ADAPTIVE CARVE-REBUILD (npm run gate:carve)
//
// Schöpfer-Hardware-Befund (echtes Log): `Gegraben: 5× erde` → `FPS: 4`. Der Edit-/
// Spieler-Chunk-Rebuild zwang den Mesh-Bau SYNC (instant-Carve-Feedback) → auf
// schwacher HW ein ~200-ms-Stall pro Abbau-Hieb. FIX (V18.362, adaptiv): die
// Sync-Pflicht gilt NUR bei gesundem Frame (`!_frameOverBudget`) — starke HW behält
// das instant-Feedback, schwache HW baut ASYNC (alter Mesh bleibt, Kollision feld-nativ
// = sofort) → KEIN Stall. Diese Linse beweist die Entscheidung headless (GPU-frei).
// ─────────────────────────────────────────────────────────────────────────
const puppeteer = require("puppeteer");
const http = require("http");
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const PORT = 4330;
const mime = {
    ".html": "text/html",
    ".js": "application/javascript",
    ".wasm": "application/wasm",
    ".json": "application/json",
    ".css": "text/css",
    ".woff2": "font/woff2",
    ".png": "image/png",
};
const server = http.createServer((req, res) => {
    let p = req.url.split("?")[0];
    if (p === "/") p = "/index.html";
    const fp = path.join(root, p);
    if (!fp.startsWith(root)) return ((res.statusCode = 403), res.end());
    fs.readFile(fp, (err, data) => {
        if (err) return ((res.statusCode = 404), res.end());
        res.setHeader("Content-Type", mime[path.extname(fp)] || "application/octet-stream");
        res.end(data);
    });
});

(async () => {
    await new Promise((r) => server.listen(PORT, r));
    const browser = await puppeteer.launch({ headless: "new", args: ["--no-sandbox", "--disable-gpu"] });
    const page = await browser.newPage();
    await page.evaluateOnNewDocument(() => {
        window.__anazhHeadlessNullRenderer = true;
    });
    let out = null;
    try {
        await page.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: "networkidle0", timeout: 60000 });
        await page.waitForFunction(() => window.anazhRealm && typeof window.anazhRealm._gameLoopTick === "function", {
            timeout: 60000,
        });
        // ein paar Ticks, damit der Spieler-Chunk steht
        for (let i = 0; i < 20; i++) await page.evaluate(() => window.anazhRealm._gameLoopTick());
        out = await page.evaluate(() => {
            const r = window.anazhRealm,
                st = r.state;
            const pc = st.lastPlayerVoxelChunk;
            if (!pc) return { err: "kein Spieler-Chunk" };
            const cx = pc.cx,
                cz = pc.cz;
            const o = { isPlayerChunk: !!r._voxelChunkIsPlayerChunk(cx, cz) };
            // den Build-Aufruf bespitzeln → die forceSync-ENTSCHEIDUNG ablesen (unabhängig
            // vom headless-no-worker-Sync-Fallback)
            let lastForceSync = null;
            const orig = r._acquireVoxelChunkBuild.bind(r);
            r._acquireVoxelChunkBuild = function (a, b, c, opts) {
                lastForceSync = !!(opts && opts.forceSync);
                return orig(a, b, c, opts);
            };
            try {
                // (1) gesunder Frame → der Carve baut SYNC (instant Feedback)
                st._frameOverBudget = false;
                lastForceSync = null;
                r._rebuildVoxelChunk(cx, cz);
                o.syncWhenHealthy = lastForceSync;
                // (2) Frame über Budget (schwache HW) → der Carve baut ASYNC (KEIN Stall)
                st._frameOverBudget = true;
                lastForceSync = null;
                r._rebuildVoxelChunk(cx, cz);
                o.syncWhenStruggling = lastForceSync;
                // (3) explizites forceSync bleibt ABSOLUT (Test/Naht), auch über Budget
                lastForceSync = null;
                r._rebuildVoxelChunk(cx, cz, null, { forceSync: true });
                o.explicitForceSyncWins = lastForceSync;
            } finally {
                r._acquireVoxelChunkBuild = orig;
                st._frameOverBudget = false;
            }
            return o;
        });
    } catch (e) {
        out = { __err: (e && e.message) || String(e) };
    }
    await browser.close();
    server.close();

    if (!out || out.__err) {
        console.log(`⛔ Carve-Linse fehlgeschlagen: ${out ? out.__err || out.err : "?"}`);
        process.exit(2);
    }

    const checks = [
        { name: "Der Test-Chunk IST der Spieler-Chunk (Edit-Druck)", pass: out.isPlayerChunk },
        {
            name: "Gesunder Frame → Carve baut SYNC (instant-Feedback bleibt auf starker HW)",
            pass: out.syncWhenHealthy === true,
        },
        {
            name: "Frame über Budget → Carve baut ASYNC (KEIN ~200-ms-Stall auf schwacher HW)",
            pass: out.syncWhenStruggling === false,
        },
        {
            name: "Explizites forceSync gewinnt IMMER (Test/Naht-Intent absolut)",
            pass: out.explicitForceSyncWins === true,
        },
    ];
    console.log("\n=== Adaptiver Carve-Rebuild (Grab-Stall an der Wurzel) ===");
    let fails = 0;
    for (const c of checks) {
        console.log(`  ${c.pass ? "✅" : "❌"} ${c.name}`);
        if (!c.pass) fails++;
    }
    console.log(`\n${checks.length - fails}/${checks.length} Carve-Invarianten OK.`);
    if (fails) {
        console.log("⛔ Der adaptive Carve-Rebuild greift nicht — das Graben stallt schwache HW noch.");
        process.exit(1);
    }
    console.log("✅ Graben stallt schwache HW nicht mehr (async unter Budget), starke HW behält instant-Feedback.");
    process.exit(0);
})();
