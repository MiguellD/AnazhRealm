// V18.390 (Eins W3) — DIE RTT-BAKE-LINSE (ECHTER Renderer, swiftshader-WebGPU):
// beweist, dass der 8-View-Impostor-Bake auf einer echten GPU-Pipeline läuft —
// der LOD1-Baum wird per RTT aus 8 Y-Peilungen gebacken, der Atlas-Record kippt
// von Canvas-Fallback auf rttBaked=true, und die 8 Zellen zeigen VERSCHIEDENE
// Peilungen (Pixel-Differenz zwischen Zellen > 0) + echte Alpha-Silhouette.
// NICHT im CI-Gate (swiftshader-Last) — die manuelle Ehrlichkeits-Linse:
// „lief der RTT-Bake wirklich, oder trägt der Canvas-Fallback?"
const http = require("http");
const fs = require("fs");
const path = require("path");
const puppeteer = require("puppeteer");
const PORT = 4423;
const root = path.resolve(__dirname, "..");
const mime = {
    ".html": "text/html",
    ".js": "application/javascript",
    ".json": "application/json",
    ".css": "text/css",
    ".wasm": "application/wasm",
    ".woff2": "font/woff2",
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
    await page.setViewport({ width: 640, height: 400 });
    let pageErr = null;
    page.on("pageerror", (e) => {
        pageErr = (e.stack || e.message).split("\n")[0];
    });
    await page.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: "domcontentloaded", timeout: 60000 });
    // DER LIGHT-PFAD (CLAUDE.md/diag-look-shot-Rezept): der volle Welt-Render tötet
    // swiftshader-WebGPU kumulativ → den MAIN-Render während des Boots STUBBEN
    // (window.__origRender gerettet) + den Ring klein halten; NUR der Bake rendert
    // (kleine Offscreen-Szene, 128×256) — genau das, was diese Linse misst.
    await page.evaluate(async () => {
        let stubbed = false;
        const start = performance.now();
        let lastSize = -1,
            stableFor = 0;
        while (performance.now() - start < 120000) {
            const r = window.anazhRealm;
            if (r && !stubbed && r.state && r.state.renderer) {
                window.__origRender = r.state.renderer.render.bind(r.state.renderer);
                r.state.renderer.render = function () {};
                r.state.postProcessingFailed = true;
                r.state.chunkRingRadius = 1; // kleine Welt — der Bake braucht nur die Klasse + Materialien
                stubbed = true;
            }
            if (r && typeof r._gameLoopTick === "function" && r.state.rendererReady === true) {
                try {
                    r._gameLoopTick(performance.now());
                } catch (_e) {}
                const sz = r.state && r.state.voxelChunks ? r.state.voxelChunks.size : 0;
                if (sz === lastSize) stableFor++;
                else {
                    stableFor = 0;
                    lastSize = sz;
                }
                if (sz >= 4 && stableFor > 30) break;
            }
            await new Promise((res) => setTimeout(res, 4));
        }
    });

    const report = await page.evaluate(async () => {
        const r = window.anazhRealm;
        const out = {};
        // den echten Render NUR für den Bake zurückgeben (die Welt bleibt gestubbt —
        // der Loop rendert headless-rAF-selten, die Bake-Szene ist klein).
        if (window.__origRender) r.state.renderer.render = window.__origRender;
        out.rendererReal = !!(r.state.renderer && !r.state.renderer._isHeadlessNull);
        // LOD2 wachsen → Impostor-Leaf → Atlas-Record + Bake-Queue.
        const keys = r._buildVariantLODs("baum_eiche", 0);
        const bpL2 = r.state.blueprints[keys[2]];
        r._archFlattenBlueprint(keys[2]);
        const key = "baum_eiche|0";
        const rec = r._ensureImpostorAtlas(key, bpL2._skeleton);
        out.recExists = !!rec;
        out.queued = !!(r._impostorBakeQueue && (r._impostorBakeQueue.includes(key) || rec.rttBaked));
        // Bake budgetiert anstoßen + auf Vollendung warten (async, mehrere Frames).
        // die Ziel-Art nach vorn ziehen (die Queue trägt alle Arten des Boots).
        if (r._impostorBakeQueue) {
            const qi = r._impostorBakeQueue.indexOf(key);
            if (qi > 0) {
                r._impostorBakeQueue.splice(qi, 1);
                r._impostorBakeQueue.unshift(key);
            }
        }
        const t0 = performance.now();
        while (!rec.rttBaked && !rec.rttFailed && performance.now() - t0 < 240000) {
            // headless-Pump: der träge rAF-Frame hält _frameOverBudget dauerhaft an —
            // für die LINSE das Budget-Gate lösen (Produktion budgetiert wie gebaut).
            r.state._frameOverBudget = false;
            r._tickImpostorBake();
            await new Promise((res) => setTimeout(res, 120));
        }
        out.rttBaked = rec.rttBaked === true;
        out.rttFailed = rec.rttFailed === true;
        out.rttError = window.__impostorRttError || null;
        out.bakeStage = window.__impostorBakeStage || null;
        out.bakePending = r._impostorBakePending === true;
        out.queueLen = r._impostorBakeQueue ? r._impostorBakeQueue.length : -1;
        out.frameOverBudget = r.state._frameOverBudget === true;
        if (rec.rttBaked && rec.map && rec.map.image && rec.map.image.getContext) {
            const cv = rec.map.image;
            out.atlasW = cv.width;
            out.atlasH = cv.height;
            const ctx = cv.getContext("2d");
            // Pro Zelle: Alpha-Deckung + Farb-Hash → Zellen müssen sich UNTERSCHEIDEN
            // (8 echte Peilungen, kein repliziertes Einzelbild).
            const cellStats = [];
            for (let v = 0; v < rec.views; v++) {
                const img = ctx.getImageData(v * rec.cellW, 0, rec.cellW, rec.cellH).data;
                let alphaPx = 0,
                    hash = 0;
                for (let i = 0; i < img.length; i += 4) {
                    if (img[i + 3] > 32) alphaPx++;
                    hash = (hash * 31 + img[i] + img[i + 1] * 3 + img[i + 2] * 7 + img[i + 3] * 11) >>> 0;
                }
                cellStats.push({ alphaPx, hash });
            }
            out.cellAlpha = cellStats.map((c) => c.alphaPx);
            out.allCellsHaveTree = cellStats.every((c) => c.alphaPx > 500);
            out.distinctViews = new Set(cellStats.map((c) => c.hash)).size;
            // Normal-Atlas: nicht mehr uniform neutral (128,128,255) überall.
            const nimg = rec.nmap.image.getContext("2d").getImageData(0, 0, rec.cellW, rec.cellH).data;
            let nonNeutral = 0;
            for (let i = 0; i < nimg.length; i += 4) {
                if (Math.abs(nimg[i] - 128) > 12 || Math.abs(nimg[i + 1] - 128) > 12) nonNeutral++;
            }
            out.normalNonNeutralPx = nonNeutral;
        }
        return out;
    });
    report.pageErr = pageErr;
    const ok =
        !report.pageErr &&
        report.rendererReal === true &&
        report.rttBaked === true &&
        report.allCellsHaveTree === true &&
        report.distinctViews >= 6 && // 8 Peilungen, mindestens 6 unterscheidbar (symmetrische Bäume erlaubt)
        report.normalNonNeutralPx > 200;
    console.log(JSON.stringify(report, null, 2));
    console.log(
        ok
            ? "\n✅ RTT-BAKE LÄUFT (echter Renderer: 8 distinct Views + Normal-Atlas gebacken)"
            : "\n❌ RTT-BAKE lief NICHT / unvollständig (der Canvas-Fallback trägt)"
    );
    await browser.close();
    server.close();
    process.exit(ok ? 0 : 1);
})();
