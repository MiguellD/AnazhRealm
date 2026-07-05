// PRUEFT DIE DATA-DRIVEN ARTEN-KLASSIFIKATION (der Schoepfer-Weg „einspeisung der arten"): fliesst
// die STUDIO-Klassifikation (`PRESETS[id].kind`) durch die Rezept-Bruecke, und LIEST AnazhRealm sie
// (statt hartzukodieren)? Bootet AnazhRealm, wartet auf die Rezepte, prueft: (a) die Rezepte tragen
// `kind` (tree/rock/shrub…), (b) `_foundryPresetIsTree` folgt dem kind, (c) DER BEWEIS: aendert man
// zur Laufzeit ein kind (Fels->tree, Baum->rock), folgt die Klassifikation — kein hartkodiertes Abbild.
const puppeteer = require("puppeteer");
const http = require("http");
const fs = require("fs");
const path = require("path");
const PORT = 4489;
const root = path.resolve(__dirname, "..");
const mime = {
    ".html": "text/html",
    ".js": "application/javascript",
    ".wasm": "application/wasm",
    ".json": "application/json",
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
(async () => {
    await new Promise((r) => server.listen(PORT, r));
    const browser = await puppeteer.launch({
        headless: true,
        protocolTimeout: 300000,
        args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--no-sandbox", "--disable-setuid-sandbox"],
    });
    const page = await browser.newPage();
    page.on("pageerror", (e) => console.log("[PAGE-ERROR]", (e.stack || e.message).split("\n")[0]));
    await page.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: "domcontentloaded", timeout: 30000 });

    const out = await page.evaluate(async () => {
        const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
        let stub = false;
        const s = performance.now();
        while (performance.now() - s < 45000) {
            const r = window.anazhRealm;
            if (r && !stub && r.state && r.state.renderer) {
                r.state.renderer.render = function () {};
                if (r.state.renderer.renderAsync) r.state.renderer.renderAsync = () => Promise.resolve();
                r.state.postProcessingFailed = true;
                stub = true;
            }
            if (r && typeof r._gameLoopTick === "function") {
                try {
                    r._gameLoopTick(performance.now());
                } catch (_e) {}
                if (r.state.blueprints && r.state.blueprints.baum_eiche) break;
            }
            await sleep(5);
        }
        const r = window.anazhRealm;
        const o = {};
        const f = r._ensureAssetFoundry();
        const t0 = performance.now();
        while (f && !f.recipes && performance.now() - t0 < 40000) await sleep(200); // auf die RECIPES warten
        o.hasRecipes = !!(f && f.recipes);
        o.recipeCount = f && f.recipes ? Object.keys(f.recipes).length : 0;
        o.eicheKind = f && f.recipes && f.recipes.eiche ? f.recipes.eiche.kind : null;
        o.findlingKind = f && f.recipes && f.recipes.findling ? f.recipes.findling.kind : null;
        o.eicheIsTree = r._foundryPresetIsTree("eiche");
        o.findlingIsTree = r._foundryPresetIsTree("findling");
        o.strauchIsTree = r._foundryPresetIsTree("strauch");
        // DER DATA-DRIVEN-BEWEIS: kind zur Laufzeit tauschen -> die Klassifikation folgt dem Studio.
        if (f && f.recipes) {
            f.recipes.findling = { kind: "tree" };
            o.findlingReclassTree = r._foundryPresetIsTree("findling");
            f.recipes.eiche = { kind: "rock" };
            o.eicheReclassRock = r._foundryPresetIsTree("eiche");
        }
        return o;
    });

    console.log(JSON.stringify(out, null, 2));
    await browser.close();
    server.close();
    const ok =
        out &&
        out.hasRecipes &&
        out.recipeCount >= 15 &&
        out.eicheKind === "tree" &&
        out.eicheIsTree === true &&
        out.findlingIsTree === false &&
        out.strauchIsTree === true &&
        out.findlingReclassTree === true &&
        out.eicheReclassRock === false;
    console.log(ok ? "OK — die Arten-Klassifikation fliesst 1:1 aus dem Studio (data-driven)" : "FAIL");
    process.exit(ok ? 0 : 1);
})();
