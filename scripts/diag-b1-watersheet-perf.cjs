// Diagnose B1 (V18.345) — TRIGGERT der OFF-THREAD-Wasser-Sheet im ECHTEN Game-Loop?
//
// Der stream-perf-Diag misst irreführend (manueller Pump + ~1 Hz-rAF → der CA seedet
// `waterLevelCells` VOR den langsamen Builds → Sync). Im ECHTEN Loop läuft
// `_tickPendingWaterIso` (Wasser-Sheet) VOR `_tickWorldWaterCA` (CA) jeden Frame →
// ein Chunk, der im SELBEN Frame gebaut wird wie er einstreamt, ist CA-frei → Worker.
//
// Dieser Diag fährt den ECHTEN Loop (`_gameLoopTick`, Null-Renderer → schnell) während
// der Spieler durch eine Wasser-Region LÄUFT, und zählt Worker-Pfad vs Sync-Pfad +
// die Main-Thread-Zeit im Sync-Sheet-Bau. Hoher Worker-Anteil = B1 trägt (FPS-frei).
const puppeteer = require("puppeteer");
const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = 4393;
const root = path.resolve(__dirname, "..");
const mime = {
    ".html": "text/html",
    ".js": "application/javascript",
    ".json": "application/json",
    ".css": "text/css",
    ".png": "image/png",
    ".wasm": "application/wasm",
    ".woff2": "font/woff2",
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
        protocolTimeout: 600000,
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
    page.on("pageerror", (err) => {
        pageErr = (err.stack || err.message).split("\n")[0];
        console.log("[PAGE-ERROR]", pageErr);
    });
    await page.evaluateOnNewDocument(() => {
        window.__anazhHeadlessNullRenderer = true;
    });
    await page.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: "domcontentloaded", timeout: 30000 });

    await page.evaluate(async () => {
        try {
            localStorage.clear();
        } catch (_e) {
            /* */
        }
        const start = performance.now();
        while (performance.now() - start < 60000) {
            const r = window.anazhRealm;
            if (r && typeof r._gameLoopTick === "function") {
                try {
                    r._gameLoopTick(performance.now());
                } catch (_e) {
                    /* */
                }
                if (r.state && r.state.voxelChunks && r.state.voxelChunks.size > 8 && r.state.voxelWorkerReady) break;
            }
            await new Promise((res) => setTimeout(res, 16));
        }
    });

    const report = await page.evaluate(async () => {
        const r = window.anazhRealm;
        const s = r.state;
        const out = { msgs: [] };
        if (!s || !s.playerMesh) return { err: "kein Spieler" };
        // Wasser finden.
        const px0 = s.playerMesh.position.x,
            pz0 = s.playerMesh.position.z;
        let spot = null;
        for (let radius = 0; radius <= 1600 && !spot; radius += 30) {
            for (let a = 0; a < 360 && !spot; a += 15) {
                const rad = (a * Math.PI) / 180;
                const x = px0 + Math.cos(rad) * radius;
                const z = pz0 + Math.sin(rad) * radius;
                const L = r._atlasWaterLevelAt(x, z, -Infinity);
                if (!(L > -Infinity)) continue;
                const t = r.getTerrainHeightAt(x, z);
                if (Number.isFinite(t) && t < L - 1.5) spot = { x, z, L };
            }
        }
        if (!spot) return { err: "kein Wasser gefunden" };

        // Instrumentierung (KEINE Produktions-Änderung): Worker-Pfad zählen + Sync-Zeit messen.
        let workerCalls = 0;
        let syncCalls = 0;
        let syncMs = 0;
        const origWorker = r._workerBuildWaterSheet.bind(r);
        r._workerBuildWaterSheet = (cx, cz) => {
            workerCalls++;
            return origWorker(cx, cz);
        };
        const origSync = r._buildVoxelChunkWaterIsoSurface.bind(r);
        r._buildVoxelChunkWaterIsoSurface = (cx, cz) => {
            const t = performance.now();
            const res = origSync(cx, cz);
            syncMs += performance.now() - t;
            syncCalls++;
            return res;
        };

        // Den Spieler an den Wasser-RAND setzen + DURCH die Region LAUFEN (frischer Stream
        // → Wasser-Chunks streamen ein → der ECHTE Loop baut ihre Sheets). `_gameLoopTick`
        // läuft die ECHTE Reihenfolge (Wasser-Iso-Tick VOR CA-Tick).
        let pmx = spot.x - 220;
        let pmz = spot.z - 220;
        for (let i = 0; i < 240; i++) {
            pmx += 1.8;
            pmz += 1.8;
            s.playerMesh.position.set(pmx, spot.L + 3, pmz);
            try {
                r._gameLoopTick(performance.now());
            } catch (_e) {
                /* */
            }
            if (i % 5 === 0) await new Promise((res) => setTimeout(res, 8));
        }

        r._workerBuildWaterSheet = origWorker;
        r._buildVoxelChunkWaterIsoSurface = origSync;
        out.workerCalls = workerCalls;
        out.syncCalls = syncCalls;
        out.syncMs = +syncMs.toFixed(1);
        out.spot = { x: +spot.x.toFixed(0), z: +spot.z.toFixed(0), L: +spot.L.toFixed(1) };
        out.chunks = s.voxelChunks.size;
        return out;
    });

    console.log("\n========= B1 — Worker-Pfad-Anteil im ECHTEN Game-Loop =========\n");
    if (pageErr) console.log("PAGE-ERROR:", pageErr);
    if (report.err) {
        console.log("  FEHLER:", report.err);
    } else {
        const total = report.workerCalls + report.syncCalls;
        const pct = total > 0 ? Math.round((report.workerCalls / total) * 100) : 0;
        console.log(`  Wasser-Spot: ${JSON.stringify(report.spot)}  Chunks: ${report.chunks}`);
        console.log(`  Worker-Pfad (off-thread): ${report.workerCalls}`);
        console.log(`  Sync-Pfad (main-thread):  ${report.syncCalls}  (${report.syncMs} ms Main-Thread-Geometrie)`);
        console.log(`  → Worker-Anteil: ${pct}%  (${report.workerCalls}/${total})`);
        console.log(
            `\n  ${pct >= 50 ? "✅" : "⚠️"} ${pct >= 50 ? "B1 trägt: das Wasser baut überwiegend off-thread (FPS-frei)" : "B1 begrenzt: der CA seedet vor den Builds — siehe handover (CA-Interaktion)"}`
        );
    }
    console.log("");
    await browser.close();
    server.close();
})();
