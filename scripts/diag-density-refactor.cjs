// diag-density-refactor.cjs — DER ALT-vs-NEU-BEWEIS für den Spalten-Hoist (V18.321).
// `_terrainBaseDensityAt` wurde in `_terrainColumnContext` (2D, einmal/Spalte) + `_terrainBaseDensityAtCol`
// (per-Voxel) gesplittet. Diese Linse paart den NEUEN Pfad gegen eine WORTGETREUE Kopie des ALTEN
// monolithischen Codes (inline hier) über ein dichtes (x,y,z)-Raster — maxDiff 0 beweist, dass der
// Refactor JEDES Bit bewahrt (die 2D-Werte sind ordnungs-unabhängig, die d-Akkumulation gleich).
// Lauf: node scripts/diag-density-refactor.cjs
const puppeteer = require("puppeteer");
const http = require("http");
const fs = require("fs");
const path = require("path");
const PORT = Number(process.env.DIAG_PORT) || 4375;
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
        protocolTimeout: 120000,
        args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--no-sandbox", "--disable-setuid-sandbox"],
    });
    const page = await browser.newPage();
    await page.evaluateOnNewDocument(() => {
        window.__anazhHeadlessNullRenderer = true;
    });
    await page.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: "domcontentloaded", timeout: 30000 });
    await page.evaluate(async () => {
        const dl = performance.now() + 60000;
        while (
            (!window.anazhRealm ||
                !window.anazhRealm.state ||
                typeof window.anazhRealm._gameLoopTick !== "function" ||
                !window.anazhRealm.state.blueprints) &&
            performance.now() < dl
        )
            await new Promise((r) => setTimeout(r, 100));
    });
    const out = await page.evaluate(() => {
        const r = window.anazhRealm;
        // sicherstellen, dass der Noise existiert (über einen Aufruf der neuen API).
        r._terrainBaseDensityAt(0, 0, 0);
        const n = r._voxelNoise;
        // WORTGETREUE Kopie des ALTEN monolithischen _terrainBaseDensityAt (vor V18.321).
        const oldBase = (x, y, z) => {
            const base = r.state.terrainBaseHeight || 0;
            const surf = r._terrainMacroSurfaceY(x, z);
            let d = surf - y;
            const eroR = n.noise2D(x * 0.0005, z * 0.0005) * 0.5 + 0.5;
            let mtnR = 1 - eroR;
            if (mtnR < 0) mtnR = 0;
            mtnR *= mtnR;
            const roughScale = 0.16 + 0.84 * mtnR;
            d += n.noise3D(x * 0.05, y * 0.05, z * 0.05) * 7 * roughScale;
            d += n.noise3D(x * 0.018, y * 0.022, z * 0.018) * 5 * roughScale;
            const caveFloor = Math.max(0, Math.min(1, (y - (base - 28)) / 8));
            const canyonOpen = Math.max(
                0,
                Math.min(1, (n.noise2D(x * 0.0065 + 41.7, z * 0.0065 - 18.3) - 0.52) / 0.18)
            );
            const waterLevelD = typeof r.state.waterLevel === "number" ? r.state.waterLevel : base + 4;
            const ceilOffset = surf < waterLevelD + 1 ? -24 : -16 + canyonOpen * 24;
            const caveCeil = Math.max(0, Math.min(1, (surf + ceilOffset - y) / 8));
            const caveEnv = caveFloor * caveCeil;
            if (caveEnv > 0) {
                const ridge = 1 - Math.abs(n.noise3D(x * 0.03, y * 0.034, z * 0.03));
                const cave = Math.max(0, (ridge - 0.7) / 0.3);
                d -= cave * caveEnv * 36;
                const cavern = n.noise3D(x * 0.013, y * 0.018, z * 0.013);
                const cavernCarve = Math.max(0, (cavern - 0.55) / 0.45);
                d -= cavernCarve * caveEnv * 46;
                const hall = n.noise3D(x * 0.0045 + 71.3, y * 0.006 - 12.7, z * 0.0045 + 5.1);
                const hallCarve = Math.max(0, (hall - 0.5) / 0.5);
                d -= hallCarve * caveEnv * 72;
            }
            const hydro = r.state.hydrosphere;
            if (hydro && hydro.ready && !r._hydroComputing) {
                d -= r._hydrosphereCarveAt(x, z);
                const lk = r._hydrosphereLakeAt(x, z);
                if (lk) {
                    const flatD = lk.bedY - y;
                    d = d * (1 - lk.w) + flatD * lk.w;
                }
            }
            return d;
        };
        // dichtes Raster über mehrere Regionen + Tiefen.
        let maxd = 0,
            n0 = 0,
            worst = null;
        for (let gx = -300; gx <= 300; gx += 7) {
            for (let gz = -300; gz <= 300; gz += 11) {
                for (let gy = -60; gy <= 80; gy += 5) {
                    const a = oldBase(gx + 0.5, gy, gz + 0.5);
                    const b = r._terrainBaseDensityAt(gx + 0.5, gy, gz + 0.5);
                    const dd = Math.abs(a - b);
                    if (dd > maxd) {
                        maxd = dd;
                        worst = [gx, gy, gz, a, b];
                    }
                    n0++;
                }
            }
        }
        return { maxd, n0, worst };
    });
    await browser.close();
    server.close();
    console.log("===== DENSITY-REFACTOR — ALT (monolithisch) vs NEU (Kontext+per-Voxel) =====\n");
    console.log(`  Punkte geprüft: ${out.n0}`);
    console.log(
        `  maxDiff: ${out.maxd}` +
            (out.worst
                ? `   (worst @ ${out.worst.slice(0, 3).join(",")}: alt ${out.worst[3]} vs neu ${out.worst[4]})`
                : "")
    );
    const ok = out.maxd === 0;
    console.log(
        "\n" + (ok ? "✅ BYTE-IDENTISCH — der Hoist-Refactor bewahrt jedes Bit." : "❌ DIFF — der Refactor weicht ab.")
    );
    process.exit(ok ? 0 : 1);
})().catch((e) => {
    console.error("Crash:", e);
    process.exit(1);
});
