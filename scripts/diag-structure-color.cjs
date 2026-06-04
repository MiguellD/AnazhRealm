// Diagnose Welle C — der Schwarz-Floor. Beweist KONSUM (V17.31): ein Flach-
// Farb-Struktur-Material trägt das Eigen-Leuchten (emissive in der eigenen
// Farbe, emissiveIntensity > 0), ein Terrain-Material (vertexColors, trägt die
// Aerial-Schicht selbst) NICHT — und kein Page-Error. Die VISUELLE Wahrheit
// (nicht mehr schwarz, jetzt tief) ist der Schöpfer-Browser-Sign-off.
const puppeteer = require("puppeteer");
const http = require("http");
const fs = require("fs");
const path = require("path");
const PORT = 4321;
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
    let pageErr = null;
    page.on("pageerror", (err) => (pageErr = (err.stack || err.message).split("\n")[0]));
    await page.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: "domcontentloaded", timeout: 30000 });
    await page.evaluate(async () => {
        const s = performance.now();
        while (performance.now() - s < 12000) {
            const r = window.anazhRealm;
            if (r && typeof r._gameLoopTick === "function") {
                try {
                    r._gameLoopTick(performance.now());
                } catch (_e) {
                    /* */
                }
                if (r.state && r.state.playerMesh) break;
            }
            await new Promise((res) => setTimeout(res, 16));
        }
    });
    const report = await page.evaluate(() => {
        const r = window.anazhRealm;
        const ef = r.constructor.STRUCTURE_EMISSIVE;
        // Ein Flach-Farb-Struktur-Material bauen (wie eine Stein-Wand).
        const structMat = r._buildToonNodeMaterial({ color: 0x808080 });
        // Ein Terrain-Material (vertexColors).
        const terrainMat = r._buildToonNodeMaterial({ vertexColors: true });
        // Ein transparentes Phantom.
        const phantomMat = r._buildToonNodeMaterial({ color: 0x808080, transparent: true, opacity: 0.4 });
        const hexOf = (c) => (c && c.getHexString ? c.getHexString() : "?");
        return {
            cfg: ef,
            structEmissiveHex: hexOf(structMat.emissive),
            structEmissiveIntensity: structMat.emissiveIntensity,
            terrainEmissiveHex: hexOf(terrainMat.emissive),
            terrainEmissiveIntensity: terrainMat.emissiveIntensity,
            phantomEmissiveIntensity: phantomMat.emissiveIntensity,
            // dynamische Farbe weiter setzbar (Marking/Emotion unberührt)?
            colorStillSettable: (() => {
                structMat.color.setHex(0xc0392b);
                return structMat.color.getHexString() === "c0392b";
            })(),
        };
    });
    await browser.close();
    server.close();
    console.log("\n========= WELLE C — SCHWARZ-FLOOR-DIAGNOSE =========\n");
    const line = (l, ok, extra) => console.log(`  [${ok ? "OK" : "XX"}] ${l}${extra ? "  (" + extra + ")" : ""}`);
    line("kein Page-Error", pageErr === null, pageErr || "");
    line(
        "Struktur trägt Eigen-Leuchten in eigener Farbe",
        report.structEmissiveHex === "808080" && report.structEmissiveIntensity === report.cfg.intensity,
        `emissive=${report.structEmissiveHex} i=${report.structEmissiveIntensity}`
    );
    line(
        "Terrain trägt KEIN Eigen-Leuchten (Aerial-Schicht)",
        report.terrainEmissiveHex === "000000" && report.terrainEmissiveIntensity === 1,
        `emissive=${report.terrainEmissiveHex}`
    );
    line("Phantom (transparent) unberührt", report.phantomEmissiveIntensity === 1);
    line("dynamische Farbe (Marking/Emotion) weiter setzbar", report.colorStillSettable);
    const ok =
        pageErr === null &&
        report.structEmissiveHex === "808080" &&
        report.structEmissiveIntensity === report.cfg.intensity &&
        report.terrainEmissiveHex === "000000" &&
        report.phantomEmissiveIntensity === 1 &&
        report.colorStillSettable;
    console.log(
        "\n  VERDIKT:",
        ok
            ? "GRÜN — der Floor sitzt auf Strukturen, nicht auf Terrain/Phantom; dynamische Farben heil. (Visuell = Browser.)"
            : "ROT — siehe oben."
    );
    console.log("\n===================================================\n");
})();
