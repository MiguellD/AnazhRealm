// Diagnose Welle H — Aquifer. Beweist: in den gestreamten Wasser-Zellen gibt es
// (nahezu) KEINE WATER-Zelle, die im TIEFEN Höhlen-Band (cy < surf-18) UND über
// dem Wassertisch (cy > waterLevel) liegt — genau die „vom See herab geflutete
// Höhle" (die Blasen). Ozean/Seen (über surf-18 ODER unter Wassertisch) bleiben.
const puppeteer = require("puppeteer"),
    http = require("http"),
    fs = require("fs"),
    path = require("path");
const PORT = 4326,
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
    await page.goto("http://127.0.0.1:" + PORT + "/index.html", { waitUntil: "domcontentloaded", timeout: 30000 });
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
            { dim, step, span, floorDrop } = r._voxelChunkConfig(0);
        const oy = (r.state.terrainBaseHeight || 0) - floorDrop,
            wl = r.state.waterLevel || 0,
            AQ = 18;
        let total = 0,
            caveAboveTable = 0,
            oceanDeep = 0,
            surfaceWater = 0;
        for (const [key, e] of r.state.voxelChunks) {
            if (!e || !e.waterCells) continue;
            const c = key.indexOf(","),
                cx = parseInt(key.slice(0, c)),
                cz = parseInt(key.slice(c + 1));
            const wc = e.waterCells;
            for (let idx = 0; idx < wc.length; idx++) {
                if (wc[idx] !== S.WATER) continue;
                total++;
                const j = Math.floor(idx / (dim * dim)),
                    rem = idx - j * dim * dim,
                    k = Math.floor(rem / dim),
                    i = rem - k * dim;
                const cy = oy + (j + 0.5) * step,
                    surf = r._terrainMacroSurfaceY(cx * span + (i + 0.5) * step, cz * span + (k + 0.5) * step);
                if (cy < surf - AQ && cy > wl)
                    caveAboveTable++; // <- die Aquifer-Verletzung (Blasen)
                else if (cy <= wl && cy < surf - AQ)
                    oceanDeep++; // tiefes Wasser unter Tisch (ok)
                else surfaceWater++; // See/Becken nahe Oberfläche (ok)
            }
        }
        return { total, caveAboveTable, oceanDeep, surfaceWater, wl };
    });
    await browser.close();
    server.close();
    console.log("\n===== WELLE H — AQUIFER-DIAGNOSE =====\n");
    console.log("  Wassertisch (waterLevel):", rep.wl);
    console.log("  WATER-Zellen gesamt:", rep.total);
    console.log("  davon Oberflächen-/Becken-Wasser (ok):", rep.surfaceWater);
    console.log("  davon tiefes Wasser UNTER dem Tisch (Ozean/Aquifer, ok):", rep.oceanDeep);
    const line = (l, ok, extra) =>
        console.log("  [" + (ok ? "OK" : "XX") + "] " + l + (extra ? "  (" + extra + ")" : ""));
    line("KEINE Höhlen-Blasen (tief + über dem Wassertisch)", rep.caveAboveTable === 0, rep.caveAboveTable + " Zellen");
    line("Seen/Ozean intakt (Wasser vorhanden)", rep.total > 100, rep.total + " WATER");
    console.log(
        "\n  VERDIKT:",
        rep.caveAboveTable === 0 && rep.total > 100
            ? "GRÜN — keine vom See herab gefluteten Höhlen mehr; Seen/Ozean bleiben."
            : "ROT — siehe oben."
    );
    console.log("\n======================================\n");
})();
