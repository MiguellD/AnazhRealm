// diag-foundry-spawn-warm.cjs — FOUNDRY-WARM-SPAWN-BEWEIS
// Garage + Settlement warm nach Boot; kaltes Spawn schreit.
//   node scripts/diag-foundry-spawn-warm.cjs
const puppeteer = require("puppeteer");
const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = Number(process.env.FOUNDRY_SPAWN_WARM_PORT || 4587);
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
    if (!fp.startsWith(root)) return ((res.statusCode = 403), res.end());
    fs.readFile(fp, (err, data) => {
        if (err) return ((res.statusCode = 404), res.end());
        res.setHeader("Content-Type", mime[path.extname(fp)] || "application/octet-stream");
        res.end(data);
    });
});

(async () => {
    await new Promise((r) => server.listen(PORT, r));
    const browser = await puppeteer.launch({
        headless: true,
        protocolTimeout: 180000,
        args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--no-sandbox", "--disable-setuid-sandbox"],
    });
    const page = await browser.newPage();
    await page.evaluateOnNewDocument(() => {
        window.__anazhHeadlessNullRenderer = true;
        window.__anazhForceFoundry = true;
    });
    const pageErrors = [];
    page.on("pageerror", (e) => pageErrors.push((e.stack || e.message || String(e)).split("\n")[0]));
    await page.goto("http://127.0.0.1:" + PORT + "/index.html", { waitUntil: "domcontentloaded", timeout: 30000 });
    await page.evaluate(async () => {
        const dl = performance.now() + 90000;
        while (
            (!window.anazhRealm ||
                !window.anazhRealm.state ||
                typeof window.anazhRealm._gameLoopTick !== "function" ||
                !window.anazhRealm.state.blueprints) &&
            performance.now() < dl
        )
            await new Promise((r) => setTimeout(r, 100));
    });

    const S = await page.evaluate(async () => {
        const r = window.anazhRealm;
        const out = {
            ready: false,
            recipeGt: false,
            bpGt: false,
            warmCritical: false,
            settlementWarm: false,
            cacheGt: false,
            settleSlots: 0,
            awaitOk: false,
            gateBlocks: false,
            err: null,
        };
        try {
            const f = r._ensureAssetFoundry();
            if (!f) {
                out.err = "kein Foundry";
                return out;
            }
            const warm = await r._foundryAwaitBook(90000);
            out.awaitOk = !!warm.ok;
            out.ready = !!(f.ready && f.recipes);
            const dl = performance.now() + 120000;
            while ((!f._warmCritical || f._prefetching) && performance.now() < dl)
                await new Promise((res) => setTimeout(res, 100));
            out.warmCritical = !!f._warmCritical;
            out.settlementWarm = !!f._settlementWarm;
            out.recipeGt = !!(f.recipes && f.recipes.gt);
            out.bpGt = !!(r.state.blueprints && r.state.blueprints.fahrzeug_gt);
            const season = r.state.season || "summer";
            out.cacheGt = !!(f.cache && (f.cache.has("gt|1|0|" + season) || f.cache.has("gt|7|0|" + season)));
            const plan = await r._foundryRequestSettlement({ seed: 7, nH: 4 });
            out.settleSlots = plan && Array.isArray(plan.slots) ? plan.slots.length : 0;
            const wasReady = f.ready;
            const wasRecipes = f.recipes;
            f.ready = false;
            f.recipes = null;
            const blocked = r.spawnArchitecture("fahrzeug_gt", { x: 10, y: 0, z: 10 }, {});
            out.gateBlocks = blocked === null;
            f.ready = wasReady;
            f.recipes = wasRecipes;
        } catch (e) {
            out.err = (e && e.message) || String(e);
        }
        return out;
    });

    await browser.close();
    server.close();

    console.log("=== FOUNDRY-SPAWN-WARM ===");
    console.log("  awaitBook: " + S.awaitOk + " · ready+Buch: " + S.ready);
    console.log("  recipe gt: " + S.recipeGt + " · blueprint fahrzeug_gt: " + S.bpGt);
    console.log("  warmCritical: " + S.warmCritical + " · settlementWarm: " + S.settlementWarm);
    console.log("  cache gt lod0: " + S.cacheGt + " · settleSlots: " + S.settleSlots);
    console.log("  Spawn-Wand blockiert kalt: " + S.gateBlocks);
    if (S.err) console.log("  Fehler: " + S.err);
    if (pageErrors.length) console.log("  Seiten-Fehler:", pageErrors.slice(0, 3));

    const ok =
        S.awaitOk &&
        S.ready &&
        S.recipeGt &&
        S.bpGt &&
        S.warmCritical &&
        S.settlementWarm &&
        S.cacheGt &&
        S.settleSlots > 0 &&
        S.gateBlocks &&
        !S.err;
    if (!ok) {
        console.error("\nROT — Foundry-Warm-Spawn nicht bestätigt.");
        process.exit(1);
    }
    console.log("\nGRUEN — Garage + Siedlung warm; kaltes Spawn schreit.");
    process.exit(0);
})().catch((e) => {
    console.error("diag-foundry-spawn-warm:", (e && e.stack) || e);
    process.exit(2);
});
