const puppeteer = require("puppeteer"),
    http = require("http"),
    fs = require("fs"),
    path = require("path");
const PORT = 4322,
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
    });
    const rep = await page.evaluate(() => {
        const r = window.anazhRealm,
            S = r.constructor.CELL_STATE,
            cfg = r._voxelChunkConfig(0),
            { dim, step, span, floorDrop } = cfg,
            oy = (r.state.terrainBaseHeight || 0) - floorDrop;
        let found = null,
            counts = { A: 0, W: 0, Sd: 0, chunksWithWater: 0 };
        for (const [key, e] of r.state.voxelChunks) {
            if (!e || !e.waterCells) continue;
            counts.chunksWithWater++;
            const wc = e.waterCells;
            let topW = -1,
                topJ = -1,
                ti = 0,
                tk = 0;
            for (let idx = 0; idx < wc.length; idx++) {
                const v = wc[idx];
                if (v === S.WATER) counts.W++;
                else if (v === S.SOLID) counts.Sd++;
                else counts.A++;
                if (v === S.WATER) {
                    const j = Math.floor(idx / (dim * dim)),
                        rem = idx - j * dim * dim,
                        k = Math.floor(rem / dim),
                        i = rem - k * dim;
                    if (j > topJ) {
                        topJ = j;
                        topW = idx;
                        ti = i;
                        tk = k;
                    }
                }
            }
            if (topJ >= 0 && !found) {
                const c = key.indexOf(","),
                    cx = parseInt(key.slice(0, c)),
                    cz = parseInt(key.slice(c + 1));
                const wx = cx * span + (ti + 0.5) * step,
                    wz = cz * span + (tk + 0.5) * step,
                    wyTop = oy + (topJ + 0.5) * step;
                found = { key, cx, cz, ti, tk, topJ, wx, wz, wyTop };
            }
        }
        const out = { counts };
        if (found) {
            const { wx, wz, wyTop } = found;
            out.found = found;
            const col = r._hydroWaterLevelAt(wx, wz);
            out.columnWaterY = col;
            out.cellTopWaterY = wyTop;
            // Was liest _waterCellAt an verschiedenen Schwimm-Höhen (relativ zum Zell-Spiegel)?
            const probe = (dy) => {
                const c = r._waterCellAt(wx, wyTop + dy, wz);
                return c === S.WATER ? "W" : c === S.SOLID ? "S" : c === S.AIR ? "A" : "null";
            };
            out.cellAtTopPlus = probe(+0.9); // Körper über dem Top-Wasser
            out.cellAtTop = probe(0); // am Top-Wasser
            out.cellAtMinus1 = probe(-1.0); // 1m drunter (Füße eines Schwimmers)
            out.cellAtMinus2 = probe(-2.0);
            out.cellAtMinus3 = probe(-3.0);
            // DER FIX: _playerWaterContext gibt den ECHTEN Cell-Spiegel + submerged.
            const ctx = r._playerWaterContext(wx, wyTop - 1.2, wz); // Schwimmer-Füße 1.2m unter Spiegel
            out.ctxSubmerged = ctx ? ctx.submerged : "null";
            out.ctxSurfaceY = ctx && ctx.surfaceY != null ? ctx.surfaceY : null;
            out.ctxNotSeaLevel =
                ctx && ctx.surfaceY != null && typeof col === "number" && Math.abs(ctx.surfaceY - col) > 3;
            const ctxAir = r._playerWaterContext(wx, oy + step * 1.5, wz); // tief unten, sicher kein Wasser
            out.ctxAirSubmerged = ctxAir ? ctxAir.submerged : "null";
        }
        return out;
    });
    await browser.close();
    server.close();
    console.log("\n===== SWIM-REGRESSION-REPRO =====\n");
    console.log("Zell-Statistik (alle Wasser-Chunks):", JSON.stringify(rep.counts));
    if (rep.found) {
        console.log("Wasser-Chunk:", rep.found.key, "Top-Wasserzelle bei y=", rep.cellTopWaterY.toFixed(1));
        console.log(
            "Spalten-Wasserspiegel (_hydroWaterLevelAt):",
            typeof rep.columnWaterY === "number" ? rep.columnWaterY.toFixed(1) : rep.columnWaterY
        );
        console.log("\n_waterCellAt relativ zum Top-Wasser-Spiegel:");
        console.log("  +0.9m (Körper drüber): ", rep.cellAtTopPlus);
        console.log("   0.0m (am Spiegel):    ", rep.cellAtTop);
        console.log("  -1.0m (Schwimmer-Füße):", rep.cellAtMinus1);
        console.log("  -2.0m:                 ", rep.cellAtMinus2);
        console.log("  -3.0m:                 ", rep.cellAtMinus3);
        console.log("\n--- DER FIX: _playerWaterContext ---");
        console.log("  submerged (Schwimmer):  ", rep.ctxSubmerged, "(erwartet true)");
        console.log(
            "  surfaceY (Cell-Spiegel):",
            typeof rep.ctxSurfaceY === "number" ? rep.ctxSurfaceY.toFixed(1) : rep.ctxSurfaceY,
            "(NICHT der Meeresspiegel)"
        );
        console.log("  != Meeresspiegel:       ", rep.ctxNotSeaLevel);
        console.log("  Lufthöhle submerged:    ", rep.ctxAirSubmerged, "(erwartet false)");
        console.log("\nDEUTUNG: schwimmt ein Spieler mit Füßen ~1-2m unter dem Spiegel,");
        console.log("muss -1.0/-2.0 = 'W' sein, sonst bricht das Schwimmen (der Bug).");
    } else {
        console.log("KEIN Wasser-Chunk mit WATER-Zelle gefunden!");
    }
    console.log("\n=================================\n");
})();
