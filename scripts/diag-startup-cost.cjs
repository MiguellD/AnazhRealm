// Startup-Bau-Kosten: wrappt die schweren Geometrie-Bau-Funktionen, sobald der
// Realm entsteht, und misst die SYNCHRONE Main-Thread-Zeit jeder bis die Welt
// startklar ist (_gameLoopTick existiert). Zeigt, was beim Boot die CPU/das UI
// blockiert (Skin/Avatar · Struktur-Merge · Part-Geo · Blueprint · Scatter).
const puppeteer = require("puppeteer"),
    http = require("http"),
    fs = require("fs"),
    path = require("path");
const PORT = Number(process.env.DIAG_PORT) || 4366,
    root = path.resolve(__dirname, "..");
const mime = { ".html": "text/html", ".js": "application/javascript", ".wasm": "application/wasm", ".json": "application/json", ".woff2": "font/woff2", ".css": "text/css", ".png": "image/png" };
const server = http.createServer((req, res) => {
    let p = req.url.split("?")[0];
    if (p === "/") p = "/index.html";
    const fp = path.join(root, p);
    if (!fp.startsWith(root)) { res.statusCode = 403; return res.end(); }
    fs.readFile(fp, (e, d) => {
        if (e) { res.statusCode = 404; return res.end(); }
        res.setHeader("Content-Type", mime[path.extname(fp)] || "application/octet-stream");
        res.end(d);
    });
});
(async () => {
    await new Promise((r) => server.listen(PORT, r));
    const browser = await puppeteer.launch({
        headless: true, protocolTimeout: 360000,
        args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--enable-webgl", "--ignore-gpu-blocklist", "--no-sandbox", "--disable-setuid-sandbox", "--autoplay-policy=no-user-gesture-required"],
    });
    const page = await browser.newPage();
    page.setDefaultTimeout(340000);
    page.on("pageerror", (e) => console.log("[PAGE-ERROR]", (e.stack || e.message).split("\n")[0]));
    // VOR dem Laden: einen Setter auf window.anazhRealm, der die Prototype-Methoden
    // wrappt, sobald der Realm zugewiesen wird (so früh wie möglich → fängt die
    // Boot-Builds). t0 = Navigationsstart.
    await page.evaluateOnNewDocument(() => {
        window.__t0 = performance.now();
        let _realm;
        const NAMES = [
            "_buildCreatureSkinGeometryUncached",
            "_buildCreatureSkinGeometry",
            "_buildHumanoidRig",
            "_buildArchMeshMerged",
            "_buildFromBlueprint",
            "_makePartGeometry",
            "_scatterRegion",
            "_buildVoxelChunkScatter",
            "_defaultBlueprints",
            "applyPlayerSoulFromBlueprint",
        ];
        Object.defineProperty(window, "anazhRealm", {
            configurable: true,
            get() { return _realm; },
            set(v) {
                _realm = v;
                if (v && v.constructor && !window.__wrapped) {
                    window.__wrapped = true;
                    window.__acc = {};
                    const proto = v.constructor.prototype;
                    for (const name of NAMES) {
                        const orig = proto[name];
                        if (typeof orig !== "function") continue;
                        window.__acc[name] = { n: 0, ms: 0, max: 0 };
                        proto[name] = function (...args) {
                            const t = performance.now();
                            const r = orig.apply(this, args);
                            const dt = performance.now() - t;
                            const a = window.__acc[name];
                            a.n++; a.ms += dt; if (dt > a.max) a.max = dt;
                            return r;
                        };
                    }
                }
            },
        });
    });
    await page.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: "domcontentloaded", timeout: 30000 });

    // bis _gameLoopTick existiert (= „Welt startklar / UI lebt") — ZEIT messen
    const bootMs = await page.evaluate(async () => {
        const start = window.__t0 || performance.now();
        while (performance.now() - start < 60000) {
            const r = window.anazhRealm;
            if (r && typeof r._gameLoopTick === "function") return Math.round(performance.now() - start);
            await new Promise((res) => setTimeout(res, 2));
        }
        return -1;
    });
    // Snapshot der Bau-Kosten zum Zeitpunkt „startklar"
    const accAtReady = await page.evaluate(() => JSON.parse(JSON.stringify(window.__acc || {})));
    // dann settlen lassen + nochmal (was baut NACH startklar, beim ersten Streaming)
    await page.evaluate(async () => {
        const r = window.anazhRealm;
        for (let i = 0; i < 200; i++) { try { r._gameLoopTick(performance.now()); } catch (_e) {} await new Promise((res) => setTimeout(res, 2)); }
    });
    const accAfter = await page.evaluate(() => JSON.parse(JSON.stringify(window.__acc || {})));

    const fmt = (acc) => Object.entries(acc)
        .filter(([, a]) => a.n > 0)
        .sort((a, b) => b[1].ms - a[1].ms)
        .map(([k, a]) => `    ${k.padEnd(34)} n=${String(a.n).padStart(4)} · total ${a.ms.toFixed(0).padStart(6)} ms · max ${a.max.toFixed(0).padStart(5)} ms`);

    console.log("===== STARTUP-BAU-KOSTEN (synchron, Main-Thread) =====\n");
    console.log(`  Zeit bis startklar (UI lebt, _gameLoopTick): ${bootMs} ms\n`);
    console.log("  Bau-Kosten BIS startklar (das blockt den Boot/UI):");
    const ready = fmt(accAtReady);
    console.log(ready.length ? ready.join("\n") : "    (keine — Builds laufen erst nach startklar)");
    const sumReady = Object.values(accAtReady).reduce((s, a) => s + a.ms, 0);
    console.log(`    → Summe synchroner Bau bis startklar: ${sumReady.toFixed(0)} ms`);
    console.log("\n  Bau-Kosten gesamt (bis ~settled, inkl. Streaming):");
    console.log(fmt(accAfter).join("\n"));
    console.log("\n  LESART: swiftshader-CPU ist langsamer als ein echter Rechner — die");
    console.log("  RELATIONEN (welcher Posten dominiert) führen, nicht die Absolut-ms.");
    console.log("\n======================================================");
    await browser.close();
    server.close();
    process.exit(0);
})();
