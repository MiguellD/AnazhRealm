// DER WELT-DARSTELLUNGS-ABGLEICH (Schöpfer: „schaue in den HORIZONT, bei verschiedenem Wetter, OHNE
// Bäume/Sträucher — dann siehst du den dramatischen Unterschied der Weltendarstellung"). Nicht der
// Boden-Nahblick, sondern die Atmosphäre: Himmel · Nebel · ferne Silhouette · Wetter.
// Beide Welten: Vegetation (InstancedMesh) versteckt → Terrain + Himmel + Nebel + Wetter pur.
//   LINKS  = STUDIO (worlds/terrain, ?patch-probe), Augenhöhe zum Horizont, Wetter via wx-Buttons.
//   RECHTS = ANAZHREALM (echtes WebGPU, page.screenshot), Augenhöhe zum Horizont, Wetter via _setWeather.
// -> artifacts/horizon-compare.png (Zeilen: klar · bewölkt · sturm · Sonnenuntergang)
const puppeteer = require("puppeteer");
const http = require("http");
const fs = require("fs");
const path = require("path");
const PORT = 4503;
const root = path.resolve(__dirname, "..");
const ART = path.join(root, "artifacts");
const W = 480,
    H = 300;
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
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const GPU_ARGS = [
    "--use-angle=swiftshader",
    "--enable-unsafe-swiftshader",
    "--enable-webgl",
    "--ignore-gpu-blocklist",
    "--no-sandbox",
    "--disable-setuid-sandbox",
];
// Wetter-Zeilen: Studio-wx ↔ AnazhRealm-weather ↔ Tageszeit. Sonnenuntergang, um den „Licht scheint
// durch den Boden"-Befund einzufangen.
const ROWS = [
    { key: "klar", wx: "klar", weather: "sunny", tod: 0.5 },
    { key: "bewoelkt", wx: "bewoelkt", weather: "rainy", tod: 0.5 },
    { key: "sturm", wx: "sturm", weather: "stormy", tod: 0.5 },
    { key: "sonnenuntergang", wx: "klar", weather: "sunny", tod: 0.74 },
];

// STUDIO: Augenhöhe zum Horizont, Vegetation aus, Wetter setzen.
async function shootStudio(browser) {
    const page = await browser.newPage();
    await page.setViewport({ width: W, height: H });
    page.on("pageerror", (e) => console.log("[STUDIO-ERR]", (e.stack || e.message).split("\n")[0]));
    await page.goto(`http://127.0.0.1:${PORT}/worlds/terrain/index.html?patch-probe=1`, {
        waitUntil: "domcontentloaded",
        timeout: 30000,
    });
    await page.evaluate(async () => {
        const s = performance.now();
        while (!window.__phytoView && performance.now() - s < 30000) await new Promise((r) => setTimeout(r, 50));
        const btn = document.getElementById("waldBtn");
        if (btn) btn.click();
    });
    await sleep(9000);
    await page.evaluate(() => {
        const st = document.createElement("style");
        st.textContent = "body > *:not(canvas):not(script):not(style){display:none!important}";
        document.head.appendChild(st);
        // Vegetation verstecken → Terrain+Himmel+Nebel pur. Stämme = InstancedMesh (traverse),
        // Laub = FoliagePass (setForestFoliage(false) tauscht ihn gegen den einfachen RenderPass).
        const V = window.__phytoView;
        if (V && V.scene)
            V.scene.traverse((o) => {
                if (o.isInstancedMesh) o.visible = false;
            });
        if (V && V.setForestFoliage) V.setForestFoliage(false);
    });
    const shots = {};
    for (const row of ROWS) {
        await page.evaluate((row) => {
            // Wetter via wx-Button (die echte UI-Quelle) + Tageszeit via wTime-Slider.
            const wb = document.querySelector('#ui [data-wx="' + row.wx + '"]');
            if (wb) wb.click();
            const tel = document.getElementById("wTime");
            if (tel) {
                tel.value = String(row.tod * 24);
                tel.dispatchEvent(new Event("input", { bubbles: true }));
            }
        }, row);
        await sleep(1400); // Wetter-/Wolken-Cross-Fade + Tageszeit setzen lassen
        await page.evaluate(() => {
            const V = window.__phytoView;
            if (!V || !V.camera) return;
            const cam = V.camera;
            // Augenhöhe über dem Wald-Zentrum, Blick zum Horizont (leicht runter).
            cam.position.set(0, 9, 0);
            const yaw = 0.6,
                pitch = (4 * Math.PI) / 180;
            cam.lookAt(Math.sin(yaw) * 40, 9 + Math.sin(pitch) * 40, Math.cos(yaw) * 40);
            cam.updateMatrixWorld(true);
            V.renderPatch();
            V.renderPatch();
        });
        await sleep(200);
        shots[row.key] = await page.screenshot({ type: "png" });
        console.log(`  studio ${row.key.padEnd(16)} OK`);
    }
    await page.close();
    return shots;
}

// ANAZHREALM: echtes WebGPU, Vegetation aus, Augenhöhe zum Horizont, Wetter setzen.
async function shootAnazh(browser) {
    const page = await browser.newPage();
    await page.setViewport({ width: W, height: H });
    page.on("pageerror", (e) => console.log("[ANAZH-ERR]", (e.stack || e.message).split("\n")[0]));
    await page.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: "domcontentloaded", timeout: 30000 });
    await page.evaluate(async () => {
        let stubbed = false;
        const start = performance.now();
        let lastSize = -1,
            stableFor = 0;
        while (performance.now() - start < 90000) {
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
                if (sz === lastSize) stableFor++;
                else {
                    stableFor = 0;
                    lastSize = sz;
                }
                if (sz >= 18 && stableFor > 40) break;
            }
            await new Promise((res) => setTimeout(res, 4));
        }
        const r = window.anazhRealm;
        try {
            r._drainPendingWaterIso && r._drainPendingWaterIso();
        } catch (_e) {}
    });
    // Einen erhöhten, offenen Punkt für den Horizont-Blick wählen (weg von Wasser, hoch).
    const spot = await page.evaluate(() => {
        const r = window.anazhRealm;
        const s = r.state;
        const pm = s.playerMesh;
        const th = (x, z) => (typeof r.getTerrainHeightAt === "function" ? r.getTerrainHeightAt(x, z) : 0);
        const wl = (x, z) => (typeof r._waterLevelAt === "function" ? r._waterLevelAt(x, z) : -Infinity);
        const cx = pm ? pm.position.x : 0,
            cz = pm ? pm.position.z : 0;
        let best = { x: cx, z: cz, h: th(cx, cz) };
        for (let rad = 20; rad <= 110; rad += 8)
            for (let a = 0; a < 360; a += 20) {
                const x = cx + Math.cos((a * Math.PI) / 180) * rad,
                    z = cz + Math.sin((a * Math.PI) / 180) * rad;
                const h = th(x, z);
                if (h > wl(x, z) + 2 && h > best.h) best = { x, z, h };
            }
        if (pm) pm.position.set(best.x, best.h + 1.7, best.z);
        return best;
    });
    // UI + Avatar aus, Vegetation (InstancedMesh/BatchedMesh) aus → Terrain+Himmel+Nebel pur.
    await page.evaluate(() => {
        const st = document.createElement("style");
        st.textContent = "body > *:not(canvas):not(script):not(style){display:none!important}";
        document.head.appendChild(st);
        const r = window.anazhRealm;
        if (r && r.state && r.state.playerMesh) r.state.playerMesh.visible = false;
        if (r && r.state && r.state.scene)
            r.state.scene.traverse((o) => {
                if (o.isInstancedMesh || o.isBatchedMesh) o.visible = false;
            });
    });
    const shots = {};
    for (const row of ROWS) {
        const meta = await page.evaluate(
            (row, spot) => {
                const r = window.anazhRealm;
                const s = r.state;
                try {
                    if (typeof r._setWeather === "function") r._setWeather(row.weather);
                    r.setTimeOfDay(row.tod);
                    for (let i = 0; i < 6; i++) r._gameLoopTick(performance.now());
                } catch (_e) {}
                // Vegetation bleibt aus (Streaming baut evtl. neue → nach dem Tick erneut verstecken).
                if (s.scene)
                    s.scene.traverse((o) => {
                        if (o.isInstancedMesh || o.isBatchedMesh) o.visible = false;
                    });
                if (s.playerMesh) s.playerMesh.visible = false;
                const cam = s.camera;
                const ex = spot.x,
                    ey = spot.h + 1.7,
                    ez = spot.z;
                const yaw = 0.6,
                    pitch = (4 * Math.PI) / 180;
                cam.position.set(ex, ey, ez);
                const dir = {
                    x: Math.sin(yaw) * Math.cos(pitch),
                    y: Math.sin(pitch),
                    z: Math.cos(yaw) * Math.cos(pitch),
                };
                cam.lookAt(ex + dir.x * 60, ey + dir.y * 60, ez + dir.z * 60);
                cam.updateMatrixWorld(true);
                let err = null;
                if (window.__origRender) {
                    r.state.renderer.render = window.__origRender;
                    s.postProcessingFailed = true;
                    try {
                        if (typeof r._loopRender === "function") {
                            r._loopRender(performance.now());
                            r._loopRender(performance.now());
                        } else window.__origRender(s.scene, cam);
                    } catch (_e) {
                        err = String((_e && _e.message) || _e);
                    }
                    r.state.renderer.render = function () {};
                } else err = "no origRender";
                return { err };
            },
            row,
            spot
        );
        await sleep(250);
        shots[row.key] = await page.screenshot({ type: "png" });
        console.log(`  anazh  ${row.key.padEnd(16)} ${meta.err ? "WARN " + meta.err : "OK"}`);
    }
    await page.close();
    return shots;
}

async function stitch(browser, studio, anazh) {
    const page = await browser.newPage();
    await page.goto("about:blank");
    const toB64 = (b) => (b ? b.toString("base64") : null);
    const rows = ROWS.map((r) => ({ key: r.key, s: toB64(studio[r.key]), a: toB64(anazh[r.key]) }));
    const dataURL = await page.evaluate(
        async (rows, W, H) => {
            const LBL = 22,
                GAP = 8;
            const cv = document.createElement("canvas");
            cv.width = 2 * W + GAP;
            cv.height = rows.length * (H + LBL);
            const ctx = cv.getContext("2d");
            ctx.fillStyle = "#111";
            ctx.fillRect(0, 0, cv.width, cv.height);
            const load = (b64) =>
                new Promise((res) => {
                    if (!b64) return res(null);
                    const im = new Image();
                    im.onload = () => res(im);
                    im.onerror = () => res(null);
                    im.src = "data:image/png;base64," + b64;
                });
            for (let i = 0; i < rows.length; i++) {
                const y = i * (H + LBL) + LBL;
                const si = await load(rows[i].s),
                    ai = await load(rows[i].a);
                if (si) ctx.drawImage(si, 0, 0, si.width, si.height, 0, y, W, H);
                if (ai) ctx.drawImage(ai, 0, 0, ai.width, ai.height, W + GAP, y, W, H);
                ctx.fillStyle = "#fff";
                ctx.font = "13px sans-serif";
                ctx.fillText(rows[i].key + " — STUDIO", 6, y - 6);
                ctx.fillText(rows[i].key + " — ANAZHREALM", W + GAP + 6, y - 6);
            }
            return cv.toDataURL("image/png");
        },
        rows,
        W,
        H
    );
    await page.close();
    return dataURL;
}

(async () => {
    fs.mkdirSync(ART, { recursive: true });
    await new Promise((r) => server.listen(PORT, r));
    const browser = await puppeteer.launch({ headless: true, protocolTimeout: 600000, args: GPU_ARGS });
    console.log("STUDIO Horizont...");
    const studio = await shootStudio(browser);
    console.log("ANAZHREALM Horizont...");
    const anazh = await shootAnazh(browser);
    console.log("Kontaktblatt...");
    const dataURL = await stitch(browser, studio, anazh);
    if (dataURL) {
        fs.writeFileSync(
            path.join(ART, "horizon-compare.png"),
            Buffer.from(dataURL.replace(/^data:image\/png;base64,/, ""), "base64")
        );
        console.log("-> artifacts/horizon-compare.png");
    }
    await browser.close();
    await new Promise((r) => server.close(r));
    process.exit(dataURL ? 0 : 1);
})();
