// PRUEFT DIE PLATZIERUNG (der Kern des Schoepfer-Plans): platziert AnazhRealm das ECHTE Studio-
// Asset in der begehbaren Welt (nicht nur ausliefern)? Bootet AnazhRealm (Renderer gestubt aber
// NICHT null -> Foundry an), wartet auf die Studio-Bruecke + Prefetch, spawnt Wald-Baum-Varianten
// (grown_baum_*_vN) + Fels/Kristall, tickt das Culling, und misst: (a) wie viele foundry-faehige
// Eintraege `instFoundry===true` tragen (aus dem Studio platziert), (b) dass ihre HISM-Gruppen die
// `f:preset|variant|lod|season`-leafKeys tragen (die EINE Studio-Geometrie-Quelle), (c) dass ein
// KLASSISCH platzierter Eintrag auf das Studio-Asset HOCHGEHOBEN wird. MECHANIK = eine ZAHL.
const puppeteer = require("puppeteer");
const http = require("http");
const fs = require("fs");
const path = require("path");
const PORT = 4486;
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
        res.foundryReady = true;
        res.enabled = r._foundryEnabled();

        // Spieler nahe den Ursprung, damit alles in-Range platziert.
        const pm = r.state.playerMesh && r.state.playerMesh.position;
        if (pm) {
            pm.set(0, (r._voxelSurfaceY ? r._voxelSurfaceY(0, 0) : 20) + 2, 0);
        }
        r.state.architectureCullingRadius = Math.max(300, r.state.architectureCullingRadius || 200);

        // Wald-Baum-Varianten wachsen + spawnen (der ECHTE Wald-Pfad: grown_baum_*_vN).
        const arts = ["baum_eiche", "baum_fichte", "baum_birke", "baum_weide", "baum_mammut", "baum_tanne"];
        let spawned = 0;
        for (let i = 0; i < arts.length; i++) {
            const sp = arts[i];
            const grownKey = r._growTreeBlueprintForSpawn(sp, `probe|${sp}|0,0`);
            const type =
                grownKey && r.state.blueprints[grownKey] && r.state.blueprints[grownKey]._isGrown ? grownKey : sp;
            const ang = (i / arts.length) * Math.PI * 2;
            const px = Math.cos(ang) * 12,
                pz = Math.sin(ang) * 12;
            const sy = (r._voxelSurfaceY ? r._voxelSurfaceY(px, pz) : 20) + 0.5;
            r.spawnArchitecture(
                type,
                { x: px, y: sy, z: pz },
                { seed: 1000 + i, silent: true, scale: 1, rotationY: ang }
            );
            spawned++;
        }
        // Fels + Kristall direkt (kein grown-Pfad -> entry.type traegt das Preset).
        for (const [type, dx] of [
            ["noiserock", 20],
            ["kristall", 24],
            ["blume", 8],
        ]) {
            const sy = (r._voxelSurfaceY ? r._voxelSurfaceY(dx, 0) : 20) + 0.5;
            r.spawnArchitecture(type, { x: dx, y: sy, z: 0 }, { seed: 7000, silent: true });
            spawned++;
        }
        res.spawned = spawned;

        // Culling + Rewarm ticken; die Foundry-Anfragen resolven async (postMessage ans iframe).
        // Grosszuegig warten, bis die Assets ankommen + platziert sind.
        for (let it = 0; it < 400; it++) {
            r.state._frameOverBudget = false;
            try {
                r.tickArchitectureCulling();
            } catch (_e) {}
            // die LOD-Ticks auch treiben (falls ein Eintrag die Stufe wechselt)
            try {
                if (r._tickArchitectureLOD) r._tickArchitectureLOD();
            } catch (_e) {}
            await sleep(25);
            const archs = r.state.architectures || [];
            const done = archs.filter((e) => e && r._foundryPresetForEntry(e) && e.instFoundry).length;
            if (done >= spawned) break;
        }

        const archs = r.state.architectures || [];
        const elig = archs.filter((e) => e && r._foundryPresetForEntry(e));
        res.eligible = elig.length;
        res.foundryPlaced = elig.filter((e) => e.instFoundry).length;
        res.classicStill = elig.filter((e) => (e.instanced || e.mesh) && !e.instFoundry).length;
        res.cold = elig.filter((e) => !e.instanced && !e.mesh).length;
        // Die HISM-Gruppen-Keys mit `f:`-leafKey = Studio-Geometrie im Instancing.
        const groups = r.state.archInstanceGroups;
        let fGroups = 0;
        const sample = [];
        if (groups) {
            for (const key of groups.keys()) {
                if (typeof key === "string" && key.includes("f:")) {
                    fGroups++;
                    if (sample.length < 6) sample.push(key);
                }
            }
        }
        res.foundryGroups = fGroups;
        res.sampleKeys = sample;
        // Beispiel-Eintrag: Preset + Variante + lodLevel
        const ex = elig.find((e) => e.instFoundry);
        if (ex)
            res.example = {
                type: ex.type,
                lodSpecies: ex._lodSpecies,
                preset: r._foundryPresetForEntry(ex),
                lod: ex._lodLevel,
                instFoundry: ex.instFoundry,
            };
        return res;
    });

    console.log(JSON.stringify(out, null, 2));
    await browser.close();
    server.close();
    const ok = out && out.foundryReady && out.foundryPlaced > 0 && out.foundryGroups > 0;
    process.exit(ok ? 0 : 1);
})();
