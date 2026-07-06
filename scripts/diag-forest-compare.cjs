// DER 1:1-WALD-VERGLEICH — OHNE BELAUBUNG (Schöpfer „ohne belaubung und in der ferne die billboards,
// das gleiche lod"). Blätter aus = LEICHT (überlebt den swiftshader-Kumulativ-Tod) UND zeigt die
// STRUKTUR: Stamm+Äste nah, Billboards fern, gleiches LOD. LINKS Studio, RECHTS AnazhRealm (echtes
// WebGPU via page.screenshot). Je Welt ein EIGENER Browser (kein Kumulativ-Tod). AnazhRealm: die
// Foundry-Konvergenz erzwungen (Budget gesund + Rewarm). -> artifacts/forest-compare.png
const puppeteer = require("puppeteer");
const http = require("http");
const fs = require("fs");
const path = require("path");
const PORT = 4517;
const root = path.resolve(__dirname, "..");
const ART = path.join(root, "artifacts");
const W = 460,
    H = 320;
const mime = { ".html": "text/html", ".js": "application/javascript", ".wasm": "application/wasm", ".json": "application/json", ".css": "text/css", ".png": "image/png", ".woff2": "font/woff2" };
const server = http.createServer((req, res) => {
    let p = req.url.split("?")[0];
    if (p === "/") p = "/index.html";
    const fp = path.join(root, p);
    if (!fp.startsWith(root)) { res.statusCode = 403; return res.end(); }
    fs.readFile(fp, (err, data) => { if (err) { res.statusCode = 404; return res.end(); } res.setHeader("Content-Type", mime[path.extname(fp)] || "application/octet-stream"); res.end(data); });
});
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const GPU = ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--enable-webgl", "--ignore-gpu-blocklist", "--no-sandbox", "--disable-setuid-sandbox"];
const launch = () => puppeteer.launch({ headless: true, protocolTimeout: 600000, args: GPU });

async function shootStudio() {
    const browser = await launch();
    const page = await browser.newPage();
    await page.setViewport({ width: W, height: H });
    page.on("pageerror", (e) => console.log("[STUDIO-ERR]", (e.stack || e.message).split("\n")[0]));
    await page.goto(`http://127.0.0.1:${PORT}/worlds/terrain/index.html?patch-probe=1`, { waitUntil: "domcontentloaded", timeout: 30000 });
    await page.evaluate(async () => { const s = performance.now(); while (!window.__phytoView && performance.now() - s < 30000) await new Promise((r) => setTimeout(r, 50)); const b = document.getElementById("waldBtn"); if (b) b.click(); });
    await sleep(9000);
    await page.evaluate(() => {
        const st = document.createElement("style"); st.textContent = "body > *:not(canvas):not(script):not(style){display:none!important}"; document.head.appendChild(st);
        const V = window.__phytoView;
        if (V && V.setForestFoliage) V.setForestFoliage(false); // Belaubung (FoliagePass) AUS → Stamm+Äste bleiben
    });
    await page.evaluate(() => { const V = window.__phytoView; if (!V || !V.camera) return; const cam = V.camera; cam.position.set(0, 6, 14); cam.lookAt(0, 5, -25); cam.updateMatrixWorld(true); V.renderPatch(); V.renderPatch(); });
    await sleep(300);
    const buf = await page.screenshot({ type: "png" });
    await browser.close();
    return buf;
}

async function shootAnazh() {
    const browser = await launch();
    const page = await browser.newPage();
    await page.setViewport({ width: W, height: H });
    page.on("pageerror", (e) => console.log("[ANAZH-ERR]", (e.stack || e.message).split("\n")[0]));
    await page.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: "domcontentloaded", timeout: 30000 });
    const info = await page.evaluate(async () => {
        const sl = (ms) => new Promise((r) => setTimeout(r, ms));
        let stub = false;
        const s0 = performance.now();
        while (performance.now() - s0 < 80000) {
            const r = window.anazhRealm;
            if (r && !stub && r.state && r.state.renderer) { window.__origRender = r.state.renderer.render.bind(r.state.renderer); r.state.renderer.render = function () {}; if (r.state.renderer.renderAsync) r.state.renderer.renderAsync = () => Promise.resolve(); r.state.postProcessingFailed = true; stub = true; }
            if (r && typeof r._gameLoopTick === "function") { try { r._gameLoopTick(performance.now()); } catch (_e) {} if (r.state.voxelChunks && r.state.voxelChunks.size >= 16) break; }
            await sl(4);
        }
        const r = window.anazhRealm;
        try { r.setTimeOfDay(0.5); for (let i = 0; i < 4; i++) r._gameLoopTick(performance.now()); } catch (_e) {} // Mittag (sonst Nacht → schwarz)
        const f = r._ensureAssetFoundry();
        const t0 = performance.now();
        while (f && !f.ready && performance.now() - t0 < 30000) await sl(100);
        // Foundry-Konvergenz erzwingen (Budget gesund + Rewarm), moderat (Blätter aus → leichter Render).
        for (let i = 0; i < 70; i++) { r.state._frameOverBudget = false; try { r._foundryRewarmColdTrees(); r._gameLoopTick(performance.now()); } catch (_e) {} if (i % 20 === 0) await sl(25); }
        const a = r.state.architectures || [];
        let trees = 0, foundry = 0;
        for (const e of a) { const sp = (e._lodSpecies || "") + ""; if (/baum/.test(sp)) { trees++; if (e.instFoundry) foundry++; } }
        // BELAUBUNG AUS: Foundry-Blatt-Meshes (foundryKind foliage/foliageTex) + grass-Layer verstecken;
        // Rinde (bark/stem) + Billboards (impostor) BLEIBEN → Struktur + Fern-Billboards sichtbar.
        let hidLeaf = 0;
        if (r.state.scene) r.state.scene.traverse((o) => {
            if (!o.isMesh && !o.isInstancedMesh && !o.isBatchedMesh) return;
            const m = o.material;
            const fk = m && m.userData ? m.userData.foundryKind || "" : "";
            if (/foliage/i.test(fk)) { o.visible = false; hidLeaf++; }
            // Gras-Layer (FOLIAGE_LAYER=1) aus → leichter.
            if (o.layers && typeof o.layers.disable === "function" && o.layers.isEnabled && o.layers.isEnabled(1)) { /* Halme bleiben klein, aber der Blick ist waagerecht → egal */ }
        });
        // Kamera: auf einen GEBAUTEN Baum zielen (mesh/instanced/instFoundry), aus 13 m Augenhöhe —
        // so ist garantiert ein Baum im Bild + der Chunk gebaut (der Baum-Cluster liegt sonst am
        // Rand der 16-Chunk-Welt = Void = schwarz). Bevorzugt einen Foundry-Baum.
        const th = (x, z) => (typeof r.getTerrainHeightAt === "function" ? r.getTerrainHeightAt(x, z) : 0);
        const pm = r.state.playerMesh;
        const px = pm ? pm.position.x : 0, pz = pm ? pm.position.z : 0;
        let target = null;
        for (const e of a) { const sp = (e._lodSpecies || "") + ""; if (!/baum/.test(sp) || !e.position) continue; if (!(e.instanced || e.mesh || e.instFoundry)) continue; const d = Math.hypot(e.position.x - px, e.position.z - pz); if (!target || (e.instFoundry && !target.f) || d < target.d) target = { x: e.position.x, z: e.position.z, d, f: !!e.instFoundry }; }
        const tgt = target || { x: px + 8, z: pz };
        // Spieler dorthin teleportieren (Chunk bauen), dann Kamera 13 m davor.
        const gy = th(tgt.x, tgt.z);
        if (pm) { pm.position.set(tgt.x, gy + 2, tgt.z); try { r._ensureVoxelChunkAt && r._ensureVoxelChunkAt(Math.floor(tgt.x), Math.floor(tgt.z), { forceSync: true }); } catch (_e) {} }
        for (let i = 0; i < 20; i++) { try { r.state._frameOverBudget = false; r._foundryRewarmColdTrees(); r._gameLoopTick(performance.now()); } catch (_e) {} }
        // Tageszeit auf Mittag + wenige Ticks zum ANWENDEN (wie die Horizont-Linse; die ~90 Konvergenz-
        // Ticks hatten die Uhr zur Nacht driften lassen = schwarz). ZUERST (die Ticks würden die Kamera
        // aus dem Spieler neu setzen → erst danach die Kamera fest aufs Ziel richten).
        try { r.setTimeOfDay(0.5); for (let i = 0; i < 5; i++) r._gameLoopTick(performance.now()); } catch (_e) {}
        const eye = th(tgt.x, tgt.z) + 3;
        const cam = r.state.camera;
        cam.position.set(tgt.x + 13, eye, tgt.z + 13);
        cam.lookAt(tgt.x, eye - 1, tgt.z);
        cam.updateMatrixWorld(true);
        if (pm) pm.visible = false;
        let err = null;
        if (window.__origRender) {
            r.state.renderer.render = window.__origRender; r.state.postProcessingFailed = true;
            try { if (typeof r._loopRender === "function") { r._loopRender(performance.now()); r._loopRender(performance.now()); } else window.__origRender(r.state.scene, cam); } catch (_e) { err = String((_e && _e.message) || _e); }
            r.state.renderer.render = function () {};
        } else err = "no origRender";
        return { trees, foundry, hidLeaf, target: tgt ? { x: +tgt.x.toFixed(1), z: +tgt.z.toFixed(1), foundry: !!tgt.f } : null, err };
    });
    await page.evaluate(() => { const st = document.createElement("style"); st.textContent = "body > *:not(canvas):not(script):not(style){display:none!important}"; document.head.appendChild(st); });
    await sleep(300);
    const buf = await page.screenshot({ type: "png" });
    await browser.close();
    console.log("  anazh forest:", JSON.stringify(info));
    return buf;
}

async function stitch(studio, anazh) {
    const browser = await launch();
    const page = await browser.newPage();
    await page.goto("about:blank");
    const dataURL = await page.evaluate(async (sB, aB, W, H) => {
        const LBL = 24, GAP = 8;
        const cv = document.createElement("canvas"); cv.width = 2 * W + GAP; cv.height = H + LBL;
        const ctx = cv.getContext("2d"); ctx.fillStyle = "#111"; ctx.fillRect(0, 0, cv.width, cv.height);
        const load = (b) => new Promise((res) => { if (!b) return res(null); const im = new Image(); im.onload = () => res(im); im.onerror = () => res(null); im.src = "data:image/png;base64," + b; });
        const si = await load(sB), ai = await load(aB);
        if (si) ctx.drawImage(si, 0, 0, si.width, si.height, 0, LBL, W, H);
        if (ai) ctx.drawImage(ai, 0, 0, ai.width, ai.height, W + GAP, LBL, W, H);
        ctx.fillStyle = "#fff"; ctx.font = "14px sans-serif";
        ctx.fillText("WALD ohne Laub — STUDIO", 6, 17); ctx.fillText("WALD ohne Laub — ANAZHREALM (Foundry)", W + GAP + 6, 17);
        return cv.toDataURL("image/png");
    }, studio ? studio.toString("base64") : null, anazh ? anazh.toString("base64") : null, W, H);
    await browser.close();
    return dataURL;
}

(async () => {
    fs.mkdirSync(ART, { recursive: true });
    await new Promise((r) => server.listen(PORT, r));
    console.log("STUDIO Wald (ohne Laub)...");
    let studio = null; try { studio = await shootStudio(); } catch (e) { console.log("studio fail:", e.message); }
    console.log("ANAZHREALM Wald (ohne Laub, Foundry)...");
    let anazh = null; try { anazh = await shootAnazh(); } catch (e) { console.log("anazh fail:", e.message); }
    const dataURL = await stitch(studio, anazh);
    if (dataURL) { fs.writeFileSync(path.join(ART, "forest-compare.png"), Buffer.from(dataURL.replace(/^data:image\/png;base64,/, ""), "base64")); console.log("-> artifacts/forest-compare.png"); }
    await new Promise((r) => server.close(r));
    process.exit(dataURL ? 0 : 1);
})();
