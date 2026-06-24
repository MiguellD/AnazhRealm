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
const mime = {
    ".html": "text/html",
    ".js": "application/javascript",
    ".json": "application/json",
    ".css": "text/css",
    ".wasm": "application/wasm",
    ".woff2": "font/woff2",
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
        protocolTimeout: 300000,
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
    let pageErr = null;
    page.on("pageerror", (e) => {
        pageErr = (e.stack || e.message).split("\n")[0];
    });
    await page.evaluateOnNewDocument(() => {
        window.__anazhHeadlessNullRenderer = true;
    });
    await page.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: "domcontentloaded", timeout: 30000 });
    await page.evaluate(async () => {
        const start = performance.now();
        let lastSize = -1,
            stableFor = 0;
        while (performance.now() - start < 70000) {
            const r = window.anazhRealm;
            if (r && typeof r._gameLoopTick === "function") {
                try {
                    r._gameLoopTick(performance.now());
                } catch (_e) {
                    /* */
                }
                const sz = r.state && r.state.voxelChunks ? r.state.voxelChunks.size : 0;
                if (sz === lastSize) stableFor++;
                else {
                    stableFor = 0;
                    lastSize = sz;
                }
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
        const savedWi = st.voxelChunkWaterIso;

        // Terrain-Front (Referenz).
        const builtK = r._builtRingRadius();
        out.builtK = builtK;

        // V18.348 — die Front liest jetzt voxelChunkWaterIso (Mesh existiert?) statt nur pending:
        // ein gebauter, von der CA re-enqueuter Chunk (Mesh da + in pending) gilt als FERTIG → die
        // Front retracted NICHT → kein Flackern. Nur ein NIE-gebauter pending-Chunk (kein Mesh) wartet.
        const fakeMesh = { isMesh: true };
        const setup = (pendKeys, meshKeys) => {
            st.pendingWaterIso = new Set(pendKeys);
            st.voxelChunkWaterIso = new Map(meshKeys.map((k) => [k, fakeMesh]));
        };

        // 2) KEIN Wasser pending → Front == Terrain-Front (alle ready).
        setup([], []);
        out.waterK_noPending = r._builtWaterRingRadius();

        if (pc) {
            const r1 = `${pc.cx + 1},${pc.cz}`,
                r3 = `${pc.cx + 3},${pc.cz}`,
                self = `${pc.cx},${pc.cz}`;
            // 3) ring1 pending + KEIN Mesh (Streaming-Front, nie gebaut) → Front stoppt bei 0.
            setup([r1], []);
            out.waterK_ring1NoMesh = r._builtWaterRingRadius();
            // 4) ring1 pending ABER Mesh EXISTIERT (CA re-enqueued) → MONOTON: Front retracted NICHT == builtK.
            setup([r1], [r1]);
            out.waterK_ring1HasMesh = r._builtWaterRingRadius();
            // 5) ring3 pending + kein Mesh → Front bei 2.
            setup([r3], []);
            out.waterK_ring3NoMesh = r._builtWaterRingRadius();
            // 6) Spieler-Chunk pending + kein Mesh → -1 (Kokon).
            setup([self], []);
            out.waterK_selfNoMesh = r._builtWaterRingRadius();
        }

        // 7) revealK = min(terrain, gras, wasser) — die all-null-Reduktion bewahren.
        const reduce3 = (a, b, c) =>
            [a, b, c].reduce((acc, v) => (v === null ? acc : acc === null ? v : Math.min(acc, v)), null);
        out.reduce_allNull = reduce3(null, null, null);
        out.reduce_min = reduce3(4, 3, 2);
        out.reduce_someNull = reduce3(4, null, 2);

        // restore
        st.pendingWaterIso = savedPend;
        st.voxelChunkWaterIso = savedWi;
        if (st.renderer) st.renderer._isHeadlessNull = wasNull;
        // 8) Headless-Pfad: gibt die Terrain-Front zurück (gate-treu).
        out.waterK_headless = r._builtWaterRingRadius();
        return out;
    });

    console.log("\n===== NEBEL WARTET AUF WASSER — LOGIK-MESSUNG =====\n");
    if (pageErr) console.log("PAGE-ERROR:", pageErr);
    const o = report;
    console.log(`  Spieler-Chunk: ${JSON.stringify(o.pc)}`);
    console.log(`  Terrain-Front builtK: ${o.builtK}`);
    console.log(`  kein Pending:                 ${o.waterK_noPending}   (erwartet == builtK ${o.builtK})`);
    console.log(`  ring1 pending, KEIN Mesh:     ${o.waterK_ring1NoMesh}   (erwartet 0 — Streaming-Front wartet)`);
    console.log(
        `  ring1 pending, Mesh DA (CA):  ${o.waterK_ring1HasMesh}   (erwartet ${o.builtK} — MONOTON, kein Flackern)`
    );
    console.log(`  ring3 pending, kein Mesh:     ${o.waterK_ring3NoMesh}   (erwartet 2)`);
    console.log(`  Spieler-Chunk pending:        ${o.waterK_selfNoMesh}   (erwartet -1 — Kokon)`);
    console.log(`  Headless (gate-treu):         ${o.waterK_headless}   (erwartet == builtK ${o.builtK})`);
    console.log(
        `  reduce(null,null,null)=${o.reduce_allNull} (erw null) · reduce(4,3,2)=${o.reduce_min} (erw 2) · reduce(4,null,2)=${o.reduce_someNull} (erw 2)`
    );

    const ok =
        o.builtK != null &&
        o.waterK_noPending === o.builtK &&
        o.waterK_ring1NoMesh === 0 &&
        o.waterK_ring1HasMesh === o.builtK &&
        o.waterK_ring3NoMesh === 2 &&
        o.waterK_selfNoMesh === -1 &&
        o.waterK_headless === o.builtK &&
        o.reduce_allNull === null &&
        o.reduce_min === 2 &&
        o.reduce_someNull === 2;
    console.log(
        `\n  ${ok ? "✅ Front wartet auf NIE-gebautes Wasser (Streaming-Front), retracted NICHT bei CA-Re-Enqueue (Mesh da) → kein Flackern." : "⚠️ Die Gating-Logik weicht ab — prüfen."}\n`
    );
    await browser.close();
    server.close();
    process.exit(ok ? 0 : 1);
})();
