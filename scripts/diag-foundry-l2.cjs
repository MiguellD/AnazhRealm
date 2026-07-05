// PRUEFT DIE L2-PLATZIERUNG: bekommt ein FERNER Baum (lod2) sein STUDIO-Billboard (nicht die
// schwere L2-Geometrie, nicht AnazhRealms eigener Bake)? Bootet AnazhRealm, spawnt einen Wald-Baum,
// zwingt lod2, tickt bis platziert, und prueft: (a) der Eintrag traegt instFoundry + eine `fimp:`-
// HISM-Gruppe (das Studio-Billboard im Instancing), (b) `_impostorAtlasMap` haelt einen `fimp:`-
// Record mit dem HORIZONTALEN Studio-Atlas (Breite = cw·V), (c) die Karte ist nicht leer.
const puppeteer = require("puppeteer");
const http = require("http");
const fs = require("fs");
const path = require("path");
const PORT = 4488;
const root = path.resolve(__dirname, "..");
const mime = {
    ".html": "text/html",
    ".js": "application/javascript",
    ".wasm": "application/wasm",
    ".json": "application/json",
    ".css": "text/css",
    ".png": "image/png",
    ".woff2": "font/woff2",
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
    await page.setViewport({ width: 900, height: 700 });
    page.on("pageerror", (e) => console.log("[PAGE-ERROR]", (e.stack || e.message).split("\n")[0]));
    await page.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: "domcontentloaded", timeout: 30000 });

    const out = await page.evaluate(async () => {
        const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
        let stubbed = false;
        const start = performance.now();
        while (performance.now() - start < 45000) {
            const r = window.anazhRealm;
            if (r && !stubbed && r.state && r.state.renderer) {
                r.state.renderer.render = function () {};
                if (r.state.renderer.renderAsync) r.state.renderer.renderAsync = () => Promise.resolve();
                r.state.postProcessingFailed = true;
                stubbed = true;
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
        const res = { err: null };
        const f = r._ensureAssetFoundry();
        const t0 = performance.now();
        while (f && !f.ready && performance.now() - t0 < 30000) await sleep(100);
        if (!f || !f.ready) {
            res.err = "foundry nicht ready";
            return res;
        }

        const pm = r.state.playerMesh && r.state.playerMesh.position;
        if (pm) pm.set(0, (r._voxelSurfaceY ? r._voxelSurfaceY(0, 0) : 20) + 2, 0);
        r.state.architectureCullingRadius = Math.max(400, r.state.architectureCullingRadius || 200);

        // Einen Wald-Baum spawnen (grown-Variante) + lod2 erzwingen (fern).
        const grownKey = r._growTreeBlueprintForSpawn("baum_eiche", "l2probe|baum_eiche|0,0");
        const type =
            grownKey && r.state.blueprints[grownKey] && r.state.blueprints[grownKey]._isGrown ? grownKey : "baum_eiche";
        const px = 120,
            pz = 0; // weit weg -> lod2
        const sy = (r._voxelSurfaceY ? r._voxelSurfaceY(px, pz) : 20) + 0.5;
        r.spawnArchitecture(type, { x: px, y: sy, z: pz }, { seed: 4242, silent: true, scale: 1 });
        const entry = r.state.architectures[r.state.architectures.length - 1];
        entry._lodLevel = 2; // die Distanz-LOD-Autoritaet -> L2

        // Ticken, bis das Studio-Billboard gebacken + platziert ist.
        for (let it = 0; it < 400; it++) {
            r.state._frameOverBudget = false;
            if (!entry.instFoundry) {
                if (entry.instanced) r._archInstanceRemove(entry);
                entry.mesh = null;
                r._rebuildArchitectureMesh(entry);
            }
            await sleep(25);
            if (entry.instFoundry) break;
        }

        res.type = entry.type;
        res.lodLevel = entry._lodLevel;
        res.instFoundry = !!entry.instFoundry;
        res.instanced = !!entry.instanced;
        // fimp-Gruppe im HISM?
        const groups = r.state.archInstanceGroups;
        let fimpGroups = 0;
        const sample = [];
        if (groups)
            for (const k of groups.keys())
                if (typeof k === "string" && k.includes("fimp:")) {
                    fimpGroups++;
                    if (sample.length < 4) sample.push(k);
                }
        res.fimpGroups = fimpGroups;
        res.sampleKeys = sample;
        // Impostor-Record aus dem Studio?
        const map = r._impostorAtlasMap;
        let recKey = null,
            rec = null;
        if (map)
            for (const [k, v] of map.entries())
                if (typeof k === "string" && k.startsWith("fimp:") && v && v.foundry) {
                    recKey = k;
                    rec = v;
                    break;
                }
        if (rec) {
            res.recKey = recKey;
            res.recViews = rec.views;
            res.recFoundry = !!rec.foundry;
            const im = rec.map && rec.map.image;
            res.atlasW = im ? im.width : 0;
            res.atlasH = im ? im.height : 0;
            res.atlasHorizontal = im ? im.width === rec.cellW * rec.views && im.height === rec.cellH : false;
            res.frameH = rec.frame && rec.frame.totalH;
        }
        return res;
    });

    console.log(JSON.stringify(out, null, 2));
    await browser.close();
    server.close();
    const ok = out && out.instFoundry && out.fimpGroups > 0 && out.recFoundry && out.atlasHorizontal;
    process.exit(ok ? 0 : 1);
})();
