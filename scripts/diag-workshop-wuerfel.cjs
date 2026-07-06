// VERIFIZIERT: DER WÜRFEL + LOD ZIEHEN DIE ECHTEN STUDIO-DATEN (Schöpfer „der Würfel rollt nur deinen
// Nachbau, nicht die wahren Pipeline-Daten"). Echter Renderer + Foundry, kein Render. Setzt den Bauplan-
// Samen [wie der Würfel] + die LOD-Stufe [wie die LOD-Knöpfe] und prueft, ob `_workshopFoundryPreviewGroup`
// eine ANDERE Studio-Variante / eine ANDERE LOD-Geometrie liefert.
const puppeteer = require("puppeteer");
const http = require("http");
const fs = require("fs");
const path = require("path");
const PORT = 4541;
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
        const bp = s.blueprints.baum_eiche;
        const triOf = (g) => {
            if (!g) return 0;
            const idx = g.index;
            if (idx) return idx.count / 3;
            const p = g.attributes && g.attributes.position;
            return p ? p.count / 3 : 0;
        };
        const previewSig = async (bpName) => {
            let g = r._workshopFoundryPreviewGroup(bpName);
            const tp = performance.now();
            while (!g && performance.now() - tp < 20000) {
                await sleep(200);
                g = r._workshopFoundryPreviewGroup(bpName);
            }
            if (!g) return { tris: 0, geoms: [] };
            let tris = 0;
            const geoms = [];
            g.traverse((o) => {
                if (o.isMesh && o.geometry) {
                    tris += triOf(o.geometry);
                    geoms.push(o.geometry.uuid.slice(0, 8));
                }
            });
            return { tris: Math.round(tris), geoms };
        };
        const res = {};
        // WÜRFEL: zwei verschiedene Samen -> zwei verschiedene Studio-Varianten?
        bp._grownSeed = "wurf-A";
        bp._recipeLod = 0;
        const A = await previewSig("baum_eiche");
        bp._grownSeed = "wurf-B";
        bp._recipeLod = 0;
        const B = await previewSig("baum_eiche");
        res.wuerfel = {
            seedA_tris: A.tris,
            seedB_tris: B.tris,
            geomsA: A.geoms,
            geomsB: B.geoms,
            verschieden: JSON.stringify(A.geoms) !== JSON.stringify(B.geoms),
        };
        // LOD: derselbe Same, LOD0 vs LOD1 -> andere [leichtere] Studio-Geometrie?
        bp._grownSeed = "wurf-A";
        bp._recipeLod = 0;
        const L0 = await previewSig("baum_eiche");
        bp._grownSeed = "wurf-A";
        bp._recipeLod = 1;
        const L1 = await previewSig("baum_eiche");
        res.lod = { lod0_tris: L0.tris, lod1_tris: L1.tris, leichter: L1.tris > 0 && L1.tris < L0.tris };
        return res;
    });
    console.log(JSON.stringify(out, null, 2));
    console.log(
        "\nLESART: wuerfel.verschieden=true → ein neuer Wurf zieht eine ANDERE Studio-Variante [echte Pipeline-Daten]."
    );
    console.log("        lod.leichter=true → ein LOD-Knopf zieht die LEICHTERE Studio-Stufe durch die Pipeline.");
    await browser.close();
    server.close();
    process.exit(0);
})();
