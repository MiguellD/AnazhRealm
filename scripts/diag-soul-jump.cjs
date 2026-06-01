// Diagnose V17.32 — Slope-Jump-Balance: misst die statTags + den
// _canSoulJumpFromSlope-Score für human/phoenix/dragon. Beweist, ob lebendig
// (für ALLE Seelen ~1.0 → nicht diskriminierend) oder dichte (der echte
// Unterschied) die Slope-Jump-Entscheidung trägt. Headless, deterministisch.
const puppeteer = require("puppeteer");
const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = 4319;
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
    page.on("pageerror", (err) => console.log("[PAGE-ERROR]", (err.stack || err.message).split("\n")[0]));
    await page.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: "domcontentloaded", timeout: 30000 });
    await page.evaluate(async () => {
        const deadline = performance.now() + 20000;
        while (performance.now() < deadline) {
            const r = window.anazhRealm;
            if (r && typeof r._gameLoopTick === "function") {
                try {
                    r._gameLoopTick(performance.now());
                } catch (_e) {
                    /* pageerror */
                }
                if (r.state && r.state.playerMesh) break;
            }
            await new Promise((resolve) => setTimeout(resolve, 16));
        }
    });
    const report = await page.evaluate(() => {
        const r = window.anazhRealm;
        const out = { souls: {} };
        r.state.onSteepSlope = true;
        r.setGameMode("pfad");
        for (const soul of ["human", "phoenix", "dragon"]) {
            r.applyPlayerSoul(soul);
            r.recomputePlayerStats && r.recomputePlayerStats();
            const t = (r.state.player && r.state.player.statTags) || {};
            const lebendig = typeof t.lebendig === "number" ? t.lebendig : 0.5;
            const dichte = typeof t.dichte === "number" ? t.dichte : 0.5;
            out.souls[soul] = {
                lebendig: +lebendig.toFixed(3),
                dichte: +dichte.toFixed(3),
                scoreOld: +(0.7 * lebendig - 0.3 * dichte).toFixed(3),
                canJumpOld: 0.7 * lebendig - 0.3 * dichte >= 0.4,
                // Kandidaten-Formeln (dichte-dominant):
                scoreA: +(lebendig - 1.0 * dichte).toFixed(3), // threshold 0.4
                scoreB: +(0.7 * lebendig - 0.6 * dichte).toFixed(3), // threshold 0.4
            };
        }
        r.applyPlayerSoul("human");
        r.recomputePlayerStats && r.recomputePlayerStats();
        r.state.onSteepSlope = false;
        r.setGameMode("frieden");
        return out;
    });
    console.log(JSON.stringify(report, null, 2));
    await browser.close();
    server.close();
})();
