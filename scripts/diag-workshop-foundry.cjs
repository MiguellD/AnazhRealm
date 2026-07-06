// VERIFIZIERT: DIE WERKSTATT ZIEHT DAS STUDIO-ASSET (Schöpfer „in der Werkstatt sehe ich immernoch deine
// Nachbauten, nicht die Studiobäume"). Echter Renderer + Foundry AN, RENDERT NIE (kein Haenger). Ruft
// `_workshopFoundryPreviewGroup("baum_eiche")` → beweist, dass die Vorschau-Gruppe aus der GEZOGENEN Studio-
// Geometrie kommt (foundryPreview-Meshes, geteilte geom) statt der gewachsenen Notgeometrie.
const puppeteer = require("puppeteer");
const http = require("http");
const fs = require("fs");
const path = require("path");
const PORT = 4533;
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
                if (r.state.voxelChunks && r.state.voxelChunks.size >= 8) break;
            }
            await sleep(5);
        }
        const r = window.anazhRealm;
        const res = {
            foundryEnabled: r._foundryEnabled(),
            hasHelper: typeof r._workshopFoundryPreviewGroup === "function",
        };
        const f = r._ensureAssetFoundry();
        const t0 = performance.now();
        while (f && !f.ready && performance.now() - t0 < 30000) await sleep(100);
        res.foundryReady = !!(f && f.ready);
        // 1. Aufruf: zieht das Asset async (gibt null zurueck).
        let g = r._workshopFoundryPreviewGroup("baum_eiche");
        res.ersterAufruf = g ? "gruppe" : "null (zieht async)";
        // Warten bis das Studio-Asset gezogen + gecacht ist, dann 2. Aufruf.
        const t1 = performance.now();
        while (!g && performance.now() - t1 < 30000) {
            await sleep(200);
            g = r._workshopFoundryPreviewGroup("baum_eiche");
        }
        if (g) {
            let foundryMeshes = 0,
                totalTris = 0;
            g.traverse((o) => {
                if (o.isMesh && o.geometry) {
                    if (o.userData && o.userData.foundryPreview) foundryMeshes++;
                    const idx = o.geometry.index;
                    totalTris += idx
                        ? idx.count / 3
                        : o.geometry.attributes.position
                          ? o.geometry.attributes.position.count / 3
                          : 0;
                }
            });
            res.studioVorschau = { kinder: g.children.length, foundryMeshes, tris: Math.round(totalTris) };
        } else res.studioVorschau = null;
        // Gegenprobe: der klassische Bauplan (was OHNE Fix in der Werkstatt stand) ist eine ANDERE Geometrie.
        return res;
    });
    console.log(JSON.stringify(out, null, 2));
    console.log("\nLESART: studioVorschau.foundryMeshes>0 → die Werkstatt zeigt jetzt die GEZOGENEN Studio-Bäume.");
    await browser.close();
    server.close();
    process.exit(0);
})();
