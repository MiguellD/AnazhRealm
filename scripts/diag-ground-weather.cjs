// DER BODEN + WETTER-ABGLEICH (Schöpfer „boden, felsen, wetter — ist das noch weit entfernt? wo ist die
// pipeline?"). Der EHRLICHE Weg: die ECHTE AnazhRealm-WebGPU-Welt (nicht der Proxy) — dieselbe Linse, die
// beim Horizont ueberlebte (Vegetation aus → Terrain + Himmel + Nebel + Wetter pur), aber die Kamera zeigt
// NACH UNTEN auf den BODEN (Geologie: Wiese/Moos/Sand/Fels-Tints) statt zum Horizont. Beide Welten echt
// gerendert, ueber die Wetter-Zeilen. So sieht der Schoepfer, wo Boden + Wetter WIRKLICH stehen — kein Proxy.
//   LINKS  = STUDIO (worlds/terrain, ?patch-probe), RECHTS = ANAZHREALM (echtes WebGPU, page.screenshot).
// -> artifacts/ground-weather.png (Zeilen: klar · bewölkt · sturm · Sonnenuntergang)
const puppeteer = require("puppeteer");
const http = require("http");
const fs = require("fs");
const path = require("path");
const PORT = 4525;
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
const ROWS = [
    { key: "klar", wx: "klar", weather: "sunny", tod: 0.5 },
    { key: "bewoelkt", wx: "bewoelkt", weather: "rainy", tod: 0.5 },
    { key: "sturm", wx: "sturm", weather: "stormy", tod: 0.5 },
    { key: "sonnenuntergang", wx: "klar", weather: "sunny", tod: 0.74 },
];
// Kamera NACH UNTEN: Augenhoehe, aber Blick ~28° gesenkt → der Boden fuellt den Rahmen.
const PITCH_DOWN = (-28 * Math.PI) / 180;

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
        // Baeume aus (InstancedMesh) + Laub-Pass aus → der BODEN (Wiese/Fels/Sand) pur.
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
            const wb = document.querySelector('#ui [data-wx="' + row.wx + '"]');
            if (wb) wb.click();
            const tel = document.getElementById("wTime");
            if (tel) {
                tel.value = String(row.tod * 24);
                tel.dispatchEvent(new Event("input", { bubbles: true }));
            }
        }, row);
        await sleep(1400);
        await page.evaluate((pitch) => {
            const V = window.__phytoView;
            if (!V || !V.camera) return;
            const cam = V.camera;
            cam.position.set(0, 6, 0);
            const yaw = 0.6;
            cam.lookAt(Math.sin(yaw) * 30, 6 + Math.sin(pitch) * 30, Math.cos(yaw) * 30);
            cam.updateMatrixWorld(true);
            V.renderPatch();
            V.renderPatch();
        }, PITCH_DOWN);
        await sleep(200);
        shots[row.key] = await page.screenshot({ type: "png" });
        console.log(`  studio ${row.key.padEnd(16)} OK`);
    }
    await page.close();
    return shots;
}

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
                r.state.chunkRingRadius = 2; // kleinere Welt (25 statt 81 Chunks) → leichter Render, swiftshader ueberlebt
                r._bootWarmDone = true; // V18.396-Warm-Compile AUS (die compileAsync-Last stresst swiftshader)
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
                if (sz >= 12 && stableFor > 30) break;
            }
            await new Promise((res) => setTimeout(res, 4));
        }
        const r = window.anazhRealm;
        r._bootWarmDone = true;
        try {
            r._drainPendingWaterIso && r._drainPendingWaterIso();
        } catch (_e) {}
    });
    // Einen offenen, trockenen Land-Fleck waehlen (weg von Wasser) — der Boden soll Wiese/Fels zeigen.
    const spot = await page.evaluate(() => {
        const r = window.anazhRealm;
        const s = r.state;
        const pm = s.playerMesh;
        const th = (x, z) => (typeof r.getTerrainHeightAt === "function" ? r.getTerrainHeightAt(x, z) : 0);
        const wl = (x, z) => (typeof r._waterLevelAt === "function" ? r._waterLevelAt(x, z) : -Infinity);
        const cx = pm ? pm.position.x : 0,
            cz = pm ? pm.position.z : 0;
        let best = { x: cx, z: cz, h: th(cx, cz), dry: th(cx, cz) - wl(cx, cz) };
        for (let rad = 12; rad <= 90; rad += 8)
            for (let a = 0; a < 360; a += 20) {
                const x = cx + Math.cos((a * Math.PI) / 180) * rad,
                    z = cz + Math.sin((a * Math.PI) / 180) * rad;
                const h = th(x, z);
                const dry = h - wl(x, z);
                if (dry > 3 && dry > best.dry) best = { x, z, h, dry };
            }
        if (pm) pm.position.set(best.x, best.h + 1.7, best.z);
        return best;
    });
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
            (row, spot, pitch) => {
                const r = window.anazhRealm;
                const s = r.state;
                try {
                    if (typeof r._setWeather === "function") r._setWeather(row.weather);
                    r.setTimeOfDay(row.tod);
                    for (let i = 0; i < 6; i++) r._gameLoopTick(performance.now());
                } catch (_e) {}
                if (s.scene)
                    s.scene.traverse((o) => {
                        if (o.isInstancedMesh || o.isBatchedMesh) o.visible = false;
                    });
                if (s.playerMesh) s.playerMesh.visible = false;
                const cam = s.camera;
                const ex = spot.x,
                    ey = spot.h + 1.7,
                    ez = spot.z;
                const yaw = 0.6;
                const dir = {
                    x: Math.sin(yaw) * Math.cos(pitch),
                    y: Math.sin(pitch),
                    z: Math.cos(yaw) * Math.cos(pitch),
                };
                cam.position.set(ex, ey, ez);
                cam.lookAt(ex + dir.x * 40, ey + dir.y * 40, ez + dir.z * 40);
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
                return { err, dry: +spot.dry.toFixed(1) };
            },
            row,
            spot,
            PITCH_DOWN
        );
        await sleep(250);
        shots[row.key] = await page.screenshot({ type: "png" });
        console.log(`  anazh  ${row.key.padEnd(16)} ${meta.err ? "WARN " + meta.err : "OK dry=" + meta.dry}`);
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
                ctx.fillText(rows[i].key + " — STUDIO (Boden)", 6, y - 6);
                ctx.fillText(rows[i].key + " — ANAZHREALM (Boden)", W + GAP + 6, y - 6);
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
    console.log("STUDIO Boden...");
    const studio = await shootStudio(browser);
    console.log("ANAZHREALM Boden...");
    const anazh = await shootAnazh(browser);
    console.log("Kontaktblatt...");
    const dataURL = await stitch(browser, studio, anazh);
    if (dataURL) {
        fs.writeFileSync(
            path.join(ART, "ground-weather.png"),
            Buffer.from(dataURL.replace(/^data:image\/png;base64,/, ""), "base64")
        );
        console.log("-> artifacts/ground-weather.png");
    }
    await browser.close();
    await new Promise((r) => server.close(r));
    process.exit(dataURL ? 0 : 1);
})();
