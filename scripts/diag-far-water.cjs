// H3-Diagnose: trägt die Welt Wasser JENSEITS der ±1024-m-Hydrosphäre-Region?
// Der Bug (CLAUDE.md-Gotcha): der Ozean-Default (state.waterLevel) ist hinter
// dem region-bound Atlas gegated → ferne Chunks tragen KEIN Wasser, obwohl ihr
// Terrain unter dem Meeresspiegel liegt. Misst GATE und KLASSIFIKATOR getrennt
// (V13.0-Disziplin: ein Gate-False versteckt sonst, ob der Klassifikator Wasser
// fände). Erwartung VOR dem Fix: beyond-region shouldOcean>0 aber water=0.
const puppeteer = require("puppeteer");
const http = require("http");
const fs = require("fs");
const path = require("path");
const PORT = 4357;
const root = path.resolve(__dirname, "..");
const mime = {
    ".html": "text/html",
    ".js": "application/javascript",
    ".wasm": "application/wasm",
    ".json": "application/json",
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
        ],
    });
    const page = await browser.newPage();
    page.on("pageerror", (e) => console.log("PAGEERROR:", e.message));
    await page.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: "domcontentloaded", timeout: 30000 });
    await page.evaluate(async () => {
        const t = performance.now();
        while (performance.now() - t < 25000) {
            const r = window.anazhRealm;
            if (r && r.state && r.state.hydrosphere && r.state.hydrosphere.ready) break;
            await new Promise((x) => setTimeout(x, 200));
        }
    });
    const out = await page.evaluate(() => {
        const r = window.anazhRealm,
            s = r.state;
        const cfg = r._voxelChunkConfig(0);
        const span = cfg.span;
        const base = s.terrainBaseHeight || 0;
        const oy = base - cfg.floorDrop;
        const WL = typeof s.waterLevel === "number" ? s.waterLevel : 0;
        const WATER = r.constructor.CELL_STATE.WATER;
        const h = s.hydrosphere;
        const regHalf = (h && h.dim && h.cell ? h.dim * h.cell : 2048) / 2; // ±1024

        // Finde Chunks in drei Zonen über Chunk-INDIZES (selbst-konsistent: der
        // Klassifikations-Punkt = der Chunk-Mittelpunkt, den probe baut).
        const cmax = Math.ceil(3000 / span);
        const zones = { inRegionOcean: [], beyondOcean: [], beyondLand: [] };
        for (
            let cx = -cmax;
            cx <= cmax &&
            (zones.beyondOcean.length < 8 || zones.beyondLand.length < 8 || zones.inRegionOcean.length < 6);
            cx++
        ) {
            for (let cz = -cmax; cz <= cmax; cz++) {
                const mx = cx * span + span / 2;
                const mz = cz * span + span / 2;
                const macro = r._terrainMacroSurfaceY(mx, mz, true);
                const rad = Math.max(Math.abs(mx), Math.abs(mz)); // Chebyshev
                const beyond = rad > regHalf + span; // ganz außerhalb der Region
                const isOcean = macro < WL - 2; // klar unter dem Meeresspiegel
                if (!beyond && rad < regHalf - span && isOcean && zones.inRegionOcean.length < 6)
                    zones.inRegionOcean.push({ cx, cz });
                else if (beyond && isOcean && zones.beyondOcean.length < 8) zones.beyondOcean.push({ cx, cz });
                else if (beyond && macro > WL + 25 && zones.beyondLand.length < 8) zones.beyondLand.push({ cx, cz });
            }
        }

        const probe = (cx, cz) => {
            const ox = cx * span;
            const oz = cz * span;
            const macro = r._terrainMacroSurfaceY(ox + span / 2, oz + span / 2, true);
            const atlas = r._atlasWaterLevelAt(ox + span / 2, oz + span / 2, Infinity);
            const gate = r._voxelChunkHasAnyWater(cx, cz);
            // Klassifikator DIREKT (unabhängig vom Gate, V13.0-Trennung):
            const cells = r._buildVoxelChunkWaterCells(ox, oy, oz, cfg.step, null, 0);
            let w = 0;
            for (let i = 0; i < cells.length; i++) if (cells[i] === WATER) w++;
            return { cx, cz, macro: +macro.toFixed(1), atlasFinite: Number.isFinite(atlas), gate, water: w };
        };

        const summ = (list) => {
            const rows = list.map((p) => probe(p.cx, p.cz));
            return {
                n: rows.length,
                gateTrue: rows.filter((r) => r.gate).length,
                hasWater: rows.filter((r) => r.water > 0).length,
                atlasFinite: rows.filter((r) => r.atlasFinite).length,
                avgWater: rows.length ? Math.round(rows.reduce((a, r) => a + r.water, 0) / rows.length) : 0,
                sample: rows.slice(0, 4),
            };
        };

        return {
            waterLevel: WL,
            regHalf,
            inRegionOcean: summ(zones.inRegionOcean),
            beyondOcean: summ(zones.beyondOcean),
            beyondLand: summ(zones.beyondLand),
        };
    });
    console.log(JSON.stringify(out, null, 2));
    await browser.close();
    server.close();
    // Verdikt
    const bo = out.beyondOcean;
    const verdict =
        bo.n > 0 && bo.hasWater === 0
            ? "BUG BESTÄTIGT: beyond-region Ozean trägt KEIN Wasser"
            : bo.n > 0 && bo.hasWater === bo.n
              ? "GEHEILT: beyond-region Ozean trägt Wasser"
              : "unklar (siehe Zahlen)";
    console.log("\nVERDIKT:", verdict);
    process.exit(0);
})();
