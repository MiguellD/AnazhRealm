// U4 (V18.131) — DAS DEKO-FERNFELD: die Mess-Sonde. Beweist headless:
//   (1) der nahe Scatter ist BAND-getrieben (mesh-Band 0 = 5x5, vorher
//       per-Art ring 1 = 3x3 fuer die meisten Arten — "eine Reihe weiter"),
//   (2) das Fernfeld baut EIN InstancedMesh pro Art (Draw-Call-Deckel +6,
//       statt ~per-Chunk-Explosion), Instanzen > 0 im impostor-Band,
//   (3) DETERMINISTISCH ueber Re-Anker (identische Zahlen — kein Flackern),
//   (4) Dichte faellt mit dem Band (dekoDichte monoton).
// Plus der A-Shot: artifacts/deko-fernfeld.png (Blick in die Ferne).
//   node scripts/diag-deko-fernfeld.cjs
const puppeteer = require("puppeteer");
const http = require("http");
const fs = require("fs");
const path = require("path");
const PORT = 4399;
const root = path.resolve(__dirname, "..");
const ART = path.join(root, "artifacts");
const mime = {
    ".html": "text/html",
    ".js": "application/javascript",
    ".wasm": "application/wasm",
    ".json": "application/json",
    ".woff2": "font/woff2",
    ".css": "text/css",
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
    await page.setViewport({ width: 1600, height: 900 });
    const errs = [];
    page.on("pageerror", (e) => errs.push(String(e.message || e).split("\n")[0]));
    await page.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: "domcontentloaded", timeout: 30000 });
    const out = await page.evaluate(async () => {
        const t0 = performance.now();
        let stubbed = false;
        let lastSize = -1;
        let stable = 0;
        while (performance.now() - t0 < 90000) {
            const r = window.anazhRealm;
            if (r && !stubbed && r.state && r.state.renderer) {
                window.__origRender = r.state.renderer.render.bind(r.state.renderer);
                r.state.renderer.render = function () {};
                if (typeof r.state.renderer.renderAsync === "function")
                    r.state.renderer.renderAsync = () => Promise.resolve();
                r.state.postProcessingFailed = true;
                stubbed = true;
            }
            if (r && typeof r._gameLoopTick === "function") {
                try {
                    r._gameLoopTick(performance.now());
                } catch (_e) {}
                const sz = r.state && r.state.voxelChunks ? r.state.voxelChunks.size : 0;
                if (sz === lastSize) stable++;
                else {
                    stable = 0;
                    lastSize = sz;
                }
                if (sz > 40 && stable > 120) break;
            }
            await new Promise((res) => setTimeout(res, 4));
        }
        for (const el of document.querySelectorAll(".overlay, .modal, .drawer, #chat-console"))
            el.style.display = "none";
        document.body.classList.add("hud-hidden");
        const r = window.anazhRealm;
        for (let i = 0; i < 12; i++) r._tickDekoFernfeld();
        const ff = r.state.dekoFernfeld;
        const counts = {};
        if (ff) for (const [name, mesh] of ff.meshes) counts[name] = mesh.count;
        const near = r.state.voxelChunkScatter ? r.state.voxelChunkScatter.size : 0;
        let nearInst = 0;
        if (r.state.voxelChunkScatter)
            for (const list of r.state.voxelChunkScatter.values()) for (const it of list) nearInst += it.mesh.count;
        ff.anchor = null;
        for (let i = 0; i < 12; i++) r._tickDekoFernfeld();
        const counts2 = {};
        for (const [name, mesh] of ff.meshes) counts2[name] = mesh.count;
        const bands = r.constructor.DETAIL_CASCADE;
        const dichteFaellt =
            bands[0].dekoDichte > bands[1].dekoDichte &&
            bands[1].dekoDichte > bands[2].dekoDichte &&
            bands[3].dekoDichte === 0;
        return {
            nearChunks: near,
            nearInstanzen: nearInst,
            fern: counts,
            fernDeterministisch: JSON.stringify(counts) === JSON.stringify(counts2),
            fernMeshes: ff.meshes.size,
            dichteFaellt,
            queueLeer: ff.queue.length === 0,
        };
    });
    console.log(JSON.stringify(out));

    // A-Shot: Augenhöhe, Blick in die Ferne (das Fernfeld im Bild).
    fs.mkdirSync(ART, { recursive: true });
    await page.evaluate(() => {
        const r = window.anazhRealm;
        const s = r.state;
        const pm = s.playerMesh.position;
        const cam = s.camera;
        cam.position.set(pm.x, pm.y + 2.6, pm.z);
        const gy = r.getTerrainHeightAt(pm.x + 140, pm.z + 30);
        cam.lookAt(pm.x + 140, (Number.isFinite(gy) ? gy : pm.y) + 2, pm.z + 30);
        cam.updateMatrixWorld(true);
        if (window.__origRender) {
            s.renderer.render = window.__origRender;
            try {
                r._loopRender(performance.now());
                r._loopRender(performance.now());
                r._loopRender(performance.now());
            } catch (_e) {}
            s.renderer.render = function () {};
        }
    });
    await new Promise((res) => setTimeout(res, 250));
    await page.screenshot({ path: path.join(ART, "deko-fernfeld.png") });

    const fernTotal = Object.values(out.fern).reduce((a, b) => a + b, 0);
    const ok =
        out.nearChunks >= 20 &&
        out.nearInstanzen > 1000 &&
        fernTotal > 100 &&
        out.fernMeshes <= 6 &&
        out.fernDeterministisch &&
        out.dichteFaellt &&
        out.queueLeer &&
        errs.length === 0;
    console.log("PAGE-ERRORS:", errs.length ? errs.slice(0, 4).join(" | ") : "keine");
    console.log(ok ? "DEKO-FERNFELD-DIAG: GRÜN" : "DEKO-FERNFELD-DIAG: ROT");
    await browser.close();
    server.close();
    process.exit(ok ? 0 : 1);
})();
