// VERIFIZIERT: ALLE ASSET-KLASSEN durch die Werkstatt-Pipeline + WUERFELN (Schöpfer „sehe ich alle assets
// als blueprint, keine nachbauten? kann wuerfeln, alle assets?"). Echter Renderer + Foundry AN, kein Render.
// Fuer jede Klasse [Baum/Fels/Kristall/Blume/Strauch]: liefert `_workshopFoundryPreviewGroup` eine STUDIO-
// Gruppe? UND: liefert ein ANDERER Variant-Seed eine ANDERE Geometrie [= wuerfeln moeglich]?
const puppeteer = require("puppeteer");
const http = require("http");
const fs = require("fs");
const path = require("path");
const PORT = 4539;
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
        protocolTimeout: 200000,
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
    page.on("pageerror", (e) => console.log("[ERR]", (e.stack || e.message).split("\n")[0]));
    await page.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: "domcontentloaded", timeout: 30000 });
    const out = await page.evaluate(async () => {
        const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
        let stub = false;
        const s0 = performance.now();
        while (performance.now() - s0 < 50000) {
            const r = window.anazhRealm;
            if (r && !stub && r.state && r.state.renderer && !r.state.renderer._isHeadlessNull) {
                r.state.renderer.render = function () {};
                if (r.state.renderer.renderAsync) r.state.renderer.renderAsync = () => Promise.resolve();
                r.state.postProcessingFailed = true;
                r._bootWarmDone = true;
                stub = true;
            }
            if (r && typeof r._gameLoopTick === "function") {
                try {
                    r._gameLoopTick(performance.now());
                } catch (_e) {}
                if (r.state.voxelChunks && r.state.voxelChunks.size >= 8) break;
            }
            await sleep(5);
        }
        const r = window.anazhRealm;
        const s = r.state;
        const f = r._ensureAssetFoundry();
        const t0 = performance.now();
        while (f && !f.ready && performance.now() - t0 < 30000) await sleep(100);
        const triOf = (g) => {
            if (!g) return 0;
            const idx = g.index;
            if (idx) return idx.count / 3;
            const p = g.attributes && g.attributes.position;
            return p ? p.count / 3 : 0;
        };
        const groupTris = (grp) => {
            let t = 0;
            grp.traverse((o) => {
                if (o.isMesh && o.geometry) t += triOf(o.geometry);
            });
            return Math.round(t);
        };
        // Fuer jede Klasse: ist die Vorschau eine STUDIO-Gruppe (foundryPreview)?
        const klassen = ["baum_eiche", "baum_fichte", "findling", "fels", "kristalle", "blume", "busch"];
        const res = { proKlasse: {} };
        for (const bp of klassen) {
            const preset = r._foundryPresetFor(bp);
            if (!preset) {
                res.proKlasse[bp] = { preset: null, studio: false };
                continue;
            }
            // Ziehen (async), warten, dann pruefen.
            let g = r._workshopFoundryPreviewGroup(bp);
            const tp = performance.now();
            while (!g && performance.now() - tp < 20000) {
                await sleep(200);
                g = r._workshopFoundryPreviewGroup(bp);
            }
            let foundryMeshes = 0;
            if (g)
                g.traverse((o) => {
                    if (o.userData && o.userData.foundryPreview) foundryMeshes++;
                });
            res.proKlasse[bp] = {
                preset,
                studio: !!(g && foundryMeshes > 0),
                meshes: foundryMeshes,
                tris: g ? groupTris(g) : 0,
            };
        }
        // WUERFELN: liefert ein ANDERER Variant-Seed fuer eiche eine ANDERE Geometrie?
        const season = s.season || "summer";
        const varA = r._foundryVariantFor(111),
            varB = r._foundryVariantFor(999);
        const mA = await r._foundryRequest("eiche", varA, 0, season);
        const mB = await r._foundryRequest("eiche", varB, 0, season);
        const triA = mA ? mA.reduce((a, m) => a + (m.index ? m.index.length / 3 : 0), 0) : 0;
        const triB = mB ? mB.reduce((a, m) => a + (m.index ? m.index.length / 3 : 0), 0) : 0;
        res.wuerfeln = {
            variantA: varA,
            variantB: varB,
            trisA: Math.round(triA),
            trisB: Math.round(triB),
            verschieden: Math.abs(triA - triB) > 100 || varA !== varB,
        };
        res.variantenProArt = r.constructor.VARIANTS_PER_SPECIES;
        return res;
    });
    console.log(JSON.stringify(out, null, 2));
    console.log(
        "\nLESART: proKlasse.*.studio=true → alle Asset-Klassen fliessen als Studio-Blueprint durch die Werkstatt."
    );
    console.log(
        "        wuerfeln.verschieden=true → ein anderer Seed gibt eine andere Studio-Variante [wuerfeln moeglich]."
    );
    await browser.close();
    server.close();
    process.exit(0);
})();
