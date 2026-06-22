const puppeteer = require("puppeteer"),
    http = require("http"),
    fs = require("fs"),
    path = require("path");
const PORT = 4374,
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
        const N = 60000;
        // verschiedene x/z, y variiert
        let s = 0;
        const t0 = performance.now();
        for (let i = 0; i < N; i++) {
            s += r._terrainDensityAt((i % 200) + 0.5, (i % 80) - 20, ((i * 7) % 200) + 0.5);
        }
        const tFull = performance.now() - t0;
        const t1 = performance.now();
        for (let i = 0; i < N; i++) {
            s += r._terrainMacroSurfaceY((i % 200) + 0.5, ((i * 7) % 200) + 0.5);
        }
        const tMacro = performance.now() - t1;
        // hydrosphere 2D parts (if present)
        let tHydro = 0;
        if (r._hydrosphereCarveAt) {
            const t2 = performance.now();
            for (let i = 0; i < N; i++) {
                s += r._hydrosphereCarveAt((i % 200) + 0.5, ((i * 7) % 200) + 0.5);
            }
            tHydro = performance.now() - t2;
        }
        return {
            N,
            tFull: +tFull.toFixed(1),
            tMacro: +tMacro.toFixed(1),
            tHydro: +tHydro.toFixed(1),
            s: +s.toFixed(1),
        };
    });
    await browser.close();
    server.close();
    console.log("=== terrainDensityAt Kosten-Aufschlüsselung (", out.N, "Calls) ===");
    console.log("  _terrainDensityAt (voll, 3D):   ", out.tFull, "ms");
    console.log(
        "  _terrainMacroSurfaceY (2D):     ",
        out.tMacro,
        "ms  =",
        ((100 * out.tMacro) / out.tFull).toFixed(0),
        "% des vollen"
    );
    console.log(
        "  _hydrosphereCarveAt (2D):       ",
        out.tHydro,
        "ms  =",
        ((100 * out.tHydro) / out.tFull).toFixed(0),
        "%"
    );
    console.log("  → die 2D-Spalten-Arbeit (macroSurf+hydro+eroR+canyon) ist der hoistbare Anteil");
    process.exit(0);
})().catch((e) => {
    console.error(e);
    process.exit(1);
});
