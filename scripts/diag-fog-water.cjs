// Diagnose — DER NEBEL WARTET AUF DAS WASSER (V18.346, Schöpfer-HAUPTPROBLEM).
//
// Die Mechanik (hardware-unabhängig, reine Logik): `_builtWaterRingRadius()` deckelt den Lade-
// Nebel-Reveal auf den grössten Ring, in dem JEDER Chunk terrain-gebaut UND wasser-fertig ist
// (NICHT in `pendingWaterIso`). Ist ein NAHER Chunk wasser-pending, MUSS die Wasser-Front DAVOR
// stoppen (kleiner als die Terrain-Front) → der Nebel weicht nicht über den leeren See.
//
// Ich teste die LOGIK direkt am State (der Headless-Null-Pfad gibt sonst die Terrain-Front zurück
// = gate-treu, aber ungated → für DIESEN Test umgehe ich den Headless-Kurzschluss kontrolliert).
const puppeteer = require("puppeteer");
const http = require("http");
const fs = require("fs");
const path = require("path");
const PORT = 4403;
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
        headless: true, protocolTimeout: 300000,
        args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--enable-webgl", "--ignore-gpu-blocklist", "--no-sandbox", "--disable-setuid-sandbox"],
    });
    const page = await browser.newPage();
    let pageErr = null;
    page.on("pageerror", (e) => { pageErr = (e.stack || e.message).split("\n")[0]; });
    await page.evaluateOnNewDocument(() => { window.__anazhHeadlessNullRenderer = true; });
    await page.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: "domcontentloaded", timeout: 30000 });
    await page.evaluate(async () => {
        const start = performance.now();
        let lastSize = -1, stableFor = 0;
        while (performance.now() - start < 70000) {
            const r = window.anazhRealm;
            if (r && typeof r._gameLoopTick === "function") {
                try { r._gameLoopTick(performance.now()); } catch (_e) { /* */ }
                const sz = r.state && r.state.voxelChunks ? r.state.voxelChunks.size : 0;
                if (sz === lastSize) stableFor++; else { stableFor = 0; lastSize = sz; }
                if (sz > 30 && stableFor > 40) break;
            }
            await new Promise((res) => setTimeout(res, 6));
        }
    });

    const report = await page.evaluate(() => {
        const r = window.anazhRealm;
        const st = r.state;
        const pc = st.lastPlayerVoxelChunk;
        const out = { pc: pc ? { cx: pc.cx, cz: pc.cz } : null };
        // 1) Headless-Kurzschluss temporär umgehen, um die ECHTE Gating-Logik zu prüfen.
        const wasNull = st.renderer && st.renderer._isHeadlessNull;
        if (st.renderer) st.renderer._isHeadlessNull = false;
        const savedPend = st.pendingWaterIso;

        // Terrain-Front (Referenz).
        const builtK = r._builtRingRadius();
        out.builtK = builtK;

        // 2) KEIN Wasser pending → Wasser-Front == Terrain-Front (alle Chunks wasser-fertig).
        st.pendingWaterIso = new Set();
        out.waterK_noPending = r._builtWaterRingRadius();

        // 3) Ein NAHER Chunk (ring 1, östlich) wasser-pending → die Wasser-Front MUSS auf ring 0 stoppen.
        if (pc) {
            st.pendingWaterIso = new Set([`${pc.cx + 1},${pc.cz}`]);
            out.waterK_ring1Pending = r._builtWaterRingRadius();
            // 4) Ein FERNER Chunk (ring 3) pending → Front stoppt bei ring 2.
            st.pendingWaterIso = new Set([`${pc.cx + 3},${pc.cz}`]);
            out.waterK_ring3Pending = r._builtWaterRingRadius();
            // 5) Der Spieler-Chunk selbst pending → Front -1 (Kokon).
            st.pendingWaterIso = new Set([`${pc.cx},${pc.cz}`]);
            out.waterK_selfPending = r._builtWaterRingRadius();
        }

        // 6) revealK = min(terrain, gras, wasser) — die all-null-Reduktion bewahren.
        const reduce3 = (a, b, c) => [a, b, c].reduce((acc, v) => (v === null ? acc : acc === null ? v : Math.min(acc, v)), null);
        out.reduce_allNull = reduce3(null, null, null); // muss null sein
        out.reduce_min = reduce3(4, 3, 2); // muss 2 sein
        out.reduce_someNull = reduce3(4, null, 2); // muss 2 sein

        // restore
        st.pendingWaterIso = savedPend;
        if (st.renderer) st.renderer._isHeadlessNull = wasNull;
        // 7) Headless-Pfad: gibt die Terrain-Front zurück (gate-treu).
        out.waterK_headless = r._builtWaterRingRadius();
        return out;
    });

    console.log("\n===== NEBEL WARTET AUF WASSER — LOGIK-MESSUNG =====\n");
    if (pageErr) console.log("PAGE-ERROR:", pageErr);
    const o = report;
    console.log(`  Spieler-Chunk: ${JSON.stringify(o.pc)}`);
    console.log(`  Terrain-Front builtK: ${o.builtK}`);
    console.log(`  Wasser-Front, kein Pending:        ${o.waterK_noPending}   (erwartet == builtK ${o.builtK})`);
    console.log(`  Wasser-Front, ring1 pending:       ${o.waterK_ring1Pending}   (erwartet 0 — stoppt VOR ring 1)`);
    console.log(`  Wasser-Front, ring3 pending:       ${o.waterK_ring3Pending}   (erwartet 2 — stoppt VOR ring 3)`);
    console.log(`  Wasser-Front, Spieler-Chunk pending: ${o.waterK_selfPending}   (erwartet -1 — Kokon)`);
    console.log(`  Headless-Pfad (gate-treu):         ${o.waterK_headless}   (erwartet == builtK ${o.builtK})`);
    console.log(`  reduce(null,null,null)=${o.reduce_allNull} (erw null) · reduce(4,3,2)=${o.reduce_min} (erw 2) · reduce(4,null,2)=${o.reduce_someNull} (erw 2)`);

    const ok =
        o.builtK != null &&
        o.waterK_noPending === o.builtK &&
        o.waterK_ring1Pending === 0 &&
        o.waterK_ring3Pending === 2 &&
        o.waterK_selfPending === -1 &&
        o.waterK_headless === o.builtK &&
        o.reduce_allNull === null &&
        o.reduce_min === 2 &&
        o.reduce_someNull === 2;
    console.log(`\n  ${ok ? "✅ Die Wasser-Front stoppt VOR jedem pending-Wasser-Chunk; der Nebel wartet, kein leerer See." : "⚠️ Die Gating-Logik weicht ab — prüfen, NICHT blind ändern."}\n`);
    await browser.close();
    server.close();
    process.exit(ok ? 0 : 1);
})();
