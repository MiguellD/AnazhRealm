// A4-Diagnose (S-Befund 10.06.): „bei komplett/sehr steil fallendem Wasser passt der
// Shader nicht und das Sheet hinterlässt DREIECKIGE OFFENE ZACKEN am Boden — das Wasser
// wächst horizontal, wird bei hohem vertikalem Fall aber nur vertikal GESTRECKT."
// MESSEN an einem ECHTEN Wasserfall (hydro.waterfalls): (1) die Quad-Spread-Statistik
// des Zell-Sheets dort (wieviele Quads überspannen > 2·step / > 4·step vertikal =
// die Zacken-Population), (2) settled-Screenshots des Falls (mein Auge).
const puppeteer = require("puppeteer");
const http = require("http");
const fs = require("fs");
const path = require("path");
const PORT = 4379;
const root = path.resolve(__dirname, "..");
const ART = path.join(root, "artifacts");
const mime = {
    ".html": "text/html",
    ".js": "application/javascript",
    ".wasm": "application/wasm",
    ".json": "application/json",
    ".woff2": "font/woff2",
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
    page.on("pageerror", (e) => console.log("[PAGE-ERROR]", (e.stack || e.message).split("\n")[0]));
    await page.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: "domcontentloaded", timeout: 30000 });

    // Boot + zum steilsten Wasserfall teleportieren (Ammo-Body, V13.0-Disziplin),
    // dann settled streamen + CA arbeiten lassen.
    const info = await page.evaluate(async () => {
        const t0 = performance.now();
        while (performance.now() - t0 < 60000) {
            const r = window.anazhRealm;
            if (r && r.state && r.state.hydrosphere && r.state.hydrosphere.ready && r.state.playerBody) break;
            await new Promise((res) => setTimeout(res, 50));
        }
        const r = window.anazhRealm;
        if (!r || !r.state.hydrosphere || !r.state.hydrosphere.ready) return { err: "hydro not ready" };
        const wfs = (r.state.hydrosphere.waterfalls || []).slice();
        if (!wfs.length) return { err: "keine Wasserfälle in dieser Welt" };
        // der steilste OBERIRDISCHE Fall (sichtbar fürs Auge; versunkene Läufe
        // [bottomY < Meeresspiegel] beweisen nur die Statistik, nicht den Look).
        const wl = typeof r.state.waterLevel === "number" ? r.state.waterLevel : 0;
        const open = wfs.filter((w) => (w.bottomY || 0) > wl + 1);
        const pool = open.length ? open : wfs;
        pool.sort((a, b) => (b.topY || 0) - (b.bottomY || 0) - ((a.topY || 0) - (a.bottomY || 0)));
        const wf = pool[0];
        const drop = (wf.topY || 0) - (wf.bottomY || 0);
        // Render stubben + Body hin teleportieren
        if (r.state.renderer) {
            window.__origRender = r.state.renderer.render.bind(r.state.renderer);
            r.state.renderer.render = function () {};
            if (typeof r.state.renderer.renderAsync === "function")
                r.state.renderer.renderAsync = () => Promise.resolve();
            r.state.postProcessingFailed = true;
        }
        const body = r.state.playerBody;
        const tr = r.state.tmpTransform;
        if (body && tr && typeof Ammo !== "undefined") {
            tr.setIdentity();
            tr.setOrigin(r.setVec(r.state.tmpVec1, wf.x, (wf.topY || 20) + 6, wf.z));
            body.setWorldTransform(tr);
            body.setLinearVelocity(r.setVec(r.state.tmpVec2, 0, 0, 0));
            body.activate(true);
        }
        return {
            wf: { x: +wf.x.toFixed(1), z: +wf.z.toFixed(1), topY: wf.topY, bottomY: wf.bottomY },
            drop: +drop.toFixed(1),
            count: wfs.length,
        };
    });
    console.log("WASSERFALL:", JSON.stringify(info));
    if (info.err) {
        await browser.close();
        await new Promise((r) => server.close(r));
        process.exit(2);
    }

    // settled streamen am neuen Ort + CA ein paar Sekunden arbeiten lassen
    await page.evaluate(async () => {
        const r = window.anazhRealm;
        const start = performance.now();
        let lastSize = -1,
            stableFor = 0;
        while (performance.now() - start < 90000) {
            try {
                r._gameLoopTick(performance.now());
            } catch (_e) {}
            const sz = r.state.voxelChunks ? r.state.voxelChunks.size : 0;
            if (sz === lastSize) stableFor++;
            else {
                stableFor = 0;
                lastSize = sz;
            }
            if (stableFor > 80) break;
            await new Promise((res) => setTimeout(res, 4));
        }
        try {
            r._drainPendingWaterIso && r._drainPendingWaterIso();
        } catch (_e) {}
        for (const el of document.querySelectorAll(".overlay, .modal, .drawer, #chat-console"))
            el.style.display = "none";
        document.body.classList.add("hud-hidden");
    });

    // MESSUNG: die Quad-Spread-Statistik aller Zell-Sheets im Umkreis des Falls.
    const stats = await page.evaluate(() => {
        const r = window.anazhRealm;
        const out = { sheets: 0, quads: 0, spread2: 0, spread4: 0, spread8: 0, maxSpread: 0 };
        const step = r._voxelChunkConfig(0).step;
        for (const [, mesh] of r.state.voxelChunkWaterIso || []) {
            if (!mesh || !mesh.geometry || !mesh.userData || mesh.userData.hydroKind !== "chunk-water-cellsheet")
                continue;
            out.sheets++;
            const pos = mesh.geometry.attributes.position.array;
            const idx = mesh.geometry.index.array;
            for (let t = 0; t < idx.length; t += 3) {
                const a = idx[t] * 3;
                const b = idx[t + 1] * 3;
                const c = idx[t + 2] * 3;
                const y0 = pos[a + 1];
                const y1 = pos[b + 1];
                const y2 = pos[c + 1];
                const spread = Math.max(y0, y1, y2) - Math.min(y0, y1, y2);
                // A4: VORHANG-Dreiecke (gewollt vertikal) haben XZ-Fläche ≈ 0 —
                // sie zählen separat; die Zacken-Population sind die NICHT-
                // vertikalen (Deck-)Dreiecke mit großem Spread.
                const xzArea = Math.abs(
                    (pos[b] - pos[a]) * (pos[c + 2] - pos[a + 2]) - (pos[c] - pos[a]) * (pos[b + 2] - pos[a + 2])
                );
                if (xzArea < 1e-6) {
                    out.curtains = (out.curtains || 0) + 1;
                    continue;
                }
                out.quads++;
                if (spread > 2 * step) out.spread2++;
                if (spread > 4 * step) out.spread4++;
                if (spread > 8 * step) out.spread8++;
                if (spread > out.maxSpread) out.maxSpread = spread;
            }
        }
        out.maxSpread = +out.maxSpread.toFixed(1);
        out.step = step;
        return out;
    });
    console.log("SHEET-STATISTIK:", JSON.stringify(stats));

    // Screenshots: von unten auf den Fall (wo die Zacken am Boden sichtbar sind) + von der Seite.
    const shoot = async (file, ox, oy, oz, lx, ly, lz) => {
        await page.evaluate(
            (ox, oy, oz, lx, ly, lz) => {
                const r = window.anazhRealm;
                const cam = r.state.camera;
                cam.position.set(ox, oy, oz);
                cam.lookAt(lx, ly, lz);
                cam.updateMatrixWorld(true);
                if (window.__origRender) {
                    r.state.renderer.render = window.__origRender;
                    r.state.postProcessingFailed = true;
                    try {
                        r._loopRender(performance.now());
                        r._loopRender(performance.now());
                        r._loopRender(performance.now());
                    } catch (_e) {}
                    r.state.renderer.render = function () {};
                }
            },
            ox,
            oy,
            oz,
            lx,
            ly,
            lz
        );
        await new Promise((res) => setTimeout(res, 300));
        await page.screenshot({ path: path.join(ART, file), fullPage: false });
        console.log("shot:", file);
    };
    fs.mkdirSync(ART, { recursive: true });
    const wf = info.wf;
    const midY = ((wf.topY || 20) + (wf.bottomY || 0)) / 2;
    await shoot("waterfall-from-below.png", wf.x + 26, (wf.bottomY || 0) + 4, wf.z + 26, wf.x, midY, wf.z);
    await shoot("waterfall-side.png", wf.x + 38, midY + 6, wf.z, wf.x, midY, wf.z);
    await browser.close();
    await new Promise((r) => server.close(r));
    console.log("\nA4-Zacken-Diag: artifacts/waterfall-{from-below,side}.png + Statistik oben.\n");
    process.exit(0);
})();
