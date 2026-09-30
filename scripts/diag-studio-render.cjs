// diag-studio-render.cjs — DER STUDIO-VERGLEICH (Schöpfer „lade die Welt selbst … in beiden
// varianten, studio und anazh"): rendert die Schöpfer-Vorlage `worlds/terrain/` (phytogenesis v38,
// r128 WebGL) auf swiftshader + screenshottet den begehbaren Wald. Das Studio ist tragbar by design
// (Zwei-Pass-FoliagePass + Auflösungs-Regler + gebackene Schatten) — hier der Beweis, dass es rendert,
// als Referenz für „wie der Wald im Studio aussieht".
//   node scripts/diag-studio-render.cjs
const puppeteer = require("puppeteer");
const http = require("http");
const fs = require("fs");
const path = require("path");
const PORT = Number(process.env.STUDIO_PORT || 4398);
const root = path.resolve(__dirname, "..");
const ART = path.join(root, "artifacts");
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
    fs.readFile(fp, (err, data) => {
        if (err) {
            res.statusCode = 404;
            return res.end();
        }
        res.setHeader("Content-Type", mime[path.extname(fp)] || "application/octet-stream");
        res.end(data);
    });
});
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
(async () => {
    fs.mkdirSync(ART, { recursive: true });
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
    await page.setViewport({ width: 960, height: 600 });
    page.on("pageerror", (e) => console.log("[PAGE-ERROR]", (e.stack || e.message).split("\n")[0]));
    page.on("console", (m) => {
        const t = m.text();
        if (/error|fail|exception/i.test(t)) console.log("[console]", t.slice(0, 120));
    });
    // ?patch-probe exponiert window.__phytoView (scene/camera/renderer/renderPatch/setForestFoliage).
    await page.goto(`http://127.0.0.1:${PORT}/worlds/terrain/index.html?patch-probe`, {
        waitUntil: "domcontentloaded",
        timeout: 30000,
    });

    // Warten bis die Vorlage initialisiert ist (die __phytoView-Getter liefern scene+renderer).
    const ready = await page.evaluate(async () => {
        const dl = performance.now() + 60000;
        while (performance.now() < dl) {
            const v = window.__phytoView;
            if (v && v.scene && v.renderer && v.camera) return { ok: true };
            await new Promise((r) => setTimeout(r, 100));
        }
        return { ok: false };
    });
    console.log("Studio ready:", JSON.stringify(ready));
    await sleep(2500); // ein paar rAF-Frames für das Showcase-Rendering

    const shoot = async (file, label) => {
        try {
            await page.evaluate(() => {
                const v = window.__phytoView;
                if (v && typeof v.renderPatch === "function") {
                    v.renderPatch();
                    v.renderPatch();
                }
            });
            await sleep(250);
            await page.screenshot({ path: path.join(ART, file), fullPage: false });
            console.log(`  ${label.padEnd(30)} → ${file}`);
        } catch (e) {
            console.log(`  ${label} FEHLGESCHLAGEN: ${(e && e.message ? e.message : e).toString().split("\n")[0]}`);
        }
    };

    // 1) Showcase-Ansicht (Default: ein Repräsentant, z.B. die Eiche).
    await shoot("tragbar-studio-showcase.png", "Studio Showcase (Eiche)");

    // 2) DEN WALD BETRETEN — die begehbare dichte Welt (Zwei-Pass-Laub + Auflösungs-Regler).
    console.log("\n=== WALD BETRETEN (enterForest) ===");
    await page.evaluate(() => {
        const wb = document.getElementById("waldBtn");
        if (wb) wb.click();
    });
    // enterForest nutzt setTimeout + bäckt den Wald + Schatten; großzügig warten + rAF laufen lassen.
    await sleep(6000);
    const forestState = await page.evaluate(() => {
        const v = window.__phytoView;
        return { forestMode: v ? v.forestMode : null };
    });
    console.log("  forestMode:", JSON.stringify(forestState));
    // UI ausblenden für ein sauberes Bild.
    await page.evaluate(() => {
        for (const id of ["ui", "forestHint", "exitForest", "loading"]) {
            const el = document.getElementById(id);
            if (el) el.style.display = "none";
        }
    });
    await sleep(500);
    await shoot("tragbar-studio-wald.png", "Studio WALD (voll, tragbar)");

    // 3) Der Wald OHNE Laub (Terrain + Himmel + Wasser) — der Vergleich zu AnazhRealms „ohne Nah-Laub".
    console.log("\n=== WALD OHNE LAUB (setForestFoliage false) ===");
    await page.evaluate(() => {
        const v = window.__phytoView;
        if (v && typeof v.setForestFoliage === "function") v.setForestFoliage(false);
    });
    await sleep(500);
    await shoot("tragbar-studio-wald-ohne-laub.png", "Studio WALD ohne Laub");

    try {
        await browser.close();
    } catch (_e) {}
    await new Promise((r) => server.close(r));
    console.log("\nScreenshots: artifacts/tragbar-studio-{showcase,wald,wald-ohne-laub}.png");
    process.exit(0);
})().catch((e) => {
    console.error("Studio-Render-Fehler:", (e && e.stack) || e);
    process.exit(2);
});
