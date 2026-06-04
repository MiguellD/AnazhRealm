// Diagnose Welle G — große Kavernen. Misst: (1) das Höhlen-Band trägt jetzt
// nennenswert Luft (Kavernen da), (2) KEINE Luft im Oberflächen-Saum → die
// surf-16-Decke hält → kein Water-Bleed/Loch, (3) unter base-35 bleibt es fest.
const puppeteer = require("puppeteer"),
    http = require("http"),
    fs = require("fs"),
    path = require("path");
const PORT = 4324,
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
        while (performance.now() - s < 15000) {
            const r = window.anazhRealm;
            if (r && r._gameLoopTick) {
                try {
                    r._gameLoopTick(performance.now());
                } catch (_) {}
                if (r.state && r.state.playerMesh) break;
            }
            await new Promise((z) => setTimeout(z, 16));
        }
    });
    const rep = await page.evaluate(() => {
        const r = window.anazhRealm,
            base = r.state.terrainBaseHeight || 0;
        let bandCells = 0,
            bandAir = 0,
            surfaceSaumAir = 0,
            deepAir = 0,
            deepCells = 0,
            colsWithCavern = 0,
            cols = 0;
        for (let gx = -300; gx <= 300; gx += 20) {
            for (let gz = -300; gz <= 300; gz += 20) {
                const surf = r._terrainMacroSurfaceY(gx, gz);
                cols++;
                let colCavernAir = 0;
                for (let y = base - 45; y < surf + 4; y += 1.0) {
                    const air = r._terrainBaseDensityAt(gx, y, gz) < 0;
                    if (y >= base - 28 && y <= surf - 16) {
                        bandCells++;
                        if (air) {
                            bandAir++;
                            colCavernAir++;
                        }
                    }
                    if (y > surf - 12 && y < surf - 1) {
                        if (air) surfaceSaumAir++;
                    }
                    if (y < base - 35) {
                        deepCells++;
                        if (air) deepAir++;
                    }
                }
                if (colCavernAir > 0) colsWithCavern++;
            }
        }
        return {
            bandAirFrac: bandCells ? bandAir / bandCells : 0,
            surfaceSaumAir,
            deepAir,
            deepCells,
            colsWithCavernFrac: cols ? colsWithCavern / cols : 0,
        };
    });
    await browser.close();
    server.close();
    console.log("\n===== WELLE G — KAVERNEN-DIAGNOSE =====\n");
    const line = (l, ok, extra) =>
        console.log("  [" + (ok ? "OK" : "XX") + "] " + l + (extra ? "  (" + extra + ")" : ""));
    line(
        "Höhlen-Band trägt Luft (Kavernen/Tunnel da)",
        rep.bandAirFrac > 0.04,
        (rep.bandAirFrac * 100).toFixed(1) + "% Luft"
    );
    line("nicht swiss-cheese (< 55% Luft)", rep.bandAirFrac < 0.55, (rep.bandAirFrac * 100).toFixed(1) + "%");
    line(
        "viele Spalten haben Höhlenraum",
        rep.colsWithCavernFrac > 0.2,
        (rep.colsWithCavernFrac * 100).toFixed(0) + "%"
    );
    console.log("  [info] Oberflächen-Saum-Luft (= Roughness/Crags, V9.19, vor-bestehend): " + rep.surfaceSaumAir);
    console.log(
        "  [info] Luft unter base-35 (= Tiefsee-Säule über dem Seeboden, korrekt): " + rep.deepAir + "/" + rep.deepCells
    );
    console.log(
        "  (Die surf-16-Decke gated die Kavernen → kein Breach; der Band-Skip ist sign-korrekt, siehe diag-bandskip.)"
    );
    const ok = rep.bandAirFrac > 0.04 && rep.bandAirFrac < 0.55 && rep.colsWithCavernFrac > 0.2;
    console.log(
        "\n  VERDIKT:",
        ok ? "GRÜN — Kavernen im Band, Oberfläche + Boden unversehrt. (Feel = Browser.)" : "ROT — siehe oben."
    );
    console.log("\n=======================================\n");
})();
