// diag-portal-boot.cjs — P2-WAND: das Terrain-Portal (worlds/terrain/index.html) bootet im vollen
// DISPLAY-Modus (Renderer + Welt + Wald + UI, NICHT ?asset-foundry) ohne page-error. Nach dem
// Kern-Split (foundry-core.js) liest die Shell (phytogenesis.js) die verschobenen Top-Level-Globals
// (buildInstance, PRESETS, growTreeNodes, …) — ein übersehener Bezug würde hier als ReferenceError
// auffliegen (im asset-foundry-Modus kehrt init() vorher zurück, deshalb braucht es DIESEN Display-Boot).
//   node scripts/diag-portal-boot.cjs
const puppeteer = require("puppeteer");
const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = Number(process.env.PORTAL_PORT || 4571);
const root = path.resolve(__dirname, "..");
const mime = {
    ".html": "text/html",
    ".js": "application/javascript",
    ".json": "application/json",
    ".css": "text/css",
    ".png": "image/png",
    ".woff2": "font/woff2",
    ".wasm": "application/wasm",
};
const server = http.createServer((req, res) => {
    let p = req.url.split("?")[0];
    if (p === "/") p = "/index.html";
    const fp = path.join(root, p);
    if (!fp.startsWith(root)) return ((res.statusCode = 403), res.end());
    fs.readFile(fp, (err, data) => {
        if (err) return ((res.statusCode = 404), res.end());
        res.setHeader("Content-Type", mime[path.extname(fp)] || "application/octet-stream");
        res.end(data);
    });
});

(async () => {
    await new Promise((r) => server.listen(PORT, "127.0.0.1", r));
    const browser = await puppeteer.launch({
        headless: true,
        protocolTimeout: 120000,
        args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--no-sandbox", "--disable-setuid-sandbox"],
    });
    const page = await browser.newPage();
    const errors = [];
    page.on("pageerror", (e) => errors.push((e.stack || e.message || String(e)).split("\n")[0]));
    page.on("console", (m) => {
        if (m.type() === "error") {
            const t = m.text();
            if (!/Failed to load resource|favicon|WebGL|GroupMarker|Automatic fallback/i.test(t))
                errors.push("[console.error] " + t.slice(0, 160));
        }
    });
    await page.goto(`http://127.0.0.1:${PORT}/worlds/terrain/index.html`, {
        waitUntil: "domcontentloaded",
        timeout: 30000,
    });
    // Der Shell laufen lassen (Renderer-init + erster Wald-Bau) — ~10 s reichen für die Boot-Kette.
    await page.evaluate(() => new Promise((r) => setTimeout(r, 10000)));
    // Evidenz, dass die Welt WIRKLICH baute (nicht nur „keine Fehler"): THREE + eine Szene mit Kindern.
    const built = await page.evaluate(() => {
        try {
            return {
                three: typeof THREE !== "undefined",
                buildInstance: typeof buildInstance === "function", // aus foundry-core, global sichtbar?
                presets: typeof PRESETS === "object" && PRESETS && Object.keys(PRESETS).length,
                canvas: !!document.querySelector("canvas"),
            };
        } catch (e) {
            return { err: (e && e.message) || String(e) };
        }
    });
    await browser.close();
    server.close();

    console.log("=== P2 — PORTAL-DISPLAY-BOOT (volle Shell liest foundry-core) ===");
    console.log(
        `  THREE: ${built.three} · buildInstance global: ${built.buildInstance} · PRESETS: ${built.presets} · canvas: ${built.canvas}`
    );
    if (errors.length) {
        console.error(`\n❌ ROT — ${errors.length} page-error(s):`);
        for (const e of errors.slice(0, 6)) console.error("  • " + e);
        process.exit(1);
    }
    const ok = built.three && built.buildInstance && built.presets > 0 && built.canvas;
    if (!ok) {
        console.error(
            "\n❌ ROT — die Shell baute nicht sauber (foundry-core-Global fehlt oder Boot brach):",
            JSON.stringify(built)
        );
        process.exit(1);
    }
    console.log("\n✅ GRÜN — das Portal bootet im Display-Modus, liest foundry-core-Globals, page-error 0.");
    process.exit(0);
})().catch((e) => {
    console.error("Portal-Boot-Fehler:", (e && e.stack) || e);
    process.exit(2);
});
