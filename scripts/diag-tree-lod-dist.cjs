// DIE LOD-VERTEILUNG DER PLATZIERTEN BÄUME (Schöpfer „vollende das LOD"). Echter Renderer + Foundry AN,
// RENDERT NIE (kein Haenger). NATUERLICH streamen lassen (kein erzwungenes Rewarm), dann fuer jeden Baum:
// Distanz zum Spieler + seine LOD-Stufe (entry._lodLevel) + die geschaetzte Geometrie-Last. So sehe ich,
// ob die meisten Baeume schwer (LOD0 ~170k) oder distanz-gerecht leicht (LOD1/LOD2-Billboard) sind.
const puppeteer = require("puppeteer");
const http = require("http");
const fs = require("fs");
const path = require("path");
const PORT = 4535;
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
        while (performance.now() - s0 < 60000) {
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
                if (r.state.voxelChunks && r.state.voxelChunks.size >= 12) break;
            }
            await sleep(5);
        }
        const r = window.anazhRealm;
        const s = r.state;
        const f = r._ensureAssetFoundry();
        const t0 = performance.now();
        while (f && !f.ready && performance.now() - t0 < 30000) await sleep(100);
        // NATUERLICH streamen (kein forced rewarm) — nur normale Ticks, wie der echte Boot.
        for (let i = 0; i < 120; i++) {
            try {
                r._gameLoopTick(performance.now());
            } catch (_e) {}
            if (i % 20 === 0) await sleep(20);
        }
        const pm = s.playerMesh;
        const px = pm ? pm.position.x : 0,
            pz = pm ? pm.position.z : 0;
        const lodCount = { 0: 0, 1: 0, 2: 0, other: 0 };
        const lodByDist = { "0-14": {}, "14-32": {}, "32-64": {}, "64+": {} };
        let baum = 0;
        for (const e of s.architectures || []) {
            const sp = ((e._lodSpecies || e.type || "") + "").toLowerCase();
            if (!/baum/.test(sp) || !e.position) continue;
            baum++;
            const lod = Number.isFinite(e._lodLevel) ? e._lodLevel : "other";
            lodCount[lod] = (lodCount[lod] || 0) + 1;
            const d = Math.hypot(e.position.x - px, e.position.z - pz);
            const band = d < 14 ? "0-14" : d < 32 ? "14-32" : d < 64 ? "32-64" : "64+";
            lodByDist[band][lod] = (lodByDist[band][lod] || 0) + 1;
        }
        // Grobe Geometrie-Last je LOD (aus der Foundry-Cache-Geometrie schaetzen).
        const triOf = (g) => {
            if (!g) return 0;
            const idx = g.index;
            if (idx) return idx.count / 3;
            const p = g.attributes && g.attributes.position;
            return p ? p.count / 3 : 0;
        };
        let lod0Tris = 0,
            lod1Tris = 0,
            lod2Tris = 0,
            scanned = 0;
        if (s.scene)
            s.scene.traverse((o) => {
                if (!(o.isMesh || o.isInstancedMesh || o.isBatchedMesh) || !o.geometry) return;
                const t = triOf(o.geometry);
                if (t < 500) return;
                scanned++;
                if (t > 100000) lod0Tris += t;
                else if (t > 8000) lod1Tris += t;
                else lod2Tris += t;
            });
        return {
            baeume: baum,
            lodCount,
            lodByDist,
            geomLast: {
                schwerLOD0: Math.round(lod0Tris),
                mittelLOD1: Math.round(lod1Tris),
                leichtLOD2: Math.round(lod2Tris),
                meshesGezaehlt: scanned,
            },
            LOD_THRESH: r.constructor.LOD_DISTANCES,
        };
    });
    console.log(JSON.stringify(out, null, 2));
    await browser.close();
    server.close();
    process.exit(0);
})();
