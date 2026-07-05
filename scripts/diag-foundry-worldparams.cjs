// PRUEFT DIE BREITE TAILLE (world-params, leicht+mittel+tiefer): fliesst die STUDIO-Boden-/Fels-/
// Feucht-Palette (PORTAL_GROUND) live durch die Bruecke, und LESEN AnazhRealms Farbquellen sie
// (MEADOW_GREEN / TERRAIN_GEOLOGY)? Bootet AnazhRealm, wartet auf world-params, prueft: (a) der
// Studio-Ground-Cache ist da, (b) MEADOW_GREEN = Studio-cMead (linear), (c) TERRAIN_GEOLOGY
// rock/moss/lit = Studio-cRock/cWet/cLit, (d) DER BEWEIS: Cache aendern -> die Getter folgen;
// (e) FALLBACK: Cache leeren -> die bisherigen Hardcodes (0 Regress).
const puppeteer = require("puppeteer");
const http = require("http");
const fs = require("fs");
const path = require("path");
const PORT = 4490;
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
const approx = (a, b) =>
    Array.isArray(a) && Array.isArray(b) && a.length === b.length && a.every((x, i) => Math.abs(x - b[i]) < 1e-4);
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
        const A = r.constructor;
        const T = window.THREE;
        const o = {};
        const ap = (a, b) =>
            Array.isArray(a) &&
            Array.isArray(b) &&
            a.length === b.length &&
            a.every((x, i) => Math.abs(x - b[i]) < 1e-4);
        r._ensureAssetFoundry();
        const t0 = performance.now();
        while (!A._studioGround && performance.now() - t0 < 40000) await sleep(200); // auf world-params warten
        o.hasStudioGround = !!A._studioGround;
        // Studio-Erwartungswerte (die PORTAL_GROUND-Hex sRGB->linear).
        const lin = (hex) => new T.Color(hex).toArray();
        o.meadMatches = ap(A.MEADOW_GREEN, lin(0x55632f));
        o.rockMatches = ap(A.TERRAIN_GEOLOGY.rockTint, lin(0x6b6258));
        o.mossMatches = ap(A.TERRAIN_GEOLOGY.mossTint, lin(0x33402a));
        o.litMatches = ap(A.TERRAIN_GEOLOGY.litTint, lin(0x2c3621));
        // DATA-DRIVEN-BEWEIS: den Cache aendern -> die Getter folgen.
        const testMead = [0.9, 0.1, 0.5];
        A._studioGround = Object.assign({}, A._studioGround, { mead: testMead });
        o.meadFollowsEdit = ap(A.MEADOW_GREEN, testMead);
        // FALLBACK-BEWEIS: Cache leeren -> die bisherigen Hardcodes.
        A._studioGround = null;
        o.meadFallback = ap(A.MEADOW_GREEN, [0.0908, 0.1248, 0.0284]);
        o.rockFallback = ap(A.TERRAIN_GEOLOGY.rockTint, [0.147, 0.1221, 0.0976]);
        return o;
    });

    console.log(JSON.stringify(out, null, 2));
    await browser.close();
    server.close();
    const ok =
        out &&
        out.hasStudioGround &&
        out.meadMatches &&
        out.rockMatches &&
        out.mossMatches &&
        out.litMatches &&
        out.meadFollowsEdit &&
        out.meadFallback &&
        out.rockFallback;
    console.log(ok ? "OK — die Studio-Boden-Palette fliesst live durch die Taille (leicht+mittel+tiefer)" : "FAIL");
    process.exit(ok ? 0 : 1);
})();
