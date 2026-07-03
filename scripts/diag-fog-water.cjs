// Diagnose — DER NEBEL WARTET AUF DAS WASSER (V18.346 → V18.380 DIE WAHRHEITS-FRONT).
//
// Die Mechanik (hardware-unabhängig, reine Logik): `_builtWaterRingRadius()` deckelt den Lade-
// Nebel-Reveal auf den grössten Ring, in dem JEDER Chunk terrain-gebaut UND wasser-FERTIG ist.
// V18.380: „fertig" = KEINE Wasser-Zellen ODER das Sheet ist RESOLVED (`voxelChunkWaterIso.has`
// — Mesh ODER bewusst-leer[null]). Die transiente Arbeits-Queue (`pendingWaterIso`) ist
// IRRELEVANT (die alte pending-Front log in beide Richtungen: das B1-Async-Fenster zählte
// fertig [Nebel überm leeren See], resolved-NULL + Re-Enqueue zählte unfertig [Front-Kollaps
// auf 0 → Kappe griff nie → der Nebel folgte dem Terrain]).
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

        // V18.380 — die WAHRHEITS-Front: relevant sind (entry.waterCells, wi.has(key)); die
        // pendingWaterIso-Queue ist irrelevant. Szenarien über die wi-Map + einen echten
        // WASSER-Chunk der warmen Welt (der Front-Scan liest entry.waterCells real).
        const fakeMesh = { isMesh: true };
        const cfg = r._voxelChunkConfig();
        // alle Wasser-Chunks im Front-Ring + der nächste (fürs Unresolved-Szenario)
        const watery = [];
        if (pc) {
            for (const [key, e] of st.voxelChunks) {
                if (!e || !e.waterCells) continue;
                const ci = key.indexOf(",");
                const kx = parseInt(key.slice(0, ci), 10),
                    kz = parseInt(key.slice(ci + 1), 10);
                const ring = Math.max(Math.abs(kx - pc.cx), Math.abs(kz - pc.cz));
                if (ring <= cfg.ringRadius) watery.push({ key, ring });
            }
            watery.sort((a, b) => a.ring - b.ring);
        }
        out.wateryCount = watery.length;
        const allResolved = () => new Map(watery.map((w) => [w.key, fakeMesh]));

        // 2) ALLE Wasser-Chunks resolved (Mesh) → Front == Terrain-Front; Queue-Inhalt EGAL
        //    (der ganze Ring in pending = CA-Re-Enqueue-Sturm → MONOTON, kein Kollaps).
        st.voxelChunkWaterIso = allResolved();
        st.pendingWaterIso = new Set(watery.map((w) => w.key));
        out.waterK_allResolved_queueFull = r._builtWaterRingRadius();

        // 3) resolved-LEER (null) zählt FERTIG (der V18.380-Kern — die alte Front las
        //    `wi.get` [null=falsy] und kollabierte auf solchen Chunks).
        const wiNull = allResolved();
        for (const w of watery) wiNull.set(w.key, null);
        st.voxelChunkWaterIso = wiNull;
        out.waterK_allResolvedNull = r._builtWaterRingRadius();

        const target = watery.find((w) => w.ring > 0) || null;
        out.targetRing = target ? target.ring : null;
        if (target) {
            // 4) EIN Wasser-Chunk (Ring d>0) UNRESOLVED (kein wi-Eintrag) — egal ob in der Queue
            //    (in-flight!) oder nicht → die Front wartet bei d−1 (das B1-Async-Fenster gedeckt).
            const wi4 = allResolved();
            wi4.delete(target.key);
            st.voxelChunkWaterIso = wi4;
            st.pendingWaterIso = new Set(); // NICHT pending = das in-flight-Fenster
            out.waterK_unresolvedInFlight = r._builtWaterRingRadius();
            st.pendingWaterIso = new Set([target.key]); // pending (normal enqueued)
            out.waterK_unresolvedPending = r._builtWaterRingRadius();
        }
        const selfWatery = watery.find((w) => w.ring === 0) || null;
        if (selfWatery) {
            // 5) der SPIELER-Chunk unresolved → −1 (Kokon).
            const wi5 = allResolved();
            wi5.delete(selfWatery.key);
            st.voxelChunkWaterIso = wi5;
            out.waterK_selfUnresolved = r._builtWaterRingRadius();
        }
        out.selfWatery = !!selfWatery;

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
    console.log(`  Spieler-Chunk: ${JSON.stringify(o.pc)} · Wasser-Chunks im Ring: ${o.wateryCount}`);
    console.log(`  Terrain-Front builtK: ${o.builtK}`);
    console.log(
        `  alle resolved + Queue VOLL:   ${o.waterK_allResolved_queueFull}   (erwartet == builtK ${o.builtK} — Queue irrelevant, MONOTON)`
    );
    console.log(
        `  alle resolved-LEER (null):    ${o.waterK_allResolvedNull}   (erwartet == builtK ${o.builtK} — null IST resolved, kein Kollaps)`
    );
    if (o.targetRing != null) {
        console.log(
            `  Ring-${o.targetRing}-Chunk UNRESOLVED, in-flight (nicht pending): ${o.waterK_unresolvedInFlight}   (erwartet ${o.targetRing - 1} — das B1-Async-Fenster gedeckt)`
        );
        console.log(
            `  Ring-${o.targetRing}-Chunk UNRESOLVED, pending:                  ${o.waterK_unresolvedPending}   (erwartet ${o.targetRing - 1})`
        );
    }
    if (o.selfWatery) console.log(`  Spieler-Chunk unresolved:     ${o.waterK_selfUnresolved}   (erwartet -1 — Kokon)`);
    console.log(`  Headless (gate-treu):         ${o.waterK_headless}   (erwartet == builtK ${o.builtK})`);
    console.log(
        `  reduce(null,null,null)=${o.reduce_allNull} (erw null) · reduce(4,3,2)=${o.reduce_min} (erw 2) · reduce(4,null,2)=${o.reduce_someNull} (erw 2)`
    );

    const ok =
        o.builtK != null &&
        o.wateryCount > 0 &&
        o.waterK_allResolved_queueFull === o.builtK &&
        o.waterK_allResolvedNull === o.builtK &&
        (o.targetRing == null ||
            (o.waterK_unresolvedInFlight === o.targetRing - 1 && o.waterK_unresolvedPending === o.targetRing - 1)) &&
        (!o.selfWatery || o.waterK_selfUnresolved === -1) &&
        o.waterK_headless === o.builtK &&
        o.reduce_allNull === null &&
        o.reduce_min === 2 &&
        o.reduce_someNull === 2;
    console.log(
        `\n  ${ok ? "✅ Die WAHRHEITS-Front: wartet auf unresolved Wasser (auch in-flight), zählt resolved-LEER als fertig, ignoriert die Queue → monoton, kein Kollaps, kein Async-Leck." : "⚠️ Die Gating-Logik weicht ab — prüfen."}\n`
    );
    await browser.close();
    server.close();
    process.exit(ok ? 0 : 1);
})();
