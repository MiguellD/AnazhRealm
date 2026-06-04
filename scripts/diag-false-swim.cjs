// Diagnose Welle B — die Falsch-Schwimm-Heilung. Beweist, dass `_waterCellAt`
// die 3D-Wasser-Wahrheit liest, wo die 2.5D-Spalte (`_hydroWaterLevelAt`) sie
// neu rät: eine synthetische Lufthöhle UNTER einem Wasser-Cell (gleiche x,z-
// Spalte) → die Spalte sagt „Wasser", die Zelle sagt „Luft" → kein Auftrieb.
const puppeteer = require("puppeteer");
const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = 4320;
const root = path.resolve(__dirname, "..");
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
    const filePath = path.join(root, p);
    if (!filePath.startsWith(root)) {
        res.statusCode = 403;
        return res.end();
    }
    fs.readFile(filePath, (err, data) => {
        if (err) {
            res.statusCode = 404;
            return res.end();
        }
        res.setHeader("Content-Type", mime[path.extname(filePath)] || "application/octet-stream");
        res.end(data);
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
    await page.setViewport({ width: 1280, height: 720 });
    page.on("pageerror", (err) => console.log("[PAGE-ERROR]", (err.stack || err.message).split("\n")[0]));
    await page.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: "domcontentloaded", timeout: 30000 });
    await page.evaluate(async () => {
        const start = performance.now();
        while (performance.now() - start < 25000) {
            const r = window.anazhRealm;
            if (r && typeof r._gameLoopTick === "function") {
                try {
                    r._gameLoopTick(performance.now());
                } catch (_e) {
                    /* listener */
                }
                if (r.state && r.state.playerMesh && r.state.voxelChunks && r.state.voxelChunks.size > 10) break;
            }
            await new Promise((resolve) => setTimeout(resolve, 16));
        }
    });
    const report = await page.evaluate(() => {
        const r = window.anazhRealm;
        const out = { hasHelper: typeof r._waterCellAt === "function", buoyancyReadsCell: false };
        // Source-Probe: liest die Auftrieb-Logik die 3D-Zelle?
        out.buoyancyReadsCell = /_playerWaterContext\(/.test(r._loopPhysicsSync ? r._loopPhysicsSync.toString() : "");
        // Fallback-Probe: außerhalb jeder Welt → null (2.5D-Fallback greift).
        out.farAwayNull = r._waterCellAt(999999, 0, 999999) === null;

        const STATE = r.constructor.CELL_STATE;
        const cfg = r._voxelChunkConfig(0);
        const { dim, step, span, floorDrop } = cfg;
        const oy = (r.state.terrainBaseHeight || 0) - floorDrop;

        // Einen WATER-Cell in irgendeinem gestreamten Chunk finden.
        let found = null;
        for (const [key, entry] of r.state.voxelChunks) {
            if (!entry || !entry.waterCells) continue;
            const wc = entry.waterCells;
            for (let idx = 0; idx < wc.length; idx++) {
                if (wc[idx] !== STATE.WATER) continue;
                const j = Math.floor(idx / (dim * dim));
                const rem = idx - j * dim * dim;
                const k = Math.floor(rem / dim);
                const i = rem - k * dim;
                if (j < 3) continue; // Platz für die Höhle darunter
                const comma = key.indexOf(",");
                const cx = parseInt(key.slice(0, comma), 10);
                const cz = parseInt(key.slice(comma + 1), 10);
                found = { key, entry, cx, cz, i, k, j, idx };
                break;
            }
            if (found) break;
        }
        out.foundWaterCell = !!found;
        if (found) {
            const { entry, cx, cz, i, k, j } = found;
            const wx = cx * span + (i + 0.5) * step;
            const wz = cz * span + (k + 0.5) * step;
            const wyWater = oy + (j + 0.5) * step;
            // (1) der Helper liest die ECHTE Wasserzelle als WATER.
            out.waterCellReadsWater = r._waterCellAt(wx, wyWater, wz) === STATE.WATER;

            // (2) SYNTHETISCH: eine Lufthöhle 3 Zellen UNTER der Wasserzelle, in
            // DERSELBEN x,z-Spalte. Die 2.5D-Spalte würde dort „Wasser" sagen,
            // die 3D-Zelle ist Luft → der Helper MUSS not-WATER zurückgeben.
            const jCave = j - 3;
            const caveIdx = i + k * dim + jCave * dim * dim;
            const prev = entry.waterCells[caveIdx];
            entry.waterCells[caveIdx] = STATE.AIR;
            const wyCave = oy + (jCave + 0.5) * step;
            const cellAtCave = r._waterCellAt(wx, wyCave, wz);
            out.caveCellIsAir = cellAtCave === STATE.AIR;
            out.caveCellNotWater = cellAtCave !== STATE.WATER;
            // Die 2.5D-Spalte zum Vergleich (kann „Wasser" über der Höhle sagen).
            const col = r._hydroWaterLevelAt(wx, wz);
            out.columnSaysWaterAboveCave = typeof col === "number" && col > wyCave;
            entry.waterCells[caveIdx] = prev; // wiederherstellen
        }
        return out;
    });

    console.log("\n========= WELLE B — FALSCH-SCHWIMM-DIAGNOSE =========\n");
    const line = (label, ok) => console.log(`  [${ok ? "OK" : "XX"}] ${label}`);
    line("_waterCellAt existiert", report.hasHelper);
    line("Auftrieb-Logik liest _playerWaterContext (Source-Probe)", report.buoyancyReadsCell);
    line("fern (keine Welt) → null (2.5D-Fallback)", report.farAwayNull);
    line("ein WATER-Cell gefunden", report.foundWaterCell);
    line("Helper liest echte Wasserzelle als WATER", report.waterCellReadsWater);
    line("synthetische Lufthöhle unter Wasser → Zelle ist AIR", report.caveCellIsAir);
    line("→ Helper gibt NOT-WATER (kein Auftrieb)", report.caveCellNotWater);
    line("…obwohl die 2.5D-Spalte dort 'Wasser' sagt (der Bug)", report.columnSaysWaterAboveCave);
    const allOk =
        report.hasHelper &&
        report.buoyancyReadsCell &&
        report.farAwayNull &&
        report.foundWaterCell &&
        report.waterCellReadsWater &&
        report.caveCellIsAir &&
        report.caveCellNotWater;
    console.log(
        "\n  VERDIKT:",
        allOk ? "GRÜN — die 3D-Zelle diskriminiert, wo die 2.5D-Spalte falsch riet." : "ROT — siehe oben."
    );
    console.log("\n====================================================\n");
    await browser.close();
    server.close();
})();
