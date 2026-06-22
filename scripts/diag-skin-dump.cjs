// diag-skin-dump.cjs — zieht REALE Skin-Parts (Avatar + Kreatur-Seelen) aus der
// gebooteten Welt in eine Fixture (/tmp/skin-fixtures.json), damit die bake-core-
// Optimierung in REINEM NODE byte-exakt + zeit-gemessen iteriert werden kann (Sekunden
// statt Puppeteer-Minuten). Einmalig laufen; danach trägt die Fixture die Wahrheit.
const puppeteer = require("puppeteer"),
    http = require("http"),
    fs = require("fs"),
    path = require("path");
const PORT = Number(process.env.DIAG_PORT) || 4371,
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
        const r = window.anazhRealm,
            K = r.constructor;
        const fx = { avatar: null, creatures: [] };
        try {
            // Avatar: dieselbe Landmark-Quelle wie der Live-Rig (kh/oy realistisch).
            fx.avatar = K._humanoidSkeleton({ kh: 1, oy: 0, skinColor: 0xc98a63 });
        } catch (e) {
            fx.avatarErr = e.message;
        }
        const SOULS = K.CREATURE_SOULS || {};
        const skinSouls = Object.keys(SOULS).filter(
            (k) => SOULS[k] && SOULS[k].skin && Array.isArray(SOULS[k].bodyParts) && SOULS[k].bodyParts.length
        );
        for (const k of skinSouls.slice(0, 4)) fx.creatures.push({ soul: k, parts: SOULS[k].bodyParts });
        return fx;
    });
    await browser.close();
    server.close();
    if (!out.avatar) {
        console.error("❌ kein Avatar:", out.avatarErr);
        process.exit(1);
    }
    fs.writeFileSync("/tmp/skin-fixtures.json", JSON.stringify(out));
    console.log(
        `✅ Fixture: Avatar ${out.avatar.length} parts · ${out.creatures.length} Kreatur-Seelen (${out.creatures.map((c) => c.soul + ":" + c.parts.length).join(", ")})`
    );
    console.log("   → /tmp/skin-fixtures.json");
    process.exit(0);
})().catch((e) => {
    console.error("Crash:", e);
    process.exit(1);
});
